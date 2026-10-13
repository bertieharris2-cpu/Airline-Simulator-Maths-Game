
/* ==================================================================
   The Operating Plan Studio (D66; Workbook v4.10: Settings seatFillGood, seatFillMedium, demandStripMode, planStudioSteps; the
   PlanTips sheet; Fable's data appendix and Bertie's mock-ups). The Monday plan page in four steps: choose routes, set fares,
   place services, review seat fill. Route cards in one row read demand straight from the Routes sheet (people who want to fly
   at each fare); the timetable is the largest zone, one row per aircraft, each service block showing filled seats against
   the plane's seats in green, amber or red; the strip above it is the selected route's own day, or every open route's; the
   live panel holds four figures and at most two tips from PlanTips, true of the plan on screen. The sums page (workings) and
   the test plan keep the planner they had.
   ================================================================== */
const studioOn = () => wkPlanner() && dayLike() && !UI.ideaOpen;
function renderPlanner(st, summing){ if(!summing && studioOn()) return renderStudio(st); return renderPlannerBase(st, summing); }
const fillGood = () => +(WBS().seatFillGood !== undefined ? WBS().seatFillGood : 0.8), fillMid = () => +(WBS().seatFillMedium !== undefined ? WBS().seatFillMedium : 0.5);
const fillCls = (sold, seats) => { const f = seats ? sold / seats : 0; return f >= fillGood() - 1e-9 ? 'good' : f >= fillMid() - 1e-9 ? 'mid' : 'low'; };
const STUDIO_STEP_SUB = ['Pick the routes you want to fly', 'Adjust fares and see demand', 'Add flights to your timetable', 'Check results and make changes'];
function studioSteps(){ const s = String(WBS().planStudioSteps || 'Choose routes | Set fares | Place services | Review seat fill').split('|').map(x => x.trim()).filter(Boolean); return s.length === 4 ? s : ['Choose routes', 'Set fares', 'Place services', 'Review seat fill']; }
/* the aircraft the cards are read for (its flying times) and that Add to schedule uses */
function studioPlane(pl){ const j = UI.stPlane || 0; return pl.fleet[j] ? j : 0; }

/* ---------- route cards: city, code, distance, flying time on the selected plane, the fares with the people at each ---------- */
function studioCard(i, id, pl, j, sel){
  const r = routeById(id), x = pl.fleet[j], p = planeById(x.planeId), fare = pl.prices[id] || r.basePrice, F = r.fares || [r.basePrice], n = serviceCounts(pl.fleet.flatMap(z => z.sched))[id] || 0;
  const want = F.map(f => paxWant(r, f)), mx = Math.max(1, ...want), can = planeCanFly(p, r), fw = paxWant(r, fare), many = F.length > 6;
  const bars = F.map((f, k) => { const on = f === fare; return `<button class="fch ${on ? 'on' : ''}" data-pe="${i}|fareTo|${id}|${f}" aria-pressed="${on}" title="${money(f)}: ${want[k]} people want to fly"><small>${want[k]}</small><span class="st-bw"><i style="height:${Math.max(6, Math.round(100 * want[k] / mx))}%"></i></span><b>${many ? num(f) : money(f)}</b></button>`; }).join('');
  return `<div class="mk st-card ${sel ? 'sel' : ''} ${n ? 'on' : ''}" data-stroute="${id}"><div class="st-ch">${flagSvg(r.flag, 20)}<b>${esc(r.city)}</b><span class="mono st-code">${esc(r.code || '')}</span>${n ? `<span class="st-n" title="${plural(n, 'flight')} a day on your plan">✈ ${n}</span>` : ''}</div>
    <div class="st-cf"><span class="mono">${num(routeKm(r))} km</span><span>${can ? `<span class="mono">${fmtDur(TIME.leg(p, r))}</span> each way` : `<span class="bad">out of the ${esc(shortPlane(p))}'s range</span>`}</span></div>
    <div class="st-bars" role="group" aria-label="${esc(r.city)} fares">${bars}</div>
    <div class="st-cap"><span>people a day${many ? ' · fares in £' : ''}</span><b class="mono">${money(fare)}: ${fw}</b></div>
    <button class="btn primary st-add" data-pe="${i}|add|${id}|0|${j}" title="Add a ${esc(r.city)} service to the ${esc(shortPlane(p))}">+ Add to schedule</button></div>`;
}

/* ---------- the demand strip: one route's five bands at its fare (those who must fly then, solid; those who would take any time, hatched) ---------- */
function stripData(pl, id){
  const ids = id ? [id] : plannerRoutes(), out = BANDS.map(b => ({ b, lock:0, flex:0 }));
  ids.forEach(rid => { const r = routeById(rid); if(!r) return; const fare = pl.prices[rid] || r.basePrice, P = demandPools(r, fare), a = archOf(r), sh = a.bands || {};
    out.forEach(o => { o.lock += P[o.b] || 0; o.flex += (P.flex || 0) * (sh[o.b] || 0); }); });
  out.forEach(o => { const [h0, h1] = bandHours(o.b); o.h0 = h0; o.h1 = h1; o.lock = Math.round(o.lock); o.flex = Math.round(o.flex); o.per = (o.lock + o.flex) / Math.max(1, h1 - h0); });
  return out;
}
function stripHtml(pl, id){
  const s0 = dayStart(), e0 = dayEnd(), span = e0 - s0, X = m => (100 * (Math.max(s0, Math.min(e0, m)) - s0) / span), D = stripData(pl, id), mx = Math.max(1e-9, ...D.map(o => o.per)), r = id && routeById(id);
  const cols = D.map(o => { const w = X(o.h1 * 60) - X(o.h0 * 60), hl = o.lock / Math.max(1, o.h1 - o.h0) / mx, hf = o.flex / Math.max(1, o.h1 - o.h0) / mx, lv = o.per / mx >= 0.67 ? 'hi' : o.per / mx >= 0.34 ? 'md' : 'lo';
    return `<div class="st-band ${lv}" style="left:${X(o.h0 * 60).toFixed(2)}%;width:${w.toFixed(2)}%" title="${esc(BAND_SHORT[o.b] || o.b)} ${pad(o.h0)}:00–${pad(o.h1)}:00: ${o.lock} must fly then, about ${o.flex} could fly at any time"><span class="st-bl">${esc(BAND_SHORT[o.b] || o.b)}</span><span class="st-bn mono">${o.lock + o.flex}</span><div class="st-col"><i class="fx" style="height:${Math.round(100 * hf)}%"></i><i class="lk" style="height:${Math.round(100 * hl)}%"></i></div></div>`; }).join('');
  return `<div class="st-strip" data-strip="${id || ''}"><div class="st-sl"><b>${r ? `${flagSvg(r.flag, 14)} ${esc(r.city)}` : 'All open routes'}</b><small>${r ? `at ${money(pl.prices[id] || r.basePrice)}` : 'at your fares'}: when people want to fly</small>
    <span class="st-key"><i class="lk"></i>must fly then <i class="fx"></i>any time</span></div><div class="st-sb">${cols}</div></div>`;
}

/* ---------- the timetable: one row per aircraft; a block is filled seats / the plane's seats, coloured by seatFillGood/Medium ---------- */
function studioLanes(i, pl, L){
  const s0 = dayStart(), e0 = dayEnd(), span = e0 - s0, X = m => (100 * (m - s0) / span).toFixed(2), sel = UI.tlSel && UI.tlSel.i === i ? UI.tlSel : null, maxT = WORLD.maxTrips || 4, jSel = studioPlane(pl);
  const ticks = []; for(let h = Math.ceil(s0 / 60); h * 60 <= e0; h += 2) ticks.push(`<span style="left:${X(h * 60)}%">${pad(h)}:00</span>`);
  const lanes = pl.fleet.map((x, j) => { const p = planeById(x.planeId), f = S.fleet.find(z => z.uid === x.uid), home = TIME.home(p), D = x.sched.length ? withPlan(pl, () => TIME.day(p, x.sched, undefined, x.deps || null)) : null;
    const blocks = D ? D.trips.map((t, k) => { const r = routeById(t.route), s = (L.services || []).find(z => z.uid === x.uid && z.k === k) || {}, seats = s.seats || p.seats, sold = s.sold || 0, over = t.arr > e0, on = sel && sel.j === j && sel.k === k, last = k === D.trips.length - 1, ready = last ? t.arr : t.arr + home, fc = fillCls(sold, seats), empty = Math.max(0, seats - sold);
      return `${last ? '' : `<i class="ad-ready" style="left:${X(t.arr)}%;width:${(X(ready) - X(t.arr))}%" title="Turnaround at ${esc(homeData().code || 'home')}: ready again at ${fmtTime(ready)}"></i>`}<button class="ad-blk st-blk fill-${fc} ${on ? 'on' : ''} ${over ? 'over' : ''}" data-tl="${i}|${j}|${k}" data-dep="${t.dep}" data-arr="${t.arr}" data-ready="${ready}" style="left:${X(t.dep)}%;width:${(X(t.arr) - X(t.dep)).toFixed(2)}%" title="${empty} empty seat${empty === 1 ? '' : 's'}" aria-label="${esc(r.city)} ${fmtTime(t.dep)} to ${fmtTime(t.arr)}, ${sold} of ${seats} seats filled${over ? ', lands after the airport closes' : ''}" aria-pressed="${!!on}">
        <span class="st-bt mono"><b>${fmtTime(t.dep)}</b>–${fmtTime(t.arr)}</span><span class="st-br">${flagSvg(r.flag, 13)} ${esc(r.city)}</span><span class="st-bf"><i style="width:${Math.round(100 * Math.min(1, sold / Math.max(1, seats)))}%"></i></span><span class="st-bs mono">${sold}/${seats}</span></button>`; }).join('') : '';
    const can = plannerOrder().filter(id => planeCanFly(p, routeById(id)));
    return `<div class="ad-ac st-row ${j === jSel ? 'sel' : ''}"><div class="st-plane"><button class="st-pn" data-stplane="${j}" title="Read the route cards for this aircraft">${planeMini(f || p, 'ad-pic')}<span><b>${esc(shortPlane(p))}</b><small>${esc(regOf(x.uid))} · ${p.seats} seats</small></span></button>
        <select class="st-addf" data-addsel="${i}|${j}" ${x.sched.length < maxT ? '' : 'disabled'} aria-label="Add a flight to the ${esc(shortPlane(p))}"><option value="">${x.sched.length < maxT ? '+ Add flight…' : `Full: ${maxT} flights`}</option>${can.map(id => `<option value="${id}">${esc(routeById(id).city)} · ${fmtDur(TIME.leg(p, routeById(id)))} each way</option>`).join('')}</select></div>
      <div class="ad-lane" data-lane="${i}|${j}" data-s0="${s0}" data-span="${span}">${blocks || '<span class="ad-none muted">No flights yet: add one from a route card or the menu.</span>'}</div></div>`; }).join('');
  return `<div class="ad st-ad ${pl.fleet.length >= 3 ? 'many' : ''}"><div class="ad-axis"><span class="ad-lab"></span><div class="ad-ticks">${ticks.join('')}</div></div>${lanes}</div>`;
}
function studioTable(pl, L){
  const rows = pl.fleet.flatMap((x, j) => { const p = planeById(x.planeId), D = x.sched.length ? withPlan(pl, () => TIME.day(p, x.sched, undefined, x.deps || null)) : null; return D ? D.trips.map((t, k) => { const r = routeById(t.route), s = (L.services || []).find(z => z.uid === x.uid && z.k === k) || {}, seats = s.seats || p.seats, sold = s.sold || 0;
    return `<tr><td>${esc(shortPlane(p))}</td><td>${flagSvg(r.flag, 13)} ${esc(r.city)}</td><td class="mono">${fmtTime(t.dep)}</td><td class="mono">${fmtTime(t.arr)}</td><td class="mono num">${money(fareOf(t.route))}</td><td class="mono num">${sold} / ${seats}</td><td><span class="st-bf ${'fill-' + fillCls(sold, seats)}"><i style="width:${Math.round(100 * sold / Math.max(1, seats))}%"></i></span> <span class="mono">${Math.round(100 * sold / Math.max(1, seats))}%</span></td><td class="mono num">${Math.max(0, seats - sold)}</td></tr>`; }) : []; });
  return `<div class="st-tw"><table class="st-table"><thead><tr><th>Aircraft</th><th>Route</th><th>Departs</th><th>Back</th><th class="num">Fare</th><th class="num">Seats filled</th><th>Fill</th><th class="num">Empty</th></tr></thead><tbody>${rows.join('') || '<tr><td colspan="8" class="muted">No flights yet.</td></tr>'}</tbody></table></div>`;
}

/* ---------- the live tips (PlanTips): each condition checked on the plan on screen, lowest priority number first, two at most ---------- */
const PLAN_TIPS_DEFAULT = [
  ['range_fail', 1, "{plane} can't reach {route} ({distance} km against {range} km range)."],
  ['peak_unserved', 1, 'This timetable leaves the {band} {route} peak unserved — about {n} people want to fly then.', 0.25],
  ['service_weak', 2, '{band} {route} is weak: {empty} empty seats of {seats}. Try a later time or a lower fare.', 0.5],
  ['turned_away', 2, "{route}: about {n} people a day won't get a seat. Add a service or raise the fare."],
  ['fare_too_high', 2, 'At £{fare}, {route} no longer fills {services} services — {empty} seats would be empty.'],
  ['fare_too_low', 3, 'You cut the {route} fare to £{fare}, but the planes were already full: that is £{lost} a day less for the same passengers.'],
  ['idle_plane', 3, '{plane} is idle for {hours} this afternoon. Another service would fit.', 240],
  ['long_leg_warning', 3, "{route} is {hours} each way in a {plane} — slow planes lose a whole day's work to one trip.", 180],
  ['all_good', 9, 'Most seats are filling well. Try a different fare or time and see what changes.'],
  ['general_tradeoff', 9, 'Higher fares earn more per seat but fewer people fly. Timing matters: demand changes through the day.']];
function planTipTable(){ const W = (WORLD.planTips || []).filter(t => t.message), byId = Object.fromEntries(W.map(t => [t.id, t]));
  return PLAN_TIPS_DEFAULT.map(([id, pr, msg, th]) => { const t = byId[id]; return { id, priority:t && t.priority !== undefined ? +t.priority : pr, message:t ? t.message : msg, threshold:t && t.threshold !== undefined && !isNaN(parseFloat(t.threshold)) ? parseFloat(t.threshold) : th }; }); }
const fillTip = (msg, v) => { const s = msg.replace(/\{(\w+)\}/g, (m, k) => v[k] !== undefined ? v[k] : m); return s.charAt(0).toUpperCase() + s.slice(1); };
const hoursWord = min => fmtDur(min).replace(/ h (\d\d)$/, ' h $1 min');
/* the conditions; opts.actual = the Sunday review's version (the fare cut and the empty plan are about the plan being made) */
function planTipsFor(pl, L, opts){
  opts = opts || {}; pl = normPlan(pl); const T = Object.fromEntries(planTipTable().map(t => [t.id, t])), hits = [], svc = L.services || [], routes = [...new Set(pl.fleet.flatMap(x => x.sched))];
  const add = (id, v, weight) => { const t = T[id]; if(t) hits.push({ id, priority:t.priority, weight:weight || 0, text:fillTip(t.message, v) }); };
  const seatsOn = rid => svc.filter(s => s.route === rid).reduce((t, s) => t + s.seats, 0), soldOn = rid => svc.filter(s => s.route === rid).reduce((t, s) => t + s.sold, 0), band = b => (BAND_SHORT[b] || b).toLowerCase();
  const rf = !opts.actual && S.rnd && S.rnd.stRange; if(rf && routeById(rf.route) && planeById(rf.plane)){ const r = routeById(rf.route), p = planeById(rf.plane); add('range_fail', { plane:shortPlane(p), route:r.city, distance:num(routeKm(r)), range:num(p.range) }, 1e9); }
  routes.forEach(rid => { const r = routeById(rid), fare = pl.prices[rid] || r.basePrice, P = demandPools(r, fare), tl = BANDS.reduce((t, b) => t + (P[b] || 0), 0), act = opts.routes && opts.routes[rid], n = svc.filter(s => s.route === rid).length;
    const want = act ? act.want : (L.want || {})[rid] !== undefined ? L.want[rid] : paxWant(r, fare), seats = act ? act.seats : seatsOn(rid), sold = act ? act.pax : soldOn(rid);   // the review: the week's own averages a day
    if(tl > 0) BANDS.forEach(b => { if((P[b] || 0) >= (T.peak_unserved.threshold || 0.25) * tl && !svc.some(s => s.route === rid && (s.band || bandOf(s.dep)) === b)) add('peak_unserved', { band:band(b), route:r.city, n:P[b] }, P[b]); });
    const load = Math.max(0, ...pl.fleet.filter(x => x.sched.includes(rid)).map(x => planeById(x.planeId).seats));
    if(want - seats > load) add('turned_away', { route:r.city, n:Math.max(0, want - sold) }, want - sold);
    if(n && want < seats) add('fare_too_high', { fare:num(fare), route:r.city, services:n, empty:Math.max(0, seats - sold) }, seats - sold);
    const was = !opts.actual && S.rnd && S.rnd.fareWas && S.rnd.fareWas[rid]; if(was && fare < was && seats && paxWant(r, was) >= seats) add('fare_too_low', { route:r.city, fare:num(fare), lost:num((was - fare) * sold) }, (was - fare) * sold); });
  svc.filter(s => s.seats && s.sold / s.seats < (T.service_weak.threshold || fillMid())).sort((a, b) => a.sold / a.seats - b.sold / b.seats).forEach(s => add('service_weak', { band:BAND_SHORT[s.band || bandOf(s.dep)] || '', route:routeById(s.route).city, empty:s.seats - s.sold, seats:s.seats }, s.seats - s.sold));
  const s0 = dayStart(), e0 = dayEnd(); pl.fleet.forEach(x => { const p = planeById(x.planeId), D = x.sched.length ? withPlan(pl, () => TIME.day(p, x.sched, undefined, x.deps || null)) : null, home = TIME.home(p);
    const busy = D ? D.trips.map((t, k) => [t.dep, k === D.trips.length - 1 ? t.arr : t.arr + home]) : [], gaps = []; let at = s0; busy.forEach(([a, z]) => { if(a > at) gaps.push([at, a]); at = Math.max(at, z); }); if(e0 > at) gaps.push([at, e0]);
    const idle = gaps.reduce((t, [a, z]) => t + (z - a), 0), big = gaps.sort((u, v) => (v[1] - v[0]) - (u[1] - u[0]))[0];
    if(idle > (T.idle_plane.threshold || 240) && big){ const mid = (big[0] + big[1]) / 2, part = mid < 720 ? 'this morning' : mid < 1020 ? 'this afternoon' : 'this evening'; hits.push({ id:'idle_plane', priority:T.idle_plane.priority, weight:idle, text:fillTip(T.idle_plane.message.replace('this afternoon', D ? part : 'all day'), { plane:shortPlane(p), hours:hoursWord(idle) }) }); }
    (D ? D.trips : []).forEach(t => { const r = routeById(t.route), leg = TIME.leg(p, r); if(leg > (T.long_leg_warning.threshold || 180)) add('long_leg_warning', { route:r.city, hours:hoursWord(leg), plane:shortPlane(p) }, leg); }); });
  const seen = new Set(), list = hits.sort((a, b) => a.priority - b.priority || b.weight - a.weight).filter(h => { if(seen.has(h.id)) return false; seen.add(h.id); return true; });
  if(!list.length){ if(svc.length && svc.every(s => s.seats && s.sold / s.seats >= fillGood() - 1e-9)) list.push({ id:'all_good', priority:9, text:T.all_good.message }); else if(!opts.actual) list.push({ id:'general_tradeoff', priority:9, text:T.general_tradeoff.message }); }
  return opts.all ? (hits.length ? hits.filter((h, q) => hits.findIndex(z => z.text === h.text) === q) : list) : list.slice(0, 2);   // opts.all: every condition that holds (the revised Studio's insights)
}

/* ---------- the live panel: passengers / seats offered, ticket revenue, profit (one figure), turned away; two tips ---------- */
function studioLive(pl, L, hid){
  const seats = L.seats || 0, pax = L.pax || 0, pct = seats ? Math.round(100 * pax / seats) : 0, tk = (L.routes || []).reduce((t, x) => t + x.tk, 0), tips = planTipsFor(pl, L);
  const fig = (ic, l, v, sub, cls) => `<div class="st-fig ${cls || ''}"><span class="st-fi">${ic}</span><span><small>${l}</small><span class="st-fv"><b class="mono">${v}</b>${sub ? `<em>${sub}</em>` : ''}</span></span></div>`;
  return `<section class="dk-pnl st-live" aria-live="polite"><div class="dk-pnl-h"><h2>Live seat fill and trade-offs</h2></div><div class="st-figs">
    ${fig(ICO2.people, 'Passengers / seats', `${num(pax)} / ${num(seats)}`, `${pct}%`)}${fig(ICO2.coin, 'Est. ticket revenue', hid.has('revenue') ? sumBtn('revenue') : money(Math.round(tk)), hid.has('revenue') ? '' : 'a day')}
    ${fig(ICO2.bars, 'Projected profit', hid.has('profit') ? sumBtn('profit') : money(Math.round(L.v.profit)), hid.has('profit') ? '' : 'a day', hid.has('profit') ? '' : L.v.profit >= 0 ? 'good' : 'bad')}${fig(ICO2.seat, 'Turned away', num(L.nos || 0), 'a day', (L.nos || 0) > 0 ? 'warn' : '')}</div>
    <ul class="st-tips">${tips.map(t => `<li data-tip="${t.id}">${ICO2.bulb}<span>${esc(t.text)}</span></li>`).join('')}</ul></section>`;
}

/* ---------- the page ---------- */
function studioStepState(pl){
  const sched = pl.fleet.flatMap(x => x.sched), was = S.rnd.fareWas || {}, d1 = sched.length > 0, d2 = d1 && (!!S.rnd.stFare || Object.keys(pl.prices).some(id => was[id] !== undefined && was[id] !== pl.prices[id])), d3 = d1 && pl.fleet.every(x => x.sched.length);
  const done = [d1, d2, d3, false], cur = done.indexOf(false); return { done, cur:cur < 0 ? 3 : cur };
}
function renderStudio(st){
  const setup = S.phase === 'setup', pl = normPlan(currentPlan()); if(setup) S.market = launchMarket(pl);
  if(!S.rnd.fareWas) S.rnd.fareWas = Object.assign({}, pl.prices);
  const L = planLines(pl), costed = !!(S.rnd.costed && S.rnd.costed.key === planKey(pl)), sched = pl.fleet.flatMap(x => x.sched), j = studioPlane(pl);
  let W = null; try{ W = workTables(pl); }catch(e){ W = null; }
  const hid = hiddenFigs(pl, W), flown = new Set(sched), all = plannerOrder(), filt = UI.stFilter || 'all';
  const ids = all.filter(id => filt === 'all' || (filt === 'mine' ? flown.has(id) : !flown.has(id))).sort((a, b) => (flown.has(b) ? 1 : 0) - (flown.has(a) ? 1 : 0));
  const selR = UI.stRoute && plannerRoutes().includes(UI.stRoute) ? UI.stRoute : null, steps = studioSteps(), ss = studioStepState(pl);
  const stepBar = `<div class="st-stepw"><ol class="st-steps">${steps.map((t, k) => `<li class="${ss.done[k] ? 'done' : ''} ${ss.cur === k ? 'cur' : ''}"><button data-ststep="${k}"><span class="st-sn">${ss.done[k] ? '✓' : k + 1}</span><span><b>${esc(t)}</b><small>${STUDIO_STEP_SUB[k]}</small></span></button></li>`).join('')}</ol><button class="btn small st-howb" id="stHow" aria-expanded="${!!UI.stHow}">${ICO2.info} How it works</button></div>`;
  const cards = `<section class="st-routes ${UI.stPulse === 0 || UI.stPulse === 1 ? 'pulse' : ''}"><div class="st-rh"><h2>Available routes and fare demand</h2><p>Times for the ${esc(shortPlane(planeById(pl.fleet[j].planeId)))} (press an aircraft below to change)</p>
      <label class="st-filt">Show <select id="stFilter"><option value="all" ${filt === 'all' ? 'selected' : ''}>All destinations</option><option value="mine" ${filt === 'mine' ? 'selected' : ''}>Routes you fly</option><option value="new" ${filt === 'new' ? 'selected' : ''}>Routes not flown yet</option></select></label></div>
    <div class="st-cards">${ids.map(id => studioCard(0, id, pl, j, id === selR)).join('') || '<p class="muted">No routes here.</p>'}</div><div class="st-more">${fuelWidgetHtml(pl, L, { hidden:hid })}</div></section>`;
  const view = UI.stView || 'day', showDem = UI.stDemand !== false, sel = UI.tlSel && UI.tlSel.i === 0 ? UI.tlSel : null, sx = sel && pl.fleet[sel.j] && pl.fleet[sel.j].sched[sel.k];
  const obSel = snacksOn() ? `<label class="st-ob">On board <select id="stOb">${Object.keys(ONBOARD).map(k => `<option value="${k}" ${(pl.onboard || 'none') === k ? 'selected' : ''}>${esc(ONBOARD[k].label)}</option>`).join('')}</select></label>` : '';
  const legend = `<div class="st-legend"><span><i class="fill-good"></i>Good fill (${Math.round(fillGood() * 100)}% or more)</span><span><i class="fill-mid"></i>Medium (${Math.round(fillMid() * 100)}–${Math.round(fillGood() * 100) - 1}%)</span><span><i class="fill-low"></i>Low (under ${Math.round(fillMid() * 100)}%)</span><span class="muted">Each block: seats filled / seats on that plane</span></div>`;
  const tt = `<section class="dk-pnl st-tt ${UI.stPulse === 2 ? 'pulse' : ''}"><div class="st-th"><div><h2 title="Drag a flight to move it, or press it to change it; Delete removes the flight you pressed. The hatched gap is the turnaround.">Aircraft timetable</h2></div>${obSel}
      <span class="plw-tools">${!setup || costed ? '<button class="btn small" id="ideaOpen" title="A test plan the model costs: no sums">Test an idea</button>' : ''}<button class="btn small" id="mapOpen" title="The network map: where the routes go">Network map</button></span>
      <span class="st-seg" role="group" aria-label="Timetable view"><button data-stview="day" aria-pressed="${view === 'day'}">Day view</button><button data-stview="table" aria-pressed="${view === 'table'}">Table view</button></span>
      <label class="st-tog"><input type="checkbox" id="stDem" ${showDem ? 'checked' : ''}> Show demand</label></div>
    ${view === 'day' ? `${showDem ? `<div class="st-stripw" id="stStrip">${stripHtml(pl, selR)}</div>` : ''}${studioLanes(0, pl, L)}` : studioTable(pl, L)}
    <div class="st-foot">${sx ? `<div class="st-sel">${tlSelHtml(0, pl, L, sel.j, sel.k)}</div>` : legend}</div></section>`;
  const how = UI.stHow ? `<div class="st-how">${steps.map((t, k) => `<p><b>${k + 1}. ${esc(t)}.</b> ${['Pick a route card and press Add to schedule: the flight goes on the selected aircraft. Press an aircraft\'s name to choose which one.', 'Press a fare on a card. The numbers are the people who want to fly each day at that fare: a higher fare earns more for each seat, but fewer people fly.', 'Drag a flight along its row, or press it for Earlier, Later, Swap route and Remove (or press the Delete key). The strip above shows when people want to fly.', 'Read the live panel: passengers against seats, the money, and the tips. Green flights are nearly full; red ones are under half full.'][k]}</p>`).join('')}<button class="dk-link" id="stHowShut">Close</button></div>` : '';
  const body = `<div class="plw st">${stepBar}${how}<div class="st-top">${cards}${studioLive(pl, L, hid)}</div>${tt}</div>`;
  const nx = `<button class="btn primary big" id="nx" ${sched.length && L.fits ? '' : 'disabled'}>${!sched.length ? 'Add some flights' : !L.fits ? "Doesn't fit in the day" : costed ? goLabel('Ready to fly') : goLabel('Cost your plan')} &#9654;</button>`;
  screen().innerHTML = shell(deskPage({ title:'Operating Plan Studio', sub:`${esc(S.airline && S.airline.name ? S.airline.name : 'Your airline')} HQ · ${setup ? 'Launch Day' : 'the week of ' + dateShort(S.day)} · choose routes, set fares, build the timetable, see the seats fill`, cls:'st-page', body }),
    deskBar('Build your plan in four steps: choose routes, set fares, place flights on the timetable, then check the seat fill. Try a higher or lower fare, or a different time, and watch the figures change.', `${backBtn()}${nx}`));
  bindStudio(pl);
}
function bindStudio(pl){
  const root = screen(); bindPlanEditor(); bindTimeline();
  root.querySelectorAll('[data-sum]').forEach(b => b.onclick = () => openSum(b.getAttribute('data-sum')));
  root.querySelectorAll('.st-card').forEach(c => { const id = c.getAttribute('data-stroute');
    c.onclick = e => { if(e.target.closest('button,select')) return; UI.stRoute = UI.stRoute === id ? null : id; render(); };
    c.onmouseenter = () => { const s = $('stStrip'); if(s) s.innerHTML = stripHtml(pl, id); };
    c.onmouseleave = () => { const s = $('stStrip'); if(s) s.innerHTML = stripHtml(pl, UI.stRoute && plannerRoutes().includes(UI.stRoute) ? UI.stRoute : null); }; });
  root.querySelectorAll('.st-card .fch').forEach(b => b.addEventListener('click', () => { S.rnd.stFare = true; UI.stRoute = b.closest('.st-card').getAttribute('data-stroute'); }, true));
  root.querySelectorAll('[data-stplane]').forEach(b => b.onclick = () => { UI.stPlane = +b.getAttribute('data-stplane'); render(); });
  root.querySelectorAll('[data-stview]').forEach(b => b.onclick = () => { UI.stView = b.getAttribute('data-stview'); render(); });
  root.querySelectorAll('[data-ststep]').forEach(b => b.onclick = () => { UI.stPulse = +b.getAttribute('data-ststep'); render(); const el = root.querySelector(UI.stPulse === 3 ? '.st-live' : UI.stPulse === 2 ? '.st-tt' : '.st-routes'); if(el) el.scrollIntoView({ block:'nearest' }); setTimeout(() => { UI.stPulse = null; }, 50); });
  const f = $('stFilter'); if(f) f.onchange = () => { UI.stFilter = f.value; render(); };
  const d = $('stDem'); if(d) d.onchange = () => { UI.stDemand = d.checked; render(); };
  const o = $('stOb'); if(o) o.onchange = () => editPlan(0, 'ob', o.value, 0);
  on('stHow', () => { UI.stHow = !UI.stHow; render(); }); on('stHowShut', () => { UI.stHow = false; render(); });
  on('ideaOpen', () => { UI.ideaOpen = true; UI.tlSel = null; render(); });
  on('mapOpen', () => { UI.view = 'network'; render(); });
  on('nx', () => { S.rnd.focusRoute = schedOf(fleetOne())[0] || S.market; UI.ideaOpen = false; UI.tlSel = null; resetEntry(); UI.justDone = null; advance(); });
}
/* a route dropped on a plane without the range: the tip says why (range_fail) */
function addService(i, id, j){
  const r = routeById(id); if(i !== 9 && r && S.rnd){ const pl = i === 9 ? testPlan() : currentPlan(), lanes = (j === null || j === undefined ? pl.fleet.map((x, q) => q) : [j]).filter(q => pl.fleet[q]);
    const bad = lanes.length && lanes.every(q => !planeCanFly(planeById(pl.fleet[q].planeId), r)); if(bad) S.rnd.stRange = { route:id, plane:pl.fleet[lanes[0]].planeId }; else delete S.rnd.stRange; }
  return addServiceBase(i, id, j);
}

/* ---------- the Sunday review: the same three figures as actuals, and the same conditions to explain missed profit ---------- */
function seatFillReviewHtml(h){
  if(!h || !h.routes) return ''; const R = Object.values(h.routes), seats = R.reduce((t, x) => t + (x.seats || 0), 0), pax = R.reduce((t, x) => t + (x.pax || 0), 0), away = R.reduce((t, x) => t + Math.max(0, (x.want || x.pax || 0) - (x.pax || 0)), 0);
  if(!seats) return ''; const pl = currentPlan(), days = Math.max(1, (h.to || h.from || 0) - (h.from || 0) + 1), routes = {};
  Object.entries(h.routes).forEach(([id, x]) => { routes[id] = { want:Math.round((x.want || x.pax || 0) / days), pax:Math.round((x.pax || 0) / days), seats:Math.round((x.seats || 0) / days) }; });
  const L = typeof atDay === 'function' && h.from ? atDay(h.from, () => planLines(pl)) : planLines(pl), tips = planTipsFor(pl, L, { actual:true, routes });
  return `<section class="dk-pnl st-rv"><div class="dk-pnl-h">${ICO2.route || ''}<h2>Seat fill</h2><span class="grow"></span><span class="sub">what happened</span></div><div class="st-rvf">
    <span><small>Seats filled</small><b class="mono">${num(pax)} / ${num(seats)}</b><em>${Math.round(100 * pax / seats)}%</em></span><span><small>Empty seats</small><b class="mono">${num(seats - pax)}</b></span><span><small>Turned away</small><b class="mono ${away ? 'warn' : ''}">${num(away)}</b><em>wanted to fly, no seat</em></span></div>
    ${tips.length ? `<ul class="st-tips">${tips.map(t => `<li data-tip="${t.id}">${ICO2.bulb}<span>${esc(t.text)}</span></li>`).join('')}</ul>` : ''}</section>`;
}
/* for the tests and the report: the panel's figures and tips as numbers */
function studioReport(){ const pl = currentPlan(), L = planLines(pl); return { pax:L.pax, seats:L.seats, revenue:Math.round((L.routes || []).reduce((t, x) => t + x.tk, 0)), profit:Math.round(L.v.profit), away:L.nos || 0, tips:planTipsFor(pl, L).map(t => t.id),
  services:(L.services || []).map(s => ({ route:s.route, sold:s.sold, seats:s.seats, fill:fillCls(s.sold, s.seats) })), cards:plannerRoutes().map(id => { const r = routeById(id); return { id, fares:(r.fares || [r.basePrice]).map(f => [f, paxWant(r, f)]) }; }) }; }
