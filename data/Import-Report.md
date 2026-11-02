# Import report: Airline-World-Workbook.xlsx

*Written by `tools/import_world.py` on 02 Nov 2026. Loaded: live, optional rows. Written to `src/opening/parts/p2_data.html` as `data-workbook`; rebuild the prototype to use it.*

**0 to fix, 11 to check, 7 notes.**

## Loaded

| Sheet | Loaded | Rows by status |
| --- | --- | --- |
| Settings | 300 | 9 draft, 291 live, 10 placeholder, 1 withdrawn |
| Archetypes | 5 | 2 later, 5 live, 2 note row |
| Routes | 29 | 29 live |
| RouteCatalogue | 0 | 21 moved |
| Aircraft | 15 | 15 live, 1 note row, 1 removed |
| Finance | 16 | 16 live, 2 note row |
| Airports | 1 | 1 later, 1 live, 3 removed |
| Calendar | 56 | 56 live |
| Market | 416 | 416 live |
| Events | 18 rows → 18 events | 3 later, 18 live, 1 note row, 28 parked, 3 placeholder, 2 removed |
| EventOptions | 27 | 27 live, 1 note row, 38 parked |
| Challenges | 6 | 6 live, 2 placeholder |
| Mechanics | 17 | 3 later, 17 live |
| Chapters | 4 | 2 later, 4 live, 1 note row |
| HandSumRules | 12 | 12 live, 1 note row |
| Catering | 0 | 5 parked |
| PlanTips | 16 | 16 live, 3 note row |
| Milestones | 18 | 18 live, 1 note row |
| DailyColour | 8 | 8 live, 1 note row, 2 parked |
| Upgrades | 4 | 4 live, 1 note row, 1 parked |
| Briefings | 8 | 8 live, 2 not, 1 note row, 5 parked, 1 retired, 2 superseded, 1 test |
| Roadmap | 14 | 14 live, 1 note row |
| RouteNews | 82 | 82 live, 2 note row, 19 parked |
| Livery | 35 | 35 live, 1 note row |
| Hunts | 5 | 5 live, 1 note row, 2 placeholder |

## To check

- **Finance:** a220: price ÷ lease a day = 1000, not the 2,000 days of Settings leaseRule (F4 revised with D78).
- **Finance:** a320: price ÷ lease a day = 1000, not the 2,000 days of Settings leaseRule (F4 revised with D78).
- **Finance:** b737: price ÷ lease a day = 1000, not the 2,000 days of Settings leaseRule (F4 revised with D78).
- **Milestones:** experimenter: waits for its measure in the game (D87 experiments logged with a prediction), not built yet; the teacher panel leaves it out for now.
- **Milestones:** worthIt: waits for its measure in the game (D88's worth line on a kept change), not built yet; the teacher panel leaves it out for now.
- **Milestones:** charterWinner: waits for the Charter desk (D90), not built yet; the teacher panel leaves it out for now.
- **Milestones:** clashServed: waits for clashing weeks (D90), not built yet; the teacher panel leaves it out for now.
- **RouteNews:** hajj_2031: route `none` is not on the Routes sheet.
- **RouteNews:** hajj_2032: route `none` is not on the Routes sheet.
- **RouteNews:** hajj_2033: route `none` is not on the Routes sheet.
- **Routes:** ist is loaded, but its archetype "long_haul_mixed" is not live. The game uses the route's own demand table and applies no business/leisure or season multipliers to it.

## Notes

- **Aircraft:** dhc6 differs from Pass 1 (Pass 1 → workbook): dayCost 600 → 900, listPrice 5000 → 10000. The workbook wins.
- **Aircraft:** saab340 differs from Pass 1 (Pass 1 → workbook): fuelPer100Km 30 → 25, hourlyCost 240 → 200, dayCost 900 → 1200, listPrice 9000 → 22000. The workbook wins.
- **Aircraft:** atr72 differs from Pass 1 (Pass 1 → workbook): fuelPer100Km 45 → 40, hourlyCost 400 → 350, dayCost 1400 → 1800, listPrice 15000 → 36000. The workbook wins.
- **Aircraft:** e190 differs from Pass 1 (Pass 1 → workbook): speedKmh 800 → 900, dayCost 2500 → 3500, listPrice 30000 → 70000. The workbook wins.
- **Events:** D104: track B rows (Events, EventOptions, RouteNews) are loaded with their track; the game plays the airline's track in chapter 1's autumn (Settings autumnTrack, the teacher's switch).
- **Events:** events are not in date order (harmless; the game sorts them).
- **Events:** reputation is switched off in the prototype, so star effects do nothing yet: events none; challenges 2, 5. Those choices then differ only in cash.

## Chapter 1 touches

Rows dated on or before 28 Dec 2030 (chapter 1's review) that the game would read but are not `live`, and values the chapter-1 flow needs that the workbook lacks. The game reports these; it never invents a value.

- **Events:** undercut_dub on 05 Sep 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** storm on 06 Sep 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** crew on 12 Sep 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** fuel_shock on 14 Oct 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** fault on 24 Oct 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** football_final on 02 Nov 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** price_war on 11 Nov 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** oil_find on 02 Dec 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** first_snow on 16 Dec 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** christmas on 24 Dec 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** school_trip on 10 Sep 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** dub_strike on 18 Sep 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** snack_supplier on 24 Sep 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** sponsor_club on 01 Oct 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** slot_squeeze on 07 Oct 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** tanker_offer on 14 Oct 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** storm_b on 25 Sep 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** dub_concert on 05 Oct 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** price_war_b on 21 Oct 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** fault_b on 19 Sep 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** crew_b on 16 Oct 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Events:** ams_fair on 10 Oct 2030 is `parked (Bertie 30 Oct: all one-off events parked)`: not loaded.
- **Routes:** ist opens on day 64 but its archetype `long_haul_mixed` is not live: no weekend or season multipliers on this route, and the game says so on its route card.
- **Settings:** `timeSkip` is `placeholder`: not loaded (the game builds teacher skips of 0 / 1 / 4 / 8 weeks from the brief and reports it here).
- **Settings:** `reputationFromDate` is `placeholder`: not loaded (a date gate only in chapter 1).
- **Catering:** no live rows: the game has no snack options.

## Chapter 3 touches

The Settings rows chapter 3 reads (D78–D81), as loaded.

- `overdraftFromDate`: 2031-09-01
- `overdraftLimit`: one week's average profit
- `overdraftDailyCharge`: 0
- `overdraftAtLimit`: purchases and fuel orders blocked; flights continue
- `buyLeasedPlane`: yes, at list price; the lease stops that day
- `leaseReturn`: at a month end, no charge
- `timeToAffordWeekly`: (price − cash) ÷ profit a week = weeks to wait
- `missedHuntH1Effect`: chapter-3 opening cash shown £2,000 high until the first audit
- `twoLegRotation`: Sydney via Singapore
- `bigPlanePriceRule`: doubled from v5.2
- `chapter3SetUpDays`: 7
- `challengeRewardRule`: a share of a day's profit, or stars
- `secondCrewCost`: 250
- `leaseRule`: A220/A320/737 ÷ 1,000 a day (prices not doubled); from the 757 up ÷ 2,000
- **EventOptions:** 27 option rows for 9 events (a380_offer, ash_cloud, ash_cloud2, blogger, fees_rise, fog, mystery_shopper, overdraft_offer, storm2).
- **Two-leg routes:** syd (10,900 km + 6,300 km, 4 days).

## Working on paper (D86) and chapter 4 (D82–D85) touches

The Settings rows these read, as loaded.

- `workingOnPaper`: True
- `twoTriesRule`: True
- `sumNumbering`: running number per pupil, never reset
- `launchDaySums`: 1 the game demonstrates building a formula, Excel-style (click B2, ×, click B3, Enter; then the callout) · 2 the pupil builds the second fare's formula himself (Enter to finish) · 3 Dublin at £90 worked on paper (the one counted question) · profit by formula
- `fuelHandSum`: the weekly order: blocks × price per 1,000 L
- `signOffCapPerWeek`: 3
- `financeFromDate`: 2032-09-06
- `financeShape`: deposit, then 40 monthly payments
- `chapter4SetUpDays`: 7
- `a380FillQuestion`: demand ÷ seats
- `campaignProjectDate`: 2032-10-04
- **Finance:** a220 £100,000 + £5,000 × 40 a month, a320 £120,000 + £7,000 × 40 a month, b737 £120,000 + £7,000 × 40 a month, b757 £1,000,000 + £50,000 × 40 a month, b787 £4,000,000 + £200,000 × 40 a month, a340 £2,000,000 + £200,000 × 40 a month, b777 £8,000,000 + £400,000 × 40 a month, a350 £10,000,000 + £500,000 × 40 a month, b747 £16,000,000 + £600,000 × 40 a month, a380 £20,000,000 + £1,000,000 × 40 a month.
- **Campaign:** project (live), brief (live), choices (live), portfolio (live), aiSignals (live), focusGroup (live), reach (placeholder), funnel (placeholder), honesty (live), teacherOverride (live).

## Decision support (D87) and what a change was worth (D88) touches

The Settings rows and PlanTips columns these read, as loaded.

- `operationsCheck`: True
- `blockPreview`: True
- `missedProfitDisplay`: words for the pupil; figures for the teacher
- `reviewFixLink`: True
- `planningSupport`: guided
- `experimentFlow`: choose variable → predict → change one thing → model → compare → decide
- `helpMeInvestigate`: True
- `planImprovedBanner`: True
- `whatWasItWorth`: change per unit × units = a day; × 7 = a week
- **PlanTips:** peak_unserved (priority 1, Change the times), service_weak (priority 2, Change the times), turned_away (priority 2, Change the fare | Change the number of services), fare_too_high (priority 2, Change the fare), fare_too_low (priority 3, Change the fare), idle_plane (priority 3, Change the number of services), long_leg_warning (priority 3, Change the aircraft), range_fail (priority 1, Change the aircraft), all_good (priority 9), general_tradeoff (priority 9), fare_lower_fills (priority 3, Change the fare), weekend_only_news (priority 1, Change the number of services), plane_unused (priority 1, Change the number of services | Change the aircraft), loss_making_service (priority 1, Change the times | Change the fare | Change the number of services), plan_loses_money (priority 0), all_full_capacity (priority 1, Change the fare | Change the aircraft).

## Fuel storage (D89) touches

The Settings rows and the Finance row these read, as loaded.

- `fuelLotSize`: 1000
- `tankCapacity`: 8000
- `tankWeeksOfFuel`: 3
- `fuelFarm`: chapter 3: buy storage
- **Block sizes:** 1,000 L; 10,000 L from 2031-01-06; 100,000 L from 2031-09-01.
- `tankUpgradeDay`: withdrawn (not loaded).
- `tankCapacityUpgraded`: withdrawn (not loaded).
- **Fuel farm:** 1,500,000 L for £2,000,000 from 2031-09-01; stage 2 3,000,000 L for £3,000,000 more from 2032-09-06.

## Screens brief (D96–D99) touches

Taken from v5.15 on top of v5.8 (`tools/take_parts.py`): the Settings rows and sheets these read, as loaded.

- `reviewAsSpreadsheet`: True
- `fuelAccounting`: cash buys fuel into the tank; profit counts only the fuel burned, at the price paid
- `fuelFillLabel`: Most I can afford: N blocks
- `compareLastWeek`: True
- `keyboardShortcuts`: Ctrl+→ / Ctrl+← between Home, Plan and the Operations Wall; Esc closes a panel; Enter checks a sum
- `soundSet`: tap · slot · check-tick · query · result-plate · cash · fuel-pour · plane-move · day-tick
- `dailyColour`: True
- `tipGainGate`: 50
- `allFullCapacityTip`: True
- `plannerUpgrades`: earned at a review; fallback a week later
- `operationsBriefings`: full screen; 30–60 s; advance by doing, never by Next; a Pause & discuss state at each stop
- `flightDaysFromDay`: earned: week-3 review (day 21); fallback day 28
- **DailyColour:** school_group (Thu, every 4), tailwind (Wed, every 2), headwind (Fri, every 5), no_shows (Mon, every 3), late_bus (Tue, every 5), corporate_block (Wed, every 6), quiet_day (Thu, every 7), sunny_weekend (Sun, every 3).
- **Upgrades:** weekend_schedules → flightDays (All week / Mon–Fri / Sat–Sun), seasonal_plans → Seasonal plan sets (a named plan with start and end dates), assign_planes → Assignment-level planning (D91) and fleet groups: short-, medium- and long-haul fleets, each with its own planning view, fuel_farm → The fuel farm on the Fuel desk (D89).
- **Briefings:** fare_lever (briefing-fare.html), weekend_demand (briefing-weekend.html), fuel_cash_tank_profit (briefing-fuel.html), aircraft_efficiency (briefing-efficiency.html), seasons (briefing-seasons.html), cash_to_fly (briefing-cash-to-fly.html), how_airline_makes_money (None, not built yet), time_of_day (None, not built yet).

## Screens brief 3 (D101–D102) touches

Taken from v5.17 on top of v5.8 (`tools/take_parts.py`): the Settings rows and sheets these read, as loaded.

- `adaptToOnlyFlight`: 0.5
- `demandShapeDisplay`: route demand by band, flexible shown separately; the selected flight's catchable slice highlighted
- `flightTimeDecay`: per kind of sum, whole game: Calculate twice, then Build, then Model
- `timeAnswerFormat`: hours + minutes (selector 0, 15, 30, 45)
- `flightTimesTable`: fixed-width columns; the active sum in the instrument below with its cell highlighted; a 'time saved' column between aircraft
- `weekPlanTutorial`: removed
- `redMeans`: only genuinely bad or urgent: an invalid timetable, a plane that can't reach a route, a real loss, a disruption
- `opportunityDisplay`: quiet type with an 'opportunity' label; gold only on the single biggest opportunity on a screen
- `resultsFraming`: lead with the result and the comparison with last week; variance with its reasons; 'passengers we couldn't carry' totalled once; cash change as profit − fuel bought
- `flightInspector`: fixed bar under the timetable
- `activeRoutesCollapsible`: True
- `weekGraphDefault`: weekly history (profit per week so far, projection as a faint marker); 'this week by day' as a tab
- `dailyColourLimit`: at most two a week; never the same item twice in a row; no duplicate lines
- `comingUp`: Roadmap sheet
- `aircraftWorthCheck`: inside the comparison, not a separate page
- `teacherTestMode`: teacher panel, behind the PIN; amber TEST MODE bar; Answer · Answer all · Auto-plan · Run week/month · Skip briefing · Jump to… · Show the answer · Event now
- `waitCostLine`: idle days × day cost
- `aircraftCardMeasure`: extra profit for the airline (incremental), one measure on the whole screen
- `demandStripMode`: follows the selected flight's route; otherwise route tabs (each route · All)
- **Roadmap:** Week 2 (day 8), Week 3 (day 15), Week 4 (day 22), Week 5 (day 29), Week 6 (day 36), Week 7 (day 43), Week 8 (day 50), Week 10 (day 64), Week 11 (day 71), Week 12 (day 78), December (day 85), End of this build (day 118), September 2031 (day 330), D101/D110: Home shows NOW, NEXT and LATER from these rows. Planner upgrades are never listed. Recomputed 31 Oct from the shifted calendar (the earlier rows were a week early: backlog item 22). (day 700).
- **Fuel, weeks 1–8:** £1.20 · £1.47 · £1.68 · £1.62 · £1.74 · £1.97 · £2.94 · £2.43.

## D103 touches (Briefing 13)

Bertie's rules of 18 Oct 2026, added to the installed workbook: the Settings rows the game reads, as loaded.

- `pupilReserve`: set by the pupil; default £0
- `bustRule`: 3 grounded days in a week; the airline closes and starts again from the beginning of the chapter (Launch Day in this chapter-one build)
- `standingAim`: Make as much money as you can. | In January you'll choose what kind of airline you are. | Keep cash for emergencies: you decide how much. | Run out of cash and the airline closes. | You start again from Launch Day. No loans.

## D104 touches (What a fare does, rebuilt)

The briefing's fixed teaching example, as loaded from the BriefingData sheet (not live route data).

- `fare_lever` · `route`: Dublin
- `fare_lever` · `plane`: Twin Otter
- `fare_lever` · `seatsPerPlane`: 19
- `fare_lever` · `planes`: 2
- `fare_lever` · `fares`: 60 · 70 · 80 · 90 · 100 · 110 · 120 · 130 · 140
- `fare_lever` · `wantToFly`: 100 · 80 · 64 · 50 · 40 · 36 · 30 · 24 · 18
- `fare_lever` · `sellFare`: 100
- `fare_lever` · `startFare`: 100
- `fare_lever` · `seatsRunOutFare`: 70
- `fare_lever` · `compareFares`: 100 · 110
- `fuel_cash_tank_profit` · `cash`: 8600
- `fuel_cash_tank_profit` · `price`: 1.3
- `fuel_cash_tank_profit` · `history`: 1.22 · 1.25 · 1.3 · 1.37 · 1.47 · 1.41 · 1.36 · 1.3 · 1.35 · 1.3
- `fuel_cash_tank_profit` · `buyL`: 3000
- `fuel_cash_tank_profit` · `tank`: 5000
- `fuel_cash_tank_profit` · `perDay`: 600
- `fuel_cash_tank_profit` · `days`: 5
- `fuel_cash_tank_profit` · `tickets`: 6660
- `fuel_cash_tank_profit` · `otherCosts`: 3610
- `flight_time` · `route`: Amsterdam
- `flight_time` · `plane`: Twin Otter
- `flight_time` · `fasterPlane`: Saab 340

## D105 touches (every sum on the Sheet)

The handover of 19 Oct (evening), section 7.10: the Settings row, the SheetSums sheet and the hints, as loaded. Cash, tank, profit's example is under D104's list.

- `fuelDeskOpensDay`: 15
- **Launch Day** `B4` Ticket revenue: = B2 × B3 (Passengers × Fare) · ƒ · demo · `launch.demo`
- **Launch Day** `C4` Ticket revenue: = C2 × C3 (Passengers × Fare) · pupil · formula · `launch.build`
- **Launch Day** `D4` Ticket revenue: = D2 × D3 (Passengers × Fare) · pupil · book · `launch.tickets`
- **Launch Day** `E4` Ticket revenue: = E2 × E3 (Passengers × Fare) · ƒ · airline
- **Launch Day** `F7` Fuel burned: = litres × price (600 L at £1.20) · ƒ · airline
- **Launch Day** `F9` Profit: = F5 − F8 (Total revenue − Total costs) · ƒ · airline
- **Changes (week 2 on)** `B2…C7` Passengers a day, Empty seats, Fare, Ticket revenue a day, Over a week: given and ƒ (Now · With your change) · ƒ · airline
- **Changes (week 2 on)** `D5` Difference (a fare change: ticket revenue a day): = C5 − B5 (With your change − Now) · pupil · build once · `changes.difference`
- **Changes (week 2 on)** `D7` Difference (a plan change: profit a day): = C7 − B7 (With your change − Now) · pupil · build once · `changes.difference`
- **Sunday review** `B9` Profit this week: = B2 + B3 + … + B8 (week 1; week 2 first) · =SUM(B2:B8) with Σ SUM (shown in week 2, from week 3 only) (Mon + Tue + … + Sun) · pupil · formula · `week.total`
- **Sunday review** `B11` Difference from the plan: = B10 − B9 (the larger first) (Projected on Monday − Profit this week) · pupil · build · `week.difference`
- **Sunday review** `B13` Average a day: = B9 ÷ B12 (Profit this week ÷ Days flown) · pupil · formula · `week.average`
- **WorkingMethods hints:** 11 of 31 relationships have a hint template.

## 21 Oct touches (the play-test of 21 Oct)

Bertie's handover of 21 Oct, section 11: the formula-only sums, the day Σ SUM unlocks and the screen text, as loaded.

- **Launch Day** `C4` Ticket revenue: formula-only
- **Sunday review** `B9` Profit this week: formula-only
- **Sunday review** `B13` Average a day: formula-only
- **Calendar skills:** none (Σ SUM falls back to the week 3 review).
- `fuel.tour.1`: Your tank · holds {capacity}, {weeks}. The dashed line shows the {need} this week needs. · [Next ▶]
- `fuel.tour.2`: Market: · today's price for a litre, and what it might cost next week. The news underneath says why. · [Next ▶]
- `fuel.tour.3`: Place a purchase order: · choose how many blocks to buy, then check the cash you'll have left. · [Got it]
- `opener.newRoutes`: NEW · {Count} new routes open: {routes}. · [Add a route ›]
- `opener.newRoute`: NEW · A new route opens: {routes}. · [Add a route ›]
- `opener.weekends`: NEW · WEEKENDS · Plan Saturday and Sunday on their own · Different numbers of people want to fly at the weekend. Switch to **Sat–Sun** to see the weekend's flights, then edit the plan to fit. · [Got it]
- `studio.routes`: NEW · ROUTES · {Count} new routes open this week · {routes}. Add one here, then give it flights on the timetable. · [Got it]
- `studio.route`: NEW · ROUTES · A new route opens this week · {routes}. Add it here, then give it flights on the timetable. · [Got it]
- `studio.weekends`: NEW · WEEKENDS · Plan Saturday and Sunday on their own · Different numbers of people want to fly at the weekend. Switch to **Sat–Sun** to see them, and give those days their own flights. · [Got it]
- `changes.difference`: NEW · YOUR CHANGE · What the Difference column means · **Difference = [A] With your change − [B] Now** · {signs} · First, work out **{cell}**: the difference in {row}. · [Got it]
- `changes.line`: Read the note beside the sheet, then press **Got it**.
- `review.sumSkill`: NEW SKILL · SUM · There's a quicker way · You added the {days} days by clicking each one. Spreadsheets have a shortcut for a whole column. · Press **Σ SUM**, drag down the **Profit** column from {first} to {last}, then press [Enter]. · [Try it]
- `review.sum.wait`: Press **Σ SUM**, then drag down the Profit column from {first} to {last}. The sheet adds them up.
- `review.sum.go`: Now drag down the Profit column, from {first} to {last}.
- `review.sum.drag`: Let go on {lastDay}'s profit ({cell}), then press Enter.
- `review.total.done`: ✓ The sheet added the {days} days: **{total}**. Next: the difference from the plan, in your book.
- `review.total.card`: FORMULA · Profit this week = add the {days} days · Click each day into the formula. The sheet adds them up.
- `review.total.cardSum`: FORMULA · Profit this week = add the {days} days · =SUM({range}) added {first} to {last}.
- `review.average.card`: FORMULA · Average a day = profit this week ÷ days flown · Click the two cells. The sheet works it out.
- `review.average.done`: ✓ The sheet worked out the average: **{mean}** a day.
- `review.footer`: Build each formula by clicking the cells. The sheet adds up; work out the difference from the plan in your book.
- `review.unflown`: You could fly these new routes. · Red Kite flies them for now, so fewer people are left wanting to fly with you each day: {list}
- `flightTimes.line`: Work it out in your book. Write **Sum {n}** beside it, then type the time in **{cell}**. · [Give me a hint]
- `flightTimes.build`: Click the cells to build the formula. Then work it out in your book and type the time in **{cell}**.
- `flightTimes.formula`: Click the cells to build the formula. The sheet works out the time in **{cell}**.
- `flightTimes.f`: ƒ worked out for you
- `flightTimes.footer`: Work out the flight times on the sheet, then go on to the timetable.
- `flightTimes.card`: Flight time = distance ÷ speed · {plane} to {route}
- `signal.build`: BUILD IT ON THE SHEET · Build the formula, then press [Enter].
- `signal.paper`: WORK IT OUT ON PAPER · Work it out on paper. Write [SUM {n}] beside it. · Type the answer in **{cell}**, then press [Enter].
- `signal.done`: ✓ Done: {what}
- `line.paper`: Type your answer in {cell}, then press Enter. · [Give me a hint]
- `line.build`: Click each day, Monday to Sunday, then press Enter. · [Give me a hint]
- `review.example.sub`: First, watch how it works with made-up numbers.
- `review.example.label`: FINANCE'S EXAMPLE · MADE-UP NUMBERS
- `review.example.watch`: EXAMPLE · WATCH · Watch: calculate the total profit from Monday to Wednesday · Finance presses **Σ SUM**, drags down the Profit column from Monday to Wednesday, then presses [Enter]. The sheet adds them up.
- `review.example.done`: EXAMPLE · WATCH · That's how Σ SUM works · Press **Σ SUM**, drag down a column, then press [Enter]: the sheet adds every cell you dragged over. · **Your turn: the profit for the whole week, Monday to Sunday.** · [My turn ▶]
- `review.example.line`: Watch: Finance presses Σ SUM and drags from Monday to Wednesday.
- `review.example.lineDone`: ✓ Monday to Wednesday: {total}. The sheet added them up.
- `review.total.signal`: Profit this week · Click each day's profit, Monday to Sunday. Then press [Enter]. · The sheet adds them up.
- `review.total.count`: {n} of {days} days. Keep going down to {last}.
- `review.total.clickDone`: ✓ You added the week: {total}. Now try the quicker way.
- `review.sum.signal`: Profit this week, the quick way · Let go on {lastDay}'s profit. Then press [Enter] to finish the formula. · The sheet adds the whole column.
- `review.sum.signal3`: Your turn: calculate the profit for the whole week, {first} to {last} · Press **Σ SUM**, drag down your Profit column from {first} to {last}, then press [Enter]. · The sheet adds the whole column.
- `review.sum.done`: ✓ Same answer, **{total}**, in one drag. From next week, use Σ SUM. Now the average a day.
- `review.average.signal`: Average a day · Click **Profit this week**, press **÷**, click **Days flown**. Then press [Enter]. · The sheet works it out.
- `review.done.total`: ✓ Done: **{total}** profit for the week
- `review.done.average`: ✓ Done: about **{mean}** a day
- `review.done.line`: ✓ Week {n}'s accounts are done.
- `launch.watch`: FINANCE WORKS IT OUT · WATCH · [Your turn ▶]
- `launch.watch.footer`: Launch Day · watch Finance work out the first fare, {route} at £{fare}. · [Your turn ▶]
- `launch.paper`: {route} at £{fare}: the ticket revenue
- `launch.compare.head`: NEW ROWS · One flight, two ways
- `launch.compare`: One flight, two ways: which earns more? · Work it out on paper. Write [SUM {n}] beside it. · Type the answer in **{cell}**, then press [Enter].
- `launch.compare.footer`: Launch Day · the last question. Finance has totted up your plan, fuel included.
- `launch.fuel`: {litres} at {price}
- `whatif.title`: What if you change a fare? · Plan week {n}
- `whatif.first`: NEW · WHAT IF · Try a fare before you set it · Press **−** or **+** on a fare: £1 at a time. Who wants to fly, seats filled, ticket revenue and profit all work themselves out (ƒ), for a day, a week and a month. Nothing to write in your book. When you like what you see, press **Set my fares**. · [Got it]
- `whatif.changed`: WHAT CHANGED, AGAINST THE FARES YOU HAVE NOW · [↶ Back to my fares]
- `whatif.footer`: Plan week {n} · try fares before you set them. · [Set my fares ▶]
- `fuel.order`: YOUR ORDER
- `fuel.order.above`: ✓ Above your {reserve} reserve
- `fuel.order.below`: ! Below your {reserve} reserve
- `fuel.position.tag`: WITH THIS ORDER
- `tt.first`: NEW · MORE ROOM TO PLAN · Drag flights where you want them · Grab a flight by its dots and drag it along the day. Drag a route from **Add a flight** onto a plane to add one. The people above show who each flight can catch. **☰ Show menu** brings the menu back. · [Got it]
- `tt.tray`: Add a flight · drag one onto a plane
- `tt.fits`: ✓ Fits · leaves {dep}, back {back}
- `tt.cannot`: ! Doesn't fit today: it would be back at {back}, after the day ends at {close}
- `tt.key`: Flights snap to the quarter hour · the day runs {open} to {close}
- `shelf`: Briefings · Teacher test mode: watch any briefing. Nothing here goes in the pupil's record or changes the game. · [◀ Back to the game]
- `build.end`: TEST BUILD · End of chapter one · End of chapter one. This test build stops here.
- `launch.title`: Ticket revenue for each flight, at each fare
- `launch.colhead`: your {n} flights · your flight
- `launch.job`: LAUNCH DAY · YOUR JOB · Work out the ticket revenue for each flight · Ticket revenue = **passengers × fare**. · [Watch ▶]
- `launch.job.footer`: Launch Day · read the job first.
- `launch.demo`: Watch: Finance clicks the passengers, **{p}**, then presses **×**. · Watch: then the fare, **{f}**, and Finance presses **Enter**.
- `launch.demo.footer`: Launch Day · watch Finance build the first formula.
- `launch.how`: HOW A FORMULA WORKS · Finance built a formula · **= {a} × {b}** means **passengers × fare**. Each cell gets its own colour, so you can see which cell is which. · Pressing **Enter** tells the sheet to work it out. The sheet did the multiplying: **{money}**. · [Your turn ▶]
- `launch.how.footer`: Launch Day · Finance built the first formula.
- `launch.build`: {route} at £{fare}: the ticket revenue · Click the passengers, press **×**, click the fare. Then press [Enter]. · The sheet works it out. · Nothing to write in your book.
- `launch.build.line`: Your turn: build it, then press Enter.
- `launch.build.footer`: Launch Day · your turn: build it.
- `launch.paper.footer`: Launch Day · the last one, on paper.
- `launch.paper.hint`: £{fare} is {d} × {mult}. First work out {p} × {d}, then multiply by {mult}.
- `launch.done`: ✓ Every Launch Day sum is done. Finance filled in {others} and your plan: profit **{profit}** a day.
- `launch.done.footer`: Launch Day · done. Next, get ready to fly. · [Ready to fly ▶]
- `why27`: WHY {pax}? · {pax} of the {want} can catch your flights · {want} people a day want to fly to {route} at £{fare}. {pax} of them want to go when your {times} leaves. The other {rest} want a time you don't fly. · [Got it]
- `why27.line`: Read the note, then press Got it.
- `ld.results`: NEXT · Launch Day: how it went · {date} · every flight landed · Your plan flies again **every day, Tuesday to Sunday**. First, a quick check of the plan. On Sunday you'll do the week's accounts. · [Check my plan for the week ▶]
- `ld.results.footer`: Launch Day is done.
- `plancheck`: Your plan for the rest of week 1 · {from} to {to} · the same flights every day · [Fly Tuesday to Sunday ▶]
- `plancheck.flights`: Your flights, every day · {plane} · seats filled on Launch Day
- `plancheck.checks`: Before it flies · Every flight fits in the day, {open} to {close}. · Every flight made money on Launch Day. · Seats filled: **{sold} of {seats}**. · **{n} people a day** wanted seats you didn't have ({list}). A chance for later, when you have more seats.
- `plancheck.look`: **{route} {time}** lost money on Launch Day: {sold} of {seats} seats at £{fare}. Change it before the week flies? · [Fly it anyway ▶]
- `plancheck.under`: Nothing to work out: Finance keeps the sheet up to date each day. **Change my plan** opens the timetable; **Fly Tuesday to Sunday** runs the week. · [Change my plan]
- `plancheck.footer`: Check your plan, then fly the rest of the week.
- `weekflies`: Week 1 is flying · Your plan, every day, Tuesday to Sunday. Sunday: the week's accounts. · [Skip to Sunday ⏭]
- `weekflies.sofar`: So far this week · Profit, {days} · Seats filled · People who wanted seats you didn't have
- `weekflies.footer`: The week runs on its own. Nothing to work out until Sunday.
- `weekflies.tile`: ✓ flown · profit · flying now · {time} · {n} of {total} flights out · waiting · Normal · Fast · Live Operations
- `plancheck.changed`: {plane} · seats your plan should fill · Every flight should make money on your plan. · **{route} {time}** is set to lose money: about {sold} of {seats} seats at £{fare}. Change it before the week flies? · Seats your plan should fill: **{sold} of {seats}**.
- `plancheck.nofit`: A flight on **{plane}** runs past {close}. Change your plan so every flight fits in the day.
- `plancheck.week`: Your plan for week {n} · {from} to {to} · the same flights every day · [Fly week {n} ▶]
- `plancheck.lastweek`: {plane} · seats filled last week, a day on average · Every flight made money last week. · **{route} {time}** lost money last week: about {sold} of {seats} seats a day at £{fare}. Change it before the week flies? · Seats filled last week: **{sold} of {seats}** a day. · **{n} people a day** wanted seats you didn't have last week ({list}). A chance for later, when you have more seats.
- `plancheck.week.under`: Nothing to work out: Finance keeps the sheet up to date each day. **Change my plan** opens the timetable; **Fly week {n}** runs the week. · [Change my plan]
- `plancheck.week.footer`: Check your plan, then fly the week.
- `weekflies.week`: Week {n} is flying · Your plan, every day, Monday to Sunday. Sunday: the week's accounts. · [Skip to Sunday ⏭]
- `pauseq.page`: Before week {n} flies · Question {i} of {k} from Finance. Work it out in your book. · Your own plan's sums came first at this pause, so Finance's other {w} waits for the next one. · [Next question ▶]
- `pauseq.footer`: Before week {n} flies · Finance's questions · [Carry on ▶]
- `pauseq.whatIfFirst`: NEW · WHAT IF · What if {city} were {fare}? · The **What if** sheet opens today, in the Studio: change a fare £1 at a time and every figure on its row works itself out (ƒ). · Its first sum by hand: {city} at **{fare}** instead of {now}. Ticket revenue a day = seats filled × fare.
- `pauseq.modelChange`: MODELLING · {city}: {now} or {fare}? · On your own flights, **{fare}** would earn more on {city} than your {now}. · How much more for one flight? Finance works out a day and a week from your answer.
- `pauseq.modelChange.pick`: MODELLING · Try a change · Your plan is already good: no other fare earns {gate} a day more. · Finance suggests two changes. Pick one and work out what it would do for one flight.
- `pauseq.timeToAfford`: THE PLANE SHOP · How long until you can afford the {plane}? · The {plane} costs **{price}**. You have {cash}, and your planes made about **{rate} a day** last week. · Days to afford = still to find ÷ profit a day, rounded up to a whole day.
- `pauseq.reviewRotation`: LAST WEEK · {q} · About {period}: {from} to {to}.
- `pauseq.fuelTwoPlanes`: FUEL · Which plane uses less fuel for each seat? · A trip to {city} and back in each of your planes: the {a} and the {b}. · Litres a seat = fuel a trip ÷ seats. Give it to one decimal place.
- `pauseq.ticketRevenueLong`: NEW ROUTE · What could {city} take in a day? · {city} opens today: {km} km away, further than any route you fly. · If everyone who wants to fly went at {fare}: who wants to fly × fare.
- `pauseq.projectedVsActual`: LAST WEEK · How far was {period} from the plan? · On Monday the plan said **{proj}**. The week made **{total}**. · Difference = the larger − the smaller.
- `day.title.launch`: Launch Day: how it went
- `day.title`: {date}: how it went
- `day.sub`: Day {n} of week 1 · every flight landed
- `day.profit`: Profit today
- `day.yesterday`: Yesterday **{money}** · {change}
- `day.first`: Your first day of flying.
- `day.routes`: Route by route
- `day.cols`: Route · Wanted · Seats · Flew · Couldn't carry
- `day.more`: More detail ›
- `day.tomorrow`: Tomorrow, {date}
- `day.same`: Same flights, same fares as today.
- `day.changed`: Your changed plan.
- `day.footer`: Keep the plan for tomorrow, or change it.
- `day.footer.sun`: Keep the plan for Sunday, or change it. After Sunday, the week's accounts.
- `day.keep`: Keep for tomorrow ▶
- `day.change`: Change my plan
- `day.anyway`: Fly anyway ▶
- `day.drawer`: Launch Day results · Costs today · Feedback · ✕ Close
- `read.loss`: Today lost **{money}**. Change something before tomorrow.
- `read.empty`: At **{fare}**, **{n} seats** flew empty on {route}. You took **{money} less** than at {lower}.
- `read.idle`: Your plane is on the ground from **{time}**. There's room for another flight.
- `read.full`: Full on every flight, and **{n} people** couldn't get a seat. Try **£10 more** on {route} tomorrow?
- `read.good`: Full planes at good fares. People turned away are a chance for later, when you have more seats.
- `read.weekend`: {day}s are quieter.
- `chg.fly`: Fly tomorrow ▶
- `chg.watch`: Watch: Finance works out the fare difference: **With your change**, press **−**, **Now**, then Enter.
- `chg.build`: Click **With your change**, press **−**, click **Now**. Then press Enter. The sheet works it out.
- `chg.week`: Ticket revenue over a week: the difference · The difference a day, times 7. Work it out in your book. Write SUM {n} beside it. Then type your answer in {cell} and press Enter.
- `chg.weekrow`: Ticket revenue over a week (× 7)
- `chg.weekf`: Difference a day × 7
- `fra.eyebrow`: NEW ROUTE · TOMORROW
- `fra.title`: {city} opens tomorrow
- `fra.line`: Further away, so a flight takes longer. People pay more to get there.
- `fra.go`: Plan tomorrow ▶
- `fra.footer`: A new route opens tomorrow: {date}.
- `fra.board`: {city} · NEW · FROM TOMORROW
- `fra.fits`: ✓ Fits · leaves {dep}, back {back}
- `fra.nofit`: ! Doesn't fit today: it would be back at {back}, after the day ends at {end}
- `fra.round`: {time} there and back
- `ld.profit.watch`: Watch: Finance clicks **Total revenue**, presses **−**, clicks **Total costs**, then presses **Enter**.
- `ld.profit.footer`: Launch Day · watch Finance work out the profit.
- `sum.next`: Next sum ▸
- `wk1.example`: FINANCE'S EXAMPLE · MADE-UP NUMBERS
- `wk1.yours`: YOUR WEEK
- `wk1.watch`: Watch: calculate the total profit from Monday to Wednesday
- `wk1.turn`: Your turn: calculate the profit for the whole week, Monday to Sunday · Press Σ SUM, drag down your Profit column from Monday to Sunday, then press Enter. Nothing to write in your book.
- `wk1.letgo`: Let go on Sunday ({cell}), then press Enter.
- `ready.todo`: Check the plan. Press **{button}** when it is right.
- `read.plain`: Every flight landed: **{pax} of {seats}** seats filled.
- `cmp.title`: Week {n} plan: what changed from last week
- `cmp.tab`: Week {n}
- `cmp.cols`: Week {last}, a weekday · Last week · Week {n} plan · This week · this week − last week · Difference
- `cmp.rows`: Passengers a day · Ticket revenue a day · Fuel burned a day · Total costs a day · Profit a day
- `cmp.line`: Finance filled in this week from your plan. Profit a day: **{diff}** than last week.
- `cmp.footer`: Week {n} plan · Finance compared it with last week.
- `plan2.old`: Before: {when}
- `plan2.when`: yesterday's plan · last week's plan
- `plan2.btn`: Show the old plan · Hide the old plan · Start again from the old plan
- `plan2.tab`: Before / after
- `plan2.title`: Before and after: the whole plan, a day
- `plan2.cols`: Before · old plan · After · new plan · after − before · Difference
- `plan2.rows`: {city} passengers · {city} ticket revenue · Flights a day · Ticket revenue a day · Fuel burned a day · Total costs a day · Profit a day
- `plan2.line`: Finance worked out both plans. Profit a day: **{diff}** than before.
- `plan2.footer`: Your old plan and your new plan, side by side. Back returns to your sheet.
- `plan2.wait`: After the sums: work out the change first.
- `whatif.rows`: Both routes, a day · All routes, a day · A week (× 7) · A month (× {w} weeks)
- `whatif.more`: {d} a day · {w} a week · {m} a month
- `pauseq.whatIfWeek`: WHAT IF · A WEEK · {fare} instead of {now}: what is that worth in a week? · At **{fare}**, {city} takes in **{more} more a day** than at {now}: the sheet worked it out (ƒ). · A week = more a day × 7. Then see what a month comes to on the What if sheet.
- `wk1.method`: Add each day · Use Σ SUM
- `wk1.next`: Next: a quicker way · When your whole week is added up, Finance shows you a faster way to do it.
- `wk1.add.watch`: EXAMPLE · WATCH · Watch: add up the profit from Monday to Wednesday · Watch: Finance clicks each day, with **+** between them.
- `wk1.add.done`: EXAMPLE · WATCH · That's how adding each day works · Click each day's profit and press **+** between them, then press [Enter]: the sheet adds them up. · **Your turn: the profit for the whole week, Monday to Sunday.** · [My turn ▶]
- `wk1.add.line`: Watch: Finance clicks each day, with + between them.
- `wk1.add.lineDone`: ✓ Mon to Wed: **{total}**
- `wk1.add.signal`: Calculate the total profit for the week
- `wk1.add.count`: {first} to {upto} so far. Keep going to {last}.
- `wk1.add.total`: ✓ Right: **{total}**
- `wk1.add.same`: ✓ Adding each day: **{total}**
- `wk1.sum.watch`: EXAMPLE · WATCH · Watch: a quicker way to add up Monday to Wednesday · Watch: **Σ SUM**, then drag Monday to Wednesday.
- `wk1.sum.signal`: Calculate the total profit for the week with Σ SUM
- `wk1.sum.same`: ✓ Same answer: **{total}**
- `changes.head.week1`: Yesterday's plan
- `changes.head.later`: Last week
- `changes.head.change`: With your change
- `frankfurt.card`: NEW ROUTE · Frankfurt opens tomorrow · Today your plane made {pct}% of the most it could have made. That's a strong plan, so a new route has opened early: Frankfurt. · [See Frankfurt ›]
- `finance.example.profit`: FINANCE'S EXAMPLE · Made-up numbers · 15 passengers × £60 = £900 of tickets. Costs: flying £300, fuel £120, landing £150, passenger charges £75. That's £645. Profit: £900 − £645 = £255. · [Now your turn]
- `fra.eve.more`: Every flight covered its costs, and the seats were {fill}% full.
- `fra.eve.board`: DEPARTURES · TOMORROW · ON TIME · {city} · NEW
- `fra.eve.chips`: {time} there and back · Further away: people pay more
- `fra.eve.rule`: **Tomorrow, {date}.** Build a new plan with {city} beside today's plan, then choose which one flies.
- `fra.eve.small`: It opens early after a day that made at least {pct}% of the most your plane could make, with every flight covering its costs and the seats at least {fill}% full.
- `fra.eve.footer`: {city} opens tomorrow. Plan tomorrow's flights. · [Plan tomorrow with {city} ▶]
- `tp.title`: Plan tomorrow: {date} · {airline} HQ · build a new plan and compare it with yesterday's
- `tp.title.week`: Plan week {n} · {airline} HQ · last week's plan stays for comparison · build a new one under it
- `tp.lane.old`: YESTERDAY'S PLAN · Flew yesterday · LAST WEEK'S PLAN · Flew last week · Flew on Launch Day
- `tp.lane.new`: NEW PLAN · For tomorrow · For this week · drag flights in
- `tp.drop`: Drag a flight here
- `tp.choice`: Profit a day · flew yesterday · Profit a day · last week · Profit a day · worked out · work it out first · [Choose ▶]
- `tp.compare`: COMPARE · Yesterday's plan · Last week's plan · New plan · Projected for tomorrow · Projected for this week
- `tp.footer`: Build a new plan for tomorrow. · Build a new plan for this week. · Choose the plan that flies tomorrow. · Choose the plan that flies this week. · Work out your new plan before you choose. · Work out your new plan before you choose. · [Work out my plan ▶]
- `tp.tray`: drag one onto the new plan
- `tp.co1`: NEW · TWO PLANS · Build a new plan for tomorrow. Compare it with yesterday's plan. · [Got it]
- `tp.co2`: TWO PLANS · Now work it out · Press **Work out my plan**. · [Got it]
- `ba.title`: Before / after: yesterday's plan and your new plan · Before / after: last week's plan and your new plan
- `ba.axis`: Profit a day · {n} flights
- `ba.co1`: BEFORE / AFTER · Yesterday's plan · {n} flights: {list}. It made {money} profit yesterday. · [Next ▸]
- `ba.co2`: BEFORE / AFTER · Your new plan · {n} flights: {list}. It should make {money} profit a day. · [Next ▸]
- `ba.co3`: BEFORE / AFTER · {city}'s {nf} · {pax} passengers × {fare} = {tk} a day. After its costs, {city} makes {profit} a day{than}. · [Next ▸]
- `ba.co3.than`: : more than {old} made yesterday
- `ba.co4`: BEFORE / AFTER · The difference a day · Your new plan should make {money} {more} a day{fewer}. Next, the sheet shows where it comes from. · [Work it out ▶]
- `ba.co4.fewer`: , with one flight fewer · with {n} flights fewer
- `ba.table`: What changes, a day · Flights · Passengers · Ticket revenue · Costs · Profit · Yesterday's plan · Last week · New plan · Difference
- `ba.footer`: Tomorrow's plan · see what changes before the sums. · This week's plan · see what changes before the sums.
- `chg3.crumb`: Work out my plan · first, the new route · then, {city}
- `chg3.route`: FIRST, {CITY} · {city} takes the place of {was} · Your {n} {city} {flights} replace the {m} {was} {wflights}. Finance has filled them in (ƒ). {city} brings in {rev} {revmore} a day, and makes {profit} {profmore} profit. · [Next: {next} ▸]
- `chg3.route.free`: FIRST, {CITY} · {city} uses time your plane had free · Your {n} {city} {flights} fly when your plane was on the ground. Finance has filled them in (ƒ). {city} brings in {rev} a day, and makes {profit} profit. · [Next: {next} ▸]
- `chg3.route.line`: ✓ Finance filled in {city}. Nothing to work out on this part.
- `chg3.route.rows`: Passengers a day · Fare · Ticket revenue a day · Costs a day · Profit a day
- `chg3.diff`: NEW · YOUR CHANGE · What the Difference column means · **Difference = With your change − {head}.** · {signs} · A minus means less. Watch Finance work out the first one. · [Watch ▶]
- `chg3.head.diff`: change − yesterday's · change − last week · Difference
- `chg3.last`: then, the whole plan
- `ld3.col`: Finance · made-up · Example
- `ld3.job`: LAUNCH DAY · THE PROFIT · Profit = Total revenue − Total costs · [Watch ▶]
- `ld3.mine`: Your turn: your plan's profit · Click **Total revenue**, press **−**, click **Total costs**. Then press [Enter]. The sheet works it out.
- `ld3.footer`: Launch Day · the profit. · Launch Day · your profit. · Launch Day · watch Finance, on made-up numbers.
- `wk1.co.add`: WEEK 1 ACCOUNTS · One way to find the week's total profit: add each day · [Watch ▶]
- `wk1.co.sum`: A SIMPLER WAY · A quicker way to do it in a spreadsheet · [Watch ▶]
- `wk1.avg.watch`: WATCH · Watch: Finance works out the average a day · Watch: Finance clicks **Profit this week**, presses **÷**, clicks **Days flown**, then presses **Enter**.
- `wk1.avg.mine`: Now it's your turn: calculate the average a day
- `wi2.title`: What if you change a fare? · Plan week {n} · {date}
- `wi2.cols`: your fare · what if · what if − yours · Difference
- `wi2.rows`: Seats filled a day · Fare · Ticket revenue a day · A week (× 7) · A month (× {w} weeks)
- `wi2.co1`: NEW · WHAT IF · What if {city} were £{step} more? · [Got it]
- `wi2.watch`: Watch: Finance clicks **Seats filled**, presses **×**, clicks **Fare**, then presses [Enter].
- `wi2.q1`: WHAT IF · 2 OF 4 · What if: ticket revenue a day · {seats} seats × {fare}.
- `wi2.q2`: WHAT IF · 3 OF 4 · A week: the difference · {more} more a day, times 7.
- `wi2.co4`: A LITTLE ADDS UP · £{step} more a ticket = {month} more a month · [Got it]
- `wi2.footer`: Plan week {n} · what a little more on a fare adds up to. · Plan week {n} · what a little more on a fare adds up to. · [Set my fares ▶]
- `home.now.week`: Week {n}: your plan flies again
- `ba.table.note`: Finance filled this in from your two plans (ƒ). Nothing to work out here.
- `ba.bracket`: {money} · a day
- `chg3.diff.line`: Read the note under the Difference column, then press **Watch**.
- `chg3.diff.sign`: **{v}** means the fare is {n} {dir}. · **{v}** means {lab} went {dir} by {n}. · higher · lower · up · down
- `ld3.line`: Press **Watch** when you're ready.
- `tp.co1.week`: NEW · TWO PLANS · Build a new plan for this week. Compare it with last week's plan. · [Got it]
- `tp.co2.week`: TWO PLANS · Now work it out · Press **Work out my plan**. · [Got it]
- `ba.co1.week`: BEFORE / AFTER · Last week's plan · {n} flights a day: {list}. Flown again this week, it would make {money} profit a day. · [Next ▸]
- `ba.co3.than.week`: : more than {old} would make
- `ba.co4.np`: BEFORE / AFTER · The difference a day · Your new plan should make {money} {more} a day{fewer}. · [Choose a plan ▶]
- `np.title`: Work out your new plan · {day}'s plan · worked out before you choose
- `np.cols`: your new plan · New plan · Yesterday's plan · new − yesterday · Difference · your flight · your
- `np.rows`: Passengers · Fare · Ticket revenue · Total revenue · Other costs · Fuel burned · Total costs · Profit
- `np.diff`: The difference in profit
- `np.line`: Your turn. · ✓ Your new plan should make {d} {more} a day than yesterday's.
- `np.footer`: {day}'s plan · work it out, then compare. · {day}'s plan · work it out, then compare. · [Before / after ▶]
- `day.tour.1`: REVIEW THE DAY · Your profit today · [Next ▸]
- `day.tour.2`: REVIEW THE DAY · Who wanted to fly, and who flew · [Next ▸]
- `day.tour.3`: REVIEW THE DAY · What next · What next: {city} opens tomorrow · [Next ▸]
- `day.tour.4`: REVIEW THE DAY · Your choice: plan tomorrow · [Got it]
- `takeoff.skip`: [Skip take-off ▶]
- `ld3.mine.task`: Calculate the profit
- `ld3.mine.line`: Your turn.
- `day.tour.0`: LAUNCH DAY · Review the day · [Start ▸]
- `np.task`: Calculate the ticket revenue · Calculate the total revenue · Calculate the profit
- `np.tk2`: The ticket revenue
- `ba.np.co1`: BEFORE / AFTER · Yesterday's plan: {flights} · [Next ▸]
- `ba.np.co2`: BEFORE / AFTER · Your new plan: {money} {more} a day · [Got it]
- `ba.np.footer`: {day}'s plan · what you worked out. · {day}'s plan · [Choose a plan ▶]
- `wk1.easier`: An easier method ▶
- `wk1.sum.same2`: ✓ Same answer: **{total}**
- `wk1.avg.go`: Now calculate the average ▶
- `wk1.avg.fin`: ✓ Finance: average a day **{mean}**
- `wi2.task`: Calculate the ticket revenue a day · Calculate the difference over a week
- `wi2.line`: Your turn.
- `wi2.x7`: Watch: Finance clicks **Ticket revenue a day**, presses **×**, types **7**, then presses **Enter**.
- `wi2.x7.go`: Finance shows you a week.
- `wi2.x4`: Watch: Finance clicks **A week**, presses **×**, types **{w}**, then presses **Enter**.
- `wi2.x4.go`: Finance shows you a month.
- `rival.news`: Red Kite takes over {city} from Monday. About a third of its passengers will fly with them for good.
- `board.note`: A word from the Board · Last week your plan made {yours}. The best plan with your planes would have made {best}. · Making a profit is good. Shareholders want the most profit your planes can make. · [Understood]
- `rival.week`: Red Kite has taken over {city}. About a third of its passengers now fly with them for good.
- `pics.go`: [Your week in pictures ▶]
- `pics.page`: How did week {n} go? · Your week in pictures · Sunday review · week {n} · [Plan week {next} ▶]
- `pics.back`: [◀ Back to the sums]
- `pics.g1`: Your plan against the best plan · Yours · Best plan · Gap · Wk {n} · New routes
- `pics.g2`: Where the money is · Profit for each hour of plane time · not in your plan
- `pics.q.paper`: Work it out on paper · How much more could your plan have made this week? Write {sum} beside it. · [Enter]
- `pics.q.read`: Read the graph · Which route earns most for each hour of plane time? Pick one. It counts as {sum}.
- `pics.monday`: [Last week's graphs]
- `news.rival`: NEWS · RED KITE AIR · Red Kite Air now flies to {city} · Fewer people will want to fly to {city} with you. · DEPARTURES · {airport} · LONDON · RED KITE AIR · Monday news · {date} · [Plan the week ▶]
- `news.board`: A NOTE FROM THE BOARD · The Board would like a word · Three weeks running, your plan made less than the best plan. · {airline} · THE BOARD · Profit is good. · The airline's owners want the most profit our planes can make. · Signed, the Board of {airline} · Monday news · {date} · [Plan the week ▶]
- `pics.q.wrong`: Not quite. One more try. · The answer: {answer}. (Best plan − yours.) · ✓ Right: {answer}
- `news.rival.times`: 07:10 · 12:40 · 17:55
- `wi2.co1.less`: NEW · WHAT IF · What if {city} were £{step} less? · [Got it]
- `wi2.co4.less`: A LITTLE ADDS UP · £{step} less a ticket = {month} less a month · [Got it]
- `wi2.co4.less.up`: A LITTLE ADDS UP · £{step} less a ticket = {month} more a month · [Got it]
- `wi2.co4.down`: A LITTLE ADDS UP · £{step} more a ticket = {month} less a month · [Got it]
- `brief1.lead`: Your first week in charge · Build the timetable, set the fares, work out the key numbers, then run your first week of operations. Every decision changes demand, revenue, costs and profit.
- `brief1.steps`: Your Week 1 plan: {n} simple steps · Build your timetable · Choose how many services to fly, where to and when. Make the best use of the aircraft's day. · Set fares · Choose a ticket price for each route. A higher fare earns more a ticket, but fewer people want to fly. · Work out the key numbers · Tickets, profit and fuel by hand, on the same page as the plan. The model shows the rest. · Run the week · Confirm the plan and watch the airline fly Monday to Sunday. Then the review: what did the week earn?
- `intro.tank.lead`: You have bought fuel ahead since week 3; in December you buy a month at a time.
- `end.next`: Chapter {n}, {name}, opens on {date}: long haul, overnight rotations and time zones; the 787 by lease; the airline type chosen. That part of the game is not built yet.

## Identity and photos (CR5)

Livery sheet: 12 colours, 4 stripes, 7 tail symbols, 4 logo shapes, 8 name suggestions. Photos live in `src/opening/assets/photos/` and are embedded by the build; credits are listed in `data/Photo-Credits.md`. The showroom's "coming soon" row reads the name, date and picture of aircraft that are not live (never their figures).

| Aircraft | Status | Artwork | Photo | Credit and licence |
| --- | --- | --- | --- | --- |
| dhc6 | live | dhc6 | none yet | — |
| saab340 | live | sf34 | none yet | — |
| atr72 | live | at72 | none yet | — |
| e190 | live | e190 | none yet | — |
| a220 | live | narrowbody | none yet | — |
| a320 | live | narrowbody | none yet | — |
| b737 | live | narrowbody | none yet | — |
| b787 | live | — | none yet | — |
| a350 | live | — | none yet | — |
| b747 | live | — | none yet | — |
| a380 | live | — | none yet | — |
| e175 | live | e175 | none yet | — |
| b757 | live | — | none yet | — |
| a340 | live | — | none yet | — |
| b777 | live | — | none yet | — |
| Prices from the A220 up are tuned to the cash curve (F5, replacing D16's three-tenths rule): on the Steady path each plane is a few lessons of saving away when it is meant to arrive. Tutorial planes (Twin Otter to E190, E175) keep launch-deal prices. Real prices are on the plane card for interest only. | None |  | none yet | — |

## The prototype's own data and the workbook's

The game uses the workbook's values. The prototype's own (in `data-world` and `data-planes`) only matter for routes and aircraft the workbook does not have yet.

| | Prototype's own data | Workbook (used) |
| --- | --- | --- |
| Dublin distance | 300 km | 450 km |
| Dublin fares | £50, £60, £70, £80 | £70, £80, £90, £100, £110 |
| Paris distance | 450 km | 300 km |
| Paris fares | £80, £90, £100, £110, £120 | £70, £80, £90, £100, £110 |
| Madrid distance | 1200 km | 1350 km |
| Madrid fares | £80, £90, £100, £120 | £150, £160, £170, £180, £190 |
| Marrakech distance | 2400 km | 2250 km |
| Marrakech fares | £100, £120, £140, £160 | £220, £230, £240, £250, £260 |
| New York distance | 5600 km | 5625 km |
| New York fares | £150, £200, £250, £300 | £470, £490, £510, £530, £550 |
| Dubai distance | 5600 km | 5400 km |
| Dubai fares | £200, £250, £300, £350 | £450, £470, £490, £510, £530 |
| Cairo distance | 3600 km | 3600 km |
| Cairo fares | £125, £150, £175, £200 | £330, £340, £350, £360, £370 |
| Lagos distance | 4800 km | 5000 km |
| Lagos fares | £150, £175, £200, £250 | £440, £460, £480, £500, £520 |
| Delhi distance | 7200 km | 6700 km |
| Delhi fares | £200, £250, £300, £350 | £560, £580, £600, £620, £640 |
| Tokyo distance | 9600 km | 9600 km |
| Tokyo fares | £350, £400, £450, £500 | £790, £810, £830, £850, £870 |
| Cape Town distance | 9600 km | 9700 km |
| Cape Town fares | £300, £350, £400, £450 | £800, £820, £840, £860, £880 |
| Singapore distance | 10800 km | 10900 km |
| Singapore fares | £350, £400, £450, £500 | £890, £910, £930, £950, £970 |
| Sydney distance | 17600 km | 17200 km |
| Sydney fares | £500, £600, £700, £800 | £1390, £1410, £1430, £1450, £1470 |
| DHC-6 Twin Otter price | £2,500 | £10,000 (launch deal £2,500) |
| DHC-6 Twin Otter running costs | £192 an hour, £900 a day | £150 an hour, £900 a day |
| DHC-6 Twin Otter fuel | 20 L per 100 km | 20 L per 100 km |
| Saab 340 price | £180,000 | £22,000 |
| Saab 340 running costs | £330 an hour, £1040 a day | £200 an hour, £1200 a day |
| Saab 340 fuel | 30 L per 100 km | 25 L per 100 km |
| ATR 72 price | £280,000 | £36,000 |
| ATR 72 running costs | £520 an hour, £1600 a day | £350 an hour, £1800 a day |
| ATR 72 fuel | 40 L per 100 km | 40 L per 100 km |
| Embraer E190 price | £300,000 | £70,000 |
| Embraer E190 running costs | £— an hour, £2650 a day | £900 an hour, £3500 a day |
| Embraer E190 fuel | 35 L per 100 km | 70 L per 100 km |
| Airbus A220 price | £450,000 | £300,000 |
| Airbus A220 running costs | £— an hour, £6250 a day | £1100 an hour, £3000 a day |
| Airbus A220 fuel | 45 L per 100 km | 80 L per 100 km |
| Airbus A320 price | £550,000 | £400,000 |
| Airbus A320 running costs | £— an hour, £6550 a day | £1300 an hour, £3500 a day |
| Airbus A320 fuel | 60 L per 100 km | 90 L per 100 km |
| Boeing 737 price | £600,000 | £400,000 |
| Boeing 737 running costs | £— an hour, £7150 a day | £1300 an hour, £3500 a day |
| Boeing 737 fuel | 62 L per 100 km | 90 L per 100 km |
| Boeing 787 Dreamliner price | £1,200,000 | £12,000,000 |
| Boeing 787 Dreamliner running costs | £— an hour, £15550 a day | £2000 an hour, £6000 a day |
| Boeing 787 Dreamliner fuel | 110 L per 100 km | 130 L per 100 km |
| Airbus A350 price | £1,600,000 | £30,000,000 |
| Airbus A350 running costs | £— an hour, £25650 a day | £2250 an hour, £6600 a day |
| Airbus A350 fuel | 120 L per 100 km | 140 L per 100 km |
| Boeing 747 price | £2,000,000 | £40,000,000 |
| Boeing 747 running costs | £— an hour, £7250 a day | £3400 an hour, £9200 a day |
| Boeing 747 fuel | 225 L per 100 km | 230 L per 100 km |
| Airbus A380 price | £2,600,000 | £60,000,000 |
| Airbus A380 running costs | £— an hour, £3450 a day | £4000 an hour, £12000 a day |
| Airbus A380 fuel | 250 L per 100 km | 250 L per 100 km |
| Second crew | £300 | £250 when duty is over 12 h, from 2031-01-06 (D51) |
| Rival switch rule (D50) | 1 in 5 switch when undercut | 0.1 per £10 dearer, cap 0.6, advertising × 0.5 |
| Starting cash | £5,000 | £5,000 |
| Start date | Sun 12 May 2030 | Mon 02 Sep 2030 |

## Engine rules

From the README sheet and Fable Pass 1, section 0, as `src/opening/engine/world-engine.js` implements them:

- A service is a round trip that earns one plane-load at the fare (return tickets).
- Five day bands: early 06:00–09:00, midmorning 09:00–12:00, midday 12:00–15:00, afternoon 15:00–18:00, evening 18:00–22:00 (from Pass 1; the prototype has three). A service belongs to the band it leaves home in.
- Time-locked passengers fly only in their band. In each band: demand × timeSensitiveShare × the band's share, rounded as at school (halves up). The rest are flexible and fill any seats left that day.
- People at a fare come from the route's demand table, not a formula.
- Costs per service: flying hours × hourly cost + landing fees at both ends + fuel + a charge for each passenger at home. Per day: the day cost, plus a second crew when duty is over 12 h (30 minutes before the first departure to 30 minutes after the last arrival).
- Fuel: the Calendar has a price for each day; the Market sheet has one for each week, used for time skips.
