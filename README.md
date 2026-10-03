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
2. Click **Open IWB**. A second window opens with `?display` on the end of the address. Drag it to the whiteboard screen and click **Full screen** (bottom-left). The laptop must be set to *extend*, not mirror.
3. If the display window isn't open, the game is still fully playable: a status strip at the bottom of the control window stands in for the board.

Progress autosaves on every decision (browser storage on that machine). The teacher panel and the end-of-round screen also show a **save code** you can copy out and paste back in as a backup.

## Teacher panel

**Ctrl+Shift+T**, or tap the top-right corner of the control window three times.

- Release the current gate · skip or go back one screen · high/low nudge toggle (off by default) · auto-advance after landing.
- Trigger, delay or skip events · fire a Captain's challenge now.
- Queue or remove jobs for the next round · set depth (1–3) per job.
- Starting cash for new runs · adjust cash or reputation now · start the next round now · flight animation length.
- End session (save and show code) · best runs · record this run · new run from scratch · test read-aloud · load a save code.

## Game structure

- **Setup phase** (one lesson): name + two livery colours → buy the first plane (whole shop visible) → pick Dublin or Paris → set a price → one revenue calculation → first flight lands and money arrives.
- **Rounds**: briefing → decisions (assign / check the flight / buy fuel / run the cabin / set the price, as triggered) → one big gated calculation → flight plays out on the IWB → "why did that happen?" + review cards → problem event (if scripted) → Captain's challenge (every two rounds, optional) → summary. The plane shop is open at any point between decisions; buying runs its own small calculation (cash left, flights to pay it back).
- **World "Clear Skies"**: 12 scripted rounds, fully deterministic. Hidden lesson: fuel climbs every round (with a spike in round 7), so buying fuel early in bulk wins. Events: competitor undercut (R3), storm (R4), crew sickness (R6), technical fault (R8), price war (R10). Round 12 records the run; play can continue afterwards.
- **No game over**: if cash goes negative the bank lends enough to keep flying, and says so.

## Editing the numbers (no engine knowledge needed)

All tunables are JSON blocks at the top of `airline-simulator.html`, each with a comment above it:

| Block | Contains |
| --- | --- |
| `data-planes` | The shop: price, seats, speed, range, running cost per flight, fuel use per 100 km, typical profit (for the pay-back sum), optional `minReputation` (unused in stage 1). |
| `data-world` | Starting cash, routes (distance, base price and demand, the published demand rule, price options), and the round-by-round script: fuel price, jobs, which calculation is gated, demand changes, competitor fares, events, news, challenges. A new world is a new copy of this block. |
| `data-jobs` | Job titles, icons and depth-level notes. |
| `data-reviews` | Review card pools by cause. |
| `data-challenges` | Captain's challenge questions (long multiplication / division) and rewards. |
| `data-text` | Retry messages and the nudge wording. |

Market rules (in the engine, published on screen): demand falls by `drop` passengers for every `step` pounds above `basePrice`; each star above 3 adds 10% passengers (below 3 removes 10%); if the rival is cheaper on a route you lose 1 in 5 passengers; a price two steps above base costs ½ star, one step below gains ½ star; the squeezed cabin costs ½ star a round, the roomy one gains ½.

**First-guess numbers to tune through play**: starting cash (£5,000), the Twin Otter's profit per round (~£850) which sets the pace to the first jet (£8,500–£9,000), and jet demand/fuel use which decide how quickly money grows afterwards. The check-the-flight job only runs when distance ÷ speed lands on a quarter hour, so route distances and plane speeds are chosen to divide cleanly.

## Technical notes

- Two windows sync three ways: direct `postMessage` to the opened window, `BroadcastChannel`, and a `localStorage` storage-event fallback (needed on `file://` in Chrome).
- No `Math.random()` anywhere in outcome logic. Same world + same decisions = same result.
- Read-aloud uses `speechSynthesis`; the speaker buttons only appear when a voice is available. Test on the classroom machine (teacher panel → Test read-aloud).
- Stage 1 ships depth 1 for every job. Depth 2 is live for pricing (rival fare shown), fuel (two suppliers), check-the-flight (time zones) and cabin (break-even); depth 3 is live for pricing (demand bar) and fuel (bulk deal). Headwinds for check-the-flight are a placeholder.

## Open items (from the brief)

- [ ] Pupil's top three planes to add to the shop.
- [ ] Nudge on or off by default (currently off).
- [ ] Tune prices, starting cash and rewards after first play.
- [ ] Test read-aloud on the classroom machine.
