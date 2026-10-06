# State of the Game

*Read from the code and data at commit `ac92238` (6 Oct 2026). "The game" means the active opening prototype: `src/opening/` → `airline-opening-prototype.html`. The full game (`airline-simulator.html` and its identical frozen copy `airline-simulator-full-reference.html`) is covered only in section 4. The change requests come from the four uploaded CR documents. File references are under `src/opening/parts/`.*

**How the statuses were checked.**
- **Working:** used in the current flow and passing the automated tests:
  - `opening.test.js`: 135 checks from setup to the end of Year 1 at 1366×768, and to June at 1915×891.
  - `liveops.test.js`: 113 checks, Launch Day to Week 3.
  - `answers.test.js`: 14 checks.
  - `engine.test.js` and `balance.test.js`.
- **Bugs marked "verified":** reproduced in a browser.
- **All other bugs:** from reading the code.

## 1. Screens

### In play order

| # | Screen | When | What the pupil does |
|---|---|---|---|
| 1 | Welcome / Home menu | Start | Continue, New game (confirm; the old run goes to Best runs), Best runs, Save code, open the wall window |
| 2 | Name your airline | Setup | Type a name |
| 3 | Paint your planes | Setup | Two colours and a tail fin (6 fins) |
| 4 | Home airport and terminal | Setup | LHR (T5/T4), LGW (N/S), LTN, MAN (T1/T3), with landing fee, demand, turnaround and charge; locator map |
| 5 | HQ start-up | Setup | Animation; moves on by itself after 2.9 s |
| 6 | Your start-up aircraft | Launch Day | Twin Otter specs; Take delivery (£2,500 launch deal) |
| 7 | Choose your first market | Launch Day | Dublin or Paris |
| 8 | Market demand | Launch Day | People who want to fly, in aircraft-sized groups |
| 9 | One service, start to finish | Launch Day | 6 pages: out, turnaround, back, ready again; picks the ready-again time (1 of 3) |
| 10 | Timetable | Launch Day | ×1–×4 services on a Gantt; Scheduling panel: when service 2 can leave, would another fit |
| 11 | What's new (3 pages) | Day 1 snacks, Day 2 fuel, Day 3 times, Day 4 route, Week 1, June tank, the year, Year 1 purchase | What's new, the maths (rule plus a worked example), choose the right sum (1 of 3) |
| 12 | Today's Plan (morning HQ) | Days 1–4, weeks, months, the year | Headline, brief and the standing plan; Plan today / the week / the month |
| 13 | Plan | Days 1–4, Weeks 1–3 | Services, fares, on-board cards (from Day 1), departure times (Day 3), second route ⇄ (Day 4) |
| 14 | Cost: today's new numbers | Launch Day to Week 3 | Complete the one new figure in the cost sheet; the model does the rest |
| 15 | Test: try other ideas | Launch Day to Week 3 | Change a test plan; the model costs it; save ideas; Fly my plan / the test plan |
| 16 | Fuel | Days 2–4, June to August, the year | Order fuel in 500 L lots; tank batches, oldest burned first |
| 17 | Ready (operating plan) | Every period | Every setting with Edit; SEND TO OPERATIONS WALL / RUN … |
| 18 | Operations (live) | Launch Day, Days 1–4 | Live show on the HQ, and on the wall full screen; pace controls |
| 19 | Day results | After each day | Revenue − costs = profit, projected against actual, routes; Close the day |
| 20 | Approve your regular plan | End of Day 4 | Change it, or Approve; the tank is refunded at cost |
| 21 | Milestone: your timetable repeats | The weekend (17–19 May) | Read; Run the weekend |
| 22 | Weekend run, then results | The weekend | Compressed live show; results |
| 23 | Week 1 | 20–26 May | What's new, Plan, Cost (profit a day × 7), Test, Ready, live week, results |
| 24 | Weeks 2–3 | 27 May – 9 Jun | Review (Week 3: change in weekly profit), Plan, Cost, Test, Ready, live week (Week 3 storm), results |
| 25 | Milestone: month by month | June | Read |
| 26 | Months: June, July, August | 10 Jun – 31 Aug | Review (average a week, then average a day), What's new (June only), Fuel, Current against test plan, Ready, plain run, results |
| 27 | Milestone: where will the airline be next May? | 1 Sep | Read |
| 28 | The year | Sep – Apr | Review (average a month), plans, fuel, What's new, Year projection (average × 8 + cash), Time to afford (Saab, ATR), Ready, one run of 8 months, results |
| 29 | Milestone: one year of flying | 1 May 2031 | Read |
| 30 | Year 1 review | 1 May 2031 | Projected against actual cash, and the reasons |
| 31 | What sort of airline? | Year 1 review | Premium, Full Service or Value |
| 32 | What's new: buying an aircraft | Year 1 review | 3 pages |
| 33 | Shop | Year 1 review | Twin Otter (owned), Saab 340, ATR 72, E190 (dimmed) |
| 34 | Investment | Year 1 review | Cash after, safe?, extra a month, payback; Buy, Keep saving, or Save until affordable |
| 35 | Purchase order, delivery | Year 1 review | Sign (cash leaves); delivery note |
| 36 | Year 1 complete | End | Play again, Home |

### Around the screens

| Area | What it is |
|---|---|
| HQ shell | Left nav (Overview, Today's Plan, Network, Fleet, Finance; unlocked as the airline grows) and a plan rail (Plan → Cost → Test → Operate → Review, with Edit) |
| Overview | KPI row, map (Routes, Demand, Profit, Opportunities), Today card, route performance, finance chart (wide screens), live operations, feedback and alerts |
| Network, Fleet, Finance | Map and routes; fleet table; chart with History, Plans archive and Models |
| Dock (right) | Context; help (timing, demand, fuel, money, forecast); working space (pins and pen); earlier days; ƒ model inspector; calculation dock (Show me after 3 tries) |
| Back | ◀ Back on every planning screen and on the setup cards; never past operations, a run or a signed order |
| Operations Wall | Boards, map, strip, news; live handoff, featured flight, aircraft card, announcements, focus moments, compressed days; Day / Week / Month complete; IWB working space; second window via `?display` |
| Teacher panel (Ctrl+Shift+T) | Release, skip, text size (3), events, Captain's challenge, maths tools (Calculate/Build/Model), calculation checks, time check, cash and reputation, pace, sound, auto wall, menu, runs, question bank, save code, test bar |

### In the code but not reachable in normal play

| Screens | Why |
|---|---|
| fareTry, dayForecast, options, route, setupFuel, setupPrice, setupDone | Removed from or never put into any step list |
| Old strategy, review, home, shop, hq, planner, ready, fly, results, sim, protoEnd | Replaced by later renderers of the same name |
| choice, fare, quick, trips, day, fuel, cabin, plane, newRoute, stage, forecast, summary, challenge, event | The old round flow (`startRound`): reached only through the teacher's "Skip to the next story beat", Skip at a summary, or an old save |
| Overlays shop, planeTable, newPlane, fleet; wall modes alert, stage, launch | Need the old round flow; their buttons are hidden |

## 2. Mechanics

| Mechanic | Status | How it works now |
|---|---|---|
| Demand from the workbook's tables | Working | People at each fare from the route's table (filled in between fares), × home airport scale, × growth; school rounding |
| Growth | Working | +2% a week from Week 3, up to a ceiling (Dublin ×1.3, Paris ×1.4); the same all through a period |
| Seasons | Partly | Code works; Dublin's and Paris's archetypes have every season = 1 |
| Time-of-day demand | Working (from Day 3) | Five bands; locked passengers fly only in their band, the flexible fill any seat; everyone is flexible before Day 3 |
| Services and timetable | Working | Up to 4 services; one shared time module (out, away turnaround, back, home turnaround); must end by 22:00 |
| Departure times | Working (from Day 3) | ±30 min per service; not before the aircraft is ready again |
| Crew duty | Working | Over 12 h (with half-hour padding) adds a second crew, £250 |
| Second route | Working (from Day 4) | Dublin and Paris; ⇄ changes a service's route |
| On-board sales | Working (from Day 1) | None, £3 (half buy), £5 (3 in 10), free (£2 a passenger); £1 stock; counted per route a day |
| Costs | Working | Flying hours × £/h + landing fees at both ends + fuel + passenger charge; aircraft £600 a day |
| Fuel | Working | Free on Launch Day and Day 1; a tank with batches burned oldest first (Days 2–4, months, the year); bought as used in the weekend and weeks; auto top-up at +10p when short in months; tank refunded at cost at the ROP |
| Projected = actual | Working | Every day and period lands exactly on its projection (tests check it) |
| Period engine | Working | Weekend, Weeks 1–3, June to August, Sep–Apr in one run, Keep saving |
| Reviews | Partly | Week 3 change, average a week / day / month; Week 2 asks nothing |
| Year projection, time to afford | Working | Average of Jul and Aug × 8 + cash; months = (price − (cash − £20,000)) ÷ average month, rounded up |
| Year 1 review, shop, investment, purchase | Working | Projection against actual; extra profit a day × 30; payback rounded up; purchase takes the cash |
| Delivery of the bought aircraft | Stubbed | `S.onOrder` is set; nothing reads it; the prototype ends |
| Airline type | Cosmetic | Badge, news line and wall subtitle only |
| Maths toolkit | Working | Each skill is Calculate, Build or Model by story progress (data-tools); the teacher can override |
| Answer checking | Working | Accepts the model's figure or the working on screen; sign hint; Show me after 3 tries; teacher's calculation checks |
| Cost / Test, saved ideas | Working | One new figure a day; free modelling; saved idea cards |
| Plans archive | Partly | Days and weeks only; months are not archived |
| What's new briefings | Working | 8 briefings, each with a required "which sum?" |
| Back | Working | Generic Back with walls and skips |
| Scheduling panel | Working | Two optional questions on the Launch Day timetable |
| Live operations | Working to Week 3 | Show built from the model's flights; moments; Week 3 storm (wall only); months use a plain progress run |
| Wall summaries | Working | Without a seat (= HQ), snacks bought (= Cost sheet), records |
| Reputation | Off | Held at 3 stars and hidden (`reputationOn` not set) |
| Rival fares | Off | No beat sets a competitor price; the workbook's rival fares are unused |
| Events / CEO decisions | Off | No beat has an event; the teacher trigger throws (section 5) |
| Captain's challenge | Off | No beat schedules one; the teacher button is effectively unreachable |
| Passenger reviews | Partly | Only the full, empty, fair-price and smooth tags can occur |
| Fluency engine (skills) | Stubbed | `skillFluent()` returns false |
| Phases (data-phases) | Legacy | Only the map's Opportunities layer uses it; the story uses each beat's `prog` |
| Mistake hunts | Absent | No code, no data |
| Finance / lease | Absent | Workbook finance table never read; cash purchase only |
| Loans | Partly | Bank tops cash up in £500 steps below zero; no repayment, no interest |
| Question bank export | Broken | Throws on the opening's table kinds |
| Saves | Working | Autosave every render, save code (ASIM4), old saves migrated |
| Best runs | Partly | Not recorded at the end of Year 1 |
| Read aloud | Working | Where the computer has a voice |
| IWB second window | Working | Broadcast channel; wall and working space |
| World engine | Tests only | Runtime uses only its band, duty and rounding helpers; `WE.day` is checked against the game in tests |

## 3. Data

### Blocks in `p2_data.html`

| Block | Contains | Rows | Used now? |
|---|---|---|---|
| data-planes | Aircraft: seats, speed, range, fuel use, £/h, £/day, price, tier, fact | 12 | Yes (Twin Otter, Saab 340, ATR 72 and the E190 card); the workbook overrides the first three |
| data-jobs | Old job definitions (pricing, fuel, schedule, cabin, assign, buyPlane) | 6 | Old round flow and question bank only |
| data-phases | Phases 1–4 with ranges and unlocks | 4 | Map Opportunities layer only |
| data-tools | Maths skills and their Calculate/Build/Model level by progress | 17 | Yes |
| data-tables | Calculation tables: rows, sentences, labels | 23 tables | 9 in the flow (cost1, empty1, week1, periodPlan2, review2, yearPlan, afford2, yearReview, invest); 14 old (price, tripsCount, tripsExtra, fuel, cabin, plane, days, quick, periodPlan, runPlan, afford, planeM, dayForecast, options) |
| data-reviews | Passenger review lines by tag | 12 tags, 25 lines | 4 tags can occur |
| data-challenges | Captain's challenges | 15 | Not scheduled |
| data-world | Story and world: starting cash, day hours, fuel lot 500, tank 5,000 L, max 4 services, reserve £20,000, top-up +10p, rival name | 4 homes (7 terminals), 13 routes, 21 beats, 2 fuel suppliers | Yes: beats (dates, fuel price, headline, news, intro, live weather), homes, Dublin and Paris. 11 routes and the second supplier are unused. Crew 540 min / £300 and the route distances are overridden |
| data-fins | Tail-fin motifs | 6 | Yes |
| data-text | Retry lines, hints, gate text | 7 keys | Yes |
| data-workbook | Imported from `data/Airline-World-Workbook.xlsx` | Settings 11, archetypes 4, routes 6, aircraft 3, finance 3, airports 5, calendar 14, market 2, events 3, challenges 4, mechanics 8, route catalogue 0 | Settings, archetypes, Dublin/Paris, the three aircraft and the airports are used. Finance, calendar, market, events, challenges, mechanics and the other 4 routes are not |

### Data the workbook overrides

| Value | Own data | Used (workbook) |
|---|---|---|
| Dublin / Paris distance | 300 / 450 km | 450 / 300 km |
| Fares | Dublin £50–80, Paris £80–120 | £70–£110 both |
| Twin Otter | £192/h, £900/day | £150/h, £600/day; £2,500 launch deal (list £5,000) |
| Saab 340 / ATR 72 price | £180,000 / £280,000 | £9,000 / £15,000 |
| Crew rule | 540 min, £300 | 720 min (+30 min padding), £250 |

### Hard-coded in the code, not read from data

| Value | Where |
|---|---|
| On-board options: £3 / £5 prices, half / 3 in 10 buy, £1 stock, free £2 a passenger | p4a_core.js:193 |
| Calendar start: Sun 12 May 2030 (the workbook says 1 Sep 2030) | p4a_core.js |
| Week 1 starts on day 8 (20 May); growth starts in Week 3 | p4g_opening2.js:32, p4h_world.js:63 |
| Home demand baseline: Heathrow +15% = ×1 | p4h_world.js:60 |
| Fuel per service rounded to 10 L | p4a_core.js:233 |
| Year = 8 months; the next aircraft are Saab and ATR | p4f_campaign.js:390, 406 |
| A month = 30 days (investment, monthly profit); delivery = +32 days | p4f_campaign.js:493, 526; p4a_core.js:604 |
| Bank top-up in £500 steps | p4a_core.js:893 |
| Departure steps of 30 min; old first-departure range 06:00–10:00 | p4g_opening2.js:145; p4d_opening.js:308 |
| Live operations timings (check-in 90, prep 35, board 25, final 10, close 4 min) and speeds | p4i_liveops.js:16–23 |
| Passenger milestones 100 … 10,000 | p4a_core.js:869 |
| Airline types | p4a_core.js:43 |
| Briefing texts and examples | p4j_intro.js (INTRO) |
| Day stories, milestone texts, help | p4g_opening2.js (PLAN_STORY), p4f_campaign.js (MILESTONES), p4d_opening.js (HELP) |
| Fallbacks used only if data is missing: 4 services, 720 min / £250 crew (p4h) and 540 / £300 (p4a, old), £10,000 reserve (old) | various |

## 4. Change requests

FG = full game (frozen); Proto = opening prototype. CR1, CR2 Stages A–B and CR4 Stages 1–3 were built in the full game. The prototype was then redesigned from it.

### CR1: HQ, fuel tank, consequences, outcomes, fleet, menu, setup, question bank

| Item | FG | Proto | Done differently |
|---|---|---|---|
| 1a HQ with task cards | Partly | Partly | Cards replaced by CR4's news-led choice (FG), then by the Plan/Cost/Test/Operate/Review rail (Proto) |
| 1b Persistent fuel tank, grounded if short | Yes | Yes | Proto: free launch fuel, then the tank; bought as used in the weeks; the IWB shows the price, not the gauge |
| 1c Briefings that recall past decisions | Yes | Partly | Proto briefs on yesterday's result, what's new and the fuel price, not on stored decisions |
| 1d Flights fly regardless; one calculation per round | Yes | Yes | Proto: the standing plan flies; one new figure a day on Cost |
| 2 Honest outcome language | Yes | Mostly | Proto's results card always says ALL LANDED (section 5) |
| 3 Two fonts, gutters, shared style | Yes | Yes | New visual language, still two families |
| 4 Fleet ladder (Saab, ATR, E190, A220) | Yes | Yes | Workbook prices (£9,000 / £15,000) |
| 5 Menu, New game confirm, Best runs | Yes | Yes | Best runs not recorded at the end of Year 1 |
| 6 Setup: home airport, tail fin, starting fuel | Yes | Partly | Real UK airports and terminals; the launch deal replaces buying starting fuel |
| 7 Question bank export | Yes | Broken | Throws on the opening's tables |

### CR2: time module, planning desk, skills, time strand, problem solving

| Item | FG | Proto | Done differently |
|---|---|---|---|
| A Shared time module | Yes | Yes | Proto times come from the workbook's distances and terminals |
| A Test cases (3 h 45, 12:45, 17:15 …) | Yes | No longer | Paris is now 300 km (2 h 45 round trip); the hard-coded Madrid cases fail (section 5) |
| B1 Demand as people icons with plane-load brackets | Yes | Differently | Demand in aircraft-sized groups on Launch Day |
| B2 Forecast table: options side by side, gated cells, pick a column | Yes | Differently | Cost sheet for your plan, a calculation dock, and a free Test plan costed by the model |
| B2 Display modes (Shown / Choose / Free) | Yes (teacher-set) | Differently | Calculate / Build / Model per skill (data-tools) |
| B3 Working space on the IWB | Yes | Yes | Also a pen pad in the HQ dock |
| B4 Visual fuel tank with plan section | Yes (HQ) | Yes (HQ, fuel screen) | Not on the IWB in either |
| B5 Forecast against actual | Yes | Yes | "Projected · actual" each day and period; year review |
| B6 Remove typed working box | Yes | Yes | |
| B7 Paper backup pack | Yes | No | The pack matches the full game's screens |
| C1 data-skills block | No | No | data-tools instead |
| C2 Fluency rules and spot-checks | No (stub) | No | Teacher-set levels with defaults by progress |
| C3 Phase windows, repeat round, switch strand | Partly | Partly | Proto paces by beat `prog`; Repeat and Tomorrow's choice don't work in the new flow |
| C4 Madrid locked; Paris 38 / Dublin 30 | Partly | Differently | Proto only has Dublin and Paris, with workbook demand |
| D1 Day timeline | Partly (Shown only) | Partly | Gantt; per-service departure times from Day 3; Scheduling panel on Launch Day |
| D2 Departure board builder | No | No | Board generated from the model |
| D3 Board faults | No | No | |
| D4 Cardiff Tower | No | No | |
| E1 Headlines with effects | Partly | Partly | Headline text only; one storm delay on the wall |
| E2 Crew quality | No | No | Second crew for long days instead |
| E3 Outsourcing | No | No | On-board catering choice is the nearest |
| E4 Big numbers | Partly | Partly | Months and year projections; no estimate row or scaling questions |
| E5 Percentages | No | No | |

### CR3: Spot the Mistake

| Item | FG | Proto | Notes |
|---|---|---|---|
| H1 "Check it" hunt component | No | No | Nothing built |
| H2 data-errors catalogue | No | No | |
| H3 Hosts (finance card, invoice, board, Tower, assistant, review) | No | No | |
| H4 Scheduling and spot-check rule | No | No | No fluency engine to hang it on |
| H5 Consequences of missing | No | No | Forecast-against-actual lines exist and could carry the cause |
| H6 Logging and Checking tab | No | No | The teacher's Calculation checks log answers, not hunts |
| H7 data-hunts script | No | No | |
| Amendments to CR2 (C1, C2, D3) | No | No | |

### CR4: clarity and decision-led rounds

| Item | FG | Proto | Done differently |
|---|---|---|---|
| §2 Question first | Yes | Yes | |
| §2 Focus mode | Yes | Differently | HQ shell with rail and dock instead of hiding everything |
| §2 Full width, no scrolling at 1920×1080 / 1366×768 | Yes | Yes | Tests check no overflow at 1366×768 and 1915×891 |
| §2 Type sizes, mixed case, no scanlines | Yes | Yes | |
| §2 Atkinson Hyperlegible embedded | No | No | The CR's fallback (system sans) was used |
| §2 Text size setting | Yes | Yes | |
| §3 Every number a row, highlights, sum sentence, "What's in this?" | Yes | Yes | Sum shown in the calculation dock; Build = choose the figures and the sign |
| §3 Remove break-even, fits-N, Madrid until taught | Yes | Yes | |
| §4 Setup price decision £80/£100/£120 | Yes | Differently | Workbook fares £70–£110; on Launch Day the fare is set in the Test plan |
| §5 Trips table step by step, extra-trip decision | Yes | Differently | Demand → One service → Timetable on Launch Day |
| §6 Fuel in two steps | Yes | Differently | Fuel order screen with tank; fuel cost typed on Cost |
| §7 News-led rounds, Carry on as usual, standing choices, quick income sum | Yes | Differently | Standing plan, headline and What's new; no choice screen |
| §8 Captain's challenge optional | Yes | Not in flow | Code inherited; nothing schedules it |
| §9 Fluency counts occasions | No | No | Teacher-set levels instead |
| §10 Stopping point "Save and finish" | Yes | Partly | Autosave; save code via Home menu or teacher; no button on results |
| §11 Tap the sum (deferred) | Not built | Not built | As asked; Build mode is close |

## 5. Known bugs and assumptions

### Bugs

| Bug | Where | Checked |
|---|---|---|
| Teacher "Question bank" throws (`Cannot read properties of undefined`) | p4b_control.js:800–832 | Verified |
| Teacher "Trigger now" throws; the event list is empty | p4c_display.js:408 | Verified |
| Teacher time check: Madrid shows 4 h 10 / 9 h 05 against hard-coded 4 h / 8 h 45 | p4h_world.js:148–162 | Verified |
| "Time to afford" is 0 months for every player: £9,000 / £15,000 aircraft against £100k+ cash | Workbook prices | Verified (full campaign log) |
| Import report says 9 events were loaded; data-workbook holds 3 | `data/Import-Report.md` | Verified |
| Launch Day Ready: the fare Edit does nothing (its step was removed) | p4g_opening2.js:279, p4h_world.js:137 | Code |
| Week 2 review asks for no figure (needs two weeks; the weekend is stored as a gap) | p4f_campaign.js:270 | Code |
| Teacher Skip to next story beat drops into the old round flow; Repeat this period, Tomorrow's choice and Move on automatically do nothing in the new flow | p4c_display.js:377–416 | Code |
| Captain's challenge from the teacher panel is replaced before it is reached | p4c_display.js:411 | Code |
| Results card says ALL LANDED even when a flight was grounded | p4d_opening.js:829 | Code |
| Fuel alert says the tank won't cover the day on Launch Day, Day 1 and in the weeks, when fuel is free or bought as used | p4b_control.js:350 | Code |
| Stale copy: welcome "Launch day to Day 3"; weekend milestone "Thursday to Sunday" and "+10p top-up" (the weekend is Fri–Sun, bought as used) | p4b_control.js:39, p4f_campaign.js:248 | Code |
| In month/year test plans the "From" stepper has no effect once services have their own times | p4d_opening.js:971–988 | Code |
| Plans archive skips the months; Best runs not recorded at the end of Year 1 | p4g_opening2.js:482; p4a_core.js:117 | Code |
| Free snacks promise "happier passengers", but reputation is off | p4a_core.js:193 | Code |
| Two `weekNo` definitions (the later one wins) | p4a_core.js:561, p4g_opening2.js:32 | Code |
| The year's plan → fuel order might invalidate the projection before Ready | p4f_campaign.js:69 | Code; not reproduced by the scripted player |
| Workbook: calendar weekdays off by one, Market and Calendar fuel disagree, Saab/ATR legs not on quarter hours, Dublin/Paris stories contradict distances, start date 1 Sep 2030 | `data/Import-Report.md` | Verified by the importer |
| LGW South and MAN T3 have no workbook rows (prototype values kept) | p4a2_workbook.js:29 | Code |

### Assumptions

- "The game" is the opening prototype. The full game is frozen and only appears in section 4.
- CR2 and CR3 refer to a document, "How the Game Progresses", which is not in the repo and was not read. Its skills list (CR2 C1) and phase plan are therefore not checked here.
- CR3 was never built: there are no commits, code or data for it.
- "Working" means used in the scripted play-throughs and passing the tests, not tested in class. Teacher-panel and old-flow paths were read, not played, except the three verified above.
- Row counts are of the JSON as it stands. Line numbers are at commit `ac92238` and will drift.
