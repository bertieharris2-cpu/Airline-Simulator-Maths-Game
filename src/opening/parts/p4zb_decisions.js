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

/* ==================================================================
   Part D: reviews ask for method, not arithmetic (D61; Settings reviewTotalsMode "build", meanFromDay 7). The week's total
   is built from the seven daily figures and +, a difference as the larger − the smaller, a mean by naming the divisor;
   the game calculates. The teacher can set Calculate (typed totals) for a pupil who needs the practice.
   ================================================================== */
function reviewBuildOn(){ const t = settings.reviewTotals; if(t === 'calc') return false; if(t === 'build') return true; return (WBS().reviewTotalsMode || 'build') === 'build'; }
const OPS4 = ['+', '−', '×', '÷'];
/* an item: { id, kind:'sum'|'diff'|'mean', n, title, ask, figs:[{ k, label, v }], total?, div?, per?, done } */
function rbState(store, id){ const B = store.rb || (store.rb = {}); return B[id] || (B[id] = { tokens:[], ok:false, q:false, msg:'' }); }
function rbCheck(it, st){
  if(it.kind === 'mean'){
    if(!st.op){ st.msg = 'Choose the operation first.'; return false; }
    if(st.op !== '÷'){ st.q = true; st.msg = st.op === '×' ? 'That multiplies: an average shares the total out equally.' : 'An average shares the total out equally: which operation shares?'; return false; }
    const d = parseInt(String(st.div || '').trim(), 10); if(isNaN(d)){ st.msg = 'Type the number to divide by.'; return false; }
    if(d !== it.div){ st.q = true; st.msg = d === 2 ? `÷ 2 halves the total: how many ${it.per}s are we sharing it between?` : d > it.div ? `There were not ${d} ${it.per}s: count them again.` : `How many ${it.per}s did we have? Share the total between all of them.`; return false; }
    st.q = false; st.ok = true; st.msg = ''; return true;
  }
  const T = st.tokens; if(!T.length){ st.msg = 'Tap the figures and the operation into the bar.'; return false; }
  for(let i = 0; i < T.length; i++){ const isOp = OPS4.includes(T[i]); if(isOp !== (i % 2 === 1)){ st.q = true; st.msg = 'Figures and operations take turns: a figure, an operation, a figure.'; return false; } }
  if(OPS4.includes(T[T.length - 1])){ st.msg = 'Finish with a figure.'; return false; }
  const figs = T.filter((_, i) => i % 2 === 0), ops = T.filter((_, i) => i % 2 === 1);
  if(it.kind === 'sum'){
    if(ops.some(o => o !== '+')){ st.q = true; st.msg = `We're finding the total for the ${it.unit}: which operation joins amounts together?`; return false; }
    if(new Set(figs).size !== figs.length){ st.q = true; st.msg = `Each ${it.unit === 'week' ? 'day' : it.part} should be counted once.`; return false; }
    const miss = it.figs.find(f => !figs.includes(f.k)); if(miss){ st.q = true; st.msg = `${miss.label}'s result isn't in the total yet.`; return false; }
    st.q = false; st.ok = true; st.msg = ''; return true;
  }
  if(figs.length !== 2 || ops.length !== 1 || figs[0] === figs[1]){ st.q = true; st.msg = 'A difference compares the two figures: one of each, with one operation between.'; return false; }
  if(ops[0] !== '−'){ st.q = true; st.msg = 'Which operation finds how far apart two amounts are?'; return false; }
  const a = it.figs.find(f => f.k === figs[0]), b = it.figs.find(f => f.k === figs[1]);
  if(a.v < b.v){ st.q = true; st.msg = 'That would go below zero: start from the larger amount.'; return false; }
  st.q = false; st.ok = true; st.msg = ''; return true;
}
function rbValue(it){ if(it.kind === 'sum') return it.figs.reduce((t, f) => t + f.v, 0); if(it.kind === 'diff'){ const v = it.figs.map(f => f.v); return Math.abs(v[0] - v[1]); } return Math.round(it.total / it.div); }
function rbResultWords(it){ const v = rbValue(it);
  if(it.kind === 'diff' && it.resWord){ const [a, b] = it.figs; return `${money(v)} ${a.v >= b.v ? it.resWord[0] : it.resWord[1]}`; }
  if(it.kind === 'diff'){ const [a, b] = it.figs; return `${money(v)} ${a.v === b.v ? 'the same as' : (b.v > a.v ? 'more than' : 'less than')} ${esc(it.than)}`; }
  if(it.kind === 'mean') return `${money(v)} a ${it.per}`; return money(v); }
function rbCardHtml(it, st, store){
  const tok = t => OPS4.includes(t) ? `<i class="rb-op">${t}</i>` : (() => { const f = it.figs.find(x => x.k === t); return f ? `<span class="rb-tk">${esc(f.short || f.label)} <b>${money(f.v)}</b></span>` : ''; })();
  const stamp = st.ok ? cardStampHtml('ok') : st.q ? cardStampHtml('q') : '';
  let bar, ctl = '';
  if(it.kind === 'mean'){
    bar = `<div class="rb-bar mean"><span class="rb-tk">${esc(it.totalLabel)} <b>${money(it.total)}</b></span>${st.op ? `<i class="rb-op">${st.op}</i>` : '<i class="rb-op empty">?</i>'}${st.ok ? `<b class="rb-div">${it.div}</b>` : `<span class="sc-in rb-in ${st.q ? 'qy' : ''}"><input data-rbdiv="${it.id}" inputmode="numeric" autocomplete="off" value="${esc(st.div || '')}" aria-label="Divide by"></span>`}<span class="rb-eq">=</span><b class="rb-res">${st.ok ? rbResultWords(it) : '?'}</b></div>`;
    if(!st.ok) ctl = `<div class="rb-ops">${OPS4.map(o => `<button data-rbop="${it.id}|${o}" class="${st.op === o ? 'on' : ''}">${o}</button>`).join('')}<span class="grow"></span><button class="btn primary rb-chk" data-rbchk="${it.id}">Check ✓</button></div>`;
  } else {
    bar = `<div class="rb-bar">${st.tokens.length ? st.tokens.map(tok).join('') : '<span class="rb-ph">Tap the figures and the operation</span>'}<span class="rb-eq">=</span><b class="rb-res ${st.ok && it.kind === 'diff' && it.figs[1].v < it.figs[0].v ? 'down' : ''}" data-rbres="${it.id}">${st.ok ? rbResultWords(it) : '?'}</b></div>`;
    if(!st.ok) ctl = `<div class="rb-chips">${it.figs.map(f => `<button class="rb-chip" data-rbfig="${it.id}|${f.k}">${esc(f.label)}<b>${money(f.v)}</b></button>`).join('')}</div>
      <div class="rb-ops">${OPS4.map(o => `<button data-rbop="${it.id}|${o}">${o}</button>`).join('')}<button class="dk-link" data-rbundo="${it.id}">Undo</button><button class="dk-link" data-rbclr="${it.id}">Clear</button><span class="grow"></span><button class="btn primary rb-chk" data-rbchk="${it.id}">Check ✓</button></div>`;
  }
  return `<section class="dk-pnl rb-card ${st.ok ? 'ok' : ''} ${it.locked ? 'locked' : ''}" data-rbcard="${it.id}"><div class="sc-h"><span class="sc-n">${it.n}</span><div><h2>${esc(it.title)}</h2><p>${esc(it.ask)}</p></div>${stamp}</div>
    ${it.locked ? '<p class="rb-wait">After the one above.</p>' : bar + ctl + `<p class="sc-msg rb-msg ${st.q ? '' : 'ok'}" role="status">${esc(st.msg || '')}</p>`}</section>`;
}
function rbBind(items, store, onDone){
  const root = screen(), get = id => items.find(x => x.id === id);
  root.querySelectorAll('[data-rbfig]').forEach(b => b.onclick = () => { const [id, k] = b.getAttribute('data-rbfig').split('|'), st = rbState(store, id); if(st.tokens.length % 2 === 1){ st.msg = 'Put an operation between the figures.'; render(); return; } st.tokens.push(k); st.msg = ''; st.q = false; render(); });
  root.querySelectorAll('[data-rbop]').forEach(b => b.onclick = () => { const [id, o] = b.getAttribute('data-rbop').split('|'), it = get(id), st = rbState(store, id);
    if(it.kind === 'mean'){ st.op = o; st.msg = ''; render(); return; }
    if(st.tokens.length % 2 === 0){ st.msg = st.tokens.length ? 'Two operations in a row: tap a figure next.' : 'Start with a figure.'; render(); return; } st.tokens.push(o); st.msg = ''; render(); });
  root.querySelectorAll('[data-rbundo]').forEach(b => b.onclick = () => { const st = rbState(store, b.getAttribute('data-rbundo')); st.tokens.pop(); st.msg = ''; render(); });
  root.querySelectorAll('[data-rbclr]').forEach(b => b.onclick = () => { const st = rbState(store, b.getAttribute('data-rbclr')); st.tokens = []; st.msg = ''; st.q = false; render(); });
  root.querySelectorAll('[data-rbdiv]').forEach(i => { i.oninput = () => { rbState(store, i.getAttribute('data-rbdiv')).div = i.value; }; i.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); const c = root.querySelector(`[data-rbchk="${i.getAttribute('data-rbdiv')}"]`); if(c) c.click(); } }; });
  root.querySelectorAll('[data-rbchk]').forEach(b => b.onclick = () => { const id = b.getAttribute('data-rbchk'), it = get(id), st = rbState(store, id);
    if(rbCheck(it, st)){ if(typeof liveChime === 'function' && typeof opsSoundOn === 'function' && opsSoundOn()) liveChime('ding'); onDone(it); render(); rbCountUp(id, rbValue(it)); } else render(); });
}
/* "the game fills in the total with a short adding-up animation" */
function rbCountUp(id, v){ const el = screen().querySelector(`[data-rbres="${id}"]`); if(!el || (settings.reduceMotion)) return; const t0 = performance.now(), fin = el.innerHTML;
  const tick = t => { const k = Math.min(1, (t - t0) / 600); if(k < 1){ el.textContent = money(Math.round(v * k)); requestAnimationFrame(tick); } else el.innerHTML = fin; }; requestAnimationFrame(tick); }
function rbLog(names){ const log = S.handSumLog || (S.handSumLog = []), e = log.find(z => z.day === S.day) || (log.push({ day:S.day, date:dateShort(S.day), tools:[] }), log[log.length - 1]); names.forEach(n => e.tools.push(n)); }
function rbSkill(id){ const sk = skills(), x = sk[id] || (sk[id] = { first:S.day, count:0 }); x.count++; x.lastDay = S.day; }
const rbShort = d => { const c = calDate(d); return `${WDAY[c.getUTCDay()].slice(0, 3)} ${c.getUTCDate()}`; };

/* ---------- the Sunday review ---------- */
function weekReviewItems(W, h){
  const days = Array.from({ length:7 }, (_, k) => W.from + k).filter(d => W.rows.some(r => r.d === d)), figs = days.map(d => ({ k:'d' + d, label:rbShort(d), short:rbShort(d), v:(W.rows.find(r => r.d === d) || {}).profit || 0 }));
  const total = figs.reduce((t, f) => t + f.v, 0), proj = Math.round(W.projected || 0), wk = weekNo(W.from), items = [];
  items.push({ id:'tot', n:1, kind:'sum', unit:'week', part:'day', title:`Week ${wk} accounts`, ask:"Show the finance team how to work out the week's total.", figs });
  items.push({ id:'diff', n:2, kind:'diff', title:'Planned against what happened', ask:'Show how to find the difference between what we planned and what happened.', figs:[{ k:'proj', label:'Projected', v:proj }, { k:'act', label:'Actual', v:total }], than:'planned' });
  if(S.day >= (WBS().meanFromDay || 7)) items.push({ id:'mean', n:3, kind:'mean', per:'day', title:'Average profit a day', ask:'What was our average profit a day this week?', total, totalLabel:"Week's total", div:days.length });
  return items;
}
function renderWeekReviewBuild(st){
  const W = S.wk || { from:S.day - 6, rows:[], projected:0 }, h = weekSummary(W), items = weekReviewItems(W, h), store = W;
  items.forEach((it, i) => { it.locked = i > 0 && !rbState(store, items[i - 1].id).ok; });
  const allOk = items.every(it => rbState(store, it.id).ok), wk = weekNo(W.from);
  if(allOk && !W.logged){ W.logged = true; rbSkill('weekTotal'); rbSkill('projectedVsActual'); if(items.some(x => x.id === 'mean')) rbSkill('meanDay');
    rbLog(['Week total (Build)', 'Projected − actual (Build)'].concat(items.some(x => x.id === 'mean') ? ['Average a day (Build)'] : [])); const mean = items.find(x => x.id === 'mean'); if(mean){ (S.means = S.means || {})[wk] = rbValue(mean); } }
  if(!W.missed && WBS().missedProfitLine !== false){ W.missed = missedProfitLine(h.profit, 7, W.from); }
  if(!W.neglect) W.neglect = neglectUpdate(W.from, W.from + 6);
  const T = items.find(x => x.id === 'tot'), tOk = rbState(store, 'tot').ok, dOk = rbState(store, 'diff').ok, M = items.find(x => x.id === 'mean'), mOk = M && rbState(store, 'mean').ok, prevMean = (S.means || {})[wk - 1];
  const rows = T.figs.map(f => `<tr><td>${esc(f.label)}</td><td class="num ${f.v < 0 ? 'bad' : ''}">${money(f.v)}</td></tr>`).join('')
    + `<tr class="tot"><td>Profit this week</td><td class="num">${tOk ? money(rbValue(T)) : '<i class="rb-q">?</i>'}</td></tr><tr><td>Projected on Monday</td><td class="num">${money(Math.round(W.projected || 0))}</td></tr>`
    + `<tr><td>Difference</td><td class="num">${dOk ? rbResultWords(items[1]) : '<i class="rb-q">?</i>'}</td></tr>` + (M ? `<tr><td>Average a day</td><td class="num">${mOk ? money(rbValue(M)) : '<i class="rb-q">?</i>'}</td></tr>` : '');
  const changed = mOk ? `<p class="rb-changed">${ICO2.swap}<span>Average day: <b>${money(rbValue(M))}</b> this week${prevMean !== undefined ? `, <b>${money(prevMean)}</b> last week` : ''}.</span></p>` : '';
  const Mi = W.missed, miss = Mi ? `<div class="wk-missed ${Mi.missed > 0 ? 'warn' : 'ok'}"><span class="kl">What the best plan would have earned</span><div class="wm-row"><span>Your plan <b class="mono">${money(Mi.yours)}</b></span><span>Best plan with your planes <b class="mono">${money(Mi.best)}</b></span><span>Missed <b class="mono ${Mi.missed > 0 ? 'orange' : 'green'}">${money(Mi.missed)}</b></span></div><p class="small muted">Best plan: ${esc(Mi.bestPlan)} · about ${money(Mi.bestDay)} a day. No cash is taken.</p></div>` : '';
  const neg = W.neglect && W.neglect.length ? `<div class="wk-neglect">${W.neglect.map(n => `<p class="${n.bad ? 'orange' : 'green'}">${esc(n.text)}</p>`).join('')}</div>` : '';
  const body = `<div class="rbw"><section class="dk-pnl rbw-t"><div class="dk-pnl-h">${ICO2.calendar}<h2>The week, day by day</h2><span class="grow"></span><span class="sub">${fmtRange(W.from, W.from + 6)}</span></div><table class="dk-t">${rows}</table>${changed}</section>
    <div class="rbw-b">${items.map(it => rbCardHtml(it, rbState(store, it.id), store)).join('')}</div>
    <div class="rbw-s">${miss}${fuelAdvantageLine(wk)}${surprisesLine(W.from, W.from + 6)}${neg}<section class="dk-pnl rv-routes"><div class="dk-pnl-h">${ICO2.route}<h2>Route performance</h2></div>${evidenceHtml(h, Object.keys(h.routes))}</section></div></div>`;
  screen().innerHTML = shell(deskPage({ title:`How did week ${wk} go?`, sub:`Seven days flown. Show the finance team what to do with the figures; the game does the arithmetic. Passengers ${num(h.pax)} of ${num(h.seats)} seats · cash ${money(Math.round(S.cash))}.`, cls:'rbw-page', body }),
    deskBar(allOk ? 'Signed off. On to next week.' : 'Build each line: tap the figures and the operation, then Check.', `<button class="btn primary big" id="nx" ${allOk ? '' : 'disabled'}>${goLabel(allOk ? 'On to next week' : 'Sign off the accounts first')} &#9654;</button>`));
  rbBind(items, store, () => {});
  on('nx', () => { if(!items.every(it => rbState(store, it.id).ok)) return; resetEntry(); UI.justDone = null; S.rnd.applied = true; closeDay(); });
}
const weekReviewCalc = R.weekReview;
R.weekReview = st => { if(weekMode() && reviewBuildOn()) return renderWeekReviewBuild(st); return weekReviewCalc(st); };

/* ---------- the review of a week or month beat (from day 29): the mean, and the spec's difference or average week ---------- */
function mondaysIn(a, b){ let n = 0; for(let d = a; d <= b; d++) if(calDate(d).getUTCDay() === 1) n++; return Math.max(1, n); }
function periodReviewItems(){
  const H = S.history.filter(x => x.type !== 'setup'), h = H[H.length - 1], spec = reviewSpec(), items = []; if(!h) return { items, h, spec };
  const wk = H.filter(x => x.type === 'week');
  if(spec && spec.id === 'difference'){ const a = wk[wk.length - 2], c = wk[wk.length - 1];
    items.push({ id:'diff', kind:'diff', title:'How much did weekly profit change?', ask:'Show how to find the difference between the two weeks.', figs:[{ k:'a', label:periodShort(a), v:Math.round(a.profit) }, { k:'c', label:periodShort(c), v:Math.round(c.profit) }], than:'the week before', spec:spec.id }); }
  if(spec && spec.id === 'averageWeek'){ const w3 = wk.slice(-3), figs = w3.map((x, i) => ({ k:'w' + i, label:periodShort(x), v:Math.round(x.profit) })), tot = figs.reduce((t, f) => t + f.v, 0);
    items.push({ id:'sum3', kind:'sum', unit:'three weeks', part:'week', title:'Three weeks together', ask:'Show how to work out the total for the last three weeks.', figs });
    items.push({ id:'avgw', kind:'mean', per:'week', title:'Average profit a week', ask:'What is the average profit a week over those three weeks?', total:tot, totalLabel:'Three weeks', div:3, spec:spec.id }); }
  if(h.type === 'week' && S.day >= (WBS().meanFromDay || 7)) items.push({ id:'mday', kind:'mean', per:'day', title:'Average profit a day', ask:`What was our average profit a day in ${periodShort(h)}?`, total:Math.round(h.profit), totalLabel:`${periodShort(h)} total`, div:h.to - h.from + 1 });
  if(h.type === 'month') items.push({ id:'mweek', kind:'mean', per:'week', title:'Average week this month', ask:`What was the average week in ${periodShort(h)}?`, total:Math.round(h.profit), totalLabel:`${periodShort(h)} total`, div:mondaysIn(h.from, h.to), spec:spec && spec.id === 'averageDay' ? 'averageDay' : null });
  items.forEach((it, i) => { it.n = i + 1; });
  return { items, h, spec };
}
function renderPeriodReviewBuild(){
  const { items, h, spec } = periodReviewItems(), store = S.rnd;
  if(!items.length || !h) return reviewDesk1();
  items.forEach((it, i) => { it.locked = i > 0 && !rbState(store, items[i - 1].id).ok; });
  const allOk = items.every(it => rbState(store, it.id).ok);
  if(allOk && !store.rbLogged){ store.rbLogged = true; const names = []; items.forEach(it => { if(it.spec) rbSkill(it.spec); names.push(`${it.title} (Build)`); }); rbLog(names); const m = items.find(x => x.id === 'mday'); if(m) (S.means = S.means || {})[weekNo(h.from)] = rbValue(m); }
  const extra = (h.to - h.from >= 6 ? fuelAdvantageLine(weekNo(h.from)) : '') + surprisesLine(h.from, h.to);
  const body = `<div class="rbw"><section class="dk-pnl rbw-t"><div class="dk-pnl-h">${ICO2.bars}<h2>Profit by period</h2></div><div class="rbw-trend">${trendHtml()}</div></section>
    <div class="rbw-b">${items.map(it => rbCardHtml(it, rbState(store, it.id), store)).join('')}</div>
    <div class="rbw-s">${extra}<section class="dk-pnl rv-routes"><div class="dk-pnl-h">${ICO2.route}<h2>Route performance · ${esc(periodShort(h))}</h2><span class="grow"></span><span class="sub">${fmtRange(h.from, h.to)}</span></div>${evidenceHtml(h, ownedRoutes())}</section></div></div>`;
  screen().innerHTML = shell(deskPage({ title:`How did ${esc(periodShort(h))} go?`, sub:`Profit ${money(Math.round(h.profit))} · passengers ${num(h.pax || 0)} of ${num(h.seats || 0)} seats. Show the finance team what to do; the game does the arithmetic.`, cls:'rbw-page', body }),
    deskBar(allOk ? 'Signed off. Carry on.' : 'Build each line: choose the figures and the operation, then Check.', `<button class="btn primary big" id="nx" ${allOk ? '' : 'disabled'}>${goLabel(allOk ? 'Continue' : 'Sign off first')} &#9654;</button>`));
  rbBind(items, store, () => {});
  on('nx', () => { if(!items.every(it => rbState(store, it.id).ok)) return; resetEntry(); UI.justDone = null; advance(); });
}
const reviewDesk1 = R.review;
R.review = st => { if(weekMode() && reviewBuildOn()) return renderPeriodReviewBuild(); return reviewDesk1(st); };
/* the test drives the build cards through this: the clicks the first unfinished card needs */
function rbPlan(){
  const card = screen().querySelector('.rb-card:not(.ok):not(.locked)'); if(!card) return null; const id = card.getAttribute('data-rbcard');
  const list = step().t === 'weekReview' ? weekReviewItems(S.wk, weekSummary(S.wk)) : step().t === 'chapterReview' ? chapterReviewItems().items : periodReviewItems().items, it = list.find(x => x.id === id); if(!it) return null;
  if(it.kind === 'mean') return { id, op:'÷', div:it.div };
  if(it.kind === 'sum') return { id, seq:it.figs.flatMap((f, i) => i ? ['+', f.k] : [f.k]) };
  const [a, b] = it.figs[0].v >= it.figs[1].v ? [it.figs[0], it.figs[1]] : [it.figs[1], it.figs[0]]; return { id, seq:[a.k, '−', b.k] };
}

/* ---------- the chapter accounts: total revenue and total costs from the months, profit, planned against what happened ---------- */
function chapterReviewItems(){
  const months = chapterMonths(), rev = months.map((m, k) => ({ k:'r' + k, label:m.name, v:Math.round(m.rev) })), cost = months.map((m, k) => ({ k:'c' + k, label:m.name, v:Math.round(m.cost) }));
  const R0 = rev.reduce((t, f) => t + f.v, 0), C0 = cost.reduce((t, f) => t + f.v, 0), P0 = R0 - C0, proj = Math.round(months.reduce((t, m) => t + m.proj, 0));
  return { months, items:[
    { id:'rev', n:1, kind:'sum', unit:'chapter', part:'month', title:'Total revenue', ask:"Show how to work out the chapter's total revenue from the months.", figs:rev },
    { id:'cost', n:2, kind:'sum', unit:'chapter', part:'month', title:'Total costs', ask:"Show how to work out the chapter's total costs.", figs:cost },
    { id:'profit', n:3, kind:'diff', title:'Profit for the chapter', ask:'Show how to find the profit from the revenue and the costs.', figs:[{ k:'R', label:'Total revenue', v:R0 }, { k:'C', label:'Total costs', v:C0 }], resWord:['profit', 'loss'] },
    { id:'vs', n:4, kind:'diff', title:'Planned against what happened', ask:'Show how to find the difference between the profit you projected and the profit you made.', figs:[{ k:'proj', label:'Projected', v:proj }, { k:'act', label:'Actual', v:P0 }], than:'projected' }] };
}
function renderChapterReviewBuild(st){
  const ch = WORLD.chapter || { chapter:1, name:'Starting out' }, { months, items } = chapterReviewItems(), store = S.rnd;
  items.forEach((it, i) => { it.locked = i > 0 && !rbState(store, items[i - 1].id).ok; });
  const allOk = items.every(it => rbState(store, it.id).ok), val = id => rbValue(items.find(x => x.id === id));
  const pax = S.history.reduce((a, h) => a + (h.pax || 0), 0), seats = S.history.reduce((a, h) => a + (h.seats || 0), 0), cash0 = WORLD.startingCash || 5000;
  const rows = months.map((m, k) => `<tr><td>${esc(m.name)}</td><td class="num">${money(Math.round(m.rev))}</td><td class="num">${money(Math.round(m.cost))}</td></tr>`).join('')
    + `<tr class="tot"><td>Chapter</td><td class="num">${rbState(store, 'rev').ok ? money(val('rev')) : '<i class="rb-q">?</i>'}</td><td class="num">${rbState(store, 'cost').ok ? money(val('cost')) : '<i class="rb-q">?</i>'}</td></tr>`;
  const body = `<div class="rbw"><section class="dk-pnl rbw-t"><div class="dk-pnl-h">${ICO2.calendar}<h2>${esc(ch.name || 'Starting out')}: month by month</h2></div><table class="dk-t"><thead><tr><th>Month</th><th class="num">Revenue</th><th class="num">Costs</th></tr></thead>${rows}</table>
      <p class="rb-changed">${ICO2.people}<span>${num(pax)} passengers · load factor ${seats ? Math.round(100 * pax / seats) : 0}% · cash ${money(cash0)} → <b>${money(Math.round(S.cash))}</b></span></p></section>
    <div class="rbw-b">${items.map(it => rbCardHtml(it, rbState(store, it.id), store)).join('')}</div>
    <div class="rbw-s"><section class="dk-pnl"><div class="dk-pnl-h">${ICO2.route}<h2>What comes next</h2></div><p class="wr-l">${esc(nextChapterLine())}</p></section></div></div>`;
  screen().innerHTML = shell(deskPage({ title:`Chapter ${ch.chapter || 1}: the accounts`, sub:"The model shows each month's revenue and costs. Show the finance team how to put them together; the game does the arithmetic.", cls:'rbw-page', body }),
    deskBar(allOk ? 'The accounts are signed off.' : 'Build each line: choose the figures and the operation, then Check.', `<button class="btn primary big" id="nx" ${allOk ? '' : 'disabled'}>${goLabel(allOk ? 'Close the chapter' : 'Sign off the accounts first')} &#9654;</button>`));
  rbBind(items, store, () => {});
  on('nx', () => { if(!items.every(it => rbState(store, it.id).ok)) return;
    if(!st.done){ st.done = true; rbLog(['Chapter accounts: total revenue, total costs, profit, projected − actual (Build)']); S.chapterAccounts = { revenue:val('rev'), costs:val('cost'), profit:items[2].figs[0].v - items[2].figs[1].v, projected:items[3].figs[0].v }; }
    resetEntry(); UI.justDone = null; advance(); });
}
const chapterReviewCalc = R.chapterReview;
R.chapterReview = st => { if(weekMode() && reviewBuildOn()) return renderChapterReviewBuild(st); return chapterReviewCalc(st); };
