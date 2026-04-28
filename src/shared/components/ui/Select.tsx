import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: ReadonlyArray<{ value: string; label: string }>
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, placeholder, className = '', ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={[
        'h-9 px-3 pr-8 rounded-r bg-card2 border border-border text-[13px] text-text outline-none',
        'focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition cursor-pointer',
        className,
      ].join(' ')}
      {...rest}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
})
