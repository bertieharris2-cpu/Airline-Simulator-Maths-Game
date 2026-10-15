# Flight times before the timetable, a clearer demand strip, and no "0 × £90" (16 Oct 2026)

*Claude Code, from Bertie's run-through on 16 October. The code is in `src/opening/parts/p4zv_flightplan.js`.*

## What happened, and what changed (for Bertie)

1. **"0 × £90".** The Saab's flights to Amsterdam and Frankfurt had been added while the timetable showed Sat–Sun, so they flew at weekends only. The week's sums are for a Monday-to-Friday day. That day Amsterdam had no passengers, and the game still asked for its ticket money.
   - The sums now leave out any route with no passengers on the plan's day.
   - An empty Mon–Fri lane now says "No flights Monday to Friday: its 2 flights fly on Saturdays and Sundays only", with a button to see Sat–Sun.
   - The Sat–Sun view now says "Flights added here fly on Saturdays and Sundays only".
2. **Flight times come before the timetable.** When an aircraft meets a route for the first time (a route opens, or a new aircraft joins), the plan opens on a Flight times page.
   - A table shows each aircraft against each new route.
   - The pupil works out the times marked with a box (two when there are two aircraft types, otherwise one) with distance ÷ speed, with D86's answer box and two tries. When there are two aircraft types, both sums are the same route: the slowest and the fastest aircraft, e.g. Dublin 450 km by Twin Otter (1.5 h) and by Saab (1 h). The model fills in the rest.
   - A line says what the difference means: "To Dublin that is 1 h against 1 h 30 min: 30 min less each way, 1 h on a return trip, so the faster aircraft fits more flights into a day."
   - Only then does the timetable open. The flight-time cards on the sums page are gone.
3. **Demand through the day.** The strip above the timetable is now a bar for each part of the day. The height is people an hour; the solid part must fly then, and the lighter part would take any time.
   - The busiest part of the day is gold, and the label says "Busiest: Early, 06:00–09:00".
   - The red and orange hatching has gone.

## How each rule is read (please check)

- **Which pairs are new.** An aircraft type and an open route it can reach, not met before. A save from before this counts whatever was open before its current day as met, so no long page appears on loading.
- **The sums.** Two when the fleet has two or more aircraft types (the slowest and the fastest on the same route), one when it has one type. They are whole or quarter hours where possible (e.g. 450 ÷ 300 = 1.5 h), within 0.05 h. They are recorded as Calculate steps, `ftp:<aircraft>|<route>`, and count towards the flight-time skill. They are not part of the weekly sign-off cap.
- **The demand strip** shows the selected route at its fare, or all routes at your fares.

## Tests

All runs on the built game, chapters 1 to 4 chained from new saves. No end cash changed: the sums are on paper and change nothing in the airline.

| Run | Checks | End cash |
| --- | --- | --- |
| `week.test.js` Steady · COAST | 244 · 247 ok, 0 fail | £697,112 · £689,806 |
| `chapter2.test.js` Value · Premium | 109 · 103 ok, 0 fail | £13,614,407 · £13,334,810 |
| `chapter3.test.js` Value · Premium | 66 · 76 ok, 0 fail | £26,453,508 · £20,022,536 |
| `chapter4.test.js` Value · Premium | 59 · 58 ok, 0 fail | £41,528,288 · £40,501,774 |
| `decide` · `fleetshop` · `migrate` · `record` · `milestones` | 35 · 35 · 31 · 17 · 27 ok | |

- **Steady pupil.** Flight-times pages on 16 September (Amsterdam and Frankfurt open; then the Saab joins) and 23 September (Madrid), five sums in all.
- **The week test.** It now checks the Flight times page and no flight-time cards among the sums. Weeks 1–4 have about 13 Calculate steps besides the flight times.
- **The other tests** fill in the page when it appears.
