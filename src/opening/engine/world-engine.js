/* The world engine: one aircraft's day under the workbook's rules (Fable Pass 1, section 0).
   Not used by the game yet. tests/balance.test.js checks it against data/Balance-Report.md.

   - A service is a round trip from home. It earns one plane-load at the fare (return tickets).
   - The day has five bands. A service belongs to the band it leaves home in.
   - Each route's people at a fare come from its demand table (times any multiplier). Some are time-locked: in each band,
     demand × timeSensitiveShare × the band's share, rounded (halves to even, as the reference engine).
     They only board services in their band. The rest are flexible and fill any seats left that day.
   - Costs per service: flying hours × hourly cost + landing at both ends + fuel (litres × price) + a charge per passenger at home.
     Per day: the aircraft's day cost, plus a second crew when duty (30 min before the first departure to 30 min after the
     last arrival) is over the limit. */
(function(root){
  const H = 60;
  const roundEven = x => { const f = Math.floor(x), d = x - f; return Math.abs(d - 0.5) < 1e-9 ? (f % 2 === 0 ? f : f + 1) : Math.round(x); };
  const r2 = x => Math.round(x * 100) / 100;
  const hm = s => { if(typeof s === 'number') return s; const [h, m] = String(s).split(':').map(Number); return h * H + (m || 0); };
  const clock = m => `${String(Math.floor(m / H)).padStart(2, '0')}:${String(Math.round(m % H)).padStart(2, '0')}`;

  /* The rules the engine needs, from the imported workbook (data-workbook). */
  function rules(W){
    const S = W.settings || {}, E = W.engine || {};
    const bands = E.bands || { early:[6, 9], midmorning:[9, 12], midday:[12, 15], afternoon:[15, 18], evening:[18, 22] };
    const open = S.airportOpen ? [hm(S.airportOpen), hm(S.airportClose)] : (E.airportOpen || [6, 22]).map(h => h * H);
    return { bands, open, crew: +(S.secondCrewCost ?? E.secondCrewCost ?? 250), maxDuty: +(S.maxDutyHours ?? E.maxDutyHours ?? 12) * H,
             pad: +(E.dutyPaddingMinutes ?? 30) };
  }
  const byId = (xs, id) => xs.find(x => x.id === id);
  function home(W, code, terminal){
    const a = W.airports.find(x => x.code === code && (!terminal || x.terminal === terminal)) || W.airports[0];
    return { code:a.code, terminal:a.terminal, landingFee:a.landingFee, turnaroundMin:a.turnaroundMin, passengerCharge:a.passengerCharge };
  }
  function bandOf(R, t){ for(const b in R.bands){ const [a, z] = R.bands[b]; if(t >= a * H && t < z * H) return b; } return null; }
  function legMin(plane, route){ return route.km / plane.speedKmh * H; }

  /* When each service leaves and gets back. Services run in the order given; one can't leave before the aircraft is ready. */
  function timeline(W, plane, hm0, services){
    const R = rules(W), out = [], problems = [];
    let ready = R.open[0];
    services.forEach((s, i) => {
      const route = byId(W.routes, s.route), leg = legMin(plane, route), dep = hm(s.dep);
      if(dep < ready) problems.push(`service ${i + 1} leaves at ${clock(dep)}, before the aircraft is ready at ${clock(ready)}`);
      const arrAway = dep + leg, depAway = arrAway + route.turnaroundAwayMin, arrHome = depAway + leg;
      if(arrHome > R.open[1]) problems.push(`service ${i + 1} gets back at ${clock(arrHome)}, after the airport closes`);
      ready = arrHome + hm0.turnaroundMin;
      out.push({ route:route.id, dep, arrAway, depAway, arrHome, ready, band:bandOf(R, dep), fare:s.fare, leg });
    });
    return { trips:out, problems, nextReady:ready };
  }

  /* Back-to-back departures from a first time: each leaves when the aircraft is ready. */
  function backToBack(W, plane, hm0, routeIds, first){
    let t = hm(first); const out = [];
    routeIds.forEach(id => { out.push(t); const route = byId(W.routes, id), leg = legMin(plane, route); t = t + 2 * leg + route.turnaroundAwayMin + hm0.turnaroundMin; });
    return out;
  }

  /* One aircraft's day. o = { plane, home:{code, terminal}, fuel (£ a litre), services:[{route, dep, fare}], mult:{routeId: x} } */
  function day(W, o){
    const R = rules(W), plane = typeof o.plane === 'string' ? byId(W.aircraft, o.plane) : o.plane;
    const hm0 = o.home && o.home.landingFee !== undefined ? o.home : home(W, (o.home || {}).code || 'LHR', (o.home || {}).terminal || 'T5');
    const T = timeline(W, plane, hm0, o.services), trips = T.trips;
    const routes = {};
    trips.forEach(t => { (routes[t.route] = routes[t.route] || { trips:[] }).trips.push(t); });
    Object.keys(routes).forEach(id => {
      const route = byId(W.routes, id), arch = byId(W.archetypes, route.archetype), x = routes[id], fare = x.trips[0].fare;
      if(x.trips.some(t => t.fare !== fare)) T.problems.push(`${route.city}: one fare a day`);
      const base = route.demandAtFare[String(fare)];
      if(base === undefined) T.problems.push(`${route.city}: no demand figure at £${fare}`);
      const demand = roundEven((base || 0) * ((o.mult || {})[id] ?? 1));
      const locked = {}; Object.keys(R.bands).forEach(b => { locked[b] = roundEven(demand * arch.timeSensitiveShare * arch.bands[b]); });
      const flex = demand - Object.values(locked).reduce((a, b) => a + b, 0);
      x.trips.forEach(t => { t.seats = plane.seats; t.locked = 0; t.flex = 0; });
      Object.keys(R.bands).forEach(b => { let left = locked[b]; x.trips.filter(t => t.band === b).forEach(t => { const k = Math.min(left, t.seats); t.locked = k; left -= k; }); });
      let f = flex; // flexible passengers spread across the day's services while seats remain
      while(f > 0){ const open = x.trips.filter(t => t.locked + t.flex < t.seats); if(!open.length) break; for(const t of open){ if(f <= 0) break; t.flex++; f--; } }
      Object.assign(x, { demand, locked, flex, lockedLost: Object.keys(locked).reduce((a, b) => a + (x.trips.some(t => t.band === b) ? 0 : locked[b]), 0), flexLost:f });
    });
    let rev = 0, cost = 0;
    trips.forEach(t => {
      const route = byId(W.routes, t.route);
      t.pax = t.locked + t.flex; t.revenue = t.pax * t.fare;
      t.flyingHours = 2 * t.leg / H; t.litres = plane.fuelPer100Km * 2 * route.km / 100;
      t.cost = { flying:r2(t.flyingHours * plane.hourlyCost), landing:hm0.landingFee + route.landingFeeAway, fuel:r2(t.litres * o.fuel), passengers:t.pax * hm0.passengerCharge };
      t.costs = r2(t.cost.flying + t.cost.landing + t.cost.fuel + t.cost.passengers); t.profit = r2(t.revenue - t.costs);
      rev += t.revenue; cost += t.costs;
    });
    const duty = trips.length ? (trips[trips.length - 1].arrHome + R.pad) - (trips[0].dep - R.pad) : 0;
    const crew = duty > R.maxDuty ? R.crew : 0;
    cost += plane.dayCost + crew;
    return { ok:!T.problems.length, problems:T.problems, trips, routes, dutyMin:duty, crew, dayCost:plane.dayCost,
             revenue:r2(rev), costs:r2(cost), profit:r2(rev - cost) };
  }

  const WE = { day, timeline, backToBack, legMin, bandOf, rules, home, roundEven, clock, hm };
  if(typeof module !== 'undefined' && module.exports) module.exports = WE; else root.WE = WE;
})(this);
