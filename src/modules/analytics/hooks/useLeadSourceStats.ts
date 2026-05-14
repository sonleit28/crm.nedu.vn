import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { LeadSourceStat } from '@shared/types/domain'

export function useLeadSourceStats(from?: string, to?: string) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  return useQuery<LeadSourceStat[]>({
    queryKey: ['analytics', 'source', from, to],
    queryFn: () => api.get<LeadSourceStat[]>(`/crm/analytics/source?${params}`),
  })
}
