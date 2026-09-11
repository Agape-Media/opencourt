/**
 * Turn a field of ratings into a ranked leaderboard.
 *
 * Ranking by raw rating alone flatters players whose number is still shaky. A
 * "conservative" rating (rating minus a margin of RD) ranks players by what we
 * are confident they are AT LEAST worth, so a new player on a hot streak does
 * not leapfrog a proven regular until their rating has settled.
 */

import type { Rating } from '@/rating/types';

/**
 * A rating discounted by its own uncertainty: `rating - k * rd`. With the
 * default `k = 2` this is the bottom of the ~95% confidence interval — a
 * "worth at least this much" figure. Set `k = 0` to rank by raw rating.
 */
export function conservativeRating(rating: Rating, k = 2): number {
  return rating.rating - k * rating.rd;
}

export type RankedPlayer = {
  readonly id: string;
  readonly rating: Rating;
  /** The `conservativeRating` used to sort; also the displayed rank score. */
  readonly conservative: number;
};

/**
 * Rank a field of players best-first by their conservative rating. Accepts the
 * map that `ratePeriod` / `replayHistory` return.
 */
export function leaderboard(
  ratings: ReadonlyMap<string, Rating>,
  k = 2
): RankedPlayer[] {
  return [...ratings.entries()]
    .map(([id, rating]) => ({
      id,
      rating,
      conservative: conservativeRating(rating, k),
    }))
    .sort((a, b) => b.conservative - a.conservative);
}
