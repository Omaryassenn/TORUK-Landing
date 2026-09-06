import { useMemo, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useActiveSection } from '@/hooks/useActiveSection'

/**
 * The shell every legal document on this site is set in.
 *
 * A reading surface, not a marketing page, and built as one: a fixed measure,
 * a contents list that tracks where you are, and nothing that moves on its own.
 * The landing page's composition is deliberately absent. Someone arrives here
 * to find a clause, usually because they were sent to, and every device that
 * helps a first-time visitor decide something is in their way.
 *
 * What it keeps is the page's world: the same canvas, the same Satoshi, the
 * same navbar and foot. A legal page on a different palette reads as a
 * different company's, which is the one thing a legal page cannot afford.
 *
 * The contents list is built from the same array the body is set from, so a
 * section cannot exist in one and not the other. It earns the only motion here:
 * the entry matching where you are is marked as you scroll, and that is the
 * whole of the page's animation budget.
 */

/*
 * Where the band that answers "which section is this" sits.
 *
 * Just under the navbar rather than the default third of the way down. A
 * document's last section is usually short, and jumping to it lands it in the
 * space between the bar and a band that low: nothing crosses, and the contents
 * list goes on marking whatever it saw last. This is measured against a real
 * document, not chosen: at a 900px viewport it is the strip from 108 to 180,
 * which the shortest section on either page clears.
 */
const READING_BAND = '-12% 0px -80% 0px'

/** A section's heading. Numbered only where the document numbers itself. */
function SectionHeading({ section }) {
  return (
    <h2
      id={`${section.id}-title`}
      className="terms-h2 font-display text-dive-title leading-[1.3] text-ink"
    >
      {section.n != null && (
        <span className="terms-n font-display text-usecase-note" aria-hidden="true">
          {section.n}
        </span>
      )}
      {section.title}
    </h2>
  )
}

function Block({ block }) {
  if (block.type === 'h3') {
    return (
      <h3 className="terms-h3 font-display text-usecase-title leading-[1.4] text-ink">
        {block.text}
      </h3>
    )
  }

  if (block.type === 'ul') {
    return (
      <ul className="terms-list">
        {block.items.map((item) => (
          <li key={item} className="terms-li font-display text-body">
            {item}
          </li>
        ))}
      </ul>
    )
  }

  /*
   * A run of "Term: what it means" lines, which is most of the privacy policy.
   * A description list rather than paragraphs with a bold run at the front: the
   * pairing is the content, and `<dl>` is the only markup that says so.
   */
  if (block.type === 'dl') {
    return (
      <dl className="terms-dl">
        {block.items.map((item) => (
          <div key={item.term} className="terms-dl-row">
            <dt className="terms-dt font-display text-body text-ink">{item.term}</dt>
            <dd className="terms-dd font-display text-body">{item.def}</dd>
          </div>
        ))}
      </dl>
    )
  }

  if (block.type === 'contact') {
    /*
     * The one place in a document where a value is worth acting on rather than
     * reading, so the two are links. The label is the document's own.
     */
    const href =
      block.kind === 'email'
        ? `mailto:${block.value}`
        : `tel:${block.value.replace(/\s/g, '')}`

    return (
      <p className="terms-contact font-display text-body">
        {block.label && <span className="text-ink-muted">{block.label}: </span>}
        <a href={href} className="terms-link text-ink">
          {block.value}
        </a>
      </p>
    )
  }

  return <p className="terms-p font-display text-body">{block.text}</p>
}

/**
 * @param {object} meta Masthead copy: eyebrow, title, optional lede and dates.
 * @param {object[]} sections The document, and the source the contents is built from.
 * @param {string[]} anchors The same sections as `#id` anchors. Pass a module-level
 *   constant, not an inline array, or the observer rebuilds on every render.
 */
export function LegalDocument({ meta, sections, anchors }) {
  const current = useActiveSection(anchors, anchors[0], READING_BAND)

  /*
   * The contents start open beside the document and closed above it.
   *
   * Read once, at mount, rather than tracked: this is the state the reader
   * arrives in, and once they have opened or closed it themselves that choice
   * outranks the viewport. Controlled from here rather than left to the
   * element's own `open`, because the scroll spy re-renders this component and
   * an uncontrolled `open` prop would be reapplied on every one of those.
   */
  const [tocOpen, setTocOpen] = useState(
    () => window.matchMedia?.('(min-width: 64rem)').matches ?? true,
  )

  /* Stable across renders; the list never changes while the page is open. */
  const contents = useMemo(
    () => sections.map(({ id, n, title }) => ({ id, n, title })),
    [sections],
  )

  return (
    <>
      {/*
        * The navbar reads the splash through a context that falls back to an
        * inert value when no provider is mounted, so it is usable here with no
        * splash in the tree. There is none on purpose: a brand animation in
        * front of a contract is a delay, not a welcome.
        *
        * `pose="compact"` because a document carries none of the sections the
        * bar infers its pose from. Without it the bar keeps the hero's pose,
        * which has no ground, and the page scrolls straight through it.
        *
        * `base="/"` sends the bar's links back to the landing page. They are
        * written as bare fragments because there they are a scroll; here they
        * would point at sections that are not on the page and do nothing. The
        * foot takes the same base for the same reason.
        *
        * No item is marked current: the nav points at the landing page's
        * sections and the reader is on none of them.
        */}
      <Header pose="compact" base="/" activeHref={null} />

      <main className="terms-page bg-canvas">
        <div className="page-column">
          <header className="terms-masthead">
            <p className="text-gradient-eyebrow font-display w-fit text-section-eyebrow leading-[1.333] font-light uppercase">
              {meta.eyebrow}
            </p>

            <h1 className="font-display text-mindset-headline leading-[1.2] font-normal text-ink">
              {meta.title}
            </h1>

            {meta.standfirst && (
              <p className="terms-standfirst font-display text-body leading-[1.55] text-ink-muted">
                {meta.standfirst}
              </p>
            )}

            <p className="terms-dates font-display text-usecase-note leading-[1.43] text-ink-muted">
              {meta.dates}
            </p>
          </header>

          <div className="terms-body">
            {/*
              * A list beside the document on a wide screen and a closed
              * disclosure above it on a narrow one: a screenful of contents
              * ahead of the first clause makes the page read as the list.
              */}
            <nav className="terms-toc" aria-labelledby="terms-toc-title">
              <details
                className="terms-toc-shell"
                open={tocOpen}
                onToggle={(event) => setTocOpen(event.currentTarget.open)}
              >
                <summary className="terms-toc-summary font-display text-usecase-note">
                  <span id="terms-toc-title">Contents</span>
                </summary>

                <ol className="terms-toc-list" aria-label={`Sections of the ${meta.title}`}>
                  {contents.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="terms-toc-link font-display text-usecase-note"
                        aria-current={current === `#${item.id}` ? 'true' : undefined}
                      >
                        {item.n != null && (
                          <span className="terms-toc-n" aria-hidden="true">
                            {item.n}
                          </span>
                        )}
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            </nav>

            <article className="terms-doc">
              {meta.lede && (
                <p className="terms-lede font-display text-body text-ink">{meta.lede}</p>
              )}

              {sections.map((section) => (
                /*
                 * The anchor id is on the section, not on its heading. A
                 * heading is one line tall and the spy watches a thin band, so
                 * a heading only crosses it in passing: jump to a section from
                 * the contents and the heading lands above the band, never
                 * enters it, and the list marks the wrong entry. A section is
                 * tall enough to hold the band for as long as the reader is
                 * inside it, which is the question being asked.
                 */
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-title`}
                  className="terms-section"
                >
                  <SectionHeading section={section} />
                  {section.blocks.map((block, i) => (
                    <Block key={i} block={block} />
                  ))}
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>

      <Footer base="/" />
    </>
  )
}
