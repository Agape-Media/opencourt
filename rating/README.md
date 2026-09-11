# OpenCourt rating engine

A transparent, dependency-free rating engine for pickleball. Every number it
produces can be traced to a published formula — there are no hidden steps.

It is built on [Glicko-2](http://www.glicko.net/glicko/glicko2.pdf), Mark
Glickman's published, peer-reviewed successor to Elo. Glicko-2 is a good fit
for a community rating system because it is fully documented, gives every
player an explicit **uncertainty** (not just a number), and its every step can
be read and checked against the paper.

This module is a starting point offered for discussion, not a finished
standard. The doubles layer and the decay policy in particular make modelling
choices that the community should challenge and improve — see
[Open questions](#open-questions).

## What you get

| File | What it is |
| --- | --- |
| `glicko2.ts` | The Glicko-2 core: `rate`, plus `explainRating` for per-game "why did it change?" breakdowns. Verified against the paper. |
| `period.ts` | `ratePeriod` — rate a whole field at once, correctly, from everyone's pre-period ratings. |
| `doubles.ts` | A doubles-aware layer that rates individual players from doubles games, with selectable team strategies. |
| `utils.ts` | `winProbability`, `confidenceInterval`, `isProvisional` — read-only ways to interpret a rating. |
| `history.ts` | `replayHistory` — replay a season period by period; get final standings and a trajectory. |
| `calibration.ts` | `evaluatePredictions` (Brier + log-loss) and `tuneTau` — measure and tune predictive accuracy on real data. |
| `leaderboard.ts` | `leaderboard` / `conservativeRating` — rank a field by what players are confidently worth. |
| `decay.ts` | Optional, off-by-default inactivity decay toward the mean. |
| `types.ts` | `Rating`, `GameResult`, `RatingConfig`, and sensible defaults. |
| `index.ts` | One import for everything: `import { ... } from '@/rating'`. |
| `example.ts` | A runnable demo: `bun rating/example.ts` plays a season and prints a leaderboard + calibration. |

No runtime dependencies. Pure functions. Every value in, every value out.

## The rating, in plain terms

Every player has three numbers:

- **rating** — skill on the familiar scale where a new player starts at 1500.
- **rd** (rating deviation) — how sure we are. A new player starts at 350
  (very unsure); it shrinks as they play and grows when they sit out. A player
  is roughly 95% likely to sit within `rating ± 2 × rd`.
- **volatility** — how erratic their recent results have been.

Because uncertainty is explicit, you can show honest ranges (`confidenceInterval`)
and flag players whose number is not yet settled (`isProvisional`).

## Rating periods, not single games

Glicko-2 updates in **rating periods**, not one game at a time, and every
player in a period is scored from the ratings everyone held at its **start**.
Getting that wrong (using a rating you already updated mid-period as an
opponent) quietly corrupts the results, so `ratePeriod` owns the bookkeeping:

```ts
import { ratePeriod } from '@/rating/period';
import { newPlayer } from '@/rating/types';

const players = [
  { id: 'ana', rating: newPlayer() },
  { id: 'ben', rating: newPlayer() },
  { id: 'cy', rating: newPlayer() }, // plays no games — still ages
];

const updated = ratePeriod(players, [
  { playerA: 'ana', playerB: 'ben', scoreA: 1 },
]);

updated.get('ana'); // rating up
updated.get('ben'); // rating down
updated.get('cy'); // same rating, larger rd (inactivity = more uncertainty)
```

The result does not depend on the order games are listed.

For a single player you can also call `rate` directly with all their games:

```ts
import { rate } from '@/rating/glicko2';
const solo = rate(players[0].rating, [
  { opponent: players[1].rating, score: 1 },
]);
```

## Explainability: "why did my rating change?"

The single most-requested feature of any *trusted* rating system is being able
to see why a number moved. `explainRating` returns the same result as `rate`,
plus a per-game breakdown whose contributions sum **exactly** to the total
change:

```ts
import { explainRating } from '@/rating/glicko2';

const { ratingChange, games } = explainRating(player, results);
for (const g of games) {
  // g.expected  — the win probability we predicted
  // g.score     — what actually happened
  // g.ratingContribution — display points this one game added/removed
}
```

## Doubles

Pickleball is mostly doubles, but a rating belongs to a person, not a pairing.
The doubles layer handles this with one deliberately simple rule:

1. Each side is collapsed into **one synthetic opponent** — its rating is the
   mean of the two partners' ratings, its rd combined via the chosen strategy
   (`mean` or `rms`).
2. Each player is then updated with ordinary Glicko-2, as if they had played
   that synthetic opponent, with the score their team earned.

```ts
import { rateDoublesGame } from '@/rating/doubles';
import { newPlayer } from '@/rating/types';

const result = rateDoublesGame({
  teamA: [newPlayer(), newPlayer()],
  teamB: [newPlayer(), newPlayer()],
  scoreA: 1, // team A won
});
// result.teamA — both winners, rating up
// result.teamB — both losers, rating down
```

A nice property falls out for free: partners share the same opponent and score,
but Glicko-2 still weights each player's change by their own rating and rd, so
beating a strong pair lifts the weaker partner more than the stronger one.

For a real league, prefer accumulating each player's games across the period
(`doublesResult`) and calling `rate` once, rather than game by game.

## Tuning & validation

A rating system you cannot score against real results is one you cannot trust.
Replay a season and measure how well the ratings actually predicted it:

```ts
import { evaluatePredictions, tuneTau } from '@/rating/calibration';
import { replayHistory } from '@/rating/history';
import { leaderboard } from '@/rating/leaderboard';

// `periods` is an array of games-per-rating-period.
const { final } = replayHistory(players, periods);
leaderboard(final); // ranked best-first by conservative rating

const { brier, logLoss } = evaluatePredictions(players, periods);
// Lower is better. Predictions are graded out-of-sample: each game is
// predicted from the ratings held BEFORE its period is folded in.

// Glickman says to test tau for accuracy rather than guess it:
const ranked = tuneTau(players, periods, [0.2, 0.3, 0.5, 0.8, 1.2]);
ranked[0].tau; // the tau that predicted your history best
```

`bun rating/example.ts` runs all of this on a toy season and prints the result.

## Wiring it into a real app

- **A rating period is a business decision**, not a code one: a session, a
  week, an event. Collect that period's confirmed games, then call `ratePeriod`
  once. Longer periods are steadier; shorter ones react faster.
- **Persist three numbers per player** — `rating`, `rd`, `volatility` — plus
  the date of their last rated period (to inflate RD, and optionally `decay`,
  for players who sat out).
- **Only rate confirmed results.** Uncertainty (RD) is the built-in defence
  against thin or disputed data: with few games, ratings stay wide and honest
  rather than confidently wrong.
- **Show the range, not just the number.** `confidenceInterval` and
  `isProvisional` keep new players from being presented as more settled than
  they are.

## Inactivity decay (optional)

Glicko-2 on its own never moves an idle player's rating — it only grows their
RD. Some communities want more: a rating that drifts back toward the mean after
a long layoff, so stale ratings do not squat in rating-gated play. `decay`
offers that as an explicit, **off-by-default** policy (see `decay.ts`). It is
not part of canonical Glicko-2 and is a genuine judgement call — hence opt-in.

## Open questions

These are genuine modelling choices, put here to be argued with — not settled
truths:

- **Collapsing a team to one opponent.** `mean` vs `rms` of the RDs are both
  offered; how to *split credit* between partners (should who carried the game
  matter?) is still open.
- **Score margin.** Canonical Glicko-2 only knows win/loss/draw. Should an
  11–2 win move ratings more than an 11–9 win? DUPR does this; it is a real
  design decision with real trade-offs, left out here on purpose.
- **Rating period length.** Per session, per week, per event? An operator
  choice with a big effect on responsiveness.
- **Decay.** Whether ratings should decay at all, and how fast.

## Correctness

`glicko2.ts` is checked against the exact worked example in Glickman's paper
(a 1500/RD-200 player beats 1400, then loses to 1550 and 1700, with τ = 0.5).
The paper reports a final rating of 1464.06, rd 151.52, volatility 0.05999.
This code returns 1464.05 / 151.52 / 0.05999 — the small rating difference is
the paper's hand-rounded intermediate values; the full-precision result here is
the more accurate one.

The suite also covers invariants (monotonic in score, RD stays positive,
order-independence of a period), a multi-period season simulation that sorts
players into their true skill order, the calibration and leaderboard helpers,
and every utility. Run it:

```bash
bun test tests/unit
```

## Attribution

Rating math: Mark E. Glickman, *Example of the Glicko-2 system*, Boston
University, 2022.

This engine was drafted by the team at [VolleyForge](https://volleyforge.co) as
we worked through the same rating problem, and shared with OpenCourt to compare
notes and, hopefully, collaborate. Use it, change it, or discard it.
