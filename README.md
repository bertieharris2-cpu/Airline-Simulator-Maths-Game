# Airline Simulator — Maths Game

A single-file, offline airline business simulator for one pupil, built to the Build Brief (Oct 2026).
Decisions from data first; one gated, multi-step calculation per round at Welsh Progression Step 3.

## Files

| File | What it is |
| --- | --- |
| `airline-simulator.html` | The whole game: control window (laptop) and IWB display window in one file. Double-click to run in Edge/Chrome. No internet needed. |
| `paper-backup-pack.html` | Printable A4 pack: decision cards, calculation sheets, review cards and a teacher answer sheet for one round. Open and press Ctrl+P. |

## Running it

1. Open `airline-simulator.html` on the laptop. This is the pupil's office (control window).
2. Click **Present**. The IWB window opens; drag it to the board and tap it once for full screen (browsers only allow one full-screen request per click, so the laptop goes full screen on your next tap anywhere in the office). Where the browser allows it (Chrome and Edge with the window-management permission, which is usually only offered on http pages) the IWB window moves itself to the second display. The laptop must be set to *extend*, not mirror (an operating-system setting the page cannot change).
3. **Open IWB** opens the display window without full screen. If the display window isn't open, the game is still fully playable: a status strip at the bottom of the control window stands in for the board.
4. The IWB shows four quadrants of live information: the departures board (one row per trip), the route map (planes fly out and back during the day), the market (fuel price by round against what the pupil paid, and his fares against the rival's), and news with the landing report and review cards. Finances and reputation live on the HQ, not the board.
5. **Menu** (top bar, or from the teacher panel): Continue run, New game, Best runs, Save code. New game asks for confirmation and records the current run to Best runs first.

Progress autosaves on every decision (browser storage on that machine). The teacher panel and the end-of-round screen also show a **save code** you can copy out and paste back in as a backup.

## Teacher panel

**Ctrl+Shift+T**, or tap the top-right corner of the control window three times.

- Release the current gate (fills the open forecast cell) · fill the whole table · skip or go back one screen · high/low nudge toggle (off by default) · auto-advance after landing.
- Forecast tables: help level on live rows, which tables are live (as scripted / all / none), working space on the board, next round's live table, and "Check the time maths" (runs the Change Request 2 time cases).
- Repeat this round (back to the start-of-round state).
- Trigger, delay or skip events · fire a Captain's challenge now.
- Queue or remove jobs for the next round · set depth (1–3) per job.
- Starting cash for new runs · adjust cash or reputation now · start the next round now · flight animation length.
- End session (save and show code) · main menu · best runs · record this run · new run from scratch · test read-aloud · load a save code.
- **Question bank (printable)**: generates a page from the data blocks with every question template per job and depth level, the number ranges in use and a worked example of each. Regenerate after tuning; it never goes stale.

## Game structure

- **Setup phase** (one lesson): name + two livery colours → tail-fin symbol → home airport (landing fees and passenger numbers differ) → buy the first plane (whole shop visible) → pick Dublin or Paris (people shown as icons, one box per plane-load) → buy the starting fuel (fuel forecast table) → set the price (price forecast table: he works out the income for three prices, then chooses) → the first flight lands and money arrives.
- **Rounds** run from the **HQ desk**. The briefing (world script plus consequence lines about his own past decisions) sits above the task cards. The main card is the **planning desk** for the focus plane, in three steps:
  1. **Who's flying:** demand as people icons with plane-load brackets, and the *How many trips?* forecast table (trips needed with remainder, income and cost of the last trip, is it worth it?). Choosing a column sets the day.
  2. **The fare:** the *Set the price* forecast table for three prices (people, seats, tickets sold, income, costs, profit) with a seats bar and break-even marker under each column. Choosing a column sets the fare.
  3. **The day:** the day timeline (out, turnaround, back, home turnaround), the fuel tank with today's use marked, add or remove trips, and *Compare with another day* (e.g. one Madrid trip against two Paris trips).
  Other cards: Buy fuel (two suppliers compared), Run the cabin (three layouts compared), and a Plan-the-day card for every other plane. The plane shop compares up to three planes in a forecast table before buying.
- **Forecast tables replace the old one-question screens.** Each cell is *given*, *enter* (only the correct value is accepted; calm retry wording; teacher can release it) or *derived* (appears once the rows above are complete). When the table is complete, nothing is announced as best: he taps the column he wants. One table per round is live, as set by the world script (`calc`); the others are filled in by "your finance team" as tick cards he can tap to check. Help on live rows: Shown (the sum is given), Choose the sum (pick two number cards and an operation), Free (row name only), Fluent (pre-filled). Until Stage C's skills engine exists, the help level is one teacher setting.
- **Time** comes from one shared module: a trip is out + turnaround away + back, with a turnaround at home between trips; planes leave at 09:00; the airport is open 06:00–22:00. The board, timeline, planner and map all use it.
- **Fuel is a tank** with a capacity (5,000 L plus storage that comes with each plane). Every trip burns fuel both ways. A trip the tank can't cover stays on the ground, calmly.
- **Forecast against actual:** after landing, "You expected £X · you got £Y" for income and profit, with one plain line if they differ.
- **Working space on the IWB:** a big amber "Go to working space" button on the board (also on every table screen and in the teacher panel) turns the board into a pen area with the current sum's key numbers pinned at the top. Three colours, two thicknesses, eraser, undo, clear. Drawings are not saved and clear when a new calculation starts.
- **World "Clear Skies"**: 30 scripted rounds in five acts, from the *Clear Skies 30 Rounds* workbook. Round 12 is a mid-season checkpoint; round 30 records the run.
- **No game over**: if cash goes negative the bank lends enough to keep flying, and says so.

## Editing the numbers (no engine knowledge needed)

All tunables are JSON blocks at the top of `airline-simulator.html`, each with a comment above it:

| Block | Contains |
| --- | --- |
| `data-planes` | The shop: price, seats, speed, range, running cost per trip, fuel use per 100 km (a trip burns it both ways), tank storage the plane adds, typical profit per trip (for the pay-back sum), optional turnaround and `minReputation`. |
| `data-world` | Starting cash, opening hours, first departure, turnaround, tank base size, fuel suppliers, demand-icon scale, home airports (landing fee, passenger bonus), routes (distance, base price and demand, the published demand rule, price options), and the round-by-round script: fuel price, jobs, which calculation is gated, demand changes, competitor fares, events, news, challenges. A new world is a new copy of this block. |
| `data-fins` | The tail-fin motifs offered in setup (SVG symbols sit just below the data blocks). |
| `data-tables` | The forecast tables: for each job, its rows (given / enter / derived), how each row is worked out, and the skill id it will report to. |
| `data-jobs` | Job titles and icons. |
| `data-reviews` | Review card pools by cause. |
| `data-challenges` | Captain's challenge questions (long multiplication / division) and rewards. |
| `data-text` | Retry messages and the nudge wording. |

Market rules (in the engine, published on screen): demand falls by `drop` passengers for every `step` pounds above `basePrice`; each star above 3 adds 10% passengers (below 3 removes 10%); if the rival is cheaper on a route you lose 1 in 5 passengers; a price two steps above base costs ½ star, one step below gains ½ star; the squeezed cabin costs ½ star a round, the roomy one gains ½.

**First-guess numbers to tune through play**: starting cash (£5,000) and the fleet ladder (Twin Otter £2,500 → Saab 340 £4,000 → ATR 72 £6,000 → E190 £8,500 → A220 £11,000 → A320 £14,000 → 737 → 787 → A350 → 747 → A380, Concorde as the wildcard: 12 planes). A Twin Otter makes about £700 a round, so each early step up is a few rounds away. The check-the-flight job only runs when distance ÷ speed lands on a quarter hour, so route distances and plane speeds are chosen to divide cleanly.

## Technical notes

- Two windows sync three ways: direct `postMessage` to the opened window, `BroadcastChannel`, and a `localStorage` storage-event fallback (needed on `file://` in Chrome).
- No `Math.random()` anywhere in outcome logic. Same world + same decisions = same result.
- Read-aloud uses `speechSynthesis`; the speaker buttons only appear when a voice is available. Test on the classroom machine (teacher panel → Test read-aloud).
- Styling: one shared style block at the top of the CSS (tokens, spacing scale, the panel and heading styles) is used by both windows. Two fonts only: Courier New for airport hardware and numbers, the system sans for interface copy.
- Stage 1 ships depth 1 for every job. Depth 2 is live for pricing (rival fare shown), fuel (two suppliers), check-the-flight (time zones) and cabin (break-even); depth 3 is live for pricing (demand bar) and fuel (bulk deal). Headwinds for check-the-flight are a placeholder.

## Open items (from the brief)

- [ ] Pupil's top three planes to add to the shop.
- [ ] Nudge on or off by default (currently off).
- [ ] Tune prices, starting cash and rewards after first play.
- [ ] Test read-aloud on the classroom machine.
