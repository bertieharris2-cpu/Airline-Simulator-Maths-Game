# Chapter 3, push 1: notes for Fable (14 Oct 2026)

Push 1 builds chapter 3, "Owning", from Workbook v5.4 and your note (D81). The game now plays from chapter 2's end card into Monday 1 September 2031 and on to the chapter 3 review on 31 August 2032.

Code: `src/opening/parts/p4zo_ch3money.js` (the money rules), `p4zg_chapter2.js` (now builds every chapter's beats), `tools/import_world.py` (EventOptions, legs, rewardShare). Screenshots: `docs/screenshots/chapter3/push1-*`.

## Bertie's decisions (14 Oct)
- **Two pushes.**
  - Push 1 plays the whole year.
  - Push 2 adds Sydney's two-leg rotation; storm2, ash_cloud2 and the landing-fee card's return; challenges 3–4; hunts h3–h4; and percentage change on the monthly report.
- **EventOptions** replace the prose for chapters 2 and 3. Chapter 1 keeps its tested events until you confirm the differences (below).
- **Challenges 1 and 2** keep their rewards (10% off fuel, +½★). `rewardShare` is used from challenge 3.

## What push 1 does

| Area | In the game |
| --- | --- |
| Dates | Chapter 2's end card: "On to chapter 3". Mon 1 Sep 2031 (day 365) is chapter 3's first day: no day flies by itself. Days 365–371 are played one at a time, then months from Mon 8 Sep (8–30 Sep, then 1 Oct, …, 1–30 Aug). The review is on 31 Aug 2032 (day 730). |
| Day 365 | HQ, What's new ("Buying big planes, and the overdraft"), the overdraft offer (two EventOptions rows), the time to afford in weeks (Calculate), the air show, then the plan. |
| Overdraft | Before 1 Sep: the £1,000 reserve. From 1 Sep: −limit if accepted, £0 while declined. The limit is one week's average profit (the last 28 days ÷ 4, to £100), refreshed at each beat. Purchases, rentals and fuel orders beyond it are blocked; the plan keeps flying (no free bank top-ups now). The statement (Finance desk) and the header say "Overdrawn £X of £Y". Two month-ends overdrawn make that month's audit a board review. Declined: "Accept the overdraft" on the Finance desk. |
| Buying a rented plane | The Fleet desk: "Buy it: £12,000,000" on a rented plane once its `buyFrom` has passed. A confirm page shows the price, the rent, the rent-or-buy days and the cash after. When cash goes below zero, the cash after is a negative-cash sum (NCP-3-03) before Buy is allowed. The terms become `buy`, so the rent stops that day. |
| Handing a lease back | The Fleet desk: "Hand back on 30 Sep" (the end of the current month); "Keep it" undoes it. The plane flies and pays rent to the month's last day, and leaves the fleet and the timetable at the next beat. No charge. Owned planes have no button. |
| Time to afford | (price − cash) ÷ profit a week, with the figures to the nearest £1,000. Step 1 is the subtraction with millions, step 2 the division, rounded up. Calculate on day 365 (its own page, for the cheapest plane he can't afford yet), Build after (on the Buy-or-rent page for a plane he can't afford). "Save for it" counts down in weeks. |
| Missed h1 | h1's consequence now reads £2,000. From day 365 the header and the statement show cash £2,000 high. The first month-end audit (30 September, read at the start of October) corrects it and says why. |
| Prices | Data-driven: the 757 £3m and the 787 £12m (D78), and the A340, 777 and A350 in the shop from day 365. Rent-or-buy at jet prices is the shop's existing sum (now 2,000 days), recorded under "rent-or-buy at jet prices". |
| Routes | Tokyo and Cape Town from day 365, Singapore from day 421 (`unlockDay`); all overnight (the existing 2-day rotation). Sydney stays shut until push 2. |
| The review | The year-2 accounts month by month (Sep–Aug) with total revenue, total costs, profit, projected − actual and the average month, all Build. "What comes next": the A380 offer (from the `a380_offer` row: £18m down, then £808,000 a week for a year), the next investment in weeks, and chapter 4 on Mon 6 Sep 2032 (not built yet). |
| Airline types | The light profiles are permanent (D77): the type page no longer promises full profiles. |
| Overnight routes on the plan | A planning day now shows an overnight rotation on its way out: the service's passengers, fares and costs, and its Service Cost Breakdown. Before, a plan day that fell on the way home showed the service with nobody on it and £0 of tickets (chapter 2's Delhi had the same flaw, but no test pupil flew it). The block still says "earns every second day", and the simulated days alternate out and home. The plan's "profit a day" therefore counts the rotation's service as if it flew every day (question 20). |
| Held for push 2 | Sydney stays shut. storm2 (7 Oct), fuel_shock2, oil_glut and heatwave appear as headlines. Challenges 3 and 4 are not offered yet, and hunts h3 and h4 are not played. The landing-fee deal's card does not return on 1 Sep yet. |
| Second crew | `secondCrewCost` is live, so a short- or medium-haul day over 12 hours costs £250 (was £300 from the engine's default), from chapter 2's crew date. |

## EventOptions, parsed in place of the prose
- The importer reads EventOptions into `eventOptions[eventId]`: label, sub-line, cash (a cost, positive), costShare, stars, other effect.
  - It checks that each event exists, that options run 1..n, and cash versus costShare by day 29.
  - ash_cloud2 is noted: it has rows but no Events row.
- **Chapter 2's five events now take their label, sub-line, costShare and stars from the rows.** The mechanics stay in the code by option number:
  - charged once, daily or weekly;
  - a weekly charge until 31 Aug;
  - ground the morning or the day;
  - lift the closure;
  - the late rule;
  - Luton left out.
- **The overdraft offer** is built from its two rows alone.
- **Chapter 1** keeps its Events rows. The differences are listed below.

## Test runs

`chapter3.test.js` runs from a chapter 2 end save to the chapter 3 review, with different choices by `TYPE`.

| Run | What the pupil does | Checks | Cash on 31 Aug 2032 |
| --- | --- | --- | --- |
| Value | Accepts the overdraft (limit £353,900). Signs the 777's weeks to wait: (£24,000,000 − £13,592,000) ÷ £354,000 = 29.4, so 30 weeks. Buys the rented 757 on day 365 for £3,000,000; at a forced cash level the negative-cash sum is £2,823,050 − £3,000,000 = −£176,950. Keeps New York on the 757. | 60, 0 failures | £28,212,563 |
| Premium | Declines the overdraft. Signs the 777's weeks (32). Rents a 787 on day 365 (rent-or-buy 12,000,000 ÷ 6,000 = 2,000 days, Calculate) and flies Tokyo (out 06:30, lands 02:10 next day Tokyo time). Hands the 757 back at the end of September. The missed-h1 £2,000 is corrected at the October audit. Buys the rented 787 on 1 October for £12,000,000. Signs the A350's weeks as a Build (22) and saves for it. | 70, 0 failures | £19,821,669 |

**The report-back items, as checked:**
- **The overdraft block at the limit:**
  - the A350 cannot be bought;
  - the fuel desk offers 0 blocks half a block above −limit and 2 blocks at two and a half;
  - the statement and the header say "Overdrawn £176,950 of £353,900";
  - two overdrawn month-ends (30 Sep and 31 Oct) make the October audit a board review, and one is not enough.
- **A rented plane bought with the rent stopped.** Value's 757 on day 365, and Premium's 787 on 1 October: terms `buy` (was a lease), £0 rent a day from that day, and cash down by the list price. Our test pupils rent a 757 from January, not a 787. Premium rents its 787 on day 365, so its purchase comes on the first day it can be bought after that.
- **A lease handed back at a month end.** Premium's 757 flies and pays rent to 30 September, then leaves the fleet and the timetable on 1 October with no charge.
- **EventOptions parsed in place of the prose.** All five chapter 2 events show the rows' labels (`chapter2.test.js` checks each label against the sheet), and the overdraft offer is built from its two rows.

**Board reviews.** The test pupils keep one plan, so the board asks for a change most months (Value 8 times, Premium 10); the test changes one fare.

**Other tests**, all 0 failures:

| Test | Checks | Result |
| --- | --- | --- |
| `chapter2.test.js` Value | 106 | £13,591,851, unchanged |
| `chapter2.test.js` Premium | 100 | £13,312,048, unchanged |
| Chapter 1 (`week.test.js`) | 199 | £697,112, unchanged |
| The coasting pupil | 202 | £689,806, unchanged |
| The fleet shop | 35 | |
| The pupil record | 16 | |
| Migrate | 27 | One check now reads "Sydney is off the timetable": Sydney is a route in v5.4, so an old full-game save keeps its fare. |

## Questions for Fable
1. **Change Note v5.3 §5 and Balance Report v5.3** were not attached, and neither is in the workbook (only README row 28's summary). I reported against your note's list. Could you send them?
2. **31 August 2032 is a Tuesday**, not a Sunday. I kept the review on Tue 31 Aug (the workbook's date), so August's month is 1–30 Aug. Chapter 4 opens on Mon 6 Sep 2032, which leaves 1–5 Sep uncovered.
3. **Singapore and Sydney's dates.** Singapore's `unlockDay` is 421 (Mon 27 Oct), but its story and `sin_launch` say 20 Oct. Sydney's is 554 (8 Mar), but its story and `syd_launch` say 22 Mar. I used `unlockDay`.
4. **Dates one day out.**
   - `buyFromDate` is still 2031-09-02 and `financeFromDate` 2032-09-07.
   - The A220, A320 and 737 have `buyFrom` 2031-09-02.
   - The A340, 777 and A350 have `leaseFrom` 2031-09-02 (a day after their `buyFrom`).
   - The game follows each Finance row, so on day 365 the three new jets can be bought but not rented.
5. **Leases.** `leaseRule` says ÷ 2,000 "from the A220 up", but the A220, A320 and 737 are still ÷ 1,000 (£300, £400, £400 a day).
6. **Fuel.** The Calendar has £2.24 for days 365–371; Market week 53 has £2.20 (£2.24 is week 54's). The game uses the Calendar on those days.
7. **`chapter3SetUpDays` is 5**, but the Calendar has 7 rows (365–371). I played all 7, as your note says.
8. **The overdraft offer** is dated Tue 2 Sep on Events and Mon 1 Sep on the Calendar. I used the Calendar. A declined offer leaves no overdraft (spending blocked at £0) until he accepts on the Finance desk.
9. **The overdraft limit when the profit falls.** It is recalculated at each beat from the last four weeks. If he is overdrawn beyond a new, lower limit, the plan still flies; nothing new can be bought.
10. **Hunt h3** assumes the 787 is still rented in June 2032. A pupil who buys it on day 365 has no June rent. What should h3 show then? (Push 2.)
11. **Hunt h4's example doesn't add up:** 08:00 + 10 h 40 = 18:40 London = 03:40 Tokyo; nine hours added twice gives 12:40, not 05:00. (Push 2 uses the game's own departure and flight time.)
12. **Challenge 5** is still placeholder, and asks 68 × 54 while its story says 52 weeks.
13. **ash_cloud2** has EventOptions rows and a RouteNews item, but no Events row (title, text). Push 2 will build it from the news.
14. **price_war** is listed as headline-only, but its Events row still describes an advertising option.
15. **Two-leg crew:** does "the £500 crew charge applies per leg" mean 2 or 4 charges per rotation? (Push 2.)
16. **Chapter 1's EventOptions rows differ from its Events rows.** Chapter 1 is kept as built until you confirm:
    - the rival undercut gains a 4th choice, "Fly Paris instead", and Advertise is −½★ on EventOptions but +½★ on Events ("Your posters worked");
    - storm's "Wait it out" cancels the afternoon flights;
    - crew's "Cancel the day" grounds the plane for the day, and "Let the co-pilot fly" has a "50% chance of a −1★ incident report" (the game has no chance in it);
    - the fault's options are in a different order (fix, wait, fly).
17. **Challenges 1 and 2** have `rewardShare` 0.25, but their reward column still says "10% off your next fuel purchase" and "+½ star". The game keeps the reward column for them.
18. **Market week 105** (30 Aug 2032) is still `later`, so the last two days of chapter 3 use week 104's row.
19. **Small text leftovers:**
    - Mechanics 2031-08-31 still says "the full airline-type profiles arrive";
    - WorkingMethods row 9 still gives "6,000,000 ÷ 6,000 = 1,000 days";
    - `us_storm` lists only New York but its headline names Toronto.
20. **A rotation's typical day.** The plan page and the cost breakdown show a 2-day rotation on its way out, so the plan's "profit a day" counts it every day, while it earns every second day. Should the plan show the average day (the service's profit ÷ 2, which is push 2's two-leg ÷ 4 sum for Sydney)?
