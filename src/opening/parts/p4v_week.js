/* ==================================================================
   WORKBOOK v4.4 (D52–D55): the week-at-a-time opening
   Stage A here: the play mode, use-it-or-lose-it, the best-plan sweep (missed-profit line), the shop's "still to save".
   The week loop itself (Monday plan, the run on the board, the Sunday review) follows below.
   ================================================================== */
const WBS = () => (WORLD && WORLD.settings) || {};
/* chapter 1 is played a week at a time unless the teacher turns day-by-day play on */
function weekMode(){ const st = WBS(); if(st.openingPlayMode !== 'week') return false; const t = settings.teacherDayByDay; return !(t === undefined || t === null ? !!st.teacherDayByDay : t); }
function launchProg(){ return WORLD.rounds && WORLD.rounds[0] && WORLD.rounds[0].prog || 2; }
/* the beat's week phase in chapter 1: plan (Monday), run (Tuesday–Saturday) or review (Sunday) */
function weekPhaseOf(n){ const w = roundData(n === undefined ? S.round : n); return w.weekPhase || null; }

/* the rival's fare on a route: the Calendar's column, or the event that carries it (D50) while it lasts */
function competitorPrice(route, n){
  const base = competitorPriceBase(route, n); if(base !== undefined) return base; if(!S) return undefined;
  const day = typeof dayFor === 'function' ? dayFor(n === undefined ? S.round : n) : S.day;
  const ev = S.rnd && S.rnd.event; if(ev && ev.rivalFare && (ev.affectsRoutes || [S.market]).includes(route.id)) return ev.rivalFare;
  const L = S.rivalLive; if(L && L.fare && (L.routes || []).includes(route.id) && day >= L.fromDay && day <= L.untilDay) return L.fare;
  return undefined;
}
/* ---------- use-it-or-lose-it (D55) ---------- */
function neglectShare(route){ const N = S && S.neglect; return N && N[route.id] ? N[route.id] : 0; }
/* at a Sunday review: each open route's week on the pupil's planes; no service or under half full → a tenth more go to Red Kite; flown properly → recovers a twentieth */
function neglectUpdate(from, to){
  const st = WBS(), fromDay = st.neglectFromDay || 15; if(!(S.day >= fromDay) || !from) return [];
  const loss = st.neglectLossShare || 0.1, back = st.neglectRecoverShare || 0.05, lf = st.neglectLoadFactor || 0.5, lines = [];
  S.neglect = S.neglect || {};
  openRoutes(to).forEach(r => {
    let pax = 0, seats = 0; (S.history || []).forEach(h => { if(h.to < from || h.from > to) return; const x = h.routes && h.routes[r.id]; if(x){ pax += x.pax || 0; seats += x.seats || 0; } });
    const before = S.neglect[r.id] || 0, want = paxWant(r, fareOf(r.id));
    const neglected = !seats || pax < lf * seats;
    const after = neglected ? Math.min(0.6, Math.round((before + loss) * 100) / 100) : Math.max(0, Math.round((before - back) * 100) / 100);
    if(after === before && !neglected) return;
    S.neglect[r.id] = after; if(!after) delete S.neglect[r.id];
    const nowWant = paxWant(r, fareOf(r.id));
    if(neglected) lines.push({ route:r.id, text:`${r.city}: ${want} → ${nowWant}. ${!seats ? 'No service flew this week, so' : 'Under half full all week, so'} Red Kite is taking your passengers.`, bad:true });
    else if(before) lines.push({ route:r.id, text:`${r.city}: ${want} → ${nowWant}. Flown properly, some passengers are coming back.`, bad:false });
  });
  return lines;
}

/* ---------- the best plan available with the pupil's planes and open routes (the missed-profit line) ---------- */
/* Every service multiset of 1–4 open routes per aircraft, at each route's best fare for that aircraft, the model's default departure times; aircraft one after another, the second seeing what the first already carries. */
function bestFareFor(p, r, n){
  n = n || 1; const F = r.fares || [r.basePrice]; let best = F[0], bv = -Infinity;
  F.forEach(f => { const pax = Math.min(n * p.seats, paxFor(r, f)), v = pax * f; if(v > bv){ bv = v; best = f; } });
  return best;
}
function multisets(items, k){ const out = []; const rec = (start, acc) => { if(acc.length === k){ out.push(acc.slice()); return; } for(let i = start; i < items.length; i++){ acc.push(items[i]); rec(i, acc); acc.pop(); } }; rec(0, []); return out; }
/* departure patterns tried for a service list: the model's own times, and a spread from 07:00 to the evening (one service: morning, midday or evening) */
function sweepDepPatterns(n){ const s0 = dayStart() + 60, e0 = Math.min(dayEnd() - 240, 1080); if(n === 1) return [null, [s0], [720], [e0]];
  const spread = []; for(let k = 0; k < n; k++) spread.push(Math.round((s0 + k * (e0 - s0) / (n - 1)) / 10) * 10); return [null, spread]; }
function nearFares(r){ const F = r.fares || [r.basePrice], b = Math.max(0, F.indexOf(r.basePrice)); return [...new Set([F[b - 1], F[b], F[b + 1]].filter(v => v !== undefined))]; }
function bestPlanSweep(from){
  from = from || (S.wk && S.wk.from) || Math.max(1, S.day - 6);
  const days = []; for(let d = from; d < from + 7; d++) days.push(d);
  const onDay = (d, fn) => withDay(d, () => withBeat(beatAt(d), () => { S.day = d; return fn(); }));
  const weekOf = pl => days.reduce((a, d) => a + onDay(d, () => planLines(pl).v.profit), 0);   // the same seven days as the projection: weekday and weekend demand, each day's fuel price
  return dryRun(() => {
    S.rivalLive = null; S.rivalAd = null; if(S.rnd){ S.rnd.event = null; S.rnd.eventCost = 0; S.rnd.cancelled = null; }   // a clean week: the standing plans compared without the week's events, as in the Balance Report
    const maxT = WORLD.maxTrips || 4, routes = openRoutes(from), mid = from + 2;
    const base = currentPlan(); base.fleet.forEach(x => { x.sched = []; x.deps = null; }); base.prices = Object.assign({}, S.prices);
    const score = t => onDay(mid, () => planLines(t).v.profit);
    const sweepOrder = order => {   // the aircraft one after another in the given order, each seeing what the earlier ones already carry
      const pl = JSON.parse(JSON.stringify(base));
      order.forEach(j => { const x = pl.fleet[j], p = planeById(x.planeId), can = routes.filter(r => planeCanFly(p, r)); if(!can.length) return;
        const cands = [{ v: score(pl), t: JSON.parse(JSON.stringify(pl)) }];   // flying nothing is allowed too (the aircraft still costs its day)
        for(let k = 1; k <= maxT; k++) multisets(can.map(r => r.id), k).forEach(sch => {
          sweepDepPatterns(sch.length).forEach(deps => {
            const t = JSON.parse(JSON.stringify(pl)); t.fleet[j].sched = sch; t.fleet[j].deps = deps;
            if(!withPlan(t, () => t.fleet.every(z => !z.sched.length || fitsFor(z)))) return;
            let v = score(t);
            [...new Set(sch)].forEach(id => { const r = routeById(id); nearFares(r).forEach(f => { if(f === t.prices[id]) return; const u = JSON.parse(JSON.stringify(t)); u.prices[id] = f; const w = score(u); if(w > v){ v = w; t.prices = u.prices; } }); });   // each route's fare: the nearest fares either side of the base, one route at a time
            cands.push({ v, t });
          });
        });
        cands.sort((a, b) => b.v - a.v);
        let best = null; cands.slice(0, 8).forEach(c => { const w = weekOf(c.t); if(!best || w > best.w) best = { w, c }; });   // the best few by the midweek day, scored over the whole week
        if(best){ x.sched = best.c.t.fleet[j].sched; x.deps = best.c.t.fleet[j].deps; pl.prices = best.c.t.prices; } });
      return { pl, week: weekOf(pl) };
    };
    const idx = base.fleet.map((x, j) => j), tries = [idx]; if(idx.length > 1) tries.push(idx.slice().reverse());
    let best = null; tries.forEach(o => { const r = sweepOrder(o); if(!best || r.week > best.week) best = r; });
    return { profit: Math.round(best.week / 7), week: Math.round(best.week), plan: best.pl, label: planLabel(best.pl) };
  });
}
/* the three figures of the missed-profit line, for a week that has just run (actual = the week's profit, days = its length) */
function missedProfitLine(actualWeek, days, from){
  const best = bestPlanSweep(from), bestWeek = best.week, missed = Math.max(0, Math.round(bestWeek - actualWeek));
  return { yours: Math.round(actualWeek), best: Math.round(bestWeek), missed, bestPlan: best.label, bestDay: best.profit };
}

/* ---------- the shop: Buy waits until cash ≥ price + the reserve (D55) ---------- */
function avgDailyProfit(){ const L = ledger(), days = []; for(let d = S.day - 1; d >= 1 && days.length < 7; d--){ if(L.rev[d] !== undefined && L.rev[d] !== null) days.push((L.rev[d] || 0) - (L.cost[d] || 0)); }
  if(!days.length){ const h = S.history[S.history.length - 1]; return h ? (h.profit || 0) / Math.max(1, (h.to || h.from) - h.from + 1) : 0; } return days.reduce((a, b) => a + b, 0) / days.length; }
function saveUp(price){ const reserve = WORLD.cashReserve || 0, short = Math.max(0, Math.round(price + reserve - S.cash)), rate = avgDailyProfit();
  return { afford: short <= 0, short, reserve, rate: Math.round(rate), days: short > 0 && rate > 0 ? Math.ceil(short / rate) : null }; }
function saveUpText(o){ if(o.afford) return ''; return `${money(o.short)} still to save${o.days ? ` · about ${o.days} day${o.days === 1 ? '' : 's'} at your rate` : o.rate <= 0 ? ' · the airline is not making money yet' : ''}`; }

/* ==================================================================
   THE WEEK LOOP (D52): Monday plan → the week on the board → the Sunday review
   ================================================================== */
const WEEK_RUN_DELAY = () => (settings.flightSecs !== undefined && settings.flightSecs <= 1) ? 120 : 1700;
function chapterWeekDay(n){ const w = roundData(n === undefined ? S.round : n); return weekMode() && w && w.period !== 'setup' ? (w.period === 'day' && !!w.weekPhase) : weekMode() && w && w.period === 'setup'; }
/* the Calendar says "fuel is free" on the launch deal's days: flights burn nothing, whatever the gates say */
function fuelFreeDay(d){ const c = calRow(d); return !!(c && (c.headlines || []).some(h => /fuel is free/i.test(h))); }
function fuelPaid(){ if(!opened(3.2)) return false; const d = typeof dayFor === 'function' && S ? dayFor(S.round || 0) : (S && S.day) || 1; return !fuelFreeDay(d); }
/* the tutorial fuel price: the first paid day of the week (Wednesday £1.30 in week 1) */
function weekFuelPrice(from){ from = from || (S.day || 1); for(let d = from; d < from + 7; d++) if(!fuelFreeDay(d)) return fuelOn(d); return fuelOn(from); }
function paidDaysThisWeek(from){ from = from || (S.day || 1); let n = 0; for(let d = from; d < from + 7; d++) if(!fuelFreeDay(d)) n++; return n; }

/* ---------- Monday's step list ---------- */
function daySteps(n, w){
  w = w || roundData(n);
  if(!weekMode() || !w.weekPhase) return dayStepsBase(n, w);
  if(S.oneOffDay === beatDay(n) && w.weekPhase !== 'plan') return withIntro([{ t:'hq' }].concat(S.rnd.event ? [{ t:'event' }] : []).concat([{ t:'plan' }, { t:'workings' }, { t:'ready' }, { t:'fly' }, { t:'results' }]), w);   // an old save with no sums record: one planning day with its sums, then the board
  const shop = !!(w.unlocks && w.unlocks.planes && w.unlocks.planes.length);
  return withIntro([{ t:'hq' }].concat(shop ? [{ t:'shop2' }] : []).concat(S.rnd.event ? [{ t:'event' }] : []).concat([{ t:'plan' }, { t:'workings' }, { t:'ready' }, { t:'fly' }, { t:'results' }]), w);
}

/* ---------- the week's projection: the standing plan on each of the seven days, before events ---------- */
function projectWeek(from){
  let tot = 0; for(let d = from; d < from + 7; d++){ const b = beatAt(d); tot += dryRun(() => withDay(d, () => withBeat(b, () => { S.day = d; return planLines(currentPlan()).v.profit; }))); }
  return Math.round(tot);
}

/* ---------- the run: one day per step on the board, no stopping except an event card or a sum ---------- */
function weekRunStart(nb){
  const h = lastDay(), mon = S.day;
  S.wk = { week:weekNo(mon), from:mon, rows:[], projected:projectWeek(mon), sumsChecked:{}, notes:[] };
  if(h) S.wk.rows.push(dayRowOf(h, S.rnd));
  enterRunDay(nb);
}
/* a week joined part-way (an old save code, a one-off planning day): the rows already flown come from the history, then the board carries on */
function weekResume(nb){
  const d = beatDay(nb), mon = d - ((calDate(d).getUTCDay() + 6) % 7);
  const rows = (S.history || []).filter(h => h.from >= mon && h.to < d && h.to === h.from).map(h => dayRowOf(h, null));
  S.wk = { week:weekNo(mon), from:mon, rows, projected:projectWeek(mon), sumsChecked:{}, notes:[] };
  enterRunDay(nb);
}
function dayRowOf(h, rnd){ return { d:h.from, pax:h.pax || 0, seats:h.seats || 0, trips:h.trips || 0, rev:Math.round(h.revenue || 0), cost:Math.round(h.costs || 0), profit:Math.round(h.profit || 0),
  flights:((rnd && rnd.flights) || []).map(f => ({ code:f.code, dep:f.dep, route:f.route, sold:f.sold, seats:f.seats, status:(rnd.status || {})[f.key] || '' })), notes:((rnd && rnd.why) || []).map(w => w.text).slice(0, 3) }; }
function enterRunDay(nb){
  const w = roundData(nb), f = fleetOne();
  S.round = nb; S.phase = 'round'; S.day = beatDay(nb); delete S.needsRestart; S.period = newPeriod('day', S.day);
  S.rnd = Object.assign(emptyRnd(), { featured:f.uid, focusRoute:schedOf(f)[0] || S.market, headline:w.headline || '', brief:protoBrief(nb), event: w.event ? JSON.parse(JSON.stringify(w.event)) : null, cashStart:S.cash });
  refreshPlan(); UI.view = null; S.newRoutes = [];
  S.steps = (S.rnd.event && S.rnd.event.options && S.rnd.event.options.length ? [{ t:'event' }] : []).concat([{ t:'weekRun' }]); S.si = 0;
  addNews((w.news || []).slice(0, 2).map(t => ({ tag:'NEWS', text:t })));
  publish(); render();
}
/* the day flown on the standing plan: fuel from the tank (a top-up at the day's price + the supplement when the tank runs short), then the results as on any day */
function runDayQuick(){
  refreshPlan(); const fl = S.rnd.flights = planFlights(), paid = fuelPaid(), notes = [];
  fl.slice().sort((a, b) => a.dep - b.dep).forEach(f => {
    if(f.grounded || f.cancelled) return;
    if(!paid){ f.fuelCost = 0; S.rnd.status[f.key] = 'LANDED'; return; }
    if(S.fuel + 1e-9 < f.fuelL){ const short = f.fuelL - S.fuel, L = Math.max(ceilLot(short), short), ppl = r2(fuelPrice() + (WORLD.fuelTopUp || 0)), bill = r2(L * ppl);
      fuelLots().push({ L, p:ppl }); S.fuel = r2(S.fuel + L); S.fuelValue = r2(S.fuelValue + bill); S.cash = r2(S.cash - bill); notes.push(`${num(L)} L delivered at ${priceL(ppl)} a litre (${money(bill)}): the tank ran short.`); }
    f.fuelCost = consumeFuel(f.fuelL); S.rnd.status[f.key] = 'LANDED';
  });
  notes.forEach(t => S.rnd.why.push({ ic:'⛽', text:t }));
  S.rnd.forecast = null; S.rnd.myForecast = S.wk && S.wk.forecastDay ? S.wk.forecastDay : S.rnd.myForecast;
  applyResults();
  S.wk.rows.push(dayRowOf(lastDay(), S.rnd)); S.wk.dayDone = S.day;
}
function weekRunAdvance(){
  const nb = S.round + 1, w = WORLD.rounds[nb];
  if(weekPhaseOf(S.round) === 'review'){ S.steps.push({ t:'weekReview' }); next(); return; }
  if(w && w.period === 'day' && w.weekPhase && w.weekPhase !== 'plan'){ enterRunDay(nb); return; }
  S.steps.push({ t:'weekReview' }); next();   // the calendar ran out mid-week: review what there is
}
/* the board: the week's rows filling in, the day's flights underneath */
function boardHtml(running){
  const W = S.wk || { rows:[], from:S.day }, rows = [];
  for(let k = 0; k < 7; k++){ const d = W.from + k, r = W.rows.find(x => x.d === d), today = d === S.day;
    rows.push(`<tr class="${r ? 'done' : today ? 'now' : ''}"><th>${esc(dateShort(d))}${today && !r ? ' <span class="wb-live">● running</span>' : ''}</th><td class="num">${r ? plural(r.trips, 'service') : '—'}</td><td class="num">${r ? `${r.pax} / ${r.seats}` : '—'}</td><td class="num">${r ? money(r.rev) : '—'}</td><td class="num">${r ? money(r.cost) : '—'}</td><td class="num ${r ? (r.profit >= 0 ? 'green' : 'red') : ''}">${r ? money(r.profit) : '—'}</td></tr>`); }
  const tot = W.rows.reduce((t, r) => t + r.profit, 0), last = W.rows[W.rows.length - 1];
  const fl = (S.rnd.flights || []).slice().sort((a, b) => a.dep - b.dep);
  const day = `<div class="wb-day"><div class="pnl-h"><h3>${esc(dateLong(S.day))}</h3><span class="muted">${esc(S.rnd.headline || '')}</span></div>
    <table class="wb-fl"><thead><tr><th>Time</th><th>Flight</th><th>To</th><th class="num">Seats</th><th>Status</th></tr></thead><tbody>${fl.map(f => `<tr><td class="mono">${fmtTime(f.dep)}</td><td class="mono">${esc(f.code)}</td><td>${flagSvg(routeById(f.route).flag, 16)} ${esc(routeById(f.route).city)}</td><td class="num mono">${f.cancelled ? '—' : `${f.sold} / ${f.seats}`}</td><td>${f.cancelled ? '<span class="chip bad">Cancelled</span>' : S.rnd.status[f.key] === 'LANDED' ? '<span class="chip ok">Landed</span>' : '<span class="chip idle">Scheduled</span>'}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">No services today.</td></tr>'}</tbody></table>
    ${last && last.d === S.day && last.notes.length ? `<ul class="wb-notes">${last.notes.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</div>`;
  return `<div class="wboard"><table class="wb-week"><thead><tr><th>Week ${W.week || weekNo(W.from)}</th><th class="num">Services</th><th class="num">Passengers</th><th class="num">Revenue</th><th class="num">Costs</th><th class="num">Profit</th></tr></thead><tbody>${rows.join('')}</tbody>
    <tfoot><tr><th>So far</th><td></td><td class="num">${W.rows.reduce((t, r) => t + r.pax, 0)}</td><td class="num">${money(W.rows.reduce((t, r) => t + r.rev, 0))}</td><td class="num">${money(W.rows.reduce((t, r) => t + r.cost, 0))}</td><td class="num ${tot >= 0 ? 'green' : 'red'}">${money(tot)}</td></tr></tfoot></table>${day}</div>`;
}
R.weekRun = st => {
  if(!S.wk) S.wk = { week:weekNo(S.day), from:S.day - ((calDate(S.day).getUTCDay() + 6) % 7), rows:[], projected:0, sumsChecked:{}, notes:[] };
  const done = S.wk.dayDone === S.day;
  if(!done && !S.wk.sumsChecked[S.day]){   // a sum the rules ask for today (the Red Kite tenths on Thursday, the weekend tenths on Saturday) stops the board first
    S.wk.sumsChecked[S.day] = true; const W = workTables(currentPlan());
    if(wkCells(W.tables).some(x => x.s !== 'done')){ S.steps.splice(S.si, 0, { t:'workings' }); render(); return; }
  }
  screen().innerHTML = taskFrameBase({ title:`Week ${S.wk.week} on the board`, question: done ? `${esc(dateShort(S.day))}: ${S.rnd.profit >= 0 ? 'profit' : 'loss'} ${money(Math.round(Math.abs(S.rnd.profit || 0)))}` : `${esc(dateShort(S.day))} is flying`, work:false,
    story: done ? [] : [S.rnd.brief && S.rnd.brief[0] ? S.rnd.brief[0] : 'The standing plan runs today.'], main: boardHtml(!done),
    foot: `<span class="muted grow">${done ? 'The board moves on by itself.' : 'Flights run on the standing plan. The board moves on by itself.'}</span>${settings.testMode ? '<button class="btn small" id="wkStep">Step</button>' : ''}` });
  if(UI.wkTimer) clearTimeout(UI.wkTimer);
  const go = () => { UI.wkTimer = null; if(step().t !== 'weekRun') return; if(S.wk.dayDone !== S.day){ runDayQuick(); publish(); render(); } else weekRunAdvance(); };
  UI.wkTimer = setTimeout(go, done ? WEEK_RUN_DELAY() : Math.round(WEEK_RUN_DELAY() * 0.7));
  on('wkStep', () => { if(UI.wkTimer) clearTimeout(UI.wkTimer); go(); });
};
Object.assign(FRAME_TITLES, { weekRun:'On the board', weekReview:'The week in review' });
NO_BACK.push('weekRun', 'weekReview'); WS_STEPS.push('weekReview'); SHELL_STEPS.push('weekReview');
Object.assign(RAIL_LABEL, { weekReview:'The week in review', weekRun:'On the board' }); Object.assign(SUB_DESC, { weekReview:'Add up the week', weekRun:'The standing plan flies' });
{ const g = STAGES.day.find(x => x.id === 'review'); if(g && !g.steps.includes('weekReview')) g.steps.push('weekReview'); }

/* ---------- Sunday: the seven-row table, the total by hand, projected − actual, the missed-profit line, the neglect line ---------- */
TABLES.week7 = { title:'The week', rows:[1, 2, 3, 4, 5, 6, 7].map(k => ({ id:'d' + k, label:'Day ' + k, type:'given', unit:'£' })).concat([
  { id:'total', label:'Profit this week', type:'calc', unit:'£', op:'+', from:['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'], sentence:'{d1} + {d2} + {d3} + {d4} + {d5} + {d6} + {d7} = {?total}', tool:'totals', total:true },
  { id:'proj', label:'Projected on Monday', type:'given', unit:'£', explain:true },
  { id:'better', label:'More than projected', type:'calc', unit:'£', op:'−', from:['total', 'proj'], sentence:'{total} − {proj} = {?better}', tool:'difference' },
  { id:'worse', label:'Less than projected', type:'calc', unit:'£', op:'−', from:['proj', 'total'], sentence:'{proj} − {total} = {?worse}', tool:'difference' }]) };
function weekSummary(W){ const routes = {}; let pax = 0, seats = 0, rev = 0, costs = 0, profit = 0, trips = 0;
  (S.history || []).filter(h => h.from >= W.from && h.to <= W.from + 6).forEach(h => { pax += h.pax || 0; seats += h.seats || 0; rev += h.revenue || 0; costs += h.costs || 0; profit += h.profit || 0; trips += h.trips || 0;
    Object.keys(h.routes || {}).forEach(id => { const x = routes[id] || (routes[id] = { pax:0, seats:0, rev:0, cost:0, trips:0, fare:h.routes[id].fare, want:0, profit:0 }), y = h.routes[id]; x.pax += y.pax || 0; x.seats += y.seats || 0; x.rev += y.rev || 0; x.cost += y.cost || 0; x.trips += y.trips || 0; x.want += y.want || 0; x.profit += y.profit || 0; }); });
  return { type:'week', from:W.from, to:W.from + 6, pax, seats, revenue:rev, costs, profit, trips, routes }; }
R.weekReview = st => {
  const W = S.wk || { from:S.day - 6, rows:[], projected:0 }, h = weekSummary(W), dayP = k => { const r = W.rows.find(x => x.d === W.from + k - 1); return r ? r.profit : 0; };
  const vals = { total:Math.round(h.profit), proj:Math.round(W.projected || 0) }; for(let k = 1; k <= 7; k++) vals['d' + k] = dayP(k); vals.better = vals.total - vals.proj; vals.worse = vals.proj - vals.total;
  const labels = {}; for(let k = 1; k <= 7; k++) labels['d' + k] = `${dateShort(W.from + k - 1)}: profit`;
  S.rnd.handSums = Object.assign({}, S.rnd.handSums || {}, { totals:'calc', difference:'calc' });
  const prev = S.rnd.tables['week:' + W.from], t = ensureTable('week:' + W.from, 'week7', [{ id:'w', label:`Week ${weekNo(W.from)}`, values:vals }], { rowIds:['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'total', 'proj', vals.total >= vals.proj ? 'better' : 'worse'], labels });
  if(t !== prev) t.active = null; const done = tableComplete(t);
  if(done && !W.logged){ W.logged = true; const sk = skills(); ['weekTotal', 'projectedVsActual'].forEach(id => { const x = sk[id] || (sk[id] = { first:S.day, count:0 }); x.count++; x.lastDay = S.day; }); (S.handSumLog = S.handSumLog || []).push({ day:S.day, date:dateShort(S.day), tools:['Week total (Calculate)', 'Projected − actual (Calculate)'] }); }
  if(!W.missed && WBS().missedProfitLine !== false){ W.missed = missedProfitLine(h.profit, 7, W.from); }
  if(!W.neglect) W.neglect = neglectUpdate(W.from, W.from + 6);
  const M = W.missed, miss = M ? `<div class="wk-missed ${M.missed > 0 ? 'warn' : 'ok'}"><span class="kl">What the best plan would have earned</span><div class="wm-row"><span>Your plan <b class="mono">${money(M.yours)}</b></span><span>Best plan available with your planes <b class="mono">${money(M.best)}</b></span><span>Missed <b class="mono ${M.missed > 0 ? 'orange' : 'green'}">${money(M.missed)}</b></span></div><p class="small muted">Best plan: ${esc(M.bestPlan)} · about ${money(M.bestDay)} a day. No cash is taken.</p></div>` : '';
  const neg = W.neglect && W.neglect.length ? `<div class="wk-neglect">${W.neglect.map(n => `<p class="${n.bad ? 'orange' : 'green'}">${esc(n.text)}</p>`).join('')}</div>` : '';
  screen().innerHTML = taskFrame({ question:`How did week ${weekNo(W.from)} go?`, work:true, calc:t,
    say:`Seven days flown. Add up the week, then compare it with Monday's projection.`,
    context:{ title:'The week', html: cxSec('Passengers', `<p class="cx-plan mono">${num(h.pax)} <span class="small muted">of ${num(h.seats)} seats</span></p>`) + cxSec('Cash', `<p class="cx-plan mono">${money(Math.round(S.cash))}</p>`) },
    main:`<div class="rv"><section class="pnl"><div class="pnl-h"><h3>The week, day by day</h3><span class="muted">${fmtRange(W.from, W.from + 6)}</span></div><div class="sheet1">${tableHtml(t)}</div></section>
      <div class="rv-side">${miss}${neg}</div><section class="pnl rv-routes"><div class="pnl-h"><h3>Route performance</h3></div>${evidenceHtml(h, Object.keys(h.routes))}</section></div>`,
    foot:`<button class="btn primary big" id="nx" ${done ? '' : 'disabled'}>${goLabel(done ? 'On to next week' : 'Add up the week first')} &#9654;</button>` });
  bindTable(t);
  on('nx', () => { resetEntry(); UI.justDone = null; S.rnd.applied = true; closeDay(); });
};

/* ---------- closing a day in the week loop ---------- */
function closeDay(){
  UI.view = null; UI.fbI = 0; if(typeof attachArchive === 'function') attachArchive();
  if(weekMode() && (S.phase === 'setup' || (periodType() === 'day' && weekPhaseOf(S.round)))){
    const ph = S.phase === 'setup' ? 'plan' : weekPhaseOf(S.round), nb = S.round + 1, nxt = WORLD.rounds[nb];
    if(ph === 'plan'){ if(nxt && nxt.period === 'day' && nxt.weekPhase && nxt.weekPhase !== 'plan'){ weekRunStart(nb); return; } }
    if(ph === 'run'){ delete S.oneOffDay; if(nxt && nxt.period === 'day' && nxt.weekPhase && nxt.weekPhase !== 'plan'){ weekResume(nb); return; } }   // a day played on its own (an old save's one-off planning day): the board carries on from tomorrow
    if(ph === 'review' || ph === 'plan'){ delete S.wk;
      if(nxt && nxt.period === 'day'){ startProtoDay(nb); return; }
      if(nxt && !S.steps.some(s => s.t === 'rop')){ S.steps.push({ t:'rop' }); next(); return; }
      if(!nxt){ S.steps.push({ t:'protoEnd' }); next(); return; }
      startBeat(nb); return; }
  }
  if(S.phase === 'setup'){ startProtoDay(1); return; }
  if(S.rnd.saving){ keepSavingDone(); return; }
  if(periodType() === 'day'){
    const nb = S.round + 1, nxt = WORLD.rounds[nb];
    if(nxt && nxt.period === 'day'){ startProtoDay(nb); return; }
    if(nxt && !S.steps.some(s => s.t === 'rop')){ S.steps.push({ t:'rop' }); next(); return; }
    if(!nxt){ S.steps.push({ t:'protoEnd' }); next(); return; }
    startBeat(nb); return;
  }
  const nb = beatStartingOn(S.period.to + 1); if(nb === null){ S.steps.push({ t:'protoEnd' }); next(); return; } startBeat(nb);
}

/* ---------- the sums (D54): Launch Day in one sitting, later Mondays what the rules ask, the Calendar's gatedCalc ---------- */
TOOLS.push({ id:'range', name:'Range check', phase:2, def:[[2, 'calc']], build:false }); TOOL.range = TOOLS[TOOLS.length - 1]; HAND_TOOLS.push('range');
TABLES.range1 = { title:'Range', rows:[{ id:'range', label:'Aircraft range', type:'given', unit:'km' }, { id:'km', label:'Route distance', type:'given', unit:'km' }, { id:'spare', label:'Spare range', type:'calc', unit:'km', op:'−', from:['range', 'km'], sentence:'{range} − {km} = {?spare}', tool:'range' }] };
function decideHandSumsWeek(L, pl){
  const out = decideHandSumsBase(L, pl); if(!weekMode()) return out;
  pl = normPlan(pl); const sk = skills(), first = id => !sk[id], g = gatedToday();
  if(S.phase === 'setup'){   // Launch Day: tickets at three fares (the first market), profit, snacks at £3 and £5, fuel after the guided example
    out.revenue = { level:'calc', routes:[S.market] }; out.profit = 'calc';
    if(snacksOn() && first('snacks')) out.snacks = 'calc';
    if(first('fuelCost')) out.fuelCost = 'calc';
    delete out.rivalStay; delete out.weekendDemand; return out;
  }
  if(g.includes('rivalSwitch') && first('rivalStay') && typeof rivalShare === 'function'){ const rid = [S.market, otherRoute()].find(id => id && routeById(id) && rivalShare(routeById(id), fareOf(id)) > 0); if(rid) out.rivalStay = { level:'calc', route:rid }; }
  if(g.includes('range') && first('range')){ const r = routesOpening(S.day)[0] || openRoutes(S.day).slice().sort((a, b) => routeKm(b) - routeKm(a))[0], p = S.fleet.map(f => planeById(f.planeId)).sort((a, b) => b.range - a.range)[0]; if(r && p) out.range = { level:'calc', route:r.id, plane:p.id }; }
  if(g.includes('fuelCost') && !out.fuelCost && fuelPaid()) out.fuelCost = 'calc';
  return out;
}
function recordHandSums(L){ const H = S.rnd.handSums || {}; recordHandSumsBase(L); if(H.range){ const sk = skills(), x = sk.range || (sk.range = { first:S.day, count:0, routes:[] }); x.count++; x.lastDay = S.day; if(!x.routes.includes(H.range.route)) x.routes.push(H.range.route); }
  if(S.phase === 'setup' && weekMode() && H.fuelCost && skills().fuelCost) skills().fuelCost.last = { price:weekFuelPrice(S.day), litres:plannedLitres(currentPlan()) }; }

/* the workings page's tables as stages: each stage is a table; the next opens when the one before is complete (and its choice made) */
function launchFares(){ const r = routeById(S.market), F = r.fares || [r.basePrice], b = Math.max(0, F.indexOf(r.basePrice)), lo = clamp(b - 1, 0, Math.max(0, F.length - 3)); return F.slice(lo, lo + 3); }
function wkStagesLaunchWeek(pl){
  const r = routeById(S.market), H = S.rnd.handSums || decideHandSums(planLines(pl), pl), picks = S.rnd.picks || {}, stages = [];
  const fareOpts = launchFares().map(f => ({ id:'f' + f, label:money(f), sub:`${paxWant(r, f)} want to fly`, plan:Object.assign({}, pl, { prices:Object.assign({}, pl.prices, { [r.id]:f }), onboard:'none' }), pick:{ fare:f }, word:`Fly at ${money(f)}`, kind:'fare' }));
  stages.push({ id:'fare', opts:fareOpts, rowIds:['pax_' + r.id, 'fare_' + r.id, 'tk_' + r.id], pick:'fare' });
  stages.push({ id:'profit', opts:[{ id:'a', label:'Your plan', sub:planLabel(pl).split(' · ').slice(0, 2).join(' · '), plan:Object.assign({}, pl, { onboard:'none' }), pick:null, word:'Fly this plan' }], rowIds:null });   // tickets and profit before the snack choice: those tables must not change when snacks are chosen
  if(H.snacks){ const sell = Object.keys(ONBOARD).filter(k => ONBOARD[k].price > 0), free = Object.keys(ONBOARD).filter(k => ONBOARD[k].free), keys = sell.concat(S.rnd.thirdSnack ? free : []);
    stages.push({ id:'snack', opts:keys.map(k => ({ id:'ob_' + k, label:ONBOARD[k].label.replace(/^Sell snacks at /, 'Snacks at '), sub:ONBOARD[k].sub, plan:Object.assign({}, pl, { onboard:k }), pick:{ onboard:k }, word:ONBOARD[k].free ? 'Give free snacks' : `Sell at ${money(ONBOARD[k].price)}`, kind:'snack' })), rowIds:['buyers', 'snackP', 'snack'], pick:'snack', third:true }); }
  if(H.fuelCost) stages.push({ id:'fuel', opts:[{ id:'a', label:'Your plan', sub:`fuel from Wednesday at ${priceL(weekFuelPrice(S.day))}`, plan:pl, pick:null, word:'' }], rowIds:['fuelL', 'ppl', 'fuel'], fuelAt:weekFuelPrice(S.day), tut:true });
  return stages;
}
function stageTable(stage, L0){
  const lines = stage.opts.map(o => planLines(o.plan)), fuelAt = stage.fuelAt;
  const cols = stage.opts.map((o, i) => { const v = Object.assign({}, lines[i].v); if(fuelAt){ v.ppl = fuelAt; v.fuel = Math.round(v.fuelL * fuelAt); } return { id:o.id, label:o.label, sub:o.sub, values:v, parts:{ run:flightParts(o.plan), day:typeof dayParts === 'function' ? dayParts() : [], cost:costPartsOf(v) } }; });
  const rows = costRowsFor(L0); let rowIds = stage.rowIds || costRowIds(L0, S.rnd.stagePlan || currentPlan());
  if(!stage.rowIds){ rowIds = rowIds.filter(id => !/^(pax_|fare_|tk_|buyers|snackP|snack$|fuelL|ppl|fuel$)/.test(id)); }   // the profit stage: the sheet's totals and the profit line only
  const t = ensureTable('work:' + S.day + ':' + stage.id, 'cost1', cols, { rows, rowIds, labels:costLabels() }); t.stage = stage.id; return { t, lines };
}
function workTables(pl){
  if(!(weekMode() && S.phase === 'setup')) return workTablesBase(pl);
  const L0 = planLines(pl), stages = wkStagesLaunch(pl), picks = S.rnd.picks || (S.rnd.picks = {}), tables = [], done = [];
  let cur = null, opts = [], picked = null, multi = false, lines = [], total = 0, pickKind = null;
  for(const st of stages){
    const { t, lines:ln } = stageTable(st, L0); tables.push(t); total += wkCells([t]).length;
    const complete = !wkNext([t]), pk = st.pick ? (picks[st.pick] || null) : null;
    if(st.pick && complete){ t.cols.forEach(c => { if(pk && c.id !== pk){ tRows(t).forEach(r => { if(rowTyped(t, r)){ const k = cellId(c.id, r.id); if(!t.done[k]){ t.done[k] = true; (S.rnd.autoDone = S.rnd.autoDone || []).push(t.id + '|' + k); } } }); } }); }
    if(!cur && (!complete || (st.pick && !pk))){ cur = st; opts = st.opts; picked = pk; multi = !!st.pick; lines = ln; pickKind = st.kind || st.id; break; }
    done.push(st);
  }
  if(!cur){ const last = stages[stages.length - 1]; cur = last; opts = last.opts; picked = last.pick ? picks[last.pick] : last.opts[0].id; multi = !!last.pick; lines = stageTable(last, L0).lines; }
  total = stages.reduce((t, s) => t + s.opts.length * (s.rowIds ? s.rowIds.filter(id => /^(tk_|snack$|fuel$|profit$)/.test(id)).length : 1), 0) + stages.filter(s => s.pick).length;   // every stage, built or not, plus the choices
  return { L0, opts, lines, picked, t:tables[tables.length - 1], tables, multi, total, pickKind, stage:cur, third: cur && cur.third };
}
function workoutPicked(opts, pl){ if(weekMode() && S.phase === 'setup'){ const W = workTables(pl); return W.picked; } if(opts.length > 1) return S.rnd.pick && opts.some(o => o.id === S.rnd.pick) ? S.rnd.pick : null; return opts[0].id; }
function applyPick(o){
  if(o.pick && o.pick.fare !== undefined){ S.prices[S.market] = o.pick.fare; S.rnd.pick = o.id; (S.rnd.picks = S.rnd.picks || {}).fare = o.id; }
  else if(o.pick && o.pick.onboard){ S.onboard = o.pick.onboard; S.rnd.pick = o.id; (S.rnd.picks = S.rnd.picks || {}).snack = o.id; }
  refreshPlan(); resetEntry(); UI.justDone = null; render();
}

/* Monday in week mode: a tank that is short is topped up at the day's price plus the supplement, as on the run days (the ready step never blocks) */
function weekTopUp(need){ if(!(weekMode() && S.day < (WORLD.weekFrom || 22) && fuelPaid())) return 0; const short = need - S.fuel; if(short <= 1e-9) return 0;
  const L = Math.max(ceilLot(short), short), ppl = r2(fuelPrice() + (WORLD.fuelTopUp || 0)), bill = r2(L * ppl);
  fuelLots().push({ L, p:ppl }); S.fuel = r2(S.fuel + L); S.fuelValue = r2(S.fuelValue + bill); S.cash = r2(S.cash - bill);
  S.rnd.why.push({ ic:'⛽', text:`${num(L)} L delivered at ${priceL(ppl)} a litre (${money(bill)}): the tank ran short.` }); return L; }
/* ---------- Monday's fuel order, on the plan page: enough for the week from the first paid day ---------- */
function fuelPanelHtml(){
  if(!weekMode() || !opened(3.2) || !S.fleet.length) return '';
  const from = S.day || 1, price = weekFuelPrice(from), paidDays = paidDaysThisWeek(from), perDay = plannedLitres(currentPlan()), need = perDay * paidDays, have = S.fuel, lot = WORLD.fuelLot || 500;
  const space = Math.floor(tankSpace() / lot) * lot, afford = Math.floor(Math.max(0, S.cash - (WORLD.cashReserve || 0)) / (lot * price)) * lot, maxL = Math.max(0, Math.min(space, afford));
  const order = S.rnd.fuelOrder ? S.rnd.fuelOrder.litres : 0, enough = Math.max(0, Math.ceil(Math.max(0, need - have) / lot) * lot), after = have + order;
  return `<section class="pnl pe-fuelwk"><div class="pnl-h"><h3>Fuel for the week</h3><span class="muted">${paidDays < 7 ? `Free until ${dateShort(from + (7 - paidDays) - 1)}, then ` : ''}${priceL(price)} a litre · the plan burns ${num(perDay)} L a day</span></div>
    <div class="fw-row"><span class="kl">In the tank</span><b class="mono">${num(have)} L</b><span class="kl">Order</span><div class="pe-step sm"><button class="pe-b" data-fo="${order - lot}" ${order ? '' : 'disabled'} aria-label="less">−</button><b class="pe-v mono">${num(order)} L</b><button class="pe-b" data-fo="${order + lot}" ${order + lot <= maxL ? '' : 'disabled'} aria-label="more">+</button></div>
      <span class="fw-quick"><button class="btn small" data-fo="0">None</button>${enough ? `<button class="btn small" data-fo="${Math.min(enough, maxL)}">Enough for the week (${num(Math.min(enough, maxL))} L)</button>` : ''}<button class="btn small" data-fo="${maxL}">As much as I can (${num(maxL)} L)</button></span>
      <span class="fw-bill">${order ? `<span class="mono">${num(order)} L × ${priceL(price)} = <b class="gold">${money(r2(order * price))}</b></span>` : '<span class="muted">No order: any shortfall is delivered at a higher price.</span>'}</span></div>
    <p class="small muted">Tank after the order <b class="mono">${num(after)} L</b> · the week needs about <b class="mono">${num(need)} L</b>${after < need ? ` · <span class="orange">${num(need - after)} L short: delivered when needed at ${priceL(r2(price + (WORLD.fuelTopUp || 0)))}</span>` : ' · enough for the week'}</p></section>`;
}
function bindFuelPanel(){ const lot = WORLD.fuelLot || 500, price = weekFuelPrice(S.day || 1); screen().querySelectorAll('[data-fo]').forEach(b => b.onclick = e => { e.stopPropagation(); let L = +b.getAttribute('data-fo'); L = Math.max(0, Math.round(L / lot) * lot); S.rnd.fuelOrder = L ? { litres:L, price, total:r2(L * price) } : null; UI.justDone = null; resetEntry(); render(); }); }

/* ---------- Plan Impact (the Dragon Air mock-ups): the standing plan's figures for one day, on the plan page's right-hand panel.
   The figures the day's hand sums ask for stay hidden ("work it out") until the workings page is complete, so the sums stay sums. ---------- */
function ctxPlanImpact(pl, L){
  pl = pl || currentPlan(); L = L || planLines(pl); const v = L.v, H = Object.assign({}, decideHandSums(L, pl) || {}, S.rnd.handSums || {}), done = !!(S.rnd.costed && S.rnd.costed.key === planKey(pl));
  const seats = pl.fleet.reduce((t, x) => t + x.sched.length * (planeById(x.planeId).seats || 0), 0), pax = Object.keys(v).filter(k => /^pax_/.test(k)).reduce((t, k) => t + (v[k] || 0), 0);
  const empty = Math.max(0, seats - pax), pct = seats ? Math.round(100 * pax / seats) : 0, paid = fuelPaid(), litres = v.fuelL || 0, ppl = paid ? (v.ppl || fuelPrice()) : 0;
  const hide = k => !done && H[k] && (H[k] === 'calc' || H[k].level === 'calc' || typeof H[k] === 'object');
  const todo = '<span class="pi-v todo">work it out &rarr;</span>';
  const row = (ic, label, sub, val, cls) => `<div class="pi-r ${cls || ''}">${ICON[ic] || ''}<span class="pi-l">${label}${sub ? `<small>${sub}</small>` : ''}</span>${val}</div>`;
  const val = (main, sub, cls) => `<span class="pi-v ${cls || ''}">${main}${sub ? `<small>${sub}</small>` : ''}</span>`;
  const dayCost = pl.fleet.reduce((t, x) => { const f = S.fleet.find(z => z.uid === x.uid); return t + (f ? dayCostOf(f) : 0); }, 0);
  const html = `<p class="dk-sub">Projected results for this plan (per day)</p><div class="pi">
    ${row('pax', 'Projected passengers', '', val(num(pax), seats ? `${pct}% of seats` : ''))}
    ${row('seat', 'Seats available', '', val(num(seats), pl.fleet.filter(x => x.sched.length).map(x => `${x.sched.length} × ${planeById(x.planeId).seats}`).join(' + ')))}
    ${row('seat', 'Empty seats', '', val(num(empty), seats ? `${100 - pct}%` : ''))}
    ${row('cash', 'Ticket revenue', '', hide('revenue') ? todo : val(money(v.rev || 0), pax ? `${num(pax)} × fares` : ''))}
    ${snacksOn() ? row('cash', 'Cabin sales', '', hide('snacks') ? todo : val(money(v.snack || 0), v.buyers ? `${num(v.buyers)} × ${money(v.snackP)}` : '')) : ''}
    ${row('fuel', 'Fuel litres needed', '', val(`${num(litres)} L`, pl.fleet.filter(x => x.sched.length).length ? `${num(Math.round(litres / Math.max(1, pl.fleet.reduce((t, x) => t + x.sched.length, 0))))} L per service` : ''))}
    ${paid ? row('fuel', 'Fuel cost', '', hide('fuelCost') ? todo : val(money(v.fuel || 0), `${num(litres)} L × ${priceL(ppl)}`)) : row('fuel', 'Fuel', '', val('free', 'the launch deal'))}
    ${row('fleet', 'Aircraft and airport', 'day costs + per service', val(money((v.run || 0) + (v.term || 0) + dayCost), `${money(dayCost)} a day`))}
    ${row('cash', 'Total revenue', 'tickets + cabin sales', hide('revenue') || hide('snacks') ? todo : val(money((v.rev || 0) + (v.snack || 0))), 'tot')}
    ${row('cash', 'Total costs', 'fuel + aircraft + airport', hide('fuelCost') ? todo : val(money(v.cost || 0)), 'tot')}
    ${row('profit', 'Projected profit', 'per day', hide('profit') || hide('revenue') || hide('fuelCost') ? todo : val(money(v.profit || 0), '', v.profit < 0 ? 'neg' : ''), 'profit')}
  </div>`;
  const ac = ctxAircraft();
  return { title:'Plan Impact', html: html + ac.html.replace(/^[\s\S]*?(<section class="cx deps">)/, '$1') };
}
