import { site } from '@/content/site'
import { footer } from '@/content/footer'
import { useReveal } from '@/hooks/useReveal'
import { Wordmark } from '@/components/brand/Wordmark'
import { Container } from '@/components/ui/Section'

/**
 * The footer closes the page off-grid: the columns sit on the frame's rules,
 * and an oversized TORUK is set in near-black beneath them, clipped by the
 * bottom edge. It is legible only as a shape at #0e0e0e — which is the point.
 * It gives the page a floor without adding another thing to read.
 */
export function Footer() {
  const { ref, revealed } = useReveal({ threshold: 0.05 })

  const year = new Date().getFullYear()

  return (
    <footer id="footer" className="relative isolate w-full overflow-hidden bg-canvas pt-section pb-8">
      <Container>
        <div
          ref={ref}
          className="reveal grid grid-cols-1 gap-12 border-t border-hairline pt-12 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-[clamp(2rem,5vw,5rem)] lg:pt-14"
          data-revealed={revealed}
        >
          <div>
            <a href="/" aria-label={`${site.name} home`} className="inline-block">
              <Wordmark />
            </a>
            <p className="font-display mt-6 max-w-[20rem] text-body leading-[1.68] text-ink-muted">
              {footer.blurb}
            </p>
            <a
              href={`mailto:${site.email}`}
              className="font-display mt-7 inline-flex items-center rounded-[62.5rem] border border-hairline-strong px-5 py-2 text-label tracking-[0.06em] text-ink transition-colors duration-200 hover:bg-ink/10"
            >
              {site.email}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {footer.columns.map((column) => (
              <nav key={column.id} aria-label={column.title}>
                <p className="font-display text-micro tracking-[0.16em] text-ink-faint uppercase">
                  {column.title}
                </p>
                <ul className="mt-5 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="font-display text-body text-ink-muted transition-colors duration-200 hover:text-ink"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </Container>

      {/* Oversized floor wordmark, clipped by the section's bottom edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none mt-16 h-[clamp(3.5rem,9vw,10rem)] overflow-hidden lg:mt-24"
      >
        <span className="font-display block px-gutter text-[clamp(5rem,17vw,15rem)] leading-[0.82] font-light tracking-[0.06em] whitespace-nowrap text-[#0e0e0e] select-none">
          {site.name}
        </span>
      </div>

      <Container className="mt-8">
        <div className="flex flex-col items-start justify-between gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center">
          <p className="font-display text-micro tracking-[0.14em] text-ink-faint uppercase">
            {`© ${year} ${site.name} Studio — All rights reserved`}
          </p>
          <ul className="flex flex-wrap gap-6">
            {footer.legal.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="font-display text-micro tracking-[0.14em] text-ink-faint uppercase transition-colors duration-200 hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  )
}
