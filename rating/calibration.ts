/**
 * Measure how well the ratings actually PREDICT results, and tune the system
 * constant tau against real data.
 *
 * Glickman is explicit that tau "should be tested to decide which value
 * results in greatest predictive accuracy." A rating system you cannot score
 * against real outcomes is a rating system you cannot trust. This module gives
 * you that score.
 *
 * The evaluation is honest (out-of-sample within each period): every game is
 * predicted from the ratings the players held at the START of its period,
 * BEFORE that period's results are folded in. So a prediction is never allowed
 * to peek at the outcome it is being graded on.
 */

import type { PeriodGames } from '@/rating/history';
import { ratePeriod } from '@/rating/period';
import {
  DEFAULT_CONFIG,
  type RatedPlayer,
  type Rating,
  type RatingConfig,
} from '@/rating/types';
import { winProbability } from '@/rating/utils';

/** Guards log-loss against an infinite penalty on a 0 or 1 prediction. */
const EPS = 1e-15;

export type Calibration = {
  /** Mean squared error of the predicted win probability. Lower is better. */
  readonly brier: number;
  /** Mean log-loss (cross-entropy). Lower is better; the primary metric. */
  readonly logLoss: number;
  /** How many games were scored. */
  readonly sampleSize: number;
};

/**
 * Replay a history and grade the ratings' predictions against what actually
 * happened. Returns Brier score and log-loss over every game.
 */
export function evaluatePredictions(
  players: readonly RatedPlayer[],
  periods: readonly PeriodGames[],
  config: RatingConfig = DEFAULT_CONFIG
): Calibration {
  let current = new Map<string, Rating>(
    players.map((player) => [player.id, player.rating])
  );
  let squaredError = 0;
  let logLoss = 0;
  let sampleSize = 0;

  for (const games of periods) {
    // Grade predictions using pre-period ratings, before any update.
    for (const game of games) {
      const ratingA = current.get(game.playerA);
      const ratingB = current.get(game.playerB);
      if (!ratingA || !ratingB) {
        continue;
      }
      const predicted = winProbability(ratingA, ratingB);
      const actual = game.scoreA;
      squaredError += (predicted - actual) ** 2;
      const clamped = Math.min(Math.max(predicted, EPS), 1 - EPS);
      logLoss -=
        actual * Math.log(clamped) + (1 - actual) * Math.log(1 - clamped);
      sampleSize += 1;
    }

    // Now fold in this period's results for the next period's predictions.
    const roster: RatedPlayer[] = [...current].map(([id, rating]) => ({
      id,
      rating,
    }));
    current = ratePeriod(roster, games, config);
  }

  if (sampleSize === 0) {
    return { brier: 0, logLoss: 0, sampleSize: 0 };
  }
  return {
    brier: squaredError / sampleSize,
    logLoss: logLoss / sampleSize,
    sampleSize,
  };
}

export type TauResult = {
  readonly tau: number;
  readonly logLoss: number;
  readonly brier: number;
};

/**
 * Score a range of candidate tau values against a history and return them
 * sorted best-first (lowest log-loss). Use it to pick tau for your own
 * competition instead of guessing.
 */
export function tuneTau(
  players: readonly RatedPlayer[],
  periods: readonly PeriodGames[],
  candidateTaus: readonly number[],
  baseConfig: RatingConfig = DEFAULT_CONFIG
): TauResult[] {
  return candidateTaus
    .map((tau) => {
      const result = evaluatePredictions(players, periods, {
        ...baseConfig,
        tau,
      });
      return { tau, logLoss: result.logLoss, brier: result.brier };
    })
    .sort((a, b) => a.logLoss - b.logLoss);
}
