# Import report: Airline-World-Workbook.xlsx

*Written by `tools/import_world.py` on 05 Oct 2026. Loaded: live, optional rows. Written to `src/opening/parts/p2_data.html` as `data-workbook` (the game does not read it yet).*

**7 to fix, 6 to check, 3 notes.**

## Loaded

| Sheet | Loaded | Rows by status |
| --- | --- | --- |
| Settings | 11 | 3 later, 11 live, 2 placeholder |
| Archetypes | 4 | 2 later, 4 live |
| Routes | 6 | 2 later, 6 live, 2 placeholder |
| RouteCatalogue | 0 | 21 placeholder |
| Aircraft | 3 | 5 later, 3 live, 4 placeholder |
| Finance | 3 | 3 live, 1 placeholder |
| Airports | 5 | 5 live |
| Calendar | 14 | 10 live, 4 optional, 1 placeholder |
| Market | 2 | 86 later, 2 live, 16 placeholder |
| Events | 9 | 9 live, 21 placeholder |
| Challenges | 4 | 4 live, 4 placeholder |
| Mechanics | 8 | 3 later, 8 live, 2 placeholder |

## To fix before wiring in

- **Calendar:** day 6 is titled "Saturday", but 06 Sep is a Friday.
- **Calendar:** day 6 is a weekend row, but 06 Sep is a Friday.
- **Calendar:** day 7 is titled "Sunday", but 07 Sep is a Saturday.
- **Calendar:** day 13 is titled "Saturday", but 13 Sep is a Friday.
- **Calendar:** day 13 is a weekend row, but 13 Sep is a Friday.
- **Calendar:** day 14 is titled "Sunday", but 14 Sep is a Saturday.
- **Settings:** startDate 01 Sep 2030 is a Sunday, but its note says "Monday". The nearest Monday after it is 02 Sep 2030.

## To check

- **Market:** weeks start on a Sunday, not a Monday, so a Mon–Fri game week straddles two Market rows.
- **Market:** week 2 fuel is £1.30, but the Calendar has £1.50–£1.70 on its days. Time skips use the Market price, so the two should agree.
- **Market:** week 3 fuel is £1.40, but the Calendar has £1.70 on its days. Time skips use the Market price, so the two should agree.
- **Routes:** par (300 km): legs not on a quarter hour: Saab 340 40 min, ATR 72 40 min.
- **Routes:** ams (375 km): legs not on a quarter hour: Saab 340 50 min, ATR 72 50 min.
- **Routes:** gva (750 km): legs not on a quarter hour: Saab 340 100 min, ATR 72 100 min.

## Notes

- **Aircraft:** saab340 differs from Pass 1 (Pass 1 → workbook): fuelPer100Km 30 → 25, hourlyCost 240 → 200, dayCost 900 → 800. The workbook wins.
- **Aircraft:** atr72 differs from Pass 1 (Pass 1 → workbook): fuelPer100Km 45 → 40, hourlyCost 400 → 350, dayCost 1400 → 1200. The workbook wins.
- **Events:** reputation is switched off in the prototype, so star effects do nothing yet: events undercut_dub, storm, crew; challenges 2. Those choices then differ only in cash.

## What changes when the workbook is wired in

The prototype's current values against the workbook's. Nothing changes until the engine reads `data-workbook`.

| | Prototype now | Workbook |
| --- | --- | --- |
| Dublin distance | 300 km | 450 km |
| Dublin fares | £50, £60, £70, £80 | £70, £80, £90, £100, £110 |
| Paris distance | 450 km | 300 km |
| Paris fares | £80, £90, £100, £110, £120 | £70, £80, £90, £100, £110 |
| DHC-6 Twin Otter price | £2,500 | £5,000 (launch deal £2,500) |
| DHC-6 Twin Otter running costs | £192 an hour, £900 a day | £150 an hour, £600 a day |
| DHC-6 Twin Otter fuel | 20 L per 100 km | 20 L per 100 km |
| Saab 340 price | £180,000 | £9,000 |
| Saab 340 running costs | £330 an hour, £1040 a day | £200 an hour, £800 a day |
| Saab 340 fuel | 30 L per 100 km | 25 L per 100 km |
| ATR 72 price | £280,000 | £15,000 |
| ATR 72 running costs | £520 an hour, £1600 a day | £350 an hour, £1200 a day |
| ATR 72 fuel | 40 L per 100 km | 40 L per 100 km |
| Second crew | £300 | £250 when duty is over 12 h |
| Starting cash | £5,000 | £5,000 |
| Start date | Sun 12 May 2030 | Sun 01 Sep 2030 |

## Engine rules the workbook assumes

From the README sheet (Fable Pass 1, section 0). To confirm before the engine uses the data:

- A service is a round trip that earns one plane-load at the fare (return tickets).
- Five day bands: early 06:00–09:00, midmorning 09:00–12:00, midday 12:00–15:00, afternoon 15:00–18:00, evening 18:00–22:00 (from Pass 1; the prototype has three). A service belongs to the band it leaves home in.
- Time-locked passengers fly only in their band. In each band: demand × timeSensitiveShare × the band's share, rounded (halves to even). The rest are flexible and fill any seats left that day.
- People at a fare come from the route's demand table, not a formula.
- Costs per service: flying hours × hourly cost + landing fees at both ends + fuel + a charge for each passenger at home. Per day: the day cost, plus a second crew when duty is over 12 h (30 minutes before the first departure to 30 minutes after the last arrival).
- Fuel: the Calendar has a price for each day; the Market sheet has one for each week, used for time skips.
