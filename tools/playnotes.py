"""Reads a Play notes log (playnotes-….json.gz from the game's teacher panel → Play notes) and prints its timeline:
each screen as it appeared, what was said (the live transcript, when Chrome made one) and the marks.

    python3 tools/playnotes.py playnotes-2026-10-18-1002.json.gz            the timeline
    python3 tools/playnotes.py LOG --at 12:40                               the screen on show at 12:40, and its save code
    python3 tools/playnotes.py LOG --codes DIR                              every save code in the log, one file each

Screenshots of the screens named in a log: node tools/playnotes_shots.js LOG OUTDIR [mm:ss ...|marks|said]
"""
import gzip, json, sys, os

def load(path):
    raw = open(path, 'rb').read()
    return json.loads(gzip.decompress(raw) if raw[:2] == b'\x1f\x8b' else raw)

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
