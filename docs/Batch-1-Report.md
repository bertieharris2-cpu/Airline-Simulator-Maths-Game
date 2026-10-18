# Batch 1: Launch Day design changes (Claude Design, 18 Oct 2026)

*Claude Code, 18 October 2026, for Bertie. The brief is `docs/Launch-Day-Changes-Batch-1.md`; the design system is `DESIGN.md` (repo root). The parked list (`docs/Next-Batch-Parked.md`) stays parked: no figures or game rules changed beyond what the four items needed. Screenshots of every changed screen, at 1366 × 768 and 1920 × 1080, are in `docs/screenshots/batch1/`, replayed from your own Launch Day saves of 18 Oct.*

## Section 6 first: the design rules in the project

- `DESIGN.md` is saved at the root of the project, as sent.
- `CLAUDE.md` (new) carries the line: follow DESIGN.md for every colour, type size, layout and component; don't edit it; flag conflicts.
- The tokens are CSS variables in a new part, `src/opening/parts/p1_head_design1.css`, under DESIGN.md's own names (`--wall-panel-2`, `--magenta`, `--gold`, `--text-soft`, …). The batch's new styles use them rather than raw colours. Three of DESIGN.md's names were already in use in the game with other values; see **Conflicts** below.
- The batch's code is one new part, `src/opening/parts/p5k_design1.js`. Like the recent parts, it reassigns existing functions rather than redeclaring them, so the count of overridden functions stays at 120.

## 1. Studio: the selected flight's panel and the Worth Sum Callout (Option D)

- **The panel under the timetable keeps two rows.**
  - **Top row:** the flight (city, times, seats sold, aircraft) with Earlier, Later, the route, the aircraft, Service costs, Remove and ×.
  - **Change row:** the fare as a − / + stepper (22px bold, gold), the seats filled at each fare beside it (press one to choose it), and a small "was £90" after a change.
  - The panel stays in one place, the same height whether or not a flight is selected.
- **The callout.** A change that needs its worth sum opens the callout above the flight that changed: about 440px wide (460px, so the four tiles fit), with a pointer down to the flight and the flight outlined in cyan.
  - Inside: the eyebrow "PARIS FARE RISE: WHAT IT DOES" and the gold Sum n; the before → after table with the figures close together (Fare £90 → £100; Passengers a day 38 → 37; Paris tickets a day £3,420 → ? in magenta); then the sum.
- **The sum follows the Week 1 flow inside the callout.**
  1. Build: Paris tickets a day = ? · ?, from four tiles: passengers after, fare after, and two decoys from the table, passengers before and fare before.
  2. Book and type: the built sum, the gold SUM strip, the answer box and Check.
  3. Done: the callout turns green once (0.5 s, no pulse); the "?" becomes "£3,700 (+£280 a day)"; the meaning reads "£100 with one empty seat earns more than £90 full."; then Done.
  - The plan summary's Projected profit lights green once.
- **Closing.** It closes on Done, ×, Esc, choosing another flight, or a click anywhere outside it and the flight's panel.
- **Every plan change that needs a sum** opens it, pinned to the flight that changed (the selected flight, or the route's first flight when the change came from the routes table):
  - a fare rise or cut;
  - an extra flight (flights a day 1 → 2; its meaning line says what the flight costs and adds after its costs);
  - a new time (passengers before → after).
  - A flight taken off shows the callout already done (no sum).
  - After the first sum of each kind, later changes open the callout already done, so the pupil always sees what a change did.

## 2. Work it out: one centred column and the Week 1 flow (Option A)

- **Layout.** One centred column, 760px:
  - the title, centred above;
  - the sheet, sized to its figures (label column 230px, figure columns 168px), centred;
  - the working panel directly under it at the same width (the active panel gradient with the cyan focus rail);
  - the route strips and the timetable below, at the same width.
- **Step 1, build.** The equation shows empty slots ("Dublin ticket revenue = ? · ?"). Below it:
  - four tiles, four across, 58px tall, label 11.5px over a 22px bold figure, money in gold;
  - operation buttons 48px square, Undo as a text button, and "That's my sum ▶" (48px) at the right of that row.
  - The decoys are always real figures from the same screen, in this order:
    1. the column's "want to fly";
    2. other figures shown in the same column of the sheet, nearest row first;
    3. the day's aircraft and fuel from the strip under the timetable.
  - Picking a tile outlines its figure in the sheet in cyan with its letter (A, then B).
  - A wrong build is an amber Query with one more try; twice, the sum is shown built ("Finance has built this one") and the pupil goes on to step 2.
- **Step 2, book and type.**
  - The formula line with A and B ("Dublin ticket revenue = A Dublin passengers × B Dublin fare").
  - The built sum at 30px bold with a magenta "?", and a small green "✓ sum built · change".
  - The gold-edged strip with the large SUM n badge: "Work it out in your book. Write Sum n beside your working, then type your answer."
  - The answer box (48px) and Check side by side. The reference card stays, folded, underneath.
  - The sheet: A and B outlined in cyan and tagged; the cell being filled outlined magenta with a "?" (it shows the digits as they are typed); unused columns dimmed.
- **Step 3, done.** The "?" becomes the answer in green and the sheet cell fills green, both once (0.5 s). The cell carries a small gold "Sum n" tag. The line reads "✓ Dublin ticket revenue £3,420 added to the sheet · Sum 2 in your record", with Next sum ▶.
- **Every sum on every Work it out page, every week**, goes through the three steps, including the ones that used to be Build only (the game worked those out; now the pupil types them too).
- **The record.** The Build and the typed answer go into the pupil's record under the same Sum number. The panel keeps a small "Week 1 · Sales forecast — Dublin" line under its header (screen readers hear "Sum 2 · Week 1 · …"), so the screen, the book and the printout match.

## 3. Operations Wall: deep navy (Option A)

- **New values** (layout and sizes unchanged), set with `#wall`-scoped rules so nothing else moves:
  - the overview panel: `linear-gradient(155deg, #0a2446, #06182f 50%, #041022)`, border `rgba(65,122,171,.48)`, top highlight;
  - the stat tiles: `rgba(4,13,30,.55)`, border `#1c3f73`;
  - the map: ocean `#040d1e`, land `#14284a`, by `--ocean` and `--land` on `#wall`;
  - the intro overlay: `rgba(4,13,30,.96)`, glow `.12`;
  - the header: `#071a3b → #041029`, border cyan .24;
  - the boards and status strip: `#0a1a35 → #06142b`;
  - the take-off caption: `wall-panel-1`.
- **Contrast** on the new navy, worst case (the lit corner of the overview panel):

  | Text colour | Contrast |
  | --- | --- |
  | `text` | 13.8:1 |
  | `text-soft` | 8.0:1 |
  | the Wall's label colour | 6.5:1 |
  | `gold` | 9.2:1 |
  | `green` | 9.3:1 |
  | `cyan` | 7.9:1 |

  On the stat tiles and boards every pair is higher. DESIGN.md's `text-muted` would be 4.2:1 on that corner; the Wall doesn't use it for body text.
- **Checked** in the intro, flying and day-complete states, and in the take-off, at both sizes.

## 4. The take-off

- **Seconds at the normal speed:**

  | Stage | Seconds |
  | --- | --- |
  | Taxi in | 1.5 |
  | Hold | 0.4 |
  | Ground roll | 2.5 |
  | Rotation | 0.9 |
  | Climb | 6.1 |

  - **Ground roll:** dead straight. The runway's centre line streams past faster and faster while the camera keeps the plane in view, so it gathers speed without leaving the screen.
  - **Rotation:** the nose wheel lifts first, to 9°, pivoting on the main wheels, which stay on the runway.
  - **Climb:** the main wheels leave the ground and it climbs away, easing to 7°. Its shadow stays on the ground and fades.
  - **9.5 s from the start of the roll to leaving the view; 11.4 s in all.** Every stage starts at the speed the last one ended on: no jumps.
- **Reduced motion** (the teacher's switch or the computer's setting): the plane fades out at the holding point over 0.8 s.
- The same animation runs on the take-off card and on the Wall. The engine sound is unchanged; it stretches to the new length.

## Section 5: screens changed beyond items 1–4

Please check these as well:
1. **Every Work it out page in every week**, not only Launch Day's fares: the fuel order, the profit and the cabin sales on Launch Day, and every later Monday's sums. Same column, same three steps, SUM n.
2. **Every worth sum in the Studio**: fares, extra flights and new times, as above.
3. **The HQ's network map** (Home and Network) had the same old pale royal blue ocean; it now uses the Wall's deep navy ocean and land. A sweep of the HQ, every desk, Reports and the Wall on days 8, 29 and 92 found no other old pale blue. The briefing pages never used it.
4. **The confirmed green, game-wide:** DESIGN.md's `#3ce394` replaces the Night Ops `#2bff88` (checked answers, landed, done). The older layers' green, red and gold moved to DESIGN.md's values too: `#6ff09a` → `#3ce394`, `#ff7b7b` → `#ff5f5f`, `#ffd54a` → `#f2c14e`.
5. **The unknown is magenta everywhere** (it was gold or amber): the Sunday review's build cards and the review sheet's lit cell, the build bars on the desks' cards (fuel farm, time to afford, finance, cash after buying), and the flight-times cell being worked out.
6. **The "Select a flight to change it" bar** is now the same height as the two-row panel (96px).
7. **The line above a changed flight** ("This change — seats … · profit …") gives way to the callout when the callout opens (the callout's table says the same); it still shows for changes that have no worth sum.
8. **The Work it out page's hint** at the bottom now says "Build each sum, then type the answer from your book."

## Conflicts and decisions to check

1. **Variable names already in use.**
   - DESIGN.md's `--line`, `--amber` and `--blue` already meant other things in the game's older layers (`--amber` is their money and button colour), and `.screen-title` and `.task` are class names of other parts.
   - I kept the game's values outside the new parts. DESIGN.md's values are `--bv-line`, `--bv-amber` and `--bv-blue`, and inside the new components (class `bv`) the DESIGN names point at them. The type styles are `.bv-title`, `.bv-task`, `.bv-section` and the like.
   - When the older layers are retired, the DESIGN names can take over everywhere.
2. **The worth sum now asks for the day's tickets after the change** (37 × £100 = £3,700, then the difference, +£280), as the mock-up shows. It used to ask for the difference ("£10 more a ticket × 38 passengers"). The brief says "the build-the-sum row and Check"; DESIGN.md says the callout follows the Week 1 flow, so the callout has both steps (build, then type).
3. **Build-only sums now have a typed answer too** ("every sum in every week"). The sign-off decay (Calculate twice, then Build, then Model) is therefore, in practice, build-and-type, then Model. Fable may want to look at this.
4. **The later columns of one row are the same sum** (Launch Day's fares at £90, £100 and £110; the two snack prices). Only the first is built. The rest start at step 2 with A and B outlined in their column ("the same sum for the £100 column"), which keeps your earlier note ("the sum … just for that first one"). Each still has its own Sum n.
5. **Step 1's operation slot starts empty**, and the pupil taps the operation. The brief's example reads "? × ?".
6. **In step 1 the sheet doesn't outline the sum's figures until the pupil picks them** (outlining them first would give the build away). In steps 2 and 3, A and B are outlined as the brief says.
7. **The answer box is in the working panel under the sheet** (Option A), no longer in the sheet's cell, as your earlier note had it. The cell shows the magenta "?" and the typed digits, and fills green when done.
8. **The take-off** is 9.5 s from the roll to leaving the view, 11.4 s with the taxi in.
9. **Not changed in this batch:**
   - The Fixed Inspector's Earlier and Later still move 5 minutes a press (D101); DESIGN.md says quarter hours.
   - The game's existing green buttons still have white labels; DESIGN.md wants `on-go`, and the new parts use it.
10. **The other sum instruments** keep their layouts; only their "?" changed:
    - the Fuel desk's order;
    - the Sunday review's build cards;
    - the sign-off cards;
    - the flight-times page;
    - the aircraft worth check;
    - the finance and time-to-afford cards.

    Moving them onto the same Calculation Builder is the natural next step for "every sum in every week". I've listed it rather than widen this batch.
11. **The callout covers part of the routes table and the demand strip** while it is open (it sits above the flight, as the mock-up shows).

## Noticed while doing this (not changed)

- While Launch Day flies, the Wall's date reads "Sunday 1 September 2030" (parked B6), and the take-off clock reads 08:30 (B7).
- The plan strip on the Work it out page reads "Price a litre £1.30" while the sheet's fuel price on Launch Day is £1.20. No sum uses it, since Launch Day's fuel is free, but the two figures differ.
- In the take-off drawing the plane stands on the grass beyond the runway's centre line, not on it. This is the drawing's existing layout.
- Still parked:
  - B4: "Revenue £6,670" on the HQ card against £6,763 in the results panel;
  - B5: "3 no seat" when the flights had seats.

## Tests

Changed for the new screens:
- **week:** the build step, the SUM strip, the callout solved where a fare change opens it, and the Change row.
- **decide:** the callout replaces the strip.
- **record:** each sum's Build goes into the record under the same Sum number.

The summary of runs is in the commit message.
