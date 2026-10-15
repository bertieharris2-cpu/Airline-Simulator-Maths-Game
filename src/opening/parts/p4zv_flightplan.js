/* ==================================================================
   BERTIE'S RUN-THROUGH, 16 OCT: flight times before the timetable, a clearer demand strip, and no sums for flights
   that do not fly that day.
   1. A plan's sums are for one day of the plan. A route with no passengers that day (its flights fly Sat–Sun only, say)
      is not asked: "0 × £90" was. An empty Mon–Fri lane says when the aircraft's flights fly Sat–Sun only, and the
      Sat–Sun view says that flights added there fly at weekends only.
   2. Flight times come before the timetable. When an aircraft type meets an open route for the first time (a new route,
      or a new aircraft), the plan opens on a Flight times page: a table of each aircraft against each new route, two of
      them worked out by the pupil (distance ÷ speed, two tries), the rest by the model, and the difference between the
      aircraft in words. The flight-time cards on the sums page are no longer asked.
   3. The demand strip: one bar per part of the day, its height the people an hour, the busiest part of the day in gold,
      and "Busiest: Early, 06:00–09:00" beside it.
   Reassignment only (overrides.txt stays as it is).
   ================================================================== */

/* ---------- 1. no sums for a route that does not fly on the plan's day ---------- */
const decideHandSumsFT0 = decideHandSums;
decideHandSums = function(L, pl){
  const out = decideHandSumsFT0(L, pl);
  if(out && out.revenue && typeof out.revenue === 'object' && Array.isArray(out.revenue.routes)){
    const flies = id => { const x = (L.routes || []).find(z => z.id === id); return !!(x && (x.pax || 0) > 0); };
    out.revenue.routes = out.revenue.routes.filter(flies); if(!out.revenue.routes.length) delete out.revenue; }
  return out;
};
const soWorkCandsFT0 = soWorkCands;
soWorkCands = function(H, L, pl){ return soWorkCandsFT0(H, L, pl).filter(c => c.rel !== 'flightTime' && !(c.rel === 'tickets' && !((L.routes || []).find(z => z.id === c.route) || {}).pax)); };

/* the lanes: an empty Mon–Fri lane whose flights fly at weekends says so; the Sat–Sun view says what adding a flight there does */
function ftLaneNotes(){
  if(typeof UI === 'undefined' || !UI.s2 || typeof setOf !== 'function') return; const dt = UI.s2.dt || 'weekday', pl = normPlan(currentPlan());
  screen().querySelectorAll('.ad-lane').forEach(lane => { const none = lane.querySelector('.ad-none'); if(!none) return;
    const j = +String(lane.getAttribute('data-lane') || '').split('|')[1], x = pl.fleet[j]; if(!x || !x.sched.length) return;
    const other = dt === 'weekend' ? 'weekday' : 'weekend', n = setOf(x, other).length; if(!n) return;
    none.innerHTML = `No flights ${dt === 'weekend' ? 'at weekends' : 'Monday to Friday'}: its ${plural(n, 'flight')} ${n === 1 ? 'flies' : 'fly'} ${dt === 'weekend' ? 'Monday to Friday' : 'on Saturdays and Sundays'} only. <button class="dk-link" data-ftdt="${other}">See ${other === 'weekend' ? 'Sat–Sun' : 'Mon–Fri'}</button>`;
    none.classList.add('ft-other'); });
  screen().querySelectorAll('[data-ftdt]').forEach(b => b.onclick = e => { e.stopPropagation(); UI.s2.dt = b.getAttribute('data-ftdt'); render(); });
  const sw = screen().querySelector('.s2-dt');
  if(sw && dt === 'weekend' && !screen().querySelector('.ft-we')) sw.insertAdjacentHTML('afterend', '<span class="ft-we" role="note">Flights added here fly on Saturdays and Sundays only</span>');
}

/* ---------- 2. flight times before the timetable ---------- */
function ftS(){ if(S.ftp) return S.ftp; const pairs = ftPairs().filter(k => { const rid = k.split('|')[1], r = routeById(rid); return r && (r.openDay || 1) < (S.day || 1); });
  return (S.ftp = { seen:pairs, asked:{}, log:[] }); }   // a save from before this: what is already open counts as seen
function ftPairs(){ const types = [...new Set(S.fleet.map(f => f.planeId))], out = [];
  openRoutes(S.day || 1).forEach(r => types.forEach(pid => { const p = planeById(pid); if(p && (typeof planeCanFly !== 'function' || planeCanFly(p, r))) out.push(pid + '|' + r.id); }));
  return out; }
const ftOn = () => !!S && typeof weekMode === 'function' && weekMode() && S.phase === 'round' && typeof deskMode === 'function' && deskMode() && !(typeof QUIET !== 'undefined' && QUIET);
function ftNew(){ if(!ftOn()) return []; const F = ftS(); return ftPairs().filter(k => !F.seen.includes(k)); }
const ftHours = (p, r) => routeKm(r) / p.speed;
const ftNice = h => Math.abs(h * 4 - Math.round(h * 4)) < 1e-9;
function ftHM(h){ const m = Math.round(h * 60), a = Math.floor(m / 60), b = m % 60; return `${a ? a + ' h' : ''}${a && b ? ' ' : ''}${b ? b + ' min' : ''}` || '0 min'; }
/* the page's figures: the new routes, the fleet's types, and the two the pupil works out */
function ftPage(){
  const F = ftS(), fresh = ftNew(); if(!fresh.length) return null;
  const rids = [...new Set(fresh.map(k => k.split('|')[1]))], types = [...new Set(S.fleet.map(f => f.planeId))].sort((a, b) => planeById(a).speed - planeById(b).speed || planeById(a).seats - planeById(b).seats);
  const key = fresh.slice().sort().join(','); let A = F.asked[key];
  if(!A){   // two sums: the same route by the slowest and the fastest aircraft when they differ, else the first two new pairs; whole or quarter hours first
    const can = (pid, rid) => fresh.includes(pid + '|' + rid), nice = (pid, rid) => ftNice(ftHours(planeById(pid), routeById(rid)));
    let pick = [];
    const flies = (pid, rid) => typeof planeCanFly !== 'function' || planeCanFly(planeById(pid), routeById(rid));
    if(types.length > 1){ const lo = types[0], hi = types[types.length - 1], both = rid => flies(lo, rid) && flies(hi, rid) && (can(lo, rid) || can(hi, rid)),   // one route, both aircraft (even if one has met it)
        r = rids.find(rid => both(rid) && nice(lo, rid) && nice(hi, rid)) || rids.find(both); if(r) pick = [lo + '|' + r, hi + '|' + r]; }
    if(pick.length < 2){ const order = fresh.slice().sort((a, b) => { const [pa, ra] = a.split('|'), [pb, rb] = b.split('|'); return (nice(pb, rb) ? 1 : 0) - (nice(pa, ra) ? 1 : 0); });
      order.forEach(k => { if(pick.length < (types.length > 1 ? 2 : 1) && !pick.includes(k)) pick.push(k); }); }   // one aircraft type: one sum (nothing to compare)
    A = F.asked[key] = pick.map(k => ({ k, v:'', tries:0, done:false, shown:false, msg:'', q:false }));
  }
  return { fresh, rids, types, items:A, key };
}
function ftCompare(P){   // the difference between the aircraft, in words, on the first route both fly
  if(P.types.length < 2) return ''; const lo = planeById(P.types[0]), hi = planeById(P.types[P.types.length - 1]);
  const rid = P.rids.find(id => [lo, hi].every(p => typeof planeCanFly !== 'function' || planeCanFly(p, routeById(id)))); if(!rid) return '';
  const r = routeById(rid), a = ftHours(lo, r), b = ftHours(hi, r), sv = a - b; if(sv < 1 / 60) return '';
  return `The ${esc(shortPlane(hi))} flies at ${num(hi.speed)} km/h and the ${esc(shortPlane(lo))} at ${num(lo.speed)} km/h. To ${esc(r.city)} that is ${ftHM(b)} against ${ftHM(a)}: ${ftHM(sv)} less each way, ${ftHM(2 * sv)} on a return trip, so the faster aircraft fits more flights into a day.`;
}
function ftHtml(P){
  const asked = Object.fromEntries(P.items.map(x => [x.k, x])), row = rid => { const r = routeById(rid);
    return `<tr><th><span class="ft-c">${flagSvg(r.flag, 16)} ${esc(r.city)}</span><small>${num(routeKm(r))} km</small></th>${P.types.map(pid => { const p = planeById(pid), k = pid + '|' + rid;
      if(typeof planeCanFly === 'function' && !planeCanFly(p, r)) return '<td class="ft-no">too far</td>';
      const a = asked[k], h = ftHours(p, r);
      if(!a) return `<td class="ft-m">${ftHM(h)} <span class="fx" title="The model worked this out">ƒ</span></td>`;
      if(a.done) return `<td class="ft-a ok">${ftHM(h)} <small>(${num(Math.round(h * 100) / 100)} h)</small>${a.shown ? FIN_STAMP : cardStampHtml('ok')}</td>`;
      return `<td class="ft-a">${sumHeadHtml('ftp:' + k, `Flight time — ${shortPlane(p)} to ${r.city}`)}<p class="mono">${num(routeKm(r))} km ÷ ${num(p.speed)} km/h =</p><div class="ft-in"><span class="sc-in ${a.q ? 'qy' : ''}"><input data-ftpin="${k}" inputmode="decimal" autocomplete="off" value="${esc(a.v)}" aria-label="Hours to fly"><i class="suf">hours</i></span><button class="btn primary" data-ftpchk="${k}">Check ✓</button></div><span class="sc-msg" role="status">${esc(a.msg || '')}</span></td>`; }).join('')}</tr>`; };
  const left = P.items.filter(x => !x.done).length, cmp = ftCompare(P);
  return `<section class="dk-pnl ft-pnl"><div class="dk-pnl-h">${ICO2.plane || ''}<h2>How long each aircraft takes</h2><span class="grow"></span><span class="sub">time in the air, one way: distance ÷ speed</span></div>
    <table class="dk-t ft-t"><thead><tr><th>Route</th>${P.types.map(pid => { const p = planeById(pid); return `<th>${esc(shortPlane(p))}<small>${num(p.speed)} km/h</small></th>`; }).join('')}</tr></thead><tbody>${P.rids.map(row).join('')}</tbody></table>
    <p class="ft-note">${left ? `Work out the ${left === 1 ? 'one' : left === 2 ? 'two' : left} with a box in your book; the model has worked out the rest (ƒ).` : 'All worked out.'} A return trip is out, a turnaround, and back.</p>${cmp ? `<p class="ft-cmp">${cmp}</p>` : ''}</section>`;
}
function renderFtp(st, P){
  const left = P.items.filter(x => !x.done).length;
  screen().innerHTML = shell(deskPage({ title:'Flight times', sub:'Before the timetable: how long each of your aircraft takes to fly each new route.', cls:'ftp-page', body:ftHtml(P) }),
    deskBar(left ? 'Work out the flight times with a box, then go on to the timetable.' : 'Now plan the timetable: a faster aircraft fits more flights into a day.', `<button class="btn primary big" id="ftpGo" ${left ? 'disabled' : ''}>${left ? 'Work out the flight times first' : 'On to the timetable'} &#9654;</button>`));
  const root = screen();
  root.querySelectorAll('[data-ftpin]').forEach(inp => { const a = P.items.find(x => x.k === inp.getAttribute('data-ftpin')); inp.oninput = () => { a.v = inp.value; };
    inp.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); const c = root.querySelector(`[data-ftpchk="${a.k}"]`); if(c) c.click(); } }; });
  root.querySelectorAll('[data-ftpchk]').forEach(b => b.onclick = () => { const a = P.items.find(x => x.k === b.getAttribute('data-ftpchk')); ftCheck(a); render(); });
  on('ftpGo', () => { if(P.items.some(x => !x.done)) return; const F = ftS(); P.fresh.forEach(k => { if(!F.seen.includes(k)) F.seen.push(k); });
    F.log.push({ day:S.day, pairs:P.fresh.length, asked:P.items.map(x => x.k) }); save(); render(); });
}
function ftCheck(a){
  const [pid, rid] = a.k.split('|'), p = planeById(pid), r = routeById(rid), h = ftHours(p, r), v = padNum(a.v), key = 'ftp:' + a.k;
  if(v === null){ a.msg = 'Type the number of hours.'; return; }
  const e = recOpen(key, { type:'calc', relKey:'flightTime', doc:`Flight time: ${shortPlane(p)} to ${r.city}`, ask:`How long does the ${shortPlane(p)} take to fly ${num(routeKm(r))} km at ${num(p.speed)} km/h?`,
    question:`${num(routeKm(r))} km ÷ ${num(p.speed)} km/h`, unit:'h', correct:Math.round(h * 100) / 100, correctText:`${num(Math.round(h * 100) / 100)} h`, ops:[routeKm(r), p.speed], op:'÷', level:'Calculate' });
  const ok = Math.abs(v - h) <= 0.05 + 1e-9;
  recAttempt(e, ok ? { ok:true, given:String(a.v), value:v, method:'distance ÷ speed' } : { ok:false, given:String(a.v), value:v, method:'distance ÷ speed', note:'' });
  const done = shown => { a.done = true; a.shown = !!shown; a.q = false; a.msg = ''; if(typeof soTouch === 'function') soTouch('flightTime', { route:rid, count:true }); const sk = skills().flightTime; if(sk && !sk.routes.includes(rid)) sk.routes.push(rid);
    (S.handSumLog = S.handSumLog || []).push({ day:S.day, date:dateShort(S.day), tools:[`Flight time: ${shortPlane(p)} to ${r.city} (Calculate)`] }); save(); };
  if(ok){ done(false); return; }
  a.tries = (a.tries || 0) + 1;
  if(a.tries >= 2 && (typeof twoTriesOn !== 'function' || twoTriesOn())){ if(typeof paperRecShown === 'function') paperRecShown(key); done(true); return; }
  a.q = true; a.msg = `Query: ${Math.abs(v * p.speed - routeKm(r)) < 1 ? '' : v > h * 5 ? 'that is far too long: divide the distance by the speed. ' : v * p.speed < routeKm(r) ? `too short: ${num(v)} h at ${num(p.speed)} km/h covers only ${num(Math.round(v * p.speed))} km. ` : `too long: ${num(v)} h at ${num(p.speed)} km/h covers ${num(Math.round(v * p.speed))} km. `}One more try.`;
}
/* the gate: the plan opens on Flight times while a new aircraft-and-route pair is waiting */
const planFT0 = R.plan;
R.plan = st => { try{ const P = ftNew().length ? ftPage() : null; if(P) return renderFtp(st, P); }catch(e){}
  const r = planFT0(st); try{ ftLaneNotes(); }catch(e){} return r; };
/* for the tests: the next box to fill, with its answer */
function ftpPlan(){ const P = ftNew().length ? ftPage() : null; if(!P) return null; const a = P.items.find(x => !x.done);
  return { pairs:P.fresh, asked:P.items.map(x => x.k), next:a ? { key:a.k, answer:Math.round(ftHours(planeById(a.k.split('|')[0]), routeById(a.k.split('|')[1])) * 100) / 100 } : null }; }
if(typeof REC_REL !== 'undefined') REC_REL.flightTime = REC_REL.flightTime || 'flight time: distance ÷ speed';

/* ---------- 3. the demand strip: bars by part of the day, the busiest in gold ---------- */
stripHtml = function(pl, id){
  const s0 = dayStart(), e0 = dayEnd(), span = e0 - s0, X = m => (100 * (Math.max(s0, Math.min(e0, m)) - s0) / span), D = stripData(pl, id), mx = Math.max(1e-9, ...D.map(o => o.per)), r = id && routeById(id);
  const top = D.slice().sort((a, b) => b.per - a.per)[0], hm = h => `${pad(h)}:00`;
  const cols = D.map(o => { const w = X(o.h1 * 60) - X(o.h0 * 60), hT = 100 * o.per / mx, hL = 100 * (o.lock / Math.max(1, o.h1 - o.h0)) / mx, busy = o === top;
    return `<div class="st-band dm ${busy ? 'top' : ''}" style="left:${X(o.h0 * 60).toFixed(2)}%;width:${w.toFixed(2)}%" title="${esc(BAND_SHORT[o.b] || o.b)} ${hm(o.h0)}–${hm(o.h1)}: ${o.lock + o.flex} people (${o.lock} must fly then, about ${o.flex} could fly at any time); ${num(Math.round(o.per))} an hour">
      <div class="dm-bar" style="height:${Math.max(4, Math.round(hT))}%"><i class="dm-lk" style="height:${Math.round(100 * hL / Math.max(1e-9, hT))}%"></i></div>
      <span class="dm-n mono">${num(o.lock + o.flex)}</span><span class="dm-l">${esc(BAND_SHORT[o.b] || o.b)}</span></div>`; }).join('');
  return `<div class="st-strip dmw" data-strip="${id || ''}"><div class="st-sl"><b>${r ? `${flagSvg(r.flag, 14)} ${esc(r.city)}` : 'All your routes'}</b><small>${r ? `at ${money(pl.prices[id] || r.basePrice)}` : 'at your fares'}: people who want to fly</small>
    <span class="dm-top">Busiest: ${esc(BAND_SHORT[top.b] || top.b)}, ${hm(top.h0)}–${hm(top.h1)}</span><span class="st-key dm-key"><i class="lk"></i>must fly then <i class="fx"></i>any time</span></div><div class="st-sb">${cols}</div></div>`;
};
