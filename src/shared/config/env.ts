export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  AUTH_CENTRAL_URL: import.meta.env.VITE_AUTH_CENTRAL_URL ?? 'http://localhost:4000',
  ENABLE_MOCKING: import.meta.env.VITE_ENABLE_MOCKING === 'true',
  GA4_ID: (import.meta.env.VITE_GA4_ID as string | undefined) ?? '',
  CLARITY_ID: (import.meta.env.VITE_CLARITY_ID as string | undefined) ?? '',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const
