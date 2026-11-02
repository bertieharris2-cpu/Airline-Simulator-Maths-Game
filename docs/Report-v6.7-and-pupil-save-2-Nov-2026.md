# Fable's v6.7 and the pupil's save (2 Nov 2026)

You sent two things: Fable's workbook v6.7 with her report, and a pupil's save code to get working in the updated game. Both are done. Screenshots of the save are in `docs/screenshots/pupil-save-br/`.


## The pupil's save

**Where he is.** The airline is "british airways" (code BR), with one Twin Otter called Red Dragon. He saved on **Sunday 15 September 2030, the end of week 2**. He'd done his week-2 accounts and was on the "Weekdays and weekends" briefing. The save is from the game as it was on 22 October.

**What he has:**
- £22,618 in the bank and 3 stars;
- 3,840 litres of fuel in the tank, bought at £1.47;
- his timetable: Paris 06:00, Dublin 09:20 and 13:40, Paris 19:15;
- his fares: Paris £90, Dublin £80.

**Where he carries on.** He goes back to the start of the **week-2 Sunday accounts**, done the way the game does them now:
1. He adds up his own seven days with Σ SUM, then works out his average day.
2. He sees **Your week in pictures**. His week-2 gap is big (£13,195 against a best plan of £18,171), so he gets the paper question, as SUM 15.
3. Then Monday 16 September opens **week 3** with his plan as he left it.

Nothing else changes. No week is deleted. He redoes only that Sunday's accounts, because in the old game he added the days up one by one and never met Σ SUM.

**What I took out or changed**, and why:
- **His old week-2 total and average** are gone from his record, because he does them again the new way. His old "difference from the plan" stays, because today's week-2 sheet doesn't ask it.
- **The "Weekdays and weekends" briefing** isn't on his screen any more. In today's game it comes at the week-3 review, so he gets it there, with its upgrade offer.
- **His banked −1 star is cleared.** The storm and crew-sickness events cost him half a star each in the old game. Those events are parked in chapter one, so it didn't seem fair to keep their cost. His cash is unchanged, including the school trip's cheaper Thursday, because that's what he earned.

**Checks.** I played his airline in test mode on his own plan from that Sunday to the chapter-one end on 28 December, with no page errors. He finished on £254,812 and 4 stars, and the briefing came at week 3 as it should.

In November the old monthly board review stopped his plan until he changed something. The test kit chose a change for him; he'll choose his own. That's decision 1 below.

A new small test, `pupilsave.test.js`, checks the save every time: 7 checks, none failed.

The ready code is in the file I've sent you, `pupil-BR-week2-ready-ASIM5.txt`. Load it in the teacher panel as usual. The panel then says: "it carries on from Sun 15 Sep's Sunday accounts."


## Fable's v6.7

It's in the game, and `chapter1.test.js` still passes (39 checks, none failed).

**One problem first.** The session's computer restarted before I'd committed her workbook, and the uploaded file was lost. I had already compared it cell by cell with the game's copy, so I rebuilt it from that comparison. Every figure and every word the game shows is exactly hers. Five long notes got cut short in my comparison, so they end in "…". **If you send me v6.7 again, I'll put her own file in**; the game will be the same either way.

**What changes for the pupil:**
- The graph question only comes when the gap is over **15%** (it was 10%).
- Flight times round **up** to the quarter hour. Frankfurt on a Twin Otter is now 2 h 15 instead of 2 h 10.
- The turnaround at Heathrow is **30 minutes** (it was 35).
- Amsterdam and Barcelona have new colours. The old ones looked like amber and gold, which mean "warning" and "money".
- Launch Day's first page has four steps with no snacks.
- December's fuel line now says "You have bought fuel ahead since week 3; in December you buy a month at a time."
- The Board's card says "The airline's owners want…".
- The graph question's answer line explains itself: "The answer: £4,976. (Best plan − yours.)"

**Things I had to sort out, which Fable should know:**
- **The 30-minute turnaround didn't work on its own.** The game takes Heathrow's turnaround from the airport's own row on the Airports sheet (35) before the setting she changed. I set that row to 30 too, which is what her note was aiming for.
- **"Shareholders" → "the airline's owners"** is in her report but wasn't in her file. I made the change.
- **The three code-side wordings** are now workbook rows she can set:
  - the Launch Day steps;
  - December's fuel line;
  - the chapter end's "what comes next".
  
  The third one isn't really code: it's chapter 2's own line on the Chapters sheet. So I gave chapter one its own copy without "reputation revealed". Her suggested "Your stars, public since week 4" didn't fit a line about what comes next, so I left that item out. She can reword it.
- **`launch.compare`**, which she asked about: nothing in the game uses it any more, so it never shows on Launch Day.
- **Graph 2's measure** is now a setting, `graph2Measure`: "one plane all day" (what it does now) or "one flight".

The new rows are listed in `docs/Placeholders-for-Fable.md` under "v6.7 install".


## Still with you

Fable has recommendations on your six decisions. I haven't acted on any of them:
1. **Two Boards:** keep only the gentle one in chapter one; park the old monthly review.
2. **Red Kite** takes only routes he had time to fly: yes.
3. **The graph question:** at most every other week, and never two pauses running.
4. **Fares:** keep the tables.
5. **Years 5–6:** matches the project.
6. **Week 1's Day pages:** keep them.

Say which ones you want and I'll build them.


*Round 4 of about 10.*
