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
  /** Tailwind color token used for header bg (matches CSS var) */
  color: 'accent' | 'teal' | 'amber' | 'coral' | 'mint'
  /** Header text color: white for dark headers, dark navy for bright headers */
  headerTextDark: boolean
}

export const STAGE_META: ReadonlyArray<StageMeta> = [
  { key: 'lead_new', label: 'Lead mới', color: 'accent', headerTextDark: false },
  { key: 'contacted', label: 'Tiếp cận', color: 'teal', headerTextDark: false },
  { key: 'consulting', label: 'Tư vấn', color: 'amber', headerTextDark: true },
  { key: 'followup', label: 'Follow-up', color: 'coral', headerTextDark: false },
  { key: 'closed', label: 'Chốt đơn', color: 'mint', headerTextDark: true },
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
