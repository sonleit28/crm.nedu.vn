import { Modal, ModalHeader, ModalBody } from '@shared/components/ui/Modal'
import type { CloseRateByCourse } from '@shared/types/domain'
import { formatPct } from '@shared/utils/formatPct'

interface CloseRateModalProps {
  open: boolean
  onClose: () => void
  rows: CloseRateByCourse[]
  month?: string
}

function rateColor(rate: number) {
  if (rate >= 25) return 'text-mint'
  if (rate >= 15) return 'text-amber'
  return 'text-red'
}

function buildInsight(rows: CloseRateByCourse[]): string {
  if (rows.length === 0) return ''
  const sorted = [...rows].sort((a, b) => b.rate_pct - a.rate_pct)
  const top = sorted[0]
  const bot = sorted[sorted.length - 1]
  const totalLeads = rows.reduce((s, r) => s + r.leads, 0)
  const totalClosed = rows.reduce((s, r) => s + r.closed, 0)
  const overall = totalLeads > 0 ? ((totalClosed / totalLeads) * 100).toFixed(1) : '0'
  let text = `${top.course_name} chốt cao nhất (${top.rate_pct}%) — content marketing đang hiệu quả.`
  if (bot.rate_pct < 25 && bot.course_name !== top.course_name) {
    text += ` ${bot.course_name} thấp dưới benchmark 25% — cần review pitch của TV viên.`
  }
  return `Tổng tỷ lệ chốt: ${overall}% (${totalClosed}/${totalLeads}). ${text}`
}

export function CloseRateModal({ open, onClose, rows, month = '04/2026' }: CloseRateModalProps) {
  const sorted = [...rows].sort((a, b) => b.rate_pct - a.rate_pct)
  const totalLeads = rows.reduce((s, r) => s + r.leads, 0)
  const totalClosed = rows.reduce((s, r) => s + r.closed, 0)

  return (
    <Modal open={open} onClose={onClose} width={520} ariaLabel="Tỷ lệ chốt theo khóa">
      <ModalHeader
        title="🎯 Tỷ lệ chốt theo khóa"
        subtitle={`Phân tích chi tiết tháng ${month} · Tỷ lệ chốt tổng: ${totalLeads > 0 ? ((totalClosed / totalLeads) * 100).toFixed(1) : 0}% (${totalClosed}/${totalLeads})`}
        onClose={onClose}
      />
      <ModalBody className="space-y-4">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border">
              {['Khóa', 'Lead', 'Chốt', 'Tỷ lệ'].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-text3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.course_name} className="border-b border-border/50">
                <td className="px-3 py-2.5 text-text font-medium">{r.course_name}</td>
                <td className="px-3 py-2.5 text-text2">{r.leads}</td>
                <td className="px-3 py-2.5 text-text2">{r.closed}</td>
                <td className={`px-3 py-2.5 font-bold ${rateColor(r.rate_pct)}`}>
                  {formatPct(r.rate_pct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length > 0 && (
          <div className="bg-accent/[0.06] border border-accent/15 rounded-r p-3 text-[12px] text-text2 leading-snug">
            💡 <strong className="text-accent">Insight:</strong> {buildInsight(rows)}
          </div>
        )}
      </ModalBody>
    </Modal>
  )
}
