# The Intelligence Wall in the game (17 Oct 2026)

*Claude Code. The wall designed in the UI sandbox (`ui-sandbox/airline-ui-sandbox.html`, 16–17 Oct) merged into the game. The code is `src/opening/parts/p4zw_intelwall.js`; the CSS is at the end of `src/opening/parts/p1_head_studio2.css`.*

## What this means (for Bertie)

The Operations Wall now has two faces. While the pupil flies, it is live operations as before. While the pupil plans, it is the **Intelligence Wall**: what is going on outside the airline, laid out so a pupil can scan it from across the room. Desk = act; wall = observe. Nothing on the wall changes the game.

- **The map is the hero**, with five panels around it: World news, Fuel market, Market outlook, Events to watch, and a small Your airline card. A THIS WEEK ribbon runs under the header.
- **Colour means something.** Cyan is selected, green improving, gold worth a look, amber a warning, red disruption. Each panel is level 1 (background), 2 (an opportunity, gold ◆) or 3 (a significant change: amber, or red for disruption, with "New intelligence" and one short glow).
- **The first significant change becomes the second hero** at the top right. Others get an amber edge, or take the place of a panel that can wait, and say so.
- **Clicking a city** shows its customer market: business and leisure, the strongest times of day, fare sensitivity, the trend, the busiest season, why now, and the rival's fare.
- **One screen:** the ▣ Operations Wall button (or W) shows the wall; Return to HQ (or W, or Esc) goes back. With an IWB window open, the wall is there.

## Where each panel's figures come from (please check)

| Panel | Source in the game |
| --- | --- |
| World news | Route news that is on now or announced (the RouteNews sheet, by `announce`, `start`, `end`), with a consequence line from the route, the multiplier and the segment ("Dublin demand ↑↑ leisure"); the Market week's `headline` and `fuelHeadline`; today's Calendar `headlines`; the last three log entries. Weather and disruption stories come first. |
| Fuel market | `fuelOn(day)` today and a week ago (the change in %), the last five weeks as a line, the Market week's `forecastLow`–`forecastHigh` and `fuelHeadline`. |
| Market outlook | One tile per open route. The signal is the average of `demandMultNews(route, day + 7, 14, 21, 28)` against today: ▲▲ at 1.25 or more, ▲ at 1.08, ▼ at 0.92 or less, → otherwise. The tag is the next route news for the route (icon, kind, date) or the season and whether the archetype says busier or quieter. Three bars show the three weeks ahead. |
| Events to watch | Route news on or announced within four weeks: NOW, THIS WEEK, NEXT WEEK, LATER THIS MONTH, with the city, the kind, the dates and the demand arrow. Surprises (not announced) appear only once they start. |
| Your airline | The last period in `S.history`: seats filled (a ring), turned away (want − pax summed over the routes of a day entry; a week entry shows the profit instead), and the route with the most turned away. |
| Weather & disruption | The Market week's `weather` text read for storms, gales, snow, ash and ice (WARNING, red) or fog, thunder and heat (WATCH, amber), matched to the city named in it ("Irish Sea" is Dublin, "Alps" is Geneva, "Europe" or the home city is everyone); the day's event (storm, fog, ash) is a warning on its focus route. Shown when it wakes, or when a ribbon item asks for it. |
| Competitor watch | `competitorPrice(route)` against the pupil's fare on each route flown. Shown when the rival undercuts, or when a ribbon item asks for it. |
| The ribbon | The level-3 changes, then up to three events, then the fuel forecast's direction. |
| Map marks | One a city, in this order of precedence: a weather warning (🌩, red), the rival's fare when it undercuts (amber), an event on now or starting this week (its icon, gold), strong growth (▲▲, green). Weather cells (a soft red or amber glow) over airports on warning or watch. |

## What wakes a panel (level 3)

1. **Weather:** the Market week's weather is a warning for a route, or the day's event is weather. Red.
2. **Fuel:** the price has moved 5% or more on last week; or the tank won't cover today's flights. Amber.
3. **Rivals:** the rival is selling a route the pupil flies for less than the pupil's fare. Amber.

The first of these in that order is the hero. A woken panel glows once; the wall remembers what it has shown, so the same change does not glow again.

## Questions for Fable

- **Hero order.** Weather before fuel before the rival. Should a very large fuel move (say 15%) outrank a weather watch?
- **The signal thresholds** (1.25 / 1.08 / 0.92) were chosen on the sandbox data. On the workbook's route news the multipliers are 0.4 to 2, so ▲▲ and ▼ appear mostly in event weeks; between events most routes read → steady with the season's word. Is that the right amount of movement?
- **Market outlook's tag.** It names the next event by kind and date ("🏉 Big match · 5 Oct"), not by headline, so it fits a tile. The headline is in World news and Events to watch.
- **Busiest season** comes from the archetype's season multipliers (four seasons), not months. A monthly curve would need a sheet.

## Tests

- `liveops.test.js` (the wall's live operations, Launch Day to week 3) reaches the same point as before the change: both runs stop at the same stale step in the launch flow (the old market pick), so the test needs updating for the current opening, which is not part of this change. No page errors in either run.
- `decide.test.js` 35 ok, `migrate.test.js` 31 ok, no errors.
- A browser probe loads three saved games (days 6, 8 and 16), opens the wall on one screen at 1920 × 1080, clicks a city and a ribbon item, with no errors.
- `week.test.js` (chapter 1 to day 15, the default): 95 ok, 0 fail, no errors, cash £25,545 on day 15.
