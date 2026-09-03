import { useEffect, useRef } from 'react'
import { footer } from '@/content/footer'
import { useReveal } from '@/hooks/useReveal'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * The page's foot — Figma node 11112:111077.
 *
 * Three things stacked: a band of columns, a line of legal under a hairline,
 * and the wordmark set edge to edge beneath them. The frame leaves a deliberate
 * hole between the columns and the legal line — roughly half the band's height
 * — and that space is the composition, so the band takes the screen and holds
 * its two rows apart at either end of it rather than closing up to the content.
 *
 * It is a screen rather than a section: one viewport tall and full-bleed, so
 * the page ends on it. That is also what returns the navbar to its hero pose
 * here, with no state of its own to keep in step — the bar is compact only
 * while one of `Header`'s `GROUNDED_SECTIONS` is under it, and once the footer
 * has the viewport there is none, so the pill dissolves back to the bare bar.
 *
 * The wordmark at the foot is the exported Figma artwork, not type: the
 * letterforms carry a per-letter gradient that dims each one at its own edges,
 * which is what makes it read as metal rather than as a large word. The shine
 * is a band swept across a second copy of the same silhouette in `screen`, so
 * it lifts the dim parts of each letter and leaves the lit centres alone —
 * the rules are in `styles/index.css` under `.footer-lettering`.
 *
 * A pointer over the word turns that around: the whole thing drops to almost
 * nothing and a soft circle of light follows the cursor, and what the light
 * shows is the artwork itself at full strength rather than white paint over
 * it. So a lit letter still has the gradient it was drawn with — the light
 * uncovers the metal, it does not replace it. `Lettering` below owns that.
 */

/*
 * How much of the way to the pointer the light travels each frame. The whole
 * of the smoothing is this one number: at 0.16 the circle lands about a tenth
 * of a second behind a fast cursor, which is enough for it to read as a beam
 * being swung rather than a cursor with a shape.
 */
const SPOT_EASE = 0.16

/**
 * The wordmark, and the light over it.
 *
 * Three layers in one isolated box: the artwork, dimmed while the pointer is
 * on it; the ambient sweep, which steps aside when the pointer arrives so
 * there is only ever one light on the word; and the same artwork again at full
 * strength, masked by a soft circle at the cursor.
 *
 * The circle is a gradient in that mask rather than an element being moved,
 * which is the one place here that trades a transform for a repaint. It buys
 * the thing the design is: a moved element would have to carry the artwork
 * with it and would light the word by adding white to it, and white added to a
 * gradient flattens it — every lit letter would come up the same shade. A mask
 * takes nothing away from what is underneath. The layer is 1400 x 160 and only
 * repaints while a pointer is actually over it.
 */
function Lettering() {
  const { ref, revealed } = useReveal({ threshold: 0.1 })
  const reduced = useReducedMotion()

  /* Nothing about the light survives a re-render, so none of it is state. */
  const frame = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    /*
     * A flashlight needs something to point it. On touch there is no pointer
     * to follow and a `:hover` that latches on tap would leave the word dimmed
     * with a circle stuck where the reader last touched it, so the whole
     * behaviour is simply not attached and the artwork is left as it is.
     */
    if (
      typeof window.matchMedia === 'function' &&
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return
    }

    /* Where the pointer is, and where the light has got to. */
    let px = 0
    let py = 0
    let lx = 0
    let ly = 0

    const ease = reduced ? 1 : SPOT_EASE

    const write = () => {
      el.style.setProperty('--spot-x', `${lx}px`)
      el.style.setProperty('--spot-y', `${ly}px`)
    }

    /*
     * The loop stops as soon as the light has caught up rather than running
     * for as long as the pointer is over the word — a cursor resting on a
     * letter should not cost a frame, and the next move restarts it.
     */
    const tick = () => {
      lx += (px - lx) * ease
      ly += (py - ly) * ease
      write()

      if (Math.abs(px - lx) < 0.4 && Math.abs(py - ly) < 0.4) {
        lx = px
        ly = py
        write()
        frame.current = 0
        return
      }

      frame.current = requestAnimationFrame(tick)
    }

    const start = () => {
      if (!frame.current) frame.current = requestAnimationFrame(tick)
    }

    /*
     * `offsetX` rather than a measured rectangle: every layer inside is
     * `pointer-events: none`, so the target of these events is always this
     * element and the offset is already in its own coordinates. It also means
     * no layout is read while the pointer moves.
     */
    const onEnter = (event) => {
      px = event.offsetX
      py = event.offsetY
      /* Lit where the pointer came in, not swept in from wherever it last was. */
      lx = px
      ly = py
      write()
      el.dataset.lit = 'true'
    }

    const onMove = (event) => {
      px = event.offsetX
      py = event.offsetY
      start()
    }

    const onLeave = () => {
      delete el.dataset.lit
      if (frame.current) {
        cancelAnimationFrame(frame.current)
        frame.current = 0
      }
    }

    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)

    return () => {
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (frame.current) cancelAnimationFrame(frame.current)
      frame.current = 0
      delete el.dataset.lit
    }
  }, [ref, reduced])

  return (
    <div
      ref={ref}
      className="footer-lettering reveal"
      data-revealed={revealed}
      aria-hidden="true"
    >
      <span className="footer-lettering-base" />

      <span className="footer-lettering-shine">
        <span className="footer-lettering-sheen" />
      </span>

      <span className="footer-lettering-spot" />
    </div>
  )
}

/** One link column. Label, then the links, on the frame's 24px/4px stack. */
function LinkColumn({ column, revealed, index }) {
  return (
    <div
      className="footer-column reveal"
      data-revealed={revealed}
      style={{ '--reveal-delay': `${(index + 1) * 90}ms` }}
    >
      <p className="footer-label font-display text-micro leading-[1.3] font-medium">
        {column.label}
      </p>

      <ul role="list" className="footer-links">
        {column.links.map((link) => (
          <li key={link.label}>
            <a
              className="footer-link font-display text-body leading-[1.4] font-normal"
              href={link.href}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  const { ref: topRef, revealed: topShown } = useReveal({ threshold: 0.2 })

  return (
    <footer
      id="footer"
      /*
       * One viewport tall, and the top padding clears the navbar: the bar is
       * back in its bare pose here, so it has no ground of its own and the
       * band's first line would otherwise read through it.
       */
      className="footer relative z-10 flex min-h-[100dvh] flex-col  pt-[clamp(6rem,8vw,8.5rem)]"
    >
      {/*
        * The band is on the page's own gutter and nothing narrower: the frame
        * runs its columns to 16px of a 1440 edge, so this is the one block
        * below the hero that is not on `--grid-width`. The wordmark under it
        * then has the whole viewport to be set across, which is the frame's
        * own relationship between the two.
        */}
      <div ref={topRef} className="footer-band px-6">
        <div className="footer-top">
          {/*
            * The statement sits under a label of its own so the four column
            * headings share one line across the band, exactly as the frame
            * sets them.
            */}
          <div
            className="footer-brand reveal"
            data-revealed={topShown}
            style={{ '--reveal-delay': '0ms' }}
          >
           

            <p className="footer-statement font-display  leading-none font-normal">
              <span className="text-ink-muted">{footer.statement[0]}</span>
              <span className="text-ink">{footer.statement[1]}</span>
            </p>
          </div>

          {footer.columns.map((column, i) => (
            <LinkColumn
              key={column.label}
              column={column}
              index={i}
              revealed={topShown}
            />
          ))}
        </div>

        <div className="footer-bottom">
          <p className="font-display text-micro leading-[1.4] font-medium text-ink/80">
            {footer.copyright}
          </p>

          <ul role="list" className="footer-legal">
            {footer.legal.map((link) => (
              <li key={link.label}>
                <a
                  className="footer-link font-display text-micro leading-[1.4] font-medium"
                  href={link.href}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/*
        * Decorative: the word is already read twice above, in the brand label
        * and in the copyright line, so a third announcement would be three
        * TORUKs to a screen reader for one signature on the page.
        */}
      <Lettering />
    </footer>
  )
}
