import { env } from '@shared/config/env'

export async function enableMocking(): Promise<void> {
  if (!env.ENABLE_MOCKING) return

  const { worker } = await import('./browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })

  // eslint-disable-next-line no-console
  console.info(
    '%c[MSW] Mock layer enabled · switch persona qua localStorage.setItem("mock_uid", "u_founder|u_admin|u_consultant_minhtam")',
    'color:#0EA5E9;font-weight:bold',
  )
}
