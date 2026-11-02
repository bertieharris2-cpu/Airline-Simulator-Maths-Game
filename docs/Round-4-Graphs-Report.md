# Round 4, part two: the Sunday graphs (2 Nov 2026)

Claude Design turned the graphs hand-off into five screens, and you approved all five. They're now in the chapter-one game (`airline-opening-prototype.html`):
- Your week in pictures, with its two graphs;
- the question under a graph;
- Last week's graphs on Monday;
- two Monday news cards.

The hand-off itself is in `data/incoming/handoff-round4-2-nov/`, and its DESIGN.md is installed. Screenshots of the new screens are in `docs/screenshots/round-4-graphs/` (01 to 13).


## The short version

From week 2, when his last Sunday sum turns green, a green **Your week in pictures ▶** appears. It opens a page with two graphs:
- **Your plan against the best plan**: his profit in gold beside the best plan's as a white outline, with the gap he missed striped amber on top of his bar;
- **Where the money is**: what each route earns for each hour of plane time, longest bar first. Routes he doesn't fly are dashed and say "not in your plan", and a route Red Kite has taken carries its mark.

Only in a week when the gap is large does he get one question about the graphs, and it counts.

On Monday, a **Last week's graphs ▾** button on the plan page drops both graphs down again. And when Red Kite takes a route or the Board wants a word, Monday now opens with a news card in the departures-board style, as Claude Design drew it.


## Screen by screen

| Screen | What he sees | Screenshots |
| --- | --- | --- |
| **The Sunday sums, weeks 2 to 5** | When the last sum is right, **Your week in pictures ▶** appears in the line under the sheet, next to "✓ Week 2's accounts are done." Plan week waits until he's looked at the pictures once. After that, both buttons are there. | 01 |
| **The week's review, weeks 6 to 13** | From week 6 the week's review is the Monday page "How did week 6 go?". Once it's signed off, the same button sits in the footer. | 08 |
| **Your week in pictures** | "How did week N go?" / "Your week in pictures". Two panels side by side, each with just its title. Footer: **◀ Back to the sums** and **Plan week N ▶**. | 02, 03, 09 |
| **Graph 1** | A pair of bars for every week so far: his profit in gold and the best plan with his planes as a white outline, with the gap striped amber on top of his bar. The scale starts at £0 in £5,000 steps, and there are always at least 6 week-slots. Only the latest week has figures beside it. A cyan triangle under a week names the routes that opened that week ("New routes" when the names don't fit). There's no running total. | 02, 03, 09 |
| **Graph 2** | One row for each route his planes can fly, longest first: flag, name, bar, figure. Routes in his plan are solid in the route's colour. Routes not in his plan are a dashed outline with "not in your plan". A route Red Kite has taken is shorter and has the small kite mark. There are no arrows or advice. | 02, 03, 09 |
| **The question, only when the gap is large** | It alternates between the two graphs. Under Graph 1 it's a gold paper box: "How much more could your plan have made this week? Write SUM n beside it.", with an answer box and Enter. Under Graph 2 it's **Read the graph**: "Which route earns most for each hour of plane time? Pick one." with four route buttons. He gets two tries; a right answer turns green, and then Plan week unlocks. | 04 to 07 |
| **Monday: Last week's graphs ▾** | On the plan opener it's at the top right. In the timetable view it's to the left of Undo. It drops both graphs down, smaller, in a dark panel with a cyan edge and a notch, with no question. ▴ closes it. | 12, 13 |
| **Monday news: Red Kite** | A departures board listing Red Kite's flights (07:10, 12:40, 17:55 to LONDON, RED KITE AIR in ivory on oxblood). Then NEWS · RED KITE AIR, "Red Kite Air now flies to Geneva", "Fewer people will want to fly Geneva with you." and **Plan the week ▶**. | 10 |
| **Monday news: the Board** | A dark note: "TEST AIR · THE BOARD", "Profit is good. Our shareholders want the most profit our planes can make.", "Signed, the Board of TEST Air". Beside it is a small Graph 1 of the three weeks. Then A NOTE FROM THE BOARD, "The Board would like a word", "Three weeks running, your plan made less than the best plan." and **Plan the week ▶**. There's no fine. | 11 |

These two cards replace what I built earlier today: the Board's panel on the plan opener and the "Red Kite has taken over…" row in This week. The rules behind them haven't changed.

Every word, colour and setting is a placeholder in the workbook, listed for Fable in `docs/Placeholders-for-Fable.md` (round 4 graphs). Claude Design gave colours for six routes. I made up colours for the other twelve chapter-one routes, avoiding red, amber, gold and green.


## Things I had to decide, which you may want to change

**How Graph 2's figure is worked out.** The hand-off says "profit a flight ÷ hours there and back". If I took a single flight, nearly every route would fill one small plane, so Red Kite taking a route would make no difference to its bar. So I used one of his planes flying that route all day (as many flights as fit), divided by the hours flown, with next week's passengers. That way a route that has lost passengers to Red Kite really does come out shorter. Some routes come out at £0 or below; they show the figure with no bar, in red only when it's below £0.

**Claude Design's example week wouldn't ask the question.** The picture asks the question for £16,000 against £17,700. That's a gap of 9.6%, just under the "more than 10%" rule, so the game wouldn't ask it that week. Either number is a placeholder; I've left the rule at 10%.

**The question takes one of the pause's two counted slots.** You've said never more than two counted questions a pause, so the graph question only comes when there's still room. When it does come, Finance's own Monday questions fill what's left. If the pause is already full, there's no graph question that week.

**He has to look at the pictures once.** On the Sunday, Plan week stays hidden until he's opened Your week in pictures. After that, both buttons are there.

**Weeks 6 to 13.** From week 6 the week's review is the Monday "How did week N go?" page, so the pictures follow that page and its footer reads "Sunday review · week N". Chapter one has no month review before its end card, so the graphs stop after week 13.

**When the best plan comes out lower than his own week.** In a few early weeks of the test airline, the game's "best plan" search comes out a little below what he actually made. In that case the graph puts the outline at his own height, with no gap, rather than drawing it shorter than his bar.

**The departures board.** The workbook has no airport names, so the board reads "DEPARTURES · GENEVA GVA" instead of something like "GENEVA COINTRIN". Red Kite's times are the three in the picture.


## Checks

I played these in the test toolkit, with no page errors:
- the week 2 and week 5 Sunday reviews through to the pictures, back to the sums, then Plan week;
- the week 4 paper question (a wrong try, then right; recorded as a counted SUM);
- the week 5 Read the graph question (a wrong pick, then right);
- the week 6 Monday review through to its pictures;
- the Red Kite and Board news cards;
- Last week's graphs on the plan opener and in the timetable view.

To make the question and the news cards appear, I made up gaps and a rival.

`chapter1.test.js` passes: 39 checks, none failed, no page errors. That includes the full run from Launch Day to the chapter review, which goes through every week's pictures page, and "never more than two counted questions a pause".


*Round 4 of about 10.*
