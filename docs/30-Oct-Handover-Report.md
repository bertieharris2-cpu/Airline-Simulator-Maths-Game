# The 30 October hand-offs: chapter one (report)

*For Bertie (and Fable, Claude Design). Built from hand-off 1, Fable's rules and data, and hand-off 2, the screens, with workbook v6.2. Branch `claude/zealous-pascal-8e5jfn`.*

## In short

- **The build is chapter one.** It starts at Launch Day, ends at the chapter-one review (Sat 28 Dec 2030; see section 7), and shows one card: "End of chapter one. This test build stops here." Later chapters stay in the code and their tests still pass, but the build never reaches them. Section 9 covers that.
- **Everything in hand-off 2 is built:**
  - the Question Signal;
  - week 1's accounts, with Finance's example first;
  - week 2's Σ SUM;
  - Launch Day's watch, do, watch, compare;
  - the what-if fare sheet;
  - the Fuel desk order without a sum;
  - the full-width timetable;
  - the teacher's Briefings shelf.
- **Hand-off 1's rules are in.** Parked rows are skipped, two counted questions a pause at most, none between pauses, Launch Day fuel at £1.20 in Total costs, the shop opens on day 15, and no tip says to fit four flights.
- **Teacher test mode can now:**
  - start a **new TEST airline at Launch Day** (no naming, livery or plane design);
  - **jump to any chapter-one pause**: Launch Day, P1 to P5, and the chapter-one review.
- **A chapter-one check** (`src/opening/tests/chapter1.test.js`) runs a TEST airline from Launch Day to the review in about six minutes and checks hand-off 1's list.
- **Open for you:**
  - P1 has no counted questions, as section 10 of hand-off 2 asks.
  - Two P3 questions are not built.
  - From week 6 the weekly pauses ask nothing unless he changes his plan.
  - Section 7 lists the points where v6.2 and the build disagree.

## 1. Hand-off 1: rules and data

| Item | What the game does now |
| --- | --- |
| §1 Test start | **Tools ▾ › Jump to › New TEST airline at Launch Day**, also in the teacher panel's Testing box. Each start makes a new airline called **TEST Air**, with code TE and the launch-deal Twin Otter G-TEST in the default livery. It skips the name, code, logo, paint, reveal and certificate steps. It is saved in the test slots, labelled TEST. The pupil's own game and record are put aside and not touched. |
| §2 Parked mechanism | The importer skips every parked or retired row: 28 events, 38 event options, 19 route news, the 5 Catering rows, 2 daily colours and the `day_override` upgrade. Briefings marked parked, retired or test only never play in chapter one: rival_split, event_weekend, flight_time, cabin_sales, full_route and tenths_stay. The Flight times page and its sums are off. The Madrid screen shows the range check only. |
| §3 Counting | Up to two counted questions at each pause. A counted question is a figure worked in his book and typed in. Cells he builds as a formula don't count, and nothing is asked between pauses. The pause's other questions are worked by Finance (ƒ) or built as a formula. When a pause is full, "Is the change worth it?" on the Changes tab becomes a formula he builds, which doesn't count. |
| §4 Schedule | Section 4 below, with what the end-to-end run actually asked. |
| §5 Launch Day fuel | Charged at £1.20 a litre and in Total costs: 600 L = £720, inside costs of £4,330. The Launch Day sheet's Fuel line says "600 L at £1.20". |
| §5 Launch Day fares | £80 is worked by Finance while he watches, then his £90 (Sum 1), then £100 watched, Paris ƒ, then "One flight, two ways" (Sum 2). |
| §5 Second plane | The shop is empty until day 15, then opens. "Can I afford the plane and still run the airline?" now plays in the shop in week 3, before his first purchase. It no longer plays on week 2's Fuel desk. |
| §5 Fuel order | No purchase sum. He chooses blocks, and the order shows the cost (ƒ) and the cash after it against his reserve. |
| §5 What-if sheet | From week 2. Section 2 below. |
| §5 Spreadsheet ladder | Week 1: he clicks each day. Week 2: he clicks, is then shown Σ SUM, and tries it. From week 3: drag only. |
| §5 Red Kite undercut | Off (its event is parked). |
| §5 Four services | No tip says another flight would fit: the idle-plane tip is hidden in chapter one. |

## 2. Hand-off 2: the screens

| § | Screen | Built | Screenshot |
| --- | --- | --- | --- |
| 1 | Question Signal | Build (cyan) or paper (gold) on every sheet question, with the Enter key drawn and a short line under the sheet. Green done callouts replace the FORMULA and SUM n cards on the sheets. | — |
| 2 | Week 1 accounts | Finance's example first (£1,250 + £1,300 + £1,150 → £3,700, about one click a second), then **My turn ▶**. He clicks Mon to Sun and presses Enter, then works the average (B9 ÷ B10). Two done callouts follow, then **Plan week 2 ▶**. | `week1-accounts-example.png` |
| 3 | Week 2 Σ SUM | He clicks first, then "There's a quicker way" shows Σ SUM, then **Try it**. From week 3 he drags. | — |
| 4 | Launch Day | £80 watched (the 8 × 10 grid), his £90 (Sum 1), £100 watched, Paris ƒ, then One flight, two ways (Sum 2); the fuel line. | `launch-day-sum2-comparison.png` |
| 5 | What-if fare sheet | From week 2: − / + on each fare, changes outlined, **What changed**, **Back to my fares**, a first-visit note, **Set my fares**. No sums. | `what-if-sheet.png` |
| 6 | Fuel desk order | Your order: blocks, cost ƒ, cash after it, against the reserve. Your position "WITH THIS ORDER". Nothing is bought until Continue. | `fuel-desk-order.png` |
| 7 | Timetable, full width | Section 2a. | `timetable-1…4`, `launch-day-timetable.png` |
| 8 | Briefings shelf | In teacher test mode only: a **Briefings TEST** item at the foot of the menu. It lists every chapter-one briefing in the workbook with IN PLAY, TEST ONLY or PARKED, and **Watch ▶**. Watching one changes nothing: the seen list is put back afterwards, and nothing goes in the record. | `briefings-shelf.png` |
| 9 | 21 Oct items | Built on 21–22 Oct and still in place. The Flight times sheet and "How long will it take?" are behind the parked flag, so nothing shows. | — |
| 10 | P1 | No counted questions (open for you). | — |

### 2a. The timetable, full width

While he plans flights, the menu and the Studio's other panels hide. **☰ Show menu** brings them back, and the Studio's timetable then has **⤢ Full width** to return.

- **Top bar.** "Aircraft timetable", the airline and week, Mon–Fri | Sat–Sun, Day view | Table view, Compare with last week (from week 2), **↶ Undo** (the plan page's own, one change at a time) and **☰ Show menu**.
- **Who wants to fly.** This panel lines up with the hours. It has the route picker with counts and All routes, and the key. Each band from Early to Evening shows its count, one figure per person and its caption ("✓ the 07:00 catches them" / "no Dublin flight then"). Any time sits in outline figures.
  - Picking up a flight switches the panel to its route, and the band under it lights green.
  - When a band has more people than fit, each figure stands for 2, 5 or 10 people, and the key says so.
- **Lanes.** One 64px lane per plane, with dark blue 56px blocks: flag, route, seats filled, a seat-fill bar (green from 80%, amber below), the times and the grip dots. Turnarounds are hatched.
- **Dragging a flight.** The block lifts with a green edge and a green start line. The label under the lane says "✓ Fits · leaves 19:15, back 22:00", and the old place stays as a dashed ghost. Flights snap to the quarter hour.
- **A flight that can't fit.** The block turns amber, hangs past 22:00 against an amber line, and the reason sits under the lane. Two flights too close together get "! The plane is back from Dublin at 10:45 and needs 35 min on the ground: the earliest it can leave is 11:20."
- **Add a flight.** A tray of the routes he flies. Each has the blue **+**, the flag and "3 h 45 there and back", and is dragged onto a plane. A fifth flight is refused with its reason, never a count.
- **First time.** The note (NEW · MORE ROOM TO PLAN, Got it) shows once and is stored in the save.
- **Two planes and eight flights** fit at 1366 × 768.
- Clicking a flight opens the Studio's flight inspector in its fixed place under the lanes, as DESIGN.md says.

## 3. Chapter one end to end (hand-off 1, section 7)

`chapter1.test.js` starts a TEST airline and plays it to the chapter-one review with the toolkit (Run, its answers and auto-plan; a second Twin Otter joins on day 15).

| Check | Result |
| --- | --- |
| A TEST airline at Launch Day, no naming/livery/plane design | ✓ |
| No event cards or news in chapter one | ✓ no event step in 118 days; no route news dated before 28 Dec |
| No snacks | ✓ no Snacks control or cabin sales on any day |
| Second-plane shop opens on day 15 | ✓ nothing to buy on day 14 |
| Two counted questions at every pause, none mid-week | ✓ never more than two. None mid-week, apart from week one's four one-off calculations; see 7c |
| Launch Day fuel in total costs | ✓ 600 L at £1.20 = £720, in the day's costs of £4,330 |
| The build ends at the chapter-one review with one card | ✓ |
| Every chapter-one TEST save loads | ✓ all seven |

## 4. Questions at each pause: the schedule and what the run asked

The run is the toolkit's own play: it changes fares and plans in its own way, so other pupils' runs differ. "Changes" means the Changes tab's "Is the change worth it?", asked when he changes his plan.

| Pause | PauseSchedule (v6.2) | What the build asks |
| --- | --- | --- |
| Launch Day (Mon 2 Sep) | Dublin £90 tickets (his); comparison 14 × £130 against 19 × £90 | ✓ Sum 1 Dublin £90 and Sum 2 the comparison |
| Tue 3 Sep | — | Day 2's Work it out: Paris tickets and the day's profit. These are week one's other two one-offs; see 7c |
| P1 (Sun 8 / Mon 9 Sep) | Open (none) | ✓ none. The week's total and the average are formulas |
| P2 (Sun 15 / Mon 16 Sep) | Time to afford; first rotating review question | ✓ the rotating question (best day). Time to afford comes in the shop's "Buy now or wait?" when he opens it. The run bought its plane directly, so it showed instead a Changes question for the new plane's flights |
| P3 (Sun 22 / Mon 23 Sep) | Fuel for two planes (litres per seat); Madrid possible revenue | **Not built.** Only Changes, when he changes a fare or plan |
| P4 (Sun 29 / Mon 30 Sep) | Difference from plan (first); rotating question | ✓ the difference (row 11 of the accounts) and the rotating question (range) |
| P5 (Sun 6 / Mon 7 Oct) | E175 worth check or rotating; modelling | Changes plus a new route's tickets (Brussels). The E175 check and the modelling question are not built |
| P6 on | Required decisions first; difference about every third pause; rotating or modelling | **Weeks 6–12 ask nothing** unless he changes his plan or opens a route: from week 5 the review is the older "How did week n go?" with a Build. In the months there is the Finance audit plus Changes |

The rotating questions built are best day, range, load factor and worst day. Route share, best route and fuel share are not built yet.

## 5. Keeping chapter one separate (Bertie, 30 Oct): what is done, and a proposal

**Done now, without restructuring:**

1. **The chapter-one logic sits in three files of its own.**
   - `p6a_ch1.js`: the rules, the build's end, parked items, counting, the test start.
   - `p6b_signal.js`: the Question Signal, the week's accounts, Launch Day.
   - `p6c_desks.js`: the what-if sheet, the fuel order, the timetable, the Briefings shelf.

   Each is gated on the game date (`ch1()`), so later chapters keep their behaviour. A chapter-one change usually touches only these files and `p1_head_ch1.css`.
2. **The words and numbers come from the workbook.** That covers ScreenText (44 rows), the SheetSums `how` (watch / book / formula / ƒ), PauseSchedule, the Settings, the briefings' statuses and the example profits. Most chapter-one changes are a workbook edit and `python3 tools/import_world.py`.
3. **Jump to any pause.** `node tools/make_ch1_jumps.js` plays a TEST airline with the toolkit and saves it at Launch Day, P1 to P5 and the chapter-one review. The build puts those saves in **Jump to…** in place of the old Steady-path jumps while the build ends after chapter one.
4. **A quick check.** `node src/opening/tests/chapter1.test.js` (about six minutes) after each change.

**Proposed, not done (it needs your OK).** These are the larger restructures:

- **A chapter-one build.**
  - What: `build.py` leaves out the later-chapter parts (chapter 2's beats, long haul, chapter 3's money, chapter 4) when `buildEndsAfterChapter = 1`. The file gets smaller and it's clear what runs.
  - Risk: some of those parts also wrap shared functions, so each needs checking. A save made past day 118 in a full build would not load in it; the game would say so. Saves inside chapter one are unaffected.
  - The full build would stay as a second file for the chapter 2–4 tests.
- **The week-5-and-later review on the sheet.** Bring the reviews from week 5 into the same sheet as weeks 1–4, so the difference cadence and the rotating and modelling questions can be asked there. This closes the P6+ gap in section 4.

## 6. Workbook v6.2

The import report is `data/Import-Report.md`: **0 to fix, 21 to check, 7 notes**, the same checks as before (lease rule, unbuilt milestone measures, route legs off the quarter hour).

- **Merged:** Settings (23 new rows), PauseSchedule, ScreenText (44), SheetSums' status column and the Launch Day rows, the Briefings' coworkNumber and status, and the statuses on Events, EventOptions, RouteNews, Catering, DailyColour and Upgrades. `tools/merge_v62.py` does the merge.
- **Kept:** my 19–21 Oct rows, which v6.2's base did not have.

## 7. Where v6.2 and the build disagree, and things to decide

1. **Chapter one or year one.** CLAUDE.md says new design goes into year one (Launch Day to the year-1 accounts). The hand-offs say chapter one only, so the new work is gated on chapter one. CLAUDE.md is unchanged; you may want to update it.
2. **The chapter-one review is on Saturday 28 Dec 2030,** not Sunday (2 Sep 2030 is a Monday; day 118 is a Saturday).
3. **Week one's four one-offs and `midweekQuestions = false`.** Launch Day asks two. Tuesday 3 Sep (day 2) asks the other two: Paris tickets and the day's profit. That keeps to "up to four one-off calculations in week one", but day 2 isn't a pause in PauseSchedule. Should Tuesday ask nothing?
4. **The Fuel desk.** DESIGN.md says "Fuel desk unlocked from Launch Day", but v6.2 sets `fuelDeskOpensDay = 8`. The game follows the workbook: week one's fuel is bought as it is burned, at the day's price.
5. **The rotation start.** v6.2 has `rotationFromWeek = 5` (draft) and `reviewRotationFrom = week-2 review`. The game uses the week-2 review, as PauseSchedule P2 says.
6. **Parked rows that reach past chapter one.** These rows' statuses also act after 28 Dec:
   - the 4 Catering rows (snacks return in year two);
   - DailyColour birthday_cake and hen_party;
   - the `day_override` upgrade (chapter 2's one-day changes);
   - dated rows that run on past the review: the Christmas event (24 Dec) and the Ramadan and Belgian rail-strike news.

   With the build ending after chapter one, nobody meets this. But the chapter 2–4 tests, run with the build end lifted, now finish slightly differently (section 9). If parking is meant for chapter one only, I can make the importer keep those rows from day 119.
7. **Briefings.**
   - The workbook's Briefings sheet has no "kind" column (ORIENTATION, DISCOVERY, TOOL). The shelf takes the words from Claude Design's picture until Fable adds one.
   - Not built yet: How an airline makes money, Time of day matters, A forecast isn't a promise, and Snacks on board.
   - Eight in ten stay's file (`briefing-tenths.html`) is not in the repo, although the workbook says it is built.
8. **The chapter accounts and the week-5+ reviews.** These still use the older cards ("SUM 29", "SUM 8"). The Question Signal is drawn on sheets only.

## 8. Not built

- P3's fuel for two planes (litres per seat) and Madrid possible revenue.
- P5's E175 worth check and the modelling questions.
- The rotating questions route share, best route and fuel share.
- The review from week 5 on the sheet, with the difference cadence. Section 5 proposes it.
- The four briefings above.

## 9. Tests and the later chapters

| Test | Result |
| --- | --- |
| `chapter1.test.js` (new) | All checks pass; see section 3 |
| `numbers.test.js` | 36 passed, none failed, after two updates for v6.2: week one's fuel is bought as it is burned at the day's price, and the week-1 accounts open on Finance's example |
| `chapter2.test.js` Value, from the 21 Oct chapter-one save | 112 passed, none failed. £14,806,737 at the review (21 Oct: £14,806,209) |
| `chapter3.test.js` Value | 66 passed, none failed. £31,351,163 (21 Oct: £31,529,103) |
| `chapter4.test.js` Value | 59 passed, none failed; last time's fuel-farm failure now passes. £59,608,358 (21 Oct: £58,865,752 with one failure) |

The later-chapter differences come from the data, not the code. Running the game as it was before today's work and today's build from the same chapter-one save, the first difference is the Christmas gap: £261 less in costs. That is the parked Christmas event. Next comes a January week (the parked Ramadan news), and it compounds from there. The chapter 2–4 tests now set `settings.fullBuild` to run past the build's end.

`week.test.js` and `answers.test.js` play the old Steady path through the old screens and need rewriting for the chapter-one screens. `chapter1.test.js` covers chapter one in their place for now.

## 10. Files

- New: `src/opening/parts/p6a_ch1.js`, `p6b_signal.js`, `p6c_desks.js`, `p1_head_ch1.css`, `tools/make_ch1_jumps.js`, `tools/merge_v62.py`, `src/opening/tests/chapter1.test.js`, `src/opening/tests/fixtures/jumps-ch1/`.
- Changed:
  - `p5f_brief.js`: a parked briefing never plays; the shelf's play; "Can I afford" in week 3.
  - `build.py`: the chapter-one parts and jumps.
  - `tools/import_world.py`: statuses, the shelf, PauseSchedule.
  - `DESIGN.md`: your 30 Oct copy.
  - The workbook.
- Screenshots: `docs/screenshots/30-oct/`.
