import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
// Hidden for now — see the note in the showcase scope below.
// import { VideoShowcase } from '@/components/sections/VideoShowcase'
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
          * Hero and glance share one pin scope: the hero sticks to the top of
          * it while the glance's track scrolls the glance up over the hero,
          * and releases the moment the scope ends. The hero's half is the
          * `.hero-pin` rule in `styles/index.css`; the glance's is `.glance-*`
          * beside it. The reel used to be the section doing the rising.
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
          {/*
            * The reel is hidden for now, on request.
            *
            * The glance below took over the rise, so putting the reel back is
            * a decision about which of the two rides up over the hero, not one
            * line: two tracks in the scope would pin the hero for 300svh and
            * stack the reel under the glance.
            *
            * `#reel` leaves the page with it. Nothing points at it: the nav
            * never listed it, and the bar's scroll-spy and pose both look
            * their targets up in the document and skip what is not there.
            */}
          {/* <VideoShowcase /> */}

          {/*
            * The glance takes the reel's place in the pin. It is the section
            * that rises over the hero now, which is why it is inside the scope
            * and not below it: the scope's length is what the hero is sticky
            * for, and with nothing after the hero in it there was nothing to
            * hold still for.
            */}
          <PlatformGlance />
        </div>

        {/*
          * Before the platform, not after it. The two sections below are both
          * answers — what is connected, and where it is built and used — and
          * they only land on a reader who has already accepted the premise
          * that AI is something you employ rather than something you open. This
          * is where that premise is argued, so it comes first.
          */}
        

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
