# Chapter 4, "The ultimate plane": push 1 (Workbook v5.5/v5.6, D82–D85)

*Claude Code, 15 October 2026. This answers Fable's Change Note v5.5 (14 Oct) and Balance Report v5.5. The code is in `src/opening/parts/p4zs_ch4.js`; the test is `src/opening/tests/chapter4.test.js`.*

## What this means (for Bertie)

Chapter 4 now plays from chapter 3's end card to its review on 31 August 2033.

- **1–5 September 2032: "The end of the summer".** The standing plan flies by itself, as Christmas does between chapters 1 and 2.
- **Monday 6 September.** "What's new" explains finance, the deposit, the monthly payment and "does it fill?". Then the offer page sets the A380 and the 747 side by side on Hong Kong and Los Angeles. For each plane and route it shows:
  - the model's best fare;
  - the passengers ÷ the seats, with 20 seats lit;
  - the profit a day before and after the payments.

  The pupil takes the A380, takes the 747, or neither. Neither leaves both planes in the Fleet desk's shop.
- **The finance sum** comes first, a Calculate the first time and a Build after. Step 1 is "£60,000,000 − £20,000,000 =", step 2 is "£40,000,000 ÷ 40 =", then the check "40 × £1,000,000 + £20,000,000 = £60,000,000". It has the paper answer boxes, sum numbers and two tries from D86.
- **Payments.**
  - The deposit is paid on the day.
  - The payments come on the first of each month: "Finance: A380 £1,000,000 (month 1 of 40)".
  - The fleet shows "on finance: £1,000,000 a month, 39 of 40 payments to go".
- **Each month's review** has a "Does the A380 fill?" panel, month by month.
- **The A380 launch project.** From 4 October a Project button on HQ opens the board's letter, the choices and the portfolio (text, and pictures kept in the browser). "Hold the airline while I work" stops the run until the pupil lets it fly on. "Send to the board" keeps the launch date for the result to apply from.
- **The review on 31 August 2033** has hunt h5: the A380's finance line shows one payment too many.

## Report back

| Fable asked | Result |
| --- | --- |
| The deposit on 6 Sep and the first payment on 1 Oct 2032 | **Yes.** Cash falls by £20,000,000 on 6 September. The charges list has 40 payments, the first on Friday 1 October 2032 (day 761), then the first of each month. By the review there have been 11 (October to August). |
| Hong Kong at £830 carrying 442 of 500 at three stars, and 500 at 4½ | **500 at 4½: yes. 442 at three stars: no.** The game's demand at £830 is 480 (the Routes sheet's demandAtFare). From October, with Hong Kong's growth ×1.15, 552 want to fly, so an A380 fills even at three stars. The "58 short" in the route's story does not come out of the sheet's numbers. What should make it 442 (a factor we have not got)? |
| The 747 path against Balance Report §2, within £50 | **Yes, within £1 a day** on Hong Kong, for both the 747 and the A380 at 3★ and 4½★. That holds once the conditions match the report: fuel at £2.35 and no on-board sales or airline-type extras. In play the figures differ for three reasons. The Market sheet's fuel on 1 October 2032 is £2.49. A plane earns on-board sales (747 about £1,840 a day, A380 about £2,300). A Value airline adds bag fees (about £1,600 and £2,000). |
| The Project button present and the pause working | **Yes.** It shows on HQ from 4 October 2032 once a big plane is in the fleet. Hold disables Start; letting it fly on enables it again; the choices and words are kept in the save. |
| h5 on 31 Aug 2033 | **Yes**, before the year-3 accounts. Value finds it ("Found and fixed"). Premium misses it, and one more payment is added after the 40th ("Repayments run a month longer"). |

## How each rule is read (please check)

1. **The days between the chapters.** Chapter 3's review is 31 August, so 1–5 September fly as one run. Then 6–12 September (the seven Calendar rows) are played a day at a time, then months from Monday 13 September. Was `chapter4SetUpDays` 5 meant as the gap (1–5 September) or as five set-up days? The game follows the Calendar rows.
2. **Payments are not a day cost.**
   - The plan's projection and the "profit a day after the payments" use the payment × 12 ÷ 365 (about £32,877 a day for the A380) only as a guide.
   - The cash goes on the first of the month through the charges ledger, as part of that day's costs. Nothing stops it, so it can take cash below zero, into the overdraft. The "before anything else" order is not modelled separately.
   - The A220, A320 and 737 rows still carry weekly terms in the monthly columns, so they stay weekly.
3. **The offer page** chooses the model's best fare for each plane on each route, one service, the overnight rotation's two days averaged. Taking a plane goes to the pay page with Finance chosen and the plane on that route. There is no rent-or-buy sum there: renting opens the next day, and the offer is finance.
4. **Does it fill?** is "passengers the model flies at that fare ÷ seats", with "N want to fly" beside it. The review panel shows each month's route figures for the big plane.
5. **The campaign** is hooks only, as asked.
   - Choices: route, audience, channel, budget, length and launch date.
   - Portfolio: livery and cabin, poster or advert, the offer, an extra.
   - Pictures go in the browser's IndexedDB, not the save code.
   - `campaignDemand(route, day)` is the entry point. It returns ×1 until a scored result is stored, then the result's multiplier from the launch date for the chosen length, fading by 20% a week after.
6. **h5's line** is "11 × £1,000,000 = £12,000,000" (the right figure is £11,000,000). The sheet's "12 payments … £13,000,000" assumes a September payment; the first payment is 1 October. The pupil's hint counts the payments from October to August; the sheet's `pupilChecks` says "÷ 52".

## Data to look at

- **Events `a380_offer` text** still says "30% down, the rest over a year". The offer page uses the `effects` text (£20m down, £1m a month for 40 months).
- **Challenge 5** says 52 weeks in its story but asks 68 × 54. Challenges 5–6 are not built: challenges 3–6 wait for chapter 3's push 2.
- **storm3 and ash_cloud3** reuse storm2/ash_cloud2's option rows. Those events' mechanics are chapter 3 push 2, so they are headlines for now.
- **Red Kite's A380** (March 2033) is its RouteNews item only.

## Not in push 1, and a known slow spot

- **Not built:** the campaign's screens for the AI and the teacher's rubric (its own brief); a second A380; challenges 5–6.
- **Slow month-ends.** Chapter 4 month-end audits take 20–40 seconds. The audit runs the best-plan sweep, about 12,000 projections with five aircraft, each slower than in chapter 1. It is the same code as chapters 2–3, but the fleet is bigger. A faster sweep is the next thing to fix: fewer fare trials per timetable, and caching the projections.

## Tests

<!--TESTS-->
