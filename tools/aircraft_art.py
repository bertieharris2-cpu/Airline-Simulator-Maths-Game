#!/usr/bin/env python3
"""Draws the larger aircraft for the paint shop (16 Oct 2026): the 757, the wide-body twins (787, A350, 777), the A340,
the 747 and the A380. Each is written to src/opening/assets/aircraft/<id>.svg with the same layers and markers as the
hand-drawn ones (dhc6.svg, narrowbody.svg): box 0 0 1200 440, port side, nose left; classes p-body, p-belly, p-second,
p-engine, p-glass, p-line; tail designs tl-*; stripes st-*; @U, @LOGO, @NAME, @REG, @PNAME and the three fills.
Not exact likenesses: the shape that tells a pupil which aircraft it is (the hump, the double deck, four engines, the
long thin body). Run: python3 tools/aircraft_art.py, then build.py.
"""
import math, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'src', 'opening', 'assets', 'aircraft')

TAILS = '''    <polygon class="p-second tl tl-stripe" points="900,230 968,44 1002,44 934,230"/>
    <polygon class="p-second tl tl-star" points="975,82 984,104 1008,105 989,120 996,143 975,130 954,143 961,120 942,105 966,104"/>
    <path class="p-second tl tl-chevron" d="M922 170 L972 92 L1024 170 L1000 170 L972 126 L946 170 Z"/>
    <path class="p-second tl tl-wave" d="M850 150 C900 120 940 170 990 130 C1010 116 1030 112 1050 116 L1050 150 C1030 146 1012 150 994 162 C944 200 902 152 850 182 Z"/>
    <g class="tl tl-circle"><circle class="p-second" cx="978" cy="112" r="30"/><circle class="p-body" cx="978" cy="112" r="13"/></g>
    <path class="p-second tl tl-arrow" d="M978 64 L1010 110 L990 110 L990 160 L966 160 L966 110 L946 110 Z"/>
    <g class="tl tl-logo" transform="translate(936 66) scale(2.1)">@LOGO</g>'''


def fan(cx, cy, r):
    blades = ''.join(f'<line x1="{cx}" y1="{cy}" x2="{cx + r * 0.92 * math.cos(k * math.pi / 6):.1f}" y2="{cy + r * 0.92 * math.sin(k * math.pi / 6):.1f}" stroke="#9AA5B1" stroke-width="2.2"/>' for k in range(12))
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#171C24"/><g class="fan">{blades}</g>'
            f'<circle cx="{cx}" cy="{cy}" r="{r * 0.28:.1f}" class="p-second"/><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#C9CFD8" stroke-width="3"/>')


def engine(path, f):
    return (f'<path class="p-engine" d="{path}"/><path d="{path}" fill="url(#shadeS@U)"/><path class="p-line" d="{path}"/>\n  ' + fan(*f))


def windows(rows, skip):
    out = []
    for (x0, x1, y, w, h, step) in rows:
        x = x0
        while x <= x1:
            if not any(a - w - 4 <= x <= b + 4 for a, b in skip):
                out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{min(4, w // 3)}"/>')
            x += step
    return '<g class="p-glass">' + ''.join(out) + '</g>'


def draw(d):
    doors = ''.join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" class="p-line"/>' for (x, y, w, h) in d['doors'])
    skip = [(x, x + w) for (x, y, w, h) in d['doors']]
    gear = ''
    for (x, y0, y1, w, wheels) in d['gear']:
        gear += f'<rect x="{x}" y="{y0}" width="{w}" height="{y1 - y0}" fill="#2A3442"/>'
        for (cx, cy, r) in wheels:
            gear += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#171C24"/><circle cx="{cx}" cy="{cy}" r="{round(r * 0.4)}" fill="#9AA5B1"/>'
    eng = '\n  '.join(engine(p, f) for (p, f) in d['engines'])
    t0, t1 = d['shade']
    nm, rg, pn = d['name'], d['reg'], d['pname']
    whole = f'<path d="{d["fus"]}"/><path d="{d["fin"]}"/>'
    extra = d.get('extra', '')
    return f'''<!-- {d['title']}, port side, nose left. Box 0 0 1200 440. Drawn by tools/aircraft_art.py with the same layers and markers as dhc6.svg. -->
<defs>
  <clipPath id="fus@U"><path d="{d['fus']}"/></clipPath>
  <clipPath id="fin@U"><path d="{d['fin']}"/></clipPath>
  <clipPath id="whole@U">{whole}</clipPath>
  <linearGradient id="shadeV@U" x1="0" y1="{t0}" x2="0" y2="{t1}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".22" stop-color="#fff" stop-opacity=".08"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient>
  <linearGradient id="shadeFin@U" x1="{d['finx'][0]}" y1="0" x2="{d['finx'][1]}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
  <linearGradient id="shadeS@U" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
  <linearGradient id="glintG@U" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".65"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <radialGradient id="shadow@U"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>
<g class="art-plane">
  <ellipse class="art-shadow" cx="600" cy="{d['ground']}" rx="570" ry="22" fill="url(#shadow@U)"/>
  {gear}
  <path class="p-body" d="{d['fillet']}"/>
  <path class="p-body" d="{d['fin']}"/>
  <g clip-path="url(#fin@U)"><g transform="{d['finT']}">
{TAILS}
  </g></g>
  <path d="{d['fin']}" fill="url(#shadeFin@U)"/>
  <path class="p-line" d="{d['fin']}"/>
  <path d="{d['finEdge']}" stroke="rgba(8,20,34,.45)" stroke-width="1.6" fill="none"/>
  <path class="p-body" d="{d['stab']}"/><path class="p-line" d="{d['stab']}"/>
  <g clip-path="url(#fus@U)">
    <rect class="p-body" x="30" y="{d['body'][0]}" width="1160" height="{d['body'][1]}"/>
    <rect class="p-belly" x="30" y="{d['belly'][0]}" width="1160" height="{d['belly'][1]}"/>
    <rect class="p-second st st-thin" x="50" y="{d['thin'][0]}" width="1110" height="{d['thin'][1]}"/>
    <g class="st st-band"><rect class="p-second" x="50" y="{d['band'][0]}" width="1110" height="{d['band'][1]}"/><rect class="p-second" x="50" y="{d['band'][0] + d['band'][1] + 4}" width="1110" height="4" opacity=".8"/></g>
    <path class="p-second st st-swoosh" d="{d['swoosh']}"/>
    <rect x="30" y="{d['body'][0]}" width="1160" height="{d['body'][1]}" fill="url(#shadeV@U)"/>
  </g>
  <path class="p-line" d="{d['fus']}"/>
  {extra}
  <path class="p-glass" d="{d['cockpit']}"/><path d="{d['cockpitHi']}" fill="#fff" opacity=".35"/>
  {windows(d['windows'], skip)}
  {doors}
  <text class="t-name" x="{nm[0]}" y="{nm[1]}" text-anchor="middle" font-weight="700" font-size="{nm[2]}" letter-spacing="3" fill="@NAMEFILL">@NAME</text><text class="t-reg" x="{rg[0]}" y="{rg[1]}" text-anchor="middle" font-weight="700" font-size="{rg[2]}" letter-spacing="1" fill="@REGFILL">@REG</text><text class="t-pname" x="{pn[0]}" y="{pn[1]}" text-anchor="middle" font-style="italic" font-size="{pn[2]}" fill="@PNAMEFILL">@PNAME</text>
  <path class="p-body" d="{d['wing']}"/><path d="{d['wing']}" fill="url(#shadeS@U)"/><path class="p-line" d="{d['wing']}"/>
  {d['pylons']}
  {eng}
  <g clip-path="url(#whole@U)"><rect class="glint" x="-200" y="0" width="220" height="360" fill="url(#glintG@U)"/></g>
</g>
'''


# the wide-body twin's fuselage and fin, shared by the 787/A350/777 and the A340
WB_FUS = 'M58 254 C58 220 108 196 184 186 L238 170 C262 162 296 158 346 158 L878 158 C968 160 1050 184 1112 220 L1120 236 C1058 256 966 282 858 310 C820 320 774 322 724 322 L228 322 C144 322 80 298 58 254 Z'
WB_FIN = 'M842 164 L950 20 C958 8 980 4 1006 4 L1054 6 C1066 8 1070 16 1071 26 L1092 216 C1040 194 944 172 842 164 Z'
WB = dict(fus=WB_FUS, fin=WB_FIN, finx=(842, 1092), finT='translate(30 -30) scale(1 1.08)', finEdge='M1050 16 L1076 208',
          fillet='M744 162 C790 158 830 142 864 116 L852 164 Z', stab='M958 236 L1150 224 C1164 224 1164 236 1150 238 L958 248 Z',
          shade=(158, 322), body=(148, 190), belly=(276, 90), thin=(254, 10), band=(248, 24),
          swoosh='M50 314 C420 314 730 294 1130 180 L1130 222 C730 326 420 338 50 336 Z',
          cockpit='M194 198 L238 176 C254 168 276 166 298 166 L302 198 Z', cockpitHi='M202 194 L238 178 L254 176 L222 194 Z',
          windows=[(330, 846, 198, 12, 17, 18)], doors=[(284, 178, 36, 112), (574, 178, 34, 112), (842, 180, 34, 108)],
          name=(470, 192, 22), reg=(992, 256, 18), pname=(170, 300, 14),
          wing='M400 306 L790 294 C820 296 826 314 792 318 L450 332 C414 332 398 318 400 306 Z', ground=406)

DRAWINGS = {
    'widebody': dict(WB, title='A wide-body twin (stand-in for the 787, A350 and 777)',
                     pylons='<rect x="420" y="294" width="90" height="12" fill="#2A3442" opacity=".7"/>',
                     engines=[('M300 302 C300 276 326 262 366 262 L500 264 C536 266 550 288 550 318 C550 348 536 370 500 372 L366 374 C326 374 300 360 300 334 Z', (322, 318, 44))],
                     gear=[(206, 316, 360, 8, [(210, 366, 20)]), (650, 318, 368, 14, [(636, 378, 26), (688, 378, 26)])]),
    'widebody4': dict(WB, title='A four-engine wide-body (stand-in for the A340)',
                      pylons='<rect x="372" y="300" width="90" height="12" fill="#2A3442" opacity=".7"/><rect x="560" y="294" width="80" height="10" fill="#2A3442" opacity=".6"/>',
                      engines=[('M520 286 C520 266 542 256 574 256 L668 258 C696 260 706 276 706 298 C706 320 696 336 668 338 L574 340 C542 340 520 330 520 310 Z', (536, 298, 32)),
                               ('M310 304 C310 282 334 270 368 270 L486 272 C518 274 528 292 528 318 C528 344 518 362 486 364 L368 366 C334 366 310 354 310 332 Z', (330, 318, 36))],
                      gear=[(206, 316, 360, 8, [(210, 366, 20)]), (712, 318, 368, 14, [(694, 378, 26), (746, 378, 26)])]),
    'b747': dict(WB, title='The 747: the upper deck in the hump, four engines',
                 fus='M56 262 C56 230 92 206 150 192 C176 158 214 120 274 104 C300 98 330 96 370 96 L480 96 C540 96 574 112 612 138 C630 150 648 156 680 158 L878 158 C968 160 1050 184 1112 220 L1120 236 C1058 256 966 282 858 310 C820 320 774 322 724 322 L228 322 C140 322 76 300 56 262 Z',
                 shade=(96, 322), body=(86, 252),
                 cockpit='M200 156 L236 128 C250 120 266 116 284 116 L288 148 Z', cockpitHi='M208 152 L236 130 L252 126 L224 150 Z',
                 windows=[(306, 540, 116, 11, 14, 18), (330, 846, 198, 12, 17, 18)], doors=[(262, 178, 36, 112), (574, 178, 34, 112), (842, 180, 34, 108)],
                 name=(720, 192, 22), pname=(150, 290, 14),
                 extra='<path d="M612 138 C590 150 560 156 520 158" stroke="rgba(8,20,34,.35)" stroke-width="1.4" fill="none"/>',
                 pylons='<rect x="372" y="300" width="96" height="12" fill="#2A3442" opacity=".7"/><rect x="566" y="292" width="84" height="10" fill="#2A3442" opacity=".6"/>',
                 engines=[('M520 282 C520 260 544 248 580 248 L684 250 C714 252 726 270 726 294 C726 318 714 336 684 338 L580 340 C544 340 520 328 520 306 Z', (538, 294, 36)),
                          ('M300 300 C300 276 326 262 366 262 L494 264 C530 266 542 288 542 316 C542 344 530 364 494 366 L366 368 C326 368 300 354 300 330 Z', (322, 315, 40))],
                 gear=[(196, 316, 360, 8, [(200, 366, 20)]), (742, 318, 368, 14, [(724, 378, 26), (776, 378, 26)])]),
    'a380': dict(WB, title='The A380: two decks the whole length, four engines',
                 fus='M54 250 C54 196 96 150 170 128 C200 116 250 106 320 104 L880 104 C980 108 1060 160 1116 214 L1122 232 C1060 258 968 286 860 314 C820 324 774 326 724 326 L230 326 C140 326 72 300 54 250 Z',
                 fin='M826 108 L944 14 C952 6 972 2 996 2 L1050 4 C1062 6 1066 14 1067 24 L1092 208 C1040 170 940 126 826 108 Z', finx=(826, 1092),
                 finT='translate(26 -40) scale(1 1.04)', finEdge='M1046 14 L1074 200', fillet='M720 106 C770 104 806 92 840 70 L830 108 Z',
                 stab='M962 236 L1152 224 C1166 224 1166 236 1152 238 L962 248 Z',
                 shade=(104, 326), body=(94, 244), belly=(282, 86), thin=(262, 10), band=(256, 24),
                 swoosh='M50 318 C420 318 730 300 1130 186 L1130 228 C730 330 420 342 50 340 Z',
                 cockpit='M118 184 L158 168 C174 162 192 160 210 160 L212 184 Z', cockpitHi='M126 180 L158 170 L174 168 L144 180 Z',
                 windows=[(268, 866, 136, 11, 15, 18), (262, 856, 214, 12, 17, 18)],
                 doors=[(236, 120, 32, 64), (236, 200, 34, 100), (566, 120, 30, 64), (566, 200, 32, 100), (860, 200, 32, 96)],
                 name=(600, 126, 22), reg=(994, 252, 18), pname=(166, 300, 14),
                 wing='M392 306 L800 292 C832 294 838 314 802 318 L446 334 C408 334 390 320 392 306 Z',
                 pylons='<rect x="376" y="302" width="96" height="12" fill="#2A3442" opacity=".7"/><rect x="584" y="290" width="88" height="10" fill="#2A3442" opacity=".6"/>',
                 engines=[('M540 282 C540 258 566 246 604 246 L714 248 C746 250 758 270 758 296 C758 322 746 340 714 342 L604 344 C566 344 540 332 540 308 Z', (560, 295, 38)),
                          ('M300 300 C300 274 328 260 370 260 L506 262 C544 264 558 286 558 316 C558 346 544 368 506 370 L370 372 C328 372 300 358 300 330 Z', (324, 316, 44))],
                 gear=[(196, 320, 362, 8, [(200, 368, 20)]), (772, 320, 368, 14, [(752, 378, 26), (804, 378, 26)])], ground=408),
    'b757': dict(title='The 757: a long, slim narrow-body on tall legs',
                 fus='M44 256 C44 236 84 222 150 214 L214 198 C236 190 262 186 310 186 L900 186 C980 188 1050 204 1110 230 L1116 242 C1054 256 966 272 860 290 C826 296 780 298 730 298 L210 298 C126 298 70 282 44 256 Z',
                 fin='M868 190 L966 60 C974 48 994 44 1016 44 L1058 46 C1070 48 1074 56 1075 66 L1092 226 C1044 208 956 196 868 190 Z', finx=(868, 1092),
                 finT='translate(40 2) scale(1 0.98)', finEdge='M1054 56 L1078 218', fillet='M770 190 C810 186 846 172 878 150 L868 190 Z',
                 stab='M968 244 L1146 234 C1158 234 1158 244 1146 246 L968 254 Z',
                 shade=(186, 298), body=(176, 132), belly=(262, 60), thin=(248, 8), band=(244, 18),
                 swoosh='M50 290 C420 290 720 274 1120 196 L1120 228 C720 304 420 314 50 312 Z',
                 cockpit='M168 214 L208 196 C222 190 240 188 258 188 L262 214 Z', cockpitHi='M176 210 L208 198 L222 196 L194 210 Z',
                 windows=[(300, 862, 214, 11, 15, 17)], doors=[(272, 196, 32, 94), (648, 196, 30, 94), (858, 198, 30, 88)],
                 name=(456, 208, 19), reg=(986, 264, 16), pname=(196, 286, 12),
                 wing='M400 290 L700 284 C730 286 738 306 704 310 L444 318 C410 318 396 304 400 290 Z',
                 pylons='<rect x="440" y="292" width="80" height="12" fill="#2A3442" opacity=".7"/>',
                 engines=[('M330 292 C330 268 358 256 400 256 L556 258 C592 260 606 280 606 306 C606 334 592 352 556 354 L400 356 C358 356 330 344 330 318 Z', (352, 305, 40))],
                 gear=[(206, 294, 352, 8, [(210, 358, 18)]), (650, 296, 354, 12, [(640, 364, 24), (686, 364, 24)])], ground=392),
}

if __name__ == '__main__':
    for k, d in DRAWINGS.items():
        with open(os.path.join(OUT, k + '.svg'), 'w', encoding='utf-8') as f:
            f.write(draw(d))
        print('wrote', k + '.svg')
