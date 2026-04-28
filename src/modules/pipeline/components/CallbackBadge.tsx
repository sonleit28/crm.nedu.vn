import { classifyCallback, formatDateVN, timeAgoVN } from '@shared/utils/formatDateVN'

interface CallbackBadgeProps {
  callbackAt?: string
  enrolledAt?: string
  lastActionAt?: string
  createdAt: string
  isClosed: boolean
}

/**
 * Right-side hint trên LeadCard:
 * - Closed → "✅ Enrolled DD/MM"
 * - Có callback hôm nay → "Hôm nay" (amber)
 * - Quá hạn → "Quá hạn Nd" (red)
 * - Tương lai → "Gọi lại DD/MM"
 * - Không có callback → relative time của last_action_at hoặc created_at
 */
export function CallbackBadge({
  callbackAt,
  enrolledAt,
  lastActionAt,
  createdAt,
  isClosed,
}: CallbackBadgeProps) {
  if (isClosed) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-mint font-semibold">
        ✅ Enrolled
        <span className="text-text3 font-normal">{formatDateVN(enrolledAt)}</span>
      </span>
    )
  }

  const cb = classifyCallback(callbackAt)
  if (cb?.kind === 'today') {
    return (
      <span className="text-[10px] font-semibold text-amber bg-amber/15 px-1.5 py-[2px] rounded">
        {cb.label}
      </span>
    )
  }
  if (cb?.kind === 'overdue') {
    return <span className="text-[10px] font-semibold text-red">{cb.label}</span>
  }
  if (cb?.kind === 'future') {
    return <span className="text-[10px] text-text2">{cb.label}</span>
  }

  return <span className="text-[10px] text-text3">{timeAgoVN(lastActionAt ?? createdAt)}</span>
}
