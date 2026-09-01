import * as THREE from 'three'
import { DEPTH } from './mark'

/**
 * The mark breaking into glass.
 *
 * The pattern is a radial one — rings of splinters around an impact point,
 * long panes further out — rather than a uniform subdivision, because an even
 * grid reads as a voxel dissolve and not as broken glass. Each shard is the
 * mark's own material inside one cell of that pattern: the concave outline is
 * clipped by the cell, so every piece has the logo's edge where it had one and
 * a fresh fracture edge everywhere else.
 */

/*
 * A seeded generator, so the fracture is the same on every load.
 *
 * The prototype used `Math.random()`, which is right for a reference file — it
 * shows the pattern is a family rather than one drawing. On a marketing page
 * the opposite is wanted: the section is art-directed, someone signs it off
 * once, and a reload that quietly reshuffles the splinters is a bug report.
 * The seed is arbitrary; changing it draws a different, equally valid break.
 */
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/*
 * Sutherland–Hodgman: clip the (concave) outline by one convex cell of the
 * crack pattern. Every surviving polygon is one physical piece of glass.
 *
 * The algorithm only holds for a convex window, which is why the sectors below
 * are split into trapezoids before they get here.
 */
function clipByConvex(poly, win) {
  let out = poly
  for (let e = 0; e < win.length; e++) {
    const a = win[e]
    const b = win[(e + 1) % win.length]
    const nx = -(b.y - a.y)
    const ny = b.x - a.x
    const side = (p) => (p.x - a.x) * nx + (p.y - a.y) * ny

    const next = []
    for (let i = 0; i < out.length; i++) {
      const c = out[i]
      const d = out[(i + 1) % out.length]
      const sc = side(c)
      const sd = side(d)
      if (sc >= 0) next.push(c)
      if (sc >= 0 !== sd >= 0) {
        const k = sc / (sc - sd)
        next.push(new THREE.Vector2(c.x + (d.x - c.x) * k, c.y + (d.y - c.y) * k))
      }
    }
    out = next
    if (out.length < 3) return null
  }
  return out
}

/** Shoelace area, unsigned — used to drop slivers and to weight the centroids. */
function area2(poly) {
  let a = 0
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % poly.length]
    a += p.x * q.y - q.x * p.y
  }
  return Math.abs(a) / 2
}

/** Even-odd point-in-polygon against the sampled outline. */
function insideContour(contour, x, y) {
  let hit = false
  for (let i = 0, j = contour.length - 1; i < contour.length; j = i++) {
    const a = contour[i]
    const b = contour[j]
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) {
      hit = !hit
    }
  }
  return hit
}

/*
 * The impact goes where the mark is thickest — the interior point furthest
 * from any edge — so the tight inner rings land in material instead of in the
 * empty bay under the wing, where they would produce nothing.
 */
function pickImpact(contour) {
  const best = new THREE.Vector2(0, 0)
  let bestD = -1
  for (let x = -0.78; x <= 0.78; x += 0.02) {
    for (let y = -0.3; y <= 0.3; y += 0.02) {
      if (!insideContour(contour, x, y)) continue
      let d = Infinity
      for (const p of contour) {
        const dd = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y)
        if (dd < d) d = dd
      }
      if (d > bestD) {
        bestD = d
        best.set(x, y)
      }
    }
  }
  return best
}

/*
 * Ring radii and the number of spokes cutting each. Radii are geometric so the
 * rings crowd at the impact and stretch out toward the wingtips, which is what
 * puts splinters at the centre and whole panes at the edges.
 *
 * The reduced set is for small and touch devices: same pattern, coarser. Each
 * wedge costs two extruded meshes and a line set, so spoke count is very close
 * to draw-call count, and this is the one knob that moves it.
 */
const RINGS = [0, 0.05, 0.11, 0.19, 0.29, 0.42, 0.58, 0.78, 1.05, 1.5]
const SPOKES = {
  full: [7, 9, 11, 11, 9, 8, 7, 6, 5],
  reduced: [5, 6, 7, 7, 6, 5, 5, 4, 4],
}

/** Each sector is split into this many trapezoids to keep the clip window convex. */
const ARC = 2

/** Segments per neighbour wire — the resolution the travelling pulse is drawn at. */
const SEG = 9
const VPE = SEG * 2

const WIRE_BASE = [0.04, 0.07, 0.2]
const WIRE_HOT = [0.42, 0.92, 1.0]

/**
 * Build the shard set and the graph of wires that runs between the pieces.
 *
 * Returns the two objects to add to the scene, the materials the caller
 * cross-fades against the solid plate, and the two per-frame updates.
 */
export function createFracture(shape, centre, { detail = 'full' } = {}) {
  const random = rng(0x746f7275)

  /*
   * The outline resampled as a polygon, in the same recentred space as the
   * plate geometry. 240 points is well past the point where the clip result
   * stops changing shape and keeps the cut edges from faceting.
   */
  const contour = shape
    .getPoints(240)
    .map((p) => new THREE.Vector2(p.x - centre.x, p.y - centre.y))

  const impact = pickImpact(contour)
  const spokes = SPOKES[detail] ?? SPOKES.full

  /* One convex cell of the crack pattern, as up to `ARC` trapezoids. */
  const cellsOf = (r0, r1, a0, a1) => {
    const out = []
    for (let j = 0; j < ARC; j++) {
      const b0 = a0 + (a1 - a0) * (j / ARC)
      const b1 = a0 + (a1 - a0) * ((j + 1) / ARC)
      const P = (r, a) =>
        new THREE.Vector2(impact.x + Math.cos(a) * r, impact.y + Math.sin(a) * r)
      out.push(
        r0 > 0
          ? [P(r0, b0), P(r1, b0), P(r1, b1), P(r0, b1)]
          : [impact.clone(), P(r1, b0), P(r1, b1)],
      )
    }
    return out
  }

  /*
   * Spoke angles are jittered by up to half a slot so the rings do not line up
   * into continuous radial seams; a perfectly regular fan reads as a pie chart.
   */
  const wedges = []
  for (let r = 0; r < RINGS.length - 1; r++) {
    const r0 = RINGS[r]
    const r1 = RINGS[r + 1]
    const k = spokes[r]
    const base = random() * Math.PI * 2
    const cuts = []
    for (let i = 0; i < k; i++) {
      cuts.push(base + (i / k) * Math.PI * 2 + (random() - 0.5) * (Math.PI / k) * 0.9)
    }
    cuts.push(cuts[0] + Math.PI * 2)
    for (let i = 0; i < k; i++) wedges.push(cellsOf(r0, r1, cuts[i], cuts[i + 1]))
  }

  /* Dark tint, near-mirror, lit entirely by the reflected room. */
  const shardMat = new THREE.MeshPhysicalMaterial({
    name: 'glass',
    color: 0x0a0e13,
    roughness: 0.04,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 2.4,
    ior: 1.52,
    reflectivity: 0.9,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
  })

  const fractureMat = new THREE.LineBasicMaterial({
    color: 0x9fd8ee,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  const shards = new THREE.Group()
  shards.name = 'shards'
  shards.visible = false

  const owned = []
  const pieces = []

  wedges.forEach((wedge, wi) => {
    /* The mark's material inside this crack cell — that is the shard. */
    const frags = []
    for (const win of wedge) {
      const piece = clipByConvex(contour, win)
      if (piece && area2(piece) > 6e-5) frags.push(piece)
    }
    if (!frags.length) return

    let sx = 0
    let sy = 0
    let wsum = 0
    for (const f of frags) {
      const w = area2(f)
      for (const p of f) {
        sx += (p.x * w) / f.length
        sy += (p.y * w) / f.length
      }
      wsum += w
    }
    const cx = sx / wsum
    const cy = sy / wsum

    const group = new THREE.Group()
    group.name = `shard_${wi}`
    group.position.set(cx, cy, 0)

    for (const f of frags) {
      const sh = new THREE.Shape(f.map((p) => new THREE.Vector2(p.x - cx, p.y - cy)))
      const geo = new THREE.ExtrudeGeometry(sh, {
        depth: DEPTH,
        bevelEnabled: true,
        bevelThickness: 0.006,
        bevelSize: 0.005,
        bevelOffset: 0,
        bevelSegments: 1,
      })
      /* Straddle z=0, so a shard turns about its own middle and not its face. */
      geo.translate(0, 0, -DEPTH / 2)
      geo.computeVertexNormals()
      group.add(new THREE.Mesh(geo, shardMat))

      const edges = new THREE.EdgesGeometry(geo, 30)
      group.add(new THREE.LineSegments(edges, fractureMat))
      owned.push(geo, edges)
    }
    shards.add(group)

    /*
     * Big panes are heavy: they drift slowly and barely turn, while splinters
     * fly and tumble. `lag` staggers each piece's departure by its distance
     * from the impact, so the fracture propagates outward instead of the whole
     * plate exploding on one frame.
     */
    const dist = Math.hypot(cx - impact.x, cy - impact.y)
    const mass = Math.min(1, wsum / 0.035)
    pieces.push({
      mesh: group,
      home: new THREE.Vector3(cx, cy, 0),
      dir: new THREE.Vector3(cx - impact.x, cy - impact.y, 0)
        .normalize()
        .multiplyScalar((0.62 - mass * 0.34) * (0.7 + random() * 0.8))
        .add(
          new THREE.Vector3(
            (random() - 0.5) * 0.26,
            (random() - 0.5) * 0.26,
            /* Toward the camera, strongest at the impact — the plate opens up. */
            0.62 * Math.max(0, 1 - dist / 0.9) + (random() - 0.5) * 0.5,
          ),
        ),
      axis: new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize(),
      spin: (random() - 0.5) * (3.6 - mass * 2.4),
      lag: Math.min(0.34, dist * 0.3 + random() * 0.12),
    })
  })

  /*
   * Wire each shard to its three nearest neighbours. The graph rides the
   * fracture as it opens, so the pieces stay legible as one broken object
   * rather than as loose debris — and it is the thread that carries the
   * section's "connected system" reading into the break.
   */
  const EDGES = []
  {
    const key = (i, j) => (i < j ? `${i}:${j}` : `${j}:${i}`)
    const seen = new Set()
    pieces.forEach((p, i) => {
      const near = pieces
        .map((q, j) => ({ j, d: p.home.distanceTo(q.home) }))
        .filter((o) => o.j !== i)
        .sort((m, n) => m.d - n.d)
        .slice(0, 3)
      for (const o of near) {
        const k = key(i, o.j)
        if (!seen.has(k)) {
          seen.add(k)
          EDGES.push(i, o.j)
        }
      }
    })
  }

  /*
   * Each wire is drawn as `SEG` short segments rather than one line, because
   * the pulse is painted through vertex colours: a two-vertex line can only
   * ramp end to end, and the travelling head needs somewhere to sit.
   */
  const edgeCount = EDGES.length / 2
  const edgePos = new Float32Array(edgeCount * VPE * 3)
  const edgeCol = new Float32Array(edgeCount * VPE * 3)
  const edgeT = new Float32Array(edgeCount * VPE)
  const phase = new Float32Array(edgeCount)
  const speed = new Float32Array(edgeCount)

  for (let e = 0; e < edgeCount; e++) {
    phase[e] = random()
    speed[e] = 0.35 + random() * 0.5
    for (let sg = 0; sg < SEG; sg++) {
      edgeT[e * VPE + sg * 2] = sg / SEG
      edgeT[e * VPE + sg * 2 + 1] = (sg + 1) / SEG
    }
  }

  const edgeGeo = new THREE.BufferGeometry()
  const edgeAttr = new THREE.BufferAttribute(edgePos, 3)
  const colAttr = new THREE.BufferAttribute(edgeCol, 3)
  edgeAttr.setUsage(THREE.DynamicDrawUsage)
  colAttr.setUsage(THREE.DynamicDrawUsage)
  edgeGeo.setAttribute('position', edgeAttr)
  edgeGeo.setAttribute('color', colAttr)

  const wireMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  const wires = new THREE.LineSegments(edgeGeo, wireMat)
  wires.name = 'wires'
  /* Positions are rewritten every frame, so the bounding sphere is never right. */
  wires.frustumCulled = false
  wires.visible = false

  /** Place every shard for a break of `p`, and restring the wires onto them. */
  function layout(p) {
    for (const piece of pieces) {
      const k = Math.max(0, Math.min(1, (p - piece.lag) / (1 - piece.lag)))
      /* Squared, so a piece leaves gently and accelerates away. */
      const e = k * k
      piece.mesh.position.copy(piece.home).addScaledVector(piece.dir, e)
      piece.mesh.quaternion.setFromAxisAngle(piece.axis, piece.spin * e)
    }

    for (let e = 0; e < edgeCount; e++) {
      const a = pieces[EDGES[e * 2]].mesh.position
      const b = pieces[EDGES[e * 2 + 1]].mesh.position
      for (let v = 0; v < VPE; v++) {
        const idx = e * VPE + v
        const k = edgeT[idx]
        const o = idx * 3
        edgePos[o] = a.x + (b.x - a.x) * k
        edgePos[o + 1] = a.y + (b.y - a.y) * k
        edgePos[o + 2] = a.z + (b.z - a.z) * k
      }
    }
    edgeAttr.needsUpdate = true
  }

  /** Run one bright head along each wire. `strength` fades the whole graph. */
  function pulse(time, strength) {
    for (let e = 0; e < edgeCount; e++) {
      const head = (time * speed[e] + phase[e]) % 1
      for (let v = 0; v < VPE; v++) {
        const idx = e * VPE + v
        /* Wrap the distance, so the head crosses the join without a seam. */
        let d = Math.abs(edgeT[idx] - head)
        if (d > 0.5) d = 1 - d
        const hot = Math.exp(-(d * d) / 0.0072)
        const o = idx * 3
        for (let c = 0; c < 3; c++) {
          edgeCol[o + c] = (WIRE_BASE[c] + (WIRE_HOT[c] - WIRE_BASE[c]) * hot) * strength
        }
      }
    }
    colAttr.needsUpdate = true
  }

  layout(0)

  function dispose() {
    for (const g of owned) g.dispose()
    edgeGeo.dispose()
    shardMat.dispose()
    fractureMat.dispose()
    wireMat.dispose()
  }

  return { shards, wires, shardMat, fractureMat, wireMat, layout, pulse, dispose }
}
