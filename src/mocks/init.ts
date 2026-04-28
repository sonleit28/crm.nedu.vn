import { env } from '@shared/config/env'

export async function enableMocking(): Promise<void> {
  if (!env.ENABLE_MOCKING) return

  try {
    const { worker } = await import('./browser')

    // Race against a 4s timeout so a failed SW registration never hangs app boot
    await Promise.race([
      worker.start({ onUnhandledRequest: 'bypass', serviceWorker: { url: '/mockServiceWorker.js' } }),
      new Promise<void>((resolve) => setTimeout(resolve, 4000)),
    ])

    // eslint-disable-next-line no-console
    console.info(
      '%c[MSW] Mock enabled · persona: localStorage.setItem("mock_uid","u_founder|u_admin|u_consultant_minhtam")',
      'color:#0EA5E9;font-weight:bold',
    )
  } catch (e) {
    console.warn('[MSW] Worker failed to start — running without mock layer:', e)
  }
}
