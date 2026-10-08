# Week-1 review: report back (second round, 8 October 2026)

*Claude Code, 8 October 2026, evening. The first round (the morning) answered your dictated notes screen by screen; this round carries Fable's design note (*The balance of maths, and a workings page*) and Workbook v4.3 with its addendum, after you felt the amount of maths was still wrong. For the game's state see `docs/State-of-the-Game.md`; screenshots are in `docs/screenshots/week1-review/`.*

## Decisions you took (8 Oct, second round)
- **Fable's daily budget**, but the launch-day **ready-again practice stays** (three typed times on the one-service screen: "I liked that practice").
- **Practice elsewhere is a teacher setting**, default 0 (`practiceQuestionsPerDay`: none, one or three a day), with the pupil's own numbers, after the day's sums, marked optional.
- **Fable's layout:** a planning page (HQ) and a separate full-screen workings page.
- **Workbook v4.3 as the base**, with my CR5 draft rows re-added (Fable's copy did not carry them).

## What is built

**The planning page** (`mode: planning`): the services (×1–×4 on launch day, a locked slot saying when it would end and that the airport closes at 22:00; the planner from day 2), the fare chips with the people at each fare, the expected passengers, and **Try an idea**: the modelling tool you liked, folded into a button on the plan so the page fits; open, it shows a test plan beside yours with the model's comparison and *Make the test plan my plan*. No scheduling tick-list, no operating-day timeline. The footer is **Cost your plan**.

**The workings page**: full screen on squared paper. One sum at a time in the formal written method: the figures in columns (a price per litre as pence, a share as tenths or hundredths), a carry row, working rows the pupil may fill in, the answer typed; *Check* with the calm retry, *Show me* after three goes, which writes the method on the working rows (short × then × 10 for £10 fares; pounds then pence for fuel; tenths for the rival and the weekend). A number pad for the whiteboard. The launch day's fare and the snack day's option are chosen there once their sums are done, then that option's profit. Day 3 opens with the worked example stepped through on the paper (1,000 × £1.30 as £1 then 30p then add; 130p × 1,000 = 130,000p). Then a summary of the day's workings and **Back to HQ**. A day with nothing to work out skips the page.

**The budget** (in `decideHandSums`): Build is withdrawn before day 22; profit is typed only for the chosen option; the fuel bill on the ordering screen is the model's again; a day with nothing new asks for nothing.

| Day | By hand (Calculate) | Model does |
| --- | --- | --- |
| Launch | tickets at £80, £90, £100 (Paris) or £70, £80, £90 (Dublin); the chosen fare's profit | costs, totals; ready-again times shown (the three practice questions stay) |
| 2 | cabin sales at £3 and at £5; the chosen option's profit (free snacks as a third on request) | tickets |
| 3 | the fuel cost after the worked example | the order bill, tickets, profit |
| 4 | the new route's tickets (Calculate); fuel again only if the litres jumped by a quarter (HandSumRules 2) | the rest |
| 5 | passengers who stay with you: people × the tenths who stay (the Red Kite rule) | the rest of the card |
| 6 | the weekend tenths: the route's weekday business travellers × 7⁄10 | the rest |
| 7 | nothing | all |

The test walk counts **12 hand sums in week 1** with practice off (4, 3, 1, 2, 1, 1, 0), at most three multiplications on any day, and no sum typed anywhere but the workings page.

**Red Kite (D50)**: `rivalSwitchPerTenPounds`, `rivalSwitchCap`, `rivalAdvertiseFactor` and the Events columns are read; for every £10 the pupil's fare is above the rival's, 1 in 10 of his passengers switch (cap 6 in 10), halved while his advertising runs (`durationDays`). The card shows, for Match / Hold / Advertise, the fare, who wants to fly, who stays ("7 in 10"), the tickets and the day's projected profit, and *Fly Paris instead* as a note row. The world engine implements the same rule; `engine.test.js` checks the addendum's figures (hold £90 → 37 stay, advertise → 50, match → 96, cut to £80 → 50). The old flat 20 % cut is gone (an older workbook without the rule falls back to the route's `competitionSensitivity`).

**Crew (D51)**: read from `crewMechanicFromDate` (2031-01-06); no briefing, no £250, no crews line before it; the chapter list drops the crew line too.

**Practice**: the teacher panel's *Maths tools* section has the setting. When on, the questions follow the summary on the workings page with the pupil's own numbers: his route at its neighbouring fares, his litres at the other prices seen, his buyers at the other snack price, his weekday passengers in tenths. Skip is allowed. Each round is logged in *By hand so far* as practice.

## What I assumed, and what to check
1. **The Red Kite sum is on day 5**, the storm day (the first full day of the undercut; Fable's table lists "5 Red Kite" and leaves the storm out). The storm event stays on that day.
2. **The weekend sum** is the route's weekday *business* travellers × 7⁄10 (the share from the archetype), so it is a clean tenths sum; the model's weekend demand blends business and leisure.
3. **Advertising halves the share**, which can give a share that is not whole tenths (e.g. 0.85): the workings page then shows "85 in 100" and divides by 100.
4. **Fuel on day 4** may be asked again if adding the second route moves the litres by a quarter (the workbook's rule 2 has both the price and the litres thresholds); the note mentions the price only. Two sums on day 4 is within the budget.
5. **The modelling tool is folded** into a button on the plan panel (open, it replaces the expected-passengers panel) so the HQ page fits a 1366 × 768 laptop.
6. **Workbook**: Fable's v4.3 is now the repo's workbook, with the Livery sheet, the five Aircraft columns, `blockedFlightCodes`, `soundDefault`, `revealSeconds` and `practiceQuestionsPerDay` re-added by the draft tool; `crewFromDate` is dropped. The README sheet lists them for Fable.
7. **Weeks and months** keep the planner, the cost sheet and the Test screen.
8. **The written method's partial rows** are the pupil's own (not checked); Show me fills them in.

## Notes for Fable
- Re-added rows (above). `practiceQuestionsPerDay` is new in Settings (default 0).
- "Match their price" no longer has `setPrice dub=match` in `otherEffects` (v4.3 writes the rule as prose): the game derives it from `rivalFare` and the option's label. A `setPrice` effect still works if you add one back.
- The Red Kite tenths sum uses the pupil's own fare on the affected route; if he is not flying it that day the sum still asks "if you flew Dublin at your fare".

## Checks
| Check | Result |
| --- | --- |
| Full chapter 1 at 1366 × 768 | 361 checks, no failures, no errors; the overflow list is the showroom on days 14/21/22 and the weeks from day 22 (as before), plus the two-aircraft planning page on days 15–21 by 8 px |
| To day 9 at 1915 × 891 (152 checks, no overflow); live operations to day 8 (103); answers (14); run-through; engine (9, with the Red Kite figures) | pass |
| Week 1 | 12 Calculate steps with practice off; ≤ 3 multiplications a day; no sum typed outside the workings page; Build absent before day 22 |
