# Import report: Airline-World-Workbook.xlsx

*Written by `tools/import_world.py` on 14 Oct 2026. Loaded: live, optional rows. Written to `src/opening/parts/p2_data.html` as `data-workbook`; rebuild the prototype to use it.*

**0 to fix, 15 to check, 7 notes.**

## Loaded

| Sheet | Loaded | Rows by status |
| --- | --- | --- |
| Settings | 122 | 122 live, 9 placeholder |
| Archetypes | 5 | 2 later, 5 live |
| Routes | 27 | 27 live |
| RouteCatalogue | 0 | 21 moved to Routes |
| Aircraft | 13 | 2 later, 13 live, 1 note row, 1 removed |
| Finance | 13 | 2 later, 13 live, 2 note row |
| Airports | 1 | 1 later, 1 live, 3 removed |
| Calendar | 42 | 42 live |
| Market | 104 | 312 later, 104 live |
| Events | 29 rows → 23 events | 4 later, 29 live, 3 placeholder, 2 removed |
| EventOptions | 37 | 37 live, 1 note row |
| Challenges | 4 | 4 live, 4 placeholder |
| Mechanics | 15 | 5 later, 15 live |
| Chapters | 3 | 3 later, 3 live, 1 note row |
| HandSumRules | 11 | 11 live, 1 note row |
| Catering | 4 | 4 live, 1 note row |
| PlanTips | 12 | 12 live, 1 note row |
| RouteNews | 54 | 54 live, 1 note row |
| Livery | 35 | 35 live, 1 note row |
| Hunts | 4 | 4 live, 1 note row, 3 placeholder |

## To check

- **Events:** "overdraft_offer" is dated 2031-09-02, but the Calendar puts it on day 365 (2031-09-01). The game follows the Calendar.
- **Finance:** a220: price ÷ lease a day = 1000, not the 2,000 days of Settings leaseRule (F4 revised with D78).
- **Finance:** a320: price ÷ lease a day = 1000, not the 2,000 days of Settings leaseRule (F4 revised with D78).
- **Finance:** b737: price ÷ lease a day = 1000, not the 2,000 days of Settings leaseRule (F4 revised with D78).
- **Market:** week 19 fuel is £2.16, but the Calendar has £2.17 on its days. Time skips use the Market price, so the two should agree.
- **Market:** week 53 fuel is £2.20, but the Calendar has £2.24 on its days. Time skips use the Market price, so the two should agree.
- **Routes:** ist is loaded, but its archetype "long_haul_mixed" is not live. The game uses the route's own demand table and applies no business/leisure or season multipliers to it.
- **Routes:** par (300 km): legs not on a quarter hour: Saab 340 40 min, ATR 72 40 min, Embraer E190 20 min, Airbus A220 20 min, Airbus A320 20 min, Boeing 737 20 min, Boeing 787 Dreamliner 20 min, Airbus A350 20 min, Embraer E175 20 min, Boeing 757 20 min, Airbus A340 20 min, Boeing 777 20 min.
- **Routes:** yyz (5700 km): legs not on a quarter hour: Saab 340 760 min, ATR 72 760 min, Embraer E190 380 min, Airbus A220 380 min, Airbus A320 380 min, Boeing 737 380 min, Boeing 787 Dreamliner 380 min, Airbus A350 380 min, Embraer E175 380 min, Boeing 757 380 min, Airbus A340 380 min, Boeing 777 380 min.
- **Routes:** los (5000 km): legs not on a quarter hour: DHC-6 Twin Otter 1000 min, Saab 340 667 min, ATR 72 667 min, Embraer E190 333 min, Airbus A220 333 min, Airbus A320 333 min, Boeing 737 333 min, Boeing 787 Dreamliner 333 min, Airbus A350 333 min, Embraer E175 333 min, Boeing 757 333 min, Airbus A340 333 min, Boeing 777 333 min.
- **Routes:** del (6700 km): legs not on a quarter hour: DHC-6 Twin Otter 1340 min, Saab 340 893 min, ATR 72 893 min, Embraer E190 447 min, Airbus A220 447 min, Airbus A320 447 min, Boeing 737 447 min, Boeing 787 Dreamliner 447 min, Airbus A350 447 min, Embraer E175 447 min, Boeing 757 447 min, Airbus A340 447 min, Boeing 777 447 min.
- **Routes:** tyo (9600 km): legs not on a quarter hour: Saab 340 1280 min, ATR 72 1280 min, Embraer E190 640 min, Airbus A220 640 min, Airbus A320 640 min, Boeing 737 640 min, Boeing 787 Dreamliner 640 min, Airbus A350 640 min, Embraer E175 640 min, Boeing 757 640 min, Airbus A340 640 min, Boeing 777 640 min.
- **Routes:** cpt (9700 km): legs not on a quarter hour: DHC-6 Twin Otter 1940 min, Saab 340 1293 min, ATR 72 1293 min, Embraer E190 647 min, Airbus A220 647 min, Airbus A320 647 min, Boeing 737 647 min, Boeing 787 Dreamliner 647 min, Airbus A350 647 min, Embraer E175 647 min, Boeing 757 647 min, Airbus A340 647 min, Boeing 777 647 min.
- **Routes:** sin (10900 km): legs not on a quarter hour: DHC-6 Twin Otter 2180 min, Saab 340 1453 min, ATR 72 1453 min, Embraer E190 727 min, Airbus A220 727 min, Airbus A320 727 min, Boeing 737 727 min, Boeing 787 Dreamliner 727 min, Airbus A350 727 min, Embraer E175 727 min, Boeing 757 727 min, Airbus A340 727 min, Boeing 777 727 min.
- **Routes:** syd (17200 km): legs not on a quarter hour: DHC-6 Twin Otter 3440 min, Saab 340 2293 min, ATR 72 2293 min, Embraer E190 1147 min, Airbus A220 1147 min, Airbus A320 1147 min, Boeing 737 1147 min, Boeing 787 Dreamliner 1147 min, Airbus A350 1147 min, Embraer E175 1147 min, Boeing 757 1147 min, Airbus A340 1147 min, Boeing 777 1147 min.

## Notes

- **Aircraft:** dhc6 differs from Pass 1 (Pass 1 → workbook): dayCost 600 → 900, listPrice 5000 → 10000. The workbook wins.
- **Aircraft:** saab340 differs from Pass 1 (Pass 1 → workbook): fuelPer100Km 30 → 25, hourlyCost 240 → 200, dayCost 900 → 1200, listPrice 9000 → 22000. The workbook wins.
- **Aircraft:** atr72 differs from Pass 1 (Pass 1 → workbook): fuelPer100Km 45 → 40, hourlyCost 400 → 350, dayCost 1400 → 1800, listPrice 15000 → 36000. The workbook wins.
- **Aircraft:** e190 differs from Pass 1 (Pass 1 → workbook): speedKmh 800 → 900, dayCost 2500 → 3500, listPrice 30000 → 70000. The workbook wins.
- **EventOptions:** "ash_cloud2" has option rows but no Events row (it is a RouteNews item; the game builds the card from the news).
- **Events:** events are not in date order (harmless; the game sorts them).
- **Events:** reputation is switched off in the prototype, so star effects do nothing yet: events undercut_dub, storm, crew; challenges 2. Those choices then differ only in cash.

## Chapter 1 touches

Rows dated on or before 28 Dec 2030 (chapter 1's review) that the game would read but are not `live`, and values the chapter-1 flow needs that the workbook lacks. The game reports these; it never invents a value.

- **Routes:** ist opens on day 57 but its archetype `long_haul_mixed` is not live: no weekend or season multipliers on this route, and the game says so on its route card.
- **Settings:** `timeSkip` is `placeholder`: not loaded (the game builds teacher skips of 0 / 1 / 4 / 8 weeks from the brief and reports it here).
- **Settings:** `reputationFromDate` is `placeholder`: not loaded (a date gate only in chapter 1).

## Chapter 3 touches

The Settings rows chapter 3 reads (D78–D81), as loaded.

- `overdraftFromDate`: 2031-09-01
- `overdraftLimit`: one week's average profit
- `overdraftDailyCharge`: 0
- `overdraftAtLimit`: purchases and fuel orders blocked; flights continue
- `buyLeasedPlane`: yes, at list price; the lease stops that day
- `leaseReturn`: at a month end, no charge
- `timeToAffordWeekly`: (price − cash) ÷ profit a week = weeks to wait
- `missedHuntH1Effect`: chapter-3 opening cash shown £2,000 high until the first audit
- `twoLegRotation`: Sydney via Singapore
- `bigPlanePriceRule`: doubled from v5.2
- `chapter3SetUpDays`: 5
- `challengeRewardRule`: a share of a day's profit, or stars
- `secondCrewCost`: 250
- `leaseRule`: price ÷ 2,000 a day from the A220 up
- **EventOptions:** 37 option rows for 12 events (ash_cloud, ash_cloud2, blogger, crew, fault, fees_rise, fog, mystery_shopper, overdraft_offer, storm, storm2, undercut_dub).
- **Two-leg routes:** syd (10,900 km + 6,300 km, 4 days).

## Identity and photos (CR5)

Livery sheet: 12 colours, 4 stripes, 7 tail symbols, 4 logo shapes, 8 name suggestions. Photos live in `src/opening/assets/photos/` and are embedded by the build; credits are listed in `data/Photo-Credits.md`. The showroom's "coming soon" row reads the name, date and picture of aircraft that are not live (never their figures).

| Aircraft | Status | Artwork | Photo | Credit and licence |
| --- | --- | --- | --- | --- |
| dhc6 | live | dhc6 | none yet | — |
| saab340 | live | sf34 | none yet | — |
| atr72 | live | at72 | none yet | — |
| e190 | live | e190 | none yet | — |
| a220 | live | narrowbody | none yet | — |
| a320 | live | narrowbody | none yet | — |
| b737 | live | narrowbody | none yet | — |
| b787 | live | — | none yet | — |
| a350 | live | — | none yet | — |
| b747 | later |  | none yet | — |
| a380 | later |  | none yet | — |
| e175 | live | e175 | none yet | — |
| b757 | live | — | none yet | — |
| a340 | live | — | none yet | — |
| b777 | live | — | none yet | — |
| Prices from the A220 up are tuned to the cash curve (F5, replacing D16's three-tenths rule): on the Steady path each plane is a few lessons of saving away when it is meant to arrive. Tutorial planes (Twin Otter to E190, E175) keep launch-deal prices. Real prices are on the plane card for interest only. | None |  | none yet | — |

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
| New York distance | 5600 km | 5625 km |
| New York fares | £150, £200, £250, £300 | £470, £490, £510, £530, £550 |
| Dubai distance | 5600 km | 5400 km |
| Dubai fares | £200, £250, £300, £350 | £450, £470, £490, £510, £530 |
| Cairo distance | 3600 km | 3600 km |
| Cairo fares | £125, £150, £175, £200 | £330, £340, £350, £360, £370 |
| Lagos distance | 4800 km | 5000 km |
| Lagos fares | £150, £175, £200, £250 | £440, £460, £480, £500, £520 |
| Delhi distance | 7200 km | 6700 km |
| Delhi fares | £200, £250, £300, £350 | £560, £580, £600, £620, £640 |
| Tokyo distance | 9600 km | 9600 km |
| Tokyo fares | £350, £400, £450, £500 | £790, £810, £830, £850, £870 |
| Cape Town distance | 9600 km | 9700 km |
| Cape Town fares | £300, £350, £400, £450 | £800, £820, £840, £860, £880 |
| Singapore distance | 10800 km | 10900 km |
| Singapore fares | £350, £400, £450, £500 | £890, £910, £930, £950, £970 |
| Sydney distance | 17600 km | 17200 km |
| Sydney fares | £500, £600, £700, £800 | £1390, £1410, £1430, £1450, £1470 |
| DHC-6 Twin Otter price | £2,500 | £10,000 (launch deal £2,500) |
| DHC-6 Twin Otter running costs | £192 an hour, £900 a day | £150 an hour, £900 a day |
| DHC-6 Twin Otter fuel | 20 L per 100 km | 20 L per 100 km |
| Saab 340 price | £180,000 | £22,000 |
| Saab 340 running costs | £330 an hour, £1040 a day | £200 an hour, £1200 a day |
| Saab 340 fuel | 30 L per 100 km | 25 L per 100 km |
| ATR 72 price | £280,000 | £36,000 |
| ATR 72 running costs | £520 an hour, £1600 a day | £350 an hour, £1800 a day |
| ATR 72 fuel | 40 L per 100 km | 40 L per 100 km |
| Embraer E190 price | £300,000 | £70,000 |
| Embraer E190 running costs | £— an hour, £2650 a day | £900 an hour, £3500 a day |
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
| Boeing 787 Dreamliner price | £1,200,000 | £12,000,000 |
| Boeing 787 Dreamliner running costs | £— an hour, £15550 a day | £2000 an hour, £6000 a day |
| Boeing 787 Dreamliner fuel | 110 L per 100 km | 130 L per 100 km |
| Airbus A350 price | £1,600,000 | £30,000,000 |
| Airbus A350 running costs | £— an hour, £25650 a day | £2250 an hour, £6600 a day |
| Airbus A350 fuel | 120 L per 100 km | 140 L per 100 km |
| Second crew | £300 | £250 when duty is over 12 h, from 2031-01-06 (D51) |
| Rival switch rule (D50) | 1 in 5 switch when undercut | 0.1 per £10 dearer, cap 0.6, advertising × 0.5 |
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
