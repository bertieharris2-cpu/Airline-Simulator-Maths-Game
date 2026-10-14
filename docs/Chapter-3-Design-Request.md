# Chapter 3 ("Owning"): what we need from Fable (14 Oct 2026)

Chapter 3 is not built yet. Bertie asked for this request to go to Fable first, because Workbook v5.2 defines only part of the chapter. The game now plays chapters 1 and 2 to the review on Sunday 31 August 2031. Its end card says "Next: chapter 3, buying aircraft outright, from Tuesday 2 September 2031".

## Where chapter 3 stands in Workbook v5.2

| Area | Status | What is there |
| --- | --- | --- |
| Buying outright | **Live** | `buyFromDate` 2031-09-02. The Finance rows give A220, A320, 737, 757 and 787 `buyFrom` 2031-09-02, so the game's shop already turns Buy on that day. |
| Overdraft | **Live** | `overdraftFromDate` 2031-09-02, `overdraftLimit` "one week's average profit (last four weeks)", `overdraftDailyCharge` 0 (F7). |
| Reserve, finance | **Live** | `cashReserve` £1,000 "before overdraftFromDate"; `financeFromDate` 2032-09-07 (chapter 4). |
| Chapters row | Placeholder | "Owning", 2031-09-02 to 2032-08-31, 5 set-up days, monthly runs. New idea: "price − cash, ÷ profit a week; the overdraft safety net". 6 hand sums. |
| Calendar | **Blank** | No rows after day 133 (12 Jan 2031). No `chapter3SetUpDays`. |
| Market | Later | Weeks 53–104 (1 Sep 2031 to 29 Aug 2032) have fuel, seasons, weather and headlines. There are **no fuel forecasts** (`forecastLow/High`, `fuelHeadline`), which the fuel desk needs every week. |
| New aircraft | Later | A340 £8m, 777 £12m, A350 £15m, shop from day 366. Not balance-tested, and no artwork. |
| New routes | Placeholder | Tokyo, Cape Town, Singapore and Sydney have names, distances, archetype and base fares only. They have no demand tables, fare options, time zones, coordinates, fees or rotations. The `long_haul_mixed` archetype is `later`. |
| Route news | **Blank** | None after 20 Aug 2031. |
| Events | Placeholder/later | storm2, fuel_shock2, christmas2, oil_glut, heatwave and overdraft_offer. None has option rows. |
| Challenges | Placeholder | 3 (47 × 23, £1,000), 4 (1,296 ÷ 8, £1,500), 5 (68 × 54, +½★). |
| Hunts | Placeholder | h3 (year-2 accounts omit one month's lease, 31 Aug 2032), h4 (Tokyo arrival zone error, 10 Feb 2032). |
| Hand sums, methods | **Blank** | The six chapter 3 sums are not named. There are no WorkingMethods or Bettws codes for percentage change, millions or negative cash. |

## Already decided by Bertie (14 Oct)
- **Monday 1 September 2031 flies by itself**, like Christmas: the standing plan flies with nothing to plan. Chapter 3 then opens on **Tuesday 2 September**, as the workbook says. Please confirm the Tuesday dates are meant: 2 Sep 2031, the review on 31 Aug 2032, and chapter 4 on 7 Sep 2032. Chapters 1 and 2 start on Mondays, and Market weeks start on Mondays.
- **The A340, 777 and A350 stay "coming soon"** until you finalise them. Chapter 3's shop sells the jets already in the game, now buyable outright.

## What we need, area by area
1. **The chapter's shape.**
   - What happens in the 5 set-up days, day by day: Calendar rows as for 6–12 Jan 2031 (jobs, unlocks, headlines, `gatedCalc`)?
   - Then months straight away (`runCadence` month), or some weeks first?
   - The chapter 3 review (31 Aug 2032): the year-2 accounts, hunt h3, and what comes next.
2. **Market weeks 53–104 promoted to live, with fuel forecasts.** Without forecasts the fuel desk says "No forecast this week".
3. **Buying rules:**
   - Does the £1,000 reserve still block a purchase after 2 Sep 2031, or does the overdraft replace it?
   - Can he **buy a plane he already leases** (the 757 or 787 from January)? At what price, and does the lease stop that day?
   - Can a lease be **handed back at a month end**? The game says "Can give it back? Yes" and "hand it back at a month end", but no rule exists and nothing in the game does it. `sellBack` is "none" (D25), so no selling.
   - **At the overdraft limit:** what stops? Flights, fuel orders, purchases? And what does he see ("Overdrawn £X" on the statement, Change Note v4 row 27)?
4. **Time to afford: per day or per week?**
   - Chapter 1 (D76) uses "(price − cash) ÷ profit a day".
   - The chapter 3 row and HandSumRule 4 say "÷ profit a week".
   - Change Note v4 says "÷ average weekly profit, in weeks".
5. **Balance: the cash level.** Our end-of-chapter-2 test pupils hold **£13.59m (Value) and £13.31m (Premium)**, after about £55,000–60,000 profit a day in the spring. At that level:
   - the 787 (£6m) and even the 777 (£12m) need no saving;
   - the overdraft is never reached.

   Is that intended, or should chapter 3 make buying bite (higher prices, bigger costs, a chapter-2 balance change)? Balance Report v4 §4 expected a 787 in Sep 2031, a 777 in Feb 2032 and an A350 in Nov 2032.
6. **The four new routes** (if they are chapter 3):
   - demand tables at each fare, fare options, UTC offset, latitude and longitude, landing fee, turnaround and rotation, and the `long_haul_mixed` archetype;
   - **Sydney** (17,100 km, about 19 hours) does not fit the same-day or overnight rotation we built for New York and Delhi. How should it rotate?
7. **Events with option rows** (label, sub-line, cash or costShare, stars), as chapter 1's undercut, storm and crew have. Chapter 2's events were built from prose (it works, but rows are safer). Please also give:
   - the dates on the right weekdays, since several are Tuesdays inside Monday Market weeks;
   - storm2's options;
   - the overdraft offer's place;
   - fuel shock and oil glut: are they Market prices only?
8. **Challenges 3–5 and hunts h3–h4.**
   - Rewards of £1,000 or £1,500 mean little at £13m. Should they be percentages, or stars?
   - Challenge 5's story says "54 weeks" in a year.
   - h4 needs the Tokyo route and its time zone.
   - h3 says "£180,000 too good": which lease, and which month?
9. **The six chapter 3 hand sums**, named, plus WorkingMethods rows with Bettws codes for:
   - subtraction and division with millions;
   - percentage change;
   - "when does renting cost more" at jet prices;
   - negative cash.
10. **The full airline-type profiles** "at the 2031-08-31 review" (`airlineTypeMode`: crew cost by type, demand effects, free snacks). They are still placeholder. Do they start in chapter 3?
11. **`secondCrewCost`** is still placeholder (£250).

## Carried over from chapter 2 (still open)
- **Luton** (fees_rise option 4) is off for now, waiting for your balance pass.
- **Push 3 notes** (`docs/Chapter-2-Push-3-Notes.md`):
  - the ash cloud's dates and fine;
  - the landing-fee deal after 31 Aug;
  - the blogger's "late" rule;
  - h1's £1,000 or £2,000;
  - challenge stars by airline type;
  - option rows;
  - week events decided on Monday.
- **Push 2 interpretations:** half-star rounding, the daily stars switched off, whole bags, and the others.
- **Chapter 2 rules that carry into chapter 3 unless you say otherwise:**
  - Value's bag fee;
  - closures for `all`-route news;
  - months that pause on an event's day;
  - the landing fee "for good" (Pay), charged every Monday;
  - a missed year-1 accounts hunt putting chapter 3's cash forecast £1,000 out. Nothing reads that yet: how should chapter 3 show it?

## What the game can already do (so you know what is cheap)

| Mechanic | Already built |
| --- | --- |
| Shop | Gated by date for buy, lease and finance; time to afford with a two-step Calculate and Build; the shop under Fleet; buy-now-or-wait with a countdown |
| Charges and months | Dated charges (one-off, daily, every Monday); months that pause on an event, hunt or challenge |
| News | Closures; news for all routes |
| Challenges and hunts | The Captain's challenge card with an HQ button; the hunt document (tap the line, then fix it), with consequences |
| Working pad | ×, ÷ (bus stop), − |
| Chapter structure | A new chapter appended after a gap day; a chapter review with Build accounts |
| Tests | A test can start from the chapter 2 end save |
