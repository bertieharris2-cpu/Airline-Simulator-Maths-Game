# The 21 October play-test, in the game (21 October 2026)

Bertie played weeks 2 to 4 on 21 October and marked nine things. Claude Design redrew each one on his own screenshots, and he approved them. The handover zip has:
- the changes (`1-READ-FIRST`, kept in `data/incoming/handover-21-oct/`);
- the pictures, whose **after** versions are the targets;
- the DESIGN.md of 21 October, now installed;
- the sheet kit.

Two items agreed earlier are built in the same round: Launch Day's first ticket sum becomes a Build, and "How long will it take?" plays in Bertie's new order.

Everything is in **year one only**, as CLAUDE.md asks:
- the CSS sits under `body.yr1`;
- the behaviour sits behind `yearOne()`;
- chapters 3 and 4 keep today's look, and their tests pass as before (see Tests).

Screenshots of every changed screen are in `docs/screenshots/o21/`, at 1366 × 768 and 1920 × 1080. They use Bertie's own airline (TEST2), so the figures match the handover's pictures.

The code is in `src/opening/parts/p5y_h21.js` and `p1_head_h21.css`, with small hooks in the Sheet (`p5t`), the Fuel desk (`p5q`), the review and order sheets (`p5v`), the sheet pages (`p5u`), the star rating (`p5w`) and the briefings (`p5f`). The game still has 120 overridden functions; everything new is a reassignment.

## What changed

### 1. Fuel desk: the first-visit tour
- **The rest of the screen is darkened** (`rgba(1,6,14,.44)`) while a step shows. The panel it describes and its step box stay bright. The darkening never stops a click.
- **Step 1 is the tank.** The tank gauge gets a cyan ring, and the box at the foot of Your position says: "Your tank holds 8,000 L, about two weeks of flying. The dashed line shows the 4,200 L this week needs." The figures are the pupil's own.
- **The gauge's dashed line is in the right place:** this week's need ÷ the tank's capacity, measured on the tank's inner height. 4,200 of 8,000 L is 52.5%, where before it sat at about 62%. Its label moves with it, and drops below the line when the line is near the top.
- **Steps 2 and 3** sit in the empty space under Market, as wide as Market. Step 2's pointer points up at Market; step 3's points left at the order panel and ends with Got it.
- **The order sheet is held back until step 3.** In steps 1 and 2 it is idle: no lit block, no magenta "?", an empty formula bar (fx only, no keys) and no line under the grid.

### 2. Star rating
- The **What it is worth** panel is gone.
- **What moves it from now** moves up into that row and runs the full width, one line per rule.

### 3. Flight times on a small sheet
- **The table and the separate Sum panel are one small Sheet**, centred and about 1,000 px wide at 1366 × 768.
  - The columns are the route (flag and name), Distance, then Speed and Flight time for each aircraft type (the aircraft named above Speed).
  - The SUM card sits under the sheet in one row: the gold SUM n tag, "Flight time = distance ÷ speed", and "Twin Otter to Amsterdam" on the right.
- **The first flight time is a Build.** He clicks B2 then C2: the bar shows `= B2 ÷ C2` and "Distance ÷ Speed", with A and B tags in click order.
- **The answer cell takes hours and minutes:** a small box for the hours, "h", a minutes list (0, 15, 30, 45), "min". Never a decimal.
- **His routes are Amsterdam (1 h 30) and Barcelona (3 h 45)**, read from the workbook (SheetSums).
  - The game fills in Frankfurt and Geneva (both 2 h 15) with ƒ and grey figures, and "ƒ worked out for you" under the grid.
  - Barcelona's cell stays blank until its turn.
- **The rest works as the other sheets do:**
  - two tries, then Finance fills the cell;
  - Give me a hint (the whole hours, then the part left over);
  - the record;
  - the flight-time decay counts each one.
- **The footer** says "Work out the flight times on the sheet, then go on to the timetable." Next sum appears while one is left; then On to the timetable.

### 4. Week 3 plan opener: what's new comes first
- **The first row of This week** in the week routes open: a cyan plane, a NEW tag, "Four new routes open: Amsterdam, Frankfurt, Geneva and Barcelona." and **Add a route ›**, which opens Add / change routes. The panel grows to fit.
- **The Sat–Sun switch** (the first week Days exist) gets the cyan ring and a callout in the empty part of the timetable panel.
  - A cyan leader line runs from the switch along the gap under the hour labels and down through a turnaround gap. It never crosses a flight block or text.
  - The callout shows once.

### 5. Week 3 Studio: one callout at a time
- **First, Add / change routes** gets the ring, with its callout under it (pointer up, right-aligned to the button).
- **Then the Sat–Sun switch** gets the ring and its own callout, inside the empty "Select a flight to change it." box. The leader line runs left along the header row and down the gap between the label column and the chart.
- **Only one callout at a time, and each shows once.** "Seen" is kept in the save, so a reload doesn't bring them back. Opening Change network counts as having seen the routes callout.

### 6. "Is the change worth it?": the callout beside the Difference column
- **The callout moves to the right of column D**, pointer left, and D1:D4 get the cyan ring while it is open. Rows 5 to 8 stay visible.
- **It explains each sign in words**, from the plan change on screen: "+10 means 10 more passengers a day. −10 means 10 fewer empty seats. −£10 means the fare is £10 lower."
- **The line under the grid** says "Read the note beside the sheet, then press Got it."

### 7. Operations Wall: the profit graph
- **The title follows the tab:** PROFIT EACH WEEK, or PROFIT EACH DAY.
- **The key sits at the top right**, on the title's row: Profit each week, Projected (dotted), Seats filled (right).
- **The axes have titles in words:** "Profit (£)" and "Seats filled (%)".
- **The ticks are round:** £0, £5,000, £10,000, £15,000.
- **The bars are labelled** "Week 1 / 2–8 Sep" and so on, from the game calendar.
- **The week in progress** says "so far: Monday" above its bar.
- The text is drawn larger on the big wall screen, so it stays readable when the game is scaled down.

### 8. Sunday review: the sheet does the adding
- **Profit this week and Average a day are formula-only sums.** He builds the formula by clicking cells, and the sheet shows the answer at once.
  - Nothing goes in his book, and there is no Sum number.
  - The card shows a cyan FORMULA tag and the rule in words.
  - The record keeps them as Formula.
- **Weeks 1 and 2:** he clicks Mon to Sun into the formula one at a time, and after the seventh the sheet fills in the total.
- **From week 3: Σ SUM.** The formula bar gains a Σ SUM key.
  - He presses it and drags down the Profit column from Monday to Sunday. A dashed cyan outline follows the drag, and the bar shows `=SUM(B2:B8`.
  - He lets go and presses Enter. The bar shows `=SUM(B2:B8)` and "add Mon to Sun = £20,434", and the sheet fills in the total.
  - Dragging down the day names, or the wrong column, gets a plain hint.
  - Σ SUM unlocks on the Calendar's day 21 (the week 3 review), so the date sits in the workbook.
- **The first time, a callout** to the right of the sheet (NEW SKILL · SUM) explains it, with the lines under the grid as the handover gives them.
- **Average a day:** he clicks Profit this week and Days flown; £20,434 ÷ 7 = £2,919 a day.
- **The difference from the plan stays a book sum**, with its Sum number.
- **The footer:** "Build each formula by clicking the cells. The sheet adds up; work out the difference from the plan in your book."
- **Sum numbers stay consecutive.** Each week has two fewer numbered sums now, so the later numbers come sooner, and the printed record follows the same numbers.

### 9. Sunday review: routes not flown yet
- **A route he hasn't flown is named only once a plan screen has shown it to him.** The opener's NEW row, the Studio callout and Change network all count, and the save keeps which routes were shown.
- **It reads as a chance,** in a panel with a cyan left rail: "You could fly these new routes. Red Kite flies them for now, so fewer people are left wanting to fly with you each day: Amsterdam 73 → 68 · Frankfurt 50 → 45 · Geneva 23 → 20 · Barcelona 68 → 60" (the game's own figures).

### 10. Launch Day, and "How long will it take?"
- **Launch Day's first ticket sum (B4) is a Build.** He clicks B2 × B3, then works it out in his book (Sum 1). C4 and D4 stay Calculate (Sums 2 and 3). The workbook's SheetSums says which cell is which.
- **"How long will it take?" in Bertie's six scenes** (the scene-by-scene doc, section 10):
  1. **Show · why it matters.** A Saab 340 (450 km/h) and his Twin Otter (300 km/h, in his colours) leave London for Amsterdam, 450 km. The Saab lands after 1 hour and turns round while the Twin Otter is still flying. "Planes fly at different speeds, so the same trip takes different times. A faster plane fits more flights into a day, but it can cost more in fuel."
  2. **Predict.** "How long will the Twin Otter take?" 1 hour · 1 h 30 · 2 hours · Not sure. Its track is marked in thirds: "Two-thirds of the way after 1 hour".
  3. **Reveal · the whole hours.** The sum appears, set out as he would write it: 450 km ÷ 300 km/h; 300 goes into 450 once: 1 whole hour; 450 − 300 = 150 km left over. "You predicted: …" shows in the words.
  4. **Reveal · the part left over.** 150 km is half of 300 km: 30 minutes; 1 hour + 30 minutes = **1 h 30 min**.
  5. **Reveal · the ruler checks it.** Only now the ruler: one hour to the 300 km mark, then two quarter hours. It lands at 1 h 30. "The sum and the ruler agree."
  6. **Use · his routes.** His new routes as the Flight times sheet sets them out (his to work out, and the sheet's ƒ), then **To the flight times**.
- **What else changed in the briefing:**
  - The caption about flying one hour at a time is gone.
  - Nothing is ever a decimal.
  - The example's route and planes are named in the workbook (BriefingData), and their distance and speeds come from the Routes and Aircraft sheets.
  - A later chapter keeps the scenes from before.

## The workbook (section 11)

| Where | Change |
| --- | --- |
| SheetSums | `how` can be **formula**. Launch Day B4 is a build (Sum 1) and C4 · D4 book (Sums 2–3). The review's Profit this week and Average a day are formula (no Sum number); the difference is a book sum. Week 3's flight times: Amsterdam (his Build) and Barcelona (his book), Frankfurt and Geneva ƒ. |
| ScreenText (new sheet) | The tour, callout, line and card words of sections 1, 3, 4, 5, 6, 8 and 9: 28 rows with id, screen, eyebrow, title, text (lines split by \|) and button, and a note row. The game keeps the same words for a workbook without the sheet. |
| Calendar, day 21 | Unlocks the skill `sumDrag` (Σ SUM). |
| Briefings, flight_time | The six scenes in its show / predict / reveal / use columns; 70 seconds. |
| BriefingData, flight_time (new rows) | route Amsterdam, plane Twin Otter, fasterPlane Saab 340: names only. The importer checks that they exist, and that the faster plane is faster. |

The importer (`tools/import_world.py`) reads all of this. Its report has 0 to fix.

## Where I went my own way, and what needs Bertie
1. **Scene 1 of the briefing: the Saab doesn't take off again in the picture.** The game turns a plane round at Amsterdam in 45 minutes, so the Saab would leave at 1 h 45, after the Twin Otter has landed at 1 h 30. The scene shows the Saab land after 1 hour and turn round to face home while the Twin Otter is still in the air, and the words still say a faster plane fits more flights into a day. If Bertie wants it to take off anyway, that is a small change.
2. **The formula triangle.** The doc's "Decision for you" on section 10 (keep the triangle as a reference card he can open later) isn't answered yet. The year-one briefing has no triangle, and no reference card is built.
3. **First-time callouts cover what is under them until Got it**, as in the pictures. The Studio's routes callout sits over the route rows' Edit fare links. A pupil has to press Got it first. The week test now presses it, the way a pupil would.

## Tests

(filled in below once the full run is done)

## What to check in the next play-test (section 12)
- Tour: is the darkening enough, and can he still read the darkened panels if he needs them?
- Does the tank's size land at step 1, before he buys fuel?
- Flight times sheet: can he enter "1 h 30" without help? Does he notice Frankfurt and Geneva are done for him?
- Week 3: does he open Add / change routes and fly at least one new route? Does he try Sat–Sun?
- Σ SUM: does he drag the profit cells (not the day names)?
- Do the A / B tags clash with the column letters anywhere (for example B2 tagged A)? Note it if it confuses him.
- "How long will it take?": which answer does he predict, and does the ruler at the end convince him?
