# Year one on the Sheet (Claude Design handover, 19 Oct 2026, evening)

*Claude Code, 19 October 2026, for Bertie. The brief is Claude Design's handover of 19 Oct, evening (`1-READ-FIRST-changes-for-claude-code.md`, `DESIGN.md`, `sheets/`, `launch-day-sheet/`, `cash-tank-profit/`, `what-a-fare-does/` and `operations-briefings-kit/`), with workbook v6.0 and Balance Report v6.0. You chose "data now, D104 after": workbook v6.0 went in first (commit 5ca2944), then this handover. Fable's D104 (growth, stars from week 3, demand ranges, the six curveball events, track B) is next.*

Everything here is in year one only: Launch Day (Mon 2 Sep 2030, day 1) to the year-1 accounts (Sun 31 Aug 2031, day 364). The gate is the same as Batch 2's: `yearOne()` for behaviour, `body.yr1` for CSS, `ashOn()` for the Sheet. From day 365 every screen and rule is as it was.

## 7.1 The Sheet

One Sheet component (`parts/p5t_sheet.js`, styles in `p1_head_sheet.css`) draws every year-one sum, in the Airline look from DESIGN.md:
- column letters and row numbers, a header band with the cyan underline, flags in the column headers, a line icon in each row label;
- seat-fill bars (green or amber, never red) and FULL chips in passenger cells, ƒ on cells the airline works out, icon tabs at the top right;
- a formula bar: the name box (the answer cell), fx, the formula in cell names and the same in words.

How a sum is built:
1. The part being worked lights; the rest of the sheet dims to 62%. The answer cell shows a magenta "?".
2. For a Build, the pupil clicks the cells. Each gets a cyan outline and an A / B tag, and goes into the formula bar. Operators come from the square keys at the end of the bar (or the keyboard: `*` or `x`, `/`, `+`, `-`), with Undo (or Backspace). A cell or operator that doesn't fit gets an amber question about what it means, never "wrong" or red, and the formula stays as it was.
3. The answer cell becomes the input (magenta outline, a gold £ only for money), and the line under the grid says "Work it out in your book. Write **Sum n** beside it, then type the answer in **F9** and press Enter."
4. Right: the cell fills and lights once, and Next sum ▶ lights (Enter also goes on). Wrong: the outline turns amber and the line says what went wrong in the pupil's own numbers ("Check your working in the book: 37 lots of £3."), without giving the right figure. After two tries Finance fills the cell (FINANCE on it) and the line says to copy it into the book beside the sum.
5. "Give me a hint" and "Show me how" are links at the end of the line.

The first time a kind of sum appears, a **Sheet Callout** pinned to its rows says what the sum is, with the rule and its A / B tags but no figures. Got it closes it, and an "i" on the row label opens it again.

**Tabs.** Launch Day, the latest week, Changes (from week 2, once a change is kept) and Fuel (once an order is placed). A tab that doesn't exist yet is dimmed; a finished sheet opens read-only.

**Which sums are the pupil's.** The workbook's new SheetSums sheet says, per sum, whose it is (the pupil's or ƒ) and how it is done (in the book, built, built once). The game reads `how` from there (7.10).

## 7.2 The Studio

- A change in the Studio never opens a sum: the Worth Sum Callout is gone in year one. The timetable and the seats at each fare update at once.
- The pressed flight's Change row keeps **Undo**, which takes the last change back (every change on the plan page is kept until the step changes).
- The button to the sums reads **Work out my plan ▶**.

## 7.3 The Launch Day sheet

One sheet holds every Launch Day sum, columns A–F (A labels; B, C, D the market's three fares; E the other route; F Your plan) and rows 1–13:
- 2 Passengers, 3 Fare, 4 Ticket revenue;
- in the Your plan column: 5 Total revenue, 6 Other costs ("What's in this?" lists them), 7 Fuel burned (£0, "free on Launch Day"), 8 Total costs, 9 Profit;
- a Cabin sales block: 10 the two snack prices, 11 Passengers buying snacks, 12 Snack price, 13 Cabin sales.

Sums 1–3 are the tickets at three fares (B4, C4, D4, in the book), sum 4 the other route's tickets (E4), sum 5 the profit (F9), sums 6–7 the cabin sales (B13 built by clicking, then C13 in the book). Nothing about fuel is asked here. When every sum is done nothing dims, the line reads "✓ Launch Day sheet done. Profit £… a day · cabin sales £… at £3, £… at £5.", the formula bar keeps the profit's formula, and the footer goes on.

## 7.4 Plan changes (from week 2)

**Work out my plan ▶** opens the Changes tab when the plan differs from the one the week began with: "Is the change worth it?", with columns B Now, C With your change and D Difference.
- **A fare change** gets its own sheet: Passengers a day (with seat-fill bars), Empty seats, Fare, Ticket revenue a day (ƒ), Over a week (× 7, ƒ), then Worth keeping?. The pupil's sum is **D5 = C5 − B5** ("With your change − Now").
- **A timetable or cabin change** is one sheet: Flights a day, Passengers a day, Empty seats, Revenue a day, Costs a day, Profit a day, Over a week, Worth keeping?. The sum is **D7 = C7 − B7**.
- After the answer, Worth keeping? says so in words: "✓ Yes, +£60 a day" in green, or "Not worth keeping: −£760 a day" plain. Back returns to the plan to undo it.
- The first difference is built by clicking; after that it goes to the book (SheetSums: "build once").

## 3.4 / 7.5 Event sums, the Sunday review and the fuel order

- **Event sums** (Stay with you, Business travellers today): the rows-of-ten picture, then a small Sheet with the sum's rows: Your passengers, Stay with you in every 10, Stay with you. People have no £. If the exact figure isn't a whole number (34 × 0.7 = 23.8), 24 is the answer and 23.8 is accepted with "People come whole: 23.8 rounds to 24."
- **The Sunday review** is three columns:
  - left, what happened: seat fill, each day, the fuel advantage, the routes;
  - middle, the week's sheet with its formula bar: the seven days, Profit this week, Projected on Monday, Difference from the plan, **Days flown = 7** and Average a day;
  - right, only the gold SUM n badge and the rule in words.

  Each sum is clicked (a Build), then typed into its cell. When the last one is in, the right column signs the accounts off, with "How good was the plan?" under it.
- **The fuel order** is a small Sheet in the Fuel desk's order panel: Litres to buy × Price a litre = Cost of this order (B4 = B2 × B3). Confirm waits for it. Every order placed goes on the Fuel tab.

## 3.6 / 7.6 The Fuel desk from Launch Day

- The desk is open from Launch Day (Settings `fuelDeskOpensDay` = 1), and the sheet's footer goes on to it ("Fuel desk ▶"). The week's order is placed there. Fuel is still free on Monday and Tuesday of week 1, so the week's need counts only Wednesday to Sunday.
- **The first visit:** Cash, tank, profit, then the desk's three-panel tour, then the order.
- **Launch Day's order** arrives for Wednesday at Wednesday's price and is paid from the pupil's cash when it arrives: "Fuel is free until Wed 4 Sep. An order placed today arrives for Wed 4 Sep at Wednesday's price, £1.30 a litre, and is paid from your cash when it arrives." What can be ordered is limited by the cash there will be on Wednesday.
- The position panel carries the Fuel Tank's words: "Fuel you buy waits in your tank. Each day pays for the fuel it burns."
- The Fuel line on every sheet is the fuel burned that day.

## 7.7 No guesses in any briefing

Every year-one briefing is **Show → Reveal → Use**. The kit's stepper has those three steps, and its footer has **◀ Back** and **Next ▶**:
- Next is always allowed. Pressed during an animation, it finishes the beat.
- Back replays the scene to the beat before.
- Nothing asks the pupil to predict, guess, tap or pick an answer.
- An Operations Request at the end (Weekdays and weekends, One big Saturday, A year of demand) and Briefing 13's decisions stay. While a decision is open, Next waits for it.

The briefings changed:
- **More demand than seats**, **Two planes, one route**, **How long will it take?**, **Renting a plane**: the question is the caption ("Let's work it out."), and the next beat answers it. The tap, drag or slider has gone; the scene plays by itself.
- **Weekdays and weekends**: both taps have gone. "Some days look different from the rest." then Next; the weekend lights up by itself; the request stays.
- **One big Saturday**, **A year of demand**: the taps and the drag have gone; the requests stay.
- **Customers have a choice** (3.8), in three beats:
  1. Show: Red Kite taxis in.
  2. Reveal: the passengers walk across while the rule builds ("£60 dearer → 6 in 10 → 18 of 30").
  3. Use: "12 stay with you: 4 in every 10."
- **Can you afford to run it?** (5): no guesses. The reserve line, Buy and Fly, and Buy it / Not now are decisions and stay.
- **What a fare does** (6):
  - Beat 5 is the two planes, with the question as its caption ("Which plane makes more ticket money? Let's work it out."), no buttons.
  - Beat 6 is design B. The seats become ticket money as bars. Then the Airline-look sheet works it out: B4 = B2 × B3, C4 = C2 × C3, B5 = C4 − B4, "+£80". There is no "Your guess" line.
  - The stepper is Show · Reveal · Use.
  - Beat 6's closing line ("One empty seat, but £80 more ticket money.") now takes two lines. In the screenshots it ran past its panel at both sizes, because the page scales as one stage.
- **Profit is not cash** (chapter 3) keeps its earlier frame and tap in the game.

## 7.8 Cash, tank, profit (version A)

Four beats on the workbook's example (BriefingData `fuel_cash_tank_profit`: cash £8,600, 3,000 L at £1.30, a 5,000 L tank, 600 L a day for five days):
1. **Show, what fuel is:** the price board drops in ("FUEL PRICE · A LITRE", £1.30 in gold, ten weeks of prices with today cyan).
2. **Show, buying:** £3,900 leaves the bank, the tank fills, profit stays £0. The button is **Fly the week**.
3. **Show, the week flies:** Wednesday to Sunday each burn 600 L. Each row shows the fuel burned, other costs and tickets (gold), and "Still in the tank" at the end.
4. **Reveal, the rule:** the Fuel burned column is framed in cyan: "Wed to Sun: 5 × £780 = £3,900, the whole bill, a day at a time". The caption ends "Each day pays for the fuel it burns." **Go on ▶** opens the order (the Use).

## 7.10 The workbook records D105+

`data/Airline-World-Workbook.xlsx` (the before copy is kept out of the repo):
- **Settings:** a new row `fuelDeskOpensDay` = 1, with notes on `fuelDeskFromDay`, `launchDaySums` and `fuelHandSum`.
- **SheetSums** (new): 17 rows for the Launch Day sheet, Changes, the event sums, the Sunday review and the fuel order. Each gives the cell, its row, the formula and its words, whose it is (the pupil's or ƒ), how (book, build, build once, airline), its number in week 1 and the game's sum id.
- **BriefingData:** Cash, tank, profit's example keys.
- **Briefings:** the beat-2 column is now "what plays instead" of a guess, and the rows say what changed. The README sheet has a D105 line.
- **The importer** (`tools/import_world.py`) reads SheetSums and each WorkingMethods row's hint template, with checks, and the import report has a "D105 touches" section. The result is "0 to fix, 27 to check, 7 notes" (the same 27 and 7 as before, plus the new lines).

## Screens changed beyond the ones named

All in year one only.

| Screen | What changed |
| --- | --- |
| The Sunday review, left column | The fuel advantage line is a compact two-column panel, so the column fits at 1366 × 768. |
| The Sunday review, right column | "Accounts signed off" and "How good was the plan?" appear as soon as the last sum is in. |
| The Fuel desk | The order's callout sits beside the small sheet (over the panel's spare room), so the order fits at 1366 × 768. The panels' padding is a little tighter. The tank's words are under the position panel's note. |
| Event sum pages | The whole-people line; when done, the formula bar keeps the sum's formula and its answer. |
| Every kit briefing's frame | The Show · Reveal · Use stepper replaces the four marks; ◀ Back sits beside Next ▶. This also applies to every briefing page opened on its own. |
| More demand than seats, Two planes one route, How long will it take?, Renting a plane, One big Saturday, A year of demand, Weekdays and weekends, Can you afford to run it? | The tap, drag or slider has gone (7.7); the scenes play by themselves. |
| The teacher's test kit (Run) | It answers sums on the sheet and presses the Changes tab's Next (not a pupil screen). |
| The teacher's record | A timetable change worked out on the Changes tab is kept as the route it touched ("Paris extra flight"), not the plan's first route. |
| The Sunday review, the week's sheet | The difference cell gives the short answer ("£2,780 less", "£1,206 more", "On plan") so it fits its cell. In the formula bar, the week's total shows its first and last day ("= B2 + … + B8", "Mon 2 + … + Sun 8"). |
| The formula bar on narrow sheets | In the review's middle column and on the fuel order's small sheet, the name box and the type are a little smaller, so the formula and its words fit. These bars show no answer after the words. |
| The Changes tab | The Worth keeping? answer spans columns B to D ("Not worth keeping: −£380 a day" on one line). Once worked out, the formula bar ends with the answer ("With your change − Now = −£380"). |

## Flags and questions

1. **"Take off" on the done Launch Day sheet.** On Launch Day the Fuel desk comes next, so the button reads **Fuel desk ▶**. Take off ▶ comes after the desk.
2. **Launch Day's fuel is a forward order.** Fuel is free on Monday and Tuesday, so an order placed on Launch Day is for Wednesday, at Wednesday's price (£1.30), and is paid when it arrives. The handover says "the day's price"; Launch Day's own price is free.
3. **Under-ordering costs 10p a litre from Wednesday of week 1.** The tank is now in use from Launch Day, so a pupil who orders too little pays the day's price + 10p on the days it runs dry. The test kit's run shows a −£200 fuel advantage that week.
4. **Sum numbers.** They come from the game as the sums are met: week 1 is Sums 1–13 (Launch Day 1–7, the fuel order 8, the event sums 9–10, the review 11–13). The pictures' numbers (12–14 on Launch Day) count the flight-time sums the game no longer asks in week 1.
5. **The review's difference** is taken larger first, so it never goes below zero: "Projected − Profit this week" when the plan projected more, "Profit this week − Projected" when the week did better. The handover's words always say "Projected − Profit". Say if the order should be fixed.
6. **The Studio still shows the projected profit**, and the line under a change ("This change — seats 57 → 78 · profit −£287 → +£1,029") gives away the Changes tab's difference before the pupil works it out. Should that line lose its profit?
7. **Year-one sums not on the sheet yet:** the week-2 sign-off cards, the month audits and board reviews, the chapter accounts, the time to afford, the flight times and the aircraft worth check. They keep Batch 2's screens. They are the next sheets to build when you want them.
8. **Business travellers** are often not a whole number: 34 × 0.7 = 23.8 on one plan, 15 × 0.7 = 10.5 for the test pupil (screen 17). The answer is the whole number (24, 11), and the exact figure is accepted with the whole-people line.
9. **Wrong answers** on the sheet no longer show the right figure in the note (the record still keeps it for the teacher).
10. **The order callout** floats over "Most I can afford" on the Fuel desk until Got it is pressed.
11. **Cash, tank, profit uses the workbook's example** (£8,600, a 5,000 L tank), not the pupil's own cash, as the handover's pictures do.
12. **Profit is not cash** (chapter 3) keeps its tap and the old frame in the game; opened on its own, it shows the new frame.
13. **Numbering.** The handover asks for "D105 onwards". Fable's v6.0 uses D104 for growth, stars and demand ranges, and the What a fare does data was also filed as D104 this morning. Fable may want to renumber one of them.
14. **The cabin sales briefing** (`cabin_sales`, not built) still describes a Predict step in the Briefings sheet.
15. **Two small data notes** from v6.0: `undercut_dub` now has three options, and Paris is 300 km.
16. **A bug fixed on the way:** in the work-in-progress commit, the Launch Day sheet's Other costs, Fuel burned and Total costs cells were empty (a comment had swallowed the line). They are filled now, and the week test checks them.
17. **A second bug fixed on the way, in every chapter.** The run board's Aircraft shop button worked while the day still showed "is flying". A plane bought then moved its services before that day had flown, so the day lost them. In the fleetshop test, Tuesday lost its Dublin flight. Now the day's flights land first, on the day's own plan, and then the shop opens: what is bought flies from tomorrow, as the rule already said. It isn't gated to year one because it changes no screen and only restores the rule. No chapter 3 or 4 test presses that button. Say if you want it year one only.
18. **v6.0's fuel price and chapter 2's first week.** Fuel on 6 January 2031 is £1.73 in v6.0 (£2.17 before). That is within 50p of the last fuel order a chapter-1 pupil placed, so a Premium pupil's first chapter-2 fuel order is a Build, not a Calculate. The rule is unchanged (a Calculate once the price has moved 50p). The chapter 2 test expected a Calculate and has failed since v6.0 went in: it fails the same way on the v6.0 build before tonight's work. The test now follows the rule. For Fable: at £1.73, Value's "the fuel order gives way to the bag fee" and the 50p rule both give a Build, so that week no longer shows the difference.
19. **HQ is 3–4 px too tall on some days**, by the test's overflow check. Day 8 has done this in most week runs since 18 October. Tonight it also showed on day 303, in chapter 2 for the Premium pupil from tonight's chapter-1 save. It isn't fixed tonight; it's the next small fix when you want it.

## Tests

On the final build. Two small fixes came after most suites had run: the board's Aircraft shop (flag 17) and What a fare does's last line (7.7). The suites they touch were run again after them: fleetshop, briefings, chapter 2 Premium and the week runs with the briefings.

| Suite | Result |
| --- | --- |
| `week.test.js` to day 15 (1366 × 768) | 109 passed, none failed |
| `week.test.js` to day 15 with the briefings playing, at 1366 × 768 and 1920 × 1080 | 118 passed at each size, none failed |
| `week.test.js` to chapter 1's review (`UPTO=200`, day 118) | 253 passed, none failed. It ends on £763,057 (Batch 2's run ended on £783,324). On day 15 the cash is £24,870 against £25,630 on the v6.0 build before tonight's work; the test pupil now orders week 1's fuel on Launch Day (flags 2 and 3) |
| `briefings.test.js` | 121 passed, none failed (run again after the What a fare does fix) |
| `decide`, `record`, `migrate`, `screens3`, `playnotes`, `fleetshop`, `milestones` | 34, 18, 31, 24, 14, 36 and 27 passed, none failed. Before the board fix (flag 17), fleetshop failed one check on some runs, including one on the v6.0 build before tonight's work |
| `engine`, `balance` | 10 and 87 passed, none failed |
| `chapter2.test.js` Value, from the old chapter-1 save and from tonight's | 110 passed each, none failed. At the chapter-2 review: £15,296,460 and £15,260,963 |
| `chapter2.test.js` Premium, from both saves | 104 passed each, none failed, once the day-127 check follows the 50p rule (flag 18). At the review: £15,094,197 and £15,056,234 |
| `chapter3.test.js`, `chapter4.test.js` (Value) from the same saves as this afternoon | Chapter 3: 66 passed, none failed, ending on £31,529,103. Chapter 4: 58 passed and one failed, ending on £58,865,752. Both match the v6.0 build before tonight's work (5ca2944) exactly; they differ from this afternoon's figures because of v6.0's data. Chapter 4's failure is the D89 fuel farm's second stage, which has failed since before this afternoon's What a fare does work (see that report) |

**Test changes.**
- `week`: every sum through the Sheet; the Launch Day sheet's sums, layout, Finance and done state; the Studio's Undo and Work out my plan; the Changes tab; the Fuel desk on Launch Day (tour, small sheet, the order paid on Wednesday); the review on the sheet; Cash, tank, profit version A; Weekdays and weekends without taps.
- `briefings`: each page plays by Next alone, Back returns a beat, decisions hold Next; What a fare does beats 5 and 6; Cash, tank, profit on Launch Day's desk.
- `decide`: the Studio opens no sum; the change is worked out on the Changes tab and kept for the teacher.
- `record`: the Launch Day sheet's first sum, ten times out then right, and the profit wrong twice.
- `migrate`: answers sums on the sheet.
- `chapter2`: the day-127 Premium check works out from the rule whether the fuel order is a Calculate or a Build (flag 18).
- `week`, `chapter2`, `decide`, `migrate`: go on from the Changes tab to the Sign-offs page, which now follows it.

## Screenshots

`docs/screenshots/evening-19oct/` holds the play-test screens at 1366 × 768 and 1920 × 1080; its README says what each one shows.
