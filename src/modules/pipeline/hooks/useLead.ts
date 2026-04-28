import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { Lead } from '@shared/types/domain'

export function useLead(leadId: string | null | undefined) {
  return useQuery({
    queryKey: ['pipeline', 'leads', leadId] as const,
    queryFn: () => api.get<Lead>(`/leads/${leadId}`),
    enabled: !!leadId,
  })
}
