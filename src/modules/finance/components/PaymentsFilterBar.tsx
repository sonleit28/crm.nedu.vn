import { Select } from '@shared/components/ui/Select'
import { Button } from '@shared/components/ui/Button'
import type { PaymentFilters } from '../hooks/usePayments'

const COURSE_OPTIONS = [
  { value: 'Design Thinking B5', label: 'Design Thinking B5' },
  { value: 'Là Chính Mình B3', label: 'Là Chính Mình B3' },
  { value: 'Public Speaking B2', label: 'Public Speaking B2' },
  { value: 'Storytelling B4', label: 'Storytelling B4' },
]

const STATUS_OPTIONS = [
  { value: 'completed', label: '✓ Hoàn thành' },
  { value: 'pending', label: '⏳ Đang chờ' },
  { value: 'refunded', label: '↩ Hoàn tiền' },
]

interface PaymentsFilterBarProps {
  filters: PaymentFilters
  onChange: (patch: Partial<PaymentFilters>) => void
  onReset: () => void
}

export function PaymentsFilterBar({ filters, onChange, onReset }: PaymentsFilterBarProps) {
  const hasFilter = !!(filters.from || filters.to || filters.course || filters.status)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
        <label className="text-[11px] text-text3">Từ</label>
        <input
          type="date"
          value={filters.from ?? ''}
          onChange={(e) => onChange({ from: e.target.value, page: 1 })}
          className="h-9 px-3 rounded-r bg-card2 border border-border text-[12px] text-text outline-none focus:border-accent/60 [color-scheme:dark]"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <label className="text-[11px] text-text3">Đến</label>
        <input
          type="date"
          value={filters.to ?? ''}
          onChange={(e) => onChange({ to: e.target.value, page: 1 })}
          className="h-9 px-3 rounded-r bg-card2 border border-border text-[12px] text-text outline-none focus:border-accent/60 [color-scheme:dark]"
        />
      </div>

      <Select
        value={filters.course ?? ''}
        onChange={(e) => onChange({ course: e.target.value, page: 1 })}
        options={COURSE_OPTIONS}
        placeholder="Tất cả khóa"
      />

      <Select
        value={filters.status ?? ''}
        onChange={(e) => onChange({ status: e.target.value, page: 1 })}
        options={STATUS_OPTIONS}
        placeholder="Tất cả trạng thái"
      />

      {hasFilter && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          Đặt lại
        </Button>
      )}
    </div>
  )
}
