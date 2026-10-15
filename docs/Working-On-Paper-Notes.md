# Working on paper: what was built (Workbook v5.6, D86)

*Claude Code, 15 October 2026. This answers Fable's note "Working on paper, one fuel sum, two tries" (15 Oct). The code is in `src/opening/parts/p4zr_paper.js`.*

## What this means (for Bertie)

The pupil now works every sum in his book. The game only asks for the answer.

- **One answer box for every sum.** Each box has a line like "Sum 14 · Week 3 · Fuel order: 6 × £1,680", the question in black and a place to type the answer.
  - The squared paper, the column template, the formula tab and the Working pad have all gone.
  - "Reference card: ways to set it out" is a small fold-out reminder. It is closed unless he opens it.
- **Two tries.**
  - A wrong answer gets a short note and one more try. The note is worked out from his answer: ten times out, not divided back, two digits swapped or a carry missed.
  - A second wrong answer shows the right figure, stamped CHECKED BY FINANCE, and the game moves on. Both tries go into the record.
- **Fuel is one sum a week.** It is the Monday order on the fuel desk: blocks × the price of 1,000 L, for example 3 × £1,470.
  - The fuel desk's new "Fuel by route" tab shows each plane's and each route's litres and cost for the week. The game fills it in.
  - The per-service fuel card is no longer a sum he has to sign off.
- **Launch Day has five sums:**
  - the tickets at three fares;
  - the fuel order, after one worked example of a single service's fuel;
  - the profit.
  The two snack options are Builds: he taps the figures and the operation.
- **The printout.**
  - Each entry has its sum number in the margin.
  - Each has a ruled box headed "Working (from your book)" for pasting in or copying his working.
  - His book and the printout line up by sum number.

## Report back

| Fable asked us to confirm | Built |
| --- | --- |
| The answer box replaces the grid everywhere | **Yes**, on every sum the pupil meets in chapters 1–3 (table below). The Working pad's buttons and the free pad in the top bar are hidden. |
| The two-tries flow | **Yes**, on every surface in the table. Wrong once: the note and "One more try". Wrong twice: the figure is shown, stamped Checked by Finance, and recorded as shown. |
| The fuel order is the only fuel sign-off after Launch Day; the breakdown is on the load sheets | **Yes.** No per-service fuel cards after Launch Day (none on Mondays). The order is on the fuel desk every Monday. The breakdown is the desk's "Fuel by route" tab, which opens by itself once the order is signed. |
| The record's working box on the printout | **Yes.** Each entry has "Sum N" in the margin and a ruled box headed "Working (from your book)". |

| Where a sum is asked | Answer box | Two tries | Sum number |
| --- | --- | --- | --- |
| Launch Day and Monday sheet cells, in the Maths Dock (tickets, profit, the tenths, the fuel order) | ✓ | ✓ | ✓ |
| Launch Day snacks (Build in the dock) | tap the figures | ✓ | ✓ |
| Sign-off cards: Calculate and Build (tickets, flight time, a full plane, audits, board reviews) | ✓ (method as a reference card) | ✓ | ✓ |
| The review Build steps (total, difference, mean; chapter accounts) | tap the figures | ✓ | ✓ |
| The weekly fuel order (fuel desk) | ✓, or a Build | ✓ | ✓ |
| Time to afford (days in chapter 1, weeks in chapter 3), cash after buying (chapter 3), rent or buy (from January), the two-step cards (the bag fee, the estimate first) | their own boxes | ✓ | ✓ |
| Captain's challenges and hunts | unchanged | unchanged | not numbered |

## How each rule is read (please check)

1. **Launch Day's fuel.**
   - The per-service decimal multiplication is a **worked example the pupil steps through, not typed**. For example: 120 L × £1.30 → 1.30 × 100 = 130 → 120 × 130 = 15,600 → ÷ 100 = £156. It then goes on to the price of a block: 1,000 L × £1.30 = £1,300.
   - The sum he types is the order: the week's litres from Wednesday (the first paid day) in 1,000 L blocks, rounded up, × the price of a block. For example, 3 × £1,300 = £3,900.
   - Week 1 still buys its fuel as it burns it (D60). The Launch Day order is the week's fuel bill worked out, not a purchase.
   - If "asked once" meant the pupil types the example, it becomes a sixth sum; tell us and we will change it.
2. **Calculate, Build, Model for the order.**
   - **Calculate** the first time, and whenever the price has moved `fuelHandSumPriceStep` (50p) since it was last calculated.
   - **Otherwise:** a Build once, then the model until the next 50p move.
   - Steady pupil, chapter 1: Build on day 8, the model on day 22, Calculate on days 36, 43 and 50 (the price spike), Build on 57, the model from 64, Calculate on 92, Build on 99.
   - A Calculate order takes one of the week's three sign-off slots (it is reserved, as the first order's was). A Build or a model order takes none.
3. **One order sum a week.** The week's first order is the sum.
   - If the pupil changes the number of blocks after signing, the sum is asked again with the same sum number.
   - Later purchases that week need no sum.
4. **Launch Day's tickets.** Only the first market at its three fares is asked. The other route's tickets are the model's (they were a sixth sum before).
5. **Sum numbers.**
   - They start at 1 for each airline and are never reset.
   - A sum keeps its number for the week it is first shown in, so a sum carried on later in the week keeps it.
   - Practice questions are off by default and are not numbered yet (the P series is for when a teacher turns them on).
   - Saves made before today start numbering at 1 from the next sum.
6. **Captain's challenges and hunts are unchanged.** A challenge is optional with its own reward. A hunt is "tap the wrong line, then type it". Should hunts follow two tries too?
7. **The on-screen mode is kept for a class that wants it.** `settings.workingOnPaper = 'off'` brings back the column template and the pad (the Fleet desk test runs that way). There is no teacher-panel switch yet: say if Bertie wants one.
8. **The error notes** come from the record brief's §3, worked out from the answer alone: ten times out, the whole-number answer not divided back, two digits swapped, a carry. For a Build: a figure that is not part of the sum, or the wrong operation. When none fits: too much or too little, with an estimate.

## Tests

All runs on the built game, with workbook v5.6 data (v5.7 adds only settings and PlanTips).

| Run | Checks | End cash | Against before D86 |
| --- | --- | --- | --- |
| `week.test.js`, the Steady pupil to the chapter 1 review | 229 ok, 0 fail | £697,112 | the same |
| `week.test.js` COAST | 232 ok, 0 fail | £689,806 | the same |
| `chapter2.test.js` Value | 106 ok, 0 fail | £13,591,851 | the same |
| `chapter2.test.js` Premium | 100 ok, 0 fail | £13,312,048 | the same |
| `chapter3.test.js` Value | 62 ok, 0 fail | £28,219,358 | +£6,795: August 2032 only |
| `chapter3.test.js` Premium | 72 ok, 0 fail | £19,822,524 | +£855: August 2032 only |
| `record.test.js` | 17 ok | | |
| `fleetshop.test.js` (on-screen mode, day 8) | 35 ok | | |
| `migrate.test.js` | 31 ok | | |
| `milestones.test.js` | 27 ok | | |

- **Why chapter 3 ends higher.** The fuel bought is identical, purchase by purchase, and every month's profit is the same except August 2032. Workbook v5.6 added a market week from 30 August (week 105: business ×0.85, new season multipliers, fuel £2.31), which now covers the last two days of chapter 3's August. That is data, not the paper change.
- **What the runs check for D86.**
  - Launch Day's five sums and the worked example. The Calculate count is now 10–16 a chapter (it was about 18).
  - The first answer box: a ×10 answer is a Query with "One more try"; a second wrong answer is shown, stamped Checked by Finance.
  - The weekly fuel order at each level: Calculate, Build or model.
  - The record printout: the Sum N margin and the ruled working box.
- **A rule we had to decide.** On day 127 (chapter 2's first Monday), a Calculate fuel order would have taken one of the three slots and pushed the first long-haul ticket estimate down to a Build. New maths now comes first:
  - when the new relationships fill the cap, the fuel order is a Build that week;
  - it is a Calculate again the next week if the price is still 50p from the last one.
  - Value: rent-or-buy, the long-haul tickets and the bag fee are the Calculates, and the order is a Build. Premium: rent-or-buy, the tickets and the fuel order are the Calculates.
- **Two layout fixes found by the runs.**
  - The fuel desk's "Fuel by route" tab now scrolls inside its panel. With Premium's five routes it had covered the Continue button.
  - The sign-off page now scrolls inside the page. A Value week with three Calculates had pushed the last card under the bar.

## Workbook v5.6 import

- **Settings.** `workingOnPaper`, `twoTriesRule`, `sumNumbering`, `financeShape`, `chapter4SetUpDays`, `a380FillQuestion` and `campaignProjectDate` are all loaded (`data/Import-Report.md`).
- **Finance sheet.** It now reads `monthlyPayment` and `months`.
- **A220, A320 and 737 rows.** They still carry the old weekly terms (× 52) in the monthly column. The game keeps those three weekly, and the report lists them as a check. They are only used from chapter 4.
- **A false alarm fixed.** "58 short" in Hong Kong's story no longer sets off the importer's distance check.
