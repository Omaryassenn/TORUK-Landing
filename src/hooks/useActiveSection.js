import { useEffect, useState } from 'react'

/**
 * Which of `selectors` the reader is currently inside, as its `#id`.
 *
 * A band across the upper third of the viewport, and whatever is crossing it
 * is what the reader is reading. IntersectionObserver rather than a scroll
 * listener for the same reason the navbar's pose uses one: this is read while
 * the page is moving, and a listener would have to run on every frame to
 * answer a question that only changes a handful of times per page.
 *
 * The band is thin on purpose. A "which section is most visible" version has
 * to measure every candidate on every callback and still flickers at the seam
 * between two of them; a line the sections cross one at a time cannot.
 *
 * When nothing is crossing it the last answer stands. There are gaps in the
 * page where that matters: the Mindset section is not in the nav, and neither
 * is the footer, and a nav that went blank over each of them would read as
 * broken rather than as honest.
 *
 * Pass a module-level constant, not an inline array, or the effect tears down
 * and re-runs on every render.
 *
 * @param {string[]} selectors In-page anchors to watch, any of which may not exist yet.
 * @param {string|null} initial What is current before the observer first reports.
 * @param {string} [rootMargin] Where the band sits. The default puts it a third
 *   of the way down, which is where a reader of the landing page is looking. A
 *   document wants it higher: its last section is short, and an anchor jump
 *   lands a short section between the navbar and a band that low, so nothing
 *   crosses it and the contents list keeps marking whatever it saw last.
 */
export function useActiveSection(
  selectors,
  initial = null,
  rootMargin = '-30% 0px -65% 0px',
) {
  const [active, setActive] = useState(initial)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    /*
     * Anchors in the nav that nothing on the page answers to are simply not
     * watched. The nav lists `#usecases` before that section exists, and a
     * missing target should cost nothing rather than throw.
     */
    const nodes = selectors
      .map((selector) => document.querySelector(selector))
      .filter(Boolean)
    if (!nodes.length) return

    /*
     * Document order, taken from the document rather than from the order the
     * hrefs were passed in. The two agree today because the nav is written in
     * page order, and this is what keeps the choice below correct on the day
     * they stop agreeing.
     */
    nodes.sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    )

    const crossing = new Set()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target)
          else crossing.delete(entry.target)
        }

        /*
         * The last one in document order, not the first.
         *
         * At the seam between two sections both are on the line for a moment:
         * the one above is leaving through the top of the band and the one
         * below has just entered through the bottom. The lower one is the one
         * filling the rest of the screen, so it is the one being read.
         */
        let current = null
        for (const node of nodes) if (crossing.has(node)) current = node

        if (current) setActive(`#${current.id}`)
      },
      /*
       * By default a band from 30% to 35% of the viewport: high enough to
       * change over before a section is done with the screen, low enough that
       * it is under the navbar rather than behind it. Callers with a different
       * reading position pass their own.
       */
      { rootMargin },
    )

    for (const node of nodes) observer.observe(node)
    return () => observer.disconnect()
  }, [selectors, rootMargin])

  return active
}
