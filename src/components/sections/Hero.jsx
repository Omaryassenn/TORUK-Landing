import { hero } from '@/content/hero'
import { useReveal } from '@/hooks/useReveal'
import { useSplash } from '@/components/splash/context'
import { Button } from '@/components/ui/Button'
import { ChainBackdrop } from '@/components/sections/ChainBackdrop'
import { ClientsMarquee } from '@/components/sections/ClientsMarquee'


/*
 * The client logo strip is off the hero for now, on request.
 *
 * A flag rather than a deletion or a commented-out block: the strip is a
 * caption and a marquee that only work as a pair, and both carry notes that
 * would be lost. This also keeps it compiling — the import stays used, so
 * putting the strip back is one word here and nothing else.
 */
const SHOW_CLIENT_STRIP = false

export function Hero() {
  const { ref, revealed } = useReveal()
  const { active: splashActive, contentReady } = useSplash()

  const shown = revealed && contentReady

  /** Cascades the eyebrow → headline → sub-line → CTAs → client strip. */
  const step = (index) => ({
    'data-revealed': shown,
    style: { '--reveal-delay': `${index * 90}ms` },
  })

  return (
    <section
      inert={splashActive}
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-canvas"
    >
      <ChainBackdrop />

      <div
        ref={ref}
        /*
         * One composition at every width: the copy hangs from the top on
         * `pt-hero-top` and the chain sits underneath it. Mobile used to invert
         * this — chain across the upper screen, copy pinned to the bottom edge
         * — which read as a different page rather than a narrower one, and it
         * put the headline on top of the artwork's lit strands.
         *
         * `flex-1` still belongs here: it is what pushes the client strip onto
         * the foot of the viewport rather than letting it ride up under the
         * CTAs on a tall phone.
         */
        className="relative z-10 flex w-full flex-1 flex-col justify-start px-6 pt-hero-top pb-[2.0625rem]"
      >
        <div className="flex max-w-hero-copy flex-col gap-[0.7rem]">
          <p
            className="reveal text-gradient-eyebrow font-display w-fit text-eyebrow leading-[1.333] font-light uppercase"
            {...step(0)}
          >
            {hero.eyebrow}
          </p>

          <div className="flex flex-col gap-[1.5rem]">
            {/*
              * Headline and its sub-line are one block on a tight gap, so they
              * read as a statement and its qualifier rather than as two
              * separate elements sharing the 1.5rem rhythm around them.
              */}
            <div className="flex flex-col gap-[0.75rem]">
              {/*
                * Sentence case, not caps. The weight step on the closing
                * phrase is what carries the emphasis, and under caps it is
                * invisible — every letter is already at full height.
                */}
              <h1
                className="reveal font-display max-w-headline text-headline leading-[1.2] font-normal text-ink"
                {...step(1)}
              >
                {hero.headline.lead}{' '}
               {hero.headline.emphasis}
              </h1>

              <p
                className="reveal font-display max-w-measure text-hero-body leading-[1.5] font-light text-ink-muted"
                {...step(2)}
              >
                {hero.body}
              </p>
            </div>

            {/*
              * Stacked and full-bleed below `md`, side by side above it. The
              * breakpoint is the type scale's own small-screen step, so the
              * whole mobile tier turns over at one width. Column mode stretches
              * the pills on its own; `w-full` states it anyway so the intent
              * survives someone changing the alignment.
              */}
            <div
              className="reveal flex flex-col gap-[1rem] md:flex-row md:flex-wrap md:items-center"
              {...step(3)}
            >
              <Button href={hero.primaryCta.href} className="w-full md:w-auto">
                {hero.primaryCta.label}
              </Button>
              <Button
                href={hero.secondaryCta.href}
                variant="outline"
                className="w-full md:w-auto"
              >
                {hero.secondaryCta.label}
              </Button>
            </div>
          </div>
        </div>

        {SHOW_CLIENT_STRIP && (
          <div className="reveal mt-auto pt-10" {...step(4)}>
            {/*
              * Names the strip on the page rather than only to assistive tech,
              * so the group below takes its accessible name from this line
              * instead of carrying a second, different one of its own.
              *
              * It sits inside the gutter while the strip stays full-bleed: the
              * marks run off both edges by design, but a caption that did the
              * same would read as clipped rather than as continuing.
              *
              * Centred on the strip's own axis, not the copy's. The gutter is
              * symmetric, so centring inside it centres on the viewport, which
              * is where the marks are centred too.
              *
              * One treatment across the whole line. Splitting it on colour to
              * lean on the copy's own case read as two labels rather than one
              * sentence at this size, so the caption takes a single weight and
              * colour throughout.
              */}
            <p
              id="clients-label"
              className="font-display text-micro leading-[1.4] font-light tracking-[0.08em] text-ink-muted text-center"
            >
              Engaged with Leading Organizations
            </p>

            <div className="-mx-6 pt-7">
              <ClientsMarquee labelledBy="clients-label" />
            </div>
          </div>
        )}

        {/* <ul
          className="reveal font-display mt-auto list-disc ps-[1.875rem] pt-12 text-capability leading-[1.4] font-light text-ink uppercase lg:self-end lg:pt-0"
          {...step(3)}
        >
          {hero.capabilities.map((capability) => (
            <li key={capability} className="whitespace-nowrap">
              {capability}
            </li>
          ))}
        </ul> */}
      </div>
    </section>
  )
}
