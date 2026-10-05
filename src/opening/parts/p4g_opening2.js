/* ==================================================================
   THE OPENING, ONE NEW IDEA A DAY (the teacher's specification).
   Every day has the same five stages: PLAN → COST → TEST → OPERATE → REVIEW.
     COST  = today's one deliberately chosen calculation (the new idea), everything else is the model;
     TEST  = free modelling: change the test plan, the model costs it, no compulsory arithmetic.
   A control only appears once its idea has been introduced:
     Launch Day  services + fare              · ticket revenue, profit
     Day 1       + on-board service           · cabin sales            (profit is Built, then modelled)
     Day 2       + fuel (the airline buys it) · fuel cost
     Day 3       + a departure time per service and time-of-day demand · empty seats
     Day 4       + Dublin: one aircraft, two markets · revenue on a new route (Build)
     End of Day 4 the Regular Operating Plan, then the weekend runs itself and Week 1 (weekly projection).
   ================================================================== */
WS_STEPS.push('costPlan', 'testIdeas', 'strategy');
SHELL_STEPS.push('costPlan', 'testIdeas', 'strategy', 'rop');
['strategy'].forEach(t => { const i = FOCUS_STEPS.indexOf(t); if(i >= 0) FOCUS_STEPS.splice(i, 1); });

/* ---------- which ideas have been introduced ---------- */
function opened(stage){ return S && S.phase !== 'setup' && progress() >= stage; }
function snacksOn(){ return opened(3.1); }
function fuelPaid(){ return opened(3.2); }
function timeDemandOn(){ return opened(3.3); }
function depsOn(){ return opened(3.3); }
function secondRouteOn(){ return opened(3.4); }
/* The weeks (and the weekend run before them): fuel is bought as it is used, at that week's price. No tank, no top-ups,
   so "profit a day × 7" is exact. From the months the tank comes back: buying ahead when the price looks low is the decision. */
function fuelContract(){ return !!(S && S.phase === 'round' && S.period && (S.period.type === 'week' || S.period.type === 'gap')); }
function plannerRoutes(){ return secondRouteOn() ? [S.market, otherRoute()] : [S.market]; }
/* The old "business travellers before 08:00" rule is replaced by time-of-day demand. */
function earlyBonus(){ return 0; }
/* Week 1 is the first full week of regular operation: Monday 20 May 2030. */
function weekNo(day){ return Math.max(1, Math.floor((day - 8) / 7) + 1); }

/* ---------- time-of-day demand: who wants to fly when ---------- */
const PROFILE_DEFAULT = { morning:0.4, midday:0.2, evening:0.4, flex:0.3, type:'Mixed' };
const BAND_NAMES = { morning:'Morning peak', midday:'Quieter middle', evening:'Evening peak' };
function bandOf(m){ return m < 600 ? 'morning' : m < 960 ? 'midday' : 'evening'; }
function profileOf(r){ return (r && r.profile) || PROFILE_DEFAULT; }
/* The day's passengers at this fare, split into the time each wants to fly; "flex" will take any service. */
function demandPools(route, fare){
  const W = paxWant(route, fare);
  if(!timeDemandOn()) return { W, morning:0, midday:0, evening:0, flex:W };
  const pr = profileOf(route), fixed = Math.round(W * (1 - pr.flex)), m = Math.round(fixed * pr.morning), e = Math.round(fixed * pr.evening);
  return { W, morning:m, midday:Math.max(0, fixed - m - e), evening:e, flex:W - fixed };
}
function planFlights(){
  const out = [], pools = {}, fifo = fifoCursor(S.rnd && S.rnd.fuelOrder), paid = fuelPaid(), list = [];
  const pool = (route, price) => { if(!pools[route.id]){ const comp = competitorPrice(route); pools[route.id] = Object.assign(demandPools(route, price), { demand: demandAt(route, price), comp, cut: comp !== undefined && comp < price }); } return pools[route.id]; };
  S.fleet.forEach((f, i) => { const sched = schedOf(f); if(!sched.length) return; const plane = planeById(f.planeId), D = TIME.day(plane, sched); D.trips.forEach((tr, k) => list.push({ f, i, k, tr, plane })); });
  list.sort((a, b) => a.tr.dep - b.tr.dep || a.i - b.i);
  list.forEach(({ f, i, k, tr, plane }) => {
    const route = routeById(tr.route), price = fareOf(tr.route);
    const base = { key:f.uid+'-'+k, uid:f.uid, trip:k, planeId:f.planeId, route:tr.route, code:flightCode(i, k), price, seats:seatsOf(f), layout:f.layout, dep:tr.dep, arr:tr.arr, segments:tr.segments, fuelL:fuelForTrip(plane, route), runCost:runCostOf(plane, route), reasons:[] };
    if(f.grounded){ out.push(Object.assign(base, { demand:0, sold:0, revenue:0, grounded:true, fuelL:0, runCost:0, fuelCost:0, reasons:['Grounded today, waiting for a spare part.'] })); return; }
    const d = pool(route, price), band = bandOf(tr.dep), a = Math.min(base.seats, d[band]), b = Math.min(base.seats - a, d.flex), sold = a + b;
    d[band] -= a; d.flex -= b;
    const reasons = [];
    if(k === 0 || sold < base.seats){ if(S.rep >= 4) reasons.push(`Your ${S.rep} star reputation brought extra passengers.`); if(S.rep <= 2) reasons.push(`Your ${S.rep} star reputation put some people off.`); }
    if(d.cut) reasons.push(`${WORLD.rival} was cheaper (£${num(d.comp)}), so 1 in 5 passengers went to them.`);
    if(timeDemandOn() && sold < base.seats) reasons.push(`${fmtTime(tr.dep)} is in the ${BAND_NAMES[band].toLowerCase()}: fewer people want to fly then.`);
    else if(k > 0 && sold < base.seats) reasons.push(`Earlier trips had already taken most of today's ${route.city} passengers.`);
    out.push(Object.assign(base, { demand:d.demand, band, sold, revenue: sold * price, termCost: sold * termCharge(), compCut:d.cut, reasons, fuelCost: !paid ? 0 : fuelContract() ? r2(base.fuelL * fuelPrice()) : fifo.take(base.fuelL) }));
  });
  return out;
}
/* A departure time for each service (from Day 3). A service can't leave before the aircraft is ready again. */
TIME.day = function(plane, ids, start, deps){
  start = start === undefined ? firstDep() : start;
  if(deps === undefined) deps = depsOn() && S && Array.isArray(S.deps) ? S.deps : null;
  let t = deps && deps[0] !== undefined && deps[0] !== null ? deps[0] : start; const t0 = t, trips = [], segments = [];
  ids.forEach((id, k) => {
    const r = routeById(id);
    if(k > 0){ const h = TIME.home(plane); segments.push({ kind:'home', start:t, end:t + h, k }); t += h; if(deps && deps[k] !== undefined && deps[k] !== null && deps[k] > t) t = deps[k]; }
    const L = TIME.leg(plane, r), A = TIME.away(plane, r), dep = t;
    const segs = [{ kind:'out', start:t, end:t + L, route:id, k }, { kind:'turn', start:t + L, end:t + L + A, route:id, k }, { kind:'back', start:t + L + A, end:t + 2 * L + A, route:id, k }];
    segments.push(...segs); t = dep + 2 * L + A;
    trips.push({ route:id, k, dep, arriveAway:dep + L, leaveAway:dep + L + A, arr:t, segments:segs });
  });
  return { start:t0, trips, segments, end:t, elapsed:t - t0 };
};
/* Launch Day and Day 1: the launch deal supplies the fuel free. From Day 2 the airline buys its own. */
function startFlight(){
  S.rnd.flights = planFlights(); const paid = fuelPaid();
  S.rnd.flights.slice().sort((a, b) => a.dep - b.dep).forEach(f => {
    if(f.grounded) return;
    if(!paid){ f.fuelCost = 0; S.rnd.status[f.key] = 'BOARDING'; return; }
    if(S.fuel + 1e-9 >= f.fuelL){ f.fuelCost = consumeFuel(f.fuelL); S.rnd.status[f.key] = 'BOARDING'; }
    else { f.noFuel = true; f.sold = 0; f.revenue = 0; f.runCost = 0; f.fuelCost = 0; S.rnd.status[f.key] = 'NO FUEL'; f.reasons = ['Not enough fuel — trip grounded.']; }
  });
  const fl = S.rnd.flights.filter(f => !f.grounded), first = fl.length ? Math.min(...fl.map(f => f.dep)) : firstDep(), last = S.rnd.flights.reduce((m, f) => Math.max(m, f.arr || 0), first + 60);
  S.rnd.anim = { start: Date.now(), dur: settings.flightSecs * 2500, from: first - 30, to: last + 30 };
}
function operandUnit(t, id){ const r = tRows(t).find(x => x.id === id); if(r) return r.unit; return ({ fuelL:'L', ppl:'ppl', snackP:'£' })[id] || (/^(fare|price)/.test(id) ? '£' : 'n'); }
Object.assign(CALC_Q, { snack:'How much will the cabin sales bring in?', fuel:'What will the fuel cost?', empty:'How many seats will be empty?', wproj:'What profit will the week bring?', tk2:'How much will the tickets on the new route bring in?' });
Object.assign(OPND, { run:'Flights', term:'Terminal charges', stock:'Snack stock', crew:'Second crew', day:"Aircraft's day", fuel:'Fuel cost', tk1:'Tickets', tk2:'Tickets', snack:'Cabin sales', buyers:'Passengers buying', snackP:'Snack price', fuelL:'Fuel used', ppl:'Price per litre', seats:'Seats', flown:'Passengers', revDay:'Revenue a day', costDay:'Costs a day', profitDay:'Profit a day', days:'Days' });

/* ---------- plans: what the airline will do, tried on a copy ---------- */
function currentPlan(){ const f = fleetOne(); return { sched: f ? schedOf(f).slice() : [], prices: Object.assign({}, S.prices), firstDep: firstDep(), onboard: S.onboard || 'none', deps: depsOn() && Array.isArray(S.deps) ? S.deps.slice() : null }; }
function planKey(pl){ return JSON.stringify([pl.sched, pl.sched.map(id => pl.prices[id]), pl.firstDep, pl.onboard, pl.deps || null]); }
function withPlan(pl, fn){
  const f = fleetOne(), keep = { sched: f ? f.schedule : [], route: f ? f.route : null, prices: S.prices, dep: S.firstDep, ob: S.onboard, deps: S.deps };
  try{ if(f){ f.schedule = pl.sched.slice(); f.route = pl.sched[0] || null; } S.prices = Object.assign({}, pl.prices); S.firstDep = pl.firstDep; S.onboard = pl.onboard; S.deps = pl.deps ? pl.deps.slice() : null; return fn(); }
  finally { if(f){ f.schedule = keep.sched; f.route = keep.route; } S.prices = keep.prices; S.firstDep = keep.dep; S.onboard = keep.ob; S.deps = keep.deps; }
}
/* Everything a plan would do today, as spreadsheet lines. */
function planLines(pl){
  return withPlan(pl, () => {
    const p = ourPlane(), fits = !pl.sched.length || schedFits(pl.sched), fl = planFlights().filter(x => !x.grounded), X = dayExtras(fl), r1 = S.market, r2id = otherRoute(), ob = onboardOf();
    const paxOn = id => fl.filter(x => x.route === id).reduce((t, x) => t + x.sold, 0);
    const v = { pax1: paxOn(r1), fare1: fareOf(r1), pax2: paxOn(r2id), fare2: fareOf(r2id) };
    v.tk1 = v.pax1 * v.fare1; v.tk2 = v.pax2 * v.fare2; v.buyers = X.buyers || 0; v.snackP = ob.price || 0; v.snack = X.obRev; v.rev = v.tk1 + v.tk2 + v.snack;
    v.run = fl.reduce((t, x) => t + x.runCost, 0); v.fuelL = fl.reduce((t, x) => t + x.fuelL, 0); v.ppl = fuelPrice(); v.fuel = Math.round(fl.reduce((t, x) => t + x.fuelCost, 0));
    v.term = X.term; v.stock = X.obCost; v.crew = X.crew; v.day = fleetDayCost();
    v.cost = v.run + v.fuel + v.term + v.stock + v.crew + v.day; v.profit = v.rev - v.cost;
    const routes = {}; fl.forEach(x => { routes[x.route] = (routes[x.route] || 0) + x.sold; });
    const ids = [...new Set(pl.sched)], want = Object.fromEntries(ids.map(id => [id, paxWant(routeById(id), fareOf(id))]));
    const nos = ids.reduce((t, id) => t + Math.max(0, want[id] - (routes[id] || 0)), 0);
    const D = pl.sched.length ? TIME.day(p, pl.sched) : null, seats = fl.reduce((t, x) => t + x.seats, 0), pax = fl.reduce((t, x) => t + x.sold, 0);
    const services = fl.map((x, k) => ({ k, route:x.route, dep:x.dep, arr:x.arr, seats:x.seats, sold:x.sold, band:x.band || bandOf(x.dep) }));
    return { v, fits, nos, pax, seats, empty: seats - pax, want, end: D ? D.end : null, D, crews: X.crews, fuelL: v.fuelL, services, X };
  });
}
function planOutcome(pl){ const L = planLines(pl); return { pax:L.pax, nos:L.nos, seats:L.seats, revenue:L.v.rev, costs:L.v.cost, profit:L.v.profit, end:L.end, crews:L.crews, fuelL:L.fuelL, X:L.X, label:svcLabel(pl.sched) }; }
/* One line describing a plan: "Paris ×2 at £90 · snacks £3 · 07:00, 17:00". */
function planLabel(pl){
  const c = serviceCounts(pl.sched), parts = Object.keys(c).map(id => `${routeById(id).city} ×${c[id]} at ${money(pl.prices[id] || routeById(id).basePrice)}`);
  if(snacksOn() && pl.onboard && pl.onboard !== 'none') parts.push(({ sell3:'snacks £3', sell5:'snacks £5', free:'free snacks' })[pl.onboard]);
  if(depsOn() && pl.sched.length){ const D = withPlan(pl, () => TIME.day(ourPlane(), pl.sched)); parts.push(D.trips.map(t => fmtTime(t.dep)).join(', ')); }
  return parts.join(' · ') || 'No services';
}
function setPlan(i, pl){
  if(i === 0){ const f = fleetOne(); setSchedule(f.uid, pl.sched.slice()); Object.assign(S.prices, pl.prices); S.firstDep = pl.firstDep; S.onboard = pl.onboard; S.deps = pl.deps ? pl.deps.slice() : null; refreshPlan(); }
  else if(i === 9) S.rnd.test = pl;
  else if(S.rnd.options) S.rnd.options[i] = pl;
  render();
}
/* The departure times a plan really has (a service waits for the aircraft). */
function actualDeps(pl){ return withPlan(pl, () => TIME.day(ourPlane(), pl.sched).trips.map(t => t.dep)); }
/* Change plan i (0 = the airline's plan, 9 = the test plan). */
function editPlan(i, what, a, d){
  const base = i === 9 ? testPlan() : currentPlan(), next = JSON.parse(JSON.stringify(base)), maxT = WORLD.maxTrips || 4;
  if(depsOn() && !next.deps) next.deps = actualDeps(next);
  if(what === 'svc'){ const c = serviceCounts(next.sched); c[a] = clamp((c[a] || 0) + d, 0, maxT); if(c[a] && !next.prices[a]) next.prices[a] = routeById(a).basePrice; next.sched = schedFrom(c); if(next.deps) next.deps = null; }
  else if(what === 'fare'){ const r = routeById(a), F = r.fares || [r.basePrice], k = F.indexOf(next.prices[a] || r.basePrice); next.prices[a] = F[clamp((k < 0 ? F.indexOf(r.basePrice) : k) + d, 0, F.length - 1)]; }
  else if(what === 'dep'){ const k = +a, now = actualDeps(next), v = now[k] + 30 * d;
    if(v < dayStart()){ toast(`The airport opens at ${WORLD.dayStart}.`); return; }
    if(k > 0 && d < 0){ const ready = withPlan(next, () => { const D = TIME.day(ourPlane(), next.sched); return D.trips[k - 1].arr + TIME.home(ourPlane()); }); if(v < ready){ toast(`Service ${k + 1} can't leave before the aircraft is ready again at ${fmtTime(ready)}.`); return; } }
    next.deps = now; next.deps[k] = v; }
  else if(what === 'del'){ const k = +a; if(next.deps) next.deps.splice(k, 1); next.sched.splice(k, 1); }
  else if(what === 'add'){ if(next.sched.length >= maxT){ toast(`One aircraft can fly at most ${maxT} services a day.`); return; } next.sched.push(a); if(!next.prices[a]) next.prices[a] = routeById(a).basePrice; if(next.deps) next.deps.push(null); }
  else if(what === 'route'){ const k = +a, ids = plannerRoutes(), cur = ids.indexOf(next.sched[k]); next.sched[k] = ids[(cur + 1) % ids.length]; if(!next.prices[next.sched[k]]) next.prices[next.sched[k]] = routeById(next.sched[k]).basePrice; }
  else if(what === 'ob') next.onboard = a;
  if(next.deps) next.deps = withPlan(next, () => TIME.day(ourPlane(), next.sched).trips.map(t => t.dep));
  const ok = withPlan(next, () => !next.sched.length || schedFits(next.sched));
  if(!ok){ toast("That timetable won't fit in the operating day."); return; }
  setPlan(i, next);
}
function testPlan(){ if(!S.rnd.test) S.rnd.test = JSON.parse(JSON.stringify(currentPlan())); return S.rnd.test; }

/* ---------- the plan editor: only the controls introduced so far ---------- */
function stepper(i, key, val, sub, o){
  o = o || {};
  return `<div class="pe-step ${o.cls || ''}"><button class="pe-b" data-pe="${i}|${key}|-1" aria-label="less" ${o.noLess ? 'disabled' : ''}>−</button><b class="pe-v mono">${val}</b><button class="pe-b" data-pe="${i}|${key}|1" aria-label="more" ${o.noMore ? 'disabled' : ''}>+</button>${sub ? `<small>${sub}</small>` : ''}</div>`;
}
function demandStrip(id){
  const r = routeById(id), pr = profileOf(r), s0 = dayStart(), e0 = dayEnd(), span = e0 - s0, X = m => (100 * (m - s0) / span).toFixed(2);
  const bands = [['morning', s0, 600], ['midday', 600, 960], ['evening', 960, e0]], dens = bands.map(([b, a, z]) => pr[b] / Math.max(1, (z - a) / 60)), mx = Math.max(...dens);
  return `<div class="dstrip"><span class="ds-l">${flagSvg(r.flag, 14)} ${esc(r.city)}: who wants to fly when</span><div class="ds-bar">${bands.map(([b, a, z], k) => `<i class="ds-b ${b}" style="left:${X(a)}%;width:${(100 * (z - a) / span).toFixed(2)}%;--h:${Math.round(100 * dens[k] / mx)}%"><span>${BAND_NAMES[b]}</span></i>`).join('')}</div></div>`;
}
function planEditor(i, pl, L, o){
  o = o || {}; const p = ourPlane(), routes = S.phase === 'setup' ? [S.market] : plannerRoutes(), c = serviceCounts(pl.sched), per = depsOn(), maxT = WORLD.maxTrips || 4;
  const routeBlock = id => { const r = routeById(id), fare = pl.prices[id] || r.basePrice, F = r.fares || [r.basePrice], n = c[id] || 0;
    return `<div class="pe-route ${n ? 'on' : ''}"><div class="pe-rh">${flagSvg(r.flag, 22)}<b>${esc(r.city)}</b>${per ? `<span class="muted">${n} service${n === 1 ? '' : 's'}</span>` : ''}</div>
      ${per ? '' : `<div class="pe-f"><span class="label">Services</span>${stepper(i, 'svc|' + id, '×' + n, `${n * p.seats} seats`, { noLess: n === 0, noMore: pl.sched.length >= maxT })}</div>`}
      <div class="pe-f"><span class="label">Fare</span>${stepper(i, 'fare|' + id, money(fare), `<b class="mono">${paxWant(r, fare)}</b> want to fly`, { noLess: fare <= F[0], noMore: fare >= F[F.length - 1] })}</div></div>`; };
  const snacks = snacksOn() ? `<div class="pe-ob"><span class="label">On board</span>${Object.keys(ONBOARD).map(k => `<button class="opt-chip ${(pl.onboard || 'none') === k ? 'on' : ''}" data-pe="${i}|ob|${k}|0" aria-pressed="${(pl.onboard || 'none') === k}" title="${esc(ONBOARD[k].sub)}"><b>${esc(ONBOARD[k].label)}</b></button>`).join('')}</div>` : '';
  let services = '';
  if(per){
    const two = secondRouteOn();
    services = `<div class="pe-svcs"><div class="pe-sh"><span class="label">Services and departure times</span><span class="muted small">Out, a turnaround, back, then a turnaround at home.</span><span class="pe-add">${pl.sched.length >= maxT ? '<span class="muted small">4 services is the most one aircraft can fly</span>' : routes.map(id => `<button class="btn small" data-pe="${i}|add|${id}|0">+ ${esc(routeById(id).city)} service</button>`).join('')}</span></div>
      ${(L.services || []).map((s, k) => { const r = routeById(s.route);
        return `<div class="pe-svc ${s.band}"><span class="pe-n">Service ${k + 1}</span>${two ? `<button class="pe-rt" data-pe="${i}|route|${k}|1" title="Change the route">${flagSvg(r.flag, 14)} ${esc(r.city)} ⇄</button>` : `<span class="pe-city">${flagSvg(r.flag, 14)} ${esc(r.city)}</span>`}
          ${stepper(i, 'dep|' + k, fmtTime(s.dep), `back ${fmtTime(s.arr)}`, { cls:'sm' })}<span class="pe-fill ${s.sold >= s.seats ? 'full' : ''}"><b class="mono">${s.sold}/${s.seats}</b><small>${s.sold >= s.seats ? 'full' : `${s.seats - s.sold} empty`}</small></span><span class="pe-band">${BAND_NAMES[s.band]}</span>
          <button class="pe-x" data-pe="${i}|del|${k}|0" title="Remove this service" aria-label="Remove service ${k + 1}">✕</button></div>`; }).join('')}
      </div>`;
  }
  const strips = per ? `<div class="pe-demand">${routes.map(demandStrip).join('')}${miniBar(L.D)}</div>` : '';
  const sum = `<div class="pe-sum"><span><b class="mono">${L.pax}</b> fly</span><span class="${L.empty ? '' : 'muted'}"><b class="mono">${L.empty}</b> empty seat${L.empty === 1 ? '' : 's'}</span><span class="${L.nos ? 'orange' : ''}"><b class="mono">${L.nos}</b> without a seat</span>${L.end ? `<span>busy until <b class="mono">${fmtTime(L.end)}</b></span>` : ''}${opened(3.1) ? `<span class="${L.crews > 1 ? 'orange' : ''}">${L.crews} crew${L.crews > 1 ? 's' : ''}</span>` : ''}${L.fits ? '' : '<span class="red">Doesn\'t fit in the day</span>'}</div>`;
  return `<div class="pe ${o.big ? 'big' : ''} ${o.compact ? 'compact' : ''}">${strips}<div class="pe-routes n${routes.length}">${routes.map(routeBlock).join('')}</div>${snacks}${services}${sum}</div>`;
}
function bindPlanEditor(){
  screen().querySelectorAll('[data-pe]').forEach(b => b.onclick = e => { e.stopPropagation(); const [i, what, a, d] = b.getAttribute('data-pe').split('|'); editPlan(+i, what, a, +d); });
}

/* ---------- the day's steps ---------- */
function startProtoDay(n){
  S.round = n; S.phase = 'round'; S.day = beatDay(n); delete S.needsRestart;
  const f = fleetOne(), w = roundData(n);
  S.rnd = Object.assign(emptyRnd(), { featured:f.uid, focusRoute:schedOf(f)[0] || S.market, headline:w.headline || '', brief:protoBrief(n) });
  S.period = newPeriod('day', S.day);
  if(depsOn() && !Array.isArray(S.deps)) S.deps = TIME.day(ourPlane(), schedOf(f), undefined, null).trips.map(t => t.dep);
  S.steps = [{ t:'hq' }, { t:'planner' }, { t:'costPlan' }, { t:'testIdeas' }].concat(fuelPaid() ? [{ t:'fuelPlan' }] : []).concat([{ t:'ready' }, { t:'fly' }, { t:'results' }]);
  S.rnd.cashStart = S.cash; UI.view = null;
  S.si = 0; S.newRoutes = [];
  refreshPlan();
  addNews((w.news || []).slice(0, 2).map(t => ({ tag:'NEWS', text:t })));
  publish(); render();
}
function protoBrief(n){
  const h = lastDay(), fp = fuelPrice(n), fy = fuelPrice(n - 1), L = [];
  if(h) L.push(`${h.type === 'setup' ? 'Launch day' : 'Yesterday'}: ${h.pax} passengers flew, ${h.profit >= 0 ? 'profit' : 'loss'} ${money(Math.round(Math.abs(h.profit)))}. The details are in Route performance.`);
  const NEW = { 1:'New today: on-board sales. A catering company can supply snacks for your flights.', 2:'New today: fuel. The launch deal is over, so from today the airline buys its own fuel.', 3:'New today: departure times. Some flights were full and others had empty seats: demand changes through the day.', 4:`New today: ${routeById(otherRoute()).city}. One aircraft, two markets.` };
  if(NEW[n]) L.push(NEW[n]);
  if(n >= 3 && fp !== fy) L.push(`Fuel is ${priceL(fp)} a litre today (was ${priceL(fy)}).`);
  return L;
}
function closeDay(){
  UI.view = null; UI.fbI = 0; attachArchive();
  if(S.phase === 'setup'){ startProtoDay(1); return; }
  if(S.round < 4 && periodType() === 'day'){ startProtoDay(S.round + 1); return; }
  if(S.rnd.saving){ keepSavingDone(); return; }
  if(S.round === 4 && periodType() === 'day'){ if(!S.steps.some(s => s.t === 'rop')) S.steps.push({ t:'rop' }); next(); return; }
  const nb = beatStartingOn(S.period.to + 1);
  if(nb === null){ S.steps.push({ t:'protoEnd' }); next(); return; }
  startBeat(nb);
}

/* ---------- the rail: the same five stages every day ---------- */
const STG = {
  plan:{ id:'plan', name:'Plan', done:'Planned', sub:'What will your airline do?' },
  cost:{ id:'cost', name:'Cost', done:'Costed', sub:"Check today's new numbers", steps:['costPlan'] },
  test:{ id:'test', name:'Test', done:'Ideas tested', sub:'Try other ideas with the model', steps:['testIdeas'] },
  go:{ id:'go', name:'Operate', done:'Ready to fly', sub:'Fly the plan', steps:['fuelPlan', 'ready'] },
  review:{ id:'review', name:'Review', done:'Reviewed', sub:'What happened?', steps:['results'] } };
const stg = (k, steps) => Object.assign({}, STG[k], steps ? { steps } : {});
STAGES.launch = [{ id:'air', name:'Airline ready', done:'Airline ready', sub:'Aircraft and first market', steps:['starter', 'market'] }, stg('plan', ['demand', 'rotation', 'timetable', 'fareTry']), stg('cost'), stg('test'), stg('go', ['ready']), stg('review')];
STAGES.day = [stg('plan', ['planner']), stg('cost'), stg('test'), stg('go'), stg('review')];
STAGES.week = [stg('plan', ['review', 'planner']), stg('cost'), stg('test'), stg('go'), stg('review', ['sim', 'results'])];
Object.assign(RAIL_LABEL, { costPlan:"Today's new numbers", testIdeas:'Try other ideas', results:'Results', sim:'Run', fareTry:'Fare', planner:'Your plan', strategy:'Airline type' });
Object.assign(SUB_DESC, { costPlan:'The new calculation', testIdeas:'The model costs your ideas', results:'What happened', timetable:'How many services', fareTry:'The ticket price', planner:'Services, fares and extras', strategy:'What sort of airline?' });
Object.assign(STEP_HINT, {
  planner:'Plan what your airline will do. Only the controls you have learned about are here.',
  costPlan:'Check the new numbers: complete the highlighted figure. Everything else is worked out by the model.',
  testIdeas:'Change the test plan to try an idea. The model costs it straight away: no sums.',
  fareTry:'Choose a fare for your first route. Watch how many people want to fly.',
  ready:'Check the operating plan. Anything can still be edited before operations start.',
  strategy:'Your airline is growing. What sort of airline will it become?' });
function stageSummary(id){
  const f = fleetOne(), p = ourPlane(), sched = f ? schedOf(f) : [];
  if(id === 'air') return [S.fleet.length ? p.name.replace(/^DHC-6 /, '') : '', S.market ? routeById(S.market).city : ''].filter(Boolean).join(' · ');
  if(id === 'plan') return sched.length ? svcLabel(sched) : '';
  if(id === 'cost') return S.rnd.costed ? `profit ${money(S.rnd.costed.v.profit)}` : '';
  if(id === 'test'){ const n = (S.rnd.ideas || []).length; return S.rnd.myForecast ? `${S.rnd.myForecast.plan}${n ? ` · ${n} idea${n > 1 ? 's' : ''} saved` : ''}` : ''; }
  if(id === 'go') return '';
  return campaignSummary(id);
}
function railValue(t, i){
  const f = fleetOne(), p = ourPlane(), sched = f ? schedOf(f) : [], passed = i < reach() && i !== S.si;
  if(t === 'starter') return f ? `${p.name.replace(/^DHC-6 /, '')} · ${p.seats} seats` : '';
  if(t === 'market') return S.market ? `${routeById(S.market).city} · ${paxFor(routeById(S.market), routeById(S.market).basePrice)} a day` : '';
  if(t === 'demand'){ const r = S.market && routeById(S.market); return passed && r ? `${paxFor(r, r.basePrice)} want to fly · ${p.seats} seats` : ''; }
  if(t === 'rotation'){ if(!passed || !S.market) return ''; const D = TIME.day(p, [S.market, S.market], undefined, null); return `ready again ${fmtTime(D.trips[1].dep)}`; }
  if(t === 'timetable' || t === 'planner') return sched.length ? planLabel(currentPlan()) : '';
  if(t === 'fareTry') return passed && S.market ? `${money(fareOf(S.market))} · ${wantOf(S.market)} people` : '';
  if(t === 'fuelPlan'){ const o = S.rnd.fuelOrder; if(o) return `${num(o.litres)} L ordered · ${money(o.total)}`; return passed ? `tank covers it (${num(S.fuel)} L)` : ''; }
  if(t === 'costPlan') return S.rnd.costed ? `profit ${money(S.rnd.costed.v.profit)}` : '';
  if(t === 'testIdeas') return S.rnd.myForecast ? `${S.rnd.myForecast.plan} · ${money(S.rnd.myForecast.profit)}` : '';
  return '';
}
function editStep(what){
  const k = railKind();
  if(k === 'month' || k === 'year') return what === 'forecast' && k === 'year' ? 'yearPlan' : 'plans';
  if(what === 'forecast') return 'testIdeas';
  if(S.phase === 'setup') return what === 'fare' ? 'fareTry' : 'timetable';
  return 'planner';
}

/* ---------- PLAN ---------- */
const PLAN_STORY = {
  3.1:['A catering company can supply snacks for your flights.', 'Selling snacks brings in money, but the stock costs money too. Free snacks cost more but passengers like them.'],
  3.2:['The launch deal is over. From today your airline buys its own fuel.', 'Does yesterday\'s plan still make sense now that fuel costs money?'],
  3.3:['Yesterday some flights were full and others had empty seats. People want to fly at different times of day.', `You can now choose a departure time for each service. A crew can work ${fmtDur(WORLD.crewDutyMin || 720)}, from half an hour before the first departure to half an hour after the last landing. A longer day needs a second crew (${money(WORLD.crewCost || 250)}).`],
  3.4:['A second market is open. Your one aircraft can now fly to two places.', 'How should its day be shared between them? Add a service, or change a service\'s route with ⇄.'] };
R.planner = () => {
  const p = ourPlane(), pl = currentPlan(), L = planLines(pl), W = PW(), per = W.span !== 'day', st = progress();
  const story = !per ? (PLAN_STORY[st] || []) : [];
  const gantt = depsOn() ? '' : `<section class="pnl"><div class="pnl-h"><h3>Operating day</h3><span class="muted">${WORLD.dayStart}–${WORLD.dayEnd}</span></div>${serviceGantt(pl.sched, { full:true })}</section>`;
  const groups = depsOn() ? '' : `<section class="pnl"><div class="pnl-h"><h3>Expected passengers per service</h3>${paxKey()}</div>${plannerRoutes().filter(id => pl.sched.includes(id)).map(id => paxGroups(paxWant(routeById(id), fareOf(id)), p.seats, serviceCounts(pl.sched)[id] || 0, { small:true })).join('') || '<p class="muted">No services yet.</p>'}</section>`;
  screen().innerHTML = taskFrame({ question: per ? `What will your airline fly ${W.now}?` : 'What will your airline do today?', work:false, story,
    say:`Plan what your airline will do ${W.now}. ` + plannerRoutes().map(id => `${routeById(id).city}: ${paxWant(routeById(id), fareOf(id))} people want to fly at ${money(fareOf(id))}.`).join(' '),
    context: ctxAircraft(), help:['timing', 'demand'],
    main:`<div class="planner2"><section class="pnl"><div class="pnl-h"><h3>Your plan</h3><span class="muted">${esc(planLabel(pl))}</span></div>${planEditor(0, pl, L, { big:true })}</section>${gantt}${groups}</div>`,
    foot:`<span class="grow"></span><button class="btn primary big" id="nx" ${pl.sched.length && L.fits ? '' : 'disabled'}>${pl.sched.length ? goLabel('Cost this plan') : 'Choose some services'} &#9654;</button>` });
  bindPlanEditor();
  on('nx', () => { S.rnd.focusRoute = schedOf(fleetOne())[0]; S.rnd.test = null; advance(); });
};

/* ---------- COST: today's new numbers ---------- */
function costLabels(){ const a = routeById(S.market), b = routeById(otherRoute()); return { pax1:`${a.city} passengers`, fare1:`${a.city} fare`, tk1:`${a.city} tickets`, pax2:`${b.city} passengers`, fare2:`${b.city} fare`, tk2:`${b.city} tickets` }; }
const COST_ROWS = () => TABLES.cost1.rows;
function typedRow(id){ const r = COST_ROWS().find(x => x.id === id); return !!(r && r.tool && toolLevel(r.tool) !== 'model'); }
function costRowIds(L, pl){
  const v = L.v, two = secondRouteOn() && pl.sched.includes(otherRoute()), sn = snacksOn() && (pl.onboard || 'none') !== 'none', ids = [];
  if(typedRow('tk1')) ids.push('pax1', 'fare1'); ids.push('tk1');
  if(two){ if(typedRow('tk2')) ids.push('pax2', 'fare2'); ids.push('tk2'); }
  if(sn){ if(typedRow('snack')) ids.push('buyers', 'snackP'); ids.push('snack'); }
  ids.push('rev');
  if(fuelPaid() && typedRow('fuel')) ids.push('fuelL', 'ppl', 'fuel');   // fuel gets its own lines on the day it is introduced
  ids.push('cost', 'profit');                                           // the other costs are the model's: "What's in this?" shows them
  return ids;
}
const NEW_TODAY = { revenue:'Ticket revenue = passengers × fare', profit:'Profit = total revenue − total costs', snacks:'Cabin sales = number buying × price', fuelCost:'Fuel cost = litres × price per litre', emptySeats:'Empty seats = seats − passengers', routeRevenue:'Revenue on the new route = passengers × fare', weekly:'Projected profit = profit a day × days' };
function newIdeas(tables){ const ids = []; tables.filter(Boolean).forEach(t => tRows(t).forEach(r => { if(r.tool && rowTyped(t, r) && !ids.includes(r.tool)) ids.push(r.tool); })); return ids; }
function weekLines(pl){
  const L = dryRun(() => { S.fuelLots = []; S.fuel = 0; S.fuelValue = 0; S.rnd.fuelOrder = null; return planLines(pl); }), n = pDays(), v = L.v;
  return Object.assign({}, L, { day:L, v:{ revDay:v.rev, costDay:v.cost, profitDay:v.profit, days:n, wproj:v.profit * n, rev:v.rev * n, cost:v.cost * n, profit:v.profit * n, fuel:v.fuel * n },
    parts:{ costDay:[['Flights', money(v.run)], ['Fuel at today\'s price', money(v.fuel)], ['Terminal charges', money(v.term)], ['Snack stock', money(v.stock)], ['Second crew', money(v.crew)], ["Aircraft's day", money(v.day)]] } });
}
function weekProjected(){ return S.phase === 'round' && PW().span === 'week' && !!roundData(S.round).noReview; }
function linesFor(pl){ const sp = PW().span; return sp === 'day' ? planLines(pl) : weekProjected() ? weekLines(pl) : periodLines(pl); }
R.costPlan = () => {
  const pl = currentPlan(), W = PW(), sp = W.span, setup = S.phase === 'setup';
  let t, t2 = null, L, title, intro = '';
  if(sp === 'day'){
    L = planLines(pl);
    const tid = 'cost:' + S.day, prev = S.rnd.tables[tid];
    const v0 = L.v, parts = { run:flightParts(pl.sched), cost:[['Flights', money(v0.run)]].concat(fuelPaid() ? [['Fuel', money(v0.fuel)]] : []).concat([['Terminal charges', money(v0.term)]]).concat(v0.stock ? [['Snack stock', money(v0.stock)]] : []).concat(v0.crew ? [['Second crew', money(v0.crew)]] : []).concat([["Aircraft's day", money(v0.day)]]) };
    t = ensureTable(tid, 'cost1', [{ id:'a', label:'Your plan', sub:svcLabel(pl.sched), values:Object.assign({}, L.v), parts }], { rowIds:costRowIds(L, pl), labels:costLabels() });
    if(t !== prev && !(setup && !prev)) t.active = null;
    if(toolMet('emptySeats') && toolLevel('emptySeats') !== 'model' && L.services.length){
      const s = L.services, pick = S.rnd.emptyK !== undefined && s[S.rnd.emptyK] ? S.rnd.emptyK : s.reduce((b, x, k) => (x.seats - x.sold) > (s[b].seats - s[b].sold) ? k : b, 0), x = s[pick];
      S.rnd.emptyK = pick;
      const tid2 = `empty:${S.day}:${pick}`, prev2 = S.rnd.tables[tid2];
      t2 = ensureTable(tid2, 'empty1', [{ id:'s', label:`Service ${pick + 1} · ${fmtTime(x.dep)}`, sub:routeById(x.route).city, values:{ seats:x.seats, flown:x.sold, empty:x.seats - x.sold } }]);
      if(t2 !== prev2) t2.active = null;
      S.rnd.activeTable = (t2.active ? t2 : t).id;
    }
    title = "Check today's new numbers";
  } else if(weekProjected()){
    L = weekLines(pl);
    const tid = 'wcost:' + S.day, prev = S.rnd.tables[tid];
    t = ensureTable(tid, 'week1', [{ id:'a', label:'Your plan', sub:'one day, then the week', values:L.v, parts:L.parts }]); if(t !== prev) t.active = null;
    title = 'Project the week';
    intro = `<p class="c2-note">Your regular plan runs every day this week. Use one day's figures to project the whole week.</p>`;
  } else {
    L = periodLines(pl);
    const tid = 'pcost:' + S.day + ':' + orderL(), prev = S.rnd.tables[tid];
    t = ensureTable(tid, 'periodPlan2', [{ id:'a', label:'Your plan', sub:fmtRange(S.period.from, S.period.to), values:L.v, parts:L.parts }], { rowIds:['revDay', 'days', 'rev', 'opsDay', 'ops', 'fuel', 'cost', 'profit'], labels:periodLabels() }); if(t !== prev) t.active = null;
    title = `Your plan ${W.now}`;
    intro = `<p class="c2-note">Nothing new to work out ${W.now}: the model has costed your plan.</p>`;
  }
  const done = tableComplete(t) && (!t2 || tableComplete(t2)), fresh = newIdeas([t, t2]), calc = t2 && t2.active ? t2 : t;
  const spot = fresh.length ? `<div class="c2-new"><span class="label">New today</span>${fresh.map(id => `<b>${esc(NEW_TODAY[id] || TOOL[id].name)}</b>`).join('')}</div>` : '';
  const svcList = t2 ? `<div class="c2-svcl">${L.services.map((s, k) => `<button class="c2-s ${k === S.rnd.emptyK ? 'on' : ''}" data-esel="${k}" ${tableComplete(t2) || k === S.rnd.emptyK ? 'disabled' : ''}><b>Service ${k + 1}</b><span class="mono">${fmtTime(s.dep)}</span><span>${esc(routeById(s.route).city)}</span><span class="mono ${s.sold >= s.seats ? 'green' : 'orange'}">${s.sold}/${s.seats}</span></button>`).join('')}</div>` : '';
  screen().innerHTML = taskFrame({ question:title, work: fresh.length > 0, calc,
    story: setup ? ['This is the one place today where you check the numbers yourself. The model works out everything else.'] : [],
    say: fresh.length ? `Check today's new numbers. ${fresh.map(id => NEW_TODAY[id] || '').join('. ')}.` : 'The model has costed your plan.',
    context:{ title:'Your plan', html: cxSec('The plan', `<p class="cx-plan">${esc(planLabel(pl))}</p>`) + cxSec('Profit', kv([['Total revenue', `<span class="mono">${done ? money(L.v.rev) : '—'}</span>`], ['Total costs', `<span class="mono">${done ? money(L.v.cost) : '—'}</span>`], ['Profit', done ? `<span class="mono ${L.v.profit >= 0 ? 'green' : 'red'}">${money(L.v.profit)}</span>` : '<span class="muted">—</span>', 'tot']])) + `<p class="muted cx-note">${done ? 'Next: try other ideas. The model costs them for you.' : 'Choose <b>Complete figure</b> to work out the new figure.'}</p><button class="link" data-archive>Compare with earlier days</button>` },
    main:`<div class="cost2">${spot}${intro}<div class="c2-g ${t2 ? 'two' : ''}"><section class="pnl c2-sheet"><div class="sheet1">${tableHtml(t)}</div></section>${t2 ? `<section class="pnl c2-empty"><div class="pnl-h"><h3>One service</h3><span class="muted">How well is the aircraft used?</span></div>${svcList}<div class="sheet1">${tableHtml(t2)}</div></section>` : ''}</div></div>`,
    foot:`<button class="btn primary big" id="nx" ${done ? '' : 'disabled'}>${goLabel(done ? 'Test other ideas' : 'Complete the new figures first')} &#9654;</button>` });
  bindTable(t); if(t2) bindTable(t2);
  screen().querySelectorAll('[data-esel]').forEach(b => b.onclick = () => { S.rnd.emptyK = +b.getAttribute('data-esel'); resetEntry(); render(); });
  on('nx', () => { S.rnd.costed = { label:planLabel(pl), key:planKey(pl), v:Object.assign({}, L.v, sp === 'day' ? {} : { rev:L.v.rev, cost:L.v.cost, profit: weekProjected() ? L.v.wproj : L.v.profit }) }; S.rnd.costedTools = fresh; S.rnd.test = null; resetEntry(); UI.justDone = null; advance(); });
};

/* ---------- TEST: try other ideas with the model ---------- */
function modelRows(Lc, Lt, sp){
  const day = sp === 'day', a = Lc.v, b = Lt.v, wk = !day && weekProjected();
  const P = x => wk ? x.wproj : x.profit;
  const rows = (day ? [['Passengers', Lc.pax, Lt.pax, 'n'], ['Empty seats', Lc.empty, Lt.empty, 'n', 'less'], ['Without a seat', Lc.nos, Lt.nos, 'n', 'less']] : [['Passengers a day', (Lc.day || Lc).pax, (Lt.day || Lt).pax, 'n']])
    .concat([['Total revenue', a.rev, b.rev, '£', 'tot'], ['Total costs', a.cost, b.cost, '£', 'tot less'], [wk ? 'Projected profit' : 'Profit', P(a), P(b), '£', 'tot pr']]);
  const f = (u, v) => u === '£' ? money(v) : num(v), dd = (x, y, u, c) => { const d = (y || 0) - (x || 0), good = /less/.test(c || '') ? d < 0 : d > 0; return `<span class="${d && good ? 'up' : d ? 'down' : ''}">${d ? (d > 0 ? '+' : '−') + f(u, Math.abs(d)) : '—'}</span>`; };
  return `<table class="t2-cmp"><thead><tr><th></th>${rows.map(([l, , , , c]) => `<th class="${c || ''}">${l}</th>`).join('')}</tr></thead><tbody>
    <tr><th>Your plan</th>${rows.map(([, x, , u, c]) => `<td class="mono ${c || ''}">${f(u, x || 0)}</td>`).join('')}</tr>
    <tr><th>Test plan</th>${rows.map(([, , y, u, c]) => `<td class="mono ${c || ''}">${f(u, y || 0)}</td>`).join('')}</tr>
    <tr class="dif"><th>Difference</th>${rows.map(([, x, y, u, c]) => `<td class="mono ${c || ''}">${dd(x, y, u, c)}</td>`).join('')}</tr></tbody></table>`;
}
function forecastOf(L, name, pl){
  const sp = PW().span, v = L.v;
  if(sp === 'day') return { profit:v.profit, revenue:v.rev, run:v.run + v.term + v.stock, fuel:v.fuel, over:v.day, crew:v.crew, plan:name, key:planKey(pl) };
  if(weekProjected()) return { profit:v.wproj, revenue:v.rev, ops:v.cost - v.fuel, fuel:v.fuel, plan:name, key:fcKey(pl), projected:true };
  return { profit:v.profit, revenue:v.rev, ops:v.ops, fuel:v.fuel, plan:name, key:fcKey(pl) };
}
R.testIdeas = () => {
  const sp = PW().span, cur = currentPlan(), test = testPlan(), Lc = linesFor(cur), Lt = linesFor(test), same = planKey(cur) === planKey(test), wk = sp !== 'day' && weekProjected();
  const P = x => wk ? x.v.wproj : x.v.profit, d = P(Lt) - P(Lc), ideas = S.rnd.ideas || (S.rnd.ideas = []);
  if(!S.rnd.unlockShown){ S.rnd.unlockShown = true; (S.rnd.costedTools || []).filter(id => TOOL[id]).forEach(id => { const T = TOOL[id]; sysNotice(`${T.name} model online · ${S.airline.name || 'Your airline'} can now work out ${T.name.toLowerCase()} automatically when you test different options.`); }); }
  const chip = same ? '<div class="t2-diff">Change the test plan to try an idea. The model costs it straight away.</div>'
    : `<div class="t2-diff ${d >= 0 ? 'up' : 'down'}"><b class="mono">${d >= 0 ? '+' : '−'}${money(Math.abs(d))}</b><span>${d >= 0 ? 'more' : 'less'} ${wk ? 'projected ' : ''}profit than your plan${sp === 'day' ? '' : ' ' + PW().now}</span></div>`;
  const cards = ideas.map((x, k) => `<div class="idea"><div class="id-h"><b>Idea ${k + 1}</b><span class="mono ${x.profit >= 0 ? 'green' : 'red'}">${money(x.profit)}</span></div><small>${esc(x.label)}</small><div class="id-a"><button class="link" data-iload="${k}">Load into the test plan</button><button class="btn small" data-ifly="${k}">Fly this ▶</button></div></div>`).join('');
  const saved = ideas.some(x => planKey(x.plan) === planKey(test));
  screen().innerHTML = taskFrame({ question:'Try other ideas', work:false,
    story: S.phase === 'setup' ? ['Your plan is costed. Now change the test plan to try other ideas: the model works out every figure for you.'] : [],
    say:'Try other ideas. Change the test plan; the model costs it straight away.',
    context:{ title:'Ideas', html: cxSec('Saved ideas', cards || '<p class="muted">Ideas you save appear here.</p>') +
      `<div class="pl-choose"><button class="btn" data-isave ${same || saved ? 'disabled' : ''}>Save this idea</button><button class="btn ${same || d < 0 ? 'primary' : ''}" data-fmine>${goLabel('Fly my plan')} &#9654;</button><button class="btn ${!same && d >= 0 ? 'primary' : ''}" data-ftest ${same ? 'disabled' : ''}>Fly the test plan &#9654;</button></div>
      <p class="muted cx-note">Bigger profit is not the only thing: think about passengers left without a seat.</p><button class="link" data-archive>Compare with earlier days</button>` },
    main:`<div class="test2"><div class="t2-mine"><span class="label">Your plan</span><b>${esc(planLabel(cur))}</b><span class="t2-mp mono ${P(Lc) >= 0 ? 'green' : 'red'}">${money(P(Lc))}</span></div>
      <section class="pnl t2-test"><div class="pnl-h"><h3>Test plan</h3>${same ? '' : '<button class="link" data-treset>Start again from your plan</button>'}</div>${planEditor(9, test, Lt.day || Lt, { compact:true })}</section>
      <section class="pnl t2-model"><div class="pnl-h"><h3>What the model says</h3>${chip}</div>${modelRows(Lc, Lt, sp)}</section></div>` });
  bindPlanEditor();
  const fly = (pl, L, name) => { if(planKey(pl) !== planKey(currentPlan())){ const f = fleetOne(); setSchedule(f.uid, pl.sched.slice()); Object.assign(S.prices, pl.prices); S.firstDep = pl.firstDep; S.onboard = pl.onboard; S.deps = pl.deps ? pl.deps.slice() : null; refreshPlan(); }
    S.rnd.myForecast = forecastOf(L, name, currentPlan());
    S.rnd.archive = { costed: S.rnd.costed ? { label:S.rnd.costed.label, profit: wk ? S.rnd.costed.v.profit : S.rnd.costed.v.profit } : null, ideas: ideas.map((x, k) => ({ name:`Idea ${k + 1}`, label:x.label, profit:x.profit })), flown:{ name, label:planLabel(currentPlan()), profit:P(L) } };
    S.rnd.test = null; resetEntry(); UI.justDone = null; advance(); };
  screen().querySelectorAll('[data-isave]').forEach(b => b.onclick = () => { ideas.push({ plan:JSON.parse(JSON.stringify(test)), label:planLabel(test), profit:P(Lt) }); render(); });
  screen().querySelectorAll('[data-iload]').forEach(b => b.onclick = () => { S.rnd.test = JSON.parse(JSON.stringify(ideas[+b.getAttribute('data-iload')].plan)); render(); });
  screen().querySelectorAll('[data-ifly]').forEach(b => b.onclick = () => { const k = +b.getAttribute('data-ifly'), pl = ideas[k].plan; fly(pl, linesFor(pl), `Idea ${k + 1}`); });
  screen().querySelectorAll('[data-treset]').forEach(b => b.onclick = () => { S.rnd.test = null; render(); });
  screen().querySelectorAll('[data-fmine]').forEach(b => b.onclick = () => fly(cur, Lc, 'Your plan'));
  screen().querySelectorAll('[data-ftest]').forEach(b => b.onclick = () => { const k = ideas.findIndex(x => planKey(x.plan) === planKey(test)); fly(test, Lt, k >= 0 ? `Idea ${k + 1}` : 'Test plan'); });
};
/* Models online are announced when the day's new idea has been worked out (see TEST), not by a separate check. */
function checkTools(){ if(!S || !S.steps) return; const now = {}; TOOLS.forEach(T => { now[T.id] = toolLevel(T.id); }); S.toolSeen = now; }

/* ---------- OPERATE: the operating plan ---------- */
R.ready = () => {
  const f = fleetOne(), p = ourPlane(), sched = schedOf(f), need = periodNeed(), o = S.rnd.fuelOrder, after = S.fuel + (o ? o.litres : 0), fc = S.rnd.myForecast, setup = S.phase === 'setup', per = PW().span !== 'day', paid = fuelPaid();
  const fcOk = !!(fc && fc.key === fcKey(currentPlan())), fuelOk = !paid || after >= need || per, ok = sched.length > 0 && fcOk && fuelOk && readyOk();
  const D = sched.length ? TIME.day(p, sched) : null, ids = Object.keys(serviceCounts(sched));
  const row = (label, value, edit, good, warn) => `<div class="op-row ${good ? 'ok' : 'warn'}"><span class="op-l">${label}</span><span class="op-v">${value}</span><span class="op-s">${good ? '&#10003;' : esc(warn)}</span>${edit ? `<button class="btn small" data-edit="${edit}">Edit</button>` : '<span></span>'}</div>`;
  const rows = [
    row('Timetable', `${esc(svcLabel(sched))}${D ? ` · <span class="mono">${D.trips.map(t => fmtTime(t.dep)).join(', ')}</span>` : ''}`, editStep('timetable'), sched.length > 0, 'No services'),
    row(ids.length > 1 ? 'Fares' : 'Fare', ids.map(id => `${esc(routeById(id).city)} <span class="mono">${money(fareOf(id))}</span>`).join(' · ') || '—', editStep('fare'), true),
    snacksOn() ? row('On board', esc(onboardOf().label), editStep('extras'), true) : '',
    fuelContract() ? row('Fuel', `Bought as it is used at <span class="mono">${priceL(fuelPrice())}</span> a litre ${PW().now}`, '', true) : row('Fuel', paid ? `<span class="mono">${num(S.fuel)} L</span> in the tank${o ? ` + <span class="mono">${num(o.litres)} L</span> on order` : ''} · flights burn <span class="mono">${num(need)} L</span>${per && after < need ? ` · <span class="orange">${num(need - after)} L delivered</span>` : ''}` : 'Supplied free by the launch deal', paid ? 'fuelPlan' : '', fuelOk, 'Not enough fuel'),
    row(fc && fc.projected ? 'Projected profit' : 'Profit (model)', fc ? `${esc(fc.plan || 'Your plan')} · <span class="mono ${fc.profit >= 0 ? 'green' : 'red'}">${money(fc.profit)}</span>` : '—', editStep('forecast'), fcOk, fc ? 'The plan has changed: test it again' : 'Not costed yet'), readyExtra(row)].join('');
  screen().innerHTML = taskFrame({ question: readyTitle(), work:false,
    say: ok ? 'The operating plan is ready. Send it to the Operations Wall when you are ready to watch it fly.' : 'Some items need updating before operations can start.',
    context: ctxForecast(),
    main:`<div class="opplan"><div class="op-head"><span class="label">Operating plan</span><b>${setup ? 'Launch Day' : railTitle()[0].replace(/ Plan$/, '')} · ${esc(homeData().code)} ${esc(terminalData().name || '')}</b></div>${rows}</div>
      <div class="launch"><button class="btn primary huge go" id="startOps" ${ok ? '' : 'disabled'}>${goWord()}</button><p class="muted">${ok ? (o ? `Your fuel order (<span class="mono">${money(o.total)}</span>) is paid when operations start.` : paid ? 'The aircraft is fuelled and the plan is costed.' : 'The plan is costed. The launch deal supplies the fuel.') : 'Update the items marked above first.'}</p></div>` });
  on('startOps', () => { const x = S.rnd.fuelOrder; if(x){ buyFuel(x.litres, x.price); S.rnd.fuelOrder = null; } delete S.rnd.returnTo; resetEntry(); UI.view = null; next(); });
};
function ctxForecast(){
  const fc = S.rnd.myForecast;
  if(!fc) return { title:'The plan', html:'<p class="muted">The figures appear here once the plan is costed.</p>' };
  return { title:'The plan', html: cxSec(esc(fc.plan || 'Your plan'), kv([['Revenue', `<span class="mono">${money(fc.revenue)}</span>`], ['Costs', `<span class="mono">${money(fc.revenue - fc.profit)}</span>`], [fc.projected ? 'Projected profit' : 'Profit', `<span class="mono ${fc.profit >= 0 ? 'green' : 'red'}">${money(fc.profit)}</span>`, 'tot']])) };
}

/* ---------- End of Day 4: the Regular Operating Plan ---------- */
R.rop = () => {
  const pl = currentPlan(), L = planLines(pl), D = L.D;
  const rows = [['Timetable', esc(svcLabel(pl.sched))], ['Departures', D ? `<span class="mono">${D.trips.map(t => fmtTime(t.dep)).join(', ')}</span>` : '—'], ['Fares', Object.keys(serviceCounts(pl.sched)).map(id => `${esc(routeById(id).city)} <span class="mono">${money(fareOf(id))}</span>`).join(' · ')], ['On board', esc(onboardOf().label)],
    ['Fuel', `Bought as it is used, at each week's price, until the monthly plans.${S.fuel > 0 ? ` The ${num(S.fuel)} L left in the tank go back to the supplier for what you paid (${money(Math.round(S.fuelValue))}).` : ''}`], ['Profit a day (model)', `<span class="mono ${L.v.profit >= 0 ? 'green' : 'red'}">${money(L.v.profit)}</span>`]];
  screen().innerHTML = shell(`<div class="hp milestone rop">${hqHead('End of Day 4', 'REGULAR OPERATION')}<div class="ms-in"><span class="label">Regular Operating Plan</span><h1>Approve your regular plan</h1>
    <p>From now on this plan runs every day by itself. You only change it when the figures say you should.</p>
    <div class="rop-t">${rows.map(([l, v]) => `<div><span>${l}</span><b>${v}</b></div>`).join('')}</div>
    ${UI.ropEdit ? `<section class="pnl rop-ed">${planEditor(0, pl, L)}</section>` : ''}
    <div class="row" style="justify-content:center"><button class="btn big" id="ropEdit">${UI.ropEdit ? 'Done changing' : 'Change the plan first'}</button><button class="btn primary big" id="ropGo">Approve the plan &#9654;</button></div></div></div>`);
  bindPlanEditor();
  on('ropEdit', () => { UI.ropEdit = !UI.ropEdit; render(); });
  on('ropGo', () => { UI.ropEdit = false; S.rop = Object.assign({ approved:S.day }, currentPlan()); returnTankFuel(); startBeat(5); });
};

function returnTankFuel(){
  if(!(S.fuel > 0)) return; const v = r2(S.fuelValue), L = S.fuel;
  S.cash = r2(S.cash + v); S.fuel = 0; S.fuelValue = 0; S.fuelLots = [];
  addNews([{ tag:'FUEL', text:`${num(L)} L of fuel returned to the supplier: ${money(Math.round(v))} back. From now on fuel is bought as it is used.` }]);
}
/* ---------- the Year 1 review: what sort of airline will you become? ---------- */
R.strategy = () => {
  const cur = S.airline.strategy, pick = STRATEGIES.find(x => x.id === cur);
  screen().innerHTML = taskFrame({ question:'What sort of airline will you become?', work:false,
    story:['For a year the aim was simple: make as much profit as you can. Now the airline is growing.', 'Each type of airline makes money a different way. It will shape your fares, your service and your passengers.'],
    say:'What sort of airline will you become? ' + STRATEGIES.map(x => `${x.name}: ${x.slogan}. ${x.text}`).join(' '),
    context:{ title:'Year 1', html: kv([['Passengers', num(S.history.reduce((t, x) => t + (x.pax || 0), 0))], ['Cash', `<span class="mono gold">${money(Math.round(S.cash))}</span>`]]) },
    main:`<div class="strats ${pick ? 'has-pick' : ''}">${STRATEGIES.map(x => `<button class="strat ${cur === x.id ? 'on' : ''}" data-st="${x.id}" aria-pressed="${cur === x.id}">
      <span class="st-name">${esc(x.name)}</span>${cur === x.id ? '<span class="st-on">&#10003; Selected</span>' : ''}<b class="st-slogan">${esc(x.slogan)}</b><span class="st-tags">${x.tags.map(esc).join(' · ')}</span><span class="st-text">${esc(x.text)}</span></button>`).join('')}</div>`,
    foot:`<button class="btn primary big" id="nx" ${pick ? '' : 'disabled'}>${pick ? `Become a ${esc(pick.name.toLowerCase())} airline` : 'Choose one'} &#9654;</button>` });
  screen().querySelectorAll('[data-st]').forEach(b => b.onclick = () => { S.airline.strategy = b.getAttribute('data-st'); render(); });
  on('nx', () => { addNews([{ tag:'STRATEGY', text:`${S.airline.name} will be a ${pick.name.toLowerCase()} airline.`, cls:'good' }]); advance(); });
};
STAGES.buy = [{ id:'yr', name:'Year 1 review', done:'Year reviewed', sub:'Projection against actual', steps:['yearReview', 'strategy'] }].concat((STAGES.buy || []).slice(1));

/* ---------- the plans archive: what was costed, tried and flown, and what happened ---------- */
function attachArchive(){
  const a = S.rnd && S.rnd.archive; if(!a || S.rnd.archived) return; S.rnd.archived = true;
  const H = S.history.filter(x => x.round === S.round); if(!H.length) return;
  const actual = H.reduce((t, x) => t + (x.profit || 0), 0); H[H.length - 1].plans = Object.assign({ actual:Math.round(actual), when: H.length > 1 ? fmtRange(H[0].from, H[H.length - 1].to) : null }, a);
}
function archiveRows(){ return S.history.filter(x => x.plans).slice().reverse(); }
function whenOf(x){ return x.type === 'setup' ? 'Launch day' : x.type === 'day' ? `Day ${x.round} · ${dateShort(x.from)}` : capFirst(x.plans.when || periodShort(x)); }
function plansHtml(){
  const R0 = archiveRows();
  if(!R0.length) return '<div class="pb"><p class="muted">Each day\'s plans appear here after the flights.</p></div>';
  return `<div class="pb"><table class="hq-t arch"><thead><tr><th>When</th><th>Your costed plan</th><th>Best idea tried</th><th>Flown</th><th class="num">Projected</th><th class="num">Actual</th></tr></thead><tbody>${R0.map(x => { const p = x.plans, best = (p.ideas || []).slice().sort((a, b) => b.profit - a.profit)[0];
    return `<tr><td>${esc(whenOf(x))}</td><td>${p.costed ? `${esc(p.costed.label)}<small class="mono">${money(p.costed.profit)}</small>` : '—'}</td><td>${best ? `${esc(best.label)}<small class="mono">${money(best.profit)}</small>` : '<span class="muted">none saved</span>'}</td><td><b>${esc(p.flown.name)}</b></td><td class="num">${money(p.flown.profit)}</td><td class="num ${p.actual >= 0 ? 'green' : 'red'}">${money(p.actual)}</td></tr>`; }).join('')}</tbody></table></div>`;
}
function archiveDockHtml(){
  const R0 = archiveRows().slice(0, 6);
  return R0.length ? R0.map(x => `<section class="cx arch-c"><h4>${esc(whenOf(x))}</h4>${kv([['Flown', `${esc(x.plans.flown.name)}`], ['Plan', `<small>${esc(x.plans.flown.label)}</small>`], ['Projected', `<span class="mono">${money(x.plans.flown.profit)}</span>`], ['Actual', `<span class="mono ${x.plans.actual >= 0 ? 'green' : 'red'}">${money(x.plans.actual)}</span>`, 'tot']])}${(x.plans.ideas || []).length ? `<p class="muted small">${x.plans.ideas.length} idea${x.plans.ideas.length > 1 ? 's' : ''} tried</p>` : ''}</section>`).join('') : '<p class="muted">Earlier days appear here after the first flights.</p>';
}
/* The ƒ inspector: every model figure can show its rule and its numbers. */
function fxHtml(){
  const x = UI.dock.fx || {}, t = S.rnd.tables[x.table]; if(!t) return '<p class="muted">Nothing selected.</p>';
  const col = t.cols.find(c => c.id === x.col), row = tRows(t).find(r => r.id === x.row); if(!col || !row) return '';
  const T = row.tool && TOOL[row.tool];
  return `<div class="calc done fx"><p class="calc-q">${esc(T ? `${T.name}: ${T.what}` : rowLabel(t, row))}</p><div class="cstack">${stackHtml(stackRows(t, col, row))}<div class="cs ans"><span class="cs-op">=</span><span class="cs-l">${esc(rowLabel(t, row))}</span><b class="cs-v mono">${fmtVal(row.unit, col.values[row.id])}</b></div></div><p class="calc-hint">Worked out by the model.</p></div>`;
}
document.addEventListener('click', e => {
  if(IS_DISPLAY || !S) return;
  const a = e.target && e.target.closest ? e.target.closest('[data-archive]') : null;
  if(a){ UI.dock = { mode:'archive', topic:null }; render(); return; }
  const f = e.target && e.target.closest ? e.target.closest('[data-fx]') : null;
  if(f){ const [table, col, row] = f.getAttribute('data-fx').split('|'); UI.dock = { mode:'fx', topic:null, fx:{ table, col, row } }; render(); }
});
