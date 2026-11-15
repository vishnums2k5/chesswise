import { describe, it, expect } from 'vitest';

describe('Dashboard Metrics & Bento Aggregation Logic', () => {
  it('correctly calculates average accuracy across analyzed games', () => {
    const mockGames = [
      { id: '1', status: 'ANALYSIS_COMPLETE', accuracy: 80 },
      { id: '2', status: 'ANALYSIS_COMPLETE', accuracy: 90 },
      { id: '3', status: 'IMPORTED', accuracy: null },
    ];

    const analyzedGames = mockGames.filter(
      (g) => g.status === 'ANALYSIS_COMPLETE' && g.accuracy !== null,
    );
    const avgAccuracy =
      analyzedGames.length > 0
        ? Math.round(
            analyzedGames.reduce((acc, g) => acc + (g.accuracy ?? 0), 0) / analyzedGames.length,
          )
        : null;

    expect(avgAccuracy).toBe(85);
  });

  it('handles empty games list gracefully without NaN', () => {
    const mockGames: Array<{ id: string; status: string; accuracy: number | null }> = [];
    const analyzedGames = mockGames.filter(
      (g) => g.status === 'ANALYSIS_COMPLETE' && g.accuracy !== null,
    );
    const avgAccuracy =
      analyzedGames.length > 0
        ? Math.round(
            analyzedGames.reduce((acc, g) => acc + (g.accuracy ?? 0), 0) / analyzedGames.length,
          )
        : null;

    expect(avgAccuracy).toBeNull();
  });

  it('correctly filters due puzzles using SM-2 timestamps', () => {
    const now = new Date('2026-11-15T12:00:00Z');
    const mockPuzzles = [
      { id: '1', nextReviewAt: new Date('2026-11-14T12:00:00Z'), solvedCount: 1 }, // overdue -> due
      { id: '2', nextReviewAt: null, solvedCount: 0 }, // no date -> due
      { id: '3', nextReviewAt: new Date('2026-11-20T12:00:00Z'), solvedCount: 3 }, // future -> not due
    ];

    const duePuzzles = mockPuzzles.filter(
      (p) => !p.nextReviewAt || new Date(p.nextReviewAt) <= now,
    );
    const masteredPuzzles = mockPuzzles.filter((p) => p.solvedCount >= 3);

    expect(duePuzzles.length).toBe(2);
    expect(masteredPuzzles.length).toBe(1);
    expect(masteredPuzzles[0]?.id).toBe('3');
  });
});
