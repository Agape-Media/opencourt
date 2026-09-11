import { describe, expect, test } from 'bun:test';
import { ratePeriod } from '@/rating/period';
import {
  newPlayer,
  type PeriodGame,
  type RatedPlayer,
  RatingError,
} from '@/rating/types';

function field(ids: readonly string[]): RatedPlayer[] {
  return ids.map((id) => ({ id, rating: newPlayer() }));
}

describe('ratePeriod', () => {
  test('is independent of the order games are listed', () => {
    const players = field(['a', 'b', 'c', 'd']);
    const games: PeriodGame[] = [
      { playerA: 'a', playerB: 'b', scoreA: 1 },
      { playerA: 'c', playerB: 'd', scoreA: 0 },
      { playerA: 'a', playerB: 'c', scoreA: 1 },
      { playerA: 'b', playerB: 'd', scoreA: 0.5 },
    ];
    const reversed = [...games].reverse();

    const first = ratePeriod(players, games);
    const second = ratePeriod(players, reversed);

    for (const { id } of players) {
      expect(second.get(id)?.rating).toBeCloseTo(
        first.get(id)?.rating ?? Number.NaN,
        9
      );
    }
  });

  test('scores everyone from pre-period ratings, so results are mutual', () => {
    const players = field(['winner', 'loser']);
    const result = ratePeriod(players, [
      { playerA: 'winner', playerB: 'loser', scoreA: 1 },
    ]);

    expect(result.get('winner')?.rating).toBeGreaterThan(1500);
    expect(result.get('loser')?.rating).toBeLessThan(1500);
  });

  test('inactive players are returned with inflated RD', () => {
    const players = field(['active1', 'active2', 'benched']);
    const result = ratePeriod(players, [
      { playerA: 'active1', playerB: 'active2', scoreA: 1 },
    ]);

    const benched = result.get('benched');
    expect(benched?.rating).toBe(1500);
    expect(benched?.rd).toBeGreaterThan(newPlayer().rd);
  });

  test('rejects a game that references an unknown player', () => {
    expect(() =>
      ratePeriod(field(['a']), [{ playerA: 'a', playerB: 'ghost', scoreA: 1 }])
    ).toThrow(RatingError);
  });

  test('rejects duplicate player ids', () => {
    const dupes: RatedPlayer[] = [
      { id: 'a', rating: newPlayer() },
      { id: 'a', rating: newPlayer() },
    ];
    expect(() => ratePeriod(dupes, [])).toThrow(RatingError);
  });
});

describe('ratePeriod season simulation', () => {
  test('a fixed skill order emerges and RDs settle over many periods', () => {
    // Four players with hidden "true" skills. Each period they all play a
    // round robin; the higher true skill wins deterministically. Over a
    // season, ratings should sort into the true order and RDs should shrink.
    const ids = ['strong', 'good', 'average', 'weak'] as const;
    const trueSkill: Record<(typeof ids)[number], number> = {
      strong: 4,
      good: 3,
      average: 2,
      weak: 1,
    };

    let state: RatedPlayer[] = ids.map((id) => ({ id, rating: newPlayer() }));

    for (let period = 0; period < 15; period += 1) {
      const games: PeriodGame[] = [];
      for (let i = 0; i < ids.length; i += 1) {
        for (let j = i + 1; j < ids.length; j += 1) {
          const a = ids[i];
          const b = ids[j];
          games.push({
            playerA: a,
            playerB: b,
            scoreA: trueSkill[a] > trueSkill[b] ? 1 : 0,
          });
        }
      }
      const updated = ratePeriod(state, games);
      state = ids.map((id) => ({
        id,
        rating: updated.get(id) ?? newPlayer(),
      }));
    }

    const byId = new Map(state.map((p) => [p.id, p.rating]));
    const strong = byId.get('strong');
    const good = byId.get('good');
    const average = byId.get('average');
    const weak = byId.get('weak');

    expect(strong?.rating).toBeGreaterThan(good?.rating ?? 0);
    expect(good?.rating).toBeGreaterThan(average?.rating ?? 0);
    expect(average?.rating).toBeGreaterThan(weak?.rating ?? 0);

    // Everyone has played a lot, so uncertainty should be well down.
    for (const rating of byId.values()) {
      expect(rating.rd).toBeLessThan(150);
      expect(Number.isFinite(rating.rating)).toBe(true);
    }
  });
});
