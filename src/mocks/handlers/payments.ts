import { http } from 'msw'
import { MOCK_PAYMENTS, MOCK_OVERDUE_CASES } from '@/mocks/data/payments'
import { ok, okRaw, resolveMockUidFromRequest } from '@/mocks/config'
import { MOCK_USERS } from '@/mocks/data/users'
import type { FinanceSummary } from '@shared/types/domain'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

function isAdmin(uid: string | null) {
  if (!uid) return false
  const user = MOCK_USERS.find((u) => u.id === uid)
  return user?.role === 'founder' || user?.role === 'admin'
}

const FINANCE_SUMMARY: FinanceSummary = {
  month: '2026-04',
  total_revenue_vnd: 186_500_000,
  collected_vnd: 140_000_000,
  collected_pct: 75,
  receivable_vnd: 35_000_000,
  receivable_count: 2,
  overdue_vnd: 11_500_000,
  overdue_count: 2,
  delta_pct_total_revenue: 12,
}

export const paymentsHandlers = [
  // GET /api/finance/summary
  http.get(`${BASE}/api/finance/summary`, ({ request }) => {
    const uid = resolveMockUidFromRequest(request)
    if (!isAdmin(uid)) {
      return new Response(JSON.stringify({ statusCode: 403, message: 'Forbidden' }), { status: 403 })
    }
    return ok(FINANCE_SUMMARY)
  }),

  // GET /api/payments
  http.get(`${BASE}/api/payments`, ({ request }) => {
    const uid = resolveMockUidFromRequest(request)
    const url = new URL(request.url)
    const from = url.searchParams.get('from') ?? ''
    const to = url.searchParams.get('to') ?? ''
    const course = url.searchParams.get('course') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const q = url.searchParams.get('q')?.toLowerCase() ?? ''
    const limit = parseInt(url.searchParams.get('limit') ?? '20', 10)
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)

    let results = [...MOCK_PAYMENTS]

    // Consultant: only own contacts' payments
    if (!isAdmin(uid)) {
      const MINE = ['ct_minh', 'ct_ha', 'ct_tuan'] // u_consultant_minhtam contacts
      results = results.filter((p) => MINE.includes(p.contact_id))
    }

    if (q) {
      results = results.filter(
        (p) => p.contact_name.toLowerCase().includes(q) || p.course_name.toLowerCase().includes(q),
      )
    }
    if (course) results = results.filter((p) => p.course_name === course)
    if (status) results = results.filter((p) => p.status === status)
    if (from) results = results.filter((p) => (p.paid_at ?? p.due_date ?? '') >= from)
    if (to) results = results.filter((p) => (p.paid_at ?? p.due_date ?? '') <= to + 'T23:59:59')

    const total = results.length
    const offset = (page - 1) * limit
    const paged = results.slice(offset, offset + limit)

    return okRaw({ data: paged, meta: { page, limit, total } })
  }),

  // GET /api/payments/overdue
  http.get(`${BASE}/api/payments/overdue`, ({ request }) => {
    const uid = resolveMockUidFromRequest(request)
    let results = [...MOCK_OVERDUE_CASES]

    // Consultant: only own overdue cases
    if (!isAdmin(uid)) {
      const MINE_OWNERS = ['Minh Tâm']
      results = results.filter((c) => MINE_OWNERS.includes(c.sale_owner_name))
    }

    // Sort desc by overdue_days
    results.sort((a, b) => b.overdue_days - a.overdue_days)
    return ok(results)
  }),

  // POST /api/payments/:id/contact
  http.post(`${BASE}/api/payments/:id/contact`, async ({ request }) => {
    const body = (await request.json()) as { note?: string }
    return ok({
      id: `action_${Date.now()}`,
      action_type: 'call',
      note: body.note,
      created_at: new Date().toISOString(),
    })
  }),

  // POST /api/payments/:id/note
  http.post(`${BASE}/api/payments/:id/note`, async ({ request }) => {
    const body = (await request.json()) as { note: string }
    return ok({
      id: `action_${Date.now()}`,
      action_type: 'note',
      note: body.note,
      created_at: new Date().toISOString(),
    })
  }),

  // POST /api/payments/:id/pause
  http.post(`${BASE}/api/payments/:id/pause`, async () => {
    await new Promise((r) => setTimeout(r, 600))
    return ok({ ok: true })
  }),
]
