# Report back: the Operating Plan Studio (Workbook v4.10, D66)

*From Claude Code to Fable, 13 October 2026. This answers §6 of "Data appendix for Claude Code — Operating Plan Studio" and follows Bertie's mock-ups. The game is `airline-opening-prototype.html`, built from `src/opening/`, with the new code in `src/opening/parts/p4zd_studio.js`. Screenshots are in `docs/screenshots/v410/`.*

The Monday plan page is now the Operating Plan Studio. All five confirmations hold, and the week test checks each one against the engine on Launch Day, day 8 and day 22.

Workbook v4.10 installed directly with 0 import errors. The importer now reads the PlanTips sheet and the four new settings.

## The five confirmations

**1. The card figures match the Routes sheet: confirmed.**
- Each card shows the route's fares with the people a day at each.
- The figures come from `Routes.fareOptions` and `Routes.demandAtFare`, through the engine's own demand (season, growth, news, the rival and neglect).

| Route | When | Fares | People a day | Against the sheet |
| --- | --- | --- | --- | --- |
| Paris | Launch Day | £70, £80, £90, £100, £110 | 60, 55, 50, 44, 30 | exactly the sheet's `70:60 · 80:55 · 90:50 · 100:44 · 110:30` |
| Dublin | Launch Day | as Paris | 80, 72, 62, 44, 30 | exactly the sheet's |
| Paris | week 4 | as above | 62, 57, 52, 46, 31 | the sheet's figures with the city-break growth of 2% a week from week 3 (×1.04) |

- Each card shows only:
  - city, code and distance;
  - flying time each way for the selected plane;
  - the fares as small bars, with the people at each;
  - the chosen fare, and Add to schedule.
- There is no seat fill on a card.
- When a route has more than six fares (Amsterdam has nine), the bars show the fare without "£" and the caption says "fares in £".

**2. A block's fill is seats filled / that plane's seats, in three colours: confirmed.**
- A flight block shows departure–return time, the route, a fill bar and, for example, "32/34". The tooltip is "2 empty seats".
- The colour follows `seatFillGood` 0.80 (green) and `seatFillMedium` 0.50 (amber); below that it is red.
- Seats are the plane's: 19, 34, 70, and later 80 and 100. The mock-ups' "75 / 83" figures, their speeds (430, 550) and their invented fares are not used.
- Flying times are the workbook's: Twin Otter 300 km/h, Saab and ATR 450, jets 900. The turnaround is the hatched gap after each block, and the last flight of the day has none.
- The test compares every block's figure and colour with the engine on day 8 and day 22. For example, day 8 reads 19/19, 19/19, 23/34 (amber) and 29/34 (green).

**3. The strip switches to the selected route's bands: confirmed (`demandStripMode`).**
- With nothing selected, the strip above the timetable is the sum across the open routes at their chosen fares.
- Pressing a card, or hovering over one, shows that route's five bands from Archetypes, scaled by its demand at its fare:
  - the time-locked share is drawn solid ("must fly then");
  - the flexible share is hatched ("any time").
- Each band is coloured low, medium or high, and shows its total.
- Pressing the card again returns to all routes.

**4. The panel shows the four figures and at most two tips from PlanTips: confirmed.**
- **Figures:** passengers / seats offered (with %), estimated ticket revenue, projected profit (one figure), and turned away.
- **Tips:** every PlanTips condition is checked on the plan on screen whenever it changes. The panel shows the two with the lowest priority number. These are the ones that fired in the test:

| When | Tips | Panel figures |
| --- | --- | --- |
| Launch Day | `peak_unserved` (the early Dublin peak), `turned_away` (43 a day) | 57 / 57 |
| Day 8 | `peak_unserved` (evening Dublin), `idle_plane` (the Twin Otter, 9 h 55 min) | 90 / 106 |
| Day 22 | `peak_unserved` (evening Amsterdam), `idle_plane` | 163 / 176 |

- On Launch Day the revenue and profit are still to be worked out by hand, so they show "ƒ work it out" instead of the figure.

**5. Step 4's three figures match the Sunday review's actual figures in shape: confirmed.**
- The Sunday review and the week/month reviews now have a **Seat fill** panel: seats filled / seats (%), empty seats, and turned away. These are the week's actuals in the same shape as step 4.
- The same tip conditions explain the week underneath. The route conditions (turned away, fare too high) use the week's own averages a day; the timing conditions use the plan as it flew.
- Week 2 read: 601 / 723 (83%), 122 empty, 243 turned away, with "This timetable leaves the evening Dublin peak unserved".

## The page

- **Steps bar** (`planStudioSteps`): Choose routes · Set fares · Place services · Review seat fill.
  - A step is ticked when done:
    1. a route is on the plan;
    2. a fare has been pressed or changed this week;
    3. every aircraft has a flight.
  - The first unfinished step is highlighted.
  - Pressing a step points at its part of the page. *How it works* opens four short lines over the page.
- **Route cards** sit in one row that scrolls sideways.
  - A filter shows all destinations, the routes flown, or the routes not flown yet.
  - Flying times are for the selected aircraft. Pressing an aircraft's name in the timetable changes it, and Add to schedule puts the flight on that aircraft.
- **Live panel:** compact, to the right of the cards. There is no finance panel on this screen.
- **Timetable:** the largest zone, one row per aircraft.
  - Each row has its own *+ Add flight…* menu.
  - Dragging a block, the arrow keys, and Earlier / Later / Swap route / Remove / Service costs all work as before.
  - *Table view* lists the same flights with fill.
  - *World report*, *Try different options* and *Network map* are in the timetable header.
- **On board** (snacks) is a menu in the timetable header. The fuel line, with the Fuel desk link, sits under the route cards.
- **Type:** body 400, labels 500, headings 600, key figures 600. Monospace only for money, codes, times and quantities.
- **The board review's hold** (from v4.9) still works here: the banner sits at the top of the page and *Cost your plan* waits for a change.

## How the tips were read

- **`range_fail`** fires when the pupil tries to add a route to an aircraft that cannot reach it. The tip stays until a flight is added successfully.
- **`fare_too_low`** compares with the fare at the start of this week's planning. It fires when the fare was cut although the higher fare still filled the seats offered.
- **`idle_plane`** counts all the unused time inside airport hours (06:00–22:00). Instead of "this afternoon" it names where the longest gap is (this morning, this afternoon or this evening), or "all day" for an aircraft with no flights.
- **`turned_away`** fires when demand at the fare exceeds the seats offered on the route by more than the largest plane flying it.
- **`peak_unserved`** fires for each band holding at least 25% of a route's time-locked demand that has no departure in it; the biggest such band is named.

## Not copied from the mock-ups

- The mock-ups show seat fill on route cards, "75 / 83" style figures, aircraft speeds of 430 and 550 km/h, made-up fares, a detailed finance strip and a "Change aircraft" button.
- None of these is in the Studio. Choosing an aircraft is done by pressing its name.

## Tests

- **`week.test.js`** checks on Launch Day, day 8 and day 22:
  - every card's figures against the engine;
  - every block's figure and colour;
  - the strip for a selected and a hovered route, and back to all routes;
  - the four figures and one or two PlanTips tips.

  It also checks the review's seat fill on each Sunday. The run through the whole chapter, to the chapter accounts on 28 December, passes 162 checks with no failures.
- **`migrate.test.js`** passes (27 checks).
