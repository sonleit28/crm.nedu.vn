import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '@shared/types/auth'
import { isFinanceViewerOnly } from '@shared/types/auth'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'
import { useToastStore } from '@shared/stores/useToastStore'

interface RoleGateProps {
  allow: ReadonlyArray<Role>
  /** Redirect to this path on deny. Default `/dashboard`. */
  fallback?: string
}

export function RoleGate({ allow, fallback = '/dashboard' }: RoleGateProps) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const pushToast = useToastStore((s) => s.push)

  const denied =
    !user || !user.roles.some((r) => (allow as readonly string[]).includes(r))

  // Finance-only viewer bị deny ở bất kỳ route nào → về thẳng /finance, không
  // toast (phòng trường hợp route đổi cấu trúc khiến họ lọt qua RoleGate trần).
  const financeOnly = isFinanceViewerOnly(user)

  useEffect(() => {
    if (denied && user && !financeOnly) {
      pushToast({
        type: 'warn',
        title: 'Không có quyền',
        body: `Bạn không có quyền truy cập ${location.pathname}`,
        ttl: 4000,
      })
    }
  }, [denied, user, financeOnly, location.pathname, pushToast])

  if (denied) {
    return <Navigate to={financeOnly ? '/finance' : fallback} replace />
  }
  return <Outlet />
}

/**
 * Landing redirect: finance-only viewer → /finance, còn lại → /dashboard.
 * Dùng cho route index + 404 fallback.
 */
export function HomeRedirect() {
  const user = useAuthStore((s) => s.user)
  const to = isFinanceViewerOnly(user) ? '/finance' : '/dashboard'
  return <Navigate to={to} replace />
}

/**
 * Chặn finance-only viewer khỏi phần workbench chung (dashboard/pipeline/
 * contacts/analytics) — đẩy họ về /finance. Các role khác đi qua bình thường.
 */
export function BlockFinanceViewer() {
  const user = useAuthStore((s) => s.user)
  if (isFinanceViewerOnly(user)) return <Navigate to="/finance" replace />
  return <Outlet />
}
