import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { enterprise22ExpertProxy } from './server/enterprise22ExpertProxy.mjs'

const renderHost = 'wae-os-enterprice22.onrender.com'
const expertProxy=enterprise22ExpertProxy()
const safeExpertProxy={
  ...expertProxy,
  configureServer(server:any){expertProxy.configureServer?.(server)},
  configurePreviewServer(server:any){expertProxy.configurePreviewServer?.(server)},
}

export default defineConfig({
  plugins: [react(), safeExpertProxy],
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
