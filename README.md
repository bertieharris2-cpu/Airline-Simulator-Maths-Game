# Airline Simulator — Maths Game

A single-file, offline airline business simulator for one pupil, built to the Build Brief (Oct 2026).
Decisions from data first; one gated, multi-step calculation per round at Welsh Progression Step 3.

## Files

| File | What it is |
| --- | --- |
| `airline-opening-prototype.html` | **The active development version.** Chapter 1 of the workbook's story: Launch Day (Monday 2 September 2030) to the chapter review on 28 December 2030, paced by the workbook's Chapters, Calendar and Market sheets. See *Opening prototype* below. |
| `airline-simulator-full-reference.html` | **Frozen.** A snapshot of the complete simulator (weeks, months, later aircraft, international routes, storyline, awards, challenges). Critical fixes only until the opening is approved (so far: the full-screen button, which the teacher's triple-tap corner used to cover). |
| `airline-simulator.html` | The complete game, identical to the full reference for now: the HQ (laptop) and the Operations Wall (IWB) in one file. Double-click to run in Edge/Chrome. No internet needed. |
| `src/opening/` | **The prototype's source.** `parts/` holds the pieces (style, data, screens, script) that `build.py` joins into `airline-opening-prototype.html`; `tests/` holds the browser tests. Edit the parts, never the built file. See *Building and testing the prototype* below. |
| `data/` | The world data built in Claude chat: `Airline-World-Workbook.xlsx` (v4.2: chapters, hand-sum rules, routes, aircraft, finance, calendar, market, events, catering, challenges, hunts), the Balance Reports in `data/balance/` (v2–v4.1) and `Change-Note-v4.md`. `Import-Report.md` is written by the importer: what loaded by status, every check, and the "Chapter 1 touches" (non-live values the chapter reads). |
| `src/opening/engine/world-engine.js` | **The world engine** on the workbook's rules (Fable Pass 1, section 0, in `data/fable-routes-pass1.json`): one aircraft's day with five time bands, time-locked and flexible passengers, costs per service and per day, and a second crew past 12 hours' duty. `node src/opening/tests/balance.test.js` checks it against every figure in `data/Balance-Report.md` (all 40 reproduced, with school rounding). **The game uses it:** `src/opening/parts/p4a2_workbook.js` applies the workbook's values as the page loads and `p4h_world.js` puts its rules into the game's model; `node src/opening/tests/engine.test.js` checks the game prices plans exactly as the engine does. |
| `tools/import_world.py` | Copies the workbook's live rows into the prototype's data as `data-workbook` and writes `data/Import-Report.md`. Run `python3 tools/import_world.py` after editing the workbook (`--check` writes only the report), then `python3 src/opening/build.py`. Live and optional rows only; placeholder and later rows are reported, never loaded. |
| `docs/` | `State-of-the-Game.md` (screens, mechanics, data, bugs), `Workbook-v4-Report-Back.md` (what was built from v4.2 and the decisions Fable should check), `CR5-Report-Back.md` (identity, paint shop and showroom: what was built, assumed and not done, with screenshots in `docs/screenshots/cr5/`), the run-through comparisons and the live-operations evaluation. |
| `prototypes/hq/` | The HQ look-and-feel explorations that led to the current design. Standalone; not used by the game. |
| `paper-backup-pack.html` | Printable A4 pack: decision cards, calculation sheets, review cards and a teacher answer sheet for one round. Open and press Ctrl+P. |

## Opening prototype

The opening is being made excellent before the later campaign continues. `airline-opening-prototype.html` is self-contained like the full game, and keeps its **own saves** (it never shares a save with the full game).

**The HQ desktop.** After launch day's identity steps (name, flight code, logo, the paint shop, the hangar reveal, the certificate: see *Airline identity* below) a start-up sequence runs (*Initialising headquarters… Operations online · Finance standby · Network standby · Fleet awaiting delivery · System ready*, or press *Enter HQ*) and everything else happens inside one HQ, in three layers:
- **The chrome stays put.**
  - **Top bar, in zones:** airline and strategy · date and *Day N of operations* · status chip · reputation · the **cash balance** (the only place cash is shown, apart from the fuel calculation) · Alerts · Operations Wall · Home · Full screen.
  - **Left nav** (icon and label): Overview, Today's Plan, Network, Fleet, Finance.
- **Modules come online as the airline grows.**
  - Network, Fleet and Finance start locked, with a small note under each: *After first flight*, *From Day 1*, *After Day 1*.
  - **Finance** comes online after the first flight, **Network** when the Day 1 timetable starts, and **Fleet** after Day 1.
  - Each one lights up with a short system notice (*Finance online*). Older saves unlock whatever their history implies.
- **The workspace: plan rail · task · dock,** with an action bar across the bottom (a one-line hint and the main button).
  - **The plan rail is the day in stages.**
    - Launch Day: *Airline ready* (aircraft, first market) → *Plan* (demand, one service, the planning page) → *Work it out* → *Operate* → *Review*.
    - Every day of chapter 1: *Plan* (What's new, the decision, the planning page) → *Work it out* → *Operate* → *Review*. Weeks keep the planner, the cost sheet and the Test screen.
  - **The planning page and the workings page** (Fable's design note, 8 Oct 2026). Planning and calculating are two screens. The **planning page** is the HQ page: the services (×1–×4 on launch day, with the reason a service won't fit; the planner from day 2), the fare chips with the people at each fare, the expected passengers, and **Try an idea**, the modelling tool (a test plan the model costs, no sums; *Make the test plan my plan*). **Cost your plan** opens the **workings page**: full screen on squared paper, one sum at a time in the formal written method (the figures in columns, a carry row, working rows, the answer typed; a number pad for the whiteboard), *Check* with the calm retry and *Show me* after three goes, which fills in the method. The launch day's fare and the snack day's option are chosen there once their sums are done; then a summary of the day's workings and *Back to HQ*. A day with nothing to work out skips the page.
  - **The daily maths budget:** one spotlight sum, at most two plan sums, never more than three multiplications a day: launch day tickets at three fares then the chosen fare's profit; day 2 cabin sales at £3 and £5 then the chosen option's profit; day 3 a worked example on the paper then the fuel cost (the order bill is the model's); day 4 the new route's tickets (Calculate, not Build: Build waits for week play); day 5 the Red Kite tenths (passengers who stay); day 6 one weekend tenths question; day 7 nothing. About 12 hand sums in week 1.
  - **Practice questions** are a teacher setting (`practiceQuestionsPerDay`: none, one or three a day; the workbook's value by default, 0). When on, they follow the summary on the workings page, marked optional, with the pupil's own numbers (his route's fares and passengers, his litres, his buyers, his weekday people). The launch-day ready-again questions on the one-service screen stay (three typed times).
  - **Red Kite (D50):** for every £10 the pupil's fare is above the rival's, 1 in 10 of his passengers switch (cap 6 in 10); advertising halves it for the event's duration. The event card shows, for each option, who stays and the day's projected profit, and *Fly Paris instead* as a note row.
  - **Every screen says what to do:** a *Do this* line under the question (`STEP_TODO`, or `todo:` on the screen), on the identity screens too.
  - **Crew duty waits for chapter 2** (`crewMechanicFromDate` in Settings, D51): no briefing, no £250, no crews line before it; the world engine follows the same date.
    - A finished stage folds into one resolved line with a green edge and a summary (*✓ Service built · Paris ×3 · 57 seats*). Click it to open its steps; any step can be reopened with **Edit**.
  - **The dock (right):** the context for the current activity:
    - *Home base*, *Market comparison*, *Aircraft and market*, *Flight timing*;
    - *Aircraft status* with a small departures board that gains a row as services are added;
    - *Aircraft & Market Context*, *Today's forecast*, *Fuel status*.
    - **Help and guidance** rows sit underneath. Help, the working space and calculations dock here for a moment, and closing them (✕) brings the context back. The step underneath never changes. The dock can be folded away (›).
- **Never ask twice.** A setting stays set until it is edited.
  - **No fare is decided before it is costed.** On launch day the tickets at three fares are worked out by hand on the workings page before the fare is chosen; on later days the fare is set on the planning page (and tried on the modelling tool) and its figures are worked out on the workings page.
  - Editing anything from later in the day shows **Back to …** and returns straight to where you were.
  - The morning *Today's Plan* card lists the standing timetable, fares, on-board offer, departure time and fuel, each with Edit.
- **Launch:** a final *Ready for launch* step lists the operating plan (timetable, fare, extras, fuel, forecast). Each item has Edit, and a warning if it needs updating, for example if the plan changed after the forecast. Then the big **START OPERATIONS**. Fuel orders are paid at this point.
- **Calculations in the dock, with no number pad.**
  - A figure still to work out shows as **Complete figure** in its cell.
  - Choosing it opens the *Calculation* dock: the sum stacked like a written sum (*Total revenue £3,040 / − Total costs £2,562 / = Profit [ ]*), a large answer box with the cursor already in it, and **Confirm figure** (Enter works too).
  - Wrong: *That figure doesn't match the forecast. Have another look.* Right: *Forecast updated*, the figure lands in its cell with a short highlight, and the dock offers **Next figure** or closes by itself.
  - Only on Launch Day does the first figure open by itself. The fuel order cost works the same way, without leaving the fuel screen.
- **The working space** is a dock tool too: the figures in play pinned at the top, a pad (pen, eraser, undo, clear), and *Show on the board* for the Operations Wall.
- **One service** reads as an operations sequence:
  - a route strip `09:00 LHR ━━ CDG ━━ LHR ● READY 12:40`;
  - a stage indicator *Outbound · Turnaround · Return · Ready again*;
  - blue flights and steel-grey hatched turnarounds;
  - a large **READY AGAIN 12:40**, then *Build the day*.
- **The timetable** draws the operating day as one row per service (LHR → CDG, turnaround, CDG → LHR, *Ready again*) and the passengers as a card per service: cyan for passengers, outline for empty seats, orange for no seat.
- **The home airport** has the four airport cards on the left and a locator map on the right: the real coastline cropped to Britain, Ireland and northern France, with all four airports, the chosen hub highlighted, and route lines to Paris and Dublin labelled with the flight times.
- **The visual language:**
  - one navy palette lit from the upper left: page #061426 → shell → panels → the active workspace → the dock (slightly brighter, with a cyan edge);
  - cyan panel titles in mixed case; 0–2px corners;
  - primary buttons in a blue gradient; selected items get a cyan edge and a blue wash;
  - **gold only for money and prestige**, green for done, orange for "no seat", red for real problems;
  - words and figures in the system sans with even-width digits. A modern monospace (Cascadia/Consolas, never Courier) is used only for the calculation dock's column sum and the wall's departure boards.
- **Strategy cards** label their meters: *Fare level · Higher*, *Service level · High*, *Passenger volume · Lower*.
- **The Overview KPI row** shows how the airline is operating: last profit, revenue, passengers, seats filled, fuel stock. Cash and reputation stay in the top bar.
- **Start operations** returns to the Overview in live mode: the clock, the planes on the map and Live Operations move together. The results land on the HQ (revenue − costs = profit, forecast against actual, who flew; Passenger Feedback cycles through the reviews). ***Close the day*** moves to the next morning.

**Chapter 1 on the workbook (v4.2).** The game is paced by the workbook, not by a beat list in code. The Chapters sheet gives chapter 1 its start (Monday 2 September 2030), its cadence (*day → week from day 22 → month from December*) and its review date (28 December). The Calendar sheet is one beat per day for days 1–21; the Market sheet is one beat per week from day 22; December runs as a month (2–27 December); the review is held on Saturday 28 December. `src/opening/parts/p4k_chapter.js` derives the beats from the sheets at load (`buildBeats`).

| When | What happens | The maths |
| --- | --- | --- |
| Launch Day, Mon 2 Sep (day 1) | Name the airline, the flight code, the logo, the paint shop, the reveal, the certificate, the chapter banner (one line at a time, the arriving mechanics as a list), then the Twin Otter, the first market (Dublin or Paris), the demand, one service (with three ready-again practice questions), the planning page (services ×1–×4 with the reason a service won't fit, the fare chips), the workings page (the tickets at three fares, the fare, its profit), Ready, the first take-off, the live wall, results. Fuel is free (launch deal, days 1–2). | **ticket revenue** = passengers × fare, three times; **profit** = revenue − costs; ready-again times |
| Day 2 | Snacks: the Catering sheet's menu and its briefing; the workings page costs cabin sales at £3 and at £5, the option is chosen, then its profit (free snacks as a third on request). | **cabin sales** = buyers × price (two options); **profit** (one) |
| Day 3 | Fuel at £1.30: the worked example stepped through on the paper (pounds, then pence, then add), then the day's fuel cost by hand; the ordering screen is centred with the CEO's advice on buying ahead; the order bill is the model's. | **fuel cost** = litres × price |
| Day 4 | Red Kite Air sells Dublin at £50 (days 4–7): the card shows who stays and the profit for each option (D50); the other route opens; departure times and time-of-day demand; the **event** comes before the planning page. | the new route's tickets (Calculate) |
| Day 5 | The storm (fly / wait £200 / cancel and refund); the Red Kite tenths: passengers who stay with you. | people × tenths |
| Days 6–7 | The weekend: business travellers × 0.7 (Sat) / 0.6 (Sun), leisure × 1.2, by each route's business share; Saturday's one tenths question; Sunday has nothing to work out. | 7 in 10 of the weekday business travellers |
| Day 8 | **The shop**: a second Twin Otter, the Saab 340 and the ATR 72, each to buy, rent by the day or finance (deposit + daily payments) from the Finance sheet. Amsterdam, Frankfurt, Geneva and Barcelona open with £5 fare steps. | **rent or buy** = price ÷ rent a day; **a full plane** = seats × fare (rule 4, once per aircraft type) |
| Days 9–14 | Two aircraft, each with its own services and departure times (tabs on the planner); fares shared per route. Day 11: crew sickness. Day 12: the season card (Geneva ×0.5 now, ×1.4 in December). | fuel again when the planned litres change by a quarter or the price by 50p |
| Day 15 | The E175 and E190 join the shop; **Madrid** opens (1,350 km): only an aircraft with the range can fly it. | **flight time** = distance ÷ speed |
| Day 19 | Full planes. | **empty seats** = seats − passengers |
| End of day 21 | The standing plan is approved; the tank's fuel goes back to the supplier. | |
| Weeks 4–13 (23 Sep – 1 Dec) | Review (load factor as a %), the shop, the plan, Cost, Test, Ready, the week runs. Fuel, season, business/leisure multipliers and weather from the Market sheet; Marrakech opens day 22, Brussels/Berlin/Milan day 29, Rome/Lisbon day 36, Athens/Istanbul day 50, Edinburgh day 57, Reykjavik day 64, Cairo day 78. Events on their week: the fuel spike (£3.00, week 7), the technical fault (decided before the week; its cost a share of yesterday's profit), the football final, the price war, the oil find, the first snow, Christmas. | week 1: **profit a day × 7**; a new route: passengers × fare and distance ÷ speed; fuel when it jumps; the review's **difference** and **average** once each |
| December (2–27 Dec) | A month: the tank comes back, current plan against test plan, the monthly report. | average profit a day, once |
| 28 December | **The chapter review**: each month's revenue and costs shown, the totals, the profit and projected − actual by hand (rule 3); the chapter in figures; the long-haul decision as the hook for chapter 2 (opens 6 January 2031, not built). | **totals**, **profit**, **difference** |

- **Hand sums follow HandSumRules 1–6** (`p4l_handsums.js`, `p4m_fleet.js`): the first time a relationship appears it is by hand; fuel again when the price moves ≥ £0.50 or the planned litres change ≥ 25%; revenue again on a new route; a new aircraft brings price ÷ rent and seats × fare; snacks once; totals at the review; never in the Test plan. `S.skills` remembers; the teacher panel lists *By hand so far*; the teacher's Calculate / Build / Model override still wins.
- **Events** are a step before the planning page (on weeks, between Plan and Cost). A cash option joins the day's costs (the Cost sheet shows the line, so projected = actual). Cancelling a service removes it from the day. Stars are banked until `reputationFromDate`. From day 22 an option's cost is `costShare` × yesterday's profit.
- **The plan carries every aircraft** (`plan.fleet`): services and departure times per aircraft, fares per route, one snack choice. Rent and finance payments are cost lines in *Aircraft's day*. A route out of range is greyed with the reason. Ready blocks a plan that would take cash below the £1,000 reserve and warns on a losing projection.
- **What's new** introductions (three pages: what's new, the maths, your turn) are keyed to the Calendar's mechanics: snacks (day 2), fuel (3), departure times and the second route (4), the weekend (6), the fleet (8), the seasons (12), medium haul (15), the week (22), buying fuel ahead (December). Crew duty's briefing waits for `crewMechanicFromDate`. *Your turn* is the "which sum?" question; practice questions (`p4s_practice.js`) are the teacher's setting on the workings page.
- **The teacher's skip** (teacher panel, weeks only): 1, 4 or 8 weeks run on the standing plan by themselves; the review that follows says so.
- **Chapters 2–6** are read for their dates only: the shop's lease/buy/finance dates, reputation from January 2031, the quarterly task, the Captain's challenges and the hunts are listed in the teacher panel (*Chapters 2–6: the gates*); none of it fires in chapter 1.
- **Reputation is hidden** until `reputationFromDate` (a placeholder in v4.2): star effects are banked in `S.repBank` and revealed at the level earned.
- **Forecast = actual.** Every day, week and month forecast uses the real engine on a copy of the airline; the test checks every period lands exactly as projected.

### Airline identity, the paint shop and the showroom (Change Request 5)
- **Launch day** starts with six identity screens, one decision each, with step dots in the card header: name (1–20 characters) → flight code (two letters suggested from the name; the workbook's `blockedFlightCodes` are refused calmly) → logo (shape × symbol × two colours; it replaces the fin mark in the top bar and on the wall) → the **paint shop** (the hangar stage with the painted Twin Otter; tabs *Colours* / *Stripe & tail* / *Name it* with G- plus four letters, unique across the fleet, and a name with suggestions; *Surprise me*) → the **hangar reveal** (doors, roll-in, shine; Skip; a fade under reduced motion) → the **certificate** (A4 landscape, Print). The HQ boots after the certificate.
- **First take-off:** a *Take-off* step before live operations on launch day: the painted plane taxis, accelerates and climbs out on the wall, with sound when the teacher has it on; then live operations begin.
- **The wall** shows the same stage full screen while he works (modes identity, paint, reveal, cert, takeoff) and updates within a moment of each change.
- **From week 2** the plane shop is an **air show**: one flip card per aircraft (photo or the plain-colour drawing on the front; facts, four bars on one scale, Buy / Rent / Finance on the back), a locked *Coming soon* row, *Not today*. Every new plane goes through the paint shop and a short reveal. The Fleet view shows the planes in their liveries with **Repaint**; **Your airline** on the home menu edits the name, code and logo.
- **Artwork:** `src/opening/assets/aircraft/*.svg`, one painted side view per `artworkId` (dhc6, sf34, at72, e175, e190, narrowbody), inlined by the build as `data-artwork` and painted by `aircraftArt()` (p4q_paint.js). **Photos:** `src/opening/assets/photos/`, named by the Aircraft sheet's `photoFile`, embedded by the build as `data-photos`; openly licensed only, credited on the card and in `data/Photo-Credits.md`. No photos are in yet (the session could not reach Wikimedia Commons).
- **Data:** the Livery sheet (palette, stripes, tail symbols, logo shapes, name suggestions), the Aircraft `artworkId` and photo columns and the Settings keys `blockedFlightCodes`, `soundDefault`, `revealSeconds` are a **v4.3 draft** written by `tools/workbook_v43_draft.py` for Fable to adopt. What the pupil chooses lives in the save: `S.airline.flightCode`, `S.airline.logo`, and `registration`, `name`, `livery` on each fleet entry.
- **Sound** is off until the teacher turns it on (teacher panel), with a mute control in the top bar; **Reduce motion** is a teacher toggle and the computer's own setting is honoured too.

### Live operations on the Operations Wall
*From the Live Operations / IWB Immersion Brief: "Routine time compresses. Meaningful moments become visible." First pass: Launch Day to Week 3. The evaluation and ideas for later stages are in `docs/Live-Operations-Evaluation.md`.*

- **The handoff.** The Ready screen's button is **SEND TO OPERATIONS WALL** (**SEND THE WEEK TO OPERATIONS** in the weeks). The wall plays a short ritual: *Operating plan approved · Dragon Air operations · Schedule received ✓ · Aircraft ready ✓ · Gates opening ✓ · Live operations starting*.
- **Where it plays.** With an IWB window open, the wall plays there and the HQ shows a small Operations card with the clock and the pace buttons. With no IWB window, the Operations Wall opens full screen on the laptop by itself (teacher panel: *show live operations full screen on this screen*), with **◀ HQ** to look at the HQ and **Watch on the Operations Wall** to come back. At the end, the wall shows **Day complete** (or **Week complete**) and **Review at HQ ▶**.
- **A service in full:** check-in, preparing, boarding (the seat dots fill one by one; seats that stay empty are dashed), final call, gate closed (*19 / 19 · FULL LOAD*, or *17 / 19 · 2 empty seats*; people left without a seat wait beside the cabin), pushback, taxi, take-off, the flight (a progress track, ETA and km to go; the route lights up behind the aircraft), cabin service from Day 1 (*10 passengers bought snacks · +£30*, the model's own figure), descent, landing, the turnaround checklist (passengers off, bags, fuel, cabin, boarding for the return), the return, the home turnaround and **Ready again**. The departures and arrivals boards change with it (CHECK-IN G2, BOARDING G2, FINAL CALL, GATE CLOSED, TAXIING, AIRBORNE, LANDED, DELAYED), the aircraft card shows G-DAAA's flight, passengers, fuel, ETA and next service, and short announcements appear as text (with a soft chime, and spoken where the computer has a voice; teacher panel: *airport chimes and announcements*).
- **How much is shown in full.** Launch Day: every service. Days 1–4: the first service in full and the others briskly (a first service on a new route, such as Dublin on Day 4, is always in full). The weekend after the Regular Operating Plan: the first day in detail, then Saturday and Sunday compressed. The weeks: a detailed first day if the plan changed, otherwise one **featured flight**, then the rest of the week compressed: the calendar ticks over, the aircraft fly quickly, and flights, passengers, tickets and sales, profit so far and on-time count add up. At standard pace Launch Day takes about 3½ minutes, a later day 2–4, the weekend about 3½ and a week 2–3. **1× Live · 2× · Next flight (Next event) · Pause · Skip to summary** are on the wall and the HQ; the teacher panel sets the pace (Brisk, Standard, Slow).
- **Moments.** In a detailed day a moment is a ribbon over the flight panel; in compressed time the simulation slows down (*Significant event · simulation slowed*), the event card replaces the week panel with the seat map where it helps, and then *Simulation resuming*. All observe-only, with nothing to answer. They come from the model's own figures: **first departure**, **first full flight**, **first Dublin service**, **100th / 500th / 1,000th passenger**, a **full service with people left behind**, a **quiet service** (neutral wording), a **tight turnaround** (*ready at 12:20, leaves at 12:20: no time to spare*), and a **storm** in Week 3 (data: `"live": {"weather": {"day": 2, "delay": 40}}` on the beat). Everyday moments (full, quiet, tight) appear in compressed time only once for each plan, so an unchanged week is calm. The summary adds **New profit record** and **New weekly record**.
- **The model is untouched.** The show is built from the model's flights: no random no-shows, no extra demand, and projected = actual still holds. The storm only delays a flight on the wall (the last one of the day, so nothing is knocked on), and the review says so: *the airline did not cause the storm*.
- **Not yet:** months and the year keep the plain run (the brief's month timeline is in the evaluation), decision pauses, no-shows, knock-on delays and weather costs wait for the uncertainty stage.

### Building and testing the prototype
- **Build:** `python3 src/opening/build.py` joins `src/opening/parts/` (in order: head, data, HTML, then the scripts `p4a_core`, `../engine/world-engine`, `p4a2_workbook` (the workbook's routes, aircraft, catering and settings), `p4b_control`, `p4d_opening`, `p4e_toolkit`, `p4f_campaign`, `p4g_opening2`, `p4h_world`, `p4i_liveops`, `p4j_intro`, `p4k_chapter` (the calendar from the sheets), `p4l_handsums` (week 1: hand-sum rules, events, weekends), `p4m_fleet` (the fleet and the shop), `p4n_weeks` (the weeks, Market events, the teacher's skip), `p4o_review` (December, the chapter review, the gates), `p4c_display`). A later part's function wins; `overrides.txt` lists them. The build checks every JSON block and the script's syntax.
- **Import:** `python3 tools/import_world.py` after editing the workbook. Live rows only; the report's *Chapter 1 touches* lists every non-live value the chapter reads (today: Istanbul's archetype, `timeSkip`, `reputationFromDate`).
- **Tests** (Playwright, with the pre-installed Chromium; `NODE_PATH=/opt/node-tools/node_modules`):
  - `node src/opening/tests/opening.test.js` plays chapter 1 as a scripted pupil (`UPTO` beats, `W`/`H` for the screen size, `SHOTS=0` to skip screenshots): Launch Day's sums, the events, the shop on day 8 (rents the Saab), two aircraft, the weeks, December and the chapter accounts; it checks the typed figures, that projected = actual every period, and that no screen overflows at 1366×768 or 1915×891.
  - `node src/opening/tests/balance.test.js` (no browser) checks the world engine against Balance Reports v2, v3, v4 and v4.1: every single-service figure to the pound, 17 known differences noted (see `docs/Workbook-v4-Report-Back.md`).
  - `node src/opening/tests/engine.test.js` prices eight plans in the game and in the engine and expects the same pounds.
  - `liveops.test.js`, `answers.test.js` and `runthrough.test.js` cover the live wall, the answer checks and a written run-through.
- **Rounding:** school rounding (halves up) everywhere; the time-sensitive total is rounded first, then shared between the bands (Balance Report v3 §1).

## Running it

1. Open `airline-simulator.html` on the laptop. A saved game opens on the **Home** screen first (*Continue*, *New game*, Best runs, Save code), never straight into the run. **⌂ Home** is in the top bar, and in the bottom-left corner of full-screen task screens. The **HQ** is where the pupil thinks and acts.
2. Click **⛶ Present**. The **Operations Wall** opens; drag it to the board and tap it once for full screen (browsers only allow one full-screen request per click, so the laptop goes full screen on your next tap anywhere at HQ). Where the browser allows it (Chrome and Edge with the window-management permission, usually only offered on http pages) the wall window moves itself to the second display. The laptop must be set to *extend*, not mirror (an operating-system setting the page cannot change).
3. **One screen only?** Press **▣ Operations Wall** in the top bar, or the **W** key, to see the wall on the same screen. **Return to HQ** (or W, or Esc) goes back. It is the same game either way, and the game never needs the whiteboard. *Menu → Open the wall in a window* opens it without full screen.
4. **The HQ dashboard** (the start of every day):
   - the date and period ("Thursday 16 May 2030 · Day 4 · Daily operations");
   - what the operation is doing (Ready / Planning at HQ / Flights in progress / Paused · CEO decision);
   - cash, reputation, fleet in service, and an alerts bell.
   - **KPI cards:** cash, yesterday's profit, reputation and fuel position, each with a trend.
   - **Today's briefing** with the main button, **Operate today's flights**. In weeks it becomes **Run this week**; in months, **Simulate October** with *Run 3 months* and *Run until … is affordable*, plus the *saving for* bar.
   - **Network map** with four layers: Routes, Demand (circle size only, never a number), Profit (route colour from the last day), Opportunities (routes he could open, dashed).
   - **Fleet:** each aircraft, its seats, today's trips, how much of the day it is in use, and its status; plus the next aircraft in the shop.
   - **Route performance:** passengers ÷ seats, % filled, fare, revenue, cost, profit and trend, from the last finished day.
   - **Finance:** ticket money and costs as columns, with profit as a line, for the last 14 days, with a hover tooltip.
   - **Fuel:** tank, today's price, the average paid and the price so far.
   - **Intelligence:** situations, never solutions.
   - At 1920×1080 every panel is visible. On a 1366×768 laptop the secondary panels share tabs (Route performance | Finance, Fleet | Intelligence | Fuel), so nothing scrolls.
5. **The Operations Wall** shows the situation, while the HQ shows the numbers and decisions. It is a fixed 1920 × 1080 layout, scaled to fit any board. It has:
   - the header ("TODAY'S OPERATIONS", date, airport clock, LIVE / PLANNING AT HQ / FLIGHTS IN PROGRESS / SIMULATION PAUSED);
   - departures and arrivals boards (they page when there are more than 8 flights);
   - the map, about half the screen;
   - a status strip: aircraft active, flights today, destinations, delayed, grounded, fuel price, weather, alerts;
   - the news ticker.
   
   It changes mode by itself:
   - **Executive Alert** during an event: the map zooms to the affected route and flashes it, everything else dims, and a card says what has happened and that the CEO's decision is in progress at HQ. It shows no passenger numbers or costs.
   - **Daily results** after landing: big tiles for ticket money, costs, profit, passengers, seats filled and reputation, the profit-by-day chart, the landing report and passenger reviews.
   - **Welcome to the fleet** when a plane is bought.
   - **Milestones** shown once: first flight, first profitable day, 100 / 500 / 1,000… passengers, new destinations.
   
   **✏ Working space** (the pen area) is on the wall's header.
5. **⌂ Home** (top bar or corner, or from the teacher panel): Continue, New game, Best runs, Save code, Open the wall in a window. New game asks for confirmation and records the current run to Best runs first.

Progress autosaves on every decision (browser storage on that machine). The teacher panel and the end-of-day screen also show a **save code** you can copy out and paste back in as a backup.

## Testing on one big monitor

- **W** swaps between the HQ and the Operations Wall on the same screen (the split view was removed when the wall toggle arrived). Or open the wall with ⛶ Present and put the two windows side by side.
- **Test mode**: tick *Test mode* in the teacher panel's Testing row (a device setting, never saved into a pupil's run), or add `?test` to the address. A red TEST bar appears bottom-left: *Answer this one*, *Fill table*, *Skip screen*, *Auto-answer on/off*. With auto-answer on, each sum fills itself in correctly about 0.7 s after it opens; every decision is still yours. Answers filled in this way don't count towards his typed total.

## Teacher panel

**Ctrl+Shift+T**, or tap the top-right corner of the control window three times.

- Accept this answer (fills the open cell) · fill the whole table · skip or go back one screen · high/low nudge toggle (off by default) · auto-advance after landing.
- **Text size**: Standard (22px text, 32px numbers), Large or Extra large. Saved with the run, so it travels in the save code; the IWB follows it.
- Forecast tables: help level on typed rows, which tables are live (as scripted / all / none), working space on the board, **tomorrow's choice** (as scripted, or force ticket price / trips / fuel / seat layout), and "Check the time maths" (runs the Change Request 2 time cases).
- Repeat today (back to the start-of-day state).
- Trigger, delay or skip events · fire a Captain's challenge now.
- Queue or remove jobs for the next round · set depth (1–3) per job.
- Starting cash for new runs · adjust cash or reputation now · start the next day now · flight animation length.
- **Skip ahead (weeks only):** 1, 4 or 8 weeks run on the standing plan by themselves.
- **Chapters 2–6: the gates** (read from the workbook: lease/buy/finance dates, reputation, the quarterly task, challenges and hunts) and **By hand so far** (every hand sum done, by day).
- End session (save and show code) · main menu · best runs · record this run · new run from scratch · test read-aloud · load a save code.
- **Question bank (printable)**: generates a page from the data blocks with every question template per job and depth level, the number ranges in use and a worked example of each. Regenerate after tuning; it never goes stale.

## Time speeds up: days, then weeks, then months

In the opening prototype the pupil never sees "rounds". The pace comes from the workbook's Chapters, Calendar and Market sheets (see *Chapter 1 on the workbook* above): one beat a day for days 1–21, one a week from day 22, December as a month, then the chapter review. The full game (`airline-simulator.html`) keeps its own beat list in `data-world`.

## Game structure

- **Setup phase** (one lesson): name → **airline strategy** (*What kind of airline do you want to build?* Premium · Full Service · Value, each with a slogan, a cabin seat map, fares/service/passengers meters and its trade-off; none is presented as easier or better) → paint your planes (two colours with a live preview, then the tail-fin symbol) → home airport → buy the first plane → *Where should your first plane fly?* (Paris or Dublin) → *How much fuel will you start with?* (Enough for today or Stock up, shown as a ghost fill on the tank) → *How much should a Paris ticket cost?* (£80 / £100 / £120: he types the three incomes, £1,520 / £1,900 / £1,560; tickets sold and profit are given) → the first flight.
- **Strategy** is stored as `S.airline.strategy` (`'premium'`, `'full'` or `'value'`; the list is `STRATEGIES` in the core script so Leisure can be added later) and shown as identity: *PREMIUM AIRLINE* / *FULL-SERVICE AIRLINE* / *VALUE CARRIER* under the name in the top bar, on Home, on the launch screen and in the wall header. It does not change the economics yet; it only changes how Red Kite's arrival is told. Old saves have no strategy and show no badge.
- **Rounds are decision-led (Change Request 4).** Standing choices carry over from round to round.
  1. **HQ**: today's news, *Your airline today* (planes, trips, ticket prices, the tank) and one big **Start the day**. Plane shop and Fleet sit here.
  2. **What will you do?** The news again and two or three choices. **Carry on as usual** is always first and is never wrong.
  3. **The table for his choice**, only if he acts: ticket price, a new plane (cash after buying and trips to pay it back for two planes, then *Where should it fly?*; it flies that day), trips (Step 1: full planes and people left over; Step 2: income from the extra trip, then *Fly the extra trip today* / *Don't fly it*), fuel (litres × price per litre = bill), or seat layout. If today's trips need more fuel than the tank holds, buying fuel comes next; that is the only place the "not enough fuel" warning shows.
  4. **Quick income sum** (passengers × ticket price) on every round where the ticket-price table didn't open, until income is fluent (the fluency engine is CR4 Stage 4).
  5. Flights, then the **landing report**: a short presentation, one point per slide (headline with the profit and cash counting up; each flight with its seats filling; forecast against actual as two bars, including what the extra trip made or would have made; each "why" on its own slide; the stars and reviews). Next, Back and Skip to the end; the arrow keys and Enter also move on. Then the optional event and Captain's challenge, and the summary.
- **Growth**: each route gains passengers at every beat from the second (`growth` per beat, up to `cap`; Paris +2, Dublin starts at 40 and gains +2), so one plane soon leaves people behind. Day 3 offers a Dublin trip for the one plane ("Dublin has 44 people a day and no airline flies there"); Week 6 and the football final offer a fuller day. *How many trips?* is only offered when one plane can't carry everyone.
- **Every task screen is in focus mode**: the top bar, bottom strip and Shop / Fleet / Menu / Present hide; only the big plain question, the story, the table, Back and Working space remain (the teacher shortcut still works).
- **Forecast tables**: every number a sum uses is a row. The open cell has a bright cyan-white outline, the two numbers it uses have cyan outlines, everything else dims, and the next cell opens by itself. Beside the table the sum is said as a sentence in the same colours ("19 tickets × £100 ticket price = ?"); what he types appears in the sentence and the cell. When every sum is done the side panel holds the choice. "What's in this?" on *Cost of the trip* lists running cost, landing fee and fuel. In *Choose the sum* mode nothing is outlined until he taps the two numbers in the table and the sign.
- **Unlocks**: routes and tools open by phase (`data-phases`). Phase 1 shows only Paris and Dublin (no Madrid, no day planner, no break-even bars).
- **Time** comes from one shared module: a trip is out + turnaround away + back, with a turnaround at home between trips; planes leave at 09:00; the airport is open 06:00–22:00. The board, timeline, planner and map all use it.
- **Fuel is a tank** with a capacity (5,000 L plus storage that comes with each plane). Every trip burns fuel both ways. A trip the tank can't cover stays on the ground, calmly.
- **Forecast against actual:** after landing, "You expected £X · you got £Y" for income and profit, with one plain line if they differ.
- **Working space on the IWB:** a big "Go to working space" button on the board (also on every table screen and in the teacher panel) turns the board into a pen area with the current sum's key numbers pinned at the top. Three colours, two thicknesses, eraser, undo, clear. Drawings are not saved and clear when a new calculation starts.
- **World "Clear Skies"**: 32 beats in five acts, re-dated from the *Clear Skies 30 Rounds* workbook onto the calendar above. The six-month review (November 2030) is a checkpoint; the finale (May 2032) records the run.
- **No game over**: if cash goes negative the bank lends enough to keep flying, and says so.

## Editing the numbers (no engine knowledge needed)

All tunables are JSON blocks at the top of `airline-simulator.html`, each with a comment above it:

| Block | Contains |
| --- | --- |
| `data-planes` | The shop: price, seats, speed, range, running cost per trip (`runCost`: crew, landing and maintenance for one trip), **daily running costs** (`dayCost`, paid every day flying or not), fuel use per 100 km (a trip burns it both ways), tank storage the plane adds, typical profit per trip (for the day-by-day pay-back sum), optional turnaround and `minReputation`. |
| `data-world` | Starting cash, opening hours, first departure, turnaround, tank base size, fuel suppliers, demand-icon scale, home airports (landing fee, passenger bonus), routes (distance, base price and demand, `growth` and `cap` for passengers gained each round, the published demand rule, price options), `fuelTopUp` (delivery charge on fuel bought automatically in weeks and months), `reserveDefault` (the emergency money), and the beat-by-beat script: each beat's `date`, `period` (`day` / `week` / `month`), optional `stage` (the milestone screen), `review` (`half` or `year`) and `routine` (doesn't stop a long run), its fuel price, the decision `choice` (news plus options: carry on, ticket price, trips, fuel, seat layout or an effect), demand changes, competitor fares, events, news, challenges. Each route has an `unlockPhase`. A new world is a new copy of this block. |
| `data-fins` | The tail-fin motifs offered in setup (SVG symbols sit just below the data blocks). |
| `data-tables` | The forecast tables: for each table, its question, its rows (given or calc), which calc rows are typed in setup and in the game, the sum sentence for each typed row, and the skill id it will report to. Step 2 adds `periodPlan` (a week or a month), `runPlan` (several months), `afford` (saving for a plane) and `planeM` (buying a plane, emergency money in view). |
| `data-phases` | Which features unlock in each phase, by beat (opening days 1–5, weeks 6–9, the first year 10–20, going global 21+). |
| `data-jobs` | Job titles and icons. |
| `data-reviews` | Review card pools by cause. |
| `data-challenges` | Captain's challenge questions (long multiplication / division) and rewards. |
| `data-text` | Retry messages and the nudge wording. |

Market rules (in the engine, published on screen): demand falls by `drop` passengers for every `step` pounds above `basePrice`; each star above 3 adds 10% passengers (below 3 removes 10%); if the rival is cheaper on a route you lose 1 in 5 passengers; a price two steps above base costs ½ star, one step below gains ½ star; the squeezed cabin costs ½ star a round, the roomy one gains ½.

**Numbers tuned by playing the whole campaign through the engine** (a scripted "sensible pupil"; tune further with real play):
- **One Twin Otter:** about £150–£500 profit a day in the opening days, about £1,100–£2,900 a week, and about £9,000–£22,000 a month in the first year, depending on fuel. The July fuel shock makes a loss unless fares rise.
- **Saab 340 (£45,000):** with £10,000 kept back, affordable around February 2031 (Month 10).
- **ATR 72 (£75,000):** around the Year 1 Review (May 2031).
- **Bigger planes:** each one earns roughly its price back in a year on its best route, so the next one is several months of saving away: E190 £300k, A220 £450k, A320 £550k, 737 £600k, 787 £1.2m, A350 £1.6m, 747 £2m, A380 £2.6m. Concorde (£2.2m) is the prestige wildcard and loses money.
- **Trip costs:** a Twin Otter trip costs £576 + £50 landing fee + fuel; the plane costs £900 a day to keep.
- **The check-the-flight job** only runs when distance ÷ speed lands on a quarter hour, so route distances and plane speeds are chosen to divide cleanly.

## Technical notes

- **Calendar (opening prototype):** `S.day` is the workbook's day number (day 1 = Launch Day, Monday 2 September 2030; `CAL0` is the day before `Settings.startDate`), `S.round` the beat in force (derived from the sheets in `p4k_chapter.js`), and `S.period` the stretch about to run (`{type, from, to, run, forecast}`).
- **Ledger:** every simulated day's ticket money, costs, passengers and seats are kept in `S.ledger`, so charts can show days, weeks or months. `S.history` keeps one entry per period, with its route and plane breakdown and the pupil's forecast.
- **Saves:** the opening prototype's saves are version 5 (codes start `ASIM5.`); saves from the May 2030 calendar cannot carry on and start again. The full game keeps its own saves.
- **One state, two views:** the HQ and the wall both draw from the same game state. Each day's history now also stores passengers, seats, trips and a per-route breakdown (passengers, seats, revenue, cost, profit, fare), which the HQ and the wall's results use. Older saves without them show "—".
- Two windows sync three ways: direct `postMessage` to the opened window, `BroadcastChannel`, and a `localStorage` storage-event fallback (needed on `file://` in Chrome).
- No `Math.random()` anywhere in outcome logic. Same world + same decisions = same result.
- Read-aloud uses `speechSynthesis`; the speaker buttons only appear when a voice is available. Test on the classroom machine (teacher panel → Test read-aloud).
- Styling: one shared style block at the top of the CSS is used by both windows. Mid-blue with a navy structure and white text. **Colour roles:** blue/cyan = interaction (primary buttons are a royal-blue → cyan-blue gradient with white text, an inner highlight and a soft glow; selected cards, tabs, steps and the open table cell are cyan); gold = money, stars, premium, awards and valuable opportunities; green = positive/operating; red = danger or loss; orange = delay or warning. Panels are lit from the top left (lighter blue top-left, deeper navy bottom-right, an inset top highlight). The final *Visual polish* block in the CSS holds these overrides and the tokens (`--act-a`, `--act-b`, `--sel`). Panels are square (2px corners) with thin borders; uppercase header bars with a status dot. Chart colours (ticket money blue, costs orange, profit green) pass the colour-blind checks on both the HQ and wall surfaces. Fonts are the system sans for words and Courier New for numbers, so zeros are plain (no slash) and nothing is downloaded. Change Request 4 adds a reading layer at the end: running text at least 22px and numbers at least 32px at the Standard size, mixed case for questions, stories and tables (the small uppercase panel chrome stays), no scanlines over text, task panels at least 90% of the width and no scrolling at 1920×1080 or 1366×768.
- Stage 1 ships depth 1 for every job. Depth 2 is live for pricing (rival fare shown), fuel (two suppliers), check-the-flight (time zones) and cabin (break-even); depth 3 is live for pricing (demand bar) and fuel (bulk deal). Headwinds for check-the-flight are a placeholder.

## Open items (from the brief)

- [x] Working out the time of each flight (distance ÷ speed) arrives with Madrid on day 15.
- [ ] Chapter 2 (6 January 2031): the long-haul decision, leasing, reputation live, the Captain's challenges and hunts (the gates are built; the screens are not).
- [ ] Decisions for Fable in `docs/Workbook-v4-Report-Back.md` (the review day, rule 2 on day 4, the fault's options, the price war, Istanbul's archetype, Reykjavik's fares).
- [ ] Step 3: the commissioning loop for new planes (configure, route, timetable, launch week, review, "Regular service approved"), story callbacks (`S.flags` already records each event choice) and a multi-award finale.
- [ ] Tune Year 2 (long-haul) numbers with real play.

- [ ] Pupil's top three planes to add to the shop.
- [ ] Nudge on or off by default (currently off).
- [ ] Tune prices, starting cash and rewards after first play.
- [ ] Test read-aloud on the classroom machine.
