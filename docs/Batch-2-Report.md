# Batch 2: year one (Claude Design handover, 18 Oct 2026)

*Claude Code, 18 October 2026, for Bertie. The brief is Claude Design's handover of 18 Oct (`1-READ-FIRST-changes-for-claude-code.md`, `DESIGN.md` and `operations-briefings-kit/`). As asked ("Just up to year 1 please"), everything here is in year one only: from Launch Day (Mon 2 Sep 2030, day 1) to the year-1 accounts (Sun 31 Aug 2031, day 364). Chapters 3 and 4 keep today's screens, and their tests show nothing changed there. Batch 1 is already everywhere and stays. Screenshots of every changed screen at 1366 × 768 and 1920 × 1080 are in `docs/screenshots/batch2/` (its README lists them).*

## Year one only: how it is kept apart

- `yearOne(day)` (`parts/p5l_year1.js`) reads the Chapters sheet: day 1 to day 364. Behaviour sits behind it; the batch's CSS sits under `body.yr1`.
- From day 365 (chapter 3) every screen and rule is as it was. The two chapter 3 and 4 runs below start from the same saves on this build and on the last commit, and end on the same figures.
- When you say "extend", `yearOne()` returns true everywhere, and chapters 3 and 4 get checked once.

## 1. The design rules

- `DESIGN.md` is the handover's copy (BertieV4, the only design system). `CLAUDE.md`'s line covers illustration too.
- The tokens are CSS variables, `--red-kite` included. The briefing kit's art (style frames and the scene pieces) is in `src/opening/briefings/kit/art/`.

## 2. Batch 1's rules on every year-one screen

- **Worth Sum Callout.** It already opens for a fare change, an extra flight and a new time, pinned to the flight that changed (Batch 1). A fare change's sum now goes straight to the book: no Build step, the gold SUM n, the magenta "?".
- **The sum flow.** "Work it out in your book, then type the answer" and the gold SUM n on every sum.
  - The Build step stays where the game already uses it: a sum whose kind is at the Build level, which is mostly the first time it is met (on Launch Day, the cabin sales).
  - Sums about fares are always worked out in the book. That covers Launch Day's ticket revenue at each fare and the Studio's fare callout.
  - Any sum box with an answer box but no book line now carries "Work it out in your book, then type the answer." The footer hint says the same.
- **Four tiles.** Every Build shows four tiles, two of them real figures from the same screen, with labels on two lines.
  - The cabin sales sum used to show only its two figures. Its decoys are now the same rows in the sheet's other column ("Passengers buying snacks at £5", "Snack price at £5").
- **Colour.**
  - Unknown = magenta: any "?" that stands for an answer still to come.
  - Money = gold.
  - The old blue "Sum n" badge (the sum headers, and the Sunday review) is the gold SUM n.
  - Deep navy: I checked Home, Monday's results, Reports, the desks and the briefings in year one. No pale royal blue panel is left: the Wall's went in Batch 1, and the briefings now draw on the kit's navy.

## 3. The week 1 and 2 screens

- **3.1 Event cards (Storm as the template).** One 900px column:
  - the departures board seen through glass (rain, one lightning flash);
  - the amber DISRUPTION or cyan NEW INTELLIGENCE eyebrow;
  - the choices as board keys. Pressing one commits it (no Decide, no Change your mind, no side panel), and the flight's status flips.
  - The outcome arrives after a second as one row: RESULT and the why line, the money against today's costs (or ticket money for a refund), and the stars with the change.
- **3.2 Red Kite card.** The model table is the hero. Each profit is uncovered with See profit, then Choose. Red Kite appears as its badge and livery.
- **3.3 Work it out page.**
  - The sheet is one 640px object with "Your figures" inside it. The working row is lit, a rule sits above Total revenue, and a double rule sits under Profit.
  - The margins show where the figures come from (A, B) and where the answer goes. The route strips are gone.
- **3.4 Event sums** (Stay with you, Weekend travellers). There is no sheet: the passengers are drawn in rows of ten, 7 of every 10 lit, with a bracket and one caption.
- **3.5 Sunday review.**
  - Three columns, with a formula bar on the week's sheet. Tap cells into the bar, + − × ÷, and the "÷ 7 days" chip.
  - Finance's card holds the gold SUM n, the formula in words, the answer box and Check. The formula is judged first, then the answer from the book.
- **3.6 Fuel desk.** Three square panels:
  - Your position first: the tank with this week's need marked, and the four figures;
  - the order under it;
  - one Market panel, with "Buy now or wait? ›" for the tables.
  - A three-step tour on the first visit.
- **3.7 Week 2 plan opener.** The left card holds the four figures and Edit plan; Keep plan is in the footer only. The right panel is one "This week" list with small › links.
- **3.8 Customers have a choice.** Four beats:
  1. Red Kite's ATR taxis in.
  2. Drag the marker and that many passengers walk across. Lock in my guess comes once the pupil has moved it.
  3. The rule builds in three steps.
  4. Who stays, in rows of ten.

## 4. The briefings, redrawn from the kit

The ten year-one briefings draw on the kit's flat art:
- the night stand with thin pillars;
- the kit's aircraft at one scale, white with the airline's tail colour;
- the passengers without faces, square navy gate signs, gold bundles, the steel tank and vault.

There are no SVG filters in year one. The frame follows DESIGN.md: the current mark is cyan, Next is the blue primary and a choice is the outlined secondary. Profit is not cash (chapter 3) keeps the earlier look.

## 5. Briefing 13, Can you afford to run it? (`cash_to_fly`), and the D103 rules

**The scene** (`briefings/briefing-cash-to-fly.html`, drawn to `frame-can-you-afford-to-run-it.svg`) uses the pupil's own figures live:
- the cash, the week's litres and takings by day from the engine's projection of the plan;
- the price of a 1,000 L block and the planes;
- the shop's cheapest plane, flying the route the comparison picks.

Its layout:
- **Left:** the cash gauge. Its gold level, the draggable red reserve line (the only red), "£X to spend" above the line, and Buy with the price of a block under it.
- **Centre:** the week strip. Seven stands, one drum each: bought drums glow cyan, unbought ones are dashed outlines, flown days dim with a tick, and emergency fuel is a grey "+10p" drum.
- **Right:** the flight board. A line per flown day (tickets in green, fuel and costs plain, the day's result), and the week so far at the foot.

The five beats:
1. **Show:** the planes need fuel every day; the gauge fills to the cash.
2. **Decide:** "Before you buy, decide how much cash you'll keep for emergencies. There's no right amount — it's your call." The pupil drags the line (or uses the arrow keys); the caption says what can be bought above it.
3. **Buy and fly:** buy, then fly day by day. Each day's tickets come in, Buy lights when tomorrow's drum can be filled, and a dry day costs 10p a litre more. It ends on "You don't need the whole week's fuel on Monday."
4. **The twist:** back to Monday, and the shop's plane.
   - **Buy it:** the second plane lands and the cash drops; the week is flown again with two planes.
   - **Not now:** a quiet card says what the plane would have done.
   - Either way, a table compares "the same week, twice".
5. **Use:** the rules card (the kit's piece), "Your aim this year. This card stays on Home until January." Then back to the Fuel desk or the shop.

**When it plays:** once, in week 2.
- On the Fuel desk, straight after Cash, tank, profit.
- Or in the shop, if the pupil gets there first. It plays before the comparison, and the efficiency briefing follows it.

The line the pupil draws becomes their reserve. If the briefing is skipped, the reserve stays at £0.

**The D103 rules.** They are in the workbook as data: the Settings sheet rows `pupilReserve` (0), `bustRule` ("3 grounded days in a week") and `standingAim` (the card's five lines), the Briefings row, and a README note. The code reads them (`parts/p5r_d103.js`).
1. **The reserve is the pupil's.**
   - The fixed £1,000 goes in year one. The reserve starts at £0, is set first in the briefing, and can be changed on the Fuel desk ("Cash £14,926 · keeping £3,000 · Change ›", steps of £500) and on the Finance desk (a panel at the top).
   - The Fuel desk buys with the cash above it. The shop says what a purchase leaves above it ("Buying leaves £X, above your £3,000 reserve"; nothing about a reserve while it is £0).
   - The Ready check no longer stops a plan for the reserve.
   - The board nudges once a week ("From the board: the tank ran dry, and nothing was kept back for emergencies. …"), and only when nothing is kept back and the airline runs short.
2. **Going bust.**
   - There are no loans in year one: the bank's free top-up goes, so cash can fall below £0. The header then shows the figure in red under "Below £0 · no loans".
   - A day whose fuel can't be paid for keeps every plane on the ground, and the day's costs still run. That means the tank is dry, and the cash plus the day's takings won't buy the emergency fuel at the day's price + 10p.
   - Each grounded day gets a line in the day's results and the news, saying how much fuel was needed and what the cash and takings were.
   - Three grounded days in a week close the airline: a short closing screen ("Dragon Air has closed." with the days), then "Start again from Launch Day". The name, code, logo, livery and registration are kept, so the restart goes straight to the chapter page. The closing and the restart go into the teacher's record.
   - Chapter 3's overdraft is unchanged.
3. **The standing aim.** After Briefing 13 (or after week 2 for a save that missed it), Home shows the rules card under Coming up, with "Yours: £3,000." for the pupil's reserve. From the airline-type choice in January it shows that type's aim with the same cash rules.

## Screens changed beyond the ones named

All of these are in year one only.

| Screen | What changed |
| --- | --- |
| Launch Day's intro ("Your first week in charge") | The starting-cash line no longer says "with £1,000 always kept back for emergencies"; it says how much to keep back will be up to you. |
| The header's cash figure | Red, under "Below £0 · no loans", when cash is below £0 (it could not be before: the bank topped it up). |
| Ready (the check before take-off) | No longer stops a plan for dipping below the £1,000 reserve. |
| The day's results ("why" lines) and the news | The board's nudge (BOARD) and a grounded day's line (FUEL). |
| The shop: Buy it? and the one-plane view; the week-2 "What's new" card | "Buying leaves £X" (plus "above your £Y reserve" when one is set); "Cash now £X · your reserve £Y"; "You decide how much to keep back for emergencies." |
| Which aircraft should we add? | The cash bar's note and its screen-reader label say "your reserve" (nothing while it is £0). |
| Paying for a plane | The reserve note uses the pupil's reserve. |
| The Fuel desk's order line | "Blocks of 1,000 L · room in the tank for N L; your cash buys …" uses the pupil's reserve. |
| Every Work it out page (Launch Day and after) | Sums about fares go straight to the book; the cabin sales sum has four tiles (its decoys come from the "at £5" column). |
| The Sunday review's cells and the event sums | A "?" waiting for an answer is magenta. |
| Flight times page (week 3) | Its sums get the book line, the gold SUM n, and a magenta "?" in the table. |
| The Fuel desk's order sum and its sign-off | The gold SUM n; a magenta "?" in the order total and the sign-off. |
| Any other sum box with an answer box (the shop's time to afford, the service card's sign-offs) | The same rules apply; a teacher's-toolkit run of weeks 1–4 doesn't pass through these, so I haven't seen them on screen. |
| The week plan opener on a busy week (more news, three planes) | The "This week" list scrolls inside its panel, so the timetable and Keep plan stay on screen; two links on one change stack; D87's "Test fare" is a small link like the others. |
| The Sunday review on a week with routes not flown | Those routes share one note: "No service flew this week: Red Kite is taking your passengers.", then "Amsterdam 75 → 68 · Frankfurt 52 → 47 · …". The "What happened" column scrolls inside itself instead of running into the footer. |
| The teacher's test kit (Run) | Presses each "See profit" on the Red Kite card before choosing (not a pupil screen). |

## Flags and questions

1. **Five progress marks.** DESIGN.md's briefing has four steps (Show, Notice, Reveal, Use). Fable's Briefing 13 has five beats, so its stepper shows five. Should the twist fold into Reveal?
2. **The twist rarely grounds a plane.** Under the confirmed rule, a plane is grounded only when the cash and the day's takings can't buy emergency fuel. The takings usually can, so the twist mostly shows dearer fuel and a smaller cash balance, not a grounded plane. The scene says so honestly.
3. **The shop's plane in the scene** flies the route the D62 comparison picks, at its projected increment, not a copy of the pupil's whole plan.
4. **The rules card's last line.** The handover says it reads "You start again from Launch Day."; the kit's card says "You start again from Launch Day. No loans." I used the kit's wording, in the scene and on Home (it is the `standingAim` row, so you can change it in the workbook).
5. **Chapter 2's aim.** From January, Home shows the chosen type's own line (the game's text for Full Service, Value or Premium) with the cash rules. Fable may want to write that chapter's aim.
6. **The Design Register.** The workbook has no Design Register sheet, so D103 is in Settings, the Briefings row and the README note; the register entry itself belongs in Fable's register.
7. **Two briefings in a row.** A pupil who opens the shop in week 2 before the Fuel desk gets Briefing 13 and then the efficiency briefing, back to back.
8. **Below £0.** Cash can now be negative in year one (there is no loan to stop it). A negative balance shows in red with "Below £0 · no loans", and the next grounded days decide whether the airline closes.
9. **The restart** keeps the airline's identity, the briefings already seen and the reserve, so a pupil doesn't sit through them again. Say if a restart should replay them.
10. **"Drag the marker."** The handover's caption says "Drag the line."; the control is a cyan handle on a track, as in the mock-up, so the caption says "Drag the marker." The guess button now waits for the first move (DESIGN.md: "Next waits until the Notice question is answered").
11. **Added copy** for Bertie or Fable to check: "Now fly the week, one day at a time.", "Back to Monday.", "Your aim this year. This card stays on Home until January.", the closing screen's text, "Below £0 · no loans", the board's nudge and a grounded day's line.

## Tests

All on the final build. "The last commit" is the previous Batch 2 commit.

| Suite | Result |
| --- | --- |
| `week.test.js`, chapter 1 to its review (UPTO=200) | 252 checks, 0 failed. Ends on 28 Dec on £783,324. On the last commit this run stopped on Mon 9 Dec: the plan opener's list pushed Continue off the screen (fixed here). |
| `week.test.js`, Launch Day at 1920 × 1080 | 0 failed |
| `week.test.js` with the briefings playing (to day 15) | 115, 0 failed |
| `briefings.test.js` at 1366 × 768 and at 1920 × 1080 | 95 and 95, 0 failed |
| `decide`, `record`, `milestones`, `migrate`, `fleetshop`, `screens3`, `playnotes` | 38, 18, 27, 31, 36, 24, 14; 0 failed |
| `engine`, `balance` (the economy) | 10, 87; 0 failed |
| `chapter2.test.js`, Value and Premium, from that chapter 1 save | 110 and 104, 0 failed. They end on day 364 on £13,642,309 and £13,376,867, which is £1,301 and £1,416 below the last commit from the same save (the D103 rules in year one). |
| `chapter3.test.js`, Value and Premium, from those chapter 2 saves, on this build and the last commit | 66 and 78, 0 failed; the same figures on both builds (£26,373,933 and £20,076,456 on day 730). |
| `chapter4.test.js`, Value and Premium, the same way | 59 and 58, 0 failed; the same figures on both builds (£41,860,068 and £40,943,267 on day 1095). |

**Test changes.**
- `briefings`: Briefing 13 checked on its own and in the game; the rival scene's context beat comes first; it takes W/H.
- `week`: Launch Day's fare sums go to the book; the cabin sales have four tiles; the D86 count leaves out built-then-typed sums; the grouped route note.
- `record`: a fare sum has no Build entry.
- `chapter2`: the year-one event cards commit on the press. These checks also failed on the last commit.
- `milestones`: briefings off. A briefing over the screen took the teacher's keys; this failed before this batch too.
- The teacher's test kit: Run presses See profit on the Red Kite card.

**Overflow.** The chapter 1 run's overflow log notes Home 3–4px taller than the screen on a few days, at the moment the day changes over. The last commit shows exactly the same on the same days (Home's layout is identical on both), so it is not from this batch.

## Screenshots

`docs/screenshots/batch2/` holds every changed screen at 1366 × 768 and 1920 × 1080; its README says what to check in each.
