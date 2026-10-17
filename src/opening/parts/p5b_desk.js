
/* ==================================================================
   THE DESK, EASIER TO MOVE ROUND (D96, Fable's screens brief, 17 Oct 2026)
   - The Operations Wall has a named button on the desk bar (it was an icon nobody would guess).
   - Home, the Operating Plan and the Wall are three views: Ctrl + → and Ctrl + ← move between them (Cmd on a Mac). The key
     hint shows in small type under each view's name the first few times, then only on hover. Esc closes a panel; Enter
     checks a sum. (Settings keyboardShortcuts.)
   - Compare with last week (Settings compareLastWeek): last week's flights as faint ghosts behind this week's on the
     timetable, the summary's figures as before → now, a short list of what changed in words, and what each kept change was
     worth in plain words (D88's line, as a result rather than a bare equation).
   - What's in this: the cost breakdown is a quiet list, one line per item, the total ruled off, each line with its ƒ.
   ================================================================== */
{
const kbOn = () => WBS().keyboardShortcuts !== false;
const kbMac = /Mac|iPhone|iPad/.test(navigator.platform || '');
const kbKey = kbMac ? '⌘' : 'Ctrl';
/* the hints: the first few sessions, until the pupil has used the keys three times; after that on hover */
const kbSess = (() => { try{ const n = (+localStorage.getItem('airline-kb-sessions') || 0) + 1; localStorage.setItem('airline-kb-sessions', n); return n; }catch(e){ return 1; } })();
const kbUsed = () => { try{ return +localStorage.getItem('airline-kb-used') || 0; }catch(e){ return 0; } };
const kbShowHints = () => kbSess <= 4 && kbUsed() < 3;
const KB_VIEWS = ['overview', 'plan', 'wall'];
function kbView(){ if(wallView) return 'wall'; const on = document.querySelector('.lnav .nv.on'); const k = on && on.getAttribute('data-nav'); return KB_VIEWS.includes(k) ? k : null; }
function kbGo(k){
  if(k === 'wall'){ setWallView(true); return; }
  if(wallView) setWallView(false);
  const b = document.querySelector(`.lnav .nv[data-nav="${k}"]`); if(b && !b.disabled && !b.classList.contains('locked')) b.click();
}
/* the named Wall button, and the hints under the three views */
function kbDecorate(){
  const wb = document.getElementById('wallBtn');
  if(wb && !wb.classList.contains('kb-wall')){ wb.classList.add('kb-wall'); if(wb.parentNode) wb.parentNode.classList.add('kb'); wb.insertAdjacentHTML('beforeend', '<span class="kb-wl">Operations Wall</span>'); wb.title = `Operations Wall (W, or ${kbKey} + →)`; }
  if(!kbOn()) return;
  const show = kbShowHints();
  document.body.classList.toggle('kb-hints', show);
  [['overview', `${kbKey} + ←`], ['plan', `${kbKey} + ← →`]].forEach(([k, t]) => { const b = document.querySelector(`.lnav .nv[data-nav="${k}"]`), t0 = b && (b.querySelector('.nv-t') || b); if(b && !b.querySelector('.kb-h')) t0.insertAdjacentHTML('beforeend', `<small class="kb-h">${t}</small>`); });
  if(wb && !wb.querySelector('.kb-h')) wb.insertAdjacentHTML('beforeend', `<small class="kb-h">${kbKey} + →</small>`);
}
document.addEventListener('keydown', e => {
  if(!kbOn() || !S || document.getElementById('bfLayer')) return;
  // where the key was pressed (an input's own handler may already have redrawn the page and moved the focus)
  const el = e.target && e.target !== document ? e.target : document.activeElement, typing = el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
  if(e.defaultPrevented) return;
  const teacher = document.getElementById('teacher'); if(teacher && teacher.classList.contains('open')) return;
  // Ctrl/Cmd + arrows: Home ← → Plan ← → Wall
  if((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')){
    if(typing || (el && el.closest && el.closest('.ad-blk')) || S.overlay || S.phase === 'setup') return;
    const at = kbView(); if(at === null && !wallView) { kbGo('overview'); e.preventDefault(); return; }
    const i = KB_VIEWS.indexOf(at), j = Math.max(0, Math.min(KB_VIEWS.length - 1, i + (e.key === 'ArrowRight' ? 1 : -1)));
    if(j !== i){ e.preventDefault(); kbGo(KB_VIEWS[j]); try{ localStorage.setItem('airline-kb-used', kbUsed() + 1); }catch(err){} }
    return;
  }
  if(e.ctrlKey || e.metaKey || e.altKey) return;
  // Esc closes whatever panel is open (the Working pad and the teacher panel keep their own)
  if(e.key === 'Escape'){
    if(S.overlay && S.overlay.type !== 'menu'){ e.preventDefault(); closeOverlay(); return; }
    const x = ['#s2PopX', '#s2EdX', '#s2DrX', '#fdLearnX', '#omClose', '#wrClose', '#cpClose', '#dxClose', '#dkClose', '#hClose'].map(s => document.querySelector(s)).find(b => b && b.offsetParent);
    if(x){ e.preventDefault(); x.click(); return; }
    if(UI.explain){ e.preventDefault(); UI.explain = null; render(); return; }
    if(UI.s2 && UI.s2.cmp){ e.preventDefault(); UI.s2.cmp = false; render(); }
    return;
  }
  // Enter checks the sum on the page when nothing else has the focus
  if(e.key === 'Enter' && !typing && !e.repeat && (!el || el === document.body || el === document.documentElement)){
    const B = [...screen().querySelectorAll('button')].filter(b => b.offsetParent && !b.disabled && /^\s*Check\b/.test(b.textContent));
    if(B.length === 1){ e.preventDefault(); B[0].click(); }
  }
});

/* ---------- Compare with last week ---------- */
const cmpOn = () => WBS().compareLastWeek !== false;
const cmpS0 = s2State;
s2State = function(pl){
  const U = cmpS0.apply(this, arguments);
  if(!U.startPlan){ try{ U.startPlan = JSON.parse(JSON.stringify(normPlan(pl))); }catch(e){} }
  return U;
};
const cmpOrd = n => ['', '1st', '2nd', '3rd', '4th', '5th', '6th'][n] || n + 'th';
function cmpLinesOf(pl){ const U = UI.s2 || {}, we = U.dt === 'weekend' && flightDaysOn(); return we ? withDay(satOf(S.day || 1), () => planLines(pl)) : planLines(pl); }
/* what changed, route by route, in words */
function cmpChanges(a, b){
  const out = [], sv = pl => { const m = {}; normPlan(pl).fleet.forEach((x, j) => { const deps = x.deps && x.deps.length === x.sched.length ? x.deps : actualDeps(normPlan(pl), j);
    x.sched.forEach((id, k) => (m[id] = m[id] || []).push({ dep:deps[k], days:(x.days || [])[k] || 'all', plane:x.planeId })); }); Object.values(m).forEach(l => l.sort((p, q) => p.dep - q.dep)); return m; };
  const A = sv(a), B = sv(b), ids = [...new Set(Object.keys(A).concat(Object.keys(B)))];
  ids.forEach(id => { const r = routeById(id), x = A[id] || [], y = B[id] || [], c = r.city, d = y.length - x.length;
    if(!x.length && y.length) out.push(`${c}: new route, ${y.length} service${y.length === 1 ? '' : 's'}`);
    else if(x.length && !y.length) out.push(`${c}: stopped`);
    else if(d) out.push(`${c}: ${Math.abs(d) === 1 ? 'one' : Math.abs(d) === 2 ? 'two' : Math.abs(d)} ${d > 0 ? 'more' : 'fewer'} service${Math.abs(d) === 1 ? '' : 's'}`);
    else y.forEach((s, k) => { if(s.dep !== x[k].dep) out.push(`${c} ${cmpOrd(k + 1)} flight moved ${fmtTime(x[k].dep)} → ${fmtTime(s.dep)}`); if(s.days !== x[k].days) out.push(`${c} ${fmtTime(s.dep)}: ${daysLabel(x[k].days)} → ${daysLabel(s.days)}`); });
    const f0 = (a.prices || {})[id], f1 = (b.prices || {})[id]; if(f0 && f1 && f0 !== f1 && x.length && y.length) out.push(`${c} fare ${money(f0)} → ${money(f1)}`); });
  const na = normPlan(a).fleet.length, nb = normPlan(b).fleet.length; if(nb > na) out.push(`${nb - na === 1 ? 'A new aircraft' : nb - na + ' new aircraft'} on the plan`);
  return out;
}
/* what each kept change was worth, in plain words (D88's line, as a result) */
function cmpWorth(a, b, L0, L1, profitShown){
  const out = [], ids = [...new Set(Object.keys(normPlan(a).prices || {}).concat(Object.keys(normPlan(b).prices || {})))];
  ids.forEach(id => { const r = routeById(id); if(!r) return; const p0 = L0.v['pax_' + id], p1 = L1.v['pax_' + id], f0 = L0.v['fare_' + id], f1 = L1.v['fare_' + id]; if(p0 === undefined || p1 === undefined) return;
    const t0 = p0 * f0, t1 = p1 * f1; if(t0 === t1) return;
    if(f0 !== f1) out.push(`${r.city} fare ${money(f0)} → ${money(f1)}: ${num(p1)} × ${money(f1)} against ${num(p0)} × ${money(f0)}, ${money(Math.abs(t1 - t0))} ${t1 > t0 ? 'more' : 'less'} a day in tickets`);
    else out.push(`${r.city}: ${num(p1)} passengers a day against ${num(p0)}, ${money(Math.abs(t1 - t0))} ${t1 > t0 ? 'more' : 'less'} a day in tickets`); });
  if(profitShown && L0.v.profit !== L1.v.profit) out.push(`Projected profit ${money(Math.round(L0.v.profit))} → ${money(Math.round(L1.v.profit))} a day`);
  return out;
}
function cmpDecorate(root){
  const tt = root.querySelector('.s2-tt'); if(!tt || !cmpOn() || !UI.s2 || UI.s2.mode === 'network' || S.phase === 'setup' || (S.day || 1) < 8) return;   // from week 2: there is a last week
  const head = tt.querySelector('.dk-pnl-h') || tt.firstElementChild; if(!head) return;
  const U = UI.s2, a = U.startPlan; if(!a) return;
  if(!head.querySelector('#cmpLW')) head.insertAdjacentHTML('beforeend', `<button class="btn cmp-btn ${U.cmp ? 'on' : ''}" id="cmpLW" aria-pressed="${!!U.cmp}">${U.cmp ? 'Hide last week' : 'Compare with last week'}</button>`);
  const btn = head.querySelector('#cmpLW'); if(btn) btn.onclick = () => { U.cmp = !U.cmp; render(); };
  if(!U.cmp) return;
  const b = normPlan(currentPlan()), L0 = cmpLinesOf(a), L1 = cmpLinesOf(b), dt = U.dt === 'weekend' && flightDaysOn() ? 'weekend' : 'weekday';
  // the ghosts: last week's flights behind this week's, lane by lane (matched by aircraft)
  tt.querySelectorAll('.ad-lane[data-lane]').forEach(lane => { const j = +lane.getAttribute('data-lane'), s0 = +lane.getAttribute('data-s0'), span = +lane.getAttribute('data-span'), cur = b.fleet[j]; if(!cur || !span) return;
    const x = a.fleet.find(z => z.uid === cur.uid); if(!x) return; const p = planeById(x.planeId), A = normPlan(a), jj = A.fleet.findIndex(z => z.uid === cur.uid), deps = x.deps && x.deps.length === x.sched.length ? x.deps : actualDeps(A, jj);
    x.sched.forEach((id, k) => { if(!fliesOn((x.days || [])[k], dt)) return; const r = routeById(id), trip = TIME.roundTrip(p, r);
      lane.insertAdjacentHTML('afterbegin', `<div class="cmp-gh" style="left:${(100 * (deps[k] - s0) / span).toFixed(2)}%;width:${(100 * trip / span).toFixed(2)}%" aria-hidden="true"><span>${fmtTime(deps[k])} ${esc(r.city)}</span></div>`); }); });
  // the summary's figures, before → now (a hidden figure stays hidden)
  const profitShown = !root.querySelector('.s2-sum [data-sum="profit"]'), F0 = s2Fill(L0.services || []), F1 = s2Fill(L1.services || []);
  root.querySelectorAll('.s2-sum .s2-si').forEach(si => { const l = (si.querySelector('small') || {}).textContent || '', b1 = si.querySelector('b'); if(!b1 || si.querySelector('.cmp-was')) return;
    let was = null; if(/filled/i.test(l)) was = `${num(F0.sold)} / ${num(F0.seats)}`; else if(/empty/i.test(l)) was = num(F0.seats - F0.sold); else if(/turned/i.test(l)) was = num(Math.round(L0.nos || 0)); else if(/profit/i.test(l) && profitShown) was = money(Math.round(L0.v.profit));
    if(was !== null && was !== b1.textContent.trim()) b1.insertAdjacentHTML('beforebegin', `<em class="cmp-was">${was} →</em>`); });
  const ch = cmpChanges(a, b), worth = cmpWorth(a, b, L0, L1, profitShown);
  tt.insertAdjacentHTML('beforeend', `<div class="cmp-pop" role="status"><p class="kl">Changed since last week</p>${ch.length ? `<ul>${ch.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : '<p class="cmp-none">Nothing yet: this is last week\'s plan.</p>'}${worth.length ? `<p class="kl">What it is worth</p><ul class="cmp-worth">${worth.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}</div>`);
}

/* ---------- What's in this: a quiet list ---------- */
const EX_REL = { Flights:'trips × running cost of a trip', Fuel:'litres burned × the price paid', 'Terminal charges':'passengers × the charge for each', 'Snack stock':'items stocked × cost of each', "Aircraft's day":'aircraft × the day cost of each', 'Second crew':'crews × the cost of a crew', Advertising:'the advertising chosen for the day' };
function exList(root){
  root.querySelectorAll('.explain:not(.ex-list)').forEach(ex => {
    const head = ex.querySelector(':scope > b'), close = ex.querySelector('[data-explain]'), spans = [...ex.querySelectorAll(':scope > span')];
    if(!head || !spans.length) return;
    const total = head.textContent.split(':'), what = total[0].trim(), tv = total.slice(1).join(':').trim();
    const rows = spans.map(s => { const v = s.querySelector('b'), val = v ? v.textContent : ''; let lab = s.textContent.replace(val, '').trim();
      if(/undercutting you/i.test(lab)) lab = "Advertising (Red Kite's undercut)";
      const rel = EX_REL[lab] || EX_REL[lab.split(' (')[0]] || (/^Fuel/.test(lab) ? EX_REL.Fuel : '');
      return `<tr><td>${esc(lab)}</td><td class="num">${esc(val)}${rel ? `<span class="fx" title="${esc(rel)}">ƒ</span>` : ''}</td></tr>`; }).join('');
    ex.classList.add('ex-list');
    ex.innerHTML = `<table class="ex-t"><tbody>${rows}</tbody><tfoot><tr><td>Total ${esc(what.toLowerCase())}</td><td class="num">${esc(tv)}</td></tr></tfoot></table>`;
    if(close){ ex.appendChild(close); }
  });
}

window.__exList = exList;   // for the tests
const kbRender0 = render;
render = function(){
  const r = kbRender0.apply(this, arguments);
  try{ kbDecorate(); const root = screen(); if(root){ cmpDecorate(root); exList(root); } }catch(e){}
  return r;
};
}
