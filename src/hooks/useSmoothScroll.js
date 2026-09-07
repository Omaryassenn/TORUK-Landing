import { useCallback, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { useHashAnchors } from '@/hooks/useHashAnchors'

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
  /* Whether the fragment the page was opened at has been honoured. */
  const landed = useRef(false)

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
      /*
       * In-page jumps are handled by `useHashAnchors` below instead.
       *
       * Lenis' own anchor handling eases the jump but still lets the hash be
       * pushed, so every nav click left a history entry and back walked the
       * reader up the page one section at a time rather than off it. The hook
       * eases the same jump and writes the hash with `replaceState`.
       */
      anchors: false,
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
   * How the hook below moves the page: through Lenis where there is one, so the
   * jump is eased on the same scroller the wheel is, and instantly where there
   * is not. Reduced motion is the case with no Lenis, and the platform's own
   * instant scroll is the correct behaviour there.
   *
   * `force` because the scroller is stopped while the splash is up, and a jump
   * a reader has just asked for should still land.
   */
  const scrollTo = useCallback((top) => {
    if (lenis.current) lenis.current.scrollTo(top, { force: true })
    else window.scrollTo({ top, behavior: 'auto' })
  }, [])

  useHashAnchors(scrollTo)

  /*
   * Kept apart from the setup effect so the splash can lock and release the
   * page without tearing the scroller down and rebuilding it.
   */
  useEffect(() => {
    if (!lenis.current) return
    if (locked) lenis.current.stop()
    else lenis.current.start()
  }, [locked])

  /*
   * Land on the fragment the page was opened at.
   *
   * The browser does this itself on load, and on this page it does not stick:
   * the splash locks `overflow` while it runs, so the jump is discarded and the
   * reader is left at the top. That is what sent every link from the legal
   * pages to the hero. The splash now stands down for a deep link, and this
   * puts the reader where they asked to be once the scroller is live.
   *
   * The offset is read off the target's own `scroll-margin-top` rather than
   * restated here, so it stays whatever the stylesheet says it is: a section
   * landing under the navbar is the same requirement as for any other jump.
   *
   * Once only, and never again: after this the reader owns the scroll position,
   * and `locked` flips whenever the splash does.
   */
  useEffect(() => {
    if (locked || landed.current) return
    landed.current = true

    const hash = window.location.hash
    if (hash.length < 2) return

    let target = null
    try {
      target = document.querySelector(hash)
    } catch {
      /* A fragment that is not a valid selector is not one of ours. */
    }
    if (!target) return

    /* Where this last put the page, so it can tell its own work from the reader's. */
    let placed = -1

    const land = () => {
      /*
       * The reader has taken over. Everything below is a correction to a
       * position they have since moved off, so there is nothing left to
       * correct.
       */
      if (placed >= 0 && Math.abs(window.scrollY - placed) > 2) return

      /*
       * Measured and applied here rather than inside a frame callback: a tab
       * opened in the background never runs one, and the reader would come
       * back to the top of the page. Reading the rect forces the layout this
       * needs anyway.
       */
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - margin)

      placed = Math.round(top)
      window.scrollTo({ top, behavior: 'auto' })
      /* And through Lenis, so its own idea of the position agrees. */
      lenis.current?.scrollTo(top, { immediate: true, force: true })
    }

    land()

    /*
     * Web fonts and late images change the height of everything above the
     * target, so the position is asserted again as each settles. Both are
     * no-ops once the reader has scrolled.
     */
    document.fonts?.ready.then(land).catch(() => {})
    window.addEventListener('load', land, { once: true })

    return () => window.removeEventListener('load', land)
  }, [locked])
}
