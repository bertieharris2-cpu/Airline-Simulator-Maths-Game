#!/usr/bin/env python3
"""Round 4 (Bertie, 2 Nov 2026): consequences for coasting on one plan. Run after tools/merge_r3.py.

Settings: rivalIgnoreWeeks, rivalTakesShare, starsTurnedAwayNeedsSpare, boardGapShare, boardGapWeeks.
Words: rival.news, rival.week, board.note. Everything here is a PLACEHOLDER for Fable's pass (docs/Placeholders-for-Fable.md).
Usage: python3 tools/merge_r4.py   (then python3 tools/import_world.py and python3 src/opening/build.py)
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
NOTE = 'PLACEHOLDER (Claude Code, 2 Nov 2026, round 4): Fable to check'

S = [
  {'Key':'rivalIgnoreWeeks', 'Value':3, 'Notes':NOTE + '. Weeks a route that opened after Launch Day can go unflown, while one of his planes can reach it, before Red Kite takes it over (Bertie: "say, three weeks"). The old weekly drop for unflown routes carries on as before.', 'Status':'live'},
  {'Key':'rivalTakesShare', 'Value':0.33, 'Notes':NOTE + ". Share of that route's passengers Red Kite takes, for good, from the Monday after.", 'Status':'live'},
  {'Key':'starsTurnedAwayNeedsSpare', 'Value':'yes', 'Notes':NOTE + ". Chapter one: the stars' turned-away rule only counts in a week when his planes had time for one more flight of that route (Bertie: one small airline can't carry everyone). 'no' = the old rule.", 'Status':'live'},
  {'Key':'boardGapShare', 'Value':0.1, 'Notes':NOTE + ". The gap between his week's profit and the best plan with his planes, as a share of the best, that counts as large (the Board's note; also when the Sunday graph question appears).", 'Status':'live'},
  {'Key':'boardGapWeeks', 'Value':3, 'Notes':NOTE + ". Weeks running with a large gap before the Board's note opens Monday's plan. No fine in chapter one.", 'Status':'live'},
]
ws = game['Settings']; sh = header(ws); have = rows_by_id(ws)
for v in S:
    if v['Key'] in have:
        r = have[v['Key']]
        for h, x in v.items():
            c = ws.cell(r, sh.index(h) + 1)
            if c.value != x: c.value = x; done.append('Settings ~ ' + v['Key'])
    else: append(ws, [v.get(h) for h in sh]); done.append('Settings + ' + v['Key'])

T = [  # (id, screen, eyebrow, title, text, button)
  ('rival.news', 'Sunday review and the news: Red Kite takes a route he has ignored', None, None, 'Red Kite takes over {city} from Monday. About a third of its passengers will fly with them for good.', None),
  ('rival.week', "Monday's plan opener, This week: the week Red Kite takes a route", None, None, 'Red Kite has taken over {city}. About a third of its passengers now fly with them for good.', None),
  ('board.note', "Monday's plan opener: the Board's note after weeks with a large gap", None, 'A word from the Board', 'Last week your plan made {yours}. The best plan with your planes would have made {best}.|Making a profit is good. Shareholders want the most profit your planes can make.', 'Understood'),
]
st = game['ScreenText']; sh = header(st); have = rows_by_id(st)
for k, screen, eb, ti, tx, bt in T:
    vals = {'id':k, 'screen':screen, 'eyebrow':eb, 'title':ti, 'text':tx, 'button':bt}
    vals = {h:v for h, v in vals.items() if v is not None}
    if k in have:
        r = have[k]
        for h, v in vals.items():
            c = st.cell(r, sh.index(h) + 1)
            if (c.value or '') != (v or ''): c.value = v; done.append('ScreenText ~ ' + k)
        n = st.cell(r, sh.index('notes') + 1)
        if 'round 4' not in str(n.value or ''): n.value = (str(n.value) + ' · ' if n.value else '') + NOTE; done.append('ScreenText notes ~ ' + k)
    else:
        vals['notes'] = NOTE; append(st, [vals.get(h) for h in sh]); done.append('ScreenText + ' + k)
rd = game['README']; have = {str(rd.cell(r, 1).value or '') for r in range(1, rd.max_row + 1)}
mine = "2 Nov 2026 (Claude Code, round 4): the rival takes ignored routes, the careful turned-away stars rule, the Board's note; Settings rivalIgnoreWeeks, rivalTakesShare, starsTurnedAwayNeedsSpare, boardGapShare, boardGapWeeks; ScreenText rival.news, rival.week, board.note. All PLACEHOLDER for Fable. Script: tools/merge_r4.py (after merge_r3.py)."
if mine not in have: append(rd, [mine]); done.append('README + line')
game.save(BOOK); print('\n'.join(dict.fromkeys(done)) or 'nothing to do')
