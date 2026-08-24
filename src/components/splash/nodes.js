/*
 * The agent-flow field that sits behind the mark.
 *
 * Positions are top-left corners inside a fixed 1600x900 design space that
 * scales as one unit, so the composition is identical at every viewport size.
 * Card heights are content-driven and measured after layout.
 */
export const FIELD_W = 1600
export const FIELD_H = 900

/* Every card carries its port dots on the same baseline: 31px from the card
 * top, 13px across, so the wire anchor is always y + 37.5. */
const PORT_TOP = 31
const PORT_SIZE = 13
const PORT_CENTRE = PORT_TOP + PORT_SIZE / 2

export const NODES = [
  {
    id: 'start',
    title: 'Start',
    desc: 'Starting point of the agentflow',
    x: 188,
    y: 212,
    w: 288,
    ports: ['out'],
    icon: 'play',
    tile: '#10261a',
    glyph: '#22c55e',
  },
  {
    id: 'supervisor',
    title: 'Supervisor',
    chip: 'gpt-4o-mini',
    desc: 'Large language models to analyze user-provided inputs and generate responses',
    x: 188,
    y: 532,
    w: 288,
    ports: ['in', 'out'],
    icon: 'model',
    tile: '#141518',
    glyph: '#e9edf2',
  },
  {
    id: 'router',
    title: 'Check next worker',
    sub: 'Split flows based on l…',
    desc: 'Routes the run to the next worker',
    x: 596,
    y: 128,
    w: 276,
    ports: ['in', 'out'],
    icon: 'split',
    tile: '#2a1e0c',
    glyph: '#e2a34a',
  },
  {
    id: 'engineer',
    title: 'Software Engineer',
    chip: 'openai/gpt-oss-20b',
    desc: 'Dynamically choose and utilize tools during runtime, enabling multi-step reasoning',
    x: 1130,
    y: 222,
    w: 296,
    ports: ['in', 'out'],
    icon: 'code',
    tile: '#1b1013',
    glyph: '#f2f4f7',
  },
  {
    id: 'reviewer',
    title: 'Code Reviewer',
    chip: 'cohere.command-r-v1:0',
    desc: 'Dynamically choose and utilize tools during runtime, enabling multi-step reasoning',
    x: 1130,
    y: 536,
    w: 296,
    ports: ['in', 'out'],
    icon: 'review',
    tile: '#0e1620',
    glyph: '#7fb2ff',
  },
  {
    id: 'answer',
    title: 'Generate Final Answer',
    chip: 'claude-3-haiku',
    desc: 'Composes the response returned to the user',
    x: 608,
    y: 642,
    w: 288,
    ports: ['in', 'out'],
    icon: 'spark',
    tile: '#231a12',
    glyph: '#d9b48f',
  },
]

/*
 * Wires run port to port and always left to right: the upstream card's out
 * port on its right edge into the downstream card's in port on its left.
 * Nothing is wired to the mark itself. All four pairs already flow left to
 * right at these coordinates, so no endpoint swap is needed.
 */
const PAIRS = [
  [0, 2],
  [1, 5],
  [2, 3],
  [5, 4],
]

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export const LINKS = PAIRS.map(([from, to]) => {
  const a = NODES[from]
  const b = NODES[to]
  const ax = a.x + a.w
  const ay = a.y + PORT_CENTRE
  const bx = b.x
  const by = b.y + PORT_CENTRE
  const bend = clamp(Math.abs(bx - ax) * 0.5, 46, 150)
  return {
    id: `${a.id}-${b.id}`,
    from,
    to,
    d: `M ${ax} ${ay} C ${ax + bend} ${ay}, ${bx - bend} ${by}, ${bx} ${by}`,
  }
})
