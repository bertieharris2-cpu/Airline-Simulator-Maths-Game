#!/usr/bin/env python3
"""Round 4b (Claude Design's hand-off "the Sunday graphs", 2 Nov 2026). Run after tools/merge_r4.py.

Routes colour for every chapter-one route; Settings for the graphs and the graph question; ScreenText for the graphs page,
the question, Monday's Last week's graphs button and the two Monday news cards. Everything is a PLACEHOLDER
(docs/Placeholders-for-Fable.md). Usage: python3 tools/merge_r4b.py, then tools/import_world.py and src/opening/build.py.
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
NOTE = 'PLACEHOLDER (Claude Code, 2 Nov 2026, round 4 graphs): Fable to check'

# route colours: Claude Design's six (hand-off round 4), then Claude Code's for the rest of chapter one; never red, amber, gold or green
COL = {'ams':'#c0703a', 'gva':'#2f8f9a', 'bcn':'#a8874f',                                   # hand-off
       'mad':'#b0567e', 'rak':'#9a5f45', 'bru':'#4a8fc0', 'ber':'#5d5fb8', 'mxp':'#a8569a',  # Claude Code
       'fco':'#6f7f99', 'lis':'#8a6fc0', 'ath':'#5f9ab8', 'ist':'#b07a9e', 'edi':'#8c7a6b', 'rek':'#7a8fb0', 'cai':'#8f5f7f'}
ws = game['Routes']; sh = header(ws); have = rows_by_id(ws); ci = sh.index('colour') + 1
for k, v in COL.items():
    r = have.get(k)
    if r and ws.cell(r, ci).value != v: ws.cell(r, ci).value = v; done.append('Routes colour ~ ' + k)

S = [
  {'Key':'graphsFromWeek', 'Value':2, 'Notes':NOTE + '. The first Sunday review with Your week in pictures (the two graphs). Week 1\'s Sunday is already full.', 'Status':'live'},
  {'Key':'graphQuestionGapShare', 'Value':0.1, 'Notes':NOTE + ". The graph question (counted) only comes in a week when the gap is more than this share of the best plan's profit (Bertie: only when the gap is large).", 'Status':'live'},
  {'Key':'graph1MinWeeks', 'Value':6, 'Notes':NOTE + '. Graph 1 is always at least this many week-slots wide, so the first weeks do not make giant bars.', 'Status':'live'},
  {'Key':'graph1StepPounds', 'Value':5000, 'Notes':NOTE + '. Graph 1: a line every £5,000, a label every second line; the scale runs from £0 to the next step above the highest bar.', 'Status':'live'},
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
  ('pics.go', 'Sunday review: the button after the last sum', None, None, None, 'Your week in pictures ▶'),
  ('pics.page', 'Your week in pictures: title, sub-line, footer', None, 'How did week {n} go?', 'Your week in pictures|Sunday review · week {n}', 'Plan week {next} ▶'),
  ('pics.back', 'Your week in pictures: footer, back', None, None, None, '◀ Back to the sums'),
  ('pics.g1', 'Graph 1: title, legend, week label', None, 'Your plan against the best plan', 'Yours|Best plan|Gap|Wk {n}|New routes', None),
  ('pics.g2', 'Graph 2: title, axis label, not in his plan', None, 'Where the money is', 'Profit for each hour of plane time|not in your plan', None),
  ('pics.q.paper', 'Graph question under Graph 1 (paper, counted)', None, 'Work it out on paper', 'How much more could your plan have made this week? Write {sum} beside it.', 'Enter'),
  ('pics.q.read', 'Graph question under Graph 2 (Read the graph, counted)', None, 'Read the graph', 'Which route earns most for each hour of plane time? Pick one. It counts as {sum}.', None),
  ('pics.q.wrong', 'Graph question: a wrong first try, then the answer shown', None, None, 'Not quite. One more try.|The answer: {answer}.|✓ Right: {answer}', None),
  ('news.rival.times', "Monday news, Red Kite: its departures on the board (from Claude Design's picture)", None, None, '07:10|12:40|17:55', None),
  ('pics.monday', "Monday's plan: the button that drops last week's graphs down", None, None, None, "Last week's graphs"),
  ('news.rival', 'Monday news: Red Kite takes a route he ignored', 'NEWS · RED KITE AIR', 'Red Kite Air now flies to {city}', 'Fewer people will want to fly {city} with you.|DEPARTURES · {airport}|LONDON|RED KITE AIR|Monday news · {date}', 'Plan the week ▶'),
  ('news.board', "Monday news: the Board's note after weeks with a large gap", 'A NOTE FROM THE BOARD', 'The Board would like a word', 'Three weeks running, your plan made less than the best plan.|{airline} · THE BOARD|Profit is good.|Our shareholders want the most profit our planes can make.|Signed, the Board of {airline}|Monday news · {date}', 'Plan the week ▶'),
]
st = game['ScreenText']; sh = header(st); have = rows_by_id(st)
for k, screen, eb, ti, tx, bt in T:
    vals = {'id':k, 'screen':screen, 'eyebrow':eb, 'title':ti, 'text':tx, 'button':bt}
    if k in have:
        r = have[k]
        for h, v in vals.items():
            c = st.cell(r, sh.index(h) + 1)
            if (c.value or '') != (v or ''): c.value = v; done.append('ScreenText ~ ' + k)
        n = st.cell(r, sh.index('notes') + 1)
        if 'round 4 graphs' not in str(n.value or ''): n.value = (str(n.value) + ' · ' if n.value else '') + NOTE; done.append('ScreenText notes ~ ' + k)
    else:
        vals['notes'] = NOTE; append(st, [vals.get(h) for h in sh]); done.append('ScreenText + ' + k)
rd = game['README']; have = {str(rd.cell(r, 1).value or '') for r in range(1, rd.max_row + 1)}
mine = "2 Nov 2026 (Claude Code, round 4 graphs): Routes colour for every chapter-one route; Settings graphsFromWeek, graphQuestionGapShare, graph1MinWeeks, graph1StepPounds; ScreenText pics.*, news.rival, news.board. All PLACEHOLDER for Fable. Script: tools/merge_r4b.py (after merge_r4.py)."
if mine not in have: append(rd, [mine]); done.append('README + line')
game.save(BOOK); print('\n'.join(dict.fromkeys(done)) or 'nothing to do')
