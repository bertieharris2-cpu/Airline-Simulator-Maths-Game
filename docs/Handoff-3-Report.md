# Hand-off 3 (30 Oct 2026, evening): chapter one (report)

*For Bertie, and for Fable and Claude Design. Built from Claude Design's hand-off 3 (`1-READ-FIRST-changes-for-claude-code.md`) with workbook v6.3 and the DESIGN.md in the zip. Chapter one only, behind `ch1()`. Branch `claude/zealous-pascal-8e5jfn`. Screenshots at 1366 × 768 are in `docs/screenshots/handoff3/`. The same report as a Claude Doc: https://claude.ai/artifact/P3kA2t1GnPYXRJkVvcrQgU*

## In short

- **Launch Day.** It now reads left to right:
  1. the job first;
  2. Finance builds the first formula, with a pointer clicking B2, ×, B3, Enter;
  3. HOW A FORMULA WORKS;
  4. he builds the second formula himself (not counted);
  5. the third fare on paper (**Sum 1**, with the class method in the hint);
  6. only then does Finance fill in Paris and the plan, and E4 and F9 light green once.

  "One flight, two ways" and the Finance watch panel are gone. Launch Day asks **one counted question**.
- **Keys** (× ÷ + − and Enter ↵) sit beside a shorter formula bar on every sheet. The second cell in a formula is violet (`ref-2`).
- **Column heads** read "your 2 flights" / "your flight" over "Dublin at £110". **WHY 27?** explains, once, why a column carries fewer passengers than want to fly at that fare.
- **What a fare does, beat 4** is one panel: the planes fill and empty as the slider moves, with £70 and £140 at its ends.
- **After Launch Day** there is no Home and no Close the day. Instead:
  1. **Launch Day: how it went**;
  2. **the plan check**, with an amber line and **Fly it anyway** when a flight lost money;
  3. **Week 1 is flying**: day tiles, Normal / Fast, Live Operations, So far this week, Skip to Sunday.

  The **Tuesday "Week 1 plan" sheet and its sums are gone**.
- **The Studio:**
  - View trade-offs and ƒ work it out are hidden for **all of chapter one**;
  - the capacity tip waits for the plane shop (day 15, from the workbook);
  - the chapter page is kept as built.
- **The Briefings shelf** follows the master plan:
  - IN PLAY: 1, 2, 3, 5, 7, 8, 9 and 12;
  - PARKED: 4, 6, 10 and 11;
  - TEST ONLY: "Eight in ten stay";
  - nothing else.
- **Checks:**
  - `chapter1.test.js`: 27 checks, all passing. They include the new pages, one counted question on Launch Day, and nothing asked from Tuesday to Saturday.
  - `numbers.test.js`: it now also reads the new week page to the pound.
  - `playnotes.test.js`: 20 checks, all passing.

## 1. Launch Day (hand-off 3, section 1)

| Step | What the game does |
| --- | --- |
| The job first | The sheet opens with nothing lit. A Sheet Callout under row 4 points up at B4: "LAUNCH DAY · YOUR JOB · Work out the ticket revenue for each flight, at each fare", with **Watch ▶**. The footer's Next is greyed out. |
| Finance demonstrates | A pointer glides to B2 and clicks, presses ×, clicks B3, presses Enter (about 0.65 s a step). The lines under the grid say what it is doing. Keys and clicks are blocked while it runs. B4 fills in and is not counted. |
| HOW A FORMULA WORKS | A callout under the block ("= B2 × B3 means passengers × fare…"), with the two references in their two colours. **Your turn ▶** starts his build. |
| He builds C4 | The build signal sits under C4. He clicks the passengers, ×, the fare, then Enter, using the keys or the keyboard. Give me a hint is there. It is a formula: no Sum number, no record entry. |
| D4 on paper | The paper signal: **Sum 1**, worked in his book and typed in. The first hint is the class method: "£90 is 9 × 10. First work out 19 × 9, then multiply by 10." The old "take the 0 off" hints are removed. |
| Done | Finance fills in Paris (E) and the plan (F5, F8, F9). E4 and F9 glow green once. The line: "✓ Every Launch Day sum is done. Finance filled in Paris and your plan: profit £… a day." |
| Removed | One flight, two ways (rows B13/C13 and its Sum 2) and the Finance watch panel. |

- **Which column is which** comes from the workbook's SheetSums: B4 `demo`, C4 `formula`, D4 `book`.
  - The columns run left to right as the sheet shows them: the fare below his, his fare, then the fare above.
  - With his fare at £80 that is £70 demonstrated, £80 built and £90 on paper.
- **The keys** (DESIGN.md): × ÷ + − at 40 × 34 px and Enter ↵ at 78 × 34 px, beside a shortened formula bar, on every sheet in chapter one. A key lights when pressed.
- **The second reference is violet** `#b48cff` (`ref-2`): its outline, its B tag and its name in the formula bar. The first stays cyan.

## 2. The column heads and WHY 27? (section 2)

- **Column heads:**
  - top line: "your 2 flights", or "your flight" for one (the number counts his flights on that route);
  - main line: "Dublin at £110".
- **WHY 27?** comes up the first time a column's passengers are fewer than the people who want to fly at that fare, while seats are spare.
  - Example: "27 of the 30 can catch your flights. 30 people a day want to fly to Dublin at £110. 27 of them want to go when your 06:00 or 14:00 leaves. The other 3 want a time you don't fly."
  - The passengers cell is ringed, and the note shows once (Got it).

## 3. What a fare does, beat 4 (section 3)

- **One panel:** THE SLIDER'S FARE in gold and two planes whose seats fill and empty with the slider.
  - **Under the planes:** "19/19 ✓" or "18 of 19", and either the people left behind or "2 seats fly empty".
  - **The caption:** "Planes full · but only £70 a ticket", "£110 a ticket · 2 seats fly empty", or "£140 a ticket · but seats fly empty".
- **£70 and £140** are written at the slider's ends, which come from the briefing's own fares. The readout under the slider keeps the seats-filled count.

## 4. After Launch Day (section 4): `p6f_afterlaunch.js`

1. **Launch Day: how it went.** A page of its own, with no menu item selected.
   - **Header:** "Monday 2 September · every flight landed".
   - **Panels:** the five result tiles, the Launch Day Results panel (Revenue − Costs = Profit, projected against actual, route lines), Route Performance and Feedback.
   - **The Next panel:** "Your plan flies again **every day, Tuesday to Sunday**. First, a quick check of the plan. On Sunday you'll do the week's accounts."
   - **Footer:** "Launch Day is done.", **Check my plan for the week ▶**.
2. **The plan check:** "Your plan for the rest of week 1", Tuesday 3 to Sunday 8 September.
   - **Your flights, every day:** each flight with its time, flag, route, fare and Launch Day's seats (green 80% and over, amber below).
   - **Before it flies:**
     - ✓ every flight fits in the day, 06:00 to 22:00;
     - ✓ every flight made money on Launch Day;
     - ✓ seats filled, 75 of 76;
     - ● (cyan) the people who wanted seats he didn't have, "a chance for later".
   - **Under the panels:** "Nothing to work out: Finance keeps the sheet up to date each day…".
   - **Footer:** **Change my plan** and **Fly Tuesday to Sunday ▶**.
3. **Something needs a look.**
   - A flight whose Launch Day profit was below Settings `planCheckLookBelow` (£0) gets an amber ! line: "**Paris 19:00** lost money on Launch Day: 6 of 19 seats at £100. Change it before the week flies?"
   - Change my plan becomes the blue main button and the go button reads **Fly it anyway ▶**.
4. **Week 1 is flying.** "Your plan, every day, Tuesday to Sunday. Sunday: the week's accounts."
   - **Speed:** ▶ Normal / ▶▶ Fast.
   - **Day tiles, Tuesday to Sunday:**
     - a flown day has a green edge, "✓ flown" and its profit in gold;
     - the day flying now has a cyan edge, "flying now · 14:40", a progress bar and "3 of 4 flights out";
     - waiting days are dimmed.
   - **Live Operations:** the day's flights, Scheduled → In the air → Landed / Full flight.
   - **So far this week:** profit for the days flown, seats filled, and the people who wanted seats he didn't have.
   - The header's date and cash move on as each day lands.
   - **Footer:** "The week runs on its own. Nothing to work out until Sunday." and **Skip to Sunday ⏭**. On Sunday the week 1 accounts open as before.
5. **The Tuesday "Week 1 plan" sheet is retired.** In week 1 the board no longer stops for the cells the plan left open (Paris ticket revenue, Sum 4, and the day's profit).
   - If he changes the plan at the check, the Studio opens on the timetable and Work out my plan works as now: the Changes tab, then the sheet.
   - The check then comes back with the new plan's figures.

**What I decided that the hand-off doesn't say (please check):**

- **A flight "made money"** when its tickets cover its own costs: flying and landing, fuel and the passenger charges. The plane's day cost isn't shared out among the flights.
- **After Change my plan,** the check describes the plan, not Launch Day. It says "seats your plan should fill" and "every flight should make money on your plan". The week's projection is redone: Launch Day as it flew, plus the new plan from Tuesday to Sunday.
- **Speeds:** Normal is about 6 seconds a day and Fast about 1.6. Skip to Sunday flies the remaining days at once. These are not in the workbook yet.
- **Week 1 only.** From week 2 the Monday flow and the board after it are unchanged; the hand-off asks only for week 1. **Should weeks 2 to 4 get the same "Week N is flying" page, and no Close the day on Mondays?**
- **A save joining week 1 part-way** (an older save code) goes straight to the week page, with no plan check.
- **New ScreenText rows** written by Claude Code for these words: `plancheck.changed`, `plancheck.nofit`, `weekflies.tile`.

## 5. The Studio and the chapter page (section 5)

- **The chapter page** stays as built: Chapter 1, the dates, Begin.
- **View trade-offs and ƒ work it out** are hidden for all of chapter one (until 19:15 they were hidden in week one only). Checked on day 8 and day 15.
- **The capacity tip** ("Every seat is sold — … another plane, or a bigger one … Test fare") is left out of the plan's tips until the plane shop has something to sell (`shopPlanes`, from Settings `secondPlaneShopFromDay` = 15). It is gone on day 8 and back on day 15.
- **As built:** Compare aircraft waits for the shop, Service costs is hidden, there is no Choose where to fly, the Add a flight tray is outlined, and flights swap by dragging.

## 6. Everything after week 1 moves a week (section 6)

**Not changed yet, as the hand-off says.**

- Every start day is read from the workbook. Nothing new is hard-coded:
  - Fuel desk: `fuelDeskOpensDay`;
  - plane shop: `secondPlaneShopFromDay`;
  - what-if sheet: Calendar day 8's unlocks;
  - new routes and pauses: Calendar and PauseSchedule.
- The game keeps v6.2's timings until Fable's update arrives. When the workbook moves them, the game follows on import.

## 7. Briefings: the master plan (section 7)

- **The shelf** (teacher test mode, Briefings):
  - IN PLAY: 1 How an airline makes money, 2 What a fare does, 3 Cash, tank, profit, 5 Time of day matters, 7 Two planes, one route, 8 Can I afford the plane and still run the airline?, 9 Weekdays and weekends, 12 A year of demand;
  - PARKED: 4 Customers have a choice, 6 A forecast isn't a promise, 10 How long will it take?, 11 One big Saturday;
  - TEST ONLY: Eight in ten stay.
- "Snacks on board", which has no number in the master plan, is no longer listed. 13 and 14 are not listed.

## 8. The workbook (section 8)

Written into `data/Airline-World-Workbook.xlsx` by `tools/merge_v63.py` (which can now be run again without doubling its notes), then imported (0 to fix):

- **SheetSums, Launch Day:**
  - B4 `demo` (launch.demo), C4 `formula` (launch.build), D4 `book` Sum 1 (launch.tickets);
  - notes on E4 and F9;
  - B13/C13 (One flight, two ways) retired.
- **ScreenText:** 31 rows for the job first, the demonstration, HOW A FORMULA WORKS, the build and paper signals, the paper hint, WHY 27?, the results page, the plan check and the week flying. The launch.watch and launch.compare rows are marked retired.
- **Settings `planCheckLookBelow` = 0:** what "needs a look" means.
- **Still for Fable:**
  - the start weeks and days after week 1 (section 6), including PauseSchedule P2 onwards and the plane shop's day;
  - a Speed row if Normal / Fast should come from the workbook.

**Where v6.3 and the hand-off disagree:** each is noted in the Settings row, and the game follows the hand-off.

| v6.3 says | The hand-off says | The game |
| --- | --- | --- |
| `studioExtrasFrom`: View trade-offs and ƒ work it out come back on day 8 | Hidden for all of chapter one | Hidden all chapter |
| `weekOneAfterLaunch`: "Nothing else moves" | Section 6: everything after week 1 moves a week (Fable to update) | v6.2's timings until the workbook changes |
| `launchDayFares`: demonstrate £80, build £100, paper £90 | B demonstrated, C built, D on paper, left to right | Left to right: £70 / £80 / £90 at his £80 |
| `tipsOnlyActionable`: the capacity tip shows with the fare only | Hidden until the shop opens | Hidden until day 15 |
| PauseSchedule P1: a modelling question | Section 9: open, not decided in code | Not built |

## 9. Counted questions at each pause (section 9, open)

From the chapter-one run, a TEST airline played by the toolkit with its auto-plan. The auto-plan changes the plan most Mondays, which brings in the Monday sheet's cells. A pupil who keeps his plan is asked less.

| Pause | Counted (in his book) | Built or by formula (not counted) |
| --- | --- | --- |
| Launch Day, Mon 2 Sep | **1**: D4, Dublin ticket revenue (Sum 1) | the C4 formula |
| Tue 3 to Sat 7 Sep | **0** (the Tuesday sheet is gone) | — |
| P1, Sun 8 / Mon 9 Sep | **0** on Sunday (week 1 accounts: total and average, both built). **2** on Monday, from the auto-plan's change: Paris ticket revenue and profit | 2 |
| P2, Sun 15 / Mon 16 Sep | 2 (best day; is the timetable change worth it?) | 6 |
| P3, Sun 22 / Mon 23 Sep | 1 (the Geneva fare change) | 2 |
| P4, Sun 29 / Mon 30 Sep | 2 (difference from the plan; range) | 2 |
| P5, Mon 7 Oct | 2 (a fare change, a timetable change) | 2 |
| Weeks 6 to 13 | 0 most weeks; 2 when the plan changes (an audit line, a fare change) | 1 to 3 |

**Week 1 now asks one counted question, on Launch Day.** P1 asks none unless he changes his plan. Fable to propose what, if anything, P1 asks, after Bertie's say.

## 10. What to check in the next play-test

From the hand-off:
- Does he wait for Watch, follow the pointer, then build C4 with the keys or the keyboard, pressing Enter by himself?
- Do the two colours help him see which cell is which?
- Does WHY 27? make sense to him, and does he notice "your 2 flights"?
- On the fare briefing, does he try both ends of the slider and see the planes change?
- After Launch Day: does the plan check read quickly, and does he fly the week without going back to the Studio unless something needs a look?
- Does moving later things along a week leave week 2 feeling empty? (Note it for Bertie.)

Also worth a look:
- **Normal speed** (about 6 s a day): too slow, too quick? Does he use Fast or Skip to Sunday?
- **Change my plan at the check:** does the Studio, then its sums, then back to the check feel right? Or should a change at the check ask nothing until Sunday?
- **The paper hint:** does "£90 is 9 × 10…" match how he was taught?
- **The results page:** is "Launch Day: how it went" enough on its own, with Home not shown until week 2?

## Files

- **New:**
  - `src/opening/parts/p6f_afterlaunch.js` (section 4, and the capacity tip);
  - `tools/merge_v63.py`;
  - `data/incoming/handoff-3-30-oct/` (the v6.3 workbook and the READ-FIRST).
- **Changed:**
  - `p6b_signal.js` (Launch Day, the keys, the column heads, WHY 27?);
  - `p6e_notes1915.js` (the Studio hides, all of chapter one);
  - `p6c_desks.js` (the shelf);
  - `p5i_playnotes.js` (the log names the new pages);
  - `p1_head_ch1.css`;
  - `briefings/briefing-fare.html` (beat 4);
  - `DESIGN.md` (the hand-off's copy);
  - `tools/import_world.py` (SheetSums `demo`);
  - the workbook and its import.
- **Tests:**
  - `chapter1.test.js` (27 checks: the three pages, one question on Launch Day, none Tuesday to Saturday);
  - `numbers.test.js` (reads Week 1 is flying: each tile's profit, and So far this week);
  - the chapter-one Jump to… saves, remade.
