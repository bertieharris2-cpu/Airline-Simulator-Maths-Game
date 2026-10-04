# HQ dashboard UI explorations

Standalone mock-ups for the airline HQ, with sample data. This is visual exploration only: nothing here is wired to the game yet. Open `hq-ui-options-index.html` to compare all four options side by side.

| File | What it is |
| --- | --- |
| `hq-ui-options-index.html` | Comparison page: a thumbnail, one-line idea, tone and "best for" for each option, plus the recommendation. |
| `hq-option-01-mid-blue.html` | **Recommended.** Mid-blue glass panels, cyan highlights, amber only for money and the main action. |
| `hq-option-02-light-airy.html` | White glass cards on a pale sky, a welcome hero with today's decision, and a quick-actions strip. |
| `hq-option-03-dark-premium.html` | Charcoal with gold and cyan, executive feel, and route-expansion opportunity cards. |
| `hq-option-04-operations-command.html` | Live operations room: departures and arrivals boards, weather on the map, readiness, fuel and season goals. |
| `src/` | The shared parts the pages are built from, so pieces can be lifted later. |

The `src/` files are:
- `ui-prototypes-base.css`: layout, panels and every widget's styles.
- `ui-prototypes-widgets.js`: map, charts, fleet, tables, gauges, count-ups and tabs.
- `ui-prototypes-data.js`: the mock data.
- `themes.py`: each option's colour tokens and layout.

Every HTML file is self-contained: inline CSS, JS, SVG map and data, with no internet and no build step. Double-click to open. Each page is designed for 1920×1080. At 1366×768 the panels stack and the page scrolls.

## What every option shows (same content, different look)
- **Header:** airline, round / day / time, cash, reputation, flights today, notifications.
- **Navigation:** HQ, Operations, Fleet, Network, Finance, Staff, Marketing, Strategy, Messages. These are placeholders.
- **KPI cards:** revenue, profit, fuel costs and satisfaction, each with a trend arrow, a sparkline, and figures that count up.
- **Route map:** the game's own world outlines, cropped to Europe, with curved routes from Cardiff and planes flying them.
  - Tabs show *Route map*, *Demand* (circle size = people a day) and *Profit* (routes coloured by margin).
  - Possible new routes are dashed.
- **Fleet:** each type with seats, how busy it is and maintenance; a total in service / maintenance / grounded bar; the plane on order.
- **Route performance:** seats sold as a bar, % filled, revenue, profit and trend, sortable.
- **Financial overview:** revenue and cost columns with a profit line on one £ axis, a 6/12-round switch, and a hover tooltip per round.
- **Fuel and operations:** the tank (fuel held, today's use, what's left), today's price against the average paid, and flights ready / boarding / delayed / grounded.
- **Alerts and news**, and one big **Start the day** button with a "Today's decision" teaser.

## How the options differ

| | Mid-blue | Light and airy | Dark premium | Operations command |
| --- | --- | --- | --- | --- |
| Feel | Sleek, calm, "real sim" | Friendly, spacious | Executive, dramatic | Live control room |
| Layout | Left nav, KPI row, map + fleet + alerts, then routes / finance / fuel | Top nav, welcome hero, map, small cards row, quick actions | Left nav with subtitles and briefing, KPI row, map + fleet, finance / opportunities / fuel | Boards left, map centre, readiness / fuel / ratings / alerts right, dock at the bottom |
| Density | Medium | Lowest | Medium | Highest |
| Accent | Cyan, amber for money | Blue | Gold and cyan | Cyan, gold |

## Recommendation
**Option 1, mid-blue,** is the strongest direction for the game:
- It has the excitement of the dark references, but is easier on the eye for a whole lesson.
- It reads well on an interactive whiteboard. Very dark pages lose detail there and very pale ones wash out.
- Amber is reserved for money and the main action, so the eye goes to today's decision first.

Worth borrowing from the others:
- the welcome hero with today's decision (option 2);
- the route-expansion opportunity cards, a natural lead-in to the fleet and route choices (option 3);
- the departures board and season goals (option 4).

## Suggested first live panels (Phase 2)
1. **Start the day and today's decision.** Already in the game as the morning choice.
2. **KPI cards.** Revenue, profit and fuel per round already exist in the game's round history.
3. **Route performance.** Seats sold / seats and revenue per route come straight from the flight plan.
4. **Fuel tank.** The game already tracks stock, today's use and the average price paid.
5. **Route map** with live demand. The demand rule and routes are in the data blocks.

## Notes
- **Fonts:** system fonts only, so zeros are plain, with no slash.
- **Chart colours:** these were checked for colour-blind separation in each theme. Every chart has a legend and labels, and the finance chart has a hover tooltip.
- **Motion:** animations switch off when the computer is set to reduce motion.
