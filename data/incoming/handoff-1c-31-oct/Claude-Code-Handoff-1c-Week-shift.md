# Claude Code hand-off 1c — everything after week 1 moves a week
*From Fable, 31 October 2026. Confirmed by Bertie. Goes with Airline-World-Workbook-v6.4.xlsx (import once; it includes v6.2 and v6.3). Chapter one only. Answers the open items in Hand-off 3, sections 6, 8 and 9, and the "Note for Fable".*

## What this means (for Bertie)
Week 2 becomes a plain week on his plan, with nothing new in it. The Fuel desk and the what-if sheet arrive in week 3, the shop and the new routes in week 4, Madrid in week 5, and so on through the autumn. The chapter still ends on 28 December. Weeks 2 to 4 all use the "Week N is flying" page. View trade-offs and ƒ work it out stay hidden until week 4. The capacity tip stays hidden until the shop opens.

## 1. The shift (D110, `afterWeekOneShift = 7`)
Everything is read from the workbook, as hand-off 3 set up. The import brings:
- **Calendar:** days 8–28 moved to 15–35. Days 8–14 are a quiet week 2: the plan check on Monday, the plan flies, the Sunday accounts (the sheet adds up). Week numbers in titles are renumbered.
- **Routes:** chapter-one unlock days +7 (Amsterdam, Frankfurt, Geneva, Barcelona day 22; Madrid 29; Marrakech 36; Brussels, Berlin, Milan 43; Rome, Lisbon 50; Athens, Istanbul 64; Edinburgh 71; Reykjavik 78; Cairo 92).
- **Aircraft shop:** Saab and ATR day 22; E175 and E190 day 29; A220, A320, 737 day 64 (`secondPlaneShopFromDay = 22`).
- **Mechanics rows** +7 (weekly play from day 36; months from day 85).
- **Settings:** `fuelDeskFromDay = 15`, `whatIfSheetFromDay = 15`, `marketSheetFromDay = 22`, `reputationFromDay = 22`, the turned-away star rule from day 36, `dailyColourFromWeek = 3`, `reviewRotationFrom` the week-3 review, `flightDaysFromDay` earned at the week-3 review with the fallback on day 28.
- **Upgrades:** weekend_schedules at the week-3 review (day 21), fallback day 28.
- **Briefings:** Cash, tank, profit at the first Fuel desk visit (week 3); Two planes and Can I afford the plane in week 4; Weekdays and weekends at the week-3 review.
- **The ladder** (`spreadsheetLadder`): click in weeks 1 and 2; week 3 click-and-add then shown Σ SUM by dragging; drag only from week 4.
- **Not moved:** the Market sheet's fuel prices (real dates); chapter two onward (not in this build); parked events and news (their dates need +7 when they return).

## 2. The question schedule (PauseSchedule sheet)
| Pause | Question 1 | Question 2 |
| --- | --- | --- |
| Launch Day | The fare above his, on paper | — |
| P1, days 7–8 | — | — (plan check; week 2 flies) |
| P2, days 14–15 | What-if sheet: first sum | Modelling question |
| P3, days 21–22 | Second plane: time to afford | First rotating review question |
| P4, days 28–29 | Fuel for two planes | Madrid possible revenue |
| P5, days 35–36 | Difference from plan (first) | Rotating review question |
| P6, days 42–43 | E175 worth check, or a rotating question | Modelling question |
| P7 on | Required decisions first | Then the difference (about every third pause), a rotating or a modelling question |

## 3. Counting: the rule gap from your section 9 (`countingPriority`)
The two slots at a pause go **first to sums the pupil's own plan change requires** (the Monday sheet's cells), **then to the scheduled questions**. Never more than two counted questions at a pause. So a pupil who changes his plan on Monday is asked his own plan's two sums and the scheduled ones wait; a pupil who keeps his plan gets the scheduled two. Formula cells still don't count.

## 4. Bertie's answers to your decisions
- **Weeks 2 to 4 get the same "Week N is flying" page** as week 1, with the plan check on Monday and no Close the day (`weekFlyingPages`). Yes.
- **View trade-offs and ƒ work it out:** hidden until the start of week 4 (day 22), then shown (`studioExtrasFrom`). Not all chapter.
- **The capacity tip:** hidden entirely until the shop opens on day 22 (`tipsOnlyActionable`). As built.
- **Speeds:** kept as built; now in Settings (`weekSpeed`) so they can be tuned.
- **A save joining week 1 part-way** goes straight to the week page: fine.
- **"Made money"** judged on a flight's own costs, without the plane's day cost: fine.

## 5. Launch Day columns (`launchDayColumns`)
Your relative order is kept: the fare below his demonstrated, his fare built, the fare above on paper. Added: if his fare is the bottom of the route's table (£70 on Dublin), demonstrate his fare, build the fare above, and put the next one above on paper.

## 6. The modelling question (P2 onward, `modellingQuestion`)
Build it now: if his plan leaves money on the table on a route (another fare would earn at least £50 a day more on his own flights), compare his fare with the next fare that earns more, one step, and show the difference for one flight, a day and a week. A paper question, counted. If his plan is already good, the other form: the game suggests two changes and he works one out on the what-if sheet. First asked at P2.

## 7. Report back
A TEST run from Launch Day to day 36: week 2 with nothing new and the flying page; the Fuel desk and the what-if sheet on day 15; the shop, the four routes and the capacity tip appearing on day 22, with View trade-offs and ƒ work it out; Madrid on day 29; the counted questions at every pause (never more than two, and the plan-change sums taking the slots when he changes his plan); the Roadmap's NOW · NEXT · LATER matching the new days.
