# Hand-over: the what-if fare sheet in week 2 (31 Oct 2026, evening)

Bertie's change after reading the chapter-one plan to week 8, with no hand-off from Claude Design or Fable. Chapter one only, behind `ch1()`; `airline-opening-full.html` is untouched. Nothing on screen is new: the what-if fare sheet, its callout and its pause questions are the ones from hand-off 2 (section 5), moved to week 2 and given £1 steps, a week and a month. The data is in the workbook (`tools/merge_whatif_week2.py`), so the game still runs from the workbook. A copy of this hand-over is the Claude Doc "Hand-over: the what-if fare sheet in week 2".

Screenshots: `docs/screenshots/whatif-week2/`, 1366 × 768, a TEST airline that kept Launch Day's plan (Dublin ×2 at £90, Paris ×2 at £100).

## What Bertie asked for

Week 1 is now a whole week of settling the plan (the Day pages, hand-off 2a), so week 2 can be the what-if week: the what-if fare sheet opens on Monday 9 September with fares that move a pound at a time, not to the nearest £5, so a pupil who chose £90 sees what £93 does, over a day, a week and a month. "A little bit of money can make a big difference over a period of time." The Fuel desk stays in week 3. Also the Market headlines that were out of date after the week shift.

## What moved

| | Before (v6.5, 31 Oct midday) | Now |
| --- | --- | --- |
| Week 2 (Mon 9 Sep, day 8) | A quiet week: the plan check, then the week flies. P1 asks nothing | **The what-if fare sheet** opens (`whatIfSheetFromDay` 8). P1 asks its two sums: seats filled × fare at his fare + £3, then more a day × 7 |
| Week 3 (Mon 16 Sep, day 15) | The what-if sheet and the Fuel desk. P2: the what-if first sum and the modelling question | **The Fuel desk** (unchanged, `fuelDeskFromDay` 15). P2: the modelling question and the first rotating review question |
| Week 4 (day 22) | P3: time to afford, the first rotating question | P3: time to afford, a rotating question (unchanged otherwise) |
| Market week 2 headline | "Four new destinations and a second aircraft. Red Kite flies from Luton." | "A quiet week: your plan flies again. Try a fare on the what-if sheet. Red Kite flies from Luton." |
| Market week 3 headline | "Madrid opens: the first medium-haul route." | "The Fuel desk opens: buy fuel ahead." |
| Market week 8 headline | "Fuel back down to £1.90." (the price is £2.43) | "Fuel back down to £2.43." |

The rotating review question moved up from P3 to P2 so that P2 still asks two questions (Bertie's rule of two at every pause). If Fable would rather P2 asked something else in that slot, it is one cell in PauseSchedule and one word in the Calendar's `gatedCalc` for day 15.

## The what-if fare sheet now

- **£1 steps.** − and + move a fare by Settings `whatIfFareStep` (£1), between the route's lowest and highest fare option (Dublin £70 to £110). Demand at a fare between two in the route's table is in proportion (`tableAt`, as the numbers test already allowed for). Everywhere else fares stay on the route's fare options.
- **A day, a week, a month.** Under the routes the sheet has three total rows, all ƒ: *Both routes, a day*, *A week (× 7)* and *A month (× 4 weeks)* (`whatIfMonthDays` 28, so the sums stay whole). What changed says, for each fare he moved and for the total: "£114 more a day · £798 more a week · £3,192 more a month".
- **Set my fares** puts the exact fare (£93) in the plan. Two older rules that snapped a fare not on the route's list back to the base fare or the nearest option (`syncRoutesToHome`, `typeSnap`) now leave a what-if fare alone in chapter one, while it lies between the route's lowest and highest option. The Changes sheet then works the change as his own sum (+£114 × 7), which takes a P1 slot first (countingPriority), so only one of Finance's what-if questions follows.
- **The two counted questions on day 8** (PauseSchedule P1), asked before the week flies:
  1. *What if Dublin were £93?* Seats filled × fare on his busiest route at his fare + `whatIfQuestionStep` (£3): 38 × £93 = £3,534 a day.
  2. *£93 instead of £90: what is that worth in a week?* More ticket money a day (ƒ, £114) × 7 = £798. The done line says what a month comes to and points at the sheet.
- The first-visit callout now says "£1 at a time … for a day, a week and a month".

## The workbook (for Fable to check)

`tools/merge_whatif_week2.py` made these changes; running it again changes nothing. Every figure can be changed there or in the sheet and re-imported (`python3 tools/import_world.py`, then `python3 src/opening/build.py`).

| Sheet | Row | Change |
| --- | --- | --- |
| Settings | `whatIfSheetFromDay` | 15 → **8** |
| Settings | `whatIfFareStep` | new, **1** (£ a step on the what-if sheet) |
| Settings | `whatIfQuestionStep` | new, **3** (the first question tries his fare + £3) |
| Settings | `whatIfMonthDays` | new, **28** (a month on the sheet is four weeks) |
| Calendar | day 8 | title "Week 2: the what-if fare sheet"; headline; unlocks; `gatedCalc` = `whatIfFirst,whatIfWeek` |
| Calendar | day 15 | title "Week 3: the Fuel desk"; headline; unlocks; `gatedCalc` = `modelChange,reviewRotation` |
| Roadmap | Week 2 | new row, day 8: "The what-if fare sheet: a few pounds on a fare, over a day, a week and a month" |
| Roadmap | Week 3 | "The Fuel desk: buy fuel ahead" |
| PauseSchedule | P1 | question 1: the what-if first sum; question 2: a week (more a day × 7); notes |
| PauseSchedule | P2 | question 1: the modelling question; question 2: the rotating review question (first); notes |
| PauseSchedule | P3 | question 2: "Rotating review question" (no longer the first) |
| Market | weeks 2, 3, 8 | the headlines above |
| ScreenText | `whatif.first` | the callout's words (£1 at a time; a day, a week, a month) |
| ScreenText | `whatif.rows` | new: the three total rows' labels |
| ScreenText | `whatif.more` | new: "{d} a day · {w} a week · {m} a month" |
| ScreenText | `pauseq.whatIfFirst` | "£1 at a time"; notes: P1 (was P2) |
| ScreenText | `pauseq.whatIfWeek` | new: the second question's words |
| README | | one line |

## Worked example (Fable's figures)

Dublin's table: £90 → 62 people, £100 → 44. At £93, 62 − 18 × 3⁄10 = 56.6 → 57 want to fly; two Twin Otter flights carry 38 either way, so the plane stays full.

| | £90 | £93 | Difference |
| --- | --- | --- | --- |
| Ticket revenue a day (38 × fare) | £3,420 | £3,534 | £114 |
| Profit a day | £951 | £1,065 | £114 |
| A week (× 7) | £6,657 | £7,455 | £798 |
| A month (× 4 weeks) | £26,628 | £29,820 | £3,192 |

Both routes: £2,528 → £2,642 a day; £18,494 a week; £73,976 a month at £93.

## For Fable to confirm or change

1. `whatIfFareStep` £1, `whatIfQuestionStep` £3, `whatIfMonthDays` 28 (a calendar month would be 30; four weeks keeps "× 7 then × 4").
2. P2's second question: the first rotating review question moved up from P3. Another choice goes in PauseSchedule P2 and the Calendar's day-15 `gatedCalc`.
3. The what-if second question uses *more ticket money a day* (not profit), to stay on the first question's figure; the sheet shows profit for the week and the month.
4. The Calendar's day-8 and day-15 titles and headlines are mine; the words are on Home's Coming up strip and the week opener.
5. Settings `spreadsheetLadder` and `weekOneAfterLaunch` still describe the old week 1 (from the chapter-one plan's open points).

## Checks

- **`chapter1.test.js`: 39 ok, 0 failed.** Week 2 ends Monday with the two what-if questions (`pq:whatIfFirst:8` 38 × £93, `pq:whatIfWeek:8` £114 × 7), then the plan check and the week; the Fuel desk first opens on day 15; a pupil who keeps his plan gets two counted questions at every pause from P1; the Roadmap's NEXT on day 8 is the Fuel desk.
- **`numbers.test.js`: 38 ok, 0 failed.**
- A hand-driven run on the P1 jump (Sun 8 Sep): the sheet, Set my fares (£93 in the plan, the week flies at £93), the Changes sheet's +£114 × 7, and the questions, with no page errors.
- The chapter 2–4 tests were not run (CLAUDE.md), and `airline-opening-full.html` was not rebuilt. The two fare-snap rules changed in `p4h_world.js` and `p4zj_types.js` only differ when `c1FareFree` is true, which needs `ch1()` and `whatIfFareStep`.
