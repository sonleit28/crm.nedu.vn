import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { CloseRateByCourse } from '@shared/types/domain'

export function useCloseRateByCourse(month?: string) {
  const m = month ?? '2026-04'
  return useQuery<CloseRateByCourse[]>({
    queryKey: ['dashboard', 'close-rate', m],
    queryFn: () => api.get<CloseRateByCourse[]>(`/dashboard/close-rate?month=${m}`),
  })
}
