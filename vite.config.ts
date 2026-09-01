import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const renderHost = 'wae-os-enterprice22.onrender.com'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [renderHost],
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: [renderHost],
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
})
