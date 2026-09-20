import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
/*
 * react-toastify's stylesheet, imported here so that the one at the foot of
 * `index.css` — which puts its panels on this page's palette — is the later of
 * the two. Both are unlayered, so order is what decides between them.
 *
 * It has to be imported at all because the components come from the library's
 * `/unstyled` entry, which is the same components without the `<style>` it
 * otherwise appends to `<head>` at mount. That injection happens after every
 * stylesheet in the document, so with the ordinary entry the vendor rules are
 * always last and no override of ours can win on anything but specificity.
 */
import 'react-toastify/dist/ReactToastify.css'
import '@/styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
