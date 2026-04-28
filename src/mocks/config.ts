import type { JsonBodyType } from 'msw'
import { HttpResponse } from 'msw'

export const ok = <T extends JsonBodyType>(data: T) =>
  HttpResponse.json({ data }, { status: 200 })

export const okRaw = <T extends JsonBodyType>(body: T) =>
  HttpResponse.json(body, { status: 200 })

export const created = <T extends JsonBodyType>(data: T) =>
  HttpResponse.json({ data }, { status: 201 })

export const noContent = () => new HttpResponse(null, { status: 204 })

export const unauthorized = (message = 'Unauthorized') =>
  HttpResponse.json({ statusCode: 401, message, error: 'Unauthorized' }, { status: 401 })

export const forbidden = (message = 'Forbidden') =>
  HttpResponse.json({ statusCode: 403, message, error: 'Forbidden' }, { status: 403 })

export const notFound = (message = 'Not Found') =>
  HttpResponse.json({ statusCode: 404, message, error: 'Not Found' }, { status: 404 })

export const badRequest = (message = 'Bad Request', details?: unknown) =>
  HttpResponse.json(
    { statusCode: 400, message, error: 'Bad Request', details },
    { status: 400 },
  )

export const serverError = (message = 'Internal Server Error') =>
  HttpResponse.json(
    { statusCode: 500, message, error: 'Internal Server Error' },
    { status: 500 },
  )

/**
 * Resolve current mock user from `Authorization: Bearer mock_access_<uid>`.
 * Falls back to localStorage `mock_uid` for SSE / EventSource (no Bearer).
 */
export function resolveMockUidFromRequest(request: Request): string | null {
  const auth = request.headers.get('Authorization') ?? ''
  const match = /^Bearer\s+mock_access_(.+)$/.exec(auth)
  if (match) return match[1]
  // SSE: token via query string
  const url = new URL(request.url)
  const tokenParam = url.searchParams.get('token')
  if (tokenParam) {
    const m2 = /^mock_access_(.+)$/.exec(tokenParam)
    if (m2) return m2[1]
  }
  // Fallback: localStorage (same-origin)
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('mock_uid')
  }
  return null
}
