import { cn } from '@/lib/cn'
import { site } from '@/content/site'
import { Wordmark } from '@/components/brand/Wordmark'
import { useSplash } from '@/components/splash/context'

/**
 * The black layer, and the frame the header's wordmark flies to.
 *
 * The slot is an empty box with the lockup's own aspect ratio: the grid centres
 * it, the provider measures it, and the real wordmark is transformed onto it.
 * Layout stays in CSS, so the composition recentres itself at any viewport
 * without a single measured constant in JS — and because the slot is empty,
 * what the visitor watches assemble here is the header's own lockup.
 *
 * There is no progress readout, and nothing behind the lockup: no halo, no
 * gradient, no vignette. The reveal is the loading state — it runs on its own
 * clock, and the provider holds on the finished lockup if the page is still
 * fetching — so the layer is flat canvas black and the only thing in it is the
 * logo.
 *
 * Under reduced motion the slot carries its own copy of the lockup instead —
 * nothing travels, nothing scales, nothing wipes, and the layer cross-fades to
 * the header's copy sitting in position underneath.
 */
export function Splash() {
  const { phase, reduced, registerSlot } = useSplash()

  if (phase === 'done') return null

  const leaving = phase === 'move'

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
      <div
        ref={registerSlot}
        className="relative aspect-[192/29.945] w-[min(58vw,20rem)]"
        /* The flight target. Empty in the normal path — the header's own
         * lockup is what the visitor sees sitting here. */
      >
        {reduced && <Wordmark style={{ height: 'auto', width: '100%' }} />}
      </div>

      <span className="sr-only">Loading {site.name}</span>
    </div>
  )
}
