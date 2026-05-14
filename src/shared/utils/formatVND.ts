/**
 * Format số VND. Null-safe: undefined / null / NaN → "—" (em dash) thay vì crash.
 * Phòng case BE response thiếu field hoặc shape stale.
 */
export function formatVND(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return '—'
  if (Math.abs(amount) >= 1_000_000) {
    const m = amount / 1_000_000
    return `${m % 1 === 0 ? m : m.toFixed(1)}M ₫`
  }
  return amount.toLocaleString('vi-VN') + '₫'
}
