/**
 * Optional, NON-CANONICAL inactivity decay.
 *
 * Glicko-2 on its own never moves an idle player's rating — it only grows
 * their RD (call `rate` with no games). That is mathematically correct: sitting
 * out is not evidence of getting worse, only of growing uncertainty.
 *
 * But real communities often ask for more: a player who has not touched a
 * court in years should not keep squatting on a high rating in rating-gated
 * open play (this was a specific, repeated request from players). Decay pulls a
 * long-idle rating gently back toward the mean.
 *
 * This is a deliberate policy choice layered ON TOP of Glicko-2, kept in its
 * own file and OFF by default, because reasonable people disagree about
 * whether — and how fast — ratings should decay. Treat it as a starting point
 * to argue with, not settled truth.
 */

import { DEFAULT_CONFIG, type Rating, type RatingConfig } from '@/rating/types';

export type DecayConfig = {
  /**
   * Fraction of the gap between the player's rating and the mean removed per
   * idle period. 0 disables decay entirely; 0.1 removes ~10% of the gap each
   * idle period; 1 snaps straight to the mean.
   */
  readonly ratePerPeriod: number;
  /**
   * Idle periods to forgive before any decay starts. A player is not punished
   * for missing a week or two.
   */
  readonly gracePeriods: number;
};

/** Decay turned off. This is the default everywhere. */
export const NO_DECAY: DecayConfig = { ratePerPeriod: 0, gracePeriods: 0 };

/**
 * Pull a rating toward the mean after a stretch of inactivity. Only the rating
 * moves; RD and volatility are untouched here, because RD growth is already
 * handled by `rate` when a player sits out a period. Returns the input
 * unchanged when decay is off or still within the grace window.
 *
 * @param rating       The player's current rating state.
 * @param idlePeriods  How many rating periods the player has now missed.
 * @param decayConfig  The decay policy (see `DecayConfig`).
 * @param config       Provides the mean (`defaultRating`) to decay toward.
 */
export function decay(
  rating: Rating,
  idlePeriods: number,
  decayConfig: DecayConfig,
  config: RatingConfig = DEFAULT_CONFIG
): Rating {
  const effectivePeriods = idlePeriods - decayConfig.gracePeriods;
  if (effectivePeriods <= 0 || decayConfig.ratePerPeriod <= 0) {
    return rating;
  }
  const clampedRate = Math.min(decayConfig.ratePerPeriod, 1);
  const mean = config.defaultRating;
  const kept = (1 - clampedRate) ** effectivePeriods;
  return { ...rating, rating: mean + (rating.rating - mean) * kept };
}
