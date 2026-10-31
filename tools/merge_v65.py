#!/usr/bin/env python3
"""Merge Fable's workbook v6.5 (31 Oct 2026, D111: week 1 every day, Frankfurt earned in week 1) into the game's workbook,
with Claude Design's hand-off 2a screens.

v6.5 was made from Fable's own copy, as v6.2 to v6.4 were: it has no SheetSums, ScreenText or BriefingData sheet, and its
copies of rows Claude Code has changed since (Chapters 1 runCadence before the 1c shift, the snacks, the old briefing
beats, formulaMarks, bustRule, standingAim, the Mechanics days before the shift) are older than the game's. It also drops
rows the game uses (fuelDeskOpensDay, planCheckLookBelow, week1ExampleProfits, reviewExampleWeeks, snacksInYearOne). So
this script starts from data/Airline-World-Workbook.xlsx and takes only what D111 changes:

  * Settings: v6.5's new rows (dailyChangeDays, dailyChangeCountedPerDay, dailyChangeCountedWeek, dailyKeepCounted,
    fullPlaneNudge, weekOneCountedTotal, thirdRouteId, thirdRouteRule, thirdRouteEarliest, thirdRouteLatest,
    thirdRouteCard, keptPlanMondaySum) and the values D111 changes (spreadsheetLadder, weekSpeed, weekOneAfterLaunch,
    midweekQuestions).
  * Routes fra: v6.5's distance, base fare, demand and story (Frankfurt rebalanced to be a real choice).
  * Roadmap Week 4 and PauseSchedule P1: v6.5's words.
  * README: v6.5's line, and this merge's.
  * ScreenText (the game's own sheet): the words of the Day page, the daily change, the Frankfurt card and the week 1
    Sunday side by side (hand-off 2a, sections 1-6). Every word on those screens is read from here.

Usage: python3 tools/merge_v65.py <Airline-World-Workbook-v6.5.xlsx>   (then python3 tools/import_world.py)
Running it again changes nothing more.
"""
import sys
from copy import copy
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / 'data' / 'Airline-World-Workbook.xlsx'
if len(sys.argv) != 2: sys.exit(__doc__)
game = openpyxl.load_workbook(BOOK)
v65 = openpyxl.load_workbook(sys.argv[1])
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
def last_row(ws):
    n = 1
    for r in range(2, ws.max_row + 1):
        if any(ws.cell(r, c).value not in (None, '') for c in range(1, ws.max_column + 1)): n = r
    return n
def put(cell, v):                 # text that starts with '=' is words ("= D5 × 7"), not an Excel formula
    cell.value = v
    if isinstance(v, str) and v.startswith('='): cell.data_type = 's'
def append(ws, values):
    at = last_row(ws); style_from(ws, at, at + 1)
    for j, v in enumerate(values, start=1): put(ws.cell(at + 1, j), v)
def col(ws, name): return header(ws).index(name) + 1

# ---------- Settings ----------
gs, ns = game['Settings'], v65['Settings']
nid = rows_by_id(ns)
for k in ('spreadsheetLadder', 'weekSpeed', 'weekOneAfterLaunch', 'midweekQuestions'):
    g = rows_by_id(gs)
    for c in range(2, ns.max_column + 1): gs.cell(g[k], c).value = ns.cell(nid[k], c).value
    done.append(f'Settings ~ {k}')
for k in ('dailyChangeDays', 'dailyChangeCountedPerDay', 'dailyChangeCountedWeek', 'dailyKeepCounted', 'fullPlaneNudge', 'weekOneCountedTotal',
          'thirdRouteId', 'thirdRouteRule', 'thirdRouteEarliest', 'thirdRouteLatest', 'thirdRouteCard', 'keptPlanMondaySum'):
    g = rows_by_id(gs)
    vals = [ns.cell(nid[k], c).value for c in range(1, ns.max_column + 1)]
    if k in g:
        for c in range(2, ns.max_column + 1): gs.cell(g[k], c).value = vals[c - 1]
    else:
        append(gs, vals); done.append(f'Settings + {k}')

# ---------- Routes: Frankfurt ----------
gr, nr = game['Routes'], v65['Routes']
gi, ni = rows_by_id(gr), rows_by_id(nr)
for h in ('distanceKm', 'baseFare', 'demandAtFare (fare:people)', 'story'):
    gr.cell(gi['fra'], col(gr, h)).value = nr.cell(ni['fra'], col(nr, h)).value
# v6.5 keeps the old fareOptions (100-140 in £5 steps), which have no demand figures now; the fares are the demand row's
gr.cell(gi['fra'], col(gr, 'fareOptions')).value = '|'.join(x.split(':')[0] for x in str(nr.cell(ni['fra'], col(nr, 'demandAtFare (fare:people)')).value).split('|'))
done.append('Routes ~ fra (distanceKm, baseFare, demandAtFare, story; fareOptions from the demand row)')

# ---------- Roadmap, PauseSchedule ----------
for sheet, key in (('Roadmap', 'Week 4'), ('PauseSchedule', 'P1')):
    g, n = game[sheet], v65[sheet]
    gk, nk = rows_by_id(g), rows_by_id(n)
    for h in header(n)[1:]:
        if h in header(g): g.cell(gk[key], col(g, h)).value = n.cell(nk[key], col(n, h)).value
    done.append(f'{sheet} ~ {key}')

# ---------- README ----------
rd = game['README']
have = {str(rd.cell(r, 1).value or '') for r in range(1, rd.max_row + 1)}
for r in range(1, v65['README'].max_row + 1):
    v = v65['README'].cell(r, 1).value
    if isinstance(v, str) and v.startswith('v6.5') and v not in have: append(rd, [v]); done.append('README + v6.5')
mine = ('31 Oct 2026, evening (Claude Code, hand-off 2a and v6.5): taken from v6.5 the D111 Settings rows, the ladder, '
        'week speed, weekOneAfterLaunch, midweekQuestions, Frankfurt (Routes fra), Roadmap week 4 and PauseSchedule P1. '
        "Kept the game's own rows v6.5 drops or holds older copies of (week1ExampleProfits, fuelDeskOpensDay, planCheckLookBelow, "
        'reviewExampleWeeks, snacksInYearOne, Chapters 1, Briefings, Mechanics, bustRule, standingAim). ScreenText: the Day page, '
        'the daily change, the Frankfurt card and the week 1 Sunday words (hand-off 2a).')
if mine not in have: append(rd, [mine]); done.append('README + Claude Code line')

# ---------- ScreenText (hand-off 2a) ----------
st = game['ScreenText']
sh = header(st)
SCREEN = [
  # Day page (2a section 1)
  ('day.title.launch', 'Launch Day: how it went'),
  ('day.title', '{date}: how it went'),
  ('day.sub', 'Day {n} of week 1 · every flight landed'),
  ('day.profit', 'Profit today'),
  ('day.yesterday', 'Yesterday **{money}** · {change}'),
  ('day.first', 'Your first day of flying.'),
  ('day.routes', 'Route by route'),
  ('day.cols', 'Route|Wanted|Seats|Flew|Couldn\'t carry'),
  ('day.more', 'More detail ›'),
  ('day.tomorrow', 'Tomorrow, {date}'),
  ('day.same', 'Same flights, same fares as today.'),
  ('day.changed', 'Your changed plan.'),
  ('day.footer', 'Keep the plan for tomorrow, or change it.'),
  ('day.footer.sun', 'Keep the plan for Sunday, or change it. After Sunday, the week\'s accounts.'),
  ('day.keep', 'Keep for tomorrow ▶'),
  ('day.change', 'Change my plan'),
  ('day.anyway', 'Fly anyway ▶'),
  ('day.drawer', 'Launch Day results|Costs today|Feedback|✕ Close'),
  # reading the day (2a section 1a): loss first, then empty seats, then idle plane, then full planes
  ('read.loss', 'Today lost **{money}**. Change something before tomorrow.'),
  ('read.empty', 'At **{fare}**, **{n} seats** flew empty on {route}. You took **{money} less** than at {lower}.'),
  ('read.plain', 'Every flight landed: **{pax} of {seats}** seats filled.'),
  ('read.idle', 'Your plane is on the ground from **{time}**. There\'s room for another flight.'),
  ('read.full', 'Full on every flight, and **{n} people** couldn\'t get a seat. Try **£10 more** on {route} tomorrow?'),
  ('read.good', 'Full planes at good fares. People turned away are a chance for later, when you have more seats.'),
  ('read.weekend', '{day}s are quieter.'),
  # the daily change (2a section 2)
  ('chg.fly', 'Fly tomorrow ▶'),
  ('chg.watch', 'Watch: Finance works out the fare difference: **With your change**, press **−**, **Now**, then Enter.'),
  ('chg.build', 'Click **With your change**, press **−**, click **Now**. Then press Enter. The sheet works it out.'),
  ('chg.week', 'Ticket revenue over a week: the difference|The difference a day, times 7. Work it out in your book. Write SUM {n} beside it. Then type your answer in {cell} and press Enter.'),
  ('chg.weekrow', 'Ticket revenue over a week (× 7)'),
  ('chg.weekf', 'Difference a day × 7'),
  # Frankfurt (2a section 3)
  ('fra.eyebrow', 'NEW ROUTE · TOMORROW'),
  ('fra.title', '{city} opens tomorrow'),
  ('fra.line', 'Further away, so a flight takes longer. People pay more to get there.'),
  ('fra.go', 'Plan tomorrow ▶'),
  ('fra.footer', 'A new route opens tomorrow: {date}.'),
  ('fra.board', '{city} · NEW · FROM TOMORROW'),
  ('fra.fits', '✓ Fits · leaves {dep}, back {back}'),
  ('fra.nofit', '! Doesn\'t fit today: it would be back at {back}, after the day ends at {end}'),
  ('fra.round', '{time} there and back'),
  ('tt.cannot', '! Doesn\'t fit today: it would be back at {back}, after the day ends at {close}'),
  # Launch Day profit (2a section 4)
  ('ld.profit.watch', 'Watch: Finance clicks **Total revenue**, presses **−**, clicks **Total costs**, then presses **Enter**.'),
  ('ld.profit.footer', 'Launch Day · watch Finance work out the profit.'),
  ('sum.next', 'Next sum ▸'),
  # week 1 Sunday (2a section 5)
  ('wk1.example', 'FINANCE\'S EXAMPLE · MADE-UP NUMBERS'),
  ('wk1.yours', 'YOUR WEEK'),
  ('wk1.watch', 'Watch: calculate the total profit from Monday to Wednesday'),
  ('wk1.turn', 'Your turn: calculate the profit for the whole week, Monday to Sunday|Press Σ SUM, drag down your Profit column from Monday to Sunday, then press Enter. Nothing to write in your book.'),
  ('wk1.letgo', 'Let go on Sunday ({cell}), then press Enter.'),
  # Ready page (2a section 7)
  ('ready.todo', 'Check the plan. Press **{button}** when it is right.'),
  # Weeks 2-4 plan: the comparison sheet (2a section 6)
  ('cmp.title', 'Week {n} plan: what changed from last week'),
  ('cmp.tab', 'Week {n}'),
  ('cmp.cols', 'Week {last}, a weekday|Last week|Week {n} plan|This week|this week − last week|Difference'),
  ('cmp.rows', 'Passengers a day|Ticket revenue a day|Fuel burned a day|Total costs a day|Profit a day'),
  ('cmp.line', 'Finance filled in this week from your plan. Profit a day: **{diff}** than last week.'),
  ('cmp.footer', 'Week {n} plan · Finance compared it with last week.'),
]
have = rows_by_id(st)
WHERE = {'day': 'Day page (week 1)', 'read': 'Day page: reading the day', 'chg': 'Daily change: the Changes sheet', 'fra': 'Frankfurt: card and timetable',
         'ld': 'Launch Day sheet', 'sum': 'Every sheet: the done line', 'wk1': 'Week 1 Sunday review', 'ready': 'Ready for launch', 'tt': 'Timetable: a flight that does not fit', 'cmp': 'Weeks 2-4 plan: the comparison sheet'}
for k, v in SCREEN:
    vals = [None] * len(sh)
    vals[sh.index('id')], vals[sh.index('screen')], vals[sh.index('text')] = k, WHERE[k.split('.')[0]], v
    vals[sh.index('notes')] = 'Hand-off 2a (31 Oct 2026)'
    if k in have: put(st.cell(have[k], sh.index('text') + 1), v)
    else: append(st, vals); done.append(f'ScreenText + {k}')

# the week 1 Sunday example becomes Finance's Σ SUM on Monday to Wednesday (2a, section 5): whole rows
FULL = [
  ('review.example.watch', 'EXAMPLE · WATCH', 'Watch: calculate the total profit from Monday to Wednesday', 'Finance presses **Σ SUM**, drags down the Profit column from Monday to Wednesday, then presses [Enter]. The sheet adds them up.', None),
  ('review.example.done', 'EXAMPLE · WATCH', "That's how Σ SUM works", 'Press **Σ SUM**, drag down a column, then press [Enter]: the sheet adds every cell you dragged over.|**Your turn: the profit for the whole week, Monday to Sunday.**', 'My turn ▶'),
  ('review.example.line', None, None, 'Watch: Finance presses Σ SUM and drags from Monday to Wednesday.', None),
  ('review.example.label', "FINANCE'S EXAMPLE · MADE-UP NUMBERS", None, None, None),
  ('review.sum.signal3', None, 'Your turn: calculate the profit for the whole week, {first} to {last}', 'Press **Σ SUM**, drag down your Profit column from {first} to {last}, then press [Enter].|The sheet adds the whole column.', None),
]
have = rows_by_id(st)
for k, eb, ti, tx, bt in FULL:
    if k not in have: continue
    for h, v in (('eyebrow', eb), ('title', ti), ('text', tx), ('button', bt)):
        if v is not None: put(st.cell(have[k], sh.index(h) + 1), v)
    st.cell(have[k], sh.index('notes') + 1).value = 'Hand-off 2a (31 Oct 2026): Finance shows Σ SUM on the example; he uses it on his week'
done.append('ScreenText ~ the week 1 example (Σ SUM)')

game.save(BOOK)
print('\n'.join(done) or 'nothing to do')
