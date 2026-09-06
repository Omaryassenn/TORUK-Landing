import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { usecases, usecasesHeader, PER_PAGE } from '@/content/usecases'
import { useReveal } from '@/hooks/useReveal'

/**
 * "Use cases" — Figma nodes 11122:115679 and 11122:116097.
 *
 * Nine cards, six to a page, and a pagination control under them. A card is a
 * client's mark on a tile with two lines under it; nothing about it is
 * interactive, so the whole section's interaction budget is the four controls
 * at its foot.
 *
 * Every page is in the DOM at once, stacked in a single grid cell, and the
 * deck is given the height of whichever one is current. Stacking them is what
 * makes the change a cross-fade rather than a swap; measuring the current one
 * is what keeps the pagination control directly under the last row, which is
 * where the frame puts it. Holding the tallest page's height instead would
 * park the control a whole empty row below the three cards on page two.
 *
 * The height is eased rather than set, so the control the reader has just
 * clicked slides up to meet them instead of jumping out from under the cursor.
 *
 * The pages that are not current are `inert` and `visibility: hidden`, so they
 * are out of the tab order and out of the accessibility tree rather than
 * merely transparent.
 */

/** One deployment. Inert — nothing here is a control or a link. */
function UseCase({ item, index }) {
  return (
    <li className="usecase" style={{ '--i': index }}>
      {/*
        * The mark identifies the organisation, and the copy under it never
        * names them — so this one is not decorative, and the alt text is the
        * organisation rather than the word "logo".
        */}
      <div
        className="usecase-tile"
        data-tone={item.tint ? 'tint' : item.tone}
        style={item.tint ? { '--tile': item.tint } : undefined}
      >
        <img
          src={item.logo}
          alt={item.org}
          loading="lazy"
          decoding="async"
          style={{ '--logo-w': item.width, '--logo-ratio': item.ratio }}
        />
      </div>

      <div className="usecase-copy">
        <p className="font-display text-usecase-title leading-[1.556] font-normal text-ink text-pretty">
          {item.title}
        </p>
        <p className="font-display text-usecase-note leading-[1.43] font-normal text-usecase-body text-pretty">
          {item.body}
        </p>
      </div>
    </li>
  )
}

/**
 * The chevron on a pagination arrow.
 *
 * One export, mirrored for the forward direction — the frame draws the same
 * glyph both ways round, so this is one file rather than two that could fall
 * out of step.
 */
function Chevron({ flip }) {
  return (
    <img
      src="/icons/chevron-left.svg"
      alt=""
      width="16"
      height="16"
      aria-hidden="true"
      className="usecase-chevron"
      data-flip={flip || undefined}
    />
  )
}

export function UseCases() {
  const { ref: headRef, revealed: headShown } = useReveal({ threshold: 0.2 })
  const { ref: entryRef, revealed: deckShown } = useReveal({ threshold: 0.1 })

  const deckRef = useRef(null)
  const [page, setPage] = useState(0)

  const pages = useMemo(() => {
    const out = []
    for (let i = 0; i < usecases.length; i += PER_PAGE) {
      out.push(usecases.slice(i, i + PER_PAGE))
    }
    return out
  }, [])

  const last = pages.length - 1
  const go = (next) => setPage(Math.min(last, Math.max(0, next)))

  /*
   * The deck's height, from whichever page is current.
   *
   * The page change is measured here rather than waited for. It is a state
   * change this component already knows about, and an observer's first
   * delivery is not something to hang it on: a hidden tab has no rendering
   * opportunity to deliver one, so the deck would sit at the previous page's
   * height until something else moved.
   *
   * Before paint, so the new page never gets a frame at the old height.
   *
   * The observer is for the other thing that changes this height — the column
   * being resized, and the copy rewrapping in it. Those are written with the
   * easing suppressed, which the reflow between the two lines forces: a deck
   * that eased to every intermediate width would trail a third of a second
   * behind the drag. Comparing against the last value written is what keeps
   * the observer's own initial delivery from counting as one of them.
   *
   * It watches the page, not the deck. The deck's height is this effect's
   * output, so observing it would feed the loop its own result; the page is
   * `align-self: start` and so is sized by its cards instead.
   */
  useLayoutEffect(() => {
    const deck = deckRef.current
    const grid = deck?.querySelector('.usecase-grid[data-active="true"]')
    if (!deck || !grid) return

    let written = grid.offsetHeight
    deck.style.setProperty('--deck-h', `${written}px`)

    const observer = new ResizeObserver(() => {
      const height = grid.offsetHeight
      if (height === written) return
      written = height

      deck.dataset.settling = 'true'
      deck.style.setProperty('--deck-h', `${height}px`)
      void deck.offsetHeight
      delete deck.dataset.settling
    })

    observer.observe(grid)
    return () => observer.disconnect()
  }, [page])

  const headStep = (index) => ({
    'data-revealed': headShown,
    style: { '--reveal-delay': `${index * 90}ms` },
  })

  return (
    <section
      id="usecases"
      aria-labelledby="usecases-title"
      className="relative z-10 bg-canvas px-6 py-[clamp(3rem,4.5vw,4.5rem)]"
    >
      <div className="page-column flex flex-col gap-[1.6875rem]">
        {/*
          * Set exactly as the Mindset header above it: the same centred stack
          * on the same 8px rhythm, so the two read as two sections of one page
          * rather than as two designs.
          */}
        <header
          ref={headRef}
          className="mx-auto flex max-w-[48.4375rem] flex-col items-center gap-[0.5rem] text-center"
        >
          <p
            className="reveal text-gradient-eyebrow font-display w-fit text-section-eyebrow leading-[1.333] font-light uppercase"
            {...headStep(0)}
          >
            {usecasesHeader.eyebrow}
          </p>

          <h2
            id="usecases-title"
            className="reveal font-display text-section leading-[1.2] font-normal text-ink"
            {...headStep(1)}
          >
            {usecasesHeader.headline}
          </h2>

          <p
            className="reveal font-display max-w-[43.6875rem] text-body leading-[1.55] font-light text-ink-muted text-pretty"
            {...headStep(2)}
          >
            {usecasesHeader.body}
          </p>
        </header>

        {/*
          * Two elements rather than one: the outer box owns the section's
          * scroll entry and the inner one owns the height that changes with
          * the page. They are separate because they are two transitions on two
          * schedules, and a single element can only carry one `transition`.
          */}
        <div ref={entryRef} className="reveal" data-revealed={deckShown}>
          <div ref={deckRef} className="usecase-deck">
            {pages.map((items, i) => (
              <ul
                key={i}
                role="list"
                className="usecase-grid"
                data-active={i === page}
                inert={i !== page}
              >
                {items.map((item, j) => (
                  <UseCase key={item.id} item={item} index={j} />
                ))}
              </ul>
            ))}
          </div>
        </div>

        {/*
          * The frame's pagination: an arrow, a number per page with the
          * current one underscored, and an arrow. The arrows are disabled at
          * the ends rather than wrapping — two pages wrapping would put the
          * reader back where they started with no way to tell that they had
          * moved.
          */}
        <nav className="usecase-pager" aria-label="Use case pages">
          <button
            type="button"
            className="usecase-arrow"
            onClick={() => go(page - 1)}
            disabled={page === 0}
          >
            <Chevron />
            <span className="sr-only">Previous page</span>
          </button>

          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              className="usecase-page-number font-display text-usecase-note leading-[1.43] font-normal"
              onClick={() => go(i)}
              aria-current={i === page ? 'true' : undefined}
            >
              <span aria-hidden="true">{i + 1}</span>
              <span className="sr-only">{`Page ${i + 1} of ${pages.length}`}</span>
              {/* The selector under the current number, at the frame's 16x3. */}
              <span className="usecase-selector" aria-hidden="true" />
            </button>
          ))}

          <button
            type="button"
            className="usecase-arrow"
            onClick={() => go(page + 1)}
            disabled={page === last}
          >
            <Chevron flip />
            <span className="sr-only">Next page</span>
          </button>
        </nav>
      </div>
    </section>
  )
}
