/* ==================================================================
   PLAN THE DAY and WORK IT OUT (Fable's design note, 8 Oct 2026, after Bertie's week-1 review).
   Planning and calculating are two screens. The planning page is the HQ page: the timetable (services, or the planner
   from day 2), the fare chips with the people at each fare, the expected passengers, and the modelling tool ("Try an idea":
   a test plan the model costs). "Cost your plan" opens the WORKINGS page: full screen on squared paper, one sum at a
   time in the formal written method (operands in columns, a carry row, working rows, the answer typed), check then
   next; the launch day's fare and the snack day's option are chosen there once the sums are done; then a summary and
   "Back to HQ". The daily budget (decideHandSums, p4m): one spotlight sum, at most two plan sums, never more than three
   multiplications. Practice questions are a teacher setting (practiceQuestionsPerDay, default 0) and follow the summary.
   Weeks and months keep the planner, the cost sheet and the Test screen.
   ================================================================== */
WS_STEPS.push('plan'); SHELL_STEPS.push('plan', 'workings');
Object.assign(RAIL_LABEL, { plan:'Plan the day', workings:'Work it out', workout:'Plan the day' });
Object.assign(SUB_DESC, { plan:'Timetable, fares and extras', workings:"Today's sums on paper" });
Object.assign(STEP_HINT, { plan:'Build the plan, try an idea with the model if you like, then press Cost your plan.', workings:'' });
Object.assign(STEP_TODO, { plan:'Set the services and the extras. Press Cost your plan when the plan is ready.' });
STAGES.launch = [{ id:'air', name:'Airline ready', done:'Airline ready', sub:'Aircraft and first market', steps:['starter', 'market'] }, stg('plan', ['demand', 'rotation', 'plan']), stg('cost', ['workings']), stg('go', ['ready']), stg('review')];
STAGES.day = [stg('plan', ['intro', 'shop2', 'fleetSums', 'acquire', 'event', 'plan']), stg('cost', ['workings']), stg('go'), stg('review')];
STG.plan.sub = 'What will your airline do?'; STG.cost.sub = "Work out today's figures"; STG.cost.name = 'Work it out';
const dayPeriod = () => S.phase === 'setup' || !!(S.period && S.period.type === 'day');
/* the step lists (newState in p4a, the day loop in p4m and p4n) name 'plan' and 'workings'; older saves are migrated */
function workoutSteps(steps){
  const out = []; steps.forEach(s => { if(['costPlan', 'fareTry', 'testIdeas', 'workings'].includes(s.t)) return; if(['planner', 'timetable', 'workout'].includes(s.t)) out.push({ t:'plan' }); else out.push(s); });
  const ei = out.findIndex(s => s.t === 'event'), pi = out.findIndex(s => s.t === 'plan');
  if(ei > pi && pi >= 0){ const ev = out.splice(ei, 1)[0]; out.splice(pi, 0, ev); }   // the day's decision comes before the plan (a rival fare changes it)
  const pj = out.findIndex(s => s.t === 'plan'); if(pj >= 0) out.splice(pj + 1, 0, { t:'workings' });
  return out;
}
function migrateWorkout(){
  if(!S || !S.steps || !dayPeriod()) return;
  if(!S.steps.some(s => ['timetable', 'fareTry', 'costPlan', 'workout', 'testIdeas'].includes(s.t) || (s.t === 'planner' && S.phase === 'round'))) return;
  const cur = S.steps[S.si] ? S.steps[S.si].t : null, next = workoutSteps(S.steps), to = ['timetable', 'fareTry', 'planner', 'workout', 'testIdeas'].includes(cur) ? 'plan' : cur === 'costPlan' ? 'workings' : cur;
  S.steps = next; const i = next.findIndex(s => s.t === to); S.si = i >= 0 ? i : Math.min(S.si, next.length - 1);
}
const costPlan0 = R.costPlan, planner0 = R.planner, testIdeas0 = R.testIdeas;
R.timetable = st => R.plan(st); R.workout = st => R.plan(st);
R.planner = st => dayPeriod() && S.phase === 'round' ? R.plan(st) : planner0(st);
R.costPlan = st => dayPeriod() ? R.workings(st) : costPlan0(st);
R.testIdeas = st => dayPeriod() ? R.plan(st) : testIdeas0(st);
function practiceN(){ const v = settings.practiceQuestionsPerDay; return v === undefined || v === null || v === '' ? +((WORLD.settings || {}).practiceQuestionsPerDay || 0) : +v; }

/* ---------- the options worked out side by side: the three fares on launch day, the snack options on day 2, else the plan ---------- */
function workoutOptions(pl){
  const r = routeById(S.market);
  if(S.phase === 'setup'){ const F = r.fares || [r.basePrice], b = Math.max(0, F.indexOf(r.basePrice)), lo = clamp(b - 1, 0, Math.max(0, F.length - 3)), fares = F.slice(lo, lo + 3);
    return fares.map(f => ({ id:'f' + f, label:money(f), sub:`${paxWant(r, f)} want to fly`, plan:Object.assign({}, pl, { prices:Object.assign({}, pl.prices, { [r.id]:f }) }), pick:{ fare:f }, word:`Fly at ${money(f)}` })); }
  if(snacksOn() && newTag(3.1)){ const sell = Object.keys(ONBOARD).filter(k => ONBOARD[k].price > 0), free = Object.keys(ONBOARD).filter(k => ONBOARD[k].free), keys = sell.concat(S.rnd.thirdSnack ? free : []);
    return keys.map(k => ({ id:'ob_' + k, label:ONBOARD[k].label.replace(/^Sell snacks at /, 'Snacks at '), sub:ONBOARD[k].sub, plan:Object.assign({}, pl, { onboard:k }), pick:{ onboard:k }, word:ONBOARD[k].free ? 'Give free snacks' : `Sell at ${money(ONBOARD[k].price)}` })); }
  return [{ id:'a', label:'Your plan', sub:planLabel(pl).split(' · ').slice(0, 2).join(' · '), plan:pl, pick:null, word:'Fly this plan' }];
}
function costPartsOf(v){ return [['Flights', money(v.run)]].concat(fuelPaid() ? [['Fuel', money(v.fuel)]] : []).concat([['Terminal charges', money(v.term)]]).concat(v.stock ? [['Snack stock', money(v.stock)]] : []).concat(v.crew ? [['Second crew', money(v.crew)]] : []).concat(v.event ? [[S.rnd.event ? S.rnd.event.title : 'Event', money(v.event)]] : []).concat([["Aircraft's day", money(v.day)]]); }
/* with several options the choice is made on the workings page once their sums are done (the fare on launch day, the snacks on day 2) */
function workoutPicked(opts, pl){ if(opts.length > 1) return S.rnd.pick && opts.some(o => o.id === S.rnd.pick) ? S.rnd.pick : null; return opts[0].id; }
function applyPick(o){ if(o.pick && o.pick.fare !== undefined){ S.prices[S.market] = o.pick.fare; S.rnd.pick = o.id; } else if(o.pick && o.pick.onboard){ S.onboard = o.pick.onboard; S.rnd.pick = o.id; } refreshPlan(); resetEntry(); UI.justDone = null; render(); }
/* the day's tables: the cost sheet with a column per option, plus the tenths sum when the rules ask for it */
function workTables(pl){
  const L0 = planLines(pl), opts = workoutOptions(pl), lines = opts.map(o => planLines(o.plan)), picked = workoutPicked(opts, pl);
  const cols = opts.map((o, i) => ({ id:o.id, label:o.label, sub:o.sub, values:Object.assign({}, lines[i].v), parts:{ run:flightParts(o.plan), day:typeof dayParts === 'function' ? dayParts() : [], cost:costPartsOf(lines[i].v) } }));
  const rows = costRowsFor(L0); let rowIds = costRowIds(L0, pl); const H = S.rnd.handSums || {};
  const multi = opts.length > 1; if(multi && !picked) rowIds = rowIds.filter(id => id !== 'profit');   // the option first, then its profit
  const t = ensureTable('work:' + S.day, 'cost1', cols, { rows, rowIds, labels:costLabels() });
  if(multi && picked) cols.forEach(c => { if(c.id !== picked && rowTyped(t, tRows(t).find(x => x.id === 'profit') || {})){ const k = cellId(c.id, 'profit'); if(!t.done[k]){ t.done[k] = true; (S.rnd.autoDone = S.rnd.autoDone || []).push(t.id + '|' + k); } } });
  const tables = [t];
  if(H.rivalStay){ const rid = H.rivalStay.route, r = routeById(rid), fare = fareOf(rid), people = roundSchool(demandAt(r, fare) * repFactor()), share = stayShare(r, fare);
    tables.push(ensureTable('tenths:' + S.day + ':rival', 'tenths1', [{ id:'a', label:`${r.city} at ${money(fare)}`, sub:`${WORLD.rival} at ${money(competitorPrice(r))}: ${inTenths(share)} stay`, values:{ people, share, stay:paxFor(r, fare) } }], { labels:{ people:`${r.city} passengers at ${money(fare)}`, share:'Share who stay with you', stay:'Stay with you' } })); }
  if(H.weekendDemand){ const rid = H.weekendDemand.route, r = routeById(rid), fare = fareOf(rid), ST = WORLD.settings || {}, bs = r.arch && r.arch.businessShare !== undefined ? r.arch.businessShare : 0.5, m = ST.weekendBusinessMultSat || 0.7;
    const weekday = withDay(Math.max(1, S.day - 1), () => demandAt(r, fare)), people = roundSchool(weekday * bs);
    tables.push(ensureTable('tenths:' + S.day + ':weekend', 'tenths2', [{ id:'a', label:`${r.city} business travellers`, sub:`${Math.round(m * 10)} in 10 fly on a Saturday`, values:{ people, share:m, stay:roundSchool(people * m) } }], { labels:{ people:`${r.city} business travellers on a weekday`, share:'Tenths who fly today', stay:'Business travellers today' } })); }
  return { L0, opts, lines, picked, t, tables, multi };
}
TABLES.tenths2 = Object.assign({}, TABLES.tenths1, { rows: TABLES.tenths1.rows.map(r => r.id === 'stay' ? Object.assign({}, r, { tool:'weekendDemand' }) : r) });

/* ==================================================================
   THE PLANNING PAGE
   ================================================================== */
R.plan = st => {
  const setup = S.phase === 'setup', pl = currentPlan(), L = planLines(pl), p = ourPlane(), r = routeById(S.market), f = fleetOne(), sched = f ? schedOf(f) : [];
  const costed = !!(S.rnd.costed && S.rnd.costed.key === planKey(pl)), picked = setup && !!S.rnd.pick;
  const story = setup ? [`The airport is open ${WORLD.dayStart} to ${WORLD.dayEnd}. Each service fills more of the aircraft's day, and you don't have to carry everyone.`] : (!(S.round === 0 || roundData(S.round).prog !== roundData(S.round - 1).prog) ? [] : (PLAN_STORY[progress()] || []));
  const ideaBtn = (!setup || costed) && !UI.ideaOpen ? '<button class="btn small" id="ideaOpen" title="A test plan the model costs: no sums">Try an idea</button>' : '';
  const chips = setup ? `<div class="pl-fares"><span class="label">Fare</span>${(r.fares || [r.basePrice]).map(x => `<span class="fchip ${picked && x === fareOf(r.id) ? 'on' : ''}"><b class="mono">${money(x)}</b><small>${paxWant(r, x)} want to fly</small></span>`).join('')}<span class="muted small">${picked ? `You chose ${money(fareOf(r.id))}.` : 'The fare is chosen once the tickets are worked out.'}</span></div>` : '';
  const planPane = setup
    ? `<section class="pnl"><div class="pnl-h"><h3>Services to ${esc(r.city)}</h3><span class="muted">${capLine(wantOf(r.id), sched.length * p.seats)}</span></div>${serviceButtons(r.id, sched)}${chips}</section>
       <section class="pnl"><div class="pnl-h"><h3>Expected passengers per service</h3>${paxKey()}${ideaBtn}</div>${paxGroups(wantOf(r.id), p.seats, sched.length, { times:TIME.day(p, sched).trips.map(x => x.dep), small:true })}</section>`
    : `<section class="pnl"><div class="pnl-h"><h3>Your plan</h3><span class="muted">${esc(planLabel(pl))}</span>${ideaBtn}</div>${planEditor(0, pl, L, { big:true })}</section>
       ${depsOn() ? '' : `<section class="pnl"><div class="pnl-h"><h3>Expected passengers per service</h3>${paxKey()}</div>${plannerRoutes().filter(id => pl.sched.includes(id)).map(id => paxGroups(paxWant(routeById(id), fareOf(id)), p.seats, serviceCounts(pl.sched)[id] || 0, { small:true })).join('') || '<p class="muted">No services yet.</p>'}</section>`}`;
  // the modelling tool: a test plan the model costs, beside the plan (on launch day once the tickets have been worked out by hand)
  let idea = '';
  if(!setup || costed){ if(UI.ideaOpen){ const test = testPlan(), Lt = planLines(test), same = planKey(pl) === planKey(test), d = Lt.v.profit - L.v.profit;
    const chip = same ? '<div class="t2-diff">Change the test plan to try an idea. The model costs it straight away.</div>' : `<div class="t2-diff ${d >= 0 ? 'up' : 'down'}"><b class="mono">${d >= 0 ? '+' : '−'}${money(Math.abs(d))}</b><span>${d >= 0 ? 'more' : 'less'} profit than your plan</span></div>`;
    idea = `<section class="pnl pl-idea"><div class="pnl-h"><h3>Try an idea</h3><span class="muted">The model costs a test plan: no sums</span>${same ? '' : '<button class="link" data-treset>Start again from your plan</button>'}<button class="btn small" id="ideaShut">Close</button></div>
      <div class="pl-idea-g"><div>${planEditor(9, test, Lt, { compact:true })}</div><div>${chip}${modelRows(L, Lt, 'day')}<div class="pl-choose">${same ? '' : `<button class="btn ${d >= 0 ? 'primary' : ''}" data-ftest>Make the test plan my plan</button>`}</div></div></div></section>`; } }
  screen().innerHTML = taskFrame({ question: setup ? 'Build the day' : 'What will your airline do today?', work:false, story, help:['timing', 'demand'], context: ctxAircraft(), todo: depsOn() ? '' : undefined,
    say: setup ? `Build the day. ${wantOf(r.id)} people want to fly to ${r.city}. Choose how many services, then cost your plan.` : S.fleet.length > 1 ? `Give each aircraft its services and departure times, then cost your plan.` : `Plan what your airline will do today, then cost your plan.`,
    main:`<div class="planner2 pl2 ${UI.ideaOpen ? 'idea-open' : ''}">${planPane}${idea}</div>`,
    foot:`<button class="btn primary big" id="nx" ${sched.length && L.fits ? '' : 'disabled'}>${!sched.length ? 'Choose some services' : costed ? goLabel('Ready to fly') : goLabel('Cost your plan')} &#9654;</button>` });
  if(setup) bindServices(); else bindPlanEditor();
  on('ideaOpen', () => { UI.ideaOpen = true; render(); }); on('ideaShut', () => { UI.ideaOpen = false; render(); });
  screen().querySelectorAll('[data-treset]').forEach(b => b.onclick = () => { S.rnd.test = null; render(); });
  screen().querySelectorAll('[data-ftest]').forEach(b => b.onclick = () => { const test = testPlan(); if(planKey(test) !== planKey(currentPlan())) applyPlan(test); S.rnd.test = null; render(); });
  on('nx', () => { S.rnd.focusRoute = schedOf(fleetOne())[0] || S.market; UI.ideaOpen = false; resetEntry(); UI.justDone = null; advance(); });
};

/* ==================================================================
   THE WORKINGS PAGE
   ================================================================== */
/* the first open cell, row by row then column by column */
function wkNext(tables){ for(const t of tables){ const rows = tRows(t); for(let ri = 0; ri < rows.length; ri++) for(const c of t.cols) if(cellState(t, c, ri) === 'enter') return { t, cell:{ col:c.id, row:rows[ri].id } }; } return null; }
function wkCells(tables){ const out = [], auto = S.rnd.autoDone || []; tables.forEach(t => { const rows = tRows(t); rows.forEach((r, ri) => t.cols.forEach(c => { const s = cellState(t, c, ri); if(rowTyped(t, r) && ['enter', 'done', 'wait'].includes(s) && !auto.includes(t.id + '|' + cellId(c.id, r.id))) out.push({ t, c, r, s }); })); }); return out; }
/* a figure as it is written down: pounds as whole pounds, litres as a number, a price per litre in pence */
function wkFig(unit, v){ if(unit === 'ppl') return { s:String(Math.round(v * 100)), note:`${priceL(v)} = ${Math.round(v * 100)}p` }; if(unit === 'dec'){ const h = Math.round(v * 100); return h % 10 === 0 ? { s:String(h / 10), note:`${h / 10} in 10`, tenths:true, div:10 } : { s:String(h), note:`${h} in 100`, tenths:true, div:100 }; } if(unit === '£') return { s:String(Math.round(v)) }; return { s:String(Math.round(v)) }; }
/* the method, line by line, for Show me and the working rows */
function wkMethod(a, b, op, unitA, unitB, unitOut){
  const f = v => num(v);
  if(op === '−') return [`${f(a)} − ${f(b)}`, `= ${f(a - b)}`];
  if(unitB === 'dec'){ const h = Math.round(b * 100); if(h % 10 === 0){ const k = h / 10; return [`${f(a)} ÷ 10 = ${f(a / 10)}`, `${f(a / 10)} × ${k} = ${f(Math.round(a * k) / 10)}`]; } return [`${f(a)} × ${h} = ${f(a * h)}`, `${f(a * h)} ÷ 100 = ${f(Math.round(a * h) / 100)}`]; }
  if(unitB === 'ppl'){ const p = Math.round(b * 100), pounds = Math.floor(p / 100), pence = p % 100; return [`${f(a)} × £${pounds} = £${f(a * pounds)}`, `${f(a)} × ${pence}p = £${f(a * pence / 100)}`, `£${f(a * pounds)} + £${f(a * pence / 100)} = £${f(a * b)}`]; }
  if(b % 10 === 0 && b >= 20) return [`${f(a)} × ${b / 10} = ${f(a * b / 10)}`, `${f(a * b / 10)} × 10 = ${f(a * b)}`];
  if(b >= 10){ const tens = Math.floor(b / 10) * 10, ones = b - tens; return [`${f(a)} × ${tens} = ${f(a * tens)}`, `${f(a)} × ${ones} = ${f(a * ones)}`, `${f(a * tens)} + ${f(a * ones)} = ${f(a * b)}`]; }
  return [`${f(a)} × ${b} = ${f(a * b)}`];
}
function wkGrid(t, col, row, o){
  o = o || {}; const ops = stackRows(t, col, row), A = ops[0], B = ops[1], ua = operandUnit(t, A.id), ub = operandUnit(t, B.id), a = operandValue(t, col, A.id), b = operandValue(t, col, B.id);
  const fa = wkFig(ua, a), fb = wkFig(ub, b), op = B.op || row.op || '×', ans = col.values[row.id], fAns = wkFig(row.unit, ans), W = Math.max(fa.s.length, fb.s.length, String(fAns.s).length) + 1;
  const cells = s => { const d = s.padStart(W, ' ').split(''); return d.map(ch => `<i>${ch === ' ' ? '' : ch}</i>`).join(''); };
  const tenths = fb.tenths;
  const rows = [`<div class="wk-row carry">${Array.from({ length:W }, () => '<i><input maxlength="1" inputmode="numeric" aria-label="carry"></i>').join('')}<span class="wk-note"></span></div>`,
    `<div class="wk-row"><span class="wk-op"></span>${cells(fa.s)}<span class="wk-note">${esc(A.label)}${fa.note ? ' · ' + fa.note : ''}</span></div>`,
    `<div class="wk-row"><span class="wk-op">${esc(op)}</span>${cells(fb.s)}<span class="wk-note">${esc(B.label)}${fb.note ? ' · ' + fb.note : ''}</span></div>`]
    .concat(tenths ? [`<div class="wk-row"><span class="wk-op">÷</span>${cells(String(fb.div))}<span class="wk-note">${fb.div === 10 ? 'tenths' : 'hundredths'}</span></div>`] : []);
  const method = o.show ? wkMethod(a, b, op, ua, ub, row.unit) : null, workRows = op === '−' ? 1 : (tenths || ub === 'ppl' || (b >= 10 && b % 10 !== 0)) ? 3 : 2;
  const work = Array.from({ length:workRows }, (_, k) => `<div class="wk-row work"><span class="wk-op"></span><input class="wk-free mono" ${method && method[k] ? `value="${esc(method[k])}" readonly` : ''} placeholder="${k === 0 ? 'your working' : ''}" aria-label="working row ${k + 1}"></div>`).join('');
  const unit = row.unit === '£' ? '£' : '';
  const answer = o.done ? `<div class="wk-row ans done"><span class="wk-op">=</span><b class="mono">${fmtVal(row.unit, ans)}</b><span class="wk-note">${esc(rowLabel(t, row))}</span></div>`
    : `<div class="wk-row ans"><span class="wk-op">=</span><span class="answer"><span class="unit">${unit}</span><input id="cellAns" class="mono" inputmode="decimal" autocomplete="off" value="${esc(UI.entry)}" aria-label="${esc(rowLabel(t, row))}"></span><span class="wk-note">${esc(rowLabel(t, row))}${row.unit === '£' && ub === 'ppl' ? ' · in pounds' : ''}</span></div>`;
  return `<div class="wk-grid" style="--w:${W}">${rows.join('')}<div class="wk-rule"></div>${work}${answer}</div>`;
}
/* the fuel tutorial: the example stepped through on the paper before his own litres */
function wkTutorial(st){
  const k = st.tutStep || 0, steps = [['1,000 × £1.30', 'The price has a decimal point. £1.30 is £1 and 30p, so do the pounds, then the pence, then add.'], ['1,000 × £1 = £1,000', 'The pounds first.'], ['1,000 × 30p = £300', 'Then the pence: 1,000 × 30p is 30,000p, which is £300.'], ['£1,000 + £300 = £1,300', 'Add them: 1,000 × £1.30 = £1,300. Another way: 130p × 1,000 = 130,000p = £1,300.']];
  return `<div class="wk-tut"><span class="kl">A worked example first</span><h2>Litres × a price with a decimal point</h2>
    <div class="wk-tut-lines">${steps.slice(0, k + 1).map(([s, w], i) => `<div class="wk-tl ${i === k ? 'now' : ''}"><b class="mono">${s}</b><span>${w}</span></div>`).join('')}</div>
    <div class="wk-act">${k < steps.length - 1 ? '<button class="btn primary big" id="wkTutNext">Next step &#9654;</button>' : '<button class="btn primary big" id="wkTutGo">Now your own fuel &#9654;</button>'}</div></div>`;
}
function wkSentence(t, c, r){ const ops = stackRows(t, c, r); return `${ops.map((x, i) => (i ? x.op + ' ' : '') + x.value).join(' ')} = ${fmtVal(r.unit, c.values[r.id])}`; }
R.workings = st => {
  const setup = S.phase === 'setup', pl = currentPlan(), W = workTables(pl), { t, tables, opts, multi, picked, L0 } = W, H = S.rnd.handSums || {};
  const cells = wkCells(tables), todo = cells.filter(x => x.s !== 'done'), fresh = newIdeas(tables);
  const finish = () => { const Lp = planLines(currentPlan()); S.rnd.costed = { label:planLabel(currentPlan()), key:planKey(currentPlan()), v:Object.assign({}, Lp.v) }; S.rnd.costedTools = fresh;
    if(typeof recordHandSums === 'function' && S.rnd.handSums) recordHandSums(Lp); S.rnd.myForecast = forecastOf(Lp, 'Your plan', currentPlan()); S.rnd.archive = { costed:{ label:S.rnd.costed.label, profit:Lp.v.profit }, ideas:[], flown:{ name:'Your plan', label:S.rnd.costed.label, profit:Lp.v.profit } }; S.rnd.test = null; resetEntry(); UI.justDone = null; advance(); };
  // a day with nothing to work out (the model has costed the plan): straight on
  if(!cells.length){ finish(); return; }
  // the fuel day: the tutorial before the first fuel sum
  const tut = H.fuelCost && !skills().fuelCost && !st.tut;
  // the next sum
  let nx = wkNext(tables); if(nx){ nx.t.active = nx.t.active && cellState(nx.t, nx.t.cols.find(c => c.id === nx.t.active.col), tRows(nx.t).findIndex(r => r.id === nx.t.active.row)) === 'enter' ? nx.t.active : nx.cell; S.rnd.activeTable = nx.t.id; }
  tables.forEach(x => { if(x !== (nx && nx.t)) x.active = null; });
  const act = nx ? nx.t : null, col = act && act.cols.find(c => c.id === act.active.col), row = act && tRows(act).find(r => r.id === act.active.row);
  const justDone = UI.justDone && tables.find(x => x.id === UI.justDone.table);
  const needPick = multi && !picked && !wkNext(tables) && !justDone, allDone = !wkNext(tables) && (!multi || !!picked) && !justDone;
  const n = cells.length + (setup && !picked ? 1 : 0), k = Math.min(n, cells.filter(x => x.s === 'done').length + 1);
  const title = setup ? 'Launch day' : `Day ${S.round}`;
  let body = '', foot = '';
  if(tut){ body = wkTutorial(st); }
  else if(justDone){ const jt = justDone, [cid, rid] = UI.justDone.cell.split('|'), jc = jt.cols.find(c => c.id === cid), jr = tRows(jt).find(r => r.id === rid);
    body = `<div class="wk-sum"><div class="wk-head"><span class="kl">${esc(jc.label)}</span><h2>&#10003; ${esc(rowLabel(jt, jr))}: ${fmtVal(jr.unit, jc.values[rid])}</h2></div>${wkGrid(jt, jc, jr, { done:true, show:true })}
      <div class="wk-act"><button class="btn primary big" id="wkNext">${wkNext(tables) ? 'Next sum' : needPick || (multi && !picked) ? 'Choose' : 'Finished'} &#9654;</button></div></div>`; }
  else if(nx){ const q = TOOL[row.tool] ? TOOL[row.tool].name : rowLabel(act, row), rl = rowLabel(act, row), head = q.toLowerCase() === rl.toLowerCase() ? q : `${q}: ${rl.toLowerCase()}`;
    body = `<div class="wk-sum"><div class="wk-head"><span class="kl">${esc(col.label)}${col.sub ? ' · ' + esc(col.sub) : ''}</span><h2>${esc(head)}</h2></div>${wkGrid(act, col, row, {})}
      <div class="wk-act"><button class="btn primary big" id="cellCheck">Check &#10003;</button><button class="btn big" id="wkPad" aria-pressed="${!!st.pad}">${st.pad ? 'Hide the number pad' : 'Number pad'}</button>${(UI.tries || 0) >= 3 ? '<button class="link" id="calcShow">Show me</button>' : ''}</div>
      <div class="msg wk-msg ${UI.ok ? 'ok' : ''}" id="ftMsg" role="status">${esc(UI.msg || '')}</div>
      ${st.pad ? `<div class="wk-pad">${['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '−'].map(x => `<button data-k="${x === '−' ? '-' : x}">${x}</button>`).join('')}<button data-k="back">&#9003;</button></div>` : ''}</div>`; }
  else if(needPick){ body = `<div class="wk-pick"><span class="kl">${setup ? 'Choose the fare to fly at' : 'Choose what happens on board'}</span>
      <div class="wk-opts">${opts.map((o, i) => { const v = W.lines[i].v; return `<button class="wk-opt" data-wpick="${o.id}"><b>${esc(o.word)}</b><span>${setup ? `${v.pax1 || v['pax_' + S.market]} passengers · tickets ${money(v['tk_' + S.market] || v.tk1)}` : `cabin sales ${money(v.snack)} · profit ${money(v.profit)}`}</span></button>`; }).join('')}</div>
      ${!setup && !S.rnd.thirdSnack && Object.keys(ONBOARD).some(k => ONBOARD[k].free) ? '<button class="link" id="woThird">Compare free snacks too</button>' : ''}</div>`; }
  else if(allDone){ const done = cells.filter(x => x.s === 'done'), pN = practiceN(), pkey = practiceKeyToday(), pr = pN && pkey && !st.noPractice ? practiceHtml(st, pkey, pN, true) : '';
    body = `<div class="wk-sum wk-summary"><div class="wk-head"><span class="kl">${esc(title)}</span><h2>Your workings today</h2></div>
      <table class="wk-list">${done.map(x => `<tr><th>${esc(x.c.label)} · ${esc(rowLabel(x.t, x.r))}</th><td class="mono">${wkSentence(x.t, x.c, x.r)}</td></tr>`).join('')}
      <tr class="tot"><th>${esc(planLabel(currentPlan()))}</th><td class="mono">profit ${money(planLines(currentPlan()).v.profit)}</td></tr></table>
      ${pr ? `<div class="wk-practice"><span class="kl">Practice (optional): ${pN === 1 ? 'one question' : pN + ' questions'} with your own numbers</span>${pr}<button class="link" id="wkSkipP">Skip practice</button></div>` : ''}
      <div class="wk-act"><button class="btn primary big" id="nx">Back to HQ &#9654;</button></div></div>`; }
  screen().innerHTML = `<div class="wk"><div class="wk-top"><span class="wk-crumb">${esc(S.airline.name || 'Airline')} HQ · ${esc(title)}</span><b>Work it out</b><span class="wk-prog">${allDone ? 'All done' : tut ? 'Worked example' : `Sum ${k} of ${n}`}</span></div>${body}</div>`;
  if(act && !justDone && !tut) bindTable(act);
  on('wkTutNext', () => { st.tutStep = (st.tutStep || 0) + 1; render(); }); on('wkTutGo', () => { st.tut = true; render(); });
  on('wkNext', () => { UI.justDone = null; resetEntry(); render(); });
  on('wkPad', () => { st.pad = !st.pad; render(); });
  on('calcShow', () => { if(act && act.active){ const a = act.active, c = act.cols.find(x => x.id === a.col); diagNote({ kind:'answer shown to pupil', table:act.id, cell:cellId(a.col, a.row), stored:c ? c.values[a.row] : null, typed:UI.entry, tries:UI.tries }); cellCorrect(act, true); } render(); });
  on('woThird', () => { S.rnd.thirdSnack = true; render(); });
  screen().querySelectorAll('[data-wpick]').forEach(b => b.onclick = () => { const o = opts.find(x => x.id === b.getAttribute('data-wpick')); if(o) applyPick(o); });
  if(allDone && practiceN() && practiceKeyToday() && !st.noPractice) bindPractice(st, practiceKeyToday(), () => {}, practiceN(), true);
  on('wkSkipP', () => { st.noPractice = true; render(); });
  on('nx', finish);
};
/* the practice topic for the day (with the pupil's own numbers): the day's new idea, or the tickets */
function practiceKeyToday(){ if(S.phase === 'setup') return null; const H = S.rnd.handSums || {}; if(H.snacks) return 'snackSales'; if(H.fuelCost) return 'fuelPrice'; if(H.weekendDemand || H.rivalStay) return 'tenths'; return 'tickets'; }
