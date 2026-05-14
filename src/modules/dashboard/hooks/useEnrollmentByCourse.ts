import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { EnrollmentByCourse } from '@shared/types/domain'

export function useEnrollmentByCourse(month?: string) {
  const m = month ?? '2026-04'
  return useQuery<EnrollmentByCourse[]>({
    queryKey: ['dashboard', 'enrollment', m],
    queryFn: () => api.get<EnrollmentByCourse[]>(`/crm/dashboard/enrollment?month=${m}`),
  })
}
