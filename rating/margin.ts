/**
 * OUR TAKE on score margin — an OPT-IN, EXPERIMENTAL extension.
 *
 * Canonical Glicko-2 only knows win / loss / draw. But in pickleball an 11-0
 * and an 11-9 are both "a win", and many players feel that is too blunt: a
 * blowout looks like stronger evidence of a skill gap than a two-point
 * squeaker. This module folds the score margin into the result.
 *
 * How (stated plainly so it can be argued with):
 *   We keep Glicko-2 completely untouched and instead feed it a "soft" score.
 *   Glicko-2 already accepts any score in [0, 1], not just 0/0.5/1, and treats
 *   it as the fraction of the game the player is judged to have won. So we map
 *   the margin onto that range:
 *
 *     effectiveScore = 0.5 + 0.5 * sign(diff) * tanh(|diff| / scale)
 *
 *   - A tie (diff 0) gives exactly 0.5, same as canonical Glicko-2.
 *   - A narrow win gives a bit over 0.5; a blowout approaches (but never
 *     reaches) 1.0. Losses mirror this below 0.5.
 *   - `scale` sets how quickly margin saturates. Larger `scale` = margin
 *     matters less. It is a tuning knob, not a truth.
 *
 * IMPORTANT HONESTY: this is a heuristic, NOT derived from the Glicko-2
 * likelihood. Glickman intends the fractional score as an expected-score
 * target, so using margin as a pseudo-score is a modelling choice of ours.
 * It also has real downsides — pickleball margins are noisy (a strong team may
 * coast at 11-4, or run it up), and too small a `scale` will over-react to
 * blowouts. That is exactly why it is opt-in and off the main engine.
 *
 * Do not adopt it on faith: use `evaluatePredictions` / `tuneTau` from
 * `./calibration` to check whether feeding margins actually improves
 * prediction on YOUR data before turning it on.
 */

import type { GameResult, Rating } from '@/rating/types';

export type MarginConfig = {
  /**
   * Point margin at which the result is treated as ~76% of the way to a total
   * blowout (tanh(1)). Default 6 suits games to 11. Raise it to make margin
   * matter less, lower it to make it matter more.
   */
  readonly scale: number;
};

/** A sensible starting point for games to 11. Tune it against your own data. */
export const DEFAULT_MARGIN_CONFIG: MarginConfig = { scale: 6 };

/**
 * Convert a final score line into a Glicko-2 score in [0, 1], softened by the
 * margin. `pointsFor` / `pointsAgainst` are from the rated player's side.
 */
export function marginAdjustedScore(
  pointsFor: number,
  pointsAgainst: number,
  config: MarginConfig = DEFAULT_MARGIN_CONFIG
): number {
  const diff = pointsFor - pointsAgainst;
  if (diff === 0) {
    return 0.5;
  }
  const sign = diff > 0 ? 1 : -1;
  return 0.5 + 0.5 * sign * Math.tanh(Math.abs(diff) / config.scale);
}

/**
 * Build a `GameResult` from a final score line, with the margin folded in.
 * Slots straight into `rate` / `ratePeriod`, and composes with doubles: pass
 * a synthetic team opponent from `teamAsOpponent`.
 */
export function marginResult(
  opponent: Rating,
  pointsFor: number,
  pointsAgainst: number,
  config: MarginConfig = DEFAULT_MARGIN_CONFIG
): GameResult {
  return {
    opponent,
    score: marginAdjustedScore(pointsFor, pointsAgainst, config),
  };
}
