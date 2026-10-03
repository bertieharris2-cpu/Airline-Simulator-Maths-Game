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

- Release the current gate · skip or go back one screen · high/low nudge toggle (off by default) · auto-advance after landing.
- Trigger, delay or skip events · fire a Captain's challenge now.
- Queue or remove jobs for the next round · set depth (1–3) per job.
- Starting cash for new runs · adjust cash or reputation now · start the next round now · flight animation length.
- End session (save and show code) · main menu · best runs · record this run · new run from scratch · test read-aloud · load a save code.
- **Question bank (printable)**: generates a page from the data blocks with every question template per job and depth level, the number ranges in use and a worked example of each. Regenerate after tuning; it never goes stale.

## Game structure

- **Setup phase** (one lesson): name + two livery colours → tail-fin symbol → home airport (three options with different landing fees and passenger numbers) → buy the first plane (whole shop visible) → pick Dublin or Paris → buy the starting fuel → set a price → one revenue calculation → first flight lands and money arrives.
- **Rounds** run from the **HQ desk**. The briefing (world script plus consequence lines about his own past decisions) sits above a clipboard of task cards: assign a plane, plan the day, buy fuel, run the cabin, set the fare. He opens them in any order. Cards marked *needed* must be done before **Run the flights**; fuel is only needed when the tank is actually short, and the fare card is only needed when the route is new or the rival has moved (otherwise last round's price stands). Exactly one card per round carries the gated calculation (📐), and the engine never sets the same sum twice in a row (it swaps between the day's timing and the day's money). Then the day plays out on the IWB, the landing screen reports honestly per trip (LANDED / FULL FLIGHT / DELAYED / DIVERTED / CANCELLED / NO FUEL), a problem event may follow, then the Captain's challenge (every two rounds, optional) and a summary.
- **Plan the day.** Each plane flies a planned day of trips, out and back, from 06:00 to 22:00 with 45 minutes on the ground between trips (all in `data-world`). A route's passengers are per day and shared across the trips flown there, so flying Paris three times stops paying; mixing routes is the decision. The schedule calculation is time arithmetic: departure + flight time out + back = landing; + turnaround = next departure.
- **Fuel is a tank.** Every flight drains it by the plane's fuel use × distance; fuel bought adds to it at the price paid, and the landing report values fuel used at the average price in the tank. A flight the tank can't cover stays on the ground ("not enough fuel"), calmly, with no other penalty. Buying ahead when fuel is cheap is the whole hidden lesson, now playable.
- **Flights happen regardless**: once a plane has a route it flies every round. The pupil tunes the business; nothing is unlocked by answering. "Cleared for take-off" only ever means the maths gate passed.
- The plane shop is open at any point between tasks; buying runs its own small calculation (cash left, flights to pay it back).
- **World "Clear Skies"**: 12 scripted rounds, fully deterministic. Hidden lesson: fuel climbs every round (with a spike in round 7), so buying fuel early in bulk wins. Events: competitor undercut (R3), storm (R4), crew sickness (R6), technical fault (R8), price war (R10). Round 12 records the run; play can continue afterwards.
- **No game over**: if cash goes negative the bank lends enough to keep flying, and says so.

## Editing the numbers (no engine knowledge needed)

All tunables are JSON blocks at the top of `airline-simulator.html`, each with a comment above it:

| Block | Contains |
| --- | --- |
| `data-planes` | The shop: price, seats, speed, range, running cost per flight, fuel use per 100 km, typical profit (for the pay-back sum), optional `minReputation` (unused in stage 1). |
| `data-world` | Starting cash, day length and turnaround, home airports (landing fee, passenger bonus), routes (distance, base price and demand, the published demand rule, price options), and the round-by-round script: fuel price, jobs, which calculation is gated, demand changes, competitor fares, events, news, challenges. A new world is a new copy of this block. |
| `data-fins` | The tail-fin motifs offered in setup (SVG symbols sit just below the data blocks). |
| `data-jobs` | Job titles, icons and depth-level notes. |
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
