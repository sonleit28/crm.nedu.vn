import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { FinanceSummary } from '@shared/types/domain'

export function useFinanceSummary(month?: string) {
  const m = month ?? new Date().toISOString().slice(0, 7)
  return useQuery<FinanceSummary>({
    queryKey: ['finance', 'summary', m],
    queryFn: () => api.get<FinanceSummary>(`/crm/finance/summary?month=${m}`),
  })
}
