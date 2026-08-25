
export const CANVAS = { w: 1440, h: 1024 }

const NODE = { w: 150, h: 42, r: 9 }

/** mulberry32 — small, fast, and stable across engines. */
function prng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * The eight node kinds the brief calls for. `glyph` is a 16x16 abstract mark —
 * geometric, not iconographic, so nothing reads as a stock AI illustration.
 */
export const KINDS = {
  agent: { glyph: 'circle-dot', labels: ['Supervisor', 'Planner Agent', 'Worker Agent', 'Router', 'Critic'] },
  tool: { glyph: 'brackets', labels: ['Tool Call', 'Web Fetch', 'Executor', 'Shell', 'Search'] },
  knowledge: { glyph: 'stack', labels: ['Vector Store', 'Retriever', 'Index', 'Corpus', 'Embeddings'] },
  memory: { glyph: 'cylinder', labels: ['Session State', 'Long-term', 'Scratchpad', 'Cache'] },
  code: { glyph: 'chevrons', labels: ['Transform', 'Validator', 'Parser', 'Sandbox'] },
  logic: { glyph: 'diamond', labels: ['Condition', 'Route', 'Guardrail', 'Threshold'] },
  workflow: { glyph: 'branch', labels: ['Orchestrate', 'Fan Out', 'Sequence', 'Pipeline'] },
  integration: { glyph: 'link', labels: ['Connector', 'Webhook', 'Queue', 'Event Bus'] },
}

const KIND_KEYS = Object.keys(KINDS)

/** The four verbs the hero promises, used as stage captions along each flow. */
const STAGES = ['BUILD', 'ORCHESTRATE', 'DEPLOY', 'GOVERN']

/**
 * Rounded orthogonal connector, the shape a flow editor draws: out horizontally,
 * one filleted step, back in horizontally.
 */
function elbow(x1, y1, x2, y2) {
  if (Math.abs(y2 - y1) < 1) return `M${x1} ${y1} H${x2}`
  const dir = y2 > y1 ? 1 : -1
  const mx = x1 + (x2 - x1) * 0.5
  const r = Math.min(14, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2)
  return (
    `M${x1} ${y1} H${mx - r} Q${mx} ${y1} ${mx} ${y1 + dir * r} ` +
    `V${y2 - dir * r} Q${mx} ${y2} ${mx + r} ${y2} H${x2}`
  )
}

/** Loop-back: exits right, drops below the lane, returns left into an earlier node. */
function loopBack(from, to, drop) {
  const x1 = from.x + NODE.w
  const y1 = from.y + NODE.h / 2
  const x2 = to.x
  const y2 = to.y + NODE.h / 2
  const yb = Math.max(y1, y2) + drop
  const r = 12
  return (
    `M${x1} ${y1} H${x1 + 34 - r} Q${x1 + 34} ${y1} ${x1 + 34} ${y1 + r} ` +
    `V${yb - r} Q${x1 + 34} ${yb} ${x1 + 34 - r} ${yb} ` +
    `H${x2 - 34 + r} Q${x2 - 34} ${yb} ${x2 - 34} ${yb - r} ` +
    `V${y2 + r} Q${x2 - 34} ${y2} ${x2 - 34 + r} ${y2} H${x2}`
  )
}

/**
 * Builds one left-to-right flow at `y`, optionally fanning out into parallel
 * workers and looping a late node back to an early one.
 */
function buildFlow(rand, { y, startX, columns, tier, gap }) {
  const nodes = []
  const edges = []

  for (let i = 0; i < columns; i += 1) {
    const kind =
      i === 0
        ? 'agent'
        : i === columns - 1
          ? 'integration'
          : KIND_KEYS[Math.floor(rand() * KIND_KEYS.length)]
    const labels = KINDS[kind].labels
    nodes.push({
      id: `${y}-${i}`,
      x: startX + i * gap,
      y,
      kind,
      label: labels[Math.floor(rand() * labels.length)],
      stage: i % 3 === 0 ? STAGES[Math.floor(rand() * STAGES.length)] : null,
      tier,
      // A handful of ports carry the soft glow the brief asks for.
      glow: rand() < 0.26,
    })
  }

  // Spine.
  for (let i = 0; i < nodes.length - 1; i += 1) {
    edges.push({ d: elbow(nodes[i].x + NODE.w, nodes[i].y + NODE.h / 2, nodes[i + 1].x, nodes[i + 1].y + NODE.h / 2), tier })
  }

  // Parallel fan-out from a mid node — two workers running side by side.
  if (columns >= 4 && rand() < 0.75) {
    const at = 1 + Math.floor(rand() * (columns - 3))
    const src = nodes[at]
    const offset = 58 + rand() * 14
    const dir = rand() < 0.5 ? -1 : 1
    for (let k = 0; k < 2; k += 1) {
      const branch = {
        id: `${y}-${at}-b${k}`,
        x: src.x + gap * 0.92,
        y: src.y + dir * offset * (k + 1),
        kind: k === 0 ? 'agent' : KIND_KEYS[Math.floor(rand() * KIND_KEYS.length)],
        label: null,
        stage: null,
        tier: tier + 1,
        glow: rand() < 0.3,
      }
      branch.label = KINDS[branch.kind].labels[Math.floor(rand() * KINDS[branch.kind].labels.length)]
      nodes.push(branch)
      edges.push({ d: elbow(src.x + NODE.w, src.y + NODE.h / 2, branch.x, branch.y + NODE.h / 2), tier: tier + 1 })
      // Rejoin the spine so the branch reads as parallel execution, not a dead end.
      const rejoin = nodes[Math.min(at + 2, columns - 1)]
      edges.push({ d: elbow(branch.x + NODE.w, branch.y + NODE.h / 2, rejoin.x, rejoin.y + NODE.h / 2), tier: tier + 1 })
    }
  }

  // Loop-back — the supervisor pattern from a real agent graph.
  if (columns >= 5 && rand() < 0.7) {
    const from = nodes[Math.min(columns - 2, 2 + Math.floor(rand() * 2))]
    edges.push({ d: loopBack(from, nodes[0], 40 + rand() * 16), tier: tier + 1, dashed: true })
  }

  return { nodes, edges }
}

/** Assembles the full graph. Tiers give the depth layering the brief asks for. */
export function buildCircuitry() {
  const rand = prng(20260824)
  const nodes = []
  const edges = []

  // Lanes deliberately overrun the canvas on both sides so the cable never
  // reveals a flow's start or end — it always looks like part of a larger system.
  const lanes = [
    { y: 26, startX: -200, columns: 9, tier: 1, gap: 236 },
    { y: 150, startX: -80, columns: 9, tier: 0, gap: 248 },
    { y: 272, startX: -260, columns: 9, tier: 2, gap: 232 },
    { y: 396, startX: -130, columns: 9, tier: 0, gap: 254 },
    { y: 520, startX: -220, columns: 9, tier: 1, gap: 240 },
    { y: 646, startX: -60, columns: 9, tier: 0, gap: 246 },
    { y: 770, startX: -280, columns: 9, tier: 2, gap: 234 },
    { y: 892, startX: -160, columns: 9, tier: 1, gap: 250 },
  ]

  const perLane = lanes.map((lane) => {
    const flow = buildFlow(rand, lane)
    nodes.push(...flow.nodes)
    edges.push(...flow.edges)
    return flow
  })

  // Cross-lane links — the orchestration layer stitching flows together.
  for (let i = 0; i < perLane.length - 1; i += 1) {
    if (rand() > 0.72) continue
    const a = perLane[i].nodes[2 + Math.floor(rand() * 3)]
    const b = perLane[i + 1].nodes[1 + Math.floor(rand() * 3)]
    if (!a || !b) continue
    edges.push({
      d: elbow(a.x + NODE.w, a.y + NODE.h / 2, b.x, b.y + NODE.h / 2),
      tier: 2,
      dashed: true,
    })
  }

  return { nodes, edges, node: NODE }
}
