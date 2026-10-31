# Report: chapter one after the 17:37 play notes (31 Oct 2026, evening)

Claude Design's hand-off "Chapter one after the 17:37 play notes" (eight screens Bertie approved: "a big improvement towards what I think I want") is built into the chapter-one game, `airline-opening-prototype.html`.

The hand-off itself (READ-FIRST, DESIGN.md and the 24 pictures) is in `data/incoming/handoff-1737-31-oct/`. DESIGN.md at the repo root is installed from it.

Everything is behind `ch1()`. `airline-opening-full.html` is untouched.

The screenshots, taken at 1366 × 768 in TEST mode, are in `docs/screenshots/handoff-1737/` (29 PNGs).

## The workbook

- `data/Airline-World-Workbook.xlsx` is Fable's v6.6 plus the rows written by `tools/merge_1737.py`, imported by `tools/import_world.py`.
- **Settings:**
  - `why27Callout` off (L3);
  - `launchExampleColumn` "revenue 900 | other 525 | fuel 120": Fable's `financeExampleFigures` (£900 − £645 = £255), set out as the sheet's rows;
  - `routeColourDefault` #4a6f99;
  - `twoPlansMaxPlanes` 1.
- **The demo pace** uses Fable's v6.6 rows, `demoFirstClickDelay` (1.5 s) and `demoStepGap` (1.2 s). The hand-off calls them `demoPauseMs` and `demoStepMs`.
- **Routes:** a new `colour` column. Dublin is #2d7f68, Paris #3b6aa8 and Frankfurt #7a5aa8, as on the pictures. The other routes take `routeColourDefault`. Fable to set them.
- **Briefings:** `fare_lever`'s trigger is "Briefings shelf only in chapter one" (L2). It no longer opens by itself on Launch Day.
- **ScreenText:** the words of the eight screens, as on the pictures:
  - `fra.eve.*`, `tp.*`, `ba.*`, `chg3.*`, `ld3.*`;
  - `wk1.co.*`, `wk1.avg.*`, `wi2.*`, `home.now.week`.

  These rows are new since the first pass. Most take their words from the pictures; the week ones are written for this build:
  - `ba.table.note`, `ba.bracket`;
  - `chg3.diff.line`, `chg3.diff.sign`;
  - `ld3.line`;
  - the week versions: `tp.co1.week`, `tp.co2.week`, `ba.co1.week`, `ba.co3.than.week`.

  Fable to check all of them.

## What was built (`src/opening/parts/p6i_1737.js`, `p1_head_c3.css`; small hooks in p5f, p6b, p6g, p6h)

| § | Screen | As built |
|---|---|---|
| 1 | Frankfurt evening | The Day page leads with the news. Its lower half becomes the NEW ROUTE panel, with Fable's `frankfurt.card` words and his %: profit ÷ the best plan's profit, rounded down, capped at 100. It has the departures board, two chips, the rule line and the small print. The footer has one button, **Plan tomorrow with Frankfurt ▶**. The separate Frankfurt card is gone. |
| 2 | Two plans, then Choose | Every Change my plan in week 1, the Frankfurt evening, and from week 2 **Edit plan** on the week's opener ("Plan week 2", LAST WEEK'S PLAN on top; ◀ Back returns to the opener): <br>• TODAY'S PLAN at 60%, read only; NEW PLAN empty with "Drag a flight here"; <br>• the choice column with each plan's profit a day and **Choose ▶**; the COMPARE bar; <br>• the callouts 1 of 2 and 2 of 2, once each; <br>• no Mon–Fri / Sat–Sun and no Compare with last week in week 1; <br>• ◀ Back to the Day page. <br>Choosing today's plan flies it, with no sums. Choosing the new plan opens Before / after. The drop outline is always on a plane's lane (L1, Launch Day too). |
| 3 | Before / after | Opens by itself, before any sums. The tab sits between Week 1 and Changes. <br>• The graph: stacked bars by route group (route colour, flag, profit a day); the plane's fixed costs are shared by flight, so the groups add up to the total; the totals; a dashed gold line at the old total. <br>• Four callouts with Next ▸. The fourth adds the green bracket with "+£487 a day" and the small ƒ table "What changes, a day". <br>**Work it out ▶** (or the Changes tab) opens the Changes sheet. ◀ Back returns to the two plans, with both plans kept. |
| 4 | Changes sheet | **First, the new route:** <br>• all ƒ, with the callout "1 of n" under the table and D6 ringed; <br>• then **Next: Paris ▸**. <br>**Then, the first change he works:** <br>• the "What the Difference column means" callout (2 of n) comes before the demo, under the table, inside the panel; <br>• the whole Difference column is ringed, and nothing is lit until Watch ▶. <br>**Heads:** "Today's plan" (week 1) or "Last week", then "With your change", then "change − today's". The main lines name the flights. "Now" becomes "Today's plan" in every word of the sum: the formula bar, the signal and the line. |
| 5 | Launch Day | After the ticket sums: <br>1. the profit callout (Watch ▶), with nothing lit; <br>2. Finance builds G9 = G5 − G8 on the example column G (made-up figures, dashed, striped); <br>3. he builds his own F9: built, not counted. <br>The columns are narrowed so G fits at 1366. |
| 6 | Week 1 Sunday | Nothing starts on arrival (S1). <br>• A callout for each method, under its example sheet and inside its frame: "1 of 2 add each day", then "2 of 2 Σ SUM" (S2, S3). <br>• Finance works the average a day on the left sheet with the pointer, after Watch ▶ (S4). <br>• Then he works it on the Σ SUM sheet. |
| 7 | Week 2 what-if | On Monday 9 Sep (`whatIfSheetFromDay`), the what-if sheet comes first, before the plan. <br>• His fare and +£3 (`whatIfQuestionStep`) sit side by side, on his busiest route. <br>• Callout 1 of 4 (Watch ▶), then Finance's B4 = B2 × B3. <br>• His C4 on paper (counted, `pq:whatIfFirst:8`), then his D5 = D4 × 7 on paper (counted, `pq:whatIfWeek:8`). <br>• The month row (× 4 weeks) glows, with callout 4 of 4 and **Try other fares**. <br>**Set my fares ▶** opens the plan. There is no text panel. |
| 8 | Code only | • L2 and L3 as above. <br>• Demo pace: Watch ▶, then a pause of about 1.5 s; the pointer glides from the Watch button to the first cell, then about 1.2 s a step. <br>• Home's NOW strip in weeks 2–5 reads "Week 2: your plan flies again". <br>• S5: Home in week 2 brings nothing new with callouts, so it is unchanged (Bertie's rule). |

## Decisions and differences to check

1. **"Today's plan", not "Yesterday".**
   - Fable's v6.6 `changes.head.week1` says "Yesterday".
   - The hand-off and DESIGN.md say "Today's plan", because the sheet is worked on the evening the plan flew. The game uses "Today's plan".
   - Fable's word is kept in the row's notes.
2. **The flights the new route replaced** (Changes sheet, part 1).
   - The game uses the routes the new plan no longer flies (Dublin ×2), as on the picture.
   - "By time" would also take the Paris flights that Frankfurt's afternoon flight overlaps. But Paris stays in the plan and has its own part next.
   - When no route is dropped, part 1 says the new route took time the plane had free (`chg3.route.free`).
3. **Paris's part keeps the sheet's step-by-step model.**
   - "With your change" is today's Paris flights at the new fare ("Paris ×2 · £110"). The drop from two Paris flights to one is in the last part, the whole plan.
   - The picture shows "Paris ×1 · £110" on this part.
4. **Two plans with one plane** (`twoPlansMaxPlanes` 1).
   - From week 2, Edit plan on the week's opener opens the same screen. The top lane is "Last week's plan", the title is "Plan week 2" and the footer says "Choose the plan that flies this week".
   - Choosing last week's plan carries on with no sums. Choosing the new plan opens Before / after, then the Changes sheet.
   - With two planes, the timetable stays as it was, until Claude Design draws two lanes a plan (hand-off section 10, Later).
5. **The what-if step moved before Monday 9 Sep's plan.**
   - It used to come after the plan's sums.
   - Any other question due that day still comes after the plan's sums, as before.
6. **Launch Day example figures.** They are Fable's (£900, £645, £255), not the picture's (£5,000, £3,500, £1,500).
7. **◀ Back on the two plans on the Launch Day evening.** The day has already turned, so Back draws that evening's Day page again, with its Frankfurt panel and the board of the flights that flew. The new plan in progress is kept.
8. **Frankfurt's %.** It is 100% when his plan is the best plan the engine finds, which is the case with auto-plan. Fable's words have no "optimal".

## Tests

- `chapter1.test.js` and `numbers.test.js`, results below.
- `numbers.test.js` now presses Sunday's **Watch ▶** before it waits for My turn (S1: nothing starts on arrival).
- Play-tests of each section, with the screenshots in `docs/screenshots/handoff-1737/`:
  - Launch Day → Frankfurt evening → two plans → Choose → Before / after → Changes;
  - Back → Day page → two plans → choose today's plan;
  - Launch Day's profit;
  - Sunday from the c1p1 jump;
  - Monday 9 Sep's what-if sheet;
  - week 2's two plans: Edit plan → Back → Edit plan → Choose the new plan → Before / after → Changes, and Edit plan → Choose last week's plan.

## What to check in the next play-test (hand-off section 11)

- Does he build a new plan rather than choosing today's straight away? Does the compare bar change his choice?
- Does Before / after's Frankfurt callout stop "the money's gone down"?
- Does the Watch ▶ pause feel right?
- Does the month row land ("£3 more a ticket = £3,192 more a month")?
- Week 1 Sunday: does he copy the average after watching Finance do it on the other sheet?
