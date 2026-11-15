'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useChess } from '@/hooks/use-chess';
import ChessBoard from '@/components/chess/chess-board';
import MoveList from '@/components/chess/move-list';
import { Square } from '@chesswise/chess-core';
import { cn } from '@/lib/utils';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Swords, Copy, Check, LogOut, CheckCircle2, Share2 } from 'lucide-react';

export default function MultiplayerPage() {
  const [supabase] = useState(() => createClient());
  const [matchId, setMatchId] = useState('');
  const [joinId, setJoinId] = useState('');
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const [status, setStatus] = useState<'lobby' | 'waiting' | 'playing'>('lobby');
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [opponentName, setOpponentName] = useState<string>('Opponent');
  const [copiedCode, setCopiedCode] = useState(false);

  const chess = useChess();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [channel, supabase]);

  const handleCreateMatch = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const myName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Player';
    const newMatchId = Math.random().toString(36).substring(2, 8).toUpperCase();

    setMatchId(newMatchId);
    setPlayerColor('white');
    setStatus('waiting');
    chess.resetGame();

    const ch = supabase.channel(`match-${newMatchId}`);

    ch.on('broadcast', { event: 'join' }, ({ payload }) => {
      setOpponentName(payload.name);
      setStatus('playing');
      ch.send({
        type: 'broadcast',
        event: 'creator_info',
        payload: { name: myName },
      });
    })
      .on('broadcast', { event: 'move' }, ({ payload }) => {
        chess.makeMove(payload.from, payload.to, payload.promotion);
      })
      .subscribe();

    setChannel(ch);
  };

  const handleJoinMatch = async () => {
    if (!joinId.trim()) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const myName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Player';

    setMatchId(joinId.toUpperCase());
    setPlayerColor('black');
    chess.resetGame();

    const ch = supabase.channel(`match-${joinId.toUpperCase()}`);

    ch.on('broadcast', { event: 'creator_info' }, ({ payload }) => {
      setOpponentName(payload.name);
      setStatus('playing');
    })
      .on('broadcast', { event: 'move' }, ({ payload }) => {
        chess.makeMove(payload.from, payload.to, payload.promotion);
      })
      .subscribe((subStatus) => {
        if (subStatus === 'SUBSCRIBED') {
          ch.send({
            type: 'broadcast',
            event: 'join',
            payload: { name: myName },
          });
        }
      });

    setChannel(ch);
  };

  const handleCopyMatchId = () => {
    navigator.clipboard.writeText(matchId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleMove = useCallback(
    (from: Square, to: Square, promotion?: string) => {
      const turnColor = chess.turn === 'w' ? 'white' : 'black';
      if (turnColor !== playerColor) return;
      if (status !== 'playing') return;

      const success = chess.makeMove(from, to, promotion as 'q' | 'r' | 'b' | 'n' | undefined);
      if (success && channel) {
        channel.send({
          type: 'broadcast',
          event: 'move',
          payload: { from, to, promotion },
        });
      }
    },
    [chess, playerColor, status, channel],
  );

  const handleLeave = () => {
    if (channel) supabase.removeChannel(channel);
    setChannel(null);
    setStatus('lobby');
    setMatchId('');
    setJoinId('');
  };

  if (status === 'lobby') {
    return (
      <div className="flex min-h-[75vh] items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/70 bg-card/70 p-8 shadow-2xl backdrop-blur-md">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <Swords className="h-7 w-7" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">
              Multiplayer PvP Arena
            </h1>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Create a custom live match or join via room code. Real-time board state synchronized
              across players.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <button
              onClick={handleCreateMatch}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(201,162,75,0.35)] active:scale-[0.98]"
            >
              <Swords className="h-4 w-4" />
              <span>Create Match (Play as White)</span>
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border/60"></div>
              <span className="flex-shrink-0 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Or join room
              </span>
              <div className="flex-grow border-t border-border/60"></div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ENTER 6-CHAR CODE"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinMatch()}
                className="flex-1 rounded-xl border border-border/70 bg-background/60 px-3 py-2.5 font-mono text-xs uppercase text-foreground placeholder:normal-case placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleJoinMatch}
                disabled={!joinId.trim()}
                className="rounded-xl border border-border/80 bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-40"
              >
                Join Match
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isMyTurn = (chess.turn === 'w' ? 'white' : 'black') === playerColor;
  let gameStatusMsg = '';
  if (chess.isCheckmate) gameStatusMsg = 'Checkmate!';
  else if (chess.isDraw) gameStatusMsg = 'Game Drawn!';
  else if (chess.isCheck) gameStatusMsg = 'Check!';
  else if (status === 'waiting') gameStatusMsg = 'Waiting for opponent to join…';
  else gameStatusMsg = isMyTurn ? 'Your turn to move' : `${opponentName}'s turn`;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Board Column */}
      <div className="flex flex-1 flex-col items-center justify-start space-y-4">
        {status === 'waiting' && (
          <div className="w-full max-w-[min(90vw,560px)] rounded-2xl border border-primary/30 bg-card/70 p-6 text-center shadow-lg backdrop-blur-md animate-in fade-in">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Share2 className="h-5 w-5" />
            </div>
            <p className="font-serif text-base font-bold text-foreground">
              Waiting for Challenger…
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Share this room code with your opponent:
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="rounded-xl border border-primary/40 bg-background/60 px-6 py-2.5 font-mono text-2xl font-black tracking-widest text-primary">
                {matchId}
              </div>
              <button
                onClick={handleCopyMatchId}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
                title="Copy Match ID"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div
          className={cn(
            'transition-opacity duration-300',
            status === 'waiting' ? 'pointer-events-none opacity-40' : 'opacity-100',
          )}
        >
          <ChessBoard
            fen={chess.fen}
            orientation={playerColor}
            onMove={handleMove}
            interactive={status === 'playing' && isMyTurn && !chess.isGameOver}
            lastMove={
              chess.history.length > 0
                ? {
                    from: chess.history[chess.history.length - 1]!.from as Square,
                    to: chess.history[chess.history.length - 1]!.to as Square,
                  }
                : null
            }
          />
        </div>
      </div>

      {/* Side Match Telemetry Panel */}
      <div className="flex w-full flex-col gap-4 lg:w-80">
        <div className="space-y-4 rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Match Room
            </span>
            <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
              {matchId}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border border-border bg-ivory" />
              <span className="text-foreground">
                {playerColor === 'white' ? 'You' : opponentName}
              </span>
            </div>
            <span className="text-muted-foreground">vs</span>
            <div className="flex items-center gap-2">
              <span className="text-foreground">
                {playerColor === 'black' ? 'You' : opponentName}
              </span>
              <div className="h-3 w-3 rounded-full border border-border bg-ink" />
            </div>
          </div>

          {/* Turn Banner */}
          <div
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold',
              chess.isCheckmate
                ? 'border border-blunder/30 bg-blunder/15 text-blunder'
                : isMyTurn && status === 'playing'
                  ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border border-primary/20 bg-primary/10 text-primary',
            )}
          >
            {isMyTurn && status === 'playing' && <CheckCircle2 className="h-3.5 w-3.5" />}
            <span>{gameStatusMsg}</span>
          </div>
        </div>

        {/* Move History */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm">
          <div className="border-b border-border/50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Move History
          </div>
          <MoveList
            history={chess.history}
            currentIndex={chess.historyIndex}
            className="max-h-56 flex-1 p-2"
          />
        </div>

        <button
          onClick={handleLeave}
          className="flex items-center justify-center gap-2 rounded-xl border border-blunder/30 bg-blunder/5 py-2.5 text-xs font-semibold text-blunder transition-colors hover:bg-blunder/15"
        >
          <LogOut className="h-4 w-4" />
          <span>Leave Room</span>
        </button>
      </div>
    </div>
  );
}
