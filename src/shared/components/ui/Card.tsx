import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  borderColor?: string
}

const PAD_MAP = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
} as const

export function Card({
  children,
  padding = 'md',
  borderColor,
  className = '',
  style,
  ...rest
}: CardProps) {
  const cls = [
    'bg-card border border-border rounded-r2',
    PAD_MAP[padding],
    className,
  ].join(' ')

  return (
    <div
      className={cls}
      style={borderColor ? { ...style, borderColor } : style}
      {...rest}
    >
      {children}
    </div>
  )
}
