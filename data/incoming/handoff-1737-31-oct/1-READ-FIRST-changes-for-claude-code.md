# Hand-off: chapter one after the 17:37 play notes (31 October 2026, evening)

## What this means (plain English, for Bertie)

The hand-over "Chapter one after the 17:37 play notes" asked Claude Design to draw four screens before anything is built. All eight screens were drawn on the game's own screens, and you approved them on 31 Oct ("a big improvement towards what I think I want"). This hand-off tells Claude Code:

1. **The Frankfurt evening.** The Day page leads with the news and gives the reason in his own figure ("Your plan made 96% of the most your plane could make today"). One button: Plan tomorrow with Frankfurt.
2. **Two plans, then Choose.** Every Change my plan in week 1 shows today's plan for reference and a blank new plan under it, each with its profit a day and a Choose button on the right. The drop outline is always there.
3. **Before / after** opens by itself as a graph, with callouts one at a time, before any sums.
4. **The Changes sheet** starts on the new route (filled in by Finance), then the "What the Difference column means" callout comes before Finance's demo, inside the panel. "Now" becomes "Today's plan".
5. **Launch Day:** Finance shows the profit on a made-up example column, then he works out his own.
6. **Week 1 Sunday:** nothing starts on arrival; a callout introduces each method; Finance shows the average a day on the first sheet, he does it on the Σ SUM sheet.
7. **Week 2 what-if:** his fare and £3 more side by side, building up from a day to a week to a month, Finance first and then him. No text box.
8. **Demo pace:** Watch ▶, about 1.5 s, then about 1.2 s a step. And your rule: wherever a screen explains several ideas, one at a time.

**Your question on screen 2 (does it come before the sums?):** yes. The order is Day page → two plans → Choose → Before / after → the sums on the Changes sheet → Fly tomorrow. The two-plans screen has no sums: the game works out each plan's profit a day for him. If he chooses today's plan, there are no sums and it flies tomorrow. If the sums show the new plan isn't worth it, ◀ Back takes him to the two plans to choose again (section 2).

**Every change comes with its reason** (section 9), and DESIGN.md says a newer decision from you always wins over it. **This replaces the hand-off 2a page and zip**; hand-off 2a and the earlier ones are inside, in `earlier/`.

---

## 0. Rules for this round

- **Source:** the hand-over "Chapter one after the 17:37 play notes" (https://claude.ai/artifact/69wuVXkr9YhdqH8qpQFGM2) sets what changes and why; its table "Contradictions: the play notes win" overrules earlier hand-offs. **This file is the screens for it.** Where this file and that hand-over differ on a screen, this file wins (Bertie approved these pictures after it).
- **Chapter one only**, behind `ch1()`. `airline-opening-full.html` stays frozen. Every setting, word and figure goes in the workbook; **Fable supplies the words and figures** (ScreenText, Settings). Words in quotes below are the approved wording unless marked as placeholders.
- **Pictures** in `pictures/` are 1366 × 768 WebP mock-ups drawn on the game's screens. `-before` / `-as-built` show the build as it is. **Figures are examples from Bertie's run** (Launch Day Dublin ×2 and Paris ×2 at £100, £2,170 a day; new plan Frankfurt ×2 at £140 and Paris ×1 at £110, £3,177 a day). Fable sets the real ones.
- **Two rules for every guided screen** (Bertie, 31 Oct evening):
  - **Finance's demos never start on arrival.** Each waits for **Watch ▶** on its callout. Then nothing moves for `demoPauseMs` (1500), the pointer glides to the first cell before it clicks, and each later step is `demoStepMs` (1200) apart. Both are new Settings rows. Under reduced motion each step simply appears.
  - **One idea at a time.** Wherever a screen explains more than one new idea, its callouts come one at a time, each with its step at the right of the eyebrow ("1 of 4") and **Next ▸**; the last hands on to the task (**Watch ▶**, **Work it out ▶**, **Got it**). Every callout sits **inside its panel at 1366 × 768**; none may be cut off.
- First-time callouts and demos show once; store "seen" in the save.
- **Can be built now, no new look:** L2, L3, the demo pause and pace, S1's Watch ▶, the week 2 NOW strip (section 8). The rest is in the sections below.

## 1. Frankfurt evening: the Day page leads with it (T1, T2)

Pictures: `01-frankfurt-evening-before` (the card that came after Keep), `01-frankfurt-evening-1-day-page`.

- **When:** the evening a new route is earned (Frankfurt: `thirdRouteRule`, profit at least 85% of the best plan for his planes that day, every flight covering its costs, seats at least 80% full; it can be earned on Launch Day and opens the next morning). This replaces the Frankfurt event card that showed after Keep for tomorrow.
- **Layout:** the Day page's top row stays (Profit today, Route by route). The lower half (x 192–1353, y 344–690) becomes one panel with a `cyan` 4px left rail and a soft cyan glow, replacing Reading the day and the Tomorrow strip:
  - eyebrow **NEW ROUTE · YOU EARNED IT EARLY** (`cyan`); title **"Frankfurt opens tomorrow"** (22px);
  - left: a small departures board (470 × 150, the Storm card's style): DEPARTURES · TOMORROW, his routes ON TIME in `green`, `--:-- FRANKFURT · NEW` in `cyan`;
  - right, 17px: "Your plan made **96%** of the most your plane could make today. Every flight covered its costs, and the seats were 99% full." then "So **Frankfurt** opens early, from tomorrow." The percentage is his (profit ÷ best plan's profit, rounded down), 22px `green`. Fable has the final words (no "optimal").
  - two chips: flag + "5 h 15 there and back", "Further away: people pay more";
  - a rule line: "**Tomorrow, Tuesday 3 September.** Build a new plan with Frankfurt beside today's plan, then choose which one flies.";
  - small print (13px `text-muted`): the rule's three tests, from the workbook.
- **Footer:** "Frankfurt opens tomorrow. Plan tomorrow's flights." and one button, **Plan tomorrow with Frankfurt ▶** (`pri`). No Keep button that evening: today's plan can still be chosen on the next screen.

## 2. Two plans, then Choose (T3, D1, L1)

Pictures: `02-two-plans-before` (one plan, edited), `02-two-plans-1-blank-new-plan`, `02-two-plans-2-built-then-choose`.

- **When:** every **Change my plan** in week 1 (Tue to Sat Day pages that stop) and the Frankfurt evening's **Plan tomorrow with Frankfurt ▶** (Bertie chose "every Change my plan", 31 Oct). From week 2 the same screen, with the top lane named **Last week's plan**. Two timetables side by side are therefore no longer new in week 3.
- **Title:** "Plan tomorrow: Tuesday 3 September", sub-line "TEST Air HQ · today's plan stays for comparison · build a new one under it". Who wants to fly stays as it is (its bands narrow with the timeline). Hide the Mon–Fri / Sat–Sun and Compare with last week controls in week 1.
- **Two lanes** (timeline x 218–1110; lanes 64 high at y 394 and 490):
  - **TODAY'S PLAN** (label "Flew today", "Twin Otter · 4 flights"): today's flights at 60% opacity, read-only, not draggable. A dashed hairline under it.
  - **NEW PLAN** (label in `cyan`, "For tomorrow", "Twin Otter · drag flights in"): **starts empty**, 2px dashed `cyan` drop outline with a 5% cyan fill, and "Drag a flight here" (15px, `#7fd0ff`) centred while empty.
  - **L1, the drop outline is always shown** on a plane's lane from the moment the Studio opens, not only while dragging. Launch Day's lane too.
- **The choice column** (x 1124–1336, one box per lane, `#071b35`, 1px border): "Profit a day · flew today" with £2,170 in `gold` and **Choose ▶**; "Profit a day · projected" with the new plan's figure (ƒ, worked out by the game; "—" and "build it first" while empty) and **Choose ▶**, dimmed until the new plan has a flight, then `go`, and the box border `cyan`.
- **Tray:** Add a flight, "drag one onto the new plan", with every route he can fly (Dublin, Paris, Frankfurt).
- **Compare bar** (y 636, replaces the plan summary): COMPARE · Today's plan £2,170 a day · New plan £3,177 a day · **+£1,007 a day** (`green`, or `amber` when lower) · "Projected for tomorrow".
- **Footer:** "Choose the plan that flies tomorrow." and ◀ Back (to the Day page). No Work out my plan button: Choose replaces it.
- **Callouts, one at a time:** (1) on first open, under the new lane: NEW · TWO PLANS · 1 of 2, "Build a new plan for tomorrow", "Today's plan stays above to compare. Drag flights onto the new plan." **Got it**. (2) when the new plan first has a flight, pointing at its Choose: TWO PLANS · 2 of 2, "Choose the plan that flies tomorrow", "Today's: £2,170 a day. New: £3,177. Press Choose beside the one you want." **Got it**. Both show once.
- **Order (Bertie asked):** Day page → two plans (no sums) → **Choose**:
  - **today's plan:** it flies tomorrow; no sum (`dailyKeepCounted` 0); straight to the next day.
  - **the new plan:** **Before / after** (section 3) → **Changes sheet** sums (section 4, at most `dailyChangeCountedPerDay` 1 counted a day and `dailyChangeCountedWeek` 3 a week) → **Fly tomorrow ▶** flies the new plan. **◀ Back** on Before / after or the Changes sheet returns to the two plans with both kept, so he can choose again. (Fable to confirm the counting rule, hand-over question 7.)

## 3. Before / after opens by itself, as a graph (T7, T8)

Pictures: `03-before-after-1-todays-plan`, `-2-frankfurts-flights`, `-3-the-difference`.

- **When:** straight after he chooses the new plan, before any sums. A sheet tab **Before / after** between Week 1 and Changes (chart icon), open. Title "Before / after: today's plan and your new plan" (from week 2: "last week's plan and your new plan").
- **Graph (left, x ~213–800):** "Profit a day". Two stacked bars 150 wide (x 330 and 560, base y 610), today's plan and the new plan; under each, its name (14px bold) and "4 flights" / "3 flights". Scale £0 to the next £500 above the larger total; gridlines every £500, labels every £1,000. Each bar is split by route group (route × flights), bottom up in timetable order, in the **route's colour** (new workbook column on Routes, e.g. Dublin `#2d7f68`, Paris `#3b6aa8`, Frankfurt `#7a5aa8`), with flag, "Dublin ×2" and its profit a day inside. A route group that loses money sits below £0 in `amber`. Totals above the bars, 20px `gold`. A dashed `gold` line at the old plan's total across to the new bar.
- **Callouts, one at a time, each with Next ▸** (BEFORE / AFTER · n of 4):
  1. pointing at the old bar (new bar at 35%): "Today's plan" · "4 flights: Dublin twice and Paris twice. It made £2,170 profit today."
  2. pointing at the new bar: "Your new plan" · its flights and projected profit (placeholder, Fable).
  3. pointing at the new route's segment (that segment ringed `cyan`, the rest at 35%): "Frankfurt's two flights" · "38 passengers × £140 = £5,320 a day. After its costs, Frankfurt makes £2,397 a day: more than both Dublin flights made today." Without a new route: the biggest change.
  4. pointing at a `green` bracket from the old total to the new: "+£1,007 a day"; "The difference a day" · "Your new plan should make £1,007 more a day, with one flight fewer. Next, the sheet shows where it comes from." Button **Work it out ▶** opens the Changes tab. With this callout a small ƒ table appears (bottom right, "What changes, a day"): Flights, Passengers, Ticket revenue, Costs, **Profit**, columns Today's plan · New plan · Difference (differences coloured by meaning). It answers "the money's gone down": ticket revenue is £90 lower, costs £1,097 lower.
- Nothing to work out on this tab; everything is ƒ. Footer: "Tomorrow's plan · see what changes before the sums." ◀ Back, **Fly tomorrow ▶** dimmed.
- From week 2, a changed plan opens the same tab (replacing the Before / after tab he had to find).

## 4. Changes sheet: the new route first, then the Difference callout (T4, T5, T6)

Pictures: `04-changes-sheet-before` (as built), `04-changes-sheet-1-frankfurt-first`, `-2-difference-callout-before-the-demo`.

- **Column heads (T6):** B top line **"Today's plan"** in week 1 (the sheet is worked on the evening the plan flew), **"Last week"** from week 2; C **"With your change"**; D top "change − today's" (week 2: "change − last week"), main "Difference". Main lines name the flights: "Dublin ×2 · £100", "Frankfurt ×2 · £140", with flags. Fable has the final words.
- **1 · The new route first (T5),** when the new plan has a route today's plan didn't: crumb "Work out my plan · first, the new route". B = the flights it replaced (by time; "—" if it took free time), C = the new route's flights. Rows: Passengers a day (bars), Fare, Ticket revenue a day, Costs a day (total rule), **Profit a day** (final rule). **Everything is ƒ**, differences coloured by meaning. Line: "✓ Finance filled in Frankfurt. Nothing to work out on this part." Callout under the table, right edge on D's right edge, pointing at D6: FIRST, FRANKFURT · 1 of 3, "Frankfurt takes the place of Dublin", "Your two Frankfurt flights replace the two Dublin flights. Finance has filled them in (ƒ). Frankfurt brings in £1,520 more a day, and makes £1,307 more profit." **Next: Paris ▸**.
- **2 · Each change he works** (crumb "then, Paris"): rows as approved on 31 Oct (Passengers a day, Empty seats, Fare, Ticket revenue a day, Ticket revenue over a week (× 7), Worth keeping?). On the first change he works, **the "What the Difference column means" callout comes first (T4), before any demo**: NEW · YOUR CHANGE · 2 of 3, "Difference = With your change − Today's plan. +£10 means the fare is £10 higher. A minus means less. Watch Finance work out the first one." with **Watch ▶**. It sits **under the table**, right edge on the Difference column's right edge, pointing up at the column, which gets the `cyan` ring. Nothing is lit until Watch ▶; then the pause and Finance's demo, then his sums as approved on 31 Oct (difference a day built; over a week on paper, counted).
- Fixes T4's bug: the callout no longer runs past the sheet panel at 1366 × 768, and no longer appears after the demo.
- 3 of 3 is the whole plan's profit a day (as built), with Fly tomorrow ▶ once the last sum is done.

## 5. Launch Day: Finance shows the profit on an example column (L5, L4)

Pictures: `05-launch-day-profit-before`, `-1-watch-first`, `-2-finance-on-the-example`, `-3-his-turn`.

- **Profit step only** (Bertie chose this): the ticket revenue demo stays as built.
- **Column G** at the sheet's right: top line "Finance · made-up", main "Example", 150 wide, in the example look (2px dashed `text-soft` outline, faint diagonal stripes) over rows 1–9; values only in rows 5–8 (workbook: e.g. Total revenue £5,000, Other costs £2,900, Fuel £600, Total costs £3,500).
- To fit at 1366: option columns 118 wide with short heads ("Dublin £90", "Dublin £100", top line "your 2 flights"); Your plan 166; label column 250.
- **1 · Watch first:** callout under the sheet, right edge on G's right edge, pointing at G: LAUNCH DAY · THE PROFIT, "Now the profit for your plan", "Profit = Total revenue − Total costs. Finance shows you first, on made-up numbers in the example column. Then you work out yours." **Watch ▶**. Nothing lit; keys dimmed.
- **2 · Finance's demo** (after the pause): G9 = G5 − G8 with the pointer (G5 `cyan` A, G8 violet B, the − key lights), line "Watch: Finance clicks Total revenue, presses −, clicks Total costs, then presses Enter." G9 fills £1,500 with a green glow.
- **3 · His turn:** F9, build signal under it, "Your turn: your plan's profit · Click Total revenue, press −, click Total costs. Then press Enter. The sheet works it out." Built, not counted, as before.

## 6. Week 1 Sunday: Watch first, a callout for each method, the average both ways (S1–S4)

Pictures: `06-sunday-before` (as approved), `06-sunday-1-callout-add-each-day`, `-2-callout-sum`, `-3-finance-average-on-the-left`.

- Layout as approved and built on 31 Oct (two sheets in one panel, add each day on the left, Σ SUM on the right). Bertie: "I like this."
- **S1:** nothing starts on arrival.
- **S2:** a Sheet Callout under the left example sheet (inside its frame, pointing up at the Profit column): WEEK 1 ACCOUNTS · 1 of 2, "One way to find the week's total profit: add each day", "Finance shows you first, on made-up numbers. Then you add up your own week." **Watch ▶**. The formula bar is empty and the signal strip hidden until his turn.
- **S3:** when the right sheet appears, the same kind of callout under it: A SIMPLER WAY · 2 of 2, "Here's a simpler way to do it in a spreadsheet: Σ SUM", "Finance shows you on the same made-up numbers. Then it's your turn on your week." **Watch ▶**. (ScreenText `wk1.next`, `wk1.sum.watch` hold these words.)
- **S4 (Bertie chose):** after both totals, the **left sheet lengthens** to Days flown and Average a day and **Finance works the average there** with the pointer (B11 = B9 ÷ B10, ÷ key lit, signal WATCH "Watch: Finance works out the average a day · … Then it's your turn on the Σ SUM sheet."), the right sheet dimmed. Then **he works it on the right sheet** as approved. Built, not counted.

## 7. Week 2: the what-if sheet, a day, a week, a month (W1–W5)

Pictures: `07-what-if-1-what-if-3-more`, `-2-finance-his-fare`, `-3-his-turn-a-day`, `-4-his-turn-a-week`, `-5-a-month`.

- **Where (Bertie chose "the what-if sheet itself"):** on Monday 9 September (day `whatIfSheetFromDay` 8), the **What if** tab opens by itself in the plan step, on his busiest route (most passengers a day). This replaces the Before week 2 flies page's text panel and small sheet. **No text panel beside the sheet (W3)**: every word is in a callout on it.
- **Sheet:** title "What if you change a fare?", tabs Launch Day · Week 1 · What if (on) · Changes · Fuel, crumb "Plan week 2 · Monday 9 September", label column 300. Columns: B **your fare** (flag, "Frankfurt £140", ✓ IN YOUR PLAN), C **what if** ("Frankfurt £143": his fare + `whatIfQuestionStep` £3, with − and + in the Fare cell), D **Difference** ("what if − yours"). **The two fares stay side by side to the month row (W5).**
- **Rows appear one at a time (W4):** Seats filled a day (bars; the same in both, here 38), Fare, Ticket revenue a day, A week (× 7), A month (× 4 weeks, `whatIfMonthDays` 28; final rule).
- **Steps (W1: Finance first, then him):**
  1. Rows 1–4. Callout under C: NEW · WHAT IF · 1 of 4, "What if Frankfurt were £3 more?", "People still fill all 38 seats at £143. What would £3 more on each ticket bring in? Finance shows you first, with your fare." **Watch ▶**.
  2. Finance builds B4 = B2 × B3 with the pointer (× key lit): "Watch: Finance clicks Seats filled, presses ×, clicks Fare, then presses Enter." → £5,320.
  3. His turn, **C4 on paper (counted, P1 question 1)**: gold signal "What if: ticket revenue a day · 38 seats × £143. Work it out in your book. Write SUM n beside it. Then type your answer in C4 and press Enter." → £5,434.
  4. Finance fills D4 (+£114, ƒ, `green`) and row 5's B5 and C5 (ƒ). His turn, **D5 on paper (counted, P1 question 2)**: "A week: the difference · £114 more a day, times 7. …" formula bar `= D4 × 7`, "Difference a day × 7" → +£798.
  5. Row 6 appears, all ƒ, D6 with a green glow. Callout: A LITTLE ADDS UP · 4 of 4, "£3 more a ticket = £3,192 more a month", "A day: £114. A week: £798. A month: £3,192. Try other fares with − and +. Every figure works itself out." **Try other fares** opens the free what-if sheet (one row per route, as in hand-off 2); **Set my fares ▶** in the footer.
- Two counted questions, as PauseSchedule P1 has them; the month is shown, not asked. Over the day's cap, Finance fills C4 and D5 too.

## 8. Code only, no new look

- **L2:** What a fare does (`fare_lever`) no longer opens by itself on Launch Day; it stays on the Briefings shelf (briefing trigger row in the workbook).
- **L3:** the WHY 27? callout is dropped (ScreenText `why27` row kept, marked unused); the orange bar under 27 stays.
- **Week 2 NOW strip on Home:** words like "Week 2: your plan flies again" instead of "Running a week at a time" (Fable, the Roadmap row), so week 2 doesn't feel as if weeks have already flown.
- **Home in week 2 (S5):** Bertie isn't sure his remark was about Home. His rule stands: if Home in week 2 introduces more than one new thing, its callouts come one at a time. Otherwise leave Home as it is.

## 9. Decisions changed, and why (31 Oct 2026, evening)

Each line: what it was, what it is now, and why. Where code or DESIGN.md still follows the old rule, change it.

| Was (date) | Now | Why |
|---|---|---|
| Keep for tomorrow, then the Frankfurt card that evening (hand-off 2a, 31 Oct) | The Day page leads with Frankfurt and his % of the best plan; one button, Plan tomorrow with Frankfurt | Bertie: "It said keep for tomorrow. Then it said Frankfurt opens tomorrow." The news and its reason come before the choice. |
| Change my plan edits the plan; yesterday's plan as a dashed lane; two timetables new in week 3 (chapter-one plan) | Today's plan for reference, a blank new plan, Choose on the right; every Change my plan from week 1 | Bertie: "I do have quite lazy pupils and they might just think I'll keep it." |
| Before / after a tab he finds after the sums (chapter-one plan) | Opens by itself as a graph, before the sums, callouts one at a time | Bertie: guide them through it, like the end-of-week review graph; the money looked as if it went down because Frankfurt's own money was never shown. |
| Changes sheet: the Difference callout after the demo, to the right of the column; heads "Now · With your change" (21 Oct) | The new route first (ƒ); the callout before the demo, under the table inside the panel; "Today's plan" / "Last week" | Bertie: it came after the sum, was cut off at 1366, and "Now" read as the new plan. |
| Launch Day profit built by Finance on his own column, shown once (hand-off 2a) | Finance on a made-up example column, then he builds his own | Bertie: "do an example with fake numbers, then give the pupil an opportunity to do the clicking with the real numbers." |
| Week 1 Sunday: Finance starts on arrival; words in the signal strip; the average on the Σ SUM sheet only (31 Oct) | Watch first; a callout for each method; Finance shows the average on the add-each-day sheet, he works it on Σ SUM | Bertie: "too quickly… I wasn't really watching"; he wanted a focal point; "do that with the previous method as well." |
| Week 2 what-if questions in a text panel beside a small sheet (what-if hand-over) | On the what-if sheet: his fare and +£3 side by side, a day → a week → a month, Finance first, no text box | Bertie: "I'm less likely to read this box"; the aim is how a little money builds up over time. |
| What a fare does opens on Launch Day; WHY 27? callout (chapter-one plan, hand-off 3) | Neither on Launch Day | Bertie: less to read, don't overload them. |
| Finance demos start at once (all hand-offs) | Watch ▶, about 1.5 s pause, about 1.2 s a step (Settings) | Bertie: "a little bit too fast, especially the first click." |

## 10. Open

- **Fable:** the words in this file (the Frankfurt reason, column heads, callouts), the example figures (Launch Day example column, route colours), the Settings rows `demoPauseMs`, `demoStepMs`, and the rule for choosing between two plans (hand-over question 7). Also the earlier open items in the hand-over (questions 10 and 11).
- **Still open for Bertie, from hand-off 2a (unchanged, keep as built):** the difference from the plan on Monday rather than Sunday; View trade-offs hidden until day 22 or for all of chapter one.
- **Settled by this round:** Finance's what-if questions in week 2 are on the what-if sheet itself (P1); the earlier "free to try, no sums" stays for Try other fares.
- **Later:** with two planes (week 4) each plan in the two-plans screen has two lanes; to be drawn when the second plane arrives.

## 11. What to check in the next play-test

- Does he build a new plan rather than choosing today's straight away? Does the compare bar change his choice?
- Does Before / after's Frankfurt callout stop "the money's gone down"?
- Does the Watch ▶ pause feel right, or still too fast?
- Does the what-if month row land ("£3 more a ticket = £3,192 more a month")?
- Week 1 Sunday: does he copy the average after watching Finance do it on the other sheet?
