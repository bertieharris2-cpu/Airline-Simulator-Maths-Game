#!/usr/bin/env python3
"""A pupil's save (gubby airlines, code GY, from the week-at-a-time build of mid-October 2026) made ready for today's chapter-one game.

Bertie, 5 Nov 2026: "Send me the updated pupil save code. also do it for this one".
The save stops on Thu 12 Sep 2030 (day 11, week 2), on the crew-sickness card, before Thursday flies. He has flown Monday to
Wednesday of week 2 on his standing plan: one Twin Otter, Paris three times a day (09:00, 12:20, 15:40) at £90.
- The crew-sickness card is taken out: events are parked in chapter one. He carries on from Thursday with the rest of week 2
  on the Operations Wall, then today's Sunday accounts (Σ SUM, the average, Your week in pictures), then week 3.
- Monday's what-if sheet for week 2 (the P1 questions) is behind him; it isn't asked again.
- Everything else stays as he left it: cash £3,550.20, an empty tank, his record, his ½ star banked from advertising against
  Red Kite (he paid £300 for it), and Monday to Wednesday as he flew them (with his old snack money).
Usage: python3 tools/saves/ready_gy_week2.py  →  src/opening/tests/fixtures/pupil-GY-week2-ready-ASIM5.txt
"""
import base64, json
from pathlib import Path
FIX = Path(__file__).resolve().parent.parent.parent / 'src' / 'opening' / 'tests' / 'fixtures'
code = (FIX / 'pupil-GY-day11-ASIM5.txt').read_text().strip()
b = code.split('.', 1)[1]; b += '=' * (-len(b) % 4)
P = json.loads(base64.b64decode(b).decode('utf8'))
assert P['day'] == 11 and P['airline']['code'] == 'GY', 'not the GY save'
assert [s['t'] for s in P['steps']] == ['event', 'weekRun'] and P['wk']['dayDone'] == 10, 'not where the GY save stopped'
P['steps'] = [{'t':'weekRun'}]; P['si'] = 0
P['rnd']['event'] = None; P['rnd']['headline'] = None; P['rnd']['brief'] = [b for b in P['rnd'].get('brief', []) if b != 'Crew sickness.']
P['overlay'] = None
P['migrated'] = {'from':'week-at-a-time build of mid-October', 'savedDay':11, 'savedStep':'event', 'landedStep':'weekRun', 'landedDay':11,
  'notes':['Made ready by Claude Code, 5 Nov 2026: the crew-sickness card is taken out (events are parked in chapter one). He carries on from Thursday 12 September with the rest of week 2, then the Sunday accounts done the way the game does them now.',
           "Monday's what-if sheet for week 2 is behind him and isn't asked again.",
           "His ½ star from advertising against Red Kite stays banked: he paid £300 for it."]}
out = 'ASIM5.' + base64.b64encode(json.dumps(P, separators=(',', ':'), ensure_ascii=False).encode('utf8')).decode()
(FIX / 'pupil-GY-week2-ready-ASIM5.txt').write_text(out + '\n'); print(len(out), 'characters')
