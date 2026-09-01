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
 * One loop drives both halves. It writes the phase progresses onto the stage
 * as custom properties and hands the same value to the renderer, so the copy
 * and the camera cannot drift apart — which they did when the copy was on its
 * own `view()` timeline and the scene on a rAF.
 */

/*
 * Where each piece comes in and goes out, in section progress.
 *
 * Only two things move. The header is not one of them.
 */
const PHASES = {
  hint: { out: [0.01, 0.06] },
  cards: { in: [0.54, 0.82] },
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
 * The picture on a card.
 *
 * Line drawings rather than product screenshots, and the two are different
 * kinds of picture on purpose: Studio is a graph of wired nodes — something
 * you assemble and can see the whole of — and Everyday is an exchange that
 * ends in an artefact. Swap either for a real capture by replacing the case
 * here; the frame around it does not change.
 */
function Figure({ kind }) {
  return (
    <div className="dive-figure" aria-hidden="true">
      <svg viewBox="0 0 320 168" fill="none" className="dive-figure-art">
        {kind === 'graph' ? (
          <g>
            {/* Wires first, so the nodes sit on top of where they land. */}
            <g className="dive-wire">
              <path d="M92 84C110 84 106 46 124 46" />
              <path d="M92 84C110 84 106 122 124 122" />
              <path d="M212 46C230 46 226 84 244 84" />
              <path d="M212 122C230 122 226 84 244 84" />
            </g>

            {[
              [16, 60, 76, 48],
              [124, 24, 88, 44],
              [124, 100, 88, 44],
              [244, 60, 60, 48],
            ].map(([x, y, w, h]) => (
              <g key={`${x}-${y}`}>
                <rect x={x} y={y} width={w} height={h} rx="8" className="dive-node" />
                {/* A title bar and one rule — enough to read as a card. */}
                <rect x={x + 10} y={y + 12} width={w * 0.42} height="4" rx="2" className="dive-fill-strong" />
                <rect x={x + 10} y={y + 24} width={w * 0.66} height="3" rx="1.5" className="dive-fill" />
                <rect x={x + 10} y={y + 33} width={w * 0.5} height="3" rx="1.5" className="dive-fill" />
              </g>
            ))}

            {/* Ports, on the ends of the wires. */}
            {[[92, 84], [124, 46], [124, 122], [212, 46], [212, 122], [244, 84]].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" className="dive-port" />
            ))}
          </g>
        ) : (
          <g>
            {/* Two turns of a conversation, right then left. */}
            <rect x="150" y="18" width="154" height="30" rx="10" className="dive-node dive-node--filled" />
            <rect x="164" y="29" width="90" height="4" rx="2" className="dive-fill-strong" />
            <rect x="164" y="38" width="120" height="3" rx="1.5" className="dive-fill" />

            <rect x="16" y="58" width="176" height="42" rx="10" className="dive-node" />
            <rect x="30" y="70" width="110" height="4" rx="2" className="dive-fill-strong" />
            <rect x="30" y="80" width="146" height="3" rx="1.5" className="dive-fill" />
            <rect x="30" y="89" width="96" height="3" rx="1.5" className="dive-fill" />

            {/* What the exchange produced. */}
            <rect x="16" y="110" width="288" height="46" rx="10" className="dive-node" />
            <rect x="30" y="121" width="72" height="4" rx="2" className="dive-fill-strong" />
            {[0, 1, 2, 3].map((i) => (
              <rect
                key={i}
                x={30 + i * 16}
                y={146 - [10, 18, 13, 22][i]}
                width="9"
                height={[10, 18, 13, 22][i]}
                rx="2"
                className="dive-bar"
              />
            ))}
            <rect x="120" y="134" width="164" height="3" rx="1.5" className="dive-fill" />
            <rect x="120" y="143" width="128" height="3" rx="1.5" className="dive-fill" />
          </g>
        )}
      </svg>
    </div>
  )
}

/**
 * One environment's card. Studio and Everyday are the same object with
 * different copy and a different drawing — what tells them apart is what they
 * show, not how they are built.
 */
function Destination({ id, item }) {
  return (
    <article className="dive-card" aria-labelledby={`${id}-title`}>
      <Figure kind={item.figure} />

      <p className="dive-index">
        {item.index} <span aria-hidden="true">-</span> {item.label}
      </p>

      <h3 id={`${id}-title`} className="dive-card-title">
        {item.headline}
      </h3>

      <p className="dive-card-body">{item.body}</p>
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
      stage.style.setProperty('--cards', level(q, PHASES.cards).toFixed(3))
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

          <div className="dive-cards">
            <Destination id="dive-studio" item={inside.studio} />
            <Destination id="dive-everyday" item={inside.everyday} />
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
