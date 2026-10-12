/* ==================================================================
   THE WEEK 1 PLANNER (Airline Simulator UI Widget Design Brief v4.4, 12 Oct 2026): one connected airline workspace.
   The intro explains the job (Heathrow is the hub, both routes are open: no market gate). The planner shows both markets
   with their fare chips, the aircraft day as the schedule editor (each service is a block on the 06:00–22:00 timeline:
   press it, move it with the buttons, the keyboard or a drag, swap its route, remove it; the demand sits directly above),
   the on-board choice, the fuel widget (the timetable sets the litres; the pupil costs them) and Plan Impact on the
   right, with ƒ on every figure the day's sums ask for. Work it out is a dock on the same page (structured working,
   squared paper, the formula); a finished figure is written back to Plan Impact. Test an idea compares the current plan
   with one test plan (what changed, the change in each measure, Use / Reset). The map is a button away.
   Square geometry; pale work surfaces for the pupil's decisions and sums, dark panels for context and results.
   Day-at-a-time play (the teacher's setting) keeps the earlier screens: every function here falls back when
   weekMode() is off.
   ================================================================== */
const wkPlanner = () => typeof weekMode === 'function' && weekMode();
const dayLike = () => !!S && (S.phase === 'setup' || !!(S.period && S.period.type === 'day'));
const planW0 = R.plan, workW0 = R.workings;
const PLW_SNAP = 10;   // minutes: the timeline's grid

/* ---------- steps: the intro replaces the aircraft, market, demand and rotation screens; both routes are open ---------- */
function newState(){
  const s = newStateBase(); if(!wkPlanner()) return s;
  s.steps = s.steps.filter(x => !['starter', 'market', 'demand', 'rotation'].includes(x.t));
  const ci = s.steps.findIndex(x => x.t === 'chapter'); s.steps.splice(ci + 1, 0, { t:'brief1' });
  s.market = WORLD.setupRoutes[0]; WORLD.setupRoutes.forEach(id => { const r = routeById(id); if(r) s.prices[id] = r.basePrice; });
  s.seenModules = ['network'];   // the map is a button away from the start: no "Network online" notice
  return s;
}
SHELL_STEPS.push('brief1'); WS_STEPS.push('workings');   // the sums are a dock on the planner, inside the workspace
Object.assign(RAIL_LABEL, { brief1:'Your first week' }); Object.assign(SUB_DESC, { brief1:'The job and the starting position', plan:'Timetable, fares, on board and fuel' });
Object.assign(STEP_HINT, { brief1:'This is your airline. Read the starting position, then open the Week 1 planner.',
  plan:'Add services to the timeline and move them, choose the fares and what happens on board. Then press Cost your plan.', workings:'Work out each figure in the panel on the right. The plan stays in view; Back changes it.' });
Object.assign(STEP_TODO, { plan:'' });
const LAUNCH_WK = [Object.assign(stg('plan', ['brief1', 'plan']), { sub:'Build your first operating plan' }), stg('cost', ['workings']), stg('go', ['ready']), stg('review')];
function railStages(){ if(wkPlanner() && S.phase === 'setup') return LAUNCH_WK; return STAGES[railKind()] || STAGES.day; }
/* the map is a button away from the planner, from the first day */
function moduleOn(id){ if(id === 'network' && wkPlanner() && S && S.fleet && S.fleet.length) return true; return moduleOnBase(id); }
function editStep(what){ if(wkPlanner() && dayLike()) return what === 'forecast' ? 'workings' : 'plan'; return editStepBase(what); }
/* no plan rail (the stage list down the left): it took room the planner needs; Back steps through the day's screens */
function planRail(){ return wkPlanner() ? '' : planRailBase(); }
/* the help under Plan Impact: one row of short names beside the planner */
const HELP_SHORT = { timing:'Timing', demand:'Demand', fuel:'Fuel', money:'Money', forecast:'Forecast' };
function dockTools(o){
  if(!(wkPlanner() && dayLike() && ['plan', 'workings'].includes(step().t))) return dockToolsBase(o);
  const b = (o.help || []).map(k => `<button class="dk-help" data-help="${k}" title="${esc(HELP[k] || '')}"><i>?</i><span><b>${esc(HELP_SHORT[k] || HELP[k] || k)}</b></span></button>`);
  return b.length ? `<div class="dk-tools dk-row">${b.join('')}</div>` : '';
}

R.brief1 = () => {
  const p = planeById('dhc6'), h = homeData(), rs = WORLD.setupRoutes.map(routeById), f = S.fleet[0];
  const art = f ? aircraftArt(ensureIdentity(f), { cls:'pic' }) : planeSvg(p);
  const steps = [['Build your timetable', 'Choose how many services to fly, where to and when. Make the best use of the aircraft\'s day.'],
    ['Set fares', 'Choose a ticket price for each route. A higher fare earns more a ticket, but fewer people want to fly.'],
    ['Choose on-board service', 'Sell snacks at £3 or £5, give them free, or sell none. It changes what the day earns.'],
    ['Work out the key numbers', 'Tickets, profit, snacks and fuel by hand, on the same page as the plan. The model shows the rest.'],
    ['Run the week', 'Confirm the plan and watch the airline fly Monday to Sunday. Then the review: what did the week earn?']];
  screen().innerHTML = shell(`<div class="hp br1"><div class="br1-hero"><div><span class="kl">Launch Day · ${esc(dateLong(1))}</span><h1>Your first week in charge</h1><p>Build the timetable, set the fares, choose the on-board service, work out the key numbers, then run your first week of operations. Every decision changes demand, revenue, costs and profit.</p></div>${logoSvg(72)}</div>
    <div class="br1-sit"><span class="kl">Your starting position</span><div class="br1-cards">
      <div class="br1-c"><small>Home airport</small><b>${esc(h.name)} (${esc(h.code)})</b><span>Your airline is based at ${esc(h.code)}. The airport is open ${WORLD.dayStart} to ${WORLD.dayEnd}.</span></div>
      <div class="br1-c ac"><small>Aircraft</small><b>1 × ${esc(p.name)}</b><span>${p.seats} seats · ${money(p.dayCost)} a day · ready for service</span>${art}</div>
      ${rs.map(r => `<div class="br1-c"><small>Route · open</small><b>${esc(r.city)}${r.code ? ` (${esc(r.code)})` : ''}</b><span>${num(routeKm(r))} km · ${fmtDur(TIME.leg(p, r))} each way · available from day one</span></div>`).join('')}
    </div></div>
    <div class="br1-steps"><span class="kl">Your Week 1 plan: five simple steps</span><ol>${steps.map(([t, d], i) => `<li><i>${i + 1}</i><b>${t}</b><span>${d}</span></li>`).join('')}</ol></div>
    <p class="br1-foot">Real decisions, real results. Cash to start: <b class="mono gold">${money(S.cash)}</b>, with ${money(WORLD.cashReserve || 0)} always kept back for emergencies.</p></div>`,
    `<footer class="actbar"><span class="ab-i" aria-hidden="true">i</span><p class="ab-hint">${STEP_HINT.brief1}</p><div class="ab-act"><button class="btn primary big" id="nx">Open Week 1 Planner &#9654;</button></div></footer>`);
  on('nx', () => { if(!S.fleet.length) buyPlane(planeById('dhc6')); const f0 = fleetOne(); S.rnd.featured = f0.uid; S.rnd.focusRoute = S.market; advance(); });
};

/* ---------- the plan: the route with most services is the market the launch sums work on; absolute edits ---------- */
function launchMarket(pl){ pl = normPlan(pl); const all = pl.fleet.flatMap(x => x.sched); if(!all.length) return S.market || WORLD.setupRoutes[0];
  const c = serviceCounts(all); let best = all[0]; Object.keys(c).forEach(id => { if(c[id] > c[best]) best = id; }); return WORLD.setupRoutes.includes(best) ? best : (S.market || WORLD.setupRoutes[0]); }
/* depTo: a service moved to a time (the buttons, the keyboard and a drag all come here); fareTo: a fare chip */
function editPlan(i, what, a, d, j){
  if(what !== 'depTo' && what !== 'fareTo') return editPlanBase(i, what, a, d, j);
  j = j || 0; const base = i === 9 ? testPlan() : currentPlan(), next = normPlan(JSON.parse(JSON.stringify(base))), x = next.fleet[j] || next.fleet[0], p = planeById(x.planeId);
  if(what === 'fareTo'){ const r = routeById(a), F = r.fares || [r.basePrice]; if(!F.includes(+d)) return; next.prices[a] = +d; setPlan(i, next); return; }
  const k = +a; if(!x.sched[k]) return;
  if(!x.deps || x.deps.length !== x.sched.length) x.deps = actualDeps(next, j);
  const r = routeById(x.sched[k]), trip = TIME.roundTrip(p, r), dep = clamp(Math.round(d / PLW_SNAP) * PLW_SNAP, dayStart(), dayEnd() - trip);
  x.deps[k] = dep;
  const order = x.sched.map((id, q) => ({ id, dep:x.deps[q], q })).sort((u, v) => u.dep - v.dep || u.q - v.q);   // the blocks keep time order
  x.sched = order.map(o => o.id); x.deps = order.map(o => o.dep);
  const actual = actualDeps(next, j), nk = order.findIndex(o => o.q === k); x.deps = actual;
  if(!withPlan(next, () => fitsFor(x))){ toast("That timetable won't fit in the operating day."); return; }
  if(actual[nk] !== dep) toast(`${r.city} leaves at ${fmtTime(actual[nk])}: the aircraft is not back until then.`);
  UI.tlSel = { i, j, k:nk };
  setPlan(i, next);
}
function moveService(i, j, k, dep){ editPlan(i, 'depTo', k, dep, j); }

/* ---------- the day's sums: on Launch Day every route in the plan has its tickets worked out ---------- */
function decideHandSums(L, pl){
  const out = decideHandSumsWeek(L, pl); if(!(wkPlanner() && S.phase === 'setup')) return out;
  const ids = [...new Set(normPlan(pl).fleet.flatMap(x => x.sched))].filter(id => id !== S.market);
  out.revenue = { level:'calc', routes:[S.market].concat(ids) }; return out;
}
function wkStagesLaunch(pl){
  const st = wkStagesLaunchWeek(pl); if(!wkPlanner()) return st;
  const ids = [...new Set(normPlan(pl).fleet.flatMap(x => x.sched))].filter(id => id !== S.market);
  ids.forEach((id, n) => { const r = routeById(id), fare = pl.prices[id] || r.basePrice;
    st.splice(1 + n, 0, { id:'tk' + id, opts:[{ id:'a', label:`${r.city} at ${money(fare)}`, sub:`${paxWant(r, fare)} want to fly`, plan:Object.assign({}, pl, { onboard:'none' }), pick:null, word:'' }], rowIds:['pax_' + id, 'fare_' + id, 'tk_' + id] }); });
  return st;
}
/* the figures still to work out today, by Plan Impact row: a sum keeps its figure hidden until it is done (and chosen) */
const SUM_OF_ROW = id => /^tk_|^tk\d/.test(id) ? 'revenue' : id === 'snack' ? 'snacks' : id === 'fuel' ? 'fuelCost' : id === 'profit' ? 'profit' : id === 'stay' ? 'stay' : null;
function hiddenFigs(pl, W){
  const out = new Set(); if(!wkPlanner() || !dayLike()) return out;
  if(S.rnd.costed && S.rnd.costed.key === planKey(pl)) return out;
  try{ W = W || workTables(pl); }catch(e){ return out; }
  const picks = S.rnd.picks || {};
  if(S.phase === 'setup' && W.stage){   // Launch Day: the stages still to come (the tables are built one stage at a time)
    const stages = wkStagesLaunch(pl), fig = s => s.id === 'fare' || /^tk/.test(s.id) ? 'revenue' : s.id === 'profit' ? 'profit' : s.id === 'snack' ? 'snacks' : s.id === 'fuel' ? 'fuelCost' : null;
    const cur = W.tables.find(x => x.stage === W.stage.id), past = cur && tableComplete(cur) && (!W.stage.pick || picks[W.stage.pick]);
    const at = past ? stages.length : Math.max(0, stages.findIndex(x => x.id === W.stage.id));
    stages.slice(at).forEach(x => { const k = fig(x); if(k) out.add(k); });
    if(!picks.fare){ out.add('revenue'); out.add('profit'); } if(stages.some(x => x.id === 'snack') && !picks.snack) out.add('snacks');
    return out; }
  wkCells(W.tables).forEach(x => { if(x.s === 'done') return; const k = SUM_OF_ROW(x.r.id); if(k) out.add(k); });
  return out;
}
function openSum(kind){ S.rnd.sumWanted = kind; UI.sumMode = 'grid'; if(step().t === 'plan'){ UI.ideaOpen = false; resetEntry(); UI.justDone = null; advance(); } else render(); }

/* ---------- the market widgets: city, facts, the fare chips with the people at each fare ---------- */
function marketWidget(i, id, pl, L, o){
  o = o || {}; const r = routeById(id), p = planeById(pl.fleet[0].planeId), fare = pl.prices[id] || r.basePrice, F = r.fares || [r.basePrice], n = serviceCounts(pl.fleet.flatMap(x => x.sched))[id] || 0, rival = competitorPrice(r);
  const lock = o.lockFare === id && !o.pick, pickIds = o.pick ? Object.fromEntries(o.pick.map(x => [x.pick.fare, x.id])) : null;
  const chip = f => { const on = f === fare; if(pickIds) return `<button class="fch ${on ? 'on' : ''} ${pickIds[f] !== undefined ? 'pick' : ''}" ${pickIds[f] !== undefined ? `data-wpick="${pickIds[f]}"` : 'disabled'}><b>${money(f)}</b><small>${paxWant(r, f)}</small></button>`;
    return `<button class="fch ${on ? 'on' : ''}" data-pe="${i}|fareTo|${id}|${f}" ${lock || o.locked ? 'disabled' : ''} aria-pressed="${on}"><b>${money(f)}</b><small>${paxWant(r, f)}</small></button>`; };
  const note = pickIds ? 'Choose the fare to fly at.' : lock ? 'Chosen after the ticket sums on the right.' : '';
  return `<div class="mk pale ${n ? 'on' : ''}"><div class="mk-h">${flagSvg(r.flag, 22)}<b>${esc(r.city)}</b><span class="mk-code">${esc(r.code || '')}</span><span class="mk-n ${n ? '' : 'muted'}">${n ? plural(n, 'service') : 'no services yet'}</span></div>
    <div class="mk-facts"><span>${esc(r.country || '')}</span><span>${fmtDur(TIME.leg(p, r))} each way</span><span>${num(routeKm(r))} km</span>${rival !== undefined ? `<span class="mk-rival">${esc(WORLD.rival)} ${money(rival)}</span>` : ''}</div>
    <div class="mk-fares"><span class="label">Fare (one way) · people who want to fly</span><div class="mk-chips">${F.map(chip).join('')}</div>${note ? `<small class="muted">${note}</small>` : ''}</div></div>`;
}
function otherRoutesRow(i, pl, shown){
  const more = plannerRoutes().filter(id => !shown.includes(id)); if(!more.length) return '';
  return `<div class="mk-more pale"><span class="label">Other open routes</span>${more.map(id => { const r = routeById(id), can = pl.fleet.some(z => planeCanFly(planeById(z.planeId), r));
    return `<button class="btn small" data-pe="${i}|open|${id}|0|0" ${can ? '' : 'disabled'} title="${can ? `Add a ${r.city} service` : `No aircraft you own can reach ${r.city} (${num(routeKm(r))} km)`}">${flagSvg(r.flag, 14)} ${esc(r.city)} <small>${money(r.basePrice)} · ${paxWant(r, r.basePrice)} want${can ? '' : ' · out of range'}</small></button>`; }).join('')}</div>`;
}

/* ---------- the aircraft day: the timeline is the schedule editor ---------- */
function tlDemandRow(id){
  const r = routeById(id), a = archOf(r) || {}, bandsOf = a.bands || {}, s0 = dayStart(), e0 = dayEnd(), span = e0 - s0, X = m => (100 * (m - s0) / span).toFixed(2);
  const bands = BANDS.map(b => { const [h0, h1] = bandHours(b); return [b, Math.max(s0, h0 * 60), Math.min(e0, h1 * 60)]; });
  const dens = bands.map(([b, s, e]) => (bandsOf[b] || 0) / Math.max(1, (e - s) / 60)), mx = Math.max(1e-9, ...dens);
  return `<div class="ad-dem"><span class="ad-lab">${flagSvg(r.flag, 14)} <b>${esc(r.city)}</b><small>who wants to fly when</small></span><div class="ds-bar">${bands.map(([b, s, e], k) => `<i class="ds-b ${b}" style="left:${X(s)}%;width:${(100 * (e - s) / span).toFixed(2)}%;--h:${Math.max(10, Math.round(100 * dens[k] / mx))}%" title="${esc(BAND_NAMES[b] || b)}"><span>${BAND_SHORT[b] || ''}</span></i>`).join('')}</div></div>`;
}
/* the routes in a steady order: the launch routes first (Paris, Dublin), then the others as they open */
function plannerOrder(){ const all = plannerRoutes(), ord = id => { const k = WORLD.setupRoutes.indexOf(id); return k < 0 ? 99 : k; }; return all.slice().sort((a, b) => ord(a) - ord(b) || all.indexOf(a) - all.indexOf(b)); }
function tlCode(r){ return String(r.code || r.airport || r.id).toUpperCase().slice(0, 3); }
function timelineHtml(i, pl, L, o){
  o = o || {}; pl = normPlan(pl); const s0 = dayStart(), e0 = dayEnd(), span = e0 - s0, X = m => (100 * (m - s0) / span).toFixed(2), sel = UI.tlSel && UI.tlSel.i === i ? UI.tlSel : null, maxT = WORLD.maxTrips || 4;
  const all = plannerOrder(), inPlan = all.filter(id => pl.fleet.some(x => x.sched.includes(id))), dem = (inPlan.length >= 2 ? inPlan : inPlan.concat(all.filter(id => !inPlan.includes(id)))).slice(0, 3);   // the demand rows: the routes in the plan (both launch routes while the plan is small)
  const ticks = []; for(let h = Math.ceil(s0 / 60); h * 60 <= e0; h += 2) ticks.push(`<span style="left:${X(h * 60)}%">${pad(h)}:00</span>`);
  const lanes = pl.fleet.map((x, j) => { const p = planeById(x.planeId), f = S.fleet.find(z => z.uid === x.uid), home = TIME.home(p), D = x.sched.length ? withPlan(pl, () => TIME.day(p, x.sched, undefined, x.deps || null)) : null;
    const blocks = D ? D.trips.map((t, k) => { const r = routeById(t.route), s = (L.services || []).find(z => z.uid === x.uid && z.k === k) || {}, over = t.arr > e0, on = sel && sel.j === j && sel.k === k, ready = t.arr + home, full = s.seats && s.sold >= s.seats;
      return `<i class="ad-ready" style="left:${X(t.arr)}%;width:${X(ready) - X(t.arr)}%" title="Ready again at ${fmtTime(ready)}"></i><button class="ad-blk ${on ? 'on' : ''} ${over ? 'over' : ''} ${full ? 'full' : ''}" data-tl="${i}|${j}|${k}" data-rc="${Math.max(0, plannerRoutes().indexOf(t.route)) % 4}" data-dep="${t.dep}" data-arr="${t.arr}" data-ready="${ready}" style="left:${X(t.dep)}%;width:${(X(t.arr) - X(t.dep)).toFixed(2)}%" ${o.locked ? 'disabled' : ''} aria-label="${esc(r.city)} ${fmtTime(t.dep)} to ${fmtTime(t.arr)}, ${s.sold || 0} of ${s.seats || p.seats} seats${over ? ', lands after the airport closes' : ''}" aria-pressed="${!!on}"><b>${fmtTime(t.dep)}</b><small>${tlCode(r)}${s.sold === undefined ? '' : ` · ${s.sold}/${s.seats}`}</small></button>`; }).join('') : '';
    const adds = plannerOrder().map(id => { const r = routeById(id), can = planeCanFly(p, r); return `<button class="btn small ad-add" data-pe="${i}|add|${id}|0|${j}" ${can && x.sched.length < maxT && !o.locked ? '' : 'disabled'} title="${can ? `Add a ${r.city} service` : `${p.name}: range ${num(p.range)} km, ${r.city} is ${num(routeKm(r))} km away`}">+ ${esc(r.city)}</button>`; }).join('');
    return `<div class="ad-ac"><div class="ad-lab ad-plane">${planeMini(f || p, 'ad-pic')}<span><b>${esc(p.name.replace(/^DHC-6 /, ''))}</b><small>${esc(regOf(x.uid))} · ${p.seats} seats${f && f.terms ? ' · ' + termsWord(f.terms) : ''}</small></span></div>
      <div class="ad-lane ${o.locked ? 'locked' : ''}" data-lane="${i}|${j}" data-s0="${s0}" data-span="${span}">${blocks || `<span class="ad-none muted">No services yet. Add one below.</span>`}</div>
      <div class="ad-adds">${x.sched.length >= maxT ? `<span class="muted small">${maxT} services is the most one aircraft can fly in a day</span>` : adds}${!o.locked && sel && sel.j === j && x.sched[sel.k] ? tlSelHtml(i, pl, L, j, sel.k) : ''}</div></div>`; }).join('');
  return `<div class="ad ${o.locked ? 'locked' : ''}">${dem.map(tlDemandRow).join('')}
    <div class="ad-axis"><span class="ad-lab"></span><div class="ad-ticks">${ticks.join('')}</div></div>${lanes}</div>`;
}
function tlSelHtml(i, pl, L, j, k){
  const x = pl.fleet[j], p = planeById(x.planeId), D = withPlan(pl, () => TIME.day(p, x.sched, undefined, x.deps || null)), t = D.trips[k], r = routeById(t.route), s = (L.services || []).find(z => z.uid === x.uid && z.k === k) || {}, many = plannerRoutes().filter(id => planeCanFly(p, routeById(id))).length > 1;
  const a = `${i}|${j}|${k}`;
  return `<span class="ad-selin"><span class="ad-sel-t"><span class="kl">Selected</span><b>${esc(r.city)} ${fmtTime(t.dep)}</b><small>back ${fmtTime(t.arr)} · ready ${fmtTime(t.arr + TIME.home(p))} · ${s.sold || 0}/${s.seats || p.seats} seats</small></span>
    <button class="btn" data-tlm="${a}|-20" aria-label="20 minutes earlier">&#9664; Earlier</button><button class="btn" data-tlm="${a}|20" aria-label="20 minutes later">Later &#9654;</button>
    <button class="btn" data-tlsw="${a}" ${many ? '' : 'disabled'}>Swap route</button><button class="btn danger" data-tlrm="${a}">Remove</button></span>`;
}
function tlControlsHtml(){ return ''; }
let tlDrag = null;
function bindTimeline(){
  const root = screen(); if(!root.querySelector('.ad')) return;
  root.querySelectorAll('[data-tlm]').forEach(b => b.onclick = () => { const [i, j, k, d] = b.getAttribute('data-tlm').split('|').map(Number), blk = root.querySelector(`[data-tl="${i}|${j}|${k}"]`); if(blk) moveService(i, j, k, +blk.dataset.dep + d); });
  root.querySelectorAll('[data-tlsw]').forEach(b => b.onclick = () => { const [i, j, k] = b.getAttribute('data-tlsw').split('|').map(Number); editPlan(i, 'route', k, 1, j); });
  root.querySelectorAll('[data-tlrm]').forEach(b => b.onclick = () => { const [i, j, k] = b.getAttribute('data-tlrm').split('|').map(Number); UI.tlSel = null; editPlan(i, 'del', k, 0, j); });
  root.querySelectorAll('.ad-blk').forEach(b => {
    const [i, j, k] = b.getAttribute('data-tl').split('|').map(Number), lane = b.closest('.ad-lane'), s0 = +lane.dataset.s0, span = +lane.dataset.span, locked = lane.classList.contains('locked');
    b.onclick = e => { if(tlDrag && tlDrag.moved){ e.preventDefault(); return; } UI.tlSel = { i, j, k }; render(); };
    if(locked) return;
    b.onkeydown = e => { const dep = +b.dataset.dep;
      if(e.key === 'ArrowLeft' || e.key === 'ArrowRight'){ e.preventDefault(); UI.tlFocus = true; moveService(i, j, k, dep + (e.key === 'ArrowLeft' ? -1 : 1) * (e.shiftKey ? 60 : PLW_SNAP)); }
      else if(e.key === 'Delete' || e.key === 'Backspace'){ e.preventDefault(); UI.tlSel = null; editPlan(i, 'del', k, 0, j); } };
    b.onpointerdown = e => { if(e.button !== 0) return; const r = lane.getBoundingClientRect(), trip = +b.dataset.arr - +b.dataset.dep;
      const others = [...lane.querySelectorAll('.ad-blk')].filter(x => x !== b).map(x => [+x.dataset.dep, +x.dataset.ready]);
      tlDrag = { b, x0:e.clientX, w:r.width, dep0:+b.dataset.dep, trip, others, dm:0, moved:false, ghost:null, s0, span };
      try{ b.setPointerCapture(e.pointerId); }catch(err){} };
    b.onpointermove = e => { const g = tlDrag; if(!g || g.b !== b) return; const dx = e.clientX - g.x0; if(!g.moved && Math.abs(dx) < 4) return;
      if(!g.ghost){ g.ghost = b.cloneNode(true); g.ghost.className = 'ad-blk ghost'; g.ghost.removeAttribute('data-tl'); lane.appendChild(g.ghost); }
      g.moved = true; g.dm = Math.round(dx / g.w * g.span / PLW_SNAP) * PLW_SNAP;
      const dep = clamp(g.dep0 + g.dm, g.s0, g.s0 + g.span - g.trip), px = (dep - g.dep0) / g.span * g.w, clash = g.others.some(([a, z]) => dep < z && dep + g.trip > a);
      b.style.transform = `translateX(${px}px)`; b.classList.add('dragging'); b.classList.toggle('clash', clash); b.querySelector('b').textContent = fmtTime(dep); };
    b.onpointerup = b.onpointercancel = e => { const g = tlDrag; if(!g || g.b !== b) return; try{ b.releasePointerCapture(e.pointerId); }catch(err){}
      if(g.ghost) g.ghost.remove(); b.style.transform = ''; b.classList.remove('dragging', 'clash');
      if(g.moved && g.dm){ UI.tlSel = { i, j, k }; moveService(i, j, k, g.dep0 + g.dm); setTimeout(() => { tlDrag = null; }, 0); } else { if(g.moved){ setTimeout(() => { tlDrag = null; }, 0); render(); } else tlDrag = null; } };
  });
  if(UI.tlFocus){ UI.tlFocus = false; const el = root.querySelector('.ad-blk.on'); if(el) setTimeout(() => { try{ el.focus(); }catch(e){} }, 20); }
}

/* ---------- on board ---------- */
function onboardTiles(i, pl, o){
  o = o || {}; if(!snacksOn()) return '';
  const cur = pl.onboard || 'none', pickIds = o.pick ? Object.fromEntries(o.pick.map(x => [x.pick.onboard, x.id])) : null;
  const tiles = Object.keys(ONBOARD).map(k => { const on = cur === k; if(pickIds) return `<button class="obc ${on ? 'on' : ''} ${pickIds[k] ? 'pick' : ''}" ${pickIds[k] ? `data-wpick="${pickIds[k]}"` : 'disabled'}><b>${esc(ONBOARD[k].label)}</b><small>${esc(ONBOARD[k].sub)}</small></button>`;
    return `<button class="obc ${on ? 'on' : ''}" data-pe="${i}|ob|${k}|0" aria-pressed="${on}" ${o.lock || o.locked ? 'disabled' : ''} title="${esc(ONBOARD[k].sub)}"><b>${esc(ONBOARD[k].label)}</b><small>${esc(ONBOARD[k].sub)}</small></button>`; }).join('');
  const note = pickIds ? 'Choose what happens on board.' : o.lock ? 'Worked out on the right: snacks are chosen once their sums are done.' : '';
  return `<section class="pnl pale plw-ob"><div class="ob-h"><h3>On board</h3><span class="muted">${note || 'What the crew sell, or give'}</span></div><div class="obc-grid">${tiles}</div></section>`;
}

/* ---------- fuel: the timetable sets the litres, the pupil costs them; Monday's order is what the week needs ---------- */
function autoFuelOrder(pl, L){
  if(!wkPlanner() || !dayLike() || S.phase === 'round' && S.day >= (WORLD.weekFrom || 22)) return null;
  const from = S.day || 1, price = weekFuelPrice(from), paidDays = paidDaysThisWeek(from), lot = WORLD.fuelLot || 500;
  const need = Math.max(0, (L.fuelL || 0) * paidDays - S.fuel), space = Math.floor(tankSpace() / lot) * lot, afford = Math.floor(Math.max(0, S.cash - (WORLD.cashReserve || 0)) / (lot * price)) * lot;
  const litres = need > 0 ? Math.max(0, Math.min(ceilLot(need), space, afford)) : 0;
  S.rnd.fuelOrder = litres ? { litres, price, total:r2(litres * price), auto:true } : null; return S.rnd.fuelOrder;
}
function fuelWidgetHtml(pl, L, o){
  o = o || {}; if(!S.fleet.length) return '';
  pl = normPlan(pl); const from = S.day || 1, paid = fuelPaid(), price = weekFuelPrice(from), paidDays = paidDaysThisWeek(from), need = L.fuelL || 0, cap = tankCapacity(), pct = clamp(100 * need / cap, 0, 100);
  const order = o.test ? S.rnd.fuelOrder : autoFuelOrder(pl, L);
  const by = {}; (L.services || []).forEach(s => { const x = pl.fleet.find(z => z.uid === s.uid), l = x ? fuelForTrip(planeById(x.planeId), routeById(s.route)) : 0, key = s.route + '|' + l; if(!by[key]) by[key] = { route:s.route, each:l, n:0 }; by[key].n++; });
  const rows = Object.values(by).map(x => Object.assign(x, { tot:x.each * x.n }));
  let firstPaid = from; for(let d = from; d < from + 7; d++){ if(!fuelFreeDay(d)){ firstPaid = d; break; } }
  const hid = o.hidden && o.hidden.has('fuelCost'), cost = Math.round(need * price);
  const ticks = [0, .5, 1].map(f => `<span style="bottom:${f * 100}%">${num(Math.round(cap * f))}</span>`).join('');
  return `<section class="pnl pale fw2"><div class="fw2-g">
    <div class="fw2-gauge"><span class="kl">Fuel today</span><div class="fw2-tankw"><div class="fw2-tank" role="img" aria-label="${num(need)} litres of a ${num(cap)} litre tank"><i style="height:${pct}%"></i></div><div class="fw2-ticks">${ticks}</div></div><b class="mono">${num(need)} L</b><small>this timetable</small></div>
    <div class="fw2-svcs"><span class="kl">Where the fuel goes</span>${rows.map(x => `<div class="fw2-s"><span>${esc(routeById(x.route).city)} ×${x.n}<small>${num(x.each)} L a service</small></span><b class="mono">${num(x.tot)} L</b></div>`).join('') || '<p class="muted small">No services yet.</p>'}</div>
    <div class="fw2-cost"><span class="kl">Cost it</span><div class="fw2-row"><span>Price a litre${paid ? '' : `<small>from ${dateShort(firstPaid)}</small>`}</span><b class="mono">${priceL(price)}</b></div>
      <div class="fw2-row tot"><span>${num(need)} L × ${priceL(price)}</span>${hid ? sumBtn('fuelCost') : `<b class="mono gold">${money(cost)}</b>`}</div>
      ${paid ? '' : '<p class="small muted">Today the launch deal supplies the fuel free.</p>'}</div>
    <div class="fw2-week"><span class="kl">If this plan runs all week</span><div class="fw2-row"><span>Fuel burned, 7 days</span><b class="mono">${num(need * 7)} L</b></div><div class="fw2-row"><span>Fuel cost, ${paidDays} paid day${paidDays === 1 ? '' : 's'}</span><b class="mono gold">${money(Math.round(need * paidDays * price))}</b></div>
      <p class="small">${order ? `Monday's order: ${num(order.litres)} L at ${priceL(order.price)} = ${money(order.total)}${order.litres < need * paidDays - S.fuel ? ', then day by day' : ''}.` : need ? 'The tank already covers the week.' : ''}</p></div></div></section>`;
}
function sumBtn(kind){ return `<button class="fx-sum" data-sum="${kind}" title="Work it out by hand"><i>ƒ</i> work it out</button>`; }
function fuelPanelHtml(){ return ''; }
function bindFuelPanel(){}

/* ---------- Plan Impact: the standing plan's figures for one day, live; the sums' figures appear as they are done ---------- */
function ctxPlanImpact(pl, L, o){
  o = o || {}; pl = pl || currentPlan(); L = L || planLines(pl); const v = L.v, hid = o.hidden || hiddenFigs(pl);
  const seats = L.seats || 0, pax = L.pax || 0, empty = L.empty || 0, pct = seats ? Math.round(100 * pax / seats) : 0, paid = fuelPaid(), litres = v.fuelL || 0, ppl = paid ? (v.ppl || fuelPrice()) : 0;
  const prev = UI.piPrev || {}, cur = {}, flash = !!o.flash;
  const val = (key, main, sub, cls) => { cur[key] = main; const chg = flash && prev[key] !== undefined && prev[key] !== main; return `<span class="pi-v ${cls || ''} ${chg ? 'chg' : ''}">${main}${sub ? `<small>${sub}</small>` : ''}</span>`; };
  const row = (ic, label, sub, value, cls) => `<div class="pi-r ${cls || ''}">${ICON[ic] || ''}<span class="pi-l">${label}${sub ? `<small>${sub}</small>` : ''}</span>${value}</div>`;
  const dayCost = pl.fleet.reduce((t, x) => { const f = S.fleet.find(z => z.uid === x.uid); return t + (f ? dayCostOf(f) : 0); }, 0), other = (v.run || 0) + (v.term || 0) + dayCost + (v.stock || 0) + (v.event || 0);
  const html = `<p class="dk-sub">Live results for this plan, per day</p><div class="pi">
    ${row('pax', 'Projected passengers', '', val('pax', num(pax), seats ? `${pct}% of seats` : ''))}
    ${row('seat', 'Seats available', '', val('seats', num(seats), pl.fleet.filter(x => x.sched.length).map(x => `${x.sched.length} × ${planeById(x.planeId).seats}`).join(' + ')))}
    ${row('seat', 'Empty seats', '', val('empty', num(empty), seats ? `${100 - pct}%` : ''))}
    ${row('pax', 'Turned away', 'wanted to fly, no seat', val('nos', num(L.nos || 0), '', L.nos ? 'warn' : ''))}
    ${row('cash', 'Ticket revenue', '', hid.has('revenue') ? sumBtn('revenue') : val('rev', money((v.rev || 0) - (v.snack || 0)), pax ? `${num(pax)} × fares` : ''))}
    ${snacksOn() ? row('cash', 'Cabin sales', '', hid.has('snacks') ? sumBtn('snacks') : val('snack', money(v.snack || 0), v.buyers ? `${num(v.buyers)} × ${money(v.snackP)}` : '')) : ''}
    ${row('cash', 'Total revenue', 'tickets + cabin sales', hid.has('revenue') || hid.has('snacks') ? `<span class="pi-v todo">after the sums</span>` : val('revT', money(v.rev || 0)), 'tot')}
    ${row('fuel', 'Fuel litres needed', '', val('fuelL', `${num(litres)} L`, L.services && L.services.length ? `${num(Math.round(litres / L.services.length))} L a service` : ''))}
    ${paid ? row('fuel', 'Fuel cost', `at ${priceL(ppl)}`, hid.has('fuelCost') ? sumBtn('fuelCost') : val('fuel', money(v.fuel || 0), `${num(litres)} L × ${priceL(ppl)}`)) : row('fuel', 'Fuel', '', val('fuel', 'free', 'the launch deal'))}
    ${row('fleet', 'Other costs', 'aircraft day, flying, airport', val('other', money(other), ''))}
    ${row('cash', 'Total costs', 'fuel + other costs', hid.has('fuelCost') ? `<span class="pi-v todo">after the sums</span>` : val('cost', money(v.cost || 0)), 'tot')}
    ${row('profit', 'Projected profit', 'per day', hid.has('profit') ? sumBtn('profit') : hid.has('revenue') || hid.has('fuelCost') ? `<span class="pi-v todo">after the sums</span>` : val('profit', money(v.profit || 0), seats ? `margin ${v.rev ? Math.round(100 * v.profit / v.rev) : 0}%` : '', v.profit < 0 ? 'neg' : ''), 'profit')}
  </div>`;
  if(flash) UI.piPrev = cur;
  return { title:'Plan Impact', html };
}

/* ---------- test an idea: one test plan against the current plan ---------- */
function planDiff(a, b){
  a = normPlan(a); b = normPlan(b); const out = [], ids = [...new Set(a.fleet.flatMap(x => x.sched).concat(b.fleet.flatMap(x => x.sched)))], words = ['', 'one', 'two', 'three', 'four'];
  ids.forEach(id => { const r = routeById(id), fa = a.prices[id] || r.basePrice, fb = b.prices[id] || r.basePrice; if(fa !== fb && b.fleet.some(x => x.sched.includes(id))) out.push(`${r.city} fare ${money(fa)} → ${money(fb)}`); });
  ids.forEach(id => { const r = routeById(id), na = a.fleet.flatMap(x => x.sched).filter(x => x === id).length, nb = b.fleet.flatMap(x => x.sched).filter(x => x === id).length;
    if(nb > na) out.push(`+ ${words[nb - na] || nb - na} ${r.city} service${nb - na === 1 ? '' : 's'}`); else if(nb < na) out.push(`− ${words[na - nb] || na - nb} ${r.city} service${na - nb === 1 ? '' : 's'}`); });
  a.fleet.forEach((x, j) => { const y = b.fleet[j]; if(!y) return; const da = actualDeps(a, j), db = actualDeps(b, j);
    ids.forEach(id => { const ta = x.sched.map((s, k) => s === id ? da[k] : null).filter(t => t !== null), tb = y.sched.map((s, k) => s === id ? db[k] : null).filter(t => t !== null);
      if(ta.length === tb.length) ta.forEach((t, q) => { if(t !== tb[q]) out.push(`${routeById(id).city} ${fmtTime(t)} → ${fmtTime(tb[q])}`); }); }); });
  if((a.onboard || 'none') !== (b.onboard || 'none')) out.push(`On board: ${ONBOARD[a.onboard || 'none'].label} → ${ONBOARD[b.onboard || 'none'].label}`);
  return out;
}
function compareHtml(pl, L, test, Lt){
  const fmt = (u, x) => u === '£' ? money(Math.round(x)) : num(Math.round(x));
  const rows = [['Passengers', L.pax, Lt.pax, 'n', 'up'], ['Empty seats', L.empty, Lt.empty, 'n', 'down'], ['Turned away', L.nos, Lt.nos, 'n', 'down'], ['Ticket revenue', L.v.rev - L.v.snack, Lt.v.rev - Lt.v.snack, '£', 'up']]
    .concat(snacksOn() ? [['Cabin sales', L.v.snack, Lt.v.snack, '£', 'up']] : []).concat([['Total costs', L.v.cost, Lt.v.cost, '£', 'down'], ['Projected profit', L.v.profit, Lt.v.profit, '£', 'up', 'pr']]);
  const same = planKey(pl) === planKey(test), causes = planDiff(pl, test);
  return `<section class="pnl cmp2"><div class="pnl-h"><h3>Compare plan impacts</h3><span class="muted">What changed because of your idea?</span></div>
    <div class="cmp2-cause pale"><span class="kl">Changed</span>${causes.length ? causes.map(c => `<span>${esc(c)}</span>`).join('') : '<span class="muted">Nothing yet: change the test plan above.</span>'}</div>
    <table class="cmp2-t"><thead><tr><th>Your current plan</th><th class="chg">Change</th><th>Test plan</th></tr></thead><tbody>${rows.map(([label, a, b, u, good, cls]) => { const d = Math.round(b) - Math.round(a), col = d === 0 ? '' : ((d > 0) === (good === 'up')) ? 'good' : 'bad';
      return `<tr class="${cls || ''}"><th><span>${label}</span><b class="mono">${fmt(u, a)}</b></th><td class="chg ${col}">${d ? (d > 0 ? '+' : '−') + fmt(u, Math.abs(d)) : '—'}</td><td><b class="mono">${fmt(u, b)}</b></td></tr>`; }).join('')}</tbody></table>
    <p class="small muted">Colour follows the measure: more passengers, revenue and profit are good; more empty seats, people turned away and costs are bad.</p>
    <div class="cmp2-act"><button class="btn primary big" data-ftest ${same ? 'disabled' : ''}>Use test plan</button><button class="btn big" data-treset ${same ? 'disabled' : ''}>Reset</button><button class="btn big" id="ideaShut">Close</button></div></section>`;
}

/* ---------- the planner page (the plan step) and the same page with the sums open (the workings step) ---------- */
R.plan = st => { if(!wkPlanner() || !dayLike()) return planW0(st); renderPlanner(st, false); };
R.workings = st => { if(!wkPlanner() || !dayLike()) return workW0(st); renderPlanner(st, true); };
function renderPlanner(st, summing){
  const setup = S.phase === 'setup', pl = currentPlan(); if(setup) S.market = launchMarket(pl);
  const L = planLines(pl), test = !summing && UI.ideaOpen ? testPlan() : null, Lt = test ? planLines(test) : null, costed = !!(S.rnd.costed && S.rnd.costed.key === planKey(pl));
  let W = null; try{ W = workTables(pl); }catch(e){ W = null; }
  const hid = hiddenFigs(pl, W), picks = S.rnd.picks || {}, hasSnackStage = !!(W && W.tables.some(t => t.stage === 'snack')), hasFareStage = !!(W && W.tables.some(t => t.stage === 'fare'));
  const pickNow = summing && W && W.multi && !W.picked && !wkNext(W.tables) && !(UI.justDone && W.tables.find(x => x.id === UI.justDone.table)) ? { kind:W.pickKind, opts:W.opts } : null;
  const lockFare = setup && hasFareStage && !picks.fare ? S.market : null, lockOb = setup && hasSnackStage && !picks.snack;
  const i = test ? 9 : 0, P = test || pl, LL = test ? Lt : L, locked = summing, sched = pl.fleet.flatMap(x => x.sched);
  const shownRoutes = (() => { const all = plannerOrder(), inPlan = all.filter(id => P.fleet.some(x => x.sched.includes(id))); return all.length <= 2 ? all : inPlan.concat(all.filter(id => !inPlan.includes(id))).slice(0, Math.max(2, inPlan.length)); })();
  const markets = `<div class="plw-mk n${Math.min(3, shownRoutes.length)} ${locked ? 'compact' : ''}">${shownRoutes.map(id => marketWidget(i, id, P, LL, { lockFare: test ? null : lockFare, pick: pickNow && pickNow.kind === 'fare' ? pickNow.opts : null, locked })).join('')}</div>${locked ? '' : otherRoutesRow(i, P, shownRoutes)}`;
  const strip = locked ? `<div class="plw-strip pale"><span><small>On board</small><b>${esc(ONBOARD[pl.onboard || 'none'] ? ONBOARD[pl.onboard || 'none'].label : 'Nothing on board')}</b></span><span><small>Fuel a day</small><b>${num(L.fuelL || 0)} L</b></span><span><small>Price a litre</small><b>${priceL(weekFuelPrice(S.day || 1))}</b></span><span><small>Aircraft a day</small><b>${money(pl.fleet.reduce((t, x) => { const f = S.fleet.find(z => z.uid === x.uid); return t + (f ? dayCostOf(f) : 0); }, 0))}</b></span></div>` : '';
  const head = test ? `<div class="plw-idea pale"><span class="kl">Test an idea</span><b>Change the test plan below. The model costs it straight away: no sums.</b><span class="muted small">Your current plan is kept until you press Use test plan.</span></div>` : '';
  const tools = !test && !locked ? `<span class="plw-tools">${!setup || costed ? '<button class="btn small" id="ideaOpen" title="A test plan the model costs: no sums">Test an idea</button>' : ''}<button class="btn small" id="mapOpen" title="The network map: where the routes go">Network map &rsaquo;</button></span>` : '';
  const main = `<div class="plw ${locked ? 'locked' : ''} ${test ? 'testing' : ''}">${head}${markets}
    ${test ? compareHtml(pl, L, test, Lt) : ''}
    <section class="pnl pale plw-tl"><div class="pnl-h"><h3>Aircraft day and timetable</h3><span class="muted tl-hint">${locked ? `${WORLD.dayStart}–${WORLD.dayEnd} · each block is one service` : 'press a block to move, swap or remove it'}</span>${tools}</div>${timelineHtml(i, P, LL, { locked })}</section>
    ${locked ? (pickNow && pickNow.kind === 'snack' ? onboardTiles(i, P, { pick: pickNow.opts, locked }) : strip) : onboardTiles(i, P, { lock: test ? false : lockOb, locked }) + fuelWidgetHtml(P, LL, { hidden: test ? new Set() : hid, test:!!test })}</div>`;
  // the action bar
  let foot;
  if(summing){ const allDone = W && !wkNext(W.tables) && (!W.multi || !!W.picked) && !(UI.justDone && W.tables.find(x => x.id === UI.justDone.table)), none = W && !wkCells(W.tables).length;
    if(none){ finishSums(); return; }
    foot = allDone ? '<button class="btn primary big" id="nx">Ready to fly &#9654;</button>' : '<button class="btn primary big" disabled>Work out the figures on the right &#9654;</button>'; }
  else foot = `<button class="btn primary big" id="nx" ${sched.length && L.fits ? '' : 'disabled'}>${!sched.length ? 'Add some services' : !L.fits ? "Doesn't fit in the day" : costed ? goLabel('Ready to fly') : goLabel('Cost your plan')} &#9654;</button>`;
  screen().innerHTML = taskFrame({ question: setup ? 'Build your first operating plan' : S.fleet.length > 1 ? 'What will your airline do this week?' : 'What will your airline do this week?', work:false,
    story:[],
    help:['timing', 'demand', 'fuel'], context: ctxPlanImpact(pl, L, { hidden:hid, flash:true }), todo:'', sum: summing ? { W, st } : null,
    say: setup ? 'Build your first operating plan. Add services to the timetable, choose the fares, then cost your plan.' : 'Plan the week: the timetable, the fares and what happens on board, then cost your plan.',
    main, foot });
  bindPlanEditor(); bindTimeline();
  screen().querySelectorAll('[data-sum]').forEach(b => b.onclick = () => openSum(b.getAttribute('data-sum')));
  on('ideaOpen', () => { UI.ideaOpen = true; UI.tlSel = null; render(); }); on('ideaShut', () => { UI.ideaOpen = false; UI.tlSel = null; render(); });
  on('mapOpen', () => { UI.view = 'network'; render(); });
  screen().querySelectorAll('[data-treset]').forEach(b => b.onclick = () => { S.rnd.test = null; UI.tlSel = null; render(); });
  screen().querySelectorAll('[data-ftest]').forEach(b => b.onclick = () => { const t = testPlan(); if(planKey(t) !== planKey(currentPlan())) applyPlan(t); S.rnd.test = null; UI.ideaOpen = false; UI.tlSel = null; render(); });
  if(summing){ bindSumDock(W, st); on('nx', finishSums); }
  else on('nx', () => { S.rnd.focusRoute = schedOf(fleetOne())[0] || S.market; UI.ideaOpen = false; UI.tlSel = null; resetEntry(); UI.justDone = null; advance(); });
}
function finishSums(){
  const Lp = planLines(currentPlan()), W = workTables(currentPlan());
  S.rnd.costed = { label:planLabel(currentPlan()), key:planKey(currentPlan()), v:Object.assign({}, Lp.v) }; S.rnd.costedTools = newIdeas(W.tables);
  if(typeof recordHandSums === 'function' && S.rnd.handSums) recordHandSums(Lp);
  S.rnd.myForecast = forecastOf(Lp, 'Your plan', currentPlan()); S.rnd.archive = { costed:{ label:S.rnd.costed.label, profit:Lp.v.profit }, ideas:[], flown:{ name:'Your plan', label:S.rnd.costed.label, profit:Lp.v.profit } }; S.rnd.test = null;
  resetEntry(); UI.justDone = null; delete S.rnd.sumWanted; advance();
}

/* ---------- the Maths Dock: the sums one at a time beside the plan ---------- */
function dockHtml(o){ if(o && o.sum) return sumDockHtml(o.sum); return dockHtmlBase(o); }
function sumState(W, st){
  const { tables, opts, multi, picked } = W, H = S.rnd.handSums || {}, setup = S.phase === 'setup', cells = wkCells(tables);
  const tut = !!(H.fuelCost && !skills().fuelCost && !st.tut && (!W.stage || W.stage.id === 'fuel'));
  let nx = wkNext(tables);
  if(nx && S.rnd.sumWanted){ const want = S.rnd.sumWanted, cur = setup && W.stage ? tables.find(t => t.stage === W.stage.id) : nx.t;   // ƒ from a figure: that figure first, within the sums now open
    if(cur){ const rows = tRows(cur); for(let ri = 0; ri < rows.length && want; ri++) for(const c of cur.cols) if(SUM_OF_ROW(rows[ri].id) === want && cellState(cur, c, ri) === 'enter'){ nx = { t:cur, cell:{ col:c.id, row:rows[ri].id } }; break; } }
    delete S.rnd.sumWanted; if(nx) nx.t.active = nx.cell; }
  if(nx){ nx.t.active = nx.t.active && cellState(nx.t, nx.t.cols.find(c => c.id === nx.t.active.col), tRows(nx.t).findIndex(r => r.id === nx.t.active.row)) === 'enter' ? nx.t.active : nx.cell; S.rnd.activeTable = nx.t.id; }
  tables.forEach(x => { if(x !== (nx && nx.t)) x.active = null; });
  const act = nx ? nx.t : null, col = act && act.cols.find(c => c.id === act.active.col), row = act && tRows(act).find(r => r.id === act.active.row);
  const justDone = UI.justDone && tables.find(x => x.id === UI.justDone.table) || null;
  const needPick = multi && !picked && !wkNext(tables) && !justDone, allDone = !wkNext(tables) && (!multi || !!picked) && !justDone;
  const n = W.total || (cells.length + (setup && !picked ? 1 : 0)), k = Math.min(n, cells.filter(x => x.s === 'done').length + 1), pickFare = W.pickKind ? W.pickKind === 'fare' : setup;
  return { tables, opts, multi, picked, cells, tut, act, col, row, justDone, needPick, allDone, n, k, pickFare, setup };
}
function sumAnswerLine(act, col, row){ const unit = row.unit === '£' ? '£' : '';
  return `<div class="sd-ans"><span class="answer"><span class="unit">${unit}</span><input id="cellAns" class="mono" inputmode="decimal" autocomplete="off" value="${esc(UI.entry)}" aria-label="${esc(rowLabel(act, row))}"></span><button class="btn primary" id="cellCheck">Check &#10003;</button></div><div class="msg wk-msg ${UI.ok ? 'ok' : ''}" id="ftMsg" role="status">${esc(UI.msg || '')}</div>`; }
function sumFormulaHtml(act, col, row){
  const ops = stackRows(act, col, row), A = ops[0], B = ops[1], op = (B && B.op) || row.op || '×', ua = operandUnit(act, A.id), ub = operandUnit(act, B.id), a = operandValue(act, col, A.id), b = operandValue(act, col, B.id);
  const method = wkMethod(a, b, op, ua, ub, row.unit), lines = method.map((m, q) => q === method.length - 1 ? m.replace(/=\s*[^=]*$/, '= ?') : m);
  return `<div class="sd-fx"><p class="sd-q">${esc(rowLabel(act, row))} = ${esc(A.label)} ${esc(op)} ${esc(B.label)}</p><p class="sd-big mono">${A.value} ${esc(op)} ${B.value} = ?</p>
    <span class="kl">How the model works it out</span><ol class="sd-steps">${lines.map(l => `<li class="mono">${esc(l)}</li>`).join('')}</ol><p class="small muted">The last line is yours. Type the answer below.</p>${sumAnswerLine(act, col, row)}</div>`;
}
function sumDockHtml(o){
  const { W, st } = o, Z = sumState(W, st), { act, col, row, tables, opts } = Z, mode = Z.act && !Z.justDone && !Z.tut ? (UI.sumMode || 'grid') : 'grid';
  const title = Z.tut ? 'A worked example' : Z.justDone ? 'Figure done' : Z.act ? (TOOL[row.tool] ? TOOL[row.tool].name : rowLabel(act, row)) : Z.needPick ? (Z.pickFare ? 'Choose the fare' : 'Choose what happens on board') : 'Your workings today';
  const tabs = Z.act && !Z.justDone && !Z.tut ? `<div class="sd-tabs" role="tablist">${[['grid', 'Structured working'], ['pad', 'Squared paper'], ['fx', 'Formula']].map(([m, l]) => `<button role="tab" class="${mode === m ? 'on' : ''}" data-summode="${m}" aria-selected="${mode === m}">${l}</button>`).join('')}</div>` : '';
  let body = '';
  if(Z.tut) body = wkTutorial(st);
  else if(Z.justDone){ const jt = Z.justDone, [cid, rid] = UI.justDone.cell.split('|'), jc = jt.cols.find(c => c.id === cid), jr = tRows(jt).find(r => r.id === rid);
    body = `<div class="wk-sum"><div class="wk-head"><span class="kl">${esc(jc.label)}</span><h2>&#10003; ${esc(rowLabel(jt, jr))}: ${fmtVal(jr.unit, jc.values[rid])}</h2></div>${wkGrid(jt, jc, jr, { done:true, show:true })}
      <p class="sd-written">${wkNext(tables) || Z.multi && !Z.picked ? 'Written into Plan Impact.' : 'Written into Plan Impact. That is every figure for today.'}</p><div class="wk-act"><button class="btn primary big" id="wkNext">${wkNext(tables) ? 'Next sum' : Z.multi && !Z.picked ? 'Choose' : 'Finished'} &#9654;</button></div></div>`; }
  else if(Z.act){ const q = TOOL[row.tool] ? TOOL[row.tool].name : rowLabel(act, row), rl = rowLabel(act, row), head = q.toLowerCase() === rl.toLowerCase() ? q : `${q}: ${rl.toLowerCase()}`;
    const kick = `<div class="wk-head"><span class="kl">${esc(col.label)}${col.sub ? ' · ' + esc(col.sub) : ''}</span><h2>${esc(head)}</h2></div>`;
    if(mode === 'pad') body = `<div class="wk-sum">${kick}<div class="wo-pad">${workPadHtml(act)}</div>${sumAnswerLine(act, col, row)}</div>`;
    else if(mode === 'fx') body = `<div class="wk-sum">${kick}${sumFormulaHtml(act, col, row)}</div>`;
    else body = `<div class="wk-sum">${kick}${wkGrid(act, col, row, {})}
      <div class="wk-act"><button class="btn primary big" id="cellCheck">Check &#10003;</button><button class="btn" id="wkPad" aria-pressed="${!!st.pad}">${st.pad ? 'Hide the number pad' : 'Number pad'}</button>${(UI.tries || 0) >= 3 ? '<button class="link" id="calcShow">Show me</button>' : ''}</div>
      <div class="msg wk-msg ${UI.ok ? 'ok' : ''}" id="ftMsg" role="status">${esc(UI.msg || '')}</div>
      ${st.pad ? `<div class="wk-pad">${['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '−'].map(x => `<button data-k="${x === '−' ? '-' : x}">${x}</button>`).join('')}<button data-k="back">&#9003;</button></div>` : ''}</div>`; }
  else if(Z.needPick){ body = `<div class="wk-pick"><span class="kl">${Z.pickFare ? 'Choose the fare to fly at' : 'Choose what happens on board'}</span><p class="small muted">${Z.pickFare ? 'Press a fare here, or its chip on the market.' : 'Press an option here, or its tile on the plan.'}</p>
      <div class="wk-opts">${opts.map((o2, q) => { const v = W.lines[q].v; return `<button class="wk-opt" data-wpick="${o2.id}"><b>${esc(o2.word)}</b><span>${Z.pickFare ? `${v['pax_' + S.market] !== undefined ? v['pax_' + S.market] : v.pax1} passengers · tickets ${money(v['tk_' + S.market] !== undefined ? v['tk_' + S.market] : v.tk1)}` : `cabin sales ${money(v.snack)} · profit ${money(v.profit)}`}</span></button>`; }).join('')}</div>
      ${!Z.pickFare && !S.rnd.thirdSnack && Object.keys(ONBOARD).some(k => ONBOARD[k].free) ? '<button class="link" id="woThird">Compare free snacks too</button>' : ''}</div>`; }
  else { const done = Z.cells.filter(x => x.s === 'done'), pN = practiceN(), pkey = practiceKeyToday(), pr = pN && pkey && !st.noPractice ? practiceHtml(st, pkey, pN, true) : '';
    body = `<div class="wk-sum wk-summary"><div class="wk-head"><span class="kl">${esc(Z.setup ? 'Launch day' : dateShort(S.day))}</span><h2>Your workings today</h2></div>
      <table class="wk-list">${done.map(x => `<tr><th>${esc(x.c.label)} · ${esc(rowLabel(x.t, x.r))}</th><td class="mono">${wkSentence(x.t, x.c, x.r)}</td></tr>`).join('')}
      <tr class="tot"><th>${esc(planLabel(currentPlan()))}</th><td class="mono">profit ${money(planLines(currentPlan()).v.profit)}</td></tr></table>
      <p class="sd-written">Every figure is in Plan Impact. Press Ready to fly when the plan is right.</p>
      ${pr ? `<div class="wk-practice"><span class="kl">Practice (optional): ${pN === 1 ? 'one question' : pN + ' questions'} with your own numbers</span>${pr}<button class="link" id="wkSkipP">Skip practice</button></div>` : ''}</div>`; }
  return `<aside class="dock dock-sum pale" data-dock="sum" aria-label="Work it out"><div class="dk-h"><span class="dk-tt"><span class="dk-kind">Work it out</span><b class="dk-t">${esc(title)}</b></span><span class="sd-prog">${Z.allDone ? 'All done' : Z.tut ? 'Worked example' : `Sum ${Z.k} of ${Z.n}`}</span></div>${tabs}<div class="dk-b">${body}</div></aside>`;
}
function bindSumDock(W, st){
  const Z = sumState(W, st);
  if(Z.act && !Z.justDone && !Z.tut) bindTable(Z.act);
  on('wkTutNext', () => { st.tutStep = (st.tutStep || 0) + 1; render(); }); on('wkTutGo', () => { st.tut = true; render(); });
  on('wkNext', () => { UI.justDone = null; resetEntry(); render(); });
  on('wkPad', () => { st.pad = !st.pad; render(); });
  on('calcShow', () => { const t = Z.act; if(t && t.active){ const a = t.active, c = t.cols.find(x => x.id === a.col); diagNote({ kind:'answer shown to pupil', table:t.id, cell:cellId(a.col, a.row), stored:c ? c.values[a.row] : null, typed:UI.entry, tries:UI.tries }); cellCorrect(t, true); } render(); });
  on('woThird', () => { S.rnd.thirdSnack = true; render(); });
  screen().querySelectorAll('[data-summode]').forEach(b => b.onclick = () => { UI.sumMode = b.getAttribute('data-summode'); render(); });
  screen().querySelectorAll('[data-wpick]').forEach(b => b.onclick = () => { const o = Z.opts.find(x => x.id === b.getAttribute('data-wpick')); if(o) applyPick(o); });
  if(Z.allDone && practiceN() && practiceKeyToday() && !st.noPractice) bindPractice(st, practiceKeyToday(), () => {}, practiceN(), true);
  on('wkSkipP', () => { st.noPractice = true; render(); });
}
