import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'
import { Spinner } from '@shared/components/ui/Spinner'

export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status)
  const hydrate = useAuthStore((s) => s.hydrate)
  const location = useLocation()

  useEffect(() => {
    if (status === 'idle') void hydrate()
  }, [status, hydrate])

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="min-h-screen grid place-items-center bg-bg">
        <Spinner size={32} className="text-accent" />
      </div>
    )
  }

  if (status === 'unauthenticated' || status === 'error') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
