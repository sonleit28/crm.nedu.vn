import type { Payment } from '@shared/types/domain'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { formatVND } from '@shared/utils/formatVND'
import { formatDateVN } from '@shared/utils/formatDateVN'
import { Spinner } from '@shared/components/ui/Spinner'
import { EmptyState } from '@shared/components/ui/EmptyState'

const GATEWAY_LABEL: Record<string, string> = {
  vnpay: 'VNPay',
  stripe: 'Stripe',
  momo: 'MoMo',
  manual: 'Thủ công',
}

const METHOD_LABEL: Record<string, string> = {
  transfer: 'Chuyển khoản',
  card: 'Thẻ',
  ewallet: 'Ví điện tử',
}

interface PaymentsTableProps {
  payments: Payment[]
  isLoading: boolean
}

export function PaymentsTable({ payments, isLoading }: PaymentsTableProps) {
  if (isLoading) {
    return (
      <div className="py-16 grid place-items-center">
        <Spinner size={28} className="text-accent" />
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="Không có giao dịch nào"
        sub="Thử thay đổi bộ lọc để xem giao dịch."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-border">
            {['Học viên', 'Email', 'SĐT', 'Telegram', 'Khóa', 'Số tiền', 'Phương thức', 'Trạng thái', 'Ngày', 'Cổng thanh toán'].map(
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
          {payments.map((p) => (
            <tr
              key={p.id}
              className="border-b border-border/50 transition-colors hover:bg-card2/50"
            >
              <td className="px-3 py-2.5 font-semibold text-text">{p.contact_name}</td>
              <td className="px-3 py-2.5 text-text2 text-[11px]">{p.contact_email ?? '—'}</td>
              <td className="px-3 py-2.5 text-text2">{p.contact_phone ?? '—'}</td>
              <td className="px-3 py-2.5 text-text2">
                {p.contact_telegram ? (
                  <a
                    href={`https://t.me/${p.contact_telegram.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.contact_telegram}
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-3 py-2.5 text-text2">{p.course_name}</td>
              <td className="px-3 py-2.5">
                <span className={p.amount < 0 ? 'text-text3' : 'font-semibold text-text'}>
                  {p.amount < 0 ? `−${formatVND(Math.abs(p.amount))}` : formatVND(p.amount)}
                </span>
              </td>
              <td className="px-3 py-2.5 text-text2">
                {p.method ? METHOD_LABEL[p.method] ?? p.method : '—'}
              </td>
              <td className="px-3 py-2.5">
                <PaymentStatusBadge status={p.status} />
              </td>
              <td className="px-3 py-2.5 text-text2">
                {p.paid_at ? formatDateVN(p.paid_at, { withYear: true }) : '—'}
              </td>
              <td className="px-3 py-2.5 text-text3">
                {p.gateway ? GATEWAY_LABEL[p.gateway] ?? p.gateway : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
