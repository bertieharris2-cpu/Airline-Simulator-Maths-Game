# Balance Report — World Workbook v4.1 (addendum)
*Travels with Airline-World-Workbook-v4.1.xlsx (6 Oct 2026, late). Adds to v4: demand tables for the ten routes that open in weeks 5–13 of chapter 1. Nothing else in the workbook changed.*

## What this means (for Bertie)

Every route the pupil can reach in the autumn now has numbers behind it, and each pair was built to make a different decision. Brussels asks frequency against size (four Twin Otter services or two Saabs). Berlin is a Saab route where a jet half-empties. Milan is a dead heat between two Saab services and one ATR. Rome and Lisbon split: the E175 fills Rome, but Lisbon's smaller pool suits a Saab until the summer. Athens is a near tie between the two small jets, with the A320 only paying in summer. Istanbul is the E175's best autumn route. Edinburgh is a modest filler. Reykjavik breaks even in autumn and pays in winter, like Geneva. Cairo is a one-service-a-day jet route that suits the E175 in autumn and the E190 in winter. Fuel is dear by now (£1.90–£2.40), which is why the big planes keep losing on these pools: that is the intended lesson of the autumn.

## 1. How testing was done

As v4 §1. Each route was run at the Market sheet's fuel price for the week it opens, with the season multiplier for September–November where its archetype has one (leisure_short and sun_holiday ×0.9), against every plane in the shop that week with the range to fly it. Seasonal routes were also run in season (×1.3 or ×1.4) at fuel £2.20. Fare steps are £10 on these routes (D28 gives £5 steps to the week-2 routes only).

## 2. Results


## Brussels (225 km, business_shuttle, opens week 5, fuel £1.90, season x1.0)
| Plane | Best plan | Profit | Passengers | Worst on list |
|---|---|---|---|---|
| Twin Otter | £80, 4 spread | £1,751 | [19, 19, 18, 11] | £-1,804 |
| Saab 340 | £70, 2 spread | £2,058 | [34, 33] | £-2,075 |
| ATR 72 | £70, 1 compact | £1,473 | [55] | £-3,588 |
| E175 | £70, 1 compact | £545 | [55] | £-4,901 |
| E190 | £70, 1 compact | £-184 | [55] | £-6,314 |

## Berlin (900 km, city_break_mixed, opens week 5, fuel £1.90, season x1.0)
| Plane | Best plan | Profit | Passengers | Worst on list |
|---|---|---|---|---|
| Twin Otter | £150, 1 compact | £341 | [19] | £-1,143 |
| Saab 340 | £130, 1 compact | £1,440 | [33] | £-2,355 |
| ATR 72 | £110, 1 compact | £107 | [41] | £-6,094 |
| E175 | £110, 1 compact | £-1,206 | [41] | £-11,799 |
| E190 | £110, 1 compact | £-2,619 | [41] | £-15,951 |

## Milan (900 km, business_shuttle, opens week 5, fuel £1.90, season x1.0)
| Plane | Best plan | Profit | Passengers | Worst on list |
|---|---|---|---|---|
| Twin Otter | £150, 2 spread | £1,032 | [19, 19] | £-488 |
| Saab 340 | £130, 2 compact | £3,555 | [34, 31] | £-615 |
| ATR 72 | £120, 1 compact | £3,277 | [65] | £-4,354 |
| E175 | £110, 1 compact | £2,049 | [72] | £-9,769 |
| E190 | £110, 1 compact | £636 | [72] | £-13,921 |

## Rome (1575 km, leisure_short, opens week 6, fuel £2.00, season x0.9)
| Plane | Best plan | Profit | Passengers | Worst on list |
|---|---|---|---|---|
| Saab 340 | £210, 1 compact | £2,965 | [34] | £1,605 |
| E175 | £170, 1 compact | £5,055 | [80] | £-10,025 |
| E190 | £170, 1 compact | £3,240 | [82] | £-15,460 |
In season (x1.3, fuel £2.20): best E175 £170, 2 compact → £7,292 ([80, 55])

## Lisbon (1575 km, leisure_short, opens week 6, fuel £2.00, season x0.9)
| Plane | Best plan | Profit | Passengers | Worst on list |
|---|---|---|---|---|
| Saab 340 | £200, 1 compact | £2,635 | [34] | £1,615 |
| E175 | £170, 1 compact | £2,260 | [63] | £-12,865 |
| E190 | £170, 1 compact | £115 | [63] | £-18,300 |
In season (x1.3, fuel £2.20): best E175 £180, 1 compact → £5,518 ([80])

## Athens (2475 km, leisure_short, opens week 8, fuel £2.10, season x0.9)
| Plane | Best plan | Profit | Passengers | Worst on list |
|---|---|---|---|---|
| E175 | £270, 1 compact | £9,403 | [80] | £-2,044 |
| E190 | £250, 1 compact | £9,544 | [100] | £-7,863 |
| A320 | £240, 1 compact | £6,320 | [113] | £-17,421 |
In season (x1.3, fuel £2.20): best E175 £250, 2 compact → £16,811 ([80, 80])

## Istanbul (2475 km, long_haul_mixed, opens week 8, fuel £2.10, season x1.0)
| Plane | Best plan | Profit | Passengers | Worst on list |
|---|---|---|---|---|
| E175 | £270, 1 compact | £8,863 | [78] | £-140 |
| E190 | £240, 1 compact | £7,358 | [95] | £-5,958 |
| A320 | £240, 1 compact | £2,080 | [95] | £-15,516 |

## Edinburgh (450 km, city_break_mixed, opens week 9, fuel £2.20, season x1.0)
| Plane | Best plan | Profit | Passengers | Worst on list |
|---|---|---|---|---|
| Twin Otter | £100, 2 spread | £668 | [19, 19] | £-2,238 |
| Saab 340 | £90, 1 compact | £825 | [32] | £-3,555 |
| ATR 72 | £90, 1 compact | £-172 | [32] | £-6,343 |
| E175 | £90, 1 compact | £-1,269 | [32] | £-8,331 |
| E190 | £90, 1 compact | £-2,266 | [32] | £-10,819 |
| A320 | £90, 1 compact | £-4,062 | [32] | £-15,003 |

## Reykjavik (1800 km, sun_holiday, opens week 10, fuel £2.30, season x0.9)
| Plane | Best plan | Profit | Passengers | Worst on list |
|---|---|---|---|---|
| E175 | £180, 1 compact | £-2,224 | [42] | £-12,023 |
| E190 | £180, 1 compact | £-4,766 | [42] | £-16,607 |
| A320 | £180, 1 compact | £-9,022 | [42] | £-24,119 |
In season (x1.4, fuel £2.20): best E175 £180, 1 compact → £1,999 ([65])

## Cairo (3600 km, sun_holiday, opens week 12, fuel £2.40, season x0.9)
| Plane | Best plan | Profit | Passengers | Worst on list |
|---|---|---|---|---|
| E175 | £330, 1 compact | £7,681 | [77] | £-1,284 |
| E190 | £330, 1 compact | £2,989 | [77] | £-5,976 |
| A320 | £330, 1 compact | £-4,667 | [77] | £-13,632 |
In season (x1.4, fuel £2.20): best E190 £350, 1 compact → £12,782 ([98])

## Retuned: Edinburgh and Reykjavik
edi Twin Otter £100, 2 compact, £918, [19, 19]
edi Saab 340 £100, 1 compact, £1,145, [32]
edi ATR 72 £90, 1 compact, £168, [36]
edi E175 £90, 1 compact, £-929, [36]
edi E190 £90, 1 compact, £-1,926, [36]
kef E175 £200, 1 compact, £-19, [49]
kef E190 £200, 1 compact, £-2,561, [49]
kef winter E175 £200, 1 compact, £5,444, [76]
kef winter E190 £200, 1 compact, £2,956, [76]


## 3. Deliberate threshold placements

Twin Otter 19 / 38 / 57 / 76 · Saab 34 / 68 · ATR 70 · E175 80 / 160 · E190 100 · A320 150.

- Brussels £80 → 70 (four Twin Otters nearly full, or two Saabs with two spare). £70 → 84.
- Berlin £130 → 60 (a Saab nearly twice over; a jet at three-quarters).
- Milan £130 → 90 (two Saabs with 22 spare; one ATR with 20 left behind). £120 → 100.
- Rome £170 → 130 × 0.9 = 117 (one E175 full and 37 left; one E190 full); in summer 169 (two E175s).
- Lisbon £170 → 90 in autumn (one E175 at 63 of 80); in summer 130 (one E175 full).
- Athens £260 → 150 × 0.9 = 135 (one E175 or E190 full; A320 at 113 of 150); in summer 195 (one A320 full with 45 left, or two E175s).
- Istanbul £260 → 125 (one E190 full; one E175 full with 45 left).
- Edinburgh £100 → 58 (three Twin Otters' worth; one Saab full with 24 left).
- Reykjavik £220 → 58 × 0.9 = 52 in autumn (E175 at 65%); in winter 81 (one E175 full).
- Cairo £350 → 90 × 0.9 = 81 (one E175 full); in winter 126 (one E190 full with 26 left).

## 4. Criteria

(1) The cheapest fare wins on none of the ten at the best plan except Brussels for the Saab, where the pool is big enough to fill two planes at £70; everywhere else a middle or upper fare wins. (2) Compact timetables win on the one-service routes, as they should when a plane flies once; Brussels and Milan want the evening. (3) The extra service pays on Brussels (Twin Otter ×4) and in-season Rome and Athens, and nowhere else in autumn. (4) Ten routes, ten different best plans. (5) The A320 is never the best plane on any autumn route and loses on seven of them; the E190 is best only on Cairo in winter. (6) Fares are multiples of £10 and the arithmetic stays at two-digit × three-digit.

## 5. Not yet tested

New York, Dubai and every route beyond (chapter 2 onwards); the A320's economics on a route that actually fills it (none in the autumn: it needs chapter 2's pools); Edinburgh and Berlin in winter; the week-2 Luton pass.

## 6. Note for Claude Code

The ten routes are `live` in Routes with `unlockDay` 29, 29, 29, 36, 36, 50, 50, 57, 64, 78. RouteCatalogue rows for them are `moved to Routes`. Reykjavik keeps the catalogue id `rek`.
