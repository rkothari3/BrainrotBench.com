import ComparisonView from "@/components/comparison-view";
import AnimatedBackground from "@/components/animated-background";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative">
      {/* Dynamic animated background */}
      <AnimatedBackground />

      {/* Main content */}
      <div className="relative z-20 w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-8 text-center relative z-30">
          <div className="bg-black/80 backdrop-blur-md p-6 rounded-xl mb-8 border border-purple-900/50 shadow-lg">
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">
              BRAINROT BENCH
            </h1>
            <p className="text-lg text-gray-300 mb-4">
              Which AI generated this Italian brainrot better?
            </p>
          </div>

          <ComparisonView />
        </div>
      </div>
    </main>
  );
}
