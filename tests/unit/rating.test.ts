import { describe, expect, test } from 'bun:test';
import { decay, NO_DECAY } from '@/rating/decay';
import { explainRating, rate } from '@/rating/glicko2';
import {
  DEFAULT_CONFIG,
  newPlayer,
  type Rating,
  RatingError,
} from '@/rating/types';
import {
  confidenceInterval,
  isProvisional,
  winProbability,
} from '@/rating/utils';

describe('glicko2 rate', () => {
  test('reproduces the worked example from Glickman (2022)', () => {
    // The canonical example from the Glicko-2 paper:
    // a 1500 / RD 200 player beats 1400 (RD 30), then loses to
    // 1550 (RD 100) and 1700 (RD 300), with tau = 0.5.
    // The paper's answer: rating 1464.06, RD 151.52, volatility 0.05999.
    const player: Rating = { rating: 1500, rd: 200, volatility: 0.06 };
    const result = rate(
      player,
      [
        { opponent: { rating: 1400, rd: 30, volatility: 0.06 }, score: 1 },
        { opponent: { rating: 1550, rd: 100, volatility: 0.06 }, score: 0 },
        { opponent: { rating: 1700, rd: 300, volatility: 0.06 }, score: 0 },
      ],
      DEFAULT_CONFIG
    );

    expect(result.rating).toBeCloseTo(1464.06, 1);
    expect(result.rd).toBeCloseTo(151.52, 1);
    expect(result.volatility).toBeCloseTo(0.05999, 4);
  });

  test('a player who does not compete keeps rating but gains RD', () => {
    const player: Rating = { rating: 1500, rd: 200, volatility: 0.06 };
    const result = rate(player, [], DEFAULT_CONFIG);

    expect(result.rating).toBe(1500);
    expect(result.volatility).toBe(0.06);
    expect(result.rd).toBeGreaterThan(200);
  });

  test('winning raises the rating, losing lowers it', () => {
    const player = newPlayer();
    const opponent = newPlayer();

    const afterWin = rate(player, [{ opponent, score: 1 }]);
    const afterLoss = rate(player, [{ opponent, score: 0 }]);

    expect(afterWin.rating).toBeGreaterThan(player.rating);
    expect(afterLoss.rating).toBeLessThan(player.rating);
  });

  test('playing games shrinks RD (uncertainty falls)', () => {
    const player = newPlayer();
    const opponent = newPlayer();

    const result = rate(player, [{ opponent, score: 1 }]);

    expect(result.rd).toBeLessThan(player.rd);
  });
});

describe('glicko2 invariants', () => {
  test('a better result never lowers the rating (monotonic in score)', () => {
    const player = newPlayer();
    const opponent: Rating = { rating: 1600, rd: 80, volatility: 0.06 };
    const scores = [0, 0.25, 0.5, 0.75, 1];

    let previous = Number.NEGATIVE_INFINITY;
    for (const score of scores) {
      const result = rate(player, [{ opponent, score }]);
      expect(result.rating).toBeGreaterThanOrEqual(previous);
      previous = result.rating;
    }
  });

  test('RD and volatility stay positive and finite', () => {
    const player: Rating = { rating: 2100, rd: 40, volatility: 0.09 };
    const opponent: Rating = { rating: 900, rd: 300, volatility: 0.06 };

    // A wildly improbable result (huge favourite loses) must not break math.
    const result = rate(player, [{ opponent, score: 0 }]);

    expect(Number.isFinite(result.rating)).toBe(true);
    expect(result.rd).toBeGreaterThan(0);
    expect(result.volatility).toBeGreaterThan(0);
  });

  test('beating a stronger opponent gains more than beating a weaker one', () => {
    const player = newPlayer();
    const weak: Rating = { rating: 1300, rd: 60, volatility: 0.06 };
    const strong: Rating = { rating: 1700, rd: 60, volatility: 0.06 };

    const overWeak = rate(player, [{ opponent: weak, score: 1 }]);
    const overStrong = rate(player, [{ opponent: strong, score: 1 }]);

    expect(overStrong.rating).toBeGreaterThan(overWeak.rating);
  });
});

describe('explainRating', () => {
  test('per-game contributions sum to the total rating change', () => {
    const player = newPlayer();
    const explanation = explainRating(player, [
      { opponent: { rating: 1400, rd: 80, volatility: 0.06 }, score: 1 },
      { opponent: { rating: 1600, rd: 120, volatility: 0.06 }, score: 0 },
      { opponent: { rating: 1500, rd: 200, volatility: 0.06 }, score: 1 },
    ]);

    const summed = explanation.games.reduce(
      (total, game) => total + game.ratingContribution,
      0
    );

    expect(summed).toBeCloseTo(explanation.ratingChange, 6);
    expect(explanation.after.rating - explanation.before.rating).toBeCloseTo(
      explanation.ratingChange,
      6
    );
  });

  test('expected scores are probabilities in [0, 1]', () => {
    const explanation = explainRating(newPlayer(), [
      { opponent: { rating: 2000, rd: 50, volatility: 0.06 }, score: 0 },
      { opponent: { rating: 1000, rd: 50, volatility: 0.06 }, score: 1 },
    ]);

    for (const game of explanation.games) {
      expect(game.expected).toBeGreaterThanOrEqual(0);
      expect(game.expected).toBeLessThanOrEqual(1);
    }
  });
});

describe('input validation', () => {
  test('rejects an out-of-range score', () => {
    expect(() =>
      rate(newPlayer(), [{ opponent: newPlayer(), score: 2 }])
    ).toThrow(RatingError);
  });

  test('rejects a non-positive RD', () => {
    const broken: Rating = { rating: 1500, rd: 0, volatility: 0.06 };
    expect(() => rate(broken, [{ opponent: newPlayer(), score: 1 }])).toThrow(
      RatingError
    );
  });

  test('rejects a non-finite rating', () => {
    const broken: Rating = { rating: Number.NaN, rd: 50, volatility: 0.06 };
    expect(() => rate(broken, [])).toThrow(RatingError);
  });
});

describe('utils', () => {
  test('equal players are a coin flip', () => {
    expect(winProbability(newPlayer(), newPlayer())).toBeCloseTo(0.5, 6);
  });

  test('win probabilities are complementary and ordered', () => {
    const favourite: Rating = { rating: 1800, rd: 50, volatility: 0.06 };
    const underdog: Rating = { rating: 1400, rd: 50, volatility: 0.06 };

    const pFavourite = winProbability(favourite, underdog);
    const pUnderdog = winProbability(underdog, favourite);

    expect(pFavourite).toBeGreaterThan(0.5);
    expect(pFavourite + pUnderdog).toBeCloseTo(1, 6);
  });

  test('confidence interval is rating +/- 2 RD', () => {
    const { low, high } = confidenceInterval({
      rating: 1500,
      rd: 80,
      volatility: 0.06,
    });
    expect(low).toBe(1340);
    expect(high).toBe(1660);
  });

  test('a fresh player is provisional; a settled one is not', () => {
    expect(isProvisional(newPlayer())).toBe(true);
    expect(isProvisional({ rating: 1500, rd: 45, volatility: 0.06 })).toBe(
      false
    );
  });
});

describe('decay', () => {
  test('is a no-op when disabled', () => {
    const player: Rating = { rating: 1800, rd: 90, volatility: 0.06 };
    expect(decay(player, 10, NO_DECAY)).toEqual(player);
  });

  test('pulls a long-idle rating toward the mean, but not past it', () => {
    const player: Rating = { rating: 1800, rd: 90, volatility: 0.06 };
    const config = { ratePerPeriod: 0.2, gracePeriods: 1 };

    const decayed = decay(player, 5, config);

    expect(decayed.rating).toBeLessThan(player.rating);
    expect(decayed.rating).toBeGreaterThan(DEFAULT_CONFIG.defaultRating);
    // RD is untouched here; growth is handled by rate() on idle periods.
    expect(decayed.rd).toBe(player.rd);
  });

  test('does nothing within the grace window', () => {
    const player: Rating = { rating: 1800, rd: 90, volatility: 0.06 };
    const config = { ratePerPeriod: 0.5, gracePeriods: 3 };
    expect(decay(player, 3, config)).toEqual(player);
  });
});
