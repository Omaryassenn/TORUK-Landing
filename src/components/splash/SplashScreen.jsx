import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'

import { buildEnvironment, buildMarkGeometry, buildMarkMaterials } from '@/lib/torukMark'
import { NodeField } from './NodeField'
import { FIELD_H, FIELD_W, LINKS, NODES } from './nodes'
import './splash.css'

/* Seconds for the bar to reach 100%. Also the floor on the whole screen:
 * real readiness can only ever delay the hand-off, never cut it short. */
const LOAD = 3
/* The bar rests here while real work is still outstanding. */
const HOLD = 0.92
/* The bar sits full for a beat, then clears itself away. */
const CLEAR_DELAY = 0.45
const CLEAR_DURATION = 0.7
/* Matches the .splash opacity transition. */
const EXIT_MS = 700

/* Cards peak at 0.6 as the light comes round; reduced motion holds them here. */
const CARD_PEAK = 0.6
const CARD_REST = 0.26

const spring = (t, t0, w) => {
  const x = t - t0
  if (x <= 0) return 0
  return 1 - (1 + w * x) * Math.exp(-w * x)
}
const smooth = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k))

/* The light wanders the plate on layered sines: slow, and never mechanical. */
const drift = (a, b, c) => ({
  a,
  b,
  c,
  pa: Math.random() * 6.28,
  pb: Math.random() * 6.28,
  pc: Math.random() * 6.28,
})
const wander = (d, t) =>
  Math.sin(t * d.a + d.pa) * 0.62 +
  Math.sin(t * d.b * 2.3 + d.pb) * 0.28 +
  Math.sin(t * d.c * 4.7 + d.pc) * 0.1

/* Two deliberately incommensurate rates, so the light reaches every side in
 * turn and the figure never repeats. */
const PATH_X = 0.105
const PATH_Y = 0.073
/* How far the light may travel inside the plate. */
const HALF_X = 0.78
const HALF_Y = 0.3

/**
 * The cold-start screen: the TORUK mark as a real 3D object, lit from inside
 * by a single travelling light that reveals the agent-flow field behind it on
 * whichever side it happens to be facing.
 *
 * `ready` reports real readiness (assets, auth, first payload). The screen
 * hands off once both that flag and the LOAD-second floor are satisfied, so
 * the animation is never cut short mid-beat.
 */
export function SplashScreen({ ready = true, onDone }) {
  const sceneHostRef = useRef(null)
  const fieldRef = useRef(null)
  const cardRefs = useRef([])
  const wireRefs = useRef([])
  const fillRef = useRef(null)
  const pctRef = useRef(null)
  const loaderRef = useRef(null)

  const readyRef = useRef(ready)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    readyRef.current = ready
  }, [ready])

  /* No scrolling anywhere while the splash is up. */
  useEffect(() => {
    const { overflow } = document.documentElement.style
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = overflow
      document.body.style.overflow = ''
    }
  }, [])

  useLayoutEffect(() => {
    const host = sceneHostRef.current
    const field = fieldRef.current
    if (!host || !field) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /* ---------------------------------------------------------------- 3D */
    const { geometry, size } = buildMarkGeometry()
    const { face, wall, rim: rimMat } = buildMarkMaterials()

    let renderer = null
    let env = null
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setClearColor(0x000000, 0)
      /* No tone mapping, by design. The interior light is meant to clip to a
       * hard white hotspot on the glossy face; a filmic curve rolls exactly
       * that highlight off into grey and the mark reads flat. */
      renderer.toneMapping = THREE.NoToneMapping
      renderer.outputColorSpace = THREE.SRGBColorSpace
      host.appendChild(renderer.domElement)
      env = buildEnvironment(renderer)
    } catch {
      /* No WebGL: the field and the loader still carry the screen. */
      renderer = null
    }

    const scene = new THREE.Scene()
    if (env) scene.environment = env

    /* The starter's studio rig, dialled down for near-black graphite. */
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 0.16))
    const key = new THREE.DirectionalLight(0xffffff, 1.3)
    key.position.set(4, 7, 5)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xfff4e6, 0.44)
    fill.position.set(-5, 3, -4)
    scene.add(fill)

    /* The one animated light. There is no emissive texture alongside it —
     * an earlier version had both and read as two separate sources. */
    const core = new THREE.PointLight(0xf6f8fb, 0, 5, 2)
    scene.add(core)

    const mark = new THREE.Group()
    const body = new THREE.Mesh(geometry, [face, wall])
    mark.add(body)
    const rimGeometry = new THREE.EdgesGeometry(geometry, 26)
    mark.add(new THREE.LineSegments(rimGeometry, rimMat))
    scene.add(mark)

    const FOV = 45
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 100)
    camera.position.set(0, 0.03, 4.3)

    /* A fixed camera distance holds the desktop composition, but a tall
     * narrow viewport sees far less horizontally at the same distance and the
     * mark grows until it fills the frame. So the distance is derived from
     * the horizontal FOV whenever the mark would exceed its target share of
     * the viewport, and the fixed 4.3 wins everywhere else. In practice this
     * only engages below roughly 768px of portrait width. */
    const MARK_MAX_W = 0.62 /* of viewport width */
    const MARK_MAX_H = 0.46 /* of viewport height */
    const halfTan = Math.tan((FOV * Math.PI) / 360)
    const needHalfW = size.x / 2 / MARK_MAX_W
    const needHalfH = size.y / 2 / MARK_MAX_H
    const cameraZ = (aspect) =>
      Math.max(4.3, needHalfW / (halfTan * aspect), needHalfH / halfTan)

    /* -------------------------------------------------------------- 2D */
    const cards = NODES.map((node, i) => {
      const el = cardRefs.current[i]
      return { el, node, dir: [0, 0], shown: 0 }
    })

    /* Card heights are content-driven, so the direction from the centre of
     * the design space can only be fixed once the text has laid out. */
    const measure = () => {
      for (const c of cards) {
        const h = c.el ? c.el.offsetHeight : 0
        const dx = c.node.x + c.node.w / 2 - FIELD_W / 2
        const dy = c.node.y + h / 2 - FIELD_H / 2
        const len = Math.hypot(dx, dy) || 1
        c.dir = [dx / len, dy / len]
      }
    }
    measure()
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure).catch(() => {})
    }

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      field.style.transform = `scale(${Math.min(w / FIELD_W, h / FIELD_H)})`
      if (renderer) {
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.position.z = cameraZ(camera.aspect)
        camera.updateProjectionMatrix()
      }
    }
    resize()
    window.addEventListener('resize', resize)

    /* ------------------------------------------------------------ frame */
    const dx = drift(0.17, 0.1, 0.06)
    const dy = drift(0.21, 0.12, 0.05)

    let completedAt = null
    let finished = false

    const paintLoader = (t) => {
      const timed = Math.min(1, t / LOAD)
      const load = readyRef.current ? timed : Math.min(timed, HOLD)
      if (load >= 1 && completedAt === null) completedAt = t

      if (fillRef.current) fillRef.current.style.width = `${(load * 100).toFixed(1)}%`
      if (pctRef.current) pctRef.current.textContent = `${Math.round(load * 100)}%`

      const from = completedAt === null ? Infinity : completedAt + CLEAR_DELAY
      if (loaderRef.current) {
        loaderRef.current.style.opacity = (1 - smooth((t - from) / CLEAR_DURATION)).toFixed(3)
      }

      if (!finished && completedAt !== null && t > from + CLEAR_DURATION) {
        finished = true
        setExiting(true)
      }
    }

    const paintCard = (c, value) => {
      if (!c.el) return
      c.el.style.opacity = Math.min(CARD_PEAK, value).toFixed(3)
      c.el.style.transform = `translateY(${((1 - Math.min(1, value / 0.5)) * 6).toFixed(2)}px)`
    }

    const paintWires = () => {
      LINKS.forEach((link, i) => {
        const path = wireRefs.current[i]
        if (!path) return
        /* A wire shows only while both of its cards do. */
        const v = Math.min(cards[link.from].shown, cards[link.to].shown) * 0.9
        path.style.opacity = v.toFixed(3)
      })
    }

    const frame = (t) => {
      const rise = spring(t, 0.12, 5.4)
      face.opacity = rise
      wall.opacity = rise
      rimMat.opacity = rise * 0.28
      mark.scale.setScalar(0.965 + rise * 0.035)

      /* The one light, gliding along its continuous path. */
      const ex = Math.sin(t * PATH_X * Math.PI * 2) * 0.92 + wander(dx, t) * 0.05
      const ey = Math.sin(t * PATH_Y * Math.PI * 2 + 1.05) * 0.86 + wander(dy, t) * 0.05

      /* It burns a little brighter the further out it reaches. */
      const settle = smooth(Math.min(1, Math.hypot(ex, ey) / 0.9))
      const level = 0.55 + settle * 0.6
      core.position.set(ex * HALF_X, ey * HALF_Y, 0.42)
      core.intensity = rise * (2.6 + level * 3.4)

      /* Restrained parallax: the object breathes. */
      mark.rotation.y = Math.sin(t * 0.13) * 0.09
      mark.rotation.x = 0.03 + Math.sin(t * 0.1) * 0.03
      camera.position.x = Math.sin(t * 0.1) * 0.05
      camera.position.y = 0.03 + Math.sin(t * 0.08) * 0.03
      camera.lookAt(0, 0, 0)

      /* The reveal: a card lights only while the light is heading its way. */
      const len = Math.hypot(ex, ey) || 1
      const ldx = ex / len
      const ldy = -ey / len /* screen y is flipped against plate y */
      const reach = smooth((len - 0.08) / 0.4) /* dead centre reveals nothing */

      for (const c of cards) {
        const align = Math.max(0, c.dir[0] * ldx + c.dir[1] * ldy)
        const want = Math.pow(align, 2.2) * reach * (0.1 + settle * 0.5) * rise
        /* One non-finite frame would latch the accumulator forever, and an
         * invalid opacity string is dropped silently by the CSSOM. */
        if (!Number.isFinite(c.shown)) c.shown = 0
        const k = want > c.shown ? 0.2 : 0.3 /* quick in, quicker out */
        c.shown += (want - c.shown) * k
        paintCard(c, c.shown)
      }
      paintWires()

      if (renderer) renderer.render(scene, camera)
    }

    /* Reduced motion: the mark holds still, the field sits at a low constant
     * level rather than being swept, and the loader still runs. */
    const staticFrame = () => {
      face.opacity = 1
      wall.opacity = 1
      rimMat.opacity = 0.28
      mark.scale.setScalar(1)
      mark.rotation.set(0.03, 0, 0)
      core.position.set(0, 0, 0.42)
      core.intensity = 2.6 + 0.55 * 3.4
      camera.position.set(0, 0.03, cameraZ(camera.aspect))
      camera.lookAt(0, 0, 0)
      for (const c of cards) {
        c.shown = CARD_REST
        paintCard(c, CARD_REST)
      }
      paintWires()
      if (renderer) renderer.render(scene, camera)
    }

    let raf = 0
    const t0 = performance.now()

    if (reduced) {
      staticFrame()
      const staticResize = () => {
        resize()
        staticFrame()
      }
      window.addEventListener('resize', staticResize)
      const tick = () => {
        raf = requestAnimationFrame(tick)
        paintLoader((performance.now() - t0) / 1000)
      }
      raf = requestAnimationFrame(tick)
      return () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', staticResize)
        window.removeEventListener('resize', resize)
        teardown()
      }
    }

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const t = (performance.now() - t0) / 1000
      frame(t)
      paintLoader(t)
    }
    raf = requestAnimationFrame(tick)

    function teardown() {
      geometry.dispose()
      rimGeometry.dispose()
      face.dispose()
      wall.dispose()
      rimMat.dispose()
      if (env) env.dispose()
      if (renderer) {
        renderer.dispose()
        renderer.domElement.remove()
      }
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      teardown()
    }
  }, [])

  /* Unmount only after the hand-off fade has finished. */
  useEffect(() => {
    if (!exiting) return
    const id = setTimeout(() => onDone && onDone(), EXIT_MS)
    return () => clearTimeout(id)
  }, [exiting, onDone])

  return (
    <div
      className="splash"
      data-exiting={exiting || undefined}
      role="status"
      aria-live="polite"
      aria-label="Loading TORUK"
    >
      <NodeField fieldRef={fieldRef} cardRefs={cardRefs} wireRefs={wireRefs} />
      <div ref={sceneHostRef} className="splash-scene" />
      <div className="splash-vignette" />
      <div ref={loaderRef} className="splash-loader">
        <div className="splash-track">
          <div ref={fillRef} className="splash-fill" />
        </div>
        <div ref={pctRef} className="splash-pct">
          0%
        </div>
      </div>
    </div>
  )
}
