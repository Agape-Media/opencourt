import { describe, expect, test } from 'bun:test';
import { rate } from '@/rating/glicko2';
import {
  DEFAULT_MARGIN_CONFIG,
  marginAdjustedScore,
  marginResult,
} from '@/rating/margin';
import { newPlayer, type Rating } from '@/rating/types';

describe('marginAdjustedScore', () => {
  test('a tie is exactly 0.5', () => {
    expect(marginAdjustedScore(11, 11)).toBe(0.5);
  });

  test('a win is above 0.5, a loss below, always inside (0, 1)', () => {
    const win = marginAdjustedScore(11, 5);
    const loss = marginAdjustedScore(5, 11);

    expect(win).toBeGreaterThan(0.5);
    expect(win).toBeLessThan(1);
    expect(loss).toBeLessThan(0.5);
    expect(loss).toBeGreaterThan(0);
  });

  test('a bigger margin scores higher than a narrow one', () => {
    expect(marginAdjustedScore(11, 0)).toBeGreaterThan(
      marginAdjustedScore(11, 9)
    );
  });

  test('winner and loser scores are complementary', () => {
    expect(marginAdjustedScore(11, 4) + marginAdjustedScore(4, 11)).toBeCloseTo(
      1,
      12
    );
  });

  test('a larger scale makes the same margin matter less', () => {
    const sharp = marginAdjustedScore(11, 3, { scale: 3 });
    const soft = marginAdjustedScore(11, 3, { scale: 12 });

    expect(sharp).toBeGreaterThan(soft);
    expect(soft).toBeGreaterThan(0.5);
  });
});

describe('marginResult with rate', () => {
  test('a blowout win moves the rating more than a narrow win', () => {
    const player = newPlayer();
    const opponent: Rating = { rating: 1500, rd: 80, volatility: 0.06 };

    const afterBlowout = rate(player, [marginResult(opponent, 11, 1)]);
    const afterSqueaker = rate(player, [marginResult(opponent, 11, 9)]);

    expect(afterBlowout.rating).toBeGreaterThan(afterSqueaker.rating);
    expect(afterSqueaker.rating).toBeGreaterThan(player.rating);
  });

  test('defaults are exposed and usable', () => {
    const result = marginResult(
      { rating: 1500, rd: 80, volatility: 0.06 },
      11,
      7
    );
    expect(result.score).toBeCloseTo(
      marginAdjustedScore(11, 7, DEFAULT_MARGIN_CONFIG),
      12
    );
  });
});
