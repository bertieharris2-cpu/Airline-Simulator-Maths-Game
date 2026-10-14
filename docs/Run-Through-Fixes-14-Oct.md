# Run-through fixes, 14 Oct 2026

Bertie played the game to week three and found two things to change. Both are built. Screenshots are in `docs/screenshots/runthrough/`.

## 1. Decimals: make it whole, multiply, divide back

> "I've just taught them to do it today by multiplying whole numbers ... by 1000 or dividing just to get to whole numbers and doing multiplication. So that should be the standard method."

The fuel card had been splitting the price into parts: 150 × 9p, 150 × 70p and 150 × 100p, then adding the lines. That is gone. Every place the game multiplies a decimal now uses the class's method:

1. **Make it whole.** Count the decimal places and × 10, 100 or 1,000. £1.79 has 2 decimal places, so 1.79 × 100 = 179.
2. **Multiply the whole numbers.** One long multiplication: 150 × 179 = 26,850.
3. **Divide back.** ÷ 100 puts the 2 decimal places back: £268.50.

**The Service Cost card** (screenshots `rt-01` to `rt-03`):
- It has three boxes, one for each step. A step waiting on the one above is dimmed.
- Until step 1 is right, step 2 reads "150 × your step 1 answer" and step 3 reads "Your step 2 answer ÷ 100". The card never shows an answer before the pupil has found it.
- Step 2's Working button opens the pad's long multiplication (`rt-02`).
- The Queries:
  - Step 1: × 10 or × 1,000 gets "count the decimal places".
  - Step 2: a decimal answer gets "both numbers are whole now, so the answer is a whole number".
  - Step 3: the answer not divided back gets "that is still the whole-number answer. Divide 17,640 by 100 …". ÷ 10 or ÷ 1,000 gets "count the decimal places".

**The same method everywhere else:**
- **The Working pad** on any × box with a decimal shows "Make it whole: 1.47 × 100 = 147 (2 decimal places)". Its last box divides back.
- **Launch Day's *Buying fuel* maths page** (`rt-04`): 1.30 × 100 = 130; 1,000 × 130 = 130,000; 130,000 ÷ 100 = £1,300.
- **The fuel desk's first order:** a wrong line's Query says "Make it whole: 1.47 × 100 = 147, multiply by 1,000, then ÷ 100."
- **The sign-off hint:** "Make it whole: £1.79 has 2 decimal places, so 1.79 × 100 = 179. Multiply the whole numbers, 150 × 179, then ÷ 100 to put the decimal places back."
- **The pupil record:**
  - The method is named "make it whole (× 10, 100 or 1,000), multiply, divide back".
  - An answer left undivided is noted as "46,800 is the whole-number answer: ÷ 100 puts the 2 decimal places back, so the bill is £468."
- **The teacher-only day-by-day paths:** the worked example, the method lines and the practice hints.

**For Fable:** the WorkingMethods row `litres × price per litre` lists several methods. Please put "make it whole (× 10, 100 or 1,000), multiply, divide back" first: it is the class's standard method now. Hunt h2's `pupilChecks` ("Multiply litres by price") is shown as written, so any method words there are yours to add.

## 2. The shop is never offered

> "Even though I had just purchased an aircraft it came up with do you want to buy an aircraft? ... They will want more planes. They do not need to be offered them."

Bertie chose **never: the Fleet desk only**.

- **Before:** the air show opened by itself:
  - every week and every month;
  - on the days new aircraft arrived (days 8, 22, 127 and 365);
  - every Monday while saving.
- **Now:** no day opens the shop by itself. It opens only from:
  - **Fleet → Add an aircraft** (`rt-06`);
  - the run board's **Aircraft shop** button.
- **Arrival days:** HQ's brief says what has arrived and where it is, for example "On the Fleet desk from today: Twin Otter, Saab 340 and ATR 72. Open Fleet, then Add an aircraft, when you want one." (`rt-05`, `rt-07`).
- **The What's new pages** for Madrid's jets (day 22), Going long (day 127) and Owning (day 365) go on to the plan. Each ends by saying the planes are on the Fleet desk.
- **Day 365:** the weekly time-to-afford sum stays (it is the Calendar's sum). Its button now says *Next: the plan*, not *On to the air show*.
- **Saving:** the countdown is on the Fleet desk's shop panel. Buying any aircraft on a later day ends the saving.
- **Old saves:** a save made before this change opens the same way. A shop still waiting later in today's steps is removed.

## Tests

| Test | Checks | Result |
|---|---|---|
| Chapter 1 (`week.test.js`) | 215 | £697,112, unchanged |
| The coasting pupil (`COAST=1`) | 218 | £689,806, unchanged |
| The fleet shop | 35 | all pass |
| The pupil record | 16 | all pass |
| Old saves (`migrate`) | 27 | all pass |
| Chapter 2, Value and Premium | see below | |
| Chapter 3, Value and Premium | see below | |

The test pupil buys the same planes on the same days as before. It just goes to the Fleet desk to do it: the Saab on day 15, the ATR on day 29. Every test also checks each HQ for a shop step that opened by itself; none did.

## Parked

- "I realize that the A380 later on. We might need a different approach." This is for chapter 4, not now.
