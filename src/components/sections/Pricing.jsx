import { pricing } from '@/content/pricing'
import { cn } from '@/lib/cn'
import { useReveal } from '@/hooks/useReveal'
import { Button } from '@/components/ui/Button'
import { Section, Container } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'

/**
 * Pricing. The featured plan is distinguished by surface and border weight
 * rather than an accent colour — the palette here is monochrome by design, and
 * a lone tinted card would be the one thing on the page that broke it.
 *
 * The band sits on a soft top-lit gradient so the three cards read as objects
 * on a surface instead of holes cut in the page.
 */
export function Pricing() {
  const { ref, revealed } = useReveal({ threshold: 0.1 })

  return (
    <Section id="pricing" className="overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(90%_65%_at_50%_0%,#121212_0%,#030303_62%)]"
      />

      <Container>
        <SectionHeading
          index={pricing.index}
          label={pricing.label}
          title={pricing.title}
          lede={pricing.lede}
          align="center"
          headingClassName="max-w-[30rem]"
        />

        <div
          ref={ref}
          className="mx-auto mt-14 grid w-full max-w-[70rem] grid-cols-1 gap-5 lg:mt-20 lg:grid-cols-3"
        >
          {pricing.plans.map((plan, i) => (
            <article
              key={plan.id}
              className={cn(
                'reveal flex flex-col rounded-[0.875rem] border p-7 sm:p-8',
                plan.featured
                  ? 'border-hairline-strong bg-canvas-raised2 shadow-[0_1.875rem_5rem_rgba(0,0,0,0.8)] lg:-my-3 lg:py-11'
                  : 'border-hairline bg-canvas-raised',
              )}
              data-revealed={revealed}
              style={{ '--reveal-delay': `${i * 90}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-label tracking-[0.14em] text-ink uppercase">
                  {plan.name}
                </h3>
                {plan.badge ? (
                  <span className="font-display rounded-full border border-hairline-strong px-2.5 py-1 text-micro tracking-[0.12em] text-ink uppercase">
                    {plan.badge}
                  </span>
                ) : null}
              </div>

              <p className="font-display mt-3 min-h-[2.75rem] max-w-[18rem] text-body leading-[1.6] text-ink-faint">
                {plan.description}
              </p>

              <p className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-price leading-none font-light text-ink">
                  {plan.price}
                </span>
                {plan.period ? (
                  <span className="font-display text-micro tracking-[0.14em] text-ink-faint uppercase">
                    {plan.period}
                  </span>
                ) : null}
              </p>

              <ul className="mt-7 flex flex-col gap-3 border-t border-hairline pt-7">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={cn(
                      'font-display flex items-start gap-2.5 text-body leading-[1.5]',
                      plan.featured ? 'text-ink-muted' : 'text-ink-faint',
                    )}
                  >
                    <svg
                      viewBox="0 0 12 12"
                      aria-hidden="true"
                      className="mt-[0.35em] w-2.5 shrink-0 stroke-ink-faint"
                      strokeWidth="1.5"
                      fill="none"
                    >
                      <path d="M1 6.5L4.2 9.5L11 2.5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                href={plan.cta.href}
                variant={plan.featured ? 'solid' : 'outline'}
                className="mt-9 w-full"
              >
                {plan.cta.label}
              </Button>
            </article>
          ))}
        </div>

        <p className="font-display mt-10 text-center text-label text-ink-faint">
          {pricing.note}
        </p>
      </Container>
    </Section>
  )
}
