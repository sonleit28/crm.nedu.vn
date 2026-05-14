import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { Lead, LeadSource, LeadStage } from '@shared/types/domain'

interface BeLeadResponse {
  id: string
  full_name: string
  phone: string
  email: string | null
  stage: LeadStage
  source: string
  assigned_to_user_id: string | null
  assigned_to_full_name: string | null
  test_score: number | null
  interested_courses: string[]
  created_at: string
}

function mapSource(s: string): LeadSource {
  switch (s) {
    case 'marketing':
      return 'facebook_ads'
    case 'referral':
    case 'alumni':
      return 'referral'
    case 'inbound':
    default:
      return 'organic'
  }
}

export function useLead(leadId: string | null | undefined) {
  return useQuery({
    queryKey: ['pipeline', 'leads', leadId] as const,
    queryFn: async (): Promise<Lead> => {
      const be = await api.get<BeLeadResponse>(`/ops/leads/${leadId}`)
      return {
        id: be.id,
        name: be.full_name,
        email: be.email ?? undefined,
        phone: be.phone,
        source: mapSource(be.source),
        interested_course: be.interested_courses[0],
        lead_score: be.test_score ?? 0,
        current_stage: be.stage,
        assigned_to: be.assigned_to_user_id ?? undefined,
        assigned_to_name: be.assigned_to_full_name ?? undefined,
        created_at: be.created_at,
      }
    },
    enabled: !!leadId,
  })
}
