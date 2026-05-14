import { env } from './env'
import { tokenStorage } from './token-storage'
import type { TokenPair } from '@shared/types/auth'

export function redirectToGoogleLogin(returnTo: string = '/auth-callback'): void {
  // auth-central isAllowedReturnUrl parse `new URL(returnTo)` → throw nếu
  // relative path → "return_to origin is not allowed". Phải gửi absolute URL.
  // Per auth-central src/routes/auth.ts:37-48.
  const absoluteReturnTo = returnTo.startsWith('http')
    ? returnTo
    : `${window.location.origin}${returnTo.startsWith('/') ? returnTo : `/${returnTo}`}`
  const url = `${env.AUTH_CENTRAL_URL}/auth/oauth/google?return_to=${encodeURIComponent(absoluteReturnTo)}`
  window.location.href = url
}

export async function refreshTokens(): Promise<TokenPair | null> {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) return null

  try {
    const res = await fetch(`${env.API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    })
    if (!res.ok) return null
    const json = await res.json()
    const tokens = (json.data ?? json) as TokenPair
    tokenStorage.set(tokens.access_token, tokens.refresh_token)
    return tokens
  } catch {
    return null
  }
}

export async function logoutFromCentral(): Promise<void> {
  try {
    await fetch(`${env.API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStorage.getAccess() ?? ''}`,
      },
    })
  } catch {
    // network error → vẫn clear local
  } finally {
    tokenStorage.clear()
  }
}
