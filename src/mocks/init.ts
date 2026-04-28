import { env } from '@shared/config/env'

async function _startWorker(): Promise<void> {
  try {
    const { worker } = await import('./browser')
    await worker.start({ onUnhandledRequest: 'bypass', serviceWorker: { url: '/mockServiceWorker.js' } })
    // eslint-disable-next-line no-console
    console.info(
      '%c[MSW] Mock enabled · persona: localStorage.setItem("mock_uid","u_founder|u_admin|u_consultant_minhtam")',
      'color:#0EA5E9;font-weight:bold',
    )
  } catch (e) {
    console.warn('[MSW] Worker failed to start — running without mock layer:', e)
  }
}

export async function enableMocking(): Promise<void> {
  if (!env.ENABLE_MOCKING) return

  // Hard 5 s deadline covers BOTH dynamic import hang AND worker.start() hang
  await Promise.race([
    _startWorker(),
    new Promise<void>((resolve) => setTimeout(resolve, 5000)),
  ])
}
