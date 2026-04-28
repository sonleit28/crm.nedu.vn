import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { OverdueCase } from '@shared/types/domain'

export function useOverdueList() {
  return useQuery<OverdueCase[]>({
    queryKey: ['overdue', 'list'],
    queryFn: () => api.get<OverdueCase[]>('/payments/overdue'),
    refetchInterval: 60_000,
  })
}
