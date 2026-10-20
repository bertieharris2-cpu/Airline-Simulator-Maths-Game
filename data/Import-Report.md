# Import report: Airline-World-Workbook.xlsx

*Written by `tools/import_world.py` on 20 Oct 2026. Loaded: live, optional rows. Written to `src/opening/parts/p2_data.html` as `data-workbook`; rebuild the prototype to use it.*

**0 to fix, 26 to check, 8 notes.**

## Loaded

| Sheet | Loaded | Rows by status |
| --- | --- | --- |
| Settings | 212 | 212 live, 10 placeholder |
| Archetypes | 5 | 2 later, 5 live, 2 note row |
| Routes | 29 | 29 live |
| RouteCatalogue | 0 | 21 moved to Routes |
| Aircraft | 15 | 15 live, 1 note row, 1 removed |
| Finance | 16 | 16 live, 2 note row |
| Airports | 1 | 1 later, 1 live, 3 removed |
| Calendar | 49 | 49 live |
| Market | 416 | 416 live |
| Events | 46 rows → 40 events | 3 later, 46 live, 1 note row, 3 placeholder, 2 removed |
| EventOptions | 65 | 65 live, 1 note row |
| Challenges | 6 | 6 live, 2 placeholder |
| Mechanics | 17 | 3 later, 17 live |
| Chapters | 4 | 2 later, 4 live, 1 note row |
| HandSumRules | 12 | 12 live, 1 note row |
| Catering | 4 | 4 live, 1 note row |
| PlanTips | 16 | 16 live, 3 note row |
| Milestones | 18 | 18 live, 1 note row |
| DailyColour | 10 | 10 live, 1 note row |
| Upgrades | 5 | 5 live, 1 note row |
| Briefings | 12 | 1 dropped, 12 live, 1 note row |
| Roadmap | 13 | 13 live, 1 note row |
| RouteNews | 101 | 101 live, 2 note row |
| Livery | 35 | 35 live, 1 note row |
| Hunts | 5 | 5 live, 1 note row, 2 placeholder |

## To check

- **EventOptions:** "fault" option 1 has a cash price £800 on day 53, but costs are a share of a day's profit from day 29.
- **EventOptions:** "sponsor_club" option 1 has a cash price £500 on day 30, but costs are a share of a day's profit from day 29.
- **EventOptions:** "tanker_offer" option 1 has a cash price £12000 on day 43, but costs are a share of a day's profit from day 29.
- **EventOptions:** "fault_b" option 1 has a costShare on day 18, before day 29.
- **EventOptions:** "crew_b" option 1 has a cash price £400 on day 45, but costs are a share of a day's profit from day 29.
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
- **Routes:** par (300 km): legs not on a quarter hour: Saab 340 40 min, ATR 72 40 min, Embraer E190 20 min, Airbus A220 20 min, Airbus A320 20 min, Boeing 737 20 min, Boeing 787 Dreamliner 20 min, Airbus A350 20 min, Boeing 747 20 min, Airbus A380 20 min, Embraer E175 20 min, Boeing 757 20 min, Airbus A340 20 min, Boeing 777 20 min.
- **Routes:** yyz (5700 km): legs not on a quarter hour: Saab 340 760 min, ATR 72 760 min, Embraer E190 380 min, Airbus A220 380 min, Airbus A320 380 min, Boeing 737 380 min, Boeing 787 Dreamliner 380 min, Airbus A350 380 min, Boeing 747 380 min, Airbus A380 380 min, Embraer E175 380 min, Boeing 757 380 min, Airbus A340 380 min, Boeing 777 380 min.
- **Routes:** los (5000 km): legs not on a quarter hour: DHC-6 Twin Otter 1000 min, Saab 340 667 min, ATR 72 667 min, Embraer E190 333 min, Airbus A220 333 min, Airbus A320 333 min, Boeing 737 333 min, Boeing 787 Dreamliner 333 min, Airbus A350 333 min, Boeing 747 333 min, Airbus A380 333 min, Embraer E175 333 min, Boeing 757 333 min, Airbus A340 333 min, Boeing 777 333 min.
- **Routes:** del (6700 km): legs not on a quarter hour: DHC-6 Twin Otter 1340 min, Saab 340 893 min, ATR 72 893 min, Embraer E190 447 min, Airbus A220 447 min, Airbus A320 447 min, Boeing 737 447 min, Boeing 787 Dreamliner 447 min, Airbus A350 447 min, Boeing 747 447 min, Airbus A380 447 min, Embraer E175 447 min, Boeing 757 447 min, Airbus A340 447 min, Boeing 777 447 min.
- **Routes:** tyo (9600 km): legs not on a quarter hour: Saab 340 1280 min, ATR 72 1280 min, Embraer E190 640 min, Airbus A220 640 min, Airbus A320 640 min, Boeing 737 640 min, Boeing 787 Dreamliner 640 min, Airbus A350 640 min, Boeing 747 640 min, Airbus A380 640 min, Embraer E175 640 min, Boeing 757 640 min, Airbus A340 640 min, Boeing 777 640 min.
- **Routes:** cpt (9700 km): legs not on a quarter hour: DHC-6 Twin Otter 1940 min, Saab 340 1293 min, ATR 72 1293 min, Embraer E190 647 min, Airbus A220 647 min, Airbus A320 647 min, Boeing 737 647 min, Boeing 787 Dreamliner 647 min, Airbus A350 647 min, Boeing 747 647 min, Airbus A380 647 min, Embraer E175 647 min, Boeing 757 647 min, Airbus A340 647 min, Boeing 777 647 min.
- **Routes:** sin (10900 km): legs not on a quarter hour: DHC-6 Twin Otter 2180 min, Saab 340 1453 min, ATR 72 1453 min, Embraer E190 727 min, Airbus A220 727 min, Airbus A320 727 min, Boeing 737 727 min, Boeing 787 Dreamliner 727 min, Airbus A350 727 min, Boeing 747 727 min, Airbus A380 727 min, Embraer E175 727 min, Boeing 757 727 min, Airbus A340 727 min, Boeing 777 727 min.
- **Routes:** syd (17200 km): legs not on a quarter hour: DHC-6 Twin Otter 3440 min, Saab 340 2293 min, ATR 72 2293 min, Embraer E190 1147 min, Airbus A220 1147 min, Airbus A320 1147 min, Boeing 737 1147 min, Boeing 787 Dreamliner 1147 min, Airbus A350 1147 min, Boeing 747 1147 min, Airbus A380 1147 min, Embraer E175 1147 min, Boeing 757 1147 min, Airbus A340 1147 min, Boeing 777 1147 min.
- **Routes:** hkg (9600 km): legs not on a quarter hour: Saab 340 1280 min, ATR 72 1280 min, Embraer E190 640 min, Airbus A220 640 min, Airbus A320 640 min, Boeing 737 640 min, Boeing 787 Dreamliner 640 min, Airbus A350 640 min, Boeing 747 640 min, Airbus A380 640 min, Embraer E175 640 min, Boeing 757 640 min, Airbus A340 640 min, Boeing 777 640 min.
- **Routes:** lax (8750 km): legs not on a quarter hour: DHC-6 Twin Otter 1750 min, Saab 340 1167 min, ATR 72 1167 min, Embraer E190 583 min, Airbus A220 583 min, Airbus A320 583 min, Boeing 737 583 min, Boeing 787 Dreamliner 583 min, Airbus A350 583 min, Boeing 747 583 min, Airbus A380 583 min, Embraer E175 583 min, Boeing 757 583 min, Airbus A340 583 min, Boeing 777 583 min.

## Notes

- **Aircraft:** dhc6 differs from Pass 1 (Pass 1 → workbook): dayCost 600 → 900, listPrice 5000 → 10000. The workbook wins.
- **Aircraft:** saab340 differs from Pass 1 (Pass 1 → workbook): fuelPer100Km 30 → 25, hourlyCost 240 → 200, dayCost 900 → 1200, listPrice 9000 → 22000. The workbook wins.
- **Aircraft:** atr72 differs from Pass 1 (Pass 1 → workbook): fuelPer100Km 45 → 40, hourlyCost 400 → 350, dayCost 1400 → 1800, listPrice 15000 → 36000. The workbook wins.
- **Aircraft:** e190 differs from Pass 1 (Pass 1 → workbook): speedKmh 800 → 900, dayCost 2500 → 3500, listPrice 30000 → 70000. The workbook wins.
- **Events:** D104: the six curveball events are loaded (dub_strike, school_trip, slot_squeeze, snack_supplier, sponsor_club, tanker_offer); their effects are in parts/p5w_d104.js.
- **Events:** D104: track B rows (Events, EventOptions, RouteNews) are loaded with their track; the game plays the airline's track in chapter 1's autumn (Settings autumnTrack, the teacher's switch).
- **Events:** events are not in date order (harmless; the game sorts them).
- **Events:** reputation is switched off in the prototype, so star effects do nothing yet: events undercut_dub, storm, crew; challenges 2, 5. Those choices then differ only in cash.

## Chapter 1 touches

Rows dated on or before 28 Dec 2030 (chapter 1's review) that the game would read but are not `live`, and values the chapter-1 flow needs that the workbook lacks. The game reports these; it never invents a value.

- **Routes:** ist opens on day 57 but its archetype `long_haul_mixed` is not live: no weekend or season multipliers on this route, and the game says so on its route card.
- **Settings:** `timeSkip` is `placeholder`: not loaded (the game builds teacher skips of 0 / 1 / 4 / 8 weeks from the brief and reports it here).
- **Settings:** `reputationFromDate` is `placeholder`: not loaded (a date gate only in chapter 1).

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
- **EventOptions:** 65 option rows for 24 events (a380_offer, ash_cloud, ash_cloud2, blogger, crew, crew_b, dub_strike, fault, fault_b, fees_rise, fog, mystery_shopper, overdraft_offer, price_war, price_war_b, school_trip, slot_squeeze, snack_supplier, sponsor_club, storm, storm2, storm_b, tanker_offer, undercut_dub).
- **Two-leg routes:** syd (10,900 km + 6,300 km, 4 days).

## Working on paper (D86) and chapter 4 (D82–D85) touches

The Settings rows these read, as loaded.

- `workingOnPaper`: True
- `twoTriesRule`: True
- `sumNumbering`: running number per pupil, never reset
- `launchDaySums`: tickets at 3 fares; profit; snacks as Build
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
- `flightDaysFromDay`: earned: week-2 review (day 14); fallback day 21
- **DailyColour:** hen_party (Tue, every 3), school_group (Thu, every 4), tailwind (Wed, every 2), headwind (Fri, every 5), no_shows (Mon, every 3), birthday_cake (Sat, every 4), late_bus (Tue, every 5), corporate_block (Wed, every 6), quiet_day (Thu, every 7), sunny_weekend (Sun, every 3).
- **Upgrades:** weekend_schedules → flightDays (All week / Mon–Fri / Sat–Sun), day_override → One-day override on any flight, seasonal_plans → Seasonal plan sets (a named plan with start and end dates), assign_planes → Assignment-level planning (D91) and fleet groups: short-, medium- and long-haul fleets, each with its own planning view, fuel_farm → The fuel farm on the Fuel desk (D89).
- **Briefings:** fare_lever (briefing-fare.html), rival_split (briefing-rival.html), full_route (briefing-capacity.html), weekend_demand (briefing-weekend.html), fuel_cash_tank_profit (briefing-fuel.html), aircraft_efficiency (briefing-efficiency.html), event_weekend (briefing-event.html), seasons (briefing-seasons.html), lease_money (briefing-lease.html), profit_vs_cash (briefing-cash.html), flight_time (flight-time-tutorial.html, not built yet), cash_to_fly (briefing-cash-to-fly.html).

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
- **Roadmap:** Week 3 (day 8), Week 4 (day 15), Week 5 (day 22), Week 6 (day 29), Week 7 (day 36), Week 9 (day 50), Week 9 (day 50), December (day 78), January 2031 (day 85), January 2031 (day 106), June 2031 (day 240), September 2031 (day 330), September 2032 (day 700).
- **Fuel, weeks 1–8:** £1.20 · £1.47 · £1.68 · £1.62 · £1.74 · £1.97 · £2.94 · £2.43.

## D103 touches (Briefing 13)

Bertie's rules of 18 Oct 2026, added to the installed workbook: the Settings rows the game reads, as loaded.

- `pupilReserve`: set by the pupil; default £0
- `bustRule`: 3 grounded days in a week; the airline closes and starts again from Launch Day
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

## D105 touches (every sum on the Sheet)

The handover of 19 Oct (evening), section 7.10: the Settings row, the SheetSums sheet and the hints, as loaded. Cash, tank, profit's example is under D104's list.

- `fuelDeskOpensDay`: 1
- **Launch Day** `B4 · C4 · D4` Ticket revenue: = B2 × B3 (and C, D) (Passengers × Fare) · pupil · book · `launch.tickets`
- **Launch Day** `E4` Ticket revenue: = E2 × E3 (Passengers × Fare) · pupil · book · `launch.otherTickets`
- **Launch Day** `F5` Total revenue: = the plan's ticket revenue (Ticket revenue (the plan)) · ƒ · airline
- **Launch Day** `F6` Other costs: given (What's in this?) · ƒ · airline
- **Launch Day** `F7` Fuel burned: £0 (free on Launch Day) · ƒ · airline
- **Launch Day** `F8` Total costs: = F6 + F7 (Other costs + Fuel burned) · ƒ · airline
- **Launch Day** `F9` Profit: = F5 − F8 (Total revenue − Total costs) · pupil · book · `launch.profit`
- **Launch Day** `B13 · C13` Cabin sales: = B11 × B12 (Passengers buying snacks × Snack price) · pupil · build · `launch.cabin`
- **Changes (week 2 on)** `B2…C7` Passengers a day, Empty seats, Fare, Ticket revenue a day, Over a week: given and ƒ (Now · With your change) · ƒ · airline
- **Changes (week 2 on)** `D5` Difference (a fare change: ticket revenue a day): = C5 − B5 (With your change − Now) · pupil · build once · `changes.difference`
- **Changes (week 2 on)** `D7` Difference (a plan change: profit a day): = C7 − B7 (With your change − Now) · pupil · build once · `changes.difference`
- **Event sums** `B4` Stay with you: = B2 × B3 (Your passengers × Stay with you, in every 10) · pupil · book · `event.stay`
- **Event sums** `B4` Business travellers today: = B2 × B3 (Business travellers on a weekday × Fly on a Saturday, in every 10) · pupil · book · `event.business`
- **Sunday review** `B9` Profit this week: = B2 + B3 + … + B8 (Mon + Tue + … + Sun) · pupil · build · `week.total`
- **Sunday review** `B11` Difference from the plan: = B10 − B9 (the larger first) (Projected on Monday − Profit this week) · pupil · build · `week.difference`
- **Sunday review** `B13` Average a day: = B9 ÷ B12 (Profit this week ÷ Days flown) · pupil · build · `week.average`
- **Fuel desk** `B4` Cost of this order: = B2 × B3 (Litres to buy × Price a litre) · pupil · book · `fuel.order`
- **WorkingMethods hints:** 11 of 31 relationships have a hint template.

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
