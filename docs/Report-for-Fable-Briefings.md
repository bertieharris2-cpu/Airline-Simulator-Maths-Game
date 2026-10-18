# Report for Fable: the eleven Operations briefings

*Claude Code, 18 October 2026. This answers your briefings plan (the page Bertie linked on 18 Oct). Bertie asked for all eleven now, so that his play notes can test them: he talks while he plays, and the game logs each screen beside his words. The screenshots are in `docs/screenshots/briefings/`.*

## What was built

Your plan had you building each scene as a page of its own first, with the game wiring it in afterwards. Bertie wanted them now, so all eleven were built in the game straight away.
- They share one kit, `src/opening/briefings/kit/`.
- Each scene is a page in `src/opening/briefings/`.
- **Any of them can be replaced by your own page.** Save it under the same file name, or point the Briefings sheet's `html` column at a new file, then rebuild. The game passes your page the same figures and waits for the same message at the end (see "The contract" below).

Every scene keeps to your Show → Predict → Reveal → Use:
- It moves on only when he does something: a tap, a drag or a press. The Continue button appears after that, never before.
- A guess is never marked wrong. The reveal shows his guess beside the answer.
- The figures are his own airline's at that moment: his painted plane, routes, fares, seats and cash.
- The frame has Pause & discuss (P), which stops the scene's clock while the class talks.
- With reduced motion, each step shows as a still frame.

| # | Briefing | Opens | Predict | Reveal | Lands on |
| --- | --- | --- | --- | --- | --- |
| 1 | What a fare does | Launch Day, as the fare sums open (before the first is answered) | which fare brings in the most ticket money | he drags the fare up along his own figures: people leave the queue, the tags of those who stay grow, and the money stack rises, then falls. "Ticket money = passengers × fare. Both move." | the fare sums |
| 2 | Customers have a choice | Red Kite's card on day 4, before he chooses; only when his fare is above Red Kite's | how many walk to Red Kite's £50 gate (a marker along his queue) | one in ten for every £10 dearer walk across; his posters go up and half turn back | the Red Kite card |
| 3 | More demand than seats | the week-1 review, if anyone was turned away | (he taps the crowd left in the lounge after the last plane, on his busiest day) | the crowd counts itself: "15 people with no seat: £1,200 of tickets you couldn't sell" | the review |
| 4 | Weekdays and weekends | the week-2 review, after the accounts | the days that look different | business travellers on weekdays, families and holidaymakers at the weekend, past the seats line; his timetable the same every day | the Operations Request (weekday and weekend timetables) |
| 5 | Cash, tank, profit | the first Fuel desk visit (days 8–14) | what buying fuel does to today's profit | he presses Buy: coins flow into the tank and profit doesn't move; then the week burns the fuel day by day | the Fuel desk |
| 6 | Two planes, one route | the first aircraft comparison | which plane used less fuel for each passenger | litres shared across the seats; then the bigger plane flies half empty and its litres a passenger leap | the comparison |
| 7 | How long will it take? | the first Flight times page | (he flies his plane along a ruler, an hour at a time, then a quarter of an hour at a time) | it lands; he taps the letter to find in the D/S/T triangle | the flight-time sums |
| 8 | One big Saturday | the plan page while an event is announced (the All Blacks from day 22) | the days that changed | the event card drops on the match weekend; supporters flood those days; his flights don't move | the Operations Request (one date) |
| 9 | A year of demand | the chapter-1 review (28 December) | drag a plane to the month he'd send it to Geneva | Geneva's winter and Barcelona's summer, a month at a time; his plan the same all year | the Operations Request (seasonal plans) |
| 10 | Renting a plane | the shop, once a plane can be rented (6 January 2031) | drag the days until the rent stack matches the price | £12m ÷ £6,000 = 2,000 days of rent, about 5.5 years | the shop |
| 11 | Profit is not cash | the Finance desk in chapter 3, once a plane was bought in the last 30 days or a month ended overdrawn | (he taps the day cash fell) | the purchase names itself; profit kept climbing. "Profit: did we earn? Cash: can we pay?" | the Finance desk |

## The contract, if you build a page

- **A whole HTML page.** The game opens it in a frame over the screen.
- **What the page is given.** Before its scripts run, the game sets `window.BRIEF`:
  - `{ id, airline, test, rm }`, plus the scene's figures (next section);
  - `test` is true in the teacher's test mode, which is when to show a Skip button;
  - `rm` is true for reduced motion.
- **What the page sends back.** At the end it posts `{ type:'briefing-done', id, … }` to `window.parent`. The game closes the frame, marks the briefing as seen and carries on.
  - For the three Operations Requests, include `chosen` (the option's index in the Upgrades sheet) and `right` (true for the option that fits).
  - Scene 4 grants the upgrade when `right` is true.
- **Fallbacks.** Give `BRIEF` fallback figures (the kit's pages use `Object.assign({ …fallbacks }, K.B)`), so the page still plays when opened on its own from the folder.
- **The kit is optional.** To use it, put these two tags in the page's head:
  ```html
  <link rel="stylesheet" href="kit/brief-kit.css" data-kit>
  <script src="kit/brief-kit.js" data-kit></script>
  ```
  - The game swaps the two tags for the kit itself, so the page works the same from the folder and in the game.
  - **Frame and steps:** `K.start`, `mark`, `caption`, `question`, `cont`, `done`.
  - **Timing:** `wait`, `tween`, `every`. These run on a scene clock that Pause stops.
  - **Interactions:** `chips` and `rail`.
  - **Scene pieces**, on a 1600 × 900 SVG: `terminal`, `apron`, `gate`, `plane`, `person`, `walk`, `priceTag`, `stack`, `tank`, `vault`, `coins`, `board`.
- **Closing.** Esc never closes a briefing for the pupil. The teacher can close one with Ctrl+Shift+B, or with Skip in test mode. Either way it counts as seen and does not come back.

## The figures each scene receives

| id (file) | `BRIEF` fields from his airline | sends back |
| --- | --- | --- |
| `fare_lever` (briefing-fare.html) | `route {id, city, code, flag}`, `gate`, `times`, `seats`, `flights`, `planeSeats`, `fares [{f, want, pax}]` (pax: his plan's passengers at each of the route's fares, the figures the sums use), `start`, `sums` (the fares the sums ask about), `art` (his painted plane) | `guess`, `best` |
| `rival_split` (briefing-rival.html) | `route`, `fare`, `rival`, `want`, `stay`, `stayAd` (who stays if he advertises), `rivalName`, `adCost`, `art` | `guess`, `walked` |
| `full_route` (briefing-capacity.html) | `route`, `day` (his busiest: the most turned away), `fare`, `want`, `flights [{t, seats, sold}]`, `art` | `left` |
| `weekend_demand` (briefing-weekend.html) | `route`, `want[7]`, `seats[7]`, `flights [{t, n}]`, `biz`, `lei`, `fam` (each `[7]`), `options` | `chosen`, `right` |
| `fuel_cash_tank_profit` (briefing-fuel.html) | `cash`, `price`, `blk`, `tank`, `perDay`, `days`, `weekNeed`, `day {tickets, other}`, `flight {dep, plane, to, litres, pax, fare, costs}` | `guess` |
| `aircraft_efficiency` (briefing-efficiency.html) | `route`, `a` and `b`: `{name, seats, litres, art}` (his plane and the next bigger one that can fly the route; litres for the round trip) | `pick`, `best` |
| `flight_time` (briefing-time.html) | `route {id, city, km}`, `plane {name, speed}`, `art` | `pick` |
| `event_weekend` (briefing-event.html) | `route`, `title`, `when`, `want[7]` (last week's), `mult[7]`, `seats[7]` (0 where he doesn't fly the route), `flights [{t}]`, `options` | `chosen`, `right` |
| `seasons` (briefing-seasons.html) | `months[12]`, `year0`, `places [{city, base, mult[12]}]` (from the Market weeks), `marks [{m, label}]`, `seats`, `options` | `month`, `chosen`, `right` |
| `lease_money` (briefing-lease.html) | `plane`, `price`, `rent`, `cash`, `art` | `guess`, `days` |
| `profit_vs_cash` (briefing-cash.html) | `month`, `days [{d, profit, cash, ev:{kind, label, amount}}]` (the last 30 days, both lines from zero), `bought`, `overdrawn` | — |

## Where it differs from your plan, and what we need from you

1. **`flight_time` has no row in the Briefings sheet.** The game gives it its title and file for now. Please add a row: id `flight_time`, trigger "the first Flight times page", leads into "the first flight-time sum".
2. **The day_override and seasonal_plans upgrades are not built.**
   - When he makes the request in scene 8 or scene 9, his choice is kept in the save. The caption says the systems team will build it.
   - The Upgrades sheet's fallbacks ("the Monday after", "6 Jan") are not used.
   - **Question:** what should a right answer give him until the planner can change one date, or switch plans with the season? For scene 8 the caption tells him to plan the match week on a plan of its own.
3. **One big Saturday covers the weekend.** The All Blacks event doubles both Saturday and Sunday (days 34 and 35 in the data). So the scene shows both days, and its caption reads "An event changes one weekend, not every weekend".
   - **Question:** should the event be one day? That would be a data change, which Bertie has paused.
4. **A year of demand** is a board of twelve months.
   - A cursor walks along the board and each month's two bars grow in turn: Geneva and Barcelona, from the Market weeks' season figures and his own base demand.
   - It is closer to a chart than your "months roll past", but it keeps the drag (a plane onto the month he'd choose) and the plan line, "the same all year".
5. **Profit is not cash** opens on the first visit to the Finance desk in chapter 3, after a purchase in the last 30 days or a month that ended overdrawn. The sheet says "the first overdrawn month or the 787 purchase", so any purchase counts, not only the 787.
6. **Scenes 4 and 5 were rebuilt on the kit**, from your plan's new descriptions. Your two delivered pieces are in the repository's history (commit `e510f6a`, "Fable's two Operations Briefings as delivered") if you want them back.
7. **Scene 1 is the one Bertie asked for** in his play notes: "the higher the ticket the lower the demand … one lost seat is sometimes OK if they're paying more". It opens before the Launch Day fare sums, and the money stack rises, then falls, as he drags the fare up.
8. **Requests that don't fit (scenes 4, 8 and 9)** are answered in one sentence. He can then choose again or keep his choice. A kept wrong answer in scene 4 goes to the systems team's proposal on day 21, as before.
9. **When there are no figures, a briefing doesn't open:**
   - scene 3 if nobody was turned away;
   - scene 2 if his fare is not above Red Kite's;
   - scene 11 until there is a purchase or an overdrawn month.

   Scene 8 opens even if he doesn't fly the route yet. It then shows "no flights" under each day.

## For Bertie's play notes

The screen-name tag in the corner now names the briefing ("Briefing: What a fare does"), so the log shows which scene each remark was about. While the tag shows, the briefing's frame moves to the right of it, so the tag never covers the caption.

## Tests

`node src/opening/tests/briefings.test.js` runs in four parts:
1. It plays every page on its own, checking the frame, that Continue never shows before he acts, Pause & discuss, and reduced motion (for scenes 1 and 3).
2. It opens each briefing in the game at its moment, from the toolkit's Jump to saves, and checks his figures and that it never opens twice.
3. It plays scene 6 to the end out of test mode.
4. It checks the Briefings button on Home.

`BRIEFINGS=1 node week.test.js` plays scenes 4 and 5 through (with `WRONG_CARD=1`: a request that doesn't fit, then "Keep this choice") and skips the others.

## Addendum: Bertie's test of the briefings (18 October, 13:50)

*Bertie played Launch Day with the briefings on and talked as he went. Transcript and screenshots: `docs/screenshots/playnotes-1350/`. Nothing has been changed in the game yet. The items are parked in `docs/Next-Batch-Parked.md` (section A) and wait on your answers below.*

**His rule for all of them:** "check whether the briefings come before the first instance of working that out." On Launch Day the pupil now meets, in this order:
1. the Studio, where a fare change or an extra flight asks "what is it worth a day?";
2. the fare sums, where What a fare does opens first;
3. the fuel order, for the rest of the week (3 × £1,300), with its worked example;
4. the profit;
5. two cabin-sales Build sums (snacks at £3, half buy; at £5, 3 in 10 buy; stock £1 an item).

Only the fare sums have a briefing in front of them.

**What he said, and what we ask you:**

1. **What a fare does comes too late.** "I feel like this needs to come before the previous screen", meaning the Studio. He also wanted the point to reach the Studio's sum: "what does the extra Paris flight add in tickets a day, if they're paying £10 extra".
   - **We propose:** open it after the Launch Day intro, before the Studio. Make its Use step the Studio's worth line: "£10 more a ticket × 38 passengers = £380 more a day, if no one is lost".
   - **Do you agree with the place and with that ending?**
2. **What a fare does is confusing.** "So is it doing 72 times 80? … I really like the creativity of this, but I'm a little bit confused. This needs to show that if you charge more there's less passengers. However you only have a max capacity if you've only got a 19-seater plane … If I put on four Dublin flights I might be able to get more money."
   - At £80, 72 people queue and the money is 38 × £80. Nothing says that only 38 have seats: the second row of the queue looks like the first. Screenshot `02-fare-briefing.png`.
   - **Proposal:**
     - label the two groups ("38 have seats", "34 can't get one");
     - write the stack as "38 × £80, not 72 × £80";
     - draw the seats as his two plane-loads (2 × 19), so that more flights visibly means more seats.
   - **Would you rather redesign the scene, or give us the changes?**
3. **There is no fuel briefing before the fuel order.** "I still haven't had the fuel briefing, so I think we need to check the order of all of this." Cash, tank, profit opens at the first Fuel desk visit (day 8), but Launch Day already asks for the fuel order.
   - **Do we move that scene to Launch Day, or add a short one there?** The short one would be "fuel comes by the 1,000 L: blocks × the price of a block", keeping the tank scene for day 8.
4. **There is no cabin sales briefing.** "Also the cabin sales, we've not had a briefing." This would be a twelfth scene.
   - **A sketch, for you to change:**
     - **Show:** the day's passengers board; a trolley goes down the aisle.
     - **Predict:** at £3 or at £5, which brings in more?
     - **Reveal:** half buy at £3, 3 in 10 at £5. Buyers × price, then less £1 stock on each item sold.
     - **Use:** the two cabin-sales sums and the snack choice.
   - **We need** a Briefings sheet row and your version of the scene.
5. **A sum that doesn't add up**, which the cabin sales scene must not copy. The cabin-sales Build showed "Passengers flying 27, Passengers buying snacks 31". The 27 is Dublin alone (at £110); the 31 is half of the day's 64 passengers, halved flight by flight, which rounds down to 31 rather than 32. Both get fixed on our side (`Next-Batch-Parked.md`, B1 and B2). The scene should count buyers the same way the sums will.

Once your answers are in, a test will check that every kind of sum has its briefing before the first time it is asked.
