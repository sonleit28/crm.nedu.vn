import type { Payment } from '@shared/types/domain'
import { formatVND } from '@shared/utils/formatVND'
import type { PaymentFilters } from '../hooks/usePayments'

interface PaymentsSummaryBarProps {
  payments: Payment[]
  filters: PaymentFilters
}

export function PaymentsSummaryBar({ payments, filters }: PaymentsSummaryBarProps) {
  const total = payments.reduce((s, p) => s + p.amount, 0)

  const fromLabel = filters.from ?? '—'
  const toLabel = filters.to ?? '—'

  return (
    <div className="flex flex-wrap gap-6 px-4 py-2.5 bg-card2/50 border border-border/50 rounded-r text-[12px]">
      <span>
        Số giao dịch: <strong className="text-text">{payments.length}</strong>
      </span>
      <span>
        Tổng giá trị:{' '}
        <strong className={total < 0 ? 'text-red' : 'text-mint'}>{formatVND(total)}</strong>
      </span>
      <span className="text-text3">
        Khoảng thời gian: {fromLabel} → {toLabel}
      </span>
    </div>
  )
}
