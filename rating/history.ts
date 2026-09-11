/**
 * Replay a season of games, period by period.
 *
 * A rating engine is only trustworthy if you can reproduce it: feed the same
 * match history in and get the same ratings out. `replayHistory` runs each
 * rating period in order, carrying ratings forward, and hands back both the
 * final standings and a snapshot after every period (a rating trajectory you
 * can chart or audit).
 */

import { ratePeriod } from '@/rating/period';
import {
  DEFAULT_CONFIG,
  type PeriodGame,
  type RatedPlayer,
  type Rating,
  type RatingConfig,
} from '@/rating/types';

/** The games that make up one rating period. */
export type PeriodGames = readonly PeriodGame[];

/** Ratings for the whole field after a given period. */
export type HistorySnapshot = {
  /** Zero-based index of the period this snapshot follows. */
  readonly period: number;
  readonly ratings: Map<string, Rating>;
};

export type ReplayResult = {
  /** Final ratings after the last period. */
  readonly final: Map<string, Rating>;
  /** Ratings after each period, in order (the trajectory). */
  readonly snapshots: readonly HistorySnapshot[];
};

/**
 * Replay a fixed roster of players across an ordered list of rating periods.
 *
 * The roster is fixed up front: include every player in `players` from the
 * start (unrated newcomers simply age until their first game). Any game that
 * names an id not in the roster throws, via `ratePeriod`.
 */
export function replayHistory(
  players: readonly RatedPlayer[],
  periods: readonly PeriodGames[],
  config: RatingConfig = DEFAULT_CONFIG
): ReplayResult {
  let current: RatedPlayer[] = players.map((player) => ({ ...player }));
  const snapshots: HistorySnapshot[] = [];

  periods.forEach((games, index) => {
    const updated = ratePeriod(current, games, config);
    current = current.map((player) => ({
      id: player.id,
      rating: updated.get(player.id) ?? player.rating,
    }));
    snapshots.push({ period: index, ratings: new Map(updated) });
  });

  const final = new Map<string, Rating>();
  for (const player of current) {
    final.set(player.id, player.rating);
  }
  return { final, snapshots };
}
