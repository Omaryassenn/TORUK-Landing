import { createContext, useContext } from 'react'

/** What consumers see when the provider isn't mounted, or the splash is spent. */
const INERT = {
  phase: 'done',
  active: false,
  staged: false,
  reduced: false,
  chromeVisible: true,
  contentReady: true,
  registerLogo: () => {},
  registerSlot: () => {},
}

export const SplashContext = createContext(null)

/**
 * Header and hero read this to know when to stage themselves in. Falling back
 * to `INERT` keeps both usable on their own, with no splash in the tree.
 */
export function useSplash() {
  return useContext(SplashContext) ?? INERT
}
