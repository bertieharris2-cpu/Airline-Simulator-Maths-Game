#!/usr/bin/env python3
"""Import the world workbook into the prototype's data.

Reads data/Airline-World-Workbook.xlsx and writes:
  * a JSON block <script type="application/json" id="data-workbook"> in src/opening/parts/p2_data.html
    (live rows only, as the workbook's README asks; weekend Calendar rows marked "optional" are kept and flagged);
  * data/Import-Report.md: what was loaded, what was skipped, and every check that failed.

The game does not read data-workbook yet: wiring it in is the next step, once the engine rules are confirmed.

Usage:
  python3 tools/import_world.py            # import and write the report
  python3 tools/import_world.py --check    # write the report only; the game data is not touched
  python3 tools/import_world.py --all      # also load placeholder and later rows (each keeps its status)

Ids never change. If a later workbook drops an id that an earlier import had, the report lists it as an error.
"""
import datetime as dt, json, re, sys
from collections import Counter
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.exit('Needs openpyxl: pip install openpyxl')

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / 'data' / 'Airline-World-Workbook.xlsx'
DATA = ROOT / 'src' / 'opening' / 'parts' / 'p2_data.html'
REPORT = ROOT / 'data' / 'Import-Report.md'
PASS1 = ROOT / 'data' / 'fable-routes-pass1.json'     # the engine rules (Fable Pass 1, section 0): bands, duty padding
BLOCK_ID = 'data-workbook'

# The game already uses these ids for the same aircraft.
AIRCRAFT_IDS = {'saab340': 'sf34', 'atr72': 'at72'}
BANDS = ['early', 'midmorning', 'midday', 'afternoon', 'evening']
HEADER_NAMES = {'#': 'n', 'leg hours TO / Saab-ATR / jet': 'legHours'}

args = set(sys.argv[1:])
LOAD = {'live', 'optional'} | ({'placeholder', 'later'} if '--all' in args else set())
issues = []          # (level, sheet, message): level is 'error' (fix before wiring in), 'check' (probably wrong) or 'note'
def issue(level, sheet, msg): issues.append((level, sheet, msg))


# ---------- reading ----------
def key(h):
    h = str(h).strip()
    if h in HEADER_NAMES: return HEADER_NAMES[h]
    words = re.findall(r'[A-Za-z0-9]+', re.sub(r'\(.*?\)', '', h).replace('£/L', ''))
    return words[0][0].lower() + words[0][1:] + ''.join(w[0].upper() + w[1:] for w in words[1:])

def plain(v):
    if isinstance(v, (dt.datetime, dt.date)): return v.strftime('%Y-%m-%d')
    if isinstance(v, str):
        v = v.strip()
        if v.upper() in ('TRUE', 'FALSE'): return v.upper() == 'TRUE'
        return v or None
    if isinstance(v, float) and v.is_integer(): return int(v)
    return v

def sheet(wb, name):
    ws = wb[name]; rows = list(ws.iter_rows(values_only=True))
    head = [key(h) for h in rows[0] if h is not None]
    out = []
    for r in rows[1:]:
        if all(c is None for c in r): continue
        out.append({k: plain(v) for k, v in zip(head, r)})
    return out

counts = {}
def live(name, rows):
    st = Counter((r.get('status') or 'no status') for r in rows)
    keep = [r for r in rows if (r.get('status') or 'live') in LOAD]
    counts[name] = (len(keep), dict(st))
    return keep


# ---------- small parsers ----------
def num(s):
    s = str(s).strip().replace('£', '').replace(',', '')
    f = float(s); return int(f) if f.is_integer() else f

def nums(s):            # '70|80|90' -> [70, 80, 90]
    return [num(x) for x in str(s).split('|') if x.strip()] if s not in (None, '') else []

def pairs(s):           # '70:80|80:72' -> {'70': 80, '80': 72}
    if not s or ':' not in str(s): return None
    return {str(num(a)): num(b) for a, b in (p.split(':') for p in str(s).split('|') if p.strip())}

def pct(s):             # '+15%' -> 0.15
    return None if s is None else round(num(str(s).replace('%', '').replace('+', '')) / 100, 4)

def changes(s):         # 'business:-30%,gva:+10' -> {'business': {'pct': -30}, 'gva': {'add': 10}}
    if not s: return None
    out = {}
    for part in str(s).split(','):
        k, v = part.split(':'); v = v.strip()
        out[k.strip()] = {'pct': num(v.rstrip('%').replace('+', ''))} if v.endswith('%') else {'add': num(v.replace('+', ''))}
    return out

def fares(s):           # 'dub:50' -> {'dub': 50}
    return {k.strip(): num(v) for k, v in (p.split(':') for p in str(s).split(','))} if s else None

def words(s):           # 'fuel,pricing' -> ['fuel', 'pricing']
    return [w.strip() for w in str(s).split(',') if w.strip()] if s else []

def unlocks(s):         # 'routes:dub,par; planes:dhc6(launch deal); mechanics:fare' -> {'routes': [...], ...}
    if not s: return None
    out = {}
    for part in str(s).split(';'):
        if ':' not in part: continue
        k, v = part.split(':', 1)
        items = [re.sub(r'\(.*?\)', '', x).strip() for x in v.split(',')]
        if k.strip() == 'planes': items = [AIRCRAFT_IDS.get(x, x) for x in items]
        out[k.strip()] = [x for x in items if x]
    return out

def date(s): return dt.date.fromisoformat(str(s)[:10])


# ---------- the workbook ----------
wb = openpyxl.load_workbook(BOOK, data_only=True)

settings_rows = sheet(wb, 'Settings')
settings = {r['key']: r['value'] for r in live('Settings', settings_rows)}
start = date(settings['startDate'])

arche = live('Archetypes', sheet(wb, 'Archetypes'))
archetypes = []
for a in arche:
    archetypes.append({'id': a['id'], 'name': a['name'], 'bands': {b: a[b] for b in BANDS},
                       'timeSensitiveShare': a['timeSensitiveShare'], 'fareSensitivity': a['fareSensitivity'],
                       'businessShare': a['businessShare'], 'growthPerWeek': a['growthPerWeek'], 'growthCeiling': a['growthCeiling'],
                       'season': {s: a['season' + s.title()] for s in ('spring', 'summer', 'autumn', 'winter')},
                       'story': a['story'], 'status': a['status']})

all_routes = sheet(wb, 'Routes')
routes = []
for r in live('Routes', all_routes):
    routes.append({'id': r['id'], 'city': r['city'], 'country': r['country'], 'airport': r['airportCode'],
                   'lat': r['lat'], 'lon': r['lon'], 'utc': r['utc'], 'archetype': r['archetype'], 'km': r['distanceKm'],
                   'turnaroundAwayMin': r['turnaroundAwayMin'], 'landingFeeAway': r['landingFeeAway'],
                   'baseFare': r['baseFare'], 'fareOptions': nums(r['fareOptions']), 'demandAtFare': pairs(r['demandAtFare']),
                   'competitionSensitivity': r['competitionSensitivity'], 'unlockDay': r['unlockDay'],
                   'story': r['story'], 'status': r['status']})

catalogue = [{'id': r['id'], 'city': r['city'], 'country': r['country'], 'airport': r['code'], 'km': r['distanceKm'],
              'archetype': r['archetype'], 'haul': r['haul'], 'baseFare': r['baseFare'], 'legHours': r['legHours'],
              'plannedOpenWeek': r['plannedOpenWeek'], 'notes': r['notes'], 'status': r['status']}
             for r in live('RouteCatalogue', sheet(wb, 'RouteCatalogue'))]

all_aircraft = sheet(wb, 'Aircraft')
aircraft = [{'id': AIRCRAFT_IDS.get(a['id'], a['id']), 'wbId': a['id'], 'name': a['name'], 'tier': a['tier'], 'seats': a['seats'],
             'speedKmh': a['speedKmh'], 'rangeKm': a['rangeKm'], 'fuelPer100Km': a['fuelPer100Km'], 'hourlyCost': a['hourlyCost'],
             'dayCost': a['dayCost'], 'listPrice': a['listPrice'], 'launchDealPrice': a['launchDealPrice'],
             'shopFromDay': a['shopFromDay'], 'identity': a['identity'], 'status': a['status']}
            for a in live('Aircraft', all_aircraft)]

finance_rows = live('Finance', sheet(wb, 'Finance'))
finance = [{'aircraft': AIRCRAFT_IDS.get(f['aircraftId'], f['aircraftId']), 'cashPrice': f['cashPrice'], 'deposit': f['deposit'],
            'dailyPayment': f['dailyPayment'], 'days': f['days'], 'totalPaid': f['totalPaid'],
            'leaseUpfront': f['leaseUpfront'], 'leaseDaily': f['leaseDaily'], 'notes': f['notes'], 'status': f['status']}
           for f in finance_rows]

airports = [{'code': a['code'], 'name': a['name'], 'terminal': a['terminal'], 'landingFee': a['landingFee'],
             'demandModifier': pct(a['demandModifier']), 'tendency': a['tendency'], 'turnaroundMin': a['turnaroundMin'],
             'passengerCharge': a['passengerCharge'], 'notes': a['notes'], 'status': a['status']}
            for a in live('Airports', sheet(wb, 'Airports'))]

all_cal = sheet(wb, 'Calendar')
calendar = [{'day': c['day'], 'date': c['date'], 'weekday': c['weekday'], 'week': c['week'], 'phase': c['phase'],
             'fuel': c['fuel'], 'title': c['title'], 'headlines': [h for h in (c['headline1'], c['headline2']) if h],
             'event': c['eventId'], 'unlocks': unlocks(c['unlocks']), 'demandChanges': changes(c['demandChanges']),
             'rivalFares': fares(c['rivalFares']), 'jobs': words(c['jobs']), 'gatedCalc': c['gatedCalc'],
             'challenge': c['challenge'], 'status': c['status']}
            for c in live('Calendar', all_cal)]

all_market = sheet(wb, 'Market')
market = [{'week': m['week'], 'weekStart': m['weekStart'], 'season': m['season'], 'fuel': m['fuel'],
           'businessMult': m['businessMult'], 'leisureMult': m['leisureMult'],
           'seasonMult': {'bcn': m['bcnSeasonMult'], 'gva': m['gvaSeasonMult']},
           'weather': m['weather'], 'headline': m['headline'], 'status': m['status']}
          for m in live('Market', all_market)]

all_events = sheet(wb, 'Events')
ev_rows = live('Events', all_events)
events, by_id = [], {}
for e in ev_rows:
    x = by_id.get(e['eventId'])
    if not x:
        x = by_id[e['eventId']] = {'id': e['eventId'], 'date': e['date'], 'title': e['title'], 'text': e['text'],
                                   'options': [], 'effects': None, 'status': e['status']}
        events.append(x)
    if e['option'] is not None:
        x['options'].append({'n': e['option'], 'label': e['label'], 'sub': e['subLabel'], 'cash': e['cash'],
                             'stars': e['stars'], 'board': e['boardStatus'], 'effects': e['otherEffects'], 'why': e['whyLine']})
    elif e['otherEffects']:
        x['effects'] = e['otherEffects']

all_ch = sheet(wb, 'Challenges')
challenges = [{'n': c['n'], 'day': c['day'], 'title': c['title'], 'story': c['story'], 'question': c['question'],
               'answer': c['answer'], 'unit': c['unit'], 'reward': c['reward'], 'status': c['status']}
              for c in live('Challenges', all_ch)]

mechanics = [{'fromDay': m['fromDay'], 'mechanic': m['mechanic'], 'notes': m['notes'], 'status': m['status']}
             for m in live('Mechanics', sheet(wb, 'Mechanics'))]

# The engine rules the workbook assumes. Band times and duty padding are not on a sheet yet, so they come from Pass 1.
engine = {}
if PASS1.exists():
    p1 = json.loads(PASS1.read_text())
    a = p1.get('assumptions', {})
    engine = {k: a[k] for k in ('serviceIsRoundTrip', 'revenuePerService', 'bands', 'allocation', 'dutyPaddingMinutes', 'airportOpen') if k in a}
    engine['source'] = PASS1.name
    for k, sk in (('secondCrewCost', 'secondCrewCost'), ('maxDutyHours', 'maxDutyHours')):
        if k in a and sk in settings and a[k] != settings[sk]:
            issue('check', 'Settings', f'{sk} is {settings[sk]}, but Pass 1 has {a[k]}. The workbook wins.')
    p1a = {x['id']: x for x in p1.get('aircraft', [])}
    for x in all_aircraft:
        y = p1a.get(x['id'])
        if not y or x['status'] != 'live': continue
        diff = [f'{k} {y[k]} → {x[k]}' for k in ('seats', 'speedKmh', 'fuelPer100Km', 'hourlyCost', 'dayCost', 'listPrice') if k in y and y[k] != x[k]]
        if diff: issue('note', 'Aircraft', f'{x["id"]} differs from Pass 1 (Pass 1 → workbook): {", ".join(diff)}. The workbook wins.')
else:
    issue('error', 'Settings', f'{PASS1.name} is missing, so the day bands and duty padding are unknown.')

world = {'source': BOOK.name, 'engine': engine, 'imported': dt.date.today().isoformat(), 'loaded': sorted(LOAD),
         'settings': settings, 'archetypes': archetypes, 'routes': routes, 'routeCatalogue': catalogue,
         'aircraft': aircraft, 'finance': finance, 'airports': airports, 'calendar': calendar, 'market': market,
         'events': events, 'challenges': challenges, 'mechanics': mechanics}


# ---------- checks ----------
WD = lambda d: d.strftime('%a')

# dates and weekdays
note = next((r.get('notes') or '' for r in settings_rows if r['key'] == 'startDate'), '')
for wd in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'):
    if wd in note and start.strftime('%A') != wd:
        nxt = start + dt.timedelta(days=(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].index(wd) - start.weekday()) % 7)
        issue('error', 'Settings', f'startDate {start:%d %b %Y} is a {start:%A}, but its note says "{wd}". '
              f'The nearest {wd} after it is {nxt:%d %b %Y}.')
for c in all_cal:
    d = date(c['date'])
    if d != start + dt.timedelta(days=c['day'] - 1):
        issue('error', 'Calendar', f'day {c["day"]} is dated {d}, but startDate + {c["day"] - 1} days is {start + dt.timedelta(days=c["day"] - 1)}.')
    if c['weekday'] and c['weekday'] != WD(d):
        issue('error', 'Calendar', f'day {c["day"]} ({d}) is labelled {c["weekday"]}, but it is a {WD(d)}.')
    for wd in ('Saturday', 'Sunday', 'Monday'):
        if (c['title'] or '').startswith(wd) and d.strftime('%A') != wd:
            issue('error', 'Calendar', f'day {c["day"]} is titled "{c["title"]}", but {d:%d %b} is a {d:%A}.')
    if c['phase'] == 'weekend' and d.weekday() < 5:
        issue('error', 'Calendar', f'day {c["day"]} is a weekend row, but {d:%d %b} is a {d:%A}.')
for m in all_market:
    want = start + dt.timedelta(days=7 * (m['week'] - 1))
    if date(m['weekStart']) != want:
        issue('error', 'Market', f'week {m["week"]} starts {m["weekStart"]}, expected {want}.'); break
weeks = [m['week'] for m in all_market]
if weeks != list(range(1, len(weeks) + 1)): issue('error', 'Market', 'week numbers are not 1, 2, 3… in order.')
if all_market and date(all_market[0]['weekStart']).weekday() != 0:
    issue('check', 'Market', f'weeks start on a {date(all_market[0]["weekStart"]):%A}, not a Monday, so a Mon–Fri game week straddles two Market rows.')

# fuel: the Calendar's daily price against the Market's weekly one
mk = {m['week']: m for m in all_market}
for wk in sorted({c['week'] for c in all_cal}):
    days = [c for c in all_cal if c['week'] == wk and c['fuel'] is not None]
    if wk in mk and days:
        lo, hi, w = min(c['fuel'] for c in days), max(c['fuel'] for c in days), mk[wk]['fuel']
        if not (lo <= w <= hi):
            span = f'£{lo:.2f}' if lo == hi else f'£{lo:.2f}–£{hi:.2f}'
            issue('check', 'Market', f'week {wk} fuel is £{w:.2f}, but the Calendar has {span} on its days. '
                  'Time skips use the Market price, so the two should agree.')

# archetypes
aids = {a['id'] for a in arche}
for a in arche:
    tot = round(sum(a[b] for b in BANDS), 6)
    if abs(tot - 1) > 1e-6: issue('error', 'Archetypes', f'{a["id"]}: day-band shares add up to {tot}, not 1.')
for r in all_routes + sheet(wb, 'RouteCatalogue'):
    if r.get('archetype') and r['archetype'] not in {a['id'] for a in sheet(wb, 'Archetypes')}:
        issue('error', 'Routes', f'{r["id"]}: archetype "{r["archetype"]}" is not on the Archetypes sheet.')
    elif r.get('archetype') and r['archetype'] not in aids and (r.get('status') in LOAD):
        issue('error', 'Routes', f'{r["id"]} is loaded, but its archetype "{r["archetype"]}" is not.')

# routes: demand tables
for r in routes:
    t = r['demandAtFare']
    if not t: issue('error', 'Routes', f'{r["id"]} is live but has no demand table.'); continue
    fs = sorted(t, key=float)
    if any(t[a] < t[b] for a, b in zip(fs, fs[1:])):
        issue('check', 'Routes', f'{r["id"]}: demand rises with the fare somewhere in {r["demandAtFare"]}.')
    miss = [f for f in r['fareOptions'] if str(f) not in t]
    if miss: issue('error', 'Routes', f'{r["id"]}: fare options {miss} have no demand figure.')
    if r['baseFare'] not in r['fareOptions']: issue('check', 'Routes', f'{r["id"]}: base fare £{r["baseFare"]} is not one of the fare options.')

# leg times on quarter hours (the README sheet's promise)
live_planes = [a for a in all_aircraft if a['status'] == 'live']
for r in [x for x in all_routes if x['status'] == 'live']:
    bad = []
    for a in live_planes:
        mins = r['distanceKm'] / a['speedKmh'] * 60
        if abs(mins / 15 - round(mins / 15)) > 1e-9: bad.append(f'{a["name"]} {mins:.0f} min')
    if bad: issue('check', 'Routes', f'{r["id"]} ({r["distanceKm"]} km): legs not on a quarter hour: {", ".join(bad)}.')

# references between sheets
ev_ids = {e['eventId'] for e in all_events}
ch_by_n = {c['n']: c for c in all_ch}
route_ids = {r['id'] for r in all_routes}
plane_ids = {AIRCRAFT_IDS.get(a['id'], a['id']) for a in all_aircraft}
for c in all_cal:
    if c['eventId'] and c['eventId'] not in ev_ids: issue('error', 'Calendar', f'day {c["day"]}: event "{c["eventId"]}" is not on the Events sheet.')
    if c['eventId'] in ev_ids:
        ed = next(e['date'] for e in all_events if e['eventId'] == c['eventId'])
        if ed != c['date']: issue('error', 'Events', f'"{c["eventId"]}" is dated {ed}, but the Calendar puts it on day {c["day"]} ({c["date"]}).')
    if c['challenge'] is not None:
        ch = ch_by_n.get(c['challenge'])
        if not ch: issue('error', 'Calendar', f'day {c["day"]}: challenge {c["challenge"]} is not on the Challenges sheet.')
        elif ch['day'] != c['day']: issue('error', 'Challenges', f'challenge {c["challenge"]} says day {ch["day"]}, the Calendar day {c["day"]}.')
    u = unlocks(c['unlocks']) or {}
    for rid in u.get('routes', []):
        if rid not in route_ids: issue('error', 'Calendar', f'day {c["day"]} unlocks route "{rid}", which is not on the Routes sheet.')
    for pid in u.get('planes', []):
        if pid not in plane_ids: issue('error', 'Calendar', f'day {c["day"]} unlocks plane "{pid}", which is not on the Aircraft sheet.')
for f in finance_rows:
    if AIRCRAFT_IDS.get(f['aircraftId'], f['aircraftId']) not in plane_ids: issue('error', 'Finance', f'"{f["aircraftId"]}" is not on the Aircraft sheet.')
    if f['deposit'] + f['dailyPayment'] * f['days'] != f['totalPaid']:
        issue('error', 'Finance', f'{f["aircraftId"]}: deposit + daily × days = {f["deposit"] + f["dailyPayment"] * f["days"]}, not {f["totalPaid"]}.')
dates = [e['date'] for e in events]
if dates != sorted(dates): issue('note', 'Events', 'events are not in date order (harmless; the game sorts them).')

# reputation is switched off in the prototype
star_ev = [e['id'] for e in events if any(o['stars'] for o in e['options'])]
star_ch = [str(c['n']) for c in challenges if 'star' in str(c['reward'])]
if star_ev or star_ch:
    issue('note', 'Events', f'reputation is switched off in the prototype, so star effects do nothing yet: events {", ".join(star_ev) or "none"}; '
          f'challenges {", ".join(star_ch) or "none"}. Those choices then differ only in cash.')

# ids never change: compare with the last import
src = DATA.read_text()
m = re.search(r'<script type="application/json" id="%s">(.*?)</script>' % BLOCK_ID, src, re.S)
if m:
    old = json.loads(m.group(1))
    for part, idk in (('routes', 'id'), ('aircraft', 'id'), ('archetypes', 'id'), ('events', 'id')):
        gone = {x[idk] for x in old.get(part, [])} - {x[idk] for x in world[part]}
        if gone: issue('error', part.title(), f'ids in the last import are missing now: {", ".join(sorted(gone))}. Ids never change.')


# ---------- what changes when this is wired in ----------
def J(i):
    mm = re.search(r'<script type="application/json" id="%s">(.*?)</script>' % i, src, re.S)
    return json.loads(mm.group(1)) if mm else None
GW, GP = J('data-world') or {}, {p['id']: p for p in (J('data-planes') or [])}
rows = []
for r in routes:
    g = next((x for x in GW.get('routes', []) if x['id'] == r['id']), None)
    if g: rows.append(f'| {r["city"]} distance | {g["km"]} km | {r["km"]} km |')
    if g: rows.append(f'| {r["city"]} fares | {", ".join("£%d" % p for p in g["prices"])} | {", ".join("£%d" % p for p in r["fareOptions"])} |')
for a in aircraft:
    g = GP.get(a['id'])
    if not g: continue
    rows.append(f'| {a["name"]} price | £{g["price"]:,} | £{a["listPrice"]:,}' + (f' (launch deal £{a["launchDealPrice"]:,})' if a['launchDealPrice'] else '') + ' |')
    if g.get('hourCost') or g.get('dayCost'):
        rows.append(f'| {a["name"]} running costs | £{g.get("hourCost", "—")} an hour, £{g.get("dayCost", "—")} a day | £{a["hourlyCost"]} an hour, £{a["dayCost"]} a day |')
    rows.append(f'| {a["name"]} fuel | {g["fuelUse"]} L per 100 km | {a["fuelPer100Km"]} L per 100 km |')
rows.append(f'| Second crew | £{GW.get("crewCost", "—")} | £{settings.get("secondCrewCost")} when duty is over {settings.get("maxDutyHours")} h |')
rows.append(f'| Starting cash | £{GW.get("startingCash", "—"):,} | £{settings.get("startingCash"):,} |')
rows.append(f'| Start date | Sun 12 May 2030 | {start:%a %d %b %Y} |')


# ---------- write ----------
order = {'error': 0, 'check': 1, 'note': 2}
issues.sort(key=lambda x: (order[x[0]], x[1]))
n = Counter(l for l, _, _ in issues)
out = [f'# Import report: {BOOK.name}', '',
       f'*Written by `tools/import_world.py` on {dt.date.today():%d %b %Y}. Loaded: {", ".join(sorted(LOAD))} rows. '
       f'{"Check only: the game data was not changed." if "--check" in args else f"Written to `{DATA.relative_to(ROOT)}` as `{BLOCK_ID}` (the game does not read it yet)."}*', '',
       f'**{n["error"]} to fix, {n["check"]} to check, {n["note"]} notes.**', '',
       '## Loaded', '', '| Sheet | Loaded | Rows by status |', '| --- | --- | --- |']
for s, (k, st) in counts.items():
    out.append(f'| {s} | {k} | {", ".join(f"{v} {s2}" for s2, v in sorted(st.items()))} |')
for title, lvl in (('To fix before wiring in', 'error'), ('To check', 'check'), ('Notes', 'note')):
    xs = [(s, msg) for l, s, msg in issues if l == lvl]
    if xs: out += ['', f'## {title}', ''] + [f'- **{s}:** {msg}' for s, msg in xs]
out += ['', '## What changes when the workbook is wired in', '',
        'The prototype\'s current values against the workbook\'s. Nothing changes until the engine reads `data-workbook`.', '',
        '| | Prototype now | Workbook |', '| --- | --- | --- |'] + rows
out += ['', '## Engine rules the workbook assumes', '',
        'From the README sheet (Fable Pass 1, section 0). To confirm before the engine uses the data:', '',
        '- A service is a round trip that earns one plane-load at the fare (return tickets).',
        '- Five day bands: ' + (', '.join(f'{b} {v[0]:02d}:00–{v[1]:02d}:00' for b, v in engine.get('bands', {}).items()) or 'boundaries unknown') + ' (from Pass 1; the prototype has three). A service belongs to the band it leaves home in.',
        '- Time-locked passengers fly only in their band. In each band: demand × timeSensitiveShare × the band\'s share, rounded (halves to even). The rest are flexible and fill any seats left that day.',
        '- People at a fare come from the route\'s demand table, not a formula.',
        '- Costs per service: flying hours × hourly cost + landing fees at both ends + fuel + a charge for each passenger at home. Per day: the day cost, plus a second crew when duty is over 12 h (30 minutes before the first departure to 30 minutes after the last arrival).',
        '- Fuel: the Calendar has a price for each day; the Market sheet has one for each week, used for time skips.', '']
REPORT.write_text('\n'.join(out))

if '--check' not in args:
    block = '<script type="application/json" id="%s">%s</script>' % (BLOCK_ID, json.dumps(world, ensure_ascii=False, separators=(',', ':')))
    if m: src = src[:m.start()] + block + src[m.end():]
    else: src = src.rstrip('\n') + '\n' + block + '\n'
    DATA.write_text(src)

print(f'{REPORT.relative_to(ROOT)}: {n["error"]} to fix, {n["check"]} to check, {n["note"]} notes'
      + ('' if '--check' in args else f'; {BLOCK_ID} written ({len(routes)} routes, {len(aircraft)} aircraft, {len(calendar)} days, {len(market)} weeks, {len(events)} events)'))
