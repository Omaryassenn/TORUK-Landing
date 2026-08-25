import { cn } from '@/lib/cn'

/**
 * One band of the page.
 *
 * Every section below the hero goes through here so the vertical rhythm and
 * the 24px frame gutter are declared once. `--spacing-section` is deliberately
 * the only padding step in play — the brief asks for an even, breathable
 * cadence, and the fastest way to lose that is to let each section invent its
 * own spacing.
 *
 * `flush` opts a section out of the vertical padding (the pinned bands supply
 * their own, because their padding belongs to the sticky child rather than the
 * scroll track).
 */
export function Section({
  as = 'section',
  flush = false,
  className,
  children,
  ...props
}) {
  const Tag = as

  return (
    <Tag
      className={cn(
        'relative isolate w-full bg-canvas',
        !flush && 'py-section',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

/** The gutter-aligned column shared by every band, hero included. */
export function Container({ className, children }) {
  return (
    <div className={cn('mx-auto w-full max-w-[100rem] px-gutter', className)}>
      {children}
    </div>
  )
}
