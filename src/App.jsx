import { Header } from '@/components/layout/Header'
import { Hero } from '@/components/sections/Hero'
import { Splash } from '@/components/splash/Splash'
import { SplashProvider } from '@/components/splash/SplashProvider'

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
      </main>
      <Splash />
    </SplashProvider>
  )
}
