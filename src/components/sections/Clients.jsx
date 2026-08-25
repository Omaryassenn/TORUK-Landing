import { clients } from '@/content/clients'
import { useReveal } from '@/hooks/useReveal'
import { Container } from '@/components/ui/Section'

/**
 * The trust strip — deliberately the page's smallest band.
 *
 * It runs full-bleed rather than inside the gutter so the names travel in and
 * out of frame instead of popping at a container edge, and the track holds two
 * identical halves so the -50% loop is seamless. `aria-hidden` on the duplicate
 * keeps the row from being read twice.
 */
export function Clients() {
  const { ref, revealed } = useReveal()

  return (
    <section
      id="clients"
      aria-label="Customers"
      className="relative isolate w-full overflow-hidden bg-canvas py-16 lg:py-24"
    >
      <div
        ref={ref}
        className="reveal"
        data-revealed={revealed}
      >
        <div className="border-y border-hairline">
          <div className="marquee-mask flex w-full overflow-hidden">
            <div className="animate-marquee flex w-max shrink-0 items-center">
              <Track />
              <Track aria-hidden="true" />
            </div>
          </div>
        </div>

        <Container>
          <p className="font-display mt-7 text-center text-label tracking-[0.16em] text-ink-faint uppercase">
            {clients.caption}
          </p>
        </Container>
      </div>
    </section>
  )
}

function Track(props) {
  return (
    <ul className="flex shrink-0 items-center" {...props}>
      {clients.names.map((name) => (
        <li
          key={name}
          className="font-display px-[3.5vw] py-9 text-[clamp(1.125rem,1.6vw,1.75rem)] leading-none font-light tracking-[0.2em] whitespace-nowrap text-ink-muted"
        >
          {name}
        </li>
      ))}
    </ul>
  )
}
