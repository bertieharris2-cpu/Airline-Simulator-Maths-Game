#!/usr/bin/env python3
"""Bertie's decisions of 2 Nov 2026, after Fable's v6.7 report (her section 7). Run after tools/merge_v67.py.
These are Bertie's rules, not placeholders: Settings rows the game reads in chapter one.
  1 · the gentle Board only: the old monthly board review is parked in chapter one        boardReviewChapterOne  off
  2 · Red Kite only counts a week when he had time to fly the route                        rivalNeedsSpare        yes
  3 · the graph question is not one of the pause's two, and comes at most every other week graphQuestionInPauseLimit no · graphQuestionEveryWeeks 2
  4 · fares: keep the tables (no change) · 5 · Years 5–6, numbers into WPS 4 are fine with partitioning (no setting) · 6 · keep week 1's Day pages
Usage: python3 tools/merge_decisions_2nov.py, then tools/import_world.py and src/opening/build.py.
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
B = "Bertie, 2 Nov 2026 (decision {n} on Fable's v6.7 report, section 7)"
S = [
  ('boardReviewChapterOne', 'off', B.format(n=1) + ": keep the gentle Board (the Monday news card after boardGapWeeks weeks below the best plan). The old monthly board review (the month-end audit's board form: a letter, an extra line and the average day, and the plan held until something changes) is parked in chapter one; the plain Finance audit stays. 'on' brings it back."),
  ('rivalNeedsSpare', 'yes', B.format(n=2) + ": a week only counts towards Red Kite taking a route (rivalIgnoreWeeks) when one of his planes that can reach it had time for one more return flight of it that week, as the stars' turned-away rule does. Flying the route starts the count again. 'no' goes back to counting every unflown week."),
  ('graphQuestionInPauseLimit', 'no', B.format(n=3) + ": the graph question under Your week in pictures is not one of the pause's two counted questions; it is still numbered (SUM n) and in the record. 'yes' makes it take one of the two again."),
  ('graphQuestionEveryWeeks', 2, B.format(n=3) + ": the graph question comes at most every other week: not in a week straight after one where it was asked (it still needs the gap above graphQuestionGapShare). 1 = any week."),
]
ws = game['Settings']; sh = header(ws); have = rows_by_id(ws)
for k, v, note in S:
    if k in have:
        r = have[k]; ws.cell(r, sh.index('Value') + 1).value = v; ws.cell(r, sh.index('Notes') + 1).value = note; done.append('Settings ~ ' + k)
    else: append(ws, [{'Key':k, 'Value':v, 'Notes':note, 'Status':'live'}.get(h) for h in sh]); done.append('Settings + ' + k)
rd = game['README']
mine = ("2 Nov 2026 (Claude Code): Bertie's decisions on Fable's v6.7 report (section 7). Settings boardReviewChapterOne off (gentle Board only), "
        "rivalNeedsSpare yes, graphQuestionInPauseLimit no, graphQuestionEveryWeeks 2. Fares kept; Years 5–6 with numbers into WPS 4 where partitioning helps; "
        "week 1's Day pages kept.")
if mine not in {str(rd.cell(r, 1).value or '') for r in range(1, rd.max_row + 1)}: append(rd, [mine]); done.append('README + line')
game.save(BOOK); print('\n'.join(done))
