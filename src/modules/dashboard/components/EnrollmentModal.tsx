import { Modal, ModalHeader, ModalBody } from '@shared/components/ui/Modal'
import type { EnrollmentByCourse } from '@shared/types/domain'
import { formatVND } from '@shared/utils/formatVND'

interface EnrollmentModalProps {
  open: boolean
  onClose: () => void
  rows: EnrollmentByCourse[]
  month?: string
}

const STATUS_BADGE: Record<string, string> = {
  running: 'bg-mint/10 text-mint border border-mint/30',
  upcoming: 'bg-amber/10 text-amber border border-amber/30',
  finished: 'bg-muted/10 text-text2 border border-border',
}
const STATUS_LABEL: Record<string, string> = {
  running: 'Đang chạy',
  upcoming: 'Sắp khai giảng',
  finished: 'Kết thúc',
}

function buildInsight(rows: EnrollmentByCourse[]): string {
  if (rows.length === 0) return ''
  const sorted = [...rows].sort((a, b) => b.enrolled - a.enrolled)
  const top = sorted[0]
  const total = rows.reduce((s, r) => s + r.enrolled, 0)
  return `${top.course_name} dẫn đầu với ${top.enrolled} học viên đăng ký mới. Tổng doanh thu ${formatVND(rows.reduce((s, r) => s + r.revenue_vnd, 0))} từ ${total} học viên trong tháng.`
}

export function EnrollmentModal({ open, onClose, rows, month = '04/2026' }: EnrollmentModalProps) {
  const totalEnrolled = rows.reduce((s, r) => s + r.enrolled, 0)

  return (
    <Modal open={open} onClose={onClose} width={520} ariaLabel="Đăng ký theo khóa">
      <ModalHeader
        title="✅ Đăng ký thành công theo khóa"
        subtitle={`Tháng ${month} · Tổng ${totalEnrolled} học viên đăng ký mới`}
        onClose={onClose}
      />
      <ModalBody className="space-y-4">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border">
              {['Khóa', 'Đăng ký', 'Doanh thu', 'Trạng thái'].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-text3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.course_name} className="border-b border-border/50">
                <td className="px-3 py-2.5 text-text font-medium">{r.course_name}</td>
                <td className="px-3 py-2.5 text-text font-bold">{r.enrolled}</td>
                <td className="px-3 py-2.5 text-mint font-semibold">{formatVND(r.revenue_vnd)}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-r text-[11px] font-semibold ${STATUS_BADGE[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length > 0 && (
          <div className="bg-mint/[0.06] border border-mint/20 rounded-r p-3 text-[12px] text-text2 leading-snug">
            💡 <strong className="text-mint">Insight:</strong> {buildInsight(rows)}
          </div>
        )}
      </ModalBody>
    </Modal>
  )
}
