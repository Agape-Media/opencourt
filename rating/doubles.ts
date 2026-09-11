/**
 * Doubles-aware layer on top of Glicko-2.
 *
 * Pickleball is played mostly as doubles, but a rating belongs to a person,
 * not a pairing. DUPR solves this privately; this file solves it in the open.
 *
 * The model, stated plainly so it can be argued with:
 *
 *   1. Each side of a doubles game is collapsed into ONE synthetic opponent
 *      (`teamAsOpponent`). Its rating is the mean of the two partners'
 *      ratings; its RD is the mean of their RDs.
 *   2. Every player is then updated with the ordinary Glicko-2 `rate`, as if
 *      they had played that one synthetic opponent, with the score their team
 *      earned.
 *
 * Consequences worth knowing:
 *   - Both partners share the same opponent and score, but their rating
 *     changes still differ, because Glicko-2 weights the change by each
 *     player's own rating and RD. Beating a strong pair lifts the weaker
 *     partner more than the stronger one. This is the behaviour we want.
 *   - Averaging the partners is the simplest defensible choice, not the only
 *     one. See "Open questions" in README.md; this layer is meant to be a
 *     starting point the community refines, per the OpenCourt manifesto.
 *
 * As with singles, Glicko-2 works best in rating PERIODS. For a real league,
 * gather each player's synthetic opponents across all their games in the
 * period and call `rate` once (see `doublesResults`), rather than calling
 * `rateDoublesGame` game by game.
 */

import { rate } from '@/rating/glicko2';
import {
  DEFAULT_CONFIG,
  type GameResult,
  type Rating,
  type RatingConfig,
} from '@/rating/types';

/** A doubles side: exactly two players. */
export type Team = readonly [Rating, Rating];

/** A single doubles game between two sides. */
export type DoublesGame = {
  readonly teamA: Team;
  readonly teamB: Team;
  /** 1 if team A won, 0 if team B won, 0.5 for a tie. */
  readonly scoreA: number;
};

/** Updated ratings for all four players after a doubles game. */
export type DoublesUpdate = {
  readonly teamA: readonly [Rating, Rating];
  readonly teamB: readonly [Rating, Rating];
};

/**
 * Collapse a doubles side into the single synthetic opponent that the other
 * side is treated as having played. The returned volatility is the partners'
 * mean, but note that an opponent's volatility never affects Glicko-2 math.
 */
export function teamAsOpponent(team: Team): Rating {
  const [a, b] = team;
  return {
    rating: (a.rating + b.rating) / 2,
    rd: (a.rd + b.rd) / 2,
    volatility: (a.volatility + b.volatility) / 2,
  };
}

/**
 * Turn one player's doubles game into the `GameResult` they would feed into
 * `rate`: their side's score against the opposing side as a synthetic
 * opponent. Collect these across a period, then call `rate` once.
 */
export function doublesResult(opposingTeam: Team, score: number): GameResult {
  return { opponent: teamAsOpponent(opposingTeam), score };
}

/**
 * Convenience for the single-game case: update all four players from one
 * doubles game. Prefer accumulating `doublesResult`s over a period and calling
 * `rate` once when you have the games to do so.
 */
export function rateDoublesGame(
  game: DoublesGame,
  config: RatingConfig = DEFAULT_CONFIG
): DoublesUpdate {
  const [a1, a2] = game.teamA;
  const [b1, b2] = game.teamB;
  const opponentForA = teamAsOpponent(game.teamB);
  const opponentForB = teamAsOpponent(game.teamA);
  const scoreB = 1 - game.scoreA;

  return {
    teamA: [
      rate(a1, [{ opponent: opponentForA, score: game.scoreA }], config),
      rate(a2, [{ opponent: opponentForA, score: game.scoreA }], config),
    ],
    teamB: [
      rate(b1, [{ opponent: opponentForB, score: scoreB }], config),
      rate(b2, [{ opponent: opponentForB, score: scoreB }], config),
    ],
  };
}
