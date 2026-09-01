import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import './evolution.css'

const rootElement = document.getElementById('root')

function showStartupError(error: unknown) {
  if (!rootElement) return
  const message = error instanceof Error ? error.message : String(error)
  console.error('[WAE OS bootstrap]', error)
  rootElement.innerHTML = `
    <div style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#060913;color:#eef2ff;font-family:Inter,system-ui,sans-serif">
      <div style="width:min(520px,92vw);padding:28px;border:1px solid rgba(248,113,113,.24);border-radius:18px;background:#0d1220;box-shadow:0 25px 80px rgba(0,0,0,.35)">
        <div style="font-size:11px;color:#f87171;letter-spacing:.12em;font-weight:800;margin-bottom:8px">WAE OS · ARRANQUE PROTEGIDO</div>
        <h1 style="font-size:22px;margin:0 0 10px">La interfaz no pudo iniciar</h1>
        <p style="font-size:12px;line-height:1.6;color:#9ca3af;margin:0 0 14px">El servidor está activo, pero el navegador detectó un error al cargar la aplicación.</p>
        <pre style="white-space:pre-wrap;word-break:break-word;padding:12px;border-radius:10px;background:#070b14;color:#fca5a5;font-size:11px">${message.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c] ?? c))}</pre>
        <button onclick="location.reload()" style="margin-top:14px;border:0;border-radius:9px;padding:10px 14px;background:linear-gradient(135deg,#6d28d9,#4f46e5);color:white;font-weight:700">Reintentar</button>
      </div>
    </div>`
}

window.addEventListener('error', event => {
  if (event.error) showStartupError(event.error)
})

window.addEventListener('unhandledrejection', event => {
  showStartupError(event.reason)
})

if (!rootElement) {
  throw new Error('No se encontró el contenedor raíz de WAE OS.')
}

import('./App')
  .then(({ default: App }) => {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  })
  .catch(showStartupError)
