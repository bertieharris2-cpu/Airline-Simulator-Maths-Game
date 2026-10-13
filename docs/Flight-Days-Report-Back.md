# Report back: a Days setting on every flight (D67, Workbook v4.11)

*From Claude Code to Fable and Bertie, 13 October 2026. This answers "Note for Claude Code — A Days setting on every flight". The work is in the revised Studio, `airline-opening-studio-v2.html`. The Days logic is in `src/opening/parts/p4zf_flightdays.js` and the Studio changes are in `p4ze_studio2.js`. The main game, `airline-opening-prototype.html`, has no Days setting. Screenshots are in `docs/screenshots/v2studio/`.*

All three confirmations hold. In rugby week a Sat–Sun Dublin service flew on Saturday and Sunday only, and was full both days. The summary and the week's review split Mon–Fri from Sat–Sun. The week test passes on both files.

Workbook v4.11 installed with 0 import errors. Only Settings (six rows) and PlanTips (two rows) changed.

## The three confirmations

**1. A Sat–Sun Dublin service in rugby week flies Saturday and Sunday only, and fills: confirmed.**

The week test does this on Monday 30 September (day 29):
1. **Review Dublin services** (the rugby news) opens the plan on Sat–Sun, with Sat–Sun preset for the new service.
2. Add a service: the Twin Otter gets Dublin 10:20–14:05, marked Sat–Sun.

The engine's flights for that week:

| Day | Mon | Tue | Wed | Thu | Fri | Sat | Sun |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Dublin flights | 0 | 0 | 0 | 0 | 0 | 1 | 1 |

The week's results for Dublin: 2 trips, 38 passengers in 38 seats. The rugby's ×2 brings 219 people over the weekend. Ticket revenue was £3,090 and Dublin's profit £884.

**2. The summary splits: confirmed.**
- With any flight not All week, the summary bar shows both seat-fill figures side by side, for example "Mon–Fri 166 / 176 94% · Sat–Sun 181 / 195 93%".
- The other figures follow the timetable's day view and are labelled with it ("Mon–Fri figures").
- The opener does the same.
- The Sunday review's Seat fill panel adds the same split from the days that flew, for example "Mon–Fri 830 / 880 94% · Sat–Sun 359 / …".

**3. The week test still passes: confirmed.**

| Run | File | Checks | Failures |
| --- | --- | --- | --- |
| Full chapter, with the D67 checks | revised Studio | 194 | 0 |
| Coasting pupil | revised Studio | 193 | 0 |
| Full chapter | main game | 165 (unchanged) | 0 |

The save migration passes on both files (27 checks each). The Steady pupil removes the Dublin service the next Monday (with the Delete key), so the rest of the run matches before.

**Screenshots** in `docs/screenshots/v2studio/`:
- `11-d67-rugby-opener`: the opener with the rugby news;
- `12-d67-sat-sun-dublin`: the Sat–Sun view with the Dublin chip, the Days menu and the split summary;
- `13-d67-mon-fri-view`: the Mon–Fri view.

## What was built

- **Days on every flight**, from `flightDaysFromDay` 8: All week, Mon–Fri or Sat–Sun, with the labels from `flightDays`.
  - Each aircraft keeps a days list beside its schedule. Missing means All week, so old saves and Launch Day are unchanged.
  - A plan carries its days; changing one counts as a plan change, including for the board's hold.
- **The engine.** Each day is priced with its own flights only: All week + Mon–Fri on weekdays, All week + Sat–Sun at the weekend. The usual multipliers then apply. Crew duty and terminal charges follow, because they are built from the day's flights.
- **Duty and turnaround per day type.** A plan fits when the Mon–Fri day and the Sat–Sun day each fit the operating day and hold at most four flights.
  - A Mon–Fri flight may share its times with a Sat–Sun flight on the same aircraft: the test puts a weekday Paris flight at 10:20 beside the weekend Dublin one.
  - An All-week flight flies on both days, so it takes the later of its two times.
- **The timetable:**
  - a **Mon–Fri | Sat–Sun** switch in the header;
  - the lanes, the Active routes figures and the demand strip follow the switch;
  - a Mon–Fri or Sat–Sun block carries a chip;
  - the flight editor has a **Days** menu beside Earlier / Later / Route / Fare / Aircraft. Choosing Sat–Sun while looking at Mon–Fri switches the view, so the flight stays selected;
  - Delete and the other editors work as before.
- **New services.** The route editor's Add a service has a Days menu. Weekend-only news (every date from start to end a Saturday or Sunday) presets it to Sat–Sun and opens the timetable on Sat–Sun.
- **PlanTips:**
  - `weekend_only_news` (priority 1) fires while announced weekend-only news names a route with no Sat–Sun-only flight;
  - `fare_lower_fills` (priority 3) replaces the drawer's own fare line.
- **Haul bands** are read from `shortHaulMaxKm` 1,500 and `mediumHaulMaxKm` 4,000.
- **Fuel.** The Fuel button and the opener's tank check count the week's real litres: weekday litres on the weekdays left, weekend litres at the weekend.

## Interpretations and things to know

- **"A Sat–Sun service" for the tip** means a flight set to Sat–Sun. An All-week Dublin flight does not stop the tip, because it is the all-week service the tip warns against.
- **PlanTips thresholds.** The sheet writes the older rows' thresholds with units ("4 h", "1 plane", "0.25").
  - The tip code reads numbers, so those rows still use the Studio's own copy. Its messages and priorities are the same as the sheet's.
  - The two new rows are read from the sheet.
  - I found this while wiring the new rows. The v4.10 report said the PlanTips sheet was read; in fact its messages matched the game's copy, and the sheet itself was not used. If Fable writes thresholds as plain numbers (minutes for times), the game can read every row.
- **The fuel desk's buy suggestion** (a shared screen) still takes a weekday's litres × the days left. With weekend-only flights it slightly misjudges the week; the Studio's own figures are right.
- **The main game.** It reads the same save. There, a Sat–Sun flight flies all week, because the main game has no Days.
- **Patterns** (next pass) follow `patternPlusExtras`: a pattern is a whole day, and an aircraft may fly a pattern plus extra flights, each extra with its own Days.
- **Hand sums.** Monday's sums work on the Mon–Fri day, as before. A Sat–Sun-only flight is the model's.
