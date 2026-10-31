#!/usr/bin/env python3
"""The hand-off "chapter one after the 17:37 play notes" (Claude Design, 31 Oct 2026, evening), on top of Fable's v6.6.

v6.6 is the game's workbook (Fable merged it from the game's own copy). This adds the rows the hand-off's screens need:
  - Settings: why27Callout (off, L3), launchExampleColumn (Fable's financeExampleFigures as the Launch Day sheet's rows),
    routeColourDefault, twoPlansMaxPlanes;
  - Routes: a colour column (the Before / after graph), Dublin, Paris and Frankfurt as the hand-off gives them;
  - Briefings: fare_lever is on the Briefings shelf only in chapter one (L2);
  - ScreenText: the words of the eight screens, as approved on Claude Design's pictures (status: Fable to check);
  - ScreenText changes.head.week1: "Today's plan" (hand-off section 4 and DESIGN.md), not v6.6's "Yesterday": the sheet is
    worked the evening the plan flew. Fable's word is kept in the row's notes.
Fable's other rows are left as they are (frankfurt.card's words lead the Frankfurt panel; its button "See Frankfurt ›" is
not used: the hand-off's one button is fra.eve.go).

Usage: python3 tools/merge_1737.py   (then python3 tools/import_world.py and python3 src/opening/build.py)
Running it again changes nothing more.
"""
from copy import copy
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / 'data' / 'Airline-World-Workbook.xlsx'
game = openpyxl.load_workbook(BOOK)
done = []
NOTE = 'Claude Code 31 Oct 2026, the 17:37 hand-off (Claude Design): approved wording from the screens; Fable to check'

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
def put_rows(ws, rows, key='id'):
    sh = header(ws); have = rows_by_id(ws)
    for vals in rows:
        k = vals[key]
        if k in have:
            r = have[k]
            for h, v in vals.items():
                c = ws.cell(r, sh.index(h) + 1)
                if c.value != v: c.value = v; done.append(f'{ws.title} ~ {k}')
        else:
            append(ws, [vals.get(h) for h in sh]); done.append(f'{ws.title} + {k}')

# ---------- Settings ----------
put_rows(game['Settings'], [
  {'Key': 'why27Callout', 'Value': 'off', 'Notes': 'Bertie 31 Oct (17:37, L3): the WHY 27? callout is dropped from the Launch Day sheet ("a lot more text… I don\'t want to overload them"). ScreenText why27 is kept, unused. on brings it back.', 'Status': 'live'},
  {'Key': 'launchExampleColumn', 'Value': 'revenue 900 | other 525 | fuel 120', 'Notes': "Claude Code 31 Oct: Fable's financeExampleFigures as the Launch Day sheet's rows for Finance's example column G (L5): Total revenue £900 (15 × £60); Other costs £525 (flying £300 + landing £150 + passenger charges £75); Fuel burned £120; Total costs £645; profit £255.", 'Status': 'live'},
  {'Key': 'routeColourDefault', 'Value': '#4a6f99', 'Notes': "Claude Code 31 Oct (17:37 hand-off, section 3): a route's colour on the Before / after graph when its Routes row has none.", 'Status': 'placeholder'},
  {'Key': 'twoPlansMaxPlanes', 'Value': 1, 'Notes': "Claude Code 31 Oct (17:37 hand-off, section 2): Two plans, then Choose is drawn for one plane (a lane a plan). With more planes the timetable keeps the old plan above the new one, until Claude Design draws two lanes a plan (hand-off section 10, Later).", 'Status': 'live'},
], key='Key')

# ---------- Routes: a colour column ----------
ws = game['Routes']; sh = header(ws)
if 'colour' not in sh:
    c = ws.max_column + 1; ws.cell(1, c).value = 'colour'
    s0 = ws.cell(1, c - 1)
    if s0.has_style: d = ws.cell(1, c); d.font, d.fill, d.border, d.alignment = copy(s0.font), copy(s0.fill), copy(s0.border), copy(s0.alignment)
    done.append('Routes + column colour'); sh = header(ws)
ci = sh.index('colour') + 1
for rid, col in {'dub': '#2d7f68', 'par': '#3b6aa8', 'fra': '#7a5aa8'}.items():
    r = rows_by_id(ws).get(rid)
    if r and ws.cell(r, ci).value != col: ws.cell(r, ci).value = col; done.append(f'Routes ~ {rid}.colour')

# ---------- Briefings: the fare briefing on the shelf only (L2) ----------
ws = game['Briefings']; sh = header(ws); r = rows_by_id(ws).get('fare_lever')
if r:
    c = ws.cell(r, sh.index('trigger') + 1); t = 'Briefings shelf only in chapter one (Bertie 31 Oct, 17:37 notes, L2: "Keep it in briefings, but remove it for now"). Was: Launch Day, the first time he sets a fare in the Studio'
    if c.value != t: c.value = t; done.append('Briefings ~ fare_lever.trigger')

# ---------- ScreenText ----------
T = [
  # (id, screen, eyebrow, title, text, button)
  ('changes.head.week1', 'Changes sheet, left column head, week 1', None, "Today's plan", None, None),
  # 1 · the Frankfurt evening
  ('fra.eve.more', 'Day page, the evening a new route is earned: the second sentence', None, None, 'Every flight covered its costs, and the seats were {fill}% full.', None),
  ('fra.eve.board', 'Day page, the evening a new route is earned: the departures board', None, 'DEPARTURES · TOMORROW', 'ON TIME|{city} · NEW', None),
  ('fra.eve.chips', 'Day page, the evening a new route is earned: the two chips', None, None, '{time} there and back|Further away: people pay more', None),
  ('fra.eve.rule', 'Day page, the evening a new route is earned: the line under it', None, None, '**Tomorrow, {date}.** Build a new plan with {city} beside today\'s plan, then choose which one flies.', None),
  ('fra.eve.small', 'Day page, the evening a new route is earned: the rule in small print', None, None, "It opens early after a day that made at least {pct}% of the most your plane could make, with every flight covering its costs and the seats at least {fill}% full.", None),
  ('fra.eve.footer', 'Day page, the evening a new route is earned: the footer and its one button', None, None, "{city} opens tomorrow. Plan tomorrow's flights.", 'Plan tomorrow with {city} ▶'),
  # 2 · two plans, then Choose
  ('tp.title', 'Two plans: the title and the line under it', None, 'Plan tomorrow: {date}', "{airline} HQ · today's plan stays for comparison · build a new one under it", None),
  ('tp.title.week', 'Two plans from week 2: the title and the line under it', None, 'Plan week {n}', "{airline} HQ · last week's plan stays for comparison · build a new one under it", None),
  ('tp.lane.old', "Two plans: the top lane's label (week 1 | from week 2)", None, None, "TODAY'S PLAN|Flew today|LAST WEEK'S PLAN|Flew last week", None),
  ('tp.lane.new', "Two plans: the new lane's label", None, None, 'NEW PLAN|For tomorrow|For this week|drag flights in', None),
  ('tp.drop', 'Two plans: the empty new lane', None, None, 'Drag a flight here', None),
  ('tp.choice', 'Two plans: the choice column (old | new | new while empty)', None, None, 'Profit a day · flew today|Profit a day · last week|Profit a day · projected|build it first', 'Choose ▶'),
  ('tp.compare', 'Two plans: the compare bar', 'COMPARE', None, "Today's plan|Last week's plan|New plan|Projected for tomorrow|Projected for this week", None),
  ('tp.footer', 'Two plans: the footer', None, None, 'Choose the plan that flies tomorrow.|Choose the plan that flies this week.', None),
  ('tp.tray', 'Two plans: the Add a flight tray', None, None, 'drag one onto the new plan', None),
  ('tp.co1', 'Two plans: first callout, under the new lane', 'NEW · TWO PLANS', 'Build a new plan for tomorrow', "Today's plan stays above to compare. Drag flights onto the new plan.", 'Got it'),
  ('tp.co2', 'Two plans: second callout, at the new plan\'s Choose', 'TWO PLANS', 'Choose the plan that flies tomorrow', "Today's: {old} a day. New: {new}. Press Choose beside the one you want.", 'Got it'),
  ('tp.co1.week', 'Two plans from week 2: first callout, under the new lane', 'NEW · TWO PLANS', 'Build a new plan for this week', "Last week's plan stays above to compare. Drag flights onto the new plan.", 'Got it'),
  ('tp.co2.week', "Two plans from week 2: second callout, at the new plan's Choose", 'TWO PLANS', 'Choose the plan that flies this week', "Last week's: {old} a day. New: {new}. Press Choose beside the one you want.", 'Got it'),
  # 3 · Before / after
  ('ba.title', 'Before / after: the title (week 1 | from week 2)', None, "Before / after: today's plan and your new plan", "Before / after: last week's plan and your new plan", None),
  ('ba.axis', 'Before / after: the graph', None, 'Profit a day', '{n} flights', None),
  ('ba.co1', 'Before / after, callout 1 of 4: the old bar', 'BEFORE / AFTER', "Today's plan", '{n} flights: {list}. It made {money} profit today.', 'Next ▸'),
  ('ba.co2', 'Before / after, callout 2 of 4: the new bar', 'BEFORE / AFTER', 'Your new plan', '{n} flights: {list}. It should make {money} profit a day.', 'Next ▸'),
  ('ba.co3', 'Before / after, callout 3 of 4: the new route (or the biggest change)', 'BEFORE / AFTER', "{city}'s {nf}", '{pax} passengers × {fare} = {tk} a day. After its costs, {city} makes {profit} a day{than}.', 'Next ▸'),
  ('ba.co1.week', 'Before / after from week 2, callout 1 of 4: the old bar', 'BEFORE / AFTER', "Last week's plan", '{n} flights a day: {list}. Flown again this week, it would make {money} profit a day.', 'Next ▸'),
  ('ba.co3.than.week', 'Before / after from week 2, callout 3: the comparison at its end', None, None, ': more than {old} would make', None),
  ('ba.co3.than', 'Before / after, callout 3: the comparison at its end', None, None, ': more than {old} made today', None),
  ('ba.co4', 'Before / after, callout 4 of 4: the difference a day', 'BEFORE / AFTER', 'The difference a day', 'Your new plan should make {money} {more} a day{fewer}. Next, the sheet shows where it comes from.', 'Work it out ▶'),
  ('ba.co4.fewer', 'Before / after, callout 4: with fewer flights', None, None, ', with one flight fewer| with {n} flights fewer', None),
  ('ba.table', 'Before / after: the small table', None, 'What changes, a day', "Flights|Passengers|Ticket revenue|Costs|Profit|Today's plan|Last week|New plan|Difference", None),
  ('ba.table.note', 'Before / after: the line under the small table', None, None, 'Finance filled this in from your two plans (ƒ). Nothing to work out here.', None),
  ('ba.bracket', 'Before / after: the label beside the bracket (callout 4)', None, None, '{money}|a day', None),
  ('ba.footer', 'Before / after: the footer', None, None, "Tomorrow's plan · see what changes before the sums.|This week's plan · see what changes before the sums.", None),
  # 4 · the Changes sheet
  ('chg3.crumb', 'Changes sheet: the crumbs (the new route | then a change)', None, None, 'Work out my plan · first, the new route|then, {city}', None),
  ('chg3.route', 'Changes sheet, the new route first: its callout (1 of n)', 'FIRST, {CITY}', '{city} takes the place of {was}', 'Your {n} {city} {flights} replace the {m} {was} {wflights}. Finance has filled them in (ƒ). {city} brings in {rev} {revmore} a day, and makes {profit} {profmore} profit.', 'Next: {next} ▸'),
  ('chg3.route.free', 'Changes sheet, the new route first: when it took free time', 'FIRST, {CITY}', '{city} uses time your plane had free', 'Your {n} {city} {flights} fly when your plane was on the ground. Finance has filled them in (ƒ). {city} brings in {rev} a day, and makes {profit} profit.', 'Next: {next} ▸'),
  ('chg3.route.line', 'Changes sheet, the new route first: the line under the sheet', None, None, '✓ Finance filled in {city}. Nothing to work out on this part.', None),
  ('chg3.route.rows', 'Changes sheet, the new route first: row labels', None, None, 'Passengers a day|Fare|Ticket revenue a day|Costs a day|Profit a day', None),
  ('chg3.diff', 'Changes sheet: What the Difference column means, before the demo (under the table)', 'NEW · YOUR CHANGE', 'What the Difference column means', '**Difference = With your change − {head}.**|{signs}|A minus means less. Watch Finance work out the first one.', 'Watch ▶'),
  ('chg3.diff.line', 'Changes sheet: the line under the table while the Difference callout is open', None, None, 'Read the note under the Difference column, then press **Watch**.', None),
  ('chg3.diff.sign', 'Changes sheet: the sentence in the Difference callout (the fare | any other row | higher | lower | up | down)', None, None, '**{v}** means the fare is {n} {dir}.|**{v}** means {lab} went {dir} by {n}.|higher|lower|up|down', None),
  ('chg3.head.diff', 'Changes sheet: the Difference column head', None, None, 'change − today\'s|change − last week|Difference', None),
  ('chg3.last', 'Changes sheet: the whole plan (the last part)', None, None, 'then, the whole plan', None),
  # 5 · Launch Day profit
  ('ld3.col', "Launch Day sheet: Finance's example column G", None, None, 'Finance · made-up|Example', None),
  ('ld3.job', 'Launch Day sheet: the profit step opens on this callout', 'LAUNCH DAY · THE PROFIT', 'Now the profit for your plan', 'Profit = Total revenue − Total costs. Finance shows you first, on made-up numbers in the example column. Then you work out yours.', 'Watch ▶'),
  ('ld3.line', 'Launch Day sheet: the line under the sheet while the profit callout waits', None, None, "Press **Watch** when you're ready.", None),
  ('ld3.mine', 'Launch Day sheet: his own profit (build signal)', None, "Your turn: your plan's profit", 'Click **Total revenue**, press **−**, click **Total costs**. Then press [Enter]. The sheet works it out.', None),
  ('ld3.footer', 'Launch Day sheet: the footer during the profit step (watch | his turn)', None, None, "Launch Day · Finance shows the profit on the example first.|Launch Day · now your plan's profit.", None),
  # 6 · week 1 Sunday
  ('wk1.co.add', 'Week 1 Sunday: the callout before Finance adds each day (1 of 2)', 'WEEK 1 ACCOUNTS', "One way to find the week's total profit: add each day", 'Finance shows you first, on made-up numbers. Then you add up your own week.', 'Watch ▶'),
  ('wk1.co.sum', 'Week 1 Sunday: the callout before Finance shows Σ SUM (2 of 2)', 'A SIMPLER WAY', "Here's a simpler way to do it in a spreadsheet: Σ SUM", "Finance shows you on the same made-up numbers. Then it's your turn on your week.", 'Watch ▶'),
  ('wk1.avg.watch', 'Week 1 Sunday: the signal while Finance works the average on the left sheet', 'WATCH', 'Watch: Finance works out the average a day', "Finance clicks **Profit this week**, presses **÷**, clicks **Days flown**, then presses [Enter]. Then it's your turn on the Σ SUM sheet.", None),
  ('wk1.avg.mine', 'Week 1 Sunday: the signal for his average on the right sheet', None, 'Your turn: the average a day', 'Click **Profit this week**, press **÷**, click **Days flown**, then press [Enter].', None),
  # 7 · week 2 what-if
  ('wi2.title', 'Week 2 what-if: the title and the crumb', None, 'What if you change a fare?', 'Plan week {n} · {date}', None),
  ('wi2.cols', 'Week 2 what-if: the column heads', None, None, 'your fare|what if|what if − yours|Difference', None),
  ('wi2.rows', 'Week 2 what-if: the row labels', None, None, 'Seats filled a day|Fare|Ticket revenue a day|A week (× 7)|A month (× {w} weeks)', None),
  ('wi2.co1', 'Week 2 what-if, callout 1 of 4: the question', 'NEW · WHAT IF', 'What if {city} were £{step} more?', 'People still fill all {seats} seats at {fare}. What would £{step} more on each ticket bring in? Finance shows you first, with your fare.', 'Watch ▶'),
  ('wi2.watch', "Week 2 what-if: the line while Finance works his fare's ticket revenue", None, None, 'Watch: Finance clicks **Seats filled**, presses **×**, clicks **Fare**, then presses [Enter].', None),
  ('wi2.q1', 'Week 2 what-if, 2 of 4: his turn, a day (paper, counted)', 'WHAT IF · 2 OF 4', 'What if: ticket revenue a day', '{seats} seats × {fare}.', None),
  ('wi2.q2', 'Week 2 what-if, 3 of 4: his turn, a week (paper, counted)', 'WHAT IF · 3 OF 4', 'A week: the difference', '{more} more a day, times 7.', None),
  ('wi2.co4', 'Week 2 what-if, callout 4 of 4: the month', 'A LITTLE ADDS UP', '£{step} more a ticket = {month} more a month', 'A day: {d}. A week: {w}. A month: {m}. Try other fares with − and +. Every figure works itself out.', 'Try other fares'),
  ('wi2.footer', 'Week 2 what-if: the footer (while working | done)', None, None, 'Plan week {n} · Finance first, then you.|Plan week {n} · try other fares, or set them.', 'Set my fares ▶'),
  # 8 · Home in week 2
  ('home.now.week', "Home: the NOW strip in weeks 2 to 5 (instead of 'Running a week at a time')", None, None, 'Week {n}: your plan flies again', None),
]
st = game['ScreenText']; sh = header(st); have = rows_by_id(st)
for k, screen, eb, ti, tx, bt in T:
    vals = {'id': k, 'screen': screen, 'eyebrow': eb, 'title': ti, 'text': tx, 'button': bt, 'notes': NOTE}
    if k == 'changes.head.week1':
        vals = {'id': k, 'title': ti, 'notes': "Claude Code 31 Oct: \"Today's plan\" from Claude Design's 17:37 hand-off (section 4) and DESIGN.md, approved by Bertie: the sheet is worked the evening the plan flew. v6.6 (Fable, T6) had \"Yesterday\"."}
    if k in have:
        r = have[k]
        for h, v in vals.items():
            c = st.cell(r, sh.index(h) + 1)
            if c.value != v: c.value = v; done.append(f'ScreenText ~ {k}')
    else:
        append(st, [vals.get(h) for h in sh]); done.append(f'ScreenText + {k}')

# ---------- README ----------
rd = game['README']
have = {str(rd.cell(r, 1).value or '') for r in range(1, rd.max_row + 1)}
mine = ("31 Oct 2026, late evening (Claude Code, Claude Design's hand-off 'chapter one after the 17:37 play notes'): Settings why27Callout, "
        "launchExampleColumn, routeColourDefault, twoPlansMaxPlanes; Routes colour (dub, par, fra); Briefings fare_lever on the shelf only; "
        "ScreenText fra.eve.*, tp.*, ba.*, chg3.*, ld3.*, wk1.co.*, wk1.avg.*, wi2.*, home.now.week (the screens' approved words, for Fable to check); "
        "changes.head.week1 'Today's plan' (the hand-off; v6.6 said 'Yesterday'). Script: tools/merge_1737.py.")
if mine not in have: append(rd, [mine]); done.append('README + Claude Code line')

game.save(BOOK)
print('\n'.join(dict.fromkeys(done)) or 'nothing to do')
