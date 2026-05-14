import type { LeadStage } from '@shared/types/domain'

// Index by raw string vì BE phát sinh source không nằm trong
// FE LeadSource union (vd: inbound, marketing, alumni). Lookup site dùng
// sourceLabel() để có fallback.
export const SOURCE_LABEL: Record<string, string> = {
  // FE-native (legacy MSW mock).
  facebook_ads: 'Facebook Ads',
  google: 'Google',
  referral: 'Referral',
  webinar: 'Webinar',
  organic: 'Organic',
  tiktok: 'TikTok',
  // BE values (ops.leads.source enum).
  inbound: 'Inbound',
  marketing: 'Marketing',
  alumni: 'Alumni',
}

export function sourceLabel(source: string | null | undefined): string {
  if (!source) return '—'
  return SOURCE_LABEL[source] ?? source
}

export interface StageMeta {
  key: LeadStage
  label: string
  hex: string
}

export const STAGE_META: ReadonlyArray<StageMeta> = [
  { key: 'awareness',     label: 'Biết đến',   hex: '#6366f1' },
  { key: 'interest',      label: 'Quan tâm',   hex: '#8b5cf6' },
  { key: 'consideration', label: 'Cân nhắc',   hex: '#a855f7' },
  { key: 'intent',        label: 'Muốn mua',   hex: '#d946ef' },
  { key: 'enrolled',      label: 'Đã đăng ký', hex: '#10b981' },
  { key: 'retention',     label: 'Giữ chân',   hex: '#0ea5e9' },
] as const

export const STAGE_LABEL: Record<LeadStage, string> = STAGE_META.reduce(
  (acc, s) => {
    acc[s.key] = s.label
    return acc
  },
  {} as Record<LeadStage, string>,
)

// Index by raw string vì BE phát sinh action_type không nằm trong
// FE PipelineActionType union (vd: stage_advanced, lead_assigned, ...).
// Lookup site phải fallback DEFAULT khi không match.
export interface ActionMeta {
  icon: string
  label: string
}

export const ACTION_TYPE_DEFAULT_META: ActionMeta = {
  icon: '📌',
  label: 'Hoạt động',
}

export const ACTION_TYPE_META: Record<string, ActionMeta> = {
  // FE-native legacy values (giữ tương thích MSW mock & hook cũ).
  move: { icon: '🔀', label: 'Chuyển giai đoạn' },
  note: { icon: '💬', label: 'Ghi chú' },
  call: { icon: '📞', label: 'Cuộc gọi' },
  enroll: { icon: '✅', label: 'Đăng ký thành công' },
  sms: { icon: '💬', label: 'SMS' },
  email: { icon: '✉️', label: 'Email' },

  // BE values từ ops.pipeline_actions.action_type.
  stage_advanced: { icon: '🔀', label: 'Chuyển giai đoạn' },
  stage_regressed: { icon: '↩️', label: 'Quay lại giai đoạn trước' },
  note_added: { icon: '💬', label: 'Ghi chú' },
  lead_assigned: { icon: '👤', label: 'Đã giao lead' },
  lead_transferred: { icon: '🔁', label: 'Chuyển giao lead' },
  co_deal_created: { icon: '🤝', label: 'Co-deal' },
  enrolled: { icon: '✅', label: 'Đăng ký thành công' },
  profile_updated: { icon: '📝', label: 'Cập nhật hồ sơ' },
  ai_profile_generated: { icon: '✨', label: 'Sinh profile AI' },
}

const STAGE_CHANGE_ACTIONS = new Set([
  'move',
  'enroll',
  'stage_advanced',
  'stage_regressed',
  'enrolled',
])

export function isStageChangeAction(type: string): boolean {
  return STAGE_CHANGE_ACTIONS.has(type)
}
