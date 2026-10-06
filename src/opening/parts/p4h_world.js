
/* ==================================================================
   THE WORLD WORKBOOK IN THE GAME.
   data/Airline-World-Workbook.xlsx → tools/import_world.py → the data-workbook block. Its routes (Dublin, Paris), aircraft
   (Twin Otter, Saab 340, ATR 72) and home airports replace the prototype's values, and its rules (Fable Pass 1, section 0)
   replace the old demand formula, the three time bands, the 9-hour crew rule and the home-only landing fee:
     - people at a fare come from the route's demand table (Heathrow figures; other homes scale by their demand modifier);
     - five day bands; a service belongs to the band it leaves home in; time-locked passengers only take services in their
       band, flexible ones spread across the route's services while seats remain (from Day 3; before that everyone is flexible);
     - a service costs flying hours × the hourly cost + landing fees at both ends + fuel + a charge for each passenger at home;
     - the day costs the aircraft's day cost, plus a second crew when duty (30 minutes before the first departure to 30
       minutes after the last arrival) is over 12 hours.
   Rounding is school rounding (halves up). The rules are in engine/world-engine.js (WE), the file the balance test checks.
   Routes the workbook doesn't have (Madrid and beyond) keep the old rules.
   ================================================================== */
/* The workbook's values are applied in p4a2_workbook.js, straight after the data loads. */
/* ---------- distance and time: the workbook's distance, the same from every home airport ---------- */
function routeKm(route, hh){
  if(route.wb) return route.km;
  const h = hh || homeData(), la = route.alat !== undefined ? route.alat : route.lat, lo = route.alon !== undefined ? route.alon : route.lon, R = Math.PI / 180;
  const a = Math.sin((la - h.lat) * R / 2) ** 2 + Math.cos(h.lat * R) * Math.cos(la * R) * Math.sin((lo - h.lon) * R / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(a)) / 10) * 10;
}
function legMinutes(plane, route, hh){ return route.wb ? Math.round(route.km / plane.speed * 60) : Math.max(15, Math.round(routeKm(route, hh) / plane.speed * 60 / 5) * 5); }

/* ---------- costs: flying, and landing at both ends ---------- */
function flyCost(plane, route){ return Math.round(plane.hourCost * flyHours(plane, route)); }
function landingFees(route){ return homeData().fee + (route.landingFeeAway || 0); }
function runCostOf(plane, route){ return (route && plane.hourCost ? flyCost(plane, route) : plane.runCost) + (route ? landingFees(route) : homeData().fee); }
/* What "Flights" is made of, for the cost sheet's "What's in this?". */
function flightParts(sched){
  const p = ourPlane(), c = serviceCounts(sched), h = homeData();
  return Object.keys(c).map(id => { const r = routeById(id), n = c[id];
    return [`${r.city} ×${n}: ${fmtDur(2 * legMinutes(p, r))} flying at ${money(p.hourCost)} an hour, landing ${money(h.fee)} at ${h.code} + ${money(r.landingFeeAway || 0)} at ${r.city}`, money(n * runCostOf(p, r))]; });
}

/* ---------- crew: a second crew when the duty day is over the limit ---------- */
function dutyMin(plane, sched){ const D = TIME.day(plane, sched); if(!D.trips.length) return 0; const pad = WORLD.crewPadMin || 0; return (D.end + pad) - (D.trips[0].dep - pad); }
function crewNeeded(sched){ const f = S.fleet[0]; if(!f) return 1; const s = sched || schedOf(f); if(!s.length) return 1; return dutyMin(planeById(f.planeId), s) > (WORLD.crewDutyMin || 720) ? 2 : 1; }
function dayExtras(fl){
  const flown = fl.filter(f => !f.grounded && !f.noFuel), ob = onboardOf(), by = {};
  let term = 0, obRev = 0, obCost = 0, buyers = 0;
  flown.forEach(f => { const x = by[f.route] || (by[f.route] = { pax:0 }); x.pax += f.sold; term += f.termCost || 0; });
  Object.keys(by).forEach(id => { const x = by[id]; x.buyers = ob.share ? Math.floor(x.pax * ob.share) : 0; x.obRev = x.buyers * (ob.price || 0); x.obCost = ob.free ? x.pax * ob.costPax : x.buyers * (ob.costItem || 0); obRev += x.obRev; obCost += x.obCost; buyers += x.buyers; });
  const crews = flown.length ? crewNeeded() : 1;
  // each aircraft that flies a long day pays for its own second crew
  const long = S.fleet.filter(f => flown.some(x => x.uid === f.uid) && dutyMin(planeById(f.planeId), schedOf(f)) > (WORLD.crewDutyMin || 720)).length;
  return { term, obRev, obCost, buyers, crews, crew: long * (WORLD.crewCost || 250), byRoute: by, free: !!ob.free };
}

/* ---------- demand: the route's table at the fare ---------- */
function tableAt(route, fare){
  const T = route.demandAtFare, f = String(fare); if(T[f] !== undefined) return T[f];
  const k = Object.keys(T).map(Number).sort((a, b) => a - b);   // a fare between two in the table: in proportion; beyond it, the nearest step carries on
  let i = k.findIndex(x => x > fare); if(i <= 0) i = i === 0 ? 1 : k.length - 1;
  const a = k[i - 1], b = k[i], v = T[a] + (T[b] - T[a]) * (fare - a) / (b - a);
  return Math.max(0, v);
}
/* Heathrow is the reference (the tables were tested there); other homes scale by their demand modifier. */
function homeScale(){ const ref = WB && WB.airports.find(a => a.code === 'LHR'), r = ref ? 1 + (ref.demandModifier || 0) : 1; return (1 + (homeData().demandPct || 0) / 100) / r; }
/* Word spreads: growthPerWeek % more people each week from Week 3 (Weeks 1 and 2 stay flat), up to the ceiling.
   The same all through a week or a month, so a projection made at its start still holds. */
function growthOf(route, n){ const a = route.arch; if(!a || !a.growthPerWeek) return 1; const wk = Math.max(0, weekNo(beatDay(n)) - 2); return Math.min(a.growthCeiling || Infinity, 1 + a.growthPerWeek / 100 * wk); }
function seasonOf(day){ const m = calDate(day).getUTCMonth(); return m >= 2 && m <= 4 ? 'spring' : m <= 7 && m >= 5 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter'; }
function seasonMult(route, n){ const a = route.arch; return a && a.season ? (a.season[seasonOf(beatDay(n))] || 1) : 1; }
function demandAt(route, price, n){
  const n0 = n === undefined ? S.round : n, w = roundData(n0), dm = w.demandMod || {};
  const mod = (dm[route.id] || 0) + (dm.focus && S.rnd && route.id === S.rnd.focusRoute ? dm.focus : 0);
  if(!route.wb){ const grow = n0 >= 2 && route.growth ? Math.min(route.cap || Infinity, route.growth * (n0 - 1)) : 0;
    const base = Math.floor((route.baseDemand + grow + mod) * (1 + homeData().demandPct / 100)); return Math.max(0, Math.floor(base - route.drop * (price - route.basePrice) / route.step)); }
  return Math.max(0, roundSchool((tableAt(route, price) * growthOf(route, n0) * seasonMult(route, n0) + mod) * homeScale()));
}
/* People who will actually fly with us at this fare: if the rival is cheaper, the route's competition share goes to them. */
function paxFor(route, fare){ let pax = roundSchool(demandAt(route, fare) * repFactor()); const c = competitorPrice(route); if(c !== undefined && c < fare) pax = roundSchool(pax * (1 - (route.competition !== undefined ? route.competition : 0.2))); return pax; }
function demandRule(r){
  if(!r.wb) return [`At ${money(r.basePrice)}, ${demandAt(r, r.basePrice)} people want to fly.`, `Each ${money(r.step)} more, ${r.drop} fewer people want to fly.`, `Each ${money(r.step)} less, ${r.drop} more.`];
  return [`At ${money(r.basePrice)}, ${demandAt(r, r.basePrice)} people want to fly.`, 'The higher the fare, the fewer people want to fly.'];
}

/* ---------- five bands through the day ---------- */
const BANDS = WBR ? Object.keys(WBR.bands) : ['early', 'midmorning', 'midday', 'afternoon', 'evening'];
const BAND_SHORT = { early:'Early', midmorning:'Mid-morning', midday:'Midday', afternoon:'Afternoon', evening:'Evening' };
Object.keys(BAND_NAMES).forEach(k => delete BAND_NAMES[k]);
Object.assign(BAND_NAMES, { early:'Early morning', midmorning:'Mid-morning', midday:'Middle of the day', afternoon:'Afternoon', evening:'Evening' });
function bandHours(b){ return WBR ? WBR.bands[b] : { early:[6, 9], midmorning:[9, 12], midday:[12, 15], afternoon:[15, 18], evening:[18, 22] }[b]; }
function bandOf(m){ for(const b of BANDS){ if(m < bandHours(b)[1] * 60) return b; } return BANDS[BANDS.length - 1]; }
function bandSpan(b){ const [a, z] = bandHours(b); return `${pad(a)}:00–${pad(z)}:00`; }
function archOf(route){ return route.arch || { timeSensitiveShare:0.5, bands:{ early:0.3, midmorning:0.15, midday:0.1, afternoon:0.15, evening:0.3 } }; }
/* The day's passengers at this fare: those who must fly in each band, and the flexible ones who will take any service. */
function demandPools(route, fare){
  const W = paxWant(route, fare), out = { W };
  if(!timeDemandOn()){ BANDS.forEach(b => { out[b] = 0; }); out.flex = W; return out; }
  const a = archOf(route); let locked = 0;
  BANDS.forEach(b => { out[b] = roundSchool(W * a.timeSensitiveShare * (a.bands[b] || 0)); locked += out[b]; });
  out.flex = Math.max(0, W - locked); return out;
}
function planFlights(){
  const out = [], pools = {}, fifo = fifoCursor(S.rnd && S.rnd.fuelOrder), paid = fuelPaid(), list = [];
  const pool = (route, price) => { if(!pools[route.id]){ const comp = competitorPrice(route); pools[route.id] = Object.assign(demandPools(route, price), { demand: demandAt(route, price), comp, cut: comp !== undefined && comp < price }); } return pools[route.id]; };
  S.fleet.forEach((f, i) => { const sched = schedOf(f); if(!sched.length) return; const plane = planeById(f.planeId), D = TIME.day(plane, sched); D.trips.forEach((tr, k) => list.push({ f, i, k, tr, plane })); });
  list.sort((a, b) => a.tr.dep - b.tr.dep || a.i - b.i);
  // 1. each service takes the people who must fly in its band
  const rows = list.map(({ f, i, k, tr, plane }) => {
    const route = routeById(tr.route), price = fareOf(tr.route);
    const base = { key:f.uid+'-'+k, uid:f.uid, trip:k, planeId:f.planeId, route:tr.route, code:flightCode(i, k), price, seats:seatsOf(f), layout:f.layout, dep:tr.dep, arr:tr.arr, segments:tr.segments, fuelL:fuelForTrip(plane, route), runCost:runCostOf(plane, route), reasons:[] };
    if(f.grounded) return Object.assign(base, { demand:0, sold:0, revenue:0, grounded:true, fuelL:0, runCost:0, fuelCost:0, reasons:['Grounded today, waiting for a spare part.'] });
    const d = pool(route, price), band = bandOf(tr.dep), a = Math.min(base.seats, d[band] || 0); d[band] -= a;
    return Object.assign(base, { band, locked:a, flexible:0, _d:d });
  });
  // 2. the flexible passengers spread across the route's services while seats remain
  const byRoute = {}; rows.forEach(x => { if(!x.grounded) (byRoute[x.route] = byRoute[x.route] || []).push(x); });
  Object.values(byRoute).forEach(xs => { const d = xs[0]._d; let left = d.flex;
    while(left > 0){ const open = xs.filter(x => x.locked + x.flexible < x.seats); if(!open.length) break; for(const x of open){ if(left <= 0) break; x.flexible++; left--; } }
    d.flex = left; });
  rows.forEach(x => {
    if(x.grounded){ out.push(x); return; }
    const d = x._d, sold = x.locked + x.flexible, route = routeById(x.route), reasons = []; delete x._d;
    if(d.cut) reasons.push(`${WORLD.rival} was cheaper (£${num(d.comp)}), so some passengers went to them.`);
    if(sold < x.seats){
      if(timeDemandOn()) reasons.push(`${x.locked} ${x.locked === 1 ? 'person' : 'people'} wanted to fly in the ${BAND_NAMES[x.band].toLowerCase()} (${bandSpan(x.band)}) and ${x.flexible} more could fly at any time.`);
      else if((byRoute[x.route] || []).length > 1) reasons.push(`Today's ${route.city} passengers were shared between your services.`);
    }
    out.push(Object.assign(x, { demand:d.demand, sold, revenue: sold * x.price, termCost: sold * termCharge(), compCut:d.cut, reasons, fuelCost: !paid ? 0 : fuelContract() ? r2(x.fuelL * fuelPrice()) : fifo.take(x.fuelL) }));
  });
  return out;
}
/* Who wants to fly when: the band shares for the route, drawn to scale across the operating day. */
function demandStrip(id){
  const r = routeById(id), a = archOf(r), s0 = dayStart(), e0 = dayEnd(), span = e0 - s0, X = m => (100 * (m - s0) / span).toFixed(2);
  const bands = BANDS.map(b => { const [h0, h1] = bandHours(b); return [b, Math.max(s0, h0 * 60), Math.min(e0, h1 * 60)]; });
  const dens = bands.map(([b, s, e]) => (a.bands[b] || 0) / Math.max(1, (e - s) / 60)), mx = Math.max(...dens);
  return `<div class="dstrip"><span class="ds-l">${flagSvg(r.flag, 14)} ${esc(r.city)}: who wants to fly when</span><div class="ds-bar">${bands.map(([b, s, e], k) => `<i class="ds-b ${b}" style="left:${X(s)}%;width:${(100 * (e - s) / span).toFixed(2)}%;--h:${Math.max(8, Math.round(100 * dens[k] / mx))}%" title="${esc(BAND_NAMES[b])} ${bandSpan(b)}"><span>${BAND_SHORT[b]}</span></i>`).join('')}</div></div>`;
}

/* ---------- fares are the workbook's, whatever the home airport ---------- */
function syncRoutesToHome(){
  if(S && S.steps){ const fi = S.steps.findIndex(x => x.t === 'fareTry'); if(fi >= 0 && S.si !== fi){ S.steps.splice(fi, 1); if(S.si > fi) S.si--; if(S.rnd && S.rnd.returnTo > fi) S.rnd.returnTo--; } }
  if(S && S.steps && !S.steps.some(x => x.t === 'ready')){ const i = S.steps.findIndex(x => x.t === 'fuelPlan'); if(i >= 0 && S.si <= i) S.steps.splice(i + 1, 0, { t:'ready' }); }
  if(!S || !S.home) return;
  WORLD.setupRoutes.map(routeById).forEach(r => {
    if(!r.wb && S.home !== syncRoutesToHome.home){ const b = normalFare(r); r.basePrice = b; r.fares = [b - 10, b, b + 10, b + 20, b + 30]; r.prices = r.fares.slice(); r.setupPrices = r.fares.slice(); }
    if(S.prices && S.prices[r.id] !== undefined && !r.fares.includes(S.prices[r.id])) S.prices[r.id] = r.basePrice;   // a fare from an older save
  });
  syncRoutesToHome.home = S.home;
}

/* The time checks in the teacher panel, on the workbook's distances (Paris 300 km: an hour each way in a Twin Otter). */
function timeSelfTest(){
  const p = planeById('dhc6'), par = routeById('par'), mad = routeById('mad'), out = [], at9 = toMin('09:00');
  const t = (name, got, want) => out.push({ name, got, want, ok: got === want });
  const leg = legMinutes(p, par), rt = 2 * leg + TIME.away(p, par), home = TIME.home(p);
  t('Twin Otter to Paris, one way', fmtDur(TIME.leg(p, par)), fmtDur(Math.round(par.km / p.speed * 60)));
  t('One round trip to Paris', fmtDur(TIME.roundTrip(p, par)), fmtDur(rt));
  t('Depart 09:00, one Paris round trip: back at', fmtTime(TIME.day(p, ['par'], at9, null).end), fmtTime(at9 + rt));
  const two = TIME.day(p, ['par', 'par'], at9, null);
  t('Two Paris round trips: second departure', fmtTime(two.trips[1].dep), fmtTime(at9 + rt + home));
  t('Two Paris round trips: final return', fmtTime(two.end), fmtTime(at9 + 2 * rt + home));
  t('Two Paris round trips: total elapsed', fmtDur(two.elapsed), fmtDur(2 * rt + home));
  t('Madrid one way', fmtDur(TIME.leg(p, mad)), '4 h');
  t('Madrid round trip', fmtDur(TIME.roundTrip(p, mad)), '8 h 45');
  return out;
}

/* For the tests: the game's model and the world engine side by side (tests/engine.test.js). */
window.__world = { WB, WE, planOutcome, beatDay, buyPlane, planeById, fuelPrice, toMin, getS: () => S };

/* For the reviews: how much more demand there was by the end of a run than when the projection's figures were made. */
function growthReason(T, fromDay){
  const d0 = fromDay !== undefined ? fromDay : T.from, b0 = beatAt(d0), b1 = beatAt(T.to);
  const xs = ownedRoutes().map(routeById).filter(r => r && r.wb).map(r => ({ r, up: Math.round((growthOf(r, b1) / growthOf(r, b0) - 1) * 100) })).filter(x => x.up >= 3);
  if(!xs.length) return null;
  return `More people wanted to fly as word spread: ${xs.map(x => `${x.r.city} ${x.up}% more`).join(', ')} by ${monthName(T.to)} than in ${monthName(d0)}.`;
}
