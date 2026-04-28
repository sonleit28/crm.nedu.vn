import { http } from 'msw'
import { ok } from '@/mocks/config'
import type { FunnelRow, LeadSourceStat, ConsultantKpi } from '@shared/types/domain'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const FUNNEL: FunnelRow[] = [
  { stage: 'lead_new',   label: 'Lead mới',      count: 30, conversion_pct: 100 },
  { stage: 'contacted',  label: 'Đã liên hệ',    count: 22, conversion_pct: 73.3 },
  { stage: 'consulting', label: 'Đang tư vấn',   count: 16, conversion_pct: 72.7 },
  { stage: 'followup',   label: 'Follow-up',      count: 10, conversion_pct: 62.5 },
  { stage: 'closed',     label: 'Chốt đơn',       count: 5,  conversion_pct: 50 },
]

const LEAD_SOURCE: LeadSourceStat[] = [
  { source: 'facebook_ads', source_label: 'Facebook Ads', leads: 12, closed: 3, rate_pct: 25, revenue_vnd: 72_000_000 },
  { source: 'referral',     source_label: 'Referral',     leads: 7,  closed: 2, rate_pct: 28.6, revenue_vnd: 55_000_000 },
  { source: 'google',       source_label: 'Google',       leads: 5,  closed: 0, rate_pct: 0,    revenue_vnd: 0 },
  { source: 'webinar',      source_label: 'Webinar',      leads: 3,  closed: 0, rate_pct: 0,    revenue_vnd: 0 },
  { source: 'tiktok',       source_label: 'TikTok',       leads: 2,  closed: 0, rate_pct: 0,    revenue_vnd: 0 },
  { source: 'organic',      source_label: 'Organic',      leads: 1,  closed: 0, rate_pct: 0,    revenue_vnd: 0 },
]

const CONSULTANT_KPI: ConsultantKpi[] = [
  { consultant_id: 'u_consultant_minhtam', consultant_name: 'Minh Tâm',    leads: 15, closed: 3, rate_pct: 20, avg_response_hours: 2.5 },
  { consultant_id: 'u_admin',             consultant_name: 'Admin Demo',   leads: 10, closed: 2, rate_pct: 20, avg_response_hours: 4.1 },
  { consultant_id: 'u_founder',           consultant_name: 'Lê Thảo Nhi', leads: 5,  closed: 0, rate_pct: 0,  avg_response_hours: 6.3 },
]

export const analyticsHandlers = [
  http.get(`${BASE}/api/analytics/funnel`,   () => ok(FUNNEL)),
  http.get(`${BASE}/api/analytics/source`,   () => ok(LEAD_SOURCE)),
  http.get(`${BASE}/api/analytics/consultant-kpi`, () => ok(CONSULTANT_KPI)),
]
