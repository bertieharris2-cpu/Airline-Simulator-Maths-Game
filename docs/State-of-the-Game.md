# State of the Game

*Read from the code and data on 6 Oct 2026, after the chapter-1 build on workbook v4.2. "The game" means the active opening prototype: `src/opening/` → `airline-opening-prototype.html`. The full game (`airline-simulator.html`, identical to `airline-simulator-full-reference.html`) is frozen and only appears in section 4. File references are under `src/opening/parts/`.*

**How the statuses were checked.**
- **Working:** used in the current flow and passing the automated tests:
  - `opening.test.js`: chapter 1 end to end at 1366×768 (Launch Day to the chapter accounts on 28 December), and to day 15 at 1915×891;
  - `balance.test.js` (Balance Reports v2–v4.1) and `engine.test.js` (game = engine on eight plans);
  - `liveops.test.js` and `answers.test.js` to week 1.
- **Bugs marked "verified":** reproduced in a browser or by a test.
- **All other bugs:** from reading the code.

## 1. Screens

### In play order

| # | Screen | When | What the pupil does |
|---|---|---|---|
| 1 | Welcome / Home menu | Start | Continue, New game (confirm; the old run goes to Best runs), Best runs, Save code, open the wall window |
| 2 | Name your airline | Setup | Type a name |
| 3 | Paint your planes | Setup | Two colours and a tail fin (6 fins) |
| 4 | HQ start-up | Setup | Animation; moves on by itself |
| 5 | Chapter banner | Setup | Chapter 1, *Starting out*, 2 Sep – 28 Dec 2030, from the Chapters sheet; Begin |
| 6 | Your start-up aircraft | Launch Day (Mon 2 Sep) | Twin Otter specs; Take delivery (£2,500 launch deal) |
| 7 | Choose your first market | Launch Day | Dublin or Paris |
| 8 | Market demand | Launch Day | People who want to fly, in aircraft-sized groups |
| 9 | One service, start to finish | Launch Day | 6 pages: out, turnaround, back, ready again |
| 10 | Timetable | Launch Day | ×1–×4 services on a Gantt; the fare chips (£70–£110, people at each); the scheduling questions |
| 11 | What's new (3 pages) | Days 2, 3, 4 (two), 5, 6, 8, 12, 15; week 4; December | What's new, the maths, choose the right sum; key words in the dock |
| 12 | Today's Plan (morning HQ) | Every day, week and month | Headline from the Calendar or Market; the brief (yesterday, what's new, routes opening, the rival, fuel); the standing plan |
| 13 | Aircraft for sale | Days 8 and 15, every week | Cards from the Aircraft and Finance sheets: buy, rent a day, finance; Look closer or Not today |
| 14 | The sums (fleet) | After choosing an aircraft | Rent or buy = price ÷ rent a day; a full plane = seats × fare; the model's suggested services and extra profit a day |
| 15 | Buy or rent | After the sums | Buy, Rent or Finance (gated by the Finance sheet's dates and the £1,000 reserve) |
| 16 | Plan | Every day and week | Fares per route, open-route chips, snacks, one tab per aircraft with its services and departure times (range checked) |
| 17 | Decision (event) | Days 4, 5, 11; the week of the fault | The Calendar's or the week's event: options with their cost; Change your mind |
| 18 | Cost | Every day and week | The cost sheet with a ticket line per route; the figures the hand-sum rules choose are typed, the rest are the model's (ƒ); empty seats (day 19) and flight time (day 15, new routes) as side tables; in weeks, "one day of the plan" only when a rule fires |
| 19 | Test | Every day and week | Change a test plan; the model costs it; save ideas; Fly my plan / the test plan |
| 20 | Fuel | Days 3–21, December | Order fuel in 500 L lots; tank batches, oldest burned first |
| 21 | Ready | Every period | Each aircraft's timetable, fares, on board, fuel, the decision, the projection; blocked below the cash reserve; warned on a loss |
| 22 | Operations (live) | Days 1–21 | Live show on the HQ and the wall; the featured aircraft is the one flying |
| 23 | Results | After each day or period | Revenue − costs = profit, projected against actual, routes, load factor % (from day 22) |
| 24 | Approve your regular plan | End of day 21 | Change it, or Approve; the tank's fuel goes back |
| 25 | Review | Each week, December, 28 Dec | Route performance, trend, load factor; one review sum the first time it arises (change in weekly profit, average a week, average a day) |
| 26 | Current plan or test plan | December | The month's plan as a table with the test plan beside it |
| 27 | Chapter accounts | 28 Dec | Each month's revenue and costs; total revenue, total costs, profit, projected − actual by hand |
| 28 | Chapter 1 complete | End | The chapter in figures; chapter 2 opens 6 Jan 2031 (not built); Play again, Home |

### Around the screens

| Area | What it is |
|---|---|
| HQ shell | Left nav (Overview, Today's Plan, Network, Fleet, Finance) and a plan rail (Plan → Cost → Test → Operate → Review, with Edit) |
| Dock (right) | Context (aircraft status with a departures board of up to four rows, your airline, the offer, key words); help; working space; ƒ model inspector; calculation dock |
| Back | ◀ Back on every planning screen; never past operations, a run or a signed order |
| Operations Wall | Boards, map, strip, news; live handoff, featured aircraft, announcements, focus moments, compressed days; second window via `?display` |
| Teacher panel (Ctrl+Shift+T) | Release, skip, text size, events, maths tools (Calculate/Build/Model), **By hand so far**, **Chapters 2–6: the gates**, **Skip ahead 1/4/8 weeks**, calculation checks, time check, cash and reputation, pace, sound, menu, runs, question bank |

### In the code but not reachable in normal play

| Screens | Why |
|---|---|
| fareTry, dayForecast, options, route, setupFuel, setupPrice, setupDone, home | Removed from the step lists (the fare moved onto the timetable screen; the home is fixed at Heathrow T5) |
| yearPlan, afford, yearReview, strategy, shop, invest, purchase, delivery, milestone | The old year and purchase flow: chapter 1 ends at the review; no beat reaches them |
| Old strategy, review, hq, planner, ready, fly, results, sim, protoEnd, event | Replaced by later renderers of the same name |
| choice, fare, quick, trips, day, fuel, cabin, plane, newRoute, stage, forecast, summary, challenge | The old round flow (`startRound`): the teacher's "Skip to the next story beat" only |

## 2. Mechanics

| Mechanic | Status | How it works now |
|---|---|---|
| Pacing from the workbook | Working | `buildBeats` (p4k): one beat per Calendar day (1–21), one per Market week (22–91), December as a month (2–27 Dec), the review on 28 Dec; chapter dates and cadence from the Chapters sheet |
| Demand from the workbook's tables | Working | People at each fare from the route's table (filled in between fares) × growth × the day's multiplier × home scale; the time-sensitive total rounded first, then shared between the bands (Balance Report v3) |
| Weekend and Market multipliers | Working | business share × (businessMult × 0.7 Sat / 0.6 Sun) + leisure share × (leisureMult × 1.2 at weekends); Market `seasonMult` for the route, else the archetype's season |
| Growth | Working | +2% a week from week 3, up to the archetype's ceiling |
| Time-of-day demand | Working (from day 4) | Five bands; locked passengers fly only in their band, the flexible fill any seat; a route whose archetype is not live (Istanbul) has no bands |
| Services and timetable | Working | Up to 4 services per aircraft; out, away turnaround, back, home turnaround; must end by 22:00 |
| Departure times | Working (from day 4) | ±30 min per service, per aircraft; not before the aircraft is ready again |
| Several aircraft | Working | `plan.fleet`: services and departure times per aircraft (tabs), fares per route, one snack choice; `S.deps` mirrors the first aircraft |
| Range | Working | A route out of range is greyed with the reason; the add fails with a toast |
| Crew duty | Working | Over 12 h (with half-hour padding) adds a second crew, £250, per aircraft |
| Routes | Working | All 18 live routes, opening by `unlockDay`; the other of Dublin/Paris opens on day 4 (Calendar) |
| On-board sales | Working (from day 2) | The Catering sheet: none, £3 (half buy), £5 (3 in 10), free (£2 a passenger); £1 stock |
| Costs | Working | Flying hours × £/h + landing fees at both ends + fuel + passenger charge; each aircraft's day cost plus rent or finance payments |
| Fuel | Working | Free on days 1–2; the tank with batches burned oldest first (days 3–21, December); bought as used in the weeks; the tank refunded at cost when the standing plan is approved |
| Hand sums (HandSumRules 1–6) | Working | First time by hand; fuel again on a 50p or 25% jump; revenue again on a new route; a new aircraft type: price ÷ rent and seats × fare; snacks once; totals at the review; never in Test; `S.skills`, teacher log |
| Events | Working | Calendar events as a step before Cost (days 4, 5, 11); week events decided before the run (the fault), cost = `costShare` × yesterday's profit from day 22; information events applied from their effects text; cancellations remove the service; stars banked |
| Rival fares | Working | Red Kite £50 on Dublin days 4–7 (Calendar); the price war week: 80% of your fare on every route; `competitionSensitivity` share lost |
| Cash reserve, losing plan | Working | Ready blocks a plan that would take cash below £1,000 (when cash is above it); warns on a negative projection; purchases blocked the same way |
| The shop | Working | Aircraft with `shopFromDay` ≤ today: cash price, rent a day, launch-deal finance (daily payments) from the Finance sheet; lease/buy/finance dates respected (A220/A320/737 shown, not yet available) |
| Projected = actual | Working | Every day, week and month lands exactly on its projection (tests check it) |
| Weeks | Working | Review, shop, plan, Cost (hand sums only when a rule fires), Test, Ready, run; Market fuel, season, weather, headline |
| Teacher skip | Working | 1 / 4 / 8 weeks on the standing plan; events with choices are left to run their course |
| December, monthly report | Working | Tank, current against test plan, run, results with load factor |
| Chapter review | Working | Chapter accounts (totals by hand), summary, the long-haul hook |
| Reputation | Gated | Hidden until `reputationFromDate` (placeholder in v4.2); event stars banked in `S.repBank`; revealed at the level earned |
| Chapters 2–6 | Read only | Lease/buy/finance dates, reputation, the quarterly task, challenges and hunts listed in the teacher panel; nothing fires in chapter 1 |
| Maths toolkit | Working | Calculate / Build / Model per tool; the rules decide the day's levels; the teacher overrides |
| Answer checking | Working | Accepts the model's figure or the working on screen; sign hint; Show me after 3 tries |
| Live operations | Working | Show built from the model's flights; the featured aircraft is the one flying; weeks compressed; months plain |
| Saves | Working | Version 5 (`ASIM5.`); older saves start again |
| Captain's challenges, hunts | Not in chapter 1 | Readers only (from 6 Jan 2031; the Hunts sheet is placeholder) |
| Airline type | Absent | The old strategy step is out of the flow (the brief's `airlineTypeChoiceDate` is placeholder) |
| Fluency engine | Absent | Rules 1–6 replace it |
| Plans archive | Partly | Days and weeks; months not archived |
| Question bank export | Working | Lists the current tables with their sums in words |

## 3. Data

### Blocks in `p2_data.html`

| Block | Contains | Used now? |
|---|---|---|
| data-workbook | Imported from `data/Airline-World-Workbook.xlsx` v4.2: settings 41, archetypes 4, routes 18, aircraft 8, finance 8, airports 1, calendar 21, market 17, events 10, challenges 2, mechanics 15, chapters 1, hand-sum rules 8, catering 4, hunts 0 | Yes: it drives the game |
| data-world | Starting values, day hours, fuel lot, tank, max services, rival name; 4 homes (only Heathrow T5 used), 13 old routes (overridden), `setupRoutes`; no beat list any more | Partly |
| data-planes | 12 old aircraft (overridden by the workbook's 8; pictures and makers kept) | Pictures only |
| data-tools | Maths tools and their default levels; `rentOrBuy`, `seatsFare`, `flightTime` added | Yes |
| data-tables | Calculation tables; `rentbuy1`, `seatfare1`, `time1` added; the cost sheet and the chapter accounts build their own rows | Yes |
| data-reviews, data-fins, data-text | As before | Yes |
| data-jobs, data-phases, data-challenges | The old round flow | Legacy |

### Values the workbook does not carry (reported, not invented)

| Value | Where | What the game does |
|---|---|---|
| Istanbul's archetype `long_haul_mixed` (later) | Import report, route card | No time bands or multipliers on Istanbul |
| `timeSkip` (placeholder) | Settings | Teacher skips of 1 / 4 / 8 weeks from the brief |
| `reputationFromDate` (placeholder) | Settings | Reputation stays hidden; stars banked |
| The fault's options | Events sheet (text only) | Built from the text: fix (50% of yesterday's profit, +½★), fly (−1★), wait (the aircraft misses a day) |
| Red Kite's own fares in the price war | Events sheet | 80% of your fare on every route that week |
| Finance for the tutorial tier (`financeFrom` n/a) | Finance sheet | Offered from the aircraft's `buyFrom` day |

### Hard-coded in the code, not read from data

| Value | Where |
|---|---|
| Launch-deal fuel free on days 1–2; fuel paid from the "fuel" mechanic (Calendar day 3) | p4g_opening2.js `fuelPaid` |
| Departure steps of 30 min; the month plan's first departure 06:00–10:00 in 15 min steps | p4m_fleet.js, p4d_opening.js |
| Live operations timings and speeds | p4i_liveops.js |
| Passenger milestones 100 … 10,000 | p4a_core.js |
| Briefing texts and examples | p4j_intro.js, p4l_handsums.js, p4m_fleet.js (INTRO) |
| The review day: December runs to the 27th and the review is held on the 28th | p4k_chapter.js `buildBeats` |

## 4. Change requests

FG = full game (frozen); Proto = opening prototype. CR1, CR2 Stages A–B and CR4 Stages 1–3 were built in the full game. The prototype was then redesigned from it, and in this round rebuilt on workbook v4.2.

### CR1: HQ, fuel tank, consequences, outcomes, fleet, menu, setup, question bank

| Item | FG | Proto | Done differently |
|---|---|---|---|
| 1a HQ with task cards | Partly | Partly | Cards replaced by CR4's news-led choice (FG), then by the Plan/Cost/Test/Operate/Review rail (Proto) |
| 1b Persistent fuel tank, grounded if short | Yes | Yes | Proto: free launch fuel, then the tank; bought as used in the weeks |
| 1c Briefings that recall past decisions | Yes | Partly | Proto briefs on yesterday, what's new, routes opening, the rival and fuel |
| 1d Flights fly regardless; one calculation per round | Yes | Yes | Proto: HandSumRules decide the day's sums |
| 2 Honest outcome language | Yes | Mostly | Results say ALL LANDED even when a service was cancelled (section 5) |
| 3 Two fonts, gutters, shared style | Yes | Yes | |
| 4 Fleet ladder | Yes | Yes | Workbook prices and terms; the shop from day 8 |
| 5 Menu, New game confirm, Best runs | Yes | Yes | |
| 6 Setup: home airport, tail fin, starting fuel | Yes | Partly | Home fixed at Heathrow T5 (workbook); the launch deal replaces buying starting fuel |
| 7 Question bank export | Yes | Yes | |

### CR2: time module, planning desk, skills, time strand, problem solving

| Item | FG | Proto | Done differently |
|---|---|---|---|
| A Shared time module | Yes | Yes | Times from the workbook's distances and terminals |
| B1 Demand as people icons with plane-load brackets | Yes | Differently | Aircraft-sized groups on Launch Day |
| B2 Forecast table: options side by side, gated cells | Yes | Differently | Cost sheet for your plan, a calculation dock, a free Test plan |
| B3 Working space on the IWB | Yes | Yes | |
| B4 Visual fuel tank | Yes (HQ) | Yes (HQ) | |
| B5 Forecast against actual | Yes | Yes | Every day and period; the chapter accounts |
| B7 Paper backup pack | Yes | No | Matches the full game |
| C1–C3 Skills, fluency, phase windows | No | Differently | HandSumRules 1–6 with `S.skills` |
| C4 Madrid locked until taught | Partly | Yes | Madrid opens on day 15 with range and flight time |
| D1 Day timeline | Partly | Yes | Gantt; departure times per aircraft; scheduling questions on Launch Day |
| D2–D4 Board builder, faults, Tower | No | No | |
| E1 Headlines with effects | Partly | Yes | Calendar and Market events with effects |
| E4 Big numbers, E5 Percentages | Partly | Partly | Load factor as a percentage from day 22; no estimate rows |

### CR3: Spot the Mistake

| Item | FG | Proto | Notes |
|---|---|---|---|
| H1–H7 | No | No | Nothing built; the Hunts sheet is placeholder and is read for the teacher panel only |

### CR4: clarity and decision-led rounds

| Item | FG | Proto | Done differently |
|---|---|---|---|
| §2 Question first, type sizes, no scrolling | Yes | Yes | Tests check no overflow at 1366×768 and 1915×891 |
| §3 Every number a row, sum sentence, "What's in this?" | Yes | Yes | Build = choose the figures and the sign |
| §4 Setup price decision | Yes | Differently | Fare chips on the Launch Day timetable |
| §7 News-led rounds, standing choices | Yes | Differently | Standing plan, headline, What's new, events as decisions |
| §8 Captain's challenge optional | Yes | Gated | From 6 Jan 2031 (Challenges sheet) |
| §10 Stopping point | Yes | Partly | Autosave; save code via Home or the teacher panel |

## 5. Known bugs and assumptions

### Bugs

| Bug | Where | Checked |
|---|---|---|
| Results card says ALL LANDED even when a service was cancelled or an aircraft grounded | p4d_opening.js (results head) | Code |
| Teacher "Skip to the next story beat" drops into the old round flow; Repeat this period and Tomorrow's choice do nothing in the new flow | p4c_display.js | Code |
| Plans archive skips the months | p4g_opening2.js | Code |
| An information event applies for its whole week, not from its date | p4n_weeks.js `startBeat` | Code (decision 14 in the report-back) |
| Workbook: Reykjavik's report fare (£180) is not on its fare list; Istanbul's archetype is not live | `data/Import-Report.md`, `balance.test.js` | Verified by the importer and the balance test |

### Assumptions

- "The game" is the opening prototype. The full game is frozen and only appears in section 4.
- "Working" means used in the scripted play-throughs and passing the tests, not tested in class.
- The scripted pupil rents the Saab on day 8 and gives it Amsterdam services; a pupil who rents and idles the aircraft loses money and meets the cash-reserve block (by design; the teacher panel can adjust cash).
- The decisions taken where the workbook is silent are listed in `docs/Workbook-v4-Report-Back.md`.
