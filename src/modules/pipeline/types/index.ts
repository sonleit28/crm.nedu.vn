import type { LeadStage } from '@shared/types/domain'

export interface LeadFilters {
  stage?: LeadStage
  assigned_to?: string
  q?: string
  limit?: number
  page?: number
}
