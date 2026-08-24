import * as THREE from 'three'

/*
 * The TORUK symbol as a real 3D object.
 *
 * The outline is generated from `lg.svg` (viewBox 0 0 1458 590) rather than
 * loaded as a mesh: one closed path of fourteen cubic beziers. The numbers
 * below are that path verbatim, per the design handoff — they are the logo,
 * not a fit to it, so they are copied rather than regenerated.
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

const VIEW_W = 1458
const VIEW_H = 590
/* SVG px into metres. The mark lands 1.6m wide. */
const SCALE = 1.6 / VIEW_W
/* SVG y runs down, three.js y runs up, so the vertical axis flips. */
const toX = (v) => (v - VIEW_W / 2) * SCALE
const toY = (v) => (VIEW_H / 2 - v) * SCALE

/**
 * The extruded mark, centred on its own origin.
 * Returns the geometry plus its measured size for downstream framing.
 */
export function buildMarkGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(toX(START[0]), toY(START[1]))
  for (const c of CURVES) {
    shape.bezierCurveTo(toX(c[0]), toY(c[1]), toX(c[2]), toY(c[3]), toX(c[4]), toY(c[5]))
  }
  shape.closePath()

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.2,
    curveSegments: 56,
    bevelEnabled: true,
    bevelThickness: 0.022,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 6,
  })
  geometry.computeVertexNormals()
  geometry.computeBoundingBox()

  const size = geometry.boundingBox.getSize(new THREE.Vector3())
  const centre = geometry.boundingBox.getCenter(new THREE.Vector3())
  geometry.translate(-centre.x, -centre.y, -centre.z)

  return { geometry, size }
}

/*
 * The graphite is glossy and nearly black, so it needs something to reflect
 * or the highlight disappears entirely. A three-panel room baked through
 * PMREMGenerator does the job with no HDR asset to ship. Values are the
 * splash variant from the handoff (the mark-only screen uses a larger,
 * brighter room).
 */
function studioScene() {
  const env = new THREE.Scene()
  const box = new THREE.BoxGeometry(1, 1, 1)

  const room = new THREE.Mesh(
    box,
    new THREE.MeshBasicMaterial({ color: 0x07080a, side: THREE.BackSide }),
  )
  room.scale.set(14, 9, 14)
  env.add(room)

  const panel = (color, position, scale) => {
    const mesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color }))
    mesh.position.set(...position)
    mesh.scale.set(...scale)
    env.add(mesh)
  }
  panel(0xffffff, [-0.6, 3.5, 1.2], [5.5, 0.08, 2.6]) // key strip overhead
  panel(0xc9ced6, [-4.4, 0.2, 2.4], [0.08, 3.6, 4.0]) // left fill
  panel(0xa7adb6, [4.4, 1.4, -1.2], [0.08, 2.8, 5.0]) // right rake

  return env
}

/** Bake the reflection room. The caller owns the returned texture. */
export function buildEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer)
  const scene = studioScene()
  const texture = pmrem.fromScene(scene, 0.035).texture
  pmrem.dispose()
  scene.traverse((o) => {
    if (o.isMesh) {
      o.geometry.dispose()
      o.material.dispose()
    }
  })
  return texture
}

/** The two material slots: index 0 the flat faces, index 1 the walls and bevel. */
export function buildMarkMaterials() {
  const face = new THREE.MeshPhysicalMaterial({
    name: 'graphite',
    color: 0x060709,
    roughness: 0.12,
    metalness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.025,
    envMapIntensity: 1.45,
    transparent: true,
    opacity: 0,
  })
  const wall = new THREE.MeshPhysicalMaterial({
    name: 'graphite_edge',
    color: 0x0a0c10,
    roughness: 0.08,
    metalness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.75,
    transparent: true,
    opacity: 0,
  })
  const rim = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
  })
  return { face, wall, rim }
}
