import type { ToastItem } from '@shared/stores/useToastStore'
import { useToastStore } from '@shared/stores/useToastStore'

const STYLE_BY_TYPE: Record<ToastItem['type'], { border: string; icon: string }> = {
  info: { border: 'var(--color-accent)', icon: 'ℹ️' },
  success: { border: 'var(--color-mint)', icon: '✓' },
  warn: { border: 'var(--color-amber)', icon: '🟡' },
  critical: { border: 'var(--color-red)', icon: '🔴' },
  error: { border: 'var(--color-red)', icon: '✕' },
}

export function Toast({ toast }: { toast: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss)
  const style = STYLE_BY_TYPE[toast.type]

  const handleClick = () => {
    if (!toast.onClick) {
      dismiss(toast.id)
      return
    }
    const keep = toast.onClick()
    if (!keep) dismiss(toast.id)
  }

  return (
    <div
      className="anim-toast cursor-pointer rounded-r2 bg-card border border-border p-3 pr-9 min-w-[320px] max-w-[420px] relative shadow-lg"
      style={{ borderLeft: `3px solid ${style.border}` }}
      onClick={handleClick}
      role="alert"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          dismiss(toast.id)
        }}
        className="absolute top-2 right-2 w-5 h-5 grid place-items-center text-text3 hover:text-text rounded"
        aria-label="Đóng"
      >
        ✕
      </button>
      <div className="flex items-start gap-2">
        <span className="text-base leading-none mt-[2px]">{style.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-text">{toast.title}</div>
          {toast.body && (
            <div className="text-[12px] text-text2 mt-1 leading-snug">{toast.body}</div>
          )}
          {toast.meta && (
            <div className="text-[11px] text-text3 mt-1">{toast.meta}</div>
          )}
        </div>
      </div>
    </div>
  )
}
