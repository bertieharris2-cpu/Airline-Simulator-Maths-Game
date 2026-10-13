# Chapter 2, push 2: notes for Fable and Bertie

*From Claude Code, 13 October 2026. Workbook v5.0 (D69–D71), revised Studio only (`airline-opening-studio-v2.html`, `src/opening/parts/p4zj_types.js`). The full chapter 2 report comes with push 3.*

## What is built

- **Day 127 now runs:** HQ, *Going long*, **Your star rating is public**, **What sort of airline are you?**, the shop, the plan, the sign-offs, the fuel desk, the flying.
- **The star rating** is revealed at the autumn's banked level (Settings `reputationBankedFromAutumn`).
  - The card lists each event choice that moved it, then the sum, for example "4 stars: 2 half-stars above 3, so 2 × 5% = 10% more passengers".
  - It also shows New York's demand at 3 stars and at the pupil's rating.
  - From day 127, demand on every route is × (1 + `reputationPerHalfStar` × half-stars from 3).
- **The airline type** is chosen on day 127 and confirmed on Thursday 9 January (Calendar day 130, "airline type confirmed"), on a card before the day's run. The pupil can change it then.
  - **Premium:** the two demand-table steps above today's top fare on every route (New York £570, £590); stars 1.5× as fast.
  - **Value:** one step below (New York £450); stars 0.75× as fast; the bag fee.
  - **Full Service:** unchanged.
- **Bags (Value):** passengers × 4 tenths × £20 a day on every route, in the revenue. It is a line on the plan summary, the trade-offs' money and the day's results.
- **Sign-offs on day 127, under the cap of three** (a Value airline, a 757 on New York):

  | Sign-off | Level |
  | --- | --- |
  | Bag fee: 4 tenths of 200 passengers = 80 bags, then 80 × £20 = £1,600 | Calculate, two steps |
  | New York tickets: estimate 200 × £500 = £100,000, then 200 × £510 = £102,000 | Calculate, estimate first |
  | 757 fuel to New York: 12,375 L × £2.17 on the service card | Calculate |
  | Rent or buy the 757 | Build |
  | A full 757 (seats × fare: the same numbers as the tickets) | Build |
  | New York's flight time | Build (the cap is full) |

  A Full Service or Premium airline has no bag fee, so the flight time takes the third slot.
- **The bag fee is by hand once, then the model does it**, like snacks.

## Interpretations to confirm

1. **Half-stars and the star rate.** Premium's ½-star event moves the rating by ¾, and Value's by ⅜.
   - The rating shown and used for demand is whole half-stars, counted towards 3, so 3¾ shows as 3½.
   - The quarter is kept, so a second ½ for a Premium airline makes it 4½. A Full Service airline would be at 4 by then.
2. **Only the stated effects move the stars** (events now, challenges in push 3).
   - The prototype had a daily ½ star for a fare two steps above base, a fare a step below, free snacks and the cabin layout. Those rules are off from day 127.
   - Otherwise a Premium airline using its higher fares would lose half a star a day.
   - The Catering sheet's "reputation effect later" for free snacks is not built.
3. **Bags are whole:** each route's bags are its passengers × 0.4, to the nearest whole bag.
4. **The bag-fee sum uses the long-haul route's passengers** (a full 757: 200), matching Balance Report §4. Without a long-haul route it uses the busiest route.
5. **Seats × fare for a long-haul plane is Build on day 127.** It is the same 200 × £510 as the estimated ticket sum, and as a Calculate it would take the bag fee's slot.
6. **Thursday's change of type** applies to that day's flights. New fares (Premium's higher steps) are set on Monday's plan, because the run days have no plan page.
7. **A save already past day 130 without a type** plays as Full Service.

## Bertie's run-through changes (both game files)

- **The fuel cost has one method: make it pence.** The Service Cost card walks it in three boxes:
  1. the price × 100 to whole pence;
  2. the litres × the pence, one line for each part of the pence (230 × 7p, 230 × 40p, 230 × 100p), then add the lines;
  3. ÷ 100 back to pounds.

  Each Query names the step and the slip. The WorkingMethods row *litres × price per litre* still lists five methods; the game now offers one. **Fable:** the sheet could list just "make it pence", if that is the decision.
- **The review Build cards' question stands out:** a green box, with the thing to find in bold.

## Tests

- `chapter2.test.js` runs with `TYPE=value` (default) and `TYPE=premium`.
- **Checks:**
  - the reveal at the banked level and its factor;
  - the fare menus for all three types;
  - the cap's levels on day 127;
  - the estimate card, and a wrong first step as a Query with its hint;
  - the bag card, the Bags line (New York 80 bags, £1,600) and Thursday's confirmation;
  - the bag fee going to the model after once;
  - Balance Report §2's £47,426 (unchanged).
