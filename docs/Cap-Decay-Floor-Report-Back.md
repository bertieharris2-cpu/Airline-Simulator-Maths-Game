# Report back: the cap, the decay and the floor (Workbook v4.9)

*From Claude Code to Fable, 13 October 2026. This answers §5 of "Brief for Claude Code — Fewer, better hand sums: the cap, the decay and the floor" (D63–D64, HandSumRules 9–11). The game is `airline-opening-prototype.html`, built from `src/opening/`, with the new code in `src/opening/parts/p4zc_signoffs.js`. Screenshots are in `docs/screenshots/v49/`.*

The Steady run matches §4 within one sign-off in every week. No week from week 2 asks more than three Calculate sign-offs. Four points need your decision; they are at the end.

Workbook v4.9 installed directly, with 0 import errors: it carries the CR5 parts, so the merge script is no longer needed.

## What was built

- **The cap** (rule 9, `signOffCapPerWeek` 3; teacher dial 1–3).
  - From day 8 every Calculate sign-off in a week goes through one record: the second-aircraft rent-or-buy, the showroom's sums, the Monday sums, the first fuel order and the month-end audit.
  - **Order:** a relationship never met first, then a changed input (a fuel price jump), then the most money. One of each relationship comes before a second of any, so week 3 asks tickets, flight time and fuel rather than two ticket sums.
  - **Over the cap:**
    - a relationship the pupil has met is **Build**, as in rule 9's week-3 example (Frankfurt, Geneva and Barcelona tickets as Build);
    - one he has never met is the model's this week and is asked the next week it is relevant.
  - The first fuel order keeps a slot until the fuel desk.
- **The decay** (rule 10, `signOffDecayAfter` 2).
  - From week 2 each relationship is Calculate twice; a new instance after that is **Build**. The relationships are tickets, fuel for a service, flight time, rent-or-buy and a full plane.
  - A Build card shows the right two figures with two or three distractors (seats, distance, fare) and the four operations.
  - The pupil taps a figure, the operation and a figure. × can go either way round; ÷ must go the right way round. The game then counts up to the answer and stamps it Checked.
  - A wrong build gets Query and a plain hint, e.g. "The price is for one litre: which operation finds the cost of all the litres?" or "Ticket money comes from the passengers who fly, not the seats."
  - The teacher can hold any relationship at Calculate.
  - A fuel price jump is Calculate whatever the count. The jump is measured from **the price of the last fuel line worked by hand** (on any card), and the busiest card is asked.
- **Where the cards are.** The Monday's Build cards and flight-time sums come on a **Sign-offs** page before the sheet. The showroom's sums for a later aircraft (rent-or-buy and a full plane) use the same cards. Calculate tickets and fuel stay on the sheet and the service card.
- **The floor** (rule 11).
  - **Audit.** After each month end (from October), the next week opens with a Finance audit. It re-checks one line: passengers × fare on the month's last day, for the route whose takings fell furthest short of the best plan's that month. The fallback is the largest revenue line.
  - **Missed profit.** It comes from `bestPlanSweep` on the month's last week, used as a daily rate across the month, against the month's actual profit. The audit page shows it as the month's missed-profit line.
  - **Board review.** When the plan has not changed in the four weeks before and more than 20% was missed, the audit becomes a board review:
    - the letter, ending "We'd like to see a plan that tests a different fare or route";
    - two lines;
    - the month's average day as a Build divisor (the month's profit ÷ its days).

    The plan's Next is then held, with a banner, until something on the plan changes. The change is not judged.
  - The neglect rule now runs for the week and month beats as well (it stopped after day 28 before).
- **Logging.** Each week records what qualified, what was asked, built, left to the model or carried, plus the audit. The teacher panel's *Sign-offs a week* shows it beside the dial, the holds and the counts.

## The Steady run against §4

`week.test.js` with the Balance Report plans: the Twin Otter on Paris, the Saab on Dublin then Amsterdam, and the ATR on Madrid from day 22. The Paris fare changes once at the start of each month. It runs to the chapter accounts on 28 December.

| Week | §4 | The game | Difference |
| --- | --- | --- | --- |
| 1 | Launch Day 5 + 2 | Launch Day 5, then the Thursday and Saturday tenths (outside the cap) | 0 |
| 2 | rent-or-buy, first fuel purchase, Saab fuel on Dublin | the same three | 0 |
| 3 | 34 × £95, 675 ÷ 450, Saab Amsterdam fuel | Amsterdam tickets, Amsterdam flight time (450 ÷ 450 for the Saab), Saab Amsterdam fuel | 0 |
| 4 | 80 × £170, jet fuel, load factor | a full plane (70 × £170), rent-or-buy (36,000 ÷ 650), Madrid tickets. **Build:** the ATR's Madrid fuel and the Madrid flight time | 0 in number; see decision 1 |
| 5 | Marrakech tickets as Build only | none (the test pupil does not open Marrakech; it would be Build, the third ticket sum) | 0 |
| 6 | — | — | 0 |
| 7 | fuel at £2.94, the fault's half-day | fuel at £2.94 | −1 (no half-day sum in the game yet) |
| 8 | — | fuel at £2.13 | +1 (see decision 2) |
| 9 | end-October audit | — | −1 |
| 10 | — | the October audit (Mon 4 Nov: Madrid, 70 × £170) | +1 (see decision 3) |
| 11 | price-war tenths | — | −1 (no price-war sum in the game yet) |
| 12–13 | end-November audit | — | −1 in week 13 |
| 14 | fuel at £1.12 | the November audit (Mon 2 Dec) and fuel at £1.12 | +1 |
| 15–17 | — | — (December is one month beat from 9 Dec, so there is no Monday after it) | 0 |

**Totals.** After Launch Day the game asks 16 Calculate sign-offs in chapter 1: the 2 week-1 tenths and 14 from week 2. §4 says about 20. The gap is the three sums the game does not have yet (the load factor, the fault's half-day and the price-war tenths).

**Relationship counts at the end** (Calculate from week 2):

| Relationship | Count | Of which |
| --- | --- | --- |
| Fuel for a service | 5 | 2 new cards and 3 price jumps |
| Tickets | 2 | |
| Rent-or-buy | 2 | |
| Flight time | 1 | |
| A full plane | 1 | |
| The first fuel order | 1 | |

Build: 2 (both in week 4). Model: 0. Carried: 0.

**Audits and board reviews:**

| Run | Month | Result | Missed |
| --- | --- | --- | --- |
| Steady | October | audit | 47.5%: £176,260 made, about £335,772 possible |
| Steady | November | audit | 47.1% |
| Coasting (`COAST=1`: the plan never changes after day 22) | October | **board review**: five weeks unchanged; Madrid and Amsterdam lines and the October average day; the plan held until the Paris fare changed | 49.7% |
| Coasting | November | audit (the plan changed on 4 Nov) | |

**The cap dial at 1** (`CAP=1`): one Calculate a week.

| Week | Calculate | Build | Model |
| --- | --- | --- | --- |
| 2 | the first fuel order | the Saab's Dublin fuel | rent-or-buy (never met) |
| 3 | Amsterdam flight time | Amsterdam tickets and fuel | |
| 4 | the ATR's rent-or-buy | Madrid tickets, fuel and flight time | a full plane |
| 5 | fuel at £1.86 (a 56p move from the last fuel worked by hand, Launch Day's £1.30) | | |

## How the rules were read

- **The decay counts from week 2.** Launch Day and week 1 teach each relationship. Like the cap, they are outside the count; this is the only reading under which §4's week-2 Saab fuel and week-4 80 × £170 stay Calculate.
- **Over the cap:** Build if the relationship has been met (rule 9's example); otherwise the model's, and asked the next week it is relevant.
  - In practice, carrying happens only when more never-met relationships arrive in one week than the cap allows.
  - Rent-or-buy and a full plane cannot wait (the decision is that day), so over the cap they are the model's.
- **The range check is now the model's.** It is not a WorkingMethods relationship, and it was logged in week mode but never shown. Flight time was also logged and never shown; it now has its own card.
- **"A new instance"** means a route new to tickets or flight time, a plane type new to a route for fuel, and a plane type new to rent-or-buy or a full plane.

## Decisions needed

1. **Week 4's fuel.** By the decay, the ATR's Madrid fuel is the third fuel line from week 2, so it is Build. §4 lists "jet fuel" as Calculate.
   - Should fuel count per plane type (each new type's first route Calculate), or as one relationship as now?
2. **Week 8's fuel.** Rule 2 measures from the last fuel line worked by hand. The fall back from £2.94 to £2.13 is 81p, so week 8 asks fuel again.
   - Keep it, or count only moves away from the price before the spike?
3. **When the audit falls.** A week beat runs Monday to Sunday without stopping, so the audit opens the week after the month end: Mon 4 Nov for October, Mon 2 Dec for November. It takes one of that week's three slots.
   - Is that right, or should the run pause on the 31st?
4. **The 20% threshold.** In both runs the best plan available makes about twice the test pupil's profit, so missed profit is 45–50% and the board review is decided by the four idle weeks alone.
   - Keep 0.2, raise it, or compare with a narrower "best plan" (for example, the pupil's own routes and fleet only)?

## Not in the game yet

- §4's week-4 **load factor** sign-off. The Calendar's `gatedCalc` lists `loadFactor` on day 22, but there is no load-factor sum. The filled-aircraft → fraction → percentage frame from WorkingMethods is not built.
- The **fault's half-day** sum (week 7) and the **price-war tenths** (week 11).
- **Marrakech** is not opened by the test pupil. By the rules, its tickets would be Build (the third ticket sum from week 2).

## Tests

- `week.test.js` to the chapter accounts on 28 December: 145 checks, 0 failures. It checks:
  - the cap each week;
  - weeks 2–4 against §4;
  - a wrong Build and a wrong Calculate answer stamped Query;
  - the audits on 4 Nov and 2 Dec;
  - that the range check is no longer logged.
- `COAST=1`: 143 checks. It checks the board review, the held plan, and the plan released by a changed fare.
- `CAP=1`: 94 checks. It checks one Calculate a week.
- `migrate.test.js` (27 checks), `engine.test.js` and `balance.test.js` (85 checks) pass.
