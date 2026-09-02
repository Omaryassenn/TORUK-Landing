import { useState } from 'react'
import { cn } from '@/lib/cn'
import { site, nav, headerCta } from '@/content/site'
import { Wordmark } from '@/components/brand/Wordmark'
import { Button } from '@/components/ui/Button'
import { useSplash } from '@/components/splash/context'
import { useAtViewportTop } from '@/hooks/useAtViewportTop'


/*
 * Every section below the hero, in page order. The bar is compact for all of
 * them and full-bleed only over the hero, so this is the list of things that
 * put a surface under it rather than a list of two.
 *
 * They are contiguous, which is what lets one observer answer the question: as
 * each one leaves the strip under the bar the next has already entered it, so
 * the state never falls back to the hero's pose part-way down the page.
 *
 * Module-level so the observer is set up once rather than torn down and rebuilt
 * on every render.
 */
const GROUNDED_SECTIONS = ['#reel', '#platform', '#mindset', '#inside']


export function Header({ activeHref = '/' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { active: splashActive, staged, chromeVisible, registerLogo } = useSplash()

  /*
   * The bar has no ground over the hero, and no edges either. There the lockup
   * sits on the hero's own artwork and the two read as one composition; the
   * pill exists to separate the chrome from a page moving under it, and the
   * hero is the one section with nothing there to separate it from.
   */
  const grounded = useAtViewportTop(GROUNDED_SECTIONS)


  const lifted = staged

  const chrome = cn(
    'transition-opacity duration-[520ms] ease-out-quint motion-reduce:transition-none',
    chromeVisible ? 'opacity-100' : 'opacity-0',
  )

  return (
    <header
      inert={splashActive}
      /*
       * The ground is the only part of the compact state the splash suppresses,
       * and it does it from CSS. See `.chrome-frame[data-chrome='bare']`.
       */
      data-chrome={splashActive ? 'bare' : undefined}
      /*
       * Fixed, not absolute: the navbar stays put for the whole page, so it
       * survives the hero being pinned and the reel scrolling up over it. At
       * the top of the document the two positionings are identical, which is
       * what the splash measures its hand-off against.
       */
      className={cn(
        'chrome-frame fixed inset-x-0 top-0',
        lifted ? 'z-[60]' : 'z-20',
        grounded && 'chrome-frame--compact',
      )}
    >
      {/*
        * The bar. Its geometry is entirely in `.chrome-*` in
        * `styles/index.css`: the pill's radius and ground live on this element
        * and the padding on the row inside it, both read off the frame's custom
        * properties, so the two states are one class on the header above.
        *
        * Padding is symmetric now that the bar has a ground and a foot. The
        * frame's top-only value doubled came to 103px once the bar had a box,
        * which is a tenth of the viewport for a navbar, so it is trimmed to
        * 18px full-bleed and 14px compact. The lockup sits a few pixels higher
        * than the frame as a result.
        */}
      <div className="chrome-bar">
        <div className="chrome-row">
          <div className="flex flex-1 items-center">
            <a
              ref={registerLogo}
              href="/"
              aria-label={`${site.name} home`}
              className="shrink-0"
            >
              <Wordmark />
            </a>
          </div>

          <nav
            aria-label="Primary"
            className={cn(
              'hidden shrink-0 items-center justify-center gap-8 lg:flex xl:gap-12 min-[90rem]:gap-15',
              chrome,
            )}
          >
            {nav.map((item) => {
              const active = item.href === activeHref
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'font-display text-nav leading-[1.25rem] whitespace-nowrap transition-colors duration-200',
                    active
                      ? 'font-medium text-ink'
                      : 'font-normal text-ink-muted hover:text-ink',
                  )}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>

          {/* Mirror of the lockup's column, so the nav's centre is the header's. */}
          <div className="flex flex-1 items-center justify-end">
            <div className={cn('hidden lg:block', chrome)}>
              <Button href={headerCta.href}>{headerCta.label}</Button>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className={cn(
                'grid size-9 place-items-center rounded-[0.625rem] border border-hairline lg:hidden',
                chrome,
              )}
            >
              <span className="sr-only">
                {menuOpen ? 'Close menu' : 'Open menu'}
              </span>
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="w-4 stroke-ink"
                strokeWidth="1.25"
              >
                {menuOpen ? (
                  <path d="M3 3l10 10M13 3L3 13" />
                ) : (
                  <path d="M2 5h12M2 11h12" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/*
        * The open panel is its own surface below the bar rather than an
        * extension of it: the bar has to stay clear of `overflow: hidden`,
        * because the splash flies this header's real lockup in from the middle
        * of the screen under a transform that would be clipped by it.
        *
        * `.chrome-menu` puts the panel's edges on the pill's in the compact
        * state and on the page's gutter in the full-bleed one, so it lines up
        * with the bar either way. Same radius as the pill — it is the same kind
        * of object — and its own ground, since over the hero there is no pill
        * behind it to read against.
        */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="chrome-menu mt-3 rounded-[1.5rem] border border-hairline bg-canvas/95 px-6 pb-6 backdrop-blur-sm lg:hidden"
        >
          <nav aria-label="Primary" className="flex flex-col">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-hairline py-4 font-display text-[1.0625rem] text-ink-muted hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Button href={headerCta.href} className="mt-6 w-full">
            {headerCta.label}
          </Button>
        </div>
      )}
    </header>
  )
}
