# Balance Report — World Workbook v2
*Travels with Airline-World-Workbook-v2.xlsx. Says what was tested, how, what passed, and what has not been tested yet.*

## How testing works
A small reference engine (Python, about 60 lines) implements the rules in Fable Pass 1 section 0: a service is a round trip earning one plane-load at the fare; five day bands; time-locked passengers fly only in their band, flexible passengers spread across the day's services; costs per service (flying hours × hourly cost + both landing fees + fuel + passenger charge) and per day (day cost, plus £250 for a second crew if duty exceeds 12 hours). Home is Heathrow T5 (landing £120, turnaround 35 min, £5 a passenger). Fuel £1.20.

For every live route and every live aircraft, every fare option is run against every sensible timetable (1 morning, 1 evening, 2 back-to-back, 2 morning + evening, 3 back-to-back, 3 spread), and the brief's balance criteria are checked:

1. the cheapest fare does not always win;
2. the earliest / most compact timetable does not always win;
3. the extra service is sometimes worth it and sometimes not;
4. routes behave differently;
5. a bigger aircraft is not automatically better;
6. costs are big enough to matter, arithmetic stays friendly.

## Tested and passing (5 Oct 2026)

### Week 1 routes, Twin Otter
| Route | Best plan | Profit | Runner-up | Criteria notes |
| --- | --- | --- | --- | --- |
| Dublin | £90, 3 services (07:00, 11:20, 18:00) | £1,142 | £90, 2 compact: £898 | £80 with three full planes earns only £827 (1 passes). Three compact services lose the evening and earn £802 (2, 3 pass). |
| Paris | £90, morning + evening | £1,052 | £90, 2 compact: £877 | Second crew is the price of the evening peak. A third service never pays (3 passes). £80 and £100 both earn less than £90 (1 passes). |

Mixed day Paris 07:00 / Dublin 10:20 / Paris 18:00 = £1,801: splitting one plane across both routes beats either alone (Phase 2 reward).

### Week 2 routes, all three week-2 aircraft (best plan per cell)
| Route | Twin Otter | Saab 340 | ATR 72 | Criteria notes |
| --- | --- | --- | --- | --- |
| Amsterdam | £1,950 | **£2,513** | £1,812 | The Saab's route (5 passes: ATR has more seats and earns less). |
| Frankfurt | £601 | **£1,185** | £92 | One service a day, mid-size plane. |
| Geneva, September (×0.5) | £140 | loses | loses | Off season: the forecast card should steer him away. |
| Geneva, January (×1.4) | £1,620 | **£2,827** | £2,468 | The winter bonanza. |
| Barcelona, September (×1.1) | £460 | **£2,090** | £1,845 | 3 h 45 legs in a Twin Otter kill it; speed matters (4 passes). |
| Barcelona, November (×0.6) | £80 | £640 | loses | Fading, as intended. |

Twin Otter remains the right plane for Paris throughout, so small planes stay useful (5 passes).

### Fares scale with distance
Three week-2 routes were first set at short-haul fares and failed (Frankfurt Twin Otter −£24; Barcelona Twin Otter −£300; Geneva losing even in winter). Costs rise with flying time and fuel, so fares must too. Rule adopted: base fare ≈ £60 + 8p per km, rounded to £10. It yields realistic fares across the whole catalogue (Dublin £100 rule / £80 set, Barcelona £150, New York £510, Sydney £1,430).

## Deliberate threshold placements
Twin Otter 19 / 38 / 57 · Saab 34 / 68 · ATR 70.
- Dublin £90 → 62 (just over three Twin Otters; the third fills only with the evening). £100 → 44 (just over two). £110 → 30 (just under two).
- Paris £90 → 50 (two full planes only if both peaks are served). £120 → 20 (one plane).
- Amsterdam £90 → 76 (two full Saabs with 8 spare; one ATR with 6 spare; four Twin Otters' worth). £100 → 56.
- Frankfurt £120 → 50 (one and a half Saabs). Geneva winter £110 → 70 (two Saabs). Barcelona September £140 → 59 (one ATR, or two Saabs).

## Not yet tested
- Weekend demand multipliers (Calendar optional rows).
- Seasonal multipliers other than the Geneva/Barcelona September and winter checks above.
- Every aircraft from the E190 up: their economics depend on medium- and long-haul rules not yet agreed (one service a day; overnight rotations). Prices are first guesses on a per-seat-hour ratio that falls with size.
- Every RouteCatalogue entry: identity and fare only; demand tables are written and tested when the route's week is designed.
- Events' effects on a plan (they change inputs; the plan maths is unchanged).
- Finance: lease £250 and finance £300 a day against a second plane's net earnings (£800–£1,300 on a good plan; under £400 on a poor one). Rule of thumb holds; not yet played.

## Scaling, stated plainly
Fares and passenger numbers are close to real. Operating costs are about a tenth of real; aircraft prices about a thousandth. Ratios are kept honest (a full plane earns about 1.5× its flight cost; a half-empty one loses; one service a day never covers the day cost). Margins are therefore far fatter than a real airline's, by design, so that decisions pay off within a lesson. Tell the pupil: ticket prices are real, everything else is shrunk so the game moves quickly.

## Open design items the data is waiting on
Game week (Mon–Fri or 7 days) · ATR in week 2 or held · E190 vs ATR as medium-haul opener · medium-haul mechanics order · capital vs cash flow and any bank facility · sell-back · baggage/ancillary revenue (parked, fields reserved) · marketing strategy (parked, fields reserved).
