import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '@shared/types/auth'
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

  const denied = !user || !allow.includes(user.role)

  useEffect(() => {
    if (denied && user) {
      pushToast({
        type: 'warn',
        title: 'Không có quyền',
        body: `Bạn không có quyền truy cập ${location.pathname}`,
        ttl: 4000,
      })
    }
  }, [denied, user, location.pathname, pushToast])

  if (denied) return <Navigate to={fallback} replace />
  return <Outlet />
}
