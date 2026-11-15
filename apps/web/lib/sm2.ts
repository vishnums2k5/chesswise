/**
 * SuperMemo-2 (SM-2) Spaced Repetition Scheduling Algorithm
 * Used to calculate optimal review intervals for tactical blunder puzzles.
 */

export interface SM2Result {
  interval: number;
  easeFactor: number;
  nextReviewAt: Date;
  solvedCount: number;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function sm2Update(
  correct: boolean,
  interval: number,
  easeFactor: number,
  solvedCount: number,
  now: Date = new Date(),
): SM2Result {
  if (!correct) {
    return {
      interval: 1,
      easeFactor: Math.max(1.3, easeFactor - 0.2),
      nextReviewAt: addDays(now, 1),
      solvedCount,
    };
  }

  // q = 4 for successful solution
  const q = 4;
  const newEF = Math.max(1.3, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  let newInterval: number;
  if (solvedCount === 0) newInterval = 1;
  else if (solvedCount === 1) newInterval = 6;
  else newInterval = Math.round(interval * newEF);

  return {
    interval: newInterval,
    easeFactor: newEF,
    nextReviewAt: addDays(now, newInterval),
    solvedCount: solvedCount + 1,
  };
}
