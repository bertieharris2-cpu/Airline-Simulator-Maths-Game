# The year-one briefings in the game (20 Oct 2026)

Every year-one briefing, screen by screen, as a pupil sees it in the game after Bertie's briefings review (DESIGN.md of 20 October). Report: `docs/20-Oct-Briefings-Report.md`.

- `1366x768/`: every briefing.
- `1920x1080/`: the five that changed most (What a fare does, Cash, tank, profit, Customers have a choice, Weekdays and weekends, Can you afford to run it?).
- `launch-day/`: the Launch Day sheet and the Studio with no snacks.

Each briefing is opened from the teacher's Jump to… save for its day (`src/opening/tests/fixtures/jumps/`), then played through. A screen is taken at each point where the pupil acts. In predictions the second chip is tapped, and in decisions the choice the briefing teaches is made.

| Files | Briefing | Opened on | What to look at |
| --- | --- | --- | --- |
| `fare_lever-*` | What a fare does | Launch Day | The words next to each beat's picture. Beat 5's prediction (05, 06): Next shows only after a tap, and the tapped chip is outlined. Beat 6 (07) says "You predicted: The £110 plane". |
| `fuel_cash_tank_profit-*` | Cash, tank, profit | Launch Day | The words just under the £1.30 price board; the vault, tank and week moved down to make room. |
| `rival_split-*` | Customers have a choice | Week 2 | The prediction "What will some of your passengers do?" (02, 03), then "You predicted: Move to Red Kite" (04). |
| `weekend_demand-*` | Weekdays and weekends | Week 2 | The prediction "Which days look different from the rest?", then the planner request. |
| `cash_to_fly-*` | Can you afford to run it? | Week 2 | The cash as coins in an open vault (no liquid). The week flies a day at a time; then the shop, the second plane, the comparison under the words, and the aim card. |
| `aircraft_efficiency-*` | Two planes, one route | Week 2 | The words at the top of the scene. |
| `flight_time-*` | How long will it take? | Week 3 | The words at the top of the scene. |
| `event_weekend-*` | One big Saturday | Week 4 | The planner request: change one particular date. |
| `seasons-*` | A year of demand | 2 December | The planner request: plans that switch with the season. |
| `lease_money-*` | Renting a plane | 6 January | The words over the left sky, clear of the price and the rent stack. |

More demand than seats and Snacks on board are removed, so they have no screens. Chapter 3's Profit is not cash keeps its old frame.
