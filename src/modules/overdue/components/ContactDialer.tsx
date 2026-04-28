import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@shared/components/ui/Modal'
import { Button } from '@shared/components/ui/Button'
import { Textarea } from '@shared/components/ui/Input'
import { useLogContact } from '../hooks/useLogContact'
import { useToastStore } from '@shared/stores/useToastStore'

interface ContactDialerProps {
  open: boolean
  paymentId: string
  contactName: string
  contactPhone?: string
  onClose: () => void
}

export function ContactDialer({
  open,
  paymentId,
  contactName,
  contactPhone,
  onClose,
}: ContactDialerProps) {
  const [note, setNote] = useState('')
  const mut = useLogContact(paymentId)
  const push = useToastStore((s) => s.push)

  const handleSave = async () => {
    await mut.mutateAsync(note.trim() || undefined)
    push({ type: 'success', title: 'Đã ghi nhận cuộc gọi', ttl: 3500 })
    setNote('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} width={420} ariaLabel="Liên hệ học viên">
      <ModalHeader title="📞 Liên hệ học viên" subtitle={contactName} onClose={onClose} />
      <ModalBody className="space-y-3">
        {contactPhone && (
          <a
            href={`tel:${contactPhone}`}
            className="flex items-center gap-2 text-accent text-[14px] font-semibold hover:underline"
          >
            📞 {contactPhone}
          </a>
        )}
        <div>
          <label className="block text-[11px] text-text2 mb-1">Ghi chú cuộc gọi (tùy chọn)</label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nội dung cuộc gọi..."
            rows={3}
            autoFocus
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={mut.isPending}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSave} loading={mut.isPending}>
          Lưu cuộc gọi
        </Button>
      </ModalFooter>
    </Modal>
  )
}
