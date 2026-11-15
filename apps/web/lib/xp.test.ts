import { describe, it, expect } from 'vitest';
import { xpToLevel, xpForNextLevel, xpProgress } from './xp';

describe('XP & Level Progression System', () => {
  it('calculates correct level based on XP', () => {
    // Level formula: floor(sqrt(xp / 100)) + 1
    expect(xpToLevel(0)).toBe(1);
    expect(xpToLevel(99)).toBe(1);
    expect(xpToLevel(100)).toBe(2);
    expect(xpToLevel(399)).toBe(2);
    expect(xpToLevel(400)).toBe(3);
    expect(xpToLevel(900)).toBe(4);
    expect(xpToLevel(1600)).toBe(5);
  });

  it('calculates XP required to reach the next level', () => {
    // xpForNextLevel(N) = N^2 * 100
    expect(xpForNextLevel(1)).toBe(100);
    expect(xpForNextLevel(2)).toBe(400);
    expect(xpForNextLevel(3)).toBe(900);
  });

  it('calculates percentage progress within current level (0 to 1)', () => {
    // At 0 XP (Level 1), progress = 0
    expect(xpProgress(0)).toBe(0);
    // At 50 XP (Level 1, range 0 to 100), progress = 0.5
    expect(xpProgress(50)).toBe(0.5);
    // At 100 XP (Level 2), progress = 0 (range 100 to 400)
    expect(xpProgress(100)).toBe(0);
    // At 250 XP (Level 2, range 100 to 400), progress = 150 / 300 = 0.5
    expect(xpProgress(250)).toBe(0.5);
  });
});
