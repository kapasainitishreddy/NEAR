import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initNative } from './native.js'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>
)

// Native bootstrap (status bar / splash) — no-op on the web.
initNative()

// Register the service worker for offline PWA support in the browser only.
// Native builds (Capacitor) bundle assets locally, so the SW is skipped there.
const isCapacitor = !!(window.Capacitor && window.Capacitor.isNativePlatform?.())
if (!isCapacitor && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      /* offline support is optional; ignore failures */
    })
  })
}
