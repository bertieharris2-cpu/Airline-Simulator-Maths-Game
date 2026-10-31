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
