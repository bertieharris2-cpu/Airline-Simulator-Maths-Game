# Balance Report — World Workbook v4
*Travels with Airline-World-Workbook-v4.xlsx (6 Oct 2026, evening). Builds on v3: everything in v3 §1–§5 and §7 still holds unless changed below.*

## What this means (for Bertie)

Nothing in the opening fortnight has moved. Week 3 gains a second jet, the E175, which slots neatly between the ATR and the E190 on Madrid and beats the E190 on Marrakech, so a pupil choosing a first jet has a real choice. Marrakech now has a demand table and is tested for week 4. The aircraft ladder is no longer tied to real prices; it is set so that, on the Steady path, each plane arrives a few lessons of saving away, and the A380 is financed in April 2033. Leasing from the A220 up costs a thousandth of the price per day, so "when does renting cost more than buying?" has the same answer (1,000 days) for every jet. The five-year route was modelled again under the chapter rules and every version of the pupil stays in profit every week.

## 1. Engine rules

As v3 §1, plus: a leased plane costs `leaseDaily` every day as a cost line and can be returned at any month end; a financed plane takes `financeDeposit` on signing and `financeWeeklyPayment` for `financeWeeks` weeks; reports follow the time step (D40); hand sums follow HandSumRules (D34).

## 2. Week 3 and week 4 — the small jets (new in v4)

Fuel £1.70. The E175: 80 seats, 900 km/h, 3,700 km range, 55 L/100 km, £700/h, £2,000/day, £20,000.

| Route | ATR 72 | E175 | E190 |
| --- | --- | --- | --- |
| Madrid (1,350 km) | **£6,194** (£170, 1 service, 70 pax) | £5,556 (£160, 1 service, 80 pax) | £5,577 (£150, 1 service, 98 pax) |
| Marrakech (2,250 km, week 4) | out of range | **£7,602** (£230, 1 service, 78 pax) | £5,680 (£220, 1 service, 85 pax) |

Marrakech demand table (new): £220 → 110, £230 → 100, £240 → 90, £250 → 75, £260 → 60, £270 → 45. Designed so that one E175 fills at £230 and the E190 only fills at a fare that loses the margin: the cheaper jet wins the smaller pool (criterion 5 passes). The ATR cannot reach it (range 1,500), so Marrakech is the first route that makes the jet necessary.

## 3. The ladder (F5, replacing D16's three-tenths rule)

| Plane | Price | Lease a day | Price ÷ lease | Arrives on the Steady path |
| --- | --- | --- | --- | --- |
| Twin Otter / Saab / ATR / E175 / E190 | £5,000 / £9,000 / £15,000 / £20,000 / £30,000 | launch deals (£250–£1,200) | 20–25 days | weeks 1–6 (bought) |
| A220 / A320 / 737 | £300,000 / £400,000 / £400,000 | £300 / £400 / £400 | 1,000 days | Oct–Nov 2030 (bought) |
| 757 | £1.5m | £1,500 | 1,000 days | Jun 2031 (leased) |
| 787 | £6m | £6,000 | 1,000 days | Jan 2031 (leased), Sep 2031 (bought) |
| A340 / 777 / A350 | £8m / £12m / £15m | £8,000 / £12,000 / £15,000 | 1,000 days | Feb–Nov 2032 (bought) |
| 747 | £20m | £20,000 | 1,000 days | 2035 (bought) |
| A380 | £30m | £30,000 | 1,000 days | Apr 2033 (financed: £9m down, £404,000 a week for a year) |

The step from £30,000 (E190) to £300,000 (A220) is deliberate and explained in play: jets are a different world. Real list prices are shown on the plane card for interest.

## 4. Five-year model under the chapter rules

Steady pupil: buys tutorial planes in weeks 2–6, two A320s in Oct–Nov 2030, leases a 787 in Jan 2031, a second in Mar, a 757 in Jun; buys a 787 in Sep 2031, a 777 in Feb 2032, an A350 in Nov 2032; finances the A380 in Apr 2033; buys a 747 and another 787 in 2035. Profit a day: £1,500 (week 1), £12,000 (week 4), £35,000 (Christmas 2030), £37,000 (Jan 2031), £58,000 (Jun 2031), £60,000 (Sep 2031), £70,000 (Sep 2032, A380 era), about £50,000 in years 4–5 as the rival and fuel bite. Cash never below zero; the overdraft is never used. Income is capped by the routes open, so the route-opening schedule (RouteCatalogue plannedOpenWeek) is the lever on wealth, not prices.

Fuel-shock weeks (Oct 2030, Oct 2031 and every October after) roughly halve profit for one to two weeks on every path; they are the intended "a bit of loss".

## 5. Safety floor

Unchanged from v3 §5. With leasing in chapter 2, the first long-haul plane needs no capital, so the chapter-2 opening cannot strand a pupil who saved little in chapter 1.

## 6. Hand-sum count (D34, HandSumRules)

Planned hand sums: chapter 1 about 25, chapter 2 about 8, chapter 3 about 6, chapter 4 about 6, chapter 5 about 5, chapter 6 about 4 — about 55 over the game, roughly half × or ÷, before Captain's challenges (one a term from Jan 2031) and hunts (one per review). Fuel by hand about six times in five years under the 50p / quarter-of-litres rule.

## 7. Not yet tested

Long-haul demand tables (New York, Dubai and beyond) and the long-haul rules (overnight rotations); 757, A340, 777, A350, 747, A380 economics on real tables; reputation, airline-type, extras and marketing values; the quarterly task; the Luton pass; Market weeks 105–416 as a repeating pattern.

## 8. Open

Fable's calls F1–F7 (start date, losing-plan warning, catering sheet, lease rule, ladder, game length, no overdraft charge) await confirmation; grid-method option parked.
