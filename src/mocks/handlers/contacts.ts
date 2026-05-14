import { http } from 'msw'
import { MOCK_CONTACTS } from '@/mocks/data/contacts'
import { ok, okRaw, notFound, resolveMockUidFromRequest } from '@/mocks/config'
import { MOCK_USERS } from '@/mocks/data/users'
import type { ContactSummary, ContactDetail } from '@shared/types/domain'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

function isAdmin(uid: string | null) {
  if (!uid) return false
  const user = MOCK_USERS.find((u) => u.id === uid)
  return user?.role === 'founder' || user?.role === 'admin'
}

function toSummary(c: (typeof MOCK_CONTACTS)[number]): ContactSummary {
  return {
    id: c.id,
    full_name: c.full_name,
    email: c.email,
    phone: c.phone,
    source: c.source,
    current_course: c.current_course,
    payment_status_label: c.payment_status_label,
    payment_status_class: c.payment_status_class,
    tier: c.tier,
  }
}

function toDetail(
  c: (typeof MOCK_CONTACTS)[number],
  uid: string | null,
): ContactDetail {
  const admin = isAdmin(uid)
  const isSelf = c.sale_owner_id === uid

  return {
    id: c.id,
    full_name: c.full_name,
    email: c.email,
    phone: c.phone,
    source: c.source,
    current_course: c.current_course,
    payment_status_label: c.payment_status_label,
    payment_status_class: c.payment_status_class,
    tier: c.tier,
    lead_date: c.lead_date,
    sale_owner_name: c.sale_owner_name,
    // LTV and course history: admin/founder only
    lifetime_value: admin ? c.lifetime_value : 0,
    current_course_fee: admin ? c.current_course_fee : undefined,
    course_history: admin ? c.course_history : [],
    // Internal note: admin/founder OR sale_owner = self
    internal_note: admin || isSelf ? c.internal_note : undefined,
    internal_note_author: admin || isSelf ? c.internal_note_author : undefined,
  }
}

export const contactsHandlers = [
  // GET /api/crm/contacts — per NLH-NEDU-CRM-MVP1-001 §6
  http.get(`${BASE}/api/crm/contacts`, ({ request }) => {
    const uid = resolveMockUidFromRequest(request)
    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.toLowerCase() ?? ''
    const source = url.searchParams.get('source') ?? ''
    const course = url.searchParams.get('course') ?? ''
    const tier = url.searchParams.get('tier') ?? ''
    const limit = parseInt(url.searchParams.get('limit') ?? '20', 10)
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)

    let results = [...MOCK_CONTACTS]

    // Consultant RLS: only own contacts
    if (!isAdmin(uid)) {
      results = results.filter((c) => c.sale_owner_id === uid)
    }

    // Filters
    if (q) {
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(q),
      )
    }
    if (source) results = results.filter((c) => c.source === source)
    if (course) results = results.filter((c) => c.current_course === course)
    if (tier) results = results.filter((c) => c.tier === tier)

    const total = results.length
    const offset = (page - 1) * limit
    const paged = results.slice(offset, offset + limit)

    return okRaw({
      data: paged.map(toSummary),
      meta: { page, limit, total },
    })
  }),

  // GET /api/crm/contacts/:id — per NLH-NEDU-CRM-MVP1-001 §6
  http.get(`${BASE}/api/crm/contacts/:id`, ({ request, params }) => {
    const uid = resolveMockUidFromRequest(request)
    const contact = MOCK_CONTACTS.find((c) => c.id === params.id)
    if (!contact) return notFound('Contact không tồn tại.')

    // Consultant RLS: can only view own contacts
    if (!isAdmin(uid) && contact.sale_owner_id !== uid) {
      return notFound('Contact không tồn tại.')
    }

    return ok(toDetail(contact, uid))
  }),
]
