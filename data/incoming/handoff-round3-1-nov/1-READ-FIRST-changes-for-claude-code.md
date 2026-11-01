# Round 3 hand-off: fewer words (1 November 2026)

## What this means (plain English, for Bertie)

This is round 3 of about 10. Claude Code's round 3 hand-off ("Hand-off for Claude Design: chapter one after the 11:52 play notes") asked for seven screens to be drawn, and for your callout rules to go into DESIGN.md. You checked the pictures on 1 Nov. Everything looked right, apart from one change: in each sum's box, the method goes on top in its colour ("Build the formula" in blue, "Work it out on paper" in gold), with the task underneath. That change is in every picture here. This hand-off tells Claude Code:

1. **Your ten callout rules**, now in DESIGN.md, for every screen in chapter one (section 0).
2. **Launch Day profit:** one short callout touching his profit box, and the made-up example column only while Finance demonstrates.
3. **The Day page walk-through:** he sees the whole page first, then four steps with a lighter shade.
4. **Two plans:** one callout; the new plan is locked until he works it out; then both Choose buttons are the same green.
5. **Work out your new plan:** the sheet redrawn, with no demos and two paper sums.
6. **Before / after:** two callouts, then Choose a plan.
7. **Week 1 Sunday:** titles only, green answers, and green buttons to move on.
8. **The what-if sheet:** no ticket-revenue demo; Finance shows the × 7 and the × 4.
9. **Your five answers** to Claude Code's questions (section 9).

**This replaces the 17:37 hand-off page and zip.** Earlier hand-offs are inside, in `earlier/`.

---

## 0. Rules for this round

- **How we work** (Bertie, 1 Nov): Claude Design and Claude Code only, in rounds. Every word, figure and setting here is a **placeholder**. Put each one in the workbook marked PLACEHOLDER and add it to docs/Placeholders-for-Fable.md. Don't make the figures balance. Fable checks them all at the end.
- **Chapter one only**, behind `ch1()`. `airline-opening-prototype.html` is the game file. Keep the round 2 behaviour unless this file changes it.
- **Pictures** in `pictures/` are 1366 × 768 WebP mock-ups. They were drawn on Claude Design's earlier mock-ups of the same screens, not on the round 2 screenshots, which Claude Design can't see. Where the layout of something the pictures don't show differs from what you built in round 2, keep yours. Where the pictures show a change (words, boxes, buttons, order, shading), follow the pictures.
- **Bertie's callout rules: apply them to every screen in chapter one, not just these seven.** Full text in DESIGN.md ("Callout rules for the whole game"). In short:
  1. **A callout is a title.** Add a second line only for a rule the sum needs ("Ticket revenue = passengers × fare"). Never say what will happen next, and never repeat what's on the screen.
  2. **A sum's box has two lines, the method on top.** The top line is **Build the formula** (blue, grid icon) or **Work it out on paper** (gold, pencil icon). Under it, the task: "Calculate the total revenue, then press [Enter]." or "Calculate the difference in profit. Write [SUM 4] beside it." No title and no third line. (DESIGN.md: Question Signal, redrawn.)
  3. **Finance demonstrates a method once:** the pointer goes to every cell and every key, and the key lights when pressed.
  4. **Build one, then one on paper.** Once a method is known, he builds the first sum of a kind, then works the next one of the same kind on paper (counted).
  5. **Nothing cut off.** The box sits right under its cell with its pointer touching it. If it would go off the panel, slide it sideways, never up and away.
  6. **A right answer turns green** in its cell before anything new appears. Then a **green button** moves him on: My turn ▶, An easier method ▶, Now calculate the average ▶.
  7. **Only callouts that teach.** None that says to press a button he can already see.
  8. **Made-up numbers only while Finance demonstrates.**
  9. **Choices look equal:** both Choose buttons the same green.
  10. **Walk-throughs show the whole screen first,** then a light shade (about 38% dark) with the lit part at normal brightness, and quiet callouts (darker, thin border, no glow).
- **Demo pace** stays as before: nothing moves until **Watch ▶**, then a pause of about 1.5 s, and about 1.2 s a step.

## 1. Launch Day sheet: the profit

Pictures: `01-launch-day-profit-1-callout-touching-the-box`, `-2-demo-example-appears`, `-3-his-turn-example-gone`.

What he sees, in order:
1. **Before the demo:** his profit cell (F9) is the pink answer box. Under it sits one callout, its pointer touching the box: LAUNCH DAY · THE PROFIT, "Profit = Total revenue − Total costs", and a **Watch ▶** button. There's no example column yet, and the callout stays fully on screen (round 2 had it cut off on the right).
2. **Finance's demo** (after Watch ▶ and the pause): the made-up example column G appears on the right, in the example look (dashed outline, faint stripes). Finance clicks Total revenue, the − key lights, clicks Total costs, then Enter. The line under the sheet reads "Watch: Finance clicks Total revenue, presses −, clicks Total costs, then presses Enter."
3. **When the demo ends, column G disappears.** His turn: the box under F9 has "Build the formula" (blue) on top and "Calculate the profit, then press [Enter]." under it. The line under the sheet reads "Your turn." + Give me a hint.
- Every other sum's box on the Launch Day sheet follows rule 2.

## 2. Launch Day: how it went, with the walk-through

Pictures: `02-day-page-walk-through-0-whole-page-first`, then `-1-profit-today` to `-4-your-choice`.

- **First, the whole page at full brightness.** One small quiet callout sits at the top right, with no pointer: LAUNCH DAY, "Review the day", **Start ▸**. Nothing is shaded.
- **Then four steps, one at a time.** Each step lights one part and puts a light shade (about 38% dark) over the rest, so the rest can still be read. The lit part is at normal brightness. The callouts are titles only, in the quiet style (`#0a2140`, a thin cyan border at 60%, no glow), each with "n of 4" and **Next ▸**:
  1. Profit today: "Your profit today" (callout under the tile).
  2. Route by route: "Who wanted to fly, and who flew".
  3. What next (the lower half; on the Frankfurt evening, the Frankfurt news): "What next: Frankfurt opens tomorrow".
  4. Your choice (the footer): "Your choice: plan tomorrow", **Got it**.
- Launch Day only, as in round 2. Parked: a graph on the Day page.

## 3. Two plans

Pictures: `03-two-plans-1-empty-one-callout`, `-2-built-locked`, `-3-worked-out-both-green`.

- **Callout 1 only**, the first time: "Build a new plan for tomorrow. Compare it with yesterday's plan." with Got it. It sits to the right of the Add a flight tray, pointing up at the new lane, so it covers nothing he needs. Delete callout 2 ("Now work it out").
- **Locked** (round 2 behaviour, drawn): once the new plan has a flight, its profit box says "work it out first" (small, on one line), its Choose is greyed, the compare bar shows "?" for the new plan, and the footer has a green **Work out my plan ▶**.
- **Worked out:** both profits show (yesterday £2,170, new £3,177), the compare bar shows +£1,007 a day, and **both Choose ▶ buttons are the same green** (rule 9).
- **Yesterday's plan can be chosen at any time**, even before he works out the new one (Bertie: "Yes, yesterday's stays open").
- Lane labels: YESTERDAY'S PLAN / "Flew on Launch Day"; NEW PLAN / "For tomorrow".

## 4. Work out your new plan (redrawn)

Pictures: `04-work-out-your-new-plan-1-frankfurt-build`, `-2-paris-paper`, `-3-total-revenue-build`, `-4-difference-paper`, `-5-done`.

What the screen is: the Launch Day sheet again, for his whole new plan, so he practises Launch Day's sums. He does it after pressing Work out my plan ▶ and before Before / after. Title "Work out your new plan". Tabs: Launch Day · Week 1 · New plan (open) · Before / after (dimmed until done) · Fuel.

- **Columns:** one per route in the new plan (B "Frankfurt £140, your 2 flights"; C "Paris £110, your flight"), then D **New plan**, E **Yesterday's plan** ("Dublin ×2 + Paris ×2"), F **Difference** ("new − yesterday"). Rows as on Launch Day: Passengers, Fare, Ticket revenue, Total revenue, Other costs, Fuel burned, Total costs, Profit. Finance has already filled in the costs and all of yesterday's column (ƒ).
- **His sums, in order** (no Finance demos, rule 3):
  1. Frankfurt's ticket revenue (B4), built: "Build the formula" / "Calculate the ticket revenue, then press [Enter]."
  2. Paris's ticket revenue (C4), **on paper**, counted: "Work it out on paper" / "Calculate the ticket revenue. Write [SUM 3] beside it." Frankfurt's answer has turned green first.
  3. Total revenue (D5), built: "Calculate the total revenue, then press [Enter]."
  4. Profit (D9), built (not drawn; the same box).
  5. The difference in profit (F9), **on paper**, counted: "Work it out on paper" / "Calculate the difference in profit. Write [SUM 4] beside it." The box stays inside the sheet.
  6. **Done:** F9 turns green. One line: "✓ Your new plan should make £1,007 more a day than yesterday's." The footer's **Before / after ▶** lights up.
- **Both paper sums count** on Tuesday (Bertie). This goes over the old one-a-day limit for this day; set Tuesday's allowance to 2 (placeholder).

## 5. Before / after, after the sums

Pictures: `05-before-after-1-yesterdays-plan`, `-2-your-new-plan`.

- The same graph as before, now as a picture of what he has just worked out. "Today's plan" becomes "Yesterday's plan". Title: "Before / after: yesterday's plan and your new plan".
- **Two callouts only**, titles: (1) "Yesterday's plan: 4 flights" pointing at the old bar (new bar faded), **Next ▸**; (2) "Your new plan: £1,007 more a day" pointing at the green bracket (old bar faded), **Got it**. Delete callouts 3 and 4.
- **Footer: a green Choose a plan ▶**, back to the two plans with the new plan unlocked. Bertie chose to keep Before / after.

## 6. Week 1 Sunday: how did week 1 go?

Pictures: `06-week1-sunday-1` to `-9`.

Same two-sheet layout. The strip that ran under the panel is gone, so the panel is taller (to about y 670) and every box and button sits inside it.
1. Callout under the left example, title only: "One way to find the week's total profit: add each day", **Watch ▶**.
2. Finance's demo: the pointer goes to each day's cell **and to the + key** (it lights). Line: "Watch: Finance clicks each day, with + between them."
3. The example's answer turns green (£3,700). A green **My turn ▶** sits in the line under the sheet.
4. His turn: the left sheet lengthens into his week. The box under his total reads "Build the formula" / "Calculate the total profit for the week, then press [Enter]."
5. His right answer turns green (£9,909). Then a green **An easier method ▶** in the line.
6. The right sheet appears with Finance's example. Callout title only: "Here's a simpler way to do it in a spreadsheet", **Watch ▶**.
7. Finance's Σ SUM demo, **with the pointer visible**: Σ SUM lit, the pointer dragging Monday to Wednesday (dashed range). Line: "Watch: Σ SUM, then drag Monday to Wednesday."
8. His Σ SUM on his week turns green: "✓ Same answer: £9,909". A green **Now calculate the average ▶** sits under the right sheet.
9. Finance shows the average on the left sheet (as before). Then the box points straight at his average cell on the right: "Build the formula" / "Now it's your turn: calculate the average a day, then press [Enter]."
- No "How good was the plan" callout: **parked for all of chapter one** (Bertie).

## 7. Mon 9 Sep: what if you change a fare?

Pictures: `07-what-if-1-what-if`, `-2-build`, `-3-paper`, `-4a-finance-shows-x7`, `-4-a-week-paper`, `-5-a-month`.

1. Callout title only, under the what-if fare: "What if Frankfurt were £3 more?", **Got it**. No "people still fill all 38 seats".
2. **No Finance demo for ticket revenue.** He builds his own fare's ticket revenue a day (B4): "Build the formula" / "Calculate the ticket revenue a day, then press [Enter]."
3. The what-if fare on paper (C4), counted: "Work it out on paper" / "Calculate the ticket revenue a day. Write [SUM 5] beside it."
4. **Finance shows the × 7** (Bertie's choice): the week row appears and Finance builds B5 = B4 × 7 with the pointer, the × key lit. Line: "Watch: Finance clicks Ticket revenue a day, presses ×, types 7, then presses Enter." What-if column's week ƒ. Then he works the week's difference on paper (D5), counted: "Calculate the difference over a week. Write [SUM 6] beside it."
5. **Finance shows the × 4** the same way for the month row (not drawn), the rest of the row ƒ. Then a title-only callout at the month's difference: "£3 more a ticket = £3,192 more a month", **Got it**. **Set my fares ▶** in the footer.

## 8. Parked

- A graph on the Day page.
- The "How good was the plan" callout, for all of chapter one.

## 9. Bertie's answers to Claude Code's questions (1 Nov)

| Question | Answer |
|---|---|
| Before the sums, can he still choose yesterday's plan? | Yes. Only the new plan's Choose is greyed until it's worked out. |
| Two counted paper sums on Tuesday? | Both count. |
| Is Before / after still worth it after the sums? | Keep it, with two callouts and Choose a plan ▶. |
| What-if week and month rows | Finance shows the × 7 and the × 4. He works the week's difference on paper. |
| "How good was the plan" callout | Parked for all of chapter one for now. |

## 10. Decisions changed, and why (1 Nov)

| Was | Now | Why |
|---|---|---|
| Question Signal: a BUILD IT ON THE SHEET / WORK IT OUT ON PAPER header, a title and up to three lines | Two lines: the method on top in its colour, then the task | Bertie: "build the formula" rather than "build it on the sheet"; pupils don't read the rest; the colour says build or paper. |
| Callouts that explain what happens next | Titles only | Bertie (12:05): "write down the new rules… so I don't have to keep commenting." |
| Example column on the sheet throughout | Only during Finance's demo | Bertie: it should only be there when demonstrating. |
| Before / after with four callouts | Two | Bertie: the third and fourth weren't needed after the sums. |
| What-if: Finance demonstrates ticket revenue | No ticket-revenue demo; Finance shows the × 7 and × 4 | Bertie: "they should have done plenty already"; he chose that Finance shows the week and month steps. |
| Two-plans callout 2 "Now work it out" | Gone | Bertie: he'd only just put down one flight. |
| One Choose green, one plain | Both the same green | Bertie: so it doesn't favour one plan. |

## 11. What to check in the next play-test

- Are the two-line boxes enough on their own, or does he still look for more?
- Does the walk-through's lighter shade still draw the eye to the lit part?
- Tuesday: does the new-plan sheet feel like useful practice or too long, with two paper sums?
- Sunday: do the green buttons make the order clear without any extra words?
