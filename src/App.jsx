import { Header } from '@/components/layout/Header'
import { Hero } from '@/components/sections/Hero'
import { VideoShowcase } from '@/components/sections/VideoShowcase'
import { TorukMindset } from '@/components/sections/TorukMindset'
import { PlatformGlance } from '@/components/sections/PlatformGlance'
import { DiveIntoToruk } from '@/components/sections/DiveIntoToruk'
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

        {/*
          * Before the platform, not after it. The two sections below are both
          * answers — what is connected, and where it is built and used — and
          * they only land on a reader who has already accepted the premise
          * that AI is something you employ rather than something you open. This
          * is where that premise is argued, so it comes first.
          */}
        

        <PlatformGlance />
        <TorukMindset />
        {/*
          * The glance says everything is connected in one place; this says
          * what the two halves of that place are. It follows for that reason
          * and not just because it is the newest section — it is the answer to
          * the question the diagram above leaves open.
          */}
        <DiveIntoToruk />
      </main>
      <Splash />
    </SplashProvider>
  )
}
