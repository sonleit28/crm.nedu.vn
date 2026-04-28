import type { OverdueCase } from '@shared/types/domain'
import { formatDateVN } from '@shared/utils/formatDateVN'

interface InstallmentProgressBarProps {
  installments: OverdueCase['installments']
  severity: 'critical' | 'warn'
}

const STATUS_ICON: Record<string, string> = {
  paid: '✓',
  overdue: '🔴',
  pending: '○',
}

export function InstallmentProgressBar({ installments, severity }: InstallmentProgressBarProps) {
  const overdueColor = severity === 'critical' ? 'bg-red' : 'bg-amber'
  const overdueText = severity === 'critical' ? 'text-red' : 'text-amber'

  return (
    <div>
      {/* Bar */}
      <div className="flex h-2 rounded overflow-hidden gap-px">
        {installments.map((inst) => (
          <div
            key={inst.index}
            className={[
              'flex-1',
              inst.status === 'paid'
                ? 'bg-mint'
                : inst.status === 'overdue'
                  ? overdueColor
                  : 'bg-card2 border-l border-dashed border-text3',
            ].join(' ')}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="flex gap-3 mt-1.5 flex-wrap">
        {installments.map((inst) => (
          <span
            key={inst.index}
            className={[
              'text-[10px]',
              inst.status === 'paid'
                ? 'text-mint'
                : inst.status === 'overdue'
                  ? overdueText
                  : 'text-text3',
            ].join(' ')}
          >
            {STATUS_ICON[inst.status]} Kỳ {inst.index}
            {inst.status !== 'paid' && ` · ${formatDateVN(inst.due_date, { withYear: true })}`}
          </span>
        ))}
      </div>
    </div>
  )
}
