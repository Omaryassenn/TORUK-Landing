import { useState } from 'react'
import { cn } from '@/lib/cn'
import { site, nav, headerCta } from '@/content/site'
import { Wordmark } from '@/components/brand/Wordmark'
import { Button } from '@/components/ui/Button'

/**
 * Sits over the hero art rather than on its own bar — the Figma frame has no
 * header background, the artwork runs edge to edge behind it.
 *
 * Frame metrics (node 10017:152335), 1440-wide: 29px from the top, 24px
 * gutters, logo 192 → 162px gap → a 696px nav distributing its four links →
 * 156px gap → the 188px pill. That adds up to 1238px of fixed content, which
 * only clears the gutters at the design's own 1440 — at Tailwind's `xl` (1280)
 * it overruns and the pill lands on top of "Blogs". Hence the exact metrics are
 * gated on `min-[90rem]`, with a centred, evenly-gapped nav below that.
 */
export function Header({ activeHref = '/' }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-[100rem] items-center px-6 pt-[1.5rem] lg:pt-[1.8125rem]">
        <a href="/" aria-label={`${site.name} home`} className="shrink-0">
          <Wordmark />
        </a>

        <nav
          aria-label="Primary"
          className="ms-8 hidden flex-1 items-center justify-center gap-8 lg:flex xl:gap-12 min-[90rem]:ms-[10.125rem] min-[90rem]:w-[43.5rem] min-[90rem]:flex-none min-[90rem]:justify-between min-[90rem]:gap-0"
        >
          {nav.map((item) => {
            const active = item.href === activeHref
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'font-display text-[0.9375rem] leading-[1.25rem] whitespace-nowrap transition-colors duration-200 xl:text-[1rem] min-[90rem]:text-[1.125rem]',
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

        {/*
          * Wrapper, not `hidden lg:inline-flex` on the Button: its base classes
          * already set `inline-flex`, and at equal specificity the winner is
          * whichever lands later in the stylesheet — which let the pill render
          * on mobile, on top of the wordmark.
          */}
        <div className="ms-auto hidden lg:block">
          <Button href={headerCta.href}>{headerCta.label}</Button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          className="ms-auto grid size-9 place-items-center rounded-[0.625rem] border border-hairline lg:hidden"
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
