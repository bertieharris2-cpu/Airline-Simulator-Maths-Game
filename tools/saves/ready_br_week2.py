#!/usr/bin/env python3
"""A pupil's save (airline BR, chapter-one build of 22 Oct 2026, end of week 2) made ready for the chapter-one game of 2 Nov 2026.

Bertie, 2 Nov: "make what he has done work with new game even if you have to adjust figures and delete elements".
The save stops on Sun 15 Sep 2030 (day 14), after the week-2 accounts, on the "Weekdays and weekends" briefing.
- He goes back to the start of the week-2 Sunday accounts, done the way the game does them now (Σ SUM, then Your week in
  pictures). His week-2 total and average, done the old way (adding the days), are taken out of his record because he does
  them again; the difference from the plan is kept (today's week-2 sheet doesn't ask it).
- "Weekdays and weekends" (and its planner upgrade) comes at the week-3 review now, so the offer is cleared.
- The −1 star banked by the storm and crew-sickness events is cleared: those events are parked in chapter one.
- Everything else stays as he left it: airline, plane, timetable (Paris 06:00, Dublin 09:20 and 13:40, Paris 19:15),
  fares (Paris £90, Dublin £80), cash £22,618, 3,840 L of fuel in the tank, his record.
Usage: python3 tools/saves/ready_br_week2.py  →  src/opening/tests/fixtures/pupil-BR-week2-ready-ASIM5.txt
"""
import base64, json
from pathlib import Path
FIX = Path(__file__).resolve().parent.parent.parent / 'src' / 'opening' / 'tests' / 'fixtures'
code = (FIX / 'pupil-BR-week2-ASIM5.txt').read_text().strip()
b = code.split('.', 1)[1]; b += '=' * (-len(b) % 4)
P = json.loads(base64.b64decode(b).decode('utf8'))
assert P['day'] == 14 and P['airline']['code'] == 'BR', 'not the BR save'
P['steps'] = [{'t':'weekRun'}, {'t':'weekReview'}]; P['si'] = 1
P['wk']['rb'] = {k:{'tokens':[], 'ok':False, 'q':False, 'msg':''} for k in ('diff', 'tot', 'mean')}
P['upg'] = {}
P['repBank'] = 0; P['repLog'] = []
P['overlay'] = None
P['record']['entries'] = [e for e in P['record']['entries'] if not (e.get('day') == 14 and e.get('key') in ('rb:tot', 'rb:mean'))]
assert not P['record'].get('notes'), 'record notes point at entry ids'
for i, e in enumerate(P['record']['entries'], 1): e['id'] = f'r{i}'    # the record numbers its entries by count
P['migrated'] = {'from':'chapter-one build of 22 Oct', 'landedStep':'weekReview', 'landedDay':14,
  'notes':['Made ready by Claude Code, 2 Nov 2026: back on the week-2 Sunday accounts (Sun 15 Sep), done the way the game does them now (Σ SUM, then Your week in pictures). His old week-2 total and average are out of the record because he does them again.',
           'The "Weekdays and weekends" briefing comes at the week-3 review now, not week 2.',
           'The −1 star banked by the storm and crew-sickness events is cleared: those events are parked in chapter one.']}
out = 'ASIM5.' + base64.b64encode(json.dumps(P, separators=(',', ':'), ensure_ascii=False).encode('utf8')).decode()
(FIX / 'pupil-BR-week2-ready-ASIM5.txt').write_text(out + '\n'); print(len(out), 'characters')
