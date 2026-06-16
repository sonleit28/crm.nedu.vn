import { SidebarNavItem } from './SidebarNavItem'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'
import { isFinanceViewerOnly } from '@shared/types/auth'
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
  const navigate = useNavigate()

  const userRoles = user?.roles ?? []
  const isAdminOrFounder = userRoles.some(
    (r) => r === 'admin' || r === 'founder' || r === 'owner',
  )
  const financeOnly = isFinanceViewerOnly(user)

  const initials =
    user?.full_name
      ?.split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(-2)
      .join('')
      .toUpperCase() ?? '?'

  // Highest-tier label nếu user nhiều roles (vd 'iam_manager' + 'admin'
  // → hiển thị 'Admin'). Priority: founder > owner > admin > leader > consultant.
  const roleLabel = userRoles.includes('founder')
    ? 'Founder'
    : userRoles.includes('owner')
      ? 'Owner'
      : userRoles.includes('admin')
        ? 'Admin'
        : userRoles.includes('leader')
          ? 'Leader'
          : userRoles.includes('consultant')
            ? 'Sale viên'
            : financeOnly
              ? 'Xem tài chính'
              : userRoles[0] // fallback hiển thị role đầu tiên (vd 'iam_manager')
              ? userRoles[0].charAt(0).toUpperCase() + userRoles[0].slice(1)
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
        {financeOnly ? (
          // Finance-only viewer: chỉ thấy đúng mục Tài chính.
          <NavSection title="Tài chính">
            <SidebarNavItem to="/finance" icon="💰" label="Tổng quan" />
          </NavSection>
        ) : (
          <>
            <NavSection title="Quản lý">
              <SidebarNavItem to="/dashboard" icon="📊" label="Tổng quan" />
              <SidebarNavItem to="/pipeline" icon="🔀" label="Tư vấn" />
              <SidebarNavItem to="/contacts" icon="👥" label="Khách hàng" />
            </NavSection>

            {isAdminOrFounder && (
              <NavSection title="Tài chính">
                <SidebarNavItem to="/finance" icon="💰" label="Tổng quan" />
              </NavSection>
            )}

            {isAdminOrFounder && (
              <NavSection title="Phân tích">
                <SidebarNavItem to="/analytics" icon="📈" label="Phân tích" />
              </NavSection>
            )}
          </>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-border px-3 py-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-accent/20 grid place-items-center text-accent font-bold text-[12px]">
          {initials}
        </div>
        <div className="flex-1 min-w-0 leading-tight">
          <div className="text-[12px] font-semibold text-text truncate">{user?.full_name ?? '—'}</div>
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
