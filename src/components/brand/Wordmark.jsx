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
 * The paths are inlined rather than loaded through `<img src="*.svg">` because
 * the splash hands this element off to the navbar under a `scale()` of roughly
 * 2x: an SVG loaded as an image is rasterised at its layout size and the
 * compositor then stretches that bitmap, which shows. Inline vectors are
 * re-rendered at whatever scale the transform lands on, so the lockup stays
 * crisp for the whole flight. Artwork, viewBoxes and `preserveAspectRatio` are
 * copied verbatim from the exports.
 *
 * Sized by height alone — `aspect-[192/29.945]` derives the width from the
 * artwork's own ratio, so the two glyph insets stay valid and the lockup can be
 * rescaled without recomputing anything. Trimmed from the frame's 30px to 26px
 * (21px below lg). `style` overrides that for the splash, which sizes by width.
 */
export function Wordmark({ className, style }) {
  return (
    <span
      className={cn(
        'relative block aspect-[192/29.945] h-wordmark shrink-0 text-ink',
        className,
      )}
      style={style}
    >
      <svg
        viewBox="0 0 51.7457 29.945"
        preserveAspectRatio="none"
        fill="currentColor"
        aria-hidden="true"
        className="absolute top-0 left-0 h-full w-[26.95%]"
      >
        <path d="M40.6421 0H11.1036C4.96602 0 0 4.87651 0 10.9034V19.0415C0 25.0586 4.96602 29.945 11.1036 29.945H40.6421C46.7796 29.945 51.7457 25.0586 51.7457 19.0415V10.9034C51.7457 4.87651 46.7796 0 40.6421 0ZM41.2681 13.0936C38.2245 13.0936 35.3882 13.9416 32.9807 15.4064C29.5163 17.5155 26.9558 20.8877 25.9594 24.8767C24.9308 20.8581 22.3099 17.4562 18.773 15.3767C16.4078 13.9831 13.6319 13.1766 10.6708 13.1766C9.04633 13.1766 7.48426 13.4198 6.01277 13.8626C6.02283 10.3599 8.91146 7.53318 12.4805 7.53318C12.6033 7.53318 12.7281 7.53318 12.8408 7.54307C14.3425 9.76487 16.4179 11.5716 18.8556 12.7833C20.9934 13.8527 23.411 14.4496 25.9694 14.4496C28.5279 14.4496 30.7905 13.8942 32.8679 12.894C35.4083 11.6724 37.5562 9.81429 39.0981 7.53318H39.2632C42.7798 7.53318 45.6483 10.2887 45.7309 13.7321C44.3218 13.319 42.8221 13.0956 41.2681 13.0956V13.0936Z" />
      </svg>

      <svg
        viewBox="0 0 130.876 14.4773"
        preserveAspectRatio="none"
        fill="currentColor"
        aria-hidden="true"
        className="absolute top-[32.37%] left-[31.6%] h-[48.34%] w-[68.17%]"
      >
        <path d="M0 0V3.01841H10.23V14.4773H13.3138V3.01841H23.5539V0H0Z" />
        <path d="M47.1178 2.13088C45.6685 0.707657 43.9313 1.65919e-07 41.9163 1.65919e-07H31.9017C29.8666 1.65919e-07 28.1173 0.707657 26.678 2.13088C25.2387 3.53433 24.5302 5.24022 24.5302 7.23866C24.5302 9.2371 25.2387 10.9331 26.678 12.3682C28.1274 13.7716 29.8646 14.4773 31.9017 14.4773H41.9163C43.9313 14.4773 45.6584 13.7697 47.1178 12.3682C48.5571 10.945 49.2878 9.23907 49.2878 7.23866C49.2878 5.23824 48.5571 3.53433 47.1178 2.13088ZM44.97 10.2472C44.1165 11.0853 43.0878 11.5083 41.8961 11.5083H31.9037C30.712 11.5083 29.6834 11.0833 28.8299 10.2472C27.9764 9.41105 27.5456 8.39898 27.5456 7.23866C27.5456 6.07834 27.9784 5.05836 28.8299 4.22024C29.6834 3.38212 30.702 2.969 31.9037 2.969H41.8961C43.0999 2.969 44.1165 3.38212 44.97 4.22024C45.8235 5.05836 46.2542 6.06845 46.2542 7.23866C46.2542 8.40886 45.8215 9.40907 44.97 10.2472Z" />
        <path d="M75.215 8.83385C75.831 7.88504 76.141 6.85518 76.141 5.76404C76.141 4.18862 75.5652 2.82667 74.4037 1.68612C73.2523 0.565335 71.8754 1.65919e-07 70.251 1.65919e-07H50.9223V14.4773H54.0163V11.5597H69.0472L71.5554 14.4773H76.0182L72.8216 10.9647C73.8079 10.5002 74.6111 9.79452 75.217 8.83385H75.215ZM70.2711 8.53142H54.0163V3.01841H70.2711C71.0521 3.01841 71.7205 3.2912 72.2559 3.83677C72.8115 4.37245 73.0893 5.00697 73.0893 5.76602C73.0893 6.52507 72.8115 7.18924 72.2559 7.73481C71.7003 8.28038 71.0521 8.53142 70.2711 8.53142Z" />
        <path d="M100.198 1.65919e-07V7.23866C100.198 8.39898 99.7773 9.39919 98.9339 10.2472C98.1005 11.0853 97.0941 11.5083 95.9104 11.5083H85.5275C84.3237 11.5083 83.2971 11.0833 82.4637 10.2472C81.6303 9.41105 81.2197 8.40886 81.2197 7.23866V1.65919e-07H78.1358V7.23866C78.1358 9.21733 78.8665 10.9232 80.3058 12.3464C81.7551 13.7697 83.4923 14.4773 85.5073 14.4773H95.9124C97.9475 14.4773 99.6968 13.7697 101.136 12.3464C102.585 10.9232 103.306 9.21733 103.306 7.23866V1.65919e-07H100.202H100.198Z" />
        <path d="M112.711 4.12932L117.902 1.65919e-07H112.823L109.081 3.03818V1.65919e-07H105.997V14.4773H109.081V7.02715L110.16 6.18903L124.728 14.4773H130.876L112.709 4.12932H112.711Z" />
      </svg>

      <span className="sr-only">{site.name}</span>
    </span>
  )
}
