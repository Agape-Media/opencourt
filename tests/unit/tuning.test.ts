import { describe, expect, test } from 'bun:test';
import { evaluatePredictions, tuneTau } from '@/rating/calibration';
import { type PeriodGames, replayHistory } from '@/rating/history';
import { conservativeRating, leaderboard } from '@/rating/leaderboard';
import { newPlayer, type PeriodGame, type RatedPlayer } from '@/rating/types';

const IDS = ['a', 'b', 'c', 'd'] as const;
const SKILL: Record<(typeof IDS)[number], number> = { a: 4, b: 3, c: 2, d: 1 };

function roster(): RatedPlayer[] {
  return IDS.map((id) => ({ id, rating: newPlayer() }));
}

function roundRobin(): PeriodGame[] {
  const games: PeriodGame[] = [];
  for (let i = 0; i < IDS.length; i += 1) {
    for (let j = i + 1; j < IDS.length; j += 1) {
      games.push({
        playerA: IDS[i],
        playerB: IDS[j],
        scoreA: SKILL[IDS[i]] > SKILL[IDS[j]] ? 1 : 0,
      });
    }
  }
  return games;
}

const SEASON: PeriodGames[] = Array.from({ length: 10 }, roundRobin);

describe('replayHistory', () => {
  test('returns a snapshot per period and a final standing', () => {
    const result = replayHistory(roster(), SEASON);

    expect(result.snapshots).toHaveLength(SEASON.length);
    expect(result.final.get('a')?.rating).toBeGreaterThan(
      result.final.get('d')?.rating ?? 0
    );
  });

  test('final equals the last snapshot', () => {
    const result = replayHistory(roster(), SEASON);
    const last = result.snapshots[result.snapshots.length - 1];
    for (const id of IDS) {
      expect(result.final.get(id)?.rating).toBe(last.ratings.get(id)?.rating);
    }
  });
});

describe('calibration', () => {
  test('Brier and log-loss are non-negative and count every game', () => {
    const result = evaluatePredictions(roster(), SEASON);

    expect(result.sampleSize).toBe(SEASON.length * 6);
    expect(result.brier).toBeGreaterThanOrEqual(0);
    expect(result.logLoss).toBeGreaterThanOrEqual(0);
    // Predicting a fully consistent skill order should beat a coin flip
    // (Brier 0.25, log-loss ln 2 ≈ 0.693) once ratings have learned it.
    expect(result.brier).toBeLessThan(0.25);
    expect(result.logLoss).toBeLessThan(Math.LN2);
  });

  test('tuneTau returns candidates sorted best-first', () => {
    const results = tuneTau(roster(), SEASON, [0.2, 0.5, 1.2]);

    expect(results).toHaveLength(3);
    for (let i = 1; i < results.length; i += 1) {
      expect(results[i].logLoss).toBeGreaterThanOrEqual(results[i - 1].logLoss);
    }
  });
});

describe('leaderboard', () => {
  test('conservative rating discounts uncertainty', () => {
    const certain = { rating: 1600, rd: 40, volatility: 0.06 };
    const shaky = { rating: 1600, rd: 200, volatility: 0.06 };

    expect(conservativeRating(certain)).toBeGreaterThan(
      conservativeRating(shaky)
    );
  });

  test('a settled mid player can outrank a shaky higher-rated one', () => {
    const ratings = new Map([
      ['settled', { rating: 1650, rd: 45, volatility: 0.06 }],
      ['shaky', { rating: 1750, rd: 260, volatility: 0.06 }],
    ]);

    const ranked = leaderboard(ratings);

    expect(ranked[0].id).toBe('settled');
  });
});
