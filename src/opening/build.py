"""Builds airline-opening-prototype.html from the parts in this folder.

    python3 src/opening/build.py

Checks every JSON data block and the JavaScript syntax (node --check), and lists in
overrides.txt every function defined in more than one part (a later part wins).
"""
import re, json, subprocess, os, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
r = lambda *p: open(os.path.join(HERE, *p), encoding='utf-8').read()
p2 = r('parts', 'p2_data.html').replace('<!--DEFS-->', r('assets', 'flags.svg').strip())
p3 = r('parts', 'p3_html.html').replace('<!--LAND-->', '            ' + r('assets', 'land.svg').strip()).replace('<!--BORDERS-->', '            ' + r('assets', 'borders.svg').strip())
head = r('parts', 'p1_head.html')
JS = ['p4a_core.js', '../engine/world-engine.js', 'p4a2_workbook.js', 'p4b_control.js', 'p4d_opening.js', 'p4e_toolkit.js', 'p4f_campaign.js', 'p4g_opening2.js', 'p4h_world.js', 'p4c_display.js']
out = head + p2 + p3 + ''.join(r('parts', f) for f in JS)
seen = {}
for f in JS:
    for n in re.findall(r'^function\s+(\w+)\s*\(', r('parts', f), re.M): seen.setdefault(n, []).append(f)
dups = {n: fs for n, fs in seen.items() if len(fs) > 1}
open(os.path.join(HERE, 'overrides.txt'), 'w').write('\n'.join(f'{n}: {" -> ".join(fs)}' for n, fs in sorted(dups.items())) + '\n')
print(len(dups), 'functions overridden by a later part (see overrides.txt)')
for m in re.finditer(r'<script type="application/json" id="([^"]+)">(.*?)</script>', out, re.S):
    json.loads(m.group(2))
js = re.search(r'<script>\n(.*)</script>\s*</body>', out, re.S).group(1)
with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as t: t.write(js)
subprocess.check_call(['node', '--check', t.name]); os.unlink(t.name)
open(os.path.join(ROOT, 'airline-opening-prototype.html'), 'w', encoding='utf-8').write(out)
print('built airline-opening-prototype.html,', len(out), 'bytes; JSON + syntax OK')
