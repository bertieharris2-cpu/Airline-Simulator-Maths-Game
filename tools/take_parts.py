#!/usr/bin/env python3
"""Take named parts of a newer world workbook into the installed one, leaving everything else as it is.

Bertie (16 Oct 2026): "I don't want to do any more data changes until much later… we now just need to polish
the game." Fable's workbooks after v5.8 carry polish (D96–D99) and economy changes (D90, D92, D94, v5.11's
dates) together, so a newer workbook is not installed whole: this script copies only the parts named on the
command line from it into data/Airline-World-Workbook.xlsx, and notes on that workbook's README sheet what
was taken and from which version. Run tools/import_world.py afterwards.

  --sheets A,B      whole sheets, replaced or added (added in the newer workbook's sheet order)
  --settings k1,k2  Settings rows by key, replaced or added before the note rows
  --note "text"     the line added to the README sheet

Usage: python3 tools/take_parts.py <newer-workbook.xlsx> --sheets DailyColour,Upgrades --settings dailyColour --note "…"
"""
import sys, argparse
from copy import copy
from pathlib import Path

try:
    import openpyxl
except ImportError:
    sys.exit('Needs openpyxl: pip install openpyxl')

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / 'data' / 'Airline-World-Workbook.xlsx'

ap = argparse.ArgumentParser(usage=__doc__)
ap.add_argument('newer'); ap.add_argument('--sheets', default=''); ap.add_argument('--settings', default=''); ap.add_argument('--note', default='')
a = ap.parse_args()
sheets = [s for s in a.sheets.split(',') if s]; keys = [k for k in a.settings.split(',') if k]
base = openpyxl.load_workbook(BOOK)
newer = openpyxl.load_workbook(a.newer)
took = []

def copy_cell(src, dst):
    dst.value = src.value
    if src.has_style:
        dst.font, dst.fill, dst.border = copy(src.font), copy(src.fill), copy(src.border)
        dst.alignment, dst.number_format = copy(src.alignment), src.number_format

# 1. whole sheets, in the newer workbook's order
for name in sheets:
    if name not in newer.sheetnames: sys.exit(f'{a.newer} has no sheet {name}')
    src = newer[name]
    if name in base.sheetnames:
        at = base.sheetnames.index(name); base.remove(base[name]); dst = base.create_sheet(name, at); how = 'replaced'
    else:
        # after the nearest sheet that comes before it in the newer workbook and exists here
        before = [s for s in newer.sheetnames[:newer.sheetnames.index(name)] if s in base.sheetnames]
        dst = base.create_sheet(name, base.sheetnames.index(before[-1]) + 1 if before else None); how = 'added'
    for row in src.iter_rows():
        for c in row: copy_cell(c, dst.cell(row=c.row, column=c.column))
    for k, d in src.column_dimensions.items(): dst.column_dimensions[k].width = d.width
    dst.freeze_panes = src.freeze_panes
    took.append(f'{name} sheet {how} ({src.max_row - 1} rows)')

# 2. Settings rows by key
bs, ns = base['Settings'], newer['Settings']
def rows_by_key(ws): return {ws.cell(row=r, column=1).value: r for r in range(2, ws.max_row + 1) if ws.cell(row=r, column=1).value}
have, src_rows = rows_by_key(bs), rows_by_key(ns)
for k in keys:
    if k not in src_rows: sys.exit(f'{a.newer} has no Settings row {k}')
    if k in have: at = have[k]; how = 'replaced'
    else:
        at = bs.max_row + 1
        for rr in range(2, bs.max_row + 1):   # keep the note rows (no key) at the foot
            if bs.cell(row=rr, column=1).value is None: at = rr; bs.insert_rows(rr); break
        how = 'added'
        have = rows_by_key(bs)
    for c in range(1, ns.max_column + 1): copy_cell(ns.cell(row=src_rows[k], column=c), bs.cell(row=at, column=c))
    took.append(f'Settings {k} {how}')

# 3. the README line
if a.note:
    rd = base['README']; rd.cell(row=rd.max_row + 1, column=1).value = a.note

base.save(BOOK)
print(f'Took from {Path(a.newer).name} into {BOOK.relative_to(ROOT)}:')
for t in took: print('  ' + t)
