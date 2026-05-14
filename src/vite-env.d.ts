/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_AUTH_CENTRAL_URL: string
  readonly VITE_ENABLE_MOCKING: string
  readonly VITE_GA4_ID?: string
  readonly VITE_CLARITY_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
