import { cn } from '@/lib/cn'

/**
 * Hero and header CTAs. Geometry is straight off the Figma frame:
 * Radius 1000px, Satoshi Medium, uppercase, over a 20px/20px label. Figma
 * strokes inside the box and CSS strokes outside it, so the frame's 24px
 * inline padding becomes 23px + a 1px border.
 *
 * Height comes from `--spacing-button` (40px, 44px from 120rem up) rather than
 * from label + padding + border — the derived version drifted into fractional
 * heights (41.9px on a 1512-wide screen) once the type scale moved under it.
 * `leading-none` plus `items-center` centres the label in that fixed box, so
 * every variant and tier lands on the token's height exactly.
 *
 * Lengths are rem so the pill grows with the reader's font-size preference;
 * the px figures above are the heights at a 16px root, not hard ceilings.
 *
 * `solid` is the inverted fill, `outline` the full-white hairline — the design
 * uses a solid white border here, not the dimmed rule used elsewhere.
 */
const variants = {
  // Transparent border on the solid fill so both variants share the outline's
  // box math and land on the same 40px height.
  solid: 'border border-transparent bg-ink text-canvas hover:bg-ink/88',
  outline: 'border border-ink text-ink hover:bg-ink/10',
}

export function Button({ as = 'a', variant = 'solid', className, ...props }) {
  const Tag = as

  return (
    <Tag
      className={cn(
        'inline-flex h-button items-center justify-center rounded-[1rem] px-[1.4375rem]',
        'font-display text-cta leading-none font-medium uppercase whitespace-nowrap',
        'transition-colors duration-200 active:scale-[0.98] motion-reduce:active:scale-100',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
