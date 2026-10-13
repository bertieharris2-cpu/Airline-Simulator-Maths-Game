# State of the Game

*Read from the code and data on 6 Oct 2026, after the chapter-1 build on workbook v4.2. "The game" means the active opening prototype: `src/opening/` → `airline-opening-prototype.html`. The full game (`airline-simulator.html`, identical to `airline-simulator-full-reference.html`) is frozen and only appears in section 4. File references are under `src/opening/parts/`.*

**How the statuses were checked.**
- **Working:** used in the current flow and passing the automated tests:
  - `opening.test.js`: chapter 1 end to end at 1366×768 (Launch Day to the chapter accounts on 28 December), and to day 15 at 1915×891;
  - `balance.test.js` (Balance Reports v2–v4.1) and `engine.test.js` (game = engine on eight plans);
  - `liveops.test.js` and `answers.test.js` to week 1.
- **Bugs marked "verified":** reproduced in a browser or by a test.
- **All other bugs:** from reading the code.

## 0e. v4.10.1 (13 Oct 2026): Studio fixes, and two parked thoughts

**Fixed** (all three checked by `week.test.js`):
- **The timetable's selected-flight bar was cut off with three aircraft.** `.st-tt` hid its overflow and could not scroll. Now only the aircraft rows (`.st-ad`) scroll, with a sticky time axis; three or more aircraft get tighter rows (`.st-ad.many`).
- **Delete did nothing after clicking a flight.** The click re-rendered the page and the block lost focus. The block now keeps focus, and a document listener removes the selected flight on Delete/Backspace (Escape lets go) unless the pupil is typing in a field.
- **The Operations Model's Test plan hid half its controls with six routes.** It had one column per route in a third-width panel. Both plans are now one row per route.

**Parked by Bertie (to discuss with Fable, no change yet):**
- The Studio is busy for dyslexic learners.
- As the fleet grows, short-, medium- and long-haul could be separate views.

Bertie's revised interaction brief takes both further. It is being built as a separate file, `airline-opening-studio-v2.html`, so the main game is untouched until he approves. Focus View and other accessibility options are parked for now. The v4.10 Studio is kept, byte for byte, as `airline-opening-prototype-v4.10-studio.html`.

## 0d. Workbook v4.10 (13 Oct 2026): the Operating Plan Studio

`p4zd_studio.js`, after `p4zc_signoffs.js`:
- **Entry.** `renderPlanner(st, summing)` sends the plan step (not the sums, not *Test an idea*) to `renderStudio`; the old planner is `renderPlannerBase`. The page is a desk page (`deskPage` + `deskBar`) whose body keeps the hooks the wrappers use: `.plw` (the board's hold), `.plw-tools` (World report), `#ideaOpen` (the Operations Model), `.ad`, `.ad-lane`, `.ad-blk` with `data-tl` (`bindTimeline`: drag, keys, select), `data-pe` on the fare bars and *Add to schedule* (`bindPlanEditor`), `data-addsel` on each row's *+ Add flight…*.
- **Pieces.** `studioCard` (fares from `paxWant`), `stripData`/`stripHtml` (`demandPools` per band: locked solid, flexible hatched by the archetype's band shares), `studioLanes` (blocks coloured by `fillCls` from `seatFillGood`/`seatFillMedium`), `studioTable`, `studioLive`, `studioStepState`.
- **Tips.** `planTipsFor(pl, L, opts)` checks every PlanTips condition (`WORLD.planTips`, with defaults in `PLAN_TIPS_DEFAULT`) and returns two at most, lowest priority first; `opts.actual` with the week's averages a day is the review's version. `addService` records an out-of-range attempt (`S.rnd.stRange`) for `range_fail`; `S.rnd.fareWas` keeps the week's starting fares for `fare_too_low`.
- **Reviews.** `seatFillReviewHtml(h)` is inserted in `renderWeekReviewBuild` and `renderPeriodReviewBuild`.
- **Tests.** `studioReport()` returns the panel's figures, the tips, the blocks and the cards; `week.test.js` compares them with the page on Launch Day, day 8 and day 22.

## 0c. Workbook v4.9 (13 Oct 2026): the cap, the decay and the floor

`p4zc_signoffs.js`, after `p4zb_decisions.js`:
- **The ledger.** `S.so.weeks[week]` holds each sign-off the week considered: `{key, rel, label, cls (new | changed | repeat), money, level (calc | build | model), why (asked | cap | decay), point, done}`. `S.so.rel` counts Calculate completions from week 2 (the decay); `S.so.cap` and `S.so.hold` are the teacher's.
- **Deciding.** `soDecideList(cands, point, commit)` ranks and caps the candidates at each point of the week: the audit, `acquire` (`acRbDue`), `fleetSums`, `workings` (the `decideHandSums` wrapper filters tickets, removes flight time and the range check, and sets `S.rnd.fuelCards` from `soFuelCands`) and the fuel desk (the first order keeps a reserved slot). Decisions freeze on the workings step. `soSync` marks a Calculate done when its skill's count rises.
- **Cards.** `soCardHtml`/`soBindCards`: Build (`soBuildCheck`: a figure, the operation, a figure; × either way, ÷ the right way; hints for a wrong figure or operation) and Calculate (`soCalcCheck`, with an estimate in the Query). `soSpec` gives each relationship's figures; `soFinish` records the skill and the log. `R.workings` shows a *Sign-offs* page first when the week has Build cards or a flight time; `R.fleetSums` and `R.acquire` use the same cards.
- **The floor.** `startBeat` inserts `{t:'audit'}` after the review when the last period held a month end after day 29. `soAuditData` uses `bestPlanSweep` on the month's last week as a daily rate, each route's takings against the best plan's, and `S.planChange` (kept by the `closeDay` wrapper) for the idle weeks. `R.audit` is the Finance audit or the board review; `S.board` holds the plan's Next (`R.plan` wrapper) until `planKey` changes. The `closeDay` wrapper also runs `neglectUpdate` for week and month periods.
- **Small fixes.** `periodShort` names 9–27 December "December"; the ƒ inspector opens on the week planner (`dockHtml`).

Tests: `week.test.js` checks the cap each week, the week 2–4 sign-offs against Fable's §4, the Build and Calculate cards (a Query first), the audits, and with `COAST=1` the board review and the held plan; `CAP=1` runs the dial. `migrate.test.js` signs the cards on a migrated day. Report: `docs/Cap-Decay-Floor-Report-Back.md`.

## 0. Workbook v4.7 (12 Oct 2026): the second-aircraft decision and Build reviews

`p4zb_decisions.js`, after `p4z_model.js`:
- **The engine for the decision.**
  - `acProblem` finds last week's most turned-away route.
  - `acBasePlan` is the plan without that route.
  - `acBestOn` searches each candidate's best plan on a route: fares, one to four services, departures from `acDepSets`.
  - `acCompare` (cached) and `whereSoon` (the week 3 and week 4 routes) build the comparison.
  - `acGrow` uses the `DEMAND_X` what-if multiplier inside `demandMult`.
- **The screens.**
  - Screen 1 is `renderAcCompare`. It replaces `R.shop2` when `acCompareOn()`: week mode, one aircraft, and the three planes in the shop.
  - Screen 2 is `renderAcPay`. It replaces `R.acquire` after a choice, and `acApplyChoice` puts the plane on its compared plan.
- **Reviews.** `reviewBuildOn()` (the workbook's `reviewTotalsMode`, or the teacher's `settings.reviewTotals`) switches three reviews to Build cards:
  - `R.weekReview` uses `renderWeekReviewBuild`;
  - `R.review` uses `renderPeriodReviewBuild`;
  - `R.chapterReview` uses `renderChapterReviewBuild`.

  The cards are `rbCardHtml`/`rbBind`, checked by `rbCheck` with Fable's hints. Means are stored in `S.means`, and `rbPlan()` drives the tests.

The type weights block at the end of `p1_head.html` follows the brief's §2.4.

Tests:
- `week.test.js` checks the comparison, the payment screen and the Build reviews.
- `migrate.test.js` builds the Sunday totals.

Report: `docs/v4.7-Report-Back.md`.

## 0b. The desks v2 and Workbook v4.6 (12 Oct 2026)

Fable's *Design Note: The desks, v2* and Bertie's three reference screens (Operations Model, Fuel Procurement, Service Cost Breakdown), built in week mode on three new parts after `p4w_planner.js`:
- **`p4x_shell.js`, the shell.** The 1,680 × 940 canvas (`deskScale`; `canvasMedia` evaluates every media rule against the canvas), the dark header (`deskHeader`, `updateTopBar`), the nav (`DESK_NAV`, `navActive`, `shell`), the page frame (`deskPage`, `deskBar`), the drawn art (`artBanner`, `artDusk`, `artCity` with a landmark per city, `artRefinery`, `artWeather`, `artShip`, `artTank`, `artEurope`, `artCoins`), and the Reputation and Reports desks (`renderDeskView`).
- **`p4y_desks.js`, the desks.**
  - The fuel model: `fuelContract` for week 1; `burnFuel` with the emergency top-up at +10p; `fuelWeeks` and `fuelAdvantage`; `tankCapacity` at 8,000 L, then 20,000 L from day 29 with `tankUpgradeNotice`.
  - RouteNews: `demandMult`, `newsOn`, `surprisesIn` and `announcedFor`.
  - The performance card: `fuelCardsDue` (the `fuelHandSum` rule), `servicePlan`, `cardStage`, `serviceFigures`, `svcCardHtml`/`renderSvcCard`, the methods from WorkingMethods (`scRows`), and the stamps.
  - The sign-off documents (`docListHtml`) and the one-line fuel strip.
  - Fuel Procurement: `fuelDeskHtml`/`renderFuelDesk`, `fuelChartSvg`, and the `fuelDesk` Monday step in `daySteps`.
  - The week and month beats on the desks (`stepsFor`; `dayLike` now covers them).
  - The World report (`worldReportHtml`), the Network destinations (`renderView`), and the surprises line.
- **`p4z_model.js`, the Operations Model.** The Build step (`omBuildHtml`, `S.analyst`), `omWeek` (seven days in one dry run), `omPlanTable`, `omResults`, `planDiff` pills and saved tests (`S.savedTests`).

Data: `tools/merge_workbook.py` installs a Fable workbook, keeping the CR5 parts. `import_world.py` reads the Market forecast columns, WorkingMethods and RouteNews.

Tests:
- `week.test.js` plays to day 60 (`UPTO=100` reaches the chapter review day, 28 December, with no errors): the cards, Query/Checked, the strip, the fuel desk and its first-order sign-off, the model's Build step, the World report, Network, and the 20,000 L tank.
- `engine.test.js` adds Dublin ×2 for RouteNews.
- `migrate.test.js` handles the card and the fuel desk.
- `opening.test.js` (day at a time) is stale since v4.4: it waits for the removed market screen.

Report: `docs/Desks-v2-Report-Back.md`.

## 0a. Workbook v4.4 (12 Oct 2026)

Chapter 1 is played a week at a time (D52): the Calendar's `weekPhase` (plan / run / review) drives `p4v_week.js`. Monday: HQ → (showroom, the fleet sums, buy or rent, the paint shop) → (event) → the planning page with Plan Impact → the workings page → Ready → fly → results. Tuesday–Saturday: `weekRun`, one day per step on the operations board (`S.wk` holds the week's rows and Monday's projection), an event card or a sum stops it. Sunday: fly, then `weekReview` (the week7 table, the missed-profit sweep `bestPlanSweep`, `neglectUpdate`). `closeDay` moves to the next Monday, the regular-plan approval after day 28, then the weeks. Money per D53/D55: day costs, list prices, Finance in days, `saveUp` greys Buy. The look is the Dragon Air block at the end of `p1_head.html`. Tests: `week.test.js` (weeks 1–4), `migrate.test.js` (old codes land in the week), `balance.test.js` (re-based). Decisions and the report-back items: `docs/Workbook-v4.4-Report-Back.md`. The day-by-day screens below remain for `teacherDayByDay` and the weeks.

**The Week 1 planner (UI Widget Design Brief v4.4, 12 Oct 2026; `p4w_planner.js`).** Heathrow is the hub and both routes are open from Launch Day: the aircraft, market, demand and one-service screens are replaced by one intro (`brief1`: the job, the starting position, the five steps, *Open Week 1 Planner*). The planner is one page: the market widgets with the fare chips (`marketWidget`), the aircraft day as the schedule editor (`timelineHtml`, `bindTimeline`: blocks on the 06:00–22:00 timeline, Earlier / Later / Swap route / Remove, drag with a ghost snapped to 10 minutes, arrow keys; `editPlan(i, 'depTo')` moves a service to an absolute time, re-sorts the aircraft's services and lands on the nearest free time), the on-board tiles, the fuel strip (`fuelWidgetHtml`; `autoFuelOrder` places Monday's order) and Plan Impact (`ctxPlanImpact`, ƒ on the figures `hiddenFigs` says are still to do). The sums open in the Maths Dock beside the plan (`sumDockHtml`: structured working, squared paper, formula; `finishSums`), *Test an idea* compares one test plan (`compareHtml`, `planDiff`), the map is `#mapOpen`. No plan rail in week mode (`planRail` returns nothing; the `.ws.norail` grid). Square geometry and the pale surfaces are the block at the end of `p1_head.html`. Everything falls back to the earlier screens when `teacherDayByDay` is on.

## 1. Screens

### In play order

| # | Screen | When | What the pupil does |
|---|---|---|---|
| 1 | Welcome / Home menu | Start | Continue, New game (confirm; the old run goes to Best runs), Best runs, Save code, open the wall window |
| 2 | Name your airline | Launch day, step 1 of 6 | Type a name (1–20 characters); it shows on the wall's departure board as he types |
| 2a | Pick a flight code | Step 2 | Two letters, suggested from the name; real codes (Settings `blockedFlightCodes`) refused calmly; preview *BE101 · Dublin · 09:00* |
| 2b | Make a logo | Step 3 | Shape × symbol × two colours (Livery sheet); replaces the fin mark in the top bar and on the wall |
| 3 | Paint your first plane | Step 4 | The paint shop: colours (main, belly, engines), stripe and tail colour, four stripes, seven tail symbols incl. the logo; *Name it*: G- + four letters (unique), a name with suggestions; *Surprise me*; live on the wall |
| 3a | Roll it out | Step 5 | The hangar reveal (doors, roll-in, shine), Skip, Continue |
| 3b | Your certificate | Step 6 | Air Operator Certificate on screen; Print |
| 4 | HQ start-up | Setup | Animation; moves on by itself |
| 5 | Chapter banner | Setup | Chapter 1, *Starting out*, 2 Sep – 28 Dec 2030, from the Chapters sheet; Begin |
| 6 | Your first week in charge | Launch Day (Mon 2 Sep) | The intro: the job, the starting position (Heathrow, 1 × Twin Otter, Paris and Dublin open from day one), the five steps of the week, the cash to start; *Open Week 1 Planner* |
| 7–9 | Aircraft · market · demand · one service | Day-at-a-time mode only | The earlier launch screens (Take delivery, Dublin or Paris, demand in aircraft-sized groups, one service start to finish with the three typed times) |
| 10 | Build your operating plan | Launch Day and every Monday | One planner: the market widgets (city and code, facts, the fare chips with the people at each fare), the aircraft day (each service a block on the 06:00–22:00 timeline: press it for Earlier / Later / Swap route / Remove, drag it with a ghost that snaps to 10 minutes and turns red over another block, or use the arrow keys; the demand directly above; *+ Paris · + Dublin*), the on-board tiles, the fuel strip (gauge, litres by route, price, cost with ƒ, the week's projection and Monday's order), Plan Impact on the right with ƒ on every figure the day's sums ask for; *Test an idea* (Compare plan impacts: your current plan · change · test plan; Use test plan / Reset); *Network map*; *Cost your plan* |
| 10a | Work it out (the Maths Dock) | Launch Day and every Monday with a sum | The sums one at a time in a pale dock beside the plan; the left of the page is a navy spreadsheet of the stage tables that fills in as the figures are done (the plan, read-only, sits under it; Back changes it): Structured working on Bertie's template (place-value columns Th H T O, one digit a box typed right to left, little carry boxes, green working rows, a number pad), Squared paper, Formula (the model's lines with the last answer masked); Check / Show me; a finished figure is written into Plan Impact; the fare and the snack option chosen in the dock or on the plan once their sums are done; the fuel worked example; a summary; optional practice (teacher setting); *Ready to fly*. Skipped when nothing is typed |
| 11 | What's new (3 pages) | Days 2, 3, 4 (two), 6, 8, 12, 15; week 4; December | What's new, the maths (worked in a column), your turn ("which sum?"); key words in the dock |
| 12 | Today's Plan (morning HQ) | Every day, week and month | Headline from the Calendar or Market; the brief (yesterday, what's new, routes opening, the rival, fuel); the standing plan |
| 13 | The air show (aircraft for sale) | Days 8 and 15, every week | Flip cards: photo or plain drawing, facts, four bars on one scale, Buy / Rent / Finance from the Finance sheet; a locked *Coming soon* row; Look closer or Not today |
| 13a | Paint your new plane · Roll it out | After buying | The paint shop for the new aircraft (its own registration), then a short reveal |
| 14 | The sums (fleet) | After choosing an aircraft | Rent or buy = price ÷ rent a day; a full plane = seats × fare; the model's suggested services and extra profit a day |
| 15 | Buy or rent | After the sums | Buy, Rent or Finance (gated by the Finance sheet's dates and the £1,000 reserve) |
| 16 | Plan | Weeks (on days the planning page carries it) | Fares per route, open-route chips, snacks, one tab per aircraft with its services and departure times (range checked) |
| 17 | Decision (event) | Days 4, 5, 11; the week of the fault | The Calendar's or the week's event: options with their cost; Change your mind; a rival undercut shows who stays and the profit for each option (D50) |
| 18 | Cost | Weeks (on days the workings page carries its sums) | The cost sheet with a ticket line per route; the figures the hand-sum rules choose are typed, the rest are the model's (ƒ); empty seats (day 19) and flight time (day 15, new routes) as side tables; in weeks, "one day of the plan" only when a rule fires |
| 19 | Test | Weeks (on days it is the planning page's *Try an idea* panel) | Change a test plan; the model costs it; save ideas; Fly my plan / the test plan |
| 20 | Fuel | Days 3–21, December | Order fuel in 500 L lots; tank batches, oldest burned first; the order bill is the model's; the CEO's advice on buying ahead |
| 21 | Ready | Every period | Each aircraft's timetable, fares, on board, fuel, the decision, the projection; blocked below the cash reserve; warned on a loss |
| 21a | Take-off | Launch day, before live operations | The first take-off on the wall (taxi, roll, climb-out) with sound if on; Skip, Continue |
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
| HQ shell | Left nav (Overview, Today's Plan, Network, Fleet, Finance). The plan rail (Plan → Cost → Test → Operate → Review, with Edit) shows in day-at-a-time mode only: the week loop has none (12 Oct), Back steps through the day's screens |
| Dock (right) | Context (aircraft status with a departures board of up to four rows, your airline, the offer, key words); help; working space; ƒ model inspector; calculation dock |
| Back | ◀ Back on every planning screen; never past operations, a run or a signed order |
| Operations Wall | Boards, map, strip, news; live handoff, featured aircraft, announcements, focus moments, compressed days; second window via `?display` |
| Teacher panel (Ctrl+Shift+T) | Release, skip, text size, events, maths tools (Calculate/Build/Model), **By hand so far**, **Chapters 2–6: the gates**, **Skip ahead 1/4/8 weeks**, calculation checks, time check, cash and reputation, pace, **sound (off by default)**, **reduce motion**, menu, runs, question bank |
| Your airline (home menu) | Edit the name, flight code and logo; Repaint any plane |
| Fleet view | Every plane side by side in its livery, with Repaint |

### In the code but not reachable in normal play

| Screens | Why |
|---|---|
| timetable, fareTry, costPlan (days), planner (days), testIdeas (days), workout, dayForecast, options, route, setupFuel, setupPrice, setupDone, home | Removed from the day step lists (timetable, planner, the day's cost sheet and Test became the planning page and the workings page on 8 Oct 2026; an older save's steps are migrated); the home is fixed at Heathrow T5 |
| yearPlan, afford, yearReview, strategy, shop, invest, purchase, delivery, milestone | The old year and purchase flow: chapter 1 ends at the review; no beat reaches them |
| Old strategy, review, hq, planner, ready, fly, results, sim, protoEnd, event | Replaced by later renderers of the same name |
| starter, market, demand, rotation (the launch screens), the plan rail, the workings page as a full screen, the fuel panel | Week mode (12 Oct) replaces them with the intro, the planner, the Maths Dock and the fuel strip; day-at-a-time mode keeps them |
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
| Crew duty | Working from `crewMechanicFromDate` (D51, chapter 2) | Over 12 h (with half-hour padding) adds a second crew, £250, per aircraft; off in chapter 1 (no briefing, no cost, no crews line) |
| Rival switch rule | Working (D50) | 1 in 10 of the passengers switch per £10 the fare is above the rival's, cap 6 in 10, advertising halves it for the event's duration (`rivalSwitch*`, Events `rivalFare/durationDays/advertiseCost/affectsRoutes`); the world engine agrees |
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
| Maths toolkit | Working | Calculate / Build / Model per tool; the rules decide the day's levels (the daily budget: one spotlight sum, at most two plan sums, never more than three multiplications; Build waits for day 22); the teacher overrides |
| Practice questions | Working (teacher setting, default 0) | `PRACTICE` specs (ready-again, fuel price, weekend tenths, tenths, cabin sales, tickets, empty seats) with the pupil's own numbers on the workings page; typed, calm retry, Show me after three; logged with the hand sums. The ready-again questions on the one-service screen are always on |
| Answer checking | Working | Accepts the model's figure or the working on screen; sign hint; Show me after 3 tries |
| Live operations | Working | Show built from the model's flights; the featured aircraft is the one flying; weeks compressed; months plain |
| Saves | Working | Version 5 (`ASIM5.`); older codes (the 7–8 Oct build, the 5–6 Oct build's `ASIM4.`, the full game) are carried into the current flow, see §Old save codes |
| Captain's challenges, hunts | Not in chapter 1 | Readers only (from 6 Jan 2031; the Hunts sheet is placeholder) |
| Airline type | Absent | The old strategy step is out of the flow (the brief's `airlineTypeChoiceDate` is placeholder) |
| Fluency engine | Absent | Rules 1–6 replace it |
| Plans archive | Partly | Days and weeks; months not archived |
| Question bank export | Working | Lists the current tables with their sums in words |

## 3. Data

### Blocks in `p2_data.html`

| Block | Contains | Used now? |
|---|---|---|
| data-workbook | Imported from `data/Airline-World-Workbook.xlsx` v4.2 + the v4.3 draft (Livery 35 rows, Aircraft artwork and photo columns, 3 Settings keys): settings 44, archetypes 4, routes 18, aircraft 8, finance 8, airports 1, calendar 21, market 17, events 10, challenges 2, mechanics 15, chapters 1, hand-sum rules 8, catering 4, hunts 0 | Yes: it drives the game |
| data-world | Starting values, day hours, fuel lot, tank, max services, rival name; 4 homes (only Heathrow T5 used), 13 old routes (overridden), `setupRoutes`; no beat list any more | Partly |
| data-planes | 12 old aircraft (overridden by the workbook's 8; pictures and makers kept) | Pictures only |
| data-tools | Maths tools and their default levels; `rentOrBuy`, `seatsFare`, `flightTime` added | Yes |
| data-tables | Calculation tables; `rentbuy1`, `seatfare1`, `time1` added; the cost sheet and the chapter accounts build their own rows | Yes |
| data-artwork | The painted side views from `src/opening/assets/aircraft/*.svg` (dhc6, sf34, at72, e175, e190, narrowbody) | Yes |
| data-photos | Showroom photos from `src/opening/assets/photos/`, by the Aircraft sheet's `photoFile` (none yet) | Yes, when present |
| data-reviews, data-fins, data-text | As before (`data-fins` is superseded by the logo) | Partly |
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
| Showroom photos | Aircraft sheet photo columns (empty) | The card front shows the painted drawing in plain colours until a licensed photo is recorded |
| The coming-soon aircraft (787, A350, 747, A380, A340, 777, 757) | Aircraft sheet, not live | Name, date and picture only (`aircraftPreview`); no figures are read |

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

### Old save codes (9 Oct)

Pupils' codes from before the 8 October changes load from the teacher panel's *Load code from box* (`p4u_migrate.js` replaces `migrate`):

| Code | What happens | Where the pupil lands |
| --- | --- | --- |
| 7–8 Oct build (`ASIM5.`, steps `planner / costPlan / testIdeas`) | Repaired in place: the day's steps become `plan / workings`, the old cost sheet, forecast and fuel order are cleared (a paid fuel order is refunded), fares not on offer move to the nearest fare, a missing logo is made from the old colours, a Red Kite advertising choice still counts while the event lasts | The same step if the pupil had not reached the plan (HQ, briefing, showroom, event card); the planning page if they were anywhere from the planner to the flight; the results if the day had flown. Weeks and months keep their steps |
| 5–6 Oct build (`ASIM4.`, May 2030 calendar) | The airline, cash, fleet, fares, snacks (`sell3 → low`, `sell5 → high`), departure times, history and ledger are carried into a fresh state; days shift by one (launch day was day 0, it is day 1 now); the old news log is replaced by one line; no sums record, so the first-time sums are asked | The matching day starts again from HQ (`needsRestart` → `landSave()` → `startProtoDay`) |
| Full game (`ASIM4.`, home `cwl/sws/brs`) | As above, plus the home airport becomes Heathrow, aircraft and routes not in this version are replaced or taken off the timetable, each with a note | As above |

The notes are listed in the teacher panel under the save code and kept in `S.migrated`; the Home screen says "Saved on an earlier version of the game: it carries on from …" until *Continue*. A current save passes through unchanged. `tests/migrate.test.js` runs Bertie's two real codes (`tests/fixtures/`), a mid-day variant, a synthesised full-game code and the no-change check.

## 5. Known bugs and assumptions

### Bugs

| Bug | Where | Checked |
|---|---|---|
| Results card says ALL LANDED even when a service was cancelled or an aircraft grounded | p4d_opening.js (results head) | Code |
| Teacher "Skip to the next story beat" drops into the old round flow; Repeat this period and Tomorrow's choice do nothing in the new flow | p4c_display.js | Code |
| Plans archive skips the months | p4g_opening2.js | Code |
| An information event applies for its whole week, not from its date | p4n_weeks.js `startBeat` | Code (decision 14 in the report-back) |
| Use-it-or-lose-it names every open route, including ones the pupil never flew (Frankfurt, Geneva, Barcelona at the week-4 review) | p4v_week.js `neglectUpdate` | Verified by `week.test.js`; as the v4.4 note states the rule; raised in the report-back |
| "The airline's day (+)" sum in week 2 is not built (no addition tool) | p4v_week.js `decideHandSums` | Code; raised in the report-back |
| Workbook: Reykjavik's report fare (£180) is not on its fare list; Istanbul's archetype is not live | `data/Import-Report.md`, `balance.test.js` | Verified by the importer and the balance test |

### Assumptions

- "The game" is the opening prototype. The full game is frozen and only appears in section 4.
- "Working" means used in the scripted play-throughs and passing the tests, not tested in class.
- The scripted pupil rents the Saab on day 8 and gives it Amsterdam services; a pupil who rents and idles the aircraft loses money and meets the cash-reserve block (by design; the teacher panel can adjust cash).
- The decisions taken where the workbook is silent are listed in `docs/Workbook-v4-Report-Back.md`.
