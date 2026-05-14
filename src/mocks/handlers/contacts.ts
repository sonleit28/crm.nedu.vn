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

// Shape khớp NLH-NEDU-CRM-MVP1-001 §6.2 ContactRow (locked 2026-05-13).
// LTV gating: per CLAUDE.md RLS — sale không thấy lifetime_value, admin/founder thấy full.
function toSummary(
  c: (typeof MOCK_CONTACTS)[number],
  uid: string | null,
): ContactSummary {
  const admin = isAdmin(uid)
  return {
    id: c.id,
    person_id: c.person_id,
    identity_resolved: c.identity_resolved,
    fallback_key: c.fallback_key,
    full_name: c.full_name,
    email: c.email,
    phone: c.phone,
    current_lead_id: c.current_lead_id,
    current_stage: c.current_stage,
    source: c.source,
    assigned_to_user_id: c.assigned_to_user_id,
    assigned_to_name: c.assigned_to_name,
    current_course: c.current_course,
    payment_status_label: c.payment_status_label,
    payment_status_class: c.payment_status_class,
    lead_count: c.lead_count,
    course_count: c.course_count,
    lifetime_value: admin ? c.lifetime_value : 0,
    first_purchase_at: c.first_purchase_at,
    last_purchase_at: c.last_purchase_at,
    tier: c.tier,
    origin: c.origin,
    last_interaction_at: c.last_interaction_at,
    first_seen_at: c.first_seen_at,
  }
}

function toDetail(
  c: (typeof MOCK_CONTACTS)[number],
  uid: string | null,
): ContactDetail {
  const admin = isAdmin(uid)
  const isSelf = c.sale_owner_id === uid

  return {
    ...toSummary(c, uid),
    lead_date: c.lead_date,
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
    // Accept both `size` (CRM convention per MVP-1 §6.1) and legacy `limit`.
    const size = parseInt(
      url.searchParams.get('size') ?? url.searchParams.get('limit') ?? '50',
      10,
    )
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
          c.full_name.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(q),
      )
    }
    if (source) results = results.filter((c) => c.source === source)
    if (course) results = results.filter((c) => c.current_course === course)
    if (tier) results = results.filter((c) => c.tier === tier)

    const total = results.length
    const offset = (page - 1) * size
    const paged = results.slice(offset, offset + size)

    // Envelope per NLH-NEDU-CRM-MVP1-001 §6.2 (locked v0.5).
    return okRaw({
      data: paged.map((c) => toSummary(c, uid)),
      pagination: { page, size, total },
      meta: { unresolved_count: 0 },
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
