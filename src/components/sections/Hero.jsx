import { hero } from '@/content/hero'
import { useReveal } from '@/hooks/useReveal'
import { useViewportProgress } from '@/hooks/useViewportProgress'
import { useSplash } from '@/components/splash/context'
import { Button } from '@/components/ui/Button'
import { ChainBackdrop } from '@/components/sections/ChainBackdrop'

/**
 * Hero from Figma node 10017:152334 (frame 1440x1024). Design values:
 *
 *   text block   x 24,   y 193,  w 865  · gap 20 then 24
 *   eyebrow      24/32   Light,  hugs its text (see the gradient note in CSS)
 *   headline     32/42   Regular, w 720
 *   capabilities x 1130, y 879,  20/1.4 Light, 33px off the bottom
 *
 * The reveal cascade is the project's own scroll-entry pattern, not something
 * the frame specifies.
 *
 * Stacking: from `md` up the hero is `sticky` at the top of the viewport, so the
 * band below it slides up and over rather than pushing it off screen. As that
 * happens the hero recedes — a slight scale-down behind a darkening veil — which
 * is what sells the covering section as a card laid on top instead of a section
 * that merely arrived. Below `md` it stays in normal flow: a sticky element
 * taller than the viewport can never scroll to its own bottom edge, and on a
 * short phone the hero copy is exactly that.
 */
export function Hero() {
  const { ref, revealed } = useReveal()
  const { active: splashActive, contentReady } = useSplash()
  /* 0 → 1 across the first screen, which is exactly the span over which the
   * next band travels from the bottom of the viewport to fully covering this
   * one. */
  const covered = useViewportProgress(1)

  /*
   * On a first load the hero is already in view, so the observer fires straight
   * away — the splash holds the cascade back until the lockup is on its way to
   * the navbar, and the copy then rises through the clearing black layer rather
   * than waiting for it to finish.
   */
  const shown = revealed && contentReady

  /** Cascades the eyebrow → headline → CTAs → capability list. */
  const step = (index) => ({
    'data-revealed': shown,
    style: { '--reveal-delay': `${index * 90}ms` },
  })

  return (
    <section
      inert={splashActive}
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-canvas md:sticky md:top-0 md:h-svh md:min-h-0"
    >
      <ChainBackdrop />

      {/*
        * The veil. It sits above the artwork but below the copy so the whole
        * composition dims together as the next section climbs over it. Capped
        * well short of opaque — the covering section does the real occluding,
        * this only has to stop the hero from competing with it.
        */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] hidden bg-canvas md:block"
        style={{ opacity: covered * 0.72 }}
      />

      <div
        ref={ref}
        className="relative z-10 flex w-full flex-1 flex-col px-6 pt-hero-top pb-[2.0625rem]"
        /*
         * Scale only — no vertical offset. Moving the copy up as it dims reads
         * as a parallax bug once the covering section's edge is in frame.
         *
         * `will-change` is dropped the moment the hero is fully covered. The
         * sticky hero stays pinned behind the whole page, so promoting it for
         * the entire scroll would hold a viewport-sized layer alive long after
         * anything on it can be seen.
         */
        style={{
          transform: `scale(${1 - covered * 0.05})`,
          willChange: covered < 1 ? 'transform' : 'auto',
        }}
      >
        <div className="flex max-w-[54.0625rem] flex-col gap-[0.7rem]">
          <p
            className="reveal text-gradient-eyebrow font-display w-fit text-eyebrow leading-[1.333] font-light uppercase"
            {...step(0)}
          >
            {hero.eyebrow}
          </p>

          <div className="flex flex-col gap-[1.5rem]">
            <h1
              className="reveal font-display max-w-[45rem] text-headline leading-[1.3125] font-normal text-ink uppercase"
              {...step(1)}
            >
              {hero.headline}
            </h1>

            <div className="reveal flex flex-wrap items-center gap-[1rem]" {...step(2)}>
              <Button href={hero.primaryCta.href}>{hero.primaryCta.label}</Button>
              <Button href={hero.secondaryCta.href} variant="outline">
                {hero.secondaryCta.label}
              </Button>
            </div>
          </div>
        </div>

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
