/**
 * A faithful, dependency-free implementation of Mark Glickman's Glicko-2
 * rating system.
 *
 * Reference: Glickman, M. E. "Example of the Glicko-2 system" (Boston
 * University, 2022). http://www.glicko.net/glicko/glicko2.pdf
 *
 * The code follows the paper step by step and is verified against the paper's
 * own worked example (see `tests/unit/rating.test.ts`). Nothing here is a
 * black box: every constant and formula maps to a numbered step in the paper,
 * and `explainRating` exposes the per-game breakdown behind every change.
 */

import {
  DEFAULT_CONFIG,
  type GameContribution,
  type GameResult,
  type Rating,
  type RatingConfig,
  RatingError,
  type RatingExplanation,
} from '@/rating/types';

/** Fixed constant that maps the display scale to the Glicko-2 working scale. */
const SCALE = 173.7178;

/**
 * `g(phi)` from the paper: shrinks the weight of an opponent whose own rating
 * is uncertain (large RD).
 */
function g(phi: number): number {
  return 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
}

/**
 * `E(mu, muj, phij)` from the paper: the expected score (probability of a win)
 * of the player against one opponent, on the working scale.
 */
function expected(mu: number, muJ: number, phiJ: number): number {
  return 1 / (1 + Math.exp(-g(phiJ) * (mu - muJ)));
}

/** Reject a rating whose fields are missing, non-finite, or out of range. */
function assertValidRating(rating: Rating, label: string): void {
  if (!Number.isFinite(rating.rating)) {
    throw new RatingError(`${label}: rating must be a finite number`);
  }
  if (!Number.isFinite(rating.rd) || rating.rd <= 0) {
    throw new RatingError(
      `${label}: rd must be a finite number greater than 0`
    );
  }
  if (!Number.isFinite(rating.volatility) || rating.volatility <= 0) {
    throw new RatingError(
      `${label}: volatility must be finite and greater than 0`
    );
  }
}

/** Reject a score that is not a real number in the range 0..1. */
function assertValidScore(score: number): void {
  if (!Number.isFinite(score) || score < 0 || score > 1) {
    throw new RatingError(`score must be a number in [0, 1], got ${score}`);
  }
}

/**
 * Step 5 of the paper: find the new volatility with the "Illinois algorithm"
 * (a stable variant of regula falsi). This is the one part of Glicko-2 that
 * needs iteration; A and B bracket the answer from the start, so it always
 * converges. `maxIterations` is a safety net against malformed input.
 */
function solveVolatility(
  delta: number,
  phi: number,
  v: number,
  volatility: number,
  config: RatingConfig
): number {
  const { tau, convergence, maxVolatilityIterations } = config;
  const a = Math.log(volatility * volatility);
  const delta2 = delta * delta;
  const phi2 = phi * phi;

  const f = (x: number): number => {
    const ex = Math.exp(x);
    const numerator = ex * (delta2 - phi2 - v - ex);
    const denominator = 2 * (phi2 + v + ex) ** 2;
    return numerator / denominator - (x - a) / (tau * tau);
  };

  let A = a;
  let B: number;
  if (delta2 > phi2 + v) {
    B = Math.log(delta2 - phi2 - v);
  } else {
    let k = 1;
    while (f(a - k * tau) < 0) {
      k += 1;
      if (k > maxVolatilityIterations) {
        throw new RatingError('volatility bracket search failed to converge');
      }
    }
    B = a - k * tau;
  }

  let fA = f(A);
  let fB = f(B);
  let iterations = 0;
  while (Math.abs(B - A) > convergence) {
    const C = A + ((A - B) * fA) / (fB - fA);
    const fC = f(C);
    if (fC * fB <= 0) {
      A = B;
      fA = fB;
    } else {
      fA = fA / 2;
    }
    B = C;
    fB = fC;
    iterations += 1;
    if (iterations > maxVolatilityIterations) {
      throw new RatingError('volatility solver failed to converge');
    }
  }

  return Math.exp(A / 2);
}

/**
 * The shared engine behind `rate` and `explainRating`. Runs the full Glicko-2
 * update for one player over one period and records each game's contribution.
 */
function computeUpdate(
  player: Rating,
  results: readonly GameResult[],
  config: RatingConfig
): RatingExplanation {
  assertValidRating(player, 'player');

  const anchor = config.defaultRating;
  const phi = player.rd / SCALE;

  // Step 6, special case: a player who did not compete keeps their rating and
  // volatility, but their RD grows to reflect the added uncertainty.
  if (results.length === 0) {
    const phiStar = Math.sqrt(
      phi * phi + player.volatility * player.volatility
    );
    const after: Rating = {
      rating: player.rating,
      rd: SCALE * phiStar,
      volatility: player.volatility,
    };
    return { before: player, after, ratingChange: 0, games: [] };
  }

  // Step 2: convert the player onto the Glicko-2 working scale.
  const mu = (player.rating - anchor) / SCALE;

  // Steps 3 and 4: variance v and the estimated improvement delta, while
  // remembering each game's g, E and score for the explanation.
  let invV = 0;
  let deltaSum = 0;
  const perGame: { result: GameResult; gJ: number; eJ: number }[] = [];
  for (const result of results) {
    assertValidRating(result.opponent, 'opponent');
    assertValidScore(result.score);
    const muJ = (result.opponent.rating - anchor) / SCALE;
    const phiJ = result.opponent.rd / SCALE;
    const gJ = g(phiJ);
    const eJ = expected(mu, muJ, phiJ);
    invV += gJ * gJ * eJ * (1 - eJ);
    deltaSum += gJ * (result.score - eJ);
    perGame.push({ result, gJ, eJ });
  }
  const v = 1 / invV;
  const delta = v * deltaSum;

  // Step 5: new volatility.
  const volatility = solveVolatility(delta, phi, v, player.volatility, config);

  // Step 6: pre-period RD, inflated by the new volatility.
  const phiStar = Math.sqrt(phi * phi + volatility * volatility);

  // Step 7: new RD and rating on the working scale.
  const phiPrime = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
  const muPrime = mu + phiPrime * phiPrime * deltaSum;

  // Step 8: convert back to the display scale.
  const after: Rating = {
    rating: SCALE * muPrime + anchor,
    rd: SCALE * phiPrime,
    volatility,
  };

  // Each game's share of the change is the same phiPrime^2 * g * (s - E) term,
  // scaled to display points. These sum exactly to `after.rating - rating`.
  const factor = SCALE * phiPrime * phiPrime;
  const games: GameContribution[] = perGame.map(({ result, gJ, eJ }) => ({
    opponent: result.opponent,
    score: result.score,
    expected: eJ,
    ratingContribution: factor * gJ * (result.score - eJ),
  }));

  return {
    before: player,
    after,
    ratingChange: after.rating - player.rating,
    games,
  };
}

/**
 * Update one player's rating from every game they played in a single rating
 * period.
 *
 * Glicko-2 is designed to be run in periods, not one game at a time: collect
 * all of a player's games since the last update (the paper recommends an
 * average of 10-15 per player), then call `rate` once with all of them. A
 * player who did not compete still ages: pass an empty `results` array and
 * only their RD grows.
 *
 * To rate a whole field of players together, prefer `ratePeriod` from
 * `./period`, which guarantees everyone is scored from the same pre-period
 * ratings.
 *
 * @param player  The player's state at the start of the period.
 * @param results Every game the player played this period.
 * @param config  Tunables; defaults follow the paper.
 * @returns The player's new state at the end of the period.
 */
export function rate(
  player: Rating,
  results: readonly GameResult[],
  config: RatingConfig = DEFAULT_CONFIG
): Rating {
  return computeUpdate(player, results, config).after;
}

/**
 * Like `rate`, but returns a full, auditable breakdown: the before/after
 * state, the net change, and each game's individual contribution (expected vs
 * actual score, and the display points it added or removed). Use this to show
 * a player exactly why their rating moved.
 */
export function explainRating(
  player: Rating,
  results: readonly GameResult[],
  config: RatingConfig = DEFAULT_CONFIG
): RatingExplanation {
  return computeUpdate(player, results, config);
}
