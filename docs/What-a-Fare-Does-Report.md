# What a fare does, rebuilt: report for Bertie (19 Oct 2026)

*Claude Code, from Claude Design's handover of 19 Oct. The screenshots, at 1366 × 768 and 1920 × 1080, are in `docs/screenshots/fare-19oct/` and were taken in the game. The save used is your own Launch Day Studio from the 17:09 play notes, with the briefing marked unseen.*

## What changed

The handover's only new work was section 6 (the rebuilt "What a fare does") and two additions to DESIGN.md. The kit in the zip is the same as the 18 Oct kit, so nothing else changed.

- **DESIGN.md** is the 19 Oct copy. It adds the Seat plans rule under "Operations Briefings illustration" and the decisions-log line for 19 Oct. CLAUDE.md already had the line the handover asks for.
- **What a fare does** (`src/opening/briefings/briefing-fare.html`) is rebuilt in seven beats. It follows the clickable mock-up, using design A for beats 2 and 6:
  1. **Tickets make money.** "Sell a ticket" walks a passenger to the plane, and a £100 coin flies into "Ticket money · revenue".
  2. **The fare changes who wants to fly.** A slider runs from £60 to £140. The crowd is in rows of ten. After three fares, the pattern line appears.
  3. **Seats run out.** 80 people want to fly at £70. Two seat plans board to 19/19 and 19/19. The 42 left over are dimmed, never red.
  4. **The challenge.** £70 fills both planes and leaves 42 behind. £140 flies 20 seats empty. "Best fare: somewhere between."
  5. **Which earns more?** (Notice) The £100 plane is full; the £110 plane has one empty seat. Next waits for his guess, and the guess is never marked.
  6. **Work it out.** (Reveal) The sheet follows the Work it out page's rules, in five "Next step" presses:
     - 19 × £100 = £1,900;
     - 18 × £110, worked as 18 × £100 + 18 × £10 = £1,980;
     - £80 more for the £110 plane;
     - then the takeaway and "Your guess".
  7. **Use.** Four recap tiles, then "Now set your fares." The green "Set my fares ▶" closes the briefing. The Studio comes back with the Dublin flight selected and its fare stepper ready.
- **It is a demonstration.** The game shows every sum, and he types nothing, so there is no SUM n.
- **The numbers are in the workbook (D104).** A new **BriefingData** sheet holds the fixed teaching example:
  - fares £60–£140, and how many want to fly at each (100, 80, 64, 50, 40, 36, 30, 24, 18);
  - the Twin Otter's 19 seats and two planes;
  - the £70 "seats run out" fare, and £100 against £110.

  The importer reads the sheet as `briefingData` and checks that the fares and figures line up. The import report lists it under "D104 touches". The fare_lever row on the Briefings sheet now describes the new beats, and the README sheet has the D104 line. The briefing's figures come only from this example, not from his routes. Every figure on screen (seats, counts, the sheet, the difference) is worked out from it.
- **Year one only, by its trigger.** It keeps its id and its two moments, both on Launch Day:
  - as the Studio opens;
  - as the fare sums open, for a save that got there without seeing it.

  Chapters 3 and 4 never reach it.

## Screens changed beyond the briefing

- **The Studio after the briefing.** When the briefing ends, it now selects the first Dublin flight (or the first flight if there is no Dublin), so the fare stepper is on screen and focused. Before, it went back to the Studio with nothing selected.

## Flags

- **The green "Set my fares" button.** I followed the handover, but DESIGN.md's Button rules keep green for committing a plan (run, fly, start operations). Should DESIGN.md allow green for a briefing's last step, or should this one be blue?
- **No "Pause & discuss".** The mock-up has no "Pause & discuss" button, so this briefing doesn't have one; the other briefings still do. Should it come back?
- **The other way in.** A save that reaches the fare sums without seeing the briefing ends it with "Work out the ticket money ▶" (blue), because he is already at the sums. "Set my fares" is used only from the Studio.
- **The plane.** The mock-up's Twin Otter has a blue tail. In the game it is the kit's Twin Otter with the pupil's own tail colour, as DESIGN.md asks.
- **The frame.** The game's briefing frame is 1240 × 800. The 1366 × 768 stage is scaled to fit, which leaves thin dark bands above and below it at 1920 × 1080.
- **The 17:09 play notes.** This handover doesn't answer the questions in the report on your 17:09 play notes. Those questions are about Launch Day's sums, the Studio callout and the Cash, tank, profit briefing, so they are still open for Claude Design.

## Tests

| Suite | Result |
| --- | --- |
| `briefings.test.js` at 1366 × 768 | 106 checks, no failures. "What a fare does" has its own part: all seven beats, with and without reduced motion, each beat's figures checked. In the game: the workbook example is sent; it plays through and lands back on the fare stepper |
| `briefings.test.js` at 1920 × 1080 | 106 checks, no failures |
| `week.test.js` (to day 15) | 103 checks, no failures; the same as the last commit |
| `record.test.js` | 18 checks, no failures; the same as the last commit |
| `migrate.test.js` | 31 checks, no failures |
| `chapter3.test.js` | 66 checks, no failures (nothing changed there) |
| `chapter4.test.js` | 58 checks, one failure (the D89 fuel farm's second stage). It fails the same way at the last commit, before this change |
| `opening.test.js` | Stops at the Launch Day market pick (`[data-mk="par"]` is no longer on that screen). It stops at the same place at the last commit, so it is out of date, not broken by this change |

`week` and `record` stopped early the first time, when seven suites ran at once on this machine. Run on their own, both pass as above.
