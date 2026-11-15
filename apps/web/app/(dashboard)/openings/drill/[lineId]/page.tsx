'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Chess, Square } from '@chesswise/chess-core';
import ChessBoard from '@/components/chess/chess-board';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';

interface OpeningLine {
  id: string;
  eco: string;
  name: string;
  moves: string;
}

export default function DrillPage() {
  const params = useParams();
  const router = useRouter();
  const lineId = params?.lineId as string;

  const [line, setLine] = useState<OpeningLine | null>(null);
  const [loading, setLoading] = useState(true);
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

  const [repMoves, setRepMoves] = useState<string[]>([]);
  const [plyIndex, setPlyIndex] = useState(0);
  const [status, setStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG' | 'DONE'>('IDLE');
  const [wrongSan, setWrongSan] = useState<string | null>(null);

  const chessRef = useRef(new Chess());

  useEffect(() => {
    fetch(`/api/openings/${lineId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.line) {
          setLine(d.line);
          const moves = d.line.moves.split(' ').filter(Boolean);
          setRepMoves(moves);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lineId]);

  const reset = () => {
    chessRef.current.reset();
    setFen(chessRef.current.fen());
    setPlyIndex(0);
    setStatus('IDLE');
    setWrongSan(null);
  };

  const handleMove = (from: Square, to: Square, promotion?: string) => {
    if (status === 'DONE' || status === 'WRONG') return;

    const expectedSan = repMoves[plyIndex];
    if (!expectedSan) return;

    const chess = chessRef.current;

    try {
      const move = chess.move({ from, to, promotion });
      const playedSan = move.san;

      if (playedSan === expectedSan) {
        setFen(chess.fen());
        setPlyIndex((prev) => prev + 1);
        setStatus('CORRECT');

        if (plyIndex + 1 < repMoves.length) {
          setTimeout(() => {
            const oppMove = repMoves[plyIndex + 1];
            if (!oppMove) return;
            chess.move(oppMove);
            setFen(chess.fen());
            setPlyIndex((prev) => prev + 1);
            setStatus('IDLE');

            if (plyIndex + 2 >= repMoves.length) {
              setStatus('DONE');
            }
          }, 600);
        } else {
          setStatus('DONE');
        }
      } else {
        chess.undo();
        setWrongSan(playedSan);
        setStatus('WRONG');
      }
    } catch {
      // Invalid move
    }
  };

  const retryPly = () => {
    setStatus('IDLE');
    setWrongSan(null);
  };

  if (loading) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading repertoire line drill…</p>
      </div>
    );
  }

  if (!line) {
    return (
      <div className="flex h-72 flex-col items-center justify-center text-center">
        <h3 className="font-serif text-lg font-bold text-foreground">Opening Line Not Found</h3>
        <button
          onClick={() => router.push('/openings')}
          className="mt-4 text-xs font-semibold text-primary hover:underline"
        >
          Return to Repertoire Overview
        </button>
      </div>
    );
  }

  const expectedMove = repMoves[plyIndex];
  const orientation = 'white';

  return (
    <div className="max-w-4xl space-y-6 pb-20">
      {/* Header Bar */}
      <div className="rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur-sm">
        <button
          onClick={() => router.push('/openings')}
          className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Repertoire</span>
        </button>
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                {line.eco}
              </span>
              <h1 className="font-serif text-xl font-bold text-foreground sm:text-2xl">
                {line.name}
              </h1>
            </div>
            <p className="mt-1 max-w-xl truncate font-mono text-xs text-muted-foreground">
              {line.moves}
            </p>
          </div>

          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Line</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left: Board Stage */}
        <div className="md:col-span-2">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-4 shadow-xl">
            <ChessBoard
              fen={fen}
              orientation={orientation}
              onMove={handleMove}
              interactive={status === 'IDLE' || status === 'CORRECT'}
            />

            {/* Victory Overlay Modal */}
            {status === 'DONE' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/85 p-6 text-center backdrop-blur-md duration-300 animate-in fade-in zoom-in">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary shadow-sm shadow-amber-950/20">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">Line Mastered!</h3>
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
                  You successfully executed all {repMoves.length} moves in this repertoire branch
                  without a single deviation.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                  >
                    <Target className="h-4 w-4" />
                    <span>Drill Again</span>
                  </button>
                  <button
                    onClick={() => router.push('/openings')}
                    className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Deviation Guardian Stepper */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur-sm">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Repertoire Plies ({repMoves.length})
            </h3>

            <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
              {repMoves.map((m, i) => {
                const isCurrent = i === plyIndex;
                const isPast = i < plyIndex;
                const isWhite = i % 2 === 0;

                return (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center justify-between rounded-xl border px-3 py-2 font-mono text-xs transition-all',
                      isPast
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                        : isCurrent && status === 'WRONG'
                          ? 'border-blunder/40 bg-blunder/10 text-blunder'
                          : isCurrent
                            ? 'border-primary bg-primary/10 font-bold text-primary shadow-sm'
                            : 'border-border/40 bg-background/30 text-muted-foreground/60',
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] opacity-70">
                        {Math.floor(i / 2) + 1}
                        {isWhite ? '.' : '...'}
                      </span>
                      <span>{m}</span>
                    </div>

                    {isPast && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                    {isCurrent && status === 'WRONG' && (
                      <XCircle className="h-3.5 w-3.5 text-blunder" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deviation Alert Card */}
          {status === 'WRONG' && (
            <div className="rounded-2xl border border-blunder/40 bg-blunder/10 p-5 backdrop-blur-sm animate-in slide-in-from-right">
              <div className="flex items-center gap-2 text-xs font-semibold text-blunder">
                <ShieldAlert className="h-4 w-4" />
                <span>Repertoire Deviation Detected</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-foreground/90">
                You played <span className="font-mono font-bold text-blunder">{wrongSan}</span>, but
                your prepared line is{' '}
                <span className="font-mono font-bold text-primary">{expectedMove}</span>.
              </p>
              <button
                onClick={retryPly}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-blunder py-2.5 text-xs font-bold text-foreground shadow-sm transition-all hover:bg-blunder/90"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Retry Move</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
