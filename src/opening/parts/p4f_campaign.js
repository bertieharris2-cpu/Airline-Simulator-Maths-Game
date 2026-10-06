/* ==================================================================
   THE CAMPAIGN AFTER DAY 3 (Phases 4–7).
   4 Establish the timetable (weeks) · 5 First stable period (months, Current plan / Test plan)
   6 The first year (Run the year: annual projection, time to afford) · 7 The first aircraft purchase.
   The same HQ desktop: review → plan → forecast → launch → run → results. Routine days are simulated;
   a forecast is a dry run of the same engine, so it matches what happens to the pound.
   ================================================================== */
WS_STEPS.push('review', 'plans', 'yearPlan', 'afford', 'yearReview', 'shop', 'invest', 'purchase', 'delivery');
SHELL_STEPS.push('review', 'plans', 'yearPlan', 'afford', 'yearReview', 'shop', 'invest', 'purchase', 'delivery', 'sim', 'milestone');
Object.assign(RAIL_LABEL, { review:'Review', plans:'Current and test plan', yearPlan:'Year projection', afford:'Time to afford', yearReview:'Year 1 in figures', shop:'Aircraft', invest:'Investment', purchase:'Purchase order', delivery:'Delivery' });
Object.assign(SUB_DESC, { review:'How it went', plans:'Test a change first', yearPlan:'Where will we be in May?', afford:'When could we buy?', yearReview:'Projection against actual', shop:'What is for sale', invest:'Compare the aircraft', purchase:'Sign the order', delivery:'What happens next' });
Object.assign(STEP_HINT, {
  review:'Look at how the routes did. Only change what needs changing.',
  plans:'Change the test plan to try an idea. The current plan keeps flying unless you switch.',
  yearPlan:'Project the year: an average month, times the months left.',
  afford:'How long until each aircraft is affordable, keeping the emergency money?',
  yearReview:'Compare your projection with what actually happened.',
  shop:'The aircraft you could add. Bigger aircraft carry more people but cost more every day.',
  invest:'Work out what each aircraft would do for the airline before you decide.',
  purchase:'Check the order, then sign it.',
  delivery:'The aircraft is ordered. Commissioning it comes next.' });
Object.assign(STAGES, {
  week:[ { id:'rev', name:'Review last week', done:'Week reviewed', sub:'Route performance', steps:['review'] },
         { id:'plan', name:'Plan the week', done:'Week planned', sub:'Timetable and fuel', steps:['planner', 'fuelPlan'] },
         { id:'prep', name:'Forecast', done:'Forecast complete', sub:'Fares and forecast', steps:['options'] },
         { id:'go', name:'Launch', sub:'Run the week', steps:['ready'] } ],
  month:[ { id:'rev', name:'Review', done:'Reviewed', sub:'How last time went', steps:['review'] },
          { id:'plan', name:'Plan the month', done:'Month planned', sub:'Fuel, current and test plan', steps:['fuelPlan', 'plans'] },
          { id:'go', name:'Launch', sub:'Run the month', steps:['ready'] } ],
  year:[ { id:'rev', name:'Review', done:'Reviewed', sub:'The summer so far', steps:['review'] },
         { id:'plan', name:'Plan the year', done:'Year planned', sub:'Plan and fuel', steps:['plans', 'fuelPlan'] },
         { id:'proj', name:'Project the year', done:'Year projected', sub:'Projection and time to afford', steps:['yearPlan', 'afford'] },
         { id:'go', name:'Launch', sub:'Run the year', steps:['ready'] } ],
  buy:[ { id:'yr', name:'Year 1 review', done:'Year reviewed', sub:'Projection against actual', steps:['yearReview'] },
        { id:'pick', name:'Choose an aircraft', done:'Aircraft chosen', sub:'Shop and investment', steps:['shop', 'invest'] },
        { id:'order', name:'Order', sub:'Purchase and delivery', steps:['purchase', 'delivery'] } ] });

/* ---------- the period being planned ---------- */
function pDays(P){ P = P || S.period; return P ? P.to - P.from + 1 : 1; }
function isYearRun(){ const P = S.period; return !!(P && P.run && P.run.kind === 'until'); }
function lastHist(){ return S.history[S.history.length - 1]; }
function railKind(){
  if(S.phase === 'setup') return 'launch';
  const P = S.period, w = roundData(S.round);
  if((w.prog || 0) >= 7) return 'buy';
  if(!P || P.type === 'day') return 'day';
  if(P.type === 'review') return 'review';
  if(isYearRun()) return 'year';
  return P.type === 'month' ? 'month' : 'week';
}
function railTitle(){
  const k = railKind(), P = S.period;
  if(k === 'launch') return ['Launch Day Plan', 'Get your airline airborne'];
  if(k === 'week') return [`Week ${weekNo(P.from)} Plan`, fmtRange(P.from, P.to)];
  if(k === 'month') return [`${monthName(P.from)} Plan`, fmtRange(P.from, P.to)];
  if(k === 'year') return ['The Year Ahead', 'September 2030 – April 2031'];
  if(k === 'buy') return ['Year 1 Review', 'Time to grow?'];
  if(k === 'review') return [`Chapter ${chapterNo()} Review`, 'The accounts for the chapter'];
  return [`Day ${S.day} Plan`, "Plan and launch today's flying"];
}
function wsStatus(){ const k = railKind(), P = S.period;
  return k === 'launch' ? 'LAUNCH DAY' : k === 'week' ? `WEEK ${weekNo(P.from)}` : k === 'month' ? monthName(P.from).toUpperCase() : k === 'year' ? 'YEAR 1' : k === 'buy' ? 'YEAR 1 REVIEW' : k === 'review' ? 'CHAPTER REVIEW' : `DAY ${S.day}`; }
function PW(){
  const P = S.period, t = P && S.phase === 'round' ? P.type : 'day';
  if(t === 'week') return { now:'this week', poss:"This week's", the:"this week's", span:'week' };
  if(t === 'gap') return { now:'Friday to Sunday', poss:"These three days'", the:"these three days'", span:'gap' };
  if(t === 'month'){ const m = monthName(P.from); return { now:`in ${m}`, poss:`${m}'s`, the:`${m}'s`, span:'month' }; }
  return { now:'today', poss:"Today's", the:"today's", span:'day' };
}
function periodNeed(){ return fuelNeeded() * (PW().span === 'day' ? 1 : pDays()); }
function fcKey(pl){ return PW().span === 'day' ? planKey(pl) : planKey(pl) + '|' + orderL() + '|' + S.period.from; }
function editStep(what){
  const k = railKind();
  if(k === 'week') return what === 'timetable' || what === 'extras' ? 'planner' : 'options';
  if(k === 'month' || k === 'year') return what === 'forecast' && k === 'year' ? 'yearPlan' : 'plans';
  const setup = S.phase === 'setup'; return what === 'timetable' ? (setup ? 'timetable' : 'planner') : what === 'extras' ? 'planner' : 'options';
}
function goWord(){ const k = railKind(); return k === 'week' ? 'SEND THE WEEK TO OPERATIONS' : k === 'month' ? `RUN ${monthName(S.period.from).toUpperCase()}` : k === 'year' ? 'RUN THE YEAR' : 'SEND TO OPERATIONS WALL'; }
function closeWord(){ const k = railKind(), P = S.period; if(S.rnd.saving) return 'Back to the aircraft'; return P && P.type === 'gap' ? 'Plan Week 1' : k === 'week' ? 'Close the week' : k === 'month' ? 'Close the month' : k === 'year' ? 'Go to the Year 1 review' : 'Close the day'; }
function planWord(){ const k = railKind(); return k === 'week' ? 'Plan the week' : k === 'month' ? `Plan ${monthName(S.period.from)}` : k === 'year' ? 'Plan the year' : "Plan today's operation"; }
function readyTitle(){ const k = railKind(), P = S.period; return k === 'week' ? `Ready for Week ${weekNo(P.from)}` : k === 'month' ? `Ready for ${monthName(P.from)}` : k === 'year' ? 'Ready to run the year' : S.phase === 'setup' ? 'Ready for launch' : `Ready for Day ${S.day}`; }
function beatLabel(i){ if(!i) return 'Launch'; if(i <= 4) return 'Day ' + i; const t = periodOf(i), d = beatDay(i); return t === 'gap' ? 'Fri–Sun' : t === 'week' ? 'Week ' + weekNo(d) : monthName(d, true); }
function periodShort(h){ if(!h || h.type === 'setup' || h.from === 0) return 'launch day'; if(h.type === 'day') return dateShort(h.from); if(h.type === 'week') return 'Week ' + weekNo(h.from); if(h.type === 'gap') return `${fmtRange(h.from, h.to)}`; return isMonthSpan(h.from, h.to) || monthStart(h.from) === monthStart(h.to) ? monthName(h.from) : `${monthName(h.from, true)}–${monthName(h.to, true)}`; }
function profitLabel(h){ if(!h) return "Yesterday's profit"; if(h.type === 'setup' || h.from === 0) return 'Launch day profit'; if(h.type === 'day') return h.to === S.day - 1 ? "Yesterday's profit" : `${dayName(h.from)}'s profit`; return `Profit · ${periodShort(h)}`; }
function campaignSummary(id){
  const h = lastHist();
  if(id === 'rev') return h ? `${periodShort(h)} · profit ${money(Math.round(h.profit))}` : '';
  if(id === 'proj') return S.rnd.yearProj ? `Cash about ${money(S.rnd.yearProj.cashEnd)} by May` : '';
  if(id === 'yr') return S.rnd.yrDiff !== undefined ? `${S.rnd.yrDiff >= 0 ? 'Better' : 'Worse'} than projected by ${money(Math.abs(S.rnd.yrDiff))}` : '';
  if(id === 'pick') return S.rnd.buyId ? planeById(S.rnd.buyId).name : '';
  return '';
}

/* ---------- moving through the story ---------- */
function startBeat(b){
  const w = roundData(b), last = S.period && S.phase === 'round' ? S.period.to : S.day;
  S.round = b; S.phase = 'round'; delete S.needsRestart;
  S.day = Math.max(beatDay(b), (last || 0) + 1);
  S.period = newPeriod(w.period === 'gap' ? 'gap' : w.period, S.day);
  if(w.until) S.period.run = { kind:'until', to: dayOfDate(w.until) };
  const keep = { featured:S.rnd.featured, focusRoute:S.rnd.focusRoute, avgMonth:S.rnd.avgMonth, yearProj:S.rnd.yearProj, affordEst:S.rnd.affordEst, yearVs:S.rnd.vs && S.rnd.vs.kind === 'year' ? S.rnd.vs : S.rnd.yearVs };
  S.fleet.forEach(f => { f.grounded = false; });
  if((w.period === 'week' || w.period === 'gap') && typeof returnTankFuel === 'function') returnTankFuel();
  S.rnd = Object.assign(emptyRnd(), keep, { headline: w.headline || '', brief: periodBrief() });
  S.rnd.cashStart = S.cash; S.rnd.fuelStart = S.fuel;
  S.steps = stepsFor(b); S.si = 0; S.newRoutes = []; UI.view = null;
  refreshPlan(); addNews((w.news || []).slice(0, 2).map(t => ({ tag:'NEWS', text:t })));
  publish(); render();
}
function stepsFor(b){
  const w = roundData(b), st = w.stage ? [{ t:'milestone', stage:w.stage }] : [], L = a => withIntro(st.concat(a.map(t => ({ t }))), w);
  if(w.period === 'gap') return L(['sim', 'results']);
  if(w.period === 'week') return L((w.noReview ? ['hq'] : ['hq', 'review']).concat(['planner', 'costPlan', 'testIdeas', 'ready', 'sim', 'results']));
  if(w.until) return L(['hq', 'review', 'plans', 'fuelPlan', 'yearPlan', 'afford', 'ready', 'sim', 'results']);
  if(w.period === 'month') return L(['hq', 'review', 'fuelPlan', 'plans', 'ready', 'sim', 'results']);
  return L(['yearReview', 'strategy', 'shop', 'invest', 'purchase', 'delivery', 'protoEnd']);
}
function periodBrief(){
  const h = lastHist(); if(!h) return [];
  const L = [`${capFirst(periodShort(h))}: ${num(h.pax)} passengers flew, ${h.profit >= 0 ? 'profit' : 'loss'} ${money(Math.round(Math.abs(h.profit)))}.`];
  const fp = fuelPrice(), fy = fuelPrice(Math.max(0, S.round - 1)); if(fp !== fy) L.push(`Fuel is ${priceL(fp)} a litre (was ${priceL(fy)}).`);
  return L;
}
function closeDay(){
  UI.view = null; UI.fbI = 0;
  if(S.phase === 'setup'){ startProtoDay(1); return; }
  if(S.round < 3 && periodType() === 'day'){ startProtoDay(S.round + 1); return; }
  if(S.rnd.saving){ keepSavingDone(); return; }
  const nb = S.round === 3 ? 4 : beatStartingOn(S.period.to + 1);
  if(nb === null){ S.steps.push({ t:'protoEnd' }); next(); return; }
  startBeat(nb);
}

/* ---------- the engine: routine days with the opening's economy ---------- */
let QUIET = false;
/* Try something on a copy of the airline: nothing real changes. */
function dryRun(fn){ const keep = S, q = QUIET; S = JSON.parse(JSON.stringify(S)); QUIET = true; try{ return fn(); } finally { S = keep; QUIET = q; } }
function simulateDays(a, b, o){
  o = o || {}; const auto = o.auto !== false;
  const out = { from:a, to:b, rev:0, run:0, extra:0, fuelUsed:0, over:0, autoL:0, autoCost:0, pax:0, seats:0, trips:0, cancelled:0, routes:{}, planes:{}, days:[] };
  for(let d = a; d <= b; d++){
    const beat = beatAt(d), fl = withDay(d, () => withBeat(beat, () => planFlights())).sort((x, y) => x.dep - y.dep), want = {};
    fl.forEach(f => { if(!f.grounded && want[f.route] === undefined) want[f.route] = withDay(d, () => withBeat(beat, () => paxWant(routeById(f.route), f.price))); });
    let rev = 0, run = 0, fuel = 0, pax = 0, seats = 0;
    fl.forEach(f => {
      if(f.grounded) return;
      if(fuelContract()){   // the weeks: fuel bought as it is used, at that week's price
        const fc = r2(f.fuelL * withBeat(beat, () => fuelPrice()));
        S.cash = r2(S.cash - fc);
        rev += f.revenue; run += f.runCost; fuel += fc; pax += f.sold; seats += f.seats; out.trips++;
        const x = out.routes[f.route] || (out.routes[f.route] = { pax:0, seats:0, rev:0, cost:0, trips:0, fare:f.price, want:0 });
        x.pax += f.sold; x.seats += f.seats; x.rev += f.revenue; x.cost = r2(x.cost + f.runCost + fc + (f.termCost || 0)); x.trips++;
        return;
      }
      if(S.fuel + 1e-9 < f.fuelL){
        if(!auto){ f.noFuel = true; return; }
        const space = tankSpace(), L = Math.min(Math.max(ceilLot(f.fuelL - S.fuel), f.fuelL - S.fuel), space || f.fuelL), ppl = r2(withBeat(beat, () => fuelPrice()) + (WORLD.fuelTopUp || 0)), bill = r2(L * ppl);
        fuelLots().push({ L, p:ppl }); S.fuel = r2(S.fuel + L); S.fuelValue = r2(S.fuelValue + bill); S.cash = r2(S.cash - bill); out.autoL += L; out.autoCost = r2(out.autoCost + bill);
      }
      const fc = consumeFuel(f.fuelL);
      rev += f.revenue; run += f.runCost; fuel += fc; pax += f.sold; seats += f.seats; out.trips++;
      const x = out.routes[f.route] || (out.routes[f.route] = { pax:0, seats:0, rev:0, cost:0, trips:0, fare:f.price, want:0 });
      x.pax += f.sold; x.seats += f.seats; x.rev += f.revenue; x.cost = r2(x.cost + f.runCost + fc + (f.termCost || 0)); x.trips++;
    });
    Object.keys(want).forEach(id => { if(out.routes[id]) out.routes[id].want += want[id]; });
    const X = withDay(d, () => withBeat(beat, () => dayExtras(fl))), extra = X.term + X.obCost + X.crew, over = fleetDayCost();
    Object.keys(X.byRoute || {}).forEach(id => { const x = out.routes[id], y = X.byRoute[id]; if(x){ x.rev += y.obRev; x.cost = r2(x.cost + y.obCost); } });
    S.cash = r2(S.cash + rev + X.obRev - run - over - extra); if(typeof payFinanceDay === 'function') payFinanceDay();
    const dayRev = rev + X.obRev, dayCost = r2(run + fuel + over + extra);
    ledgerPut(d, dayRev, dayCost, pax, seats);
    out.rev += dayRev; out.run += run; out.extra += extra; out.fuelUsed = r2(out.fuelUsed + fuel); out.over += over; out.pax += pax; out.seats += seats; out.days.push(r2(dayRev - dayCost));
    if(S.cash < 0) bankCheck();
  }
  Object.keys(out.routes).forEach(id => { const x = out.routes[id]; x.rev = r2(x.rev); x.profit = r2(x.rev - x.cost); });
  out.rev = r2(out.rev); out.costs = r2(out.run + out.extra + out.fuelUsed + out.over); out.profit = r2(out.rev - out.costs);
  out.cashEnd = S.cash; out.fuelEnd = S.fuel; out.fuelStock = S.fuelValue;
  return out;
}
/* One period, the year (until a date), or month by month until an aircraft is affordable. */
function simulateRun(){
  const P = S.period, run = P.run || { kind:'one' }, parts = [];
  let d = P.from;
  for(let k = 0; k < 36; k++){
    const nb = nextBeat(d), end = P.type === 'month' ? Math.min(monthEnd(d), nb === null ? Infinity : beatDay(nb) - 1) : P.to;
    const part = simulateDays(d, end); part.label = P.type === 'month' ? monthName(d, true) : null; parts.push(part);
    S.disrupt = null; d = end + 1;
    if(P.type !== 'month') break;
    const more = run.kind === 'until' ? d <= run.to : run.kind === 'afford' ? parts.length < 36 && investable() < planeById(run.target).price : run.kind === 'n' ? parts.length < run.n : false;
    if(!more) break;
    const bi = beatStartingOn(d); if(bi !== null && !QUIET) addNews((WORLD.rounds[bi].news || []).slice(0, 1).map(t => ({ tag:'NEWS', text:t, round:bi })));
  }
  P.to = d - 1;
  const T = { from:P.from, to:P.to, parts, rev:0, costs:0, profit:0, pax:0, seats:0, trips:0, over:0, autoL:0, autoCost:0, fuelUsed:0, cancelled:0, routes:{}, planes:{} };
  parts.forEach(p => { ['rev', 'costs', 'pax', 'seats', 'trips', 'over', 'autoL', 'autoCost', 'fuelUsed', 'cancelled'].forEach(k => { T[k] = r2(T[k] + p[k]); });
    Object.keys(p.routes).forEach(id => { const x = p.routes[id], y = T.routes[id] || (T.routes[id] = { pax:0, seats:0, rev:0, cost:0, trips:0, fare:x.fare, want:0 }); y.pax += x.pax; y.seats += x.seats; y.want += x.want; y.rev = r2(y.rev + x.rev); y.cost = r2(y.cost + x.cost); y.trips += x.trips; y.fare = x.fare; }); });
  // a week or a month is reported in whole pounds
  ['rev', 'costs', 'over', 'autoCost', 'fuelUsed'].forEach(k => { T[k] = Math.round(T[k]); });
  Object.keys(T.routes).forEach(id => { const y = T.routes[id]; y.rev = Math.round(y.rev); y.cost = Math.round(y.cost); y.profit = y.rev - y.cost; });
  parts.forEach(p => { p.rev = Math.round(p.rev); p.costs = Math.round(p.costs); p.profit = p.rev - p.costs; });
  T.profit = T.rev - T.costs; T.days = parts.reduce((a, p) => a.concat(p.days), []);
  return T;
}
/* After a run: reputation once, the forecast check, one history line per week or month. */
function applyPeriodResults(){
  if(S.rnd.applied) return; S.rnd.applied = true;
  const T = S.rnd.sim, P = S.period, why = S.rnd.why, tags = [], repBefore = S.rep;
  S.rnd.revenue = T.rev; S.rnd.costs = T.costs; S.rnd.profit = T.profit;
  const fr = focusRoute() || (ownedRoutes()[0] && routeById(ownedRoutes()[0]));
  if(fr){ const fare = fareOf(fr.id), x = T.routes[fr.id];
    if(x && x.pax >= x.seats) tags.push('full'); else if(x && x.seats && x.pax / x.seats < 0.5) tags.push('empty');
    if(repLive() && fare >= fr.basePrice + 2 * fr.step){ S.rep -= 0.5; why.push({ ic:'⭐', text:`${money(fare)} is a high fare for ${fr.city}. Reviews say so: −½ star.` }); tags.push('price_bad'); }
    else if(repLive() && fare <= fr.basePrice - fr.step){ S.rep += 0.5; why.push({ ic:'⭐', text:`${money(fare)} is a great fare for ${fr.city}. Happy passengers: +½ star.` }); tags.push('price_good'); }
    else tags.push('price_fair'); }
  if(repLive() && onboardOf().free && S.rep < 4){ S.rep += 0.5; why.push({ ic:'⭐', text:'Free snacks and drinks went down well: +½ star.' }); }
  if(!tags.includes('price_bad')) tags.push('smooth');
  S.rep = clamp(Math.round(S.rep * 2) / 2, 1, 5); S.rnd.repDelta = S.rep - repBefore;
  if(T.autoL) why.push({ ic:'⛽', text:`The tank ran low, so ${num(T.autoL)} L were delivered at the market price plus ${priceL(WORLD.fuelTopUp || 0)} a litre: ${money(T.autoCost)}.` });
  const fc = S.rnd.myForecast;
  if(isYearRun()) S.rnd.vs = yearVs(T);
  else if(fc) S.rnd.vs = { kind:'period', expProfit:fc.profit, gotProfit:T.profit, expFuel:fc.fuel, gotFuel:T.fuelUsed };
  const F = { route: fr ? fr.id : null, price: fr ? fareOf(fr.id) : 0, sold: fr && T.routes[fr.id] ? T.routes[fr.id].pax : 0 }; S.rnd.reviews = tags.slice(0, 3).map(t => pickReview(t, F)).filter(Boolean);
  T.parts.forEach(p => S.history.push({ round:S.round, type: P.type, from:p.from, to:p.to, revenue:p.rev, costs:p.costs, profit:p.profit, cash:p.cashEnd, rep:S.rep, pax:p.pax, seats:p.seats, trips:p.trips,
    routes:Object.fromEntries(Object.keys(p.routes).map(id => [id, Object.assign({}, p.routes[id], { rev:Math.round(p.routes[id].rev), cost:Math.round(p.routes[id].cost), profit:Math.round(p.routes[id].profit) })])), fuelL:p.fuelEnd, fuelStock:p.fuelStock, over:p.over }));
  if(S.history.length > 160) S.history = S.history.slice(-160);
  addNews([{ tag:'£', text:`${S.airline.name}: ${T.profit >= 0 ? 'profit' : 'loss'} of ${money(Math.abs(T.profit))} ${isYearRun() ? 'from September to April' : 'in ' + periodShort(lastHist())}.`, cls: T.profit >= 0 ? 'good' : 'warn' }]);
  checkMilestones();
}

/* ---------- the forecast for a week or a month: a dry run of the real engine ---------- */
const PL_CACHE = new Map();
function applyPlanRaw(pl){ const f = fleetOne(); if(f){ f.schedule = pl.sched.slice(); f.route = pl.sched[0] || null; } S.prices = Object.assign({}, S.prices, pl.prices); S.firstDep = pl.firstDep; S.onboard = pl.onboard; S.deps = pl.deps ? pl.deps.slice() : null; }
function periodLabels(){ const W = PW(); return { rev:`Revenue ${W.now}`, ops:`Running costs ${W.now}`, fuel:`Fuel used ${W.now}` }; }
function periodLines(pl){
  const P = S.period, key = [planKey(pl), orderL(), P.from, P.to, S.rep, S.fuel, r2(S.fuelValue), S.round, (S.fuelLots || []).length].join('|');
  if(PL_CACHE.has(key)) return PL_CACHE.get(key);
  const L = planLines(pl);
  const T = dryRun(() => { applyPlanRaw(pl); const o = S.rnd.fuelOrder; if(o){ buyFuel(o.litres, o.price); S.rnd.fuelOrder = null; } return simulateDays(P.from, P.to); });
  const days = P.to - P.from + 1, v = L.v, opsDay = v.cost - v.fuel, fuel = Math.round(T.fuelUsed);
  const w = Object.assign({}, v, { revDay:v.rev, days, rev:v.rev * days, opsDay, ops:opsDay * days, fuel, cost:opsDay * days + fuel, profit:v.rev * days - opsDay * days - fuel, base:0, diff:0, diffL:0 });
  const parts = { opsDay:[['Flights', money(v.run)], ['Terminal charges', money(v.term)]].concat(v.stock ? [['Snack stock', money(v.stock)]] : []).concat(v.crew ? [['Second crew', money(v.crew)]] : []).concat([["Aircraft's day", money(v.day)]]) };
  const out = Object.assign({}, L, { v:w, parts, autoL:T.autoL, autoCost:T.autoCost, exactRev:T.rev, exactCost:Math.round(T.costs) });
  if(PL_CACHE.size > 200) PL_CACHE.clear(); PL_CACHE.set(key, out);
  return out;
}

/* ---------- milestones: the story moves on ---------- */
const MILESTONES = {
  routine:{ kicker:'Phase 4 · Establish the timetable', title:'Your timetable repeats', lines:[
    'From today your timetable runs every day by itself: the same services, the same fares. You no longer rebuild it each morning.',
    'If the tank runs low, fuel is delivered automatically at the market price plus 10p a litre. Ordering ahead is cheaper.',
    'Watch Thursday to Sunday run, then you will plan the airline <b>one week at a time</b>.'], go:'Run Thursday to Sunday' },
  stable:{ kicker:'Phase 5 · A stable airline', title:'The airline runs month by month', lines:[
    'The airline has a regular schedule and passengers know it. You no longer need to manage every flight.',
    'Each month you will look at the figures, try changes on a <b>test plan</b>, and only switch when the figures say it is better.'], go:'Go to HQ' },
  year:{ kicker:'Phase 6 · The first year', title:'Where will the airline be next May?', lines:[
    'Routine flying builds up cash. Before running the rest of the year, you will project where the airline will be in May.',
    'The next aircraft costs a lot more than the Twin Otter. When could you afford one, and still keep money back for emergencies?'], go:'Go to HQ' },
  review:{ kicker:'Phase 7 · Time zooms back in', title:'One year of flying', lines:[
    'The airline has been flying for a year. Time slows down again: there is a big decision to make.',
    'First, compare your projection with what actually happened. Then look at the aircraft you could add.'], go:'Review Year 1' } };
R.milestone = st => {
  const M = MILESTONES[st.stage] || MILESTONES.routine, online = TOOLS.filter(T => toolMet(T.id) && toolLevel(T.id) === 'model');
  screen().innerHTML = shell(`<div class="hp milestone">${hqHead(M.kicker, wsStatus())}<div class="ms-in"><span class="label">Milestone</span><h1>${M.title}</h1>${M.lines.map(l => `<p>${l}</p>`).join('')}
    ${online.length ? `<div class="ms-models"><span class="label">Models online</span>${online.map(T => `<span class="ms-m">${esc(T.name)}</span>`).join('')}</div>` : ''}
    <button class="btn primary big" id="msGo">${M.go} &#9654;</button></div></div>`);
  on('msGo', () => { UI.view = null; next(); });
};

/* ---------- review: how did it go, and one figure to work out ---------- */
function reviewSpec(){
  const H = S.history.filter(x => x.type !== 'setup'), h = H[H.length - 1], b = S.round, wk = H.filter(x => x.type === 'week'), mo = H.filter(x => x.type === 'month');
  if(b === 7 || b === 8){ const a = wk[wk.length - 2], c = wk[wk.length - 1]; if(!a || !c) return null; const up = c.profit >= a.profit;
    return { title:'How much did weekly profit change?', col:periodShort(c), rows:['prev', 'last', up ? 'rise' : 'fall'], values:{ prev:a.profit, last:c.profit, rise:c.profit - a.profit, fall:a.profit - c.profit }, labels:{ prev:`Profit in ${periodShort(a)}`, last:`Profit in ${periodShort(c)}` } }; }
  if(b === 9 && wk.length >= 3){ const w3 = wk.slice(-3), tot = w3.reduce((t, x) => t + x.profit, 0);
    return { title:'What is the average profit a week?', col:'Weeks', rows:['total', 'n', 'avg'], values:{ total:tot, n:3, avg:Math.round(tot / 3) }, labels:{ total:'Total profit, three weeks', n:'Weeks', avg:'Average profit a week' }, parts:{ total:w3.map(x => [periodShort(x), money(x.profit)]) } }; }
  if((b === 10 || b === 11) && h && h.type === 'month'){ const n = h.to - h.from + 1;
    return { title:'What is the average profit a day?', col:periodShort(h), rows:['total', 'n', 'avg'], values:{ total:h.profit, n, avg:Math.round(h.profit / n) }, labels:{ total:`Profit in ${periodShort(h)} (${fmtRange(h.from, h.to)})`, n:'Days', avg:'Average profit a day' } }; }
  if(b === 12 && mo.length >= 2){ const m2 = mo.slice(-2), tot = m2.reduce((t, x) => t + x.profit, 0);
    return { title:'What is the average profit a month?', col:'July and August', rows:['total', 'n', 'avg'], values:{ total:tot, n:2, avg:Math.round(tot / 2) }, labels:{ total:'Total profit, July and August', n:'Months', avg:'Average profit a month' }, parts:{ total:m2.map(x => [periodShort(x), money(x.profit)]) }, keepAvg:true }; }
  return null;
}
function trendHtml(){
  const H = S.history.filter(x => x.type !== 'setup' && x.type !== 'day').slice(-8);
  if(!H.length) return '<p class="muted">The trend starts after the first routine days.</p>';
  const mx = Math.max(1, ...H.map(x => Math.abs(x.profit / (x.to - x.from + 1))));
  return `<div class="trend">${H.map(x => { const n = x.to - x.from + 1, a = Math.round(x.profit / n);
    return `<div class="tr-r"><span>${esc(capFirst(periodShort(x)))}</span><i class="${a < 0 ? 'neg' : ''}" style="width:${(100 * Math.abs(a) / mx).toFixed(1)}%"></i><b class="mono">${money(Math.round(x.profit))}</b><small class="mono">${money(a)} a day</small></div>`; }).join('')}</div>`;
}
R.review = () => {
  const h = lastHist(), spec = reviewSpec();
  let t = null, done = true;
  if(spec){ const prev = S.rnd.tables['rev:' + S.round];
    t = ensureTable('rev:' + S.round, 'review2', [{ id:'r', label:spec.col, values:spec.values, parts:spec.parts }], { rowIds:spec.rows, labels:spec.labels });
    if(t !== prev) t.active = null; done = tableComplete(t); if(spec.keepAvg) S.rnd.avgMonth = spec.values.avg; }
  const H = S.history.filter(x => x.type !== 'setup');
  screen().innerHTML = taskFrame({ question:`How did ${periodShort(h)} go?`, work: !!t, calc:t,
    say:`Here is how ${periodShort(h)} went. ${spec ? spec.title : ''}`,
    context:{ title:'Trend', html: cxSec('Profit by period', trendHtml()) + (H.length ? cxSec('Last period', kv([['Passengers', `<span class="mono">${num(h.pax)}</span>`], ['Seats filled', `<span class="mono">${h.seats ? Math.round(100 * h.pax / h.seats) : 0}%</span>`], ['Profit', `<span class="mono ${h.profit >= 0 ? 'green' : 'red'}">${money(Math.round(h.profit))}</span>`]])) : '') },
    main:`<div class="rv"><section class="pnl"><div class="pnl-h"><h3>Route performance · ${esc(periodShort(h))}</h3><span class="muted">${h ? fmtRange(h.from, h.to) : ''}</span></div>${evidenceHtml(h, ownedRoutes())}</section>
      ${t ? `<section class="pnl"><div class="pnl-h"><h3>${esc(spec.title)}</h3></div><div class="sheet1">${tableHtml(t)}</div></section>` : ''}</div>`,
    foot:`<button class="btn primary big" id="nx" ${done ? '' : 'disabled'}>${goLabel(done ? 'Continue' : 'Complete the figure first')} &#9654;</button>` });
  if(t) bindTable(t);
  on('nx', () => { resetEntry(); UI.justDone = null; advance(); });
};

/* ---------- the run: the HQ while routine days go by ---------- */
let simLoop = null;
function simCard(){
  if(S.rnd.live) return liveCard();
  const T = S.rnd.sim, f = fleetOne(), sched = f ? schedOf(f) : [];
  return `${hqHead('Operations', 'RUNNING')}<div class="pb td2"><div class="live-clock"><span class="kl">Date</span><b id="simDate">${T ? dateShort(T.from) : ''}</b></div><div class="live-bar"><i id="simProg"></i></div>
    ${T && T.parts.length > 1 ? `<div class="sim-chips">${T.parts.map((p, i) => `<span data-sc="${i}">${esc(p.label)}</span>`).join('')}</div>` : ''}
    <p class="muted">${esc(svcLabel(sched))} every day · ${T ? fmtRange(T.from, T.to) : ''}</p>
    <div class="sim-sum"><span class="kl">Profit so far</span><b id="simProfit" class="mono">£0</b></div>
    <div class="td-act"><button class="btn" id="skipSim">Skip to the end ▶</button></div></div>`;
}
R.sim = st => {
  renderOverview('sim');
  const a = S.rnd.simAnim, T = S.rnd.sim;
  if(!a || !T){ setTimeout(() => { if(step() === st) next(); }, 300); return; }
  on('skipSim', () => { a.start = Date.now() - a.dur; });
  if(simLoop === st) return; simLoop = st;
  const tick = () => {
    if(step() !== st){ simLoop = null; return; }
    const p = clamp((Date.now() - a.start) / a.dur, 0, 1), n = T.days.length, k = Math.round(p * n), sum = T.days.slice(0, k).reduce((x, y) => x + y, 0);
    const dd = $('simDate'); if(dd) dd.textContent = dateShort(Math.min(T.to, T.from + Math.max(0, k - 1)));
    const pr = $('simProg'); if(pr) pr.style.width = (p * 100).toFixed(1) + '%';
    const sp = $('simProfit'); if(sp){ sp.textContent = money(Math.round(sum)); sp.className = 'mono ' + (sum >= 0 ? 'green' : 'red'); }
    let acc = 0; T.parts.forEach((q, i) => { acc += q.days.length; const c = screen().querySelector(`[data-sc="${i}"]`); if(c) c.classList.toggle('on', k >= acc); });
    if(p < 1) requestAnimationFrame(tick); else { simLoop = null; setTimeout(() => { if(step() === st) next(); }, 700); }
  };
  requestAnimationFrame(tick);
};
/* The results of a week, a month or the year, on the Overview. */
function periodResultsCard(){
  const T = S.rnd.sim, vs = S.rnd.vs, pr = T.profit, yr = isYearRun(), h = lastHist();
  const fcLine = vs && vs.kind === 'period' ? `<p class="dr-fc">Your forecast: ${money(vs.expProfit)} · actual: ${money(vs.gotProfit)} ${Math.abs(vs.expProfit - vs.gotProfit) < 1 ? '<span class="green">✓ as forecast</span>' : `<span class="orange">${vs.gotProfit > vs.expProfit ? '+' : '−'}${money(Math.abs(vs.gotProfit - vs.expProfit))}</span>`}</p>` : '';
  const chips = T.parts.length > 1 && T.parts.length <= 8 ? `<div class="sim-chips res ${T.parts.length > 6 ? 'y8' : ''}">${T.parts.map(p => `<span class="on"><b>${esc(p.label)}</b><i class="mono ${p.profit >= 0 ? 'green' : 'red'}">${money(p.profit)}</i></span>`).join('')}</div>` : '';
  const bought = r2(S.cash - S.rnd.cashStart - pr);
  return `${hqHead(yr ? 'The Year So Far' : `${capFirst(periodShort(h))} Results`, 'ALL LANDED')}<div class="pb td2 dr">
    <div class="dr-rcp"><div class="rev"><span class="kl">Revenue</span><b>${money(T.rev)}</b></div><i>−</i><div class="cost"><span class="kl">Costs</span><b>${money(T.costs)}</b></div><i>=</i>
      <div class="prof ${pr < 0 ? 'neg' : ''}"><span class="kl">${pr >= 0 ? 'Profit' : 'Loss'}</span><b>${money(Math.abs(pr))}</b></div></div>
    ${fcLine}${yr ? yearResultLines() : ''}${savedLine()}${chips}
    ${yr ? `<p class="dr-cash">Cash now <b>${money(Math.round(S.cash))}</b></p>` : ''}<p class="dr-cash" ${yr ? 'hidden' : ''}>Profit <b>${money(pr)}</b>${Math.abs(bought) >= 1 ? ` · fuel stock bought or used up: ${bought < 0 ? '−' : '+'}${money(Math.abs(Math.round(bought)))}` : ''} · cash now <b>${money(Math.round(S.cash))}</b></p>
    ${yr ? '' : `<div class="dr-routes">${Object.keys(T.routes).map(id => { const x = T.routes[id], miss = Math.max(0, (x.want || x.pax) - x.pax); return `<span>${flagSvg(routeById(id).flag, 16)} <b>${esc(routeById(id).city)}</b> ${num(x.want)} wanted · ${num(x.pax)} flew · <span class="${miss ? 'orange' : ''}">${num(miss)} no seat</span></span>`; }).join('')}</div>`}
    <div class="td-act"><span class="grow"></span><button class="btn primary act" id="nx">${closeWord()} ▶</button></div></div>`;
}

/* ==================================================================
   PHASE 5: CURRENT PLAN | TEST PLAN. The current plan keeps flying; the test plan is a copy to try ideas on.
   The models work out both; he works out the difference, then keeps or switches.
   ================================================================== */
function testPlan(){ if(!S.rnd.test) S.rnd.test = currentPlan(); return S.rnd.test; }
function planSummaryHtml(pl, L){
  const c = serviceCounts(pl.sched), ob = { none:'None', low:'£3', high:'£5', sell3:'£3', sell5:'£5', free:'Free' }[pl.onboard] || 'None';
  const row = (l, v) => `<div class="oc-r ro"><span class="oc-l">${l}</span><i></i><span class="oc-v">${v}</span><i></i></div>`;
  return `<div class="oc">${Object.keys(c).map(id => { const r = routeById(id); return row(`${flagSvg(r.flag, 14)} ${({ par:'CDG', dub:'DUB' })[id] || esc(r.city)}`, '×' + c[id]) + row('Fare', money(pl.prices[id] || r.basePrice)); }).join('')}
    ${row('Snacks', ob)}${row('From', fmtTime(pl.firstDep))}
    ${miniBar(L.D)}<div class="oc-i"><span>${L.pax} fly a day · <span class="${L.nos ? 'orange' : ''}">${L.nos} no seat</span></span><span>free ${L.end ? fmtTime(L.end) : '—'} · ${L.crews} crew${L.crews > 1 ? 's' : ''}</span></div></div>`;
}
R.plans = () => {
  const cur = currentPlan(), test = testPlan(), same = planKey(cur) === planKey(test), Lc = periodLines(cur), Lt = periodLines(test), up = Lt.v.profit >= Lc.v.profit, W = PW();
  const rowIds = ['revDay', 'days', 'rev', 'opsDay', 'ops', 'fuel', 'cost', 'profit'].concat(same ? [] : ['base', up ? 'diff' : 'diffL']);
  const all = Object.fromEntries(rowIds.map(r => [r, true]));
  const cols = [{ id:'cur', label:'Current plan', sub:'Flying now', values:Object.assign({}, Lc.v, { base:Lc.v.profit, diff:0, diffL:0 }), parts:Lc.parts, headHtml:planSummaryHtml(cur, Lc), auto:{ base:true, diff:true, diffL:true } },
    { id:'test', label:'Test plan', sub: same ? 'Same as the current plan' : 'Your change', values:Object.assign({}, Lt.v, { base:Lc.v.profit, diff:Lt.v.profit - Lc.v.profit, diffL:Lc.v.profit - Lt.v.profit }), parts:Lt.parts, headHtml:planControls(9, test, Lt, null), auto: same ? all : null }];
  const tid = 'plans:' + S.day, prev = S.rnd.tables[tid];
  const t = ensureTable(tid, 'periodPlan2', cols, { rowIds, labels:periodLabels() }); if(t !== prev && !(prev && prev.active)) t.active = null;
  const done = tableComplete(t), d = Lt.v.profit - Lc.v.profit;
  const ctx = cxSec('The two plans', kv([['Current plan', `<span class="mono">${money(Lc.v.profit)}</span><small>profit ${W.now}</small>`], ['Test plan', same ? '<span class="muted">Not changed yet</span>' : `<span class="mono">${money(Lt.v.profit)}</span><small>profit ${W.now}</small>`],
      !same && done ? ['Difference', `<span class="mono ${d >= 0 ? 'green' : 'red'}">${d >= 0 ? '+' : '−'}${money(Math.abs(d))}</span>`, 'tot'] : null])) +
    `<div class="pl-choose"><button class="btn ${same || !done || d < 0 ? 'primary' : ''}" data-keep>${goLabel('Keep the current plan')} &#9654;</button><button class="btn ${!same && done && d >= 0 ? 'primary' : ''}" data-switch ${!same && done ? '' : 'disabled'}>Switch to the test plan &#9654;</button>${same ? '' : '<button class="link" data-reset>Reset the test plan</button>'}</div>
    <p class="muted cx-note">${same ? 'Change the test plan (fares, services, snacks, first departure) to try an idea. The current plan keeps flying unless you switch.' : done ? 'Bigger profit is not the only thing: think about passengers left without a seat.' : 'Work out the difference between the plans first.'}</p>`;
  screen().innerHTML = taskFrame({ question:`Current plan or test plan ${W.now}?`, work: !same, calc:t,
    story: progress() < 5.1 ? ['The current plan keeps flying unless you switch. Change the test plan to try an idea: the models work out both.'] : [],
    say:'Compare the current plan with a test plan. Only switch when the figures say the test plan is better.',
    context:{ title:'Current or test?', html:ctx }, main:`<div class="opts-wrap plans2">${tableHtml(t)}</div>` });
  bindTable(t);
  screen().querySelectorAll('[data-oc]').forEach(b => b.onclick = e => { e.stopPropagation(); const [i, what, id, dd] = b.getAttribute('data-oc').split('|'); changePlan(9, id !== undefined && what !== 'dep' ? what + '|' + id : what, +(dd === undefined ? id : dd)); });
  screen().querySelectorAll('[data-ocs]').forEach(x => x.onchange = () => { const pl = JSON.parse(JSON.stringify(testPlan())); pl.onboard = x.value; setPlan(9, pl); });
  const choose = useTest => { const L = useTest ? Lt : Lc; if(useTest){ const pl = test; S.rnd.test = null; setPlan(0, pl); }
    S.rnd.myForecast = { profit:L.v.profit, revenue:L.v.rev, ops:L.v.ops, fuel:L.v.fuel, plan: useTest ? 'Test plan' : 'Current plan', key:fcKey(currentPlan()) }; S.rnd.test = null; resetEntry(); UI.justDone = null; advance(); };
  screen().querySelectorAll('[data-keep]').forEach(b => b.onclick = () => choose(false));
  screen().querySelectorAll('[data-switch]').forEach(b => b.onclick = () => choose(true));
  screen().querySelectorAll('[data-reset]').forEach(b => b.onclick = () => { S.rnd.test = currentPlan(); render(); });
};

/* ==================================================================
   PHASE 6: THE FIRST YEAR. Project it (an average month × months left), work out when each aircraft
   could be afforded, then run September to April and compare.
   ================================================================== */
const YEAR_MONTHS = 8;
function avgMonthNow(){ if(S.rnd.avgMonth) return S.rnd.avgMonth; const mo = S.history.filter(x => x.type === 'month').slice(-2); return mo.length ? Math.round(mo.reduce((t, x) => t + x.profit, 0) / mo.length) : 0; }
function readyExtra(row){ return railKind() === 'year' ? row('Projection', S.rnd.yearProj ? `Cash about <span class="mono">${money(S.rnd.yearProj.cashEnd)}</span> by the end of April` : '—', 'yearPlan', !!S.rnd.yearProj, 'Not projected yet') : ''; }
function readyOk(){ return railKind() !== 'year' || !!S.rnd.yearProj; }
R.yearPlan = () => {
  const avg = avgMonthNow(), cash = Math.round(S.cash), v = { avg, months:YEAR_MONTHS, proj:avg * YEAR_MONTHS, cash, cashEnd:cash + avg * YEAR_MONTHS };
  const tid = 'year:' + S.day, prev = S.rnd.tables[tid], t = ensureTable(tid, 'yearPlan', [{ id:'y', label:'September to April', values:v }]); if(t !== prev) t.active = null;
  const done = tableComplete(t); if(done) S.rnd.yearProj = { avg, months:YEAR_MONTHS, proj:v.proj, cash, cashEnd:v.cashEnd };
  const months = []; for(let d = S.period.from, k = 0; k < YEAR_MONTHS; k++){ months.push([monthName(d), daysIn(d)]); d = monthEnd(d) + 1; }
  screen().innerHTML = taskFrame({ question:'Where will the airline be next May?', work:true, calc:t,
    say:'Project the year. Multiply the average profit a month by the months left, then add the cash you have now.',
    context:{ title:'The year ahead', html: cxSec('Months left in Year 1', `<div class="mlist">${months.map(([m, n]) => `<span>${m}<small class="mono">${n} days</small></span>`).join('')}</div>`) + cxSec('Assumptions', kv([['Average month', `<span class="mono">${money(avg)}</span><small>July and August</small>`], ['Fuel today', `<span class="mono">${priceL(fuelPrice())}</span><small>a litre</small>`]])) + '<p class="muted cx-note">A projection assumes every month is like the average month. Is that sensible?</p>' },
    main:`<div class="rv"><section class="pnl"><div class="pnl-h"><h3>Annual projection</h3><span class="muted">September 2030 – April 2031</span></div><div class="sheet1">${tableHtml(t)}</div></section></div>`,
    foot:`<button class="btn primary big" id="nx" ${done ? '' : 'disabled'}>${goLabel(done ? 'Continue' : 'Complete the projection first')} &#9654;</button>` });
  bindTable(t); on('nx', () => { resetEntry(); UI.justDone = null; advance(); });
};
const NEXT_AIRCRAFT = ['sf34', 'at72'];
R.afford = () => {
  const avg = avgMonthNow(), res = reserveNow(), cash = Math.round(S.cash), inv = cash - res;
  const cols = NEXT_AIRCRAFT.map(id => { const pl = planeById(id), needed = pl.price - inv, can = needed <= 0 || avg <= 0, months = needed > 0 && avg > 0 ? Math.ceil(needed / avg) : 0;
    return { id, label:pl.name, sub:`${pl.seats} seats`, values:{ cash, reserve:res, inv, price:pl.price, needed:Math.max(0, needed), month:avg, months }, auto: can ? { needed:true, months:true } : null }; });
  const tid = 'afford:' + S.day, prev = S.rnd.tables[tid], t = ensureTable(tid, 'afford2', cols); if(t !== prev) t.active = null;
  const done = tableComplete(t); if(done) S.rnd.affordEst = Object.fromEntries(cols.map(c => [c.id, c.values.months]));
  screen().innerHTML = taskFrame({ question:'When could you afford the next aircraft?', work:true, calc:t,
    say:'Work out the cash you can spend, what is still needed, and how many months of profit that is.',
    context:{ title:'Aircraft', html: NEXT_AIRCRAFT.map(id => { const pl = planeById(id); return cxSec(esc(pl.name), kv([['Seats', `<span class="mono">${pl.seats}</span>`], ['Price', `<span class="mono gold">${money(pl.price)}</span>`], ['Running cost', `<span class="mono">${money(pl.hourCost)}</span><small>an hour in the air</small>`], ['Daily cost', `<span class="mono">${money(pl.dayCost)}</span>`]])); }).join('') + `<p class="muted cx-note">The emergency money (${money(res)}) always stays in the bank.</p>` },
    main:`<div class="rv"><section class="pnl"><div class="pnl-h"><h3>Time to afford</h3><span class="muted">${money(avg)} profit a month</span></div><div class="sheet1">${tableHtml(t)}</div></section></div>`,
    foot:`<button class="btn primary big" id="nx" ${done ? '' : 'disabled'}>${goLabel(done ? 'Continue' : 'Complete the figures first')} &#9654;</button>` });
  bindTable(t); on('nx', () => { resetEntry(); UI.justDone = null; advance(); });
};
/* After the year: projection against actual, the reasons, and when each aircraft really became affordable. */
function yearVs(T){
  const pj = S.rnd.yearProj || { cashEnd:0, proj:0, avg:0 }, res = reserveNow(), reasons = [];
  const lens = [...new Set(T.parts.map(p => p.days.length))]; if(lens.some(n => n < 31)) reasons.push(`Months are not all the same: they have ${lens.sort().join(', ')} days. Your average came from July and August, which have 31 days each.`);
  const fuels = T.parts.map(p => withBeat(beatAt(p.from), () => fuelPrice())); const lo = Math.min(...fuels), hi = Math.max(...fuels);
  if(hi - lo >= 0.05) reasons.push(`Fuel did not stay the same: it cost between ${priceL(lo)} and ${priceL(hi)} a litre during the year.`);
  const grown = growthReason(T, dayOfDate('2030-08-01')); if(grown) reasons.push(grown);
  const perDay = Math.round(T.profit / T.days.length), was = Math.round(pj.avg / 31); if(Math.abs(perDay - was) > 20) reasons.push(`The airline made about ${money(perDay)} a day this year; July and August made about ${money(was)} a day.`);
  if(T.autoL) reasons.push(`${num(T.autoL)} L of fuel were delivered automatically at 10p a litre more than the market price.`);
  reasons.push('Cash is not the same as profit: fuel bought goes into the tank first, and only becomes a cost when it is burned.');
  const when = {}; NEXT_AIRCRAFT.forEach(id => { const pr = planeById(id).price, i = T.parts.findIndex(p => p.cashEnd - res >= pr); when[id] = i < 0 ? null : T.parts[i].label; });
  return { kind:'year', expCash:pj.cashEnd, gotCash:Math.round(S.cash), expProfit:pj.proj, gotProfit:T.profit, reasons, when, est:S.rnd.affordEst || {} };
}
function affordWhen(m){ return m ? `affordable from the end of ${esc(FULL_MONTH[m] || m)}` : '<span class="orange">not affordable yet</span>'; }
const FULL_MONTH = { Sep:'September', Oct:'October', Nov:'November', Dec:'December', Jan:'January', Feb:'February', Mar:'March', Apr:'April' };
function yearResultLines(){
  const v = S.rnd.vs; if(!v || v.kind !== 'year') return '';
  const d = v.gotCash - v.expCash, mStart = 8;   // September is month 0
  const est = id => { const m = v.est[id]; if(m === undefined) return '—'; if(m === 0) return 'affordable straight away'; const k = m - 1; return k < YEAR_MONTHS ? `the end of ${Object.values(FULL_MONTH)[k]}` : 'after April'; };
  return `<p class="dr-fc">Projected cash: ${money(v.expCash)} · actual: ${money(v.gotCash)} <span class="${d >= 0 ? 'green' : 'orange'}">${d >= 0 ? '+' : '−'}${money(Math.abs(d))}</span></p>
    <table class="yr-t"><tr><th></th><th>You estimated</th><th>Affordable</th></tr>${NEXT_AIRCRAFT.map(id => `<tr><td><b>${esc(planeById(id).name)}</b></td><td>${est(id)}</td><td>${v.when[id] ? 'the end of ' + esc(FULL_MONTH[v.when[id]] || v.when[id]) : '<span class="orange">not yet</span>'}</td></tr>`).join('')}</table>`;
}

/* ==================================================================
   PHASE 7: THE FIRST MAJOR AIRCRAFT PURCHASE. Time zooms back in: the year in figures, the shop,
   an investment sheet (with "keep saving" as a real option), the purchase order, the delivery.
   ================================================================== */
R.yearReview = () => {
  const pj = S.rnd.yearProj ? S.rnd.yearProj.cashEnd : Math.round(S.cash), actual = Math.round(S.cash), better = actual >= pj;
  const tid = 'yr:' + S.day, prev = S.rnd.tables[tid], t = ensureTable(tid, 'yearReview', [{ id:'y', label:'End of April', values:{ proj:pj, actual, better:actual - pj, worse:pj - actual } }], { rowIds:['proj', 'actual', better ? 'better' : 'worse'] }); if(t !== prev) t.active = null;
  const done = tableComplete(t); if(done) S.rnd.yrDiff = actual - pj;
  const H = S.history.filter(x => x.type !== 'setup'), pax = H.reduce((a, x) => a + (x.pax || 0), 0), profit = H.reduce((a, x) => a + (x.profit || 0), 0), mo = H.filter(x => x.type === 'month' && isMonthSpan(x.from, x.to));
  const best = mo.slice().sort((a, b) => b.profit - a.profit)[0], worst = mo.slice().sort((a, b) => a.profit - b.profit)[0], yv = S.rnd.yearVs;
  screen().innerHTML = taskFrame({ question:'Year 1: projection against actual', work:true, calc:t,
    say:'Compare your projected cash with the actual cash, then look at the reasons.',
    context:{ title:'Year 1', html: kv([['Projected cash', `<span class="mono">${money(pj)}</span>`], ['Actual cash', `<span class="mono gold">${money(actual)}</span>`]]) + '<p class="muted cx-note">A projection is a sensible guess, not a promise. The reasons it differed are on the left.</p>' },
    main:`<div class="rv y1rv"><section class="pnl"><div class="pnl-h"><h3>Year 1 in figures</h3><span class="muted">13 May 2030 – 30 April 2031</span></div>
        <div class="y1">${[['Passengers', num(pax)], ['Profit', money(Math.round(profit))], ['Best month', best ? `${monthName(best.from).slice(0, 3)} ${money(best.profit)}` : '—'], ['Hardest month', worst ? `${monthName(worst.from).slice(0, 3)} ${money(worst.profit)}` : '—']].concat(repLive() ? [['Reputation', `${S.rep} ★`]] : []).map(([l, v]) => `<div><span class="label">${l}</span><b class="mono">${v}</b></div>`).join('')}</div></section>
      <section class="pnl"><div class="sheet1">${tableHtml(t)}</div></section>
      <section class="pnl"><div class="pnl-h"><h3>Why it differed</h3></div>${yv ? `<div class="yr-why">${yv.reasons.map(r => `<p>${esc(r)}</p>`).join('')}</div><div class="yr-aff">${NEXT_AIRCRAFT.map(id => `<span><b>${esc(planeById(id).name)}</b> ${affordWhen(yv.when[id])}</span>`).join('')}</div>` : '<p class="muted">No projection was made.</p>'}</section></div>`,
    foot:`<button class="btn primary big" id="nx" ${done ? '' : 'disabled'}>${goLabel(done ? 'Look at aircraft' : 'Complete the figure first')} &#9654;</button>` });
  bindTable(t); on('nx', () => { resetEntry(); UI.justDone = null; advance(); });
};
function seatGap(){ const h = S.history.filter(x => x.type === 'month').slice(-1)[0]; if(!h || !h.routes) return 0; const n = h.to - h.from + 1; return Math.round(Object.values(h.routes).reduce((t, x) => t + Math.max(0, (x.want || 0) - x.pax), 0) / n); }
R.shop = () => {
  const res = reserveNow(), inv = Math.round(S.cash) - res, own = ourPlane();
  const card = (pl, note, cls) => `<div class="ac-shop ${cls || ''}"><div class="as-pic"><svg viewBox="0 0 120 48" style="fill:var(--c1)"><use href="#pl-${pl.icon}"/></svg></div><b>${esc(pl.name)}</b><span class="muted">${esc(pl.fact || '')}</span>
    <div class="as-f">${[['Seats', pl.seats], ['Speed', num(pl.speed) + ' km/h'], ['Running cost', pl.hourCost ? money(pl.hourCost) + '/h' : '—'], ['Daily cost', money(pl.dayCost)], ['Price', cls === 'owned' ? 'Owned' : money(pl.price)]].map(([l, v]) => `<span>${l} <b class="mono">${v}</b></span>`).join('')}</div><p class="as-note">${note}</p></div>`;
  const cards = [card(own, 'Your aircraft: flying every day.', 'owned')].concat(NEXT_AIRCRAFT.map(id => { const pl = planeById(id), short = pl.price - inv; return card(pl, short <= 0 ? `<span class="green">Affordable now</span>, keeping ${money(res)} back` : `<span class="orange">${money(short)} short</span> of keeping ${money(res)} back`); }))
    .concat([card(planeById('e190'), 'Too big for these routes for now: 100 seats, and a much higher price.', 'dim')]);
  screen().innerHTML = taskFrame({ question:'Which aircraft could the airline add?', work:false,
    say:'Look at the aircraft for sale. Bigger aircraft carry more people but cost more every day.',
    context:{ title:'Fleet status', html: acCard() + kv([['Timetable', esc(svcLabel(schedOf(fleetOne()))).split(' + ').join('<br>')], ['People without a seat', `<span class="mono orange">${num(seatGap())}</span><small>a day, last month</small>`], ['Cash', `<span class="mono gold">${money(Math.round(S.cash))}</span>`], ['Kept back', `<span class="mono">${money(res)}</span>`]]) },
    main:`<div class="shop2">${cards.join('')}</div>`,
    foot:`<button class="btn primary big" id="nx">${goLabel('Compare the Saab 340 and ATR 72')} &#9654;</button>` });
  on('nx', advance);
};
/* The Investment model: add the aircraft with a sensible timetable (services where people have no seat) and see the extra profit a day. */
function dayProfitNow(){ const fl = planFlights().filter(x => !x.grounded), X = dayExtras(fl), fp = fuelPrice(); return fl.reduce((t, x) => t + x.revenue - x.runCost - x.fuelL * fp, 0) + X.obRev - X.term - X.obCost - X.crew - fleetDayCost(); }
function investModel(id){
  return dryRun(() => {
    const base = dayProfitNow(), pl = planeById(id); buyPlane(pl); const f = S.fleet[S.fleet.length - 1]; let sched = [];
    for(let k = 0; k < (WORLD.maxTrips || 4); k++){
      let best = null;
      plannerRoutes().forEach(r => { const s = sched.concat([r]); if(!planeCanFly(pl, routeById(r)) || !TIME.fits(pl, s)) return; f.schedule = s; const v = dayProfitNow(); if(!best || v > best.v) best = { s, v }; });
      f.schedule = sched; const now = dayProfitNow(); if(!best || best.v <= now) break; sched = best.s;
    }
    f.schedule = sched; f.route = sched[0] || null;
    return { extra:Math.round(dayProfitNow() - base), sched };
  });
}
R.invest = () => {
  const res = reserveNow(), cash = Math.round(S.cash);
  const cols = NEXT_AIRCRAFT.map(id => { const pl = planeById(id), m = investModel(id), xm = m.extra * 30, payback = xm > 0 ? Math.ceil(pl.price / xm) : 0;
    return { id, label:pl.name, sub: m.sched.length ? svcLabel(m.sched) : 'No useful services', values:{ price:pl.price, cash, after:cash - pl.price, reserve:res, safe: cash - pl.price >= res ? 1 : 0, seats:pl.seats, extraDay:m.extra, days:30, extraMonth:xm, payback }, auto: xm > 0 ? null : { payback:true }, parts:{ extraDay:[['Suggested timetable', m.sched.length ? svcLabel(m.sched) : 'none'], ['Extra profit a day', money(m.extra)]] } }; })
    .concat([{ id:'keep', label:'Keep saving', sub:'Buy nothing yet', values:{ price:0, cash, after:cash, reserve:res, safe:1, seats:0, extraDay:0, days:30, extraMonth:0, payback:0 }, auto:{ after:true, safe:true, extraMonth:true, payback:true } }]);
  const tid = 'invest:' + S.day, prev = S.rnd.tables[tid], t = ensureTable(tid, 'invest', cols); if(t !== prev) t.active = null;
  const done = tableComplete(t);
  const cheap = cols.slice(0, NEXT_AIRCRAFT.length).sort((a, b) => a.values.price - b.values.price)[0], none = !cols.slice(0, NEXT_AIRCRAFT.length).some(c => c.values.safe);
  const btns = cols.slice(0, NEXT_AIRCRAFT.length).map(c => `<button class="btn ${c.values.safe ? 'primary' : ''}" data-buy="${c.id}" ${done && c.values.safe ? '' : 'disabled'}>${c.values.safe ? `Buy the ${esc(c.label)}` : `${esc(c.label)}: below the emergency money`}</button>`).join('');
  screen().innerHTML = taskFrame({ question:'Which aircraft is the better investment?', work:true, calc:t,
    say:'Work out the cash left after buying, and how many months each aircraft takes to pay for itself.',
    context:{ title:'Decision', html: `<div class="pl-choose">${btns}<button class="btn" data-save>Keep saving: run another month &#9654;</button>${none ? `<button class="btn" data-saveto="${cheap.id}">Save until the ${esc(cheap.label)} is affordable &#9654;</button>` : ''}</div><p class="muted cx-note">${done ? 'Think about the emergency money, the months to pay back, and the people who have no seat today.' : 'Complete the figures before deciding.'}</p>${none ? '' : '<p class="muted cx-note">The Investment model works out the extra profit a day, using the timetable shown under each aircraft.</p>'}` },
    main:`<div class="opts-wrap inv">${tableHtml(t)}</div>` });
  bindTable(t);
  screen().querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { S.rnd.buyId = b.getAttribute('data-buy'); resetEntry(); UI.justDone = null; advance(); });
  screen().querySelectorAll('[data-save]').forEach(b => b.onclick = () => keepSaving());
  screen().querySelectorAll('[data-saveto]').forEach(b => b.onclick = () => keepSaving(b.getAttribute('data-saveto')));
};
/* Keep saving: one more month of routine flying, then back to the aircraft. */
function keepSaving(target){
  S.rnd.saving = true; S.rnd.sim = null; S.rnd.applied = false; S.rnd.myForecast = null;
  S.period = newPeriod('month', S.day); S.period.run = target ? { kind:'afford', target } : { kind:'one' };
  S.steps.splice(S.si + 1, 0, { t:'sim', saving:true }, { t:'results', saving:true }); next();
}
function savedLine(){
  const run = S.period && S.period.run; if(!S.rnd.saving || !run || run.kind !== 'afford') return '';
  const pl = planeById(run.target), n = S.rnd.sim.parts.length, ok = investable() >= pl.price;
  return `<p class="dr-fc">Saved for ${n} month${n > 1 ? 's' : ''}: the ${esc(pl.name)} is ${ok ? '<span class="green">now affordable</span>' : '<span class="orange">still not affordable</span>'}, keeping ${money(reserveNow())} back.</p>`;
}
function keepSavingDone(){
  S.rnd.saving = false; S.day = S.period.to + 1; S.period = newPeriod('day', S.day);
  S.steps = S.steps.filter(x => !x.saving); S.si = S.steps.findIndex(x => x.t === 'shop');
  S.rnd.sim = null; S.rnd.applied = false; resetEntry(); render();
}
R.purchase = () => {
  const pl = planeById(S.rnd.buyId || 'sf34'), res = reserveNow(), cash = Math.round(S.cash), after = cash - pl.price, del = S.day + 32;
  screen().innerHTML = taskFrame({ question:`Purchase order: ${esc(pl.name)}`, work:false,
    say:`Check the purchase order for the ${pl.name}, then sign it.`,
    context:{ title:'Order check', html: kv([['Cash now', `<span class="mono gold">${money(cash)}</span>`], ['Price', `<span class="mono">−${money(pl.price)}</span>`], ['Cash after', `<span class="mono gold">${money(after)}</span>`, 'tot'], ['Emergency money kept', after >= res ? '<span class="green">Yes</span>' : '<span class="red">No</span>']]) },
    main:`<div class="po"><div class="po-h"><span class="label">Purchase order</span><b class="mono">${esc(S.airline.code || 'DA')}-PO-001</b></div>
      ${[['Aircraft', esc(pl.name)], ['Seats', `<span class="mono">${pl.seats}</span>`], ['Price', `<span class="mono">${money(pl.price)}</span>`], ['Paid from', `${esc(S.airline.name)} cash`], ['Delivery', `${dateLong(del)} at ${esc(homeData().code)}`]].map(([l, v]) => `<div class="po-r"><span>${l}</span><b>${v}</b></div>`).join('')}</div>`,
    foot:`<button class="btn primary big" id="nx" ${after >= res ? '' : 'disabled'}>Sign the purchase order &#9654;</button>` });
  on('nx', () => { S.cash = r2(S.cash - pl.price); S.onOrder = { planeId:pl.id, price:pl.price, day:S.day, deliveryDay:del };
    addNews([{ tag:'FLEET', text:`${S.airline.name} orders a ${pl.name}.`, cls:'good' }]); sysNotice('Aircraft ordered'); advance(); });
};
R.delivery = () => {
  const o = S.onOrder || { planeId:'sf34', deliveryDay:S.day }, pl = planeById(o.planeId);
  screen().innerHTML = taskFrame({ question:`The ${esc(pl.name)} is on its way`, work:false,
    say:`The ${pl.name} arrives on ${dateLong(o.deliveryDay)}. Commissioning it comes next.`,
    context:{ title:'Fleet', html: kv([['Flying', esc(ourPlane().name)], ['On order', esc(pl.name)], ['Arrives', dateShort(o.deliveryDay)]]) },
    main:`<div class="rv"><section class="pnl"><div class="pnl-h"><h3>What happens next</h3></div><ul class="help-l big">
      <li>A new aircraft does not make money by itself. It has to be <b>commissioned</b>: where will it fly, how many services, at what fares?</li>
      <li>Who crews it, how much fuel it needs, and how much of its day it spends flying: its <b>utilisation</b>.</li>
      <li>That is Phase 8. For now, the order is signed and the money has left the bank.</li></ul></section></div>`,
    foot:`<button class="btn primary big" id="nx">Finish Year 1 &#9654;</button>` });
  on('nx', advance);
};

/* The end of this pass: Year 1 complete, with the new aircraft on order. Older saves keep the day ending. */
const protoEndDay = R.protoEnd;
R.protoEnd = () => {
  if(!S.onOrder) return protoEndDay();
  const c = serviceCounts(schedOf(fleetOne())), o = S.onOrder, pl = planeById(o.planeId), H = S.history.filter(x => x.type !== 'setup'), pax = H.reduce((t, x) => t + (x.pax || 0), 0);
  S.finished = true;
  screen().innerHTML = shell(`<div class="hp proto-end">${hqHead('Year 1 Complete', 'PROTOTYPE')}
    <h1>Year 1 complete</h1>${strategyBadge()}
    <div class="pe-grid"><div><span class="label">Daily timetable</span>${Object.keys(c).map(id => `<b>${flagSvg(routeById(id).flag, 24)} ${esc(routeById(id).city)} ×${c[id]}</b>`).join('')}</div>
      <div><span class="label">Fleet</span><b>1 ${esc(ourPlane().name.replace(/^DHC-6 /, ''))}</b><small>${esc(pl.name)} on order</small></div>
      <div><span class="label">Passengers</span><b class="mono">${num(pax)}</b><small>flown so far</small></div>
      <div><span class="label">Cash</span><b class="mono amber">${money(Math.round(S.cash))}</b><small>after paying ${money(o.price)}</small></div>
      ${repLive() ? `<div><span class="label">Reputation</span><span class="stars">${starsHtml(S.rep)}</span></div>` : ''}</div>
    <p class="lede">${esc(S.airline.name)} has flown its first year and ordered its second aircraft.</p>
    <p class="muted">Next: commissioning the ${esc(pl.name)}. Where will it fly, how often, at what fares, and how much of its day will it spend in the air?</p>
    <div class="row" style="justify-content:center"><button class="btn primary big" id="again">Play again</button><button class="btn big" id="peHome">Home</button></div></div>`);
  on('again', () => { S = newState(); S.si = 1; render(); }); on('peHome', openMenu);
};
