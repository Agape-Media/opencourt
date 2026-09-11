/**
 * A faithful, dependency-free implementation of Mark Glickman's Glicko-2
 * rating system.
 *
 * Reference: Glickman, M. E. "Example of the Glicko-2 system" (Boston
 * University, 2022). http://www.glicko.net/glicko/glicko2.pdf
 *
 * The code follows the paper step by step and is verified against the paper's
 * own worked example (see `tests/unit/rating.test.ts`). Nothing here is a
 * black box: every constant and formula maps to a numbered step in the paper.
 */

import {
  DEFAULT_CONFIG,
  type GameResult,
  type Rating,
  type RatingConfig,
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

/**
 * Step 5 of the paper: find the new volatility with the "Illinois algorithm"
 * (a stable variant of regula falsi). This is the one part of Glicko-2 that
 * needs iteration; the loop is guaranteed to converge because A and B bracket
 * the answer from the start.
 */
function solveVolatility(
  delta: number,
  phi: number,
  v: number,
  volatility: number,
  tau: number,
  convergence: number
): number {
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
    }
    B = a - k * tau;
  }

  let fA = f(A);
  let fB = f(B);
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
  }

  return Math.exp(A / 2);
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
  const anchor = config.defaultRating;
  const phi = player.rd / SCALE;

  // Step 6, special case: a player who did not compete keeps their rating and
  // volatility, but their RD grows to reflect the added uncertainty.
  if (results.length === 0) {
    const phiStar = Math.sqrt(
      phi * phi + player.volatility * player.volatility
    );
    return {
      rating: player.rating,
      rd: SCALE * phiStar,
      volatility: player.volatility,
    };
  }

  // Step 2: convert the player onto the Glicko-2 working scale.
  const mu = (player.rating - anchor) / SCALE;

  // Steps 3 and 4: variance v and the estimated improvement delta.
  let invV = 0;
  let deltaSum = 0;
  for (const result of results) {
    const muJ = (result.opponent.rating - anchor) / SCALE;
    const phiJ = result.opponent.rd / SCALE;
    const gJ = g(phiJ);
    const eJ = expected(mu, muJ, phiJ);
    invV += gJ * gJ * eJ * (1 - eJ);
    deltaSum += gJ * (result.score - eJ);
  }
  const v = 1 / invV;
  const delta = v * deltaSum;

  // Step 5: new volatility.
  const volatility = solveVolatility(
    delta,
    phi,
    v,
    player.volatility,
    config.tau,
    config.convergence
  );

  // Step 6: pre-period RD, inflated by the new volatility.
  const phiStar = Math.sqrt(phi * phi + volatility * volatility);

  // Step 7: new RD and rating on the working scale.
  const phiPrime = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
  const muPrime = mu + phiPrime * phiPrime * deltaSum;

  // Step 8: convert back to the display scale.
  return {
    rating: SCALE * muPrime + anchor,
    rd: SCALE * phiPrime,
    volatility,
  };
}
