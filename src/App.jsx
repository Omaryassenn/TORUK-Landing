import { Header } from '@/components/layout/Header'
import { Hero } from '@/components/sections/Hero'

export default function App() {
  return (
    <>
      <Header activeHref="/" />
      <main>
        <Hero />
      </main>
    </>
  )
}
