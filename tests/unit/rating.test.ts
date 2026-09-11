import { describe, expect, test } from 'bun:test';
import { rateDoublesGame, teamAsOpponent } from '@/rating/doubles';
import { rate } from '@/rating/glicko2';
import { DEFAULT_CONFIG, newPlayer, type Rating } from '@/rating/types';

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

describe('doubles', () => {
  test('a team collapses to the mean of its partners', () => {
    const opponent = teamAsOpponent([
      { rating: 1400, rd: 60, volatility: 0.06 },
      { rating: 1600, rd: 40, volatility: 0.06 },
    ]);

    expect(opponent.rating).toBe(1500);
    expect(opponent.rd).toBe(50);
  });

  test('the winning pair rises and the losing pair falls', () => {
    const update = rateDoublesGame({
      teamA: [newPlayer(), newPlayer()],
      teamB: [newPlayer(), newPlayer()],
      scoreA: 1,
    });

    for (const player of update.teamA) {
      expect(player.rating).toBeGreaterThan(1500);
    }
    for (const player of update.teamB) {
      expect(player.rating).toBeLessThan(1500);
    }
  });

  test('on a win, the weaker partner gains more than the stronger one', () => {
    // Two partners of different strength beat an even pair. The lower-rated
    // partner should be rewarded more for the shared result.
    const strong: Rating = { rating: 1700, rd: 150, volatility: 0.06 };
    const weak: Rating = { rating: 1300, rd: 150, volatility: 0.06 };
    const update = rateDoublesGame({
      teamA: [strong, weak],
      teamB: [newPlayer(), newPlayer()],
      scoreA: 1,
    });

    const strongGain = update.teamA[0].rating - strong.rating;
    const weakGain = update.teamA[1].rating - weak.rating;

    expect(weakGain).toBeGreaterThan(strongGain);
  });
});
