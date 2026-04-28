import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@routes': path.resolve(__dirname, './src/routes'),
    },
  },
  server: {
    port: Number(process.env.PORT) || 5173,
    host: true,
    strictPort: false,
  },
  build: {
    target: 'esnext',
  },
  esbuild: {
    target: 'esnext',
  },
})
