/* =====================================================================
   AFTER LAUNCH DAY (hand-off 3, 30 Oct 2026, evening, sections 4 and 5; DESIGN.md "After Launch Day"). Chapter one only.
   When Launch Day's flights land there is no return to Home and no Close the day:
     1 · Launch Day results: its own page, "Launch Day: how it went" (the result tiles, the results panel, route by route,
         feedback, a Next panel) and one button, Check my plan for the week ▶;
     2 · the plan check (step c1check): his flights with Launch Day's seats filled, and "Before it flies": green ✓ checks,
         the cyan ● chance, and an amber ! for a flight whose Launch Day profit was below Settings planCheckLookBelow (then
         Change my plan is the main button and the go button reads Fly it anyway ▶). Change my plan opens the timetable,
         and the Studio's Work out my plan works as before; the check comes back with the new plan's figures;
     3 · Week 1 is flying (the week's board, drawn again for week 1): a tile for each day, Tuesday to Sunday, Normal / Fast,
         Live Operations, So far this week, and Skip to Sunday ⏭. On Sunday the week's accounts open.
   The Tuesday "Week 1 plan" sheet is retired: in week 1 the board no longer stops for the cells the plan left open (Paris
   ticket revenue, the day's profit). His plan hasn't changed, so nothing is worked out again.
   The words are ScreenText's (ld.results, plancheck*, weekflies*); Settings weekOneAfterLaunch turns it off ("off").
   Later weeks keep today's board: the hand-off asks for week 1 only.
   Section 5 is at the end: the capacity tip waits for the plane shop. View trade-offs and ƒ work it out (hidden for all
   of chapter one) are p6e's body class.
   ===================================================================== */
{
const c1AfterOn = () => ch1() && !c1Off(WBS().weekOneAfterLaunch);
const c1Wk1 = W => !!(W && W.from === 1 && c1AfterOn());
const T = (id, v) => c1T(id, v), Hx = s => h21Html(s);
const c1Btn = s => esc(String(s || '').replace(/\s*▶\s*$/, '').replace(/\s*⏭\s*$/, '')).trim();
const c1DayWords = d => { const c = calDate(d); return `${dayName(d)} ${c.getUTCDate()}`; };
const c1Planes = () => S.fleet.map(f => `${shortPlane(planeById(f.planeId))} ${regOf(f.uid)}`).join(' · ');
const c1Unlit = () => screen().querySelectorAll('.dnav .nv.on').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-current', 'false'); });   // no menu item selected
const c1FlProfit = f => Math.round((f.revenue || 0) - (f.runCost || 0) - (f.fuelCost || 0) - (f.termCost || 0));   // a flight's own takings less its own costs

/* ---------- 1. Launch Day results ---------- */
const c1Res0 = R.results;
R.results = st => {
  c1Res0(st); if(!(c1AfterOn() && S.phase === 'setup')) return;
  if(typeof hqMap !== 'undefined' && hqMap){ hqMap.destroy(); hqMap = null; }
  const X = c1Ex(), h = lastDay();
  // what the plan check needs from today: each flight's seats and profit, and the people each route couldn't carry
  X.ldf = (S.rnd.flights || []).filter(f => !f.grounded).map(f => ({ route:f.route, dep:f.dep, price:f.price, sold:f.sold, seats:f.seats, profit:c1FlProfit(f), uid:f.uid }));
  X.ldMiss = {}; if(h && h.routes) Object.keys(h.routes).forEach(id => { const x = h.routes[id]; X.ldMiss[id] = Math.max(0, (x.want || x.pax || 0) - (x.pax || 0)); });
  const L = T('ld.results', { date:dateLong(S.day).replace(/ \d{4}$/, '') }), Ft = T('ld.results.footer');
  const fbP = tabbedPanel('p-fb', 'fbr', [['fb', 'Feedback', feedbackHtml], ['al', 'Alerts', intelHtml, intelSituations().length + protoIntel().filter(x => x.warn).length || '']]);
  const body = `${kpiRow('results')}<div class="c1a-grid"><section class="hp p-td">${todayCard('results')}</section>
    <div class="c1a-mid"><section class="hp p-rp">${hqHead('Route Performance', 'LAUNCH DAY')}${evidenceHtml(h, ownedRoutes())}</section>${fbP}</div>
    <section class="c1a-next"><span class="c1a-eye">${esc(L.eyebrow || 'NEXT')}</span><p>${Hx(L.text[1] || '')}</p></section></div>`;
  screen().innerHTML = shell(deskPage({ cls:'c1a c1a-res', title:esc(L.title || 'Launch Day: how it went'), sub:esc(L.text[0] || ''), body }),
    deskBar(esc(Ft.text[0] || 'Launch Day is done.'), `<button class="bv-btn go big" id="nx">${c1Btn(L.button || 'Check my plan for the week')} &#9654;</button>`));
  const act = screen().querySelector('.p-td .td-act'); if(act) act.remove();
  c1Unlit(); on('nx', () => { UI.view = null; closeDay(); });
};

/* ---------- 2. the plan check ---------- */
/* the flights as they will fly from Tuesday: Launch Day's own figures while the plan is the same, the plan's projection once he changes it */
function c1CheckModel(){
  const X = c1Ex(), ld = X.ldf || [], key = f => `${f.route}@${f.dep}@${f.price}@${f.uid}`;
  let now = []; try{ now = dryRun(() => withPlan(normPlan(currentPlan()), () => planFlights())).filter(f => !f.grounded); }catch(e){}
  const same = ld.length > 0 && now.length === ld.length && now.every(f => ld.some(g => key(g) === key(f)));
  const rows = (same ? ld : now.map(f => ({ route:f.route, dep:f.dep, price:f.price, sold:f.sold, seats:f.seats, profit:c1FlProfit(f), uid:f.uid }))).slice().sort((a, b) => a.dep - b.dep);
  let miss = X.ldMiss || {};
  if(!same){ miss = {}; try{ const L = planLines(currentPlan()); L.routes.forEach(x => { miss[x.id] = Math.max(0, Math.round(L.want[x.id] || 0) - x.pax); }); }catch(e){} }
  let fits = true, bad = ''; try{ const pl = normPlan(currentPlan()); pl.fleet.forEach(x => { if(x.sched.length && !fitsFor(x)){ fits = false; const f = S.fleet.find(y => y.uid === x.uid); bad = bad || (f ? `${shortPlane(planeById(f.planeId))} ${regOf(f.uid)}` : shortPlane(planeById(x.planeId))); } }); }catch(e){}
  const lim = isNaN(+WBS().planCheckLookBelow) ? 0 : +WBS().planCheckLookBelow;
  return { same, rows, miss, fits, bad, look:rows.filter(r => r.profit < lim), sold:rows.reduce((t, r) => t + r.sold, 0), seats:rows.reduce((t, r) => t + r.seats, 0) };
}
R.c1check = st => {
  const W = S.wk, M = c1CheckModel(), a = W ? W.from + 1 : S.day, z = W ? W.from + 6 : S.day + 5, zc = calDate(z);
  const P = T('plancheck', { from:c1DayWords(a), to:`${c1DayWords(z)} ${MONTH[zc.getUTCMonth()]}` }), F = T('plancheck.flights', { plane:c1Planes() }), K = T('plancheck.checks', {}).text;
  const Ch = T('plancheck.changed', { plane:c1Planes() }).text, U = T('plancheck.under'), Ft = T('plancheck.footer'), Lk = T('plancheck.look');
  const good = .8;
  const fl = M.rows.map(r => { const rt = routeById(r.route), ok = r.seats && r.sold / r.seats >= good;
    return `<div class="c1k-f"><b class="mono">${fmtTime(r.dep)}</b><span class="c1k-r">${flagSvg(rt.flag, 15)} ${esc(rt.city)} · ${money(r.price)}</span><b class="mono c1k-s ${ok ? 'green' : 'amber'}">${num(r.sold)}/${num(r.seats)}</b></div>`; }).join('') || '<p class="muted">No flights in the plan.</p>';
  const line = (cls, ic, html) => `<div class="c1k-l ${cls}"><i>${ic}</i><span>${html}</span></div>`, lines = [];
  lines.push(M.fits ? line('ok', '✓', Hx(T('plancheck.checks', { open:fmtTime(dayStart()), close:fmtTime(dayEnd()) }).text[0] || '')) : line('look', '!', Hx(T('plancheck.nofit', { plane:M.bad, close:fmtTime(dayEnd()) }).text[0] || '')));
  if(!M.look.length) lines.push(line('ok', '✓', Hx((M.same ? K[1] : Ch[1]) || '')));
  else M.look.forEach(r => { const v = { route:routeById(r.route).city, time:fmtTime(r.dep), sold:num(r.sold), seats:num(r.seats), fare:num(r.price) };
    lines.push(line('look', '!', Hx((M.same ? T('plancheck.look', v).text[0] : T('plancheck.changed', v).text[2]) || ''))); });
  lines.push(line('ok', '✓', Hx((M.same ? T('plancheck.checks', { sold:num(M.sold), seats:num(M.seats) }).text[2] : T('plancheck.changed', { sold:num(M.sold), seats:num(M.seats) }).text[3]) || '')));
  const ids = Object.keys(M.miss).filter(id => M.miss[id] > 0), n = ids.reduce((t, id) => t + M.miss[id], 0);
  if(n) lines.push(line('chance', '●', Hx(T('plancheck.checks', { n:num(n), list:ids.map(id => `${routeById(id).city} ${num(M.miss[id])}`).join(', ') }).text[3] || '')));
  const look = M.look.length > 0 || !M.fits;
  const body = `<div class="c1k-grid"><section class="hp c1k-p"><div class="c1k-h"><h3>${esc(F.title || 'Your flights, every day')}</h3><p>${esc((M.same ? F.text[0] : Ch[0]) || '')}</p></div><div class="c1k-fl">${fl}</div></section>
    <section class="hp c1k-p"><div class="c1k-h"><h3>${esc(T('plancheck.checks').title || 'Before it flies')}</h3></div><div class="c1k-ls">${lines.join('')}</div></section></div>
    <p class="c1k-under">${Hx(U.text[0] || '')}</p>`;
  screen().innerHTML = shell(deskPage({ cls:'c1a c1k', title:esc(P.title || 'Your plan for the rest of week 1'), sub:esc(P.text[0] || ''), body }),
    deskBar(esc(Ft.text[0] || ''), `<button class="bv-btn ${look ? 'primary' : ''} big" id="c1Chg">${c1Btn(U.button || 'Change my plan')}</button><button class="bv-btn ${look ? '' : 'go'} big" id="nx">${c1Btn(look ? (Lk.button || 'Fly it anyway') : (P.button || 'Fly Tuesday to Sunday'))} &#9654;</button>`));
  c1Unlit();
  on('c1Chg', () => { UI.view = null; const nx = S.steps[S.si + 1];
    if(!(nx && nx.t === 'plan')) S.steps.splice(S.si + 1, 0, { t:'plan' }, { t:'workings' }, { t:'c1check' });
    next(); });
  on('nx', () => { UI.view = null;
    const k = S.steps.findIndex((x, i) => i > S.si && x.t === 'weekRun'); if(k > S.si + 1) S.steps.splice(S.si + 1, k - S.si - 1);   // a plan change left behind by Back
    if(S.wk){ S.wk.c1go = true; if(!M.same) S.wk.projected = c1ProjectRest(S.wk); }
    next(); });
};
/* the week's projection once the plan has changed: Launch Day as it flew, then the new plan Tuesday to Sunday */
function c1ProjectRest(W){
  let tot = (W.rows.find(r => r.d === W.from) || {}).profit || 0;
  for(let d = W.from + 1; d < W.from + 7; d++){ const b = beatAt(d); tot += dryRun(() => withDay(d, () => withBeat(b, () => { S.day = d; return planLines(currentPlan()).v.profit; }))); }
  return Math.round(tot);
}
Object.assign(FRAME_TITLES, { c1check:'Your plan for the week' }); NO_BACK.push('c1check');
Object.assign(RAIL_LABEL, { c1check:'Plan check' }); Object.assign(SUB_DESC, { c1check:'Before the week flies' });

/* ---------- 3. Week 1 is flying ---------- */
const C1_SPEED = { normal:6000, fast:1600 };
const c1Dur = () => UI.c1Skip === (S.wk && S.wk.from) ? 0 : (settings.flightSecs !== undefined && settings.flightSecs <= 1) ? 120 : C1_SPEED[UI.c1Speed || 'normal'] || C1_SPEED.normal;
const c1Rest = () => UI.c1Skip === (S.wk && S.wk.from) ? 0 : (settings.flightSecs !== undefined && settings.flightSecs <= 1) ? 80 : 700;
const c1WR0 = R.weekRun;
R.weekRun = st => {
  const W = S.wk; if(!c1Wk1(W)) return c1WR0(st);
  if(!W.c1go){ if(W.rows.some(r => r.d > W.from) || W.dayDone === S.day){ W.c1go = true; } else { S.steps.splice(S.si, 0, { t:'c1check' }); render(); return; } }   // a week joined part-way has no check
  W.sumsChecked[S.day] = true;   // the Tuesday "Week 1 plan" sheet is retired: week 1 runs without stopping
  c1WeekPage();
};
/* today's flights: as flown, or as they will fly (the engine's own planFlights, so nothing changes when the day runs) */
function c1Today(){ if(S.wk.dayDone === S.day) return (S.rnd.flights || []).filter(f => !f.grounded);
  if(!UI.c1Pre || UI.c1Pre.day !== S.day){ let fl = []; try{ fl = dryRun(() => { refreshPlan(); return planFlights(); }).filter(f => !f.grounded); }catch(e){} UI.c1Pre = { day:S.day, fl }; }
  return UI.c1Pre.fl; }
function c1Span(fl){ if(!fl.length) return [dayStart(), dayEnd()]; return [Math.min(...fl.map(f => f.dep)) - 20, Math.max(...fl.map(f => f.arr || f.dep + 60)) + 10]; }
function c1LiveRows(fl, clock, done){
  const st = f => done || clock >= (f.arr || f.dep + 60) ? (f.sold >= f.seats ? ['ok', 'Full flight'] : ['ok', 'Landed']) : clock >= f.dep ? ['air', 'In the air'] : ['wait', 'Scheduled'];
  const shown = fl.slice(0, 4), more = fl.length - shown.length;
  return `<table class="hq-t lo c1w-lo"><thead><tr><th>Time</th><th>To</th><th class="num">Seats</th><th>Status</th></tr></thead><tbody>${shown.map(f => { const r = routeById(f.route), [k, w] = st(f);
    return `<tr><td class="num">${fmtTime(f.dep)}</td><td>${flagSvg(r.flag, 15)} ${esc(r.city)}</td><td class="num">${done || clock >= f.dep ? `${num(f.sold)}/${num(f.seats)}` : num(f.seats)}</td><td><span class="c1w-dot ${k}"></span><span class="c1w-st ${k}">${w}</span></td></tr>`; }).join('')}${more ? `<tr><td colspan="4" class="muted">and ${more} more flight${more === 1 ? '' : 's'} today</td></tr>` : ''}</tbody></table>`;
}
function c1SoFar(W){
  const S2 = T('weekflies.sofar').text, rows = W.rows.filter(r => r.d > W.from), names = rows.map(r => dayName(r.d));
  const days = names.length < 3 ? h21List(names) : `${names[0]} to ${names[names.length - 1]}`;
  const prof = rows.reduce((t, r) => t + r.profit, 0), pax = rows.reduce((t, r) => t + r.pax, 0), seats = rows.reduce((t, r) => t + r.seats, 0);
  const miss = (S.history || []).filter(h => h.from > W.from && h.from === h.to && h.from <= W.from + 6).reduce((t, h) => t + Object.values(h.routes || {}).reduce((u, x) => u + Math.max(0, (x.want || 0) - (x.pax || 0)), 0), 0);
  const ln = (k, v, cls) => `<div class="c1w-sf"><span>${k}</span><b class="mono ${cls || ''}">${v}</b></div>`;
  return ln(esc(rows.length ? T('weekflies.sofar', { days }).text[0] : String(S2[0] || 'Profit').replace(/,?\s*\{days\}/, '')), rows.length ? money(Math.round(prof)) : '—', rows.length ? (prof >= 0 ? 'gold' : 'amber') : '')
    + ln(esc(S2[1] || 'Seats filled'), rows.length ? `${num(pax)} of ${num(seats)}` : '—') + ln(esc(S2[2] || ''), rows.length ? num(miss) : '—');
}
function c1WeekPage(){
  const W = S.wk, done = W.dayDone === S.day, P = T('weekflies'), tw = T('weekflies.tile').text, fl = c1Today().slice().sort((a, b) => a.dep - b.dep), [c0, c9] = c1Span(fl);
  if(!done && (!UI.c1Fly || UI.c1Fly.day !== S.day)) UI.c1Fly = { day:S.day, t0:Date.now(), dur:c1Dur() };
  const F = UI.c1Fly, prog = done ? 1 : F.dur ? clamp((Date.now() - F.t0) / F.dur, 0, 1) : 1, clock = c0 + (c9 - c0) * prog, out = fl.filter(f => clock >= f.dep).length;
  const tiles = []; for(let k = 1; k < 7; k++){ const d = W.from + k, r = W.rows.find(x => x.d === d), now = d === S.day && !r;
    tiles.push(r ? `<div class="c1w-t flown"><b>${esc(dateShort(d).replace(/ \w+$/, ''))}</b><small>${esc(tw[0] || '✓ flown')}</small><span class="c1w-p mono ${r.profit >= 0 ? 'gold' : 'amber'}">${money(Math.round(r.profit))}</span><small>${esc(tw[1] || 'profit')}</small></div>`
      : now ? `<div class="c1w-t now"><b>${esc(dateShort(d).replace(/ \w+$/, ''))}</b><small class="cyan" id="c1wClock">${esc(T('weekflies.tile', { time:fmtTime(clock) }).text[2] || '')}</small><i class="c1w-bar"><i id="c1wBar" style="width:${(prog * 100).toFixed(1)}%"></i></i><small id="c1wOut">${esc(T('weekflies.tile', { n:out, total:fl.length }).text[3] || '')}</small></div>`
      : `<div class="c1w-t wait"><b>${esc(dateShort(d).replace(/ \w+$/, ''))}</b><small>${esc(tw[4] || 'waiting')}</small></div>`); }
  const sp = UI.c1Speed || 'normal';
  const body = `<div class="c1w-sp" role="group" aria-label="Speed"><button class="bv-btn ${sp === 'normal' ? 'on' : ''}" data-c1sp="normal">&#9654; ${esc(tw[5] || 'Normal')}</button><button class="bv-btn ${sp === 'fast' ? 'on' : ''}" data-c1sp="fast">&#9654;&#9654; ${esc(tw[6] || 'Fast')}</button></div>
    <div class="c1w-tiles">${tiles.join('')}</div>
    <div class="c1w-grid"><section class="hp c1w-live">${hqHead(esc(tw[7] || 'Live Operations'), '')}<div class="pb" id="c1wLive">${c1LiveRows(fl, clock, done)}</div></section>
    <section class="hp c1w-so"><div class="c1k-h"><h3>${esc(T('weekflies.sofar').title || 'So far this week')}</h3></div>${c1SoFar(W)}</section></div>`;
  screen().innerHTML = shell(deskPage({ cls:'c1a c1w', title:esc(P.title || 'Week 1 is flying'), sub:esc(P.text[0] || ''), body }),
    deskBar(esc(T('weekflies.footer').text[0] || ''), `<button class="bv-btn big" id="c1Skip">${esc(String(P.button || 'Skip to Sunday ⏭').replace(/\s*⏭\s*$/, ''))} &#9197;</button>`));
  c1Unlit();
  screen().querySelectorAll('[data-c1sp]').forEach(b => b.onclick = () => { const v = b.getAttribute('data-c1sp'); if(v === UI.c1Speed) return;
    const G = UI.c1Fly, p = G && G.dur ? clamp((Date.now() - G.t0) / G.dur, 0, 1) : 0; UI.c1Speed = v; if(G && G.day === S.day){ G.dur = c1Dur(); G.t0 = Date.now() - p * G.dur; } render(); });
  on('c1Skip', () => { UI.c1Skip = S.wk.from; if(UI.c1Fly){ UI.c1Fly.dur = 0; } c1Tick(); });
  if(UI.wkTimer){ clearTimeout(UI.wkTimer); UI.wkTimer = null; }
  if(done){ UI.wkTimer = setTimeout(() => { UI.wkTimer = null; if(step().t !== 'weekRun' || !S.wk || S.wk.dayDone !== S.day) return; weekRunAdvance(); }, c1Rest()); return; }
  UI.c1Tok = {}; const tok = UI.c1Tok; requestAnimationFrame(() => c1Tick(tok));
}
/* the clock moves through the day's flights; at the end the day flies (the engine's own day), and the board moves on */
function c1Tick(tok){
  if(tok && tok !== UI.c1Tok) return; if(step().t !== 'weekRun' || !S.wk || S.wk.dayDone === S.day) return;
  const F = UI.c1Fly; if(!F || F.day !== S.day) return;
  const fl = c1Today().slice().sort((a, b) => a.dep - b.dep), [c0, c9] = c1Span(fl), prog = F.dur ? clamp((Date.now() - F.t0) / F.dur, 0, 1) : 1, clock = c0 + (c9 - c0) * prog;
  if(prog < 1){
    const c = $('c1wClock'); if(c) c.textContent = T('weekflies.tile', { time:fmtTime(clock) }).text[2] || '';
    const b = $('c1wBar'); if(b) b.style.width = (prog * 100).toFixed(1) + '%';
    const o = $('c1wOut'); if(o) o.textContent = T('weekflies.tile', { n:fl.filter(f => clock >= f.dep).length, total:fl.length }).text[3] || '';
    const lv = $('c1wLive'); if(lv){ const h = c1LiveRows(fl, clock, false); if(lv.dataset.h !== h){ lv.innerHTML = h; lv.dataset.h = h; } }
    const t2 = UI.c1Tok = tok || {}; requestAnimationFrame(() => c1Tick(t2)); return; }
  UI.c1Tok = null; UI.c1Fly = null; UI.c1Pre = null;
  runDayQuick(); publish(); if(S.bust && S.bust.closed){ save(); render(); return; }
  render();
}

/* ---------- 5. the capacity tip ("Every seat is sold … another plane, or a bigger one") waits for the plane shop ---------- */
const c1Tips0 = dsTips;
dsTips = function(){ const v = c1Tips0.apply(this, arguments);
  try{ if(ch1() && typeof shopPlanes === 'function' && !shopPlanes(S.day || 1).length) return v.filter(h => h.id !== 'all_full_capacity'); }catch(e){}
  return v; };

/* the play notes' log names these pages */
window.__pnLabel = t => t === 'c1check' ? 'Plan check' : t === 'weekRun' && S && c1Wk1(S.wk) ? 'Week 1 is flying' : t === 'results' && S && S.phase === 'setup' && c1AfterOn() ? 'Launch Day results' : null;
window.__c1after = { model:c1CheckModel, flying:() => !!UI.c1Fly, skip:() => { const b = $('c1Skip'); if(b) b.click(); } };
}
