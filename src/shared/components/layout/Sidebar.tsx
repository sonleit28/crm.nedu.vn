import { SidebarNavItem } from './SidebarNavItem'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'
import { useOverdueBadgeStore } from '@shared/stores/useOverdueBadgeStore'
import { logoutFromCentral } from '@shared/config/auth-central-client'
import { useNavigate } from 'react-router-dom'

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-text3 px-3 mb-2">
        {title}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const overdueCount = useOverdueBadgeStore((s) => s.count)
  const navigate = useNavigate()

  const isAdminOrFounder = user?.role === 'admin' || user?.role === 'founder'

  const initials = user?.name
    ?.split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(-2)
    .join('')
    .toUpperCase() ?? '?'

  const roleLabel =
    user?.role === 'founder'
      ? 'Founder'
      : user?.role === 'admin'
        ? 'Admin'
        : user?.role === 'consultant'
          ? 'Sale viên'
          : ''

  const handleLogout = async () => {
    await logoutFromCentral()
    useAuthStore.getState().clear()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[240px] bg-bg2 border-r border-border flex flex-col"
      aria-label="Sidebar"
    >
      {/* Logo */}
      <div className="px-4 pt-4 pb-5 flex items-center gap-2.5 border-b border-border">
        <div className="w-9 h-9 grid place-items-center rounded-r bg-accent text-white font-extrabold text-lg">
          N
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-bold text-text">N-Education</div>
          <div className="text-[10px] uppercase tracking-wider text-text3">CRM System</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <NavSection title="Quản lý">
          <SidebarNavItem to="/dashboard" icon="📊" label="Tổng quan" />
          <SidebarNavItem to="/pipeline" icon="🔀" label="Tư vấn" />
          <SidebarNavItem to="/contacts" icon="👥" label="Khách hàng" />
        </NavSection>

        <NavSection title="Tài chính">
          {isAdminOrFounder && (
            <SidebarNavItem to="/finance" icon="💰" label="Tổng quan" />
          )}
          <SidebarNavItem
            to="/overdue"
            icon="🔴"
            label="Quá hạn"
            badge={overdueCount}
          />
        </NavSection>

        {isAdminOrFounder && (
          <NavSection title="Phân tích">
            <SidebarNavItem to="/analytics" icon="📈" label="Phân tích" />
          </NavSection>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-border px-3 py-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-accent/20 grid place-items-center text-accent font-bold text-[12px]">
          {initials}
        </div>
        <div className="flex-1 min-w-0 leading-tight">
          <div className="text-[12px] font-semibold text-text truncate">{user?.name ?? '—'}</div>
          <div className="text-[10px] text-text3 truncate">{roleLabel}</div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-text3 hover:text-text w-7 h-7 grid place-items-center rounded hover:bg-card2"
          aria-label="Đăng xuất"
          title="Đăng xuất"
        >
          ⎋
        </button>
      </div>
    </aside>
  )
}
