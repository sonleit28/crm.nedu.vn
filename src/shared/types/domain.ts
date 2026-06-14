// ─── Enums (string literal unions) ─────────────────────────────
export type LeadStage =
  | 'awareness'
  | 'interest'
  | 'consideration'
  | 'intent'
  | 'enrolled'
  | 'retention'

export type LeadSource =
  | 'facebook_ads'
  | 'google'
  | 'referral'
  | 'webinar'
  | 'organic'
  | 'tiktok'

export type LeadScoreBucket = 'hot' | 'warm' | 'cold'

export type ContactTier = 'diamond' | 'gold' | 'silver' | 'newbie'

// 'overdue' đã bị drop sau khi Nedu bỏ installment scheme (2026-05-13).
// Payments giờ full-amount: completed (paid full), pending (đã enroll chưa pay), refunded.
export type PaymentStatus = 'completed' | 'pending' | 'refunded'

export type PaymentGateway = 'vnpay' | 'stripe' | 'momo' | 'manual'

export type PipelineActionType = 'move' | 'note' | 'call' | 'enroll' | 'sms' | 'email'

// ─── Entities ──────────────────────────────────────────────────
export interface Course {
  id: string
  name: string
  batch: string
  price_vnd: number
  status: 'running' | 'upcoming' | 'finished'
  started_at?: string
}

export interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  source: LeadSource
  interested_course?: string
  lead_score: number
  current_stage: LeadStage
  callback_at?: string
  assigned_to?: string
  assigned_to_name?: string
  created_at: string
  enrolled_at?: string
  last_action_at?: string
}

export interface PipelineAction {
  id: string
  lead_id: string
  from_stage: LeadStage | null
  to_stage: LeadStage | null
  action_type: PipelineActionType
  note?: string
  performed_by: string
  performed_by_name?: string
  metadata?: Record<string, unknown>
  created_at: string
}

// ContactSummary === ContactRow per NLH-NEDU-CRM-MVP1-001 §6.2 (locked 2026-05-13).
// Shape khớp với response shape mà BE sẽ trả cho GET /api/crm/contacts.
export interface ContactSummary {
  // === Stable key (FE React key) ===
  id: string                          // = person_id ?? fallback_key

  // === Identity layer (per L2-PLATFORM §5 snapshot pattern) ===
  person_id: string | null
  identity_resolved: boolean
  fallback_key: string | null         // 'email:foo@bar.com' or 'phone:+84...' nếu person_id null

  // === Display PII ===
  full_name: string
  email: string | null
  phone: string | null
  telegram: string | null

  // === Current lead state (latest active episode) ===
  current_lead_id: string | null
  current_stage: LeadStage | null
  source: LeadSource
  assigned_to_user_id: string | null
  assigned_to_name: string | null

  // === Course display ===
  current_course: string | null
  payment_status_label: string
  payment_status_class: PaymentStatus | 'paid'

  // === Aggregates (computed BE) ===
  lead_count: number
  course_count: number
  lifetime_value: number              // VND
  first_purchase_at: string | null    // ISO
  last_purchase_at: string | null
  tier: ContactTier

  // === Context ===
  origin: 'nedu-pipeline' | 'direct-buyer' | 'unknown'
  last_interaction_at: string | null
  first_seen_at: string
}

// ContactDetail extends ContactSummary với detail-only fields cho popup.
// GET /api/crm/contacts/:id sẽ trả về shape này (out-of-MVP-1 scope, MSW mock Phase 1).
export interface ContactDetail extends ContactSummary {
  lead_date: string
  current_course_fee?: number
  course_history: Array<{
    name: string
    period: string
    amount: number
  }>
  internal_note?: string
  internal_note_author?: string
}

// Payment: full-amount transaction (no installments).
// installment_index/installment_total/due_date đã drop với removal của trả góp scheme.
export interface Payment {
  id: string
  contact_id: string
  contact_name: string
  contact_email?: string | null
  contact_phone?: string | null
  contact_telegram?: string | null
  course_id: string
  course_name: string
  amount: number
  paid_at?: string
  status: PaymentStatus
  gateway?: PaymentGateway
  method?: 'transfer' | 'card' | 'ewallet'
  created_at: string
}

// ─── Dashboard / Analytics aggregates ──────────────────────────
export interface DashboardSummary {
  month: string
  total_leads: number
  total_leads_delta_pct: number
  close_rate_pct: number
  close_rate_delta_pct: number
  enrolled_count: number
  enrolled_delta_pct: number
  revenue_vnd: number
  revenue_delta_pct: number
  consulting_total: number
  consulting_breakdown: { consulting: number; followup: number }
  revenue_by_course: Array<{
    course_id: string
    course_name: string
    revenue_vnd: number
    student_count: number
  }>
}

export interface CloseRateByCourse {
  course_name: string
  leads: number
  closed: number
  rate_pct: number
}

export interface EnrollmentByCourse {
  course_name: string
  enrolled: number
  revenue_vnd: number
  status: 'running' | 'upcoming' | 'finished'
}

export interface FunnelRow {
  stage: LeadStage
  label: string
  count: number
  conversion_pct: number
}

export interface LeadSourceStat {
  source: LeadSource
  source_label: string
  leads: number
  closed: number
  rate_pct: number
  revenue_vnd: number
}

export interface ConsultantKpi {
  consultant_id: string
  consultant_name: string
  leads: number
  closed: number
  rate_pct: number
  avg_response_hours: number
}

// Simplified sau khi drop installment scheme — không còn AR/overdue tracking.
export interface FinanceSummary {
  month: string
  total_revenue_vnd: number
  delta_pct_total_revenue: number
}
