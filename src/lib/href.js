/**
 * An in-page anchor, resolved for the page it is being rendered on.
 *
 * The navbar and the foot are shared by the landing page and by the documents
 * under it, and their links are written as bare fragments (`#platform`) because
 * on the landing page that is what they are: a scroll, eased by Lenis, with no
 * navigation and no reload. On any other page the same fragment points at a
 * section that is not there, and the link does nothing at all.
 *
 * So a page that is not the landing page passes its own base and the fragments
 * are resolved against it. `#platform` becomes `/#platform`, which loads the
 * landing page and lands on the section.
 *
 * Only fragments are touched. A path (`/terms/`) and an absolute URL
 * (`https://x.com/youxel`) already say where they go.
 */
export function resolveHref(href, base = '') {
  if (!base || !href?.startsWith('#')) return href
  return `${base}${href}`
}
