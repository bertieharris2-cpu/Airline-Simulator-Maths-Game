# Chapter 2, push 3: notes for Fable (14 Oct 2026)

Push 3 completes chapter 2. The game now plays from Monday 6 January 2031 to the chapter 2 review on Sunday 31 August 2031, with:
- the events' choices;
- the nineteen news items (including `all` and closures);
- the two Captain's challenges;
- the two hunts.

Code: `src/opening/parts/p4zn_ch2events.js`. Screenshots: `docs/screenshots/chapter2/push3-*`.

## Bertie's decisions (14 Oct)
- A month pauses on the day of its event (also its hunt or challenge), then carries on.
- **Luton is left out for now.** Landing fees rise offers three choices; the LTN row stays `later`.
- A hunt is solved by tapping the wrong line, then typing the right figure (with the Working pad). "Everything is right" counts as missed.
- A challenge is offered once as a card. After "Not today" it waits on HQ as a button.

## What the game does with the workbook

| Event | Choices and how they are priced |
| --- | --- |
| The travel blogger, Wed 15 Jan | VIP: 0.25 of a day's profit, +1★. Upgrade: 0.1, +½★. Treat as anyone: −½★ when the flight is late. |
| Fog at London, Wed 22 Jan | Hire an instrument crew: 0.2. Wait: the flights before 12:00 that day are grounded. Cancel the day: −½★. |
| Landing fees rise, Wed 2 Apr | Pay: 0.3 every Monday from 7 Apr, for good. Night slots: −½★. Two-season deal: 0.2 every Monday to 31 Aug. |
| Ash cloud, Mon 14 Apr | Cancel everything: +½★, nothing flies 14–18 Apr. The long way round: 0.4 a day for 5 days, −½★. Fly anyway: −1★ and a fine of 0.5. |
| Mystery shopper, Tue 13 May | Fix everything: 0.4, +1★. The cheap fixes: 0.15, +½★. Ignore it: −½★. |

**How the choices are built.** The choices come from the prose in `otherEffects`: the label before the brackets, the sub-line inside them, and the stars parsed from the text. The costs come from `costShare`, matched by its whole phrase. "A day's profit" is the last 7 days' average, or the last period's day at a week's Monday.

**Charging.** A cost is charged once, on its day. Weekly and daily charges are paid inside the run. This also fixes chapter 1: a week's event cost used to be shown in the forecast every day but never taken from cash. The chapter 1 test chooses the free options, so its figures are unchanged.

**Headline events.**
- Half-term: Geneva +30 people a day for the Market week of 18 Feb (17–23 Feb).
- Easter: no effect of its own. Its +20% is the `easter_leisure` news item, so it is not counted twice.

**News.**
- `all` applies to every route.
- A multiplier of 0 is a closure: nothing flies, so no fares, no fuel burned and no flying costs. The day costs are still paid.
- The ash cloud's "long way round" and "fly anyway" lift the closure.
- A month's plan lists the news announced during the month ("Announced for April").
- The next review lists "News this month", with surprises marked.

**Challenges.**
- Challenge 1 (24 × 36 = 864 barrels, 10% off the next fuel purchase) first appears on Mon 13 Jan. Day 127 is already full.
- Challenge 2 (648 ÷ 6 = 108 sandwiches, +½★) appears on Mon 21 Apr.
- The discount is applied at the fuel desk. Until now `S.fuelDiscount` was cleared unused.

**Hunts.**
- **h2, the fuel invoice, Mon 21 Apr.** Three lines; the total, 14,000 L × £2.04, is shown as £29,560.
  - Missed: £1,000 is charged that day.
  - "Corrected next month if found later" is played as a second look at the invoice's total at the start of May. Found then: £1,000 back on 1 May.
- **h1, the year-1 accounts, on the 31 Aug review, before the accounts.** One line per route from his August flying, with the sheet's New York line as written.
  - Missed: a note on chapter 2's end card says chapter 3's cash forecast starts £1,000 out.

## Test runs

`chapter2.test.js` runs from the chapter 1 save to the chapter 2 review.

| Run | Choices | Checks | Cash on 31 Aug 2031 |
| --- | --- | --- | --- |
| Value | anyone, wait, pay, cancel, cheap. Finds both hunts. Challenge 1 after Not today, from HQ. | 106, 0 failures | £13,591,851 |
| Premium | VIP, hire, deal, long way round, fix all. Misses h2 (found in May) and h1. | 100, 0 failures | £13,312,048 |

- **Value's charges:** landing fees of £17,680 every Monday from 7 Apr. Ash, cancel: 14–18 Apr have no fares, with day costs paid. Mystery shopper: £8,609 on 13 May.
- **Premium's charges:** the deal at £11,208 every Monday to 31 Aug. The long way round: 5 × £21,918.
- **Board reviews:** the test pupil keeps one plan all year, so the existing board reviews ask for a change. Value gets one in May; Premium gets one each month from May. The test changes one fare.
- **Other tests:** chapter 1 (199 checks, £697,112), the coasting pupil (202, £689,806), the fleet shop (35), migrate (27) and the record (16) are unchanged, all with 0 failures.

## Questions for Fable
1. **Luton** is off for now. Its option and the LTN row wait for your balance pass.
2. **The ash cloud** is dated 15 Apr on Events, but the news says 14–18 Apr. I used 14–18, with the card on the 14th. "Fly anyway"'s fine has no amount; I used 0.5 of a day's profit.
3. **Landing fees.**
   - "Pay" is fixed when he decides, and charged each Monday.
   - I took the two-season deal to run to 31 Aug. What does "fees frozen" mean after that?
   - Should night slots limit departure times? Today they cost −½★ only.
4. **Fog** lasts one day, and "hire for the week" is one charge.
5. **The blogger's "late"** is when the Market week's weather is not clear (that week is icy). What if he has no Dublin flight?
6. **h1** says "£2,000 too much" but "starts £1,000 out". I used £1,000 for the forecast, as the consequence column says. h2's two delivery lines (6,000 L on 7 Apr and 8,000 L on 9 Apr) are mine.
7. **Challenge stars** are scaled by the airline type, like events' (Premium ×1.5, Value ×0.75). Should they be? There are no WorkingMethods rows or Bettws codes for challenges and hunts. The record uses passengers × fare for ×, distance ÷ speed for ÷, and litres × price for the invoice.
8. **Option rows.** Every chapter 2 event has no option rows. Rows like chapter 1's would let the importer carry them, with the code's table as a fallback.
9. **Week events** (blogger, fog) are decided on that week's Monday, not paused on the day.
10. **News before a route opens.** `lagos_fuel_strike` (10–16 Mar) is before Lagos opens (7 Apr), and `us_storm` lists Toronto before it opens (3 Mar). Both are harmless; nothing flies there yet.
11. **Still open from push 2:** half-star rounding towards 3, daily stars off, whole bags, the bag sum on the long-haul route, long-haul seats × fare as Build, Thursday's type change, and a save past day 130 with no type.
