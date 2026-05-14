import { useEffect, type MouseEvent, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Width in px. Default 480. */
  width?: number
  /** ARIA label for the dialog. */
  ariaLabel?: string
}

export function Modal({ open, onClose, children, width = 480, ariaLabel }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const onBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      onClick={onBackdrop}
      className="anim-fade fixed inset-0 z-[900] grid place-items-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        className="w-full bg-card border border-border rounded-r3 shadow-xl max-h-[92vh] overflow-y-auto"
        style={{ maxWidth: `${width}px` }}
      >
        {children}
      </div>
    </div>
  )
}

interface ModalHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  onClose: () => void
}

export function ModalHeader({ title, subtitle, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-border">
      <div>
        <h3 className="text-[16px] font-bold text-text leading-tight">{title}</h3>
        {subtitle && <div className="text-[12px] text-text2 mt-1 leading-relaxed">{subtitle}</div>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-text3 hover:text-text w-7 h-7 grid place-items-center rounded hover:bg-card2"
        aria-label="Đóng"
      >
        ✕
      </button>
    </div>
  )
}

export function ModalBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-card2/30">
      {children}
    </div>
  )
}
