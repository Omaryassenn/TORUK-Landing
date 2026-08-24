import { hero } from '@/content/hero'
import { HeroDotField } from '@/components/sections/HeroDotField'

/**
 * The interlocking-chain render behind the hero (Figma node 10017:152382).
 *
 * Figma expresses the placement as a rotated rectangle sized with `hypot()`
 * over container-query units. Resolved against the 1440x1024 frame that becomes
 * a 1598.7 x 1915.0 image, centred at (685.7, 581.5), rotated 123.48deg — the
 * percentages below. Cross-checks: the rotated bounding box reproduces Figma's
 * 2479.2 x 2389.7 container, and 1598.7/1915.0 matches the source asset's own
 * 1860/2228 aspect, so nothing is being stretched.
 *
 * The wrapper reproduces `object-fit: cover` for a transformed child: it holds
 * the design's aspect ratio and grows to whichever axis needs covering, so the
 * artwork scales uniformly instead of distorting with the viewport.
 */
const DESIGN = { w: 1440, h: 1024 }

export function ChainBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-canvas"
      /*
       * A size container, so the cover maths below can measure its own box.
       * Below `md` this backdrop is a band at the top of the hero rather than
       * the whole section, and keying off `svh` there would oversize the
       * artwork by the height of the copy block beneath it.
       */
      style={{ containerType: 'size' }}
    >
      {/*
       * Flow-canvas dot grid, cursor-reactive. Sits under the artwork so the
       * cable occludes it, the way a node editor's canvas reads. The same
       * radial mask keeps it from running hard into the edges; dot pitch and
       * brightness live in HeroDotField.
       */}
      <HeroDotField
        className="absolute inset-0 size-full"
        style={{
          maskImage: 'radial-gradient(120% 100% at 50% 40%, #000 45%, rgba(0,0,0,0.45) 75%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(120% 100% at 50% 40%, #000 45%, rgba(0,0,0,0.45) 75%, transparent 100%)',
        }}
      />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          aspectRatio: `${DESIGN.w} / ${DESIGN.h}`,
          width: `max(100%, calc(100cqh * ${DESIGN.w} / ${DESIGN.h}))`,
        }}
      >
        <img
          src={hero.artwork.src}
          alt={hero.artwork.alt}
          fetchPriority="high"
          decoding="async"
          className="absolute max-w-none"
          style={{
            left: '52%',
            top: '53%',
            width: '100%',
            height: '187%',
            transform: 'translate(-50%, -50%) rotate(123.48deg)',
          }}
        />
      </div>

      {/*
       * Not in the frame — at 1440 the render is already dark behind the copy,
       * so this stays faint there. It has to work harder off-ratio: the text
       * block is a fixed 865/720px wide while the artwork scales with the
       * viewport, so as the viewport narrows the cable climbs under the
       * headline. The ramp therefore has to reach past the headline's 720px,
       * not stop at the ~46% that sufficed at the design width.
       */}
      <div className="absolute inset-0 hidden bg-[linear-gradient(96deg,#030303_10%,rgba(3,3,3,0.82)_45%,rgba(3,3,3,0.45)_75%,rgba(3,3,3,0.2)_100%)] md:block lg:bg-[linear-gradient(96deg,#030303_2%,rgba(3,3,3,0.5)_28%,rgba(3,3,3,0.22)_50%,transparent_68%)]" />
      {/*
       * Melts the artwork into the canvas at its bottom edge. Below `md` that
       * edge is the seam with the copy block, so the fade runs deeper to hide
       * it; from `md` up it is the usual grounding gradient.
       */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_top,#030303_8%,transparent)] md:h-32 md:bg-[linear-gradient(to_top,#030303,transparent)]" />

      {/*
       * Clears the bottom-right corner for the capability list. The artwork
       * covers on whichever axis needs it, but the list is anchored to the
       * viewport's corner — so at aspect ratios wider than the design's 1.406
       * the two drift apart and the bright cable ends up directly behind the
       * text. At 1440x1024 that corner is already near-black, so this is
       * close to a no-op there and only does work off-ratio.
       */}
      <div className="absolute right-0 bottom-0 hidden h-[40%] w-[48%] bg-[radial-gradient(118%_100%_at_100%_100%,rgba(3,3,3,0.95)_0%,rgba(3,3,3,0.84)_32%,rgba(3,3,3,0.5)_60%,transparent_100%)] lg:block" />
    </div>
  )
}
