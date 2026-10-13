/* ==================================================================
   LONG HAUL (Workbook v5.0: D68 long haul, D72 the 757 and the 787, D73 the long-haul crew). Revised Studio only.
   A route over Settings longHaulFromKm (4,000 km) is long haul:
     - the aircraft waits longHaulTurnaroundMin (120) at the far end, so New York is out at 06:30, back at 21:00: one a day;
     - every long-haul service pays longHaulCrewCost (£500), a flat second crew, in place of the duty-day rule (D51);
     - arrival is shown in local time: London departure + flying time + the route's utc (Delhi 5.5 hours);
     - fuel is the whole litres (12,375 L to New York in a 757), not rounded to tens;
     - Routes.rotation = overnight (Delhi, from June): out on day 1, back on day 2. Revenue, fuel, flying, landing,
       passenger charges and the crew are booked on the way out, the plane's day cost every day: it earns every second day.
   Archetype long_haul grows 5% a week from the route's opening week, to ×1.5; Routes.seasonOverride replaces the
   archetype's season multipliers on that route.
   ================================================================== */
const LH = () => { const st = WORLD.settings || {}; return { from:st.longHaulFromKm || 4000, turn:st.longHaulTurnaroundMin || 120, crew:st.longHaulCrewCost || 500, sameDayMax:st.longHaulSameDayMaxKm || 6000, dep:toMin('06:30') }; };
(WB && WB.routes || []).forEach(w => { const r = WORLD.routes.find(x => x.id === w.id); if(r){ r.rotation = w.rotation || 'same-day'; r.seasonOverride = w.seasonOverride || null; } });
function isLongHaul(route){ return !!route && routeKm(route) > LH().from; }
function isOvernight(route){ return !!route && route.rotation === 'overnight'; }
const lhId = id => isLongHaul(routeById(id)), onId = id => isOvernight(routeById(id));
/* the far end's clock: London + the route's utc (hours, fractional allowed) */
function localTime(route, londonMin){ return londonMin + Math.round(60 * ((route && route.utc) || 0)); }
function localArrText(route, trip){ const t = localTime(route, trip.arriveAway), d = Math.floor(t / 1440) - Math.floor(trip.arriveAway / 1440); return `lands ${fmtTime(t)}${d > 0 ? ' next day' : d < 0 ? ' the day before' : ''} ${route.city} time`; }
function zoneText(route){ const u = (route && route.utc) || 0, h = Math.abs(u), hs = h === 1 ? 'an hour' : `${String(h).replace('.5', '½')} hours`; return u === 0 ? 'the same time as London' : `${hs} ${u > 0 ? 'ahead of' : 'behind'} London`; }

/* ---------- time: the long turnaround, the overnight rotation's one-way day ---------- */
const lhAway0 = TIME.away;
TIME.away = function(plane, route){ return isLongHaul(route) ? LH().turn : lhAway0.call(TIME, plane, route); };
const lhDay0 = TIME.day;
TIME.day = function(plane, ids, start, deps){
  if(!(ids.length === 1 && onId(ids[0]))) return lhDay0.call(TIME, plane, ids, start, deps);
  if(deps === undefined) deps = depsOn() && S && Array.isArray(S.deps) ? S.deps : null;
  const id = ids[0], r = routeById(id), L = TIME.leg(plane, r), dep = deps && deps[0] !== undefined && deps[0] !== null ? deps[0] : start === undefined ? LH().dep : start;
  const segs = [{ kind:'out', start:dep, end:dep + L, route:id, k:0 }];
  return { start:dep, trips:[{ route:id, k:0, dep, arriveAway:dep + L, leaveAway:null, arr:dep + L, overnight:true, segments:segs }], segments:segs, end:dep + L, elapsed:L };
};
/* a long-haul service looks for 06:30 first (Balance Report: "one service at 06:30 is the natural plan") */
const lhFreeDep0 = freeDep;
freeDep = function(next, j, id){
  const x = next.fleet[j]; if(!lhId(id) || !x) return lhFreeDep0(next, j, id);
  if(onId(id)) return x.sched.length ? null : LH().dep;   // an overnight rotation is the aircraft's whole day, and the next
  if(x.sched.some(onId)) return null;
  const p = planeById(x.planeId), r = routeById(id), trip = TIME.roundTrip(p, r), home = TIME.home(p), t = LH().dep;
  const deps = x.sched.length ? (x.deps && x.deps.length === x.sched.length ? x.deps : actualDeps(next, j)) : [], busy = x.sched.map((rid, k) => [deps[k], deps[k] + TIME.roundTrip(p, routeById(rid)) + home]);
  if(t + trip <= dayEnd() && !busy.some(([a, z]) => t < z && t + trip + home > a)) return t;
  return lhFreeDep0(next, j, id);
};
const lhFitsFor0 = fitsFor;
fitsFor = function(x){ if(x.sched.length > 1 && x.sched.some(onId)) return false; return lhFitsFor0(x); };
/* adding a long-haul service that can't fit says why */
const lhAddService0 = addService;
addService = function(i, id, j){
  const r = routeById(id); if(!lhId(id)) return lhAddService0(i, id, j);
  const base = normPlan(JSON.parse(JSON.stringify(i === 9 ? testPlan() : currentPlan()))), lanes = (j === null || j === undefined ? base.fleet.map((x, q) => q) : [j]).filter(q => base.fleet[q] && planeCanFly(planeById(base.fleet[q].planeId), r));
  if(lanes.length && !lanes.some(q => freeDep(base, q, id) !== null)){
    const p = planeById(base.fleet[lanes[0]].planeId), rt = TIME.roundTrip(p, r);
    toast(isOvernight(r) ? `Doesn't fit: ${r.city} is an overnight rotation. The aircraft flies out one day and back the next, so it can't fly anything else.` : `Doesn't fit: ${r.city} and back takes ${fmtDur(rt)} (out at ${fmtTime(LH().dep)}, back at ${fmtTime(LH().dep + rt)}), so a long-haul aircraft flies one ${r.city} service a day.`);
    render(); return;
  }
  return lhAddService0(i, id, j);
};

/* ---------- fuel in whole litres ---------- */
const lhFuel0 = fuelForTrip;
fuelForTrip = function(plane, route){ return isLongHaul(route) ? Math.round(plane.fuelUse * 2 * routeKm(route) / 100) : lhFuel0(plane, route); };

/* ---------- demand: growth from the opening week, the route's own seasons ---------- */
const lhGrowth0 = growthOf;
growthOf = function(route, n){
  const a = route && route.arch; if(!a || route.archId !== 'long_haul') return lhGrowth0(route, n);
  const g = a.growthPerWeek < 1 ? a.growthPerWeek : a.growthPerWeek / 100, wk = Math.max(0, weekNo(beatDay(n === undefined ? S.round : n)) - weekNo(route.openDay || 1));
  return Math.min(a.growthCeiling || Infinity, 1 + g * wk);
};
/* the route's own season replaces the archetype's (the day's demand multiplier carries the season: p4n demandMult0, p4y route news) */
function seasonOverrideFactor(route, day){
  const o = route && route.seasonOverride, s = seasonOf(day), m = marketWeekOf(day) || {}, a = route && route.arch; if(!o || o[s] === undefined) return 1;
  if(m.seasonMult && m.seasonMult[route.id] !== undefined && m.seasonMult[route.id] !== null) return 1;   // a Market column for the route wins, as before
  const base = a && a.season ? (a.season[s] || 1) : 1; return o[s] / base;
}
const lhDemandMult0 = demandMult;
demandMult = function(route, day){ return lhDemandMult0(route, day) * seasonOverrideFactor(route, day); };
const lhSeason0 = seasonMult;
seasonMult = function(route, n){ const o = route && route.seasonOverride, s = o ? seasonOf(beatDay(n === undefined ? S.round : n)) : null; return o && o[s] !== undefined ? o[s] : lhSeason0(route, n); };

/* ---------- the overnight rotation: out on day 1, home on day 2 ---------- */
/* which days an aircraft flies out: from the first day it flew the route, every second day */
function rotOut(f, day){ const r = (schedOf(f) || [])[0]; if(!r || !onId(r)) return true;
  if(!f.rot || f.rot.route !== r){ if(SIM_DAY !== null && SIM_DAY !== S.day) return (day - S.day) % 2 === 0; f.rot = { route:r, from:day }; }
  return ((day - f.rot.from) % 2 + 2) % 2 === 0; }
function rotOn(f){ const s = schedOf(f); return s.length === 1 && onId(s[0]); }
const lhPlanFlights0 = planFlights;
planFlights = function(){
  if(!S || !S.fleet) return lhPlanFlights0();
  const day = simDayNow(), home = S.fleet.filter(f => rotOn(f) && !rotOut(f, day));
  let out;
  if(!home.length) out = lhPlanFlights0();
  else { const keep = home.map(f => [f, f.schedule, f.route]); home.forEach(f => { f.schedule = []; f.route = null; });
    try{ out = lhPlanFlights0(); } finally { keep.forEach(([f, s, r]) => { f.schedule = s; f.route = r; }); } }
  home.forEach(f => { const i = S.fleet.indexOf(f), id = schedOf(f)[0], r = routeById(id), p = planeById(f.planeId), D = TIME.day(p, [id], undefined, fleetDeps(f)), t = D.trips[0];
    out.push({ key:f.uid + '-0', uid:f.uid, trip:0, planeId:f.planeId, route:id, code:flightCode(i, 0), price:fareOf(id), seats:0, layout:f.layout, dep:t.dep, arr:t.arr, segments:t.segments,
      fuelL:0, runCost:0, fuelCost:0, termCost:0, demand:0, sold:0, revenue:0, homeLeg:true, band:bandOf(t.dep), reasons:[`Flying home from ${r.city}: the rotation's passengers and costs were booked on the way out.`] }); });
  out.forEach(x => { const r = routeById(x.route); if(isLongHaul(r) && !x.homeLeg){ const D = x.segments && x.segments[0]; x.longHaul = true; x.localArr = localTime(r, D ? D.end : x.arr); } });
  return out;
};
/* a long-haul service pays the flat second crew; its aircraft is not charged the duty-day crew as well */
const lhDuty0 = dutyMin;
dutyMin = function(plane, sched){ return (sched || []).some(lhId) ? 0 : lhDuty0(plane, sched); };
const lhExtras0 = dayExtras;
dayExtras = function(fl){
  const X = lhExtras0(fl); if(!crewOn()) return Object.assign(X, { lhCrew:0, lhServices:0 });
  const n = fl.filter(f => !f.grounded && !f.noFuel && !f.homeLeg && f.longHaul).length;
  return Object.assign(X, { lhCrew:n * LH().crew, lhServices:n, crew:(X.crew || 0) + n * LH().crew });
};

/* ---------- the timetable: the local arrival on the block, the overnight block ---------- */
const lhBlock0 = s2Block;
s2Block = function(i, pl, L, x, j, t, k, last, o, dy){
  const h = lhBlock0(i, pl, L, x, j, t, k, last, o, dy), r = routeById(t.route); if(!isLongHaul(r)) return h;
  const note = t.overnight ? `Out today, back tomorrow · earns every second day · ${localArrText(r, t)}` : localArrText(r, t);
  return h.replace(/<button class="ad-blk st-blk s2-blk /, `<button class="ad-blk st-blk s2-blk lh ${t.overnight ? 'ovn' : ''} `).replace('<span class="s2-bfare', `<span class="s2-lh">${esc(note)}</span><span class="s2-bfare`);
};
/* the flight editor: the local arrival in place of "ready again"; an overnight rotation is one way today */
const lhSvc0 = s2SvcEditor;
s2SvcEditor = function(pl, L, sel){
  const h = lhSvc0(pl, L, sel), x = pl.fleet[sel.j], id = x && x.sched[sel.k], r = id && routeById(id); if(!h || !isLongHaul(r)) return h;
  const p = planeById(x.planeId), dps = x.deps && x.deps.length === x.sched.length ? x.deps : actualDeps(pl, sel.j), dep = dps[sel.k], leg = TIME.leg(p, r), back = dep + TIME.roundTrip(p, r);
  let out = h.replace(/ready again <span class="mono">[^<]*<\/span>/, esc(localArrText(r, { arriveAway:dep + leg })));
  if(isOvernight(r)) out = out.replace(`${fmtTime(dep)}–${fmtTime(back)}`, `${fmtTime(dep)}–${fmtTime(dep + leg)}`).replace('<small>', '<small>back tomorrow, earns every second day · ');
  return out;
};

/* ---------- what's new on day 127 ---------- */
INTRO.longhaul = { kicker:'New this week · Long haul', title:'Going long', before:'shop2',
  words:[['Long haul', () => `A route over ${num(LH().from)} km. New York is ${num(routeKm(routeById('nyc')))} km from London.`], ['Local time', 'The time on the clocks where the plane lands.'], ['Second crew', () => `A long flight needs two crews: ${money(LH().crew)} for every long-haul service.`]],
  what:() => { const r = routeById('nyc'), p = planeById('b757') || ourPlane(), L = TIME.leg(p, r), dep = LH().dep, back = dep + TIME.roundTrip(p, r);
    return [[`New York and Dubai open today. They are too far for your short-haul planes: you need a long-haul plane, the <b>Boeing 757</b> or the <b>Boeing 787</b>, rented by the day.`],
      `<div class="ni-flow"><div><span class="kl">Out from London</span><b class="mono">${fmtTime(dep)}</b><small>${fmtDur(L)} flying</small></div><div><span class="kl">Lands in New York</span><b class="mono">${fmtTime(localTime(r, dep + L))}</b><small>New York time (${esc(zoneText(r))})</small></div><div><span class="kl">Back in London</span><b class="mono">${fmtTime(back)}</b><small>so one flight a day</small></div></div>`,
      ['Each long-haul flight has a second crew on board, and the plane waits two hours at the far end.']]; },
  maths:() => [niRule('London time', '−', '5 hours', 'New York time'),
    `<div class="ni-eg"><p>A plane leaves London at <b>09:00</b> and flies for <b>7 hours</b>. It lands at 16:00 London time.</p><p>New York is 5 hours behind: ${niSum('16:00 − 5 hours = 11:00')} New York time.</p></div>`],
  check:{ q:'A plane lands in Dubai at 15:00 London time. Dubai is 4 hours ahead of London. What time is it in Dubai?', opts:[['11:00', 'That is 4 hours behind. Dubai is ahead, so add the 4 hours.'], ['19:00', ''], ['15:00', 'That is London time. Dubai\'s clocks are 4 hours ahead.']], ok:1, done:'15:00 + 4 hours = 19:00 in Dubai.' },
  think:['A 757 has 200 seats and a 787 has 250. Which would you rent first, and why?', 'Look at the rent as well as the seats.'] };

/* ---------- for the tests and the report: one service's day, each line from the engine ---------- */
function lhServiceDay(uid, soldTo){
  const f = S.fleet.find(x => x.uid === uid) || S.fleet.find(x => schedOf(x).some(lhId)); if(!f) return null;
  const fl = planFlights(), x = fl.find(z => z.uid === f.uid && !z.homeLeg); if(!x) return null;
  const sold = soldTo === undefined ? x.sold : soldTo, X = dayExtras(fl.filter(z => z.uid === f.uid)), r = routeById(x.route), p = planeById(f.planeId), ppl = fuelOn(simDayNow());
  const rev = sold * x.price, fuel = r2(x.fuelL * ppl), land = landingFees(r), fly = x.runCost - land, pax = r2(sold * termCharge()), crew = X.lhCrew, day = p.dayCost || 0, rent = dayCostOf(f) - day;
  return { route:x.route, plane:f.planeId, fare:x.price, dep:fmtTime(x.dep), arr:fmtTime(x.arr), localArr:fmtTime(x.localArr), want:x.demand, soldLive:x.sold, sold, rev, fuelL:x.fuelL, ppl, fuel, fly, land, pax, crew, day, rent,
    profit:r2(rev - fuel - fly - land - pax - crew - day - rent) };
}
