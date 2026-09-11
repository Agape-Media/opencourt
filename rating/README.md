# OpenCourt rating engine

A transparent, dependency-free rating engine for pickleball. Every number it
produces can be traced to a published formula — there are no hidden steps.

It is built on [Glicko-2](http://www.glicko.net/glicko/glicko2.pdf), Mark
Glickman's published, peer-reviewed successor to Elo. Glicko-2 is a good fit
for a community rating system because it is fully documented, gives every
player an explicit **uncertainty** (not just a number), and its every step can
be read and checked against the paper.

This module is a starting point offered for discussion, not a finished
standard. The doubles layer in particular makes modelling choices that the
community should challenge and improve — see [Open questions](#open-questions).

## What you get

| File | What it is |
| --- | --- |
| `glicko2.ts` | The Glicko-2 core: singles ratings, verified against the paper. |
| `doubles.ts` | A doubles-aware layer that rates individual players from doubles games. |
| `types.ts` | `Rating`, `GameResult`, `RatingConfig`, and sensible defaults. |

No runtime dependencies. Pure functions. Every value in, every value out.

## The rating, in plain terms

Every player has three numbers:

- **rating** — skill on the familiar scale where a new player starts at 1500.
- **rd** (rating deviation) — how sure we are. A new player starts at 350
  (very unsure); it shrinks as they play and grows when they sit out. A player
  is roughly 95% likely to sit within `rating ± 2 × rd`.
- **volatility** — how erratic their recent results have been.

Because uncertainty is explicit, you can show honest ranges ("1500 ± 150"), and
new or inactive players are never treated as if their number were reliable.

## Rating periods, not single games

Glicko-2 is designed to update in **rating periods**, not one game at a time.
Gather all of a player's games since their last update — the paper recommends
an average of 10–15 per player — then update once with the whole batch:

```ts
import { rate } from '@/rating/glicko2';
import { newPlayer } from '@/rating/types';

const player = newPlayer(); // 1500 / 350 / 0.06

const updated = rate(player, [
  { opponent: { rating: 1400, rd: 30, volatility: 0.06 }, score: 1 },
  { opponent: { rating: 1550, rd: 100, volatility: 0.06 }, score: 0 },
  { opponent: { rating: 1700, rd: 300, volatility: 0.06 }, score: 0 },
]);
// updated.rating ≈ 1464, updated.rd ≈ 152
```

A player who did not compete this period still ages — pass no games and only
their `rd` grows:

```ts
const rustier = rate(player, []); // same rating, larger rd
```

## Doubles

Pickleball is mostly doubles, but a rating belongs to a person, not a pairing.
The doubles layer handles this with one deliberately simple rule:

1. Each side is collapsed into **one synthetic opponent** — its rating is the
   mean of the two partners' ratings, its rd the mean of their rds.
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

## Open questions

These are genuine modelling choices, put here to be argued with — not settled
truths:

- **Collapsing a team to the mean.** Averaging the partners is the simplest
  defensible choice. Alternatives worth testing: RMS of the rds, or weighting
  the stronger player more.
- **Splitting credit between partners.** Right now both partners take the same
  result. Should the split reflect who carried the game?
- **Score margin.** Canonical Glicko-2 only knows win/loss/draw. Should an
  11–2 win move ratings more than an 11–9 win? DUPR does this; it is a real
  design decision with real trade-offs, left out here on purpose.
- **Rating period length.** Per session, per week, per event? This is an
  operator choice with a big effect on responsiveness.

## Correctness

`glicko2.ts` is checked against the exact worked example in Glickman's paper
(a 1500/RD-200 player beats 1400, then loses to 1550 and 1700, with τ = 0.5).
The paper reports a final rating of 1464.06, rd 151.52, volatility 0.05999.
This code returns 1464.05 / 151.52 / 0.05999 — the small rating difference is
the paper's hand-rounded intermediate values; the full-precision result here is
the more accurate one. See `tests/unit/rating.test.ts`.

Run the checks:

```bash
bun test tests/unit
```

## Attribution

Rating math: Mark E. Glickman, *Example of the Glicko-2 system*, Boston
University, 2022.

This engine was drafted by the team at [VolleyForge](https://volleyforge.co) as
we worked through the same rating problem, and shared with OpenCourt to compare
notes and, hopefully, collaborate. Use it, change it, or discard it.
