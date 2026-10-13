
/* ==================================================================
   The Operating Plan Studio, revised (Bertie's interaction brief, 13 Oct 2026): "do not simplify the airline; simplify
   what is visible at any one moment". Built only into airline-opening-studio-v2.html: the main game keeps the v4.10
   Studio (p4zd_studio.js), whose helpers this part reuses (route cards, the demand strip, the fill colours, PlanTips).
   The Monday plan page has three working states:
     opener  — from week 2: last week's regular plan is ready to run again (Keep plan / Edit plan), with the known changes
     plan    — the Operating Plan: the active routes (the current choice only), a toolbar, the timetable full width, a
               summary bar; a route editor for one route's fares, a service editor on a pressed flight, and the
               trade-offs drawer (closed by default)
     network — Change network: the destination browser, filtered by haul, sorted, foregrounding what the aircraft can fly
   News goes straight to the route it touches (Review Paris services). Four or more aircraft group by type.
   Parked (Bertie): Focus View and other accessibility options; regular operating patterns (designed, next pass).
   ================================================================== */
UI.s2 = UI.s2 || {};
/* short, medium and long haul by distance: defaults until Fable puts them in the workbook (Settings shortHaulMaxKm, mediumHaulMaxKm) */
const s2HaulMax = () => ({ short:+(WBS().shortHaulMaxKm || 1500), medium:+(WBS().mediumHaulMaxKm || 4000) });
function haulOf(r){ const km = routeKm(r), m = s2HaulMax(); return km <= m.short ? 'short' : km <= m.medium ? 'medium' : 'long'; }
const HAUL_NAME = { all:'All', short:'Short haul', medium:'Medium haul', long:'Long haul' };
const s2Opens = () => S.phase !== 'setup' && (S.day || 1) >= 8;   // the opener: from week 2, once there is a plan to keep

/* the page's working state: one per plan step (a new Monday starts again at the opener) */
function s2State(pl){
  const key = (S.day || 1) + '|' + (S.si || 0);
  if(UI.s2.key !== key){ const has = pl.fleet.some(x => x.sched.length);
    UI.s2 = { key, mode:!has ? 'network' : s2Opens() ? 'opener' : 'plan', route:null, strip:null, drawer:false, all:false, haul:'all', sort:'demand', suit:true, focus:null, focusText:null, open:{}, added:null, stopAsk:null, dt:'weekday', newDays:'all', startKey:planKey(pl) }; }
  return UI.s2;
}
let S2V = { w:null, e:null, fd:false, split:false };   // the page's weekday and weekend lines (D67), set on each render
/* the week's fuel: weekday litres on the weekdays left, weekend litres at the weekend */
function s2WeekNeed(){ const d = S.day || 1, n = Math.max(1, 7 - ((d - 1) % 7)); let t = 0; for(let q = d; q < d + n; q++) t += ((S2V.e && dayTypeOf(q) === 'weekend' ? S2V.e : S2V.w) || {}).fuelL || 0; return t; }
/* news whose every date is a Saturday or Sunday (the Dublin rugby): its Review presets a Sat–Sun service */
function s2WeekendOnly(n){ if(!n || !n.start || !n.end) return false; for(let d = dayOfDate(n.start); d <= dayOfDate(n.end); d++) if(dayTypeOf(d) !== 'weekend') return false; return true; }
function s2Review(id, nid){ const n = (WORLD.routeNews || []).find(z => z.id === nid), we = flightDaysOn() && s2WeekendOnly(n); UI.tlSel = null; UI.stDemand = true;
  Object.assign(UI.s2, { mode:'plan', focus:id, route:id, strip:id, focusText:n ? n.headline : null, newDays:we ? 'weekend' : 'all', dt:we ? 'weekend' : UI.s2.dt }); }
/* Mon–Fri and Sat–Sun seat fill side by side (summaryWeekdayWeekend) */
function s2SplitHtml(){ const f = L => s2Fill((L && L.services) || []), a = f(S2V.w), b = f(S2V.e), one = (lab, F) => `<span class="s2-sp"><small>${lab}</small><b class="mono">${num(F.sold)} / ${num(F.seats)}</b><em class="fill-${F.cls}">${F.pct}%</em></span>`;
  return `<span class="s2-split">${one(daysLabel('weekday'), a)}${one(daysLabel('weekend'), b)}</span>`; }
function s2DaySwitch(){ if(!S2V.fd) return ''; const dt = UI.s2.dt || 'weekday'; return `<span class="st-seg s2-dt" role="group" aria-label="Which days">${['weekday', 'weekend'].map(v => `<button data-s2dt="${v}" aria-pressed="${dt === v}">${daysLabel(v)}</button>`).join('')}</span>`; }
const s2Svc = (L, id) => (L.services || []).filter(s => s.route === id);
const s2Fill = list => { const seats = list.reduce((t, s) => t + (s.seats || 0), 0), sold = list.reduce((t, s) => t + (s.sold || 0), 0); return { seats, sold, pct:seats ? Math.round(100 * sold / seats) : 0, cls:fillCls(sold, seats) }; };
const s2Want = (pl, L, id) => { const r = routeById(id), w = (L.want || {})[id]; return w !== undefined ? w : paxWant(r, pl.prices[id] || r.basePrice); };

/* ---------- the page ---------- */
function renderStudio(st){
  const setup = S.phase === 'setup', pl = normPlan(currentPlan()); if(setup) S.market = launchMarket(pl);
  if(!S.rnd.fareWas) S.rnd.fareWas = Object.assign({}, pl.prices);
  const U = s2State(pl), Lw = planLines(pl), fd = flightDaysOn(), Le = fd ? withDay(satOf(S.day || 1), () => planLines(pl)) : null; if(!fd) U.dt = 'weekday';
  const L = U.dt === 'weekend' && Le ? Le : Lw; S2V = { w:Lw, e:Le, fd, split:fd && anyDays(pl) && WBS().summaryWeekdayWeekend !== false };
  const costed = !!(S.rnd.costed && S.rnd.costed.key === planKey(pl)), sched = pl.fleet.flatMap(x => x.sched);
  let W = null; try{ W = workTables(pl); }catch(e){ W = null; }
  const hid = hiddenFigs(pl, W), changed = planKey(pl) !== U.startKey;
  const body = U.mode === 'opener' ? s2Opener(pl, L, hid, changed) : U.mode === 'network' ? s2Network(pl, L) : s2Plan(pl, L, hid, setup, costed);
  const go = !sched.length ? 'Add some flights' : !L.fits ? "Doesn't fit in the day" : U.mode === 'opener' ? (changed ? 'Run this plan' : 'Keep plan') : costed ? goLabel('Ready to fly') : goLabel('Cost your plan');
  const nx = `<button class="btn primary big" id="nx" ${sched.length && L.fits ? '' : 'disabled'}>${go} &#9654;</button>`;
  const title = U.mode === 'network' ? (setup && !sched.length ? 'Choose where to fly' : 'Change network') : U.mode === 'opener' ? `Week ${weekNo(S.day || 1)} operating plan` : 'Operating Plan Studio';
  const sub = U.mode === 'network' ? (setup && !sched.length ? 'Your first routes: press Add to schedule on a route, then go to the timetable to place the flights.' : 'Add a destination, stop serving one, or look at a new market. Your timetable is kept.') : `${esc(S.airline && S.airline.name ? S.airline.name : 'Your airline')} HQ · ${setup ? 'Launch Day' : 'the week of ' + dateShort(S.day)}`;
  const hint = U.mode === 'network' ? 'Press Add to schedule to put a flight on the selected aircraft. Return to the operating plan to place it and check the seats.'
    : U.mode === 'opener' ? 'The plan carries on from last week. Keep it, or edit it if one of the changes matters.'
    : 'Press a fare to change it, press a flight to move or change it. The summary shows how full the planes are.';
  const status = U.mode === 'network' ? '' : `<span class="s2-status ${soBoardWaiting() ? 'warn' : changed ? 'chg' : ''}">${soBoardWaiting() ? 'Board waiting' : changed ? 'Changed this week' : U.mode === 'opener' ? 'Unchanged' : setup ? 'New plan' : 'Unchanged'}</span>`;
  screen().innerHTML = shell(deskPage({ title:title + status, sub, cls:`st-page s2-page s2-${U.mode}`, body }),
    deskBar(hint, U.mode === 'network' ? `<button class="btn primary big" id="s2Back">${setup && !S.rnd.s2seen ? 'Go to the timetable &#9654;' : '&#9664; Return to operating plan'}</button>` : `${backBtn()}${nx}`));
  bindStudio(pl);
}

/* ---------- B1 the opener: last week's plan, the known changes, Keep plan or Edit plan ---------- */
function s2Changes(pl, L){
  const d = S.day || 1, out = [], fuelLink = moduleOn('fuel') ? `<button class="btn small" data-nav="fuel">${ICO2.fuel} Fuel desk</button>` : '';
  const now = weekFuelPrice(d), was = weekFuelPrice(Math.max(1, d - 7));
  if(Math.abs(now - was) >= 0.05) out.push({ ic:'fuel', cls:now > was ? 'warn' : 'good', text:`Fuel price has ${now > was ? 'risen' : 'fallen'} to ${priceL(now)} a litre (last week ${priceL(was)}).`, act:fuelLink });
  if(deskModeAt(d)){ const need = s2WeekNeed(); if(need && S.fuel < need) out.push({ ic:'fuel', cls:'warn', text:`${num(Math.round(S.fuel))} L stored: this week needs ${num(Math.round(need))} L.`, act:fuelLink }); }
  const seen = new Set(); announcedFor(d).concat(plannerRoutes().flatMap(id => newsOn(id, d))).forEach(n => { if(seen.has(n.id)) return; seen.add(n.id);
    const fl = new Set(pl.fleet.flatMap(x => x.sched)), ids = n.routes.filter(id => routeById(id) && plannerRoutes().includes(id) && (fl.has(id) || n.mult >= 1)); if(!ids.length) return;   // a fall on a route you do not fly is not your change
    out.push({ ic:n.mult >= 1 ? 'arrowUp' : 'news', cls:n.mult >= 1 ? 'up' : 'warn', text:n.headline || n.id, sub:`${ids.map(id => routeById(id).city).join(', ')} demand ×${n.mult}${n.segment && n.segment !== 'all' ? ` (${n.segment})` : ''} · ${fmtRange(dayOfDate(n.start), dayOfDate(n.end))}`,
      act:ids.map(id => `<button class="btn small" data-s2review="${id}|${esc(n.id)}">Review ${esc(routeById(id).city)} services</button>`).join('') }); });
  if(soBoardWaiting()) out.push({ ic:'doc', cls:'warn', text:'The board wants a plan that tests a different fare or route before this week runs.', act:'<button class="btn small" data-s2go="plan">Edit plan</button>' });
  pl.fleet.forEach((x, j) => { if(!x.sched.length) out.push({ ic:'plane', cls:'warn', text:`The ${shortPlane(planeById(x.planeId))} (${regOf(x.uid)}) has no flights yet.`, act:`<button class="btn small" data-s2plan="${j}">Plan its day</button>` }); });
  return out;
}
function s2Opener(pl, L, hid, changed){
  const ch = s2Changes(pl, L), F = s2Fill(L.services || []), away = L.nos || 0, tk = (L.routes || []).reduce((t, x) => t + x.tk, 0), wait = soBoardWaiting();
  const fig = (l, v, sub, cls) => `<div class="s2-of ${cls || ''}"><small>${l}</small><b class="mono">${v}</b>${sub ? `<em>${sub}</em>` : ''}</div>`;
  const card = `<section class="dk-pnl s2-oc"><div class="s2-oh"><span class="kl">${ICO2.calendar} Week ${weekNo(S.day || 1)} · ${dateShort(S.day || 1)}</span>
      <h2>${changed ? 'Your plan has changes for this week.' : 'Last week\'s regular plan is ready to run again.'}</h2><p>${changed ? 'Run it as it is now, or carry on editing.' : 'Keep it, or edit it if one of the changes below matters.'}</p>
      <div class="s2-oact"><button class="btn primary big" id="s2Keep" ${wait || !L.fits ? 'disabled' : ''}>${changed ? 'Run this plan' : 'Keep plan'} &#9654;</button><button class="btn big" id="s2Edit">${ICO2.sliders} Edit plan</button></div></div>
    <div class="s2-ofs">${S2V.split ? `<div class="s2-of s2-ofsp"><small>Seats likely filled</small>${s2SplitHtml()}</div>` : fig('Seats likely filled', `${num(F.sold)} / ${num(F.seats)}`, `${F.pct}%`)}${fig('Turned away', num(away), 'a day', away ? 'warn' : '')}${fig('Average fare', hid.has('revenue') || !F.sold ? '—' : money(Math.round(tk / F.sold)))}${fig('Projected profit', hid.has('profit') ? sumBtn('profit') : money(Math.round(L.v.profit)), hid.has('profit') ? '' : 'a day', L.v.profit >= 0 ? 'good' : 'bad')}</div></section>`;
  const chg = `<section class="dk-pnl s2-ochg"><div class="dk-pnl-h">${ICO2.bell}<h2>Known changes this week</h2><span class="grow"></span><span class="sub">you decide whether they matter</span></div>
    <ul class="s2-cl">${ch.length ? ch.map(c => `<li class="${c.cls || ''}"><span class="s2-ci">${ICO2[c.ic] || ICO2.info}</span><span class="s2-ct"><b>${esc(c.text)}</b>${c.sub ? `<small>${esc(c.sub)}</small>` : ''}</span>${c.act ? `<span class="s2-ca">${c.act}</span>` : ''}</li>`).join('') : `<li class="good"><span class="s2-ci">${ICO2.check}</span><span class="s2-ct"><b>No known changes this week.</b></span></li>`}</ul></section>`;
  const plan = `<section class="dk-pnl st-tt s2-tt s2-otl"><div class="st-th"><div><h2>This week's timetable</h2></div>${s2DaySwitch()}<span class="s2-legend">${s2Legend()}</span></div>${s2Lanes(0, pl, L, { locked:true })}</section>`;
  return `<div class="plw st s2 s2-op"><div class="s2-otop">${card}${chg}</div>${plan}</div>`;
}

/* ---------- B2 the operating plan ---------- */
function s2Legend(){ return `<span><i class="fill-good"></i>${Math.round(fillGood() * 100)}%+</span><span><i class="fill-mid"></i>${Math.round(fillMid() * 100)}–${Math.round(fillGood() * 100) - 1}%</span><span><i class="fill-low"></i>under ${Math.round(fillMid() * 100)}%</span>`; }
function s2Plan(pl, L, hid, setup, costed){
  const U = UI.s2, flown = new Set(pl.fleet.flatMap(x => x.sched)), ids = plannerOrder().filter(id => flown.has(id));
  const focus = U.focus && routeById(U.focus) ? `<div class="s2-focus">${ICO2.news}<span><b>Reviewing ${esc(routeById(U.focus).city)}</b>${U.focusText ? ` · ${esc(U.focusText)}` : ''}</span><span class="grow"></span><button class="btn small primary" id="s2Apply">${ICO2.check} Apply changes</button></div>` : '';
  const how = UI.stHow ? `<div class="st-how s2-how">${['<b>Active routes.</b> The routes you fly, at their fares: press a fare to see every fare and the people at each. View demand shows when people want to fly; + Service adds a flight.', '<b>Timetable.</b> Drag a flight along its row, or press it to move it, change its route, fare or aircraft, or remove it (or press Delete).', '<b>Summary.</b> How full the planes are, how many people get no seat, and the profit. View trade-offs explains what you could change.', '<b>Change network.</b> Add a destination or stop serving one. Fuel, the World report and the model are in the toolbar.'].map(t => `<p>${t}</p>`).join('')}<button class="dk-link" id="stHowShut">Close</button></div>` : '';
  return `<div class="plw st s2 s2-pl">${focus}${how}<div class="s2-top">${s2Routes(pl, L, ids)}${s2Tools(pl, L, hid, setup, costed, ids.length)}${U.route && routeById(U.route) ? s2RouteEditor(pl, L, U.route) : ''}</div>${s2Timetable(pl, L)}${s2Summary(pl, L, hid)}${U.drawer ? s2Drawer(pl, L, hid) : ''}</div>`;
}
/* the active routes: the current choice only (fare, demand at it, services, seat fill); the alternatives come with Edit fare */
function s2Routes(pl, L, ids){
  const U = UI.s2, row = id => { const r = routeById(id), fare = pl.prices[id] || r.basePrice, F = s2Fill(s2Svc(L, id));
    return `<div class="s2-r ${U.focus === id ? 'focus' : ''} ${U.route === id ? 'on' : ''} ${U.strip === id ? 'dem' : ''}" data-s2r="${id}">
      <span class="s2-rc">${flagSvg(r.flag, 18)}<b>${esc(r.city)}</b><span class="mono st-code">${esc(r.code || '')}</span></span>
      <button class="s2-fare mono" data-s2fare="${id}" title="See every ${esc(r.city)} fare and change it">${money(fare)}</button>
      <span class="s2-n mono">${num(s2Want(pl, L, id))}</span><span class="s2-n mono">${s2Svc(L, id).length}</span>
      <span class="s2-fl"><span class="st-bf fill-${F.cls}"><i style="width:${F.pct}%"></i></span><b class="mono">${F.pct}%</b></span>
      <span class="s2-ra"><button class="dk-link" data-s2fare="${id}">Edit fare</button><button class="dk-link" data-s2dem="${id}" aria-pressed="${U.strip === id}">View demand</button><button class="dk-link" data-pe="0|open|${id}|0|0">+ Service</button></span></div>`; };
  const head = '<div class="s2-rh"><span>Route</span><span>Fare</span><span>Demand</span><span>Services</span><span>Seat fill</span><span></span></div>';
  const cols = ids.length > 3 ? [ids.slice(0, Math.ceil(ids.length / 2)), ids.slice(Math.ceil(ids.length / 2))] : [ids];
  return `<section class="dk-pnl s2-routes"><div class="dk-pnl-h">${ICO2.route}<h2>Active routes</h2><span class="sub">${ids.length ? `${plural(ids.length, 'route')} · ${plural(pl.fleet.reduce((t, x) => t + x.sched.length, 0), 'flight')} a day` : 'none yet'}</span><span class="grow"></span><button class="btn small s2-netb" id="s2AddNet">${ICO2.plus} Add / change routes</button></div>
    ${ids.length ? `<div class="s2-rt ${cols.length > 1 ? 'two' : ''}">${cols.map(c => `<div class="s2-rcol">${head}${c.map(row).join('')}</div>`).join('')}</div>` : '<p class="s2-none">No routes on the plan yet. Press <b>Add / change routes</b> to choose where to fly.</p>'}</section>`;
}
/* the toolbar: the drill-down tools, with a status on Fuel and on the network */
function s2FuelBtn(pl, L){
  const d = S.day || 1, desk = deskModeAt(d), need = s2WeekNeed(), low = desk && need > 0 && S.fuel < need, can = moduleOn('fuel');
  const t = !desk ? 'This week fuel is bought as it is used, at each day\'s price' : low ? `${num(Math.round(S.fuel))} L stored: this week needs ${num(Math.round(need))} L` : `${num(Math.round(S.fuel))} L stored: enough for this week`;
  return `<button class="btn small s2-fuel ${low ? 'warn' : desk ? 'ok' : ''}" ${can ? 'data-nav="fuel"' : 'disabled'} title="${t}">${ICO2.fuel} Fuel${low ? `<i class="s2-dot"></i><small class="mono">${num(Math.round(S.fuel))} L</small>` : desk ? '<i class="s2-dot ok"></i>' : ''}</button>`;
}
function s2Tools(pl, L, hid, setup, costed, n){
  return `<div class="s2-tools"><span class="plw-tools">${!setup || costed ? '<button class="btn small" id="ideaOpen" title="A test plan the model costs: no sums">Test an idea</button>' : ''}<button class="btn small" id="mapOpen" title="The network map: where the routes go">Network map</button></span>
    ${s2FuelBtn(pl, L)}<button class="btn small" id="s2Net" title="Add or stop serving destinations">${ICO2.globe} Network · ${plural(n, 'route')}</button><button class="btn small" id="stHow" aria-expanded="${!!UI.stHow}">${ICO2.info} How it works</button></div>`;
}
/* the timetable: the largest zone; four or more aircraft group by type */
function s2Timetable(pl, L){
  const U = UI.s2, view = UI.stView || 'day', showDem = UI.stDemand !== false, sid = U.route || U.strip || null;
  const obSel = snacksOn() ? `<label class="st-ob">On board <select id="stOb">${Object.keys(ONBOARD).map(k => `<option value="${k}" ${(pl.onboard || 'none') === k ? 'selected' : ''}>${esc(ONBOARD[k].label)}</option>`).join('')}</select></label>` : '';
  const sel = UI.tlSel && UI.tlSel.i === 0 && pl.fleet[UI.tlSel.j] && pl.fleet[UI.tlSel.j].sched[UI.tlSel.k] ? UI.tlSel : null;
  return `<section class="dk-pnl st-tt s2-tt"><div class="st-th"><div><h2 title="Drag a flight to move it, or press it to change it; Delete removes the flight you pressed.">Aircraft timetable</h2></div>${s2DaySwitch()}<span class="s2-legend">${s2Legend()}</span>${obSel}
      <span class="st-seg" role="group" aria-label="Timetable view"><button data-stview="day" aria-pressed="${view === 'day'}">Day view</button><button data-stview="table" aria-pressed="${view === 'table'}">Table view</button></span>
      <label class="st-tog"><input type="checkbox" id="stDem" ${showDem ? 'checked' : ''}> Show demand</label></div>
    ${view === 'day' ? `${showDem ? `<div class="st-stripw" id="stStrip">${stripHtml(pl, sid)}</div>` : ''}${s2Lanes(0, pl, L)}` : studioTable(pl, L)}${view === 'day' && sel ? s2SvcEditor(pl, L, sel) : ''}</section>`;
}
function s2Block(i, pl, L, x, j, t, k, last, o, dy){
  const p = planeById(x.planeId), r = routeById(t.route), s = (L.services || []).find(z => z.uid === x.uid && z.k === k) || {}, seats = s.seats || p.seats, sold = s.sold || 0, e0 = dayEnd(), s0 = dayStart(), span = e0 - s0, X = m => (100 * (m - s0) / span);
  const sel = UI.tlSel && UI.tlSel.i === i ? UI.tlSel : null, on = sel && sel.j === j && sel.k === k, ready = last ? t.arr : t.arr + TIME.home(p), fc = fillCls(sold, seats), empty = Math.max(0, seats - sold), hl = UI.s2.focus === t.route || UI.s2.route === t.route, fare = pl.prices[t.route] || r.basePrice, chip = dy && dy !== 'all' ? daysLabel(dy) : '';
  return `${last ? '' : `<i class="ad-ready" style="left:${X(t.arr).toFixed(2)}%;width:${(X(ready) - X(t.arr)).toFixed(2)}%" title="Turnaround: ready again at ${fmtTime(ready)}"></i>`}<button class="ad-blk st-blk s2-blk fill-${fc} ${on ? 'on' : ''} ${hl ? 'hl' : ''} ${t.arr > e0 ? 'over' : ''}" data-tl="${i}|${j}|${k}" data-days="${dy || 'all'}" data-dep="${t.dep}" data-arr="${t.arr}" data-ready="${ready}" style="left:${X(t.dep).toFixed(2)}%;width:${(X(t.arr) - X(t.dep)).toFixed(2)}%" ${o.locked ? 'disabled' : ''} title="${empty} empty seat${empty === 1 ? '' : 's'} · ready again ${fmtTime(ready)}${chip ? ' · flies ' + chip : ''}" aria-label="${esc(r.city)} ${fmtTime(t.dep)} to ${fmtTime(t.arr)}${chip ? ', ' + chip + ' only' : ''}, ${sold} of ${seats} seats filled, fare ${money(fare)}" aria-pressed="${!!on}">
    <span class="st-bt mono"><b>${fmtTime(t.dep)}</b>–${fmtTime(t.arr)}${chip ? `<span class="s2-dchip">${chip}</span>` : ''}</span><span class="st-br">${flagSvg(r.flag, 13)} ${esc(r.city)}<span class="s2-bfare mono">${money(fare)}</span></span><span class="st-bf"><i style="width:${Math.round(100 * Math.min(1, sold / Math.max(1, seats)))}%"></i></span><span class="st-bs mono">${sold}/${seats}</span></button>`;
}
/* the flights of an aircraft shown in the timetable's day type (all of them before the Days setting), as full-schedule indices */
function s2Idx(x){ if(!S2V.fd) return x.sched.map((_, k) => k); return setOf(x, UI.s2.dt || 'weekday'); }
function s2Lanes(i, pl, L, o){
  o = o || {}; const U = UI.s2, s0 = dayStart(), e0 = dayEnd(), span = e0 - s0, X = m => (100 * (m - s0) / span).toFixed(2), maxT = WORLD.maxTrips || 4, jSel = studioPlane(pl), sel = UI.tlSel && UI.tlSel.i === i ? UI.tlSel : null;
  const ticks = []; for(let h = Math.ceil(s0 / 60); h * 60 <= e0; h += 2) ticks.push(`<span style="left:${X(h * 60)}%">${pad(h)}:00</span>`);
  const lane = (x, j) => { const p = planeById(x.planeId), f = S.fleet.find(z => z.uid === x.uid), idx = s2Idx(x), days = daysFix(x.days, x.sched.length), dps = x.deps && x.deps.length === x.sched.length ? x.deps : null, D = idx.length ? withPlan(pl, () => TIME.day(p, idx.map(k => x.sched[k]), undefined, dps ? idx.map(k => dps[k]) : null)) : null, can = plannerOrder().filter(id => planeCanFly(p, routeById(id))), hl = U.focus && x.sched.includes(U.focus);
    const add = o.locked ? `<small class="s2-ln">${plural(idx.length, 'flight')}</small>` : `<select class="st-addf" data-addsel="${i}|${j}" ${idx.length < maxT ? '' : 'disabled'} aria-label="Add a flight to the ${esc(shortPlane(p))}"><option value="">${idx.length < maxT ? '+ Add flight…' : `Full: ${maxT} flights`}</option>${can.map(id => `<option value="${id}">${esc(routeById(id).city)} · ${fmtDur(TIME.leg(p, routeById(id)))} each way</option>`).join('')}</select>`;
    return `<div class="ad-ac st-row ${j === jSel && !o.locked ? 'sel' : ''} ${hl ? 'hl' : ''}"><div class="st-plane"><button class="st-pn" data-stplane="${j}" ${o.locked ? 'disabled' : ''} title="Read the routes for this aircraft">${planeMini(f || p, 'ad-pic')}<span><b>${esc(shortPlane(p))}</b><small>${esc(regOf(x.uid))} · ${p.seats} seats</small></span></button>${add}</div>
      <div class="ad-lane ${o.locked ? 'locked' : ''}" data-lane="${i}|${j}" data-s0="${s0}" data-span="${span}">${D ? D.trips.map((t, q) => s2Block(i, pl, L, x, j, t, idx[q], q === D.trips.length - 1, o, days[idx[q]])).join('') : `<span class="ad-none muted">${o.locked ? 'No flights.' : 'No flights yet: add one from the menu or a route.'}</span>`}</div></div>`; };
  // four or more aircraft: one group per type; a group with the selected or reviewed aircraft opens by itself
  let rows; if(pl.fleet.length >= 4){ const types = []; pl.fleet.forEach((x, j) => { let g = types.find(t => t.pid === x.planeId); if(!g) types.push(g = { pid:x.planeId, js:[] }); g.js.push(j); });
    rows = types.map(g => { if(g.js.length === 1) return lane(pl.fleet[g.js[0]], g.js[0]);
      const auto = g.js.some(j => (sel && sel.j === j) || j === jSel || (U.focus && pl.fleet[j].sched.includes(U.focus))), open = U.open[g.pid] !== undefined ? U.open[g.pid] : auto, F = s2Fill((L.services || []).filter(s => g.js.some(j => pl.fleet[j].uid === s.uid))), n = g.js.reduce((t, j) => t + s2Idx(pl.fleet[j]).length, 0), p = planeById(g.pid);
      return `<div class="s2-grp ${open ? 'open' : ''}"><button class="s2-gh" data-s2grp="${g.pid}" aria-expanded="${open}"><span class="s2-gc">${ICO2.chev}</span>${planeMini(p, 'ad-pic')}<b>${esc(shortPlane(p))}</b><span>${g.js.length} aircraft · ${plural(n, 'flight')} a day</span><span class="st-bf fill-${F.cls}"><i style="width:${F.pct}%"></i></span><span class="mono">${F.pct}% full</span></button>${open ? g.js.map(j => lane(pl.fleet[j], j)).join('') : ''}</div>`; }).join('');
  } else rows = pl.fleet.map(lane).join('');
  return `<div class="ad st-ad s2-ad ${pl.fleet.length >= 3 ? 'many' : ''}"><div class="ad-axis"><span class="ad-lab"></span><div class="ad-ticks">${ticks.join('')}</div></div>${rows}</div>`;
}
/* B3 the service editor: on a pressed flight, never shown otherwise */
function s2SvcEditor(pl, L, sel){
  const x = pl.fleet[sel.j], p = planeById(x.planeId), id0 = x.sched[sel.k]; if(!id0) return '';
  const dps = x.deps && x.deps.length === x.sched.length ? x.deps : actualDeps(pl, sel.j), r0 = routeById(id0), t = { route:id0, dep:dps[sel.k], arr:dps[sel.k] + TIME.roundTrip(p, r0) }, idx = s2Idx(x), last = idx[idx.length - 1] === sel.k, dy = daysFix(x.days, x.sched.length)[sel.k];
  const r = routeById(t.route), s = (L.services || []).find(z => z.uid === x.uid && z.k === sel.k) || {}, a = `0|${sel.j}|${sel.k}`, fare = pl.prices[r.id] || r.basePrice, ready = last ? t.arr : t.arr + TIME.home(p);
  const routes = plannerOrder().filter(id => planeCanFly(p, routeById(id))), planes = pl.fleet.map((y, q) => ({ y, q })).filter(({ y, q }) => q !== sel.j && planeCanFly(planeById(y.planeId), r));
  return `<div class="s2-pop" id="s2Pop" role="dialog" aria-label="Change the ${esc(r.city)} ${fmtTime(t.dep)} flight"><div class="s2-pop-h">${flagSvg(r.flag, 16)}<b>${esc(r.city)} <span class="mono">${fmtTime(t.dep)}–${fmtTime(t.arr)}</span></b><small><span class="mono">${s.sold || 0}/${s.seats || p.seats}</span> seats · ready again <span class="mono">${fmtTime(ready)}</span> · ${esc(shortPlane(p))}</small><button class="s2-x" id="s2PopX" aria-label="Close">×</button></div>
    <div class="s2-pop-b"><button class="btn" data-tlm="${a}|-20" aria-label="20 minutes earlier">&#9664; Earlier</button><button class="btn" data-tlm="${a}|20" aria-label="20 minutes later">Later &#9654;</button>
      <label>Route <select data-s2rt="${sel.j}|${sel.k}">${routes.map(id => `<option value="${id}" ${id === r.id ? 'selected' : ''}>${esc(routeById(id).city)}</option>`).join('')}</select></label>
      <label>Fare <select data-s2fr="${r.id}">${(r.fares || [r.basePrice]).map(f => `<option value="${f}" ${f === fare ? 'selected' : ''}>${money(f)} · ${paxWant(r, f)} want</option>`).join('')}</select></label>
      ${S2V.fd ? `<label>Days <select data-s2dy="${sel.j}|${sel.k}" aria-label="Which days this flight flies">${DAYS_KEYS.map(v => `<option value="${v}" ${v === dy ? 'selected' : ''}>${daysLabel(v)}</option>`).join('')}</select></label>` : ''}
      <label>Aircraft <select data-s2ac="${sel.j}|${sel.k}" ${planes.length ? '' : 'disabled'}><option value="">${esc(shortPlane(p))} · ${esc(regOf(x.uid))}</option>${planes.map(({ y, q }) => `<option value="${q}">${esc(shortPlane(planeById(y.planeId)))} · ${esc(regOf(y.uid))}</option>`).join('')}</select></label></div>
    <div class="s2-pop-f"><button class="btn danger" data-tlrm="${a}">Remove</button><span class="ad-del">or press <kbd>Delete</kbd></span><span class="grow"></span><button class="btn sc-open" data-svccard="${a}" title="This service's fuel, costs and profit">Service costs</button></div></div>`;
}
function s2SetRoute(j, k, id){
  const next = normPlan(JSON.parse(JSON.stringify(currentPlan()))), x = next.fleet[j], r = routeById(id); if(!x || !x.sched[k] || !r || !planeCanFly(planeById(x.planeId), r)) return;
  if(!x.deps || x.deps.length !== x.sched.length) x.deps = actualDeps(next, j);
  x.sched[k] = id; if(!next.prices[id]) next.prices[id] = r.basePrice; x.deps = actualDeps(next, j);
  if(!withPlan(next, () => fitsFor(x))){ toast(`A ${r.city} flight won't fit there: move or remove another flight first.`); render(); return; }
  UI.tlSel = { i:0, j, k }; UI.tlFocus = true; setPlan(0, next);
}
function s2SetPlane(j, k, q){
  const next = normPlan(JSON.parse(JSON.stringify(currentPlan()))), x = next.fleet[j], y = next.fleet[q], maxT = WORLD.maxTrips || 4; if(!x || !y || !x.sched[k]) return;
  const id = x.sched[k], r = routeById(id), p = planeById(y.planeId), xd = x.deps && x.deps.length === x.sched.length ? x.deps.slice() : actualDeps(next, j), dep = xd[k];
  if(!planeCanFly(p, r)){ toast(`The ${shortPlane(p)} can't reach ${r.city}.`); render(); return; }
  if(y.sched.filter((_, n) => { const v = daysFix(y.days, y.sched.length)[n], w = daysFix(x.days, x.sched.length)[k]; return v === 'all' || w === 'all' || v === w; }).length >= maxT){ toast(`The ${shortPlane(p)} already flies ${maxT} services: the most in a day.`); render(); return; }
  const xdy = daysFix(x.days, x.sched.length), dy = xdy[k]; x.sched.splice(k, 1); xd.splice(k, 1); xdy.splice(k, 1); x.days = xdy; x.deps = x.sched.length ? xd : null; if(x.deps) x.deps = actualDeps(next, j);
  const yd = y.sched.length ? (y.deps && y.deps.length === y.sched.length ? y.deps.slice() : actualDeps(next, q)) : [], ydy = daysFix(y.days, y.sched.length), trip = TIME.roundTrip(p, r), home = TIME.home(p);
  const share = n => dy === 'all' || ydy[n] === 'all' || ydy[n] === dy;   // only flights on the same days are in the way
  const busy = y.sched.map((rid, n) => share(n) ? [yd[n], yd[n] + TIME.roundTrip(p, routeById(rid)) + home] : null).filter(Boolean); y.deps = yd; y.days = ydy;
  let t = dep; if(t + trip > dayEnd() || busy.some(([a, z]) => t < z && t + trip + home > a)){ t = null; for(let u = dayStart(); u + trip <= dayEnd(); u += PLW_SNAP){ if(!busy.some(([a, z]) => u < z && u + trip + home > a)){ t = u; break; } } }
  if(t === null || t === undefined){ toast(`No room left in the ${shortPlane(p)}'s day for a ${r.city} flight.`); render(); return; }
  y.sched.push(id); yd.push(t); ydy.push(dy); const order = y.sched.map((rid, n) => ({ rid, dep:yd[n], dy:ydy[n], n })).sort((u, v) => u.dep - v.dep || u.n - v.n);
  y.sched = order.map(z => z.rid); y.deps = order.map(z => z.dep); y.days = order.map(z => z.dy); y.deps = actualDeps(next, q);
  if(!withPlan(next, () => next.fleet.every(z => !z.sched.length || fitsFor(z)))){ toast("That timetable won't fit in the operating day."); render(); return; }
  if(t !== dep) toast(`The ${r.city} flight moves to the ${shortPlane(p)} at ${fmtTime(y.deps[order.findIndex(z => z.n === order.length - 1)])}: that was its first free time.`);
  UI.tlSel = { i:0, j:q, k:order.findIndex(z => z.n === order.length - 1) }; UI.tlFocus = true; setPlan(0, next);
}
/* B4 the route editor: one route, every fare with the people at it, against the seats it offers */
function s2RouteEditor(pl, L, id){
  const r = routeById(id), fare = pl.prices[id] || r.basePrice, F = r.fares || [r.basePrice], svc = s2Svc(L, id), seats = svc.reduce((t, s) => t + (s.seats || 0), 0), want = s2Want(pl, L, id), mx = Math.max(1, ...F.map(f => paxWant(r, f))), U = UI.s2;
  const gap = want - seats, line = !svc.length ? `No ${r.city} flights on the plan yet.` : gap > 0 ? `${num(gap)} more people want to fly than you have seats: raise the fare, add a service, or accept turning them away.` : gap < 0 ? `${num(-gap)} seats would be empty at ${money(fare)}: a lower fare or fewer seats would fill them.` : 'Demand matches the seats exactly.';
  return `<section class="s2-ed" role="dialog" aria-label="${esc(r.city)} fares"><div class="s2-ed-h">${flagSvg(r.flag, 20)}<h3>${esc(r.city)}</h3><span class="mono st-code">${esc(r.code || '')}</span><span class="grow"></span><button class="s2-x" id="s2EdX" aria-label="Close">×</button></div>
    <p class="s2-ed-n">Current fare <b class="mono">${money(fare)}</b> · ${plural(svc.length, 'service')} a day · <span class="mono">${num(seats)}</span> seats</p>
    <table class="s2-ft"><thead><tr><th>Fare</th><th class="num">People who want to fly</th><th></th></tr></thead><tbody>${F.map(f => { const n = paxWant(r, f); return `<tr class="${f === fare ? 'on' : ''}"><td><button class="s2-fb mono" data-pe="0|fareTo|${id}|${f}" aria-pressed="${f === fare}">${money(f)}</button></td><td class="num mono">${num(n)}</td><td><span class="s2-fbar"><i style="width:${Math.round(100 * n / mx)}%"></i>${seats ? `<b style="left:${Math.min(100, Math.round(100 * seats / mx))}%" title="${num(seats)} seats"></b>` : ''}</span></td></tr>`; }).join('')}</tbody></table>
    <div class="s2-cmp"><span><small>Demand at ${money(fare)}</small><b class="mono">${num(want)}</b></span><span><small>Seats</small><b class="mono">${num(seats)}</b></span><p>${line}</p></div>
    <div class="s2-ed-f"><button class="btn small" data-pe="0|open|${id}|0|0">${ICO2.plus} Add a service</button>${S2V.fd ? `<select class="s2-nd" id="s2Nd" aria-label="Days for the new service">${DAYS_KEYS.map(v => `<option value="${v}" ${v === (U.newDays || 'all') ? 'selected' : ''}>${daysLabel(v)}</option>`).join('')}</select>` : ''}<button class="btn small" data-s2dem="${id}">View demand</button><span class="grow"></span>${svc.length ? `<button class="btn small danger" data-s2stop="${id}">${U.stopAsk === id ? `Yes, stop serving ${esc(r.city)}` : 'Stop serving'}</button>` : ''}</div></section>`;
}
/* the summary bar: seat use first; profit is there but does not lead */
function s2Summary(pl, L, hid){
  const F = s2Fill(L.services || []), away = L.nos || 0, tk = (L.routes || []).reduce((t, x) => t + x.tk, 0), n = planTipsFor(pl, L).filter(t => !['all_good', 'general_tradeoff'].includes(t.id)).length;
  const it = (l, v, sub, cls) => `<span class="s2-si ${cls || ''}"><small>${l}</small><span><b class="mono">${v}</b>${sub ? `<em>${sub}</em>` : ''}</span></span>`;
  return `<div class="s2-sum" aria-live="polite"><span class="s2-sl">Plan summary${S2V.split ? `<small>${daysLabel(UI.s2.dt || 'weekday')} figures</small>` : ''}</span>${S2V.split ? `<span class="s2-si s2-sisp"><small>Seats likely filled</small>${s2SplitHtml()}</span>` : it('Seats likely filled', `${num(F.sold)} / ${num(F.seats)}`, `${F.pct}%`, F.seats ? 'fill-' + F.cls : '')}${it('Empty seats', num(Math.max(0, F.seats - F.sold)))}${it('Turned away', num(away), 'a day', away ? 'warn' : '')}
    ${it('Average fare', hid.has('revenue') || !F.sold ? '—' : money(Math.round(tk / F.sold)))}${it('Projected profit', hid.has('profit') ? sumBtn('profit') : money(Math.round(L.v.profit)), hid.has('profit') ? '' : 'a day', hid.has('profit') ? '' : L.v.profit >= 0 ? 'good' : 'bad')}
    ${hid.has('fuelCost') ? it('Fuel cost', sumBtn('fuelCost')) : ''}<span class="grow"></span><button class="btn s2-trb" id="s2Tr" aria-expanded="${!!UI.s2.drawer}">View trade-offs${n ? `<i class="s2-badge">${n}</i>` : ''} ${ICO2.chev}</button></div>`;
}
/* B5 the trade-offs drawer: two things worth looking at; every insight, grouped, one press away */
function s2Insights(pl, L, hid){
  const all = planTipsFor(pl, L, { all:true }), by = ids => all.filter(t => ids.includes(t.id)).map(t => t.text), F = s2Fill(L.services || []), out = [];
  out.push(['Seat use', [`${num(F.sold)} of ${num(F.seats)} seats filled (${F.pct}%); ${num(Math.max(0, F.seats - F.sold))} empty.`]]);
  out.push(['Lost demand', [(L.nos || 0) ? `${num(L.nos)} people a day wanted to fly but could not get a seat.` : 'Everyone who wants to fly at your fares gets a seat.'].concat(by(['turned_away']))]);
  out.push(['Timing', by(['peak_unserved', 'idle_plane', 'weekend_only_news'])]);
  out.push(['Fare', by(['fare_too_high', 'fare_too_low', 'fare_lower_fills'])]);
  const cap = (L.services || []).filter(s => s.seats && s.sold / s.seats < fillMid()).map(s => { const x = pl.fleet.find(z => z.uid === s.uid); return `The ${shortPlane(planeById(x ? x.planeId : 'dhc6'))} is lightly filled on ${routeById(s.route).city} at ${fmtTime(s.dep)} (${s.sold} / ${s.seats}).`; });
  out.push(['Capacity', cap.concat(by(['range_fail', 'long_leg_warning']))]);
  const m = (l, v) => `<span><small>${l}</small><b class="mono">${v}</b></span>`, tk = (L.routes || []).reduce((t, x) => t + x.tk, 0);
  out.push(['Money', null, `<div class="s2-money">${m('Ticket revenue', hid.has('revenue') ? sumBtn('revenue') : money(Math.round(tk)))}${m('On-board sales', money(Math.round(L.v.snack || 0)))}${hid.has('profit') ? '' : m('Costs', money(Math.round(L.v.cost || 0)))}${m('Projected profit', hid.has('profit') ? sumBtn('profit') : money(Math.round(L.v.profit)))}</div><small class="muted">A day, at this week's prices.</small>`]);
  return out;
}
function s2Drawer(pl, L, hid){
  const U = UI.s2, top = planTipsFor(pl, L), real = top.filter(t => !['all_good', 'general_tradeoff'].includes(t.id));
  const groups = U.all ? `<div class="s2-groups">${s2Insights(pl, L, hid).map(([h, lines, html]) => `<div class="s2-g"><h4>${h}</h4>${html || (lines.length ? `<ul>${lines.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '<p class="muted">Nothing to look at here.</p>')}</div>`).join('')}</div>` : '';
  return `<aside class="s2-dr" role="dialog" aria-label="Trade-offs"><div class="s2-dr-h">${ICO2.bulb}<h2>Trade-offs</h2><span class="grow"></span><button class="s2-x" id="s2DrX" aria-label="Close">×</button></div>
    <h3>${real.length ? `${real.length === 1 ? 'One thing' : real.length + ' things'} worth looking at` : 'Nothing pressing'}</h3><ul class="st-tips">${top.map(t => `<li data-tip="${t.id}">${ICO2.bulb}<span>${esc(t.text)}</span></li>`).join('')}</ul>
    <button class="dk-link s2-allb" id="s2All" aria-expanded="${!!U.all}">${U.all ? 'Show fewer' : 'Show all insights'} ${ICO2.chev}</button>${groups}</aside>`;
}

/* ---------- B6 Change network: every destination, filtered by haul, sorted, foregrounding what the aircraft can fly ---------- */
function s2Network(pl, L){
  const U = UI.s2, j = studioPlane(pl), p = planeById(pl.fleet[j].planeId), flown = new Set(pl.fleet.flatMap(x => x.sched)), all = plannerOrder();
  const cnt = h => all.filter(id => (h === 'all' || haulOf(routeById(id)) === h) && (!U.suit || planeCanFly(p, routeById(id)))).length;
  let ids = all.filter(id => U.haul === 'all' || haulOf(routeById(id)) === U.haul); if(U.suit) ids = ids.filter(id => planeCanFly(p, routeById(id)));
  const fareOf2 = id => pl.prices[id] || routeById(id).basePrice, key = { demand:id => -paxWant(routeById(id), fareOf2(id)), distance:id => routeKm(routeById(id)), fare:id => -fareOf2(id), az:id => routeById(id).city };
  ids.sort((a, b) => { const f = key[U.sort] || key.demand, u = f(a), v = f(b); return (flown.has(b) ? 1 : 0) - (flown.has(a) ? 1 : 0) || (typeof u === 'string' ? u.localeCompare(v) : u - v); });
  const added = U.added && UI.tlSel && pl.fleet[UI.tlSel.j] && pl.fleet[UI.tlSel.j].sched[UI.tlSel.k] === U.added ? (() => { const x = pl.fleet[UI.tlSel.j], dp = actualDeps(pl, UI.tlSel.j)[UI.tlSel.k]; return `<div class="s2-added">${ICO2.check}<span>${esc(routeById(U.added).city)} flight added to the ${esc(shortPlane(planeById(x.planeId)))} at <b class="mono">${fmtTime(dp)}</b>. Return to the operating plan to place it and see the seats.</span></div>`; })() : '';
  const card = id => { let h = studioCard(0, id, pl, j, false).replace(' km</span>', ` km</span><span class="s2-cf-h">${HAUL_NAME[haulOf(routeById(id))]}</span>`); if(flown.has(id)) h = h.replace(/<\/div>\s*$/, `<button class="dk-link s2-stop" data-s2stop="${id}">${U.stopAsk === id ? `Yes, stop serving ${esc(routeById(id).city)}` : 'Stop serving'}</button></div>`); return `<div class="s2-nc h-${haulOf(routeById(id))}">${h}</div>`; };
  const few = all.length <= 6;   // a few routes: no filters or sorting to read past
  const head = `<div class="s2-nh">${few ? '' : `<span class="st-seg s2-haul" role="group" aria-label="Haul">${['all', 'short', 'medium', 'long'].map(h => `<button data-s2haul="${h}" aria-pressed="${U.haul === h}">${HAUL_NAME[h].toUpperCase()} <small>${cnt(h)}</small></button>`).join('')}</span>
    <label class="st-filt">Sort <select id="s2Sort">${[['demand', 'Demand'], ['distance', 'Distance'], ['fare', 'Fare'], ['az', 'A–Z']].map(([v, l]) => `<option value="${v}" ${U.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`}
    <span class="grow"></span>${pl.fleet.length > 1 ? `<label class="st-filt">Aircraft <select id="s2Plane">${pl.fleet.map((x, q) => `<option value="${q}" ${q === j ? 'selected' : ''}>${esc(shortPlane(planeById(x.planeId)))} · ${esc(regOf(x.uid))}</option>`).join('')}</select></label>
    <span class="st-seg" role="group" aria-label="Which routes"><button data-s2suit="1" aria-pressed="${!!U.suit}">Suitable</button><button data-s2suit="0" aria-pressed="${!U.suit}">All routes</button></span>` : ''}</div>
    <p class="s2-nn">${ICO2.plane}<span><b>${esc(shortPlane(p))} selected</b> — ${U.suit ? 'showing the routes this aircraft can fly.' : `showing every route; the ones out of its ${num(p.range)} km range say so.`} Your network: ${plural(flown.size, 'route')}.</span></p>`;
  return `<div class="plw st s2 s2-net">${head}${added}<div class="s2-ng">${ids.map(card).join('') || `<p class="s2-none">No ${HAUL_NAME[U.haul].toLowerCase()} routes ${U.suit ? 'this aircraft can fly' : 'open yet'}.</p>`}</div></div>`;
}
function s2StopRoute(id){
  const next = normPlan(JSON.parse(JSON.stringify(currentPlan())));
  next.fleet.forEach((x, j) => { if(!x.sched.includes(id)) return; const d = x.deps && x.deps.length === x.sched.length ? x.deps : actualDeps(next, j), keep = x.sched.map((s, k) => s === id ? -1 : k).filter(k => k >= 0);
    const dy = daysFix(x.days, x.sched.length); x.deps = keep.map(k => d[k]); x.days = keep.map(k => dy[k]); x.sched = keep.map(k => x.sched[k]); if(!x.sched.length){ x.deps = null; x.days = null; } });
  next.fleet.forEach((x, j) => { if(x.deps) x.deps = actualDeps(next, j); });
  UI.tlSel = null; Object.assign(UI.s2, { stopAsk:null, route:UI.s2.route === id ? null : UI.s2.route, strip:UI.s2.strip === id ? null : UI.s2.strip }); toast(`${routeById(id).city} is off the plan.`); setPlan(0, next);
}

/* ---------- binding ---------- */
function bindStudio(pl){
  const root = screen(), U = UI.s2, go = o => { Object.assign(UI.s2, o); render(); };
  bindPlanEditor(); bindTimeline();
  root.querySelectorAll('[data-sum]').forEach(b => b.onclick = () => openSum(b.getAttribute('data-sum')));
  on('s2Edit', () => go({ mode:'plan' })); root.querySelectorAll('[data-s2go]').forEach(b => b.onclick = () => go({ mode:b.getAttribute('data-s2go') }));
  on('s2Keep', () => { const n = $('nx'); if(n && !n.disabled) n.click(); });
  root.querySelectorAll('[data-s2plan]').forEach(b => b.onclick = () => { UI.stPlane = +b.getAttribute('data-s2plan'); go({ mode:'network' }); });
  on('s2Net', () => { UI.tlSel = null; go({ mode:'network', added:null }); }); on('s2AddNet', () => { UI.tlSel = null; go({ mode:'network', added:null }); });
  on('s2Back', () => { S.rnd.s2seen = true; UI.tlSel = null; go({ mode:'plan', added:null, stopAsk:null }); });
  root.querySelectorAll('[data-s2fare]').forEach(b => b.onclick = () => { const id = b.getAttribute('data-s2fare'); UI.tlSel = null; go({ route:U.route === id ? null : id, stopAsk:null }); });
  root.querySelectorAll('[data-s2dem]').forEach(b => b.onclick = () => { const id = b.getAttribute('data-s2dem'); UI.stDemand = true; go({ strip:U.strip === id ? null : id }); });
  on('s2EdX', () => go({ route:null, stopAsk:null, newDays:U.focus ? U.newDays : 'all' }));
  root.querySelectorAll('[data-s2review]').forEach(b => b.onclick = () => { const [id, nid] = b.getAttribute('data-s2review').split('|'); s2Review(id, nid); render(); });
  on('s2Apply', () => { UI.tlSel = null; go({ focus:null, focusText:null, route:null, strip:null, newDays:'all', dt:'weekday', mode:s2Opens() ? 'opener' : 'plan' }); });
  root.querySelectorAll('[data-s2dt]').forEach(b => b.onclick = () => { UI.tlSel = null; go({ dt:b.getAttribute('data-s2dt') }); });
  root.querySelectorAll('[data-s2dy]').forEach(s => s.onchange = () => { const [j, k] = s.getAttribute('data-s2dy').split('|').map(Number); s2SetDays(j, k, s.value); });
  const nd = $('s2Nd'); if(nd) nd.onchange = () => { UI.s2.newDays = nd.value; };
  on('s2Tr', () => go({ drawer:!U.drawer })); on('s2DrX', () => go({ drawer:false })); on('s2All', () => go({ all:!U.all }));
  root.querySelectorAll('[data-s2haul]').forEach(b => b.onclick = () => go({ haul:b.getAttribute('data-s2haul') }));
  root.querySelectorAll('[data-s2suit]').forEach(b => b.onclick = () => go({ suit:b.getAttribute('data-s2suit') === '1' }));
  const so = $('s2Sort'); if(so) so.onchange = () => go({ sort:so.value });
  const sp = $('s2Plane'); if(sp) sp.onchange = () => { UI.stPlane = +sp.value; render(); };
  root.querySelectorAll('[data-s2stop]').forEach(b => b.onclick = () => { const id = b.getAttribute('data-s2stop'); if(U.stopAsk === id) s2StopRoute(id); else go({ stopAsk:id }); });
  root.querySelectorAll('[data-s2grp]').forEach(b => b.onclick = () => { const pid = b.getAttribute('data-s2grp'); U.open[pid] = b.getAttribute('aria-expanded') !== 'true'; render(); });
  root.querySelectorAll('[data-stplane]').forEach(b => b.onclick = () => { UI.stPlane = +b.getAttribute('data-stplane'); render(); });
  root.querySelectorAll('[data-stview]').forEach(b => b.onclick = () => { UI.stView = b.getAttribute('data-stview'); render(); });
  const d = $('stDem'); if(d) d.onchange = () => { UI.stDemand = d.checked; render(); };
  const o = $('stOb'); if(o) o.onchange = () => editPlan(0, 'ob', o.value, 0);
  on('stHow', () => { UI.stHow = !UI.stHow; render(); }); on('stHowShut', () => { UI.stHow = false; render(); });
  on('ideaOpen', () => { UI.ideaOpen = true; UI.tlSel = null; render(); });
  on('mapOpen', () => { UI.view = 'network'; render(); });
  on('nx', () => { S.rnd.focusRoute = schedOf(fleetOne())[0] || S.market; UI.ideaOpen = false; UI.tlSel = null; resetEntry(); UI.justDone = null; advance(); });
  // the service editor
  on('s2PopX', () => { UI.tlSel = null; render(); });
  root.querySelectorAll('[data-s2rt]').forEach(s => s.onchange = () => { const [j, k] = s.getAttribute('data-s2rt').split('|').map(Number); s2SetRoute(j, k, s.value); });
  root.querySelectorAll('[data-s2fr]').forEach(s => s.onchange = () => editPlan(0, 'fareTo', s.getAttribute('data-s2fr'), +s.value));
  root.querySelectorAll('[data-s2ac]').forEach(s => s.onchange = () => { if(s.value === '') return; const [j, k] = s.getAttribute('data-s2ac').split('|').map(Number); s2SetPlane(j, k, +s.value); });
  const pop = $('s2Pop'), blk = root.querySelector('.s2-tt .ad-blk.on'), host = root.querySelector('.s2-tt');
  if(pop && blk && host){ const place = () => { const b = blk.getBoundingClientRect(), h = host.getBoundingClientRect(), sc = h.width / Math.max(1, host.offsetWidth) || 1, pw = pop.offsetWidth, ph = pop.offsetHeight;
      let top = (b.bottom - h.top) / sc + 6; if(top + ph > host.offsetHeight - 4) top = (b.top - h.top) / sc - ph - 6; if(top < 4) top = 4;
      pop.style.top = top + 'px'; pop.style.left = clamp((b.left - h.left) / sc, 8, Math.max(8, host.offsetWidth - pw - 8)) + 'px'; };
    place(); const ad = root.querySelector('.s2-tt .st-ad'); if(ad) ad.addEventListener('scroll', place, { passive:true }); }
  // the strip follows a hovered route row
  root.querySelectorAll('.s2-r').forEach(r => { const id = r.getAttribute('data-s2r');
    r.onmouseenter = () => { const s = $('stStrip'); if(s) s.innerHTML = stripHtml(pl, id); };
    r.onmouseleave = () => { const s = $('stStrip'); if(s) s.innerHTML = stripHtml(pl, UI.s2.route || UI.s2.strip || null); }; });
  // Change network: a card's Add to schedule says where the flight went
  if(U.mode === 'network') root.querySelectorAll('.st-card [data-pe*="|add|"]').forEach(b => b.addEventListener('click', () => { UI.s2.added = b.getAttribute('data-pe').split('|')[2]; }, true));
}

/* B7 the World report's announced news offers the same Review buttons */
const s2World0 = renderWorldReport;   // reassigned, not redeclared: a second declaration would replace the original before it could be kept
renderWorldReport = function(){
  s2World0(); if(step().t !== 'plan') return;
  const ann = announcedFor(S.day || 1), ps = screen().querySelectorAll('.wr-ann > p'); ann.forEach((n, q) => { const p = ps[q]; if(!p) return;
    const ids = n.routes.filter(id => routeById(id) && plannerRoutes().includes(id)); if(!ids.length) return;
    p.insertAdjacentHTML('beforeend', `<span class="s2-wra">${ids.map(id => `<button class="btn small" data-s2review="${id}|${esc(n.id)}">Review ${esc(routeById(id).city)} services</button>`).join('')}</span>`); });
  screen().querySelectorAll('[data-s2review]').forEach(b => b.onclick = () => { const [id, nid] = b.getAttribute('data-s2review').split('|'); UI.view = null; s2Review(id, nid); render(); });
};
/* for the tests: the page's state and its figures */
function studio2Report(){ const pl = currentPlan(), L = planLines(pl), F = s2Fill(L.services || []), U = UI.s2 || {};
  return { dt:U.dt, newDays:U.newDays, split:!!S2V.split, days:normPlan(pl).fleet.map(x => daysFix(x.days, x.sched.length)), mode:U.mode, route:U.route, focus:U.focus, drawer:!!U.drawer, haul:U.haul, suit:U.suit, sold:F.sold, seats:F.seats, away:L.nos || 0, profit:Math.round(L.v.profit),
    active:[...new Set(normPlan(pl).fleet.flatMap(x => x.sched))].map(id => { const r = routeById(id), fare = pl.prices[id] || r.basePrice, S2 = s2Fill(s2Svc(L, id)); return { id, fare, want:s2Want(pl, L, id), n:s2Svc(L, id).length, pct:S2.pct, fares:(r.fares || [r.basePrice]).map(f => [f, paxWant(r, f)]) }; }),
    hauls:Object.fromEntries(plannerRoutes().map(id => [id, haulOf(routeById(id))])), tips:planTipsFor(pl, L).map(t => t.id) }; }
