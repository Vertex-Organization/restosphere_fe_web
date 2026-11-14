import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { legacyStaffUrl } from './routes/staffRouter'

// Staff workspaces moved under /staff (e.g. /kitchen → /staff/kitchen). Rewrite old
// bookmarks before the first render so the right app loads without a reload.
const moved = legacyStaffUrl(window.location.pathname + window.location.search + window.location.hash)
if (moved) window.history.replaceState(null, '', moved)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
