import { hero } from '@/content/hero'
import { useReveal } from '@/hooks/useReveal'
import { useSplash } from '@/components/splash/context'
import { Button } from '@/components/ui/Button'
import { ChainBackdrop } from '@/components/sections/ChainBackdrop'
import { ClientsMarquee } from '@/components/sections/ClientsMarquee'


export function Hero() {
  const { ref, revealed } = useReveal()
  const { active: splashActive, contentReady } = useSplash()

  const shown = revealed && contentReady

  /** Cascades the eyebrow → headline → CTAs → capability list. */
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
            <h1
              className="reveal font-display max-w-headline text-headline leading-[1.3125] font-normal text-ink uppercase"
              {...step(1)}
            >
              {hero.headline}
            </h1>

            {/*
              * Stacked and full-bleed below `md`, side by side above it. The
              * breakpoint is the type scale's own small-screen step, so the
              * whole mobile tier turns over at one width. Column mode stretches
              * the pills on its own; `w-full` states it anyway so the intent
              * survives someone changing the alignment.
              */}
            <div
              className="reveal flex flex-col gap-[1rem] md:flex-row md:flex-wrap md:items-center"
              {...step(2)}
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

        <div className="reveal mt-auto -mx-6 pt-10" {...step(3)}>
          <ClientsMarquee />
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
