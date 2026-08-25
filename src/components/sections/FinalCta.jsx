import { cta } from '@/content/cta'
import { hero } from '@/content/hero'
import { useReveal } from '@/hooks/useReveal'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { Button } from '@/components/ui/Button'

/**
 * The closing band. Composition is centred low over the artwork — the same
 * arrangement as the hero turned upside down, which is what makes the page feel
 * like it closes rather than simply stops.
 *
 * Deliberately the page's largest type and its smallest amount of content.
 */
export function FinalCta() {
  const { ref: trackRef, progress } = useScrollProgress()
  const { ref, revealed } = useReveal()

  const step = (i) => ({
    'data-revealed': revealed,
    style: { '--reveal-delay': `${i * 90}ms` },
  })

  return (
    <section
      id="get-started"
      ref={trackRef}
      className="relative isolate flex min-h-[42rem] w-full flex-col justify-end overflow-hidden bg-canvas pb-[clamp(4rem,8vw,7.5rem)] lg:min-h-svh"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
       
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_28%,transparent_0%,rgba(3,3,3,0.72)_55%,#030303_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-[linear-gradient(to_top,#030303_26%,transparent)]" />
      </div>

      <div
        ref={ref}
        className="mx-auto flex w-full max-w-[100rem] flex-col items-center px-gutter text-center"
      >
        <p
          className="reveal font-display flex items-center gap-3 text-label tracking-[0.16em] text-ink-faint uppercase"
          {...step(0)}
        >
          <span className="tabular-nums">{cta.index}</span>
          <span aria-hidden="true" className="h-px w-6 bg-hairline-strong" />
          <span>{cta.label}</span>
        </p>

        <h2
          className="reveal font-display mt-6 max-w-[52rem] text-display leading-[1.14] font-light text-ink uppercase"
          {...step(1)}
        >
          {cta.title}
        </h2>

        <p
          className="reveal font-display mt-6 max-w-[28rem] text-body leading-[1.68] text-ink-muted"
          {...step(2)}
        >
          {cta.lede}
        </p>

        <div className="reveal mt-9 flex flex-wrap justify-center gap-4" {...step(3)}>
          <Button href={cta.primaryCta.href}>{cta.primaryCta.label}</Button>
          <Button href={cta.secondaryCta.href} variant="outline">
            {cta.secondaryCta.label}
          </Button>
        </div>

        <p
          className="reveal font-display mt-8 text-micro tracking-[0.16em] text-ink-faint uppercase"
          {...step(4)}
        >
          {cta.trust}
        </p>
      </div>
    </section>
  )
}
