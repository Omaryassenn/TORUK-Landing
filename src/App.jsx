import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { VideoShowcase } from '@/components/sections/VideoShowcase'
import { TorukMindset } from '@/components/sections/TorukMindset'
import { PlatformGlance } from '@/components/sections/PlatformGlance'
import { DiveIntoToruk } from '@/components/sections/DiveIntoToruk'
import { UseCases } from '@/components/sections/UseCases'
import { BookDemo } from '@/components/sections/BookDemo'
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
      <Header activeHref="#hero" />
      <main>
        {/*
          * Hero and reel share one pin scope: the hero sticks to the top of it
          * while the reel's track scrolls the reel up over the hero, and
          * releases the moment the scope ends. Both halves of that are in the
          * `.showcase-*` rules in `styles/index.css`.
          */}
        {/*
          * `#hero` is on the scope and not on the hero inside it. The hero is
          * `position: sticky` for the length of this scope, so once the reader
          * has scrolled past it its own box is stuck to the top of the viewport
          * and resolves to wherever they already are — a nav link aimed at it
          * would scroll nowhere. The scope does not move, and its top edge is
          * the top of the document, which is what "Home" means on one page.
          */}
        <div id="hero" className="showcase-scope">
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
        {/*
          * Last of the four, and last in the nav. Everything above it argues
          * the premise and shows the platform; this is the only section that
          * answers "who is already doing this, and with what" — which is a
          * question a reader only has once they have accepted the rest.
          */}
        <UseCases />
        {/*
          * Last, and the only section that asks for anything. Everything above
          * it is the argument; this is where a reader who has accepted it is
          * given somewhere to go, which is why it sits under the use cases
          * rather than being repeated halfway up the page.
          */}
        <BookDemo />
      </main>
      <Footer />
      <Splash />
    </SplashProvider>
  )
}
