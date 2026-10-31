/* =====================================================================
   WEEK 1 EVERY DAY, AND A THIRD DESTINATION (Claude Design's hand-off 2a and Fable's workbook v6.5, D111; 31 Oct 2026).
   Chapter one only. Where this differs from DESIGN.md (30 Oct) or the earlier hand-offs, the 31 Oct decisions win (hand-off
   2a, section 9; DESIGN.md of 31 Oct).
     1 · The Day page: Launch Day and Tuesday to Saturday (Settings dailyChangeDays) each end on one page: how today went
         (profit tile, route by route), one sentence that reads the day, tomorrow's flights, and Keep for tomorrow ▶ or
         Change my plan. More detail opens a drawer. It replaces the Launch Day results page, the plan check and the
         "Week 1 is flying" stop in week 1. A day that lost money is amber, and Change my plan is the main button.
     2 · The daily change: Change my plan opens the timetable; on return the Changes sheet: Finance works the fare
         difference with the pointer (the first change only), he builds the ticket revenue difference a day (a formula,
         not counted), then works the difference over a week (× 7) on paper (counted, at most dailyChangeCountedPerDay a
         day and dailyChangeCountedWeek across the week; over that Finance fills it). Then Fly tomorrow ▶.
     3 · Frankfurt (Settings thirdRoute…): earned the morning after a near-optimum day; a departures-board card; the
         timetable already shows whether a flight fits.
     6 · Weeks 2 to 4: after the Changes sheet, the plan sheet is a comparison with no sums (Last week · This week · Difference).
   The words are the workbook's (ScreenText day.*, read.*, chg.*, fra.*).
   ===================================================================== */
{
const C2 = (id, v) => h21Text(id, v), C2H = s => h21Html(s);
const c2On = () => typeof ch1 === 'function' && ch1() && !c1Off(WBS().weekOneAfterLaunch);
const c2Range = () => { const m = /(\d+)\s*[-–]\s*(\d+)/.exec(String(WBS().dailyChangeDays || '')); return m ? [+m[1], +m[2]] : null; };
const c2Daily = () => c2On() && !!c2Range();
/* the days that end on a Day page: Launch Day (its results become the Day page) and dailyChangeDays */
const c2DayOn = d => { const r = c2Range(); return c2Daily() && (d === 1 || (r && d >= r[0] && d <= r[1])); };
const c2X = () => { const X = c1Ex(); return X.c2 || (X.c2 = { kept:{}, cnt:{}, seen:{} }); };
const c2Btn = s => esc(String(s || '').replace(/\s*▶\s*$/, '')).trim();
const c2Sign = v => `${v < 0 ? '−' : '+'}${money(Math.abs(Math.round(v)))}`;
const c2FlProfit = f => Math.round((f.revenue || 0) - (f.runCost || 0) - (f.fuelCost || 0) - (f.termCost || 0));
/* the default speed of a flying day: the one Settings weekSpeed marks "(default)" (D111: Fast) */
const c2Speed = () => { const s = String(WBS().weekSpeed || ''), m = /(Fast|Normal)[^·]*\(default\)/i.exec(s); return m ? m[1].toLowerCase() : 'normal'; };

/* ---------- reading the day: one sentence, loss first, then empty seats, then idle plane, then full planes ---------- */
function c2PlanProfit(pl){ try{ return dryRun(() => planLines(normPlan(pl)).v.profit); }catch(e){ return null; } }
function c2Read(d, fl, h){
  const out = (cls, id, v) => ({ cls, html:C2H(C2(id, v).text[0] || '') });
  const prof = Math.round((h && h.profit) || 0), wkend = /^(Sat|Sun)/.test(dayName(d)), tail = wkend ? ' ' + C2H(C2('read.weekend', { day:dayName(d) }).text[0] || '') : '';
  const add = o => { if(tail) o.html += tail; return o; };
  if(prof < 0) return add(out('loss', 'read.loss', { money:money(-prof) }));
  const pl = normPlan(currentPlan()), now = c2PlanProfit(pl), R = (h && h.routes) || {};
  // empty seats that a lower fare would have filled for more money
  let best = null;
  Object.keys(R).forEach(id => { const x = R[id], empty = (x.seats || 0) - (x.pax || 0), fare = x.fare || pl.prices[id]; if(empty <= 0 || !fare) return;
    const lower = fare - 10; if(lower <= 0) return; const p2 = JSON.parse(JSON.stringify(pl)); p2.prices[id] = lower; const v = c2PlanProfit(p2);
    if(v !== null && now !== null && v > now && (!best || v - now > best.gain)) best = { id, gain:v - now, fare, lower, empty }; });
  if(best) return add(out('', 'read.empty', { fare:money(best.fare), n:num(best.empty), route:routeById(best.id).city, money:money(Math.round(best.gain)), lower:money(best.lower) }));
  // the plane on the ground: after its last flight there is room for the shortest round trip it flies
  const byPlane = {}; fl.forEach(f => { (byPlane[f.uid] = byPlane[f.uid] || []).push(f); });
  let idle = null;
  Object.keys(byPlane).forEach(u => { const L = byPlane[u], last = Math.max(...L.map(f => f.arr || f.dep + 60)), trip = Math.min(...L.map(f => (f.arr || f.dep + 60) - f.dep)), turn = WORLD.turnaroundMin || 35;
    if(dayEnd() - last >= trip + turn && (!idle || last < idle)) idle = last; });
  if(idle !== null) return add(out('', 'read.idle', { time:fmtTime(idle) }));
  // full planes with people turned away: would £10 more on the route with most turned away earn more?
  const full = fl.length && fl.every(f => f.sold >= f.seats), miss = Object.keys(R).map(id => ({ id, n:Math.max(0, (R[id].want || 0) - (R[id].pax || 0)) })).filter(x => x.n > 0).sort((a, b) => b.n - a.n);
  const tot = miss.reduce((t, x) => t + x.n, 0);
  if(full && tot){
    const top = miss[0], p2 = JSON.parse(JSON.stringify(pl)); p2.prices[top.id] = (p2.prices[top.id] || routeById(top.id).basePrice) + 10; const v = c2PlanProfit(p2);
    if(!c1Off(WBS().fullPlaneNudge) && v !== null && now !== null && v > now) return add(out('', 'read.full', { n:num(tot), route:routeById(top.id).city }));
    return add(out('', 'read.good', {}));
  }
  if(full) return add(out('', 'read.good', {}));
  return add(out('', 'read.plain', { pax:num((h && h.pax) || 0), seats:num((h && h.seats) || 0) }));
}

/* ---------- the Day page ---------- */
function c2Tomorrow(fl){
  const s0 = dayStart(), span = dayEnd() - s0, X = m => (100 * (m - s0) / span).toFixed(3) + '%', ticks = [];
  for(let m = Math.ceil(s0 / 120) * 120; m <= dayEnd(); m += 120) ticks.push(`<span style="left:${X(m)}">${fmtTime(m)}</span>`);
  const rows = {}; fl.forEach(f => { (rows[f.uid] = rows[f.uid] || []).push(f); });
  const lanes = Object.keys(rows).map(u => { const f0 = S.fleet.find(x => String(x.uid) === String(u)), nm = f0 ? `${shortPlane(planeById(f0.planeId))} ${regOf(f0.uid)}` : '';
    return `<div class="c2-lane">${rows[u].sort((a, b) => a.dep - b.dep).map(f => { const r = routeById(f.route), a = f.arr || f.dep + 60;
      return `<div class="c2-blk" style="left:${X(f.dep)};width:${(100 * (a - f.dep) / span).toFixed(3)}%"><b>${flagSvg(r.flag, 14)} ${esc(r.city)} · ${money(f.price)}</b><small class="mono">${fmtTime(f.dep)}–${fmtTime(a)}</small></div>`; }).join('')}</div>
      <p class="c2-lanenote">${esc(nm)} · the day runs ${fmtTime(s0)} to ${fmtTime(dayEnd())}</p>`; }).join('');
  return `<div class="c2-ticks">${ticks.join('')}</div>${lanes}`;
}
function c2DayPage(o){
  const d = o.d, launch = d === 1, h = (S.history || []).slice().reverse().find(x => x.from === d && x.to === d) || lastDay() || {};
  const fl = (S.rnd.flights || []).filter(f => !f.grounded && !f.cancelled), prof = Math.round(h.profit || 0), yh = !launch && (S.history || []).find(x => x.from === d - 1 && x.to === d - 1);
  const c = calDate(d), dateW = `${dayName(d)} ${c.getUTCDate()} ${MONTH[c.getUTCMonth()]}`, t1 = calDate(d + 1), tom = `${dayName(d + 1)} ${t1.getUTCDate()} ${MONTH[t1.getUTCMonth()]}`;
  const title = launch ? (C2('day.title.launch').text[0] || 'Launch Day: how it went') : (C2('day.title', { date:dateW }).text[0] || `${dateW}: how it went`);
  const sub = launch ? `${dateLong(d).replace(/ \d{4}$/, '')} · every flight landed` : (C2('day.sub', { n:d - (S.wk ? S.wk.from : 1) + 1 }).text[0] || '');
  const yl = launch || !yh ? esc(C2('day.first').text[0] || 'Your first day of flying.') : C2H(C2('day.yesterday', { money:money(Math.round(yh.profit || 0)), change:'{change}' }).text[0] || '').replace('{change}', `<b class="${prof - (yh.profit || 0) >= 0 ? 'green' : 'amber'}">${c2Sign(prof - (yh.profit || 0))}</b>`);
  const cols = (C2('day.cols').text[0] || '').split('|'); const col = (i, dflt) => esc(cols[i] || dflt);
  const R = h.routes || {}, rrows = Object.keys(R).map(id => { const x = R[id], r = routeById(id), miss = Math.max(0, (x.want || 0) - (x.pax || 0));
    return `<tr><td>${flagSvg(r.flag, 15)} ${esc(r.city)}</td><td class="num">${num(Math.round(x.want || 0))}</td><td class="num">${num(x.seats || 0)}</td><td class="num">${num(x.pax || 0)}</td><td class="num ${miss ? 'amber' : ''}">${num(miss)}</td></tr>`; }).join('');
  const rd = c2Read(d, fl, h), loss = rd.cls === 'loss';
  const body = `<div class="c2-top"><section class="hp c2-prof"><span class="c2-k">${esc(C2('day.profit').text[0] || 'Profit today')}</span><b class="c2-big ${prof < 0 ? 'amber' : 'green'}">${prof < 0 ? '−' : ''}${money(Math.abs(prof))}</b><p>${yl}</p></section>
      <section class="hp c2-rt"><div class="c2-rth"><h3>${esc(C2('day.routes').text[0] || 'Route by route')}</h3><button class="c2-more" id="c2More">${esc(C2('day.more').text[0] || 'More detail ›')}</button></div>
      <table class="c2-t"><thead><tr><th>${col(0, 'Route')}</th><th class="num">${col(1, 'Wanted')}</th><th class="num">${col(2, 'Seats')}</th><th class="num">${col(3, 'Flew')}</th><th class="num">${col(4, "Couldn't carry")}</th></tr></thead><tbody>${rrows}</tbody></table></section></div>
    <section class="c2-read ${loss ? 'loss' : ''}" role="status"><i aria-hidden="true">${loss ? '!' : 'i'}</i><p>${rd.html}</p></section>
    <section class="hp c2-tom"><h3>${esc(C2('day.tomorrow', { date:tom }).text[0] || `Tomorrow, ${tom}`)}</h3><p class="c2-sub">${esc(C2('day.same').text[0] || 'Same flights, same fares as today.')}</p>${c2Tomorrow(fl)}</section>`;
  const sat = !launch && S.wk && d === S.wk.from + 5, foot = esc(C2(sat ? 'day.footer.sun' : 'day.footer').text[0] || 'Keep the plan for tomorrow, or change it.');
  const keep = loss ? c2Btn(C2('day.anyway').text[0] || 'Fly anyway') : c2Btn(C2('day.keep').text[0] || 'Keep for tomorrow');
  screen().innerHTML = shell(deskPage({ cls:'c1a c2-day', title:esc(title), sub:esc(sub), body }),
    deskBar(foot, `<button class="bv-btn ${loss ? 'primary' : ''} big" id="c2Change">${c2Btn(C2('day.change').text[0] || 'Change my plan')}</button><button class="bv-btn ${loss ? '' : 'go'} big" id="c2Keep">${keep} &#9654;</button>`));
  screen().querySelectorAll('.dnav .nv.on').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-current', 'false'); });
  on('c2More', () => c2Drawer(d, h));
  on('c2Keep', () => { c2X().kept[d] = true; c2Earn(d, h, fl); save(); o.keep(); });
  on('c2Change', () => { const X = c2X(); X.kept[d] = true; X.chgEve = d; c2Earn(d, h, fl); save(); o.change(); });
}
/* More detail: the results panel, the day's costs and the feedback, in a drawer from the right */
function c2Drawer(d, h){
  const D = (C2('day.drawer').text[0] || 'Launch Day results|Costs today|Feedback|✕ Close').split('|'), fuelL = (S.rnd.flights || []).reduce((t, f) => t + (f.grounded ? 0 : f.fuelL || 0), 0);
  const fuelC = (S.rnd.flights || []).reduce((t, f) => t + (f.grounded ? 0 : f.fuelCost || 0), 0), other = Math.round((h.costs || 0) - fuelC);
  let card = ''; try{ card = todayCard('results'); }catch(e){}
  const fb = (() => { try{ return tabbedPanel('p-fb', 'fbr', [['fb', 'Feedback', feedbackHtml]]); }catch(e){ return ''; } })();
  const el = document.createElement('div'); el.className = 'c2-dr'; el.id = 'c2Dr';
  el.innerHTML = `<div class="c2-shade" data-c2close></div><aside class="c2-drawer" role="dialog" aria-label="More detail"><div class="c2-drh"><span class="c2-k">MORE DETAIL</span><button class="bv-btn" data-c2close>${esc(D[3] || '✕ Close')}</button></div>
    <section class="hp p-td">${card}</section><h3>${esc(D[1] || 'Costs today')}</h3><div class="c2-cost"><span>Other costs (crew, airport, plane)</span><b class="mono">${money(Math.max(0, other))}</b></div>
    <div class="c2-cost"><span>Fuel burned · ${num(Math.round(fuelL))} L at ${priceL(h.fuelPrice || fuelPrice())}</span><b class="mono">${money(Math.round(fuelC))}</b></div>${fb}</aside>`;
  screen().appendChild(el); const act = el.querySelector('.td-act'); if(act) act.remove();
  el.querySelectorAll('[data-c2close]').forEach(b => b.onclick = () => el.remove());
  const k = e => { if(e.key === 'Escape'){ el.remove(); document.removeEventListener('keydown', k); } }; document.addEventListener('keydown', k);
}

/* ---------- Launch Day: the results page is the Day page ---------- */
const c2Res0 = R.results;
R.results = st => {
  c2Res0(st); if(!(c2Daily() && S.phase === 'setup')) return;
  c2DayPage({ d:1, keep:() => { if(c2X().fraCard && !c2X().fraCardShown){ c2FraCard(() => { c2X().pending = 1; UI.view = null; closeDay(); }); return; } UI.view = null; closeDay(); }, change:() => { c2X().pending = 1; UI.view = null; closeDay(); } });
};
/* ---------- week 1: each day lands on its Day page; Keep flies the next; Change my plan opens the timetable first ---------- */
const c2WR0 = R.weekRun;
R.weekRun = st => {
  const W = S.wk;
  if(ch1() && !UI.c1Speed) UI.c1Speed = c2Speed();   // weekSpeed's "(default)", every week of chapter one (v6.5: Fast)
  if(!(c2Daily() && W && W.from === 1)) return c2WR0(st);
  W.c1go = true;   // the plan check is gone in week 1: the Day page decided
  const X = c2X();
  if(X.fraCard && !X.fraCardShown && W.dayDone !== S.day){ c2FraCard(); return; }
  if(X.pending && W.dayDone !== S.day){ X.pending = 0; c2StartChange(); return; }
  if(W.dayDone === S.day){
    if(X.fraCard && !X.fraCardShown){ c2FraCard(); return; }
    if(c2DayOn(S.day) && !X.kept[S.day] && c2AutoKeep(S.day)){ if(X.fraCard && !X.fraCardShown){ c2FraCard(); return; } weekRunAdvance(); return; }   // less than dailyPauseGain to find: fly on
    if(c2DayOn(S.day) && !X.kept[S.day]){ if(UI.wkTimer){ clearTimeout(UI.wkTimer); UI.wkTimer = null; }
      c2DayPage({ d:S.day, keep:() => { if(c2X().fraCard && !c2X().fraCardShown){ render(); return; } weekRunAdvance(); }, change:() => c2StartChange() }); return; }
    if(c2DayOn(S.day) && X.kept[S.day]){ weekRunAdvance(); return; }
  }
  return c2WR0(st);
};
/* the timetable, then the Changes sheet, then back to fly tomorrow */
function c2StartChange(){
  if(S.rnd){ delete S.rnd.planWas; S.rnd.ashChg = {}; }
  UI.ashJust = null; UI.view = null;
  S.steps.splice(S.si, 0, { t:'plan' }, { t:'workings' });
  save(); render();
}

/* ---------- the Changes sheet: Finance's fare difference (once), the difference a day built, × 7 on paper ---------- */
const c2Room = () => { const X = c2X();
  if(!(S.day <= 7)) return typeof c1Room === 'function' ? c1Room() : true;
  const per = +WBS().dailyChangeCountedPerDay || 1, wk = +WBS().dailyChangeCountedWeek || 3, eve = X.chgEve || S.day, tot = Object.values(X.cnt).reduce((a, b) => a + b, 0);
  return (X.cnt[eve] || 0) < per && tot < wk; };
const c2ChgSpec0 = ashChangeSpec;
ashChangeSpec = function(ch, i, n){
  const sp = c2ChgSpec0.apply(this, arguments); if(!ch1() || !sp || !sp.sums || !sp.sums[0]) return sp;
  const X = c2X(), C = ashChgS()[ch.key] || (ashChgS()[ch.key] = {}), S1 = sp.sums[0], v = sp.v, r5 = ashRef(S1.tgt).r, rw = r5 + 1, rk = sp.rows.find(r => r.label === 'Worth keeping?'), d = S1.want, key = 'chg:' + ch.key;
  if(C.counted === undefined) C.counted = c2Room();
  const wkRow = sp.rows.find(r => r.r === rw); if(wkRow && ch.kind === 'fare') wkRow.label = C2('chg.weekrow').text[0] || 'Ticket revenue over a week (× 7)';
  const fareDemo = ch.kind === 'fare' && !X.chgDemo && !C.d4;
  // the cells: D4 waits for Finance's demonstration; the difference a day once built; over a week once worked out
  if(fareDemo) v.D4 = {};
  if(C.d5 || C.done) v['D' + r5] = { t:ashSigned(d, true), cls:d > 0 ? 'pos' : '' }; else delete v['D' + r5];
  if(C.done) v['D' + rw] = { t:ashSigned(d * 7, true), cls:d > 0 ? 'pos' : '', f:!C.counted, fin:!!C.shown }; else delete v['D' + rw];
  if(!C.done && rk) delete v['D' + rk.r];
  const sums = [];
  if(fareDemo) sums.push({ id:key + ':d4', kind:'chg:demo', tgt:'D4', refs:['C4', 'B4'], ops:['−'], words:'With your change − Now', how:'formula', needEnter:true, c2demo:true, commute:false, unit:'£', want:ch.f1 - ch.f0, done:false, built:false, recKey:null, no:null,
    wordsOf:ref => ({ B:'Now', C:'With your change' })[ashRef(ref).c] || ref, lineBuild:C2H(C2('chg.watch').text[0] || ''), answer:() => { X.chgDemo = S.day || 1; C.d4 = true; save(); return { ok:true }; } });
  const s5 = { id:key + ':d5', kind:S1.kind, tgt:S1.tgt, refs:S1.refs, ops:S1.ops, words:S1.words, how:'formula', needEnter:true, commute:false, unit:'£', want:d, done:!!(C.d5 || C.done), built:!!(C.d5 || C.done), recKey:null, no:null,
    wordsOf:S1.wordsOf, name:S1.name, orderWhy:S1.orderWhy, why:S1.why, co:S1.co, lineBuild:C2H(C2('chg.build').text[0] || ''), answer:() => { C.d5 = true; save(); return { ok:true }; } };
  sums.push(s5);
  if(C.counted){ const wk = d * 7, rk2 = 'chg7:' + ch.key, W2 = C2('chg.week', { n:'{n}', cell:'D' + rw }).text;
    sums.push({ id:key + ':wk', kind:'changes.week', tgt:'D' + rw, refs:['D' + r5, '7'], ops:['×'], lit:['D', r5, 'D', rw], words:C2('chg.weekf').text[0] || 'Difference a day × 7', how:'book', commute:false, unit:'£', want:wk, done:!!C.done, built:true, recKey:rk2,
      get no(){ return sumNo(rk2); }, title:W2[0] || 'Ticket revenue over a week: the difference', wordsOf:ref => ref === '7' ? '7 days' : 'Difference a day', name:'the difference over a week',
      recO:{ type:'calc', relKey:'multiplication', doc:`Is the change worth it? Over a week`, ask:'Difference a day × 7', question:`${ashSigned(d, true)} × 7`, unit:'£', correct:wk, correctText:ashSigned(wk, true), ops:[d, 7], op:'×', level:'Calculate' },
      answer:(raw, val, st) => {
        if(wk < 0 && Math.abs(val + wk) < 0.5 && !/^[−–-]/.test(String(raw).trim())) return { note:'The change brings in less, so the difference is below zero: type it with a minus (−). One more try.' };
        let e = null; try{ e = recOpen(rk2, sums[sums.length - 1].recO); }catch(x){}
        const ok = Math.abs(val - wk) < 0.5; try{ recAttempt(e, { ok, given:raw, value:val, method:'worked on paper, answer typed' }); }catch(x){}
        if(ok || ((st.tries || 0) + 1 >= 2 && twoTriesOn())){ C.done = true; if(!ok){ C.shown = true; try{ paperRecShown(rk2); }catch(x){} }
          const eve = X.chgEve || S.day; if(S.day <= 7) X.cnt[eve] = (X.cnt[eve] || 0) + 1;
          try{ const Wh = ch.kind === 'fare' ? { route:ch.route, what:ch.f1 > ch.f0 ? 'fare rise' : 'fare cut' } : ashChgWhat(ch); dsWorthKeep({ kind:ch.kind === 'fare' ? 'fare' : 'service', route:Wh.route, what:Wh.what, value:d }); }catch(x){}
          save(); return ok ? { ok:true } : { shown:true }; }
        return { note:ashWrong('×', [d, 7], val, wk, '£') }; },
      hints:() => [{ t:`A week is 7 days: ${ashSigned(d, true)} × 7.` }, { t:`Check: about ${money(ashRound(Math.abs(wk)))}.`, est:true }], how2:() => ashHowFor('×', Math.abs(d), 7, 'n', 'Over a week = the difference a day × 7') });
  } else if(C.d5 && !C.done){ C.done = true; v['D' + rw] = { t:ashSigned(d * 7, true), cls:d > 0 ? 'pos' : '', f:true }; }
  if(C.done && rk) v['D' + rk.r] = { t:d > 0 ? `✓ Yes, ${ashSigned(d, true)} a day` : `Not worth keeping: ${ashSigned(d, true)} a day`, cls:d > 0 ? 'pos' : '', wide:'B' };
  const J = UI.ashJust && UI.ashJust.sheet === sp.id ? sums.find(s => s.id === UI.ashJust.sum) : null, act = J ? null : sums.find(s => !s.done) || null;
  if(J){ J.val = ashSigned(J === s5 ? d : J.want, true); J.doneLine = J === s5 ? `The difference a day: <b class="${d > 0 ? 'pos' : ''}">${ashSigned(d, true)}</b>. The sheet worked it out.` : J.c2demo ? `The fare is ${ashSigned(ch.f1 - ch.f0, true)}: With your change − Now.` : (C.shown ? `Finance has filled this one in: ${ashSigned(J.want, true)}. Copy it into your book beside Sum ${J.no}.` : `Over a week: <b>${ashSigned(J.want, true)}</b> · Sum ${J.no} in your record`); }
  sp.sums = sums; sp.act = act; sp.just = J; sp.lw = Math.max(sp.lw || 0, 300);
  if(sp.tabs) sp.tabs = ashTabs('changes');   // again: Finance may have just finished this change (Before / after opens once all are done)
  // Changes sheet done once the week's difference is in: the base page's "done" reads C.done
  if(!act && !J) C.done = true;
  sp.doneF = !act && !J && C.done ? { tgt:'D' + rw, refs:C.counted ? ['D' + r5, '7'] : S1.refs, ops:C.counted ? ['×'] : S1.ops, words:C.counted ? (C2('chg.weekf').text[0] || 'Difference a day × 7') : S1.words, val:ashSigned(C.counted ? d * 7 : d, true) } : null;
  return sp;
};
/* the demonstration on the Changes sheet: the pointer clicks With your change, presses −, clicks Now, presses Enter */
function c2Demo(sp){
  if(UI.c2Demo === sp.id) return; UI.c2Demo = sp.id;
  const a = sp.act, steps = [{ ref:a.refs[0] }, { op:a.ops[0] }, { ref:a.refs[1] }, { enter:true }]; let i = 0;
  const tick = () => { const sp2 = ashLive(); if(!sp2 || sp2.id !== sp.id || !sp2.act || !sp2.act.c2demo){ UI.c2Demo = null; c1PtrGone(); return; }
    const s = steps[i], root = document.querySelector(`[data-ash="${CSS.escape(sp2.id)}"]`); if(!s || !root){ UI.c2Demo = null; c1PtrGone(); return; }
    const el = s.ref ? root.querySelector(`[data-ref="${s.ref}"]`) : s.op ? root.querySelector(`.c1-keys [data-ashop="${s.op}"]`) : root.querySelector('.c1-keys [data-c1kenter]');
    if(!el){ setTimeout(tick, 200); return; }
    c1PtrTo(el, () => { const sp3 = ashLive(); if(!sp3 || sp3.id !== sp.id){ UI.c2Demo = null; c1PtrGone(); return; } i++;
      if(s.ref) ashPick(sp3, s.ref); else if(s.op){ c1KeyFlash(s.op); ashOp(sp3, s.op); } else { c1KeyFlash('enter'); UI.c2Demo = null; setTimeout(c1PtrGone, 400); c1Enter(sp3); return; }
      setTimeout(tick, settings.reduceMotion ? 350 : 250); }); };
  setTimeout(tick, 500);
}
const c2ChgPage0 = ashChangesPage;
ashChangesPage = function(st, CH){
  c2ChgPage0.apply(this, arguments); if(!ch1()) return;
  const sp = ashLive(); if(!sp) return;
  if(sp.act && sp.act.c2demo){ const root = screen().querySelector('.ash'); if(root) root.classList.add('c1-demo');
    const sig = screen().querySelector('[data-c1sig]'); if(sig){ const tmp = document.createElement('div'); tmp.innerHTML = c1SignalHtml({ kind:'build', tag:'EXAMPLE · WATCH', title:'Finance works out the fare difference', lines:[C2H(C2('chg.watch').text[0] || '')], nothing:false, ptr:sig.classList.contains('ptr-up') ? 'up' : 'left' });
      const nw = tmp.firstElementChild; nw.style.cssText = sig.style.cssText; sig.replaceWith(nw); }
    c2Demo(sp); }
  // week 1: the last change goes straight on to fly tomorrow
  const go = document.getElementById('ashChgGo'), last = !CH.slice(CH.indexOf(sp.ch || CH[0]) + 1).some(c => !ashChgDone(c));
  if(go && S.day <= 7 && c2Daily() && /^Next(?! change)/.test(go.textContent.trim()) && last) go.innerHTML = `${c2Btn(C2('chg.fly').text[0] || 'Fly tomorrow')} &#9654;`;
  // going on passes every change already worked out (two changes, the second filled by Finance: the button could only pass the first, round and round)
  if(go){ const h0 = go.onclick; go.onclick = e => { const S0 = ashChgS(); CH.forEach(c => { const x = S0[c.key]; if(x && x.done){ x.seen = true; x.passed = true; } }); return h0 ? h0.call(go, e) : undefined; }; }
};

/* ---------- after the Changes sheet: week 1 flies tomorrow; weeks 2-4 see the comparison (no sums) ---------- */
const c2Work0 = R.workings;
R.workings = st => {
  if(UI.ashTab === 'cmp') UI.ashTab = null;   // the comparison's own tab: stay on it
  if(!(ch1() && typeof ashOn === 'function' && ashOn() && S.phase !== 'setup' && !UI.ashTab)) return c2Work0(st);
  const CH = ashChanges(); if(!CH.length || CH.some(c => !ashChgDone(c))) return c2Work0(st);
  if(S.day <= 7 && c2Daily()){ finishSums(); return; }
  if(weekNo(S.day) <= 4 && weekPhaseOf(S.round) === 'plan'){ c2Compare(st); return; }
  return c2Work0(st);
};
function c2Compare(st){
  const n = weekNo(S.day), pl = normPlan(currentPlan()), L = planLines(pl), from = S.day - 7;
  const lw = (S.history || []).filter(h => h.from === h.to && h.from >= from && h.from < from + 5), ln = lw.length || 1;   // last week's weekdays, a day on average
  const avg = k => lw.reduce((t, h) => t + (h[k] || 0), 0) / ln, fuelLw = lw.reduce((t, h) => t + (h.fuelCost || 0), 0) / ln;
  const lwPax = Math.round(avg('pax')), lwRev = Math.round(avg('revenue')), lwCost = Math.round(avg('costs')), lwProf = Math.round(avg('profit'));
  let litres = 0; try{ litres = Math.round(plannedLitres(pl)); }catch(e){}
  const pNow = fuelPrice(), pLw = lw.length ? (lw[lw.length - 1].fuelPrice || pNow) : pNow, fuelNow = Math.round(litres * pNow), fuelL = Math.round(fuelLw || litres * pLw);
  const now = { pax:Math.round(L.pax || 0), rev:Math.round(L.v.rev), cost:Math.round(L.v.cost), prof:Math.round(L.v.profit) };
  // differences coloured by meaning: up is good for revenue and profit, bad for total costs; passengers and fuel stay plain (the fuel row's note explains it)
  const dc = (a, b, good, isMoney) => { const x = Math.round(b - a); return { t:x ? (x > 0 ? '+' : '−') + (isMoney ? money(Math.abs(x)) : num(Math.abs(x))) : '—', f:true, cls:x === 0 || good === null ? '' : (x > 0) === good ? 'pos' : 'amb' }; };
  const RW = C2('cmp.rows').text, CL = C2('cmp.cols', { n, last:n - 1 }).text, lab = (k, d) => RW[k] || d;
  const rows = [{ r:1, t:'hdr' }, { r:2, label:lab(0, 'Passengers a day'), ic:'person' }, { r:3, label:lab(1, 'Ticket revenue a day'), ic:'coins', gold:true }, { r:4, label:lab(2, 'Fuel burned a day'), ic:'drum', note:`${num(litres)} L · ${priceL(pLw)} → ${priceL(pNow)}` }, { r:5, label:lab(3, 'Total costs a day'), ic:'receipt', t:'tot', gold:true }, { r:6, label:lab(4, 'Profit a day'), ic:'chart', t:'fin', gold:true }];
  // last week is what happened (no ƒ); this week and the difference are Finance's from the plan (ƒ)
  const v = { B2:{ t:num(lwPax) }, C2:{ t:num(now.pax), f:true }, D2:dc(lwPax, now.pax, null, false), B3:{ t:money(lwRev) }, C3:{ t:money(now.rev), f:true }, D3:dc(lwRev, now.rev, true, true),
    B4:{ t:money(fuelL) }, C4:{ t:money(fuelNow), f:true }, D4:dc(fuelL, fuelNow, null, true), B5:{ t:money(lwCost) }, C5:{ t:money(now.cost), f:true }, D5:dc(lwCost, now.cost, false, true),
    B6:{ t:money(lwProf) }, C6:{ t:money(now.prof), f:true, cls:now.prof < 0 ? 'amb' : '' }, D6:dc(lwProf, now.prof, true, true) };
  const diff = now.prof - lwProf, dTxt = `${money(Math.abs(diff))} ${diff >= 0 ? 'more' : 'less'}`;
  const line = `<span class="pos">✓</span> ${C2H(C2('cmp.line', { diff:dTxt }).text[0] || `Finance filled in this week from your plan. Profit a day: **${dTxt}** than last week.`)}`;
  const tabs = ashTabs('cmp'), wi = tabs.findIndex(t => t.id === 'week'); tabs.splice(wi + 1, 0, { id:'cmp', label:C2('cmp.tab', { n }).text[0] || `Week ${n}`, ic:'cal', on:true, off:false });
  const sp = { id:'cmp:' + n, crumb:`${S.airline.name || 'Airline'} HQ · Work out my plan`, title:C2('cmp.title', { n }).text[0] || `Week ${n} plan: what changed from last week`, tabs, lw:330,
    cols:[{ c:'B', w:200, top:CL[0] || `Week ${n - 1}, a weekday`, main:CL[1] || 'Last week' }, { c:'C', w:200, top:CL[2] || `Week ${n} plan`, main:CL[3] || 'This week', plan:true }, { c:'D', w:200, top:CL[4] || 'this week − last week', main:CL[5] || 'Difference' }], rows, v, sums:[], act:null, just:null, doneLine:line, doneF:null };
  screen().innerHTML = shell(`<div class="dp ash-page c2-cmp">${ashHtml(sp)}</div>`, deskBar(C2('cmp.footer', { n }).text[0] || `Week ${n} plan · Finance compared it with last week.`, backBtn() + `<button class="bv-btn go big" id="c2CmpGo">Ready to fly &#9654;</button>`));
  ashBind(sp); on('c2CmpGo', () => { UI.ashJust = null; finishSums(); });
}

/* ---------- Frankfurt, the third destination (Settings thirdRoute…; D111) ---------- */
const c2Fra = () => String(WBS().thirdRouteId || '').trim();
/* the near-optimum day: profit at least 85% of the best plan for his planes and routes that day, every flight covering its own
   costs, seats at least 80% filled (Settings thirdRouteRule) */
function c2NearOptimum(d, h, fl){
  const rule = String(WBS().thirdRouteRule || ''); if(!rule) return false;
  if(!fl.length || fl.some(f => c2FlProfit(f) < 0)) return false;
  if(!h.seats || h.pax / h.seats < 0.8) return false;
  if(rule === 'successfulDay') return (h.profit || 0) > 0;
  const X = c2X(); let bp = X.bestPl;
  if(!bp){ try{ bp = X.bestPl = bestPlanSweep(S.wk ? S.wk.from : 1).plan; }catch(e){ return false; } }
  let best = 0; try{ best = dryRun(() => withDay(d, () => withBeat(beatAt(d), () => { S.day = d; return planLines(bp).v.profit; }))); }catch(e){ return false; }
  return best > 0 && (h.profit || 0) >= 0.85 * best;
}
function c2Earn(d, h, fl){
  const id = c2Fra(), X = c2X(), r = id && routeById(id); if(!r || X.fra || !c2Daily()) return;
  const early = +WBS().thirdRouteEarliest || 2; if(d + 1 < early || d >= 7) return;
  if((r.openDay || 1) <= d + 1) return;   // already open
  if(c2NearOptimum(d, h, fl)){ X.fra = d + 1; X.fraCard = true; X.fraCardShown = false; }
}
/* the route opens the morning after it is earned */
const c2Open0 = routeOpen;
routeOpen = function(r, day){ const v = c2Open0.apply(this, arguments); if(v || !r || !S || !S.c1 || !S.c1.c2) return v;
  const X = S.c1.c2, d = day === undefined ? S.day : day; return !!(X.fra && r.id === c2Fra() && d >= X.fra - 1 && typeof ch1 === 'function' && ch1()); };   // planned the evening before it opens
window.__c2tray = () => { const X = S && S.c1 && S.c1.c2, id = c2Fra(); return X && X.fra && id && routeOpen(routeById(id)) ? [id] : []; };
function c2FraCard(go){
  const X = c2X(), r = routeById(c2Fra()), d = X.fra, c = calDate(d), dw = `${dayName(d)} ${c.getUTCDate()} ${MONTH[c.getUTCMonth()]}`;
  const fl = (S.rnd.flights || []).filter(f => !f.grounded).sort((a, b) => a.dep - b.dep);
  const board = fl.map(f => `<div class="c2-fl"><span class="mono">${fmtTime(f.dep)}</span><span>${esc(routeById(f.route).city.toUpperCase())}</span><span class="ok">ON TIME</span></div>`).join('')
    + `<div class="c2-fl new"><span class="mono">--:--</span><span>${esc(C2('fra.board', { city:r.city.toUpperCase() }).text[0] || `${r.city.toUpperCase()} · NEW · FROM TOMORROW`)}</span></div>`;
  const line = String(WBS().thirdRouteCard || '').split(/\s+[—-]\s+/)[0] ? (C2('fra.line').text[0] || '') : (C2('fra.line').text[0] || '');
  const body = `<div class="c2-card"><div class="c2-board">${board}</div><div class="c2-cb"><span class="c2-eye">${esc(C2('fra.eyebrow').text[0] || 'NEW ROUTE · TOMORROW')}</span><h2>${flagSvg(r.flag, 22)} ${esc(C2('fra.title', { city:r.city }).text[0] || `${r.city} opens tomorrow`)}</h2><p>${esc(line)}</p>
    <div class="c2-ca"><button class="bv-btn primary big" id="c2FraGo">${c2Btn(C2('fra.go').text[0] || 'Plan tomorrow')} &#9654;</button></div></div></div>`;
  screen().innerHTML = shell(deskPage({ cls:'c1a c2-fra', title:'', sub:'', body }), deskBar(esc(C2('fra.footer', { date:dw }).text[0] || `A new route opens tomorrow: ${dw}.`), ''));
  on('c2FraGo', () => { X.fraCardShown = true; if(go){ X.chgEve = S.day; save(); go(); return; } const done = S.wk && S.wk.dayDone === S.day; if(done) X.kept[S.day] = true; X.chgEve = done ? S.day : S.day - 1; save(); c2StartChange(); });
}


/* ---------- 4 · Next sum beside the answer; the footer only leaves the page (every chapter-one sheet) ----------
   When an answer is right, the line under the sheet turns green with a small Next sum ▸ at its end, and the focus moves on
   by itself after about 1.5 s. The footer's right-hand button names the page's way out (Ready to fly ▶, Fly tomorrow ▶) and
   stays dimmed until the last sum is done; it never says Next sum. */
const c2Leave = () => c2Btn(S.phase !== 'setup' && S.day <= 7 && c2Daily() ? (C2('chg.fly').text[0] || 'Fly tomorrow') : 'Ready to fly');
function c2NextSum(sp){
  const root = document.querySelector(`[data-ash="${CSS.escape(sp.id)}"]`); if(!root) return;
  const foot = document.querySelector('.actbar #ashNext'), chg = document.querySelector('.actbar #ashChgGo'), more = (sp.sums || []).some(s => !s.done);
  if(foot){ foot.removeAttribute('id'); foot.disabled = true; foot.innerHTML = `${c2Leave()} &#9654;`; foot.classList.remove('primary'); }
  if(!sp.just) return;
  let go = null;
  if(foot) go = () => ashNextSum();
  else if(chg && more){ go = () => ashNextSum(); chg.id = 'c2ChgGo'; chg.disabled = true; chg.innerHTML = `${c2Leave()} &#9654;`; }   // the footer only leaves; Next sum stays on this change (a disabled footer can't be clicked for it)
  if(!go) return;
  const line = root.querySelector('.ash-line'); if(line && !line.querySelector('.c2-nsum')){ line.insertAdjacentHTML('beforeend', `<button class="c2-nsum" id="ashNext">${esc(C2('sum.next').text[0] || 'Next sum ▸')}</button>`); }
  const b = document.getElementById('ashNext'); if(b) b.onclick = e => { e.stopPropagation(); go(); };
  const J = UI.ashJust; clearTimeout(UI.c2Auto); UI.c2Auto = setTimeout(() => { if(UI.ashJust === J && document.getElementById('ashNext')) go(); }, 1500);
}
/* ---------- 5 · seven reference colours, in click order, repeating after seven (outline, tag and its name in the bar) ---------- */
const C2_REF = ['var(--cyan)', 'var(--ref-2)', 'var(--ref-3)', 'var(--ref-4)', 'var(--ref-5)', 'var(--ref-6)', 'var(--ref-7)'];
function c2Colours(sp){
  const root = document.querySelector(`[data-ash="${CSS.escape(sp.id)}"]`); if(!root || !sp.act) return;
  const st = ashSt(sp.id), refs = (ashBuilding(sp.act) ? st.tokens : ashFullTokens(sp.act)).filter(t => t.ref && !/^SUM\(/.test(t.ref)).map(t => t.ref);
  refs.forEach((ref, i) => { const c = root.querySelector(`.ash-c[data-ref="${ref}"]`); if(c){ c.classList.add('aref', 'c2-ref'); c.style.setProperty('--refc', C2_REF[i % 7]); if(refs.length > 2 && !c.getAttribute('data-tag')) c.setAttribute('data-tag', ''); } });
  root.querySelectorAll('.ash-f b').forEach((b, i) => { if(i < refs.length && !/^\d+$/.test(b.textContent.trim())){ b.classList.add('c2-rb'); b.style.setProperty('--refc', C2_REF[i % 7]); } });
}
const c2Bind0 = ashBind;
ashBind = function(sp){ const r = c2Bind0.apply(this, arguments); try{ if(typeof ch1 === 'function' && ch1() && sp){ c2NextSum(sp); c2Colours(sp); } }catch(e){ console.error(e); } return r; };


/* ---------- 4 · Launch Day: once Paris and his plan fill in, Finance builds the profit with the pointer (a watch, not counted) ---------- */
const c2LdSpec0 = ashLaunchSpec;
ashLaunchSpec = function(){
  const sp = c2LdSpec0.apply(this, arguments);
  try{ if(!ch1() || !S || S.phase !== 'setup' || !sp || !sp.c1 || sp.c1.stage !== 'done') return sp;
    const X = c1Ld(); if(X.pdemo) return sp;
    const P = sp.cols[sp.cols.length - 1].c, L = (() => { try{ return planLines(currentPlan()); }catch(e){ return null; } })(), want = L ? L.profit : 0;
    const s = { id:'ld:profit', kind:'ld:profit', tgt:P + '9', refs:[P + '5', P + '8'], ops:['−'], words:'Total revenue − Total costs', how:'formula', needEnter:true, c2demo:true, commute:false, unit:'£', want, done:false, built:false, recKey:null, no:null,
      wordsOf:ref => /5$/.test(ref) ? 'Total revenue' : 'Total costs', lineBuild:C2H(C2('ld.profit.watch').text[0] || ''), answer:() => { X.pdemo = S.day || 1; save(); return { ok:true }; } };
    sp.v[P + '9'] = {}; sp.sums = (sp.sums || []).concat([s]); sp.act = s; sp.just = null; sp.doneLine = ''; sp.c1.stage = 'pdemo'; }catch(e){ console.error(e); }
  return sp;
};
const c2LdPage0 = ashLaunchPage;
ashLaunchPage = function(st){
  const r = c2LdPage0.apply(this, arguments);
  try{ const sp = ashLive(); if(ch1() && sp && sp.c1 && sp.c1.stage === 'pdemo' && sp.act && sp.act.c2demo){
    const hint = screen().querySelector('.actbar .ab-hint, .actbar p'); if(hint) hint.textContent = C2('ld.profit.footer').text[0] || 'Launch Day · watch Finance work out the profit.';
    const root = screen().querySelector('.ash'); if(root) root.classList.add('c1-demo');
    const sig = screen().querySelector('[data-c1sig]'); if(sig) sig.remove();
    c2Demo(sp); } }catch(e){ console.error(e); }
  return r;
};
if(window.__tkSums) window.__tkSums.unshift({ what:"Finance's profit on Launch Day", test:() => { const sp = ashLive(); return !!(sp && sp.act && sp.act.id === 'ld:profit'); }, plan:() => ({ at:'.c1-keys', value:'skip the demonstration', go:() => { const sp = ashLive(); UI.c2Demo = null; c1PtrGone(); if(sp && sp.act){ const s = ashSt(sp.id); s.tokens = ashFullTokens(sp.act); s.ready = true; c1Enter(sp); } } }) });


/* ---------- 5 · week 1 Sunday (hand-off 2a, section 5, as changed on 31 Oct evening): add each day, then Σ SUM, side by side.
   One sheet panel, one formula bar, two spreadsheets: left 1 · Add each day, right 2 · Use Σ SUM. Five stages:
     ex1   Finance adds Monday to Wednesday on the left example, clicking each day with + between them; the right is a dashed
           "Next: a quicker way" box;
     add   the left sheet lengthens into his week: he clicks each day with +, then Enter;
     ex2   his total shows (the left dims to .45); the right appears as Finance's example and Finance shows Σ SUM;
     sum   the right sheet lengthens into his week: he drags Monday to Sunday with Σ SUM, then Enter;
     mean  both totals show, the same; Average a day on the right sheet, then Plan week 2 ▶.
   All four totals are formula-only (built, not counted). The stages reuse the ladder's "show" week (click, then Σ SUM, then the
   average): week 1 is that week now, and from week 2 Σ SUM by dragging (Settings spreadsheetLadder). ---------- */
const c2Lad0 = c1LadderWeeks;
c1LadderWeeks = function(){ const s = String(WBS().spreadsheetLadder || ''); if(ch1() && /week 1:[^;]*Σ SUM/.test(s)) return { show:1, drag:2 }; return c2Lad0.apply(this, arguments); };
const c2Wk1 = W => !!(W && typeof ch1 === 'function' && ch1() && weekNo(W.from) === 1 && /week 1:[^;]*Σ SUM/.test(String(WBS().spreadsheetLadder || '')));
function c2Stage(W){ if(!c2Wk1(W)) return null; const X = c1Ex(), tot = rbState(W, 'tot');
  if(!X.exDone) return 'ex1';
  if(!W.c1sum) return tot.ok ? 'ex2' : 'add';
  return W.c1sum === 'try' && !tot.ok ? 'sum' : 'mean'; }
window.__c2stage = () => { try{ return c2Stage(S.wk); }catch(e){ return null; } };   // for the tests
const c2Narrow = sp => { sp.lw = 172; if(sp.cols && sp.cols[0]) sp.cols[0].w = 140; sp.rh = { hdr:34, data:24, tot:25, fin:26, sub:24, gap:6 }; return sp; };   // two 380-wide sheets in one panel
/* Finance's example shows twice: adding each day (ex1), then Σ SUM (ex2) */
const c2ExNow0 = c1ExNow;
c1ExNow = function(X, W){ const g = c2Stage(W || S.wk); if(g) return g === 'ex1' || g === 'ex2'; return c2ExNow0.apply(this, arguments); };
/* the words of each stage, from ScreenText (wk1.*); the review's own rows are used where a stage keeps them */
const C2_WK1 = { ex1:{ 'review.example.watch':'wk1.add.watch', 'review.example.done':'wk1.add.done', 'review.example.line':'wk1.add.line', 'review.example.lineDone':'wk1.add.lineDone' },
  add:{ 'review.total.signal':'wk1.add.signal' }, ex2:{ 'review.example.watch':'wk1.sum.watch' }, sum:{ 'review.sum.signal':'wk1.sum.signal' }, mean:{ 'review.sum.done':'wk1.sum.same' } };
const c2T0 = c1T;
c1T = function(id, vars){ try{ const g = S && S.wk && c2Stage(S.wk), to = g && C2_WK1[g] && C2_WK1[g][id]; if(to){ const t = h21Text(to, vars); if(t.title || t.text.length || t.eyebrow) return t; } }catch(e){}
  return c2T0.apply(this, arguments); };
if(typeof H21_TEXT !== 'undefined') Object.assign(H21_TEXT, {   // for a workbook without the rows (merge_wk1_sunday.py adds them)
  'wk1.method':{ text:['Add each day', 'Use Σ SUM'] }, 'wk1.next':{ title:'Next: a quicker way', text:['When your whole week is added up, Finance shows you a faster way to do it.'] },
  'wk1.add.watch':{ eyebrow:'EXAMPLE · WATCH', title:'Watch: add up the profit from Monday to Wednesday', text:["Finance clicks Monday's profit, presses **+**, clicks Tuesday's, presses **+**, clicks Wednesday's, then presses [Enter]."] },
  'wk1.add.done':{ eyebrow:'EXAMPLE · WATCH', title:"That's how adding each day works", text:["Click each day's profit and press **+** between them, then press [Enter]: the sheet adds them up.", '**Your turn: the profit for the whole week, Monday to Sunday.**'], button:'My turn ▶' },
  'wk1.add.line':{ text:['Watch: Finance clicks each day, with + between them.'] }, 'wk1.add.lineDone':{ text:['✓ Monday to Wednesday: {total}. The sheet added them up.'] },
  'wk1.add.signal':{ title:'Your turn: add up the profit for the whole week, Monday to Sunday', text:["Click each day's profit and press **+** between them. Click Sunday's, then press [Enter]."] },
  'wk1.add.count':{ text:['{first} to {upto} so far. Keep going to {last}.'] },
  'wk1.add.total':{ text:['✓ The whole week: **{total}**. Seven clicks, six + signs.'] }, 'wk1.add.same':{ text:['✓ Adding each day: **{total}**'] },
  'wk1.sum.watch':{ eyebrow:'EXAMPLE · WATCH', title:'Watch: a quicker way to add up Monday to Wednesday', text:['Finance presses **Σ SUM**, drags down the Profit column from Monday to Wednesday, then presses [Enter]. One drag, no + signs.'] },
  'wk1.sum.signal':{ title:'Your turn: the whole week with Σ SUM', text:['Press **Σ SUM**, drag down your Profit column from Monday to Sunday, then press [Enter].'] },
  'wk1.sum.same':{ text:['✓ Σ SUM: **{total}**. The same answer, in one drag.'] }, 'wk1.yours':{ text:['YOUR WEEK'] } });
const c2RvSpec0 = c1ReviewSpec;
c1ReviewSpec = function(W){ const sp = c2RvSpec0.apply(this, arguments);
  // a formula sum with no line of its own (Average a day) said "work it out in your book": the sheet works it out (ScreenText review.average.card)
  if(ch1()) (sp.sums || []).forEach(s => { if(s.how === 'formula' && !s.lineBuild && !s.sumKey) s.lineBuild = C2H(C2('review.average.card').text[0] || 'Click the two cells. The sheet works it out.'); });
  if(!c2Wk1(W)) return sp; c2Narrow(sp);
  // adding each day: the line under the sheet counts the days clicked so far ("Monday to Thursday so far. Keep going to Sunday.")
  const s = sp.sums[0], base = s && s.lineBuild;
  // adding each day: the left sheet is the days and Profit this week only (Days flown and Average a day come on the right sheet)
  if(s && c2Stage(W) === 'add'){ const rT = +String(s.tgt).slice(1); sp.rows = sp.rows.filter(x => x.t === 'hdr' || x.r <= rT); Object.keys(sp.v).forEach(k => { if(+k.slice(1) > rT) delete sp.v[k]; }); sp.sums = [s]; sp.act = s.done ? null : s; }
  if(s && c2Stage(W) === 'add') Object.defineProperty(s, 'lineBuild', { configurable:true, get(){ const st = ashSt(sp.id), refs = (st.tokens || []).filter(t => t.ref).map(t => t.ref);
    if(!refs.length || refs.length >= s.refs.length) return base; const day = ref => C1_WD(W.from + s.refs.indexOf(ref));
    return esc(C2('wk1.add.count', { first:day(s.refs[0]), upto:day(refs[refs.length - 1]), last:day(s.refs[s.refs.length - 1]) }).text[0] || base); } });
  return sp; };
const c2ExSpec0 = c1ExampleSpec;
c1ExampleSpec = function(W){ const sp = c2ExSpec0.apply(this, arguments); if(!c2Wk1(W)) return sp; c2Narrow(sp);
  const s = sp.sums[0], d0 = 'Monday', dL = 'Wednesday', tr = sp.rows.find(r => r.t === 'tot'); if(tr) tr.label = String(tr.label).replace(/^Profit\s+/, '');   // "Mon to Wed" (the column already says Profit)
  if(c2Stage(W) !== 'ex2'){ s.words = sp.rows.filter(r => r.ic === 'cal').map(r => String(r.label).split(' ')[0]).join(' + '); return sp; }   // ex1: Finance clicks each day, "Mon + Tue + Wed"
  // ex2: the same example, with Σ SUM, on a sheet of its own (its own state)
  sp.id = 'week:ex2:' + weekNo(W.from); s.id = 'ex2:' + weekNo(W.from) + ':tot';
  if(sp.doneF){ const R = s.refs; sp.doneF.refs = [`SUM(${R[0]}:${R[R.length - 1]})`]; sp.doneF.ops = []; }   // what Finance typed: Σ SUM, not the cells one by one
  Object.assign(s, { sumKey:true, sumOnly:true, words:'', barWords:'', sumWords:`add ${d0} to ${dL}`, sumWhy:() => `Finance drags from ${d0} to ${dL}.`, sumLine:() => esc(C2('review.example.line').text[0] || '') });
  return sp; };
/* Finance's demonstrations: ex1 clicks Mon, +, Tue, +, Wed, Enter (the original run); ex2 presses Σ SUM, drags B2 to B4, presses Enter */
const c2ExRun0 = c1ExampleRun;
c1ExampleRun = function(){
  if(!c2Wk1(S.wk)) return c2ExRun0.apply(this, arguments);
  const X = c1Ex();
  if(c2Stage(S.wk) === 'ex1'){ if(!UI.c2Ex1){ UI.c2Ex1 = true; delete X.exRun; }   // a "running" flag kept in an older save
    const tk = window.__tkRunning && window.__tkRunning(), rm = settings.reduceMotion; if(tk) settings.reduceMotion = true;   // the teacher's Run: straight to the end
    try{ return c2ExRun0.apply(this, arguments); } finally { settings.reduceMotion = rm; } }
  // "running" lives in UI, not the save: a page reloaded mid-demonstration starts it again
  if(UI.c2ExRun || X.exAdded) return; const sp0 = ashLive(); if(!sp0 || !sp0.example || !sp0.act) return; UI.c2ExRun = true; delete X.exRun;
  const refs = sp0.act.refs, a = refs[0], z = refs[refs.length - 1], live = () => { const sp = ashLive(); return sp && sp.example && sp.act ? sp : null; };
  const cur = () => document.getElementById('c1Cursor'), to = el => { const c = cur(); if(el && c){ const R = el.getBoundingClientRect(); c.style.left = (R.left + R.width * .6) + 'px'; c.style.top = (R.top + R.height / 2) + 'px'; } };
  const root = () => { const sp = live(); return sp && document.querySelector(`[data-ash="${CSS.escape(sp.id)}"]`); };
  const enter = () => { const sp = live(); if(!sp){ UI.c2ExRun = false; return; } const st = ashSt(sp.id); st.drag = false; ashSumEnter(sp); UI.c2ExRun = false; };
  // reduced motion, or the teacher's Run: straight to the end
  if(settings.reduceMotion || (window.__tkRunning && window.__tkRunning())){ const sp = live(); ashOp(sp, 'sum'); const st = ashSt(sp.id); st.sumA = a; st.sumB = z; enter(); return; }
  const steps = [() => { to(document.querySelector('.ash-ops [data-ashop="sum"]')); setTimeout(() => { const sp = live(); if(sp) ashOp(sp, 'sum'); next(); }, 600); },
    () => { const r = root(); to(r && r.querySelector(`[data-ref="${a}"]`)); setTimeout(() => { const sp = live(); if(!sp){ UI.c2ExRun = false; return; } const st = ashSt(sp.id); st.sumA = a; st.sumB = a; st.drag = true; ashSumPaint(sp, root(), st); next(); }, 600); },
    () => { const r = root(); to(r && r.querySelector(`[data-ref="${z}"]`)); setTimeout(() => { const sp = live(); if(!sp){ UI.c2ExRun = false; return; } const st = ashSt(sp.id); st.sumB = z; ashSumPaint(sp, root(), st); next(); }, 900); },
    () => { const sp = live(); if(!sp){ UI.c2ExRun = false; return; } const st = ashSt(sp.id); st.drag = false; render(); setTimeout(() => { to(document.querySelector('.c1-fbenter')); setTimeout(enter, 700); }, 300); }];
  let i = 0; const next = () => { const f = steps[i++]; if(f) setTimeout(f, 250); };
  setTimeout(next, 600);
};
/* My turn: after ex1 his week on the left; after ex2 his week again on the right, this time with Σ SUM (the total starts afresh) */
const c2RvBind0 = c1ReviewBind;
c1ReviewBind = function(sp, W, exOn){ c2RvBind0.apply(this, arguments); const g = c2Stage(W); if(!g) return;
  if(g === 'ex1') on('c1MyTurn', () => { const X = c1Ex(); X.exDone = S.day || 1; delete X.exAdded; delete X.exRun; UI.c2Grow = 'add'; save(); render(); });
  if(g === 'ex2') on('c1MyTurn', () => { const X = c1Ex(); X.ex2Done = S.day || 1; delete X.exAdded; W.c1sum = 'try'; const t = rbState(W, 'tot'); t.ok = false; t.built = false; t.sumText = null; W.c1glow = null;
    try{ ashReset(ashSt('week:' + weekNo(W.from)), null); }catch(e){} UI.c2Grow = 'sum'; save(); render(); }); };
/* the panel: the sheet being worked is live; the other side is the dashed "Next" box, or his week added day by day */
const c2RvR0 = ashReviewRender;
ashReviewRender = function(st){ const r = c2RvR0.apply(this, arguments); try{ if(c2Wk1(S.wk) && c1RvOn(S.wk)) c2Pair(); }catch(e){ console.error(e); } return r; };
function c2Pair(){
  const W = S.wk, g = c2Stage(W), body = screen().querySelector('.c1-rv'), mid = body && body.querySelector('.rv2-mid'); if(!mid || !g) return;
  body.classList.add('c2-paired');
  const right = !['ex1', 'add'].includes(g), yours = esc(C2('wk1.yours').text[0] || 'YOUR WEEK'), method = C2('wk1.method').text;
  let other = '', rTot = 0;
  if(!right){ const N = C2('wk1.next'); other = `<div class="c2-side c2-next"><div class="c2-nextb"><b>${esc(N.title || 'Next: a quicker way')}</b><span>${esc(N.text[0] || '')}</span></div></div>`; }
  else { const h = weekSummary(W), items = weekReviewItems(W, h); items.forEach(it => { it.title = RV2_TITLE[it.id] || it.title; });
    const sp = c2RvSpec0(W, items, h); c2Narrow(sp); const tr = sp.rows.find(x => x.t === 'tot'); rTot = tr ? tr.r : 9;
    const total = Math.round(rbValue(items.find(x => x.id === 'tot')));
    sp.rows = sp.rows.filter(x => x.t === 'hdr' || x.r <= rTot); Object.keys(sp.v).forEach(k => { if(+k.slice(1) > rTot) delete sp.v[k]; }); sp.v['B' + rTot] = { t:money(total) };
    Object.assign(sp, { sums:[], act:null, offer:false, just:null, doneF:null, id:'week:pairL', doneLine:C2H(C2(g === 'mean' ? 'wk1.add.same' : 'wk1.add.total', { total:money(total) }).text[0] || '') });
    other = `<div class="c2-side c2-nobar c2-left ${g === 'mean' ? '' : 'c2-dim'}"><span class="c2-lab">${yours}</span><div class="c2-mine">${ashHtml(sp)}</div></div>`; }
  const pair = document.createElement('div'); pair.className = 'c2-pair';
  const mine = document.createElement('div'); mine.className = 'c2-side c2-live'; let into = mine;
  if(!['ex1', 'ex2'].includes(g)){ mine.insertAdjacentHTML('beforeend', `<span class="c2-lab">${yours}</span>`); into = document.createElement('div'); into.className = 'c2-mine'; mine.appendChild(into); }   // his week in its own frame; the example keeps its dashed one
  while(mid.firstChild) into.appendChild(mid.firstChild);
  if(right){ pair.insertAdjacentHTML('beforeend', other); pair.appendChild(mine); } else { pair.appendChild(mine); pair.insertAdjacentHTML('beforeend', other); }
  mid.appendChild(pair);
  const sides = [...pair.children].filter(x => x.classList.contains('c2-side')); sides.forEach((x, i) => x.classList.add(i ? 'c2-R' : 'c2-L'));
  // the method, numbered, in each sheet's top-left header cell
  sides.forEach((x, i) => { const a1 = x.querySelector('.ash-c.ah.al'); if(a1) a1.innerHTML = `<span class="c2-meth"><i>${i + 1}</i>${esc(method[i] || '')}</span>`; });
  const lab = mid.querySelector('.c1-exl'); if(lab) lab.textContent = C2('wk1.example').text[0] || lab.textContent;
  if(rTot){ const c = pair.querySelector(`.c2-left .ash-c[data-ref="B${rTot}"]`); if(c) c.classList.add('c2-okg'); }   // his first total, added day by day
  if(UI.c2Grow && UI.c2Grow === g && !settings.reduceMotion){ mine.classList.add('c2-grow'); } if(UI.c2Grow === g) UI.c2Grow = null;   // the sheet lengthens into his week
  setTimeout(() => { const nw = screen().querySelector('.dp-body > .cu-nw'), what = screen().querySelector('.c2-paired .rv2-what'); if(nw && what) what.appendChild(nw); }, 0);   // the fuel line goes under What happened
  // the signal and the done callouts run under the sheets; the signal's words sit in one column, its button at the right
  screen().querySelectorAll('.c2-paired .rv2-ins > .c1-sig .c1-sig-b').forEach(b => { if(b.querySelector(':scope > .c2-sigtx')) return;
    const tx = document.createElement('div'); tx.className = 'c2-sigtx'; [...b.children].filter(c => !c.matches('.c1-sig-tag, button, .c1-sig-a')).forEach(c => tx.appendChild(c));
    const tag = b.querySelector(':scope > .c1-sig-tag'); if(tag) tag.after(tx); else b.prepend(tx); });
  screen().querySelectorAll('.c1-ins > *').forEach(el => { el.style.position = 'static'; el.style.left = ''; el.style.top = ''; });
}

/* ---------- 7 · Ready for launch names its own button ---------- */
const c2Ready0 = R.ready;
R.ready = st => { const r = c2Ready0.apply(this, arguments);
  try{ if(ch1()){ const b = document.getElementById('startOps'), p = b && [...screen().querySelectorAll('.tf-todo, p')].find(x => /Press .+ when it is right/i.test(x.textContent));
    if(b && p){ const name = b.textContent.trim().toLowerCase().replace(/(^|\s)\S/g, m => m.toUpperCase()).replace(/\bTo\b/, 'to'); p.innerHTML = C2H(C2('ready.todo', { button:name }).text[0] || `Check the plan. Press **${name}** when it is right.`); } } }catch(e){}
  return r; };

/* ---------- 8 · the plan opener (weeks 2-4): no Monday sums for revenue or profit any more (the comparison sheet is all ƒ),
   so Average fare and Projected profit show Finance's figures instead of "—" and a blank (Fable's 2a, section 8) ---------- */
const c2Op0 = s2Opener;
s2Opener = function(pl, L, hid, changed){ if(ch1() && hid && hid.size){ hid = new Set([...hid].filter(k => !['revenue', 'profit', 'fuelCost'].includes(k))); } return c2Op0.call(this, pl, L, hid, changed); };

/* ---------- 8 · fuel on Home: no tank alert while fuel is bought as it is used (the Fuel desk is locked), and one "last week"
   price everywhere: the price on the last day flown (week 1 ended at £1.40 in the Calendar, not the £1.20 of Launch Day) ---------- */
const c2NoTank = () => ch1() && (typeof fuelContract === 'function' && fuelContract() || !moduleOn('fuel'));
const c2IS0 = intelSituations;
intelSituations = function(){ const out = c2IS0.apply(this, arguments); return c2NoTank() ? out.filter(x => !(x.tag === 'FUEL' && /tank/i.test(x.text))) : out; };
const c2WF0 = wiFuel;
wiFuel = function(){ const F = c2WF0.apply(this, arguments); if(c2NoTank()) F.short = false; return F; };
const c2LastPaid = d => { const h = (S.history || []).filter(x => x.from === x.to && x.from < d && x.fuelPrice).pop(); return h ? h.fuelPrice : null; };
const c2Chg0 = s2Changes;
s2Changes = function(pl, L){ const out = c2Chg0.apply(this, arguments); if(!ch1()) return out;
  const d = S.day || 1, was = c2LastPaid(d), now = weekFuelPrice(d), i = out.findIndex(x => x.ic === 'fuel' && /^Fuel price has/.test(x.text || '')); if(was === null) return out;
  const item = i >= 0 ? out[i] : null;
  if(Math.abs(now - was) < 0.005){ if(item) out.splice(i, 1); return out; }
  const text = `Fuel price has ${now > was ? 'risen' : 'fallen'} to ${priceL(now)} a litre (last week ended at ${priceL(was)}).`;
  if(item) Object.assign(item, { text, cls:now > was ? 'warn' : 'good' }); else out.unshift({ ic:'fuel', cls:now > was ? 'warn' : 'good', text });
  return out; };

/* ---------- 8 · "New destination": a route the airline flies today for the first time. Launch Day's routes are where it starts,
   so Paris is never "new" on Tuesday; Frankfurt is, on the day it first flies (not the evening it is planned) ---------- */
const c2Ms0 = checkMilestones;
checkMilestones = function(){
  if(!ch1()) return c2Ms0.apply(this, arguments);
  const ms = S.milestones || (S.milestones = {}), H = S.history || [], today = H[H.length - 1], before = new Set();
  H.slice(0, -1).forEach(h => Object.keys(h.routes || {}).forEach(id => before.add(id)));
  const fresh = H.length > 1 && today ? Object.keys(today.routes || {}).filter(id => !before.has(id) && routeById(id)) : [];
  const keep = Math.max(ms.dests || 1, ownedRoutes().length); ms.dests = 1e9;   // the base check stays quiet; this one decides
  try{ c2Ms0.apply(this, arguments); } finally { ms.dests = keep; }
  if(fresh.length){ const n = before.size + fresh.length, r = routeById(fresh[fresh.length - 1]);
    S.rnd.milestone = { title:`New destination: ${r.city}`, sub:`${S.airline.name} now flies to ${plural(n, 'destination')}.` }; }
};

/* ---------- 8 · the Launch Day clock: the live show numbered Launch Day as day 0 (Sun 1 Sep); it is day 1, Mon 2 Sep ---------- */
const c2Show0 = buildShow;
buildShow = function(kind, days){ if(ch1() && kind === 'day' && Array.isArray(days)) days = days.map(D => D && D.d === 0 ? Object.assign({}, D, { d:1 }) : D);
  return c2Show0.apply(this, [kind, days].concat([].slice.call(arguments, 2))); };

/* =====================================================================
   Bertie, 31 Oct 2026, after playing 2a (no hand-off; words in ScreenText plan2.*, the threshold in Settings dailyPauseGain):
   1. week 1: the Day page stops only when there is a clear gain (the best plan for tomorrow beats his by dailyPauseGain);
   2. the timetable keeps the old plan in view, above the new one, while he changes it (and can start again from it);
   3. the Changes sheet has a Before / after tab: the whole old plan and the whole new plan, side by side, once worked out.
   ===================================================================== */
const c2PauseGain = () => { const v = parseFloat(String(WBS().dailyPauseGain === undefined ? '' : WBS().dailyPauseGain).replace(/[^\d.]/g, '')); return isFinite(v) ? v : 0; };
/* how much more a day the best plan we know makes tomorrow than his: the sweep's plan, or his own flights at better fares */
function c2Gain(d){
  const X = c2X(); X.gain = X.gain || {}; if(X.gain[d] !== undefined) return X.gain[d];
  const t = d + 1, on = fn => dryRun(() => withDay(t, () => withBeat(beatAt(t), () => { S.day = t; return fn(); })));
  const cur = normPlan(currentPlan()), pc = on(() => planLines(cur).v.profit); let best = pc;
  try{ const B = bestPlanSweep(t); if(B && B.plan) best = Math.max(best, on(() => planLines(normPlan(B.plan)).v.profit)); }catch(e){}
  try{ const pl = JSON.parse(JSON.stringify(cur)), ids = [...new Set(pl.fleet.flatMap(x => x.sched || []))]; let pv = pc;
    for(let pass = 0; pass < 2; pass++) ids.forEach(id => { (routeById(id).fares || []).forEach(f => { if(f === pl.prices[id]) return; const u = JSON.parse(JSON.stringify(pl)); u.prices[id] = f;
      const v = on(() => planLines(u).v.profit); if(v > pv){ pv = v; pl.prices[id] = f; } }); });
    best = Math.max(best, pv); }catch(e){}
  return (X.gain[d] = Math.max(0, Math.round(best - pc)));
}
/* the day flies on without stopping when there is less than the threshold to find (Launch Day always stops) */
function c2AutoKeep(d){
  const g = c2PauseGain(); if(!g || d <= 1) return false;
  const gain = c2Gain(d); if(gain >= g) return false;
  const X = c2X(), h = lastDay() || {}, fl = (S.rnd.flights || []).filter(f => !f.grounded);
  X.kept[d] = true; (X.auto = X.auto || {})[d] = gain; c2Earn(d, h, fl); save(); return true;
}
window.__c2gain = d => c2Gain(d || S.day);

/* 2 · the old plan above the new one in the timetable */
const c2OldPlan = () => { let w = null; try{ w = typeof ashPlanWas === 'function' ? ashPlanWas() : null; }catch(e){} return w || (UI.s2 && UI.s2.startPlan) || (S.rnd && S.rnd.planWas) || null; };   // the plan the Changes sheet compares with
const c2PlanSame = (a, b) => { try{ return JSON.stringify(normPlan(a).fleet.map(x => [x.sched, x.deps])) + JSON.stringify(normPlan(a).prices) === JSON.stringify(normPlan(b).fleet.map(x => [x.sched, x.deps])) + JSON.stringify(normPlan(b).prices); }catch(e){ return true; } };
function c2OldRows(html){
  const A = c2OldPlan(); if(!A || S.phase === 'setup') return html;
  const B0 = C2('plan2.btn').text, B = B0.length >= 3 ? B0 : ['Show the old plan', 'Hide the old plan', 'Start again from the old plan'], show = UI.c2Old !== false, same = c2PlanSame(A, currentPlan());
  const btns = `<button class="btn c2-oldb ${show ? 'on' : ''}" id="c2OldT" aria-pressed="${show}">${esc(show ? B[1] : B[0])}</button>${same ? '' : `<button class="btn" id="c2OldBack" title="Put the old plan back and start again">&#8634; ${esc(B[2] || 'Start again from the old plan')}</button>`}`;
  html = html.replace('<span class="c1-ttact">', btns + '<span class="c1-ttact">');
  if(!show) return html;
  const s0 = dayStart(), e0 = dayEnd(), span = e0 - s0, X = m => (100 * (m - s0) / span).toFixed(3), pl = normPlan(A);
  let L0 = null; try{ L0 = dryRun(() => planLines(pl)); }catch(e){}
  const W0 = C2('plan2.when').text, W = W0.length >= 2 ? W0 : ["yesterday's plan", "last week's plan"], when = (S.day || 1) <= 7 ? W[0] : (W[1] || W[0]);
  const lab = C2('plan2.old', { when }).text[0] || `Before: ${when}`;
  pl.fleet.forEach((x, j) => {
    const T = c1LaneTrips(pl, j, L0), p = planeById(x.planeId);
    const blocks = T.map(t => { const r = routeById(t.route); return `<div class="c2-oblk" style="left:${X(t.dep)}%;width:${(X(t.arr) - X(t.dep)).toFixed(3)}%"><span>${flagSvg(r.flag, 14)}<b>${esc(r.city)}</b><em class="mono">${money(pl.prices[t.route] || r.basePrice)} · ${t.sold}/${t.seats}</em></span><small class="mono">${c1Hm(t.dep)}–${c1Hm(t.arr)}</small></div>`; }).join('');
    const row = `<div class="c1-row c2-oldrow" aria-label="${esc(lab)}"><div class="c1-lc"><b>${esc(lab)}</b><small>${esc(shortPlane(p))} · ${plural(T.length, 'flight')}</small></div><div class="c2-olane">${blocks}</div><span></span></div>`;
    const at = html.indexOf(`<div class="c1-row" data-c1row="${j}">`); if(at >= 0) html = html.slice(0, at) + row + html.slice(at); });
  return html;
}
const c2Tt0 = s2Timetable;
s2Timetable = function(pl, L){ const h = c2Tt0.apply(this, arguments); try{ if(ch1() && typeof h === 'string' && h.indexOf('data-c1tt') >= 0) return c2OldRows(h); }catch(e){ console.error(e); } return h; };
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('#c2OldT, #c2OldBack'); if(!t || !S) return;
  if(t.id === 'c2OldT'){ UI.c2Old = UI.c2Old === false; render(); return; }
  const A = c2OldPlan(); if(!A) return; try{ applyPlan(JSON.parse(JSON.stringify(A))); }catch(x){ console.error(x); } render();
});

/* 3 · Before / after: the whole old plan and the whole new plan on one sheet (Finance's, all ƒ), once the change is worked out */
function c2BaReady(){ try{ const CH = ashChanges(); return CH.length > 0 && CH.every(c => (ashChgS()[c.key] || {}).done); }catch(e){ return false; } }
function c2BaSpec(){
  const A = c2OldPlan(); if(!A) return null; const a = normPlan(A), b = normPlan(currentPlan());
  let La, Lb; try{ La = dryRun(() => planLines(a)); Lb = dryRun(() => planLines(b)); }catch(e){ return null; }
  const RW = C2('plan2.rows').text, CL = C2('plan2.cols').text, ids = [...new Set(a.fleet.concat(b.fleet).flatMap(x => x.sched || []))].filter(id => routeById(id));
  const dc = (x0, x1, good, isMoney) => { const x = Math.round(x1 - x0); return { t:x ? (x > 0 ? '+' : '−') + (isMoney ? money(Math.abs(x)) : num(Math.abs(x))) : '—', f:true, cls:x === 0 || good === null ? '' : (x > 0) === good ? 'pos' : 'amb' }; };
  const rows = [{ r:1, t:'hdr' }], v = {}; let r = 2;
  const put = (label, ic, x0, x1, good, isMoney, o) => { rows.push(Object.assign({ r, label, ic }, o || {})); const f = isMoney ? money : num;
    v['B' + r] = { t:f(Math.round(x0)), f:true }; v['C' + r] = { t:f(Math.round(x1)), f:true }; v['D' + r] = dc(x0, x1, good, isMoney); r++; };
  ids.forEach(id => { const c = routeById(id).city;
    put((RW[0] || '{city} passengers').replace('{city}', c), 'person', La.v['pax_' + id] || 0, Lb.v['pax_' + id] || 0, null, false);
    put((RW[1] || '{city} ticket revenue').replace('{city}', c), 'coins', La.v['tk_' + id] || 0, Lb.v['tk_' + id] || 0, true, true, { gold:true }); });
  put(RW[2] || 'Flights a day', 'plane', (La.services || []).length, (Lb.services || []).length, null, false);
  put(RW[3] || 'Ticket revenue a day', 'coins', La.v.rev, Lb.v.rev, true, true, { t:'tot', gold:true });
  put(RW[4] || 'Fuel burned a day', 'drum', La.v.fuel, Lb.v.fuel, null, true, { note:`${num(Math.round(La.v.fuelL || 0))} L → ${num(Math.round(Lb.v.fuelL || 0))} L` });
  put(RW[5] || 'Total costs a day', 'receipt', La.v.cost, Lb.v.cost, false, true, { t:'tot', gold:true });
  put(RW[6] || 'Profit a day', 'chart', La.v.profit, Lb.v.profit, true, true, { t:'fin', gold:true });
  const diff = Math.round(Lb.v.profit - La.v.profit), dTxt = `${money(Math.abs(diff))} ${diff >= 0 ? 'more' : 'less'}`;
  const line = `<span class="pos">✓</span> ${C2H(C2('plan2.line', { diff:dTxt }).text[0] || `Finance worked out both plans. Profit a day: **${dTxt}** than before.`)}`;
  return { id:'tab:c2ba', crumb:`${S.airline.name || 'Airline'} HQ · Sheets`, title:C2('plan2.title').text[0] || 'Before and after: the whole plan, a day', tabs:ashTabs('c2ba'), lw:300,
    cols:[{ c:'B', w:180, top:CL[0] || 'Before', main:CL[1] || 'old plan' }, { c:'C', w:180, top:CL[2] || 'After', main:CL[3] || 'new plan', plan:true }, { c:'D', w:180, top:CL[4] || 'after − before', main:CL[5] || 'Difference' }],
    rows, v, sums:[], act:null, just:null, doneLine:line, doneF:null, c2ba:true };
}
const c2Tabs0 = ashTabs;
ashTabs = function(on){ const out = c2Tabs0.apply(this, arguments);
  try{ if(ch1() && S.phase !== 'setup' && c2OldPlan() && ['changes', 'cmp', 'c2ba'].includes(on)){ const ok = c2BaReady();
    out.push({ id:'c2ba', label:C2('plan2.tab').text[0] || 'Before / after', ic:'scale', on:on === 'c2ba', off:on !== 'c2ba' && !ok, title:ok ? '' : (C2('plan2.wait').text[0] || '') }); } }catch(e){}
  return out; };
const c2TabSpec0 = ashTabSpec;
ashTabSpec = function(tab){ if(tab === 'c2ba') return ch1() && c2BaReady() ? c2BaSpec() : null; return c2TabSpec0.apply(this, arguments); };
const c2TabPage0 = ashTabPage;
ashTabPage = function(T, back){ const r = c2TabPage0.apply(this, arguments);
  try{ if(T && T.c2ba){ const hint = screen().querySelector('.actbar .dk-hint, .actbar p, .actbar .hint'); const tx = C2('plan2.footer').text[0]; if(hint && tx) hint.textContent = tx; } }catch(e){}
  return r; };

/* ---------- the toolkit and the play notes ---------- */
// the teacher's Run: the Day page keeps the plan, the Frankfurt card plans tomorrow, the comparison goes on, My turn after Finance
window.__tkPre = () => { if(!ch1()) return null; const tap = sel => { const e = document.querySelector(sel); if(!e || e.disabled || !e.getClientRects().length) return false; e.click(); return true; };
  if(tap('#c2FraGo')) return 'Frankfurt: plan tomorrow'; if(tap('#c2Keep')) return 'kept the plan for tomorrow'; if(tap('#c2CmpGo')) return 'ready to fly'; if(tap('#c1MyTurn')) return 'my turn'; return null; };
if(window.__tkSums){
  window.__tkSums.unshift({ what:"Finance's fare difference", test:() => { const sp = ashLive(); return !!(sp && sp.act && sp.act.c2demo); }, plan:() => ({ at:'.c1-keys', value:'skip the demonstration', go:() => { const sp = ashLive(); UI.c2Demo = null; c1PtrGone(); if(sp && sp.act){ const s = ashSt(sp.id); s.tokens = ashFullTokens(sp.act); s.ready = true; c1Enter(sp); } } }) });
}
const c2Pn0 = window.__pnLabel;
window.__pnLabel = t => (t === 'results' && S && S.phase === 'setup' && c2Daily()) ? 'Launch Day: Day page' : (t === 'weekRun' && S && S.wk && S.wk.from === 1 && c2Daily() && S.wk.dayDone === S.day) ? 'Day page' : c2Pn0 ? c2Pn0(t) : null;
window.__c2 = { x:c2X, read:() => { const h = lastDay() || {}; return c2Read(S.day, (S.rnd.flights || []).filter(f => !f.grounded), h); }, room:c2Room, near:(d) => c2NearOptimum(d || S.day, lastDay() || {}, (S.rnd.flights || []).filter(f => !f.grounded)) };
}
