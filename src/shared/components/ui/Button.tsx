import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-accent text-white hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100',
  secondary:
    'bg-card2 text-text border border-border hover:border-accent/40 hover:text-white',
  danger:
    'bg-red text-white hover:brightness-110 disabled:opacity-50',
  ghost:
    'bg-transparent text-text2 hover:text-text hover:bg-card2',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[12px]',
  md: 'h-9 px-4 text-[13px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const cls = [
    'inline-flex items-center justify-center gap-2 font-semibold rounded-r transition cursor-pointer select-none',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  ].join(' ')

  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  )
}
