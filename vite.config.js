import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// `npm run dev` forwards /api to a running API. By default that is a Flask app
// on your own laptop. To use the live server instead, start it like this:
//   API_TARGET=http://43.173.8.197:808X npm run dev
// In production nginx answers /api/ itself, so none of this is used.
const apiTarget = process.env.API_TARGET || 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': { target: apiTarget, changeOrigin: true } },
  },
  test: { environment: 'jsdom' },
})
