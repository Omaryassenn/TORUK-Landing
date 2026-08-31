import { cn } from '@/lib/cn'
import { glance } from '@/content/glance'
import { useReveal } from '@/hooks/useReveal'

/*
 * The diagram's coordinate system, shared by the wires and the nodes.
 *
 * The stage is locked to this aspect ratio above `xl`, so a viewBox unit is a
 * fixed fraction of the stage at every width — which is what lets the nodes be
 * positioned in CSS percentages and still land exactly on the ends of paths
 * drawn in SVG units. Change the ratio and the two drift apart.
 *
 * Row centres are 44, 162, 280, 398 and 516: five rows, 118 units apart. The
 * nodes are HTML, so that arithmetic lives in `.glance-node` in the stylesheet
 * rather than here; the two have to agree or the wires miss their chips.
 */
const VIEW = { w: 1200, h: 560 }

/*
 * Wires, authored rather than generated. Each ends on the orb's circumference
 * (centre 600,280, r 200) at the angle its row approaches from, so the fan
 * converges instead of five lines meeting at one point.
 *
 * They start at x=220, which is as close to the labels as the longest one can
 * take. Both ends of a wire are fixed in SVG units while the chips scale with
 * the stage, so this clearance is the thing that has to hold at every width;
 * it is why the chips are sized in `cqw` rather than in a clamped px range.
 * Growing the type has moved this out twice, 165 then 180: "Knowledge bases"
 * is the label the whole clearance is set by, and at each larger size it
 * reached past the old start. The visible gap still closes each time, because
 * the node grows by more than the wire moves.
 */
const WIRES = {
  in: [
    'M220 44C325 44 410 68 485 116',
    'M220 162C285 162 355 172 423 186',
    'M220 280H400',
    'M220 398C285 398 355 388 423 374',
    'M220 516C325 516 410 492 485 444',
  ],
  out: [
    'M980 44C875 44 790 68 715 116',
    'M980 162C915 162 845 172 777 186',
    'M980 280H800',
    'M980 398C915 398 845 388 777 374',
    'M980 516C875 516 790 492 715 444',
  ],
}

/*
 * The brightness ramp, in viewBox units: from where the fan leaves the labels
 * to where it meets the orb. Two of them because the outbound fan runs the
 * other way, and the ramp is directional.
 */
const RAMP = {
  in: { x1: 220, y1: 280, x2: 450, y2: 280 },
  out: { x1: 980, y1: 280, x2: 750, y2: 280 },
}

/** Where a wire meets the orb, for the contact glow that sits on the end. */
const CONTACTS = {
  in: [
    [485, 116],
    [423, 186],
    [400, 280],
    [423, 374],
    [485, 444],
  ],
  out: [
    [715, 116],
    [777, 186],
    [800, 280],
    [777, 374],
    [715, 444],
  ],
}

/*
 * The portrait diagram, used below `xl`.
 *
 * This is the desktop figure reoriented, not a fallback for it: the same orb,
 * the same wires, the same radial relationship, turned through ninety degrees
 * so the fan leaves the top and bottom hemispheres instead of the sides.
 *
 * Each group is staggered across two ranks rather than stacked in one column.
 * A single column would put every wire on the same lane and each one would
 * have to cross the nodes below it; two ranks give the outer wires a clear
 * gutter down the sides and the middle wire a clear gap between the inner
 * pair. Nodes here are chip-over-label so they stay narrow enough for that.
 */
const PVIEW = { w: 600, h: 1250 }


/** Node centres, in reading order within each group. */
const PNODES = {
  in: [
    [100, 100],
    [300, 100],
    [500, 100],
    [200, 270],
    [400, 270],
  ],
  out: [
    [200, 980],
    [400, 980],
    [100, 1150],
    [300, 1150],
    [500, 1150],
  ],
}

/*
 * Wires leave a node's near edge and land on the orb (centre 300,625, r 132)
 * at five angles spread across the facing hemisphere. The outer two on each
 * group bow out to x=60 and x=540 so they pass wide of the inner rank.
 */
const PWIRES = {
  in: [
    'M100 148C60 240 60 390 192 549',
    'M300 148C300 250 300 390 300 493',
    'M500 148C540 240 540 390 408 549',
    'M200 318C200 400 225 460 255 501',
    'M400 318C400 400 375 460 345 501',
  ],
  out: [
    'M200 932C200 850 225 790 255 749',
    'M400 932C400 850 375 790 345 749',
    'M100 1102C60 1010 60 860 192 701',
    'M300 1102C300 1000 300 860 300 757',
    'M500 1102C540 1010 540 860 408 701',
  ],
}

/** The same ramp turned through ninety degrees: down into the orb, then up. */
const PRAMP = {
  in: { x1: 300, y1: 148, x2: 300, y2: 520 },
  out: { x1: 300, y1: 932, x2: 300, y2: 730 },
}

const PCONTACTS = {
  in: [
    [192, 549],
    [300, 493],
    [408, 549],
    [255, 501],
    [345, 501],
  ],
  out: [
    [255, 749],
    [345, 749],
    [192, 701],
    [300, 757],
    [408, 701],
  ],
}

/**
 * One orientation's worth of wires.
 *
 * Each connection is one `<g>` carrying `--i`, its pair index. Every delay in
 * the entrance sequence is derived from that, so the two sides of a pair always
 * arrive together without anything being timed in JavaScript.
 */
function Wires({ id, view, wires, contacts, ramp, className }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${view.w} ${view.h}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/*
        * Wires brighten toward the orb, and the ramp is stated in the viewBox's
        * own units rather than in `objectBoundingBox`.
        *
        * Bounding-box units cannot paint these: the middle wire of each fan is
        * a straight run, so its box has no height (landscape) or no width
        * (portrait), and a gradient over a degenerate box is undefined — that
        * row simply did not render. User space has no such edge, and it also
        * makes the ramp a property of the diagram instead of of each path, so
        * every wire in a fan is the same brightness at the same distance from
        * the orb rather than each running its own ramp end to end.
        *
        * Ids are per-orientation because the two viewBoxes are different
        * spaces; `id` keeps the landscape and portrait copies from colliding.
        */}
      <defs>
        {['in', 'out'].map((side) => (
          <linearGradient
            key={side}
            id={`glance-${id}-${side}`}
            gradientUnits="userSpaceOnUse"
            {...ramp[side]}
          >
            <stop offset="0" stopColor="#6F84DB" stopOpacity="0.06" />
            <stop offset="0.55" stopColor="#8FA0E6" stopOpacity="0.3" />
            <stop offset="1" stopColor="#C3CDF5" stopOpacity="0.65" />
          </linearGradient>
        ))}
      </defs>

      {['in', 'out'].map((side) =>
        wires[side].map((d, i) => (
          <g
            key={`${side}-${i}`}
            className={`glance-link glance-link--${side}`}
            style={{ '--i': i }}
          >
            <path
              d={d}
              pathLength="1"
              className="glance-wire"
              stroke={`url(#glance-${id}-${side})`}
            />
            {/*
              * Traffic rides the path itself rather than being stepped along
              * it: `offset-distance` resolves to a transform, so it stays on
              * the compositor. Driving it through `stroke-dashoffset` instead
              * re-strokes the path on the main thread every frame, which is
              * what made an earlier version of this stutter against the page's
              * own scroll loop.
              */}
            <circle r="2" className="glance-particle" style={{ offsetPath: `path("${d}")` }} />
          </g>
        )),
      )}

      {['in', 'out'].map((side) =>
        contacts[side].map(([cx, cy], i) => (
          <circle
            key={`${side}-c-${i}`}
            cx={cx}
            cy={cy}
            r="2.5"
            className="glance-contact"
            style={{ '--i': i }}
          />
        )),
      )}
    </svg>
  )
}

function Node({ item, side, row }) {
  const [px, py] = PNODES[side][row]
  return (
    <li
      className={cn('glance-node', `glance-node--${side}`)}
      /*
       * Both orientations' coordinates ride on the element and the stylesheet
       * picks a pair per breakpoint. `--i` is the entrance index, shared with
       * the wire so a node fades in as its own line lands.
       */
      style={{ '--row': row, '--px': px, '--py': py, '--i': row }}
    >
      <span className="glance-chip">
        <img
          src={`/brand/nodes/${item.id}.svg`}
          alt=""
          loading="lazy"
          decoding="async"
          className="glance-icon"
        />
      </span>
      <span className="glance-label">{item.label}</span>
    </li>
  )
}

/**
 * The platform diagram: ten capabilities wired into the orb.
 *
 * Above `xl` it is one fixed-ratio stage with the wires in SVG behind
 * absolutely-placed nodes. Below it the wires are dropped entirely and the
 * nodes stack above and below the orb, because a fan of curves into a narrow
 * centre is illegible, not just small.
 */
export function PlatformGlance() {
  const { ref, revealed } = useReveal({ threshold: 0.1 })

  const step = (index) => ({
    'data-revealed': revealed,
    style: { '--reveal-delay': `${index * 90}ms` },
  })

  return (
    <section
      id="platform"
      aria-labelledby="glance-title"
      className="relative z-10 bg-canvas px-6 py-[clamp(3rem,4.5vw,4.5rem)]"
    >
      {/*
        * One centred column for the whole section. The heading used to sit on
        * the page gutter while the figure was capped and centred below it, so
        * at 1440 the two started 152px apart and the section read as two
        * unrelated blocks. Both are now bound by `content`, which is the width
        * the figure was already capped to — so nothing about the figure moves.
        */}
      <div ref={ref} className="mx-auto max-w-content">
        {/*
          * Centred on its own axis rather than ragged-left, because the figure
          * below is bilaterally symmetric about the orb: a left-aligned
          * heading over it puts the section's optical centre and the type's in
          * two different places.
          */}
        <header className="mx-auto flex max-w-measure flex-col items-center gap-[0.25rem] text-center">
          <p
            className="reveal text-gradient-eyebrow font-display w-fit text-section-eyebrow leading-[1.333] font-light uppercase"
            {...step(0)}
          >
            {glance.eyebrow}
          </p>
          <h2
            id="glance-title"
            className="reveal font-display text-section leading-[1.2] font-normal text-ink"
            {...step(1)}
          >
            {glance.headline}
          </h2>
          <p
            className="reveal font-display text-body leading-[1.55] font-light text-ink-muted"
            {...step(2)}
          >
            {glance.body}
          </p>
        </header>

        {/*
          * `data-revealed` starts the entrance sequence; every delay inside is
          * derived from the pair index, so the whole thing is declarative and
          * no timers are needed.
          */}
        <div className="glance-diagram" data-revealed={revealed}>
          {/*
            * Decorative: every node is announced by its own list item, so the
            * wires carry no information the lists do not already give. Only one
            * of the two is displayed at a time.
            */}
          <Wires
            id="l"
            className="glance-wires glance-wires--landscape"
            view={VIEW}
            wires={WIRES}
            contacts={CONTACTS}
            ramp={RAMP}
          />
          <Wires
            id="p"
            className="glance-wires glance-wires--portrait"
            view={PVIEW}
            wires={PWIRES}
            contacts={PCONTACTS}
            ramp={PRAMP}
          />

          <div className="glance-orb">
            <img
              src="/brand/orb.webp"
              alt=""
              loading="lazy"
              decoding="async"
              className="glance-orb-sphere"
            />
            {/*
              * Halo and mark, lifted from the frame's export and kept vector.
              * The frame's dashed ring sat on the halo's edge and is dropped;
              * the sphere's inset still leaves that band clear, so the halo
              * reads as a soft edge rather than a drawn one.
              */}
            <svg
              viewBox="0 0 307 307"
              fill="none"
              aria-hidden="true"
              focusable="false"
              className="absolute inset-0 size-full"
            >
              <circle cx="153.5" cy="153.5" r="153.23" fill="#6F84DB" opacity="0.1" />
              {/*
                * A short bright arc that travels the halo's edge once as the
                * sphere arrives, then stops. It runs the same circle the ring
                * used to be drawn on, so it still tracks that edge exactly.
                */}
              <circle
                className="glance-sweep"
                cx="153.5"
                cy="153.5"
                r="153.23"
                pathLength="1"
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                fill="#ffffff"
                d="M244 142.607c-6.404-1.92-13.183-2.935-20.228-2.935-13.783 0-26.632 3.875-37.553 10.658-15.704 9.71-27.307 25.298-31.824 43.67-4.667-18.522-16.535-34.219-32.58-43.82-10.696-6.401-23.273-10.126-36.722-10.126-7.344 0-14.423 1.13-21.093 3.159.041-16.152 13.142-29.213 29.303-29.213.565 0 1.131 0 1.655.041 6.779 10.276 16.195 18.597 27.232 24.208 9.681 4.93 20.637 7.682 32.239 7.682 11.603 0 21.843-2.561 31.258-7.191 11.528-5.646 21.243-14.192 28.247-24.733h.756c15.929 0 28.928 12.727 29.303 28.607l.007-.007Z"
              />
            </svg>
          </div>

          {/*
            * The wrapper is `display: contents` at every width: on the diagram
            * each list is positioned in its own half, and below `xl` they become
            * flex items of the stack so `order` can put one above the orb and
            * the other below. `role="list"` is stated because `display: contents`
            * drops the implicit one.
            */}
          <div className="glance-lists">
            <ul role="list" className="glance-nodes glance-nodes--in">
              {glance.inputs.map((item, i) => (
                <Node
                  key={item.id}
                  item={item}
                  side="in"
                  row={i}
                />
              ))}
            </ul>

            <ul role="list" className="glance-nodes glance-nodes--out">
              {glance.outputs.map((item, i) => (
                <Node
                  key={item.id}
                  item={item}
                  side="out"
                  row={i}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
