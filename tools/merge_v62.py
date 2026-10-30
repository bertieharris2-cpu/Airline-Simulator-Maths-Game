#!/usr/bin/env python3
"""Merge Fable's workbook v6.2 (30 Oct 2026) into the game's workbook, keeping what Claude Code owns.

v6.2 was made from Fable's own copy of v6.1, which does not carry the rows and sheets Claude Code added from Bertie's
handovers of 19-21 Oct (SheetSums, ScreenText, BriefingData, the D105 Settings rows, the briefings as built). So this script
starts from data/Airline-World-Workbook.xlsx and applies v6.2's changes to it:

  * Settings: v6.2's new rows (hand-off 1); launchDaySums and fuelWeek1 as v6.2 has them; every other row as the game has it.
  * Briefings: v6.2's trigger, title, status and the new coworkNumber column; the beats stay as built; v6.2's new rows.
  * Calendar, ReviewQuestions: v6.2's rows (the day-1 words keep snacks out: snacks are parked).
  * Events, EventOptions, RouteNews, Catering, DailyColour: v6.2's status column (the parked chapter-one events).
  * PauseSchedule: the new sheet. README: v6.2's new lines.
  * Hand-off 2 (30 Oct, section 11): the Launch Day rows of SheetSums, a status column on SheetSums (the fuel order's sum
    retired, the flight-time sums and the mid-week event sums parked), the screens' words in ScreenText, the week-1 example
    profits and the fuel desk's opening day in Settings.

Usage: python3 tools/merge_v62.py <Airline-World-Workbook-v6.2.xlsx>   (then python3 tools/import_world.py)
"""
import sys
from copy import copy
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / 'data' / 'Airline-World-Workbook.xlsx'
if len(sys.argv) != 2: sys.exit(__doc__)
game = openpyxl.load_workbook(BOOK)
v62 = openpyxl.load_workbook(sys.argv[1])
done = []

def header(ws): return [c.value for c in ws[1]]
def last_row(ws, col=1):          # the last row of the table (a row with a status or a key in column 1, before the notes)
    n = 1
    for r in range(2, ws.max_row + 1):
        if ws.cell(r, col).value not in (None, ''): n = r
    return n
def style_from(ws, src_row, dst_row):
    for c in range(1, ws.max_column + 1):
        s, d = ws.cell(src_row, c), ws.cell(dst_row, c)
        if s.has_style: d.font, d.fill, d.border, d.alignment, d.number_format = copy(s.font), copy(s.fill), copy(s.border), copy(s.alignment), s.number_format
def rows_by_id(ws, col=1):
    out = {}
    for r in range(2, ws.max_row + 1):
        v = ws.cell(r, col).value
        if v not in (None, ''): out.setdefault(str(v), r)
    return out
def table_end(ws, col_status):   # the last row that has a status (the table), so new rows go above the note rows
    n = 1
    for r in range(2, ws.max_row + 1):
        if ws.cell(r, col_status).value not in (None, ''): n = r
    return n
def put(cell, v):                 # text that starts with '=' is words ("= B2 × B3"), not an Excel formula
    cell.value = v
    if isinstance(v, str) and v.startswith('='): cell.data_type = 's'
def insert_after(ws, at, values):
    ws.insert_rows(at + 1); style_from(ws, at, at + 1)
    for j, v in enumerate(values, start=1): put(ws.cell(at + 1, j), v)
    return at + 1

# ---------- Settings ----------
gs, ns = game['Settings'], v62['Settings']
gid, nid = rows_by_id(gs), rows_by_id(ns)
at = table_end(gs, 4)
for k, r in nid.items():
    if k not in gid and ns.cell(r, 4).value:
        at = insert_after(gs, at, [ns.cell(r, c).value for c in range(1, 5)]); done.append(f'Settings + {k}')
gid = rows_by_id(gs)
for k in ('launchDaySums', 'fuelWeek1'):
    for c in (2, 3): gs.cell(gid[k], c).value = ns.cell(nid[k], c).value
    done.append(f'Settings ~ {k} (v6.2)')
gs.cell(gid['fuelWeek1'], 3).value += (' 30 Oct 2026 (Claude Code): week 1\'s fuel is bought for him each day at the day\'s price (no tank, '
                                       'no premium): £1.20 a litre on Launch Day, in Total costs (fuelLaunchDay).')
def set_row(key, value, note, status='live'):
    global at
    g = rows_by_id(gs)
    if key in g: r = g[key]; gs.cell(r, 2).value, gs.cell(r, 3).value, gs.cell(r, 4).value = value, note, status
    else: at = insert_after(gs, table_end(gs, 4), [key, value, note, status])
    done.append(f'Settings = {key}')
set_row('fuelDeskOpensDay', 8, '30 Oct 2026 (v6.2): week 1\'s fuel is bought automatically at the day\'s price (fuelWeek1, fuelLaunchDay: '
        '£1.20 on Launch Day, in Total costs) and the Calendar opens the Fuel desk on day 8 ("FUEL DESK opens: visual introduction"). '
        'Was 1 (D105, 19 Oct: the desk from Launch Day, the first order paid on Wednesday, Monday and Tuesday free). DESIGN.md (30 Oct) '
        'still says "unlocked from Launch Day": flagged in the 30 Oct report. Set 1 to open it on Launch Day again.')
g = rows_by_id(gs); gs.cell(g['snacksInYearOne'], 3).value = (str(gs.cell(g['snacksInYearOne'], 3).value or '') +
        ' 30 Oct 2026: superseded by snacksInGame (v6.2, parked); the game reads snacksInGame first.')
set_row('week1ExampleProfits', '1250|1300|1150', 'Hand-off 2, 30 Oct 2026, section 2: the made-up profits Finance adds up in week 1\'s '
        'example (Monday, Tuesday, Wednesday → £3,700), in the example look ("EXAMPLE · MADE-UP NUMBERS"). Shown once.')
set_row('reviewExampleWeeks', 1, 'Hand-off 2, section 2: the example plays once, in this week\'s Sunday review (week 1).')

# ---------- Briefings ----------
gb, nb = game['Briefings'], v62['Briefings']
gh, nh = header(gb), header(nb)
if 'coworkNumber' not in gh:
    gb.cell(1, len(gh) + 1).value = 'coworkNumber'; style_from(gb, 1, 1); gh.append('coworkNumber')
    gb.cell(1, len(gh)).font = copy(gb.cell(1, len(gh) - 1).font); gb.cell(1, len(gh)).fill = copy(gb.cell(1, len(gh) - 1).fill)
gi, ni = rows_by_id(gb), rows_by_id(nb)
col = lambda h, name: h.index(name) + 1
keep_trigger = {'full_route', 'cabin_sales'}          # the game's trigger cells carry the 20 Oct retirement notes
for k, r in ni.items():
    if not nb.cell(r, col(nh, 'status')).value: continue
    if k in gi:
        g = gi[k]
        for name in ('trigger', 'title', 'status', 'coworkNumber'):
            if name == 'trigger' and k in keep_trigger: continue
            gb.cell(g, col(gh, name)).value = nb.cell(r, col(nh, name)).value
        done.append(f'Briefings ~ {k}')
    else:
        at = insert_after(gb, table_end(gb, col(gh, 'status')), [None] * len(gh))
        for name in nh:
            gname = 'beat2 (no guesses since 19 Oct: what plays instead)' if name.startswith('beat2') else name
            if gname in gh: gb.cell(at, col(gh, gname)).value = nb.cell(r, col(nh, name)).value
        done.append(f'Briefings + {k}')

# ---------- Calendar ----------
gc, nc = game['Calendar'], v62['Calendar']
gch, nch = header(gc), header(nc)
gci, nci = rows_by_id(gc), rows_by_id(nc)
for k, r in nci.items():
    if k not in gci: continue
    for j, name in enumerate(nch, start=1):
        if name not in gch: continue
        a, b = gc.cell(gci[k], gch.index(name) + 1), nc.cell(r, j)
        if a.value == b.value: continue
        if k == '1' and name == 'headline 1': continue                                  # keep the game's words (no snacks)
        v = b.value
        if k == '1' and name == 'unlocks': v = str(v).replace('fare, snacks, modelling tool', 'fare, modelling tool')
        a.value = v; done.append(f'Calendar ~ day {k} {name}')

# ---------- status columns ----------
for name in ('Events', 'EventOptions', 'RouteNews', 'Catering', 'DailyColour', 'Upgrades'):
    g, n = game[name], v62[name]
    gh_, nh_ = header(g), header(n)
    sc_g, sc_n = gh_.index('status') + 1, nh_.index('status') + 1
    # EventOptions repeats an event id per option: walk the rows in order
    if name == 'EventOptions':
        for r in range(2, min(g.max_row, n.max_row) + 1):
            if g.cell(r, 1).value == n.cell(r, 1).value and g.cell(r, 2).value == n.cell(r, 2).value and g.cell(r, sc_g).value != n.cell(r, sc_n).value:
                g.cell(r, sc_g).value = n.cell(r, sc_n).value; done.append(f'{name} ~ {g.cell(r, 1).value}/{g.cell(r, 2).value} status')
        continue
    ni_ = rows_by_id(n)
    for r in range(2, g.max_row + 1):            # every row with the id (an event can have more than one row)
        k = g.cell(r, 1).value
        if k in (None, '') or str(k) not in ni_: continue
        v = n.cell(ni_[str(k)], sc_n).value
        if v and g.cell(r, sc_g).value != v: g.cell(r, sc_g).value = v; done.append(f'{name} ~ {k} status')

# ---------- ReviewQuestions ----------
gq, nq = game['ReviewQuestions'], v62['ReviewQuestions']
gqi, nqi = rows_by_id(gq), rows_by_id(nq)
for k, r in nqi.items():
    if str(k).startswith('D100'): continue
    vals = [nq.cell(r, c).value for c in range(1, nq.max_column + 1)]
    if k in gqi:
        for c, v in enumerate(vals, start=1): gq.cell(gqi[k], c).value = v
        done.append(f'ReviewQuestions ~ {k}')
    else:
        last = max(rr for kk, rr in rows_by_id(gq).items() if not str(kk).startswith('D100'))
        insert_after(gq, last, vals); done.append(f'ReviewQuestions + {k}')

# ---------- PauseSchedule ----------
if 'PauseSchedule' not in game.sheetnames:
    src = v62['PauseSchedule']; dst = game.create_sheet('PauseSchedule', game.sheetnames.index('ReviewQuestions') + 1)
    for row in src.iter_rows():
        for c in row:
            d = dst.cell(c.row, c.column); d.value = c.value
            if c.has_style: d.font, d.fill, d.border, d.alignment, d.number_format = copy(c.font), copy(c.fill), copy(c.border), copy(c.alignment), c.number_format
    for k, dd in src.column_dimensions.items(): dst.column_dimensions[k].width = dd.width
    done.append(f'PauseSchedule sheet ({src.max_row - 1} rows)')

# ---------- README ----------
gr, nr = game['README'], v62['README']
have = {str(gr.cell(r, 1).value) for r in range(1, gr.max_row + 1)}
for r in range(1, nr.max_row + 1):
    v = nr.cell(r, 1).value
    if v and str(v).startswith('v6.2') and str(v) not in have:
        n = gr.max_row + 1; gr.cell(n, 1).value = v; style_from(gr, n - 1, n); done.append('README + ' + str(v)[:40])
note = ('30 Oct 2026 (Claude Code, Fable\'s hand-off 1 and Bertie\'s hand-off 2): v6.2 merged into the game\'s workbook with '
        'tools/merge_v62.py. Kept: SheetSums, ScreenText, BriefingData and the 19-21 Oct Settings rows. SheetSums gains a status column '
        '(the fuel order\'s sum retired; the flight-time and event sums parked) and the Launch Day rows of hand-off 2 (how = watch: '
        'Finance works it out while he watches); ScreenText gains the words of the Question Signal, the week-1 example, Σ SUM in week 2, '
        'Launch Day, the what-if sheet, the Fuel desk order, the timetable and the Briefings shelf. Settings fuelDeskOpensDay = 8 '
        '(v6.2: week 1\'s fuel bought for him).')
if note not in have:
    n = gr.max_row + 1; gr.cell(n, 1).value = note; style_from(gr, n - 1, n); done.append('README + 30 Oct note')

# ---------- SheetSums (hand-off 2, section 4; hand-off 1, sections 2 and 5) ----------
ss = game['SheetSums']; sh = header(ss)
if 'status' not in sh:
    ss.cell(1, len(sh) + 1).value = 'status'; ss.cell(1, len(sh) + 1).font = copy(ss.cell(1, len(sh)).font); ss.cell(1, len(sh) + 1).fill = copy(ss.cell(1, len(sh)).fill); sh.append('status')
S_ = {n: sh.index(n) + 1 for n in sh}
def ss_rows():
    out = []
    for r in range(2, ss.max_row + 1):
        if ss.cell(r, 1).value and ss.cell(r, 2).value: out.append(r)
    return out
for r in ss_rows():
    sheet_, cell_, row_ = ss.cell(r, 1).value, str(ss.cell(r, 2).value), str(ss.cell(r, 3).value)
    st = 'live'
    if sheet_ == 'Fuel desk': st = 'retired (hand-off 1, 30 Oct: the fuel purchase sum is removed; he still chooses blocks)'
    elif str(sheet_).startswith('Flight times'): st = 'parked (flightTimeSums, 30 Oct)'
    elif sheet_ == 'Event sums': st = 'parked (midweekQuestions = false and the one-off events parked, 30 Oct)'
    elif sheet_ == 'Launch Day' and row_.startswith('Cabin'): st = 'parked (snacksInGame = false)'
    if not ss.cell(r, S_['status']).value: ss.cell(r, S_['status']).value = st
# the Launch Day rows, rewritten for watch - do - watch - compare
LD = [
    ('Launch Day', 'B4', 'Ticket revenue', '= B2 × B3', 'Passengers × Fare', 'ƒ', 'watch', '', 'launch.watch',
     'Hand-off 2, section 4 (30 Oct 2026): Finance works out the first fare (Dublin at £80) while he watches: the watch panel with Bertie\'s long multiplication grid, "£80 is 8 × 10. First work out 38 × 8." … "Then multiply by 10". Not counted. The fares come from Settings launchDayFares.', 'live'),
    ('Launch Day', 'C4', 'Ticket revenue', '= C2 × C3', 'Passengers × Fare', 'pupil', 'book', 1, 'launch.tickets',
     'Fare 2 (Dublin at £90): his, on paper (Sum 1). The gold paper signal under C4, over the empty cells of rows 5-9.', 'live'),
    ('Launch Day', 'D4', 'Ticket revenue', '= D2 × D3', 'Passengers × Fare', 'ƒ', 'watch', '', 'launch.watch',
     'Fare 3 (Dublin at £100): Finance again, in the watch panel ("£100 is 1 × 100. First work out 38 × 1 = 38." "Then multiply by 100").', 'live'),
    ('Launch Day', 'E4', 'Ticket revenue', '= E2 × E3', 'Passengers × Fare', 'ƒ', 'airline', '', '',
     'Paris at £90 fills itself (ƒ).', 'live'),
    ('Launch Day', 'F7', 'Fuel burned', '= litres × price', '600 L at £1.20', 'ƒ', 'airline', '', '',
     'Hand-off 1 section 5 and hand-off 2 section 4 (fuelLaunchDay): the fuel burned that day at the launch price, £1.20 a litre, in Total costs. The label note reads "600 L at £1.20" (the plan\'s litres and the Calendar\'s price). "Free on Launch Day" is retired.', 'live'),
    ('Launch Day', 'F9', 'Profit', '= F5 − F8', 'Total revenue − Total costs', 'ƒ', 'airline', '', '',
     'Hand-off 2: "Finance has totted up your plan, fuel included." Not one of Launch Day\'s two questions (PauseSchedule).', 'live'),
    ('Launch Day', 'B13', 'Ticket revenue (One flight, two ways)', '= B11 × B12', 'Passengers on one flight × Fare', 'pupil', 'book', 2, 'launch.compare',
     'Hand-off 2 section 4: One flight, two ways. 14 at £130 (Settings launchDayComparison): his, on paper (Sum 2). The gold signal to the right of the lit block, pointer left; never over column F.', 'live'),
    ('Launch Day', 'C13', 'Ticket revenue (One flight, two ways)', '= C11 × C12', 'Passengers on one flight × Fare', 'ƒ', 'airline', '', '',
     '19 at £90 fills itself (ƒ, £1,710).', 'live'),
]
old_ld = [r for r in ss_rows() if ss.cell(r, 1).value == 'Launch Day' and not str(ss.cell(r, 3).value).startswith('Cabin')]
for r in sorted(old_ld, reverse=True): ss.delete_rows(r)
first = min(ss_rows()) if ss_rows() else 2
for i, vals in enumerate(LD):
    ss.insert_rows(first + i); style_from(ss, first + i + 1, first + i)
    for j, v in enumerate(vals, start=1): put(ss.cell(first + i, j), v)
done.append(f'SheetSums: Launch Day rows rewritten ({len(LD)}), status column')
for r in ss_rows():
    if ss.cell(r, 1).value == 'Sunday review' and str(ss.cell(r, 2).value) == 'B11':
        ss.cell(r, S_['notes']).value = str(ss.cell(r, S_['notes']).value or '') + ' 30 Oct 2026 (hand-off 1): not in week 1; asked about every third pause from the end of week 4 (differenceCadence).'
    if ss.cell(r, 1).value == 'Sunday review' and str(ss.cell(r, 2).value) == 'B9':
        put(ss.cell(r, S_['formula']), '= B2 + B3 + … + B8 (week 1; week 2 first) · =SUM(B2:B8) with Σ SUM (shown in week 2, from week 3 only)')
        ss.cell(r, S_['notes']).value = str(ss.cell(r, S_['notes']).value or '') + ' 30 Oct 2026 (spreadsheetLadder): week 1 click (after Finance\'s example); week 2 click, then shown Σ SUM; from week 3 drag only. Not counted (formulaCellsCount = false).'

# ---------- ScreenText (hand-off 2) ----------
st_ = game['ScreenText']; th = header(st_)
T = [
 # id, screen, eyebrow, title, text, button, notes
 ('signal.build', 'Question Signal: Build it on the sheet (header strip)', 'BUILD IT ON THE SHEET', '', 'Nothing to write in your book.', '', 'Hand-off 2 section 1 (30 Oct 2026). Cyan strip with the 3 × 3 grid icon. The question, what to do and what happens come from the sum\'s own row.'),
 ('signal.paper', 'Question Signal: Work it out on paper (header strip)', 'WORK IT OUT ON PAPER', '', 'Work it out in your book. Write [SUM {n}] beside it.|Then type your answer in **{cell}** and press [Enter].', '', 'Gold strip with the pencil icon. [SUM n] is the Sum box; [Enter] is drawn as a key.'),
 ('signal.done', 'Question Signal: the small green callout at a finished answer cell', '', '', '✓ Done: {what}', '', 'Pointer left. No Done panel.'),
 ('line.paper', 'Under a sheet: a paper question', '', '', 'Type your answer in {cell}, then press Enter.', 'Give me a hint', 'The line stays short; the signal carries the instruction.'),
 ('line.build', 'Under a sheet: a build question (the week\'s total)', '', '', 'Click each day, Monday to Sunday, then press Enter.', 'Give me a hint', ''),
 ('review.example.sub', 'Week 1 accounts, the example: the subtitle', '', '', 'First, watch how it works with made-up numbers.', '', 'Section 2. Once, week 1 only (Settings reviewExampleWeeks).'),
 ('review.example.label', 'Week 1 accounts, the example: the label on the frame', 'EXAMPLE · MADE-UP NUMBERS', '', '', '', 'The example look (DESIGN.md).'),
 ('review.example.watch', 'Week 1 accounts, the example: the build signal while Finance clicks', 'EXAMPLE · WATCH', 'Watch: adding up Monday to Wednesday', 'Finance clicks each day\'s profit. The cell names go into the formula. Then Finance presses [Enter] and the sheet adds them up.', '', ''),
 ('review.example.done', 'Week 1 accounts, the example: the build signal when the sheet has added them', 'EXAMPLE · WATCH', 'That\'s how it works', 'Click each day\'s profit, press [Enter], and the sheet does the adding.|**Now you: the whole week, Monday to Sunday, with your real numbers.**', 'My turn ▶', ''),
 ('review.example.line', 'Week 1 accounts, the example: the line under the sheet', '', '', 'Watch: Finance clicks Monday, Tuesday, then Wednesday.', '', ''),
 ('review.example.lineDone', 'Week 1 accounts, the example: the line when it is added', '', '', '✓ Monday to Wednesday: {total}. The sheet added them up.', '', ''),
 ('review.total.signal', 'Sunday review: the build signal at Profit this week (clicking)', '', 'Profit this week', 'Click each day\'s profit, Monday to Sunday. Then press [Enter].|The sheet adds them up.', '', 'Weeks 1 and 2.'),
 ('review.total.count', 'Sunday review: the line while he clicks the days', '', '', '{n} of {days} days. Keep going down to {last}.', '', ''),
 ('review.total.clickDone', 'Sunday review, week 2: the line after he has clicked and added', '', '', '✓ You added the week: {total}. Now try the quicker way.', '', 'Section 3.'),
 ('review.sumSkill', 'Sunday review, week 2: the Sheet Callout that shows Σ SUM (pointer left, beside the sheet)', 'NEW SKILL · SUM', 'There\'s a quicker way', 'You added the {days} days by clicking each one. Spreadsheets have a shortcut for a whole column.|Press **Σ SUM**, drag down the **Profit** column from {first} to {last}, then press [Enter].', 'Try it', 'Section 3 (30 Oct 2026: shown in week 2, replacing the 21 Oct callout in week 3). Try it clears B9 and adds the Σ SUM key.'),
 ('review.sum.signal', 'Sunday review, week 2: the build signal while he uses Σ SUM', '', 'Profit this week, the quick way', 'Let go on {lastDay}\'s profit. Then press [Enter] to finish the formula.|The sheet adds the whole column.', '', ''),
 ('review.sum.signal3', 'Sunday review from week 3: the build signal (Σ SUM only, no callout)', '', 'Profit this week', 'Press **Σ SUM**, drag down the Profit column from {first} to {last}, then press [Enter].|The sheet adds the whole column.', '', ''),
 ('review.sum.done', 'Sunday review, week 2: the line after the drag', '', '', '✓ Same answer, **{total}**, in one drag. From next week, use Σ SUM. Now the average a day.', '', ''),
 ('review.average.signal', 'Sunday review: the build signal at Average a day', '', 'Average a day', 'Click **Profit this week**, press **÷**, click **Days flown**. Then press [Enter].|The sheet works it out.', '', ''),
 ('review.done.total', 'Sunday review: the green callout at Profit this week', '', '', '✓ Done: **{total}** profit for the week', '', ''),
 ('review.done.average', 'Sunday review: the green callout at Average a day', '', '', '✓ Done: about **{mean}** a day', '', ''),
 ('review.done.line', 'Sunday review: the line when the accounts are done', '', '', '✓ Week {n}\'s accounts are done.', '', 'The footer\'s Plan week n ▶ appears only now.'),
 ('launch.watch', 'Launch Day: the watch panel (fares Finance works out)', 'FINANCE WORKS IT OUT · WATCH', '', '', 'Your turn ▶', 'Section 4. The method lines are made from the numbers: "£{fare} is {d} × {mult}. First work out {p} × {d}." · the carry line · "{p} × {d} = {part}." · "Then multiply by {mult}: {part} × {mult} = {result}. Ticket revenue {money}." Never "take the 0 off".'),
 ('launch.watch.footer', 'Launch Day: the footer while Finance works out the first fare', '', '', 'Launch Day · watch Finance work out the first fare, {route} at £{fare}.', 'Your turn ▶', ''),
 ('launch.paper', 'Launch Day: the paper signal for his fare', '', '{route} at £{fare}: the ticket revenue', '', '', 'The question; the paper lines come from signal.paper.'),
 ('launch.compare.head', 'Launch Day: the new rows\' sub-block header', 'NEW ROWS', 'One flight, two ways', '', '', 'Columns "{p} at £{fare}". Rows: Passengers on one flight · Fare · Ticket revenue.'),
 ('launch.compare', 'Launch Day: the paper signal for One flight, two ways', '', 'One flight, two ways: which earns more?', 'Work out the ticket revenue for {p} passengers at £{fare} in your book. Write [SUM {n}] beside it.|Then type your answer in **{cell}** and press [Enter].', '', 'To the right of the lit block, pointer left; never over column F.'),
 ('launch.compare.footer', 'Launch Day: the footer at the last question', '', '', 'Launch Day · the last question. Finance has totted up your plan, fuel included.', '', ''),
 ('launch.fuel', 'Launch Day: the Fuel burned row\'s label note', '', '', '{litres} at {price}', '', 'fuelLaunchDay.'),
 ('whatif.title', 'What-if fare sheet: the title and crumb', '', 'What if you change a fare?', 'Plan week {n}', '', 'Section 5. From week 2. Free to try, no sums.'),
 ('whatif.first', 'What-if fare sheet: the first visit\'s Sheet Callout (under the sheet, pointer up at the fares)', 'NEW · WHAT IF', 'Try a fare before you set it', 'Press **−** or **+** on a fare. Who wants to fly, seats filled, ticket revenue and profit all work themselves out (ƒ). Nothing to write in your book. When you like what you see, press **Set my fares**.', 'Got it', 'Once.'),
 ('whatif.changed', 'What-if fare sheet: the panel after a change', 'WHAT CHANGED, AGAINST THE FARES YOU HAVE NOW', '', '', '↶ Back to my fares', ''),
 ('whatif.footer', 'What-if fare sheet: the footer', '', '', 'Plan week {n} · try fares before you set them.', 'Set my fares ▶', ''),
 ('fuel.order', 'Fuel desk: the Your order panel', 'YOUR ORDER', '', '', '', 'Section 6. Cost (ƒ) and Cash after this order; the bar with the reserve mark.'),
 ('fuel.order.above', 'Fuel desk: under the bar, above the reserve', '', '', '✓ Above your {reserve} reserve', '', 'green'),
 ('fuel.order.below', 'Fuel desk: under the bar, below the reserve', '', '', '! Below your {reserve} reserve', '', 'amber: a warning, never a block'),
 ('fuel.position.tag', 'Fuel desk: the tag on Your position while blocks are chosen', 'WITH THIS ORDER', '', '', '', ''),
 ('tt.first', 'Full-width timetable: the first-time note under the lane (pointer up at the block)', 'NEW · MORE ROOM TO PLAN', 'Drag flights where you want them', 'Grab a flight by its dots and drag it along the day. Drag a route from **Add a flight** onto a plane to add one. The people above show who each flight can catch. **☰ Show menu** brings the menu back.', 'Got it', 'Section 7. Once.'),
 ('tt.tray', 'Full-width timetable: the tray under the lanes', '', 'Add a flight', 'drag one onto a plane', '', ''),
 ('tt.fits', 'Full-width timetable: under the lane while dragging, it fits', '', '', '✓ Fits · leaves {dep}, back {back}', '', ''),
 ('tt.cannot', 'Full-width timetable: under the lane, a flight that cannot fit', '', '', '! Leaving at {dep}, it would be back at {back}, after the day ends at {close}.', '', ''),
 ('tt.key', 'Full-width timetable: the key\'s last line', '', '', 'Flights snap to the quarter hour · the day runs {open} to {close}', '', ''),
 ('shelf', 'Briefings shelf (teacher test mode)', '', 'Briefings', 'Teacher test mode: watch any briefing. Nothing here goes in the pupil\'s record or changes the game.', '◀ Back to the game', 'Section 8.'),
 ('build.end', 'The end of the test build (buildEndsAfterChapter = 1)', 'TEST BUILD', 'End of chapter one', 'End of chapter one. This test build stops here.', '', 'Hand-off 1 section 0.'),
]
ti = rows_by_id(st_)
# the 21 Oct tour's step 3 and the Σ SUM callout change words
for k, r in ti.items():
    if k == 'fuel.tour.3': st_.cell(r, th.index('text') + 1).value = 'choose how many blocks to buy, then check the cash you\'ll have left.'; st_.cell(r, th.index('notes') + 1).value = 'Hand-off 2 section 6 (30 Oct 2026): there is no order sheet; this step points at the order panel.'
for vals in T:
    ti = rows_by_id(st_)
    if vals[0] in ti:
        for j, v in enumerate(vals, start=1): st_.cell(ti[vals[0]], j).value = v
    else:
        last = max(r for k, r in ti.items() if ' ' not in k)
        insert_after(st_, last, list(vals))
done.append(f'ScreenText: {len(T)} rows (hand-off 2)')

game.save(BOOK)
print('\n'.join(done))
print(f'{len(done)} changes; saved {BOOK}')
