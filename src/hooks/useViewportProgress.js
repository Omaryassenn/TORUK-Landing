import { useEffect, useState } from 'react'

/**
 * How far the page has scrolled across the first `viewports` screens, 0 → 1.
 *
 * The stacking hero needs "how much of me is covered yet", and because the hero
 * is `sticky` its own bounding rect stops moving — `useScrollProgress` measures
 * an element's travel and would read 0 forever. This measures the document
 * instead, which is the right frame of reference for anything pinned to the top
 * of the viewport.
 *
 * rAF-throttled for the same reason as `useScrollProgress`: scroll fires far
 * more often than the compositor paints.
 */
export function useViewportProgress(viewports = 1) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    /* With motion reduced the hero simply never recedes — the covering section
     * still slides over it, which is a scroll position, not an animation. */
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let last = -1

    const measure = () => {
      frame = 0
      const travel = window.innerHeight * viewports
      const next = travel <= 0 ? 0 : Math.min(1, window.scrollY / travel)

      /* Quantised — below 1/1000 the value cannot move a pixel, so skipping the
       * setState saves a render per frame while the page merely coasts. */
      const rounded = Math.round(next * 1000) / 1000
      if (rounded !== last) {
        last = rounded
        setProgress(rounded)
      }
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [viewports])

  return progress
}
