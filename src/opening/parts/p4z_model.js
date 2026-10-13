/* ==================================================================
   The Operations Model (Design Note "The desks" v2 §6, Bertie's reference screen). From day 8 in week mode: the
   planner's "Try different options" and the nav row open it. The current plan (read-only) beside a test plan the
   pupil edits; the week's projected results for both, with the change; what changed; the profit comparison; up to
   three saved test plans; "Use test plan" makes it the plan. Modelling never costs a sum (HandSumRules rule 6).
   The first visit builds the model: Revenue = Passengers × Fare and Profit = Revenue − Costs, made from pieces.
   ================================================================== */
UI.om = UI.om || { slots:{ revenue:[], profit:[] }, err:{}, active:'revenue' };
const OM_PIECES = ['Passengers', 'Fare', 'Seats', 'Costs', 'Revenue'], OM_OPS = ['×', '+', '−', '÷'];
const OM_WANT = { revenue:[['Passengers', '×', 'Fare'], ['Fare', '×', 'Passengers']], profit:[['Revenue', '−', 'Costs']] };
function omBuilt(){ return !!(S && S.analyst && S.analyst.built); }
function omWeekFrom(){ const d = S.day || 1; return d - ((d - 1) % 7); }
/* the seven days of a plan, in one dry run: passengers, seats, revenue, on-board, fuel, costs, profit */
function omWeek(plans, from){
  const key = JSON.stringify([plans.map(planKey), from, S.day, Math.round(S.fuel || 0)]);
  if(UI.omCache && UI.omCache.key === key) return UI.omCache.v;
  const v = dryRun(() => plans.map(pl => { const o = { pax:0, seats:0, rev:0, ob:0, fuelL:0, cost:0, profit:0 };
    for(let d = from; d < from + 7; d++) withDay(d, () => withBeat(beatAt(d), () => { const keep = S.day; S.day = d; try{ const L = planLines(pl); o.pax += L.pax || 0; o.seats += L.seats || 0; o.rev += L.v.rev || 0; o.ob += L.v.snack || 0; o.fuelL += L.fuelL || 0; o.cost += L.v.cost || 0; o.profit += L.v.profit || 0; } finally { S.day = keep; } }));
    o.tk = o.rev - o.ob; return o; }));
  UI.omCache = { key, v }; return v;
}
/* the plan, route by route: fare, services, departures, the aircraft that fly it */
function omRoutes(pl){
  pl = normPlan(pl); const by = {};
  pl.fleet.forEach((x, j) => { const deps = x.sched.length ? actualDeps(pl, j) : []; x.sched.forEach((id, k) => { const r = by[id] || (by[id] = { id, n:0, deps:[], planes:[], at:[] }); r.n++; r.deps.push(deps[k]); r.at.push({ j, k }); if(!r.planes.includes(x.uid)) r.planes.push(x.uid); }); });
  Object.values(by).forEach(r => { const o = r.deps.map((t, q) => [t, r.at[q]]).sort((a, b) => a[0] - b[0]); r.deps = o.map(z => z[0]); r.at = o.map(z => z[1]); });
  return by;
}
const omPlaneName = uid => { const f = S.fleet.find(z => z.uid === uid); return f ? shortPlane(planeById(f.planeId)) + (f.registration ? ` · ${f.registration}` : '') : ''; };
function omPlanTable(pl, ids, edit){
  const R = omRoutes(pl), ob = ONBOARD[pl.onboard || 'none'] || ONBOARD.none;
  const fare = (x, r) => { const v = pl.prices[r.id] || r.basePrice; return edit ? `<span class="om-step"><button data-mo="fare|${r.id}|-1" aria-label="Lower the ${esc(r.city)} fare">−</button><b>${money(v)}</b><button data-mo="fare|${r.id}|1" aria-label="Raise the ${esc(r.city)} fare">+</button></span>` : `<b>${money(v)}</b>`; };
  const svc = (x, r) => edit ? `<span class="om-step"><button data-mo="svc|${r.id}|-1" ${x.n ? '' : 'disabled'} aria-label="One fewer ${esc(r.city)} service">−</button><b>${x.n}</b><button data-mo="svc|${r.id}|1" aria-label="One more ${esc(r.city)} service">+</button></span>` : `<b>${x.n}</b>`;
  const deps = (x, r) => !x.n ? '<span class="muted">—</span>' : edit ? x.at.map((a, q) => { const lane = normPlan(pl).fleet[a.j], p = planeById(lane.planeId), trip = TIME.roundTrip(p, r), opts = []; for(let t = dayStart(); t + trip <= dayEnd(); t += 30) opts.push(t);
      if(!opts.includes(x.deps[q])) opts.push(x.deps[q]); opts.sort((u, v) => u - v);
      return `<select class="om-sel" data-mdep="${a.j}|${a.k}" aria-label="${esc(r.city)} service ${q + 1} departs">${opts.map(t => `<option value="${t}" ${t === x.deps[q] ? 'selected' : ''}>${fmtTime(t)}</option>`).join('')}</select>`; }).join('') : x.deps.map(t => `<span class="om-t">${fmtTime(t)}</span>`).join('');
  const planes = (x, r) => { if(!edit || S.fleet.length < 2) return x.planes.length ? x.planes.map(u => `<span class="om-pl">${esc(omPlaneName(u))}</span>`).join('') : '<span class="muted">—</span>';
    const can = S.fleet.filter(f => planeCanFly(planeById(f.planeId), r)), cur = x.planes.length === 1 ? x.planes[0] : '';
    return `<select class="om-sel" data-mpl="${r.id}" ${x.n ? '' : 'disabled'} aria-label="Aircraft for ${esc(r.city)}">${cur ? '' : '<option value="">mixed</option>'}${can.map(f => `<option value="${f.uid}" ${f.uid === cur ? 'selected' : ''} title="${esc(omPlaneName(f.uid))}">${esc(S.fleet.filter(z => z.planeId === f.planeId).length > 1 ? omPlaneName(f.uid) : shortPlane(planeById(f.planeId)))}</option>`).join('')}</select>`; };
  const obCell = edit ? `<select class="om-sel" data-mob aria-label="On board">${Object.keys(ONBOARD).map(k => `<option value="${k}" ${k === (pl.onboard || 'none') ? 'selected' : ''}>${esc(ONBOARD[k].label)}</option>`).join('')}</select>` : `<b>${esc(ob.label)}</b>`;
  const blank = id => ({ id, n:0, deps:[], planes:[], at:[] });
  const rows = ids.map(id => { const r = routeById(id), x = R[id] || blank(id);
    return `<tr><th class="om-rn"><span class="om-city">${artCity(id)}</span><span class="om-rc">${flagSvg(r.flag, 16)}<b>${esc(r.city)}</b></span></th><td class="om-c">${fare(x, r)}</td><td class="om-c">${svc(x, r)}</td><td class="om-dp">${deps(x, r)}</td><td class="om-ac">${planes(x, r)}</td></tr>`; }).join('');
  return `<table class="om-pt om-rows"><thead><tr><th>Route</th><th class="om-c">${ICO2.tag}Fare</th><th class="om-c">${ICO2.plane}Services<br>a day</th><th>${ICO2.clock}Departures</th><th>${ICO2.seat}Aircraft</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="om-obl">${ICO2.snack}<span>On board</span>${obCell}</div>`;
}
function omResults(A, B){
  const lf = o => o.seats ? Math.round(100 * o.pax / o.seats) : 0, m = v => money(Math.round(v));
  const rows = [['people', 'Passengers', A.pax, B.pax, num, 'up'], ['seat', 'Load factor', lf(A), lf(B), v => v + '%', 'up'], ['tag', 'Ticket revenue', A.tk, B.tk, m, 'up'], ['snack', 'On-board sales', A.ob, B.ob, m, 'up'],
    ['fuel', 'Fuel needed', A.fuelL, B.fuelL, v => num(Math.round(v)) + ' L', 'down'], ['pound', 'Total operating costs', A.cost, B.cost, m, 'down'], ['bars', 'Projected profit', A.profit, B.profit, m, 'up', 'pr']];
  return `<table class="om-rt"><thead><tr><th></th><th class="num">Current</th><th class="num">Test</th><th class="num">Change</th></tr></thead><tbody>${rows.map(([ic, l, a, b, f, good, cls]) => { const d = Math.round(b) - Math.round(a), col = !d ? '' : (d > 0) === (good === 'up') ? 'good' : 'bad';
    return `<tr class="${cls || ''}"><th>${ICO2[ic]}${l}</th><td class="num">${f(a)}</td><td class="num">${f(b)}</td><td class="num ${col}">${d ? `${d > 0 ? '+' : '−'}${l === 'Load factor' ? Math.abs(d) + ' pts' : f(Math.abs(d)).replace(/^−/, '')}` : '—'}</td></tr>`; }).join('')}</tbody></table>`;
}
/* Build first: two formulas from pieces (a wrong one shows an error in the cell) */
function omBuildHtml(){
  const slot = (k, i) => { const v = (UI.om.slots[k] || [])[i]; return `<span class="om-slot ${v ? 'on' : ''} ${i === 1 ? 'op' : ''}">${v ? esc(v) : '?'}</span>`; };
  const f = (k, lab) => `<div class="om-f ${UI.om.active === k ? 'act' : ''} ${UI.om.err[k] ? 'err' : ''} ${UI.om.ok && UI.om.ok[k] ? 'ok' : ''}" data-omf="${k}"><span class="om-fl">${lab}</span><span>=</span>${slot(k, 0)}${slot(k, 1)}${slot(k, 2)}${UI.om.ok && UI.om.ok[k] ? ICO2.check : ''}</div>${UI.om.err[k] ? `<p class="om-e">${esc(UI.om.err[k])}</p>` : ''}`;
  return `<div class="om-build"><p>The model needs two formulas before it can project a week. Press a formula, then build it from the pieces.</p>${f('revenue', 'Revenue')}${f('profit', 'Profit')}
    <div class="om-pcs"><span class="kl">Pieces</span>${OM_PIECES.map(x => `<button class="om-pc" data-omp="${x}">${x}</button>`).join('')}</div>
    <div class="om-pcs"><span class="kl">Operators</span>${OM_OPS.map(x => `<button class="om-pc op" data-omp="${x}">${x}</button>`).join('')}<button class="dk-link" id="omClear">Clear</button></div></div>`;
}
function omPlace(x){
  const k = UI.om.active, s = UI.om.slots[k] || (UI.om.slots[k] = []), isOp = OM_OPS.includes(x);
  if(s.length >= 3 || (s.length === 1) !== isOp){ UI.om.err[k] = s.length === 1 ? 'An operator goes in the middle: ×, +, − or ÷.' : s.length >= 3 ? 'The formula is full: Clear it to start again.' : 'Start with a piece, not an operator.'; render(); return; }
  s.push(x); UI.om.err[k] = '';
  if(s.length === 3){ const ok = OM_WANT[k].some(w => w.join() === s.join());
    if(!ok){ UI.om.err[k] = k === 'revenue' ? `#ERROR: ${s.join(' ')} is not the money passengers pay. Revenue is every passenger paying the fare.` : `#ERROR: ${s.join(' ')} is not what you keep. Profit is the revenue left after the costs are paid.`; UI.om.slots[k] = []; }
    else { (UI.om.ok || (UI.om.ok = {}))[k] = true; if(k === 'revenue' && !(UI.om.ok.profit)) UI.om.active = 'profit'; }
    if(UI.om.ok && UI.om.ok.revenue && UI.om.ok.profit){ S.analyst = { built:true, day:S.day, formulas:{ revenue:UI.om.slots.revenue.join(' '), profit:UI.om.slots.profit.join(' ') } };
      const log = S.handSumLog || (S.handSumLog = []), e = log.find(z => z.day === S.day) || (log.push({ day:S.day, date:dateShort(S.day), tools:[] }), log[log.length - 1]);
      e.tools.push(`Build: Revenue = ${S.analyst.formulas.revenue}`); e.tools.push(`Build: Profit = ${S.analyst.formulas.profit}`); save(); } }
  render();
}
function omName(cur, test){ const d = planDiff(cur, test); return d.length ? d[0] + (d.length > 1 ? ` (+${d.length - 1})` : '') : 'Same as the current plan'; }
function modelHtml(){
  const cur = currentPlan(), test = testPlan(), from = omWeekFrom(), wk = weekNo(from), built = omBuilt();
  const ids = [...new Set(normPlan(cur).fleet.flatMap(x => x.sched).concat(normPlan(test).fleet.flatMap(x => x.sched)))];
  const addable = plannerRoutes().filter(id => !ids.includes(id) && S.fleet.some(f => planeCanFly(planeById(f.planeId), routeById(id))));
  const [A, B] = built ? omWeek([cur, test], from) : [null, null];
  const p1 = `<section class="dk-pnl om-cur"><div class="dk-pnl-h">${ICO2.doc}<h2>Current plan <small>(Week ${wk})</small></h2><span class="grow"></span><span class="om-tag blue">Live</span></div>${ids.length ? omPlanTable(cur, ids, false) : '<p class="om-none">No services yet.</p>'}</section>`;
  const p2 = `<section class="dk-pnl om-test"><div class="dk-pnl-h">${ICO2.sliders}<h2>Test plan</h2><span class="grow"></span>${addable.length ? `<select class="om-sel om-add" data-madd aria-label="Add a route"><option value="">+ Add a route</option>${addable.map(id => `<option value="${id}">${esc(routeById(id).city)}</option>`).join('')}</select>` : ''}<button class="dk-link" id="omReset">Reset</button></div>${ids.length ? omPlanTable(test, ids, true) : ''}</section>`;
  const p3 = `<section class="dk-pnl om-res"><div class="dk-pnl-h">${ICO2.bars}<h2>Projected results <small>(per week)</small></h2><span class="grow"></span>${built ? `<button class="dk-link" id="omFx" title="The model's formulas">ƒ formulas</button>` : ''}</div>${built ? (UI.om.fx ? `<div class="om-fxl"><p><b>Revenue</b> = ${esc(S.analyst.formulas.revenue)}</p><p><b>Profit</b> = ${esc(S.analyst.formulas.profit)}</p><p class="muted">Each figure is the seven days ${fmtRange(from, from + 6)}, with the week's fuel price and the news the market expects.</p></div>` : '') + omResults(A, B) : omBuildHtml()}</section>`;
  const diff = planDiff(cur, test), icon = s => /fare/.test(s) ? 'tag' : /service/.test(s) ? 'plane' : /On board/.test(s) ? 'snack' : /→/.test(s) ? 'clock' : 'swap';
  const pill = s => { const m = /fare £(\d+) → £(\d+)/.exec(s); if(m){ const d = +m[2] - +m[1]; return `${d > 0 ? '+' : '−'}£${Math.abs(d)}`; } const t = /(\d\d):(\d\d) → (\d\d):(\d\d)/.exec(s); if(t) return (+t[3] * 60 + +t[4]) > (+t[1] * 60 + +t[2]) ? 'Moved later' : 'Moved earlier'; if(/^\+/.test(s)) return '+1 service'.replace('1', (/\+ (\w+)/.exec(s) || [])[1] === 'two' ? '2' : '1'); if(/^−/.test(s)) return '−1 service'; if(/On board/.test(s)) return 'On board'; return ''; };
  const what = `<section class="dk-pnl om-what"><div class="dk-pnl-h">${ICO2.swap}<h2>What changed?</h2></div><div class="om-wl">${diff.length ? diff.map(s => `<div class="om-w">${ICO2[icon(s)]}<span>${esc(s)}</span>${pill(s) ? `<i class="om-pill">${pill(s)}</i>` : ''}</div>`).join('') : '<p class="om-none">Nothing yet. Change the test plan above and the model shows the difference.</p>'}</div></section>`;
  const mx = built ? Math.max(1, Math.abs(A.profit), Math.abs(B.profit)) : 1, dP = built ? Math.round(B.profit - A.profit) : 0, pct = built && A.profit > 0 ? Math.round(100 * dP / A.profit) : null;
  const bar = (l, v, cls) => `<div class="om-b ${cls}"><span>${l}</span><div class="om-bt"><i style="width:${Math.max(2, Math.round(100 * Math.abs(v) / mx))}%" class="${v < 0 ? 'neg' : ''}"></i></div><b>${money(Math.round(v))}</b></div>`;
  const cmp = `<section class="dk-pnl om-cmp"><div class="dk-pnl-h">${ICO2.bars}<h2>Profit comparison <small>(per week)</small></h2></div>${built ? `<div class="om-cg"><div class="om-bars">${bar('Current plan', A.profit, 'cur')}${bar('Test plan', B.profit, 'tst')}</div>
    <div class="om-gc ${dP > 0 ? 'good' : dP < 0 ? 'bad' : ''}"><b>${dP > 0 ? '+' : dP < 0 ? '−' : ''}${money(Math.abs(dP))}</b><span>${dP > 0 ? 'higher' : dP < 0 ? 'lower' : 'the same'} projected profit per week</span>${pct !== null && dP ? `<small>A ${Math.abs(pct)}% ${dP > 0 ? 'increase' : 'decrease'} on your current plan</small>` : ''}</div></div>` : '<p class="om-none">Build the model to compare the plans.</p>'}</section>`;
  const saved = S.savedTests || [], tk = planKey(test);
  const sv = `<section class="dk-pnl om-saved"><div class="dk-pnl-h">${ICO2.doc}<h2>Saved test plans</h2><span class="grow"></span><button class="dk-link" id="omSave" ${built && diff.length && saved.length < 3 && !saved.some(x => planKey(x.plan) === tk) ? '' : 'disabled'}>${ICO2.plus} Save current test</button></div>
    <div class="om-sl">${saved.length ? saved.map((x, q) => { const on = planKey(x.plan) === tk, P = built ? omWeek([x.plan], from)[0].profit : null; return `<div class="om-sv ${on ? 'on' : ''}"><b>${esc(x.name)}</b>${P !== null ? `<span class="${P >= (A ? A.profit : 0) ? 'good' : 'bad'}">${money(Math.round(P))} a week</span>` : ''}${on ? '<i class="om-pill">Current test</i>' : `<button class="dk-link" data-omload="${q}">Load</button>`}<button class="om-x" data-omdel="${q}" aria-label="Delete ${esc(x.name)}">×</button></div>`; }).join('') : '<p class="om-none">Save up to three test plans to compare them later.</p>'}</div></section>`;
  return `<div class="om"><div class="om-top">${p1}${p2}${p3}</div><div class="om-bot">${what}${cmp}${sv}</div></div>`;
}
function renderModel(asView){
  const cur = currentPlan(), test = testPlan(), same = planKey(cur) === planKey(test), can = planReachable();
  const bar = deskBar(omBuilt() ? (can ? 'Change the test plan and watch the week\'s projection. Use test plan makes it your plan.' : 'You can try options at any time; change the plan itself on Monday.') : 'Build the model: Revenue = Passengers × Fare, then Profit = Revenue − Costs.',
    `<button class="btn big" id="omClose">&#9664; Back</button><button class="btn primary big" id="omUse" ${!same && can && omBuilt() ? '' : 'disabled'}>Use test plan &#9654;</button>`);
  screen().innerHTML = shell(deskPage({ title:'Operations Model', sub:'Compare your current plan with a test plan before you make it live.', cls:'om-page',
    cards:[{ ic:'bulb', t:omBuilt() ? 'How the model works' : 'Build the model', s:omBuilt() ? 'Two formulas you built. Press to see them.' : 'Two formulas first: then it projects any plan.', id:'omHow' }, { ic:'back', t:'Back to plan', s:'Return to the operating plan.', id:'omBackCard' }],
    body:modelHtml() }), bar);
  bindModel();
}
function omMoveRoute(id, uid){
  const next = normPlan(JSON.parse(JSON.stringify(testPlan()))), to = next.fleet.findIndex(x => x.uid === uid); if(to < 0) return;
  const n = next.fleet.reduce((t, x, j) => t + (j === to ? 0 : x.sched.filter(s => s === id).length), 0); if(!n) return;
  next.fleet.forEach((x, j) => { if(j === to) return; const keep = x.sched.map((s, k) => s === id ? -1 : k).filter(k => k >= 0); x.deps = x.deps && x.deps.length === x.sched.length ? keep.map(k => x.deps[k]) : null; x.sched = keep.map(k => x.sched[k]); });
  S.rnd.test = next; for(let q = 0; q < n; q++){ const before = planKey(testPlan()); addService(9, id, to); if(planKey(testPlan()) === before) break; }
}
function bindModel(){
  const root = screen(), close = () => { UI.view = null; render(); };
  on('omClose', close); on('omBackCard', close);
  on('omHow', () => { if(omBuilt()){ UI.om.fx = !UI.om.fx; render(); } });
  on('omFx', () => { UI.om.fx = !UI.om.fx; render(); });
  on('omReset', () => { S.rnd.test = null; render(); });
  on('omUse', () => { const t = testPlan(); if(planKey(t) !== planKey(currentPlan()) && planReachable()){ applyPlan(t); S.rnd.test = null; UI.view = null; toast('The test plan is now your plan.'); render(); } });
  root.querySelectorAll('[data-omf]').forEach(b => b.onclick = () => { UI.om.active = b.getAttribute('data-omf'); render(); });
  root.querySelectorAll('[data-omp]').forEach(b => b.onclick = () => omPlace(b.getAttribute('data-omp')));
  on('omClear', () => { UI.om.slots[UI.om.active] = []; UI.om.err[UI.om.active] = ''; if(UI.om.ok) UI.om.ok[UI.om.active] = false; render(); });
  root.querySelectorAll('[data-mo]').forEach(b => b.onclick = () => { const [what, id, d] = b.getAttribute('data-mo').split('|');
    if(what === 'fare') editPlan(9, 'fare', id, +d);
    else if(+d > 0) addService(9, id, null);
    else { const R = omRoutes(testPlan())[id]; if(R && R.at.length){ const a = R.at[R.at.length - 1]; editPlan(9, 'del', a.k, 0, a.j); } } });
  root.querySelectorAll('[data-mdep]').forEach(s => s.onchange = () => { const [j, k] = s.getAttribute('data-mdep').split('|').map(Number); editPlan(9, 'depTo', k, +s.value, j); });
  root.querySelectorAll('[data-mob]').forEach(s => s.onchange = () => editPlan(9, 'ob', s.value, 0));
  root.querySelectorAll('[data-mpl]').forEach(s => s.onchange = () => { if(s.value){ omMoveRoute(s.getAttribute('data-mpl'), +s.value); render(); } });
  root.querySelectorAll('[data-madd]').forEach(s => s.onchange = () => { if(s.value) addService(9, s.value, null); });
  on('omSave', () => { const t = testPlan(), L = S.savedTests || (S.savedTests = []); if(L.length >= 3) return; L.push({ name:omName(currentPlan(), t), plan:JSON.parse(JSON.stringify(t)), day:S.day }); save(); render(); });
  root.querySelectorAll('[data-omload]').forEach(b => b.onclick = () => { const x = (S.savedTests || [])[+b.getAttribute('data-omload')]; if(x){ S.rnd.test = normPlan(JSON.parse(JSON.stringify(x.plan))); render(); } });
  root.querySelectorAll('[data-omdel]').forEach(b => b.onclick = () => { (S.savedTests || []).splice(+b.getAttribute('data-omdel'), 1); save(); render(); });
}
/* the planner's "Test an idea" becomes "Try different options" (the Operations Model), absent in week 1 */
const planModel0 = R.plan;
R.plan = st => { const out = planModel0(st); if(!weekMode() || UI.card) return out; const b = $('ideaOpen'); if(b){ if(!moduleOn('model')) b.remove(); else { b.textContent = 'Try different options'; b.title = 'The Operations Model: test a plan before you make it live'; b.onclick = () => { UI.view = 'model'; UI.tlSel = null; render(); }; } } return out; };
