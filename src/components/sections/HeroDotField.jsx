import { useEffect, useRef } from 'react'

/**
 * The hero's dot canvas, reacting to the cursor as a soft magnetic field.
 *
 * Canvas rather than a CSS mask because the effect is per-dot: a masked layer
 * fades and moves as one piece, whereas each dot here carries its own energy
 * and its own spring, so the field keeps the shape of where the cursor has been
 * for a moment after it moves on.
 *
 * Three smoothing stages stack to make the response feel unhurried:
 *
 *   1. The cursor itself is eased, not tracked raw. The field reacts to a point
 *      that trails the real pointer by a few frames, which is what reads as
 *      "magnetic" — the surface leans after the cursor rather than snapping to
 *      it.
 *   2. Brightness rises quickly and falls slowly. The asymmetry is the trail:
 *      dots the cursor has passed hold light for ~600ms and ebb away, so recent
 *      travel stays legible without a hard-edged smear.
 *   3. Position is a critically-ish damped spring per dot, pulled toward the
 *      cursor by an amount that falls off with distance and is capped short of
 *      the cursor itself so nothing collapses into a clump. Releasing the
 *      cursor doesn't reset anything; the same spring carries each dot home.
 *
 * All three rates are normalised against frame time, so the motion is identical
 * on 60Hz and 120Hz displays.
 *
 * The loop parks itself when every dot is back at rest and dark, so an idle
 * hero costs nothing. Reduced-motion and touch both fall back to the static grid.
 */

/*
 * Geometry is authored against a 16px root, then multiplied by the document's
 * own scale (see the fluid root font-size in index.css). Without that the grid
 * would keep a 30px pitch while every other element grew, and the texture would
 * read progressively finer on larger displays instead of holding the design's
 * proportions.
 */
const PITCH = 30 // px between dots
const DOT_R = 1 // px radius at rest
const DOT_R_PEAK = 1.65 // px radius directly under the cursor
const BASE_ALPHA = 0.1 // resting dot, matches the static grid
const PEAK_ALPHA = 0.5 // directly under the cursor

const GLOW_RADIUS = 200 // px reach of the reveal
const PULL_RADIUS = 100 // px reach of the magnetism — tighter than the glow
const PULL_MAX = 5 // px, the furthest a dot ever strays from home
const PULL_CLAMP = 0.5 // never travel more than half the way to the cursor
const RING_WIDTH = 46 // px thickness of the click pulse's sweeping ring

/** Document scale: 1 at the 16px root, rising with the viewport past 1440. */
const docScale = () => {
  const root = parseFloat(getComputedStyle(document.documentElement).fontSize)
  return Number.isFinite(root) && root > 0 ? root / 16 : 1
}

const POINTER_EASE = 0.13 // per-frame approach of the eased cursor to the real one
const RISE = 0.17 // per-frame approach when a dot is lighting up
const FALL = 0.028 // per-frame approach when it is fading — the trailing memory
const STIFFNESS = 0.055 // spring constant pulling a dot toward its target offset
const DAMPING = 0.86 // per-frame velocity retention

const SETTLED_E = 0.0015 // below this a dot is treated as dark
const SETTLED_D = 0.02 // px / px-per-frame below which a dot is treated as home
const FRAME = 1000 / 60 // rates above are authored against this frame time

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
    let ox = new Float32Array(0) // current offset from home
    let oy = new Float32Array(0)
    let vx = new Float32Array(0) // spring velocity
    let vy = new Float32Array(0)
    let width = 0
    let height = 0
    let dpr = 1
    // Recomputed on every resize — the root font-size moves with the viewport.
    let pitch = PITCH
    let dotR = DOT_R
    let dotRPeak = DOT_R_PEAK
    let glowRadius = GLOW_RADIUS
    let pullRadius = PULL_RADIUS
    let pullMax = PULL_MAX
    let ringWidth = RING_WIDTH

    // `raw` is where the cursor actually is; `eased` is what the field follows.
    const raw = { x: 0, y: 0, inside: false, seen: false }
    const eased = { x: 0, y: 0 }
    const pulses = []
    let frame = 0
    let last = 0

    /**
     * Paints the field. Resting dots are batched into a single path and filled
     * once — they are the overwhelming majority, and a fillStyle change per dot
     * is what would otherwise make this expensive.
     */
    const paint = () => {
      ctx.clearRect(0, 0, width, height)

      ctx.fillStyle = `rgba(255,255,255,${BASE_ALPHA})`
      ctx.beginPath()
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          if (energy[r * cols + c] > SETTLED_E) continue
          const x = c * pitch + ox[r * cols + c]
          const y = r * pitch + oy[r * cols + c]
          ctx.moveTo(x + dotR, y)
          ctx.arc(x, y, dotR, 0, Math.PI * 2)
        }
      }
      ctx.fill()

      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const i = r * cols + c
          const e = energy[i]
          if (e <= SETTLED_E) continue
          // Radius follows the square of energy so only the dots right under
          // the cursor thicken at all; everywhere else opacity does the work.
          const rad = dotR + (dotRPeak - dotR) * e * e
          ctx.beginPath()
          ctx.arc(c * pitch + ox[i], r * pitch + oy[i], rad, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${BASE_ALPHA + (PEAK_ALPHA - BASE_ALPHA) * e})`
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

      const scale = docScale()
      pitch = PITCH * scale
      dotR = DOT_R * scale
      dotRPeak = DOT_R_PEAK * scale
      glowRadius = GLOW_RADIUS * scale
      pullRadius = PULL_RADIUS * scale
      pullMax = PULL_MAX * scale
      ringWidth = RING_WIDTH * scale

      cols = Math.ceil(width / pitch) + 1
      rows = Math.ceil(height / pitch) + 1
      const n = cols * rows
      energy = new Float32Array(n)
      ox = new Float32Array(n)
      oy = new Float32Array(n)
      vx = new Float32Array(n)
      vy = new Float32Array(n)
      paint()
    }

    // Static grid is the whole story for touch and reduced-motion.
    if (!fine || reduced) {
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(canvas)
      return () => ro.disconnect()
    }

    /** Smoothstep falloff — no hard edge at either boundary. */
    const falloff = (d, radius) => {
      if (d >= radius) return 0
      const t = 1 - d / radius
      return t * t * (3 - 2 * t)
    }

    /**
     * Converts a per-frame approach rate into one for the frame actually
     * rendered, so a 120Hz display eases over the same wall-clock time a 60Hz
     * one does rather than twice as fast.
     */
    const approach = (rate, scale) => 1 - Math.pow(1 - rate, scale)

    const step = (now) => {
      const dt = last ? Math.min(now - last, 64) : FRAME
      last = now
      const scale = dt / FRAME

      // The eased cursor is the whole magnetic feel: everything below reads
      // from it, never from the raw pointer.
      if (raw.inside) {
        const k = approach(POINTER_EASE, scale)
        eased.x += (raw.x - eased.x) * k
        eased.y += (raw.y - eased.y) * k
      }

      // Click pulses expand outward and decay; they add light, never take it.
      for (let i = pulses.length - 1; i >= 0; i -= 1) {
        pulses[i].t += 0.024 * scale
        if (pulses[i].t >= 1) pulses.splice(i, 1)
      }

      const rise = approach(RISE, scale)
      const fall = approach(FALL, scale)
      const damp = Math.pow(DAMPING, scale)
      let active = false

      for (let r = 0; r < rows; r += 1) {
        const homeY = r * pitch
        const dy = homeY - eased.y
        for (let c = 0; c < cols; c += 1) {
          const i = r * cols + c
          const homeX = c * pitch
          const dx = homeX - eased.x
          const d = Math.hypot(dx, dy)

          // Brightness --------------------------------------------------
          let target = raw.inside ? falloff(d, glowRadius) : 0
          for (let p = 0; p < pulses.length; p += 1) {
            const pu = pulses[p]
            const pd = Math.hypot(homeX - pu.x, homeY - pu.y)
            // A thin ring sweeping outward, fading as it goes.
            const ring = 1 - Math.min(1, Math.abs(pd - pu.t * glowRadius * 1.35) / ringWidth)
            if (ring > 0) target = Math.max(target, ring * (1 - pu.t) * 0.85)
          }

          const e = energy[i]
          // Fast attack, slow release: the release is what leaves the trail.
          let next = e + (target - e) * (target > e ? rise : fall)
          if (target === 0 && next < SETTLED_E) next = 0
          energy[i] = next

          // Position ----------------------------------------------------
          // The pull is measured from home, never from where the dot has
          // drifted to, so the target is stationary and the spring can't feed
          // back on itself. Capping at half the distance to the cursor keeps
          // the nearest dots from piling onto a single point.
          let tx = 0
          let ty = 0
          if (raw.inside && d < pullRadius && d > 0.001) {
            const amount = Math.min(pullMax * falloff(d, pullRadius), d * PULL_CLAMP)
            tx = (-dx / d) * amount
            ty = (-dy / d) * amount
          }

          // Same spring in both directions — nothing special happens when the
          // cursor leaves, the target simply becomes home again.
          let nvx = (vx[i] + (tx - ox[i]) * STIFFNESS * scale) * damp
          let nvy = (vy[i] + (ty - oy[i]) * STIFFNESS * scale) * damp
          let nox = ox[i] + nvx * scale
          let noy = oy[i] + nvy * scale

          if (
            tx === 0 &&
            ty === 0 &&
            Math.abs(nox) < SETTLED_D &&
            Math.abs(noy) < SETTLED_D &&
            Math.abs(nvx) < SETTLED_D &&
            Math.abs(nvy) < SETTLED_D
          ) {
            nox = 0
            noy = 0
            nvx = 0
            nvy = 0
          }

          vx[i] = nvx
          vy[i] = nvy
          ox[i] = nox
          oy[i] = noy

          if (next > 0 || nox !== 0 || noy !== 0) active = true
        }
      }

      paint()
      // Park the loop once every dot is dark and home; the next move wakes it.
      if (active || raw.inside) {
        frame = requestAnimationFrame(step)
      } else {
        frame = 0
        last = 0
      }
    }

    const wake = () => {
      if (!frame) {
        last = 0
        frame = requestAnimationFrame(step)
      }
    }

    const onMove = (event) => {
      const rect = canvas.getBoundingClientRect()
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      raw.inside = inside
      if (inside) {
        raw.x = event.clientX - rect.left
        raw.y = event.clientY - rect.top
        // First sighting: start the eased cursor where the real one is, so the
        // field doesn't sweep in from wherever it was last parked.
        if (!raw.seen) {
          raw.seen = true
          eased.x = raw.x
          eased.y = raw.y
        }
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
     * pointer or the window has to release it explicitly. `seen` resets too, so
     * the next entry re-anchors instead of easing across from the old position.
     */
    const release = () => {
      raw.inside = false
      raw.seen = false
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
