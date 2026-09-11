// biome-ignore-all lint/suspicious/noConsole: this is a runnable demo script.
/**
 * A runnable demo. From the repo root:
 *
 *   bun rating/example.ts
 *
 * It plays a deterministic five-period round robin between six players of
 * known relative strength, then prints the leaderboard and shows how well the
 * ratings predicted results (and which tau predicted best).
 */

import { evaluatePredictions, tuneTau } from '@/rating/calibration';
import { type PeriodGames, replayHistory } from '@/rating/history';
import { leaderboard } from '@/rating/leaderboard';
import { newPlayer, type PeriodGame, type RatedPlayer } from '@/rating/types';
import { confidenceInterval } from '@/rating/utils';

const ROSTER = ['Ana', 'Ben', 'Cy', 'Di', 'Eve', 'Fin'] as const;

// Hidden "true" strengths; higher wins deterministically. Ana is best.
const TRUE_SKILL: Record<(typeof ROSTER)[number], number> = {
  Ana: 6,
  Ben: 5,
  Cy: 4,
  Di: 3,
  Eve: 2,
  Fin: 1,
};

function roundRobin(): PeriodGame[] {
  const games: PeriodGame[] = [];
  for (let i = 0; i < ROSTER.length; i += 1) {
    for (let j = i + 1; j < ROSTER.length; j += 1) {
      const a = ROSTER[i];
      const b = ROSTER[j];
      games.push({
        playerA: a,
        playerB: b,
        scoreA: TRUE_SKILL[a] > TRUE_SKILL[b] ? 1 : 0,
      });
    }
  }
  return games;
}

function main(): void {
  const players: RatedPlayer[] = ROSTER.map((id) => ({
    id,
    rating: newPlayer(),
  }));
  const periods: PeriodGames[] = Array.from({ length: 5 }, roundRobin);

  const { final } = replayHistory(players, periods);

  console.log('Leaderboard (ranked by conservative rating = rating - 2*RD):');
  for (const entry of leaderboard(final)) {
    const { low, high } = confidenceInterval(entry.rating);
    console.log(
      `  ${entry.id.padEnd(4)} ${entry.rating.rating.toFixed(0)} ` +
        `(95% CI ${low.toFixed(0)}-${high.toFixed(0)}) ` +
        `rank score ${entry.conservative.toFixed(0)}`
    );
  }

  const calibration = evaluatePredictions(players, periods);
  console.log(
    `\nPrediction quality over ${calibration.sampleSize} games: ` +
      `log-loss ${calibration.logLoss.toFixed(4)}, ` +
      `Brier ${calibration.brier.toFixed(4)} (lower is better).`
  );

  const taus = [0.2, 0.3, 0.5, 0.8, 1.2];
  const best = tuneTau(players, periods, taus)[0];
  console.log(
    `Best tau of {${taus.join(', ')}}: ${best.tau} ` +
      `(log-loss ${best.logLoss.toFixed(4)}).`
  );
}

if (import.meta.main) {
  main();
}
