# Report back: the revised Operating Plan Studio

*From Claude Code to Bertie and Fable, 13 October 2026. This answers Bertie's "Operating Plan Studio — revised interaction brief". The revision is built as a separate file, `airline-opening-studio-v2.html`, so the main game (`airline-opening-prototype.html`) keeps the v4.10 Studio until Bertie approves. The new code is in `src/opening/parts/p4ze_studio2.js` and `p1_head_studio2.css`. Screenshots are in `docs/screenshots/v2studio/`.*

The principle is Bertie's: **do not simplify the airline; simplify what is visible at any one moment.** Nothing in the simulation was removed. The Monday plan page now has three working states, and the rest is one press away.

## Keeping the current Studio safe

| File | What it is |
| --- | --- |
| `airline-opening-prototype.html` | The game. It has the v4.10 Studio plus three fixes: the timetable's buttons stay on screen, Delete removes a pressed flight, and the model's plans are one row per route. |
| `airline-opening-studio-v2.html` | The same game with the revised Studio. Built from the same parts plus one extra part. It shares the main game's save. |
| `airline-opening-prototype-v4.10-studio.html` | A frozen copy of the Studio as it was before any of today's changes. Never rebuilt. |

Making the revision the main game is a one-line change in `build.py`.

## The brief, point by point

| § | Asked | Built |
| --- | --- | --- |
| 1 | Separate *Operating plan* from *Change network* | **Done.** Three states: the opener, the operating plan and Change network. Change network opens from *Add / change routes* or *Network · N routes*, and *Return to operating plan* comes back. |
| 2 | Only the active routes on the weekly screen | **Done.** *Active routes* lists only the routes flown: fare, demand at that fare, services and seat fill. Each row has *Edit fare*, *View demand* and *+ Service*. Two columns from four routes. |
| 3 | Filters, not separate pages | **Done.** All · Short haul · Medium haul · Long haul, with counts, and a sort by demand, distance, fare or A–Z. Hidden when six routes or fewer are open. |
| 4 | Aircraft suitability | **Done.** The aircraft to plan for is chosen in a menu. *Suitable* shows the routes it can fly; *All routes* shows every route, with out-of-range ones saying so. |
| 5 | Timetable dominant | **Done.** Full width, the largest area. |
| 6 | Compact, information-rich blocks; editing only on demand | **Done.** A block shows departure–return, the route, its fare, a fill bar and seats filled / seats; the tooltip gives the ready-again time. Pressing it opens a small editor beside it: earlier, later, route, fare, aircraft, remove (or Delete) and service costs. |
| 7 | Seat fill as the main live feedback | **Done.** The summary bar shows seats likely filled / seats (%), empty seats, turned away, average fare and projected profit a day. Profit is there but last. |
| 8 | Insights drawer, closed by default | **Done.** *View trade-offs* (with a count) opens a drawer from the right. |
| 9 | Two insights, then *Show all* | **Done.** "2 things worth looking at" are the two PlanTips tips. *Show all insights* groups everything as seat use, lost demand, timing, fare, capacity and money. New lines include "Amsterdam could fill all 68 seats at £85, but would earn £5 less per passenger" and "The E-175 is lightly filled on Barcelona at 18:40 (32 / 80)", for any flight under half full. |
| 10 | News goes to the affected part of the plan | **Done.** Announced news on the opener and in the World report has **Review Dublin services**. It opens the plan with the row highlighted, the route's flights glowing, its aircraft marked, its editor open and the strip on it. **Apply changes** returns to the week's plan. |
| 11 | Weekly plans persist: Keep plan / Edit plan | **Done.** From week 2, the Monday opens on "Last week's regular plan is ready to run again" with Keep plan, Edit plan, four figures, the timetable (read only) and **Known changes this week**: the fuel price, a tank short for the week, announced news, the board's request, and an aircraft with no flights. Keep plan goes on exactly as *Cost your plan* did, so the hand sums, the cap and the audits are unchanged. |
| 12 | Regular operating patterns | **Designed, not built** (below): it changes how a plan is stored. |
| 13 | Fleet groups as the fleet grows | **Done.** From four aircraft the rows group by type: "Twin Otter · 3 aircraft · 6 flights a day · 93% full". A group opens when pressed, or by itself when it holds the selected or reviewed aircraft. |
| 14 | No permanent fuel banner; a strong Fuel button | **Done.** **Fuel** in the toolbar. An amber dot and "0 L" show when the tank won't cover the week; a green dot shows when it will. |
| 15 | Status badges | **Done** for Fuel, Network · N routes, the trade-offs count, and the page status (Unchanged / Changed this week / Board waiting). |
| 16 | Focus View | **Parked**, as Bertie asked, with the other accessibility options. |
| 17 | Screen hierarchy | **As described:** top, active routes, toolbar, timetable, summary, drawer. |
| 18 | A focused route editor | **Done.** The current fare, every fare with the people at it (a bar each, with the seats marked), "Demand 52 · Seats 38" and what that means, + Add a service and Stop serving. |
| 19 | The UI reacts to the task | Selecting a route shows its fares and demand. Pressing a flight shows timing and its own figures. The plan shows seat use. Costing, fuel and news keep their own screens. |
| 20 | Keep the visual quality | Same dark desk panels, gradients, aviation art, route flags, fill colours and timeline. |

## Changes from D66 for Fable

- **Seat fill on Active routes.** D66 kept seat fill off the route cards. Bertie's brief asks for it on the active-route rows, so it is there. The network cards still have none.
- **Haul bands.** Short haul is up to 1,500 km, medium up to 4,000 km, long beyond. These are code defaults read as `shortHaulMaxKm` and `mediumHaulMaxKm` if the Settings sheet gains them. In chapter 1 the medium-haul routes are Marrakech, Rome, Lisbon, Athens and Istanbul. Every other route is short haul, and none is long haul yet.
- **Fare insight.** The drawer's "could fill more seats at £X" line is new: the next fare down, when seats are empty and more people want to fly at it. It is not a PlanTips row yet. Fable may want to add it to the sheet (as `fare_lower_fills`, priority 3).
- **Launch Day.** With an empty plan the page opens on *Choose where to fly* (Change network without filters). *Go to the timetable* then leads to the plan.

## Regular operating patterns (§12): the design for the next pass

- **Save as pattern.** On an aircraft row, "Save this day as a pattern" names it (Pattern A — Short haul) from the aircraft's flights and departures.
- **Assign.** "Assign another aircraft to Pattern A" (same type, or any type that can fly every route in it within the day) copies the day and links the aircraft.
- **Edit once.** Changing a flight on a linked aircraft asks "Change Pattern A for all 2 aircraft, or just this one?". "Just this one" unlinks it.
- **Groups show it.** The fleet group row reads "Twin Otter · 3 aircraft · 2 following Pattern A, 1 own day".
- **Storage.** A plan gains `patterns:{A:{sched, deps}}` and each fleet entry an optional `pattern:'A'`. Everything that prices a plan still reads each aircraft's own `sched`/`deps`, so the engine and the hand sums do not change.

It needs a decision from Bertie: is a pattern a whole day only, or can an aircraft fly a pattern plus extra flights?

## Tests

- `GAME=airline-opening-studio-v2.html node src/opening/tests/week.test.js` plays chapter 1 to the chapter accounts on the revised Studio. It checks:
  - the launch flow on Choose where to fly;
  - the flight editor (later, the arrow key, a drag, a route change, Delete);
  - a fare in the route editor;
  - ƒ on profit and fuel in the summary, and on tickets in the drawer;
  - the opener, and a news review with Apply changes;
  - Keep plan held while the board waits;
  - on Launch Day, day 8 and day 22: Active routes against the engine, the route editor's fares against the Routes sheet, every block's figure and colour, the drawer (one or two PlanTips tips, six groups) and the flight editor on screen.

  The hand sums, the cap, the audits and the board review are checked exactly as for the main file.
- **Results.**

  | Run | Checks | Failures | Reaches |
  | --- | --- | --- | --- |
  | Revised Studio file | 183 | 0 | chapter accounts on 28 December |
  | Main file (with the three fixes) | 165 | 0 | chapter accounts on 28 December |
  | Revised Studio file, coasting pupil (`COAST=1`) | 182 | 0 | the board review on 4 Nov holds Keep plan until a fare changes |
  | `migrate.test.js` | 27 on each file | 0 | — |

- **Screenshots** (1680×940) in `docs/screenshots/v2studio/`:
  1. the opener;
  2. the operating plan;
  3. the route editor;
  4. the trade-offs drawer;
  5. the flight editor;
  6. Change network;
  7. Launch Day's Choose where to fly;
  8. the launch plan;
  9. fleet groups with four aircraft;
  10. a news review.

  The three fixes are in `docs/screenshots/v410/fix-*.png`.
