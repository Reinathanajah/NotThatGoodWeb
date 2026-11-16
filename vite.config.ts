import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const parsedPort = Number(env.VITE_PORT)
  const port = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 5173
  const apiProxyTarget = env.VITE_BACKEND_ORIGIN || 'http://localhost:3001'

  return {
    plugins: [react()],
    envPrefix: 'VITE_',
    server: {
      port,
      strictPort: false,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 4173,
    },
    build: {
      sourcemap: mode !== 'production',
    },
  }
})
