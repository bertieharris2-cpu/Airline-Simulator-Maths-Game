#!/usr/bin/env python3
"""Bertie, 5 Nov 2026. Run after tools/merge_formula_2nov.py.
  1 · "we need to reknit all the separate parts of the game together" → one game file again (he chose this over keeping
      chapters 2-4 parked): Settings buildEndsAfterChapter 1 → 0, so the game no longer stops at the chapter-one review;
      ScreenText end.next loses "That part of the game is not built yet."
  2 · "the text on this is confusing" (the modelling question's box said "Dublin: £90 or £100? Write SUM n beside it"):
      ScreenText pauseq.modelChange.task, the box's task line (PLACEHOLDER words, after DESIGN.md rule 2's example).
Usage: python3 tools/merge_5nov.py, then tools/import_world.py and src/opening/build.py.
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

# 1 · one game file again
ws = game['Settings']; sh = header(ws); r = rows_by_id(ws)['buildEndsAfterChapter']
if ws.cell(r, sh.index('Value') + 1).value != 0:
    ws.cell(r, sh.index('Value') + 1).value = 0
    n = ws.cell(r, sh.index('Notes') + 1); n.value = (f"{n.value} · Bertie, 5 Nov 2026: 0 = the whole game in one file again (\"reknit all the separate parts of the game together\"): "
        "chapter one as it is now, then chapters 2-4 as they were on 30 Oct. 1 = the build stops at the chapter-one review again.")
    ws.cell(r, sh.index('Status') + 1).value = 'live'
    done.append('Settings ~ buildEndsAfterChapter 0')
st = game['ScreenText']; sh = header(st); have = rows_by_id(st)
c = st.cell(have['end.next'], sh.index('text') + 1)
if 'not built yet' in str(c.value):
    c.value = str(c.value).replace(' That part of the game is not built yet.', '')
    n = st.cell(have['end.next'], sh.index('notes') + 1); n.value = f"{n.value} · Claude Code, 5 Nov 2026: 'That part of the game is not built yet.' taken out: chapters 2-4 are in the game again."
    done.append('ScreenText ~ end.next')

# 2 · the modelling question's task line
if 'pauseq.modelChange.task' not in have:
    append(st, [{'id':'pauseq.modelChange.task', 'screen':"The modelling question (Finance's questions, from week 3): the task line in its Work it out on paper box",
                 'text':'Calculate the difference in profit for one flight',
                 'notes':("PLACEHOLDER (Claude Code, 5 Nov 2026): Bertie found the box's old line, the question's title ('Dublin: £90 or £100? Write SUM n "
                          "beside it'), confusing. Made up after DESIGN.md rule 2's own example ('Calculate the difference in profit. Write SUM 4 beside it.'). "
                          "The game adds '. Write SUM n beside it.' Fable to word.")}.get(h) for h in sh]); done.append('ScreenText + pauseq.modelChange.task')

rd = game['README']
mine = ("5 Nov 2026 (Claude Code): Bertie: one game file again (Settings buildEndsAfterChapter 0; end.next without 'not built yet'); "
        "the modelling question's box has a task line (ScreenText pauseq.modelChange.task, placeholder words).")
if mine not in {str(rd.cell(r, 1).value or '') for r in range(1, rd.max_row + 1)}: append(rd, [mine]); done.append('README + line')
game.save(BOOK); print('\n'.join(done))
