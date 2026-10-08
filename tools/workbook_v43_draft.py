"""Writes the v4.3 draft rows into data/Airline-World-Workbook.xlsx (Change Request 5: airline identity, paint shop, showroom).

    python3 tools/workbook_v43_draft.py

Adds, once (it is safe to run again):
- a Livery sheet: the paint palette, stripe styles, tail symbols, logo shapes and plane-name suggestions;
- Aircraft columns artworkId, photoFile, photoCredit, photoLicence, photoSource (before status);
- Settings keys blockedFlightCodes, soundDefault, revealSeconds;
- a README line for v4.3.
Fable owns the workbook: these rows are a draft for Fable to adopt or change (see docs/CR5-Report-Back.md).
"""
import copy, sys
from pathlib import Path
import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment

BOOK = Path(__file__).resolve().parent.parent / 'data' / 'Airline-World-Workbook.xlsx'
LIVE = PatternFill('solid', fgColor='FFE8F7EE')
wb = openpyxl.load_workbook(BOOK)
head_cell = wb['Aircraft']['A1']

def style_header(ws, n):
    for c in range(1, n + 1):
        cell = ws.cell(row=1, column=c)
        cell.font = copy.copy(head_cell.font); cell.fill = copy.copy(head_cell.fill); cell.alignment = copy.copy(head_cell.alignment)

def live_row(ws, values):
    ws.append(values)
    for c in range(1, len(values) + 1): ws.cell(row=ws.max_row, column=c).fill = LIVE

changed = []

# ---------- Livery sheet ----------
if 'Livery' not in wb.sheetnames:
    ws = wb.create_sheet('Livery', index=wb.sheetnames.index('Catering') + 1)
    ws.append(['kind', 'id', 'name', 'value', 'notes', 'status']); style_header(ws, 6)
    rows = [
        ('colour', 'white', 'White', '#F4F6F8', 'Twelve-colour palette for every paintable layer and the logo (CR5).'),
        ('colour', 'navy', 'Navy', '#1B2A4A', ''), ('colour', 'red', 'Red', '#D7263D', ''), ('colour', 'orange', 'Orange', '#F46036', ''),
        ('colour', 'yellow', 'Yellow', '#F2C14E', ''), ('colour', 'green', 'Green', '#2E8B57', ''), ('colour', 'teal', 'Teal', '#1B998B', ''),
        ('colour', 'sky', 'Sky', '#3FA7D6', ''), ('colour', 'purple', 'Purple', '#6A4C93', ''), ('colour', 'pink', 'Pink', '#E56399', ''),
        ('colour', 'silver', 'Silver', '#A9B4C2', ''), ('colour', 'black', 'Black', '#1E1E24', ''),
        ('stripe', 'none', 'None', '', 'Stripe styles along the fuselage, in the second colour.'),
        ('stripe', 'thin', 'Thin line', '', ''), ('stripe', 'band', 'Bold band', '', ''), ('stripe', 'swoosh', 'Swoosh', '', ''),
        ('tail', 'stripe', 'Stripe', '', 'Tail-fin symbols, in the second colour. "logo" draws the airline logo on the fin.'),
        ('tail', 'star', 'Star', '', ''), ('tail', 'chevron', 'Chevron', '', ''), ('tail', 'wave', 'Wave', '', ''),
        ('tail', 'circle', 'Circle', '', ''), ('tail', 'arrow', 'Arrow', '', ''), ('tail', 'logo', 'Your logo', '', ''),
        ('logoShape', 'square', 'Square', '', 'Logo backgrounds: shape × symbol (the tail set) × two colours.'),
        ('logoShape', 'circle', 'Circle', '', ''), ('logoShape', 'shield', 'Shield', '', ''), ('logoShape', 'fin', 'Tail fin', '', ''),
        ('planeName', 'spirit', 'Spirit of Wales', '', 'Tap-to-use suggestions on the Name it tab; four are offered at a time.'),
        ('planeName', 'cloud', 'Cloud Runner', '', ''), ('planeName', 'dragon', 'Red Dragon', '', ''), ('planeName', 'hopper', 'Sky Hopper', '', ''),
        ('planeName', 'star', 'Morning Star', '', ''), ('planeName', 'severn', 'Severn Breeze', '', ''), ('planeName', 'comet', 'Little Comet', '', ''),
        ('planeName', 'wren', 'Jenny Wren', '', ''),
    ]
    for r in rows: live_row(ws, list(r) + ['live'])
    ws.append([]); ws.append(['Note: the game reads live rows only. Colours are hex; stripe, tail and logoShape ids match the artwork layers; planeName ids are only there so a row can be referred to.'])
    for col, w in zip('ABCDEF', (11, 11, 18, 11, 70, 9)): ws.column_dimensions[col].width = w
    changed.append('Livery sheet')

# ---------- Aircraft columns ----------
ws = wb['Aircraft']
header = [c.value for c in ws[1]]
if 'artworkId' not in header:
    st = header.index('status') + 1
    ws.insert_cols(st, 5)
    for i, h in enumerate(['artworkId', 'photoFile', 'photoCredit', 'photoLicence', 'photoSource']): ws.cell(row=1, column=st + i, value=h)
    style_header(ws, ws.max_column)
    art = {'dhc6': 'dhc6', 'saab340': 'sf34', 'atr72': 'at72', 'e175': 'e175', 'e190': 'e190', 'a220': 'narrowbody', 'a320': 'narrowbody', 'b737': 'narrowbody'}
    for row in ws.iter_rows(min_row=2):
        pid = row[0].value
        if pid in art:
            row[st - 1].value = art[pid]
        for c in range(st - 1, st + 4):
            if row[0].fill and row[0].fill.fgColor and row[0].fill.fgColor.rgb not in (None, '00000000'): row[c].fill = copy.copy(row[0].fill)
    ws.cell(row=ws.max_row + 1, column=1, value='v4.3 draft (CR5): artworkId names the painted side-view drawing (narrowbody is a stand-in until the A220, A320 and 737 are drawn); photo* record the showroom photo: file name under src/opening/assets/photos, author, licence, source URL. Openly licensed only, plain or maker colours.')
    for col, w in zip(('N', 'O', 'P', 'Q', 'R'), (11, 22, 26, 14, 40)): ws.column_dimensions[col].width = w
    changed.append('Aircraft photo columns')

# ---------- Settings ----------
ws = wb['Settings']
keys = {r[0].value for r in ws.iter_rows(min_row=2)}
for k, v, note in (('blockedFlightCodes', 'BA, EZ, FR, VS, LH, AF, KL, U2', 'CR5. Real airline codes the pupil cannot pick; refused calmly ("That code belongs to a real airline, try another").'),
                   ('soundDefault', 'FALSE', 'CR5. Sound (take-off, airport chimes, announcements) is off until the teacher turns it on; a mute control sits in the top bar.'),
                   ('revealSeconds', 6, 'CR5. The hangar reveal on launch day: doors close, open, the plane rolls in. Later planes get about half.'),
                   ('practiceQuestionsPerDay', 0, 'Design note 8 Oct. Optional practice questions after the day\'s sums on the workings page, with the pupil\'s own numbers: 0, 1 or 3 (the teacher panel can change it).')):
    if k not in keys: live_row(ws, [k, v, note, 'live']); changed.append('Settings ' + k)

# ---------- README ----------
ws = wb['README']
texts = [str(r[0].value or '') for r in ws.iter_rows(min_row=1)]
for i, t in enumerate(texts):
    if t.startswith('SHEETS:') and 'Livery' not in t: ws.cell(row=i + 1, column=1, value=t + ' · Livery'); changed.append('README sheets line')
if not any('re-added by Claude Code' in t for t in texts):
    ws.cell(row=ws.max_row + 1, column=1, value='v4.3 + CR5 rows re-added by Claude Code (8 Oct): Fable\'s v4.3 did not carry the CR5 draft, so the Livery sheet, the Aircraft columns artworkId/photoFile/photoCredit/photoLicence/photoSource, and Settings blockedFlightCodes, soundDefault, revealSeconds are added again, plus practiceQuestionsPerDay (design note). The game reads crewMechanicFromDate (D51); the earlier draft key crewFromDate is dropped.')
    changed.append('README re-added line')
if not any(t.startswith('v4.3 draft') for t in texts):
    ws.cell(row=ws.max_row + 1, column=1, value='v4.3 draft (7 Oct, Claude Code, for Fable to adopt): Change Request 5. New sheet Livery (palette, stripes, tail symbols, logo shapes, plane-name suggestions); Aircraft columns artworkId and photoFile/Credit/Licence/Source; Settings blockedFlightCodes, soundDefault, revealSeconds. Everything the pupil chooses (airline name, flight code, logo, each plane\'s registration, name and livery) lives in the save state, not here.')
    changed.append('README v4.3 line')

if changed: wb.save(BOOK); print('written:', ', '.join(changed))
else: print('nothing to do: the v4.3 draft rows are already there')
