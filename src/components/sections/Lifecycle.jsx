import { lifecycle } from '@/content/lifecycle'
import { hero } from '@/content/hero'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { SectionHeading } from '@/components/ui/SectionHeading'

const { stages } = lifecycle

/**
 * The pinned lifecycle sequence — the page's one long-form scroll moment.
 *
 * The outer element is `stages.length` viewports tall and the panel inside it
 * is `sticky`, so the section holds still while the scroll position selects a
 * stage. That is the whole mechanism: no scroll library, no pinning runtime,
 * just a tall track and one `position: sticky` child.
 *
 * Cards are laid out as a deck rather than a list. Each one's distance from the
 * active index drives its depth — past cards fall away upward, upcoming cards
 * sit stacked and dimmed below — which reads as a physical pile advancing one
 * card at a time instead of five panels cross-fading.
 *
 * With motion reduced `useScrollProgress` parks at 0 and the section renders as
 * a static first stage above a legible list of the rest; nothing is lost, it
 * simply stops moving.
 */
export function Lifecycle() {
  const { ref, progress } = useScrollProgress()

  /* The last stage needs a full step of its own, so the progress range is
   * divided into `length` bands rather than `length - 1` boundaries. */
  const active = Math.min(
    stages.length - 1,
    Math.floor(progress * stages.length),
  )

  return (
    <section
      id="lifecycle"
      ref={ref}
      className="relative isolate w-full bg-canvas"
      style={{ height: `${stages.length * 100}svh` }}
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div
          aria-hidden="true"
          className="dot-field pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(120%_100%_at_50%_50%,#000_35%,transparent_100%)]"
        />

        <div className="relative mx-auto grid w-full max-w-[100rem] grid-cols-1 gap-10 px-gutter lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-[clamp(2rem,5vw,6rem)]">
          {/* pinned rail */}
          <div className="flex flex-col justify-center">
            <SectionHeading
              index={lifecycle.index}
              label={lifecycle.label}
              title={lifecycle.title}
              lede={lifecycle.lede}
              headingClassName="max-w-[20rem]"
            />

            {/* progress segments */}
            <div className="mt-10 flex gap-1.5 lg:mt-14">
              {stages.map((stage, i) => (
                <span
                  key={stage.id}
                  className="h-0.5 flex-1 overflow-hidden rounded-full bg-ink/16"
                >
                  <span
                    className="block h-full origin-left rounded-full bg-ink transition-transform duration-500 ease-out-quint"
                    style={{ transform: `scaleX(${i <= active ? 1 : 0})` }}
                  />
                </span>
              ))}
            </div>

            <p
              aria-live="polite"
              className="font-display mt-4 text-micro tracking-[0.14em] text-ink-faint uppercase tabular-nums"
            >
              {`Stage ${String(active + 1).padStart(2, '0')} / ${String(
                stages.length,
              ).padStart(2, '0')} — ${stages[active].title}`}
            </p>
          </div>

          {/* deck */}
          <div className="relative h-[22rem] sm:h-[24rem] lg:h-[26rem]">
            {stages.map((stage, i) => (
              <StageCard
                key={stage.id}
                stage={stage}
                index={i}
                offset={i - active}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * One card in the deck. `offset` is its distance from the active stage:
 * negative is spent, zero is showing, positive is queued behind.
 */
function StageCard({ stage, index, offset }) {
  const past = offset < 0
  const upcoming = offset > 0
  /* Only the two cards behind the active one are drawn — past that the stack
   * adds nothing but overdraw. */
  const depth = Math.min(offset, 3)

  const style = {
    transform: past
      ? 'translate3d(0, -14%, 0) scale(0.96)'
      : `translate3d(0, ${depth * 1.35}rem, 0) scale(${1 - depth * 0.035})`,
    opacity: past ? 0 : upcoming ? Math.max(0, 0.55 - (depth - 1) * 0.2) : 1,
    zIndex: stages.length - Math.abs(offset),
    pointerEvents: offset === 0 ? 'auto' : 'none',
  }

  return (
    <article
      aria-hidden={offset !== 0}
      className="absolute inset-x-0 top-0 flex h-full overflow-hidden rounded-[0.875rem] border border-hairline bg-canvas-raised transition-[transform,opacity] duration-[600ms] ease-out-quint will-change-transform motion-reduce:transition-none"
      style={style}
    >
      <div className="flex flex-1 flex-col p-7 sm:p-9">
        <div className="flex items-center gap-3.5">
          <span className="font-display text-micro tracking-[0.14em] text-ink tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span aria-hidden="true" className="h-px w-6 bg-hairline-strong" />
          <span className="font-display text-label tracking-[0.14em] text-ink uppercase">
            {stage.title}
          </span>
        </div>

        <h3 className="font-display mt-auto text-card leading-[1.3] font-normal text-ink uppercase">
          {stage.summary}
        </h3>
        <p className="font-display mt-3 max-w-[30rem] text-body leading-[1.68] text-ink-muted">
          {stage.body}
        </p>
      </div>

      {/* Each card shows the cable at its own angle, so advancing the deck also
          advances the photograph. */}
      <div className="relative hidden w-[16rem] shrink-0 overflow-hidden border-s border-hairline lg:block xl:w-[19rem]">
        
        <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_50%,transparent,rgba(3,3,3,0.65))]" />
      </div>
    </article>
  )
}
