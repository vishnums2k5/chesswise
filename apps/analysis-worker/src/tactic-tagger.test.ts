import { describe, it, expect } from 'vitest';
import { classifyTactic } from './tactic-tagger';

describe('tactic-tagger (Deterministic Tactic Classifier)', () => {
  it('returns null when played move matches best move', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    expect(classifyTactic(fen, 'e7e5', 'e7e5')).toBeNull();
  });

  it('returns null when best move is not provided', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    expect(classifyTactic(fen, null, 'e7e5')).toBeNull();
  });

  it('detects a knight fork attacking King and Rook', () => {
    // White knight on e6 can move to c7, checking King on e8 and attacking Rook on a8
    // Black king on e8, black rook on a8
    // White knight on e6
    const fen = 'r3k3/8/4N3/8/8/8/8/4K3 w - - 0 1';
    // Best move: e6c7 (Nc7+) checks Ke8 and attacks Ra8 (fork)
    // Played move: e6g7 (blunder)
    const tactic = classifyTactic(fen, 'e6c7', 'e6g7');
    expect(tactic).toBe('fork');
  });

  it('detects a hanging piece capture', () => {
    // White queen on d1, black bishop undefended on d5
    // White best move is Qxd5 (d1d5) capturing the undefended bishop
    const fen = '4k3/8/8/3b4/8/8/8/3QK3 w - - 0 1';
    const tactic = classifyTactic(fen, 'd1d5', 'd1e2');
    expect(tactic).toBe('hanging_piece');
  });

  it('detects a back-rank mate threat', () => {
    // Black king on g8 behind pawns f7, g7, h7 with no luft
    // White rook on d1 moves to d8#
    const fen = '3r2k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1';
    // Best move: d1d8# (Rxd8#)
    // Played move: d1e1
    const tactic = classifyTactic(fen, 'd1d8', 'd1e1');
    expect(tactic).toBe('back_rank');
  });
});
