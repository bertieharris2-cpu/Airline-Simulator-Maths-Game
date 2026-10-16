# Overlapping text, the right aircraft in the paint shop, more logo choices (16 Oct 2026)

*Claude Code, for Bertie. Three requests: "some of the text is overlapping each other on various screens"; "if I bought a Saab, am I customising a plane that looks like a Saab or just the standard plane?"; "a few more customisation options for logo etc."*

## What this means (for Bertie)

- **The overlaps are fixed** on every screen the check reached: Launch Day, the weeks of chapter 1, chapters 2, 3 and 4, every desk, the teacher panel and the wall. Each was checked at three sizes: a laptop (1366 × 768), your screen (1897 × 991) and the board (1920 × 1080).
- **Your screenshot.** It showed three problems:
  - **The fare question over the plan summary.** "What was the fare change worth a day?" now has its own strip above the Plan Summary. It spilled out because the bar at the bottom of the screen was locked to one line.
  - **The flight's editor cut off.** It now sits over the page, below the flight or above it, with Remove and Service costs always in view.
  - **The big round ✕ at the top.** This is not the game. It is the browser's own "exit full screen" button, which appears when the mouse touches the top of the screen in full screen. Moving the mouse away hides it.
- **The paint shop paints the plane you bought.** The Twin Otter, Saab 340, ATR 72, E175 and E190 had their own drawings, and a Saab was painted as a Saab. Some types had no drawing of their own and were painted as a Twin Otter. Each now has a recognisable shape (not an exact likeness):
  - the 757: long and slim on tall legs;
  - the 787, A350 and 777: a wide-body twin;
  - the A340: a wide-body with four engines;
  - the 747: the hump;
  - the A380: two decks the whole length.

  The A220, A320 and 737 still share one narrow-body drawing.
- **More logo choices.** The new options are:
  - **Shapes:** four more (diamond, hexagon, badge, oval), eight in all.
  - **Symbols:** twelve more, eighteen in all: wing, dragon, plane, globe, crown, bird, lightning, sun, mountain, heart, compass, and **initials** (up to three letters, such as "DA").
  - **Styles:** four (solid, ring, outline, two-tone).
  - **Lettering for the airline's name on every aircraft:** classic capitals, bold, script or outline. This is on the paint shop's Name tab.

  All of these are saved in the save code. An old save keeps its logo as it was.

## The overlap check

A scanner (`src/opening/tests/overlap/scan.js`) runs inside the game page. It lists three kinds of problem:
- **Overlaps:** text or buttons that overlap each other where both can be seen.
- **Cut text:** text cut off by a box that hides its edges. Scrolling boxes and "…" endings don't count.
- **Off the screen:** text that falls outside the window.

It ran in two ways:
- **Alongside the test runs:** after every click of the week, chapter 2, chapter 3 and chapter 4 tests, using `overlap/hook.js`.
- **Desk by desk:** on six saves (day 15, chapter 1's end, and the ends of chapters 2, 3 and 4), opening every desk and its tabs, the teacher panel and the wall, using `overlap/desks.js`.

### What it found, and the fixes

| Screen | What overlapped or was cut | Fix |
| --- | --- | --- |
| Plan (all sizes) | The bottom bar was tagged with a class name that an older style had already used with a fixed 52px height. Anything over one line (the fare question, Plan improved with a tip) spilled over the Plan Summary and below the screen | The bar's class was renamed, so the bar grows. The fare question has its own strip above the Plan Summary |
| Plan | The flight's editor was clipped by the timetable, and its fare chips were added after it was placed | The editor sits over the page and is placed after the chips (below the flight, else above, else as low as the page allows) |
| Plan | The timetable's last time read "22:" | The first and last times sit inside the timetable |
| Home, Launch Day | Route Performance headings ran together (the "New today" row spanned the hidden columns) | The row spans the four columns shown |
| Home | The step list read "· undefined" for the Fuel desk | The step is named "Buy fuel" |
| Home | The finance chart cut the money on its left ("£15,000,000" read ",000,000") and its dates ran together ("NovJan 32Mar") | The margin fits the longest figure, and only as many dates as fit are shown |
| Home | Live Operations' status words and the Alerts / Passenger Feedback tabs ran off their panels | The table fits its panel (the flight number is on the Live Operations desk), and the tabs read Alerts and Feedback |
| Home, chapter 4 | Today's Plan cut off "Plan January ▶" and the A380 project button; the month's figures ran out of the panel | The plan scrolls inside the panel with its buttons pinned at the foot, and the figures shrink to fit |
| Home, chapter 4 | Route Performance headings "Travelled" and "No seat" overlapped | The heading reads "Flew" |
| Every map | City names on top of each other (Paris under "DRAGON AIR", Geneva on Milan, the whole of Europe at world scale) | Names that would land on another are hidden, most important first: the routes flown, then the home base, then cities on offer. A crowded city on offer shows its dot only |
| Network desk | The map was squeezed to its title, the destinations ran off the screen, and the zoom buttons were cut | Map and route performance on the left, destinations scrolling on the right |
| Wall, chapter 2 | "Autumn gales" names no place, so all 24 routes were listed over the header and the fuel panel, with a storm on every city | Weather everywhere reads "All routes" once and is marked on the routes flown. The list holds eight at most. The airline's name in a dark livery colour is lifted so it can be read |
| Fuel desk, laptop, chapter 2 | The order card ran below the screen and under the bar (Confirm purchase hidden) | The desk's two columns scroll inside the desk |
| Answer boxes | "4days": the figure ran into the word after it | Room is kept for the word |
| Which aircraft should we add? | A column with an extra cash note pushed "Choose the ATR 72" below its edge | The column scrolls and its Choose button stays at the foot |
| The air show | A turned card's prices and "Tap to turn back" were cut | Taller cards where the screen allows; the back scrolls if it still needs room |

**Left as they are.** Some findings are by design:
- the £ inside an answer box;
- a flight's tag on the map passing over a city name for a moment;
- the change note that shows over the timetable for two seconds.

## The aircraft drawings

`tools/aircraft_art.py` draws the five new drawings into `src/opening/assets/aircraft/`. They use the same layers as the hand-drawn ones, so every colour, stripe, tail symbol, logo, registration and name works on each:
- `b757`;
- `widebody`;
- `widebody4`;
- `b747`;
- `a380`.

The game uses the drawing the Aircraft sheet's `artworkId` names. That column is empty for these seven types, so `p4zy_paint2.js` maps them by type, and by name for a new row. The showroom, reveal, fleet view, certificate and wall all go through the same lookup. **For Fable:** filling `artworkId` for the seven rows would make the sheet the one source:

| Aircraft | `artworkId` |
| --- | --- |
| b757 | b757 |
| b787 | widebody |
| a350 | widebody |
| b777 | widebody |
| a340 | widebody4 |
| b747 | b747 |
| a380 | a380 |

## Running the check again

```
cd src/opening/tests
NODE_PATH=<playwright node_modules> OVL_OUT=/tmp/ovl W=1897 H=991 SHOTS=0 node -r ./overlap/hook.js week.test.js
NODE_PATH=<playwright node_modules> node overlap/desks.js 1366 768 /tmp/ovl-desks <save code files…>
```

Each writes `issues.jsonl` with a screenshot of each new problem.

## Tests

All of these ran on the final build or on the build before its last CSS-only changes. Each finished with no page errors.

**Chapter 1**

| Test | Checks passed | Result |
| --- | --- | --- |
| `week.test.js` to day 15 | 95 | £25,545 on day 15, unchanged |
| `week.test.js` to day 23, laptop size, with the scanner | 146 | Nothing left to fix (the only flag is the lettering samples, see below) |
| `week.test.js` to day 23, Bertie's size, with the scanner | 146 | Nothing left to fix (as above) |
| `week.test.js` to the chapter review, Bertie's size, with the scanner | 244 | £697,112, unchanged |

**Chapters 2 to 4**

| Test | Size | Checks passed | End cash |
| --- | --- | --- | --- |
| `chapter2.test.js`, Premium | Bertie's | 103 | £13,334,810 |
| `chapter3.test.js`, Value | board | 66 | £26,453,508 |
| `chapter4.test.js`, Premium | board | 58 | £40,501,774 |
| `chapter4.test.js`, Value | laptop | 59 | £41,528,288 |

Every end cash figure matches its reference save exactly.

**The other tests**

| Test | Checks passed |
| --- | --- |
| `decide` | 35 |
| `migrate` | 31 |
| `record` | 17 |
| `milestones` | 27 |
| `engine` | 10 |
| `balance` | 85 |
| `fleetshop` (twice, on an idle machine) | 35 |

**Notes on three of them**
- **`fleetshop`** failed once while three chapter runs shared the machine. The week board runs in real time, so the purchase slipped from Tuesday to Wednesday, and Wednesday's timetable differs. The previous build passed under the same load, and two reruns on an idle machine passed all 35 checks, buying on Tuesday both times.
- **`liveops.test.js`** stops at the same out-of-date launch step as before this work (the old market pick).
- **The scanner's one flag** is the lettering samples. The browser reports stretched SVG text at its unstretched width. Checked by eye: all four samples show in full.

**Checked by eye**
- the logo step at laptop and board sizes;
- the paint shop's Name tab with each lettering;
- Repaint on the 747;
- the Fleet desk with the 787 and 747;
- the wall in chapter 2;
- the Network desk at two sizes;
- Home at Bertie's size.

A save made after choosing a two-tone badge logo with initials and outline lettering loads back with the same choices.
