import { useMemo } from 'react'
import { CANVAS, KINDS, buildCircuitry } from '@/lib/circuitry'


function Glyph({ kind }) {
  switch (kind) {
    case 'circle-dot':
      return (
        <>
          <circle cx="8" cy="8" r="5.5" fill="none" strokeWidth="1.1" />
          <circle cx="8" cy="8" r="1.6" strokeWidth="0" fill="currentColor" />
        </>
      )
    case 'brackets':
      return <path d="M6 3 3 8l3 5M10 3l3 5-3 5" fill="none" strokeWidth="1.1" />
    case 'stack':
      return <path d="M3 5h10M3 8h10M3 11h6" fill="none" strokeWidth="1.1" />
    case 'cylinder':
      return (
        <>
          <rect x="3" y="4" width="10" height="8" rx="3" fill="none" strokeWidth="1.1" />
          <path d="M3 8h10" fill="none" strokeWidth="1.1" />
        </>
      )
    case 'chevrons':
      return <path d="M6.5 4 3.5 8l3 4M9.5 4l3 4-3 4" fill="none" strokeWidth="1.1" />
    case 'diamond':
      return <path d="M8 2.5 13.5 8 8 13.5 2.5 8Z" fill="none" strokeWidth="1.1" />
    case 'branch':
      return <path d="M3 8h4m0 0 3-3.5m-3 3.5 3 3.5M13 4.5h-3M13 11.5h-3" fill="none" strokeWidth="1.1" />
    case 'link':
      return (
        <>
          <rect x="2.5" y="5.5" width="6" height="5" rx="1.6" fill="none" strokeWidth="1.1" />
          <rect x="7.5" y="5.5" width="6" height="5" rx="1.6" fill="none" strokeWidth="1.1" />
        </>
      )
    default:
      return null
  }
}

/** Front-to-back depth tiers. */
const TIER = [
  { edge: 0.5, node: 0.9, text: 0.72, sw: 1.15 },
  { edge: 0.3, node: 0.55, text: 0.4, sw: 0.95 },
  { edge: 0.17, node: 0.3, text: 0.2, sw: 0.8 },
  { edge: 0.1, node: 0.18, text: 0.12, sw: 0.7 },
]
const tierAt = (i) => TIER[Math.min(i, TIER.length - 1)]

export function ChainCircuitry() {
  const { nodes, edges, node: N } = useMemo(buildCircuitry, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        // Spotlight. `--s-on` fades the whole layer out when the pointer leaves.
        maskImage:
          'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.82) 34%, rgba(0,0,0,0.32) 62%, rgba(0,0,0,0) 78%)',
        WebkitMaskImage:
          'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.82) 34%, rgba(0,0,0,0.32) 62%, rgba(0,0,0,0) 78%)',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskSize: 'var(--s-size, 620px) var(--s-size, 620px)',
        WebkitMaskSize: 'var(--s-size, 620px) var(--s-size, 620px)',
        // Centre the gradient on the cursor.
        maskPosition: 'calc(var(--sx, 50%) - var(--s-size, 620px) / 2) calc(var(--sy, 50%) - var(--s-size, 620px) / 2)',
        WebkitMaskPosition: 'calc(var(--sx, 50%) - var(--s-size, 620px) / 2) calc(var(--sy, 50%) - var(--s-size, 620px) / 2)',
        opacity: 'var(--s-on, 0)',
        transition: 'opacity 520ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Mirrors ChainBackdrop's cover wrapper so this box tracks the artwork. */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          aspectRatio: '1440 / 1024',
          width: 'max(100%, calc(100svh * 1440 / 1024))',
        }}
      >
       
        <div
          className="absolute inset-0"
          style={{
            maskImage: 'url(/hero-loop-holes.webp)',
            WebkitMaskImage: 'url(/hero-loop-holes.webp)',
            maskSize: '100% 100%',
            WebkitMaskSize: '100% 100%',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
          }}
        >
          <svg
            viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
            preserveAspectRatio="none"
            className="size-full"
          >
            <defs>
              <pattern id="tk-grid" width="34" height="34" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#ffffff" opacity="0.16" />
              </pattern>
              <radialGradient id="tk-port" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width={CANVAS.w} height={CANVAS.h} fill="url(#tk-grid)" />

            {/* Connections under the nodes, back tiers first. */}
            {[3, 2, 1, 0].map((tier) =>
              edges
                .filter((e) => Math.min(e.tier, 3) === tier)
                .map((e, i) => (
                  <path
                    key={`e${tier}-${i}`}
                    d={e.d}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={tierAt(tier).sw}
                    strokeOpacity={tierAt(tier).edge}
                    strokeDasharray={e.dashed ? '5 7' : undefined}
                    strokeLinecap="round"
                  />
                )),
            )}

            {nodes.map((n) => {
              const t = tierAt(n.tier)
              const cy = n.y + N.h / 2
              return (
                <g key={n.id} color="#ffffff">
                  {/* Body */}
                  <rect
                    x={n.x}
                    y={n.y}
                    width={N.w}
                    height={N.h}
                    rx={N.r}
                    fill="#080808"
                    fillOpacity={t.node * 0.85}
                    stroke="#ffffff"
                    strokeOpacity={t.node * 0.42}
                    strokeWidth={t.sw}
                  />
                  {/* Glyph */}
                  <g
                    transform={`translate(${n.x + 14} ${n.y + 16})`}
                    stroke="#ffffff"
                    strokeOpacity={t.text}
                    color="#ffffff"
                  >
                    <Glyph kind={KINDS[n.kind].glyph} />
                  </g>
                  {/* Label + the thin rule that stands in for a sub-label */}
                  <text
                    x={n.x + 40}
                    y={n.y + 21}
                    fill="#ffffff"
                    fillOpacity={t.text}
                    fontSize="12.5"
                    letterSpacing="0.06em"
                    style={{ fontFamily: 'Satoshi, sans-serif', textTransform: 'uppercase' }}
                  >
                    {n.label}
                  </text>
                  <rect
                    x={n.x + 40}
                    y={n.y + 30}
                    width={N.w - 60}
                    height="1"
                    fill="#ffffff"
                    fillOpacity={t.text * 0.3}
                  />
                  {/* Ports, some with the soft glow */}
                  {n.glow && (
                    <circle cx={n.x + N.w} cy={cy} r="9" fill="url(#tk-port)" opacity={t.node * 0.7} />
                  )}
                  <circle cx={n.x} cy={cy} r="3" fill="#ffffff" fillOpacity={t.node * 0.75} />
                  <circle cx={n.x + N.w} cy={cy} r="3" fill="#ffffff" fillOpacity={t.node * 0.75} />
                  {/* Stage caption — build / orchestrate / deploy / govern */}
                  {n.stage && (
                    <text
                      x={n.x}
                      y={n.y - 12}
                      fill="#ffffff"
                      fillOpacity={t.text * 0.5}
                      fontSize="10.5"
                      letterSpacing="0.22em"
                      style={{ fontFamily: 'Satoshi, sans-serif' }}
                    >
                      {n.stage}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}
