import { useState } from 'react'
import { cn } from '@/lib/cn'
import { clients, clientsLabel } from '@/content/clients'

/**
 * The client strip at the foot of the hero. One row of marks, duplicated once
 * and translated by exactly half the track, which is a seamless loop for as
 * long as the two halves are identical — so the second copy is inert to
 * assistive tech and to the layout's own counting.
 *
 * The travel and the edge fade are both in the stylesheet (`.clients-*`); the
 * only thing React owns here is which marks failed to load, so a file that is
 * not committed yet leaves its slot empty rather than a broken-image glyph.
 */
function Row({ hidden }) {
  const [missing, setMissing] = useState(() => new Set())

  return (
    <ul className="clients-row" aria-hidden={hidden || undefined}>
      {clients.map((client) => (
        <li
          key={client.slug}
          className="clients-item"
          style={{ '--client-ratio': client.ratio }}
        >
          {!missing.has(client.slug) && (
            <img
              src={`/brand/clients/${client.slug}.svg`}
              alt={hidden ? '' : client.name}
              loading="lazy"
              decoding="async"
              draggable="false"
              onError={() =>
                setMissing((prev) => new Set(prev).add(client.slug))
              }
              className="size-full object-contain"
            />
          )}
        </li>
      ))}
    </ul>
  )
}

export function ClientsMarquee({ className }) {
  return (
    <div
      className={cn('clients-viewport', className)}
      role="group"
      aria-label={clientsLabel}
    >
      <div className="clients-track">
        <Row />
        <Row hidden />
      </div>
    </div>
  )
}
