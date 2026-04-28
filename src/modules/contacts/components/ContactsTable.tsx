import type { ContactSummary } from '@shared/types/domain'
import { SOURCE_LABEL } from '@shared/utils/enums'
import { TierBadge } from './TierBadge'
import { Spinner } from '@shared/components/ui/Spinner'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { Button } from '@shared/components/ui/Button'

interface ContactsTableProps {
  contacts: ContactSummary[]
  isLoading: boolean
  onDetail: (id: string) => void
}

const PAYMENT_BADGE: Record<string, string> = {
  paid: 'bg-mint/10 text-mint border border-mint/30',
  completed: 'bg-mint/10 text-mint border border-mint/30',
  pending: 'bg-amber/10 text-amber border border-amber/30',
  overdue: 'bg-red/10 text-red border border-red/30',
  refunded: 'bg-muted/10 text-text2 border border-border',
}

export function ContactsTable({ contacts, isLoading, onDetail }: ContactsTableProps) {
  if (isLoading) {
    return (
      <div className="py-16 grid place-items-center">
        <Spinner size={28} className="text-accent" />
      </div>
    )
  }

  if (contacts.length === 0) {
    return (
      <EmptyState
        icon="👥"
        title="Không có contact nào khớp filter"
        sub="Thử thay đổi điều kiện lọc hoặc đặt lại filter."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-border">
            {['Tên', 'Email', 'SĐT', 'Nguồn', 'Khóa đang học', 'Thanh toán', 'Phân loại', ''].map(
              (h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-text3 font-semibold"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <tr
              key={c.id}
              className="border-b border-border/50 hover:bg-card2/60 transition-colors"
            >
              <td className="px-3 py-2.5">
                <strong className="text-text">{c.name}</strong>
              </td>
              <td className="px-3 py-2.5 text-text2 text-[11px]">{c.email ?? '—'}</td>
              <td className="px-3 py-2.5 text-text2">{c.phone ?? '—'}</td>
              <td className="px-3 py-2.5 text-text2">{SOURCE_LABEL[c.source]}</td>
              <td className="px-3 py-2.5 text-text">{c.current_course ?? '—'}</td>
              <td className="px-3 py-2.5">
                <span
                  className={[
                    'inline-flex items-center px-2 py-0.5 rounded-r text-[11px] font-semibold',
                    PAYMENT_BADGE[c.payment_status_class] ?? 'text-text3',
                  ].join(' ')}
                >
                  {c.payment_status_label}
                </span>
              </td>
              <td className="px-3 py-2.5">
                <TierBadge tier={c.tier} />
              </td>
              <td className="px-3 py-2.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDetail(c.id)}
                >
                  Chi tiết →
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
