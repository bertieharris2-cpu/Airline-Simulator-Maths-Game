# Report for Fable: the screens brief (D96–D99)

*Claude Code, 17 October 2026. This answers "Screens brief, 17 October" and Workbook v5.15. The screenshots it asks for went to Bertie with this report.*

## What was installed, and what was not

On 16 October Bertie asked for no more data changes for now: "We now just need to polish the game." v5.15 carries the polish (D96–D99) and the economy changes (v5.9–v5.12) together, so it was **not installed whole**. A small tool, `tools/take_parts.py`, took only the parts this brief needs, on top of the installed v5.8:

- **Sheets:** PlanTips, DailyColour, Upgrades, Briefings and Milestones.
- **Settings:** `reviewAsSpreadsheet`, `fuelAccounting`, `fuelFillLabel`, `compareLastWeek`, `keyboardShortcuts`, `soundSet`, `dailyColour`, `tipGainGate`, `allFullCapacityTip`, `plannerUpgrades`, `operationsBriefings`, `flightDaysFromDay` and `milestonesSheet`.

**Parked until Bertie asks** (the full v5.15 is kept in `data/incoming/`):

- D90: clashing weeks, the festivals calendar, the Charter desk and CharterOffers, and known-for tags.
- D92: the rewritten fuel market (Market weeks 18 on), `fuelGraph`, `averagePaidVsMarket` and `whyPricesMove`.
- v5.11:
  - dates moved onto Mondays (`buyFromDate` 1 Sep);
  - set-up days 5 → 7;
  - chapter reviews on the last day;
  - Hong Kong and Los Angeles pools −8%;
  - the A220/A320/737 lease rule;
  - the Calendar, Routes, Finance, Events, EventOptions, Hunts and Challenges edits.
- D94: fuel charged from Launch Day, four Launch Day sums and litres per seat.
- D95's `attentionGrammar` row. The Night Ops look already follows most of the brief.
- The rest of v5.9–v5.12's Settings rows: overdraft wording, two-leg crew, rotation typical day, tank rounding, `fuelShockRise`, flight times per page, weekend add prompt, hunts' two tries, the working-on-paper teacher switch, operations check by level.

## What was built

| Brief item | In the game |
| --- | --- |
| **Review as a spreadsheet** | Left to right: what happened · the figures · the instrument. The three sums are cells (Profit this week, Difference from the plan, Average a day). Only the cell being worked on is lit (cyan rail, soft gold edge); the others wait, dimmed. The formula builds into the lit cell; on Check it fills, lights green once and keeps a ƒ with its formula. No numbered panels and no green instruction boxes. The relationship is one line the first time, then "Give me a hint". A redraw never moves the page (on every page). The worth line has left the review. |
| **Weekdays and weekends + the request (D98)** | Plays after the week-2 accounts are signed off, with the pupil's own week. The right statement grants the Days setting from Monday; another leaves it to the systems team, who propose it after the week-3 review on day 21 ("Build it" / "Not this week"); "Not this week" keeps the offer on the plan page. Saves from before this rule keep Days as they had it. |
| **Operations Wall and shortcuts** | A named "Operations Wall" button on the desk bar. Ctrl/⌘ + ← → moves between Home, the Plan and the Wall, with key hints under each the first few sessions (then on hover). Esc closes a panel; Enter checks the sum on the page. |
| **Compare with last week** | A button on the timetable. Last week's flights show as dashed ghosts behind this week's. The summary shows before → now (seats, empty, turned away, and profit when it is shown). A list says what changed in words ("Dublin fare £90 → £80", "Dublin 1st flight moved 10:40 → 10:50"). "What it is worth" gives one line per change ("Dublin fare £90 → £80: 19 × £80 against 19 × £90, £190 less a day in tickets"). |
| **Costs as a list** | One line per item, right-aligned figures, the total ruled off, a ƒ on each line with its relationship. The £300 reads "Advertising (Red Kite's undercut)". |
| **Fuel desk** | "Fill the tank: 8 blocks" or "Most I can afford: N blocks", and the grey line ends "The tank is the limit." / "Cash is the limit." The order sum reads "Fuel order = blocks × price per 1,000 L" (distractor chips kept). The requirement shows its cost ("about £4,322 at £1.47"). After an order: "Buying 3,000 L moves £4,410 from cash into the tank. Each day's profit counts only the fuel your flights burn, at the price you paid for it." with Cash £14,841 → £10,431 · Tank 0 L → 3,000 L. The day's statement reads "Fuel burned: N L × £p = £X". |
| **Cash, tank, profit (D99)** | Opens on the first visit to the Fuel desk (days 8–14), with the pupil's cash, today's price, the most the tank and cash allow, and the first flight of their plan. |
| **Sounds** | Nine, synthesised in the browser (no files): tap, slot, tick, query (lower, quieter), chime, cash, pour, whoosh and day tick. They follow the teacher's Sound switch (off to start), with one volume slider in the teacher panel. |
| **Daily colour** | All ten rows, from week 2, at most one a day. Fixed by date (on the row's weekday in every Nth week, first row in sheet order wins). Only on flown days, never in a projection. Each has its line on the day's row ("A hen party on the 08:00 bought every snack on board. +£47"). |
| **Tips gated by gain (D97)** | A tip shows only if the best plan that answers it gains at least £50 a day. A loss, a range failure and the capacity observation always show. When every service is full, people are turned away and every plane is flying, the check leads with `all_full_capacity` (after a loss, if there is one), with Compare aircraft and Test fare. The timing, weak-service and turned-away tips stay silent. |

## Notes and questions

1. **The weekend briefing and the game's demand.** The briefing as written shows Dublin at 48–50 on weekdays and 83/77 at the weekend. The game's weekend rule (business ×0.7 Saturday, ×0.6 Sunday, leisure ×1.2) gives much smaller differences, and a business route's weekend *falls*. In the test pupil's week 2, Paris wanted 50 a day on weekdays and 53/51 at the weekend.
   - What I did: the briefing now uses the pupil's own week, chooses the route whose weekend differs most (busier or quieter), and its words follow the figures ("about 6% more people…", or "fewer").
   - The question: if you want the weekend to be the obvious story in week 2, the weekend multipliers or the routes' business shares need to change. That is a data change, for when Bertie wants one.
2. **"Difference from the plan".** The brief writes the relationship as "planned − actual". The game keeps its D61 rule that a difference starts from the larger figure (no negatives), so the line reads "planned − actual", or "actual − planned (it beat the plan)" when the week beat the plan.
3. **Daily colour sizes against ±5%.** The Settings note says within ±5% of a day's profit, but the rows' sizes can exceed it. Three no-shows at £90 is £270 on a £2,387 day (11%). I followed the rows' sizes. If ±5% should be a cap, say so and I will clamp to it.
4. **Daily colour rows that need a condition.**
   - The snack rows (hen party, birthday) do nothing on a day with no snacks on board.
   - School group and corporate block need spare seats (a third of the group at least). Corporate block needs a route with business share ≥ 0.5.
   - No-shows need a full flight.
   - A row the game cannot apply that day simply does nothing; nothing else is drawn in its place.
5. **Briefings not built yet.** Eight of the ten (fare, rival, capacity, efficiency, event, seasons, lease, cash) have no HTML piece yet. The importer lists them as "not built yet". Once a piece is in `src/opening/briefings/`, it needs its trigger wired; today only the weekend and fuel triggers exist.
6. **Upgrades not wired yet.** `day_override`, `seasonal_plans`, `assign_planes` and `fuel_farm` need their requests and features: the one-day override, seasonal plan sets and assignment planning do not exist yet, and the fuel farm exists but not as an upgrade. Only `weekend_schedules` is wired.
7. **Milestones.** Your sheet is installed. Its thresholds and chapter ranges override the game's draft (Close the gap now starts in chapter 2; Fuel ahead needs £100). Four rows have no measure in the game yet and are left off the teacher panel: `experimenter` and `worthIt` (to build), and `charterWinner` and `clashServed` (they wait for D90).
8. **Testing.** The regression tests switch the briefings off. `BRIEFINGS=1 node week.test.js` plays both briefings and checks the upgrade; `WRONG_CARD=1` checks the day-21 proposal.
