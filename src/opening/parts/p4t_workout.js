/* ==================================================================
   WORK IT OUT (week-1 review, 8 Oct 2026): one page for a day's plan, its sums and the choice.
   The plan sits on the left (services, fares, snacks: the planner), the day's figures on the right as a sheet with one
   column per option (launch day: three fares; snacks day: the snack options; otherwise the plan), the sum being worked
   out inline under the sheet with squared paper to work on, and the choice buttons under that. Test (the model's
   comparison) is the next screen. It replaces timetable → fare → cost on launch day and plan → cost on the days;
   weeks and months keep the planner and the cost sheet.
   ================================================================== */
WS_STEPS.push('workout'); SHELL_STEPS.push('workout');
Object.assign(RAIL_LABEL, { workout:'Work it out' });
Object.assign(SUB_DESC, { workout:'The plan, the sums and the choice' });
Object.assign(STEP_HINT, { workout:'Build the plan on the left. Work out each figure on the right (squared paper if you want it). Then choose.' });
Object.assign(STEP_TODO, { workout:'Press Complete figure, type the answer and press Enter. When every figure is done, press a Fly button.' });
STAGES.launch = [{ id:'air', name:'Airline ready', done:'Airline ready', sub:'Aircraft and first market', steps:['starter', 'market'] }, stg('plan', ['demand', 'rotation', 'workout']), stg('test'), stg('go', ['ready']), stg('review')];
STAGES.day = [stg('plan', ['intro', 'shop2', 'fleetSums', 'acquire', 'event', 'workout']), stg('test'), stg('go'), stg('review')];
STG.plan.sub = 'Plan the day and work it out';

/* the step lists (newState in p4a, the day loop in p4m and p4n) name 'workout' in place of timetable / fare / cost; weeks and months are untouched */
function workoutSteps(steps){
  const out = []; steps.forEach(s => { if(s.t === 'costPlan') return; if(s.t === 'planner') out.push({ t:'workout' }); else out.push(s); });
  // the day's event comes before the sums (a rival fare changes them)
  const ei = out.findIndex(s => s.t === 'event'), wi = out.findIndex(s => s.t === 'workout');
  if(ei > wi && wi >= 0){ const ev = out.splice(ei, 1)[0]; out.splice(wi, 0, ev); }
  return out;
}
/* an older save mid-day (called from syncRoutesToHome): its timetable / fare / cost / planner steps become one Work it out */
function migrateWorkout(){
  if(!S || !S.steps) return; const day = S.phase === 'setup' || (S.period && S.period.type === 'day');
  if(!day || !S.steps.some(s => ['timetable', 'fareTry', 'costPlan'].includes(s.t) || (s.t === 'planner' && S.phase === 'round'))) return;
  const cur = S.steps[S.si] ? S.steps[S.si].t : null, next = workoutSteps(S.steps.map(s => s.t === 'timetable' ? { t:'workout' } : s.t === 'fareTry' ? null : s).filter(Boolean));
  S.steps = next; const i = next.findIndex(s => s.t === (['timetable', 'fareTry', 'costPlan', 'planner'].includes(cur) ? 'workout' : cur)); S.si = i >= 0 ? i : Math.min(S.si, next.length - 1);
}
const costPlan0 = R.costPlan, planner0 = R.planner;
R.timetable = st => R.workout(st);
R.costPlan = st => PW().span === 'day' ? R.workout(st) : costPlan0(st);
R.planner = st => PW().span === 'day' && S.phase === 'round' ? R.workout(st) : planner0(st);

/* ---------- the columns: what is compared today ---------- */
function workoutOptions(pl){
  const r = routeById(S.market);
  if(S.phase === 'setup'){   // launch day: three fares around the normal fare, so the fare is chosen by working the tickets out
    const F = r.fares || [r.basePrice], b = Math.max(0, F.indexOf(r.basePrice)), lo = clamp(b - 1, 0, Math.max(0, F.length - 3)), fares = F.slice(lo, lo + 3);
    return fares.map(f => ({ id:'f' + f, label:money(f), sub:`${paxWant(r, f)} want to fly`, plan:Object.assign({}, pl, { prices:Object.assign({}, pl.prices, { [r.id]:f }) }), pick:{ fare:f }, word:`Fly at ${money(f)}` })); }
  if(snacksOn() && newTag(3.1)){   // snacks day: the options that sell, and free snacks as a third if he asks for it
    const sell = Object.keys(ONBOARD).filter(k => ONBOARD[k].price > 0), free = Object.keys(ONBOARD).filter(k => ONBOARD[k].free), keys = sell.concat(S.rnd.thirdSnack ? free : []);
    return keys.map(k => ({ id:'ob_' + k, label:ONBOARD[k].label.replace(/^Sell snacks at /, 'Snacks at '), sub:ONBOARD[k].sub, plan:Object.assign({}, pl, { onboard:k }), pick:{ onboard:k }, word:ONBOARD[k].free ? 'Give free snacks' : `Sell at ${money(ONBOARD[k].price)}` })); }
  return [{ id:'a', label:'Your plan', sub:planLabel(pl).split(' · ').slice(0, 2).join(' · '), plan:pl, pick:null, word:'Fly this plan' }];
}
function costPartsOf(v){ return [['Flights', money(v.run)]].concat(fuelPaid() ? [['Fuel', money(v.fuel)]] : []).concat([['Terminal charges', money(v.term)]]).concat(v.stock ? [['Snack stock', money(v.stock)]] : []).concat(v.crew ? [['Second crew', money(v.crew)]] : []).concat(v.event ? [[S.rnd.event ? S.rnd.event.title : 'Event', money(v.event)]] : []).concat([["Aircraft's day", money(v.day)]]); }
function workoutPicked(st, opts, pl){
  if(S.phase === 'setup') return st.pick && opts.some(o => o.id === st.pick) ? st.pick : null;
  if(opts.length > 1) return (opts.find(o => o.pick && o.pick.onboard === (pl.onboard || 'none')) || {}).id || null;
  return opts[0].id;
}
function applyPick(st, o){
  const f = fleetOne(); if(!f) return;
  if(o.pick && o.pick.fare !== undefined){ S.prices[S.market] = o.pick.fare; st.pick = o.id; }
  else if(o.pick && o.pick.onboard){ S.onboard = o.pick.onboard; st.pick = o.id; }
  refreshPlan(); resetEntry(); UI.justDone = null; render();
}

/* ---------- the screen ---------- */
R.workout = st => {
  const setup = S.phase === 'setup', pl = currentPlan(), L0 = planLines(pl), p = ourPlane(), r = routeById(S.market), f = fleetOne(), sched = f ? schedOf(f) : [];
  const opts = workoutOptions(pl), lines = opts.map(o => planLines(o.plan)), multi = opts.length > 1, picked = workoutPicked(st, opts, pl);
  const cols = opts.map((o, i) => ({ id:o.id, label:o.label, sub:o.sub, values:Object.assign({}, lines[i].v), parts:{ run:flightParts(o.plan), day:typeof dayParts === 'function' ? dayParts() : [], cost:costPartsOf(lines[i].v) } }));
  const rows = costRowsFor(L0); let rowIds = costRowIds(L0, pl);
  // launch day: the tickets at every fare first, then the fare is chosen, then the profit of the chosen fare by hand
  if(setup && !picked) rowIds = rowIds.filter(id => id !== 'profit');
  const tid = 'work:' + S.day, prev = S.rnd.tables[tid], t = ensureTable(tid, 'cost1', cols, { rows, rowIds, labels:costLabels() });
  if(setup && picked) cols.forEach(c => { if(c.id !== picked && !t.done[cellId(c.id, 'profit')] && rowTyped(t, tRows(t).find(x => x.id === 'profit') || {})) t.done[cellId(c.id, 'profit')] = true; });
  if(t !== prev && prev) t.active = null;
  if(t.active && t.done[cellId(t.active.col, t.active.row)]) t.active = null;
  S.rnd.activeTable = t.id;
  const typed = typedIds(t), done = tableComplete(t) && (!multi || !!picked), fresh = newIdeas([t]);
  const left = (!typed.length ? 0 : cols.reduce((n, c) => n + typed.filter(id => { const ri = tRows(t).findIndex(x => x.id === id); return ri >= 0 && ['enter', 'wait'].includes(cellState(t, c, ri)); }).length, 0));
  // left: the plan
  const story = setup ? [`The airport is open ${WORLD.dayStart} to ${WORLD.dayEnd}. Each service fills more of the aircraft's day, and you don't have to carry everyone.`] : (!(S.round === 0 || roundData(S.round).prog !== roundData(S.round - 1).prog) ? [] : (PLAN_STORY[progress()] || []));
  const planPane = setup
    ? `<section class="pnl"><div class="pnl-h"><h3>Services to ${esc(r.city)}</h3><span class="muted">${capLine(wantOf(r.id), sched.length * p.seats)}</span></div>${serviceButtons(r.id, sched)}</section>
       <section class="pnl"><div class="pnl-h"><h3>Expected passengers per service</h3>${paxKey()}</div>${paxGroups(wantOf(r.id), p.seats, sched.length, { times:TIME.day(p, sched).trips.map(x => x.dep), small:true })}</section>`
    : `<section class="pnl"><div class="pnl-h"><h3>Your plan</h3><span class="muted">${esc(planLabel(pl))}</span></div>${planEditor(0, pl, L0, { big:true })}</section>
       ${depsOn() ? '' : `<section class="pnl"><div class="pnl-h"><h3>Expected passengers per service</h3>${paxKey()}</div>${plannerRoutes().filter(id => pl.sched.includes(id)).map(id => paxGroups(paxWant(routeById(id), fareOf(id)), p.seats, serviceCounts(pl.sched)[id] || 0, { small:true })).join('') || '<p class="muted">No services yet.</p>'}</section>`}`;
  // right: the sheet, the sum being worked out, the squared paper, the choice
  const spot = fresh.length ? `<div class="c2-new"><span class="label">${setup ? 'Work out' : 'Today'}</span>${fresh.map(id => `<b>${esc(NEW_TODAY[id] || TOOL[id].name)}</b>`).join('')}</div>` : '';
  const calc = t.active ? `<div class="wo-calc">${calcHtml(t)}</div>` : UI.justDone && UI.justDone.table === t.id ? `<div class="wo-calc">${calcDoneHtml(t)}</div>` : UI.dock && UI.dock.mode === 'fx' ? `<div class="wo-calc">${fxHtml()}<div class="calc-act"><button class="btn small" id="dkClose">Close</button></div></div>` : '';
  const pad = st.pad ? `<div class="wo-pad">${workPadHtml(t)}</div>` : '';
  const pickRow = multi ? `<div class="wo-pick"><span class="label">${setup ? (tableComplete(t) ? (picked ? 'Your fare' : 'Choose the fare to fly at') : 'Work out the tickets at each fare first') : (tableComplete(t) ? 'Choose what happens on board' : 'Work out each option first')}</span>
      <div class="wo-pick-b">${opts.map(o => `<button class="btn ${picked === o.id ? 'primary on' : ''}" data-wpick="${o.id}" ${tableComplete(t) || (setup && picked) ? '' : 'disabled'} aria-pressed="${picked === o.id}">${esc(o.word)}</button>`).join('')}${!setup && !S.rnd.thirdSnack && Object.keys(ONBOARD).some(k => ONBOARD[k].free) ? '<button class="btn small" id="woThird">+ Compare free snacks too</button>' : ''}</div></div>` : '';
  screen().innerHTML = taskFrame({ question: setup ? 'Build the day and work it out' : 'What will your airline do today?', work:false, wide:true, story, help:['timing', 'demand'],
    say: setup ? `Build the day and work it out. ${wantOf(r.id)} people want to fly to ${r.city}. Work out the tickets at each fare, then choose.` : `Plan what your airline will do today, then work out the new figures.`,
    main:`<div class="wo ${multi ? 'multi' : ''}"><div class="wo-left">${planPane}</div>
      <div class="wo-right"><section class="pnl wo-sheet"><div class="pnl-h"><h3>${setup ? 'Tickets at each fare' : multi ? 'The options' : "Today's figures"}</h3><span class="muted">${left ? `${plural(left, 'figure')} to complete` : done ? 'All done' : multi && !picked ? 'Choose below' : ''}</span>${typed.length ? `<button class="btn small ${st.pad ? 'on' : ''}" id="woPad" aria-pressed="${!!st.pad}">${st.pad ? 'Hide squared paper' : 'Squared paper'}</button>` : ''}</div>${spot}${multi && tableComplete(t) && !picked ? pickRow : ''}<div class="sheet1">${tableHtml(t)}</div>${calc}${pad}</section>${multi && tableComplete(t) && !picked ? '' : pickRow}</div></div>`,
    foot:`<button class="btn primary big" id="nx" ${done && sched.length && L0.fits ? '' : 'disabled'}>${!sched.length ? 'Choose some services' : !done ? (multi && tableComplete(t) && !picked ? 'Choose first' : 'Complete the figures first') : goLabel('Try other ideas')} &#9654;</button>` });
  if(setup) bindServices(); else bindPlanEditor();
  bindTable(t); bindPad();
  on('calcNext', () => { t.active = nextOpenCell(t); resetEntry(); UI.justDone = null; render(); });
  on('calcDone', () => { UI.justDone = null; render(); });
  on('dkClose', () => { UI.dock = { mode:null, topic:null }; render(); });
  on('calcShow', () => { if(t.active){ const a = t.active, c = t.cols.find(x => x.id === a.col); diagNote({ kind:'answer shown to pupil', table:t.id, cell:cellId(a.col, a.row), stored:c ? c.values[a.row] : null, typed:UI.entry, tries:UI.tries }); cellCorrect(t, true); } render(); });
  on('woPad', () => { st.pad = !st.pad; render(); });
  on('woThird', () => { S.rnd.thirdSnack = true; render(); });
  screen().querySelectorAll('[data-wpick]').forEach(b => b.onclick = () => { const o = opts.find(x => x.id === b.getAttribute('data-wpick')); if(o) applyPick(st, o); });
  if(UI.justDone){ const c = screen().querySelector(`td[data-cellv="${UI.justDone.cell}"]`); if(c) c.classList.add('flash'); }
  const sum = screen().querySelector('.wo-calc'); if(sum) try{ sum.scrollIntoView({ block:'nearest' }); }catch(e){}
  on('nx', () => { const Lp = planLines(currentPlan()); S.rnd.costed = { label:planLabel(currentPlan()), key:planKey(currentPlan()), v:Object.assign({}, Lp.v) }; S.rnd.costedTools = fresh; if(typeof recordHandSums === 'function' && S.rnd.handSums) recordHandSums(Lp);
    S.rnd.focusRoute = schedOf(fleetOne())[0]; S.rnd.test = null; resetEntry(); UI.justDone = null; advance(); });
};
