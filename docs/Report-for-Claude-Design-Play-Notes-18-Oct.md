# Report for Claude Design: Bertie's Launch Day test, 18 October 2026 (13:50)

*Claude Code, 18 October 2026. Bertie, who designs the game, played Launch Day with the screen-name tag on and talked as he went. Four of his remarks ask for design work, and two of those name Claude Design directly. This report sets out each one with his words, the screen, what is there now, and what we would like proposed. Nothing in the game has been changed yet. The screenshots are in `docs/screenshots/playnotes-1350/`, and the transcript, with each line placed on its screen, is `docs/screenshots/playnotes-1350/transcript.txt`.*

## The game, in one paragraph

*Airline Simulator* is a maths game for secondary pupils: they run an airline, and the airline's figures are their sums. The game is one HTML file (`airline-opening-prototype.html`, built from `src/opening/parts/`). Its look is the Night Ops design system: deep navy desks, thin cyan rules, amber for what needs attention and green for what is done. That system lives in `p1_head_nightops.css` and `p4zz_nightops.js`, and `ui-sandbox/airline-ui-sandbox.html` holds its key screens with sample data. The screens below are all from Launch Day: the pupil plans two routes for one 19-seat Twin Otter (Dublin and Paris), works out the day's figures, watches the first take-off, and sees the day fly on the Operations Wall.

## 1. The Studio with a flight selected: a deep dive

> "I also just did a sum and didn't really see the results, so can we look at studio flight selected page … take a real deep dive into the screen."
> "I also don't think the fare is that easy to spot to change."

**Screen:** `01-studio-worth-result.png` (after the sum), and `docs/screenshots/briefings/launch-1-worth-sum.png` (while it is built).

**What is there now:**
- Selecting a flight puts its controls in one bar under the timetable: Earlier, Later, the route, the fare (a drop-down reading "£100 · 44 want"), the aircraft, Service costs and Remove.
- After a change, a third row asks "What is the Paris fare rise worth a day?" He builds the sum from cards (£10 more a ticket × 38 passengers) and presses Check.
- The result then replaces that row in one line of small type: "37 × £100 − 38 × £90 = £280 more a day in Paris tickets. So it is better to charge £100 and have 1 seat empty than to charge £90." The same line repeats in small type in the plan summary below.

**The problems:**
- The answer to a sum he has just built lands in the same quiet row as everything else, so he missed it.
- The fare is one drop-down among five that look the same, though it is the control pupils use most on Launch Day.

**What we would like proposed:**
- A layout for the selected-flight panel that gives the fare its own clear control.
- A visible moment for the worth result, where his eye already is when he presses Check, which says what the change was worth and what it means.
- How the panel should behave across the three states: a flight selected, a change waiting for its sum, and the sum done.

## 2. The Sums page: centre it, and keep the Build sum full size

> "I also think on this page the spreadsheet and everything could be centralised. And also like the sum, where you build the sum, it gets smaller there. I think this is something for Claude Design to suggest improvements for."

**Screen:** `03-sums-cabin-sales-build.png`, and `docs/screenshots/briefings/launch-3-sums-in-the-sheet.png` for a typed sum.

**What is there now:**
- Since 18 Oct the answer is typed into the spreadsheet's own cell, with the sum and its help in a panel under the sheet.
- Every column of the sheet is the same width, and the sheet starts at the left edge, so a two-column table leaves the right third of the page empty.
- On a Build sum (the cabin sales):
  - the formula sits in a wide box;
  - the instruction line, the card bar and the cards are narrower and centred differently;
  - the Check button is taller than everything beside it;
  - the sheet's own cell reads "Completing…".
- The cards are smaller than the typed-answer box on the sums before.

**What we would like proposed:**
- One centred composition for the page: the sheet, then the working panel under it, sharing one axis and width, at 1366 × 768 and at 1920 × 1080.
- A Build sum at the same scale and weight as a typed one. The cards should read as the figures of the sum, not as small chips.

## 3. The Operations Wall: its blue

> "I'm not sure I like the blue of this screen. It's a bit paler. We've got less gradient. It feels a bit cheaper. This one doesn't seem to fit the style. Possibly something for Claude Design to think about."

**Screens:** `06-wall-day-complete.png` (where he said it), `05-wall-flying.png` (the same Wall while the day flies), and `07-results.png` (the HQ just after, for comparison).

**What is there now:** the Wall's large panels are a flat, lighter royal blue with almost no depth. The HQ desks around it are deep navy with gradients, thin rules and a lit header. So moving between the two feels like moving into another product.

**What we would like proposed:** a Wall palette and surface treatment that belongs to Night Ops, keeping the Wall's job.
- The Wall is shown full screen, often on a classroom's big screen, so it has to read from the back of the room.
- It needs the departures and arrivals boards, the map, and the day-complete figures.

## 4. The first take-off: a longer run along the runway

> "For the take-off, could we make the run-up a bit longer? So have it going in a straight line first for a couple of seconds and then let it take off, just to be a tad more realistic."

**Screen:** `04-take-off.png` (the taxi).

**What is there now:** the whole sequence takes about 7 seconds:
- the plane taxis in (about 2.1 s);
- it holds for half a second;
- it accelerates along the runway for only about 1.5 s;
- it rotates and climbs.

The run is `TKO` in `p4q_paint.js`: taxi to 30%, hold to 38%, rotate at 60% of the run.

**What we would like proposed:** the timing and feel for a ground roll of two to three seconds in a straight line before rotation, with any small cues that make it read as real (the nose wheel lifting, speed lines, the engine note). The longer run could make the whole sequence 9 to 10 seconds.

## Also from the same test (for Fable and for us; listed here for context)

- **The briefing What a fare does:**
  - Bertie wants it before the Studio, not at the sums.
  - He found it confusing: "So is it doing 72 times 80?" The scene shows 72 people at £80 but takes the money from the 38 who have seats, without saying so.
  - Its picture (`02-fare-briefing.png`) shows two rows of passengers with nothing to tell which row flies. Fable designs the scenes, but the visual answer (who flies, who is left, seats as two plane-loads) may be shared work.
- **Read aloud** should read the page's title. This is a fix on our side.
- **A sum whose figures don't agree** ("passengers flying 27, passengers buying snacks 31"). This is a fix on our side too: the decoy card was Dublin's passengers alone.

## What we need back

For each of 1 to 4, one proposed design: a mock-up or annotated screenshot, with the type sizes, spacing and colours as Night Ops tokens where they change. Say which ideas touch other screens: the panel pattern in 1, the sheet layout in 2, and the palette in 3 all recur in the game. We will build from your proposal in the next batch.
