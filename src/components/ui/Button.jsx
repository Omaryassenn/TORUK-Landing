import { cn } from '@/lib/cn'

/**
 * Hero and header CTAs. Geometry is straight off the Figma frame:
 * Radius 1000px, Satoshi Medium, uppercase, over a 20px/20px label. Figma
 * strokes inside the box and CSS strokes outside it, so the frame's 24px
 * inline padding becomes 23px + a 1px border.
 *
 * Height is capped at 40px (2.5rem) rather than the frame's 44px, so the block
 * padding is (40 - 20 label - 2 border) / 2 = 9px. Lengths are rem so the pill
 * grows with the reader's font-size preference; 40px is the cap at a 16px root,
 * not a hard ceiling.
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
        'inline-flex items-center justify-center rounded-[62.5rem] px-[1.4375rem] py-[0.5625rem]',
        'font-display text-cta leading-[1.25rem] font-medium uppercase whitespace-nowrap',
        'transition-colors duration-200 active:scale-[0.98] motion-reduce:active:scale-100',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
