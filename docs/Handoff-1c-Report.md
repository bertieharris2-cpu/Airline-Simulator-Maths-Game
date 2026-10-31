# Hand-off 1c: everything after week 1 moves a week — report back

*Claude Code, 31 Oct 2026, for Bertie and Fable. Fable's hand-off 1c with workbook v6.4 (D110), confirmed by Bertie. Chapter one only: `airline-opening-prototype.html`. The frozen full game is untouched.*

## In short

- **Week 2 is a plain week:** the plan check on Monday, "Week 2 is flying", the Sunday accounts. Nothing new, nothing to work out.
- **The rest of chapter one is a week later:**

  | Day | What arrives |
  | --- | --- |
  | 15 | The Fuel desk and the what-if sheet |
  | 22 | The shop and the four routes; View trade-offs, ƒ work it out and the capacity tip |
  | 29 | Madrid |
  | 36 | Weekly play |

  The chapter still ends on Sat 28 Dec (day 118). Everything comes from the workbook.
- **Weeks 2, 3 and 4 use the "Week N is flying" page.** Monday keeps the plan opener; the plan check comes before the week flies.
- **Finance's questions.** On each Monday, after his own plan's sums, Finance asks the questions scheduled for that pause. Each is on a small sheet, worked on paper, and counted. A pause never asks more than two counted questions, and his own plan's sums take the slots first.
  - A pupil who keeps his plan is asked two at every pause from P2.
  - A pupil who changes his plan is asked his plan's sums, and Finance's questions wait.
- **Tests:** `chapter1.test.js` 38/38, which now includes a keep-his-plan run from Launch Day to day 37. `numbers.test.js` 38/38.

**One decision of mine needs Bertie's and Fable's look (section 3):** the difference from the plan and the rotating question have moved from the Sunday accounts to the Monday. Sunday comes before Monday, so this is the only way a plan change on Monday can take the slots first, as countingPriority asks.

## 1. The shift (D110)

`tools/merge_v64.py` brings v6.4 into the game's workbook. It is idempotent: run it with the v6.4 file, then `tools/import_world.py`, which reports 0 to fix.
- **Settings:** v6.4's rows, plus `fuelDeskOpensDay` 15.
- **Calendar:**
  - days 8–14 are v6.4's quiet week 2;
  - days 15–35 are the game's days 8–28 moved on seven days, with v6.4's titles;
  - fuel headlines carry the Market price of their day.
- **Chapters 1 runCadence:** "week-skips from day 36".
- **Moved to the new days:** route unlock days, the shop days, ReviewQuestions, the weekend-schedules upgrade and the briefing triggers.
- **Replaced with v6.4's:** PauseSchedule and Roadmap.

The game reads the days rather than holding them. These now come from the workbook:
- the start of weekly play;
- the pause a Sunday belongs to;
- the spreadsheet ladder (click in weeks 1–2; week 3 click, then Σ SUM; drag from week 4);
- the first difference (end of week 5);
- the what-if sheet (day 15);
- the daily colour (week 3);
- the Studio extras (day 22);
- the plane shop (day 22).

**Two fixes the shift showed up:**
- **Day 36 reviewed Sunday twice.** It showed "How did Sun 6 Oct go?" after week 5's Sunday accounts. The first weekly beat in chapter one no longer has that review. The same happened on day 29 before the shift.
- **Week 2 asked two sums on an unchanged plan.** The Monday sheet asked for the cells Launch Day had left to Finance (Paris's tickets and the day's profit). Now a Monday whose plan is the one that flew last week asks nothing, and those cells count as seen, so week 5's Monday doesn't ask them either.

## 2. The TEST run, Launch Day to day 37 (section 7)

TEST Air, played by the toolkit and **keeping its plan** (the toolkit's auto-plan off). This is the new run in `chapter1.test.js`.

| Day | Pages | New |
| --- | --- | --- |
| 1 | Launch Day job, sheet, take-off, results | Launch Day (1 counted: the fare above his, on paper) |
| 8 | Home → plan → **plan check** → **Week 2 is flying** | Nothing new. No sums. |
| 15 | Home → plan → **Finance's questions** → **Fuel desk** → plan check → Week 3 is flying | Fuel desk (*Cash, tank, profit*), the what-if sheet |
| 22 | Home → *Your star rating is public* → plan → Finance's questions → Fuel desk → plan check → Week 4 is flying | The shop, Amsterdam, Frankfurt, Geneva, Barcelona; View trade-offs and ƒ work it out; the capacity tip ("every seat is sold… another plane") |
| 29 | Home → *New today: Madrid, range* → plan → Finance's questions → Fuel desk → Ready → fly | Madrid; the E175 and E190 in the shop |
| 36 | Home → plan → Finance's questions → Fuel desk → Ready → the week | Weekly play; Marrakech |

**Counted questions, keeping his plan:**

| Pause | Counted | Questions |
| --- | --- | --- |
| Launch Day | 1 | Dublin at £100, on paper |
| P1 (days 7–8) | 0 | — |
| P2 (14–15) | 2 | What if Dublin were £100? 38 × £100 = £3,800 · Dublin £90 or £100: +£190 a flight (£380 a day, £2,660 a week) |
| P3 (21–22) | 2 | Time to afford the E190: (£70,000 − £56,210) ÷ £2,442 → 6 days · the range of week 3 (a tie for the best day) |
| P4 (28–29) | 2 | Madrid: 90 × £170 = £15,300 · a rotating question (fuel for two planes needs two types of plane) |
| P5 (35–36) | 2 | Week 5 against the plan: £17,892 projected, £17,328 made, £564 short · seats filled in week 5 |

**The main run (Launch Day to the chapter-one review).** Here the toolkit changes the plan most Mondays.

| Pause | His plan's sums | Finance's |
| --- | --- | --- |
| P2 | 0 | 2 |
| P3 | 2 (the timetable change, Frankfurt's tickets) | 0: both wait |
| P4 | 1 (the Geneva fare) | 1 (Madrid) |
| P5 | 1 | 1 (the first difference) |
| P6 | 2 | 0 |
| P7, P8 | 0 | 2 each |
| P9 | 2 (the month audit, a fare) | 0 |
| P10 | 1 | 1 |
| P11 | 0 | 2 |
| P12 | 1 | 1 |
| P13 | 2 | 0 |
| P14 | 0 | 2 |

Never more than two at a pause.

**The Roadmap on Home:**

| On day | NEXT | LATER |
| --- | --- | --- |
| 8 | Mon 16 Sep · The Fuel desk and the what-if fare sheet | Mon 23 Sep · New routes |
| 15 | Mon 23 Sep · New routes: Amsterdam, Frankfurt, Geneva, Barcelona | |
| 22 | Mon 30 Sep · Medium haul: Madrid | |
| 29 | Mon 7 Oct · Marrakech, and a week at a time | |

All of these are checked by the test.

## 3. The question schedule and the counting priority (sections 2 and 3)

**The order problem.** A pause is the Sunday accounts and the Monday plan, and Sunday comes first. If the Sunday sheet asks a counted question, there is no way to give the slot to a plan change he hasn't made yet.

**What I did.** Every chapter-one Monday from day 8 has a step **Finance's questions ("Before week N flies")**, after the Studio's sums and before the Fuel desk and the plan check.
- It counts what the pause has asked so far (his plan's sums, a plane's time to afford, a new route's tickets) and asks the scheduled questions only while there is room. Those questions come from the Calendar's gatedCalc for the Sunday and the Monday.
- A question with no room waits for the next pause, after that pause's own questions.
- The Sunday accounts now add up the week and the average (built, not counted). The difference from the plan and the rotating question have moved to Monday.
- Settings `countingPriority` = "off" puts them back on Sunday.

**The questions, as built:**
- **What-if: the first sum (P2).** Seats filled × fare at one step up on his busiest route.
- **Modelling (P2, then from P6):** see section 6.
- **Time to afford (P3).** (Price − cash) ÷ profit a day, rounded up. It isn't asked here if the shop has already asked it.
  - TEST Air has £56,210 on day 22 and can buy every plane in the shop. So the question uses a plane on sale within two weeks: the E190, on sale day 29.
  - With nothing to save for, a rotating question takes its place.
- **Fuel for two planes (P4).** My reading of "litres per seat": fuel a trip ÷ seats for his second type of plane, beside the first. It needs two *types* of plane; a pupil with two Twin Otters gets a rotating question instead.
- **Madrid's possible revenue (P4).** Who wants to fly a day × fare, for the route that opens that day. There is no market sheet in the game yet, so this is a small sheet of its own.
- **The difference from the plan (P5, then about every third pause).**
- **The rotating question (P3, P5, from P6).** Best day, range, seats filled, worst day, in turn. If two days tie for best or worst, it asks the range.
- **P6 on:** the difference when it is due, otherwise a rotating question, then the modelling question.
- **When one of a pause's two scheduled questions can't be asked,** a rotating or modelling question fills its slot. P1, which has nothing scheduled, stays quiet.

**One edge.** If he changes his plan *after* Finance's questions (Change my plan at the plan check), the change's sum finds no room and is built as a formula, which doesn't count.

## 4. Bertie's answers (section 4)

- **The "Week N is flying" page for weeks 2 to 4** (Settings `weekFlyingPages`), with the plan check on Monday and no Close the day.
  - Monday flies on the page with the rest of the week; week 5 keeps the board.
  - **Change my plan** at the check opens the timetable. Then come the change's sums, then back to the check (checked on day 22).
- **View trade-offs and ƒ work it out** are hidden until day 22 (`studioExtrasFrom`).
- **The capacity tip** is hidden until the shop opens.
- **Speeds** come from Settings `weekSpeed`.

## 5. Launch Day columns

The columns were already right. They are three fares in a row from the route's table, and the roles go by column: B demonstrated, C built, D on paper.
- **His fare at £80:** £70 demonstrated, £80 built, £90 on paper.
- **His fare at £70, the bottom:** £70 (his) demonstrated, £80 built, £90 on paper.

Checked at both.

## 6. The modelling question

- **When his plan leaves money on the table.** For every route and every fare, Finance works out his own plan's profit a day. If some fare earns at least `tipGainGate` (£50) a day more, he compares his fare with the next fare in that direction, one step.
  - The sheet has two columns, Now and What if: passengers, ticket revenue, costs and profit a flight (ƒ).
  - He works out **the difference for one flight** on paper (counted). Finance then shows a day (× his flights on that route) and a week (× 7).
- **When his plan is already good:** Finance suggests two changes (one step up on his busiest route, one step down on another). He picks one and works out the same difference. It may come out negative, and the sheet says his fare is the better one.
- **It is asked again while the money is still there.** A pupil who never changes his fare sees "Dublin: £90 or £100?" at P2, P6, P7 and so on. Should the second time look different (for example "You looked at this on Mon 16 Sep"), or switch to the other form?

## 7. For Fable: v6.4 as it came

`merge_v64.py` took only the intended changes. These need a look in your copy:

**Leftovers and extras in the Calendar:**
- old rows on days 19, 24, 25 and 28;
- a long_haul_open event on day 29;
- a New York headline on day 30;
- a fuelCost gatedCalc on day 31;
- "airline type confirmed" on day 32.

**Fuel:**
- the fuel headlines on days 15, 17 and 19 say £1.68, day 22 £1.62 and day 29 £1.74;
- the Calendar's £1.73 against the Market's £1.74.

The game uses the Market's price of the day.

**Months:**
- Chapters 1 runCadence still says months from 2 Dec, while Mechanics and the Roadmap say day 85.
- The game follows runCadence.

**Smaller points:**
- **Weekday column:** "Monday" in v6.4 against "Mon" in the game.
- **Day 13** has phase "day", which does no harm (weekends come from the date).
- **Mechanics labels** are stale; the game doesn't read them.
- **Chapter-two calendar rows** 736–742 differ from the game's; they were not taken.

**Kept from the game's workbook** (v6.4 had dropped them):
- `fuelDeskOpensDay` (now 15), `planCheckLookBelow`, `week1ExampleProfits`, `reviewExampleWeeks`, `snacksInYearOne`;
- Chapters snacks, the briefing beats, `formulaMarks`, `bustRule`, `standingAim` and the mystery shopper.

**New ScreenText rows (the game's own sheet), so Bertie can change the words:**
- `plancheck.week*` and `weekflies.week` (weeks 2 to 4);
- `pauseq.*` (Finance's questions).

**Numbers to look at:**
- TEST Air has £56,210 on day 22 and £91,208 on day 36. Every plane in the day-22 shop is affordable, so "time to afford" only means something for the E190.
- Week 2 is the plain week. Does a pupil feel it as empty?

## 8. What to check in the next play-test

- Does week 2 feel like a breather, or empty?
- Finance's questions on Monday:
  - Does he read the question in the panel on the left, work it in his book and type it in?
  - Is the difference from the plan as clear on Monday as it was on Sunday?
- Modelling: does "+£190 a flight, £380 a day, £2,660 a week" make him change his fare?
- When he has changed his plan, does he notice that Finance's questions waited?

## Files

- **New:**
  - `src/opening/parts/p6g_pauseqs.js`, `tools/merge_v64.py`, `docs/Handoff-1c-Report.md`;
  - `docs/screenshots/handoff1c/` (13);
  - `data/incoming/handoff-1c-31-oct/` (v6.4 and the hand-off).
- **Changed (chapter one, behind `ch1()`):** `p6a_ch1.js`, `p6b_signal.js`, `p6c_desks.js`, `p6e_notes1915.js`, `p6f_afterlaunch.js`, `p5e_colour.js`, `p5y_h21.js`, `p1_head_ch1.css`.
- **`p5v_sheet_more.js`:** the week review sheet works without a difference row; nothing changes when it has one.
- **Data:** `data/Airline-World-Workbook.xlsx`, `p2_data.html`, `data/Import-Report.md`.
- **Tests:** `chapter1.test.js`, `numbers.test.js`, `tools/make_ch1_jumps.js`, the remade Jump to… saves.
- **Docs:** README, State of the Game §0zo, Chapter-One-Run-Through.
