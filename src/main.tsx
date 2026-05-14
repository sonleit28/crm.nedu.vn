import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRouter } from '@routes/index'
import { enableMocking } from '@/mocks/init'
import { analytics } from '@shared/analytics'
import './index.css'

await enableMocking()
analytics.init()

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('#root element missing')

createRoot(rootEl).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
