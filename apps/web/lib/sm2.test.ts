import { describe, it, expect } from 'vitest';
import { sm2Update, addDays } from './sm2';

describe('SM-2 Spaced Repetition Algorithm', () => {
  const baseDate = new Date('2026-01-01T00:00:00Z');

  it('resets interval to 1 day on incorrect answer and reduces easeFactor', () => {
    const result = sm2Update(false, 10, 2.5, 3, baseDate);

    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBe(2.3); // 2.5 - 0.2
    expect(result.solvedCount).toBe(3); // count not incremented on failure
    expect(result.nextReviewAt.toISOString()).toBe(addDays(baseDate, 1).toISOString());
  });

  it('clamps minimum easeFactor to 1.3 on repeated failures', () => {
    const result = sm2Update(false, 1, 1.4, 0, baseDate);
    expect(result.easeFactor).toBe(1.3); // Math.max(1.3, 1.4 - 0.2 = 1.2) -> 1.3
  });

  it('sets interval to 1 on first successful solve (solvedCount = 0)', () => {
    const result = sm2Update(true, 1, 2.5, 0, baseDate);

    expect(result.interval).toBe(1);
    expect(result.solvedCount).toBe(1);
    expect(result.nextReviewAt.toISOString()).toBe(addDays(baseDate, 1).toISOString());
  });

  it('sets interval to 6 on second successful solve (solvedCount = 1)', () => {
    const result = sm2Update(true, 1, 2.5, 1, baseDate);

    expect(result.interval).toBe(6);
    expect(result.solvedCount).toBe(2);
    expect(result.nextReviewAt.toISOString()).toBe(addDays(baseDate, 6).toISOString());
  });

  it('multiplies interval by easeFactor on subsequent successful solves (solvedCount >= 2)', () => {
    // interval = 6, easeFactor ~ 2.5 -> newInterval = round(6 * 2.5) = 15
    const result = sm2Update(true, 6, 2.5, 2, baseDate);

    expect(result.interval).toBe(15);
    expect(result.solvedCount).toBe(3);
    expect(result.nextReviewAt.toISOString()).toBe(addDays(baseDate, 15).toISOString());
  });
});
