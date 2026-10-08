/* ==================================================================
   WEEK 1 ON THE V4 CALENDAR: hand sums by rule, events before flying, weekends, the cash reserve.
   HandSumRules (workbook sheet) 1–6:
     1 the first time a relationship appears it is done by hand;
     2 again only when an input has moved past its threshold (fuel: price ≥ fuelHandSumPriceStep, litres ≥ fuelHandSumLitresShare;
       revenue: a new route or a new plane; others never);
     3 totals at every review (p4m, the chapter review);
     4 a new route brings passengers × fare and distance ÷ speed, a new plane seats × fare and price ÷ rent;
     5 snacks by hand once, then the model;
     6 the Test plan never costs a hand sum.
   S.skills remembers what has been done by hand (first day, how often, the inputs last time); the teacher's level
   override (S.tools) always wins. The Calendar's gatedCalc column names the sums the rules cannot infer
   (empty seats on day 19, flight time on day 15).
   ================================================================== */
const HAND_TOOLS = ['revenue', 'routeRevenue', 'snacks', 'fuelCost', 'profit', 'emptySeats', 'flightTime', 'rivalStay', 'weekendDemand'];
/* two sums in tenths that the workbook's tool table does not list: defined here, logged like the others */
[{ id:'rivalStay', name:'Passengers who stay', what:'people × the tenths who stay (a rival undercut)', phase:3.4, def:[[2, 'model']] }, { id:'weekendDemand', name:'Weekend travellers', what:'weekday people × the tenths who fly', phase:3.4, def:[[2, 'model']] }].forEach(T => { if(!TOOL[T.id]){ TOOLS.push(T); TOOL[T.id] = T; } });
TABLES.tenths1 = { title:'In tenths', rows:[{ id:'people', label:'People', type:'given', unit:'n' }, { id:'share', label:'Tenths', type:'given', unit:'dec' }, { id:'stay', label:'Stay', type:'calc', unit:'n', op:'×', from:['people', 'share'], sentence:'{people} × {share} = {?stay}', tol:0.5, tool:'rivalStay' }] };
function skills(){ return S.skills || (S.skills = {}); }
function gatedToday(){ const w = roundData(S.round); return String(w.gatedCalc || '').split(',').map(s => s.trim()).filter(Boolean); }
/* The litres the timetable needs (a cancelled service still counts: the rule is about the plan, not today's weather). */
function plannedLitres(pl){ const p = ourPlane(); return (pl.sched || []).reduce((t, id) => t + fuelForTrip(p, routeById(id)), 0); }
function firstLevel(tool){ const T = TOOL[tool]; if(!T) return 'calc'; const lv = (T.def || []).find(([, l]) => l !== 'model'); return lv ? lv[1] : 'calc'; }
/* Which figures the pupil works out today, for this plan. */
function decideHandSums(L, pl){
  const out = {}, sk = skills(), ST = WORLD.settings || {}, f = fleetOne(), planeId = f ? f.planeId : 'dhc6', first = id => !sk[id];
  const seen = sk.revenue || { routes:[], planes:[] };
  const revLevel = id => (!seen.routes.includes(id) || !seen.planes.includes(planeId)) ? (first('revenue') ? 'calc' : 'build') : null;   // rules 1 and 4
  if(pl.sched.includes(S.market)){ const a = revLevel(S.market); if(a) out.revenue = a; }
  if(secondRouteOn() && pl.sched.includes(otherRoute())){ const b = revLevel(otherRoute()); if(b) out.routeRevenue = b; }
  if(snacksOn() && (pl.onboard || 'none') !== 'none' && first('snacks')) out.snacks = 'calc';                                            // rule 5
  if(fuelPaid()){ const fs = sk.fuelCost, price = fuelPrice(), litres = plannedLitres(pl), step = ST.fuelHandSumPriceStep || 0.5, share = ST.fuelHandSumLitresShare || 0.25;
    if(!fs) out.fuelCost = 'calc';                                                                                                        // rule 1
    else if(Math.abs(price - fs.last.price) >= step - 1e-9 || (fs.last.litres > 0 && Math.abs(litres - fs.last.litres) / fs.last.litres >= share - 1e-9)) out.fuelCost = 'calc'; }   // rule 2
  if(first('profit')) out.profit = 'calc'; else if(out.snacks) out.profit = 'build';                                                       // profit by hand on Launch Day, built on snacks day
  const g = gatedToday();
  if(g.includes('emptySeats') && first('emptySeats')) out.emptySeats = 'calc';
  if(g.includes('flightTime') && TOOL.flightTime) out.flightTime = 'calc';
  return out;
}
/* The teacher's level wins; then today's decision; then the old stage defaults (the week and month tables). */
function toolLevel(id){
  const T = TOOL[id]; if(!T) return 'model';
  const o = S && S.tools && S.tools[id]; if(o && (o !== 'build' || T.build)) return o;
  if(S && S.rnd && S.rnd.handSums && HAND_TOOLS.includes(id)) return S.rnd.handSums[id] || 'model';
  return toolDefault(id);
}
function costRowIds(L, pl){
  S.rnd.handSums = decideHandSums(L, pl);
  const two = secondRouteOn() && pl.sched.includes(otherRoute()), sn = snacksOn() && (pl.onboard || 'none') !== 'none', ids = [];
  if(typedRow('tk1')) ids.push('pax1', 'fare1'); ids.push('tk1');
  if(two){ if(typedRow('tk2')) ids.push('pax2', 'fare2'); ids.push('tk2'); }
  if(sn){ if(typedRow('snack')) ids.push('buyers', 'snackP'); ids.push('snack'); }
  ids.push('rev');
  if(fuelPaid() && typedRow('fuel')) ids.push('fuelL', 'ppl', 'fuel');
  ids.push('cost', 'profit');
  return ids;
}
/* Written down when the Cost sheet is complete: what was done by hand today and with which inputs. */
function recordHandSums(L){
  const H = S.rnd.handSums || {}, sk = skills(), f = fleetOne(), planeId = f ? f.planeId : 'dhc6', day = S.day, byHand = Object.keys(H).filter(k => H[k] && H[k] !== 'model');
  const touch = (id, extra) => { const x = sk[id] || (sk[id] = { first:day, count:0, routes:[], planes:[] }); x.count++; x.lastDay = day; Object.assign(x, extra || {}); return x; };
  if(H.revenue || H.routeRevenue){ const x = touch('revenue'); (H.revenue ? [S.market] : []).concat(H.routeRevenue ? [otherRoute()] : []).forEach(id => { if(!x.routes.includes(id)) x.routes.push(id); }); if(!x.planes.includes(planeId)) x.planes.push(planeId); }
  ['snacks', 'profit', 'emptySeats', 'flightTime', 'rivalStay', 'weekendDemand'].forEach(k => { if(H[k]) touch(k); });
  if(H.fuelCost) touch('fuelCost', { last:{ price:fuelPrice(), litres:plannedLitres(currentPlan()) } });
  if(byHand.length) (S.handSumLog = S.handSumLog || []).push({ day, date:dateShort(day), tools:byHand.map(k => `${TOOL[k] ? TOOL[k].name : k} (${LVL[H[k]] || H[k]})`) });
}
/* The teacher panel's list: what has been done by hand so far. */
function handSumLogHtml(){
  const log = (S && S.handSumLog) || []; if(!log.length) return '<p class="small muted">Nothing by hand yet.</p>';
  return `<table class="t-log"><tr><th>Day</th><th>By hand</th></tr>${log.slice(-12).map(x => `<tr><td>${esc(x.date)}</td><td>${x.tools.map(esc).join(', ')}</td></tr>`).join('')}</table>`;
}

/* ---------- the day, by the calendar: the day's event rides between the plan and the cost sheet ---------- */
function startProtoDay(n){
  S.round = n; S.phase = 'round'; S.day = beatDay(n); delete S.needsRestart;
  const f = fleetOne(), w = roundData(n);
  S.rnd = Object.assign(emptyRnd(), { featured:f.uid, focusRoute:schedOf(f)[0] || S.market, headline:w.headline || '', brief:protoBrief(n), event: w.event ? JSON.parse(JSON.stringify(w.event)) : null });
  S.period = newPeriod('day', S.day);
  if(depsOn() && !Array.isArray(S.deps)) S.deps = TIME.day(ourPlane(), schedOf(f), undefined, null).trips.map(t => t.dep);
  S.steps = withIntro([{ t:'hq' }, { t:'planner' }].concat(S.rnd.event ? [{ t:'event' }] : []).concat([{ t:'costPlan' }, { t:'testIdeas' }]).concat(fuelPaid() ? [{ t:'fuelPlan' }] : []).concat([{ t:'ready' }, { t:'fly' }, { t:'results' }]), w);
  S.rnd.cashStart = S.cash; UI.view = null;
  S.si = 0; S.newRoutes = [];
  refreshPlan();
  addNews((w.news || []).slice(0, 2).map(t => ({ tag:'NEWS', text:t })));
  publish(); render();
}
WS_STEPS.push('event'); SHELL_STEPS.push('event');
STAGES.day[0].steps = ['planner', 'event'];
Object.assign(RAIL_LABEL, { event:'Decision' }); Object.assign(SUB_DESC, { event:'Something has happened' });
Object.assign(STEP_HINT, { event:'Something has happened that needs a decision from the airline before today\'s flying. Choose, then check the numbers.' });
/* Stars are banked until reputation goes live (Settings reputationFromDate); cash costs join the day's costs. */
function bankStars(n){ if(!n) return; S.repBank = r2((S.repBank || 0) + n); if(repLive()) S.rep = clamp(S.rep + n, 1, 5); }
function applyEventNow(choice){
  const ev = S.rnd.event, opt = ev.options[choice], e = opt.effects || {}, F = featuredFlight();
  S.rnd.eventChoice = choice; S.rnd.eventWhy = opt.why || '';
  S.rnd.eventCost = e.cash ? r2(-e.cash) : 0;
  bankStars(e.rep || 0);
  if(e.status && F){ S.rnd.status[F.key] = e.status; }
  if((e.refund || e.status === 'CANCELLED') && F){ S.rnd.cancelled = F.key; S.rnd.cancelReason = ev.title; S.rnd.status[F.key] = 'CANCELLED'; }
  if(e.setPrice) Object.keys(e.setPrice).forEach(id => { if(!routeById(id)) return; const v = e.setPrice[id]; S.prices[id] = v === 'match' ? (competitorPrice(routeById(id)) || S.prices[id]) : v; });
  (S.flags = S.flags || {})[ev.id] = choice;
  // D50: advertising halves the share who switch to the rival for the event's duration
  if(ev.advertiseCost && e.cash && Math.abs(e.cash) === ev.advertiseCost) S.rivalAd = { event:ev.id, routes:(ev.affectsRoutes && ev.affectsRoutes.length ? ev.affectsRoutes : [S.market]), untilDay:S.day + ((ev.durationDays || 1) - 1) };
  S.rnd.why.push({ ic:'⚠️', text:`${ev.title}: ${opt.label}. ${S.rnd.eventWhy}`.trim() });
  addNews([{ tag:'EVENT', text:`${ev.title}: ${opt.label}.`, cls:'warn' }]);
  refreshPlan();
}
function undoEvent(){
  const ev = S.rnd.event; if(!ev || S.rnd.eventChoice === undefined) return;
  const opt = ev.options[S.rnd.eventChoice], e = opt.effects || {}, F = S.rnd.cancelled ? S.rnd.flights.find(f => f.key === S.rnd.cancelled) : null;
  bankStars(-(e.rep || 0)); S.rnd.eventCost = 0; if(S.rivalAd && S.rivalAd.event === ev.id) delete S.rivalAd;
  if(S.rnd.cancelled){ delete S.rnd.status[S.rnd.cancelled]; delete S.rnd.cancelled; delete S.rnd.cancelReason; }
  else if(e.status && F) delete S.rnd.status[F.key];
  if(e.setPrice) Object.keys(e.setPrice).forEach(id => { if(routeById(id)) S.prices[id] = S.rnd.pricesBefore && S.rnd.pricesBefore[id] !== undefined ? S.rnd.pricesBefore[id] : routeById(id).basePrice; });
  S.rnd.why = S.rnd.why.filter(w => w.ic !== '⚠️'); delete S.rnd.eventChoice; delete S.rnd.eventWhy;
  refreshPlan();
}
R.event = st => {
  const ev = S.rnd.event; if(!ev){ next(); return; }
  const F = featuredFlight(), picked = S.rnd.eventChoice !== undefined ? S.rnd.eventChoice : st.pick, decided = S.rnd.eventChoice !== undefined;
  const flightLine = F ? `${fmtTime(F.dep)} to ${routeById(F.route).city}` : '';
  const costOf = o => o.effects && o.effects.cash ? money(-o.effects.cash) : null;
  // a rival undercut (D50): for every option, who still flies with him and the day's projected profit, from the engine
  const cmp = (() => { const rid = (ev.affectsRoutes || []).find(id => routeById(id)) || (() => { const o = ev.options.find(x => x.effects && x.effects.setPrice); return o ? Object.keys(o.effects.setPrice).find(id => routeById(id)) : null; })(); if(!rid) return '';
    const r = routeById(rid), rival = competitorPrice(r), cur = S.rnd.pricesBefore && S.rnd.pricesBefore[rid] !== undefined ? S.rnd.pricesBefore[rid] : fareOf(rid); if(rival === undefined || rival >= cur) return '';
    const pl0 = normPlan(currentPlan()), inPlan = pl0.fleet.some(x => x.sched.includes(rid)), other = otherRoute(), otherOpen = other && typeof routeOpen === 'function' && routeOpen(routeById(other));
    const tryOpt = (fare, ad) => { const pl = normPlan(JSON.parse(JSON.stringify(pl0))); pl.prices[rid] = fare; if(!inPlan) pl.fleet[0].sched = pl.fleet[0].sched.map(() => rid).concat(pl.fleet[0].sched.length ? [] : [rid, rid]);
      const keep = S.rivalAd; if(ad) S.rivalAd = { event:ev.id, routes:[rid], untilDay:S.day + ((ev.durationDays || 1) - 1) }; try{ const L = planLines(pl); return { want:demandAt(r, fare), tenths:inTenths(stayShare(r, fare)), stay:paxWant(r, fare), tk:L.v['tk_' + rid] || 0, profit:L.v.profit - (ad ? (ev.advertiseCost || 0) : 0) }; } finally { S.rivalAd = keep; } };
    const rows = ev.options.map(o => { const e = o.effects || {}, fare = e.setPrice && e.setPrice[rid] !== undefined ? (e.setPrice[rid] === 'match' ? rival : e.setPrice[rid]) : cur, ad = !!(ev.advertiseCost && e.cash && Math.abs(e.cash) === ev.advertiseCost); return Object.assign({ label:o.label, fare }, tryOpt(fare, ad)); });
    let paris = ''; if(otherOpen){ const pl = normPlan(JSON.parse(JSON.stringify(pl0))); pl.fleet[0].sched = (pl.fleet[0].sched.length ? pl.fleet[0].sched : [rid, rid]).map(() => other); const L = planLines(pl); paris = `<tr class="alt"><th>Fly ${esc(routeById(other).city)} instead</th><td colspan="4" class="muted">change the plan on the next screen</td><td class="mono"><b>${money(L.v.profit)}</b></td></tr>`; }
    return `<section class="pnl ev-cmp"><div class="pnl-h"><h3>What the model says about ${esc(r.city)} today</h3><span class="muted">${WORLD.rival} at ${money(rival)}: for every £10 you charge above them, 1 in 10 of your passengers switch${inPlan ? '' : ` · if you flew ${esc(r.city)}`}</span></div>
      <table class="ev-t"><thead><tr><th></th><th>Your fare</th><th>Want to fly</th><th>Stay with you</th><th>Tickets</th><th>Profit today</th></tr></thead><tbody>
      ${rows.map(x => `<tr><th>${esc(x.label)}</th><td class="mono">${money(x.fare)}</td><td class="mono">${x.want}</td><td class="mono"><b>${x.stay}</b> <small>(${x.tenths})</small></td><td class="mono">${money(x.tk)}</td><td class="mono"><b>${money(x.profit)}</b></td></tr>`).join('')}${paris}</tbody></table>
      <p class="muted small">Tomorrow you will work out one of these by hand: your passengers × the tenths who stay.</p></section>`; })();
  screen().innerHTML = taskFrame({ question:esc(ev.title), work:false, todo:decided ? 'Press Check the numbers.' : 'Look at the choices, press one, then press Decide.',
    story:[ev.text].concat(F && ev.options.some(o => o.effects && (o.effects.status || o.effects.refund)) ? [`The flight in question is the ${flightLine}.`] : []),
    say:`${ev.title}. ${ev.text} ${ev.options.map((o, i) => `Option ${i + 1}: ${o.label}.`).join(' ')}`,
    context:{ title:'Your airline', html: cxSec('Cash', `<p class="cx-plan mono">${money(S.cash)}</p>`) + cxSec('What it costs', `<p class="small muted">${ev.options.map(o => costOf(o) ? `${esc(o.label)}: ${costOf(o)}` : `${esc(o.label)}: nothing today`).join('. ')}.</p>`) },
    main:`<div class="ev">${cmp}<div class="options ev-opts">${ev.options.map((o, i) => `<button class="opt ${picked === i ? 'on' : ''}" data-o="${i}" aria-pressed="${picked === i}" ${decided ? 'disabled' : ''}><span class="big">${esc(o.label)}</span><span class="sub">${esc(o.sub || '')}</span>${costOf(o) ? `<span class="ev-cost mono">${costOf(o)}</span>` : ''}</button>`).join('')}</div>
      ${decided ? `<div class="ev-why"><b>Decided.</b> ${esc(S.rnd.eventWhy || '')}${S.rnd.eventCost ? ` It costs ${money(S.rnd.eventCost)} today.` : ''} <button class="btn small" id="evUndo">Change your mind</button></div>` : ''}</div>`,
    foot:`<button class="btn primary big" id="nx" ${picked === undefined ? 'disabled' : ''}>${decided ? goLabel('Check the numbers') : 'Decide'} &#9654;</button>` });
  screen().querySelectorAll('[data-o]').forEach(b => b.onclick = () => { st.pick = +b.getAttribute('data-o'); render(); });
  on('evUndo', () => { undoEvent(); st.pick = undefined; render(); });
  on('nx', () => { if(!decided){ S.rnd.pricesBefore = Object.assign({}, S.prices); applyEventNow(st.pick); st.done = true; render(); return; } UI.justDone = null; advance(); });
};

/* ---------- the day's demand: weekends, the Market's business and leisure multipliers, the season ---------- */
let SIM_DAY = null;
function withDay(d, fn){ const k = SIM_DAY; SIM_DAY = d; try{ return fn(); } finally { SIM_DAY = k; } }
function dayFor(n){ if(SIM_DAY !== null) return SIM_DAY; if(S && S.phase === 'round' && n === S.round) return S.day; if(S && S.phase === 'setup') return S.day || 1; return beatDay(n); }
function demandMult(route, day){
  const a = route.arch; if(!a) return 1;
  const ST = WORLD.settings || {}, wd = calDate(day).getUTCDay(), m = marketWeekOf(day) || {}, bs = a.businessShare !== undefined && a.businessShare !== null ? a.businessShare : 0.5;
  let biz = m.businessMult || 1, lei = m.leisureMult || 1;
  if(wd === 6){ biz *= ST.weekendBusinessMultSat || 0.7; lei *= ST.weekendLeisureMult || 1.2; }
  if(wd === 0){ biz *= ST.weekendBusinessMultSun || 0.6; lei *= ST.weekendLeisureMult || 1.2; }
  const ms = m.seasonMult && m.seasonMult[route.id] !== undefined && m.seasonMult[route.id] !== null ? m.seasonMult[route.id] : null;
  const season = ms !== null ? ms : (a.season ? (a.season[seasonOf(day)] || 1) : 1);
  return (bs * biz + (1 - bs) * lei) * season;
}
function weekendNote(route, day){
  const wd = calDate(day).getUTCDay(); if(wd !== 0 && wd !== 6 || !route.arch) return '';
  const bs = route.arch.businessShare || 0; return bs >= 0.5 ? `${WDAY[wd]}: fewer business travellers, so fewer people want to fly ${route.city}.` : `${WDAY[wd]}: more people flying for leisure, so a little more demand for ${route.city}.`;
}
function demandAt(route, price, n){
  const n0 = n === undefined ? S.round : n, w = roundData(n0), dm = w.demandMod || {}, day = dayFor(n0);
  const mod = (dm[route.id] || 0) + (dm.focus && S.rnd && route.id === S.rnd.focusRoute ? dm.focus : 0);
  if(!route.wb){ const grow = n0 >= 2 && route.growth ? Math.min(route.cap || Infinity, route.growth * (n0 - 1)) : 0;
    const base = Math.floor((route.baseDemand + grow + mod) * (1 + homeData().demandPct / 100)); return Math.max(0, Math.floor(base - route.drop * (price - route.basePrice) / route.step)); }
  return Math.max(0, roundSchool((tableAt(route, price) * growthOf(route, n0) * demandMult(route, day) + mod) * homeScale()));
}

/* ---------- the Ready screen: the cash reserve and a warning on a losing plan ---------- */
function reserveState(){
  const fc = S.rnd.myForecast, reserve = WORLD.cashReserve || 0, ST = WORLD.settings || {};
  const proj = fc ? fc.profit : 0, after = r2(S.cash + proj - (S.rnd.fuelOrder ? S.rnd.fuelOrder.total : 0));
  return { reserve, proj, after, block: !!(fc && reserve && S.cash >= reserve && after < reserve && S.phase !== 'setup'), warn: !!(fc && proj < 0 && ST.negativeProjectionWarning !== false) };
}
function readyExtra(row){
  const r = reserveState(), out = [];
  if(S.rnd.event && S.rnd.eventChoice !== undefined) out.push(row('Decision', `${esc(S.rnd.event.title)}: ${esc(S.rnd.event.options[S.rnd.eventChoice].label)}${S.rnd.eventCost ? ` · <span class="mono">${money(S.rnd.eventCost)}</span>` : ''}`, editStep('event'), true));
  if(r.block) out.push(row('Cash reserve', `This plan would leave <span class="mono">${money(r.after)}</span> in the bank, below the <span class="mono">${money(r.reserve)}</span> reserve.`, editStep('planner'), false, 'Change the plan'));
  else if(r.warn) out.push(row('Warning', `This plan is projected to <b>lose ${money(-r.proj)}</b>. You can still fly it, or go back and change it.`, editStep('planner'), true));
  return out.join('');
}
function readyOk(){ return !reserveState().block; }

/* ---------- what's new on days 5 and 6 ---------- */
Object.assign(INTRO, {
  crew:{ kicker:'New today · Crew', title:'A long day needs two crews', before:'planner', words:[['Duty', 'The crew\'s working day: from 30 minutes before the first departure to 30 minutes after the last landing.'], ['Second crew', () => `A second crew costs ${money(WORLD.crewCost || 250)} for the day.`]],
    what:() => { const p = ourPlane(), f = fleetOne(), sched = f ? schedOf(f) : [], D = sched.length ? TIME.day(p, sched) : null, pad = WORLD.crewPadMin || 30;
      const d0 = D ? D.trips[0].dep - pad : 330, d1 = D ? D.end + pad : 1140, dur = d1 - d0;
      return [['Pilots and cabin crew can only work so many hours in a day. Duty starts 30 minutes before the first departure and ends 30 minutes after the last landing.'],
        `<div class="ni-flow"><div><span class="kl">Duty starts</span><b class="mono">${fmtTime(d0)}</b><small>30 min before the first departure</small></div><i>→</i><div><span class="kl">Duty ends</span><b class="mono">${fmtTime(d1)}</b><small>30 min after the last landing</small></div><i>→</i><div><span class="kl">Duty today</span><b class="mono">${fmtDur(dur)}</b><small>${dur > (WORLD.crewDutyMin || 720) ? 'over 12 hours: two crews' : 'within 12 hours: one crew'}</small></div></div>`,
        [`If duty is more than <b>12 hours</b>, the airline needs a second crew, and that costs <b>${money(WORLD.crewCost || 250)}</b> for the day.`, 'A late evening service can be worth it, but the second crew is part of its cost.']]; },
    maths:() => [niRule('duty end', '−', 'duty start', 'Duty'),
      `<div class="ni-eg"><p>First departure <b>06:30</b>, so duty starts at <b>06:00</b>. Last landing <b>18:45</b>, so duty ends at <b>19:15</b>.</p>
        <p>From 06:00 to 19:15 is ${niSum('13 h 15 min')}. That is more than 12 hours, so a second crew is needed: ${niSum(money(WORLD.crewCost || 250))}.</p>
        <p class="ni-tip">Count on in hours first: 06:00 → 18:00 is 12 hours; then 18:00 → 19:15 is 1 hour 15 minutes more.</p></div>`],
    check:{ q:'Duty starts at 06:00 and ends at 17:30. How long is the duty day?', opts:[['11 h 30 min', ''], ['12 h 30 min', 'From 06:00 to 18:00 would be 12 hours, and 17:30 is before 18:00.'], ['11 h', 'From 06:00 to 17:00 is 11 hours, and there are 30 minutes more to 17:30.']], ok:0, done:'06:00 to 17:30 is 11 hours 30 minutes: one crew is enough.' },
    think:['Is the evening service worth a second crew?', 'The Plan screen shows how long the aircraft is busy. The Cost sheet shows the second crew when it is needed.'] },
  weekend:{ kicker:'New today · The weekend', title:'Who flies at the weekend?', before:'planner', words:[['Business traveller', 'Someone flying for work. Most of them fly on weekdays.'], ['Leisure traveller', 'Someone flying for a holiday or to see people. More of them fly at the weekend.']],
    what:() => { const ST = WORLD.settings || {}, r = routeById(S.market), bs = r.arch ? Math.round((r.arch.businessShare || 0) * 100) : 50;
      return [['As the CEO you will be given statistics like these. Use them to make the best decision you can.', 'Weekends are different. Offices are closed, so fewer business travellers fly. More people fly for leisure.'],
        `<div class="ni-cards two"><div class="ni-card"><em>${Math.round((ST.weekendBusinessMultSat || 0.7) * 10)} in 10</em><b>Business travellers</b><span>On Saturday ${Math.round((ST.weekendBusinessMultSat || 0.7) * 10)} in 10 of the weekday business travellers fly; on Sunday ${Math.round((ST.weekendBusinessMultSun || 0.6) * 10)} in 10.</span></div><div class="ni-card"><em>${Math.round((ST.weekendLeisureMult || 1.2) * 10) - 10} in 10 more</em><b>Leisure travellers</b><span>At the weekend ${Math.round((ST.weekendLeisureMult || 1.2) * 10) - 10} in 10 more want to fly than on a weekday.</span></div></div>`,
        [`${bs}% of ${esc(r.city)}'s passengers travel for business, so ${esc(r.city)} is ${bs >= 50 ? 'quieter' : 'busier'} at the weekend.`, 'The plan already counts this: look at how many want to fly today.']]; },
    maths:() => [niRule('weekday business travellers', '×', '0.7', 'Saturday business travellers'),
      `<div class="ni-eg"><p>On a weekday <b>40</b> business travellers want to fly. On Saturday 7 in 10 of them fly. 7 in 10 is the same as 70%, or 0.7.</p>
        <div class="ni-col"><span class="r">one tenth of 40</span><span class="eq">=</span><span class="a">4</span><span class="note"></span><span class="r">7 tenths: 7 × 4</span><span class="eq">=</span><span class="a">28</span><span class="note">so 40 × 0.7 = 28 business travellers</span></div>
        <p>Leisure travellers go the other way: 2 in 10 more, so a tenth is added twice.</p></div>`],
    practice:'weekend',
    check:{ q:'On a weekday 40 business travellers fly. On Saturday 7 in 10 of them fly. How many is that?', opts:[['28', ''], ['33', '33 is more than 7 in 10 of 40. One tenth of 40 is 4, so 7 tenths is 7 × 4.'], ['47', '47 is more than 40: fewer business travellers fly on Saturday, not more.']], ok:0, done:'7 in 10 of 40 is 28 business travellers.' },
    think:['Will the same timetable fill the aircraft today?', 'Try a lower fare or fewer services in the Test step and see what the model says.'] } });
if(!MECH_INTRO.some(x => x[1] === 'crew') && !(WB && WB.settings && (WB.settings.crewMechanicFromDate || WB.settings.crewFromDate))) MECH_INTRO.push(['crew duty', 'crew']);
