# Airline Simulator — Maths Game

A single-file, offline airline business simulator for one pupil, built to the Build Brief (Oct 2026).
Decisions from data first; one gated, multi-step calculation per round at Welsh Progression Step 3.

## Files

| File | What it is |
| --- | --- |
| `airline-opening-prototype.html` | **The game: the one file to open.** Launch Day (Monday 2 September 2030) through chapter 1 (to 28 December 2030), Christmas and New Year, chapter 2 (6 January to 31 August 2031) and chapter 3 to its review on 31 August 2032 (push 1 of 2). It has the revised Operating Plan Studio, Days on every flight, the pupil record, the Working pad and the shop under Fleet. Double-click to run in Edge or Chrome; no internet needed. Since 13 Oct 2026 this is the only game file (the revised Studio, once `airline-opening-studio-v2.html`, is now this file). |
| `archive/` | Earlier versions, unchanged: the first full game (`airline-simulator.html` and its identical `airline-simulator-full-reference.html`) and the v4.10 Studio copy (`airline-opening-prototype-v4.10-studio.html`). See `archive/README.md`. |
| `src/opening/` | **The prototype's source.** `parts/` holds the pieces (style, data, screens, script) that `build.py` joins into `airline-opening-prototype.html`; `tests/` holds the browser tests. Edit the parts, never the built file. See *Building and testing the prototype* below. |
| `data/` | The world data built in Claude chat: `Airline-World-Workbook.xlsx` (v4.2: chapters, hand-sum rules, routes, aircraft, finance, calendar, market, events, catering, challenges, hunts), the Balance Reports in `data/balance/` (v2–v4.1) and `Change-Note-v4.md`. `Import-Report.md` is written by the importer: what loaded by status, every check, and the "Chapter 1 touches" (non-live values the chapter reads). |
| `src/opening/engine/world-engine.js` | **The world engine** on the workbook's rules (Fable Pass 1, section 0, in `data/fable-routes-pass1.json`): one aircraft's day with five time bands, time-locked and flexible passengers, costs per service and per day, and a second crew past 12 hours' duty. `node src/opening/tests/balance.test.js` checks it against every figure in `data/Balance-Report.md` (all 40 reproduced, with school rounding). **The game uses it:** `src/opening/parts/p4a2_workbook.js` applies the workbook's values as the page loads and `p4h_world.js` puts its rules into the game's model; `node src/opening/tests/engine.test.js` checks the game prices plans exactly as the engine does. |
| `tools/import_world.py` | Copies the workbook's live rows into the prototype's data as `data-workbook` and writes `data/Import-Report.md`. Run `python3 tools/import_world.py` after editing the workbook (`--check` writes only the report), then `python3 src/opening/build.py`. Live and optional rows only; placeholder and later rows are reported, never loaded. |
| `docs/` | `State-of-the-Game.md` (screens, mechanics, data, bugs), `Workbook-v4-Report-Back.md` (what was built from v4.2 and the decisions Fable should check), `CR5-Report-Back.md` (identity, paint shop and showroom: what was built, assumed and not done, with screenshots in `docs/screenshots/cr5/`), the run-through comparisons and the live-operations evaluation. |
| `prototypes/hq/` | The HQ look-and-feel explorations that led to the current design. Standalone; not used by the game. |
| `paper-backup-pack.html` | Printable A4 pack: decision cards, calculation sheets, review cards and a teacher answer sheet for one round. Open and press Ctrl+P. |

## Opening prototype

The opening is being made excellent before the later campaign continues. `airline-opening-prototype.html` is self-contained like the full game, and keeps its **own saves** (it never shares a save with the full game).

**UI sandbox (16 Oct 2026): `ui-sandbox/airline-ui-sandbox.html`.** A small stand-alone file for trying out the interface. It is set in week 5 of chapter 1 with sample data: fuel prices since launch, four weeks of results, two aircraft and five routes. The screens link up: Home, Operating Plan, Flight times, Sums, Fuel, Fleet and Last week. The second screen, the Operations Wall, opens from the gold button on every desk page or the W key; "Return to desk" (or Esc) closes it. Desk = act, wall = observe: the wall is darker, with square panels, fine lines and light falling from the top left. Colour means something: cyan selected, green improving, gold worth a look, amber warning, red disruption. Each panel has a level: 1 background, 2 an opportunity (gold ◆), 3 a significant change (amber or red edge, "New intelligence", one 350 ms glow). **Intelligence** (before flying) is the big network map with five panels: World news, Fuel market, Market outlook (signal tiles: ▲▲ strong growth, ▲ growing, → steady, ▼ quieter), Events to watch and a small Your airline card. A **This week** ribbon under the header lists what is happening; clicking an item lights up its panel and its city. In a quiet week the map is the hero. The first thing that happens (a storm, a fuel move of 5% or more, a rival's fare cut) becomes the second hero: it moves to the top right, grows, says "New intelligence" and lights up once. Anything else that happens gets an amber edge, or takes the place of a panel that can wait. The map marks only what is current on the cities (🌩 a storm, £85 a rival's cut, 🎪 an event, ▲▲ strong growth), with dots coloured to match and faint 500/1,000/1,500 km rings around home. Live operations adds an operations feed (boarding, gate closed, departed, landed). Light and texture: a 1px light line and corner glow on each panel (amber or red when woken), status lights in the header and ribbon pills, a textured and vignetted map with lat/long labels, weather cells over troubled airports, a slow traffic flow along our routes, a seat-fill ring, and a contrail behind each live aircraft. Clicking a city shows its customer market; panels link out to the Fuel desk, a **Route intelligence** page and a **Seasonality & events** page (each route's months, its events, and a heat map across the network). The ⚙ menu arranges the panels and, in the sandbox only, switches the storm, fuel jump and fare cut. **Live operations** (while flying) shows the aircraft on the map, the departures board, the next departure and the day so far; "Fly the week" on the Fuel page opens it. Home now shows the wall as one-line previews. A small model makes the figures move as the plan changes. The data is at the top of the file.

**Bertie's run-through, 16 Oct (`src/opening/parts/p4zv_flightplan.js`).** Flight times come before the timetable: a page of each aircraft against each new route, two worked out (distance ÷ speed) and the difference between the aircraft in words. The demand strip shows a bar for each part of the day with the busiest in gold. The sums no longer ask about a route with no passengers that day; an empty Mon–Fri lane says when its flights are Sat–Sun only. Notes: `docs/Flight-Times-Notes.md`.

**Fuel storage grows with the fleet (16 Oct 2026, Workbook v5.8, D89; `src/opening/parts/p4zu_fuelstore.js`).** The tank keeps up with the airline, so filling up before a rise works in every chapter.
- **Storage.** 8,000 L in week 2, then three weeks of the plan's fuel, rounded up to ten blocks; it never shrinks. The Fuel desk reads "Storage 40,000 L — about three weeks of flying".
- **Blocks.** 1,000 L in chapter 1, 10,000 L from 6 January 2031, 100,000 L from 1 September 2031. The Monday sum stays blocks × the price of a block, and a Fill button buys as much as the tank and cash allow.
- **The fuel farm (chapter 3).** 1,500,000 L for £2,000,000, with an "is it worth it?" Build (litres × a shock's rise, against the price); a second stage in chapter 4. Notes for Fable: `docs/Fuel-Storage-Notes.md`.

**Chapter 4, "The ultimate plane" (15 Oct 2026, Workbook v5.5/v5.6, D82–D85; `src/opening/parts/p4zs_ch4.js`).** Push 1 plays from chapter 3's end to the review on 31 August 2033.
- **The end of the summer.** 1–5 September 2032 fly as one run, then chapter 4 opens on Monday 6 September.
- **The offer.** The A380 and the 747 side by side on Hong Kong and Los Angeles: the best fare, "Does it fill?" with 20 seats lit, and the profit a day before and after the payments. Take one, or neither.
- **Finance by the month.** £20,000,000 down, then £1,000,000 on the first of each month for 40 months. The finance sum, (price − deposit) ÷ months, is a Calculate the first time and a Build after.
- **Each month's review** has a "Does the A380 fill?" panel.
- **The A380 launch project.** The board's letter, the choices and the portfolio, from 4 October 2032; "Hold the airline while I work" pauses the run. The AI and rubric screens come later.
- **Hunt h5** at the review: one payment too many on the finance line. Notes for Fable: `docs/Chapter-4-Notes.md`.

**Decision support (15 Oct 2026, Workbook v5.7, D87 and D88; `src/opening/parts/p4zt_decide.js`).** The plan page turns the tips into actions.
- **The operations check.** The one or two tips with the most money at stake each get a button: Show me on the timetable, Find work for this aircraft, Test fare. Keep plan goes quiet ("Run anyway") while a serious one shows.
- **Moving flights.** A dragged flight shows its seats filling, and a line after each change gives seats and profit before and after.
- **What was it worth?** One line for each change; the first of each kind is a Build.
- **Sunday.** The review says how good the plan was in words, names the biggest missed opportunity and opens next week's plan on it.
- **Help me investigate** runs a one-variable experiment: predict, change, compare, use.
- **The teacher panel** has the Planning support dial and the best-plan figures. Notes for Fable: `docs/Decision-Support-Notes.md`.

**Working on paper (15 Oct 2026, Workbook v5.6, D86; `src/opening/parts/p4zr_paper.js`).** The pupil works every sum in their book and types only the answer.
- **Answer box.** Every sum is a box headed "Sum N · Week W · what it is", with the question in black and the answer field; the method is a fold-out reference card.
- **Two tries.** A wrong answer gets a note and one more try. A second wrong answer is shown, stamped Checked by Finance, and both go in the record.
- **Fuel is one sum a week:** the order on the fuel desk, blocks × the price of 1,000 L. The desk's "Fuel by route" tab has the rest.
- **Launch Day has five sums.** The printout numbers each entry and leaves a ruled box for the working.
- **Switching it off.** `settings.workingOnPaper = 'off'` brings back the on-screen pad. Notes for Fable: `docs/Working-On-Paper-Notes.md`.

**The revised Studio (13 Oct 2026; the game's Studio since the one-file tidy-up).** Bertie's interaction brief: *show what the decision being made now needs; keep everything else one click away*. The dark desk style stays. The Monday plan page has three working states (`src/opening/parts/p4ze_studio2.js`):
- **The opener** (from week 2): *Last week's regular plan is ready to run again*, with **Keep plan** and **Edit plan**, four figures, the week's timetable (read only), and **Known changes this week**: the fuel price move, a tank that won't cover the week, announced news (each with **Review Paris services**), the board's request, an aircraft with no flights. Keep plan goes on exactly as *Cost your plan* did, so the hand sums, the cap and the audits are unchanged; while the board waits it is held.
- **The operating plan:** **Active routes** (only the routes flown: fare, demand at that fare, services, seat fill, with *Edit fare*, *View demand*, *+ Service*; two columns from four routes), a toolbar (World report · Try different options · Network map · **Fuel** with a status dot · **Network · N routes** · How it works), the **timetable full width**, and a **summary bar** (seats likely filled, empty seats, turned away, average fare, profit a day, **View trade-offs**).
  - **Route editor** (a fare or *Edit fare*): every fare with the people at it, demand against seats ("22 more people want to fly than you have seats…"), add a service, stop serving. The strip shows that route.
  - **Flight editor** (press a flight): earlier, later, route, fare, aircraft, remove (or Delete), service costs. Nothing is shown under the timetable otherwise.
  - **Trade-offs drawer** (closed by default): two things worth looking at, then *Show all insights* grouped as seat use, lost demand, timing, fare, capacity and money.
  - **Fleet groups:** four or more aircraft group by type; a group opens when pressed, or by itself when it holds the selected aircraft.
- **Change network:** every destination as a card, with **Short / Medium / Long haul** filters (1,500 and 4,000 km until the workbook says otherwise), a sort (demand, distance, fare, A–Z), the aircraft to plan for and **Suitable / All routes**. On Launch Day, with an empty plan, it opens first as *Choose where to fly*, without filters.
- **News to the plan:** *Review Dublin services* (from the opener or the World report) opens the plan on that route: its row highlighted, its flights glowing, its editor open, the strip on it, and **Apply changes**.
- **Not built:** Focus View and other accessibility options (parked by Bertie); regular operating patterns (designed in `docs/Studio-v2-Report-Back.md`, next pass).
- **Workbook v4.11 (D67): Days on every flight** (`src/opening/parts/p4zf_flightdays.js`, revised Studio only).
  - From day 8, every flight is All week, Mon–Fri or Sat–Sun, chosen in the flight editor and shown as a chip on its block.
  - The engine prices each day with that day's flights only; departures and the duty day are checked per day type. A Sat–Sun flight may share times with a Mon–Fri one.
  - The timetable has a **Mon–Fri | Sat–Sun** switch. When any flight is not All week, the summary, the opener and the Sunday review show both seat fills side by side.
  - Weekend-only news (the Dublin rugby) presets a Sat–Sun service. New PlanTips rows: `weekend_only_news` and `fare_lower_fills`.
  - Report: `docs/Flight-Days-Report-Back.md`.
- **Workbook v5.0: chapter 2, Going long (D68–D73), revised Studio only. Push 1 of 3: the long-haul engine and the opening week.** The main game still ends at chapter 1.
  - **The game carries on past chapter 1** (`src/opening/parts/p4zg_chapter2.js`). Chapter 1's end card leads on to **Christmas and New Year** (days 119–126), which fly the winter plan by themselves from HQ; fuel the tank lacks is bought at each day's price, without the 10p.
  - Then **chapter 2 opens on Monday 6 January 2031**. Days 127–133 are played a day at a time with chapter 1's week loop: Monday plan, the run on the board, Sunday review. Then come weeks to the end of January, months from 3 February, and the chapter 2 review on 31 August 2031.
  - `WORLD.chapter`, `reviewDay`, `weekFrom` and `monthFrom` follow the day's chapter.
  - **Long haul** (`src/opening/parts/p4zh_longhaul.js`) covers any route over 4,000 km:
    - 2 hours on the ground at the far end;
    - a flat **£500 second crew** per service, in place of the duty-day crew;
    - fuel in whole litres (12,375 L to New York in a 757);
    - growth of 5% a week from the route's opening week, to ×1.5;
    - Dubai and Delhi's own seasons.
  - **On the timetable,** New York is one block, 06:30–21:00, with *lands 07:45 New York time*. A second New York service is refused with the reason.
  - **Delhi** (from June) is an **overnight rotation**. Its block reads *Out today, back tomorrow · earns every second day*. Revenue and flying costs are booked on the way out, and the day cost and rent every day.
  - **The 757 and the 787** are in the shop from day 127, lease only. *What's new: Going long* explains local time.
  - **Balance Report v5.0 §2 reproduces exactly:** a full 757 to New York at £510 makes £47,426.25 a day.
  - **Tested** by `chapter2.test.js`: 50 checks to the chapter 2 review, 0 failures. Screenshots are in `docs/screenshots/chapter2/`.
- **Workbook v5.0, chapter 2 push 2 of 3: reputation, the airline type, the bag fee and chapter 2's sign-offs** (`src/opening/parts/p4zj_types.js`, revised Studio only). Notes for Fable: `docs/Chapter-2-Push-2-Notes.md`.
  - **Day 127 now runs:** HQ, *Going long*, **Your star rating is public**, **What sort of airline are you?**, the shop, the plan, the sign-offs, the fuel desk, the flying.
  - **The star rating** is revealed at the autumn's banked level. The card lists each event choice that moved it, with the sum ("4 stars: 2 half-stars above 3, so 2 × 5% = 10% more passengers") and New York's demand at 3 stars and now. From day 127 demand on every route is × (1 + 0.05 × half-stars from 3), from `reputationPerHalfStar`.
  - **Only the workbook's stated effects move the stars** (events, challenges). The prototype's daily ½ star for a high fare, free snacks or the cabin layout stays off.
  - **The airline type** is chosen on day 127 and confirmed on Thursday 9 January (a card before the day's run; it can be changed then).
    - **Premium:** the two demand-table steps above each route's top fare (New York £570, £590); stars move 1.5× as fast.
    - **Value:** one step below (New York £450); stars move 0.75× as fast; the bag fee.
    - **Full Service:** unchanged.
    - The rating shown and used is whole half-stars counted towards 3 (3¾ shows 3½); the quarter is kept.
  - **Bags (Value):** passengers × 4 tenths × £20 on every route, in the revenue. Shown on the plan summary (*Bags £2,980 · 149 × £20*), the trade-offs' money and the day's results.
  - **Chapter 2's sign-offs, under the cap of three:**
    - the bag fee (Value), in two steps: 4 tenths of 200 passengers = 80, then 80 × £20;
    - the first long-haul ticket sum, **estimated first** (200 × £500 = £100,000, then 200 × £510);
    - the first long-haul fuel line on the service card (12,375 L × £2.17);
    - rent-or-buy for the 757 and its full plane (seats × fare, the same sum as the tickets) are Build; New York's flight time is Build when the cap is full.
  - **Tested** by `chapter2.test.js` with `TYPE=value` (default) and `TYPE=premium`.
- **Workbook v5.2, chapter 2 push 3 of 3: events with options, the news, the Captain's challenges and the hunts** (`src/opening/parts/p4zn_ch2events.js`). Bertie's decisions (14 Oct 2026): a month pauses on the day of its event; Luton is left out for now; a hunt is solved by tapping the wrong line, then typing the right figure; a challenge is offered once as a card, then waits on HQ.
  - **Event costs are charged once, on their day.** Until now a week's or a month's event cost was never taken from cash, while the Ready forecast took it off every day. A dated ledger (`S.charges`: one-off, daily and weekly charges) now pays them inside the run, and the forecast counts each one once.
  - **Chapter 2's five choice events** carry their choices as prose in the workbook ("VIP treatment (a quarter of a day's profit, +1★) · …") with a costShare. The game builds the options from that prose; the code adds only the mechanics. Each choice is priced in pounds: a share of a day's profit (the last 7 days' average).

    | Event | Day | The choices |
    | --- | --- | --- |
    | The travel blogger | Wed 15 Jan (week) | VIP (0.25, +1★) · upgrade (0.1, +½★) · treat as anyone (−½★ when the week's weather makes the flight late; that week is icy) |
    | Fog at London | Wed 22 Jan (week) | hire an instrument crew (0.2) · wait (the flights before 12:00 are grounded) · cancel the day (−½★) |
    | Landing fees rise | Wed 2 Apr (April pauses) | pay (0.3 every Monday, for good) · night slots (−½★) · a two-season deal (0.2 every Monday to 31 Aug). Luton is left out for now. |
    | Ash cloud | Mon 14 Apr (April pauses) | cancel everything (+½★; nothing flies 14–18 Apr) · the long way round (0.4 a day for 5 days, −½★) · fly anyway (−1★, a fine of 0.5) |
    | Mystery shopper | Tue 13 May (May pauses) | fix everything (0.4, +1★) · the cheap fixes (0.15, +½★) · ignore it (−½★) |

    Half-term adds 30 people a day to Geneva for its week. Easter's +20% comes from its news item only, so it is not counted twice.
  - **A month pauses on the day.** The run stops on the event's (or hunt's, or challenge's) day, shows the card ("Carry on: fly 2–13 April"), then carries on. It is still one beat, one plan, one forecast and one history line; the results list what the month's decisions cost and the days nothing flew.
  - **The news:** an item for `all` routes applies to every route; a multiplier of 0 is a closure (nothing flies: no fares, no fuel burned, no flying costs; the aircraft's day costs are still paid). A choice can lift it. A month's plan lists the news announced during that month, the World report says "Announced for April" and "All routes · nothing flies", and the next review lists "News this month".
  - **The Captain's challenges** (one a term, optional): Challenge 1 (24 × 36 barrels, 10% off the next fuel purchase) first appears on Mon 13 Jan; Challenge 2 (648 ÷ 6 sandwiches, +½★) on Mon 21 Apr. Have a go or Not today; after Not today a Captain's challenge button waits on HQ. The answer box has the Working pad; a wrong answer is a Query with an estimate. The fuel desk shows the discount waiting, then used.
  - **The hunts** ("Spot the mistake"): the fuel invoice on Mon 21 Apr (three lines; the total, 14,000 L × £2.04, is shown as £29,560) and the year-1 accounts on the 31 August review (New York 200 × £510 shown as £104,000). He taps This is wrong on a line, then types what it should say (with the Working pad); Everything is right counts as missed. A missed invoice costs £1,000 and gets a second look at the start of May (found: £1,000 back). A missed year-1 hunt puts a note on chapter 2's end card: chapter 3's cash forecast starts £1,000 out. Challenges and hunts go into the pupil record.
  - **Tested** by `chapter2.test.js` to the chapter 2 review (31 August 2031), with different choices for `TYPE=value` and `TYPE=premium`. Screenshots are in `docs/screenshots/chapter2/push3-*`. Notes for Fable: `docs/Chapter-2-Push-3-Notes.md`.

**Teacher milestones (15 Oct 2026)** (`src/opening/parts/p4zq_milestones.js`). The draft list and the rules are in `docs/Milestones-Draft.md`.
- **What they are for:** to reward pupils who keep improving the plan rather than coasting on one. Bertie gives the rewards outside the game.
- **What the pupil sees:** nothing. No money or stars change.
- **Where the teacher sees them:**
  - The teacher panel has a **Milestones** section below *Pupil record*, one table for each chapter played. Each milestone shows when it was first reached, how many times since, and one line of evidence, with an **Awarded** tick that is kept in the save code.
  - The record printout has a Milestones table.
- **The draft list (14 milestones):** Fare tester, Full plane, On target, News reader, First to fly, Fuel ahead, Clean sheet, Close the gap, Shrink the gap, Never coasting, Long haul full, Spot the mistake, Captain's challenge, Saved and bought.
- **How they are judged:** from the weekly decision record, the history, the month audits, first-attempt sign-offs, the hunts and the challenges.
  - A change counts only if the plan differs from both of the two periods before it, so moving a fare back and forth counts once.
  - A change made while the board waits doesn't count, and the Christmas holiday isn't judged.
- **Fable's part:** a `Milestones` sheet (read by `tools/import_world.py`) can override the title, words, threshold or chapters of any row.

**Old save codes:** `docs/saves/` holds codes made ready for the current game. The first is gubby airlines (Thu 5 Sep), which now starts with a planning day.

**Run-through fixes (14 Oct 2026, Bertie at week three)** (`src/opening/parts/p4zp_runthrough.js` and the decimal texts). Notes: `docs/Run-Through-Fixes-14-Oct.md`.
- **Decimals are multiplied the way the class is taught:** make it whole (× 10, 100 or 1,000, counting the decimal places), one whole-number multiplication, then divide back. No partition lines. It is the method everywhere a decimal is multiplied: the Service Cost card, the Working pad, Launch Day's *Buying fuel* maths page, the fuel desk's first-order Query, the sign-off hints, the pupil record's notes and the teacher-only day-by-day paths.
- **The shop is never offered.** No step of any day opens it by itself (not the week or month beats, the days new aircraft arrive, the Mondays while saving, or day 365). It is on the Fleet desk (*Add an aircraft*) and the run board (*Aircraft shop*), always open when there is something to buy.
  - On a day new aircraft arrive, HQ's brief says so: "On the Fleet desk from today: Saab 340 and ATR 72 …".
  - The What's new pages that led into the shop (Madrid's jets, Going long, Owning) lead into the plan and say where the planes are.
  - Saving still counts down, on the Fleet desk. Buying any aircraft on a later day ends the saving.

**Workbook v5.4: chapter 3, Owning, push 1 of 2 (D78–D81, Fable's note of 14 Oct 2026)** (`src/opening/parts/p4zo_ch3money.js`; the beats in `p4zg_chapter2.js`). Notes for Fable: `docs/Chapter-3-Push-1-Notes.md`.
- **The year.**
  - Chapter 2's end card has **On to chapter 3**. Monday 1 September 2031 is chapter 3's first day: no day flies by itself.
  - Days 365–371 are played one at a time (the Calendar's rows), then months from Monday 8 September to the **chapter 3 review on 31 August 2032**.
  - The chapter's rules (bags, closures, months that pause, the Monday landing fee) carry on from chapter 2.
- **Day 365:** HQ, *What's new: Buying big planes, and the overdraft*, the bank's **overdraft offer** (accept / decline for now, from the EventOptions rows), **How many weeks until we can afford it?**, then the plan. The A340, 777 and A350 are new on the Fleet desk (prices from the 757 up doubled: 787 £12m); the shop opens only when the pupil asks (run-through fixes, 14 Oct).
- **The overdraft.**
  - Before 1 September the £1,000 reserve holds. From then the floor is −(one week's average profit) when accepted, and £0 while declined.
  - Purchases, rentals and fuel orders that would go below the floor are greyed with the reason. The plan always flies, and there are no free bank top-ups now.
  - The header and the Finance desk's statement say **Overdrawn £X of £Y**. Two month-ends overdrawn make that month's audit a board review.
  - After declining, **Accept the overdraft** is on the Finance desk.
- **The Fleet desk.**
  - **Buy it** on a rented plane: the list price. The rent stops that day. When cash would go below zero, the cash after is a negative-cash sum to sign first.
  - **Hand back on 30 Sep:** the rent stops after the month's last day, and the plane leaves at the next beat. No charge; owned planes cannot be sold.
- **Time to afford in weeks:** (price − cash) ÷ profit a week, to the nearest £1,000. Step 1 is the subtraction with millions, step 2 the division rounded up, each with the Working pad. Calculate on day 365, Build on later visits to the shop, with **Save for it** counting down in weeks.
- **A missed year-1 hunt:** the cash figure reads £2,000 high from 1 September until the first month-end audit corrects it and says why.
- **The review:** the year-2 accounts month by month, with the average month as a Build; then the A380 offer for chapter 4 and the next investment in weeks. The end card names chapter 4 (not built yet).
- **Routes:** Tokyo and Cape Town from 1 September and Singapore from 27 October are overnight rotations. Sydney (two legs via Singapore) waits for push 2, with storm 2, the second ash cloud, the landing-fee card's return, challenges 3–4, hunts h3–h4 and percentage change.
- **Tested** by `chapter3.test.js` from a chapter 2 end save to the review: `TYPE=value` 60 checks and `TYPE=premium` 70, 0 failures. Screenshots are in `docs/screenshots/chapter3/push1-*`.
- **Overnight routes on the plan:** a planning day shows a 2-day rotation on its way out (its passengers, fares and costs, and its Service Cost Breakdown). Before, a plan day on the way home showed the service empty. The simulated days still alternate.

**Workbook v5.2: chapter 1 is buy only (D76, Fable's note of 13 Oct 2026)** (`src/opening/parts/p4zm_buyonly.js`):
- **No renting or finance before 6 January 2031** (`chapter1BuyOnly`, `leaseFromDate`). The shop sells, and the Rent and Finance buttons, the launch-deal finance rows and the week-2 rent-or-buy sum are gone. Renting opens in January with the long-haul planes, where rent-or-buy is first met. Finance waits for `financeFromDate` (chapter 4). The second Twin Otter is £10,000.
- **Screen 2 of the week-2 comparison is "Buy now, or wait?"** Each plane shows:
  - its price and the cash now;
  - **still to save** (price − cash);
  - **days to wait** (still to save ÷ the average profit a day over the last 7 days, rounded up; 0 when affordable);
  - **what waiting costs** (the affordable smaller plane's extra profit a day × the days to wait);
  - the extra profit a day once bought.
  Buy is greyed with the shortfall while cash < price + the £1,000 reserve. **Wait for it** leaves the plan as it is. The shop then comes back on each Monday plan day with the countdown ("Saving for the Saab 340: … about 5 days at your rate"), in the Fleet panel too.
- **The time-to-afford sum** (`timeToAffordSum`) is the week-2 Calculate sign-off, in two steps: the subtraction, then the division rounded up to whole days. Each step's box has a Working pad. Adding is a Query ("that adds them"), and so is a decimal number of days ("round up: after 4 days you'd still be short"). From the next time it is Build. The pupil record keeps it as "time to afford, then rent-or-buy".
- **A later visit to the shop** (one plane, no comparison) is the same question for that plane: the sum, Buy now or Wait for it, and Not today.
- **What's new: The fleet** on day 8 is now *A second aircraft: buy now, or wait?*, with the prices, a worked example and a check question.
- **The test run** (Steady): on day 8 it waits for the Saab (cash £14,841, £1,687 a day, so (22,000 − 14,841) ÷ 1,687 = 4.24, which is 5 days). It buys the Saab on day 15 and waits for the ATR on day 22 (7 days). It buys the ATR on day 29 and flies Madrid from then. Chapter 1 ends on **£697,112** (coasting pupil £689,806). Screenshots: `docs/screenshots/buy-only/`.

**From Bertie's run-through, 13 Oct 2026 (third round): working space everywhere, the Finance card's sums, the roll-out:**
- **Division on the pad: a bus stop with multiples.** The divisor sits outside the bracket and the dividend's digits under it. There is one answer box above each digit, and a small box for the remainder carried to the next digit. When the answer isn't whole, there is a decimal point and two 0 places.
  - **Multiples of the divisor** are listed (1 × 650 = 650 filled, 2 × … 9 × for him to fill).
  - **Make it smaller** appears when both numbers end in 0: "36,000 ÷ 650 is the same as 3,600 ÷ 65".
  - Working buttons are on every ÷ box: the rent-or-buy days, the days to wait, and the ÷ sign-offs (flight time).
- **Subtraction on the pad:** the bigger number on top, an exchange strip above it, then the answer line.
- **A Working pad on every screen:** the pencil in the top bar opens a free pad. Type two numbers, pick × ÷ + −, then **Set it out**. It is not checked or recorded. It stays over any screen, including the run board, and Escape closes it.
- **The Finance card shows its sums.** "Total paid after 30 days" reads "£7,000 today + 30 days × £500". A new **Paid in all** row reads "£7,000 + 32 days × £500: £1,000 more than buying; then it is yours". Rent shows "30 days × £400"; Buy shows "the price, paid today". So there is no doubt that the £22,000 includes the £7,000.
- **The new plane rolls out of the hangar nose first** (the roll comes in from the right).
- Screenshots: `docs/screenshots/fleet-and-pad/` (the free pad, the rent-or-buy pad, the pay page's sums, the hangar).

**From Bertie's run-through, 13 Oct 2026 (second round):**
- **One game file.** `airline-opening-prototype.html` is now the game (the revised Studio, Days, chapter 2). `airline-opening-studio-v2.html` is gone (saves are shared, so nothing is lost). The old full game and the v4.10 copy are in `archive/`.
- **The shop is under Fleet.** The Fleet panel has *Add an aircraft*: what is in the shop today, with the price (and the rent once renting opens), and **Buy an aircraft** (**Rent or buy an aircraft** from January). Tuesday–Sunday's board has an **Aircraft shop** button too, because it has no side menu.
  - It opens the usual path: the comparison while there is one aircraft, Buy now or wait (chapter 1) or the rent-or-buy sum and Rent · Finance · Buy (from January), the paint shop and the hangar. Then he is back where he was.
  - Bought on a run day, the aircraft costs nothing and flies nothing that day. Services chosen on the comparison fly from the next day; otherwise Monday's plan says it has no flights yet.
  - The button is off before 9 September and while flights are in the air (it says why).
- **A Working pad on every sum box.** A **Working** button beside each typed × answer opens a pad with the column method in digit boxes:
  - it covers the fuel desk's first order, the sign-off cards, the estimate and the Service Cost card's lines (and *Add the lines* as a column addition);
  - typing goes right to left, with a carry strip above each line and one line for each digit of the smaller number;
  - a decimal is made whole first ("1.47 × 100 = 147 (2 decimal places)": × 10, 100 or 1,000), then the last box divides back (÷ 100 = £…).
  - **Use this answer** fills the box, and the box's own Check decides. What was on the pad goes into the pupil record.

**From Bertie's run-through (first round):**
- **The fuel cost is one method: make it whole** (Bertie's class method, 14 Oct; it replaced *make it pence* with a line for each part). The Service Cost card walks it in three boxes:
  1. make the price a whole number: £1.47 has 2 decimal places, so 1.47 × 100 = 147;
  2. multiply the whole numbers, one long multiplication: 230 × 147 = 33,810 (the Working pad has the columns);
  3. ÷ 100 to put the 2 decimal places back: £338.10.
  - A step waiting on the one above is dimmed, and a right line turns green. A later step names an earlier answer only once that answer is right.
  - A Query names the step and the slip: × 10 or × 1,000 in step 1 (count the decimal places), a decimal answer in step 2, an answer not divided back in step 3.
- **Review questions stand out.** On the Build cards (the week's total, the difference, the average) the question sits in a green box with the thing to find in bold.

**Workbook v5.1 (D75): the pupil record and printout, in both game files** (`src/opening/parts/p4zi_record.js`).
- **What is kept:** every sign-off and every review Build step. That covers:
  - the sign-off cards;
  - the Service Cost card's fuel line;
  - the column template;
  - rent or buy;
  - the first fuel order;
  - the weekly, period and chapter reviews;
  - the audits.
- **Each entry holds:**
  - the date, the week, the chapter and the document;
  - the question as set;
  - the method;
  - each attempt as it was made: the working typed on the card or in the column template, cell by cell with its carries, or the chips chosen on a Build card;
  - Checked or Query, the attempts and the time taken;
  - the Bettws statement codes of its kind of maths (WorkingMethods.bettwsStatements), stored with the entry.
- **A Query gets a red note worked out from the working:**
  - the × 10 shift;
  - pence not turned into pounds;
  - a partial product that is off;
  - a carry missed or added twice;
  - a line not shifted;
  - a subtraction that needed exchanging;
  - transposed digits;
  - a Build figure missing or doubled;
  - the wrong operation;
  - ÷ 2 for a mean.

  When none of these matches, the note is *Answer £X given; correct answer £Y*.
- **Decisions, one block a week (or period):**
  - the standing plan;
  - what changed;
  - events and choices, and news acted on;
  - aircraft, fuel and the fuel purchasing advantage;
  - projected / actual / missed;
  - stars.
- **In the teacher panel's Pupil record box:** the pupil's name, a note for each week, and **Print record**. The record prints by date or by kind of maths, for a week, a chapter or everything. It is a plain A4 page: the question in black, the working in blue, a green tick, and red for the wrong cell, the note and Query.
- **Report:** `docs/Pupil-Record-Report-Back.md`. Samples are in `docs/record-samples/`.

**The first take-off is smooth (13 Oct 2026).** The launch-day take-off is now one continuous motion:
- the plane taxis in and eases to a stop, lines up, accelerates down the runway, rotates and climbs out;
- it runs at 60 fps on transforms, drawn from the start time, so the whiteboard and a redrawn screen stay in step;
- before, it stopped and started at each stage.

**v4.10.1 (13 Oct 2026): three fixes from Bertie's first go on the Studio.**
- **The timetable's buttons stay on screen.** With three aircraft, the bar under the timetable (Earlier, Later, Swap route, Remove, Service costs) was cut off and the page could not scroll. Now only the aircraft rows scroll; the header, the demand strip and that bar always show, and three or more aircraft get tighter rows.
- **Click a flight, press Delete.** A pressed flight keeps the keyboard focus, so Delete (or Backspace) removes it and Escape lets go. The bar says "or press Delete".
- **The Operations Model's plans are one row per route** (Route · Fare · Services a day · Departures · Aircraft, then On board), so every button and menu fits however many routes there are. The panels are 29 : 38 : 33, giving the test plan the most room.
- `airline-opening-prototype-v4.10-studio.html` is a frozen copy of the Studio as it was before these fixes.

**Workbook v4.10 (13 Oct 2026): the Operating Plan Studio.** The Monday plan page rebuilt from Bertie's mock-ups and Fable's data appendix (D66; `src/opening/parts/p4zd_studio.js`).
- **Four steps** across the top (Choose routes · Set fares · Place services · Review seat fill), ticked as they are done, with *How it works*.
- **Route cards** in one row: distance, flying time on the selected aircraft, the fares as bars with the people a day at each (the Routes sheet through the engine), the chosen fare and *Add to schedule*.
- **Live seat fill and trade-offs:** passengers / seats, ticket revenue, profit and turned away, with at most two tips from the new **PlanTips** sheet, always true of the plan on screen.
- **The timetable** is the largest zone: one row per aircraft; each flight block shows seats filled / that plane's seats in green, amber or red (`seatFillGood` 80%, `seatFillMedium` 50%). The strip above shows when people want to fly: the selected or hovered route's own five bands (must fly then, solid; any time, hatched), else every open route. Day and Table views; drag, the arrow keys and Earlier / Later / Swap / Remove as before.
- The Sunday and period reviews show the same three figures as actuals (**Seat fill**) with the same tips. Report: `docs/Operating-Plan-Studio-Report-Back.md`. Screenshots: `docs/screenshots/v410/`.

**Workbook v4.9 (13 Oct 2026): fewer, better hand sums.** Fable's brief *the cap, the decay and the floor* (D63–D64, HandSumRules 9–11; `src/opening/parts/p4zc_signoffs.js`).
- **The cap.** From week 2 a week asks at most three Calculate sign-offs (the teacher can set 1, 2 or 3): a relationship never met first, then a changed input (a fuel price jump), then the one with the most money in it, one of each relationship before a second of any. Over the cap, a relationship the pupil has met is Build; one never met waits for the next week it is relevant. Launch Day, the week-1 tenths and every review Build step are outside the cap.
- **The decay.** From week 2 each relationship (tickets, fuel for a service, flight time, rent-or-buy, a full plane) is Calculate twice; a new instance after that is **Build**: tap the two figures and the operation, the game works it out. Fuel is Calculate again when the price has moved 50p from the last fuel line worked by hand. The teacher can hold a relationship at Calculate.
- **Sign-offs page.** The Monday's Build cards and flight-time sums come on one page before the sheet; the showroom's sums for a later aircraft use the same cards. The range check is now the model's.
- **The floor.** At the end of October and November, Finance sends an **audit**: one line re-checked, the route that fell furthest short of the best plan's takings. When the plan has not changed for four weeks and the month missed more than a fifth of the best plan's profit, it is a **board review**: two lines, the month's average day as a Build divisor and a letter, and the next plan cannot be confirmed until something on it changes. Neglect now carries on through the week and month beats.
- Teacher panel: *Sign-offs a week* (the dial, the holds, a per-week log). Report: `docs/Cap-Decay-Floor-Report-Back.md`. Screenshots: `docs/screenshots/v49/`.

**Workbook v4.7 (12 Oct 2026): the second-aircraft decision, and reviews that ask for method.** Fable's brief *The second-aircraft decision, and reviews that ask for method not arithmetic* (`src/opening/parts/p4zb_decisions.js`).
- **Which aircraft should we add?** (day 8, the airline's second plane): the capacity problem (people a day turned away last week on Dublin), then the Twin Otter, Saab 340 and ATR 72 side by side, each on its best Dublin plan from the game's engine. Each column has nine rows (seats, price, every seat sold, today's market as a seat-dot grid, expected revenue, operating cost, **extra profit a day**, the cash bar with a reserve breach in red, payback), a revenue → costs → profit waterfall and *What you give up*. Descriptors are derived from the figures (low commitment, fits today's market, a bet on Madrid), never "best". *Compare one row*, *What the extra money buys*, *Where could it fly?* (today, weeks 3 and 4) and *If Dublin grows* (×1.0–×2.0).
- **How should we get it?** Rent, finance or buy for the chosen plane, with the rent-or-buy days (22,000 ÷ 400 = 55) as a sign-off the first time; Buy is greyed with the shortfall. The plane starts on the plan it was compared on.
- **Reviews: show what to do, the game calculates.** The Sunday review builds the week's total from the seven daily figures and +, the difference as the larger − the smaller, and the average a day by naming the divisor. A wrong build gets a Query with a plain hint. The week and month reviews from day 29 (the change between two weeks, three weeks ÷ 3, the average week in a month) and the chapter accounts work the same way. The teacher panel can set Calculate instead.
- Lighter type weights throughout (Fable's §2.4). Report: `docs/v4.7-Report-Back.md`. Screenshots: `docs/screenshots/v47/`.

**The desks v2 and Workbook v4.6 (12 Oct 2026): a dark airline simulator with three kinds of maths screen.** Fable's design note *The desks, v2* and Bertie's three reference screens, built into the game with its own figures. Everything sits on one **1,680 × 940 canvas** scaled to the window (identical at 1366 × 768 and 1915 × 891): a 94 px header (logo and wordmark, an aircraft over a world map, the week and date, reputation stars, gold coins and cash) and a 220 px left nav (Home, Operating Plan, Network, Fleet, Fuel, Finance, Reputation, Reports) with an airliner at dusk at its foot. Photographs are drawn SVG stand-ins.
- **Service Cost Breakdown** (the aircraft performance card, level A): one service's route banner and seven stat cells; panel 1 the fuel cost by method (partition the price, scale it, make it pence, decimals, formal, from the WorkingMethods sheet); panel 2 the service's revenue, costs and profit; panel 3 the summary and *Use this figure in your plan*. The fuel line is a **sign-off** the first time a plane type flies a route and again when its price moves 50p or more (Launch Day: Paris 120 L and Dublin 180 L at £1.30); a wrong line is stamped **Query**, a right one **Checked** with the airline's initials. Any service's card opens from its *Service costs* button on the timeline. The day's sums show as **sign-off documents** (Sales forecast, Service costs, Profit statement, Cabin sales).
- **Fuel:** week 1 buys exactly what the plan burns at each day's price (free Mon–Tue), shown as one line on the planner. From day 8 the **Fuel Procurement** desk (a Monday step after the sums, and the Fuel nav row): the market chart since launch with next week's forecast band, news, the forecast and its confidence; your position (the tank, 8,000 L and 20,000 L from day 29, this week's need, what is secured, covered/exposed); a purchase order in 1,000 L blocks (the first is a sign-off); and the scenario table (forecast low, today, mid, high, your own) with the **fuel purchasing advantage**, never called profit. Stored fuel is used oldest first; an empty tank buys on the day at the day's price + 10p. The weekly review shows the advantage.
- **Operations Model** (the analytics console, from day 8, the planner's *Try different options*): the first visit **builds** the model (Revenue = Passengers × Fare, Profit = Revenue − Costs, from pieces; a wrong formula shows #ERROR in the cell); then the current plan beside an editable test plan (fare, services, departures, on board, which aircraft), the week's projected results with the change, *What changed?*, the profit comparison and up to three saved tests; *Use test plan* makes it the plan.
- **World report** (from day 8, a button on the Monday plan page): fuel and next week's band, Red Kite's fares, a demand graph by fare, the headlines and the RouteNews announced for the next two weeks. **RouteNews** multiplies a route's demand between its dates; surprises are named in the weekly review. **Network** lists every destination with Red Kite's fare and the demand at yours. **Reputation** and **Reports** are desks of their own.
- **From day 29** the week beats and the months are planned on the same desks (planner, sign-offs, fuel desk, model), and the tank carries on.
- Workbook v4.6 is installed with `tools/merge_workbook.py` (it carries the CR5 Livery, aircraft artwork and identity settings that v4.6 does not have). Report to Fable: `docs/Desks-v2-Report-Back.md`. Screenshots: `docs/screenshots/v46/`.

**Workbook v4.4 (12 Oct 2026): a week at a time, in the Dragon Air look.** Chapter 1 is now played a week at a time. **Monday** is one planning page (the timetable with the demand curve for each route, the fare chips, snacks, the week's fuel order, *Try an idea*), with **Plan Impact** on the right (passengers, seats, empty seats, fuel, costs and the projected profit; the figures the day's sums ask for read *work it out →* until they are done), then the workings page for the day's hand sums. Launch Day's sums are all on that page in order: tickets at the three fares you are weighing, the fare chosen, profit, snacks at £3 and £5, the snack chosen, the guided fuel example and your own fuel bill at Wednesday's price. **Tuesday to Saturday run on the operations board** one day per step without stopping, except for an event card (Red Kite on Thursday, the storm on Friday) or a sum the rules ask for. **Sunday** is the review: the seven-row table, the week total and projected − actual by hand, *what the best plan would have earned* (a plan sweep with your planes and open routes) and, from day 15, *use-it-or-lose-it*: a route with no service or under half full loses a tenth of its passengers to Red Kite. Later Mondays ask only the new sums (week 2 rent-or-buy and a full plane; week 3 a route's tickets and its flight time; week 4 the range check and the jet fuel). Aircraft cost more per day (Twin Otter £900), the tutorial planes cost more to buy, and **Buy is greyed** until cash covers the price and the reserve (*£8,371 still to save · about 6 days at your rate*). The teacher panel's *Chapter 1 a day at a time* restores the day flow. The look is the Dragon Air mock-ups: rounded lighter-blue panels, the numbered checklist with green ticks, the cash tile, the green *go* button. See `docs/Workbook-v4.4-Report-Back.md`.

**The Week 1 planner (Airline Simulator UI Widget Design Brief v4.4, 12 Oct 2026; `src/opening/parts/p4w_planner.js`).** Heathrow is the hub and both routes are open from Launch Day: there is no aircraft, market, demand or one-service screen any more. After the certificate and the chapter banner, one **intro** explains the job (the starting position: home airport, the Twin Otter, Paris and Dublin; the five steps of the week) and its button is *Open Week 1 Planner*. The **planner** is one connected page: the **market widgets** (city and code, country, flight time, distance, the rival's fare, and the fare chips with the people who want to fly at each fare), the **aircraft day** (each service is a block on the 06:00–22:00 timeline, as wide as its rotation, with the route, the departure and the seats sold; press a block for *Earlier · Later · Swap route · Remove*, drag it with a ghost that snaps to 10 minutes and turns red over another block, or use the arrow keys; the demand for each route sits directly above; *+ Paris · + Dublin* add a service; the service count is the blocks), the **on-board** tiles, the **fuel strip** (the gauge, the litres by route, the price, the cost with *ƒ work it out*, the week's projection and Monday's automatic order) and **Plan Impact** on the right, live, with *ƒ work it out* on every figure the day's sums ask for and a brief highlight on a figure that just changed. *Cost your plan* (or any ƒ) opens the **Maths Dock** beside the plan, which stays in view: the sums one at a time as *Structured working* (the written method on the column template: Th H T O, one digit a box typed right to left, carry boxes, green working rows), *Squared paper* or *Formula* (the model's lines with the last answer masked); a finished figure is written into Plan Impact; then *Ready to fly*. **Test an idea** compares the current plan with one test plan (*Your current plan · Change · Test plan*, the colours following the measure, a strip naming what changed, *Use test plan* / *Reset*). The **Network map** is a button away. Square geometry throughout (no rounded panels, buttons, tabs or inputs), pale surfaces for the pupil's decisions and sums, dark panels for context and results. The plan rail (the day in stages down the left) is gone from the week loop: it took room the planner needs; *Back* steps through the day's screens. Day-at-a-time play (the teacher's setting) keeps the earlier screens.

**The HQ desktop.** After launch day's identity steps (name, flight code, logo, the paint shop, the hangar reveal, the certificate: see *Airline identity* below) a start-up sequence runs (*Initialising headquarters… Operations online · Finance standby · Network standby · Fleet awaiting delivery · System ready*, or press *Enter HQ*) and everything else happens inside one HQ, in three layers:
- **The chrome stays put.**
  - **Top bar, in zones:** airline and strategy · date and *Day N of operations* · status chip · reputation · the **cash balance** (the only place cash is shown, apart from the fuel calculation) · Alerts · Operations Wall · Home · Full screen.
  - **Left nav** (icon and label): Overview, Today's Plan, Network, Fleet, Finance.
- **Modules come online as the airline grows.**
  - Network, Fleet and Finance start locked, with a small note under each: *After first flight*, *From Day 1*, *After Day 1*.
  - **Finance** comes online after the first flight, **Network** when the Day 1 timetable starts, and **Fleet** after Day 1.
  - Each one lights up with a short system notice (*Finance online*). Older saves unlock whatever their history implies.
- **The workspace: task · dock,** with an action bar across the bottom (a one-line hint and the main button). In the week loop there is no plan rail (12 Oct: it took room the planner needs); day-at-a-time play keeps it:
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
- **From week 2** the plane shop is an **air show** (opened from the Fleet desk's *Add an aircraft* or the run board's *Aircraft shop*; it never opens by itself since 14 Oct): one flip card per aircraft (photo or the plain-colour drawing on the front; facts, four bars on one scale, Buy / Rent / Finance on the back), a locked *Coming soon* row, *Not today*. Every new plane goes through the paint shop and a short reveal. The Fleet view shows the planes in their liveries with **Repaint**; **Your airline** on the home menu edits the name, code and logo.
- **Artwork:** `src/opening/assets/aircraft/*.svg`, one painted side view per `artworkId` (dhc6, sf34, at72, e175, e190, narrowbody; since 16 Oct also b757, widebody, widebody4, b747, a380), inlined by the build as `data-artwork` and painted by `aircraftArt()` (p4q_paint.js). **Photos:** `src/opening/assets/photos/`, named by the Aircraft sheet's `photoFile`, embedded by the build as `data-photos`; openly licensed only, credited on the card and in `data/Photo-Credits.md`. No photos are in yet (the session could not reach Wikimedia Commons).
- **Real photos (optional):** drop a photo into `src/opening/assets/photos/` named after the aircraft id (`dhc6.jpg`, `sf34.jpg` or `saab340.jpg`, `at72.jpg`, `e175.jpg`, `e190.jpg`, `a220.jpg`, `a320.jpg`, `b737.jpg`; jpg, png or webp, ideally under 150 KB) and rebuild: the showroom card shows the photo instead of the drawing, with the credit from the workbook's Aircraft sheet if one is given there. The Aircraft sheet's `photoFile` column still works too. Photos could not be fetched from the build environment (Wikimedia Commons is blocked there), so none are bundled yet.
- **Small pictures:** the planner's aircraft tabs, the HQ fleet table and the shop cards show a miniature of each aircraft's own painted drawing (`planeMini`, `p4q_paint.js`), so a Saab, an ATR and a Twin Otter look different at a glance.
- **Data:** the Livery sheet (palette, stripes, tail symbols, logo shapes, name suggestions), the Aircraft `artworkId` and photo columns and the Settings keys `blockedFlightCodes`, `soundDefault`, `revealSeconds` are a **v4.3 draft** written by `tools/workbook_v43_draft.py` for Fable to adopt. What the pupil chooses lives in the save: `S.airline.flightCode`, `S.airline.logo`, and `registration`, `name`, `livery` on each fleet entry.
- **Sound** is off until the teacher turns it on (teacher panel), with a mute control in the top bar; **Reduce motion** is a teacher toggle and the computer's own setting is honoured too.

### The 21 October play-test in the game (21 Oct 2026)
*Claude Design's handover of 21 Oct 2026 (Bertie approved each item on his own screenshots), in year one only. The DESIGN.md of 21 Oct is installed. The report is `docs/21-Oct-Handover-Report.md`; screenshots at 1366 × 768 and 1920 × 1080 are in `docs/screenshots/o21/`. The code is in `src/opening/parts/p5y_h21.js` and `p1_head_h21.css`.*
- **Fuel desk tour:** the rest of the screen darkens; step 1 is the tank's size (ringed), and the gauge's dashed line now sits at need ÷ capacity. Steps 2 and 3 sit under Market, and the order sheet stays idle until step 3.
- **Star rating:** "What it is worth" is gone; "What moves it from now" runs the full width.
- **Flight times are a small Sheet.** His sums are Amsterdam (a Build) and Barcelona; the sheet fills in Frankfurt and Geneva (ƒ). The answer is hours plus a minutes list, never a decimal.
- **Week 3 shows what's new first:** the opener's NEW row ("Add a route ›"), then first-time callouts with cyan leader lines (the Sat–Sun switch on the opener; Add / change routes, then Sat–Sun in the Studio). One at a time, each once, kept in the save.
- **Changes sheet:** the callout sits beside the Difference column and explains +10, −10 and −£10 in words.
- **Operations Wall graph:** the title follows the tab, the key is at the top right, the axes have titles, the ticks are round, the bars are "Week n / dates", and the week in progress says "so far: Monday".
- **Sunday review: the sheet does the adding.** Profit this week and Average a day are formula-only sums: no book, no Sum number. From the week 3 review he adds the week with **Σ SUM**, dragging down the Profit column. The difference stays a book sum.
- **Routes not flown yet** are named only after a plan screen has shown them, as a chance in a cyan panel.
- **Launch Day's first ticket sum (B4) is a Build**; C4 and D4 stay Calculate.
- **"How long will it take?"** plays in Bertie's six scenes: why it matters (a Saab 340 and his Twin Otter to Amsterdam), the prediction, the whole hours, the part left over, the ruler as the check, then his routes. A later chapter keeps the old scenes.
- **Workbook:** SheetSums `how` = formula, a new ScreenText sheet, Σ SUM on Calendar day 21, and the briefing's example on BriefingData.
- **Sum numbers:** a number goes only to a sum he works out. An order the game works out (ƒ), and a full flight he worked out in an earlier week, no longer take one. The one gap kept on purpose is a suggested fuel order he leaves unbought: he may have written its number down. The first flight time is in the record as its Build, then his answer, under one number.
- **Balance:** nothing in this round changes the money; every chapter's test run ends exactly where it did on 20 October. The tests and figures are in the report.
- **22 Oct:** the fare slider on What a fare does works by touch and pen; no old screens at the start; `numbers.test.js` (below, under Building and testing) checks that every figure traces to the workbook, agrees everywhere it appears and makes sense, with four days worked out by hand. The teacher toolkit's Run now finishes the Fuel desk's first-visit tour before it buys Launch Day's fuel.

### Bertie's briefings review in the game (20 Oct 2026)
*From the DESIGN.md of 20 Oct 2026 (Bertie's review of every briefing), in year one only. The scene-by-scene re-plan of the briefings waits for Bertie to check the "Operations Briefings — scene by scene" doc. The report is `docs/20-Oct-Briefings-Report.md`; screenshots are in `docs/screenshots/o20/`.*
- **The words sit inside the picture.** They show on a soft dark plate near what they describe, and the art moves down a little to make room. The bottom bar holds only Pause & discuss, Back and Next. The kit (`briefings/kit/`) places the words; each briefing can move them (`K.caption(html, { x, y, w })`, `K.words`). In Cash, tank, profit they sit under the price board.
- **Predictions are back** (`K.predict`): two or three chips and Not sure. Next appears once he taps one, nothing is marked right or wrong, and the next scene shows "You predicted: …". They are in What a fare does (which plane earns more?), Customers have a choice (what will some passengers do?) and Weekdays and weekends (which days look different?).
- **Money is never a liquid.** In Can you afford to run it? the cash is coins stacked in an open vault.
- **More demand than seats and Snacks on board are removed.** Their workbook status is `removed`; the old page is in `briefings/retired/`.
- **No snacks in year one** (`parts/p5x_nosnacks.js`, Settings `snacksInYearOne` off). There is no snack choice, no snack money, and no Cabin sales rows or sums, so the Launch Day sheet has Sums 1–5. Old saves fly without snacks. The hen party, the one daily colour that only touched snack sales, is left out, so those Tuesdays have no colour. The snack supplier event is removed, and Calendar day 1 and the chapter 1 card no longer mention snacks. Chapters 3 and 4 keep snacks until Bertie says "extend".
- **Balance:** every chapter's test run ends exactly where v6.1 did, because the test pupils never sold snacks. A pupil who did sell them makes £56 to £64 a day less in week 2, and £176 to £208 a day less by December. The tests and figures are in the report.

### Workbook v6.1 (20 Oct 2026)
*Fable's v6.1, which answers the D104 report's flags, in year one only. The report, with the flags for Fable, is `docs/v6.1-Report.md`; screenshots at 1366 × 768 and 1920 × 1080 are in `docs/screenshots/v61/`. The code is in `src/opening/parts/p5w_d104.js`.*
- **Softer stars:** a route loses half a star when it turns away 1 in 3 or more, two weeks running, counted from week 5 (30 September).
- **Track B** has Red Kite's undercut in week 1. Its concert and fair come from their RouteNews rows.
- **The fault's £800** comes from its EventOptions row, and the card gives only the cost for its day.
- **New routes are planned on the middle of their range** and the plan says "about" (the Studio's flights, routes line and profit; the Changes sheet's column; the Ready page). The day flown uses the true demand.
- **Long haul grows by how it is served** in chapter 2 too. Growth after year one waits for Bertie's "extend".

### D104: a richer first eight weeks (20 Oct 2026)
*Fable's D104 from workbook v6.0, in year one only; chapters 3 and 4 are unchanged. The report, with the flags for Fable, is `docs/D104-Report.md`; screenshots at 1366 × 768 and 1920 × 1080 are in `docs/screenshots/d104/`. The code is `src/opening/parts/p5w_d104.js`.*
- **Two autumns.** Track A is the standard autumn. Track B is a second autumn for pupils who have played before: the storm, the fault, crew sickness and the price war move; a Dublin concert and an Amsterdam fair replace the rugby and Milan's fair. The teacher panel's Autumn track switch sets it for the airline.
- **Six curveballs with no best answer:** a school trip, a Dublin strike, a cheaper snack supplier, a football sponsorship, a slot squeeze at Heathrow and a tanker's fuel offer, each doing what its choice says. The fault and the price war now have their three choices too.
- **Growth responds to service.** Each week a route grows by its base rate, more when it is full and turning people away, nothing at the top fare, and it falls back when it is not flown.
- **Stars go public in week 3** (day 15) with their own card. From then, turning people away two weeks running, a day grounded with no fuel, free snacks and on-time weeks move them.
- **New routes show a range** ("about 70–95") until they have been flown for a week.

### Year one on the Sheet (19 Oct 2026, evening)
*Claude Design's handover of 19 Oct, evening, in year one only (Launch Day to the year-1 accounts); chapters 3 and 4 keep today's screens. The report, with the screens changed beyond those named and the flags, is `docs/Year-One-Sheet-Report.md`; screenshots at 1366 × 768 and 1920 × 1080 are in `docs/screenshots/evening-19oct/`.*
- **Every sum is on the Sheet**: one spreadsheet in the Airline look, with column letters, row numbers and a formula bar. The pupil clicks the cells a Build uses, works the sum out in the book and types the answer into its cell. Two tries, then Finance fills it in. A Sheet Callout introduces each new kind of sum.
- **The Launch Day sheet** holds all the day's sums (tickets at three fares and the other route's, the profit, the cabin sales). The **Studio** asks no sums and keeps Undo; its button is Work out my plan ▶.
- **Plan changes** from week 2 are worked out on the Changes tab: Now · With your change · Difference, then "Worth keeping?". **Event sums** are a small sheet under the rows of ten. The **Sunday review** sums are typed into the week's sheet, with Days flown = 7.
- **The Fuel desk opens on Launch Day.** The week's order (a small sheet) is placed there, after Cash, tank, profit (version A) and the tour. Launch Day's order arrives on Wednesday and is paid then.
- **No guesses in any briefing:** Show → Reveal → Use, with Back and Next always allowed. Operations Requests stay. What a fare does has beat 5 without buttons and beat 6 design B.
- **The workbook records it** (D105): Settings `fuelDeskOpensDay`, the SheetSums sheet (every sum's cell, formula, words, whose it is and how it is done), Cash, tank, profit's example and the Briefings rows.
- **Fixed on the way:** the run board's Aircraft shop now lands the day's flights before it opens, in every chapter (a plane bought while the day showed "is flying" used to cost that day its moved flights). What a fare does's last line fits its panel.

### What a fare does, rebuilt (19 Oct 2026)
*Claude Design's handover of 19 Oct, section 6: the Launch Day briefing in seven beats (tickets make money, the fare slider, seats run out, the challenge, £100 full or £110 with one empty seat, the sheet works it out, back to the fares). It is a demonstration, and the pupil types nothing. Its numbers are a fixed teaching example on the workbook's BriefingData sheet (D104). The report is `docs/What-a-Fare-Does-Report.md`; screenshots are in `docs/screenshots/fare-19oct/`.*

### Claude Design batch 2: year one (18 Oct 2026)
*Claude Design's handover of 18 Oct, in year one only (Launch Day to the year-1 accounts, 31 Aug 2031); chapters 3 and 4 keep today's screens. The report, with the screens changed beyond those named and the flags, is `docs/Batch-2-Report.md`; screenshots at 1366 × 768 and 1920 × 1080 are in `docs/screenshots/batch2/`.*
- **The screens.**
  - Event cards are one column with the departures board (Storm), and the choice commits.
  - The Red Kite card uncovers each profit, then Choose.
  - Work it out is one sheet with the margins showing where figures come from and go.
  - Event sums show the passengers in rows of ten.
  - The Sunday review has a formula bar on the sheet.
  - The Fuel desk has three panels, position first, with a first-visit tour.
  - The week plan opener has one "This week" list.
  - Customers have a choice: drag the marker and the passengers walk.
- **The briefings** are drawn from the kit's flat art (`src/opening/briefings/kit/art/`).
- **Batch 1's rules everywhere in year one.**
  - Sums about fares are worked out in the book; the Build step stays only where a kind of sum is first met.
  - Every sum has the gold SUM n and four tiles.
  - Unknown is magenta, money gold, panels deep navy.
- **Briefing 13, Can you afford to run it?** It plays in week 2 (the Fuel desk, or the shop if that comes first). The pupil draws their own cash reserve on a gauge, buys fuel in stages with each day's takings, and sees what a second plane does to the week.
- **The D103 rules** (workbook Settings `pupilReserve`, `bustRule`, `standingAim`).
  - The reserve is the pupil's (£0 until set; changed on the Fuel and Finance desks).
  - There are no loans in year one.
  - A day whose fuel can't be paid for is grounded. Three in a week close the airline and it starts again from Launch Day.
  - The rules card stays on Home until the airline-type choice in January.

### Claude Design batch 1: DESIGN.md, the worth callout, the Work it out column, the deep navy Wall, the take-off (18 Oct 2026)
*Bertie's choices from Claude Design's mock-ups of his Launch Day screens (`docs/Launch-Day-Changes-Batch-1.md`). The report, with the other screens changed, the conflicts flagged and the screenshots at 1366 × 768 and 1920 × 1080, is `docs/Batch-1-Report.md`.*
- **The design system.** `DESIGN.md` (repo root) is Bertie's design system, and `CLAUDE.md` says to follow it. Its tokens are CSS variables in `parts/p1_head_design1.css`. The batch's code is `parts/p5k_design1.js`.
- **The Studio.** The selected flight's panel keeps two rows: the flight's controls, and a Change row with the fare as a − / + stepper, "was £90" and the seats filled at each fare. A plan change that needs its worth sum opens the **Worth Sum Callout** above the flight that changed: what the change does, before → after, with the day's tickets as the magenta unknown. Its sum is built, worked out in the book and typed; the callout turns green once with the answer, the difference a day and a line of meaning.
- **Work it out.** One centred column, 760px: the sheet sized to its figures, the working panel under it, the route strips below. Every sum follows the **Week 1 flow**:
  1. build it from four figure tiles (two of them real figures from the same screen) and an operation;
  2. work it out in the book (the gold **SUM n** badge links the screen, the book and the printed record) and type the answer;
  3. done: the answer lights green once in the sheet's cell.
  - The sheet outlines the sum's figures in cyan as A and B; the cell being filled is magenta with a "?".
- **The Operations Wall** is deep navy (`--wall-*` tokens); so is the HQ's network map.
- **The take-off** has a ground roll of 2.5 s gathering speed, the nose wheel lifting first, then the climb: 9.5 s from the roll to leaving the view. Under reduced motion it is a 0.8 s fade.
- **Colour roles everywhere:** the unknown is magenta, money gold, confirmed green `#3ce394`.

### Operations briefings: the eleven scenes of Fable's plan (18 Oct 2026)
*Fable's briefings plan (linked by Bertie on 18 Oct), built now so that the play notes can test them. The pages are in `src/opening/briefings/` and share one kit (`briefings/kit/brief-kit.js` and `.css`). The build embeds both, and the game puts the kit into each page as it opens. The triggers and each scene's figures are in `p5f_brief.js`. Reassignment only (`overrides.txt` stays at 120). Notes for Fable: `docs/Report-for-Fable-Briefings.md`; screenshots: `docs/screenshots/briefings/`.*
- **How a briefing plays:**
  - It plays full screen over the game in four steps: Show → Predict → Reveal → Use, 30 to 50 seconds in all.
  - It moves on only when he does something (a tap, a drag, a press). Continue appears after that, never before.
  - A guess is never marked wrong: the reveal shows his guess beside the answer.
  - The figures are his own airline's at that moment: his painted plane, routes, fares, seats and cash. Each page has fallbacks, so it also plays when opened on its own.
- **The frame:**
  - A quiet bar: BRIEFING, the title, four progress marks and **Pause & discuss**. Pause (or P) stops the scene's clock so the class can talk.
  - The scene, with a caption under it (one line, two at most).
  - **Skip** shows only in test mode. The teacher can also close a briefing with Ctrl+Shift+B. A skipped briefing counts as seen.
  - With reduced motion (the teacher's toggle or the computer's setting), each step is a still frame.
- **The scenes and when they open** (each once, at most):

  | # | Briefing | Opens | He… | Caption |
  | --- | --- | --- | --- | --- |
  | 1 | What a fare does | Launch Day, as the Studio opens (before a fare can be changed; from 18 Oct, Bertie's test) | guesses which fare brings in the most ticket money, then drags the fare up along his own figures: people leave the queue, the price tags of those who stay grow, and the money stack rises, then falls | Ticket money = passengers × fare. Both move. |
  | 2 | Customers have a choice | Red Kite's card on day 4, before he decides | drags a marker to guess how many walk to Red Kite's £50 gate; then advertising turns half of them back | Every £10 dearer, one in ten walks. Advertising halves it. |
  | 3 | More demand than seats | the week-1 review, if anyone was turned away | taps the crowd still at the gate after the last plane, on his busiest day | People you can't carry don't pay. |
  | 4 | Weekdays and weekends | the week-2 review (rebuilt on the kit) | taps the days that look different, then makes the Operations Request | grants the weekday and weekend timetables, as before |
  | 5 | Cash, tank, profit | Launch Day, before the fuel order sum, with the order's own figures (from 18 Oct); a save that missed it gets it at the first Fuel desk visit (rebuilt on the kit) | predicts what buying fuel does to today's profit, presses Buy, then watches the week burn it | Buying fuel moves cash into the tank. Profit only counts what your flights burn. |
  | 6 | Two planes, one route | the first aircraft comparison | taps the plane that used less fuel a passenger; then the bigger one flies half empty | Bigger is cheaper per seat — when it's full. |
  | 7 | How long will it take? | the first Flight times page | flies his plane along a ruler an hour at a time, then a quarter hour at a time; taps the letter to find in the triangle | Time = distance ÷ speed. |
  | 8 | One big Saturday | the plan page while an event is announced (the All Blacks from day 22) | taps the days that changed, then makes the Operations Request | An event changes one weekend, not every weekend. |
  | 9 | A year of demand | the chapter-1 review | drags a plane to the month he would send it to Geneva, then makes the Operations Request | Markets change through the year. |
  | 10 | Renting a plane | the shop, once renting opens (6 January 2031) | drags the days until the rent stack matches the price | 2,000 days of rent = the price. |
  | 11 | Profit is not cash | the Finance desk in chapter 3, once a plane is bought or a month ends overdrawn | taps the day the cash fell | Profit: did we earn? Cash: can we pay? |

- **Operations Requests:**
  - **Scene 4** grants weekday and weekend timetables from Monday, as before.
  - **Scene 8** asks for changes to one particular date (`day_override`). **Scene 9** asks for plans that switch with the season (`seasonal_plans`).
  - Neither of those is built yet. His choice is kept in the save (`S.upg`), and the caption says the systems team will build it.
  - In scenes 4, 8 and 9, a choice that doesn't fit is answered in one sentence, and he can choose again or keep it.
- **Watch again:** once he has seen a briefing, a **Briefings** button appears on Home beside Plan the week, and the menu has a Briefings shelf. A replay uses the figures the briefing first played with (the fuel scene uses today's).
- **The teacher's toolkit:**
  - **Event now** plays any briefing with today's figures.
  - **Skip briefing** jumps to its end.
  - **Run ▶** skips briefings, except when told to stop at decisions.
  - The workbook's `operationsBriefings` setting switches all briefings off.
  - The regression tests switch them off as well (`settings.briefings = false`).
- **Tests:** `node src/opening/tests/briefings.test.js` runs in two parts:
  - **On their own:** it plays each page with its fallback figures, checking the frame, that nothing moves on before he acts, Pause & discuss, and reduced motion.
  - **In the game:** it uses the Jump to saves to open each briefing by itself at its moment, with his figures, and checks that it does not open again.
  - It ends by playing one scene to the end out of test mode, then checks the Home shelf.
  - `ONLY=fare_lever,shelf` runs part of it.
  - `BRIEFINGS=1 node week.test.js` plays the weekend and fuel scenes through, and skips the others.

### Bertie's Launch Day play notes (18 Oct 2026)
*From the first recorded play notes (`playnotes-2026-10-18-1031`). The recording was transcribed with `medium.en`, and the log puts each remark on its screen. New part `p5j_sheet.js`; the rest is in `p5h_screens3.js`, `p4zt_decide.js` and `p1_head_screens3.css`. Reassignment only (`overrides.txt` stays at 120).*
- **The demand key matches the bars:** each swatch is drawn the way its bar is (a band, Any time, and the hatched "no flight then: take the nearest"). With a flight selected, the key adds "this flight" and "your other flights".
- **What a fare change means:** after a change, the inspector's worth line has a larger row of its own, with one sentence under it saying what it means: "So it is better to charge £100 and have 1 seat empty than to charge £90."
- **The worth sum sits where the change was made:**
  - "What is the Dublin fare rise worth a day?" is built in the inspector, beside the change.
  - It names the change: "£90 → £100, and the same 38 passengers: each pays £10 more".
  - It has Undo for the last card.
  - The answer is no longer shown beside its own question.
- **Sums in the sheet** (teacher panel → Maths tools, on by default):
  - the answer is typed into the spreadsheet's own cell;
  - the sum's numbers show under the sheet, for the first column only;
  - tables already done fold to one line;
  - the page is titled by what is being worked out ("Calculate the revenue for each fare to Dublin");
  - there is no panel on the right (the worked example keeps it).
- **Words:** rows read "Dublin ticket revenue", not "Dublin tickets".
- **A briefing before the fare sums**, as Bertie asked ("the higher the ticket the lower the demand… one lost seat is sometimes OK if they're paying more"): *What a fare does*, above.
- **The second test (13:50), parked:** nothing changed in the game yet. Design requests: `docs/Report-for-Claude-Design-Play-Notes-18-Oct.md`. Briefing questions: the addendum in `docs/Report-for-Fable-Briefings.md`. Everything else: `docs/Next-Batch-Parked.md`. Transcript and screenshots: `docs/screenshots/playnotes-1350/`.

### Play notes: talk while you play (18 Oct 2026)
*For reviewing the game by voice instead of screenshots. New part `p5i_playnotes.js` (reassignment only; `overrides.txt` stays at 120).*
- **Screen names:** teacher panel → Play notes → "Show each screen's name". A tag in the bottom-left corner names the screen in words that are easy to say ("Home", "Plan opener", "Studio: flight selected", "Flight times", "Sums", "The board", "Results", "Sunday review", "Worth check", "Fuel desk", "Finance desk"…), with the week and date. It is always on in test mode.
- **Record:** "● Record" (in the tag or the panel) records the microphone while you play. The browser asks for the microphone once.
  - The game logs the time each screen appears. Whenever the day or the step changes, it keeps a save code, so the screen can be rebuilt.
  - **Mark** drops a marker in the log.
  - In Chrome, when the game is served from a web address, a live transcript lands in the log beside the screens. It uses Chrome's speech service, so it needs the internet and sends the speech to Google; switch it off in the panel if that matters.
  - When the game is opened from a file (`C:/…/airline-opening-prototype.html`), there is no live transcript. Chrome does not keep the microphone permission for speech recognition there, and asked again at every pause, which dropped the game out of full screen. The recording asks once. `python3 tools/playnotes_transcribe.py RECORDING LOG` turns the recording into words afterwards and puts them in the log at their times (`pip install faster-whisper`; the model comes from huggingface.co; `PLAYNOTES_MODEL=medium.en` is slower and hears numbers and names better). With no log it writes the words alone, with their times.
  - **Stop & save** downloads two files to Downloads, one after the other: the recording (`playnotes-<date-time>.webm`) and the log (`playnotes-<date-time>.json`, a plain file the Claude app takes as an attachment; each save code inside is gzipped as `codez`). Afterwards the corner shows **Save again**, which downloads both once more, and ✓ to put it back to Record. Logs from before 18 Oct are `.json.gz`; the tools read either.
- **Log screens only** keeps the same log with clock times and no microphone, to match a recording made on a phone.
- **Reading a log:** `python3 tools/playnotes.py LOG` prints the timeline. `--at 12:40` gives the screen and save code at that moment.
- **Screenshots from a log:** `node tools/playnotes_shots.js LOG OUTDIR [marks|said|screens|mm:ss …]` rebuilds and screenshots the screens a log names. Each is rebuilt from the last save code, so anything clicked after the day or step began is not reproduced.
- **Briefings:** the tag names the briefing ("Briefing: What a fare does"), and while the tag shows, the briefing's frame sits to the right of it so the caption is never covered. Leaving test mode takes the tag away; before, it stayed in the corner with the test airline's date.
- **Test:** `node src/opening/tests/playnotes.test.js` (Chromium's fake microphone).

### Screens brief 3: the test toolkit, demand that makes sense, overview → focus → consequence (17 Oct 2026)
*Fable's "Screens brief 3, 17 October" (D101, D102) with workbook v5.17. As before, only this brief's parts of v5.17 are taken (`tools/take_parts.py`, now with `--rows` to replace single rows): its Settings rows, the Roadmap sheet, Market weeks 3–5 (the fuel dips) and Calendar days 22–28. New parts `p5g_testkit.js` and `p5h_screens3.js`, and `p1_head_screens3.css`; reassignment only (`overrides.txt` stays at 120). The report to Fable is `docs/Report-for-Fable-Screens-Brief-3.md`.*
- **The teacher's test toolkit (D102, p5g)**, built first and used for every screenshot of the report:
  - **Test mode** from the teacher panel's Testing section (the panel opens with Ctrl+Shift+T or three taps in the top-left corner). An amber bar across the top reads "TEST MODE — nothing here counts".
  - **Test airlines are a copy:** turning it on puts the pupil's game aside untouched and plays a TEST copy, saved in its own store (at most four kept, labelled TEST, deleted in one go). Leaving test mode brings the pupil's game back exactly as it was. Nothing in test mode reaches the pupil's record, milestones or sum numbering.
  - **Answer** (Ctrl+Shift+A) fills and checks the sum on the screen; **Answer all** does every sum there; **Show the answers** puts each answer beside its box without checking.
  - **Auto-plan** sets the engine sweep's best plan for the planes owned.
  - **Run ▶** (Ctrl+Shift+R) plays on with answers and auto-plan, stopping at the next plan, review, decision, Fuel desk or month (Tools → Run to).
  - **Jump to…** starts a test airline at Launch Day, weeks 2, 3, 4, 5, 7 (the fuel spike) and 9, December, January 2031, June 2031 (Delhi), chapter 3 or chapter 4. They are save codes from the chapter tests along the Steady path, written by `sh tools/make_jumps.sh` into `src/opening/tests/fixtures/jumps/` and embedded (gzipped, about 290 KB) by the build.
  - **Event now** fires any event or built briefing today; **Skip briefing / tutorial** jumps to its end.
  - The keys are Ctrl+Shift+T/A/R as the brief asks. In Chrome, Ctrl+Shift+T and R are the browser's own keys (reopen tab, hard reload), so the bar's buttons are the reliable way.
- **Demand that makes sense (p4h, the engine and p5h):**
  - **`adaptToOnlyFlight` 0.5:** time-locked passengers who want a band with no service on their route: half take the nearest service instead. In `planFlights` and the reference engine alike.
  - Marrakech, one E175 at 06:00 at £230 in week 5 reproduces Fable's table: 98 want, the 06:00 can catch 87 (69 any time + 7 early + 11 adapters) and flies full, 80/80, with 7 turned away.
  - **The demand shape:** five band columns (must fly then) on the timetable's own hours, and a separate Any time bar. Select a flight and its slice lights gold: its band, the any-time passengers the route's other flights don't take, and the adapters (hatched). The bands it can't reach dim, and one caption says it: "The 06:00 can catch 87 of the 98 — the early passengers, those who'll fly any time, and some who'd rather go later. It has 80 seats." The caption pulses when the flight moves; tabs pick a route or All.
  - "Turned away" now means no seat: "Full, 7 turned away (11 more wanted a time with no flight)".
- **The Studio:**
  - with more than two routes the routes table folds to one line ("3 routes · 5 flights a day · 100% filled · 1 needs attention") with a chip a route (flag, code, fare, fill bar, amber dot for a tip worth acting on); a chip selects its route; the line opens the table; Esc folds it;
  - the selected flight's controls sit in a fixed bar under the timetable (Earlier · Later · Route · Fare · Days · Aircraft · Service costs · Remove, the worth line on the right after a change). Earlier and Later move 5 minutes and repeat while held. With nothing selected the bar reads "Select a flight to change it.";
  - the operations check sits in the plan summary.
- **Flight times:**
  - the decay is per kind of sum for the whole game (two Calculates, one Build, then the model);
  - a pair the airline already knows is never asked: it already flies it, or met it on an earlier page. This also fixes the page that compared one route by both aircraft when one had flown it;
  - answers are hours and a minutes selector (0 · 15 · 30 · 45);
  - the table has equal columns and a Fastest saves column, the instrument opens below it with the cell's gold ?, and one line of meaning comes after the sums ("The Saab 340 is back from Dublin 1 h before the Twin Otter on a return trip");
  - at model level the table is on the Fleet desk (Flight times).
- **A week's results** lead with the result: a record plate ("Best week yet — £55,158"), "£55,158 profit · £30,812 more than last week", then "Planned £56,359 · £1,201 under: a late airport bus on Tuesday and a headwind on Friday". Then revenue − costs = profit, the seats filled, and "Profit · Fuel bought for next week · Cash +£… → £…" with ƒ. Last, one quiet **Opportunity** line for the passengers we couldn't carry, with the per-route list behind a tap. Red only for a real loss (`redMeans`).
- **The weekly graph:** a bar a week with a faint projection tick and a seat-fill line, the current week lit. Tabs: Weeks · This week by day (from December: Weeks · Months).
- **The worth check inside the comparison:** choosing a plane opens WHY (the routes where people are left behind, with the numbers), WORK IT OUT (one full flight: seats × the route's current fare, Give me a hint) and WHAT IT MEANS (full-flight money, then extra profit a day, then a coin bar for the payback, one by one). The other aircraft shrink to a slim column. Then Buy it now / Wait, with the wait-cost line and the cash bar (in chapter 1, Wait opens the time-to-afford sum). From the air show, Next opens it too. Plane names drop "Embraer": "E175", not "E-E175".
- **Coming up** on Home (Roadmap sheet): NOW · NEXT · LATER with greyed silhouettes, and one line at the end of each Sunday review ("Next week: Medium haul — Madrid, and your first jets. Fuel desk: “…”"). Planner upgrades are never named.
- **The rest:** fuel £1.62 in week 4 and £1.74 in week 5; the week-5 tutorial is gone (a one-line notice instead); daily colour at most two a week, never the same item in a week or the week after.
- **Tests:** `screens3.test.js` (new) drives all of this through the toolkit. The fleet shop, chapter 2 and 3 and decision tests now go through the worth check. The balance test runs Fable's earlier reports without the new rule (they predate it) and checks the rule itself.

### The screens brief: review, plan, Fuel desk, sounds, daily colour, briefings (17 Oct 2026)
*Fable's "Screens brief, 17 October" (D96–D99), from Bertie's play-through, with workbook v5.15. Bertie asked on 16 Oct for no more economy changes for now, so only v5.15's D96–D99 parts are taken (`tools/take_parts.py`, on top of v5.8). The parked v5.9–v5.12 changes are listed in `docs/Report-for-Fable-Screens-Brief.md`, and the full v5.15 is in `data/incoming/`. New parts p5a–p5f and `p1_head_screens.css`; reassignment only (`overrides.txt` stays at 120).*
- **The Sunday review is a spreadsheet** (p5a):
  - left to right: what happened, then the figures, then the instrument;
  - the three sums are cells in the week table (Profit this week, Difference from the plan, Average a day), with no numbered panels. The cell being worked on is lit; the others wait, dimmed;
  - the formula builds into the lit cell. On Check the cell fills, lights green, and keeps a ƒ with its formula;
  - the relationship is one line the first time, then behind "Give me a hint";
  - "Each day" lists only what made a day different: events and the day's colour;
  - the worth line moved to the plan page. A redraw never jumps the page (on every page).
- **Operations Briefings** (p5f; Briefings sheet): full screen over the game, advanced by doing, with Pause & discuss and a Briefings shelf in the menu. Fable's two pieces are in `src/opening/briefings/` (embedded by the build) and use the pupil's own figures:
  - **Cash, tank, profit** on the first visit to the Fuel desk;
  - **Weekdays and weekends** at the end of the week-2 review. "Change weekdays and weekends separately" grants the Days setting from Monday (D98). Another choice leaves it for the systems team, who propose it after the week-3 review (day 21); "Not this week" keeps the offer on the plan page.
- **Days is earned (D98):** `flightDaysFromDay` now reads "earned: week-2 review (day 14); fallback day 21". Saves from before this rule keep Days as they had it.
- **The plan page** (p5b):
  - **Compare with last week:** last week's flights as faint ghosts, the summary as before → now, what changed in words, and what each change was worth in plain words;
  - the Operations Wall has a named button;
  - Ctrl/⌘ + ← → moves between Home, the Plan and the Wall, with key hints the first few times. Esc closes a panel; Enter checks a sum;
  - What's in this is a quiet list with the total ruled off, a ƒ on each line, and the £300 named "Advertising (Red Kite's undercut)".
- **The Fuel desk** (p5c):
  - the fill button says "Most I can afford: N blocks" or "Fill the tank: N blocks", and the line under it says which is the limit;
  - the order sum reads "Fuel order = blocks × price per 1,000 L";
  - the week's need shows its cost ("about £4,322 at £1.47");
  - after an order, one line says what buying fuel does to the money, with Cash before → after and Tank before → after;
  - the day's statement reads "Fuel burned: N L × £p = £X".
- **Sounds** (p5d): tap, slot, tick, query, chime, cash, pour, whoosh and day tick, made in the browser. They follow the teacher's sound switch (off to start) and a volume slider in the teacher panel; the query is quieter than the tick.
- **Daily colour** (p5e; DailyColour sheet), from week 2:
  - one small effect a day at most, with a one-line reason on the day's row (a hen party +£47, no-shows −£270, a tailwind saving fuel);
  - fixed by date, so a replayed week replays the same way;
  - only on flown days, never in a projection.
- **Tips that can be acted on (D97):** a tip shows only if acting on it gains at least £50 a day (`tipGainGate`). When every seat is sold, the check says so: "Every seat is sold… capacity or a higher fare", with Compare aircraft and Test fare. The timing tips stay quiet then.
- **Tests:** the regression tests switch the briefings off (`settings.briefings = false`). `BRIEFINGS=1 node week.test.js` plays both and checks the upgrade; `WRONG_CARD=1` also checks the day-21 fallback.

### Night Ops in the game: the plan and the sums (16 Oct 2026)
*Bertie chose Night Ops from the style lab, with Glass Cockpit's thin lines, magenta and green, the Segoe typeface, and a blue background. "Start bringing it into the game… start with the plan and sums." This stage covers the Operating Plan Studio and the sums. The other desks get the type, panels and buttons now; their instruments come next. Nothing here changes a figure, a step or a save code.* Two new parts: `p1_head_nightops.css` (every rule under `html.no`) and `p4zz_nightops.js` (one block; it decorates each page after the game draws it, using reassignment only, so `overrides.txt` stays at 120).
- **Everywhere:**
  - Segoe, with figures that line up and no monospace digits;
  - the deep blue background with soft light;
  - panels with a thin light line on top;
  - buttons that lift slightly under the pointer;
  - a quick fade-in when the page changes (only then, not on every redraw);
  - notices as a card at the bottom right with an icon, amber for a warning;
  - the header's cash lights green or red once when it changes (not while the week flies).
- **The sums:**
  - the question is a dark instrument, not a white card. The `?` is magenta and breathes slowly on the sum being worked on;
  - the answer box is a dark recessed field with a cyan caret, and turns amber with a Query;
  - when the answer is right, it pops green (gold when Finance filled it in), and a boarding pass prints under it with the stamp: Sum N, what it is, the figure and the row it goes into;
  - the answer then flies across into its cell in Your figures. The cell stays empty until it lands, then lights;
  - a notice says "Sum N confirmed: £X → your figures", with a quiet chime if the teacher has sound on.
- **The Operating Plan Studio:**
  - the timetable's flights are cream air-traffic flight strips, with a coloured edge for how full they are;
  - the selected flight breathes a cyan outline, and the panel being worked in has a cyan rail;
  - a flight moved with Earlier, Later or its time glides to its new place;
  - seat-fill bars grow or shrink, and a plan-summary figure that changes lights once: green better, red worse;
  - **dragging a flight shows what the move would do before you let go:** seats filled, people turned away and the profit, against the plan now. It uses the game's own move, worked out on a copy. The profit appears only when the plan summary already shows it, so nothing the pupil still has to work out is given away. An overlap says so instead.
- **Reduced motion** (the teacher's switch or the computer's setting): no movement, no flying answer and no breathing. Every state still shows in colour, outline and words.
- **Fixed on the way (an older bug):** with reduced motion on, the whole screen slid half off to the left and every bold word turned 18px and white. The rotation marks' class `.rm` had the same name as the reduced-motion class on `body`. Those rules now apply only inside `.rot-marks`.

### The style lab in the UI sandbox (16 Oct 2026)
*Bertie: "I'd rather experiment with different styles… intuitive but professional and sleek", then "build the style lab with all of them". In `ui-sandbox/airline-ui-sandbox.html` only; the game is unchanged.* Open the lab with the **Style lab** button at the bottom left, or press **L**. Every choice is remembered on that computer, and **Reset** puts everything back. With every switch off, the sandbox is exactly the Pazzaz version below.
- **Four looks:**
  - **Night Ops:** the look so far.
  - **Airport Signage:** charcoal and signage yellow, flat and bold.
  - **Glass Cockpit:** near-black with thin lines. Cyan means selected, green engaged, magenta something to work out.
  - **Day Ops:** light and clean. The wall stays dark, as the control room.
- **Glass Cockpit, taken apart:** seven ingredients that can each be mixed into a look (made for Night Ops):
  - thin lines;
  - corner brackets;
  - magenta targets (the `?`, the waiting gaps, targets, the busiest time);
  - green when confirmed (results, needles, the fuel in the tank);
  - a darker background;
  - instrument labels;
  - outline buttons.

  Hold **C** to see the look without them. Thin lines, magenta and green start switched on.
- **Three typefaces:** Segoe (as now), and Inter or Barlow built into the file, so it still works offline. Both have plain zeros, figures that line up, and two weights.
- **Instruments:**
  - a split-flap departures board on Live operations, whose letters flip as flights board and depart;
  - a flight-progress bar in the header: the week as one flight (Times, Plan, Sums, Fuel, Fly, Review) with the plane at your step. Each step's label opens it;
  - rolling figures: money rolls digit by digit to its new value;
  - boarding-pass results for confirmed sums;
  - air traffic control flight strips on the timetable;
  - three cockpit gauges on Home: seats filled, profit against target, days of fuel.
- **Intuitive:**
  - drag a flight along its lane (20-minute steps). The profit changes as you drag, and an overlap is refused with the reason;
  - point at a fare to see its people and profit before choosing, or at a fuel amount to see it in the tank;
  - a spotlight on a page's first visit dims everything but the one thing to do;
  - confirmation notices at the bottom right;
  - hover cards for routes and cities.
- **Finish:** line icons instead of emoji, the game's own aircraft drawings in Dragon Air's colours, frosted glass, and a calm layout (fewer, bigger things; detail on hover).
- **Excitement:**
  - "Fly the week" first calls the day's departures on a flipping board;
  - Sunday's review counts its figures up one by one, then stamps a verdict;
  - quiet sounds (off to start): a click, an accept chime, the board's flaps.
- **Reduced motion** still works over all of it: no reel, flaps or rolling, and each change is shown at once.

### The Pazzaz pass on the UI sandbox (16 Oct 2026)
*Bertie's brief "Pazzaz Pass: visual system and motion": "electrically alive, but calm". The desk takes the wall's light (gradients lit from the top left, square panels, a 1px light line), and there are no monospace figures (tabular lining figures in the normal typeface). Light and motion say where I am, what I am working on, what changed, what my action affected and whether the system accepted it. In `ui-sandbox/airline-ui-sandbox.html` only; the game is unchanged.* Bertie's own pass is the commit "Bertie's Pazzaz pass". The second pass on top of it:
- **Motion that survives a redraw.** The sandbox redraws the whole screen on every click, so on their own a block could not glide, a bar could not grow and every slow loop restarted. Now:
  - moving things (`data-k`) start where they were and travel to where they are now: flight blocks, seat bars, demand bars and the fuel level;
  - a changed figure (`data-v`) lights once: green better, red worse. The plan's profit also shows the change for a moment (▼ £280);
  - one-off effects (`data-fx`: the result pop, the stamp, the shimmer, the arrival) keep their place if the screen redraws mid-way;
  - the slow loops carry the page's age (`--loop`), so the header aircraft and the breathing lights carry on.
- **The answer becomes data.** The Sums page opens with the **Operating model**: a gap waits for each sum ("? waiting for Sum 3"). A right answer:
  1. pops green, and the stamp comes in;
  2. flies along a thin line into its gap;
  3. lights as it lands, labelled "✓ Sum 3 · worked out by you".

  A Finance answer travels in gold and stays still. Flight times light their own cell.
- **Focus light from the page's state.**
  - Only the sum being worked on has the cyan rail, the lit `?` and the cursor. Typing in another moves it there.
  - The routes panel is lit while a fare is open, the timetable while a flight is selected, and the order while fuel is still to buy.
  - A wrong answer turns the field amber, with the answer selected so it can be retyped.
  - A redraw keeps the cursor where the pupil is typing.
- **Calmer where the brief asks.**
  - The sweep under each question is gone.
  - Only the current sum's `?` breathes.
  - The badge is lit rather than flashing.
  - The fuel shimmer runs once, when fuel is bought.
- **Fuel.** A taller tank with a gold line for this week's flying. The order shows as a dashed block above the fuel before you confirm; on Confirm the level rises into it.
- **The plan.** A move that is refused flashes the block amber and says why ("It would overlap the 06:00 flight to Dublin"). A flight that does not fit says so on the page instead of in a pop-up box.
- **Charts and the header.**
  - Charts rise or draw in when a page opens, and the seasonality chart again when the route changes.
  - The header aircraft flies along its line about every 27 seconds.
- **The wall.** The map's flows and crossing aircraft keep their place across clicks, and the storm ring pulses three times from when the storm appears. On Live operations, boarding breathes and statuses and the feed light as they change.
- **Reduced motion.** The computer's setting is honoured, and the ◐ button (or M) previews it. There is no drift, header aircraft, breathing, flying answer or map animation, and changes are immediate. The state still shows in colours, rails and words.

### The attention grammar sandbox (16 Oct 2026)
*Fable's brief "Attention grammar" (D94, D95): a small set of visual signals instead of size and weight, one calculation instrument for every sum, sums on the decision screen, fuel charged from day one and introduced visually at the Fuel desk. Tried first in `ui-sandbox/attention-grammar-sandbox.html` (open it in a browser; nothing in the game changes until Bertie has chosen).* Its screens: the instrument in its three states with the figure flying into the sheet; a Build; the Red Kite sequence (decision, chosen, working, confirmed, result plate); Launch Day with four sums and fuel in the costs; the Fuel desk's first visit (gauges and price tags per aircraft and route); a Studio screen with one dominant region and the rail; the grammar's signals, colour roles and type roles; and the old white card beside the instrument.

### Overlapping text, the right aircraft, more logo choices (16 Oct 2026)
*Bertie: text overlapping on several screens; "if I bought a Saab, am I customising a plane that looks like a Saab?"; more logo options. Notes and the full list of fixes in `docs/Overlaps-Aircraft-Logos.md`.*

- **The overlap check.**
  - **The scanner** (`src/opening/tests/overlap/scan.js`) runs in the page. It lists text and buttons that overlap where both can be seen, text cut by a box that hides its edges, and text off the screen.
  - **Two ways to run it.** `overlap/hook.js` runs it after every click of any test (`node -r ./overlap/hook.js week.test.js`). `overlap/desks.js` opens every desk, the teacher panel and the wall of a list of saves.
  - **Where it ran.** Launch Day, chapters 1 to 4, the desks and the wall, at 1366 × 768, 1897 × 991 and 1920 × 1080.
- **The fixes.** CSS at the end of `p1_head_studio2.css`, plus `parts/p4zx_fit.js`:
  - The Plan screen's bottom bar shared a class name with an old fixed-height style, so it spilled over the Plan Summary. Its class is renamed, and the "what was it worth" Build has its own strip above the Plan Summary.
  - The flight's editor sits over the page and is placed after its chips.
  - Map names no longer land on each other: the routes flown first, then the home base, then cities on offer, and a crowded offer shows its dot only.
  - The Network desk's grid is mended, and the Fuel desk's columns scroll.
  - Home's Today's Plan keeps its buttons in view, its finance chart fits its labels, and Live Operations and the tabs fit.
  - Weather everywhere reads "All routes" once on the wall.
  - Answer boxes keep room for "days".
- **The right aircraft.** Five more drawings, made by `tools/aircraft_art.py` with the same layers as the hand-drawn ones:
  - `b757`;
  - `widebody` (787, A350, 777);
  - `widebody4` (A340);
  - `b747`;
  - `a380`.

  `p4zy_paint2.js` maps each type to its drawing when the Aircraft sheet's `artworkId` is empty (the build prints "11 aircraft drawings").
- **More logo choices** (`p4zy_paint2.js`):
  - **Shapes:** eight (diamond, hexagon, badge and oval added).
  - **Symbols:** eighteen (wing, dragon, plane, globe, crown, bird, lightning, sun, mountain, heart, compass and initials added).
  - **Styles:** solid, ring, outline and two-tone.
  - **Lettering of the airline's name on every aircraft:** classic, bold, script or outline, on the paint shop's Name tab.

  These are saved as `S.airline.logo.style`, `S.airline.logo.text` and `S.airline.lettering`. An old save keeps its logo.

### The Intelligence Wall (17 Oct 2026)
*The Operations Wall before flying: "what do I know?". Desk = act, wall = observe. Designed in the UI sandbox, then merged into the game (`src/opening/parts/p4zw_intelwall.js`, the CSS at the end of `p1_head_studio2.css`). Notes in `docs/Intelligence-Wall-Notes.md`.*

- **When it shows.** Whenever the wall is idle (the pupil is planning, working out sums, at the Fuel desk, on the HQ): the old boards-and-status layout is replaced by a board. Live operations, Day complete, the alert card, the simulation strip and the identity screens are unchanged; the wall only switches mode.
- **The board.** The network map is the hero (the game's own map: zoom, pan, the pupil's livery colour). Around it: **World news** (the route news that is on or announced, the market week's headline, the fuel headline, today's calendar lines, the log), **Fuel market** (the price, the change on last week, five weeks as a line, next week's forecast band and headline), **Market outlook** (a signal tile per open route: ▲▲ strong growth, ▲ growing, → steady, ▼ quieter, from the demand multiplier over the next four weeks against today, with the next event or the season), **Events to watch** (the route news ahead: NOW, THIS WEEK, NEXT WEEK, LATER THIS MONTH) and a small **Your airline** card (seats filled as a ring, turned away, the route under most pressure, from the last period's figures). A **THIS WEEK** ribbon under the header lists what is happening; clicking an item lights up its panel and rings its city on the map.
- **Three levels.** 1 background; 2 an opportunity (gold ◆: a route with strong growth, an event on now); 3 a significant change (amber, or red for disruption: a storm or weather warning in the market week or the day's event; fuel moving 5% or more on last week, or a tank that won't cover the day; the rival undercutting a fare). The first level-3 change becomes the second hero: it moves to the top right, grows, says "New intelligence" and glows once (350 ms). Others get an amber edge, or take the place of a panel that can wait ("in place of Events to watch for now").
- **On the map.** One mark a city, only when current: 🌩 a weather warning, the rival's fare when it undercuts, an event's icon when it is on or starts this week, ▲▲ strong growth. Weather cells over airports on watch or warning. Clicking a city shows its **customer market**: business and leisure (the archetype's business share), the strongest times of day (the archetype's bands), fare sensitivity, the trend, the busiest season, why now (the next news or the route's story) and the rival's fare, with "when people want to fly" as bars.
- **Nothing acts.** The wall reads the state and the workbook; it changes nothing. The HQ still has the bell and the desks. The map's hub label and markers are the game's own.

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
- **Build:** `python3 src/opening/build.py` joins `src/opening/parts/` (in order: head, data, HTML, then the scripts `p4a_core`, `../engine/world-engine`, `p4a2_workbook` (the workbook's routes, aircraft, catering and settings), `p4b_control`, `p4d_opening`, `p4e_toolkit`, `p4f_campaign`, `p4g_opening2`, `p4h_world`, `p4i_liveops`, `p4j_intro`, `p4k_chapter` (the calendar from the sheets), `p4l_handsums` (week 1: hand-sum rules, events, weekends), `p4m_fleet` (the fleet and the shop), `p4n_weeks` (the weeks, Market events, the teacher's skip), `p4o_review` (December, the chapter review, the gates), `p4p_identity`, `p4q_paint`, `p4r_showroom`, `p4s_practice`, `p4t_workout`, `p4u_migrate` (old save codes), `p4v_week` (the week loop), `p4w_planner` (the Week 1 planner: the intro, the timeline editor, the fuel strip, the Maths Dock, the comparison), the later parts up to `p4zd`, then the game's own `p4ze_studio2`, `p4zf_flightdays`, `p4zg_chapter2`, `p4zh_longhaul`, `p4zj_types`, `p4zk_pad` (the Working pad), `p4zl_fleetshop` (the shop under Fleet), `p4zm_buyonly` (chapter 1 buy only), then `p4zn`–`p4zz` and `p5a`–`p5j` (the screens briefs; `p5g_testkit` is the teacher's test toolkit, `p5h_screens3` Screens brief 3, `p5i_playnotes` Play notes, `p5j_sheet` sums in the sheet), and last `p4c_display`), with `p1_head_studio2.css`, `p1_head_nightops.css`, `p1_head_screens.css` and `p1_head_screens3.css`. The build also embeds the briefings with their shared kit (`briefings/kit/`) and the Jump to airlines. A later part's function wins; `overrides.txt` lists them. The build checks every JSON block and the script's syntax.
- **Import:** `python3 tools/import_world.py` after editing the workbook. Live rows only; the report's *Chapter 1 touches* lists every non-live value the chapter reads (today: Istanbul's archetype, `timeSkip`, `reputationFromDate`).
- **Tests** (Playwright, with the pre-installed Chromium; `NODE_PATH=/opt/node-tools/node_modules`):
  - `node src/opening/tests/week.test.js` plays chapter 1 a week at a time (v4.4) with the Balance Report's plans (`UPTO` day, `OUT` for screenshots): every year-one sum on the Sheet (the Launch Day sheet, the Changes tab, the event sums, the fuel order's small sheet and the Sunday review), the Fuel desk on Launch Day, the board, the Sunday reviews, Buy now or wait on day 8 (it waits for the Saab and signs off the time to afford), the Saab bought on day 15, Amsterdam, the ATR waited for on day 22 and bought on day 29 for Madrid; it checks the Calculate count for weeks 1–4, that the sweep's best plan beats the pupil's, Buy greyed in week 2 and the neglect lines from week 3.
  - The game is the revised Studio, so `week.test.js` also plays the launch flow on Choose where to fly, the opener, a news review, the route and flight editors and the drawer. Every test takes the game file from `GAME` (default `airline-opening-prototype.html`).
  - D104: `week.test.js` plays the stars card on day 15 and the one-choice and two-card weeks; `TRACK=B` plays the second autumn. `node src/opening/tests/d104.test.js` (58 checks, from the Jump to… saves, with v6.1's) covers both autumns' beats and news, every curveball's choices through the game's own `applyEventNow`, growth on made-up weeks, the stars' drivers, the demand ranges on the Network and the World report, the teacher's switch, and that nothing changes on day 365.
  - `node src/opening/tests/numbers.test.js` (22 Oct 2026, 36 checks) is the numbers check. **Every figure traces back to the workbook:** `tests/wb_values.py` reads Routes, Aircraft, Airports, Settings, the Calendar's and Market's fuel prices and the Archetypes straight from `data/Airline-World-Workbook.xlsx` (with `-I`; `PY=0` skips it), and the test compares them with the game's imported copy and then with the game's own route, aircraft, airport, setting and `fuelOn(day)` figures. **The same figure agrees everywhere it appears:** it plays week 1 from Launch Day and week 2 from its Monday through the toolkit's Run, with hooks on the board, the results and every cash move, and checks each day's passengers, revenue, costs and profit on the board, in the Sunday review's table, on the Monday's results screen, in the week's rows, the ledger and the history, and that every penny of each day's change in cash is explained (the day's results = profit + the fuel burned, which was paid when bought; fuel bought on the desk or when the tank ran dry; the order paid on delivery; an event; a plane). **Figures make sense:** on every flight and route passengers ≤ seats, revenue = passengers × fare, the costs are the flights' flying, landing, fuel and passenger charges plus the day cost, profit = revenue − costs; the same identities over the year-one save's record. **By hand:** from the workbook's figures and the pupil's timetable alone (its own demand bands, adapt share, round-robin filling, FIFO fuel), it works out days 1, 2, 3 and 8 flight by flight — who flies, what each service earns and costs — and they match the game to the penny (Launch Day: £7,020 − £3,610 = £3,410). Fuel is the only cost the record and the cash treat differently: fuel is paid when it is bought, so the day's results move the cash by the profit plus the fuel burned.
  - `CODE=<day-8 save> node src/opening/tests/fleetshop.test.js` (36 checks; `fixtures/jumps/day-8.txt` will do) covers:
    - Not today on day 8, the shop in the Fleet panel, and Tuesday's board shop button;
    - Buy now or wait mid-week: the time to afford signed, its ÷ step through the bus-stop pad, with a Query for 4.02 days;
    - buying a second Twin Otter (no costs or flights until the next day) and the hangar roll-out nose first;
    - the Working pad on the fuel desk (4 × £1,470);
    - the free pad (36,000 ÷ 650 made smaller, 3,420 − 1,830 with exchanges, Escape);
    - as from January, with buy only switched off: the pay page's sums and the rent-or-buy pad (22,000 ÷ 400 → 220 ÷ 4 = 55).

    Make the save with `UPTO=8 SAVE=<file> node week.test.js`.
  - `node src/opening/tests/chapter2.test.js` carries on from a save at chapter 1's review. Make the save with `UPTO=200 SAVE=/tmp/airline-ch1-end.txt node week.test.js`, or pass `CODE=<file>`. The test plays:
    - Christmas and New Year, then day 127: lease a 757, New York at £510 at 06:30;
    - the Balance Report v5.0 §2 check (£47,426 within £10), the refused second service, the local time, the overnight rotation (Delhi, tried early) and growth;
    - then the weeks and months to `UPTO` (default 400: the chapter 2 review, with its accounts and the end card).
    - push 2: the star rating card, the type page (`TYPE=value|premium|full`, default value) and its fare gating, the sign-offs under the cap (the estimate first, the bag fee in two steps), the Bags line, and Thursday's confirmation.
    - push 3: every event's choice (Value and Premium choose differently), April paused on 2, 14 and 21 April, the ash cloud's closure or the long way round, the landing fees every Monday, the challenges (Value says Not today, then plays Challenge 1 from HQ), the hunts (Value finds both; Premium misses the invoice, finds it in May, and misses the year-1 accounts), the board's request for a changed plan, and the chapter 2 accounts.
  - `TYPE=value|premium node src/opening/tests/chapter3.test.js` carries on from a save at chapter 2's end card. Make it with `TYPE=<type> SAVE=/tmp/airline-ch2-end-<type>.txt node chapter2.test.js`, or pass `CODE=<file>`. The test plays:
    - the end card's On to chapter 3, the overdraft offer (Value accepts, Premium declines), and the weekly time to afford with its Queries and the pad;
    - Value buying its rented 757 on day 365 (the negative-cash sum at a forced cash level, the rent stopped), the blocks at the limit (a purchase, the fuel desk), "Overdrawn £X of £Y", and two overdrawn month-ends making a board review;
    - Premium handing its 757 back at the end of September, the missed-h1 £2,000 and its correction, and a Build time to afford on the A350;
    - Tokyo's overnight rotation, Singapore from day 421, Sydney shut, and the months to the review (accounts with the mean, the A380 offer, the end card).
  - `node src/opening/tests/record.test.js` (`GAME` either file) checks the pupil record:
    - on Launch Day it types a long multiplication into the column template digit by digit, one line off by a carry, then right;
    - it checks that both attempts are kept cell by cell, with the note and the codes;
    - it fires every error note of the brief on its own case;
    - with `CODE=<save> PRINT=w8` it prints that week of a saved run in both views, as HTML and PDF in `OUT`.
  - `node src/opening/tests/migrate.test.js` loads the two real pupil codes and a full-game code: they land on the week's board (or one planning day with the first-time sums), and the week completes.
  - `node src/opening/tests/opening.test.js` (the day-by-day flow, `teacherDayByDay`) plays chapter 1 as a scripted pupil (`UPTO` beats, `W`/`H` for the screen size, `SHOTS=0` to skip screenshots): Launch Day's sums, the events, the shop on day 8 (rents the Saab), two aircraft, the weeks, December and the chapter accounts; it checks the typed figures, that projected = actual every period, and that no screen overflows at 1366×768 or 1915×891.
  - `node src/opening/tests/screens3.test.js` (Screens brief 3): test mode, Run and Jump to, the pupil's save untouched; the fuel dips; the demand shape and caption for a lone flight; the inspector and the folded routes; a week's results, the weekly graph and Coming up seen while Run plays; the daily colour limit over eighteen weeks.
  - `node src/opening/tests/briefings.test.js`: the twelve Operations briefings on their own and at their moments in the game, played to the end by Next alone (Back returns a beat; a decision holds Next), and the Home shelf (`ONLY=<ids>` for some of them).
  - `sh tools/make_jumps.sh` (then `python3 src/opening/build.py`) rebuilds the toolkit's Jump to airlines: the week and chapter 2–4 tests in a chain, each writing its save at the jump points (`JUMPS=<dir>`). Run it after a change to the engine or the data.
  - `node src/opening/tests/balance.test.js` (no browser) checks the world engine against Balance Reports v2, v3, v4, v4.1 (re-based to the v4.4 day costs, no crew in chapter 1) and the v4.4 addendum: every single-service figure to the pound, 23 known differences noted (see `docs/Workbook-v4-Report-Back.md`).
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

**Ctrl+Shift+T**, or tap the top-left corner of the control window (over the logo) three times.

- Accept this answer (fills the open cell) · fill the whole table · skip or go back one screen · high/low nudge toggle (off by default) · auto-advance after landing.
- **Text size**: Standard (22px text, 32px numbers), Large or Extra large. Saved with the run, so it travels in the save code; the IWB follows it.
- Forecast tables: help level on typed rows, which tables are live (as scripted / all / none), working space on the board, **tomorrow's choice** (as scripted, or force ticket price / trips / fuel / seat layout), and "Check the time maths" (runs the Change Request 2 time cases).
- Repeat today (back to the start-of-day state).
- Trigger, delay or skip events · fire a Captain's challenge now.
- Queue or remove jobs for the next round · set depth (1–3) per job.
- Starting cash for new runs · adjust cash or reputation now · start the next day now · flight animation length.
- **Skip ahead (weeks only):** 1, 4 or 8 weeks run on the standing plan by themselves.
- **Sign-offs a week** (v4.9): the cap of Calculate sign-offs a week from week 2 (workbook, 1, 2 or 3), "Hold at Calculate" for each relationship (no Build after the second time), the counts so far, and a per-week log: qualified, Calculate, Build, the model's, carried, and the month-end audit or board review.
- **Chapters 2–6: the gates** (read from the workbook: lease/buy/finance dates, reputation, the quarterly task, challenges and hunts) and **By hand so far** (every hand sum done, by day).
- End session (save and show code) · main menu · best runs · record this run · new run from scratch · test read-aloud · load a save code.
- **Question bank (printable)**: generates a page from the data blocks with every question template per job and depth level, the number ranges in use and a worked example of each. Regenerate after tuning; it never goes stale.

## Time speeds up: days, then weeks, then months

In the opening prototype the pupil never sees "rounds". The pace comes from the workbook's Chapters, Calendar and Market sheets (see *Chapter 1 on the workbook* above): one beat a day for days 1–28 played a week at a time (Monday plan, Tuesday–Saturday on the board, Sunday review), one a week from day 29, December as a month, then the chapter review. The full game (`airline-simulator.html`) keeps its own beat list in `data-world`.

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
- **Saves:** the opening prototype's saves are version 5 (codes start `ASIM5.`). **Older codes load too** (`src/opening/parts/p4u_migrate.js`): a code from the 7–8 October build is repaired in place and lands at the day's planning page (or at HQ, the briefing or the event card if the pupil had not reached the plan; at the results if the day had flown); a code from the 5–6 October build (`ASIM4.`, the May 2030 calendar) or from the full game carries the airline, cash, fleet, fares, snacks and history into a fresh state and starts the matching day again (old day *d* = new day *d* + 1, since launch day is day 1 now). Anything that had to change (fares not on offer, routes or aircraft not in this version, a refunded fuel order, the logo made from the old colours) is listed in the teacher panel under the save code, and the Home screen tells the pupil where the game carries on. `src/opening/tests/migrate.test.js` runs two real pupil codes (`tests/fixtures/`) through it.
- **One state, two views:** the HQ and the wall both draw from the same game state. Each day's history now also stores passengers, seats, trips and a per-route breakdown (passengers, seats, revenue, cost, profit, fare), which the HQ and the wall's results use. Older saves without them show "—".
- Two windows sync three ways: direct `postMessage` to the opened window, `BroadcastChannel`, and a `localStorage` storage-event fallback (needed on `file://` in Chrome).
- No `Math.random()` anywhere in outcome logic. Same world + same decisions = same result.
- Read-aloud uses `speechSynthesis`; the speaker buttons only appear when a voice is available. Test on the classroom machine (teacher panel → Test read-aloud).
- Styling: one shared style block at the top of the CSS is used by both windows. Mid-blue with a navy structure and white text. **Colour roles:** blue/cyan = interaction (primary buttons are a royal-blue → cyan-blue gradient with white text, an inner highlight and a soft glow; selected cards, tabs, steps and the open table cell are cyan); gold = money, stars, premium, awards and valuable opportunities; green = positive/operating; red = danger or loss; orange = delay or warning. Panels are lit from the top left (lighter blue top-left, deeper navy bottom-right, an inset top highlight). The final *Visual polish* block in the CSS holds these overrides and the tokens (`--act-a`, `--act-b`, `--sel`). Panels are square (2px corners) with thin borders; uppercase header bars with a status dot. Chart colours (ticket money blue, costs orange, profit green) pass the colour-blind checks on both the HQ and wall surfaces. Fonts are the system sans for words and Courier New for numbers, so zeros are plain (no slash) and nothing is downloaded. Change Request 4 adds a reading layer at the end: running text at least 22px and numbers at least 32px at the Standard size, mixed case for questions, stories and tables (the small uppercase panel chrome stays), no scanlines over text, task panels at least 90% of the width and no scrolling at 1920×1080 or 1366×768.
- Stage 1 ships depth 1 for every job. Depth 2 is live for pricing (rival fare shown), fuel (two suppliers), check-the-flight (time zones) and cabin (break-even); depth 3 is live for pricing (demand bar) and fuel (bulk deal). Headwinds for check-the-flight are a placeholder.

## Open items (from the brief)

- [x] Working out the time of each flight (distance ÷ speed) arrives with Madrid on day 15.
- [x] Chapter 2 (6 January 2031 to 31 August 2031): long haul, leasing, reputation live, the airline type, events with options, the news, the Captain's challenges and the hunts (pushes 1–3).
- [ ] Chapter 3 (1 September 2031 to 31 August 2032): push 1 done (the year, the overdraft, owning and handing back, time to afford in weeks, the review); push 2 to come (Sydney, storm 2 and ash cloud 2, challenges 3–4, hunts h3–h4, percentage change).
- [ ] Decisions for Fable in `docs/Workbook-v4-Report-Back.md` (the review day, rule 2 on day 4, the fault's options, the price war, Istanbul's archetype, Reykjavik's fares).
- [ ] Step 3: the commissioning loop for new planes (configure, route, timetable, launch week, review, "Regular service approved"), story callbacks (`S.flags` already records each event choice) and a multi-award finale.
- [ ] Tune Year 2 (long-haul) numbers with real play.

- [ ] Pupil's top three planes to add to the shop.
- [ ] Nudge on or off by default (currently off).
- [ ] Tune prices, starting cash and rewards after first play.
- [ ] Test read-aloud on the classroom machine.
