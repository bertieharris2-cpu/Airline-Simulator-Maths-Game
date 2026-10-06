# Airline Simulator — Maths Game

A single-file, offline airline business simulator for one pupil, built to the Build Brief (Oct 2026).
Decisions from data first; one gated, multi-step calculation per round at Welsh Progression Step 3.

## Files

| File | What it is |
| --- | --- |
| `airline-opening-prototype.html` | **The active development version.** Setup, Launch Day and Days 1–4, then the campaign through Phase 7: weeks, months, the first year and the first aircraft purchase, ending at *Year 1 complete*. See *Opening prototype* below. |
| `airline-simulator-full-reference.html` | **Frozen.** A snapshot of the complete simulator (weeks, months, later aircraft, international routes, storyline, awards, challenges). Critical fixes only until the opening is approved (so far: the full-screen button, which the teacher's triple-tap corner used to cover). |
| `airline-simulator.html` | The complete game, identical to the full reference for now: the HQ (laptop) and the Operations Wall (IWB) in one file. Double-click to run in Edge/Chrome. No internet needed. |
| `src/opening/` | **The prototype's source.** `parts/` holds the pieces (style, data, screens, script) that `build.py` joins into `airline-opening-prototype.html`; `tests/` holds the browser tests. Edit the parts, never the built file. See *Building and testing the prototype* below. |
| `data/` | The world data built in Claude chat: `Airline-World-Workbook.xlsx` (routes, aircraft, calendar, market, events) and `Balance-Report.md` (what was tested and how). `Import-Report.md` is written by the importer: what loaded, what to fix in the workbook, and the prototype's own figures beside the workbook's. `fable-routes-pass1.json` holds the engine rules (time bands, duty). **The prototype runs on the workbook's numbers.** |
| `src/opening/engine/world-engine.js` | **The world engine** on the workbook's rules (Fable Pass 1, section 0, in `data/fable-routes-pass1.json`): one aircraft's day with five time bands, time-locked and flexible passengers, costs per service and per day, and a second crew past 12 hours' duty. `node src/opening/tests/balance.test.js` checks it against every figure in `data/Balance-Report.md` (all 40 reproduced, with school rounding). **The game uses it:** `src/opening/parts/p4a2_workbook.js` applies the workbook's values as the page loads and `p4h_world.js` puts its rules into the game's model; `node src/opening/tests/engine.test.js` checks the game prices plans exactly as the engine does. |
| `tools/import_world.py` | Copies the workbook's live rows into the prototype's data as `data-workbook` and writes `data/Import-Report.md`. Run `python3 tools/import_world.py` after editing the workbook (`--check` writes only the report), then `python3 src/opening/build.py`. |
| `prototypes/hq/` | The HQ look-and-feel explorations that led to the current design. Standalone; not used by the game. |
| `paper-backup-pack.html` | Printable A4 pack: decision cards, calculation sheets, review cards and a teacher answer sheet for one round. Open and press Ctrl+P. |

## Opening prototype

The opening is being made excellent before the later campaign continues. `airline-opening-prototype.html` is self-contained like the full game, and keeps its **own saves** (it never shares a save with the full game).

**The HQ desktop.** After the short onboarding (name, paint your planes, home airport) a start-up sequence runs (*Initialising headquarters… Operations online · Finance standby · Network standby · Fleet awaiting delivery · System ready*, or press *Enter HQ*) and everything else happens inside one HQ, in three layers:
- **The chrome stays put.**
  - **Top bar, in zones:** airline and strategy · date and *Day N of operations* · status chip · reputation · the **cash balance** (the only place cash is shown, apart from the fuel calculation) · Alerts · Operations Wall · Home · Full screen.
  - **Left nav** (icon and label): Overview, Today's Plan, Network, Fleet, Finance.
- **Modules come online as the airline grows.**
  - Network, Fleet and Finance start locked, with a small note under each: *After first flight*, *From Day 1*, *After Day 1*.
  - **Finance** comes online after the first flight, **Network** when the Day 1 timetable starts, and **Fleet** after Day 1.
  - Each one lights up with a short system notice (*Finance online*). Older saves unlock whatever their history implies.
- **The workspace: plan rail · task · dock,** with an action bar across the bottom (a one-line hint and the main button).
  - **The plan rail is the day in stages.**
    - Launch Day: *Airline ready* (aircraft, first market) → *Build the service* (demand, one service, timetable) → *Prepare to fly* (fares and forecast, fuel) → *Launch* (Start operations).
    - Days 1–3: *Plan the day* → *Prepare to fly* → *Launch*.
    - A finished stage folds into one resolved line with a green edge and a summary (*✓ Service built · Paris ×3 · 57 seats*). Click it to open its steps; any step can be reopened with **Edit**.
  - **The dock (right):** the context for the current activity:
    - *Home base*, *Market comparison*, *Aircraft and market*, *Flight timing*;
    - *Aircraft status* with a small departures board that gains a row as services are added;
    - *Aircraft & Market Context*, *Today's forecast*, *Fuel status*.
    - **Help and guidance** rows sit underneath. Help, the working space and calculations dock here for a moment, and closing them (✕) brings the context back. The step underneath never changes. The dock can be folded away (›).
- **Never ask twice.** A setting stays set until it is edited.
  - **No fare is decided before it is costed.** The timetable and extras are set first; fares are chosen only on the costing screen (see *Fares are decided by modelling* below).
  - Editing anything from later in the day shows **Back to …** and returns straight to where you were.
  - The morning *Today's Plan* card lists the standing timetable, fares, on-board offer, departure time and fuel, each with Edit.
- **Launch:** a final *Ready for launch* step lists the operating plan (timetable, fare, extras, fuel, forecast). Each item has Edit, and a warning if it needs updating, for example if the plan changed after the forecast. Then the big **START OPERATIONS**. Fuel orders are paid at this point.
- **Calculations in the dock, with no number pad.**
  - A figure still to work out shows as **Complete figure** in its cell.
  - Choosing it opens the *Calculation* dock: the sum stacked like a written sum (*Total revenue £3,040 / − Total costs £2,562 / = Profit [ ]*), a large answer box with the cursor already in it, and **Confirm figure** (Enter works too).
  - Wrong: *That figure doesn't match the forecast. Have another look.* Right: *Forecast updated*, the figure lands in its cell with a short highlight, and the dock offers **Next figure** or closes by itself.
  - Only on Launch Day does the first figure open by itself. The fuel order cost works the same way, without leaving the fuel screen.
- **The working space** is a dock tool too: the figures in play pinned at the top, a pad (pen, eraser, undo, clear), and *Show on the board* for the Operations Wall.
- **One service** reads as an operations sequence:
  - a route strip `09:00 LHR ━━ CDG ━━ LHR ● READY 12:40`;
  - a stage indicator *Outbound · Turnaround · Return · Ready again*;
  - blue flights and steel-grey hatched turnarounds;
  - a large **READY AGAIN 12:40**, then *Build the day*.
- **The timetable** draws the operating day as one row per service (LHR → CDG, turnaround, CDG → LHR, *Ready again*) and the passengers as a card per service: cyan for passengers, outline for empty seats, orange for no seat.
- **The home airport** has the four airport cards on the left and a locator map on the right: the real coastline cropped to Britain, Ireland and northern France, with all four airports, the chosen hub highlighted, and route lines to Paris and Dublin labelled with the flight times.
- **The visual language:**
  - one navy palette lit from the upper left: page #061426 → shell → panels → the active workspace → the dock (slightly brighter, with a cyan edge);
  - cyan panel titles in mixed case; 0–2px corners;
  - primary buttons in a blue gradient; selected items get a cyan edge and a blue wash;
  - **gold only for money and prestige**, green for done, orange for "no seat", red for real problems;
  - words and figures in the system sans with even-width digits. A modern monospace (Cascadia/Consolas, never Courier) is used only for the calculation dock's column sum and the wall's departure boards.
- **Strategy cards** label their meters: *Fare level · Higher*, *Service level · High*, *Passenger volume · Lower*.
- **The Overview KPI row** shows how the airline is operating: last profit, revenue, passengers, seats filled, fuel stock. Cash and reputation stay in the top bar.
- **Start operations** returns to the Overview in live mode: the clock, the planes on the map and Live Operations move together. The results land on the HQ (revenue − costs = profit, forecast against actual, who flew; Passenger Feedback cycles through the reviews). ***Close the day*** moves to the next morning.

**The opening: one new idea a day.** Every day has the same five stages on the plan rail: **1 Plan** (*What will your airline do?*) · **2 Cost** (*Check today's new numbers*) · **3 Test** (*Try other ideas with the model*) · **4 Operate** (*Fly the plan*) · **5 Review** (*What happened?*).
- **Cost** is the one place each day where the pupil checks a figure. It shows only the plan they chose, and only *today's* new idea is typed; every other figure is the model's (with a **ƒ model** button that opens the rule and its numbers in the dock). *Total revenue*, *Total costs* and *Profit* sit between highlighted lines (in normal type, not bold); the cost lines fold into *Total costs* with a *What's in this?* breakdown.
- **Test** is free modelling with no compulsory arithmetic: the pupil's plan stays on top, the **test plan** has big steppers for the controls introduced so far, and the model shows passengers, empty seats, people without a seat, revenue, costs, profit and the difference ("+£380 more profit than your plan"). Good ideas can be **saved as idea cards** and loaded or flown later. Then *Fly my plan* or *Fly the test plan*.
- **A control appears only once its idea has been introduced** (no snacks on Launch Day, no departure times before Day 3, no Dublin before Day 4). On the day it arrives it carries a small **NEW** tag on the Plan screen.
- **What's new: a short introduction to each new idea.** On the days a new mechanic arrives, the Plan stage opens with *What's new* (about a minute, not a tutorial). It has three pages:
  1. **What's new:** what it is, with a picture made from the game's own figures.
  2. **The maths:** the rule in a large box, and a worked example (with a "one way to work it out" line for the harder sums).
  3. **Your turn:** one question, *Which sum works out…?*, with three sums to choose from. A wrong choice says why ("Adding gives £15, but every one of the 10 passengers pays £5. Have another go."). The right one shows the answer and a *Think about it as you plan* prompt, and opens the Plan.

  The side panel lists the **key words**. The examples never use today's own figures, so the Cost step still asks the pupil. It can be reopened from the rail (*What's new · Edit*). Introductions:

  | When | Introduction | The rule | Your turn | Think about it |
  | --- | --- | --- | --- | --- |
  | Day 1 | Snacks on board | cabin sales = number buying × price (and the stock is a cost) | 10 passengers buy at £5 | more people at £3, or fewer at £5? |
  | Day 2 | Buying fuel | cost = litres × price per litre (500 × £1.30, partitioned) | 1,000 L at £1.30 | why buy more fuel than you need today? |
  | Day 3 | Departure times | empty seats = seats − passengers, and the crew's day | 19 seats, 12 passengers | when do your passengers want to fly? |
  | Day 4 | A second route | ticket revenue = passengers × fare, route by route | 16 passengers at £90 | how will you share the aircraft's day? |
  | Week 1 | Planning a whole week | profit this week = profit a day × 7 | £600 a day | why might one week make more than another? |
  | The first month (before fuel) | Buying fuel ahead | cost = litres × price; the same litres at two prices | how much more is £1.60 than £1.50 a litre? | what does the news say? When would you fill the tank? |

  Each introduction is data: a beat names it with `"intro"` in `data-world`, and the text lives in `INTRO` in `src/opening/parts/p4j_intro.js`.
- **The on-board choice** is four cards on the Plan screen, each with its rule (*Half of passengers buy · stock costs £1 an item*). On a 1366×768 laptop the cards keep their rule text on Day 1, then become one-line cards from Day 2 (the rule shows on hover). The Test screen keeps a row of chips. From Day 2 the plan's summary line also shows the litres of fuel the plan burns.
- **After the day's new figure,** a short notice marks the change: *Cabin sales model online · Dragon Air can now work out cabin sales automatically when you test different options.* It is narrative, not assessment: there is no answer counting.

| Stage | Controls in Plan and Test | New idea | Cost: what the pupil works out | From now on the model does |
| --- | --- | --- | --- | --- |
| Setup | name, livery, home airport, the Twin Otter, the first market | the airline | nothing | |
| Launch Day (Sun 12 May) | services and fare | capacity, ticket revenue, costs, profit | **ticket revenue** = passengers × fare; **profit** = total revenue − total costs | the cost lines; fuel is free (launch deal) |
| Day 1 | + on-board service | cabin sales | **cabin sales** = number buying × price | ticket revenue; profit is **built** (choose Total revenue − Total costs; the model works it out) |
| Day 2 | + fuel: the tank and buying | fuel is now the airline's cost | **fuel cost** = litres × price per litre | revenue, cabin sales, profit (the order bill too) |
| Day 3 | + a departure time for each service, with the demand curve | empty seats, peaks, crew | **empty seats** = seats − passengers, for one service | fuel cost and everything above |
| Day 4 | + the second market: one aircraft, two routes | route allocation | **built once**: Dublin passengers × Dublin fare | everything |
| End of Day 4 | | the **Regular Operating Plan** | nothing: approve the plan (or change it first) | |
| Fri 17 – Sun 19 May | runs by itself | | | |
| Week 1 (20–26 May) | the established controls | the weekly projection | **projected profit** = profit a day × 7 | the daily figures |

- **The teacher panel still overrides any tool** (Calculate, Build or Model). *Build* now means: choose the two figures and the sign; the model then works it out.
- **The world's numbers come from the workbook** (`data/Airline-World-Workbook.xlsx`): Dublin 450 km and Paris 300 km from every home airport, fares £70–£110, people at each fare from each route's demand table, the Twin Otter at £150 an hour in the air and £600 a day (bought at the £2,500 launch deal; normally £5,000), the Saab 340 at £9,000 and the ATR 72 at £15,000, and the home airports' landing fees, turnarounds and passenger charges. A service costs its flying hours × the hourly cost + landing fees at **both** ends + fuel + the passenger charge at home.
- **Time-of-day demand (from Day 3):** five bands (early 06–09, mid-morning 09–12, midday 12–15, afternoon 15–18, evening 18–22). A service belongs to the band it leaves home in. In each band some people must fly then (demand × the route's time-sensitive share × the band's share, rounded as at school); the rest are flexible and spread across the day's services while seats remain. Before Day 3 everyone is flexible. Dublin is a business shuttle (half must fly at their time, mostly early and evening); Paris a city break (seven in ten, and almost nobody at midday). A crew works 12 hours, from half an hour before the first departure to half an hour after the last landing; a longer day needs a second crew (£250), so flying both peaks has a price.
- **Growth:** from Week 3 (Weeks 1 and 2 stay flat), each route's demand grows by its archetype's weekly growth (2% a week) up to its ceiling (Dublin +30%, Paris +40%), the same all through a week or month so projections still hold. The reviews say so when it explains a difference ("More people wanted to fly as word spread…").
- **Departure times:** each service has its own time (30-minute steps); a service can't leave before the aircraft is ready again. Services can be added, removed and (from Day 4) switched between routes with ⇄.
- **Fuel:** free on Launch Day and Day 1 (the launch deal). From Day 2 the tank keeps each batch bought, flights burn the oldest fuel first, and buying fuel moves cash into the tank (it is a cost only when burned).
- **Fuel in the weeks:** when the Regular Operating Plan is approved, the fuel left in the tank goes back to the supplier for what was paid. From then until the monthly plans, fuel is **bought as it is used at that week's price**: no tank and no deliveries, so *profit a day × 7* is exactly the week's profit. From the months the tank comes back, with buying ahead when the price looks low (the tank's size is the limit). A fuller fuel market, where the pupil reads the world's data and predicts the price, comes later.
- **The plans archive:** Finance → **Plans** lists each day's costed plan, the best idea tried, the plan flown, its projected profit and what actually happened. *Compare with earlier days* opens the same list in the dock on the Cost and Test screens.
- **Answers are checked against the working on screen:** if the sum in the dock and the stored figure ever disagree, the pupil's answer from the dock is accepted and the case is recorded in the teacher panel (**Calculation checks**). After three wrong tries, *Show me the answer* appears; a loss typed without its minus sign gets a hint.
- **The airline type** (premium, full service, value) is chosen at the **Year 1 review**, when the airline starts to grow. The opening is about profit.

**Home airports.** London Heathrow (T5 or T4), London Gatwick (North or South), London Luton, Manchester (T1 or T3): each airport has a landing fee and a demand modifier, each terminal a turnaround time and a charge per passenger, all from the workbook (Gatwick South and Manchester T3 are not in the workbook yet and keep the prototype's values). The demand tables are Heathrow's; another home scales them by its modifier against Heathrow's +15%. Distances are the workbook's, the same from every home (so Manchester has London's flight times for now). On-board sales (not in the workbook yet): nothing, snacks at £3 (half buy), at £5 (3 in 10 buy), or free (£2 a passenger); stock costs £1 an item.

**Launch Day (high scaffold):** the market (Paris: 50 people at £90, aircraft-sized groups 19 | 19 | 12), one service start to finish (with one time question), the timetable (×1 / ×2 / ×3), the fare, then **Cost** (ticket revenue and profit, opened in the dock), **Test**, **Operate** and the results on the HQ (revenue − costs = profit, projected against actual, who flew).

**The maths toolkit (the teacher decides).** Each maths tool is at one of three levels, set in the teacher panel's **Maths tools** section (Ctrl+Shift+T):
- **Calculate:** the pupil works the figure out with *Complete figure* and the calculation dock.
- **Build:** the pupil chooses the two figures and the sign (+ − × ÷) from labelled chips; the model then works it out. The order matters for − and ÷. *That's my sum* checks the pair; a wrong pair says "Those figures don't make the …".
- **Model:** the airline's software fills the figure in, and the cell carries a small **ƒ model** button that shows the rule and its numbers.

More about the levels:
- **The tools:** Ticket revenue, Cabin sales, Fuel cost, Empty seats, Revenue on a new route, Total costs, Profit, Weekly projection, Week/month totals, Difference, Average, Annual projection and Time to afford. Capacity, Fuel required, Timetable and Investment are always models.
- **Defaults follow the opening's script** (see the table above), with no competence tracking: each relationship is calculated on the day it is introduced and modelled after that. Difference, Average, Annual projection and Time to afford are the pupil's own figures when they first appear.
- **Teacher controls:** each tool has Calculate / Build / Model buttons and *Use the default*. There are also three buttons for all tools at once: *Phase defaults for all*, *Pupil calculates all* and *Model does all*.
  - A change applies straight away; a figure that stops being typed closes.
  - The settings travel in the save code.
- **The pupil's view:** Finance → **Models** lists every tool met so far as *You work it out*, *You build it* or *Model online*.

**Phases 4–7: from the first week to the first aircraft.** Time speeds up after Day 4, and each new stage opens with a short stage card.

| Phase | When | What the pupil does |
| --- | --- | --- |
| 4 Establish the timetable | Fri 17 – Sun 19 May (the Regular Operating Plan runs by itself), then Weeks 1–3 | The same Plan → Cost → Test → Operate → Review rail. Week 1: **projected profit = profit a day × 7**. Weeks 2–3: review last week and work out the **difference** (the rise or fall in profit); the model costs the week. Fuel for the week, with automatic deliveries at the market price + 10p. |
| 5 First stable period | 10–30 June, July, August | Review with an **average** (a week over Weeks 1–3, then a day over the month). **Current plan or test plan:** the current plan keeps flying, and the test plan is a copy to change. When they differ, the pupil works out the difference, then keeps the current plan or switches. |
| 6 The first year | 1 September → **Run the year** to 30 April | Average month (July and August) → **annual projection**: average × 8 months + cash now = projected cash in May. **Time to afford** the Saab 340 and ATR 72: cash − emergency money (£20,000) = cash you can spend; price − that = still needed; ÷ average month = months, rounded up. Launch shows the projection; the year runs month by month on the HQ. |
| 7 First aircraft purchase | 1 May 2031, the Year 1 review | **Year 1 in figures** (passengers, profit, best and hardest month, reputation). Projection against actual, with the difference typed and the reasons: month lengths, the fuel price through the year, profit a day against July and August, automatic fuel deliveries, and cash against profit. Each aircraft's estimated month against the month it really became affordable. |

After the review:
- **The shop:** the Twin Otter (owned), Saab 340, ATR 72, and the E190 (shown as too big for these routes).
- **The investment sheet:** Saab 340 | ATR 72 | Keep saving. The rows are:
  - price, cash after buying, emergency money, still above it?;
  - seats, extra profit a day (from the **Investment model**, which adds the aircraft with the best timetable for the people who have no seat), days, extra profit a month;
  - **months to pay for itself**.
- **Deciding:**
  - *Buy the …* appears for an aircraft that keeps the emergency money.
  - *Keep saving* flies another month and comes back to the aircraft.
- **The order:** the purchase order deducts exactly the price and puts the aircraft **on order**; the Fleet view shows it with its delivery date.
- **The end of this pass:** a short *what happens next* screen (commissioning is Phase 8), then **Year 1 complete**.

**Forecast = actual.** Every week and month forecast uses the real engine, dry-run on a copy of the airline (fuel batches, automatic deliveries, terminal charges, on-board sales, crew). A plan that is not changed lands exactly as forecast, fuel included. The test checks this for every week and month. In the weeks the week's cash also moves by exactly the week's profit, because fuel is bought as it is used.

### Live operations on the Operations Wall
*From the Live Operations / IWB Immersion Brief: "Routine time compresses. Meaningful moments become visible." First pass: Launch Day to Week 3. The evaluation and ideas for later stages are in `docs/Live-Operations-Evaluation.md`.*

- **The handoff.** The Ready screen's button is **SEND TO OPERATIONS WALL** (**SEND THE WEEK TO OPERATIONS** in the weeks). The wall plays a short ritual: *Operating plan approved · Dragon Air operations · Schedule received ✓ · Aircraft ready ✓ · Gates opening ✓ · Live operations starting*.
- **Where it plays.** With an IWB window open, the wall plays there and the HQ shows a small Operations card with the clock and the pace buttons. With no IWB window, the Operations Wall opens full screen on the laptop by itself (teacher panel: *show live operations full screen on this screen*), with **◀ HQ** to look at the HQ and **Watch on the Operations Wall** to come back. At the end, the wall shows **Day complete** (or **Week complete**) and **Review at HQ ▶**.
- **A service in full:** check-in, preparing, boarding (the seat dots fill one by one; seats that stay empty are dashed), final call, gate closed (*19 / 19 · FULL LOAD*, or *17 / 19 · 2 empty seats*; people left without a seat wait beside the cabin), pushback, taxi, take-off, the flight (a progress track, ETA and km to go; the route lights up behind the aircraft), cabin service from Day 1 (*10 passengers bought snacks · +£30*, the model's own figure), descent, landing, the turnaround checklist (passengers off, bags, fuel, cabin, boarding for the return), the return, the home turnaround and **Ready again**. The departures and arrivals boards change with it (CHECK-IN G2, BOARDING G2, FINAL CALL, GATE CLOSED, TAXIING, AIRBORNE, LANDED, DELAYED), the aircraft card shows G-DAAA's flight, passengers, fuel, ETA and next service, and short announcements appear as text (with a soft chime, and spoken where the computer has a voice; teacher panel: *airport chimes and announcements*).
- **How much is shown in full.** Launch Day: every service. Days 1–4: the first service in full and the others briskly (a first service on a new route, such as Dublin on Day 4, is always in full). The weekend after the Regular Operating Plan: the first day in detail, then Saturday and Sunday compressed. The weeks: a detailed first day if the plan changed, otherwise one **featured flight**, then the rest of the week compressed: the calendar ticks over, the aircraft fly quickly, and flights, passengers, tickets and sales, profit so far and on-time count add up. At standard pace Launch Day takes about 3½ minutes, a later day 2–4, the weekend about 3½ and a week 2–3. **1× Live · 2× · Next flight (Next event) · Pause · Skip to summary** are on the wall and the HQ; the teacher panel sets the pace (Brisk, Standard, Slow).
- **Moments.** In a detailed day a moment is a ribbon over the flight panel; in compressed time the simulation slows down (*Significant event · simulation slowed*), the event card replaces the week panel with the seat map where it helps, and then *Simulation resuming*. All observe-only, with nothing to answer. They come from the model's own figures: **first departure**, **first full flight**, **first Dublin service**, **100th / 500th / 1,000th passenger**, a **full service with people left behind**, a **quiet service** (neutral wording), a **tight turnaround** (*ready at 12:20, leaves at 12:20: no time to spare*), and a **storm** in Week 3 (data: `"live": {"weather": {"day": 2, "delay": 40}}` on the beat). Everyday moments (full, quiet, tight) appear in compressed time only once for each plan, so an unchanged week is calm. The summary adds **New profit record** and **New weekly record**.
- **The model is untouched.** The show is built from the model's flights: no random no-shows, no extra demand, and projected = actual still holds. The storm only delays a flight on the wall (the last one of the day, so nothing is knocked on), and the review says so: *the airline did not cause the storm*.
- **Not yet:** months and the year keep the plain run (the brief's month timeline is in the evaluation), decision pauses, no-shows, knock-on delays and weather costs wait for the uncertainty stage.

### Building and testing the prototype
- **Build:** `python3 src/opening/build.py` joins `src/opening/parts/` (in order: head, data, HTML, then the scripts `p4a_core`, `../engine/world-engine`, `p4a2_workbook`, `p4b_control`, `p4d_opening`, `p4e_toolkit`, `p4f_campaign`, `p4g_opening2`, `p4h_world`, `p4i_liveops`, `p4j_intro`, `p4c_display`) into `airline-opening-prototype.html`. It checks the JSON and the script syntax, and lists in `src/opening/overrides.txt` the functions a later part replaces.
- **Tests** (Playwright, with the pre-installed Chromium): `node src/opening/tests/opening.test.js` plays the opening and the campaign as a scripted pupil. It checks each day's typed figures, that each *What's new* waits for the right sum and explains a wrong one, that the controls appear only once introduced, that projected = actual, and that nothing overflows the screen. Options: `UPTO=9` stops at a beat, `POL=typical|medium|weak` sets the player, `MKT=dub` starts on Dublin, `W=1915 H=891` sets the screen size, `SHOTS=0` skips screenshots, and `OUT=` sets the folder for them. `node src/opening/tests/answers.test.js` checks answer checking (the working on screen, *Show me the answer* and the teacher's Calculation checks). `node src/opening/tests/balance.test.js` (no browser) checks the world engine against the Balance Report, and `node src/opening/tests/engine.test.js` checks the game's model against the engine, plan by plan. `node src/opening/tests/liveops.test.js` watches the Operations Wall from Launch Day to Week 3, holding the clock at each phase and moment for a screenshot (`IWB=1` also opens the wall as its own window and checks its buttons reach the HQ). The opening test runs live operations at speed on the HQ.
- **Rounding:** school rounding (halves up) everywhere. The Balance Report's engine rounded halves to even, which moves three of its figures: Paris with two services back to back £877 → £792, and Frankfurt's best plan for the Saab £1,185 → £1,100 and the ATR £92 → £7 (both now at £100). The balance test expects the school-rounding figures.

**Balance on the workbook's numbers** (scripted players, the whole campaign to Year 1; every week and month lands exactly as projected):

| Test player | Week 1 profit | Cash on 1 Sep | Cash at the Year 1 review |
| --- | --- | --- | --- |
| Tries ideas and flies the better one, Heathrow → Paris | £4,998 | £109,800 | £471,401 |
| The same, Manchester → Dublin | £7,084 | £151,737 | £541,207 |
| Keeps its own plan, both routes, snacks | £5,656 | £114,366 | £456,938 |
| Keeps its own plan, Paris only, nothing on board | £3,423 | £82,940 | £362,245 |

- **The later campaign does not fit these prices yet.** With the Saab at £9,000 and the ATR at £15,000, every player can afford both by July, so *Time to afford* (Phase 6) comes out at 0 months and the Year 1 purchase is no decision. The workbook means the second aircraft to arrive in week 2, with buy, finance or lease; that needs the day plan settled in the workbook first.
- **The year projection** (average of July and August × 8 + cash now) now falls short by about a quarter, because demand keeps growing until the autumn; the review gives growth as a reason.
- **Keep saving:** a pupil who can't afford either aircraft at the review can *Keep saving* one month at a time, or *Save until the … is affordable* (one run, month by month, up to three years). The Overview says how many months it took.
- **Reputation is switched off for now** (teacher's decision): it stays at 3 stars, is hidden from the top bar, and nothing in the game changes it (fares, snacks, events or challenges). It will return when the pupil chooses what sort of airline to be. To switch it back on, set `reputationOn: true` in `data-world`.
- **Tuning:** edit the workbook and run `python3 tools/import_world.py`, then `python3 src/opening/build.py`. The prototype's own values in `data-world` and `data-planes` only matter for routes and aircraft the workbook does not have yet (Madrid and beyond; the E190 and bigger).

**Source:** `src/opening/` (see *Building and testing the prototype*); the full game's source is untouched.

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
