import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { SplashContext } from '@/components/splash/context'

/**
 * The splash is a shared-element (FLIP) hand-off, not a screen that fades into
 * another screen: the wordmark the visitor watches assemble *is* the header's
 * wordmark, parked in the middle of the viewport by a transform and released
 * back to its own layout position when loading finishes. Nothing is duplicated,
 * so it can't drift out of alignment and it can't shift the page — the header
 * has been sitting in its final position the whole time, under an opaque layer.
 *
 * The lockup activates rather than simply appearing:
 *
 *   1. the mark fades up alone, dead centre of the viewport;
 *   2. the wordmark is wiped out of the mark's right edge, and the same motion
 *      slides the mark left by exactly the offset that leaves the finished
 *      lockup centred — the wipe opening and the mark travelling are one
 *      transition on one curve, so the wordmark reads as displacing the mark
 *      rather than appearing beside it;
 *   3. the lockup eases the last thousandths of its scale, so it settles rather
 *      than stops.
 *
 * Only then does it fly to the navbar. No glow, no light, no gradient: the black
 * stays flat and the only things that move are a clip-path and a transform.
 *
 * The provider owns the choreography and writes every transform directly to the
 * DOM. React state here carries nothing but the coarse phase, so the sequence
 * never re-renders the tree while it runs.
 */

/** Once per tab. Section links don't remount the app, reloads shouldn't replay. */
const SEEN_KEY = 'toruk:splash-seen'

/*
 * Milliseconds. Budgeted against the brief: the mark occupies 0–0.62s, the
 * wordmark wipes (and displaces the mark) from 0.48s to 1.46s — overlapping the
 * mark's arrival so the two read as one gesture — the settle and hold carry to
 * ~2.14s, and the flight to the navbar runs 820 from there, with the page
 * revealing underneath it rather than after it.
 */
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
/* Gentle departure, quick middle, long decelerating tail — a wipe drawn by
 * hand rather than switched on. Carries the mark's displacement too, which is
 * what welds the two halves of the reveal into one motion. */
const EASE_REVEAL = 'cubic-bezier(0.45, 0.02, 0.12, 1)'
const EASE_SETTLE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const EASE_MOVE = 'cubic-bezier(0.76, 0, 0.24, 1)'

/*
 * The wipe, in the lockup's own coordinates. Closed, the visible strip ends at
 * 30% — a shade inside the wordmark's own left edge at 31.6%, because at exactly
 * 31.6% the stem of the T leaks a sub-pixel of white before the reveal starts.
 * The 1.6% of dead travel that buys costs about 20ms of the wipe and hides the
 * seam completely. Only the right inset moves; the wipe is horizontal by
 * construction, not by easing.
 */
const WORD_CLOSED = 'inset(0px 70% 0px 0px)'
const WORD_OPEN = 'inset(0px 0% 0px 0px)'

/*
 * The mark occupies the leftmost 26.95% of the lockup box, so its centre sits at
 * 13.475% of the width against the lockup's own 50%. The difference is the whole
 * displacement: hold the lockup that far right and the *mark* is centred on the
 * slot; release it to zero and the finished lockup is centred instead. One
 * number, so the two framings can never disagree — and it is derived from the
 * artwork's proportions rather than measured, so it holds at any viewport.
 */
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
    width: from.width,
  }
}

/**
 * `held` is the reveal's one parameter: 1 centres the mark, 0 centres the whole
 * lockup, and the transition between them is the push. The offset is scaled by
 * the same factor as the lockup so the mark stays exactly centred no matter what
 * the scale is doing at the time.
 */
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
      // Only now is the header safe to raise above the black layer: until the
      // transform is on, raising it would expose the lockup in the navbar. The
      // lockup is invisible at this instant — mark dark, wordmark masked — so
      // what the visitor sees is still an empty black field.
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

    /*
     * 0.48 — 1.46s. The wordmark wipes open while the lockup gives up its whole
     * displacement — same duration, same curve, so the mark's travel and the
     * wipe are the same motion. The glyphs are rigid inside the lockup, so each
     * one slides left out from under the opening mask exactly as far as the mark
     * does: the wordmark is displacing it, not accompanying it.
     */
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
