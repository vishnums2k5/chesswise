'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Square } from '@chesswise/chess-core';
import { useChess } from '@/hooks/use-chess';
import ChessBoard from '@/components/chess/chess-board';
import { AnnotationGlyph } from '@/components/chess/annotation-glyph';
import ChatPanel from '@/components/coach/chat-panel';
import BranchExplorer from '@/components/chess/branch-explorer';
import { cn } from '@/lib/utils';
import {
  Volume2,
  VolumeX,
  MessageSquare,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  GitFork,
  ExternalLink,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

type MoveQuality = 'BRILLIANT' | 'EXCELLENT' | 'GOOD' | 'INACCURACY' | 'MISTAKE' | 'BLUNDER';

const QUALITY_GLYPH: Record<MoveQuality, '!!' | '!' | '!?' | '?!' | '?' | '??'> = {
  BRILLIANT: '!!',
  EXCELLENT: '!',
  GOOD: '!?',
  INACCURACY: '?!',
  MISTAKE: '?',
  BLUNDER: '??',
};

interface GameMove {
  id: string;
  moveNumber: number;
  color: string;
  san: string;
  uci: string;
  fenBefore: string;
  evalBefore: number | null;
  evalAfter: number | null;
  evalDelta: number | null;
  quality: MoveQuality | null;
  tacticTag: string | null;
  bestMoveSan: string | null;
  explanation: string | null;
}

interface Game {
  id: string;
  pgn: string;
  headers: Record<string, string>;
  status: string;
  accuracy: number | null;
  moves: GameMove[];
}

// Enhanced SVG Eval Graph with hover scrub & gradient
function EvalGraph({
  moves,
  currentIdx,
  onSeek,
}: {
  moves: GameMove[];
  currentIdx: number;
  onSeek: (idx: number) => void;
}) {
  const W = 100,
    H = 64;
  const points = moves.map((m, i) => {
    const cp = m.evalAfter ?? 0;
    const clamped = Math.max(-800, Math.min(800, cp));
    const x = (i / Math.max(1, moves.length - 1)) * W;
    const y = H / 2 - (clamped / 800) * (H / 2);
    return { x, y, move: m, idx: i, cp };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaWhiteD =
    points.length > 1
      ? `M 0 ${H / 2} ${points.map((p) => `L ${p.x} ${Math.min(p.y, H / 2)}`).join(' ')} L ${W} ${H / 2} Z`
      : '';
  const areaBlackD =
    points.length > 1
      ? `M 0 ${H / 2} ${points.map((p) => `L ${p.x} ${Math.max(p.y, H / 2)}`).join(' ')} L ${W} ${H / 2} Z`
      : '';

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/60 p-3 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Centipawn Advantage Curve</span>
        <span className="font-mono text-[10px]">
          {points[currentIdx]
            ? `${points[currentIdx]!.cp > 0 ? '+' : ''}${(points[currentIdx]!.cp / 100).toFixed(2)}`
            : '0.00'}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-28 w-full overflow-hidden rounded-lg bg-background/50"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="whiteAdvantage" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A24B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#C9A24B" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="blackAdvantage" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9B3B3B" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#9B3B3B" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Centre equality line */}
        <line
          x1={0}
          y1={H / 2}
          x2={W}
          y2={H / 2}
          stroke="#3b4252"
          strokeWidth="0.5"
          strokeDasharray="1 2"
        />

        {/* Advantage areas */}
        <path d={areaWhiteD} fill="url(#whiteAdvantage)" />
        <path d={areaBlackD} fill="url(#blackAdvantage)" />

        {/* Main curve */}
        <path d={pathD} fill="none" stroke="#C9A24B" strokeWidth="1" strokeLinecap="round" />

        {/* Blunder & Mistake Markers */}
        {points
          .filter((p) => p.move.quality === 'BLUNDER')
          .map((p) => (
            <circle
              key={p.idx}
              cx={p.x}
              cy={p.y}
              r={2}
              fill="#9B3B3B"
              stroke="#ffffff"
              strokeWidth="0.4"
            />
          ))}

        {/* Current position needle */}
        {points[currentIdx] && (
          <line
            x1={points[currentIdx]!.x}
            y1={0}
            x2={points[currentIdx]!.x}
            y2={H}
            stroke="#EDE6D6"
            strokeWidth="0.75"
            strokeDasharray="2"
          />
        )}

        {/* Interactive Scrub Hotspots */}
        {points.map((p) => (
          <rect
            key={p.idx}
            x={p.x - W / Math.max(1, moves.length) / 2}
            y={0}
            width={W / Math.max(1, moves.length)}
            height={H}
            fill="transparent"
            className="cursor-pointer"
            onClick={() => onSeek(p.idx)}
          />
        ))}
      </svg>
    </div>
  );
}

// Modern SaaS Mistake Card
function MistakeCard({
  move,
  onTryIt,
  onAskCoach,
  onExplore,
}: {
  move: GameMove;
  onTryIt: (fen: string) => void;
  onAskCoach?: (san: string, quality: string) => void;
  onExplore?: (fen: string, label: string) => void;
}) {
  const glyph = move.quality ? QUALITY_GLYPH[move.quality] : null;
  const [overriding, setOverriding] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [overridden, setOverridden] = useState(false);

  const submitOverride = async () => {
    if (!overrideReason.trim()) return;
    await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'game_move',
        entityId: move.id,
        action: 'override',
        reason: overrideReason,
        metadata: { quality: move.quality, san: move.san },
      }),
    });
    setOverridden(true);
    setOverriding(false);
  };

  const isBlunder = move.quality === 'BLUNDER';

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all',
        isBlunder
          ? 'border-blunder/30 bg-blunder/10 hover:border-blunder/50'
          : 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {glyph && <AnnotationGlyph type={glyph} size="sm" />}
          <span className="font-mono text-sm font-bold text-foreground">
            {Math.ceil(move.moveNumber)}
            {move.color === 'w' ? '.' : '...'} {move.san}
          </span>
          {move.tacticTag && (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              {move.tacticTag.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {overridden ? (
          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            Overridden ✓
          </span>
        ) : (
          move.evalDelta != null && (
            <span className="flex items-center gap-1 font-mono text-xs font-semibold text-blunder">
              <TrendingDown className="h-3 w-3" />
              <span>{(move.evalDelta / 100).toFixed(2)}</span>
            </span>
          )
        )}
      </div>

      {move.bestMoveSan && (
        <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-background/50 px-3 py-1.5 text-xs">
          <span className="text-muted-foreground">Engine Best:</span>
          <span className="font-mono font-bold text-emerald-400">{move.bestMoveSan}</span>
        </div>
      )}

      {move.explanation && (
        <p className="mt-2 text-xs leading-relaxed text-foreground/90">{move.explanation}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2.5 border-t border-border/40 pt-2.5">
        <button
          onClick={() => onTryIt(move.fenBefore)}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span>Try in Analysis</span>
          <ExternalLink className="h-3 w-3" />
        </button>

        {onAskCoach && move.quality && (
          <button
            onClick={() => onAskCoach(move.san, move.quality!)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:underline"
          >
            <MessageSquare className="h-3 w-3" />
            <span>Ask Coach</span>
          </button>
        )}

        {onExplore && (
          <button
            onClick={() =>
              onExplore(move.fenBefore, `${Math.ceil(move.moveNumber / 2)}. ${move.san}`)
            }
            className="flex items-center gap-1 text-xs font-semibold text-purple-400 hover:underline"
          >
            <GitFork className="h-3 w-3" />
            <span>Explore Line</span>
          </button>
        )}

        {!overridden && !overriding && (
          <button
            onClick={() => setOverriding(true)}
            className="ml-auto text-[11px] text-muted-foreground hover:text-foreground"
          >
            Disagree with AI?
          </button>
        )}
      </div>

      {overriding && (
        <div className="mt-3 space-y-2 rounded-lg border border-border/60 bg-background/70 p-3">
          <p className="text-xs text-muted-foreground">
            Provide your tactical reasoning to adjust your model calibration:
          </p>
          <textarea
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            placeholder="e.g. This sacrifice leads to an unstoppable perpetual check…"
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-background p-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-2">
            <button
              onClick={submitOverride}
              disabled={!overrideReason.trim()}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
            >
              Submit Override
            </button>
            <button
              onClick={() => setOverriding(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params?.gameId as string;

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMoveIdx, setCurrentMoveIdx] = useState(-1);
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachMessage, setCoachMessage] = useState('');
  const [branchFen, setBranchFen] = useState<string | null>(null);
  const [branchLabel, setBranchLabel] = useState('');
  const [isPlayingRecap, setIsPlayingRecap] = useState(false);

  const chess = useChess();

  const handlePlayRecap = useCallback(() => {
    if (!game) return;

    if (isPlayingRecap) {
      window.speechSynthesis.cancel();
      setIsPlayingRecap(false);
      return;
    }

    setIsPlayingRecap(true);
    const mistakeCount = game.moves.filter((m) =>
      ['MISTAKE', 'BLUNDER', 'INACCURACY'].includes(m.quality || ''),
    ).length;
    const topBlunder = game.moves.find((m) => m.quality === 'BLUNDER' || m.quality === 'MISTAKE');

    let text = `Here is your game recap. `;
    const openingName = game.headers['Opening'];
    if (openingName) {
      text += `The opening played was ${openingName}. `;
    }

    if (mistakeCount === 0) {
      text += `You played a nearly flawless game. Master level precision!`;
    } else {
      text += `Across the match, you made ${mistakeCount} inaccuracies or mistakes. `;
      if (topBlunder) {
        text += `The turning point arrived on move ${Math.ceil(topBlunder.moveNumber / 2)}, where you played ${topBlunder.san}. `;
        if (topBlunder.explanation) {
          text += topBlunder.explanation;
        }
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsPlayingRecap(false);
    window.speechSynthesis.speak(utterance);
  }, [game, isPlayingRecap]);

  useEffect(() => {
    if (!gameId) return;
    fetch(`/api/games/${gameId}`)
      .then((r) => r.json())
      .then((data) => {
        setGame(data.game);
        if (data.game?.pgn) {
          chess.loadPgn(data.game.pgn);
          setCurrentMoveIdx(data.game.moves.length - 1);
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const seekToMove = useCallback(
    (idx: number) => {
      setCurrentMoveIdx(idx);
      chess.seekTo(idx);
    },
    [chess],
  );

  const handleTryIt = (fen: string) => {
    router.push(`/analyze?fen=${encodeURIComponent(fen)}`);
  };

  const handleAskCoach = (san: string, quality: string) => {
    setCoachMessage(
      `In this game, I played ${san} which was classified as a ${quality.toLowerCase()}. Why was this sub-optimal and what tactical sequence did I miss?`,
    );
    setCoachOpen(true);
  };

  const handleExplore = (fen: string, label: string) => {
    setBranchFen(fen);
    setBranchLabel(label);
  };

  if (loading) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Synthesizing deep engine report…</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-400" />
        <h3 className="mt-3 font-serif text-lg font-bold text-foreground">Game Report Not Found</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          This game may not have finished processing or has expired.
        </p>
      </div>
    );
  }

  const h = game.headers;
  const mistakes = game.moves.filter((m) => m.quality === 'MISTAKE' || m.quality === 'BLUNDER');
  const currentMove = game.moves[currentMoveIdx];
  const lastMove =
    currentMoveIdx >= 0 && game.moves[currentMoveIdx]
      ? {
          from: game.moves[currentMoveIdx]!.uci.slice(0, 2) as Square,
          to: game.moves[currentMoveIdx]!.uci.slice(2, 4) as Square,
        }
      : null;

  return (
    <div className="space-y-6">
      {/* Match Header Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-xl font-bold text-foreground sm:text-2xl">
              {h['White'] ?? 'White'} <span className="text-sm text-muted-foreground">vs</span>{' '}
              {h['Black'] ?? 'Black'}
            </h1>
            <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
              {h['Result'] ?? '*'}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{h['Date'] ?? 'Recent'}</span>
            <span>•</span>
            <span>{h['Event'] ?? 'Casual Match'}</span>
            {h['Opening'] && (
              <>
                <span>•</span>
                <span className="text-foreground">{h['Opening']}</span>
              </>
            )}

            {/* Audio Voice Recap Button */}
            <button
              onClick={handlePlayRecap}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium transition-all',
                isPlayingRecap
                  ? 'border-primary/50 bg-primary/20 text-primary shadow-[0_0_12px_rgba(201,162,75,0.25)]'
                  : 'border-border/70 bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {isPlayingRecap ? (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-primary" />
                  <span>Stop Recap</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-primary" />
                  <span>Audio Recap</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Accuracy Badge */}
        {game.accuracy != null && (
          <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-background/50 px-4 py-3 sm:text-right">
            <div>
              <p className="font-mono text-2xl font-black text-primary">
                {game.accuracy.toFixed(1)}%
              </p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Move Accuracy
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Studio Grid: Board on Left, Telemetry & Mistakes on Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr]">
        {/* Left Column: Board & Navigation */}
        <div className="flex flex-col items-center gap-3">
          <ChessBoard fen={chess.fen} lastMove={lastMove} interactive={false} />

          {/* Stepper Navigation */}
          <div className="flex w-full max-w-[min(90vw,560px)] items-center justify-between rounded-xl border border-border/60 bg-card/70 px-4 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <button
                onClick={() => seekToMove(-1)}
                disabled={currentMoveIdx <= -1}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
                title="First move"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => seekToMove(Math.max(-1, currentMoveIdx - 1))}
                disabled={currentMoveIdx <= -1}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
                title="Previous move"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            <span className="font-mono text-xs font-semibold text-foreground">
              {currentMoveIdx >= 0 && currentMove
                ? `Move ${Math.ceil(currentMove.moveNumber / 2)}${currentMove.color === 'b' ? '...' : '.'} ${currentMove.san}`
                : 'Start Position'}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => seekToMove(Math.min(game.moves.length - 1, currentMoveIdx + 1))}
                disabled={currentMoveIdx >= game.moves.length - 1}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
                title="Next move"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => seekToMove(game.moves.length - 1)}
                disabled={currentMoveIdx >= game.moves.length - 1}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
                title="Final move"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Eval Curve, Move History, & Mistake Cards */}
        <div className="space-y-4">
          {/* Interactive Advantage Curve */}
          {game.moves.length > 0 && (
            <EvalGraph moves={game.moves} currentIdx={currentMoveIdx} onSeek={seekToMove} />
          )}

          {/* Scoresheet Move Ledger */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/70 backdrop-blur-sm">
            <div className="border-b border-border/50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Game Scoresheet ({game.moves.length} plies)
            </div>
            <div className="max-h-48 overflow-y-auto p-3 font-mono text-xs leading-relaxed">
              {Array.from({ length: Math.ceil(game.moves.length / 2) }).map((_, pairIdx) => {
                const wMove = game.moves[pairIdx * 2];
                const bMove = game.moves[pairIdx * 2 + 1];
                return (
                  <span key={pairIdx} className="mr-3 inline-block">
                    <span className="text-muted-foreground/60">{pairIdx + 1}. </span>
                    {wMove && (
                      <button
                        onClick={() => seekToMove(pairIdx * 2)}
                        className={cn(
                          'rounded px-1 py-0.5 transition-colors',
                          currentMoveIdx === pairIdx * 2
                            ? 'bg-primary/20 font-bold text-primary'
                            : 'text-foreground hover:bg-accent',
                        )}
                      >
                        {wMove.san}
                        {wMove.quality && wMove.quality !== 'GOOD' && (
                          <sup className="ml-0.5 text-[9px] text-primary">
                            {QUALITY_GLYPH[wMove.quality]}
                          </sup>
                        )}
                      </button>
                    )}{' '}
                    {bMove && (
                      <button
                        onClick={() => seekToMove(pairIdx * 2 + 1)}
                        className={cn(
                          'rounded px-1 py-0.5 transition-colors',
                          currentMoveIdx === pairIdx * 2 + 1
                            ? 'bg-primary/20 font-bold text-primary'
                            : 'text-foreground hover:bg-accent',
                        )}
                      >
                        {bMove.san}
                        {bMove.quality && bMove.quality !== 'GOOD' && (
                          <sup className="ml-0.5 text-[9px] text-primary">
                            {QUALITY_GLYPH[bMove.quality]}
                          </sup>
                        )}
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Mistake Ledger */}
          {mistakes.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Identified Mistakes ({mistakes.length})
                </span>
                <span className="text-[11px] text-muted-foreground">Spaced Repetition Ready</span>
              </div>
              <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                {mistakes.map((m) => (
                  <MistakeCard
                    key={m.id}
                    move={m}
                    onTryIt={handleTryIt}
                    onAskCoach={handleAskCoach}
                    onExplore={handleExplore}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Zero critical blunders detected across all moves. Exceptional game execution!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Ask Coach FAB */}
      <button
        onClick={() => {
          setCoachMessage('');
          setCoachOpen((o) => !o);
        }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-2xl transition-all duration-150 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(201,162,75,0.4)]"
      >
        <Sparkles className="h-4 w-4" />
        <span>{coachOpen ? 'Close Coach' : 'Ask Socratic Coach'}</span>
      </button>

      {/* Floating Socratic Coach Dialog */}
      {coachOpen && (
        <div className="fixed bottom-20 right-6 z-50 shadow-2xl">
          <ChatPanel
            gameId={gameId}
            fen={chess.fen}
            initialMessage={coachMessage}
            onClose={() => setCoachOpen(false)}
          />
        </div>
      )}

      {/* What-If Branch Explorer Modal */}
      {branchFen && (
        <BranchExplorer
          startFen={branchFen}
          moveLabel={branchLabel}
          onClose={() => setBranchFen(null)}
        />
      )}
    </div>
  );
}
