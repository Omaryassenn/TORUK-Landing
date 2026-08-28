import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

/**
 * Inertial scrolling for the whole page.
 *
 * The browser's own `scroll-behavior: smooth` only eases *programmatic* jumps;
 * a wheel notch or a trackpad flick is still the platform's raw scroll, and
 * that is the thing the design wants eased. So this runs Lenis, which absorbs
 * the input and drives the real `scrollTop` on its own frame loop.
 *
 * Driving the *real* scroll position is the part that matters here: the reel's
 * pin and its growth are a `position: sticky` and a `view-timeline`, both read
 * straight off the document scroller, so they stay exactly in step with the
 * eased position for free. A transform-based fake scroller would have detached
 * both of them.
 *
 * @param {boolean} locked Freeze the scroller — the splash owns the page.
 */
export function useSmoothScroll(locked = false) {
  const lenis = useRef(null)

  useEffect(() => {
    /*
     * Reduced motion means no inertia at all: easing the page under someone
     * who asked for stillness is the whole class of thing that setting exists
     * to prevent. Native scrolling is left alone, and so is the `scroll-behavior`
     * fallback in the stylesheet.
     */
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const instance = new Lenis({
      /*
       * A shade under Lenis' own 1.2s default. The reel is pinned for a
       * viewport and a half, and a long tail there reads as the pin lagging
       * the cursor rather than as weight.
       */
      duration: 0.95,
      /* Ease-out-expo: nearly all the deceleration is in the first third. */
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      /*
       * Touch is left native. Phones already run inertia in the compositor and
       * a second one on top of it fights the first.
       */
      syncTouch: false,
      /* Takes over in-page jumps, which is what the stylesheet used to do. */
      anchors: true,
      /* Lenis owns its own rAF loop, so there is none to clean up here. */
      autoRaf: true,
    })

    lenis.current = instance
    return () => {
      instance.destroy()
      lenis.current = null
    }
  }, [])

  /*
   * Kept apart from the setup effect so the splash can lock and release the
   * page without tearing the scroller down and rebuilding it.
   */
  useEffect(() => {
    if (!lenis.current) return
    if (locked) lenis.current.stop()
    else lenis.current.start()
  }, [locked])
}
