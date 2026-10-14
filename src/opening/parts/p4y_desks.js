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
  return `<div class="fuel-adv ${a > 0 ? 'good' : a < 0 ? 'bad' : ''}"><span class="kl">Fuel purchasing advantage</span><b class="mono">${a > 0 ? '+' : a < 0 ? '−' : ''}${money(Math.abs(a))}</b><span>${a > 0 ? esc(fdAdvWord()) + ' (on the day each litre was used)' : a < 0 ? 'more than buying later (on the day each litre was used)' : 'the same as buying later'}.${em}</span></div>`;
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
function demandMultNews(route, day){
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

function startBeatDesk(b){ startBeatBase(b); tankUpgradeNotice(); }

/* ==================================================================
   Part 2: the aircraft performance card ("Service Cost Breakdown") and the per-service fuel sign-off (Desks v2 §3, §7).
   The fuel line is signed off by hand the first time a plane type flies a route, and again when the price it is valued
   at has moved 50p or more (one card a day when several qualify; the model fills the rest). The day's fuel bill and the
   1,000 × £1.30 worked example are gone: the card teaches one method, make it whole (Bertie, 14 Oct 2026): the price × 100
   to a whole number, one long multiplication of the whole numbers, then ÷ 100 to put the decimal places back.
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
function decideHandSumsDesk(L, pl){
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
const SC_METHODS = [['part', 'Partition price'], ['scale', 'Scale it'], ['pence', 'Make it pence'], ['dp', 'Decimals'], ['formal', 'Formal ×'], ['whole', 'Make it whole']];
/* Bertie (14 Oct 2026): the class's standard method for decimals. Make the price a whole number (count the decimal places:
   × 10, 100 or 1,000), multiply the whole numbers (one long multiplication), then divide back. It replaces "make it pence"
   with a line for each digit (13 Oct). The other methods stay in scRows for older records. */
function scMethodsOffered(){ return SC_METHODS.filter(([k]) => k === 'whole'); }
const scPriceDec = F => (F.P / 100).toFixed(2);
/* the lines of step 2: the litres × each digit of the pence, units first, as in the column method */
function scPenceLines(L, P){ const out = []; String(P).split('').reverse().forEach((d, k) => { if(+d) out.push({ d:+d, k, v:+d * Math.pow(10, k) }); }); return out; }
/* the rows of a method: each { lab, want (pence), unit:'£'|'p'|'n', cls } and the result row */
function scRows(m, F){
  const L = F.L, P = F.P, a = Math.floor(P / 100), t = Math.floor((P % 100) / 10) * 10, u = P % 10, total = L * P;
  if(m === 'part') return { note:`Break ${priceL(F.price)} into ${[a ? `£${a}` : '', t ? `${t}p` : '', u ? `${u}p` : ''].filter(Boolean).join(' + ')}.`, parts:[a ? ['£' + a, 'c1'] : null, t ? [t + 'p', 'c2'] : null, u ? [u + 'p', 'c3'] : null].filter(Boolean),
    rows:[a ? { lab:`${num(L)} × £${a}.00`, want:L * a * 100, unit:'£', cls:'c1' } : null, t ? { lab:`${num(L)} × £0.${pad(t)}`, want:L * t, unit:'£', cls:'c2' } : null, u ? { lab:`${num(L)} × £0.0${u}`, want:L * u, unit:'£', cls:'c3' } : null].filter(Boolean), total };
  if(m === 'scale'){ const h = Math.floor(L / 100), rem = L % 100, rows = [{ lab:`100 L costs`, want:100 * P, unit:'£', cls:'c1' }];
    if(h > 1) rows.push({ lab:`${num(h * 100)} L costs`, want:h * 100 * P, unit:'£', cls:'c1' });
    if(rem) rows.push({ lab:`${num(rem)} L costs`, want:rem * P, unit:'£', cls:'c2', hint: 100 % rem === 0 ? `${rem} L is 1⁄${100 / rem} of 100 L` : '' });
    return { note:h ? `${num(L)} L = ${h > 1 ? num(h * 100) + ' L' : '100 L'}${rem ? ` + ${num(rem)} L` : ''}. Find the cost of 100 L first.` : `${num(L)} L is less than 100 L: find 100 L first, then the part you need.`, rows, total }; }
  if(m === 'pence'){ const lines = scPenceLines(L, P), rows = [{ lab:`${priceL(F.price)} × 100`, want:P, unit:'p', cls:'c1', step:1 }];
    lines.forEach(x => rows.push({ lab:`${num(L)} × ${num(x.v)}p`, want:L * x.v, unit:'p', cls:'c2', step:2, part:x }));
    if(lines.length > 1) rows.push({ lab:`Add the lines: ${num(L)} × ${num(P)}p`, want:total, unit:'p', cls:'c3', step:2, add:true });
    return { note:`${priceL(F.price)} = ${P}p. Multiply in pence, then change pence to pounds.`, rows, total }; }
  if(m === 'whole') return { note:`${priceL(F.price)} has 2 decimal places: × 100 makes it a whole number, ${num(P)}.`,
    rows:[{ lab:`${scPriceDec(F)} × 100`, want:P, unit:'n', cls:'c1', step:1 }, { lab:`${num(L)} × ${num(P)}`, want:total, unit:'n', cls:'c2', step:2, whole:true }], total };
  if(m === 'dp') return { note:`Leave out the decimal point: ${num(L)} × ${P}. ${priceL(F.price)} has 2 decimal places, so the answer has 2.`, rows:[{ lab:`${num(L)} × ${P}`, want:total, unit:'n', cls:'c1' }], total };
  return { note:'Line up the digits in their columns. The answer has pounds and pence.', rows:[], total };
}
function scParse(unit, s){ s = String(s || '').replace(/[£,\s]/g, '').replace(/p$/i, ''); if(s === '') return null; const v = parseFloat(s); if(isNaN(v)) return null; return unit === '£' ? Math.round(v * 100) : Math.round(v); }
function scShow(unit, pence){ return unit === '£' ? twoDp(pence / 100) : unit === 'p' ? num(pence) + 'p' : num(pence); }

/* ---------- the screen ---------- */
UI.sc = UI.sc || { m:'whole', vals:{}, q:{}, tries:0 };
function cardStampHtml(kind){ const ini = String((S.airline && (S.airline.code || S.airline.flightCode)) || 'CEO').toUpperCase().slice(0, 3); return kind === 'ok' ? `<span class="stamp ok">CHECKED · ${esc(ini)}</span>` : kind === 'q' ? '<span class="stamp q">QUERY</span>' : ''; }
function svcCardHtml(o){
  const F = o.F, sign = !!o.sign, done = !!o.done, practice = !sign && !!UI.sc.practice, entry = sign && !done || practice, methods = scMethodsOffered(), m = methods.some(x => x[0] === UI.sc.m) ? UI.sc.m : methods[0][0];
  const R = scRows(m, F), city = F.r.city, code = tlCode(F.r), home = homeData(), q = UI.sc.q || {}, vals = UI.sc.vals || {};
  UI.sc.F = F; UI.sc.mUsed = m;
  const box = (key, want, unit) => entry ? `<span class="sc-in ${unit === 'p' ? 'pc' : ''} ${q[key] ? 'qy' : ''}">${unit === '£' ? '<i class="pre">£</i>' : ''}<input data-sc="${key}" data-unit="${unit}" inputmode="decimal" autocomplete="off" value="${esc(vals[key] || '')}" aria-label="${key === 'tot' ? 'Fuel cost' : 'Line ' + (+key.slice(1) + 1)}">${unit === 'p' ? '<i class="suf">p</i>' : ''}</span>` : `<b class="sc-v">${scShow(unit, want)}</b>`;
  const tabs = methods.length < 2 ? '' : `<div class="sc-tabs" role="tablist">${methods.map(([k, l]) => `<button role="tab" class="${k === m ? 'on' : ''}" data-scm="${k}" aria-selected="${k === m}">${l}</button>`).join('')}</div>`;
  let frame = '';
  if(m === 'formal' && sign && !done) frame = `<div class="sc-formal">${wkGrid(o.t, o.col, o.row, {})}</div>`;
  else if(m === 'formal') frame = `<div class="sc-step"><span class="sc-sn">Formal ×</span><span>${esc(R.note)}</span></div><div class="sc-eq big"><span>${num(F.L)} × ${F.P}p</span><span>=</span><b>${num(F.L * F.P)}p</b><span>=</span><b>${twoDp(F.fuel)}</b></div>`;
  else if(m === 'whole'){ const right = UI.sc.right || {}, rowsOf = k => R.rows.map((x, i) => [x, i]).filter(([x]) => x.step === k), stepOk = k => rowsOf(k).every(([x, i]) => right['r' + i] || (!entry));
    const s1 = stepOk(1), s2 = s1 && stepOk(2);   // a later step names an earlier answer only once that answer is right
    const rowHtml = ([x, i]) => `<div class="sc-row ${x.cls} ${q['r' + i] ? 'qy' : ''} ${right['r' + i] && entry ? 'rt' : ''}"><span class="sc-l">${x.whole && !s1 ? `${num(F.L)} × your step 1 answer` : x.lab}</span><span>=</span>${box('r' + i, x.want, x.unit)}</div>`;
    frame = `<div class="sc-pz"><div class="sc-pzs"><div class="sc-step"><span class="sc-sn">Step 1</span><b>Make the price a whole number</b></div><p class="sc-note">${priceL(F.price)} has 2 decimal places, so × 100: the digits move two places to the left.</p><div class="sc-rows">${rowsOf(1).map(rowHtml).join('')}</div></div>
      <div class="sc-pzs ${entry && !s1 ? 'later' : ''}"><div class="sc-step"><span class="sc-sn">Step 2</span><b>Multiply the whole numbers</b></div><p class="sc-note">One multiplication: the litres × ${s1 ? num(F.P) : 'the whole number from step 1'}. Set it out as long multiplication (the Working pad has the columns).</p>
        <div class="sc-rows">${rowsOf(2).map(rowHtml).join('')}</div></div>
      <div class="sc-pzs ${entry && !s2 ? 'later' : ''}"><div class="sc-step"><span class="sc-sn">Step 3</span><b>Divide by 100 to put the 2 decimal places back</b></div><p class="sc-note">${s2 ? num(F.L * F.P) : 'Your step 2 answer'} ÷ 100: the digits move two places to the right. The answer is in pounds and pence.</p><!--SCRES--></div></div>`;
  }
  else if(m === 'pence'){ const right = UI.sc.right || {}, rowsOf = k => R.rows.map((x, i) => [x, i]).filter(([x]) => x.step === k), stepOk = k => rowsOf(k).every(([x, i]) => right['r' + i] || (!entry)), lines = scPenceLines(F.L, F.P);
    const rowHtml = ([x, i]) => `<div class="sc-row ${x.cls} ${x.add ? 'sc-add' : ''} ${q['r' + i] ? 'qy' : ''} ${right['r' + i] && entry ? 'rt' : ''}"><span class="sc-l">${x.lab}</span><span>=</span>${box('r' + i, x.want, x.unit)}</div>`;
    frame = `<div class="sc-pz"><div class="sc-pzs"><div class="sc-step"><span class="sc-sn">Step 1</span><b>Make the price whole pence</b></div><p class="sc-note">£1 is 100p: × 100 moves the digits two places left.</p><div class="sc-rows">${rowsOf(1).map(rowHtml).join('')}</div></div>
      <div class="sc-pzs ${entry && !stepOk(1) ? 'later' : ''}"><div class="sc-step"><span class="sc-sn">Step 2</span><b>Multiply the litres by the pence</b></div><p class="sc-note">${lines.length > 1 ? `A line for each part of ${num(F.P)}p (${lines.map(x => num(x.v)).join(' + ')}), then add the lines.` : `${num(F.L)} × ${num(F.P)}p.`}</p>
        <div class="sc-rows">${rowsOf(2).map(rowHtml).join('')}</div></div>
      <div class="sc-pzs ${entry && !(stepOk(1) && stepOk(2)) ? 'later' : ''}"><div class="sc-step"><span class="sc-sn">Step 3</span><b>Change the pence back to pounds</b></div><p class="sc-note">100p make £1: ÷ 100 moves the digits two places right. The last two digits are the pence.</p><!--SCRES--></div></div>`;
  }
  else {
    const eq = m === 'part' ? `<div class="sc-eq"><span class="sc-blk p0">${priceL(F.price)}</span><span>=</span>${R.parts.map(([t, c], i) => `${i ? '<span>+</span>' : ''}<span class="sc-blk ${c}">${t}</span>`).join('')}</div>` : m === 'pence' ? `<div class="sc-eq"><span class="sc-blk p0">${priceL(F.price)}</span><span>=</span><span class="sc-blk c1">${F.P}p</span></div>` : m === 'dp' ? `<div class="sc-eq"><span class="sc-blk p0">${priceL(F.price)}</span><span>→</span><span class="sc-blk c1">${F.P}</span><span class="sc-x">2 decimal places</span></div>` : `<div class="sc-eq"><span class="sc-blk p0">100 L</span><span>×</span><span class="sc-blk c1">${priceL(F.price)}</span></div>`;
    frame = `<div class="sc-step"><span class="sc-sn">Step 1</span><b>${m === 'part' ? 'Partition the price' : m === 'scale' ? 'Start from 100 litres' : m === 'pence' ? 'Make it pence' : 'Count the decimal places'}</b></div><p class="sc-note">${esc(R.note)}</p>${eq}
      <div class="sc-step"><span class="sc-sn">Step 2</span><b>${m === 'part' ? `Multiply each part by ${num(F.L)} litres` : m === 'scale' ? 'Build up to the litres you need' : m === 'pence' ? 'Multiply in pence' : 'Multiply, then put the point back'}</b></div>
      <div class="sc-rows">${R.rows.map((x, i) => `<div class="sc-row ${x.cls} ${q['r' + i] ? 'qy' : ''}"><span class="sc-l">${x.lab}${x.hint ? `<small>${esc(x.hint)}</small>` : ''}</span><span>=</span>${box('r' + i, x.want, x.unit)}</div>`).join('')}</div>`;
  }
  const checkBtn = entry && !(m === 'formal' && sign) ? `<button class="btn primary sc-chk" id="scCheck">Check ✓</button>` : '';
  let result = m === 'formal' && sign && !done ? '' : `<div class="sc-total ${q.tot ? 'qy' : ''} ${checkBtn ? 'wc' : ''}"><span>Fuel cost <small>(${num(F.L)} L × ${priceL(F.price)})</small></span>${box('tot', F.L * F.P, '£')}${checkBtn}</div>`;
  if((m === 'pence' || m === 'whole') && frame.includes('<!--SCRES-->')){ frame = frame.replace('<!--SCRES-->', result); result = ''; }
  const stamp = done ? cardStampHtml('ok') : sign && UI.sc.queried ? cardStampHtml('q') : '';
  const check = entry && !(m === 'formal' && sign) ? `<div class="sc-act"><span class="sc-msg ${UI.sc.ok ? 'ok' : ''}" role="status">${esc(UI.sc.msg || '')}</span>${(UI.sc.tries || 0) >= 3 ? '<button class="dk-link" id="scShow">Show me</button>' : ''}</div>` : m === 'formal' && sign && !done ? `<div class="sc-act"><button class="btn primary" id="cellCheck">Check ✓</button><span class="msg wk-msg sc-msg" id="ftMsg" role="status">${esc(UI.msg || '')}</span></div>` : '';
  const p1 = `<section class="dk-pnl sc-p1 ${sign ? 'sign' : ''}"><div class="sc-h"><span class="sc-n">1</span><div><h2>Calculate the fuel cost</h2><p>${sign ? 'Sign this line off: the litres × the price, in three steps.' : 'The litres × the price, in three steps.'}</p></div>${stamp}</div>${tabs}<div class="sc-frame">${frame}</div>${result}${check}</section>`;
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
/* make it pence: what to do next when a step is right and the next is empty, and what a Query means */
function scNextStepMsg(x, F){ if(!x) return 'Fill in every box first.';
  if(x.tot) return `Steps 1 and 2 are right. Step 3: ${num(F.L * F.P)}p ÷ 100 — change the pence back to pounds.`;
  if(x.step === 1) return `Step 1: ${priceL(F.price)} × 100. How many pence is that?`;
  if(x.add) return 'Step 2: now add the lines, lining up the digits in their columns.';
  return `Step 1 is right: ${F.P}p. Step 2: ${num(F.L)} × each part of ${F.P}p.`; }
function scPenceQuery(R, q, F){
  const i = R.rows.findIndex((x, k) => q['r' + k]), x = R.rows[i], typed = x ? scParse(x.unit, UI.sc.vals['r' + i]) : scParse('£', UI.sc.vals.tot);
  if(!x){ const pence = F.L * F.P; if(typed === pence * 100) return `Query, step 3: that is still pence. Divide ${num(pence)}p by 100: the digits move two places to the right.`;
    if(typed * 10 === pence || typed * 1000 === pence) return 'Query, step 3: divide by 100, so the digits move two places, not one or three.';
    return `Query, step 3: ${num(pence)}p ÷ 100. The last two digits are the pence; the rest are the pounds.`; }
  if(x.step === 1) return typed === F.P * 10 || typed * 10 === F.P ? `Query, step 1: × 100 moves the digits two places, not one. ${priceL(F.price)} is ${F.P}p.` : `Query, step 1: £1 is 100p, so ${priceL(F.price)} × 100 moves each digit two places to the left.`;
  if(x.add) return 'Query, step 2: the lines are right; add them again, lining up the units, tens and hundreds.';
  const P = x.part; if(typed !== null && (typed * 10 === x.want || typed === x.want * 10)) return `Query, step 2: ${num(F.L)} × ${num(P.v)}${P.k ? ` is ${num(F.L)} × ${P.d}, then × ${num(Math.pow(10, P.k))}` : ''}: check how many places the digits move.`;
  return P.k ? `Query, step 2: ${num(F.L)} × ${num(P.v)} is ${num(F.L)} × ${P.d}, then × ${num(Math.pow(10, P.k))} (the digits move ${P.k === 1 ? 'one place' : P.k + ' places'} to the left).` : `Query, step 2: ${num(F.L)} × ${P.d}. Multiply each digit by ${P.d}, carrying as you go.`;
}
/* make it whole: what to do next, and what a Query means (Bertie's method, 14 Oct) */
function scWholeNext(x, F){ if(!x) return 'Fill in every box first.';
  if(x.tot) return `Steps 1 and 2 are right. Step 3: ${num(F.L * F.P)} ÷ 100 puts the 2 decimal places back.`;
  if(x.step === 1) return `Step 1: ${priceL(F.price)} has 2 decimal places. × 100 makes it a whole number.`;
  return `Step 1 is right: ${num(F.P)}. Step 2: multiply the whole numbers, ${num(F.L)} × ${num(F.P)}.`; }
function scWholeQuery(R, q, F){
  const i = R.rows.findIndex((x, k) => q['r' + k]), x = R.rows[i], whole = F.L * F.P, typed = x ? scParse(x.unit, UI.sc.vals['r' + i]) : scParse('£', UI.sc.vals.tot);
  if(!x){ if(typed === whole * 100) return `Query, step 3: that is still the whole-number answer. Divide ${num(whole)} by 100 to put the 2 decimal places back.`;
    if(typed === whole * 10 || typed * 10 === whole) return 'Query, step 3: the price had 2 decimal places, so ÷ 100: the digits move two places, not one or three.';
    return `Query, step 3: ${num(whole)} ÷ 100. The last two digits are the pence; the rest are the pounds.`; }
  if(x.step === 1) return typed === F.P * 10 || typed * 10 === F.P ? `Query, step 1: count the decimal places. ${priceL(F.price)} has 2, so × 100 (two places), not × 10 or × 1,000.` : `Query, step 1: ${scPriceDec(F)} × 100 moves each digit two places to the left, so no decimal point is left.`;
  if(/\./.test(String(UI.sc.vals['r' + i] || '').replace(/[£,\s]/g, ''))) return `Query, step 2: both numbers are whole now, so the answer is a whole number. ${num(F.L)} × ${num(F.P)}.`;
  if(typed !== null && (typed * 10 === x.want || typed === x.want * 10)) return `Query, step 2: ${num(F.L)} × ${num(F.P)}. Check the place value of each line of the long multiplication: one line is a column out.`;
  return `Query, step 2: ${num(F.L)} × ${num(F.P)}. Set it out as long multiplication (the Working pad does the columns), then add the lines.`; }
/* the answers to the card on screen (the tests type them) */
function scAnswers(){ const F = UI.sc.F; if(!F) return null; const R = scRows(UI.sc.mUsed || 'whole', F), out = {}; R.rows.forEach((x, i) => { out['r' + i] = x.unit === '£' ? (x.want / 100).toFixed(2) : String(x.want); }); out.tot = (F.L * F.P / 100).toFixed(2); return out; }
function firstPaidDay(){ const from = S.day || 1; for(let d = from; d < from + 7; d++) if(!fuelFreeDay(d)) return d; return from; }
/* the card on screen: o = { uid, k } (model) or { t } (a sign-off) */
function renderSvcCard(o){
  const sign = !!o.t, t = o.t, c = sign ? t.card : null, pl = currentPlan(), F = serviceFigures(sign ? c.uid : o.uid, sign ? c.k : o.k, pl); if(!F){ UI.card = null; render(); return; }
  if(sign){ F.price = c.price; F.P = Math.round(c.price * 100); F.fuel = F.L * F.P / 100; F.cost = F.fuel + F.airport + F.paxCh + F.flying + F.stock; F.profit = F.rev - F.cost; }
  const col = sign ? t.cols[0] : null, row = sign ? tRows(t).find(r => r.id === 'fuel') : null, done = sign && !!t.done[cellId('a', 'fuel')];
  if(sign && !done){ t.active = { col:'a', row:'fuel' }; S.rnd.activeTable = t.id; }
  const homeBtn = sign ? '' : '<button class="btn big" id="scBack">&#9664; Back to plan</button>';
  const bar = deskBar(sign ? (done ? 'Checked. Use this figure in your plan, then the next sum.' : 'Work out this service\'s fuel cost in three steps: make the price a whole number (× 100), multiply the whole numbers, then ÷ 100.') : 'One service\'s costs and profit. The fuel line is the price per litre × the litres burned.',
    sign ? `${backBtn()}<button class="btn primary big" id="scNext" ${done ? '' : 'disabled'}>${done ? 'Use this figure &#9654;' : 'Sign off the fuel line first'}</button>` : homeBtn);
  screen().innerHTML = shell(deskPage({ title:'Service Cost Breakdown', sub:'Work out the cost and profit for a single service. Use the calculation tools to find the fuel cost, the total operating cost and the projected profit.',
    cards:[{ ic:'bulb', t:'Work it out', s:sign ? 'Make it whole: × 100, multiply, ÷ 100. Check each step.' : (UI.sc.practice ? 'Practising: your own working, nothing is recorded.' : 'Make it whole: × 100, multiply, ÷ 100. Try it yourself.'), id:'scWork' }, { ic:'back', t:'Back to plan', s:'Return to the operating plan when you\'re ready.', id:'scBackCard' }],
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
  on('scShow', () => { const m = root.querySelector('[data-scm].on'), R = scRows(m ? m.getAttribute('data-scm') : (UI.sc.mUsed || 'whole'), F); R.rows.forEach((x, i) => { UI.sc.vals['r' + i] = scShow(x.unit, x.want).replace(/^£/, ''); }); UI.sc.vals.tot = (F.L * F.P / 100).toFixed(2); UI.sc.msg = 'Here is the working. Check each line, then press Check.'; render(); });
  on('scCheck', () => {
    const mk = (root.querySelector('[data-scm].on') || {}).getAttribute ? root.querySelector('[data-scm].on').getAttribute('data-scm') : (UI.sc.mUsed || 'whole'), R = scRows(mk, F), q = {}, right = UI.sc.right = {}; let blank = false, firstBlank = null;
    R.rows.forEach((x, i) => { const v = scParse(x.unit, UI.sc.vals['r' + i]); if(v === null){ blank = true; if(firstBlank === null) firstBlank = x; } else if(v !== x.want) q['r' + i] = true; else right['r' + i] = true; });
    const tv = scParse('£', UI.sc.vals.tot); if(tv === null){ blank = true; if(firstBlank === null) firstBlank = { tot:true }; } else if(tv !== F.L * F.P) q.tot = true;
    UI.sc.q = q;
    if(blank && !Object.keys(q).length){ UI.sc.ok = false; UI.sc.msg = mk === 'whole' ? scWholeNext(firstBlank, F) : mk === 'pence' ? scNextStepMsg(firstBlank, F) : 'Fill in every box first.'; render(); return; }
    if(Object.keys(q).length){ UI.sc.tries = (UI.sc.tries || 0) + 1; UI.sc.queried = true; UI.sc.ok = false;
      UI.sc.msg = mk === 'whole' ? scWholeQuery(R, q, F) : mk === 'pence' ? scPenceQuery(R, q, F) : q.tot && Object.keys(q).length === 1 ? 'Query: the lines are right; check how you added them.' : 'Query: the highlighted line is not right. Look at it again.'; render(); return; }
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
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-svccard]'); if(!b) return; const [i, j, k] = b.getAttribute('data-svccard').split('|').map(Number), pl = normPlan(currentPlan()), x = pl.fleet[j]; if(!x || i === 9) return; UI.card = { uid:x.uid, k }; UI.sc = { m:UI.sc.m || 'whole', vals:{}, q:{}, tries:0 }; render(); });

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

/* ==================================================================
   Part 3: Fuel Procurement (Desks v2 §4, Bertie's reference screen). From day 8, a Monday step after the sums and the
   Fuel nav row at any time. The market chart (the game's own prices since launch, then next week's forecast band), the
   week's news, your position (the tank, this week's need, what is secured), a purchase order in 1,000 L blocks (the
   first purchase is a sign-off) and the scenario table: buy now against buying next week at the forecast prices.
   ================================================================== */
function daySteps(n, w){
  const st = dayStepsWeek(n, w); w = w || roundData(n);
  if(!weekMode() || !w.weekPhase || !deskModeAt(beatDay(n))) return st;
  const at = st.findIndex(x => x.t === 'ready'); if(at > 0 && st[at - 1].t === 'workings') st.splice(at, 0, { t:'fuelDesk' });
  return st;
}
UI.fd = UI.fd || { range:'1M', sel:null, signed:false, vals:{}, q:{} };
const FD_RANGES = [['1W', 7], ['1M', 30], ['3M', 91], ['6M', 182]];
function fdMarket(day){ return marketWeekOf(day) || {}; }
function fdNeed(day){ const L = planLines(currentPlan()), left = 7 - ((day - 1) % 7); return { perDay:L.fuelL || 0, days:left, week:(L.fuelL || 0) * left }; }
function fdLayers(){ const by = {}; fuelLots().forEach(x => { const k = x.p.toFixed(2); by[k] = (by[k] || 0) + x.L; }); return Object.keys(by).map(k => ({ p:+k, L:Math.round(by[k]) })); }
function fdMaxBlocks(price){ const blk = fuelBlock(), space = Math.floor(tankSpace() / blk + 1e-9), cash = Math.floor(Math.max(0, S.cash - (WORLD.cashReserve || 0)) / (blk * price) + 1e-9); return Math.max(0, Math.min(space, cash)); }
function fdAdvWord(){ return WBS().fuelAdvantageWording || 'saved compared with buying later'; }
/* the chart: the price each day since launch (or the window), this week's price to Sunday, next week's band */
function fuelChartSvg(day, range){
  const span = (FD_RANGES.find(x => x[0] === range) || FD_RANGES[1])[1], a = Math.max(1, day - span + 1), m = fdMarket(day), wkEnd = day + (7 - ((day - 1) % 7)) - 1, nxA = wkEnd + 1, nxB = wkEnd + 7;
  const hist = []; for(let d = a; d <= day; d++) hist.push([d, fuelOn(d)]);
  const P0 = fuelOn(day), lo = m.forecastLow, hi = m.forecastHigh, band = lo !== undefined && lo !== null && hi !== undefined && hi !== null;
  const ys = hist.map(x => x[1]).concat(band ? [lo, hi] : []), y0 = Math.floor((Math.min(...ys) - 0.04) * 10) / 10, y1 = Math.ceil((Math.max(...ys) + 0.04) * 10) / 10;
  const W = 760, H = 250, l = 50, r = 128, t = 14, b = 30, X = d => l + (W - l - r) * (d - a) / Math.max(1, (band ? nxB : wkEnd) - a), Y = v => t + (H - t - b) * (y1 - v) / Math.max(0.01, y1 - y0);
  const step = (y1 - y0) > 0.8 ? 0.2 : 0.1, yt = []; for(let v = y0; v <= y1 + 1e-9; v = Math.round((v + step) * 100) / 100) yt.push(v);
  const g = artId('fc'), line = hist.map(([d, v], i) => `${i ? 'L' : 'M'}${X(d).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  const area = `${line} L${X(day).toFixed(1)} ${H - b} L${X(a).toFixed(1)} ${H - b} Z`;
  const xt = []; const every = span <= 7 ? 1 : span <= 30 ? 7 : span <= 91 ? 14 : 28; for(let d = a; d <= (band ? nxB : wkEnd); d += every) xt.push(d);
  const fmtD = d => { const c = calDate(d); return `${c.getUTCDate()} ${MONTH[c.getUTCMonth()].slice(0, 3)}`; };
  return `<svg class="fd-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Jet fuel price: ${priceL(P0)} a litre today${band ? `, next week forecast ${priceL(lo)} to ${priceL(hi)}` : ''}"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#36c6ff" stop-opacity=".38"/><stop offset="1" stop-color="#36c6ff" stop-opacity="0"/></linearGradient></defs>
    ${yt.map(v => `<line x1="${l}" x2="${W - r}" y1="${Y(v)}" y2="${Y(v)}" class="gl"/><text x="${l - 8}" y="${Y(v) + 4}" text-anchor="end" class="ax">£${v.toFixed(2)}</text>`).join('')}
    ${xt.map(d => `<text x="${X(d)}" y="${H - 9}" text-anchor="middle" class="ax">${fmtD(d)}</text>`).join('')}
    ${band ? `<rect x="${X(nxA - 0.5)}" y="${t}" width="${X(nxB) - X(nxA - 0.5)}" height="${H - t - b}" class="nxw"/><path d="M${X(wkEnd)} ${Y(P0)} L${X(nxA)} ${Y(hi)} L${X(nxB)} ${Y(hi)} L${X(nxB)} ${Y(lo)} L${X(nxA)} ${Y(lo)} Z" class="band"/><text x="${(X(nxA) + X(nxB)) / 2}" y="${Y(hi) - 8}" text-anchor="middle" class="bl">Next week ${priceL(lo)}–${priceL(hi)}</text>` : ''}
    <path d="${area}" fill="url(#${g})"/><path d="${line}" class="ln"/>
    <path d="M${X(day)} ${Y(P0)} H${X(wkEnd)}" class="wk"/><line x1="${l}" x2="${W - r}" y1="${Y(P0)}" y2="${Y(P0)}" class="now"/>
    <line x1="${X(day)}" x2="${X(day)}" y1="${t}" y2="${H - b}" class="today"/><circle cx="${X(day)}" cy="${Y(P0)}" r="6" class="pt"/>
    <g transform="translate(${W - r + 12} ${clamp(Y(P0) - 26, t, H - b - 52)})"><rect width="${r - 18}" height="52" rx="4" class="co"/><text x="12" y="23" class="co1">${priceL(P0)} / L</text><text x="12" y="41" class="co2">Current price</text></g></svg>`;
}
function fuelDeskHtml(asView){
  const day = S.day || 1, P0 = fuelOn(day), m = fdMarket(day), lo = m.forecastLow, hi = m.forecastHigh, conf = String(m.forecastConfidence || '').toLowerCase(), blk = fuelBlock(), cap = tankCapacity();
  const need = fdNeed(day), inTank = Math.round(S.fuel), pct = Math.round(100 * inTank / cap), short = need.week - inTank, cover = need.week ? Math.min(100, Math.round(100 * inTank / need.week)) : 100;
  const max = fdMaxBlocks(P0), selB = clamp(UI.fd.sel === null ? Math.min(max, Math.max(0, Math.ceil(Math.max(0, short) / blk))) : UI.fd.sel, 0, max), L = selB * blk, cost = Math.round(L * P0 * 100) / 100;
  UI.fd.selNow = selB;
  const firstBuy = !S.fuelBuySigned && selB > 0, signOk = !firstBuy || UI.fd.signed, levels = WBS().forecastConfidenceLevels || ['high', 'medium', 'low'];
  const ranges = `<div class="fd-rng" role="tablist">${FD_RANGES.map(([k]) => `<button role="tab" data-fdr="${k}" class="${UI.fd.range === k ? 'on' : ''}" aria-selected="${UI.fd.range === k}">${k}</button>`).join('')}</div>`;
  const chart = `<section class="dk-pnl fd-mk"><div class="dk-pnl-h">${ICO2.bars}<h2>Jet fuel market price <small>(£ per litre)</small></h2><span class="grow"></span>${ranges}</div><div class="fd-cw">${fuelChartSvg(day, UI.fd.range)}</div>
    <p class="fd-foot">${ICO2.info}<span>The price you pay today is ${priceL(P0)} a litre all week. ${lo !== undefined && lo !== null ? `Analysts expect ${priceL(lo)} to ${priceL(hi)} next week.` : ''}</span></p></section>`;
  const h2 = m.fuelHeadline2 || (m.weather && m.weather !== 'Clear' ? `Weather: ${m.weather}.` : m.headline) || 'No other news this week.';
  const confN = Math.max(1, levels.length - Math.max(0, levels.indexOf(conf)));
  const news = `<div class="fd-news">
    <article class="fd-nc">${artRefinery()}<div><span class="kl">Market news</span><p>${esc(m.fuelHeadline || 'Prices are steady.')}</p></div></article>
    <article class="fd-nc">${m.weather && m.weather !== 'Clear' ? artWeather() : artShip()}<div><span class="kl">Second signal</span><p>${esc(h2)}</p></div></article>
    <article class="fd-nc fd-fc">${ICO2.arrowUp}<div><span class="kl">Next week's forecast</span>${lo !== undefined && lo !== null ? `<b>${priceL(lo)} – ${priceL(hi)}</b><p>per litre, ${hi < P0 ? 'below' : lo > P0 ? 'above' : 'around'} today's ${priceL(P0)}</p>` : '<p>No forecast yet.</p>'}</div></article>
    <article class="fd-nc fd-cf">${ICO2.gauge}<div><span class="kl">Price forecast confidence</span><b>${esc(capFirst(conf || 'unknown'))}</b><span class="fd-seg">${levels.map((_, i) => `<i class="${i < confN ? 'on' : ''}"></i>`).join('')}</span></div></article></div>`;
  const layers = fdLayers(), row = (l, v, cls) => `<div class="fd-r ${cls || ''}"><span>${l}</span><b>${v}</b></div>`;
  const pos = `<section class="dk-pnl fd-pos"><div class="dk-pnl-h">${ICO2.fuel}<h2>Your position</h2><span class="grow"></span><span class="sub">this week: ${fmtRange(day, day + need.days - 1)}</span></div><div class="fd-pg">
    <div class="fd-tank">${artTank(pct, num(inTank) + ' L', pct + '% full')}</div>
    <div class="fd-rows">${row('Storage capacity', num(cap) + ' L')}${row('Currently in tank', num(inTank) + ' L')}${row(`This week's requirement <small>${num(need.perDay)} L a day × ${need.days} days</small>`, num(need.week) + ' L')}
      ${row('Already secured', layers.length ? layers.map(x => `${num(x.L)} L at ${priceL(x.p)}`).join(', ') : 'nothing yet')}
      ${row(short > 0 ? 'Projected shortfall' : 'Projected surplus', num(Math.abs(short)) + ' L', short > 0 ? 'bad' : 'good')}
      <div class="fd-cov"><div class="fd-bar"><i style="width:${cover}%"></i></div><span><b class="good">${cover}% covered</b> · <b class="${cover < 100 ? 'bad' : ''}">${100 - cover}% exposed</b></span></div>
      <p class="fd-em">Fuel not in the tank is bought on the day at the day's price + ${Math.round(100 * (WORLD.fuelTopUp !== undefined ? WORLD.fuelTopUp : 0.1))}p.</p></div></div></section>`;
  const blocks = [0, 1, 2, 3, 4].map(n => `<button class="fd-b ${selB === n ? 'on' : ''}" data-fdb="${n}" ${n > max ? 'disabled' : ''}>${num(n * blk)} L</button>`).join('');
  const signBox = firstBuy ? (() => { const q = UI.fd.q || {}, v = UI.fd.vals || {}, inp = (k, lab) => `<div class="fd-sr ${q[k] ? 'qy' : ''}"><span>${lab}</span><span class="sc-in"><i class="pre">£</i><input data-fds="${k}" inputmode="decimal" autocomplete="off" value="${esc(v[k] || '')}" aria-label="${esc(lab)}"></span></div>`;
      return UI.fd.signed ? `<div class="fd-sign ok one"><p><b>First order:</b> ${num(blk)} L × ${priceL(P0)} = ${twoDp(blk * P0)}${selB > 1 ? `; ${selB} × ${twoDp(blk * P0)} = ${twoDp(cost)}` : ''}</p>${cardStampHtml('ok')}</div>` : `<div class="fd-sign"><div class="fd-sh"><b>Sign off your first order</b>${UI.fd.queried ? cardStampHtml('q') : ''}</div>${`${inp('one', `${num(blk)} L × ${priceL(P0)} =`)}${selB > 1 ? inp('all', `${selB} × the cost of ${num(blk)} L =`) : ''}<div class="fd-sa"><button class="btn primary" id="fdSignChk">Check ✓</button><span class="sc-msg" role="status">${esc(UI.fd.msg || '')}</span></div>`}</div>`; })() : '';
  const order = `<section class="dk-pnl fd-ord"><div class="dk-pnl-h">${ICO2.cart}<h2>Place a purchase order</h2><span class="grow"></span><span class="sub">Market price today <b class="gold">${priceL(P0)} / L</b></span></div>
    <div class="fd-ob"><div class="fd-blocks">${blocks}<span class="fd-more"><button class="fd-st" data-fdm="-1" ${selB <= 0 ? 'disabled' : ''}>−</button><span>More</span><button class="fd-st" data-fdm="1" ${selB >= max ? 'disabled' : ''}>+</button></span></div>
    ${signBox ? '' : `<p class="fd-lim">Blocks of ${num(blk)} L · room in the tank for ${num(Math.floor(tankSpace() / blk) * blk)} L; cash above the reserve buys ${num(Math.floor(Math.max(0, S.cash - (WORLD.cashReserve || 0)) / (blk * P0)) * blk)} L.</p>`}
    ${signBox}
    <div class="fd-tot"><span>Today's order cost <small>${num(L)} L × ${priceL(P0)} / L</small></span><b>${firstBuy && !UI.fd.signed ? '?' : twoDp(cost)}</b><button class="btn fd-buy" id="fdBuy" ${selB > 0 && signOk ? '' : 'disabled'}>${ICO2.check}<span>Confirm purchase</span></button></div>
    ${UI.fd.done ? `<p class="fd-done good" role="status">${esc(UI.fd.done)}</p>` : ''}</div></section>`;
  const SL = L || blk, rows = [['Forecast low', lo], ["Today's price", P0], ['Mid-forecast', lo !== undefined && hi !== undefined && lo !== null ? Math.round((lo + hi) * 50) / 100 : null], ['Forecast high', hi]].concat(UI.fd.custom ? [['Your assumption', UI.fd.custom]] : []).filter(x => x[1] !== null && x[1] !== undefined);
  const scen = `<section class="dk-pnl fd-sc"><div class="dk-pnl-h">${ICO2.sliders}<h2>Scenario modelling</h2><span class="grow"></span><span class="sub">for ${num(SL)} L</span><button class="dk-link" id="fdAdj">${UI.fd.adj ? 'Done' : 'Adjust assumptions'}</button></div>
    ${UI.fd.adj ? `<div class="fd-adj"><label>If next week's price is <span class="sc-in"><i class="pre">£</i><input id="fdCustom" inputmode="decimal" value="${UI.fd.custom ? UI.fd.custom.toFixed(2) : ''}" aria-label="Your price for next week"></span> a litre</label><button class="btn" id="fdAdjGo">Add to the table</button></div>` : ''}
    <table class="dk-t fd-t"><thead><tr><th>Next week's price</th><th class="num">If you wait</th><th class="num">If you buy now</th><th class="num" title="${esc(capFirst(fdAdvWord()))}">Fuel purchasing advantage</th></tr></thead><tbody>${rows.map(([lab, p]) => { const wait = Math.round(SL * p * 100) / 100, now = Math.round(SL * P0 * 100) / 100, adv = Math.round((wait - now) * 100) / 100;
      return `<tr><td>${lab} <small>${priceL(p)}</small></td><td class="num">${twoDp(wait)}</td><td class="num">${twoDp(now)}</td><td class="num ${adv > 0 ? 'good' : adv < 0 ? 'bad' : ''}">${adv > 0 ? `+${twoDp(adv)} <small>saved</small>` : adv < 0 ? `−${twoDp(-adv)} <small>extra</small>` : '£0.00 <small>no difference</small>'}</td></tr>`; }).join('')}</tbody></table></section>`;
  const learn = UI.fd.learn ? `<div class="fd-learn" role="dialog" aria-label="How the fuel market works"><h3>How the fuel market works</h3><ul>
    <li>The price is set each week. Everything you buy this week costs ${priceL(P0)} a litre.</li><li>Fuel in the tank is used oldest first, at the price you paid for it.</li>
    <li>If the tank runs short, the airport sells you fuel on the day at the day's price + 10p.</li><li>Analysts forecast a band for next week. High confidence means the price is likely to land inside it.</li>
    <li>Buying now is worth it when next week's price will be higher than today's: the difference is your fuel purchasing advantage.</li></ul><button class="btn" id="fdLearnX">Close</button></div>` : '';
  return `<div class="fd">${learn}<div class="fd-l">${chart}${news}</div><div class="fd-rc">${pos}${order}${scen}</div></div>`;
}
function renderFuelDesk(asView){
  const day = S.day || 1, m = fdMarket(day);
  const bar = asView ? deskBar('Buy in 1,000 L blocks when the price is right. What you buy is used oldest first.', '<button class="btn primary big" id="fdClose">&#9664; Back</button>')
    : deskBar('Buy fuel for the week in 1,000 L blocks, or buy none and pay the day\'s price + 10p as you fly.', `${backBtn()}<button class="btn primary big" id="nx">Continue &#9654;</button>`);
  screen().innerHTML = shell(deskPage({ title:'Fuel Procurement', sub:'Watch the market, secure fuel and manage your storage.', cls:'fd-page',
    cards:[{ ic:'bulb', t:'Learn more', s:'How the fuel market works and what moves the price.', id:'fdLearn' }, { ic:'bars', t:'Fuel outlook', s:m.forecastLow !== undefined && m.forecastLow !== null ? `Next week ${priceL(m.forecastLow)}–${priceL(m.forecastHigh)} · ${String(m.forecastConfidence || '').toLowerCase()} confidence` : 'No forecast this week.', id:'fdOutlook' }],
    body:fuelDeskHtml(asView) }), bar);
  bindFuelDesk(asView);
}
function bindFuelDesk(asView){
  const root = screen(), P0 = fuelOn(S.day || 1), blk = fuelBlock();
  root.querySelectorAll('[data-fdr]').forEach(b => b.onclick = () => { UI.fd.range = b.getAttribute('data-fdr'); render(); });
  root.querySelectorAll('[data-fdb]').forEach(b => b.onclick = () => { UI.fd.sel = +b.getAttribute('data-fdb'); UI.fd.signed = false; UI.fd.vals = {}; UI.fd.q = {}; UI.fd.msg = ''; UI.fd.done = ''; render(); });
  root.querySelectorAll('[data-fdm]').forEach(b => b.onclick = () => { UI.fd.sel = Math.max(0, (UI.fd.selNow || 0) + +b.getAttribute('data-fdm')); UI.fd.signed = false; UI.fd.vals = {}; UI.fd.q = {}; UI.fd.msg = ''; UI.fd.done = ''; render(); });
  root.querySelectorAll('[data-fds]').forEach(inp => { inp.oninput = () => { UI.fd.vals[inp.getAttribute('data-fds')] = inp.value; }; inp.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); const c = $('fdSignChk'); if(c) c.click(); } }; });
  on('fdSignChk', () => { const n = UI.fd.selNow || 0, one = Math.round(blk * P0 * 100), q = {}; let blank = false;
    const v1 = scParse('£', UI.fd.vals.one); if(v1 === null) blank = true; else if(v1 !== one) q.one = true;
    if(n > 1){ const v2 = scParse('£', UI.fd.vals.all); if(v2 === null) blank = true; else if(v2 !== one * n) q.all = true; }
    UI.fd.q = q; if(Object.keys(q).length){ UI.fd.queried = true; UI.fd.msg = q.one ? `Query: look at the highlighted line again. Make it whole: ${P0.toFixed(2)} × 100 = ${Math.round(P0 * 100)}, multiply by ${num(blk)}, then ÷ 100.` : 'Query: look at the highlighted line again.'; render(); return; }
    if(blank){ UI.fd.msg = 'Fill in each box first.'; render(); return; }
    UI.fd.signed = true; UI.fd.queried = false; UI.fd.msg = ''; render(); });
  on('fdBuy', () => { const n = UI.fd.selNow || 0; if(!n || n > fdMaxBlocks(P0)) return; if(!S.fuelBuySigned && !UI.fd.signed) return;
    const L = n * blk; buyFuel(L, P0); fuelWeek(S.day || 1).bought.push({ day:S.day, L, p:P0 });
    if(!S.fuelBuySigned){ S.fuelBuySigned = { day:S.day, L, p:P0 }; const sk = skills(), x = sk.fuelOrder || (sk.fuelOrder = { first:S.day, count:0 }); x.count++; x.lastDay = S.day;
      const log = S.handSumLog || (S.handSumLog = []), e = log.find(z => z.day === S.day) || (log.push({ day:S.day, date:dateShort(S.day), tools:[] }), log[log.length - 1]); e.tools.push(`Fuel order: ${n} × ${num(blk)} L (Calculate)`); }
    UI.fd.done = `Bought ${num(L)} L at ${priceL(P0)}: ${twoDp(L * P0)}. The tank now holds ${num(Math.round(S.fuel))} L.`; UI.fd.sel = 0; UI.fd.signed = false; UI.fd.vals = {}; UI.fd.q = {};
    if(typeof liveChime === 'function' && typeof opsSoundOn === 'function' && opsSoundOn()) liveChime('ding'); save(); render(); });
  on('fdAdj', () => { UI.fd.adj = !UI.fd.adj; render(); });
  on('fdAdjGo', () => { const v = parseFloat(String(($('fdCustom') || {}).value || '').replace(/[£\s]/g, '')); if(v > 0 && v < 10){ UI.fd.custom = Math.round(v * 100) / 100; UI.fd.adj = false; render(); } });
  on('fdLearn', () => { UI.fd.learn = true; render(); }); on('fdLearnX', () => { UI.fd.learn = false; render(); });
  on('fdOutlook', () => { UI.fd.range = '1W'; render(); });
  on('fdClose', () => { UI.view = null; render(); });
  if(!asView) on('nx', () => { UI.fd = { range:UI.fd.range, sel:null, signed:false, vals:{}, q:{} }; advance(); });
}
R.fuelDesk = () => renderFuelDesk(false);
WS_STEPS.push('fuelDesk'); SHELL_STEPS.push('fuelDesk');   // the desk sits in the Monday workspace: the plan is a press away
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-nav="plan"]'); if(!b || !S || step().t !== 'fuelDesk' || UI.view) return;
  const i = S.steps.findIndex(x => x.t === 'plan'); if(i >= 0){ e.stopPropagation(); e.preventDefault(); jumpTo(i); } }, true);

/* ==================================================================
   Part 4: the weeks from day 29 and the months on the same desks (Desks v2 §8). A week or month beat is planned on the
   planner, signed off on the sums page, stocked at the fuel desk, then run ("week-skips"); the tank carries on.
   ================================================================== */
function stepsFor(b){
  const st = stepsForWeeks(b), w = roundData(b); if(!weekMode() || !['week', 'month'].includes(w.period)) return st;
  const out = []; st.forEach(x => { if(['costPlan', 'testIdeas', 'fuelPlan', 'plans'].includes(x.t)) return; out.push(x.t === 'planner' ? { t:'plan' } : x); });
  if(!out.some(x => x.t === 'plan')){ const at = out.findIndex(x => x.t === 'ready'); out.splice(at < 0 ? out.length : at, 0, { t:'plan' }); }
  const r = out.findIndex(x => x.t === 'ready'); out.splice(r, 0, { t:'workings' }, { t:'fuelDesk' });
  return out;
}
/* the regular plan's approval (end of day 28): the tank carries on into the weeks */
const ropDesk0 = R.rop;
R.rop = st => { ropDesk0(st); if(!weekMode()) return; screen().querySelectorAll('.rop-t > div').forEach(d => { const l = d.querySelector('span'), v = d.querySelector('b'); if(l && v && /^Fuel/.test(l.textContent)) v.innerHTML = `The tank carries on: ${num(Math.round(S.fuel))} L in store. From now on it holds ${num(WORLD.tankUpgraded || 20000)} L; buy at the fuel desk each Monday.`; }); };

/* the week's forecast on a week or month beat: the plan over every day of the period (not one day) */
const readyDesk0 = R.ready;
R.ready = st => {
  const P = S.period, fc = S.rnd.myForecast;
  if(weekMode() && P && ['week', 'month'].includes(P.type) && fc && fc.days !== P.to - P.from + 1){
    const pl = currentPlan(), t = dryRun(() => { let sum = 0; for(let d = P.from; d <= P.to; d++) withDay(d, () => withBeat(beatAt(d), () => { const k = S.day; S.day = d; try{ sum += planLines(pl).v.profit; } finally { S.day = k; } })); return sum; });
    S.rnd.myForecast = Object.assign({}, fc, { profit:Math.round(t), perDay:fc.profit, days:P.to - P.from + 1, projected:false }); }
  return readyDesk0(st);
};

/* ==================================================================
   Part 5: the World report (Desks v2 §9; the workbook's worldReport: "Monday plan page"), the Network's figures,
   and the RouteNews surprises named in the reviews.
   ================================================================== */
function surprisesLine(from, to){
  const n = surprisesIn(from, to); if(!n.length) return '';
  return `<div class="fuel-adv wr-sur"><span class="kl">Surprises this week</span>${n.map(x => `<span><b>${esc(x.headline || x.id)}</b> ${x.routes.map(id => routeById(id) ? routeById(id).city : id).join(', ')}: demand ×${x.mult}${x.segment && x.segment !== 'all' ? ` (${x.segment})` : ''}, ${fmtRange(dayOfDate(x.start), dayOfDate(x.end))}.</span>`).join('')}</div>`;
}
UI.wr = UI.wr || {};
function worldReportHtml(){
  const day = S.day || 1, m = fdMarket(day), P0 = fuelOn(day), routes = openRoutes(day).filter(r => S.fleet.some(f => planeCanFly(planeById(f.planeId), r))), pl = currentPlan();
  const flown = new Set(normPlan(pl).fleet.flatMap(x => x.sched)), focus = UI.wr.route && routes.some(r => r.id === UI.wr.route) ? UI.wr.route : (S.rnd.focusRoute || [...flown][0] || (routes[0] || {}).id);
  const fuel = `<section class="dk-pnl wr-fuel"><div class="dk-pnl-h">${ICO2.fuel}<h2>Fuel</h2><span class="grow"></span><button class="dk-link" data-nav="fuel">Fuel desk ${ICO2.chev}</button></div><div class="fd-cw">${fuelChartSvg(day, '1M')}</div>
    <p class="wr-l"><b>${priceL(P0)}</b> a litre this week.${m.forecastLow !== undefined && m.forecastLow !== null ? ` Next week ${priceL(m.forecastLow)}–${priceL(m.forecastHigh)}, ${esc(String(m.forecastConfidence || '').toLowerCase())} confidence.` : ''} ${esc(m.fuelHeadline || '')}</p></section>`;
  const rk = `<section class="dk-pnl wr-rk"><div class="dk-pnl-h">${ICO2.tag}<h2>${esc(WORLD.rival || 'Red Kite')} fares</h2><span class="grow"></span><span class="sub">one way, this week</span></div><table class="dk-t"><thead><tr><th>Route</th><th class="num">Your fare</th><th class="num">${esc(WORLD.rival || 'Red Kite')}</th><th class="num">Want to fly at yours</th></tr></thead><tbody>${routes.map(r => { const f = pl.prices[r.id] || r.basePrice, c = competitorPrice(r);
    return `<tr class="${flown.has(r.id) ? '' : 'dim'}"><td>${flagSvg(r.flag, 16)} ${esc(r.city)}${flown.has(r.id) ? '' : ' <small>not flown</small>'}</td><td class="num">${money(f)}</td><td class="num ${c !== undefined && c < f ? 'bad' : ''}">${c !== undefined && c !== null ? money(c) : '—'}</td><td class="num">${num(paxWant(r, f))}</td></tr>`; }).join('')}</tbody></table></section>`;
  const r = routeById(focus), F = (r && r.fares) || [], cur = r ? (pl.prices[r.id] || r.basePrice) : 0, mx = Math.max(1, ...F.map(f => paxWant(r, f))), nw = r ? newsOn(r.id, day) : [];
  const dem = `<section class="dk-pnl wr-dem"><div class="dk-pnl-h">${ICO2.people}<h2>Demand</h2><span class="grow"></span><select class="om-sel" id="wrRoute" aria-label="Route">${routes.map(x => `<option value="${x.id}" ${x.id === focus ? 'selected' : ''}>${esc(x.city)}</option>`).join('')}</select></div>
    ${r ? `<div class="wr-bars">${F.map(f => { const n = paxWant(r, f); return `<div class="wr-b ${f === cur ? 'on' : ''}"><span class="wr-n">${num(n)}</span><i style="height:${Math.round(100 * n / mx)}%"></i><span class="wr-f">${money(f)}</span></div>`; }).join('')}</div>
    <p class="wr-l">People a day who want to fly to ${esc(r.city)} at each fare. Your fare is highlighted.${nw.length ? ` <b class="good">${esc(nw[0].headline)}: ×${nw[0].mult} today.</b>` : ''}</p>` : ''}</section>`;
  const from = day - ((day - 1) % 7), heads = []; for(let d = from; d < from + 7; d++){ const c = calRow(d); ((c && c.headlines) || []).forEach(h => { if(!heads.includes(h)) heads.push(h); }); }
  if(m.headline && !heads.includes(m.headline)) heads.unshift(m.headline);
  const ann = announcedFor(day);
  const news = `<section class="dk-pnl wr-news"><div class="dk-pnl-h">${ICO2.news}<h2>Headlines</h2><span class="grow"></span><span class="sub">${fmtRange(from, from + 6)}</span></div><ul class="wr-ul">${heads.slice(0, 5).map(h => `<li>${esc(h)}</li>`).join('') || '<li class="muted">A quiet week.</li>'}</ul>
    <div class="wr-ann"><span class="kl">Announced for the next two weeks</span>${ann.length ? ann.map(x => `<p>${ICO2.calendar}<span><b>${esc(x.headline || x.id)}</b> · ${x.routes.map(id => routeById(id) ? routeById(id).city : id).join(', ')} demand ×${x.mult}${x.segment && x.segment !== 'all' ? ` (${x.segment})` : ''} · ${fmtRange(dayOfDate(x.start), dayOfDate(x.end))}${x.goodResponse ? ` <small>${esc(x.goodResponse)}</small>` : ''}</span></p>`).join('') : '<p class="muted">Nothing announced yet.</p>'}</div></section>`;
  return `<div class="wr">${fuel}${rk}${dem}${news}</div>`;
}
function renderWorldReport(){
  screen().innerHTML = shell(deskPage({ title:'World report', sub:`The week ahead: fuel, ${esc(WORLD.rival || 'Red Kite')}'s fares, demand and the news. Week ${weekNo(S.day || 1)}.`, cls:'wr-page', body:worldReportHtml() }),
    deskBar('Read the world before you plan the week: what fuel will cost, what the rival charges, and what is coming.', '<button class="btn primary big" id="wrClose">&#9664; Back</button>'));
  on('wrClose', () => { UI.view = null; render(); });
  const sel = $('wrRoute'); if(sel) sel.onchange = () => { UI.wr.route = sel.value; render(); };
}
/* the Monday plan page offers the World report (and it opens by itself the first time each Monday) */
const planWorld0 = R.plan;
R.plan = st => { const out = planWorld0(st); if(!weekMode() || UI.card || !deskMode()) return out;
  const tools = screen().querySelector('.plw-tools'); if(tools && !$('worldOpen')){ tools.insertAdjacentHTML('afterbegin', '<button class="btn small" id="worldOpen" title="Fuel, the rival\'s fares, demand and the news">World report</button>'); on('worldOpen', () => { UI.view = 'world'; render(); }); }
  return out; };
/* Network: the destinations with the rival's fares and the demand at yours */
function renderView(v){
  renderViewBase(v); if(v !== 'network' || !weekMode()) return;
  const host = screen().querySelector('.vw.net'); if(!host) return;
  const pl = currentPlan(), flown = new Set(normPlan(pl).fleet.flatMap(x => x.sched)), routes = openRoutes(S.day || 1);
  host.insertAdjacentHTML('beforeend', `<section class="hp net-dest"><div class="dk-pnl-h">${ICO2.globe}<h2>Destinations</h2><span class="grow"></span><span class="sub">fares one way · people a day at your fare</span></div><table class="dk-t"><thead><tr><th>Destination</th><th class="num">Distance</th><th class="num">Your fare</th><th class="num">${esc(WORLD.rival || 'Red Kite')}</th><th class="num">Want to fly</th><th>Flown</th></tr></thead><tbody>${routes.map(r => { const f = pl.prices[r.id] || r.basePrice, c = competitorPrice(r), can = S.fleet.some(x => planeCanFly(planeById(x.planeId), r));
    return `<tr><td>${flagSvg(r.flag, 16)} ${esc(r.city)}</td><td class="num">${num(routeKm(r))} km</td><td class="num">${money(f)}</td><td class="num">${c !== undefined && c !== null ? money(c) : '—'}</td><td class="num">${num(paxWant(r, f))}</td><td>${flown.has(r.id) ? '<b class="good">Yes</b>' : can ? 'No' : '<small>out of range</small>'}</td></tr>`; }).join('')}</tbody></table></section>`);
}
/* the review of a week or month beat names the fuel purchasing advantage and the surprises */
const reviewDesk0 = R.review;
R.review = st => { reviewDesk0(st); if(!weekMode()) return; const h = lastHist(), rv = screen().querySelector('.rv'); if(!h || !rv || h.from === undefined) return;
  const extra = (h.to - h.from >= 6 ? fuelAdvantageLine(weekNo(h.from)) : '') + surprisesLine(h.from, h.to); if(extra) rv.insertAdjacentHTML('afterbegin', `<div class="rv-desk">${extra}</div>`); };
