import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'

export interface FilterOption {
  value: string
  label: string
}

export interface FinanceFilterOptions {
  courses: FilterOption[]
  statuses: FilterOption[]
}

// Fetch options cho 2 dropdown filter Finance (Khóa + Trạng thái) trong 1
// round-trip. Cache lâu vì catalog ít đổi.
export function useFinanceFilterOptions() {
  return useQuery<FinanceFilterOptions>({
    queryKey: ['finance', 'filter-options'],
    queryFn: () => api.get<FinanceFilterOptions>('/crm/finance/filter-options'),
    staleTime: 5 * 60_000,
  })
}
