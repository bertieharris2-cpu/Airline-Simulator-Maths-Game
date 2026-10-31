#!/usr/bin/env python3
"""Merge Fable's workbook v6.4 (31 Oct 2026, D110: everything after week 1 moves along a week) into the game's workbook,
with Claude Code hand-off 1c.

v6.4 was made from Fable's own copy, as v6.2 and v6.3 were: it has no SheetSums, ScreenText or BriefingData sheet, and its
copies of rows Claude Code has changed since (Chapters 1 with snacks, the old briefing beats, formulaMarks, bustRule,
standingAim, the mystery shopper's snack option) are older than the game's. It also drops rows the game uses
(fuelDeskOpensDay, planCheckLookBelow, week1ExampleProfits, reviewExampleWeeks, snacksInYearOne). So this script starts from
data/Airline-World-Workbook.xlsx and takes only what D110 changes:

  * Settings: the values D110 moves (fuelDeskFromDay, flightDaysFromDay, marketSheetFromDay, reputationFromDay,
    starsTurnedAwayRule, spreadsheetLadder, secondPlaneShopFromDay, reviewRotationFrom, tipsOnlyActionable, studioExtrasFrom,
    weekOneAfterLaunch) and v6.4's new rows (afterWeekOneShift, weekTwo, whatIfSheetFromDay, dailyColourFromWeek,
    weekFlyingPages, weekSpeed, countingPriority, launchDayColumns). fuelDeskOpensDay is kept, at 15, so it agrees.
  * Calendar, days 8-35: v6.4's quiet week 2 (days 8-14), then the game's own days 8-28 moved on seven days (15-35) with
    v6.4's new titles. v6.4's rows 15-35 are not copied whole: they keep some cells from before the shift (the season
    forecast on day 19, fuel for a jet on day 24, Red Kite on day 25, the weekly-play note on day 28) and add a
    long_haul_open event on day 29, a New York headline on day 30, a fuelCost sum on Wednesday 31 and "airline type
    confirmed" on day 32, which the game's rows do not have. Those are reported to Fable, not taken. Dates, weekdays (Mon,
    as the importer checks) and week numbers follow the day; "Fuel £x a litre." headlines carry the Market sheet's price
    for that day (prices stay on their real dates; the words moved with the content).
  * Chapters 1 runCadence: weekly days to 35, week skips from day 36 (months still from 2 December).
  * Routes unlockDay, Aircraft shopFromDay, ReviewQuestions from, Upgrades weekend_schedules, the four Briefings triggers
    that move (weekend_demand, fuel_cash_tank_profit, aircraft_efficiency, cash_to_fly): v6.4's values.
  * PauseSchedule and Roadmap: v6.4's sheets as they are. README: v6.4's line, and this merge's.
  * ScreenText (the game's own sheet): the words for the plan check and the week page in weeks 2 to 4 (hand-off 1c, 4).

Usage: python3 tools/merge_v64.py <Airline-World-Workbook-v6.4.xlsx>   (then python3 tools/import_world.py)
Running it again changes nothing more.
"""
import re, sys, datetime as dt
from copy import copy
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / 'data' / 'Airline-World-Workbook.xlsx'
if len(sys.argv) != 2: sys.exit(__doc__)
game = openpyxl.load_workbook(BOOK)
v64 = openpyxl.load_workbook(sys.argv[1])
done = []

def header(ws): return [c.value for c in ws[1]]
def style_from(ws, src_row, dst_row):
    for c in range(1, ws.max_column + 1):
        s, d = ws.cell(src_row, c), ws.cell(dst_row, c)
        if s.has_style: d.font, d.fill, d.border, d.alignment, d.number_format = copy(s.font), copy(s.fill), copy(s.border), copy(s.alignment), s.number_format
def rows_by_id(ws, col=1):
    out = {}
    for r in range(2, ws.max_row + 1):
        v = ws.cell(r, col).value
        if v not in (None, ''): out.setdefault(str(v), r)
    return out
def table_end(ws, col_status):
    n = 1
    for r in range(2, ws.max_row + 1):
        if ws.cell(r, col_status).value not in (None, ''): n = r
    return n
def put(cell, v):                 # text that starts with '=' is words ("= B2 × B3"), not an Excel formula
    cell.value = v
    if isinstance(v, str) and v.startswith('='): cell.data_type = 's'
def insert_after(ws, at, values):
    ws.insert_rows(at + 1); style_from(ws, at, at + 1)
    for j, v in enumerate(values, start=1): put(ws.cell(at + 1, j), v)
    return at + 1
def col(ws, name): return header(ws).index(name) + 1

# ---------- Settings ----------
gs, ns = game['Settings'], v64['Settings']
nid = rows_by_id(ns)
for k in ('fuelDeskFromDay', 'flightDaysFromDay', 'marketSheetFromDay', 'reputationFromDay', 'starsTurnedAwayRule', 'spreadsheetLadder',
          'secondPlaneShopFromDay', 'reviewRotationFrom', 'tipsOnlyActionable', 'studioExtrasFrom', 'weekOneAfterLaunch'):
    g = rows_by_id(gs)
    for c in (2, 3, 4): gs.cell(g[k], c).value = ns.cell(nid[k], c).value
    done.append(f'Settings ~ {k}')
for k in ('afterWeekOneShift', 'weekTwo', 'whatIfSheetFromDay', 'dailyColourFromWeek', 'weekFlyingPages', 'weekSpeed', 'countingPriority', 'launchDayColumns'):
    g = rows_by_id(gs)
    vals = [ns.cell(nid[k], c).value for c in range(1, 5)]
    if k in g:
        for c in (2, 3, 4): gs.cell(g[k], c).value = vals[c - 1]
    else: insert_after(gs, table_end(gs, 4), vals)
    done.append(f'Settings + {k}')
g = rows_by_id(gs)
gs.cell(g['fuelDeskOpensDay'], 2).value = 15
gs.cell(g['fuelDeskOpensDay'], 3).value = ('D110 (v6.4, 31 Oct 2026): the Fuel desk opens at the start of week 3, as fuelDeskFromDay (was 8). v6.4 drops this row; '
                                         'Claude Code keeps it at the same day because parts of the game read it.')
done.append('Settings ~ fuelDeskOpensDay = 15')

# ---------- Calendar: days 8-35 ----------
gc, vc = game['Calendar'], v64['Calendar']
H = header(gc)
assert H == header(vc), 'Calendar headers differ'
C = {h: i + 1 for i, h in enumerate(H)}
def cal_rows(ws):
    out = {}
    for r in range(2, ws.max_row + 1):
        d = ws.cell(r, 1).value
        if isinstance(d, int): out[d] = r
    return out
def rowvals(ws, r): return {h: ws.cell(r, C[h]).value for h in H}
G0 = {d: rowvals(gc, r) for d, r in cal_rows(gc).items()}
V = {d: rowvals(vc, r) for d, r in cal_rows(vc).items()}
# the Market sheet's weekly fuel price (prices stay on their real dates)
gm = game['Market']; mh = header(gm); mw, mp = mh.index('week') + 1, mh.index('fuel £/L') + 1
market = {gm.cell(r, mw).value: gm.cell(r, mp).value for r in range(2, gm.max_row + 1) if isinstance(gm.cell(r, mw).value, int)}
start = dt.date.fromisoformat(str(G0[1]['date'])[:10])
already = G0.get(15, {}).get('title') == V[15]['title'] and 29 in G0     # this script has run before
if not already:
    new = {}
    for d in range(8, 15): new[d] = dict(V[d])
    for d in range(15, 36):
        row = dict(G0[d - 7])
        for k in ('title', 'headline 1', 'unlocks'):
            if d in (15, 21, 22, 28, 29, 35) and k == 'title': row[k] = V[d][k]
        if d == 15: row['headline 1'], row['unlocks'] = V[15]['headline 1'], V[15]['unlocks']
        if d == 35: row['unlocks'] = V[35]['unlocks']
        row['fuel £/L'] = G0[d]['fuel £/L'] if d in G0 else market[(d - 1) // 7 + 1]
        new[d] = row
    for d, row in new.items():
        day = start + dt.timedelta(days=d - 1)
        row['day'], row['date'], row['weekday'], row['week'] = d, day.isoformat(), day.strftime('%a'), (d - 1) // 7 + 1
        for k in ('headline 1', 'headline 2'):
            if isinstance(row[k], str) and re.fullmatch(r'Fuel £\d+\.\d+ a litre\.', row[k].strip()):
                row[k] = f'Fuel £{market[(d - 1) // 7 + 1]:.2f} a litre.'
    at = r28 = cal_rows(gc)[28]
    for d in range(29, 36): at = insert_after(gc, at, [None] * len(H))
    # the new rows have no day yet: number them in place
    for i, d in enumerate(range(29, 36), start=1): gc.cell(r28 + i, 1).value = d
    rows = cal_rows(gc)
    for d, row in new.items():
        r = rows[d]
        for h in H: put(gc.cell(r, C[h]), row[h])
    done.append('Calendar: days 8-14 a quiet week 2 (v6.4); days 15-35 the game\'s days 8-28 moved on seven days, with v6.4\'s titles; fuel headlines from the Market sheet')
else: done.append('Calendar: already shifted')

# ---------- Chapters 1 runCadence ----------
ch = game['Chapters']; r = rows_by_id(ch)['1']
ch.cell(r, col(ch, 'runCadence')).value = 'week (plan → run → review) to day 35; week-skips from day 36; months from 2030-12-02'
done.append('Chapters 1 runCadence: weekly to day 35, week skips from day 36, months from 2 December')

# ---------- Routes, Aircraft, ReviewQuestions, Upgrades, Briefings: one column each ----------
def copy_col(sheet, column, ids=None):
    a, b = game[sheet], v64[sheet]; ca, cb = col(a, column), col(b, column); ra, rb = rows_by_id(a), rows_by_id(b); n = 0
    for k, r in rb.items():
        if k in ra and (ids is None or k in ids) and a.cell(ra[k], ca).value != b.cell(r, cb).value:
            a.cell(ra[k], ca).value = b.cell(r, cb).value; n += 1
    done.append(f'{sheet} {column}: {n} changed')
copy_col('Routes', 'unlockDay'); copy_col('Aircraft', 'shopFromDay'); copy_col('ReviewQuestions', 'from')
copy_col('Upgrades', 'trigger', {'weekend_schedules'}); copy_col('Upgrades', 'fallback', {'weekend_schedules'})
copy_col('Briefings', 'trigger', {'weekend_demand', 'fuel_cash_tank_profit', 'aircraft_efficiency', 'cash_to_fly'})

# ---------- PauseSchedule and Roadmap: v6.4's sheets ----------
for sheet in ('PauseSchedule', 'Roadmap'):
    a, b = game[sheet], v64[sheet]
    assert header(a) == header(b), f'{sheet} headers differ'
    if a.max_row > 1: a.delete_rows(2, a.max_row - 1)
    for rr in range(2, b.max_row + 1):
        for cc in range(1, b.max_column + 1): put(a.cell(rr, cc), b.cell(rr, cc).value)
    done.append(f'{sheet}: v6.4 ({b.max_row - 1} rows)')

# ---------- README ----------
rd = game['README']
lines = [rd.cell(r, 1).value for r in range(1, rd.max_row + 1)]
v64line = next(v64['README'].cell(r, 1).value for r in range(1, v64['README'].max_row + 1) if str(v64['README'].cell(r, 1).value or '').startswith('v6.4'))
ours = ('31 Oct 2026 (Claude Code, hand-off 1c and v6.4): v6.4 merged with tools/merge_v64.py. Kept: SheetSums, ScreenText, BriefingData and the '
        "game's own rows (fuelDeskOpensDay at 15, planCheckLookBelow, the week-1 example). Calendar days 15-35 are the game's days 8-28 moved on "
        "seven days with v6.4's titles; fuel headlines carry the Market price of their day; Chapters 1 runCadence weekly to day 35, week skips from 36.")
for line in (v64line, ours):
    if line not in lines: insert_after(rd, rd.max_row, [line])
done.append('README: v6.4 and this merge')

# ---------- ScreenText: weeks 2 to 4 (hand-off 1c, section 4) ----------
st_ = game['ScreenText']
T = [
 ('plancheck.week', 'The plan check on Monday, weeks 2 to 4 (weekFlyingPages)', '', 'Your plan for week {n}', '{from} to {to} · the same flights every day', 'Fly week {n} ▶', 'Hand-off 1c section 4. Claude Code\'s words, after hand-off 3\'s.'),
 ('plancheck.lastweek', 'The plan check in weeks 2 to 4 while the plan is last week\'s: the flights panel and the checks', '', '',
  '{plane} · seats filled last week, a day on average|Every flight made money last week.|**{route} {time}** lost money last week: about {sold} of {seats} seats a day at £{fare}. Change it before the week flies?|Seats filled last week: **{sold} of {seats}** a day.|**{n} people a day** wanted seats you didn\'t have last week ({list}). A chance for later, when you have more seats.',
  '', 'Hand-off 1c section 4 (Claude Code). A flight lost money when its takings were below its own costs over the week (planCheckLookBelow a day).'),
 ('plancheck.week.under', 'The plan check in weeks 2 to 4: the line under the panels', '', '', 'Nothing to work out: Finance keeps the sheet up to date each day. **Change my plan** opens the timetable; **Fly week {n}** runs the week.', 'Change my plan', ''),
 ('plancheck.week.footer', 'The plan check in weeks 2 to 4: the footer', '', '', 'Check your plan, then fly the week.', '', ''),
 ('weekflies.week', 'The week flies, weeks 2 to 4 (Monday to Sunday)', '', 'Week {n} is flying', 'Your plan, every day, Monday to Sunday. Sunday: the week\'s accounts.', 'Skip to Sunday ⏭', 'Hand-off 1c section 4.'),
 # hand-off 1c sections 2, 3 and 6: Finance's questions at a pause (step c1q, p6g_pauseqs.js), after his own plan's sums
 ('pauseq.page', "Finance's questions at a pause: the page title and its lines ({i} of {k}; the second line when his plan's sums took a slot)", '', 'Before week {n} flies', "Question {i} of {k} from Finance. Work it out in your book.|Your own plan's sums came first at this pause, so Finance's other {w} waits for the next one.", 'Next question ▶', 'Hand-off 1c section 3 (countingPriority). Claude Code\'s words.'),
 ('pauseq.footer', "Finance's questions: the footer", '', '', "Before week {n} flies · Finance's questions", 'Carry on ▶', ''),
 ('pauseq.whatIfFirst', 'P2: the what-if sheet\'s first sum (seats filled × fare)', 'NEW · WHAT IF', 'What if {city} were {fare}?', 'The **What if** sheet opens today, in the Studio: change a fare and every figure on its row works itself out (ƒ).|Its first sum by hand: {city} at **{fare}** instead of {now}. Ticket revenue a day = seats filled × fare.', '', 'PauseSchedule P2, question 1.'),
 ('pauseq.modelChange', 'The modelling question when his plan leaves money on the table (section 6)', 'MODELLING', '{city}: {now} or {fare}?', 'On your own flights, **{fare}** would earn more on {city} than your {now}.|How much more for one flight? Finance works out a day and a week from your answer.', '', 'Settings modellingQuestion; tipGainGate.'),
 ('pauseq.modelChange.pick', 'The modelling question when his plan is already good: two suggested changes', 'MODELLING', 'Try a change', 'Your plan is already good: no other fare earns {gate} a day more.|Finance suggests two changes. Pick one and work out what it would do for one flight.', '', ''),
 ('pauseq.timeToAfford', 'P3: the time to afford a plane', 'THE PLANE SHOP', 'How long until you can afford the {plane}?', 'The {plane} costs **{price}**. You have {cash}, and your planes made about **{rate} a day** last week.|Days to afford = still to find ÷ profit a day, rounded up to a whole day.', '', 'PauseSchedule P3, question 1.'),
 ('pauseq.reviewRotation', 'The rotating review question, on last week\'s days ({q} is the ReviewQuestions question)', 'LAST WEEK', '{q}', 'About {period}: {from} to {to}.', '', 'ReviewQuestions in turn.'),
 ('pauseq.fuelTwoPlanes', 'P4: litres a seat for his two types of plane', 'FUEL', 'Which plane uses less fuel for each seat?', 'A trip to {city} and back in each of your planes: the {a} and the {b}.|Litres a seat = fuel a trip ÷ seats. Give it to one decimal place.', '', 'PauseSchedule P4, question 1 (Claude Code\'s reading: litres a seat).'),
 ('pauseq.ticketRevenueLong', 'P4: the possible ticket revenue of the route that opens today (Madrid)', 'NEW ROUTE', 'What could {city} take in a day?', '{city} opens today: {km} km away, further than any route you fly.|If everyone who wants to fly went at {fare}: who wants to fly × fare.', '', 'PauseSchedule P4, question 2.'),
 ('pauseq.projectedVsActual', 'The difference from the plan, now on Monday', 'LAST WEEK', 'How far was {period} from the plan?', 'On Monday the plan said **{proj}**. The week made **{total}**.|Difference = the larger − the smaller.', '', 'PauseSchedule P5, then about every third pause (differenceCadence).'),
]
for vals in T:
    ti = rows_by_id(st_)
    if vals[0] in ti:
        for j, v in enumerate(vals, start=1): put(st_.cell(ti[vals[0]], j), v)
    else:
        last = max(r for k, r in ti.items() if ' ' not in k)
        insert_after(st_, last, list(vals))
done.append(f'ScreenText: {len(T)} rows (hand-off 1c, weeks 2 to 4)')

game.save(BOOK)
print('\n'.join(done))
print(f'{len(done)} changes; saved {BOOK}')
