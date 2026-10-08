#!/usr/bin/env python3
"""Fetch the showroom photos from Wikimedia Commons.

Reads the Aircraft sheet of data/Airline-World-Workbook.xlsx. For every row whose photoSource is a Commons file page
(https://commons.wikimedia.org/wiki/File:...), it asks the Commons API for the file's author and licence, downloads a
large thumbnail, crops it to the showroom card's 3:2 shape (900 x 600, JPEG), saves it as
src/opening/assets/photos/<id>.jpg and writes photoFile, photoCredit and photoLicence back into the sheet.

Only openly licensed files are accepted (public domain, CC0, CC BY, CC BY-SA); anything else is reported and skipped.
Then import and rebuild as usual:
    python3 tools/import_world.py && python3 src/opening/build.py

Usage:
  python3 tools/fetch_photos.py            # rows with a Commons source and no photo on disk yet
  python3 tools/fetch_photos.py --force    # every row with a Commons source, refetching the ones on disk
  python3 tools/fetch_photos.py --check    # report only; nothing is downloaded or written

Commons rate-limits shared addresses hard (HTTP 429), so every request is retried patiently; a full run can take minutes.
"""
import io, json, re, sys, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

try:
    import openpyxl
    from PIL import Image, ImageOps
except ImportError:
    sys.exit('Needs openpyxl and Pillow: pip install openpyxl pillow')

ROOT = Path(__file__).resolve().parent.parent
BOOK = ROOT / 'data' / 'Airline-World-Workbook.xlsx'
PHOTOS = ROOT / 'src' / 'opening' / 'assets' / 'photos'
UA = 'AirlineMathsGame/1.0 (https://github.com/bertieharris2-cpu/airline-simulator-maths-game)'
API = 'https://commons.wikimedia.org/w/api.php'
SIZE = (900, 600)            # the card shows the photo at 3:2 (object-fit: cover), so the crop is done here and the file stays small
OPEN = re.compile(r'^(public domain|cc0|cc[- ]by(-sa)?(\s[\d.]+)?.*)$', re.I)
args = set(sys.argv[1:])
FORCE, CHECK = '--force' in args, '--check' in args


def get(url, tries=60):
    """GET with patient retries on 429 (Commons throttles shared addresses) and transient errors."""
    delay = 4
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r: return r.read()
        except urllib.error.HTTPError as e:
            if e.code not in (429, 502, 503) or i == tries - 1: raise
        except (urllib.error.URLError, TimeoutError):
            if i >= 3: raise            # a blocked host or a dead connection does not mend with patience
        time.sleep(delay); delay = min(delay + 2, 12)


def info(title):
    q = urllib.parse.urlencode({'action': 'query', 'format': 'json', 'formatversion': 2, 'titles': title, 'prop': 'imageinfo',
                                'iiprop': 'url|size|extmetadata', 'iiurlwidth': 1280,            # Commons only renders a fixed list of widths (500, 960, 1280...)
                                'iiextmetadatafilter': 'Artist|LicenseShortName|LicenseUrl|Credit|Attribution'})
    d = json.loads(get(API + '?' + q))
    page = d['query']['pages'][0]
    if page.get('missing') or not page.get('imageinfo'): raise LookupError(f'{title} is not on Commons')
    ii = page['imageinfo'][0]; em = ii.get('extmetadata', {})
    v = lambda k: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', em.get(k, {}).get('value', ''))).strip()
    # the API names thumbnails on thumb.wikimedia.org, which some networks block; upload.wikimedia.org serves the same paths
    thumb = (ii.get('thumburl') or ii['url']).replace('https://thumb.wikimedia.org/', 'https://upload.wikimedia.org/')
    return {'thumb': thumb, 'url': ii['url'], 'w': ii['width'], 'h': ii['height'],
            'artist': v('Artist'), 'licence': v('LicenseShortName'), 'licenceUrl': v('LicenseUrl'), 'credit': v('Credit')}


def title_of(src):
    m = re.match(r'https?://commons\.wikimedia\.org/wiki/(File:.+)$', str(src or '').strip())
    return urllib.parse.unquote(m.group(1)).replace('_', ' ') if m else None


def short_author(artist):
    a = re.sub(r'\s*\(talk\)|\s*/\s*Wikimedia Commons|^\s*Photo(graph)?\s*(by|:)\s*', '', artist, flags=re.I).strip()
    a = re.split(r'\s*[,;]\s*', a)[0] if len(a) > 40 else a
    return a[:48] or 'Wikimedia Commons'


wb = openpyxl.load_workbook(BOOK)
ws = wb['Aircraft']
head = [str(c.value).strip() if c.value else '' for c in ws[1]]
col = {h: i + 1 for i, h in enumerate(head)}
for k in ('id', 'photoFile', 'photoCredit', 'photoLicence', 'photoSource'):
    if k not in col: sys.exit(f'Aircraft sheet has no {k} column (run tools/workbook_v43_draft.py first)')
PHOTOS.mkdir(parents=True, exist_ok=True)
done, skipped = [], []
for r in range(2, ws.max_row + 1):
    pid = ws.cell(r, col['id']).value
    src = ws.cell(r, col['photoSource']).value
    title = title_of(src)
    if not pid or not title: continue
    have = ws.cell(r, col['photoFile']).value
    if have and (PHOTOS / str(have)).exists() and not FORCE and not CHECK:
        skipped.append(f'{pid}: {have} already on disk'); continue
    try:
        i = info(title)
    except Exception as e:
        skipped.append(f'{pid}: {e}'); continue
    if not OPEN.match(i['licence'] or ''):
        skipped.append(f'{pid}: {title} is "{i["licence"] or "unknown licence"}", not an open licence; not used'); continue
    author = short_author(i['artist'] or i['credit'])
    line = f'{pid}: {title} ({i["w"]}x{i["h"]}) · {author} · {i["licence"]}'
    if CHECK:
        done.append(line + ' · would fetch'); continue
    try: raw = get(i['thumb'])
    except Exception as e:
        print(f'{pid}: thumbnail failed ({e}); fetching the original', flush=True); raw = get(i['url'])
    im = ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert('RGB')
    im = ImageOps.fit(im, SIZE, Image.LANCZOS, centering=(0.5, 0.5))
    fname = f'{pid}.jpg'
    im.save(PHOTOS / fname, 'JPEG', quality=82, optimize=True, progressive=True)
    ws.cell(r, col['photoFile'], fname)
    ws.cell(r, col['photoCredit'], author)
    ws.cell(r, col['photoLicence'], i['licence'])
    done.append(line + f' -> {fname} ({(PHOTOS / fname).stat().st_size // 1024} KB)')
    time.sleep(2)
if done and not CHECK: wb.save(BOOK)
print('\n'.join(done) or 'nothing fetched')
if skipped: print('\nskipped:\n' + '\n'.join(skipped))
if done and not CHECK: print('\nworkbook updated; now: python3 tools/import_world.py && python3 src/opening/build.py')
