import { useEffect, useRef, useState } from 'react'
import { inside } from '@/content/inside'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * "Dive Into TORUK" — the section that takes the reader through the mark.
 *
 * The section is built like every other one below the hero: an eyebrow, a
 * heading and a line of body at the top, and a figure under them. The figure
 * here happens to be the mark itself — and scrolling breaks it, takes the
 * camera through it, and leaves the two environments in the space it was
 * occupying.
 *
 * The header never moves and never fades. It is the section's header, not a
 * phase of it; only what sits underneath changes. The 3D is in `lib/portal`;
 * this file owns the scroll reading, the copy over the scene, and the way the
 * section renders when the scene cannot run.
 *
 * The two environments are a panel each, the width of the page's column, and
 * they are traded rather than shown side by side: Studio's fades up where the
 * mark was and then never moves again, and Everyday's slides up from under it,
 * one stage-height with the scroll, and stops on it exactly.
 *
 * One loop drives both halves. It writes the phase progresses onto the stage
 * as custom properties and hands the same value to the renderer, so the copy
 * and the camera cannot drift apart — which they did when the copy was on its
 * own `view()` timeline and the scene on a rAF.
 */

/*
 * Where each piece comes in and goes out, in section progress.
 *
 * The header is not one of them: it holds the top of the stage for the whole
 * scroll. What changes underneath it is the hint — wrong the moment the reader
 * has started — then Studio's panel, and then Everyday's, which slides up over
 * Studio's and stops on it. A panel is the width of the page's column, so two
 * of them cannot sit side by side on a screen that does not scroll; one covers
 * the other instead.
 *
 * Studio has no `out`. It arrives, and then it is stationary for the rest of
 * the section — what takes it off the stage is the panel that lands on top of
 * it, not a fade or a lift of its own.
 *
 * Everyday's band is the whole of its travel, and the width of the band is the
 * speed. The panel moves one stage-height (`100svh`, in the stylesheet) and the
 * band is 0.38 of a 400svh scope, which is 152svh of scrolling — so it rises at
 * about two thirds of the rate the reader is scrolling at. It was 1:1 and read
 * as too quick: at 1:1 the panel is at the reader's own speed, and a sheet that
 * heavy wants to be visibly slower than the hand pushing it.
 *
 * The gap between the two is what 0.56 buys. The break (`lib/portal`, 0.0375 to
 * 0.345) owns the first third; Studio lands at 0.49 and Everyday's band opens at
 * 0.56, but its top edge does not clear the foot of the stage until about
 * 0.68 — the first third of that travel is spent under the stage's own clip. So
 * Studio holds the stage by itself for around 78svh, and Everyday holds the
 * finished composition for the last 24 before the pin releases and the section
 * scrolls away with it still up.
 */
const PHASES = {
  hint: { out: [0.01, 0.06] },
  studio: { in: [0.42, 0.49] },
  everyday: { in: [0.56, 0.94] },
}

/*
 * How fast the smoothed value chases the scroll, per 60ths of a second.
 *
 * The page already eases the scroll itself (Lenis), so this is not there to
 * take the steps out of a wheel event — it is what gives the plate weight. The
 * prototype's value, made frame-rate independent so a 120Hz display does not
 * run the break at twice the speed.
 */
const CHASE = 0.12

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** Ramp from 0 to 1 across `[a, b]`. */
const band = (p, [a, b]) => clamp01((p - a) / (b - a))

/** A phase's visibility: in over its `in` range, out over its `out` range. */
function level(p, phase) {
  const rising = phase.in ? band(p, phase.in) : 1
  const falling = phase.out ? 1 - band(p, phase.out) : 1
  return rising * falling
}

/**
 * How far a phase still has to travel, in units the stylesheet multiplies out.
 *
 * 1 before it has arrived, 0 once it is in place. The distance itself is the
 * stylesheet's business — 1.75rem for the panel that fades up into position, a
 * whole stage-height for the one that slides over it — so this stays a plain
 * ramp and the two cannot disagree about where "arrived" is.
 */
function rise(p, phase) {
  return 1 - (phase.in ? band(p, phase.in) : 1)
}

/**
 * One environment's panel — Figma nodes 11087:110778 and 11087:110873.
 *
 * Copy on the left, a capture of the environment on the right, and three
 * capabilities under a rule. Studio and Everyday are the same object with
 * different copy and a different capture; what tells them apart is what they
 * show, not how they are built.
 *
 * The capture is decorative. It is a picture of the environment the copy beside
 * it has just named, at a size where its own labels are not readable, so
 * announcing it would repeat the panel rather than add to it.
 */
function Destination({ id, item, phase }) {
  return (
    <article className={`dive-card dive-card--${phase}`} aria-labelledby={`${id}-title`}>
      {/*
        * The frame's one piece of colour, on the top edge above the padding:
        * the sheen off the mark's own gradient, cropped by the panel to the
        * few pixels of it that clear the edge.
        */}
      <span className="dive-card-edge" aria-hidden="true" />

      <div className="dive-card-copy">
        <p className="dive-index font-display font-light">
          {item.index} <span aria-hidden="true">-</span> {item.label}
        </p>

        <h3 id={`${id}-title`} className="dive-card-title font-display font-normal text-ink">
          {item.headline}
        </h3>

        <p className="dive-card-body font-display font-light text-ink-muted text-pretty">
          {item.body}
        </p>

        <span className="dive-card-rule" aria-hidden="true" />

        <ul className="dive-caps">
          {item.capabilities.map((cap) => (
            <li key={cap.label} className="dive-cap">
              <span className="dive-cap-tile" aria-hidden="true">
                <img src={cap.icon} alt="" width="21" height="21" decoding="async" />
              </span>

              <div>
                <p className="dive-cap-label font-display font-medium text-ink">{cap.label}</p>
                <p className="dive-cap-note font-display font-normal text-ink-muted text-pretty">
                  {cap.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="dive-shot">
        <img src={item.shot} alt="" loading="lazy" decoding="async" />
      </div>
    </article>
  )
}

export function DiveIntoToruk() {
  const scopeRef = useRef(null)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)

  const reduced = useReducedMotion()

  /*
   * The section assumes the scene will run and only falls back when it
   * definitely will not — WebGL off, or the context failing to allocate.
   *
   * The assumption is the load-bearing part. Starting static and switching on
   * arrival collapses the scroll scope from three viewports to one and back
   * again while the reader is on the page, which moves everything below it;
   * this way nothing about the layout depends on how quickly the renderer
   * boots, and only a real failure changes it.
   */
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (reduced) return

    const scope = scopeRef.current
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!scope || !stage || !canvas) return

    let portal = null
    let raf = 0
    let observer = null
    let onResize = null
    let cancelled = false

    /* Smoothed and last-written progress, so the loop can skip idle frames. */
    let shown = 0
    let written = -1
    let last = 0

    /*
     * Progress through the scope, measured against the stage rather than
     * against the viewport.
     *
     * The stage is what is pinned, so the scroll the section actually consumes
     * is the scope's height less the stage's — and the two are not the same
     * number on a phone, where the stage is `100svh` but `innerHeight` grows
     * to the large viewport as the URL bar retracts. Measuring against the
     * viewport there left the last few percent of the break unreachable.
     */
    const read = () => {
      const rect = scope.getBoundingClientRect()
      const span = rect.height - stage.offsetHeight
      return span > 0 ? clamp01(-rect.top / span) : 0
    }

    const publish = (p) => {
      /*
       * Rounded before it is compared: the smoothed value keeps changing in
       * the fourth decimal long after the motion has visibly stopped, and
       * every write here is a style recalculation over the whole stage.
       */
      const q = Math.round(p * 1000) / 1000
      if (q === written) return
      written = q
      stage.style.setProperty('--hint', level(q, PHASES.hint).toFixed(3))
      stage.style.setProperty('--studio', level(q, PHASES.studio).toFixed(3))
      stage.style.setProperty('--studio-y', rise(q, PHASES.studio).toFixed(3))
      /*
       * Everyday has no opacity of its own: it is never faded, only moved. It
       * is outside the stage's box until it is not, and the stage's own clip is
       * what hides it until then.
       */
      stage.style.setProperty('--everyday-y', rise(q, PHASES.everyday).toFixed(3))
    }

    publish(read())

    const start = () => {
      if (raf) return
      last = performance.now()
      const tick = (now) => {
        raf = requestAnimationFrame(tick)
        const dt = Math.min(0.1, (now - last) / 1000)
        last = now

        /*
         * Frame-rate independent chase. A fixed per-frame fraction runs twice
         * as fast on a 120Hz display, which on this section is the difference
         * between the plate feeling heavy and feeling flimsy.
         */
        const k = 1 - Math.pow(1 - CHASE, dt * 60)
        const target = read()
        shown += (target - shown) * k
        if (Math.abs(target - shown) < 0.0005) shown = target

        publish(shown)
        portal?.frame(shown, now / 1000)
      }
      raf = requestAnimationFrame(tick)
    }

    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    /*
     * Nothing is downloaded or built until the section is close. `three` and
     * the scene are a dynamic import so they stay out of the entry bundle, and
     * the geometry work — the crack pattern is a few hundred thousand
     * point-in-polygon tests — runs while the reader is still a viewport away.
     */
    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          stop()
          return
        }
        if (portal) {
          start()
          return
        }
        observer.disconnect()

        import('@/lib/portal')
          .then(({ createPortal }) => {
            if (cancelled) return
            const coarse = window.matchMedia?.('(pointer: coarse)').matches
            portal = createPortal(canvas, {
              detail: coarse || window.innerWidth < 768 ? 'reduced' : 'full',
            })
            if (!portal) {
              setFailed(true)
              return
            }

            onResize = () => portal.setSize(stage.clientWidth, stage.clientHeight)
            onResize()
            window.addEventListener('resize', onResize)

            /*
             * Re-observed only now, so the loop starts and stops with the
             * section for the rest of the page's life without the import
             * being reconsidered.
             */
            observer.observe(scope)
            start()
          })
          .catch(() => setFailed(true))
      },
      /* A viewport of lead time, so the build is finished before it is seen. */
      { rootMargin: '100% 0px' },
    )
    observer.observe(scope)

    return () => {
      cancelled = true
      stop()
      observer.disconnect()
      if (onResize) window.removeEventListener('resize', onResize)
      portal?.dispose()
    }
  }, [reduced])

  const isStatic = reduced || failed

  return (
    <section
      id="inside"
      ref={scopeRef}
      aria-labelledby="dive-title"
      className="dive-scope"
      data-static={isStatic || undefined}
    >
      <div ref={stageRef} className="dive-stage">
        {/*
          * Decorative: the scene carries no information the copy over it does
          * not already give, and it is unreachable to a reader who cannot see
          * it. Present from the first frame so the renderer has something to
          * bind to, rather than being mounted on arrival.
          */}
        <canvas ref={canvasRef} className="dive-canvas" aria-hidden="true" />

        <div className="dive-body">
          {/*
            * The section header, set exactly as the other sections below the
            * hero set theirs: the eyebrow, heading and body tokens on a 0.25rem
            * stack inside the shared measure. Nothing here is sized against
            * the artwork — the artwork is what sits underneath it.
            */}
          <header className="dive-head">
            <p className="text-gradient-eyebrow font-display w-fit text-section-eyebrow leading-[1.333] font-light uppercase">
              {inside.entry.eyebrow}
            </p>
            <h2
              id="dive-title"
              className="font-display text-section leading-[1.2] font-normal text-ink"
            >
              {inside.entry.headline}
            </h2>
            <p className="font-display text-body leading-[1.55] font-light text-ink-muted text-pretty">
              {inside.entry.body}
            </p>
          </header>

          {/*
            * The still stands in for the plate wherever the scene does not
            * run. It is the same outline the geometry is generated from, so
            * the two are the same drawing — and it sits where the plate sits,
            * between the header and the cards.
            */}
          {isStatic && (
            <img
              src="/brand/toruk-glyph.svg"
              alt=""
              decoding="async"
              className="dive-glyph"
            />
          )}

          {/*
            * Both panels are in the same grid cell and in the DOM from the
            * first frame, so the copy is always there to be read out and the
            * cell is as tall as the taller of the two for the whole scroll —
            * nothing above them moves when Everyday lands on Studio.
            */}
          <div className="dive-cards">
            <Destination id="dive-studio" item={inside.studio} phase="studio" />
            <Destination id="dive-everyday" item={inside.everyday} phase="everyday" />
          </div>
        </div>

        {/*
          * The hint sits on the stage rather than in the column, so it holds
          * the foot of the frame while the heading above it moves — and so it
          * is not part of what `measure()` has to account for.
          */}
        <p className="dive-hint font-display text-micro leading-none font-light uppercase">
          <span aria-hidden="true" className="dive-hint-rule" />
          {inside.entry.hint}
        </p>
      </div>
    </section>
  )
}
