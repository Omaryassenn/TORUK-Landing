import { useState } from 'react'

import { Header } from '@/components/layout/Header'
import { Hero } from '@/components/sections/Hero'
import { SplashScreen } from '@/components/splash/SplashScreen'

export default function App() {
  /* The splash owns its own timing: it holds for its four-second floor and
   * calls back once it has cleared itself away. Pass `ready` once the app has
   * real readiness to report (assets, auth, first payload) and the hand-off
   * waits for whichever finishes last. */
  const [booted, setBooted] = useState(false)

  return (
    <>
      {booted ? null : <SplashScreen onDone={() => setBooted(true)} />}
      <Header activeHref="/" />
      <main>
        <Hero />
      </main>
    </>
  )
}
