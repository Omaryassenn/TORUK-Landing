import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { DemoVideo } from '@/components/sections/DemoVideo'
import { Clients } from '@/components/sections/Clients'
import { About } from '@/components/sections/About'
import { Lifecycle } from '@/components/sections/Lifecycle'
import { Governance } from '@/components/sections/Governance'
import { UseCases } from '@/components/sections/UseCases'
import { Integrations } from '@/components/sections/Integrations'
import { Pricing } from '@/components/sections/Pricing'
import { Faq } from '@/components/sections/Faq'
import { FinalCta } from '@/components/sections/FinalCta'
import { Splash } from '@/components/splash/Splash'
import { SplashProvider } from '@/components/splash/SplashProvider'

/**
 * The page, in the order the argument is made:
 *
 *   hook      hero → demo
 *   proof     clients
 *   educate   about → lifecycle → governance → use cases → integrations
 *   convert   pricing → faq → final CTA
 *
 * Sections are ordered here and nowhere else — every band is presentational and
 * reads its copy from `src/content/`, so re-sequencing the page is a matter of
 * moving lines in this list.
 *
 * The hero is `sticky` (see Hero.jsx) and everything after it is lifted into a
 * single `z-10` layer, so the rest of the page scrolls over the hero as one
 * sheet. The layer needs no background of its own — every band inside it is
 * already opaque `bg-canvas`, and the first one rounds its top edge so the
 * hero stays visible at the corners for the length of the hand-off.
 */
export default function App() {
  return (
    /*
     * The page is mounted in full underneath the splash from the first frame —
     * the overlay only covers it. Nothing about the hand-off is a navigation,
     * so there is no reload to see and nothing reflows when the layer clears.
     */
    <SplashProvider>
      <Header activeHref="/" />
      <main>
        <Hero />

        <div className="relative z-10">
          <DemoVideo />
          <Clients />
          <About />
          <Lifecycle />
          <Governance />
          <UseCases />
          <Integrations />
          <Pricing />
          <Faq />
          <FinalCta />
          <Footer />
        </div>
      </main>
      <Splash />
    </SplashProvider>
  )
}
