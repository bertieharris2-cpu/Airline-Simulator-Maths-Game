/* ==================================================================
   THE FLEET (week 2 and 3 on the v4 calendar): more than one aircraft, the shop, the jets.
   The plan now carries every aircraft: plan.fleet = [{ uid, planeId, sched, deps }], with fares shared per route and
   one snack choice. plan.sched / plan.deps mirror the first aircraft so older code keeps working.
     - Day 8: the Saab 340, ATR 72 and a second Twin Otter are in the shop (workbook Aircraft shopFromDay); the Finance sheet
       gives the cash price, the rent a day and the launch-deal finance (deposit + daily payments). Rule 4 hand sums:
       price ÷ rent a day (rent-or-buy) and seats × fare (a full plane). Then the aircraft is assigned its own services.
     - Day 15: the E175 and E190 join the shop and Madrid opens; a route needs an aircraft with the range, and the new
       route's flight time is distance ÷ speed by hand (Calendar gatedCalc).
     - Rent and finance payments are cost lines in "Aircraft's day" while they run.
   ================================================================== */
function fmtVal(unit, v){
  if(v === null || v === undefined) return '—';
  if(unit === '£') return money(v); if(unit === 'L') return num(v) + ' L'; if(unit === 'ppl') return priceL(v); if(unit === 'dur') return fmtDur(v);
  if(unit === 'dec') return String(Math.round(v * 100) / 100); if(unit === 'yesno') return v ? 'Yes' : 'No'; if(unit === 'km') return num(v) + ' km'; if(unit === 'kmh') return num(v) + ' km/h'; if(unit === 'h') return num(v) + ' h'; if(unit === 'days') return (Math.round(v * 10) / 10) + ' days';
  return num(v);
}

/* ---------- the plan: every aircraft ---------- */
function fleetDeps(f){ if(!f) return null; if(Array.isArray(f.deps)) return f.deps; return S.fleet[0] && f.uid === S.fleet[0].uid && Array.isArray(S.deps) ? S.deps : null; }
function normPlan(pl){
  if(!pl.fleet){ const f = fleetOne(); pl.fleet = [{ uid:f ? f.uid : 1, planeId:f ? f.planeId : 'dhc6', sched:(pl.sched || []).slice(), deps:pl.deps ? pl.deps.slice() : null }]; }
  pl.sched = pl.fleet[0] ? pl.fleet[0].sched : []; pl.deps = pl.fleet[0] ? pl.fleet[0].deps : null; return pl;
}
function currentPlan(){
  const fleet = S.fleet.map(f => { const d = fleetDeps(f); return { uid:f.uid, planeId:f.planeId, sched:schedOf(f).slice(), deps: depsOn() && Array.isArray(d) ? d.slice() : null }; });
  return normPlan({ fleet, prices:Object.assign({}, S.prices), firstDep:firstDep(), onboard:S.onboard || 'none' });
}
function planKey(pl){ pl = normPlan(pl); return JSON.stringify([pl.fleet.map(x => [x.uid, x.sched, x.deps || null]), pl.fleet.flatMap(x => x.sched).filter((v, i, a) => a.indexOf(v) === i).sort().map(id => [id, pl.prices[id]]), pl.firstDep, pl.onboard]); }
function withPlan(pl, fn){
  pl = normPlan(pl);
  const keep = S.fleet.map(f => ({ schedule:f.schedule, route:f.route, deps:f.deps })), kp = { prices:S.prices, dep:S.firstDep, ob:S.onboard, deps:S.deps };
  try{
    pl.fleet.forEach(x => { const f = S.fleet.find(y => y.uid === x.uid); if(!f) return; f.schedule = x.sched.slice(); f.route = x.sched[0] || null; f.deps = x.deps ? x.deps.slice() : null; });
    S.prices = Object.assign({}, pl.prices); S.firstDep = pl.firstDep; S.onboard = pl.onboard; S.deps = pl.fleet[0] && pl.fleet[0].deps ? pl.fleet[0].deps.slice() : null;
    return fn();
  } finally { S.fleet.forEach((f, k) => { if(keep[k]) Object.assign(f, keep[k]); }); S.prices = kp.prices; S.firstDep = kp.dep; S.onboard = kp.ob; S.deps = kp.deps; }
}
function applyPlan(pl){
  pl = normPlan(pl);
  pl.fleet.forEach(x => { const f = S.fleet.find(y => y.uid === x.uid); if(!f) return; setSchedule(f.uid, x.sched.slice()); f.deps = x.deps ? x.deps.slice() : null; });
  Object.assign(S.prices, pl.prices); S.firstDep = pl.firstDep; S.onboard = pl.onboard; S.deps = pl.fleet[0] && pl.fleet[0].deps ? pl.fleet[0].deps.slice() : null; refreshPlan();
}
function applyPlanRaw(pl){ pl = normPlan(pl); pl.fleet.forEach(x => { const f = S.fleet.find(y => y.uid === x.uid); if(!f) return; f.schedule = x.sched.slice(); f.route = x.sched[0] || null; f.deps = x.deps ? x.deps.slice() : null; }); S.prices = Object.assign({}, S.prices, pl.prices); S.firstDep = pl.firstDep; S.onboard = pl.onboard; S.deps = pl.fleet[0] && pl.fleet[0].deps ? pl.fleet[0].deps.slice() : null; }
function setPlan(i, pl){
  if(i === 0) applyPlan(pl);
  else if(i === 9) S.rnd.test = normPlan(pl);
  else if(S.rnd.options) S.rnd.options[i] = pl;
  render();
}
function fitsFor(x){ const p = planeById(x.planeId); return x.sched.length <= (WORLD.maxTrips || 4) && (x.sched.length <= 1 || TIME.day(p, x.sched, undefined, x.deps || null).end <= dayEnd()); }
function actualDeps(pl, j){ pl = normPlan(pl); const x = pl.fleet[j || 0]; return withPlan(pl, () => TIME.day(planeById(x.planeId), x.sched, undefined, x.deps || null).trips.map(t => t.dep)); }
/* The routes the planner offers: the first market, then the other setup route from day 4, then every open route. */
function plannerRoutes(){
  if(!S || S.phase === 'setup' || !S.market) return S && S.market ? [S.market] : [];
  const other = otherRoute(), open = openRoutes(S.day).map(r => r.id).filter(id => id !== other || secondRouteOn());
  const first = [S.market].concat(secondRouteOn() ? [other] : []);
  return first.concat(open.filter(id => !first.includes(id)).sort((a, b) => (routeById(a).openDay || 1) - (routeById(b).openDay || 1) || routeKm(routeById(a)) - routeKm(routeById(b))));
}
function routeOpen(r, day){ day = day === undefined ? (S ? S.day : 1) : day; if(!r) return false; if(S && S.market && WORLD.setupRoutes.includes(r.id) && r.id !== S.market && !mechanicOn('second route', day)) return false; return (r.openDay || 1) <= day && !!(r.demandAtFare || !r.wb); }
function planLabel(pl){
  pl = normPlan(pl); const all = pl.fleet.flatMap(x => x.sched), c = serviceCounts(all), parts = Object.keys(c).map(id => `${routeById(id).city} ×${c[id]} at ${money(pl.prices[id] || routeById(id).basePrice)}`);
  if(snacksOn() && pl.onboard && pl.onboard !== 'none') parts.push(({ low:'snacks £3', high:'snacks £5', sell3:'snacks £3', sell5:'snacks £5', free:'free snacks' })[pl.onboard] || 'snacks');
  if(depsOn() && all.length && pl.fleet.length === 1){ const D = withPlan(pl, () => TIME.day(planeById(pl.fleet[0].planeId), pl.fleet[0].sched, undefined, pl.fleet[0].deps || null)); parts.push(D.trips.map(t => fmtTime(t.dep)).join(', ')); }
  if(pl.fleet.length > 1) parts.push(`${pl.fleet.filter(x => x.sched.length).length} of ${pl.fleet.length} aircraft flying`);
  return parts.join(' · ') || 'No services';
}
function schedFrom2(c){ const out = []; plannerRoutes().forEach(id => { for(let k = 0; k < (c[id] || 0); k++) out.push(id); }); return out; }
/* Change plan i (0 = the airline's plan, 9 = the test plan) for aircraft j. */
function editPlan(i, what, a, d, j){
  j = j || 0; const base = i === 9 ? testPlan() : currentPlan(), next = normPlan(JSON.parse(JSON.stringify(base))), maxT = WORLD.maxTrips || 4;
  const x = next.fleet[j] || next.fleet[0], p = planeById(x.planeId), canFly = id => planeCanFly(p, routeById(id));
  const fare0 = id => routeById(id).basePrice;
  if(depsOn() && !x.deps && x.sched.length) x.deps = actualDeps(next, j);
  if(what === 'svc'){ const c = serviceCounts(x.sched); c[a] = clamp((c[a] || 0) + d, 0, maxT); if(c[a] && !next.prices[a]) next.prices[a] = fare0(a); x.sched = schedFrom2(c); x.deps = null; }
  else if(what === 'fare'){ const r = routeById(a), F = r.fares || [r.basePrice], cur = next.prices[a] || r.basePrice; let k = F.indexOf(cur);
    if(k < 0){ const up = F.findIndex(v => v > cur); k = d > 0 ? (up < 0 ? F.length - 1 : up) : (up < 0 ? F.length - 1 : Math.max(0, up - 1)); next.prices[a] = F[k]; } else next.prices[a] = F[clamp(k + d, 0, F.length - 1)]; }
  else if(what === 'dep'){ const k = +a, now = actualDeps(next, j), v = now[k] + 30 * d;
    if(v < dayStart()){ toast(`The airport opens at ${WORLD.dayStart}.`); return; }
    if(k > 0 && d < 0){ const ready = withPlan(next, () => { const D = TIME.day(p, x.sched, undefined, now); return D.trips[k - 1].arr + TIME.home(p); }); if(v < ready){ toast(`Service ${k + 1} can't leave before the aircraft is ready again at ${fmtTime(ready)}.`); return; } }
    x.deps = now; x.deps[k] = v; }
  else if(what === 'del'){ const k = +a; if(x.deps) x.deps.splice(k, 1); x.sched.splice(k, 1); }
  else if(what === 'add'){ const r = routeById(a);
    if(!canFly(a)){ toast(`The ${p.name} can't reach ${r.city}: its range is ${num(p.range)} km and ${r.city} is ${num(routeKm(r))} km away.`); return; }
    if(x.sched.length >= maxT){ toast(`One aircraft can fly at most ${maxT} services a day.`); return; }
    x.sched.push(a); if(!next.prices[a]) next.prices[a] = fare0(a); if(x.deps) x.deps.push(null); }
  else if(what === 'open'){ const r = routeById(a), y = next.fleet.find(z => planeCanFly(planeById(z.planeId), r) && z.sched.length < maxT);
    if(!y){ toast(next.fleet.some(z => planeCanFly(planeById(z.planeId), r)) ? `Every aircraft that can reach ${r.city} is already flying ${maxT} services.` : `No aircraft you own can reach ${r.city} (${num(routeKm(r))} km).`); return; }
    y.sched.push(a); if(!next.prices[a]) next.prices[a] = fare0(a); if(y.deps) y.deps.push(null); }
  else if(what === 'route'){ const k = +a, ids = plannerRoutes().filter(canFly), cur = ids.indexOf(x.sched[k]); if(ids.length){ x.sched[k] = ids[(cur + 1) % ids.length]; if(!next.prices[x.sched[k]]) next.prices[x.sched[k]] = fare0(x.sched[k]); } }
  else if(what === 'ob') next.onboard = a;
  next.fleet.forEach((z, jj) => { if(z.deps && z.deps.length !== z.sched.length) z.deps = null; if(z.deps) z.deps = actualDeps(next, jj); });
  normPlan(next);
  const ok = withPlan(next, () => next.fleet.every(z => !z.sched.length || fitsFor(z)));
  if(!ok){ toast("That timetable won't fit in the operating day."); return; }
  if(what === 'open'){ const y = next.fleet.findIndex(z => z.sched.length && z.sched[z.sched.length - 1] === a); if(y >= 0) UI.peTab = y; } else if(next.fleet.length > 1) UI.peTab = j;
  setPlan(i, next);
}
function bindPlanEditor(){
  screen().querySelectorAll('[data-pe]').forEach(b => b.onclick = e => { e.stopPropagation(); const [i, what, a, d, j] = b.getAttribute('data-pe').split('|'); editPlan(+i, what, a, +d, +(j || 0)); });
  screen().querySelectorAll('[data-petab]').forEach(b => b.onclick = e => { e.stopPropagation(); UI.peTab = +b.getAttribute('data-petab'); render(); });
}
function termsWord(t){ if(!t) return ''; if(t.kind === 'lease') return `rented, ${money(t.daily)} a day`; if(t.kind === 'finance') return t.left > 0 ? `${money(t.daily)} a day, ${t.left} payment${t.left === 1 ? '' : 's'} left` : 'paid off'; return 'owned'; }
/* The plan editor: fares per route, the snack choice, then each aircraft's services. */
function planEditor(i, pl, L, o){
  o = o || {}; pl = normPlan(pl); const per = depsOn(), maxT = WORLD.maxTrips || 4, allRoutes = S.phase === 'setup' ? [S.market] : plannerRoutes(), multi = pl.fleet.length > 1, sched = multi && o.big && !o.compact;   // two aircraft: the page is the timetable
  const inPlan = [...new Set(pl.fleet.flatMap(x => x.sched))];
  const shown = allRoutes.filter(id => inPlan.includes(id) || (allRoutes.length <= 2) || (!inPlan.length && id === S.market)), more = allRoutes.filter(id => !shown.includes(id));
  const routeBlock = id => { const r = routeById(id), fare = pl.prices[id] || r.basePrice, F = r.fares || [r.basePrice], n = serviceCounts(pl.fleet.flatMap(x => x.sched))[id] || 0, rival = competitorPrice(r);
    const p0 = planeById(pl.fleet[0].planeId);
    return `<div class="pe-route ${n ? 'on' : ''}"><div class="pe-rh">${flagSvg(r.flag, 22)}<b>${esc(r.city)}</b>${o.big && id === otherRoute() ? newTag(3.4) : ''}${rival !== undefined ? `<span class="pe-rival" title="${esc(WORLD.rival)} is selling tickets at this price">${esc(WORLD.rival)} ${money(rival)}</span>` : ''}${per ? `<span class="muted">${n} service${n === 1 ? '' : 's'}</span>` : ''}</div>
      ${per || multi ? '' : `<div class="pe-f"><span class="label">Services</span>${stepper(i, 'svc|' + id, '×' + n, `${n * p0.seats} seats`, { noLess: n === 0, noMore: pl.fleet[0].sched.length >= maxT })}</div>`}
      <div class="pe-f"><span class="label">Fare</span>${stepper(i, 'fare|' + id, money(fare), `<b class="mono">${paxWant(r, fare)}</b> want to fly`, { noLess: fare <= F[0], noMore: fare >= F[F.length - 1] })}</div></div>`; };
  const moreRow = more.length && !o.compact ? `<div class="pe-more"><span class="label">Open routes</span>${more.map(id => { const r = routeById(id), can = pl.fleet.some(z => planeCanFly(planeById(z.planeId), r)); return `<button class="btn small" data-pe="${i}|open|${id}|0|0" ${can ? '' : 'disabled'} title="${can ? `${num(routeKm(r))} km · ${paxWant(r, r.basePrice)} want to fly at ${money(r.basePrice)}` : `No aircraft you own can reach ${r.city} (${num(routeKm(r))} km)`}">${flagSvg(r.flag, 14)} ${esc(r.city)}${(r.openDay || 1) === S.day ? newTag(progress()) || ' <span class="new-tag">NEW</span>' : ''}${can ? '' : ' <small>out of range</small>'}</button>`; }).join('')}</div>` : '';
  const snacks = !snacksOn() ? '' : o.big && newTag(3.1) ? `<div class="pe-obc ${newTag(3.1) ? 'fresh' : ''}"><div class="pe-sh"><span class="label">On board${newTag(3.1)}</span><span class="muted small">What happens on board today?</span></div><div class="obc-grid">${Object.keys(ONBOARD).map(k => `<button class="obc ${(pl.onboard || 'none') === k ? 'on' : ''}" data-pe="${i}|ob|${k}|0" aria-pressed="${(pl.onboard || 'none') === k}" title="${esc(ONBOARD[k].sub)}"><b>${esc(ONBOARD[k].label)}</b><small>${esc(ONBOARD[k].sub)}</small></button>`).join('')}</div></div>`
    : `<div class="pe-ob"><span class="label">On board</span>${Object.keys(ONBOARD).map(k => `<button class="opt-chip ${(pl.onboard || 'none') === k ? 'on' : ''}" data-pe="${i}|ob|${k}|0" aria-pressed="${(pl.onboard || 'none') === k}" title="${esc(ONBOARD[k].sub)}"><b>${esc(ONBOARD[k].label)}</b></button>`).join('')}</div>`;
  let services = '';
  if(per || multi){
    const svcRow = (s, j, p) => { const r = routeById(s.route), many = plannerRoutes().filter(id => planeCanFly(p, routeById(id))).length > 1;
      return `<div class="pe-svc ${s.band}"><span class="pe-n">Service ${s.k + 1}</span>${many ? `<button class="pe-rt" data-pe="${i}|route|${s.k}|1|${j}" title="Change the route">${flagSvg(r.flag, 14)} ${esc(r.city)} ⇄</button>` : `<span class="pe-city">${flagSvg(r.flag, 14)} ${esc(r.city)}</span>`}
        ${per ? stepper(i, 'dep|' + s.k, fmtTime(s.dep), `back ${fmtTime(s.arr)}`, { cls:'sm', j: j || undefined }) : `<span class="mono">${fmtTime(s.dep)}</span>`}<span class="pe-fill ${s.sold >= s.seats ? 'full' : ''}"><b class="mono">${s.sold}/${s.seats}</b><small>${s.sold >= s.seats ? 'full' : `${s.seats - s.sold} empty`}</small></span><span class="pe-band">${BAND_NAMES[s.band] || ''}</span>
        <button class="pe-x" data-pe="${i}|del|${s.k}|0|${j}" title="Remove this service" aria-label="Remove service ${s.k + 1}">✕</button></div>`; };
    const tab = multi ? clamp(UI.peTab || 0, 0, pl.fleet.length - 1) : 0;
    const tabs = multi ? `<div class="pe-tabs">${pl.fleet.map((x, j) => { const p = planeById(x.planeId); return `<button class="pe-tab ${j === tab ? 'on' : ''}" data-petab="${j}" aria-pressed="${j === tab}">${planeSvg(p, 'pe-pic')}<b>${esc(p.name.replace(/^DHC-6 /, ''))}</b><span class="mono">${esc(regOf(x.uid))}</span><small>${x.sched.length ? plural(x.sched.length, 'service') : 'no services yet'}</small></button>`; }).join('')}</div>` : '';
    services = pl.fleet.map((x, j) => { if(multi && j !== tab) return ''; const p = planeById(x.planeId), svcs = (L.services || []).filter(s => s.uid === x.uid), D = x.sched.length ? TIME.day(p, x.sched, undefined, x.deps || null) : null;
      const adds = allRoutes.map(id => { const r = routeById(id), can = planeCanFly(p, r); return `<button class="btn small" data-pe="${i}|add|${id}|0|${j}" ${can && x.sched.length < maxT ? '' : 'disabled'} title="${can ? `Add a ${r.city} service` : `${p.name}: range ${num(p.range)} km, ${r.city} is ${num(routeKm(r))} km away`}">+ ${esc(r.city)}${can ? '' : ' <small>out of range</small>'}</button>`; }).join('');
      return `<div class="pe-ac"><div class="pe-sh"><span class="pe-acn">${planeSvg(p, 'pe-pic')}<b>${esc(p.name.replace(/^DHC-6 /, ''))}</b><span class="mono">${esc(regOf(x.uid))}</span><span class="muted small">${p.seats} seats${multi && S.fleet.find(f => f.uid === x.uid) && S.fleet.find(f => f.uid === x.uid).terms ? ' · ' + termsWord(S.fleet.find(f => f.uid === x.uid).terms) : ''}</span></span>${D ? `<span class="muted small">busy until ${fmtTime(D.end)}</span>` : ''}<span class="pe-add">${x.sched.length >= maxT ? `<span class="muted small">${maxT} services is the most one aircraft can fly</span>` : adds}</span></div>
        ${svcs.map(s => svcRow(s, j, p)).join('') || `<p class="muted small pe-none">${multi ? 'No services yet: this aircraft costs its day anyway.' : 'Add a service.'}</p>`}</div>`; }).join('');
    services = `<div class="pe-svcs"><div class="pe-sh"><span class="label">${sched ? 'Timetable: give each aircraft its services and departure times' : 'Services and departure times'}${o.big ? newTag(3.3) : ''}</span>${multi ? (sched ? '<span class="muted small">Pick an aircraft, then add the routes it flies.</span>' : '') : '<span class="muted small">Out, a turnaround, back, then a turnaround at home.</span>'}</div>${tabs}${services}</div>`;
  }
  if(sched){   // fares in one row under the timetable; every route can be added from the aircraft panels, so no separate Open routes row
    const fares = `<div class="pe-fares"><span class="label">Fares</span>${shown.map(id => { const r = routeById(id), fare = pl.prices[id] || r.basePrice, F = r.fares || [r.basePrice], rival = competitorPrice(r); return `<div class="pe-fr ${inPlan.includes(id) ? 'on' : ''}"><span class="pe-frn">${flagSvg(r.flag, 16)} <b>${esc(r.city)}</b>${rival !== undefined ? `<small class="pe-rival">${esc(WORLD.rival)} ${money(rival)}</small>` : ''}</span>${stepper(i, 'fare|' + id, money(fare), `<b class="mono">${paxWant(r, fare)}</b> want`, { cls:'sm', noLess: fare <= F[0], noMore: fare >= F[F.length - 1] })}</div>`; }).join('')}</div>`;
    const sum = `<div class="pe-sum"><span><b class="mono">${L.pax}</b> fly</span><span class="${L.empty ? '' : 'muted'}"><b class="mono">${L.empty}</b> empty seat${L.empty === 1 ? '' : 's'}</span><span class="${L.nos ? 'orange' : ''}"><b class="mono">${L.nos}</b> without a seat</span>${L.end ? `<span>busy until <b class="mono">${fmtTime(L.end)}</b></span>` : ''}${fuelPaid() && L.fuelL ? `<span>burns <b class="mono">${num(L.fuelL)} L</b> of fuel</span>` : ''}${L.fits ? '' : '<span class="red">Doesn\'t fit in the day</span>'}</div>`;
    return `<div class="pe big sched">${services}${fares}${snacks}${sum}</div>`;
  }
  const strips = per && !o.compact && !multi ? `<div class="pe-demand">${shown.filter(id => inPlan.includes(id)).slice(0, 3).map(demandStrip).join('')}${miniBar(L.D)}</div>` : '';
  const sum = `<div class="pe-sum"><span><b class="mono">${L.pax}</b> fly</span><span class="${L.empty ? '' : 'muted'}"><b class="mono">${L.empty}</b> empty seat${L.empty === 1 ? '' : 's'}</span><span class="${L.nos ? 'orange' : ''}"><b class="mono">${L.nos}</b> without a seat</span>${L.end ? `<span>busy until <b class="mono">${fmtTime(L.end)}</b></span>` : ''}${fuelPaid() && L.fuelL ? `<span>burns <b class="mono">${num(L.fuelL)} L</b> of fuel${o.big ? newTag(3.2) : ''}</span>` : ''}${opened(3.1) && (typeof crewOn !== 'function' || crewOn()) ? `<span class="${L.crews > 1 ? 'orange' : ''}">${L.crews} crew${L.crews > 1 ? 's' : ''}</span>` : ''}${L.fits ? '' : '<span class="red">Doesn\'t fit in the day</span>'}</div>`;
  return `<div class="pe ${o.big ? 'big' : ''} ${o.compact ? 'compact' : ''}">${strips}<div class="pe-routes n${Math.min(3, shown.length)}">${shown.map(routeBlock).join('')}</div>${moreRow}${snacks}${services}${sum}</div>`;
}
/* Everything a plan would do today, as spreadsheet lines: one ticket line per route, every aircraft's costs. */
function planLines(pl){
  pl = normPlan(pl);
  return withPlan(pl, () => {
    const fl = planFlights().filter(x => !x.grounded), X = dayExtras(fl), ob = onboardOf(), ids = [...new Set(pl.fleet.flatMap(x => x.sched))];
    const paxOn = id => fl.filter(x => x.route === id).reduce((t, x) => t + x.sold, 0);
    const routesV = ids.map(id => ({ id, pax:paxOn(id), fare:fareOf(id), tk:paxOn(id) * fareOf(id) }));
    const r1 = S.market, r2id = otherRoute(), v = { pax1:paxOn(r1), fare1:fareOf(r1), pax2:paxOn(r2id), fare2:fareOf(r2id) };
    v.tk1 = v.pax1 * v.fare1; v.tk2 = v.pax2 * v.fare2; routesV.forEach(x => { v['pax_' + x.id] = x.pax; v['fare_' + x.id] = x.fare; v['tk_' + x.id] = x.tk; });
    v.buyers = X.buyers || 0; v.snackP = ob.price || 0; v.snack = X.obRev; v.rev = routesV.reduce((t, x) => t + x.tk, 0) + v.snack;
    v.run = fl.reduce((t, x) => t + x.runCost, 0); v.fuelL = fl.reduce((t, x) => t + x.fuelL, 0); v.ppl = fuelPrice(); v.fuel = Math.round(fl.reduce((t, x) => t + x.fuelCost, 0));
    v.term = X.term; v.stock = X.obCost; v.crew = X.crew; v.day = fleetDayCost(); v.event = (S.rnd && S.rnd.eventCost) || 0;
    v.cost = v.run + v.fuel + v.term + v.stock + v.crew + v.day + v.event; v.profit = v.rev - v.cost;
    const routes = {}; fl.forEach(x => { routes[x.route] = (routes[x.route] || 0) + x.sold; });
    const want = Object.fromEntries(ids.map(id => [id, paxWant(routeById(id), fareOf(id))])), nos = ids.reduce((t, id) => t + Math.max(0, want[id] - (routes[id] || 0)), 0);
    const fits = pl.fleet.every(x => !x.sched.length || fitsFor(x)), days = pl.fleet.map(x => x.sched.length ? TIME.day(planeById(x.planeId), x.sched, undefined, x.deps || null) : null);
    const ends = days.filter(Boolean).map(D => D.end), seats = fl.reduce((t, x) => t + x.seats, 0), pax = fl.reduce((t, x) => t + x.sold, 0);
    const services = fl.map(x => ({ k:x.trip, uid:x.uid, route:x.route, dep:x.dep, arr:x.arr, seats:x.seats, sold:x.sold, band:x.band || bandOf(x.dep) }));
    return { v, routes:routesV, fits, nos, pax, seats, empty: seats - pax, want, end: ends.length ? Math.max(...ends) : null, D: days[0], days, crews:X.crews, fuelL:v.fuelL, services, X };
  });
}
/* What "Flights" is made of, aircraft by aircraft. */
function flightParts(plOrSched){
  const pl = Array.isArray(plOrSched) ? normPlan({ sched:plOrSched }) : normPlan(plOrSched), h = homeData(), out = [];
  pl.fleet.forEach(x => { const p = planeById(x.planeId), c = serviceCounts(x.sched);
    Object.keys(c).forEach(id => { const r = routeById(id), n = c[id]; out.push([`${pl.fleet.length > 1 ? p.name.replace(/^DHC-6 /, '') + ': ' : ''}${r.city} ×${n}: ${fmtDur(2 * legMinutes(p, r))} flying at ${money(p.hourCost)} an hour, landing ${money(h.fee)} at ${h.code} + ${money(r.landingFeeAway || 0)} at ${r.city}`, money(n * runCostOf(p, r))]); }); });
  return out;
}
function dayParts(){ return S.fleet.map(f => { const p = planeById(f.planeId), t = f.terms; return [`${p.name}${t && t.kind === 'lease' ? ` · rent ${money(t.daily)}` : t && t.kind === 'finance' && t.left > 0 ? ` · finance payment ${money(t.daily)}` : ''}`, money(dayCostOf(f))]; }); }

/* ---------- the cost sheet: a ticket line per route in the plan ---------- */
function costRowsFor(L){
  const base = TABLES.cost1.rows, rows = [], byId = id => base.find(r => r.id === id);
  (L.routes.length ? L.routes : [{ id:S.market }]).forEach(x => { const r = routeById(x.id);
    rows.push({ id:'pax_' + x.id, label:`${r.city} passengers`, type:'given', unit:'n' }, { id:'fare_' + x.id, label:`${r.city} fare`, type:'given', unit:'£' },
      { id:'tk_' + x.id, label:`${r.city} tickets`, type:'calc', unit:'£', op:'×', from:['pax_' + x.id, 'fare_' + x.id], sentence:`{pax_${x.id}} × {fare_${x.id}} = {?tk_${x.id}}`, tool: x.id === S.market ? 'revenue' : 'routeRevenue', route:x.id }); });
  ['buyers', 'snackP', 'snack'].forEach(id => rows.push(byId(id)));
  const tks = (L.routes.length ? L.routes : [{ id:S.market }]).map(x => `{tk_${x.id}}`);
  rows.push(Object.assign({}, byId('rev'), { from:tks.map(s => s.replace(/[{}]/g, '')), sentence:tks.concat(['{snack}']).join(' + ') + ' = {?rev}' }));
  ['run', 'fuelL', 'ppl', 'fuel', 'term', 'stock', 'crew', 'day'].forEach(id => rows.push(byId(id)));
  rows.push({ id:'event', label: S.rnd && S.rnd.event ? S.rnd.event.title : 'Event', type:'given', unit:'£' });
  rows.push(Object.assign({}, byId('cost'), { sentence:'{run} + {fuel} + {term} + {stock} + {crew} + {day} + {event} = {?cost}' }), byId('profit'));
  S.rnd.costRoutes = (L.routes.length ? L.routes : [{ id:S.market }]).map(x => x.id);
  return rows;
}
function costLabels(){
  const out = {}; (S.rnd && S.rnd.costRoutes ? S.rnd.costRoutes : [S.market, otherRoute()]).forEach(id => { const r = routeById(id); if(!r) return; out['pax_' + id] = `${r.city} passengers`; out['fare_' + id] = `${r.city} fare`; out['tk_' + id] = `${r.city} tickets`; });
  const a = routeById(S.market), b = routeById(otherRoute()); if(a) Object.assign(out, { pax1:`${a.city} passengers`, fare1:`${a.city} fare`, tk1:`${a.city} tickets` }); if(b) Object.assign(out, { pax2:`${b.city} passengers`, fare2:`${b.city} fare`, tk2:`${b.city} tickets` });
  return out;
}
function costRowIds(L, pl){
  pl = normPlan(pl); S.rnd.handSums = decideHandSums(L, pl);
  const H = S.rnd.handSums, sn = snacksOn() && (pl.onboard || 'none') !== 'none', ids = [], routes = L.routes.length ? L.routes : [{ id:S.market }];
  routes.forEach(x => { if(H.revenue && H.revenue.routes.includes(x.id)) ids.push('pax_' + x.id, 'fare_' + x.id); ids.push('tk_' + x.id); });
  if(sn){ if(H.snacks) ids.push('buyers', 'snackP'); ids.push('snack'); }
  ids.push('rev');
  if(fuelPaid() && H.fuelCost) ids.push('fuelL', 'ppl', 'fuel');
  if(L.v.event) ids.push('event');
  ids.push('cost', 'profit');
  return ids;
}
function rowTyped(t, row){
  if(row.type !== 'calc' || !row.tool) return false;
  const o = S && S.tools && S.tools[row.tool]; if(o) return o !== 'model';
  const H = S && S.rnd && S.rnd.handSums;
  if(H && row.route && (row.tool === 'revenue' || row.tool === 'routeRevenue')) return !!(H.revenue && H.revenue.routes.includes(row.route));
  return toolLevel(row.tool) !== 'model';
}
function toolLevel(id){
  const T = TOOL[id]; if(!T) return 'model';
  const o = S && S.tools && S.tools[id]; if(o && (o !== 'build' || T.build)) return o;
  const H = S && S.rnd && S.rnd.handSums;
  if(H && (id === 'revenue' || id === 'routeRevenue')) return H.revenue && H.revenue.routes.length ? H.revenue.level : 'model';
  if(H && HAND_TOOLS.includes(id)){ const v = H[id]; return !v ? 'model' : typeof v === 'string' ? v : (v.level || 'calc'); }
  return toolDefault(id);
}
/* Which figures the pupil works out today (HandSumRules 1, 2, 4, 5; the Calendar's gatedCalc for the sums the rules cannot infer). */
function decideHandSums(L, pl){
  pl = normPlan(pl); const out = {}, sk = skills(), ST = WORLD.settings || {}, first = id => !sk[id], seen = sk.revenue || { routes:[] };
  const ask = L.routes.map(x => x.id).filter(id => !seen.routes.includes(id));
  const opening = S.phase === 'setup' || (S.day || 1) < (WORLD.weekFrom || 22);   // Build waits for week play (design note, 8 Oct)
  if(ask.length) out.revenue = { level: first('revenue') || opening ? 'calc' : 'build', routes:ask };
  if(snacksOn() && (pl.onboard || 'none') !== 'none' && first('snacks')) out.snacks = 'calc';
  if(fuelPaid()){ const fs = sk.fuelCost, price = fuelPrice(), litres = plannedLitres(pl), step = ST.fuelHandSumPriceStep || 0.5, share = ST.fuelHandSumLitresShare || 0.25;
    if(!fs) out.fuelCost = 'calc';
    else if(Math.abs(price - fs.last.price) >= step - 1e-9 || (fs.last.litres > 0 && Math.abs(litres - fs.last.litres) / fs.last.litres >= share - 1e-9)) out.fuelCost = 'calc'; }
  if(first('profit')) out.profit = 'calc'; else if(out.snacks) out.profit = 'calc';   // week-1 review: the snack options are costed by hand, Build waits for the new route
  const g = gatedToday();
  // D50: the first full day of a rival undercut, the passengers who stay (people × tenths); the first Saturday, the weekend tenths (one question each)
  if(opening && S.phase === 'round' && !(S.rnd.event && S.rnd.event.rivalFare) && first('rivalStay') && typeof rivalShare === 'function'){ const rid = [S.market, otherRoute()].find(id => id && routeById(id) && rivalShare(routeById(id), fareOf(id)) > 0); if(rid) out.rivalStay = { level:'calc', route:rid }; }
  if(opening && S.phase === 'round' && first('weekendDemand') && calDate(S.day).getUTCDay() === 6) out.weekendDemand = { level:'calc', route:S.market };
  if(g.includes('emptySeats') && first('emptySeats')) out.emptySeats = 'calc';
  const ft = sk.flightTime || { routes:[] }, newRoutes = L.routes.map(x => x.id).filter(id => !ft.routes.includes(id) && (routeById(id).openDay || 1) > 1);
  if(g.includes('flightTime') || (S.day >= (WORLD.weekFrom || 22) && newRoutes.length)){ const rid = flightTimeRoute(pl, newRoutes); if(rid && !ft.routes.includes(rid)) out.flightTime = { level:'calc', route:rid }; }
  return out;
}
function plannedLitres(pl){ pl = normPlan(pl); return pl.fleet.reduce((t, x) => t + x.sched.reduce((u, id) => u + fuelForTrip(planeById(x.planeId), routeById(id)), 0), 0); }
/* The route whose flight time is worked out: the newest route in the plan, else the route that opened today. */
function flightTimeRoute(pl, newRoutes){
  pl = normPlan(pl); const inPlan = (newRoutes || []).slice().sort((a, b) => (routeById(b).openDay || 1) - (routeById(a).openDay || 1));
  if(inPlan.length) return inPlan[0];
  const today = routesOpening(S.day).filter(r => S.fleet.some(f => planeCanFly(planeById(f.planeId), r)) || true).sort((a, b) => routeKm(b) - routeKm(a))[0];
  return today ? today.id : null;
}
function flightTimePlane(pl, rid){ pl = normPlan(pl); const x = pl.fleet.find(z => z.sched.includes(rid)) || pl.fleet.find(z => planeCanFly(planeById(z.planeId), routeById(rid))) || pl.fleet[0]; return planeById(x.planeId); }
function recordHandSums(L){
  const H = S.rnd.handSums || {}, sk = skills(), day = S.day, byHand = Object.keys(H).filter(k => H[k] && H[k] !== 'model');
  const touch = (id, extra) => { const x = sk[id] || (sk[id] = { first:day, count:0, routes:[], planes:[] }); x.count++; x.lastDay = day; Object.assign(x, extra || {}); return x; };
  if(H.revenue){ const x = touch('revenue'); H.revenue.routes.forEach(id => { if(!x.routes.includes(id)) x.routes.push(id); }); }
  if(H.snacks) touch('snacks'); if(H.profit) touch('profit'); if(H.emptySeats) touch('emptySeats'); if(H.rivalStay) touch('rivalStay'); if(H.weekendDemand) touch('weekendDemand');
  if(H.flightTime){ const x = touch('flightTime'); if(!x.routes.includes(H.flightTime.route)) x.routes.push(H.flightTime.route); }
  if(H.fuelCost) touch('fuelCost', { last:{ price:fuelPrice(), litres:plannedLitres(currentPlan()) } });
  if(byHand.length) (S.handSumLog = S.handSumLog || []).push({ day, date:dateShort(day), tools:byHand.map(k => `${TOOL[k] ? TOOL[k].name : k}${k === 'revenue' ? ' (' + H.revenue.routes.map(id => routeById(id).city).join(', ') + ')' : k === 'flightTime' ? ' (' + routeById(H.flightTime.route).city + ')' : ''} (${LVL[typeof H[k] === 'string' ? H[k] : H[k].level] || ''})`) });
}

/* ---------- what the fleet costs a day: rent and finance payments ride on the aircraft's day ---------- */
function termsDaily(f){ const t = f && f.terms; if(!t) return 0; if(t.kind === 'lease') return t.daily || 0; if(t.kind === 'finance' && t.left > 0) return t.daily || 0; return 0; }
function dayCostOf(f){ return (planeById(f.planeId).dayCost || 0) + termsDaily(f); }
function payFinanceDay(){ S.fleet.forEach(f => { if(f.terms && f.terms.kind === 'finance' && f.terms.left > 0) f.terms.left--; }); }

/* ---------- the shop: what is for sale today, on what terms ---------- */
function fromDayOf(v){ if(v === null || v === undefined) return null; const s = String(v).trim(); if(/^n\/?a$/i.test(s) || s === '') return null; const m = /^day\s+(\d+)$/i.exec(s); if(m) return +m[1]; if(/^\d{4}-\d{2}-\d{2}/.test(s)) return dayOfDate(s.slice(0, 10)); return null; }
function shopOffer(p, day){
  day = day === undefined ? S.day : day; const fin = FINANCE[p.id] || {}, price = fin.cashPrice || p.listPrice || p.price, buyFrom = fromDayOf(fin.buyFrom), leaseFrom = fromDayOf(fin.leaseFrom), finFrom = fromDayOf(fin.financeFrom);
  const canBuy = buyFrom !== null && buyFrom <= day, canLease = leaseFrom !== null && leaseFrom <= day && !!fin.leaseDaily;
  const canFinance = !!(fin.financeDeposit && fin.financePayment) && (finFrom !== null ? finFrom <= day : canBuy);   // the tutorial tier's "n/a" means with the cash price
  const daily = fin.paymentUnit === 'week' ? fin.financePayment / 7 : fin.financePayment, left = fin.paymentUnit === 'week' ? (fin.financeCount || 0) * 7 : (fin.financeCount || 0);
  return { price, lease:fin.leaseDaily || null, deposit:fin.financeDeposit || null, pay:fin.financePayment || null, n:fin.financeCount || null, unit:fin.paymentUnit || 'day', daily, left, canBuy, canLease, canFinance, buyFrom, leaseFrom, finFrom, inShop:(p.shopFromDay || 1) <= day };
}
function shopPlanes(day){ day = day === undefined ? S.day : day; return PLANES.filter(p => p.wb !== false && (p.shopFromDay || 1) <= day && (p.status === undefined || p.status === 'live')); }
function shopToday(){ const w = roundData(S.round); return S.phase === 'round' && periodType() === 'day' && !!(w.unlocks && w.unlocks.planes && w.unlocks.planes.length); }
/* The model's suggestion: the services the new aircraft would add, where people are left without a seat or a new route is open. */
function fleetModel(planeId){
  return dryRun(() => {
    const base = dayProfitNow(), p = planeById(planeId), uid = S.nextUid++;
    S.fleet.push({ uid, planeId, route:null, schedule:[], deps:null, layout:'standard', grounded:false }); const f = S.fleet[S.fleet.length - 1]; let sched = [];
    for(let k = 0; k < (WORLD.maxTrips || 4); k++){
      let best = null;
      plannerRoutes().forEach(r => { const s = sched.concat([r]); if(!planeCanFly(p, routeById(r)) || !TIME.fits(p, s)) return; f.schedule = s; f.route = s[0]; const v = dayProfitNow(); if(!best || v > best.v) best = { s, v }; });
      f.schedule = sched; f.route = sched[0] || null; const now = dayProfitNow(); if(!best || best.v <= now) break; sched = best.s;
    }
    f.schedule = sched; f.route = sched[0] || null;
    return { extra:Math.round(dayProfitNow() - base), sched, firstRoute: sched[0] || plannerRoutes().find(r => planeCanFly(p, routeById(r))) || S.market };
  });
}
function acquirePlane(p, kind){
  const o = shopOffer(p), uid = S.nextUid++; let terms;
  if(kind === 'buy'){ S.cash = r2(S.cash - o.price); terms = { kind:'buy', price:o.price, since:S.day }; }
  else if(kind === 'lease') terms = { kind:'lease', daily:o.lease, since:S.day };
  else { S.cash = r2(S.cash - o.deposit); terms = { kind:'finance', deposit:o.deposit, daily:o.daily, pay:o.pay, unit:o.unit, left:o.left, since:S.day }; }
  S.fleet.push({ uid, planeId:p.id, route:null, schedule:[], deps:null, layout:'standard', grounded:false, terms, acquired:S.day }); UI.peTab = S.fleet.length - 1;
  S.dec.planeBought = { round:S.round, day:S.day, planeId:p.id, kind };
  addNews([{ tag:'FLEET', text:`${S.airline.name} ${kind === 'buy' ? 'buys' : kind === 'lease' ? 'rents' : 'finances'} a ${p.name}!`, cls:'good' }]);
  if(typeof sysNotice === 'function') sysNotice(`${p.name} ${esc(regOf(uid))} joins the fleet`);
  refreshPlan(); return uid;
}
WS_STEPS.push('shop2', 'fleetSums', 'acquire'); SHELL_STEPS.push('shop2', 'fleetSums', 'acquire');
STAGES.day[0].steps = ['shop2', 'fleetSums', 'acquire', 'planner', 'event', 'workout'];
Object.assign(RAIL_LABEL, { shop2:'Aircraft for sale', fleetSums:'The sums', acquire:'Buy or rent' });
Object.assign(SUB_DESC, { shop2:'A bigger airline?', fleetSums:'Rent or buy, a full plane', acquire:'Sign for the aircraft' });
Object.assign(STEP_HINT, { shop2:'Aircraft are for sale. Look closely at one, or carry on with the aircraft you have.', fleetSums:'Two sums about the aircraft you chose: how many days of rent equal its price, and what a full plane brings in.', acquire:'Buy with cash, rent by the day, or pay a deposit and daily payments. Then give the aircraft its services.' });
/* the day's steps (also used to bring an older save's day into this flow, p4u) */
function daySteps(n, w){ w = w || roundData(n); const shop = !!(w.unlocks && w.unlocks.planes && w.unlocks.planes.length);
  return withIntro([{ t:'hq' }].concat(shop ? [{ t:'shop2' }] : []).concat(S.rnd.event ? [{ t:'event' }] : []).concat([{ t:'plan' }, { t:'workings' }]).concat(fuelPaid() ? [{ t:'fuelPlan' }] : []).concat([{ t:'ready' }, { t:'fly' }, { t:'results' }]), w); }
function startProtoDay(n){
  S.round = n; S.phase = 'round'; S.day = beatDay(n); delete S.needsRestart;
  const f = fleetOne(), w = roundData(n);
  S.rnd = Object.assign(emptyRnd(), { featured:f.uid, focusRoute:schedOf(f)[0] || S.market, headline:w.headline || '', brief:protoBrief(n), event: w.event ? JSON.parse(JSON.stringify(w.event)) : null });
  S.period = newPeriod('day', S.day);
  if(depsOn() && !Array.isArray(S.deps)) S.deps = TIME.day(ourPlane(), schedOf(f), undefined, null).trips.map(t => t.dep);
  S.steps = daySteps(n, w);
  S.rnd.cashStart = S.cash; UI.view = null;
  S.si = 0; S.newRoutes = []; if(typeof revealReputation === 'function') revealReputation();
  refreshPlan();
  addNews((w.news || []).slice(0, 2).map(t => ({ tag:'NEWS', text:t })));
  publish(); render();
}
function shopCard(p, o, picked, owned){
  const specs = [['Seats', p.seats], ['Range', num(p.range) + ' km'], ['Speed', num(p.speed) + ' km/h'], ['Flying cost', money(p.hourCost) + ' an hour'], ['Day cost', money(p.dayCost)]];
  const offer = [[`Buy`, money(o.price), o.canBuy], [`Rent`, o.lease ? `${money(o.lease)} a day` : '—', o.canLease], [`Finance`, o.deposit ? `${money(o.deposit)} down + ${money(o.pay)} a ${o.unit} × ${o.n}` : '—', o.canFinance]];
  return `<button class="ac-shop ${picked ? 'on' : ''} ${owned ? 'owned' : ''}" data-pick="${p.id}" aria-pressed="${picked}"><div class="as-pic">${planeSvg(p, '')}</div><b>${esc(p.name)}${owned ? ` <small class="muted">· you fly ${owned}</small>` : ''}</b><span class="muted small">${esc(p.fact || '')}</span>
    <div class="as-f">${specs.map(([l, v]) => `<span>${l} <b class="mono">${v}</b></span>`).join('')}</div>
    <div class="as-offer">${offer.map(([l, v, ok]) => `<span class="${ok ? '' : 'off'}"><span>${l}</span><b class="mono">${v}</b></span>`).join('')}</div></button>`;
}
R.shop2 = st => {
  const list = shopPlanes(), picked = S.rnd.shopPick || null, owned = id => S.fleet.filter(f => f.planeId === id).length;
  const opening = routesOpening(S.day), newR = opening.length ? `<p class="small muted">New route${opening.length > 1 ? 's' : ''} today: ${opening.map(r => `${r.city} (${num(routeKm(r))} km)`).join(', ')}.</p>` : '';
  screen().innerHTML = taskFrame({ question:'Aircraft for sale', work:false,
    story:['Each aircraft is for sale, for rent by the day, or on finance (a deposit now, then a payment every day). A bigger aircraft carries more people but costs more every day, flying or not.'],
    say:`Aircraft for sale. ${list.map(p => `${p.name}: ${p.seats} seats, ${money(shopOffer(p).price)} to buy${shopOffer(p).lease ? `, or ${money(shopOffer(p).lease)} a day to rent` : ''}.`).join(' ')}`,
    context:{ title:'Your airline', html: cxSec('Cash', `<p class="cx-plan mono">${money(Math.round(S.cash))}</p><p class="small muted">Keep ${money(WORLD.cashReserve || 0)} back for emergencies.</p>`) + cxSec('Fleet', S.fleet.map(f => `<p class="small">${esc(planeById(f.planeId).name)} <span class="mono">${esc(regOf(f.uid))}</span> · ${esc(svcLabel(schedOf(f)) || 'no services')}</p>`).join('')) + (newR ? cxSec('Routes', newR) : '') },
    main:`<div class="shop3 ${list.length > 3 ? 'list' : ''}">${list.map(p => shopCard(p, shopOffer(p), picked === p.id, owned(p.id))).join('')}</div>`,
    foot:`<button class="btn big" id="skipShop">Not today</button><span class="grow"></span><button class="btn primary big" id="nx" ${picked ? '' : 'disabled'}>${picked ? goLabel(`Look closer at the ${planeById(picked).name.replace(/^DHC-6 /, '')}`) : 'Choose an aircraft, or not today'} &#9654;</button>` });
  screen().querySelectorAll('[data-pick]').forEach(b => b.onclick = () => { S.rnd.shopPick = b.getAttribute('data-pick'); render(); });
  const strip = () => { S.steps = S.steps.filter(x => !['fleetSums', 'acquire'].includes(x.t)); };
  on('skipShop', () => { strip(); delete S.rnd.shopPick; UI.justDone = null; advance(); });
  on('nx', () => { strip(); const k = S.steps.findIndex(x => x.t === 'shop2'); S.steps.splice(k + 1, 0, { t:'fleetSums' }, { t:'acquire' }); UI.justDone = null; advance(); });
};
R.fleetSums = st => {
  const p = planeById(S.rnd.shopPick || 'sf34'), o = shopOffer(p), sk = skills(), m = S.rnd.fleetModel && S.rnd.fleetModel.id === p.id ? S.rnd.fleetModel : (S.rnd.fleetModel = Object.assign({ id:p.id }, fleetModel(p.id)));
  const r = routeById(m.firstRoute), fare = fareOf(r.id);
  const rbNew = !(sk.rentOrBuy && sk.rentOrBuy.planes.includes(p.id)) && o.lease && o.price, sfNew = !(sk.seatsFare && sk.seatsFare.planes.includes(p.id));
  S.rnd.handSums = Object.assign({}, S.rnd.handSums || {}, { rentOrBuy: rbNew ? 'calc' : 'model', seatsFare: sfNew ? 'calc' : 'model' });
  const tables = [];
  if(o.lease && o.price){ const tid = `rentbuy:${S.day}:${p.id}`, prev = S.rnd.tables[tid], t = ensureTable(tid, 'rentbuy1', [{ id:'a', label:p.name, sub:`${money(o.price)} to buy · ${money(o.lease)} a day to rent`, values:{ price:o.price, rent:o.lease, days:r2(o.price / o.lease) } }], { live: rbNew }); if(t !== prev) t.active = null; tables.push(t); }
  { const tid = `seatfare:${S.day}:${p.id}:${r.id}:${fare}`, prev = S.rnd.tables[tid], t = ensureTable(tid, 'seatfare1', [{ id:'a', label:`${p.name} to ${r.city}`, sub:`${p.seats} seats at ${money(fare)}`, values:{ seats:p.seats, fare, full:p.seats * fare } }], { live: sfNew }); if(t !== prev) t.active = null; tables.push(t); }
  const done = tables.every(tableComplete), calc = tables.find(t => t.active) || tables[0]; S.rnd.activeTable = calc.id;
  const days = o.lease ? r2(o.price / o.lease) : null, payback = m.extra > 0 ? Math.ceil(o.price / m.extra) : null;
  const model = `<div class="fs-model"><div><small>The model's suggestion</small><b>${m.sched.length ? esc(svcLabel(m.sched)) : 'No useful services yet'}</b><small>where people are left without a seat</small></div>
    <div><small>Extra profit a day</small><b class="${m.extra >= 0 ? 'green' : 'red'}">${money(m.extra)}</b><small>with those services, at today's fares</small></div>
    <div><small>${o.lease ? 'Against the rent' : 'Pays back in'}</small><b>${o.lease ? (m.extra > o.lease ? `${money(m.extra - o.lease)} a day ahead` : `${money(o.lease - m.extra)} a day short`) : payback ? `${payback} days` : '—'}</b><small>${o.lease ? `rent ${money(o.lease)} a day` : `price ${money(o.price)}`}${payback ? ` · buying pays back in about ${payback} days` : ''}</small></div></div>`;
  screen().innerHTML = taskFrame({ question:`Is the ${esc(p.name.replace(/^DHC-6 /, ''))} worth it?`, work:true, calc,
    say:`Two sums about the ${p.name}. How many days of rent equal its price? And what does a full plane bring in at ${money(fare)}?`,
    context:{ title:'The offer', html: kv([['Buy', `<span class="mono">${money(o.price)}</span>`], ['Rent', o.lease ? `<span class="mono">${money(o.lease)}</span> a day` : '—'], ['Finance', o.deposit ? `<span class="mono">${money(o.deposit)}</span> + <span class="mono">${money(o.pay)}</span> × ${o.n}` : '—']]) },
    main:`<div class="cost2"><div class="c2-g two">${tables.map(t => `<section class="pnl c2-sheet"><div class="pnl-h"><h3>${esc(TABLES[t.kind].title)}</h3></div><div class="sheet1">${tableHtml(t)}</div></section>`).join('')}</div>${model}</div>`,
    foot:`<button class="btn primary big" id="nx" ${done ? '' : 'disabled'}>${done ? goLabel('Decide: buy, rent or finance') : 'Complete the sums first'} &#9654;</button>` });
  tables.forEach(bindTable);
  on('nx', () => { const x = sk.rentOrBuy || (sk.rentOrBuy = { first:S.day, count:0, planes:[] }), y = sk.seatsFare || (sk.seatsFare = { first:S.day, count:0, planes:[] });
    const log = []; if(rbNew){ x.count++; x.planes.push(p.id); log.push(`Rent or buy (${p.name})`); } if(sfNew){ y.count++; y.planes.push(p.id); log.push(`A full plane (${p.name})`); }
    if(log.length) (S.handSumLog = S.handSumLog || []).push({ day:S.day, date:dateShort(S.day), tools:log });
    resetEntry(); UI.justDone = null; advance(); });
};
R.acquire = st => {
  const p = planeById(S.rnd.shopPick || 'sf34'), o = shopOffer(p), reserve = WORLD.cashReserve || 0, cash = Math.round(S.cash), pick = st.pick;
  const after = k => k === 'buy' ? cash - o.price : k === 'finance' ? cash - o.deposit : cash;
  const safe = k => after(k) >= reserve || cash < reserve;
  const opts = [['buy', 'Buy', `${money(o.price)} now. Yours for good.`, o.canBuy], ['lease', 'Rent', o.lease ? `${money(o.lease)} a day, every day. Hand it back at a month end.` : 'Not offered', o.canLease], ['finance', 'Finance', o.deposit ? `${money(o.deposit)} now, then ${money(o.pay)} a ${o.unit} for ${o.n} ${o.unit}s.` : 'Not offered', o.canFinance]];
  screen().innerHTML = taskFrame({ question:`How will you pay for the ${esc(p.name.replace(/^DHC-6 /, ''))}?`, work:false,
    story:['Buying costs most now and nothing later. Renting costs nothing now and something every day. Finance is in between.'],
    say:`How will you pay? ${opts.filter(x => x[3]).map(x => `${x[1]}: ${x[2]}`).join(' ')}`,
    context:{ title:'Cash', html: kv([['Cash now', `<span class="mono gold">${money(cash)}</span>`], ['After buying', `<span class="mono ${after('buy') >= reserve ? '' : 'red'}">${money(after('buy'))}</span>`], ['After the deposit', o.deposit ? `<span class="mono ${after('finance') >= reserve ? '' : 'red'}">${money(after('finance'))}</span>` : '—'], ['Kept for emergencies', `<span class="mono">${money(reserve)}</span>`]]) },
    main:`<div class="terms">${opts.map(([k, l, sub, ok]) => `<button class="opt ${pick === k ? 'on' : ''}" data-terms="${k}" ${ok && safe(k) ? '' : 'disabled'} aria-pressed="${pick === k}"><span class="big">${l}</span><span class="sub">${esc(sub)}</span>${ok && !safe(k) ? `<span class="sub red">Would leave less than ${money(reserve)} in the bank</span>` : ''}${!ok ? `<span class="sub muted">Not available yet</span>` : ''}</button>`).join('')}</div>
      <p class="muted" style="margin-top:12px">Whatever you choose, the aircraft's day cost (${money(p.dayCost)}) is paid every day it is yours.</p>`,
    foot:`<button class="btn big" id="noBuy">Not today</button><span class="grow"></span><button class="btn primary big" id="nx" ${pick ? '' : 'disabled'}>${pick ? goLabel(`${pick === 'buy' ? 'Buy' : pick === 'lease' ? 'Rent' : 'Finance'} the ${p.name.replace(/^DHC-6 /, '')}`) : 'Choose how to pay'} &#9654;</button>` });
  screen().querySelectorAll('[data-terms]').forEach(b => b.onclick = () => { st.pick = b.getAttribute('data-terms'); render(); });
  on('noBuy', () => { delete S.rnd.shopPick; UI.justDone = null; advance(); });
  on('nx', () => { acquirePlane(p, pick); st.done = true; delete S.rnd.shopPick; UI.justDone = null; advance(); });
};

/* ---------- the live wall follows the aircraft that is flying ---------- */
function liveFeaturedUid(L, g, k){
  const cands = S.fleet.map(f => ({ uid:f.uid, A:liveAircraft(L, f.uid, g, k) })), cur = cands.find(c => c.A.F); if(cur) return cur.uid;
  const nxt = cands.filter(c => c.A.next).sort((a, b) => a.A.next.dep - b.A.next.dep)[0]; return nxt ? nxt.uid : (S.fleet[0] || {}).uid;
}

/* ---------- what's new: the second aircraft (day 8), the season (day 12), the jets (day 15) ---------- */
Object.assign(INTRO, {
  fleet:{ kicker:'New today · The fleet', title:'A second aircraft: buy or rent?', before:'shop2', go:'Look at the aircraft', words:[['Rent', 'Pay for the aircraft by the day. Hand it back when you no longer need it.'], ['Buy', 'Pay the whole price now. The aircraft is yours.'], ['Finance', 'Pay a deposit now and the rest in daily payments.'], ['Assignment', 'Deciding which aircraft flies which route.']],
    what:() => { const s = planeById('sf34'), o = shopOffer(s, 8); return [['Your airline can grow. Aircraft are for sale, and each one can be bought, rented by the day, or financed.'],
      `<div class="ni-cards four"><div class="ni-card"><em>${money(o.price)}</em><b>Buy</b><span>Pay it all now. Nothing more to pay.</span></div><div class="ni-card"><em>${money(o.lease)}</em><b>Rent, a day</b><span>Every day, for as long as you keep it.</span></div><div class="ni-card"><em>${money(o.deposit)}</em><b>Finance, down</b><span>Then ${money(o.pay)} a day for ${o.n} days.</span></div><div class="ni-card"><em>${s.seats}</em><b>Seats</b><span>A ${esc(s.name)} carries ${s.seats} people a service: nearly twice the Twin Otter.</span></div></div>`,
      ['Four new routes open today too. A second aircraft can fly one of them while the Twin Otter keeps its routes.', 'An aircraft costs its day cost whether it flies or not, so give it work.']]; },
    maths:() => { const s = planeById('sf34'), o = shopOffer(s, 8), d = Math.round(o.price / o.lease * 10) / 10; return [niRule('price', '÷', 'rent a day', 'Days of rent that equal the price'),
      `<div class="ni-eg"><p>The ${esc(s.name)} costs <b>${money(o.price)}</b> to buy or <b>${money(o.lease)}</b> a day to rent.</p><p>${niSum(`${num(o.price)} ÷ ${num(o.lease)} = ${d}`)} days. Rent for longer than that and buying would have been cheaper.</p>
        <p class="ni-tip">One way: ${niSum(`${num(o.lease)} × 20 = ${num(o.lease * 20)}`)}, then ${niSum(`${num(o.price - o.lease * 20)} ÷ ${num(o.lease)} = ${Math.round((o.price - o.lease * 20) / o.lease * 10) / 10}`)} more, so ${d} days.</p></div>`]; },
    check:{ q:'An aircraft costs £15,000 to buy or £500 a day to rent. After how many days of rent would buying have been cheaper?', opts:[['30 days', ''], ['15 days', '15 × £500 is £7,500, only half the price.'], ['300 days', '300 × £500 is £150,000, ten times the price.']], ok:0, done:'£15,000 ÷ £500 = 30 days.' },
    think:['How many days will you keep the aircraft? Longer than the rent-or-buy days means buy.', 'Does the extra profit a day cover the rent? The model says what the aircraft would add.'] },
  season:{ kicker:'New today · The seasons', title:'Some routes have a season', before:'planner', words:[['Season', 'A time of year when more or fewer people want to fly a route.'], ['Multiplier', 'The number demand is multiplied by: ×0.5 is half, ×1.4 is nearly one and a half times.']],
    what:() => { const rows = ['gva', 'bcn'].map(id => { const r = routeById(id), now = demandMult(r, S.day), best = MARKET.filter(m => m.seasonMult && m.seasonMult[id] !== undefined && m.seasonMult[id] !== null).sort((a, b) => b.seasonMult[id] - a.seasonMult[id])[0];
        return `<div class="ni-card">${flagSvg(r.flag, 20)}<em>×${num(r2(now))}</em><b>${esc(r.city)} now</b><span>${best ? `Busiest in the week of ${dateShort(dayOfDate(best.weekStart))}: ×${best.seasonMult[id]}.` : ''}</span></div>`; }).join('');
      return [['Geneva is a ski route: quiet in September, busy in winter. Barcelona is a sun route: busiest in summer.'], `<div class="ni-cards two">${rows}</div>`, ['The Plan screen shows how many want to fly today. The Market sheet behind it knows the whole year.', 'A route that loses money in September may be your best route in January.']]; },
    maths:() => [niRule('people in a normal week', '×', 'season multiplier', 'People this week'),
      `<div class="ni-eg"><p>In a normal week <b>60</b> people a day want to fly to Geneva at £120. In September the multiplier is <b>×0.5</b>: ${niSum('60 × 0.5 = 30')}</p><p>In a January week it is <b>×1.4</b>: ${niSum('60 × 1.4 = 84')}</p><p class="ni-tip">×1.4 is 60 plus four tenths of 60: 60 + 24 = 84.</p></div>`],
    check:{ q:'In a normal week 50 people want to fly a route. This week\'s multiplier is ×1.2. How many want to fly?', opts:[['60', ''], ['40', '×1.2 is more than one, so more people, not fewer.'], ['62', 'Two tenths of 50 is 10, so 50 + 10.']], ok:0, done:'50 × 1.2 = 60 people.' },
    think:['Is it worth keeping a quiet route open for its busy season?', 'Try a lower fare on a quiet route in the Test step.'] },
  jets:{ kicker:'New today · Medium haul', title:'Madrid: range and flight time', before:'shop2', go:'Look at the aircraft', words:[['Range', 'How far an aircraft can fly without refuelling.'], ['Medium haul', 'A flight of about 1,000 to 3,000 km: a few hours each way.'], ['Flight time', 'Distance ÷ speed.']],
    what:() => { const r = routeById('mad'), list = PLANES.filter(p => (p.shopFromDay || 1) <= S.day); return [[`${r.city} is open: ${num(routeKm(r))} km from London. Only an aircraft with the range can fly it, and a long leg means fewer services in a day.`],
      `<div class="ni-cards four">${list.slice(0, 4).map(p => `<div class="ni-card ${planeCanFly(p, r) ? '' : 'off'}"><em>${num(p.range)} km</em><b>${esc(p.name.replace(/^DHC-6 /, ''))}</b><span>${planeCanFly(p, r) ? `Reaches ${r.city}: ${fmtDur(legMinutes(p, r))} each way at ${num(p.speed)} km/h.` : `Cannot reach ${r.city}.`}</span></div>`).join('')}</div>`,
      ['Two jets join the shop today: the Embraer E175 and E190. Fast, with many seats, and expensive every day.']]; },
    maths:() => { const r = routeById('mad'), p = planeById('at72'), j = planeById('e190'); return [niRule('distance', '÷', 'speed', 'Flight time in hours'),
      `<div class="ni-eg"><p>${esc(r.city)} is <b>${num(routeKm(r))} km</b> away. The ${esc(p.name)} flies at <b>${num(p.speed)} km/h</b>: ${niSum(`${num(routeKm(r))} ÷ ${num(p.speed)} = ${num(r2(routeKm(r) / p.speed))}`)} hours each way.</p>
        <p>The ${esc(j.name)} flies at <b>${num(j.speed)} km/h</b>: ${niSum(`${num(routeKm(r))} ÷ ${num(j.speed)} = ${num(r2(routeKm(r) / j.speed))}`)} hours each way.</p><p class="ni-tip">Out, a turnaround, and back: the ATR's day has room for one ${esc(r.city)} service and little else.</p></div>`]; },
    check:{ q:'A route is 1,800 km long and the aircraft flies at 900 km/h. How long is the flight each way?', opts:[['2 hours', ''], ['9 hours', '900 km takes one hour, so 1,800 km takes two.'], ['1 hour', '1,800 km is twice 900 km, so twice one hour.']], ok:0, done:'1,800 ÷ 900 = 2 hours each way.' },
    think:['Which aircraft should fly Madrid, and how many services fit in its day?', 'A jet costs more each hour. Does a full plane at a Madrid fare pay for it?'] } });
