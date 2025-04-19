import Link from "next/link"
import ComparisonView from "@/components/comparison-view"
import AnimatedBackground from "@/components/animated-background"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center relative">
      {/* Dynamic animated background */}
      <AnimatedBackground />

      {/* Main content */}
      <div className="relative z-20 w-full">
        <header className="w-full border-b border-white/20 bg-black/50 backdrop-blur-sm">
          <div className="container flex h-16 items-center justify-between">
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/" className="font-medium transition-colors hover:text-primary">
                Voting
              </Link>
              <Link href="/leaderboard" className="font-medium transition-colors hover:text-primary">
                Leaderboard
              </Link>
              <Link href="/about" className="font-medium transition-colors hover:text-primary">
                About
              </Link>
            </nav>
          </div>
        </header>

        <div className="container flex flex-col items-center py-10 text-center relative z-30">
          <div className="bg-black/80 backdrop-blur-md p-6 rounded-xl mb-8 border border-purple-900/50 shadow-lg">
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">BRAINROT BENCH</h1>
            <p className="text-lg text-gray-300 mb-4">Which AI generated this Italian brainrot better?</p>
          </div>

          <ComparisonView />
        </div>
      </div>
    </main>
  )
}
