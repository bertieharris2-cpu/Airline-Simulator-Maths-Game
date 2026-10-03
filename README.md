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

- Accept this answer (fills the open cell) · fill the whole table · skip or go back one screen · high/low nudge toggle (off by default) · auto-advance after landing.
- **Text size**: Standard (22px text, 32px numbers), Large or Extra large. Saved with the run, so it travels in the save code; the IWB follows it.
- Forecast tables: help level on typed rows, which tables are live (as scripted / all / none), working space on the board, **next round's choice** (as scripted, or force ticket price / trips / fuel / seat layout), and "Check the time maths" (runs the Change Request 2 time cases).
- Repeat this round (back to the start-of-round state).
- Trigger, delay or skip events · fire a Captain's challenge now.
- Queue or remove jobs for the next round · set depth (1–3) per job.
- Starting cash for new runs · adjust cash or reputation now · start the next round now · flight animation length.
- End session (save and show code) · main menu · best runs · record this run · new run from scratch · test read-aloud · load a save code.
- **Question bank (printable)**: generates a page from the data blocks with every question template per job and depth level, the number ranges in use and a worked example of each. Regenerate after tuning; it never goes stale.

## Game structure

- **Setup phase** (one lesson): name + two livery colours → tail-fin symbol → home airport → buy the first plane → *Where should your first plane fly?* (Paris or Dublin) → *How much fuel will you start with?* (Enough for today or Stock up, shown as a ghost fill on the tank) → *How much should a Paris ticket cost?* (£80 / £100 / £120: he types the three incomes, £1,520 / £1,900 / £1,560; tickets sold and profit are given) → the first flight.
- **Rounds are decision-led (Change Request 4).** Standing choices carry over from round to round.
  1. **HQ**: today's news, *Your airline today* (planes, trips, ticket prices, the tank) and one big **Start the day**. Plane shop and Fleet sit here.
  2. **What will you do?** The news again and two or three choices. **Carry on as usual** is always first and is never wrong.
  3. **The table for his choice**, only if he acts: ticket price, a new plane (cash after buying and trips to pay it back for two planes, then *Where should it fly?*; it flies that day), trips (Step 1: full planes and people left over; Step 2: income from the extra trip, then *Fly the extra trip today* / *Don't fly it*), fuel (litres × price per litre = bill), or seat layout. If today's trips need more fuel than the tank holds, buying fuel comes next; that is the only place the "not enough fuel" warning shows.
  4. **Quick income sum** (passengers × ticket price) on every round where the ticket-price table didn't open, until income is fluent (the fluency engine is CR4 Stage 4).
  5. Flights, then the **landing report**: a short presentation, one point per slide (headline with the profit and cash counting up; each flight with its seats filling; forecast against actual as two bars, including what the extra trip made or would have made; each "why" on its own slide; the stars and reviews). Next, Back and Skip to the end; the arrow keys and Enter also move on. Then the optional event and Captain's challenge, and the summary.
- **Growth**: each route gains passengers every round from round 2 (`growth` per round, up to `cap`; Paris +2, Dublin starts at 40 and gains +2), so one plane soon leaves people behind. Round 3 offers a second plane ("Dublin has 40 people a day and no airline flies there"); if he carries on, "Look at a new plane" comes back every other round while he has one plane and can afford the next one. *How many trips?* is only offered when one plane can't carry everyone.
- **Every task screen is in focus mode**: the top bar, bottom strip and Shop / Fleet / Menu / Present hide; only the big plain question, the story, the table, Back and Working space remain (the teacher shortcut still works).
- **Forecast tables**: every number a sum uses is a row. The open cell has an amber outline, the two numbers it uses have cyan outlines, everything else dims, and the next cell opens by itself. Beside the table the sum is said as a sentence in the same colours ("19 tickets × £100 ticket price = ?"); what he types appears in the sentence and the cell. When every sum is done the side panel holds the choice. "What's in this?" on *Cost of the trip* lists running cost, landing fee and fuel. In *Choose the sum* mode nothing is outlined until he taps the two numbers in the table and the sign.
- **Unlocks**: routes and tools open by phase (`data-phases`). Phase 1 shows only Paris and Dublin (no Madrid, no day planner, no break-even bars).
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
| `data-world` | Starting cash, opening hours, first departure, turnaround, tank base size, fuel suppliers, demand-icon scale, home airports (landing fee, passenger bonus), routes (distance, base price and demand, `growth` and `cap` for passengers gained each round, the published demand rule, price options), and the round-by-round script: fuel price, the morning `choice` (news plus options: carry on, ticket price, trips, fuel, seat layout or an effect), demand changes, competitor fares, events, news, challenges. Each route has an `unlockPhase`. A new world is a new copy of this block. |
| `data-fins` | The tail-fin motifs offered in setup (SVG symbols sit just below the data blocks). |
| `data-tables` | The forecast tables: for each table, its question, its rows (given or calc), which calc rows are typed in setup and in rounds, the sum sentence for each typed row, and the skill id it will report to. |
| `data-phases` | Which features unlock in each phase (rounds 1–7, 8–14, 15–22, 23–30). |
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
- Styling: one shared style block at the top of the CSS is used by both windows, in the agent style (notched panels with glowing edges, uppercase header bars with a status dot, amber numbers). Fonts are the system sans for words and Courier New for numbers, so zeros are plain (no slash) and nothing is downloaded. Change Request 4 adds a reading layer at the end: running text at least 22px and numbers at least 32px at the Standard size, mixed case for questions, stories and tables (the small uppercase panel chrome stays), no scanlines over text, task panels at least 90% of the width and no scrolling at 1920×1080 or 1366×768.
- Stage 1 ships depth 1 for every job. Depth 2 is live for pricing (rival fare shown), fuel (two suppliers), check-the-flight (time zones) and cabin (break-even); depth 3 is live for pricing (demand bar) and fuel (bulk deal). Headwinds for check-the-flight are a placeholder.

## Open items (from the brief)

- [ ] Pupil's top three planes to add to the shop.
- [ ] Nudge on or off by default (currently off).
- [ ] Tune prices, starting cash and rewards after first play.
- [ ] Test read-aloud on the classroom machine.
