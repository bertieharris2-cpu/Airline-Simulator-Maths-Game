# Import report: Airline-World-Workbook.xlsx

*Written by `tools/import_world.py` on 06 Oct 2026. Loaded: live, optional rows. Check only: the game data was not changed.*

**0 to fix, 2 to check, 8 notes.**

## Loaded

| Sheet | Loaded | Rows by status |
| --- | --- | --- |
| Settings | 41 | 41 live, 7 placeholder |
| Archetypes | 4 | 2 later, 4 live |
| Routes | 18 | 2 later, 18 live |
| RouteCatalogue | 0 | 14 moved to Routes, 7 placeholder |
| Aircraft | 8 | 6 later, 8 live, 1 note row, 1 placeholder, 1 removed |
| Finance | 8 | 6 later, 8 live, 1 note row, 1 placeholder |
| Airports | 1 | 1 later, 1 live, 3 removed |
| Calendar | 21 | 21 live |
| Market | 17 | 397 later, 17 live, 2 placeholder |
| Events | 16 rows → 10 events | 6 later, 16 live, 14 placeholder, 2 removed |
| Challenges | 2 | 2 live, 6 placeholder |
| Mechanics | 15 | 6 later, 15 live, 4 placeholder |
| Chapters | 1 | 3 later, 1 live, 1 note row, 2 placeholder |
| HandSumRules | 8 | 8 live, 1 note row |
| Catering | 4 | 4 live, 1 note row |
| Hunts | 0 | 1 note row, 7 placeholder |

## To check

- **Routes:** ist is loaded, but its archetype "long_haul_mixed" is not live. The game uses the route's own demand table and applies no business/leisure or season multipliers to it.
- **Routes:** par (300 km): legs not on a quarter hour: Saab 340 40 min, ATR 72 40 min, Embraer E190 20 min, Airbus A220 20 min, Airbus A320 20 min, Boeing 737 20 min, Embraer E175 20 min.

## Notes

- **Aircraft:** saab340 differs from Pass 1 (Pass 1 → workbook): fuelPer100Km 30 → 25, hourlyCost 240 → 200, dayCost 900 → 800. The workbook wins.
- **Aircraft:** atr72 differs from Pass 1 (Pass 1 → workbook): fuelPer100Km 45 → 40, hourlyCost 400 → 350, dayCost 1400 → 1200. The workbook wins.
- **Aircraft:** e190 differs from Pass 1 (Pass 1 → workbook): speedKmh 800 → 900. The workbook wins.
- **Calendar:** day 3 names challenge 1, but Settings captainsChallengeCadence starts challenges on 2031-01-06 (one a term). The game follows the Challenges sheet dates; the Calendar column is ignored.
- **Calendar:** day 5 names challenge 2, but Settings captainsChallengeCadence starts challenges on 2031-04-21 (one a term). The game follows the Challenges sheet dates; the Calendar column is ignored.
- **Calendar:** day 9 names challenge 3, but Settings captainsChallengeCadence starts challenges on 2031-09-02 (one a term). The game follows the Challenges sheet dates; the Calendar column is ignored.
- **Calendar:** day 11 names challenge 4, but Settings captainsChallengeCadence starts challenges on 2032-01-05 (one a term). The game follows the Challenges sheet dates; the Calendar column is ignored.
- **Events:** reputation is switched off in the prototype, so star effects do nothing yet: events undercut_dub, storm, crew; challenges 2. Those choices then differ only in cash.

## Chapter 1 touches

Rows dated on or before 28 Dec 2030 (chapter 1's review) that the game would read but are not `live`, and values the chapter-1 flow needs that the workbook lacks. The game reports these; it never invents a value.

- **Routes:** ist opens on day 50 but its archetype `long_haul_mixed` is not live: no weekend or season multipliers on this route, and the game says so on its route card.
- **Settings:** `timeSkip` is `placeholder`: not loaded (the game builds teacher skips of 0 / 1 / 4 / 8 weeks from the brief and reports it here).
- **Settings:** `reputationFromDate` is `placeholder`: not loaded (a date gate only in chapter 1).

## The prototype's own data and the workbook's

The game uses the workbook's values. The prototype's own (in `data-world` and `data-planes`) only matter for routes and aircraft the workbook does not have yet.

| | Prototype's own data | Workbook (used) |
| --- | --- | --- |
| Dublin distance | 300 km | 450 km |
| Dublin fares | £50, £60, £70, £80 | £70, £80, £90, £100, £110 |
| Paris distance | 450 km | 300 km |
| Paris fares | £80, £90, £100, £110, £120 | £70, £80, £90, £100, £110 |
| Madrid distance | 1200 km | 1350 km |
| Madrid fares | £80, £90, £100, £120 | £150, £160, £170, £180, £190 |
| Marrakech distance | 2400 km | 2250 km |
| Marrakech fares | £100, £120, £140, £160 | £220, £230, £240, £250, £260 |
| Cairo distance | 3600 km | 3600 km |
| Cairo fares | £125, £150, £175, £200 | £330, £340, £350, £360, £370 |
| DHC-6 Twin Otter price | £2,500 | £5,000 (launch deal £2,500) |
| DHC-6 Twin Otter running costs | £192 an hour, £900 a day | £150 an hour, £600 a day |
| DHC-6 Twin Otter fuel | 20 L per 100 km | 20 L per 100 km |
| Saab 340 price | £180,000 | £9,000 |
| Saab 340 running costs | £330 an hour, £1040 a day | £200 an hour, £800 a day |
| Saab 340 fuel | 30 L per 100 km | 25 L per 100 km |
| ATR 72 price | £280,000 | £15,000 |
| ATR 72 running costs | £520 an hour, £1600 a day | £350 an hour, £1200 a day |
| ATR 72 fuel | 40 L per 100 km | 40 L per 100 km |
| Embraer E190 price | £300,000 | £30,000 |
| Embraer E190 running costs | £— an hour, £2650 a day | £900 an hour, £2500 a day |
| Embraer E190 fuel | 35 L per 100 km | 70 L per 100 km |
| Airbus A220 price | £450,000 | £300,000 |
| Airbus A220 running costs | £— an hour, £6250 a day | £1100 an hour, £3000 a day |
| Airbus A220 fuel | 45 L per 100 km | 80 L per 100 km |
| Airbus A320 price | £550,000 | £400,000 |
| Airbus A320 running costs | £— an hour, £6550 a day | £1300 an hour, £3500 a day |
| Airbus A320 fuel | 60 L per 100 km | 90 L per 100 km |
| Boeing 737 price | £600,000 | £400,000 |
| Boeing 737 running costs | £— an hour, £7150 a day | £1300 an hour, £3500 a day |
| Boeing 737 fuel | 62 L per 100 km | 90 L per 100 km |
| Second crew | £300 | £250 when duty is over 12 h |
| Starting cash | £5,000 | £5,000 |
| Start date | Sun 12 May 2030 | Mon 02 Sep 2030 |

## Engine rules

From the README sheet and Fable Pass 1, section 0, as `src/opening/engine/world-engine.js` implements them:

- A service is a round trip that earns one plane-load at the fare (return tickets).
- Five day bands: early 06:00–09:00, midmorning 09:00–12:00, midday 12:00–15:00, afternoon 15:00–18:00, evening 18:00–22:00 (from Pass 1; the prototype has three). A service belongs to the band it leaves home in.
- Time-locked passengers fly only in their band. In each band: demand × timeSensitiveShare × the band's share, rounded as at school (halves up). The rest are flexible and fill any seats left that day.
- People at a fare come from the route's demand table, not a formula.
- Costs per service: flying hours × hourly cost + landing fees at both ends + fuel + a charge for each passenger at home. Per day: the day cost, plus a second crew when duty is over 12 h (30 minutes before the first departure to 30 minutes after the last arrival).
- Fuel: the Calendar has a price for each day; the Market sheet has one for each week, used for time skips.
