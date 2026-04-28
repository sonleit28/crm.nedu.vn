import { Modal, ModalHeader, ModalBody, ModalFooter } from '@shared/components/ui/Modal'
import { Button } from '@shared/components/ui/Button'

interface AddContactModalProps {
  open: boolean
  onClose: () => void
}

export function AddContactModal({ open, onClose }: AddContactModalProps) {
  return (
    <Modal open={open} onClose={onClose} width={480} ariaLabel="Thêm contact">
      <ModalHeader title="＋ Thêm Contact" onClose={onClose} />
      <ModalBody>
        <div className="py-8 text-center text-[12px] text-text3 italic">
          Tính năng này sẽ có trong Phase 2.
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Đóng
        </Button>
      </ModalFooter>
    </Modal>
  )
}
