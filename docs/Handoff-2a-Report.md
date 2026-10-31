# Hand-off 2a and workbook v6.5: what is in the game (31 Oct 2026)

Claude Design's hand-off 2a (screens) and Fable's workbook v6.5 (2b, data), both from 31 Oct 2026. They are in `data/incoming/handoff-2a-31-oct/`. Chapter one only: everything is behind `ch1()`, and `airline-opening-full.html` is untouched. The new code is `src/opening/parts/p6h_daily.js` and `p1_head_c2.css`. Every word comes from the workbook's ScreenText sheet.

Screenshots are in `docs/screenshots/handoff2a/`, taken at 1366 × 768. As Bertie asked, the five-pupil run-throughs were not re-run; he is playing it by hand.

## How to run it

```
python3 tools/merge_v65.py data/incoming/handoff-2a-31-oct/Airline-World-Workbook-v6.5.xlsx   # idempotent
python3 tools/import_world.py                                                                 # 0 to fix
python3 src/opening/build.py
```

Checks: `src/opening/tests/chapter1.test.js` and `numbers.test.js`.

## Data (v6.5)

`tools/merge_v65.py` merges v6.5 into the game's workbook.

- **Settings changed:** `spreadsheetLadder`, `weekSpeed` (Fast by default), `weekOneAfterLaunch`, `midweekQuestions`.
- **Settings added:** `dailyChangeDays` 2-6, `dailyChangeCountedPerDay`, `dailyChangeCountedWeek`, `dailyKeepCounted`, `fullPlaneNudge`, `weekOneCountedTotal`, `thirdRouteId` fra, `thirdRouteRule`, `thirdRouteEarliest`, `thirdRouteLatest`, `thirdRouteCard`, `keptPlanMondaySum`.
- **Routes:** Frankfurt's distance, base fare, demand at each fare and story. Its fare options are rebuilt from the demand row (£110 to £170): the old list had fares with no demand, which the importer flagged.
- **Other sheets:** Roadmap week 4, PauseSchedule P1, README lines.
- **ScreenText:** new rows for each screen below, plus `cmp.*` for the week 2 comparison. The week 1 example rows were rewritten for Σ SUM.

## The screens

1. **The Day page** (Launch Day, and Tue 3 to Sat 7 Sep). It replaces the Launch Day results page, the plan check and "Week 1 is flying".
   - Profit today against yesterday, and the routes table with More detail (a drawer from the right).
   - One sentence reading the day: a loss; empty seats where a lower fare earns more; an idle plane; full flights where £10 more earns more; a good day; otherwise a plain line. Saturday and Sunday add the weekend line.
   - Tomorrow's timeline, then Keep for tomorrow / Change my plan. On a loss day, Change is the main button and Keep reads "Fly anyway".
   - Sunday flies, then the Sunday review. The week flies on Fast by default (`weekSpeed`), in every week of chapter one.
2. **The daily change.** Change my plan opens the timetable, then the Changes sheet:
   - Finance demonstrates the fare difference (D4) the first time only;
   - he builds the difference a day (D5, not counted);
   - he works the week (D6, × 7) on paper, counted against `dailyChangeCountedPerDay` and `dailyChangeCountedWeek`. Past the allowance, Finance fills D6.
   - The last button reads "Fly tomorrow ▶".
3. **Frankfurt.**
   - It is earned on a near-optimum day (`thirdRouteRule`, see below), no earlier than `thirdRouteEarliest`, in week 1.
   - The departures-board card shows that evening, with "Plan tomorrow ▶".
   - Frankfurt joins the tray from the evening it is earned. Its round trip is 5 h 05 in the engine, and the timetable says when it doesn't fit ("Doesn't fit today: it would be back at …").
4. **Launch Day's profit demonstration** (P5 − P8 into P9, shown once). On every sheet, **Next sum ▸** now sits beside the answer, with a pause before it moves on; the footer only leaves the page.
5. **Week 1 Sunday.**
   - One panel with one formula bar. Finance's Monday-to-Wednesday example is on the left and his week on the right.
   - Finance presses Σ SUM, drags B2:B4 and presses Enter; the bar then shows `=SUM(B2:B4)`. His sheet is dimmed while Finance works.
   - My turn: he does Σ SUM on the whole week, then the average a day.
   - The signal runs full width under the panel, and the fuel news line moves under What happened.
   - **Seven reference colours** in click order on every sheet (cyan, then `ref-2` to `ref-7`): outline, tag and name in the bar.
6. **Weeks 2–4 Monday after a change:** "Week N plan: what changed from last week".
   - Last week (a weekday, as flown) · This week (ƒ) · Difference (ƒ, coloured by meaning), plus a tab of its own. No sums.
   - Ready to fly ▶ goes to the plan check, then the week.
7. **Ready for launch:** "Check the plan. Press **Send to Operations Wall** when it is right."
8. **Fixes:**
   - **Week 2 opener:** Average fare and Projected profit now show (£85, £1,958 a day in the test run). They were hidden as Monday sums that no longer exist.
   - **Home's fuel alerts:** no tank alert while fuel is bought as it is used and the Fuel desk is locked. "Last week" is the price on the last day flown, so the opener and Home both say week 1 ended at **£1.40**. The Calendar has £1.20 Mon–Tue, £1.30 Wed–Thu and £1.40 Fri–Sun.
   - **"New destination":** only on the day a route first flies. Paris (flown on Launch Day) no longer triggers it; Frankfurt does, on its first day.
   - **The Launch Day clock** reads Mon 2 Sep (the live show had numbered Launch Day as day 0, Sun 1 Sep).

## Bugs found and fixed while testing

- **Weeks 2–4, Changes sheet:** after D5, Next sum pressed a footer button that had just been disabled, so D6 never came and the pupil was stuck. Next sum now moves on directly.
- **Reload during Finance's Σ SUM demonstration:** a "running" flag was kept in the save, so after a reload the demonstration never restarted and the page could not go on. The flag is now kept out of the save.
- **Average a day:** the line under the sheet said "work it out in your book", but it is a formula the sheet works out. It now reads ScreenText `review.average.card` ("Click the two cells. The sheet works it out."), in every week.
- **The teacher's Run (test mode):** it now plays through the new screens:
  - it presses Keep for tomorrow on the Day page;
  - it presses Plan tomorrow on the Frankfurt card, and Ready to fly on the comparison;
  - it presses My turn once Finance has shown Σ SUM, which happens without the animation during a Run.

  This uses a small hook in `p5g_testkit.js` (`window.__tkPre`), because the toolkit's own functions sit inside a block that later parts can't reach.
- **Tests:** `chapter1.test.js` and `numbers.test.js` now expect the Day page, with no plan check or Home in week 1. The numbers test opens More detail for Launch Day's revenue and costs, and reads his own week, not Finance's example, on Sunday.

## Checks

- **`chapter1.test.js`: 38 ok, 0 failed.** It covers:
  - Launch Day and Tuesday to Saturday end on the Day page, with no plan check and no Home in week 1;
  - two daily-change questions counted in week 1, within the allowance of three;
  - never more than two questions a pause, from Launch Day to the chapter-one review on day 118;
  - in the keep-his-plan run: week 2 quiet, the Fuel desk and what-if sheet on day 15, the shop and the routes on day 22, Madrid on day 29;
  - the jumps load.
- **`numbers.test.js`: 38 ok, 0 failed.** Every figure traces to the workbook, and week 1 agrees on the board, the Day page, the Sunday sheet, the ledger and the cash.
- The chapter 2–4 tests were not run (CLAUDE.md), and `airline-opening-full.html` was not rebuilt.

## Where v6.5 and hand-off 2a disagree, and what the game does

The rule is that screens come from the hand-off and logic from the workbook. These are the places where the two disagree.

| # | Hand-off 2a | Workbook v6.5 | In the game | Who should look |
|---|---|---|---|---|
| 1 | Frankfurt arrives "after his first good day and by Thursday at the latest" | `thirdRouteRule` nearOptimumDay; `thirdRouteLatest` "none in week 1" | nearOptimumDay: every flight covers its costs, seats ≥ 80%, profit ≥ 85% of the best plan that day. A pupil who never gets close never sees Frankfurt in week 1 | Fable: a fallback day? |
| 2 | A pupil who kept his plan does one fuel-rise sum on Monday (D4) | `keptPlanMondaySum` none | No sum. A kept plan goes straight to the plan check, as in 1c | Bertie |
| 3 | The counted sum is the × 7 on paper (D6) | The Settings note says the built difference | D6 on paper, counted; D5 built, not counted | Fable |
| 4 | Week 1: Finance shows Σ SUM, he uses it | `spreadsheetLadder`: "he clicks each day into the total, then is shown Σ SUM … side by side" | Hand-off 2a (it says it replaces the clicking) | Fable: update the ladder text |
| 5 | The Day page replaces the plan check in week 1 | `weekOneAfterLaunch` says "the plan check, then each day flies" | No plan check in week 1 (hand-off) | Fable: update the text |
| 6 | Week 2 fuel note "£1.20 → £1.47", and 27p in the kept-plan signal | Calendar: week 1 ends at £1.40 | £1.40 → £1.47 (7p). The workbook's prices are what the pupil paid | Claude Design: the picture |
| 7 | Frankfurt round trip 5 h 15 (design), 4⅓ h (Fable's story) | The engine works it from distance and speed: 5 h 05 | 5 h 05 | Fable: the story text |

## Not changed

- The open items in section 10.
- Take-off before the HQ departure boards (parked by Bertie).
- The full game file.

## After Bertie played it (31 Oct 2026, no hand-off)

- **Frankfurt pays already, in Fable's v6.5 figures; nothing was changed.** Checked on a weekday in week 1 by trying every plan of up to four flights at every fare:
  - the best Dublin and Paris plan makes about **£2,855** a day;
  - Frankfurt–Paris–Frankfurt at £150 and £110 (06:00, 11:40, 15:00) makes about **£3,429**, so about £570 more;
  - Frankfurt, Dublin and Paris at £160–170 for Frankfurt makes about £3,200.

  At Frankfurt's base fare (£140) the best is Frankfurt–Frankfurt–Paris at about £3,049. Bertie hadn't seen that two Frankfurts and a Paris fit in a day; the old plan above the new one now makes that easier to see.
- **The Day page stops only for a clear gain** (Settings `dailyPauseGain`, £200 — new, for Fable to confirm).
  - On Tuesday to Saturday, the game works out the best plan it knows for tomorrow: the planner's best plan, or his own flights at better fares.
  - If that beats his plan by less than £200 a day, the day flies on without stopping.
  - Launch Day's Day page always stops, and a Frankfurt card still shows when it is earned.
- **The old plan stays in view while he changes it.** The timetable shows yesterday's plan (last week's from week 2) as a dashed, read-only lane above the plane's lane, with its fares and seats filled.
  - Hide the old plan / Show the old plan.
  - Start again from the old plan puts it back.
- **Before / after:** a new tab on the Changes sheet, the week 2–4 comparison and itself.
  - Once every change is worked out, it shows the whole old plan and the whole new plan as one sheet: each route's passengers and ticket revenue, flights, ticket revenue, fuel, total costs and profit a day. All of it is Finance's (ƒ), with the difference.
  - Before the sums are done, the tab is greyed out.
- **Fixed:** with two changes on the sheet, where Finance filled the second, Fly tomorrow went back to the first change and never left. Going on now passes every change already worked out.
- **Words:** in ScreenText `plan2.*` (new rows, for Fable).

## Week 1 Sunday changed again (31 Oct 2026, evening hand-off)

Claude Design's hand-off 2a was updated that evening, after Bertie's check of the Sunday review: section 5 now has him **add each day first, then Σ SUM**, side by side. Nothing else in the hand-off changed. The updated hand-off is in `data/incoming/handoff-2a-31-oct-evening/` (READ-FIRST, DESIGN.md, the five section 5 pictures and the sheet kit); `DESIGN.md` is installed from it. This replaces item 5 under "The screens" above.

One sheet panel, one formula bar, two spreadsheets: left **1 · Add each day**, right **2 · Use Σ SUM** (the method, numbered, in each sheet's A1 cell). Five stages:

1. **Finance adds Monday to Wednesday** on the left (the example look): the pointer clicks B2, presses +, B3, +, B4, Enter; the cells take cyan, violet and coral. The right side is a dashed box: "Next: a quicker way".
2. **He adds every day** on the left, which lengthens into YOUR WEEK (Monday to Sunday and Profit this week only). The line counts as he goes: "Monday to Thursday so far. Keep going to Sunday."
3. **Finance shows Σ SUM** on the right example. His total stays on the left, with a green outline, dimmed to .45, under "✓ The whole week: £… Seven clicks, six + signs."
4. **He uses Σ SUM** on the right, which lengthens into YOUR WEEK: Σ SUM, drag Monday to Sunday, Enter.
5. **Same answer, then the average:** the left reads "✓ Adding each day: £…" at full strength, the right "✓ Σ SUM: £…. The same answer, in one drag."; then Average a day on the right; the done callouts; **Plan week 2 ▶**.

- All four totals are built on the sheet and not counted; nothing goes in his book.
- **How it is built:** the stages reuse the ladder's "show" week (click, then Σ SUM, then the average), which week 1 now is; from week 2 Σ SUM by dragging. Settings `spreadsheetLadder` already said this, so it is unchanged. Code: `p6h_daily.js` section 5 (`c2Stage`), a small hook in `p6b_signal.js` (`c1ExNow`: Finance's example now shows twice) and `p1_head_c2.css`.
- **Words:** ScreenText `wk1.*`, added by `tools/merge_wk1_sunday.py`.
- **Under reduced motion** the sheets don't lengthen and the pointer doesn't glide. During the teacher's Run both demonstrations jump to the end, and My turn is pressed for him.
- **One difference from the pictures:** picture 5 says "press +" for Average a day; the text says ÷, and the game uses ÷.
- Screenshots: `docs/screenshots/handoff2a/05-week1-sunday-1-…` to `-6-done`, taken from the P1 save (Sun 8 Sep). Figures are TEST Air's: £18,635 for the week.
