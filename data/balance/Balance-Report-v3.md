# Balance Report — World Workbook v3
*Travels with Airline-World-Workbook-v3.xlsx (6 Oct 2026). Says what was tested, how, what passed, what the numbers assume, and what has not been tested yet. Supersedes v2.*

## What this means (for Bertie)

The opening fortnight still works the way it did: Dublin and Paris behave differently, £90 is the right fare on both, Paris wants a morning and an evening flight, and the mixed Paris–Dublin day beats either route alone. Week 2 now runs at the fuel price the Calendar actually charges (£1.50, not the £1.20 the v2 report used), so every week-2 profit is lower than v2 said, but the shape is the same: the Saab is the Amsterdam plane, the ATR only pays on busy routes, the Twin Otter stays right for Paris. The new £5 fares matter on Frankfurt and Geneva, where £115 beats £110 and £120. Madrid is designed and tested: the ATR is the plane for it, the E190 is the plane for everywhere beyond the ATR's reach, and a Twin Otter can get there but barely breaks even. Every week has a plan that makes money and the game blocks a plan that would run the cash out, so a sensible pupil cannot go bust from lack of capital. The five-year cash model puts the A380 bought outright in August 2034 at £100m.

## 1. How testing works

A reference engine (Python, `engine.py`, about 120 lines) implements the rules the data assumes:

- a service is a round trip earning one plane-load at the fare (return tickets);
- five day bands (early 06–09, mid-morning 09–12, midday 12–15, afternoon 15–18, evening 18–22); each archetype says what share of the day's passengers wants each band and what share is time-locked; time-locked passengers fly only in their band, flexible passengers fill any seat in departure order;
- costs per service: flying hours × hourly cost + both landing fees + litres × fuel price + £5 a passenger; per day: the aircraft's day cost, plus £250 for a second crew when duty exceeds 12 hours (duty runs from 30 min before the first departure to 30 min after the last arrival);
- **the last service of the day does not turn round at home** (it ends on arrival; v2's engine agreed, v3 states it);
- home is Heathrow T5 (landing £120, turnaround 35 min, £5 a passenger); airport open 06:00–22:00;
- demand at a fare between two listed fares is taken in a straight line between them; passengers are rounded to the nearest whole person.

For every live route and plane, every fare option is run against every sensible timetable (1 early, 1 evening, n back-to-back from 06:30, n spread between 06:30 and the last slot that lands by 22:00, for n up to 4) and the brief's balance criteria are checked: (1) the cheapest fare does not always win; (2) the earliest or most compact timetable does not always win; (3) the extra service is sometimes worth it and sometimes not; (4) routes behave differently; (5) a bigger plane is not automatically better; (6) costs are big enough to matter and the arithmetic stays friendly.

The engine's results agree with v2's to within a few pounds (Paris £90 morning + evening £1,052 in both; the mixed day £1,801 in both; Dublin 3 spread £1,057 against v2's £1,142, the difference being how the evening locked passengers are shared).

## 2. Week 1 — Twin Otter, Dublin and Paris (unchanged data)

Fuel £1.20 on Launch Day (free in play on days 1–2), £1.30 on Wednesday, £1.40 on Friday.

| Route | Best plan | Profit | Runner-up | Criteria |
| --- | --- | --- | --- | --- |
| Dublin | £90, 3 spread (06:30 / ~11:20 / 17:40) | £1,057 | £90, 2 compact: £898 | £80 with three full planes earns £827 (1 passes). Three compact services miss the evening and earn £773 (2, 3 pass). |
| Paris | £90, morning + evening | £1,052 | £100, morning + evening: £957 | The evening peak costs a second crew and is still worth it. A third service never pays (3 passes). |

Mixed day Paris 07:00 / Dublin 10:20 / Paris 18:00 at £90, fuel £1.20: **£1,801** — splitting one plane across both routes beats either alone (the Day 4 reward).

## 3. Week 2 — four routes, three planes, £5 fare steps (new in v3)

Fuel £1.50 (the Calendar's Monday price for week 2). Geneva at ×0.5 and Barcelona at ×1.1 (September). Amsterdam is now 450 km and Geneva 675 km so that Saab and ATR legs are whole quarter-hours (D14); Frankfurt (675) and Barcelona (1,125) already were.

| Route | Plane | Best plan | Profit | Passengers | Worst plan on the fare list | Worst |
| --- | --- | --- | --- | --- | --- | --- |
| Amsterdam | Twin Otter | £95, 3 spread | £1,400 | 19, 19, 18 | £110, 3 compact | −£385 |
| Amsterdam | Saab 340 | £90, 2 spread | **£2,240** | 34, 27 | £110, 4 compact | −£1,375 |
| Amsterdam | ATR 72 | £90, 1 service | £1,515 | 49 | £110, 4 compact | −£3,785 |
| Frankfurt | Twin Otter | £140, 1 service | £655 | 19 | £140, 2 compact | −£770 |
| Frankfurt | Saab 340 | **£115**, 1 service | **£1,054** | 29 | £140, 3 compact | −£1,414 |
| Frankfurt | ATR 72 | £115, 1 service | −£100 | 29 | £140, 3 compact | −£4,075 |
| Geneva (Sep) | Twin Otter | £115, 1 service | £190 | 19 | £150, 2 compact | −£2,000 |
| Geneva (Sep) | Saab 340 | £115, 1 service | −£36 | 19 | £150, 3 compact | −£3,434 |
| Geneva (Sep) | ATR 72 | £115, 1 service | −£1,190 | 19 | £150, 3 compact | −£6,095 |
| Barcelona (Sep) | Twin Otter | £160, 1 service | £325 | 19 | £120, 1 service | −£435 |
| Barcelona (Sep) | Saab 340 | £150, 1 service | **£2,066** | 34 | £160, 2 compact | −£1,302 |
| Barcelona (Sep) | ATR 72 | £120, 1 service | £1,690 | 54 | £160, 2 compact | −£4,215 |

Criteria notes. Amsterdam is the Saab's route and the ATR earns less with more seats (5 passes). Frankfurt wants one service a day in a mid-size plane, at a £5 fare the £10 list did not offer (1 passes; the £5 steps earn their place). Geneva in September is off season and the forecast card must steer him away; in January it is the best route in the game (below). Barcelona's 3 h 45 Twin Otter legs kill it (4 passes). Every plane has a route where it is the right answer, and the Twin Otter stays the right plane for Paris (5 passes).

In season, fuel £2.00:

| Route | Twin Otter | Saab 340 | ATR 72 |
| --- | --- | --- | --- |
| Geneva, January (×1.4) | £1,410 (£140, 2 compact) | **£2,535** (£120, 2 compact) | £2,200 (£120, 1 service) |
| Barcelona, July (×1.3) | £100 | £2,080 (£120, 2 compact) | **£2,390** (£120, 1 service) |

Week 2 at fuel £1.50 against v2's figures at £1.20: Amsterdam Saab £2,240 against £2,513; Frankfurt Saab £1,054 against £1,185. The 30p of fuel costs the Saab about £110 a service.

## 4. Week 3 — Madrid, the first medium-haul route (new in v3)

Madrid is 1,350 km (4½ h in a Twin Otter, 3 h in an ATR, 1½ h in an E190). Base fare £170 by the distance rule. Fuel £1.70. The demand table was designed so that one full E190 (100) and two ATR services (140) are both real options and the fare decides between them:

| Fare | £150 | £160 | £170 | £180 | £190 | £200 |
| --- | --- | --- | --- | --- | --- | --- |
| People who want to fly | 140 | 120 | 100 | 80 | 60 | 40 |

| Fare | Demand | ATR, 1 service | ATR, 2 services | E190, 1 service | E190, 2 services |
| --- | --- | --- | --- | --- | --- |
| £150 | 140 | £4,794 (70) | **£5,608** (106) | £5,577 (98) | £789 (109) |
| £160 | 120 | £5,494 (70) | £4,343 (91) | £4,387 (84) | −£446 (94) |
| £170 | 100 | **£6,194** (70) | £2,778 (76) | £2,917 (70) | −£2,146 (78) |
| £180 | 80 | £4,444 (56) | £913 (61) | £1,167 (56) | −£4,166 (62) |
| £190 | 60 | £2,414 (42) | −£1,252 (46) | −£863 (42) | −£6,321 (47) |

Twin Otter on Madrid: best £427 a day at £190 (one service, 10¾-hour duty day). It can get there; it should not.

What this creates. The ATR at £170 with one full service is the best Madrid plan (£6,194). Two ATR services need a 14 h 40 duty day and a second crew, and only pay at £150. The E190 fills at £150 and nearly matches the ATR, but costs more to run, so on Madrid alone the ATR wins; the E190's case is every medium-haul route beyond 1,500 km (Rome 1,575, Marrakech 2,250, Athens 2,475), which the ATR cannot fly. A pupil who bought an ATR in week 2 therefore has a good week 3 without a new plane; a pupil who leases an E190 has the network. Both are defensible (5 passes). A single service cannot collect every passenger because of the day bands: at £170 the E190 carries 70 of the 100, which is the time-of-day lesson again at a bigger scale (2 passes).

Tuning option, not taken: E190 hourly cost £800 instead of £900 would lift its Madrid day by about £300 and make it a dead heat with the ATR at £150.

## 5. Safety floor (new in v3, for D26)

The rule: a sensible pupil must never run out of cash from lack of start-up capital; only a run of plainly bad plans can do it, and the game shows the projection before any day is flown.

- **Week 1.** Starting cash £2,500. The weakest plan a pupil could choose is one service at the lowest fare: Dublin £70 loses £267 a day at Friday's fuel; Paris £70 loses £53. Every plan at £80 or above on Paris, and £90 or above on Dublin, makes money with a single service, and every two-service plan at £80–£100 does. Seven days of the worst plan (−£1,869) would still leave £631, and the reserve rule (block when projected cash falls below £1,000) stops it before then.
- **Week 2.** A Saab on finance (deposit £3,000) with cash around £10,000–£14,000 leaves room for a bad week; a bad Saab plan (−£1,375 a day) is projected and blocked once it threatens the reserve. The ATR's deposit (£5,000) is affordable only to a pupil who did well in week 1, which is as intended.
- **Week 3.** The E190 lease (£1,200 a day) against its Madrid day (£5,577) is comfortable; the ATR's Madrid day (£6,194) needs no new plane.
- **Proposed game rule (Settings: negativeProjectionWarning):** if a plan's projected profit is negative, the Ready screen says so and asks the pupil to confirm before flying it. This is in the workbook as *proposed*; Bertie to confirm.

## 6. Money and the aircraft ladder (D16)

Five-year cash model, lease-and-save path (one Twin Otter; Saab week 2; E190 week 3; A320 week 8; 787 January 2031; A350 May 2031; second 787 July 2031; 747 September 2031; then one plane every two or three terms to 15 planes), every plane leased at the Finance sheet's rate, each earning a well-flown day for its size less fuel at the Market price, growth 2% a week to a ×1.4 ceiling. Rough and probably generous.

| Date | Cash in hand | Affordable outright from |
| --- | --- | --- |
| Nov 2030 | £1.0m | A220 (£1.5m) from Dec 2030 |
| Aug 2031 | £12.8m | A320 (£5m) from Apr 2031 |
| Aug 2032 | £37m | — |
| Aug 2033 | £67m | 787 (£60m) from May 2033 |
| Aug 2034 | £101m | A350 (£85m) Mar 2034; 747 (£90m) May 2034; **A380 (£100m) Aug 2034** |
| Aug 2035 | £133m | — |

Leasing is the way the fleet grows; buying outright is the late-game decision. Weeks 1–3 keep tutorial prices (Twin Otter £5,000, Saab £9,000, ATR £15,000, E190 £30,000) with the finance and lease values of v2. From the A220 up, prices are about three-tenths of real list, finance is a 30% deposit and the balance over 365 days, and lease rates are fixed (D27). The "time to afford" figure (price − cash, ÷ the average month) is therefore non-zero from the A220 on.

## 7. Deliberate threshold placements

Twin Otter 19 / 38 / 57 · Saab 34 / 68 · ATR 70 / 140 · E190 100.

- Dublin £90 → 62 (three Twin Otters, the third only with the evening). £100 → 44. £110 → 30.
- Paris £90 → 50 (two full planes only if both peaks are served). £120 → 20.
- Amsterdam £90 → 76 (two Saabs with eight spare; one ATR with six spare; four Twin Otters). £95 → 66 (two Saabs nearly full). £100 → 56.
- Frankfurt £115 → 52 (one and a half Saabs). Geneva winter £120 → 46 × 1.4 = 64 (two Saabs). Barcelona July £120 → 70 × 1.3 = 91 (one ATR plus a Saab, or three Saabs).
- Madrid £150 → 140 (two ATRs exactly; one E190 and 40 over). £170 → 100 (one E190 exactly; one ATR and 30 over).

## 8. Not yet tested

- Weekend multipliers in play (business ×0.7 Sat, ×0.6 Sun; leisure ×1.2) — the engine applies them as a demand scale; the day's best plan is unchanged in shape.
- Marrakech and every catalogue route beyond Madrid: identity and fare only; demand tables when their week is designed.
- Every aircraft from the A220 up: prices and leases set from the cash model, not from play; economics depend on medium- and long-haul rules (overnight rotations) not yet designed.
- Events' effects on a plan (they change inputs; the plan maths is unchanged) and the costShare rule from week 4.
- Reputation values (January 2031), overdraft values (September 2031), airline-type modifiers.
- A Luton pass for the routes open by April 2031 (needed only if the pupil takes the fees_rise switch).
- Years 3–5 Market rows: a repeating pattern with 5% fuel drift; not played.

## 9. Scaling, stated plainly

Fares and passenger numbers are close to real. Operating costs are about a tenth of real. Aircraft prices are at tutorial scale to the E190 and about three-tenths of real from the A220 up. Ratios are kept honest (a full plane earns about 1.5× its flight cost; a half-empty one loses; one service a day never covers the day cost on short haul). Tell the pupil: ticket prices are real, everything else is shrunk so the game moves quickly, and jets are a different world.

## 10. Open items the data is waiting on

Start date (O16: Monday 2 Sep 2030 as built, or Monday 1 Sep 2031) · grid-method option (parked) · negativeProjectionWarning (proposed) · reputation and airline-type values (January 2031) · overdraft values (September 2031) · long-haul demand tables · Luton pass.
