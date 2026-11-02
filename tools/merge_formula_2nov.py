#!/usr/bin/env python3
"""Bertie, 2 Nov 2026: in chapter one, a sum too hard to work out by hand at Years 5–6 is a "Build the formula" question
(he clicks the cells and the operations; the sheet works it out, like a calculator paper): time to afford a plane
(÷ a four-digit number) and seats filled as a percentage. Run after tools/merge_decisions_2nov.py.
  Settings hardSumsAsFormula  yes   (Bertie's rule; 'no' puts them back on paper)
  ScreenText pauseq.formula         (PLACEHOLDER: the page's line under the title, and the sheet's 'A hundred' row)
Usage: python3 tools/merge_formula_2nov.py, then tools/import_world.py and src/opening/build.py.
"""
from copy import copy
from pathlib import Path
import openpyxl
ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / 'data' / 'Airline-World-Workbook.xlsx'
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
game = openpyxl.load_workbook(BOOK); done = []
ws = game['Settings']; sh = header(ws)
if 'hardSumsAsFormula' not in rows_by_id(ws):
    append(ws, [{'Key':'hardSumsAsFormula', 'Value':'yes', 'Status':'live',
                 'Notes':"Bertie, 2 Nov 2026: in chapter one, Finance's 'time to afford' (still to find ÷ profit a day: ÷ a four-digit number) and 'seats filled' (passengers ÷ seats × 100) are Build the formula questions: he clicks the cells and the operations and the sheet works it out, like a calculator paper. It's about learning what to do. Still counted as one of the pause's two. 'no' = worked on paper, as before."}.get(h) for h in sh]); done.append('Settings + hardSumsAsFormula')
st = game['ScreenText']; sh = header(st)
if 'pauseq.formula' not in rows_by_id(st):
    append(st, [{'id':'pauseq.formula', 'screen':"Finance's questions page, when the question is Build the formula (text: the line under the title | the sheet's row for × 100)",
                 'text':'Question {i} of {k} from Finance. Build the formula on the sheet.|A hundred (for a percentage)',
                 'notes':"PLACEHOLDER (Claude Code, 2 Nov 2026): made-up words for Bertie's formula sums (Settings hardSumsAsFormula). Fable to word."}.get(h) for h in sh]); done.append('ScreenText + pauseq.formula')
rd = game['README']
mine = ("2 Nov 2026 (Claude Code): Bertie: time to afford and seats filled (%) are Build the formula questions in chapter one "
        "(Settings hardSumsAsFormula yes; ScreenText pauseq.formula, placeholder words).")
if mine not in {str(rd.cell(r, 1).value or '') for r in range(1, rd.max_row + 1)}: append(rd, [mine]); done.append('README + line')
game.save(BOOK); print('\n'.join(done))
