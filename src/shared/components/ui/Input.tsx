import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const BASE =
  'w-full rounded-r bg-card2 border border-border text-[13px] text-text placeholder:text-text3 px-3 py-2 outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition disabled:opacity-50'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...rest }, ref) {
    return <input ref={ref} className={[BASE, className].join(' ')} {...rest} />
  },
)

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = '', rows = 4, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={[BASE, 'resize-y', className].join(' ')}
      {...rest}
    />
  )
})
