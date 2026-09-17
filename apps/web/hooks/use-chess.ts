'use client';

import { useState, useCallback, useEffect } from 'react';
import { Chess, Square, Move, PieceSymbol } from '@chesswise/chess-core';
import { useChessSound } from './use-chess-sound';

export interface UseChessReturn {
  game: Chess;
  fen: string;
  history: Move[];
  turn: 'w' | 'b';
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  makeMove: (from: Square, to: Square, promotion?: PieceSymbol) => Move | null;
  undoMove: () => void;
  resetGame: (fen?: string) => void;
  loadPgn: (pgn: string) => boolean;
  loadFen: (fen: string) => boolean;
  seekTo: (index: number) => void;
  historyIndex: number;
}

export function useChess(startFen?: string, storageKey?: string): UseChessReturn {
  const [game, setGame] = useState<Chess>(() => (startFen ? new Chess(startFen) : new Chess()));
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const playSound = useChessSound();

  // Load from localStorage on mount if storageKey is provided
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      const savedPgn = localStorage.getItem(storageKey);
      if (savedPgn) {
        try {
          const fresh = new Chess();
          fresh.loadPgn(savedPgn);
          setGame(fresh);
          setHistoryIndex(fresh.history().length - 1);
        } catch {
          console.error('Failed to parse saved chess game');
        }
      }
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Save to localStorage on every move
  useEffect(() => {
    if (isLoaded && storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, game.pgn());
    }
  }, [game.pgn(), isLoaded, storageKey]);

  const update = useCallback((fn: (g: Chess) => void) => {
    setGame((prev) => {
      const next = new Chess(prev.fen());
      // Replay all history onto fresh instance to preserve full history
      const history = prev.history({ verbose: true }) as Move[];
      const fresh = new Chess();
      for (const m of history) {
        fresh.move(m);
      }
      fn(fresh);
      setHistoryIndex(fresh.history().length - 1);
      return fresh;
    });
  }, []);

  const makeMove = useCallback(
    (from: Square, to: Square, promotion?: PieceSymbol): Move | null => {
      let result: Move | null = null;
      setGame((prev) => {
        const history = prev.history({ verbose: true }) as Move[];
        const next = new Chess();
        for (const m of history) {
          next.move(m);
        }
        try {
          result = next.move({ from, to, promotion: promotion ?? 'q' });

          if (result) {
            // Play appropriate sound
            if (next.isGameOver()) {
              playSound('end');
            } else if (result.captured) {
              playSound('capture');
            } else {
              playSound('move');
            }
          }

          setHistoryIndex(next.history().length - 1);
          return result ? next : prev;
        } catch {
          return prev;
        }
      });
      return result;
    },
    [playSound],
  );

  const undoMove = useCallback(() => {
    setGame((prev) => {
      const history = prev.history({ verbose: true }) as Move[];
      const next = new Chess();
      for (const m of history) {
        next.move(m);
      }
      next.undo();
      setHistoryIndex(next.history().length - 1);
      return next;
    });
  }, []);

  const resetGame = useCallback((fen?: string) => {
    const fresh = fen ? new Chess(fen) : new Chess();
    setGame(fresh);
    setHistoryIndex(-1);
  }, []);

  const loadPgn = useCallback((pgn: string): boolean => {
    try {
      const next = new Chess();
      next.loadPgn(pgn);
      setGame(next);
      setHistoryIndex(next.history().length - 1);
      return true;
    } catch {
      return false;
    }
  }, []);

  const loadFen = useCallback((fen: string): boolean => {
    try {
      const next = new Chess(fen);
      setGame(next);
      setHistoryIndex(-1);
      return true;
    } catch {
      return false;
    }
  }, []);

  const seekTo = useCallback((index: number) => {
    setGame((prev) => {
      const allMoves = prev.history({ verbose: true }) as Move[];
      const fresh = new Chess();
      for (let i = 0; i <= index && i < allMoves.length; i++) {
        fresh.move(allMoves[i]!);
      }
      setHistoryIndex(index);
      return fresh;
    });
  }, []);

  return {
    game,
    fen: game.fen(),
    history: game.history({ verbose: true }) as Move[],
    turn: game.turn(),
    isCheck: game.inCheck(),
    isCheckmate: game.isCheckmate(),
    isStalemate: game.isStalemate(),
    isDraw: game.isDraw(),
    isGameOver: game.isGameOver(),
    makeMove,
    undoMove,
    resetGame,
    loadPgn,
    loadFen,
    seekTo,
    historyIndex,
  };
}
