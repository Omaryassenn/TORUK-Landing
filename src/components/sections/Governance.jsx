import { governance } from '@/content/governance'
import { hero } from '@/content/hero'
import { useReveal } from '@/hooks/useReveal'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/ui/SectionHeading'

/**
 * The proof band, and the page's only full-bleed photographic section.
 *
 * Composition is bottom-left over the image with the control list held right,
 * which is the inverse of every other band — this is the one place the page
 * lets the artwork carry the frame rather than sit beside the argument.
 *
 * The `§ GOV — 04 / 09` rail on the left edge is the page's single
 * second-read device: a dossier marker that suits a section about audit, and
 * appears exactly once so it stays a detail rather than a motif.
 */
export function Governance() {
  const { ref: trackRef, progress } = useScrollProgress()
  const { ref, revealed } = useReveal()

  /* Slow counter-drift on the backdrop. Small on purpose — enough to separate
   * the plate from the copy, not enough to notice as an effect. */
  const drift = (progress - 0.5) * 6

  return (
    <section
      id="governance"
      ref={trackRef}
      className="relative isolate flex min-h-[46rem] w-full flex-col justify-end overflow-hidden bg-canvas py-section lg:min-h-svh"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
       
        <div className="absolute inset-0 bg-[linear-gradient(20deg,#030303_12%,rgba(3,3,3,0.88)_44%,rgba(3,3,3,0.4)_78%,rgba(3,3,3,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(110%_90%_at_18%_92%,rgba(3,3,3,0.92)_0%,transparent_62%)]" />
      </div>

      {/* dossier rail */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-gutter hidden w-px bg-hairline lg:block"
      />
      <span
        aria-hidden="true"
        className="font-display absolute top-[7.5rem] left-[calc(var(--spacing-gutter)+0.875rem)] hidden text-micro tracking-[0.16em] text-ink-faint uppercase lg:block"
      >
        § Gov
      </span>
      <span
        aria-hidden="true"
        className="font-display absolute bottom-8 left-[calc(var(--spacing-gutter)+0.875rem)] hidden text-micro tracking-[0.16em] text-ink-faint tabular-nums lg:block"
      >
        04 / 09
      </span>

      <div className="mx-auto grid w-full max-w-[100rem] grid-cols-1 items-end gap-12 px-gutter lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:ps-[calc(var(--spacing-gutter)+4rem)]">
        <div>
          <SectionHeading
            index={governance.index}
            label={governance.label}
            title={governance.title}
            lede={governance.lede}
            headingClassName="max-w-[32rem] text-display leading-[1.16] font-light"
          />
          <Button
            href={governance.cta.href}
            variant="outline"
            className="mt-9"
          >
            {governance.cta.label}
          </Button>
        </div>

        <ul
          ref={ref}
          className="reveal rounded-[0.875rem] border border-hairline bg-canvas/55 px-6 backdrop-blur-[2px]"
          data-revealed={revealed}
          style={{ '--reveal-delay': '140ms' }}
        >
          {governance.controls.map((control) => (
            <li
              key={control.id}
              className="flex items-center justify-between gap-4 border-b border-hairline py-4 last:border-b-0"
            >
              <span className="font-display text-label leading-[1.35] tracking-[0.12em] text-ink uppercase">
                {control.title}
              </span>
              <span className="font-display shrink-0 text-micro tracking-[0.12em] text-ink-faint uppercase">
                {control.standard}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
