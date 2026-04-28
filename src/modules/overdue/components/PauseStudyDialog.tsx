import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@shared/components/ui/Modal'
import { Button } from '@shared/components/ui/Button'
import { Textarea } from '@shared/components/ui/Input'
import { usePauseStudy } from '../hooks/usePauseStudy'
import { useToastStore } from '@shared/stores/useToastStore'

interface PauseStudyDialogProps {
  open: boolean
  paymentId: string
  contactName: string
  onClose: () => void
}

export function PauseStudyDialog({
  open,
  paymentId,
  contactName,
  onClose,
}: PauseStudyDialogProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)
  const mut = usePauseStudy(paymentId)
  const push = useToastStore((s) => s.push)

  const handleClose = () => {
    setStep(1)
    setReason('')
    setReasonError(null)
    onClose()
  }

  const handleConfirmStep2 = async () => {
    if (reason.trim().length < 20) {
      setReasonError('Lý do phải có ít nhất 20 ký tự.')
      return
    }
    setReasonError(null)
    await mut.mutateAsync(reason.trim())
    push({ type: 'success', title: `Đã tạm dừng học của ${contactName}`, ttl: 4000 })
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} width={440} ariaLabel="Tạm dừng học">
      {step === 1 ? (
        <>
          <ModalHeader title="⏸ Tạm dừng học" onClose={handleClose} />
          <ModalBody>
            <p className="text-[13px] text-text2">
              Bạn có chắc chắn muốn tạm dừng học của{' '}
              <strong className="text-text">{contactName}</strong>?
            </p>
            <p className="text-[12px] text-text3 mt-2">
              Hành động này sẽ được ghi lại và cần lý do ở bước tiếp theo.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={handleClose}>
              Hủy
            </Button>
            <Button variant="danger" onClick={() => setStep(2)}>
              Xác nhận →
            </Button>
          </ModalFooter>
        </>
      ) : (
        <>
          <ModalHeader title="⏸ Nhập lý do tạm dừng" onClose={handleClose} />
          <ModalBody className="space-y-3">
            <p className="text-[12px] text-text2">
              Học viên: <strong className="text-text">{contactName}</strong>
            </p>
            <div>
              <label className="block text-[11px] text-text2 mb-1">
                Lý do tạm dừng <span className="text-red">*</span> (ít nhất 20 ký tự)
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Mô tả lý do tạm dừng học..."
                rows={4}
                autoFocus
              />
              {reasonError && (
                <div className="text-[11px] text-red mt-1">{reasonError}</div>
              )}
              <div className="text-[10px] text-text3 mt-1">{reason.trim().length}/20 ký tự tối thiểu</div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setStep(1)} disabled={mut.isPending}>
              Quay lại
            </Button>
            <Button variant="danger" onClick={handleConfirmStep2} loading={mut.isPending}>
              Tạm dừng
            </Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  )
}
