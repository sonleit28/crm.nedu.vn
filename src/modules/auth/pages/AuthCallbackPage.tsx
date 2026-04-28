import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'
import { Spinner } from '@shared/components/ui/Spinner'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const acceptTokens = useAuthStore((s) => s.acceptTokens)

  useEffect(() => {
    const fragment = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash
    const params = new URLSearchParams(fragment)
    const access = params.get('access_token')
    const refresh = params.get('refresh_token')

    if (!access || !refresh) {
      navigate('/login?error=callback_failed', { replace: true })
      return
    }

    acceptTokens({ access_token: access, refresh_token: refresh })
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => navigate('/login?error=callback_failed', { replace: true }))
  }, [acceptTokens, navigate])

  return (
    <div className="min-h-screen grid place-items-center bg-bg">
      <div className="flex flex-col items-center gap-3 text-text2">
        <Spinner size={32} className="text-accent" />
        <div className="text-[12px]">Đang xác thực...</div>
      </div>
    </div>
  )
}
