import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { ContactSummary } from '@shared/types/domain'
import type { Paginated } from '@shared/types/api'

export interface ContactFilters {
  q?: string
  source?: string
  course?: string
  tier?: string
  limit?: number
  page?: number
}

export function useContacts(filters: ContactFilters = {}) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.source) params.set('source', filters.source)
  if (filters.course) params.set('course', filters.course)
  if (filters.tier) params.set('tier', filters.tier)
  params.set('limit', String(filters.limit ?? 20))
  params.set('page', String(filters.page ?? 1))

  return useQuery<Paginated<ContactSummary>>({
    queryKey: ['contacts', 'list', filters],
    queryFn: () => api.getRaw<Paginated<ContactSummary>>(`/contacts?${params}`),
  })
}
