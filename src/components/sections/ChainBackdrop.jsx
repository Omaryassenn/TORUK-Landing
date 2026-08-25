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
            top: '57%',
            width: '105%',
            height: '187%',
            transform: 'translate(-50%, -50%) rotate(123.48deg)',
          }}
        />
      </div>

    
      <div className="absolute inset-0 hidden bg-[linear-gradient(96deg,#030303_10%,rgba(3,3,3,0.82)_45%,rgba(3,3,3,0.45)_75%,rgba(3,3,3,0.2)_100%)] md:block lg:bg-[linear-gradient(96deg,#030303_2%,rgba(3,3,3,0.5)_28%,rgba(3,3,3,0.22)_50%,transparent_68%)]" />
     
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_top,#030303_8%,transparent)] md:h-32 md:bg-[linear-gradient(to_top,#030303,transparent)]" />

    
      <div className="absolute right-0 bottom-0 hidden h-[40%] w-[48%] bg-[radial-gradient(118%_100%_at_100%_100%,rgba(3,3,3,0.95)_0%,rgba(3,3,3,0.84)_32%,rgba(3,3,3,0.5)_60%,transparent_100%)] lg:block" />
    </div>
  )
}
