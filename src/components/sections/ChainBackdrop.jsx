import { hero } from '@/content/hero'
import { HeroDotField } from '@/components/sections/HeroDotField'

const DESIGN = { w: 1440, h: 1024 }

export function ChainBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-canvas"
      style={{ containerType: 'size' }}
    >
     
      <HeroDotField
        className="absolute inset-0 size-full"
        style={{
          maskImage: 'radial-gradient(120% 100% at 50% 40%, #000 45%, rgba(0,0,0,0.45) 75%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(120% 100% at 50% 40%, #000 45%, rgba(0,0,0,0.45) 75%, transparent 100%)',
        }}
      />

      {/*
        * Box the artwork is placed inside, at the frame's own aspect.
        *
        * Above `md` it covers the section by height, which is what reproduces
        * the 1440x1024 frame on a landscape viewport. On a portrait one that
        * same rule blows the render up to three viewport widths and leaves a
        * single strand filling the screen, so mobile sizes the box off the
        * width instead and the whole knot reads at once.
        */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [--chain-cover:118%] md:[--chain-cover:max(100%,calc(100cqh*1440/1024))]"
        style={{
          aspectRatio: `${DESIGN.w} / ${DESIGN.h}`,
          width: 'var(--chain-cover)',
        }}
      >
        <img
          src={hero.artwork.src}
          alt={hero.artwork.alt}
          fetchPriority="high"
          decoding="async"
          /*
           * The frame's own placement is the `md` value. Mobile drops the knot
           * to roughly two thirds down, which is the band left over once the
           * copy has taken the top and the client strip the foot — the artwork
           * fills that gap instead of competing with the headline for it.
           *
           * `--chain-left` carries it further left there as well. The render's
           * own canvas ends a little past the strand, and at the smaller mobile
           * cover that cut edge stopped clearing the viewport — it read as the
           * chain being sliced off rather than running out of frame. Shifting
           * the placement puts the seam back outside the screen.
           */
          className="absolute max-w-none opacity-80 [--chain-left:42%] [--chain-top:79%] md:opacity-100 md:[--chain-left:50%] md:[--chain-top:57%]"
          style={{
            left: 'var(--chain-left)',
            top: 'var(--chain-top)',
            width: '102%',
            height: '187%',
            transform: 'translate(-50%, -50%) rotate(123.48deg)',
          }}
        />
      </div>

    
      <div className="absolute inset-0 hidden bg-[linear-gradient(96deg,#030303_10%,rgba(3,3,3,0.82)_45%,rgba(3,3,3,0.45)_75%,rgba(3,3,3,0.2)_100%)] md:block lg:bg-[linear-gradient(96deg,#030303_2%,rgba(3,3,3,0.5)_28%,rgba(3,3,3,0.22)_50%,transparent_68%)]" />
     
      {/*
        * Ground for the copy, mobile only. The block sits at the top of the
        * screen there and the chain now rises to meet it, so the scrim is a
        * ceiling rather than a floor: near-solid behind the eyebrow and
        * headline, gone by the time it reaches the artwork. Above `md` the
        * copy has the frame's own left-hand gradient instead.
        */}
      <div className="absolute inset-x-0 top-0 h-[50%] bg-[linear-gradient(to_bottom,#030303_38%,rgba(3,3,3,0.82)_68%,transparent)] md:hidden" />

      {/*
        * Foot. It only has to carry the client strip now, not a whole text
        * block, so mobile keeps a shallow band like the frame's own rather
        * than the 58% wall the bottom-anchored copy used to need.
        */}
      <div className="absolute inset-x-0 bottom-0 h-[20%] bg-[linear-gradient(to_top,#030303_25%,rgba(3,3,3,0.78)_60%,transparent)] md:h-32 md:bg-[linear-gradient(to_top,#030303,transparent)]" />

    
      <div className="absolute right-0 bottom-0 hidden h-[40%] w-[48%] bg-[radial-gradient(118%_100%_at_100%_100%,rgba(3,3,3,0.95)_0%,rgba(3,3,3,0.84)_32%,rgba(3,3,3,0.5)_60%,transparent_100%)] lg:block" />
    </div>
  )
}
