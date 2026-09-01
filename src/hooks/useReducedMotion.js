import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

const supported = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'

function subscribe(onChange) {
  if (!supported()) return () => {}
  const query = window.matchMedia(QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/* Nothing to honour where the query cannot be asked — assume motion is fine. */
const snapshot = () => (supported() ? window.matchMedia(QUERY).matches : false)

/**
 * True when the reader has asked for reduced motion.
 *
 * Most of the page states this in CSS instead, which is the better place for
 * it. This hook exists for the one case CSS cannot cover — deciding whether to
 * download and mount a renderer at all.
 *
 * `useSyncExternalStore` rather than an effect, so the very first render
 * already has the real answer: the section that reads this would otherwise
 * mount its canvas and then tear it down again a frame later. Where there is
 * no window to ask — prerender — the answer is `true`, which is the side that
 * starts nothing.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, () => true)
}
