# One game again, the boxes moved, and two pupil saves (5 Nov 2026)

You asked for four things: the updated BR save code, the gubby airlines save made to work, the callouts moved out of the way (and the confusing words fixed), and the game knitted back together. All four are done. Screenshots of the boxes are in `docs/screenshots/callouts-5-nov/`.


## The two pupil saves

**BR (british airways).** Its code hasn't changed: it still loads in today's game, now the one-file game too, on the week-2 Sunday accounts (Sun 15 Sep). I've sent you the file again.

**GY (gubby airlines).** He saved on **Thursday 12 September, in the middle of week 2** (day 11), on the crew-sickness card, before Thursday's flying. He has:
- one Twin Otter flying Paris three times a day (09:00, 12:20, 15:40) at £90;
- £3,550.20 in the bank, an empty tank and 3 stars.

Monday to Wednesday of week 2 lost him about £700 a day.

What I changed, and why:
- **The crew-sickness card is gone.** Events are parked in chapter one, so it wouldn't make sense to make him decide one.
- **He carries on from Thursday:** the rest of week 2 flies on the Operations Wall, then today's Sunday accounts (Σ SUM, the average, Your week in pictures), then Monday 16 September opens week 3 on his plan.
- **Week 2's Monday what-if sheet is behind him,** so it isn't asked again.
- **His ½ star from advertising against Red Kite stays banked.** That event is parked now too, but he paid £300 for it, so taking it away didn't seem fair. Say if you'd rather clear it, as I did with BR's −1.
- **His Monday to Wednesday stay as he flew them,** including £117 of snack money from the old game.

**Checks.** The teacher panel says "it carries on on the operations board from Thu 12 Sep". I played his airline on his own plan to 28 December with no page errors. Thursday to Sunday made a profit in today's game (£326, £326, £666, £411). He ended on £111,606 and 5 stars. He never added a second plane or a new route, so Red Kite took the five he left unflown: Amsterdam, Frankfurt, Geneva, Brussels and Edinburgh. `pupilsave.test.js` now checks both saves: 13 checks, none failed.

The ready code is in `pupil-GY-week2-ready-ASIM5.txt`, which I've sent you.


## The boxes beside the sums

**What was wrong.** Every sum's box (Work it out on paper / Build the formula) went straight under its cell. That caused two problems:
- **It landed on the cell.** On a smaller screen the game shrinks the sheet to fit, and the box was placed as if it hadn't. So it landed short, on the bottom of the cell. That's what you saw.
- **It covered what came next.** Even when it was placed right, it covered the rows below, and on narrow sheets the Give me a hint link too. On the week-2 Sunday sheet, for example, it hid Days flown and Average a day.

**What it does now.** The box tries four places around its cell in turn: to the right, under, to the left, above. It takes the first one that covers no figure, label, heading or link, and it always keeps a small gap from the cell, with the pointer bridging it. On most sheets that means **beside the cell, to its right**. I checked it at two screen sizes (1366 and 1100 wide), and it re-places itself if the window changes size.

**The words.** On the modelling question the box said "Dublin: £90 or £100? Write SUM 2 beside it." That's the question, not the job. It now says **"Calculate the difference in profit for one flight. Write SUM 2 beside it."**, which follows DESIGN.md's own example for this box. The wording is a workbook row, marked as a placeholder for Fable.

**Three smaller things on the same screens:**
- **"Show me how"** under paper sums showed nothing (there was no example behind it), so it's gone.
- **Undo was hidden under the × key** on the Sunday sheets. Σ SUM sat in the formula bar and pushed it along. DESIGN.md says Σ SUM joins the keys, so it's there now. On a narrow sheet the keys drop below the formula bar rather than cover it.
- **The "= 190" box in your screenshot** was the teacher's test-mode answer peek, not something a pupil sees. It now sits beside the cell instead of falling to the bottom left.

**One thing for you to decide.** DESIGN.md asks for small letter tags, **A** and **B**, on the two cells in a formula. On the modelling sheet the formula is C5 − B5, so cell B5 carries the tag "B" and cell C5 the tag "A". Next to the column letters that could confuse. I've left it because it's in DESIGN.md. Two options:
- drop the letters on these sheets and keep just the colours, which the formula bar matches;
- keep them as they are.


## One game file again

**What the pupil sees.** The game is one file again, `airline-opening-prototype.html`. When chapter one's review card comes up on 28 December, its button **"On to Christmas and New Year ▶"** leads on, and chapter 2 opens on Monday 6 January 2031. A save from after chapter one now opens in this file too.

**What's in it:**
- Chapter one as it is today.
- Chapters 2 to 4 exactly as they were when they were parked on 30 October. Chapter one's changes are all tied to chapter one's dates, so they don't reach the later chapters.
- The teacher's Jump to… list: chapter one's seven test saves, then January 2031, June 2031, chapter 3 and chapter 4.

The old frozen copy, `airline-opening-full.html`, is gone; it's still in the project's history if we ever need it.

**One thing to expect.** Because chapters 2 to 4 are the 30 October game, the pupil will feel the join when chapter 2 starts. For example:
- **Snacks come back** (the test saw the snacks control from day 365).
- **Sums turn up between the pauses** (the test saw them on days in chapters 2 and 3).
- **The old rules apply again**, such as the events, the monthly board review and the old style of questions.

That's how you asked for them to be kept. When you want chapter two brought in line, say so.

**Checks:**
- **The chapter-one test** (`chapter1.test.js`) now checks the one file instead of the two: the review card's way on, a January 2031 save opening, every part present. RESULT_C1
- **Chapter 2** played from chapter one's review save, through Christmas, to its own end card: 111 checks passed, no page errors. One check failed, and it's about chapter one, not the join: in the test airline's chapter one, two SUM numbers (26 and 44) were handed out for sums that were never done. One was a plan-change sheet he left; the other was a review revenue sum. In a pupil's book that would show as a skipped number. It predates today; I'll look at it with the rest of chapter one.
- **Chapter 3:** 66 checks, none failed, no page errors.
- **Chapter 4:** RESULT_C4

I've updated CLAUDE.md to say there's one game file again. Work still goes into chapter one unless you say otherwise, and the chapter 2, 3 and 4 tests are run again to show nothing there breaks.


*Round 4 of about 10.*
