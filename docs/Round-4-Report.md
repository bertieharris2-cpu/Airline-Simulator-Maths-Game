# Round 4: what happens to a pupil who coasts (2 Nov 2026)

> **Update, later on 2 Nov:** Claude Design's round 4 hand-off replaced two things described below. The Board's note is now a Monday news card, and so is Red Kite taking a route; the panel on the plan opener and the row in the This week list have gone. The rules behind them are unchanged. See `docs/Round-4-Graphs-Report.md`.

You wanted a pupil who sticks with one plan to feel it when new routes open and he doesn't change anything. You picked three ideas:
- Red Kite takes a route he ignores;
- his reputation dips, but carefully;
- the Board steps in, gently.

You also wanted one or two graphs at the end of each week. The graphs are Claude Design's job: the hand-off "The Sunday graphs, round 4" has your answers in it. Graphs go on the review only, a button with a dropdown on the plan screen lets him look again, and there's no "Missed so far" figure. I've built the other three, in chapter one only. Screenshots are in `docs/screenshots/round-4/`.


## The short version

- **Red Kite takes a route he ignores.** If a new route goes three weeks without him flying it, Red Kite takes it over and keeps about a third of its passengers for good.
- **The stars only drop when he could have done better.** Turning people away only counts against his stars in a week when his planes had time for one more flight.
- **The Board has a quiet word.** Three weeks running well short of what his planes could make, and Monday's plan opens with a short note from the Board. There's no fine.

Every number and every word is made up for now. They're in the workbook marked PLACEHOLDER, and listed for Fable in `docs/Placeholders-for-Fable.md` (round 4).


## The three, one at a time

### 1 · Red Kite takes a route he ignores

**When:** a route that opened after Launch Day has gone **3 weeks** without him flying it. The clock only runs while one of his planes can reach the route. Marrakech is too far for a Twin Otter, so it doesn't count until he has a plane that can get there.

**What happens:** from the next Monday, Red Kite takes **about a third** of that route's passengers, for good.

**What he sees:**
- on a Sunday review (weeks 1 to 5): "Red Kite takes over Frankfurt from Monday. About a third of its passengers will fly with them for good.";
- in weekly play: the same line in the news;
- on that Monday, at the top of the **This week** list: "Red Kite has taken over Amsterdam. About a third of its passengers now fly with them for good." (screenshot 01).

In my test run from week 5, Red Kite took Amsterdam and Barcelona on Mon 14 Oct and Madrid a week later, because the test pupil hadn't flown any of them since they opened.

### 2 · Reputation dips, carefully

You said one small airline can never carry everyone, so turning people away can't always be his fault. The game already had a rule: turn away 1 in 3 people on a route two weeks running and you lose half a star.

In chapter one that rule now only counts **if his planes had time for at least one more flight of that route**. If every plane is busy all day, turning people away is just life, and his stars don't move.

### 3 · The Board steps in, gently

**When:** for **3 weeks running**, his weekly profit has been at least **10%** below the best plan his planes could have flown.

**What he sees:** Monday's plan opens with a short panel, "A word from the Board" (screenshot 02):

> Last week your plan made £14,000. The best plan with your planes would have made £17,500.
> Making a profit is good. Shareholders want the most profit your planes can make.

He presses **Understood** and the panel goes (screenshot 03). There's no fine and no star change. After a note, the Board waits another 3 weeks before it can say anything again.

The "best plan" figure is the same one the parked "How good was the plan" box used, so the game already worked it out every week.


## Things I had to decide, which you may want to change

**Launch Day's routes are safe.** Dublin and Paris are his from the start, so the rival only goes after routes that open later. If you want Red Kite to be able to take Paris too, that's a one-line change.

**The old weekly drop for unflown routes stays.** Before this round, a route he didn't fly already lost a few passengers each week. The Sunday review shows that as a chance: "You could fly these new routes. Red Kite flies them for now…". That's written into DESIGN.md, so I left it alone. The rival's third comes **on top** after three weeks. That's a double hit. If it feels too harsh, we could switch off the weekly drop on routes the rival is about to take. That would change a DESIGN.md rule, so it's your call.

**Red Kite keeps its third for good.** You said "its demand drops" and didn't say whether it comes back. I made it permanent so it's a real lesson. It could also fade back once he flies the route for a few weeks.

**It only costs him if he wants the route later.** A route he isn't flying earns him nothing anyway, so the rival hurts only when he finally tries it and finds fewer passengers. That suits "try new routes early". The graphs are what will show him the money he's leaving on the table each week.

**The Board may not turn up much.** In my test runs, the test pupil was never more than about 4% below the best plan in any week, so the Board never came. To see the note, I made up three bad weeks. 10% is a placeholder, and as agreed I haven't judged whether it's the right size.


## Still to come (after Claude Design)

- The one or two graphs on the Sunday review.
- The question about the graph, asked only when the gap is large (the same 10% placeholder).
- A button with a dropdown on the plan screen to look at the graphs again, like More detail.

Hand-off for Claude Design: https://claude.ai/artifact/TMZfHC1DRbM83LE29B9NFA


## Checks

I played three runs in the test toolkit, with no page errors:
- **A pupil who keeps his plan from week 3 to week 9.** Red Kite took routes after three unflown weeks. Marrakech stayed safe while his planes couldn't reach it. The Board didn't appear, because the gap stayed under 4%.
- **Three made-up bad weeks before Mon 30 Sep.** The Board's note opened the plan, and Understood closed it.
- **From week 5 to Mon 14 Oct.** "Red Kite has taken over Amsterdam / Barcelona" sat at the top of This week.

`chapter1.test.js` passes: 39 checks, none failed, and no page errors, including the full run where the test pupil keeps his plan from Launch Day to day 37. As agreed, I didn't check whether the figures make sense.


*Round 4 of about 10.*
