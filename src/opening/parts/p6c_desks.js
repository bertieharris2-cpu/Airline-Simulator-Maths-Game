/* =====================================================================
   CHAPTER ONE, 30 OCT 2026 — THE DESKS (Bertie's hand-off 2, sections 5-8; DESIGN.md of 30 Oct). Chapter one only (ch1()).
     6. the Fuel desk's order has no sum: Your order shows the cost (ƒ) and the cash after it against his reserve, and Your
        position shows the position with this order; nothing is bought until Continue
     5. the what-if fare sheet (from week 2): free to try, no sums
     7. the full-width timetable
     8. the Briefings shelf in teacher test mode
   ===================================================================== */

/* ---------- 6. the Fuel desk: the order without a sum ---------- */
const c1FdOn = () => ch1() && typeof fd2On === 'function' && fd2On();
const c1Reserve = () => { try{ return typeof myReserve === 'function' ? (myReserve() || 0) : (WORLD.cashReserve || 0); }catch(e){ return 0; } };
function c1Order(){ const P0 = fuelOn(S.day || 1), blk = fuelBlock(), n = (UI.fd && UI.fd.selNow) || 0, L = n * blk; return { n, L, P0, blk, cost:Math.round(L * P0 * 100) / 100, after:Math.round((S.cash - L * P0) * 100) / 100 }; }
function c1OrderHtml(){
  const O = c1Order(), R = c1Reserve(), T = c1T('fuel.order'), cash = Math.max(1, S.cash), keep = Math.max(0, O.after), ok = O.after >= R;
  const W = 296, wAfter = Math.round(W * Math.min(1, keep / cash)), wOrder = Math.max(0, Math.min(W - wAfter, Math.round(W * O.cost / cash))), xRes = Math.round(W * Math.min(1, R / cash));
  const line = c1T(ok ? 'fuel.order.above' : 'fuel.order.below', { reserve:money(R) }).text[0] || (ok ? `✓ Above your ${money(R)} reserve` : `! Below your ${money(R)} reserve`);
  return `<div class="c1-ord" data-c1ord><span class="c1-ord-e">${esc(T.eyebrow || 'YOUR ORDER')}</span><b class="c1-ord-n">${O.n} block${O.n === 1 ? '' : 's'} · ${num(O.L)} L</b>
    <div class="c1-ord-r"><span>Cost <i class="ash-au">ƒ</i></span><b class="gold">${money(O.cost)}</b></div><div class="c1-ord-r"><span>Cash after this order</span><b class="gold">${money(Math.round(O.after))}</b></div>
    <div class="c1-ord-bar" role="img" aria-label="Cash after this order ${money(Math.round(O.after))}; reserve ${money(R)}" style="width:${W}px"><i class="aft" style="width:${wAfter}px"></i><i class="ord" style="left:${wAfter}px;width:${wOrder}px"></i>${R > 0 ? `<i class="res" style="left:${xRes}px"></i><span class="res-l" style="left:${xRes}px">reserve</span>` : ''}</div>
    ${R > 0 ? `<p class="c1-ord-l ${ok ? 'green' : 'amber'}">${esc(line)}</p>` : ''}</div>`;
}
/* Your position with this order: the tank, In the tank, Already secured and Still to buy as they would be */
let C1_WITH = null;
const c1Layers0 = fdLayers;
fdLayers = function(){ const L = c1Layers0.apply(this, arguments); return C1_WITH ? L.concat([{ L:C1_WITH.L, p:C1_WITH.P0 }]) : L; };
const c1Pos0 = fd2Position;
fd2Position = function(day, farm){
  const O = c1FdOn() ? c1Order() : null; if(!O || !O.n || (UI.fd && UI.fd.done)) return c1Pos0.apply(this, arguments);
  const f0 = S.fuel; C1_WITH = O; S.fuel = f0 + O.L; let h;
  try{ h = c1Pos0.apply(this, arguments); } finally { S.fuel = f0; C1_WITH = null; }
  const need = Math.round(fdNeed(day).week), inT = Math.round(f0 + O.L), still = Math.max(0, need - inT), left = Math.max(0, inT - need), cover = need ? Math.min(100, Math.round(100 * inT / need)) : 100;
  h = h.replace('<h2>Your position</h2>', `<h2>Your position <span class="c1-with">${esc(c1T('fuel.position.tag').eyebrow || 'WITH THIS ORDER')}</span></h2>`).replace('class="bv-panel fd-pos fd2-pos"', 'class="bv-panel fd-pos fd2-pos c1-withp"');
  if(!still) h = h.replace(/(<div class="fd2-f green"><small>Still to buy<\/small><b>)[^<]*(<\/b>)/, '$1none ✓$2');
  h = h.replace(/<p class="fd2-note">[\s\S]*?<\/p>/, `<p class="fd2-note"><b class="green">${cover}% covered</b>${left ? ` · ${num(left)} L left over for next week.` : still ? ` · ${num(still)} L still to buy.` : '.'}</p>`);
  return h;
};
if(typeof ashFoSpec === 'function'){ const c1Fo0 = ashFoSpec; ashFoSpec = function(){ return c1FdOn() ? null : c1Fo0.apply(this, arguments); }; }   // no order sheet
const c1FdHtml0 = fuelDeskHtml;
fuelDeskHtml = function(asView){
  if(c1FdOn() && UI.fd) UI.fd.signed = true;   // no sign-off: he chooses the blocks and Continue buys them
  let h = c1FdHtml0.apply(this, arguments); if(!c1FdOn() || asView) return h;
  // the Your order panel where the sheet was (the old total and Confirm purchase stay hidden)
  const at = h.indexOf('<div class="fd-tot">'); if(at < 0) return h;
  return h.slice(0, at) + c1OrderHtml() + h.slice(at).replace('<div class="fd-tot">', '<div class="fd-tot c1-hide">');
};
const c1FdBind0 = bindFuelDesk;
bindFuelDesk = function(asView){
  if(c1FdOn() && UI.fd) UI.fd.signed = true;   // no sign-off: he chooses the blocks and Continue buys them
  c1FdBind0.apply(this, arguments); if(!c1FdOn() || asView) return;
  const root = screen(); root.querySelectorAll('.ash-fo').forEach(e => e.remove());
  const nx = $('nx'); if(nx){ const go = nx.onclick; nx.onclick = e => { const O = c1Order(); if(O.n > 0 && O.n <= fdMaxBlocks(O.P0)){ if(!S.fuelBuySigned) S.fuelBuySigned = { day:S.day, L:O.L, p:O.P0, noSum:true }; buyFuel(O.L, O.P0); fuelWeek(S.day || 1).bought.push({ day:S.day, L:O.L, p:O.P0 }); UI.fd.sel = 0; save(); } return go && go.call(nx, e); }; }
};
/* the tour's step 3 now points at the order panel: "choose how many blocks to buy, then check the cash you'll have left" (ScreenText fuel.tour.3) */

/* ---------- 5. the what-if fare sheet (from week 2): free to try, no sums ----------
   One row per route he flies: the fare with − and +, who wants to fly, seats filled, ticket revenue, costs and profit a day,
   each worked out by the model (ƒ) as he steps the fare through the route's fare options; then Both routes. Fares he has
   changed are outlined green; a profit that rose shows green; What changed compares with the fares he has now. Set my
   fares puts them in the plan. Nothing is asked and nothing goes in his book. */
const c1WiOn = () => ch1() && !!S && S.phase !== 'setup' && (S.day || 1) >= 8 && typeof weekMode === 'function' && weekMode();
const c1WiS = () => UI.c1wi && UI.c1wi.day === S.day ? UI.c1wi : (UI.c1wi = { day:S.day, fares:{} });
function c1WiRows(fares){
  const pl0 = normPlan(currentPlan()), pl = JSON.parse(JSON.stringify(pl0)); pl.prices = Object.assign({}, pl0.prices, fares || {});
  const L = planLines(pl), V = L.v, ids = L.routes.map(r => r.id).filter(id => routeById(id));
  return withPlan(pl, () => { const fl = planFlights().filter(x => !x.grounded), nAll = Math.max(1, fl.length), paxAll = Math.max(1, fl.reduce((t, x) => t + x.sold, 0)), shared = V.day + V.crew + V.stock + V.event;
    const rows = ids.map(id => { const f = fl.filter(x => x.route === id), pax = f.reduce((t, x) => t + x.sold, 0), seats = f.reduce((t, x) => t + x.seats, 0), rev = f.reduce((t, x) => t + x.revenue, 0);
      const cost = Math.round(f.reduce((t, x) => t + x.runCost + (x.fuelCost || 0), 0) + V.term * pax / paxAll + shared * f.length / nAll);
      return { id, r:routeById(id), fare:fareOf(id), want:paxWant(routeById(id), fareOf(id)), pax, seats, rev, cost, profit:rev - cost }; });
    const tot = { rev:rows.reduce((t, x) => t + x.rev, 0), cost:rows.reduce((t, x) => t + x.cost, 0) }; tot.profit = tot.rev - tot.cost; return { rows, tot }; });
}
function c1WiStep(id, dir){ const r = routeById(id), opts = (r.fares && r.fares.length ? r.fares : [r.basePrice]).slice().sort((a, b) => a - b), W = c1WiS(), cur = W.fares[id] !== undefined ? W.fares[id] : fareOf(id);
  let i = opts.indexOf(cur); if(i < 0) i = opts.findIndex(f => f >= cur); i = clamp(i + dir, 0, opts.length - 1); const v = opts[i];
  if(v === fareOf(id)) delete W.fares[id]; else W.fares[id] = v; render(); }
function c1WhatIfRender(){
  const W = c1WiS(), now = c1WiRows({}), wi = c1WiRows(W.fares), changed = Object.keys(W.fares).length > 0, X = S.c1 || (S.c1 = {}), first = !X.wiSeen;
  const T = c1T('whatif.title', { n:weekNo(S.day || 1) }), cols = [{ c:'B', w:140, top:'per passenger', main:'Fare' }, { c:'C', w:140, top:'a day', main:'Want to fly' }, { c:'D', w:150, top:`of ${num((wi.rows[0] || {}).seats || 0)} a day`, main:'Seats filled' },
    { c:'E', w:150, top:'a day', main:'Ticket revenue' }, { c:'F', w:140, top:'a day', main:'Costs' }, { c:'G', w:150, top:'a day', main:'Profit' }];
  const rows = [{ r:1, t:'hdr' }], v = {};
  wi.rows.forEach((x, i) => { const r = i + 2, n0 = now.rows.find(z => z.id === x.id) || x; rows.push({ r, label:x.r.city, fl:x.r.flag });
    v['B' + r] = { t:money(x.fare), wi:x.id }; v['C' + r] = { t:num(x.want), f:true }; v['D' + r] = { t:num(x.pax), f:true, bar:x.seats ? x.pax / x.seats : 0 };
    v['E' + r] = { t:money(x.rev), f:true }; v['F' + r] = { t:money(x.cost) }; v['G' + r] = { t:money(x.profit), f:true, cls:changed && x.profit > n0.profit ? 'pos' : x.profit < 0 ? 'soft' : '' }; });
  const rT = wi.rows.length + 2; rows.push({ r:rT, label:'Both routes', ic:'coins', t:'tot', gold:true });
  if(wi.rows.length !== 2) rows[rows.length - 1].label = 'All routes';
  v['E' + rT] = { t:money(wi.tot.rev), f:true }; v['F' + rT] = { t:money(wi.tot.cost), f:true }; v['G' + rT] = { t:money(wi.tot.profit), f:true, cls:changed && wi.tot.profit > now.tot.profit ? 'pos' : '' };
  if(wi.tot.profit > 0) v['G' + rT].cls = (v['G' + rT].cls || '') + ' gold';
  const sp = { id:'whatif:' + (S.day || 1), crumb:`${(S.airline && S.airline.name) || 'Airline'} HQ · ${T.text[0] || 'Plan week ' + weekNo(S.day || 1)}`, title:T.title || 'What if you change a fare?', tabs:ashTabs('whatif'), lw:170, cols, rows, v, sums:[], act:null, just:null,
    doneLine:'Change any fare with − and +. Every number on its row works itself out (ƒ).' };
  const diff = d => d > 0 ? `<span class="pos">(${money(d)} more)</span>` : d < 0 ? `<span class="c1-less">(${money(-d)} less)</span>` : '';
  const C = c1T('whatif.changed'), lines = wi.rows.filter(x => W.fares[x.id] !== undefined).map(x => { const n0 = now.rows.find(z => z.id === x.id) || x;
    return `<div class="c1-wil"><span>${esc(x.r.city)} ${money(n0.fare)} → <b>${money(x.fare)}</b></span><span>${x.pax === n0.pax ? (x.pax >= x.seats ? 'still full' : `${num(x.pax)} fly`) : `${num(n0.pax)} → ${num(x.pax)} fly`} · profit a day ${money(n0.profit)} → <b>${money(x.profit)}</b> ${diff(x.profit - n0.profit)}</span></div>`; }).join('');
  const panel = changed ? `<section class="c1-wic" aria-label="What changed"><span class="c1-wie">${esc(C.eyebrow || 'WHAT CHANGED, AGAINST THE FARES YOU HAVE NOW')}</span>${lines}
      <div class="c1-wil tot"><span><b>${wi.rows.length === 2 ? 'Both routes' : 'All routes'}</b></span><span>profit a day ${money(now.tot.profit)} → <b class="gold">${money(wi.tot.profit)}</b> ${diff(wi.tot.profit - now.tot.profit)}</span></div>
      <button class="bv-btn" id="c1WiBack">${esc(C.button || '↶ Back to my fares')}</button></section>` : '';
  const F = c1T('whatif.first'), co = first ? `<div class="ash-co c1-wico pu" role="dialog" aria-label="${esc(F.title)}"><i class="ash-ptr" aria-hidden="true"></i><span class="ash-coe">${esc(F.eyebrow || 'NEW · WHAT IF')}</span><b class="ash-cot">${esc(F.title)}</b>${F.text.map(t => `<p>${c1Html(t)}</p>`).join('')}<div class="ash-coa"><button class="bv-btn primary" id="c1WiGot">${esc(F.button || 'Got it')}</button></div></div>` : '';
  const Ft = c1T('whatif.footer', { n:weekNo(S.day || 1) });
  screen().innerHTML = shell(`<div class="dp ash-page c1-wi">${ashHtml(sp)}${co}${panel}</div>`, deskBar(Ft.text[0] || 'Plan the week · try fares before you set them.', `<button class="bv-btn big" id="c1WiClose">&#9664; Back</button><button class="bv-btn primary big" id="c1WiSet" ${changed ? '' : 'disabled'}>${esc((Ft.button || 'Set my fares ▶').replace('▶', '')).trim()} &#9654;</button>`));
  // the callout and What changed sit inside the sheet, under its line
  const root = screen(), ln = root.querySelector('.c1-wi .ash-line'); if(ln) root.querySelectorAll('.c1-wi > .c1-wico, .c1-wi > .c1-wic').forEach(e => ln.after(e));
  // the fares: − and + in each Fare cell; a changed fare is outlined green
  wi.rows.forEach((x, i) => { const c = root.querySelector(`.ash-grid .ash-c[data-ref="B${i + 2}"]`); if(!c) return;
    c.insertAdjacentHTML('afterbegin', `<span class="c1-wib"><button class="c1-wis" data-c1wi="${x.id}|-1" aria-label="${esc(x.r.city)}: lower fare">−</button><button class="c1-wis" data-c1wi="${x.id}|1" aria-label="${esc(x.r.city)}: higher fare">+</button></span>`);
    if(W.fares[x.id] !== undefined) c.classList.add('c1-wich'); });
  root.querySelectorAll('[data-c1wi]').forEach(b => b.onclick = () => { const [id, d] = b.getAttribute('data-c1wi').split('|'); c1WiStep(id, +d); });
  root.querySelectorAll('[data-ashtab]').forEach(b => b.onclick = () => { const t = b.getAttribute('data-ashtab'); if(t === 'whatif') return; UI.view = null; UI.ashTab = t; render(); });
  on('c1WiGot', () => { X.wiSeen = S.day || 1; save(); render(); });
  on('c1WiBack', () => { W.fares = {}; render(); });
  on('c1WiClose', () => { UI.view = null; render(); });
  on('c1WiSet', () => { const pl = normPlan(currentPlan()); pl.prices = Object.assign({}, pl.prices, W.fares); applyPlan(pl); W.fares = {}; UI.view = null; save(); toast('Your fares are in the plan.'); render(); });
}
const c1RenderView0 = renderView;
renderView = function(v){ if(v === 'whatif'){ if(c1WiOn()){ c1WhatIfRender(); return; } UI.view = null; return c1RenderView0.call(this, null); } return c1RenderView0.apply(this, arguments); };
/* the What if tab, after Week 1, from week 2 */
const c1Tabs0 = ashTabs;
ashTabs = function(on){ const t = c1Tabs0.apply(this, arguments); if(!c1WiOn()) return t; const i = t.findIndex(x => x.id === 'week'); t.splice(i < 0 ? t.length - 1 : i + 1, 0, { id:'whatif', label:'What if', ic:'tag', on:on === 'whatif', off:false }); return t; };
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-ashtab="whatif"]'); if(!b || !c1WiOn()) return; e.preventDefault(); e.stopImmediatePropagation(); UI.view = 'whatif'; render(); }, true);
/* and a row in the week plan opener's This week list */
const c1OpRows0 = op2Rows;
op2Rows = function(pl, L){ const h = c1OpRows0.apply(this, arguments); if(!c1WiOn()) return h;
  return h + `<li class="op2-r c1-wir"><span class="op2-i">${ICO2.tag || ''}</span><span class="op2-t">What if you change a fare? Try fares before you set them.</span><span class="op2-l"><button class="op2-a" data-c1wigo>What if ›</button></span></li>`; };
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-c1wigo]'); if(!b || !c1WiOn()) return; e.preventDefault(); UI.view = 'whatif'; render(); }, true);
if(window.__tkSums) window.__tkSums.unshift({ what:'the what-if sheet', test:() => !!document.getElementById('c1WiGot'), plan:() => ({ at:'#c1WiGot', value:'Got it', go:() => document.getElementById('c1WiGot').click() }) });

/* ---------- 7. the timetable, full width (hand-off 2, section 7; DESIGN.md DemandStrip and the 30 Oct decision) ----------
   While he plans flights the menu and the Studio's other panels hide and the timetable fills the page: Who wants to fly lined
   up with its hours, one 64px lane per plane with the dark blue blocks (route, seats filled, a seat-fill bar, the times; no
   fare), a tray of routes to drag onto a plane, and the key. ☰ Show menu brings the Studio back (its timetable has ⤢ Full
   width to return). The engine's own edits do the work (moveService, addService, editPlan); this part draws, drags and
   checks the fit. Nothing on screen says how many flights to fit (hand-off 1). */
const C1_SNAP = 15;   // the quarter hour
const c1TtOn = () => { const U = UI.s2; if(!ch1() || !U || U.mode !== 'plan' || U.menu || U.route || U.focus || UI.view) return false; try{ return step().t === 'plan'; }catch(e){ return false; } };
const c1Snap = fn => { const keep = PLW_SNAP; PLW_SNAP = C1_SNAP; try{ return fn(); } finally { PLW_SNAP = keep; } };
/* drag one flight over another on the same plane and they swap places (Bertie, 30 Oct 19:15: "drag say Dublin over the top
   of Paris and swap places without me having to delete the flight and put it back"): each takes the other's start time,
   then the turnarounds are worked out again */
function c1Swap(j, k, k2){
  const next = normPlan(JSON.parse(JSON.stringify(currentPlan()))), x = next.fleet[j]; if(!x || x.sched[k] === undefined || x.sched[k2] === undefined || k === k2) return false;
  if(!x.deps || x.deps.length !== x.sched.length) x.deps = actualDeps(next, j);
  const a = x.sched[k]; x.sched[k] = x.sched[k2]; x.sched[k2] = a; x.deps = actualDeps(next, j);
  if(!withPlan(next, () => fitsFor(x))){ toast("Swapped, they wouldn't both fit in the day."); return false; }
  UI.tlSel = { i:0, j, k:k2 }; setPlan(0, next); return true;
}
const c1Over = (e, b, j) => document.elementsFromPoint(e.clientX, e.clientY).find(el => el !== b && el.matches && el.matches('.c1-blk[data-c1b]') && +el.getAttribute('data-c1b').split('|')[0] === j);
const c1Flown = pl => { const f = new Set(normPlan(pl).fleet.flatMap(x => x.sched)); return plannerOrder().filter(id => f.has(id)).concat([...f].filter(id => !plannerOrder().includes(id) && routeById(id))); };
const c1TrayIds = pl => { const st = UI.s2 && UI.s2.startPlan ? c1Flown(UI.s2.startPlan) : [], f = c1Flown(pl).concat(st.filter(id => !c1Flown(pl).includes(id)));   // a route he flew at the start of this plan step keeps its token
  const all = plannerOrder().filter(id => normPlan(pl).fleet.some(x => planeCanFly(planeById(x.planeId), routeById(id))));
  if(S.phase === 'setup' && ch1()) return all.concat(f.filter(id => !all.includes(id)));   // Launch Day: every route he can fly, with no route page first (19:15)
  return f.length ? f : all; };
const c1We = () => !!(UI.s2 && UI.s2.dt === 'weekend' && S2V.fd);
const c1Hm = m => fmtTime(((m % 1440) + 1440) % 1440);
/* a plane's flights in the day type on show: full-schedule index, times, turnaround, seats filled */
function c1LaneTrips(pl, j, L){
  const x = pl.fleet[j]; if(!x) return []; const p = planeById(x.planeId), idx = s2Idx(x), dps = x.deps && x.deps.length === x.sched.length ? x.deps : null, home = TIME.home(p);
  const D = idx.length ? withPlan(pl, () => TIME.day(p, idx.map(k => x.sched[k]), undefined, dps ? idx.map(k => dps[k]) : null)) : null;
  return D ? D.trips.map((t, q) => { const k = idx[q], s = L ? (L.services || []).find(z => z.uid === x.uid && z.k === k) || {} : {}, last = q === D.trips.length - 1;
    return { k, route:t.route, dep:t.dep, arr:t.arr, ready:last ? t.arr : t.arr + home, last, sold:s.sold || 0, seats:s.seats || p.seats }; }) : [];
}
/* will a flight of route id leave plane j at t? (k: the flight being moved, or null for a new one) */
function c1Fit(j, k, id, t){
  const pl = normPlan(currentPlan()), x = pl.fleet[j]; if(!x) return { ok:false, why:'' };
  const p = planeById(x.planeId), r = routeById(id), trip = TIME.roundTrip(p, r), home = TIME.home(p), e0 = dayEnd(), back = t + trip, maxT = WORLD.maxTrips || 4;
  if(!planeCanFly(p, r)) return { ok:false, why:`! The ${shortPlane(p)} can't reach ${r.city}: its range is ${num(p.range)} km and ${r.city} is ${num(routeKm(r))} km away.` };
  if(back > e0) return { ok:false, over:true, back, why:c1T('tt.cannot', { dep:c1Hm(t), back:c1Hm(back), close:c1Hm(e0) }).text[0] || `! Leaving at ${c1Hm(t)}, it would be back at ${c1Hm(back)}, after the day ends at ${c1Hm(e0)}.` };
  const others = c1LaneTrips(pl, j).filter(o => o.k !== k);
  if(k === null && others.length >= maxT) return { ok:false, back, why:`! The ${shortPlane(p)} already flies ${others.length} flights a day: its crew can't fly another.` };
  const o = others.find(z => t < z.arr + home && z.dep < back + home);
  if(o){ const before = o.dep < t; return { ok:false, back, why:before ? `! The plane is back from ${routeById(o.route).city} at ${c1Hm(o.arr)} and needs ${fmtDur(home)} on the ground: the earliest it can leave is ${c1Hm(o.arr + home)}.`
    : `! It would be back at ${c1Hm(back)}: with ${fmtDur(home)} on the ground it would miss the ${c1Hm(o.dep)} ${routeById(o.route).city} flight.` }; }
  if(k !== null){ // the engine's own check: the plan after the move must fit the day
    let got = null; const keepSet = setPlan, keepToast = toast, keepSel = UI.tlSel;
    try{ setPlan = (ii, nx) => { got = nx; }; toast = () => {}; c1Snap(() => editPlan(0, 'depTo', k, t, j)); }catch(e){ got = null; } finally { setPlan = keepSet; toast = keepToast; UI.tlSel = keepSel; }
    if(!got) return { ok:false, back, why:`! The flights after it would not be back before the day ends at ${c1Hm(e0)}.` }; }
  return { ok:true, back, why:c1T('tt.fits', { dep:c1Hm(t), back:c1Hm(back) }).text[0] || `✓ Fits · leaves ${c1Hm(t)}, back ${c1Hm(back)}` };
}

/* Who wants to fly: one route (or all of them) at its fare, band by band, lined up with the timetable's hours */
function c1WhoData(pl, ids){
  const go = () => { const fl = withPlan(pl, () => planFlights()).filter(f => !f.grounded && !f.homeLeg), out = BANDS.map(b => { const [h0, h1] = bandHours(b); return { b, h0, h1, n:0, deps:[] }; }); let flex = 0;
    ids.forEach(id => { const r = routeById(id); if(!r) return; const P = demandPools(r, pl.prices[id] || r.basePrice); out.forEach(o => { o.n += P[o.b] || 0; }); flex += P.flex || 0;
      fl.filter(f => f.route === id).forEach(f => { const o = out.find(z => z.b === (f.band || bandOf(f.dep))); if(o) o.deps.push({ dep:f.dep, id }); }); });
    out.forEach(o => { o.n = Math.round(o.n); o.deps.sort((a, b) => a.dep - b.dep); }); return { bands:out, flex:Math.round(flex) }; };
  const D = c1We() ? withDay(satOf(S.day || 1), go) : go(); D.total = D.bands.reduce((t, o) => t + o.n, 0) + D.flex; return D;
}
const C1_FIG = { lit:'<svg class="c1-fg lit" viewBox="0 0 10 16" aria-hidden="true"><circle cx="5" cy="3" r="2.6"/><path d="M1.2 15.4V9.2C1.2 7.2 2.6 6.2 5 6.2s3.8 1 3.8 3v6.2z"/></svg>',
  near:'<svg class="c1-fg near" viewBox="0 0 10 16" aria-hidden="true"><circle cx="5" cy="3" r="2.4"/><path d="M1.6 15V9.3C1.6 7.6 2.8 6.6 5 6.6s3.4 1 3.4 2.7V15z"/></svg>',
  any:'<svg class="c1-fg any" viewBox="0 0 10 16" aria-hidden="true"><circle cx="5" cy="3" r="2.3"/><path d="M1.6 15V9.3C1.6 7.6 2.8 6.6 5 6.6s3.4 1 3.4 2.7V15z"/></svg>' };
function c1WhoRoute(pl){ const ids = c1Flown(pl).length ? c1Flown(pl) : c1TrayIds(pl), U = UI.s2 || {}, g = c1Drag && c1Drag.moved ? c1Drag.route : null, s = UI.tlSel && UI.tlSel.i === 0 && pl.fleet[UI.tlSel.j] ? pl.fleet[UI.tlSel.j].sched[UI.tlSel.k] : null;
  const v = g || s || U.who || ids[0]; return v === 'all' ? null : ids.includes(v) ? v : ids[0] || null; }
function c1WhoHtml(pl, lit){
  const ids = c1Flown(pl).length ? c1Flown(pl) : c1TrayIds(pl); if(!ids.length) return '';
  const s0 = dayStart(), e0 = dayEnd(), span = e0 - s0, X = m => 100 * (Math.max(s0, Math.min(e0, m)) - s0) / span, rid = c1WhoRoute(pl), r = rid && routeById(rid);
  const D = c1WhoData(pl, rid ? [rid] : ids), cap = o => Math.max(8, Math.floor(13 * (o.h1 - o.h0))), unit = [1, 2, 5, 10, 20, 50, 100].find(u => D.bands.every(o => Math.ceil(o.n / u) <= cap(o)) && Math.ceil(D.flex / u) <= 36) || 100;
  const figs = (n, k) => { const c = n > 0 ? Math.max(1, Math.round(n / unit)) : 0; return C1_FIG[k].repeat(c); };
  const tm = d => c1Hm(d.dep), city = id => routeById(id).city;
  const bands = D.bands.map(o => { const on = o.deps.length > 0, cap1 = on ? (rid ? `✓ the ${tm(o.deps[0])} catches them` : o.deps.length === 1 ? `✓ the ${tm(o.deps[0])} to ${esc(city(o.deps[0].id))}` : `✓ ${o.deps.length} flights then`) : rid ? `no ${esc(r.city)} flight then` : 'no flight then';
    return `<div class="c1-wband ${on ? 'on' : ''} ${lit === o.b ? 'lit' : ''}" data-c1band="${o.b}" style="left:${X(o.h0 * 60).toFixed(3)}%;width:${(X(o.h1 * 60) - X(o.h0 * 60)).toFixed(3)}%"><div class="c1-wbi"><div class="c1-wbh"><b>${esc(BAND_SHORT[o.b] || o.b)}</b><small class="mono">${pad(o.h0)}:00–${pad(o.h1)}:00</small><em class="mono">${num(o.n)}</em></div>
      <div class="c1-wf">${figs(o.n, on ? 'lit' : 'near')}</div><p class="c1-wc ${on ? 'ok' : ''}">${cap1}</p></div></div>`; }).join('');
  const pick = ids.map(id => { const R = routeById(id), n = c1WhoData(pl, [id]).total; return `<button class="c1-wp ${rid === id ? 'on' : ''}" data-c1who="${id}" aria-pressed="${rid === id}">${flagSvg(R.flag, 16)}<b>${esc(R.city)}</b><span class="mono">${num(n)}</span></button>`; }).join('')
    + (ids.length > 1 ? `<button class="c1-wp ${rid ? '' : 'on'}" data-c1who="all" aria-pressed="${!rid}"><b>All routes</b><span class="mono">${num(c1WhoData(pl, ids).total)}</span></button>` : '');
  const title = r ? `${flagSvg(r.flag, 18)}<b>${esc(r.city)} at ${money(pl.prices[rid] || r.basePrice)}: ${num(D.total)} want to fly</b><span> · when they want to go</span>` : `<b>All your routes at your fares: ${num(D.total)} want to fly</b><span> · when they want to go</span>`;
  return `<section class="c1-who" id="c1Who" aria-label="Who wants to fly"><h3 class="c1-wh">Who wants to fly</h3><p class="c1-wt">${title}</p>
    <div class="c1-wl"><div class="c1-wps">${pick}</div><div class="c1-wkey"><span>${C1_FIG.lit}a flight then</span><span>${C1_FIG.near}takes the nearest</span><span>${C1_FIG.any}any flight</span>${unit > 1 ? `<small>each figure is ${unit} people</small>` : ''}</div></div>
    <div class="c1-wbs">${bands}</div><div class="c1-wany ${Math.round(D.flex / unit) > 24 ? 'dense' : ''}"><b>Any time</b><em class="mono">${num(D.flex)}</em><div class="c1-wf">${figs(D.flex, 'any')}</div></div></section>`;
}

/* the page: the top bar, Who wants to fly, the lanes, the tray and the key */
function c1TtHtml(pl, L){
  const U = UI.s2, view = UI.stView || 'day', s0 = dayStart(), e0 = dayEnd(), span = e0 - s0, X = m => (100 * (m - s0) / span).toFixed(3), setup = S.phase === 'setup';
  const cmp = !setup && (S.day || 1) >= 8 && WBS().compareLastWeek !== false, good = fillGood();
  const bar = `<div class="dk-pnl-h c1-ttbar"><div class="c1-ttt"><h1>Aircraft timetable</h1><p>${esc(S.airline && S.airline.name ? S.airline.name : 'Your airline')} HQ · ${setup ? 'Launch Day' : 'the week of ' + dateShort(S.day)}</p></div><span class="grow"></span>${s2DaySwitch()}
    <span class="st-seg" role="group" aria-label="Timetable view"><button data-stview="day" aria-pressed="${view === 'day'}">Day view</button><button data-stview="table" aria-pressed="${view === 'table'}">Table view</button></span>
    ${cmp ? `<button class="btn cmp-btn ${U.cmp ? 'on' : ''}" id="cmpLW" aria-pressed="${!!U.cmp}">${U.cmp ? 'Hide last week' : 'Compare with last week'}</button>` : ''}
    <span class="c1-ttact"><button class="btn" id="c1Undo" data-ashundo ${typeof ashUndoN === 'function' && ashUndoN() ? '' : 'disabled'} title="Take back your last change">&#8630; Undo</button><button class="btn" id="c1Menu" title="Show the menu, the routes and the fares">&#9776; Show menu</button></span></div>`;
  const sel = UI.tlSel && UI.tlSel.i === 0 && pl.fleet[UI.tlSel.j] && pl.fleet[UI.tlSel.j].sched[UI.tlSel.k] ? UI.tlSel : null;
  const ruler = []; for(let h = Math.ceil(s0 / 60); h * 60 <= e0; h += 2) ruler.push(`<span style="left:${X(h * 60)}%">${pad(h)}:00</span>`);
  const lane = (x, j) => { const p = planeById(x.planeId), T = c1LaneTrips(pl, j, L);
    const blocks = T.map(t => { const r = routeById(t.route), pct = Math.round(100 * Math.min(1, t.sold / Math.max(1, t.seats))), ok = t.sold / Math.max(1, t.seats) >= good, on = sel && sel.j === j && sel.k === t.k;
      return `${t.last ? '' : `<i class="c1-turn" style="left:${X(t.arr)}%;width:${(X(t.ready) - X(t.arr)).toFixed(3)}%" title="Turnaround: ready again at ${c1Hm(t.ready)}"></i>`}<button class="c1-blk ${ok ? 'full' : 'room'} ${on ? 'on' : ''} ${t.arr > e0 ? 'bad' : ''}" data-c1b="${j}|${t.k}" data-route="${t.route}" data-dep="${t.dep}" data-arr="${t.arr}" style="left:${X(t.dep)}%;width:${(X(t.arr) - X(t.dep)).toFixed(3)}%" aria-pressed="${!!on}" aria-label="${esc(r.city)} ${c1Hm(t.dep)} to ${c1Hm(t.arr)}, ${t.sold} of ${t.seats} seats filled. Drag to move it, or press Delete to remove it.">
        <span class="c1-grip" aria-hidden="true"></span><span class="c1-bh">${flagSvg(r.flag, 16)}<b>${esc(r.city)}</b><em class="mono">${t.sold}/${t.seats}</em></span><span class="c1-bar"><i style="width:${pct}%"></i></span><span class="c1-bt mono">${c1Hm(t.dep)}–${c1Hm(t.arr)}</span></button>`; }).join('');
    return `<div class="c1-row" data-c1row="${j}"><div class="c1-lc"><b>${ICO2.plane || ''}${esc(shortPlane(p))}</b><small>${esc(regOf(x.uid))} · ${p.seats} seats · ${plural(T.length, 'flight')}</small></div>
      <div class="ad-lane c1-lane" data-lane="${j}" data-s0="${s0}" data-span="${span}" style="--c1-hrs:${span / 60}">${blocks || '<span class="c1-none">No flights yet: drag a route from Add a flight onto this plane.</span>'}</div><span class="c1-msg" aria-live="polite"></span></div>`; };
  const tray = c1TrayIds(pl);
  const T0 = c1T('tt.tray'), tokens = tray.map(id => { const r = routeById(id), x = pl.fleet.find(y => planeCanFly(planeById(y.planeId), r)) || pl.fleet[0], trip = x ? TIME.roundTrip(planeById(x.planeId), r) : 0;
    return `<button class="c1-tok" data-c1add="${id}" title="Drag onto a plane to add a ${esc(r.city)} flight"><i class="c1-plus" aria-hidden="true">+</i>${flagSvg(r.flag, 16)}<span class="c1-tokt"><b>${esc(r.city)}</b><span>${fmtDur(trip)} there and back</span></span></button>`; }).join('');
  const K = c1T('tt.key', { open:c1Hm(s0), close:c1Hm(e0) });
  const key = `<div class="c1-ttkey"><span><i class="k full"></i>seats ${Math.round(good * 100)}% full or more</span><span><i class="k room"></i>room to spare</span><span><i class="k turn"></i>turnaround: no flight can start here</span><span class="c1-kn">${esc(K.text[0] || `Flights snap to the quarter hour · the day runs ${c1Hm(s0)} to ${c1Hm(e0)}`)}</span></div>`;
  const first = !(S.c1 && S.c1.ttSeen) && pl.fleet.some(x => x.sched.length) ? c1T('tt.first') : null;
  const co = first ? `<div class="c1-ttco" id="c1TtCo" role="note"><i class="c1-ttptr" aria-hidden="true"></i><span class="c1-coe">${esc(first.eyebrow || 'NEW')}</span><h3>${esc(first.title)}</h3>${first.text.map(t => `<p>${h21Html(t)}</p>`).join('')}<button class="bv-btn primary" id="c1TtGot">${esc(first.button || 'Got it')}</button></div>` : '';
  const body = view === 'table' ? `<div class="c1-tp c1-tbl">${studioTable(pl, L)}</div>`
    : `<div class="c1-tp"><div class="c1-ruler"><span></span><div class="c1-rt">${ruler.join('')}<i class="c1-dawn" aria-hidden="true"></i></div><span></span></div>${pl.fleet.map(lane).join('')}
      <div class="c1-tray"><div class="c1-lc"><b>${esc(T0.title || 'Add a flight')}</b><small>${esc(T0.text[0] || 'drag one onto a plane')}</small></div><div class="c1-toks">${tokens}<button class="dk-link c1-addr" id="s2AddNet">+ Add a route</button></div></div>${key}</div>`;
  const pop = view === 'day' && sel && UI.c1Pop === `${sel.j}|${sel.k}`;
  return `<div class="s2-tt c1-tt ${pop ? 'has-pop' : ''}" data-c1tt>${bar}${c1WhoHtml(pl, null)}${body}${pop ? s2SvcEditor(pl, L, sel) : ''}${view === 'day' ? co : ''}</div>`;
}
const c1Timetable0 = s2Timetable;
s2Timetable = function(pl, L){
  if(c1TtOn()) return c1TtHtml(pl, L);
  const h = c1Timetable0.apply(this, arguments);
  return ch1() && UI.s2 && UI.s2.mode === 'plan' ? h.replace('Aircraft timetable</h2></div>', 'Aircraft timetable</h2></div><button class="btn small c1-fullb" id="c1Full" title="Hide the menu and plan on the whole screen">&#10530; Full width</button>') : h;
};
const c1Plan0 = s2Plan;
s2Plan = function(pl, L, hid, setup, costed){
  if(!c1TtOn()) return c1Plan0.apply(this, arguments);
  return `<div class="plw st s2 s2-pl c1-ttw">${s2Timetable(pl, L)}${s2Summary(pl, L, hid)}${UI.s2.drawer ? s2Drawer(pl, L, hid) : ''}</div>`;
};
/* ↶ Undo is the plan page's own (p5u: every change on the plan step is kept until the step changes) */
/* a new flight at the time he dropped it: the engine adds it in the first gap, then moves it there (one change to Undo) */
function c1AddAt(j, id, t){
  const U = UI.s2, nd0 = U.newDays, before = JSON.stringify(currentPlan()), n0 = typeof ashUndoN === 'function' ? ashUndoN() : 0; if(S2V.fd) U.newDays = c1We() ? 'weekend' : (nd0 || 'all');
  try{ c1Snap(() => addService(0, id, j)); } finally { U.newDays = nd0; }
  const s = UI.tlSel; if(!s || JSON.stringify(currentPlan()) === before) return;
  const deps = actualDeps(currentPlan(), s.j); if(s.j !== j || deps[s.k] === t) return;
  c1Snap(() => moveService(0, s.j, s.k, t));
  if(UI.ashUndo && UI.ashUndo.list && UI.ashUndo.list.length > n0 + 1) UI.ashUndo.list.splice(n0 + 1);   // one change to take back
}

/* dragging: a block along its lane, or a route from the tray onto a lane */
let c1Drag = null;
function c1DragShow(g, row, t, trip, fit){
  const lane = row.querySelector('.c1-lane'), s0 = dayStart(), span = dayEnd() - s0, X = m => 100 * (m - s0) / span;
  let ln = lane.querySelector('.c1-start'); if(!ln){ ln = document.createElement('i'); ln.className = 'c1-start'; lane.appendChild(ln); }
  ln.style.left = X(t).toFixed(3) + '%'; ln.classList.toggle('bad', !fit.ok);
  let end = lane.querySelector('.c1-endl'); if(fit.over){ if(!end){ end = document.createElement('i'); end.className = 'c1-endl'; lane.appendChild(end); } } else if(end) end.remove();
  const msg = row.querySelector('.c1-msg'); msg.textContent = fit.why || ''; msg.className = 'c1-msg on ' + (fit.ok ? 'ok' : 'bad');
  const lw = lane.offsetWidth, x = lane.offsetLeft + lw * X(t) / 100, w = msg.offsetWidth, rw = row.offsetWidth;
  msg.style.left = Math.max(lane.offsetLeft, Math.min(rw - w - 4, fit.ok ? x : x - w / 2)) + 'px';
  const who = $('c1Who'); if(who){ const pl = currentPlan(); who.outerHTML = c1WhoHtml(pl, bandOf(t)); c1BindWho(); }
}
function c1DragClear(){ screen().querySelectorAll('.c1-start,.c1-endl,.c1-new').forEach(e => e.remove()); screen().querySelectorAll('.c1-msg').forEach(m => { m.className = 'c1-msg'; m.textContent = ''; }); const f = document.getElementById('c1Float'); if(f) f.remove(); }
function c1BindWho(){ screen().querySelectorAll('[data-c1who]').forEach(b => b.onclick = () => { UI.s2.who = b.getAttribute('data-c1who'); UI.tlSel = null; render(); }); }
function c1BindTt(){
  const root = screen(), tt = root.querySelector('[data-c1tt]'); if(!tt) return;
  on('c1Menu', () => { UI.s2.menu = true; render(); });
  c1BindWho();
  on('c1TtGot', () => { (S.c1 || (S.c1 = {})).ttSeen = S.day || 1; save(); render(); });
  root.querySelectorAll('[data-tlm]').forEach(b => b.onclick = () => { const [i, j, k, d] = b.getAttribute('data-tlm').split('|').map(Number), blk = root.querySelector(`[data-c1b="${j}|${k}"]`); if(blk) c1Snap(() => moveService(i, j, k, +blk.dataset.dep + (d > 0 ? C1_SNAP : -C1_SNAP))); });
  root.querySelectorAll('[data-tlrm]').forEach(b => b.onclick = () => { const [i, j, k] = b.getAttribute('data-tlrm').split('|').map(Number); UI.tlSel = null; editPlan(i, 'del', k, 0, j); });
  const s0 = dayStart(), span = dayEnd() - s0;
  root.querySelectorAll('.c1-blk[data-c1b]').forEach(b => {
    const [j, k] = b.getAttribute('data-c1b').split('|').map(Number), row = b.closest('.c1-row'), lane = b.closest('.c1-lane');
    b.onclick = e => { if(c1Drag && c1Drag.moved){ e.preventDefault(); return; } const same = UI.c1Pop === `${j}|${k}`; UI.tlSel = same ? null : { i:0, j, k }; UI.c1Pop = same ? null : `${j}|${k}`; UI.s2.who = b.dataset.route; UI.c1Focus = `${j}|${k}`; render(); };
    b.onkeydown = e => { const dep = +b.dataset.dep;
      if(e.key === 'ArrowLeft' || e.key === 'ArrowRight'){ e.preventDefault(); UI.tlSel = { i:0, j, k }; UI.c1Focus = `${j}|${k}`; c1Snap(() => moveService(0, j, k, dep + (e.key === 'ArrowLeft' ? -1 : 1) * (e.shiftKey ? 60 : C1_SNAP))); }
      else if(e.key === 'Delete' || e.key === 'Backspace'){ e.preventDefault(); UI.tlSel = null; editPlan(0, 'del', k, 0, j); } };
    b.onpointerdown = e => { if(e.button !== 0) return; const r = lane.getBoundingClientRect();
      c1Drag = { b, j, k, row, lane, x0:e.clientX, w:r.width, dep0:+b.dataset.dep, trip:+b.dataset.arr - +b.dataset.dep, route:b.dataset.route, moved:false, t:null, fit:null };
      try{ b.setPointerCapture(e.pointerId); }catch(err){} };
    b.onpointermove = e => { const g = c1Drag; if(!g || g.b !== b) return; const dx = e.clientX - g.x0; if(!g.moved && Math.abs(dx) < 4) return;
      if(!g.moved){ g.moved = true; const gh = b.cloneNode(true); gh.className = 'c1-blk c1-ghost'; gh.removeAttribute('data-c1b'); gh.setAttribute('aria-hidden', 'true'); lane.appendChild(gh); b.classList.add('drag'); UI.tlSel = null; }
      const ov = c1Over(e, b, j); lane.querySelectorAll('.c1-swap').forEach(x => { if(x !== ov) x.classList.remove('c1-swap'); }); const ov0 = g.over; g.over = ov ? +ov.getAttribute('data-c1b').split('|')[1] : null; if(ov0 !== g.over) g.t = null;
      if(ov){ ov.classList.add('c1-swap'); b.classList.remove('bad'); c1DragShow(g, row, +ov.dataset.dep, g.trip, { ok:true, why:`Swap with ${routeById(ov.dataset.route).city}: let go to swap them over` }); }
      const t = clamp(Math.round((g.dep0 + dx / g.w * span) / C1_SNAP) * C1_SNAP, s0, s0 + span - C1_SNAP);
      b.style.transform = `translate(${(t - g.dep0) / span * lane.offsetWidth}px,-3px)`; if(g.t === t) return; g.t = t;
      g.fit = c1Fit(j, k, g.route, t); b.classList.toggle('bad', !g.fit.ok); b.querySelector('.c1-bt').textContent = `${c1Hm(t)}–${c1Hm(t + g.trip)}`;
      if(g.fit.ok && typeof dsFillAt === 'function'){ try{ const v = dsFillAt(j, k, t); if(v){ b.querySelector('.c1-bh em').textContent = `${v.sold}/${v.seats}`; b.querySelector('.c1-bar i').style.width = Math.round(100 * Math.min(1, v.sold / Math.max(1, v.seats))) + '%'; b.classList.toggle('full', v.sold / Math.max(1, v.seats) >= fillGood()); b.classList.toggle('room', v.sold / Math.max(1, v.seats) < fillGood()); } }catch(err){} }
      if(g.over === null) c1DragShow(g, row, t, g.trip, g.fit); };
    b.onpointerup = b.onpointercancel = e => { const g = c1Drag; if(!g || g.b !== b) return; try{ b.releasePointerCapture(e.pointerId); }catch(err){}
      setTimeout(() => { c1Drag = null; }, 0);
      if(g.moved && g.over !== null && g.over !== undefined){ c1DragClear(); if(!c1Swap(j, k, g.over)) render(); return; }
      if(g.moved && g.t !== null && g.t !== g.dep0 && g.fit && g.fit.ok){ UI.tlSel = { i:0, j, k }; c1Snap(() => moveService(0, j, k, g.t)); } else if(g.moved){ c1DragClear(); render(); } };
  });
  root.querySelectorAll('[data-c1add]').forEach(tk => { const id = tk.getAttribute('data-c1add');
    tk.onclick = e => { if(c1Drag && c1Drag.moved) return; if(e.detail === 0) c1Snap(() => addService(0, id, null)); else toast('Drag it onto a plane to add a flight.'); };
    tk.onpointerdown = e => { if(e.button !== 0) return; c1Drag = { add:id, route:id, tk, x0:e.clientX, y0:e.clientY, moved:false, t:null, j:null, fit:null }; try{ tk.setPointerCapture(e.pointerId); }catch(err){} };
    tk.onpointermove = e => { const g = c1Drag; if(!g || g.tk !== tk) return; if(!g.moved && Math.hypot(e.clientX - g.x0, e.clientY - g.y0) < 5) return;
      if(!g.moved){ g.moved = true; UI.tlSel = null; const f = document.createElement('div'); f.id = 'c1Float'; f.className = 'c1-float'; f.innerHTML = tk.innerHTML; document.body.appendChild(f); }
      const f = document.getElementById('c1Float'); if(f){ f.style.left = (e.clientX - 14) + 'px'; f.style.top = (e.clientY - 16) + 'px'; }
      const row = [...root.querySelectorAll('.c1-row')].find(r => { const R = r.getBoundingClientRect(); return e.clientY >= R.top - 6 && e.clientY <= R.bottom + 6; }), lane = row && row.querySelector('.c1-lane');
      if(!lane){ if(g.j !== null){ c1DragClear(); const f2 = document.createElement('div'); f2.id = 'c1Float'; f2.className = 'c1-float'; f2.innerHTML = tk.innerHTML; f2.style.left = (e.clientX - 14) + 'px'; f2.style.top = (e.clientY - 16) + 'px'; document.body.appendChild(f2); } g.j = null; g.t = null; return; }
      const j = +row.getAttribute('data-c1row'), x = normPlan(currentPlan()).fleet[j], p = planeById(x.planeId), trip = TIME.roundTrip(p, routeById(id)), R = lane.getBoundingClientRect();
      const t = clamp(Math.round((s0 + (e.clientX - 12 - R.left) / R.width * span) / C1_SNAP) * C1_SNAP, s0, s0 + span - C1_SNAP);
      if(g.j === j && g.t === t) return; g.j = j; g.t = t; g.fit = c1Fit(j, null, id, t);
      const ff = document.getElementById('c1Float'); if(ff) ff.remove();
      let nb = lane.querySelector('.c1-new'); if(!nb){ const r = routeById(id); nb = document.createElement('div'); nb.className = 'c1-blk c1-new drag'; nb.innerHTML = `<span class="c1-grip"></span><span class="c1-bh">${flagSvg(r.flag, 16)}<b>${esc(r.city)}</b><em class="mono">${p.seats}</em></span><span class="c1-bar"><i style="width:0"></i></span><span class="c1-bt mono"></span>`; screen().querySelectorAll('.c1-new').forEach(z => z.remove()); lane.appendChild(nb); }
      nb.style.left = (100 * (t - s0) / span).toFixed(3) + '%'; nb.style.width = (100 * trip / span).toFixed(3) + '%'; nb.classList.toggle('bad', !g.fit.ok); nb.querySelector('.c1-bt').textContent = `${c1Hm(t)}–${c1Hm(t + trip)}`;
      root.querySelectorAll('.c1-row').forEach(r => { if(r !== row){ r.querySelectorAll('.c1-start,.c1-endl').forEach(z => z.remove()); const m = r.querySelector('.c1-msg'); m.className = 'c1-msg'; m.textContent = ''; } });
      c1DragShow(g, row, t, trip, g.fit); };
    tk.onpointerup = tk.onpointercancel = e => { const g = c1Drag; if(!g || g.tk !== tk) return; try{ tk.releasePointerCapture(e.pointerId); }catch(err){}
      setTimeout(() => { c1Drag = null; }, 0); const ok = g.moved && g.j !== null && g.fit && g.fit.ok;
      c1DragClear(); if(ok) c1AddAt(g.j, id, g.t); else if(g.moved) render(); };
  });
  if(UI.c1Focus){ const el = root.querySelector(`[data-c1b="${UI.c1Focus}"]`); UI.c1Focus = null; if(el) setTimeout(() => { try{ el.focus({ preventScroll:true }); }catch(e){} }, 20); }
}
/* the first-time note and the flight editor sit under the lane, pointing up at a block */
function c1TtPlace(){
  const root = screen(), tt = root.querySelector('[data-c1tt]'); if(!tt) return;
  const place = (el, blk) => { if(!el || !blk) return; const row = blk.closest('.c1-row'), T = tt.getBoundingClientRect(), sc = T.width / Math.max(1, tt.offsetWidth) || 1, B = blk.getBoundingClientRect(), Rr = row.getBoundingClientRect();
    const top = (Rr.bottom - T.top) / sc + 12, cx = (B.left + B.width / 2 - T.left) / sc, w = el.offsetWidth, left = Math.max(8, Math.min(tt.offsetWidth - w - 8, cx - w / 2));
    el.style.top = top + 'px'; el.style.left = left + 'px'; const ptr = el.querySelector('.c1-ttptr'); if(ptr) ptr.style.left = Math.max(14, Math.min(w - 28, cx - left - 8)) + 'px'; };
  const co = $('c1TtCo'), other = root.querySelector('.h21-co, .ash-co:not(.c1-ttco)');
  if(co && other){ co.remove(); }
  else if(co){ const bl = [...root.querySelectorAll('.c1-row[data-c1row="0"] .c1-blk[data-c1b]')], b = bl[Math.min(2, bl.length - 1)]; if(b){ b.classList.add('hov'); place(co, b); } else co.remove(); }
  const fl = tt.querySelector('.ds-flash'), onb = root.querySelector('.c1-blk.on'); if(fl && onb){ const T = tt.getBoundingClientRect(), sc = T.width / Math.max(1, tt.offsetWidth) || 1, B = (onb || root.querySelector('.c1-tp') || tt).getBoundingClientRect();
    fl.classList.add('c1-flash'); fl.style.left = Math.max(8, Math.min(tt.offsetWidth - fl.offsetWidth - 8, (B.left - T.left) / sc)) + 'px'; fl.style.top = Math.max(4, (B.top - T.top) / sc - 36) + 'px'; }
  const pop = $('s2Pop'); if(pop){ pop.classList.add('c1-pop'); if(co && co.isConnected) co.remove(); }
}
const c1Studio0 = renderStudio;
renderStudio = function(){
  const r = c1Studio0.apply(this, arguments);
  try{ const root = screen(); on('c1Full', () => { UI.s2.menu = false; UI.tlSel = null; render(); });
    if(c1TtOn() && root.querySelector('[data-c1tt]')){ const sh = root.querySelector('.dshell'); if(sh) sh.classList.add('c1-full'); c1BindTt(); c1TtPlace(); } }catch(e){ console.error(e); }
  return r;
};

/* ---------- 8. the Briefings shelf (hand-off 2, section 8): teacher test mode only ----------
   A Briefings item at the foot of the menu (TEST tag) opens a page of every chapter-one briefing in the workbook with its
   status chip (IN PLAY, TEST ONLY, PARKED) and Watch ▶. Watching one changes nothing: the briefing part puts its seen list
   back afterwards, and nothing goes in the pupil record. The kind word is not in the workbook yet (Briefings has no kind
   column): it comes from Claude Design's picture until Fable adds one. */
const C1_BF_KIND = { how_airline_makes_money:'ORIENTATION', fare_lever:'TOOL', fuel_cash_tank_profit:'ORIENTATION', weekend_demand:'DISCOVERY', aircraft_efficiency:'TOOL', cash_to_fly:'DISCOVERY',
  tenths_stay:'DISCOVERY', rival_split:'DISCOVERY', flight_time:'TOOL', event_weekend:'DISCOVERY', seasons:'DISCOVERY', time_of_day:'DISCOVERY', cabin_sales:'TOOL', forecast_promise:'DISCOVERY' };
const C1_BOOK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M3 5.5c3-1.2 6-1.2 9 .8v13c-3-2-6-2-9-.8z"/><path d="M21 5.5c-3-1.2-6-1.2-9 .8v13c3-2 6-2 9-.8z"/></svg>';
const c1ShelfOn = () => !!(typeof settings !== 'undefined' && settings.testMode);
function c1ShelfRows(){
  // hand-off 3, section 7: the master plan's briefings 1-12 (IN PLAY or PARKED) and the TEST ONLY one; nothing without a number (Snacks on board)
  return ((typeof WB !== 'undefined' && WB.briefingShelf) || []).filter(b => ['live', 'test', 'parked'].includes(b.state) && (b.state === 'test' || (b.cowork >= 1 && b.cowork <= 12)))
    .sort((a, b) => (a.cowork || 99) - (b.cowork || 99));
}
function c1Plays(b){ if(b.state === 'test') return 'Not triggered in play';
  let t = String(b.trigger || '').split(/\s·\s|\(/)[0].replace(/[.\s]+$/, '').trim(); if(t.length > 40) t = t.split(',')[0].trim();
  if(t.length > 40){ t = t.slice(0, 40).replace(/\s+\S*$/, '') + '…'; } return t || '—'; }
function c1ShelfRender(){
  const T = c1T('shelf'), built = id => !!(window.__bf && window.__bf.built && window.__bf.built(id));
  const chip = { live:['IN PLAY', 'live'], test:['TEST ONLY', 'test'], parked:['PARKED', 'parked'] };
  const tiles = c1ShelfRows().map(b => { const [w, c] = chip[b.state], ok = built(b.id);
    return `<section class="c1-bft"><div class="c1-bfh"><span class="c1-bfk">${esc(C1_BF_KIND[b.id] || 'BRIEFING')}</span><span class="c1-chip ${c}">${w}</span></div><h3>${esc(b.title)}</h3><p title="${esc(b.trigger || '')}">Plays: ${esc(c1Plays(b))}</p>
      ${ok ? `<button class="btn c1-bfw" data-c1watch="${esc(b.id)}">Watch &#9654;</button>` : '<span class="c1-bfn">Not built yet</span>'}</section>`; }).join('');
  screen().innerHTML = shell(deskPage({ title:esc(T.title || 'Briefings'), sub:esc((T.text || [])[0] || ''), cls:'c1-shelf', body:`<div class="c1-bfg">${tiles}</div>` }),
    deskBar('Teacher test mode · Briefings', `<button class="btn big" id="c1ShelfBack">${esc(T.button || '◀ Back to the game')}</button>`));
  screen().querySelectorAll('[data-c1watch]').forEach(b => b.onclick = () => { if(window.__bf && window.__bf.shelf) window.__bf.shelf(b.getAttribute('data-c1watch')); });
  on('c1ShelfBack', () => { UI.view = null; render(); });
}
const c1RenderView1 = renderView;
renderView = function(v){ if(v === 'briefings'){ if(c1ShelfOn()){ c1ShelfRender(); return; } UI.view = null; return c1RenderView1.call(this, null); } return c1RenderView1.apply(this, arguments); };
const c1Shell0 = shell;
shell = function(inner, bar){
  const h = c1Shell0.apply(this, arguments); if(!c1ShelfOn()) return h;
  const on = UI.view === 'briefings', item = `<button class="nv c1-nvb ${on ? 'on' : ''}" data-nav="briefings" title="Briefings: watch any briefing (teacher test mode)" aria-current="${on ? 'page' : 'false'}">${C1_BOOK}<span class="nv-t"><b>Briefings <i class="c1-tag">TEST</i></b><small>Watch any briefing</small></span></button>`;
  const i = h.indexOf('<div class="nv-art">'); return i < 0 ? h : h.slice(0, i) + item + h.slice(i);
};
