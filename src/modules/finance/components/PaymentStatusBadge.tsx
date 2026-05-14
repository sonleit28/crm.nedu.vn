import type { PaymentStatus } from '@shared/types/domain'

interface PaymentStatusBadgeProps {
  status: PaymentStatus
}

// 'overdue' đã drop với removal của installment scheme.
export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
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
          ⏳ Chưa thanh toán
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
