
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
let BF_FILES = {}; try{ BF_FILES = JSON.parse(document.getElementById('data-briefings').textContent); }catch(e){}
const bfRows = () => WB.briefings || [], upgRows = () => WB.upgrades || [];
const bfRow = id => bfRows().find(b => b.id === id), upgRow = id => upgRows().find(u => u.id === id);
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
  const inject = `<script>window.BRIEF=${JSON.stringify(data || {}).replace(/</g, '\\u003c')};<\/script>`;
  const fr = document.createElement('iframe'); fr.title = `Operations briefing: ${b.title || id}`; fr.setAttribute('allow', '');
  fr.srcdoc = html.replace(/<head>/i, '<head>' + inject); layer.appendChild(fr); document.body.appendChild(layer);
  bfCur = { id, onDone }; setTimeout(() => { try{ fr.focus(); }catch(e){} }, 60); return true;
}
function bfShut(){ const l = document.getElementById('bfLayer'); if(l) l.remove(); }
window.addEventListener('message', e => {
  const d = e.data; if(!d || d.type !== 'briefing-done' || !bfCur) return;
  const c = bfCur; bfCur = null; bfShut(); bfS().seen[c.id] = S.day || 1; try{ save(); }catch(err){} if(c.onDone) c.onDone(d);
});
/* Esc never closes a briefing for the pupil (it advances by doing); the teacher can with Ctrl+Shift+B */
document.addEventListener('keydown', e => { if(bfCur && e.ctrlKey && e.shiftKey && (e.key === 'B' || e.key === 'b')){ e.preventDefault(); const c = bfCur; bfCur = null; bfShut(); if(c.onDone) c.onDone({ skipped:true }); } });

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
}
function bfFuelData(){
  const price = fuelPrice(), blk = fuelBlock(), cap = tankCapacity(), max = fdMaxBlocks(price) || 0, litres = Math.max(blk, max * blk);
  let f = null; try{ f = dryRun(() => planFlights()).filter(x => !x.grounded).sort((a, b) => a.dep - b.dep)[0]; }catch(e){}
  if(!f) return null;
  const p = planeById(f.planeId || ((S.fleet.find(z => z.uid === f.uid) || S.fleet[0]) || {}).planeId) || planeById(S.fleet[0].planeId), r = routeById(f.route);
  const run = Math.round(runCostOf(p, r)), term = Math.round(f.sold * termCharge());
  return { cash:Math.round(S.cash), price, litres, tank:cap, weekNeed:fdNeed(S.day).week,
    flight:{ dep:fmtTime(f.dep), plane:p.name, to:r.city, litres:f.fuelL || fuelForTrip(p, r), pax:f.sold, fare:f.price, costs:[[`Flying and landing, ${r.city} and back`, run]].concat(term ? [[`Passenger charges ${f.sold} × ${money(termCharge())}`, term]] : []) } };
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
      box.querySelectorAll('[data-bfreplay]').forEach(b => b.onclick = () => { const id = b.getAttribute('data-bfreplay'); closeOverlay(); bfOpen(id, id === 'fuel_cash_tank_profit' ? bfFuelData() : (S.brief.data || {})[id] || {}, () => render()); }); } } }catch(e){}
  return r;
};
/* the weekend briefing's data is kept for a replay */
const bfOpenKeep = bfOpen;
bfOpen = function(id, data, onDone){ if(data && id !== 'fuel_cash_tank_profit'){ const B = bfS(); (B.data = B.data || {})[id] = data; } return bfOpenKeep(id, data, onDone); };
/* for the teacher's test toolkit (D102): skip the open briefing to its end state, or play any built one now */
window.__bf = {
  open:() => !!bfCur,
  skip:() => { if(!bfCur) return false; const c = bfCur; bfCur = null; bfShut(); if(c.onDone) c.onDone({ skipped:true }); return true; },
  list:() => bfRows().filter(b => bfHas(b.id)).map(b => ({ id:b.id, title:b.title })),
  play:id => bfOpen(id, (id === 'fuel_cash_tank_profit' ? bfFuelData() : id === 'weekend_demand' ? bfWeekendData() : (bfS().data || {})[id]) || {}, () => render())
};
}
