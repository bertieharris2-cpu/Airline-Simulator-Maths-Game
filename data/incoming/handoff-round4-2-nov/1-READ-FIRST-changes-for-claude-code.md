# Round 4 hand-off: the Sunday graphs (2 November 2026)

## What this means (plain English, for Bertie)

This is round 4 of about 10. Claude Code asked for two small graphs on the Sunday review, so a pupil can see when his plan is leaving money behind and new routes would pay better. You approved all five screens on 2 Nov. This hand-off tells Claude Code:

1. **Your week in pictures.** After the Sunday sums, a green button opens a page with two graphs side by side. It runs every Sunday from week 2.
2. **Graph 1, "Your plan against the best plan".** Two bars a week: his profit in solid gold, and the best plan's profit as a white outline. What he missed sits on top of his bar in striped amber. Only the latest week has figures. A marker shows when new routes opened.
3. **Graph 2, "Where the money is".** One bar per route, showing profit for each hour of plane time. Routes in his plan are solid; routes he doesn't fly are dashed and labelled "not in your plan". A route Red Kite has taken gets a shorter bar and a Red Kite mark.
4. **One question, only when the gap is large.** It alternates: how much more he could have made (on paper), or which route earns most (pick one).
5. **Monday:** a "Last week's graphs ▾" button drops both graphs down over the plan screen.
6. **Monday news:** a card when Red Kite takes a route, and a gentle note from the Board.

**This replaces the round 3 page and zip** (same link). Earlier hand-offs are inside, in `earlier/`.

---

## 0. Rules for this round

- **How we work:** Claude Design and Claude Code only, in rounds. Every word, figure and setting here is a **placeholder**. Put each one in the workbook marked PLACEHOLDER and add it to docs/Placeholders-for-Fable.md. Don't make the figures balance.
- **Chapter one only**, behind `ch1()`. Keep everything from round 3, and keep Bertie's callout rules (DESIGN.md, "Callout rules for the whole game").
- **Pictures** in `pictures/` are 1366 × 768 mock-ups. The graphs are drawn with real proportions from Claude Code's example figures (a bar's height or length is its value). The screens around them come from Claude Design's earlier mock-ups, not the latest build, so keep your own layout for anything the pictures don't change.
- **Colours:** gold for his profit, amber for the gap, never red (unless he is losing money). Each route keeps one colour everywhere: Dublin `#2d7f68`, Paris `#3b6aa8`, Frankfurt `#7a5aa8`, Amsterdam `#c0703a`, Geneva `#2f8f9a`, Barcelona `#a8874f` (placeholders). Add a colour column to the Routes table in the workbook; new routes later get their own.
- **Reading level:** each graph should make sense in five seconds with no sentence explaining it. No arrows and no words telling him which route to pick.

## 1. Where the graphs sit: "Your week in pictures"

Pictures: `01-sunday-graphs-1-week-2`, `-2-week-4-plan-unchanged`, `-3-week-4-re-planned`, `-4-week-5-red-kite`.

- **When:** every Sunday review from **week 2** (week 1's Sunday is already full), including the month reviews from December.
- **How he gets there:** the sums come first, as now. When the last Sunday sum is right (it turns green), a green **Your week in pictures ▶** button appears in the line under the sheet (rule 6). It opens the graphs page.
- **The page:** title "How did week 4 go?", sub-line "Your week in pictures". Two panels side by side fill the content area: Graph 1 on the left (x 192–764), Graph 2 on the right (x 780–1353), both from y 150 to 690, in the sheet panel style. Footer: **◀ Back to the sums** and **Plan week 5 ▶** (`go`).
- Each panel has a title only (18px bold). No other sentences.

## 2. Graph 1: Your plan against the best plan

- **Title:** "Your plan against the best plan". **Legend** (one line, under the title): a gold square "Yours" · a white outline "Best plan" · an amber striped square "Gap".
- **Bars:** one pair per week flown so far, with labels "Wk 1", "Wk 2"… under each pair.
  - Left bar: **his profit**, solid gold `#f2c14e`.
  - Right bar: **the best plan's profit** with the same planes, a 1.5px white outline (`#cfe0f5`) with no fill.
  - **The gap:** from the top of his bar up to the best plan's height, sitting on top of his bar, striped amber (`#ffb547` stripes on a light amber fill, with an amber edge). If he matched the best plan, there's no amber.
- **Scale:** from £0 up to the next £5,000 above the highest bar, with lines every £5,000 and labels every £10,000 ("£10k"). Always start at £0. Keep at least 6 week-slots wide so early weeks don't make giant bars; squeeze the slots once there are more weeks.
- **Figures:** only for the **latest week**. The best plan's figure sits beside the top of the outline (white) and his figure beside the top of his bar (gold). He reads the gap from these two. **No running total** (Bertie: "I don't like the missed so far").
- **New-route markers:** a small blue triangle under the week a route opened, with its name underneath ("Frankfurt", "Amsterdam · Geneva · Barcelona", "Madrid").
- **Example figures** (placeholders): week 1 £9,900 / £10,400; week 2 £15,800 / £16,100; week 3 £15,900 / £17,600; week 4 £16,000 / £17,700 with the plan unchanged, or £17,400 / £17,700 after he re-planned.

## 3. Graph 2: Where the money is

- **Title:** "Where the money is". Under the bars, the axis label "Profit for each hour of plane time", with ticks at £0, £100, £200, £300.
- **Rows:** one per route he can fly, **longest bar first**. Each row has the flag and route name (bold, 128px column), then the bar, then the figure ("£310").
  - **In his plan:** a solid bar in the route's colour, with the figure in white.
  - **Not in his plan:** a 2px dashed outline in the route's colour with faint stripes inside, the figure in soft white, and "not in your plan" (12px, soft) after it.
  - **Taken by Red Kite:** the bar shorter (the route's figure with Red Kite flying it), with a small Red Kite mark (an ivory kite on a 20px oxblood square, `#7a1428`) between the bar and the figure.
- **Value:** profit a flight at his fare ÷ hours there and back, for each route. For a route he doesn't fly, use its usual fare.
- **Example figures** (placeholders): Frankfurt £310, Amsterdam £260, Paris £215, Geneva £190, Dublin £170, Barcelona £150. With Red Kite on Amsterdam: £175.

## 4. The question under a graph

Pictures: `01-sunday-graphs-2-week-4-plan-unchanged` (under Graph 1), `-4-week-5-red-kite` (under Graph 2).

- **Only in a week when the gap is large** (Bertie). Placeholder: the gap is more than 10% of the best plan's profit. Counted, like any other sum. At most one a Sunday, and it goes on alternate weeks between the two kinds.
- **Under Graph 1** (gold, the Question Signal style): top line "Work it out on paper"; then "How much more could your plan have made this week? Write [SUM n] beside it."; then an answer box (pink edge, gold £) and the Enter key. The box's pointer touches the latest week's bars. Answer: best − his for the latest week (£17,700 − £16,000 = £1,700).
- **Under Graph 2** (gold, because it counts): top line "**Read the graph**" with a small bar-chart icon (a new kind of Question Signal, see DESIGN.md); then "Which route earns most for each hour of plane time? Pick one. It counts as [SUM n]."; then a row of route buttons with their flags (four of them, in random order). Answer: the longest bar.
- A right answer turns green, then the graphs stay on screen with Plan week ▶ in the footer.

## 5. Monday: Last week's graphs

Pictures: `02-monday-graphs-button-1-closed`, `-2-open`.

- **Not on the Monday plan screen itself** (Bertie). Instead, one button at the top right of the plan screen, left of Undo: **Last week's graphs ▾**. It's 32px high, with a cyan border and a faint glow, in the same style as Undo.
- **Pressing it drops down a panel** under the button (x 300–1354, y 138–498, `#061a33`, cyan border, a pointer notch under the button). Inside are both graphs, smaller, side by side: Graph 1 on the left with its legend, and Graph 2 on the right. They show the last Sunday's figures and have no questions. The button now reads **▴**, and pressing it again closes the panel. The panel covers the top of the plan screen while it's open; nothing else changes.
- In the pictures the plan screen is the two-plans screen labelled for week 5 ("Last week's plan" on top). Keep your own week 2+ plan screen.

## 6. Monday news cards

Pictures: `03-monday-news-1-red-kite`, `-2-the-board`.

Both use the departures-board event card layout (as the Storm and Frankfurt cards).
- **Red Kite takes a route** (an ignored route, not flown for 3 weeks): the board's header reads "DEPARTURES · AMSTERDAM SCHIPHOL", with Red Kite's flights listed (times, LONDON, and RED KITE AIR in ivory on oxblood). Eyebrow "NEWS · RED KITE AIR" (soft red); title "Red Kite Air now flies to Amsterdam"; one line, "Fewer people will want to fly Amsterdam with you."; button **Plan the week ▶**.
- **The Board has a word** (the gap large 3 weeks running): in place of the departures board, a dark note panel. On the left: "TEST AIR · THE BOARD", "Profit is good. Our shareholders want the most profit our planes can make.", "Signed, the Board of TEST Air". On the right: a small copy of Graph 1 for those three weeks with its legend. Eyebrow "A NOTE FROM THE BOARD" (cyan); title "The Board would like a word"; one line, "Three weeks running, your plan made less than the best plan."; button **Plan the week ▶**. No fine in chapter one.

## 7. What Claude Code is building alongside (no pictures needed)

As in your round 4 brief: the rival takes an ignored route (demand drops by about a third); reputation dips only when his own flights turn many away **and** his planes had spare hours; the Board's note after 3 weeks of a large gap. The graphs have room for all three: the Red Kite mark on Graph 2, and the Board's card above.

## 8. Decisions (Bertie, 2 Nov)

| Question | Answer |
|---|---|
| Graphs on the Monday plan screen? | No: just the review, plus a button that drops them down again on Monday, like More detail. |
| A running total ("Missed so far")? | No. Bertie didn't ask for it. |
| One question a week, or only when the gap is large? | Only when the gap is large. |
| The five screens | All "looks right" (2 Nov). |

## 9. What to check in the next play-test

- Does a pupil who's stuck on one plan notice the amber gap growing after new routes open?
- On Graph 2, does he go for the top dashed bar without being told?
- Is the gap question answerable from the two figures alone?
- Does anyone open Last week's graphs on Monday?
