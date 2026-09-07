import { useEffect } from 'react'

/**
 * In-page anchors that do not pile up behind the back button.
 *
 * The problem this solves is the same on both pages and was worst on the legal
 * ones. Every `<a href="#clause">` in the contents list is a navigation as far
 * as the browser is concerned, so reading a document by clicking through its
 * sections leaves one history entry per click. Press back expecting the page
 * you arrived from and you get the previous clause, then the one before that,
 * fourteen times. The navbar on the landing page did the same thing: four nav
 * links and a CTA, each click an entry.
 *
 * So the click is handled here and the URL is written with `replaceState`
 * instead of being pushed. The hash still tracks where the reader is, so a
 * link to a clause is still copyable out of the address bar, but back means
 * back to where they came from.
 *
 * It stays a real `<a href="#id">` in the markup rather than becoming a button
 * with an onClick. That is what keeps middle-click and cmd-click opening a new
 * tab, "copy link address" producing a link, and the whole thing working
 * before this JavaScript has run — all of which a handler-only anchor loses.
 * Every click this is not sure about is handed straight back to the browser.
 *
 * One delegated listener on the document rather than a handler per link: the
 * links are in three components (the navbar, the footer, a document's contents)
 * and this behaviour belongs to the page rather than to any of them.
 *
 * @param {(top: number) => void} [scrollTo] How to move the page, for a page
 *   that owns a scroller. Omitted, the platform's own smooth scroll is used —
 *   which is right for the legal pages, where there is no Lenis and inertia
 *   would fight find-in-page and a dragged scrollbar.
 */
export function useHashAnchors(scrollTo) {
  useEffect(() => {
    const onClick = (event) => {
      /*
       * Everything that is not a plain left click belongs to the browser:
       * cmd/ctrl for a new tab, shift for a new window, middle-click likewise,
       * and anything another handler has already dealt with.
       */
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const link = event.target.closest?.('a[href]')
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return

      /*
       * `getAttribute`, not `link.hash`: the property resolves against the
       * document, so a footer link written as `/#platform` on a legal page
       * would look like a bare fragment here and be swallowed. That link is a
       * real navigation to another page and has to stay one.
       */
      const href = link.getAttribute('href')
      if (!href || href.length < 2 || !href.startsWith('#')) return

      let target = null
      try {
        target = document.querySelector(href)
      } catch {
        /* A fragment that is not a valid selector is not one of ours. */
        return
      }
      if (!target) return

      event.preventDefault()

      /*
       * The offset is read off the target's own `scroll-margin-top` rather
       * than restated here, so a section still lands under the navbar and it
       * stays whatever the stylesheet says it is. The landing page's sections
       * and a document's clauses ask for different amounts of it.
       */
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - margin)

      if (scrollTo) {
        scrollTo(top)
      } else {
        const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top, behavior: still ? 'auto' : 'smooth' })
      }

      /* The whole point: the hash is corrected, not appended to. */
      window.history.replaceState(null, '', href)

      /*
       * And the keyboard follows the page.
       *
       * A real anchor navigation moves the point Tab continues from as well as
       * the scroll; preventing it would otherwise leave someone who pressed
       * Enter on a contents entry still inside the contents list, tabbing
       * through the rest of it. The attribute is added only to make the target
       * focusable and taken off again when focus leaves, so nothing is left
       * behind in the markup, and `preventScroll` stops the focus call from
       * re-doing the scroll that has just been eased.
       *
       * These targets are sections rather than controls, so the ring is turned
       * off for them in the stylesheet — the same exception the demo form's
       * confirmation makes for the same reason.
       */
      const focusable = target.hasAttribute('tabindex')
      if (!focusable) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
      if (!focusable) {
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), {
          once: true,
        })
      }
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [scrollTo])
}
