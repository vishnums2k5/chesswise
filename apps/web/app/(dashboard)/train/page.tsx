'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Square } from '@chesswise/chess-core';
import { useChess } from '@/hooks/use-chess';
import ChessBoard from '@/components/chess/chess-board';
import { cn } from '@/lib/utils';
import {
  Trophy,
  Flame,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Target,
  ArrowRight,
  Sparkles,
  UploadCloud,
  LayoutDashboard,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

type MoveQuality = 'BRILLIANT' | 'EXCELLENT' | 'GOOD' | 'INACCURACY' | 'MISTAKE' | 'BLUNDER';

interface PuzzleGameMove {
  san: string;
  quality: MoveQuality | null;
  tacticTag: string | null;
  bestMoveSan: string | null;
  explanation: string | null;
  fenBefore: string;
}

interface PuzzleGame {
  headers: Record<string, string>;
  id: string;
}

interface Puzzle {
  id: string;
  fen: string;
  solution: string; // best move UCI e.g. "e2e4"
  quality: MoveQuality;
  gameMove: PuzzleGameMove;
  game: PuzzleGame;
}

type PuzzleState = 'thinking' | 'correct' | 'wrong' | 'revealed';

function uciToFromTo(uci: string): { from: Square; to: Square; promotion?: string } {
  return {
    from: uci.slice(0, 2) as Square,
    to: uci.slice(2, 4) as Square,
    promotion: uci[4],
  };
}

// Modern Progress Ring with SVG
function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const pct = total === 0 ? 0 : done / total;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={64} height={64} viewBox="0 0 64 64" className="-rotate-90 transform">
        <circle
          cx={32}
          cy={32}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={5}
          className="text-muted/40"
        />
        <circle
          cx={32}
          cy={32}
          r={r}
          fill="none"
          stroke="#C9A24B"
          strokeWidth={5}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute font-mono text-xs font-bold text-foreground">
        {done}/{total}
      </div>
    </div>
  );
}

export default function TrainPage() {
  const router = useRouter();
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [state, setState] = useState<PuzzleState>('thinking');
  const [solvedCount, setSolvedCount] = useState(0);
  const [stats, setStats] = useState<{ dueToday: number; streak: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);

  const chess = useChess();

  useEffect(() => {
    Promise.all([
      fetch('/api/puzzles').then((r) => r.json()),
      fetch('/api/puzzles/stats').then((r) => r.json()),
    ])
      .then(([puzzleData, statsData]) => {
        setPuzzles(puzzleData.puzzles ?? []);
        setStats(statsData);
        if (puzzleData.puzzles?.length > 0) {
          chess.loadFen(puzzleData.puzzles[0].fen);
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentPuzzle = puzzles[currentIdx];

  const handleMove = useCallback(
    async (from: Square, to: Square, promotion?: string) => {
      if (!currentPuzzle || state !== 'thinking') return;

      const playedUci = `${from}${to}${promotion ?? ''}`;
      const solutionUci = currentPuzzle.solution;

      const isCorrect =
        playedUci === solutionUci || playedUci.slice(0, 4) === solutionUci.slice(0, 4);

      const result = chess.makeMove(from, to, promotion as 'q' | 'r' | 'b' | 'n' | undefined);
      if (!result) return;

      if (isCorrect) {
        setState('correct');
        setSolvedCount((c) => c + 1);
        setFeedback('Correct move! Tactic successfully resolved.');
        setShowExplanation(true);
        await submitSolve(currentPuzzle.id, true);
      } else {
        setState('wrong');
        setFeedback('Sub-optimal move. That was the in-game mistake.');
        setTimeout(() => {
          chess.loadFen(currentPuzzle.fen);
          setState('thinking');
        }, 1200);
        await submitSolve(currentPuzzle.id, false);
      }
    },
    [currentPuzzle, state, chess],
  );

  const submitSolve = async (puzzleId: string, correct: boolean) => {
    await fetch(`/api/puzzles/${puzzleId}/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correct }),
    });
  };

  const revealSolution = () => {
    if (!currentPuzzle) return;
    const { from, to, promotion } = uciToFromTo(currentPuzzle.solution);
    chess.makeMove(from, to, promotion as 'q' | 'r' | 'b' | 'n' | undefined);
    setState('revealed');
    setFeedback(`Solution: ${currentPuzzle.gameMove.bestMoveSan ?? currentPuzzle.solution}`);
    setShowExplanation(true);
  };

  const nextPuzzle = () => {
    const next = currentIdx + 1;
    if (next >= puzzles.length) {
      setCurrentIdx(puzzles.length);
    } else {
      setCurrentIdx(next);
      setState('thinking');
      setFeedback('');
      setShowExplanation(false);
      chess.loadFen(puzzles[next]!.fen);
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading your personalized mistake gym…</p>
      </div>
    );
  }

  // Done or Empty Screen
  if (puzzles.length === 0 || currentIdx >= puzzles.length) {
    return (
      <div className="mx-auto my-10 flex max-w-lg flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/70 p-8 text-center backdrop-blur-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary shadow-sm shadow-amber-950/20">
          {puzzles.length === 0 ? (
            <Target className="h-8 w-8 text-primary" />
          ) : (
            <Trophy className="h-8 w-8 text-primary" />
          )}
        </div>

        <h2 className="mt-4 font-serif text-2xl font-bold text-foreground">
          {puzzles.length === 0 ? 'All Caught Up!' : 'Session Complete!'}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {puzzles.length === 0
            ? 'You have zero pending flashcards due for review. Import your latest games to automatically extract new blunder flashcards.'
            : `You solved ${solvedCount} of ${puzzles.length} flashcards today. Spaced repetition intervals have been recalculated.`}
        </p>

        {stats && (
          <div className="mt-6 flex w-full justify-around rounded-xl border border-border/50 bg-background/50 p-4">
            <div>
              <div className="flex items-center justify-center gap-1.5 text-primary">
                <Flame className="h-4 w-4" />
                <span className="font-mono text-xl font-bold">{stats.streak}d</span>
              </div>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Active Streak
              </p>
            </div>
            <div className="border-r border-border/40" />
            <div>
              <div className="flex items-center justify-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-mono text-xl font-bold">{solvedCount}</span>
              </div>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Solved Today
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row">
          <button
            onClick={() => router.push('/import')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card/80 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
          >
            <UploadCloud className="h-4 w-4 text-primary" />
            <span>Import Game</span>
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentPuzzle) return null;

  const h = currentPuzzle.game.headers as Record<string, string>;
  const colorToPlay = currentPuzzle.fen.split(' ')[1] === 'w' ? 'White' : 'Black';

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Gym Header Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-lg font-bold text-foreground sm:text-xl">
              Daily Mistake Gym
            </h1>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              SM-2 Spaced Repetition
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            From game:{' '}
            <span className="text-foreground">
              {h['White'] ?? 'White'} vs {h['Black'] ?? 'Black'}
            </span>{' '}
            •{' '}
            <button
              onClick={() => router.push(`/report/${currentPuzzle.game.id}`)}
              className="font-semibold text-primary hover:underline"
            >
              View Full Report →
            </button>
          </p>
        </div>

        <div className="flex items-center gap-4">
          {stats && (
            <div className="hidden text-right sm:block">
              <div className="flex items-center justify-end gap-1 text-primary">
                <Flame className="h-4 w-4 fill-primary" />
                <span className="font-mono text-sm font-bold">{stats.streak}d</span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Streak</p>
            </div>
          )}
          <ProgressRing done={solvedCount} total={puzzles.length} />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[auto_1fr]">
        {/* Left: Interactive Chess Board */}
        <div className="flex flex-col items-center gap-2.5">
          <ChessBoard
            fen={chess.fen}
            orientation={colorToPlay === 'White' ? 'white' : 'black'}
            interactive={state === 'thinking'}
            onMove={handleMove}
          />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full border',
                colorToPlay === 'White' ? 'border-border bg-ivory' : 'border-border/80 bg-ink',
              )}
            />
            <span className="font-medium text-foreground">{colorToPlay}</span> to move — find the
            best continuation
          </div>
        </div>

        {/* Right: Flashcard Telemetry & Action Deck */}
        <div className="space-y-4">
          {/* Tactic Motif & Move Quality Tag */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider',
                currentPuzzle.quality === 'BLUNDER'
                  ? 'border border-blunder/30 bg-blunder/15 text-blunder'
                  : 'border border-amber-500/30 bg-amber-500/15 text-amber-400',
              )}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>
                {currentPuzzle.quality === 'BLUNDER' ? 'Blunder to fix' : 'Mistake to fix'}
              </span>
            </span>

            {currentPuzzle.gameMove.tacticTag && (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize tracking-wide text-primary">
                {currentPuzzle.gameMove.tacticTag.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {/* Context Card */}
          {state === 'thinking' && (
            <div className="space-y-1.5 rounded-xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm">
              <p className="text-xs font-medium text-foreground">
                In your original game, you played{' '}
                <span className="font-mono font-bold text-blunder">
                  {currentPuzzle.gameMove.san}
                </span>
                .
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Find the objective grandmaster continuation that refutes the position.
              </p>
            </div>
          )}

          {/* Interactive Feedback Banner */}
          {feedback && (
            <div
              className={cn(
                'flex items-center gap-2 rounded-xl border p-3.5 text-xs font-semibold shadow-sm transition-all',
                state === 'correct'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : state === 'revealed'
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-blunder/40 bg-blunder/10 text-blunder',
              )}
            >
              {state === 'correct' && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              )}
              {state === 'revealed' && <Lightbulb className="h-4 w-4 shrink-0 text-primary" />}
              {state === 'wrong' && <XCircle className="h-4 w-4 shrink-0 text-blunder" />}
              <span>{feedback}</span>
            </div>
          )}

          {/* Socratic Coach Explanation Note */}
          {showExplanation && currentPuzzle.gameMove.explanation && (
            <div className="space-y-1.5 rounded-xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Coach Tactical Breakdown</span>
              </div>
              <p className="text-xs leading-relaxed text-foreground/90">
                {currentPuzzle.gameMove.explanation}
              </p>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            {state === 'thinking' && (
              <button
                onClick={revealSolution}
                className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-card/80 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Reveal Solution</span>
              </button>
            )}

            {(state === 'correct' || state === 'revealed') && (
              <button
                onClick={nextPuzzle}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]"
              >
                <span>{currentIdx + 1 < puzzles.length ? 'Next Flashcard' : 'Finish Session'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* SM-2 Session Progress Bar */}
          <div className="pt-2">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Session Progress</span>
              <span className="font-mono">
                {Math.round((solvedCount / Math.max(1, puzzles.length)) * 100)}%
              </span>
            </div>
            <div className="flex gap-1.5">
              {puzzles.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-all',
                    i < currentIdx
                      ? 'bg-primary'
                      : i === currentIdx
                        ? 'bg-foreground ring-1 ring-primary'
                        : 'bg-muted',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
