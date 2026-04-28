export function formatVND(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000
    return `${m % 1 === 0 ? m : m.toFixed(1)}M ₫`
  }
  return amount.toLocaleString('vi-VN') + '₫'
}
