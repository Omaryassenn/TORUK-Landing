import { cn } from '@/lib/cn'
import { site } from '@/content/site'
import { Wordmark } from '@/components/brand/Wordmark'
import { useSplash } from '@/components/splash/context'

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
