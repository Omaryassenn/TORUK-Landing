import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { resolveHref } from '@/lib/href'
import { site, nav, headerCta } from '@/content/site'
import { Wordmark } from '@/components/brand/Wordmark'
import { Button } from '@/components/ui/Button'
import { useSplash } from '@/components/splash/context'
import { useAtViewportTop } from '@/hooks/useAtViewportTop'
import { useActiveSection } from '@/hooks/useActiveSection'


/*
 * Every section below the hero, in page order. The bar is compact for all of
 * them and full-bleed only over the hero, so this is the list of things that
 * put a surface under it rather than a list of two.
 *
 * They are contiguous, which is what lets one observer answer the question: as
 * each one leaves the strip under the bar the next has already entered it, so
 * the state never falls back to the hero's pose part-way down the page.
 *
 * Contiguous also means a new section below the hero has to be added here when
 * it is added to the page. A gap in this list is not a missing pill, it is a
 * transparent bar over a page that is still moving: the section's own copy
 * scrolls up through the nav links. That is what happened when `#usecases` was
 * built and left off it.
 *
 * Module-level so the observer is set up once rather than torn down and rebuilt
 * on every render.
 */
const GROUNDED_SECTIONS = [
  '#reel',
  '#platform',
  '#mindset',
  '#inside',
  '#usecases',
  '#demo',
]

/*
 * And the one thing that takes the pose back off. The footer is a screen of
 * its own at the end of the page, and the bar is bare over it for the same
 * reason it is bare over the hero: it is the composition's own top edge there,
 * not chrome floating over something moving underneath.
 *
 * It has to be observed rather than inferred from the list above. The footer
 * is exactly one viewport tall, so at the foot of the page the last grounded
 * section's bottom edge and the footer's top edge are the same line, and both
 * are in the strip for the whole of the hand-over. This one wins it.
 */
const BARE_SECTIONS = ['#footer']

/*
 * What the scroll-spy watches: every in-page anchor in the bar, in the order it
 * is listed. That is page order today, and `useActiveSection` re-derives the
 * order from the document so it stays right if the two ever part company.
 *
 * The CTA's target is in here even though no nav item can be marked for it, and
 * that is the point. The spy holds its last answer when nothing is crossing the
 * band, so watching only the four links left `Use cases` lit for the whole of
 * the demo section and the footer below it — long after the reader had left it.
 * Watching the demo section moves the answer off `#usecases` on the way past,
 * and since no link points at it, nothing is marked. Which is correct: down
 * there the reader is in none of the four.
 *
 * Module-level so the observer is set up once rather than rebuilt per render.
 */
const NAV_ANCHORS = [...nav, headerCta]
  .filter((item) => item.href.startsWith('#'))
  .map((item) => item.href)


/**
 * @param {string} activeHref Which item reads as current before the reader has
 *   scrolled and the observer has first reported. After that the page decides.
 * @param {string} [base] Where this bar's in-page links resolve against. Empty
 *   on the landing page, where a fragment is a scroll; `'/'` on a document,
 *   where the same fragment points at a section that is not on the page.
 * @param {'compact'} [pose] Force the grounded pose for a page that has none of
 *   `GROUNDED_SECTIONS` on it. The landing page infers its pose from what is
 *   under the bar; a page that is one long document has nothing to infer from
 *   and would sit bare over content moving underneath it, which is the pose
 *   that exists for the hero and only the hero.
 */
export function Header({ activeHref = nav[0]?.href, pose, base = '' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { active: splashActive, staged, chromeVisible, registerLogo } = useSplash()

  /*
   * The bar has no ground over the hero, and no edges either. There the lockup
   * sits on the hero's own artwork and the two read as one composition; the
   * pill exists to separate the chrome from a page moving under it, and the
   * hero is the one section with nothing there to separate it from.
   */
  const overGrounded = useAtViewportTop(GROUNDED_SECTIONS)
  const overFooter = useAtViewportTop(BARE_SECTIONS)
  /*
   * A stated pose still yields to the footer, which takes the bar's ground away
   * on every page for the same reason: the footer is a screen of its own and
   * the bar is its top edge there, not chrome over something scrolling past.
   */
  const grounded = (pose === 'compact' || overGrounded) && !overFooter

  /*
   * The lit item follows the reader down the page rather than naming a fixed
   * one. It used to be `Home` for the whole scroll, which tells someone three
   * sections in that they are on the home page; what a one-page nav has to say
   * is where in the page they are.
   */
  const current = useActiveSection(NAV_ANCHORS) ?? activeHref


  const lifted = staged

  const toggleRef = useRef(null)
  const sheetRef = useRef(null)
  const closeRef = useRef(null)

  /*
   * Nothing scrolls behind the sheet. The same lock the splash uses, on the
   * same element and for the same reason: a menu covering the screen over a
   * page that still moves under a thumb is two scrollers fighting.
   */
  useEffect(() => {
    if (!menuOpen) return
    document.documentElement.dataset.menu = 'open'
    return () => {
      delete document.documentElement.dataset.menu
    }
  }, [menuOpen])

  /*
   * Focus into the sheet on open and back to the button that opened it on
   * close. Without the second half, closing leaves focus on the document and a
   * reader on a keyboard has to tab from the top of the page again.
   *
   * The guard is a ref of its own and not `sheetRef`: by the time this runs on
   * a close the sheet has unmounted and React has already nulled that one, so
   * testing it meant the restore never happened.
   */
  const wasOpen = useRef(false)

  useEffect(() => {
    if (menuOpen) {
      wasOpen.current = true
      closeRef.current?.focus()
      return
    }
    if (!wasOpen.current) return
    wasOpen.current = false
    toggleRef.current?.focus()
  }, [menuOpen])

  /*
   * The sheet is `lg:hidden`, so a window that grows past the breakpoint would
   * leave it open, invisible, and still holding the page's scroll.
   */
  useEffect(() => {
    if (!menuOpen) return
    const wide = window.matchMedia('(min-width: 64rem)')
    const close = () => setMenuOpen(false)
    wide.addEventListener('change', close)
    return () => wide.removeEventListener('change', close)
  }, [menuOpen])

  /** Escape closes; Tab cycles inside rather than leaving for a hidden page. */
  const onSheetKeyDown = (event) => {
    if (event.key === 'Escape') {
      setMenuOpen(false)
      return
    }
    if (event.key !== 'Tab') return

    const focusable = sheetRef.current?.querySelectorAll('a[href], button')
    if (!focusable?.length) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

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
              const active = item.href === current
              return (
                <a
                  key={item.href}
                  href={resolveHref(item.href, base)}
                  aria-current={active ? 'location' : undefined}
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
              <Button href={resolveHref(headerCta.href, base)}>{headerCta.label}</Button>
            </div>

            {/*
              * Opens only. The sheet covers this bar completely and carries its
              * own close, so a button that also closed would be a control the
              * reader cannot see while it is doing that job.
              */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className={cn(
                'grid size-9 place-items-center rounded-[0.625rem] border border-hairline lg:hidden',
                chrome,
              )}
            >
              <span className="sr-only">Open menu</span>
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="w-4 stroke-ink"
                strokeWidth="1.25"
              >
                <path d="M2 5h12M2 11h12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/*
        * The menu, as a sheet over the whole screen rather than a panel hanging
        * off the bar.
        *
        * A panel under the bar left the page visible and scrollable behind it,
        * which on a phone is a menu competing with the thing it is covering.
        * The sheet is its own screen: the lockup and a close at the top, the
        * links in the middle of what is left, and the one action at the foot
        * where a thumb is.
        *
        * It is a dialog and behaves like one. Escape closes it, focus moves to
        * the close on open and back to the button that opened it on close, and
        * Tab cycles inside rather than wandering into a page nobody can see.
        */}
      {menuOpen && (
        <div
          id="mobile-nav"
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${site.name} menu`}
          onKeyDown={onSheetKeyDown}
          className="chrome-sheet lg:hidden"
        >
          <div className="chrome-sheet-bar">
            {/*
              * A second lockup, and deliberately not the one the splash flies:
              * that one is registered with the provider and measured against
              * the slot, and there is only ever one of it.
              */}
            <a
              href={base || '/'}
              aria-label={`${site.name} home`}
              className="chrome-sheet-logo"
            >
              <Wordmark />
            </a>

            <button
              ref={closeRef}
              type="button"
              onClick={() => setMenuOpen(false)}
              className="chrome-sheet-close"
            >
              <span className="sr-only">Close menu</span>
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="w-5 stroke-ink"
                strokeWidth="1.25"
              >
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>

          <nav aria-label="Primary" className="chrome-sheet-nav">
            {/*
              * Same current state as the bar. The sheet is the same nav on a
              * narrower screen, and a reader who opens it mid-page should be
              * told where they are by the same rule.
              */}
            {nav.map((item) => {
              const active = item.href === current
              return (
                <a
                  key={item.href}
                  href={resolveHref(item.href, base)}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? 'location' : undefined}
                  className="chrome-sheet-link font-display"
                >
                  {item.label}
                </a>
              )
            })}
          </nav>

          <div className="chrome-sheet-foot">
            <Button
              href={resolveHref(headerCta.href, base)}
              onClick={() => setMenuOpen(false)}
              className="chrome-sheet-cta w-full"
            >
              {headerCta.label}
            </Button>
          </div>
        </div>
      )}

    </header>
  )
}
