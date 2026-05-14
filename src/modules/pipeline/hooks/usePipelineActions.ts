import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type {
  LeadStage,
  PipelineAction,
  PipelineActionType,
} from '@shared/types/domain'
import type { Paginated } from '@shared/types/api'

// BE shape — ops module trả paginated `{ data, meta }` với field names khác FE.
interface BeAction {
  id: string
  lead_id: string
  action_type: string
  performed_by_user_id: string
  performed_by_full_name: string | null
  stage_from: LeadStage | null
  stage_to: LeadStage | null
  regression_reason: string | null
  note_content: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

function toAction(be: BeAction): PipelineAction {
  return {
    id: be.id,
    lead_id: be.lead_id,
    from_stage: be.stage_from,
    to_stage: be.stage_to,
    action_type: be.action_type as PipelineActionType,
    note: be.note_content ?? be.regression_reason ?? undefined,
    performed_by: be.performed_by_user_id,
    performed_by_name: be.performed_by_full_name ?? undefined,
    metadata: be.metadata ?? undefined,
    created_at: be.created_at,
  }
}

export function usePipelineActions(leadId: string | null | undefined) {
  return useQuery({
    queryKey: ['pipeline', 'leads', leadId, 'actions'] as const,
    queryFn: async (): Promise<PipelineAction[]> => {
      const raw = await api.getRaw<Paginated<BeAction>>(
        `/ops/leads/${leadId}/actions`,
      )
      return raw.data.map(toAction)
    },
    enabled: !!leadId,
  })
}
