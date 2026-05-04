/**
 * Use Case: Progressive XP and Leveling System
 * Centralizes the mathematics of player progression.
 */

export interface LevelInfo {
  level: number;
  xpInLevel: number;
  xpForNext: number;
  progress: number;
}

export const xpUseCase = {
  /**
   * Calculates level based on total points.
   * Logic: Each level requires 10% more XP than the previous one.
   * Base Level 1: 0-1000 points.
   */
  calculateLevel: (points: number = 0): LevelInfo => {
    let level = 1;
    let threshold = 1000;
    let accumulated = 0;

    while (points >= threshold) {
      accumulated = threshold;
      level++;
      threshold = Math.floor(threshold * 1.5); // Exponential growth
    }

    const xpInLevel = points - accumulated;
    const xpForNext = threshold - accumulated;
    const progress = Math.min((xpInLevel / xpForNext) * 100, 100);

    return {
      level,
      xpInLevel,
      xpForNext,
      progress
    };
  },

  /**
   * Validates if a reward is within security bounds.
   */
  isValidReward: (points: number): boolean => {
    return points > 0 && points <= 1000;
  }
};
