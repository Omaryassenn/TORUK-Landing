import { cn } from '@/lib/cn'
import { site } from '@/content/site'

/**
 * TORUK lockup, assembled from the two SVGs exported off the Figma "Lightmode
 * logo" instance (node I10017:152337). The glyphs are the real vector artwork —
 * not redrawn — so the insets below are Figma's, kept verbatim:
 *
 *   container   192 x 29.945
 *   mark        51.746 x 29.945  → left 0,      right 73.05%
 *   wordmark   130.876 x 14.477  → left 31.6%,  top 32.37%
 *
 * The wordmark sits slightly below centre in the design, hence the explicit
 * top inset rather than a flex centre.
 *
 * Sized by height alone — `aspect-[192/29.945]` derives the width from the
 * artwork's own ratio, so the two glyph insets stay valid and the lockup can be
 * rescaled without recomputing anything. Trimmed from the frame's 30px to 26px
 * (21px below lg).
 */
export function Wordmark({ className }) {
  return (
    <span
      className={cn(
        'relative block aspect-[192/29.945] h-[1.3125rem] shrink-0 lg:h-[1.625rem]',
        className,
      )}
    >
      <img
        src="/brand/toruk-mark.svg"
        alt=""
        aria-hidden="true"
        className="absolute top-0 left-0 h-full w-[26.95%]"
      />
      <img
        src="/brand/toruk-wordmark.svg"
        alt=""
        aria-hidden="true"
        className="absolute top-[32.37%] left-[31.6%] h-[48.34%] w-[68.17%]"
      />
      <span className="sr-only">{site.name}</span>
    </span>
  )
}
