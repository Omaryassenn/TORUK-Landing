import { cn } from '@/lib/cn'
import { useReveal } from '@/hooks/useReveal'

/**
 * Label → headline → optional lede, in the page's one heading arrangement.
 *
 * The numbered label is the page's running index (01…10). It is not decoration:
 * it is the only device that tells a reader mid-scroll where they are in the
 * argument, and it is why the sections can vary their composition so freely
 * without the page losing its thread.
 */
export function SectionHeading({
  index,
  label,
  title,
  lede,
  align = 'start',
  className,
  headingClassName,
}) {
  const { ref, revealed } = useReveal()

  const step = (i) => ({
    'data-revealed': revealed,
    style: { '--reveal-delay': `${i * 80}ms` },
  })

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      <p
        className="reveal font-display flex items-center gap-3 text-label leading-none tracking-[0.16em] text-ink-faint uppercase"
        {...step(0)}
      >
        {index ? <span className="tabular-nums">{index}</span> : null}
        {index ? (
          <span aria-hidden="true" className="h-px w-6 bg-hairline-strong" />
        ) : null}
        <span>{label}</span>
      </p>

      <h2
        className={cn(
          'reveal font-display mt-5 text-section leading-[1.32] font-normal text-ink uppercase',
          headingClassName,
        )}
        {...step(1)}
      >
        {title}
      </h2>

      {lede ? (
        <p
          className={cn(
            'reveal font-display mt-5 max-w-[34rem] text-body leading-[1.68] font-normal text-ink-muted',
            align === 'center' && 'mx-auto',
          )}
          {...step(2)}
        >
          {lede}
        </p>
      ) : null}
    </div>
  )
}
