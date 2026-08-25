import { integrations } from '@/content/integrations'
import { useReveal } from '@/hooks/useReveal'
import { Section, Container } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'

/**
 * The connector grid — a gapless bento built from a 1px background showing
 * through the gaps, so the rules are shared rather than doubled at every seam.
 *
 * Cells reveal on a diagonal: the delay is a function of row + column, which
 * costs one expression and reads far better than a straight left-to-right
 * cascade across a wide grid.
 */
export function Integrations() {
  const { ref, revealed } = useReveal({ threshold: 0.1 })

  const columns = 5

  return (
    <Section id="connectors">
      <Container>
        <SectionHeading
          index={integrations.index}
          label={integrations.label}
          title={integrations.title}
          lede={integrations.lede}
          align="center"
          headingClassName="max-w-[34rem]"
        />

        <div
          ref={ref}
          className="mx-auto mt-14 grid w-full max-w-[74rem] grid-cols-2 gap-px overflow-hidden rounded-[0.875rem] border border-hairline bg-hairline sm:grid-cols-3 lg:mt-20 lg:grid-cols-5"
        >
          {integrations.items.map((item, i) => (
            <div
              key={item}
              className="reveal flex h-[6.5rem] items-center justify-center bg-canvas px-4 transition-colors duration-200 hover:bg-canvas-raised2"
              data-revealed={revealed}
              style={{
                '--reveal-delay': `${
                  ((i % columns) + Math.floor(i / columns)) * 45
                }ms`,
              }}
            >
              <span className="font-display text-center text-label tracking-[0.12em] text-ink-muted uppercase">
                {item}
              </span>
            </div>
          ))}

          <div
            className="reveal flex h-[6.5rem] flex-col items-center justify-center gap-1.5 bg-canvas-raised2 px-4"
            data-revealed={revealed}
            style={{ '--reveal-delay': '360ms' }}
          >
            <span className="font-display text-card leading-none font-light text-ink">
              {integrations.more.count}
            </span>
            <span className="font-display text-micro tracking-[0.14em] text-ink-faint uppercase">
              {integrations.more.note}
            </span>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href={integrations.cta.href}
            className="font-display inline-flex items-center gap-2 border-b border-hairline-strong pb-1.5 text-label tracking-[0.1em] text-ink uppercase transition-colors duration-200 hover:border-ink"
          >
            {integrations.cta.label}
            <svg viewBox="0 0 14 10" aria-hidden="true" className="w-3 stroke-ink" strokeWidth="1.25" fill="none">
              <path d="M0 5h12M8.5 1.5L12 5l-3.5 3.5" />
            </svg>
          </a>
        </div>
      </Container>
    </Section>
  )
}
