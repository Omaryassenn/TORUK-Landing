import { cn } from '@/lib/cn'
import { site } from '@/content/site'
import { Wordmark } from '@/components/brand/Wordmark'
import { useSplash } from '@/components/splash/context'

/**
 * The black layer, and the frame the header's wordmark flies to.
 *
 * The slot is an empty box with the lockup's own aspect ratio: flexbox centres
 * the logo-plus-progress group, the provider measures the slot, and the real
 * wordmark is transformed onto it. Layout stays in CSS, so the composition
 * recentres itself at any viewport without a single measured constant in JS.
 *
 * Under reduced motion the slot carries its own copy of the lockup instead —
 * nothing travels, nothing scales, and the layer cross-fades to the header's
 * copy sitting in position underneath.
 */
export function Splash() {
  const { phase, reduced, registerSlot, registerBar, registerPercent } = useSplash()

  if (phase === 'done') return null

  const leaving = phase === 'move'
  const progressVisible = phase === 'load' || phase === 'hold'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={!leaving}
      className={cn(
        'fixed inset-0 z-50 grid place-items-center bg-canvas',
        'transition-opacity duration-[640ms] ease-out-quint motion-reduce:duration-[260ms]',
        leaving ? 'pointer-events-none opacity-0 delay-[80ms]' : 'opacity-100',
      )}
    >
      <div className="flex w-[min(58vw,20rem)] flex-col items-center">
        <div
          ref={registerSlot}
          className="aspect-[192/29.945] w-full"
          /* The flight target. Empty in the normal path — the header's own
           * lockup is what the visitor sees sitting here. */
        >
          {reduced && <Wordmark style={{ height: 'auto', width: '100%' }} />}
        </div>

        <div
          className={cn(
            'mt-7 w-full transition-opacity ease-out-quint',
            progressVisible
              ? 'opacity-100 duration-[320ms]'
              : 'opacity-0 duration-[220ms]',
          )}
        >
          <div className="h-[0.125rem] w-full overflow-hidden rounded-full bg-hairline">
            <div
              ref={registerBar}
              className="h-full w-full origin-left rounded-full bg-ink"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>

          <p className="mt-3 text-right font-display text-[0.6875rem] leading-none font-light tracking-[0.1em] text-ink-faint tabular-nums">
            <span ref={registerPercent}>0%</span>
          </p>
        </div>
      </div>

      <span className="sr-only">Loading {site.name}</span>
    </div>
  )
}
