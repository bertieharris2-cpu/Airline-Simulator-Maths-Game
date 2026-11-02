# Your decisions on Fable's report, and the WPS check (2 Nov 2026)

Fable's own v6.7 file is in now. It's identical to my rebuilt copy except for her five full notes, so the game didn't change.

Your six answers are built into chapter one. Each one is a Settings row in the workbook, so it can be switched back.


## What changed

| Decision | What the pupil sees now | Setting |
| --- | --- | --- |
| 1 · Keep the gentle Board | The Monday "The Board would like a word" card stays. The old monthly board review (a letter, extra sums, and the plan held until he changes something) doesn't come in chapter one. The plain month-end Finance audit, which re-checks one line, is still there. | `boardReviewChapterOne` off |
| 2 · Red Kite only when he had time | A week only counts towards Red Kite taking a route when one of his planes had room for another return flight of it that week. A pupil whose planes are full all day isn't "ignoring" anything. | `rivalNeedsSpare` yes |
| 3 · The graph question | It no longer uses one of the pause's two questions, so Finance's two still come. It comes at most every other week. It's still numbered (SUM n) and still goes in his record. | `graphQuestionInPauseLimit` no · `graphQuestionEveryWeeks` 2 |
| 4 · Fares | No change. | |
| 5 · Years 5–6 | No change to the game. I've noted the rule for future work (WPS 3, into WPS 4 where partitioning helps, tell you about anything beyond); see below. | |
| 6 · Week 1's Day pages | No change. | |

**How it plays.** I ran your BR pupil's airline again from week 2 to 28 December, on his own plan with no changes:
- **The old board review:** the month-end audits came in October and November, but the board never held his plan. Before today it forced a change on 11 November.
- **Red Kite:** took nothing. His one plane is full from 06:00 to 22:00, so none of those weeks counted.
- **The graph question:** came in weeks 2, 4, 6, 8, 10, 12 and 14, every other week, instead of nearly every week.
- **The gentle Board:** had its word three times, in weeks 4, 8 and 12.
- **No page errors.** He ends on £194,119 and 4½ stars.

`chapter1.test.js` passes (39 checks, none failed). The rule "never more than two counted questions a pause" now leaves the graph question out, as you asked.


## Sums that may go beyond WPS 3

**How I checked.** I played the test airline through the whole of chapter one and collected all 62 sums he was asked. The workbook's WorkingMethods sheet tags every kind of sum with its Bettws statements, and all of them are WPS 3 statements (plus PFA Managing Money). I don't have the statements' wording, only their codes, so I can't say for certain which are past step 3. These are the ones that stretch furthest, for you to judge:

| Sum | Example from the run | Why it may stretch |
| --- | --- | --- |
| Time to afford a plane (week 4) | £13,790 ÷ £2,442 a day → 6 days | Dividing by a four-digit number, then rounding up. The game's hint is to count up in days ("how many £2,442s make £13,790?"), which keeps it manageable. |
| Seats filled as a percentage (weeks 4 and 9) | 527 ÷ 532 × 100 → 99% | A fraction with an awkward denominator turned into a percentage. Done exactly by hand, that's division to two decimal places. |
| The chapter accounts (28 Dec) | £205,910 + £263,500 + … = £909,160 | Six-digit totals. He builds them as formulas and the sheet adds them, so it's reading the numbers rather than calculating them. |
| Five-digit differences (most weeks) | £17,892 − £17,328 → £564; the graph question's best − yours | Column subtraction of five-digit amounts. Probably fine at step 3, but it's the biggest written subtraction he does. |

The rest look comfortable:
- two-digit × two- and three-digit (38 × £93, 90 × £170);
- × 7 for a week;
- four-digit differences;
- the average a day (the sheet divides).

Chapter one has no fuel sum now. The 8,000 × £1.47 in your BR pupil's old save isn't asked any more.


*Round 4 of about 10.*
