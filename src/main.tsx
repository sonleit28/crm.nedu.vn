import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppRouter } from '@routes/index'
import { enableMocking } from '@/mocks/init'
import './index.css'

await enableMocking()

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('#root element missing')

createRoot(rootEl).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
