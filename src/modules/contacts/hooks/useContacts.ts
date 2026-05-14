import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { ContactSummary } from '@shared/types/domain'
import type { CrmPaginatedResponse } from '@shared/types/api'

export interface ContactFilters {
  q?: string
  source?: string
  course?: string
  tier?: string
  size?: number
  page?: number
}

export interface ContactsListMeta {
  unresolved_count: number
}

export type ContactsListResponse = CrmPaginatedResponse<
  ContactSummary,
  ContactsListMeta
>

// Envelope shape khớp BE NLH-NEDU-CRM-MVP1-001 §6.2 (locked v0.5 2026-05-13):
//   { data, pagination: { page, size, total }, meta: { unresolved_count } }
export function useContacts(filters: ContactFilters = {}) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.source) params.set('source', filters.source)
  if (filters.course) params.set('course', filters.course)
  if (filters.tier) params.set('tier', filters.tier)
  params.set('size', String(filters.size ?? 50))
  params.set('page', String(filters.page ?? 1))

  return useQuery<ContactsListResponse>({
    queryKey: ['contacts', 'list', filters],
    queryFn: () => api.getRaw<ContactsListResponse>(`/crm/contacts?${params}`),
  })
}
