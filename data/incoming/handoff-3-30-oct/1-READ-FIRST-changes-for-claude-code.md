# Hand-off 3: after the play-test of 30 October, 19:15

## What this means (plain English, for Bertie)

Claude Code's play-test report (30 Oct, 19:15) and your changes list (items 12 to 17) were drawn on the real screens, and you approved them all that evening. This zip tells Claude Code:

1. **Launch Day:** the job is said first. Finance then shows how to build a formula: a pointer clicks the passengers, a new × key and the fare, then presses Enter. He builds the next one himself, and the third is on paper. Paris and the plan only fill in once he has finished. "One flight, two ways" goes.
2. **Formula keys and colours:** × ÷ + − and Enter sit beside the formula bar. Each cell in a formula gets its own colour, like Excel: cyan, then violet.
3. **"Your 2 flights":** the columns say whose flights they count, and the first time it matters a note explains the 27.
4. **What a fare does, beat 4:** the planes fill and empty as the slider moves.
5. **After Launch Day:** a results page, a plan check, then the rest of week 1 flies on its own. No Home, no Close the day, no Tuesday sums.
6. **Your four quick decisions:**
   - the chapter page stays as built;
   - View trade-offs stays hidden all of chapter one;
   - the "buy another plane" tip stays hidden until the shop opens;
   - everything after week 1 moves along a week (Fable updates the workbook for this).

**This zip replaces the hand-off 2 zip.** Hand-off 2 and Fable's hand-off 1 are inside it, in `earlier/`, for anything not yet built. DESIGN.md is the current copy.

---

## 0. Rules for this round

- **Status:** Claude Code's 30 Oct 19:15 report shows hand-off 2 largely built (full-width timetable, Question Signals, the outlined tray). This file lists only what changes. **Where it differs from `earlier/hand-off-2-screens-30-oct.md`, this file wins.**
- **Chapter one only**, behind `ch1()`, as before. Keep chapter one's content in the workbook and its screen code in its own modules (hand-off 2, section 0).
- **The workbook is the single source of truth.** Texts, fares, figures, start weeks and question counts are read from it. Section 8 lists what changes there.
- **Pictures** in `pictures/` are 1366 × 768 mock-ups on the build's own screenshots from the play-test; `-before` and `-as-built` pictures are the build as it is. Figures are from the play-test saves (TEST Air) and are examples.
- First-time callouts and the Launch Day demonstration show once (store "seen" in the save). Under reduced motion the demonstration's pointer doesn't glide: each step appears in turn.

## 1. Launch Day: how the first sums start (replaces hand-off 2, section 4)

Pictures: `01-launch-day-before`, `-1-the-job-first`, `-2-finance-clicks-b2-then-times`, `-3-b3-then-enter`, `-4-how-a-formula-works`, `-5-he-builds-one`, `-6-third-fare-on-paper`, `-7-done-paris-fills-in`.

- **Order: left to right, no columns move.** The three Dublin columns are, as built, the fare below his, his fare (✓ IN YOUR PLAN) and the fare above. B is demonstrated, C he builds, D is on paper. Paris (E) and Your plan (F) fill in at the end. The play-test run had £70, £80, £90; the figures follow his plan.
- **Title** (as built): "Ticket revenue for each flight, at each fare".
- **1 · The job first.** Nothing lit, keys dimmed, every ticket revenue cell blank (B4:E4) and F5, F8, F9 blank; F6 Other costs and F7 Fuel burned (ƒ) show. A Sheet Callout under row 4, pointer up at B4: eyebrow LAUNCH DAY · YOUR JOB; title "Work out the ticket revenue for each flight, at each fare"; "Ticket revenue is the money from selling the tickets: **passengers × fare**. Finance will show you how to build it on the sheet first."; button **Watch ▶**. Nothing starts until he presses it. Footer: "Launch Day · read the job first." (Next ▶ disabled).
- **Keys (new).** The formula bar is shortened (839 px at 1366 wide) and a key row sits to its right: × ÷ + − (40 × 34 each, 18px bold) and **Enter ↵** (78 × 34, 13px bold, 3px bottom edge `#5b88b8`), gap 6px; `#0d2346`, 1px `#2b5c9e`, square. Pressed: `#14457a`, 1px `cyan`, `glow-cyan` (about 0.3 s). Dimmed (opacity .38) when no formula is being built. Keyboard × / * ÷ / / + − and Enter do the same. Undo stays at the end of the formula bar. These keys are used on every sheet from now on.
- **Reference colours (new token `ref-2`, `#b48cff`).** The first cell clicked into a formula is `cyan` (outline, A tag, its name in the bar); the second is `ref-2` violet (outline, B tag, its name in the bar). A third or later cell (week totals) keeps outlines without tags, in `cyan`.
- **2–3 · Finance demonstrates** (lit block B2:B4, B4 the magenta ?). A white pointer moves to B2 and clicks (B2 cyan, tag A, bar "= B2", words "Passengers"); moves to the × key and presses it; to B3 and clicks (B3 violet, tag B, bar "= B2 × B3", words "Passengers × Fare"); to Enter and presses it. About 0.8 s per step. Lines under the grid: "Watch: Finance clicks the passengers, **B2**, then presses **×**." → "Watch: then the fare, **B3**, and Finance presses **Enter**." Footer: "Launch Day · watch Finance build the first formula."
- **4 · How a formula works.** B4 fills (£1,330) with the green light; B2 and B3 keep their coloured outlines; the bar shows "= B2 × B3  Passengers × Fare = £1,330" with B2 cyan and B3 violet. Sheet Callout under the block, pointer up at B4: eyebrow HOW A FORMULA WORKS; title "Finance built a formula"; "**= B2 × B3** means **passengers × fare**. Each cell gets its own colour, so you can see which cell is which." "Pressing **Enter** tells the sheet to work it out. The sheet did the multiplying: **£1,330**."; button **Your turn ▶**.
- **5 · He builds the second** (C2:C4 lit, C4 the magenta ?, keys live). Build signal under C4 (pointer up): "Dublin at £80: the ticket revenue · Click the passengers, press **×**, click the fare. Then press [Enter]. · The sheet works it out. · Nothing to write in your book." Line: "Your turn: build it, then press Enter." + Give me a hint. Formula-only: not counted.
- **6 · The third on paper (Sum 1, counted).** D2:D4 lit, tags A cyan / B violet, bar "= D2 × D3" pre-filled, D4 the input (£, caret). Gold paper signal under D4: "Dublin at £90: the ticket revenue · Work it out in your book. Write [SUM 1] beside it. · Then type your answer in **D4** and press [Enter]." Line: "Type your answer in D4, then press Enter." + Give me a hint.
  - **The hint uses the class method** (Bertie): "£90 is 9 × 10. First work out 19 × 9, then multiply by 10." with Bertie's grid if shown. Never "take the 0 off" or "put the 0 back".
  - The Finance watch panel (long multiplication on the sheet) is removed from Launch Day.
- **7 · Done.** Only now does Finance fill in Paris (E4, ƒ) and Your plan (F5, F8, F9); E4 and F9 light green once. Line: "✓ Every Launch Day sum is done. Finance filled in Paris and your plan: profit **£610** a day." Footer: "Launch Day · done. Next, get ready to fly." with **Ready to fly ▶**.
- **"One flight, two ways" is removed** (rows, sum and Sum 2). Launch Day has **one counted question**.

## 2. Column heads name his flights, and "Why 27?"

Pictures: `02-your-flights-before`, `02-your-flights-why-27`.

- **Route columns' headers** (row 1, 50px tall): top line flag + "your 2 flights" (or "your flight" when he flies it once), 11.5px `text-soft`; main line "Dublin at £110", 14px bold; "✓ IN YOUR PLAN" under it as now. Applies wherever a sheet's columns are his route at a fare.
- **Why 27?** The first time a column shows fewer passengers than the people who want to fly at that fare (with seats to spare), before that column's sum starts: D2 gets the 2px `cyan` ring and a Sheet Callout under the block (pointer up): eyebrow WHY 27?; title "27 of the 30 can catch your flights"; "30 people a day want to fly to Dublin at £110. 27 of them want to go when your **06:00** or **14:15** leaves. The other 3 want a time you don't fly."; **Got it**. Line: "Read the note, then press Got it." Then the column's sum starts as usual. The numbers and flight times are his (route card demand at that fare, his flights' departure times, the engine's catchable count).

## 3. What a fare does, beat 4: the planes move with the slider

Pictures: `03-fare-beat4-before`, `-1-at-70`, `-2-at-110`, `-3-at-140`.

- The LOW FARE and HIGH FARE panels become **one panel** the width of both: eyebrow THE SLIDER'S FARE; the fare in `gold` (40px); "Move the slider: the seats fill and empty as the fare changes."; his two planes as seat plans (as drawn now), side by side.
- As the slider moves (the working slider built on 30 Oct), each plane's seats fill or empty to match (fill from the nose), the counts under the planes change ("19/19 ✓" in `green` when full, otherwise "18 of 19"), and the line under them changes: the crowd and "42 left behind" when people can't get a seat; "2 seats fly empty" / "20 seats fly empty" when seats are empty. The caption at the panel's foot follows ("Planes full · but only **£70** a ticket", "**£110** a ticket · 2 seats fly empty", "**£140** a ticket · but seats fly empty").
- Small "£70" and "£140" labels under the slider's ends. The readout under the slider and "Your challenge…" stay as built. No ticket money is shown: beat 5's question stays his.
- Figures from the briefing's own data in the workbook (the £110 figures in the picture are illustrative).

## 4. After Launch Day: straight into the week

Pictures: `04-after-launch-day-before-home`, `-before-tuesday-sums`, `-1-results`, `-2-plan-check`, `-3-needs-a-look`, `-4-the-week-flies`.

- **No return to Home after Launch Day, and no Close the day.** After take-off and the Operations Wall, he goes to:
- **1 · Launch Day results** (its own page; no menu item selected): title "Launch Day: how it went", sub-line "Monday 2 September · every flight landed"; the five result tiles; the Launch Day Results panel (Revenue − Costs = Profit, projected against actual, route lines); Route Performance; Feedback; a Next panel: "Your plan flies again **every day, Tuesday to Sunday**. First, a quick check of the plan. On Sunday you'll do the week's accounts." Footer: "Launch Day is done." with **Check my plan for the week ▶**.
- **2 · The plan check:** title "Your plan for the rest of week 1", sub-line "Tuesday 3 to Sunday 8 September · the same flights every day".
  - **Left panel, "Your flights, every day":** each flight with its time, flag, route, fare, and Launch Day's seats filled (`green` 80%+, `amber` below).
  - **Right panel, "Before it flies":** checks, one per line. `green` ✓: every flight fits in the day; every flight made money on Launch Day; seats filled (75 of 76). `cyan` ●: people who wanted seats he didn't have (a chance for later, "when you have more seats").
  - **Under them:** "Nothing to work out: Finance keeps the sheet up to date each day."
  - **Footer:** **Change my plan** (opens the timetable) and **Fly Tuesday to Sunday ▶** (go).
- **3 · Something needs a look:** a flight that lost money on Launch Day shows as an `amber` ! line ("**Paris 20:30** lost money on Launch Day: 6 of 19 seats at £140. Change it before the week flies?"). Change my plan becomes the primary button, and the go button reads **Fly it anyway ▶**. What counts as "needs a look" is in the workbook (initially: a flight whose profit was below £0).
- **4 · The week flies:**
  - **Header and controls:** title "Week 1 is flying" and "Your plan, every day, Tuesday to Sunday. Sunday: the week's accounts."; speed **▶ Normal** / **▶▶ Fast**.
  - **Day tiles:** one per day, Tue to Sun. Flown days show `green` edge, "✓ flown" and their profit in `gold`. The day flying now has a `cyan` edge, "flying now · 14:40", a progress bar and "3 of 4 flights out". Waiting days are dimmed.
  - **Panels:** Live Operations, and "So far this week" (profit, seats filled, people who wanted seats you didn't have). The header's date and cash balance update as days complete.
  - **Footer:** "The week runs on its own. Nothing to work out until Sunday." with **Skip to Sunday ⏭**. On Sunday the week 1 accounts open (hand-off 2, section 2).
- **Remove the Tuesday "Week 1 plan" sheet** and its sums (Paris ticket revenue, Sum 4, and the day's profit): his plan hasn't changed, so nothing is worked out again. If he changes the plan at the check, the Studio's Work out my plan works as now.

## 5. Studio and chapter page in chapter one

Pictures: `05-chapter-page-as-built`, `05-studio-as-built`.

- **Chapter page:** keep it as built (Chapter 1, the dates, Begin).
- **View trade-offs and ƒ work it out:** hidden for **all of chapter one** (not only week 1).
- **The capacity tip** under the plan ("Every seat is sold — … another plane, or a bigger one … Test fare"): hidden until the plane shop opens (read the shop's opening day from the workbook).
- **As built, now in DESIGN.md:** Compare aircraft hidden until the shop opens; Service costs hidden; no Choose where to fly page; the **outlined Add a flight tray** (1.5px dashed `cyan` tiles on the lane's background, blue + square, flag, city, time underneath); **swap by dragging** one flight onto another on the same plane.

## 6. Everything after week 1 moves along a week (Bertie, 30 Oct)

- Bertie: Launch Day runs straight into week 1 on his plan, and **everything that starts after week 1 moves along by one week**. For example:
  - the Fuel desk (week 2 → week 3);
  - the what-if fare sheet;
  - Cash, tank, profit;
  - the weekday / weekend upgrade;
  - the plane shop (day 15 → day 22);
  - the four new routes (week 3 → week 4);
  - the question schedule (P2 onwards).
- **Fable updates the workbook** (start weeks and days, PauseSchedule, the spreadsheet ladder if it moves). Claude Code: read every start week and day from the workbook, don't hard-code them, and keep v6.2's timings until the update arrives. The chapter still ends on Sat 28 Dec 2030.
- Screens and pictures that name "week 2" or "week 3" (hand-off 2) mean "the week it starts", from the workbook.

## 7. Briefings: the master plan

- The Cowork document **Operations Briefings — scene by scene** is the master plan (Settings `briefingPlanMaster`, Briefings `coworkNumber`). Ignore any other briefing plan.
- **In this build:** 1 How an airline makes money · 2 What a fare does · 3 Cash, tank, profit · 5 Time of day matters · 7 Two planes, one route · 8 Can I afford the plane and still run the airline? · 9 Weekdays and weekends · 12 A year of demand.
- **The Briefings shelf** (teacher test mode, hand-off 2 section 8) lists these as IN PLAY; 4 Customers have a choice, 6 A forecast isn't a promise, 10 How long will it take? and 11 One big Saturday as PARKED; "Eight in ten stay" as TEST ONLY while it is in the workbook. 13 and 14 (chapters 2 and 3) are not listed.

## 8. Workbook (for Fable)

| Where | What |
|---|---|
| SheetSums, Launch Day | Column B: demonstrated (formula, game builds it). Column C: formula (he builds; not counted). Column D: book, Sum 1 (counted). Paris and Your plan: ƒ, filled after D. Remove "One flight, two ways" (rows and Sum 2) and renumber later Sums. |
| Hints | Paper hints use the class method: "£n0 is n × 10. First work out p × n, then multiply by 10." |
| Screen text | The job-first callout, the demonstration lines, HOW A FORMULA WORKS, the build and paper signals, WHY 27?, the results, plan check and week-flies screens. |
| Plan check | What counts as "needs a look" (initially a flight with profit below £0 on its last day). |
| Week 1 plan sheet (Tue 3 Sep) | Remove its sums (Paris ticket revenue, Sum 4; the day's profit). |
| Start weeks and days | Everything after week 1 moves along a week (section 6), including PauseSchedule P2 onwards and the plane shop day. |
| Briefings | Status per briefing from the master plan (section 7). |

## 9. Open (Bertie and Fable; don't decide in code)

- **Week 1 now has very few counted questions:** one on Launch Day (the paper sum), none on Tuesday, and none at pause P1 (the what-if sheet is free to try, hand-off 2). Fable to propose what, if anything, is asked at P1, after Bertie's say. Build with what the workbook says and report the counts.

## 10. What to check in the next play-test

- Does he wait for Watch, follow the pointer, and then build C4 with the keys or the keyboard, pressing Enter by himself?
- Do the two colours help him see which cell is which?
- Does WHY 27? make sense to him, and does he notice "your 2 flights"?
- On the fare briefing, does he try both ends of the slider and see the planes change?
- After Launch Day: does the plan check read quickly, and does he fly the week without going back to the Studio unless something needs a look?
- Does moving later things along a week leave week 2 feeling empty? (Note it for Bertie.)
