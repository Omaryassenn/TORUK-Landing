import { hero } from '@/content/hero'
import { useReveal } from '@/hooks/useReveal'
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
 */
export function Hero() {
  const { ref, revealed } = useReveal()

  /** Cascades the eyebrow → headline → CTAs → capability list. */
  const step = (index) => ({
    'data-revealed': revealed,
    style: { '--reveal-delay': `${index * 90}ms` },
  })

  return (
    <section
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-canvas"
    >
      <ChainBackdrop />

      <div
        ref={ref}
        className="relative z-10 flex w-full flex-1 flex-col px-6 pt-hero-top pb-[2.0625rem]"
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

        <ul
          className="reveal font-display mt-auto list-disc ps-[1.875rem] pt-12 text-capability leading-[1.4] font-light text-ink uppercase lg:self-end lg:pt-0"
          {...step(3)}
        >
          {hero.capabilities.map((capability) => (
            <li key={capability} className="whitespace-nowrap">
              {capability}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
