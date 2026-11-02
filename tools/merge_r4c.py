#!/usr/bin/env python3
"""Round 4c (the quick fixes from the 2 Nov review). Run after tools/merge_r4b.py.

ScreenText for the week-2 what-if callouts when he tries a LOWER fare (the game said "more" for a lower fare too), and for the
month line when the money goes the other way from the fare (a lower fare can fill more seats).
Everything is a PLACEHOLDER (docs/Placeholders-for-Fable.md). Usage: python3 tools/merge_r4c.py, then tools/import_world.py
and src/opening/build.py.
"""
from copy import copy
from pathlib import Path
import openpyxl
def header(ws): return [c.value for c in ws[1]]
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
def append(ws, values):
    at = last_row(ws)
    for c in range(1, ws.max_column + 1):
        s, d = ws.cell(at, c), ws.cell(at + 1, c)
        if s.has_style: d.font, d.fill, d.border, d.alignment, d.number_format = copy(s.font), copy(s.fill), copy(s.border), copy(s.alignment), s.number_format
    for j, v in enumerate(values, start=1): ws.cell(at + 1, j).value = v
ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / 'data' / 'Airline-World-Workbook.xlsx'
game = openpyxl.load_workbook(BOOK); done = []
NOTE = 'PLACEHOLDER (Claude Code, 2 Nov 2026, review quick fixes): Fable to check'

# (id, screen, eyebrow, title, text, button)
T = [
  ('wi2.co1.less', 'Week 2 what-if, callout 1 of 4, when he tries a lower fare', 'NEW · WHAT IF', 'What if {city} were £{step} less?', '', 'Got it'),
  ('wi2.co4.less', 'Week 2 what-if, callout 4 of 4: a lower fare that makes less money', 'A LITTLE ADDS UP', '£{step} less a ticket = {month} less a month', '', 'Got it'),
  ('wi2.co4.less.up', 'Week 2 what-if, callout 4 of 4: a lower fare that fills more seats and makes more money', 'A LITTLE ADDS UP', '£{step} less a ticket = {month} more a month', '', 'Got it'),
  ('wi2.co4.down', 'Week 2 what-if, callout 4 of 4: a higher fare that loses enough passengers to make less money', 'A LITTLE ADDS UP', '£{step} more a ticket = {month} less a month', '', 'Got it'),
]
st = game['ScreenText']; sh = header(st); have = rows_by_id(st)
for k, screen, eb, ti, tx, bt in T:
    vals = {'id':k, 'screen':screen, 'eyebrow':eb, 'title':ti, 'text':tx, 'button':bt}
    if k in have:
        r = have[k]
        for h, v in vals.items():
            c = st.cell(r, sh.index(h) + 1)
            if (c.value or '') != (v or ''): c.value = v; done.append('ScreenText ~ ' + k)
    else:
        vals['notes'] = NOTE; append(st, [vals.get(h) for h in sh]); done.append('ScreenText + ' + k)
rd = game['README']; have = {str(rd.cell(r, 1).value or '') for r in range(1, rd.max_row + 1)}
mine = "2 Nov 2026 (Claude Code, review quick fixes): ScreenText wi2.co1.less, wi2.co4.less, wi2.co4.less.up and wi2.co4.down: the what-if callouts for a lower fare, and the month line following the money. PLACEHOLDER for Fable."
if mine not in have: append(rd, [mine]); done.append('README + line')
game.save(BOOK); print('\n'.join(dict.fromkeys(done)) or 'nothing to do')
