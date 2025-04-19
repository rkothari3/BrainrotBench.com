import Link from "next/link";

export default function About() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <header className="w-full border-b">
        <div className="container flex h-16 items-center justify-between">
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              className="font-medium transition-colors hover:text-primary"
            >
              Voting
            </Link>
            <Link
              href="/leaderboard"
              className="font-medium transition-colors hover:text-primary"
            >
              Leaderboard
            </Link>
            <Link
              href="/about"
              className="font-medium transition-colors hover:text-primary"
            >
              About
            </Link>
          </nav>
        </div>
      </header>

      <div className="container py-10 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-center">
          BRAINROT BENCH
        </h1>
        <h2 className="text-2xl font-semibold mb-6 text-center">About</h2>

        <div className="prose dark:prose-invert max-w-none">
          <p>
            Brainrot Bench is a platform for comparing how different AI models
            generate "Italian brainrot" content. Our system presents random
            prompts to different AI models, which respond by generating code
            that creates a video with a static image and audio.
          </p>

          <h3>How It Works</h3>
          <ol>
            <li>
              Our system generates a random prompt related to Italian culture,
              food, or scenarios.
            </li>
            <li>
              Multiple AI models receive the same prompt and generate content
              based on it.
            </li>
            <li>
              Users vote blindly on which AI-generated content they prefer.
            </li>
            <li>
              After voting, users discover which AI model created each piece of
              content.
            </li>
            <li>Results are aggregated to create our leaderboard.</li>
          </ol>

          <h3>Why "Brainrot"?</h3>
          <p>
            "Brainrot" refers to content that's absurdly entertaining, often
            surreal, and slightly addictive. We've combined this concept with
            Italian themes to create a unique benchmark for testing AI
            creativity and humor in a culturally specific context.
          </p>

          <h3>Our Mission</h3>
          <p>
            We aim to provide an entertaining way to compare AI models while
            gathering valuable data on how different models interpret and
            generate content based on cultural references and creative prompts.
          </p>

          <h3>Contact</h3>
          <p>
            For questions, feedback, or collaboration opportunities, please
            email us at
            <a href="mailto:info@brainrotbench.com" className="ml-1">
              info@brainrotbench.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
