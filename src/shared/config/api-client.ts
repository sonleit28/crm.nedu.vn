import { env } from './env'
import { tokenStorage } from './token-storage'
import { refreshTokens } from './auth-central-client'
import { ApiError } from '@shared/types/api'

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  query?: Record<string, string | number | boolean | undefined | null>
  /** internal: prevent infinite refresh loop */
  _retry?: boolean
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = path.startsWith('http') ? path : `${env.API_URL}/api${path.startsWith('/') ? path : `/${path}`}`
  if (!query) return base
  const params = new URLSearchParams()
  for (const [key, val] of Object.entries(query)) {
    if (val === undefined || val === null || val === '') continue
    params.set(key, String(val))
  }
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, query, headers, _retry, ...rest } = opts
  const url = buildUrl(path, query)

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...((headers as Record<string, string>) ?? {}),
  }
  const token = tokenStorage.getAccess()
  if (token) finalHeaders.Authorization = `Bearer ${token}`

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  })

  // 401 → try refresh once, retry once
  if (res.status === 401 && !_retry) {
    const refreshed = await refreshTokens()
    if (refreshed) {
      return request<T>(method, path, { ...opts, _retry: true })
    }
    tokenStorage.clear()
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login'
    }
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    let code: string | undefined
    let details: unknown
    try {
      const errBody = await res.json()
      message = errBody.message ?? message
      code = errBody.error
      details = errBody.details
    } catch {
      // body wasn't JSON
    }
    throw new ApiError(res.status, message, code, details)
  }

  if (res.status === 204) return undefined as T

  const json = await res.json()
  // NestJS envelope: { data: T } for single/aggregate. Unwrap.
  if (json && typeof json === 'object' && 'data' in json && !('meta' in json)) {
    return json.data as T
  }
  return json as T
}

async function requestRaw<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  // Returns the full response body without unwrapping `data` — for paginated lists.
  const { body, query, headers, _retry, ...rest } = opts
  const url = buildUrl(path, query)

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...((headers as Record<string, string>) ?? {}),
  }
  const token = tokenStorage.getAccess()
  if (token) finalHeaders.Authorization = `Bearer ${token}`

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  })

  if (res.status === 401 && !_retry) {
    const refreshed = await refreshTokens()
    if (refreshed) {
      return requestRaw<T>(method, path, { ...opts, _retry: true })
    }
    tokenStorage.clear()
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login'
    }
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    let code: string | undefined
    try {
      const errBody = await res.json()
      message = errBody.message ?? message
      code = errBody.error
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message, code)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PATCH', path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PUT', path, { ...opts, body }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, opts),
  /** raw: returns full envelope (use for paginated list `Paginated<T>`) */
  getRaw: <T>(path: string, opts?: RequestOptions) => requestRaw<T>('GET', path, opts),
} as const
