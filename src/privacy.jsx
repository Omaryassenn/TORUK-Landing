import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Privacy from '@/pages/Privacy'
import '@/styles/index.css'

/* Its own entry, for the reasons in `src/terms.jsx`. */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Privacy />
  </StrictMode>,
)
