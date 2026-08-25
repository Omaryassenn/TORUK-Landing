import { useState } from 'react'
import { faq } from '@/content/faq'
import { cn } from '@/lib/cn'
import { useReveal } from '@/hooks/useReveal'
import { Section, Container } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'

/**
 * The FAQ accordion.
 *
 * One panel open at a time, and the open row is tracked by id rather than index
 * so reordering the content file cannot silently change which answer is
 * showing on first paint.
 *
 * The expansion uses `grid-template-rows: 0fr → 1fr`, which animates to the
 * content's natural height without measuring it in JS. `min-h-0` on the inner
 * element is what makes the collapsed track actually collapse.
 */
export function Faq() {
  const [openId, setOpenId] = useState(faq.items[0].id)
  const { ref, revealed } = useReveal({ threshold: 0.05 })

  return (
    <Section id="faq">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-[clamp(2rem,5vw,6rem)]">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              index={faq.index}
              label={faq.label}
              title={faq.title}
              lede={faq.lede}
              headingClassName="max-w-[18rem]"
            />
            <a
              href={faq.cta.href}
              className="font-display mt-8 inline-flex w-fit items-center gap-2 border-b border-hairline pb-1.5 text-label tracking-[0.1em] text-ink-faint uppercase transition-colors duration-200 hover:border-hairline-strong hover:text-ink"
            >
              {faq.cta.label}
              <svg viewBox="0 0 14 10" aria-hidden="true" className="w-3 stroke-current" strokeWidth="1.25" fill="none">
                <path d="M0 5h12M8.5 1.5L12 5l-3.5 3.5" />
              </svg>
            </a>
          </div>

          <ul ref={ref} className="border-t border-hairline">
            {faq.items.map((item, i) => {
              const open = item.id === openId

              return (
                <li
                  key={item.id}
                  className="reveal border-b border-hairline"
                  data-revealed={revealed}
                  style={{ '--reveal-delay': `${i * 70}ms` }}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : item.id)}
                      aria-expanded={open}
                      aria-controls={`faq-panel-${item.id}`}
                      className="group flex w-full items-start gap-5 py-6 text-start sm:gap-6"
                    >
                      <span className="font-display mt-1 shrink-0 text-micro tracking-[0.14em] text-ink-faint tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={cn(
                          'font-display flex-1 text-card leading-[1.4] font-normal uppercase transition-colors duration-200',
                          open
                            ? 'text-ink'
                            : 'text-ink-muted group-hover:text-ink',
                        )}
                      >
                        {item.question}
                      </span>
                      <span
                        aria-hidden="true"
                        className="relative mt-2.5 size-3 shrink-0"
                      >
                        <span className="absolute top-1/2 left-0 h-px w-3 -translate-y-1/2 bg-ink" />
                        <span
                          className={cn(
                            'absolute top-0 left-1/2 h-3 w-px -translate-x-1/2 bg-ink transition-transform duration-300 ease-out-quint motion-reduce:transition-none',
                            open ? 'scale-y-0' : 'scale-y-100',
                          )}
                        />
                      </span>
                    </button>
                  </h3>

                  <div
                    id={`faq-panel-${item.id}`}
                    className={cn(
                      'grid transition-[grid-template-rows] duration-[420ms] ease-out-quint motion-reduce:transition-none',
                      open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                    )}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p className="font-display max-w-[44rem] pb-7 ps-[2.5rem] text-body leading-[1.68] text-ink-muted sm:ps-[2.75rem]">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </Container>
    </Section>
  )
}
