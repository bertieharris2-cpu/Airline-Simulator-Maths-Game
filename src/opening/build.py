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
# aircraft artwork (CR5): one side-view drawing per artworkId, kept as a <template> and painted by aircraftArt() in p4q_paint.js
import glob, base64
art = sorted(glob.glob(os.path.join(HERE, 'assets', 'aircraft', '*.svg')))
artwork = {os.path.basename(f)[:-4]: re.sub(r'<!--.*?-->\s*', '', open(f, encoding='utf-8').read(), flags=re.S).strip() for f in art}
p3 = p3.replace('<!--AIRCRAFT-->', '<script type="application/json" id="data-artwork">%s</script>' % json.dumps(artwork, separators=(',', ':')))
# showroom photos (CR5): every photo an Aircraft row names and that exists in assets/photos is embedded, so the game needs no internet
wbm = re.search(r'<script type="application/json" id="data-workbook">(.*?)</script>', p2, re.S)
photos, big = {}, []
if wbm:
    W = json.loads(wbm.group(1))
    for a in W.get('aircraft', []) + W.get('aircraftPreview', []):
        f = a.get('photoFile')
        if not f or f in photos: continue
        fp = os.path.join(HERE, 'assets', 'photos', f)
        if not os.path.exists(fp): continue
        raw = open(fp, 'rb').read(); ext = f.rsplit('.', 1)[-1].lower()
        photos[f] = 'data:image/%s;base64,%s' % ({'jpg': 'jpeg'}.get(ext, ext), base64.b64encode(raw).decode('ascii'))
        if len(raw) > 150 * 1024: big.append('%s (%d KB)' % (f, len(raw) // 1024))
p2 = p2.replace('<!--PHOTOS-->', '<script type="application/json" id="data-photos">%s</script>' % json.dumps(photos, separators=(',', ':')))
print(len(art), 'aircraft drawings;', len(photos), 'photos embedded' + ('; over 150 KB: ' + ', '.join(big) if big else ''))
head = r('parts', 'p1_head.html')
JS = ['p4a_core.js', '../engine/world-engine.js', 'p4a2_workbook.js', 'p4b_control.js', 'p4d_opening.js', 'p4e_toolkit.js', 'p4f_campaign.js', 'p4g_opening2.js', 'p4h_world.js', 'p4i_liveops.js', 'p4j_intro.js', 'p4k_chapter.js', 'p4l_handsums.js', 'p4m_fleet.js', 'p4n_weeks.js', 'p4o_review.js', 'p4p_identity.js', 'p4q_paint.js', 'p4c_display.js']
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
