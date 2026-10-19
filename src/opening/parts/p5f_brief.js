
/* ==================================================================
   OPERATIONS BRIEFINGS AND PLANNER UPGRADES (D98, D99; Fable's screens brief, 17 Oct 2026)
   - Briefings (Briefings sheet): full screen, Show → Predict → Reveal → Use, advanced by doing, with Pause & discuss. Each is
     a separate HTML piece (src/opening/briefings/, embedded by the build as data-briefings) played in a frame over the game.
     The game passes the pupil's own figures (window.BRIEF); the piece says when it is done (postMessage briefing-done).
     Only the pieces that exist are played: today the weekend one and the fuel one. A Briefings shelf in the menu replays them.
   - Upgrades (Upgrades sheet): the week-2 review ends with the Weekdays and weekends briefing and an Operations Request.
     "Change weekdays and weekends separately" grants the Days setting (D67) from Monday; another choice leaves it for the
     systems team to propose on the fallback day (day 21). Saves from before this rule keep Days as they had it.
   - The first visit to the Fuel desk opens with the Cash, tank, profit briefing.
   ================================================================== */
{
let BF_FILES = {}, BF_KIT = { css:'', js:'' }; try{ BF_FILES = JSON.parse(document.getElementById('data-briefings').textContent); }catch(e){}
try{ BF_KIT = JSON.parse(document.getElementById('data-briefing-kit').textContent); }catch(e){}
/* the scenes built in the game (Fable's plan, 18 Oct 2026): a Briefings sheet row may name another file, or none yet */
const BF_EXTRA = { fare_lever:{ title:'What a fare does', html:'briefing-fare.html' }, rival_split:{ title:'Customers have a choice', html:'briefing-rival.html' },
  full_route:{ title:'More demand than seats', html:'briefing-capacity.html' }, aircraft_efficiency:{ title:'Two planes, one route', html:'briefing-efficiency.html' },
  flight_time:{ title:'How long will it take?', html:'briefing-time.html' }, event_weekend:{ title:'One big Saturday', html:'briefing-event.html' },
  seasons:{ title:'A year of demand', html:'briefing-seasons.html' }, lease_money:{ title:'Renting a plane', html:'briefing-lease.html' }, profit_vs_cash:{ title:'Profit is not cash', html:'briefing-cash.html' },
  cash_to_fly:{ title:'Can you afford to run it?', html:'briefing-cash-to-fly.html' } };
const bfRows = () => WB.briefings || [], upgRows = () => WB.upgrades || [];
const bfRow = id => { const w = bfRows().find(b => b.id === id), x = BF_EXTRA[id]; if(!w && !x) return undefined; const r = Object.assign({ id }, x || {}, w || {}); if(x && !BF_FILES[r.html]) r.html = x.html; return r; }, upgRow = id => upgRows().find(u => u.id === id);
const bfHas = id => { const b = bfRow(id); return !!(b && BF_FILES[b.html]); };
const bfOn = () => WBS().operationsBriefings !== false && settings.briefings !== false;   // the regression tests switch them off (settings.briefings = false)
const upgOn = () => WBS().plannerUpgrades !== false;
const bfS = () => S.brief || (S.brief = { seen:{} });
const upgS = () => S.upg || (S.upg = {});
const dayIn = (s, re) => { const m = re.exec(String(s || '')); return m ? +m[1] : null; };
const upgDay = id => dayIn((upgRow(id) || {}).trigger, /day\s+(\d+)/i);
const upgFallbackDay = id => dayIn((upgRow(id) || {}).fallback, /day\s+(\d+)/i) || dayIn(WBS().flightDaysFromDay, /fallback day\s+(\d+)/i);

/* ---------- the frame over the game ---------- */
let bfCur = null;
function bfOpen(id, data, onDone){
  const b = bfRow(id), html = b && BF_FILES[b.html]; if(!html){ if(onDone) onDone({ skipped:true }); return false; }
  bfShut(); const layer = document.createElement('div'); layer.id = 'bfLayer'; layer.className = 'bf-layer' + (reducedMotion() ? ' rm' : '');
  // year one (batch 2, section 4): the kit draws from its flat pieces; the pupil's first plane and tail colour are the default plane
  const y1 = typeof yearOne === 'function' && yearOne(), f0 = S.fleet && S.fleet[0], kit = y1 ? { kitFlat:true, kitPlane:f0 ? artIdOf(f0.planeId) : 'dhc6', kitTail:f0 ? bfTail(f0) : '' } : {};
  const D = Object.assign({ id, airline:(S.airline && S.airline.name) || '', test:typeof testOn === 'function' && testOn(), rm:reducedMotion() }, kit, data || {});
  const inject = `<script>window.BRIEF=${JSON.stringify(D).replace(/</g, '\\u003c')};<\/script>`;
  const fr = document.createElement('iframe'); fr.title = `Operations briefing: ${b.title || id}`; fr.setAttribute('allow', '');
  // the shared kit goes in where the page asks for it (a page opened on its own loads it from kit/)
  const kitCss = `<style>${BF_KIT.css || ''}</style>`, kitJs = `<script>${(BF_KIT.js || '').replace(/<\/script/gi, '<\\/script')}<\/script>`;
  const page = html.replace(/<link[^>]*data-kit[^>]*>/i, () => kitCss).replace(/<script[^>]*data-kit[^>]*><\/script>/i, () => kitJs);
  fr.srcdoc = page.replace(/<head>/i, () => '<head>' + inject); layer.appendChild(fr); document.body.appendChild(layer);
  bfCur = { id, onDone }; setTimeout(() => { try{ fr.focus(); }catch(e){} }, 60); return true;
}
function bfShut(){ const l = document.getElementById('bfLayer'); if(l) l.remove(); }
window.addEventListener('message', e => {
  const d = e.data; if(!d || d.type !== 'briefing-done' || !bfCur) return;
  const c = bfCur; bfCur = null; bfShut(); bfS().seen[c.id] = S.day || 1; try{ save(); }catch(err){} if(c.onDone) c.onDone(d);
});
/* Esc never closes a briefing for the pupil (it advances by doing); the teacher can with Ctrl+Shift+B */
document.addEventListener('keydown', e => { if(bfCur && e.ctrlKey && e.shiftKey && (e.key === 'B' || e.key === 'b')){ e.preventDefault(); const c = bfCur; bfCur = null; bfShut(); bfS().seen[c.id] = S.day || 1; if(c.onDone) c.onDone({ skipped:true }); } });   // skipped counts as seen: it does not open again

/* ---------- the step that holds a briefing (the week-2 review's Operations Request) ---------- */
Object.assign(FRAME_TITLES, { brief:'Operations briefing' }); NO_BACK.push('brief'); WS_STEPS.push('brief'); SHELL_STEPS.push('brief');
Object.assign(RAIL_LABEL, { brief:'Operations briefing' }); Object.assign(SUB_DESC, { brief:'A short briefing, then on to next week' });
{ const g = STAGES.day.find(x => x.id === 'review'); if(g && !g.steps.includes('brief')) g.steps.push('brief'); }
R.brief = st => {
  const b = bfRow(st.id) || { title:'Operations briefing' };
  screen().innerHTML = shell(deskPage({ title:b.title, sub:'Operations briefing · the airline pauses to brief you', cls:'bf-page',
    body:`<section class="dk-pnl bf-hold"><p class="kl">Operations briefing</p><h2>${esc(b.title)}</h2><p>${esc(b.show || '')}</p><button class="btn primary big" id="bfGo">Open the briefing &#9654;</button></section>` }),
    deskBar('The briefing opens over the desk. It moves on as you do each step.', ''));
  const go = () => bfOpen(st.id, st.data, d => bfFinish(st, d));
  on('bfGo', go);
  if(!document.getElementById('bfLayer') && !st.opened){ st.opened = true; setTimeout(go, 250); }
};
function bfFinish(st, d){
  if(st.upg){ const u = upgS()[st.upg] || (upgS()[st.upg] = {}); u.chosen = d.chosen === undefined ? null : d.chosen; u.right = !!d.right || !!d.skipped;
    if(u.right && !u.granted){ u.granted = S.day; toast(`Planner upgrade approved: ${upgName(st.upg)}, from Monday.`); }
    else if(!u.right){ u.declined = S.day; } }
  closeDay();
}
const upgName = id => ({ weekend_schedules:'weekday and weekend schedules' })[id] || String((upgRow(id) || {}).unlocks || id).replace(/\s*\(.*\)/, '').toLowerCase();

/* the systems team's proposal, after the fallback day's review */
Object.assign(FRAME_TITLES, { upgprop:'Operations request' }); NO_BACK.push('upgprop'); WS_STEPS.push('upgprop'); SHELL_STEPS.push('upgprop');
Object.assign(RAIL_LABEL, { upgprop:'Operations request' }); Object.assign(SUB_DESC, { upgprop:'A proposal from the systems team' });
{ const g = STAGES.day.find(x => x.id === 'review'); if(g && !g.steps.includes('upgprop')) g.steps.push('upgprop'); }
R.upgprop = st => {
  screen().innerHTML = shell(deskPage({ title:'Operations request', sub:'From the systems team', cls:'bf-page', body:upgProposal(true) }), deskBar('Build it now, or leave it for later: you can still say yes on the plan page.', ''));
  const done = yes => { const u = upgS().weekend_schedules; if(yes){ u.granted = S.day; u.via = 'fallback'; toast('Planner upgrade approved: weekday and weekend schedules, from Monday.'); } else u.parked = S.day; closeDay(); };
  on('upgYes', () => done(true)); on('upgNo', () => done(false));
};
/* the week-2 review: after the accounts are signed off, the briefing and the request, then the week closes as before */
const bfCloseDay0 = closeDay;
closeDay = function(){
  try{
    const st = step(), id = 'weekend_schedules', at = upgDay(id);
    if(upgOn() && st && st.t === 'weekReview' && at && S.day === at && !(upgS()[id] || {}).offered){
      upgS()[id] = { offered:S.day };
      const data = bfWeekendData();
      if(data && bfOn() && bfHas('weekend_demand')){ S.steps.splice(S.si + 1, 0, { t:'brief', id:'weekend_demand', upg:id, data }); next(); return; }
      upgS()[id].granted = S.day;   // no briefing to play: the upgrade arrives as before
    }
    // the fallback (Upgrades sheet): at the review on the fallback day the systems team proposes it
    const u = upgS()[id], fb = upgFallbackDay(id);
    if(upgOn() && st && st.t === 'weekReview' && u && u.declined && !u.granted && fb && S.day >= fb && !u.proposed){
      u.proposed = S.day; S.steps.splice(S.si + 1, 0, { t:'upgprop', id }); next(); return;
    }
  }catch(e){}
  return bfCloseDay0.apply(this, arguments);
};
/* the week's figures for the briefing: the route whose weekend differs most from its weekdays, who wanted to fly each day, the seats */
function bfWeekendData(){
  const W = S.wk; if(!W) return null;
  const days = Array.from({ length:7 }, (_, k) => W.from + k), rows = days.map(d => S.history.find(h => h.type === 'day' && h.from === d) || null);
  const ids = [...new Set(rows.flatMap(h => h ? Object.keys(h.routes || {}) : []))]; if(!ids.length) return null;
  const score = id => { const w = rows.map(h => h && h.routes && h.routes[id] ? h.routes[id].want || 0 : 0), wd = w.slice(0, 5), we = w.slice(5); const a = wd.reduce((t, v) => t + v, 0) / Math.max(1, wd.length), b = we.reduce((t, v) => t + v, 0) / Math.max(1, we.length); return a ? b / a : 0; };
  const id = ids.slice().sort((x, y) => Math.abs(score(y) - 1) - Math.abs(score(x) - 1))[0], r = routeById(id);
  const want = rows.map(h => h && h.routes && h.routes[id] ? Math.round(h.routes[id].want || h.routes[id].pax || 0) : 0), seats = rows.map(h => h && h.routes && h.routes[id] ? h.routes[id].seats || 0 : 0);
  const pl = normPlan(currentPlan()), s0 = dayStart(), span = dayEnd() - s0, flights = [];
  pl.fleet.forEach((x, j) => { const p = planeById(x.planeId), deps = x.deps && x.deps.length === x.sched.length ? x.deps : actualDeps(pl, j);
    x.sched.forEach((rid, k) => { if(rid !== id) return; const trip = TIME.roundTrip(p, r); flights.push({ t:fmtTime(deps[k]), l:Math.round(100 * (deps[k] - s0) / span), w:Math.max(8, Math.round(100 * trip / span)), n:p.seats }); }); });
  // who is flying, from the route's business share and the weekend rule (business ×0.7 Sat, ×0.6 Sun; leisure ×1.2): the extra leisure at the weekend shows as families
  const bs = r.arch && r.arch.businessShare !== undefined && r.arch.businessShare !== null ? r.arch.businessShare : 0.5, ST = WBS();
  const mul = k => k === 5 ? [ST.weekendBusinessMultSat || 0.7, ST.weekendLeisureMult || 1.2] : k === 6 ? [ST.weekendBusinessMultSun || 0.6, ST.weekendLeisureMult || 1.2] : [1, 1];
  const biz = [], lei = [], fam = [];
  want.forEach((v, k) => { const [b, l] = mul(k), bz = Math.round(v * bs * b / Math.max(1e-9, bs * b + (1 - bs) * l)), le = v - bz, fm = l > 1 ? Math.round(le - le / l) : 0; biz.push(bz); lei.push(le - fm); fam.push(fm); });
  const u = upgRow('weekend_schedules') || {}, sub = { 'Change weekdays and weekends separately':'two timetables: Mon–Fri and Sat–Sun', 'Change every day together':'the planner as it is now', 'Change one particular date':"a single day's exception" };
  return { route:r.city, want, seats, flights, biz, lei, fam, options:(u.options && u.options.length === 3 ? u.options : Object.keys(sub)).map(o => [o, sub[o] || '']) };
}

/* ---------- Days: earned at the week-2 review (D98), proposed on the fallback day ---------- */
fdUnlocked = function(){
  const v = WBS().flightDaysFromDay;
  if(/^\s*\d+\s*$/.test(String(v === undefined || v === null ? 8 : v))) return (S.day || 1) >= +(v === undefined || v === null ? 8 : v);   // a day number (workbooks to v5.14)
  const u = (S.upg || {}).weekend_schedules;
  if(u) return !!u.granted;
  // a save from before the earned rule (past the week-2 review with no record of it) keeps the Days setting it had
  return (S.day || 1) > (upgDay('weekend_schedules') || 14);
};
/* the fallback: on the fallback day the systems team proposes it, on the plan's opener */
function upgProposal(force){
  const id = 'weekend_schedules', u = (S.upg || {})[id], fb = upgFallbackDay(id);
  if(!u || u.granted || !fb || (S.day || 1) < fb) return '';
  if(!force && (!u.proposed || u.parked === S.day)) return '';
  const row = upgRow(id) || {}, say = (/'([^']+)'/.exec(String(row.fallback || '')) || [])[1] || 'Systems: we think a weekend timetable would help. Shall we build it?';
  return `<section class="dk-pnl upg-prop"><p class="kl">Operations request · from the systems team</p><p class="upg-say">${esc(say)}</p><p class="upg-what">${esc(String(row.unlocks || 'flightDays (All week / Mon–Fri / Sat–Sun)').replace(/^flightDays\s*/, 'Every flight gets a Days setting '))}</p><div class="upg-b"><button class="btn primary" id="upgYes">Build it</button><button class="btn" id="upgNo">Not this week</button></div></section>`;
}
const bfRender0 = render;
render = function(){
  const r = bfRender0.apply(this, arguments);
  try{ bfAfterRender(); }catch(e){ console.warn('briefings:', e && e.message); }
  return r;
};
function bfAfterRender(){
  const st = step(), root = screen(); if(!st || !root) return;
  // the fallback proposal sits at the top of the plan step
  if(st.t === 'plan' && !UI.view){ const h = upgProposal(); const main = root.querySelector('.dp') || root.querySelector('.shell-main');
    if(h && main && !root.querySelector('.upg-prop')){ main.insertAdjacentHTML('afterbegin', h);
      on('upgYes', () => { const u = upgS().weekend_schedules; u.granted = S.day; u.via = 'fallback'; toast('Planner upgrade approved: weekday and weekend schedules. Each flight now has a Days setting.'); save(); render(); });
      on('upgNo', () => { upgS().weekend_schedules.parked = S.day; save(); render(); }); } }
  // the first visit to the Fuel desk opens with the Cash, tank, profit briefing
  const fuelHere = st.t === 'fuelDesk' || UI.view === 'fuel';
  // (a save that has already bought fuel has met the desk: no briefing for it)
  const from = +(WBS().fuelDeskFromDay || 8) || 8, firstVisit = !(S.fo && S.fo.last && S.fo.last.day >= from) && (S.day || 1) >= from && (S.day || 1) <= from + 6;   // Launch Day's order is not a desk visit
  if(fuelHere && firstVisit && bfOn() && bfHas('fuel_cash_tank_profit') && !bfS().seen.fuel_cash_tank_profit && !bfCur && !document.getElementById('bfLayer')){
    const data = bfFuelData(); if(data) bfOpen('fuel_cash_tank_profit', data, () => render());
  }
  // 13 · Can you afford to run it? (Fable, 18 Oct; year one): week 2's Fuel desk, straight after Cash, tank, profit and before the first order
  if(fuelHere && bfC2FDue() && bfS().seen.fuel_cash_tank_profit && !(S.fo && S.fo.last && S.fo.last.day >= from) && !bfCur && !document.getElementById('bfLayer')) bfCashToFly('fuel');
  if(st.t === 'hq' && !UI.view) bfHomeShelf(root);
  bfMore(st, root);
}
/* ---------- the scenes built in the game: their triggers and their figures ---------- */
function bfMore(st, root){
  if(!bfOn() || bfCur || document.getElementById('bfLayer')) return;
  const seen = bfS().seen;
  // Bertie, 18 Oct: "check whether the briefings come before the first instance of working that out"
  // 1 · What a fare does: Launch Day, as the Studio opens (before a fare can be changed, and the change's worth asked)
  if(st.t === 'plan' && S.phase === 'setup' && !seen.fare_lever && bfHas('fare_lever') && root.querySelector('.ad-blk')){
    let W = null; try{ W = workTables(currentPlan()); }catch(e){}
    const data = bfFareData(W && W.tables.find(x => x.stage === 'fare')); if(data){ data.next = 'studio'; bfOpen('fare_lever', data, d => bfToFares(d, data)); return; }
  }
  // 5 · Cash, tank, profit: Launch Day, before the fuel order (blocks × the price of a block, for the days from Wednesday)
  if(st.t === 'workings' && S.phase === 'setup' && !seen.fuel_cash_tank_profit && bfHas('fuel_cash_tank_profit')){
    const t = typeof currentTable === 'function' ? currentTable() : null, c = t && t.stage === 'fuelorder' && !Object.keys(t.done || {}).length && t.cols[0];
    if(c && c.values && c.values.blocks > 0){ const data = bfLaunchFuelData(c); if(data){ bfOpen('fuel_cash_tank_profit', data, () => render()); return; } }
  }
  // 1 · (a save that reached the sums without it) as the fare sums open (before the first is answered)
  if(st.t === 'workings' && S.phase === 'setup' && !seen.fare_lever && bfHas('fare_lever')){
    let W = null; try{ W = workTables(currentPlan()); }catch(e){}
    const t = W && W.tables.find(x => x.stage === 'fare'); if(t && !Object.keys(t.done || {}).length && !UI.justDone){ const data = bfFareData(t); if(data){ data.next = 'sums'; bfOpen('fare_lever', data, () => render()); } return; }
  }
  // 2 · Customers have a choice: Red Kite's card, before he decides
  if(st.t === 'event' && S.rnd && S.rnd.event && S.rnd.event.rivalFare && S.rnd.eventChoice === undefined && !seen.rival_split && bfHas('rival_split')){ const data = bfRivalData(); if(data){ bfOpen('rival_split', data, () => render()); return; } }
  // 3 · More demand than seats: the week-1 review, when people were turned away
  if(st.t === 'weekReview' && weekNo(S.day || 1) === 1 && !seen.full_route && bfHas('full_route')){ const data = bfCapacityData(); if(data){ bfOpen('full_route', data, () => render()); return; } }
  // 13 · Can you afford to run it?: the week-2 shop, if the pupil gets there before the Fuel desk (before the comparison, before Buy)
  if(st.t === 'shop2' && bfC2FDue()){ if(bfCashToFly('shop')) return; }
  // 6 · Two planes, one route: the first comparison in the shop
  if(st.t === 'shop2' && typeof acCompareOn === 'function' && acCompareOn() && !seen.aircraft_efficiency && bfHas('aircraft_efficiency')){ const data = bfEffData(); if(data){ bfOpen('aircraft_efficiency', data, () => render()); return; } }
  // 7 · How long will it take?: the first Flight times page
  if(st.t === 'plan' && !seen.flight_time && bfHas('flight_time') && root.querySelector('[data-ftph], .ft3-ins')){ const data = bfTimeData(); if(data){ bfOpen('flight_time', data, () => render()); return; } }
  // 8 · One big Saturday: an announced event, on the plan
  if(st.t === 'plan' && !seen.event_weekend && bfHas('event_weekend')){ const data = bfEventData(); if(data){ bfOpen('event_weekend', data, d => { upgS().day_override = { offered:S.day, chosen:d.chosen === undefined ? null : d.chosen, right:!!d.right }; save(); render(); }); return; } }
  // 9 · A year of demand: the chapter-1 review
  if(st.t === 'chapterReview' && (S.day || 1) < 200 && !seen.seasons && bfHas('seasons')){ const data = bfSeasonData(); if(data){ bfOpen('seasons', data, d => { upgS().seasonal_plans = { offered:S.day, chosen:d.chosen === undefined ? null : d.chosen, right:!!d.right }; save(); render(); }); return; } }
  // 10 · Renting a plane: the shop, once renting opens
  if(st.t === 'shop2' && !seen.lease_money && bfHas('lease_money')){ const data = bfLeaseData(); if(data){ bfOpen('lease_money', data, () => render()); return; } }
  // 11 · Profit is not cash: the Finance desk in chapter 3, after a plane is bought or a month ends overdrawn
  if(UI.view === 'finance' && (S.day || 1) >= (dayIn(WBS().ch3FromDay, /(\d+)/) || 365) && !seen.profit_vs_cash && bfHas('profit_vs_cash')){ const data = bfCashData(); if(data && (data.bought || data.overdrawn)){ bfOpen('profit_vs_cash', data, () => render()); return; } }
}
/* 5 on Launch Day: the order's own figures (its blocks at its price, for its days), and the cash there will be when it is paid, from Wednesday */
function bfLaunchFuelData(c){
  const base = bfFuelData(); if(!base) return null;
  const v = c.values, blkL = base.blk || 1000, buyL = v.blocks * blkL, price = v.blk / blkL, days = +((/(\d+) days?/.exec(c.label || '') || [])[1]) || base.days || 5;
  const before = Math.max(0, 7 - days - ((S.day || 1) - 1)), dayProfit = ((base.day && base.day.tickets) || 0) - ((base.day && base.day.other) || 0);
  return Object.assign({}, base, { buyL, price, tank:buyL, days, perDay:Math.min(base.perDay || buyL, Math.floor(buyL / days)), cash:Math.round(S.cash + before * dayProfit), next:'order' });
}
/* each scene's figures, now (the toolkit's Event now and a replay with nothing kept); null where the moment has no figures */
function bfDataFor(id){
  const F = { fare_lever:() => bfFareData((() => { try{ return workTables(currentPlan()).tables.find(x => x.stage === 'fare'); }catch(e){ return null; } })()), rival_split:bfRivalData, full_route:bfCapacityData,
    weekend_demand:bfWeekendData, fuel_cash_tank_profit:bfFuelData, aircraft_efficiency:bfEffData, flight_time:bfTimeData, event_weekend:bfEventData, seasons:bfSeasonData, lease_money:bfLeaseData, profit_vs_cash:bfCashData,
    cash_to_fly:bfCashToFlyData }[id];
  try{ return F ? F() : null; }catch(e){ return null; } }
/* a plane in the showroom's plain silver (one he does not own) */
function bfPlain(p){ if(typeof yearOne === 'function' && yearOne()) return `kit:${(p && p.artworkId) || 'dhc6'}|`;   // year one: the kit's own white plane
  try{ return typeof plainArt === 'function' ? plainArt(p) : ''; }catch(e){ return ''; } }
/* 6: his plane and the next bigger one on the route the comparison is about: seats and litres for the round trip */
function bfEffData(){
  let C = null; try{ C = acCompare(); }catch(e){} const rid = (C && C.rid) || S.market, r = routeById(rid); if(!r) return null;
  const mine = S.fleet[0], pa = mine && planeById(mine.planeId); if(!pa) return null;
  const pb = ['sf34', 'at72', 'e175'].map(planeById).filter(p => p && p.seats > pa.seats && (typeof planeCanFly !== 'function' || planeCanFly(p, r)))[0]; if(!pb) return null;
  return { route:{ id:rid, city:r.city }, a:{ name:pa.name, seats:pa.seats, litres:fuelForTrip(pa, r), art:bfArt(mine.uid) }, b:{ name:pb.name, seats:pb.seats, litres:fuelForTrip(pb, r), art:bfPlain(pb) } };
}
/* 7: the first new pair on the Flight times page */
function bfTimeData(){ let k = null; try{ k = (ftNew() || [])[0]; }catch(e){} if(!k) return null; const [pid, rid] = k.split('|'), p = planeById(pid), r = routeById(rid); if(!p || !r) return null;
  const f = S.fleet.find(z => z.planeId === pid); return { route:{ id:rid, city:r.city, km:Math.round(routeKm(r)) }, plane:{ name:p.name, speed:p.speed }, art:f ? bfArt(f.uid) : bfPlain(p) }; }
/* 8: an announced event on a route he flies: last week's people a day there, the event's days doubled, his seats */
function bfEventData(){
  const n = (announcedFor(S.day || 1) || []).find(x => (x.mult || 1) > 1 && (x.routes || []).some(id => routeById(id))); if(!n) return null;
  const rid = n.routes.find(id => routeById(id)), r = routeById(rid), d0 = dayOfDate(n.start), d1 = dayOfDate(n.end), mon = d0 - ((calDate(d0).getUTCDay() + 6) % 7);
  const lastMon = (S.day || 1) - ((calDate(S.day || 1).getUTCDay() + 6) % 7) - 7, rows = Array.from({ length:7 }, (_, k) => (S.history || []).find(h => h.from === lastMon + k && h.to === lastMon + k));
  const fare = fareOf(rid), base = Math.round(paxWant(r, fare)) || 40, want = rows.map((h, k) => h && h.routes && h.routes[rid] ? Math.round(h.routes[rid].want || h.routes[rid].pax || base) : Math.round(base * (k >= 5 ? .9 : 1)));
  const mult = Array.from({ length:7 }, (_, k) => mon + k >= d0 && mon + k <= d1 ? (n.mult || 2) : 1);
  const pl = normPlan(currentPlan()); let fl = []; try{ fl = withPlan(pl, () => planFlights()).filter(x => x.route === rid && !x.grounded && !x.homeLeg).sort((a, b) => a.dep - b.dep); }catch(e){}
  const seats = fl.reduce((t, x) => t + (x.seats || 0), 0), u = upgRow('day_override') || {};   // 0: he does not fly the route (yet)
  const when = calDate(d0).toUTCString().split(' '), title = n.title || (n.id === 'dub_rugby' ? 'IRELAND v NEW ZEALAND' : String(n.headline || '').split(':')[0].toUpperCase().slice(0, 28));
  return { route:r.city, title, when:`${when[0].replace(',', '').toUpperCase()} ${+when[1]} ${when[2].toUpperCase()}`, want, mult, seats:Array(7).fill(seats), flights:fl.map(x => ({ t:fmtTime(x.dep) })), options:u.options && u.options.length === 3 ? u.options : ['Change one particular date', 'Change weekends', 'Change every day'] };
}
/* 9: Geneva and Barcelona (or his two most seasonal routes) a month at a time, from the Market weeks and the routes' seasons */
function bfSeasonData(){
  const ids = ['gva', 'bcn'].filter(id => routeById(id)); if(!ids.length) return null;
  const start = dayOfDate('2030-09-15'), months = [], dayOfM = i => start + Math.round(i * 30.44);
  for(let i = 0; i < 12; i++) months.push(calDate(dayOfM(i)).toUTCString().split(' ')[2]);
  const seasonAt = (r, day) => { const m = marketWeekOf(day) || {}, ms = m.seasonMult && m.seasonMult[r.id]; return ms !== undefined && ms !== null ? ms : (r.arch && r.arch.season ? (r.arch.season[seasonOf(day)] || 1) : 1); };
  const places = ids.map(id => { const r = routeById(id), base = Math.round(paxWant(r, r.basePrice) / Math.max(.2, seasonAt(r, S.day || 1))) || 40; return { city:r.city, base, mult:Array.from({ length:12 }, (_, i) => Math.round(seasonAt(r, dayOfM(i)) * 100) / 100) }; });
  const u = upgRow('seasonal_plans') || {}, pl = normPlan(currentPlan()); let seats = 0; try{ const L = planLines(pl); seats = Math.round((L.services || []).filter(z => ids.includes(z.route)).reduce((t, z) => t + (z.seats || 0), 0) / Math.max(1, ids.filter(id => pl.fleet.some(x => x.sched.includes(id))).length)); }catch(e){}
  return { months, year0:2030, places, marks:[{ m:3, label:'Christmas' }, { m:5, label:'Half-term' }], seats:seats || 38, options:u.options && u.options.length === 3 ? u.options : ['Plans that switch with the season', 'A bigger plane', 'More flights every week'] };
}
/* 10: the plane to rent (the dearest in the shop that can be rented), its price, its rent a day, his cash */
function bfLeaseData(){
  let list = []; try{ list = shopPlanesNow().filter(p => shopOffer(p).canLease); }catch(e){} if(!list.length) return null;
  const p = list.slice().sort((a, b) => shopOffer(b).price - shopOffer(a).price)[0], o = shopOffer(p); if(!(o.lease > 0) || !(o.price > 0)) return null;
  return { plane:p.name, price:Math.round(o.price), rent:Math.round(o.lease), cash:Math.round(S.cash), art:bfPlain(p) };
}
/* 11: the last month, day by day: what it added to profit and to cash (the takings less what was paid out: fuel orders, a plane) */
function bfCashData(){
  const Lg = S.ledger || {}, rev = Lg.rev || {}, cost = Lg.cost || {}, end = (S.day || 1) - 1; if(end < 30) return null;
  let fuelDay = 0; try{ const L = planLines(currentPlan()); fuelDay = (L.v && L.v.fuel) || 0; }catch(e){}
  const buys = []; (S.fleet || []).forEach(f => { if(f.terms && f.terms.kind === 'buy' && f.terms.since) buys.push({ d:f.terms.since, amount:-(f.terms.price || 0), label:`Bought the ${(planeById(f.planeId) || {}).name || 'plane'}` }); });
  (S.ch3Log || []).forEach(x => { if(x && x.what === 'buyLeased') buys.push({ d:x.day, amount:-(x.price || 0), label:`Bought the ${x.plane || 'plane'}` }); });
  const to = end, from = to - 29, last = buys.filter(b => b.d >= from && b.d <= to).sort((a, b) => b.d - a.d)[0];   // the last 30 days (the plan's fuel is today's)
  const overdrawn = (S.history || []).some(h => h.from >= from - 31 && (h.cash || 0) < 0);
  const days = []; let p = 0, c = 0;
  for(let d = from; d <= to; d++){ const pr = (rev[d] || 0) - (cost[d] || 0), mon = calDate(d).getUTCDay() === 1, b = buys.find(x => x.d === d);
    const ev = b ? { kind:'plane', label:b.label, amount:b.amount } : mon && fuelDay ? { kind:'fuel', label:'Fuel order', amount:-Math.round(fuelDay * 7) } : null;
    p += pr; c += pr + fuelDay + (ev ? ev.amount : 0); days.push({ d:calDate(d).getUTCDate(), profit:Math.round(p), cash:Math.round(c), ev }); }
  const mo = calDate(from + 15).toUTCString().split(' ');
  return { month:`${mo[2]} ${mo[3]}`, days, bought:!!last, overdrawn };
}
/* his plane, drawn in his colours, for a scene */
/* the pupil's tail colour, for the kit's blank tail (year one) */
function bfTail(f){ try{ const L = normLivery(f.livery); return hexOf(L.second) || hexOf(L.belly) || ''; }catch(e){ return ''; } }
function bfArt(uid){ const f = (uid !== undefined && S.fleet.find(z => z.uid === uid)) || S.fleet[0]; if(f && typeof yearOne === 'function' && yearOne()) return `kit:${artIdOf(f.planeId)}|${bfTail(f)}`; try{ return f ? aircraftArt(typeof ensureIdentity === 'function' ? ensureIdentity(f) : f) : ''; }catch(e){ return ''; } }
/* Red Kite's undercut: who wants to fly at his fare, who stays, and who stays if he advertises (the card's own figures) */
function bfRivalData(){
  const ev = S.rnd && S.rnd.event; if(!ev || !ev.rivalFare) return null;
  const rid = (ev.affectsRoutes || []).find(id => routeById(id)) || S.market, r = routeById(rid); if(!r) return null;
  const rival = competitorPrice(r), fare = S.rnd.pricesBefore && S.rnd.pricesBefore[rid] !== undefined ? S.rnd.pricesBefore[rid] : fareOf(rid);
  if(rival === undefined || rival >= fare) return null;   // not dearer: no one walks
  const keep = S.rivalAd; let stayAd = 0; try{ S.rivalAd = { event:ev.id, routes:[rid], untilDay:S.day + ((ev.durationDays || 1) - 1) }; stayAd = paxWant(r, fare); } finally { S.rivalAd = keep; }
  return { route:{ id:rid, city:r.city, flag:bfFlag(r.flag, 22) }, fare, rival, want:Math.round(demandAt(r, fare)), stay:Math.round(paxWant(r, fare)), stayAd:Math.round(stayAd), rivalName:WORLD.rival || 'Red Kite', adCost:ev.advertiseCost || 300, art:bfArt() };
}
/* the week just flown: the route and day with the most people turned away, and that day's departures on it */
function bfCapacityData(){
  const W = S.wk; if(!W || !W.rows) return null; let best = null;
  W.rows.forEach(row => { const h = (S.history || []).find(x => x.from === row.d && x.to === row.d); if(!h || !h.routes) return;
    Object.entries(h.routes).forEach(([id, v]) => { const away = Math.round((v.want || 0) - (v.pax || 0)); if(away > 0 && (!best || away > best.away)) best = { d:row.d, id, away, v, row }; }); });
  if(!best) return null; const r = routeById(best.id); if(!r) return null;
  let fl = (best.row.flights || []).filter(f => f.route === best.id).map(f => ({ t:fmtTime(f.dep), seats:f.seats, sold:f.sold }));
  if(!fl.length){ const n = Math.max(1, best.v.trips || 1), per = Math.round((best.v.seats || 19) / n); fl = Array.from({ length:n }, () => ({ t:'', seats:per, sold:Math.round(best.v.pax / n) })); }
  return { route:{ id:best.id, city:r.city, flag:bfFlag(r.flag, 22) }, day:dayName(best.d), fare:best.v.fare || fareOf(best.id), want:Math.round(best.v.want), flights:fl, art:bfArt() };
}
/* a flag drawn out in full (the game's flags point at symbols the briefing's page does not have) */
function bfFlag(id, h){ const sym = document.getElementById('flag-' + id), a = (typeof FLAG_ASPECT !== 'undefined' && FLAG_ASPECT[id]) || 1.5; return sym ? `<svg viewBox="${sym.getAttribute('viewBox') || `0 0 ${a * 10} 10`}" width="${a * h}" height="${h}" preserveAspectRatio="none">${sym.innerHTML}</svg>` : ''; }
/* What a fare does (rebuilt 19 Oct, D104): a fixed teaching example from the workbook's BriefingData sheet, not the pupil's routes
   (the page carries the same numbers for a workbook without the sheet). Set my fares returns to the fare stepper in his plan. */
function bfFareData(){ return Object.assign({}, (WB.briefingData || {}).fare_lever || {}); }
function bfToFares(d, data){
  render(); if(d && d.skipped) return;
  setTimeout(() => { const blks = [...screen().querySelectorAll('.s2-tt .ad-blk[data-tl]')], city = (data && data.route) || '';
    const b = blks.find(x => city && x.textContent.includes(city)) || blks[0]; if(!b) return; b.click();
    setTimeout(() => { const f = document.querySelector('[data-bvfare]:not([disabled])'); if(f) try{ f.focus(); }catch(e){} }, 80); }, 60);
}
function bfFuelData(){
  const price = fuelPrice(), blk = fuelBlock(), cap = tankCapacity(), max = fdMaxBlocks(price) || 0, litres = Math.max(blk, max * blk);
  let f = null; try{ f = dryRun(() => planFlights()).filter(x => !x.grounded).sort((a, b) => a.dep - b.dep)[0]; }catch(e){}
  if(!f) return null;
  const p = planeById(f.planeId || ((S.fleet.find(z => z.uid === f.uid) || S.fleet[0]) || {}).planeId) || planeById(S.fleet[0].planeId), r = routeById(f.route);
  const run = Math.round(runCostOf(p, r)), term = Math.round(f.sold * termCharge());
  // the plan's day: litres burned, ticket money and the other costs, for the week the briefing flies
  const need = fdNeed(S.day), L = planLines(currentPlan()), fuelDay = (L.fuelL || 0) * price, cost = (L.v && L.v.cost) || 0;
  const day = { tickets:Math.round((L.v && L.v.rev) || 0), other:Math.round(Math.max(0, cost - ((L.v && L.v.fuel) || 0))) };
  return { cash:Math.round(S.cash), price, litres, tank:cap, weekNeed:need.week, perDay:Math.round(need.perDay), days:need.days, blk, day,
    flight:{ dep:fmtTime(f.dep), plane:p.name, to:r.city, litres:f.fuelL || fuelForTrip(p, r), pax:f.sold, fare:f.price, costs:[[`Flying and landing, ${r.city} and back`, run]].concat(term ? [[`Passenger charges ${f.sold} × ${money(termCharge())}`, term]] : []) } };
}

/* 13 · Can you afford to run it? (Fable's brief, 18 Oct 2026; D103): the engine's projection of the pupil's plan for this week, day by
   day (litres, takings, the other costs), the cash and reserve, the price of a block, the planes and the shop's cheapest plane
   (flying a week like one of the pupil's). It plays once, in year one, in week 2; the line drawn becomes the pupil's reserve. */
const bfC2FDue = () => bfOn() && bfHas('cash_to_fly') && !bfS().seen.cash_to_fly && typeof yearOne === 'function' && yearOne() && weekNo(S.day || 1) === 2 && S.phase === 'round';
function bfCashToFlyData(){
  if(!S || !S.fleet || !S.fleet.length) return null;
  const blk = fuelBlock(), ppl = fuelPrice(), wk = weekNo(S.day || 1), mon = (wk - 1) * 7 + 1, pl = currentPlan(), WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], WL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const days = []; for(let d = mon; d < mon + 7; d++){ let L = null; try{ L = dryRun(() => atDay(d, () => planLines(pl))); }catch(e){} if(!L) return null;
    const v = L.v || {}, dt = calDate(d), w = dt.getUTCDay();
    days.push({ d:`${WD[w]} ${dt.getUTCDate()}`, name:WL[w], litres:Math.round(L.fuelL || 0), tickets:Math.max(0, Math.round((v.profit || 0) + (v.cost || 0))), otherCosts:Math.max(0, Math.round((v.cost || 0) - (v.fuel || 0))) }); }
  if(!days.some(x => x.litres)) return null;
  const planes = S.fleet.map(f => ({ name:planeById(f.planeId).name, art:bfArt(f.uid), dayCost:Math.round(dayCostOf(f)) }));
  // the shop's cheapest plane: what the comparison (D62) projects it would add to the airline (its best use, on the route
  // turning people away), or, without the comparison, a week like one of the pupil's
  const cands = shopPlanes().map(p => ({ p, o:shopOffer(p) })).filter(x => x.o.buyOffered && x.o.price > 0).sort((a, b) => a.o.price - b.o.price), n = S.fleet.length;
  let C = null; try{ if(typeof acCompareOn === 'function' && acCompareOn()) C = acCompare(); }catch(e){}
  const bOf = pid => C && (C.cands.find(x => x.pid === pid) || {}).b, c = cands.find(x => !C || bOf(x.p.id)) || cands[0], b = c && bOf(c.p.id);
  const one = b ? { litres:Math.round(b.fuelL || 0), tickets:Math.round(b.rev || 0), otherCosts:Math.max(0, Math.round((b.cost || 0) - (b.fuelL || 0) * ppl)) } : null;
  const shopPlane = c ? { name:c.p.name, price:Math.round(c.o.price), dayCost:Math.round(c.p.dayCost || 0), art:bfPlain(c.p), where:b ? (routeById(C.rid) || {}).city || null : null,
    days:days.map(x => one && x.litres ? one : { litres:Math.round(x.litres / n), tickets:Math.round(x.tickets / n), otherCosts:Math.round(x.otherCosts / n) }) } : null;
  return { cash:Math.round(S.cash), reserve:typeof myReserve === 'function' ? myReserve() : 0, price:Math.round(ppl * blk), blockLitres:blk, days, planes, shopPlane,
    emergencyPremium:WORLD.fuelTopUp !== undefined ? WORLD.fuelTopUp : 0.1, week:wk };
}
function bfCashToFly(next){
  const data = bfCashToFlyData(); if(!data) return false; data.next = next;
  return bfOpen('cash_to_fly', data, d => {
    d = d || {}; if(!d.skipped && d.reserve !== undefined && typeof setMyReserve === 'function') setMyReserve(d.reserve, 'briefing');
    bfS().cashToFly = { day:S.day, at:next, reserve:d.reserve === undefined ? null : d.reserve, boughtPlaneInScene:!!d.boughtPlaneInScene, stagedBuys:d.stagedBuys || 0, skipped:!!d.skipped };
    try{ save(); }catch(e){} render(); });
}

/* ---------- the Briefings shelf (menu): replay any briefing seen ---------- */
function bfShelfHtml(){
  const seen = Object.keys(bfS().seen).filter(bfHas); if(!seen.length) return '';
  return `<div class="bf-shelf"><p class="kl">Briefings</p>${seen.map(id => `<button class="btn" data-bfreplay="${id}">${esc(bfRow(id).title)}</button>`).join('')}</div>`;
}
const bfRenderOverlay0 = renderOverlay;
renderOverlay = function(){
  const r = bfRenderOverlay0.apply(this, arguments);
  try{ if(S.overlay && S.overlay.type === 'menu'){ const box = screen().querySelector('.card.stack'); const h = bfShelfHtml();
    if(box && h && !box.querySelector('.bf-shelf')){ box.insertAdjacentHTML('beforeend', h);
      box.querySelectorAll('[data-bfreplay]').forEach(b => b.onclick = () => { const id = b.getAttribute('data-bfreplay'); closeOverlay(); bfReplay(id); }); } } }catch(e){}
  return r;
};
/* a replay: the figures it played with first, or today's */
function bfReplay(id){ bfOpen(id, (id === 'fuel_cash_tank_profit' ? bfFuelData() : (bfS().data || {})[id]) || bfDataFor(id) || {}, d => { if(id === 'cash_to_fly' && d && !d.skipped && d.reserve !== undefined && typeof setMyReserve === 'function') setMyReserve(d.reserve, 'briefing'); render(); }); }
/* the shelf on Home (Fable's plan: "Replay from a Briefings shelf on Home"): a Briefings button beside Plan the week */
function bfHomeShelf(root){
  const act = root.querySelector('.td2 .td-act'), seen = Object.keys(bfS().seen).filter(bfHas); if(!act || !seen.length || act.querySelector('.bf-home')) return;
  act.insertAdjacentHTML('beforeend', `<span class="bf-home"><button class="btn small" id="bfHomeBtn" aria-expanded="false" title="Watch a briefing again">Briefings · ${seen.length}</button><span class="bf-home-list" role="menu" hidden><span class="kl">Watch again</span>${seen.map(id => `<button class="btn small" role="menuitem" data-bfhome="${id}">${esc(bfRow(id).title)}</button>`).join('')}</span></span>`);
  const btn = act.querySelector('#bfHomeBtn'), list = act.querySelector('.bf-home-list');
  btn.onclick = e => { e.stopPropagation(); list.hidden = !list.hidden; btn.setAttribute('aria-expanded', String(!list.hidden)); };
  list.querySelectorAll('[data-bfhome]').forEach(b => b.onclick = e => { e.stopPropagation(); list.hidden = true; bfReplay(b.getAttribute('data-bfhome')); });
}
/* the weekend briefing's data is kept for a replay */
const bfOpenKeep = bfOpen;
bfOpen = function(id, data, onDone){ if(data && id !== 'fuel_cash_tank_profit'){ const B = bfS(); (B.data = B.data || {})[id] = data; } return bfOpenKeep(id, data, onDone); };
/* for the teacher's test toolkit (D102): skip the open briefing to its end state, or play any built one now */
window.__bf = {
  open:() => !!bfCur,
  skip:() => { if(!bfCur) return false; const c = bfCur; bfCur = null; bfShut(); bfS().seen[c.id] = S.day || 1; if(c.onDone) c.onDone({ skipped:true }); return true; },
  list:() => bfRows().filter(b => bfHas(b.id)).map(b => ({ id:b.id, title:b.title })),
  play:id => bfOpen(id, bfDataFor(id) || (bfS().data || {})[id] || {}, () => render()),
  data:id => bfDataFor(id)
};
}
