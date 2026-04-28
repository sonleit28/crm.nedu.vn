import { http, HttpResponse } from 'msw'
import { env } from '@shared/config/env'
import { findMockUserById, DEFAULT_MOCK_ID } from '@/mocks/data/users'
import { ok, unauthorized, resolveMockUidFromRequest } from '@/mocks/config'

const API = `${env.API_URL}/api`

export const authHandlers = [
  // GET /auth/me — load user theo mock_uid trong access token
  http.get(`${API}/auth/me`, ({ request }) => {
    const uid = resolveMockUidFromRequest(request) ?? DEFAULT_MOCK_ID
    const user = findMockUserById(uid)
    if (!user) return unauthorized('Mock user not found')
    return ok(user)
  }),

  // POST /auth/refresh — issue mới cặp tokens (mock pass-through)
  http.post(`${API}/auth/refresh`, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { refresh_token?: string }
    if (!body.refresh_token) return unauthorized('Missing refresh_token')
    const m = /^mock_refresh_(.+)$/.exec(body.refresh_token)
    const uid = m ? m[1] : DEFAULT_MOCK_ID
    return ok({
      access_token: `mock_access_${uid}`,
      refresh_token: `mock_refresh_${uid}`,
    })
  }),

  // POST /auth/logout — return 204
  http.post(`${API}/auth/logout`, () => new HttpResponse(null, { status: 204 })),
]
