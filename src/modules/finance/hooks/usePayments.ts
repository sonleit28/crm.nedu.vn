import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { Payment } from '@shared/types/domain'
import type { Paginated } from '@shared/types/api'

export interface PaymentFilters {
  from?: string
  to?: string
  course?: string
  status?: string
  q?: string
  limit?: number
  page?: number
}

export function usePayments(filters: PaymentFilters = {}) {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.course) params.set('course', filters.course)
  if (filters.status) params.set('status', filters.status)
  if (filters.q) params.set('q', filters.q)
  params.set('limit', String(filters.limit ?? 20))
  params.set('page', String(filters.page ?? 1))

  return useQuery<Paginated<Payment>>({
    queryKey: ['payments', 'list', filters],
    queryFn: () => api.getRaw<Paginated<Payment>>(`/payments?${params}`),
  })
}
