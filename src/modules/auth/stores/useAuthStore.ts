import { create } from 'zustand'
import type { AuthUser, TokenPair } from '@shared/types/auth'
import { tokenStorage } from '@shared/config/token-storage'
import { api } from '@shared/config/api-client'
import { env } from '@shared/config/env'
import { analytics } from '@shared/analytics'

type Status = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'

function syncAnalytics(user: AuthUser | null) {
  if (user) {
    analytics.identify(user.id, { role: user.roles[0] })
  } else {
    analytics.reset()
  }
}

interface AuthState {
  user: AuthUser | null
  status: Status
  error: string | null
  /** load /auth/me with stored access token (or seed mock token in dev) */
  hydrate: () => Promise<void>
  /** consume tokens from auth-callback fragment, persist, then load /me */
  acceptTokens: (pair: TokenPair) => Promise<void>
  /** clear local auth state (after logout) */
  clear: () => void
}

const MOCK_ACCESS_PREFIX = 'mock_access_'

function ensureMockTokenIfNeeded(): void {
  if (!env.ENABLE_MOCKING) return
  const mockUid = localStorage.getItem('mock_uid') ?? 'u_admin'
  const expected = `${MOCK_ACCESS_PREFIX}${mockUid}`
  // Re-seed if no token OR token lệch mock_uid hiện tại (dev switched persona).
  // Prevents RLS bypass khi dev change localStorage.mock_uid without clearing token.
  if (tokenStorage.getAccess() !== expected) {
    tokenStorage.set(expected, `mock_refresh_${mockUid}`)
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  error: null,

  hydrate: async () => {
    set({ status: 'loading', error: null })
    ensureMockTokenIfNeeded()
    if (!tokenStorage.getAccess()) {
      set({ status: 'unauthenticated', user: null })
      syncAnalytics(null)
      return
    }

    // Defensive fetch: 1 retry sau 800ms + 8s overall timeout.
    // Lý do: trên CF (production), MSW Service Worker đôi khi chưa claim
    // page client kịp ngay sau worker.start() returns → fetch đầu hang.
    // Retry sau 800ms thường catch trường hợp SW vừa active.
    // 8s timeout là safety net cho complete hang (mạng + SW + BE).
    const fetchAuth = async (): Promise<AuthUser> => {
      try {
        return await api.get<AuthUser>('/auth/me')
      } catch {
        await new Promise((r) => setTimeout(r, 800))
        return await api.get<AuthUser>('/auth/me')
      }
    }

    try {
      const user = await Promise.race([
        fetchAuth(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Auth /me timeout 8s')), 8000),
        ),
      ])
      set({ user, status: 'authenticated' })
      syncAnalytics(user)
    } catch (e) {
      tokenStorage.clear()
      const msg = e instanceof Error ? e.message : 'Auth failed'
      set({ status: 'unauthenticated', user: null, error: msg })
      syncAnalytics(null)
    }
  },

  acceptTokens: async (pair) => {
    tokenStorage.set(pair.access_token, pair.refresh_token)
    set({ status: 'loading', error: null })
    try {
      const user = await api.get<AuthUser>('/auth/me')
      set({ user, status: 'authenticated' })
      syncAnalytics(user)
    } catch (e) {
      tokenStorage.clear()
      const msg = e instanceof Error ? e.message : 'Auth failed'
      set({ status: 'error', user: null, error: msg })
      syncAnalytics(null)
      throw e
    }
  },

  clear: () => {
    tokenStorage.clear()
    set({ user: null, status: 'unauthenticated', error: null })
    syncAnalytics(null)
  },
}))
