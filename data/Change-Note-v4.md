# Change Note for Claude Code — Workbook v4 import
*From Fable, 6 October 2026 (evening). Supersedes the v3 note where they differ; everything in the v3 note not mentioned here still stands. Goes with Airline-World-Workbook-v4.xlsx and Balance-Report-v4.md. D-numbers are Design Register decisions; F-numbers are Fable's calls awaiting Bertie's confirmation.*

## What this means (for Bertie)

Since the v3 note this morning we have settled how the whole game is shaped, so this note is bigger in scope than it is in work. The game now runs in six chapters over five years, each opening with a few days of hand arithmetic, then widening to weeks and months, then ending with a review. There are eight rules for when a sum is done by hand and when the model does it. Four planes are added and one removed, prices are set from the cash curve rather than real life, and the money mechanics arrive one per chapter: leasing in chapter 2, buying in chapter 3, finance in chapter 4. Snack values move into the workbook, hunts and challenges have sheets, and the start date is Monday 2 September 2030. In play, the opening three weeks are the same as v3 with one more plane in the shop in week 3.

---

## 1. New sheets to import

| Sheet | What it carries | Engine use |
| --- | --- | --- |
| **Chapters** | Six rows: start, end, set-up days, run cadence, review date, mechanics arriving, hand sums planned, status | Drives pacing: day-by-day play for `setUpDays` from `start`, then `runCadence`; the review screen fires on `reviewDate`. Replaces the prototype's fixed beat list. |
| **HandSumRules** | Eight rules with triggers | Replaces the single "one new figure a day" rule in the Cost screen (section 3). |
| **Catering** | Four snack options with price, take-up, stock cost, free cost per passenger | Replaces the hard-coded options at p4a_core.js:193 (reported missing in v3 — now supplied, F3). |
| **Hunts** | Seven first-draft hunts: date, host document, the planted error, what the pupil checks, consequence if missed | Spot-the-mistake component (CR3 revived, D39). Build the component; the content stays `placeholder` until each chapter is designed. |

## 2. Settings — new and changed keys

| Key | Value | Rule |
| --- | --- | --- |
| startDate | 2030-09-02 | Confirmed as Fable's call F1 (Bertie may still move the game to 2031). |
| gameEndDate | 2035-08-31 | Chapter 6 ends; Market runs to week 416 (Aug 2038) so skips can overrun. |
| reportCadence | follows the time step | Daily results in day play; weekly report in week play; **monthly from 2030-12-02 for the rest of the game**. Quarterly is a comparison task, not a report (next line). |
| quarterlyTaskFromDate | 2033-09-06 | A separate data task: group the monthly figures into quarters, compare the same quarter year on year, averages of three months. Carries into the five-year review. |
| leaseFromDate / buyFromDate / financeFromDate | 2031-01-06 / 2031-09-02 / 2032-09-07 | For planes above the tutorial tier. Tutorial planes (dhc6, saab340, atr72, e175, e190) can be bought from their shopFromDay and rented from day 8/15 as the Finance sheet says. The shop shows only the options whose date has passed. |
| overdraftDailyCharge | 0 | No charge (F7). Overdraft is a safety net from 2031-09-02 up to `overdraftLimit`; show "Overdrawn £X" on the statement, nothing else. Before that date the cashReserve block (D26) applies. |
| negativeProjectionWarning | TRUE | Live (F2): if a plan's projected profit is negative, the Ready screen says so and asks to confirm. |
| fuelHandSumPriceStep / fuelHandSumLitresShare | 0.50 / 0.25 | HandSumRules rule 2 thresholds. |
| snacksHandSumOnce | TRUE | Snack sums by hand on day 2 only. |
| captainsChallengeCadence | one a term from 2031-01-06 | Challenges sheet has `fromDate` per challenge; present the next unused one as an optional side task once per term; the reward applies if correct. |
| huntPerReview | 1 | Plus the dated run-phase hunts in the Hunts sheet. |
| extrasForType | Value | From 2031-01-06, a Value airline gets the extras mechanic; values arrive in a later Catering/Extras pass (D37). Build the hook, show nothing until values exist. |
| marketingFromDate | 2033-09-06 | Build the hook; values later (D38). |
| investor / fleetRenewal | none | No code paths. |
| leaseRule | price ÷ 1000 a day from the A220 up | Informational; the Finance sheet carries the values. |

## 3. Hand sums — the rules the Cost / Test screens follow (D34)

Replace "one new figure a day" with the eight rules in HandSumRules. In engine terms:

1. **First time**: when a relationship (`skill` in data-tools) fires for the first time, it is Calculate regardless of chapter.
2. **Changed enough**: a relationship already demonstrated is Calculate again only when its trigger says so. Fuel: `|price − priceLastAsked| ≥ fuelHandSumPriceStep` or `|litres − litresLastAsked| / litresLastAsked ≥ fuelHandSumLitresShare`. Revenue: on a route or plane the pupil has not flown before. Everything else: never, unless the teacher sets Calculate.
3. **Review totals**: on every `Chapters.reviewDate`, total revenue, total costs, profit, and projected − actual are Calculate (the model shows the lines, the pupil totals them). Rule 3 overrides rule 2.
4. **× and ÷ protected**: a new route asks `passengers × fare` and `distance ÷ speed` by hand once; a new plane asks `seats × fare` and `price ÷ leaseDaily` (or `(price − cash) ÷ weeklyProfit`) once.
5. **Snacks** once (day 2), then Model.
6. **Timetable / Test plan** changes never trigger a hand sum.
7. **Challenges** and 8. **Hunts** as the sheets say.

The teacher's Calculate / Build / Model override still wins over every rule. Keep a per-skill log (`lastAsked` inputs) so rule 2 can be evaluated.

## 4. Aircraft, Finance, Routes

- **Aircraft**: new rows e175 (live, shopFromDay 15), b757 (placeholder, 127), a340 and b777 (later, 366). concorde `removed`. Prices: dhc6 £5,000 (deal £2,500), saab340 £9,000, atr72 £15,000, e175 £20,000, e190 £30,000, a220 £300,000, a320 £400,000, b737 £400,000, b757 £1.5m, b787 £6m, a340 £8m, b777 £12m, a350 £15m, b747 £20m, a380 £30m. shopFromDay: a350/a340/b777 366 (chapter 3), b747/a380 736 (chapter 4).
- **Finance** (restructured columns): `cashPrice, leaseDaily, financeDeposit, financeWeeklyPayment, financeWeeks, financeTotalPaid, leaseFrom, buyFrom, financeFrom`. Tutorial rows keep the launch-deal daily finance (12–16 **days**; keep the existing day-based code for them). From a220 up: lease = price ÷ 1,000 per day; finance = 30% deposit then weekly payments for 52 weeks, rounded to £1,000. A leased plane is a daily cost line and can be returned at a month end; a financed plane is a deposit now and a weekly line. `leaseFrom/buyFrom/financeFrom` gate the shop buttons.
- **Routes**: rak (Marrakech) is now `live`: 2,250 km, base £240, fares 220–260, demand `220:110|230:100|240:90|250:75|260:60|270:45`, unlockDay 22. Jet only (ATR range 1,500).
- **"Time to afford"** = (price − cash) ÷ average weekly profit, in weeks, rounded up; shown from buyFromDate.

## 5. Calendar, Market, Events, Challenges, Mechanics

- **Calendar** unchanged from v3 (days 1–21).
- **Market** extended to week 416 (Aug 2038), repeating the year-2 pattern with fuel × 1.05 a year; chapter headlines on weeks 105, 157, 209; years 6–8 are overrun room only.
- **Events**: concorde_offer and fleet_renewal `removed`; a380_offer text now introduces finance; long_haul_open names the 757; new `quarterly_task` (2033-09-06) and `five_year_review` (2035-08-31) as dated hooks.
- **Challenges**: `fromDate` column (one a term from 2031-01-06); first two `live`, the rest `placeholder`.
- **Mechanics**: rewritten around chapters — set-up dates, review dates, and the two standing rules.

## 6. Interface consequences

- Chapter banner at each `Chapters.start`; review screen at each `reviewDate` with the hand-totalled accounts and one hunt.
- Reports: the same monthly report shape from December 2030 to the end; the quarterly comparison is a separate screen from September 2033 (group months into quarters; same quarter across years; averages).
- Shop: lease / buy / finance buttons appear by date; the A380 card walks through the finance sum the first time.
- Hunts: a document (statement, invoice, board) with one planted error; find-it-or-miss-it with the stated consequence.
- Captain's challenge card: optional, once a term, with reward.
- Fuel: the Cost screen asks for the fuel figure only when rule 2 fires; otherwise it is shown.

## 7. Report back

As the v3 note, plus: confirm the Chapters sheet drives pacing (no beat list left in code); confirm HandSumRules 1–4 are implemented with a per-skill `lastAsked` log; list any value marked `placeholder` the game needs now.
