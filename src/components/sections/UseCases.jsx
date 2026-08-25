import { useCases } from '@/content/useCases'
import { hero } from '@/content/hero'
import { cn } from '@/lib/cn'
import { Section, Container } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'

const { cards } = useCases

/**
 * The card-stack scroll.
 *
 * Every card is `sticky` at the same offset, so as the page scrolls each one
 * comes to rest and the next slides over it — the cards physically pile up
 * rather than scrolling past. The trick is entirely CSS; the only thing the JS
 * would add is the scale-down of buried cards, and that is not worth a scroll
 * listener when the overlap already reads.
 *
 * Each card is given a slightly larger top offset than the one before it so a
 * sliver of every buried card stays visible — without that the pile looks like
 * a single card that keeps changing its mind.
 */
export function UseCases() {
  return (
    <Section id="use-cases">
      <Container>
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <SectionHeading
            index={useCases.index}
            label={useCases.label}
            title={useCases.title}
            lede={useCases.lede}
            headingClassName="max-w-[24rem]"
            className="max-w-[36rem]"
          />
          <a
            href={useCases.cta.href}
            className="font-display shrink-0 border-b border-hairline pb-1.5 text-label tracking-[0.1em] text-ink-faint uppercase transition-colors duration-200 hover:border-hairline-strong hover:text-ink"
          >
            {useCases.cta.label}
          </a>
        </div>

        {/* The stack. `pb` at the end gives the last card room to settle before
            the next band arrives. */}
        <ul className="mt-14 lg:mt-20">
          {cards.map((card, i) => (
            <li
              key={card.id}
              className="sticky"
              style={{
                /* 6.5rem clears the sticky header area; each card then steps
                   down by 1.15rem so the pile shows its edges. */
                top: `calc(6.5rem + ${i * 1.15}rem)`,
                marginBottom: i === cards.length - 1 ? 0 : '1.5rem',
                zIndex: i + 1,
              }}
            >
              <UseCaseCard card={card} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}

function UseCaseCard({ card }) {
  const surfaces = {
    image: 'bg-canvas-raised',
    raised: 'bg-canvas-raised2',
    flat: 'bg-canvas-raised',
  }

  return (
    <article
      className={cn(
        'relative grid min-h-[19rem] grid-cols-1 overflow-hidden rounded-[0.875rem] border border-hairline lg:min-h-[21rem] lg:grid-cols-[1.15fr_1fr]',
        surfaces[card.tone],
      )}
    >
      <div className="flex flex-col p-7 sm:p-9 lg:p-10">
        <div className="flex items-center gap-3.5">
          <span className="font-display text-micro tracking-[0.14em] text-ink tabular-nums">
            {card.number}
          </span>
          <span aria-hidden="true" className="h-px w-6 bg-hairline-strong" />
          <span className="font-display text-micro tracking-[0.14em] text-ink-faint uppercase">
            {card.sector}
          </span>
        </div>

        <h3 className="font-display mt-auto pt-10 text-card leading-[1.3] font-normal text-ink uppercase">
          {card.title}
        </h3>
        <p className="font-display mt-3 max-w-[32rem] text-body leading-[1.68] text-ink-muted">
          {card.body}
        </p>

        <p className="font-display mt-7 border-t border-hairline pt-4 text-label tracking-[0.06em] text-ink">
          {card.metric}
        </p>
      </div>

      {/* Only the `image` cards carry the cable, so the stack alternates
          between photographic and flat as it piles. */}
      {card.tone === 'image' ? (
        <div className="relative hidden overflow-hidden border-s border-hairline lg:block">
          <img
            src={hero.artwork.src}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute top-1/2 left-1/2 max-w-none"
            style={{
              width: '175%',
              transform: `translate(-50%, -50%) rotate(${
                card.number === '01' ? 28 : -52
              }deg)`,
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_left,transparent_20%,rgba(3,3,3,0.55)_100%)]" />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="dot-field relative hidden border-s border-hairline opacity-45 lg:block [mask-image:radial-gradient(90%_80%_at_60%_50%,#000_20%,transparent_100%)]"
        />
      )}
    </article>
  )
}
