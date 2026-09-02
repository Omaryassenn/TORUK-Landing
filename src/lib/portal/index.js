import * as THREE from 'three'
import { MARK_WIDTH, markShape, markGeometry, environment } from './mark'
import { createFracture } from './fracture'

/**
 * "Dive Into TORUK" — the scene behind the section.
 *
 * One normalised scroll value drives everything: the plate breaks and the
 * camera travels through it. Nothing here listens to scroll or owns a frame
 * loop — `frame(p, time)` is called by the section, so the 3D and the HTML
 * over it can never drift apart.
 *
 * There is nothing behind the plate. An earlier pass put a field of drifting
 * points back there for the camera to travel through; it was cut, and what the
 * reader arrives in is black. That is the design: the section's second half is
 * two cards on black, so anything still moving behind them competes with the
 * copy for no gain.
 *
 * Ported from the design handoff's `logo-glass.html`. The geometry, the crack
 * pattern, the materials, the light rig and the drift rates are the
 * prototype's; the framing and the pacing are this section's.
 */

/*
 * Where the break has run its course, in section progress.
 *
 * These are fractions of the scope, and the scope is no longer the 300svh they
 * were set at: it has grown to 400 to give the two panels below the mark the
 * scroll they need. Left alone, the break would have grown with it and run a
 * third slower than it was tuned to.
 *
 * So they are re-derived rather than left: 15svh of approach and 123svh of
 * break, which are the lengths the prototype's pacing was set at, expressed
 * against the scope as it is now. Anything that changes `--dive-scope`'s height
 * has to come back through here.
 */
const BREAK_START = 0.0375
const BREAK_END = 0.345

/* The plate's near face is at z = +0.1, so this is just past its back. */
const Z_THROUGH = -0.12

/*
 * Where the camera ends up. Past the break it keeps moving, but barely — a
 * metre and a half over the rest of the section.
 *
 * It has nothing left to travel toward, so the drift is only there to stop the
 * scene reading as having been switched off at the moment the reader is asked
 * to keep scrolling. The cards arrive over this.
 */
const Z_REST = -1.6

/*
 * How much of the frame the mark takes at rest, as half-extents in scene
 * units. The camera distance is derived from these rather than fixed, so the
 * mark holds its size on a portrait phone instead of being cropped by the
 * narrow frustum — at 390x700 a fixed 2.5 clips both wingtips.
 */
const FRAME_HALF_W = MARK_WIDTH / 2 + 0.25
const FRAME_HALF_H = 0.55
const Z_MIN = 2.2

const FOV = 45

/** Smoothstep — the same ease the prototype uses for its dolly. */
const smooth = (t) => t * t * (3 - 2 * t)
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

/**
 * Build the scene onto `canvas`.
 *
 * `detail: 'reduced'` coarsens the crack pattern and caps the pixel ratio
 * lower. Shard count is very nearly draw-call count here, so it is the one
 * knob that matters on a phone.
 *
 * Returns null when WebGL is unavailable — the section renders its static
 * fallback in that case rather than an empty canvas.
 */
export function createPortal(canvas, { detail = 'full' } = {}) {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  } catch {
    return null
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, detail === 'full' ? 2 : 1.5))
  renderer.setClearAlpha(0)

  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 120)

  /* The mark. */
  const shape = markShape()
  const { geometry, centre } = markGeometry(shape)

  const faceMat = new THREE.MeshPhysicalMaterial({
    name: 'obsidian',
    color: 0x080a0d,
    roughness: 0.1,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.35,
    transparent: true,
    opacity: 1,
  })
  const wallMat = new THREE.MeshPhysicalMaterial({
    name: 'obsidian_edge',
    color: 0x0d1014,
    roughness: 0.07,
    metalness: 0.25,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.6,
    transparent: true,
    opacity: 1,
  })

  /* Slot 0 is the flat faces, slot 1 the extruded walls and bevel. */
  const solid = new THREE.Mesh(geometry, [faceMat, wallMat])
  solid.name = 'mark_solid'

  /*
   * A thin bright silhouette. Against pure black the plate is almost entirely
   * reflection, and where it happens to reflect nothing the edge would simply
   * vanish; this keeps the outline readable at every angle.
   */
  const rimGeo = new THREE.EdgesGeometry(geometry, 24)
  const rimMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.45,
  })
  const rim = new THREE.LineSegments(rimGeo, rimMat)
  rim.name = 'mark_rim'

  const fracture = createFracture(shape, centre, { detail })

  const mark = new THREE.Group()
  mark.name = 'mark'
  mark.add(solid, rim, fracture.shards, fracture.wires)
  scene.add(mark)

  /*
   * The light rig. The environment does most of the work — these sit on top of
   * it. The point light is the moving highlight, and its two rates share no
   * common factor, so the glint crosses the faces without ever repeating.
   */
  const envMap = environment(renderer)
  scene.environment = envMap

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 0.22))
  const key = new THREE.DirectionalLight(0xffffff, 1.7)
  key.position.set(4, 7, 5)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xfff4e6, 0.65)
  fill.position.set(-5, 3, -4)
  scene.add(fill)
  /*
   * The prototype's key light casts a shadow onto a ground plane it then
   * hides. With no receiver in the scene the shadow map is pure cost, so it is
   * dropped here along with the plane — the handoff says to drop both.
   */
  const glow = new THREE.PointLight(0xf2f6fc, 3.4, 6, 2)
  glow.position.set(0.5, 0.2, 1.1)
  scene.add(glow)

  /* Distance at which the mark fills the frame, recomputed on every resize. */
  let zStart = Z_MIN
  const eye = new THREE.Vector3()
  const look = new THREE.Vector3()

  function setSize(width, height) {
    renderer.setSize(width, height, false)
    const aspect = width / Math.max(1, height)
    camera.aspect = aspect
    camera.updateProjectionMatrix()

    /*
     * Both terms have to be recomputed: an aspect change alone moves the width
     * term, but the height term is what binds on a wide window, and taking
     * only one of them puts the mark off the frame on the other axis.
     */
    const half = Math.tan((FOV * Math.PI) / 360)
    zStart = Math.max(Z_MIN, FRAME_HALF_W / (half * aspect), FRAME_HALF_H / half)
  }

  /**
   * Draw one frame.
   *
   * `p` is section progress, already smoothed by the caller; `time` is elapsed
   * seconds, which drives everything that moves on its own.
   */
  function frame(p, time) {
    const breakP = clamp01((p - BREAK_START) / (BREAK_END - BREAK_START))

    /*
     * The idle drift settles as the reader heads in, so the approach reads as
     * forward travel rather than as an object that happens to be spinning.
     */
    const calm = 1 - breakP * 0.85

    mark.rotation.y = -0.4 + Math.sin(time * 0.34) * 0.5 * calm + breakP * 0.35
    mark.rotation.x = 0.16 + Math.sin(time * 0.24) * 0.12 * calm

    if (p <= BREAK_END) {
      /*
       * Dolly from the framing distance to just past the plate's back face.
       *
       * Accelerating rather than eased at both ends. A smoothstep here put the
       * camera through the plate a third of the way into the break and left
       * the rest of it looking at empty space behind the debris — the reader
       * arrived before the fracture had finished. This holds back while the
       * pieces open and covers most of the distance in the last quarter, so
       * the pass-through lands on the last frame of the break and reads as
       * being pulled in.
       */
      const push = Math.pow(breakP, 2.2)
      eye.set(
        Math.sin(time * 0.18) * 0.06 * calm,
        0.1 * calm,
        zStart - push * (zStart - Z_THROUGH),
      )
      /*
       * The camera looks a little ABOVE the mark while the plate is whole,
       * which drops the mark into the lower two thirds of the frame and leaves
       * the top to the section header. Without it the mark is centred and the
       * heading is set straight across the middle of it.
       *
       * The bias unwinds as the break runs, so the dolly ends up going through
       * the middle of the plate rather than over its top edge. It unwinds
       * late, though — cubed, so it is still four fifths applied at the
       * halfway mark. That is where the shards are at their largest on screen,
       * and on a linear unwind they had recentred by then and were climbing
       * over the header.
       *
       * It still reaches zero before the camera reaches the plate, so the look
       * point never gets close enough to the camera to swing.
       */
      look.set(0, 0.22 * (1 - breakP ** 3), 0)
    } else {
      /* Past the plate: a slow settle, still drifting, no longer travelling. */
      const t = smooth(clamp01((p - BREAK_END) / (1 - BREAK_END)))
      eye.set(
        Math.sin(time * 0.18) * 0.02,
        0.02,
        Z_THROUGH + (Z_REST - Z_THROUGH) * t,
      )
      look.set(0, 0, eye.z - 4)
    }
    camera.position.copy(eye)
    camera.lookAt(look)

    /*
     * Cross-fade the solid plate into the shard set over the first tenth of
     * the break, while the pieces are still sitting in their home cells — that
     * is what hides the swap.
     */
    const k = clamp01((breakP - 0.015) / 0.095)
    const fade = smooth(k)

    faceMat.opacity = wallMat.opacity = 1 - fade
    rimMat.opacity = 0.45 * (1 - fade)
    fracture.shardMat.opacity = fade * 0.92
    fracture.fractureMat.opacity = fade * 0.32

    /*
     * Everything belonging to the plate is dropped once the camera is well
     * past it. It is behind the near plane by then so nothing pops, and it is
     * every draw call the section has — past this point the renderer is
     * clearing to transparent and nothing else, which is what lets the cards
     * come in over a scene that costs nothing to keep alive.
     */
    /* 18svh past the end of the break, as it was when the scope was 300svh. */
    const spent = p > 0.39
    mark.visible = !spent
    if (!spent) {
      solid.visible = rim.visible = fade < 0.999
      fracture.shards.visible = fade > 0.001
      if (fracture.shards.visible) fracture.layout(breakP)
      fracture.wires.visible = fade > 0.02
      if (fracture.wires.visible) fracture.pulse(time, fade)
    }

    glow.position.set(Math.sin(time * 0.5) * 0.7, Math.sin(time * 0.37) * 0.35, 1.1)
    glow.intensity = 3.4 * (1 - breakP * 0.7)

    renderer.render(scene, camera)
  }

  function dispose() {
    geometry.dispose()
    rimGeo.dispose()
    faceMat.dispose()
    wallMat.dispose()
    rimMat.dispose()
    fracture.dispose()
    envMap.dispose()
    scene.environment = null
    renderer.dispose()
  }

  return { frame, setSize, dispose }
}
