import { Code } from '@phosphor-icons/react/dist/csr/Code'
import { PencilSimple } from '@phosphor-icons/react/dist/csr/PencilSimple'
import { Play } from '@phosphor-icons/react/dist/csr/Play'
import { SealCheck } from '@phosphor-icons/react/dist/csr/SealCheck'
import { Sparkle } from '@phosphor-icons/react/dist/csr/Sparkle'
import { Trash } from '@phosphor-icons/react/dist/csr/Trash'
import { TreeStructure } from '@phosphor-icons/react/dist/csr/TreeStructure'
import { Brain } from '@phosphor-icons/react/dist/csr/Brain'

import { FIELD_H, FIELD_W, LINKS, NODES } from './nodes'

/*
 * Node-type glyphs. The handoff's originals were abstract stand-ins for the
 * real provider marks (OpenAI, Bedrock, Anthropic), which are not in this
 * repo's asset set; these are the closest semantic equivalents from the one
 * icon family the project uses. Swap in the provider logos when they land.
 */
const GLYPHS = {
  play: Play,
  model: Brain,
  split: TreeStructure,
  code: Code,
  review: SealCheck,
  spark: Sparkle,
}

/**
 * The field behind the mark: six agent-flow cards and the four wires between
 * them, laid out in a fixed 1600x900 space. Purely presentational — every
 * animated value is written by the splash frame loop through these refs.
 */
export function NodeField({ fieldRef, cardRefs, wireRefs }) {
  return (
    <div ref={fieldRef} className="splash-field" aria-hidden="true">
      <svg
        className="splash-links"
        viewBox={`0 0 ${FIELD_W} ${FIELD_H}`}
        preserveAspectRatio="none"
      >
        {LINKS.map((link, i) => (
          <path
            key={link.id}
            ref={(el) => {
              wireRefs.current[i] = el
            }}
            d={link.d}
          />
        ))}
      </svg>

      {NODES.map((node, i) => {
        const Glyph = GLYPHS[node.icon]
        return (
          <div
            key={node.id}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className="splash-card"
            style={{ left: node.x, top: node.y, width: node.w }}
          >
            <div className="splash-head">
              <span className="splash-tile" style={{ background: node.tile }}>
                <Glyph size={16} color={node.glyph} />
              </span>
              <div className="splash-meta">
                <div className="splash-ttl">{node.title}</div>
                {node.sub ? <div className="splash-sub">{node.sub}</div> : null}
                {node.chip ? <div className="splash-chip">{node.chip}</div> : null}
              </div>
              <div className="splash-acts">
                <PencilSimple size={15} color="#9aa1a9" />
                <Trash size={15} color="#e5484d" />
              </div>
            </div>
            <div className="splash-desc">{node.desc}</div>
            {node.ports.includes('in') ? <span className="splash-port splash-port-in" /> : null}
            {node.ports.includes('out') ? <span className="splash-port splash-port-out" /> : null}
          </div>
        )
      })}
    </div>
  )
}
