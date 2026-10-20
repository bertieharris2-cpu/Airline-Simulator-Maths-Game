# D104: a richer first eight weeks (workbook v6.0)

*Claude Code, 20 October 2026, for Bertie and Fable. The brief is Fable's D104 in workbook v6.0 (installed on 19 Oct, commit 5ca2944, "data now, D104 after"): growth that responds to how a route is served, stars from week 3, demand ranges for new routes, six curveball events with no best answer, and a second autumn (track B) for pupils who have played before.*

Everything here is in year one only (Launch Day, day 1, to the year-1 accounts, day 364), gated as before: `yearOne()` for behaviour and `body.yr1` for CSS. From day 365 every rule and screen is as it was; the chapter 3 and 4 tests are unchanged (see Tests). The code is one new part, `src/opening/parts/p5w_d104.js`, which only reassigns, so `overrides.txt` stays at 120. Styles are in `p1_head_sheet.css`.

## 1. Two autumns: track A and track B

- **The switch.** Settings `autumnTrack` (A) is the default. The teacher panel has a new section, **Autumn track (D104)**, with one choice for this airline. Choosing B sets this airline's track and the default for new airlines. A change takes effect from the next day or week that has not started.
- **What plays.** Every Events, EventOptions and RouteNews row now has a `track` (A, B or both). In chapter 1, an item plays on the airline's track or on both. After chapter 1 everything plays, as before.
- **Track A** (the standard autumn) is as before, with the curveballs added:
  - Red Kite's undercut (day 4), the storm (5), the school trip (9), crew sickness (11), the Dublin strike (17), the snack supplier (23);
  - in the weeks: the sponsorship (29), the slot squeeze (36), the tanker beside the fuel shock (43), the fault (50), the football final (57), the price war (71).
- **Track B** (the second autumn):
  - the school trip (9), the fault (18, a board day), the snack supplier (23), the storm (24), the tanker and crew sickness in the same week (43), the price war (50);
  - no undercut, Dublin strike, sponsorship or slot squeeze;
  - the Dublin concert (×1.8 on Saturday 5 October, announced on 23 September) replaces the rugby, and the Amsterdam fair (business ×1.4, 14–20 October, announced on 10 October) replaces Milan's.
- **Two cards in one week** (track B's week 7) come one after the other, both before the plan.
- **D104 cards in the weeks come before the plan**, so the plan is made knowing about them (the slots, the tanker's fuel, the sponsor).

## 2. The six curveballs (and the fault and price war)

The choices come from the EventOptions sheet; what each one does is in the game. The money and the stars show on the card's Result row as before.

| Event | Choice | What it does |
| --- | --- | --- |
| School trip (day 9) | Take the booking | On Thursday the 12th, the first Paris flight carries the school's 19 seats at £60. Any seats left sell at the fare as usual, and passengers it can no longer carry move to the later Paris flights if there are seats. |
| | Sell at your fare | No change. |
| Dublin strike (day 17, A) | Fly with delays | Friday's Dublin flights go, late; −½★ (the option's star). |
| | Cancel Friday's Dublin flights | Friday's Dublin flights are cancelled and refunded. The plane is free. |
| Snack supplier (day 23) | Switch supplier | Snack stock costs 50p an item instead of £1 from that day. If any snacks are sold, −½★ at the next month's review (once). |
| Sponsorship (day 29, A) | Sponsor them | £500 now; Dublin demand ×1.05 for 28 days. |
| Slot squeeze (day 36, A) | Replan the week | For seven days, at most two departures before 09:00. The plan's footer says how many the plan has; while there are more than two, Work out my plan ▶ is off. On the day, only two early departures leave (a safeguard). |
| Tanker (day 43) | Buy the 5,000 L | 5,000 L at £2.40 into the tank (oldest fuel first, as usual), paid once (£12,000). The Buy key is off, with the reason, without 5,000 L of room or £12,000. |
| Fault (A day 50, B day 18) | Fix it today | £800 before day 29 (the Events row's "fix £800"), then half of yesterday's profit; +½★. |
| | Wait a day | The aircraft is grounded the next day (on a board day too). |
| | Fly anyway | −1★. |
| Price war (A day 71, B day 50) | Hold your fares | Red Kite is a fifth cheaper this week: the switching rule applies. |
| | Match the cut | Every fare you fly drops by a fifth (to the nearest £5) for the week, and goes back when the next week starts, unless you have changed it since. |
| | Advertise | 30% of yesterday's profit; half as many switch this week. |

## 3. Growth responds to how a route is served

Each route keeps a demand multiplier: 1 is its opening demand. It steps once for each calendar week played, with the workbook's rule (`WE.growthStep`, checked in `balance.test.js`):
- **Flown:** + growthPerWeek, + growthFillBonus when the week's seats were at least 80% full and people were turned away. The total is × growthFareDrag at the top fare (0 in v6.0: no growth), half that drag second from the top.
- **Not flown:** − growthDropDecay a week, back towards the opening demand (never below it).
- **Never past growthCeiling.**

How the game uses it:
- Week 1 sets nothing (weeks 1 and 2 stay flat, as before). Week 2's service sets week 3's demand, and so on.
- A step counts from the day after the results that completed its week, so a week (or a month) keeps the demand it started with and its projection holds.
- A month's results give each of its weeks the month's average. A week with nothing played (the holiday) is skipped.
- Long haul keeps its own rule (5% a week from opening, to 1.5×).
- The figures come from the history the game already keeps (`S.g104`). An older save rebuilds them from its history when it is opened.

## 4. Stars from week 3

- **The rating goes public on day 15** (Monday 16 September), not on 6 January, with its own card after HQ:
  - your rating;
  - what moved it in the first two weeks (each event choice, from 3);
  - what it is worth (+5% of passengers a half-star above 3, on your own busiest route);
  - what moves it from now.
- **Day 127** keeps the airline-type page, but not the stars card.
- **An older save past day 15** with its stars still hidden gets the card at the start of its next day or week (not the holiday).
- **The event card's Reputation box** before then says "public from Mon 16 Sep (week 3)".
- **Chapter 1's four drivers**, judged from week 3:
  - a route that turns away more than 1 in 5 of the people who want to fly, two weeks running: −½★, once a route;
  - a plane grounded with no fuel and no cash to buy it (D103): −½★ for the day;
  - free snacks two weeks running: +½★, once;
  - each month's review: +½★ if a week since the last review ran on time.
- **The month's review** is at the end of the week that holds the turn of the month (it ends on the 1st–7th). A week is on time with no choice that cost stars, stopped or delayed flights, and no day grounded with no fuel. The plainer snacks' −½★ also comes at a review.
- **Every move** goes into the news ("STARS") and the pupil's record. The rating stays within 1–5.

## 5. New routes show a range

Until a route has been flown for a week, its demand shows as a range: the true figure × (1 ± 0.15), widened to the nearest 5, or to whole numbers under 20. For example, "about 50–70" for 60. Paris and Dublin are known from the start (Routes `demandKnown`). A route first flown on day 15 shows the range to day 21 and the true figure from day 22.

The places that show a range:
- the Studio's active routes, the route editor (every fare, "Demand at £…", and the line under it), the fare lists and the demand strip;
- the route cards on Change network (with nine fares, only the chosen fare's range sits over its bar; the others say it when pointed at);
- the Network's Destinations;
- the World report's table and demand bars, each with the line "A new route: a range until you have flown it for a week."

The game's own sums and projections keep the true figure (see flag 9).

## Screens changed

| Screen | What changed |
| --- | --- |
| Your star rating is public (day 15) | New card, two by two: the rating, what moved it, what it is worth, what moves it now. |
| Day 127 | The stars card is gone (they are already public); the airline-type page stays. |
| Event cards | The six curveballs and track B's events. The departures board shows two rows when a notice line is under it; three rows used to run into the notice. |
| Operating Plan Studio | The footer line in the slot-squeeze week; ranges for new routes (routes, route editor, fare lists, demand strip). |
| Change network | Ranges on the route cards of routes not yet flown for a week. |
| Network, World report | Ranges for new routes. |
| Teacher panel | Autumn track (D104). |
| News | STARS items. |

## Flags and questions

1. **Stars are judged from week 3, not week 1.** In weeks 1 and 2 one Twin Otter turns people away on both routes whatever the pupil does, so the turned-away rule would have cost every pupil a star before the rating was even public. Judging from week 3 also means the card's "What moves it from now" is true. Fable: is that what you meant?
2. **"A cancelled or grounded flight −½★"** is applied to days grounded with no fuel (D103), not to the event cards' choices. Those carry their own stars: cancelling for the Dublin strike would otherwise cost a star on top of the lost tickets, and cancelling in the storm earns +½.
3. **Once each:** the turned-away −½★ is once a route in chapter 1 (as written); the free-snacks +½★ is once too (not written). Otherwise free snacks would add half a star every fortnight.
4. **The month's review:** +½★ once a review if any week since the last one was on time; reviews fall on 6 October, 3 November and 1 December in chapter 1.
5. **Growth ends with year one.** From day 365 the old rule returns (growthPerWeek × weeks since week 3, to the ceiling), so a route's demand can jump at the start of chapter 3. Extending D104's growth past year one is for when you say "extend".
6. **"Dublin about 1.6× by December"** (Balance Report v6.0 §2): with the sheet's numbers, a full Dublin at a middle fare reaches ×1.45 by mid-December, and business_shuttle's ceiling is 1.5 (noted in `balance.test.js`).
7. **Track A's fault and price war now have choices.** Their Events rows had none, so they used to pass silently; they take the EventOptions rows now.
8. **Track B has no Red Kite undercut in week 1**, so no Thursday "Stay with you" sum and no "Customers have a choice" briefing on track B.
9. **The ranges are on the demand figures only.** The plan's projection (seats filled at each fare, profit) still uses the true figure, so when demand is below the seats the pupil can read it there. Change network's sort by demand also uses the true figures.
10. **Track B's two news items** (the concert and the Amsterdam fair) are built from their Events rows: there are no RouteNews rows for them. Fable may want to add them.
11. **Track B's storm** keeps track A's Events-row choices (they light the afternoon on the board). Track B's crew sickness, fault and price war take their own EventOptions rows ("Cancel the day" in a week).
12. **The fault's fix** costs £800 before day 29, from the Events row's note; the EventOptions row has only the cost share.

## Tests

TESTS-PLACEHOLDER

## Balance

BALANCE-PLACEHOLDER

## Screenshots

SHOTS-PLACEHOLDER
