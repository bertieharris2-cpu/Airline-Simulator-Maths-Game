# Report back to Fable: building chapter 1 on workbook v4.2

*Draft kept up to date as the stages land. For the game's state, see `docs/State-of-the-Game.md`; for the import, `data/Import-Report.md`.*

## What was built from the sheets

- **Pacing.** The Chapters sheet gives the start (Mon 2 Sep 2030), the cadence ("day → week (from day 22) → month (from Dec)") and the review date (28 Dec). The Calendar sheet is one beat per day for days 1–21; the Market sheet one per week from day 22; December runs as a month (2–27 Dec); the review is held on Saturday 28 December. Nothing in code lists beats any more.
- **Routes, aircraft, catering, home.** All 18 live routes load and open by `unlockDay`; the E175 joins the aircraft list; the Catering sheet is the snack menu (`none/low/high/free`); the home is fixed at Heathrow T5 and the home-airport step is gone.
- **Hand sums.** HandSumRules 1, 2, 4, 5 and 6 drive the Cost sheet (p4l_handsums.js): first time by hand; fuel again when the price moves ≥ £0.50 or the planned litres change ≥ 25%; revenue again on a new route or plane; snacks once; the Test plan never. The teacher panel lists what has been done by hand so far. Rule 3 (totals at the review) comes with the chapter review.
- **Events.** A Calendar event is a step between Plan and Cost. Cash options join the day's costs (the Cost sheet shows the line, so projected = actual). Cancelling a service removes it from the day: no fares, no flying costs. Stars are banked (`S.repBank`) until `reputationFromDate`.
- **Weekends and the Market.** Demand = table × (businessShare × businessMult + (1 − businessShare) × leisureMult) × season; Saturdays use `weekendBusinessMultSat`, Sundays `weekendBusinessMultSun`, both `weekendLeisureMult`. A Market `seasonMult` for the route wins over the archetype's season table.
- **Cash reserve and losing plans.** Ready blocks a plan that would take cash below `cashReserve` (when cash is above it now) and warns when the projection is negative.

## Decisions you should know about

1. **The review day.** `end` and `reviewDate` are both 28 Dec. December runs 2–27 Dec and the review is held on the 28th (a Saturday, no flying). If the review should follow a full month, set `reviewDate` to the 29th or later.
2. **Rule 2 fires on day 4.** Adding the second route doubles the planned litres, so fuel is by hand on day 4 as well as the new route's revenue (two hand sums that day). The Calendar's `gatedCalc` names only `revenue` for day 4. Tell me if the Calendar column should win in the set-up weeks.
3. **Rule 5, "snacks once".** Implemented as "the first day snacks are in the plan", not strictly day 2, so a pupil who skips snacks on day 2 still meets the sum once. Calendar day 12 lists `cabin` as the gated sum; rule 5 wins, so day 12 asks nothing for snacks.
4. **Matching Red Kite's £50.** Dublin's fare list is £70–£110; "Match their price" sets £50, which the demand table extrapolates (96 people at £50). The planner then steps back onto the list.
5. **Rounding.** The engine rounds the time-sensitive total first, then shares it between the bands (your v3 §1), halves up. Every single-service figure in Balance Reports v3, v4 and v4.1 is reproduced to the pound. Differences, all in `balance.test.js` as "noted":
   - two-service "spread" and "compact" cells (Amsterdam Saab £2,240, Brussels Saab £2,058, Milan Saab £3,555, Madrid E190 2 services £789): your departures are not stated and your sharing differs from v2's, which the game keeps (v2's two- and three-service figures are reproduced);
   - Frankfurt Twin Otter £140: you seat 19, the engine 18;
   - Berlin at £110 and Edinburgh at £90 (city_break_mixed): you seat one or two fewer passengers than the engine;
   - Marrakech (v4 §2) reproduces at fuel £1.70, not week 4's £1.80;
   - the in-season Geneva/Barcelona runs (v3) do not state their fuel price;
   - Reykjavik is reported at £180, which is not on its fare list (£200–£240).
6. **Istanbul.** Its archetype `long_haul_mixed` is `later`, so the game loads the route with no time bands (everyone flexible) and says so on the route card. Making the archetype live fixes it.
7. **Settings placeholders touched by chapter 1.** `timeSkip` (the teacher skip is built from the brief: 0 / 1 / 4 / 8 weeks); `reputationFromDate` (a date gate only).
8. **Calendar `challenge #` column** names challenges 1–4 on days 3, 5, 9 and 11, but `captainsChallengeCadence` starts challenges on 6 Jan 2031. The game follows the Challenges sheet dates and ignores the column.
9. **`new_year` (31 Dec)** is placeholder and falls after the review, so chapter 1 never reaches it.
10. **The v3 change note** never arrived; Balance Report v3 did and was used.

- **The fleet (week 2 and 3).** The plan carries every aircraft, each with its own services and departure times; fares are shared per route. The shop appears on the days the Calendar unlocks aircraft (8 and 15) and in every week's plan: cash price, rent a day and the launch-deal finance from the Finance sheet. Rule 4's sums for a new plane: price ÷ rent a day (rent-or-buy) and seats × fare (a full plane), once per aircraft type. Rent and finance payments are cost lines in "Aircraft's day" while they run. A route needs an aircraft with the range; a new route's flight time is distance ÷ speed by hand (Calendar day 15, then rule 4 from day 22).
- **The weeks (day 22 to 1 December).** Review (load factor as a percentage), shop, plan, Cost (a day of the plan appears for hand sums only when a rule fires), Test, Ready, run, results. The Market gives fuel, season, business/leisure multipliers and weather. Dated events ride on their week: the technical fault is decided before the week runs, its cost a share of yesterday's profit (`costShare` × the last day's profit, from `eventCostScaleFromDay`); the football final, price war, first snow and Christmas are applied from their effects text. The teacher's skip (1 / 4 / 8 weeks) runs the standing plan by itself.
- **December and the review.** December runs as a month (the tank comes back, current plan against test plan). On 28 December the chapter accounts: each month's revenue and costs shown, the totals, the profit and projected − actual by hand (rule 3). A chapter banner opens the game; chapters 2–6 are read for the teacher panel's gates list only.

## Decisions you should know about (continued)

11. **Finance for the tutorial tier.** The Finance sheet says `financeFrom = n/a` for the Twin Otter to E190 but gives deposit and daily payments; the game offers that finance from the aircraft's `buyFrom` day (your note "launch-deal finance kept"). Say if finance should not be offered before 2032.
12. **The fault's choices.** The Events sheet carries the fault's options only as text ("fix £800 +½★ / fly −1★ / wait: plane misses next day"); the game builds the three choices from that text, with "fix" costing `costShare` 0.5 × yesterday's profit from day 22. Option rows on the sheet would be better.
13. **The price war.** "Red Kite cuts every fare by 20%" is read as: for that week the rival sells every route you fly at 80% of your fare (rounded to £5). Red Kite's own fares are not on any sheet.
14. **Information events** (football final, first snow, Christmas) apply for the whole week they fall in, not from their date within the week. Christmas's multipliers are already on the Market sheet for week 17, so the event only adds its headline.
15. **The shop in the weeks.** Aircraft whose `shopFromDay` has passed are shown every week (the A220, A320 and 737 from day 50, with their offers crossed out until their lease/buy/finance dates). "Not today" is one click.
16. **Week 1's projection.** Rule 1 asks for "profit a day × 7" on the first week. With weekend multipliers the week is quieter than Monday × 7, so the projection is deliberately approximate; the results explain the gap ("Saturday and Sunday carry fewer business travellers"). Every later week and December are projected by a dry run of the real engine and land exactly.
17. **Hand sums counted.** The teacher panel lists every hand sum done; the chapter accounts show the count against `handSumsPlanned` (25).
