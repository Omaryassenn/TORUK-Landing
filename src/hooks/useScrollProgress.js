import { useEffect, useRef, useState } from 'react'

/**
 * Progress of a tall element through the viewport, 0 → 1.
 *
 * Used by the pinned sections: the outer element is several viewports tall and
 * holds a `sticky` panel, so "how far through the pin are we" is exactly how
 * far the outer element's top edge has travelled from the top of the viewport
 * to the point where its bottom edge reaches the bottom.
 *
 * Driven off `requestAnimationFrame` rather than the scroll event directly —
 * scroll fires far more often than the compositor paints, and every listener
 * here reads layout. One rAF per frame, shared, reads once and writes once.
 *
 * Returns 0 when the element is below the fold and 1 once it is above, so a
 * consumer can interpolate without guarding for the off-screen cases.
 */
export function useScrollProgress() {
  const ref = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    /* With motion reduced the value simply stays at its initial 0 — every
     * consumer already renders a sensible first frame from that, so there is
     * nothing to set and no listener to attach. */
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let last = -1

    const measure = () => {
      frame = 0
      const rect = node.getBoundingClientRect()
      /* Total scroll distance the pin covers: the element's height minus the
       * one viewport the sticky child occupies. */
      const travel = rect.height - window.innerHeight
      const next =
        travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel))

      /* Quantised to 1/1000 — below that the value cannot change a rendered
       * pixel, and skipping the setState avoids a render per frame while the
       * page is merely coasting. */
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
  }, [])

  return { ref, progress }
}
