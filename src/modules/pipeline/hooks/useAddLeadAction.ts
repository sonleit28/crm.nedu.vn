import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { PipelineAction, PipelineActionType } from '@shared/types/domain'

interface AddVars {
  leadId: string
  action_type: PipelineActionType
  note?: string
  metadata?: Record<string, unknown>
}

export function useAddLeadAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leadId, action_type, note, metadata }: AddVars) =>
      api.post<PipelineAction>(`/leads/${leadId}/actions`, {
        action_type,
        note,
        metadata,
      }),
    onSuccess: (_action, vars) => {
      void qc.invalidateQueries({ queryKey: ['pipeline', 'leads'] })
      void qc.invalidateQueries({
        queryKey: ['pipeline', 'leads', vars.leadId, 'actions'],
      })
    },
  })
}
