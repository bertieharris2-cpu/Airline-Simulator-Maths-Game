/* =====================================================================
   CHAPTER ONE AFTER THE 17:37 PLAY NOTES (Claude Design's hand-off, 31 Oct 2026, evening; Bertie approved the eight screens:
   "a big improvement towards what I think I want"). Chapter one only (ch1()). Where this differs from an earlier hand-off,
   this one wins (its section 9, DESIGN.md of 31 Oct evening). The words are the workbook's (ScreenText fra.eve.*, tp.*, ba.*,
   chg3.*, ld3.*, wk1.co.*, wk1.avg.*, wi2.*, home.now.week; Fable's frankfurt.card and changes.head.*), the figures too
   (Settings launchExampleColumn, demoFirstClickDelay, demoStepGap, twoPlansMaxPlanes; Routes colour).
     1 · the Frankfurt evening: the Day page leads with the new route and his own percentage; one button;
     2 · two plans, then Choose: today's plan for reference, a blank new plan under it, a Choose button for each (week 1);
     3 · Before / after opens by itself after he chooses the new plan: a stacked-bar graph, four callouts one at a time;
     4 · the Changes sheet: the new route first (all ƒ), then the Difference callout before Finance's demo, under the table;
         heads Today's plan (week 1) / Last week · With your change · change − today's;
     5 · Launch Day: Finance shows the profit on an example column (G, made-up figures), then he works out his own;
     6 · week 1 Sunday: nothing starts on arrival; a callout for each method; Finance shows the average on the left first;
     7 · week 2: Finance's two questions on the what-if sheet itself, his fare and £3 more side by side, a day to a month;
     8 · Home's NOW strip in weeks 2 to 5 says the plan flies again (the pace of every demo is c1Pace, p6b; L2 in p5f;
         WHY 27? in p6b).
   ===================================================================== */
{
const I = window.__c2i || {}, H = window.__c2h || {};
const on3 = () => typeof ch1 === 'function' && ch1();
const T3 = (id, v) => h21Text(id, v), T3H = s => h21Html(s);
const tx = (id, k, v, d) => { const t = T3(id, v).text; return t[k] !== undefined && t[k] !== '' ? t[k] : (d || ''); };
const bt = s => esc(String(s || '').replace(/\s*▶\s*$/, '').replace(/\s*▸\s*$/, '')).trim();
const X3 = () => { const X = c1Ex(); return X.c3 || (X.c3 = { seen:{} }); };
const dLong = d => dateLong(d).replace(/ \d{4}$/, '');
const cp = o => JSON.parse(JSON.stringify(o));
const signed = (v, m) => `${v < 0 ? '−' : v > 0 ? '+' : ''}${m ? money(Math.abs(Math.round(v))) : num(Math.abs(Math.round(v)))}`;
/* a Sheet Callout with its step at the right of the eyebrow ("1 of 4") */
function c3Co(T, btnId, step, extra){
  return `<div class="ash-co c1-sco c3-co ${extra || ''}" data-c3co role="dialog" aria-label="${esc(T.title || T.eyebrow || '')}"><i class="c1-sco-ptr" aria-hidden="true"></i>
    <span class="ash-coe">${esc(T.eyebrow || '')}${step ? `<b class="c3-step">${esc(step)}</b>` : ''}</span>${T.title ? `<b class="ash-cot">${esc(T.title)}</b>` : ''}${(T.text || []).map(p => `<p>${c1Html(p)}</p>`).join('')}
    ${T.button ? `<div class="ash-coa"><button class="bv-btn primary" id="${btnId}">${esc(T.button).replace('▶', '&#9654;')}</button></div>` : ''}</div>`; }
/* the callout under a cell, inside its sheet panel: its right edge on the cell's right edge (the hand-off's rule at 1366 × 768) */
function c3PlaceUnder(el, cell, o){
  if(!el || !cell) return; o = o || {}; const gw = el.offsetParent || el.parentElement, G = gw.getBoundingClientRect(), C = cell.getBoundingClientRect(), W = el.offsetWidth;
  let left = C.right - G.left - W + (o.dx || 0); const panel = el.closest('.ash, .c1-tt, .dp') || document.body, P = panel.getBoundingClientRect();
  left = Math.max(P.left - G.left + 8, Math.min(left, P.right - G.left - W - 8));
  el.style.position = 'absolute'; el.style.left = Math.round(left) + 'px'; el.style.top = Math.round(C.bottom - G.top + (o.dy || 12)) + 'px';
  const ptr = el.querySelector('.c1-sco-ptr'); if(ptr){ ptr.style.left = Math.round(Math.max(14, Math.min(W - 28, C.left + C.width / 2 - G.left - left - 7))) + 'px'; }
}

/* =====================================================================
   1 · THE FRANKFURT EVENING (T1, T2): the Day page's lower half becomes the news, with his percentage as the reason
   ===================================================================== */
function c3FraPct(d, h){
  const X = I.c2X(); X.fraPct = X.fraPct || {}; if(X.fraPct[d] !== undefined) return X.fraPct[d];
  let best = 0; try{ const bp = X.bestPl || (X.bestPl = bestPlanSweep(S.wk ? S.wk.from : 1).plan); best = dryRun(() => withDay(d, () => withBeat(beatAt(d), () => { S.day = d; return planLines(bp).v.profit; }))); }catch(e){}
  return (X.fraPct[d] = best > 0 ? Math.min(100, Math.floor(100 * (h.profit || 0) / best)) : null);
}
const c3DayNow = d => { const h = (S.history || []).slice().reverse().find(x => x.from === d && x.to === d) || lastDay() || {}, fl = ((S.rnd && S.rnd.flights) || []).filter(f => !f.grounded && !f.cancelled); return { h, fl }; };
const day0 = H.dayPage;
if(day0) H.dayPage = o => {
  const d = o.d, X = I.c2X(), N = c3DayNow(d);
  if(UI.c3back){ const W = tpOld(); if(W) N.fl = c3Flights(W); }   // back from the two plans: the board shows the plan that flew, not the new one
  if(on3()) try{ I.c2Earn(d, N.h, N.fl); }catch(e){}   // earned the evening it happens: the news leads this page (it used to wait for Keep)
  day0(o);
  if(on3() && X.fraCard && !X.fraCardShown && X.fra === d + 1) c3FraLead(o, d, N.h, N.fl);
};
function c3FraLead(o, d, h, fl){
  const X = I.c2X(), r = routeById(I.c2Fra()); if(!r) return;
  const pct = c3FraPct(d, h), fill = h.seats ? Math.round(100 * (h.pax || 0) / h.seats) : 0, city = r.city, CITY = city.toUpperCase();
  const plane = (S.fleet[0] && planeById(S.fleet[0].planeId)) || null, trip = plane ? fmtDur(TIME.roundTrip(plane, r)) : '';
  const C = T3('frankfurt.card', { pct:pct === null ? '' : pct, city }), B = T3('fra.eve.board', { city:CITY });
  const why = C.text.map(t => `<p>${T3H(t).replace(new RegExp(`${pct}%`), `<b class="c3-pct">${pct}%</b>`)}</p>`).join('') + `<p>${T3H(tx('fra.eve.more', 0, { fill, city }))}</p>`;
  const chips = T3('fra.eve.chips', { time:trip }).text, lines = (B.text[0] ? B.text : ['ON TIME', `${CITY} · NEW`]);
  const board = `<div class="c3-board"><div class="c3-bh">${esc(B.title || 'DEPARTURES · TOMORROW')}</div>${fl.slice().sort((a, b) => a.dep - b.dep).map(f => `<div class="c3-fl"><span class="mono">${fmtTime(f.dep)}</span><span>${esc(routeById(f.route).city.toUpperCase())}</span><span class="ok">${esc(lines[0])}</span></div>`).join('')}
    <div class="c3-fl new"><span class="mono">--:--</span><span>${esc(lines[1] || `${CITY} · NEW`)}</span></div></div>`;
  const panel = `<section class="c3-fra" role="region" aria-label="${esc(C.title || 'New route')}"><span class="c3-eye">${esc(C.eyebrow || 'NEW ROUTE')}</span><h2>${flagSvg(r.flag, 22)} ${esc(C.title || `${city} opens tomorrow`)}</h2>
    <div class="c3-fra-row">${board}<div class="c3-why">${why}<div class="c3-chips">${chips[0] ? `<span>${flagSvg(r.flag, 14)} ${esc(chips[0])}</span>` : ''}${chips[1] ? `<span>${esc(chips[1])}</span>` : ''}</div></div></div>
    <p class="c3-rule">${T3H(tx('fra.eve.rule', 0, { date:dLong(d + 1), city }))}</p><p class="c3-small">${esc(tx('fra.eve.small', 0, { pct:85, fill:80 }))}</p></section>`;
  const scr = screen(), rd = scr.querySelector('.c2-read'), tm = scr.querySelector('.c2-tom'); if(!rd && !tm) return;
  if(rd) rd.insertAdjacentHTML('beforebegin', panel); [rd, tm].forEach(x => x && x.remove());
  const F = T3('fra.eve.footer', { city }), bar = scr.querySelector('.actbar'), ch = document.getElementById('c2Change'), kp = document.getElementById('c2Keep');
  if(ch && kp){ const box = kp.parentElement; [ch, kp].forEach(x => x.remove());
    box.insertAdjacentHTML('beforeend', `<button class="bv-btn primary big" id="c3FraGo">${bt(F.button || `Plan tomorrow with ${city}`)} &#9654;</button>`); }
  const hint = bar && bar.querySelector('.dk-hint, .ab-hint, p'); if(hint && F.text[0]) hint.textContent = F.text[0];
  on('c3FraGo', () => { const X2 = I.c2X(); X2.fraCardShown = true; X2.kept[d] = true; X2.chgEve = d; save(); o.change(); });
}
/* the evening a day flew on and earned it: the same page, with the news (H.fraCard used to be a card of its own) */
if(H.fraCard){ const fra0 = H.fraCard;
  H.fraCard = go => { if(!on3()) return fra0(go); const X = I.c2X(), d = (X.fra || (S.day + 1)) - 1;
    H.dayPage({ d, keep:() => render(), change:() => { if(go){ go(); return; } const W = S.wk, done = W && W.dayDone === S.day; if(done) X.kept[S.day] = true; X.chgEve = done ? S.day : S.day - 1; save(); H.startChange(); } }); }; }

/* =====================================================================
   2 · TWO PLANS, THEN CHOOSE (T3, D1, L1; week 1, one plane): today's plan stays above for comparison, read only; the new
   plan under it starts empty; a choice column on the right with each plan's profit a day and Choose ▶. Choosing today's
   plan flies it tomorrow (no sum); choosing the new plan goes to Before / after, then the Changes sheet, then Fly tomorrow.
   ===================================================================== */
const maxPl = () => +WBS().twoPlansMaxPlanes || 1;
const tpDay = () => (S.day || 1) <= 7;
const tpWk = () => !!(UI.c3tp && UI.c3tp.wk);   // from week 2: Edit plan on the week's opener
function tpOn(){ if(!on3() || S.phase === 'setup' || !(tpDay() || tpWk()) || S.fleet.length > maxPl()) return false; const X = I.c2X ? I.c2X() : {}, st = step();
  return !!(st && st.t === 'plan' && (X.chgEve || tpWk()) && UI.c3tp && UI.c3tp.key === tpKey() && !(UI.s2 && UI.s2.mode === 'opener')); }
/* from week 2 (one plane): Edit plan on the week's opener opens the two plans, last week's plan on top */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('#s2Edit'); if(!b || !on3() || !S || S.phase !== 'round' || tpDay() || S.fleet.length > maxPl()) return;
  const st = step(); if(st && st.t === 'plan') UI.c3tp = { key:null, want:true, wk:true }; }, true);
const tpKey = () => (S.day || 1) + '|' + S.si;
const tpOld = () => { const W = typeof ashPlanWas === 'function' ? ashPlanWas() : null; return W ? normPlan(cp(W)) : null; };
const tpBlank = pl => { const b = cp(normPlan(pl)); b.fleet.forEach(x => { x.sched = []; x.deps = x.deps ? [] : x.deps; }); return b; };
const tpHas = pl => normPlan(pl).fleet.some(x => x.sched.length);
const tpProfit = pl => { try{ return Math.round(dryRun(() => planLines(normPlan(pl)).v.profit)); }catch(e){ return null; } };
/* the change starts as before (the timetable, then the sheet); the timetable opens on the two plans */
if(H.startChange){ const sc0 = H.startChange;
  H.startChange = () => { if(on3() && tpDay() && S.fleet.length <= maxPl()) UI.c3tp = { key:null, want:true }; sc0(); }; }
const c3Studio0 = renderStudio;
renderStudio = function(st){
  try{ const U = UI.c3tp, s = step();
    if(U && U.want && on3() && s && s.t === 'plan' && S.phase !== 'setup' && (tpDay() || U.wk)){
      const pl = normPlan(currentPlan());
      if(!ashPlanWas()) S.rnd.planWas = { day:S.day || 1, pl:cp(pl) };   // today's plan: the Changes tab's "Today's plan"
      s2State(pl);   // the Studio's state starts from today's plan (its routes stay in the tray)
      U.key = tpKey(); U.want = false; U.co = 0; c1Ex().ttSeen = c1Ex().ttSeen || S.day || 1;   // its own callouts say how to drag (one callout at a time)
      applyPlan(tpBlank(pl)); save(); }
  }catch(e){ console.error(e); }
  return c3Studio0.apply(this, arguments);
};
/* the timetable: the old lane relabelled, the new lane named, the choice column, the compare bar */
const c3Tt0 = s2Timetable;
s2Timetable = function(pl, L){
  let h = c3Tt0.apply(this, arguments);
  if(!(typeof h === 'string' && h.indexOf('data-c1tt') >= 0)) return h;
  h = h.replace('class="s2-tt c1-tt', `class="s2-tt c1-tt ${on3() ? 'c3-drop' : ''}`);   // L1: the drop outline always shown
  if(!tpOn()) return h;
  const old = tpOld(); if(!old) return h;
  const wk = !tpDay(), O = T3('tp.lane.old').text, N = T3('tp.lane.new').text, C = T3('tp.choice'), plane = planeById(S.fleet[0].planeId);
  const nOld = old.fleet.reduce((t, x) => t + x.sched.length, 0), pNew = tpHas(currentPlan()) && npWorked() ? tpProfit(currentPlan()) : null, pOld = tpProfit(old);
  const flewLD = !wk && (() => { const X = I.c2X(), W0 = S.wk, eve = W0 && W0.dayDone === S.day; return (X.chgEve || (eve ? S.day : S.day - 1)) === 1; })();
  const oldLab = `<div class="c1-lc c3-lc"><b class="c3-k">${esc(O[wk ? 2 : 0] || "TODAY'S PLAN")}</b><small>${esc(flewLD && O[4] ? O[4] : O[wk ? 3 : 1] || 'Flew today')}</small><small>${esc(shortPlane(plane))} · ${plural(nOld, 'flight')}</small></div>`;
  const newLab = `<div class="c1-lc c3-lc new"><b class="c3-k">${esc(N[0] || 'NEW PLAN')}</b><small>${esc(N[wk ? 2 : 1] || 'For tomorrow')}</small><small>${esc(shortPlane(plane))} · ${tpHas(currentPlan()) ? plural(normPlan(currentPlan()).fleet[0].sched.length, 'flight') : esc(N[3] || 'drag flights in')}</small></div>`;
  const box = (k, lab, val, id, can) => `<div class="c3-ch ${k}${can ? ' on' : ''}"><small>${esc(lab)}</small><b class="${val === null ? 'none c4-wait' : val < 0 ? 'amber' : 'gold'}">${val === null ? esc(k === 'new' ? (C.text[3] || 'work it out first') : '—') : (val < 0 ? '−' : '') + money(Math.abs(val))}</b><button class="bv-btn ${can && (k === 'new' || pNew !== null) ? 'go' : ''}" id="${id}" ${can ? '' : 'disabled'}>${bt(C.button || 'Choose')} &#9654;</button></div>`;
  // the old row (p6h draws it as "Before: yesterday's plan") becomes TODAY'S PLAN, with its buttons gone
  h = h.replace(/<button class="btn c2-oldb[^>]*>[\s\S]*?<\/button>/, '').replace(/<button class="btn" id="c2OldBack"[\s\S]*?<\/button>/, '');
  h = h.replace(/(<div class="c1-row c2-oldrow"[^>]*>)<div class="c1-lc">[\s\S]*?<\/div>(<div class="c2-olane">[\s\S]*?<\/div>)<span><\/span><\/div>/, (m, a, lane) => `${a.replace('c2-oldrow', 'c2-oldrow c3-oldrow')}${oldLab}${lane}${box('old', C.text[wk ? 1 : 0] || 'Profit a day · flew today', pOld, 'c3ChooseOld', true)}</div>`);
  // the new row: its label, an empty lane says where to drag, and its choice box
  h = h.replace(/<div class="c1-row" data-c1row="0"><div class="c1-lc">[\s\S]*?<\/div>/, `<div class="c1-row c3-newrow" data-c1row="0">${newLab}`);
  h = h.replace(/<span class="c1-none">[^<]*<\/span>/, `<span class="c1-none c3-drophere">${esc(tx('tp.drop', 0, null, 'Drag a flight here'))}</span>`);
  h = h.replace(/(<div class="c1-row c3-newrow" data-c1row="0">[\s\S]*?<span class="c1-msg"[^>]*>[\s\S]*?<\/span>)/, m => m + box('new', C.text[2] || 'Profit a day · projected', pNew, 'c3ChooseNew', pNew !== null));
  h = h.replace(/(<div class="c1-tray"><div class="c1-lc"><b>[^<]*<\/b><small>)[^<]*(<\/small>)/, `$1${esc(tx('tp.tray', 0, null, 'drag one onto the new plan'))}$2`);
  return h;
};
/* the compare bar instead of the plan summary; the footer: Choose, or Back to the Day page */
const wkTitle = eve => tpDay() ? T3('tp.title', { date:dLong(eve ? S.day + 1 : S.day), airline:S.airline.name || 'Airline' }) : T3('tp.title.week', { n:weekNo(S.day || 1), airline:S.airline.name || 'Airline' });
function c3TpDecorate(){
  if(!tpOn()) return; const scr = screen(), old = tpOld(); if(!old) return;
  scr.classList.add('c3-tp'); document.body.classList.add('c3-tpb');
  const W0 = S.wk, eve = W0 && W0.dayDone === S.day, TT = wkTitle(eve), h1 = scr.querySelector('.c1-ttt h1') || scr.querySelector('.st-th h2'); if(h1 && TT.title){ h1.textContent = TT.title; const sub = h1.parentElement && h1.parentElement.querySelector('p'); if(sub && TT.text[0]) sub.textContent = TT.text[0]; }
  if(tpDay()) scr.querySelectorAll('.c1-ttbar .s2-dt, #cmpLW').forEach(x => x.remove());   // week 1: no Mon–Fri / Sat–Sun, no Compare with last week
  const tco = scr.querySelector('#c1TtCo'); if(tco) tco.remove();
  const wk = !tpDay(), K = T3('tp.compare'), pOld = tpProfit(old), has = tpHas(currentPlan()), worked = npWorked(), pNew = has && worked ? tpProfit(currentPlan()) : null, d = pNew === null ? null : pNew - pOld;
  const same = (() => { try{ return planKey(normPlan(currentPlan())) === planKey(old); }catch(e){ return true; } })(), FT = T3('tp.footer');
  const sumEl = [...scr.querySelectorAll('.s2-sum, .st-sum, .ps-bar, [class*="summary"]')].find(x => /PLAN SUMMARY|Seats likely filled/i.test(x.textContent));
  const cmp = `<div class="c3-cmp" role="status"><span class="c3-k">${esc(K.eyebrow || 'COMPARE')}</span><span>${esc(K.text[wk ? 1 : 0] || "Today's plan")} <b class="gold">${money(pOld)}</b> a day</span><span>${esc(K.text[2] || 'New plan')} <b class="${pNew === null ? '' : 'gold'}">${pNew === null ? '?' : money(pNew)}</b> a day</span>${d === null ? '' : `<b class="${d >= 0 ? 'green' : 'amber'}">${signed(d, true)} a day</b>`}<small>${esc(K.text[wk ? 4 : 3] || 'Projected for tomorrow')}</small></div>`;
  const had = scr.querySelector('.c3-cmp'); if(had) had.outerHTML = cmp; else if(sumEl) sumEl.outerHTML = cmp; else { const tt = scr.querySelector('[data-c1tt]'); if(tt) tt.insertAdjacentHTML('afterend', cmp); }
  const bar = scr.querySelector('.actbar'); if(bar){ const hint = bar.querySelector('.dk-hint, .ab-hint, p'); if(hint) hint.textContent = (has && !worked && FT.text[4 + (wk ? 1 : 0)]) || FT.text[(worked ? 2 : 0) + (wk ? 1 : 0)] || 'Choose the plan that flies tomorrow.';
    bar.querySelectorAll('button').forEach(b => { if(b.id === 'c3TpBack') return; if(/Work out my plan|Ready to fly|Next/.test(b.textContent) || b.id === 'nx') b.remove(); });
    const back = bar.querySelector('#s2Back, .bv-btn.back, [id$="Back"]'); if(back && back.id !== 'c3TpBack') back.remove();
    if(!bar.querySelector('#c3TpBack')){ const box = bar.querySelector('.ab-btns, .dk-btns') || bar.lastElementChild; if(box) box.insertAdjacentHTML('afterbegin', `<button class="bv-btn big" id="c3TpBack">&#9664; Back</button>`); }
    // the footer's green button works the new plan out; Choose ▶ on the new plan waits for it
    const wb = bar.querySelector('#c3TpWork'); if(wb) wb.remove();
    if(!worked){ const box = bar.querySelector('#c3TpBack') && bar.querySelector('#c3TpBack').parentElement; if(box) box.insertAdjacentHTML('beforeend', `<button class="bv-btn go big" id="c3TpWork" ${has && !same ? '' : 'disabled'}>${bt(FT.button || 'Work out my plan')} &#9654;</button>`); } }
  // callouts one at a time: build a new plan (on first open), then choose (when the new plan first has a flight)
  const U = UI.c3tp, Y = X3(), coN = !Y.seen.tp1 ? 1 : 0;   // round 3: callout 2 ("Now work it out") is gone
  if(coN && !scr.querySelector('[data-c3co]')){ const sx = wk ? '.week' : '', T = coN === 1 ? T3('tp.co1' + sx) : T3('tp.co2' + sx, { old:money(pOld), new:pNew === null ? '—' : money(pNew) }), tt = scr.querySelector('[data-c1tt]');
    if(tt){ tt.style.position = 'relative'; tt.insertAdjacentHTML('beforeend', c3Co(T, 'c3TpGot', '', 'c3-tpco')); const el = tt.querySelector('[data-c3co]'), at = tt.querySelector('.c3-newrow .c1-lane'), tray = [...tt.querySelectorAll('.c1-tray .c1-add, .c1-tray button, .c1-tray [draggable]')].pop();
      if(el && at){ const G = tt.getBoundingClientRect(), A = at.getBoundingClientRect(), TR = tray ? tray.getBoundingClientRect() : null; el.style.position = 'absolute'; el.style.top = Math.round(A.bottom - G.top + 12) + 'px';
        const left = Math.min(Math.max(8, (TR ? TR.right : A.left + 300) - G.left + 24), G.width - el.offsetWidth - 8); el.style.left = Math.round(left) + 'px';
        const ptr = el.querySelector('.c1-sco-ptr'); if(ptr) ptr.style.left = '40px'; }
      on('c3TpGot', () => { Y.seen['tp' + coN] = S.day || 1; save(); render(); }); } }
  on('c3ChooseOld', () => c3ChooseOld());
  on('c3ChooseNew', () => { if(!tpHas(currentPlan()) || !npWorked()) return; c3FlyNew(); });
  on('c3TpWork', () => { if(tpHas(currentPlan()) && !same) c3Work(); });
  on('c3TpBack', () => c3TpBack());
}
function c3ChooseOld(){
  const old = tpOld(); if(!old) return; applyPlan(old); const X = I.c2X(); X.kept[X.chgEve || S.day] = true;
  UI.c3tp = null; UI.c3ba = null; if(S.steps[S.si + 1] && S.steps[S.si + 1].t === 'workings') S.steps.splice(S.si + 1, 1);
  if(S.rnd){ delete S.rnd.planWas; S.rnd.ashChg = {}; } save(); next(); }
function c3ChooseNew(){ UI.c3ba = { key:tpKey(), co:1, wk:tpWk() }; UI.c3tp = null; UI.ashTab = 'c2ba'; save(); next(); }
function c3TpBack(){
  const X = I.c2X();
  // from week 2: back to the week's opener, last week's plan as it was
  if(tpWk()){ const old = tpOld(); if(old) applyPlan(old); UI.c3tp = null; UI.c3ba = null; if(UI.s2) UI.s2.mode = 'opener'; save(); render(); return; }
  // the Launch Day evening: the day has turned, so the Day page is drawn again over the plan step (both plans kept)
  if(!(S.wk && S.wk.dayDone === S.day)){ const d = X.chgEve || Math.max(1, (S.day || 2) - 1); UI.c3back = d; if(X.fra === d + 1) X.fraCardShown = false; UI.c3tp = null; save(); render(); return; }
  const old = tpOld(), d = X.chgEve || S.day; if(old) applyPlan(old);
  if(S.steps[S.si] && S.steps[S.si].t === 'plan' && S.steps[S.si + 1] && S.steps[S.si + 1].t === 'workings') S.steps.splice(S.si, 2);
  delete X.kept[d]; X.chgEve = null; if(X.fra === d + 1) X.fraCardShown = false; UI.c3tp = null; UI.c3ba = null; if(S.rnd){ delete S.rnd.planWas; S.rnd.ashChg = {}; }
  UI.view = null; save(); render(); }
const c3Plan0 = R.plan;
R.plan = st => { if(on3() && UI.c3back && S.phase !== 'setup'){ const d = UI.c3back, back = () => { UI.c3back = null; UI.c3tp = { key:tpKey(), want:false }; };
    H.dayPage({ d, keep:() => { back(); c3ChooseOld(); }, change:() => { back(); save(); render(); } }); return; }
  return c3Plan0(st); };
const c3Render0 = render;
render = function(){ const r = c3Render0.apply(this, arguments); try{ if(tpOn()) c3TpDecorate(); else { document.body.classList.remove('c3-tpb'); } c3NowStrip(); }catch(e){ console.error(e); } return r; };
/* the toolkit: on the two plans it plans the new one (auto-plan) and chooses; with auto-plan off, today's plan */
const tkPre0 = window.__tkPre;
window.__tkPre = R => { try{ if(tpOn()){ const tap = sel => { const e = document.querySelector(sel); if(!e || e.disabled) return false; e.click(); return true; };
      if(tap('#c3TpGot')) return 'two plans: got it';
      if(R && R.autoPlan && !tpHas(currentPlan())){ const B = window.__tk.autoPlan(); if(B) return 'two plans: auto-planned the new plan'; }
      const same = (() => { try{ return planKey(normPlan(currentPlan())) === planKey(tpOld()); }catch(e){ return false; } })();
      if(tpHas(currentPlan()) && !same && tap('#c3ChooseNew')) return 'chose the new plan';
      if(tpHas(currentPlan()) && !same && tap('#c3TpWork')) return 'two plans: work out my plan';
      if(tap('#c3ChooseOld')) return "kept today's plan"; }
    if(document.getElementById('c3BaNext')){ document.getElementById('c3BaNext').click(); return 'before / after: next'; }
    if(document.getElementById('c3BaGot')){ document.getElementById('c3BaGot').click(); return 'before / after: got it'; }
    if(document.getElementById('c3BaChoose')){ document.getElementById('c3BaChoose').click(); return 'before / after: choose a plan'; }
    if(document.getElementById('c3BaGo')){ document.getElementById('c3BaGo').click(); return 'before / after: work it out'; }
    if(document.getElementById('c3NpGo') && !document.getElementById('c3NpGo').disabled){ document.getElementById('c3NpGo').click(); return 'new plan: before / after'; }
    if(document.getElementById('c3FraGo')){ document.getElementById('c3FraGo').click(); return 'plan tomorrow with the new route'; }
  }catch(e){ console.error(e); } return tkPre0 ? tkPre0(R) : null; };

/* =====================================================================
   3 · BEFORE / AFTER, AS A GRAPH (T7, T8): opens by itself after Choose (new plan), before any sums. Profit a day as two stacked
   bars split by route (the route's colour, Routes colour), totals above, a dashed line at the old total; callouts one at a
   time; with the last, a small ƒ table and Work it out ▶, which opens the Changes sheet. Nothing to work out here.
   ===================================================================== */
const rCol = id => { const w = ((typeof WB !== 'undefined' && WB.routes) || []).find(x => x.id === id); return (w && w.colour) || String(WBS().routeColourDefault || '#4a6f99'); };
/* each route group's profit a day: its flights' takings less their own costs, and the plane's fixed costs shared by flight */
function c3Groups(pl){
  pl = normPlan(pl); let F = [], L = null; try{ L = dryRun(() => planLines(pl)); F = dryRun(() => withPlan(pl, () => planFlights().filter(f => !f.grounded))); }catch(e){ return { groups:[], total:0, L:null }; }
  const by = {}; F.forEach(f => { const g = by[f.route] || (by[f.route] = { id:f.route, n:0, pax:0, rev:0, cost:0, dep:f.dep });
    g.n++; g.pax += f.sold || 0; g.rev += (f.revenue !== undefined ? f.revenue : (f.sold || 0) * (pl.prices[f.route] || routeById(f.route).basePrice)); g.cost += (f.runCost || 0) + (f.fuelCost || 0) + (f.termCost || 0); g.dep = Math.min(g.dep, f.dep); });
  const groups = Object.values(by).sort((a, b) => a.dep - b.dep), n = groups.reduce((t, g) => t + g.n, 0), total = L ? Math.round(L.v.profit) : 0;
  const own = groups.reduce((t, g) => t + g.rev - g.cost, 0), rest = total - own;   // the plane's day, crew and the rest: shared out by flight
  groups.forEach(g => { g.profit = Math.round(g.rev - g.cost + (n ? rest * g.n / n : 0)); g.fare = pl.prices[g.id] || routeById(g.id).basePrice; });
  const s = groups.reduce((t, g) => t + g.profit, 0); if(groups.length && s !== total) groups[groups.length - 1].profit += total - s;
  return { groups, total, L, n };
}
const listOf = G => G.map(g => `${routeById(g.id).city} ${g.n === 1 ? 'once' : g.n === 2 ? 'twice' : `×${g.n}`}`).join(' and ');
function c3BaY(A, B, v){ const all = A.groups.concat(B.groups).map(g => g.profit), max = Math.max(500, A.total, B.total, ...all), top = Math.ceil((max + 1) / 500) * 500, neg = Math.min(0, ...all), bot = neg < 0 ? Math.floor(neg / 500) * 500 : 0; return 330 - (v - bot) / (top - bot) * 300; }
function c3BaSvg(A, B, step, labels){
  const max = Math.max(500, A.total, B.total, ...A.groups.concat(B.groups).map(g => g.profit)), top = Math.ceil((max + 1) / 500) * 500, neg = Math.min(0, ...A.groups.concat(B.groups).map(g => g.profit));
  const bot = neg < 0 ? Math.floor(neg / 500) * 500 : 0, W = 560, Hh = 380, y0 = 30, y1 = 330, sy = v => y1 - (v - bot) / (top - bot) * (y1 - y0), bw = 150, xs = [100, 310];
  let g = '';
  for(let v = bot; v <= top; v += 500){ const y = sy(v); g += `<line x1="70" x2="${xs[1] + bw + 10}" y1="${y}" y2="${y}" class="c3-gl ${v === 0 ? 'z' : ''}"/>`; if(v % 1000 === 0) g += `<text x="62" y="${y + 4}" class="c3-gt" text-anchor="end">${v < 0 ? '−' : ''}${money(Math.abs(v))}</text>`; }
  const bar = (P, x, dim, ring) => { let pos = 0, negs = 0, out = ''; P.groups.forEach(gr => { const r = routeById(gr.id), c = rCol(gr.id), up = gr.profit >= 0;
      const a = up ? pos : negs, b = up ? pos + gr.profit : negs + gr.profit, ya = sy(Math.max(a, b)), yb = sy(Math.min(a, b)), hgt = Math.max(1, yb - ya); if(up) pos = b; else negs = b;
      const lit = ring && ring === gr.id, op = dim || (ring && !lit) ? .35 : 1;
      const nm = `${r.city} ×${gr.n}`, fa = (typeof FLAG_ASPECT !== 'undefined' && FLAG_ASPECT[r.flag]) || 1.5, fw = 11 * fa, tw = nm.length * 7.6, cx = x + bw / 2 + (fw + 6) / 2, cy = (ya + yb) / 2;
      out += `<g opacity="${op}"><rect x="${x}" y="${ya}" width="${bw}" height="${hgt}" fill="${up ? c : 'var(--amber, #ffb547)'}" class="c3-seg ${lit ? 'lit' : ''}"/>${hgt > 34 ? `<svg x="${cx - tw / 2 - fw - 6}" y="${cy - 15}" width="${fw}" height="11" viewBox="0 0 ${fa * 10} 10" aria-hidden="true"><use href="#flag-${r.flag}" width="${fa * 10}" height="10"/></svg><text x="${cx}" y="${cy - 5}" class="c3-sl" text-anchor="middle">${esc(nm)}</text><text x="${x + bw / 2}" y="${cy + 13}" class="c3-sv" text-anchor="middle">${gr.profit < 0 ? '−' : ''}${money(Math.abs(gr.profit))}</text>` : ''}</g>`; });
    return out + `<text x="${x + bw / 2}" y="${sy(Math.max(P.total, 0)) - 10}" class="c3-tot" text-anchor="middle" opacity="${dim ? .35 : 1}">${P.total < 0 ? '−' : ''}${money(Math.abs(P.total))}</text>`; };
  g += bar(A, xs[0], step === 2 || step === 3, null) + bar(B, xs[1], step === 1, step === 3 ? labels.ring : null);
  g += `<line x1="${xs[0]}" x2="${xs[1] + bw}" y1="${sy(A.total)}" y2="${sy(A.total)}" class="c3-old"/>`;
  if(step >= 4 || labels.brk){ const ya = sy(A.total), yb = sy(B.total), x = xs[1] + bw + 14, BL = T3('ba.bracket', { money:signed(B.total - A.total, true) }).text, my = (ya + yb) / 2;
    g += `<path d="M${x - 6} ${ya} H${x} V${yb} H${x - 6}" class="c3-brk ${B.total >= A.total ? '' : 'neg'}"/><text x="${x + 8}" y="${my + 2}" class="c3-bl ${B.total >= A.total ? '' : 'neg'}">${esc(BL[0] || signed(B.total - A.total, true))}</text><text x="${x + 8}" y="${my + 18}" class="c3-bs">${esc(BL[1] || 'a day')}</text>`; }
  g += `<text x="${xs[0] + bw / 2}" y="${y1 + 24}" text-anchor="middle" class="c3-bn">${esc(labels.a)}</text><text x="${xs[0] + bw / 2}" y="${y1 + 42}" text-anchor="middle" class="c3-bs">${esc(labels.an)}</text>`;
  g += `<text x="${xs[1] + bw / 2}" y="${y1 + 24}" text-anchor="middle" class="c3-bn">${esc(labels.b)}</text><text x="${xs[1] + bw / 2}" y="${y1 + 42}" text-anchor="middle" class="c3-bs">${esc(labels.bn)}</text>`;
  return `<svg class="c3-svg" viewBox="0 0 ${W} ${Hh}" width="${W}" height="${Hh}" role="img" aria-label="Profit a day: ${esc(labels.a)} ${money(A.total)}, ${esc(labels.b)} ${money(B.total)}">${g}</svg>`;
}
/* the plan's day, by name ("Tuesday"): the day the two plans are for */
const npDayName = () => { const W0 = S.wk, eve = W0 && W0.dayDone === S.day; return dLong(eve ? S.day + 1 : S.day).split(' ')[0]; };
/* round 3: Before / after after the new-plan sheet: two title-only callouts, then Choose a plan ▶ in the footer */
function c3BaNp(old, now){
  const A = c3Groups(old), B = c3Groups(now), U = UI.c3ba, n2 = Math.min(3, Math.max(1, U.co || 1)), d = B.total - A.total, BT = T3('ba.title'), ax = T3('ba.axis');
  const lab = { a:T3('ba.table').text[5] || "Yesterday's plan", b:'Your new plan', an:plural(A.n, 'flight'), bn:plural(B.n, 'flight'), ring:null, brk:n2 >= 2 };
  const svg = c3BaSvg(A, B, n2 === 3 ? 0 : n2, lab);
  const C = n2 === 1 ? T3('ba.np.co1', { n:A.n, flights:plural(A.n, 'flight') }) : n2 === 2 ? T3('ba.np.co2', { money:money(Math.abs(d)), more:d >= 0 ? 'more' : 'less' }) : null;
  const co = C ? c3Co(Object.assign({}, C, { button:C.button || (n2 === 1 ? 'Next ▸' : 'Got it') }), n2 === 1 ? 'c3BaNext' : 'c3BaGot', `${n2} of 2`, 'c3-baco s' + (n2 === 1 ? 1 : 4)) : '';
  const tabs = ashTabs('c2ba').filter(t => t.id !== 'whatif'), day = npDayName(), F = T3('ba.np.footer', { day }).text;
  const top = `<header class="ash-top"><div class="ash-tt"><span class="ash-crumb">${esc(`${S.airline.name || 'Airline'} HQ · ${F[1] || `${day}'s plan`}`)}</span><h1 class="ash-title">${esc(BT.title || "Before / after: yesterday's plan and your new plan")}</h1></div><nav class="ash-tabs" aria-label="Sheets">${tabs.map(t => `<button class="ash-tab ${t.on ? 'on' : ''} ${t.off ? 'off' : ''}" data-ashtab="${esc(t.id)}" ${t.off || t.on ? 'aria-disabled="true"' : ''}>${ashIco(t.ic)}${esc(t.label)}</button>`).join('')}</nav></header>`;
  const body = `<div class="dp ash-page c3-ba c5-banp"><section class="ash c3-bas" aria-label="Before / after">${top}<div class="c3-bab"><div class="c3-gw"><p class="c3-gtitle">${esc(ax.title || 'Profit a day')}</p>${svg}${n2 === 1 ? co : ''}</div><div class="c3-side">${n2 === 2 ? co : ''}</div></div></section></div>`;
  screen().innerHTML = shell(body, deskBar(esc(F[0] || `${day}'s plan · what you worked out.`), `<button class="bv-btn big" id="c3BaBack">&#9664; Back</button><button class="bv-btn go big" id="c3BaChoose">${bt(T3('ba.np.footer').button || 'Choose a plan')} &#9654;</button>`));
  screen().querySelectorAll('[data-ashtab]').forEach(b => b.onclick = () => { if(b.getAttribute('aria-disabled') === 'true') return; UI.ashTab = b.getAttribute('data-ashtab'); render(); });
  const el = screen().querySelector('.c3-baco'), sv = screen().querySelector('.c3-svg');
  if(el && sv){ const S0 = sv.getBoundingClientRect(), G = sv.parentElement.getBoundingClientRect(), k = S0.width / 560; el.classList.add('pl');
    if(n2 === 2){ const side = el.parentElement, top2 = c3BaY(A, B, Math.max(A.total, B.total)) * k + S0.top; el.style.position = 'relative'; el.style.left = '0'; el.style.top = '0'; el.style.width = '100%';
      side.style.paddingTop = Math.max(0, Math.round(top2 - side.getBoundingClientRect().top)) + 'px'; }
    else { const mid = c3BaY(A, B, A.total / 2) * k + S0.top; el.style.position = 'absolute'; el.style.left = Math.round(S0.left - G.left + 250 * k + 14) + 'px'; el.style.top = Math.round(mid - G.top - 30) + 'px'; } }
  on('c3BaNext', () => { U.co = 2; render(); });
  on('c3BaGot', () => { U.co = 3; render(); });
  on('c3BaChoose', () => npChoose());
  on('c3BaBack', () => { UI.ashTab = null; UI.c3ba = null; c3BackToPlans(); });
  return true;
}
function c3BaPage(){
  const old = tpOld(), now = normPlan(currentPlan()); if(!old) return false;
  if(UI.c3ba && UI.c3ba.np) return c3BaNp(old, now);
  const wk = !tpDay(), A = c3Groups(old), B = c3Groups(now), U = UI.c3ba || (UI.c3ba = { key:tpKey(), co:5 }), step = Math.min(4, Math.max(1, U.co || 1)), all = (U.co || 1) > 4;
  const ids = new Set(A.groups.map(g => g.id)), fresh = B.groups.find(g => !ids.has(g.id)), big = fresh || B.groups.slice().sort((x, y) => Math.abs(y.profit - ((A.groups.find(a => a.id === y.id) || {}).profit || 0)) - Math.abs(x.profit - ((A.groups.find(a => a.id === x.id) || {}).profit || 0)))[0];
  const BT = T3('ba.title'), tl = [BT.title, BT.text[0]], ax = T3('ba.axis'), lab = { a:wk ? "Last week's plan" : (T3('ba.table').text[5] || "Yesterday's plan"), b:'Your new plan', an:plural(A.n, 'flight'), bn:plural(B.n, 'flight'), ring:big && big.id };
  const svg = c3BaSvg(A, B, all ? 4 : step, lab), d = B.total - A.total, fewer = A.n - B.n;
  // the small table (with the last callout): what changes, a day
  const TB = T3('ba.table').text, tr = (k, a, b, good, m) => { const x = b - a, cls = !x || good === null ? '' : (x > 0) === good ? 'green' : 'amber'; return `<tr><th>${esc(k)}</th><td>${m ? money(a) : num(a)}</td><td>${m ? money(b) : num(b)}</td><td class="${cls}">${x ? signed(x, m) : '—'}</td></tr>`; };
  const LA = A.L ? A.L.v : {}, LB = B.L ? B.L.v : {};
  const table = (all || step >= 4) ? `<div class="c3-tabw"><table class="c3-batab"><caption>${esc(T3('ba.table').title || 'What changes, a day')} <i class="ash-au">ƒ</i></caption><thead><tr><th></th><th>${esc(TB[wk ? 6 : 5] || "Today's plan")}</th><th>${esc(TB[7] || 'New plan')}</th><th>${esc(TB[8] || 'Difference')}</th></tr></thead><tbody>
    ${tr(TB[0] || 'Flights', A.n, B.n, null)}${tr(TB[1] || 'Passengers', A.L ? A.L.pax : 0, B.L ? B.L.pax : 0, null)}${tr(TB[2] || 'Ticket revenue', Math.round(LA.rev || 0), Math.round(LB.rev || 0), true, true)}${tr(TB[3] || 'Costs', Math.round(LA.cost || 0), Math.round(LB.cost || 0), false, true)}${tr(TB[4] || 'Profit', A.total, B.total, true, true)}</tbody></table><p class="c3-tnote">${esc(tx('ba.table.note', 0))}</p></div>` : '';
  // the callout, one at a time
  let co = '';
  if(!all){ const fw = fewer > 0 ? T3('ba.co4.fewer', { n:fewer }).text[fewer === 1 ? 0 : 1] || '' : '';
    const C = step === 1 ? T3(wk ? 'ba.co1.week' : 'ba.co1', { n:A.n, list:listOf(A.groups), money:money(A.total) })
      : step === 2 ? T3('ba.co2', { n:B.n, list:listOf(B.groups), money:money(B.total) })
      : step === 3 && big ? (() => { const r = routeById(big.id), o = A.groups.reduce((t, g) => t + g.profit, 0), was = A.groups.filter(g => !B.groups.some(b2 => b2.id === g.id)), than = fresh && was.length && big.profit > was.reduce((t, g) => t + g.profit, 0) ? T3(wk ? 'ba.co3.than.week' : 'ba.co3.than', { old:listOf(was).replace(/ (once|twice|×\d+)/g, '') + (was.length > 1 ? '' : '') }).text[0] || '' : '';
          const T = T3('ba.co3', { city:r.city, nf:big.n === 1 ? 'flight' : `${num(big.n)} flights`, pax:num(big.pax), fare:money(big.fare), tk:money(Math.round(big.rev)), profit:money(big.profit), than:than.replace(/^:\s*/, ': ') });
          if(!fresh) T.title = (T3('ba.co3').title || '').replace(/\{nf\}|'s/g, '') || r.city; return T; })()
      : T3(U.np ? 'ba.co4.np' : 'ba.co4', { money:money(Math.abs(d)), more:d >= 0 ? 'more' : 'less', fewer:fw });
    co = c3Co(Object.assign({}, C, { button:step < 4 ? (C.button || 'Next ▸') : (C.button || 'Work it out ▶') }), step < 4 ? 'c3BaNext' : 'c3BaGo', `${step} of 4`, 'c3-baco s' + step); }
  const tabs = ashTabs('c2ba').filter(t => t.id !== 'whatif');   // the sheets this page leads to (What if is Monday's own)
  const top = `<header class="ash-top"><div class="ash-tt"><span class="ash-crumb">${esc(`${S.airline.name || 'Airline'} HQ · Work out my plan`)}</span><h1 class="ash-title">${esc(tl[wk ? 1 : 0] || "Before / after: today's plan and your new plan")}</h1></div><nav class="ash-tabs" aria-label="Sheets">${tabs.map(t => `<button class="ash-tab ${t.on ? 'on' : ''} ${t.off ? 'off' : ''}" data-ashtab="${esc(t.id)}" ${t.off || t.on ? 'aria-disabled="true"' : ''}>${ashIco(t.ic)}${esc(t.label)}</button>`).join('')}</nav></header>`;
  const body = `<div class="dp ash-page c3-ba"><section class="ash c3-bas" aria-label="Before / after">${top}<div class="c3-bab"><div class="c3-gw"><p class="c3-gtitle">${esc(ax.title || 'Profit a day')}</p>${svg}${step === 4 && !all ? '' : co}</div><div class="c3-side">${step === 4 && !all ? co : ''}${table}</div></div></section></div>`;
  const F = T3('ba.footer').text;
  screen().innerHTML = shell(body, deskBar(F[wk ? 1 : 0] || "Tomorrow's plan · see what changes before the sums.", `<button class="bv-btn big" id="c3BaBack">&#9664; Back</button><button class="bv-btn go big" id="c3BaFly" disabled>${bt(wk ? (typeof goLabel === 'function' ? goLabel('Ready to fly') : 'Ready to fly') : I.C2 ? I.C2('chg.fly').text[0] : 'Fly tomorrow')} &#9654;</button>`));
  screen().querySelectorAll('[data-ashtab]').forEach(b => b.onclick = () => { if(b.getAttribute('aria-disabled') === 'true') return; const id = b.getAttribute('data-ashtab');
    if(id === 'changes' && !U.np){ U.co = 5; UI.ashTab = null; X3().seen.ba = S.day || 1; save(); render(); return; }   // the Changes tab is Work it out ▶
    UI.ashTab = id; render(); });
  // the callout beside the bar it is about
  const el = screen().querySelector('.c3-baco'), sv = screen().querySelector('.c3-svg');
  if(el && sv){ const S0 = sv.getBoundingClientRect(), G = sv.parentElement.getBoundingClientRect(), k = S0.width / 560, x = step === 1 ? 100 + 150 : 310 + 150; el.classList.add('pl');
    if(step === 4){ const side = el.parentElement, mid = c3BaY(A, B, (A.total + B.total) / 2) * k + S0.top; el.style.position = 'relative'; el.style.left = '0'; el.style.top = '0'; el.style.width = '100%';
      side.style.paddingTop = Math.max(0, Math.round(mid - side.getBoundingClientRect().top - 40)) + 'px'; }
    else { el.style.position = 'absolute'; el.style.left = Math.round(S0.left - G.left + x * k + 14) + 'px'; el.style.top = Math.round(S0.top - G.top + 40) + 'px'; } }
  on('c3BaNext', () => { U.co = step + 1; render(); });
  on('c3BaGo', () => { if(U.np){ npChoose(); return; } U.co = 5; UI.ashTab = null; X3().seen.ba = S.day || 1; save(); render(); });
  on('c3BaBack', () => { UI.ashTab = null; UI.c3ba = null; c3BackToPlans(); });
  return true;
}
/* ◀ Back on Before / after or the Changes sheet: the two plans again, both kept */
function c3BackToPlans(){ const i = S.si; UI.c3np = null; if(step().t === 'workings' && S.steps[i - 1] && S.steps[i - 1].t === 'plan'){ S.si = i - 1; UI.c3tp = { key:tpKey(), want:false, wk:!tpDay() }; if(S.rnd) S.rnd.ashChg = {}; save(); render(); return true; } return false; }
const baOn = () => tpDay() || !!(UI.c3ba && UI.c3ba.wk);
const c3Work0 = R.workings;
R.workings = st => {
  try{ if(on3() && S.phase !== 'setup' && UI.c3np && UI.c3np.day === S.day && !(UI.c3ba && UI.c3ba.np) && ashPlanWas()){ c3NpPage(); return; } }catch(e){ console.error(e); }
  try{ if(on3() && S.phase !== 'setup' && baOn() && ashPlanWas() && (UI.ashTab === 'c2ba' || (UI.c3ba && UI.c3ba.co < 5))){ if(c3BaPage()) return; } }catch(e){ console.error(e); }
  return c3Work0(st);
};
/* the tab, between Week 1 and Changes, open once he has chosen a new plan */
const c3Tabs0 = ashTabs;
ashTabs = function(onT){ let out = c3Tabs0.apply(this, arguments);
  try{ if(on3() && S.phase !== 'setup' && baOn() && ashPlanWas() && step().t === 'workings'){ out = out.filter(t => t.id !== 'c2ba'); const i = out.findIndex(t => t.id === 'week');
      out.splice(i + 1, 0, { id:'c2ba', label:I.C2 ? (I.C2('plan2.tab').text[0] || 'Before / after') : 'Before / after', ic:'chart', on:onT === 'c2ba', off:false });
      if(!UI.c3np && !out.some(t => t.id === 'changes')) out.splice(i + 2, 0, { id:'changes', label:'Changes', ic:'scale', on:false, off:false }); } }catch(e){}
  return out; };
/* Back on the Changes sheet returns to the two plans too */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.actbar #back, .actbar [data-back], .actbar .back');
  if(!b || !on3() || !baOn() || step().t !== 'workings' || !ashPlanWas() || S.phase === 'setup') return; if(c3BackToPlans()){ e.preventDefault(); e.stopImmediatePropagation(); } }, true);

/* =====================================================================
   4 · THE CHANGES SHEET (T4, T5, T6): the new route first (Finance's, all ƒ), then the Difference callout before the demo
   ===================================================================== */
const headOld = () => (S.day || 1) <= 7 ? (T3('changes.head.week1').title || "Today's plan") : (T3('changes.head.later').title || 'Last week');
const headNew = () => T3('changes.head.change').title || 'With your change';
function c3Flights(pl){ try{ return dryRun(() => withPlan(normPlan(pl), () => planFlights().filter(f => !f.grounded))); }catch(e){ return []; } }
const groupName = (F, withFare, pl) => { const by = {}; F.forEach(f => { by[f.route] = (by[f.route] || 0) + 1; }); return Object.keys(by).map(id => `${routeById(id).city} ×${by[id]}${withFare ? ` · ${money((pl.prices || {})[id] || routeById(id).basePrice)}` : ''}`).join(' · '); };
const c3Chg0 = ashChanges;
ashChanges = function(){
  const out = c3Chg0.apply(this, arguments); if(!on3() || S.phase === 'setup' || !out.length) return out;
  const was = ashPlanWas(); if(!was) return out; const a = normPlan(cp(was)), b = normPlan(currentPlan()), fa = new Set(a.fleet.flatMap(x => x.sched)), add = [...new Set(b.fleet.flatMap(x => x.sched))].filter(id => !fa.has(id));
  if(!add.length) return out;
  return [{ kind:'newroute', route:add[0], from:a, to:b, key:`newroute|${add[0]}|${planKey(b)}` }].concat(out);
};
function c3NewRouteSpec(ch, i, n){
  const C = ashChgS()[ch.key] || (ashChgS()[ch.key] = {}), r = routeById(ch.route), Fa = c3Flights(ch.from), Fb = c3Flights(ch.to), mine = Fb.filter(f => f.route === ch.route);
  // the flights it replaced: today's flights on the routes the new plan no longer flies (a route that stays, with fewer flights
  // or a new fare, is its own part next); none dropped: it took time the plane had free
  const stay = new Set(Fb.map(f => f.route)), gone = Fa.filter(f => !stay.has(f.route));
  const sum = F => F.reduce((t, f) => ({ pax:t.pax + (f.sold || 0), rev:t.rev + (f.revenue !== undefined ? f.revenue : 0), cost:t.cost + (f.runCost || 0) + (f.fuelCost || 0) + (f.termCost || 0) }), { pax:0, rev:0, cost:0 });
  const A = sum(gone), B = sum(mine), fareA = gone.length ? ((ch.from.prices || {})[gone[0].route] || routeById(gone[0].route).basePrice) : null, fareB = (ch.to.prices || {})[ch.route] || r.basePrice;
  const RW = T3('chg3.route.rows').text, pA = Math.round(A.rev - A.cost), pB = Math.round(B.rev - B.cost);
  const cols = [{ c:'B', w:200, top:headOld(), flag:gone.length ? routeById(gone[0].route).flag : null, main:gone.length ? groupName(gone, true, ch.from) : '—' }, { c:'C', w:200, top:headNew(), flag:r.flag, main:groupName(mine, true, ch.to) }, { c:'D', w:180, top:tx('chg3.head.diff', (S.day || 1) <= 7 ? 0 : 1, null, "change − today's"), main:tx('chg3.head.diff', 2, null, 'Difference') }];
  const rows = [{ r:1, t:'hdr' }, { r:2, label:RW[0] || 'Passengers a day', ic:'person' }, { r:3, label:RW[1] || 'Fare', ic:'tag' }, { r:4, label:RW[2] || 'Ticket revenue a day', ic:'coins', gold:true }, { r:5, label:RW[3] || 'Costs a day', ic:'receipt', t:'tot' }, { r:6, label:RW[4] || 'Profit a day', ic:'chart', t:'fin', gold:true }];
  const dc = (x, good, m) => ({ t:x ? signed(x, m) : '—', f:true, cls:!x || good === null ? '' : (x > 0) === good ? 'pos' : 'amb' });
  const seatsA = gone.reduce((t, f) => t + (f.seats || 0), 0), seatsB = mine.reduce((t, f) => t + (f.seats || 0), 0);
  const v = { B2:gone.length ? { t:num(A.pax), f:true, bar:seatsA ? A.pax / seatsA : null } : { t:'—' }, C2:{ t:num(B.pax), f:true, bar:seatsB ? B.pax / seatsB : null }, D2:dc(B.pax - A.pax, null, false),
    B3:{ t:fareA ? money(fareA) : '—' }, C3:{ t:money(fareB) }, D3:fareA ? dc(fareB - fareA, null, true) : { t:'—' },
    B4:{ t:money(Math.round(A.rev)), f:true }, C4:{ t:money(Math.round(B.rev)), f:true }, D4:dc(Math.round(B.rev - A.rev), true, true),
    B5:{ t:money(Math.round(A.cost)), f:true }, C5:{ t:money(Math.round(B.cost)), f:true }, D5:dc(Math.round(B.cost - A.cost), false, true),
    B6:{ t:money(pA), f:true }, C6:{ t:money(pB), f:true }, D6:dc(pB - pA, true, true) };
  C.done = true;   // nothing to work out on this part
  const line = `<span class="pos">✓</span> ${T3H(tx('chg3.route.line', 0, { city:r.city }).replace(/^\s*✓\s*/, ''))}`;
  const crumb = `${S.airline.name || 'Airline'} HQ · ${tx('chg3.crumb', 0, null, 'Work out my plan · first, the new route')}`;
  return { id:'changes:' + ch.key, crumb, title:'Is the change worth it?', tabs:ashTabs('changes'), lw:250, cols, rows, v, sums:[], act:null, just:null, doneF:null, doneLine:line, ch, c3route:{ gone, mine, A, B, pA, pB, fareA, fareB, i, n } };
}
const c3ChgSpec0 = ashChangeSpec;
ashChangeSpec = function(ch, i, n){
  if(on3() && ch && ch.kind === 'newroute') return c3NewRouteSpec(ch, i, n);
  const sp = c3ChgSpec0.apply(this, arguments); if(!on3() || !sp || !sp.cols) return sp;
  // the heads: Today's plan (week 1) or Last week · With your change · change − today's; the main lines name the flights
  const wk1 = (S.day || 1) <= 7, Fa = c3Flights(ch.from), Fb = c3Flights(ch.to);
  if(ch.kind === 'fare'){ const fa = Fa.filter(f => f.route === ch.route), fb = Fb.filter(f => f.route === ch.route); sp.cols[0].main = groupName(fa, true, ch.from) || sp.cols[0].main; sp.cols[1].main = groupName(fb, true, ch.to) || sp.cols[1].main; }
  else { sp.cols[0].main = groupName(Fa, false) || sp.cols[0].main; sp.cols[1].main = groupName(Fb, false) || sp.cols[1].main; }
  sp.cols[0].top = headOld(); sp.cols[1].top = headNew(); sp.cols[2].top = tx('chg3.head.diff', wk1 ? 0 : 1, null, "change − today's"); sp.cols[2].main = tx('chg3.head.diff', 2, null, 'Difference');
  // the old first-time callout to the right of the sheet is gone: the Difference callout comes first, under the table
  const rn = x => String(x).replace(/\bNow\b/g, headOld());   // T6: "Now" is Today's plan (week 1) or Last week, in every word of the sum
  (sp.sums || []).forEach(s => { s.co = null; ['words', 'lineBuild', 'lineType', 'name', 'title', 'sumWords'].forEach(k => { if(typeof s[k] === 'string') s[k] = rn(s[k]); });
    if(typeof s.wordsOf === 'function' && !s.c3rn){ const w0 = s.wordsOf; s.wordsOf = ref => rn(w0(ref)); s.c3rn = true; } });
  const CH = ashChanges(); if(CH.length > 1){ const k = CH.findIndex(c => c.key === ch.key); if(k > 0) sp.crumb = `${S.airline.name || 'Airline'} HQ · ${k === CH.length - 1 && ch.kind === 'plan' ? tx('chg3.last', 0, null, 'then, the whole plan') : tx('chg3.crumb', 1, { city:routeById(ch.route || (CH[0] && CH[0].route) || S.market).city }, 'then')}`; }
  return sp;
};
const c3ChgPage0 = ashChangesPage;
ashChangesPage = function(st, CH){
  const sp0 = (() => { const S0 = ashChgS(), i = Math.max(0, CH.findIndex(c => (UI.ashJust && UI.ashJust.sheet === 'changes:' + c.key) || !(S0[c.key] || {}).done)); return { ch:CH[i] || CH[CH.length - 1], i }; })();
  if(on3() && sp0.ch && sp0.ch.kind === 'newroute' && !(ashChgS()[sp0.ch.key] || {}).passed){ c3NewRoutePage(sp0.ch, sp0.i, CH); return; }
  const r = c3ChgPage0.apply(this, arguments);
  try{ if(on3()){ screen().querySelectorAll('[data-c1sig], .ash-line').forEach(el => { if(/\bNow\b/.test(el.textContent)) el.innerHTML = el.innerHTML.replace(/\bNow\b/g, esc(headOld())); });   // T6, in the signal too
      c3DiffCallout(CH); } }catch(e){ console.error(e); }
  return r;
};
function c3NewRoutePage(ch, i, CH){
  const S0 = ashChgS(), sp = c3NewRouteSpec(ch, i, CH.length), Z = sp.c3route, r = routeById(ch.route), nxt = CH[i + 1], nx = nxt ? (nxt.kind === 'fare' ? routeById(nxt.route).city : tx('chg3.last', 0, null, 'the whole plan').replace(/^then,\s*/, '')) : '';
  const wasName = Z.gone.length ? routeById(Z.gone[0].route).city : '', fl = n => n === 1 ? 'flight' : 'flights';
  const V = { city:r.city, CITY:r.city.toUpperCase(), was:wasName, n:num(Z.mine.length), m:num(Z.gone.length), flights:fl(Z.mine.length), wflights:fl(Z.gone.length), rev:money(Math.abs(Math.round(Z.B.rev - Z.A.rev))), revmore:Z.B.rev >= Z.A.rev ? 'more' : 'less', profit:money(Math.abs(Z.pB - Z.pA)), profmore:Z.pB >= Z.pA ? 'more' : 'less', next:nx || 'Next' };
  const T = Z.gone.length ? T3('chg3.route', V) : T3('chg3.route.free', Object.assign({}, V, { rev:money(Math.round(Z.B.rev)), profit:money(Z.pB) }));
  ashKeep('changes', sp, ch.key);
  screen().innerHTML = shell(`<div class="dp ash-page c3-nr">${ashHtml(sp)}</div>`, deskBar(T3('chg3.route.line', { city:r.city }).text[0] ? '' : '', backBtn() + `<button class="bv-btn primary big" id="ashChgGo" disabled>${bt(I.C2 ? I.C2('chg.fly').text[0] : 'Fly tomorrow')} &#9654;</button>`));
  ashBind(sp);
  const root = screen(), gw = root.querySelector('.ash-gridw'), cell = ref => root.querySelector(`.ash-grid .ash-c[data-ref="${ref}"]`);
  if(gw){ gw.insertAdjacentHTML('beforeend', c3Co(Object.assign({}, T, { button:T.button || `Next: ${nx} ▸` }), 'c3NrNext', `1 of ${CH.length}`, 'pu')); c3PlaceUnder(gw.querySelector('[data-c3co]'), cell('D6')); }
  const d6 = cell('D6'); if(d6) d6.classList.add('c1-ring');
  on('c3NrNext', () => { const c = S0[ch.key] || (S0[ch.key] = {}); c.done = true; c.seen = true; c.passed = true; UI.ashJust = null; save(); render(); });
}
/* What the Difference column means: under the table, before Finance's demo (or the first sum), once */
function c3DiffCallout(CH){
  const sp = ashLive(); if(!sp || !/^changes:/.test(sp.id) || !sp.act) return; const Y = X3(); if(Y.seen.diff) return;
  const root = screen(), gw = root.querySelector('.ash-gridw'), cell = ref => root.querySelector(`.ash-grid .ash-c[data-ref="${ref}"]`); if(!gw) return;
  const k = CH.findIndex(c => 'changes:' + c.key === sp.id), demo = !!sp.act.c2demo, rows = sp.rows.filter(r => r.r > 1 && r.label && r.t !== 'gap');
  // one sentence about a filled Difference: the fare's if it changed, else the first that did (the words are the workbook's)
  const tg = ashRef(sp.act.tgt).r, SG = T3('chg3.diff.sign').text, wantT = r => r.r === tg && typeof sp.act.want === 'number' && sp.act.want ? signed(sp.act.want, sp.act.unit === '£') : '';
  const diffs = rows.map(r => ({ r, t:String((sp.v['D' + r.r] || {}).t || '') || wantT(r) })).filter(x => /^[+−]/.test(x.t));   // the one Finance works out counts too
  const pick = diffs.find(x => /fare/i.test(x.r.label)) || diffs[0], signs = pick ? [(() => { const m = /^([+−])(.*)$/.exec(pick.t), up = m[1] === '+', fare = /fare/i.test(pick.r.label);
    return (fare ? (SG[0] || '**{v}** means the fare is {n} {dir}.') : (SG[1] || '**{v}** means {lab} went {dir} by {n}.')).replace('{v}', pick.t).replace('{n}', m[2]).replace('{lab}', String(pick.r.label).toLowerCase().replace(/ a day$/, ''))
      .replace('{dir}', fare ? (up ? SG[2] || 'higher' : SG[3] || 'lower') : (up ? SG[4] || 'up' : SG[5] || 'down')); })()] : [];
  const T = T3('chg3.diff', { head:headOld(), signs:signs.join(' ') }); T.text = T.text.filter(Boolean); if(!signs.length) T.text = T.text.filter(t => !/\{signs\}/.test(t) && t.trim());
  if(!demo) T.button = 'Got it';
  // nothing is lit and nothing moves until Watch ▶
  UI.c2Demo = '__wait'; const ash = root.querySelector('section.ash[data-ash]'); if(ash) ash.classList.add('c3-hold');
  root.querySelectorAll('[data-c1sig], .c1-sig').forEach(x => x.classList.add('c3-hide'));
  ['.ash-fb .ash-nb', '.ash-fb .ash-f', '.ash-fb .ash-w'].forEach(q => { const e = root.querySelector(q); if(e) e.innerHTML = ''; });
  const ln = root.querySelector('.ash-line'); if(ln && tx('chg3.diff.line', 0)) ln.innerHTML = c1Html(tx('chg3.diff.line', 0));
  gw.insertAdjacentHTML('beforeend', c3Co(T, 'c3DiffGo', `${k + 1} of ${CH.length}`, 'pu'));
  const last = cell('D' + (sp.rows[sp.rows.length - 1] || {}).r) || cell('D' + tg);   // the whole Difference column, ringed
  c3PlaceUnder(gw.querySelector('[data-c3co]'), last);
  const coEl = gw.querySelector('[data-c3co]'); if(ln && coEl){ const L = ln.getBoundingClientRect(), C0 = coEl.getBoundingClientRect(); if(C0.left > L.left + 160) ln.style.maxWidth = Math.round(C0.left - L.left - 20) + 'px'; }
  const top = cell('D1'), bot = last; if(top && bot){ const G = gw.getBoundingClientRect(), A = top.getBoundingClientRect(), B = bot.getBoundingClientRect();
    gw.insertAdjacentHTML('beforeend', `<i class="c3-ring" style="left:${A.left - G.left}px;top:${A.top - G.top}px;width:${A.width}px;height:${B.bottom - A.top}px"></i>`); }
  const ptr = document.getElementById('c1Ptr'); if(ptr) ptr.remove();
  on('c3DiffGo', () => { Y.seen.diff = S.day || 1; UI.c2Demo = null; save(); render(); });
}
/* Finance's demo on the Changes sheet waits while the callout is open */
if(H.demo){ const demo0 = H.demo; H.demo = sp => { if(on3() && sp && /^changes:/.test(sp.id) && !X3().seen.diff) return; return demo0(sp); }; }
if(window.__tkSums){
  window.__tkSums.unshift({ what:'the Difference column: Watch', test:() => !!document.getElementById('c3DiffGo'), plan:() => ({ at:'#c3DiffGo', value:'Watch', go:() => document.getElementById('c3DiffGo').click() }) });
  window.__tkSums.unshift({ what:'the new route first: Next', test:() => !!document.getElementById('c3NrNext'), plan:() => ({ at:'#c3NrNext', value:'Next', go:() => document.getElementById('c3NrNext').click() }) });
}

/* =====================================================================
   5 · LAUNCH DAY: THE PROFIT ON AN EXAMPLE COLUMN (L5, L4). Once the ticket sums are done: a callout (Watch ▶), Finance builds
   G9 = G5 − G8 on made-up figures (Settings launchExampleColumn), then he builds his own (built, not counted).
   ===================================================================== */
const exFig = () => { const s = String(WBS().launchExampleColumn || ''), g = k => { const m = new RegExp(k + '\\s+(-?[\\d.]+)', 'i').exec(s); return m ? +m[1] : null; };
  const rev = g('revenue'), other = g('other'), fuel = g('fuel'); return rev === null || other === null || fuel === null ? null : { rev, other, fuel, cost:other + fuel, profit:rev - other - fuel }; };
const c3Ld0 = ashLaunchSpec;
ashLaunchSpec = function(){
  const sp = c3Ld0.apply(this, arguments);
  try{ if(!on3() || !S || S.phase !== 'setup' || !sp || !sp.c1 || !['pdemo', 'done'].includes(sp.c1.stage)) return sp;
    const X = c1Ld(), E = exFig(); if(!E) return sp;
    const P = sp.cols.filter(k => k.c !== 'G').slice(-1)[0].c, CL = T3('ld3.col').text;
    // round 3: the made-up example column only while Finance demonstrates (rule 8); before Watch and on his turn it is gone
    const demo = !!X.c3pjob && !X.c3pdemo;
    if(demo){   // narrower columns so the example fits at 1366: option columns 118 with short heads, his plan 166, labels 250
      sp.lw = 250; sp.cols.forEach(k => { if(k.src){ k.w = 118; k.main = String(k.main || '').replace(/ at /, ' '); } else if(k.c === P) k.w = 166; });
      if(!sp.cols.some(k => k.c === 'G')) sp.cols.push({ c:'G', w:150, top:CL[0] || 'Finance · made-up', main:CL[1] || 'Example', c3ex:true });
      Object.assign(sp.v, { G5:{ t:money(E.rev) }, G6:{ t:money(E.other) }, G7:{ t:money(E.fuel) }, G8:{ t:money(E.cost) } }); }
    else { sp.cols = sp.cols.filter(k => k.c !== 'G'); Object.keys(sp.v).forEach(k => { if(/^G\d/.test(k)) delete sp.v[k]; }); }
    if(sp.c1.stage === 'done' && X.c3pmine) return sp;
    const want = (() => { try{ return planLines(currentPlan()).profit; }catch(e){ return 0; } })();
    if(!X.c3pjob){ sp.c1.stage = 'pjob'; sp.act = null; sp.just = null; sp.v[P + '9'] = {}; sp.doneLine = ''; return sp; }
    if(!X.c3pdemo){ const s = { id:'ld:profit', kind:'ld:profit', tgt:'G9', refs:['G5', 'G8'], ops:['−'], words:'Total revenue − Total costs', how:'formula', needEnter:true, c2demo:true, commute:false, unit:'£', want:E.profit, done:false, built:false, recKey:null, no:null,
        wordsOf:ref => /5$/.test(ref) ? 'Total revenue' : 'Total costs', lineBuild:T3H(tx('ld.profit.watch', 0)), answer:() => { X.c3pdemo = S.day || 1; X.pdemo = S.day || 1; save(); return { ok:true }; } };
      sp.v.G9 = {}; sp.v[P + '9'] = {}; sp.sums = (sp.sums || []).filter(x => x.id !== 'ld:profit').concat([s]); sp.act = s; sp.just = null; sp.doneLine = ''; sp.c1.stage = 'pdemo'; return sp; }
    // his own: F9 = F5 − F8, built, not counted
    const T = T3('ld3.mine'), s = { id:'ld:mine', kind:'ld:mine', tgt:P + '9', refs:[P + '5', P + '8'], ops:['−'], words:'Total revenue − Total costs', how:'formula', needEnter:true, commute:false, unit:'£', want, done:!!X.c3pmine, built:!!X.c3pmine, recKey:null, no:null,
      wordsOf:ref => /5$/.test(ref) ? 'Total revenue' : 'Total costs', lineBuild:esc(tx('launch.build.line', 0, null, 'Your turn: build it, then press Enter.')), title:T.title, answer:() => { X.c3pmine = S.day || 1; save(); return { ok:true }; } };
    sp.v[P + '9'] = X.c3pmine ? sp.v[P + '9'] : {}; sp.sums = (sp.sums || []).filter(x => !/^ld:/.test(x.id)).concat([s]); sp.act = X.c3pmine ? null : s; sp.just = null; sp.c1.stage = X.c3pmine ? 'done' : 'pmine'; if(!X.c3pmine) sp.doneLine = '';
  }catch(e){ console.error(e); }
  return sp;
};
const c3LdPage0 = ashLaunchPage;
ashLaunchPage = function(st){
  const r = c3LdPage0.apply(this, arguments);
  try{ const sp = ashLive(); if(!on3() || !sp || !sp.c1) return r; const stage = sp.c1.stage, root = screen(), gw = root.querySelector('.ash-gridw'), cell = ref => root.querySelector(`.ash-grid .ash-c[data-ref="${ref}"]`);
    root.querySelectorAll('.ash-grid .ash-c[data-ref^="G"]').forEach(c => c.classList.add('c3-ex'));
    const F = T3('ld3.footer').text, hint = root.querySelector('.actbar .dk-hint, .actbar .ab-hint, .actbar p');
    const PC = (sp.cols.filter(k => k.c !== 'G').slice(-1)[0] || {}).c || 'F';
    if(stage === 'pjob' && gw){ gw.insertAdjacentHTML('beforeend', c3Co(T3('ld3.job'), 'c3LdWatch', '', 'pu c5-under')); const co = gw.querySelector('[data-c3co]'); if(window.__c5 && co) window.__c5.under(co, cell(PC + '9')); else c3PlaceUnder(co, cell(PC + '9'), { dy:12 });
      const ln = root.querySelector('.ash-line'); if(ln && tx('ld3.line', 0)) ln.innerHTML = c1Html(tx('ld3.line', 0));
      root.querySelector('section.ash[data-ash]') && root.querySelector('section.ash[data-ash]').classList.add('c3-hold'); if(hint && F[0]) hint.textContent = F[0];
      on('c3LdWatch', () => { c1Ld().c3pjob = S.day || 1; save(); render(); }); }
    if(stage === 'pdemo' && hint && (F[2] || F[0])) hint.textContent = F[2] || F[0];
    if(stage === 'pmine' && gw && sp.act){ const T = T3('ld3.mine'); const sig = root.querySelector('[data-c1sig]'); if(sig) sig.remove();
      gw.insertAdjacentHTML('beforeend', c1SignalHtml({ kind:'build', title:T.title, task:tx('ld3.mine.task', 0) || 'Calculate the profit', lines:T.text.map(t => c1Html(t)), ptr:'up' })); c1Place(gw.querySelector('[data-c1sig]'), cell(sp.act.tgt), 'below', { dx:0 }); if(hint && F[1]) hint.textContent = F[1];
      const ln = root.querySelector('.ash-line'); if(ln && tx('ld3.mine.line', 0)){ const hl = ln.querySelector('a, button'); ln.innerHTML = c1Html(tx('ld3.mine.line', 0)) + ' '; if(hl) ln.appendChild(hl); } }
    if(stage === 'done' && c1Ld().c3pdemo){ const g9 = cell('G9'); if(g9) g9.classList.add('c3-exdone'); }
  }catch(e){ console.error(e); }
  return r;
};
if(window.__tkSums) window.__tkSums.unshift({ what:'Launch Day profit: Watch', test:() => !!document.getElementById('c3LdWatch'), plan:() => ({ at:'#c3LdWatch', value:'Watch', go:() => document.getElementById('c3LdWatch').click() }) });

/* =====================================================================
   6 · WEEK 1 SUNDAY (S1–S4): nothing starts on arrival; a callout for each method (Watch ▶); the average a day shown by
   Finance on the add-each-day sheet first (p6h's stage avgdemo), then his on the Σ SUM sheet
   ===================================================================== */
window.__c3avg = W => on3() && !!String(WBS().sundayAverageADay || '').trim() && !!(I.c2Wk1 && I.c2Wk1(W));
const coKey = g => g === 'ex1' ? 'add' : g === 'ex2' ? 'sum' : null;
const c3ExRun0 = c1ExampleRun;
c1ExampleRun = function(){
  const W = S.wk, g = I.c2Stage ? I.c2Stage(W) : null;
  if(on3() && g && coKey(g) && !X3().seen['wk1' + coKey(g)] && !(window.__tkRunning && window.__tkRunning())) return;   // waits for Watch ▶
  if(on3() && g === 'avgdemo'){ const sp = ashLive(); if(sp && sp.act && sp.act.c2demo && UI.c3Avg === 'go'){ UI.c3Avg = 'run'; H.demo(sp); } return; }
  return c3ExRun0.apply(this, arguments);
};
const c3ExSpec0 = c1ExampleSpec;
c1ExampleSpec = function(W){
  if(!(on3() && I.c2Stage && I.c2Stage(W) === 'avgdemo')) return c3ExSpec0.apply(this, arguments);
  // his week, with Days flown and Average a day: Finance works B(mean) = Profit this week ÷ Days flown with the pointer
  const h = weekSummary(W), items = weekReviewItems(W, h); items.forEach(it => { it.title = RV2_TITLE[it.id] || it.title; });
  const sp = I.c2RvSpec0(W, items, h); I.c2Narrow(sp); const m = (sp.sums || []).find(s => /:mean$/.test(s.id)), M = items.find(x => x.id === 'mean'), T = items.find(x => x.id === 'tot'), X = c1Ex();
  const tr = sp.rows.find(r => r.t === 'tot'); if(tr && T) sp.v['B' + tr.r] = { t:money(Math.round(rbValue(T))) };
  sp.rows = sp.rows.filter(r => r.t === 'hdr' || r.r <= (m ? ashRef(m.tgt).r : 99));
  const s = { id:'avg:demo:' + weekNo(W.from), kind:'avg:demo', tgt:m.tgt, refs:m.refs, ops:m.ops, words:m.words, how:'formula', needEnter:true, c2demo:true, commute:false, unit:'£', want:rbValue(M), done:false, built:false, recKey:null, no:null,
    wordsOf:m.wordsOf, lineBuild:T3H(tx('wk1.avg.watch', 0)), answer:() => { X.avgDemo = S.day || 1; UI.c3Avg = null; save(); return { ok:true }; } };
  Object.assign(sp, { id:'week:avg:' + weekNo(W.from), sums:[s], act:s, just:null, offer:false, example:true, doneF:null });
  return sp;
};
const c3RvR0 = ashReviewRender;
ashReviewRender = function(st){
  const r = c3RvR0.apply(this, arguments);
  try{ const W = S.wk, g = on3() && I.c2Stage ? I.c2Stage(W) : null; if(!g) return r;
    const root = screen(), k = coKey(g), Y = X3();
    if(k && !Y.seen['wk1' + k]){ const side = root.querySelector(g === 'ex1' ? '.c2-pair .c2-L' : '.c2-pair .c2-R'), gw = side && side.querySelector('.ash-gridw'), cell = ref => side && side.querySelector(`.ash-grid .ash-c[data-ref="${ref}"]`);
      root.querySelectorAll('.c2-paired .rv2-ins > .c1-sig, .c2-paired .rv2-ins [data-c1sig]').forEach(x => x.classList.add('c3-hide'));
      const fb = root.querySelector('.c2-pair .ash-fb .ash-f'); if(fb) fb.innerHTML = ''; const w = root.querySelector('.c2-pair .ash-fb .ash-w'); if(w) w.innerHTML = '';
      root.querySelectorAll('.c2-pair .ash').forEach(a => a.classList.add('c3-hold'));
      const cur = document.getElementById('c1Cursor'); if(cur) cur.style.display = 'none';
      if(gw){ gw.insertAdjacentHTML('beforeend', c3Co(T3('wk1.co.' + k), 'c3WkWatch', '', 'pu')); const el = gw.querySelector('[data-c3co]'), last = [...side.querySelectorAll('.ash-grid .ash-c[data-ref^="B"]')].pop();
        if(el && last){ el.style.position = 'absolute'; el.style.left = '8px'; el.style.top = Math.round(last.getBoundingClientRect().bottom - gw.getBoundingClientRect().top + 12) + 'px';
          gw.style.paddingBottom = Math.round(el.offsetHeight + 24) + 'px'; } }   // inside the example's frame: the sheet grows to hold it
      on('c3WkWatch', () => { Y.seen['wk1' + k] = S.day || 1; save(); render(); }); }
    if(g === 'avgdemo'){ const sig = root.querySelector('.c2-paired .rv2-ins [data-c1sig] .c1-sig-b, .c2-paired .rv2-ins .c1-sig .c1-sig-b');
      if(sig && !UI.c3Avg && !sig.querySelector('#c3AvgWatch')) sig.insertAdjacentHTML('beforeend', `<button class="bv-btn primary" id="c3AvgWatch">Watch &#9654;</button>`);
      if(!UI.c3Avg) root.querySelectorAll('.c2-pair .c2-live .ash').forEach(a => a.classList.add('c3-hold'));
      on('c3AvgWatch', () => { UI.c3Avg = 'go'; render(); }); }
  }catch(e){ console.error(e); }
  return r;
};
if(window.__tkSums){
  window.__tkSums.unshift({ what:'Sunday: Watch', test:() => !!document.getElementById('c3WkWatch'), plan:() => ({ at:'#c3WkWatch', value:'Watch', go:() => document.getElementById('c3WkWatch').click() }) });
  window.__tkSums.unshift({ what:'Sunday: watch the average', test:() => !!document.getElementById('c3AvgWatch'), plan:() => ({ at:'#c3AvgWatch', value:'Watch', go:() => document.getElementById('c3AvgWatch').click() }) });
  window.__tkSums.unshift({ what:"Finance's average", test:() => { const sp = ashLive(); return !!(sp && sp.act && sp.act.kind === 'avg:demo' && UI.c3Avg === 'run'); }, plan:() => ({ at:'.c1-keys', value:'skip the demonstration', go:() => { const sp = ashLive(); UI.c2Demo = null; c1PtrGone(); if(sp && sp.act){ const s = ashSt(sp.id); s.tokens = ashFullTokens(sp.act); s.ready = true; c1Enter(sp); } } }) });
}

/* =====================================================================
   7 · WEEK 2: FINANCE'S QUESTIONS ON THE WHAT-IF SHEET (W1–W5). The pause's step (c1q) draws the what-if sheet when its
   questions are the what-if ones: his fare and £3 more side by side, rows one at a time to a month; Finance first, then him.
   The counted questions keep their keys (pq:whatIfFirst:n, pq:whatIfWeek:n) and their place in the record.
   ===================================================================== */
/* Monday 9 September (whatIfSheetFromDay): the pause's step comes first, before the plan ("Set my fares ▶" then opens it) */
const WI_IDS = ['whatIfFirst', 'whatIfWeek'], wiDay = () => +WBS().whatIfSheetFromDay || 8;
const wiFirst = (st, d) => { if(!on3() || d !== wiDay() || !Array.isArray(st)) return st; const i = st.findIndex(x => x.t === 'c1q'), j = st.findIndex(x => x.t === 'plan');
  if(i < 0 || j < 0 || i < j) return st; const out = st.slice(), q = Object.assign({}, out.splice(i, 1)[0], { c3first:true }); out.splice(j, 0, q); return out; };
const c3DS0 = daySteps; daySteps = function(n){ const st = c3DS0.apply(this, arguments); try{ return wiFirst(st, beatDay(n)); }catch(e){ return st; } };
const c3SF0 = stepsFor; stepsFor = function(b){ const st = c3SF0.apply(this, arguments); try{ return wiFirst(st, beatDay(b)); }catch(e){ return st; } };
const c3Q0 = R.c1q;
R.c1q = st => {
  try{ const Q = window.__c1qx; if(on3() && Q && st){ Q.choose(st);
      if(st.c3first && !st.c3split){ st.c3split = true; const rest = (st.qs || []).filter(q => !WI_IDS.includes(q.id));   // any other question waits for the plan's sums
        if(rest.length && (st.qs || []).some(q => WI_IDS.includes(q.id))){ st.qs = st.qs.filter(q => WI_IDS.includes(q.id)); const j = S.steps.findIndex((x, k) => k > S.si && x.t === 'workings');
          S.steps.splice(j >= 0 ? j + 1 : S.si + 1, 0, { t:'c1q', qs:rest, room:st.room, mine:st.mine }); } save(); }
      const ids = (st.qs || []).map(q => q.id);
      if(ids.includes('whatIfFirst') && ids.every(x => WI_IDS.includes(x))){ c3WiPage(st, Q); return; } } }catch(e){ console.error(e); }
  return c3Q0(st);
};
function c3WiPage(st, Q){
  const q1 = st.qs.find(q => q.id === 'whatIfFirst'), q2 = st.qs.find(q => q.id === 'whatIfWeek'), d = q1.d, r = routeById(d.id), step = +WBS().whatIfQuestionStep || 3;
  st.s = st.s || {}; const qs1 = st.s[q1.id + ':' + q1.day] || (st.s[q1.id + ':' + q1.day] = {}), qs2 = q2 ? (st.s[q2.id + ':' + q2.day] || (st.s[q2.id + ':' + q2.day] = {})) : { ok:true, fin:true };
  const now = c1WiRows({}).rows.find(z => z.id === d.id) || { pax:0, seats:0 }, alt = c1WiRows({ [d.id]:d.f1 }).rows.find(z => z.id === d.id) || { pax:0, seats:0 };
  const t0 = now.pax * d.f0, t1 = alt.pax * d.f1, more = t1 - t0, mw = Math.round((+WBS().whatIfMonthDays || 28) / 7), n = weekNo(S.day || 1);
  // round 3: no Finance demo for ticket revenue (he builds his fare's, then the what-if fare on paper); Finance shows the × 7 and the × 4
  const W3 = st.c3 || (st.c3 = { co:0 }); if(W3.demo && W3.b4 === undefined) W3.b4 = true;
  const stage = !W3.co ? 'co1' : !W3.b4 ? 'b4' : !qs1.ok ? 'q1' : !W3.wk ? 'wk' : !qs2.ok ? 'q2' : !W3.mo ? 'mo' : 'month';
  const CL = T3('wi2.cols').text, RW = T3('wi2.rows', { w:mw }).text, TK = T3('wi2.task').text;
  const cols = [{ c:'B', w:190, top:CL[0] || 'your fare', flag:r.flag, main:`${r.city} ${money(d.f0)}`, plan:true }, { c:'C', w:190, top:CL[1] || 'what if', flag:r.flag, main:`${r.city} ${money(d.f1)}` }, { c:'D', w:180, top:CL[2] || 'what if − yours', main:CL[3] || 'Difference' }];
  const at = k => ['co1', 'b4', 'q1', 'wk', 'q2', 'mo', 'month'].indexOf(stage) >= ['co1', 'b4', 'q1', 'wk', 'q2', 'mo', 'month'].indexOf(k);
  const rows = [{ r:1, t:'hdr' }, { r:2, label:RW[0] || 'Seats filled a day', ic:'person' }, { r:3, label:RW[1] || 'Fare', ic:'tag' }, { r:4, label:RW[2] || 'Ticket revenue a day', ic:'coins', gold:true, t:'tot' }]
    .concat(at('wk') ? [{ r:5, label:RW[3] || 'A week (× 7)', ic:'cal', gold:true }] : []).concat(at('mo') ? [{ r:6, label:RW[4] || `A month (× ${mw} weeks)`, ic:'cal', gold:true, t:'fin', nw:false }] : []);
  const v = { B2:{ t:num(now.pax), f:true, bar:now.seats ? now.pax / now.seats : null, full:now.pax >= now.seats && now.seats > 0 }, C2:{ t:num(alt.pax), f:true, bar:alt.seats ? alt.pax / alt.seats : null, full:alt.pax >= alt.seats && alt.seats > 0 }, D2:{ t:alt.pax - now.pax ? signed(alt.pax - now.pax) : '—' },
    B3:{ t:money(d.f0) }, C3:{ t:money(d.f1) }, D3:{ t:signed(d.f1 - d.f0, true) } };
  if(W3.b4) v.B4 = { t:money(t0) }; if(qs1.ok){ v.C4 = { t:money(t1) }; v.D4 = { t:signed(more, true), f:true, cls:more > 0 ? 'pos' : '' }; }
  if(W3.wk){ v.B5 = { t:money(t0 * 7) }; v.C5 = { t:money(t1 * 7), f:true }; }
  if(qs2.ok && at('mo')) v.D5 = { t:signed(more * 7, true), f:!q2, cls:more > 0 ? 'pos' : '', fin:!!qs2.shown };
  if(W3.mo){ v.B6 = { t:money(t0 * 7 * mw) }; v.C6 = { t:money(t1 * 7 * mw), f:true }; v.D6 = { t:signed(more * 7 * mw, true), f:true, cls:more > 0 ? 'pos' : '' }; }
  const sums = [], wo = ref => !/^[A-Z]\d+$/.test(ref) ? ref : /4$/.test(ref) ? (RW[2] || 'Ticket revenue a day') : /5$/.test(ref) ? (RW[3] || 'A week').replace(/\s*\(.*\)$/, '') : /2$/.test(ref) ? 'Seats filled' : /3$/.test(ref) ? 'Fare' : ref;
  const demo = (id, tgt, ref, k, line, ok) => ({ id:`wi2:${id}:${q1.day}`, kind:'wi2:' + id, tgt, refs:[ref, String(k)], ops:['×'], words:`${wo(ref)} × ${k}`, how:'formula', needEnter:true, c2demo:true, c5demo:true, commute:false, unit:'£', want:0, done:false, built:false, recKey:null, no:null,
    wordsOf:wo, lineBuild:T3H(line), answer:() => { ok(); save(); return { ok:true }; } });
  if(stage === 'b4') sums.push({ id:'wi2:b4:' + q1.day, kind:'wi2:b4', tgt:'B4', refs:['B2', 'B3'], ops:['×'], words:'Seats filled × Fare', how:'formula', needEnter:true, commute:true, unit:'£', want:t0, done:false, built:false, recKey:null, no:null, task:TK[0] || 'Calculate the ticket revenue a day',
    wordsOf:wo, lineBuild:T3H(tx('wi2.line', 0, null, 'Your turn.')), answer:() => { W3.b4 = true; save(); return { ok:true }; } });
  if(stage === 'q1') sums.push(Object.assign(Q.paper(q1, qs1, { title:T3('wi2.q1').title || `What if ${r.city} were ${money(d.f1)}?`, tgt:'C4', refs:['C2', 'C3'], ops:['×'], words:'Seats filled × Fare', want:t1, rel:'ticketRevenue',
    doc:`What if: ${r.city} at ${money(d.f1)}`, question:`${num(alt.pax)} × ${money(d.f1)}`, vals:[alt.pax, d.f1], answerText:money(t1) }), { task:TK[0] || 'Calculate the ticket revenue a day' }));
  if(stage === 'wk') sums.push(demo('x7', 'B5', 'B4', 7, tx('wi2.x7', 0, null, 'Watch: Finance clicks **Ticket revenue a day**, presses **×**, types **7**, then presses **Enter**.'), () => { W3.wk = true; }));
  if(stage === 'q2' && q2) sums.push(Object.assign(Q.paper(q2, qs2, { title:T3('wi2.q2').title || 'A week: the difference', tgt:'D5', refs:['D4', '7'], ops:['×'], words:'Difference a day × 7', want:more * 7, rel:'ticketRevenue',
    doc:`What if, a week: ${r.city} at ${money(d.f1)}`, question:`${money(more)} × 7`, vals:[more, 7], answerText:signed(more * 7, true), hints:[{ t:`A week is 7 days: ${money(more)} × 7.` }] }), { task:TK[1] || 'Calculate the difference over a week' }));
  if(stage === 'q2' && !q2){ qs2.ok = true; }
  if(stage === 'mo') sums.push(demo('x4', 'B6', 'B5', mw, tx('wi2.x4', 0, { w:mw }, `Watch: Finance clicks **A week**, presses **×**, types **${mw}**, then presses **Enter**.`), () => { W3.mo = true; }));
  const act = sums[0] || null, goW = (stage === 'wk' || stage === 'mo') && !W3['go' + stage];
  const tabs = ashTabs(null).filter(t => t.id !== 'c2ba' && t.id !== 'whatif'); tabs.forEach(t => { t.on = false; }); tabs.splice(Math.max(0, tabs.findIndex(t => t.id === 'week')) + 1, 0, { id:'wi', label:'What if', ic:'tag', on:true, off:false });
  const TT = T3('wi2.title', { n, date:dLong(S.day || 1) }), sp = { id:'wi2:' + q1.day, crumb:`${S.airline.name || 'Airline'} HQ · ${TT.text[0] || `Plan week ${n}`}`, title:TT.title || 'What if you change a fare?', tabs, lw:300, cols, rows, v, sums, act, just:null, doneF:null, doneLine:'' };
  const F = T3('wi2.footer', { n }), done = stage === 'month';
  screen().innerHTML = shell(`<div class="dp ash-page c3-wi">${ashHtml(sp)}</div>`, deskBar(F.text[done ? 1 : 0] || '', `<button class="bv-btn ${done ? 'go' : ''} big" id="nx" ${done ? '' : 'disabled'}>${bt(F.button || 'Set my fares')} &#9654;</button>`));
  ashBind(sp);
  const root = screen(), gw = root.querySelector('.ash-gridw'), cell = ref => root.querySelector(`.ash-grid .ash-c[data-ref="${ref}"]`); if(!gw) return;
  root.querySelectorAll('[data-ashtab]').forEach(b => b.onclick = () => { if(b.getAttribute('aria-disabled') === 'true') return; });   // the other sheets are read after Set my fares
  const ln = root.querySelector('.ash-line');
  if(stage === 'co1'){ const a0 = root.querySelector('section.ash[data-ash]'); if(a0) a0.classList.add('c3-hold'); if(ln) ln.innerHTML = '';
    gw.insertAdjacentHTML('beforeend', c3Co(T3('wi2.co1', { city:r.city, step, seats:num(alt.pax), fare:money(d.f1) }), 'c3WiGot', '', 'pu')); const co = gw.querySelector('[data-c3co]'); if(window.__c5) window.__c5.under(co, cell('C3')); else c3PlaceUnder(co, cell('C3'));
    on('c3WiGot', () => { W3.co = 1; save(); render(); }); }
  root.querySelectorAll('[data-c1sig]').forEach(x => x.remove());
  if(act && (stage === 'b4' || stage === 'q1' || stage === 'q2')){
    gw.insertAdjacentHTML('beforeend', act.how === 'book' ? c1SignalHtml({ kind:'paper', title:act.title, task:act.task, lines:c1PaperLines(act.no, act.tgt), ptr:'up' }) : c1SignalHtml({ kind:'build', task:act.task, ptr:'up', lines:[] }));
    c1Place(gw.querySelector('[data-c1sig]'), cell(act.tgt), 'below', { dx:0 }); }
  // Finance shows the × 7 (and the × 4): nothing moves until Watch ▶, in the line under the sheet
  if(act && act.c5demo){ const a0 = root.querySelector('section.ash[data-ash]');
    if(goW){ if(a0) a0.classList.add('c3-hold'); if(ln){ ln.innerHTML = `${T3H(tx(stage === 'wk' ? 'wi2.x7.go' : 'wi2.x4.go', 0, null, stage === 'wk' ? 'Finance shows you a week.' : 'Finance shows you a month.'))} `; ln.insertAdjacentHTML('beforeend', `<button class="bv-btn primary c5-gbtn" id="c5WiWatch">Watch &#9654;</button>`); }
      on('c5WiWatch', () => { W3['go' + stage] = true; save(); render(); }); }
    else { if(a0) a0.classList.add('c1-demo'); c5WiDemo(sp); } }
  if(stage === 'month'){ const d6 = cell('D6'); if(d6) d6.classList.add('c1-glow');
    if(!W3.got){ const T = T3('wi2.co4', { step, month:money(Math.abs(more * 7 * mw)), d:money(more), w:money(more * 7), m:money(more * 7 * mw) });
      gw.insertAdjacentHTML('beforeend', c3Co(Object.assign({}, T, { button:'Got it' }), 'c3WiTry', '', 'pu')); const co = gw.querySelector('[data-c3co]'); if(window.__c5) window.__c5.under(co, cell('D6')); else c3PlaceUnder(co, cell('D6')); }
    on('c3WiTry', () => { W3.got = 1; save(); render(); }); }
  on('nx', () => { if(!done) return; UI.ashJust = null; resetEntry(); UI.justDone = null; next(); });
}
/* Finance's × 7 and × 4: the pointer clicks the row, the × key (it lights), types the number into the formula bar, then Enter */
function c5WiDemo(sp){
  const a = sp.act; if(!a || UI.c5WiDemo === a.id) return; UI.c5WiDemo = a.id;
  const steps = [{ ref:a.refs[0] }, { op:a.ops[0] }, { num:a.refs[1] }, { enter:true }]; let i = 0;
  const live = () => { const s2 = ashLive(); return s2 && s2.act && s2.act.id === a.id ? s2 : null; };
  const finish = s2 => { const st = ashSt(s2.id); st.tokens = ashFullTokens(s2.act); st.ready = true; UI.c5WiDemo = null; c1Enter(s2); };
  if(settings.reduceMotion || (window.__tkRunning && window.__tkRunning())){ const s2 = live(); if(s2) finish(s2); return; }
  const tick = () => { const s2 = live(); if(!s2){ UI.c5WiDemo = null; c1PtrGone(); return; } const s = steps[i], root = document.querySelector(`[data-ash="${CSS.escape(s2.id)}"]`); if(!s || !root){ UI.c5WiDemo = null; c1PtrGone(); return; }
    const el = s.ref ? root.querySelector(`.ash-c[data-ref="${s.ref}"]`) : s.op ? root.querySelector(`[data-ashop="${s.op}"]`) : s.num ? root.querySelector('.ash-fb .ash-f, .ash-fb') : root.querySelector('.c1-keys [data-c1kenter], .c1-fbenter, [data-ashenter]');
    if(!el){ setTimeout(tick, 200); return; }
    c1PtrTo(el, () => { const s3 = live(); if(!s3){ UI.c5WiDemo = null; c1PtrGone(); return; } i++;
      if(s.ref) ashPick(s3, s.ref); else if(s.op){ c1KeyFlash(s.op); ashOp(s3, s.op); } else if(s.num){ const st = ashSt(s3.id); st.tokens.push({ ref:s.num }); render(); }
      else { c1KeyFlash('enter'); setTimeout(c1PtrGone, 400); finish(s3); return; }
      setTimeout(tick, settings.reduceMotion ? 350 : c1Pace().gap); }); };
  setTimeout(tick, settings.reduceMotion ? 300 : c1Pace().pause);
}
if(window.__tkSums){
  window.__tkSums.unshift({ what:'what if: Got it', test:() => !!document.getElementById('c3WiGot'), plan:() => ({ at:'#c3WiGot', value:'Got it', go:() => document.getElementById('c3WiGot').click() }) });
  window.__tkSums.unshift({ what:'what if: Watch', test:() => !!document.getElementById('c5WiWatch'), plan:() => ({ at:'#c5WiWatch', value:'Watch', go:() => document.getElementById('c5WiWatch').click() }) });
  window.__tkSums.unshift({ what:'what if: the month', test:() => !!document.getElementById('c3WiTry'), plan:() => ({ at:'#c3WiTry', value:'Got it', go:() => document.getElementById('c3WiTry').click() }) });
  window.__tkSums.unshift({ what:"Finance's × 7 / × 4", test:() => { const sp = ashLive(); return !!(sp && sp.act && sp.act.c5demo); }, plan:() => ({ at:'.ash-fb', value:'skip the demonstration', go:() => { const sp = ashLive(); UI.c5WiDemo = null; c1PtrGone(); if(sp && sp.act){ const s = ashSt(sp.id); s.tokens = ashFullTokens(sp.act); s.ready = true; c1Enter(sp); } } }) });
}

/* =====================================================================
   8 · HOME IN WEEKS 2 TO 5: the NOW strip says the plan flies again (Bertie: "I could have sworn I've flown two weeks")
   ===================================================================== */
function c3NowStrip(){
  const d = S.day || 1, wk = weekNo(d); if(!(on3() && wk >= 2 && d < c1WeeklyFrom())) return;
  const el = [...document.querySelectorAll('.cu .cu-i.now span')].pop(), t = tx('home.now.week', 0, { n:wk }); if(!el || !t) return;
  if(/^Running /.test(el.textContent)) el.textContent = el.textContent.replace(/^Running [^·]*·/, t + ' ·');
}


/* =====================================================================
   9 · BERTIE'S PLAY NOTES, 1 NOV 2026, 10:49 (design-and-flow round 2). Chapter one only.
     - the new plan is worked out before it can be chosen: Work out my plan ▶ in the footer; Choose ▶ on the new plan and its
       profit wait until then ("I'm worried that it's already working stuff out before we've actually done it");
     - the first change of week 1 (or one with a new route) is worked out on the whole-plan sheet, Launch Day's sums again with
       no demonstrations, yesterday's plan beside it and the difference in profit on paper; then Before / after; then Choose.
       Later changes keep the Changes sheet (Settings newPlanSheet);
     - every build signal says only "Build the formula, then press Enter." (ScreenText signal.build); callouts kept inside
       their panel; the take-off can be skipped; no Working space or Return to HQ on the wall; the wall's Day complete is
       skipped (the Day page is the one review screen) and Launch Day's Day page has a guided tour (Settings dayPageTour).
   ===================================================================== */
function npWorked(){ try{ const w = X3().worked || {}; return step().t === 'plan' && w[tpKey()] === planKey(normPlan(currentPlan())); }catch(e){ return false; } }
function npMode(){
  if(!on3() || !tpDay()) return false; const rule = String(WBS().newPlanSheet || ''); if(/off|never|no\b/i.test(rule)) return false;
  const Y = X3(), first = !Object.keys(Y.npDone || {}).length, old = tpOld(), cur = normPlan(currentPlan());
  const fresh = !!old && cur.fleet.some(x => x.sched.some(id => !old.fleet.some(y => y.sched.includes(id))));
  return first || fresh;
}
function c3Work(){
  if(npMode()){ UI.c3np = { day:S.day, pk:planKey(normPlan(currentPlan())) }; UI.c3ba = null; UI.ashTab = null; UI.c3tp = null; save(); next(); return; }
  c3ChooseNew();
}
function c3FlyNew(){
  const X = I.c2X(), Y = X3(); X.kept[X.chgEve || S.day] = true; (Y.npDone = Y.npDone || {})[S.day] = true;
  UI.c3tp = null; UI.c3ba = null; UI.c3np = null; if(S.steps[S.si + 1] && S.steps[S.si + 1].t === 'workings') S.steps.splice(S.si + 1, 1);
  if(S.rnd){ delete S.rnd.planWas; S.rnd.ashChg = {}; } save(); next();
}
/* from Before / after (after the sheet): back to the two plans, the new plan now worked out */
function npChoose(){ const Y = X3(), pk = UI.c3np && UI.c3np.pk; (Y.worked = Y.worked || {})[`${S.day}|${S.si - 1}`] = pk; UI.c3ba = null; UI.ashTab = null; save(); c3BackToPlans(); }
/* the whole-plan sheet: a column for each route of the new plan, the new plan's totals, yesterday's plan as it flew, the difference */
function c3NpPage(){
  const old = tpOld(), pl = normPlan(currentPlan()), B = c3Groups(pl), A = c3Groups(old), Q = window.__c1qx;
  const Z = X3().np || (X3().np = {}), key = S.day + '|' + UI.c3np.pk, st = Z[key] || (Z[key] = { tk:{}, rev:false, prof:false, diff:{} });
  const CL = T3('np.cols').text, RW = T3('np.rows').text, Lt = i => ASH_LET[1 + i], F = c3Flights(pl);
  const G = B.groups.map((g, i) => { const c = Lt(i), r = routeById(g.id), seats = F.filter(f => f.route === g.id).reduce((t, f) => t + (f.seats || 0), 0); return { g, c, r, fare:g.fare, pax:g.pax, tk:g.pax * g.fare, seats }; });
  const P = Lt(G.length), Yc = Lt(G.length + 1), D = Lt(G.length + 2);
  const fuel = Math.round(F.reduce((t, f) => t + (f.fuelCost || 0), 0)), cost = Math.round(B.L ? B.L.v.cost : 0), rev = G.reduce((t, x) => t + x.tk, 0), prof = rev - cost;
  const eve = I.c2X().chgEve || (S.day - 1), hd = (S.history || []).slice().reverse().find(h => h.from === eve && h.to === eve) || null;
  const yRev = Math.round(hd ? hd.revenue : (A.L ? A.L.v.rev : 0)), yCost = Math.round(hd ? hd.costs : (A.L ? A.L.v.cost : 0)), yFuel = Math.round(c3Flights(old).reduce((t, f) => t + (f.fuelCost || 0), 0)), yProf = yRev - yCost, diff = prof - yProf;
  const nm = P0 => P0.groups.map(g => `${routeById(g.id).city}${g.n > 1 ? ` ×${g.n}` : ''}`).join(' + ');
  const cols = G.map(x => ({ c:x.c, w:132, top:x.g.n === 1 ? (CL[5] || 'your flight') : `${CL[6] || 'your'} ${x.g.n} flights`, flag:x.r.flag, main:`${x.r.city} ${money(x.fare)}`, plan:true }))
    .concat([{ c:P, w:150, top:B.groups.map(g => routeById(g.id).city).join(' + ') || CL[0] || 'your new plan', main:CL[1] || 'New plan' }, { c:Yc, w:150, top:nm(A), main:CL[2] || "Yesterday's plan" }, { c:D, w:132, top:CL[3] || "new − yesterday's", main:CL[4] || 'Difference' }]);
  const rows = [{ r:1, t:'hdr' }, { r:2, label:RW[0] || 'Passengers', ic:'person' }, { r:3, label:RW[1] || 'Fare', ic:'tag' }, { r:4, label:RW[2] || 'Ticket revenue', ic:'coins', gold:true }, { r:5, label:RW[3] || 'Total revenue', ic:'coins', t:'tot', gold:true },
    { r:6, label:RW[4] || 'Other costs', ic:'receipt' }, { r:7, label:RW[5] || 'Fuel burned', ic:'drum' }, { r:8, label:RW[6] || 'Total costs', ic:'receipt', t:'tot', gold:true }, { r:9, label:RW[7] || 'Profit', ic:'chart', t:'fin', gold:true }];
  if(G.length === 1) st.rev = true;   // one route: its ticket revenue is the total
  const v = {};
  st.tkp = st.tkp || {}; const tkDone = x => !!st.tk[x.c] || !!(st.tkp[x.c] && st.tkp[x.c].ok);
  G.forEach(x => { v[x.c + 2] = { t:num(x.pax), bar:x.seats ? x.pax / x.seats : null, full:x.seats > 0 && x.pax >= x.seats }; v[x.c + 3] = { t:money(x.fare) }; if(tkDone(x)) v[x.c + 4] = { t:money(x.tk) }; });
  if(st.rev) v[P + 5] = { t:money(rev), f:G.length === 1 }; v[P + 6] = { t:money(cost - fuel), f:true }; v[P + 7] = { t:money(fuel), f:true }; v[P + 8] = { t:money(cost), f:true };
  if(st.prof) v[P + 9] = { t:money(prof), cls:prof < 0 ? 'soft' : 'gold' };
  v[Yc + 5] = { t:money(yRev), f:true }; v[Yc + 6] = { t:money(yCost - yFuel), f:true }; v[Yc + 7] = { t:money(yFuel), f:true }; v[Yc + 8] = { t:money(yCost), f:true }; v[Yc + 9] = { t:money(yProf), f:true };
  if(st.diff.ok) v[D + 9] = { t:signed(diff, true), cls:diff >= 0 ? 'pos' : 'amb', fin:!!st.diff.shown };
  const W = { 2:RW[0], 3:RW[1], 4:RW[2], 5:RW[3], 8:RW[6], 9:RW[7] }, wordsOf = ref => { const R0 = ashRef(ref); return (R0.c === Yc ? (CL[2] || "Yesterday's plan") + ': ' : '') + (W[R0.r] || ref); };
  const NL = T3('np.line', { d:money(Math.abs(diff)), more:diff >= 0 ? 'more' : 'less' }).text;
  const TK = T3('np.task').text;   // the tasks under "Build the formula" (round 3, rule 2)
  const build = (id, tgt, refs, ops, words, want, done, ok, task) => ({ id:'np:' + id, kind:'np:' + id, tgt, refs, ops, words, how:'formula', needEnter:true, commute:ops.every(o => o !== '−'), unit:'£', want, done, built:done, recKey:null, no:null, task,
    wordsOf, lineBuild:T3H(NL[0] || ''), answer:() => { ok(); save(); return { ok:true }; } });
  const sums = [];
  // round 3: the first route's ticket revenue built, the second's on paper (counted; Bertie: "the second ticket revenue … work it out on paper"), any more built
  G.forEach((x, i) => { if(i === 1 && Q && Q.paper){ const qs = st.tkp[x.c] || (st.tkp[x.c] = {});
      sums.push(Q.paper({ id:'npTk', day:S.day }, qs, { title:T3('np.tk2').title || 'The ticket revenue', tgt:x.c + 4, refs:[x.c + 2, x.c + 3], ops:['×'], words:'Passengers × Fare', want:x.tk, rel:'ticketRevenue',
        doc:`${x.r.city} in the new plan`, question:`${num(x.pax)} × ${money(x.fare)}`, vals:[x.pax, x.fare], answerText:money(x.tk) })); return; }
    sums.push(build('tk' + x.c, x.c + 4, [x.c + 2, x.c + 3], ['×'], 'Passengers × Fare', x.tk, !!st.tk[x.c], () => { st.tk[x.c] = true; }, TK[0] || 'Calculate the ticket revenue')); });
  if(G.length > 1) sums.push(build('rev', P + 5, G.map(x => x.c + 4), G.slice(1).map(() => '+'), (RW[2] || 'Ticket revenue') + ' + …', rev, !!st.rev, () => { st.rev = true; }, TK[1] || 'Calculate the total revenue'));
  sums.push(build('prof', P + 9, [P + 5, P + 8], ['−'], 'Total revenue − Total costs', prof, !!st.prof, () => { st.prof = true; }, TK[2] || 'Calculate the profit'));
  if(Q && Q.paper) sums.push(Q.paper({ id:'npDiff', day:S.day }, st.diff, { title:T3('np.diff').title || 'The difference in profit', tgt:D + 9, refs:[P + 9, Yc + 9], ops:['−'], words:"New plan − Yesterday's plan", want:diff, rel:'profit',
    doc:'The new plan against yesterday', question:`${money(prof)} − ${money(yProf)}`, vals:[prof, yProf], answerText:signed(diff, true) }));
  else st.diff.ok = true;
  const act = sums.find(x => !x.done) || null, done = !act, day = npDayName(), TT = T3('np.title', { day });
  const tabs = ashTabs(null).filter(t => !['c2ba', 'whatif', 'changes'].includes(t.id)); tabs.forEach(t => { t.on = false; }); const wi = Math.max(0, tabs.findIndex(t => t.id === 'week')) + 1;
  tabs.splice(wi, 0, { id:'np', label:CL[1] || 'New plan', ic:'scale', on:true, off:false }, { id:'c2ba', label:I.C2 ? (I.C2('plan2.tab').text[0] || 'Before / after') : 'Before / after', ic:'chart', on:false, off:!done });
  const sp = { id:'np:' + S.day, crumb:`${S.airline.name || 'Airline'} HQ · ${TT.text[0] || 'Plan tomorrow'}`, title:TT.title || 'Work out your new plan', tabs, lw:230, cols, rows, v, sums, act, just:null, doneF:null,
    doneLine:done ? T3H(String(NL[1] || '').replace(/^\s*✓\s*/, '')) : '' };
  const FT = T3('np.footer', { day });
  screen().innerHTML = shell(`<div class="dp ash-page c4-np">${ashHtml(sp)}</div>`, deskBar(esc(FT.text[done ? 1 : 0] || FT.text[0] || ''), `<button class="bv-btn big" id="c3NpBack">&#9664; Back</button><button class="bv-btn ${done ? 'go' : ''} big" id="c3NpGo" ${done ? '' : 'disabled'}>${bt(FT.button || 'Before / after')} &#9654;</button>`));
  ashBind(sp);
  const root = screen(), gw = root.querySelector('.ash-gridw'), cell = ref => root.querySelector(`.ash-grid .ash-c[data-ref="${ref}"]`);
  if(done){ const ln = root.querySelector('.ash-line'); if(ln) ln.innerHTML = `<span class="pos">✓</span> ${sp.doneLine}`; }
  if(gw && act){ root.querySelectorAll('[data-c1sig]').forEach(x => x.remove());
    gw.insertAdjacentHTML('beforeend', act.how === 'book' ? c1SignalHtml({ kind:'paper', title:act.title, lines:c1PaperLines(act.no, act.tgt), ptr:'up' }) : c1SignalHtml({ kind:'build', task:act.task, ptr:'up', lines:[] }));
    c1Place(gw.querySelector('[data-c1sig]'), cell(act.tgt), 'below', { dx:0 }); }
  root.querySelectorAll('[data-ashtab]').forEach(b => b.onclick = () => { if(b.getAttribute('data-ashtab') === 'c2ba' && done){ UI.c3ba = { key:tpKey(), co:1, np:true }; UI.ashTab = 'c2ba'; save(); render(); } });
  on('c3NpBack', () => c3BackToPlans());
  on('c3NpGo', () => { if(!done) return; UI.c3ba = { key:tpKey(), co:1, np:true }; UI.ashTab = 'c2ba'; save(); render(); });
}
/* the build signal: one line (Bertie: "build the formula and then press enter, and remove the other words") */
const c4Sig0 = c1SignalHtml;
c1SignalHtml = function(o){
  try{ if(on3() && o && o.kind === 'build'){ o = Object.assign({}, o, { nothing:false });
      if(!o.tag && !/Σ|drag|Let go/i.test((o.lines || []).join(' ') + ' ' + (o.title || ''))) o = Object.assign(o, { title:'', lines:[c1Html(tx('signal.build', 0, null, 'Build the formula, then press [Enter].'))] }); } }catch(e){}
  return c4Sig0.call(this, o);
};
/* a callout or signal that would run past its panel or the footer moves up inside it */
function c4Clamp(){
  const scr = screen(); if(!scr) return; const foot = scr.querySelector('.actbar'), fy = foot ? foot.getBoundingClientRect().top : innerHeight;
  scr.querySelectorAll('[data-c3co], [data-c1sig], .ash-co.c1-sco').forEach(el => { const cs = getComputedStyle(el); if(cs.position !== 'absolute' || el.classList.contains('c4-tourco') || el.classList.contains('c5-sig') || el.classList.contains('c5-none')) return;
    const r = el.getBoundingClientRect(), box = el.closest('section.ash, .dp, .c1-tt'), lim = Math.min(fy, box ? box.getBoundingClientRect().bottom : fy) - 8, over = r.bottom - lim;
    if(over > 0 && r.height < lim - 60) el.style.top = Math.round((parseFloat(cs.top) || 0) - over) + 'px'; });
}
/* the take-off: Skip on the take-off screen and on the wall; the wall without Working space and Return to HQ */
function c4Wall(){
  document.body.classList.toggle('c4', !!on3()); if(!on3() || IS_DISPLAY) return;
  const t = step() && step().t, run = t === 'takeoff' && S.rnd && S.rnd.takeoff && !S.rnd.takeoffDone, box = document.querySelector('.w-btns'), lab = bt(T3('takeoff.skip').button || 'Skip take-off');
  const skip = () => { try{ if(typeof wallView !== 'undefined' && wallView) setWallView(false); }catch(e){} if(S.rnd){ delete S.rnd.takeoff; S.rnd.takeoffDone = true; } save(); next(); };
  let b = document.getElementById('c4SkipTk'); if(run && box && !b){ box.insertAdjacentHTML('afterbegin', `<button class="btn primary" id="c4SkipTk">${lab} &#9654;</button>`); b = document.getElementById('c4SkipTk'); b.onclick = skip; }
  if(!run && b) b.remove();
  if(t === 'takeoff' && !S.rnd.takeoffDone){ const go = screen().querySelector('#toGo'); if(go && !screen().querySelector('#c4TkSkip')){ go.insertAdjacentHTML('beforebegin', `<button class="btn big" id="c4TkSkip">${lab} &#9654;</button>`); on('c4TkSkip', skip); } }
}
/* the Day page is the one review screen: the wall closes when it is drawn; Launch Day's has a tour, one part at a time */
if(H.dayPage){ const dp4 = H.dayPage;
  H.dayPage = o => { try{ if(on3() && !IS_DISPLAY && typeof wallView !== 'undefined' && wallView) setWallView(false); }catch(e){} dp4(o); try{ c4Tour(o.d); }catch(e){ console.error(e); } }; }
function c4Tour(d){
  const rule = String(WBS().dayPageTour || 'Launch Day'); document.querySelectorAll('.c4-shade, .c4-hole, .c4-tourco').forEach(x => x.remove());
  if(!on3() || /off|never|no\b/i.test(rule) || d !== 1 || X3().seen.dayTour || UI.c3back) return;
  const scr = screen(), k = UI.c4tour || 0;
  // round 3: first the whole page, undimmed, with one small quiet callout at the top right ("Review the day", Start ▸)
  if(!k){ document.body.insertAdjacentHTML('beforeend', c3Co(T3('day.tour.0'), 'c4TourNext', '', 'c4-tourco c4-start c5-row'));
    const co = document.querySelector('.c4-tourco'), ref = scr.querySelector('.c2-rt') || scr.querySelector('.dp, .desk-page') || scr, R = ref.getBoundingClientRect();
    co.style.position = 'fixed'; co.style.left = Math.round(Math.max(8, R.right - co.offsetWidth)) + 'px'; co.style.top = Math.round(Math.max(8, R.top - co.offsetHeight - 10)) + 'px';
    on('c4TourNext', () => { document.querySelectorAll('.c4-tourco').forEach(x => x.remove()); UI.c4tour = 1; render(); }); return; }
  const i = k - 1, fra = scr.querySelector('.c3-fra'), el = [scr.querySelector('.c2-prof'), scr.querySelector('.c2-rt'), fra || scr.querySelector('.c2-read'), scr.querySelector('.actbar')][i];
  if(!el){ X3().seen.dayTour = S.day || 1; UI.c4tour = 0; return; }
  let T = T3('day.tour.' + (i + 1));
  if(i === 2 && fra){ const city = (fra.querySelector('h2, h3, .c3-frat, b') || {}).textContent || ''; const m = /^(.+?) opens/.exec(city.trim()); if(m && T.text[0]) T = Object.assign({}, T, { title:T.text[0].replace('{city}', m[1]) }); }
  T = Object.assign({}, T, { text:[] });
  document.body.insertAdjacentHTML('beforeend', '<div class="c4-shade" aria-hidden="true"></div><div class="c4-hole" aria-hidden="true"></div>' + c3Co(T, 'c4TourNext', `${i + 1} of 4`, 'c4-tourco pu c5-row'));
  const co = document.querySelector('.c4-tourco'), R0 = el.getBoundingClientRect(), below = R0.bottom + 14 + co.offsetHeight < innerHeight - 8;
  co.style.position = 'fixed'; co.style.top = Math.round(below ? R0.bottom + 14 : R0.top - co.offsetHeight - 14) + 'px';
  const lft = i === 3 ? R0.right - co.offsetWidth - 8 : i === 2 ? R0.left + R0.width / 2 : R0.left; co.style.left = Math.round(Math.min(Math.max(8, lft), innerWidth - co.offsetWidth - 8)) + 'px';
  const ptr = co.querySelector('.c1-sco-ptr'); if(ptr && i === 3) ptr.style.left = Math.round(co.offsetWidth - 60) + 'px';
  if(!below) co.classList.add('c4-up');
  const hole = document.querySelector('.c4-hole'); Object.assign(hole.style, { top: R0.top + 'px', left: R0.left + 'px', width: R0.width + 'px', height: R0.height + 'px' });
  on('c4TourNext', () => { document.querySelectorAll('.c4-shade, .c4-hole, .c4-tourco').forEach(x => x.remove()); if(i >= 3){ X3().seen.dayTour = S.day || 1; UI.c4tour = 0; save(); } else UI.c4tour = k + 1; render(); });
}
const c4Render0 = render;
render = function(){ const r = c4Render0.apply(this, arguments); try{ if(on3()){ c4Wall(); c4Clamp(); requestAnimationFrame(() => { try{ c4Clamp(); }catch(e){} }); } if(!(step() && step().t === 'results') && !(S.wk && S.wk.dayDone === S.day && step().t === 'weekRun')) document.querySelectorAll('.c4-shade, .c4-hole, .c4-tourco').forEach(x => x.remove()); }catch(e){ console.error(e); } return r; };
const tkPre4 = window.__tkPre;
window.__tkPre = R => { try{ const b = document.getElementById('c4TourNext'); if(b){ b.click(); return 'Day page tour: next'; } const k = document.getElementById('c4SkipTk') || document.getElementById('c4TkSkip'); if(k && R && R.skipTakeoff){ k.click(); return 'skipped the take-off'; } }catch(e){} return tkPre4 ? tkPre4(R) : null; };

/* =====================================================================
   10 · ROUND 3, WEEK 1 SUNDAY (hand-off "fewer words", section 6): titles only; the pointer shows in every demo; a right answer
   turns green, then a green button moves him on: My turn ▶ (after Finance's add each day), An easier method ▶ (after his week),
   Now calculate the average ▶ (after his Σ SUM); the box at his average cell says "Now it's your turn".
   ===================================================================== */
const c5Line = (side, html, btn) => { const ln = side && side.querySelector('.ash-line'); if(!ln) return null; ln.classList.remove('q'); ln.innerHTML = html; if(btn){ ln.appendChild(btn); } ln.classList.add('c5-lnb'); return ln; };
const c5Btn = (id, label) => { const b = document.createElement('button'); b.className = 'bv-btn go c5-gbtn'; b.id = id; b.innerHTML = `${esc(bt(label))} &#9654;`; return b; };
const c5RvR0 = ashReviewRender;
ashReviewRender = function(st){
  const r = c5RvR0.apply(this, arguments);
  try{ const W = S.wk, g = on3() && I.c2Stage ? I.c2Stage(W) : null; if(!g) return r;
    const root = screen(), Y = X3(), L = root.querySelector('.c2-pair .c2-L'), Rt = root.querySelector('.c2-pair .c2-R'), live = root.querySelector('.c2-pair .c2-live'), cur = document.getElementById('c1Cursor');
    if(cur && !root.querySelector('[data-c3co]')) cur.style.display = '';   // the pointer shows again once Watch ▶ is pressed (it was hidden under the callout)
    // Finance's example done: "✓ Mon to Wed: £3,700" and My turn ▶ in the line under the example
    const my = document.getElementById('c1MyTurn'); if(my && live && (g === 'ex1' || g === 'ex2')){ const tot = [...live.querySelectorAll('.ash-c[data-ref^="B"]')].pop();
      my.className = 'bv-btn go c5-gbtn'; c5Line(live, T3H((t => tx('wk1.add.lineDone', 0, { total:t }, `✓ Mon to Wed: **${t}**`))(tot ? tot.textContent.trim() : '')) + ' ', my); }
    // his week added up: An easier method ▶ before the Σ SUM example appears
    if(g === 'ex2' && !Y.seen.easier){ const mine = L; if(mine) mine.classList.remove('c2-dim');
      const tot = mine && mine.querySelector('.c2-okg, .c5-ok'), N = I.C2 ? I.C2('wk1.next') : { title:'Next: a quicker way', text:[] };
      if(live){ live.innerHTML = `<div class="c2-nextb"><b>${esc(N.title || 'Next: a quicker way')}</b><span>${esc(N.text[0] || '')}</span></div>`; live.classList.add('c2-next'); }
      const b = c5Btn('c5Easier', tx('wk1.easier', 0, null, 'An easier method ▶')); c5Line(mine, T3H((t => tx('wk1.add.total', 0, { total:t }, `✓ Right: **${t}**`))(tot ? tot.textContent.trim() : '')) + ' ', b);
      if(tot) tot.classList.add('c5-ok'); root.querySelectorAll('[data-c3co]').forEach(x => x.remove());
      on('c5Easier', () => { Y.seen.easier = S.day || 1; save(); render(); }); }
    // his Σ SUM done: the same answer, then Now calculate the average ▶ (it starts Finance's average on the left)
    if(g === 'avgdemo' && !UI.c3Avg && Rt){ const tot = Rt.querySelector('.c2-okg') || [...Rt.querySelectorAll('.ash-c[data-ref^="B"]')].pop(); if(tot) tot.classList.add('c5-ok');
      const b = c5Btn('c3AvgWatch', tx('wk1.avg.go', 0, null, 'Now calculate the average ▶')); c5Line(Rt, T3H((t => tx('wk1.sum.same2', 0, { total:t }, `✓ Same answer: **${t}**`))(tot ? tot.textContent.trim() : '')) + ' ', b);
      Rt.classList.remove('c2-dim'); root.querySelectorAll('.c2-paired .rv2-ins #c3AvgWatch').forEach(x => x !== b && x.remove()); on('c3AvgWatch', () => { UI.c3Avg = 'go'; render(); }); }
    // his average: Finance's on the left, in words
    if(g === 'mean' && L && c1Ex().avgDemo){ const v = [...L.querySelectorAll('.ash-c[data-ref^="B"]')].pop(); if(v){ v.classList.add('c5-ok'); c5Line(L, T3H(tx('wk1.avg.fin', 0, { mean:v.textContent.trim() }, `✓ Finance: average a day **${v.textContent.trim()}**`))); } }
    // the column the signals used to sit in goes when it is empty
    const ins = root.querySelector('.c2-paired .rv2-ins'); if(ins && ![...ins.children].some(c => !c.hidden && c.offsetHeight > 0)) ins.style.display = 'none';
  }catch(e){ console.error(e); }
  return r;
};
if(window.__tkSums) window.__tkSums.unshift({ what:'Sunday: an easier method', test:() => !!document.getElementById('c5Easier'), plan:() => ({ at:'#c5Easier', value:'An easier method', go:() => document.getElementById('c5Easier').click() }) });
window.__c3 = { tpOn, groups:c3Groups, x:X3, pct:c3FraPct, npMode, npWorked };
}
