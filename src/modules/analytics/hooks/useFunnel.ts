import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { FunnelRow } from '@shared/types/domain'

export function useFunnel(from?: string, to?: string) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  return useQuery<FunnelRow[]>({
    queryKey: ['analytics', 'funnel', from, to],
    queryFn: () => api.get<FunnelRow[]>(`/crm/analytics/funnel?${params}`),
  })
}
