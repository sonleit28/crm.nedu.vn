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
            {['Tên', 'Email', 'SĐT', 'Nguồn', 'Khóa đang học', 'Phân loại', ''].map(
              (h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left text-[11px] uppercase tracking-[0.5px] text-text2 font-semibold"
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
              className="border-b border-border/50 hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-3 py-2.5">
                <strong className="text-text">{c.full_name}</strong>
              </td>
              <td className="px-3 py-2.5 text-text2 text-[11px]">{c.email ?? '—'}</td>
              <td className="px-3 py-2.5 text-text2">{c.phone ?? '—'}</td>
              <td className="px-3 py-2.5 text-text2">{SOURCE_LABEL[c.source]}</td>
              <td className="px-3 py-2.5 text-text">{c.current_course ?? '—'}</td>
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
