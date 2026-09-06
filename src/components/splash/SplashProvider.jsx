import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { SplashContext } from '@/components/splash/context'


const SEEN_KEY = 'toruk:splash-seen'


const T = {
  markIn: 620,
  markScale: 860,
  wordDelay: 480,
  word: 980,
  settle: 460,
  hold: 220,
  move: 820,
  chromeDelay: 150,
  contentDelay: 260,
  /* Hard cap on holding the settled lockup while the page is still fetching. */
  maxWait: 3200,
  reducedHold: 560,
  reducedOut: 260,
}

/** Site easing for arrivals; a symmetric power3-style curve for the flight. */
const EASE_ENTER = 'cubic-bezier(0.16, 1, 0.3, 1)'

const EASE_REVEAL = 'cubic-bezier(0.45, 0.02, 0.12, 1)'
const EASE_SETTLE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const EASE_MOVE = 'cubic-bezier(0.76, 0, 0.24, 1)'

const WORD_CLOSED = 'inset(0px 70% 0px 0px)'
const WORD_OPEN = 'inset(0px 0% 0px 0px)'


const MARK_CENTRE = 0.13475

/** How far off its final scale the lockup starts, and rests before settling. */
const SCALE_IN = 0.982
const SCALE_REVEAL = 0.994

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}

/**
 * Whether this mount plays the intro at all.
 *
 * Not on a deep link. A URL with a fragment is a request for a specific place
 * on the page, usually made from somewhere else on the site: the legal pages
 * send every one of their nav links back here as `/#platform` and the like. An
 * intro in front of that is a delay before an answer the reader already asked
 * for, and it is also what was swallowing the jump, because the splash locks
 * the page's scroll while it runs.
 */
function shouldPlay() {
  if (typeof window === 'undefined') return false
  if (window.location.hash.length > 1) return false
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
    width: from.width,
  }
}

const transformFor = (g, factor = 1, held = 0) => {
  const shift = held * (0.5 - MARK_CENTRE) * g.width * g.scale * factor
  return `translate3d(${g.dx + shift}px, ${g.dy}px, 0) scale(${g.scale * factor})`
}

/** The two parts of the lockup that reveal separately. */
function partsOf(logo) {
  return {
    mark: logo.querySelector('[data-lockup-mark]'),
    word: logo.querySelector('[data-lockup-word]'),
  }
}

/**
 * Pre-reveal state: mark absent, wordmark fully masked inside the mark. Written
 * with transitions off so nothing animates into the starting pose.
 */
function arrange(parts) {
  const { mark, word } = parts
  if (mark) {
    mark.style.transition = 'none'
    mark.style.transformOrigin = '50% 50%'
    mark.style.transform = 'scale(0.86)'
    mark.style.opacity = '0'
    mark.style.willChange = 'transform, opacity'
  }
  if (word) {
    word.style.transition = 'none'
    word.style.clipPath = WORD_CLOSED
    word.style.willChange = 'clip-path'
  }
}

/** Hands the lockup and its parts back to the stylesheet, in one pass. */
function release(logo) {
  const nodes = [logo, ...Object.values(partsOf(logo))]
  for (const node of nodes) {
    if (!node) continue
    node.style.transition = ''
    node.style.transform = ''
    node.style.transformOrigin = ''
    node.style.opacity = ''
    node.style.clipPath = ''
    node.style.willChange = ''
  }
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

  const registerLogo = useCallback((node) => setLogo(node), [])
  const registerSlot = useCallback((node) => setSlot(node), [])

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
    const opened = performance.now()

    whenLoaded().then(() => {
      loaded = true
    })

    /*
     * The one place readiness is allowed to affect the timeline. The reveal
     * itself runs on its own clock — pacing a logo animation off network
     * progress is what makes intros feel jittery — so the sequence simply holds
     * on the finished, settled lockup until the page is actually there, and
     * gives up waiting at `maxWait` rather than holding the visitor hostage to
     * a stalled subresource.
     */
    const whenReady = (go) => {
      const poll = () => {
        if (cancelled) return
        if (loaded || performance.now() - opened > T.maxWait) return go()
        after(120, poll)
      }
      poll()
    }

    if (reduced) {
      /*
       * No travel, no scale, no wipe: the splash carries its own copy of the
       * lockup, the header's copy is already in place underneath, and the layer
       * cross-fades between them on opacity alone.
       */
      setPhase('hold')
      after(T.reducedHold, () =>
        whenReady(() => {
          setPhase('move')
          after(T.reducedOut, finish)
        }),
      )

      return () => {
        cancelled = true
        timers.forEach(clearTimeout)
        startedRef.current = false
      }
    }

    const parts = partsOf(logo)
    let geometry = null
    /* The lockup's current pose, so a resize can re-derive the transform
     * mid-sequence without knowing which step is running. */
    let factor = SCALE_IN
    let held = 1

    const reposition = () => {
      const next = measure(logo, slot)
      if (!next) return
      geometry = next
      logo.style.transition = 'none'
      logo.style.transform = transformFor(geometry, factor, held)
    }
    window.addEventListener('resize', reposition)

    /*
     * Park the lockup with the mark on the slot's centre, then start the
     * reveal. Both boxes have to be laid out for the delta to mean anything — a
     * viewport that hasn't had its first layout yet (a restored background tab,
     * a window opened at zero size) measures zero and would otherwise send the
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

      logo.style.willChange = 'transform'
      logo.style.opacity = '1'
      logo.style.transform = transformFor(geometry, SCALE_IN, 1)
      arrange(parts)
      setStaged(true)

      void logo.offsetWidth
      frame = requestAnimationFrame(revealMark)
    }

    /* 0 — 0.62s. The mark alone, centred: a soft fade under a long, decelerating
     * scale. `held` stays at 1, so nothing has moved yet. */
    const revealMark = () => {
      if (cancelled) return
      setPhase('mark')

      factor = SCALE_REVEAL
      logo.style.transition = `transform ${T.markScale}ms ${EASE_ENTER}`
      logo.style.transform = transformFor(geometry, factor, held)

      if (parts.mark) {
        parts.mark.style.transition =
          `opacity ${T.markIn}ms cubic-bezier(0.33, 0, 0.2, 1), ` +
          `transform ${T.markScale}ms ${EASE_ENTER}`
        parts.mark.style.opacity = '1'
        parts.mark.style.transform = 'scale(1)'
      }

      after(T.wordDelay, revealWord)
    }

  
    const revealWord = () => {
      if (cancelled) return
      setPhase('word')

      held = 0
      logo.style.transition = `transform ${T.word}ms ${EASE_REVEAL}`
      logo.style.transform = transformFor(geometry, factor, held)

      if (parts.word) {
        parts.word.style.transition = `clip-path ${T.word}ms ${EASE_REVEAL}`
        parts.word.style.clipPath = WORD_OPEN
      }

      after(T.word, settle)
    }

    /* 1.46 — 1.92s. The micro-settle: the last 0.6% of scale, on a centred and
     * complete lockup. */
    const settle = () => {
      if (cancelled) return
      setPhase('settle')

      factor = 1
      logo.style.transition = `transform ${T.settle}ms ${EASE_SETTLE}`
      logo.style.transform = transformFor(geometry, factor, held)

      after(T.settle + T.hold, () => whenReady(fly))
    }

    /* The hand-off. The lockup is complete and static from here — every part is
     * already at its resting value, so the flight animates one transform on one
     * element. */
    const fly = () => {
      if (cancelled) return
      window.removeEventListener('resize', reposition)
      setPhase('move')

      logo.style.transition = `transform ${T.move}ms ${EASE_MOVE}`
      logo.style.transform = 'none'

      after(T.chromeDelay, () => setChromeVisible(true))
      after(T.contentDelay, () => setContentReady(true))
      after(T.move, () => {
        release(logo)
        finish()
      })
    }

    arm()

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      timers.forEach(clearTimeout)
      window.removeEventListener('resize', reposition)
      release(logo)
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
    }),
    [phase, staged, reduced, chromeVisible, contentReady, registerLogo, registerSlot],
  )

  return <SplashContext.Provider value={value}>{children}</SplashContext.Provider>
}
