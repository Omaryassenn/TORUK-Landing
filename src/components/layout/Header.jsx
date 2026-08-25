import { useState } from 'react'
import { cn } from '@/lib/cn'
import { site, nav, headerCta } from '@/content/site'
import { Wordmark } from '@/components/brand/Wordmark'
import { Button } from '@/components/ui/Button'
import { useSplash } from '@/components/splash/context'


export function Header({ activeHref = '/' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { active: splashActive, staged, chromeVisible, registerLogo } = useSplash()


  const lifted = staged

  const chrome = cn(
    'transition-opacity duration-[520ms] ease-out-quint motion-reduce:transition-none',
    chromeVisible ? 'opacity-100' : 'opacity-0',
  )

  return (
    <header
     
      inert={splashActive}
      className={cn('absolute inset-x-0 top-0', lifted ? 'z-[60]' : 'z-20')}
    >
      <div className="flex items-center px-6 pt-[1.5rem] lg:pt-[1.8125rem]">
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
