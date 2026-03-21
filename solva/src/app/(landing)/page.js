import Hero from "./components/Hero"
import Problem from "./components/Problem"
import Solution from "./components/Solution"
import Aha from "./components/Aha"
import Benefits from "./components/Benefits"
import Trust from "./components/Trust"
import CTA from "./components/CTA"

export default function LandingPage() {
  return (
    <main className="bg-white text-black">
      <Hero />
      <Problem />
      <Solution />
      <Aha />
      <Benefits />
      <Trust />
      <CTA />
    </main>
  )
}