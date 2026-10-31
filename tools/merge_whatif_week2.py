#!/usr/bin/env python3
"""Bertie, 31 Oct 2026 (evening, after the chapter-one plan to week 8; no hand-off): the what-if fare sheet moves to week 2.

Week 1 is now a whole week of settling the plan (D111), so week 2 can be the what-if week: the sheet opens on day 8 with
fares that move £1 at a time (£90 -> £93, not just the nearest £5), and shows what a few pounds do over a day, a week and
a month. The Fuel desk stays in week 3 (day 15). Nothing visual is new: the screens are moved around and the data put
right. Also the three Market headlines that were out of date after the week shift (weeks 2, 3 and 8).

This script edits the game's workbook in place (data/Airline-World-Workbook.xlsx), so Bertie's rule holds: the game always
runs from the workbook. Fable can change any figure here (whatIfFareStep, whatIfQuestionStep, whatIfMonthDays, the
words) and re-import.

Usage: python3 tools/merge_whatif_week2.py   (then python3 tools/import_world.py and python3 src/opening/build.py)
Running it again changes nothing more.
"""
from copy import copy
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / 'data' / 'Airline-World-Workbook.xlsx'
game = openpyxl.load_workbook(BOOK)
done = []
WHEN = 'Bertie 31 Oct 2026 (evening): the what-if fare sheet in week 2'

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
def put(cell, v):                 # text that starts with '=' is words, not an Excel formula
    cell.value = v
    if isinstance(v, str) and v.startswith('='): cell.data_type = 's'
def append(ws, values):
    at = last_row(ws); style_from(ws, at, at + 1)
    for j, v in enumerate(values, start=1): put(ws.cell(at + 1, j), v)
def col(ws, name): return header(ws).index(name) + 1
def set_cell(ws, row, name, v, tag):
    c = ws.cell(row, col(ws, name))
    if c.value != v: put(c, v); done.append(tag)

# ---------- Settings ----------
gs = game['Settings']; g = rows_by_id(gs)
SETTINGS = [
  ('whatIfSheetFromDay', 8, 'Bertie 31 Oct (evening): the what-if fare sheet opens at the start of week 2, after a whole week of settling the plan (was 15, D110). The Fuel desk stays at week 3 (fuelDeskFromDay).'),
  ('whatIfFareStep', 1, 'Bertie 31 Oct (evening): on the what-if sheet a fare moves £1 at a time with − and +, between the route\'s lowest and highest fare option, so he sees what a few pounds do (£90 -> £93). Demand between two fares in the table is in proportion (tableAt). Everywhere else fares stay on the route\'s fare options. For Fable to confirm.'),
  ('whatIfQuestionStep', 3, 'Bertie 31 Oct (evening): the what-if sheet\'s first counted question (P1) tries his fare plus this (£90 -> £93) on his busiest route; if that is above the top fare option, his fare minus it. For Fable to confirm.'),
  ('whatIfMonthDays', 28, 'Bertie 31 Oct (evening): a month on the what-if sheet is four weeks: a day × 7 = a week, a week × 4 = a month (28 days), so the sums stay whole. For Fable to confirm (a calendar month would be 30).'),
]
for k, v, note in SETTINGS:
    if k in g:
        set_cell(gs, g[k], 'Value', v, f'Settings ~ {k}'); set_cell(gs, g[k], 'Notes', note, f'Settings ~ {k} (notes)'); set_cell(gs, g[k], 'Status', 'live', f'Settings ~ {k} (status)')
    else: append(gs, [k, v, note, 'live']); done.append(f'Settings + {k}')

# ---------- Calendar: days 8 and 15 ----------
cal = game['Calendar']; cr = rows_by_id(cal)
CAL = {
  '8': { 'title': 'Week 2: the what-if fare sheet',
         'headline 1': 'Your plan from week one flies again this week. First, try a fare a few pounds up or down on the what-if sheet: a day, a week, a month.',
         'unlocks': 'mechanics: what-if fare sheet (fares £1 at a time; a day, a week, a month); no new desk this week',
         'gatedCalc': 'whatIfFirst,whatIfWeek' },
  '15': { 'title': 'Week 3: the Fuel desk',
          'headline 1': 'Week 3 starts. The Fuel desk is open: buy fuel ahead, before the price moves.',
          'unlocks': 'mechanics: two timetables, assignment; second plane shop from day 22; FUEL DESK opens: visual introduction, the order without a sum',
          'gatedCalc': 'modelChange,reviewRotation' },
}
for d, vals in CAL.items():
    for h, v in vals.items(): set_cell(cal, cr[d], h, v, f'Calendar ~ day {d} {h}')

# ---------- Roadmap: a week 2 row; week 3 is the Fuel desk ----------
rm = game['Roadmap']; rk = rows_by_id(rm)
if 'Week 2' not in rk:
    rm.insert_rows(rk['Week 3']); style_from(rm, rk['Week 3'] + 1, rk['Week 3'])
    for j, v in enumerate(['Week 2', 'The what-if fare sheet: a few pounds on a fare, over a day, a week and a month', 'day 8', 'live'], start=1): put(rm.cell(rk['Week 3'], j), v)
    done.append('Roadmap + Week 2'); rk = rows_by_id(rm)
set_cell(rm, rk['Week 3'], 'now / next / later line', 'The Fuel desk: buy fuel ahead', 'Roadmap ~ Week 3')

# ---------- PauseSchedule: the what-if questions at P1; modelling and the first rotating question at P2 ----------
ps = game['PauseSchedule']; pk = rows_by_id(ps)
PS = {
  'P1': { 'question 1': 'What-if fare sheet: first sum (seats filled × fare, at his fare + £3 on his busiest route: £90 -> £93) (counted)',
          'question 2': 'What-if: a week (more ticket money a day × 7) (counted); the sheet shows the month (ƒ)',
          'notes': 'Bertie 31 Oct (evening): the what-if sheet opens day 8, after a whole week of settling the plan. If he changed his plan on Monday, its own sums take the slots first (countingPriority). Week 2 flies on his plan. No fuel sum before the Fuel desk (week 3)' },
  'P2': { 'question 1': 'Modelling: his fare against the next fare that earns more on his own flights (one flight, a day, a week), if his plan leaves money on the table; otherwise two suggested changes',
          'question 2': 'Rotating review question (first)',
          'notes': 'Fuel desk opens day 15 (the order has no sum). The what-if sheet moved to P1 (Bertie 31 Oct evening); the first rotating question moved up from P3 to keep two questions here' },
  'P3': { 'question 2': 'Rotating review question' },
}
for p, vals in PS.items():
    for h, v in vals.items(): set_cell(ps, pk[p], h, v, f'PauseSchedule ~ {p} {h}')

# ---------- Market: the headlines that were out of date after the week shift ----------
mk = game['Market']; mkr = rows_by_id(mk)
MARKET = { '2': 'A quiet week: your plan flies again. Try a fare on the what-if sheet. Red Kite flies from Luton.',
           '3': 'The Fuel desk opens: buy fuel ahead.',
           '8': 'Fuel back down to £2.43.' }
for w, v in MARKET.items(): set_cell(mk, mkr[w], 'headline', v, f'Market ~ week {w} headline')

# ---------- ScreenText ----------
st = game['ScreenText']; sh = header(st)
TEXT = [
  # (id, screen, eyebrow, title, text, button, notes)
  ('whatif.first', 'What-if fare sheet: the first visit\'s Sheet Callout (under the sheet, pointer up at the fares)', 'NEW · WHAT IF', 'Try a fare before you set it',
   'Press **−** or **+** on a fare: £1 at a time. Who wants to fly, seats filled, ticket revenue and profit all work themselves out (ƒ), for a day, a week and a month. Nothing to write in your book. When you like what you see, press **Set my fares**.', 'Got it', 'Once. ' + WHEN),
  ('whatif.rows', 'What-if fare sheet: the total rows (a day | a week | a month)', None, None, 'Both routes, a day|All routes, a day|A week (× 7)|A month (× {w} weeks)', None, WHEN),
  ('whatif.more', 'What-if fare sheet: What changed, the line under each route and the total', None, None, '{d} a day · {w} a week · {m} a month', None, WHEN + '. {d}, {w}, {m} are "£114 more" or "£57 less"'),
  ('pauseq.whatIfFirst', 'P1: the what-if sheet\'s first sum (seats filled × fare)', 'NEW · WHAT IF', 'What if {city} were {fare}?',
   'The **What if** sheet opens today, in the Studio: change a fare £1 at a time and every figure on its row works itself out (ƒ).|Its first sum by hand: {city} at **{fare}** instead of {now}. Ticket revenue a day = seats filled × fare.', None, 'PauseSchedule P1, question 1 (was P2). ' + WHEN),
  ('pauseq.whatIfWeek', 'P1: the what-if sheet\'s second sum (more a day × 7)', 'WHAT IF · A WEEK', '{fare} instead of {now}: what is that worth in a week?',
   'At **{fare}**, {city} takes in **{more} more a day** than at {now}: the sheet worked it out (ƒ).|A week = more a day × 7. Then see what a month comes to on the What if sheet.', None, 'PauseSchedule P1, question 2. ' + WHEN),
]
have = rows_by_id(st)
for k, screen, eb, ti, tx, bt, note in TEXT:
    if k in have:
        for h, v in (('screen', screen), ('eyebrow', eb), ('title', ti), ('text', tx), ('button', bt), ('notes', note)):
            if v is not None: set_cell(st, have[k], h, v, f'ScreenText ~ {k}')
    else:
        vals = [None] * len(sh)
        for h, v in (('id', k), ('screen', screen), ('eyebrow', eb), ('title', ti), ('text', tx), ('button', bt), ('notes', note)): vals[sh.index(h)] = v
        append(st, vals); done.append(f'ScreenText + {k}')

# ---------- README ----------
rd = game['README']
have = {str(rd.cell(r, 1).value or '') for r in range(1, rd.max_row + 1)}
mine = ('31 Oct 2026, evening (Claude Code, Bertie\'s change after the chapter-one plan to week 8): the what-if fare sheet moves to week 2 '
        '(whatIfSheetFromDay 8) with fares £1 at a time (whatIfFareStep), a day, a week and a month (whatIfMonthDays 28); its two counted '
        'questions at P1 (seats filled × fare at his fare + whatIfQuestionStep; more a day × 7). The Fuel desk stays at week 3. Calendar days '
        '8 and 15, Roadmap week 2 and 3, PauseSchedule P1-P3, ScreenText whatif.* and pauseq.whatIf*. Market headlines for weeks 2, 3 and 8 '
        'put right after the week shift. Script: tools/merge_whatif_week2.py.')
if mine not in have: append(rd, [mine]); done.append('README + Claude Code line')

game.save(BOOK)
print('\n'.join(dict.fromkeys(done)) or 'nothing to do')
