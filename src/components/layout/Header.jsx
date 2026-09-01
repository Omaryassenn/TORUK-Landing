import { useState } from 'react'
import { cn } from '@/lib/cn'
import { site, nav, headerCta } from '@/content/site'
import { Wordmark } from '@/components/brand/Wordmark'
import { Button } from '@/components/ui/Button'
import { useSplash } from '@/components/splash/context'
import { useAtViewportTop } from '@/hooks/useAtViewportTop'


/*
 * The sections that put a surface under the bar. Module-level so the observer
 * is set up once rather than torn down and rebuilt on every render.
 */
const GROUNDED_SECTIONS = ['#reel', '#platform']


export function Header({ activeHref = '/' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { active: splashActive, staged, chromeVisible, registerLogo } = useSplash()

  /*
   * The bar has no ground over the hero. There the lockup sits on the hero's
   * own artwork and the two read as one composition; the glass exists to
   * separate the chrome from a page moving under it, and only the reel and the
   * glance section put anything there to separate it from.
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
       * Fixed, not absolute: the navbar stays put for the whole page, so it
       * survives the hero being pinned and the reel scrolling up over it. At
       * the top of the document the two positionings are identical, which is
       * what the splash measures its hand-off against.
       */
      className={cn(
        'fixed inset-x-0 top-0',
        lifted ? 'z-[60]' : 'z-20',
        /*
         * The glass waits on two things. The splash, because that overlay is an
         * opaque black layer and the header sits above it once staged, so a
         * translucent bar would be a visible seam across an otherwise blank
         * screen for the length of the intro. And one of the sections below
         * reaching the bar, because over the hero there is nothing behind it
         * but the hero it belongs to.
         */
        !splashActive && grounded && 'chrome-glass',
      )}
    >
      {/*
        * Symmetric padding now that the bar has a ground and a foot. The
        * frame's top-only value doubled came to 103px once the bar had a box,
        * which is a tenth of the viewport for a navbar, so it is trimmed to
        * 18px: 77px tall on the standard tier and 81px where the CTA pill
        * steps up to 44px. The lockup sits a few pixels higher than the frame
        * as a result.
        */}
      <div className="flex items-center px-6 py-[1.125rem]">
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
            'hidden shrink-0 items-center justify-center gap-8 lg:flex xl:gap-12 min-[90rem]:gap-20',
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

      {menuOpen && (
        <div
          id="mobile-nav"
          className="mx-6 mt-4 border-t border-hairline bg-canvas/95 pb-6 backdrop-blur-sm lg:hidden"
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
