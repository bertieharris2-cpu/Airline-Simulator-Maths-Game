#!/usr/bin/env python3
"""Round 3 (Claude Design's hand-off "fewer words", 1 Nov 2026; Bertie's 11:52 and 12:05 play notes). Run after tools/merge_1049.py.

Words: every callout a title (DESIGN.md's callout rules); the tasks under "Build the formula" / "Work it out on paper";
the Day page walk-through (day.tour.0-4), two plans (tp.*), the new-plan sheet (np.*), Before / after after the sums
(ba.np.*), week 1 Sunday (wk1.*), the week 2 what-if (wi2.*). Settings: tuesdayCountedSums.
Everything here is a PLACEHOLDER for Fable's pass (docs/Placeholders-for-Fable.md).
Usage: python3 tools/merge_r3.py   (then python3 tools/import_world.py and python3 src/opening/build.py)
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
NOTE = 'PLACEHOLDER (Claude Code, 1 Nov 2026, round 3): Fable to check'

S = [
  {'Key':'tuesdayCountedSums', 'Value':2, 'Notes':NOTE + ". Counted paper sums on the first new-plan sheet of week 1 (Tuesday): his second route's ticket revenue and the difference in profit (Bertie: both count). Over the old one-a-day limit for this day.", 'Status':'live'},
]
ws = game['Settings']; sh = header(ws); have = rows_by_id(ws)
for v in S:
    if v['Key'] in have:
        r = have[v['Key']]
        for h, x in v.items():
            c = ws.cell(r, sh.index(h) + 1)
            if c.value != x: c.value = x; done.append('Settings ~ ' + v['Key'])
    else: append(ws, [v.get(h) for h in sh]); done.append('Settings + ' + v['Key'])

T = [  # (id, screen, eyebrow, title, text, button)   None = leave as it is; '' = empty
  # Launch Day: the profit
  ('ld3.job', None, 'LAUNCH DAY · THE PROFIT', 'Profit = Total revenue − Total costs', '', 'Watch ▶'),
  ('ld3.mine.task', 'Launch Day sheet: his profit, the task under "Build the formula"', None, None, 'Calculate the profit', None),
  ('ld3.mine.line', 'Launch Day sheet: the line under the sheet on his profit', None, None, 'Your turn.', None),
  ('ld3.footer', None, None, None, 'Launch Day · the profit.|Launch Day · your profit.|Launch Day · watch Finance, on made-up numbers.', None),
  # the Day page walk-through
  ('day.tour.0', 'Day page walk-through (Launch Day), first: the whole page, then Start', 'LAUNCH DAY', 'Review the day', '', 'Start ▸'),
  ('day.tour.1', None, 'REVIEW THE DAY', 'Your profit today', '', 'Next ▸'),
  ('day.tour.2', None, 'REVIEW THE DAY', 'Who wanted to fly, and who flew', '', 'Next ▸'),
  ('day.tour.3', None, 'REVIEW THE DAY', 'What next', 'What next: {city} opens tomorrow', 'Next ▸'),
  ('day.tour.4', None, 'REVIEW THE DAY', 'Your choice: plan tomorrow', '', 'Got it'),
  # two plans
  ('tp.title', None, None, None, "{airline} HQ · build a new plan and compare it with yesterday's", None),
  ('tp.lane.old', None, None, None, "YESTERDAY'S PLAN|Flew yesterday|LAST WEEK'S PLAN|Flew last week|Flew on Launch Day", None),
  ('tp.footer', None, None, None, 'Build a new plan for tomorrow.|Build a new plan for this week.|Choose the plan that flies tomorrow.|Choose the plan that flies this week.|Work out your new plan before you choose.|Work out your new plan before you choose.', 'Work out my plan ▶'),
  ('tp.co1', None, 'NEW · TWO PLANS', "Build a new plan for tomorrow. Compare it with yesterday's plan.", '', 'Got it'),
  ('tp.co1.week', None, 'NEW · TWO PLANS', "Build a new plan for this week. Compare it with last week's plan.", '', 'Got it'),
  # the new-plan sheet
  ('np.title', None, None, 'Work out your new plan', "{day}'s plan · worked out before you choose", None),
  ('np.cols', None, None, None, "your new plan|New plan|Yesterday's plan|new − yesterday|Difference|your flight|your", None),
  ('np.task', 'The new-plan sheet: the tasks under "Build the formula" (ticket revenue | total revenue | profit)', None, None, 'Calculate the ticket revenue|Calculate the total revenue|Calculate the profit', None),
  ('np.tk2', "The new-plan sheet: the second route's ticket revenue (paper, counted)", None, 'The ticket revenue', None, None),
  ('np.diff', None, None, 'The difference in profit', None, None),
  ('np.line', None, None, None, "Your turn.|✓ Your new plan should make {d} {more} a day than yesterday's.", None),
  ('np.footer', None, None, None, "{day}'s plan · work it out, then compare.|{day}'s plan · work it out, then compare.", 'Before / after ▶'),
  # Before / after after the sums
  ('ba.title', None, None, "Before / after: yesterday's plan and your new plan", None, None),
  ('ba.np.co1', 'Before / after after the new-plan sheet, callout 1 of 2', 'BEFORE / AFTER', "Yesterday's plan: {flights}", '', 'Next ▸'),
  ('ba.np.co2', 'Before / after after the new-plan sheet, callout 2 of 2', 'BEFORE / AFTER', 'Your new plan: {money} {more} a day', '', 'Got it'),
  ('ba.np.footer', 'Before / after after the new-plan sheet: footer line | crumb', None, None, "{day}'s plan · what you worked out.|{day}'s plan", 'Choose a plan ▶'),
  # week 1 Sunday
  ('wk1.co.add', None, 'WEEK 1 ACCOUNTS', "One way to find the week's total profit: add each day", '', 'Watch ▶'),
  ('wk1.co.sum', None, 'A SIMPLER WAY', "Here's a simpler way to do it in a spreadsheet", '', 'Watch ▶'),
  ('wk1.add.lineDone', None, None, None, '✓ Mon to Wed: **{total}**', None),
  ('wk1.add.signal', None, None, 'Calculate the total profit for the week', '', None),
  ('wk1.add.total', None, None, None, '✓ Right: **{total}**', None),
  ('wk1.easier', 'Week 1 Sunday: the green button after his week is right', None, None, 'An easier method ▶', None),
  ('wk1.sum.signal', None, None, 'Calculate the total profit for the week with Σ SUM', '', None),
  ('wk1.sum.same2', 'Week 1 Sunday: the line after his Σ SUM', None, None, '✓ Same answer: **{total}**', None),
  ('wk1.avg.go', 'Week 1 Sunday: the green button that starts the average', None, None, 'Now calculate the average ▶', None),
  ('wk1.avg.fin', "Week 1 Sunday: the line under Finance's average", None, None, '✓ Finance: average a day **{mean}**', None),
  ('wk1.avg.mine', None, None, "Now it's your turn: calculate the average a day", '', None),
  ('wk1.avg.watch', None, None, None, 'Watch: Finance clicks **Profit this week**, presses **÷**, clicks **Days flown**, then presses **Enter**.', None),
  ('wk1.sum.same', None, None, None, '✓ Same answer: **{total}**', None),
  ('wk1.add.watch', None, None, None, 'Watch: Finance clicks each day, with **+** between them.', None),
  ('wk1.sum.watch', None, None, None, 'Watch: **Σ SUM**, then drag Monday to Wednesday.', None),
  # week 2 what-if
  ('wi2.co1', None, 'NEW · WHAT IF', 'What if {city} were £{step} more?', '', 'Got it'),
  ('wi2.task', 'Week 2 what-if: the tasks (a day | a week)', None, None, 'Calculate the ticket revenue a day|Calculate the difference over a week', None),
  ('wi2.line', 'Week 2 what-if: the line under the sheet on his build', None, None, 'Your turn.', None),
  ('wi2.x7', "Week 2 what-if: the line during Finance's × 7", None, None, 'Watch: Finance clicks **Ticket revenue a day**, presses **×**, types **7**, then presses **Enter**.', None),
  ('wi2.x7.go', 'Week 2 what-if: the line before Watch (the week)', None, None, 'Finance shows you a week.', None),
  ('wi2.x4', "Week 2 what-if: the line during Finance's × 4", None, None, 'Watch: Finance clicks **A week**, presses **×**, types **{w}**, then presses **Enter**.', None),
  ('wi2.x4.go', 'Week 2 what-if: the line before Watch (the month)', None, None, 'Finance shows you a month.', None),
  ('wi2.co4', None, 'A LITTLE ADDS UP', '£{step} more a ticket = {month} more a month', '', 'Got it'),
  ('wi2.footer', None, None, None, 'Plan week {n} · what a little more on a fare adds up to.|Plan week {n} · what a little more on a fare adds up to.', 'Set my fares ▶'),
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
        if 'round 3' not in str(n.value or ''): n.value = (str(n.value) + ' · ' if n.value else '') + NOTE; done.append('ScreenText notes ~ ' + k)
    else:
        vals['notes'] = NOTE; append(st, [vals.get(h) for h in sh]); done.append('ScreenText + ' + k)
rd = game['README']; have = {str(rd.cell(r, 1).value or '') for r in range(1, rd.max_row + 1)}
mine = "1 Nov 2026 (Claude Code, round 3, Claude Design's hand-off 'fewer words'): callouts as titles; Build the formula / Work it out on paper tasks; day.tour.0-4, tp.*, np.*, ba.np.*, wk1.*, wi2.*; Settings tuesdayCountedSums. All PLACEHOLDER for Fable. Script: tools/merge_r3.py (after merge_1049.py)."
if mine not in have: append(rd, [mine]); done.append('README + line')
game.save(BOOK); print('\n'.join(dict.fromkeys(done)) or 'nothing to do')
