#!/usr/bin/env python3
"""Bertie's play notes of 1 Nov 2026, 10:49 (design-and-flow round 2). Run after tools/merge_1737.py.

Words: callouts and signals cut to the bare minimum; "yesterday's plan" (the two plans are built the morning after);
the new-plan sheet (np.*), the Day page tour (day.tour.*), the take-off skip. Settings: newPlanSheet, dayPageTour.
Everything here is a PLACEHOLDER for Fable's pass (docs/Placeholders-for-Fable.md).
Usage: python3 tools/merge_1049.py   (then python3 tools/import_world.py and python3 src/opening/build.py)
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
NOTE = 'PLACEHOLDER (Claude Code, 1 Nov 2026, play notes 10:49): Fable to check'

S = [
  {'Key':'newPlanSheet', 'Value':'first change in week 1, or a new route', 'Notes':NOTE + '. When a change in week 1 is worked out on the whole-plan sheet (Launch Day sums again) rather than the Changes sheet.', 'Status':'live'},
  {'Key':'dayPageTour', 'Value':'Launch Day', 'Notes':NOTE + ". The Day page's guided tour (one part at a time, the rest dimmed): Launch Day only.", 'Status':'live'},
]
ws = game['Settings']; sh = header(ws); have = rows_by_id(ws)
for v in S:
    if v['Key'] in have:
        r = have[v['Key']]
        for h, x in v.items():
            c = ws.cell(r, sh.index(h) + 1)
            if c.value != x: c.value = x; done.append('Settings ~ ' + v['Key'])
    else: append(ws, [v.get(h) for h in sh]); done.append('Settings + ' + v['Key'])

T = [  # (id, screen, eyebrow, title, text, button)   None = leave as it is
  ('signal.build', None, None, None, 'Build the formula, then press [Enter].', None),
  ('signal.paper', None, None, None, 'Work it out on paper. Write [SUM {n}] beside it.|Type the answer in **{cell}**, then press [Enter].', None),
  ('launch.compare', None, None, None, 'Work it out on paper. Write [SUM {n}] beside it.|Type the answer in **{cell}**, then press [Enter].', None),
  ('launch.job', None, None, 'Work out the ticket revenue for each flight', 'Ticket revenue = **passengers × fare**.', None),
  ('ld3.job', None, None, 'Profit = Total revenue − Total costs', '', None),
  ('tp.title', None, None, None, "{airline} HQ · yesterday's plan stays above · build a new one under it", None),
  ('tp.lane.old', None, None, None, "YESTERDAY'S PLAN|Flew yesterday|LAST WEEK'S PLAN|Flew last week", None),
  ('tp.choice', None, None, None, 'Profit a day · flew yesterday|Profit a day · last week|Profit a day · worked out|work it out first', None),
  ('tp.compare', None, None, None, "Yesterday's plan|Last week's plan|New plan|Projected for tomorrow|Projected for this week", None),
  ('tp.footer', None, None, None, 'Build your new plan, then work it out.|Build your new plan, then work it out.|Choose the plan that flies tomorrow.|Choose the plan that flies this week.', 'Work out my plan ▶'),
  ('tp.co1', None, None, 'Build a new plan for tomorrow', "Compare it with yesterday's plan.", None),
  ('tp.co2', None, None, 'Now work it out', 'Press **Work out my plan**.', None),
  ('tp.co1.week', None, None, 'Build a new plan for this week', "Compare it with last week's plan.", None),
  ('tp.co2.week', None, None, 'Now work it out', 'Press **Work out my plan**.', None),
  ('changes.head.week1', None, None, "Yesterday's plan", None, None),
  ('chg3.head.diff', None, None, None, "change − yesterday's|change − last week|Difference", None),
  ('ba.title', None, None, "Before / after: yesterday's plan and your new plan", None, None),
  ('ba.co1', None, None, "Yesterday's plan", '{n} flights: {list}. It made {money} profit yesterday.', None),
  ('ba.co3.than', None, None, None, ': more than {old} made yesterday', None),
  ('ba.table', None, None, None, "Flights|Passengers|Ticket revenue|Costs|Profit|Yesterday's plan|Last week|New plan|Difference", None),
  ('ba.co4.np', 'Before / after after the new-plan sheet: callout 4 of 4', 'BEFORE / AFTER', 'The difference a day', 'Your new plan should make {money} {more} a day{fewer}.', 'Choose a plan ▶'),
  ('np.title', 'The new-plan sheet: title and crumb', None, 'Work out your new plan', 'Plan tomorrow · the same sums as Launch Day', None),
  ('np.cols', 'The new-plan sheet: column heads', None, None, "your new plan|New plan|Yesterday's plan|new − yesterday's|Difference", None),
  ('np.rows', 'The new-plan sheet: row labels', None, None, 'Passengers|Fare|Ticket revenue|Total revenue|Other costs|Fuel burned|Total costs|Profit', None),
  ('np.diff', 'The new-plan sheet: the difference in profit (paper, counted)', None, 'The difference in profit', None, None),
  ('np.line', 'The new-plan sheet: the line under the sheet (working | done)', None, None, 'Work out your new plan, like Launch Day.|✓ Your new plan makes {d} {more} a day than yesterday.', None),
  ('np.footer', 'The new-plan sheet: the footer (working | done)', None, None, 'Plan tomorrow · work out your new plan.|Plan tomorrow · see it as a graph.', 'Before / after ▶'),
  ('day.tour.1', 'Day page tour (Launch Day), 1: the profit', 'HOW IT WENT', 'Profit today', 'What your plan made today, after its costs.', 'Next ▸'),
  ('day.tour.2', 'Day page tour, 2: route by route', 'HOW IT WENT', 'Route by route', "How many wanted to fly, how many flew, and who couldn't get a seat.", 'Next ▸'),
  ('day.tour.3', 'Day page tour, 3: what it means for tomorrow', 'HOW IT WENT', 'What next', 'What today means for tomorrow.', 'Next ▸'),
  ('day.tour.4', 'Day page tour, 4: the choice', 'HOW IT WENT', 'Your choice', 'Keep the plan, or build a new one.', 'Got it'),
  ('takeoff.skip', 'Take-off: the skip button (screen and Operations Wall)', None, None, None, 'Skip take-off ▶'),
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
        if 'play notes 10:49' not in str(n.value or ''): n.value = (str(n.value) + ' · ' if n.value else '') + NOTE; done.append('ScreenText notes ~ ' + k)
    else:
        vals['notes'] = NOTE; append(st, [vals.get(h) for h in sh]); done.append('ScreenText + ' + k)
rd = game['README']; have = {str(rd.cell(r, 1).value or '') for r in range(1, rd.max_row + 1)}
mine = "1 Nov 2026 (Claude Code, Bertie's play notes 10:49, design round 2): minimal callouts and signals; yesterday's plan; np.*, day.tour.*, takeoff.skip; Settings newPlanSheet, dayPageTour. All PLACEHOLDER for Fable. Script: tools/merge_1049.py (after merge_1737.py)."
if mine not in have: append(rd, [mine]); done.append('README + line')
game.save(BOOK); print('\n'.join(dict.fromkeys(done)) or 'nothing to do')
