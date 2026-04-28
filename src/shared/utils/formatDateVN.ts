/**
 * Format ISO date as "DD/MM" (mặc định) hoặc "DD/MM/YYYY".
 */
export function formatDateVN(iso?: string, opts: { withYear?: boolean } = {}): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  if (opts.withYear) return `${dd}/${mm}/${d.getFullYear()}`
  return `${dd}/${mm}`
}

/** Format ISO datetime as "HH:mm DD/MM". */
export function formatDateTimeVN(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const hh = String(d.getHours()).padStart(2, '0')
  const mn = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mn} ${formatDateVN(iso)}`
}

/**
 * Relative time tiếng Việt: "vừa xong" / "5p trước" / "2h trước" / "3d trước" / "12/04".
 * Cutoff ngày → fallback DD/MM.
 */
export function timeAgoVN(iso?: string, now: Date = new Date()): string {
  if (!iso) return '—'
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'
  const diffMs = now.getTime() - t
  if (diffMs < 0) return formatDateTimeVN(iso)
  const m = Math.floor(diffMs / 60_000)
  if (m < 1) return 'vừa xong'
  if (m < 60) return `${m}p trước`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h trước`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d trước`
  return formatDateVN(iso)
}

export type CallbackStatus =
  | { kind: 'today'; label: string }
  | { kind: 'overdue'; days: number; label: string }
  | { kind: 'future'; label: string }
  | { kind: 'past'; label: string }

/**
 * Phân loại callback_at so với now:
 * - Hôm nay → "Hôm nay" (amber)
 * - Quá hạn (đã qua ngày) → "Quá hạn Nd" (red)
 * - Tương lai → "Gọi lại DD/MM" (text)
 */
export function classifyCallback(iso?: string, now: Date = new Date()): CallbackStatus | null {
  if (!iso) return null
  const cb = new Date(iso)
  if (Number.isNaN(cb.getTime())) return null

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfCb = new Date(cb.getFullYear(), cb.getMonth(), cb.getDate())
  const dayDiff = Math.round((startOfToday.getTime() - startOfCb.getTime()) / 86_400_000)

  if (dayDiff === 0) return { kind: 'today', label: 'Hôm nay' }
  if (dayDiff > 0) return { kind: 'overdue', days: dayDiff, label: `Quá hạn ${dayDiff}d` }
  return { kind: 'future', label: `Gọi lại ${formatDateVN(iso)}` }
}
