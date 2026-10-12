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
