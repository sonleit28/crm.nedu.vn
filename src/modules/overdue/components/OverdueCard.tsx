import { useState } from 'react'
import type { OverdueCase } from '@shared/types/domain'
import { formatVND } from '@shared/utils/formatVND'
import { Button } from '@shared/components/ui/Button'
import { InstallmentProgressBar } from './InstallmentProgressBar'
import { ContactDialer } from './ContactDialer'
import { NoteEditor } from './NoteEditor'
import { PauseStudyDialog } from './PauseStudyDialog'
import { useAddNote } from '../hooks/useAddNote'
import { useToastStore } from '@shared/stores/useToastStore'
import { formatDateTimeVN } from '@shared/utils/formatDateVN'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'

interface OverdueCardProps {
  case_: OverdueCase
}

export function OverdueCard({ case_: c }: OverdueCardProps) {
  const [dialerOpen, setDialerOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [pauseOpen, setPauseOpen] = useState(false)
  const noteMut = useAddNote(c.payment_id)
  const push = useToastStore((s) => s.push)
  const role = useAuthStore((s) => s.user?.role)
  const isAdmin = role === 'founder' || role === 'admin'

  const isCritical = c.severity === 'critical'
  const borderColor = isCritical ? 'border-l-red' : 'border-l-amber'
  const amountColor = isCritical ? 'text-red' : 'text-amber'

  const handleSaveNote = async (note: string) => {
    await noteMut.mutateAsync(note)
    push({
      type: 'success',
      title: 'Đã thêm ghi chú',
      meta: formatDateTimeVN(new Date().toISOString()),
      ttl: 3500,
    })
    setNoteOpen(false)
  }

  return (
    <div className={`bg-card border-l-[3px] border border-border ${borderColor} rounded-r2 p-4`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[15px] font-bold text-text">{c.contact_name}</div>
          <div className="text-[12px] text-text2 mt-0.5">
            {c.course_name} · {c.installment_type}
          </div>
          <div className="text-[11px] mt-0.5">
            Sale phụ trách:{' '}
            <span className="text-accent">{c.sale_owner_name}</span>
            {c.sale_owner_phone && (
              <span className="text-text3"> · SĐT: {c.sale_owner_phone}</span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[11px] text-text2">Đang quá hạn</div>
          <div className={`text-[20px] font-bold leading-tight ${amountColor}`}>
            {formatVND(c.overdue_amount)}
          </div>
          <div className={`text-[11px] font-semibold ${amountColor}`}>
            Quá hạn {c.overdue_days} ngày
          </div>
        </div>
      </div>

      {/* Progress breakdown */}
      <div className="grid grid-cols-3 gap-3 mt-3 bg-card2 rounded-r p-3 text-[12px]">
        <div>
          <div className="text-[10px] text-text3 mb-1">Tổng học phí</div>
          <div className="font-bold text-text">{formatVND(c.total_fee)}</div>
          <div className="text-[10px] text-text3">
            {c.installment_total} kỳ × {formatVND(c.total_fee / c.installment_total)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-text3 mb-1">Đã thanh toán</div>
          <div className="font-bold text-mint">{formatVND(c.paid_amount)}</div>
          <div className="text-[10px] text-mint">✓ Kỳ {c.installment_index - 1}</div>
        </div>
        <div>
          <div className="text-[10px] text-text3 mb-1">Còn nợ</div>
          <div className={`font-bold ${amountColor}`}>{formatVND(c.remaining_amount)}</div>
          <div className={`text-[10px] ${amountColor}`}>Kỳ {c.installment_index} (quá hạn)</div>
        </div>
      </div>

      {/* Installment progress bar */}
      <div className="mt-3">
        <InstallmentProgressBar installments={c.installments} severity={c.severity} />
      </div>

      {/* Note editor inline */}
      {noteOpen && (
        <NoteEditor
          onSave={handleSaveNote}
          onCancel={() => setNoteOpen(false)}
          saving={noteMut.isPending}
        />
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mt-4">
        <Button variant="primary" size="sm" onClick={() => setDialerOpen(true)}>
          📞 Liên hệ
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setNoteOpen((v) => !v)}
          disabled={noteMut.isPending}
        >
          💬 Ghi chú
        </Button>
        {isAdmin && (
          <Button variant="danger" size="sm" onClick={() => setPauseOpen(true)}>
            ⏸ Tạm dừng học
          </Button>
        )}
      </div>

      <ContactDialer
        open={dialerOpen}
        paymentId={c.payment_id}
        contactName={c.contact_name}
        contactPhone={c.sale_owner_phone}
        onClose={() => setDialerOpen(false)}
      />

      <PauseStudyDialog
        open={pauseOpen}
        paymentId={c.payment_id}
        contactName={c.contact_name}
        onClose={() => setPauseOpen(false)}
      />
    </div>
  )
}
