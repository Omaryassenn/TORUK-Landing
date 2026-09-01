import * as THREE from 'three'

/**
 * The TORUK mark as real geometry, generated from the logo's own outline.
 *
 * There is no mesh file and no HDR: the shape comes from the path data below
 * and the reflections come from a room baked at runtime. That is the whole
 * asset story for this section — see `environment()`.
 */

/*
 * The outline, copied from the design handoff's `lg.svg` (viewBox 0 0 1458
 * 590) — one closed path of fourteen cubic segments. These numbers are carried
 * over verbatim and are not to be re-traced or simplified: the handoff calls
 * them out as one of the two things that must survive the port intact, and a
 * re-traced curve reads as a slightly wrong logo rather than as an
 * optimisation.
 */
const START = [1220.44, 0.5]

const CURVES = [
  [1349.18, 0.5, 1453.94, 93.8967, 1457.45, 210.172],
  [1405.64, 196.277, 1350.78, 188.841, 1294.04, 188.841],
  [1182.29, 188.841, 1078.02, 217.646, 989.514, 267.55],
  [863.035, 338.84, 769.009, 453.216, 732.19, 588.118],
  [694.151, 451.929, 597.822, 336.894, 468.776, 266.378],
  [381.816, 218.815, 279.987, 191.449, 171.072, 191.449],
  [111.722, 191.449, 54.3994, 199.577, 0.504883, 214.705],
  [1.42102, 96.2969, 107.13, 0.500073, 237.53, 0.5],
  [241.857, 0.5, 246.215, 0.615895, 250.48, 0.84668],
  [305.711, 76.2673, 381.805, 137.985, 471.26, 179.181],
  [549.744, 215.34, 638.548, 235.744, 732.559, 235.744],
  [826.568, 235.744, 909.471, 216.69, 986.041, 182.691],
  [1079.02, 141.466, 1157.98, 78.2513, 1214.8, 0.553711],
  [1216.68, 0.501061, 1218.54, 0.5, 1220.44, 0.5],
]

/** Finished width of the mark, in scene units. Everything else derives from it. */
export const MARK_WIDTH = 1.6
/** Plate thickness. The shards are extruded to the same depth, so they match. */
export const DEPTH = 0.2

/*
 * SVG pixels to scene units. The y term is a flip, not just a scale: SVG's y
 * axis points down and three's points up, so a straight scale would render the
 * mark upside down.
 */
const S = MARK_WIDTH / 1458
const X = (v) => (v - 1458 / 2) * S
const Y = (v) => (590 / 2 - v) * S

/** The outline as a `THREE.Shape`, in scene units and already centred on x. */
export function markShape() {
  const shape = new THREE.Shape()
  shape.moveTo(X(START[0]), Y(START[1]))
  for (const c of CURVES) {
    shape.bezierCurveTo(X(c[0]), Y(c[1]), X(c[2]), Y(c[3]), X(c[4]), Y(c[5]))
  }
  shape.closePath()
  return shape
}

/**
 * The extruded plate, and the offset that centres it.
 *
 * `curveSegments` is the handoff's 48. Above ~56 is wasted — the outline is
 * smooth well before that — and below 32 the curves visibly facet.
 *
 * The geometry is translated by its own negated bounding-box centre so the
 * object turns about itself rather than about the SVG's origin; the same
 * offset is returned because the fracture has to place its shards in that
 * shifted space too.
 */
export function markGeometry(shape) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: DEPTH,
    curveSegments: 48,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.018,
    bevelOffset: 0,
    bevelSegments: 5,
  })
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()

  const centre = geometry.boundingBox.getCenter(new THREE.Vector3())
  geometry.translate(-centre.x, -centre.y, -centre.z)

  return { geometry, centre }
}

/**
 * The reflection room, baked to an environment map.
 *
 * Both materials are near-black and very glossy, which means they are almost
 * entirely reflection: with nothing to reflect the object does not read as
 * dark, it disappears. Three emissive planes in a dark box is the entire
 * lighting design, and it is why this section ships no HDR file.
 *
 * The caller owns the returned texture and must dispose it.
 */
export function environment(renderer) {
  const scene = new THREE.Scene()
  const box = new THREE.BoxGeometry(1, 1, 1)

  const room = new THREE.Mesh(
    box,
    new THREE.MeshBasicMaterial({ color: 0x08090b, side: THREE.BackSide }),
  )
  room.scale.set(12, 8, 12)
  scene.add(room)

  const panel = (color, pos, scale) => {
    const mesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color }))
    mesh.position.set(...pos)
    mesh.scale.set(...scale)
    scene.add(mesh)
  }
  /* Key strip overhead, left fill, right rake — the handoff's three panels. */
  panel(0xffffff, [0, 3.4, 0.6], [7, 0.1, 3.2])
  panel(0xe6edf8, [-4.2, 0.5, 2.0], [0.1, 4.0, 4.4])
  panel(0xdfe6f2, [4.2, 1.1, -1.4], [0.1, 3.2, 5.0])

  const pmrem = new THREE.PMREMGenerator(renderer)
  const texture = pmrem.fromScene(scene, 0.04).texture
  pmrem.dispose()

  /*
   * The room itself is scratch — only the baked texture outlives this call —
   * so its three materials and the one shared box are released here.
   */
  scene.traverse((o) => o.material?.dispose())
  box.dispose()

  return texture
}
