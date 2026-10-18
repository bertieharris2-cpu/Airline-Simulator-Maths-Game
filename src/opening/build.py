"""Builds the game from the parts in this folder:

    airline-opening-prototype.html   the game: the revised Operating Plan Studio (p4ze + p1_head_studio2.css), Days (p4zf),
                                     chapter 2 (p4zg, p4zh, p4zj), the Working pad (p4zk) and, last, the Night Ops
                                     look (p4zz + p1_head_nightops.css). One file (Bertie, 13 Oct 2026).

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
# a photo dropped into assets/photos and named after the aircraft (sf34.jpg, saab340.jpg, e190.png, ...) is embedded under that stem, no workbook column needed
for fp in sorted(glob.glob(os.path.join(HERE, 'assets', 'photos', '*'))):
    f = os.path.basename(fp); stem, _, ext = f.rpartition('.'); ext = ext.lower()
    if ext not in ('jpg', 'jpeg', 'png', 'webp') or f in photos or stem in photos: continue
    raw = open(fp, 'rb').read(); photos[stem] = 'data:image/%s;base64,%s' % ({'jpg': 'jpeg'}.get(ext, ext), base64.b64encode(raw).decode('ascii'))
    if len(raw) > 150 * 1024: big.append('%s (%d KB)' % (f, len(raw) // 1024))
# Operations Briefings (D99): each piece in briefings/ is embedded whole, played in a frame over the game at its trigger
briefs = {os.path.basename(f): open(f, encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(HERE, 'briefings', '*.html')))}
p2 = p2 + '<script type="application/json" id="data-briefings">%s</script>' % json.dumps(briefs, separators=(',', ':')).replace('</', '<\\/')
# the briefings' shared kit (briefings/kit/): the game puts it into each page as it opens (a page opened on its own loads it from kit/)
kit = {k: open(os.path.join(HERE, 'briefings', 'kit', 'brief-kit.' + k), encoding='utf-8').read() for k in ('css', 'js')}
# the kit's flat art (Claude Design handover 18 Oct 2026, section 4): the scene pieces go in ahead of the kit as window.KIT_ART
kit_art = {os.path.splitext(os.path.basename(f))[0]: re.sub(r'<\?xml[^>]*>\s*', '', open(f, encoding='utf-8').read()).strip() for f in sorted(glob.glob(os.path.join(HERE, 'briefings', 'kit', 'art', 'pieces', '*.svg')))}
kit['js'] = 'window.KIT_ART=' + json.dumps(kit_art, separators=(',', ':')) + ';\n' + kit['js']
p2 = p2 + '<script type="application/json" id="data-briefing-kit">%s</script>' % json.dumps(kit, separators=(',', ':')).replace('</', '<\\/')
print(len(briefs), 'briefings embedded')
# the teacher's test toolkit (D102): Jump to… points on the Steady path, save codes the chapter tests write (tools/make_jumps.sh),
# each decoded and gzipped so the game stays small
import gzip
JUMP_LABELS = {1: 'Launch Day', 8: 'Week 2', 15: 'Week 3', 22: 'Week 4', 29: 'Week 5', 43: 'Week 7 (the fuel spike)', 57: 'Week 9',
               92: 'December', 127: 'January 2031', 274: 'June 2031 (Delhi)', 365: 'Chapter 3', 736: 'Chapter 4'}
jumps = {}
for f in sorted(glob.glob(os.path.join(HERE, 'tests', 'fixtures', 'jumps', 'day-*.txt'))):
    d = int(re.search(r'day-(\d+)', f).group(1)); code = open(f, encoding='utf-8').read().strip()
    if not code.startswith('ASIM5.'): continue
    raw = base64.b64decode(code[6:]).decode('utf-8')
    jumps['d%d' % d] = {'label': JUMP_LABELS.get(d, 'Day %d' % d), 'day': d, 'gz': base64.b64encode(gzip.compress(raw.encode('utf-8'), 9)).decode('ascii')}
p2 = p2 + '<script type="application/json" id="data-jumps">%s</script>' % json.dumps(jumps, separators=(',', ':'))
print(len(jumps), 'test airlines for Jump to… (%d KB)' % (sum(len(j['gz']) for j in jumps.values()) // 1024))
p2 = p2.replace('<!--PHOTOS-->', '<script type="application/json" id="data-photos">%s</script>' % json.dumps(photos, separators=(',', ':')))
print(len(art), 'aircraft drawings;', len(photos), 'photos embedded' + ('; over 150 KB: ' + ', '.join(big) if big else ''))
head = r('parts', 'p1_head.html')
JS = ['p4a_core.js', '../engine/world-engine.js', 'p4a2_workbook.js', 'p4b_control.js', 'p4d_opening.js', 'p4e_toolkit.js', 'p4f_campaign.js', 'p4g_opening2.js', 'p4h_world.js', 'p4i_liveops.js', 'p4j_intro.js', 'p4k_chapter.js', 'p4l_handsums.js', 'p4m_fleet.js', 'p4n_weeks.js', 'p4o_review.js', 'p4p_identity.js', 'p4q_paint.js', 'p4r_showroom.js', 'p4s_practice.js', 'p4t_workout.js', 'p4u_migrate.js', 'p4v_week.js', 'p4w_planner.js', 'p4x_shell.js', 'p4y_desks.js', 'p4z_model.js', 'p4zb_decisions.js', 'p4zc_signoffs.js', 'p4zd_studio.js', 'p4zi_record.js', 'p4c_display.js']
def build(name, js_list, css='', ovr='overrides.txt'):
    a, _, b = head.rpartition('</style>'); h = a + css + '</style>' + b if css else head
    out = h + p2 + p3 + ''.join(r('parts', f) for f in js_list)
    seen = {}
    for f in js_list:
        for n in re.findall(r'^function\s+(\w+)\s*\(', r('parts', f), re.M): seen.setdefault(n, []).append(f)
    dups = {n: fs for n, fs in seen.items() if len(fs) > 1}
    open(os.path.join(HERE, ovr), 'w').write('\n'.join(f'{n}: {" -> ".join(fs)}' for n, fs in sorted(dups.items())) + '\n')
    print(len(dups), 'functions overridden by a later part (see %s)' % ovr)
    for m in re.finditer(r'<script type="application/json" id="([^"]+)">(.*?)</script>', out, re.S):
        json.loads(m.group(2))
    js = re.search(r'<script>\n(.*)</script>\s*</body>', out, re.S).group(1)
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as t: t.write(js)
    subprocess.check_call(['node', '--check', t.name]); os.unlink(t.name)
    open(os.path.join(ROOT, name), 'w', encoding='utf-8').write(out)
    print('built %s,' % name, len(out), 'bytes; JSON + syntax OK')

# one game: the shared parts, then the revised Studio, Days, chapter 2 and the Working pad, then the display part
GAME = JS[:-1] + ['p4ze_studio2.js', 'p4zf_flightdays.js', 'p4zg_chapter2.js', 'p4zh_longhaul.js', 'p4zj_types.js', 'p4zk_pad.js', 'p4zl_fleetshop.js', 'p4zm_buyonly.js', 'p4zn_ch2events.js', 'p4zo_ch3money.js', 'p4zp_runthrough.js', 'p4zq_milestones.js', 'p4zr_paper.js', 'p4zt_decide.js', 'p4zs_ch4.js', 'p4zu_fuelstore.js', 'p4zv_flightplan.js', 'p4zw_intelwall.js', 'p4zx_fit.js', 'p4zy_paint2.js', 'p4zz_nightops.js', 'p5a_review.js', 'p5b_desk.js', 'p5c_fuel.js', 'p5d_sound.js', 'p5e_colour.js', 'p5f_brief.js', 'p5g_testkit.js', 'p5h_screens3.js', 'p5i_playnotes.js', 'p5j_sheet.js', 'p5k_design1.js', 'p5l_year1.js', 'p5m_events.js', 'p5n_wio2.js', 'p5o_review2.js', 'p5p_opener2.js', 'p5q_fuel2.js'] + JS[-1:]
build('airline-opening-prototype.html', GAME, r('parts', 'p1_head_studio2.css') + r('parts', 'p1_head_nightops.css') + r('parts', 'p1_head_screens.css') + r('parts', 'p1_head_screens3.css') + r('parts', 'p1_head_design1.css') + r('parts', 'p1_head_design2.css'))
