# Launch Day changes — batch 1 (for Claude Code)

Bertie has reviewed items 1–3 from the Launch Day play notes on mock-ups built from real game screenshots, and chosen a version of each. Item 4 is a direct instruction with no mock-up. Start with section 6 (save DESIGN.md and add the CLAUDE.md line), then make items 1–4 and apply them game-wide as described in section 5. Then replay Launch Day and capture each changed screen at 1366 × 768 and 1920 × 1080 so Bertie can check them against the mock-ups.

Apply the Night Ops colour roles everywhere: cyan #36C6FF = what the pupil is working on now; magenta #FF4FD8 = a figure to work out; green #3CE394 = confirmed; gold #F2C14E = money; amber = warnings only.

---

## 1. Studio, selected-flight panel — Option D · C's sum in a callout

Selected-flight panel: keep only the top row and a "Change" row: the fare as a − / + stepper (22px bold) with seats-at-each-fare beside it and a small "was £90" after a change.

When a change needs its worth sum, show a callout pinned above the selected flight block in the timetable (about 440px wide, pointer down to the flight, the flight block outlined):
- heading "PARIS FARE RISE: WHAT IT DOES";
- a before → after table with the figures close together (Fare £90 → £100; Passengers a day 38 → 37; Paris tickets a day £3,420 → ? in magenta);
- then the build-the-sum row and Check inside the callout.

While waiting, the callout edge is magenta. After Check, the same callout turns green: the "?" becomes "£3,700 (+£280 a day)" in green, a one-line meaning ("£100 with one empty seat earns more than £90 full") and a Done button. It changes state once (0.5s) and never pulses; the plan summary figure lights green once. The callout closes on Done, on choosing another flight or on clicking elsewhere.

All three states must work: a flight selected, a change waiting for its sum, and the sum done. Keep the panel in one fixed place under the timetable.

---

## 2. Work it out page — Option A · One centred column

Lay the Work it out page as one centred column 760px wide: the sheet sized to its content (label column 230px, figure columns about 170px), centred, with the working panel directly under it at the same width and centre line. Below them, the route strips at the same width.

Week 1 flow for every sum (three steps in the working panel):
1. **Build the sum.** The equation shows empty slots ("Cabin sales = ? × ?"). The pupil taps the two figures and the operation from four cards (one or two are decoys). Cards are 58px tall in a four-across grid, label 11.5px above the figure at 22px bold; operation buttons 48px square; Undo as a text button; the confirm button "That's my sum ▶" is 48px tall at the right of that row.
2. **Work it out and type the answer.** The built sum shows at 30px bold with a magenta "?" and a small green "✓ sum built · change". Above the answer box, a gold-edged strip with a large gold SUM n badge (18px, dark text) says "Work it out in your book. Write Sum n beside your working, then type your answer." Answer box (48px tall) and Check sit side by side. The calculation itself is done on paper; the screen does not ask for working.
3. **Done.** The "?" becomes the answer in green, the sheet cell fills in green, and a line says "✓ … added to the sheet · Sum n in your record" with Next sum ▶. The arrival plays once (0.5s).

Decoy cards: always real figures that appear elsewhere on the same screen or sheet (never invented numbers), so the pupil chooses by meaning rather than by spotting the odd one out. Use the same number of cards (four) for every sum.

Sum number as the link to the pupil's record: show SUM n as a gold badge in the working panel header and as a small gold "Sum n" tag in the sheet cell it fills, so the screen, the book and the printable record all use the same number.

In every layout: the figures the sum uses are outlined in cyan on the sheet and tagged A and B, and the formula line carries the same letters. The cell being filled has a magenta outline and "?". Unused columns stay dimmed; columns are sized to their content, not stretched. Check both 1366 × 768 and 1920 × 1080.

---

## 3. Operations Wall — Option A · Deep navy

Darken the Operations Wall to deep navy (keep layout and sizes):
- Overview panel (`.w-over`): background `linear-gradient(155deg, #0a2446 0%, #06182f 50%, #041022 100%)`; border `rgba(65,122,171,.48)`; inset top highlight `0 1px 0 rgba(150,205,255,.18)`.
- Stat tiles (`.wt`): background `rgba(4,13,30,.55)`; border `#1c3f73`.
- Map: ocean and map background `#040d1e`; land `#14284a` (set the `--ocean` and `--land` variables on `#wall`).
- Flying-view intro overlay (`.lo-intro`): `rgba(4,13,30,.96)` with the radial glow reduced to `rgba(31,122,255,.12)`. Note: this overlay sits over the map at the start of the flying view, so the map changes alone will not show there.
- Wall header (`.w-head`): `linear-gradient(180deg, #071a3b, #041029)`; border `rgba(54,198,255,.24)`.
- Departure/arrival boards and the status strip (`.w-board`, `.w-status`): `linear-gradient(160deg, #0a1a35, #06142b)`.

Keep the Night Ops colour roles unchanged on the wall. Check text contrast on the new backgrounds (body text at least 4.5:1) and check the day-complete, flying and intro states at 1366 × 768 and 1920 × 1080.

---

## 4. Take-off ground roll (no mock-up — direct change)

The take-off currently feels too quick. Change the animation so that:
- the plane makes a straight ground roll down the runway of about **2.5 seconds**, gathering speed, before anything else happens;
- the **nose wheel lifts first** (rotation), then the main wheels leave the ground and it climbs away;
- the **whole take-off sequence lasts about 9–10 seconds** from starting the roll to leaving the view.

Keep it smooth (ease-in on the roll, no jumps between phases) and respect reduced-motion settings (a short fade instead).

---

## 5. Apply these decisions everywhere, not just the screens above

Items 1–3 were chosen on specific screens, but they are rules for the whole game:
- **Worth-sum callout (item 1):** use it for every plan change that needs a sum to show it is worth it (any fare change, adding or moving a service, anything similar), pinned to the object that changed.
- **Week 1 sum flow and SUM n (item 2):** use the build → book and type → done flow, the four-tile rule with real-figure decoys, and the SUM n record link for every sum in every week, and the centred-column layout for every Work it out page.
- **Deep navy (item 3):** if the old pale royal blue (`#103463` / `#081d3f` panel gradient, or a similar bright blue) appears anywhere else (HQ results, briefings, reports), replace it with the deep navy values.
- **Unknown = magenta, money = gold** everywhere.

When you finish, **list every screen you changed beyond the ones named in items 1–4**, so Bertie can check them.

---

## 6. Add the design rules to the project (do this first)

1. Save the attached `DESIGN.md` in the root of the game's project folder, replacing any older copy.
2. Add this line to the project's `CLAUDE.md` (create the file if there isn't one):

   > Follow DESIGN.md for every colour, type size, layout and component. It is Bertie's design system; don't edit it yourself, and flag anything in a request that conflicts with it.

3. Use the CSS variables from DESIGN.md (for example `--wall-panel-2`, `--magenta`, `--gold`) rather than typing raw colour values, so future changes are made in one place.
