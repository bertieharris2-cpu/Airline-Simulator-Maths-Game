# Week-1 review (8 October 2026): report back

*Claude Code, 8 October 2026. Your dictated notes on the week-1 screens, note by note, with what changed. For the game's state see `docs/State-of-the-Game.md`. Screenshots are in `docs/screenshots/week1-review/`.*

## Decisions you took (8 Oct)
- The one-page **Work it out** is used on launch day and every day of week 1 (and, since it is the same mechanism, every *day* period in chapter 1); weeks keep the planner and the cost sheet. The model's comparison you liked (*Try other ideas*) is the next screen.
- **Crew duty is removed from chapter 1.** It is gated on a new Settings key `crewFromDate` (draft value 2031-01-06, the start of chapter 2, when the airline type is chosen).
- The "which sum?" problem was the briefings' *Your turn* page: it is now three practice calculations. "Which sum?" stays on the later briefings (the fleet, the seasons, the week, the year).
- Practice is three questions each, all answered, calm retry.

## Your notes, one by one

| Screen | Your note | What changed |
| --- | --- | --- |
| 01 Name | Box central | Centred, with a *Do this* line ("Type a name for your airline, then press Next"). |
| 02 Flight code | Central | Centred. |
| 15 Chapter banner | Central, line by line, bullets, no maths | Centred; each line fades in after the last (instant under reduced motion); *Arriving this chapter* is a bullet list; the maths line is no longer shown (it stays in the workbook for you). |
| 16 (and throughout) | Not always clear what to press | Every screen has a one-line **Do this** under its question: the HQ steps from a `STEP_TODO` table, the identity screens, the briefings (per page), the event, the fuel screen, Work it out. |
| 18 Market | Say both can be chosen later | Added: "You open one market today. The other one opens later in the week, and you will fly both." |
| 19 Demand | Is flying 12 people efficient? | Added: "Part of the game is deciding: is it worth flying a service for 12 people, or does it cost more than it earns?" |
| 22 Turnaround | Turnarounds differ; a couple of factors | Added: bigger airports have further to tow bags and more passengers to board; some have fewer staff or stricter checks; small aircraft turn round faster than jets; Dublin 45 min, Heathrow T5 35 min. |
| 23 Ready again | Centralise; two more questions | The middle-button question is gone. Three typed questions, centred: today's service; "what if the first flight left at 08:00" (lands at …, add the turnaround); the next service on a busy evening with a longer turnaround. New numbers each time; a hint on a wrong answer; *Show me* after three goes. |
| 24–37 Timetable → Fare → Cost → Test | Repetitive; scheduling ticks wasted; ×4 not open for Dublin; one page; squared paper; three multiplications; £100 is too easy; the model on the next screen | **Work it out** replaces timetable, fare and cost. Left: the ×1–×4 buttons (a button that won't fit now says *4 services end at 01:45 next day, the airport closes at 22:00*) and the expected passengers. Right: a sheet with a column for each of three fares around the normal fare (Dublin £70 / £80 / £90, Paris £80 / £90 / £100: at most one round hundred), the tickets at each fare typed, then the fare is chosen, then the profit of that fare typed. The sum opens under the sheet with squared paper (a cream grid, pen and eraser) on a button. The scheduling questions are gone (the turnaround skill is practised on screen 23). *Try other ideas* follows as before. |
| 38 Take-off | OK | Unchanged. |
| 39 Take-off | The plane goes backwards | The runway animation now runs right to left with the nose lifting, on the laptop and the wall. |
| 41 Snacks briefing | Centralise, line up the sums, don't squish | All briefings are centred; worked examples are laid out as a column with the `=` signs aligned; the four snack cards are two per row. |
| 42 | Central | Centred. |
| 44–45 Plan and Cost | Merge; more room for the snacks; no operating day; expected passengers can stay; the +/− confusion; two or three options | One page: the planner (snack cards, fares, expected passengers; no operating-day timeline) on the left, the £3 and £5 options as two columns on the right (cabin sales and profit typed for each), *+ Compare free snacks too* adds a third column, then *Sell at £3 / Sell at £5 / Give free snacks*. The Services and Fare controls share one −/+ control. |
| 52–55 Fuel briefing | A clearer worked example; guide through the decimal; then do it themselves | The maths page works 1,000 × £1.30 as £1 then 30p then add, in a column; *Your turn* is three typed questions (litres × a decimal price, never today's own price), and a wrong answer gets the pounds-then-pence method. |
| 63 Buy fuel | Confusing; centralise; suggest investing; market data later | The screen is centred; the order bill is typed on the screen (hint, then *Show me*); a *Think like a CEO* panel says fuel bought today stays in the tank, buying when the price is low is an investment, and that market data for predicting prices comes later. |
| 84–87 Crew | Not a mechanic we need yet | Removed from chapter 1 (see decisions). The day-4 briefing no longer mentions the crew; day 5 keeps the storm and asks for the tickets by hand. |
| Build scaffold | Comes in too early; not clear what to do | The *Your turn* page no longer asks "which sum?" in week 1 (practice instead). Profit stays typed on the snacks day; Build first appears with the new route on day 8 (Amsterdam), where the sum is familiar. |
| 75–76 Red Kite | Couldn't compare | The event screen shows *What the model says about Dublin today*: hold at £80 vs match at £50 → want to fly with you, seats you fly, tickets sold, ticket revenue (as people × fare), and which brings in more; the advertising cost is written as a sentence. |
| 97–100 Weekend | Centralise; overwhelming; the CEO line; the example repeated the question; three questions | Centred; opens "As the CEO you will be given statistics like these. Use them to make the best decision you can."; two cards instead of four; the example is 40 × 0.7 worked in tenths; *Your turn* is three typed questions on 7 in 10, 6 in 10 and 2 in 10 more with numbers that are never 40. |

## What I assumed, and what to check
1. **Three fares on launch day** are the normal fare and its neighbours (the workbook's `fareOptions`); for Paris that is £80 / £90 / £100, so one easy hundred remains. Say if you would rather have £70 / £80 / £90 everywhere.
2. **Profit on launch day** is typed for the chosen fare only (the other two are filled by the model once the fare is chosen), so launch day asks four sums: three multiplications and one subtraction.
3. **Every day of week 1 asks for at least one multiplication:** when the hand-sum rules have nothing new (days 5–7) the main route's tickets are typed. The rules sheet (HandSumRules) says "the first time by hand, then the model"; this is a deliberate week-1 exception and is noted for Fable.
4. **Crew duty** is off before `crewFromDate` (v4.3 draft, Settings). The Calendar's day-5 mechanic "crew duty" is ignored before that date, so Fable can move or delete the row at leisure. The world engine (`src/opening/engine/world-engine.js`) follows the same date.
5. **Practice numbers** are random within small sets (fuel 500–2,500 L at £1.20–£1.50; weekend 20–90 by tens; cabin sales 7–19 buyers at £3–£5; tickets 11–19 at £65–£95), never the briefing's own example. Each round is logged in *By hand so far* as "3 of 3 right first time" (and how many were shown).
6. **Squared paper** is 24 px squares on cream; the pupil's strokes are not saved between screens (as before with the dark pad).
7. **Weeks and months** are untouched: the planner, the cost sheet and the dock still run from day 22.
8. **Older saves** mid-day are migrated to the new step list when they load.

## Notes for Fable (workbook v4.3 draft)
- Settings `crewFromDate` (draft 2031-01-06): crew duty, its briefing and its £250 wait for this date. Calendar day 5's mechanic `crew duty` is ignored before it.
- HandSumRules: in week 1 a day with nothing new still asks for the main route's tickets (the teacher's request for daily practice); profit on the snacks day is Calculate, not Build.
- The chapter banner no longer shows `mathsFront`; `mechanicsArriving` is shown as a list, split on `;` (chapter 1's list is long: "load factor % (day 22)" and "scaled event costs (day 22)" read as designer notes).

## Checks
| Check | Result |
| --- | --- |
| Full chapter 1 at 1366 × 768 | see the commit message: no errors, no new overflow |
| Live operations to week 1, answers, run-through, engine | pass (the engine test now passes the day's date so the crew date applies) |
| Launch day | Work it out follows the service; three fares; the fare waits for the tickets; the ×4 reason shows for Dublin |
| Day 2 | two snack options, a third on request |
| Day 3 | a wrong order bill shows the pounds-then-pence method; Next waits for the bill |
| Briefings | a wrong practice answer gets a hint; three right answers open the plan |
