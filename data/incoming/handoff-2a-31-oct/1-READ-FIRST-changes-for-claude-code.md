# Hand-off 2a screens: week 1 every day, and a third destination (31 October 2026)

## What this means (plain English, for Bertie)

Fable's hand-off 2a (from your play notes of 31 Oct and five test pupils) was drawn on the real screens, and you approved it in two rounds on 31 Oct. This zip tells Claude Code:

1. **The Day page.** Every evening of week 1 ends on one page. It shows how today went, one sentence that reads the day, and tomorrow's flights, with Keep for tomorrow or Change my plan. More detail opens in a drawer.
2. **The daily change.** If he changes the plan, he builds the difference a day on the sheet. Then he works out the difference over a week (× 7) on paper.
3. **Frankfurt** arrives in week 1, after his first good day and by Thursday at the latest, on a departures-board card.
4. **Launch Day:** Finance builds the profit with the pointer, and a small Next sum ▸ sits beside each answer.
5. **Week 1 Sunday:** Finance's Monday-to-Wednesday example and his own week sit side by side under one formula bar. Finance shows Σ SUM, then he uses it for the whole week.
6. **Seven colours** for the cells in a formula, like Excel.
7. **Week 2 plan:** a comparison with no sums, except the fuel rise for a pupil who kept his plan.
8. **The Ready page** names its own button.

**Every reversal comes with its reason** (section 9), and DESIGN.md now says a newer decision from you always wins over it. **This zip replaces the hand-off 3 zip.** Earlier hand-offs are inside it, in `earlier/`.

---

## 0. Rules for this round

- **Order:** Fable's hand-off 2b (workbook: daily-change settings, Frankfurt, the ladder, the fuel sum) comes as a new workbook. Build the logic from that workbook, and the screens from this file. Read every setting, word and number from the workbook; don't hard-code.
- **Where this file differs from DESIGN.md (30 Oct) or the earlier hand-offs, this file wins.** The reasons are in section 9. DESIGN.md in this zip is already updated (31 Oct).
- **Chapter one only**, behind `ch1()`. The shift you built in hand-off 1c (everything after week 1 a week later) stands.
- **Pictures** in `pictures/` are 1366 × 768 mock-ups on screenshots of the current build (TEST Air, TEST2 and the test pupils). `-before` is the build as it is. Figures are examples.
- First-time callouts, cards and Finance's demonstrations show once; store "seen" in the save. Under reduced motion the pointer doesn't glide: each step appears in turn.

## 1. The Day page (week 1, Launch Day to Saturday)

Pictures: `01-day-page-before`, `-1-launch-day`, `-2-fare-left-seats-empty`, `-3-more-detail`, `-4-a-day-that-lost-money`.

- **When.** After the last landing on Launch Day and on Tue 3 to Sat 7 Sep (workbook `dailyChangeDays`), the day ends on the Day page. It replaces the Launch Day results page, the plan check and the "Week 1 is flying" page in week 1. Sunday flies, then the Sunday review. Week 2 onwards stays weekly (as hand-off 1c). The day flies on **Fast** by default (`weekSpeed`), with Normal and the Operations Wall one click away.
- **Layout** (content area x 192–1353):
  - **Title:** "Launch Day: how it went" / "Thursday 5 September: how it went", with a sub-line ("Day 4 of week 1 · every flight landed").
  - **Top row:**
    - **Profit today** tile (330 × 170): large figure, `green` (or `amber` below £0). Under it: "Yesterday **£2,440** · −£830" (the change `green` or `amber`), or "Your first day of flying." on Launch Day.
    - **Route by route** panel: Route (flag) · Wanted · Seats · Flew · Couldn't carry (`amber` when above 0), with **More detail ›** at its top right.
  - **Reading the day:** one sentence in a full-width panel (70px), with a `cyan` left rail and an "i" icon. When the day lost money it turns `amber` with a "!" (background `#2a1d08`). Wording in section 1a.
  - **Tomorrow:** "Tomorrow, Tuesday 3 September" and "Same flights, same fares as today." Below that, a small timetable strip (06:00–22:00) of tomorrow's flights: dark blue blocks (38px) with flag, route and fare, and the times underneath.
  - **Footer:** "Keep the plan for tomorrow, or change it." with **Change my plan** and **Keep for tomorrow ▶** (`go`). Keep is one click and flies the next day.
- **A day that lost money:** the sentence is `amber` ("Today lost £20. Change something before tomorrow."). **Change my plan** becomes the primary (blue) button, and the go button reads **Fly anyway ▶**. This replaces the green ✓ "Every flight made money" that a losing plan got before.
- **More detail ›** opens a drawer from the right (533 px wide, `cyan` 2px left edge) and shades the rest of the page. It holds the Launch Day Results panel (Revenue − Costs = Profit, projected against actual, route lines), "Costs today" (Other costs, Fuel burned with litres and price) and Feedback. **✕ Close** returns to the page. Nothing moves on while it is open.

### 1a. Reading the day (wording, from the workbook's screen text)

| When | Say |
|---|---|
| Every flight full and people turned away (`fullPlaneNudge`) | "Full on every flight, and 34 people couldn't get a seat. Try £10 more on Dublin tomorrow?" (the route with most turned away) |
| A higher fare left seats empty | "At £110, 11 seats flew empty. You took £830 less than at £100." |
| The plane is on the ground for hours | "Your plane is on the ground from 16:45. There's room for another flight." |
| The day lost money | "Today lost £41. Change something before tomorrow." (`amber` !) |
| Full planes, nothing better to try | "Full planes at good fares. People turned away are a chance for later, when you have more seats." |
| Saturday or Sunday | add "Saturdays are quieter." so he doesn't undo a good change |

Choose one sentence: loss first, then empty seats, then idle plane, then full planes. **Sunday advice** always names the biggest missed opportunity when there is one (Ben and Chloe only got "a better plan is available").

## 2. The daily change

Pictures: `02-daily-change-before`, `-1-finance-fare-difference`, `-2-he-builds-a-day`, `-3-over-a-week-on-paper`.

- **Change my plan** opens the Studio timetable as now. On return, if something changed, the Changes sheet ("Is the change worth it?", Now · With your change · Difference) opens. Footer: **Fly tomorrow ▶** (dimmed until the sheet is done).
- **Rows:** Passengers a day, Empty seats, Fare, Ticket revenue a day, **Ticket revenue over a week (× 7)**, Worth keeping?
- **1 · Finance works the fare difference** with the pointer (the first change only): clicks With your change (cyan, A), presses −, clicks Now (violet, B), presses Enter. Line: "Watch: Finance works out the fare difference: **With your change**, press **−**, **Now**, then Enter."
- **2 · He builds the ticket revenue difference a day** (build signal under D5: "Click **With your change**, press **−**, click **Now**. Then press Enter. The sheet works it out."). Formula-only, not counted.
- **3 · Over a week, on paper:** Finance fills Now and With your change for row 6 (ƒ). D6 is his paper sum, counted (gold signal: "Ticket revenue over a week: the difference · The difference a day, times 7. Work it out in your book. Write SUM n beside it. Then type your answer in D6 and press Enter."). The formula bar shows `= D5 × 7`, "Difference a day × 7".
- **Counting:** at most one counted sum a day (`dailyChangeCountedPerDay` = 1, the over-a-week sum) and the week's cap (`dailyChangeCountedWeek`). Over the cap, Finance fills D6 too. Keeping the plan asks nothing (`dailyKeepCounted` = 0).
- A swapped flight (one route out, another in) shows as two route rows with the Difference a day (Fable's 2a).

## 3. Frankfurt, the third destination

Pictures: `03-frankfurt-1-the-card`, `-2-it-fits`, `-3-doesnt-fit-today`.

- **When** (workbook `thirdRoute…`): it opens the morning after his first day with profit above £0 and no flight losing money, never on Launch Day, and for everyone by Thu 5 Sep. Bertie chose this on 31 Oct.
- **The card** appears after the Day page, in the event-card layout (the Storm card). The scene band is a departures board (black, amber flap letters): his flights ON TIME in `green`, and "--:-- FRANKFURT · NEW · FROM TOMORROW" in `cyan` on a faint cyan band. Under it:
  - eyebrow **NEW ROUTE · TOMORROW** (`cyan`);
  - title "Frankfurt opens tomorrow" (30px);
  - "Further away, so a flight takes longer. People pay more to get there." (from the workbook);
  - one button, **Plan tomorrow ▶**, which opens the timetable;
  - footer: "A new route opens tomorrow: Thursday 5 September."
- **The timetable:**
  - **New route:** Frankfurt joins the route picker and the outlined Add a flight tray, with the German flag (horizontal black, red, gold), the city, and "5 h 15 there and back" underneath.
  - **Bar widths:** bars are as wide as the flight takes, so Frankfurt's is the widest. Check it reads at 1366 wide.
  - **Dragging:** while a route is dragged in, a ghost shows where it sits. If it fits: a `green` edge and "✓ Fits · leaves 13:40, back 18:55" under the lane. If it won't end by 22:00: `amber`, an amber line at 22:00, "! Doesn't fit today: it would be back at 22:15, after the day ends at 22:00", and it **won't drop**.
  - **Gaps:** the gap left in the day is shown as a plain gap. No flight-time sums (they stay parked).
- **After it opens:** the Day page gains a Frankfurt row once it flies.

## 4. Launch Day: the profit, and Next sum

Pictures: `04-launch-day-before`, `-1-finance-builds-the-profit`, `-2-next-sum-beside-the-answer`.

- **The profit, demonstrated:** after Paris and Your plan fill in, Finance builds F9 with the same pointer as the first formula. It clicks Total revenue (F5, cyan, A), presses the − key (lights), clicks Total costs (F8, violet, B) and presses Enter. Line: "Watch: Finance clicks **Total revenue**, presses **−**, clicks **Total costs**, then presses **Enter**." Footer: "Launch Day · watch Finance work out the profit." It's a watch, so nothing is counted.
- **Next sum** (every sheet):
  - When an answer is right, the line under the sheet turns green ("✓ Dublin at £80: £3,040. The sheet worked it out. Next: Dublin at £90, on paper.").
  - A small **Next sum ▸** (`green` outline, 26px) sits at the end of that line, and the focus also moves to the next sum by itself after about 1.5 s.
  - The footer's right-hand button only ever leaves the page (Ready to fly ▶, Fly tomorrow ▶). It stays dimmed until the last sum is done, and never says Next sum. This fixes the extra click in the week 2 run.

## 5. Week 1 Sunday review: two sheets side by side

Pictures: `05-week1-sunday-before`, `-1-finance-mon-to-wed`, `-2-his-turn-whole-week`, `-3-he-drags`, `-4-done-then-average`.

- **Layout:**
  - **One sheet panel** (x 562–1353, y 150–592) with **one formula bar across its top** (name box, fx, the formula, then the keys Σ SUM × ÷ + − Enter ↵ at its right end).
  - **Two separate spreadsheets inside it, side by side** (each 380 wide; label column 172, figure column 140):
    - **Left, Finance's example:** made-up profits for Mon 2 to Wed 4 (`week1ExampleProfits`) and "Mon to Wed". It is in the example look: dashed `text-soft` frame, faint stripes, and the label FINANCE'S EXAMPLE · MADE-UP NUMBERS on its top edge.
    - **Right, YOUR WEEK** (label in `cyan`): his week, Profit this week, Days flown and Average a day.
  - **The formula bar belongs to whichever sheet is being worked** (B5 on the example, B9 or B11 on his).
  - **Short lines under each sheet;** the build signal runs full width under the panel (y ≈ 603).
  - **What happened** stays on the left, dimmed.
- **1 · Finance shows Σ SUM on the example:** "Watch: calculate the total profit from Monday to Wednesday". The pointer presses Σ SUM (key lights), drags B2:B4 (dashed `cyan`, the lit frame hidden), presses Enter. B5 fills £3,700 with a green glow. His sheet is dimmed (opacity .45) meanwhile. The signal carries EXAMPLE · WATCH.
- **2 · His turn:** his sheet lights (B2:B9, B9 the magenta ?), and the signal says "Your turn: calculate the profit for the whole week, Monday to Sunday · Press Σ SUM, drag down your Profit column from Monday to Sunday, then press Enter. Nothing to write in your book."
- **3 · Dragging:** dashed range on his B2:B8, the bar shows `=SUM(B2:B8` "add Monday to Sunday", and the Enter key lights. Line: "Let go on Sunday (B8), then press Enter."
- **4 · Then the average a day** on his sheet, as approved (click Profit this week, ÷, Days flown, Enter). Done callouts at the total and the average, then **Plan week 2 ▶**.
- **This replaces:** the separate full-screen example, his clicking Mon to Sun with +, and the Σ SUM callout. **Ladder** (`spreadsheetLadder`, set in 2b's workbook): week 1 shown Σ SUM on the example and he uses it; from week 2 Σ SUM by dragging, no example.
- **Reference colours** (all sheets): seven colours in click order, repeating after seven. They are `cyan`, `ref-2` `#b48cff`, `ref-3` `#ff8f70`, `ref-4` `#a9e05a`, `ref-5` `#ff9ccf`, `ref-6` `#3fd9c2` and `ref-7` `#e8c99a`. Each colour goes on the cell's outline, its tag (A/B on two-cell sums) and its name in the formula bar. A dragged range takes one colour.

## 6. Week 2 plan: a comparison, no sums

Pictures: `06-week2-plan-before`, `-1-comparison`, `-2-kept-plan-fuel-sum`.

- **The Week 2 plan sheet:** title "Week 2 plan: what changed from last week", tab Week 2. Columns: **Last week** (a weekday of week 1) · **This week** (Week 2 plan, ✓ IN YOUR PLAN) · **Difference**. Rows, all a day: Passengers, Ticket revenue, Fuel burned (note "600 L · £1.20 → £1.47"), Total costs, Profit.
- **Who fills it:** everything is ƒ, and differences are coloured by meaning. Line: "✓ Finance filled in this week from your plan. Profit a day: **£883 more** than last week." Footer: **Ready to fly ▶**.
- **Monday's counted sums** (allowance 2) are on the Changes sheet (section 2), not here. This also removes the repeated Paris ticket revenue sum and the over-count bug.
- **A pupil who kept his plan:** one paper sum on this sheet, in the Fuel row's Difference (D4). The gold signal under it: "What the fuel rise costs a day · Fuel went up from £1.20 to £1.47 a litre: **27p** more. You burn **600 litres** a day. Work it out in your book. Write SUM n beside it. Then type your answer in D4 and press Enter." Litres come from his plan (Fable confirms them, 2b).

## 7. Ready for launch

Pictures: `07-ready-before`, `07-ready-after`.

- The instruction under the title reads "Check the plan. Press **Send to Operations Wall** when it is right." One name, the button's.

## 8. Not for design (fix in code)

From Fable's 2a, section 8:
- Monday 9 Sep counts 3–4 questions against 2 (fixed by sections 2 and 6).
- The Week 2 plan sheet asks Paris ticket revenue again (removed).
- Week 2 opener: Average fare "—" and Projected profit blank.
- Fuel alert on Home while the Fuel desk is locked, and £1.40 against £1.20.
- "New destination Paris" milestone after Paris has flown.
- The Launch Day clock reads Sun 1 Sep.

Parked by Bertie: take-off before the HQ departure boards.

## 9. Decisions changed, and why (31 Oct 2026)

Each line: what it was, what it is now, and why. Where code or DESIGN.md still follows the old rule, change it to the new one.

| Was (date) | Now | Why |
|---|---|---|
| After Launch Day the week flies Tue to Sun without stopping (30 Oct, `weekFlyingPages`) | Week 1 stops every day on the Day page | In the test runs a weak start cost a whole week (Ellie lost money from Friday and couldn't act until Monday). Deciding every day builds the routine and makes trying "£10 more" cost one day. |
| Launch Day results page, then a separate plan check (30 Oct) | One Day page with More detail in a drawer | Bertie: pupils who don't read would wonder what to do; detail should be one click away, "not a linear process". |
| Week 1: click Mon to Sun; Σ SUM shown in week 2 (30 Oct), week 3 in v6.4 | Week 1: Finance shows Σ SUM on a Mon–Wed example beside his sheet; he uses it on the whole week | In week 2 Bertie expected to drag and couldn't; seeing it side by side while it's fresh is clearer. |
| 2a draft: Changes sheet in week 1 "a day only", the built difference counted | Difference a day built (not counted); over a week (× 7) on paper (counted) | A built sum has nothing in his book, so it can't be the counted one; × 7 is the sum he already knew. |
| Two reference colours, cyan then violet (30 Oct) | Seven colours, repeating | A week's total uses seven cells. |
| Next sum ▶ in the footer (19 Oct) | Next sum ▸ beside the answer; footer only leaves the page | Bertie: the far button should mean leaving the page. |
| Week 2 plan sheet asks Paris ticket revenue and profit | A comparison, no sums; the fuel rise for a pupil who kept his plan | It repeated a figure from the page before and broke the allowance; pupils who changed nothing had nothing to do. |
| Frankfurt opens on day 22 with the other new routes | Frankfurt in week 1, after a good day, by Thursday | After one change three of five test pupils flew the same plan with nothing left to find. |
| Launch Day profit filled by Finance with no demonstration | Finance builds it with the pointer | Bertie: show the subtraction once before he builds one on Monday. |

## 10. Open, for Bertie (don't change these in code yet)

- **Finance's questions on the third Monday (P2).** Hand-off 1c built "What if Dublin were £100? 38 × £100" and the modelling question there, from the question schedule. On 30 Oct Bertie made the what-if sheet free to try with no sums. Keep as built until he decides.
- **The difference from the plan on Monday.** Hand-off 1c moved it, and the rotating question, from the Sunday review to Monday (`countingPriority`). DESIGN.md still describes them on Sunday. Keep as built until he decides.
- **View trade-offs and ƒ work it out.** 1c hides them until day 22. On 30 Oct Bertie told Claude Design "hidden for all of chapter one" (hand-off 3, section 5). Keep as built until he decides.

## 11. What to check in the next play-test

- Does Keep for tomorrow feel quick enough five days running? Does the sentence change what he does?
- Does a pupil like Ellie change her plan after an amber day?
- Frankfurt: does he try it, and does he see from the bars that fewer flights fit?
- Sunday: with the two sheets side by side, does he copy Finance's drag on his own column without help?
- Do the seven colours stay readable, and does anyone mix up lime with green or sand with gold?
- Does the fuel-rise sum make sense to a pupil who kept his plan?
