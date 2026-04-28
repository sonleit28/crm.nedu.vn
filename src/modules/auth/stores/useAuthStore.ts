import { create } from 'zustand'
import type { AuthUser, TokenPair } from '@shared/types/auth'
import { tokenStorage } from '@shared/config/token-storage'
import { api } from '@shared/config/api-client'
import { env } from '@shared/config/env'

type Status = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'

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
  if (tokenStorage.getAccess()) return
  const mockUid = localStorage.getItem('mock_uid') ?? 'u_admin'
  tokenStorage.set(`${MOCK_ACCESS_PREFIX}${mockUid}`, `mock_refresh_${mockUid}`)
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
      return
    }
    try {
      const user = await api.get<AuthUser>('/auth/me')
      set({ user, status: 'authenticated' })
    } catch (e) {
      tokenStorage.clear()
      const msg = e instanceof Error ? e.message : 'Auth failed'
      set({ status: 'unauthenticated', user: null, error: msg })
    }
  },

  acceptTokens: async (pair) => {
    tokenStorage.set(pair.access_token, pair.refresh_token)
    set({ status: 'loading', error: null })
    try {
      const user = await api.get<AuthUser>('/auth/me')
      set({ user, status: 'authenticated' })
    } catch (e) {
      tokenStorage.clear()
      const msg = e instanceof Error ? e.message : 'Auth failed'
      set({ status: 'error', user: null, error: msg })
      throw e
    }
  },

  clear: () => {
    tokenStorage.clear()
    set({ user: null, status: 'unauthenticated', error: null })
  },
}))
