
/* ==================================================================
   D67 (Workbook v4.11, Fable's "Note — A Days setting on every flight"): from flightDaysFromDay every flight in a standing
   plan carries Days: All week, Mon–Fri or Sat–Sun. Built only into the revised Studio (airline-opening-studio-v2.html);
   the main game's build is untouched. Each aircraft keeps f.days beside f.schedule (missing = all week, so old saves and
   Launch Day are unchanged); a plan's fleet entry carries x.days only when a flight is not All week.
   The engine prices each day with that day's flights only; departures, the turnaround and the duty day are checked per
   day type (Mon–Fri = all + weekday flights, Sat–Sun = all + weekend flights). Functions are reassigned here, never
   redeclared, so the originals stay reachable and the main build never sees this part.
   ================================================================== */
const DAYS_KEYS = ['all', 'weekday', 'weekend'];
function daysLabels(){ const s = String(WBS().flightDays || 'All week | Mon–Fri | Sat–Sun').split('|').map(x => x.trim()).filter(Boolean); return s.length === 3 ? s : ['All week', 'Mon–Fri', 'Sat–Sun']; }
const daysLabel = v => daysLabels()[Math.max(0, DAYS_KEYS.indexOf(v || 'all'))];
const flightDaysOn = () => typeof weekMode === 'function' && weekMode() && !!S && S.phase !== 'setup' && (S.day || 1) >= +(WBS().flightDaysFromDay || 8);
const dayTypeOf = d => { const w = calDate(d).getUTCDay(); return w === 0 || w === 6 ? 'weekend' : 'weekday'; };
const fliesOn = (v, dt) => !v || v === 'all' || v === dt;
const daysFix = (days, n) => { const out = []; for(let k = 0; k < n; k++) out.push(days && DAYS_KEYS.includes(days[k]) ? days[k] : 'all'); return out; };
const hasDays = days => !!days && days.some(v => v && v !== 'all');
const anyDays = pl => normPlan(pl).fleet.some(x => hasDays(x.days));
const simDayNow = () => (SIM_DAY !== null && SIM_DAY !== undefined ? SIM_DAY : (S && S.day) || 1);
/* the Saturday of the week a day belongs to (the plan's weekend) */
const satOf = d => d + ((6 - calDate(d).getUTCDay() + 7) % 7);
/* the flights of one aircraft that fly on a day type, as indices into its schedule */
function setOf(x, dt){ const days = daysFix(x.days, x.sched.length); return x.sched.map((_, k) => k).filter(k => fliesOn(days[k], dt)); }

/* ---------- the engine: a day prices only its own flights ---------- */
const fdPlanFlights0 = planFlights;
planFlights = function(){
  if(!S || !S.fleet || !S.fleet.some(f => hasDays(f.days))) return fdPlanFlights0();
  const dt = dayTypeOf(simDayNow()), keep = S.fleet.map(f => ({ schedule:f.schedule, route:f.route, deps:f.deps })), keepDeps = S.deps, maps = {};
  try{
    S.fleet.forEach(f => { const sched = schedOf(f), days = daysFix(f.days, sched.length), deps = fleetDeps(f), idx = sched.map((_, k) => k).filter(k => fliesOn(days[k], dt));
      maps[f.uid] = idx; f.schedule = idx.map(k => sched[k]); f.route = f.schedule[0] || null; f.deps = deps && deps.length === sched.length ? idx.map(k => deps[k]) : null; });
    S.deps = S.fleet[0] ? S.fleet[0].deps : null;
    const out = fdPlanFlights0();
    out.forEach(x => { const m = maps[x.uid]; if(!m || m[x.trip] === undefined) return; const i = S.fleet.findIndex(f => f.uid === x.uid); x.trip = m[x.trip]; x.key = x.uid + '-' + x.trip; if(i >= 0) x.code = flightCode(i, x.trip); });
    return out;
  } finally { S.fleet.forEach((f, k) => Object.assign(f, keep[k])); S.deps = keepDeps; }
};

/* ---------- plans carry their Days ---------- */
const fdWithPlan0 = withPlan;
withPlan = function(pl, fn){
  pl = normPlan(pl); const keep = S.fleet.map(f => f.days);
  return fdWithPlan0(pl, () => {
    pl.fleet.forEach(x => { const f = S.fleet.find(y => y.uid === x.uid); if(f) f.days = hasDays(x.days) ? daysFix(x.days, x.sched.length) : null; });
    try{ return fn(); } finally { S.fleet.forEach((f, k) => { f.days = keep[k]; }); } });
};
const fdCurrentPlan0 = currentPlan;
currentPlan = function(){
  const pl = fdCurrentPlan0();
  pl.fleet.forEach(x => { const f = S.fleet.find(y => y.uid === x.uid); if(f && hasDays(f.days)) x.days = daysFix(f.days, x.sched.length); });
  return pl;
};
const fdSetDays = pl => { normPlan(pl).fleet.forEach(x => { const f = S.fleet.find(y => y.uid === x.uid); if(f) f.days = hasDays(x.days) ? daysFix(x.days, x.sched.length) : null; }); };
const fdApplyPlan0 = applyPlan, fdApplyPlanRaw0 = applyPlanRaw;
applyPlan = function(pl){ fdSetDays(pl); return fdApplyPlan0(pl); };
applyPlanRaw = function(pl){ fdSetDays(pl); return fdApplyPlanRaw0(pl); };
const fdPlanKey0 = planKey;
planKey = function(pl){ const k = fdPlanKey0(pl); pl = normPlan(pl); return anyDays(pl) ? k + JSON.stringify(pl.fleet.map(x => daysFix(x.days, x.sched.length))) : k; };

/* ---------- departures and the day's fit, per day type ---------- */
const fdActualDeps0 = actualDeps, fdFitsFor0 = fitsFor;
actualDeps = function(pl, j){
  pl = normPlan(pl); const x = pl.fleet[j || 0]; if(!x || !hasDays(x.days)) return fdActualDeps0(pl, j);
  const p = planeById(x.planeId), sets = ['weekday', 'weekend'].map(dt => setOf(x, dt)).filter(s => s.length);
  let cur = x.deps && x.deps.length === x.sched.length ? x.deps.slice() : null;
  for(let it = 0; it < 6; it++){   // an All-week flight takes the later of its two times; pushes only go later, so this settles
    const next = x.sched.map(() => -Infinity);
    sets.forEach(idx => { const D = withPlan(pl, () => TIME.day(p, idx.map(k => x.sched[k]), undefined, cur ? idx.map(k => cur[k]) : null)); D.trips.forEach((t, q) => { next[idx[q]] = Math.max(next[idx[q]], t.dep); }); });
    if(cur && next.every((v, k) => v === cur[k])) break; cur = next;
  }
  return cur;
};
fitsFor = function(x){
  if(!hasDays(x.days)) return fdFitsFor0(x);
  const p = planeById(x.planeId), maxT = WORLD.maxTrips || 4, deps = x.deps && x.deps.length === x.sched.length ? x.deps : null;
  return ['weekday', 'weekend'].map(dt => setOf(x, dt)).every(idx => idx.length <= maxT && (idx.length <= 1 || TIME.day(p, idx.map(k => x.sched[k]), undefined, deps ? idx.map(k => deps[k]) : null).end <= dayEnd()));
};

/* ---------- edits that re-sort or remove a flight keep its Days with it ---------- */
const fdEditPlan0 = editPlan;
editPlan = function(i, what, a, d, j){
  const base = i === 9 ? testPlan() : currentPlan();
  if(!anyDays(base) || (what !== 'del' && what !== 'depTo')) return fdEditPlan0(i, what, a, d, j);
  j = j || 0; const next = normPlan(JSON.parse(JSON.stringify(base))), x = next.fleet[j] || next.fleet[0], k = +a; if(!x || !x.sched[k]) return;
  x.days = daysFix(x.days, x.sched.length); if(!x.deps || x.deps.length !== x.sched.length) x.deps = actualDeps(next, j);
  if(what === 'del'){ x.sched.splice(k, 1); x.deps.splice(k, 1); x.days.splice(k, 1); if(!x.sched.length) x.deps = null; else x.deps = actualDeps(next, j); UI.tlSel = null; setPlan(i, next); return; }
  const p = planeById(x.planeId), r = routeById(x.sched[k]), trip = TIME.roundTrip(p, r), dep = clamp(Math.round(d / PLW_SNAP) * PLW_SNAP, dayStart(), dayEnd() - trip);
  x.deps[k] = dep;
  const order = x.sched.map((id, q) => ({ id, dep:x.deps[q], dy:x.days[q], q })).sort((u, v) => u.dep - v.dep || u.q - v.q);
  x.sched = order.map(o => o.id); x.deps = order.map(o => o.dep); x.days = order.map(o => o.dy);
  const actual = actualDeps(next, j), nk = order.findIndex(o => o.q === k); x.deps = actual;
  if(!withPlan(next, () => fitsFor(x))){ toast("That timetable won't fit in the operating day."); return; }
  if(actual[nk] !== dep) toast(`${r.city} leaves at ${fmtTime(actual[nk])}: the aircraft is not back until then.`);
  UI.tlSel = { i, j, k:nk }; setPlan(i, next);
};
/* a new flight takes the Days chosen for it (UI.s2.newDays, All week unless set); it only has to fit around the flights it shares a day with */
const fdAddService0 = addService;
addService = function(i, id, j){
  const nd = (UI.s2 && UI.s2.newDays && flightDaysOn()) ? UI.s2.newDays : 'all', base = i === 9 ? testPlan() : currentPlan();
  if(nd === 'all' && !anyDays(base)) return fdAddService0(i, id, j);
  const r = routeById(id), next = normPlan(JSON.parse(JSON.stringify(base))), maxT = WORLD.maxTrips || 4;
  next.fleet.forEach((x, q) => { x.days = daysFix(x.days, x.sched.length); x.deps = x.sched.length ? (x.deps && x.deps.length === x.sched.length ? x.deps : actualDeps(next, q)) : []; });
  const lanes = (j === null || j === undefined ? next.fleet.map((x, q) => q) : [j]).filter(q => next.fleet[q] && planeCanFly(planeById(next.fleet[q].planeId), r));
  if(i !== 9 && S.rnd){ if(!lanes.length) S.rnd.stRange = { route:id, plane:next.fleet[j === null || j === undefined ? 0 : j].planeId }; else delete S.rnd.stRange; }
  if(!lanes.length){ const p = next.fleet[j || 0] && planeById(next.fleet[j || 0].planeId); toast(p && j !== null && j !== undefined ? `The ${p.name} can't reach ${r.city}: its range is ${num(p.range)} km and ${r.city} is ${num(routeKm(r))} km away.` : `No aircraft you own can reach ${r.city} (${num(routeKm(r))} km).`); render(); return; }
  let hit = null;
  for(const q of lanes){
    const x = next.fleet[q], p = planeById(x.planeId), sets = (nd === 'all' ? ['weekday', 'weekend'] : [nd]).map(dt => setOf(x, dt));
    if(sets.some(s => s.length >= maxT)) continue;
    const home = TIME.home(p), trip = TIME.roundTrip(p, r), busy = [...new Set(sets.flat())].map(k => [x.deps[k], x.deps[k] + TIME.roundTrip(p, routeById(x.sched[k])) + home]);
    for(let t = dayStart(); t + trip <= dayEnd(); t += PLW_SNAP){ if(!busy.some(([a, z]) => t < z && t + trip + home > a)){ hit = { q, t }; break; } }
    if(hit) break;
  }
  if(!hit){ toast(`No room left in the ${daysLabel(nd) === daysLabel('all') ? '' : daysLabel(nd) + ' '}day for a ${r.city} service: move or remove a flight first.`); return; }
  const x = next.fleet[hit.q]; x.sched.push(id); x.deps.push(hit.t); x.days.push(nd);
  const order = x.sched.map((rid, k) => ({ rid, dep:x.deps[k], dy:x.days[k], k })).sort((u, v) => u.dep - v.dep || u.k - v.k);
  x.sched = order.map(o => o.rid); x.deps = order.map(o => o.dep); x.days = order.map(o => o.dy); if(!next.prices[id]) next.prices[id] = r.basePrice;
  x.deps = actualDeps(next, hit.q);
  next.fleet.forEach(z => { if(!z.sched.length){ z.deps = null; z.days = null; } });
  UI.tlSel = { i, j:hit.q, k:order.findIndex(o => o.k === x.sched.length - 1) }; UI.tlFocus = true;
  setPlan(i, next);
};
/* the Operations Model moving a route between aircraft keeps the other flights' Days */
const fdOmMoveRoute0 = omMoveRoute;
omMoveRoute = function(id, uid){
  const base = testPlan(); if(!anyDays(base)) return fdOmMoveRoute0(id, uid);
  const next = normPlan(JSON.parse(JSON.stringify(base))), to = next.fleet.findIndex(x => x.uid === uid); if(to < 0) return;
  const n = next.fleet.reduce((t, x, j) => t + (j === to ? 0 : x.sched.filter(s => s === id).length), 0); if(!n) return;
  next.fleet.forEach((x, j) => { if(j === to) return; const days = daysFix(x.days, x.sched.length), keep = x.sched.map((s, k) => s === id ? -1 : k).filter(k => k >= 0);
    x.deps = x.deps && x.deps.length === x.sched.length ? keep.map(k => x.deps[k]) : null; x.days = keep.map(k => days[k]); x.sched = keep.map(k => x.sched[k]); });
  S.rnd.test = next; for(let q = 0; q < n; q++){ const before = planKey(testPlan()); addService(9, id, to); if(planKey(testPlan()) === before) break; }
};
/* one flight's Days changed in the flight editor */
function s2SetDays(j, k, v){
  if(!DAYS_KEYS.includes(v)) return;
  const next = normPlan(JSON.parse(JSON.stringify(currentPlan()))), x = next.fleet[j]; if(!x || !x.sched[k]) return;
  x.days = daysFix(x.days, x.sched.length); if(!x.deps || x.deps.length !== x.sched.length) x.deps = actualDeps(next, j);
  x.days[k] = v; x.deps = actualDeps(next, j);
  if(!withPlan(next, () => fitsFor(x))){ toast(`On ${v === 'weekend' ? 'Saturday and Sunday' : 'weekdays'} that would be more than the aircraft can fly in a day.`); render(); return; }
  if(v !== 'all' && UI.s2 && UI.s2.dt !== v) UI.s2.dt = v;   // the flight stays in view (and selected)
  UI.tlSel = { i:0, j, k }; UI.tlFocus = true; setPlan(0, next);
}

/* ---------- PlanTips v4.11: weekend_only_news and fare_lower_fills, read from the workbook's PlanTips sheet (the older rows keep the
   Studio's own copy: the sheet writes their thresholds with units, '4 h', '1 plane', which the tip code does not read) ---------- */
const FD_TIPS = (() => { try{ return (JSON.parse(document.getElementById('data-workbook').textContent).planTips || []).filter(t => ['weekend_only_news', 'fare_lower_fills'].includes(t.id)); }catch(e){ return []; } })();
const fdPlanTips0 = planTipsFor;
planTipsFor = function(pl, L, opts){
  opts = opts || {}; pl = normPlan(pl);
  const T = Object.fromEntries(FD_TIPS.filter(t => t.message).map(t => [t.id, t])), extra = [];
  const pr = (id, def) => T[id] && T[id].priority !== undefined && T[id].priority !== null && !isNaN(+T[id].priority) ? +T[id].priority : def;
  if(T.fare_lower_fills) [...new Set((L.services || []).map(s => s.route))].forEach(id => {
    const r = routeById(id), fare = pl.prices[id] || r.basePrice, lo = (r.fares || []).filter(f => f < fare).pop(), act = opts.actual && opts.routes && opts.routes[id], svc = (L.services || []).filter(s => s.route === id);
    const seats = act ? act.seats : svc.reduce((t, s) => t + (s.seats || 0), 0), sold = act ? act.pax : svc.reduce((t, s) => t + (s.sold || 0), 0);
    if(lo !== undefined && seats && sold < seats && paxWant(r, lo) >= seats) extra.push({ id:'fare_lower_fills', priority:pr('fare_lower_fills', 3), weight:seats - sold, text:fillTip(T.fare_lower_fills.message, { route:r.city, seats:num(seats), lower:num(lo), diff:num(fare - lo) }) }); });
  if(T.weekend_only_news && flightDaysOn() && !opts.actual){ const seen = new Set();
    announcedFor(S.day || 1).filter(s2WeekendOnly).forEach(n => n.routes.forEach(id => { if(seen.has(id) || !routeById(id) || !plannerRoutes().includes(id)) return; seen.add(id);
      const has = pl.fleet.some(x => { const dy = daysFix(x.days, x.sched.length); return x.sched.some((s, k) => s === id && dy[k] === 'weekend'); });
      if(!has) extra.push({ id:'weekend_only_news', priority:pr('weekend_only_news', 1), weight:1e6, text:fillTip(T.weekend_only_news.message, { route:routeById(id).city }) }); })); }
  if(!extra.length) return fdPlanTips0(pl, L, opts);
  const list = fdPlanTips0(pl, L, Object.assign({}, opts, { all:true })).filter(t => !['all_good', 'general_tradeoff'].includes(t.id)).concat(extra).sort((a, b) => a.priority - b.priority || (b.weight || 0) - (a.weight || 0));
  if(opts.all) return list;
  const seen = new Set(); return list.filter(h => { if(seen.has(h.id)) return false; seen.add(h.id); return true; }).slice(0, 2);
};

/* ---------- the Sunday and period review: Mon–Fri and Sat–Sun seat fill from the days that flew ---------- */
const fdSeatFill0 = seatFillReviewHtml;
seatFillReviewHtml = function(h){
  const html = fdSeatFill0(h); if(!html || !h || !h.from || WBS().summaryWeekdayWeekend === false || !anyDays(currentPlan())) return html;
  const Lg = ledger(), a = { pax:0, seats:0 }, b = { pax:0, seats:0 };
  for(let d = h.from; d <= (h.to || h.from); d++){ if(Lg.seats[d] === undefined || Lg.seats[d] === null) continue; const o = dayTypeOf(d) === 'weekend' ? b : a; o.pax += Lg.pax[d] || 0; o.seats += Lg.seats[d] || 0; }
  const one = (lab, o) => `<span class="s2-sp"><small>${lab}</small><b class="mono">${num(o.pax)} / ${num(o.seats)}</b><em class="fill-${fillCls(o.pax, o.seats)}">${o.seats ? Math.round(100 * o.pax / o.seats) : 0}%</em></span>`;
  const at = html.indexOf('class="st-rvf"'), end = at < 0 ? -1 : html.indexOf('</div>', at); if(end < 0) return html;
  return html.slice(0, end + 6) + `<div class="s2-rvsplit"><small>Seats filled</small>${one(daysLabel('weekday'), a)}${one(daysLabel('weekend'), b)}</div>` + html.slice(end + 6);
};
/* for the tests: one day's flights as the engine prices them */
function fdDayFlights(d){ return withDay(d, () => withBeat(beatAt(d), () => planFlights())).map(f => ({ route:f.route, uid:f.uid, k:f.trip, dep:f.dep, seats:f.seats, sold:f.sold })); }
