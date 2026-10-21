# Changes for Claude Code: play-test of 21 October 2026

## What this means (plain English, for Bertie)

Bertie played weeks 2 to 4 on 21 October and marked nine things. Each one was redrawn on his own screenshots and he approved them. This zip tells Claude Code exactly what to build:

1. The Fuel desk tour darkens everything except the panel it is talking about, starts by explaining the tank's size, and keeps the order sheet quiet until the last step.
2. The star rating screen loses the "What it is worth" panel.
3. Flight times become a small spreadsheet, centred, with the Sum 19 card under it. The pupil works out Amsterdam and Barcelona; the game fills in Frankfurt and Geneva.
4. Week 3's plan screen lists the four new routes first and points out the new Sat–Sun switch.
5. The Studio introduces "Add / change routes" and the Sat–Sun switch, one callout at a time.
6. On "Is the change worth it?" the callout moves beside the Difference column and explains +10, −10 and −£10 in words.
7. The Operations Wall graph gets a proper title, axis titles in words and its key at the top right.
8. On the Sunday review the sheet does the adding (from week 1). From week 3 the pupil uses Σ SUM by dragging down the column.
9. The review only mentions routes the pupil has been shown, and as a chance, not a loss.

Plus two items already agreed: Launch Day's first ticket sum becomes a Build, and the "How long will it take?" briefing runs in Bertie's new order.

**This zip replaces every earlier handover.** The 19 October handover is already in the build of 20 October. DESIGN.md in this zip replaces every earlier copy.

---

## 0. Rules for this round

- Everything here is year one. Gate it on the game date as CLAUDE.md asks.
- The workbook is the single source of truth for numbers and text. Where a change needs the workbook (sum lists, which sums are ƒ, callout text), change the workbook and read from it; don't hard-code. Section 11 lists the workbook changes.
- The pictures in `pictures/` are 1366 × 768 mock-ups drawn on the real 20 Oct build. The **after** pictures are the target. The figures in them come from Bertie's save (airline TEST2), not from the workbook.
- `sheet-kit/` is the shared sheet renderer used for the pictures. It now has flags for NL, DE, CH and ES and two grid-margin options (`pad`, `g`). Use it as a reference; the game's own sheet code is what ships.
- First-time callouts and tours show once. Store "seen" in the save, so a reload or a new session doesn't show them again.

## 1. Fuel desk: first-visit tour

Pictures: `01-fuel-desk-tour-before`, `-step1-the-tank`, `-step2-market`, `-step3-the-order`.

- **Darken the rest of the screen.** While a tour step is showing, everything except the panel it describes (header, sidebar, other panels and footer) sits under an overlay `rgba(1,6,14,.44)`. The described panel keeps full brightness and the active panel gradient. This is a new DESIGN.md rule for every tour, not only this one (attention system, "Local spotlight").
- **Step 1 · Your position (the tank).** The tank gauge gets a 2px `cyan` ring with a soft glow. Step text, in the box at the foot of Your position (where it is now): "**Your tank** holds 8,000 L, about two weeks of flying. The dashed line shows the 4,200 L this week needs." `1 of 3` · `Next ▶`.
- **Fix the gauge's dashed line.** It sits at about 62% of the tank's height, but 4,200 of 8,000 is 52.5%. Place it at (this week's need ÷ capacity) of the tank's inner height, measured from the bottom. Its label moves with it.
- **Step 2 · Market.** Market panel lit. The step box sits in the empty space under the Market panel (same width as Market), pointer up: "**Market:** today's price for a litre, and what it might cost next week. The news underneath says why." `2 of 3` · `Next ▶`.
- **Step 3 · Place a purchase order.** Order panel lit. The step box sits in the same place under Market, pointer pointing left at the order panel: "**Place a purchase order:** choose how many litres to buy. Then build the cost on the sheet and work it out in your book." `3 of 3` · `Got it`.
- **Hold the order sheet back** until step 3. In steps 1 and 2 the order sheet is idle: no lit block, no magenta answer cell or "?", no caret, an empty formula bar (name box blank, `fx` only, no operator keys) and no build line under the grid. At step 3 it becomes what the build shows now.
- Because the step boxes for steps 2 and 3 sit outside the order panel, the order panel never needs scrolling.

## 2. Star rating

Pictures: `02-star-rating-before`, `-after`.

- Remove the **What it is worth** panel (Bertie, 21 Oct).
- **What moves it from now** moves up into that row and runs the full width of the content area. Its rules reflow onto one line each.
- Nothing else on the screen changes.

## 3. Flight times on a small sheet

Pictures: `03-flight-times-before`, `-after-sheet`.

- The table and the separate Sum 19 panel are replaced by a **small Sheet** (DESIGN.md: Sheet, Small Sheet), because every sum is on the spreadsheet.
- **Layout:** the sheet is centred in the content area and wide (about 1000 px at 1366 × 768). The SUM card sits under it, full sheet width, in one row: gold `SUM 19` tag · "Flight time = distance ÷ speed" · on the right, "Twin Otter to Amsterdam" in `text-soft`.
- **Columns:** A route (flag + name) · B **Distance** · C **Speed** (top line: the aircraft, "Twin Otter") · D **Flight time**. One row per new route.
- **The sum:** a Build the first time (first sum of a new kind): he clicks B2 then C2, the formula bar shows `= B2 ÷ C2` and "Distance ÷ Speed", with A / B tags in click order. The answer cell takes hours and minutes: a small box for hours, "h", a minutes list (0, 15, 30, 45), "min". Never a decimal.
- **Which routes are his:** Amsterdam (450 km → 1 h 30) and Barcelona (1,125 km → 3 h 45). The game fills in Frankfurt and Geneva (both 675 km → 2 h 15). They were swapped because Frankfurt and Geneva are both 675 km, so showing Geneva's time gave away Frankfurt's answer. This is a workbook change (section 11).
- **ƒ rows:** the game's flight times carry ƒ and grey figures (`#8fa6c4`), with "ƒ worked out for you" under the grid. Barcelona's cell stays blank until its turn.
- Line under the grid: "Work it out in your book. Write **Sum 19** beside it, then type the time in **D2**." + "Give me a hint".
- Footer text: "Work out the flight times on the sheet, then go on to the timetable."

## 4. Week 3 plan opener: what's new comes first

Pictures: `04-week3-plan-opener-before`, `-after`.

- **This week, first row** in the week routes open: plane icon in `cyan`, a `NEW` tag, "Four new routes open: Amsterdam, Frankfurt, Geneva and Barcelona." and the link "Add a route ›" (opens the Studio's Add / change routes). The route names come from the workbook's routes for that week. The panel (and the left panel beside it) grows to fit; the timetable panel moves down.
- **Sat–Sun switch, first-time callout** (the first week Days exist): the switch gets the 2px `cyan` ring. The callout (Sheet Callout look) sits in the empty part of the timetable panel and is joined to the switch by a 2px `cyan` leader line that runs down from the switch, along the gap under the hour labels, and down through a turnaround gap, never through a flight block or text. Eyebrow `NEW · WEEKENDS`; title "Plan Saturday and Sunday on their own"; text "Different numbers of people want to fly at the weekend. Switch to **Sat–Sun** to see the weekend's flights, then edit the plan to fit."; `Got it`. Shows once.

## 5. Week 3 Studio: one callout at a time

Pictures: `05-week3-studio-before`, `-after-1-new-routes`, `-after-2-weekends`.

- First visit in the week routes open: **Add / change routes** gets the ring, with a callout under it (pointer up, right-aligned to the button): eyebrow `NEW · ROUTES`; title "Four new routes open this week"; "Amsterdam, Frankfurt, Geneva and Barcelona. Add one here, then give it flights on the timetable."; `Got it`.
- Then the **Sat–Sun switch** gets the ring and its own callout, placed inside the empty "Select a flight to change it." box (one row: eyebrow `NEW · WEEKENDS`, title "Plan Saturday and Sunday on their own", "Different numbers of people want to fly at the weekend. Switch to **Sat–Sun** to see them, and give those days their own flights.", `Got it` on the right). The leader line runs left from the switch along the header row and down the clear gap between the left label column and the chart (x ≈ 362 at 1366 wide) to the callout. It must not cross the demand bars, the "Select a Dublin flight…" line or the flight blocks.
- Only one callout at a time; each shows once. If the pupil already dismissed the weekends callout on the plan opener, the Studio still shows its own once (it is where flights are changed).

## 6. "Is the change worth it?": callout beside the Difference column

Pictures: `06-changes-sheet-before`, `-after`.

- The first-time callout moves to the right of column D, pointer left, so rows 5 to 8 stay visible. Column D (D1:D4) gets the 2px `cyan` ring while it is open.
- Text: eyebrow `NEW · YOUR CHANGE`; title "What the Difference column means"; "**Difference = [A] With your change − [B] Now**"; "**+10** means 10 more passengers a day. **−10** means 10 fewer empty seats. **−£10** means the fare is £10 lower."; "First, work out **D5**: the difference in ticket revenue a day."; `Got it`. The numbers come from the plan change on screen.
- The line under the grid while the callout is open: "Read the note beside the sheet, then press **Got it**."

## 7. Operations Wall: the profit graph

Pictures: `07-ops-wall-graph-before`, `-after`.

- **Title follows the tab:** "PROFIT EACH WEEK" on Weeks, "PROFIT EACH DAY" on This week by day.
- **Key at the top right**, on the title's row: "Profit each week" (bar swatch) · "Projected" (dotted) · "Seats filled (right)" (green line). Nothing at the bottom left, where the play-notes recorder sits.
- **Axis titles in words:** "Profit (£)" above the left axis, "Seats filled (%)" above the right axis.
- **Round ticks** on the left: £0, £5,000, £10,000, £15,000 (choose round steps from the data). The old "£9,000" label sat at £8,500.
- **Bars labelled** "Week 1 / 2–8 Sep", "Week 2 / 9–15 Sep", "Week 3 / 16–22 Sep" (dates from the game calendar).
- The current week's bar says "so far: Monday" (the day the week has reached) above it, in `cyan`.
- Bars, projections and the seats line stay exactly as they are.

## 8. Sunday review: the sheet does the adding

Pictures: `08-review-sums-before`, `-weeks1-2`, `-week3-1-callout`, `-week3-2-dragging`, `-week3-3-done`, `-average`.

Bertie: "I'm not expecting them to add up that many numbers." He decided the sheet does the adding **from week 1**.

- **Formula-only sums** (new DESIGN.md rule): he builds the formula by clicking cells and the sheet shows the answer at once (money in gold, then the usual `green` light). Nothing in his book, no Sum number. In year one these are **Profit this week** and **Average a day**.
- **Profit this week, weeks 1 and 2:** he clicks Mon to Sun into the formula one at a time (`= B2+B3+B4+B5+B6+B7+B8`, cells outlined, no tags); after the seventh cell the sheet fills in the total.
- **Profit this week, from week 3: Σ SUM.** The formula bar's keys gain **Σ SUM** before × ÷ + −. He presses it, then drags down the Profit column from Monday's profit to Sunday's: a dashed `cyan` outline follows the drag over B2:B8, the bar shows `=SUM(B2:B8`, and while dragging the lit block's solid frame is hidden. He lets go and presses Enter; the bar shows `=SUM(B2:B8)` and "add Mon to Sun = £20,434", and the sheet fills in the total.
- **First time Σ SUM appears** (week 3 review): a Sheet Callout to the right of the sheet, pointer left at the Profit column: eyebrow `NEW SKILL · SUM`; title "Add a whole column at once"; "Press **Σ SUM**, then drag down the **Profit** column, from Monday's profit to Sunday's."; "The sheet adds every cell you drag over: **=SUM(B2:B8)**."; `Got it`. Lines under the grid: while waiting, "Press **Σ SUM**, then drag down the Profit column from Mon to Sun. The sheet adds them up."; while dragging, "Let go on Sunday's profit (B8), then press Enter."; done, "✓ The sheet added the seven days: **£20,434**. Next: the difference from the plan, in your book."
- **Average a day (every week):** he clicks Profit this week and Days flown (`= B9 ÷ B12`) and the sheet works it out (£20,434 ÷ 7 = **£2,919** a day, rounded to the nearest pound). Line: "✓ The sheet worked out the average: **£2,919** a day."
- **Difference from the plan stays a book sum** (Sum n): £20,434 − £20,329 = +£105.
- **The card beside the sheet:** formula-only sums show a `cyan` **FORMULA** tag and the rule in words ("Profit this week = add the seven days"; "Average a day = profit this week ÷ days flown"); book sums keep the gold SUM n badge.
- **Footer text** on the review: "Build each formula by clicking the cells. The sheet adds up; work out the difference from the plan in your book."

## 9. Sunday review: routes not flown yet

Pictures: `09-review-unflown-routes-before`, `-after`.

- The review names a route he hasn't flown **only once a plan screen has shown it to him** (section 4 now does, in the week the routes open). Before that, say nothing about it.
- Then it reads as a chance: a panel with a `cyan` left rail (not amber): "**You could fly these new routes.** Red Kite flies them for now, so fewer people are left wanting to fly with you each day: Amsterdam 73 → 68 · Frankfurt 50 → 45 · Geneva 23 → 20 · Barcelona 68 → 60". Figures from the game as now.

## 10. Also in this round

- **Launch Day:** the first ticket sum becomes a **Build** (he clicks the cells); the other columns stay Calculate. Workbook: SheetSums `launch.tickets`, how = build (Bertie said yes on 20 Oct).
- **Briefing "How long will it take?"** is rebuilt in Bertie's order: why it matters first, then the sum worked on screen step by step, then the ruler last, as the check. The scenes are in the Claude Doc **"Operations Briefings — scene by scene"**, section 10 (six scenes). Build this briefing only; the doc's other briefings wait for Bertie's ticks. In short:
  1. Show · Why it matters: a Saab 340 (450 km/h) and his Twin Otter (300 km/h) leave London for Amsterdam (450 km) side by side; the Saab lands, turns round and sets off again while the Twin Otter is still flying. "A faster plane fits more flights into a day, but it can cost more in fuel."
  2. Predict · "How long will the Twin Otter take?" (1 hour, 1 h 30, 2 hours, Not sure). It is two-thirds of the way there when the Saab lands.
  3. Reveal · The whole hours: 450 km ÷ 300 km/h; 300 goes into 450 once: 1 hour, 150 km left over. "You predicted: …" beside it.
  4. Reveal · The part left over: 150 km is half of 300 km, so 30 minutes. 1 hour + 30 minutes = 1 h 30 min.
  5. Reveal · The ruler checks it: one hour to the 300 km mark, then the last 150 km in quarter hours. It lands at 1 h 30, the same as the sum.
  6. Use · His routes: the Flight times sheet (section 3).
  Drop the caption "Flying there one hour at a time, less than an hour to go".

## 11. Workbook changes

| Where | Change |
|---|---|
| SheetSums | New value for `how`: **formula** (he builds the formula; the sheet shows the answer; no book, no Sum number). |
| SheetSums, Sunday review (D61: total, difference, mean) | Total → how = formula, all weeks (click cells in weeks 1–2; Σ SUM from week 3). Mean (Average a day) → how = formula, all weeks. Difference stays a book sum. Renumber the later Sum numbers so they stay consecutive, and keep the printed learning record in step. |
| SheetSums, week 3 flight times | His sums: Amsterdam (Sum 19) and Barcelona. ƒ: Frankfurt and Geneva. |
| SheetSums `launch.tickets` | how = build. |
| Callout text (wherever the workbook keeps screen text) | The new callout and tour texts in sections 1, 4, 5, 6 and 8. |
| Skills | Σ SUM unlocks at the week 3 review. |

## 12. What to check in the next play-test

- Tour: is the darkening enough, and can he still read the darkened panels if he needs them?
- Does the tank's size land at step 1, before he buys fuel?
- Flight times sheet: can he enter "1 h 30" without help? Does he notice Frankfurt and Geneva are done for him?
- Week 3: does he open Add / change routes and fly at least one new route? Does he try Sat–Sun?
- Σ SUM: does he drag the profit cells (not the day names)?
- Do the A / B tags clash with the column letters anywhere (for example B2 tagged A)? Note it if it confuses him.
