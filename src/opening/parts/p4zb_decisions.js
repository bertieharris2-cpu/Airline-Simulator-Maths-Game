/* ==================================================================
   Workbook v4.7 (Fable's brief "The second-aircraft decision, and reviews that ask for method not arithmetic", 12 Oct 2026).
   Part A: the engine figures for the week-2 decision (D62). Every figure is the game's own: the existing aircraft keep
   their services except the route that turns people away, and each candidate aircraft flies its best plan on that route
   (the fare and the number of services that earn the most). "Extra profit" is the two-plane day against today's plan.
   ================================================================== */
let DEMAND_X = null;   // a what-if demand multiplier by route ("If Dublin grows"); null in play
function demandMult(route, day){ const v = demandMultNews(route, day); return DEMAND_X && DEMAND_X[route.id] ? v * DEMAND_X[route.id] : v; }
const AC_NEW = 9901;   // the candidate aircraft's uid inside a dry run
/* the route that turned most people away last week (people a day who wanted to fly and could not get a seat) */
function acProblem(){
  const to = S.day - 1, from = Math.max(1, to - 6), by = {};
  (S.history || []).filter(h => h.type !== 'setup' && h.from >= from && h.to <= to).forEach(h => Object.keys(h.routes || {}).forEach(id => { const y = h.routes[id], x = by[id] || (by[id] = { want:0, pax:0 }); x.want += y.want || 0; x.pax += y.pax || 0; }));
  const days = Math.max(1, to - from + 1), ids = Object.keys(by).sort((a, b) => (by[b].want - by[b].pax) - (by[a].want - by[a].pax));
  const id = ids[0] || (typeof otherRoute === 'function' ? otherRoute() : S.market);
  return { id, away: by[id] ? Math.round((by[id].want - by[id].pax) / days) : 0, days };
}
/* the existing aircraft without the problem route */
function acBasePlan(rid){
  const pl = normPlan(JSON.parse(JSON.stringify(currentPlan())));
  pl.fleet.forEach((x, j) => { const deps = x.sched.length ? (x.deps && x.deps.length === x.sched.length ? x.deps : actualDeps(pl, j)) : []; const keep = x.sched.map((s, k) => s === rid ? -1 : k).filter(k => k >= 0); x.sched = keep.map(k => x.sched[k]); x.deps = keep.length ? keep.map(k => deps[k]) : null; });
  return normPlan(pl);
}
/* departure times for n services: the engine's own chain, and one service in each of n demand bands (early, mid-morning, midday, afternoon, evening) */
const AC_TIMES = [420, 600, 780, 960, 1080];
function acDepSets(p, r, n){
  const out = [null], pick = (from, k, acc) => { if(acc.length === k){ out.push(acc.slice()); return; } for(let i = from; i < AC_TIMES.length; i++){ acc.push(AC_TIMES[i]); pick(i + 1, k, acc); acc.pop(); } };
  pick(0, n, []);
  const s0 = dayStart() + 60, e0 = dayEnd() - TIME.roundTrip(p, r);   // and the day spread evenly from 07:00 to the last departure that gets home
  if(n > 1){ const gap = Math.floor((e0 - s0) / (n - 1) / 10) * 10; if(gap > 0) out.push(Array.from({ length:n }, (_, k) => s0 + k * gap)); }
  return out;
}
/* inside a dry run at the day already set: the candidate's best plan on route rid; o.base = the plan without it */
function acBestOn(pid, rid, base){
  const p = planeById(pid), r = routeById(rid); if(!r || !planeCanFly(p, r)) return null;
  S.fleet = S.fleet.filter(x => x.uid !== AC_NEW); const L1 = planLines(base), F = r.fares || [r.basePrice];   // the plan without the new aircraft: its own profit carries its day cost
  S.fleet.push({ uid:AC_NEW, planeId:pid, route:null, schedule:[], deps:null, layout:'standard', grounded:false });
  let best = null;
  for(const fare of F) for(let n = 1; n <= (WORLD.maxTrips || 4); n++) for(const deps of acDepSets(p, r, n)){
    const pl = normPlan(Object.assign({}, base, { prices:Object.assign({}, base.prices, { [rid]:fare }), fleet:base.fleet.concat([{ uid:AC_NEW, planeId:pid, sched:Array(n).fill(rid), deps }]) }));
    const x = pl.fleet[pl.fleet.length - 1]; let fits = false; try{ fits = withPlan(pl, () => fitsFor(x)); }catch(e){} if(!fits) continue;
    if(deps) x.deps = actualDeps(pl, pl.fleet.length - 1);
    const L = planLines(pl), own = L.v.profit - L1.v.profit; if(best && own <= best.own) continue;
    const fl = withPlan(pl, () => planFlights()).filter(z => z.uid === AC_NEW);
    best = { own, fare, n, deps:x.deps ? x.deps.slice() : null, total:L.v.profit, plan:pl, sold:fl.map(z => z.sold), seats:fl.reduce((t, z) => t + z.seats, 0), pax:fl.reduce((t, z) => t + z.sold, 0),
      rev:L.v.rev - L1.v.rev, tk:fl.reduce((t, z) => t + z.revenue, 0), cost:L.v.cost - L1.v.cost, max:fl.reduce((t, z) => t + z.seats * z.price, 0), fuelL:fl.reduce((t, z) => t + z.fuelL, 0) };
  }
  return best;
}
const atDay = (d, fn) => withDay(d, () => withBeat(beatAt(d), () => { const k = S.day; S.day = d; try{ return fn(); } finally { S.day = k; } }));
/* the whole comparison, cached for the screen */
function acCompare(force){
  const key = JSON.stringify([S.day, planKey(currentPlan()), Math.round(S.cash), DEMAND_X]);
  if(!force && UI.acCmp && UI.acCmp.key === key) return UI.acCmp.v;
  const prob = acProblem(), rid = prob.id, ids = ['dhc6', 'sf34', 'at72'].filter(id => planeById(id) && shopPlanes().some(p => p.id === id));
  const v = dryRun(() => {
    const today = planLines(currentPlan()).v.profit, base = acBasePlan(rid);
    const cands = ids.map(pid => { const b = acBestOn(pid, rid, base); return { pid, b, extra: b ? Math.round(b.total - today) : null }; });
    /* where could it fly: the new aircraft's own profit a day on the routes opening in the next weeks */
    const where = [{ w:{ rid, day:S.day, label:'Today' }, by:cands.map(c => c.b ? Math.round(c.b.own) : null) }].concat(whereSoon(ids));
    return { prob, rid, today:Math.round(today), cands, where };
  });
  UI.acCmp = { key, v }; return v;
}
/* the routes in "Where could it fly?" (whereCouldItFly: today, week 3, week 4): today's problem route, then the routes
   opening in each of the next two weeks, the two most profitable for any candidate in the first week and the best in the second */
function whereRoutes(){ return [{ rid:acProblem().id, day:S.day, label:'Today' }]; }
function whereSoon(ids){
  const wk = weekNo(S.day), out = [];
  [[wk + 1, 2], [wk + 2, 1]].forEach(([w, keep]) => {
    const rs = (WORLD.routes || []).filter(r => r.openDay && r.openDay > S.day && weekNo(r.openDay) === w);
    const scored = rs.map(r => { const by = ids.map(pid => atDay(r.openDay, () => { const b = acBestOn(pid, r.id, acBasePlan(r.id)); return b ? Math.round(b.own) : null; }));
      return { w:{ rid:r.id, day:r.openDay, label:`Week ${w}` }, by, top:Math.max(...by.map(v => v === null ? -1e9 : v)) }; }).sort((a, b) => b.top - a.top).slice(0, keep);
    out.push(...scored); });
  return out;
}
/* "If Dublin grows": the problem route's demand × m, each candidate's best plan there */
function acGrow(m){
  const key = S.day + '|' + m; if(UI.acGrow && UI.acGrow.key === key) return UI.acGrow.v;
  const C = acCompare(), rid = C.rid;
  const v = dryRun(() => { DEMAND_X = { [rid]:m }; try{ const base = acBasePlan(rid); return C.cands.map(c => { const b = acBestOn(c.pid, rid, base); return b ? { own:Math.round(b.own), fare:b.fare, n:b.n, pax:b.pax, seats:b.seats } : null; }); } finally { DEMAND_X = null; } });
  UI.acGrow = { key, v }; return v;
}

/* ==================================================================
   Part B: Screen 1, "Which aircraft should we add?" (D62). Nothing is labelled best: the descriptors are derived from
   the figures (the lowest price: low commitment; the most extra profit today: fits today's market; the most profit on a
   route opening within four weeks: a bet on that route).
   ================================================================== */
const AC_ROWS = [['seats', 'Seats', 'cap'], ['price', 'Price to buy', 'cash'], ['max', 'If every seat was sold', 'rev'], ['market', "With today's market", 'cap'], ['exp', 'Expected ticket revenue', 'rev'], ['cost', 'Operating cost a day', 'profit'], ['extra', 'Extra profit a day', 'profit'], ['cash', 'Cash position', 'cash'], ['payback', 'Pays for itself in', 'payback']];
const AC_HL = [['cap', 'Capacity'], ['rev', 'Revenue'], ['profit', 'Profit'], ['cash', 'Cash left'], ['payback', 'Payback']];
const NUMW = ['no', 'one', 'two', 'three', 'four', 'five'];
function acOffer(pid){ return shopOffer(planeById(pid)); }
function acLabels(C){
  const ok = C.cands.filter(c => c.b), lab = {};
  const cheap = ok.slice().sort((a, b) => acOffer(a.pid).price - acOffer(b.pid).price)[0];
  const fits = ok.slice().sort((a, b) => b.extra - a.extra)[0];
  if(fits) lab[fits.pid] = "FITS TODAY'S MARKET";
  if(cheap && !lab[cheap.pid]) lab[cheap.pid] = 'LOW COMMITMENT';
  C.where.slice(1).forEach(w => { const i = w.by.indexOf(Math.max(...w.by.map(v => v === null ? -1e9 : v))), c = C.cands[i]; if(c && !lab[c.pid] && w.by[i] > (C.where[0].by[i] || 0)) lab[c.pid] = `A BET ON ${routeById(w.w.rid).city.toUpperCase()}`; });
  ok.forEach(c => { if(!lab[c.pid]) lab[c.pid] = ''; }); return lab;
}
function acGiveUp(c, C){
  const p = planeById(c.pid), o = acOffer(c.pid), r = routeById(C.rid), want = c.b ? paxWant(r, c.b.fare) : 0, left = c.b ? Math.max(0, want - c.b.pax) : 0, cheapest = C.cands.every(x => acOffer(x.pid).price >= o.price);
  if(!c.b) return `It cannot reach ${r.city}.`;
  if(c.extra < 0){ const fut = C.where.slice(1).filter(w => w.by[C.cands.indexOf(c)] > 0).sort((a, b) => b.by[C.cands.indexOf(c)] - a.by[C.cands.indexOf(c)])[0];
    return `Loses money on ${r.city} today; you'd be paying for empty seats${fut ? ` until ${routeById(fut.w.rid).city} opens` : ''}.`; }
  if(!o.canBuy) return 'You can\'t buy it outright yet: it means renting or finance, which costs money every day.';
  if(cheapest && left > 0) return `Keeps the most cash, but ${left > 5 ? 'many' : 'some'} ${r.city} passengers still won't get a seat.`;
  return `Spends ${money(o.price)} of cash that could buy fuel or a later aircraft.`;
}
function acDots(pax, seats){ return `<span class="acx-dots" role="img" aria-label="${pax} of ${seats} seats filled">${Array.from({ length:seats }, (_, i) => `<i class="${i < pax ? 'on' : ''}"></i>`).join('')}</span>`; }
function acCashBar(o){
  const cash = Math.max(0, Math.round(S.cash)), res = WORLD.cashReserve || 0, need = o.price + res, tot = Math.max(cash, need), w = v => (100 * v / tot).toFixed(1) + '%';
  if(need <= cash) return `<div class="acx-bar" role="img" aria-label="Buying leaves ${money(cash - need)} after the reserve"><i class="p" style="width:${w(o.price)}"></i><i class="r" style="width:${w(res)}"></i><i class="l" style="width:${w(cash - need)}"></i></div><small>${money(o.price)} · reserve ${money(res)} · <b class="good">${money(cash - need)} left</b></small>`;
  return `<div class="acx-bar" role="img" aria-label="Buying would break the reserve by ${money(need - cash)}"><i class="p" style="width:${w(Math.min(o.price, cash))}"></i><i class="x" style="width:${w(need - cash)}"></i></div><small class="bad">Not enough cash to buy outright: ${money(need - cash)} short. You could rent or finance it (next screen).</small>`;
}
function acWaterfall(b){
  const vals = [['Max revenue', b.max, 'a'], ['Expected', b.tk, 'b'], ['Costs', -b.cost, 'c'], ['Profit', b.own, b.own >= 0 ? 'd' : 'e']], mx = Math.max(b.max, 1), H = 44, y = v => Math.round(H * Math.abs(v) / mx);
  let run = b.tk; const bars = vals.map(([l, v, k], i) => { let top, h; if(i < 2){ h = y(v); top = H - h; } else if(i === 2){ h = y(v); top = H - y(run); run += v; } else { h = y(v); top = v >= 0 ? H - h : H; }
    return `<div class="wf-b ${k}"><span class="wf-v">${v < 0 && i === 2 ? '−' : ''}${money(Math.abs(Math.round(v))).replace('−', '')}</span><div class="wf-col"><i style="top:${top}px;height:${Math.max(2, h)}px"></i></div><span class="wf-l">${l}</span></div>`; }).join('');
  return `<div class="acx-wf" aria-label="Maximum revenue, expected revenue, minus operating costs, profit on the route">${bars}</div>`;
}
function acColHtml(c, C, lab){
  const p = planeById(c.pid), o = acOffer(c.pid), b = c.b, r = routeById(C.rid), cell = (k, v, extra) => `<div class="acx-r hl-${AC_ROWS.find(x => x[0] === k)[2]} ${k === 'extra' ? 'key' : ''}" data-row="${k}"><span>${AC_ROWS.find(x => x[0] === k)[1]}</span>${v}${extra || ''}</div>`;
  const pay = !b || c.extra <= 0 ? '<b class="bad">never, on today\'s routes</b>' : `<b>${Math.ceil(o.price / c.extra)} days</b>`;
  const plan = b ? `${NUMW[b.n] || b.n} ${r.city} service${b.n === 1 ? '' : 's'} at ${money(b.fare)}` : `cannot reach ${r.city}`;
  return `<section class="acx-col" data-acp="${c.pid}"><div class="acx-h"><div class="acx-pic">${plainArt(p)}</div><div class="acx-t"><h2>${esc(p.name)}</h2>${lab[c.pid] ? `<span class="acx-tag">${esc(lab[c.pid])}</span>` : ''}</div></div>
    <div class="acx-rows">${cell('seats', `<b>${p.seats}</b>`)}${cell('price', `<b>${money(o.price)}</b>`)}${cell('max', b ? `<b>${money(b.max)}</b>` : '—', b ? `<small>${b.seats} seats × ${money(b.fare)}</small>` : '')}
      ${cell('market', b ? `<b>${b.pax} of ${b.seats}</b>` : '—', b ? acDots(b.pax, b.seats) : '')}${cell('exp', b ? `<b>${money(b.tk)}</b>` : '—', `<small>${esc(plan)}</small>`)}${cell('cost', b ? `<b class="bad">−${money(Math.round(b.cost))}</b>` : '—', '<small>fuel, flying, airport, its day</small>')}
      ${cell('extra', `<b class="${c.extra >= 0 ? 'good' : 'bad'}">${c.extra === null ? '—' : (c.extra >= 0 ? '+' : '−') + money(Math.abs(c.extra))}</b>`, '<small>against today\'s plan</small>')}${cell('cash', '', acCashBar(o))}${cell('payback', pay)}</div>
    ${b ? acWaterfall(b) : ''}<p class="acx-give"><span>What you give up</span>${esc(acGiveUp(c, C))}</p>
    <button class="btn acx-go" data-acc="${c.pid}" ${b ? '' : 'disabled'}>Choose the ${esc(shortPlane(p))}</button></section>`;
}
function acConnectors(C){
  const ok = C.cands.filter(c => c.b).sort((a, b) => acOffer(a.pid).price - acOffer(b.pid).price), out = [];
  for(let i = 1; i < ok.length; i++){ const a = ok[i - 1], b = ok[i], pa = planeById(a.pid), pb = planeById(b.pid), dp = acOffer(b.pid).price - acOffer(a.pid).price, ds = pb.seats - pa.seats, dx = b.extra - a.extra, dpax = b.b.pax - a.b.pax;
    const svc = b.b.n !== a.b.n ? ` (${NUMW[b.b.n] || b.b.n} ${b.b.n === 1 ? 'big service' : 'services'} instead of ${NUMW[a.b.n] || a.b.n})` : '';
    out.push(`<div class="acx-cn"><span class="acx-cn-h">${esc(shortPlane(pa))} → ${esc(shortPlane(pb))}</span>Spend <b>${money(dp)}</b> more: <b>+${ds} seats</b>${dpax < 0 ? `, but <b class="bad">${-dpax} fewer passengers</b> on ${routeById(C.rid).city} today${svc}` : ''}, ${dx >= 0 ? `<b class="good">+${money(dx)}</b> extra profit a day` : `and <b class="bad">${money(-dx)} a day less profit</b>`}.</div>`); }
  return out.join('');
}
function acWhereHtml(C){
  const tab = UI.acTab || 'where', head = `<div class="acx-tabs" role="tablist"><button role="tab" data-actab="where" class="${tab === 'where' ? 'on' : ''}" aria-selected="${tab === 'where'}">Where could it fly?</button><button role="tab" data-actab="grow" class="${tab === 'grow' ? 'on' : ''}" aria-selected="${tab === 'grow'}">If ${esc(routeById(C.rid).city)} grows</button></div>`;
  const names = C.cands.map(c => shortPlane(planeById(c.pid)));
  if(tab === 'where'){
    return head + `<table class="dk-t acx-wt"><thead><tr><th>Profit a day on</th>${names.map(n => `<th class="num">${esc(n)}</th>`).join('')}</tr></thead><tbody>${C.where.map(w => { const r = routeById(w.w.rid), mx = Math.max(...w.by.map(v => v === null ? -1e9 : v));
      return `<tr><td><b>${esc(r.city)}</b><small>${w.w.label === 'Today' ? 'today' : `${esc(w.w.label)} · opens ${dateShort(w.w.day)}`}</small></td>${w.by.map(v => `<td class="num ${v === mx && v > 0 ? 'top' : ''} ${v !== null && v < 0 ? 'bad' : ''}">${v === null ? '<small>out of range</small>' : money(v)}</td>`).join('')}</tr>`; }).join('')}</tbody></table>
      <p class="acx-note">The new aircraft's own profit a day (after its day cost) on its best plan for each route, at that week's fuel price.</p>`;
  }
  const m = UI.acM || 1, G = acGrow(m), mx = Math.max(1, ...G.map(g => g ? Math.abs(g.own) : 0));
  return head + `<div class="acx-grow"><label>${esc(routeById(C.rid).city)} demand <b>×${m.toFixed(1)}</b><input type="range" id="acGrowIn" min="1" max="2" step="0.1" value="${m}" aria-label="${esc(routeById(C.rid).city)} demand multiplier"></label>
    ${G.map((g, i) => `<div class="acx-gb"><span>${esc(names[i])}</span><div class="acx-gt"><i class="${g && g.own < 0 ? 'neg' : ''}" style="width:${g ? Math.max(2, Math.round(100 * Math.abs(g.own) / mx)) : 0}%"></i></div><b class="${g && g.own < 0 ? 'bad' : ''}">${g ? money(g.own) : '—'}</b><small>${g ? `${NUMW[g.n] || g.n} × ${money(g.fare)} · ${g.pax} of ${g.seats}` : ''}</small></div>`).join('')}
    <p class="acx-note">Profit a day on ${esc(routeById(C.rid).city)} if more people want to fly. More services carry more people; a bigger aircraft does not create them.</p></div>`;
}
function renderAcCompare(){
  const C = acCompare(), lab = acLabels(C), r = routeById(C.rid), hl = UI.acHl || null;
  const sub = `<b>We have a capacity problem.</b> Last week about <b>${C.prob.away}</b> passengers a day wanted to fly to ${esc(r.city)} and couldn't get a seat. Cash <b class="gold">${money(Math.round(S.cash))}</b> · emergency reserve ${money(WORLD.cashReserve || 0)}. A second plane could carry more people, but every plane costs money to get and money to run.`;
  const ctl = `<div class="acx-ctl" role="group" aria-label="Compare one row"><span>Compare one row</span>${AC_HL.map(([k, l]) => `<button data-achl="${k}" class="${hl === k ? 'on' : ''}" aria-pressed="${hl === k}">${l}</button>`).join('')}</div>`;
  const body = `<div class="acx ${hl ? 'hl' : ''}" data-hl="${hl || ''}"><div class="acx-cols">${C.cands.map(c => acColHtml(c, C, lab)).join('')}</div>
    <aside class="acx-side"><section class="dk-pnl">${acWhereHtml(C)}</section><section class="dk-pnl acx-cns"><div class="dk-pnl-h">${ICO2.swap}<h2>What the extra money buys</h2></div>${acConnectors(C)}</section>
    <p class="acx-oc"><b>Opportunity cost:</b> what you give up when you choose one option instead of another.</p></aside></div>`;
  screen().innerHTML = shell(deskPage({ title:'Which aircraft should we add?', sub, cls:'acx-page', body:ctl + body }),
    deskBar('Compare the three aircraft, then choose one. Next you choose how to pay: rent, finance or buy.', `${backBtn()}<button class="btn big" id="skipShop">Not today</button>`));
  const root = screen();
  root.querySelectorAll('[data-achl]').forEach(b => b.onclick = () => { const k = b.getAttribute('data-achl'); UI.acHl = UI.acHl === k ? null : k; render(); });
  root.querySelectorAll('[data-actab]').forEach(b => b.onclick = () => { UI.acTab = b.getAttribute('data-actab'); render(); });
  const gi = $('acGrowIn'); if(gi) gi.onchange = () => { UI.acM = Math.round(+gi.value * 10) / 10; render(); };
  root.querySelectorAll('[data-acc]').forEach(b => b.onclick = () => { const pid = b.getAttribute('data-acc'), c = C.cands.find(x => x.pid === pid); if(!c || !c.b) return;
    S.rnd.shopPick = pid; S.rnd.acChoice = { pid, rid:C.rid, fare:c.b.fare, n:c.b.n, deps:c.b.deps, extra:c.extra, own:Math.round(c.b.own) };
    S.steps = S.steps.filter(x => !['fleetSums', 'acquire'].includes(x.t)); const k = S.steps.findIndex(x => x.t === 'shop2'); S.steps.splice(k + 1, 0, { t:'acquire' }); UI.justDone = null; advance(); });
  on('skipShop', () => { S.steps = S.steps.filter(x => !['fleetSums', 'acquire'].includes(x.t)); delete S.rnd.shopPick; delete S.rnd.acChoice; UI.justDone = null; advance(); });
}
/* the week-2 decision replaces the showroom when the airline has one aircraft and the three are for sale */
function acCompareOn(){ return weekMode() && !!WBS().secondAircraftCompare && S.fleet.length === 1 && ['dhc6', 'sf34', 'at72'].every(id => shopPlanes().some(p => p.id === id)); }
const shopDesk0 = R.shop2;
R.shop2 = st => { if(acCompareOn()) return renderAcCompare(); return shopDesk0(st); };

/* ==================================================================
   Part C: Screen 2, "How should we get it?" for the chosen aircraft: rent, finance or buy. The first time, the rent-or-buy
   sum (price ÷ rent a day) is a Calculate sign-off: short division, or make the sum smaller.
   ================================================================== */
function acRbDue(pid){ const sk = skills().rentOrBuy; return !(sk && (sk.planes || []).includes(pid)); }
function renderAcPay(st){
  const ch = S.rnd.acChoice, p = planeById(ch.pid), o = acOffer(ch.pid), cash = Math.round(S.cash), res = WORLD.cashReserve || 0, pick = st.pick, due = st.rbDue !== undefined ? st.rbDue : (st.rbDue = !!(acRbDue(p.id) && o.lease && o.price)), ok = !due || st.rbOk;
  const days = o.lease ? o.price / o.lease : null, d30 = Math.min(30, o.n || 30);
  const col = (k, l, rows, enabled, note) => `<button class="acq-col ${pick === k ? 'on' : ''}" data-terms="${k}" ${enabled && ok ? '' : 'disabled'} aria-pressed="${pick === k}"><h2>${l}</h2>${rows.map(([a, b, cls]) => `<div class="acq-r"><span>${a}</span><b class="${cls || ''}">${b}</b></div>`).join('')}${note ? `<p class="acq-n">${note}</p>` : ''}</button>`;
  const rentRows = [['Pay today', '£0'], ['Ongoing', `${money(o.lease)} a day`], ['Cash left today', money(cash)], ['Total paid after 30 days', money(o.lease * 30)], ['Extra profit a day after payments', `${ch.extra - o.lease >= 0 ? '+' : '−'}${money(Math.abs(ch.extra - o.lease))}`, ch.extra - o.lease >= 0 ? 'good' : 'bad'], ['Can give it back?', 'Yes']];
  const finRows = [['Pay today', money(o.deposit)], ['Ongoing', `${money(o.pay)} a ${o.unit} for ${o.n} ${o.unit}s`], ['Cash left today', money(cash - o.deposit), cash - o.deposit < res ? 'bad' : ''], ['Total paid after 30 days', money(o.deposit + o.pay * d30)], ['Extra profit a day after payments', `${ch.extra - o.daily >= 0 ? '+' : '−'}${money(Math.abs(Math.round(ch.extra - o.daily)))}`, ch.extra - o.daily >= 0 ? 'good' : 'bad'], ['Can give it back?', 'No']];
  const buyRows = [['Pay today', money(o.price)], ['Ongoing', '£0'], ['Cash left today', money(cash - o.price), cash - o.price < res ? 'bad' : ''], ['Total paid after 30 days', money(o.price)], ['Extra profit a day after payments', `${ch.extra >= 0 ? '+' : '−'}${money(Math.abs(ch.extra))}`, ch.extra >= 0 ? 'good' : 'bad'], ['Can give it back?', 'No']];
  const buyNote = o.canBuy ? '' : `<span class="bad">${money(o.price)}: ${esc(saveUpText(o.saveUp))}.</span> Keep the ${money(res)} reserve.`;
  const meths = [['short', 'Short division'], ['small', 'Make the sum smaller']], m = st.rbM || 'short', z = (() => { let a = o.price, b = o.lease, k = 0; while(a % 10 === 0 && b % 10 === 0){ a /= 10; b /= 10; k++; } return { a, b, k }; })();
  const rb = due ? `<section class="dk-pnl acq-rb ${st.rbOk ? 'ok' : ''}"><div class="sc-h"><span class="sc-n">✓</span><div><h2>When does renting cost more than buying?</h2><p>Sign this off: how many days of rent equal the price? ${money(o.price)} ÷ ${money(o.lease)} a day.</p></div>${st.rbOk ? cardStampHtml('ok') : st.rbQ ? cardStampHtml('q') : ''}</div>
    <div class="sc-tabs">${meths.map(([k, l]) => `<button data-rbm="${k}" class="${m === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    <p class="sc-note">${m === 'short' ? `Share ${num(o.price)} into groups of ${num(o.lease)}: how many ${num(o.lease)}s make ${num(o.price)}?` : `Divide both numbers by ${Math.pow(10, z.k) > 1 ? num(Math.pow(10, z.k)) : '10'}: ${num(o.price)} ÷ ${num(o.lease)} is the same as ${num(z.a)} ÷ ${num(z.b)}.`}</p>
    ${st.rbOk ? `<p class="acq-ans"><b>${num(o.price)} ÷ ${num(o.lease)} = ${num(Math.round(days * 10) / 10)}</b> days. Rent it for longer than that and buying would have cost less.</p>` : `<div class="acq-in"><span>${num(o.price)} ÷ ${num(o.lease)} =</span><span class="sc-in ${st.rbQ ? 'qy' : ''}"><input id="rbIn" inputmode="decimal" autocomplete="off" value="${esc(st.rbV || '')}" aria-label="Days of rent that equal the price"><i class="suf">days</i></span><button class="btn primary" id="rbChk">Check ✓</button><span class="sc-msg" role="status">${esc(st.rbMsg || '')}</span></div>`}</section>` : '';
  const body = `<div class="acq"><p class="acq-lead">The <b>${esc(p.name)}</b> on ${esc(routeById(ch.rid).city)}: ${NUMW[ch.n] || ch.n} service${ch.n === 1 ? '' : 's'} at ${money(ch.fare)}, about <b class="${ch.extra >= 0 ? 'good' : 'bad'}">${ch.extra >= 0 ? '+' : '−'}${money(Math.abs(ch.extra))}</b> a day against today's plan, before paying for it.</p>
    ${rb}<div class="acq-cols">${col('lease', 'Rent', rentRows, !!o.canLease)}${col('finance', 'Finance', finRows, !!o.canFinance && cash - o.deposit >= res)}${col('buy', `Buy <span class="acq-pr">${money(o.price)}</span>`, buyRows, o.canBuy, buyNote)}</div>
    <p class="acx-note">Whatever you choose, the aircraft's day cost (${money(p.dayCost)}) is in its operating cost every day it is yours.</p></div>`;
  screen().innerHTML = shell(deskPage({ title:`How should we get the ${esc(shortPlane(p))}?`, sub:'Rent costs nothing today and something every day. Buying costs the most today and nothing after. Finance is in between.', cls:'acq-page', body }),
    deskBar(due && !st.rbOk ? 'Sign off the rent-or-buy days first, then choose how to pay.' : 'Choose how to pay. The aircraft joins the fleet and goes to the paint shop.',
      `<button class="btn big" id="acBack">&#9664; Compare again</button><button class="btn primary big" id="nx" ${pick && ok ? '' : 'disabled'}>${pick ? `${pick === 'buy' ? 'Buy' : pick === 'lease' ? 'Rent' : 'Finance'} the ${esc(shortPlane(p))}` : 'Choose how to pay'} &#9654;</button>`));
  const root = screen();
  root.querySelectorAll('[data-terms]').forEach(b => b.onclick = () => { st.pick = b.getAttribute('data-terms'); render(); });
  root.querySelectorAll('[data-rbm]').forEach(b => b.onclick = () => { st.rbM = b.getAttribute('data-rbm'); render(); });
  const inp = $('rbIn'); if(inp){ inp.oninput = () => { st.rbV = inp.value; }; inp.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); $('rbChk').click(); } }; setTimeout(() => { try{ inp.focus(); }catch(e){} }, 40); }
  on('rbChk', () => { const v = parseFloat(String(st.rbV || '').replace(/[,\s]/g, '').replace(/days?$/i, '')); if(isNaN(v)){ st.rbMsg = 'Type the number of days.'; render(); return; }
    if(Math.abs(v - days) <= 0.5 + 1e-9){ st.rbOk = true; st.rbQ = false; st.rbMsg = ''; const sk = skills(), x = sk.rentOrBuy || (sk.rentOrBuy = { first:S.day, count:0, planes:[] }); x.count++; (x.planes = x.planes || []).push(p.id);
      const log = S.handSumLog || (S.handSumLog = []), e = log.find(z => z.day === S.day) || (log.push({ day:S.day, date:dateShort(S.day), tools:[] }), log[log.length - 1]); e.tools.push(`Rent or buy (${p.name}) (Calculate)`); render(); return; }
    st.rbQ = true; st.rbMsg = v * o.lease > o.price ? `Query: ${num(v)} days of rent would cost ${money(v * o.lease)}, more than the price.` : `Query: ${num(v)} days of rent is only ${money(v * o.lease)}.`; render(); });
  on('acBack', () => { const k = S.steps.findIndex(x => x.t === 'shop2'); if(k >= 0){ S.si = k; render(); } });
  on('nx', () => { if(!pick || !ok) return; const uid = acquirePlane(p, pick); acApplyChoice(uid); st.done = true; delete S.rnd.shopPick; UI.justDone = null; advance(); });
}
/* the chosen aircraft starts on the plan it was compared on (the Twin Otter keeps its other services); the pupil can change it */
function acApplyChoice(uid){
  const ch = S.rnd.acChoice; if(!ch) return; const pl = acBasePlan(ch.rid);
  pl.fleet.push({ uid, planeId:ch.pid, sched:Array(ch.n).fill(ch.rid), deps:ch.deps ? ch.deps.slice() : null }); pl.prices = Object.assign({}, pl.prices, { [ch.rid]:ch.fare });
  applyPlan(normPlan(pl)); toast(`The ${shortPlane(planeById(ch.pid))} flies ${routeById(ch.rid).city}: ${NUMW[ch.n] || ch.n} service${ch.n === 1 ? '' : 's'} at ${money(ch.fare)}. Change it on the plan.`);
  delete S.rnd.acChoice; UI.acCmp = null;
}
const acquireDesk0 = R.acquire;
R.acquire = st => { if(weekMode() && S.rnd.acChoice && S.rnd.acChoice.pid === S.rnd.shopPick) return renderAcPay(st); return acquireDesk0(st); };
