/**
 * Core types for the OpenCourt rating engine.
 *
 * Ratings are always expressed on the familiar public "Glicko" display scale
 * (a new player sits at 1500), never the internal Glicko-2 working scale.
 * Conversion to and from the internal scale happens inside `rate`, so callers
 * never have to think about it.
 */

/** A player's rating state at the start of a rating period. */
export type Rating = {
  /** Display rating on the Glicko scale (1500 for a new player). */
  readonly rating: number;
  /** Rating deviation: the ~68% uncertainty band, in display points. */
  readonly rd: number;
  /** Volatility: how erratic the player's recent results have been. */
  readonly volatility: number;
};

/**
 * One game's outcome, seen from the perspective of the player being rated.
 * The opponent's own volatility is never used, so it may be any value.
 */
export type GameResult = {
  /** The opponent's rating state at the start of the period. */
  readonly opponent: Rating;
  /** 1 for a win, 0 for a loss, 0.5 for a draw. */
  readonly score: number;
};

/**
 * Tunable constants. Every field has a sane default (see `DEFAULT_CONFIG`);
 * override per application after testing for predictive accuracy.
 */
export type RatingConfig = {
  /**
   * System constant tau. Constrains how fast volatility can move between
   * periods. Glickman suggests 0.3-1.2; smaller values keep ratings steadier
   * in the face of improbable results.
   */
  readonly tau: number;
  /** Rating given to a brand-new, unrated player. */
  readonly defaultRating: number;
  /** Rating deviation given to a brand-new player. */
  readonly defaultRd: number;
  /** Volatility given to a brand-new player. */
  readonly defaultVolatility: number;
  /** Convergence tolerance for the volatility solver. */
  readonly convergence: number;
  /**
   * Safety cap on iterations of the volatility solver. The paper's own
   * simulations never exceeded 19; this only guards against pathological or
   * malformed input, and exceeding it throws rather than looping forever.
   */
  readonly maxVolatilityIterations: number;
};

/**
 * Defaults from Glickman's Glicko-2 paper. `tau = 0.5` is a common middle
 * choice; tune it for your own competition before going live.
 */
export const DEFAULT_CONFIG: RatingConfig = {
  tau: 0.5,
  defaultRating: 1500,
  defaultRd: 350,
  defaultVolatility: 0.06,
  convergence: 1e-6,
  maxVolatilityIterations: 100,
};

/** Build the rating state for a brand-new player under the given config. */
export function newPlayer(config: RatingConfig = DEFAULT_CONFIG): Rating {
  return {
    rating: config.defaultRating,
    rd: config.defaultRd,
    volatility: config.defaultVolatility,
  };
}

/** A player identified by id, for rating a whole field over one period. */
export type RatedPlayer = {
  readonly id: string;
  readonly rating: Rating;
};

/** One singles game within a rating period, keyed by player id. */
export type PeriodGame = {
  readonly playerA: string;
  readonly playerB: string;
  /** Score for `playerA`: 1 win, 0 loss, 0.5 draw. B's score is the mirror. */
  readonly scoreA: number;
};

/**
 * One game's contribution to a rating change. Together, a full period's
 * contributions sum exactly to the total rating change, so nothing is hidden.
 */
export type GameContribution = {
  /** The opponent faced in this game. */
  readonly opponent: Rating;
  /** The actual score (1/0/0.5). */
  readonly score: number;
  /** The score the model expected beforehand (a win probability, 0..1). */
  readonly expected: number;
  /** How many display points this single game moved the rating. */
  readonly ratingContribution: number;
};

/**
 * A complete, auditable account of one rating update: the state before and
 * after, the net change, and a per-game breakdown of why. This is the
 * "why did my rating change?" answer, computed rather than asserted.
 */
export type RatingExplanation = {
  readonly before: Rating;
  readonly after: Rating;
  /** `after.rating - before.rating`, equal to the sum of contributions. */
  readonly ratingChange: number;
  readonly games: readonly GameContribution[];
};

/** Thrown when a rating input is malformed (bad score, negative RD, NaN...). */
export class RatingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RatingError';
  }
}
