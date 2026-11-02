#!/usr/bin/env python3
"""Install Fable's workbook v6.7 (her data pass on chapter one, 2 Nov 2026), then do what her report asks of Claude Code (section 8).

v6.7 is the game's copy (after merge_r4c.py) plus Fable's changes. The file Bertie uploaded was lost when the session's container
restarted, before it was committed. Its changes had already been compared cell by cell with the game's copy, and that list is kept in
data/incoming/fable-v6.7-2-nov/v6.7-changes.json. Every value and every word the game shows is in it exactly. Five long notes were
cut short in that comparison; they end in "…" here. If the original file is put back as
data/incoming/fable-v6.7-2-nov/Airline-World-Workbook-v6.7.xlsx, this script installs it as it is, instead of rebuilding it.

Then, on top (Claude Code):
- news.board: "shareholders" → "the airline's owners", the change Fable's report describes, which was missing from her file;
- Airports LHR T5 turnaroundMin 35 → 30: the game takes the home turnaround from the home terminal's row first, so Fable's
  Settings homeTurnaroundMin 30 only takes effect with this row at 30 too (her note: 2 × Frankfurt + Paris in 12 h 00);
- Settings graph2Measure (her report, section 5);
- ScreenText brief1.lead, brief1.steps, intro.tank.lead, end.next: three wordings moved from code for Fable to set (section 4).
Usage: python3 tools/merge_v67.py, then tools/import_world.py and src/opening/build.py. Run it on the game's copy from merge_r4c.py.
"""
import json, shutil
from copy import copy
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
INC = ROOT / 'data' / 'incoming' / 'fable-v6.7-2-nov'
ORIG = INC / 'Airline-World-Workbook-v6.7.xlsx'
BOOK = ROOT / 'data' / 'Airline-World-Workbook.xlsx'
NOTE = 'Claude Code, 2 Nov 2026 (v6.7 install)'

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
def same(a, b): return (a if a != '' else None) == (b if b != '' else None)

done = []
if ORIG.exists():
    shutil.copyfile(ORIG, BOOK); game = openpyxl.load_workbook(BOOK); done.append('installed v6.7 (Fable\'s file)')
else:
    game = openpyxl.load_workbook(BOOK)
    if any(str(game['README'].cell(r, 1).value or '').startswith('v6.7 (2 Nov)') for r in range(1, game['README'].max_row + 1)):
        raise SystemExit('The workbook already has v6.7 in it: run this on the game\'s copy from merge_r4c.py (git checkout the workbook first).')
    spec = json.load(open(INC / 'v6.7-changes.json', encoding='utf-8')); bad = []
    for x in spec:
        ws = game[x['sheet']]; h = header(ws)
        if x['op'] == 'add':
            vals = x['values']
            if x['sheet'] == 'Settings': row = dict(zip(['Key', 'Value', 'Notes', 'Status'], vals)); append(ws, [row.get(c) for c in h])
            else: append(ws, vals)
            continue
        have = rows_by_id(ws); r = have.get(str(x['key'])); c = h.index(x['col']) + 1 if x['col'] in h else None
        if not r or not c: bad.append(f"{x['sheet']} {x['key']} [{x['col']}]: not found"); continue
        cur = ws.cell(r, c).value
        if not (same(cur, x['old']) or (x.get('oldCut') and str(cur or '').startswith(str(x['old'])))): bad.append(f"{x['sheet']} {x['key']} [{x['col']}]: {cur!r} is not {x['old']!r}")
        ws.cell(r, c).value = x['new']
    if bad: raise SystemExit('The workbook is not the copy v6.7 was made from:\n' + '\n'.join(bad))
    done.append(f'rebuilt v6.7 from v6.7-changes.json ({len(spec)} changes; 5 long notes cut short)')
    game.save(INC / 'Airline-World-Workbook-v6.7-rebuilt.xlsx')

# 1 · the Board's card
st = game['ScreenText']; sh = header(st); have = rows_by_id(st)
r = have['news.board']; c = st.cell(r, sh.index('text') + 1)
if 'Our shareholders' in str(c.value):
    c.value = str(c.value).replace('Our shareholders want', "The airline's owners want")
    n = st.cell(r, sh.index('notes') + 1); n.value = f"{n.value} · {NOTE}: applied the change Fable's report describes (\"shareholders\" → \"the airline's owners\"), which was missing from the v6.7 file."
    done.append('ScreenText ~ news.board')

# 1b · the home turnaround
ap = game['Airports']; sha = header(ap)
for r in range(2, ap.max_row + 1):
    if ap.cell(r, sha.index('code') + 1).value == 'LHR' and ap.cell(r, sha.index('terminal') + 1).value == 'T5' and ap.cell(r, sha.index('turnaroundMin') + 1).value != 30:
        ap.cell(r, sha.index('turnaroundMin') + 1).value = 30
        n = ap.cell(r, sha.index('notes') + 1); n.value = f"{n.value} · {NOTE}: turnaround 35 → 30 to match Fable's Settings homeTurnaroundMin (the game reads this row first). Fable to confirm."
        done.append('Airports ~ LHR T5 turnaroundMin 30')

# 2 · Settings graph2Measure
ws = game['Settings']; shs = header(ws)
if 'graph2Measure' not in rows_by_id(ws):
    append(ws, [{'Key':'graph2Measure', 'Value':'one plane all day',
                 'Notes':f"{NOTE}, Fable's report section 5. Graph 2 (Where the money is): 'one plane all day' = what one of his planes makes flying the route as often as fits in a day, ÷ the hours flown (Fable: sound, keep). 'one flight' = one return flight's profit ÷ its hours there and back (Claude Design's words taken literally; a route that loses passengers to Red Kite barely changes, because one flight still fills).",
                 'Status':'live'}.get(h) for h in shs]); done.append('Settings + graph2Measure')

# 3 · wordings from code
T = [  # (id, screen, eyebrow, title, text, button)
  ('brief1.lead', "Launch Day's first page (Your first week in charge): the paragraph under the title", None, 'Your first week in charge',
   'Build the timetable, set the fares, work out the key numbers, then run your first week of operations. Every decision changes demand, revenue, costs and profit.', None),
  ('brief1.steps', "Launch Day's first page: the steps (title: the label over them; text: 'Step|What it means' pairs)", None, 'Your Week 1 plan: {n} simple steps',
   "Build your timetable|Choose how many services to fly, where to and when. Make the best use of the aircraft's day.|Set fares|Choose a ticket price for each route. A higher fare earns more a ticket, but fewer people want to fly.|Work out the key numbers|Tickets, profit and fuel by hand, on the same page as the plan. The model shows the rest.|Run the week|Confirm the plan and watch the airline fly Monday to Sunday. Then the review: what did the week earn?", None),
  ('intro.tank.lead', "December's 'Buying fuel ahead' introduction: its first line", None, None,
   'You have bought fuel ahead since week 3; in December you buy a month at a time.', None),
  ('end.next', "The chapter-one review's 'What comes next' line (it used chapter 2's newIdea, which says 'reputation revealed')", None, None,
   'Chapter {n}, {name}, opens on {date}: long haul, overnight rotations and time zones; the 787 by lease; the airline type chosen. That part of the game is not built yet.', None),
]
NOTES = {
  'brief1.lead': "moved from code for Fable to set (her report section 4): the on-board service (snacks) is out, as she suggested",
  'brief1.steps': "moved from code for Fable to set (section 4): the 'Choose on-board service' step and 'snacks' are out, as she suggested, so it is four steps",
  'intro.tank.lead': "moved from code for Fable to set (section 4); her suggested words. It replaces 'From now on you plan a month at a time, and fuel goes back into your tank. You decide when to buy fuel, and how much.'",
  'end.next': "moved from code for Fable to set (section 4). Chapter one only; chapter 2's own newIdea (Chapters sheet) is untouched. 'reputation revealed' is left out because stars are public from week 4. Fable suggested 'Your stars, public since week 4', but this line lists what comes next, so the item is dropped instead: Fable to check",
}
st = game['ScreenText']; sh = header(st); have = rows_by_id(st)
for k, screen, eb, ti, tx, bt in T:
    if k in have: continue
    append(st, [{'id':k, 'screen':screen, 'eyebrow':eb, 'title':ti, 'text':tx, 'button':bt, 'notes':f'{NOTE}: {NOTES[k]}'}.get(h) for h in sh]); done.append('ScreenText + ' + k)

rd = game['README']
mine = ("2 Nov 2026 (Claude Code): v6.7 installed as the game's workbook (tools/merge_v67.py). Added on top: news.board 'The airline's owners' "
        "(the change Fable's report describes, missing from the file); Airports LHR T5 turnaroundMin 35 → 30 to match homeTurnaroundMin "
        "(the game reads the terminal first); Settings graph2Measure; ScreenText brief1.lead, brief1.steps, intro.tank.lead, end.next "
        "(wordings moved from code for Fable to set). The game now reads legRounding (chapter one).")
if mine not in {str(rd.cell(r, 1).value or '') for r in range(1, rd.max_row + 1)}: append(rd, [mine]); done.append('README + line')
game.save(BOOK); print('\n'.join(done))
