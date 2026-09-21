import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawBase = process.env.BASE_PATH ?? env.BASE_PATH ?? '/'
  const base = `/${rawBase.split('/').filter(Boolean).join('/')}${rawBase.split('/').filter(Boolean).length ? '/' : ''}`

  return {
    base,
    plugins: [react(), tailwindcss()],
    build: { target: 'es2022', sourcemap: false },
  }
})
