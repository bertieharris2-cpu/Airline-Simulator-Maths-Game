#!/usr/bin/env python3
"""Merge Fable's workbook v6.3 (30 Oct 2026, after the 19:15 play-test) into the game's workbook, with hand-off 3.

v6.3 was made from Fable's own copy, as v6.2 was: it has no SheetSums, ScreenText or BriefingData sheet, and its copies of
rows Claude Code has changed since (Chapters 1 with snacks, the old briefing beats, older Settings notes, the mystery shopper's
snack option) are older than the game's. So this script starts from data/Airline-World-Workbook.xlsx and takes only what v6.3
changes for the 19:15 play-test:

  * Settings: launchDaySums, launchDayFares, launchDayComparison and modellingQuestion as v6.3 has them, and its five new rows
    (weekOneAfterLaunch, planCheckBeforeRun, tipsOnlyActionable, studioExtrasFrom, chapterPage).
  * PauseSchedule: the Launch Day and P1 rows. Calendar: days 1 and 2. README: v6.3's line.
  * Hand-off 3 (the game's own sheets): the Launch Day rows of SheetSums (B4 demonstrated, C4 a formula he builds, D4 on paper,
    Sum 1, E4 and the plan's column filled at the end; One flight, two ways retired), and the screens' words in ScreenText
    (the job first, the demonstration, HOW A FORMULA WORKS, the build and paper signals, WHY 27?, the results, the plan check
    and the week flying). Settings planCheckLookBelow (what "needs a look" means).

Usage: python3 tools/merge_v63.py <Airline-World-Workbook-v6.3.xlsx>   (then python3 tools/import_world.py)
"""
import sys
from copy import copy
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / 'data' / 'Airline-World-Workbook.xlsx'
if len(sys.argv) != 2: sys.exit(__doc__)
game = openpyxl.load_workbook(BOOK)
v63 = openpyxl.load_workbook(sys.argv[1])
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

# ---------- Settings ----------
gs, ns = game['Settings'], v63['Settings']
gid, nid = rows_by_id(gs), rows_by_id(ns)
for k in ('launchDaySums', 'launchDayFares', 'launchDayComparison', 'modellingQuestion'):
    for c in (2, 3): gs.cell(gid[k], c).value = ns.cell(nid[k], c).value
    done.append(f'Settings ~ {k} (v6.3)')
for k in ('weekOneAfterLaunch', 'planCheckBeforeRun', 'tipsOnlyActionable', 'studioExtrasFrom', 'chapterPage'):
    if k in rows_by_id(gs): continue
    insert_after(gs, table_end(gs, 4), [ns.cell(nid[k], c).value for c in range(1, 5)]); done.append(f'Settings + {k}')
def set_row(key, value, note, status='live'):
    g = rows_by_id(gs)
    if key in g: r = g[key]; gs.cell(r, 2).value, gs.cell(r, 3).value, gs.cell(r, 4).value = value, note, status
    else: insert_after(gs, table_end(gs, 4), [key, value, note, status])
    done.append(f'Settings = {key}')
set_row('planCheckLookBelow', 0, 'Hand-off 3 (30 Oct 2026), section 4: on the plan check before week one flies, a flight "needs a look" when its '
        'profit on its last day was below this (£). Initially £0: a flight that lost money. planCheckBeforeRun (v6.3) adds the gain gate later.')
# the conflicts, kept as v6.3 has them and noted (hand-off 3 wins where Bertie decided; flagged in the report)
g = rows_by_id(gs)
def add_note(key, text):   # once: running the script again leaves the note as it is
    c = gs.cell(g[key], 3); old = str(c.value or '')
    if text.strip() not in old: c.value = old + text
add_note('studioExtrasFrom', ' Claude Code, 30 Oct 2026: hand-off 3 '
        '(Bertie\'s quick decisions) hides View trade-offs and ƒ work it out for ALL of chapter one; the game follows the hand-off. Flagged.')
add_note('weekOneAfterLaunch', ' Claude Code, 30 Oct 2026: hand-off 3 '
        'section 6 says everything after week 1 moves along a week, with Fable updating the start weeks; until then the game keeps these timings. Flagged.')
add_note('launchDayFares', ' Claude Code, 30 Oct 2026: hand-off 3 '
        'section 1 works the three Dublin columns left to right, as the sheet shows them (fare below his, his fare, fare above): B '
        'demonstrated, C he builds, D on paper. With his fare at £80 that is £70, £80, £90 (the paper sum at £90).')

# ---------- PauseSchedule, Calendar ----------
for name, keys in (('PauseSchedule', ('Launch Day', 'P1')), ('Calendar', ('1', '2'))):
    g_, n_ = game[name], v63[name]
    gh_, nh_ = header(g_), header(n_)
    gi_, ni_ = rows_by_id(g_), rows_by_id(n_)
    for k in keys:
        for j, h in enumerate(nh_, start=1):
            if h not in gh_ or k not in gi_ or k not in ni_: continue
            a, b = g_.cell(gi_[k], gh_.index(h) + 1), n_.cell(ni_[k], j)
            if a.value != b.value: put(a, b.value); done.append(f'{name} ~ {k} {h}')

# ---------- README ----------
gr, nr = game['README'], v63['README']
have = {str(gr.cell(r, 1).value) for r in range(1, gr.max_row + 1)}
for r in range(1, nr.max_row + 1):
    v = nr.cell(r, 1).value
    if v and str(v).startswith('v6.3') and str(v) not in have:
        n = gr.max_row + 1; gr.cell(n, 1).value = v; style_from(gr, n - 1, n); done.append('README + ' + str(v)[:40])
line = ('30 Oct 2026, evening (Claude Code, hand-off 3 and v6.3): v6.3 merged with tools/merge_v63.py. Kept: SheetSums, ScreenText, '
        'BriefingData and the game\'s own rows. Launch Day: B4 demonstrated, C4 a formula he builds, D4 on paper (Sum 1); Paris and the '
        'plan fill in at the end; One flight, two ways retired. ScreenText gains the job first, the demonstration, HOW A FORMULA WORKS, '
        'WHY 27?, the Launch Day results, the plan check and the week flying.')
if line not in have:
    n = gr.max_row + 1; gr.cell(n, 1).value = line; style_from(gr, n - 1, n); done.append('README + hand-off 3')

# ---------- SheetSums (hand-off 3, section 1) ----------
ss = game['SheetSums']; sh = header(ss); C = lambda n: sh.index(n) + 1
def ss_row(cell):
    for r in range(2, ss.max_row + 1):
        if ss.cell(r, C('sheet')).value == 'Launch Day' and str(ss.cell(r, C('cell')).value) == cell: return r
for cell, vals in {
    'B4': {'whose': 'ƒ', 'how': 'demo', 'sumNo (week 1, Steady)': '—', 'sumId': 'launch.demo',
           'notes': 'Hand-off 3 (30 Oct 2026, evening): the fare below his. Finance DEMONSTRATES building the formula: a pointer clicks B2, the × key, B3, then Enter; HOW A FORMULA WORKS explains. Not counted.'},
    'C4': {'whose': 'pupil', 'how': 'formula', 'sumNo (week 1, Steady)': '— (no Sum number)', 'sumId': 'launch.build',
           'notes': 'Hand-off 3: his fare. He builds the formula himself (the keys or the keyboard), then presses Enter; the sheet works it out. Formula-only: not counted.'},
    'D4': {'whose': 'pupil', 'how': 'book', 'sumNo (week 1, Steady)': 1, 'sumId': 'launch.tickets',
           'notes': 'Hand-off 3: the fare above his, on paper (Sum 1, the one counted question on Launch Day). The hint uses the class method: "£90 is 9 × 10. First work out 19 × 9, then multiply by 10."'},
    'E4': {'notes': 'Hand-off 3: Paris fills itself (ƒ) only when his three Dublin sums are done; E4 lights green once.'},
    'F9': {'notes': 'Hand-off 3: the plan\'s column (Total revenue, Total costs, Profit) fills itself (ƒ) at the end, with Paris; F9 lights green once.'},
}.items():
    r = ss_row(cell)
    if not r: continue
    for k, v in vals.items(): put(ss.cell(r, C(k)), v)
    done.append(f'SheetSums ~ Launch Day {cell}')
for cell in ('B13', 'C13'):
    r = ss_row(cell)
    if r and 'One flight' in str(ss.cell(r, C('row')).value):
        ss.cell(r, C('status')).value = 'retired (hand-off 3, 30 Oct: One flight, two ways removed from Launch Day; v6.3 modellingQuestion)'; done.append(f'SheetSums retired {cell}')

# ---------- ScreenText (hand-off 3) ----------
st_ = game['ScreenText']
T = [
 ('launch.title', 'Launch Day sheet: the title', '', 'Ticket revenue for each flight, at each fare', '', '', 'Hand-off 3 section 1 (as built 30 Oct).'),
 ('launch.colhead', 'Route columns: the top line (whose flights it counts)', '', '', 'your {n} flights|your flight', '', 'Hand-off 3 section 2: the plural, then the single; the main line is "{route} at £{fare}".'),
 ('launch.job', 'Launch Day: the job first (Sheet Callout under row 4, pointer up at B4)', 'LAUNCH DAY · YOUR JOB', 'Work out the ticket revenue for each flight, at each fare',
  'Ticket revenue is the money from selling the tickets: **passengers × fare**. Finance will show you how to build it on the sheet first.', 'Watch ▶', 'Hand-off 3 section 1, step 1. Nothing starts until he presses Watch.'),
 ('launch.job.footer', 'Launch Day: the footer at the job first', '', '', 'Launch Day · read the job first.', '', 'Next ▶ disabled.'),
 ('launch.demo', 'Launch Day: the lines under the grid while Finance demonstrates', '', '', 'Watch: Finance clicks the passengers, **{p}**, then presses **×**.|Watch: then the fare, **{f}**, and Finance presses **Enter**.', '', 'Steps 2–3: about 0.8 s a step; under reduced motion each step appears in turn.'),
 ('launch.demo.footer', 'Launch Day: the footer during the demonstration', '', '', 'Launch Day · watch Finance build the first formula.', '', ''),
 ('launch.how', 'Launch Day: HOW A FORMULA WORKS (Sheet Callout under the block, pointer up at B4)', 'HOW A FORMULA WORKS', 'Finance built a formula',
  '**= {a} × {b}** means **passengers × fare**. Each cell gets its own colour, so you can see which cell is which.|Pressing **Enter** tells the sheet to work it out. The sheet did the multiplying: **{money}**.', 'Your turn ▶', 'Step 4.'),
 ('launch.how.footer', 'Launch Day: the footer at HOW A FORMULA WORKS', '', '', 'Launch Day · Finance built the first formula.', '', ''),
 ('launch.build', 'Launch Day: the build signal under C4', '', '{route} at £{fare}: the ticket revenue', 'Click the passengers, press **×**, click the fare. Then press [Enter].|The sheet works it out.|Nothing to write in your book.', '', 'Step 5. Formula-only: not counted.'),
 ('launch.build.line', 'Launch Day: the line while he builds', '', '', 'Your turn: build it, then press Enter.', '', 'With Give me a hint.'),
 ('launch.build.footer', 'Launch Day: the footer while he builds', '', '', 'Launch Day · your turn: build it.', '', ''),
 ('launch.paper.footer', 'Launch Day: the footer at the paper sum', '', '', 'Launch Day · the last one, on paper.', '', 'Step 6.'),
 ('launch.paper.hint', 'Launch Day: the paper sum\'s first hint (the class method)', '', '', '£{fare} is {d} × {mult}. First work out {p} × {d}, then multiply by {mult}.', '', 'Never "take the 0 off" or "put the 0 back".'),
 ('launch.done', 'Launch Day: the line when every sum is done', '', '', '✓ Every Launch Day sum is done. Finance filled in {others} and your plan: profit **{profit}** a day.', '', 'Step 7. E4 and F9 light green once.'),
 ('launch.done.footer', 'Launch Day: the footer when every sum is done', '', '', 'Launch Day · done. Next, get ready to fly.', 'Ready to fly ▶', ''),
 ('why27', 'WHY 27?: the first column with fewer passengers than people who want to fly at that fare (Sheet Callout, the passengers cell ringed)', 'WHY {pax}?', '{pax} of the {want} can catch your flights',
  '{want} people a day want to fly to {route} at £{fare}. {pax} of them want to go when your {times} leaves. The other {rest} want a time you don\'t fly.', 'Got it', 'Hand-off 3 section 2. Once.'),
 ('why27.line', 'WHY 27?: the line under the grid', '', '', 'Read the note, then press Got it.', '', ''),
 ('ld.results', 'After Launch Day: the results page', 'NEXT', 'Launch Day: how it went', '{date} · every flight landed|Your plan flies again **every day, Tuesday to Sunday**. First, a quick check of the plan. On Sunday you\'ll do the week\'s accounts.', 'Check my plan for the week ▶', 'Hand-off 3 section 4, step 1. No Home, no Close the day.'),
 ('ld.results.footer', 'After Launch Day: the results page footer', '', '', 'Launch Day is done.', '', ''),
 ('plancheck', 'The plan check before week one flies', '', 'Your plan for the rest of week 1', '{from} to {to} · the same flights every day', 'Fly Tuesday to Sunday ▶', 'Step 2.'),
 ('plancheck.flights', 'The plan check: the left panel', '', 'Your flights, every day', '{plane} · seats filled on Launch Day', '', ''),
 ('plancheck.checks', 'The plan check: the right panel and its lines', '', 'Before it flies',
  'Every flight fits in the day, {open} to {close}.|Every flight made money on Launch Day.|Seats filled: **{sold} of {seats}**.|**{n} people a day** wanted seats you didn\'t have ({list}). A chance for later, when you have more seats.', '', 'green ✓ lines, then the cyan ● chance.'),
 ('plancheck.look', 'The plan check: a flight that needs a look', '', '', '**{route} {time}** lost money on Launch Day: {sold} of {seats} seats at £{fare}. Change it before the week flies?', 'Fly it anyway ▶', 'Step 3. Settings planCheckLookBelow.'),
 ('plancheck.under', 'The plan check: the line under the panels', '', '', 'Nothing to work out: Finance keeps the sheet up to date each day. **Change my plan** opens the timetable; **Fly Tuesday to Sunday** runs the week.', 'Change my plan', ''),
 ('plancheck.footer', 'The plan check: the footer', '', '', 'Check your plan, then fly the rest of the week.', '', ''),
 ('weekflies', 'The week flies (Tuesday to Sunday)', '', 'Week 1 is flying', 'Your plan, every day, Tuesday to Sunday. Sunday: the week\'s accounts.', 'Skip to Sunday ⏭', 'Step 4.'),
 ('weekflies.sofar', 'The week flies: the So far this week panel', '', 'So far this week', 'Profit, {days}|Seats filled|People who wanted seats you didn\'t have', '', ''),
 ('weekflies.footer', 'The week flies: the footer', '', '', 'The week runs on its own. Nothing to work out until Sunday.', '', ''),
 ('weekflies.tile', 'The week flies: the words on the day tiles and the speed buttons', '', '', '✓ flown|profit|flying now · {time}|{n} of {total} flights out|waiting|Normal|Fast|Live Operations', '', 'Claude Code, 30 Oct (the words in picture 04-after-launch-day-4).'),
 ('plancheck.changed', 'The plan check after he changes the plan (Change my plan, then back): the flights are the plan\'s, not Launch Day\'s', '', '', '{plane} · seats your plan should fill|Every flight should make money on your plan.|**{route} {time}** is set to lose money: about {sold} of {seats} seats at £{fare}. Change it before the week flies?|Seats your plan should fill: **{sold} of {seats}**.', '', 'Claude Code, 30 Oct (not in hand-off 3: what the check says once the plan has changed).'),
 ('plancheck.nofit', 'The plan check: a plane whose day runs past closing', '', '', 'A flight on **{plane}** runs past {close}. Change your plan so every flight fits in the day.', '', 'Claude Code, 30 Oct (the amber line when "every flight fits" is not true).'),
]
sh_ = header(st_)
for vals in T:
    ti = rows_by_id(st_)
    if vals[0] in ti:
        for j, v in enumerate(vals, start=1): put(st_.cell(ti[vals[0]], j), v)
    else:
        last = max(r for k, r in ti.items() if ' ' not in k)
        insert_after(st_, last, list(vals))
done.append(f'ScreenText: {len(T)} rows (hand-off 3)')
ti = rows_by_id(st_)
for k in ('launch.watch', 'launch.watch.footer', 'launch.compare.head', 'launch.compare', 'launch.compare.footer'):
    if k in ti: st_.cell(ti[k], sh_.index('notes') + 1).value = 'Retired (hand-off 3, 30 Oct 2026, evening): the watch panel and One flight, two ways are gone from Launch Day.'
done.append('ScreenText: launch.watch and launch.compare rows retired')

game.save(BOOK)
print('\n'.join(done))
print(f'{len(done)} changes; saved {BOOK}')
