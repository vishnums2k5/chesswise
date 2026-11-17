import Link from 'next/link';
import {
  Sparkles,
  Crown,
  Brain,
  Cpu,
  Repeat,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Box,
  KeyRound,
  Check,
  X as XIcon,
} from 'lucide-react';
import { AnnotationGlyph } from '@/components/chess/annotation-glyph';
import { createClient } from '@/lib/supabase/server';
import { LandingNav } from '@/components/landing/landing-nav';
import { HeroPreview } from '@/components/landing/hero-preview';
import { FaqAccordion } from '@/components/landing/faq-accordion';

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* 1. Sticky Navigation Header */}
      <LandingNav userEmail={user?.email} />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
          {/* Ambient background glow accents */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/15 via-amber-500/5 to-transparent blur-[120px]" />

          <div className="mx-auto max-w-5xl text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Stockfish 18 NNUE + Socratic AI Reasoning Engine</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 font-serif text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl sm:leading-[1.15] lg:text-7xl">
              Stop Memorizing Lines.{' '}
              <span className="block bg-gradient-to-r from-primary via-amber-300 to-amber-500 bg-clip-text text-transparent">
                Start Thinking Like a Grandmaster.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg sm:leading-relaxed">
              The intelligent chess platform that converts your real blunders into personalized
              Socratic training puzzles with spaced repetition. Grounded in your actual game history
              — never spoiled by cold engine lines.
            </p>

            {/* Dual CTAs */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-amber-500 px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-105 active:scale-95"
                >
                  <Crown className="h-4 w-4" />
                  <span>Enter Training Studio</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-amber-500 px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-105 active:scale-95"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Start Training — Free</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <a
                    href="#socratic-coach"
                    className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card/60 px-6 py-3.5 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:border-border hover:bg-accent"
                  >
                    <span>How Socratic AI Works</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                </>
              )}
            </div>

            {/* Trust Micro-Badges */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Free forever tier</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>1-Click Lichess &amp; Chess.com sync</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>BYOK private API key support</span>
              </div>
            </div>

            {/* 3. Hero Interactive Showcase Component */}
            <div className="mt-12 sm:mt-16" id="socratic-coach">
              <HeroPreview />
            </div>
          </div>
        </section>

        {/* 4. Social Proof & Metrics Ribbon */}
        <section className="border-y border-border/60 bg-card/30 py-10 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="font-mono text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
                  +185 Elo
                </div>
                <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                  Average 90-day rating gain
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="font-mono text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  100,000+
                </div>
                <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                  Blunders converted to puzzles
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="font-mono text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
                  3-Tier
                </div>
                <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                  Socratic hints without spoilers
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="font-mono text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  100% BYOK
                </div>
                <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                  Client-side API key privacy
                </p>
              </div>
            </div>

            {/* Platform Compatibility Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-border/40 pt-6 text-xs text-muted-foreground/80">
              <span className="font-medium text-muted-foreground">Supported Standards:</span>
              <span className="font-mono">Chess.com API</span>
              <span>·</span>
              <span className="font-mono">Lichess Official API</span>
              <span>·</span>
              <span className="font-mono">Stockfish 18 NNUE</span>
              <span>·</span>
              <span className="font-mono">PGN 3.0 Notation</span>
              <span>·</span>
              <span className="font-mono">WebGL Three.js 3D</span>
            </div>
          </div>
        </section>

        {/* 5. Core Feature Bento Grid */}
        <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Engineered for Serious Chess Mastery
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Everything You Need to Stop Repeating Blunders
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Traditional engines give you raw +3.2 calculations that you forget after 5 minutes.
                Chesswise builds permanent tactical intuition with active recall.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Card 1: Socratic AI & RAG (Span 2 on lg) */}
              <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-card/80 to-card/40 p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md lg:col-span-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                  <Brain className="h-5 w-5" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Socratic AI Coach with Grounded RAG
                  </h3>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Signature
                  </span>
                </div>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Ask deep questions about your critical game moments. Our Retrieval-Augmented
                  Generation (RAG) engine feeds your exact move sequences and positional context to
                  humanized AI coaches. Rather than giving away the answer, it gives you progressive
                  clues to cultivate your inner grandmaster.
                </p>

                {/* Micro preview mock */}
                <div className="mt-5 rounded-xl border border-border/60 bg-background/70 p-3.5 text-xs">
                  <div className="flex items-center gap-2 font-mono text-muted-foreground">
                    <span className="font-semibold text-primary">Coach:</span>
                    <span>
                      &ldquo;Why did Black play 14... h6 instead of contesting the d5 outpost? Think
                      about king safety.&rdquo;
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Blunder-to-Puzzle Pipeline (SM-2) */}
              <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-primary">
                  <Repeat className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
                  Blunder-to-Puzzle Pipeline
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Every mistake and blown advantage in your imported games is automatically turned
                  into a custom puzzle. Powered by the SM-2 algorithm, you review them at the exact
                  moment of forgetting.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-primary">
                  <span>Explore Daily Gym</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Card 3: Stockfish 18 NNUE Analysis */}
              <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-primary">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
                  Stockfish 18 NNUE Engine
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Blistering multi-threaded evaluations running in WebAssembly or cloud workers.
                  Includes ply-by-ply win rate progression, blunder classification, and candidate
                  alternatives.
                </p>
                <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <span>Depth 28+</span>
                  <span>·</span>
                  <span>Centipawn precision</span>
                </div>
              </div>

              {/* Card 4: 3D Three.js & 2D Studio Views */}
              <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-primary">
                  <Box className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
                  3D &amp; 2D Studio Immersion
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Experience chess in tournament-grade 2D vector boards or switch effortlessly to
                  photorealistic 3D Three.js Staunton sets with customizable camera angles and board
                  finishes.
                </p>
                <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <span>Toggle with 1 key</span>
                  <span>·</span>
                  <span>60 FPS WebGL</span>
                </div>
              </div>

              {/* Card 5: Opening Repertoire Guard (Span 2 on lg) */}
              <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md lg:col-span-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
                  Opening Repertoire Guard &amp; Tree Explorer
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Build and audit your opening repertoire for both White and Black. Drill the theory
                  lines against AI sparring bots, and get alerted whenever your online games diverge
                  from your prepared weapons.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md border border-border bg-card/80 px-2.5 py-1 text-muted-foreground">
                    Sicilian Defense (Najdorf &amp; Dragon)
                  </span>
                  <span className="rounded-md border border-border bg-card/80 px-2.5 py-1 text-muted-foreground">
                    Queen&apos;s Gambit Declined
                  </span>
                  <span className="rounded-md border border-border bg-card/80 px-2.5 py-1 text-muted-foreground">
                    Ruy Lopez &amp; Italian
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. 3-Step Workflow ("From Blunder to Brilliance") */}
        <section id="how-it-works" className="border-t border-border/60 bg-card/20 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                The Mastery Loop
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                From Blunder to Brilliance in 3 Steps
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
                How Chesswise turns your painful game losses into permanent rating growth.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="relative rounded-2xl border border-border/80 bg-card/50 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-3xl font-extrabold text-primary">01</span>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                    1-Click Sync
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-lg font-bold text-foreground">
                  Sync Your Game Archives
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Enter your Lichess or Chess.com username. Chesswise instantly fetches your recent
                  matches and runs background engine diagnostics to pinpoint tactical swings.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-2xl border border-primary/30 bg-card/80 p-6 shadow-sm ring-1 ring-primary/20">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-3xl font-extrabold text-primary">02</span>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                    Interactive Hinting
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-lg font-bold text-foreground">
                  Socratic Deconstruction
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  The AI doesn&apos;t just reveal the winning tactic. It probes your calculation
                  with 3 progressive hints: recognizing the strategic motif, identifying candidate
                  pieces, and solving the line.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-2xl border border-border/80 bg-card/50 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-3xl font-extrabold text-primary">03</span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                    Spaced Recall
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-lg font-bold text-foreground">
                  Spaced Repetition Lock-In
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Your corrected positions are automatically scheduled in your Daily Training gym
                  using the SM-2 algorithm. You retain patterns permanently, not just for a day.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Comparison Matrix */}
        <section id="comparison" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Uncompromising Training
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Chesswise vs. The Alternatives
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Why grandmaster training principles beat passive engine line memorization.
              </p>
            </div>

            <div className="mt-12 overflow-x-auto rounded-2xl border border-border/80 bg-card/60 shadow-md">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border/80 bg-card/80">
                    <th className="p-4 font-semibold text-foreground sm:p-5">Feature</th>
                    <th className="p-4 font-bold text-primary sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <Crown className="h-4 w-4" />
                        <span>Chesswise AI</span>
                      </div>
                    </th>
                    <th className="p-4 font-semibold text-muted-foreground sm:p-5">
                      Traditional Engines
                    </th>
                    <th className="p-4 font-semibold text-muted-foreground sm:p-5">
                      Human Coach ($60/hr)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="p-4 font-medium text-foreground sm:p-5">
                      Socratic Hint Ladder (Zero spoilers)
                    </td>
                    <td className="p-4 font-bold text-primary sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span>3 Progressive Tiers</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <XIcon className="h-4 w-4 text-blunder" />
                        <span>Instant Spoilers</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span>Yes (Scheduled only)</span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-4 font-medium text-foreground sm:p-5">
                      Puzzles from your actual mistakes
                    </td>
                    <td className="p-4 font-bold text-primary sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span>100% Automated</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <XIcon className="h-4 w-4 text-blunder" />
                        <span>Generic Puzzles</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400">~</span>
                        <span>Manual Curation</span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-4 font-medium text-foreground sm:p-5">
                      SM-2 Spaced Repetition Scheduling
                    </td>
                    <td className="p-4 font-bold text-primary sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span>Integrated Gym</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <XIcon className="h-4 w-4 text-blunder" />
                        <span>None</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <XIcon className="h-4 w-4 text-blunder" />
                        <span>Homework Spreadsheets</span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-4 font-medium text-foreground sm:p-5">
                      Grounded AI Chat &amp; Positional RAG
                    </td>
                    <td className="p-4 font-bold text-primary sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span>24/7 Context-Aware</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <XIcon className="h-4 w-4 text-blunder" />
                        <span>No Chat</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400">~</span>
                        <span>During lesson hour</span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-4 font-medium text-foreground sm:p-5">
                      Bring Your Own Key (BYOK) Privacy
                    </td>
                    <td className="p-4 font-bold text-primary sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span>Gemini/OpenAI/Router</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <XIcon className="h-4 w-4 text-blunder" />
                        <span>Locked Ecosystem</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground sm:p-5">
                      <div className="flex items-center gap-1.5">
                        <span>N/A</span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-4 font-medium text-foreground sm:p-5">Monthly Investment</td>
                    <td className="p-4 font-bold text-primary sm:p-5">
                      <span>Free / $9/mo</span>
                    </td>
                    <td className="p-4 text-muted-foreground sm:p-5">
                      <span>$14 - $29/mo</span>
                    </td>
                    <td className="p-4 text-muted-foreground sm:p-5">
                      <span>$150 - $400/mo</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 8. Testimonials Section */}
        <section className="border-t border-border/60 bg-card/20 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Player Endorsements
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Loved by Club Competitors &amp; Online Improvers
              </h2>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Testimonial 1 */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-6 shadow-sm">
                <div className="flex items-center gap-1 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  &ldquo;The Socratic Whisper is what chess coaching should have been from day one.
                  Telling a 1500 player to play 21. Ba6 without explaining the theme is useless.
                  Chesswise asks the right question until I see the tactic myself.&rdquo;
                </p>
                <div className="mt-6 border-t border-border/60 pt-4">
                  <div className="text-xs font-semibold text-foreground sm:text-sm">
                    NM Marcus Vance
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    National Master · FIDE 2210
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-6 shadow-sm">
                <div className="flex items-center gap-1 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  &ldquo;I used to repeat the exact same pin blunders in the French Defense. The
                  SM-2 spaced repetition queue drilled my exact mistakes until I physically
                  can&apos;t miss them in blitz anymore. Jumped from 1420 to 1680 in 4
                  months.&rdquo;
                </p>
                <div className="mt-6 border-t border-border/60 pt-4">
                  <div className="text-xs font-semibold text-foreground sm:text-sm">
                    Elena Rostova
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Club Competitor · Rapid 1680
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-6 shadow-sm">
                <div className="flex items-center gap-1 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  &ldquo;BYOK with Google AI Studio is insane value. I get master-level analysis on
                  25 games a day with my own Gemini key for basically fractions of a penny. No other
                  chess app gives you that level of freedom.&rdquo;
                </p>
                <div className="mt-6 border-t border-border/60 pt-4">
                  <div className="text-xs font-semibold text-foreground sm:text-sm">David Chen</div>
                  <div className="text-[11px] text-muted-foreground">
                    Software Engineer &amp; Chess Improver
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Transparent Pricing & BYOK Callout */}
        <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Transparent Plans
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Choose the Right Cadence for Your Rating Goals
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Start completely free. Upgrade anytime or plug in your own API key for infinite
                unmetered coaching.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:mx-auto lg:max-w-4xl">
              {/* Free Forever Plan */}
              <div className="relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 shadow-sm sm:p-8">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl font-bold text-foreground">Free Forever</h3>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      Starter
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-extrabold text-foreground">$0</span>
                    <span className="text-xs text-muted-foreground">/ month</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Everything you need to review your games and test the Socratic engine.
                  </p>

                  <ul className="mt-6 space-y-3 text-xs text-muted-foreground sm:text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>Daily Spaced Repetition (SM-2) Puzzles</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>Standard Stockfish 18 in-browser evaluation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>1-click Lichess &amp; Chess.com PGN importer</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>2D Tournament &amp; 3D Three.js Studio Boards</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>
                        <strong className="text-foreground">Full BYOK Support:</strong> Connect your
                        own Gemini/OpenAI key for unmetered AI coach chat
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 border-t border-border/60 pt-6">
                  <Link
                    href="/register"
                    className="flex w-full items-center justify-center rounded-xl border border-border bg-card py-3 text-xs font-semibold text-foreground transition-colors hover:bg-accent sm:text-sm"
                  >
                    Start Free
                  </Link>
                </div>
              </div>

              {/* Pro Coach Plan */}
              <div className="relative flex flex-col justify-between rounded-2xl border-2 border-primary/50 bg-gradient-to-b from-card to-card/90 p-6 shadow-xl shadow-primary/5 sm:p-8">
                <div className="absolute -top-3.5 right-6 rounded-full bg-gradient-to-r from-primary to-amber-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow">
                  Most Popular
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl font-bold text-foreground">Pro Coach</h3>
                    <Crown className="h-5 w-5 text-primary" />
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-extrabold text-primary">$9</span>
                    <span className="text-xs text-muted-foreground">/ month</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    For ambitious players aiming for continuous rating breakthroughs.
                  </p>

                  <ul className="mt-6 space-y-3 text-xs text-muted-foreground sm:text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span className="font-medium text-foreground">Everything in Free, plus:</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span>Unlimited Deep Stockfish 18 NNUE Cloud Engine (Depth 30+)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span>Managed high-speed Socratic AI reasoning without your own key</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span>Opening Repertoire Guard &amp; Sparring Bot simulator</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span>Unlimited custom puzzle deck imports and cloud sync</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      <span>Cognitive Blindspot Fingerprint &amp; Radar tracking</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 border-t border-border/60 pt-6">
                  <Link
                    href="/register"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-amber-500 py-3 text-xs font-semibold text-primary-foreground shadow transition-all hover:brightness-105 active:scale-95 sm:text-sm"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Upgrade to Pro Coach</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* BYOK Callout Banner */}
            <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-primary/20 bg-primary/5 p-5 backdrop-blur-md sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-foreground">
                      Power User? Bring Your Own API Key (BYOK)
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Plug in your Google AI Studio (Gemini), OpenAI, or OpenRouter key. Enjoy
                      limitless grandmaster Socratic coaching at raw model cost — stored encrypted
                      in your browser.
                    </p>
                  </div>
                </div>
                <Link
                  href="/settings"
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <span>Configure Keys</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Interactive FAQ Accordion */}
        <section id="faq" className="border-t border-border/60 bg-card/20 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Got Questions?
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Everything you need to know about the engine, privacy, and Socratic training
                methodology.
              </p>
            </div>

            <div className="mt-12">
              <FaqAccordion />
            </div>
          </div>
        </section>

        {/* 11. Final High-Impact CTA Banner */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
          <div className="mx-auto max-w-4xl rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-card/90 to-primary/5 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-sm">
              <Crown className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Ready to Outcalculate Your Opponents?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Join thousands of chess players transforming their painful blunders into intuition.
              Start training with your personal Socratic AI coach today.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-amber-500 px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-105 active:scale-95"
                >
                  <Crown className="h-4 w-4" />
                  <span>Open Your Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-amber-500 px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-105 active:scale-95"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Create Free Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">
              No credit card required · Free plan forever · Instant setup
            </p>
          </div>
        </section>
      </main>

      {/* 12. SaaS Footer */}
      <footer className="border-t border-border/60 bg-card/40 py-12 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            {/* Brand column */}
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
                  <Crown className="h-4 w-4" />
                </div>
                <span className="font-serif text-lg font-bold text-foreground">Chesswise</span>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">
                  v1.0 Studio
                </span>
              </div>
              <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted-foreground">
                The grandmaster-aesthetic AI chess training platform. Turning real blunders into
                permanent tactical intuition with Socratic dialogue and SM-2 spaced repetition.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <AnnotationGlyph type="!!" size="sm" />
                <AnnotationGlyph type="!" size="sm" />
                <AnnotationGlyph type="!?" size="sm" />
                <AnnotationGlyph type="?!" size="sm" />
                <AnnotationGlyph type="?" size="sm" />
                <AnnotationGlyph type="??" size="sm" />
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-foreground">Product</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/play" className="transition-colors hover:text-foreground">
                    Play vs AI
                  </Link>
                </li>
                <li>
                  <Link href="/analyze" className="transition-colors hover:text-foreground">
                    Game Analysis
                  </Link>
                </li>
                <li>
                  <Link href="/train" className="transition-colors hover:text-foreground">
                    Daily Training Gym
                  </Link>
                </li>
                <li>
                  <Link href="/openings" className="transition-colors hover:text-foreground">
                    Opening Repertoire
                  </Link>
                </li>
                <li>
                  <Link href="/coach" className="transition-colors hover:text-foreground">
                    AI Socratic Coach
                  </Link>
                </li>
              </ul>
            </div>

            {/* Architecture Links */}
            <div>
              <h4 className="font-semibold text-foreground">Technology</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <span className="transition-colors hover:text-foreground">Stockfish 18 NNUE</span>
                </li>
                <li>
                  <span className="transition-colors hover:text-foreground">
                    Socratic RAG Engine
                  </span>
                </li>
                <li>
                  <span className="transition-colors hover:text-foreground">
                    SM-2 Spaced Recall
                  </span>
                </li>
                <li>
                  <span className="transition-colors hover:text-foreground">Three.js 3D WebGL</span>
                </li>
                <li>
                  <Link href="/settings" className="transition-colors hover:text-foreground">
                    BYOK Client Architecture
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal & Attribution */}
            <div>
              <h4 className="font-semibold text-foreground">Platform</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/login" className="transition-colors hover:text-foreground">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="transition-colors hover:text-foreground">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="transition-colors hover:text-foreground">
                    Account Settings
                  </Link>
                </li>
                <li>
                  <span className="text-muted-foreground/60">FIDE / Stockfish Compliant</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-6 sm:flex-row">
            <p className="text-[11px] text-muted-foreground">
              &copy; {new Date().getFullYear()} Chesswise Inc. Built with Stockfish, Next.js, and
              Supabase.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span>FIDE Notation Standard</span>
              <span>·</span>
              <span>PGN 3.0 Compatible</span>
              <span>·</span>
              <span>Obsidian &amp; Gold Design System</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
