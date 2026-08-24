import { useEffect, useRef } from 'react'

/**
 * The hero's dot canvas, reacting to the cursor.
 *
 * Canvas rather than a CSS mask because the brief asks for a per-dot trail:
 * a masked layer fades as one piece, whereas each dot here carries its own
 * energy and decays on its own clock, so the field keeps the shape of where the
 * cursor has been for a moment after it moves on.
 *
 * Each dot rises instantly, holds at full for ~200ms, then falls exponentially.
 * The hold is a real per-dot counter rather than a slow decay curve: without it
 * a dot starts dimming the moment the cursor passes, which reads as a smear
 * instead of a trail. Only opacity responds; dot radius is fixed, so nothing
 * pops or scales.
 *
 * The loop parks itself when the field is fully settled, so an idle hero costs
 * nothing. Reduced-motion and touch both fall back to the static grid.
 */

const PITCH = 30 // px between dots
const DOT_R = 1 // px radius — constant, opacity carries the whole effect
const BASE_ALPHA = 0.1 // resting dot, matches the static grid
const PEAK_ALPHA = 0.78 // directly under the cursor
const RADIUS = 250 // px reach of the reveal
const FALL = 0.055 // per-frame approach to target when fading
const HOLD = 12 // frames a dot stays at full before it starts to fade (~200ms)
const SETTLED = 0.002 // below this, treat a dot as resting

export function HeroDotField({ className = '', style }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    let cols = 0
    let rows = 0
    let energy = new Float32Array(0)
    let hold = new Float32Array(0)
    let width = 0
    let height = 0
    let dpr = 1

    const pointer = { x: -1e4, y: -1e4, inside: false }
    const pulses = []
    let frame = 0

    /** Paints every dot at its current energy. */
    const paint = () => {
      ctx.clearRect(0, 0, width, height)
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const e = energy[r * cols + c]
          const alpha = BASE_ALPHA + (PEAK_ALPHA - BASE_ALPHA) * e
          ctx.beginPath()
          ctx.arc(c * PITCH, r * PITCH, DOT_R, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${alpha})`
          ctx.fill()
        }
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      cols = Math.ceil(width / PITCH) + 1
      rows = Math.ceil(height / PITCH) + 1
      energy = new Float32Array(cols * rows)
      hold = new Float32Array(cols * rows)
      paint()
    }

    // Static grid is the whole story for touch and reduced-motion.
    if (!fine || reduced) {
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(canvas)
      return () => ro.disconnect()
    }

    /** Smoothstep falloff — no hard edge at the reveal boundary. */
    const falloff = (d) => {
      if (d >= RADIUS) return 0
      const t = 1 - d / RADIUS
      return t * t * (3 - 2 * t)
    }

    const step = () => {
      let active = false

      // Click pulses expand outward and decay; they add energy, never subtract.
      for (let i = pulses.length - 1; i >= 0; i -= 1) {
        pulses[i].t += 0.028
        if (pulses[i].t >= 1) pulses.splice(i, 1)
      }

      for (let r = 0; r < rows; r += 1) {
        const dy = r * PITCH - pointer.y
        for (let c = 0; c < cols; c += 1) {
          const i = r * cols + c
          const dx = c * PITCH - pointer.x
          let target = pointer.inside ? falloff(Math.hypot(dx, dy)) : 0

          for (let p = 0; p < pulses.length; p += 1) {
            const pu = pulses[p]
            const d = Math.hypot(c * PITCH - pu.x, r * PITCH - pu.y)
            // A thin ring sweeping outward, fading as it goes.
            const ring = 1 - Math.min(1, Math.abs(d - pu.t * RADIUS * 1.35) / 46)
            if (ring > 0) target = Math.max(target, ring * (1 - pu.t) * 0.85)
          }

          const e = energy[i]
          let next
          if (target > e) {
            // Re-lit: snap up and restart this dot's hold.
            next = target
            hold[i] = HOLD
          } else if (hold[i] > 0) {
            // Still holding — stay put.
            hold[i] -= 1
            next = e
          } else {
            next = e + (target - e) * FALL
          }
          energy[i] = next < SETTLED && target === 0 ? 0 : next
          if (energy[i] > 0) active = true
        }
      }

      paint()
      // Park the loop once everything has settled; restart on the next move.
      frame = active || pointer.inside ? requestAnimationFrame(step) : 0
    }

    const wake = () => {
      if (!frame) frame = requestAnimationFrame(step)
    }

    const onMove = (event) => {
      const rect = canvas.getBoundingClientRect()
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      pointer.inside = inside
      if (inside) {
        pointer.x = event.clientX - rect.left
        pointer.y = event.clientY - rect.top
      }
      wake()
    }

    const onDown = (event) => {
      const rect = canvas.getBoundingClientRect()
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        return
      pulses.push({ x: event.clientX - rect.left, y: event.clientY - rect.top, t: 0 })
      wake()
    }

    /*
     * The hero spans the top of the viewport, so a cursor leaving the window
     * through that edge can have its final pointermove still land inside the
     * canvas — leaving the field lit with nothing to fade it. Losing the
     * pointer or the window has to release it explicitly.
     */
    const release = () => {
      pointer.inside = false
      wake()
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    // Listening on the window keeps this working through the pointer-events-none
    // backdrop the canvas lives in.
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.addEventListener('pointerleave', release)
    document.addEventListener('mouseleave', release)
    window.addEventListener('blur', release)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerleave', release)
      document.removeEventListener('mouseleave', release)
      window.removeEventListener('blur', release)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className={className} style={style} />
}
