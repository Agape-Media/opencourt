import { describe, expect, test } from 'bun:test';
import { rateDoublesGame, teamAsOpponent } from '@/rating/doubles';
import { newPlayer, type Rating } from '@/rating/types';

describe('teamAsOpponent', () => {
  test('a team collapses to the mean rating of its partners', () => {
    const opponent = teamAsOpponent([
      { rating: 1400, rd: 60, volatility: 0.06 },
      { rating: 1600, rd: 40, volatility: 0.06 },
    ]);

    expect(opponent.rating).toBe(1500);
    expect(opponent.rd).toBe(50); // mean strategy: (60 + 40) / 2
  });

  test('the rms strategy raises RD above the mean for uneven pairs', () => {
    const team: [Rating, Rating] = [
      { rating: 1400, rd: 60, volatility: 0.06 },
      { rating: 1600, rd: 40, volatility: 0.06 },
    ];

    const mean = teamAsOpponent(team, 'mean');
    const rms = teamAsOpponent(team, 'rms');

    expect(rms.rating).toBe(mean.rating);
    expect(rms.rd).toBeGreaterThan(mean.rd);
    expect(rms.rd).toBeCloseTo(Math.sqrt((60 * 60 + 40 * 40) / 2), 9);
  });
});

describe('rateDoublesGame', () => {
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
