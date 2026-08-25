import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { SplashContext } from '@/components/splash/context'

/**
 * The splash is a shared-element (FLIP) hand-off, not a screen that fades into
 * another screen: the wordmark the visitor watches load *is* the header's
 * wordmark, parked in the middle of the viewport by a transform and released
 * back to its own layout position when loading finishes. Nothing is duplicated,
 * so it can't drift out of alignment and it can't shift the page — the header
 * has been sitting in its final position the whole time, under an opaque layer.
 *
 * The provider owns the choreography and writes the logo's transform directly.
 * React state here only carries the coarse phase, so the per-frame work (the
 * progress fill and its readout) never re-renders the tree.
 */

/** Once per tab. Section links don't remount the app, reloads shouldn't replay. */
const SEEN_KEY = 'toruk:splash-seen'

/*
 * Milliseconds. The sequence is budgeted to land under 2.5s end to end:
 * enter 380, progress ~1150, hold 200, then the flight starts 150ms into the
 * progress fade-out and runs 820 — about 2.3s, with the page reveal running
 * underneath the flight rather than after it. The two fades the splash layer
 * owns (its own opacity, and the progress bar's) are declared in Splash.jsx.
 */
const T = {
  enter: 380,
  progressIn: 200,
  minLoad: 950,
  maxLoad: 2400,
  hold: 200,
  moveDelay: 150,
  move: 820,
  chromeDelay: 150,
  contentDelay: 260,
  reducedOut: 260,
}

/** Site easing for the entrance; a symmetric power3-style curve for the flight. */
const EASE_ENTER = 'cubic-bezier(0.16, 1, 0.3, 1)'
const EASE_MOVE = 'cubic-bezier(0.76, 0, 0.24, 1)'

/** How much of the fill is withheld until the page has actually finished. */
const PENDING_CEILING = 0.92
/**
 * Per-frame approach rate — the whole easing of the bar comes from this. The
 * fill trails a linear target, so it reads as a steady climb that settles into
 * the last few percent rather than stopping dead on 100.
 */
const LERP = 0.15

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}

function shouldPlay() {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(SEEN_KEY) !== '1'
  } catch {
    return true
  }
}

/**
 * Delta from the logo's own layout box to the splash slot. Read untransformed,
 * so the flight always ends on `transform: none` and lands pixel-exact on the
 * position the header would have given it anyway.
 */
function measure(logo, slot) {
  logo.style.transition = 'none'
  logo.style.transform = 'none'
  const from = logo.getBoundingClientRect()
  const to = slot.getBoundingClientRect()
  if (!from.width || !to.width) return null
  return {
    dx: to.left + to.width / 2 - (from.left + from.width / 2),
    dy: to.top + to.height / 2 - (from.top + from.height / 2),
    scale: to.width / from.width,
  }
}

const transformFor = (g, factor = 1) =>
  `translate3d(${g.dx}px, ${g.dy}px, 0) scale(${g.scale * factor})`

/** Hands the lockup back to the stylesheet once the flight is over. */
function clearLogo(logo) {
  logo.style.transition = ''
  logo.style.transform = ''
  logo.style.opacity = ''
  logo.style.willChange = ''
}

/** Resolves once fonts and subresources are in — the real thing being waited on. */
function whenLoaded() {
  const waits = []
  if (document.readyState !== 'complete') {
    waits.push(
      new Promise((resolve) => window.addEventListener('load', resolve, { once: true })),
    )
  }
  if (document.fonts?.ready) waits.push(document.fonts.ready)
  return Promise.all(waits).catch(() => {})
}

export function SplashProvider({ children }) {
  const [reduced, setReduced] = useState(prefersReducedMotion)
  const [phase, setPhase] = useState(() => (shouldPlay() ? 'enter' : 'done'))
  const [staged, setStaged] = useState(false)
  const [chromeVisible, setChromeVisible] = useState(() => !shouldPlay())
  const [contentReady, setContentReady] = useState(() => !shouldPlay())

  const [logo, setLogo] = useState(null)
  const [slot, setSlot] = useState(null)
  const barRef = useRef(null)
  const percentRef = useRef(null)

  const registerLogo = useCallback((node) => setLogo(node), [])
  const registerSlot = useCallback((node) => setSlot(node), [])
  const registerBar = useCallback((node) => {
    barRef.current = node
  }, [])
  const registerPercent = useCallback((node) => {
    percentRef.current = node
  }, [])

  /* Fixed for the lifetime of the provider: whether this mount plays at all. */
  const playsRef = useRef(phase !== 'done')
  const startedRef = useRef(false)
  /*
   * Latched once the sequence ends. Reaching `done` unmounts the splash, which
   * clears the slot and so re-runs the orchestration effect — without this the
   * whole thing would loop.
   */
  const finishedRef = useRef(false)
  const skip = phase === 'done'

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!query) return
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  /* Nothing scrolls behind the splash. The stable gutter keeps the reserved
   * scrollbar width identical while `overflow` is locked, so releasing the
   * lock can't nudge the layout sideways. */
  useEffect(() => {
    if (skip) return
    const root = document.documentElement
    root.dataset.splash = 'active'
    return () => {
      delete root.dataset.splash
    }
  }, [skip])

  useEffect(() => {
    if (!skip) return
    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* private mode — the splash simply plays again next reload */
    }
  }, [skip])

  /*
   * One effect owns the whole sequence. `useLayoutEffect` so the logo is parked
   * in the centre in the same commit the header first paints — there is no
   * frame in which it sits in the navbar behind the black layer.
   */
  useLayoutEffect(() => {
    if (startedRef.current || finishedRef.current || !playsRef.current) return
    if (!reduced && !(logo && slot)) return
    startedRef.current = true

    const timers = []
    const after = (ms, fn) => timers.push(setTimeout(fn, ms))
    const finish = () => {
      finishedRef.current = true
      setPhase('done')
    }
    let frame = 0
    let loaded = false
    let cancelled = false

    const paint = (value) => {
      const bar = barRef.current
      const percent = percentRef.current
      if (bar) bar.style.transform = `scaleX(${value})`
      if (percent) {
        percent.textContent = `${value >= 1 ? 100 : Math.min(99, Math.floor(value * 100))}%`
      }
    }

    const runProgress = (onDone) => {
      const start = performance.now()
      let value = 0
      const tick = (now) => {
        // Time sets the pace; readiness sets the ceiling. If the page is still
        // fetching, the fill parks short of full rather than lying about it.
        const timed = Math.min((now - start) / T.minLoad, 1)
        const target = Math.min(timed, loaded ? 1 : PENDING_CEILING)
        value += (target - value) * LERP
        if (target >= 1 && value > 0.995) value = 1
        paint(value)
        if (value >= 1) return onDone()
        frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }

    whenLoaded().then(() => {
      loaded = true
    })
    // Never hold the visitor hostage to a stalled subresource.
    after(T.maxLoad, () => {
      loaded = true
    })

    if (reduced) {
      /*
       * No travel and no scale under reduced motion: the splash carries its own
       * copy of the lockup, the header's copy is already in place underneath,
       * and the layer cross-fades between them on opacity alone.
       */
      setPhase('load')
      runProgress(() => {
        if (cancelled) return
        setPhase('hold')
        after(T.hold, () => {
          setPhase('move')
          after(T.reducedOut, finish)
        })
      })

      return () => {
        cancelled = true
        cancelAnimationFrame(frame)
        timers.forEach(clearTimeout)
        startedRef.current = false
      }
    }

    let geometry = null

    const reposition = () => {
      const next = measure(logo, slot)
      if (!next) return
      geometry = next
      logo.style.transition = 'none'
      logo.style.opacity = '1'
      logo.style.transform = transformFor(geometry)
    }
    window.addEventListener('resize', reposition)

    /*
     * Park the lockup in the centre, then release it into the entrance. Both
     * boxes have to be laid out for the delta to mean anything — a viewport
     * that hasn't had its first layout yet (a restored background tab, a
     * window opened at zero size) measures zero and would otherwise send the
     * lockup to the corner. Retrying costs nothing visible: the header is only
     * raised over the black layer once this succeeds.
     */
    let attempts = 0
    const arm = () => {
      geometry = measure(logo, slot)
      if (!geometry) {
        if (attempts++ > 40) {
          // Give up on the flight rather than sit on a black screen.
          finish()
          return
        }
        frame = requestAnimationFrame(arm)
        return
      }

      logo.style.willChange = 'transform, opacity'
      logo.style.opacity = '0'
      logo.style.transform = transformFor(geometry, 0.96)
      void logo.offsetWidth
      logo.style.transition = `opacity ${T.enter}ms linear, transform ${T.enter}ms ${EASE_ENTER}`
      logo.style.opacity = '1'
      logo.style.transform = transformFor(geometry)
      // Only now is the header safe to raise above the black layer: until the
      // transform is on, raising it would expose the lockup in the navbar.
      setStaged(true)

      after(T.progressIn, startLoading)
    }

    const startLoading = () => {
      setPhase('load')
      runProgress(() => {
        if (cancelled) return
        setPhase('hold')

        after(T.hold, () => {
          // Progress leaves first, so the completed state is the last thing
          // read before the lockup starts moving.
          setPhase('handoff')

          after(T.moveDelay, () => {
            window.removeEventListener('resize', reposition)
            setPhase('move')
            logo.style.transition = `transform ${T.move}ms ${EASE_MOVE}`
            logo.style.transform = 'none'

            after(T.chromeDelay, () => setChromeVisible(true))
            after(T.contentDelay, () => setContentReady(true))
            after(T.move, () => {
              clearLogo(logo)
              finish()
            })
          })
        })
      })
    }

    arm()

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      timers.forEach(clearTimeout)
      window.removeEventListener('resize', reposition)
      clearLogo(logo)
      setStaged(false)
      startedRef.current = false
    }
  }, [logo, slot, reduced])

  const value = useMemo(
    () => ({
      phase,
      active: phase !== 'done',
      // The header may only be raised above the black layer once the lockup is
      // actually parked in the centre.
      staged: staged && phase !== 'done',
      reduced,
      // Under reduced motion the header sits behind an opaque layer for the
      // whole sequence, so there is nothing to stage — it is simply revealed.
      chromeVisible: chromeVisible || reduced,
      contentReady: contentReady || reduced,
      registerLogo,
      registerSlot,
      registerBar,
      registerPercent,
    }),
    [
      phase,
      staged,
      reduced,
      chromeVisible,
      contentReady,
      registerLogo,
      registerSlot,
      registerBar,
      registerPercent,
    ],
  )

  return <SplashContext.Provider value={value}>{children}</SplashContext.Provider>
}
