import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { DashboardSummary } from '@shared/types/domain'

export function useDashboardSummary(month?: string) {
  const m = month ?? '2026-04'
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary', m],
    queryFn: () => api.get<DashboardSummary>(`/dashboard/summary?month=${m}`),
  })
}
