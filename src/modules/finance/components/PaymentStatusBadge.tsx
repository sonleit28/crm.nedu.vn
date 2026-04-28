import type { PaymentStatus } from '@shared/types/domain'

interface PaymentStatusBadgeProps {
  status: PaymentStatus
  installmentIndex?: number
  overdueDays?: number
}

export function PaymentStatusBadge({ status, installmentIndex, overdueDays }: PaymentStatusBadgeProps) {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-r text-[11px] font-semibold bg-mint/10 text-mint border border-mint/30">
          ✓ Hoàn thành
        </span>
      )
    case 'pending':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-r text-[11px] font-semibold bg-amber/10 text-amber border border-amber/30">
          ⏳ {installmentIndex ? `Chờ kỳ ${installmentIndex}` : 'Đang chờ'}
        </span>
      )
    case 'overdue':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-r text-[11px] font-semibold bg-red/10 text-red border border-red/30">
          🔴 Quá hạn{overdueDays ? ` ${overdueDays} ngày` : ''}
        </span>
      )
    case 'refunded':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-r text-[11px] font-semibold bg-muted/10 text-text2 border border-border">
          ↩ Hoàn tiền
        </span>
      )
  }
}
