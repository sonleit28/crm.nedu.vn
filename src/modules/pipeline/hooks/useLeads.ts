import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { Lead } from '@shared/types/domain'
import type { Paginated } from '@shared/types/api'
import { buildQuery } from '@shared/utils/buildQuery'
import type { LeadFilters } from '@modules/pipeline/types'

export function useLeads(filters: LeadFilters = {}) {
  return useQuery({
    queryKey: ['pipeline', 'leads', filters] as const,
    queryFn: () =>
      api.getRaw<Paginated<Lead>>('/leads', {
        query: buildQuery({
          stage: filters.stage,
          assigned_to: filters.assigned_to,
          q: filters.q,
          limit: filters.limit ?? 200,
          page: filters.page ?? 1,
        }),
      }),
  })
}
