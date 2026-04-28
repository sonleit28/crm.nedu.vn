import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

interface SidebarNavItemProps {
  to: string
  icon: ReactNode
  label: string
  badge?: number
}

export function SidebarNavItem({ to, icon, label, badge }: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          'flex items-center gap-2.5 px-3 py-2 rounded-r text-[13px] transition',
          isActive
            ? 'bg-accent/10 text-accent font-semibold'
            : 'text-text2 hover:text-text hover:bg-card2/50',
        ].join(' ')
      }
    >
      <span className="text-base leading-none w-5 text-center">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-red text-white text-[10px] font-bold px-1.5 py-[1px] rounded-md min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </NavLink>
  )
}
