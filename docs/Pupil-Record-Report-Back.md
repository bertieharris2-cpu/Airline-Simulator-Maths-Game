# Report back: the pupil record and printout (D75, Workbook v5.1)

*From Claude Code to Fable and Bertie, 13 October 2026. This answers "Brief for Claude Code — The pupil record and printout".*

- **Where it is:** both game files, `airline-opening-prototype.html` and `airline-opening-studio-v2.html`. The record is in `src/opening/parts/p4zi_record.js`, and the teacher panel has a new **Pupil record** box.
- **Samples:** PDFs and HTML of one week of the Steady run, in both views, are in `docs/record-samples/`.

All three confirmations hold:
- the record keeps the working cell by cell;
- one week of the Steady run prints in both views;
- every error note in §3 fires on its own case.

Workbook v5.1 installed with 0 import errors. WorkingMethods gives each relationship its statement codes, and the record stores them with each entry.

## The three confirmations

**1. The record keeps the working cell by cell: confirmed.** `record.test.js` does this on Launch Day:
1. It types 19 × £80 into the column template, one digit a box, with a carry.
2. The first working line is 1,510, not 1,520.
3. It checks: a Query.
4. It retypes the line and checks again: Checked.

The record entry holds both attempts. For each one it keeps:
- the two given lines, the working line as typed, the carry box and the answer line;
- the answer;
- Checked or Query;
- for the Query, the note *"19 × 80 is 1,520, not 1,510: the carry 1 into the tens wasn't added."*;
- the codes NCP-3-06 · NCP-3-04 · ALG-3-08 · MON-3-02;
- the method *formal written method (column template)*.

The other places working is typed are kept the same way:
- **The Service Cost card's methods** (partition the price, scale from 100 L, make it pence, count the decimal places): each line as typed, against what it should be.
- **The fuel desk's first order:** 1,000 L × price, then × blocks.
- **Build cards:** the chips and operations in the order chosen.

**2. One week of the Steady run, in both views: confirmed.** The Steady run (the revised Studio's full chapter 1, `week.test.js`) left 72 entries: 57 calculations (11 with a Query) and 15 weeks of decisions.

`docs/record-samples/` holds:
- **`record-w15-date.pdf` / `record-w15-kind.pdf`:** week 3 (16–22 September). It has:
  - the Amsterdam flight time, with a Query ("Answer 8 hours given; correct answer 1 hour."), then right;
  - the Amsterdam tickets in the column template;
  - the Saab's Amsterdam fuel by *scale from 100 L*, with its first line boxed in red ("100 L costs £168, not £1."), then all four lines right;
  - the week's total, the projected − actual and the average a day as Build steps;
  - the week's decisions: the plan, "New route: Amsterdam; Stopped flying: Dublin", 2,000 L of fuel and a −£290 purchasing advantage, projected £14,547, actual £14,257, missed £25,166, three stars.
- **`record-w8-date.pdf` / `record-w8-kind.pdf`:** week 2. It has:
  - rent or buy (50 days, Query, then 55);
  - the Saab's Dublin fuel;
  - the first fuel order (Query, then right);
  - the reviews;
  - the decisions, with the Saab's lease and the crew-sickness choice.
- **`launch-day-column-template.pdf`:** the column template typed digit by digit, from `record.test.js`.

The grouped view puts each kind of maths under its WorkingMethods heading with its codes once, then lists the decisions.

**3. The error notes fire on the §3 cases: confirmed.** `record.test.js` checks each one:

| §3 case | The note printed |
| --- | --- |
| Place value / shift | Right digits; the answer should be ten times bigger — the × 10 shift was missed. |
| Decimal point | 46,800 is pence; the bill is £468. |
| Partial product wrong | 225 × 40p is £90, not £80. |
| Carry missed / added twice | A carry was missed: the carry 1 into the hundreds wasn't added (£3,420, not £3,320). · A carry was added twice: the hundreds is 1 too many. |
| Column misaligned | A line is not shifted: 76 should be 760 (38 × 20) — move it one place to the left. |
| Subtraction exchange | 3,420 − 1,830: the hundreds needed exchanging. |
| Build errors | Wed 4 is missing from the total. · Mon 2 is counted twice. · × is the wrong operation: a total adds the amounts together (+). · ÷ 2 halves it; an average shares between all 7 days. |
| Transposed digits | Two digits are the wrong way round: £3,240 should be £3,420. |
| None matches | Answer £2,999 given; correct answer £3,420. |

## What is recorded

- **Calculation entries** come from every place the pupil answers a sum:
  - the sign-off cards (Calculate and Build);
  - the Service Cost card's fuel line;
  - the column template and the other cell tables;
  - the rent-or-buy box;
  - the first fuel order;
  - the weekly, period and chapter reviews;
  - the month-end audits.
- **Each calculation entry holds:**
  - the game date, the week, the chapter and the document (for example *Fuel invoice: Saab 340 on Dublin*, *Week 2 accounts: Planned against what happened*);
  - the relationship and its level;
  - the question as set (*230 litres × £1.47*);
  - the method;
  - each attempt with its working;
  - the answer given and the correct answer;
  - Checked / Query, the number of attempts and the time taken;
  - the statement codes.
- **An attempt** is a Check that reached a verdict. A blank box, or a "type the number of days" message, is not counted.
- **Decision entries** come at each week's end (or each period's):
  - the standing plan (each aircraft's flights with times and Days);
  - the fares and on board;
  - "Changed this week" (new and stopped routes, services, fares, times, aircraft, on board);
  - events and choices with their cost;
  - news acted on (an announced item on a route the plan changed);
  - aircraft leased or bought;
  - fuel bought and the fuel purchasing advantage;
  - projected, actual and missed;
  - stars.
- **Teacher notes:** a box a week in the teacher panel. A note prints under its week's decisions, or on its own if the week is still open.
- **The pupil's name** comes from the teacher panel; without one, the airline's name is used.

## The printout

The teacher panel's **Print record** offers:
- **by date** or **by kind of maths**;
- a week, a chapter or everything.

It opens a plain A4 page with a Print button.
- **Colours, as the brief asks:**
  - question black;
  - working and answers blue (#1F5FBF);
  - the tick green (#2E7D4F);
  - the boxed wrong cell, the note and *Query* red (#C8442B).
- **Formal layouts** are monospaced, so the columns line up.
- **The grouped view** has a heading per WorkingMethods relationship, with its statement codes once, then the entries by date, then the decisions week by week.

## Interpretations and things to know

- **The codes are stored with each entry** when it is made, so changing the mapping later doesn't rewrite history. The grouped view's heading lists the codes its entries carry.
- **A Calculate sign-off card has an answer box and no working.** Its method is the one the card suggests, printed "(suggested)". The working a pupil types is recorded wherever there is a template.
- **Squared paper is a drawing:** the record notes that method was used, not the strokes.
- **Time taken** runs from when the sum is first on screen to its Check. If the game is reloaded, the clock starts at the first attempt.
- **The planner's practice card** ("Practising: nothing is recorded") is not a sign-off and is not recorded.
- **Missed profit** comes from the Sunday review's best-plan sweep. Week and month periods (from day 29) have no sweep of their own, so their decision blocks show projected and actual only.
- **Data:** v5.1's six new WorkingMethods rows have "live" in the notes column. The importer ignores it.

## Also in this push: a smoother first take-off

The launch-day take-off is one continuous motion:
- the plane taxis in and eases to a stop, lines up, accelerates evenly down the runway, rotates near the middle and climbs out;
- it runs at 60 frames a second on transforms, drawn from the start time, so the whiteboard and a redrawn screen stay in step;
- before, the animation eased into and out of each stage, so the plane slowed to a stop between them.
