'use client';

import { useState, useEffect } from 'react';
import { Square } from '@chesswise/chess-core';
import { useChess } from '@/hooks/use-chess';
import { useEngine } from '@/hooks/use-engine';
import ChessBoard from '@/components/chess/chess-board';
import EvalBar from '@/components/chess/eval-bar';
import MoveList from '@/components/chess/move-list';
import {
  RotateCcw,
  ArrowUpDown,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Cpu,
  FileCode,
  FileText,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AnalyzePage() {
  const chess = useChess();
  const engine = useEngine({ depth: 20 });

  const [activeTab, setActiveTab] = useState<'fen' | 'pgn'>('fen');
  const [fenInput, setFenInput] = useState('');
  const [pgnInput, setPgnInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [copiedFen, setCopiedFen] = useState(false);

  // Continuously analyze whenever position changes
  useEffect(() => {
    if (engine.isReady) {
      engine.analyzePosition(chess.fen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chess.fen, engine.isReady]);

  const handleLoadFen = () => {
    setInputError('');
    const ok = chess.loadFen(fenInput.trim());
    if (!ok) setInputError('Invalid FEN position string. Please check formatting.');
    else setFenInput('');
  };

  const handleLoadPgn = () => {
    setInputError('');
    const ok = chess.loadPgn(pgnInput.trim());
    if (!ok) setInputError('Invalid PGN string. Unable to parse notation.');
    else setPgnInput('');
  };

  const handleCopyFen = () => {
    navigator.clipboard.writeText(chess.fen);
    setCopiedFen(true);
    setTimeout(() => setCopiedFen(false), 2000);
  };

  const lastMove =
    chess.history.length > 0
      ? {
          from: chess.history[chess.history.length - 1]!.from as Square,
          to: chess.history[chess.history.length - 1]!.to as Square,
        }
      : null;

  const evalLabel = engine.evaluation
    ? engine.evaluation.type === 'mate'
      ? `M${Math.abs(engine.evaluation.value)}`
      : `${engine.evaluation.value > 0 ? '+' : ''}${(engine.evaluation.value / 100).toFixed(2)}`
    : '0.00';

  const isWhiteWinning = (engine.evaluation?.value ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Board + Evaluation Bar Stage */}
      <div className="flex flex-1 flex-col items-center justify-start gap-4">
        <div className="flex items-center justify-center gap-3">
          {/* Vertical Dynamic Eval Bar */}
          <EvalBar
            type={engine.evaluation?.type ?? 'cp'}
            value={engine.evaluation?.value ?? 0}
            orientation={orientation}
            className="h-[min(80vw,520px)] w-7 self-center rounded-lg shadow-md"
          />

          {/* Interactive Chessboard */}
          <div className="relative">
            <ChessBoard
              fen={chess.fen}
              orientation={orientation}
              lastMove={lastMove}
              onMove={(from, to, promotion) =>
                chess.makeMove(
                  from as Square,
                  to as Square,
                  promotion as 'q' | 'r' | 'b' | 'n' | undefined,
                )
              }
              interactive
            />
          </div>
        </div>

        {/* Step-by-Step Navigation Bar */}
        <div className="flex w-full max-w-[min(90vw,560px)] items-center justify-between rounded-xl border border-border/60 bg-card/70 px-4 py-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => chess.seekTo(-1)}
              disabled={chess.historyIndex === -1}
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
              title="First move"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => chess.seekTo(chess.historyIndex - 1)}
              disabled={chess.historyIndex <= -1}
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
              title="Previous move"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-mono text-xs text-muted-foreground">
              {chess.historyIndex + 1} / {chess.history.length}
            </span>
            <button
              onClick={() => chess.seekTo(chess.historyIndex + 1)}
              disabled={chess.historyIndex >= chess.history.length - 1}
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
              title="Next move"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => chess.seekTo(chess.history.length - 1)}
              disabled={chess.historyIndex >= chess.history.length - 1}
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
              title="Current move"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFen}
              className="flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Copy current FEN to clipboard"
            >
              {copiedFen ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="text-[11px]">FEN</span>
                </>
              )}
            </button>
            <button
              onClick={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))}
              className="flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Flip board orientation"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span className="text-[11px]">Flip</span>
            </button>
            <button
              onClick={() => chess.resetGame()}
              className="flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Reset position"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="text-[11px]">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Side Studio Analysis Deck */}
      <div className="flex w-full flex-col gap-4 lg:w-80">
        {/* Real-time Engine Evaluation Card */}
        <div className="rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Stockfish 18
              </span>
            </div>
            {engine.thinking ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <span className="h-2 w-2 animate-ping rounded-full bg-primary" />
                <span>Depth 20</span>
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Depth 20</span>
            )}
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <span
              className={cn(
                'font-mono text-3xl font-extrabold tracking-tight',
                isWhiteWinning ? 'text-primary' : 'text-blue-400',
              )}
            >
              {evalLabel}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {engine.evaluation?.type === 'mate'
                ? 'Forced Mate Line'
                : isWhiteWinning
                  ? 'White Advantage'
                  : 'Black Advantage'}
            </span>
          </div>

          {/* Engine Principal Variation (PV) Best Line */}
          {engine.pv.length > 0 && (
            <div className="mt-4 rounded-xl border border-border/50 bg-background/50 p-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Principal Variation (PV)
              </span>
              <p className="mt-1 font-mono text-xs leading-relaxed text-foreground">
                {engine.pv.slice(0, 7).join(' ')}
              </p>
            </div>
          )}
        </div>

        {/* Position Importer Tabs */}
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm">
          <div className="flex border-b border-border/50 pb-2">
            <button
              onClick={() => {
                setActiveTab('fen');
                setInputError('');
              }}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-3 pb-2 text-xs font-semibold transition-all',
                activeTab === 'fen'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Load FEN</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('pgn');
                setInputError('');
              }}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-3 pb-2 text-xs font-semibold transition-all',
                activeTab === 'pgn'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Load PGN</span>
            </button>
          </div>

          <div className="mt-3">
            {activeTab === 'fen' ? (
              <div className="space-y-2">
                <input
                  value={fenInput}
                  onChange={(e) => setFenInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLoadFen()}
                  placeholder="Paste FEN string…"
                  className="w-full rounded-lg border border-border/70 bg-background/60 px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleLoadFen}
                  className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  Load FEN Position
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={pgnInput}
                  onChange={(e) => setPgnInput(e.target.value)}
                  placeholder="Paste PGN notation string…"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border/70 bg-background/60 p-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleLoadPgn}
                  className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  Parse &amp; Load PGN
                </button>
              </div>
            )}

            {inputError && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-blunder">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{inputError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Move History Ledger */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
            <h3 className="text-xs font-semibold text-foreground">Move History</h3>
            <span className="font-mono text-[10px] text-muted-foreground">
              {chess.history.length} moves
            </span>
          </div>
          <MoveList
            history={chess.history}
            currentIndex={chess.historyIndex}
            onSeek={chess.seekTo}
            className="max-h-56 flex-1 p-2"
          />
        </div>
      </div>
    </div>
  );
}
