import { Header } from '@/components/layout/Header'
import { Hero } from '@/components/sections/Hero'
import { VideoShowcase } from '@/components/sections/VideoShowcase'
import { PlatformGlance } from '@/components/sections/PlatformGlance'
import { Splash } from '@/components/splash/Splash'
import { SplashProvider } from '@/components/splash/SplashProvider'
import { useSplash } from '@/components/splash/context'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

/**
 * Owns the page's inertial scrolling. It sits inside the provider rather than
 * around it because the scroller has to be frozen for exactly as long as the
 * splash is up, and that is the only thing it reads.
 */
function SmoothScroll() {
  const { active } = useSplash()
  useSmoothScroll(active)
  return null
}

export default function App() {
  return (
    /*
     * The page is mounted in full underneath the splash from the first frame —
     * the overlay only covers it. Nothing about the hand-off is a navigation,
     * so there is no reload to see and nothing reflows when the layer clears.
     */
    <SplashProvider>
      <SmoothScroll />
      <Header activeHref="/" />
      <main>
        {/*
          * Hero and reel share one pin scope: the hero sticks to the top of it
          * while the reel's track scrolls the reel up over the hero, and
          * releases the moment the scope ends. Both halves of that are in the
          * `.showcase-*` rules in `styles/index.css`.
          */}
        <div className="showcase-scope">
          <div className="hero-pin">
            <Hero />
          </div>
          <VideoShowcase />
        </div>

        <PlatformGlance />
      </main>
      <Splash />
    </SplashProvider>
  )
}
