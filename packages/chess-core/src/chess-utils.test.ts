import { describe, it, expect } from 'vitest';
import { Chess } from 'chess.js';
import {
  getLegalMovesForSquare,
  getSquareColor,
  classifyMoveQuality,
  fenToPieceMap,
  PIECE_UNICODE,
} from './chess-utils';

describe('chess-utils', () => {
  describe('getSquareColor', () => {
    it('correctly determines light and dark squares', () => {
      // a1 is dark
      expect(getSquareColor('a1')).toBe('dark');
      // a8 is light
      expect(getSquareColor('a8')).toBe('light');
      // e4 is light
      expect(getSquareColor('e4')).toBe('light');
      // d4 is dark
      expect(getSquareColor('d4')).toBe('dark');
      // h1 is light
      expect(getSquareColor('h1')).toBe('light');
      // h8 is dark
      expect(getSquareColor('h8')).toBe('dark');
    });
  });

  describe('getLegalMovesForSquare', () => {
    it('returns legal moves for white pawn on e2 in starting position', () => {
      const chess = new Chess();
      const moves = getLegalMovesForSquare(chess, 'e2');
      expect(moves).toContain('e3');
      expect(moves).toContain('e4');
      expect(moves).toHaveLength(2);
    });

    it('returns legal moves for white knight on b1 in starting position', () => {
      const chess = new Chess();
      const moves = getLegalMovesForSquare(chess, 'b1');
      expect(moves).toContain('a3');
      expect(moves).toContain('c3');
      expect(moves).toHaveLength(2);
    });

    it('returns empty array for square with no pieces', () => {
      const chess = new Chess();
      const moves = getLegalMovesForSquare(chess, 'e4');
      expect(moves).toEqual([]);
    });

    it('returns empty array when square is blocked/pinned with no moves', () => {
      const chess = new Chess();
      const moves = getLegalMovesForSquare(chess, 'e1'); // King blocked by pawns
      expect(moves).toEqual([]);
    });
  });

  describe('classifyMoveQuality', () => {
    it('identifies brilliant moves (loss <= -150 cp)', () => {
      expect(classifyMoveQuality(0, 200)).toBe('!!');
      expect(classifyMoveQuality(100, 300)).toBe('!!');
    });

    it('identifies excellent moves (loss <= 0 cp)', () => {
      expect(classifyMoveQuality(100, 100)).toBe('!');
      expect(classifyMoveQuality(50, 100)).toBe('!');
    });

    it('identifies interesting moves (loss <= 20 cp)', () => {
      expect(classifyMoveQuality(100, 85)).toBe('!?');
    });

    it('identifies inaccuracies (loss <= 60 cp)', () => {
      expect(classifyMoveQuality(100, 50)).toBe('?!');
    });

    it('identifies mistakes (loss <= 120 cp)', () => {
      expect(classifyMoveQuality(100, 0)).toBe('?');
    });

    it('identifies blunders (loss > 120 cp)', () => {
      expect(classifyMoveQuality(100, -150)).toBe('??');
      expect(classifyMoveQuality(0, -300)).toBe('??');
    });
  });

  describe('fenToPieceMap', () => {
    it('maps standard starting position pieces accurately', () => {
      const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const map = fenToPieceMap(startingFen);

      expect(map['e1']).toBe('K');
      expect(map['d1']).toBe('Q');
      expect(map['e8']).toBe('k');
      expect(map['d8']).toBe('q');
      expect(map['a1']).toBe('R');
      expect(map['h8']).toBe('r');
      expect(map['e2']).toBe('P');
      expect(map['e7']).toBe('p');
      expect(map['e4']).toBeUndefined();
    });
  });

  describe('PIECE_UNICODE', () => {
    it('provides correct Unicode chess symbols', () => {
      expect(PIECE_UNICODE['K']).toBe('♔');
      expect(PIECE_UNICODE['Q']).toBe('♕');
      expect(PIECE_UNICODE['k']).toBe('♚');
      expect(PIECE_UNICODE['q']).toBe('♛');
      expect(PIECE_UNICODE['P']).toBe('♙');
      expect(PIECE_UNICODE['p']).toBe('♟');
    });
  });
});
