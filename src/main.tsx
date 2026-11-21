import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { markAppRuntimeReady } from './appProgress'
import { legacyStaffUrl } from './routes/staffRouter'

// Staff workspaces moved under /staff (e.g. /kitchen → /staff/kitchen). Rewrite old
// bookmarks before the first render so the right app loads without a reload.
const moved = legacyStaffUrl(
  window.location.pathname + window.location.search + window.location.hash,
)
if (moved) window.history.replaceState(null, '', moved)

markAppRuntimeReady()
try {
  sessionStorage.removeItem('restosphere.bootstrap-retry-at')
} catch {
  // Storage can be unavailable in restrictive browsing modes.
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
