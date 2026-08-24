import { useEffect, useRef } from 'react'

/**
 * Tracks the pointer inside an element and publishes its position as CSS
 * custom properties (`--sx` / `--sy`) plus a 0→1 `--s-on` strength.
 *
 * Values are written straight to the node rather than held in state: this fires
 * on every pointermove, and a React re-render per frame would be wasted work —
 * nothing in the tree depends on the coordinates, only CSS does. Writes are
 * coalesced into one rAF so a burst of moves paints once.
 *
 * Coarse pointers get no cursor to follow, so they settle on a fixed resting
 * position instead of being left with an unrevealed layer.
 */
export function useSpotlight({ restX = 0.62, restY = 0.52 } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const set = (x, y, on) => {
      node.style.setProperty('--sx', `${x}px`)
      node.style.setProperty('--sy', `${y}px`)
      node.style.setProperty('--s-on', String(on))
    }

    // Park the reveal somewhere over the artwork so touch users still see it.
    const rest = () => {
      const b = node.getBoundingClientRect()
      set(b.width * restX, b.height * restY, fine ? 0 : 1)
    }
    rest()

    if (!fine) {
      window.addEventListener('resize', rest)
      return () => window.removeEventListener('resize', rest)
    }

    let frame = 0
    let pending = null

    const flush = () => {
      frame = 0
      if (pending) set(pending.x, pending.y, 1)
    }

    const onMove = (event) => {
      const b = node.getBoundingClientRect()
      pending = { x: event.clientX - b.left, y: event.clientY - b.top }
      if (!frame) frame = requestAnimationFrame(flush)
    }

    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      pending = null
      node.style.setProperty('--s-on', '0')
    }

    node.addEventListener('pointermove', onMove, { passive: true })
    node.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', rest)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', rest)
    }
  }, [restX, restY])

  return ref
}
