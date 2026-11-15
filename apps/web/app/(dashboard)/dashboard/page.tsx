import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { AnnotationGlyph } from '@/components/chess/annotation-glyph';
import {
  BarChart3,
  Target,
  Bot,
  Swords,
  UploadCloud,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  Clock,
  BookOpen,
  User,
  ShieldAlert,
} from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      skillProfile: true,
      games: {
        orderBy: { importedAt: 'desc' },
        take: 5,
        include: {
          moves: {
            where: {
              quality: { in: ['BLUNDER', 'MISTAKE', 'INACCURACY'] },
            },
            select: { quality: true },
          },
        },
      },
      puzzleCards: {
        select: { id: true, nextReviewAt: true, solvedCount: true },
      },
    },
  });

  if (!dbUser) {
    try {
      dbUser = await prisma.user.create({
        data: {
          supabaseId: user.id,
          email: user.email ?? 'unknown@example.com',
          displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player',
        },
        include: {
          skillProfile: true,
          games: {
            orderBy: { importedAt: 'desc' },
            take: 5,
            include: {
              moves: {
                where: { quality: { in: ['BLUNDER', 'MISTAKE', 'INACCURACY'] } },
                select: { quality: true },
              },
            },
          },
          puzzleCards: {
            select: { id: true, nextReviewAt: true, solvedCount: true },
          },
        },
      });
    } catch {
      // Handled gracefully below
    }
  }

  const displayName =
    dbUser?.displayName ||
    user.user_metadata?.display_name ||
    user.email?.split('@')[0] ||
    'Player';

  const games = dbUser?.games ?? [];
  const totalGamesCount = games.length;
  const analyzedGames = games.filter(
    (g) => g.status === 'ANALYSIS_COMPLETE' || g.accuracy !== null,
  );
  const avgAccuracy =
    analyzedGames.length > 0
      ? Math.round(
          analyzedGames.reduce((acc, g) => acc + (g.accuracy ?? 0), 0) / analyzedGames.length,
        )
      : null;

  const puzzleCards = dbUser?.puzzleCards ?? [];
  const now = new Date();
  const duePuzzles = puzzleCards.filter((p) => !p.nextReviewAt || new Date(p.nextReviewAt) <= now);
  const masteredPuzzles = puzzleCards.filter((p) => p.solvedCount >= 3).length;

  const skillProfile = dbUser?.skillProfile ?? {
    tactics: 50,
    strategy: 50,
    endgame: 50,
    opening: 50,
    calculation: 50,
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Session Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {displayName}
            </h1>
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Ready to Train
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Adaptive Socratic chess training dashboard powered by Stockfish 18 & Gemini AI.
          </p>
        </div>

        {/* Quick Launch CTA */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/play"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 hover:shadow-[0_0_16px_rgba(201,162,75,0.3)] active:scale-[0.98]"
          >
            <Bot className="h-4 w-4" />
            <span>Play AI Match</span>
          </Link>
          <Link
            href="/import"
            className="flex items-center gap-2 rounded-lg border border-border/80 bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <UploadCloud className="h-4 w-4 text-muted-foreground" />
            <span className="hidden sm:inline">Import PGN</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Games Analyzed */}
        <div className="rounded-xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm transition-all hover:border-primary/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Analyzed Games
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-foreground">{totalGamesCount}</span>
            <span className="text-xs text-muted-foreground">{analyzedGames.length} processed</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Deep engine telemetry active</span>
          </div>
        </div>

        {/* KPI 2: Move Accuracy */}
        <div className="rounded-xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm transition-all hover:border-primary/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Avg. Accuracy
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-foreground">
              {avgAccuracy !== null ? `${avgAccuracy}%` : 'N/A'}
            </span>
            <span className="text-xs text-muted-foreground">
              {avgAccuracy !== null ? 'across recent games' : 'import a game'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-mono text-[11px] text-emerald-400">●</span>
            <span>Based on Stockfish eval swings</span>
          </div>
        </div>

        {/* KPI 3: Daily Gym Puzzles */}
        <div className="rounded-xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm transition-all hover:border-primary/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Due Flashcards
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-amber-400">{duePuzzles.length}</span>
            <span className="text-xs text-muted-foreground">of {puzzleCards.length} total</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>SM-2 spaced review ready</span>
          </div>
        </div>

        {/* KPI 4: Tactical DNA Rating */}
        <div className="rounded-xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm transition-all hover:border-primary/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tactics Rating
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-foreground">
              {Math.round(skillProfile.tactics * 20)}
            </span>
            <span className="text-xs text-muted-foreground">
              Score: {Math.round(skillProfile.tactics)}/100
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-primary" />
            <span>Calibrated dynamically</span>
          </div>
        </div>
      </div>

      {/* Main Bento Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bento Cell 1: Daily Gym Hero Card (Col span 2) */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 shadow-sm lg:col-span-2">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 items-center rounded-full bg-primary/20 px-2.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                  Adaptive Spaced Repetition
                </span>
                <span className="text-xs text-muted-foreground">SM-2 Algorithm</span>
              </div>

              <h2 className="mt-3 font-serif text-xl font-bold text-foreground sm:text-2xl">
                Daily Mistake Gym & Reps
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Never repeat the same blunder twice. Chesswise automatically converts your real
                in-game mistakes, forks, and missed skewers into spaced repetition flashcards.
              </p>
            </div>

            {/* Workout Status & Metrics */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-background/50 p-4 sm:grid-cols-3">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Due Today
                </span>
                <p className="mt-1 font-mono text-xl font-bold text-amber-400">
                  {duePuzzles.length}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Mastered (3+ Solves)
                </span>
                <p className="mt-1 font-mono text-xl font-bold text-emerald-400">
                  {masteredPuzzles}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Next Interval
                </span>
                <p className="mt-1 font-mono text-xl font-bold text-foreground">
                  {duePuzzles.length > 0 ? 'Now' : 'Tomorrow'}
                </p>
              </div>
            </div>

            {/* Launch CTA Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/train"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-150 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(201,162,75,0.35)] active:scale-[0.98]"
              >
                <Target className="h-4 w-4" />
                <span>
                  {duePuzzles.length > 0
                    ? `Start Today's Workout (${duePuzzles.length} due)`
                    : 'Practice All Flashcards'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/openings"
                className="flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-card/80 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Drill Opening Repertoire</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bento Cell 2: Quick Studio Launchpad (Col span 1) */}
        <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-foreground">Training Modules</h3>
              <span className="text-xs text-muted-foreground">Quick Launch</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Select your practice mode for today:
            </p>

            <div className="mt-4 space-y-2.5">
              <Link
                href="/play"
                className="group flex items-center justify-between rounded-xl border border-border/50 bg-background/40 p-3 transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground group-hover:text-primary">
                      Play AI Opponents
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Stockfish human-like bots & Mirror Bot
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>

              <Link
                href="/multiplayer"
                className="group flex items-center justify-between rounded-xl border border-border/50 bg-background/40 p-3 transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
                    <Swords className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground group-hover:text-blue-400">
                      Multiplayer Arena
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Play live PvP games with custom clocks
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-blue-400" />
              </Link>

              <Link
                href="/coach"
                className="group flex items-center justify-between rounded-xl border border-border/50 bg-background/40 p-3 transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground group-hover:text-purple-400">
                      Socratic AI Coach
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Grounded reasoning on your mistakes
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-purple-400" />
              </Link>
            </div>
          </div>

          <div className="mt-4 border-t border-border/40 pt-3">
            <Link
              href="/import"
              className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Import PGN from Lichess / Chess.com</span>
            </Link>
          </div>
        </div>

        {/* Bento Cell 3: Recent Games & Move Quality Ledger (Col span 2) */}
        <div className="rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                Recent Games & Analysis
              </h3>
              <p className="text-xs text-muted-foreground">
                Engine evaluations and move-by-move accuracy ratings
              </p>
            </div>
            <Link href="/import" className="text-xs font-semibold text-primary hover:underline">
              + Import Game
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {games.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <h4 className="mt-3 font-semibold text-foreground">No games analyzed yet</h4>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  Import your PGN files or connect your account to automatically generate mistake
                  flashcards and deep AI coaching recaps.
                </p>
                <Link
                  href="/import"
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  Import Your First PGN
                </Link>
              </div>
            ) : (
              games.map((game) => {
                const headers = (game.headers ?? {}) as Record<string, string>;
                const whitePlayer = headers.White || 'White';
                const blackPlayer = headers.Black || 'Black';
                const result = headers.Result || '*';
                const blunderCount = game.moves.filter((m) => m.quality === 'BLUNDER').length;
                const mistakeCount = game.moves.filter((m) => m.quality === 'MISTAKE').length;

                return (
                  <Link
                    key={game.id}
                    href={`/report/${game.id}`}
                    className="group flex flex-col justify-between gap-3 rounded-xl border border-border/50 bg-background/40 p-3.5 transition-all hover:border-primary/40 hover:bg-card sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 font-mono text-xs font-bold text-foreground">
                        VS
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary">
                            {whitePlayer} vs {blackPlayer}
                          </p>
                          <span className="py-0.2 rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                            {result}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {new Date(game.importedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      {/* Accuracy & Badges */}
                      <div className="flex items-center gap-2">
                        {game.accuracy !== null && (
                          <div className="flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-400">
                            <span>{Math.round(game.accuracy)}%</span>
                            <span className="text-[10px] text-emerald-400/70">acc</span>
                          </div>
                        )}
                        {blunderCount > 0 && (
                          <span
                            className="flex items-center gap-1 rounded border border-blunder/30 bg-blunder/15 px-1.5 py-0.5 text-[11px] font-semibold text-blunder"
                            title={`${blunderCount} blunders detected`}
                          >
                            <ShieldAlert className="h-3 w-3" />
                            <span>{blunderCount}</span>
                          </span>
                        )}
                        {mistakeCount > 0 && (
                          <span
                            className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-400"
                            title={`${mistakeCount} mistakes detected`}
                          >
                            {mistakeCount}?
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                        <span>Report</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Bento Cell 4: Skill DNA Snapshot (Col span 1) */}
        <div className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-foreground">Skill DNA Profile</h3>
              <User className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Dynamic proficiency metrics across key chess phases:
            </p>

            <div className="mt-5 space-y-3.5">
              {[
                {
                  label: 'Tactics & Vision',
                  value: Math.round(skillProfile.tactics),
                  color: 'bg-amber-400',
                },
                {
                  label: 'Strategic Planning',
                  value: Math.round(skillProfile.strategy),
                  color: 'bg-blue-400',
                },
                {
                  label: 'Endgame Precision',
                  value: Math.round(skillProfile.endgame),
                  color: 'bg-emerald-400',
                },
                {
                  label: 'Opening Knowledge',
                  value: Math.round(skillProfile.opening),
                  color: 'bg-purple-400',
                },
                {
                  label: 'Deep Calculation',
                  value: Math.round(skillProfile.calculation),
                  color: 'bg-pink-400',
                },
              ].map((skill) => (
                <div key={skill.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-muted-foreground">{skill.label}</span>
                    <span className="font-mono font-semibold text-foreground">
                      {skill.value}/100
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${skill.color} transition-all duration-500`}
                      style={{ width: `${skill.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-border/40 pt-3">
            <Link
              href="/profile"
              className="flex items-center justify-between text-xs font-semibold text-primary hover:underline"
            >
              <span>View Interactive Radar Telemetry</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Bento Cell 5: Move Quality Annotation Taxonomy (Col span 3) */}
        <div className="rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm lg:col-span-3">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                Move Quality — Classical Annotation System
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Chesswise classifies every ply through Stockfish centipawn shifts into classical
                chess symbols:
              </p>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">RFC Chess Standard</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              {
                glyph: '!!' as const,
                title: 'Brilliant',
                desc: 'Only winning sacrifice or counterintuitive breakthrough.',
              },
              {
                glyph: '!' as const,
                title: 'Good',
                desc: 'Objective best move preserving maximum winning advantage.',
              },
              {
                glyph: '!?' as const,
                title: 'Interesting',
                desc: 'Sharp, non-standard line creating severe tactical pressure.',
              },
              {
                glyph: '?!' as const,
                title: 'Dubious',
                desc: 'Sub-optimal move that relinquishes dynamic initiative.',
              },
              {
                glyph: '?' as const,
                title: 'Mistake',
                desc: 'Eval shift between -1.0 and -2.5 pawns into losing territory.',
              },
              {
                glyph: '??' as const,
                title: 'Blunder',
                desc: 'Game-losing move missing a fork, mate threat, or free piece.',
              },
            ].map((annot) => (
              <div
                key={annot.title}
                className="flex flex-col rounded-xl border border-border/50 bg-background/50 p-3.5 transition-all hover:border-primary/40 hover:bg-card"
              >
                <div className="flex items-center justify-between">
                  <AnnotationGlyph type={annot.glyph} size="md" />
                  <span className="text-[11px] font-semibold text-foreground">{annot.title}</span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  {annot.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
