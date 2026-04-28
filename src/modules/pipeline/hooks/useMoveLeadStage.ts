import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { LeadStage, PipelineAction } from '@shared/types/domain'

interface MoveVars {
  leadId: string
  to_stage: LeadStage
  note?: string
}

export function useMoveLeadStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leadId, to_stage, note }: MoveVars) =>
      api.post<PipelineAction>(`/leads/${leadId}/move`, { to_stage, note }),
    onSuccess: (_action, vars) => {
      void qc.invalidateQueries({ queryKey: ['pipeline', 'leads'] })
      void qc.invalidateQueries({ queryKey: ['pipeline', 'leads', vars.leadId] })
      void qc.invalidateQueries({
        queryKey: ['pipeline', 'leads', vars.leadId, 'actions'],
      })
    },
  })
}
