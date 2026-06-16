import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@modules/auth/stores/useAuthStore'
import { redirectToGoogleLogin } from '@shared/config/auth-central-client'
import { env } from '@shared/config/env'
import { Spinner } from '@shared/components/ui/Spinner'

const MOCK_PERSONAS = [
  { id: 'u_founder', label: '👑 Founder · Lê Thảo Nhi' },
  { id: 'u_admin', label: '🔑 Admin Demo' },
  { id: 'u_consultant_minhtam', label: '🧑‍💼 Sale · Minh Tâm' },
] as const

export function LoginPage() {
  const status = useAuthStore((s) => s.status)
  const error = useAuthStore((s) => s.error)
  const hydrate = useAuthStore((s) => s.hydrate)
  const [searchParams] = useSearchParams()
  const callbackError = searchParams.get('error')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'idle') void hydrate()
  }, [status, hydrate])

  // '/' → HomeRedirect chọn landing theo role (finance-only → /finance).
  if (status === 'authenticated') return <Navigate to="/" replace />

  const handleGoogle = () => {
    setSubmitting(true)
    redirectToGoogleLogin('/auth-callback')
  }

  const handleMock = (uid: string) => {
    localStorage.setItem('mock_uid', uid)
    // mock branch: bypass redirect, hydrate immediately with seeded token
    void hydrate()
  }

  return (
    <div className="min-h-screen grid place-items-center bg-bg p-6">
      <div className="w-full max-w-[400px] anim-fade">
        <div className="bg-card border border-border rounded-r3 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 grid place-items-center rounded-r2 bg-accent text-white font-extrabold text-xl">
              N
            </div>
            <div>
              <div className="text-[15px] font-bold text-text">N-Education</div>
              <div className="text-[11px] uppercase tracking-wider text-text3">
                CRM Hệ thống quản lý lifecycle
              </div>
            </div>
          </div>

          <h1 className="text-[22px] font-bold text-text mb-1">Đăng nhập</h1>
          <p className="text-[12px] text-text2 leading-relaxed mb-6">
            Sử dụng tài khoản Google Workspace của Nedu để vào hệ thống.
          </p>

          {(callbackError || error) && (
            <div className="mb-4 p-3 rounded-r bg-red/10 border border-red/30 text-red text-[12px]">
              {callbackError === 'callback_failed'
                ? 'Đăng nhập thất bại. Vui lòng thử lại.'
                : error ?? 'Có lỗi xảy ra.'}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting}
            className="w-full h-11 rounded-r bg-white text-[#1F2937] font-semibold text-[13px] hover:brightness-95 transition disabled:opacity-60 inline-flex items-center justify-center gap-3"
          >
            {submitting ? <Spinner size={18} /> : <span>🔐</span>}
            <span>Đăng nhập với Google</span>
          </button>

          {env.ENABLE_MOCKING && (
            <div className="mt-6">
              <div className="text-[10px] uppercase tracking-wider text-text3 mb-2">
                Dev mock · chọn persona
              </div>
              <div className="flex flex-col gap-2">
                {MOCK_PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleMock(p.id)}
                    className="text-left h-9 px-3 rounded-r bg-card2 border border-border text-[12px] text-text hover:border-accent/40 transition"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-[11px] text-text3">
            Cần truy cập? Liên hệ{' '}
            <a className="text-accent hover:underline" href="mailto:admin@nedu.vn">
              admin@nedu.vn
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
