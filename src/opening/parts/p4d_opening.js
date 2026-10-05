/* ==================================================================
   OPENING PROTOTYPE (Opening Game Vertical Slice brief).
   Launch day teaches each system by SHOW → TRY → RUN → EXPLAIN; Days 1–3 hand the
   same tools back with less help, and Day 3 is the first real network decision.
   ================================================================== */
Object.assign(FRAME_TITLES, { starter:'Your start-up aircraft', market:'Your first market', demand:'The market', rotation:'One service', timetable:'Build the timetable', fareTry:'Set the fare', fuelPlan:'Fuel', dayForecast:'Forecast', planner:"Today's operation" });

/* 0 = launch day (most help) … 3 = Day 3 (normal play). */
function scaffold(){ return S.phase === 'setup' ? 0 : Math.min(3, S.round || 1); }
function fleetOne(){ return S.fleet[0]; }
function ourPlane(){ return planeById((S.fleet[0] || { planeId:'dhc6' }).planeId); }
function otherRoute(){ return WORLD.setupRoutes.find(id => id !== S.market); }
/* The routes the pupil can schedule today: the first market, and from Day 3 the other one too. */
function plannerRoutes(){ return S.round >= 3 ? [S.market, otherRoute()] : [S.market]; }
function serviceCounts(sched){ const c = {}; sched.forEach(id => { c[id] = (c[id] || 0) + 1; }); return c; }
/* A timetable from counts, the first market's services first. */
function schedFrom(counts){ const out = []; [S.market, otherRoute()].forEach(id => { for(let k = 0; k < (counts[id] || 0); k++) out.push(id); }); return out; }
function schedFits(sched){ return sched.length <= (WORLD.maxTrips || 4) && TIME.fits(ourPlane(), sched); }
function svcLabel(sched){ const c = serviceCounts(sched); return Object.keys(c).map(id => `${routeById(id).city} ×${c[id]}`).join(' + ') || 'No services'; }
function wantOf(id){ const r = routeById(id); return paxFor(r, fareOf(id)); }
function capLine(want, seats){
  if(!seats) return `${want} people want to fly · no services yet`;
  return seats >= want ? `${seats} seats for ${want} people · <b>${seats - want}</b> empty seat${seats - want === 1 ? '' : 's'}` : `${seats} seats for ${want} people · <b class="orange">${want - seats}</b> without a seat`;
}

/* Passengers in aircraft-sized groups: 45 people and 19 seats → 19 | 19 | 7.
   With services given, the groups the timetable carries light up and the rest have no seat. */
function paxGroups(people, seats, services, o){
  o = o || {};
  const groups = []; let left = people;
  while(left > 0){ groups.push(Math.min(seats, left)); left -= seats; }
  const n = services === undefined ? groups.length : Math.max(groups.length, services);
  let html = '';
  for(let k = 0; k < n; k++){
    const g = groups[k] || 0, shown = services === undefined ? 'plane' : k < services ? 'flown' : 'nos';
    const slots = shown === 'nos' ? g : seats;
    const lab = shown === 'plane' ? (g === seats ? 'a full plane' : `${g} of ${seats}`) : shown === 'flown' ? (o.times && o.times[k] !== undefined ? `Service ${k+1} · ${fmtTime(o.times[k])}` : g >= seats ? `Service ${k+1} · full` : `Service ${k+1} · ${seats - g} empty`) : 'No seat';
    const fig = shown === 'flown' ? `<b class="mono">${g}</b><span class="pg-of">/ ${seats}</span>` : `<b class="mono">${g}</b>`;
    html += `<div class="pg ${shown}"><div class="pg-dots">${Array.from({ length:slots }, (_, i) => `<i class="${i < g ? 'p' : 'e'}"></i>`).join('')}</div><div class="pg-foot">${fig}<span>${lab}</span></div></div>`;
  }
  return `<div class="pgroups ${o.big ? 'big' : ''} ${o.small ? 'small' : ''}">${html}</div>`;
}

function paxKey(){ return '<span class="pkey"><span><i class="p"></i>Expected passenger</span><span><i class="e"></i>Empty seat</span><span><i class="n"></i>No seat</span></span>'; }
/* ---------- optional help: opens in the dock beside the task (the full-screen card only where there is no dock) ---------- */
const HELP = { timing:'How scheduling works', demand:'Demand', fuel:'Fuel', money:'Revenue and profit', forecast:'Forecast' };
function helpChip(topic, label){ return `<button class="hchip" data-help="${topic}">? ${esc(label || HELP[topic])}</button>`; }
document.addEventListener('click', e => {
  const b = e.target && e.target.closest ? e.target.closest('[data-help]') : null;
  if(!b || IS_DISPLAY || !S) return;
  const topic = b.getAttribute('data-help');
  if(screen().querySelector('.dock')){ UI.dock = { mode:'help', topic }; render(); return; }
  S.overlay = { type:'help', topic }; render();
});
function helpBody(topic){
  const r = routeById(S.market || 'par'), p = ourPlane();
  if(topic === 'timing'){ const D = TIME.day(p, [r.id, r.id]); return rotationBar(D, 6, r) + `<ul class="help-l"><li>A service is: fly out, a turnaround, fly back, then a turnaround at home.</li><li>Turnaround: passengers off and on, bags unloaded and loaded, the aircraft checked.</li><li>The aircraft can fly from ${WORLD.dayStart} until ${WORLD.dayEnd}. A service that would end later won't fit.</li></ul>`; }
  if(topic === 'demand') return `<ul class="help-l"><li>Demand is how many people want to fly on a route today.</li><li>Lower fares usually attract more passengers. Higher fares earn more from each ticket.</li><li>One aircraft can only carry its seats on each service. People without a seat don't fly.</li></ul>` +
    `<div class="help-fares">${plannerRoutes().map(id => { const x = routeById(id); return `<div><b>${flagSvg(x.flag, 22)} ${esc(x.city)}</b>${(x.fares || [x.basePrice]).map(f => `<span>${money(f)} → <b class="mono">${paxFor(x, f)}</b> people</span>`).join('')}</div>`; }).join('')}</div>`;
  if(topic === 'fuel') return `<ul class="help-l"><li>More flying needs more fuel. Fuel costs money.</li>${plannerRoutes().map(id => { const x = routeById(id); return `<li>Each ${esc(x.city)} service uses <b class="mono">${num(fuelForTrip(p, x))} L</b> (there and back).</li>`; }).join('')}<li>Fuel is sold in ${num(WORLD.fuelLot)} L lots. Fuel you don't use stays in the tank for tomorrow.</li><li>The price changes from day to day. Buying extra when it is cheap can save money later.</li></ul>`;
  if(topic === 'money') return `<div class="rcp-def"><div><b>Revenue</b><span>Money received from ticket sales.</span></div><div><b>Costs</b><span>Money spent operating the airline: running each flight, fuel, and the aircraft's daily cost.</span></div><div><b>Profit</b><span>Money remaining after costs. Revenue − costs = profit.</span></div></div>`;
  if(topic === 'forecast') return `<ul class="help-l"><li>A forecast is what we think will happen.</li><li>After the flights, we compare it with what actually happened.</li><li>If they differ, the results explain why.</li></ul>`;
  return '';
}
function helpHtml(topic){ return `<div class="card stack help-card">${header(HELP[topic] || 'Help', null, 'HELP')}${helpBody(topic)}<div class="actions"><button class="btn primary big" id="hClose">Back &#9654;</button></div></div>`; }

/* ==================================================================
   SETUP: the start-up aircraft and the first market
   ================================================================== */
R.starter = () => {
  const p = planeById('dhc6'), owned = S.fleet.length > 0, rs = WORLD.setupRoutes.map(routeById).sort((a, b) => routeKm(b) - routeKm(a));
  const spec = (big, label, text) => `<div class="spec"><span class="label">${label}</span><b class="mono">${big}</b><p>${text}</p></div>`;
  screen().innerHTML = taskFrame({ question:'Your start-up aircraft', work:false, context: ctxHomeBase(),
    story:[`Every airline starts somewhere. Yours starts with one ${esc(p.name)}.`],
    say:`Your start-up aircraft is the ${p.name}. ${p.seats} seats. ${p.speed} kilometres an hour. A range of ${p.range} kilometres. It costs ${money(p.hourCost)} for every hour in the air, plus a landing fee at each end of the flight, and ${money(p.dayCost)} a day.`,
    main:`<div class="starter"><div class="st-plane"><svg class="preview-plane" viewBox="0 0 120 48" style="fill:var(--c1)"><use href="#pl-${p.icon}"/></svg>${finSvg(S.airline.fin, 56)}<b>${esc(p.name)}</b><span class="muted">${esc(p.fact)}</span></div>
      <div class="specs4">${spec(p.seats, 'Seats', `Up to ${p.seats} passengers on every flight.`)}
        ${spec(num(p.speed) + ' km/h', 'Speed', rs.map(r => `${esc(r.city)} (${num(routeKm(r))} km): ${fmtDur(TIME.leg(p, r))} each way.`).join(' '))}
        ${spec(num(p.range) + ' km', 'Range', 'How far it can fly before it must land. Both first markets are well within reach.')}
        ${spec(money(p.hourCost) + ' an hour', 'Cost to operate', `Each hour in the air, plus landing fees at both ends (${money(homeData().fee)} at ${esc(homeData().code)}): ${rs.map(r => `${esc(r.city)} <b>${money(runCostOf(p, r))}</b>`).join(', ')} a service. Plus <b>${money(p.dayCost)} a day</b>. Fuel is extra.`)}</div></div>`,
    foot:`<span class="muted grow">${owned ? 'Delivered to ' + esc(homeData().code) : `Price <b class="mono gold">${money(p.price)}</b>${p.listPrice > p.price ? ` <span class="muted">launch deal (normally ${money(p.listPrice)})</span>` : ''}`}</span><button class="btn primary big" id="nx">${owned ? goLabel('Next') : 'Take delivery'} &#9654;</button>` });
  on('nx', () => { if(!S.fleet.length) buyPlane(p); advance(); });
};
R.market = () => {
  const p = ourPlane(), ids = WORLD.setupRoutes.slice().sort((a, b) => routeKm(routeById(b)) - routeKm(routeById(a)));
  screen().innerHTML = taskFrame({ question:'Choose your first market', work:false, story:['Where will your airline fly first?'], context: ctxMarkets(),
    say:'Choose your first market. ' + ids.map(id => { const r = routeById(id); return `${r.city}: ${paxFor(r, r.basePrice)} people a day at ${money(r.basePrice)}, ${fmtDur(TIME.leg(p, r))} each way.`; }).join(' '),
    main:`<div class="mkts">${ids.map(id => { const r = routeById(id);
      return `<button class="mkt ${S.market === id ? 'on' : ''}" data-mk="${id}" aria-pressed="${S.market === id}"><span class="row">${flagSvg(r.flag, 40)}<b class="mk-city">${esc(r.city)}</b></span>
        <span class="mk-fig"><b class="mono">${paxFor(r, r.basePrice)}</b> people a day</span>
        <span class="mk-row"><span>Normal fare <b class="mono">${money(r.basePrice)}</b></span><span>Flight <b class="mono">${fmtDur(TIME.leg(p, r))}</b> each way</span><span><b class="mono">${num(routeKm(r))} km</b></span></span>
        <span class="muted">${esc(r.blurb)}</span></button>`; }).join('')}</div>`,
    foot:`<button class="btn primary big" id="nx" ${S.market ? '' : 'disabled'}>${S.market ? goLabel(`Open ${esc(routeById(S.market).city)}`) : 'Choose a market'} &#9654;</button>` });
  screen().querySelectorAll('[data-mk]').forEach(b => b.onclick = () => { const id = b.getAttribute('data-mk'); S.market = id; S.prices = { [id]: routeById(id).basePrice }; const f = fleetOne(); if(f) f.schedule = []; render(); });
  on('nx', () => { const f = fleetOne(); S.rnd.featured = f.uid; S.rnd.focusRoute = S.market; advance(); });
};

/* ==================================================================
   LAUNCH DAY: SHOW the market, SHOW one service, TRY a timetable, TRY a fare
   ================================================================== */
R.demand = () => {
  const r = routeById(S.market), p = ourPlane(), want = wantOf(r.id), groups = []; for(let left = want; left > 0; left -= p.seats) groups.push(Math.min(p.seats, left));
  screen().innerHTML = taskFrame({ question:`${want} people want to fly to ${esc(r.city)} today`, work:false, context: ctxDemand(),
    story:[`Your aircraft has ${p.seats} seats. One flight can't carry everyone.`, 'But your aircraft can return and fly again. Airlines often run several services to the same place each day.'],
    say:`${want} people want to fly to ${r.city} today. Your aircraft has ${p.seats} seats. In aircraft-sized groups that is ${groups.join(', ')}. Your aircraft can return and fly again.`,
    main:`<div class="dm"><div class="dm-top"><div class="dm-big"><span class="label">${flagSvg(r.flag, 22)} ${esc(r.city)}</span><b class="mono">${want}</b><span>people want to travel today</span></div>
      <div class="dm-big ac"><span class="label">Your aircraft</span><b class="mono">${p.seats}</b><span>seats</span></div>
      <div class="dm-eq"><span class="label">In aircraft-sized groups</span><b class="mono">${groups.join(' <i>|</i> ')}</b></div></div>
      ${paxGroups(want, p.seats, undefined, { big:true })}</div>`,
    foot:`<button class="btn primary big" id="nx">${goLabel('How long does one service take?')} &#9654;</button>` });
  on('nx', advance);
};
/* One service drawn to scale: out, turnaround away, back, turnaround at home. k = how much is shown. */
function rotationBar(D, k, r){
  const t = D.trips[0], home = D.segments.find(s => s.kind === 'home'), ready = home ? home.end : t.arr + TIME.home(ourPlane());
  const a = t.dep - 30, b = ready + 30, X = m => (100 * (m - a) / (b - a)).toFixed(2), W = (s, e) => (100 * (e - s) / (b - a)).toFixed(2);
  const blocks = [['out', t.dep, t.arriveAway, 'Flying', 1], ['turn', t.arriveAway, t.leaveAway, 'Turnaround', 2], ['back', t.leaveAway, t.arr, 'Flying', 3], ['home', t.arr, ready, 'Turnaround', 5]];
  const where = { out:`to ${r.city}`, turn:`at ${r.city}`, back:`to ${homeData().city}`, home:`at ${homeData().city}` };
  const marks = [[t.dep, `Depart ${homeData().city}`, 0], [t.arriveAway, `Arrive ${r.city}`, 1], [t.leaveAway, `Leave ${r.city}`, 2], [t.arr, `Back in ${homeData().city}`, 3], [ready, 'Ready again', 5]];
  let ticks = ''; for(let m = Math.ceil(a / 60) * 60; m <= b - 20; m += 60) ticks += `<span style="left:${X(m)}%">${fmtTime(m)}</span>`;
  return `<div class="rot"><div class="rot-axis">${ticks}</div><div class="rot-bar">${blocks.map(([c, s, e, l, at]) => k >= at ? `<i class="rb ${c} ${at === k ? 'new' : ''}" style="left:${X(s)}%;width:${W(s, e)}%"><span>${l}<small>${esc(where[c])} · ${fmtDur(e - s)}</small></span></i>` : '').join('')}</div>
    <div class="rot-marks">${marks.map(([m, l, at], i) => k >= at ? `<span class="rm ${i % 2 ? 'low' : ''} ${at === 5 ? 'ready' : ''}" style="left:${X(m)}%"><b class="mono">${fmtTime(m)}</b>${esc(l)}</span>` : '').join('')}</div></div>`;
}
/* Airport codes for the route strip. */
function aptCode(r){ return r.code || ({ par:'CDG', dub:'DUB' })[r.id] || String(r.city || '').slice(0, 3).toUpperCase(); }
/* One service as an operations sequence: the route strip, the stage indicator, the timeline, the note. */
R.rotation = st => {
  const r = routeById(S.market), p = ourPlane(), D = TIME.day(p, [r.id, r.id]), t = D.trips[0], home = D.segments.find(s => s.kind === 'home'), ready = home.end, k = st.k || 0;
  const turnA = t.leaveAway - t.arriveAway, turnH = ready - t.arr, flying = (t.arriveAway - t.dep) + (t.arr - t.leaveAway), H = homeData().code, A = aptCode(r);
  const notes = [
    [`${fmtTime(t.dep)} · Depart ${homeData().city}`, [`Passengers are on board. The aircraft takes off for ${r.city}.`]],
    [`${fmtTime(t.arriveAway)} · Arrive ${r.city}`, [`${num(routeKm(r))} km at ${num(p.speed)} km/h takes ${fmtDur(t.arriveAway - t.dep)}.`]],
    [`Turnaround in ${r.city} · ${fmtDur(turnA)}`, ['Passengers get off. New passengers board.', 'Bags are unloaded and loaded.', 'The aircraft is checked and prepared.', 'Then it can fly again.']],
    [`${fmtTime(t.leaveAway)} · Leave ${r.city} · ${fmtTime(t.arr)} · Back in ${homeData().city}`, [`Another ${fmtDur(t.arr - t.leaveAway)} in the air.`]],
    ['When is it ready to fly again?', [`It lands at ${fmtTime(t.arr)}. At ${esc(terminalData().name || homeData().city)} the turnaround takes ${fmtDur(turnH)}${turnH !== turnA ? ` (in ${esc(r.city)} it took ${fmtDur(turnA)})` : `, the same as in ${esc(r.city)}`}.`]],
    [`${fmtTime(ready)} · Ready again`, [`In the air: <b>${fmtDur(flying)}</b>. Aircraft busy: <b>${fmtDur(ready - t.dep)}</b>, from ${fmtTime(t.dep)} until ${fmtTime(ready)}.`, 'Flight time is not the same as the time the aircraft is used.']]];
  const n = notes[k], q = k === 4, fin = k === 5, opts = [ready - 15, ready, ready + 15];
  const stage = fin ? 4 : k <= 1 ? 0 : k === 2 ? 1 : k === 3 ? 2 : 3;
  const stages = ['Outbound', 'Turnaround', 'Return', 'Ready again'].map((l, i) => `<li class="${i < stage ? 'done' : i === stage ? 'on' : ''}"><i>${i < stage ? '✓' : i === stage ? '●' : ''}</i>${l}</li>`).join('');
  const strip = `<div class="rstrip"><b class="mono rs-t">${fmtTime(t.dep)}</b><span class="rs-a mono">${H}</span><i class="rs-l ${k >= 1 ? 'on' : 'go'}"></i><span class="rs-a mono ${k >= 1 ? 'lit' : ''}">${A}</span><i class="rs-l ${k >= 3 ? 'on' : k === 2 ? 'wait' : ''}"></i><span class="rs-a mono ${k >= 3 ? 'lit' : ''}">${H}</span><span class="rs-ready mono ${fin ? 'on' : ''}">● READY ${fin ? fmtTime(ready) : '--:--'}</span></div>`;
  const body = fin ? `<div class="ready-big"><span class="label">Ready again</span><b class="mono">${fmtTime(ready)}</b><p>The ${esc(p.name.replace(/^DHC-6 /, ''))} can begin another service from ${esc(homeData().city)} at ${fmtTime(ready)}.</p><p class="muted">${n[1].join(' ')}</p></div>`
    : `<div class="rot-note ${k === 2 ? 'turn' : ''}"><h3>${esc(n[0])}</h3>${n[1].map(l => `<p>${l}</p>`).join('')}
      ${q ? `<div class="rot-q">${opts.map(m => `<button class="btn big mono" data-rq="${m}">${fmtTime(m)}</button>`).join('')}</div><p class="msg" id="rqMsg">${esc(st.msg || '')}</p>` : ''}</div>`;
  screen().innerHTML = taskFrame({ question:`One ${esc(r.city)} service, start to finish`, work:false,
    say: n[0] + '. ' + n[1].join(' ').replace(/<[^>]+>/g, ''),
    context: ctxTiming(k),
    main: `${strip}<ol class="rot-stages">${stages}</ol>` + rotationBar(D, q ? 3 : k, r) + body,
    foot:`${k > 0 ? '<button class="btn big" id="rBack">&#9664; Back</button>' : ''}<span class="grow"></span>${q ? '' : `<button class="btn primary big" id="nx">${fin ? goLabel('Build the day') : 'Next'} &#9654;</button>`}` });
  on('rBack', () => { st.k = k - 1; st.msg = ''; render(); });
  on('nx', () => { if(k < notes.length - 1){ st.k = k + 1; render(); } else advance(); });
  screen().querySelectorAll('[data-rq]').forEach(b => b.onclick = () => { if(+b.getAttribute('data-rq') === ready){ st.k = 5; st.msg = ''; } else st.msg = `That time doesn't match. Start at ${fmtTime(t.arr)} and add the ${fmtDur(turnH)} turnaround.`; render(); });
};
/* Service buttons for one route: ×1, ×2, ×3… with when the day would end. */
function serviceButtons(rid, sched){
  const p = ourPlane(), r = routeById(rid), counts = serviceCounts(sched), others = sched.filter(id => id !== rid), out = [];
  for(let k = 1; k <= (WORLD.maxTrips || 4); k++){
    const c = Object.assign({}, counts, { [rid]:k }), s = schedFrom(c), fits = schedFits(s), end = TIME.day(p, s).end;
    out.push(`<button class="svc ${counts[rid] === k ? 'on' : ''}" data-svc="${rid}|${k}" aria-pressed="${counts[rid] === k}" ${fits ? '' : 'disabled'}><b>${esc(r.city)} ×${k}</b><span class="mono">${k * p.seats} seats</span><small>${fits ? `day ends ${fmtTime(end)}` : `won't fit: ends ${fmtTime(end % 1440)}${end >= 1440 ? ' next day' : ''}`}</small></button>`);
    if(!fits && others.length === 0) break;
  }
  return `<div class="svcs">${out.join('')}</div>`;
}
function bindServices(){
  screen().querySelectorAll('[data-svc]').forEach(b => b.onclick = () => {
    const [rid, k] = b.getAttribute('data-svc').split('|'), f = fleetOne(), c = serviceCounts(schedOf(f)); c[rid] = +k; const s = schedFrom(c);
    if(schedFits(s)){ setSchedule(f.uid, s); render(); } });
}
/* The operating day, one row per service: out, turnaround, back, then ready again (as on an airline's ops screen). */
function serviceGantt(sched, o){
  o = o || {}; const p = ourPlane(), D = TIME.day(p, sched), H = homeData().code;
  const trips = D.trips.map(t => Object.assign({ ready: t.arr + TIME.home(p) }, t));
  const lo = o.full || !trips.length ? dayStart() : Math.floor((trips[0].dep - 45) / 60) * 60, hi = o.full || !trips.length ? dayEnd() : Math.max(lo + 8 * 60, Math.ceil((trips[trips.length - 1].ready + 50) / 60) * 60);
  const X = m => (100 * (m - lo) / (hi - lo)).toFixed(2), Wd = (a, b) => (100 * (b - a) / (hi - lo)).toFixed(2), step = (hi - lo) > 12 * 60 ? 120 : 60;
  const blk = (cls, a, b, t1, t2, short) => { const w = +Wd(a, b), turn = /turn/.test(cls), inner = w >= 11.5 ? `<b>${t1}</b><small>${t2}</small>` : turn ? (w >= 5 ? `<small>${t2}</small>` : '') : `<b>${w >= 8.5 ? t1 : short}</b>`;
    return `<i class="sg-b ${cls}" style="left:${X(a)}%;width:${w}%" title="${t1} · ${t2}">${inner}</i>`; };
  let ticks = ''; for(let m = Math.ceil(lo / step) * step; m < hi; m += step) ticks += `<span style="left:${X(m)}%">${fmtTime(m)}</span>`;
  const rows = trips.map((t, i) => { const r = routeById(t.route), A = aptCode(r), late = t.arr > dayEnd();
    return `<div class="sg-row"><span class="sg-l">Service ${i + 1}${sched.length > 1 && new Set(sched).size > 1 ? `<small>${esc(r.city)}</small>` : ''}</span><div class="sg-tr">
      ${blk('fly', t.dep, t.arriveAway, `${H} → ${A}`, `${fmtTime(t.dep)} – ${fmtTime(t.arriveAway)}`, A)}${blk('turn', t.arriveAway, t.leaveAway, 'Turnaround', fmtDur(t.leaveAway - t.arriveAway))}${blk('fly', t.leaveAway, t.arr, `${A} → ${H}`, `${fmtTime(t.leaveAway)} – ${fmtTimeDay(t.arr)}`, H)}
      ${i < trips.length - 1 ? blk('turn home', t.arr, Math.min(t.ready, hi), 'Turnaround', fmtDur(t.ready - t.arr)) : `<i class="sg-b rdy ${late ? 'late' : ''}" style="${+X(t.arr) > 80 ? 'right:0' : `left:${X(t.arr)}%`}"><b>${late ? 'Past closing' : 'Ready again'}</b><small>${fmtTimeDay(t.ready)}</small></i>`}</div></div>`; }).join('');
  return `<div class="sgantt ${o.full ? 'full' : ''}"><div class="sg-ax"><span class="sg-l"></span><div class="sg-tk">${ticks}</div></div>${rows || `<div class="sg-row empty"><span class="sg-l">No services</span><div class="sg-tr"><small>The operating day is ${WORLD.dayStart}–${WORLD.dayEnd}. Add a service below.</small></div></div>`}</div>`;
}
R.timetable = () => {
  const r = routeById(S.market), p = ourPlane(), f = fleetOne(), sched = schedOf(f), n = sched.length, want = wantOf(r.id);
  screen().innerHTML = taskFrame({ question:'What timetable do you want to run?', work:false,
    story:[`The airport is open ${WORLD.dayStart} to ${WORLD.dayEnd}. Each service fills more of the aircraft's day.`, 'You don\'t have to carry everyone. Is a service worth flying if only a few people are on it?'],
    say:`What timetable do you want to run? ${want} people want to fly to ${r.city}. Each service has ${p.seats} seats.`,
    context: ctxAircraft(), help:['timing'],
    main:`<div class="tt"><section class="pnl"><div class="pnl-h"><h3>Operating day · ${n ? esc(svcLabel(sched)) : 'no services yet'}</h3><span class="muted">${WORLD.dayStart}–${WORLD.dayEnd}</span></div>${serviceGantt(sched, { full:true })}</section>
      <section class="pnl"><div class="pnl-h"><h3>Services to ${esc(r.city)}</h3><span class="muted">${capLine(want, n * p.seats)}</span></div>${serviceButtons(r.id, sched)}</section>
      <section class="pnl"><div class="pnl-h"><h3>Expected passengers per service</h3>${paxKey()}</div>${paxGroups(want, p.seats, n, { times:TIME.day(p, sched).trips.map(x => x.dep) })}</section></div>`,
    foot:`<button class="btn primary big" id="nx" ${n ? '' : 'disabled'}>${n ? goLabel(`Run ${esc(svcLabel(sched))}`) : 'Choose a timetable'} &#9654;</button>` });
  bindServices(); on('nx', () => { costingCheck(); advance(); });
};
/* The fare: the timetable is already decided, so it appears here as the current plan (with Edit), never as a second selector. */
R.fareTry = () => {
  const r = routeById(S.market), p = ourPlane(), f = fleetOne(), sched = schedOf(f), n = sched.length, fare = fareOf(r.id), want = wantOf(r.id), seats = n * p.seats, d = seats - want;
  screen().innerHTML = taskFrame({ question:`What fare will you charge for ${esc(r.city)}?`, work:false,
    story:['Lower fares usually attract more passengers. Higher fares earn more from each ticket.', 'Neither is automatically better. Watch the passengers and the seats.'],
    say:`What fare will you charge? At ${money(fare)}, ${want} people want to fly. Lower fares usually attract more passengers. Higher fares earn more from each ticket.`,
    context: ctxMarket(), help:['demand'],
    main:`<div class="build"><section class="pnl"><div class="pnl-h"><h3>Operating day · ${plural(n, 'service')} to ${esc(r.city)}</h3><button class="btn" data-edit="timetable">Edit timetable</button></div>${serviceGantt(sched)}</section>
      <div class="pnl-2"><section class="pnl"><div class="pnl-h"><h3>Set the fare</h3></div><div class="fares">${(r.fares || [r.basePrice]).map(x => `<button class="fare ${x === fare ? 'on' : ''}" data-fare="${x}" aria-pressed="${x === fare}"><b class="mono">${money(x)}</b><span>${paxFor(r, x)} pax</span></button>`).join('')}</div></section>
        <section class="pnl curplan"><div class="pnl-h"><h3>Current plan summary</h3></div><div class="sumi">
          <div>${ICON.fleet}<b>${esc(r.city)} ×${n}</b><small>services a day</small></div><div>${ICON.seat}<b class="mono">${seats}</b><small>seats in total</small></div>
          <div>${ICON.pax}<b class="mono">${Math.min(want, seats)}</b><small>passengers expected</small></div><div class="${d < 0 ? 'nos' : ''}">${ICON.seat}<b class="mono">${Math.abs(d)}</b><small>${d >= 0 ? 'empty seats' : 'without a seat'}</small></div></div></section></div>
      <section class="pnl"><div class="pnl-h"><h3>Expected passengers per service</h3>${paxKey()}</div>${paxGroups(want, p.seats, n, { times:TIME.day(p, sched).trips.map(x => x.dep) })}</section></div>`,
    foot:`<button class="btn primary big" id="nx">${goLabel(`Charge ${money(fare)}`)} &#9654;</button>` });
  screen().querySelectorAll('[data-fare]').forEach(b => b.onclick = () => { S.prices[r.id] = +b.getAttribute('data-fare'); refreshPlan(); render(); });
  on('nx', advance);
};

/* ==================================================================
   FUEL and FORECAST (launch day and every day). Fuel is an ORDER: nothing is paid until Start operations.
   ================================================================== */
function orderL(){ return S.rnd.fuelOrder ? S.rnd.fuelOrder.litres : 0; }
function rateWithOrder(){ const o = S.rnd.fuelOrder, L = S.fuel + (o ? o.litres : 0); return L > 0 ? (S.fuelValue + (o ? o.total : 0)) / L : fuelPrice(); }
/* One column per route: passengers, fare, revenue, on-board, flight costs, fuel, terminal charges, route profit. */
function forecastCols(){
  const fl = planFlights(), X = dayExtras(fl), rate = rateWithOrder(), by = {};
  fl.forEach(f => { if(f.grounded) return; const x = by[f.route] || (by[f.route] = { pax:0, fare:f.price, run:0, fuelL:0, term:0, n:0 }); x.pax += f.sold; x.run += f.runCost; x.fuelL += f.fuelL; x.term += f.termCost || 0; x.n++; });
  return Object.keys(by).map(id => { const x = by[id], r = routeById(id), b = X.byRoute[id] || { obRev:0, obCost:0 }, revenue = x.pax * x.fare, fuel = Math.round(x.fuelL * rate), cost = x.run + fuel + x.term + b.obCost;
    return { id, label:r.city, flag:r.flag, sub:plural(x.n, 'service'), values:{ pax:x.pax, fare:x.fare, revenue, onboard:b.obRev, run:x.run, fuel, term:x.term, cost, profit:revenue + b.obRev - cost } }; });
}
R.dayForecast = () => {
  const sc = scaffold(), cols = forecastCols(), ctx = ['launch', 'day1', 'day2', 'day3'][sc], X = dayExtras(planFlights());
  const t = ensureTable('dayfc:' + S.day, 'dayForecast', cols, { context:ctx }), done = tableComplete(t), over = fleetDayCost();
  const routeP = cols.reduce((s, c) => s + c.values.profit, 0), dayP = routeP - over - X.crew;
  const sum = `<div class="fc-sum">${cols.map(c => `<span>${esc(c.label)} route profit <b class="mono">${money(c.values.profit)}</b></span>`).join('')}<span>− aircraft's day cost <b class="mono">${money(over)}</b></span>${X.crew ? `<span>− second crew <b class="mono">${money(X.crew)}</b></span>` : ''}<span class="fc-total">Expected profit today <b class="mono ${dayP >= 0 ? 'green' : 'red'}">${money(dayP)}</b></span>${sc === 0 ? '<p class="muted">Tonight we will compare this with what actually happened.</p>' : ''}</div>`;
  screen().innerHTML = taskFrame({ question:'What do you expect to happen today?', back: sc > 0,
    story: sc === 0 ? ['A forecast is what we think will happen. After the flights, we will compare it with what actually happened.'] : [],
    say:'What do you expect to happen today? A forecast is what we think will happen.',
    main: tableHtml(t), side: done ? sum : sideHtml(t),
    foot: `${sc > 0 ? helpChip('forecast') + helpChip('money') : ''}<span class="grow"></span>${done ? '<button class="btn primary huge" id="startOps">Start operations &#9654;</button>' : ''}` });
  bindTable(t); bindFrame(() => { S.si = Math.max(0, S.si - 2); resetEntry(); render(); });
  on('startOps', () => {
    S.rnd.myForecast = { profit:dayP, revenue:cols.reduce((s, c) => s + c.values.revenue + c.values.onboard, 0), run:cols.reduce((s, c) => s + c.values.run + c.values.term + (c.values.cost - c.values.run - c.values.fuel - c.values.term), 0), fuel:cols.reduce((s, c) => s + c.values.fuel, 0), over, crew:X.crew };
    const o = S.rnd.fuelOrder; if(o){ buyFuel(o.litres, o.price); S.rnd.fuelOrder = null; }   // the order is paid now
    resetEntry(); UI.view = null; next(); });
};

/* ==================================================================
   DAYS 1–3: HQ → today's operation → fuel → forecast → operations → results
   ================================================================== */
function startProtoDay(n){
  S.round = n; S.phase = 'round'; S.day = beatDay(n); delete S.needsRestart;
  const f = fleetOne(), w = roundData(n);
  S.rnd = Object.assign(emptyRnd(), { featured:f.uid, focusRoute:schedOf(f)[0] || S.market, headline:w.headline || '', brief:protoBrief(n) });
  S.period = newPeriod('day', S.day);
  S.steps = [{ t:'hq' }, { t:'planner' }, { t:'options' }, { t:'fuelPlan' }, { t:'ready' }, { t:'fly' }, { t:'results' }];
  S.rnd.cashStart = S.cash; UI.view = null;
  S.si = 0; S.newRoutes = [];
  refreshPlan();
  addNews((w.news || []).slice(0, 2).map(t => ({ tag:'NEWS', text:t })));
  publish(); render();
}
/* One factual line for the briefing: what happened, never what to do. */
function protoBrief(n){
  const h = lastDay(), fp = fuelPrice(n), fy = fuelPrice(n - 1), L = [];
  if(h) L.push(`${h.type === 'setup' ? 'Launch day' : 'Yesterday'}: ${h.pax} passengers flew, ${h.profit >= 0 ? 'profit' : 'loss'} ${money(Math.round(Math.abs(h.profit)))}. The details are in Route performance.`);
  if(fp !== fy) L.push(`Fuel is ${priceL(fp)} a litre today (was ${priceL(fy)}).`);
  if(roundData(n).opportunity){ const o = routeById(otherRoute()); if(o) L.push(`${o.city} is a new market for the airline. See Intelligence.`); }
  return L;
}
/* Situations from yesterday and today's market, never instructions. */
function protoIntel(){
  if(S.phase !== 'round') return [];
  const out = [], h = lastDay(), p = ourPlane();
  if(h && h.routes) Object.keys(h.routes).forEach(id => { const x = h.routes[id], miss = (x.want || 0) - x.pax, r = routeById(id);
    if(miss > 0) out.push({ tag:'CAPACITY', warn:true, text:`Capacity pressure — ${r.city}: ${miss} ${miss === 1 ? 'person' : 'people'} could not get a seat yesterday.` });
    else if(x.seats - x.pax >= Math.ceil(p.seats / 2)) out.push({ tag:'LOAD', text:`${r.city}: ${x.seats - x.pax} empty seats yesterday.` }); });
  if(roundData(S.round).opportunity){ const o = routeById(otherRoute());
    if(o) out.push({ tag:'OPPORTUNITY', good:true, text:`Network opportunity — ${o.city}: ${paxFor(o, o.basePrice)} passengers a day, typical fare ${money(o.basePrice)}, ${fmtDur(TIME.leg(p, o))} each way, no direct competitor.` }); }
  return out;
}
function evidenceHtml(h, ids){
  if(!ids.length) return '<div class="pb"><p class="muted">No routes yet.</p></div>';
  return `<div class="pb"><table class="hq-t rt ev"><thead><tr><th>Route</th><th class="num">Wanted</th><th class="num">Seats</th><th class="num">Travelled</th><th class="num">No seat</th><th class="num">Fare</th><th class="num">Revenue</th><th class="num">Route profit</th></tr></thead><tbody>${ids.map(id => {
    const r = routeById(id), x = h && h.routes && h.routes[id];
    if(!x) return `<tr><td>${flagSvg(r.flag, 18)} ${esc(r.city)}</td><td colspan="7" class="muted">New today: no results yet</td></tr>`;
    const miss = Math.max(0, (x.want || x.pax) - x.pax);
    return `<tr><td>${flagSvg(r.flag, 18)} ${esc(r.city)}</td><td class="num">${x.want || '—'}</td><td class="num">${x.seats}</td><td class="num">${x.pax}</td><td class="num ${miss ? 'orange' : ''}">${miss}</td><td class="num">${money(x.fare)}</td><td class="num">${money(x.rev)}</td><td class="num ${x.profit >= 0 ? 'green' : 'red'}">${money(x.profit)}</td></tr>`; }).join('')}</tbody></table></div>`;
}
/* One screen: the day bar, each route's fare and services, on-board sales (Day 1 on), the first departure (Day 2 on), the crew. */
const DEP_MIN = 360, DEP_MAX = 600;
R.planner = () => {
  const sc = scaffold(), p = ourPlane(), f = fleetOne(), sched = schedOf(f), ids = plannerRoutes(), counts = serviceCounts(sched), now = planOutcome(currentPlan());
  const card = id => { const r = routeById(id), n = counts[id] || 0, want = wantOf(id), isNew = !(lastDay() && lastDay().routes && lastDay().routes[id]) && id !== S.market, eb = earlyBonus(r);
    return `<div class="plan-route ${n ? 'flying' : ''}"><div class="pr-head">${flagSvg(r.flag, 28)}<b>${esc(r.city)}</b>${isNew ? '<span class="chip new">New market</span>' : ''}<span class="muted">${fmtDur(TIME.leg(p, r))} each way · ${fmtDur(TIME.roundTrip(p, r))} a service</span></div>
      <p class="pr-fare muted">At today's fare (<b class="mono">${money(fareOf(id))}</b>) <b class="mono">${want}</b> want to fly. The fare is chosen when you cost your options.</p>
      <div class="pr-svc"><span class="label">Services</span>${[0, 1, 2, 3].map(k => { const s = schedFrom(Object.assign({}, counts, { [id]:k })), ok = k === 0 || schedFits(s); return `<button class="svc sm ${n === k ? 'on' : ''}" data-svc="${id}|${k}" aria-pressed="${n === k}" ${ok ? '' : 'disabled'}><b>×${k}</b></button>`; }).join('')}</div>
      <p class="cap-line">${capLine(want, n * p.seats)}${eb ? ` <span class="chip biz">+${eb} early business travellers</span>` : ''}</p>${paxGroups(want, p.seats, n, { small:true })}</div>`; };
  const end = sched.length ? TIME.day(p, sched).end : null, D = sched.length ? TIME.day(p, sched) : null, crews = crewNeeded();
  const ob = onboardOf(), X = now.X;
  const obRow = sc >= 1 ? `<div class="pl-row"><span class="label">On board</span>${Object.keys(ONBOARD).map(k => `<button class="opt-chip ${(S.onboard || 'none') === k ? 'on' : ''}" data-ob="${k}" aria-pressed="${(S.onboard || 'none') === k}" title="${esc(ONBOARD[k].sub)}"><b>${esc(ONBOARD[k].label)}</b></button>`).join('')}</div>
    ${ob.share ? `<p class="pl-note">${esc(ob.sub)}. ${ob.share === 0.5 ? 'Half' : '3 in 10'} of ${now.pax} passengers buy: <b>${X.buyers} × ${money(ob.price)} = ${money(X.obRev)}</b> · stock ${money(X.obCost)}</p>` : ob.free ? `<p class="pl-note">${now.pax} passengers × ${money(ob.costPax)} = <b>${money(X.obCost)}</b> · passengers like it${S.rep < 4 ? ' (+½ star)' : ''}</p>` : ''}` : '';
  const depRow = S.round >= 2 ? `<div class="pl-row"><span class="label">First departure</span><button class="btn small" id="depDown" ${firstDep() <= DEP_MIN ? 'disabled' : ''}>◀ 15 min</button><b class="dep-t">${fmtTime(firstDep())}</b><button class="btn small" id="depUp" ${firstDep() >= DEP_MAX ? 'disabled' : ''}>15 min ▶</button><span class="muted">Business travellers fly only if a service leaves before 08:00.</span></div>` : '';
  const crewTxt = D ? (crews > 1 ? `<span class="orange">Crew day ${fmtDur(D.elapsed)}: needs a second crew (+${money(WORLD.crewCost)})</span>` : `<span>Crew day <b class="mono">${fmtDur(D.elapsed)}</b> of ${fmtDur(WORLD.crewDutyMin)}</span>`) : '';
  const story = sc === 1 ? ['New today: on-board sales. A catering company can supply snacks and drinks for your flights.', `A crew can work up to ${fmtDur(WORLD.crewDutyMin)}, from the first departure to the last landing. A longer day needs a second crew (${money(WORLD.crewCost)}).`]
    : sc === 2 ? ['New today: departure times. You can start the day earlier, or later.', 'Business travellers want to arrive in time for morning meetings. They only fly if a service leaves before 08:00.'] : [];
  screen().innerHTML = taskFrame({ question: sc >= 3 ? `What will your airline fly ${PW().now}?` : 'What timetable do you want to run today?', work:false, story, context: ctxAircraft(), help:['timing', 'demand'],
    say:`Plan today's operation. ${ids.map(id => `${routeById(id).city}: ${wantOf(id)} people want to fly at ${money(fareOf(id))}.`).join(' ')}`,
    main:`<div class="planner">${depRow}${dayTimeline(p, sched, { compact:true })}<div class="plan-routes n${ids.length}">${ids.map(card).join('')}</div>${obRow}
      <div class="plan-sum"><span>${esc(svcLabel(sched))}</span><span>Aircraft busy until <b class="mono">${end ? fmtTime(end) : '—'}</b></span>${crewTxt}<span>Fuel needed <b class="mono">${num(fuelNeeded())} L</b> · in the tank <b class="mono">${num(S.fuel)} L</b></span></div></div>`,
    foot:`<span class="grow"></span><button class="btn primary big" id="nx" ${sched.length ? '' : 'disabled'}>${sched.length ? goLabel('Use this plan') : 'Choose some services'} &#9654;</button>` });
  bindServices();
  screen().querySelectorAll('[data-ob]').forEach(b => b.onclick = () => { S.onboard = b.getAttribute('data-ob'); render(); });
  const moveDep = d => { const v = clamp(firstDep() + d, DEP_MIN, DEP_MAX), s = schedOf(f); S.firstDep = v; if(!schedFits(s)){ S.firstDep = v - d; toast("The timetable wouldn't fit."); } refreshPlan(); render(); };
  on('depDown', () => moveDep(-15)); on('depUp', () => moveDep(15));
  on('nx', () => { S.rnd.focusRoute = schedOf(f)[0]; costingCheck(); advance(); });
};

/* ==================================================================
   COMPARE: pin plans and see them side by side before choosing. Profit is shown "about" (nearest £50);
   the forecast still works the exact figures out.
   ================================================================== */
function currentPlan(){ const f = fleetOne(); return { sched: f ? schedOf(f).slice() : [], prices: Object.assign({}, S.prices), firstDep: firstDep(), onboard: S.onboard || 'none' }; }
function planKey(pl){ return JSON.stringify([pl.sched, pl.sched.map(id => pl.prices[id]), pl.firstDep, pl.onboard]); }
/* What a plan would do today, worked out on a copy of the state (nothing changes). */
function planOutcome(pl){
  const f = fleetOne(), keep = { sched: f ? f.schedule : [], route: f ? f.route : null, prices: S.prices, dep: S.firstDep, ob: S.onboard };
  try{
    if(f){ f.schedule = pl.sched.slice(); f.route = pl.sched[0] || null; } S.prices = Object.assign({}, pl.prices); S.firstDep = pl.firstDep; S.onboard = pl.onboard;
    const fl = planFlights().filter(x => !x.grounded), X = dayExtras(fl), rate = rateWithOrder(), p = ourPlane();
    const tickets = fl.reduce((t, x) => t + x.revenue, 0), run = fl.reduce((t, x) => t + x.runCost, 0), fuelL = fl.reduce((t, x) => t + x.fuelL, 0), fuel = Math.round(fuelL * rate), over = fleetDayCost();
    const routes = {}; fl.forEach(x => { routes[x.route] = (routes[x.route] || 0) + x.sold; });
    const nos = Object.keys(routes).reduce((t, id) => t + Math.max(0, paxWant(routeById(id), fareOf(id)) - routes[id]), 0);
    const pax = fl.reduce((t, x) => t + x.sold, 0), costs = run + fuel + over + X.term + X.obCost + X.crew;
    return { pax, nos, seats: fl.reduce((t, x) => t + x.seats, 0), revenue: tickets + X.obRev, costs, profit: tickets + X.obRev - costs, end: pl.sched.length ? TIME.day(p, pl.sched).end : null, crews: X.crews, fuelL, X, label: svcLabel(pl.sched) };
  } finally {
    if(f){ f.schedule = keep.sched; f.route = keep.route; } S.prices = keep.prices; S.firstDep = keep.dep; S.onboard = keep.ob;
  }
}
const aboutPounds = v => (v < 0 ? '−' : '') + money(Math.round(Math.abs(v) / 50) * 50);
/* ==================================================================
   HOME AIRPORT AND TERMINAL (onboarding)
   ================================================================== */
/* A locator map: the shared world outline cropped to Britain, Ireland and northern France.
   The land is stretched to the right shape; the airports and labels sit on top so they stay round and sharp. */
const LOC = { x0:1690, x1:1836, y0:202, y1:314 };
function locXY(lat, lon){ return [((lon + 180) * 10 - LOC.x0) / (LOC.x1 - LOC.x0) * 100, ((79 - lat) * 10 - LOC.y0) / (LOC.y1 - LOC.y0) * 100]; }
function locatorMap(){
  const h = homeData(), p = planeById('dhc6'), hub = locXY(h.lat, h.lon), W = LOC.x1 - LOC.x0, Hh = LOC.y1 - LOC.y0;
  const toSvg = ([x, y]) => [LOC.x0 + x * W / 100, LOC.y0 + y * Hh / 100];
  const dests = WORLD.setupRoutes.map(routeById).map(r => ({ r, at: locXY(r.alat !== undefined ? r.alat : r.lat, r.alon !== undefined ? r.alon : r.lon) }));
  const lines = dests.map(d => { const a = toSvg(hub), b = toSvg(d.at); return `<line x1="${a[0].toFixed(2)}" y1="${a[1].toFixed(2)}" x2="${b[0].toFixed(2)}" y2="${b[1].toFixed(2)}"/>`; }).join('');
  const place = { lhr:'w', ltn:'n', lgw:'s', man:'w' };
  const apts = WORLD.homes.map(x => { const [lx, ly] = locXY(x.lat, x.lon), on = x.id === S.home;
    return `<span class="loc-apt ${on ? 'on' : ''} at-${place[x.id] || 'e'}" style="left:${lx.toFixed(2)}%;top:${ly.toFixed(2)}%"><i></i><b class="mono">${x.code}</b></span>`; }).join('');
  const dst = dests.map(d => `<span class="loc-apt dest at-${d.r.id === 'par' ? 's' : 'w'}" style="left:${d.at[0].toFixed(2)}%;top:${d.at[1].toFixed(2)}%"><i></i><b class="mono">${aptCode(d.r)}</b></span>`).join('');
  const tags = dests.map(d => { const mx = (hub[0] + d.at[0]) / 2, my = (hub[1] + d.at[1]) / 2;
    return `<span class="loc-tag" style="left:${mx.toFixed(2)}%;top:${my.toFixed(2)}%">${esc(d.r.city)} <b class="mono">${fmtDur(legMinutes(p, d.r, h))}</b></span>`; }).join('');
  return `<div class="locmap"><div class="loc-box"><svg class="loc-svg" viewBox="${LOC.x0} ${LOC.y0} ${W} ${Hh}" preserveAspectRatio="none" aria-hidden="true"><use href="#worldShape"/><g class="loc-lines">${lines}</g></svg>${apts}${dst}${tags}</div>
    <p class="loc-cap">Flight times each way for your Twin Otter from <b class="mono">${h.code}</b>.</p></div>`;
}
R.home = () => {
  const p = planeById('dhc6'), h = homeData(), T = h.terminals || [];
  if(!T.some(t => t.id === S.terminal)) S.terminal = T[0] ? T[0].id : null;
  const times = hh => WORLD.setupRoutes.map(routeById).sort((a, b) => a.city.localeCompare(b.city)).map(r => `<span class="apt-r">${flagSvg(r.flag, 16)} ${esc(r.city)} <b class="mono">${fmtDur(legMinutes(p, r, hh))}</b> · fare about <b class="mono">${money(normalFare(r, hh))}</b></span>`).join('');
  screen().innerHTML = `<div class="card stack home2">${header('Choose your home airport', 'Choose your home airport. Every flight pays a landing fee. Busier airports cost more but bring more passengers.')}
    <div class="home-g"><div class="home-l">
      <p class="lede sm">Every flight pays a <b>landing fee</b> at home. Busy airports cost more, but more people fly from them.</p>
      <div class="airports">${WORLD.homes.map(x => `<button class="apt ${S.home === x.id ? 'on' : ''}" data-h="${x.id}" aria-pressed="${S.home === x.id}"><span class="apt-code mono">${x.code}</span><b>${esc(x.name)}</b><span class="muted">${esc(x.blurb)}</span>
        <span class="apt-f"><span>Landing fee <b class="mono">${money(x.fee)}</b></span><span>Passengers <b class="mono">${x.demandPct > 0 ? '+' : ''}${x.demandPct}%</b></span></span><span class="apt-rs">${times(x)}</span></button>`).join('')}</div>
      <span class="label">Your terminal at ${esc(h.name)}</span>
      <div class="terms">${T.map(t => `<button class="term ${S.terminal === t.id ? 'on' : ''}" data-tm="${t.id}" aria-pressed="${S.terminal === t.id}"><b>${esc(t.name)}</b><span class="apt-f"><span>Turnaround <b class="mono">${t.turn} min</b></span><span><b class="mono">${money(t.charge)}</b> a passenger</span></span><span class="muted">${esc(t.note)}</span></button>`).join('')}</div>
    </div><div class="home-r">${locatorMap()}<button class="btn primary big" id="nx">Base the airline at ${esc(h.code)}${T.length > 1 ? ' ' + esc((T.find(t => t.id === S.terminal) || T[0]).name) : ''} &#9654;</button></div></div></div>`;
  screen().querySelectorAll('[data-h]').forEach(b => b.onclick = () => { S.home = b.getAttribute('data-h'); S.terminal = null; render(); });
  screen().querySelectorAll('[data-tm]').forEach(b => b.onclick = () => { S.terminal = b.getAttribute('data-tm'); render(); });
  on('nx', next);
};

/* ==================================================================
   ENTERING THE HQ: a short start-up sequence after the home airport, then the HQ fades in.
   ================================================================== */
let bootTimer = null;
function enterHq(){ clearTimeout(bootTimer); if(step().t !== 'boot') return; document.body.classList.add('hq-enter'); next(); setTimeout(() => document.body.classList.remove('hq-enter'), 800); }
R.boot = () => {
  const h = homeData(), T = terminalData(), lines = ['Operations online', 'Finance standby', 'Network standby', 'Fleet awaiting delivery'];
  screen().innerHTML = `<div class="hqboot" role="status"><div class="hb-in">${finSvg(S.airline.fin, 52)}<div class="hb-name">${esc(S.airline.name || 'Your airline')}</div><div class="hb-at">${esc(h.name)}${T.name ? ' · ' + esc(T.name) : ''}</div><p class="hb-init">Initialising headquarters…</p>
    <ol class="hb-l">${lines.map((l, i) => `<li style="--d:${(0.4 + i * 0.32).toFixed(2)}s"><i></i><span>${l}</span></li>`).join('')}<li class="sys" style="--d:${(0.4 + lines.length * 0.32 + 0.15).toFixed(2)}s"><i></i><span>System ready</span></li></ol>
    <button class="btn primary big" id="enterHq">Enter HQ &#9654;</button></div></div>`;
  on('enterHq', enterHq);
  clearTimeout(bootTimer); bootTimer = setTimeout(() => { if(!S.overlay) enterHq(); }, 2900);
};

/* ==================================================================
   RESULTS (EXPLAIN): revenue − costs = profit, and who got a seat
   ================================================================== */
function rcpSlide(){ const first = S.phase === 'setup'; return { kind:'rcp', title: first ? 'Revenue, costs and profit' : 'The money', say: `Revenue ${money(S.rnd.revenue)}. Costs ${money(S.rnd.costs)}. ${S.rnd.profit >= 0 ? 'Profit' : 'Loss'} ${money(Math.abs(S.rnd.profit))}.` + (first ? ' Revenue is money received from ticket sales. Costs are money spent operating the airline. Profit is the money remaining after costs.' : '') }; }
function capSlides(){
  const h = lastDay(); if(!h || !h.routes) return [];
  return Object.keys(h.routes).map(id => { const x = h.routes[id], r = routeById(id), miss = Math.max(0, (x.want || x.pax) - x.pax);
    return { kind:'cap', id, title:`${r.city}: who flew?`, say:`${r.city}: ${x.want} wanted to travel. ${x.seats} seats offered. ${x.pax} travelled. ${miss} could not get a seat.` }; });
}
function openingSlideHtml(x){
  if(x.kind === 'rcp'){
    const first = S.phase === 'setup', fl = S.rnd.flights.filter(f => !f.grounded && !f.noFuel), run = fl.reduce((t, f) => t + f.runCost, 0), pax = fl.reduce((t, f) => t + f.sold, 0);
    const rev = S.rnd.revenue, costs = S.rnd.costs, p = S.rnd.profit, mx = Math.max(rev, costs, 1);
    return `<div class="rcp"><div class="rcp-b rev"><span class="label">Revenue</span><b class="mono" data-count="${rev}">${money(0)}</b><small>${pax} tickets sold</small>${first ? '<p>Money received from ticket sales.</p>' : ''}<i class="rcp-bar" style="--w:${(100 * rev / mx).toFixed(1)}%"></i></div>
      <span class="rcp-op">−</span><div class="rcp-b cost"><span class="label">Costs</span><b class="mono" data-count="${costs}">${money(0)}</b><small>Flights ${money(run)} · fuel ${money(S.rnd.fuelUsedCost || 0)} · aircraft's day ${money(S.rnd.over || 0)}</small>${first ? '<p>Money spent operating the airline.</p>' : ''}<i class="rcp-bar" style="--w:${(100 * costs / mx).toFixed(1)}%"></i></div>
      <span class="rcp-op">=</span><div class="rcp-b prof ${p < 0 ? 'neg' : ''}"><span class="label">${p >= 0 ? 'Profit' : 'Loss'}</span><b class="mono" data-count="${Math.abs(p)}">${money(0)}</b><small>${p >= 0 ? 'kept by the airline' : 'costs were bigger than revenue'}</small>${first ? '<p>Money remaining after costs.</p>' : ''}</div></div>
      ${first ? '' : `<div class="rcp-help">${helpChip('money')}</div>`}`;
  }
  if(x.kind === 'cap'){
    const h = lastDay(), d = h.routes[x.id], miss = Math.max(0, (d.want || d.pax) - d.pax), p = ourPlane();
    return `<div class="capx"><div class="cx-figs"><div><span class="label">Wanted to travel</span><b class="mono">${d.want}</b></div><div><span class="label">Seats offered</span><b class="mono">${d.seats}</b></div><div><span class="label">Travelled</span><b class="mono green">${d.pax}</b></div><div><span class="label">No seat</span><b class="mono ${miss ? 'orange' : ''}">${miss}</b></div></div>${paxGroups(d.want, p.seats, d.trips)}</div>`;
  }
  return '';
}

/* ==================================================================
   END OF THE OPENING PROTOTYPE
   ================================================================== */
R.protoEnd = () => {
  const f = fleetOne(), c = serviceCounts(schedOf(f)), h = lastDay(), total = S.history.reduce((t, x) => t + (x.pax || 0), 0);
  S.finished = true;
  screen().innerHTML = shell(`<div class="hp proto-end">${hqHead('Opening Prototype Complete', 'PROTOTYPE')}
    <h1>Regular operations established</h1>${strategyBadge()}
    <div class="pe-grid"><div><span class="label">Daily timetable</span>${Object.keys(c).map(id => `<b>${flagSvg(routeById(id).flag, 24)} ${esc(routeById(id).city)} ×${c[id]}</b>`).join('')}</div>
      <div><span class="label">Aircraft</span><b>1 ${esc(ourPlane().name.replace(/^DHC-6 /, ''))}</b></div>
      <div><span class="label">Passengers</span><b class="mono">${h ? h.pax : 0}</b><small>a day · ${num(total)} flown so far</small></div>
      <div><span class="label">Cash</span><b class="mono amber">${money(S.cash)}</b></div>
      ${repLive() ? `<div><span class="label">Reputation</span><span class="stars">${starsHtml(S.rep)}</span></div>` : ''}</div>
    <p class="lede">Your regular airline operation is now established.</p>
    <p class="muted">In the full game, routine flights will begin operating automatically and you will start managing the airline week by week.</p>
    <div class="row" style="justify-content:center">${S.round >= 3 && S.round <= 4 ? '<button class="btn primary big" id="peGo">Continue</button>' : ''}<button class="btn ${S.round === 3 ? '' : 'primary'} big" id="again">Play the opening again</button><button class="btn big" id="peHome">Home</button></div></div>`);
  on('again', () => { S = newState(); S.si = 1; render(); }); on('peHome', openMenu); on('peGo', () => { S.finished = false; startProtoDay(S.round + 1 <= 4 ? S.round + 1 : 4); });
};

/* ==================================================================
   THE HQ SHELL. Three layers: the chrome (top bar, left nav), the workspace (the plan rail and the task)
   and the dock beside it. The dock shows the context for the current activity; a tool (a calculation,
   help, the working space) docks there for a moment and closing it brings the context back. Nothing floats.
   ================================================================== */
const WS_STEPS = ['starter', 'market', 'demand', 'rotation', 'timetable', 'fareTry', 'options', 'fuelPlan', 'dayForecast', 'planner', 'ready'];
const SHELL_STEPS = WS_STEPS.concat(['hq', 'fly', 'results', 'protoEnd']);
['results'].forEach(t => { const i = FOCUS_STEPS.indexOf(t); if(i >= 0) FOCUS_STEPS.splice(i, 1); });
const ICON = {
  overview:'<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  plan:'<svg viewBox="0 0 24 24"><path d="M8 3h8v3H8zM6 5H4v16h16V5h-2v3H6zm2 7h8v2H8zm0 4h6v2H8z"/></svg>',
  network:'<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 9h-3a15 15 0 0 0-1.3-6A8 8 0 0 1 18.9 11zM12 4c.9 1.2 1.8 3.6 2 7h-4c.2-3.4 1.1-5.8 2-7zM9.4 5a15 15 0 0 0-1.3 6h-3A8 8 0 0 1 9.4 5zM5.1 13h3a15 15 0 0 0 1.3 6A8 8 0 0 1 5.1 13zM12 20c-.9-1.2-1.8-3.6-2-7h4c-.2 3.4-1.1 5.8-2 7zm2.6-1a15 15 0 0 0 1.3-6h3a8 8 0 0 1-4.3 6z"/></svg>',
  fleet:'<svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>',
  finance:'<svg viewBox="0 0 24 24"><path d="M4 20h16v2H4zM5 10h3v8H5zm5.5-5h3v13h-3zM16 13h3v5h-3z"/></svg>',
  cash:'<svg viewBox="0 0 24 24"><path d="M3 6h18v12H3zm2 2v8h14V8zm7 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/></svg>',
  profit:'<svg viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 7-7v5h2V4h-9v2h5l-5 5-4-4-8 8z"/></svg>',
  pax:'<svg viewBox="0 0 24 24"><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm7 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9 13c-4 0-7 2-7 4.5V20h14v-2.5C16 15 13 13 9 13zm7 0c-.5 0-1 0-1.4.1 1.5 1 2.4 2.4 2.4 4.4V20h5v-2.5c0-2.5-3-4.5-6-4.5z"/></svg>',
  seat:'<svg viewBox="0 0 24 24"><path d="M6 3h3v9h8l3 8h-3l-2.2-5H8a2 2 0 0 1-2-2zM4 17h11v2H4z"/></svg>',
  star:'<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>',
  fuel:'<svg viewBox="0 0 24 24"><path d="M12 2.5S5 10 5 14.5a7 7 0 0 0 14 0C19 10 12 2.5 12 2.5z"/></svg>',
  lock:'<svg viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1zm2 0h6V7a3 3 0 0 0-6 0z"/></svg>' };
const NAV = [['overview', 'Overview'], ['plan', "Today's Plan"], ['network', 'Network'], ['fleet', 'Fleet'], ['finance', 'Finance']];

/* HQ modules come online as the airline grows; until then they are visible but locked. */
const MODULES = { finance:{ name:'Finance', note:'Available after the first flight', short:'After first flight' }, network:{ name:'Network', note:'Available once a regular timetable is running (Day 1)', short:'From Day 1' }, fleet:{ name:'Fleet', note:'Available after the first full day of operations', short:'After Day 1' } };
function moduleOn(id){
  if(!MODULES[id]) return true;
  const h = S.history || [];
  if(id === 'finance') return h.length >= 1;
  if(id === 'network') return S.phase === 'round' && (S.round >= 2 || ['fly', 'results', 'protoEnd'].includes(step().t));
  return h.some(x => x.type === 'day');
}
/* A short system notice when a module comes online (older saves start with what their history implies). */
function checkModules(){
  const on = Object.keys(MODULES).filter(moduleOn);
  if(!S.seenModules){ S.seenModules = on; return; }
  const fresh = on.filter(id => !S.seenModules.includes(id)); if(!fresh.length) return;
  S.seenModules = S.seenModules.concat(fresh); save();
  sysNotice(fresh.map(id => MODULES[id].name + ' online').join(' · '));
  fresh.forEach(id => { const b = screen().querySelector(`[data-nav="${id}"]`); if(b) b.classList.add('lit'); });
}
/* System notices queue up, so "Finance online" and "Ticket revenue model online" never cover each other. */
function sysNotice(text){ (window.__notes = window.__notes || []).push(text); (sysNotice.q || (sysNotice.q = [])).push(text); if(!sysNotice.busy) sysNoticeNext(); }
function sysNoticeNext(){
  const q = sysNotice.q; if(!q.length){ sysNotice.busy = false; return; } sysNotice.busy = true;
  let n = $('sysNote'); if(!n){ n = document.createElement('div'); n.id = 'sysNote'; n.className = 'sysnote'; n.setAttribute('role', 'status'); $('control').appendChild(n); }
  const [a, b] = String(q.shift()).split(' · '); n.innerHTML = `<b>${esc(a)}</b>${b ? `<small>${esc(b)}</small>` : ''}`; n.classList.toggle('two', !!b); n.classList.remove('show'); void n.offsetWidth; n.classList.add('show');
  setTimeout(() => { n.classList.remove('show'); setTimeout(sysNoticeNext, 300); }, b ? 3600 : 2200);
}
function planReachable(){ const t = step().t; return WS_STEPS.includes(t) || t === 'hq'; }
function navActive(){ return UI.view || (WS_STEPS.includes(step().t) ? 'plan' : 'overview'); }
function shell(inner, bar){
  const act = navActive();
  return `<div class="shell ${bar ? 'has-bar' : ''}"><nav class="lnav" aria-label="HQ">${NAV.map(([id, l]) => { const locked = !!MODULES[id] && !moduleOn(id), off = locked || (id === 'plan' && !planReachable());
    return `<button class="nv ${act === id ? 'on' : ''} ${locked ? 'locked' : ''}" data-nav="${id}" title="${esc(locked ? `${l}: ${MODULES[id].note}` : l)}" aria-disabled="${off}">${ICON[id]}<span>${l}</span>${locked ? `<small class="nv-note">${ICON.lock}${MODULES[id].short}</small>` : ''}</button>`; }).join('')}</nav><div class="shell-main">${inner}</div>${bar || ''}</div>`;
}
/* Overview, Network, Fleet or Finance while a step is open: the step waits underneath. */
function shellView(st){
  if(!SHELL_STEPS.includes(st.t)){ UI.view = null; return false; }
  const v = UI.view; if(!v || v === 'plan') return false;
  if(MODULES[v] && !moduleOn(v)){ UI.view = null; return false; }
  if(v === 'overview'){ if(!WS_STEPS.includes(st.t)){ UI.view = null; return false; } renderOverview('planning'); return true; }
  renderView(v); return true;
}

/* ---------- moving about the plan: a setting is edited where it was made, then you return ---------- */
function reach(){ return Math.max(S.si, S.rnd.returnTo || 0); }
function jumpTo(i){ if(i === S.si || i < 0) return; S.rnd.returnTo = reach(); S.si = i; resetEntry(); UI.justDone = null; UI.view = null; render(); }
function advance(){ const r = S.rnd.returnTo; delete S.rnd.returnTo; if(r !== undefined && r > S.si){ S.si = r; resetEntry(); UI.justDone = null; render(); } else next(); }
function goLabel(def){ const r = S.rnd.returnTo; return r !== undefined && r > S.si ? `Back to ${RAIL_LABEL[S.steps[r].t] || 'the plan'}` : def; }

let fbTimer = null;
const KEEP_SCROLL = ['.opts-wrap', '.tf-main', '.tf-body', '.sheet1'];
document.addEventListener('scroll', e => { const el = e.target; if(!el || !el.matches || !S || !UI) return; const sel = KEEP_SCROLL.find(x => el.matches(x)); if(sel) (UI.scrollKeep = UI.scrollKeep || {})[S.si + ':' + S.day + sel] = el.scrollTop; }, true);
function restoreScroll(){ const k = UI.scrollKeep; if(!k) return; KEEP_SCROLL.forEach(sel => { const v = k[S.si + ':' + S.day + sel], el = screen().querySelector(sel); if(el && v) el.scrollTop = v; }); }
function afterRender(){
  restoreScroll();
  screen().querySelectorAll('[data-nav]').forEach(b => b.onclick = () => {
    const v = b.getAttribute('data-nav');
    if(MODULES[v] && !moduleOn(v)){ toast(MODULES[v].note); return; }
    if(v === 'plan'){ if(!planReachable()) return; UI.view = null; if(step().t === 'hq'){ next(); return; } render(); return; }
    UI.view = v === 'overview' && !WS_STEPS.includes(step().t) ? null : v; render(); });
  screen().querySelectorAll('[data-ri]').forEach(b => b.onclick = () => jumpTo(+b.getAttribute('data-ri')));
  screen().querySelectorAll('[data-stg]').forEach(b => b.onclick = () => { const g = b.getAttribute('data-stg'); UI.railOpen = UI.railOpen === g ? null : g; render(); });
  screen().querySelectorAll('[data-edit]').forEach(b => b.onclick = () => jumpTo(S.steps.findIndex(s => s.t === b.getAttribute('data-edit'))));
  bindDock();
  clearInterval(fbTimer);
  const fb = screen().querySelector('.fb'); if(fb){ const n = +fb.getAttribute('data-n'); if(n > 1) fbTimer = setInterval(() => fbShow(1), 6000); }
  screen().querySelectorAll('[data-fb]').forEach(b => b.onclick = () => { fbShow(+b.getAttribute('data-fb')); clearInterval(fbTimer); });
  if(!S.overlay && SHELL_STEPS.includes(step().t)) checkModules();
  if(!S.overlay) checkTools();
  screen().querySelectorAll('[data-tab]').forEach(b => { if(!b.onclick) b.onclick = () => { const [k, v] = b.getAttribute('data-tab').split('|'); UI.hqTabs[k] = v; render(); }; });
}

/* ---------- the plan rail: the day in stages; a finished stage folds into one line ---------- */
function railValue(t, i){
  const f = fleetOne(), p = ourPlane(), sched = f ? schedOf(f) : [], passed = i < reach() && i !== S.si;
  if(t === 'starter') return f ? `${p.name.replace(/^DHC-6 /, '')} · ${p.seats} seats` : '';
  if(t === 'market') return S.market ? `${routeById(S.market).city} · ${paxFor(routeById(S.market), routeById(S.market).basePrice)} a day` : '';
  if(t === 'demand'){ const r = S.market && routeById(S.market); return passed && r ? `${paxFor(r, r.basePrice)} want to fly · ${p.seats} seats` : ''; }
  if(t === 'rotation'){ if(!passed || !S.market) return ''; const D = TIME.day(p, [S.market, S.market]); return `ready again ${fmtTime(D.trips[1].dep)}`; }
  if(t === 'timetable' || t === 'planner'){ if(!sched.length) return ''; const s = `${svcLabel(sched)} · until ${fmtTime(TIME.day(p, sched).end)}`; return t === 'planner' ? s + (S.round >= 2 ? ` · from ${fmtTime(firstDep())}` : '') + (S.onboard && S.onboard !== 'none' ? ' · ' + ONBOARD[S.onboard].label.toLowerCase() : '') : s; }
  if(t === 'fareTry') return passed && S.market ? `${money(fareOf(S.market))} · ${wantOf(S.market)} people` : '';
  if(t === 'fuelPlan'){ const o = S.rnd.fuelOrder; if(o) return `${num(o.litres)} L ordered · ${money(o.total)}`; return passed ? `tank covers it (${num(S.fuel)} L)` : ''; }
  if(t === 'options') return S.rnd.myForecast ? `${S.rnd.myForecast.plan || 'Plan A'} · ${Object.keys(serviceCounts(sched)).map(id => money(fareOf(id))).join(' / ')} · profit ${money(S.rnd.myForecast.profit)}` : '';
  return '';
}
const RAIL_LABEL = { starter:'Aircraft', market:'First market', demand:'Market demand', rotation:'One service', timetable:'Timetable', fareTry:'Fare', options:'Fares and forecast', fuelPlan:'Fuel', dayForecast:'Forecast', planner:'Timetable and extras', ready:'Launch' };
const STAGES = {
  launch:[ { id:'air', name:'Airline ready', done:'Airline ready', sub:'Aircraft and first market', steps:['starter', 'market'] },
           { id:'svc', name:'Build the service', done:'Service built', sub:'Plan your first route', steps:['demand', 'rotation', 'timetable', 'fareTry'] },
           { id:'prep', name:'Prepare to fly', done:'Ready to operate', sub:'Fares, forecast and fuel', steps:['options', 'fuelPlan'] },
           { id:'go', name:'Launch', sub:'Start operations', steps:['ready'] } ],
  day:[ { id:'plan', name:'Plan the day', done:'Day planned', sub:'Timetable and extras', steps:['planner'] },
        { id:'prep', name:'Prepare to fly', done:'Ready to operate', sub:'Fares, forecast and fuel', steps:['options', 'fuelPlan'] },
        { id:'go', name:'Launch', sub:'Start operations', steps:['ready'] } ] };
const SUB_DESC = { starter:'Take delivery', market:'Choose where to fly', demand:'Check demand', rotation:'Time one service', timetable:'Plan the services', fareTry:'Set the ticket price', options:'Price and cost each plan', fuelPlan:'Order fuel', planner:'Services and extras', ready:'Start operations' };
function stageOf(t){ return railStages().find(g => g.steps.includes(t)); }
/* Hooks: day behaviour here; the campaign (weeks, months, the year) overrides them. */
function campaignSummary(id){ return ''; }
function railKind(){ return S.phase === 'setup' ? 'launch' : 'day'; }
function railStages(){ return STAGES[railKind()] || STAGES.day; }
function railTitle(){ return S.phase === 'setup' ? ['Launch Day Plan', 'Get your airline airborne'] : [`Day ${S.round} Plan`, "Plan and launch today's flying"]; }
function PW(){ return { now:'today', poss:"Today's", the:"today's", span:'day' }; }
function periodNeed(){ return fuelNeeded(); }
function fcKey(pl){ return planKey(pl); }
function editStep(what){ const setup = S.phase === 'setup'; return what === 'timetable' ? (setup ? 'timetable' : 'planner') : what === 'extras' ? 'planner' : 'options'; }
function goWord(){ return 'START OPERATIONS'; }
function closeWord(){ return 'Close the day'; }
function planWord(){ return "Plan today's operation"; }
function readyExtra(row){ return ''; }
function readyOk(){ return true; }
function readyTitle(){ return S.phase === 'setup' ? 'Ready for launch' : `Ready for Day ${S.round}`; }
function beatLabel(i){ return i ? 'Day ' + i : 'Launch'; }
function wsCrumb(){ const g = stageOf(step().t); return `${S.airline.name || 'Airline'} HQ${g ? ' · ' + g.name : ''}`; }
function wsStatus(){ return S.phase === 'setup' ? 'LAUNCH DAY' : `DAY ${S.round}`; }
const STEP_HINT = { starter:'Your start-up aircraft is waiting for delivery at your home airport.', market:'Compare the two markets, then open one.', demand:'Compare the people who want to fly with the seats on one service.',
  rotation:'Follow one service from departure until the aircraft is ready again.', timetable:'Add services until the timetable suits the market. Each one must fit in the operating day.',
  fareTry:"You're building your first route. Set a fare and check the timetable, then continue.", options:"Each plan charges a different fare. Work out each profit, then choose the plan your airline will fly.",
  fuelPlan:"Make sure the tank covers today's flights. Fuel is paid for when operations start.", ready:'Check the operating plan. Anything can still be edited before operations start.', planner:"Set today's timetable and extras. Fares are chosen when you cost your options." };
function stageSummary(id){
  const f = fleetOne(), p = ourPlane(), sched = f ? schedOf(f) : [];
  if(id === 'air') return [S.fleet.length ? p.name.replace(/^DHC-6 /, '') : '', S.market ? routeById(S.market).city : ''].filter(Boolean).join(' · ');
  if(id === 'svc') return sched.length ? `${svcLabel(sched)} · ${sched.length * p.seats} seats` : '';
  if(id === 'plan') return sched.length ? svcLabel(sched) : '';
  if(!['air', 'svc', 'plan', 'prep'].includes(id)) return campaignSummary(id);
  if(id === 'prep'){ const fc = S.rnd.myForecast; return fc ? `${Object.keys(serviceCounts(sched)).map(x => money(fareOf(x))).join(' / ')} fare · profit ${money(fc.profit)}` : 'Fuel checked · Forecast complete'; }
  return '';
}
function planRail(){
  const idx = t => S.steps.findIndex(s => s.t === t), R0 = reach();
  const list = railStages().map(g => Object.assign({ ii: g.steps.map(idx).filter(i => i >= 0) }, g)).filter(g => g.ii.length);
  return `<aside class="ws-rail"><div class="ws-h">${railTitle()[0]}<small>${railTitle()[1]}</small></div><ol class="stages">${list.map((g, k) => {
    const cur = g.ii.includes(S.si), done = !cur && g.ii.every(i => i < R0), state = cur ? 'cur' : done ? 'done' : 'next';
    const open = cur && g.steps.length > 1 || (done && UI.railOpen === g.id), sum = done ? stageSummary(g.id) : g.sub;
    const subs = open ? `<ol class="subs">${g.steps.map(t => { const i = idx(t); if(i < 0) return ''; const on = i === S.si, dn = !on && i < R0, v = dn ? railValue(t, i) : '';
      return `<li><button class="ri ${on ? 'on' : ''} ${dn ? 'done' : ''}" data-ri="${i}" ${dn ? '' : 'disabled'}><i class="ri-d"></i><span class="ri-t"><b>${RAIL_LABEL[t]}</b><small>${esc(v || SUB_DESC[t] || '')}</small></span>${dn ? '<span class="ri-e">Edit</span>' : ''}</button></li>`; }).join('')}</ol>` : '';
    return `<li class="stg ${state} ${open ? 'open' : ''} ${g.id === 'go' ? 'go' : ''}"><button class="stg-h" ${done ? `data-stg="${g.id}"` : 'disabled'} aria-expanded="${open}"><span class="stg-k">${done ? '&#10003;' : k + 1}</span><span class="stg-t"><b>${done ? g.done : g.name}</b>${sum ? `<small>${esc(sum)}</small>` : ''}</span>${state === 'next' ? `<i class="stg-lock">${ICON.lock}</i>` : done ? `<i class="stg-chev">${open ? '▴' : '▾'}</i>` : ''}</button>${subs}</li>`;
  }).join('')}</ol></aside>`;
}
function wsWrap(frame, o){
  o = o || {}; const t = step().t, hint = o.hint || STEP_HINT[t] || '';
  const bar = `<footer class="actbar"><span class="ab-i" aria-hidden="true">i</span><p class="ab-hint">${hint}</p><div class="ab-act">${o.foot || ''}</div></footer>`;
  return shell(`<div class="ws ws-${t} ${UI.dockShut ? 'dock-shut' : ''}">${planRail()}<div class="ws-main">${frame}</div>${dockHtml(o)}</div>`, bar);
}

/* ---------- the dock ---------- */
UI.dock = { mode:null, topic:null }; UI.dockShut = false; UI.railOpen = null; UI.justDone = null; UI.pad = { strokes:[], cur:null, erase:false }; UI.dockAt = -1;
const DOCK_KIND = { context:'Context', calc:'Calculation', help:'Help', work:'Working space', archive:'Archive', fx:'Model' };
function dockHtml(o){
  if(UI.dockAt !== S.si + ':' + S.day){ UI.dockAt = S.si + ':' + S.day; UI.dock = { mode:null, topic:null }; UI.railOpen = null; if(!o.calc) UI.justDone = null; }
  const t = o.calc || null, m = UI.dock.mode, c = o.context || {}; tidyActive(t);
  let kind = 'context', title = c.title || 'Context', body = c.html || '';
  if(m === 'help' && HELP[UI.dock.topic]){ kind = 'help'; title = HELP[UI.dock.topic]; body = helpBody(UI.dock.topic); }
  else if(m === 'work'){ kind = 'work'; title = 'Working space'; body = workPadHtml(t); }
  else if(m === 'archive'){ kind = 'archive'; title = 'Earlier days'; body = archiveDockHtml(); }
  else if(m === 'fx'){ kind = 'fx'; title = 'How the model works it out'; body = fxHtml(); }
  else if(t && t.active){ kind = 'calc'; title = calcTitle(t, t.active); body = calcHtml(t); }
  else if(t && UI.justDone && UI.justDone.table === t.id){ kind = 'calc'; title = doneWord(t); body = calcDoneHtml(t); }
  if(UI.dockShut && kind === 'context') return `<aside class="dock shut" data-dock="shut"><button class="dk-open" id="dkOpen" title="Show ${esc(title)}" aria-label="Show the side panel"><span>‹</span><b>${esc(title)}</b></button></aside>`;
  const tools = kind === 'context' ? dockTools(o) : '';
  return `<aside class="dock dock-${kind}" data-dock="${kind}" aria-label="${esc(DOCK_KIND[kind])}"><div class="dk-h"><span class="dk-tt"><span class="dk-kind">${DOCK_KIND[kind]}</span><b class="dk-t">${esc(title)}</b></span>${kind === 'context' ? '<button class="dk-x" id="dkShut" title="Hide the side panel" aria-label="Hide the side panel">›</button>' : '<button class="dk-x" id="dkClose" title="Close" aria-label="Close">✕</button>'}</div><div class="dk-b">${body}</div>${tools}</aside>`;
}
const HELP_SUB = { timing:'How turnaround times work', demand:'How ticket prices affect demand', fuel:'How the tank and fuel prices work', money:'Revenue, costs and profit', forecast:'What a forecast is' };
function dockTools(o){
  const row = (attr, ic, t, sub) => `<button class="dk-help" ${attr}><i>${ic}</i><span><b>${esc(t)}</b><small>${esc(sub)}</small></span><em>›</em></button>`;
  const b = (o.help || []).map(k => row(`data-help="${k}"`, '?', HELP[k], HELP_SUB[k] || ''));
  if(o.work) b.push(row('data-dkwork', '&#9998;', 'Working space', 'Pinned figures and a pad to work on'));
  return b.length ? `<div class="dk-tools"><h4>Help and guidance</h4>${b.join('')}</div>` : '';
}
/* The figure being completed, as a stacked sum. The pupil types it (no number pad): Enter confirms. */
const OPND = { pax1:'Passengers', pax2:'Passengers', fare1:'Fare', fare2:'Fare', litres:'Fuel ordered', ppl:'Price per litre' };
const CALC_Q = { tk1:'How much will the tickets bring in?', profit:'What profit does this plan make?', bill:'What will this fuel order cost?' };
function stackRows(t, col, row){
  const out = []; let op = '';
  (row.sentence || '').split(/(\{\??\w+\})/).forEach(part => {
    const m = part.match(/^\{(\?)?(\w+)\}$/);
    if(!m){ const x = part.match(/[+−×÷]/); if(x) op = x[0]; return; }
    if(m[1]) return;
    const id = m[2], isRow = tRows(t).some(r => r.id === id);
    out.push({ op, id, label: isRow ? operandLabel(t, id) : (OPND[id] || id), value: fmtVal(operandUnit(t, id), operandValue(t, col, id)) }); op = '';
  });
  return out;
}
function calcTitle(t, a){ const col = t.cols.find(c => c.id === a.col), row = tRows(t).find(r => r.id === a.row); return t.kind === 'fuel' ? 'Fuel order · Cost' : `${col ? col.label : ''} · ${row ? rowLabel(t, row) : ''}`; }
function stackHtml(rows){ return rows.map(x => `<div class="cs"><span class="cs-op">${x.op}</span><span class="cs-l">${esc(x.label)}</span><b class="cs-v mono">${x.value}</b></div>`).join(''); }
function calcHtml(t){
  const a = t.active, col = t.cols.find(c => c.id === a.col), row = tRows(t).find(r => r.id === a.row);
  if(needsBuild(t, row)) return buildHtml(t, col, row);
  return `<div class="calc"><p class="calc-q">${esc(CALC_Q[row.id] || 'Complete the figure.')}</p>
    <div class="cstack">${stackHtml(stackRows(t, col, row))}<div class="cs ans"><span class="cs-op">=</span><span class="cs-l">${esc(rowLabel(t, row))}</span><span class="answer"><span class="unit">${row.unit === '£' ? '£' : ''}</span><input id="cellAns" class="mono" inputmode="decimal" autocomplete="off" value="${esc(UI.entry)}" aria-label="${esc(rowLabel(t, row))}"></span></div></div>
    <button class="btn primary big" id="cellCheck">Confirm figure</button>
    <div class="msg ${UI.ok ? 'ok' : ''}" id="ftMsg" role="status">${esc(UI.msg || '')}</div>
    ${(UI.tries || 0) >= 3 ? '<button class="link calc-show" id="calcShow">Show me the answer</button>' : '<p class="calc-hint">Type the figure, then press Enter.</p>'}</div>`;
}
let calcTimer = null;
function doneWord(t){ return ({ fuel:'Order cost confirmed', review2:'Figure checked', yearReview:'Figure checked', yearPlan:'Projection updated', afford2:'Figure checked', invest:'Figure checked' })[t.kind] || 'Forecast updated'; }
function calcDoneHtml(t){
  const [cid, rid] = UI.justDone.cell.split('|'), col = t.cols.find(c => c.id === cid), row = tRows(t).find(r => r.id === rid), more = nextOpenCell(t);
  if(!col || !row) return '';
  return `<div class="calc done"><p class="calc-ok">&#10003; ${doneWord(t)}</p>
    <div class="cstack">${stackHtml(stackRows(t, col, row))}<div class="cs ans"><span class="cs-op">=</span><span class="cs-l">${esc(rowLabel(t, row))}</span><b class="cs-v mono ok">${fmtVal(row.unit, col.values[rid])}</b></div></div>
    <div class="calc-act">${more ? '<button class="btn primary big" id="calcNext">Next figure &#9654;</button>' : ''}<button class="btn" id="calcDone">Close</button></div></div>`;
}
/* The working space: the figures in play, and a pad to work on (pen, eraser, undo, clear). */
function workPadHtml(t){
  const col = t && t.active ? t.cols.find(c => c.id === t.active.col) : null, row = col ? tRows(t).find(r => r.id === t.active.row) : null;
  const pins = col && row ? `<div class="wp-pins"><b>${esc(calcTitle(t, t.active))}</b>${stackRows(t, col, row).map(x => `<span><small>${esc(x.label)}</small><b class="mono">${x.op ? x.op + ' ' : ''}${x.value}</b></span>`).join('')}</div>` : '<p class="muted wp-none">Open a figure and its numbers are pinned here.</p>';
  return `<div class="wpad">${pins}<canvas id="padCv" aria-label="Working space"></canvas>
    <div class="wp-tools"><button class="btn small" data-pad="pen" aria-pressed="${!UI.pad.erase}">Pen</button><button class="btn small" data-pad="erase" aria-pressed="${UI.pad.erase}">Eraser</button><button class="btn small" data-pad="undo">Undo</button><button class="btn small" data-pad="clear">Clear</button><button class="btn small" data-pad="board" title="Open the working space on the Operations Wall">Show on the board</button></div></div>`;
}
function padDraw(cv){
  const g = cv.getContext('2d'), d = window.devicePixelRatio || 1; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(d, 0, 0, d, 0, 0);
  UI.pad.strokes.concat(UI.pad.cur ? [UI.pad.cur] : []).forEach(s => { g.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over'; g.strokeStyle = '#eaf6ff'; g.lineWidth = s.erase ? 18 : 3; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); s.pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); if(s.pts.length === 1) g.lineTo(s.pts[0][0] + 0.1, s.pts[0][1]); g.stroke(); });
  g.globalCompositeOperation = 'source-over';
}
function bindDock(){
  const dk = screen().querySelector('.dock'); if(!dk) return;
  const kind = dk.getAttribute('data-dock');
  on('dkShut', () => { UI.dockShut = true; render(); }); on('dkOpen', () => { UI.dockShut = false; render(); });
  on('dkClose', () => { if(kind === 'calc'){ const t = currentTable(); if(t) t.active = null; UI.justDone = null; resetEntry(); } UI.dock = { mode:null, topic:null }; render(); });
  on('calcNext', () => { const t = currentTable(); if(t){ t.active = nextOpenCell(t); resetEntry(); } UI.justDone = null; render(); });
  on('calcDone', () => { UI.justDone = null; render(); });
  on('calcShow', () => { const t = currentTable(); if(t && t.active){ const a = t.active, c = t.cols.find(x => x.id === a.col); diagNote({ kind:'answer shown to pupil', table:t.id, cell:cellId(a.col, a.row), stored:c ? c.values[a.row] : null, typed:UI.entry, tries:UI.tries }); cellCorrect(t, true); } render(); });
  screen().querySelectorAll('[data-dkwork]').forEach(b => b.onclick = () => { UI.dock = { mode:'work', topic:null }; render(); });
  clearTimeout(calcTimer);
  if(kind === 'calc' && UI.justDone && !screen().querySelector('#calcNext')){ const j = UI.justDone; calcTimer = setTimeout(() => { if(UI.justDone === j){ UI.justDone = null; render(); } }, 1600); }
  if(UI.justDone){ const c = screen().querySelector(`td[data-cellv="${UI.justDone.cell}"]`); if(c) c.classList.add('flash'); }
  const cv = $('padCv');
  if(cv){
    const fit = () => { const r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1; cv.width = Math.max(1, Math.round(r.width * d)); cv.height = Math.max(1, Math.round(r.height * d)); padDraw(cv); };
    requestAnimationFrame(fit);
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.onpointerdown = e => { try{ cv.setPointerCapture(e.pointerId); }catch(err){} UI.pad.cur = { erase:UI.pad.erase, pts:[pos(e)] }; padDraw(cv); };
    cv.onpointermove = e => { if(!UI.pad.cur) return; UI.pad.cur.pts.push(pos(e)); padDraw(cv); };
    cv.onpointerup = cv.onpointercancel = () => { if(UI.pad.cur){ UI.pad.strokes.push(UI.pad.cur); UI.pad.cur = null; padDraw(cv); } };
    screen().querySelectorAll('[data-pad]').forEach(b => b.onclick = () => { const k = b.getAttribute('data-pad');
      if(k === 'pen' || k === 'erase'){ UI.pad.erase = k === 'erase'; screen().querySelectorAll('[data-pad="pen"],[data-pad="erase"]').forEach(x => x.setAttribute('aria-pressed', String((x.getAttribute('data-pad') === 'erase') === UI.pad.erase))); }
      if(k === 'undo'){ UI.pad.strokes.pop(); padDraw(cv); } if(k === 'clear'){ UI.pad.strokes = []; padDraw(cv); }
      if(k === 'board'){ send({ type:'work', open:true }); toast('The working space is open on the Operations Wall'); } });
  }
}

/* ---------- the context for each activity ---------- */
function kv(rows){ return `<dl class="kvs">${rows.filter(Boolean).map(([k, v, c]) => `<div class="${c || ''}"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`; }
function cxSec(title, html){ return `<section class="cx"><h4>${title}</h4>${html}</section>`; }
function ctxHomeBase(){
  const h = homeData(), T = terminalData();
  return { title:'Home base', html: cxSec(`<span class="mono cy">${h.code}</span> ${esc(h.name)}`, kv([['Terminal', esc(T.name || '—')], ['Turnaround', `<span class="mono">${T.turn || WORLD.turnaroundMin} min</span>`], ['Landing fee', `<span class="mono">${money(h.fee)}</span> a flight`], ['Terminal charge', `<span class="mono">${money(T.charge || 0)}</span> a passenger`], ['Operating day', `<span class="mono">${WORLD.dayStart}–${WORLD.dayEnd}</span>`]])) };
}
function ctxMarkets(){
  const p = ourPlane(), ids = WORLD.setupRoutes.slice().sort((a, b) => routeKm(routeById(b)) - routeKm(routeById(a)));
  return { title:'Market comparison', html: `<table class="cx-t"><thead><tr><th></th>${ids.map(id => `<th class="${S.market === id ? 'on' : ''}">${flagSvg(routeById(id).flag, 16)} ${esc(routeById(id).city)}</th>`).join('')}</tr></thead><tbody>
    <tr><th>Flight time</th>${ids.map(id => `<td class="mono">${fmtDur(TIME.leg(p, routeById(id)))}</td>`).join('')}</tr>
    <tr><th>Distance</th>${ids.map(id => `<td class="mono">${num(routeKm(routeById(id)))} km</td>`).join('')}</tr>
    <tr><th>Normal fare</th>${ids.map(id => `<td class="mono">${money(routeById(id).basePrice)}</td>`).join('')}</tr>
    <tr><th>Passengers a day</th>${ids.map(id => `<td class="mono">${paxFor(routeById(id), routeById(id).basePrice)}</td>`).join('')}</tr></tbody></table>` };
}
function groupsOf(want, seats){ const g = []; for(let left = want; left > 0; left -= seats) g.push(Math.min(seats, left)); return g; }
function ctxDemand(){
  const r = routeById(S.market), p = ourPlane(), want = wantOf(r.id), g = groupsOf(want, p.seats);
  return { title:'Aircraft and market', html: cxSec('Aircraft', kv([['Type', esc(p.name.replace(/^DHC-6 /, ''))], ['Seats', `<span class="mono">${p.seats}</span> a service`]])) +
    cxSec(`${flagSvg(r.flag, 16)} ${esc(r.city)} market`, kv([['Want to fly today', `<span class="mono">${want}</span> at <span class="mono">${money(fareOf(r.id))}</span>`], ['Aircraft-sized groups', `<span class="mono">${g.join(' | ')}</span>`], ['Services to carry everyone', `<span class="mono">${g.length}</span>`]])) };
}
function ctxTiming(k){
  const r = routeById(S.market), p = ourPlane(), D = TIME.day(p, [r.id, r.id]), t = D.trips[0], home = D.segments.find(s => s.kind === 'home'), ready = home.end;
  const rows = [['Depart', `<span class="mono">${fmtTime(t.dep)}</span>`], k >= 1 && ['Flight out', `<span class="mono">${fmtDur(t.arriveAway - t.dep)}</span>`], k >= 2 && [`Turnaround in ${esc(r.city)}`, `<span class="mono">${fmtDur(t.leaveAway - t.arriveAway)}</span>`],
    k >= 3 && ['Flight back', `<span class="mono">${fmtDur(t.arr - t.leaveAway)}</span>`], k >= 4 && [`Turnaround at ${esc(homeData().city)}`, `<span class="mono">${fmtDur(ready - t.arr)}</span>`], k >= 5 && ['Ready again', `<span class="mono green">${fmtTime(ready)}</span>`, 'tot'], k >= 5 && ['Aircraft busy', `<span class="mono">${fmtDur(ready - t.dep)}</span>`]];
  return { title:'Flight timing', html: cxSec(`${esc(homeData().code)} → ${esc(aptCode(r))} → ${esc(homeData().code)}`, kv(rows)) };
}
/* Aircraft status and a small departures board that gains a row the moment a service is added. */
function ctxAircraft(){
  const p = ourPlane(), f = fleetOne(), sched = f ? schedOf(f) : [], D = sched.length ? TIME.day(p, sched) : null, end = D ? D.trips[D.trips.length - 1].arr + TIME.home(p) : null;
  const fits = id => schedFits(sched.concat([id]));
  const room = plannerRoutes().filter(fits).map(id => esc(routeById(id).city)), more = [['Room for another service', room.length ? `<span class="green">${room.join(', ')}</span>` : '<span class="orange">None</span>']];
  const fl = sched.length ? planFlights().filter(x => !x.grounded) : [];
  return { title:'Aircraft status', html: cxSec(`${esc(p.name.replace(/^DHC-6 /, ''))} · <span class="mono">${p.seats}</span> seats`, kv([['Services scheduled', `<span class="mono">${sched.length}</span>`], ['Next available', `<span class="mono">${end ? fmtTime(end) : fmtTime(firstDep())}</span>`], ['Operating day left', `<span class="mono">${fmtDur(Math.max(0, dayEnd() - (end || dayStart())))}</span>`]].concat(more))) +
    `<section class="cx deps"><h4>Departures</h4>${fl.length ? `<table class="deps-t"><thead><tr><th>Time</th><th>Flight</th><th>To</th><th>Back</th></tr></thead><tbody>${fl.map(x => `<tr><td class="mono">${fmtTime(x.dep)}</td><td class="mono">${esc(x.code)}</td><td>${esc(routeById(x.route).city)}</td><td class="mono">${fmtTimeDay(x.arr)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">No services yet.</p>'}</section>` };
}
function acCard(){ const p = ourPlane(); return `<div class="ac-card"><div class="ac-pic"><svg viewBox="0 0 120 48" style="fill:var(--c1)"><use href="#pl-${p.icon}"/></svg></div><div class="ac-t"><b>${esc(p.name)}</b><span><span class="mono">${p.seats}</span> seats</span><small>${esc(p.fact)}</small></div></div>`; }
function ctxMarket(){
  const r = routeById(S.market), p = ourPlane(), f = fleetOne(), sched = f ? schedOf(f) : [], n = serviceCounts(sched)[r.id] || 0, want = wantOf(r.id), seats = n * p.seats;
  const D = sched.length ? TIME.day(p, sched) : null, D1 = TIME.day(p, [r.id]), rdy = D1.trips[0].arr + TIME.home(p);
  return { title:'Aircraft & Market Context', html: acCard() + kv([['Ready again', `<span class="mono">${fmtTime(rdy)}</span><small>after one service</small>`], ['Operating day remaining', `<span class="mono">${fmtDur(Math.max(0, dayEnd() - (D ? D.end : dayStart())))}</span><small>until ${WORLD.dayEnd}</small>`]]) + cxSec(`${flagSvg(r.flag, 16)} ${esc(r.city)} market summary`, kv([['Current fare', `<span class="mono">${money(fareOf(r.id))}</span>`], ['Expected passengers', `<span class="mono">${Math.min(want, seats)}</span> of <span class="mono">${want}</span>`], ['Scheduled seats', `<span class="mono">${seats}</span>`], seats >= want ? ['Expected empty seats', `<span class="mono">${seats - want}</span>`] : ['Without a seat', `<span class="mono orange">${want - seats}</span>`]])) };
}
function ctxFuel(order, need, price){
  const after = S.fuel + order, W = PW(), per = W.span !== 'day';
  return { title:'Fuel status', html: cxSec('Tank', kv([['In the tank', `<span class="mono">${num(S.fuel)} L</span>`], [`${W.poss} flights burn`, `<span class="mono">${num(need)} L</span>`], per && toolLevel('fuelReq') === 'model' ? ['Fuel model', `<span class="mono">${num(fuelNeeded())} L</span> a day × <span class="mono">${num(need / Math.max(1, fuelNeeded()))}</span>`] : null, ['On order', `<span class="mono">${num(order)} L</span>`],
      after >= need || !per ? [`Left after ${W.the} flights`, `<span class="mono ${after < need ? 'red' : ''}">${num(after - need)} L</span>`] : ['Delivered automatically', `<span class="mono orange">${num(need - after)} L</span><small>at ${priceL(r2(price + (WORLD.fuelTopUp || 0)))} a litre</small>`]])) +
    cxSec('Purchase', kv([['Today\'s price', `<span class="mono">${priceL(price)}</span> a litre`], ['Order cost', `<span class="mono">${money(r2(order * price))}</span>`], ['Cash after the order', `<span class="mono gold">${money(r2(S.cash - order * price))}</span>`]])) };
}
function ctxForecast(){
  const fc = S.rnd.myForecast;
  if(!fc) return { title:"Today's forecast", html:'<p class="muted">The forecast appears here once a plan is costed.</p>' };
  const costs = fc.revenue - fc.profit;
  return { title:"Today's forecast", html: cxSec(esc(fc.plan || 'Plan A'), kv([['Revenue', `<span class="mono">${money(fc.revenue)}</span>`], ['Costs', `<span class="mono">${money(costs)}</span>`], ['Expected profit', `<span class="mono ${fc.profit >= 0 ? 'green' : 'red'}">${money(fc.profit)}</span>`, 'tot']])) };
}

/* ---------- the Overview ---------- */
/* Cash and reputation live in the top bar; the KPI row shows how the airline is operating. */
function kpiRow(mode){
  const H = S.history, h = H[H.length - 1], p = H[H.length - 2], need = fuelNeeded();
  const card = (cls, ic, label, value, sub, sp) => `<section class="hp kpi2 ${cls}"><span class="ki">${ICON[ic]}</span><div class="kt"><span class="kl">${label}</span><b class="kv2 mono">${value}</b><span class="ks2">${sub}</span></div>${sp || ''}</section>`;
  const when = h ? (h.type === 'setup' ? 'on launch day' : h.type !== 'day' ? 'in ' + periodShort(h) : mode === 'results' ? 'today' : 'yesterday') : '';
  return `<div class="kpis">${card('k-profit', 'profit', profitLabel(h), h ? `<span class="${h.profit >= 0 ? 'green' : 'red'}">${money(Math.round(h.profit))}</span>` : '—', h && p ? `${trendMark(h.profit, p.profit)} from ${money(Math.round(p.profit))}` : h ? 'First results' : 'After the first flights', spark(H.map(x => x.profit), 'pr'))}
    ${card('k-rev', 'cash', 'Revenue', h ? money(Math.round(h.revenue)) : '—', h ? (h.type === 'setup' ? 'Launch day' : `Tickets and sales`) : 'After the first flights', spark(H.map(x => x.revenue)))}
    ${card('k-pax', 'pax', 'Passengers', h ? `${h.pax}` : '—', h ? `Flew ${when}` : 'After the first flights')}
    ${card('k-load', 'seat', 'Seats filled', h && h.seats ? `${Math.round(100 * h.pax / h.seats)}%` : '—', h && h.seats ? `${h.pax} of ${h.seats} seats` : 'After the first flights')}
    ${!fuelPaid() && S.round < 2 ? card('k-fuel', 'fuel', 'Fuel', 'Free', 'Supplied by the launch deal') : fuelContract() ? card('k-fuel', 'fuel', 'Fuel', priceL(fuelPrice()), 'a litre, bought as it is used') : card('k-fuel', 'fuel', 'Fuel stock', `${num(S.fuel)} L`, need ? (S.fuel >= need ? `<span class="green">Covers today's plan</span>` : `<span class="orange">Plan needs ${num(need)} L</span>`) : S.fuel ? `Worth ${money(S.fuelValue)}` : 'No services planned')}</div>`;
}
function liveOpsHtml(mode){
  const fl = boardFlights().filter(f => !f.grounded);
  if(!fl.length) return '<div class="pb"><p class="muted">No services planned yet.</p></div>';
  return `<div class="pb"><table class="hq-t lo"><thead><tr><th>Time</th><th>Flight</th><th>To</th><th class="num">Seats</th><th>Status</th></tr></thead><tbody>${fl.map(f => {
    const r = routeById(f.route), s = mode === 'live' ? displayStatus(f) : (S.rnd.status[f.key] || 'SCHEDULED');
    return `<tr><td class="num">${fmtTime(f.dep)}</td><td>${esc(f.code)}</td><td>${flagSvg(r.flag, 16)} ${esc(r.city)}</td><td class="num">${S.rnd.applied ? `${f.sold}/${f.seats}` : f.seats}</td><td><span class="st-dot ${statusClass(s)}"></span><span class="lo-st ${statusClass(s)}" data-lo="${f.key}">${esc(cap(s))}</span></td></tr>`; }).join('')}</tbody></table></div>`;
}
function capFirst(s){ s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
function cap(s){ s = String(s || '').toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); }
function dayReviews(){ return (S.rnd.applied ? S.rnd.reviews : (lastDay() && lastDay().reviews)) || []; }
function feedbackHtml(){
  const rv = dayReviews(); UI.fbI = clamp(UI.fbI || 0, 0, Math.max(0, rv.length - 1));
  if(!rv.length) return '<div class="pb"><p class="muted">Passenger reviews appear here after your flights.</p></div>';
  return `<div class="pb fb" data-n="${rv.length}">${rv.map((v, i) => `<div class="fb-card ${i === UI.fbI ? 'on' : ''}"><span class="fb-face">${v.face}</span><div><span class="stars">${starsHtml(v.stars)}</span><p>“${esc(v.text)}”</p></div></div>`).join('')}
    <div class="fb-nav"><button class="btn small" data-fb="-1" aria-label="Previous review">‹</button><span class="fb-n">${UI.fbI + 1} / ${rv.length}</span><button class="btn small" data-fb="1" aria-label="Next review">›</button></div></div>`;
}
function fbShow(d){
  const box = screen().querySelector('.fb'); if(!box) return; const cards = box.querySelectorAll('.fb-card'), n = cards.length; if(!n) return;
  UI.fbI = ((UI.fbI || 0) + d + n) % n; cards.forEach((c, i) => c.classList.toggle('on', i === UI.fbI)); const t = box.querySelector('.fb-n'); if(t) t.textContent = `${UI.fbI + 1} / ${n}`;
}
function todayCard(mode){
  if(mode === 'sim') return simCard();
  if(mode === 'results' && S.rnd.sim) return periodResultsCard();
  const f = fleetOne(), p = ourPlane(), sched = f ? schedOf(f) : [], need = fuelNeeded();
  if(mode === 'live'){ const a = S.rnd.anim;
    return `${hqHead('Operations', 'LIVE')}<div class="pb td2"><div class="live-clock"><span class="kl">Airport time</span><b id="ovClock">${fmtTime(a ? a.from : firstDep())}</b></div><div class="live-bar"><i id="ovProg"></i></div>
      <p class="muted">${esc(svcLabel(sched))} · ${plural(boardFlights().filter(x => !x.grounded).length, 'flight')} today. Watch the map and Live Operations.</p>
      <div class="td-act"><button class="btn" id="skipDay">Skip to the end of the day ▶</button></div></div>`; }
  if(mode === 'results'){
    const pr = S.rnd.profit, rev = S.rnd.revenue, costs = S.rnd.costs, first = S.phase === 'setup', fc = S.rnd.myForecast, h = lastDay();
    const diff = fc ? Math.round(pr) - Math.round(fc.profit) : 0;
    return `${hqHead(first ? 'Launch Day Results' : `Day ${S.round} Results`, 'ALL LANDED')}<div class="pb td2 dr">
      <div class="dr-rcp"><div class="rev"><span class="kl">Revenue</span><b data-count="${rev}">${money(rev)}</b>${first ? '<small>Money received from ticket sales</small>' : ''}</div><i>−</i>
        <div class="cost"><span class="kl">Costs</span><b>${money(Math.round(costs))}</b>${first ? '<small>Money spent operating the airline</small>' : ''}</div><i>=</i>
        <div class="prof ${pr < 0 ? 'neg' : ''}"><span class="kl">${pr >= 0 ? 'Profit' : 'Loss'}</span><b>${money(Math.round(Math.abs(pr)))}</b>${first ? '<small>Money remaining after costs</small>' : ''}</div></div>
      ${fc ? `<p class="dr-fc">Projected: ${money(Math.round(fc.profit))} · actual: ${money(Math.round(pr))} ${Math.abs(diff) < 2 ? '<span class="green">✓ as forecast</span>' : `<span class="orange">${diff > 0 ? '+' : '−'}${money(Math.abs(diff))}</span> ${esc((S.rnd.vs && S.rnd.vs.why) || 'Fuel was charged at the tank\'s average price.')}`}</p>` : ''}
      ${cashLine()}
      <div class="dr-routes">${h && h.routes ? Object.keys(h.routes).map(id => { const x = h.routes[id], miss = Math.max(0, (x.want || x.pax) - x.pax); return `<span>${flagSvg(routeById(id).flag, 16)} <b>${esc(routeById(id).city)}</b> ${x.want} wanted · ${x.pax} flew · <span class="${miss ? 'orange' : ''}">${miss} no seat</span></span>`; }).join('') : ''}</div>
      <div class="td-act">${first ? '' : helpChip('money')}<span class="grow"></span><button class="btn primary act" id="nx">${closeWord()} ▶</button></div></div>`; }
  if(mode === 'planning'){
    return `${hqHead(railTitle()[0], 'IN PROGRESS')}<div class="pb td2"><p class="muted">You are part-way through today's plan.</p>
      <div class="td-list">${S.steps.map((s, i) => ({ t:s.t, i })).filter(x => WS_STEPS.includes(x.t)).map(x => `<div class="${x.i < S.si ? 'done' : x.i === S.si ? 'cur' : ''}"><span>${x.i < S.si ? '✓' : x.i === S.si ? '▶' : '·'} ${RAIL_LABEL[x.t]}</span><b>${esc(railValue(x.t, x.i))}</b></div>`).join('')}</div>
      <div class="td-act"><button class="btn primary act" id="contPlan">Continue planning ▶</button></div></div>`; }
  // the morning: today's headline, the standing plan and one action
  const fares = Object.keys(serviceCounts(sched)).map(id => `${routeById(id).city} ${money(fareOf(id))}`).join(' · ');
  return `${hqHead("Today's Plan", periodTag().toUpperCase())}<div class="pb td2"><h3 class="td-news2">${esc(S.rnd.headline || "Today's operation")}</h3>${(S.rnd.brief || []).map(l => `<p class="td-brief">${esc(l)}</p>`).join('')}
    <div class="td-list edits"><div><span>Timetable</span><b>${sched.length ? esc(svcLabel(sched)) + ` · until <span class="mono">${fmtTime(TIME.day(p, sched).end)}</span>` : '—'}</b><button class="link" data-plan>Edit</button></div><div><span>Fares</span><b>${esc(fares || '—')}</b><button class="link" data-plan>Edit</button></div>${snacksOn() && S.round >= 2 ? `<div><span>On board</span><b>${esc(onboardOf().label)}</b><button class="link" data-plan>Edit</button></div>` : ''}${depsOn() && S.round >= 4 && sched.length ? `<div><span>Departures</span><b class="mono">${TIME.day(p, sched).trips.map(t => fmtTime(t.dep)).join(', ')}</b><button class="link" data-plan>Edit</button></div>` : ''}
      ${fuelContract() ? `<div><span>Fuel</span><b>Bought as it is used at <span class="mono">${priceL(fuelPrice())}</span> a litre</b><span></span></div>` : fuelPaid() ? `<div><span>Fuel</span><b class="${need > S.fuel ? 'orange' : ''}"><span class="mono">${num(S.fuel)} L</span> · plan needs <span class="mono">${num(need)} L</span></b><button class="link" data-plan>Edit</button></div>` : '<div><span>Fuel</span><b>Supplied free by the launch deal</b><span></span></div>'}</div>
    <div class="td-act"><button class="btn primary act" id="startDay">${planWord()} ▶</button></div></div>`;
}
function renderOverview(mode){
  const wide = innerWidth >= 1600 && innerHeight >= 880, h = lastDay(), warn = intelSituations().length + protoIntel().filter(x => x.warn).length;
  const mapP = `<section class="hp p-map">${hqHead('Network', '', `<span class="layers">${MAP_LAYERS.map(l => `<button class="ptab" data-layer="${l[0]}" aria-pressed="${UI.mapLayer === l[0]}">${l[1]}</button>`).join('')}</span>`)}<div class="hq-map" id="hqMap"></div></section>`;
  const fbT = ['fb', 'Passenger Feedback', feedbackHtml], alT = ['al', 'Alerts & Messages', intelHtml, warn || ''];
  const fbP = mode === 'results' || mode === 'live' ? tabbedPanel('p-fb', 'fbr', [fbT, alT]) : tabbedPanel('p-fb', 'fbm', [alT, fbT]);
  UI.mapLayer = UI.mapLayer || 'routes';
  screen().innerHTML = shell(`<div class="ov ${wide ? 'wide' : 'compact'}">${kpiRow(mode)}${mapP}<section class="hp p-td">${todayCard(mode)}</section>
    <section class="hp p-rp">${hqHead('Route Performance', h ? (h.type === 'setup' ? 'LAUNCH DAY' : periodShort(h).toUpperCase()) : '')}${evidenceHtml(h, ownedRoutes())}</section>
    ${wide ? `<section class="hp p-fi">${hqHead('Financial Overview', 'BY DAY')}${financeHtml()}</section>` : ''}
    <section class="hp p-lo">${hqHead('Live Operations', mode === 'live' ? 'LIVE' : S.rnd.applied ? 'ALL LANDED' : 'TODAY')}${liveOpsHtml(mode)}</section>${fbP}</div>`);
  on('startDay', () => { UI.view = null; next(); }); screen().querySelectorAll('[data-plan]').forEach(b => b.onclick = () => { UI.view = null; next(); }); on('contPlan', () => { UI.view = null; render(); });
  on('nx', closeDay); on('skipDay', () => { if(S.rnd.anim) S.rnd.anim.start = Date.now() - S.rnd.anim.dur; });
  screen().querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { const [k, v] = b.getAttribute('data-tab').split('|'); UI.hqTabs[k] = v; render(); });
  screen().querySelectorAll('[data-layer]').forEach(b => b.onclick = () => { UI.mapLayer = b.getAttribute('data-layer'); render(); });
  if(hqMap) hqMap.destroy(); hqMap = makeMap($('hqMap'), { scale:1, pad:0.65, planes:true }); hqMap.layer = UI.mapLayer;
  hqFit(); requestAnimationFrame(() => { if(!hqMap) return; hqMap.autoFit(true); hqMap.render(); });
}
function closeDay(){ UI.view = null; UI.fbI = 0; if(S.phase === 'setup') startProtoDay(1); else if(S.round >= 3) next(); else startProtoDay(S.round + 1); }
R.hq = () => renderOverview('plan');
/* Operations run on the HQ: the clock, the map and Live Operations move together, then the results land here. */
let liveLoop = null;
R.fly = st => {
  renderOverview('live');
  const a = S.rnd.anim;
  if(!a || !S.rnd.flights.some(f => !f.grounded && !f.noFuel)){ setTimeout(() => { if(step() === st) next(); }, 800); return; }
  if(liveLoop === st) return; liveLoop = st;
  const tick = () => {
    if(step() !== st){ liveLoop = null; return; }
    const t = clamp((Date.now() - a.start) / a.dur, 0, 1), now = a.from + (a.to - a.from) * t;
    const c = $('ovClock'); if(c) c.textContent = fmtTime(now); const pr = $('ovProg'); if(pr) pr.style.width = (t * 100).toFixed(1) + '%';
    screen().querySelectorAll('[data-lo]').forEach(e => { const f = S.rnd.flights.find(x => x.key === e.getAttribute('data-lo')); if(!f) return; const s = displayStatus(f), txt = cap(s); if(e.textContent !== txt){ e.textContent = txt; e.className = 'lo-st ' + statusClass(s); const d = e.previousElementSibling; if(d) d.className = 'st-dot ' + statusClass(s); } });
    if(hqMap && !S.overlay && !UI.view) hqMap.render();
    if(t < 1) requestAnimationFrame(tick); else { liveLoop = null; setTimeout(() => { if(step() === st) next(); }, 700); }
  };
  requestAnimationFrame(tick);
};
R.results = st => {
  applyResults();
  if(!S.rnd.whyLogged){ S.rnd.whyLogged = true; addNews(S.rnd.why.filter(w => !['🗓️', '🎟️', '🧾', '⛽'].includes(w.ic) || /not enough fuel/.test(w.text)).map(w => ({ tag:'REPORT', text:w.text }))); }
  renderOverview('results');
};
/* Network, Fleet and Finance: bigger views of the same data. */
function renderView(v){
  const h = lastDay(), p = ourPlane();
  let inner = '';
  if(v === 'network') inner = `<div class="vw net"><section class="hp p-map">${hqHead('Network', `${ownedRoutes().length} ROUTES`)}<div class="hq-map" id="hqMap"></div></section><section class="hp">${hqHead('Route Performance', '')}${evidenceHtml(h, ownedRoutes())}</section></div>`;
  if(v === 'fleet') inner = `<div class="vw"><section class="hp">${hqHead('Fleet', plural(S.fleet.length, 'aircraft').toUpperCase().replace('AIRCRAFTS', 'AIRCRAFT'))}${S.fleet.length ? fleetHtml() : '<div class="pb"><p class="muted">No aircraft yet.</p></div>'}</section>
    <section class="hp">${hqHead(p.name, 'START-UP AIRCRAFT')}<div class="pb fl-specs"><div><span class="kl">Seats</span><b>${p.seats}</b></div><div><span class="kl">Speed</span><b>${num(p.speed)} km/h</b></div><div><span class="kl">Range</span><b>${num(p.range)} km</b></div><div><span class="kl">Running cost</span><b>${money(p.hourCost)} an hour</b><small>+ ${money(homeData().fee)} landing fee</small></div><div><span class="kl">Daily cost</span><b>${money(p.dayCost)}</b></div><div><span class="kl">Fuel</span><b>${p.fuelUse} L</b><small>per 100 km</small></div></div></section></div>`;
  if(v === 'finance') inner = `<div class="vw"><section class="hp">${hqHead('Financial Overview', 'BY DAY')}<div class="pb fin-pb"></div></section>
    ${tabbedPanel('p-fd', 'fin2', [['days', 'History', () => finHistoryHtml()], ['plans', 'Plans', plansHtml], ['models', 'Models', modelsHtml]])}</div>`;
  screen().innerHTML = shell(inner);
  if(v === 'network'){ if(hqMap) hqMap.destroy(); hqMap = makeMap($('hqMap'), { scale:1, pad:0.65, planes:true }); hqMap.layer = 'routes'; requestAnimationFrame(() => { if(!hqMap) return; hqMap.autoFit(true); hqMap.render(); }); }
  if(v === 'finance'){ const fb = screen().querySelector('.fin-pb'); requestAnimationFrame(() => { if(fb && S.history.length) fb.innerHTML = finChart({ n:14, w:fb.clientWidth - 28, h:Math.max(140, fb.clientHeight - 40) }); else if(fb) fb.innerHTML = '<p class="muted">The chart starts after the first flights.</p>'; }); }
}

function finHistoryHtml(){
  return `<div class="pb"><table class="hq-t"><thead><tr><th>When</th><th class="num">Passengers</th><th class="num">Revenue</th><th class="num">Costs</th><th class="num">Profit</th><th class="num">Cash after</th><th class="num">Fuel stock</th></tr></thead><tbody>${S.history.slice().reverse().map(x => `<tr><td>${esc(x.type === 'setup' ? 'Launch day' : x.type === 'day' ? dateShort(x.from) : capFirst(periodShort(x)))}</td><td class="num">${num(x.pax)}</td><td class="num">${money(Math.round(x.revenue))}</td><td class="num">${money(Math.round(x.costs))}</td><td class="num ${x.profit >= 0 ? 'green' : 'red'}">${money(Math.round(x.profit))}</td><td class="num">${money(Math.round(x.cash))}</td><td class="num">${x.fuelL !== undefined ? `${num(x.fuelL)} L` : '—'}</td></tr>`).join('') || '<tr><td colspan="7" class="muted">Nothing flown yet.</td></tr>'}</tbody></table></div>`;
}
/* Full screen in one click (the two-screen Present lives in the Home menu). */
function fsEl(){ return document.fullscreenElement || document.webkitFullscreenElement; }
function toggleFullscreen(){
  const r = document.documentElement;
  try{ if(fsEl()){ (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; } const p = (r.requestFullscreen || r.webkitRequestFullscreen).call(r); if(p && p.catch) p.catch(() => toast('Full screen was blocked by the browser. Press F11 instead.')); }catch(e){ toast('Press F11 for full screen.'); }
}
function syncFsBtn(){ const l = document.getElementById('fsLbl'); if(l) l.textContent = fsEl() ? ' Exit full screen' : ' Full screen'; }

/* Fares follow distance from the chosen home airport (real airlines charge more for longer flights):
   normal fare ≈ £30 + 14p a km, to the nearest £10; the fare buttons run from £10 below to £30 above it. */
function normalFare(route, hh){ return Math.max(50, Math.round((30 + 0.14 * routeKm(route, hh)) / 10) * 10); }
function syncRoutesToHome(){
  if(S && S.steps){ const fi = S.steps.findIndex(x => x.t === 'fareTry'); if(fi >= 0 && S.si !== fi){ S.steps.splice(fi, 1); if(S.si > fi) S.si--; if(S.rnd && S.rnd.returnTo > fi) S.rnd.returnTo--; } }
  if(S && S.steps && !S.steps.some(x => x.t === 'ready')){ const i = S.steps.findIndex(x => x.t === 'fuelPlan'); if(i >= 0 && S.si <= i) S.steps.splice(i + 1, 0, { t:'ready' }); }
  if(!S || !S.home) return;
  if(S.home === syncRoutesToHome.home) return; syncRoutesToHome.home = S.home;
  WORLD.setupRoutes.map(routeById).forEach(r => { const b = normalFare(r); r.basePrice = b; r.fares = [b - 10, b, b + 10, b + 20, b + 30]; r.prices = r.fares.slice(); r.setupPrices = r.fares.slice();
    if(S.phase === 'setup' && S.prices && S.prices[r.id] !== undefined && !r.fares.includes(S.prices[r.id])) S.prices[r.id] = b; });
}
/* For the balance checks in testing. */
window.__proto = { WORLD, planOutcome, newState, buyPlane, planeById, routeById, schedFits, emptyRnd, syncRoutesToHome, setS: v => { S = v; }, getS: () => S };

/* ==================================================================
   COST YOUR OPTIONS: three plans side by side, each a small spreadsheet (revenue lines, cost lines, profit).
   Plan A is the live plan (the planner's); B and C start as copies. He works out the profit of every
   different plan, then chooses one to fly. Changing a plan clears only that plan's answers.
   ================================================================== */
const PLAN_NAMES = ['Plan A', 'Plan B', 'Plan C'];
/* The fare menu, modelled: Plan A at today's fares, Plan B one fare lower, Plan C one fare higher.
   If the timetable, snacks or first departure change before costing again, B and C follow the new Plan A. */
function fareShift(pl, d){
  const next = JSON.parse(JSON.stringify(pl));
  [...new Set(next.sched)].forEach(id => { const r = routeById(id), F = r.fares || [r.basePrice], cur = next.prices[id] !== undefined ? next.prices[id] : fareOf(id);
    let k = F.indexOf(cur); if(k < 0) k = Math.max(0, F.indexOf(r.basePrice)); next.prices[id] = F[clamp(k + d, 0, F.length - 1)]; });
  return next;
}
function planBase(pl){ return JSON.stringify([pl.sched, pl.firstDep, pl.onboard]); }
function costingCheck(){ if(S.rnd.options && S.rnd.optionsBase !== planBase(currentPlan())) S.rnd.options = null; }
function optionPlans(){
  const A = currentPlan();
  if(!S.rnd.options){ S.rnd.options = [null, fareShift(A, -1), fareShift(A, 1)]; S.rnd.optionsBase = planBase(A); }
  return [A, S.rnd.options[1], S.rnd.options[2]];
}
/* Everything a plan would do today, as spreadsheet lines (worked out on a copy of the state). */
function planLines(pl){
  const f = fleetOne(), keep = { sched: f ? f.schedule : [], route: f ? f.route : null, prices: S.prices, dep: S.firstDep, ob: S.onboard };
  try{
    if(f){ f.schedule = pl.sched.slice(); f.route = pl.sched[0] || null; } S.prices = Object.assign({}, pl.prices); S.firstDep = pl.firstDep; S.onboard = pl.onboard;
    const p = ourPlane(), fits = !pl.sched.length || schedFits(pl.sched), fl = planFlights().filter(x => !x.grounded), X = dayExtras(fl), r1 = S.market, r2id = otherRoute();
    const paxOn = id => fl.filter(x => x.route === id).reduce((t, x) => t + x.sold, 0);
    const v = { pax1: paxOn(r1), fare1: fareOf(r1), pax2: paxOn(r2id), fare2: fareOf(r2id) };
    v.tk1 = v.pax1 * v.fare1; v.tk2 = v.pax2 * v.fare2; v.snack = X.obRev; v.rev = v.tk1 + v.tk2 + v.snack;
    v.run = fl.reduce((t, x) => t + x.runCost, 0); v.fuel = Math.round(fl.reduce((t, x) => t + x.fuelCost, 0)); v.term = X.term; v.stock = X.obCost; v.crew = X.crew; v.day = fleetDayCost();
    v.cost = v.run + v.fuel + v.term + v.stock + v.crew + v.day; v.profit = v.rev - v.cost;
    const routes = {}; fl.forEach(x => { routes[x.route] = (routes[x.route] || 0) + x.sold; });
    const nos = Object.keys(routes).reduce((t, id) => t + Math.max(0, paxWant(routeById(id), fareOf(id)) - routes[id]), 0);
    const D = pl.sched.length ? TIME.day(p, pl.sched) : null;
    return { v, fits, nos, pax: fl.reduce((t, x) => t + x.sold, 0), end: D ? D.end : null, D, crews: X.crews, fuelL: fl.reduce((t, x) => t + x.fuelL, 0) };
  } finally { if(f){ f.schedule = keep.sched; f.route = keep.route; } S.prices = keep.prices; S.firstDep = keep.dep; S.onboard = keep.ob; }
}
function miniBar(D){
  const s0 = dayStart(), span = dayEnd() - s0, X = m => clamp(100 * (m - s0) / span, 0, 100);
  return `<div class="oc-bar">${D ? D.segments.map(sg => `<i class="seg ${sg.kind}" style="left:${X(sg.start).toFixed(1)}%;width:${Math.max(.6, X(sg.end) - X(sg.start)).toFixed(1)}%"></i>`).join('') + (D.end > dayEnd() ? `<i class="seg overrun" style="left:${X(dayEnd())}%;width:2%"></i>` : '') : ''}</div><div class="oc-ax"><span>${WORLD.dayStart}</span><span>${WORLD.dayEnd}</span></div>`;
}
function planControls(i, pl, L, same){
  const routes = S.phase === 'setup' ? [S.market] : plannerRoutes(), c = serviceCounts(pl.sched);
  const row = (lab, key, val) => `<div class="oc-r"><span class="oc-l">${lab}</span><button class="oc-b" data-oc="${i}|${key}|-1" aria-label="less">−</button><span class="oc-v">${val}</span><button class="oc-b" data-oc="${i}|${key}|1" aria-label="more">+</button></div>`;
  return `<div class="oc">${routes.map(id => { const r = routeById(id); return row(`${flagSvg(r.flag, 14)} ${({ par:'CDG', dub:'DUB' })[id] || esc(r.city)}`, 'svc|' + id, '×' + (c[id] || 0)) + (c[id] ? row('Fare', 'fare|' + id, money(pl.prices[id] || r.basePrice)) : ''); }).join('')}
    ${S.round >= 1 && S.phase !== 'setup' ? `<div class="oc-r"><span>Snacks</span><select data-ocs="${i}">${Object.keys(ONBOARD).map(k => `<option value="${k}" ${pl.onboard === k ? 'selected' : ''}>${esc({ none:'None', sell3:'£3', sell5:'£5', free:'Free' }[k] || k)}</option>`).join('')}</select></div>` : ''}
    ${S.round >= 2 ? row('From', 'dep', fmtTime(pl.firstDep)) : ''}
    ${miniBar(L.D)}
    <div class="oc-i">${L.fits ? `<span>${L.pax} fly · <span class="${L.nos ? 'orange' : ''}">${L.nos} no seat</span></span><span>free ${L.end ? fmtTime(L.end) : '—'} · <span class="${L.crews > 1 ? 'orange' : ''}">${L.crews} crew${L.crews > 1 ? 's' : ''}</span></span>` : '<span class="red">Doesn\'t fit in the day.</span>'}</div>
    ${same !== null ? `<div class="oc-same">Same as ${PLAN_NAMES[same]}</div>` : ''}</div>`;
}
function changePlan(i, key, d){
  const pl = i === 9 ? testPlan() : optionPlans()[i], [what, id] = key.split('|'), r = id ? routeById(id) : null, next = JSON.parse(JSON.stringify(pl));
  if(what === 'svc'){ const c = serviceCounts(next.sched); c[id] = clamp((c[id] || 0) + d, 0, WORLD.maxTrips || 4); next.sched = schedFrom(c); }
  if(what === 'fare'){ const F = r.fares || [r.basePrice], k = F.indexOf(next.prices[id] || r.basePrice); next.prices[id] = F[clamp((k < 0 ? F.indexOf(r.basePrice) : k) + d, 0, F.length - 1)]; }
  if(what === 'dep') next.firstDep = clamp(next.firstDep + 15 * d, DEP_MIN, DEP_MAX);
  const ok = (() => { const keepDep = S.firstDep; S.firstDep = next.firstDep; const f = !next.sched.length || schedFits(next.sched); S.firstDep = keepDep; return f; })();
  if(!ok){ toast("That timetable won't fit in the day."); return; }
  setPlan(i, next);
}
function setPlan(i, pl){
  if(i === 0){ const f = fleetOne(); setSchedule(f.uid, pl.sched.slice()); Object.assign(S.prices, pl.prices); S.firstDep = pl.firstDep; S.onboard = pl.onboard; refreshPlan(); }
  else if(i === 9) S.rnd.test = pl;     // the month's test plan
  else S.rnd.options[i] = pl;
  render();
}
/* The fare menu: what each fare brings, and which plan is trying it. */
function fareMenu(plans){
  const ids = [...new Set([].concat(...plans.map(pl => pl.sched)))];
  return ids.map(id => { const r = routeById(id);
    return `<section class="cx fmenu-s"><h4>${flagSvg(r.flag, 16)} ${esc(r.city)} fare menu</h4><div class="fmenu">${(r.fares || [r.basePrice]).map(x => { const who = plans.map((pl, i) => pl.sched.includes(id) && pl.prices[id] === x ? 'ABC'[i] : '').join('');
      return `<div class="fm ${who ? 'on' : ''}"><b class="mono">${money(x)}</b><span class="mono">${paxWant(r, x)}</span><i>${who || '&nbsp;'}</i></div>`; }).join('')}</div></section>`; }).join('') + (ids.length ? '<p class="fm-k">Fare · people who want to fly · plan</p>' : '');
}
R.options = () => {
  const sc = scaffold(), plans = optionPlans(), W = PW(), per = W.span !== 'day', lines = plans.map(per ? periodLines : planLines), ctx = ['launch', 'day1', 'day2', 'day3'][sc];
  const twoRoutes = lines.some(L => L.v.pax2 > 0), snacks = lines.some(L => L.v.snack || L.v.stock), crew = lines.some(L => L.v.crew);
  // a day is costed line by line; a week or a month as a day's revenue and running costs × days, plus the fuel model
  const rowIds = per ? ['revDay', 'days', 'rev', 'opsDay', 'ops', 'fuel', 'cost', 'profit'] : ['tk1'].concat(twoRoutes ? ['tk2'] : []).concat(snacks ? ['snack'] : []).concat(['rev', 'run', 'fuel', 'term']).concat(snacks ? ['stock'] : []).concat(crew ? ['crew'] : []).concat(['day', 'cost', 'profit']);
  const same = plans.map((pl, i) => { for(let j = 0; j < i; j++) if(planKey(plans[j]) === planKey(pl)) return j; return null; });
  const cols = plans.map((pl, i) => ({ id:'abc'[i], label:PLAN_NAMES[i], sub:pl.sched.length ? '' : 'No flights', values:lines[i].v, parts:lines[i].parts, headHtml:planControls(i, pl, lines[i], same[i]) }));
  const tid = (per ? 'popts:' : 'opts:') + S.day, prev = S.rnd.tables[tid];
  const t = ensureTable(tid, per ? 'periodPlan2' : 'options', cols, { context:ctx, rowIds, labels: per ? periodLabels() : { tk1:`${routeById(S.market).city} tickets`, tk2:`${routeById(otherRoute()).city} tickets` } });
  // Launch Day opens the first figure by itself; after that the pupil chooses which figure to complete
  if(t !== prev){ const a = prev && prev.active, c = a && t.cols.find(x => x.id === a.col), ri = a ? tRows(t).findIndex(r => r.id === a.row) : -1;
    t.active = prev ? (c && ri >= 0 && cellState(t, c, ri) === 'enter' ? a : null) : (sc === 0 ? t.active : null); }
  // a plan identical to an earlier one, or with no flights, needs no working out
  const typed = typedIds(t);
  cols.forEach((c, i) => typed.forEach(r => { const k = cellId(c.id, r), src = same[i] !== null ? cellId(cols[same[i]].id, r) : null;
    if(!t.done[k] && ((src && t.done[src]) || !plans[i].sched.length || !lines[i].fits)) t.done[k] = true; }));
  if(t.active && t.done[cellId(t.active.col, t.active.row)]) t.active = null;
  const done = tableComplete(t), best = done ? lines.reduce((b, L, i) => (lines[i].fits && plans[i].sched.length && (b < 0 || L.v.profit > lines[b].v.profit)) ? i : b, -1) : -1;
  const left = i => typed.filter(r => { const ri = tRows(t).findIndex(x => x.id === r); return ri >= 0 && ['enter', 'wait'].includes(cellState(t, cols[i], ri)); }).length;
  const cards = lines.map((L, i) => { const pl = plans[i], n = left(i), usable = pl.sched.length && L.fits && same[i] === null;
    const st = !pl.sched.length ? '<span class="muted">No flights</span>' : !L.fits ? '<span class="red">Doesn\'t fit</span>' : same[i] !== null ? `<span class="muted">Same as ${PLAN_NAMES[same[i]]}</span>` : n ? `<span class="fp-todo">${plural(n, 'figure')} to complete</span>` : `<b class="mono ${L.v.profit >= 0 ? 'green' : 'red'}">${money(L.v.profit)}</b>`;
    return `<div class="fc-plan ${i === best ? 'best' : ''}"><div class="fp-h"><b>${PLAN_NAMES[i]}</b><span>${pl.sched.length ? esc(svcLabel(pl.sched)) : ''}</span></div><div class="fp-p">${st}${done && usable ? `<button class="btn small ${i === best ? 'primary' : ''}" data-fly="${i}">${goLabel(`Use ${PLAN_NAMES[i].replace('Plan ', '')}`)}</button>` : ''}</div></div>`; }).join('');
  screen().innerHTML = taskFrame({ question: per ? `Forecast ${W.now}` : 'Cost your options', work:true, calc:t,
    story: sc === 0 ? ['Lower fares usually attract more passengers. Higher fares earn more from each ticket.', 'Each plan charges a different fare. Work out each profit (total revenue − total costs), then choose.'] : [],
    say:'Cost your options. Work out the profit of each plan: total revenue minus total costs.',
    context:{ title:"Fares and forecast", html:`${fareMenu(plans)}<div class="fc-plans">${cards}</div>${done ? '<p class="muted cx-note">Think about people left without a seat, too.</p>' : '<p class="muted cx-note">Choose <b>Complete figure</b> in the spreadsheet to work out a figure.</p>'}` },
    main:`<div class="opts-wrap">${tableHtml(t)}</div>` });
  bindTable(t);
  screen().querySelectorAll('[data-oc]').forEach(b => b.onclick = e => { e.stopPropagation(); const [i, what, id, d] = b.getAttribute('data-oc').split('|'); changePlan(+i, id !== undefined && what !== 'dep' ? what + '|' + id : what, +(d === undefined ? id : d)); });
  screen().querySelectorAll('[data-ocs]').forEach(s => s.onchange = () => { const i = +s.getAttribute('data-ocs'), pl = JSON.parse(JSON.stringify(optionPlans()[i])); pl.onboard = s.value; setPlan(i, pl); });
  screen().querySelectorAll('[data-fly]').forEach(b => b.onclick = () => {
    const i = +b.getAttribute('data-fly'), pl = plans[i], v = lines[i].v;
    if(i > 0){ S.rnd.options[i] = currentPlan(); setPlan(0, pl); }
    S.rnd.chosenPlan = PLAN_NAMES[i];
    S.rnd.myForecast = per ? { profit:v.profit, revenue:v.rev, ops:v.ops, fuel:v.fuel, plan:PLAN_NAMES[i], key:fcKey(currentPlan()) } : { profit:v.profit, revenue:v.rev, run:v.run + v.term + v.stock, fuel:v.fuel, over:v.day, crew:v.crew, plan:PLAN_NAMES[i], key:planKey(currentPlan()) };
    resetEntry(); UI.justDone = null; advance(); });
};

/* ==================================================================
   FUEL: cash → tank → flights. The tank holds batches; flights burn the oldest first.
   Buying fuel moves money from cash into the tank; it becomes a cost only when it is burned.
   ================================================================== */
const LOT_COLOURS = ['#1f6fc4', '#2a8ae6', '#4aa8ff', '#79c2ff', '#a6d8ff'];
function tankSvg(need, order){
  const cap = tankCapacity(), H = 250, W = 92, y = L => H - H * L / cap, lots = fuelLots();
  let acc = 0, g = '';
  lots.forEach((x, i) => { const h = H * x.L / cap; g += `<rect x="6" y="${(y(acc + x.L)).toFixed(1)}" width="${W - 12}" height="${h.toFixed(1)}" fill="${LOT_COLOURS[i % LOT_COLOURS.length]}"><title>${num(x.L)} L bought at ${priceL(x.p)}</title></rect>`; acc += x.L; });
  if(order) g += `<rect x="6" y="${y(acc + order).toFixed(1)}" width="${W - 12}" height="${(H * order / cap).toFixed(1)}" fill="rgba(61,220,151,.18)" stroke="#3ddc97" stroke-dasharray="5 4"/>`;
  const burn = Math.min(need, acc + order);
  if(burn > 0) g += `<rect x="6" y="${y(burn).toFixed(1)}" width="${W - 12}" height="${(H * burn / cap).toFixed(1)}" fill="url(#burnHatch)" stroke="#ff9f43" stroke-width="2"/>`;
  return `<svg class="tank-svg" viewBox="0 0 ${W} ${H + 2}" aria-hidden="true"><defs><pattern id="burnHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="rgba(255,159,67,.10)"/><line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,159,67,.55)" stroke-width="3"/></pattern></defs>
    <rect x="1" y="1" width="${W - 2}" height="${H}" rx="3" fill="rgba(255,255,255,.03)" stroke="rgba(150,190,255,.45)" stroke-width="2"/>${g}</svg>`;
}
R.fuelPlan = st => {
  const sc = scaffold(), f = fleetOne(), sched = schedOf(f), need = periodNeed(), have = S.fuel, price = fuelPrice(), lot = WORLD.fuelLot, W = PW(), per = W.span !== 'day';
  const space = Math.floor(tankSpace() / lot) * lot, afford = Math.floor(Math.max(0, S.cash) / (lot * price)) * lot, maxL = Math.max(0, Math.min(space, afford));
  const order = S.rnd.fuelOrder ? S.rnd.fuelOrder.litres : 0, enough = Math.max(0, Math.ceil(Math.max(0, need - have) / lot) * lot), after = have + order;
  const parts = fifoCursor(order ? { litres:order, price } : null).parts(need), burnCost = r2(parts.reduce((t, x) => t + x.L * x.p, 0));
  const setOrder = L => { L = clamp(L, 0, maxL); S.rnd.fuelOrder = L ? { litres:L, price, total:r2(L * price) } : null; UI.justDone = null; resetEntry(); render(); };
  const prices = []; for(let i = Math.max(0, S.round - 5); i <= S.round; i++) prices.push([beatLabel(i), fuelPrice(i)]);
  // on launch day and Day 2 the order cost is a figure to complete (in the dock); the screen never changes
  let t = null, billDone = true;
  if(order && false){   // the fuel cost is worked out once, on the COST screen; the order bill is the model's
    const tid = 'fuelbill:' + S.day + ':' + order, fresh = !S.rnd.tables[tid];
    t = ensureTable(tid, 'fuel', buildFuelCols(order).slice(0, 1), { context:'round' }); if(fresh) t.active = null;
    billDone = tableComplete(t);
  }
  const bill = t && !billDone ? `<button class="cellbtn" data-cell="s0|bill">${t.active ? (UI.entry ? esc(UI.entry) : 'Completing…') : 'Complete figure'}</button>` : `<b class="mono gold ${t && UI.justDone && UI.justDone.table === t.id ? 'flash' : ''}">${money(r2(order * price))}</b>`;
  screen().innerHTML = taskFrame({ question: sc === 0 ? 'Fuel for your timetable' : per ? `Fuel for ${W.now}` : 'Fuel', work: !!t, calc:t,
    story: sc <= 2 ? ['Buying fuel moves money from your cash into your tank. It only becomes a cost when your flights burn it.'].concat(sc === 0 ? ['The tank keeps each batch you buy. Flights burn the oldest fuel first.'] : []) : [],
    say:`Your tank has ${num(have)} litres. ${W.poss} flights burn ${num(need)} litres. Fuel costs ${priceL(price)} a litre today.`,
    context: ctxFuel(order, need, price), help: sc >= 1 ? ['fuel'] : [],
    main:`<div class="fuel2"><div class="tank-col">${tankSvg(need, order)}<div class="tank-cap mono">${num(tankCapacity())} L tank</div></div>
      <div class="fuel-flow">
        <div class="ff"><div class="ff-box cash"><span class="kl">Cash</span><b class="mono">${money(S.cash)}</b>${order ? `<small>after the order <span class="mono">${money(r2(S.cash - order * price))}</span></small>` : '<small>pays for fuel orders</small>'}</div><i>→</i>
          <div class="ff-box tank"><span class="kl">Fuel in the tank</span><b class="mono">${num(have)} L</b><small>worth ${money(S.fuelValue)}${order ? ` · + ${num(order)} L on order` : ''}</small></div><i>→</i>
          <div class="ff-box burn"><span class="kl">${W.poss} flights burn</span><b class="mono">${num(need)} L</b><small>${esc(svcLabel(sched))}</small></div></div>
        <p class="ff-parts">Oldest fuel first: ${parts.map(x => `<b class="mono">${num(Math.round(x.L))} L</b> × <span class="mono">${priceL(x.p)}</span>${x.missing ? ' <span class="orange">(not in the tank yet)</span>' : ''}`).join(' + ')} = <b class="mono">${money(burnCost)}</b> of fuel used today</p>
        <div class="ff-order"><span class="kl">Fuel order</span><div class="ff-step"><button class="btn small" id="oDown" ${order ? '' : 'disabled'}>− ${num(lot)} L</button><b class="mono">${num(order)} L</b><button class="btn small" id="oUp" ${order + lot <= maxL ? '' : 'disabled'}>+ ${num(lot)} L</button></div>
          <div class="ff-quick"><button class="btn small" data-oq="0">No order</button>${enough ? `<button class="btn small" data-oq="${Math.min(enough, maxL)}">Just enough for ${W.now} (${num(Math.min(enough, maxL))} L)</button>` : ''}<button class="btn small" data-oq="${maxL}">As much as I can (${num(maxL)} L)</button></div>
          ${order ? `<div class="ff-bill"><span class="kl">Order cost</span><span class="mono">${num(order)} L × ${priceL(price)}</span><span>=</span>${bill}</div>` : ''}
          <p class="ff-after">Tank after the order: <b class="mono">${num(after)} L</b> · enough for about <b class="mono">${need ? (Math.floor(10 * after / need) / 10) : '—'}</b> days of ${W.the} timetable${after < need ? (per ? ` · <span class="orange">${num(need - after)} L more will be delivered automatically at ${priceL(r2(price + (WORLD.fuelTopUp || 0)))} a litre</span>` : ' · <span class="red">not enough for today</span>') : ''}</p></div>
        <p class="ff-prices"><span class="kl">Fuel price so far</span> ${prices.map(([l, v], i) => `<span class="${i === prices.length - 1 ? 'now' : ''}">${esc(l)} <span class="mono">${priceL(v)}</span></span>`).join(' · ')}</p>
      </div></div>`,
    foot:`<span class="muted grow">${after < need && !per ? 'Order enough fuel for today\'s flights.' : !billDone ? 'Complete the order cost to confirm the order.' : ''}</span><button class="btn primary big" id="nx" ${(after >= need || per) && billDone ? '' : 'disabled'}>${goLabel(order ? 'Confirm the fuel order' : 'Fuel checked')} &#9654;</button>` });
  if(t) bindTable(t);
  on('oDown', () => setOrder(order - lot)); on('oUp', () => setOrder(order + lot));
  screen().querySelectorAll('[data-oq]').forEach(b => b.onclick = () => setOrder(+b.getAttribute('data-oq')));
  on('nx', () => { resetEntry(); UI.justDone = null; advance(); });
};

/* ==================================================================
   LAUNCH: the operating plan, every setting with Edit, and START OPERATIONS.
   Fuel orders are paid here, when operations start.
   ================================================================== */
R.ready = () => {
  const f = fleetOne(), p = ourPlane(), sched = schedOf(f), need = periodNeed(), o = S.rnd.fuelOrder, after = S.fuel + (o ? o.litres : 0), fc = S.rnd.myForecast, setup = S.phase === 'setup', per = PW().span !== 'day';
  const fcOk = !!(fc && fc.key === fcKey(currentPlan())), fuelOk = after >= need || per, ok = sched.length > 0 && fcOk && fuelOk && readyOk();
  const D = sched.length ? TIME.day(p, sched) : null, ids = Object.keys(serviceCounts(sched));
  const row = (label, value, edit, good, warn) => `<div class="op-row ${good ? 'ok' : 'warn'}"><span class="op-l">${label}</span><span class="op-v">${value}</span><span class="op-s">${good ? '&#10003;' : esc(warn)}</span><button class="btn small" data-edit="${edit}">Edit</button></div>`;
  const rows = [
    row('Timetable', `${esc(svcLabel(sched))}${D ? ` · <span class="mono">${fmtTime(D.start)}–${fmtTime(D.end)}</span>` : ''}`, editStep('timetable'), sched.length > 0, 'No services'),
    row(ids.length > 1 ? 'Fares' : 'Fare', ids.map(id => `${esc(routeById(id).city)} <span class="mono">${money(fareOf(id))}</span>`).join(' · ') || '—', editStep('fare'), true),
    !setup && S.round >= 1 ? row('On board', esc(onboardOf().label), editStep('extras'), true) : '',
    !setup && S.round >= 2 ? row('First departure', `<span class="mono">${fmtTime(firstDep())}</span>`, editStep('extras'), true) : '',
    row('Fuel', `<span class="mono">${num(S.fuel)} L</span> in the tank${o ? ` + <span class="mono">${num(o.litres)} L</span> on order` : ''} · flights burn <span class="mono">${num(need)} L</span>${per && after < need ? ` · <span class="orange">${num(need - after)} L delivered</span>` : ''}`, 'fuelPlan', fuelOk, 'Not enough fuel'),
    row('Forecast', fc ? `${esc(fc.plan || 'Plan A')} · profit <span class="mono ${fc.profit >= 0 ? 'green' : 'red'}">${money(fc.profit)}</span>` : '—', editStep('forecast'), fcOk, fc ? 'The plan has changed: update the forecast' : 'Not costed yet'), readyExtra(row)].join('');
  screen().innerHTML = taskFrame({ question: readyTitle(), work:false,
    say: ok ? 'Everything is ready. Start operations when you are ready.' : 'Some items need updating before operations can start.',
    context: ctxForecast(),
    main:`<div class="opplan"><div class="op-head"><span class="label">Operating plan</span><b>${setup ? 'Launch Day' : railTitle()[0].replace(/ Plan$/, '')} · ${esc(homeData().code)} ${esc(terminalData().name || '')}</b></div>${rows}</div>
      <div class="launch"><button class="btn primary huge go" id="startOps" ${ok ? '' : 'disabled'}>${goWord()}</button><p class="muted">${ok ? (o ? `Your fuel order (<span class="mono">${money(o.total)}</span>) is paid when operations start.` : 'The aircraft is fuelled and the plan is costed.') : 'Update the items marked above first.'}</p></div>` });
  on('startOps', () => { const x = S.rnd.fuelOrder; if(x){ buyFuel(x.litres, x.price); S.rnd.fuelOrder = null; } delete S.rnd.returnTo; resetEntry(); UI.view = null; next(); });
};

/* Profit and cash are not the same: what was bought today (stock, the aircraft) left the cash but isn't a cost. */
function cashLine(){
  const pr = Math.round(S.rnd.profit), fb = S.rnd.fuelBought, plane = S.phase === 'setup' && S.fleet.length ? ourPlane().price : 0;
  const bought = (plane ? [`aircraft ${money(plane)}`] : []).concat(fb ? [`fuel stock ${num(fb.litres)} L ${money(fb.total)}`] : []);
  const start = S.phase === 'setup' ? settings.startingCash : S.rnd.cashStart, change = Math.round(S.cash - (start === undefined ? S.cash : start));
  return `<p class="dr-cash">Profit <b>${money(pr)}</b>${bought.length ? ` · bought today (not costs): ${bought.join(', ')}` : ''} · cash ${change >= 0 ? 'up' : 'down'} <b>${money(Math.abs(change))}</b></p>`;
}
