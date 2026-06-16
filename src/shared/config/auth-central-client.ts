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

// In-flight refresh promise — dedupe concurrent 401s.
// Auth-central rotate refresh: request đầu tiên thành công + revoke
// refresh token cũ. Nếu 3-5 API calls cùng 401 (dashboard / analytics load
// parallel) và mỗi cái gọi refresh riêng → request thứ 2+ gửi refresh token
// đã revoked → 401 → tokenStorage.clear → đá ra login dù 1 request đã renew
// thành công. Singleton promise đảm bảo all callers nhận cùng kết quả.
let inflightRefresh: Promise<TokenPair | null> | null = null

async function performRefresh(): Promise<TokenPair | null> {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) return null

  try {
    // Refresh token rotation do auth-central own (bảng refresh_tokens).
    // nedu-backend (API_URL) CHỈ verify JWT (/auth/me) — KHÔNG có /auth/refresh
    // → trỏ vào đó = 404 → user bị đá ra login mỗi lần access hết hạn (~15p).
    const res = await fetch(`${env.AUTH_CENTRAL_URL}/auth/refresh`, {
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

export async function refreshTokens(): Promise<TokenPair | null> {
  if (inflightRefresh) return inflightRefresh
  inflightRefresh = performRefresh().finally(() => {
    inflightRefresh = null
  })
  return inflightRefresh
}

export async function logoutFromCentral(): Promise<void> {
  try {
    // Logout cũng do auth-central xử (revoke refresh family). Gửi kèm refresh_token
    // trong body để revoke ENTIRE family (BH-8), không chỉ access_only.
    const refresh = tokenStorage.getRefresh()
    await fetch(`${env.AUTH_CENTRAL_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStorage.getAccess() ?? ''}`,
      },
      body: JSON.stringify(refresh ? { refresh_token: refresh } : {}),
    })
  } catch {
    // network error → vẫn clear local
  } finally {
    tokenStorage.clear()
  }
}
