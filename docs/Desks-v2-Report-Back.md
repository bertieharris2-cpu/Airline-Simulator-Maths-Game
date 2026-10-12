# Report back: The desks v2 and Workbook v4.6

*From Claude Code to Fable, 12 October 2026. This answers "Design Note for Claude Code — The desks, v2" §10 and lists what was built, what differs from the note and why, and what needs a decision. The game is `airline-opening-prototype.html`, built from `src/opening/`. Screenshots are in `docs/screenshots/v46/`.*

## Bertie's reference screens

On the same day Bertie sent a recreation brief with three reference screens: *Operations Model*, *Fuel Procurement* and *Service Cost Breakdown*. They share one dark shell:
- a 94 px header (logo and wordmark, an aircraft over a world map, the week and date, reputation stars, gold coins and cash);
- a 220 px left nav (Home, Operating Plan, Network, Fleet, Fuel, Finance, Reputation, Reports) with an airliner at dusk at its foot.

He asked for them **in the game, with its own figures** (Twin Otter, Paris and Dublin, £1.47, the pupil's date and cash), with **drawn stand-ins** for the photographs. These screens are the visual form of your three levels:

| Your note | Bertie's screen | In the game |
| --- | --- | --- |
| Aircraft performance card and workbench (level A) | Service Cost Breakdown | Opens from a fuel sign-off, ƒ on Fuel cost, and a service's *Service costs* button |
| Analytics console (level B) | Operations Model | From day 8: the planner's *Try different options* |
| Fuel procurement desk (level C) | Fuel Procurement | From day 8: a Monday step after the sums, and the Fuel nav row |

The whole game now sits on a 1,680 × 940 canvas, scaled to fit the window. Layout is identical at 1366 × 768 and 1915 × 891.

## §10, point by point

**1. The three levels are visually distinct: yes, though not by colour.**
- Each level has its own layout:
  - Level A is a technical data sheet: a route banner with seven stat cells, three numbered panels, typed boxes, and Checked/Query stamps.
  - Level B is an analyst console: two plan tables side by side (blue current, green test), a results table, What changed, a profit comparison, and saved tests.
  - Level C is a commodity terminal: the price chart with the forecast band, news cards, the tank, block buying, and the scenario table.
- **Difference from the note:** the workbench is dark, not pale squared paper. Bertie's Service Cost Breakdown screen shows it dark, in the same style as the other two, and his brief was explicit.
  - The level-A distinction carries through instead: cyan-outlined entry boxes, coloured partition blocks (blue, violet, turquoise), stamps, and a glowing edge on the panel being signed off.
  - If you want the pale workbench back for level A, it is one stylesheet block.

**2. Week 1 has no fuel desk: confirmed.**
- Days 1–7 buy exactly the litres burned, at each day's Calendar price, and days 1–2 are free (`fuelWeek1`).
- The planner's fuel line is one sentence: "Fuel is bought as it is used, at each day's price (free Mon–Tue)."
- The Fuel nav row is locked ("Opens in week 2"). The desk appears on day 8 with "Fuel desk online", and the console with your sentence: "Analytics online · You have enough operating data to test decisions before you make them."
- `week.test.js` checks all of this.

**3. The performance card's fuel figure is litres × price from the workbook: confirmed.**
- Twin Otter LHR–CDG–LHR in week 2 is 120 L × £1.47 = **£176.40**. Airport charges are £220 (LHR £120 + CDG £100), passengers £5 each, and flying 2 h × £150.
- Launch Day asks Paris 120 L × £1.30 = £156.00 and Dublin 180 L × £1.30 = £234.00, both at Wednesday's price.
- Day 8 asks the Saab on Dublin, because it is the first time a Saab flies that route.
  - **This needs a decision:** `fuelForTrip` rounds a trip to the nearest 10 L, so the Saab's 900 km × 25 L per 100 km = 225 L shows as **230 L × £1.47 = £338.10**.
  - Should a trip's litres be exact (225 L, £330.75), or stay rounded to 10 L?
- The `fuelHandSum` rule is as you wrote it: a sign-off the first time a plane type flies a route, and again when the price has moved 50p or more (`fuelHandSumPriceStep`).
  - **One addition:** when several cards qualify on one day for a price move, only the busiest is asked, and the model fills the rest. First-time cards are always asked.
  - In the 60-day run this asked Twin Otter Paris again on day 29 (£1.30 → £1.86) and ATR Madrid on day 43.
- The day's fuel bill and the 1,000 × £1.30 worked example are gone.

**4. The scenario table uses the forecast band: confirmed.**
- Rows: forecastLow, today's price, mid-forecast, forecastHigh, and an optional row the pupil adds (*Adjust assumptions*).
- Columns follow Bertie's screen: *If you wait*, *If you buy now*, *Fuel purchasing advantage*.
- Day 8 for 3,000 L reads: low £1.60 +£390 saved; today £0.00; mid £1.68 +£630; high £1.76 +£870.
- The word "profit" is never used.
- The week review's line uses `fuelAdvantageWording`. **This needs a decision:** the advantage is measured against buying each litre on the day it was used, so the line reads "+£X saved compared with buying later (on the day each litre was used)". If you meant "compared with buying next week" literally, tell me which price to compare against.
- *Exposed* appears from week 2.
- The first purchase is a sign-off ("1,000 L × £1.47 = …", then "3 × £1,470 = …"), stamped Query or Checked before *Confirm purchase* opens. Later purchases are model.
- Emergency fuel at +10p is bought automatically when the tank runs short, and the review says how many litres it cost.
- The tank is 8,000 L, and 20,000 L from day 29, announced as a storage upgrade. The test checks `tankCapacity()` on day 29.

**5. The console's Build step precedes modelling: confirmed.**
- The first visit shows Revenue = ? ? ? and Profit = ? ? ?, with pieces (Passengers, Fare, Seats, Costs, Revenue) and operators (× + − ÷).
- A wrong formula shows an error in the cell: "#ERROR: Passengers + Fare is not the money passengers pay…".
- The built formulas are kept in `S.analyst`, written into the hand-sum log as Build, and shown under *ƒ formulas*.
- Only then does the console project the week.
- Figures come from the engine through `planLines`, summed over the seven days of the week with that week's fuel price.
- Tests can be saved (up to three) and sent to Operations with *Use test plan*.
- **Difference from the note:** the pupil builds the formula by pressing the cells and operators, not by typing "=". It is the same Build stage, on a touch screen.

**6. The workbench offers methods from WorkingMethods: for the fuel line, yes; for the other sign-offs, not yet.**
- The fuel card's method tabs come from the WorkingMethods row for litres × price: partition the price, scale it (from 100 L), make it pence, decimals (count the decimal places), and formal multiplication on the column template.
- Each tab lays out its own frame. Partition shows £1.47 = £1 + 40p + 7p as three coloured blocks and three typed lines; scale shows 100 L, then 200 L, then the remainder.
- The other sign-offs (tickets, profit, the week's accounts, rent-or-buy, the tenths) are now listed as **sign-off documents**, each Awaiting check, Checked or Query: *Sales forecast — Paris*, *Service costs — Twin Otter LHR–CDG*, *Profit statement*, *Cabin sales*.
  - They still use the existing dock: structured working on the column template, squared paper, or formula.
  - The relationship-specific tools in your table are **not built yet**: partition tens and ones for tickets, draggable revenue and cost blocks, the seven-day strip, the filled-aircraft graphic for load factor, and the tenths bar as a workbench frame. That is the next piece of work.

## Other points from the note

- **HQ structure (§2).** Bertie's nav replaces the desk bar.
  - *Analytics* is the Operations Model, reached from the planner. While it is open, the Operating Plan row reads *Operations Model · Compare Plans*.
  - Reputation and Reports are desks of their own: stars and reviews; a weekly table with load factor, profit bars and the fuel purchasing advantage.
- **"Clicking a plane or a service opens its performance card".** A selected service block shows *Service costs*, which opens the card with the model's figures, and its tabs can be practised without recording anything. Clicking the aircraft label and opening from the Fleet desk are not wired yet.
- **Motion (§8.5).** The stamps are static and the tank redraws filled when fuel is bought. The pour and the stamp landing are not animated yet.
- **World report (`worldReport`: "Monday plan page").** It is a *World report* button on the plan page from day 8, which opens a desk with:
  - the fuel chart and band;
  - Red Kite's fares against yours, with the people who want to fly at your fare;
  - a demand graph by fare for any open route;
  - the week's headlines;
  - the RouteNews announced for the next two weeks.

  Bertie's planner has no room for it inline, so it is a press away rather than on the page.
- **RouteNews.** Multipliers apply by route and segment between their dates; the engine test checks Dublin ×2 on 5–6 October.
  - Surprises (the items with `announced` false: the Barcelona hotel bug, the Irish ferry strike and the Iceland tremors) are named in the weekly review beside the fuel advantage.
  - The world engine takes them through its existing `mult` input.
- **Network.** It now lists every open destination: distance, your fare, Red Kite's fare, people at your fare, and whether you fly it.
- **The weeks from day 29.** They follow your cadence ("week-skips from day 29"), but each week is now planned on the same desks: planner, sign-offs, fuel desk, *Try different options*, then the run. The months from 2 December do the same.
  - The tank carries on through *Approve your regular plan*. The old cost, test and fuel-plan screens are skipped in week mode.
  - The forecast on a week beat projects all seven days, not one.

## Workbook v4.6: data

- **v4.6 does not carry what Change Request 5 added**: the Livery sheet, the Aircraft `artworkId` and `photoFile/Credit/Licence/Source` columns, and the Settings rows `blockedFlightCodes`, `soundDefault` and `revealSeconds`.
  - The importer fails without Livery. A new script, `tools/merge_workbook.py <new.xlsx>`, copies those parts from the installed workbook into yours and prints what it carried.
  - Please keep those parts in your copy, or keep sending through the script.
- The importer reads the Market columns `forecastLow`, `forecastHigh`, `fuelHeadline`, `forecastConfidence` and `fuelHeadline2`, plus the WorkingMethods and RouteNews sheets.
- It checks that each week's price lies inside the previous week's band, and every week passes.
- The import report shows 0 errors (`data/Import-Report.md`).
- Week 1's Market `fuel` is £1.20, while the Calendar has £1.30 from day 3. The Calendar wins for days 1–28, as before.

## Still to do (known)

- The relationship-specific workbench frames for tickets, profit, the week, load factor and the tenths (point 6).
- Opening the performance card from the aircraft label and the Fleet desk.
- The fuel pour and stamp animations.
- **Tests.** `opening.test.js` (the teacher's day-at-a-time flow) has been stale since the v4.4 planner: it still waits for the removed market screen. It fails at the same place on the commit before this work, so it is not a regression.
  - `week.test.js` passes to day 60 at 1680 × 940 (`UPTO=100` reaches the chapter's last day, 28 December, through the months with no errors), and to day 16 at 1366 × 768.
  - `engine.test.js`, `balance.test.js` and `migrate.test.js` pass.
- Some internal panels on the old day-4/6 tenths pages and the day-15/22 sums pages scroll inside their frame.
- With three aircraft, the plan page scrolls by about 80 px inside its frame. With many routes open, each aircraft's *+ route* buttons now show only the routes it flies, plus one *Add a route…* menu.
- Nothing overflows the canvas.
