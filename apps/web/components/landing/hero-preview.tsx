'use client';

import { useState } from 'react';
import {
  Sparkles,
  Brain,
  Cpu,
  Repeat,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Zap,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnnotationGlyph } from '@/components/chess/annotation-glyph';

type TabMode = 'socratic' | 'engine' | 'spaced-rep';

interface HintItem {
  level: number;
  badge: string;
  icon: typeof Lightbulb;
  title: string;
  text: string;
  prompt: string;
}

const defaultHint: HintItem = {
  level: 1,
  badge: 'Theme & Concept',
  icon: Lightbulb,
  title: 'Macro Strategic Picture',
  text: "White controls the semi-open f-file. Black's recent move 19... Nxd4?? abandoned king defense and left the f7 square overloaded.",
  prompt: 'Notice which pieces are aligned with the opponent’s king.',
};

export function HeroPreview() {
  const [activeTab, setActiveTab] = useState<TabMode>('socratic');
  const [hintLevel, setHintLevel] = useState<number>(1);
  const [solved, setSolved] = useState<boolean>(false);

  const hints: HintItem[] = [
    defaultHint,
    {
      level: 2,
      badge: 'Target & Piece',
      icon: HelpCircle,
      title: 'Focal Point Identified',
      text: "The pawn on f7 is defended only by the black King. White's Rook on f1 and Queen on f3 exert crushing pressure.",
      prompt: 'Can you force the king into the open through a tactical exchange?',
    },
    {
      level: 3,
      badge: 'Tactical Refutation',
      icon: Zap,
      title: 'Decisive Strike',
      text: '20. Rxf7! Kxf7 21. Rf1+ Ke8 22. Qf7# forces an inescapable mating net with +4.8 decisive advantage.',
      prompt: 'Play 20. Rxf7! to claim the win.',
    },
  ];

  const handleNextHint = () => {
    if (hintLevel < 3) {
      setHintLevel((prev) => prev + 1);
    } else {
      setSolved(true);
    }
  };

  const handleReset = () => {
    setHintLevel(1);
    setSolved(false);
  };

  const currentHint: HintItem = hints[hintLevel - 1] ?? defaultHint;

  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-2xl border border-primary/20 bg-card/60 p-3 shadow-2xl backdrop-blur-xl sm:p-5 lg:p-6">
      {/* Decorative gradient glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/20 to-amber-500/10 blur-[100px]" />

      {/* Top Bar with Mode Tabs */}
      <div className="flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm font-bold text-foreground">
                Live Studio Inspection
              </span>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                Interactive
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Italian Game: Giuoco Piano · Move 19... Nxd4??
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="inline-flex rounded-xl border border-border/80 bg-background/80 p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('socratic')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
              activeTab === 'socratic'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Sparkles className="h-3 w-3" />
            <span>Socratic Whisper</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('engine')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
              activeTab === 'engine'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Cpu className="h-3 w-3" />
            <span>Stockfish 18</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('spaced-rep')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
              activeTab === 'spaced-rep'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Repeat className="h-3 w-3" />
            <span>SM-2 Memory</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Stylized Board Preview & Eval Bar */}
        <div className="flex flex-col gap-3 lg:col-span-5">
          <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-3 shadow-md">
            {/* Player tags */}
            <div className="mb-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span className="font-semibold text-muted-foreground">Opponent (1840)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[11px] font-bold text-blunder">19... Nxd4</span>
                <AnnotationGlyph type="??" size="sm" />
              </div>
            </div>

            {/* Stylized 8x8 Board Graphic */}
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border/60 bg-amber-950/20 shadow-inner">
              {/* Eval gauge bar overlay on left edge */}
              <div className="absolute bottom-0 left-0 top-0 z-10 w-2.5 border-r border-border/40 bg-neutral-900">
                <div
                  className="w-full bg-primary transition-all duration-700"
                  style={{ height: solved ? '85%' : '65%' }}
                />
              </div>

              {/* Board squares grid */}
              <div className="grid h-full w-full grid-cols-8 grid-rows-8 pl-2.5">
                {Array.from({ length: 64 }).map((_, idx) => {
                  const row = Math.floor(idx / 8);
                  const col = idx % 8;
                  const isLight = (row + col) % 2 === 0;
                  const isF7 = row === 1 && col === 5; // f7 square
                  const isF1 = row === 7 && col === 5; // f1 rook square
                  const isD4 = row === 4 && col === 3; // d4 blunder knight

                  return (
                    <div
                      key={idx}
                      className={cn(
                        'relative flex select-none items-center justify-center text-xs font-semibold',
                        isLight ? 'bg-[#b88b4a]/20' : 'bg-[#5c3a1e]/40',
                        isF7 && 'animate-pulse bg-blunder/30 ring-2 ring-blunder/80',
                        isD4 && 'bg-amber-500/25 ring-1 ring-amber-400/50',
                        isF1 && solved && 'bg-emerald-500/30 ring-2 ring-emerald-500/80',
                      )}
                    >
                      {/* Stylized pieces for the snapshot */}
                      {row === 0 && col === 6 && (
                        <span className="text-xl text-neutral-300 drop-shadow">♚</span>
                      )}
                      {row === 0 && col === 5 && (
                        <span className="text-lg text-neutral-300 drop-shadow">♜</span>
                      )}
                      {isF7 && <span className="text-base text-neutral-300 drop-shadow">♟</span>}
                      {isD4 && <span className="text-lg text-neutral-300 drop-shadow">♞</span>}
                      {row === 5 && col === 5 && (
                        <span className="text-lg text-amber-200 drop-shadow">♕</span>
                      )}
                      {isF1 && <span className="text-lg text-amber-200 drop-shadow">♖</span>}
                      {row === 7 && col === 6 && (
                        <span className="text-xl text-amber-200 drop-shadow">♔</span>
                      )}

                      {/* Coordinates */}
                      {col === 0 && (
                        <span className="absolute left-0.5 top-0.5 font-mono text-[8px] text-muted-foreground/60">
                          {8 - row}
                        </span>
                      )}
                      {row === 7 && (
                        <span className="absolute bottom-0.5 right-0.5 font-mono text-[8px] text-muted-foreground/60">
                          {String.fromCharCode(97 + col)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Tactical Arrow Visual Overlay */}
              <svg className="pointer-events-none absolute inset-0 h-full w-full pl-2.5">
                <defs>
                  <marker
                    id="arrowhead-gold"
                    markerWidth="6"
                    markerHeight="6"
                    refX="4"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 6 3, 0 6" fill="#c9a24b" />
                  </marker>
                  <marker
                    id="arrowhead-red"
                    markerWidth="6"
                    markerHeight="6"
                    refX="4"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 6 3, 0 6" fill="#ef4444" />
                  </marker>
                </defs>
                {/* Arrow from Rf1 to f7 */}
                <line
                  x1="73%"
                  y1="90%"
                  x2="73%"
                  y2="26%"
                  stroke="#c9a24b"
                  strokeWidth="3.5"
                  strokeDasharray={solved ? 'none' : '4 4'}
                  markerEnd="url(#arrowhead-gold)"
                  className="opacity-80"
                />
              </svg>
            </div>

            {/* User tag */}
            <div className="mt-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="font-semibold text-foreground">You (White · 1720)</span>
              </div>
              <span className="font-mono text-[11px] font-semibold text-primary">
                {solved ? '+4.8 (Winning)' : '+2.4 (Stockfish 18)'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-[11px] text-muted-foreground">
            <span>Critical Moment: Move 20</span>
            <span className="font-mono font-medium text-foreground">White to Play & Win</span>
          </div>
        </div>

        {/* Right Column: Tab View Showcase */}
        <div className="flex flex-col justify-between lg:col-span-7">
          {activeTab === 'socratic' && (
            <div className="flex h-full flex-col justify-between space-y-4">
              {/* Header */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {hintLevel}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {currentHint.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={cn(
                          'h-1.5 w-6 rounded-full transition-all duration-300',
                          step <= hintLevel ? 'bg-primary' : 'bg-muted',
                        )}
                      />
                    ))}
                  </div>
                </div>

                <h4 className="mt-2 font-serif text-base font-bold text-foreground">
                  {currentHint.title}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {currentHint.text}
                </p>

                <div className="mt-3 flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs font-medium text-amber-300/90">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{currentHint.prompt}</span>
                </div>
              </div>

              {/* Socratic philosophy guarantee */}
              <div className="space-y-2 rounded-xl border border-border/60 bg-card/40 p-3.5 text-xs">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>The Socratic Difference</span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Traditional engines spoil the best move instantly with computer lines like{' '}
                  <code className="text-muted-foreground/80">20. Rxf7!!</code>. Chesswise guides
                  your cognitive pattern recognition so you discover the breakthrough yourself.
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Reset Position</span>
                </button>

                <div className="flex items-center gap-2">
                  {!solved ? (
                    <button
                      type="button"
                      onClick={handleNextHint}
                      className="group inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow transition-all hover:bg-primary/90 active:scale-95"
                    >
                      <span>{hintLevel === 3 ? 'Execute 20. Rxf7!' : 'Reveal Next Hint'}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Brilliant! Saved to Review Queue (+15 XP)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'engine' && (
            <div className="flex h-full flex-col justify-between space-y-4">
              <div className="space-y-3 rounded-xl border border-border/80 bg-card/60 p-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="font-semibold text-foreground">Stockfish 18 NNUE</span>
                  <span className="text-[11px] text-primary">Depth 28/42 · 48.2 MN/s</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Top Continuation:</span>
                    <span className="font-bold text-emerald-400">#1: +4.82</span>
                  </div>
                  <div className="rounded-lg bg-background/80 p-2 leading-relaxed text-muted-foreground">
                    <span className="font-bold text-primary">20. Rxf7!</span> Kxf7 21. Rf1+ Ke8 22.
                    Qf7+ Kd8 23. Ne6+ Kc8 24. Qe8#
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-muted-foreground">Alternative Line:</span>
                    <span className="text-amber-400">#2: +1.15</span>
                  </div>
                  <div className="rounded-lg bg-background/80 p-2 leading-relaxed text-muted-foreground">
                    20. Qxd4 exd4 21. Nd5 Re8 22. Rae1
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/40 p-3.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Wasm In-Browser Engine:</span> Zero
                server latency. Full multi-threaded NNUE evaluations running locally or accelerated
                by cloud workers.
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('socratic')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <span>See How Socratic Coach Explains This</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'spaced-rep' && (
            <div className="flex h-full flex-col justify-between space-y-4">
              <div className="space-y-3 rounded-xl border border-border/80 bg-card/60 p-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      SM-2 Spaced Repetition Card
                    </span>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Deck: Italian Blunders
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Source Game:</strong> Blitz 3+0 vs{' '}
                    <span className="text-primary">@GrandmasterV</span> (Lichess sync)
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Mistake Type:</strong> Overlooked
                    sacrificial breakthrough on f7
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Retention Streak:</strong> 2 correct reviews
                    (Interval: 4 days)
                  </p>
                </div>

                {/* Rating response buttons simulation */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Simulate review response:
                  </span>
                  <div className="mt-1.5 grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="rounded-lg border border-blunder/30 bg-blunder/10 p-2">
                      <div className="font-bold text-blunder">Again</div>
                      <div className="text-[10px] text-muted-foreground">&lt;10 min</div>
                    </div>
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">
                      <div className="font-bold text-amber-400">Hard</div>
                      <div className="text-[10px] text-muted-foreground">1 day</div>
                    </div>
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2">
                      <div className="font-bold text-emerald-400">Good</div>
                      <div className="text-[10px] text-muted-foreground">4 days</div>
                    </div>
                    <div className="rounded-lg border border-primary/30 bg-primary/10 p-2">
                      <div className="font-bold text-primary">Easy</div>
                      <div className="text-[10px] text-muted-foreground">8 days</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/40 p-3.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Never Repeat the Same Blunder:
                </span>{' '}
                Our algorithm calculates optimal recall intervals so you solidify defensive and
                attacking patterns into muscle memory.
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('socratic')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <span>Back to Socratic Whisper</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
