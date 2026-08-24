import { useEffect, useRef, useState } from 'react'

/** True when the browser can't observe intersections — reveal immediately. */
function unsupported() {
  return typeof IntersectionObserver === 'undefined'
}

/**
 * Flips `data-revealed` on the returned ref once the node scrolls into view.
 * IntersectionObserver rather than a scroll listener, and it disconnects after
 * the first hit — reveals are one-way.
 */
export function useReveal({ threshold = 0.15, rootMargin = '0px 0px -8% 0px' } = {}) {
  const ref = useRef(null)
  const [revealed, setRevealed] = useState(unsupported)

  useEffect(() => {
    const node = ref.current
    if (!node || unsupported()) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setRevealed(true)
        observer.disconnect()
      },
      { threshold, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return { ref, revealed }
}
