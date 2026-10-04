# Airline Simulator — Maths Game

A single-file, offline airline business simulator for one pupil, built to the Build Brief (Oct 2026).
Decisions from data first; one gated, multi-step calculation per round at Welsh Progression Step 3.

## Files

| File | What it is |
| --- | --- |
| `airline-opening-prototype.html` | **The active development version.** The opening 20–30 minutes only: setup, Launch Day, Day 1, Day 2, Day 3, then a temporary *Opening prototype complete* screen. See *Opening prototype* below. |
| `airline-simulator-full-reference.html` | **Frozen.** A snapshot of the complete simulator (weeks, months, later aircraft, international routes, storyline, awards, challenges). Critical fixes only until the opening is approved. |
| `airline-simulator.html` | The complete game, identical to the full reference for now: the HQ (laptop) and the Operations Wall (IWB) in one file. Double-click to run in Edge/Chrome. No internet needed. |
| `prototypes/hq/` | The HQ look-and-feel explorations that led to the current design. Standalone; not used by the game. |
| `paper-backup-pack.html` | Printable A4 pack: decision cards, calculation sheets, review cards and a teacher answer sheet for one round. Open and press Ctrl+P. |

## Opening prototype

The opening is being made excellent before the later campaign continues. `airline-opening-prototype.html` is self-contained like the full game, and keeps its **own saves** (it never shares a save with the full game).

**Run from the HQ (ALTAIR-style).** After the short onboarding (name, strategy, paint your planes, home airport) everything happens inside one HQ:
- **Top bar:** the **Cash balance** is always shown.
- **Left nav:** Overview · Today's Plan · Network · Fleet · Finance.
- **KPI row:** cash, last profit, passengers, reputation, fuel.
- **Plan steps** open in the **Today's Plan workspace**:
  - a plan rail listing every decision so far with its value (click a ✓ step to revisit it);
  - the task in the middle, with a short *Briefing* on Launch Day;
  - a **Money** panel: cash now, what has been spent today, and once the forecast is done the expected revenue, costs, profit and cash at the end of the day.
- **Start operations** returns to the Overview in live mode: the clock, the planes on the map and Live Operations move together.
- **The results land on the HQ:**
  - a *Day Results* panel shows revenue − costs = profit, forecast against actual, and who flew;
  - **Passenger Feedback** cycles through the reviews;
  - the "why" notes go to Alerts & Messages.
  - There are no end-of-level slides.
- ***Close the day*** moves to the next morning.
- **The look:** near-black navy, quiet title-case headings, sans figures, smaller text and 8px corners. Courier remains only on the wall's departure boards.

**Cost your options (three plans side by side).**
- **The flow:** the planner builds the day's plan, then **Cost your options** shows Plan A (the planner's plan) next to Plans B and C (copies to change).
- **Controls:** each plan has its own controls in its column: flights per route (CDG/DUB − / +), fare, snacks, and the first departure from Day 2. There is also a mini day bar and a line showing who flies, who has no seat, when the aircraft is free, and how many crews are needed.
- **Each column is a proper spreadsheet:**
  - **Revenue:** tickets per route, snack sales, total revenue.
  - **Costs:** flights, fuel used, terminal charges, snack stock, second crew, aircraft's day, total costs.
  - **Profit.**
- **The maths:**
  - **Every different plan's profit** (total revenue − total costs) is worked out on the keypad, one plan at a time; on Launch Day, the ticket revenue too.
  - **Changing a plan** clears only that plan's answers, and a plan that is the same as another needs no working out.
  - Then ***Fly Plan X***. The chosen plan's profit is the forecast the results compare against.
- **Fuel you can see:**
  - **The tank** keeps each batch bought (litres and price), and flights burn the **oldest fuel first**. So the fuel cost is exact and explainable ("420 L × £1.20 = £504"), and the forecast matches the result to the pound.
  - **The fuel screen** shows Cash → Fuel in the tank (litres and what it's worth) → Today's flights burn, plus a tank graphic with a layer for each batch, today's burn hatched and the order as a ghost.
  - **Ordering:** any amount in 500 L lots, up to the space in the tank and the cash available, with "enough for about N days". Buttons: *No order*, *Just enough for today*, *As much as I can*.
  - **Buying fuel is not a cost:** it moves cash into the tank. The results say so: "Profit £923 · bought today (not costs): fuel stock 2,000 L £2,600 · cash down £1,173".
  - **Elsewhere:** the fuel KPI shows the tank's value, and Finance has a fuel stock column.
- **Type:** the *Dark Premium* weights (the same Segoe UI system font). Big figures at 500, headings at 600, small spaced capitals for labels.
- **Fixes:**
  - "Not quite" now clears as soon as a new answer is typed.
  - The rotation step names the home terminal's turnaround: from Heathrow T5 it is 35 min, so the aircraft is ready at 13:20.

**Real airports, comparable plans, more to run.**
- **Home airport and terminal:**
  - London Heathrow (T5 or T4), London Gatwick (North or South), London Luton, Manchester (T1 or T3).
  - Each airport has a landing fee and a market size (more passengers at busy airports, and more business travellers at Heathrow).
  - Each terminal has a turnaround time (which the scheduling engine uses) and a charge per passenger.
- **Distances are real:** worked out from the airport coordinates. Flying times are rounded to 5 minutes, and fuel to 10 L.
  - From Heathrow, Paris is 1 h 10 and Dublin 1 h 30; from Manchester, Dublin is 55 min and Paris 2 h.
  - The normal fare follows distance (about £30 + 14p a km, to the nearest £10). The fare buttons run from £10 below to £30 above it.
- **Nothing is final until *Start operations*:**
  - fuel is an **order** that can be changed or cancelled, and is paid at the start;
  - every plan step stays editable from the plan rail.
- **Compare plans:** now done on the *Cost your options* screen (above).
  - Each card shows passengers flown, people with no seat, when the aircraft is free, crews needed, revenue and costs, and profit "about" (nearest £50).
  - **Use this plan** loads a pinned plan back. The forecast still asks for the exact sums.
- **Day 1, on-board sales:** nothing, snacks at £3 (half of passengers buy), snacks at £5 (3 in 10 buy), or free snacks (£2 a passenger, +½ star). Stock costs £1 an item.
- **Crew duty:** one crew works at most 9 hours, from the first departure to the last landing. A longer day needs a second crew (£300).
- **Day 2, departure times:** the first departure moves between 06:00 and 10:00 in 15-minute steps.
  - A route with a service before 08:00 attracts an extra group of business travellers (Paris 10, Dublin 6, more at Heathrow and T5).
  - An earlier start can also free the evening for another service.
- **Look and controls:**
  - square corners;
  - smaller titles;
  - ⛶ toggles **full screen** in one click. The teacher's triple-tap corner, which used to sit on top of the button, is now top-left over the logo. *Present on two screens* is in the Home menu.

**Flow:** name → strategy → paint your planes → home airport → **your start-up aircraft** (the Twin Otter's seats, speed, range and running cost, each explained; no shop) → **first market** (Paris or Dublin) → Launch Day → Day 1 → Day 2 → Day 3 → *Regular operations established*.

**Launch Day (high scaffold: SHOW → TRY → RUN → EXPLAIN):**
1. **The market:** "45 people want to fly to Paris today", drawn in aircraft-sized groups (19 | 19 | 7) next to "Your aircraft: 19 seats".
2. **One service, start to finish:** a timeline built step by step from the scheduling engine (depart 09:00, Paris 10:30, turnaround, leave 11:15, Cardiff 12:45, turnaround, ready again 13:30), with one time question. Flight time is not the time the aircraft is busy.
3. **What timetable do you want to run?** Paris ×1 / ×2 / ×3 fill the 06:00–22:00 bar; the passenger groups show who gets a seat and who doesn't. ×4 won't fit and says so. No single right answer.
4. **Fare:** £80–£120; passengers change at once (48 / 45 / 42 / 39 / 36) and the ladder shows expected passengers against 1, 2 or 3 services.
5. **Fuel:** schedule, fuel required, tank and price; buy enough for the plan or extra while it's cheap, then type the bill.
6. **Forecast:** passengers, revenue, running costs, fuel, route profit; on launch day only revenue and profit are typed. Then **Start operations** and the Operations Wall comes alive.
7. **Results:** revenue − costs = profit (with one-line meanings, only on launch day), the flights, who flew (wanted, seats, travelled, no seat), forecast against actual.

**Days 1–3 (the help fades):** the HQ shows yesterday's evidence per route (wanted, seats, travelled, no seat) and Intelligence lists situations, never instructions (*Capacity pressure — Paris*, fuel up to £1.30, *Network opportunity — Dublin*). **Plan today's operation** opens one planner: the day bar, each route's fare and services, and who gets a seat. Day 2's fuel screen has fuller help (and a typed bill); Day 3 adds the other market, so the pupil chooses a mix (Paris ×3, Paris ×2 + Dublin ×1, Paris ×1 + Dublin ×2, Dublin ×3, …), with the day's expected profit shown. Typed sums fade: Day 1 profit, Day 2 fuel bill and profit, Day 3 the revenue sums. Optional help chips (*? How scheduling works*, *? Demand*, *? Fuel*, *? Revenue and profit*, *? Forecast*) open a short explanation; nothing is retaught automatically.

**Market numbers (prototype only):** demand describes the market and is never changed to suit a lesson (no growth, no extra passengers on a "lesson day"); only reputation's small effect remains.

| | Paris | Dublin |
| --- | --- | --- |
| Passengers a day at the normal fare | 45 at £90 (each £10 more: 3 fewer) | 60 at £60 (each £10 more: 5 fewer) |
| Flight | 450 km, 1 h 30 each way | 300 km, 1 h each way |
| Running cost a service | £192 an hour in the air + the home landing fee + the terminal charge per passenger | (same) |

The Twin Otter also costs £900 a day. Examples (rep 3): Paris ×2 at £90 ≈ £836 a day, Paris ×2 at £100 ≈ £1,216; Dublin ×3 at £60 ≈ £786, at £70 ≈ £1,216; a third Paris service carrying 7 people loses money. Fuel: £1.20, £1.20, £1.30, £1.40.

**Source:** built from its own copy of the parts (`parts_open/`, plus `p4d_opening.js` for the new screens) so the full game's source is untouched.

## Running it

1. Open `airline-simulator.html` on the laptop. A saved game opens on the **Home** screen first (*Continue*, *New game*, Best runs, Save code), never straight into the run. **⌂ Home** is in the top bar, and in the bottom-left corner of full-screen task screens. The **HQ** is where the pupil thinks and acts.
2. Click **⛶ Present**. The **Operations Wall** opens; drag it to the board and tap it once for full screen (browsers only allow one full-screen request per click, so the laptop goes full screen on your next tap anywhere at HQ). Where the browser allows it (Chrome and Edge with the window-management permission, usually only offered on http pages) the wall window moves itself to the second display. The laptop must be set to *extend*, not mirror (an operating-system setting the page cannot change).
3. **One screen only?** Press **▣ Operations Wall** in the top bar, or the **W** key, to see the wall on the same screen. **Return to HQ** (or W, or Esc) goes back. It is the same game either way, and the game never needs the whiteboard. *Menu → Open the wall in a window* opens it without full screen.
4. **The HQ dashboard** (the start of every day):
   - the date and period ("Thursday 16 May 2030 · Day 4 · Daily operations");
   - what the operation is doing (Ready / Planning at HQ / Flights in progress / Paused · CEO decision);
   - cash, reputation, fleet in service, and an alerts bell.
   - **KPI cards:** cash, yesterday's profit, reputation and fuel position, each with a trend.
   - **Today's briefing** with the main button, **Operate today's flights**. In weeks it becomes **Run this week**; in months, **Simulate October** with *Run 3 months* and *Run until … is affordable*, plus the *saving for* bar.
   - **Network map** with four layers: Routes, Demand (circle size only, never a number), Profit (route colour from the last day), Opportunities (routes he could open, dashed).
   - **Fleet:** each aircraft, its seats, today's trips, how much of the day it is in use, and its status; plus the next aircraft in the shop.
   - **Route performance:** passengers ÷ seats, % filled, fare, revenue, cost, profit and trend, from the last finished day.
   - **Finance:** ticket money and costs as columns, with profit as a line, for the last 14 days, with a hover tooltip.
   - **Fuel:** tank, today's price, the average paid and the price so far.
   - **Intelligence:** situations, never solutions.
   - At 1920×1080 every panel is visible. On a 1366×768 laptop the secondary panels share tabs (Route performance | Finance, Fleet | Intelligence | Fuel), so nothing scrolls.
5. **The Operations Wall** shows the situation, while the HQ shows the numbers and decisions. It is a fixed 1920 × 1080 layout, scaled to fit any board. It has:
   - the header ("TODAY'S OPERATIONS", date, airport clock, LIVE / PLANNING AT HQ / FLIGHTS IN PROGRESS / SIMULATION PAUSED);
   - departures and arrivals boards (they page when there are more than 8 flights);
   - the map, about half the screen;
   - a status strip: aircraft active, flights today, destinations, delayed, grounded, fuel price, weather, alerts;
   - the news ticker.
   
   It changes mode by itself:
   - **Executive Alert** during an event: the map zooms to the affected route and flashes it, everything else dims, and a card says what has happened and that the CEO's decision is in progress at HQ. It shows no passenger numbers or costs.
   - **Daily results** after landing: big tiles for ticket money, costs, profit, passengers, seats filled and reputation, the profit-by-day chart, the landing report and passenger reviews.
   - **Welcome to the fleet** when a plane is bought.
   - **Milestones** shown once: first flight, first profitable day, 100 / 500 / 1,000… passengers, new destinations.
   
   **✏ Working space** (the pen area) is on the wall's header.
5. **⌂ Home** (top bar or corner, or from the teacher panel): Continue, New game, Best runs, Save code, Open the wall in a window. New game asks for confirmation and records the current run to Best runs first.

Progress autosaves on every decision (browser storage on that machine). The teacher panel and the end-of-day screen also show a **save code** you can copy out and paste back in as a backup.

## Testing on one big monitor

- **W** swaps between the HQ and the Operations Wall on the same screen (the split view was removed when the wall toggle arrived). Or open the wall with ⛶ Present and put the two windows side by side.
- **Test mode**: tick *Test mode* in the teacher panel's Testing row (a device setting, never saved into a pupil's run), or add `?test` to the address. A red TEST bar appears bottom-left: *Answer this one*, *Fill table*, *Skip screen*, *Auto-answer on/off*. With auto-answer on, each sum fills itself in correctly about 0.7 s after it opens; every decision is still yours. Answers filled in this way don't count towards his typed total.

## Teacher panel

**Ctrl+Shift+T**, or tap the top-right corner of the control window three times.

- Accept this answer (fills the open cell) · fill the whole table · skip or go back one screen · high/low nudge toggle (off by default) · auto-advance after landing.
- **Text size**: Standard (22px text, 32px numbers), Large or Extra large. Saved with the run, so it travels in the save code; the IWB follows it.
- Forecast tables: help level on typed rows, which tables are live (as scripted / all / none), working space on the board, **tomorrow's choice** (as scripted, or force ticket price / trips / fuel / seat layout), and "Check the time maths" (runs the Change Request 2 time cases).
- Repeat today (back to the start-of-day state).
- Trigger, delay or skip events · fire a Captain's challenge now.
- Queue or remove jobs for the next round · set depth (1–3) per job.
- Starting cash for new runs · adjust cash or reputation now · start the next day now · flight animation length.
- End session (save and show code) · main menu · best runs · record this run · new run from scratch · test read-aloud · load a save code.
- **Question bank (printable)**: generates a page from the data blocks with every question template per job and depth level, the number ranges in use and a worked example of each. Regenerate after tuning; it never goes stale.

## Time speeds up: days, then weeks, then months

The pupil never sees "rounds". The script is a list of **beats on calendar dates** (`data-world` → `rounds`, each with a `date` and a `period`). The time each decision covers grows as the airline settles, following the *Time, Narrative, Growth & Capital* brief.

| Stage | Dates | One decision covers | What he does |
| --- | --- | --- | --- |
| Launch day | Sunday 12 May 2030 | the setup flight | Set up the airline (unchanged). |
| Opening days | Days 1–5, Mon 13 – Fri 17 May | one day | Every flight by hand: trips, fuel, adding Dublin, a crew-sickness day, the first storm. |
| *Milestone: "Your airline is settling down"* | Sat 18 – Sun 19 May | the weekend runs by itself | He watches routine days happen without him. |
| Weeks | Weeks 2–7, 20 May – 30 June | one week | Red Kite arrives, cabin layout, a fuller timetable. Forecast: about £X a day × 7. |
| *Milestone: "You're running a business now"* | from July 2030 | one month, or longer | **Simulate next month**, **Run 3 months** or **Run until the target plane is affordable**. |
| First business year | July 2030 – April 2031 | months | Fuel shock, warning light, football final, price war, **Six months in** review (emergency money and the plane to save for), oil crash, blogger, fog, Red Kite again. |
| Year 1 Review | 1 May 2031 | | A look back at the year, then the second plane. |
| Year 2: going global | June 2031 – May 2032 | months | Trade fair, ash cloud, baggage chaos, Olympics, winter sun, Red Kite goes long-haul, airport fees, mystery shopper, storm again, **Airline of the Year** (the finale, May 2032). |

- **Forecast → run → compare.** Before a run he makes a forecast with the table engine:
  - a week or one month: *profit a day (about) × days = profit*, then *cash now + profit = cash at the end*;
  - several months: *profit a month (about) × months*;
  - saving for a plane: *cash − emergency money = cash you can spend*, *price − that = still needed*, *still needed ÷ profit a month, rounded up = months*.
  The "about" figures are rounded on purpose. A routine week or month with no decision runs without a table.
- **The run** shows the calendar ticking over: MON ✓ TUE ✓… or JUL ✓ AUG ✓…, with profit building, on the HQ and the wall. The results compare his forecast with what happened and say why they differ (fuel moved, the tank ran out, a CEO decision cancelled flights, rounding, fuel already paid for).
- **CEO interruptions.** A run stops at the next beat that needs him ("⚠ SIMULATION PAUSED · Technical fault"). The alert comes first, then HQ. In weeks and months a decision lands on the first day of the coming run: a cancellation cancels that plane's flights that day; "wait for the part" grounds it for that day. Quiet beats (`"routine": true`) don't stop a run.
- **Fuel in weeks and months**: when the tank runs dry, routine operations top it up at the market price **plus 10p a litre** for delivery, so buying a stock when it is cheap still pays. Day by day, an empty tank still grounds the trip, as before.
- **Capital takes time.** Each plane has **daily running costs** (crew, maintenance, insurance) whether it flies or not. From July the HQ shows the **emergency money** (£10,000 by default, changed at the half-year and Year 1 reviews) and a **saving for** bar for the target plane. The bar shows the price and the money kept back, but not the months. Working that out is his job, and his last estimate is remembered.
- **The next plane** is offered from the Year 1 Review, or sooner once the plane he is saving for is affordable with the emergency money kept, and then no more often than every three months.
  - In months the plane table shows cash after buying, whether that is still above the emergency money, and the plane's running costs a day.
  - The route cards for a new plane show the people a day **and how many your other planes already carry**.
  - If a plane loses money two periods running (with more than one plane), **Move the plane** to another route is offered. It keeps as many trips as fit in its day.
- **Milestones** (once each, on the wall's results): first flight, first profitable day, 100 / 500 / 1,000 / 2,500… passengers, each new destination.

## Game structure

- **Setup phase** (one lesson): name → **airline strategy** (*What kind of airline do you want to build?* Premium · Full Service · Value, each with a slogan, a cabin seat map, fares/service/passengers meters and its trade-off; none is presented as easier or better) → paint your planes (two colours with a live preview, then the tail-fin symbol) → home airport → buy the first plane → *Where should your first plane fly?* (Paris or Dublin) → *How much fuel will you start with?* (Enough for today or Stock up, shown as a ghost fill on the tank) → *How much should a Paris ticket cost?* (£80 / £100 / £120: he types the three incomes, £1,520 / £1,900 / £1,560; tickets sold and profit are given) → the first flight.
- **Strategy** is stored as `S.airline.strategy` (`'premium'`, `'full'` or `'value'`; the list is `STRATEGIES` in the core script so Leisure can be added later) and shown as identity: *PREMIUM AIRLINE* / *FULL-SERVICE AIRLINE* / *VALUE CARRIER* under the name in the top bar, on Home, on the launch screen and in the wall header. It does not change the economics yet; it only changes how Red Kite's arrival is told. Old saves have no strategy and show no badge.
- **Rounds are decision-led (Change Request 4).** Standing choices carry over from round to round.
  1. **HQ**: today's news, *Your airline today* (planes, trips, ticket prices, the tank) and one big **Start the day**. Plane shop and Fleet sit here.
  2. **What will you do?** The news again and two or three choices. **Carry on as usual** is always first and is never wrong.
  3. **The table for his choice**, only if he acts: ticket price, a new plane (cash after buying and trips to pay it back for two planes, then *Where should it fly?*; it flies that day), trips (Step 1: full planes and people left over; Step 2: income from the extra trip, then *Fly the extra trip today* / *Don't fly it*), fuel (litres × price per litre = bill), or seat layout. If today's trips need more fuel than the tank holds, buying fuel comes next; that is the only place the "not enough fuel" warning shows.
  4. **Quick income sum** (passengers × ticket price) on every round where the ticket-price table didn't open, until income is fluent (the fluency engine is CR4 Stage 4).
  5. Flights, then the **landing report**: a short presentation, one point per slide (headline with the profit and cash counting up; each flight with its seats filling; forecast against actual as two bars, including what the extra trip made or would have made; each "why" on its own slide; the stars and reviews). Next, Back and Skip to the end; the arrow keys and Enter also move on. Then the optional event and Captain's challenge, and the summary.
- **Growth**: each route gains passengers at every beat from the second (`growth` per beat, up to `cap`; Paris +2, Dublin starts at 40 and gains +2), so one plane soon leaves people behind. Day 3 offers a Dublin trip for the one plane ("Dublin has 44 people a day and no airline flies there"); Week 6 and the football final offer a fuller day. *How many trips?* is only offered when one plane can't carry everyone.
- **Every task screen is in focus mode**: the top bar, bottom strip and Shop / Fleet / Menu / Present hide; only the big plain question, the story, the table, Back and Working space remain (the teacher shortcut still works).
- **Forecast tables**: every number a sum uses is a row. The open cell has a bright cyan-white outline, the two numbers it uses have cyan outlines, everything else dims, and the next cell opens by itself. Beside the table the sum is said as a sentence in the same colours ("19 tickets × £100 ticket price = ?"); what he types appears in the sentence and the cell. When every sum is done the side panel holds the choice. "What's in this?" on *Cost of the trip* lists running cost, landing fee and fuel. In *Choose the sum* mode nothing is outlined until he taps the two numbers in the table and the sign.
- **Unlocks**: routes and tools open by phase (`data-phases`). Phase 1 shows only Paris and Dublin (no Madrid, no day planner, no break-even bars).
- **Time** comes from one shared module: a trip is out + turnaround away + back, with a turnaround at home between trips; planes leave at 09:00; the airport is open 06:00–22:00. The board, timeline, planner and map all use it.
- **Fuel is a tank** with a capacity (5,000 L plus storage that comes with each plane). Every trip burns fuel both ways. A trip the tank can't cover stays on the ground, calmly.
- **Forecast against actual:** after landing, "You expected £X · you got £Y" for income and profit, with one plain line if they differ.
- **Working space on the IWB:** a big "Go to working space" button on the board (also on every table screen and in the teacher panel) turns the board into a pen area with the current sum's key numbers pinned at the top. Three colours, two thicknesses, eraser, undo, clear. Drawings are not saved and clear when a new calculation starts.
- **World "Clear Skies"**: 32 beats in five acts, re-dated from the *Clear Skies 30 Rounds* workbook onto the calendar above. The six-month review (November 2030) is a checkpoint; the finale (May 2032) records the run.
- **No game over**: if cash goes negative the bank lends enough to keep flying, and says so.

## Editing the numbers (no engine knowledge needed)

All tunables are JSON blocks at the top of `airline-simulator.html`, each with a comment above it:

| Block | Contains |
| --- | --- |
| `data-planes` | The shop: price, seats, speed, range, running cost per trip (`runCost`: crew, landing and maintenance for one trip), **daily running costs** (`dayCost`, paid every day flying or not), fuel use per 100 km (a trip burns it both ways), tank storage the plane adds, typical profit per trip (for the day-by-day pay-back sum), optional turnaround and `minReputation`. |
| `data-world` | Starting cash, opening hours, first departure, turnaround, tank base size, fuel suppliers, demand-icon scale, home airports (landing fee, passenger bonus), routes (distance, base price and demand, `growth` and `cap` for passengers gained each round, the published demand rule, price options), `fuelTopUp` (delivery charge on fuel bought automatically in weeks and months), `reserveDefault` (the emergency money), and the beat-by-beat script: each beat's `date`, `period` (`day` / `week` / `month`), optional `stage` (the milestone screen), `review` (`half` or `year`) and `routine` (doesn't stop a long run), its fuel price, the decision `choice` (news plus options: carry on, ticket price, trips, fuel, seat layout or an effect), demand changes, competitor fares, events, news, challenges. Each route has an `unlockPhase`. A new world is a new copy of this block. |
| `data-fins` | The tail-fin motifs offered in setup (SVG symbols sit just below the data blocks). |
| `data-tables` | The forecast tables: for each table, its question, its rows (given or calc), which calc rows are typed in setup and in the game, the sum sentence for each typed row, and the skill id it will report to. Step 2 adds `periodPlan` (a week or a month), `runPlan` (several months), `afford` (saving for a plane) and `planeM` (buying a plane, emergency money in view). |
| `data-phases` | Which features unlock in each phase, by beat (opening days 1–5, weeks 6–9, the first year 10–20, going global 21+). |
| `data-jobs` | Job titles and icons. |
| `data-reviews` | Review card pools by cause. |
| `data-challenges` | Captain's challenge questions (long multiplication / division) and rewards. |
| `data-text` | Retry messages and the nudge wording. |

Market rules (in the engine, published on screen): demand falls by `drop` passengers for every `step` pounds above `basePrice`; each star above 3 adds 10% passengers (below 3 removes 10%); if the rival is cheaper on a route you lose 1 in 5 passengers; a price two steps above base costs ½ star, one step below gains ½ star; the squeezed cabin costs ½ star a round, the roomy one gains ½.

**Numbers tuned by playing the whole campaign through the engine** (a scripted "sensible pupil"; tune further with real play):
- **One Twin Otter:** about £150–£500 profit a day in the opening days, about £1,100–£2,900 a week, and about £9,000–£22,000 a month in the first year, depending on fuel. The July fuel shock makes a loss unless fares rise.
- **Saab 340 (£45,000):** with £10,000 kept back, affordable around February 2031 (Month 10).
- **ATR 72 (£75,000):** around the Year 1 Review (May 2031).
- **Bigger planes:** each one earns roughly its price back in a year on its best route, so the next one is several months of saving away: E190 £300k, A220 £450k, A320 £550k, 737 £600k, 787 £1.2m, A350 £1.6m, 747 £2m, A380 £2.6m. Concorde (£2.2m) is the prestige wildcard and loses money.
- **Trip costs:** a Twin Otter trip costs £576 + £50 landing fee + fuel; the plane costs £900 a day to keep.
- **The check-the-flight job** only runs when distance ÷ speed lands on a quarter hour, so route distances and plane speeds are chosen to divide cleanly.

## Technical notes

- **Calendar:** the pupil never sees "Round". `S.day` is the date (days since launch day, Sunday 12 May 2030; Day 1 = Monday 13 May), `S.round` the beat in force, and `S.period` the stretch about to run (`{type, from, to, run, forecast}`).
- **Ledger:** every simulated day's ticket money, costs, passengers and seats are kept in `S.ledger`, so charts can show days, weeks or months. `S.history` keeps one entry per period, with its route and plane breakdown and the pupil's forecast.
- **Saves** from before Step 2 keep the airline and restart at the matching beat (save codes now start `ASIM4.`; older codes still load).
- **One state, two views:** the HQ and the wall both draw from the same game state. Each day's history now also stores passengers, seats, trips and a per-route breakdown (passengers, seats, revenue, cost, profit, fare), which the HQ and the wall's results use. Older saves without them show "—".
- Two windows sync three ways: direct `postMessage` to the opened window, `BroadcastChannel`, and a `localStorage` storage-event fallback (needed on `file://` in Chrome).
- No `Math.random()` anywhere in outcome logic. Same world + same decisions = same result.
- Read-aloud uses `speechSynthesis`; the speaker buttons only appear when a voice is available. Test on the classroom machine (teacher panel → Test read-aloud).
- Styling: one shared style block at the top of the CSS is used by both windows. Mid-blue with a navy structure and white text. **Colour roles:** blue/cyan = interaction (primary buttons are a royal-blue → cyan-blue gradient with white text, an inner highlight and a soft glow; selected cards, tabs, steps and the open table cell are cyan); gold = money, stars, premium, awards and valuable opportunities; green = positive/operating; red = danger or loss; orange = delay or warning. Panels are lit from the top left (lighter blue top-left, deeper navy bottom-right, an inset top highlight). The final *Visual polish* block in the CSS holds these overrides and the tokens (`--act-a`, `--act-b`, `--sel`). Panels are square (2px corners) with thin borders; uppercase header bars with a status dot. Chart colours (ticket money blue, costs orange, profit green) pass the colour-blind checks on both the HQ and wall surfaces. Fonts are the system sans for words and Courier New for numbers, so zeros are plain (no slash) and nothing is downloaded. Change Request 4 adds a reading layer at the end: running text at least 22px and numbers at least 32px at the Standard size, mixed case for questions, stories and tables (the small uppercase panel chrome stays), no scanlines over text, task panels at least 90% of the width and no scrolling at 1920×1080 or 1366×768.
- Stage 1 ships depth 1 for every job. Depth 2 is live for pricing (rival fare shown), fuel (two suppliers), check-the-flight (time zones) and cabin (break-even); depth 3 is live for pricing (demand bar) and fuel (bulk deal). Headwinds for check-the-flight are a placeholder.

## Open items (from the brief)

- [ ] Step 3: the commissioning loop for new planes (configure, route, timetable, launch week, review, "Regular service approved"), story callbacks (`S.flags` already records each event choice) and a multi-award finale.
- [ ] Tune Year 2 (long-haul) numbers with real play.

- [ ] Pupil's top three planes to add to the shop.
- [ ] Nudge on or off by default (currently off).
- [ ] Tune prices, starting cash and rewards after first play.
- [ ] Test read-aloud on the classroom machine.
