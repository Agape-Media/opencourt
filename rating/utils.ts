/**
 * Read-only helpers that turn a rating into the things players and UIs
 * actually want: a win probability, an honest confidence range, and whether a
 * rating is still provisional. None of these change a rating; they only
 * interpret one.
 */

import type { Rating } from '@/rating/types';

/** Maps the display scale to the Glicko-2 working scale (see glicko2.ts). */
const SCALE = 173.7178;

function g(phi: number): number {
  return 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
}

/**
 * The probability that `player` beats `opponent` in a single game, accounting
 * for BOTH players' uncertainty (a match between two shaky ratings is closer
 * to a coin flip than the raw rating gap suggests). Returns a value in 0..1.
 */
export function winProbability(player: Rating, opponent: Rating): number {
  // The anchor cancels in the difference, so any fixed origin works.
  const mu = player.rating / SCALE;
  const muOpponent = opponent.rating / SCALE;
  const phi = Math.sqrt((player.rd / SCALE) ** 2 + (opponent.rd / SCALE) ** 2);
  return 1 / (1 + Math.exp(-g(phi) * (mu - muOpponent)));
}

/**
 * A ~95% confidence interval for a player's true strength: rating ± 2 × RD,
 * exactly as the paper defines it. Show this instead of a bare number so new
 * and inactive players are never presented as more certain than they are.
 */
export function confidenceInterval(rating: Rating): {
  readonly low: number;
  readonly high: number;
} {
  return {
    low: rating.rating - 2 * rating.rd,
    high: rating.rating + 2 * rating.rd,
  };
}

/**
 * Whether a rating is still provisional (too uncertain to treat as settled).
 * The default threshold of RD > 100 is a common convention, not a law — tune
 * it, or drop it in favour of showing the confidence interval directly.
 */
export function isProvisional(rating: Rating, rdThreshold = 100): boolean {
  return rating.rd > rdThreshold;
}
