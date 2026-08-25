import { about } from '@/content/about'
import { hero } from '@/content/hero'
import { useReveal } from '@/hooks/useReveal'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'

/**
 * "What is TORUK" — the page's first inverted composition: the image takes the
 * left two-thirds and bleeds off the frame edge, the argument sits right.
 *
 * The crop is a macro of the same chain link, rotated far enough that it reads
 * as a different photograph. That is the whole trick keeping this page image-led
 * on a single asset.
 */
export function About() {
  const { ref, revealed } = useReveal()

  return (
    <Section id="platform" flush className="lg:min-h-[44rem]">
      <div className="grid items-stretch gap-0 lg:grid-cols-[57fr_43fr]">
        {/* macro crop, bleeds off the left edge */}
        <div
          ref={ref}
          className="reveal relative order-2 min-h-[18rem] overflow-hidden border-hairline lg:order-1 lg:min-h-full lg:border-e"
          data-revealed={revealed}
        >
          <img
            src={hero.artwork.src}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute top-1/2 left-[44%] max-w-none -translate-x-1/2 -translate-y-1/2"
            style={{ width: '190%', transform: 'translate(-50%, -50%) rotate(64deg)' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,3,3,0.6)_0%,transparent_35%,transparent_60%,rgba(3,3,3,0.92)_100%)]" />
          <p className="font-display absolute bottom-6 left-gutter text-micro tracking-[0.14em] text-ink-faint uppercase lg:bottom-8">
            {about.figure}
          </p>
        </div>

        {/* argument */}
        <div className="order-1 flex flex-col justify-center px-gutter py-section lg:order-2 lg:ps-[clamp(2rem,4vw,4rem)] lg:pe-gutter">
          <SectionHeading
            index={about.index}
            label={about.label}
            title={about.title}
            headingClassName="max-w-[26rem]"
          />

          <p className="font-display mt-6 max-w-[32rem] text-body leading-[1.68] text-ink-faint">
            {about.body.map((part, i) => (
              <span key={i} className={part.strong ? 'text-ink' : undefined}>
                {part.text}
              </span>
            ))}
          </p>

          <ul className="mt-10 border-t border-hairline">
            {about.points.map((point, i) => (
              <li
                key={point.id}
                className="flex items-center justify-between border-b border-hairline py-4"
              >
                <span className="font-display text-label tracking-[0.14em] text-ink uppercase">
                  {point.title}
                </span>
                <span className="font-display text-micro text-ink-faint tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </li>
            ))}
          </ul>

          <a
            href={about.cta.href}
            className="font-display mt-9 inline-flex w-fit items-center gap-2 border-b border-hairline-strong pb-1.5 text-label tracking-[0.1em] text-ink uppercase transition-colors duration-200 hover:border-ink"
          >
            {about.cta.label}
            <svg viewBox="0 0 14 10" aria-hidden="true" className="w-3 stroke-ink" strokeWidth="1.25" fill="none">
              <path d="M0 5h12M8.5 1.5L12 5l-3.5 3.5" />
            </svg>
          </a>
        </div>
      </div>
    </Section>
  )
}
