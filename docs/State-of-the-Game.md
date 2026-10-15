# State of the Game

*Read from the code and data on 6 Oct 2026, after the chapter-1 build on workbook v4.2. "The game" means the active opening prototype: `src/opening/` → `airline-opening-prototype.html`. The full game (`airline-simulator.html`, identical to `airline-simulator-full-reference.html`) is frozen and only appears in section 4. File references are under `src/opening/parts/`.*

**How the statuses were checked.**
- **Working:** used in the current flow and passing the automated tests:
  - `opening.test.js`: chapter 1 end to end at 1366×768 (Launch Day to the chapter accounts on 28 December), and to day 15 at 1915×891;
  - `balance.test.js` (Balance Reports v2–v4.1) and `engine.test.js` (game = engine on eight plans);
  - `liveops.test.js` and `answers.test.js` to week 1.
- **Bugs marked "verified":** reproduced in a browser or by a test.
- **All other bugs:** from reading the code.

## 0q. Decision support (Workbook v5.7, D87 and D88, 15 Oct 2026)

**`p4zt_decide.js`**, after `p4zr`. Reassignment only, so `overrides.txt` stays at 120. Notes for Fable: `docs/Decision-Support-Notes.md`. Test: `decide.test.js`, on NBN's and Gubby's saves.
- **Tips.**
  - `PLAN_TIPS_DEFAULT` gains `plane_unused`, `loss_making_service` and `plan_loses_money`.
  - A `planTipsFor` wrapper adds their conditions and drops `idle_plane` for a plane with no flights.
  - `dsTarget` reads each tip's route, band, aircraft and flight.
  - `dsStake` prices it from the engine's own alternatives (`dsAlt` on cloned plans, inside `dryRun`).
  - `dsTips` ranks by priority, then stake, and is cached on the plan key.
- **The check (`dsCheck`, `dsAfterPlan` on an `R.plan` wrapper).**
  - The opener card holds two lines above Keep plan; on the plan, the bar holds one.
  - The action buttons go through `dsDo`: select the flight, shade the band, pick out the aircraft's row, or open the fare editor.
  - The go buttons are quiet ("Run anyway" in the opener) while a priority 0–1 tip shows.
  - `S.ds.log` records the actions, the runs anyway and the fixes.
- **Changes.**
  - A `setPlan` wrapper on the plan page records the before and after: the floating line, and D88's `dsWorth` (fare, time, service). The first change of each kind is a Build (`S.ds.built`).
  - A `bindTimeline` wrapper updates a dragged block's label from `dsFillAt`.
  - Plan improved and the worth line go in the summary bar. `dsChips` puts the fare chips in the route and flight editors.
- **Review.**
  - An `R.weekReview` wrapper rewrites `.wk-missed` in words (`dsMissedWords`) and names the biggest missed opportunity.
  - "Fix next week's {route} plan" sets `S.dsFix`; an `s2State` wrapper opens the next Monday on it. The audit letter's `.so-miss` is words too.
  - `S.ds.reviews` keeps the figures for the teacher.
- **Experiments.** `R.ov_investigate` steps through choose → predict → change one thing → model → compare → use. `planningSupport` is per pupil in `S.ds.level`. The log is `S.ds.exps`.
- **Teacher and printout.** `dsTeacherRender` (the dial, review figures, check log and experiments) is chained on `soTeacherRender`. A `recordPrintHtml` wrapper adds Experiments and Plan quality by week.

## 0p. Working on paper (Workbook v5.6, D86, 15 Oct 2026)

**`p4zr_paper.js`**, after `p4zq`. Reassignment only, so `overrides.txt` stays at 120. Report for Fable: `docs/Working-On-Paper-Notes.md`.
- **Switch.** `paperOn()` is week mode, the workbook's `workingOnPaper`, and not `settings.workingOnPaper = 'off'`. The Fleet desk test runs with it off, to keep the pad tested.
- **Answer box.** The dock shows "Sum N · Week W · what it is", the question in black on white (`.pq`), one answer field and a collapsed reference card. There is no grid, pad or template.
  - Sum numbers live in `S.sumNo {next, keys}`, keyed by `recKey@week`. The record entry stores `n`.
- **Two tries.**
  - Wrong once: the note from `recNumNote` (ten times out, not divided back, swapped digits, a carry) and "One more try".
  - Wrong twice: the right figure, stamped `FIN_STAMP` (Checked by Finance), and a `shown` attempt in the record.
  - Where it applies: `cellWrong`, `soCalcCheck`/`soBuildCheck`, `rbCheck`, the fuel order, and a capture listener for the inline cards (`PAPER_CHK`).
- **Fuel.**
  - No per-service fuel cards: `fuelCardsDue` and `soFuelCands` return nothing.
  - The week's order on the fuel desk is the one fuel sum: blocks × the price of 1,000 L. Calculate the first time and on a 50p move (`S.fo.last`), otherwise Build once, then the model. Frozen per week in `S.fo.weeks`.
  - A Calculate order keeps a slot, but gives way (a Build that week) when new relationships fill the cap (`soDecideList` wrapper, `FO_NEW`).
  - The fuel desk's "Fuel by route" tab shows the week's litres and cost by aircraft and route.
- **Launch Day.**
  - The asked sums are the tickets for the first market at three fares, the profit and the fuel order (`TABLES.fuelOrder1`). The fuel order comes after a stepped example of one service and the block price.
  - The snacks are Builds; Dublin's tickets are the model's.
- **Record.** The printout puts "Sum N" in the margin, adds a ruled box "Working (from your book)" and shows "Checked by Finance" on shown attempts.
- **Data.** Workbook v5.6 (also D82–D85, chapter 4: monthly finance, the A380 offer, the Campaign sheet; chapter 4 is not built yet). Workbook v5.7 (D87/D88 settings and PlanTips columns) is installed but not wired in yet.
- **Tests.**
  - The cash at each chapter's end is unchanged, except chapter 3: the August 2032 market week that v5.6 added. The table is in the notes.
  - `chapter3.test.js` now expects v5.5's A380 offer (£20m down, then £1m a month) and an end card that goes on to chapter 4. The chapter 3 review reads the offer from the live Events row.

## 0o. Teacher milestones and an old save made ready (15 Oct 2026)

**Milestones** (`p4zq_milestones.js`, after `p4zp`; reassignment only, so `overrides.txt` stays at 120). They are for the teacher only, with no effect in the game. Draft list and rules: `docs/Milestones-Draft.md`.
- **Data:**
  - `MS_DEFAULT` has 14 rows: `{id, chapters, title, words, threshold}`.
  - `msTable()` merges rows from `WB.teacherMilestones`. `tools/import_world.py` reads an optional `Milestones` sheet into that key and reports an id the game can't measure as an error.
- **State:** `S.ms = {got:{'<ch>:<id>':{day, times, evidence, lastEvidence, periods}}, awarded:{key:day}, ended:{ch:{changes, gap, idleBoards, max}}, last, credited}`.
- **When milestones are worked out:**
  - A `closeDay` wrapper runs `recDecisionNow()` (it runs only once per period), then `msEval()`. That function:
    1. judges each new decision entry (`msEvalEntry`);
    2. scans the audits, hunts and challenges (`msEvalState`);
    3. at a chapter's review, decides Never coasting (`msEndChapter`). A `render` wrapper also runs this on `chapterReview` and `protoEnd`.
  - An `acquirePlane` wrapper copies `S.waitFor` before the purchase clears it, for Saved and bought.
  - `msEval()` does nothing while `QUIET` is set, so dry runs are skipped.
  - A save made before 15 Oct is evaluated once over its record when it is loaded. Its old purchases can't count as Saved and bought.
- **Counted change (`msCounted`):** the plan signature `msSig` (flights with route, time and days; fares flown; on board) differs from both entries before it, and no board audit falls inside the entry. Entries are judged only inside a chapter's start-to-review window (`msChapterOf`), which leaves out the holiday.
- **Teacher panel:** `msTeacherRender`, chained on `soTeacherRender`, inserts a `.tsec` after the Pupil record section. It reuses the `.so-log` table and `data-msaw` ticks. **Printout:** a `recordPrintHtml` wrapper adds a Milestones table filtered by `recRange`.
- **Tests:**
  - `milestones.test.js` (27 checks) covers each rule and guard on made-up weeks, the sheet override, Awarded in the code, the panel and the printout, and nothing on the pupil's screen.
  - The chapter runs: `week.test.js` (Steady pupil against the coasting one), `chapter2.test.js` (the challenges and the hunt) and `chapter3.test.js` (buying without saving isn't Saved and bought).

**gubby airlines** (`docs/saves/`): an early-October code saved on Thu 5 Sep, in the Departure times briefing.
- **The problem:** the code loads, but its old 09:00, 12:20 and 15:40 times lose about £600 a day, and the migration puts a Thursday save that has sums on the board.
- **The ready code:** Thursday is a planning day again, starting with *Departure times* and *A second route: Dublin*. Cash, fleet, fares and history are as saved.
- **The test:** `migrate.test.js` loads the original (from `fixtures/gubby-ASIM5.txt`) and plays the ready code through Sunday's review to Monday.
- **Not changed:** other codes saved before their departure times would also land on the board with the old times. The general migration rule is unchanged.

## 0n. Run-through fixes (14 Oct 2026): decimals the way the class is taught, and no unprompted shop

Bertie played to week three. Two fixes (`p4zp_runthrough.js`, new, after `p4zo`; the decimal texts in place). Notes: `docs/Run-Through-Fixes-14-Oct.md`.

**1. Make it whole, multiply, divide back.** "I've just taught them to do it today by multiplying ... by 1000 or dividing just to get to whole numbers and doing multiplication. So that should be the standard method."
- **Service Cost card** (`p4y_desks.js`): a new method `whole`, the only one offered (`scMethodsOffered`); the old ones stay in `scRows` for old records.
  - Step 1 "Make the price a whole number": `1.47 × 100` = [147].
  - Step 2 "Multiply the whole numbers": one row, `120 × 147` = [17,640] (`whole:true`), with the Working pad's long multiplication. Until step 1 is right, the row reads "120 × your step 1 answer" and the pad button waits.
  - Step 3 "Divide by 100 to put the 2 decimal places back": the £ total. Until step 2 is right, its note reads "Your step 2 answer ÷ 100".
  - Queries (`scWholeNext`, `scWholeQuery`): × 10 or × 1,000 in step 1 (count the decimal places); a decimal in step 2 (both numbers are whole now); in step 3 the answer not divided, or ÷ 10 / ÷ 1,000.
  - `scAnswers()` keys are `r0`, `r1`, `tot`. A Working button no longer pushes a sum box off its panel (`.sc-row:has(> .pad-wrap)`, `.fd-sr:has(> .pad-wrap)`).
- **Working pad** (`p4zk_pad.js`): a decimal factor counts its decimal places (1–3) and is scaled × 10, 100 or 1,000 (money with pence: × 100). The note reads "Make it whole: 1.47 × 100 = 147 (2 decimal places)"; the last box divides back by the product of the scales. `padInfo` adds `scale`.
- **Everywhere else a decimal is multiplied:** Launch Day's *Buying fuel* maths page (`p4j_intro.js`: 1.30 × 100 = 130; 1,000 × 130 = 130,000; ÷ 100 = £1,300); the fuel desk's first-order Query; `soMethod` ppl (`p4zc`); `REC_SC_METHOD.whole` and `recSoMethod` (`p4zi`); the record's note for an undivided answer ("46,800 is the whole-number answer: ÷ 100 puts the 2 decimal places back, so the bill is £468"); `pqDecimalWorking` and the practice hint (`p4s`); `wkTutorial`, `wkMethod` and `wkFig` (`p4t`, teacher-only paths).
- Hunt h2's Query reads the workbook's `pupilChecks` ("Multiply litres by price"); the method words there are Fable's.

**2. The shop is never offered.** "Even though I had just purchased an aircraft it came up with do you want to buy an aircraft? ... They will want more planes. They do not need to be offered them." (Bertie chose: never; Fleet desk only.)
- `stepsFor` and `daySteps` drop every `shop2` that is not `adHoc`: the week and month beats, the days new aircraft arrive (8, 22, 127, 365), the Mondays while saving (`p4zm`) and day 365 after afford3 (`p4zo`). `openShopNow` (Fleet desk *Add an aircraft*, run board *Aircraft shop*) is the only way in.
- `INTRO.jets`, `INTRO.longhaul`, `INTRO.owning` (and `INTRO.fleet`): placed before the plan, *Look at the aircraft* gone, and a last line saying the planes are on the Fleet desk.
- `protoBrief`: on a day `unlocks.planes` is set, "On the Fleet desk from today: … Open Fleet, then Add an aircraft, when you want one." replaces the shop's own "New today" line.
- afford3's bar: "Signed. The planes are on the Fleet desk (Add an aircraft) whenever you want one. Next: the plan." The saving texts say the Fleet desk counts down.
- `waitNow`: buying any aircraft on a later day than the saving began ends it.
- Old saves: `rtShopFix` (a render wrapper) removes a scheduled `shop2` still ahead in today's steps and adds the Fleet desk line to today's brief.
- For the tests: `shopOfferedReport()`.

**Tests.** `week.test.js` opens the shop from the Fleet desk (day 8, a plan day while saving, from day 22 until the ATR) and checks every HQ for a scheduled shop; chapter 1 still ends on £697,112 (215 checks) and the coasting pupil on £689,806 (218). `fleetshop` 35, `record` 16, `migrate` 27. `chapter2.test.js` rents the 757 from the Fleet desk on day 127: Value 107 checks and Premium 101, ending unchanged on £13,591,851 and £13,312,048. `chapter3.test.js` opens it on day 365 (Premium's 787) and in October (the A350): Value 62 and Premium 72, unchanged on £28,212,563 and £19,821,669. All with 0 failures. `runthrough`, `answers` and `liveops` stop at the launch market screen removed in v4.4, as on the previous commit (stale, like `opening`).

## 0m. Workbook v5.4 (14 Oct 2026): chapter 3 "Owning", push 1 — the year to 31 August 2032, the overdraft, owning and handing back

**Data.** Workbook v5.4 (v5.3 plus Fable's note D81) is installed.
- `tools/import_world.py` reads:
  - the new **EventOptions** sheet into `eventOptions[eventId]`;
  - `Routes.legs` (parsed to `[{km, from, to}]`) and `rotationDays`;
  - `Challenges.rewardShareOrStars` into `rewardShare` (`{share}` or `{stars}`);
  - `chapterPreview` (chapters not built: name, start, idea);
  - `eventPreview` (the offer that opens such a chapter: the A380).
- New checks:
  - EventOptions' event ids, option numbers, and cash versus costShare by day 29;
  - the legs add up to the distance, and `rotationDays` matches the rotation;
  - Finance price ÷ lease = 2,000 for big planes (D78);
  - an Events/Calendar date clash within a week is a "check" (the Calendar wins).
- The report has a **Chapter 3 touches** section.

**Beats** (`p4zg_chapter2.js`, now every chapter). `chapterBeats(CH, R, prev)` replaces `chapter2Beats`:
- a holiday only when the chapter starts after the day following the last review;
- the Calendar's days;
- weeks only when `runCadence` is not `month`;
- then months, and the review.

So chapter 3 is:
- days 365–371 one at a time;
- months from 8 Sep (8–30 Sep, then 1 Oct … 1–30 Aug);
- the review on Tue 31 Aug 2032 (day 730).

Also in `p4zg`:
- `CH_SPANS` gets every chapter with Calendar rows.
- `closeDayWeek`'s "Sunday review → the next beat" applies to chapters ≥ 2.
- Chapter 2's end card has **On to chapter 3** (`startProtoDay(365)`), read from the Chapters row. `nextChapterOf(n)` and `chapterHook()` name the next chapter, built or not.
- `marketWeekOf` falls back to the last live week for the week after it (week 105 is still `later`).

**Money rules** (`p4zo_ch3money.js`, after `p4zn`; reassignments only, `overrides.txt` unchanged at 120):
- **EventOptions.**
  - `ch2Event` takes each option's label, sub-line, costShare and stars from the rows; `CH2_OPT` keeps the mechanics by option number. `ch2Price` adds the stars to the sub-line, and `ch2PatchBeats()` is run again.
  - `rowEvent(id)` builds `overdraft_offer` from its two rows (`ROW_EVENTS`).
  - Chapter 1's events are unchanged (Bertie, 14 Oct).
- **Overdraft.**
  - `S.od = {on, limit, since, declined}`. `cashFloor()` is `cashReserve` before `overdraftFromDate`; after it, −limit when accepted and £0 when declined. `WORLD.cashReserve` is a getter for it, so `saveUp`, `shopOffer`, `R.acquire`, `fdMaxBlocks` and `reserveState` block at the floor.
  - `odLimitNow()` is the last 28 days' profit ÷ 4, to £100, refreshed at each beat.
  - `bankCheck` lends nothing from 1 Sep 2031.
  - `reserveState` blocks only a fuel order beyond the floor, so the plan always flies.
  - `reserveWords()` replaces "Keep £1,000 back".
  - "Overdrawn £X of £Y" appears in the header (`updateTopBar`) and the Finance desk's statement (`odStatementHtml`, with **Accept the overdraft** after declining).
  - `soAuditData` sets `board` when the last two month-ends were overdrawn (`odMonthEnds`), and `R.audit` says why.
- **Buy a rented plane / hand a lease back.**
  - `fleetHtml` adds **Buy it: £price** and **Hand back on <month end>** / **Keep it** to each rented plane.
  - `R.ov_buyLeased` is the confirm page: price, rent, rent-or-buy days, and cash after. When cash goes below zero the cash after is a negative-cash sum (`negcash`, NCP-3-03).
  - `buyLeasedNow` sets `terms = {kind:'buy', was:'lease'}`.
  - `f.returnOn` = the month's last day; `leaseReturnsDue` removes the plane at the next beat (`handBackNow`: fleet, `S.returned`, `S.ch3Log`, news, record).
- **Time to afford in weeks.**
  - `taFigW` works to the nearest £1,000, with profit a week = the last 28 days ÷ 4. `taCardW`/`taBindW` are the weekly card (Calculate in two steps, or Build).
  - The **afford3** step comes on day 365 after the overdraft offer and before the plan (since §0n the air show is not a step; *Next: the plan*); the target is the cheapest plane he can't afford.
  - Later, the Buy-or-rent page shows the card (Build once met) and **Save for it**; `waitLine` counts down in weeks.
- **Missed h1.** `S.ch3Forecast.out` (now £2,000 from the data): `shownCash()` = cash + £2,000 from day 365 until the first month-end audit, which corrects it (`.h1-fix`). There is a fallback if audits are off.
- **Rotations on a planning page.** `rotOut` returns true when no day is being simulated (`SIM_DAY` null), so the plan and its Service Cost Breakdown show an overnight rotation on its way out; simulated days still alternate. This fixes a plan day on the way home showing the service empty (£0 of tickets).
- **Day 365.**
  - `daySteps`: HQ, What's new (`INTRO.owning`), the overdraft offer, afford3, the plan (the air show only from the Fleet desk, §0n).
  - `routeOpen` keeps two-leg routes shut (Sydney, push 2).
- **The review.** `chapterReviewItems` adds **The average month** (Build) from chapter 3. `renderChapterReviewBuild` adds the A380 offer card (`offerCardHtml`) and the next investment (`nextInvestment`). The end card names chapter 4 (not built yet).
- **Other.**
  - The light airline types are permanent (D77): the type page's note changed.
  - `secondCrewCost` (£250) is live, so a short-haul second crew costs £250, not the engine's £300.
  - `REC_REL` gains `timeToAffordWeekly`, `negCash` and `rentOrBuyJet` ("rent-or-buy at jet prices", in chapter 3).

**Tests.**
- `chapter2.test.js` now expects:
  - the EventOptions labels;
  - h1's £2,000;
  - "Chapter 3, Owning, opens on Monday 1 September 2031";
  - the On to chapter 3 button.
- The new `chapter3.test.js` runs from a chapter 2 end save to the review (see `docs/Chapter-3-Push-1-Notes.md`).

## 0l. Workbook v5.2 (14 Oct 2026): chapter 2 push 3 — events with options, the news, the Captain's challenges, the hunts

**What changed** (`p4zn_ch2events.js`, after `p4zm_buyonly` in the build; reassignments only, `overrides.txt` unchanged at 120):
- **Charges.** `S.charges = { due:[{ev, at, day, amount, what}], weekly:[{ev, at, from, to, amount, what}] }`, `chargesOn(d)`, `chargesIn(a, b)`.
  - `simulateDays` takes each day's charges off cash and adds them to the ledger, `out.days` and the totals.
  - `planLines` uses `chargesOn(SIM_DAY)` in place of `S.rnd.eventCost` in weeks, months and gaps (0 on the plan page's typical day).
  - `applyEventNow` turns a week's or month's event cost into a charge (once, a day each for a window, or every Monday); `undoEvent` removes it with `S.flags[id]` and `S.ch2pick[id]`.
  - This also fixes chapter 1: a week's event cost was never charged (the week test picks the free options, so its figures are unchanged).
- **Chapter 2's events.** `CH2_OPT` (mechanics by event id) + `ch2Event(id)` (options from the prose: label before the brackets, sub-line inside, stars parsed; share from `ch2Share(costShare, phrase)`).
  - `gameEvent` returns them, and `ch2PatchBeats()` patches the beats already built.
  - `costShareOf` reads `opt.share`; `yesterdayProfit` is the last 7 days' average at a pause in a month.
  - `R.event` prices each option (`ch2Price`), adds the date line, and labels the button "Carry on: fly …" at a pause.
  - The ash cloud's window comes from its news item (14–18 Apr), so its card is on the 14th. `ch2Late(day)`: the blogger's flight is late when the Market weather is not clear.
  - `demandAt` adds "Geneva +30 for the week" (`ch2DemandAdd`). Easter adds nothing (its news item carries the +20%).
- **A month in parts.** `CH2_PAUSERS` (events, challenges, hunts) give the pause days; `ch2Segment()` replaces the month's `sim` with `{t:'sim', seg, a, b}` steps and the pause steps.
  - `startBeat` and a `render` fix (saves made before the run) call it; `S.rnd.segs = { round, n, parts, ran }`.
  - `simulateRun` runs one part and returns the month so far as one part (`mergeParts`, `periodTOf`), so the history keeps one line.
  - `enterStep` restores `S.day` on each part and sets it to the pause day (with `S.rnd.midPause`) on a pause step; the bar carries on (`R.sim` fills over the whole month).
  - `applyPeriodResults` / `periodResultsCard` add "Charged in April: …" and "Nothing flew on …".
- **News.** `newsOn` matches `all` and drops an item a choice lifted (`newsLifted`); `planFlights` grounds a flight under a ×0 item (or the fog choice) with no fares, fuel or flying costs.
  - `announcedFor` covers the whole month in a month; `worldReportHtml`, `s2Changes` and `surprisesLine` say "All routes · nothing flies", "Announced for April" and "News this month".
- **Challenges.** `capList()` (start = the later of `fromDate` and chapter 2's first week), `S.capCh[n] = {state:new|offered|later|won}`.
  - The card step `capChallenge` comes after HQ in a week (`capWeekStep`) or at a pause in a month; `R.hq` adds `#capChBtn` while one is waiting.
  - Rewards (`capReward`): "N% off your next fuel" sets `S.fuelDiscount`, which a `buyFuel` wrapper now applies (it used to be cleared unused); "+½ star" goes through `bankStars`.
  - The box `[data-pad="capch"]` has the Working pad; `recOpen('ch:'+n)`.
- **Hunts.** `huntSpec(id)` reads the numbers from `whatIsWrong` (h2: litres at a price shown as; h1: passengers × fare =); `R.hunt` draws the document with "This is wrong" on each line and a fix box `[data-pad="hunt"]`.
  - h2 is a pause on 21 April; missed, it is a £1,000 charge and May gets a second look (found: −£1,000 on 1 May).
  - h1 sits before `chapterReview` on 31 August; missed, `S.ch3Forecast` and a note on the end card.
  - `recOpen('hunt:'+id)`, status `missed` printed by a `recCalcHtml` wrapper.
- **For the tests:** `ch2Report()`, `capPlan()`, `huntPlan()`.

**Tests:** see the push 3 notes (`docs/Chapter-2-Push-3-Notes.md`) for the figures. `chapter2.test.js` now runs to the chapter 2 review by default.

**Not done / to note:** Luton (fees_rise option 4) is left out for now; the other open questions are in the push 3 notes.

## 0k. Workbook v5.2 (13 Oct 2026): chapter 1 is buy only (D76), and working space everywhere

**What changed:**
- **Data.** `data/Airline-World-Workbook.xlsx` is v5.2. It imported with 0 to fix and 6 to check.
  - `tools/import_world.py` gains `chapter1BuyOnly` and `timeToAffordSum` in `NEEDED`.
  - The `unlocks()` parser drops brackets before splitting on commas, so "dhc6 (second, £10,000)" stays one item.
- **`p4zm_buyonly.js` (new, after `p4zl_fleetshop`):**
  - `buyOnlyOn(day)` is true while `chapter1BuyOnly` holds and the day is before `leaseFromDate`.
  - The `shopOffer` wrapper clears `canLease` / `lease` then, and clears `canFinance` / `deposit` until `financeFromDate` (or the offer's own `finFrom`). With `chapter1BuyOnly` off, the offers are as before.
  - `taFig(pid)` gives price, cash, rate (`avgDailyProfit()`, rounded), still, days (rounded up, 0 when affordable), exact, afford, shortfall and reserve.
  - `taWaitCost` takes the best affordable cheaper candidate with a positive extra profit, times the days.
  - `taTarget` is the chosen plane if unaffordable, else the cheapest unaffordable one.
  - **The sign-off** (`timeToAfford`): `taCardHtml` / `taBind` give Calculate in two steps (`[data-pad="ta1"]` −, `[data-pad="ta2"]` ÷), or Build with figure chips (correct is `still ÷ rate`).
    - `taLedger` puts `ta|<pid>` in the week's ledger; `taDone` calls `soTouch` and `soDone`; `taRecord` writes `recOpen('ta:'+pid)`.
    - `REC_REL.rentOrBuy` and `REC_REL.timeToAfford` are both "time to afford, then rent-or-buy".
  - **`renderAcWait`** (Screen 2 when `acChoice` is set): the three columns, `[data-bw="pid|buy|wait"]`. The asked plane's still / days / cost show `?` until it is signed.
    - Buy runs `acquirePlane(p,'buy')` and `acApplyChoice`.
    - Wait sets `S.waitFor = { pid, from, price, days }`, with news and a record event.
  - **`renderBuyOne`** (a later visit from the showroom or Fleet panel, no comparison): one plane, the sign-off if it is unaffordable, then Buy now, Wait for it or Not today.
  - **While `S.waitFor` stands:** `daySteps` puts `shop2` before `plan` on plan days, and `waitBanner()` / `fleetShopHtml` show the countdown. `acquirePlane` clears it, and so does `waitNow()` once the plane is in the fleet.
  - `INTRO.fleet` is replaced while `chapter1BuyOnly` is on. `acGiveUp`, `acCashBar` and the comparison's hint get buy-only words.
  - `buyOnlyReport()` is for the tests.
- **`p4zl_fleetshop.js`:** `shopVerb()` gives "Buy" or "Rent or buy". The panel's rent column shows only once renting is offered.
- **`p4zk_pad.js`:**
  - `padModel` gains `÷`: a bus stop with `data-wpr="q"` answer boxes and `.wp-rm` remainder boxes, multiples `[data-wpm]`, and `[data-wpsmall]` *Make it smaller*. There are 2 decimal places when the division isn't whole; `padDivValue` reads the answer.
  - `padModel` gains `−`: an exchange strip `data-wpr="x"`.
  - The free pad is `#padFree` in `.dkh-tools` (`openFreePad`, `[data-wfa]`, `[data-wfop]`, `[data-wfb]`, `[data-wfgo]`). It is not checked or recorded.
  - ÷ specs cover `#rbIn` and `ta2`, and − covers `ta1`.
- **`p4zb_decisions.js` `renderAcPay`:** the rows are `[label, value, cls, sub]`. The sub-line shows how each figure is made, and a **Paid in all** row is added.
- **`p1_head.html`:** the hangar roll starts at `translateX(115%)` (nose first).

**Tests** (all 0 failures):
- `week.test.js` plays buy only: on day 8 it waits for the Saab (Calculate, with the two Queries). It buys the Saab on day 15 (Build), waits for the ATR on day 22 and buys it on day 29.
  - **New checks:** the week-2 sign-off is the time to afford, and there is no rent-or-buy sum in any chapter 1 week.
  - 199 checks, ending on £697,112. `COAST=1`: 202 checks, £689,806.
- `fleetshop.test.js`: 35 checks.
- `chapter2.test.js` (from the new chapter 1 save): Value 48 checks, Premium 46.
  - On day 127 rent-or-buy is now Calculate (first met), so the cap's three Calculate are rent-or-buy, the tickets, and the fuel (Premium) or the bag fee (Value, where the long-haul fuel is Build).
- `migrate.test.js`: 27 checks. `record.test.js`: 16 checks.

**Not done / to note:**
- Days to wait use price − cash, as the note says. Buy needs price + the £1,000 reserve, so on the day the countdown reaches 0, Buy can still be greyed by up to £1,000 (the shortfall is shown).
- The finance card's sums are only reachable from January (rent) and chapter 4 (finance).

## 0j. One game file, the shop under Fleet, the Working pad (13 Oct 2026, Bertie's run-through)

**What changed:**
- **`build.py`** builds one file, `airline-opening-prototype.html`. Its list is the shared parts, then `p4ze_studio2`, `p4zf_flightdays`, `p4zg_chapter2`, `p4zh_longhaul`, `p4zj_types`, `p4zk_pad` and `p4zl_fleetshop`, then `p4c_display`, with `p1_head_studio2.css`. There is one `overrides.txt`.
  - The `airline-opening-studio-v2.html` build and file are gone.
  - `archive/` holds the first full game and the v4.10 Studio copy, unchanged.
  - Tests default to the one file, and `week.test.js` always takes the Studio path.
- **`p4zl_fleetshop.js` (the shop under Fleet):**
  - `renderView('fleet')` gets the *Add an aircraft* panel, and `R.weekRun` gets an *Aircraft shop* button in its footer.
  - `openShopNow()` removes earlier shop steps before `S.si` (`shop2` is found by `findIndex`), then inserts `{ t:'shop2', adHoc:true }` at `S.si`. The existing chain runs from there.
  - `acquirePlane` on a run day sets `costFrom` and `flyFrom` to the next day. `dayCostOf` returns 0 before `costFrom` on the simulated day (`simDayNow`), and `planFlights` drops the plane's flights before `flyFrom`.
  - `shopClosedWhy()` gives the reasons the button is off.
- **`p4zk_pad.js` (the Working pad):**
  - A `render` wrapper adds a Working button beside `[data-fds]`, `[data-soin]`, `[data-sopre]` and `[data-sc]` boxes whose sum is × (or the card's add row). `padSpecFor` gives the sum.
  - `padModel` sets the column layout: the number with fewer non-zero digits goes underneath, pence only when a factor has pence, and one partial line a non-zero digit.
  - The pad is a fixed dialog on `document.body`, with its own key handling. Its state is in `UI.padCells`.
  - Use this answer fires `input` on the box. `recAttempt` / `recAttemptHtml` are wrapped to keep and print the pad's lines.

## 0i. Workbook v5.0 (13 Oct 2026): chapter 2, push 2 of 3 (revised Studio only), and Bertie's run-through fixes

**What changed:**
- **`p4zj_types.js`** (v2 only, after `p4zh_longhaul`). All shared functions are reassigned, not redeclared:
  - **Reputation:**
    - `repLive` goes live from `reputationFromDate`, else chapter 2's first day.
    - `repFactor` = 1 + `reputationPerHalfStar` × half-stars from 3.
    - `bankStars` logs each change in `S.repLog` and, once live, scales it by the type's star rate. `S.repExact` keeps the quarter; `S.rep` is whole half-stars towards 3.
    - `applyResults` / `applyPeriodResults` run with the prototype's daily star rules off (`REP_QUIET`).
    - `revealReputation` records `S.repReveal` and a record event.
  - **The type:**
    - `S.atype = { pick, day, confirmed, confirmDay }`.
    - Every workbook route's `fares` and `prices` are getters over `_fares0` plus the type's steps from `demandAtFare`.
    - `typeSnap` moves a fare that left the menu to the nearest one.
  - **Steps:**
    - `daySteps` adds `stars` and `atype` after day 127's intro (`ch2StepsFix` does it for a day-127 save made before this push).
    - `enterRunDay` puts `atypeOk` before the run on the Calendar's "airline type confirmed" day (130).
  - **Bags:** `dayExtras` adds `bags` and `bagRev` (in `obRev`) for a Value airline from day 127. `s2Summary`, `s2Insights` and `cashLine` show the line.
  - **Sign-offs:**
    - `soWorkCands` marks the first long-haul tickets (`lhEst`) and fuel (`lhFuel`) as forced, and adds `bag|<route>` (rel `bagFee`) for Value.
    - `soDecideList` keeps a long-haul plane's seats × fare out of the Calculate slots.
    - `decideHandSums` moves the estimated ticket sum off the sheet onto the Sign-offs page (`soStageItems`).
    - `soSpec` / `soCardHtml` / `soBindCards` draw a two-step card: the estimate or the tenths, then the sum. The first step's tries are the record's working (`recAttempt`).
    - `S.ch2so` records when the first long-haul ticket sum and fuel line were done.
- **Fuel card (both files, `p4y_desks.js`):** one method, make it pence, in three boxes: × 100, a line a digit then add, ÷ 100. Each Query is specific to its step (`scPenceQuery`, `scNextStepMsg`). `soMethod` and the record name the same method. *Replaced on 14 Oct by make it whole (§0n).*
- **Review cards (both files, `p4zb_decisions.js`):** `rbAskHtml` puts the question in a green box with the thing to find in bold.

**Interpretations (in `docs/Chapter-2-Push-2-Notes.md`):**
- the half-star rounding towards 3;
- the daily stars switched off;
- whole bags rounded to the nearest;
- the bag sum on the long-haul route's passengers;
- the WorkingMethods fuel row still lists five methods; the card now teaches one.

## 0h. Workbook v5.1 (13 Oct 2026): the pupil record and printout (D75), and a smooth take-off

**What changed:**
- **`p4zi_record.js`** (both builds, before `p4c_display`) keeps `S.record`:
  - `{ pupil, entries, notes, pend }`;
  - each entry is `calc`, `build` or `decision`;
  - a calculation entry holds its attempts and their working.
- **It wraps:**
  - `soSpec` (to find the card), `soCalcCheck`, `soBuildCheck`, `soCardHtml`;
  - `rbCheck`, `rbCardHtml`;
  - `checkCell`, `cellCorrect` (a shown answer), `wkGrid` (the column template, read cell by cell at Check), `svcCardHtml`;
  - `applyEventNow`, `acquirePlane`;
  - `closeDay` (a decision entry at each week's or period's end), `soTeacherRender` (the Pupil record box);
  - `dryRun` (the record stays out of the copy).
- **The checks written inline** (`#scCheck`, `#rbChk`, `#fdSignChk`) are read by a capture-phase click listener: the screen before the handler, the state after.
- **The error notes** (`recNote`) work from the working first (a card line, a column-template line), then from the answer.
- **The printout** (`recordPrintHtml`) opens in a new window with a Print button.
- **The take-off** (`p4q_paint.js` `takeoffRun`, `takeoffPose`) is drawn each frame on transforms; the `rwTakeoff` keyframes are gone.

**Known:**
- **Attempts that never reach a verdict are not attempts:** a blank box, or a format message such as "Type the number of days".
- **A Calculate sign-off card has an answer box and no working,** so its method is the one the card suggests, marked "(suggested)". The working the pupil types is kept where there is a template (the column template, the service card's methods, the fuel order).
- **Squared paper is a drawing:** the record notes the method, not the strokes.
- **Time taken** runs from when the sum is first on screen (this session) to the Check. A reload starts the clock at the first attempt.
- **Missed profit** is on the weekly decisions (from the Sunday review's sweep); a week or month period has none.

## 0g. Workbook v5.0 (13 Oct 2026): chapter 2, push 1 of 3 (revised Studio only)

**What changed:**
- **Data.** Workbook v5.0 is installed; the main game's full chapter run is unchanged (165 checks, cash £690,850). The importer reads:
  - Routes `rotation` and `seasonOverride` (`winter:1.2,summer:0.8`);
  - the 14 new settings in `NEEDED`;
  - RouteNews `routes = all`, without flagging it.
- **`p4zg_chapter2.js`** (v2 build only) reassigns `buildBeats` to append chapter 2's beats after chapter 1's:
  - the holiday (days 119–126: HQ, the run, the results);
  - Calendar days 127–133 with their week phases;
  - weeks 134, 141 and 148;
  - months from 3 February;
  - the chapter 2 review (day 364, 31 August 2031).

  It also reassigns:
  - `stepsFor`, `PW`, `planWord`, `closeWord` and `emergencyFuel` for the holiday;
  - `closeDayWeek`: the holiday leads into a day beat, and chapter 2's Sunday leads into the weeks without a second regular-plan approval;
  - `R.protoEnd`, which leads chapter 1's end into the holiday.

  `WORLD.chapter`, `reviewDay`, `weekFrom` and `monthFrom` are getters on the day's chapter.

  **The best-plan sweep** (`bestPlanSweep`, used by the missed-profit line and the audits) tried every mix of routes an aircraft can reach. A 757 reaches all sixteen open routes, which is thousands of plans, and the February audit hung. From day 127, each aircraft type tries its eight most promising routes plus the ones it flies, through `planeCanFly` during the sweep only. One sweep with a 757 takes about 4 seconds. Chapter 1's sweep is unchanged.
- **`p4zh_longhaul.js`** (v2 build only) reassigns:
  - `TIME.away` (120 min at the far end on long haul);
  - `TIME.day` (an overnight rotation is one way today);
  - `freeDep` (long haul looks for 06:30 first);
  - `fitsFor` (nothing beside an overnight rotation);
  - `addService` (says why a long-haul service doesn't fit);
  - `fuelForTrip` (whole litres on long haul);
  - `growthOf` (`long_haul`: 5% a week from the opening week, to ×1.5);
  - `demandMult` and `seasonMult` (the route's season override);
  - `planFlights` (the overnight rotation's home day books nothing; flights get `longHaul` and `localArr`);
  - `dutyMin` and `dayExtras` (£500 per long-haul service from `crewMechanicFromDate`, not the duty-day crew as well);
  - `s2Block` and `s2SvcEditor` (local time, the overnight block);
  - `INTRO.longhaul` (*What's new: Going long*).

  `lhServiceDay(uid, soldTo)` gives one service's lines for the tests.
- **Test:** `chapter2.test.js` from a chapter-1-end save: 50 checks to the chapter 2 review (day 364), 0 failures, no errors. `nextChapterLine` is reassigned so each review names the right next chapter.

**Known (for Fable, in the push 3 report):**
- **Balance Report §2's launch figures leave out the season and the market week.** In play, New York on Tue 7 Jan is 220 × 1.06 (week 19's business 0.7 / leisure 1.3 at 40% business) × winter 0.9 × the `nyc_launch_buzz` news ×1.2 = 252 wanting to fly at £510. The 757 fills (200), so the day is £47,426.25 as the report says.
- **The duty-day second crew (D51) starts on 6 January for short-haul aircraft as well.** `secondCrewCost` is still a placeholder, so the Pass 1 £250 applies to any aircraft with a duty day over 12 hours. Long-haul aircraft pay the £500 a service instead.
- **The A320/737 (5,500 km) can still reach Dubai (5,400 km).**
- **The `long_haul` archetype writes `growthPerWeek` as 0.05,** where chapter 1's archetypes write percent. The code reads a value under 1 as a fraction.
- **Push 1 leaves these as they are:**
  - the ticket sum is Build, not Calculate (chapter 2's sign-offs come in push 2);
  - RouteNews `all` and closures (multiplier 0) don't apply yet (push 3);
  - chapter 2's events use chapter 1's option handling (push 3).

## 0f. Workbook v4.11 (13 Oct 2026): Days on every flight (D67, revised Studio only)

**What changed:**
- From day 8 each flight carries Days: All week, Mon–Fri or Sat–Sun. It lives in `f.days` beside `f.schedule` and is missing for All week.
- `p4zf_flightdays.js` reassigns these functions, so the main build never sees them:
  - `planFlights`: each day prices only its own flights;
  - `withPlan`, `currentPlan`, `applyPlan`, `applyPlanRaw` and `planKey`;
  - `actualDeps` and `fitsFor`: per day type;
  - `editPlan` (move and delete) and `addService`: days-aware;
  - `omMoveRoute`, `planTipsFor` and `seatFillReviewHtml`.
- **Studio:** a Mon–Fri | Sat–Sun switch, chips on blocks, Days in the flight and route editors, and Mon–Fri / Sat–Sun seat fill side by side.
- **Test:** the rugby-week check in `week.test.js` (v2 mode). The Dublin Sat–Sun service flies 0,0,0,0,0,1,1 and is full.

**Known:**
- The PlanTips sheet's older rows give thresholds with units ('4 h', '1 plane'). The tip code keeps its own thresholds for those rows; only the two new rows are read from the sheet.
- The shared fuel desk's suggestion still assumes every day is a weekday.
- In the main file, a Sat–Sun flight from a shared save flies all week.

## 0e. v4.10.1 (13 Oct 2026): Studio fixes, and two parked thoughts

**Fixed** (all three checked by `week.test.js`):
- **The timetable's selected-flight bar was cut off with three aircraft.** `.st-tt` hid its overflow and could not scroll. Now only the aircraft rows (`.st-ad`) scroll, with a sticky time axis; three or more aircraft get tighter rows (`.st-ad.many`).
- **Delete did nothing after clicking a flight.** The click re-rendered the page and the block lost focus. The block now keeps focus, and a document listener removes the selected flight on Delete/Backspace (Escape lets go) unless the pupil is typing in a field.
- **The Operations Model's Test plan hid half its controls with six routes.** It had one column per route in a third-width panel. Both plans are now one row per route.

**Parked by Bertie (to discuss with Fable, no change yet):**
- The Studio is busy for dyslexic learners.
- As the fleet grows, short-, medium- and long-haul could be separate views.

Bertie's revised interaction brief takes both further. It is built as a separate file, `airline-opening-studio-v2.html` (`p4ze_studio2.js`, `p1_head_studio2.css`), so the main game is untouched until he approves. The v4.10 Studio is kept, byte for byte, as `airline-opening-prototype-v4.10-studio.html`.

The revised Studio's Monday plan page has three states:
- **the opener:** Keep plan / Edit plan, with the known changes;
- **the operating plan:** active routes, toolbar, full-width timetable, summary bar, route editor, flight editor, trade-offs drawer, and fleet groups from four aircraft;
- **Change network:** haul filters, sort, and aircraft suitability.

News items open the plan on their route. The full report is `docs/Studio-v2-Report-Back.md`.
- **Parked:** Focus View and other accessibility options.
- **Designed, next pass:** regular operating patterns.
- **To confirm:** the haul bands (1,500 / 4,000 km) are code defaults until the workbook carries them.

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
- `opening.test.js` (day at a time) is stale since v4.4: it waits for the removed market screen. So are `runthrough.test.js`, `answers.test.js` and `liveops.test.js` (checked 14 Oct on this build and the one before).

Report: `docs/Desks-v2-Report-Back.md`.

## 0a. Workbook v4.4 (12 Oct 2026)

Chapter 1 is played a week at a time (D52): the Calendar's `weekPhase` (plan / run / review) drives `p4v_week.js`. Monday: HQ → (event) → the planning page (the showroom, the fleet sums, buy or rent and the paint shop only when the pupil opens the shop from the Fleet desk, §0n) with Plan Impact → the workings page → Ready → fly → results. Tuesday–Saturday: `weekRun`, one day per step on the operations board (`S.wk` holds the week's rows and Monday's projection), an event card or a sum stops it. Sunday: fly, then `weekReview` (the week7 table, the missed-profit sweep `bestPlanSweep`, `neglectUpdate`). `closeDay` moves to the next Monday, the regular-plan approval after day 28, then the weeks. Money per D53/D55: day costs, list prices, Finance in days, `saveUp` greys Buy. The look is the Dragon Air block at the end of `p1_head.html`. Tests: `week.test.js` (weeks 1–4), `migrate.test.js` (old codes land in the week), `balance.test.js` (re-based). Decisions and the report-back items: `docs/Workbook-v4.4-Report-Back.md`. The day-by-day screens below remain for `teacherDayByDay` and the weeks.

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
| 13 | The air show (aircraft for sale) | When the pupil opens it: Fleet desk *Add an aircraft*, or the run board's *Aircraft shop* (§0n) | Flip cards: photo or plain drawing, facts, four bars on one scale, Buy / Rent / Finance from the Finance sheet; a locked *Coming soon* row; Look closer or Not today |
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
| H1–H7 | h1, h2 | Yes (chapter 2) | h2 (fuel invoice, 21 Apr 2031) and h1 (year-1 accounts, 31 Aug 2031) are played; h3–h7 are placeholder rows |

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
