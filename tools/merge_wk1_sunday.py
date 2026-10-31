#!/usr/bin/env python3
"""Hand-off 2a, section 5 as changed on 31 Oct 2026 (evening): the week 1 Sunday review adds each day, then Σ SUM, side by side.

Adds the words of the five stages to the game's ScreenText (ids wk1.*), so the screens read them from the workbook like
everything else. Settings spreadsheetLadder already says it ("week 1: he clicks each day into the total, then is shown Σ SUM
by dragging down the column (both, side by side); from week 2: drag only"), so it is left as it is.

Usage: python3 tools/merge_wk1_sunday.py   (then python3 tools/import_world.py and python3 src/opening/build.py)
Running it again changes nothing more.
"""
from copy import copy
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / 'data' / 'Airline-World-Workbook.xlsx'
game = openpyxl.load_workbook(BOOK)
done = []
NOTE = 'Hand-off 2a section 5, 31 Oct 2026 evening: add each day, then Σ SUM, side by side'

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

st = game['ScreenText']; sh = header(st)
TEXT = [
  # (id, screen, eyebrow, title, text, button)
  ('wk1.method', 'Week 1 Sunday: the method in each sheet\'s top-left header cell (left | right)', None, None, 'Add each day|Use Σ SUM', None),
  ('wk1.next', 'Week 1 Sunday: the dashed box on the right before the left is done', None, 'Next: a quicker way', 'When your whole week is added up, Finance shows you a faster way to do it.', None),
  ('wk1.yours', 'Week 1 Sunday: the label on his own sheets', None, None, 'YOUR WEEK', None),
  ('wk1.add.watch', 'Week 1 Sunday, 1: the signal while Finance adds Monday to Wednesday', 'EXAMPLE · WATCH', 'Watch: add up the profit from Monday to Wednesday',
   "Finance clicks Monday's profit, presses **+**, clicks Tuesday's, presses **+**, clicks Wednesday's, then presses [Enter].", None),
  ('wk1.add.done', 'Week 1 Sunday, 1: the signal when Finance has added them', 'EXAMPLE · WATCH', "That's how adding each day works",
   "Click each day's profit and press **+** between them, then press [Enter]: the sheet adds them up.|**Your turn: the profit for the whole week, Monday to Sunday.**", 'My turn ▶'),
  ('wk1.add.line', 'Week 1 Sunday, 1: the line under the example', None, None, 'Watch: Finance clicks each day, with + between them.', None),
  ('wk1.add.lineDone', 'Week 1 Sunday, 1: the line when the example is added', None, None, '✓ Monday to Wednesday: {total}. The sheet added them up.', None),
  ('wk1.add.signal', 'Week 1 Sunday, 2: the signal while he adds every day', None, 'Your turn: add up the profit for the whole week, Monday to Sunday',
   "Click each day's profit and press **+** between them. Click Sunday's, then press [Enter].", None),
  ('wk1.add.count', 'Week 1 Sunday, 2: the line while he clicks the days', None, None, '{first} to {upto} so far. Keep going to {last}.', None),
  ('wk1.add.total', 'Week 1 Sunday, 3-4: the line under his added week', None, None, '✓ The whole week: **{total}**. Seven clicks, six + signs.', None),
  ('wk1.add.same', 'Week 1 Sunday, 5: the line under his added week at the end', None, None, '✓ Adding each day: **{total}**', None),
  ('wk1.sum.watch', 'Week 1 Sunday, 3: the signal while Finance shows Σ SUM', 'EXAMPLE · WATCH', 'Watch: a quicker way to add up Monday to Wednesday',
   'Finance presses **Σ SUM**, drags down the Profit column from Monday to Wednesday, then presses [Enter]. One drag, no + signs.', None),
  ('wk1.sum.signal', 'Week 1 Sunday, 4: the signal while he uses Σ SUM', None, 'Your turn: the whole week with Σ SUM',
   'Press **Σ SUM**, drag down your Profit column from Monday to Sunday, then press [Enter].', None),
  ('wk1.sum.same', 'Week 1 Sunday, 5: the line under the Σ SUM sheet', None, None, '✓ Σ SUM: **{total}**. The same answer, in one drag.', None),
]
have = rows_by_id(st)
for k, screen, eb, ti, tx, bt in TEXT:
    vals = {'id': k, 'screen': screen, 'eyebrow': eb, 'title': ti, 'text': tx, 'button': bt, 'notes': NOTE}
    if k in have:
        r = have[k]
        for h, v in vals.items():
            c = st.cell(r, sh.index(h) + 1)
            if c.value != v: c.value = v; done.append(f'ScreenText ~ {k}')
    else:
        append(st, [vals.get(h) for h in sh]); done.append(f'ScreenText + {k}')

rd = game['README']
have = {str(rd.cell(r, 1).value or '') for r in range(1, rd.max_row + 1)}
mine = ('31 Oct 2026, late evening (Claude Code, hand-off 2a section 5 as changed that evening): the week 1 Sunday review adds each day, '
        'then Σ SUM, side by side in one panel (left 1 · Add each day, right 2 · Use Σ SUM); Finance shows each method on Monday to Wednesday '
        'first. ScreenText wk1.* holds the words. Script: tools/merge_wk1_sunday.py.')
if mine not in have: append(rd, [mine]); done.append('README + Claude Code line')

game.save(BOOK)
print('\n'.join(dict.fromkeys(done)) or 'nothing to do')
