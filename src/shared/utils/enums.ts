import type {
  LeadSource,
  LeadStage,
  PipelineActionType,
} from '@shared/types/domain'

export const SOURCE_LABEL: Record<LeadSource, string> = {
  facebook_ads: 'Facebook Ads',
  google: 'Google',
  referral: 'Referral',
  webinar: 'Webinar',
  organic: 'Organic',
  tiktok: 'TikTok',
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

export const ACTION_TYPE_META: Record<PipelineActionType, { icon: string; label: string }> = {
  move: { icon: '🔀', label: 'Chuyển giai đoạn' },
  note: { icon: '💬', label: 'Ghi chú' },
  call: { icon: '📞', label: 'Cuộc gọi' },
  enroll: { icon: '✅', label: 'Đăng ký thành công' },
  sms: { icon: '💬', label: 'SMS' },
  email: { icon: '✉️', label: 'Email' },
}
