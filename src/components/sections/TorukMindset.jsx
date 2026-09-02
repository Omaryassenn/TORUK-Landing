import { useEffect, useRef } from 'react'
import { mindset } from '@/content/mindset'
import { useReveal } from '@/hooks/useReveal'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * "The TORUK Mindset" — Figma node 11069:107918.
 *
 * A heading and three cards. The frame puts the section's conclusion at the
 * top and uses the cards to earn it, so nothing here builds toward a closing
 * line: the closing line is the first thing read.
 *
 * Each card is a capture of the product over a pair of terms, the first struck
 * through. The strike is the design's whole device for "this is the old way" —
 * there is no arrow, no numbering and no diagram, and the picture above it is
 * the product actually doing the new thing.
 */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

/*
 * How much of the viewport the strip travels through while the cycle fills.
 *
 * 0 with the strip's top on the bottom edge of the viewport, 1 once it has
 * risen to 40% from the top — so the five stages complete over roughly half a
 * screen of scrolling, about 100px each. Shorter than that and the fill is
 * over before the eye reaches it; longer and the last stage never lands,
 * because the strip sits at the foot of the section and the next section is
 * already taking the screen.
 */
const FILL_SPAN = 0.6

/**
 * One shift.
 *
 * The picture is decorative. Every other figure on this page is, and the two
 * terms plus the line under them already say everything the capture shows —
 * announcing "TORUK Everyday home screen" over the top of "Assistant,
 * Employee" would repeat the card rather than add to it.
 */
function Shift({ item, revealed, index }) {
  return (
    <li
      className="mindset-card reveal"
      data-revealed={revealed}
      style={{ '--reveal-delay': `${index * 120}ms` }}
    >
      <div className="mindset-shot">
        <img src={item.image} alt="" loading="lazy" decoding="async" />
      </div>

      <div className="mindset-copy">
        <p className="mindset-terms font-display">
          {/*
            * One paragraph rather than two, so the pair is a single line of
            * reading for a screen reader as well as for the eye.
            */}
          <span className="mindset-from text-mindset-note leading-[1.43] font-normal">
            {item.from}
          </span>
          <span className="mindset-to text-mindset-term leading-[1.556] font-normal">
            {item.to}
          </span>
        </p>

        <p className="font-display text-mindset-note leading-[1.43] font-normal text-ink-muted text-pretty">
          {item.body}
        </p>
      </div>
    </li>
  )
}

export function TorukMindset() {
  const { ref: headRef, revealed: headShown } = useReveal({ threshold: 0.2 })
  const { ref: cardsRef, revealed: cardsShown } = useReveal({ threshold: 0.2 })
  const { ref: loopRef, revealed: loopShown } = useReveal({ threshold: 0.3 })

  /*
   * The cycle fills as the strip crosses the screen and empties again on the
   * way back up, so it is read off the scroll position every frame rather than
   * played once on arrival. One custom property carries it; the five rules
   * derive their own fill from it in the stylesheet, so a frame costs one
   * property write rather than five.
   */
  const stripRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return

    /* Nothing to track: the cycle is simply shown complete. */
    if (reduced) {
      strip.style.setProperty('--progress', '1')
      return
    }

    let raf = 0
    let written = -1

    const publish = () => {
      const rect = strip.getBoundingClientRect()
      const vh = window.innerHeight
      const p = clamp01((vh - rect.top) / (vh * FILL_SPAN))
      /*
       * Rounded before it is compared. The raw value changes in the fourth
       * decimal on every frame long after the fill has visibly stopped, and
       * each write recalculates style across all five stages.
       */
      const q = Math.round(p * 200) / 200
      if (q === written) return
      written = q
      strip.style.setProperty('--progress', String(q))
    }

    const tick = () => {
      raf = requestAnimationFrame(tick)
      publish()
    }

    /*
     * The loop runs only while the strip is on screen. Off screen the fill is
     * pinned to whichever end it left by, so scrolling back finds it where it
     * was rather than at zero.
     */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!raf) raf = requestAnimationFrame(tick)
        } else {
          cancelAnimationFrame(raf)
          raf = 0
          publish()
        }
      },
      { rootMargin: '20% 0px' },
    )

    publish()
    observer.observe(strip)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [reduced])

  const headStep = (index) => ({
    'data-revealed': headShown,
    style: { '--reveal-delay': `${index * 90}ms` },
  })

  return (
    <section
      id="mindset"
      aria-labelledby="mindset-title"
      className="relative z-10 bg-canvas px-6 py-[clamp(3rem,4.5vw,4.5rem)]"
    >
      <div className="page-column flex flex-col gap-[1.6875rem]">
        {/*
          * Centred, like the two sections below it, and on the frame's own
          * 8px/6px stack rather than the 0.25rem the other section headers
          * use — this one carries a 30px heading where they carry 28px.
          */}
        <header
          ref={headRef}
          className="mx-auto flex max-w-[48.4375rem] flex-col items-center gap-[0.5rem] text-center"
        >
          <p
            className="reveal text-gradient-eyebrow font-display w-fit text-section-eyebrow leading-[1.778] font-light uppercase"
            {...headStep(0)}
          >
            {mindset.eyebrow}
          </p>

          <h2
            id="mindset-title"
            className="reveal font-display text-mindset-headline leading-[1.267] font-normal text-ink"
            {...headStep(1)}
          >
            {mindset.headline}
          </h2>

          <p
            className="reveal font-display max-w-[43.6875rem] text-body leading-[1.5] font-normal text-ink-muted text-pretty"
            {...headStep(2)}
          >
            {mindset.body}
          </p>
        </header>

        <ol ref={cardsRef} role="list" className="mindset-cards">
          {mindset.shifts.map((item, i) => (
            <Shift key={item.id} item={item} index={i} revealed={cardsShown} />
          ))}
        </ol>

        {/*
          * The cycle the three shifts add up to. It hangs off one rule across
          * the column, with a second rule over each stage — the first of them
          * lit, because that is where the cycle is entered.
          */}
        <ol
          ref={(node) => {
            loopRef.current = node
            stripRef.current = node
          }}
          role="list"
          className="mindset-stages reveal"
          data-revealed={loopShown}
        >
          {mindset.loop.map((stage, i) => (
            <li key={stage.name} className="mindset-stage" style={{ '--i': i }}>
              <span className="mindset-stage-rule" aria-hidden="true" />
              <span className="mindset-stage-name font-display  leading-none font-medium text-ink">
                {stage.name}
              </span>
              <span className="mindset-stage-note font-display text-mindset-note leading-[1.43] font-normal text-ink-muted">
                {stage.note}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
