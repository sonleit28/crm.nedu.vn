import { useState } from 'react'
import type { Lead, LeadStage } from '@shared/types/domain'
import { STAGE_META, STAGE_LABEL } from '@shared/utils/enums'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@shared/components/ui/Modal'
import { Button } from '@shared/components/ui/Button'
import { Select } from '@shared/components/ui/Select'
import { Textarea } from '@shared/components/ui/Input'

interface StageMoveDialogProps {
  open: boolean
  lead: Lead
  onClose: () => void
  onConfirm: (toStage: LeadStage, note?: string) => Promise<void>
  saving?: boolean
}

export function StageMoveDialog({
  open,
  lead,
  onClose,
  onConfirm,
  saving = false,
}: StageMoveDialogProps) {
  const [toStage, setToStage] = useState<LeadStage>(lead.current_stage)
  const [note, setNote] = useState('')

  const stageOptions = STAGE_META.filter((s) => s.key !== lead.current_stage).map((s) => ({
    value: s.key,
    label: s.label,
  }))

  const handleConfirm = async () => {
    if (toStage === lead.current_stage) return
    await onConfirm(toStage, note.trim() || undefined)
  }

  return (
    <Modal open={open} onClose={onClose} width={460} ariaLabel="Chuyển giai đoạn">
      <ModalHeader
        title="🔀 Chuyển giai đoạn"
        subtitle={
          <>
            Lead: <strong className="text-text">{lead.name}</strong> · hiện ở{' '}
            <strong className="text-text">{STAGE_LABEL[lead.current_stage]}</strong>
          </>
        }
        onClose={onClose}
      />
      <ModalBody className="space-y-3">
        <div>
          <label className="block text-[11px] text-text2 mb-1">Chuyển sang</label>
          <Select
            value={toStage === lead.current_stage ? '' : toStage}
            onChange={(e) => setToStage(e.target.value as LeadStage)}
            options={stageOptions}
            placeholder="-- Chọn giai đoạn --"
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-[11px] text-text2 mb-1">Ghi chú (tùy chọn)</label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Lý do chuyển giai đoạn..."
            rows={3}
          />
        </div>
        {toStage === 'enrolled' && (
          <div className="text-[11px] bg-mint/10 border border-mint/30 rounded-r p-2 text-mint">
            ✅ Đã đăng ký → backend sẽ tự sinh contact + payment skeleton.
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Hủy
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          loading={saving}
          disabled={toStage === lead.current_stage}
        >
          Xác nhận
        </Button>
      </ModalFooter>
    </Modal>
  )
}
