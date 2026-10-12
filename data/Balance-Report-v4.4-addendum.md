# Balance Report — World Workbook v4.4 (addendum)
*Travels with Airline-World-Workbook-v4.4.xlsx (12 Oct 2026). Carries D52–D55: the week-at-a-time opening, both routes from Launch Day, the week-shift, dearer tutorial planes, higher day costs, the missed-profit line and use-it-or-lose-it. Weeks 1–4 re-run at the new costs.*

## What this means (for Bertie)

The opening is now played a week at a time, and poor plans cost money. A Twin Otter now costs £900 a day whether or not it flies well, so a lazy plan (one service at a low fare) loses about £350 a day instead of scraping £50, and the best plans earn about £950 a route or £1,700 for the mixed day — enough to make a good week feel good and a bad one hurt. The second plane in week 2 can no longer be bought from one week's profit: the pupil rents it or takes the launch-deal finance, and buys outright around week 4 or 5. On the two opening routes a second plane barely pays in week 2 (about £580 a day more, against £400 rent), and comes into its own in week 3 when Amsterdam opens, which is a fair lesson in itself. Every weekly review shows what the best plan available would have earned, and from week 3 a neglected route loses a tenth of its passengers a week to Red Kite.

## 1. Changed rules

- Aircraft day costs: Twin Otter £900 (was £600), Saab £1,200 (£800), ATR £1,800 (£1,200), E175 £3,000 (£2,000), E190 £3,500 (£2,500). Jets from the A220 up unchanged.
- Tutorial prices 2½×: Twin Otter £12,000 (first one still £2,500), Saab £22,000, ATR £36,000, E175 £50,000, E190 £70,000. Rents unchanged (£250 / £400 / £650 / £900 / £1,200 a day), so rent-or-buy ≈ 55 days for every tutorial plane. Launch-deal finance ≈ 30% down, then daily payments totalling about price + 5%.
- Buy is greyed out until cash ≥ price + reserve, with "still to save" and "days at your rate" shown.
- Missed-profit line in every weekly review (engine plan sweep with the pupil's planes and open routes).
- Use-it-or-lose-it from day 15: a route with no service for a week, or under 50% full all week, loses 10% of its passengers the next week; recovers 5% a week once flown properly. The review names the route.
- No crew cost in the opening (D51). Event costs fixed through week 4; costShare from day 29.

## 2. Week 1 (Twin Otter, day cost £900, fuel £1.30 Wednesday)

| Plan | Profit a day |
| --- | --- |
| Paris £90, morning + evening (best) | **£978** |
| Dublin £90, 3 spread (best) | **£953** |
| Mixed day Paris 07:00 / Dublin 10:20 / Paris 18:00, £90 | **£1,709** (£1,751 at Monday's free-fuel price) |
| Paris one service at £70 / £80 / £90 / £100 | −£341 / −£151 / £39 / £229 |
| Dublin one service at £70 / £80 / £90 / £100 | −£549 / −£359 / −£169 / £21 |
| Worst plan on the fare list (Paris £110, 4 compact) | −£1,189 |

Criteria: £90 still beats £80 and £100 on both routes; compact timetables still lose; the mixed day still beats either route alone; a single-service day now loses at every fare below £90 on Paris and £100 on Dublin (criterion 6, costs big enough to matter). Safety floor: starting cash £2,500; a pupil flying two or more services at £80+ ends the week with more than he started; a pupil flying one service at £70 all week would lose £2,400 and is stopped by the reserve block around Thursday, with the warning before that (F2).

Launch Day projection, mixed day, free fuel Mon–Tue: about £11,500 for the week before Red Kite and the storm.

## 3. Week 2 (fuel £1.50), the second plane on Dublin and Paris

| Arrangement | Profit a day |
| --- | --- |
| One Twin Otter, mixed day | £1,625 |
| Twin Otter on Paris (morning + evening) + Saab on Dublin (£80, 2 spread, 34 + 24) | £930 + £1,275 = **£2,205** |
| Twin Otter on Paris + second Twin Otter on Dublin (3 spread) | £930 + £845 = £1,775 |
| Twin Otter on Paris + ATR on Dublin (one service) | £930 + £285 = £1,215 |

The Saab adds about £580 a day over the mixed day; rent is £400, finance £500 a day. So in week 2 the second plane pays a little, and the ATR is the wrong plane for routes this size. The gain arrives in week 3 (Amsterdam Saab £2,000). Rent-or-buy: 22,000 ÷ 400 = 55 days.

## 4. Week 3 (fuel £1.70; Geneva ×0.5, Barcelona ×1.1)

| Route | Twin Otter | Saab 340 | ATR 72 |
| --- | --- | --- | --- |
| Amsterdam | £1,242 (£95, 3 spread) | **£2,000** (£90, 2 spread) | £843 |
| Frankfurt | £301 (£140, 1) | **£596** (£105, 1) | −£798 |
| Geneva (Sep) | −£164 | −£504 | −£1,898 |
| Barcelona (Sep) | −£65 | **£1,554** (£150, 1) | £910 |

Geneva loses on every plane in September: the forecast card and the missed-profit line should steer him away until winter. Worst plans on the fare list run from −£631 (Twin Otter) to −£6,769 (ATR on Geneva): the ATR is now a plane that punishes a pupil who buys it too early.

## 5. Week 4, Madrid (fuel £1.80)

| Plane | Best | Passengers |
| --- | --- | --- |
| ATR 72 | **£5,486** (£170, 1 service) | 70 |
| E175 | £4,407 (£160, 1) | 80 |
| E190 | £4,388 (£150, 1) | 98 |
| Twin Otter | £73 (£190, 1) | 19 |

Unchanged in shape from v4.1 §4, about £700 lower each for the day costs. The E175 at £50,000 is rented (£900 a day against a £4,400 day).

## 6. Not yet tested

The missed-profit sweep as the engine will compute it (same method as this report); use-it-or-lose-it over a run of weeks; weeks 5–13 at the new day costs (v4.1 figures fall by £300–£1,000 a day; shapes unchanged); everything from chapter 2 on.

## 7. For Claude Code

Read Calendar `weekPhase` (plan / run / review), Settings `openingPlayMode`, `teacherDayByDay`, `weeklyReviewFromDay`, `missedProfitLine`, `neglect*`, `practiceQuestionsPerDay`, `launchDaySums`; Aircraft `dayCost` and `listPrice`; Finance tutorial rows; Routes `unlockDay`; Aircraft `shopFromDay` (E175/E190 22; A220/A320/737 57). Chapter-1 events now fall on their weeks' Mondays.
