import { useQuery } from '@tanstack/react-query'
import { api } from '@shared/config/api-client'
import type { Lead, LeadSource, LeadStage } from '@shared/types/domain'
import type { Paginated } from '@shared/types/api'
import { buildQuery } from '@shared/utils/buildQuery'
import type { LeadFilters } from '@modules/pipeline/types'

// BE shape (ops module). Khác FE Lead: full_name vs name, stage vs current_stage,
// test_score vs lead_score, interested_courses[] vs interested_course, source khác enum.
// Transform ở đây để page render đúng mà không phải sửa toàn bộ component.
interface BeLeadResponse {
  id: string
  full_name: string
  phone: string
  email: string | null
  stage: LeadStage
  source: string
  source_channel: string | null
  assigned_to_user_id: string | null
  assigned_to_full_name: string | null
  test_score: number | null
  interested_courses: string[]
  created_at: string
  updated_at: string
}

// BE source enum (inbound|marketing|referral|alumni) vs FE
// (facebook_ads|google|referral|webinar|organic|tiktok). Map best-effort,
// fallback 'organic' để không crash SOURCE_LABEL lookup.
function mapSource(s: string): LeadSource {
  switch (s) {
    case 'marketing':
      return 'facebook_ads'
    case 'referral':
      return 'referral'
    case 'alumni':
      return 'referral'
    case 'inbound':
    default:
      return 'organic'
  }
}

function toLead(be: BeLeadResponse): Lead {
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
}

export function useLeads(filters: LeadFilters = {}) {
  return useQuery({
    queryKey: ['pipeline', 'leads', filters] as const,
    queryFn: async () => {
      // BE ListLeadsQueryDto cap limit = 100. Pipeline view = full board nên
      // dùng 100 (đủ cho MVP scale). Cần >100 → bump BE max trước.
      const raw = await api.getRaw<Paginated<BeLeadResponse>>('/ops/leads', {
        query: buildQuery({
          stage: filters.stage,
          consultant_id: filters.assigned_to,
          limit: Math.min(filters.limit ?? 100, 100),
          page: filters.page ?? 1,
        }),
      })
      return {
        data: raw.data.map(toLead),
        meta: raw.meta,
      }
    },
  })
}
