/* Operations briefings: the shared kit (Fable's plan, 18 Oct 2026). Short animated scenes inside the airline's world:
   Show → Reveal → Use (no guesses since 19 Oct 2026, evening: nothing asks the pupil to predict, tap or pick an answer), the
   pupil's own airline and numbers (window.BRIEF, with fallbacks). Back and Next are always there (K.run, below).
   The game inlines this file into each briefing page; opened on its own, a page loads it from kit/.
   - K.start({ title }) builds the frame: a quiet bar (BRIEFING, the title, four progress marks, Pause & discuss, Skip in test
     mode), the scene (an SVG 1600 × 900 with an HTML layer over it in the same coordinates) and the caption line.
   - The scene clock stops while paused; K.wait and K.tween run on it. With reduced motion, tweens jump to their end and the
     same steps follow one another as still frames.
   - World pieces: the terminal and apron, gates, passengers, the pupil's own painted aircraft (BRIEF.art) or a drawn one,
     money, a fuel tank, a cash vault, day columns, a route strip, a line chart. */
const K = (() => {
  const B = Object.assign({}, window.BRIEF || {}), NS = 'http://www.w3.org/2000/svg';
  const RM = !!B.rm || (() => { try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } })();
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
  const money = v => (v < 0 ? '−' : '') + '£' + Math.round(Math.abs(v)).toLocaleString('en-GB'), num = v => Math.round(v).toLocaleString('en-GB');
  const esc = s => String(s === undefined || s === null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]);
  /* BertieV4 flat art (Claude Design handover 18 Oct 2026, section 4). The game sends kitFlat in year one: every piece is drawn
     from the kit's flat SVG pieces (briefings/kit/art, embedded by the build as window.KIT_ART): no filters, light from the
     upper left, square corners, aircraft at 12 px = 1 m facing left with a blank tail for the pupil's colour, Red Kite in
     its own oxblood. Without it (a later chapter, or a page opened on its own) the earlier look stays. */
  const ART = window.KIT_ART || {}, FLAT = B.kitFlat === true && !!ART['aircraft-twin-otter'], PCACHE = {}; let PN = 0;
  /* year one (the game sends kitFlat), or a page opened on its own: the Show / Reveal / Use stepper, Back, and Next always on.
     A briefing in a later chapter keeps today's frame (CLAUDE.md: new design goes into year one only). */
  const Y1 = B.kitFlat === true || !window.BRIEF;

  /* ---------- the scene clock ---------- */
  let T = 0, last = 0, paused = false; const ticks = new Set();
  function loop(now){ const dt = last ? Math.min(64, now - last) : 16; last = now; if(!paused){ T += dt; [...ticks].forEach(f => f(T)); } requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  const wait = ms => fast() ? Promise.resolve() : new Promise(res => { const t0 = T, f = t => { if(t - t0 >= ms){ ticks.delete(f); res(); } }; ticks.add(f); });
  const EASE = { io:t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, out:t => 1 - Math.pow(1 - t, 3), lin:t => t, in:t => t * t * t };
  function tween(ms, fn, ease){ const e = EASE[ease || 'io'] || EASE.io;
    if(RM || fast() || ms <= 0){ fn(1, 1); return Promise.resolve(); }
    return new Promise(res => { const t0 = T, f = t => { const k = clamp((t - t0) / ms, 0, 1); fn(e(k), k); if(k >= 1){ ticks.delete(f); res(); } }; ticks.add(f); }); }
  /* a repeating motion (a propeller, a gauge needle's shiver) that stops with pause and is off with reduced motion */
  function every(fn){ if(RM) return () => {}; ticks.add(fn); return () => ticks.delete(fn); }

  /* ---------- elements ---------- */
  const s = (tag, a, parent) => { const e = document.createElementNS(NS, tag); if(a) for(const k in a) if(a[k] !== undefined && a[k] !== null) e.setAttribute(k, a[k]); if(parent) parent.appendChild(e); return e; };
  const h = (tag, a, parent, html) => { const e = document.createElement(tag); if(a) for(const k in a) if(a[k] !== undefined && a[k] !== null) e.setAttribute(k, a[k]); if(html !== undefined) e.innerHTML = html; if(parent) parent.appendChild(e); return e; };
  const at = (g, x, y, sc, rot) => { g.setAttribute('transform', `translate(${(+x).toFixed(2)} ${(+y).toFixed(2)})${sc !== undefined && sc !== 1 ? ` scale(${sc})` : ''}${rot ? ` rotate(${rot})` : ''}`); return g; };
  const txt = (parent, x, y, str, a) => { const t = s('text', Object.assign({ x, y, fill:'#EAF2FF', 'font-size':22 }, a || {}), parent); t.textContent = str; return t; };

  let world, svg, defs, hud, cap, goBtn, backBtn, ask, marks, keysOn = false, layers = {};
  const STEPS = ['Show', 'Reveal', 'Use'];
  function start(o){
    o = o || {};
    document.title = 'Operations briefing — ' + (o.title || '');
    document.body.innerHTML = `<div class="bk${RM ? ' rm' : ''}${FLAT ? ' flat' : ''}"><header class="bk-bar"><span class="bk-eye">Briefing</span><span class="bk-title">${esc(o.title || '')}</span>${Y1 ? `<span class="bk-marks bk-steps">${(o.steps || STEPS).map(x => `<i>${esc(x)}</i>`).join('')}</span>` : `<span class="bk-marks">${'<i></i>'.repeat(o.marks || 4)}</span>`}<span class="bk-grow"></span>
      <button class="bk-btn" id="bkPause" title="Freeze the scene to talk about it">Pause &amp; discuss</button>${B.test ? '<button class="bk-btn" id="bkSkip" title="Teacher test mode">Skip</button>' : ''}</header>
      <main class="bk-stage"><div class="bk-world"></div><div class="bk-pz"><div><b>Paused</b><small>Talk it through, then carry on.</small><p style="margin:12px 0 0"><button class="bk-btn" id="bkResume">Resume</button></p></div></div></main>
      <footer class="bk-foot"><p class="bk-cap" aria-live="polite"></p>${Y1 ? '<button class="bk-back" type="button" disabled>&#9664; Back</button><button class="bk-go" type="button">Next &#9654;</button>' : '<button class="bk-go" hidden>Continue &#9654;</button>'}</footer></div>`;
    world = document.querySelector('.bk-world'); cap = document.querySelector('.bk-cap'); goBtn = document.querySelector('.bk-go'); backBtn = document.querySelector('.bk-back'); marks = [...document.querySelectorAll('.bk-marks i')];
    if(Y1){ goBtn.onclick = next; backBtn.onclick = back; setGo(); }
    svg = s('svg', { viewBox:'0 0 1600 900', preserveAspectRatio:'xMidYMid meet', role:'img', 'aria-label':o.title || 'Briefing scene' }, world); defs = s('defs', null, svg);
    ['back', 'mid', 'front', 'top'].forEach(k => layers[k] = s('g', { class:'ly-' + k }, svg));
    hud = h('div', { class:'bk-hud' }, world); ask = h('div', { class:'bk-ask out' }, hud);
    commonDefs();
    document.getElementById('bkPause').onclick = () => pause(!paused);
    document.getElementById('bkResume').onclick = () => pause(false);
    const sk = document.getElementById('bkSkip'); if(sk) sk.onclick = () => done({ skipped:true });
    if(!keysOn){ keysOn = true;   // once: a replay (Back) builds the frame again
      document.addEventListener('keydown', e => { const a = document.activeElement; if(e.key === 'Enter' && !goBtn.hidden && a !== goBtn && !(a && a.tagName === 'BUTTON' && a !== document.body)){ e.preventDefault(); goBtn.click(); } if((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) pause(!paused); }); }
    return K;
  }
  function pause(v){ paused = !!v; document.querySelector('.bk').classList.toggle('paused', paused); const b = document.getElementById('bkPause'); if(b) b.textContent = paused ? 'Resume' : 'Pause & discuss'; if(!paused) document.getElementById('bkPause').focus(); }
  function mark(n){ marks.forEach((m, i) => { m.className = i < n ? 'done' : i === n ? 'on' : ''; }); }
  async function caption(html){ if(!cap) return; if(cap.innerHTML === html) return; if(fast()){ cap.innerHTML = html || ''; cap.classList.remove('out'); return; } cap.classList.add('out'); await wait(RM ? 0 : 260); cap.innerHTML = html || ''; cap.classList.remove('out'); }
  function question(html){ if(!html){ ask.classList.add('out'); return; } ask.innerHTML = html; ask.classList.remove('out'); }
  /* ---------- Back and Next (19 Oct 2026, evening: "Next and Back are always allowed") ----------
     The briefing's script runs inside K.run(body); each K.cont() ends a beat. Next is always there: at a K.cont() it goes on,
     and while a beat is still playing it finishes the beat at once and goes on. Back plays the script again from the top with
     every wait, tween and caption instant (as under reduced motion) to the start of the beat before, which then plays as
     normal. A decision the scene waits for (an Operations Request, the reserve line) holds Next until it is made, and a replay
     passes through it with the choice already made: K.decide(promise). */
  let BODY = null, FF = 0, SKIP = false, BEATS = 0, pend = null, HOLD = 0, DN = 0, goL = null; const ANS = [];
  function fast(){ return FF > 0 || SKIP; }
  function run(body){ BODY = body; replay(0); return K; }
  function replay(target){ ticks.clear(); paused = false; FF = target; SKIP = false; BEATS = 0; pend = null; HOLD = 0; DN = 0; goL = null; BODY(); }
  function setGo(){ if(!goBtn || !Y1) return; const L = pend && goL ? goL : { label:'Next' }; goBtn.hidden = !pend && HOLD > 0;
    goBtn.classList.toggle('sec', L.kind === 'sec'); goBtn.innerHTML = (L.label || 'Next') + (L.kind === 'sec' ? '' : ' &#9654;'); backBtn.disabled = BEATS < 1; }
  function cont(label, kind){
    if(!Y1) return new Promise(res => { goBtn.classList.toggle('sec', kind === 'sec'); goBtn.innerHTML = (label || 'Continue') + (kind === 'sec' ? '' : ' &#9654;'); goBtn.hidden = false; setTimeout(() => goBtn.focus(), 30); goBtn.onclick = () => { goBtn.hidden = true; goBtn.onclick = null; res(); }; });
    if(FF > 0){ FF--; BEATS++; setGo(); return Promise.resolve(); }
    if(SKIP){ SKIP = false; BEATS++; setGo(); return Promise.resolve(); }
    return new Promise(res => { pend = res; goL = { label:label || 'Next', kind }; setGo(); setTimeout(() => { try{ goBtn.focus({ preventScroll:true }); }catch(e){} }, 30); }); }
  function next(){
    if(pend){ const r = pend; pend = null; goL = null; BEATS++; setGo(); r(); return; }
    if(HOLD > 0) return;
    SKIP = true; T += 1e7; [...ticks].forEach(f => f(T));   // what is playing now ends at once; the rest of the beat is instant
  }
  function back(){ if(BEATS < 1) return; replay(BEATS - 1); }
  async function decide(p){ if(!Y1) return p; const i = DN++;
    if(FF > 0 && i < ANS.length) return ANS[i];   // replaying for Back: the choice already made
    FF = 0; SKIP = false;   // a choice not made yet: a replay or a skip (Next mid-beat) stops here and waits for it
    HOLD++; setGo(); try{ const v = await p; ANS[i] = v; ANS.length = i + 1; return v; } finally { HOLD--; setGo(); } }
  function done(extra){
    const msg = Object.assign({ type:'briefing-done', id:B.id || (document.body.dataset && document.body.dataset.brief) || '' }, extra || {});
    if(window.parent && window.parent !== window) window.parent.postMessage(msg, '*');
    else { const d = h('div', { class:'bk-pz', style:'display:grid' }, document.querySelector('.bk-stage'), `<div><b>End of the briefing</b><small>In the game it now folds back into the screen it prepared.</small></div>`); }
  }
  /* a place in the scene for HTML: x, y in scene units → % of the world */
  const pos = (el, x, y) => { el.style.left = (100 * x / 1600) + '%'; el.style.top = (100 * y / 900) + '%'; return el; };
  function call(x, y, html, cls){ const c = h('div', { class:'bk-call ' + (cls || '') }, hud, html); pos(c, x, y); c.move = (x2, y2) => pos(c, x2, y2); c.say = v => { c.innerHTML = v; }; c.out = v => c.classList.toggle('out', v !== false); return c; }
  /* chips: one is chosen (a guess, a day, a plane); resolves with its value */
  function chips(o){
    const box = h('div', { class:'bk-chips', role:'group', 'aria-label':o.label || 'Choose one' }, hud); pos(box, o.x, o.y); if(o.center) box.style.transform = 'translateX(-50%)';
    const btns = o.items.map(it => { const b = h('button', { class:'bk-chip', 'aria-pressed':'false', type:'button' }, box, `${esc(it.label)}${it.small !== undefined ? `<small>${esc(it.small)}</small>` : ''}`); b.val = it.value; return b; });   // (a button's own value would turn a number into a string)
    const api = { box, btns, pick:null, set:(v, cls, on) => { btns.forEach(b => { if(b.val === v) b.classList.toggle(cls, on !== false); }); }, off:() => btns.forEach(b => b.disabled = true), remove:() => box.remove(),
      wait:() => new Promise(res => btns.forEach(b => b.onclick = () => { btns.forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); api.pick = b.val; if(o.onPick) o.onPick(b.val); res(b.val); })) };
    return api;
  }
  /* a drag rail with stops (a fare, a number of days): onMove(value) at each stop; keyboard arrows too */
  function rail(o){
    const r = h('div', { class:'bk-rail idle' }, hud); pos(r, o.x, o.y); r.style.width = (100 * o.w / 1600) + '%'; r.style.transform = 'translateY(-50%)';
    h('div', { class:'tr' }, r); const n = o.stops.length, fx = i => (n === 1 ? 50 : 100 * i / (n - 1)) + '%';
    o.stops.forEach((v, i) => { const t = h('div', { class:'tk' }, r); t.style.left = fx(i); });
    const hd = h('div', { class:'hd', role:'slider', tabindex:'0', 'aria-label':o.label || 'Drag', 'aria-valuemin':o.stops[0], 'aria-valuemax':o.stops[n - 1] }, r);
    let i = Math.max(0, o.stops.indexOf(o.value)); const api = { el:r, i, value:o.stops[i], seen:new Set([i]), onEnd:null };
    const set = (k, user) => { k = clamp(k, 0, n - 1); hd.style.left = fx(k); hd.setAttribute('aria-valuenow', o.stops[k]); if(k === api.i) return; api.i = k; api.value = o.stops[k]; api.seen.add(k); if(o.onMove) o.onMove(o.stops[k], k, user); };
    set(i); api.set = k => set(k, false);
    const at = ev => { const b = r.getBoundingClientRect(); return Math.round(clamp((ev.clientX - b.left) / b.width, 0, 1) * (n - 1)); };
    r.addEventListener('pointerdown', ev => { if(api.locked) return; r.classList.remove('idle'); r.classList.add('drag'); r.setPointerCapture(ev.pointerId); set(at(ev), true); });
    r.addEventListener('pointermove', ev => { if(r.classList.contains('drag')) set(at(ev), true); });
    const up = () => { if(!r.classList.contains('drag')) return; r.classList.remove('drag'); if(api.onEnd) api.onEnd(api.value); };
    r.addEventListener('pointerup', up); r.addEventListener('pointercancel', up);
    hd.addEventListener('keydown', ev => { if(api.locked) return; if(ev.key === 'ArrowRight' || ev.key === 'ArrowUp'){ ev.preventDefault(); r.classList.remove('idle'); set(api.i + 1, true); if(api.onEnd) api.onEnd(api.value); } if(ev.key === 'ArrowLeft' || ev.key === 'ArrowDown'){ ev.preventDefault(); set(api.i - 1, true); if(api.onEnd) api.onEnd(api.value); } });
    api.focus = () => hd.focus(); api.lock = v => { api.locked = v !== false; r.style.opacity = api.locked ? .55 : 1; };
    return api;
  }
  /* a number that counts to its value, in SVG text or an HTML element */
  function count(el, from, to, ms, fmt){ fmt = fmt || num; return tween(ms === undefined ? 600 : ms, k => { el.textContent = fmt(lerp(from, to, k)); }, 'out'); }

  /* ---------- the world: shared definitions ---------- */
  function grad(id, stops, x1, y1, x2, y2, rad){ const g = s(rad ? 'radialGradient' : 'linearGradient', rad ? { id, cx:x1, cy:y1, r:x2 } : { id, x1, y1, x2, y2 }, defs); stops.forEach(([o, c, op]) => s('stop', { offset:o, 'stop-color':c, 'stop-opacity':op === undefined ? 1 : op }, g)); return g; }
  function commonDefs(){
    grad('gSky', [[0, '#071a38'], [.55, '#123a6b'], [1, '#2c6aa3']], 0, 0, 0, 1);
    grad('gSkyDay', [[0, '#1d4f8a'], [.6, '#3d7fbf'], [1, '#8fc3ea']], 0, 0, 0, 1);
    grad('gApron', [[0, '#1b3354'], [1, '#0d1d33']], 0, 0, 0, 1);
    grad('gFloor', [[0, '#0f2547'], [1, '#081831']], 0, 0, 0, 1);
    grad('gGlassSheen', [[0, '#9fd6ff', .10], [.5, '#9fd6ff', 0], [1, '#9fd6ff', .05]], 0, 0, 1, 1);
    grad('gLightPool', [[0, '#7fc8ff', .16], [1, '#7fc8ff', 0]], .5, .5, .5, 0, true);
    grad('gGold', [[0, '#FFE08A'], [1, '#E0A72E']], 0, 0, 0, 1);
    grad('gNote', [[0, '#9ad8bd'], [1, '#5fae8e']], 0, 0, 0, 1);
    grad('gMetal', [[0, '#cfe0f2'], [.5, '#8fa9c6'], [1, '#56708f']], 0, 0, 1, 0);
    grad('gFuel', [[0, '#3fb6ff'], [1, '#1a6fb8']], 0, 0, 0, 1);
    grad('gPanel', [[0, '#14335f'], [1, '#0b2246']], 0, 0, 0, 1);
    Object.entries(PEOPLE).forEach(([k, c]) => grad('gP-' + k, [[0, c.lit], [1, c.body]], 0, 0, 1, 0));
    if(FLAT){ flatDefs(); return; }
    const f = s('filter', { id:'fSh', x:'-30%', y:'-30%', width:'160%', height:'160%' }, defs); s('feDropShadow', { dx:-6, dy:10, stdDeviation:8, 'flood-color':'#000', 'flood-opacity':.45 }, f);
    const f2 = s('filter', { id:'fSoft', x:'-30%', y:'-30%', width:'160%', height:'160%' }, defs); s('feDropShadow', { dx:-2, dy:4, stdDeviation:3, 'flood-color':'#000', 'flood-opacity':.35 }, f2);
    const gl = s('filter', { id:'fGlow', x:'-50%', y:'-50%', width:'200%', height:'200%' }, defs); s('feGaussianBlur', { stdDeviation:6, result:'b' }, gl); const m = s('feMerge', null, gl); s('feMergeNode', { in:'b' }, m); s('feMergeNode', { in:'SourceGraphic' }, m);
    // the same glow for thin things (a line's own box is too flat for a filter measured in its size)
    const gl2 = s('filter', { id:'fGlowLine', filterUnits:'userSpaceOnUse', x:0, y:0, width:1600, height:900 }, defs); s('feGaussianBlur', { stdDeviation:5, result:'b' }, gl2); const m2 = s('feMerge', null, gl2); s('feMergeNode', { in:'b' }, m2); s('feMergeNode', { in:'SourceGraphic' }, m2);
  }

  /* the terminal interior: a glass wall onto the apron (sky, the far side of the airfield, runway lights), pillars, the floor */
  function terminal(o){
    o = o || {}; if(FLAT) return terminalFlat(o); const g = layers.back, glassB = o.glassBottom || 520, sky = o.day ? 'url(#gSkyDay)' : 'url(#gSky)';
    s('rect', { x:0, y:0, width:1600, height:glassB, fill:sky }, g);
    // the far side: hangars and the tower, low and dark
    const far = s('g', { opacity:.9 }, g), hz = o.horizon || 330;
    s('path', { d:`M0 ${hz} L0 ${hz - 18} L120 ${hz - 18} L120 ${hz - 34} L300 ${hz - 34} L300 ${hz - 14} L520 ${hz - 14} L520 ${hz - 26} L760 ${hz - 26} L760 ${hz - 10} L1600 ${hz - 10} L1600 ${hz} Z`, fill:'#0a1a31' }, far);
    if(o.tower !== false){ s('rect', { x:212, y:hz - 120, width:16, height:90, fill:'#0a1a31' }, far); s('path', { d:`M196 ${hz - 120} L244 ${hz - 120} L238 ${hz - 146} L202 ${hz - 146} Z`, fill:'#0c2240' }, far); s('rect', { x:204, y:hz - 142, width:32, height:9, fill:'#7fd0ff', opacity:.55 }, far); }
    s('rect', { x:0, y:hz, width:1600, height:glassB - hz, fill:'url(#gApron)' }, g);
    // runway and taxiway lights in rows, smaller with distance
    for(let r = 0; r < 3; r++){ const yy = hz + 8 + r * 16, sz = 1.6 + r * .9; for(let x = (r * 37) % 60; x < 1600; x += 60 - r * 8) s('circle', { cx:x, cy:yy, r:sz, fill:r === 1 ? '#ffd27a' : '#9fe0ff', opacity:.55 + r * .1 }, g); }
    // the stand: a pale lead-in line on the apron
    if(o.stand) s('path', { d:`M${o.stand} ${glassB} Q ${o.stand + 40} ${hz + 60} ${o.stand + 260} ${hz + 40}`, fill:'none', stroke:'#c9d6e6', 'stroke-opacity':.25, 'stroke-width':3 }, g);
    // the glass: mullions, a sill, a faint sheen
    const gw = s('g', null, layers.mid); s('rect', { x:0, y:0, width:1600, height:glassB, fill:'url(#gGlassSheen)' }, gw);
    for(let x = 0; x <= 1600; x += o.pane || 230) s('rect', { x:x - 5, y:0, width:10, height:glassB, fill:'#081428' }, gw);
    s('rect', { x:0, y:0, width:1600, height:26, fill:'#081428' }, gw); s('rect', { x:0, y:glassB - 8, width:1600, height:16, fill:'#0d2342' }, gw);
    // the floor, with the window's light lying on it
    s('rect', { x:0, y:glassB + 8, width:1600, height:900 - glassB - 8, fill:'url(#gFloor)' }, layers.back);
    for(let i = 0; i < 9; i++){ const x = 200 * i - 200; s('line', { x1:800 + (x - 800) * .55, y1:glassB + 8, x2:x - 400, y2:900, stroke:'#2a4d7d', 'stroke-opacity':.22, 'stroke-width':1.5 }, layers.back); }
    s('ellipse', { cx:o.poolX || 700, cy:glassB + 120, rx:700, ry:120, fill:'url(#gLightPool)' }, layers.back);
    return g;
  }

  /* outdoors: the sky, the far side of the airfield (hangars, the terminal, the tower), the apron with its markings and lights */
  function apron(o){
    o = o || {}; if(FLAT) return apronFlat(o); const g = layers.back, hz = o.horizon || 430;
    s('rect', { x:0, y:0, width:1600, height:hz, fill:o.day ? 'url(#gSkyDay)' : 'url(#gSky)' }, g);
    if(!o.day) for(let i = 0; i < 40; i++) s('circle', { cx:(i * 397) % 1600, cy:(i * 131) % (hz * .55), r:i % 3 ? .9 : 1.4, fill:'#cfe6ff', opacity:.35 }, g);
    const far = s('g', null, g);
    if(o.hangar !== false){ const hx = o.hangarX === undefined ? 980 : o.hangarX; s('path', { d:`M${hx} ${hz} L ${hx} ${hz - 120} Q ${hx + 220} ${hz - 190} ${hx + 440} ${hz - 120} L ${hx + 440} ${hz} Z`, fill:'#0c1f3b' }, far);
      s('rect', { x:hx + 60, y:hz - 96, width:320, height:96, fill:'#173a66' }, far); for(let i = 0; i < 8; i++) s('rect', { x:hx + 64 + i * 40, y:hz - 92, width:36, height:92, fill:'#22508a', opacity:.55 + (i % 2) * .15 }, far);
      s('rect', { x:hx + 60, y:hz - 104, width:320, height:8, fill:'#7fd0ff', opacity:.35 }, far); }
    s('path', { d:`M0 ${hz} L0 ${hz - 40} L180 ${hz - 40} L180 ${hz - 62} L420 ${hz - 62} L420 ${hz - 30} L640 ${hz - 30} L640 ${hz} Z`, fill:'#0a1a31' }, far);
    for(let x = 20; x < 620; x += 26) s('rect', { x, y:hz - 54 + ((x / 26) % 2) * 22, width:10, height:6, fill:'#ffd27a', opacity:.35 }, far);
    if(o.tower !== false){ const tx = o.towerX || 520; s('rect', { x:tx, y:hz - 170, width:18, height:140, fill:'#0a1a31' }, far); s('path', { d:`M${tx - 16} ${hz - 170} L ${tx + 34} ${hz - 170} L ${tx + 28} ${hz - 198} L ${tx - 10} ${hz - 198} Z`, fill:'#0c2240' }, far); s('rect', { x:tx - 6, y:hz - 194, width:30, height:10, fill:'#7fd0ff', opacity:.6 }, far); }
    s('rect', { x:0, y:hz, width:1600, height:900 - hz, fill:'url(#gApron)' }, g);
    for(let r = 0; r < 3; r++){ const yy = hz + 6 + r * 12; for(let x = (r * 37) % 70; x < 1600; x += 70 - r * 10) s('circle', { cx:x, cy:yy, r:1.4 + r * .7, fill:r === 1 ? '#ffd27a' : '#9fe0ff', opacity:.5 }, g); }
    // stand markings, faint
    for(let i = 0; i < 6; i++) s('line', { x1:i * 320 - 100, y1:900, x2:i * 320 + 60, y2:hz + 40, stroke:'#c9d6e6', 'stroke-opacity':.07, 'stroke-width':4 }, g);
    s('line', { x1:0, y1:hz + 150, x2:1600, y2:hz + 150, stroke:'#c9d6e6', 'stroke-opacity':.08, 'stroke-width':3, 'stroke-dasharray':'40 30' }, g);
    return g;
  }

  /* the pupil's own aircraft (the game's drawing, 1200 × 440) or a drawn one; side view facing right; w is its width in the scene */
  function plane(parent, o){
    o = o || {}; if(FLAT){ const f = planeFlat(parent, o); if(f) return f; } const g = s('g', { class:'plane' }, parent), w = o.w || 600, hgt = w * 440 / 1200, art = o.art !== undefined ? o.art : B.art;
    if(o.shadow !== false) s('ellipse', { cx:w * .5, cy:hgt * .93, rx:w * .42, ry:w * .028, fill:'#000', opacity:.35 }, g);
    if(art && /<svg/i.test(art)){ const box = s('g', { transform:o.flip ? `translate(${w} 0) scale(-1 1)` : '' }, g); box.innerHTML = art; const a = box.querySelector('svg'); if(a){ a.setAttribute('width', w); a.setAttribute('height', hgt); a.setAttribute('x', 0); a.setAttribute('y', 0); a.removeAttribute('style'); if(o.style) a.setAttribute('style', o.style); else a.setAttribute('style', a.getAttribute('style') || ''); } }
    else drawnPlane(g, w, hgt, o);
    at(g, o.x || 0, o.y || 0); g.w = w; g.h = hgt; return g;
  }
  function drawnPlane(g, w, hgt, o){
    const k = w / 1200, body = o.body || '#F4F6F8', tail = o.tail || '#1B2A4A', jet = o.kind === 'jet' || o.kind === 'wide';
    const p = s('g', { transform:`scale(${k})${o.flip ? ' translate(1200 0) scale(-1 1)' : ''}` }, g);
    s('path', { d:'M90 250 C 90 205 160 190 260 188 L 960 188 C 1060 190 1130 215 1150 250 C 1130 285 1060 300 960 302 L 260 302 C 160 300 90 290 90 250 Z', fill:body }, p);
    s('path', { d:'M120 270 C 400 300 900 305 1140 262 C 1120 290 1060 302 960 302 L 260 302 C 170 300 120 290 120 270 Z', fill:'#c9d3df' }, p);
    s('path', { d:'M120 190 L 60 70 L 150 70 L 300 190 Z', fill:tail }, p);
    s('path', { d:jet ? 'M520 250 L 700 250 L 560 360 L 470 360 Z' : 'M560 186 L 720 186 L 690 172 L 590 172 Z', fill:'#d7dde6' }, p);
    if(jet) s('rect', { x:540, y:300, width:120, height:40, rx:18, fill:tail }, p); else { s('rect', { x:600, y:170, width:44, height:46, rx:10, fill:tail }, p); s('rect', { x:592, y:150, width:6, height:84, fill:'#2a3a52' }, p); }
    for(let x = 330; x < 960; x += 46) s('rect', { x, y:222, width:20, height:16, rx:6, fill:'#13283D' }, p);
    s('path', { d:'M1050 214 C 1090 216 1120 230 1132 246 L 1060 246 Z', fill:'#13283D' }, p);
    s('rect', { x:300, y:300, width:10, height:60, fill:'#33475f' }, p); s('circle', { cx:305, cy:368, r:14, fill:'#1b2633' }, p); s('rect', { x:1000, y:300, width:8, height:46, fill:'#33475f' }, p); s('circle', { cx:1004, cy:354, r:12, fill:'#1b2633' }, p);
    if(o.logo) s('circle', { cx:160, cy:140, r:26, fill:o.logo }, p);
  }

  /* passengers: small simple figures, readable as people at a glance; colour only where the scene needs it */
  const PEOPLE = { pax:{ body:'#7f97b8', lit:'#b9cbe2', leg:'#2b3f5c' }, biz:{ body:'#2e8fc9', lit:'#7fd0ff', leg:'#1c3550' }, fam:{ body:'#d9774c', lit:'#f5a37a', leg:'#4a2c26' },
    lei:{ body:'#c9b99a', lit:'#efe4cf', leg:'#4a4234' }, fan:{ body:'#1f8a5b', lit:'#5fd39b', leg:'#173a2b' }, rk:{ body:'#8a98ad', lit:'#c4cfde', leg:'#2d3a4c' } };
  function person(parent, x, y, kind, o){
    o = o || {}; if(FLAT) return personFlat(parent, x, y, kind, o); const c = PEOPLE[kind] || PEOPLE.pax, g = s('g', { class:'pp' }, parent), sc = o.scale || 1;
    s('ellipse', { cx:0, cy:0, rx:10, ry:3.2, fill:'#000', opacity:.35 }, g);
    const legs = s('path', { d:'M-4 0 L-3.5 -17 M4 0 L3.5 -17', stroke:c.leg, 'stroke-width':4.6, 'stroke-linecap':'round' }, g);
    s('rect', { x:-8.5, y:-40, width:17, height:26, rx:7.5, fill:`url(#gP-${PEOPLE[kind] ? kind : 'pax'})` }, g);
    s('circle', { cx:0, cy:-47, r:6.6, fill:o.head || '#d8c3ae' }, g); s('path', { d:'M-6.4 -48.5 A 6.6 6.6 0 0 1 6.4 -48.5 L 5.5 -51.5 A 6 6 0 0 0 -5.5 -51.5 Z', fill:'#3a2d25', opacity:.85 }, g);
    if(kind === 'biz') s('rect', { x:8.5, y:-20, width:9, height:7, rx:1.2, fill:'#1c2c40' }, g);
    if(kind === 'fam' && o.child !== false && Math.random() < .35){ const ch = s('g', { transform:'translate(14 0) scale(.62)' }, g); s('rect', { x:-8.5, y:-40, width:17, height:26, rx:7.5, fill:'url(#gP-fam)' }, ch); s('circle', { cx:0, cy:-47, r:6.6, fill:'#d8c3ae' }, ch); s('path', { d:'M-4 0 L-3.5 -17 M4 0 L3.5 -17', stroke:c.leg, 'stroke-width':4.6, 'stroke-linecap':'round' }, ch); }
    if(kind === 'lei') s('rect', { x:9, y:-14, width:8, height:13, rx:2, fill:'#5a4b36' }, g);
    if(kind === 'fan') s('path', { d:'M-9 -36 L 9 -36', stroke:'#eaf2ff', 'stroke-width':3 }, g);
    const P = { g, x, y, kind, sc, legs, set:(x2, y2) => { P.x = x2; P.y = y2; at(g, x2, y2, sc); }, tag:null };
    P.set(x, y); return P;
  }
  /* walk to a place, with a small step */
  function walk(P, x2, y2, ms, delay){ const x1 = P.x, y1 = P.y; ms = ms || 900;
    return (delay ? wait(delay) : Promise.resolve()).then(() => tween(ms, (k, raw) => { const bob = RM ? 0 : Math.abs(Math.sin(raw * Math.PI * Math.max(2, ms / 160))) * -2.2; P.set(lerp(x1, x2, k), lerp(y1, y2, k) + bob); }, 'lin')).then(() => P.set(x2, y2)); }
  /* a little price tag over a passenger */
  function priceTag(P, str){ if(P.tag) P.tag.remove(); const g = s('g', { class:'tagx', transform:'translate(0 -66)' }, P.g); s('path', { d:'M-15 -9 L 13 -9 L 18 0 L 13 9 L -15 9 Z', fill:FLAT ? '#123e64' : '#0b2246', stroke:FLAT ? '#5b86b8' : '#F2C14E', 'stroke-width':1.4 }, g); const t = txt(g, -1, 4.5, str, { 'font-size':11.5, 'font-weight':700, fill:FLAT ? '#EAF2FF' : '#FFE3A8', 'text-anchor':'middle' }); P.tag = g; P.tagText = t; return g; }

  /* a gate: the desk, the backlit sign (gate, city, flag, times) and a fare display */
  function gate(parent, o){
    if(FLAT) return gateFlat(parent, o);
    const g = s('g', { class:'gate' }, parent); at(g, o.x, o.y);
    const sy = o.signY === undefined ? -300 : o.signY; s('rect', { x:-6, y:sy + 74, width:12, height:-sy - 74, fill:'#0c1f3b' }, g);
    const sign = s('g', { transform:`translate(-150 ${sy})`, filter:'url(#fSoft)' }, g); s('rect', { x:0, y:0, width:300, height:84, fill:'#0a1a33', stroke:'#2b5c95', 'stroke-width':2 }, sign);
    s('rect', { x:0, y:0, width:64, height:84, fill:'#F2C14E' }, sign); txt(sign, 32, 52, String(o.gate || 7), { 'font-size':40, 'font-weight':800, fill:'#1a1200', 'text-anchor':'middle' });
    if(o.flag && /<svg/i.test(o.flag)){ const f = s('g', { transform:'translate(80 14)' }, sign); f.innerHTML = o.flag; const fs = f.querySelector('svg'); if(fs){ fs.setAttribute('height', 22); fs.setAttribute('width', 33); fs.removeAttribute('style'); } }
    txt(sign, o.flag ? 122 : 80, 34, String(o.city || '').toUpperCase(), { 'font-size':24, 'font-weight':700, 'letter-spacing':2 });
    txt(sign, 80, 66, o.times || '', { 'font-size':17, fill:'#9FBDE3' });
    const desk = s('g', { transform:'translate(-120 -78)' }, g); s('path', { d:'M0 0 L 240 0 L 252 78 L -12 78 Z', fill:'#13304f' }, desk); s('rect', { x:0, y:0, width:240, height:8, fill:'#2b5c95' }, desk);
    let fareT = null; if(o.fare !== undefined){ const fd = s('g', { transform:'translate(30 18)' }, desk); s('rect', { x:0, y:0, width:180, height:44, fill:'#06142b', stroke:'#36C6FF', 'stroke-width':1.5 }, fd); txt(fd, 12, 29, 'FARE', { 'font-size':13, fill:'#8EA6C8', 'letter-spacing':2 }); fareT = txt(fd, 168, 33, money(o.fare), { 'font-size':28, 'font-weight':800, fill:'#EAF2FF', 'text-anchor':'end' }); }
    return { g, fare:v => { if(fareT) fareT.textContent = money(v); } };
  }

  /* money: bundles of notes in a stack, its height the sum; a label over it */
  function stack(parent, o){
    const g = s('g', { class:'stack' }, parent); at(g, o.x, o.y); const unit = o.unit || 200, bw = o.w || 92, bh = o.bh || 10, gap = 1.5;
    s('ellipse', { cx:0, cy:4, rx:bw * .62, ry:7, fill:'#000', opacity:.35 }, g);
    const notes = s('g', null, g), glow = s('rect', { x:-bw / 2 - 8, y:0, width:bw + 16, height:0, fill:'none', stroke:'#F2C14E', opacity:0, filter:FLAT ? undefined : 'url(#fGlow)', 'stroke-width':FLAT ? 7 : 3 }, g);
    const lab = txt(g, 0, -14, '', { 'font-size':o.fs || 26, 'font-weight':800, fill:'#EAF2FF', 'text-anchor':'middle' }), sub = txt(g, 0, -14 - (o.fs || 26) - 4, '', { 'font-size':15, fill:'#9FBDE3', 'text-anchor':'middle' });
    let shown = 0, value = 0;
    const draw = n => { while(notes.childNodes.length < n){ const i = notes.childNodes.length, b = s('g', { transform:`translate(0 ${-(i + 1) * (bh + gap)})` }, notes); if(FLAT){ bundleF(b, ((i * 7) % 5) - 2, 0, bw, bh); continue; } s('rect', { x:-bw / 2 + ((i * 7) % 5) - 2, y:0, width:bw, height:bh, rx:1.5, fill:'url(#gNote)', stroke:'#2f6b55', 'stroke-width':.8 }, b); s('rect', { x:-6 + ((i * 7) % 5) - 2, y:0, width:12, height:bh, fill:'#e9f4ee', opacity:.8 }, b); } while(notes.childNodes.length > n) notes.lastChild.remove(); };
    const top = n => -n * (bh + gap);
    const api = { g, value:0, set:(v, ms, str) => { const from = value, n1 = Math.max(0, Math.round(v / unit)); value = v; api.value = v; const n0 = shown; shown = n1;
        lab.setAttribute('y', top(n1) - 14); sub.setAttribute('y', top(n1) - 14 - (o.fs || 26) - 2); glow.setAttribute('y', top(Math.max(n0, n1)) - 6); glow.setAttribute('height', Math.max(n0, n1) * (bh + gap) + 10);
        sub.textContent = str || '';
        return Promise.all([tween(ms === undefined ? 700 : ms, k => { draw(Math.round(lerp(n0, n1, k))); const yy = top(Math.round(lerp(n0, n1, k))) - 14; lab.setAttribute('y', yy); sub.setAttribute('y', yy - (o.fs || 26) - 2); glow.setAttribute('y', top(Math.round(lerp(n0, n1, k))) - 6); glow.setAttribute('height', Math.round(lerp(n0, n1, k)) * (bh + gap) + 10); }, 'out'), count(lab, from, v, ms === undefined ? 700 : ms, money)]); },
      glow:on => { glow.setAttribute('opacity', on ? (FLAT ? .35 : .9) : 0); lab.setAttribute('fill', on ? '#F2C14E' : '#EAF2FF'); }, label:lab, sub };
    return api;
  }

  /* a fuel tank with its level, labelled in litres and money (the clip is in the tank's own coordinates) */
  let TK = 0;
  function tank(parent, o){
    if(FLAT) return tankFlat(parent, o);
    const g = s('g', { class:'tank' }, parent); at(g, o.x, o.y); const w = o.w || 220, hh = o.h || 300, id = 'tk' + (++TK);
    s('rect', { x:0, y:0, width:w, height:hh, rx:22, fill:'#0d2342', stroke:'url(#gMetal)', 'stroke-width':6, filter:'url(#fSh)' }, g);
    const cp = s('clipPath', { id }, defs); s('rect', { x:6, y:6, width:w - 12, height:hh - 12, rx:18 }, cp);
    const fuel = s('rect', { x:6, y:hh - 6, width:w - 12, height:0, fill:'url(#gFuel)', 'clip-path':`url(#${id})` }, g);
    const surf = s('rect', { x:6, y:hh - 6, width:w - 12, height:3, fill:'#9fe0ff', opacity:0, 'clip-path':`url(#${id})` }, g);
    s('rect', { x:16, y:12, width:14, height:hh - 24, rx:7, fill:'#fff', opacity:.06 }, g);
    for(let i = 1; i < 4; i++) s('line', { x1:w - 22, y1:hh * i / 4, x2:w - 6, y2:hh * i / 4, stroke:'#8fb2d8', 'stroke-width':2, opacity:.5 }, g);
    const l1 = txt(g, w / 2, hh + 34, '', { 'font-size':22, 'font-weight':800, 'text-anchor':'middle' }), l2 = txt(g, w / 2, hh + 60, '', { 'font-size':16, fill:'#9FBDE3', 'text-anchor':'middle' });
    let level = 0;
    const api = { g, x:o.x, y:o.y, w, h:hh, level:() => level, set:(frac, ms, a, b) => { const f0 = level; level = clamp(frac, 0, 1); if(a !== undefined) l1.textContent = a; if(b !== undefined) l2.textContent = b;
      return tween(ms === undefined ? 900 : ms, k => { const v = lerp(f0, level, k), hgt = (hh - 12) * v; fuel.setAttribute('height', hgt); fuel.setAttribute('y', hh - 6 - hgt); surf.setAttribute('y', hh - 6 - hgt); surf.setAttribute('opacity', hgt > 2 ? .6 : 0); }, 'io'); }, labels:[l1, l2] };
    return api;
  }

  /* a cash vault: a heavy door with the balance on it */
  function vault(parent, o){
    if(FLAT) return vaultFlat(parent, o);
    const g = s('g', { class:'vault', filter:'url(#fSh)' }, parent); at(g, o.x, o.y); const w = o.w || 230, hh = o.h || 250;
    s('rect', { x:0, y:0, width:w, height:hh, rx:10, fill:'url(#gPanel)', stroke:'#4b6f9b', 'stroke-width':3 }, g);
    s('circle', { cx:w / 2, cy:hh * .42, r:hh * .26, fill:'#0b1d38', stroke:'url(#gMetal)', 'stroke-width':8 }, g);
    for(let i = 0; i < 6; i++){ const a = i * Math.PI / 3; s('line', { x1:w / 2, y1:hh * .42, x2:w / 2 + Math.cos(a) * hh * .2, y2:hh * .42 + Math.sin(a) * hh * .2, stroke:'#8fa9c6', 'stroke-width':5, 'stroke-linecap':'round' }, g); }
    s('circle', { cx:w / 2, cy:hh * .42, r:12, fill:'#cfe0f2' }, g);
    txt(g, w / 2, hh - 44, o.title || 'CASH', { 'font-size':15, fill:'#9FBDE3', 'letter-spacing':3, 'text-anchor':'middle' });
    const v = txt(g, w / 2, hh - 14, money(o.value || 0), { 'font-size':28, 'font-weight':800, 'text-anchor':'middle' });
    let val = o.value || 0;
    return { g, x:o.x, y:o.y, w, h:hh, set:(x, ms) => { const f = val; val = x; return count(v, f, x, ms === undefined ? 700 : ms, money); }, text:v };
  }

  /* coins along a path from one place to another (cash into the tank, tickets back into the vault) */
  async function coins(parent, from, to, n, ms, colour){
    const g = s('g', null, parent), list = [];
    for(let i = 0; i < n; i++){ const c = s('g', { opacity:0 }, g); s('ellipse', { cx:0, cy:0, rx:9, ry:6, fill:colour || 'url(#gGold)', stroke:'#7a5a12', 'stroke-width':1 }, c); list.push(c); }
    const legs = list.map((c, i) => wait(i * (ms / n) * .6).then(() => tween(ms * .55, k => { const x = lerp(from[0], to[0], k), y = lerp(from[1], to[1], k) - Math.sin(k * Math.PI) * 60; at(c, x, y); c.setAttribute('opacity', k < .9 ? 1 : (1 - k) * 10); }, 'io')));
    await Promise.all(legs); g.remove();
  }

  /* a departure board row set: split-flap look */
  function board(parent, o){
    const g = s('g', { class:'board', filter:FLAT ? undefined : 'url(#fSh)' }, parent); at(g, o.x, o.y); const w = o.w || 380, rh = o.rh || 40;
    s('rect', { x:0, y:0, width:w, height:46 + rh * o.rows.length + 10, fill:'#050f22', stroke:'#2b5c95', 'stroke-width':2 }, g);
    txt(g, 16, 30, o.title || 'DEPARTURES', { 'font-size':16, fill:FLAT ? '#36c6ff' : '#F2C14E', 'letter-spacing':3, 'font-weight':700 });
    const rows = o.rows.map((r, i) => { const y = 46 + i * rh; s('rect', { x:8, y:y + 4, width:w - 16, height:rh - 8, fill:'#0b1d38' }, g); return r.map((c, j) => txt(g, (o.cols || [16, 110, 250])[j], y + rh * .66, c, { 'font-size':18, 'font-weight':600, fill:'#EAF2FF', 'font-family':FLAT ? undefined : 'Consolas,monospace' })); });
    return { g, rows };
  }

  /* ---------- BertieV4 flat art (year one): the pieces, the night, the planes, the people, the props ---------- */
  function pieceOf(name){ if(PCACHE[name]) return PCACHE[name]; const src = ART[name]; if(!src) return null;
    const vb = /viewBox="([^"]+)"/.exec(src), d = vb ? vb[1].trim().split(/[\s,]+/).map(Number) : [0, 0, +((/width="([\d.]+)"/.exec(src) || [])[1] || 100), +((/height="([\d.]+)"/.exec(src) || [])[1] || 100)];
    return PCACHE[name] = { w:d[2], h:d[3], inner:src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '') }; }
  /* a piece in the scene, scaled to w, its ids its own (a scene can hold the same piece twice); mirror turns it to face right */
  function piece(name, parent, o){
    o = o || {}; const P = pieceOf(name); if(!P) return null; const n = ++PN, k = (o.w || P.w) / P.w, g = s('g', { class:'pc pc-' + name }, parent);
    const inner = s('g', { transform:o.mirror ? `translate(${(P.w * k).toFixed(2)} 0) scale(${-k} ${k})` : `scale(${k})` }, g);
    inner.innerHTML = P.inner.replace(/\bid="([^"]+)"/g, (m, id) => `id="${id}-k${n}"`).replace(/url\(#([^)]+)\)/g, (m, id) => `url(#${id}-k${n})`).replace(/href="#([^"]+)"/g, (m, id) => `href="#${id}-k${n}"`);
    at(g, o.x || 0, o.y || 0);
    return { g, inner, w:P.w * k, h:P.h * k, k, part:pt => inner.querySelector(`[data-part="${pt}"]`), parts:pt => [...inner.querySelectorAll(`[data-part="${pt}"]`)] };
  }
  function flatDefs(){
    grad('gNight', [[0, '#020812'], [.62, '#041426'], [1, '#0a2547']], 0, 0, 0, 1);
    grad('gApronF', [[0, '#0c2a50'], [1, '#08203f']], 0, 0, 0, 1);
    grad('gFloorF', [[0, '#0e2d56'], [1, '#061632']], 0, 0, 0, 1);
    grad('gPoolF', [[0, '#36c6ff', .12], [1, '#36c6ff', 0]], .5, .5, .5, 0, true);
    grad('gShadowF', [[0, '#000', .5], [1, '#000', 0]], .5, .5, .5, 0, true);
    grad('gGoldTopF', [[0, '#ffe7a3'], [1, '#f6cf6a']], 0, 0, 1, 1);
    grad('gGoldF', [[0, '#f8d77a'], [1, '#e2ac3c']], 0, 0, 0, 1);
    grad('gSteelF', [[0, '#5b86b8'], [.55, '#335c91'], [1, '#1b3864']], 0, 0, 1, 0);
    grad('gSteelTopF', [[0, '#86a9d6'], [1, '#5b86b8']], 0, 0, 1, 1);
    grad('gFuelF', [[0, '#5fd4ff'], [1, '#1f78c8']], 0, 0, 0, 1);
  }
  const shadowF = (g, cx, cy, rx, ry) => s('ellipse', { cx, cy, rx, ry, fill:'url(#gShadowF)' }, g);
  /* the terminal interior at night: the apron beyond thin pillars, the floor with the window's light on it */
  function terminalFlat(o){
    const g = layers.back, glassB = o.glassBottom || 520, hz = o.horizon || 330;
    s('rect', { x:0, y:0, width:1600, height:glassB, fill:'url(#gNight)' }, g);
    const far = s('g', null, g);
    s('path', { d:`M0 ${hz} L0 ${hz - 18} L120 ${hz - 18} L120 ${hz - 34} L300 ${hz - 34} L300 ${hz - 14} L520 ${hz - 14} L520 ${hz - 26} L760 ${hz - 26} L760 ${hz - 10} L1600 ${hz - 10} L1600 ${hz} Z`, fill:'#06172e' }, far);
    if(o.tower !== false){ s('rect', { x:212, y:hz - 120, width:16, height:90, fill:'#06172e' }, far); s('path', { d:`M196 ${hz - 120} L244 ${hz - 120} L238 ${hz - 146} L202 ${hz - 146} Z`, fill:'#0a2140' }, far); s('rect', { x:204, y:hz - 141, width:32, height:7, fill:'#36c6ff', opacity:.3 }, far); }
    s('rect', { x:0, y:hz, width:1600, height:glassB - hz, fill:'url(#gApronF)' }, g);
    for(let r = 0; r < 3; r++){ const yy = hz + 8 + r * 16, sz = 1.3 + r * .6; for(let x = (r * 37) % 60; x < 1600; x += 60 - r * 8) s('circle', { cx:x, cy:yy, r:sz, fill:r === 1 ? '#f2c14e' : '#36c6ff', opacity:.2 + r * .06 }, g); }
    if(o.stand) s('path', { d:`M${o.stand} ${glassB} Q ${o.stand + 40} ${hz + 60} ${o.stand + 260} ${hz + 40}`, fill:'none', stroke:'#9fbde3', 'stroke-opacity':.16, 'stroke-width':3 }, g);
    const gw = s('g', null, layers.mid);
    for(let x = 0; x <= 1600; x += o.pane || 230) s('rect', { x:x - 4, y:0, width:8, height:glassB, fill:'#05122a' }, gw);
    s('rect', { x:0, y:0, width:1600, height:20, fill:'#05122a' }, gw);
    s('rect', { x:0, y:glassB - 8, width:1600, height:14, fill:'#0d2a4f' }, gw); s('rect', { x:0, y:glassB - 8, width:1600, height:2, fill:'#5b86b8', opacity:.45 }, gw);
    s('rect', { x:0, y:glassB + 6, width:1600, height:900 - glassB - 6, fill:'url(#gFloorF)' }, layers.back);
    for(let i = 0; i < 9; i++){ const x = 200 * i - 200; s('line', { x1:800 + (x - 800) * .55, y1:glassB + 8, x2:x - 400, y2:900, stroke:'#2a5a96', 'stroke-opacity':.1, 'stroke-width':1.5 }, layers.back); }
    s('ellipse', { cx:o.poolX || 700, cy:glassB + 120, rx:700, ry:120, fill:'url(#gPoolF)' }, layers.back);
    return g;
  }
  /* outdoors at night: the far side of the airfield low and dark, the apron, dim lights */
  function apronFlat(o){
    const g = layers.back, hz = o.horizon || 430;
    s('rect', { x:0, y:0, width:1600, height:hz, fill:'url(#gNight)' }, g);
    for(let i = 0; i < 40; i++) s('circle', { cx:(i * 397) % 1600, cy:(i * 131) % (hz * .55), r:i % 3 ? .9 : 1.3, fill:'#9fbde3', opacity:.22 }, g);
    const far = s('g', null, g);
    if(o.hangar !== false){ const hx = o.hangarX === undefined ? 980 : o.hangarX; s('path', { d:`M${hx} ${hz} L ${hx} ${hz - 120} Q ${hx + 220} ${hz - 190} ${hx + 440} ${hz - 120} L ${hx + 440} ${hz} Z`, fill:'#06172e' }, far);
      s('rect', { x:hx + 60, y:hz - 96, width:320, height:96, fill:'#0b2547' }, far); s('rect', { x:hx + 60, y:hz - 98, width:320, height:2, fill:'#5b86b8', opacity:.4 }, far); }
    s('path', { d:`M0 ${hz} L0 ${hz - 40} L180 ${hz - 40} L180 ${hz - 62} L420 ${hz - 62} L420 ${hz - 30} L640 ${hz - 30} L640 ${hz} Z`, fill:'#06172e' }, far);
    for(let x = 20; x < 620; x += 26) s('rect', { x, y:hz - 54 + ((x / 26) % 2) * 22, width:10, height:5, fill:'#f2c14e', opacity:.2 }, far);
    if(o.tower !== false){ const tx = o.towerX || 520; s('rect', { x:tx, y:hz - 170, width:18, height:140, fill:'#06172e' }, far); s('path', { d:`M${tx - 16} ${hz - 170} L ${tx + 34} ${hz - 170} L ${tx + 28} ${hz - 198} L ${tx - 10} ${hz - 198} Z`, fill:'#0a2140' }, far); s('rect', { x:tx - 6, y:hz - 194, width:30, height:7, fill:'#36c6ff', opacity:.3 }, far); }
    s('rect', { x:0, y:hz, width:1600, height:900 - hz, fill:'url(#gApronF)' }, g);
    for(let r = 0; r < 3; r++){ const yy = hz + 6 + r * 12; for(let x = (r * 37) % 70; x < 1600; x += 70 - r * 10) s('circle', { cx:x, cy:yy, r:1.2 + r * .6, fill:r === 1 ? '#f2c14e' : '#36c6ff', opacity:.22 }, g); }
    for(let i = 0; i < 6; i++) s('line', { x1:i * 320 - 100, y1:900, x2:i * 320 + 60, y2:hz + 40, stroke:'#9fbde3', 'stroke-opacity':.05, 'stroke-width':4 }, g);
    s('line', { x1:0, y1:hz + 150, x2:1600, y2:hz + 150, stroke:'#9fbde3', 'stroke-opacity':.07, 'stroke-width':3, 'stroke-dasharray':'40 30' }, g);
    s('ellipse', { cx:800, cy:hz + 200, rx:760, ry:160, fill:'url(#gPoolF)' }, g);
    return g;
  }
  /* the kit's aircraft, by type, white with the pupil's tail; a plane faces right in a scene unless it asks to face left */
  const PLANE_PIECE = { dhc6:'aircraft-twin-otter', sf34:'aircraft-saab-340', at72:'aircraft-atr-72', e175:'aircraft-e175', e190:'aircraft-e175', narrowbody:'aircraft-e175', b787:'aircraft-787', wide:'aircraft-787', redkite:'aircraft-red-kite-atr-72', redkite175:'aircraft-red-kite-e175' };
  function planeFlat(parent, o){
    const art = o.art !== undefined ? o.art : B.art; let name = o.piece ? (PLANE_PIECE[o.piece] || o.piece) : '', tail = o.tail || null;
    if(typeof art === 'string' && art.indexOf('kit:') === 0){ const [pc, t] = art.slice(4).split('|'); if(!name) name = PLANE_PIECE[pc] || pc; if(t && !o.tail) tail = t; }
    if(!name){ name = o.kind === 'jet' ? 'aircraft-e175' : o.kind === 'wide' ? 'aircraft-787' : (PLANE_PIECE[B.kitPlane] || 'aircraft-twin-otter'); if(!tail && !o.plain) tail = B.kitTail || null; }
    if(!pieceOf(name)) return null;
    const P = pieceOf(name), w = o.natural ? P.w : o.w || 600, hgt = w * P.h / P.w, g = s('g', { class:'plane' }, parent);   // natural: the piece's own size (12 px = 1 m)
    if(o.shadow !== false) shadowF(g, w * .52, hgt - 1, w * .46, Math.max(3, w * .03));
    const pc = piece(name, g, { w, mirror:!o.flip }); if(tail) pc.parts('tail').forEach(e => e.setAttribute('fill', tail));
    at(g, o.x || 0, o.y || 0); g.w = w; g.h = hgt; g.piece = pc; return g;
  }
  /* the kit's passengers: no faces, people-neutral clothing, every head people-head; business in cyan only where the mix matters */
  const PEOPLE_F = { pax:['#9fb3cf', '#b5c6dd', '#7389a8', '#667c9b'], biz:['#5fb8e6', '#36c6ff', '#2d5f8c', '#24507a'], fam:['#b08463', '#c8956a', '#7d6250', '#6e5646'],
    lei:['#9fb3cf', '#b5c6dd', '#7389a8', '#667c9b'], fan:['#2f7d5b', '#3f9a72', '#4a6286', '#3f5676'], rk:['#9fb3cf', '#b5c6dd', '#7389a8', '#667c9b'] };
  function figureF(parent, c, o){
    const f = s('g', { transform:'translate(-10.2 -54.4) scale(.85)' }, parent);
    s('ellipse', { cx:12, cy:64.5, rx:11, ry:1.8, fill:'#000', opacity:.35 }, f);
    s('circle', { cx:12, cy:8, r:7, fill:(o && o.head) || '#c4d4ea' }, f);
    s('path', { d:'M3,22 C3,18 6,16 10,16 L14,16 C18,16 21,18 21,22 L21,40 L3,40 Z', fill:c[0] }, f);
    s('path', { d:'M3,22 C3,18 6,16 10,16 L12,16 L12,40 L3,40 Z', fill:c[1] }, f);
    const legs = s('g', null, f); s('rect', { x:4.5, y:38, width:6.5, height:26, rx:2.5, fill:c[2] }, legs); s('rect', { x:13, y:38, width:6.5, height:26, rx:2.5, fill:c[3] }, legs);
    return { f, legs };
  }
  function personFlat(parent, x, y, kind, o){
    const c = PEOPLE_F[kind] || PEOPLE_F.pax, g = s('g', { class:'pp' }, parent), sc = o.scale || 1, F = figureF(g, c, o);
    if(kind === 'biz'){ s('path', { d:'M10,16 L12,24 L14,16 Z', fill:'#081f3d' }, F.f); s('rect', { x:21, y:44, width:9, height:12, rx:1.5, fill:'#123e64', stroke:'#36c6ff', 'stroke-opacity':.5 }, F.f); }
    if(kind === 'lei') s('rect', { x:-3, y:20, width:6, height:15, rx:2, fill:'#6f86a8' }, F.f);
    if(kind === 'fan') s('rect', { x:3, y:27, width:18, height:3.5, fill:'#eaf2ff', opacity:.8 }, F.f);
    if(kind === 'fam' && o.child !== false && Math.random() < .35){ const ch = s('g', { transform:'translate(14 0) scale(.62)' }, g); figureF(ch, PEOPLE_F.fam, o); }
    const P = { g, x, y, kind, sc, legs:F.legs, set:(x2, y2) => { P.x = x2; P.y = y2; at(g, x2, y2, sc); }, tag:null };
    P.set(x, y); return P;
  }
  /* a gate: a square navy sign (GATE n, the city and time), the desk with its lit top face, the fare display; Red Kite's sign carries its badge */
  function gateFlat(parent, o){
    const g = s('g', { class:'gate' }, parent), rk = !!o.rk; at(g, o.x, o.y);
    const sy = o.signY === undefined ? -300 : o.signY; s('rect', { x:-4, y:sy + 74, width:8, height:-sy - 74, fill:'#2b5c95', opacity:.5 }, g);
    const sign = s('g', { transform:`translate(-150 ${sy})` }, g); s('rect', { x:0, y:0, width:300, height:84, fill:'#081f3d', stroke:'#2b5c95', 'stroke-width':2 }, sign);
    let tx = 20; if(rk && piece('red-kite-badge', sign, { x:14, y:14, w:56 })) tx = 86;
    txt(sign, tx, 38, `GATE ${o.gate || 7}`, { 'font-size':26, 'font-weight':800, 'letter-spacing':1 });
    let cx = tx; if(!rk && o.flag && /<svg/i.test(o.flag)){ const f = s('g', { transform:`translate(${tx} 51)` }, sign); f.innerHTML = o.flag; const fs = f.querySelector('svg'); if(fs){ fs.setAttribute('height', 18); fs.setAttribute('width', 27); fs.removeAttribute('style'); } cx = tx + 36; }
    txt(sign, cx, 67, `${String(o.city || '').toUpperCase()}${o.times ? '  ' + o.times : ''}`, { 'font-size':17, fill:'#9FBDE3', 'letter-spacing':1 });
    const desk = s('g', { transform:'translate(-120 -78)' }, g); shadowF(desk, 128, 80, 150, 8);
    s('path', { d:'M0 0 L 240 0 L 252 78 L -12 78 Z', fill:'#0b2547' }, desk); s('rect', { x:0, y:0, width:240, height:8, fill:'#3a6ea8' }, desk);
    let fareT = null; if(o.fare !== undefined){ const fd = s('g', { transform:'translate(30 18)' }, desk); s('rect', { x:0, y:0, width:180, height:44, fill:'#04111f', stroke:'#36C6FF', 'stroke-width':1.5 }, fd); txt(fd, 12, 29, 'FARE', { 'font-size':13, fill:'#9fbde3', 'letter-spacing':2 }); fareT = txt(fd, 168, 32, money(o.fare), { 'font-size':26, 'font-weight':800, 'text-anchor':'end', fill:'#f2c14e' }); }
    return { g, fare:v => { if(fareT) fareT.textContent = money(v); } };
  }
  /* money: gold bundles with a lit top and a darker right face; a label over the stack */
  function bundleF(parent, x, y, bw, bh){ const b = s('g', { transform:`translate(${x} ${y})` }, parent);
    s('path', { d:`M${-bw / 2} 0 L ${-bw / 2 + 7} -5 L ${bw / 2 + 7} -5 L ${bw / 2} 0 Z`, fill:'url(#gGoldTopF)' }, b);
    s('rect', { x:-bw / 2, y:0, width:bw, height:bh, fill:'url(#gGoldF)' }, b); s('path', { d:`M${bw / 2} 0 L ${bw / 2 + 7} -5 L ${bw / 2 + 7} ${bh - 5} L ${bw / 2} ${bh} Z`, fill:'#b8892a' }, b);
    s('rect', { x:-7, y:0, width:14, height:bh, fill:'#c8941f', opacity:.85 }, b); return b; }
  /* the tank: a steel cylinder lit from the upper left, a window onto the fuel */
  function tankFlat(parent, o){
    const g = s('g', { class:'tank' }, parent); at(g, o.x, o.y); const w = o.w || 220, hh = o.h || 300, top = 26, wx = w * .27, ww = w * .46, wy = top + 26, wh = hh - wy - 26;
    shadowF(g, w * .55, hh + 6, w * .7, 16);
    s('rect', { x:0, y:top / 2, width:w, height:hh - top / 2, fill:'url(#gSteelF)' }, g); s('ellipse', { cx:w / 2, cy:hh, rx:w / 2, ry:top / 2, fill:'#1b3864' }, g);
    s('ellipse', { cx:w / 2, cy:top / 2, rx:w / 2, ry:top / 2, fill:'url(#gSteelTopF)' }, g);
    s('rect', { x:wx, y:wy, width:ww, height:wh, fill:'#030c1a', stroke:'#86a9d6', 'stroke-width':2 }, g);
    const fuel = s('rect', { x:wx + 3, y:wy + wh - 3, width:ww - 6, height:0, fill:'url(#gFuelF)' }, g), surf = s('rect', { x:wx + 3, y:wy + wh - 3, width:ww - 6, height:3, fill:'#cfefff', opacity:0 }, g);
    for(let i = 1; i < 4; i++) s('line', { x1:wx + ww + 4, y1:wy + wh * i / 4, x2:wx + ww + 14, y2:wy + wh * i / 4, stroke:'#9fbde3', 'stroke-width':2, opacity:.6 }, g);
    const l1 = txt(g, w / 2, hh + 46, '', { 'font-size':22, 'font-weight':800, 'text-anchor':'middle' }), l2 = txt(g, w / 2, hh + 72, '', { 'font-size':16, fill:'#9FBDE3', 'text-anchor':'middle' });
    let level = 0;
    return { g, x:o.x, y:o.y, w, h:hh, level:() => level, labels:[l1, l2], set:(frac, ms, a, b) => { const f0 = level; level = clamp(frac, 0, 1); if(a !== undefined) l1.textContent = a; if(b !== undefined) l2.textContent = b;
      return tween(ms === undefined ? 900 : ms, k => { const v = lerp(f0, level, k), hgt = (wh - 6) * v; fuel.setAttribute('height', hgt); fuel.setAttribute('y', wy + wh - 3 - hgt); surf.setAttribute('y', wy + wh - 3 - hgt); surf.setAttribute('opacity', hgt > 2 ? .8 : 0); }, 'io'); } };
  }
  /* the cash vault: a steel box with a lit top and a darker right face, the dial, the slot the coins leave by */
  function vaultFlat(parent, o){
    const g = s('g', { class:'vault' }, parent); at(g, o.x, o.y); const w = o.w || 230, hh = o.h || 250, d = 22;
    shadowF(g, w * .58, hh + 4, w * .72, 14);
    s('path', { d:`M0 ${d} L ${d} 0 L ${w + d} 0 L ${w} ${d} Z`, fill:'url(#gSteelTopF)' }, g); s('path', { d:`M${w} ${d} L ${w + d} 0 L ${w + d} ${hh - d} L ${w} ${hh} Z`, fill:'#14284d' }, g);
    s('rect', { x:0, y:d, width:w, height:hh - d, fill:'url(#gSteelF)' }, g); s('rect', { x:w * .36, y:d / 2 - 3, width:w * .26, height:6, fill:'#04111f' }, g);
    const cy = d + (hh - d) * .4, r = (hh - d) * .27; s('circle', { cx:w / 2, cy, r, fill:'#152f57', stroke:'#6f93c2', 'stroke-width':4 }, g);
    for(let i = 0; i < 3; i++){ const a = -Math.PI / 2 + i * 2 * Math.PI / 3; s('line', { x1:w / 2, y1:cy, x2:w / 2 + Math.cos(a) * r * .62, y2:cy + Math.sin(a) * r * .62, stroke:'#9fbde3', 'stroke-width':5, 'stroke-linecap':'round' }, g); }
    s('circle', { cx:w / 2, cy, r:8, fill:'#cfe0f2' }, g);
    txt(g, w / 2, hh - 42, o.title || 'CASH', { 'font-size':15, fill:'#9FBDE3', 'letter-spacing':3, 'text-anchor':'middle' });
    const v = txt(g, w / 2, hh - 14, money(o.value || 0), { 'font-size':28, 'font-weight':800, 'text-anchor':'middle', fill:'#f2c14e' });
    let val = o.value || 0;
    return { g, x:o.x, y:o.y, w, h:hh, set:(x, ms) => { const f = val; val = x; return count(v, f, x, ms === undefined ? 700 : ms, money); }, text:v };
  }

  return { B, RM, y1:Y1, s, h, at, txt, start, run, decide, fast, pause, mark, caption, question, cont, done, call, chips, rail, count, wait, tween, every, pos,
    terminal, apron, plane, person, walk, priceTag, gate, stack, tank, vault, coins, board, piece, flat:FLAT, money, num, esc, clamp, lerp, layers:() => layers, hud:() => hud, svg:() => svg, defs:() => defs, isPaused:() => paused };
})();
