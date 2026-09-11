/**
 * Rating-period orchestration.
 *
 * Glicko-2 updates a whole field of players at once, over a fixed "rating
 * period". The rule that makes it order-independent and fair is subtle and
 * easy to get wrong by hand: every player is scored against the ratings their
 * opponents held at the START of the period, not against ratings that have
 * already been updated mid-period. `ratePeriod` owns that bookkeeping so
 * callers cannot get it wrong.
 */

import { rate } from '@/rating/glicko2';
import {
  DEFAULT_CONFIG,
  type GameResult,
  type PeriodGame,
  type RatedPlayer,
  type Rating,
  type RatingConfig,
  RatingError,
} from '@/rating/types';

/**
 * Rate every player in a field over one rating period.
 *
 * Each game contributes a result to both players (mirrored score), always
 * using the pre-period ratings. Players who appear in `players` but play no
 * games are still returned, with their RD inflated per the paper — inactivity
 * increases uncertainty.
 *
 * @param players Every player and their state at the start of the period.
 * @param games   Every game played during the period, by player id.
 * @param config  Tunables; defaults follow the paper.
 * @returns A map from player id to their new rating state.
 * @throws RatingError on duplicate ids or games that reference unknown players.
 */
export function ratePeriod(
  players: readonly RatedPlayer[],
  games: readonly PeriodGame[],
  config: RatingConfig = DEFAULT_CONFIG
): Map<string, Rating> {
  const before = new Map<string, Rating>();
  const resultsByPlayer = new Map<string, GameResult[]>();
  for (const player of players) {
    if (before.has(player.id)) {
      throw new RatingError(`duplicate player id: ${player.id}`);
    }
    before.set(player.id, player.rating);
    resultsByPlayer.set(player.id, []);
  }

  for (const game of games) {
    const ratingA = before.get(game.playerA);
    const ratingB = before.get(game.playerB);
    const resultsA = resultsByPlayer.get(game.playerA);
    const resultsB = resultsByPlayer.get(game.playerB);
    if (!ratingA || !resultsA) {
      throw new RatingError(`game references unknown player: ${game.playerA}`);
    }
    if (!ratingB || !resultsB) {
      throw new RatingError(`game references unknown player: ${game.playerB}`);
    }
    resultsA.push({ opponent: ratingB, score: game.scoreA });
    resultsB.push({ opponent: ratingA, score: 1 - game.scoreA });
  }

  const after = new Map<string, Rating>();
  for (const player of players) {
    const results = resultsByPlayer.get(player.id) ?? [];
    after.set(player.id, rate(player.rating, results, config));
  }
  return after;
}
