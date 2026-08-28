import { useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { showcase } from '@/content/showcase'
import { Wordmark } from '@/components/brand/Wordmark'

/**
 * The reel, pinned. Structure is deliberately thin because the whole
 * choreography lives in CSS (`.showcase-*` in `styles/index.css`): a tall
 * track, one viewport-sized opaque stage stuck to its top, and a bezelled
 * panel inside the stage that grows while the stage is pinned. Nothing here
 * reads scroll position — see the stylesheet.
 *
 * React owns only the playback state, which scroll knows nothing about.
 */
export function VideoShowcase() {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  /*
   * The control is unconditional: it is part of the composition, and it stands
   * in for the reel until the encode is committed. Until then `play()` rejects
   * on the missing source and the idle layer simply stays up, which is the
   * poster the design asks for anyway.
   */
  const start = () => {
    const video = videoRef.current
    if (!video) return
    video.play().then(
      () => setPlaying(true),
      () => {},
    )
  }

  return (
    <section
      id="reel"
      aria-label={showcase.label}
      className="showcase-track z-10"
    >
      <div className="showcase-stage bg-canvas">
        <div className="showcase-frame">
          {/*
            * Device bezel: a hairline ring sitting just outside the screen.
            * It holds at every size, because the panel is never full bleed —
            * it always keeps air around itself.
            */}
          <div className="showcase-bezel" aria-hidden="true" />

          <div className="showcase-screen bg-canvas-raised">
            <video
              ref={videoRef}
              poster={showcase.poster}
              preload="metadata"
              playsInline
              controls={playing}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              className="absolute inset-0 size-full object-cover"
            >
              {showcase.sources.map((source) => (
                <source key={source.src} src={source.src} type={source.type} />
              ))}
            </video>

            {/*
              * Idle layer. Opaque, so it doubles as the poster while the
              * encode is still being fetched — or missing entirely.
              */}
            <div
              className={cn(
                'showcase-idle absolute inset-0 grid place-items-center bg-canvas-raised',
                playing && 'showcase-idle--spent',
              )}
            >
              {/*
                * The lockup carries its own `h-wordmark`, which is a token
                * utility and so outranks an arbitrary height class whatever
                * order they are written in. Sizing it inline is the only way
                * to take it off the navbar's 26px and onto the panel's scale.
                */}
              <span className="opacity-[0.22]">
                <Wordmark style={{ height: 'clamp(1.5rem, 5.5vw, 7rem)' }} />
              </span>

              <button
                type="button"
                onClick={start}
                className="group absolute inset-0 grid place-items-center focus-visible:outline-offset-[-0.5rem]"
              >
                <span className="sr-only">Play the {showcase.label}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid size-[clamp(3rem,4.4vw,4.5rem)] place-items-center rounded-full',
                    'border border-hairline-strong bg-canvas/70 backdrop-blur-sm',
                    'transition-[transform,background-color] duration-300 ease-out-quint',
                    'group-hover:bg-canvas/85 group-hover:scale-105',
                    'motion-reduce:transition-none motion-reduce:group-hover:scale-100',
                  )}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                    className="w-[34%] translate-x-[6%] text-ink"
                  >
                    <path d="M3.5 1.9a.9.9 0 0 1 1.36-.78l9.1 5.32a.9.9 0 0 1 0 1.56l-9.1 5.32A.9.9 0 0 1 3.5 12.6V1.9Z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
