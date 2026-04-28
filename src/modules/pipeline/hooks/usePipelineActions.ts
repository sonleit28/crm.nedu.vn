import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { PipelineAction } from '@shared/types/domain'

export function usePipelineActions(leadId: string | null | undefined) {
  return useQuery({
    queryKey: ['pipeline', 'leads', leadId, 'actions'] as const,
    queryFn: () => api.get<PipelineAction[]>(`/leads/${leadId}/actions`),
    enabled: !!leadId,
  })
}
