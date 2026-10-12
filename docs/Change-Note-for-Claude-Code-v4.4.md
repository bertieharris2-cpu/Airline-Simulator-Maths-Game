# Change Note for Claude Code — Workbook v4.4
*From Fable, 12 October 2026. Supersedes the v4 note and the Design Note of 8 October where they differ. Goes with Airline-World-Workbook-v4.4.xlsx and Balance-Report-v4.4-addendum.md. D-numbers are Design Register decisions.*

## What this means (for Bertie)

Chapter 1 is now played a week at a time: Launch Day is one planning page where all the levers sit together and all the opening sums are done in one sitting; the week then runs on the operations board, pausing only for Red Kite on Thursday and the storm on Friday; Sunday is the review, with the seven-row table, the total by hand and a new line that shows what the best plan would have earned. Both routes are open from the start, the second plane comes in week 2 and has to be rented or financed before it can be bought, the four routes come in week 3, Madrid and the jets in week 4. Planes cost more per day, so a bad plan loses money, and from week 3 a neglected route loses passengers to Red Kite. Everything after week 4 shifts a week.

---

## 1. The week loop (D52) — replaces day-by-day beats in chapter 1

Calendar column `weekPhase`: `plan` (Monday), `run` (Tuesday–Saturday), `review` (Sunday).

- **Plan (Monday).** One page: timetable with the demand curve drawn from day 1, fare chips, snacks, fuel order, the modelling tool (Test plan) on the same page. "Cost your plan" opens the workings page (Design Note 8 Oct §2) for the day's hand sums. On Launch Day those are, in order: tickets at the three fares the pupil is weighing (3 ×), profit for the chosen fare (−), snack sales at £3 and £5 (2 ×), his own fuel bill after the guided example (long ×, at Wednesday's £1.30). Later Mondays ask only the new sums HandSumRules call for (week 2: rent-or-buy; week 3: a £5-fare ticket sum and a flight time; week 4: range and a jet fare).
- **Run (Tuesday–Saturday).** The standing plan runs on the operations board, one day per step, fast; each day's result is the projection (there is no market noise in chapter 1) plus any event. The board pauses on a `run` day with an `eventId` and shows the card; the pupil's choice applies from that day. Weekend days use the weekend multipliers.
- **Review (Sunday).** Seven-row table; the week's total (Calculate); projected − actual (Calculate); the **missed-profit line** (`missedProfitLine`): your plan £X · best plan available with your planes and open routes £Y · missed £Z — from the plan sweep, the pupil reads it. From day 15 the review also names any route under the neglect rule.
- `teacherDayByDay` TRUE restores day-at-a-time play for a pupil who needs it (each day becomes plan + run + result).
- From day 29 the week itself is skipped as a unit (teacher skip 1 week); from 2 December, months.

## 2. Opening schedule (D53)

Routes `unlockDay`: dub, par 1 · ams, fra, gva, bcn 15 · mad 22 · rak 29 · bru, ber, mxp 36 · fco, lis 43 · ath, ist 57 · edi 64 · rek 71 · cai 85. Aircraft `shopFromDay`: saab340, atr72, second dhc6 8 · e175, e190 22 · a220, a320, b737 57. RouteCatalogue `plannedOpenWeek` moved to match. Chapter-1 events are on their weeks' Mondays (fuel_shock 14 Oct, price_war 11 Nov, oil_find 2 Dec, first_snow 16 Dec).

## 3. Money (D55)

- `Aircraft.dayCost`: dhc6 900, saab340 1200, atr72 1800, e175 3000, e190 3500.
- `Aircraft.listPrice` (tutorial): dhc6 12,000 (launch deal 2,500 for the first), saab340 22,000, atr72 36,000, e175 50,000, e190 70,000. Finance rows: deposit, daily payment and days as in the sheet (days, not weeks, for tutorial planes).
- Shop: **Buy is greyed out** until cash ≥ price + `cashReserve`, showing "£X still to save · about N days at your rate" (N = shortfall ÷ average daily profit of the last 7 days, rounded up). Rent and Finance are always offered. The rent-or-buy sum (price ÷ leaseDaily) is Calculate the first time (week 2), Model afterwards.
- **Use-it-or-lose-it** (`neglectFromDay` 15, `neglectLoadFactor` 0.5, `neglectLossShare` 0.1, `neglectRecoverShare` 0.05): at each Sunday review, for each open route, if no service flew that week or the week's load factor on it was below 0.5, set `rivalShare[route] = min(0.6, rivalShare + 0.1)`; otherwise `rivalShare = max(0, rivalShare − 0.05)`. Demand on the route = base × (1 − rivalShare). The review prints "Dublin: 62 → 56. Red Kite is taking your passengers." Reset to 0 is never automatic.
- `eventCostScaleFromDay` 29 (the four fully written events keep fixed pounds).
- `practiceQuestionsPerDay` 0 | 1 | 3 (teacher panel; default 0); practice uses the pupil's own numbers and appears after the plan sums, optional.

## 4. Hand sums in the opening (D54, HandSumRules)

Launch Day: 5 sums (8 multiplications). Thursday: one Red Kite tenths sum. Saturday: one weekend tenths question with different numbers from the worked example. Sunday: week total and projected − actual. Week 2 Monday: rent-or-buy (÷), the new plane's revenue (×), the airline's day (+). Week 3 Monday: 34 × 95, 675 ÷ 450. Week 4 Monday: range check, 1,350 ÷ 450, 80 × 170; Wednesday: jet fuel by hand (litres changed by more than a quarter). About 26 in four weeks. No Build in the opening; no grid method; snacks once.

## 5. Removed or changed from the prototype

Day-by-day beats in chapter 1 (replaced by the week loop); the crew-duty screens (D51); "four flights isn't open" greying (show the landing time instead); practice questions by default; the per-day "one new figure" rule (replaced by HandSumRules). Launch Day loses nothing it taught; it teaches it on one page.

## 6. Report back

Count the Calculate steps in weeks 1–4 with practice off (target about 26); confirm the review's missed-profit figure matches Balance Report v4.4 §2–§5 for the plans given there (within £10); confirm Buy is greyed in week 2 for a pupil with £13,000; confirm the neglect rule fires at the week-3 review for a route with no service.
