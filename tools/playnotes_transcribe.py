"""Transcribes a Play notes recording and puts each phrase into the log at its time, beside the screen on show.
For when the game was opened from a file (no live transcript there).

    pip install faster-whisper
    python3 tools/playnotes_transcribe.py playnotes-2026-10-18-1002.webm playnotes-2026-10-18-1002.json.gz

Writes playnotes-…-said.json.gz (the log with the words in it) and prints the merged timeline. The first run downloads the
speech model (small.en, about 250 MB) from huggingface.co.
"""
import gzip, json, sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from playnotes import load

def clock(t): return '%02d:%02d' % (int(t // 60), int(t % 60))

if __name__ == '__main__':
    if len(sys.argv) < 3: print(__doc__); sys.exit(1)
    audio, logf = sys.argv[1], sys.argv[2]
    from faster_whisper import WhisperModel
    L = load(logf); m = WhisperModel('small.en', device='cpu', compute_type='int8')
    # the game's own words, so the model expects them: the routes' cities, the aircraft and the screens' names
    import re, os
    here = os.path.dirname(os.path.abspath(__file__)); words = set()
    try:
        W = json.loads(re.search(r'id="data-workbook">(.*?)</script>', open(os.path.join(here, '..', 'src/opening/parts/p2_data.html'), encoding='utf-8').read(), re.S).group(1))
        words |= {r['city'] for r in W.get('routes', [])} | {a['name'] for a in W.get('aircraft', [])}
    except Exception: pass
    words |= {e['name'] for e in L['log'] if e['kind'] == 'screen'}
    prompt = 'Dragon Air airline game: Studio, Sunday review, sums, cell, fare, seats, fuel desk. ' + ', '.join(sorted(words)) + '.'
    segs, _ = m.transcribe(audio, vad_filter=True, initial_prompt=prompt[:800])
    said = [{'t': round(s.start, 1), 'kind': 'say', 'text': s.text.strip(), 'from': 'recording'} for s in segs if s.text.strip()]
    log = sorted([e for e in L['log'] if not (e['kind'] == 'say' and e.get('from') == 'recording')] + said, key=lambda e: e['t'])
    scr = None
    for e in log:
        if e['kind'] == 'screen': scr = e['name']
        elif e['kind'] == 'say': e['screen'] = scr
    L['log'] = log
    L['timeline'] = ['%s  %s' % (clock(e['t']), (e['name'] + (' · ' + e['when'] if e.get('when') else '')) if e['kind'] == 'screen' else '“%s”' % e['text'] if e['kind'] == 'say' else '★ MARK' if e['kind'] == 'mark' else e['kind'].upper()) for e in log]
    out = logf.replace('.json.gz', '').replace('.json', '') + '-said.json.gz'
    open(out, 'wb').write(gzip.compress(json.dumps(L).encode()))
    print('\n'.join(L['timeline'])); print('\nwritten', out)
