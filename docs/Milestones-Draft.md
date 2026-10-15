# Teacher milestones: the draft list (15 Oct 2026)

Bertie asked for milestones so pupils don't coast on one plan, with rewards given outside the game. His choices:
- **Teacher only.** Nothing appears on the pupil's screen.
- **External rewards only.** No money or stars change in the game.
- **A draft list now.** Fable finalises it in a `Milestones` sheet.

The code is `src/opening/parts/p4zq_milestones.js`; the tests are `src/opening/tests/milestones.test.js` and the chapter runs.

## Where the teacher sees them

**Teacher panel** (Ctrl+Shift+T): a **Milestones** section sits below *Pupil record*.
- Each chapter played so far has a table with these columns: the milestone, what it takes, when it was first reached (and how many times since), one line of evidence, and an **Awarded** tick.
- The tick is kept in the save code.
- The heading says how many milestones are reached and how many are still to award.

**Record printout:** a Milestones table after the heading, for the range chosen (a week, a chapter or everything). It shows the date, the evidence and the Awarded tick.

## How a change is judged (the guard against coasting and against fiddling)

- **What counts as a change.** The plan is every flight with its time and days, the fares and the on-board offer. A week or month counts as a change only if its plan differs from **both** of the two before it. Moving a fare up, then back, then up again counts once.
- **Board reviews.** A change made while the board is waiting for one does not count.
- **Which periods are judged.** Only weeks and months wholly inside a chapter, from its start to its review. The Christmas holiday is not judged.
- **How often.** Each milestone is reached once a chapter. Later times add to "times", so a teacher can reward again.

## The list

| Milestone | Chapters | What it takes | How it is measured | Default |
| --- | --- | --- | --- | --- |
| Fare tester | 1–3 | Changed a fare on a route they fly and kept it for the whole week or month. | A counted change of a fare on a route flown before and after; every day of the period flew the new fare. | — |
| Full plane | 1–3 | A route at least 90% full over a week or month, at a fare above its starting fare, and at a profit. | Passengers ÷ seats over the period, at least 5 flights a week. "Above its starting fare" is needed because a Twin Otter fills at £90 by itself. | 0.9 |
| On target | 1–3 | In a week or month with a new plan, the profit came within 5% of the projection. | The difference between actual and projected profit, divided by the projection. Only in a period with a counted change, since the game makes the projection. | 0.05 |
| News reader | 1–3 | Answered announced news in time. | Compares the plan flown during the news with the last plan before it was announced. A rise in demand needs a higher fare or more flights; a fall needs a lower fare or fewer flights. | — |
| First to fly | 1–3 | Flew a newly opened route in the first plan after it opened. | Routes opening after a chapter's first day; the first period starting on or after the opening. | — |
| Fuel ahead | 1–3 | Bought fuel before the price rose, and saved money. | The period's fuel advantage is at least £1, from a fuel desk purchase below a later price. The challenge's 10% discount does not count. | £1 |
| Clean sheet | 1–3 | Every sum in a week or month right first time. | Sign-offs and Build steps, at least 3; challenges and hunts are left out. | 3 |
| Close the gap | 1–3 | A month within 10% of the best plan. | The month audit's missed share. | 0.10 |
| Shrink the gap | 1–3 | Missed less of the best plan's profit than the month before. | Consecutive month audits in the chapter. | — |
| Never coasting | 1–3 | The whole chapter: a new plan at least every 5 weeks (every 2 months from chapter 2), and no board review for an unchanged plan. | Decided at the chapter review: the longest stretch between counted changes. Chapter 3's overdraft board reviews don't count against it. | 35 days (62) |
| Long haul full | 2–3 | A long-haul route at least 85% full over a month, at a profit. | As Full plane, over a month. | 0.85 |
| Spot the mistake | 2–3 | Found the mistake in a hunt. | `S.hunts` found. | — |
| Captain's challenge | 2–3 | Won a Captain's challenge. | `S.capCh` won; the second one adds to "times". | — |
| Saved and bought | 1–3 | Saved up for an aircraft for at least a week, then bought it. | The saving (Wait for it / Save for it) started at least 7 days before buying that plane, or a dearer one. | 7 days |

## What the test pupils reach in chapter 1

| Pupil | Milestones reached |
| --- | --- |
| The Steady pupil (changes a fare in each month's first week) | *(filled in from the run)* |
| The coasting pupil (the same plan from day 22) | *(filled in from the run)* |

## For Fable: the Milestones sheet

Each row is matched on `milestoneId` and changes only the cells it fills. A missing row keeps the draft above.

| Column | What goes in it |
| --- | --- |
| milestoneId | One of: fareTest, fullPlane, onTarget, newsReader, firstToFly, fuelAhead, cleanSheet, closeGap, shrinkGap, neverCoast, longHaulFull, spotMistake, captain, savedBought. Anything else is an importer error: the game can't measure it. |
| chapters | For example `1-3` or `2,3`. |
| title | The teacher's name for it. |
| teacherWords | One sentence: what it takes. |
| threshold | The default column above, as a number (0.9 = 90%). For neverCoast, the chapter 1 days; months scale it by 62/35. |
| status | live (as the other sheets). |

Questions for Fable:
1. Are the thresholds right for the pace of each chapter? Chapter 1 plays a week at a time, chapters 2–3 a month at a time.
2. Should any milestone wait for later chapters? For example, Close the gap is hard while a pupil has one plane.
3. A new milestone needs code (a measure the game knows). Name it and what it should look at.
