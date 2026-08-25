import { demo } from '@/content/demo'
import { hero } from '@/content/hero'
import { useReveal } from '@/hooks/useReveal'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { Section, Container } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'

/**
 * The demo band. The player frame scales up as the section crosses the
 * viewport — a small, cheap scrub that makes the first scroll off the hero feel
 * like the page is opening rather than simply moving.
 *
 * The poster is the hero's own chain render at a different crop and rotation,
 * not a second asset: the page has exactly one photographic object in it, and
 * every appearance is that object seen from somewhere else.
 *
 * This is also the band that covers the sticky hero, so it carries the seam: a
 * rounded top edge and a hairline across it. The radius is what makes the
 * stack legible — for the length of the hand-off the dimmed hero shows through
 * at both top corners, which is the whole tell that one sheet is sliding over
 * another rather than simply scrolling into place.
 */
export function DemoVideo() {
  const { ref: trackRef, progress } = useScrollProgress()
  const { ref, revealed } = useReveal()

  /* 0.92 → 1 across the first two-thirds of the pass, then held. Scaling the
   * frame rather than the image keeps the poster's own crop stable. */
  const scale = 0.92 + 0.08 * Math.min(1, progress / 0.66)

  return (
    <Section
      id="demo"
      className="rounded-t-[1.5rem] border-t border-hairline md:rounded-t-[2rem]"
    >
      {/* The scrub is measured on this wrapper rather than the <Section> so the
          band's own vertical padding is not counted as travel. */}
      <div ref={trackRef}>
        <Container>
          <SectionHeading
            index={demo.index}
            label={`${demo.label} · ${demo.duration}`}
            title={demo.title}
            lede={demo.lede}
            align="center"
            headingClassName="max-w-[38rem]"
          />

          <div
            ref={ref}
            className="reveal mt-14 lg:mt-20"
            data-revealed={revealed}
            style={{ '--reveal-delay': '120ms' }}
          >
            <div
              className="relative mx-auto w-full max-w-[68rem] will-change-transform"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center top',
              }}
            >
              {/* Crop marks. A quiet print-production tell that frames the
                  player as a plate rather than an embed. */}
              <CropMarks />

              <div className="relative aspect-[16/9] overflow-hidden rounded-[0.875rem] border border-hairline bg-canvas-raised">
                
                <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_50%,transparent,rgba(3,3,3,0.78))]" />

                {/* chrome */}
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-5">
                  <span className="font-display flex items-center gap-2 text-micro tracking-[0.14em] text-ink-muted uppercase">
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-ink"
                    />
                    {demo.environment}
                  </span>
                  <span className="font-display hidden text-micro tracking-[0.14em] text-ink-faint uppercase sm:block">
                    1440 × 900
                  </span>
                </div>

                <button
                  type="button"
                  aria-label={`Play the ${demo.duration} product tour`}
                  className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-hairline-strong bg-canvas/40 backdrop-blur-[2px] transition-colors duration-200 hover:bg-canvas/70 sm:size-[4.5rem]"
                >
                  <svg
                    viewBox="0 0 15 18"
                    aria-hidden="true"
                    className="ms-1 w-3 fill-ink"
                  >
                    <path d="M0 0l15 9L0 18z" />
                  </svg>
                </button>

                {/* scrubber */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <div className="relative h-0.5 w-full rounded-full bg-ink/16">
                    <div className="absolute inset-y-0 left-0 w-[34%] rounded-full bg-ink" />
                    <span
                      aria-hidden="true"
                      className="absolute top-1/2 left-[34%] size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink"
                    />
                  </div>
                  <div className="font-display mt-2.5 flex justify-between text-micro tracking-[0.14em] text-ink-faint tabular-nums">
                    <span>00:54</span>
                    <span>{demo.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* chapters */}
          <ul className="mx-auto mt-12 grid w-full max-w-[68rem] grid-cols-2 gap-x-8 border-t border-hairline lg:grid-cols-4 lg:gap-x-0">
            {demo.chapters.map((chapter, i) => (
              <li
                key={chapter.time}
                className="flex flex-col gap-2 border-hairline py-5 lg:border-s lg:ps-6 lg:first:border-s-0 lg:first:ps-0"
              >
                <span className="font-display text-micro tracking-[0.14em] text-ink-faint tabular-nums">
                  {chapter.time}
                </span>
                <span className="font-display text-label leading-[1.4] text-ink-muted">
                  {chapter.title}
                </span>
                <span className="sr-only">{`Chapter ${i + 1}`}</span>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </Section>
  )
}

/** Four L-shaped registration marks, one per corner of the plate. */
function CropMarks() {
  const corner =
    'pointer-events-none absolute size-3 before:absolute before:h-px before:w-3 before:bg-hairline-strong after:absolute after:h-3 after:w-px after:bg-hairline-strong'

  return (
    <>
      <span aria-hidden="true" className={`${corner} -top-5 -left-5`} />
      <span
        aria-hidden="true"
        className={`${corner} -top-5 -right-5 before:right-0 after:right-0`}
      />
      <span
        aria-hidden="true"
        className={`${corner} -bottom-5 -left-5 before:bottom-0 after:bottom-0`}
      />
      <span
        aria-hidden="true"
        className={`${corner} -right-5 -bottom-5 before:right-0 before:bottom-0 after:right-0 after:bottom-0`}
      />
    </>
  )
}
