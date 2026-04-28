import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { ConsultantKpi } from '@shared/types/domain'

export function useConsultantKpi(from?: string, to?: string) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  return useQuery<ConsultantKpi[]>({
    queryKey: ['analytics', 'consultant-kpi', from, to],
    queryFn: () => api.get<ConsultantKpi[]>(`/analytics/consultant-kpi?${params}`),
  })
}
