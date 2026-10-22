# The workbook's figures that tests/numbers.test.js traces: Routes, Aircraft, Airports, Settings, the Calendar's and
# Market's fuel prices and the Archetypes, read straight from data/Airline-World-Workbook.xlsx (JSON on stdout).
# Run: python3 -I src/opening/tests/wb_values.py data/Airline-World-Workbook.xlsx
import sys, json, datetime as dt
import openpyxl

book = sys.argv[1]
wb = openpyxl.load_workbook(book, read_only=True, data_only=True)

def rows(name):
    ws = wb[name]; it = ws.iter_rows(values_only=True)
    hdr = [str(h).strip() if h is not None else '' for h in next(it)]
    out = []
    for r in it:
        if r is None or not any(v is not None for v in r): continue
        d = {}
        for h, v in zip(hdr, r):
            if isinstance(v, (dt.datetime, dt.date)): v = v.strftime('%Y-%m-%d')
            if isinstance(v, float) and v.is_integer(): v = int(v)
            d[h] = v
        out.append(d)
    return out

def col(d, start):
    for k in d:
        if k.lower().startswith(start.lower()): return d[k]
    return None

def live(xs, num=None):   # live and optional rows; a notes row (no number in the key column) is skipped
    return [x for x in xs if str(x.get('status') or 'live').strip().lower() in ('live', 'optional') and (num is None or isinstance(x.get(num), (int, float)))]

R = {}
R['routes'] = [{ 'id':r['id'], 'city':r['city'], 'km':r['distanceKm'], 'turnaroundAwayMin':r['turnaroundAwayMin'], 'landingFeeAway':r['landingFeeAway'],
                 'baseFare':r['baseFare'], 'fareOptions':[int(x) for x in str(r['fareOptions']).split('|')],
                 'demandAtFare':{ k.strip():int(v) for k, v in (p.split(':') for p in str(col(r, 'demandAtFare')).split('|')) },
                 'archetype':r['archetype'], 'unlockDay':r['unlockDay'] } for r in live(rows('Routes'), 'distanceKm')]
R['aircraft'] = [{ 'id':a['id'], 'name':a['name'], 'seats':a['seats'], 'speedKmh':a['speedKmh'], 'rangeKm':a['rangeKm'], 'fuelPer100Km':a['fuelPer100Km'],
                   'hourlyCost':a['hourlyCost'], 'dayCost':a['dayCost'], 'listPrice':a['listPrice'], 'launchDealPrice':a.get('launchDealPrice') } for a in live(rows('Aircraft'), 'seats')]
R['airports'] = [{ 'code':a['code'], 'terminal':a['terminal'], 'landingFee':a['landingFee'], 'turnaroundMin':a['turnaroundMin'], 'passengerCharge':a['passengerCharge'],
                   'demandModifier':a['demandModifier'] } for a in live(rows('Airports'), 'landingFee')]
R['settings'] = { s['Key']:s['Value'] for s in live(rows('Settings')) if s.get('Key') }
R['calendar'] = [{ 'day':c['day'], 'date':c['date'], 'fuel':col(c, 'fuel') } for c in live(rows('Calendar')) if isinstance(c.get('day'), int)]
R['market'] = [{ 'week':m['week'], 'fuel':col(m, 'fuel') } for m in live(rows('Market')) if isinstance(m.get('week'), int)]
R['archetypes'] = { a['id']:{ 'timeSensitiveShare':a['timeSensitiveShare'], 'bands':{ b:a[b] for b in ('early', 'midmorning', 'midday', 'afternoon', 'evening') },
                               'businessShare':a.get('businessShare'), 'growthPerWeek':a.get('growthPerWeek') } for a in live(rows('Archetypes'), 'timeSensitiveShare')}
print(json.dumps(R))
