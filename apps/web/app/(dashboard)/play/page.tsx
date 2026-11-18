'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Square } from '@chesswise/chess-core';
import { useChess } from '@/hooks/use-chess';
import { useEngine } from '@/hooks/use-engine';
import ChessBoard from '@/components/chess/chess-board';
import ChessBoard3D from '@/components/chess/chess-board-3d';
import MoveList from '@/components/chess/move-list';
import { cn } from '@/lib/utils';
import { getMirrorBotConfig, type SkillProfile } from '@/lib/mirror-bot';
import {
  Bot,
  RotateCcw,
  ArrowUpDown,
  Sparkles,
  Zap,
  BarChart3,
  Box,
  Layers,
  Crown,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const STATIC_DIFFICULTY_LEVELS = [
  { label: 'Beginner', elo: '~600', skillLevel: 0, depth: 5, color: 'text-emerald-400' },
  { label: 'Casual', elo: '~900', skillLevel: 5, depth: 8, color: 'text-blue-400' },
  { label: 'Club', elo: '~1400', skillLevel: 10, depth: 12, color: 'text-amber-400' },
  { label: 'Advanced', elo: '~1800', skillLevel: 15, depth: 16, color: 'text-purple-400' },
  { label: 'Master', elo: '~2200+', skillLevel: 20, depth: 20, color: 'text-red-400' },
  { label: 'Mirror Bot', elo: 'Your Nemesis', skillLevel: 10, depth: 14, color: 'text-primary' },
] as const;

type DifficultyLevel = {
  label: string;
  elo: string;
  skillLevel: number;
  depth: number;
  color?: string;
};

// Whisper hint levels
function getHint(bestMove: string | null, level: 1 | 2 | 3): string {
  if (!bestMove) return 'Engine calculating best candidate moves…';
  const from = bestMove.slice(0, 2);
  const to = bestMove.slice(2, 4);
  const files = 'abcdefgh';
  const fromFile = files.indexOf(from[0]!);
  const toFile = files.indexOf(to[0]!);
  const fileDiff = Math.abs(fromFile - toFile);
  const rankDiff = Math.abs(parseInt(from[1]!) - parseInt(to[1]!));

  if (level === 1) {
    if (fileDiff === 1 && rankDiff === 2) return 'A knight maneuver creates active counterplay.';
    if (fileDiff === 0) return 'Look along the open file for tactical infiltration.';
    if (rankDiff === 0) return 'A rank transition improves your piece coordination.';
    return 'Look for an active move that centralizes or coordinates your pieces.';
  }
  if (level === 2) {
    return `Look closely at the piece currently stationed on ${from}.`;
  }
  return `Objective engine recommendation: ${from} → ${to}`;
}

export default function PlayPage() {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    STATIC_DIFFICULTY_LEVELS[2] as DifficultyLevel,
  );
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [gameStatus, setGameStatus] = useState<string>('');
  const [engineColor, setEngineColor] = useState<'w' | 'b'>('b');

  // Mirror Bot
  const [mirrorProfile, setMirrorProfile] = useState<SkillProfile | null>(null);
  const [mirrorInfo, setMirrorInfo] = useState<string>('');

  // Whisper Coach
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2 | 3>(0);
  const [hintText, setHintText] = useState<string>('');
  const [xp, setXp] = useState<number | null>(null);
  const [is3DMode, setIs3DMode] = useState(false);
  const [analyzingGame, setAnalyzingGame] = useState(false);
  const [savedGameId, setSavedGameId] = useState<string | null>(null);

  const router = useRouter();
  const chess = useChess(undefined, 'chesswise_play_state');
  const engine = useEngine({ skillLevel: difficulty.skillLevel, depth: difficulty.depth });

  // Load profile for Mirror Bot
  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) setMirrorProfile(d.profile);
      })
      .catch(() => null);

    // Load user XP for hint display
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setXp(d.settings.xp);
      })
      .catch(() => null);
  }, []);

  // Find checked king square
  const checkedKingSquare = chess.isCheck
    ? (() => {
        const board = chess.game.board();
        for (let r = 0; r < 8; r++) {
          for (let f = 0; f < 8; f++) {
            const p = board[r]?.[f];
            if (p && p.type === 'k' && p.color === chess.turn) {
              const file = String.fromCharCode(97 + f);
              const rank = 8 - r;
              return `${file}${rank}` as Square;
            }
          }
        }
        return null;
      })()
    : null;

  const getEnrichedPgn = useCallback(() => {
    const isBotWhite = engineColor === 'w';
    const botName = `${difficulty.label} Bot`;
    const playerName = 'You';
    const result = chess.isCheckmate
      ? chess.turn === 'w'
        ? '0-1'
        : '1-0'
      : chess.isDraw
        ? '1/2-1/2'
        : '*';

    chess.game.header(
      'White',
      isBotWhite ? botName : playerName,
      'Black',
      isBotWhite ? playerName : botName,
      'Date',
      (new Date().toISOString().split('T')[0] ?? '').replace(/-/g, '.'),
      'Event',
      'Chesswise Play AI',
      'Site',
      'chesswise-web.vercel.app',
      'Result',
      result,
    );
    return chess.game.pgn();
  }, [chess.game, chess.isCheckmate, chess.isDraw, chess.turn, difficulty.label, engineColor]);

  // Handle Game Over status updates
  useEffect(() => {
    if (!chess.isGameOver) {
      setGameStatus('');
      setSavedGameId(null);
      return;
    }
    if (chess.isCheckmate) {
      setGameStatus(chess.turn === 'w' ? 'Black won by checkmate!' : 'White won by checkmate!');
    } else if (chess.isStalemate) {
      setGameStatus('Draw by stalemate');
    } else if (chess.isDraw) {
      setGameStatus('Draw (insufficient material / repetition)');
    }

    engine.stopAnalysis();
    setHintLevel(0);
    setHintText('');

    // Auto-save the game in background
    const pgn = getEnrichedPgn();
    fetch('/api/games/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pgn }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.gameId) {
          setSavedGameId(data.gameId);
        }
      })
      .catch((err) => console.error('Failed to auto-save game:', err));
  }, [
    chess.isCheckmate,
    chess.isStalemate,
    chess.isDraw,
    chess.isCheck,
    chess.turn,
    chess.isGameOver,
    engine,
    chess.game,
    getEnrichedPgn,
  ]);

  // Engine triggers on its turn
  useEffect(() => {
    if (!chess.isGameOver && chess.turn === engineColor && engine.isReady) {
      engine.analyzePosition(chess.fen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chess.fen, chess.turn, chess.isGameOver, engineColor, engine.isReady]);

  // Apply engine bestMove
  useEffect(() => {
    if (engine.bestMove && chess.turn === engineColor && !chess.isGameOver) {
      const from = engine.bestMove.slice(0, 2) as Square;
      const to = engine.bestMove.slice(2, 4) as Square;
      const promotion = engine.bestMove[4] as 'q' | 'r' | 'b' | 'n' | undefined;
      const timer = setTimeout(() => {
        chess.makeMove(from, to, promotion);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [engine.bestMove, chess, engineColor]);

  const handlePlayerMove = useCallback(
    (from: Square, to: Square, promotion?: string) => {
      if (chess.turn === engineColor) return;
      chess.makeMove(from, to, promotion as 'q' | 'r' | 'b' | 'n' | undefined);
    },
    [chess, engineColor],
  );

  const handleNewGame = () => {
    chess.resetGame();
    engine.stopAnalysis();
    setGameStatus('');
    setHintLevel(0);
    setHintText('');
  };

  const handleFlipBoard = () => {
    setOrientation((o) => (o === 'white' ? 'black' : 'white'));
    setEngineColor((c) => (c === 'w' ? 'b' : 'w'));
  };

  const handleAnalyzeGame = async () => {
    if (savedGameId) {
      router.push(`/report/${savedGameId}`);
      return;
    }
    setAnalyzingGame(true);
    try {
      const pgn = getEnrichedPgn();
      const res = await fetch('/api/games/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pgn }),
      });
      const data = await res.json();
      if (data.gameId) {
        router.push(`/report/${data.gameId}`);
      } else {
        alert('Failed to analyze game.');
        setAnalyzingGame(false);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to analyze game.');
      setAnalyzingGame(false);
    }
  };

  const handleDifficultyChange = (d: DifficultyLevel) => {
    if (d.label === 'Mirror Bot' && mirrorProfile) {
      const config = getMirrorBotConfig(mirrorProfile);
      setDifficulty({ ...d, skillLevel: config.skillLevel, depth: config.depth });
      engine.setSkillLevel(config.skillLevel);
      engine.setDepth(config.depth);
      setMirrorInfo(config.description);
    } else {
      setDifficulty(d);
      engine.setSkillLevel(d.skillLevel);
      engine.setDepth(d.depth);
      setMirrorInfo('');
    }
  };

  // Whisper Coach: request a hint
  const handleHint = () => {
    const nextLevel = Math.min(3, hintLevel + 1) as 1 | 2 | 3;
    setHintLevel(nextLevel);

    if (nextLevel === 1) {
      setHintText('Engine analyzing board dynamics...');
      engine.analyzePosition(chess.fen);
    } else if (engine.bestMove) {
      setHintText(getHint(engine.bestMove, nextLevel));
    }

    // Spend 5 XP per hint request in the background
    fetch('/api/xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 5, reason: 'whisper_hint' }),
    })
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        if (data?.xp !== undefined) setXp(data.xp);
      })
      .catch(() => null);
  };

  useEffect(() => {
    if (hintLevel > 0 && engine.bestMove) {
      setHintText(getHint(engine.bestMove, hintLevel as 1 | 2 | 3));
    }
  }, [hintLevel, engine.bestMove]);

  const lastMove =
    chess.history.length > 0
      ? {
          from: chess.history[chess.history.length - 1]!.from as Square,
          to: chess.history[chess.history.length - 1]!.to as Square,
        }
      : null;

  const isPlayerTurn = chess.turn !== engineColor && !chess.isGameOver;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Chessboard & Studio Stage */}
      <div className="flex flex-1 flex-col items-center justify-start gap-3">
        {/* Opponent Player Card (Top) */}
        <div className="flex w-full max-w-[min(100%,calc(100vh-210px),820px)] items-center justify-between rounded-xl border border-border/60 bg-card/70 px-4 py-2.5 shadow-sm backdrop-blur-sm transition-all">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <Bot className="h-4 w-4" />
              {engine.thinking && chess.turn === engineColor && (
                <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">{difficulty.label}</span>
                <span className="py-0.2 rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                  {difficulty.elo}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {engine.thinking && chess.turn === engineColor
                  ? 'Calculating candidate lines…'
                  : chess.turn === engineColor
                    ? 'Thinking…'
                    : 'Awaiting your move'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                'h-3 w-3 rounded-full border',
                engineColor === 'w' ? 'border-border bg-ivory' : 'border-border/80 bg-ink',
              )}
              title={engineColor === 'w' ? 'Playing White' : 'Playing Black'}
            />
          </div>
        </div>

        {/* Board Container (Strictly Square, Fluid Responsive Stage) */}
        <div className="relative flex aspect-square w-full max-w-[min(100%,calc(100vh-210px),820px)] justify-center">
          {is3DMode ? (
            <ChessBoard3D
              fen={chess.fen}
              orientation={orientation}
              onMove={handlePlayerMove}
              interactive={!chess.isGameOver && chess.turn !== engineColor}
            />
          ) : (
            <ChessBoard
              fen={chess.fen}
              orientation={orientation}
              lastMove={lastMove}
              onMove={handlePlayerMove}
              interactive={!chess.isGameOver && chess.turn !== engineColor}
              checkedKingSquare={checkedKingSquare}
            />
          )}
        </div>

        {/* Player Card (Bottom) */}
        <div className="flex w-full max-w-[min(100%,calc(100vh-210px),820px)] items-center justify-between rounded-xl border border-border/60 bg-card/70 px-4 py-2.5 shadow-sm backdrop-blur-sm transition-all">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/40 bg-card font-serif text-xs font-bold text-primary">
              YOU
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">You ({orientation})</span>
                {isPlayerTurn && (
                  <span className="py-0.2 rounded-full bg-emerald-500/15 px-2 text-[10px] font-semibold text-emerald-400">
                    Your Turn
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Move {chess.history.length > 0 ? Math.ceil(chess.history.length / 2) : 1}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                'h-3 w-3 rounded-full border',
                orientation === 'white' ? 'border-border bg-ivory' : 'border-border/80 bg-ink',
              )}
              title={orientation === 'white' ? 'Playing White' : 'Playing Black'}
            />
          </div>
        </div>
      </div>

      {/* Side Studio Control Deck */}
      <div className="flex w-full flex-col gap-4 lg:w-80 xl:w-[350px]">
        {/* Game Result Banner */}
        {gameStatus && (
          <div
            className={cn(
              'rounded-xl border p-4 text-center shadow-lg transition-all',
              chess.isCheckmate
                ? 'border-blunder/40 bg-blunder/15 text-foreground'
                : 'border-primary/40 bg-primary/15 text-foreground',
            )}
          >
            <div className="flex items-center justify-center gap-2">
              {chess.isCheckmate ? (
                <AlertCircle className="h-5 w-5 text-blunder" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              )}
              <h3 className="font-serif text-base font-bold">{gameStatus}</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Game recorded. Generate an AI coaching report or review key tactics.
            </p>
          </div>
        )}

        {/* Deep Analysis CTA */}
        {chess.history.length > 0 && (
          <button
            onClick={handleAnalyzeGame}
            disabled={analyzingGame}
            className={cn(
              'group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-md transition-all duration-150',
              chess.isGameOver
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(201,162,75,0.35)]'
                : 'border border-border/70 bg-card/80 text-foreground hover:bg-accent',
            )}
          >
            <BarChart3 className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
            <span>
              {analyzingGame
                ? 'Uploading to Cloud Engine…'
                : chess.isGameOver
                  ? savedGameId
                    ? 'View Deep Game Report & Puzzles'
                    : 'Generate Coaching Report'
                  : 'Analyze Live Position'}
            </span>
          </button>
        )}

        {/* Socratic Whisper Coach Deck */}
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-xs font-semibold text-foreground">Socratic Whisper Coach</h3>
            </div>
            {xp !== null && (
              <span className="flex items-center gap-1 font-mono text-[11px] text-primary">
                <Zap className="h-3 w-3" />
                <span>{xp} XP</span>
              </span>
            )}
          </div>

          {/* Hint Progress Dots */}
          <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5">
            <span className="text-[11px] text-muted-foreground">Progression</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((lvl) => (
                <span
                  key={lvl}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all',
                    hintLevel >= lvl ? 'scale-110 bg-primary' : 'bg-muted',
                  )}
                />
              ))}
            </div>
          </div>

          {/* Hint Text Area */}
          <div className="mt-2.5 flex min-h-[60px] items-center rounded-lg border border-border/50 bg-background/50 p-3">
            {hintText ? (
              <p className="text-xs leading-relaxed text-foreground">{hintText}</p>
            ) : (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Ask for a progressive hint without spoiling the solution.</span>
              </p>
            )}
          </div>

          <button
            onClick={handleHint}
            disabled={hintLevel >= 3 || !isPlayerTurn}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>
              {hintLevel === 0 && 'Get Socratic Hint (-5 XP)'}
              {hintLevel === 1 && 'Narrow Down Square (-5 XP)'}
              {hintLevel === 2 && 'Reveal Best Move (-5 XP)'}
              {hintLevel === 3 && 'Full Hint Revealed'}
            </span>
          </button>
        </div>

        {/* Bot Level Selector */}
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-foreground">Select Opponent</h3>
            <span className="text-[10px] text-muted-foreground">Stockfish 18</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {STATIC_DIFFICULTY_LEVELS.map((d) => {
              const isSelected =
                difficulty.label === d.label ||
                (difficulty.label === 'Mirror Bot' && d.label === 'Mirror Bot');
              const isMirror = d.label === 'Mirror Bot';
              const isLocked = isMirror && !mirrorProfile;

              return (
                <button
                  key={d.label}
                  onClick={() => handleDifficultyChange(d as DifficultyLevel)}
                  disabled={isLocked}
                  className={cn(
                    'flex flex-col items-start rounded-xl border p-2.5 text-left transition-all',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border/50 bg-background/40 text-muted-foreground hover:border-border hover:bg-card hover:text-foreground',
                    isLocked && 'cursor-not-allowed opacity-40',
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-semibold">{d.label}</span>
                    {isMirror && <Crown className="h-3 w-3 text-primary" />}
                  </div>
                  <span className="mt-0.5 font-mono text-[10px] opacity-70">{d.elo}</span>
                </button>
              );
            })}
          </div>

          {mirrorInfo && (
            <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-2.5 text-[11px] leading-snug text-primary">
              🪞 {mirrorInfo}
            </div>
          )}
        </div>

        {/* Move Ledger */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
            <h3 className="text-xs font-semibold text-foreground">Move History</h3>
            <span className="font-mono text-[10px] text-muted-foreground">
              {chess.history.length} plies
            </span>
          </div>
          <MoveList
            history={chess.history}
            currentIndex={chess.historyIndex}
            className="max-h-48 flex-1 p-2"
          />
        </div>

        {/* Board Controls Toolbar */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleNewGame}
            className="flex flex-col items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-[11px] font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            title="Reset to starting position"
          >
            <RotateCcw className="h-4 w-4" />
            <span>New</span>
          </button>
          <button
            onClick={() => setIs3DMode(!is3DMode)}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border/70 bg-card/80 py-2.5 text-[11px] font-medium text-foreground hover:bg-accent"
            title="Toggle between 2D and 3D board view"
          >
            {is3DMode ? <Layers className="h-4 w-4" /> : <Box className="h-4 w-4" />}
            <span>{is3DMode ? '2D View' : '3D View'}</span>
          </button>
          <button
            onClick={handleFlipBoard}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border/70 bg-card/80 py-2.5 text-[11px] font-medium text-foreground hover:bg-accent"
            title="Flip board orientation"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>Flip</span>
          </button>
          <button
            onClick={() => {
              if (chess.turn === engineColor) {
                chess.undoMove();
                engine.stopAnalysis();
              } else if (chess.history.length >= 2) {
                chess.undoMove();
                chess.undoMove();
                engine.stopAnalysis();
              }
            }}
            disabled={chess.history.length === 0}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border/70 bg-card/80 py-2.5 text-[11px] font-medium text-foreground hover:bg-accent disabled:opacity-40"
            title="Undo last move"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Undo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
