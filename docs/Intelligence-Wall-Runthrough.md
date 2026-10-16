# The Intelligence Wall: a run-through of the data and the functions (16 Oct 2026)

*Claude Code (as Fable), for Bertie. The game was played by the test pupil from Launch Day to the chapter 1 review (28 December 2030), with the state kept at eleven Monday planning days; the wall was then opened on each of those, on the chapter 1, 2, 3 and 4 end cards from the regression chain, and on three saved pupil games. What every panel said was written out and read against the workbook (RouteNews, Market, Calendar, Events, Archetypes). Fixes made on the way are listed at the end; the build and tests after them are in the commit.*

## The short version

- The wall reads the workbook correctly: every fuel move, forecast band and headline matched the Market sheet week by week; every piece of route news appeared on its announce date (or, for a surprise, on the day it started), with the right city, dates and direction; the two chapter-1 weather weeks landed on the right cities (the Irish Sea storm on Dublin, the Alpine snow on Geneva).
- Seven things were wrong or misleading and are fixed: a weather warning naming no place warned nobody; the short-tank alert fired every Monday before the Fuel desk and on the chapter-end cards; the fuel forecast's arrow read the band's low end; the four-week signal sampled single days (so a three-day strike was invisible) and measured against a week that an event had already bent; events that lower demand were marked gold like good ones; a political event that is good news read "Strike"; a click on a crowded map opened a neighbouring city.
- Two data limits for Fable are at the end: the Market sheet ends on the last day of chapter 4, and the archetypes have four seasons rather than months.

## What was checked, day by day (chapter 1, the Steady pupil)

| Day | Date | What the wall showed | Against the workbook |
| --- | --- | --- | --- |
| 8 | Mon 9 Sep | Fuel £1.47, ▲ 23% on last week, next week £1.60–£1.76 "climbing steadily"; news: the Market week's headline (four new destinations), today's calendar lines, "Saving for the Saab 340"; no events | Market wk1 £1.20 → wk2 £1.47; forecast and headline as the sheet |
| 15 | Mon 16 Sep | Fuel £1.68 ▲ 14%, forecast £1.71–£1.87; "Madrid opens"; outlook: Geneva ▲, Barcelona ▼ | wk3 row; the Market sheet's seasonMult for Geneva and Barcelona |
| 22 | Mon 23 Sep | The Dublin rugby appears, dated 5 Oct, as NEXT WEEK; forecast arrow ↑ (£1.78–£1.94 around £1.79) | RouteNews `dub_rugby` announce 23 Sep; the arrow was ↓ before the fix (the low end was 1p below today) |
| 29 | Mon 30 Sep | "Storm over the Irish Sea": Dublin WARNING, red cell and 🌩 on the map; the rugby THIS WEEK; no hero (the pupil was not flying Dublin that week, so the warning is level 2) | Market wk5 weather |
| 36 | Mon 7 Oct | Paris strike THIS WEEK (8–10 Oct, amber 🏛 on Paris, "Paris demand ↓"); Madrid conference NEXT WEEK ("business"); fuel £1.97 ▲ 6% with the £2.60–£3.20 pipeline-fire forecast as the hero | `par_atc_strike` announce 1 Oct; `mad_tech_week` announce 7 Oct; Market wk6 |
| 43 | Mon 14 Oct | Fuel £2.94 ▲ 49% hero; "FUEL SPIKE!" story; Madrid conference NOW | Market wk7 |
| 50 | Mon 21 Oct | Fuel ▼ 28%; Milan trade fair NEXT WEEK (announced today) | wk8; `mxp_trade_fair` announce 21 Oct |
| 57 | Mon 28 Oct | Milan NOW; Frankfurt slowdown NEXT WEEK (↓ business, amber on the map); no alert (the tank line no longer fires on a plan day) | `de_slowdown` announce 28 Oct |
| 64 | Mon 4 Nov | Frankfurt NOW; Marrakech film festival NEXT WEEK | `rak_film_festival` announce 4 Nov |
| 78 | Mon 18 Nov | The Irish ferry strike, a surprise, appears the day it starts (NOW, "Dublin demand ↑"); Istanbul visas NEXT WEEK; "Fuel hits £2.40 — double" | `ie_ferry_strike` not announced, start 18 Nov; `ist_visa_easier` announce 18 Nov |
| 92 | Mon 2 Dec | Fuel £1.12 ▼ 51% hero, "HUGE oil field"; Istanbul and Brussels/Berlin Christmas markets NOW; outlook: most routes ▲ into Christmas | Market wk14; `xmas_markets` start 2 Dec |
| 118 | Sat 28 Dec (review) | "First snow in the Alps": Geneva WARNING with the cell and 🌩, level 2 since Geneva is not flown; fuel £1.69 ▲ 14% hero; Istanbul and Cairo NOW | Market wk17; `cai_museum` start 16 Dec |

Also checked: Your airline reads the last period (a day, then "Week 5" and so on, then "December"): seats filled, turned away (want − pax over the day's routes) and the route under most pressure. The city briefing reads the archetype (Dublin: business 55%, early + evening, medium sensitivity). Surprises never appear before they start. Nothing on the wall changed any game figure: the week test's cash on day 15 is unchanged.

## Chapter ends (the regression chain's saves)

- **Chapter 2 (31 Aug 2031):** "Autumn gales" in the Market week warned nobody because it names no city. Fixed: a warning that names no place is everyone's. Red Kite's New York launch shows as NOW (rival kind); the strongest-growth marks were on four unflown far routes, now limited to the routes flown plus two others.
- **Chapter 3 (31 Aug 2032):** fuel ▼ 17% hero; Cape Town winter and Red Kite Dubai NOW. The log's repeated "No service flew this week, so Red Kite is taking you…" lines filled World news; the wall now takes one log line, from this round.
- **Chapter 4 (31 Aug 2033):** the day the Market sheet ends (week 156). The four-week outlook reads past the sheet, so it falls back to the archetypes' seasons: every "winter sun" route reads ▲▲ at once because September is autumn. See the data limits.

## Functions

- **Rival undercut** (`S.rivalLive` £50 on Paris against £90): amber alert, ribbon item "Red Kite Air · Paris £50", £50 mark on the map, Competitor watch wakes.
- **A storm event on a route** (the day's event with a focus route): red hero, 🌩 on that city, WARNING in the strip.
- **One screen:** W and ▣ open the wall, W, Return to HQ and Esc close it.
- **The IWB window** (`?display`): receives the state and shows the same board; a city click there opens the briefing.
- **Clicking a city** on a crowded map (world scale, or Paris beside Brussels) opened the topmost neighbour. Fixed: the click goes to the nearest city within a dot's reach.

## Fixes made in this run

1. A weather warning that names no city now applies to every route (chapter 2's "Autumn gales").
2. A weather warning on a route the pupil does not fly is level 2 (worth a look, mark and cell on the map), not the hero; the affected route joins the weather strip.
3. The short-tank alert fires only at Ready, after the Fuel desk (it fired every Monday plan and on end cards; the HQ bell covers the rest).
4. The fuel forecast arrow uses the middle of the band.
5. The signal averages each of the next four weeks and measures against this week's normal level (without its news): a three-day strike now counts, and a strike this week no longer reads as "strong growth" next week.
6. Events that lower demand are amber on the map; events that raise it gold; a good political item reads "New rules", a good economic one "Boom".
7. The Market outlook shows the routes flown first, then the strongest signals among the others ("Not flown · Autumn"); ▲▲ marks are limited to the routes flown plus two.
8. Nearest-city clicks; the pulse ring sits on the city; one log line in the news.

## Data limits and questions for Fable

- **The Market sheet ends at week 156 (31 Aug 2033)**, the last day of chapter 4. The wall looks four weeks ahead, so from early August 2033 it reads past the sheet and falls back to the archetypes' seasons. Four more weeks of rows (or a "last row holds" rule for the forecast) would close that.
- **Seasons, not months.** The city briefing's "busiest season" and the outlook's season word come from the archetypes' four seasons. The Market sheet's weekly `seasonMult` gives finer movement for the routes it lists (Geneva, Barcelona).
- **The signal thresholds** (▲▲ at +25%, ▲ at +8%, ▼ at −8% on the four-week mean) look right on this chapter: the rugby week reads ▲▲ for Dublin, Christmas reads ▲ across Europe, quiet weeks read →. Please say if ▲▲ should be rarer.
- **Weather words.** The wall reads the Market `weather` text for storm, gale, snow, ash and ice (warning) and fog, thunder and heat (watch), and matches a city name, "Irish Sea" (Dublin), "Alps" (Geneva) or "London" (everyone). A `weatherRoutes` column would make this exact.
- **Fuel "updated" times** are fixed words ("updated this morning"); the sheet has no times.
