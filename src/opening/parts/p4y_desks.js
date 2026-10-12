/* ==================================================================
   THE DESKS (Design Note "The desks" v2, Workbook v4.6 D56–D60, Bertie's three reference screens, 12 Oct 2026)
   Part 1: the fuel model. Week 1 buys exactly what each day burns at that day's price (free on days 1–2). From day 8
   the airline has a tank (8,000 L, 20,000 L from day 29): fuel is bought on the Fuel desk in 1,000 L blocks, stored in
   layers and used oldest first; if the tank runs dry the shortfall is bought at that day's price + 10p. Projections value
   fuel at the week's price; the difference made by buying ahead is the "fuel purchasing advantage", never profit.
   Route news (D56) multiplies demand on named routes between two dates. Day-at-a-time play keeps the old fuel rules.
   ================================================================== */
const fuelDay = () => (typeof dayFor === 'function' && S ? dayFor(S.round || 0) : (S && S.day) || 1);
const deskFrom = () => WORLD.deskFromDay || 8;
function deskModeAt(day){ return weekMode() && day >= deskFrom(); }
function deskMode(){ return !!S && deskModeAt(fuelDay()); }
/* week 1: no tank, fuel bought as it is used; from day 8 the tank */
function fuelContract(){ if(!weekMode()) return fuelContractBase(); return !!S && fuelDay() < deskFrom(); }
function fuelAtWeekPrice(){ return weekMode() && deskMode(); }
function tankCapacity(){ if(!weekMode()) return tankCapacityBase(); return fuelDay() >= (WORLD.tankUpgradeDay || 29) ? (WORLD.tankUpgraded || 20000) : (WORLD.tankBaseDesk || 8000); }
function fuelBlock(){ return WORLD.fuelBlock || 1000; }
/* the tank is kept from week to week (and month to month): nothing goes back to the supplier */
function returnTankFuel(){ if(weekMode()) return; returnTankFuelBase(); }
/* nothing is ordered for the planner in the desk game: fuel is bought on the Fuel desk (or as it is used in week 1) */
function autoFuelOrder(){ if(weekMode()){ if(S.rnd) S.rnd.fuelOrder = null; return null; } return null; }
function weekTopUp(need){ if(weekMode()) return 0; return weekTopUpBase(need); }

/* the week's fuel record: litres burned, what they cost from the tank, what they would have cost at each day's price, emergency fuel */
function fuelWeek(day){ const w = weekNo(day), F = S.fuelWeeks || (S.fuelWeeks = {}); return F[w] || (F[w] = { week:w, burnL:0, paid:0, market:0, emL:0, emCost:0, bought:[] }); }
function emergencyFuel(short, day){
  const L = Math.ceil(short - 1e-9), ppl = r2(fuelOn(day) + (WORLD.fuelTopUp !== undefined ? WORLD.fuelTopUp : 0.1)), bill = r2(L * ppl);
  fuelLots().push({ L, p:ppl }); S.fuel = r2(S.fuel + L); S.fuelValue = r2(S.fuelValue + bill); S.cash = r2(S.cash - bill);
  return { L, ppl, bill };
}
/* burn one service's fuel on a day: returns its cost (the price paid for those litres) */
function burnFuel(L, day, out){
  day = day || fuelDay(); const px = fuelOn(day), wk = fuelWeek(day);
  if(!L) return 0;
  if(!deskModeAt(day)){ const c = r2(L * px); S.cash = r2(S.cash - c); wk.burnL += L; wk.paid = r2(wk.paid + c); wk.market = r2(wk.market + c); return c; }
  if(S.fuel + 1e-9 < L){ const e = emergencyFuel(L - S.fuel, day); wk.emL += e.L; wk.emCost = r2(wk.emCost + e.bill); if(out){ out.autoL = (out.autoL || 0) + e.L; out.autoCost = r2((out.autoCost || 0) + e.bill); }
    if(S.rnd && S.rnd.why && !out) S.rnd.why.push({ ic:'⛽', text:`The tank ran dry: ${num(e.L)} L bought at ${priceL(e.ppl)} a litre (the day's price + ${Math.round((WORLD.fuelTopUp || 0.1) * 100)}p) = ${money(e.bill)}.` }); }
  const v = consumeFuel(L); wk.burnL += L; wk.paid = r2(wk.paid + v); wk.market = r2(wk.market + L * px); return v;
}
/* the fuel purchasing advantage of a week (D60 wording): what its fuel would have cost at each day's price − what it cost from the tank */
function fuelAdvantage(week){ const w = (S.fuelWeeks || {})[week]; return w ? Math.round(w.market - w.paid) : 0; }
function fuelAdvantageLine(week){
  const w = (S.fuelWeeks || {})[week]; if(!w || !w.burnL || !deskModeAt((week - 1) * 7 + 1)) return '';
  const a = fuelAdvantage(week), em = w.emL ? ` ${num(w.emL)} L had to be bought when the tank ran dry, at the day's price + ${Math.round((WORLD.fuelTopUp || 0.1) * 100)}p (${money(w.emCost)}).` : '';
  return `<div class="fuel-adv ${a > 0 ? 'good' : a < 0 ? 'bad' : ''}"><span class="kl">Fuel purchasing advantage</span><b class="mono">${a > 0 ? '+' : a < 0 ? '−' : ''}${money(Math.abs(a))}</b><span>${a > 0 ? 'saved compared with buying the fuel on the day it was used' : a < 0 ? 'more than buying the fuel on the day it was used' : 'the same as buying the fuel on the day it was used'}.${em}</span></div>`;
}

/* ---------- the days flown in week mode ---------- */
function startFlight(){
  if(!weekMode()) return startFlightBase();
  S.rnd.flights = planFlights(); const paid = fuelPaid();
  S.rnd.flights.slice().sort((a, b) => a.dep - b.dep).forEach(f => {
    if(f.grounded) return;
    f.fuelCost = paid ? burnFuel(f.fuelL, S.day) : 0; S.rnd.status[f.key] = 'BOARDING';
  });
  const fl = S.rnd.flights.filter(f => !f.grounded), first = fl.length ? Math.min(...fl.map(f => f.dep)) : firstDep(), last = S.rnd.flights.reduce((m, f) => Math.max(m, f.arr || 0), first + 60);
  S.rnd.anim = { start: Date.now(), dur: settings.flightSecs * 2500, from: first - 30, to: last + 30 };
  liveStartDay();
}
function runDayQuick(){
  if(!weekMode()) return runDayQuickBase();
  refreshPlan(); const fl = S.rnd.flights = planFlights(), paid = fuelPaid();
  fl.slice().sort((a, b) => a.dep - b.dep).forEach(f => {
    if(f.grounded || f.cancelled) return;
    f.fuelCost = paid ? burnFuel(f.fuelL, S.day) : 0; S.rnd.status[f.key] = 'LANDED';
  });
  S.rnd.forecast = null; S.rnd.myForecast = S.wk && S.wk.forecastDay ? S.wk.forecastDay : S.rnd.myForecast;
  applyResults();
  S.wk.rows.push(dayRowOf(lastDay(), S.rnd)); S.wk.dayDone = S.day;
}
/* the storage upgrade (day 29): announced once */
function tankUpgradeNotice(){
  if(!weekMode() || !S || S.tankUpgraded || (S.day || 0) < (WORLD.tankUpgradeDay || 29)) return;
  S.tankUpgraded = true; addNews([{ tag:'FUEL', text:`Storage upgrade: your fuel tank now holds ${num(WORLD.tankUpgraded || 20000)} L.`, cls:'good' }]);
  if(typeof sysNotice === 'function') sysNotice('Storage upgrade', `Fuel tank: ${num(WORLD.tankUpgraded || 20000)} L`);
}

/* ---------- route news (D56): demand × the multiplier on the listed routes between two dates, by segment ---------- */
function isoOf(day){ const d = calDate(day); return d.toISOString().slice(0, 10); }
function newsOn(routeId, day){ const iso = isoOf(day); return (WORLD.routeNews || []).filter(n => n.routes.includes(routeId) && n.start <= iso && iso <= n.end); }
function demandMult(route, day){
  const n = newsOn(route.id, day); if(!n.length) return demandMult0(route, day);
  let fb = 1, fl = 1; n.forEach(x => { if(x.segment === 'business') fb *= x.mult; else if(x.segment === 'leisure') fl *= x.mult; else { fb *= x.mult; fl *= x.mult; } });
  const a = route.arch; if(!a) return fb;   // no archetype: no segments, the multiplier applies to everyone
  const ST = WORLD.settings || {}, wd = calDate(day).getUTCDay(), m = marketWeekOf(day) || {}, M = S && S.rnd && S.rnd.weekMods, bs = a.businessShare !== undefined && a.businessShare !== null ? a.businessShare : 0.5;
  let biz = (M && M.biz) || m.businessMult || 1, lei = (M && M.lei) || m.leisureMult || 1;
  if(wd === 6){ biz *= ST.weekendBusinessMultSat || 0.7; lei *= ST.weekendLeisureMult || 1.2; }
  if(wd === 0){ biz *= ST.weekendBusinessMultSun || 0.6; lei *= ST.weekendLeisureMult || 1.2; }
  const ms = m.seasonMult && m.seasonMult[route.id] !== undefined && m.seasonMult[route.id] !== null ? m.seasonMult[route.id] : null;
  const season = ms !== null ? ms : (a.season ? (a.season[seasonOf(day)] || 1) : 1);
  return (bs * biz * fb + (1 - bs) * lei * fl) * season;
}
/* the news a review should name: surprises (not announced) that touched the week's routes */
function surprisesIn(from, to){ const a = isoOf(from), b = isoOf(to); return (WORLD.routeNews || []).filter(n => !n.announced && n.start <= b && n.end >= a); }
function announcedFor(day){ const iso = isoOf(day), wkEnd = isoOf(day + 13); return (WORLD.routeNews || []).filter(n => n.announced && n.announce <= iso && n.end >= iso && n.start <= wkEnd); }

function startBeat(b){ startBeatBase(b); tankUpgradeNotice(); }

/* ==================================================================
   Part 2: the aircraft performance card ("Service Cost Breakdown") and the per-service fuel sign-off (Desks v2 §3, §7).
   The fuel line is signed off by hand the first time a plane type flies a route, and again when the price it is valued
   at has moved 50p or more (one card a day when several qualify; the model fills the rest). The day's fuel bill and the
   1,000 × £1.30 worked example are gone: the card's methods (WorkingMethods: partition the price, scale from 100 L, make
   it pence, count the decimal places, formal multiplication) teach it.
   ================================================================== */
const cardKey = (planeId, route) => planeId + '|' + route;
/* a card's table asks for the fuel line only (the litres and the price are given) */
function rowTyped(t, row){ if(t && t.card) return row.id === 'fuel'; return rowTypedBase(t, row); }
function cardPrice(){ return S.phase === 'setup' || !fuelPaid() ? weekFuelPrice(S.day || 1) : fuelPrice(); }
function fuelCardsDue(pl){
  if(!weekMode() || !S || (S.tools && S.tools.fuelCost === 'model')) return [];
  pl = normPlan(pl); const signed = S.fuelSigned || {}, step = WBS().fuelHandSumPriceStep || 0.5, price = cardPrice(), seen = {}, first = [], moved = [];
  pl.fleet.forEach(x => x.sched.forEach((rid, k) => { const key = cardKey(x.planeId, rid); if(seen[key]){ seen[key].n++; return; }
    const c = seen[key] = { uid:x.uid, k, planeId:x.planeId, route:rid, key, n:1, price };
    if(signed[key] === undefined) first.push(c); else if(Math.abs(price - signed[key]) >= step - 1e-9) moved.push(Object.assign(c, { was:signed[key] })); }));
  const litres = c => c.n * fuelForTrip(planeById(c.planeId), routeById(c.route));
  moved.sort((a, b) => litres(b) - litres(a));
  return first.concat(moved.slice(0, 1));
}
function decideHandSums(L, pl){
  const out = decideHandSumsPlanner(L, pl); if(!weekMode()) return out;
  if(S.phase !== 'setup' && !fuelPaid()){ delete out.fuelCost; S.rnd.fuelCards = []; return out; }
  delete out.fuelCost; S.rnd.fuelCards = fuelCardsDue(pl || currentPlan()); return out;
}
/* a plan of just one service (the other aircraft stay on the ground), so the model's figures are that service's */
function servicePlan(pl, uid, k){
  pl = normPlan(JSON.parse(JSON.stringify(pl))); const x = pl.fleet.find(z => z.uid === uid) || pl.fleet[0], j = pl.fleet.indexOf(x), deps = x.deps && x.deps.length === x.sched.length ? x.deps : actualDeps(pl, j);
  return Object.assign({}, pl, { onboard:'none', fleet:pl.fleet.map(z => z === x ? { uid:z.uid, planeId:z.planeId, sched:[z.sched[k]], deps:[deps[k]] } : { uid:z.uid, planeId:z.planeId, sched:[], deps:null }) });
}
const shortPlane = p => p.name.replace(/^DHC-6 /, '').replace(/^Embraer /, 'E-').replace(/^Airbus /, '').replace(/^Boeing /, '');
function cardStage(c, pl){ const p = planeById(c.planeId), r = routeById(c.route);
  return { id:'fc|' + c.key, card:c, opts:[{ id:'a', label:`${shortPlane(p)} · ${homeData().code}–${tlCode(r)}`, sub:`one service · fuel at ${priceL(c.price)}`, plan:servicePlan(pl, c.uid, c.k), pick:null, word:'' }], rowIds:['fuelL', 'ppl', 'fuel'], fuelAt:c.price }; }
/* Launch Day: the cards go after the tickets, before the profit */
function wkStagesLaunch(pl){
  const st = wkStagesLaunchPlanner(pl); if(!weekMode()) return st;
  if(S.phase === 'setup' && !S.rnd.handSums && step().t === 'workings') S.rnd.handSums = decideHandSums(planLines(pl), pl);   // the other routes' tickets are typed straight after the fare, not after the profit decides the day's sums
  S.rnd.fuelCards = fuelCardsDue(pl); const cards = S.rnd.fuelCards.map(c => cardStage(c, pl)), at = st.findIndex(x => x.id === 'profit');
  st.splice(at < 0 ? st.length : at, 0, ...cards); return st;
}
/* Mondays: the cards are tables of their own after the day's sheet (first when ƒ on Fuel cost asked for them) */
function workTables(pl){
  const W = workTablesPlanner(pl); if(!weekMode()) return W;
  if(S.phase === 'setup') return W;
  const cards = (S.rnd.fuelCards || []).map(c => { const st = cardStage(c, pl), { t } = stageTable(st, W.L0); t.card = c; return t; });
  if(cards.length){ W.tables = S.rnd.cardFirst ? cards.concat(W.tables) : W.tables.concat(cards); W.total = (W.total || 0) + (W.total ? cards.length : 0); }
  return W;
}
function openSum(kind){
  if(weekMode() && kind === 'fuelCost'){ const c = (S.rnd.fuelCards || [])[0]; if(c){ if(S.phase === 'setup') S.rnd.stageWanted = 'fc|' + c.key; else S.rnd.cardFirst = true; } }
  return openSumPlanner(kind);
}
/* the record: which cards were signed, at what price; the log names each card */
function recordHandSums(L){
  recordHandSumsPlanner(L);
  if(!weekMode()) return; const cards = S.rnd.fuelCards || []; if(!cards.length) return;
  const sg = S.fuelSigned || (S.fuelSigned = {}); cards.forEach(c => { sg[c.key] = c.price; });
  const sk = skills(), x = sk.fuelCost || (sk.fuelCost = { first:S.day, count:0, routes:[], planes:[] }); x.count += cards.length; x.lastDay = S.day; x.last = { price:cards[0].price, litres:plannedLitres(currentPlan()) };
  const log = S.handSumLog || (S.handSumLog = []), e = log.find(z => z.day === S.day) || (log.push({ day:S.day, date:dateShort(S.day), tools:[] }), log[log.length - 1]);
  cards.forEach(c => e.tools.push(`Fuel cost: ${shortPlane(planeById(c.planeId))} ${routeById(c.route).city} (Calculate)`));
  delete S.rnd.cardFirst;
}

/* ---------- the card's figures for one service ---------- */
function serviceFigures(uid, k, pl){
  pl = normPlan(pl || currentPlan()); const x = pl.fleet.find(z => z.uid === uid) || pl.fleet[0], kk = Math.min(k || 0, Math.max(0, x.sched.length - 1)), rid = x.sched[kk];
  if(!rid) return null;
  const p = planeById(x.planeId), r = routeById(rid), f = S.fleet.find(z => z.uid === x.uid) || {}, price = cardPrice(), L = fuelForTrip(p, r), P = Math.round(price * 100);
  const fl = withPlan(pl, () => planFlights()).find(z => z.uid === x.uid && z.trip === kk) || {}, sold = fl.sold || 0, fare = pl.prices[rid] || r.basePrice, ob = ONBOARD[pl.onboard || 'none'] || {};
  const buyers = ob.price ? Math.round(sold * (ob.share || 0)) : 0, onboard = buyers * (ob.price || 0), stock = ob.price ? buyers * (ob.costItem || 0) : ob.free ? sold * (ob.costPax || 0) : 0;
  const fuel = L * P / 100, airport = landingFees(r), paxCh = sold * termCharge(), flying = flyCost(p, r), cost = fuel + airport + paxCh + flying + stock, rev = sold * fare + onboard;
  return { uid:x.uid, k:kk, p, r, f, price, P, L, sold, seats:fl.seats || p.seats, fare, dep:fl.dep, arr:fl.arr, buyers, onboard, stock, ob, fuel, airport, paxCh, flying, cost, rev, profit:rev - cost, flyMin:2 * TIME.leg(p, r), km:routeKm(r), homeFee:homeData().fee, awayFee:r.landingFeeAway || 0, dayCost:f.planeId ? dayCostOf(f) : p.dayCost };
}
const pounds = v => money(Math.round(v * 100) / 100).replace(/\.(\d)$/, '.$10');
const twoDp = v => '£' + (Math.round(v * 100) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/* ---------- the methods (WorkingMethods: litres × price per litre) ---------- */
const SC_METHODS = [['part', 'Partition price'], ['scale', 'Scale it'], ['pence', 'Make it pence'], ['dp', 'Decimals'], ['formal', 'Formal ×']];
function scMethodsOffered(){ const wm = (WORLD.workingMethods || []).find(m => /litres/.test(m.relationship)); if(!wm) return SC_METHODS;
  const has = k => wm.methods.some(m => ({ part:/partition/, scale:/scale/, pence:/pence/, dp:/decimal/, formal:/formal/ })[k].test(m)); return SC_METHODS.filter(([k]) => has(k)); }
/* the rows of a method: each { lab, want (pence), unit:'£'|'p'|'n', cls } and the result row */
function scRows(m, F){
  const L = F.L, P = F.P, a = Math.floor(P / 100), t = Math.floor((P % 100) / 10) * 10, u = P % 10, total = L * P;
  if(m === 'part') return { note:`Break ${priceL(F.price)} into ${[a ? `£${a}` : '', t ? `${t}p` : '', u ? `${u}p` : ''].filter(Boolean).join(' + ')}.`, parts:[a ? ['£' + a, 'c1'] : null, t ? [t + 'p', 'c2'] : null, u ? [u + 'p', 'c3'] : null].filter(Boolean),
    rows:[a ? { lab:`${num(L)} × £${a}.00`, want:L * a * 100, unit:'£', cls:'c1' } : null, t ? { lab:`${num(L)} × £0.${pad(t)}`, want:L * t, unit:'£', cls:'c2' } : null, u ? { lab:`${num(L)} × £0.0${u}`, want:L * u, unit:'£', cls:'c3' } : null].filter(Boolean), total };
  if(m === 'scale'){ const h = Math.floor(L / 100), rem = L % 100, rows = [{ lab:`100 L costs`, want:100 * P, unit:'£', cls:'c1' }];
    if(h > 1) rows.push({ lab:`${num(h * 100)} L costs`, want:h * 100 * P, unit:'£', cls:'c1' });
    if(rem) rows.push({ lab:`${num(rem)} L costs`, want:rem * P, unit:'£', cls:'c2', hint: 100 % rem === 0 ? `${rem} L is 1⁄${100 / rem} of 100 L` : '' });
    return { note:h ? `${num(L)} L = ${h > 1 ? num(h * 100) + ' L' : '100 L'}${rem ? ` + ${num(rem)} L` : ''}. Find the cost of 100 L first.` : `${num(L)} L is less than 100 L: find 100 L first, then the part you need.`, rows, total }; }
  if(m === 'pence') return { note:`${priceL(F.price)} = ${P}p. Multiply in pence, then change pence to pounds.`, rows:[{ lab:`${num(L)} × ${P}p`, want:total, unit:'p', cls:'c1' }], total };
  if(m === 'dp') return { note:`Leave out the decimal point: ${num(L)} × ${P}. ${priceL(F.price)} has 2 decimal places, so the answer has 2.`, rows:[{ lab:`${num(L)} × ${P}`, want:total, unit:'n', cls:'c1' }], total };
  return { note:'Line up the digits in their columns. The answer has pounds and pence.', rows:[], total };
}
function scParse(unit, s){ s = String(s || '').replace(/[£,\s]/g, '').replace(/p$/i, ''); if(s === '') return null; const v = parseFloat(s); if(isNaN(v)) return null; return unit === '£' ? Math.round(v * 100) : Math.round(v); }
function scShow(unit, pence){ return unit === '£' ? twoDp(pence / 100) : unit === 'p' ? num(pence) + 'p' : num(pence); }

/* ---------- the screen ---------- */
UI.sc = UI.sc || { m:'part', vals:{}, q:{}, tries:0 };
function cardStampHtml(kind){ const ini = String((S.airline && (S.airline.code || S.airline.flightCode)) || 'CEO').toUpperCase().slice(0, 3); return kind === 'ok' ? `<span class="stamp ok">CHECKED · ${esc(ini)}</span>` : kind === 'q' ? '<span class="stamp q">QUERY</span>' : ''; }
function svcCardHtml(o){
  const F = o.F, sign = !!o.sign, done = !!o.done, practice = !sign && !!UI.sc.practice, entry = sign && !done || practice, methods = scMethodsOffered(), m = methods.some(x => x[0] === UI.sc.m) ? UI.sc.m : methods[0][0];
  const R = scRows(m, F), city = F.r.city, code = tlCode(F.r), home = homeData(), q = UI.sc.q || {}, vals = UI.sc.vals || {};
  UI.sc.F = F; UI.sc.mUsed = m;
  const box = (key, want, unit) => entry ? `<span class="sc-in ${unit === 'p' ? 'pc' : ''} ${q[key] ? 'qy' : ''}">${unit === '£' ? '<i class="pre">£</i>' : ''}<input data-sc="${key}" data-unit="${unit}" inputmode="decimal" autocomplete="off" value="${esc(vals[key] || '')}" aria-label="${key === 'tot' ? 'Fuel cost' : 'Line ' + (+key.slice(1) + 1)}">${unit === 'p' ? '<i class="suf">p</i>' : ''}</span>` : `<b class="sc-v">${scShow(unit, want)}</b>`;
  const tabs = `<div class="sc-tabs" role="tablist">${methods.map(([k, l]) => `<button role="tab" class="${k === m ? 'on' : ''}" data-scm="${k}" aria-selected="${k === m}">${l}</button>`).join('')}</div>`;
  let frame = '';
  if(m === 'formal' && sign && !done) frame = `<div class="sc-formal">${wkGrid(o.t, o.col, o.row, {})}</div>`;
  else if(m === 'formal') frame = `<div class="sc-step"><span class="sc-sn">Formal ×</span><span>${esc(R.note)}</span></div><div class="sc-eq big"><span>${num(F.L)} × ${F.P}p</span><span>=</span><b>${num(F.L * F.P)}p</b><span>=</span><b>${twoDp(F.fuel)}</b></div>`;
  else {
    const eq = m === 'part' ? `<div class="sc-eq"><span class="sc-blk p0">${priceL(F.price)}</span><span>=</span>${R.parts.map(([t, c], i) => `${i ? '<span>+</span>' : ''}<span class="sc-blk ${c}">${t}</span>`).join('')}</div>` : m === 'pence' ? `<div class="sc-eq"><span class="sc-blk p0">${priceL(F.price)}</span><span>=</span><span class="sc-blk c1">${F.P}p</span></div>` : m === 'dp' ? `<div class="sc-eq"><span class="sc-blk p0">${priceL(F.price)}</span><span>→</span><span class="sc-blk c1">${F.P}</span><span class="sc-x">2 decimal places</span></div>` : `<div class="sc-eq"><span class="sc-blk p0">100 L</span><span>×</span><span class="sc-blk c1">${priceL(F.price)}</span></div>`;
    frame = `<div class="sc-step"><span class="sc-sn">Step 1</span><b>${m === 'part' ? 'Partition the price' : m === 'scale' ? 'Start from 100 litres' : m === 'pence' ? 'Make it pence' : 'Count the decimal places'}</b></div><p class="sc-note">${esc(R.note)}</p>${eq}
      <div class="sc-step"><span class="sc-sn">Step 2</span><b>${m === 'part' ? `Multiply each part by ${num(F.L)} litres` : m === 'scale' ? 'Build up to the litres you need' : m === 'pence' ? 'Multiply in pence' : 'Multiply, then put the point back'}</b></div>
      <div class="sc-rows">${R.rows.map((x, i) => `<div class="sc-row ${x.cls} ${q['r' + i] ? 'qy' : ''}"><span class="sc-l">${x.lab}${x.hint ? `<small>${esc(x.hint)}</small>` : ''}</span><span>=</span>${box('r' + i, x.want, x.unit)}</div>`).join('')}</div>`;
  }
  const checkBtn = entry && !(m === 'formal' && sign) ? `<button class="btn primary sc-chk" id="scCheck">Check ✓</button>` : '';
  const result = m === 'formal' && sign && !done ? '' : `<div class="sc-total ${q.tot ? 'qy' : ''} ${checkBtn ? 'wc' : ''}"><span>Fuel cost <small>(${num(F.L)} L × ${priceL(F.price)})</small></span>${box('tot', F.L * F.P, '£')}${checkBtn}</div>`;
  const stamp = done ? cardStampHtml('ok') : sign && UI.sc.queried ? cardStampHtml('q') : '';
  const check = entry && !(m === 'formal' && sign) ? `<div class="sc-act"><span class="sc-msg ${UI.sc.ok ? 'ok' : ''}" role="status">${esc(UI.sc.msg || '')}</span>${(UI.sc.tries || 0) >= 3 ? '<button class="dk-link" id="scShow">Show me</button>' : ''}</div>` : m === 'formal' && sign && !done ? `<div class="sc-act"><button class="btn primary" id="cellCheck">Check ✓</button><span class="msg wk-msg sc-msg" id="ftMsg" role="status">${esc(UI.msg || '')}</span></div>` : '';
  const p1 = `<section class="dk-pnl sc-p1 ${sign ? 'sign' : ''}"><div class="sc-h"><span class="sc-n">1</span><div><h2>Calculate the fuel cost</h2><p>${sign ? 'Sign this line off: multiply the litres burned by the price per litre. Pick a method.' : 'Multiply the litres burned by the price per litre using different methods.'}</p></div>${stamp}</div>${tabs}<div class="sc-frame">${frame}</div>${result}${check}</section>`;
  const fuelShown = sign && !done ? null : F.fuel, line = (l, v, cls) => `<div class="sc-li ${cls || ''}"><span>${l}</span><b>${v}</b></div>`;
  const p2 = `<section class="dk-pnl sc-p2"><div class="sc-h"><span class="sc-n">2</span><div><h2>Work out the projected profit</h2><p>Subtract the total operating cost from the total revenue for this service.</p></div></div>
    <div class="sc-box"><div class="sc-bh"><span class="sc-sn">Step 1</span><b>Total revenue <small>(this service)</small></b></div>${line(`Ticket revenue (${F.sold} × ${money(F.fare)})`, twoDp(F.sold * F.fare))}${line(`On-board sales${F.buyers ? ` (${F.buyers} × ${money(F.ob.price)})` : ''}`, twoDp(F.onboard))}${line('Total revenue', twoDp(F.rev), 'tot')}</div>
    <div class="sc-box"><div class="sc-bh"><span class="sc-sn">Step 2</span><b>Total operating cost <small>(this service)</small></b></div>${line(`Fuel cost (${num(F.L)} L × ${priceL(F.price)})`, fuelShown === null ? '<i class="sc-wait">sign off panel 1</i>' : twoDp(fuelShown))}${line(`Airport charges (${home.code} + ${code})`, twoDp(F.airport))}${line(`Passenger charges (${F.sold} × ${money(termCharge())})`, twoDp(F.paxCh))}${line(`Flying (${fmtDur(F.flyMin)} × ${money(F.p.hourCost)} an hour)`, twoDp(F.flying))}${F.stock ? line('Snack stock', twoDp(F.stock)) : ''}${line('Total operating cost', fuelShown === null ? '—' : twoDp(F.cost), 'tot')}</div>
    <div class="sc-profit ${F.profit < 0 ? 'neg' : ''}"><span class="sc-sn">Step 3</span><span class="sc-pl">Projected profit<small>${twoDp(F.rev)} − ${fuelShown === null ? '?' : twoDp(F.cost)}</small></span><b>${fuelShown === null ? '—' : twoDp(F.profit)}</b></div></section>`;
  const li = (ic, l, v) => `<div class="sc-sr">${ICO2[ic]}<span>${l}</span><b>${v}</b></div>`;
  const p3 = `<section class="dk-pnl sc-p3"><div class="dk-pnl-h">${ICO2.bars}<div><h2>Service summary</h2><span class="sub">Key figures for this ${home.code}–${code} service.</span></div></div>
    <div class="sc-list">${li('route', 'Route', `${home.code} → ${code} → ${home.code}`)}${li('plane', 'Aircraft', `${esc(shortPlane(F.p))} (${F.seats} seats)`)}${li('clock', 'Flying time', fmtDur(F.flyMin))}${li('fuel', 'Fuel burned', num(F.L) + ' L')}${li('coin', 'Fuel price (per litre)', priceL(F.price))}${li('tower', 'Airport charges', money(F.airport))}${li('people', 'Passengers', `${F.sold} of ${F.seats}`)}</div>
    <div class="sc-out"><h3>Financial outcome <small>(this service)</small></h3>${line('Total revenue', twoDp(F.rev))}${line('Total operating cost', fuelShown === null ? '—' : twoDp(F.cost))}<div class="sc-prow ${F.profit < 0 ? 'neg' : ''}">${ICO2.bars}<span>Projected profit</span><b>${fuelShown === null ? '—' : twoDp(F.profit)}</b></div>
    <p class="sc-day">Not in this service: the aircraft's day (${money(F.dayCost)}), paid once a day whatever it flies.</p></div>
    <button class="btn sc-use" id="scUse" ${sign && !done ? 'disabled' : ''}>${ICO2.bars}<span>Use this figure in your plan</span>${ICO2.chev}</button></section>`;
  const banner = `<div class="sc-banner"><div class="sc-photo">${artCity(F.r.id)}<div class="sc-ov">${flagSvg(F.r.flag, 34)}<div><h2>${esc(city)} rotation – one service</h2><p>${esc(home.name)} (${home.code}) <span>⟶</span> ${esc(city)} (${code}) <span>⟶</span> ${home.code}</p><div class="sc-tags"><span>${ICO2.swap} ${esc(home.country === 'England' ? 'UK' : home.country)} ↔ ${esc(F.r.country || city)}</span><span>${ICO2.plus} One return service · ${fmtTime(F.dep || 0)}</span></div></div></div></div>
    ${[['plane', 'Aircraft', esc(shortPlane(F.p)), `${F.seats} seats`], ['clock', 'Flying time', fmtDur(F.flyMin), 'out and back'], ['fuel', 'Fuel burned', num(F.L) + ' L', '(one service)'], ['coin', 'Fuel price', priceL(F.price), F.price === fuelPrice() || fuelPaid() ? 'per litre' : `per litre from ${dateShort(firstPaidDay())}`], ['tower', 'Airport charges', money(F.airport), `(${home.code} + ${code})`], ['people', 'Flying & passengers', money(F.flying + F.paxCh), `per service`], ['seat', 'Seats', String(F.seats), `${F.sold} sold`]].map(([ic, l, v, s]) => `<div class="sc-stat"><span>${l}</span>${ICO2[ic]}<b>${v}</b><small>${s}</small></div>`).join('')}</div>`;
  return `<div class="sc">${banner}<div class="sc-g">${p1}${p2}${p3}</div></div>`;
}
/* the answers to the card on screen (the tests type them) */
function scAnswers(){ const F = UI.sc.F; if(!F) return null; const R = scRows(UI.sc.mUsed || 'part', F), out = {}; R.rows.forEach((x, i) => { out['r' + i] = x.unit === '£' ? (x.want / 100).toFixed(2) : String(x.want); }); out.tot = (F.L * F.P / 100).toFixed(2); return out; }
function firstPaidDay(){ const from = S.day || 1; for(let d = from; d < from + 7; d++) if(!fuelFreeDay(d)) return d; return from; }
/* the card on screen: o = { uid, k } (model) or { t } (a sign-off) */
function renderSvcCard(o){
  const sign = !!o.t, t = o.t, c = sign ? t.card : null, pl = currentPlan(), F = serviceFigures(sign ? c.uid : o.uid, sign ? c.k : o.k, pl); if(!F){ UI.card = null; render(); return; }
  if(sign){ F.price = c.price; F.P = Math.round(c.price * 100); F.fuel = F.L * F.P / 100; F.cost = F.fuel + F.airport + F.paxCh + F.flying + F.stock; F.profit = F.rev - F.cost; }
  const col = sign ? t.cols[0] : null, row = sign ? tRows(t).find(r => r.id === 'fuel') : null, done = sign && !!t.done[cellId('a', 'fuel')];
  if(sign && !done){ t.active = { col:'a', row:'fuel' }; S.rnd.activeTable = t.id; }
  const homeBtn = sign ? '' : '<button class="btn big" id="scBack">&#9664; Back to plan</button>';
  const bar = deskBar(sign ? (done ? 'Checked. Use this figure in your plan, then the next sum.' : 'Work out this service\'s fuel cost. Choose a method; the model checks your working.') : 'One service\'s costs and profit. The fuel line is the price per litre × the litres burned.',
    sign ? `${backBtn()}<button class="btn primary big" id="scNext" ${done ? '' : 'disabled'}>${done ? 'Use this figure &#9654;' : 'Sign off the fuel line first'}</button>` : homeBtn);
  screen().innerHTML = shell(deskPage({ title:'Service Cost Breakdown', sub:'Work out the cost and profit for a single service. Use the calculation tools to find the fuel cost, the total operating cost and the projected profit.',
    cards:[{ ic:'bulb', t:'Work it out', s:sign ? 'Try different methods to multiply decimals and check your working.' : (UI.sc.practice ? 'Practising: your own working, nothing is recorded.' : 'Try different methods to multiply decimals and check your working.'), id:'scWork' }, { ic:'back', t:'Back to plan', s:'Return to the operating plan when you\'re ready.', id:'scBackCard' }],
    body:svcCardHtml({ F, sign, done, t, col, row }), cls:'sc-page' }), bar);
  bindSvcCard(o, F, sign, t, col, row, done);
}
function bindSvcCard(o, F, sign, t, col, row, done){
  const root = screen(), close = () => { UI.card = null; UI.sc = { m:UI.sc.m, vals:{}, q:{}, tries:0 }; render(); };
  root.querySelectorAll('[data-scm]').forEach(b => b.onclick = () => { UI.sc.m = b.getAttribute('data-scm'); UI.sc.vals = {}; UI.sc.q = {}; UI.sc.msg = ''; UI.sc.queried = false; render(); });
  root.querySelectorAll('[data-sc]').forEach(inp => { inp.oninput = () => { UI.sc.vals[inp.getAttribute('data-sc')] = inp.value; }; inp.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); const b = $('scCheck'); if(b) b.click(); } }; });
  const first = root.querySelector('[data-sc]'); if(first && !done) setTimeout(() => { try{ (root.querySelector('[data-sc]:placeholder-shown') || first).focus(); }catch(e){} }, 40);
  on('scWork', () => { if(sign){ const p = root.querySelector('.sc-p1'); if(p) p.scrollIntoView({ block:'nearest' }); const i = root.querySelector('[data-sc]'); if(i) i.focus(); return; } UI.sc.practice = !UI.sc.practice; UI.sc.vals = {}; UI.sc.q = {}; UI.sc.msg = ''; render(); });
  on('scBackCard', () => { if(sign){ goBack(); return; } close(); }); on('scBack', close);
  on('scUse', () => { if(sign){ if(!done) return; UI.justDone = null; resetEntry(); UI.sc = { m:UI.sc.m, vals:{}, q:{}, tries:0 }; render(); return; } close(); });
  on('scNext', () => { UI.justDone = null; resetEntry(); UI.sc = { m:UI.sc.m, vals:{}, q:{}, tries:0 }; render(); });
  on('scShow', () => { const m = root.querySelector('[data-scm].on'), R = scRows(m ? m.getAttribute('data-scm') : 'part', F); R.rows.forEach((x, i) => { UI.sc.vals['r' + i] = scShow(x.unit, x.want).replace(/^£/, ''); }); UI.sc.vals.tot = (F.L * F.P / 100).toFixed(2); UI.sc.msg = 'Here is the working. Check each line, then press Check.'; render(); });
  on('scCheck', () => {
    const mk = (root.querySelector('[data-scm].on') || {}).getAttribute ? root.querySelector('[data-scm].on').getAttribute('data-scm') : 'part', R = scRows(mk, F), q = {}; let blank = false;
    R.rows.forEach((x, i) => { const v = scParse(x.unit, UI.sc.vals['r' + i]); if(v === null) blank = true; else if(v !== x.want) q['r' + i] = true; });
    const tv = scParse('£', UI.sc.vals.tot); if(tv === null) blank = true; else if(tv !== F.L * F.P) q.tot = true;
    UI.sc.q = q;
    if(blank && !Object.keys(q).length){ UI.sc.msg = 'Fill in every box first.'; UI.sc.ok = false; render(); return; }
    if(Object.keys(q).length){ UI.sc.tries = (UI.sc.tries || 0) + 1; UI.sc.queried = true; UI.sc.ok = false; UI.sc.msg = q.tot && Object.keys(q).length === 1 ? 'Query: the lines are right; check how you added them.' : 'Query: the highlighted line is not right. Look at it again.'; render(); return; }
    UI.sc.ok = true; UI.sc.queried = false; UI.sc.msg = sign ? '' : 'All correct.';
    if(sign){ const res = checkCell(t, col, row, (F.L * F.P / 100).toFixed(2)); if(res === 'ok'){ cellCorrect(t); if(typeof liveChime === 'function' && typeof opsSoundOn === 'function' && opsSoundOn()) liveChime('ding'); } }
    render(); });
  if(sign && !done && UI.sc.m === 'formal'){ bindTable(t); bindWkBoxes(); }
}
/* which table is the card the sums are on now (or just finished) */
function cardInPlay(W){
  if(!W) return null;
  const jd = UI.justDone && W.tables.find(x => x.id === UI.justDone.table && x.card); if(jd) return jd;
  const nx = wkNext(W.tables); return nx && nx.t.card ? nx.t : null;
}
const workingsDesk0 = R.workings, planDesk0 = R.plan;
R.workings = st => { if(weekMode() && dayLike()){ let W = null; try{ W = workTables(currentPlan()); }catch(e){} const t = cardInPlay(W); if(t){ renderSvcCard({ t }); return; } } return workingsDesk0(st); };
R.plan = st => { if(weekMode() && UI.card){ renderSvcCard(UI.card); return; } return planDesk0(st); };
/* the timeline's "Service costs" button and the aircraft label open the card */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-svccard]'); if(!b) return; const [i, j, k] = b.getAttribute('data-svccard').split('|').map(Number), pl = normPlan(currentPlan()), x = pl.fleet[j]; if(!x || i === 9) return; UI.card = { uid:x.uid, k }; UI.sc = { m:UI.sc.m || 'part', vals:{}, q:{}, tries:0 }; render(); });

/* ---------- the day's sums as sign-off documents (Desks v2 §3): each is Awaiting check, Checked or Query ---------- */
function docName(t, r){
  if(t.card){ const rt = routeById(t.card.route); return `Service costs — ${shortPlane(planeById(t.card.planeId))} ${homeData().code}–${tlCode(rt)}`; }
  const st = t.stage || '', rid = r.route || (/^(?:tk|pax|fare)_(.+)$/.exec(r.id) || [])[1];
  if(/^tk_/.test(r.id) || st === 'fare' || /^tk/.test(st)){ const rt = rid && routeById(rid); return 'Sales forecast — ' + (rt ? rt.city : 'tickets'); }
  if(st === 'profit' || r.id === 'profit') return 'Profit statement';
  if(st === 'snack' || r.id === 'snack') return 'Cabin sales';
  return TOOL[r.tool] ? TOOL[r.tool].name : rowLabel(t, r);
}
function docListHtml(cells, activeT){
  const docs = []; cells.forEach(x => { const name = docName(x.t, x.r); let d = docs.find(z => z.name === name); if(!d) docs.push(d = { name, cells:[] }); d.cells.push(x); });
  return `<ul class="doc-list">${docs.map(d => { const done = d.cells.every(x => x.s === 'done'), q = !done && !!activeT && d.cells.some(x => x.t === activeT) && (UI.tries || 0) > 0, pk = S.rnd.picks || {}, last = d.cells.find(x => x.s === 'done' && (x.c.id === pk.fare || x.c.id === pk.snack)) || d.cells.filter(x => x.s === 'done').pop();
    const fig = !last ? 'awaiting your working' : last.t.card ? `${num(last.c.values.fuelL)} L × ${priceL(last.c.values.ppl)} = ${twoDp(last.c.values.fuel)}` : wkSentence(last.t, last.c, last.r);
    return `<li class="${done ? 'ok' : q ? 'q' : 'wait'}">${ICO2.doc}<span class="doc-t"><b>${esc(d.name)}</b><small class="mono">${fig}</small></span>${done ? cardStampHtml('ok') : q ? cardStampHtml('q') : '<span class="doc-aw">Awaiting check</span>'}</li>`; }).join('')}</ul>`;
}
function sumDockHtml(o){
  const h = sumDockHtmlPlanner(o); if(!weekMode()) return h;
  const Z = sumState(o.W, o.st); if(Z.act || Z.justDone || Z.needPick || Z.tut) return h;
  return h.replace(/<table class="wk-list">[\s\S]*?<\/table>/, docListHtml(Z.cells) + `<div class="doc-tot"><span>${esc(planLabel(currentPlan()))}</span><b>profit ${money(planLines(currentPlan()).v.profit)}</b></div>`)
    .replace('<h2>Your workings today</h2>', "<h2>Today's sign-offs</h2>").replace('<b class="dk-t">Your workings today</b>', '<b class="dk-t">Sign-off documents</b>');
}

/* ---------- the planner's fuel strip: one line (week 1 buys as it burns; from day 8 the stored fuel and the week it covers) ---------- */
const wdShort = d => calDate(d).toLocaleDateString('en-GB', { weekday:'short', timeZone:'UTC' });
function fuelWidgetHtml(pl, L, o){
  if(!weekMode()) return fuelWidgetHtmlPlanner(pl, L, o);
  o = o || {}; if(!S.fleet.length) return '';
  const from = S.day || 1, need = L.fuelL || 0, hid = o.hidden && o.hidden.has('fuelCost'), each = (L.services || []).length;
  if(!deskModeAt(from)){
    const free = []; for(let d = from; d < from + 7 && d < deskFrom(); d++) if(fuelFreeDay(d)) free.push(d);
    const price = weekFuelPrice(from), day = Math.round(need * price * 100) / 100;
    return `<section class="pnl fstrip">${ICO2.fuel}<span class="fs-t"><b>Fuel is bought as it is used</b>, at each day's price${free.length ? ` (free ${wdShort(free[0])}${free.length > 1 ? '–' + wdShort(free[free.length - 1]) : ''})` : ''}.</span>
      <span class="fs-n">${num(need)} L a day${each ? ` · ${plural(each, 'service')}` : ''} · ${priceL(price)} a litre${fuelPaid() ? '' : ` from ${dateShort(firstPaidDay())}`}</span>
      <span class="fs-x">${hid ? sumBtn('fuelCost') : `<span>a paid day</span><b class="mono">${twoDp(day)}</b>`}</span></section>`;
  }
  const days = Math.max(1, 7 - ((from - 1) % 7)), week = need * days, pct = week ? Math.min(100, Math.round(100 * S.fuel / week)) : 100;
  return `<section class="pnl fstrip">${ICO2.fuel}<span class="fs-t"><b>${num(Math.round(S.fuel))} L stored</b> · ${pct}% of this week covered</span>
    <span class="fs-n">${num(need)} L a day · ${num(week)} L this week · tank ${num(tankCapacity())} L</span>
    <span class="fs-x">${hid ? sumBtn('fuelCost') : ''}${moduleOn('fuel') ? `<button class="dk-link" data-nav="fuel">Fuel desk ${ICO2.chev}</button>` : ''}</span></section>`;
}
