import { useEffect, useState } from 'react'

/**
 * True while any element matching `selectors` overlaps the top strip of the
 * viewport — roughly the band the fixed navbar occupies.
 *
 * `rootMargin` shrinks the root to that strip, so the observer reports only
 * the two crossings that matter and stays silent on every frame between them.
 * A scroll listener would have to run each frame to answer the same question,
 * and this is read while the page is scrolling.
 *
 * The strip is the top tenth rather than a zero-height line: a root collapsed
 * to `-100%` has no area for anything to intersect, so nothing ever reports.
 * A tenth is close enough to the bar's own height at every tier to mean "this
 * section is under the navbar" and has real area to cross.
 *
 * Elements are looked up by selector rather than handed in as refs: this runs
 * in the navbar and the sections it watches are inside `main`, two subtrees
 * whose only common ancestor is the page. Pass a module-level constant, not an
 * inline array, or the effect tears down and re-runs on every render.
 */
export function useAtViewportTop(selectors) {
  const [atTop, setAtTop] = useState(false)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const nodes = selectors
      .map((selector) => document.querySelector(selector))
      .filter(Boolean)
    if (!nodes.length) return

    /*
     * The sections are adjacent, so at the seam between them both can be in
     * the strip for a frame. Tracking which ones are in it, rather than the
     * last entry's own flag, is what keeps the answer from flickering off as
     * one hands over to the next.
     */
    const inStrip = new Set()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inStrip.add(entry.target)
          else inStrip.delete(entry.target)
        }
        setAtTop(inStrip.size > 0)
      },
      { rootMargin: '0px 0px -90% 0px' },
    )

    for (const node of nodes) observer.observe(node)
    return () => observer.disconnect()
  }, [selectors])

  return atTop
}
