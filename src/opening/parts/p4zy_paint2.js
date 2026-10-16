/* ---------- The paint shop, second pass (16 Oct 2026) ----------
   Bertie: "if I bought a Saab, am I customising a plane that looks like a Saab or just the standard plane? I'd really like it
   to be on the correct plane if possible, even if it's not an exact likeness. I'd also love a few more customisation options
   for the logo." The Twin Otter, Saab 340, ATR 72, E175 and E190 had their own drawings and the A220, A320 and 737 shared
   one; the 757, the wide-bodies, the 747 and the A380 fell back to the Twin Otter. Five more drawings (tools/aircraft_art.py)
   and, below, more logo choices. Reassignment only (overrides.txt stays at 120). */

/* 1. the right drawing: the Aircraft sheet's artworkId when it names a drawing, else the closest drawing for the type */
const ART_FOR = { dhc6:'dhc6', sf34:'sf34', at72:'at72', e175:'e175', e190:'e190', a220:'narrowbody', a320:'narrowbody', b737:'narrowbody',
  b757:'b757', b787:'widebody', a350:'widebody', b777:'widebody', a340:'widebody4', b747:'b747', a380:'a380' };
function artGuess(p){ if(!p) return null; const keys = [p.id, p.wbId].filter(Boolean).map(k => String(k).toLowerCase());
  for(const k of keys){ if(ART_FOR[k] && ARTWORK[ART_FOR[k]]) return ART_FOR[k]; }
  // by name, for a row the table above does not know (a new type added to the workbook)
  const n = String(p.name || '').toLowerCase(), by = [[/a380/, 'a380'], [/747/, 'b747'], [/a340/, 'widebody4'], [/787|a350|777|a330|767|wide/, 'widebody'], [/757/, 'b757'], [/a32\d|a220|737|narrow/, 'narrowbody'], [/e17\d/, 'e175'], [/e19\d/, 'e190'], [/atr/, 'at72'], [/saab|340/, 'sf34'], [/otter|dhc/, 'dhc6']];
  for(const [re, id] of by){ if(re.test(n) && ARTWORK[id]) return id; }
  return null; }
artIdOf = function(planeId){ const p = planeById(planeId), id = p && p.artworkId; if(id && ARTWORK[id]) return id; return artGuess(p) || (ARTWORK.dhc6 ? 'dhc6' : null); };

/* 2. more logo choices: four more shapes, twelve more symbols (initials among them) and four styles; saved with the logo
   on S.airline.logo ({ shape, symbol, c1, c2, style, text }), so an old save keeps its logo (no style: solid) */
[['diamond', 'Diamond'], ['hexagon', 'Hexagon'], ['badge', 'Badge'], ['oval', 'Oval']].forEach(([id, name]) => { if(!LIV.logoShapes.some(s => s.id === id)) LIV.logoShapes.push({ id, name }); });
Object.assign(SHAPE40, { diamond:'<path d="M20 1 L39 20 L20 39 L1 20 Z"/>', hexagon:'<path d="M11 3 L29 3 L38 20 L29 37 L11 37 L2 20 Z"/>',
  badge:'<path d="M4 38 L4 16 C4 7 11 2 20 2 C29 2 36 7 36 16 L36 38 Z"/>', oval:'<ellipse cx="20" cy="20" rx="19" ry="14"/>' });
Object.assign(SYM40, {
  plane:'<path d="M20 3 C21.6 3 22.4 4.6 22.4 6.5 L22.4 15 L36 23 L36 26.5 L22.4 22 L22.4 30.5 L26.5 34 L26.5 36.5 L20 34.6 L13.5 36.5 L13.5 34 L17.6 30.5 L17.6 22 L4 26.5 L4 23 L17.6 15 L17.6 6.5 C17.6 4.6 18.4 3 20 3 Z"/>',
  globe:'<g fill="none" stroke="currentColor" stroke-width="2.6"><circle cx="20" cy="20" r="15"/><ellipse cx="20" cy="20" rx="6.5" ry="15"/><path d="M5 20 L35 20 M8 12 L32 12 M8 28 L32 28"/></g>',
  crown:'<path d="M5 30 L5 12 L13 20 L20 7 L27 20 L35 12 L35 30 Z M5 32.5 L35 32.5 L35 36 L5 36 Z"/>',
  bird:'<path d="M3 14 C10 14 15 17 19 22 C22 15 28 10 37 9 C32 13 29 18 28 23 C26 30 20 33 13 32 L18 27 C12 26 7 21 3 14 Z"/>',
  bolt:'<path d="M24 2 L8 22 L18 22 L15 38 L32 15 L22 15 Z"/>',
  sun:'<circle cx="20" cy="20" r="8"/><g><polygon points="20,1 23,9 17,9"/><polygon points="20,39 23,31 17,31"/><polygon points="1,20 9,17 9,23"/><polygon points="39,20 31,17 31,23"/><polygon points="6.6,6.6 13.6,10.8 10.8,13.6"/><polygon points="33.4,33.4 26.4,29.2 29.2,26.4"/><polygon points="33.4,6.6 29.2,13.6 26.4,10.8"/><polygon points="6.6,33.4 10.8,26.4 13.6,29.2"/></g>',
  mountain:'<path d="M2 34 L15 12 L21 21 L26 15 L38 34 Z"/>',
  heart:'<path d="M20 35 C8 27 3 20 3 13 C3 8 7 4 12 4 C16 4 19 7 20 10 C21 7 24 4 28 4 C33 4 37 8 37 13 C37 20 32 27 20 35 Z"/>',
  compass:'<path d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16 Z"/>' });
const LOGO_SYMS = [['wing', 'Wing'], ['dragon', 'Dragon'], ['plane', 'Plane'], ['globe', 'Globe'], ['crown', 'Crown'], ['bird', 'Bird'], ['bolt', 'Lightning'], ['sun', 'Sun'], ['mountain', 'Mountain'], ['heart', 'Heart'], ['compass', 'Compass'], ['letters', 'Initials']];
const LOGO_STYLES = [['solid', 'Solid'], ['ring', 'Ring'], ['outline', 'Outline'], ['split', 'Two-tone']];
function logoInitials(){ const w = String(S && S.airline && S.airline.name || '').toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').split(/\s+/).filter(Boolean); return (w.length > 1 ? w.map(x => x[0]).join('') : (w[0] || 'A').slice(0, 2)).slice(0, 3); }
function logoText(g){ const t = String(g.text || '').toUpperCase().replace(/[^A-Z0-9&]/g, '').slice(0, 3); return t || logoInitials(); }
let LOGO_N = 0;
const logoMark0 = logoMark;
logoMark = function(g, o){
  g = g || logoOf(); const st = g.style || 'solid', letters = g.symbol === 'letters';
  if(st === 'solid' && !letters) return logoMark0(g, o);
  const shape = SHAPE40[g.shape] || SHAPE40.shield, c1 = hexOf(g.c1), c2 = hexOf(g.c2);
  const wrap = (fill, stroke, sw) => shape.replace('<', `<g fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"><`).replace(/\/>$/, '/></g>');
  const inset = (k, inner) => `<g transform="translate(20 20) scale(${k}) translate(-20 -20)">${inner}</g>`;
  let base = '', symFill = c2, symStroke = '';
  if(st === 'ring') base = wrap(c1, 'rgba(0,0,0,.25)', .6) + inset(.8, wrap('none', c2, 2.2));
  else if(st === 'outline') base = inset(.9, wrap('none', c1, 3.4));
  else if(st === 'split'){ const id = 'lgc' + (++LOGO_N); base = `<defs><clipPath id="${id}"><polygon points="40,0 40,40 0,40"/></clipPath></defs>` + wrap(c1, 'rgba(0,0,0,.25)', .6) + `<g clip-path="url(#${id})">${wrap(c2, 'none', 0)}</g>`; symFill = '#F4F6F8'; symStroke = ' stroke="rgba(0,0,0,.35)" stroke-width=".9"'; }
  else base = wrap(c1, 'rgba(0,0,0,.25)', .6);
  const t = logoText(g), fs = t.length <= 1 ? 22 : t.length === 2 ? 15.5 : 11.5;
  const sym = letters ? `<text x="20" y="20.5" text-anchor="middle" dominant-baseline="central" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="${fs}" letter-spacing=".3" fill="${symFill}"${symStroke}>${esc(t)}</text>`
    : `<g fill="${symFill}" color="${symFill}"${symStroke} transform="translate(20 20) scale(.62) translate(-20 -20)">${SYM40[g.symbol] || SYM40.star}</g>`;
  return `<g class="logo-mark">${base}${sym}</g>`;
};
/* the logo step: the extra symbols after the tail ones, a style row and, for initials, the letters */
function logoChip(k, v, label, svg, on){ return `<button class="chc ${on ? 'on' : ''}" data-v="${v}" aria-pressed="${on}" data-lx="${k}"><svg viewBox="0 0 40 40" aria-hidden="true">${svg}</svg><span>${esc(label)}</span></button>`; }
function logoExtrasHtml(g){ return `<div class="grp lg-style"><h3>Style</h3><div class="pchoices" data-k="style">${LOGO_STYLES.map(([id, name]) => logoChip('style', id, name, logoMark(Object.assign({}, g, { style:id })), (g.style || 'solid') === id)).join('')}</div></div>`; }
function logoRefresh(){ const g = logoOf(); syncLogoColours(); setLivery(); const big = $('logoBig'); if(big) big.innerHTML = logoSvg(220, g); const row = screen().querySelector('.lp-row svg'); if(row) row.outerHTML = logoSvg(40, g);
  screen().querySelectorAll('[data-lx="style"]').forEach(b => { b.querySelector('svg').innerHTML = logoMark(Object.assign({}, g, { style:b.getAttribute('data-v') })); });
  const tx = screen().querySelector('.lg-text'); if(tx) tx.hidden = g.symbol !== 'letters'; if(typeof publishSoon === 'function') publishSoon(); }
const logoStep0 = R.logo;
R.logo = () => {
  logoStep0(); const g = logoOf(), root = screen(), symRow = root.querySelector('.logo-ctl .pchoices[data-k="symbol"]'); if(!symRow) return;
  symRow.insertAdjacentHTML('beforeend', LOGO_SYMS.map(([id, name]) => logoChip('symbol', id, name, id === 'letters' ? `<text x="20" y="21" text-anchor="middle" dominant-baseline="central" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="16" fill="#D7263D">${esc(logoText(g))}</text>` : `<g fill="#D7263D" color="#D7263D">${SYM40[id]}</g>`, g.symbol === id)).join(''));
  symRow.closest('.grp').insertAdjacentHTML('afterend', `<div class="grp lg-text" ${g.symbol === 'letters' ? '' : 'hidden'}><h3>Initials (up to 3 letters)</h3><input id="logoText" class="lg-in" maxlength="3" value="${esc(logoText(g))}" autocomplete="off" spellcheck="false" aria-label="Initials for the logo"></div>` + logoExtrasHtml(g));
  symRow.classList.add('many'); root.querySelector('.logo-ctl').classList.add('lg-more');
  // every choice (the step's own and these) refreshes the preview, the style row and the initials box
  root.querySelectorAll('.logo-ctl [data-lx]').forEach(b => b.onclick = () => { const k = b.getAttribute('data-lx'), row = b.closest('.pchoices'); g[k] = b.getAttribute('data-v');
    row.querySelectorAll('.chc').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); logoRefresh(); });
  root.querySelectorAll('.logo-ctl .chc:not([data-lx]), .logo-ctl .sw').forEach(b => b.addEventListener('click', () => logoRefresh()));
  const ti = $('logoText'); if(ti) ti.oninput = () => { const v = ti.value.toUpperCase().replace(/[^A-Z0-9&]/g, '').slice(0, 3); if(ti.value !== v) ti.value = v; g.text = v; logoRefresh(); };
};

/* 3. the lettering of the airline's name on every aircraft: classic capitals, bold, script or outline (S.airline.lettering) */
const LETTERING = [['classic', 'Classic'], ['bold', 'Bold'], ['script', 'Script'], ['outline', 'Outline']];
function letteringOf(){ const v = S && S.airline && S.airline.lettering; return LETTERING.some(x => x[0] === v) ? v : 'classic'; }
function titleCase(s){ return String(s || '').toLowerCase().replace(/(^|[\s-])([a-z])/g, (m, a, b) => a + b.toUpperCase()); }
function letterAttrs(st, fs, fill){ const f = +fs || 20;
  if(st === 'bold') return { fs:Math.round(f * 1.35), ls:1, fw:900, fam:'Arial Black, Arial, sans-serif', italic:false, fill, stroke:'', caps:true };
  if(st === 'script') return { fs:Math.round(f * 1.45), ls:.5, fw:700, fam:'Georgia, Times New Roman, serif', italic:true, fill, stroke:'', caps:false };
  if(st === 'outline') return { fs:Math.round(f * 1.3), ls:2, fw:900, fam:'Arial Black, Arial, sans-serif', italic:false, fill:'none', stroke:fill, caps:true };
  return null; }
function letteringApply(h){ const st = letteringOf(); if(st === 'classic') return h;
  return h.replace(/<text class="t-name"([^>]*)>([^<]*)<\/text>/, (m, attrs, text) => { const fs = (/font-size="([\d.]+)"/.exec(attrs) || [])[1], fill = (/fill="([^"]*)"/.exec(attrs) || [])[1] || '#1B2A4A', A = letterAttrs(st, fs, fill);
    const a2 = attrs.replace(/ font-weight="[^"]*"/, '').replace(/ font-size="[^"]*"/, '').replace(/ letter-spacing="[^"]*"/, '').replace(/ fill="[^"]*"/, '');
    return `<text class="t-name"${a2} data-fs="${fs}" font-weight="${A.fw}" font-size="${A.fs}" letter-spacing="${A.ls}" font-family="${A.fam}"${A.italic ? ' font-style="italic"' : ''} fill="${A.fill}"${A.stroke ? ` stroke="${A.stroke}" stroke-width="1.3"` : ''}>${A.caps ? text : esc(titleCase(text.replace(/&amp;/g, '&')))}</text>`; }); }
const aircraftArt0 = aircraftArt;
aircraftArt = function(f, o){ return letteringApply(aircraftArt0(f, o)); };
const livKey0 = livKey;
livKey = function(f){ return livKey0(f) + '|' + letteringOf(); };
const repaintArt0 = repaintArt;
repaintArt = function(svg, f){ const changed = repaintArt0(svg, f); if(!changed || !svg) return changed; const t = svg.querySelector('.t-name'); if(!t) return changed;
  if(!t.hasAttribute('data-fs')) t.setAttribute('data-fs', t.getAttribute('font-size') || '20');
  const st = letteringOf(), fs = t.getAttribute('data-fs'), fill = t.getAttribute('fill'), A = letterAttrs(st, fs, fill === 'none' ? (t.getAttribute('stroke') || '#1B2A4A') : fill);
  if(!A){ t.setAttribute('font-size', fs); t.setAttribute('font-weight', '700'); t.setAttribute('letter-spacing', '3'); ['font-family', 'font-style', 'stroke', 'stroke-width'].forEach(k => t.removeAttribute(k)); return changed; }
  t.setAttribute('font-size', A.fs); t.setAttribute('font-weight', A.fw); t.setAttribute('letter-spacing', A.ls); t.setAttribute('font-family', A.fam); if(A.italic) t.setAttribute('font-style', 'italic'); else t.removeAttribute('font-style');
  t.setAttribute('fill', A.fill); if(A.stroke){ t.setAttribute('stroke', A.stroke); t.setAttribute('stroke-width', '1.3'); } else { t.removeAttribute('stroke'); t.removeAttribute('stroke-width'); }
  if(!A.caps) t.textContent = titleCase(t.textContent); return changed; };
/* the choice sits on the paint shop's Name tab, for every aircraft */
const paintTabHtml0 = paintTabHtml;
paintTabHtml = function(f, tab){ const h = paintTabHtml0(f, tab); if(tab !== 'name') return h; const cur = letteringOf(), nm = String(S.airline.name || 'Airline');
  const sample = st => { const A = letterAttrs(st, 17, '#E9EEF3') || { fs:17, ls:2, fw:700, fam:'Arial, sans-serif', fill:'#E9EEF3', stroke:'', caps:true };
    const txt = A.caps ? nm.toUpperCase() : titleCase(nm), wide = txt.length * A.fs * (A.fw >= 900 ? 0.8 : 0.66) + txt.length * A.ls > 112;
    return `<svg viewBox="0 0 124 30" aria-hidden="true"><text x="62" y="21" text-anchor="middle"${wide ? ' textLength="118" lengthAdjust="spacingAndGlyphs"' : ''} font-size="${A.fs}" font-weight="${A.fw}" letter-spacing="${A.ls}" font-family="${A.fam}"${A.italic ? ' font-style="italic"' : ''} fill="${A.fill}"${A.stroke ? ` stroke="${A.stroke}" stroke-width="1"` : ''}>${esc(txt)}</text></svg>`; };
  return h + `<div class="grp"><h3>Lettering on every aircraft</h3><div class="pchoices four lt-row" data-k="lettering">${LETTERING.map(([id, name]) => `<button class="chc lt ${cur === id ? 'on' : ''}" data-v="${id}" aria-pressed="${cur === id}" data-lt="${id}">${sample(id)}<span>${esc(name)}</span></button>`).join('')}</div></div>`; };
const bindPaint0 = bindPaint;
bindPaint = function(f, st){ bindPaint0(f, st); const stage = screen().querySelector('.hangar .art');
  screen().querySelectorAll('[data-lt]').forEach(b => b.onclick = () => { S.airline.lettering = b.getAttribute('data-lt'); b.closest('.pchoices').querySelectorAll('.chc').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    if(repaintArt(stage, f) && typeof glintArt === 'function') glintArt(screen()); if(typeof publishSoon === 'function') publishSoon(); }); };
