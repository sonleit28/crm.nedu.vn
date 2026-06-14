/**
 * Format phần trăm (1 chữ số thập phân). Null-safe: undefined / null / NaN → "—"
 * (em dash) thay vì crash. Phòng case BE response thiếu field hoặc shape stale —
 * mirror convention của formatVND.
 */
export function formatPct(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return `${value.toFixed(1)}%`
}
