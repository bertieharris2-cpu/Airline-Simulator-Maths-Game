"""Reads a Play notes log (playnotes-….json from the game's teacher panel → Play notes; older logs are .json.gz) and prints its timeline:
each screen as it appeared, what was said (the live transcript, when Chrome made one) and the marks.

    python3 tools/playnotes.py playnotes-2026-10-18-1002.json.gz            the timeline
    python3 tools/playnotes.py LOG --at 12:40                               the screen on show at 12:40, and its save code
    python3 tools/playnotes.py LOG --codes DIR                              every save code in the log, one file each

Screenshots of the screens named in a log: node tools/playnotes_shots.js LOG OUTDIR [mm:ss ...|marks|said]
"""
import gzip, json, sys, os

def load(path):
    """a log: playnotes-….json (from 18 Oct, each save code gzipped as "codez"), or the earlier .json.gz (also inside a .zip)"""
    import base64, zipfile, io
    raw = open(path, 'rb').read()
    if raw[:2] == b'PK':
        z = zipfile.ZipFile(io.BytesIO(raw)); raw = z.read([n for n in z.namelist() if 'playnotes' in n or n.endswith(('.json', '.gz'))][0])
    L = json.loads(gzip.decompress(raw) if raw[:2] == b'\x1f\x8b' else raw)
    for e in L.get('log', []):
        if e.get('codez'): e['code'] = gzip.decompress(base64.b64decode(e.pop('codez'))).decode('utf-8')
    return L

def secs(s):
    m, _, x = s.partition(':'); return int(m) * 60 + float(x or 0)

def at(L, t):
    """the screen entry on show at t seconds, and the last save code at or before it"""
    scr = code = None
    for e in L['log']:
        if e['t'] > t: break
        if e.get('code'): code = e
        if e['kind'] == 'screen': scr = e
    return scr, code

if __name__ == '__main__':
    a = sys.argv[1:]
    if not a: print(__doc__); sys.exit(1)
    L = load(a[0])
    if '--at' in a:
        scr, code = at(L, secs(a[a.index('--at') + 1]))
        print(json.dumps({k: v for k, v in (scr or {}).items() if k != 'code'}, indent=1))
        if code: print(code['code'])
    elif '--codes' in a:
        d = a[a.index('--codes') + 1]; os.makedirs(d, exist_ok=True); n = 0
        for e in L['log']:
            if e.get('code'):
                m = int(e['t'] // 60); s = int(e['t'] % 60)
                open(os.path.join(d, '%02d-%02d-%s.txt' % (m, s, e['name'].replace(' ', '_').replace(':', ''))), 'w').write(e['code']); n += 1
        print(n, 'save codes written to', d)
    else:
        print('Started', L['started'], '· recording:', L.get('audio') or 'none')
        for line in L['timeline']: print(line)
