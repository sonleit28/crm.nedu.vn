import { http } from 'msw'
import { MOCK_PAYMENTS } from '@/mocks/data/payments'
import { MOCK_CONTACTS } from '@/mocks/data/contacts'
import { ok, okRaw, resolveMockUidFromRequest } from '@/mocks/config'
import { MOCK_USERS } from '@/mocks/data/users'
import type { FinanceSummary, Payment } from '@shared/types/domain'

// Enrich payment với thông tin liên hệ của contact (email/phone/telegram)
// để bảng giao dịch Tài chính hiển thị cùng các cột như danh sách khách hàng.
function withContactInfo(p: Payment): Payment {
  const c = MOCK_CONTACTS.find((x) => x.id === p.contact_id)
  return {
    ...p,
    contact_email: c?.email ?? null,
    contact_phone: c?.phone ?? null,
    contact_telegram: c?.telegram ?? null,
  }
}

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

function isAdmin(uid: string | null) {
  if (!uid) return false
  const user = MOCK_USERS.find((u) => u.id === uid)
  return !!user?.roles?.some(
    (r) => r === 'founder' || r === 'admin' || r === 'owner',
  )
}

// FinanceSummary đơn giản hoá sau khi Nedu drop installment scheme
// (xem NLH-NEDU-CRM-MVP1-001 changelog 2026-05-13).
// Không còn `collected_vnd` / `receivable_vnd` / `overdue_vnd` — payments
// là full-amount, không tracking AR.
const FINANCE_SUMMARY: FinanceSummary = {
  month: '2026-06',
  total_revenue_vnd: 186_500_000,
  delta_pct_total_revenue: 12,
}

// Dropdown options cho filter Finance — derive từ MOCK_PAYMENTS.
function buildFilterOptions() {
  const courses = [...new Set(MOCK_PAYMENTS.map((p) => p.course_name))].map((name) => ({
    value: name,
    label: name,
  }))
  const STATUS_LABELS: Record<string, string> = {
    completed: 'Hoàn tất',
    pending: 'Chờ xử lý',
    refunded: 'Hoàn tiền',
  }
  const statuses = [...new Set(MOCK_PAYMENTS.map((p) => p.status))].map((s) => ({
    value: s,
    label: STATUS_LABELS[s] ?? s,
  }))
  return { courses, statuses }
}

export const paymentsHandlers = [
  // GET /api/crm/finance/summary
  http.get(`${BASE}/api/crm/finance/summary`, ({ request }) => {
    const uid = resolveMockUidFromRequest(request)
    if (!isAdmin(uid)) {
      return new Response(JSON.stringify({ statusCode: 403, message: 'Forbidden' }), { status: 403 })
    }
    return ok(FINANCE_SUMMARY)
  }),

  // GET /api/crm/finance/filter-options
  http.get(`${BASE}/api/crm/finance/filter-options`, () => ok(buildFilterOptions())),

  // GET /api/crm/payments
  http.get(`${BASE}/api/crm/payments`, ({ request }) => {
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
      const MINE = ['ct_minh', 'ct_ha', 'ct_tuan']
      results = results.filter((p) => MINE.includes(p.contact_id))
    }

    if (q) {
      results = results.filter(
        (p) => p.contact_name.toLowerCase().includes(q) || p.course_name.toLowerCase().includes(q),
      )
    }
    if (course) results = results.filter((p) => p.course_name === course)
    if (status) results = results.filter((p) => p.status === status)
    if (from) results = results.filter((p) => (p.paid_at ?? '') >= from)
    if (to) results = results.filter((p) => (p.paid_at ?? '') <= to + 'T23:59:59')

    const total = results.length
    const offset = (page - 1) * limit
    const paged = results.slice(offset, offset + limit).map(withContactInfo)

    return okRaw({ data: paged, meta: { page, limit, total } })
  }),
]
