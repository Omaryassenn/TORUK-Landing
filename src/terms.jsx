import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Terms from '@/pages/Terms'
import '@/styles/index.css'

/*
 * The terms page is its own Vite entry rather than a route.
 *
 * The site is one landing page and one document; a router would be a
 * dependency, a bundle and a history model bought to serve a single link in
 * the footer. Two HTML entries give `/terms/` a real URL that any static host
 * serves without a rewrite rule, and the document is not carried in the
 * landing page's bundle.
 *
 * There is no smooth scroller here on purpose. Lenis eases the page for the
 * landing page's pinned sections; a document is read by dragging a scrollbar
 * and using find-in-page, and inertia fights both.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Terms />
  </StrictMode>,
)
