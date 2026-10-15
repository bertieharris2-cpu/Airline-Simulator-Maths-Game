/* ==================================================================
   DECISION SUPPORT (Workbook v5.7, D87: Fable's brief "Decision support: from information to action", 15 Oct 2026) and
   WHAT WAS IT WORTH? (D88).
   The pupils had the information and did not act on it: three Paris flights in the quiet part of the day; a Saab parked
   while Keep plan was pressed. The game turns its PlanTips into things to do:
   1. The operations check: the one or two tips with the most money at stake (worked out by the engine, never shown to the
      pupil), each with its action button. The plan's own button goes quiet ("Run anyway") while a priority 0–1 tip fires.
      It never blocks. Three new tips: plane_unused, loss_making_service, plan_loses_money.
   2. Blocks show their own fill while they move; one line after a change (seats a → b · profit £x → £y); a full route with
      people turned away shows the fare chips with the fill at each; "Plan improved" once the projection beats the plan
      the page opened with.
   3. The trade-offs drawer lists the tips, each with its button.
   4. The Sunday review names the biggest missed opportunity and opens next week's plan on it; the missed profit is words
      for the pupil (missedProfitDisplay), figures on the teacher panel and the printout.
   5. Guided experiments (planningSupport, experimentFlow): choose what to test, predict, change one thing, model, compare,
      decide. Never a recommended plan, never the best result. "Help me investigate" on the plan and the review.
   6. The record logs each experiment; experiments are Build steps, outside the sign-off cap.
   D88: one line for what a change was worth (a fare, a time, a service): a Build the first time for each kind, then the
   model's. The Sunday review repeats it for the week. Rule: figures for changes the pupil made or tested; words for what is
   still available. Functions shared with the main game are reassigned here, never redeclared.
   ================================================================== */
const dsSet = k => WBS()[k];
const dsOn = k => { const v = dsSet(k); return v !== undefined && v !== null && v !== false && String(v).toLowerCase() !== 'off'; };
function dsS(){ const d = S.ds || (S.ds = {}); d.log = d.log || []; d.exps = d.exps || []; d.built = d.built || {}; d.reviews = d.reviews || []; d.worth = d.worth || {}; return d; }
const DS_LEVELS = ['guided', 'supported', 'independent', 'management'];
function dsLevel(){ const l = S && S.ds && S.ds.level; return DS_LEVELS.includes(l) ? l : DS_LEVELS.includes(dsSet('planningSupport')) ? dsSet('planningSupport') : 'guided'; }
const dsPlanPage = () => S && step() && step().t === 'plan' && typeof UI.s2 === 'object' && UI.s2 && UI.s2.mode !== 'network' && !UI.view && !S.overlay;

/* ---------- 1. the tips: the three new conditions, the workbook's buttons and experiments ---------- */
[['plane_unused', 1, '{plane} has no flights. It costs £{dayCost} a day parked.'], ['loss_making_service', 1, '{band} {route} loses £{loss} a trip.'],
 ['plan_loses_money', 0, 'This plan loses £{loss} a day. The biggest opportunity is {topTip}.']].forEach(r => { if(!PLAN_TIPS_DEFAULT.some(x => x[0] === r[0])) PLAN_TIPS_DEFAULT.push(r); });
/* the plan's own day: the projection without the day's one-off charges (a finance payment on the 1st, an event's bill), which are not the plan losing money */
const dsOp = L => L && L.v ? L.v.profit + (L.v.event || 0) : 0;
const DS_WB = (() => { try{ return Object.fromEntries(((WB && WB.planTips) || []).map(t => [t.id, t])); }catch(e){ return {}; } })();
const dsPlanTips0 = planTipsFor;
planTipsFor = function(pl, L, opts){
  opts = opts || {}; pl = normPlan(pl);
  if(!dsOn('operationsCheck')) return dsPlanTips0(pl, L, opts);
  const T = Object.fromEntries(planTipTable().map(t => [t.id, t])), extra = [], day = S.day || 1;
  // a plane with no flights in the plan (one bought today and not flying until tomorrow is not idle)
  pl.fleet.forEach(x => { if(x.sched.length) return; const f = S.fleet.find(z => z.uid === x.uid), p = planeById(x.planeId); if(!f || (f.flyFrom && f.flyFrom > day) || (f.returnOn && f.returnOn < day)) return;
    extra.push({ id:'plane_unused', priority:T.plane_unused.priority, weight:1e5 + (p.dayCost || 0), text:fillTip(T.plane_unused.message, { plane:shortPlane(p), dayCost:num(Math.round(dayCostOf(f))) }), uid:x.uid }); });
  // a service whose tickets do not cover its own flying, fuel, landing and passenger costs (overnight and two-leg rotations are left out: their money falls on one day)
  let fl = []; try{ fl = withPlan(pl, () => planFlights()).filter(z => !z.grounded); }catch(e){ fl = []; }
  const X = fl.length ? withPlan(pl, () => dayExtras(fl)) : {}, pax = fl.reduce((t, z) => t + (z.sold || 0), 0), per = pax ? (X.term || 0) / pax : 0;
  fl.forEach(z => { const r = routeById(z.route); if(!r || (r.rotationDays || 1) > 1 || r.legs || z.homeLeg) return;
    const own = (z.revenue !== undefined ? z.revenue : z.sold * z.price) - (z.runCost || 0) - (z.fuelCost || 0) - (z.sold || 0) * per;
    if(own < -0.5) extra.push({ id:'loss_making_service', priority:T.loss_making_service.priority, weight:-own, text:fillTip(T.loss_making_service.message, { band:BAND_SHORT[z.band || bandOf(z.dep)] || '', route:r.city, loss:num(Math.round(-own)) }), route:z.route, uid:z.uid, k:z.trip, dep:z.dep, loss:-own }); });
  const unused = new Set(extra.filter(h => h.id === 'plane_unused').map(h => shortPlane(planeById(pl.fleet.find(x => x.uid === h.uid).planeId))));
  const base = dsPlanTips0(pl, L, Object.assign({}, opts, { all:true })).filter(h => !['all_good', 'general_tradeoff'].includes(h.id)).filter(h => !(h.id === 'idle_plane' && [...unused].some(n => h.text.startsWith(n) && /all day/.test(h.text))));
  let list = base.concat(extra);
  // the whole plan loses money: priority 0, naming the biggest opportunity among the others
  if(L && L.v && dsOp(L) < -0.5 && pl.fleet.some(x => x.sched.length)){ const top = list.slice().sort((a, b) => a.priority - b.priority || (b.weight || 0) - (a.weight || 0))[0];
    list.push({ id:'plan_loses_money', priority:T.plan_loses_money.priority, weight:1e9, text:fillTip(T.plan_loses_money.message, { loss:num(Math.round(-dsOp(L))), topTip:top ? dsPhrase(dsTarget(Object.assign({}, top), pl, L)) : 'a new plan' }) }); }
  list = list.sort((a, b) => a.priority - b.priority || (b.weight || 0) - (a.weight || 0));
  if(!list.length) return dsPlanTips0(pl, L, opts);
  if(opts.all) return list;
  const seen = new Set(); return list.filter(h => { if(seen.has(h.id)) return false; seen.add(h.id); return true; }).slice(0, 2);
};
/* what a tip is about: its route, band, aircraft and flight (read from the plan; the older tips name them in their words) */
function dsTarget(h, pl, L){
  pl = normPlan(pl); const t = h.text || '', svc = (L && L.services) || [];
  if(!h.route){ const ids = [...new Set(pl.fleet.flatMap(x => x.sched).concat(plannerRoutes()))].filter(id => routeById(id) && t.includes(routeById(id).city)).sort((a, b) => routeById(b).city.length - routeById(a).city.length); h.route = ids[0] || null; }
  if(!h.band){ const b = BANDS.find(b => new RegExp('(^|[^a-z-])' + String(BAND_SHORT[b] || b).toLowerCase().replace(/[-]/g, '\\-') + '([^a-z-]|$)', 'i').test(t)); h.band = b || null; }
  if(h.uid === undefined && ['idle_plane', 'long_leg_warning', 'range_fail'].includes(h.id)){ const j = pl.fleet.map((x, q) => q).filter(q => t.includes(shortPlane(planeById(pl.fleet[q].planeId))));
    const pick = h.id === 'idle_plane' ? j.sort((a, b) => pl.fleet[a].sched.length - pl.fleet[b].sched.length)[0] : h.route ? j.find(q => pl.fleet[q].sched.includes(h.route)) : j[0]; if(pick !== undefined) h.uid = pl.fleet[pick].uid; }
  if(h.k === undefined && h.route && ['service_weak', 'peak_unserved', 'long_leg_warning', 'fare_too_high', 'turned_away', 'fare_lower_fills', 'fare_too_low'].includes(h.id)){
    const on = svc.filter(s => s.route === h.route && (h.id !== 'service_weak' || !h.band || (s.band || bandOf(s.dep)) === h.band) && (h.uid === undefined || s.uid === h.uid)).sort((a, b) => a.sold / Math.max(1, a.seats) - b.sold / Math.max(1, b.seats));
    if(on[0]){ h.uid = on[0].uid; h.k = on[0].k; h.dep = on[0].dep; } }
  return h;
}
/* a few words for "the biggest opportunity is …" */
function dsPhrase(h){ const c = h.route && routeById(h.route) ? routeById(h.route).city : '', b = h.band ? String(BAND_SHORT[h.band] || h.band).toLowerCase() : '', p = h.uid !== undefined && S.fleet.find(f => f.uid === h.uid) ? shortPlane(planeById(S.fleet.find(f => f.uid === h.uid).planeId)) : '';
  switch(h.id){ case 'peak_unserved': return `the ${b} ${c} peak`; case 'service_weak': case 'loss_making_service': return `the ${h.dep !== undefined ? fmtTime(h.dep) + ' ' : ''}${c} flight`;
    case 'turned_away': return `the ${c} fare or another ${c} service`; case 'fare_too_high': case 'fare_lower_fills': case 'fare_too_low': return `the ${c} fare`;
    case 'idle_plane': case 'plane_unused': return `work for the ${p || 'idle aircraft'}`; case 'long_leg_warning': return `the aircraft on ${c}`; case 'weekend_only_news': return `a weekend ${c} service`;
    default: return String(h.text || '').split(/[.—]/)[0].toLowerCase(); } }
/* the buttons (PlanTips.action, in the brief's words) */
const DS_ACT = { peak_unserved:['timetable', 'Show me on the timetable'], service_weak:['select', 'Select this flight'], loss_making_service:['select', 'Select this flight'], turned_away:['fare', 'Test fare'],
  fare_too_high:['fare', 'Test fare'], fare_lower_fills:['fare', 'Test the lower fare'], fare_too_low:['fare', 'Test the next fare up'], idle_plane:['work', 'Add a service in the idle time'],
  plane_unused:['work', 'Find work for this aircraft'], long_leg_warning:['select', 'Which plane suits it?'], range_fail:['select', 'Open the aircraft comparison'], weekend_only_news:['weekend', 'Add a Sat–Sun service'] };
const DS_EXP = { 'change the fare':'fare', 'change the times':'times', 'change the number of services':'services', 'change the aircraft':'aircraft' };
const DS_EXP_WORD = { fare:'Change the fare', times:'Change the times', services:'Change the number of services', aircraft:'Change the aircraft' };
const DS_EXP_ONLY = { fare:'fare only — same times, same services', times:'timing only — same fare, same services', services:'the number of services only — same fare, same aircraft', aircraft:'the aircraft only — same fare, same time' };
function dsExps(id){ const w = DS_WB[id] && DS_WB[id].experiment; return String(w || '').split('|').map(s => DS_EXP[s.trim().toLowerCase()]).filter(Boolean); }

/* ---------- the money at stake (PlanTips.moneyAtStake): the engine's own alternatives, never shown to the pupil ---------- */
const dsStep = 40;
function dsAlt(pl, f){
  try{ const n = normPlan(JSON.parse(JSON.stringify(pl))); if(f(n) === false) return null;
    n.fleet.forEach((x, q) => { if(!x.sched.length){ x.deps = null; return; } if(x.deps && x.deps.length !== x.sched.length) x.deps = null; if(x.deps){ const o = x.sched.map((id, k) => ({ id, d:x.deps[k], k })).sort((a, b) => a.d - b.d || a.k - b.k); x.sched = o.map(z => z.id); x.deps = o.map(z => z.d); x.deps = actualDeps(n, q); } });
    if(!withPlan(n, () => n.fleet.every(x => !x.sched.length || fitsFor(x)))) return null; return { pl:n, v:planLines(n).v.profit }; }catch(e){ return null; } }
const dsDeps = (n, q) => { const x = n.fleet[q]; return x.sched.length ? (x.deps && x.deps.length === x.sched.length ? x.deps.slice() : actualDeps(n, q)) : []; };
function dsTimes(pl, q, k){ const out = [], x = pl.fleet[q]; if(!x || !x.sched[k]) return out; const p = planeById(x.planeId), trip = TIME.roundTrip(p, routeById(x.sched[k]));
  for(let t = dayStart(); t + trip <= dayEnd(); t += dsStep) out.push(dsAlt(pl, n => { const y = n.fleet[q]; y.deps = dsDeps(n, q); y.deps[k] = t; })); return out; }
function dsAdd(pl, rid, band){ const out = [], r = routeById(rid), maxT = WORLD.maxTrips || 4; if(!r) return out; const [a, z] = band ? bandHours(band).map(h => h * 60) : [dayStart(), dayEnd()];
  pl.fleet.forEach((x, q) => { const p = planeById(x.planeId); if(!planeCanFly(p, r) || x.sched.length >= maxT) return; const trip = TIME.roundTrip(p, r);
    for(let t = Math.max(dayStart(), a); t < z && t + trip <= dayEnd(); t += dsStep) out.push(dsAlt(pl, n => { const y = n.fleet[q], d = dsDeps(n, q); y.sched.push(rid); d.push(t); y.deps = d; if(!n.prices[rid]) n.prices[rid] = r.basePrice; })); });
  return out; }
function dsFares(pl, rid, only){ const r = routeById(rid); return (r && r.fares ? r.fares : []).filter(f => !only || only(f)).map(f => dsAlt(pl, n => { n.prices[rid] = f; })); }
function dsWork(pl, uid){ const q = pl.fleet.findIndex(x => x.uid === uid); if(q < 0) return []; const p = planeById(pl.fleet[q].planeId), ids = plannerRoutes().filter(id => planeCanFly(p, routeById(id))).sort((a, b) => paxWant(routeById(b), routeById(b).basePrice) - paxWant(routeById(a), routeById(a).basePrice)).slice(0, 6);
  let best = null; for(let round = 0; round < 2; round++){ const from = best ? best.pl : pl; let top = null;
    ids.forEach(id => { const r = routeById(id), x = from.fleet[q]; if(x.sched.length >= (WORLD.maxTrips || 4)) return; const trip = TIME.roundTrip(p, r);
      for(let t = dayStart(); t + trip <= dayEnd(); t += 60){ const a = dsAlt(from, n => { const y = n.fleet[q], d = dsDeps(n, q); y.sched.push(id); d.push(t); y.deps = d; if(!n.prices[id]) n.prices[id] = r.basePrice; }); if(a && (!top || a.v > top.v)) top = a; } });
    if(top && (!best || top.v > best.v)) best = top; else break; }
  return best ? [best] : []; }
function dsStake(h, pl, cur){
  const q = h.uid !== undefined ? pl.fleet.findIndex(x => x.uid === h.uid) : -1, rid = h.route, gain = list => Math.max(0, ...list.filter(Boolean).map(a => a.v - cur));
  switch(h.id){
    case 'plan_loses_money': return -cur;
    case 'service_weak': return q < 0 ? 0 : gain(dsTimes(pl, q, h.k));
    case 'peak_unserved': return gain(dsAdd(pl, rid, h.band).concat(q >= 0 ? dsTimes(pl, q, h.k).filter((a, n) => { const t = dayStart() + n * dsStep; return h.band && t >= bandHours(h.band)[0] * 60 && t < bandHours(h.band)[1] * 60; }) : []));
    case 'turned_away': return gain(dsFares(pl, rid).concat(dsAdd(pl, rid)));
    case 'fare_too_high': case 'fare_lower_fills': return gain(dsFares(pl, rid));
    case 'fare_too_low': { const f = pl.prices[rid]; return gain(dsFares(pl, rid, x => x > f).slice(0, 1)); }
    case 'idle_plane': case 'plane_unused': return gain(dsWork(pl, h.uid));
    case 'loss_making_service': return Math.max(h.loss || 0, q < 0 ? 0 : gain([dsAlt(pl, n => { const y = n.fleet[q], d = dsDeps(n, q); y.sched.splice(h.k, 1); d.splice(h.k, 1); y.deps = y.sched.length ? d : null; })].concat(dsTimes(pl, q, h.k), dsFares(pl, rid))));
    default: return 0; }
}
/* the ranked tips with their targets, buttons, experiments and stakes (cached on the plan) */
const dsRank = (a, b) => a.priority - b.priority || (b.stake || 0) - (a.stake || 0) || (b.weight || 0) - (a.weight || 0);
function dsTips(pl, L, opts){
  opts = opts || {}; pl = normPlan(pl || currentPlan()); L = L || planLines(pl);
  const key = JSON.stringify([planKey(pl), S.day, S.rep, opts.actual ? 1 : 0, Math.round(S.cash / 1000)]);
  if(UI.dsCache && UI.dsCache.key === key) return UI.dsCache.v;
  const v = dryRun(() => { const cur = L.v.profit;
    let hits = planTipsFor(pl, L, Object.assign({}, opts, { all:true })).filter(h => !['all_good', 'general_tradeoff'].includes(h.id)).map(h => dsTarget(Object.assign({}, h), pl, L));
    const seen = new Set(); hits = hits.filter(h => { const k = [h.id, h.route, h.uid, h.k].join('|'); if(seen.has(k)) return false; seen.add(k); return true; });
    let budget = 8; hits.slice().sort((a, b) => a.priority - b.priority || (b.weight || 0) - (a.weight || 0)).forEach(h => { if(h.id === 'plan_loses_money'){ h.stake = Math.round(-dsOp(L)); return; } if(budget-- <= 0 || h.priority > 3){ h.stake = 0; return; } h.stake = Math.round(dsStake(h, pl, cur) || 0); });
    hits.forEach(h => { const a = DS_ACT[h.id] || ['timetable', 'Show me']; h.action = { kind:a[0], label:a[1] }; h.exps = dsExps(h.id); });
    const lose = hits.find(h => h.id === 'plan_loses_money'), others = hits.filter(h => h !== lose).sort(dsRank);
    if(lose){ const top = others[0]; lose.top = top || null; const T = planTipTable().find(t => t.id === 'plan_loses_money');
      lose.text = fillTip(T.message, { loss:num(Math.round(-dsOp(L))), topTip:top ? dsPhrase(top) : 'a new plan' });
      if(top){ Object.assign(lose, { route:top.route, band:top.band, uid:top.uid, k:top.k, dep:top.dep, exps:top.exps }); lose.action = { kind:top.action.kind, label:['timetable', 'select'].includes(top.action.kind) ? 'Show me on the timetable' : top.action.label, of:top.id }; } else lose.action = { kind:'timetable', label:'Show me' }; }
    return (lose ? [lose] : []).concat(others); });
  UI.dsCache = { key, v }; return v;
}
/* the operations check: the top one or two; at the management level only losses and exceptions */
function dsCheck(pl, L){ if(!dsOn('operationsCheck')) return []; let T = dsTips(pl, L);
  if(dsLevel() === 'management') T = T.filter(h => ['plan_loses_money', 'loss_making_service', 'plane_unused', 'range_fail'].includes(h.id));
  T = T.filter(h => h.priority <= 1 || h.stake > 0); return T.slice(0, 2); }   // a losing plan: the loss, then the biggest opportunity it names

/* ---------- the actions: each opens the plan where the change is made ---------- */
function dsDo(h, from){
  if(!h) return; const pl = normPlan(currentPlan()), q = h.uid !== undefined ? pl.fleet.findIndex(x => x.uid === h.uid) : -1, kind = h.action ? h.action.kind : 'timetable';
  dsS().log.push({ day:S.day, wk:weekNo(S.day || 1), id:h.id, what:'act', from:from || 'check', route:h.route || null }); if(dsS().log.length > 200) dsS().log.splice(0, 50);
  S.overlay = null; UI.view = null; UI.tlSel = null; UI.ideaOpen = false;
  if(typeof UI.s2 !== 'object' || !UI.s2) UI.s2 = {};
  Object.assign(UI.s2, { mode:'plan', drawer:false, focus:h.route || null, focusText:h.text, strip:h.route || null, route:null, stopAsk:null });
  UI.stDemand = true; UI.dsHi = { route:h.route || null, band:h.band || null, uid:h.uid, k:h.k, at:Date.now(), kind };
  if((kind === 'select' || kind === 'timetable') && q >= 0 && h.k !== undefined && pl.fleet[q].sched[h.k]){ UI.tlSel = { i:0, j:q, k:h.k }; UI.tlFocus = true; }
  if(kind === 'fare' && h.route) UI.s2.route = h.route;
  if(kind === 'work' && q >= 0){ UI.stPlane = q; UI.dsAdd = { j:q, at:Date.now() }; }
  if(kind === 'weekend' && h.route){ const n = (WORLD.routeNews || []).find(z => (z.routes || []).includes(h.route) && announcedFor(S.day || 1).some(a => a.id === z.id)); if(n) s2Review(h.route, n.id); }
  render();
}

/* ---------- the plan page: the check, the improved banner, the worth line, the highlight ---------- */
const dsFig = L => { const F = s2Fill((L && L.services) || []); return { sold:F.sold, seats:F.seats, profit:Math.round((L && L.v ? L.v.profit : 0)) }; };
const dsSigned = v => `${v < 0 ? '−' : v > 0 ? '+' : ''}${money(Math.abs(Math.round(v)))}`;
function dsTipRow(h, n, big, head){ return `<span class="ds-tip ${h.priority <= 1 ? 'hot' : ''} ${head ? 'head' : ''}" data-dstip="${h.id}"><span class="ds-ti">${ICO2.bulb}</span><span class="ds-tt">${esc(h.text)}</span>${head ? '' : `<button class="btn ${big ? 'ds-act' : 'ds-act2'}" data-dsact="${n}">${esc(h.action.label)}</button>`}</span>`; }
/* one line for the bar: a losing plan's first sentence, then the opportunity it names, with that opportunity's button */
function dsOneRow(tips){ const lose = tips[0].id === 'plan_loses_money' && tips[1] && tips[0].action.of === tips[1].id, h = lose ? tips[1] : tips[0], n = lose ? 1 : 0;
  return `<span class="ds-tip hot" data-dstip="${h.id}"><span class="ds-ti">${ICO2.bulb}</span><span class="ds-tt">${lose ? `<b>${esc(tips[0].text.split('. ')[0])}.</b> ` : ''}${esc(h.text)}</span><button class="btn ds-act" data-dsact="${n}">${esc(h.action.label)}</button></span>`; }
/* the check's rows: a losing plan's line is the heading over the opportunity it names, which carries the button */
function dsRows(tips){ const lose = tips[0] && tips[0].id === 'plan_loses_money' && tips[1] && tips[0].action.of === tips[1].id; return tips.map((h, n) => dsTipRow(h, n, lose ? n === 1 : n === 0, lose && n === 0)); }
function dsAfterPlan(){
  if(!dsPlanPage()) return; const U = UI.s2, pl = normPlan(currentPlan()), L = planLines(pl); if(!pl.fleet.some(x => x.sched.length)) return;
  if(U.dsStartFor !== U.key){ U.dsStartFor = U.key; U.dsStart = dsFig(L); }
  const root = screen(), now = dsFig(L), st = U.dsStart || now, better = dsOn('planImprovedBanner') && now.profit > st.profit, tips = dsCheck(pl, L), hot = tips.some(h => h.priority <= 1);
  UI.dsShown = tips;
  // the quiet button: never green while a priority 0–1 tip fires
  const nx = $('nx'), keep = $('s2Keep');
  if(hot){ [nx, keep].forEach(b => { if(!b) return; b.classList.remove('primary'); b.classList.add('ds-quiet'); }); if(U.mode === 'opener'){ if(keep) keep.innerHTML = 'Run anyway &#9654;'; if(nx && !nx.disabled) nx.innerHTML = 'Run anyway &#9654;'; } }
  // the hint area of the bar: the worth Build, or Plan improved and the worth line, then the check
  // the bar holds one line: the worth Build, a priority 0–1 tip, Plan improved (with what the change was worth), or the top tip
  const hint = root.querySelector('.actbar .ab-hint'), W = UI.dsWorth && UI.dsWorth.dayKey === U.key ? UI.dsWorth : null;
  const imp = better ? `<span class="ds-imp">${ICO2.check}<span><b>Plan improved:</b> seats ${num(st.sold)} → ${num(now.sold)} · result ${dsSigned(st.profit)} → ${dsSigned(now.profit)} · ${U.mode === 'opener' ? 'ready to run' : 'Ready for operations'}${W && W.line && W.done ? ` · ${W.line}` : ''}</span></span>` : '';
  // the check: in the opener's card above Keep plan (two lines); on the plan, one line in the bar above the button
  if(U.mode === 'opener' && tips[0]){ const act = root.querySelector('.s2-oact'); if(act && !root.querySelector('.ds-oc')) act.insertAdjacentHTML('beforebegin', `<div class="ds-oc"><span class="kl">Operations check</span>${dsRows(tips).join('')}</div>`); }
  // on the plan, Plan improved and the worth line sit in the summary bar; the bar above the button keeps the check
  const sum = U.mode !== 'opener' ? root.querySelector('.s2-sum > .grow') : null, side = imp || (W && W.line && W.done ? dsWorthLineHtml(W) : '');
  if(sum && side && !(W && !W.done && W.build)) sum.insertAdjacentHTML('beforebegin', `<span class="ds-sumi">${side}</span>`);
  const rows = [];
  if(W && !W.done && W.build) rows.push(dsWorthBuildHtml(W));
  else if(!sum && imp) rows.push(imp);
  else if(!sum && W && W.line && W.done) rows.push(dsWorthLineHtml(W));
  if(U.mode !== 'opener' && tips[0] && (hot || !rows.length)) rows.push(dsOneRow(tips));
  if(hint && rows.length){ hint.innerHTML = `<span class="ds-hint ${rows.length > 1 ? 'two' : ''}">${rows.join('')}</span>`; hint.closest('.actbar').classList.add('ds-bar'); }
  root.querySelectorAll('[data-dsact]').forEach(b => b.onclick = e => { e.stopPropagation(); dsDo(UI.dsShown[+b.getAttribute('data-dsact')], 'check'); });
  // Run anyway is logged with what the check showed
  [nx, keep].forEach(b => { if(!b || b.dsWrapped) return; b.dsWrapped = true; b.addEventListener('click', () => { if(b.disabled || !UI.dsShown || !UI.dsShown.length) return; dsS().log.push({ day:S.day, wk:weekNo(S.day || 1), id:UI.dsShown.map(h => h.id).join(','), what:'run', from:'check' }); dsKeepWeek(); }, true); });
  if(nx && !nx.dsKept){ nx.dsKept = true; nx.addEventListener('click', () => { if(!nx.disabled) dsKeepWeek(); }, true); }
  dsBindWorth(W);
  dsHighlight(root, pl);
  dsFlashShow(root);
  dsChips(root, pl, L);
  // Help me investigate (planningSupport), beside the model's own button
  const tools = root.querySelector('.s2-tools .plw-tools'); if(tools && dsOn('helpMeInvestigate') && !$('dsInv') && !(S.phase === 'setup')) tools.insertAdjacentHTML('afterbegin', `<button class="btn small ds-inv" id="dsInv" title="Choose one thing to test, predict what will happen, then compare">${ICO2.bulb} Help me investigate</button>`);
  const ideaB = $('ideaOpen'); if(ideaB && /Try different options/.test(ideaB.textContent)) ideaB.textContent = 'Operations Model';
  on('dsInv', () => dsInvestigate(tips[0] || null, 'plan'));
}
const dsPlanR0 = R.plan;
R.plan = st => { const out = dsPlanR0(st); try{ dsAfterPlan(); }catch(e){ console.error(e); } return out; };
/* the trade-offs drawer: the firing tips, one line each, with the button */
const dsDrawer0 = s2Drawer;
s2Drawer = function(pl, L, hid){
  if(!dsOn('operationsCheck')) return dsDrawer0(pl, L, hid);
  const U = UI.s2, T = dsTips(pl, L).slice(0, 4); UI.dsDrawer = T;
  const groups = U.all ? `<div class="s2-groups">${s2Insights(pl, L, hid).map(([h, lines, html]) => `<div class="s2-g"><h4>${h}</h4>${html || (lines.length ? `<ul>${lines.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '<p class="muted">Nothing to look at here.</p>')}</div>`).join('')}</div>` : '';
  return `<aside class="s2-dr" role="dialog" aria-label="Trade-offs"><div class="s2-dr-h">${ICO2.bulb}<h2>Trade-offs</h2><span class="grow"></span><button class="s2-x" id="s2DrX" aria-label="Close">×</button></div>
    <h3>${T.length ? 'The biggest issues first' : 'Nothing pressing'}</h3><ul class="st-tips ds-dl">${T.map((h, n) => `<li data-tip="${h.id}">${ICO2.bulb}<span>${esc(h.text)}</span><button class="btn small" data-dsdr="${n}">${esc(h.action.label)}</button></li>`).join('')}</ul>
    <button class="dk-link s2-allb" id="s2All" aria-expanded="${!!U.all}">${U.all ? 'Show fewer' : 'Show all insights'} ${ICO2.chev}</button>${groups}</aside>`;
};
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-dsdr]'); if(!b || !UI.dsDrawer) return; e.stopPropagation(); dsDo(UI.dsDrawer[+b.getAttribute('data-dsdr')], 'drawer'); }, true);

/* the highlight after an action: the band on each lane, the route's blocks, the add-flight menu of an idle aircraft */
function dsHighlight(root, pl){
  const H = UI.dsHi; if(!H || Date.now() - H.at > 9000) return;
  if(H.route) root.querySelectorAll('.s2-tt .ad-blk[data-tl]').forEach(b => { const [i, j, k] = b.getAttribute('data-tl').split('|').map(Number), x = pl.fleet[j]; if(x && x.sched[k] === H.route) b.classList.add('ds-hl'); });
  if(H.band && bandHours(H.band)) root.querySelectorAll('.s2-tt .ad-lane').forEach(ln => { const s0 = +ln.dataset.s0, span = +ln.dataset.span, [a, z] = bandHours(H.band).map(h => h * 60), X = m => clamp(100 * (m - s0) / span, 0, 100);
    if(!ln.querySelector('.ds-band')) ln.insertAdjacentHTML('afterbegin', `<i class="ds-band" style="left:${X(a).toFixed(2)}%;width:${(X(z) - X(a)).toFixed(2)}%" title="${esc(BAND_NAMES[H.band] || H.band)}"></i>`); });
  const A = UI.dsAdd; if(A && Date.now() - A.at < 9000){ const s = root.querySelector(`[data-addsel="0|${A.j}"]`); if(s){ s.classList.add('ds-pulse'); s.closest('.st-row') && s.closest('.st-row').classList.add('ds-row'); } }
}

/* ---------- block preview: the fill while a block moves; one line after a change ---------- */
function dsFillAt(j, k, dep){
  const key = [planKey(currentPlan()), j, k, dep].join('|'); UI.dsFillC = UI.dsFillC || {}; if(UI.dsFillC[key]) return UI.dsFillC[key];
  const pl = currentPlan(), a = dsAlt(pl, n => { const y = n.fleet[j], d = dsDeps(n, j); d[k] = dep; y.deps = d; }); if(!a) return null;
  const uid = pl.fleet[j].uid, L = planLines(a.pl), s = (L.services || []).filter(z => z.uid === uid && z.route === pl.fleet[j].sched[k]).sort((u, v) => Math.abs(u.dep - dep) - Math.abs(v.dep - dep))[0];
  const v = s ? { sold:s.sold, seats:s.seats, dep:s.dep } : null; UI.dsFillC[key] = v; return v;
}
const dsBindTl0 = bindTimeline;
bindTimeline = function(){
  dsBindTl0.apply(this, arguments); if(!dsOn('blockPreview')) return;
  screen().querySelectorAll('.s2-tt .ad-blk[data-tl]').forEach(b => { const [i, j, k] = b.getAttribute('data-tl').split('|').map(Number); if(i !== 0) return;
    b.addEventListener('pointermove', () => { const g = tlDrag; if(!g || g.b !== b || !g.moved) return; const dep = clamp(g.dep0 + g.dm, g.s0, g.s0 + g.span - g.trip); if(b.dsDep === dep) return; b.dsDep = dep;
      const v = dsFillAt(j, k, dep); if(!v) return; const bs = b.querySelector('.st-bs'), full = v.sold >= v.seats;
      if(bs) bs.textContent = `${v.sold}/${v.seats}${full ? ' FULL' : ''}`; ['good', 'mid', 'low'].forEach(c => b.classList.remove('fill-' + c)); b.classList.add('fill-' + fillCls(v.sold, v.seats));
      const bf = b.querySelector('.st-bf i'); if(bf) bf.style.width = Math.round(100 * Math.min(1, v.sold / Math.max(1, v.seats))) + '%'; b.classList.toggle('ds-full', full); }); });
};
/* every change to the airline's plan on the plan page: the line after it, and what it was worth (D88) */
const dsSetPlan0 = setPlan;
setPlan = function(i, pl){
  if(i !== 0 || !dsPlanPage() || !(dsOn('blockPreview') || dsOn('whatWasItWorth'))) return dsSetPlan0.apply(this, arguments);
  let before = null, after = null, W = null;
  try{ const a = normPlan(currentPlan()), b = normPlan(JSON.parse(JSON.stringify(pl))); if(planKey(a) !== planKey(b)){ const La = planLines(a), Lb = planLines(b); before = dsFig(La); after = dsFig(Lb); W = dsOn('whatWasItWorth') ? dsWorth(a, b, La, Lb) : null; } }catch(e){}
  if(before){ UI.dsFlash = { at:Date.now(), from:before, to:after, sel:UI.tlSel ? Object.assign({}, UI.tlSel) : null };
    if(W){ W.dayKey = UI.s2 && UI.s2.key; W.build = !dsS().built[W.kind] && W.per !== undefined; W.done = !W.build; W.tokens = []; W.tries = 0; UI.dsWorth = W; if(W.done) dsWorthKeep(W); } else UI.dsWorth = null; }
  return dsSetPlan0.apply(this, arguments);
};
function dsFlashShow(root){
  const F = UI.dsFlash; if(!F || Date.now() - F.at > 400 || !dsOn('blockPreview')) return; UI.dsFlash = null;
  const host = root.querySelector('.s2-tt'); if(!host) return; const blk = root.querySelector('.s2-tt .ad-blk.on'), h = host.getBoundingClientRect();
  host.insertAdjacentHTML('beforeend', `<div class="ds-flash" role="status">This change — seats ${num(F.from.sold)} → ${num(F.to.sold)} · profit ${dsSigned(F.from.profit)} → ${dsSigned(F.to.profit)}</div>`);
  const el = host.querySelector('.ds-flash'); if(blk && el){ const b = blk.getBoundingClientRect(), sc = h.width / Math.max(1, host.offsetWidth) || 1; el.style.left = clamp((b.left - h.left) / sc, 8, Math.max(8, host.offsetWidth - 420)) + 'px'; el.style.top = Math.max(4, (b.top - h.top) / sc - 34) + 'px'; }
  setTimeout(() => { if(el && el.parentNode) el.remove(); }, 2600);
}
/* fare chips on a full route with people turned away: the fill at each fare, in the route editor and the flight's editor */
function dsChips(root, pl, L){
  if(!dsOn('blockPreview')) return; const ids = [...new Set(pl.fleet.flatMap(x => x.sched))];
  const chips = id => { const r = routeById(id), F = r.fares || [r.basePrice], fare = pl.prices[id] || r.basePrice, svc = s2Svc(L, id), seats = svc.reduce((t, s) => t + s.seats, 0), sold = svc.reduce((t, s) => t + s.sold, 0), want = s2Want(pl, L, id);
    if(!seats || sold < seats || want <= seats) return '';
    const fill = f => { if(f === fare) return sold; const a = dsAlt(pl, n => { n.prices[id] = f; }); return a ? planLines(a.pl).routes.find(x => x.id === id).pax : null; };
    return `<div class="ds-chips" data-dsch="${id}"><span class="ds-chl">Full, ${num(want - seats)} turned away. Seats filled at each fare:</span>${F.map(f => { const v = fill(f); return v === null ? '' : `<button class="ds-chip ${f === fare ? 'on' : ''} fill-${fillCls(v, seats)}" data-pe="0|fareTo|${id}|${f}">${money(f)}<b class="mono">${num(v)}/${num(seats)}</b></button>`; }).join('')}</div>`; };
  const ed = root.querySelector('.s2-ed'); if(ed && UI.s2.route && ids.includes(UI.s2.route) && !ed.querySelector('.ds-chips')){ const h = chips(UI.s2.route); if(h) ed.querySelector('.s2-cmp').insertAdjacentHTML('afterend', h); }
  const pop = $('s2Pop'), sel = UI.tlSel; if(pop && sel && pl.fleet[sel.j] && !pop.querySelector('.ds-chips')){ const h = chips(pl.fleet[sel.j].sched[sel.k]); if(h) pop.querySelector('.s2-pop-b').insertAdjacentHTML('afterend', h); }
  ids.forEach(id => { const row = root.querySelector(`.s2-r[data-s2r="${id}"]`), svc = s2Svc(L, id), seats = svc.reduce((t, s) => t + s.seats, 0), sold = svc.reduce((t, s) => t + s.sold, 0); if(row && seats && sold >= seats && s2Want(pl, L, id) > seats && !row.querySelector('.ds-full-tag')) { const fl = row.querySelector('.s2-fl'); if(fl) fl.insertAdjacentHTML('beforeend', '<i class="ds-full-tag">FULL</i>'); } });
  root.querySelectorAll('.ds-chips [data-pe]').forEach(b => b.onclick = e => { e.stopPropagation(); const [i, what, a, d] = b.getAttribute('data-pe').split('|'); editPlan(+i, what, a, +d, 0); });
}

/* ---------- D88: what a change was worth ---------- */
function dsWorth(a, b, La, Lb){
  const ra = Object.fromEntries((La.routes || []).map(x => [x.id, x])), rb = Object.fromEntries((Lb.routes || []).map(x => [x.id, x]));
  const cnt = pl => { const c = {}; pl.fleet.forEach(x => x.sched.forEach(id => { c[id] = (c[id] || 0) + 1; })); return c; }, ca = cnt(a), cb = cnt(b);
  const svcCh = [...new Set(Object.keys(ca).concat(Object.keys(cb)))].filter(id => (ca[id] || 0) !== (cb[id] || 0)), fareCh = Object.keys(cb).filter(id => a.prices[id] !== b.prices[id] && ra[id] && rb[id]);
  const word = v => v >= 0 ? 'more' : 'less', city = id => routeById(id).city;
  if(fareCh.length === 1 && !svcCh.length){ const id = fareCh[0], f0 = ra[id].fare, f1 = rb[id].fare, n0 = ra[id].pax, n1 = rb[id].pax, d = f1 - f0;
    if(n0 === n1) return { kind:'fare', route:id, per:d, units:n1, perLab:`£${num(Math.abs(d))} ${word(d)} a ticket`, unitLab:`${num(n1)} passengers`, other:{ lab:`${money(f1)} fare`, v:f1 }, value:d * n1, what:d > 0 ? 'fare rise' : 'fare cut',
      line:`£${num(Math.abs(d))} ${word(d)} a ticket × ${num(n1)} passengers = <b>${money(Math.abs(d * n1))} ${word(d * n1)} a day</b>` };
    const v = n1 * f1 - n0 * f0; return { kind:'fare', route:id, value:v, what:d > 0 ? 'fare rise' : 'fare cut', line:`${num(n1)} × ${money(f1)} − ${num(n0)} × ${money(f0)} = <b>${money(Math.abs(v))} ${word(v)} a day</b> in ${city(id)} tickets` }; }
  if(svcCh.length === 1 && !fareCh.length && Math.abs((cb[svcCh[0]] || 0) - (ca[svcCh[0]] || 0)) === 1){ const id = svcCh[0], add = (cb[id] || 0) > (ca[id] || 0), fare = (rb[id] || ra[id]).fare, dn = ((rb[id] || {}).pax || 0) - ((ra[id] || {}).pax || 0), cost = Math.round(Lb.v.cost - La.v.cost), v = dn * fare - cost;
    return add ? { kind:'service', route:id, per:fare, units:dn, perLab:`${money(fare)} fare`, unitLab:`${num(dn)} more passengers`, other:{ lab:`${money(cost)} costs`, v:cost }, value:v, cost, what:'extra flight',
      line:`One more flight: ${num(dn)} × ${money(fare)} − ${money(cost)} costs = <b>${dsSigned(v).replace('+', '')} a day</b>` }
      : { kind:'service', route:id, value:v, what:'flight taken off', line:`One flight fewer: ${money(-cost)} costs saved − ${num(-dn)} × ${money(fare)} = <b>${dsSigned(v).replace('+', '')} a day</b>` }; }
  if(!svcCh.length && !fareCh.length){ const ch = Object.keys(rb).filter(id => (ra[id] || {}).pax !== rb[id].pax); if(ch.length !== 1) return null; const id = ch[0], dn = rb[id].pax - ra[id].pax, fare = rb[id].fare;
    return { kind:'time', route:id, per:fare, units:dn, perLab:`${money(fare)} fare`, unitLab:`${num(Math.abs(dn))} ${dn >= 0 ? 'more' : 'fewer'} passengers`, other:{ lab:`${num(rb[id].pax)} passengers`, v:rb[id].pax }, value:dn * fare, what:'new time',
      line:`${num(Math.abs(dn))} ${dn >= 0 ? 'more' : 'fewer'} passengers × ${money(fare)} = <b>${money(Math.abs(dn * fare))} ${word(dn)} a day</b>` }; }
  return null;
}
const DS_WORTH_Q = { fare:'What was the fare change worth a day?', time:'What was the new time worth a day?', service:'What was the extra flight worth a day?' };
function dsWorthLineHtml(W){ return `<span class="ds-worth-l"><span class="fx" title="worked out by the model">ƒ</span><span>${esc(routeById(W.route).city)} ${esc(W.what)}: ${W.line}</span></span>`; }
function dsWorthBuildHtml(W){
  const figs = dsWorthFigs(W), tok = t => OPS4.includes(t) ? `<i class="rb-op">${t}</i>` : (f => f ? `<span class="rb-tk">${esc(f.lab)}</span>` : '')(figs.find(f => f.k === t));
  return `<span class="ds-wb"><span class="ds-wq"><b>${esc(DS_WORTH_Q[W.kind] || 'What was it worth?')}</b> Tap the change for one, ×, then how many.</span>
    <span class="ds-wbar">${W.tokens.length ? W.tokens.map(tok).join('') : '<span class="rb-ph">?</span>'}</span>${figs.map(f => `<button class="rb-chip" data-dswf="${f.k}">${esc(f.lab)}</button>`).join('')}${OPS4.slice(0, 3).map(o => `<button class="ds-wop" data-dswo="${o}">${o}</button>`).join('')}
    <button class="btn small" data-dswc="1">Check ✓</button>${W.msg ? `<span class="sc-msg">${esc(W.msg)}</span>` : ''}</span>`; }
function dsWorthFigs(W){ return [{ k:'per', lab:W.perLab }, { k:'units', lab:W.unitLab }].concat(W.other ? [{ k:'other', lab:W.other.lab }] : []).sort((a, b) => a.lab.localeCompare(b.lab)); }
function dsBindWorth(W){
  if(!W || W.done) return; const root = screen();
  root.querySelectorAll('[data-dswf]').forEach(b => b.onclick = e => { e.stopPropagation(); if(W.tokens.length % 2 === 1){ W.msg = 'Put the operation between the figures.'; render(); return; } W.tokens.push(b.getAttribute('data-dswf')); W.msg = ''; render(); });
  root.querySelectorAll('[data-dswo]').forEach(b => b.onclick = e => { e.stopPropagation(); if(W.tokens.length % 2 === 0){ W.msg = 'Start with a figure.'; render(); return; } W.tokens.push(b.getAttribute('data-dswo')); render(); });
  root.querySelectorAll('[data-dswc]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = W.tokens.join(' '), ok = k === 'per × units' || k === 'units × per';
    const rk = 'worth:' + W.kind + ':' + S.day, chips = W.tokens.map(t => OPS4.includes(t) ? { op:t } : { label:(dsWorthFigs(W).find(f => f.k === t) || {}).lab, k:t });
    let e2 = null; try{ e2 = recOpen(rk, { type:'build', relKey:'worth', doc:`What was it worth: ${routeById(W.route).city}`, ask:DS_WORTH_Q[W.kind], question:`${W.perLab} × ${W.unitLab}`, unit:'£', correct:Math.abs(W.per * W.units), correctText:money(Math.abs(W.per * W.units)), ops:[W.per, W.units], op:'×', level:'Build' }); }catch(x){}
    if(ok){ try{ recAttempt(e2, { ok:true, chips, method:'the change for one × how many' }); }catch(x){} dsS().built[W.kind] = S.day; W.done = true; W.msg = ''; dsWorthKeep(W); if(typeof soLog === 'function') soLog(`What was it worth: ${W.kind} (Build)`); render(); return; }
    const msg = W.tokens.includes('other') ? `${(dsWorthFigs(W).find(f => f.k === 'other') || {}).lab} is not part of it: the change for one, and how many.` : !W.tokens.includes('×') ? 'The same change happens for each one: which operation repeats it?' : 'Use the change for one and how many.';
    try{ recAttempt(e2, { ok:false, chips, msg, note:msg, method:'the change for one × how many' }); }catch(x){} W.tries++;
    if(W.tries >= 2 && (typeof twoTriesOn !== 'function' || twoTriesOn())){ if(typeof paperRecShown === 'function') paperRecShown(rk); dsS().built[W.kind] = S.day; W.done = true; W.tokens = ['per', '×', 'units']; W.msg = ''; dsWorthKeep(W); render(); return; }
    W.tokens = []; W.msg = `Query: ${msg} One more try.`; render(); });
}
/* the week's changes and what they were worth, for Sunday (the latest of each kind on each route) */
function dsWorthKeep(W){ const d = dsS(), wk = weekNo(S.day || 1), L = d.worth[wk] || (d.worth[wk] = []), k = L.findIndex(x => x.kind === W.kind && x.route === W.route);
  const e = { kind:W.kind, route:W.route, what:W.what, value:Math.round(W.value), fare:W.kind === 'fare' ? (currentPlan().prices || {})[W.route] : null, day:S.day };
  if(k >= 0){ if(W.kind === 'fare' || W.kind === 'time') e.value = Math.round(L[k].value + W.value); L[k] = e; } else L.push(e);
  if(Math.abs(e.value) < 1) L.splice(L.indexOf(e), 1); }
/* when the week runs: the worth lines kept are the ones still in the plan */
function dsKeepWeek(){ const d = dsS(), wk = weekNo(S.day || 1), L = d.worth[wk]; if(!L) return; const pl = currentPlan(); d.worth[wk] = L.filter(x => x.kind !== 'fare' || (pl.prices || {})[x.route] === x.fare); }

/* ---------- 4. the Sunday review: words for the missed profit; the biggest missed opportunity; Fix next week's plan ---------- */
function dsMissedWords(M){ if(!M || !(M.best > 0)) return 'a good plan'; const s = M.missed / M.best; return s > 0.3 ? 'a large improvement is available' : s >= 0.1 ? 'a better plan is available' : 'a good plan'; }
const dsWeekReview0 = R.weekReview;
R.weekReview = st => {
  const out = dsWeekReview0(st); try{ dsAfterReview(); }catch(e){ console.error(e); } return out; };
function dsAfterReview(){
  const W = S.wk, root = screen(), box = root.querySelector('.wk-missed'); if(!W || !box) return;
  const M = W.missed, d = dsS(), wk = weekNo(W.from);
  const pl = normPlan(currentPlan()), L = typeof atDay === 'function' ? atDay(W.from, () => planLines(pl)) : planLines(pl), T = dsOn('reviewFixLink') ? (typeof atDay === 'function' ? atDay(W.from, () => dsTips(pl, L)) : dsTips(pl, L)) : [];
  const top = T.slice().sort((a, b) => (b.stake || 0) - (a.stake || 0) || a.priority - b.priority).find(h => h.stake > 0 || h.priority <= 1) || null;
  if(M && !d.reviews.some(r => r.wk === wk)) d.reviews.push({ wk, from:W.from, yours:M.yours, best:M.best, missed:M.missed, label:M.bestPlan, words:dsMissedWords(M), tip:top ? top.id : null, tipText:top ? top.text : null, stake:top ? Math.round(top.stake * 7) : 0 });
  if(dsOn('missedProfitDisplay') || dsSet('missedProfitDisplay') === undefined){ const words = dsMissedWords(M);
    const fix = top && top.route ? `Fix next week's ${esc(routeById(top.route).city)} plan` : top ? 'Fix next week\'s plan' : '';
    const kept = (d.worth[wk] || []).map(x => `<p class="ds-wk">${ICO2.check}<span>Your ${esc(routeById(x.route).city)} ${esc(x.what)} was worth <b>${dsSigned(x.value * 7).replace('+', '')}</b> this week <span class="fx" title="worked out by the model">ƒ</span></span></p>`).join('');
    box.className = `wk-missed ds-miss ${words === 'a good plan' ? 'ok' : 'warn'}`;
    box.innerHTML = `<span class="kl">How good was the plan?</span><p class="ds-mw">${words === 'a good plan' ? 'Your plan was a good plan for these planes and routes.' : `Your plan made ${money(M.yours)}: ${words}.`}</p>
      ${top ? `<p class="ds-big"><b>Biggest missed opportunity:</b> ${esc(top.text)}</p>` : ''}${kept}
      <div class="ds-fixr">${fix ? `<button class="btn ds-fix" id="dsFix">${ICO2.sliders} ${fix}</button>` : ''}${dsOn('helpMeInvestigate') ? `<button class="btn small ds-inv" id="dsInvR">${ICO2.bulb} Help me investigate</button>` : ''}</div>`;
    const nx = $('nx'), go = () => !nx || !nx.disabled;
    const fb = $('dsFix'); if(fb){ if(!go()) { fb.disabled = true; fb.title = 'Sign off the accounts first'; }
      fb.onclick = () => { if(!go()) return; S.dsFix = { id:top.id, route:top.route || null, band:top.band || null, uid:top.uid, k:top.k, text:top.text, from:S.day }; d.log.push({ day:S.day, wk, id:top.id, what:'fix', from:'review', route:top.route || null }); nx.click(); }; }
    on('dsInvR', () => dsInvestigate(top, 'review')); }
}
/* the next Monday opens on the problem: the route selected, its demand shown, the block or the chips picked out */
const dsS2State0 = s2State;
s2State = function(pl){
  const was = UI.s2 && UI.s2.key, U = dsS2State0(pl), F = S.dsFix;
  if(F && U.key !== was && S.day > F.from && step().t === 'plan'){ delete S.dsFix;
    const h = dsTips(pl).find(x => x.id === F.id && (x.route || null) === F.route) || Object.assign({ action:{ kind:(DS_ACT[F.id] || ['timetable'])[0] } }, F);
    setTimeout(() => { dsDo(Object.assign({}, h, { text:F.text }), 'fix'); }, 0); }
  return U;
};
/* the month audit's letter: words, not the best plan's figure */
const dsAudit0 = R.audit;
if(dsAudit0) R.audit = st => { const out = dsAudit0(st); try{ if(dsOn('missedProfitDisplay')){ const p = screen().querySelector('.so-miss'), a = (S.audits || [])[S.audits.length - 1]; if(p && a){ const m = /^([^:]+):/.exec(p.textContent); p.textContent = `${m ? m[1] + ': ' : ''}you made ${money(a.actual)}; ${dsMissedWords(a)}.`; } } }catch(e){} return out; };

/* ---------- 5. guided experiments: choose → predict → change one thing → model → compare → decide ---------- */
function dsInvestigate(h, from){ UI.dx = { step:'choose', tip:h || null, from:from || 'plan', route:(h && h.route) || null, v:null, pred:{}, test:null, sel:null };
  dsS().log.push({ day:S.day, wk:weekNo(S.day || 1), id:h ? h.id : null, what:'investigate', from:from || 'plan' }); S.overlay = { type:'investigate', back:UI.view || null }; render(); }
function dsExpChoices(){ const X = UI.dx, lv = dsLevel(), h = X.tip, named = h && (lv === 'guided' || lv === 'supported' || (lv === 'management' && ['plan_loses_money', 'loss_making_service', 'plane_unused'].includes(h.id)));
  let v = lv === 'guided' && h && h.exps && h.exps.length ? h.exps.slice(0, 3) : ['fare', 'times', 'services', 'aircraft'];
  const pl = normPlan(currentPlan()), rid = X.route; if(rid && !pl.fleet.some(x => x.sched.includes(rid))) v = v.filter(e => e === 'services');
  if(!pl.fleet.some((x, q) => pl.fleet.some((y, p) => p !== q && rid && x.sched.includes(rid) && planeCanFly(planeById(y.planeId), routeById(rid))))) v = v.filter(e => e !== 'aircraft');
  return { named, v:v.length ? v : ['fare', 'times', 'services'] }; }
function dsTestRoute(){ const X = UI.dx, pl = normPlan(currentPlan()), ids = [...new Set(pl.fleet.flatMap(x => x.sched))]; return X.route && routeById(X.route) ? X.route : ids[0] || plannerRoutes()[0]; }
function dsRouteFig(pl, rid){ const L = planLines(pl), svc = (L.services || []).filter(s => s.route === rid); return { sold:svc.reduce((t, s) => t + s.sold, 0), seats:svc.reduce((t, s) => t + s.seats, 0), profit:Math.round(L.v.profit), L }; }
R.ov_investigate = o => {
  const X = UI.dx || (UI.dx = { step:'choose', pred:{} }), base = normPlan(currentPlan()), rid = dsTestRoute(), r = routeById(rid), C = dsExpChoices();
  if(!X.test) X.test = JSON.parse(JSON.stringify(base));
  const B = dsRouteFig(base, rid), Tt = dsRouteFig(X.test, rid), changed = planKey(X.test) !== planKey(base);
  const head = `<div class="dx-steps">${['Choose', 'Predict', 'Change one thing', 'Compare'].map((t, k) => `<span class="${['choose', 'predict', 'change', 'compare'].indexOf(X.step) >= k ? 'on' : ''}">${k + 1}. ${t}</span>`).join('')}</div>`;
  const issue = C.named && X.tip ? `<p class="dx-issue">${ICO2.bulb}<span>${esc(X.tip.text)}</span></p>` : '';
  const routeSel = `<label class="dx-rt">Route <select id="dxRoute">${[...new Set(base.fleet.flatMap(x => x.sched))].map(id => `<option value="${id}" ${id === rid ? 'selected' : ''}>${esc(routeById(id).city)}</option>`).join('')}</select></label>`;
  let body = '';
  if(X.step === 'choose') body = `${issue}<h2>What will you test on ${esc(r.city)}?</h2>${routeSel}<div class="dx-opts">${C.v.map(v => `<button class="btn big" data-dxv="${v}">${esc(DS_EXP_WORD[v])}</button>`).join('')}</div><p class="muted">One thing at a time: everything else stays as it is.</p>`;
  else if(X.step === 'predict') body = `${issue}<h2>${esc(DS_EXP_WORD[X.v])} on ${esc(r.city)}: what do you think will happen?</h2>
    <div class="dx-pred"><div><span>Seats filled</span>${['more', 'fewer', 'about the same'].map(v => `<button class="btn ${X.pred.seats === v ? 'on' : ''}" data-dxps="${v}">${v}</button>`).join('')}</div>
    <div><span>Profit</span>${['higher', 'lower', 'about the same'].map(v => `<button class="btn ${X.pred.profit === v ? 'on' : ''}" data-dxpp="${v}">${v}</button>`).join('')}</div></div>`;
  else if(X.step === 'change'){ const tp = normPlan(X.test), svc = [];
    tp.fleet.forEach((x, q) => { const d = x.sched.length ? actualDeps(tp, q) : []; x.sched.forEach((id, k) => { if(id === rid) svc.push({ q, k, dep:d[k], p:planeById(x.planeId) }); }); });
    const sel = X.sel && tp.fleet[X.sel.q] && tp.fleet[X.sel.q].sched[X.sel.k] === rid ? X.sel : (svc[0] ? { q:svc[0].q, k:svc[0].k } : null); X.sel = sel;
    const ctl = X.v === 'fare' ? `<div class="dx-ctl">${(r.fares || [r.basePrice]).map(f => `<button class="btn ${tp.prices[rid] === f ? 'on' : ''}" data-dxf="${f}">${money(f)}</button>`).join('')}</div>`
      : X.v === 'times' ? `<div class="dx-ctl">${svc.map(s => `<button class="btn ${sel && sel.q === s.q && sel.k === s.k ? 'on' : ''}" data-dxs="${s.q}|${s.k}">${fmtTime(s.dep)} · ${esc(shortPlane(s.p))}</button>`).join('')}</div>${sel ? `<div class="dx-ctl">${[[-60, '&#9664; 1 h earlier'], [-20, '20 min earlier'], [20, '20 min later'], [60, '1 h later &#9654;']].map(([dt, l]) => `<button class="btn" data-dxt="${dt}" ${dsMoveFits(tp, sel, dt, r) ? '' : 'disabled title="That would not fit in the operating day"'}>${l}</button>`).join('')}</div>` : ''}`
      : X.v === 'services' ? `<div class="dx-ctl"><button class="btn" data-dxn="1">${ICO2.plus} One more flight</button>${svc.length ? '<button class="btn" data-dxn="-1">One flight fewer</button>' : ''}</div>`
      : `<div class="dx-ctl">${svc.map(s => `<button class="btn ${sel && sel.q === s.q && sel.k === s.k ? 'on' : ''}" data-dxs="${s.q}|${s.k}">${fmtTime(s.dep)} · ${esc(shortPlane(s.p))}</button>`).join('')}</div>${sel ? `<div class="dx-ctl">${tp.fleet.map((y, q2) => q2 !== sel.q && planeCanFly(planeById(y.planeId), r) ? `<button class="btn" data-dxa="${q2}">Fly it on the ${esc(shortPlane(planeById(y.planeId)))} (${esc(regOf(y.uid))})</button>` : '').join('')}</div>` : ''}`;
    body = `${issue}<h2>${esc(DS_EXP_WORD[X.v])} on ${esc(r.city)}</h2><p class="dx-lock">${ICO2.lock || ''} Testing: ${esc(DS_EXP_ONLY[X.v])}</p>${ctl}
      <div class="dx-model"><span class="kl">The model</span><b class="mono">${num(B.sold)}/${num(B.seats)} → ${num(Tt.sold)}/${num(Tt.seats)}</b><span class="muted">seats filled on ${esc(r.city)}</span></div>
      <div class="st-stripw">${stripHtml(X.test, rid)}</div>`; }
  else { const dp = Tt.sold - B.sold, dv = Tt.profit - B.profit, seatsSay = dp > 1 ? 'more' : dp < -1 ? 'fewer' : 'about the same', profSay = dv > 20 ? 'higher' : dv < -20 ? 'lower' : 'about the same', W = changed ? dsWorth(base, normPlan(X.test), B.L, Tt.L) : null;
    X.result = { pax:dp, profit:dv, seatsOk:X.pred.seats === seatsSay, profitOk:X.pred.profit === profSay };
    body = `<h2>Compare: ${esc(DS_EXP_WORD[X.v]).toLowerCase()} on ${esc(r.city)}</h2>
      <p class="dx-cmp"><b>${dp >= 0 ? '+' : '−'}${num(Math.abs(dp))} passengers</b> · <b class="${dv >= 0 ? 'good' : 'bad'}">${dsSigned(dv)} projected profit</b> a day</p>
      <p class="dx-you">Your prediction: ${esc(X.pred.seats)} seats ${X.result.seatsOk ? '✓' : '✗'} · ${esc(X.pred.profit)} profit ${X.result.profitOk ? '✓' : '✗'}</p>${W && W.line ? `<p class="dx-worth">${dsWorthLineHtml(W)}</p>` : ''}`; }
  const btns = X.step === 'choose' ? '' : X.step === 'predict' ? `<button class="btn primary big" id="dxNext" ${X.pred.seats && X.pred.profit ? '' : 'disabled'}>Make the change &#9654;</button>`
    : X.step === 'change' ? `<button class="btn primary big" id="dxNext" ${changed ? '' : 'disabled'}>Compare &#9654;</button>` : `<button class="btn big" id="dxAgain">Try something else</button><button class="btn primary big" id="dxUse" ${changed ? '' : 'disabled'}>Use this change &#9654;</button>`;
  screen().innerHTML = shell(deskPage({ title:'Investigate', sub:'Choose one thing to test, say what you think will happen, then see what the model says. Nothing changes on your plan until you choose Use this change.', cls:'dx-page', body:`<div class="dx">${head}<section class="dk-pnl dx-b">${body}</section></div>` }),
    deskBar(X.step === 'compare' ? 'Use the change, or try something else.' : 'One thing at a time.', `<button class="btn big" id="dxClose">Close</button><span class="grow"></span>${btns}`));
  const root = screen(), again = () => { X.test = JSON.parse(JSON.stringify(normPlan(currentPlan()))); X.sel = null; render(); };
  const edit = f => { const a = dsAlt(X.test, f); if(!a){ toast("That won't fit in the operating day."); return; } X.test = a.pl; render(); };
  on('dxClose', () => { S.overlay = null; UI.dx = null; render(); });
  const rs = $('dxRoute'); if(rs) rs.onchange = () => { X.route = rs.value; render(); };
  root.querySelectorAll('[data-dxv]').forEach(b => b.onclick = () => { X.v = b.getAttribute('data-dxv'); X.step = 'predict'; X.pred = {}; again(); });
  root.querySelectorAll('[data-dxps]').forEach(b => b.onclick = () => { X.pred.seats = b.getAttribute('data-dxps'); render(); });
  root.querySelectorAll('[data-dxpp]').forEach(b => b.onclick = () => { X.pred.profit = b.getAttribute('data-dxpp'); render(); });
  root.querySelectorAll('[data-dxf]').forEach(b => b.onclick = () => edit(n => { n.prices[rid] = +b.getAttribute('data-dxf'); }));
  root.querySelectorAll('[data-dxs]').forEach(b => b.onclick = () => { const [q, k] = b.getAttribute('data-dxs').split('|').map(Number); X.sel = { q, k }; render(); });
  root.querySelectorAll('[data-dxt]').forEach(b => b.onclick = () => { const s = X.sel; if(!s) return; const tp = normPlan(X.test), dep = actualDeps(tp, s.q)[s.k] + +b.getAttribute('data-dxt'), p = planeById(tp.fleet[s.q].planeId), trip = TIME.roundTrip(p, r);
    if(dep < dayStart() || dep + trip > dayEnd()){ toast('Outside the operating day.'); return; }
    edit(n => { const y = n.fleet[s.q], d = dsDeps(n, s.q); d[s.k] = dep; y.deps = d; }); const tp2 = normPlan(X.test), k2 = tp2.fleet[s.q].sched.map((id, k) => [id, actualDeps(tp2, s.q)[k], k]).filter(z => z[0] === rid).sort((u, v) => Math.abs(u[1] - dep) - Math.abs(v[1] - dep))[0]; if(k2) X.sel = { q:s.q, k:k2[2] }; });
  root.querySelectorAll('[data-dxn]').forEach(b => b.onclick = () => { const up = b.getAttribute('data-dxn') === '1', tp = normPlan(X.test);
    if(up){ const q = tp.fleet.findIndex(x => planeCanFly(planeById(x.planeId), r) && x.sched.length < (WORLD.maxTrips || 4) && freeDep(tp, tp.fleet.indexOf(x), rid) !== null); if(q < 0){ toast(`No aircraft has room for another ${r.city} flight.`); return; }
      const t = freeDep(tp, q, rid); edit(n => { const y = n.fleet[q], d = dsDeps(n, q); y.sched.push(rid); d.push(t); y.deps = d; }); }
    else { const at = []; tp.fleet.forEach((x, q) => x.sched.forEach((id, k) => { if(id === rid) at.push({ q, k }); })); const z = at[at.length - 1]; if(z) edit(n => { const y = n.fleet[z.q], d = dsDeps(n, z.q); y.sched.splice(z.k, 1); d.splice(z.k, 1); y.deps = y.sched.length ? d : null; }); } });
  root.querySelectorAll('[data-dxa]').forEach(b => b.onclick = () => { const s = X.sel, q2 = +b.getAttribute('data-dxa'); if(!s) return; const tp = normPlan(X.test), t = freeDep(tp, q2, rid); if(t === null){ toast('No room in that aircraft\'s day.'); return; }
    edit(n => { const y = n.fleet[s.q], d = dsDeps(n, s.q); y.sched.splice(s.k, 1); d.splice(s.k, 1); y.deps = y.sched.length ? d : null; const z = n.fleet[q2], e = dsDeps(n, q2); z.sched.push(rid); e.push(t); z.deps = e; }); X.sel = null; });
  on('dxNext', () => { X.step = X.step === 'predict' ? 'change' : 'compare'; render(); });
  on('dxAgain', () => { dsExpLog('tried something else'); X.step = 'choose'; X.v = null; X.pred = {}; X.test = null; render(); });
  on('dxUse', () => { dsExpLog('used'); const t = normPlan(X.test); S.overlay = null; UI.dx = null; if(step().t === 'plan'){ UI.s2.mode = 'plan'; setPlan(0, t); } else { applyPlan(t); render(); } toast('The change is on your plan.'); });
};
/* a time move in the experiment: allowed only when the aircraft's day still fits */
function dsMoveFits(tp, s, dt, r){ const p = planeById(tp.fleet[s.q].planeId), dep = actualDeps(tp, s.q)[s.k] + dt; if(dep < dayStart() || dep + TIME.roundTrip(p, r) > dayEnd()) return false;
  const a = dsAlt(tp, n => { const y = n.fleet[s.q], d = dsDeps(n, s.q); d[s.k] = dep; y.deps = d; }); return !!a && planKey(a.pl) !== planKey(tp); }
function dsExpLog(decision){ const X = UI.dx; if(!X || !X.v) return; const d = dsS(), n = d.exps.length + 1;
  d.exps.push({ n, day:S.day, wk:weekNo(S.day || 1), issue:X.tip ? X.tip.id : null, issueText:X.tip ? X.tip.text : null, route:dsTestRoute(), v:X.v, pred:Object.assign({}, X.pred), result:X.result || null, decision, level:dsLevel() });
  if(typeof soLog === 'function') soLog(`Experiment ${n}: ${DS_EXP_WORD[X.v].toLowerCase()} (Build)`); save(); }

/* ---------- the teacher panel and the printout: the figures the pupil does not see ---------- */
function dsTeacherRender(){
  const host = $('tMs') || $('tRec'); if(!host || !S) return; let el = $('tDs');
  if(!el){ const sec = host.closest('.tsec'); if(!sec) return; sec.insertAdjacentHTML('afterend', `<div class="tsec" style="grid-column:1/-1"><h3>Decision support</h3><p class="small muted">The pupil sees words for what is still available ("a large improvement is available") and figures only for changes they made or tested. The best-plan figures are here and in the printout.</p><div id="tDs"></div></div>`); el = $('tDs'); }
  const d = dsS(), lv = dsLevel(), R = d.reviews.slice(-6).reverse(), Lg = d.log.slice(-10).reverse(), E = d.exps.slice(-8).reverse(), ch = (WORLD.chapter || {}).chapter || 1, next = DS_LEVELS[Math.min(DS_LEVELS.length - 1, DS_LEVELS.indexOf(lv) + 1)];
  const ended = typeof msS === 'function' && msS().ended && msS().ended[ch];
  el.innerHTML = `<p class="small"><label>Planning support <select id="tDsLevel">${DS_LEVELS.map(v => `<option value="${v}" ${v === lv ? 'selected' : ''}>${v}</option>`).join('')}</select></label> <span class="muted">guided: the check names the issue and offers two or three experiments · supported: the issue only · independent: no issue named · management: losses and exceptions only.</span>${ended && next !== lv ? ` <b>Chapter ${ch} reviewed: consider moving to ${next}.</b>` : ''}</p>
    <table class="so-log"><thead><tr><th>Week</th><th>Actual</th><th>Best plan</th><th>Missed</th><th>The pupil saw</th><th>Biggest missed opportunity (a week)</th></tr></thead><tbody>${R.map(r => `<tr><td>${r.wk}</td><td>${money(r.yours)}</td><td>${money(r.best)}<div class="muted">${esc(r.label || '')}</div></td><td>${money(r.missed)}</td><td>${esc(r.words)}</td><td>${esc(r.tipText || '—')}${r.stake ? ` <span class="muted">(about ${money(r.stake)})</span>` : ''}</td></tr>`).join('') || '<tr><td colspan="6" class="muted">No Sunday review yet.</td></tr>'}</tbody></table>
    <table class="so-log"><thead><tr><th>Day</th><th>Operations check</th><th>What the pupil did</th></tr></thead><tbody>${Lg.map(x => `<tr><td>${esc(dateShort(x.day))}</td><td>${esc(String(x.id || '').replace(/,/g, ', ') || '—')}</td><td>${{ act:'pressed the action', run:'ran anyway', fix:"Fix next week's plan", investigate:'Help me investigate' }[x.what] || x.what}${x.from && x.from !== 'check' ? ` (${esc(x.from)})` : ''}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">Nothing yet.</td></tr>'}</tbody></table>
    <table class="so-log"><thead><tr><th>Experiment</th><th>Tested</th><th>Predicted</th><th>Result</th><th>Decision</th></tr></thead><tbody>${E.map(x => `<tr><td>${x.n} · week ${x.wk}</td><td>${esc(DS_EXP_WORD[x.v] || x.v)} on ${esc(routeById(x.route) ? routeById(x.route).city : x.route)}</td><td>${esc(x.pred.seats || '?')} seats, ${esc(x.pred.profit || '?')} profit</td><td>${x.result ? `${x.result.pax >= 0 ? '+' : ''}${num(x.result.pax)} passengers, ${dsSigned(x.result.profit)}` : '—'}</td><td>${esc(x.decision)}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">No experiments yet.</td></tr>'}</tbody></table>`;
  const s = $('tDsLevel'); if(s) s.onchange = () => { dsS().level = s.value; save(); dsTeacherRender(); };
}
const dsSoTeacher0 = soTeacherRender;
soTeacherRender = function(){ dsSoTeacher0.apply(this, arguments); try{ dsTeacherRender(); }catch(x){} };
const dsPrint0 = recordPrintHtml;
recordPrintHtml = function(o){ const h = dsPrint0.apply(this, arguments); try{
    o = o || {}; const rg = recRange(o.range), d = dsS(), E = d.exps.filter(x => x.day >= rg.from && x.day <= rg.to), Rv = d.reviews.filter(x => x.from >= rg.from && x.from <= rg.to);
    if(!E.length && !Rv.length) return h;
    const ex = E.length ? `<h2>Experiments</h2><ul class="pt-x">${E.map(x => `<li>Experiment ${x.n} · Week ${x.wk} · tested ${recE({ fare:'the fare', times:'timing', services:'the number of services', aircraft:'the aircraft' }[x.v] || x.v)} on ${recE(routeById(x.route) ? routeById(x.route).city : x.route)} · predicted ${recE(x.pred.seats || '?')} seats${x.result ? ` · result ${x.result.pax >= 0 ? '+' : ''}${num(x.result.pax)} passengers, ${dsSigned(x.result.profit)} a day` : ''} · ${recE(x.decision)}</li>`).join('')}</ul>` : '';
    const rv = Rv.length ? `<h2>Plan quality by week (teacher's copy)</h2><table class="pt"><thead><tr><th>Week</th><th>Actual</th><th>Best plan</th><th>Missed</th><th>The pupil saw</th></tr></thead><tbody>${Rv.map(r => `<tr><td>${r.wk}</td><td>${money(r.yours)}</td><td>${money(r.best)}</td><td>${money(r.missed)}</td><td>${recE(r.words)}</td></tr>`).join('')}</tbody></table>` : '';
    return h.includes('</body>') ? h.replace('</body>', ex + rv + '</body>') : h + ex + rv; }catch(x){ return h; } };

/* for the tests: the check, the drawer, the worth and the experiments as the pupil would see them */
function dsReport(){ const pl = normPlan(currentPlan()), L = planLines(pl), T = dsTips(pl, L), C = dsCheck(pl, L);
  return { level:dsLevel(), check:C.map(h => ({ id:h.id, text:h.text, action:h.action.label, route:h.route, uid:h.uid, k:h.k, band:h.band, priority:h.priority, stake:h.stake, exps:h.exps })), tips:T.map(h => [h.id, h.priority, h.stake]),
    log:dsS().log.slice(-12), exps:dsS().exps, reviews:dsS().reviews, built:dsS().built, worth:dsS().worth, fix:S.dsFix || null, sel:UI.tlSel || null, s2:UI.s2 ? { mode:UI.s2.mode, route:UI.s2.route, strip:UI.s2.strip, focus:UI.s2.focus } : null }; }
