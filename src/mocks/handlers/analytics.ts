import { http } from 'msw'
import { ok } from '@/mocks/config'
import type { FunnelRow, LeadSourceStat, ConsultantKpi } from '@shared/types/domain'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const FUNNEL: FunnelRow[] = [
  { stage: 'awareness',     label: 'Biết đến',   count: 35, conversion_pct: 100 },
  { stage: 'interest',      label: 'Quan tâm',   count: 26, conversion_pct: 74.3 },
  { stage: 'consideration', label: 'Cân nhắc',   count: 18, conversion_pct: 69.2 },
  { stage: 'intent',        label: 'Muốn mua',   count: 11, conversion_pct: 61.1 },
  { stage: 'enrolled',      label: 'Đã đăng ký', count: 6,  conversion_pct: 54.5 },
  { stage: 'retention',     label: 'Giữ chân',   count: 4,  conversion_pct: 66.7 },
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
