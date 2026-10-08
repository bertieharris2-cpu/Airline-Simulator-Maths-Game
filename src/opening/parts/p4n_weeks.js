/* ==================================================================
   THE WEEKS (day 22, Monday 23 September, to Sunday 1 December): the Market sheet runs the airline a week at a time.
     - Each week: review (load factor as a percentage from Settings loadFactorPercentFromDay), the shop, the plan for
       every aircraft, the Cost sheet (hand sums only when HandSumRules 2 and 4 fire: a fuel jump, a new route), Test,
       Ready, the run, results.
     - The Market gives fuel, season, business and leisure multipliers and the weather; dated Events ride on their week.
       An event with choices (the technical fault) is decided before the week runs; its cost is a share of yesterday's
       profit from day 22 (Settings eventCostScaleFromDay, the Events sheet's costShare). An event without choices
       (football final, price war, first snow, Christmas) is applied from the sheet's effects text.
     - The teacher can skip 1, 4 or 8 weeks: the standing plan runs by itself (Settings timeSkip is a placeholder; the
       values are the brief's).
   ================================================================== */
function weekProjected(){ return S.phase === 'round' && PW().span === 'week' && !!roundData(S.round).projectWeek; }
function stepsFor(b){
  const w = roundData(b), st = w.stage ? [{ t:'milestone', stage:w.stage }] : [], L = a => withIntro(st.concat(a.map(t => ({ t }))), w);
  if(w.period === 'gap') return L(['sim', 'results']);
  if(w.period === 'week') return L(['hq', 'review', 'shop2', 'planner'].concat(w.events && w.events.some(e => e.options && e.options.length) ? ['event'] : []).concat(['costPlan', 'testIdeas', 'ready', 'sim', 'results']));
  if(w.period === 'month') return L(['hq', 'review', 'shop2', 'fuelPlan', 'plans', 'ready', 'sim', 'results']);
  if(w.period === 'review') return L(['hq', 'review', 'chapterReview', 'protoEnd']);
  return L(['hq', 'plan', 'workings', 'ready', 'fly', 'results']);
}
/* The effects text of an event without choices: "demand mad+40 par+10 dub+10", "gva demand +20", "businessMult 0.7, leisureMult 1.3", "cuts every fare by 20%". */
function infoEffects(ev){
  const t = String((ev && (ev.effectsText || ev.effects)) || '') + ' ' + String((ev && ev.text) || ''), out = { demandMod:{} };
  let m; const re1 = /\b([a-z]{3})\s*([+-]\d+)\b/g; while((m = re1.exec(t))){ if(routeById(m[1])) out.demandMod[m[1]] = (out.demandMod[m[1]] || 0) + parseInt(m[2], 10); }
  const re2 = /\b([a-z]{3}) demand ([+-]\d+)/g; while((m = re2.exec(t))){ if(routeById(m[1])) out.demandMod[m[1]] = parseInt(m[2], 10); }
  const b = /businessMult\s*([\d.]+)/.exec(t); if(b) out.biz = +b[1]; const l = /leisureMult\s*([\d.]+)/.exec(t); if(l) out.lei = +l[1];
  const c = /cuts every fare by (\d+)%/.exec(t); if(c || /rival fares/.test(t)) out.rivalCut = c ? +c[1] / 100 : 0.2;
  return out;
}
/* The fault's three choices come from the Events sheet's text ("fix £800 +½★ / fly −1★ / wait: plane misses next day"). */
function weekChoiceEvent(w){
  const e = (w.events || []).find(x => x.options && x.options.length) || (w.events || []).find(x => x.id === 'fault'); if(!e) return null;
  if(e.options && e.options.length) return JSON.parse(JSON.stringify(e));
  return { id:e.id, day:e.day, date:e.date, title:e.title, text:e.text, costShare:'fix 0.5 / wait 0 / fly 0', options:[
    { key:'fix', label:'Fix it now', sub:'Engineers replace the part before the flight', effects:{ cash:-800, rep:0.5 }, why:'The engineers fixed it. It cost money, but passengers trust you: +½ star.' },
    { key:'fly', label:'Fly anyway', sub:'The light is probably nothing', effects:{ rep:-1 }, why:'The flight went, but word got round that you flew with a warning light: −1 star.' },
    { key:'wait', label:'Wait for the part', sub:'The aircraft misses a day', effects:{ groundNext:true }, why:'The aircraft sat on the ground for a day while the part came. No flying, no fares.' }] };
}
function costShareOf(ev, opt){ const s = String(ev.costShare || ''); if(!s || /fixed/.test(s)) return null; const key = (opt.key || opt.label || '').toLowerCase().split(/\s+/)[0]; const m = new RegExp(key + '\\s+([\\d.]+)').exec(s); return m ? +m[1] : null; }
function yesterdayProfit(){ const h = lastHist(); if(!h) return 0; const n = Math.max(1, (h.to || h.from || 0) - (h.from || 0) + 1); return r2((h.profit || 0) / n); }
function startBeat(b){
  const w = roundData(b), last = S.period && S.phase === 'round' ? S.period.to : S.day;
  S.round = b; S.phase = 'round'; delete S.needsRestart;
  S.day = Math.max(beatDay(b), (last || 0) + 1);
  S.period = newPeriod(w.period === 'gap' ? 'gap' : w.period, S.day);
  if(w.until) S.period.run = { kind:'until', to: dayOfDate(w.until) };
  const keep = { featured:S.rnd.featured, focusRoute:S.rnd.focusRoute, avgMonth:S.rnd.avgMonth, skippedNote:S.rnd.skippedNote };
  S.fleet.forEach(f => { f.grounded = false; }); S.disrupt = null;
  if((w.period === 'week' || w.period === 'gap') && typeof returnTankFuel === 'function') returnTankFuel();
  const ev = weekChoiceEvent(w), infos = (w.events || []).filter(x => !(x.options && x.options.length) && !(ev && x.id === ev.id));
  const mods = { demandMod:{}, notes:[] }, m = w.market || {};
  infos.forEach(x => { const fx = infoEffects(x); Object.assign(mods.demandMod, fx.demandMod); if(fx.rivalCut) mods.rivalCut = fx.rivalCut;
    if(fx.biz && (m.businessMult === undefined || m.businessMult === 1)) mods.biz = fx.biz; if(fx.lei && (m.leisureMult === undefined || m.leisureMult === 1)) mods.lei = fx.lei; mods.notes.push(`${x.title}: ${x.text}`); });
  S.rnd = Object.assign(emptyRnd(), keep, { headline: w.headline || '', event: ev, eventDay: ev ? ev.day : null, weekMods: mods });
  S.rnd.brief = periodBrief(); if(typeof revealReputation === 'function') revealReputation();
  S.rnd.cashStart = S.cash; S.rnd.fuelStart = S.fuel;
  S.steps = stepsFor(b); S.si = 0; S.newRoutes = []; UI.view = null;
  refreshPlan(); addNews((w.news || []).slice(0, 2).map(t => ({ tag:'NEWS', text:t })));
  publish(); render();
}
function periodBrief(){
  const h = lastHist(), w = roundData(S.round), L = [];
  if(S.rnd && S.rnd.skippedNote){ L.push(S.rnd.skippedNote); }
  if(h) L.push(`${capFirst(periodShort(h))}: ${num(h.pax)} passengers flew, ${h.profit >= 0 ? 'profit' : 'loss'} ${money(Math.round(Math.abs(h.profit)))}${h.seats && S.day >= ((WORLD.settings || {}).loadFactorPercentFromDay || 22) ? `, load factor ${Math.round(100 * h.pax / h.seats)}%` : ''}.`);
  const fp = fuelPrice(), fy = fuelPrice(Math.max(0, S.round - 1)); if(fp !== fy) L.push(`Fuel is ${priceL(fp)} a litre ${PW().now} (was ${priceL(fy)}).`);
  const opening = WORLD.routes.filter(r => (r.openDay || 1) > (S.period ? S.period.from - (S.period.to - S.period.from + 1) : 0) && (r.openDay || 1) <= S.day && (r.openDay || 1) > 21); if(opening.length) L.push(`New route${opening.length > 1 ? 's' : ''}: ${opening.map(r => r.city).join(', ')}.`);
  if(S.rnd && S.rnd.weekMods && S.rnd.weekMods.notes.length) L.push(S.rnd.weekMods.notes[0]);
  if(w.weather && !/clear/i.test(w.weather)) L.push(`Weather ${PW().now}: ${w.weather}.`);
  return L.slice(0, 4);
}
/* The Market's and the week's events shape demand. */
function competitorPrice(route, n){
  const w = roundData(n === undefined ? S.round : n), M = S && S.rnd && S.rnd.weekMods;
  if(M && M.rivalCut && ownedRoutes().includes(route.id)) return Math.max(5, Math.round(fareOf(route.id) * (1 - M.rivalCut) / 5) * 5);
  if(!w.competitor) return undefined;
  if(w.competitor[route.id] !== undefined) return w.competitor[route.id];
  return undefined;
}
const demandMult0 = (route, day) => {
  const a = route.arch; if(!a) return 1;
  const ST = WORLD.settings || {}, wd = calDate(day).getUTCDay(), m = marketWeekOf(day) || {}, M = S && S.rnd && S.rnd.weekMods, bs = a.businessShare !== undefined && a.businessShare !== null ? a.businessShare : 0.5;
  let biz = (M && M.biz) || m.businessMult || 1, lei = (M && M.lei) || m.leisureMult || 1;
  if(wd === 6){ biz *= ST.weekendBusinessMultSat || 0.7; lei *= ST.weekendLeisureMult || 1.2; }
  if(wd === 0){ biz *= ST.weekendBusinessMultSun || 0.6; lei *= ST.weekendLeisureMult || 1.2; }
  const ms = m.seasonMult && m.seasonMult[route.id] !== undefined && m.seasonMult[route.id] !== null ? m.seasonMult[route.id] : null;
  const season = ms !== null ? ms : (a.season ? (a.season[seasonOf(day)] || 1) : 1);
  return (bs * biz + (1 - bs) * lei) * season;
};
function demandMult(route, day){ return demandMult0(route, day); }
function demandAt(route, price, n){
  const n0 = n === undefined ? S.round : n, w = roundData(n0), M = S && S.rnd && S.rnd.weekMods, dm = Object.assign({}, w.demandMod || {}, M ? M.demandMod : {}), day = dayFor(n0);
  const mod = (dm[route.id] || 0) + (dm.focus && S.rnd && route.id === S.rnd.focusRoute ? dm.focus : 0);
  if(!route.wb){ const grow = n0 >= 2 && route.growth ? Math.min(route.cap || Infinity, route.growth * (n0 - 1)) : 0;
    const base = Math.floor((route.baseDemand + grow + mod) * (1 + homeData().demandPct / 100)); return Math.max(0, Math.floor(base - route.drop * (price - route.basePrice) / route.step)); }
  return Math.max(0, roundSchool((tableAt(route, price) * growthOf(route, n0) * demandMult(route, day) + mod) * homeScale()));
}
/* An event decided before the week: its cost is a share of yesterday's profit from day 22; "wait" grounds the aircraft for a day. */
function applyEventNow(choice){
  const ev = S.rnd.event, opt = ev.options[choice], e = opt.effects || {}, F = featuredFlight(), ST = WORLD.settings || {};
  S.rnd.eventChoice = choice; S.rnd.eventWhy = opt.why || '';
  const share = costShareOf(ev, opt), scaled = S.day >= (ST.eventCostScaleFromDay || 22) && share !== null;
  S.rnd.eventCost = scaled ? Math.max(0, Math.round(share * Math.max(0, yesterdayProfit()))) : (e.cash ? r2(-e.cash) : 0);
  if(scaled) S.rnd.eventCostNote = `${Math.round(share * 100)}% of yesterday's profit (${money(yesterdayProfit())})`;
  bankStars(e.rep || 0);
  if(PW().span === 'day'){
    if(e.status && F){ S.rnd.status[F.key] = e.status; }
    if((e.refund || e.status === 'CANCELLED') && F){ S.rnd.cancelled = F.key; S.rnd.cancelReason = ev.title; S.rnd.status[F.key] = 'CANCELLED'; }
  } else if(e.groundNext || e.refund || e.status === 'CANCELLED'){ const ff = featuredFleet() || S.fleet[0]; if(ff) S.disrupt = { uid:ff.uid, ground:true, day:(S.rnd.eventDay || S.period.from) + (e.groundNext ? 1 : 0) }; }
  if(e.setPrice) Object.keys(e.setPrice).forEach(id => { if(!routeById(id)) return; const v = e.setPrice[id]; S.prices[id] = v === 'match' ? (competitorPrice(routeById(id)) || S.prices[id]) : v; });
  (S.flags = S.flags || {})[ev.id] = choice;
  S.rnd.why.push({ ic:'⚠️', text:`${ev.title}: ${opt.label}. ${S.rnd.eventWhy}`.trim() });
  addNews([{ tag:'EVENT', text:`${ev.title}: ${opt.label}.`, cls:'warn' }]);
  refreshPlan();
}
function undoEvent(){
  const ev = S.rnd.event; if(!ev || S.rnd.eventChoice === undefined) return;
  const opt = ev.options[S.rnd.eventChoice], e = opt.effects || {}, F = S.rnd.cancelled ? S.rnd.flights.find(f => f.key === S.rnd.cancelled) : null;
  bankStars(-(e.rep || 0)); S.rnd.eventCost = 0; delete S.rnd.eventCostNote; S.disrupt = null;
  if(S.rnd.cancelled){ delete S.rnd.status[S.rnd.cancelled]; delete S.rnd.cancelled; delete S.rnd.cancelReason; }
  else if(e.status && F) delete S.rnd.status[F.key];
  if(e.setPrice) Object.keys(e.setPrice).forEach(id => { if(routeById(id)) S.prices[id] = S.rnd.pricesBefore && S.rnd.pricesBefore[id] !== undefined ? S.rnd.pricesBefore[id] : routeById(id).basePrice; });
  S.rnd.why = S.rnd.why.filter(w => w.ic !== '⚠️'); delete S.rnd.eventChoice; delete S.rnd.eventWhy;
  refreshPlan();
}
/* The hand sums of a week or a month: a day of the plan on the Cost sheet, only when a rule fires. */
function periodHandTable(pl, L){
  const H = decideHandSums(L, pl); S.rnd.handSums = H;
  const by = Object.keys(H).filter(k => H[k] && H[k] !== 'model' && k !== 'flightTime'); if(!by.length) return null;
  const tid = 'dcost:' + S.day, prev = S.rnd.tables[tid], v0 = L.v;
  const parts = { run:flightParts(pl), day:dayParts(), cost:[['Flights', money(v0.run)], ['Fuel', money(v0.fuel)], ['Terminal charges', money(v0.term)]].concat(v0.stock ? [['Snack stock', money(v0.stock)]] : []).concat(v0.crew ? [['Second crew', money(v0.crew)]] : []).concat([["Aircraft's day", money(v0.day)]]) };
  const t = ensureTable(tid, 'cost1', [{ id:'a', label:'One day of the plan', sub:planLabel(pl).split(' · ').slice(0, 2).join(' · '), values:Object.assign({}, v0), parts }], { rows:costRowsFor(L), rowIds:costRowIds(L, pl), labels:costLabels() });
  if(t !== prev) t.active = null; return t;
}
function flightTimeTable(pl){
  const H = S.rnd.handSums; if(!H || !H.flightTime) return null;
  const rid = H.flightTime.route, r3 = routeById(rid), p3 = flightTimePlane(pl, rid), km = routeKm(r3), tid3 = `time:${S.day}:${rid}:${p3.id}`, prev3 = S.rnd.tables[tid3];
  const t3 = ensureTable(tid3, 'time1', [{ id:'t', label:`${r3.city} by ${p3.name.replace(/^DHC-6 /, '')}`, sub:`${num(km)} km at ${num(p3.speed)} km/h`, values:{ km, speed:p3.speed, hours:r2(km / p3.speed) } }]); t3.rid = rid;
  if(t3 !== prev3) t3.active = null; return t3;
}
function loadFactorLine(T){ if(!T || !T.seats || S.day < ((WORLD.settings || {}).loadFactorPercentFromDay || 22)) return ''; const pct = Math.round(100 * T.pax / T.seats); return `<p class="dr-fc">Load factor <b class="mono">${pct}%</b>: ${num(T.pax)} passengers in ${num(T.seats)} seats.</p>`; }
/* The review's sum, once each: how profit changed (two periods), the average a week (three), the average a day (a month). */
function reviewSpec(){
  const H = S.history.filter(x => x.type !== 'setup'), h = H[H.length - 1], wk = H.filter(x => x.type === 'week'), sk = skills();
  if(!h) return null;
  if(h.type === 'month' && !sk.averageDay){ const n = h.to - h.from + 1; return { id:'averageDay', title:'What is the average profit a day?', col:periodShort(h), rows:['total', 'n', 'avg'], values:{ total:h.profit, n, avg:Math.round(h.profit / n) }, labels:{ total:`Profit in ${periodShort(h)} (${fmtRange(h.from, h.to)})`, n:'Days', avg:'Average profit a day' } }; }
  if(wk.length >= 3 && !sk.averageWeek){ const w3 = wk.slice(-3), tot = w3.reduce((t, x) => t + x.profit, 0);
    return { id:'averageWeek', title:'What is the average profit a week?', col:'Weeks', rows:['total', 'n', 'avg'], values:{ total:tot, n:3, avg:Math.round(tot / 3) }, labels:{ total:'Total profit, three weeks', n:'Weeks', avg:'Average profit a week' }, parts:{ total:w3.map(x => [periodShort(x), money(x.profit)]) } }; }
  if(wk.length >= 2 && !sk.difference){ const a = wk[wk.length - 2], c = wk[wk.length - 1], up = c.profit >= a.profit;
    return { id:'difference', title:'How much did weekly profit change?', col:periodShort(c), rows:['prev', 'last', up ? 'rise' : 'fall'], values:{ prev:a.profit, last:c.profit, rise:c.profit - a.profit, fall:a.profit - c.profit }, labels:{ prev:`Profit in ${periodShort(a)}`, last:`Profit in ${periodShort(c)}` } }; }
  return null;
}
const review0 = R.review;
R.review = () => { const spec = reviewSpec(); review0(); if(spec){ const t = S.rnd.tables['rev:' + S.round]; if(t && tableComplete(t) && !skills()[spec.id]){ skills()[spec.id] = { first:S.day, count:1 }; (S.handSumLog = S.handSumLog || []).push({ day:S.day, date:dateShort(S.day), tools:[spec.title] }); } } };

/* ---------- the teacher's skip: the standing plan runs by itself for 1, 4 or 8 weeks ---------- */
function autoSkip(n){
  if(!S || S.phase !== 'round' || periodType() !== 'week' || !(n > 0)) return false;
  let b = S.round, skipped = 0;
  const keep = { featured:S.rnd.featured, focusRoute:S.rnd.focusRoute };
  for(let i = 0; i < n; i++){
    const w = WORLD.rounds[b]; if(!w || w.period !== 'week') break;
    S.round = b; S.period = newPeriod('week', Math.max(beatDay(b), S.day)); S.day = S.period.from;
    S.rnd = Object.assign(emptyRnd(), keep, { headline:w.headline || '', weekMods:{ demandMod:{}, notes:[] }, auto:true });
    S.fleet.forEach(f => { f.grounded = false; }); S.disrupt = null;
    refreshPlan(); S.rnd.sim = simulateRun(); applyPeriodResults(); skipped++;
    const nb = beatStartingOn(S.period.to + 1); if(nb === null) break; b = nb;
  }
  S.skipped = (S.skipped || 0) + skipped;
  S.rnd.skippedNote = `${skipped} week${skipped === 1 ? '' : 's'} skipped: your standing plan ran by itself, and any event was left to run its course.`;
  addNews([{ tag:'SKIP', text:`${skipped} week${skipped === 1 ? '' : 's'} ran on the standing plan.`, cls:'warn' }]);
  startBeat(b); return true;
}
document.addEventListener('click', e => {
  const t = e.target; if(!t || t.id !== 'tSkipGo') return;
  const sel = document.getElementById('tSkipN'), n = sel ? +sel.value : 0;
  if(!n){ toast('Choose how many weeks to skip.'); return; }
  if(periodType() !== 'week' || S.phase !== 'round'){ toast('Skips are for the weeks (from day 22) only.'); return; }
  if(typeof teacherClose === 'function') teacherClose();
  autoSkip(n);
});
