# Decision support: what was built (Workbook v5.7, D87 and D88)

*Claude Code, 15 October 2026. This answers Fable's brief "Decision support: from information to action" (15 Oct), with §9 "What was it worth?". The code is in `src/opening/parts/p4zt_decide.js`; the test is `src/opening/tests/decide.test.js`.*

## What this means (for Bertie)

The plan page now says what to do, not just what is wrong.

- **The operations check.** On the Monday plan, the one or two things with the most money at stake are shown, each with a button that opens the change.
  - Week 2 onwards: in the opener card, above Keep plan.
  - When editing: in the bar above the button.
  - While a serious one is showing, Keep plan is no longer the green button; it reads "Run anyway". Nothing is ever blocked.
- **NBN's save** opens with "This plan loses £287 a day. The biggest opportunity is work for the Saab 340." Under it: "Saab 340 has no flights. It costs £1,200 a day parked", with **Find work for this aircraft**. That button opens the plan with the Saab's row picked out and its + Add flight menu pulsing.
- **Gubby's save** shows "This plan loses £607 a day. The biggest opportunity is the early Paris peak", with **Show me on the timetable**.
  - That button selects a Paris flight and shades the early band.
  - Dragging the 12:20 flight shows its seats filling as it moves (7/19, then 10/19 from about 15:20).
  - After the drop, one line: "This change — seats 27 → 36 · profit −£607 → +£168".
- **What was it worth?** A changed fare, time or flight gets one line, e.g. "One more flight: 14 × £100 − £781 costs = £619 a day". The first time for each kind it is a Build: the pupil taps the change for one, ×, how many.
- **Sunday.**
  - The review says "a large improvement is available", "a better plan is available" or "a good plan". It never gives the best plan's figure; you see that on the teacher panel and the printout.
  - It names the biggest missed opportunity and offers **Fix next week's Dublin plan**, which opens next Monday's plan on Dublin.
  - It repeats what each change was worth: "Your Paris extra flight was worth £4,333 this week".
- **Help me investigate** (on the plan and the review) replaces "Try different options" as the first step. The pupil:
  1. chooses one thing to test;
  2. predicts what happens to seats and profit;
  3. changes that one thing;
  4. sees the model's answer;
  5. uses the change, or tries something else.

  There is never a recommended plan. The Operations Model is still there, under its own name.
- **The teacher panel** has a **Planning support** dial (guided / supported / independent / management) and the best-plan figures by week. It also logs what the pupil did with each check (pressed the action, ran anyway, fixed from the review) and lists the experiments. The printout lists the experiments too.

## Report back

| Fable asked us to confirm | Result |
| --- | --- |
| Gubby is offered "Show me on the timetable", with timing at the top | **Yes.** The check is the loss, then "the early Paris peak" (`peak_unserved`), with Show me on the timetable. |
| Moving the 12:20 flight shows the live fill | **Yes.** The label changes as it moves (7/19 → 10/19), and the line after the drop gives seats and profit before and after. |
| NBN's check leads with "Saab 340 has no flights" and "Find work for this aircraft" | **Yes**, under the plan's loss line, which is priority 0. The loss line names the Saab as the biggest opportunity and uses the same button. |
| The review's Fix button opens the right route | **Yes.** NBN's review: "Fix next week's Dublin plan"; the next Monday opens on the plan, Dublin selected and its demand shown, the flight picked out. |
| The pupil never sees a best-plan figure; the teacher panel does | **Yes.** The review and the month audit letter use words. The teacher panel and the printout ("Plan quality by week") show actual, best and missed. |

## How each rule is read (please check)

1. **Ranking.** Priority first (0, then 1, …), then money at stake. Priority 0–1 tips always show; others only when they have money at stake.
2. **A losing plan.** `plan_loses_money` (priority 0) heads the check. Its `{topTip}` is a short phrase ("work for the Saab 340", "the early Paris peak"). The tip it names comes next and carries the button; the loss line takes that tip's button.
3. **Where the check sits.**
   - In the opener card: two lines.
   - On the plan: one line in the bar above the button (two did not fit at 1680 × 940). The rest are in View trade-offs, each with its button.
4. **Money at stake** is the engine's own alternatives on the plan, worked out in a dry run and never shown to the pupil.
   - `service_weak`: the flight at every time (40-minute steps).
   - `peak_unserved`: a service added in the band, or the flight moved into it.
   - `turned_away`: every fare, and one more service.
   - `fare_*`: every fare (the next one up for `fare_too_low`).
   - `idle_plane` and `plane_unused`: the plane's best one or two services.
   - `loss_making_service`: remove it, move it, or reprice it.
   - `plan_loses_money`: the loss.
   - `long_leg_warning`, `weekend_only_news` and `range_fail` rank by priority alone for now.
5. **`loss_making_service`.** A flight's tickets against its own flying, landing, fuel and passenger (terminal) costs. Overnight and two-leg rotations are left out: their money falls on one day of two.
6. **Keep plan.** It loses its green colour while a priority 0–1 tip shows, and the opener's reads "Run anyway". The plan page's button keeps its words ("Cost your plan", "Ready to fly") but is quiet.
7. **The fare chips** are in the route's fare editor and the flight's editor, not on the block (a block is too small). The route row gets a FULL tag.
8. **Planning support levels.**
   - Guided: the issue named and that tip's experiments (from `PlanTips.experiment`).
   - Supported: the issue named and all four.
   - Independent: no issue named.
   - Management: the check flags only losses and exceptions (`plan_loses_money`, `loss_making_service`, `plane_unused`, `range_fail`).
   - The operations check itself shows at every level except management's filter. Is that right for independent?
9. **The experiment's one change.**
   - Fare: the fare chips.
   - Times: 20 minutes or an hour, either way; moves that would not fit are greyed.
   - Services: one more at the first free time, or one fewer.
   - Aircraft: the flight moved to another plane at its first free time.
   - The pupil can test any route on the plan; the tip's route is chosen first.
10. **What was it worth (D88).**
    - Fare, when the passengers do not change: change a ticket × passengers. This is the Build.
    - Fare, when the passengers change: new passengers × new fare − old passengers × old fare (model only).
    - Time: change in passengers × fare.
    - Extra flight: change in the route's passengers × fare − the change in costs.
    - Sunday's figure is the day's worth × 7 (the model's), for changes still on the plan.
    - The Build is not counted in the sign-off cap. Its two tries and record entry are as D86.
11. **Experiments in the record.** "Experiment 1 · Week 2 · tested timing on Dublin · predicted more seats · result +0 passengers, £0 a day · used". They are logged as Build steps, outside the cap.

**Not built:** §7, the Operations Wall's planning-support view (parked, as the brief says). The mock-ups were not attached, so the layout follows the brief's words and the game's own styles.

## Tests

All runs on the built game, with decision support in.

| Run | Checks | End cash |
| --- | --- | --- |
| `decide.test.js` (NBN and Gubby) | 35 ok, 0 fail | |
| `week.test.js`, the Steady pupil to the chapter 1 review | 229 ok, 0 fail | £697,112 (the same) |
| `week.test.js` COAST | 232 ok, 0 fail | £689,806 (the same) |
| `chapter2.test.js` Value · Premium | 106 · 100 ok, 0 fail | £13,591,851 · £13,312,048 (the same) |
| `chapter3.test.js` Value · Premium | 62 · 72 ok, 0 fail | £28,219,358 · £19,822,524 (as D86) |
| `fleetshop` · `migrate` · `record` · `milestones` | 35 · 31 · 17 · 27 ok | |

- **No cash changes.** Decision support works out its figures in dry runs and changes nothing unless the pupil presses a button, so every chapter ends on the same cash.
- **Test changes.** `week.test.js` now expects the drawer's tips each with a button (up to four), "Keep plan" or "Run anyway" on the opener, and the model button called Operations Model, next to Help me investigate.
