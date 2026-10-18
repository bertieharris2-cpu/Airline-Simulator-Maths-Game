# Parked for the next batch (from Bertie's test of 18 Oct 2026, 13:50)

*Claude Code, 18 October 2026. Bertie asked for no game changes yet. Each item below is written so it can be picked up as it stands: who raised it, what is wrong, the change proposed, where it sits in the code, and what it waits on. Items marked **Bertie** come from his voice notes (transcript: `docs/screenshots/playnotes-1350/transcript.txt`); items marked **seen** were found while rebuilding his screens. Screenshots are in `docs/screenshots/playnotes-1350/`.*

## A. Briefings in the right order (needs Fable for the new scenes)

**Bertie's rule:** "check whether the briefings come before the first instance of working that out."

Today on Launch Day the pupil meets, in this order:
1. the Studio, where changing a fare or adding a flight asks "what is it worth a day?";
2. the fare sums, where the briefing What a fare does opens first;
3. the fuel order sum, with its worked example;
4. the profit sum;
5. two cabin-sales Build sums.

Only the fare sums have a briefing in front of them.

| # | From | Change | Where | Waits on |
| --- | --- | --- | --- | --- |
| A1 | Bertie | **What a fare does opens before the Studio** on Launch Day: after the Launch Day intro, before the first fare can be changed. He also asked for its point to include what a £10 rise is worth a day, the sum the Studio asks next. | `bfMore` in `p5f_brief.js` (the trigger moves from `workings` to the setup `plan` step) | Fable agreeing the new place; nothing else |
| A2 | Bertie | **Make What a fare does clearer** ("So is it doing 72 times 80?"). Label who flies and who is left ("38 have seats" and "34 can't get one"). Say the money is from the 38: "38 × £80, not 72 × £80". Show the seats as his flights (2 × 19), so more flights visibly means more seats, which is his own thought: "if I put on four Dublin flights I might get more money". | `briefings/briefing-fare.html` | Fable (scene), possibly with Claude Design |
| A3 | Bertie | **A fuel briefing before the Launch Day fuel order sum.** Cash, tank, profit opens at the first Fuel desk visit (day 8), but Launch Day already asks for the fuel order (3 × £1,300 for the rest of the week). | trigger in `p5f_brief.js`; maybe a new or shorter scene | Fable: move Cash, tank, profit to Launch Day, or add a short "fuel is bought by the 1,000 L" scene and keep the tank scene for day 8 |
| A4 | Bertie | **A cabin sales briefing** (new, the twelfth): the share of passengers who buy, times the price, less the stock cost. It opens before the first cabin-sales sum. | new page in `briefings/`, trigger in `p5f_brief.js` | Fable (scene and a Briefings sheet row) |
| A5 | Bertie | **Check the order of every briefing.** A test would play Launch Day to week 5 and fail if a sum of a kind appears before its briefing (fare, fuel, cabin sales, flight time, worth). | new check in `briefings.test.js` | A1, A3 and A4 |

## B. Fixes that need no decision

| # | From | What is wrong | Proposed change | Where |
| --- | --- | --- | --- | --- |
| B1 | Bertie | **"Passengers flying 27, passengers buying snacks 31"** on the cabin-sales Build. The two decoy cards, "Passengers flying" and "Fare", are the first route's figures (Dublin at £110: 27, £110), but nothing says so. The buyers are counted over the whole day (64 passengers). | Name the route on the decoys ("Dublin passengers 27", "Dublin fare £110"), or make the decoy the day's total (64) | `paperBuildFigs`, `p4zr_paper.js:66` |
| B2 | seen | **Half of 64 shows as 31.** "Half of passengers buy" is rounded down on each flight (19 → 9, 8 → 4, …), so a pupil who checks gets 32. | Work out the buyers from the day's total (64 × ½ = 32), or say "on each flight" | the snack buyers in the sums table (`p4l_handsums.js`, values `buyers`) |
| B3 | Bertie | **Read aloud should read the page's title.** On the Tuesday sums page it reads the planner's line ("Plan the week: the timetable, the fares…") rather than "Calculate the Paris ticket revenue". | Read the page title, then the sum's question when there is one | the page's `[data-say]` text (`sayBtn`, `p4a_core.js`); `shAfter` in `p5j_sheet.js` changes the title but not what is read |
| B4 | seen | **Two different revenues on the Launch Day results.** The top card reads "Revenue £6,670" (tickets). The results panel reads "Revenue £6,763 … from ticket sales", which includes the £93 of cabin sales. | Label the top card "Ticket money", or show both on one line with the cabin sales named | the HQ results card and the Launch Day results panel |
| B5 | seen | **"3 no seat" when the flights had seats.** Dublin: 30 wanted, 27 flew, flights 13/19 and 14/19. The 3 wanted a time with no flight. The Wall says the same: "Without a seat 10 · 10 wanted a time with no service". | Use the Screens brief 3 rule: "no seat" only when a flight was full, otherwise "wanted a time with no flight" | the results route lines, the Wall's day-complete tile |
| B6 | seen | **The Wall's date while Launch Day flies** reads "Sunday 1 September 2030" (Launch Day is Monday 2 September); the day-complete view is right. | Use the day being flown | Wall header in the starting and flying modes (`p4i_liveops.js`) |
| B7 | seen | **The take-off clock** reads 08:30 while the first flight, TE101, is the 06:00. | Check which time the take-off shows, then use the first departure | take-off wall (`p4q_paint.js`, `p4c_display.js`) |

## C. Waiting on Claude Design (report: `docs/Report-for-Claude-Design-Play-Notes-18-Oct.md`)

| # | From | Item |
| --- | --- | --- |
| C1 | Bertie | The Studio with a flight selected: the worth result is missed after Check, and the fare is hard to find among the inspector's controls. |
| C2 | Bertie | The Sums page: centre the sheet and its working panel, and keep a Build sum at full size. |
| C3 | Bertie | The Operations Wall's blue: paler, flatter, "cheaper", out of style with the HQ. |
| C4 | Bertie | The take-off: a straight ground roll of two to three seconds before it lifts. The timing can be done without design (`TKO` in `p4q_paint.js`: rotate later, longer run); the feel comes from Claude Design. |

## D. Play notes tooling

| # | From | Change |
| --- | --- | --- |
| D1 | seen | **The recording started 21 s after the log** (the microphone prompt), so every remark's time had to be shifted by hand. Log the moment the recorder actually starts (a `rec` entry), and have `playnotes_transcribe.py` shift by it. Use the silence filter by default: without it, the transcript put remarks up to 30 s early. |
