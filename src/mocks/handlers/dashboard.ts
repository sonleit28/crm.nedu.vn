import { http } from 'msw'
import { ok } from '@/mocks/config'
import type {
  DashboardSummary,
  CloseRateByCourse,
  EnrollmentByCourse,
} from '@shared/types/domain'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const SUMMARY: DashboardSummary = {
  month: '2026-06',
  total_leads: 30,
  total_leads_delta_pct: 15,
  close_rate_pct: 16.7,
  close_rate_delta_pct: -3.2,
  enrolled_count: 5,
  enrolled_delta_pct: 25,
  revenue_vnd: 186_500_000,
  revenue_delta_pct: 12,
  consulting_total: 11,
  consulting_breakdown: { consulting: 6, followup: 5 },
  revenue_by_course: [
    { course_id: 'c_design_thinking_b5', course_name: 'Design Thinking B5', revenue_vnd: 85_000_000, student_count: 10 },
    { course_id: 'c_la_chinh_minh_b3', course_name: 'Là Chính Mình B3', revenue_vnd: 52_000_000, student_count: 8 },
    { course_id: 'c_storytelling_b4', course_name: 'Storytelling B4', revenue_vnd: 35_000_000, student_count: 5 },
    { course_id: 'c_public_speaking_b2', course_name: 'Public Speaking B2', revenue_vnd: 11_000_000, student_count: 2 },
    { course_id: 'c_other', course_name: 'Khác', revenue_vnd: 3_500_000, student_count: 1 },
  ],
}

const CLOSE_RATE: CloseRateByCourse[] = [
  { course_name: 'Design Thinking B5', leads: 12, closed: 4, rate_pct: 33.3 },
  { course_name: 'Public Speaking B2', leads: 7, closed: 1, rate_pct: 14.3 },
  { course_name: 'Storytelling B4', leads: 6, closed: 0, rate_pct: 0 },
  { course_name: 'Là Chính Mình B3', leads: 5, closed: 0, rate_pct: 0 },
]

const ENROLLMENT: EnrollmentByCourse[] = [
  { course_name: 'Design Thinking B5', enrolled: 10, revenue_vnd: 85_000_000, status: 'running' },
  { course_name: 'Là Chính Mình B3', enrolled: 8, revenue_vnd: 52_000_000, status: 'running' },
  { course_name: 'Storytelling B4', enrolled: 5, revenue_vnd: 35_000_000, status: 'running' },
  { course_name: 'Public Speaking B2', enrolled: 2, revenue_vnd: 11_000_000, status: 'upcoming' },
]

export const dashboardHandlers = [
  http.get(`${BASE}/api/crm/dashboard/summary`,    () => ok(SUMMARY)),
  http.get(`${BASE}/api/crm/dashboard/close-rate`, () => ok(CLOSE_RATE)),
  http.get(`${BASE}/api/crm/dashboard/enrollment`, () => ok(ENROLLMENT)),
]
