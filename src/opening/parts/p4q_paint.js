
/* ==================================================================
   THE PAINT SHOP (Change Request 5): painted side views of the real aircraft, the hangar stage, the reveal and the first take-off.
   Fixed content comes from the workbook's Livery sheet (palette, stripes, tail symbols, logo shapes, name suggestions) and
   the Aircraft sheet's artworkId; what the pupil chooses lives on S.airline (logo) and on each fleet entry (registration,
   name, livery). The drawings are in assets/aircraft/*.svg, inlined by the build as data-artwork; every paintable layer is
   a separate shape clipped to the fuselage or fin, with a shading overlay drawn over the colour.
   The whiteboard shows the same stage full screen (wall modes identity / paint / reveal / cert / takeoff, see p4c_display.js).
   ================================================================== */
const ARTWORK = (() => { try { return J('data-artwork'); } catch(e){ return {}; } })();
const PHOTOS = (() => { try { return J('data-photos'); } catch(e){ return {}; } })();
const LIV = (WB && WB.livery) || { colours:[], stripes:[], tails:[], logoShapes:[], planeNames:[] };
const PAL = LIV.colours || [];
function hexOf(id){ const c = PAL.find(x => x.id === id); return c ? c.hex : (/^#/.test(String(id || '')) ? id : '#888'); }
function colourName(id){ const c = PAL.find(x => x.id === id); return c ? c.name : id; }
function lumOf(hex){ const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex || '')); if(!m) return 0.5;
  const f = h => { const v = parseInt(h, 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(m[1]) + 0.7152 * f(m[2]) + 0.0722 * f(m[3]); }
function contrastOf(a, b){ const x = lumOf(a), y = lumOf(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
const isLight = hex => lumOf(hex) > 0.4;
/* the 40 × 40 symbol set: the tail symbols, also the logo's symbol */
const SYM40 = {
  stripe:'<polygon points="12,36 24,4 31,4 19,36"/>', star:'<polygon points="20,4 24.7,14.6 36,15.5 27.4,23 30.1,34.2 20,28.2 9.9,34.2 12.6,23 4,15.5 15.3,14.6"/>',
  chevron:'<path d="M5 31 L20 8 L35 31 L28 31 L20 19 L12 31 Z"/>', wave:'<path d="M3 22 C10 14 16 30 23 20 C28 13 33 13 37 15 L37 21 C33 19 29 20 25 25 C18 35 11 19 3 29 Z"/>',
  circle:'<path d="M20 5 A15 15 0 1 0 20 35 A15 15 0 1 0 20 5 Z M20 12 A8 8 0 1 1 20 28 A8 8 0 1 1 20 12 Z" fill-rule="evenodd"/>', arrow:'<path d="M20 4 L34 20 L25 20 L25 36 L15 36 L15 20 L6 20 Z"/>',
  wing:'<path d="M6 30 C 12 16, 24 12, 36 12 L36 18 C 26 18, 16 22, 10 30 Z"/>', dragon:'<path d="M8 30 L14 24 L12 18 L18 20 L20 10 L22 20 L30 18 L24 24 L30 30 Z"/>' };
const SHAPE40 = { square:'<rect x="2" y="2" width="36" height="36" rx="4"/>', circle:'<circle cx="20" cy="20" r="19"/>',
  shield:'<path d="M20 2 L37 8 C37 24 30 33 20 38 C10 33 3 24 3 8 Z"/>', fin:'<path d="M3 37 L17 3 L37 3 L37 37 Z"/>' };
function defaultLogo(){ const has = id => PAL.some(c => c.id === id), c1 = has('navy') ? 'navy' : (PAL[1] || PAL[0] || {}).id, c2 = has('yellow') ? 'yellow' : (PAL[4] || PAL[0] || {}).id;
  return { shape:(LIV.logoShapes[2] || LIV.logoShapes[0] || { id:'shield' }).id, symbol:(LIV.tails[1] || LIV.tails[0] || { id:'star' }).id, c1, c2 }; }
function logoOf(){ const A = S && S.airline; if(!A) return defaultLogo(); if(!A.logo) A.logo = defaultLogo(); return A.logo; }
/* the logo as a 40 × 40 group (no outer svg), colours inline so it prints */
function logoMark(g, o){ g = g || logoOf(); o = o || {}; const sym = SYM40[g.symbol] || SYM40.star, shape = SHAPE40[g.shape] || SHAPE40.shield;
  const c1 = hexOf(g.c1), c2 = hexOf(g.c2);
  return `<g class="logo-mark">${shape.replace('<', `<g fill="${c1}" stroke="rgba(0,0,0,.25)" stroke-width=".6"><`).replace(/\/>$/, '/></g>')}<g fill="${c2}" transform="translate(20 20) scale(.62) translate(-20 -20)">${sym}</g></g>`; }
function logoSvg(size, g, cls){ return `<svg class="logo ${cls || ''}" viewBox="0 0 40 40" style="width:${size || 32}px;height:${size || 32}px" aria-hidden="true">${logoMark(g)}</svg>`; }

/* ---------- liveries ---------- */
function defaultLivery(){ const g = logoOf(), st = LIV.stripes.find(x => x.id === 'thin') || LIV.stripes[1] || LIV.stripes[0] || { id:'none' };
  return { body: PAL.some(c => c.id === 'white') ? 'white' : (PAL[0] || {}).id, belly:g.c1, engine:g.c1, second:g.c2, stripe:st.id, tail: LIV.tails.some(t => t.id === 'logo') ? 'logo' : (LIV.tails[0] || { id:'stripe' }).id }; }
function normLivery(L){ const d = defaultLivery(); return Object.assign(d, L || {}); }
function surpriseLivery(){ const pick = a => a[Math.floor(Math.random() * a.length)]; if(!PAL.length) return defaultLivery();
  const L = defaultLivery(); L.body = pick(PAL).id; do { L.second = pick(PAL).id; } while(PAL.length > 1 && L.second === L.body);
  L.belly = pick(PAL).id; L.engine = pick([L.belly, L.second, L.body]); if(LIV.stripes.length) L.stripe = pick(LIV.stripes).id; if(LIV.tails.length) L.tail = pick(LIV.tails).id; return L; }
/* text colours that stay readable on the chosen colours */
function artFills(L){ const body = hexOf(L.body), belly = hexOf(L.belly), second = hexOf(L.second), lightB = isLight(body), lightBelly = isLight(belly);
  return { name: contrastOf(second, body) >= 2 ? second : (lightB ? '#1B2A4A' : '#F4F6F8'), reg: lightB ? 'rgba(10,20,32,.78)' : 'rgba(255,255,255,.88)', pname: lightBelly ? 'rgba(10,20,32,.8)' : 'rgba(255,255,255,.85)' }; }
function artIdOf(planeId){ const p = planeById(planeId); const id = p && p.artworkId; if(id && ARTWORK[id]) return id; return ARTWORK.dhc6 ? 'dhc6' : null; }
let ART_N = 0;
/* the painted aircraft: f is a fleet entry (or {planeId, livery, registration, name}); o.cls adds classes (anim: propellers turn; stage: the hangar) */
function aircraftArt(f, o){
  o = o || {}; const art = o.art || artIdOf(f.planeId); if(!art) return planeSvg(planeById(f.planeId) || PLANES[0], o.cls);
  const u = 'a' + (++ART_N), L = normLivery(f.livery), fills = artFills(L), name = o.name !== undefined ? o.name : String(S && S.airline && S.airline.name || '').toUpperCase();
  let h = ARTWORK[art].replace(/@U/g, u);
  h = h.replace(/class="([^"]*)\bst st-([\w-]+)/g, (m, pre, id) => `class="${pre}st st-${id}${id === L.stripe ? ' on' : ''}`);
  h = h.replace(/class="([^"]*)\btl tl-([\w-]+)/g, (m, pre, id) => `class="${pre}tl tl-${id}${id === L.tail ? ' on' : ''}`);
  h = h.replace('@LOGO', L.tail === 'logo' ? logoMark(logoOf()) : '');
  h = h.replace('@NAMEFILL', fills.name).replace('@REGFILL', fills.reg).replace('@PNAMEFILL', fills.pname);
  h = h.replace('@NAME', esc(name)).replace('@REG', esc(f.registration || '')).replace('@PNAME', esc(f.name || ''));
  const p = planeById(f.planeId);
  return `<svg class="art ${o.cls || ''}" viewBox="0 0 1200 440" data-uid="${f.uid || ''}" data-liv="${esc(livKey(f))}" style="--body:${hexOf(L.body)};--belly:${hexOf(L.belly)};--engine:${hexOf(L.engine)};--second:${hexOf(L.second)}" role="img" aria-label="${esc((p ? p.name : 'Aircraft') + (f.registration ? ' ' + f.registration : '') + ' in your colours')}">${h}</svg>`;
}
function livKey(f){ return JSON.stringify([normLivery(f.livery), f.registration || '', f.name || '', S && S.airline ? [S.airline.name, logoOf()] : null]); }
/* update a drawn aircraft in place (colours, stripe, tail, wording) so the shine can play; true when something changed */
function repaintArt(svg, f){
  if(!svg) return false; const k = livKey(f); if(svg.getAttribute('data-liv') === k) return false;
  const L = normLivery(f.livery), fills = artFills(L);
  svg.style.setProperty('--body', hexOf(L.body)); svg.style.setProperty('--belly', hexOf(L.belly)); svg.style.setProperty('--engine', hexOf(L.engine)); svg.style.setProperty('--second', hexOf(L.second));
  svg.querySelectorAll('.st').forEach(e => e.classList.toggle('on', e.classList.contains('st-' + L.stripe)));
  svg.querySelectorAll('.tl').forEach(e => e.classList.toggle('on', e.classList.contains('tl-' + L.tail)));
  const lg = svg.querySelector('.tl-logo'); if(lg){ const want = L.tail === 'logo' ? logoMark(logoOf()) : ''; if(lg._logo !== want){ lg._logo = want; lg.innerHTML = want; } }
  const t = (cls, text, fill) => { const e = svg.querySelector(cls); if(e){ if(e.textContent !== text) e.textContent = text; e.setAttribute('fill', fill); } };
  t('.t-name', String(S.airline.name || '').toUpperCase(), fills.name); t('.t-reg', f.registration || '', fills.reg); t('.t-pname', f.name || '', fills.pname);
  svg.setAttribute('data-liv', k); return true;
}
/* the floor line sits under the wheels whatever the stage's shape (the wheels are 86% of the way down the drawing) */
let hangarRO = null;
function layoutHangar(root){ (root || document).querySelectorAll('.hangar').forEach(H => { const a = H.querySelector('.art'); if(!a) return; const r = a.getBoundingClientRect(), hr = H.getBoundingClientRect(); if(!hr.height || !r.height) return;
  H.style.setProperty('--floor', Math.min(96, Math.max(30, 100 * (r.top - hr.top + r.height * 0.857) / hr.height)).toFixed(1) + '%');
  try{ if(!hangarRO && 'ResizeObserver' in window) hangarRO = new ResizeObserver(() => layoutHangar()); if(hangarRO && !H._ro){ H._ro = true; hangarRO.observe(H); } }catch(e){} }); }
function glintArt(root){ (root || document).querySelectorAll('.art .glint').forEach(g => { g.classList.remove('go'); void g.getBoundingClientRect(); g.classList.add('go'); }); }
/* the hangar: floor, the aircraft, the doors, the caption */
function hangarHtml(f, o){
  o = o || {}; const p = planeById(f.planeId);
  return `<div class="hangar ${o.cls || ''}" data-uid="${f.uid}"><div class="h-floor"></div><div class="roll ${o.rolled === false ? '' : 'done'}">${aircraftArt(f, { cls:'anim stage' })}</div>
    <div class="doors ${o.shut ? 'shut' : ''}"><div></div><div></div></div>${o.banner ? `<div class="h-banner">${o.banner}</div>` : ''}</div>
    ${o.caption === false ? '' : `<div class="h-cap"><span>Registration <b class="mono">${esc(f.registration || '—')}</b></span><span>Name <b>${esc(f.name || '—')}</b></span><span class="muted">${esc(p ? p.name : '')}</span>${o.right !== undefined ? o.right : `<span class="h-live">${!IS_DISPLAY && iwbConnected() ? '● Shown live on the whiteboard' : ''}</span>`}</div>`}`;
}
/* reduced motion: the OS setting or the teacher's */
function reducedMotion(){ try{ if(settings.reduceMotion) return true; return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return !!settings.reduceMotion; } }
function applyMotion(){ document.body.classList.toggle('rm', reducedMotion()); }
/* publish a little later: the paint shop changes many times a second while a swatch is tried */
let pubTimer = null;
function publishSoon(){ clearTimeout(pubTimer); pubTimer = setTimeout(() => { pubTimer = null; publish(); if(wallView) renderDisplay(); }, 90); }

/* ---------- registration and plane names ---------- */
function regLetters(s){ return String(s || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); }
function regTaken(letters, uid){ return S.fleet.some(f => f.uid !== uid && f.registration === 'G-' + letters); }
function suggestReg(uid){ const base = regLetters(String(S.airline.name || 'PLANE').replace(/\s+/g, '')).padEnd(4, 'A'); let v = base, k = 0;
  while(regTaken(v, uid) && k < 26){ v = base.slice(0, 3) + String.fromCharCode(65 + (k++)); } return v; }
function regCheck(letters, uid){ if(letters.length !== 4) return { ok:false, msg:'Four letters after G-, like G-BERT.' }; if(regTaken(letters, uid)) return { ok:false, msg:`Another plane already has G-${letters}. Try different letters.` }; return { ok:true, msg:`G-${letters} is yours.` }; }
function nameCheck(s){ s = String(s || ''); if(s.length > 22) return { ok:false, msg:'A name of up to 22 letters.' }; return { ok:true, msg:'' }; }
function nameSuggestions(f){ const all = LIV.planeNames.map(x => x.name).filter(n => !S.fleet.some(x => x.uid !== f.uid && x.name === n)); const seed = (f.uid || 1) - 1; return all.length ? Array.from({ length: Math.min(4, all.length) }, (_, i) => all[(seed * 4 + i) % all.length]).filter((v, i, a) => a.indexOf(v) === i) : []; }
/* every fleet entry carries its identity; older entries get one the first time they are drawn */
function ensureIdentity(f){ if(!f) return f; if(!f.livery) f.livery = defaultLivery(); if(!f.registration) f.registration = 'G-' + suggestReg(f.uid); if(f.name === undefined) f.name = ''; return f; }
function paintTarget(st){ const uid = st && st.uid !== undefined ? st.uid : (S.overlay && S.overlay.type === 'paint' ? S.overlay.uid : (S.fleet[0] || {}).uid); return ensureIdentity(S.fleet.find(f => f.uid === uid) || S.fleet[0]); }

/* ---------- the paint shop screen ---------- */
const PAINT_TABS = [['colours', '1 Colours'], ['tail', '2 Stripe & tail'], ['name', '3 Name it']];
function swatchRow(k, cur){ return `<div class="sw-row" data-k="${k}">${PAL.map(c => `<button class="sw ${c.id === cur ? 'on' : ''}" style="background:${c.hex}" data-c="${c.id}" aria-label="${esc(c.name)}" aria-pressed="${c.id === cur}" title="${esc(c.name)}"></button>`).join('')}</div>`; }
const miniStripe = inner => `<svg viewBox="0 0 84 44" aria-hidden="true"><rect x="2" y="12" width="80" height="22" rx="11" fill="#E9EEF3"/>${inner}</svg>`;
const STRIPE_MINI = { none:'', thin:'<rect x="2" y="24" width="80" height="3" fill="#D7263D"/>', band:'<rect x="2" y="22" width="80" height="7" fill="#D7263D"/>', swoosh:'<path d="M2 32 C30 32 56 28 82 16 L82 22 C56 34 30 38 2 38Z" fill="#D7263D"/>' };
function tailMini(id){ return id === 'logo' ? logoSvg(44, null, 'in-choice') : `<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="#D7263D">${SYM40[id] || ''}</g></svg>`; }
function paintTabHtml(f, tab){
  const L = normLivery(f.livery), grp = (h3, inner) => `<div class="grp"><h3>${h3}</h3>${inner}</div>`;
  if(tab === 'colours') return grp('Main colour', swatchRow('body', L.body)) + grp('Belly', swatchRow('belly', L.belly)) + grp('Engines', swatchRow('engine', L.engine));
  if(tab === 'tail') return grp('Stripe and tail colour', swatchRow('second', L.second))
    + grp('Stripe', `<div class="pchoices four" data-k="stripe">${LIV.stripes.map(s => `<button class="chc ${L.stripe === s.id ? 'on' : ''}" data-v="${s.id}" aria-pressed="${L.stripe === s.id}">${miniStripe(STRIPE_MINI[s.id] || '')}<span>${esc(s.name)}</span></button>`).join('')}</div>`)
    + grp('Tail symbol', `<div class="pchoices four" data-k="tail">${LIV.tails.map(t => `<button class="chc ${L.tail === t.id ? 'on' : ''}" data-v="${t.id}" aria-pressed="${L.tail === t.id}">${tailMini(t.id)}<span>${esc(t.name)}</span></button>`).join('')}</div>`);
  const letters = regLetters(String(f.registration || '').replace(/^G-/, '')), rc = regCheck(letters, f.uid), sug = nameSuggestions(f);
  return grp('Registration letters', `<div class="field"><span class="pre">G-</span><input id="regIn" class="reg-in" maxlength="4" value="${esc(letters)}" autocomplete="off" spellcheck="false" aria-label="Registration letters"></div><p class="hint" id="regMsg">${esc(rc.ok ? 'Every plane in the UK has a registration starting with G. Choose four letters.' : rc.msg)}</p>`)
    + grp('Plane name', `<div class="field"><input id="pnameIn" class="pname-in" maxlength="22" value="${esc(f.name || '')}" placeholder="Give it a name (optional)" autocomplete="off" aria-label="Plane name"></div>${sug.length ? `<div class="sugg">${sug.map(n => `<button class="btn small" data-sg="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : ''}`);
}
function paintReady(f){ return regCheck(regLetters(String(f.registration || '').replace(/^G-/, '')), f.uid).ok && nameCheck(f.name).ok; }
R.paint = st => {
  st = st || step(); const overlay = S.overlay && S.overlay.type === 'paint';
  if(!S.fleet.length && !overlay) buyPlane(planeById('dhc6'));
  const f = paintTarget(st), p = planeById(f.planeId), first = S.phase === 'setup', tab = UI.paintTab || 'colours';
  const title = first ? 'Paint your first plane' : overlay ? `Repaint the ${p.name.replace(/^DHC-6 /, '')}` : `Paint your new ${p.name.replace(/^DHC-6 /, '')}`;
  const head = first ? idHeader(title, 'Paint your first plane. Choose colours, a stripe and a tail symbol, then give it registration letters and a name.') : header(title, 'Paint your plane.', overlay ? 'Your fleet' : undefined);
  screen().innerHTML = `<div class="card stack id-card paint-card">${head}
    <div class="paint"><section class="pnl stage-pnl"><div class="stage-top"><h1>${esc(title)}</h1><span class="muted">${esc(p.name)} · ${p.seats} seats</span></div>${hangarHtml(f)}</section>
      <aside class="pnl paint-ctl"><div class="pstabs" role="tablist">${PAINT_TABS.map(([id, l]) => `<button class="pstab ${tab === id ? 'on' : ''}" data-ptab="${id}" role="tab" aria-selected="${tab === id}">${l}</button>`).join('')}</div>
        <div class="pstab-body" id="ptabBody">${paintTabHtml(f, tab)}</div>
        <div class="pt-act"><button class="btn big" id="surprise">Surprise me</button><button class="btn primary big" id="roll" ${paintReady(f) ? '' : 'disabled'}>${overlay ? 'Done' : first ? 'Roll it out' : 'Roll it out'} &#9654;</button></div></aside></div>
    ${first ? `<div class="actions id-act">${backBtn()}</div>` : overlay ? '' : `<div class="actions id-act">${backBtn()}</div>`}</div>`;
  bindPaint(f, st); layoutHangar(screen());
};
R.fin = R.paint;   // a save made on the old livery card carries on here
function bindPaint(f, st){
  const stage = screen().querySelector('.hangar .art'), sync = () => { if(repaintArt(stage, f)) glintArt(screen()); const cap = screen().querySelector('.h-cap'); if(cap){ const b = cap.querySelectorAll('b'); if(b[0]) b[0].textContent = f.registration || '—'; if(b[1]) b[1].textContent = f.name || '—'; } $('roll').disabled = !paintReady(f); publishSoon(); };
  screen().querySelectorAll('[data-ptab]').forEach(b => b.onclick = () => { UI.paintTab = b.getAttribute('data-ptab'); render(); });
  screen().querySelectorAll('.sw-row').forEach(row => row.querySelectorAll('.sw').forEach(b => b.onclick = () => { f.livery[row.getAttribute('data-k')] = b.getAttribute('data-c'); row.querySelectorAll('.sw').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); sync(); }));
  screen().querySelectorAll('.pchoices').forEach(ch => ch.querySelectorAll('.chc').forEach(b => b.onclick = () => { f.livery[ch.getAttribute('data-k')] = b.getAttribute('data-v'); ch.querySelectorAll('.chc').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); sync(); }));
  const ri = $('regIn'); if(ri){ ri.oninput = () => { const v = regLetters(ri.value); if(ri.value !== v) ri.value = v; f.registration = 'G-' + v; const rc = regCheck(v, f.uid); $('regMsg').textContent = rc.ok ? 'Every plane in the UK has a registration starting with G. Choose four letters.' : rc.msg; $('regMsg').classList.toggle('calm', !rc.ok); sync(); }; }
  const pi = $('pnameIn'); if(pi){ pi.oninput = () => { f.name = pi.value.slice(0, 22); sync(); }; }
  screen().querySelectorAll('[data-sg]').forEach(b => b.onclick = () => { f.name = b.getAttribute('data-sg'); if(pi) pi.value = f.name; sync(); });
  on('surprise', () => { f.livery = surpriseLivery(); render(); glintArt(screen()); publishSoon(); });
  on('roll', () => { if(!paintReady(f)) return; f.registration = 'G-' + regLetters(String(f.registration).replace(/^G-/, '')); f.name = String(f.name || '').trim();
    if(S.overlay && S.overlay.type === 'paint'){ S.overlay = null; render(); return; }
    delete S.rnd.reveal; next(); });
}

/* ---------- the hangar reveal: doors close over the stage, open again, the plane rolls in and shines ---------- */
function revealTimes(short){ const base = +(SET.revealSeconds) > 0 ? +SET.revealSeconds : 6, total = Math.max(0.3, base * (short ? 0.5 : 1) * liveScale());
  return { shut: total * 0.25, open: total * 0.42, rolled: total, total }; }
/* runs the same timeline in both windows from the published start time */
function revealRun(root, at, short, onDone){
  const H = root.querySelector('.hangar'), doors = H && H.querySelector('.doors'), roll = H && H.querySelector('.roll'), cap = root.querySelector('.h-cap'); if(!H) return;
  const T = revealTimes(short), el = Math.max(0, (Date.now() - at) / 1000), rm = reducedMotion();
  const finish = () => { doors.classList.remove('shut'); roll.classList.remove('go'); roll.classList.add('done'); H.classList.add('lit'); if(cap) cap.classList.add('show'); glintArt(root); if(onDone) onDone(); };
  if(rm || el >= T.total){ H.classList.add('fade'); finish(); return; }
  if(cap) cap.classList.remove('show'); roll.classList.remove('done', 'go'); H.classList.remove('lit');
  const t = (s, fn) => { const d = (s - el) * 1000; if(d <= 0) fn(); else H._timers.push(setTimeout(fn, d)); };
  H._timers = H._timers || [];
  if(el < T.shut) doors.classList.add('shut'); else doors.classList.remove('shut');
  t(T.shut, () => doors.classList.remove('shut'));
  t(T.open, () => { H.classList.add('lit'); roll.style.setProperty('--roll', (T.rolled - T.open).toFixed(2) + 's'); roll.classList.add('go'); });
  t(T.rolled, finish);
}
R.reveal = st => {
  const f = paintTarget(st), p = planeById(f.planeId), short = !!st.short || S.phase !== 'setup';
  if(!S.rnd.reveal || S.rnd.reveal.uid !== f.uid){ S.rnd.reveal = { at:Date.now(), uid:f.uid, short, done:false }; publish(); }
  const head = S.phase === 'setup' ? idHeader('Roll it out', 'The hangar doors open and your plane rolls out.') : header('Roll it out', 'The hangar doors open and your new plane rolls out.');
  screen().innerHTML = `<div class="card stack id-card reveal-card">${head}
    <div class="pnl stage-pnl big">${hangarHtml(f, { rolled:false, shut:true, right:`<span class="h-live">${!IS_DISPLAY && iwbConnected() ? '● Shown live on the whiteboard' : ''}</span>` })}</div>
    <div class="actions id-act"><span class="muted grow" id="revText">${esc(p.name)} ${esc(f.registration)}${f.name ? ' · ' + esc(f.name) : ''}</span><button class="btn big" id="skipReveal">Skip</button><button class="btn primary big" id="nx" hidden>Continue &#9654;</button></div></div>`;
  const done = () => { const n = $('nx'); if(n){ n.hidden = false; } const sk = $('skipReveal'); if(sk) sk.hidden = true; if(S.rnd.reveal && !S.rnd.reveal.done){ S.rnd.reveal.done = true; publishSoon(); } };
  layoutHangar(screen()); revealRun(screen(), S.rnd.reveal.at, short, done);
  on('skipReveal', () => { const H = screen().querySelector('.hangar'); (H._timers || []).forEach(clearTimeout); H._timers = []; S.rnd.reveal.at = 0; revealRun(screen(), 0, short, done); });
  on('nx', () => { delete S.rnd.reveal; next(); });
};

/* ---------- the first take-off (launch day, before live operations): on the wall, with sound if the teacher has it on ---------- */
function takeoffSecs(){ return Math.max(0.3, 7 * liveScale()); }
function firstFlightInfo(){ const f = S.fleet[0] || {}, p = planeById(f.planeId || 'dhc6'), sched = f.uid ? schedOf(f) : [], r = sched.length ? routeById(sched[0]) : (S.market ? routeById(S.market) : null);
  let dep = firstDep(); try{ if(sched.length){ const D = TIME.day(p, sched, undefined, typeof fleetDeps === 'function' ? fleetDeps(f) : undefined); if(D.trips.length) dep = D.trips[0].dep; } }catch(e){}
  return { f, p, r, dep, code: flightCode(0, 0) }; }
R.takeoff = st => {
  const I = firstFlightInfo(), T = S.rnd.takeoff, running = T && !S.rnd.takeoffDone, done = !!S.rnd.takeoffDone;
  screen().innerHTML = `<div class="card stack id-card takeoff-card">${header('Take-off', 'Your first flight is leaving. Watch the whiteboard.', 'Launch day')}<p class="id-todo">${done ? 'Press Continue: your airline is flying.' : running ? 'Watch the whiteboard: your first flight is taking off.' : 'Press Start the take-off and watch the whiteboard.'}</p>
    <div class="pnl stage-pnl big"><div class="runway" id="runway">${done || running ? '' : ''}${runwayHtml(I)}</div></div>
    <div class="actions id-act"><span class="muted grow">${I.r ? `<b>${esc(I.code)}</b> to ${esc(I.r.city)} at <b class="mono">${fmtTime(I.dep)}</b>` : 'Your first flight'}${!IS_DISPLAY && iwbConnected() ? ' · shown on the whiteboard' : ''}</span>
      ${done ? '' : `<button class="btn big" id="skipTo" ${running ? '' : 'hidden'}>Skip</button>`}<button class="btn primary big" id="toGo" ${running || done ? 'hidden' : ''}>Start the take-off &#9654;</button><button class="btn primary big" id="nx" ${done ? '' : 'hidden'}>Continue &#9654;</button></div></div>`;
  const begin = () => { S.rnd.takeoff = { at:Date.now() }; delete S.rnd.takeoffDone; liveAudioUnlock(); publish(); render(); };
  const finish = () => { S.rnd.takeoffDone = true; if(wallView) setWallView(false); publish(); render(); };
  on('toGo', () => { begin(); if(!iwbConnected() && settings.autoWall !== false) setWallView(true); });
  on('skipTo', finish);
  on('nx', () => { delete S.rnd.takeoff; next(); });
  if(running) takeoffRun(screen(), S.rnd.takeoff.at, finish);
};
function runwayHtml(I){ const f = ensureIdentity(I.f.uid ? I.f : Object.assign({ uid:0, planeId:'dhc6' }, I.f));
  return `<div class="rw-sky"></div><div class="rw-ground"><div class="rw-strip"></div></div><div class="rw-plane">${aircraftArt(f, { cls:'anim' })}</div><div class="rw-cap"><b>${esc(I.code)}</b><span>${esc(homeData().code)} → ${esc(I.r ? (I.r.code || I.r.city) : '…')}</span><span class="rw-st">READY</span></div>`; }
/* the same timeline in both windows: taxi in, line up, roll, rotate, climb out */
function takeoffRun(root, at, onDone){
  const R0 = root.querySelector('.runway'); if(!R0) return; const total = takeoffSecs(), el = Math.max(0, (Date.now() - at) / 1000), rm = reducedMotion(), st = R0.querySelector('.rw-st');
  const stage = (k, label) => { R0.classList.remove('taxi', 'roll', 'climb', 'gone'); R0.classList.add(k); if(st) st.textContent = label; };
  R0._timers = (R0._timers || []); R0._timers.forEach(clearTimeout); R0._timers = [];
  R0.style.setProperty('--tk', total.toFixed(2) + 's');
  const t = (s, fn) => { const d = (s - el) * 1000; if(d <= 0) fn(); else R0._timers.push(setTimeout(fn, d)); };
  if(rm || el >= total){ stage('gone', 'AIRBORNE'); if(onDone) onDone(); return; }
  if(liveHere() && el < 0.5) takeoffSound(total);
  stage('taxi', 'TAXI'); t(total * 0.36, () => stage('roll', 'TAKE-OFF')); t(total * 0.68, () => stage('climb', 'AIRBORNE')); t(total, () => { stage('gone', 'AIRBORNE'); if(onDone) onDone(); });
}
/* engine spool-up (filtered noise and a rising tone), then the airport chime: nothing is downloaded */
function takeoffSound(secs){
  if(!opsSoundOn()) return; liveAudioUnlock(); if(!loAC) return;
  try{ const C = loAC, t0 = C.currentTime, n = Math.floor(C.sampleRate * Math.min(secs, 12)), buf = C.createBuffer(1, n, C.sampleRate), d = buf.getChannelData(0); for(let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = C.createBufferSource(); src.buffer = buf; const bp = C.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.8; bp.frequency.setValueAtTime(180, t0); bp.frequency.exponentialRampToValueAtTime(1400, t0 + secs * 0.7); bp.frequency.exponentialRampToValueAtTime(500, t0 + secs);
    const g = C.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.18, t0 + secs * 0.4); g.gain.setValueAtTime(0.18, t0 + secs * 0.75); g.gain.exponentialRampToValueAtTime(0.0001, t0 + secs);
    const o = C.createOscillator(), og = C.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(55, t0); o.frequency.exponentialRampToValueAtTime(140, t0 + secs * 0.7); og.gain.setValueAtTime(0.0001, t0); og.gain.exponentialRampToValueAtTime(0.05, t0 + secs * 0.5); og.gain.exponentialRampToValueAtTime(0.0001, t0 + secs);
    src.connect(bp); bp.connect(g); g.connect(C.destination); o.connect(og); og.connect(C.destination); src.start(t0); src.stop(t0 + secs); o.start(t0); o.stop(t0 + secs);
    setTimeout(() => liveChime('good'), Math.max(0, secs * 1000 - 400)); }catch(e){}
}

/* ---------- the whiteboard: the same stage, full screen ---------- */
const IDENTITY_MODES = ['identity', 'paint', 'reveal', 'cert', 'takeoff'];
function identityWallMode(){
  const st = step().t, o = S.overlay;
  if(['name', 'code', 'logo'].includes(st)) return 'identity';
  if(st === 'paint' || st === 'fin' || (o && o.type === 'paint')) return 'paint';
  if(st === 'reveal') return 'reveal';
  if(st === 'cert') return 'cert';
  if(st === 'takeoff' && S.rnd.takeoff && !S.rnd.takeoffDone) return 'takeoff';
  return null;
}
function sampleBoard(){ const code = S.airline.flightCode || S.airline.code || 'AS', rs = (WORLD.setupRoutes || []).map(routeById).filter(Boolean), t0 = firstDep();
  return rs.slice(0, 2).map((r, i) => ({ dep: t0 + i * 150, code: code + (101 + i * 2), city: r.city, status: i ? 'ON TIME' : 'BOARDING' })); }
function renderIdentityWall(mode){
  const O = $('wOver'), put = (box, html) => { if(box._html !== html){ box._html = html; box.innerHTML = html; } };
  $('wOps').hidden = true; $('wAlert').hidden = true; $('wSim').hidden = true; $('wStatus').className = 'w-status'; liveMapMode(false);
  $('wPeriod').textContent = 'LAUNCH DAY'; $('wDate').textContent = dateLong(1); const lv = $('wLive'); lv.className = 'w-live hold'; lv.textContent = mode === 'takeoff' ? '▶ FIRST TAKE-OFF' : '■ SETTING UP'; $('clock').textContent = gameClock();
  if(mode === 'identity'){
    O.hidden = true; O._html = ''; const fl = sampleBoard();
    $('dEmpty').hidden = true; $('aEmpty').hidden = false; $('aRows').innerHTML = ''; $('aEmpty').textContent = 'Arrivals appear once the airline flies.';
    $('dRows').innerHTML = fl.map(f => `<tr><td class="t">${fmtTime(f.dep)}</td><td class="f">${esc(f.code)}</td><td>${esc(f.city)}</td><td><span class="status ${f.status === 'BOARDING' ? 's-boarding' : 's-scheduled'}">${f.status}</span></td></tr>`).join('');
    $('wStatus').innerHTML = `<div class="ws-h">YOUR AIRLINE</div><div class="ws-logo">${logoSvg(150)}</div><div class="ws-big"><span>AIRLINE</span><b class="ws-name">${esc(S.airline.name || '—')}</b></div><div class="ws-big"><span>FLIGHT CODE</span><b>${esc(S.airline.flightCode || S.airline.code || '—')}</b></div>`;
    wallMap.autoFit(); wallMap.render(); return;
  }
  O.hidden = false;
  if(mode === 'takeoff'){ const I = firstFlightInfo(), key = 'takeoff:' + S.rnd.takeoff.at; if(O._html !== key){ O._html = key; O.innerHTML = `<div class="wo-stage"><div class="runway" id="wRunway">${runwayHtml(I)}</div><div class="wo-cap"><small>FIRST TAKE-OFF</small><b>${esc(I.code)} · ${esc(homeData().city)} → ${esc(I.r ? I.r.city : '')}</b></div></div>`; takeoffRun(O, S.rnd.takeoff.at, null); } return; }
  const f = paintTarget(step()); if(!f) return;
  if(mode === 'reveal'){ const rv = S.rnd.reveal || { at:Date.now(), short:false }, key = 'reveal:' + f.uid + ':' + rv.at;
    if(O._html !== key){ O._html = key; O.innerHTML = `<div class="wo-stage">${hangarHtml(f, { rolled:false, shut:true, caption:false })}<div class="wo-cap h-cap"><small>${S.phase === 'setup' ? 'YOUR FIRST PLANE' : 'NEW TO THE FLEET'}</small><b>${esc(planeById(f.planeId).name)} ${esc(f.registration)}</b>${f.name ? `<span>${esc(f.name)}</span>` : ''}</div></div>`; layoutHangar(O); revealRun(O, rv.at, rv.short, null); }
    else repaintArt(O.querySelector('.art'), f); return; }
  const key = (mode === 'cert' ? 'cert:' : 'paint:') + f.uid;
  if(O._html !== key){ O._html = key; O.innerHTML = `<div class="wo-stage">${hangarHtml(f, { caption:false, banner: mode === 'cert' ? '✓ AIR OPERATOR CERTIFICATE ISSUED' : '' })}<div class="wo-cap h-cap"><small>${mode === 'cert' ? 'CLEARED TO OPERATE' : 'IN THE PAINT SHOP'}</small><b>${esc(planeById(f.planeId).name)} <span class="wc-reg">${esc(f.registration || '')}</span></b><span class="wc-name">${esc(f.name || '')}</span></div></div>`; layoutHangar(O); glintArt(O); }
  else { const art = O.querySelector('.art'); if(repaintArt(art, f)) glintArt(O); const r = O.querySelector('.wc-reg'), n = O.querySelector('.wc-name'); if(r) r.textContent = f.registration || ''; if(n) n.textContent = f.name || ''; }
}
