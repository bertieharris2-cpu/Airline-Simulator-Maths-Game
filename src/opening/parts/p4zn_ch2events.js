/* ==================================================================
   CHAPTER 2, PUSH 3 (Workbook v5.2): events with options, the route news ("all", closures), the Captain's challenges and
   the hunts. Bertie's decisions (14 Oct 2026): a month pauses on the day of its event; Luton is left out for now; a hunt is
   solved by tapping the wrong line, then typing the right figure; a challenge is offered once as a card, then waits on HQ.
   - Event costs are charged once, on their day (S.charges), in the weeks and months alike. Until now a week's or a
     month's event cost was never taken from cash, and the Ready forecast took it off every day.
   - Chapter 2's events carry their choices only as prose ("VIP treatment (a quarter of a day's profit, +1★) · …") and a
     costShare ("VIP 0.25 / upgrade 0.1"): the options are built from that prose; CH2_OPT adds only the mechanics.
   - A month with an event (or a hunt, or a challenge) inside it runs in parts: the run stops on the day, the card, then
     the run carries on. One beat, one plan, one forecast, one history line.
   - Route news for "all" routes applies to every route; a multiplier of 0 is a closure: nothing flies (no fares, no fuel,
     no flying costs), the day costs are still paid. A choice can lift it (the ash cloud's "fly the long way round").
   Functions shared with the main game are reassigned here, never redeclared.
   ================================================================== */

/* ---------- 1. the charges: a dated ledger the simulation pays from ---------- */
function charges(){ const C = S.charges || (S.charges = { due:[], weekly:[] }); C.due = C.due || []; C.weekly = C.weekly || []; return C; }
function chargesOn(d){
  const C = S && S.charges; if(!C) return 0; let t = 0;
  (C.due || []).forEach(c => { if(c.day === d) t += c.amount; });
  (C.weekly || []).forEach(w => { if(d >= w.from && d <= w.to && (d - w.from) % 7 === 0) t += w.amount; });
  return r2(t);
}
function chargesIn(a, b){ const out = []; for(let d = a; d <= b; d++){ const C = S.charges || {};
  (C.due || []).filter(c => c.day === d).forEach(c => out.push({ day:d, amount:c.amount, what:c.what }));
  (C.weekly || []).filter(w => d >= w.from && d <= w.to && (d - w.from) % 7 === 0).forEach(w => out.push({ day:d, amount:w.amount, what:w.what, weekly:true })); } return out; }
const periodNow = () => !!(S && S.period && S.phase === 'round' && ['week', 'month', 'gap'].includes(S.period.type));
const simulateDaysZ0 = simulateDays;
simulateDays = function(a, b, o){
  const out = simulateDaysZ0.apply(this, arguments); if(!S.charges) return out;
  const L = ledger(); let tot = 0;
  for(let d = a; d <= b; d++){ const c = chargesOn(d); if(!c) continue;
    S.cash = r2(S.cash - c); L.cost[d] = r2((L.cost[d] || 0) + c); if(out.days[d - a] !== undefined) out.days[d - a] = r2(out.days[d - a] - c); tot = r2(tot + c); }
  if(tot){ out.extra = r2(out.extra + tot); out.charged = tot; out.costs = r2(out.costs + tot); out.profit = r2(out.rev - out.costs); out.cashEnd = S.cash; if(S.cash < 0) bankCheck(); }
  return out;
};
/* the plan's day in a week or a month: the charges of that day (SIM_DAY), none on the plan page's typical day */
const planLinesZ0 = planLines;
planLines = function(pl){
  if(!periodNow()) return planLinesZ0.apply(this, arguments);
  const keep = S.rnd.eventCost; S.rnd.eventCost = SIM_DAY !== null ? chargesOn(SIM_DAY) : 0;
  try{ return planLinesZ0.apply(this, arguments); } finally { S.rnd.eventCost = keep; }
};

/* ---------- 2. chapter 2's events: the options from the prose, the mechanics from CH2_OPT ---------- */
const CH2_OPT = {
  blogger:[{ key:'vip', share:'VIP', charge:'once', rep:1 }, { key:'upgrade', share:'upgrade', charge:'once', rep:0.5 }, { key:'anyone', late:true }],
  fog:[{ key:'hire', share:'instrument crew', charge:'once' }, { key:'wait', ground:'morning' }, { key:'cancel', ground:'day', rep:-0.5 }],
  fees_rise:[{ key:'pay', share:'pay', charge:'weekly' }, { key:'night', rep:-0.5 }, { key:'deal', share:'deal', charge:'weekly', until:'2031-08-31' }, { drop:true }],   // Luton: left out for now (Bertie, 14 Oct)
  ash_cloud:[{ key:'cancel', rep:0.5 }, { key:'long', share:'long way round', charge:'daily', rep:-0.5, lift:true }, { key:'anyway', fine:0.5, charge:'once', rep:-1, lift:true }],
  mystery_shopper:[{ key:'fixall', share:'fix all', charge:'once', rep:1 }, { key:'cheap', share:'cheap', charge:'once', rep:0.5 }, { key:'ignore', rep:-0.5 }]
};
const CH2_EV_NEWS = { ash_cloud:'ash_cloud_warning' };   // the closure an event decides; its window is the news item's
function ch2Share(cs, phrase){ if(!phrase) return null; const m = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+([\\d.]+)', 'i').exec(String(cs || '')); return m ? +m[1] : null; }
function ch2Stars(s){ const m = /([+−-])\s*(½|\d+(?:\.\d+)?)?\s*★/.exec(s || ''); if(!m) return 0; const v = m[2] === '½' ? 0.5 : m[2] ? +m[2] : 1; return m[1] === '+' ? v : -v; }
function ch2NewsOf(evId){ const id = CH2_EV_NEWS[evId]; return id ? (WORLD.routeNews || []).find(n => n.id === id) || null : null; }
function ch2EventDay(e){ const n = ch2NewsOf(e.id); return n ? dayOfDate(n.start) : dayOfDate(e.date); }
function ch2Event(id){
  const e = eventById(id), M = CH2_OPT[id]; if(!e || !M) return null;
  const fx = String(e.effects || ''), i = fx.indexOf(' · '), cut = i < 0 ? -1 : fx.lastIndexOf('. ', i), story = cut < 0 ? e.text : fx.slice(0, cut + 1), parts = (cut < 0 ? fx : fx.slice(cut + 2)).replace(/\.\s*$/, '').split(' · ');
  const n = ch2NewsOf(id), win = n ? { from:dayOfDate(n.start), to:dayOfDate(n.end) } : null;
  const options = []; parts.forEach((p, k) => { const m = M[k] || {}; if(m.drop) return;
    const lab = p.replace(/\s*\(.*$/, '').trim(), sub = (/\((.*)\)/.exec(p) || [])[1] || '', stars = m.rep !== undefined ? m.rep : ch2Stars(sub);
    const share = m.fine !== undefined ? m.fine : ch2Share(e.costShare, m.share);
    options.push({ key:m.key || 'o' + k, label:capFirst(lab), sub, share, mech:{ charge:m.charge || null, until:m.until || null, ground:m.ground || null, lift:!!m.lift, late:!!m.late, fine:m.fine !== undefined, days:m.charge === 'daily' && win ? win.to - win.from + 1 : 1 },
      effects:{ rep:stars || 0 }, why:'' }); });
  return { id:e.id, date:e.date, day:ch2EventDay(e), title:e.title, text:story, costShare:e.costShare, affectsRoutes:[], window:win, ch2:true, options };
}
const gameEventZ0 = gameEvent;
gameEvent = function(id){ return CH2_OPT[id] ? ch2Event(id) : gameEventZ0(id); };
function ch2PatchBeats(){ (WORLD.rounds || []).forEach(w => { if(w.chapterNo !== 2 || !w.events) return; w.events = w.events.map(e => CH2_OPT[e.id] ? ch2Event(e.id) || e : e); }); }
ch2PatchBeats();
const costShareOfZ0 = costShareOf;
costShareOf = function(ev, opt){ if(opt && opt.share !== undefined && opt.share !== null) return opt.share; if(ev && ev.ch2) return null; return costShareOfZ0(ev, opt); };
/* a day's profit at a pause in the month: the last 7 days before it */
const yesterdayProfitZ0 = yesterdayProfit;
yesterdayProfit = function(){ return S && S.rnd && S.rnd.midPause ? r2(avgDailyProfit()) : yesterdayProfitZ0(); };
/* the blogger: the flight is late when the week's weather is not clear (the World report says so) */
function ch2Late(day){ const w = (marketWeekOf(day) || {}).weather || ''; return !!w && !/clear/i.test(w); }
/* the card: each choice's price in pounds (a share of a day's profit), the date */
function ch2Price(ev){
  if(!ev || !ev.ch2 || ev.priced) return; const base = Math.max(0, yesterdayProfit()), day = ev.day || S.day;
  ev.options.forEach(o => { const m = o.mech || {}, amt = o.share ? Math.round(o.share * base) : 0;
    if(amt) o.effects.cash = -amt;
    if(m.charge === 'weekly'){ let f = day; while(calDate(f).getUTCDay() !== 1) f++; o.sub = `${money(amt)} a week, every Monday from ${dateShort(f)}${m.until ? ` to ${dateShort(dayOfDate(m.until))}` : ', for good'}${o.effects.rep ? ` · ${o.effects.rep > 0 ? '+' : '−'}${starTxt(Math.abs(o.effects.rep))}` : ''}`; }
    else if(m.charge === 'daily') o.sub = `${money(amt)} a day for ${m.days} days · ${o.sub.replace(/^[^;]*;\s*/, '')}`;
    else if(amt && m.fine) o.sub = `A fine of ${money(amt)} · ${o.effects.rep < 0 ? '−' : '+'}${starTxt(Math.abs(o.effects.rep))}`;
    else if(amt) o.sub = `${money(amt)} · ${o.sub.replace(/^[^,;]*profit[^,;]*[,;]?\s*/, '').replace(/^a (quarter|tenth|fifth)[^,;]*[,;]?\s*/, '')}`.replace(/ · $/, '');
    if(m.late){ const late = ch2Late(day); o.effects.rep = late ? -0.5 : 0; o.sub = late ? `Free. The flight will be late (${String((marketWeekOf(day) || {}).weather || 'bad weather').toLowerCase()}): −½★` : 'Free. The flight should be on time.'; }
    o.why = `${o.label}.${amt ? ` It costs ${money(amt)}${m.charge === 'weekly' ? ' a week' : m.charge === 'daily' ? ' a day' : ''}.` : ''}${o.effects.rep ? ` ${o.effects.rep > 0 ? '+' : '−'}${starTxt(Math.abs(o.effects.rep))}.` : ''}`; });
  ev.base = base; ev.priced = true;
}
function starTxt(n){ return n === 0.5 ? '½★' : n === 1 ? '1★' : `${n}★`; }
const eventRZ0 = R.event;
R.event = st => {
  const ev = S.rnd.event; if(ev && ev.ch2) ch2Price(ev);
  eventRZ0(st); if(!ev || !ev.ch2) return;
  const q = screen().querySelector('.tf-top'), day = ev.day || S.day, P = S.period;
  if(q && !screen().querySelector('.ev-date')) q.insertAdjacentHTML('afterend', `<p class="ev-date">${esc(dateLong(day))}${ev.window ? ` · ${fmtRange(ev.window.from, ev.window.to)}` : ''} · a share of a day's profit (${money(Math.round(ev.base || 0))}, the last ${S.rnd.midPause ? '7 days' : (P && P.type === 'week' ? 'period' : '7 days')}' average)</p>`);
  const nx = $('nx'), seg = st.day !== undefined ? S.steps.slice(S.si + 1).find(x => x.t === 'sim' && x.seg !== undefined) : null;
  if(nx && seg && S.rnd.eventChoice !== undefined) nx.innerHTML = `Carry on: fly ${esc(fmtRange(seg.a, seg.b))} &#9654;`;
};
/* the decision: charges on their day(s); the pick is remembered for groundings and lifted closures */
const applyEventNowZ0 = applyEventNow;
applyEventNow = function(choice){
  const r = applyEventNowZ0.apply(this, arguments), ev = S.rnd.event, opt = ev && ev.options && ev.options[choice];
  if(!ev || !opt || !periodNow()) return r;
  const amt = Math.round(S.rnd.eventCost || 0), day = S.rnd.eventDay || ev.day || S.day, m = opt.mech || {}, C = charges(), what = `${ev.title}: ${opt.label}`;
  if(amt > 0){
    if(m.charge === 'weekly'){ let f = day; while(calDate(f).getUTCDay() !== 1) f++; C.weekly.push({ ev:ev.id, at:day, from:f, to:m.until ? dayOfDate(m.until) : 99999, amount:amt, what }); }
    else if(m.charge === 'daily'){ const a = ev.window ? ev.window.from : day; for(let d = a; d < a + (m.days || 1); d++) C.due.push({ ev:ev.id, at:day, day:d, amount:amt, what }); }
    else C.due.push({ ev:ev.id, at:day, day, amount:amt, what });
  }
  (S.ch2pick = S.ch2pick || {})[ev.id] = opt.key || choice;
  try{ const P = rec().pend.events, x = P[P.length - 1]; if(x && x.title === ev.title && m.charge) x.choice += m.charge === 'weekly' ? ` (${money(amt)} a week)` : ` (${money(amt)} a day for ${m.days} days)`; }catch(e){}
  refreshPlan(); return r;
};
const undoEventZ0 = undoEvent;
undoEvent = function(){
  const ev = S.rnd.event, at = S.rnd.eventDay || (ev && ev.day), r = undoEventZ0.apply(this, arguments);
  if(ev && S.charges){ S.charges.due = S.charges.due.filter(c => !(c.ev === ev.id && c.at === at)); S.charges.weekly = S.charges.weekly.filter(c => !(c.ev === ev.id && c.at === at)); }
  if(ev){ if(S.flags) delete S.flags[ev.id]; if(S.ch2pick) delete S.ch2pick[ev.id]; }
  refreshPlan(); return r;
};
const ch2Pick = id => (S && S.ch2pick && S.ch2pick[id]) || null;
/* half-term: "Geneva +30 for the week" — 30 more people a day on that route, the Market week of the event */
function ch2DemandAdd(route, day){
  let add = 0; (WB_EVENTS || []).forEach(e => { if(!e.date || e.date < '2031') return; const m = /([A-Z][a-z]+) \+(\d+) for the week/.exec(e.effects || ''); if(!m) return;
    const r = (WORLD.routes || []).find(x => x.city === m[1]); if(!r || r.id !== route.id) return; const d0 = dayOfDate(e.date), mon = d0 - ((calDate(d0).getUTCDay() + 6) % 7);
    if(day >= mon && day <= mon + 6) add += +m[2]; });
  return add;
}
const demandAtZ0 = demandAt;
demandAt = function(route, price, n){
  const v = demandAtZ0.apply(this, arguments); if(!route || !route.wb || !ch2Now()) return v;
  const add = ch2DemandAdd(route, dayFor(n === undefined ? S.round : n)); return add ? Math.max(0, roundSchool(v + add * homeScale())) : v;
};

/* ---------- 3. the news: "all" routes, closures, a month's announcements ---------- */
function newsLifted(n){ return Object.keys(CH2_EV_NEWS).some(ev => CH2_EV_NEWS[ev] === n.id && (CH2_OPT[ev] || []).some(o => o.lift && o.key === ch2Pick(ev))); }
const newsOnZ0 = newsOn;
newsOn = function(routeId, day){ const iso = isoOf(day); return (WORLD.routeNews || []).filter(n => (n.routes.includes(routeId) || n.routes.includes('all')) && n.start <= iso && iso <= n.end && !newsLifted(n)); };
function closureOn(routeId, day){ return newsOn(routeId, day).find(n => n.mult === 0) || null; }
function ch2GroundWhy(f, d){
  const c = closureOn(f.route, d); if(c) return `Grounded: ${c.headline || 'the airport is closed'}`;
  const fog = (WORLD.rounds || []).length && eventById('fog'), fd = fog ? dayOfDate(fog.date) : null, p = ch2Pick('fog');
  if(fd === d && p === 'cancel') return 'Fog: you cancelled the day.';
  if(fd === d && p === 'wait' && f.dep < 720) return 'Fog: the morning\'s flights waited for it to clear.';
  return null;
}
const planFlightsZ0 = planFlights;
planFlights = function(){
  const out = planFlightsZ0.apply(this, arguments); if(!S || !ch2Now()) return out; const d = simDayNow();
  out.forEach(f => { if(f.grounded) return; const why = ch2GroundWhy(f, d); if(why) Object.assign(f, { demand:0, sold:0, revenue:0, grounded:true, cancelled:true, fuelL:0, runCost:0, fuelCost:0, termCost:0, reasons:[why] }); });
  return out;
};
function newsRoutesText(n){ return n.routes.includes('all') ? 'All routes' : n.routes.map(id => routeById(id) ? routeById(id).city : id).join(', '); }
function newsMultText(n){ return n.mult === 0 ? 'nothing flies' : `demand ×${n.mult}${n.segment && n.segment !== 'all' ? ` (${n.segment})` : ''}`; }
const monthNow = () => !!(S && S.period && S.phase === 'round' && S.period.type === 'month' && ch2Now());
const announcedForZ0 = announcedFor;
announcedFor = function(day){ if(!monthNow()) return announcedForZ0(day); const a = isoOf(S.period.from), z = isoOf(S.period.to);
  return (WORLD.routeNews || []).filter(n => n.announced && n.announce <= z && n.start <= z && n.end >= a); };
const worldReportHtmlZ0 = worldReportHtml;
worldReportHtml = function(){ let h = worldReportHtmlZ0.apply(this, arguments);
  h = h.replace(/ · all demand ×0(?: \(\w+\))?/g, ' · All routes · nothing flies').replace(/>all demand ×/g, '>All routes demand ×');
  if(monthNow()) h = h.replace('Announced for the next two weeks', `Announced for ${monthName(S.period.from)}`);
  return h; };
const surprisesLineZ0 = surprisesLine;
surprisesLine = function(from, to){
  if(!(CH2_DAY && from >= CH2_DAY && to - from >= 7)) return surprisesLineZ0(from, to).replace(/all: demand ×0/g, 'All routes: nothing flies');
  const a = isoOf(from), b = isoOf(to), n = (WORLD.routeNews || []).filter(x => x.start <= b && x.end >= a); if(!n.length) return '';
  return `<div class="fuel-adv wr-sur"><span class="kl">News this month</span>${n.map(x => `<span><b>${esc(x.headline || x.id)}</b> ${esc(newsRoutesText(x))}: ${esc(newsMultText(x))}, ${fmtRange(dayOfDate(x.start), dayOfDate(x.end))}${x.announced ? '' : ' <em>(not announced)</em>'}</span>`).join('')}</div>`;
};
const s2ChangesZ0 = s2Changes;
s2Changes = function(pl, L){
  const out = s2ChangesZ0.apply(this, arguments); if(!ch2Now()) return out; const d = S.day || 1, iso = isoOf(d), seen = new Set();
  announcedFor(d).concat((WORLD.routeNews || []).filter(n => n.start <= iso && iso <= n.end)).forEach(n => { if(!n.routes.includes('all') || seen.has(n.id) || newsLifted(n)) return; seen.add(n.id);
    out.unshift({ ic:'news', cls:n.mult < 1 ? 'warn' : 'up', text:n.headline || n.id, sub:`${newsRoutesText(n)} · ${newsMultText(n)} · ${fmtRange(dayOfDate(n.start), dayOfDate(n.end))}` }); });
  ((S.charges || {}).weekly || []).filter(w => w.to >= d).forEach(w => out.push({ ic:'doc', cls:'warn', text:`${w.what}: ${money(w.amount)} every Monday${w.to < 99999 ? ` to ${dateShort(w.to)}` : ''}.` }));
  if(typeof capWaiting === 'function' && capWaiting()) out.push({ ic:'star', cls:'up', text:`Captain's challenge: ${capWaiting().title}`, sub:'Optional, with a reward. It waits on HQ.' });
  return out;
};

/* ---------- 4. a month pauses on the day: the run in parts ---------- */
const CH2_PAUSERS = [];   // (from, to) → [{ day, step }]: events here; hunts and challenges below
CH2_PAUSERS.push((a, z) => ((roundData(S.round) || {}).events || []).filter(e => e.ch2 && e.options && e.options.length && e.day >= a && e.day <= z).map(e => ({ day:e.day, step:{ t:'event', day:e.day, ev:e.id } })));
function ch2Segment(){
  const P = S.period; if(!monthNow() || (S.rnd.segs && S.rnd.segs.round === S.round)) return false;
  const k = S.steps.findIndex((x, i) => i >= S.si && x.t === 'sim' && x.seg === undefined); if(k < 0) return false;
  const pauses = [].concat(...CH2_PAUSERS.map(f => f(P.from, P.to))); S.rnd.segs = { round:S.round, n:1, parts:[], ran:-1, none:!pauses.length };
  if(!pauses.length) return false;
  const cuts = [...new Set(pauses.map(p => p.day).filter(d => d > P.from))].sort((x, y) => x - y), seq = pauses.filter(p => p.day <= P.from).map(p => p.step);
  let a = P.from; cuts.forEach((d, i) => { seq.push({ t:'sim', seg:i, a, b:d - 1 }); pauses.filter(p => p.day === d).forEach(p => seq.push(p.step)); a = d; });
  seq.push({ t:'sim', seg:cuts.length, a, b:P.to });
  S.steps.splice(k, 1, ...seq); S.rnd.segs.n = cuts.length + 1; return true;
}
const startBeatZ0 = startBeat;
startBeat = function(b){ startBeatZ0(b); if(monthNow()){ S.rnd.event = null; S.rnd.eventDay = null; } if(ch2Segment()){ save(); render(); } };
function mergeParts(ps){
  const M = { from:ps[0].from, to:ps[ps.length - 1].to, rev:0, run:0, extra:0, fuelUsed:0, over:0, autoL:0, autoCost:0, pax:0, seats:0, trips:0, cancelled:0, costs:0, charged:0, routes:{}, planes:{}, days:[] };
  ps.forEach(p => { ['rev', 'run', 'extra', 'fuelUsed', 'over', 'autoL', 'autoCost', 'pax', 'seats', 'trips', 'cancelled', 'costs', 'charged'].forEach(k => { M[k] = r2(M[k] + (p[k] || 0)); });
    Object.keys(p.routes).forEach(id => { const x = p.routes[id], y = M.routes[id] || (M.routes[id] = { pax:0, seats:0, rev:0, cost:0, trips:0, fare:x.fare, want:0 }); y.pax += x.pax; y.seats += x.seats; y.want += x.want; y.rev = r2(y.rev + x.rev); y.cost = r2(y.cost + x.cost); y.trips += x.trips; y.fare = x.fare; });
    M.days = M.days.concat(p.days); });
  Object.keys(M.routes).forEach(id => { const y = M.routes[id]; y.profit = r2(y.rev - y.cost); });
  const L = ps[ps.length - 1]; M.profit = r2(M.rev - M.costs); M.cashEnd = L.cashEnd; M.fuelEnd = L.fuelEnd; M.fuelStock = L.fuelStock; return M;
}
function periodTOf(p, from, to){   // the run's total as simulateRun reports it (p4f), from one part
  const part = JSON.parse(JSON.stringify(p)), T = { from, to, parts:[part], rev:0, costs:0, profit:0, pax:0, seats:0, trips:0, over:0, autoL:0, autoCost:0, fuelUsed:0, cancelled:0, routes:{}, planes:{} };
  ['rev', 'costs', 'pax', 'seats', 'trips', 'over', 'autoL', 'autoCost', 'fuelUsed', 'cancelled'].forEach(k => { T[k] = r2(T[k] + (part[k] || 0)); });
  Object.keys(part.routes).forEach(id => { T.routes[id] = Object.assign({}, part.routes[id]); });
  ['rev', 'costs', 'over', 'autoCost', 'fuelUsed'].forEach(k => { T[k] = Math.round(T[k]); });
  Object.keys(T.routes).forEach(id => { const y = T.routes[id]; y.rev = Math.round(y.rev); y.cost = Math.round(y.cost); y.profit = y.rev - y.cost; });
  part.rev = Math.round(part.rev); part.costs = Math.round(part.costs); part.profit = part.rev - part.costs; part.label = monthName(from, true);
  T.profit = T.rev - T.costs; T.days = part.days.slice(); T.charged = part.charged || 0; return T;
}
const simulateRunZ0 = simulateRun;
simulateRun = function(){
  const st = step(), G = S.rnd && S.rnd.segs;
  if(!G || G.none || !st || st.t !== 'sim' || st.seg === undefined) return simulateRunZ0.apply(this, arguments);
  const part = simulateDays(st.a, st.b); S.disrupt = null; G.parts[st.seg] = part; G.ran = st.seg;
  return periodTOf(mergeParts(G.parts.slice(0, st.seg + 1).filter(Boolean)), S.period.from, st.b);
};
const enterStepZ0 = enterStep;
enterStep = function(){
  const st = step(), G = S && S.rnd && S.rnd.segs, P = S && S.period;
  if(st && G && st.t === 'sim' && st.seg !== undefined && G.ran < st.seg){ delete S.rnd.sim; delete S.rnd.simAnim; S.day = P.from; delete S.rnd.midPause; }
  if(st && st.day !== undefined && ['event', 'hunt', 'capChallenge'].includes(st.t) && monthNow()){
    S.day = st.day; S.rnd.midPause = st.day > P.from ? st.day : null;
    if(st.t === 'event' && !(S.rnd.event && S.rnd.event.id === st.ev && S.rnd.eventDay === st.day)){
      const w = (roundData(S.round).events || []).find(e => e.id === st.ev); S.rnd.event = w ? JSON.parse(JSON.stringify(w)) : ch2Event(st.ev); S.rnd.eventDay = st.day; delete S.rnd.eventChoice; delete S.rnd.eventWhy; S.rnd.eventCost = 0; }
  }
  const r = enterStepZ0.apply(this, arguments);
  if(st && G && st.t === 'sim' && st.seg !== undefined && S.rnd.simAnim && S.rnd.sim){ const n = S.rnd.sim.days.length, f = n ? (st.a - P.from) / n : 0; S.rnd.simAnim.start = Date.now() - S.rnd.simAnim.dur * f; }
  return r;
};
/* the run's screen: the bar fills over the whole month, so it carries on from the pause */
const simRZ0 = R.sim;
R.sim = st => {
  if(st.seg === undefined || !S.rnd.segs) return simRZ0(st);
  renderOverview('sim'); const a = S.rnd.simAnim, T = S.rnd.sim, P = S.period;
  if(!a || !T){ setTimeout(() => { if(step() === st) next(); }, 300); return; }
  on('skipSim', () => { a.start = Date.now() - a.dur; });
  if(simLoop === st) return; simLoop = st;
  const span = P.to - P.from + 1;
  const tick = () => {
    if(step() !== st){ simLoop = null; return; }
    const p = clamp((Date.now() - a.start) / a.dur, 0, 1), n = T.days.length, k = Math.round(p * n), sum = T.days.slice(0, k).reduce((x, y) => x + y, 0);
    const dd = $('simDate'); if(dd) dd.textContent = dateShort(Math.min(T.to, T.from + Math.max(0, k - 1)));
    const pr = $('simProg'); if(pr) pr.style.width = (100 * k / span).toFixed(1) + '%';
    const sp = $('simProfit'); if(sp){ sp.textContent = money(Math.round(sum)); sp.className = 'mono ' + (sum >= 0 ? 'green' : 'red'); }
    if(p < 1) requestAnimationFrame(tick); else { simLoop = null; setTimeout(() => { if(step() === st) next(); }, st.b < P.to ? 400 : 700); }
  };
  requestAnimationFrame(tick);
};
/* a save made in a month before the run: give it its pauses */
const renderZ0 = render;
render = function(){ try{ if(S && S.phase === 'round' && S.rnd && !(S.rnd.segs && S.rnd.segs.round === S.round) && monthNow() && ch2Segment()) save(); }catch(e){} return renderZ0.apply(this, arguments); };
/* the month's results: what the decisions during the month cost, and the closures */
const applyPeriodResultsZ0 = applyPeriodResults;
applyPeriodResults = function(){
  const first = !S.rnd.applied, r = applyPeriodResultsZ0.apply(this, arguments); if(!first || !S.rnd.sim) return r;
  const T = S.rnd.sim, P = S.period, ch = chargesIn(T.from, T.to);
  if(ch.length){ const by = {}; ch.forEach(c => { const x = by[c.what] || (by[c.what] = { n:0, t:0, weekly:c.weekly }); x.n++; x.t = r2(x.t + c.amount); });
    S.rnd.why.push({ ic:'💷', text:`Charged ${PW().now}: ${Object.keys(by).map(k => `${k} ${by[k].n > 1 ? `${by[k].n} × ${money(by[k].t / by[k].n)} = ` : ''}${money(by[k].t)}`).join('; ')}.` }); }
  const shut = []; for(let d = T.from; d <= T.to; d++){ const n = (WORLD.routeNews || []).find(x => x.mult === 0 && x.start <= isoOf(d) && isoOf(d) <= x.end && !newsLifted(x)); if(n) shut.push(d); }
  if(shut.length) S.rnd.why.push({ ic:'🌋', text:`Nothing flew on ${fmtRange(shut[0], shut[shut.length - 1])}: no fares, no fuel burned; the aircraft's day costs were still paid.` });
  if(S.rnd.segs && !S.rnd.segs.none && S.rnd.vs && S.rnd.vs.kind === 'period' && Math.abs(S.rnd.vs.expProfit - S.rnd.vs.gotProfit) >= 1) S.rnd.vs.why = `The forecast was made on ${dateShort(P.from)}, before the decisions made during the month and what they cost.`;
  return r;
};

/* ---------- 5. the Captain's challenge: one a term, optional, with a reward (D36) ---------- */
const CAP_FROM = () => (CH_SPANS.find(c => c.no === 2) || {}).weekFrom || CH2_DAY || 1;   // day 127 is full: the first one waits for the weeks
function capList(){ return (WB.challenges || []).filter(c => c.status !== 'placeholder' && c.fromDate && c.question).map(c => Object.assign({}, c, { start:Math.max(dayOfDate(c.fromDate), CAP_FROM()) })).sort((a, b) => a.start - b.start); }
function capState(n){ const A = S.capCh || (S.capCh = {}); return A[n] || (A[n] = { state:'new', tries:0 }); }
function capCurrent(day){ day = day === undefined ? (S.day || 1) : day; const L = capList().filter(c => c.start <= day); return L.length ? L[L.length - 1] : null; }
function capWaiting(){ const c = capCurrent(); if(!c) return null; const s = capState(c.n); return s.state === 'later' ? c : null; }
function capParse(c){ const m = /([\d,]+)\s*([×÷])\s*([\d,]+)/.exec(c.question || ''); return m ? { a:+m[1].replace(/,/g, ''), op:m[2], b:+m[3].replace(/,/g, '') } : null; }
CH2_PAUSERS.push((a, z) => capList().filter(c => c.start >= a && c.start <= z && capState(c.n).state === 'new').map(c => ({ day:c.start, step:{ t:'capChallenge', day:c.start, n:c.n } })));
/* a week that starts on (or holds) a challenge's day offers it straight after HQ */
function capWeekStep(){
  const P = S.period; if(!P || P.type !== 'week' || !ch2Now()) return; const c = capList().find(x => x.start >= P.from && x.start <= P.to && capState(x.n).state === 'new');
  if(!c || S.steps.some(x => x.t === 'capChallenge')) return; const k = S.steps.findIndex(x => x.t === 'hq'); S.steps.splice(k < 0 ? 0 : k + 1, 0, { t:'capChallenge', n:c.n });
}
function capReward(c){
  const t = String(c.reward || ''), pc = /(\d+)%\s*off your next fuel/i.exec(t), st = /([+−-])\s*(½|\d+(?:\.\d+)?)\s*star/i.exec(t), cash = /£([\d,]+)/.exec(t);
  if(pc){ S.fuelDiscount = +pc[1] / 100; S.fuelDiscountFrom = c.n; return `${pc[1]}% off your next fuel purchase: it waits at the fuel desk.`; }
  if(st){ const n = (st[2] === '½' ? 0.5 : +st[2]) * (st[1] === '+' ? 1 : -1), ev = S.rnd.event; S.rnd.event = null; try{ bankStars(n); } finally { S.rnd.event = ev; }
    const L = S.repLog || [], x = L[L.length - 1]; if(x) x.what = `Captain's challenge: ${c.title}`; return `${st[1] === '+' ? '+' : '−'}${starTxt(Math.abs(n))}: passengers hear about it.`; }
  if(cash){ const v = +cash[1].replace(/,/g, ''); S.cash = r2(S.cash + v); return `${money(v)} paid into the bank.`; }
  return t;
}
function capRecord(c, a){ try{ const p = capParse(c) || {}; const e = recOpen('ch:' + c.n, { type:'calc', relKey:p.op === '÷' ? 'flightTime' : 'tickets', doc:`Captain's challenge: ${c.title}`, ask:c.story, question:c.question, unit:'', correct:c.answer, correctText:`${num(c.answer)} ${c.unit || ''}`.trim(), ops:p.a !== undefined ? [p.a, p.b] : null, op:p.op || '', level:"Captain's challenge" }); recAttempt(e, a); }catch(e){} }
R.capChallenge = st => {
  const c = capList().find(x => x.n === st.n) || capCurrent(); if(!c){ next(); return; }
  const s = capState(c.n), p = capParse(c), won = s.state === 'won'; if(s.state === 'new'){ s.state = 'offered'; s.day = S.day; }
  const box = st.go || won ? `<div class="cap-try ${won ? 'ok' : ''}">${won ? cardStampHtml('ok') : ''}<div class="acq-in"><span class="mono">${esc(c.question)} =</span><span class="sc-in ${st.q ? 'qy' : ''}"><input data-pad="capch" inputmode="decimal" autocomplete="off" value="${esc(st.v || (won ? String(c.answer) : ''))}" aria-label="Answer" ${won ? 'disabled' : ''}></span><span class="cap-u">${esc(c.unit || '')}</span>${won ? '' : '<button class="btn primary" id="capChk">Check ✓</button>'}</div>
      <p class="sc-msg ${won ? 'won' : ''}" role="status">${esc(st.msg || (won ? `Won! ${s.reward || ''}` : ''))}</p></div>` : '';
  const body = `<div class="cap"><section class="dk-pnl cap-card"><div class="cap-h"><span class="cap-badge">${ICO2.star || '★'}</span><div><span class="kl">Captain's challenge · optional</span><h2>${esc(c.title)}</h2></div></div>
      <p class="cap-story">${esc(c.story)}</p><p class="cap-win"><b>Win it for:</b> ${esc(c.reward)}</p>${box}</section></div>`;
  const acts = won ? `<button class="btn primary big" id="capDone">${st.adHoc ? 'Back to HQ' : 'Carry on'} &#9654;</button>` : st.go ? `<button class="btn big" id="capLater">Not today</button>` : `<button class="btn big" id="capLater">Not today</button><button class="btn primary big" id="capGo">Have a go &#9654;</button>`;
  screen().innerHTML = shell(deskPage({ title:"Captain's challenge", sub:`One a term: a bare sum with a story. Optional, and it pays.`, cls:'cap-page', body }), deskBar(won ? 'Well done. The reward is yours.' : st.go ? 'Work it out (the Working pad sets it out), then Check.' : 'Have a go now, or later from HQ.', acts));
  on('capGo', () => { st.go = true; render(); });
  on('capLater', () => { if(s.state !== 'won') s.state = 'later'; addNews([{ tag:'NEWS', text:`Captain's challenge waiting on HQ: ${c.title}.` }]); UI.justDone = null; next(); });
  on('capDone', () => { UI.justDone = null; next(); });
  const inp = screen().querySelector('[data-pad="capch"]'); if(inp && !won){ inp.oninput = () => { st.v = inp.value; }; inp.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); $('capChk').click(); } }; setTimeout(() => { try{ inp.focus(); }catch(e){} }, 40); }
  on('capChk', () => { const v = padNum(st.v); if(v === null){ st.msg = 'Type your answer.'; render(); return; } s.tries++;
    if(Math.abs(v - c.answer) < 1e-6){ s.state = 'won'; s.won = S.day; s.reward = capReward(c); st.q = false; st.msg = ''; capRecord(c, { ok:true, given:String(st.v).trim(), value:v });
      try{ rec().pend.events.push({ day:S.day, title:"Captain's challenge", choice:`${c.title}: won (${c.reward})`, cost:0 }); }catch(e){} soLog && soLog(`Captain's challenge ${c.n} won`); addNews([{ tag:'BONUS', text:`Captain's challenge won: ${c.reward}.`, cls:'good' }]); render(); return; }
    const est = p ? (p.op === '×' ? `Estimate: ${num(p.a)} × ${num(p.b)} is about ${num(Math.round(p.a / 10) * 10 || p.a)} × ${num(Math.round(p.b / 10) * 10 || p.b)} = ${num((Math.round(p.a / 10) * 10 || p.a) * (Math.round(p.b / 10) * 10 || p.b))}.` : `Estimate: ${num(p.a)} ÷ ${num(p.b)} is about ${num(Math.round(p.a / 100) * 100)} ÷ ${num(p.b)} = ${num(Math.round(Math.round(p.a / 100) * 100 / p.b))}.`) : '';
    st.q = true; st.msg = `Query: ${v > c.answer ? 'too big' : 'too small'}. ${est}`; capRecord(c, { ok:false, given:String(st.v).trim(), value:v, note:st.msg.replace(/^Query: /, '') }); render(); });
};
PAD_SPECS.push(inp => { if(!inp.dataset || inp.dataset.pad !== 'capch') return null; const st = step(), c = st && (capList().find(x => x.n === st.n) || capCurrent()), p = c && capParse(c); if(!p) return null;
  return { op:p.op, a:p.a, b:p.b, lab:`${num(p.a)} ${p.op} ${num(p.b)}`, sel:'[data-pad="capch"]', unit:c.unit || '' }; });
/* HQ: the waiting challenge has a button beside the day's */
const hqCapZ0 = R.hq;
R.hq = st => { const r = hqCapZ0(st); const c = capWaiting(); if(!c || !ch2Now()) return r;
  const act = screen().querySelector('#startDay'); if(act && !$('capChBtn')) act.insertAdjacentHTML('afterend', `<button class="btn cap-hq" id="capChBtn" title="${esc(c.title)}: ${esc(c.reward)}">${ICO2.star || '★'} Captain's challenge</button>`);
  on('capChBtn', () => { S.steps.splice(S.si, 0, { t:'capChallenge', n:c.n, adHoc:true, go:true }); UI.view = null; save(); render(); }); return r; };
/* the reward at the fuel desk: 10% off the next purchase */
const buyFuelZ0 = buyFuel;
buyFuel = function(litres, price){
  const d = S && S.fuelDiscount; if(!(d > 0) || !(litres > 0)) return buyFuelZ0.apply(this, arguments);
  const p2 = Math.round(price * (1 - d) * 1000) / 1000; if(!QUIET){ S.fuelDiscountUsed = { day:S.day, n:S.fuelDiscountFrom, litres, price, paid:p2, saved:r2(litres * price - litres * p2) }; addNews([{ tag:'BONUS', text:`Captain's discount used: ${num(litres)} L at ${priceL(p2)} instead of ${priceL(price)}, saving ${twoDp(S.fuelDiscountUsed.saved)}.`, cls:'good' }]); }
  return buyFuelZ0.call(this, litres, p2);
};
const fuelDeskCapZ0 = R.fuelDesk;
R.fuelDesk = st => { const u = S.fuelDiscountUsed; if(u && u.day === S.day && UI.fd && UI.fd.done && !/Captain/.test(UI.fd.done)) UI.fd.done += ` Captain's discount: ${Math.round(100 * (1 - u.paid / u.price))}% off, so you paid ${twoDp(u.litres * u.paid)} (saved ${twoDp(u.saved)}).`;
  const r = fuelDeskCapZ0(st); if(S.fuelDiscount > 0){ const host = screen().querySelector('.dp-body'); if(host && !host.querySelector('.cap-fd')) host.insertAdjacentHTML('afterbegin', `<div class="bw-wait cap-fd">${ICO2.star || '★'}<span>Captain's discount waiting: ${Math.round(S.fuelDiscount * 100)}% off the next fuel you buy.</span></div>`); }
  return r; };

/* ---------- 6. the hunts: a document with one planted mistake (D39) ---------- */
function huntList(){ return (WB.hunts || []).filter(h => h.status !== 'placeholder' && h.date && (h.chapter === undefined || h.chapter === 2)); }
function huntState(id){ const H = S.hunts || (S.hunts = {}); return H[id] || (H[id] = { state:'new', tries:0 }); }
const nn = s => +String(s).replace(/,/g, '');
function huntSpec(id){
  const h = huntList().find(x => x.id === id); if(!h) return null; const w = h.whatIsWrong || '', day = dayOfDate(h.date);
  let m = /([\d,]+)\s*L at £([\d.]+) shown as £([\d,]+)/.exec(w);
  if(m){ const L = nn(m[1]), p = +m[2], shown = nn(m[3]), right = Math.round(L * p * 100) / 100, a = Math.round(L * 3 / 7 / 1000) * 1000, b = L - a, mon = day - ((calDate(day).getUTCDay() + 6) % 7) - 14;
    return { h, id, day, kind:'invoice', title:'Dragon Fuels Ltd', docSub:`Invoice · ${monthName(day)} ${calDate(day).getUTCFullYear()} · to ${S.airline ? S.airline.name : 'Dragon Air'}`, relKey:'fuel', unit:'£',
      lines:[{ lab:`Delivery, ${dateShort(mon)}`, a, b:p, au:'L', bu:'£', shown:Math.round(a * p * 100) / 100 }, { lab:`Delivery, ${dateShort(mon + 2)}`, a:b, b:p, au:'L', bu:'£', shown:Math.round(b * p * 100) / 100 }, { lab:'Total to pay', a:L, b:p, au:'L', bu:'£', shown, wrong:true, total:true }],
      right, out:r2(shown - right), consequence:h.consequenceIfMissed }; }
  m = /(\d[\d,]*) passengers × £([\d,]+) = £([\d,]+)/.exec(w);
  if(m){ const pax = nn(m[1]), fare = nn(m[2]), shown = nn(m[3]), right = pax * fare, hh = lastHist(), days = hh ? Math.max(1, hh.to - hh.from + 1) : 1, nyc = routeById('nyc');
    const others = hh ? Object.keys(hh.routes || {}).filter(id => id !== 'nyc' && routeById(id)).slice(0, 4).map(id => { const x = hh.routes[id], p = Math.round(x.pax / days), f = x.fare || fareOf(id); return { lab:routeById(id).city, a:p, b:f, au:'passengers', bu:'£', shown:p * f }; }) : [];
    return { h, id, day, kind:'accounts', title:`${S.airline ? S.airline.name : 'Dragon Air'}: year-1 accounts`, docSub:`Ticket money on a typical day in ${monthName(day)} ${calDate(day).getUTCFullYear()}, by route`, relKey:'revenue', unit:'£',
      lines:[{ lab:nyc ? nyc.city : 'New York', a:pax, b:fare, au:'passengers', bu:'£', shown, wrong:true }].concat(others), right, out:shown - right, consequence:h.consequenceIfMissed }; }
  return null;
}
CH2_PAUSERS.push((a, z) => huntList().filter(h => { const d = dayOfDate(h.date); return d > a && d <= z && huntState(h.id).state === 'new'; }).map(h => ({ day:dayOfDate(h.date), step:{ t:'hunt', id:h.id, day:dayOfDate(h.date) } })));
function huntRecord(sp, a, missed){ try{ const W = sp.lines.find(x => x.wrong); const e = recOpen('hunt:' + sp.id, { type:'calc', relKey:sp.relKey, doc:`Spot the mistake: ${sp.h.host}`, ask:'One line is wrong. Which one, and what should it say?', question:`${num(W.a)} ${W.au === 'L' ? 'L' : ''} × ${W.b % 1 ? twoDp(W.b) : money(W.b)}`.replace(/\s+/g, ' '), unit:'£', correct:sp.right, correctText:twoDp(sp.right).replace(/\.00$/, ''), ops:[W.a, W.b], op:'×', level:'Spot the mistake' });
  recAttempt(e, a); if(missed){ e.status = 'missed'; save(); } }catch(e){} }
function huntConsequence(sp){
  const s = huntState(sp.id); s.state = 'missed'; s.missedDay = S.day;
  if(sp.kind === 'invoice'){ charges().due.push({ ev:'hunt:' + sp.id, at:S.day, day:S.day, amount:sp.out, what:`${sp.h.host} overpaid` }); return `The total should be ${twoDp(sp.right).replace(/\.00$/, '')}: you paid ${money(sp.out)} too much. If you find it later, it can still be put right next month.`; }
  const m = /£([\d,]+) out/.exec(sp.consequence || ''); S.ch3Forecast = { out:m ? nn(m[1]) : sp.out, why:`${sp.h.host}: ${sp.lines[0].lab} ${num(sp.lines[0].a)} × ${money(sp.lines[0].b)} shown as ${money(sp.lines[0].shown)}` };
  return `${sp.lines[0].lab}'s line should be ${money(sp.right)}, not ${money(sp.lines[0].shown)}. ${sp.consequence || ''}`.trim();
}
R.hunt = st => {
  const sp = huntSpec(st.id); if(!sp){ next(); return; }
  const s = huntState(st.id), done = st.recheck ? !!st.done : (s.state === 'found' || s.state === 'missed'), lines = st.recheck ? sp.lines.filter(x => x.wrong) : sp.lines;
  const fmt = (v, u) => u === 'L' ? `${num(v)} L` : u === '£' ? (v % 1 ? twoDp(v) : money(v)) : num(v);
  const row = (x, i) => { const pk = st.pick === i, fixed = done && x.wrong && (st.recheck ? st.found : s.state === 'found');
    return `<tr class="${pk ? 'on' : ''} ${fixed ? 'fixed' : ''}"><td>${esc(x.lab)}</td><td class="mono">${fmt(x.a, x.au)} × ${fmt(x.b, x.bu)}</td><td class="mono num">${fixed ? `<s>${fmt(x.shown, '£')}</s> <b class="good">${fmt(sp.right, '£')}</b>` : fmt(x.shown, '£')}</td>
      <td>${done ? '' : `<button class="btn small hunt-x" data-hunt="${i}">This is wrong</button>`}</td></tr>${pk && !done ? `<tr class="hunt-fix"><td colspan="4"><div class="acq-in"><span>The right amount: ${fmt(x.a, x.au)} × ${fmt(x.b, x.bu)} =</span><span class="sc-in ${st.q ? 'qy' : ''}"><i class="pre">£</i><input data-pad="hunt" inputmode="decimal" autocomplete="off" value="${esc(st.v || '')}" aria-label="The right amount"></span><button class="btn primary" id="huntChk">Check ✓</button></div></td></tr>` : ''}`; };
  const doc = `<section class="hunt-doc ${sp.kind}"><div class="hd-h"><b>${esc(sp.title)}</b><span>${esc(sp.docSub)}</span></div><table class="hd-t"><thead><tr><th></th><th>Sum</th><th class="num">Amount</th><th></th></tr></thead><tbody>${lines.map(x => row(x, sp.lines.indexOf(x))).join('')}</tbody></table>
    ${done && (st.recheck ? st.found : s.state === 'found') ? `<div class="hd-stamp">${cardStampHtml('ok')}</div>` : ''}</section>`;
  const msg = st.msg || (done ? (st.recheck ? (st.found ? `Found it: ${money(sp.out)} comes back.` : 'Still not found: the money stays lost.') : s.state === 'found' ? 'Found and fixed. No harm done.' : s.missedText || '') : '');
  const lead = st.recheck ? `Last month you paid this invoice. Check its total again: was it right?` : `One line on this ${sp.kind === 'invoice' ? 'invoice' : 'page of the accounts'} is wrong. Find it and put it right. ${esc(sp.h.pupilChecks || '')}.`;
  const body = `<div class="hunt"><p class="hunt-lead">${lead}</p>${doc}<p class="sc-msg hunt-msg ${done && !(st.recheck ? st.found : s.state === 'found') ? 'bad' : ''}" role="status">${esc(msg)}</p></div>`;
  screen().innerHTML = shell(deskPage({ title:`Spot the mistake: ${esc(sp.h.host)}`, sub:st.recheck ? 'A second look' : 'Something on this document does not add up.', cls:'hunt-page', body }),
    deskBar(done ? 'Carry on when you are ready.' : 'Press This is wrong on the line you think is wrong, then type what it should say.', done ? `<button class="btn primary big" id="nx">Carry on &#9654;</button>` : `<button class="btn big" id="huntAllOk">Everything is right</button>`));
  screen().querySelectorAll('[data-hunt]').forEach(b => b.onclick = () => { const i = +b.getAttribute('data-hunt'), x = sp.lines[i];
    if(!x.wrong){ st.pick = null; st.msg = `This line is right: ${fmt(x.a, x.au)} × ${fmt(x.b, x.bu)} is ${fmt(x.shown, '£')}. Look at the others.`; s.tries++; huntRecord(sp, { ok:false, given:`line: ${x.lab}`, value:null, note:'that line is right' }); render(); return; }
    st.pick = i; st.v = ''; st.q = false; st.msg = ''; render(); });
  const inp = screen().querySelector('[data-pad="hunt"]'); if(inp){ UI.huntLine = sp.lines[st.pick]; inp.oninput = () => { st.v = inp.value; }; inp.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); $('huntChk').click(); } }; setTimeout(() => { try{ inp.focus(); }catch(e){} }, 40); }
  on('huntChk', () => { const v = padNum(st.v), x = sp.lines[st.pick]; if(v === null){ st.msg = 'Type the amount.'; render(); return; } s.tries++;
    if(Math.abs(v - sp.right) < 0.005){ if(st.recheck){ st.found = true; st.done = true; s.state = 'found'; s.late = S.day; charges().due.push({ ev:'hunt:' + sp.id, at:S.day, day:S.period ? S.period.from : S.day, amount:-sp.out, what:`${sp.h.host}: put right` }); }
      else s.state = 'found'; st.msg = `Found and fixed: ${fmt(sp.right, '£')}, not ${fmt(x.shown, '£')}.${sp.kind === 'invoice' ? ` Dragon Fuels take ${money(sp.out)} off.` : ''}`; huntRecord(sp, { ok:true, given:String(st.v).trim(), value:v });
      try{ rec().pend.events.push({ day:S.day, title:`Spot the mistake: ${sp.h.host}`, choice:`found (${money(sp.out)})`, cost:0 }); }catch(e){} render(); return; }
    st.q = true; st.msg = Math.abs(v - x.shown) < 0.005 ? 'That is what it says. Re-multiply it yourself.' : `Query: ${v > sp.right ? 'too much' : 'too little'}. ${sp.h.pupilChecks || 'Re-multiply'}.`; huntRecord(sp, { ok:false, given:String(st.v).trim(), value:v, note:st.msg.replace(/^Query: /, '') }); render(); });
  on('huntAllOk', () => { s.tries++; if(st.recheck){ st.done = true; st.found = false; st.msg = ''; huntRecord(sp, { ok:false, given:'everything is right (second look)', value:null, note:'missed again' }, true); render(); return; }
    s.missedText = huntConsequence(sp); st.msg = `It wasn't. ${s.missedText}`; s.missedText = st.msg; huntRecord(sp, { ok:false, given:'everything is right', value:null, note:'missed' }, true);
    try{ rec().pend.events.push({ day:S.day, title:`Spot the mistake: ${sp.h.host}`, choice:'missed', cost:sp.kind === 'invoice' ? sp.out : 0 }); }catch(e){} render(); });
  on('nx', () => { UI.justDone = null; next(); });
};
PAD_SPECS.push(inp => { if(!inp.dataset || inp.dataset.pad !== 'hunt' || !UI.huntLine) return null; const x = UI.huntLine;
  return { op:'×', a:x.a, b:x.b, money:x.b % 1 !== 0, lab:`${num(x.a)} × ${x.b % 1 ? twoDp(x.b) : num(x.b)}`, sel:'[data-pad="hunt"]' }; });
/* a missed invoice gets a second look at the start of the next month; the year-1 accounts hunt comes before the chapter accounts */
function huntBeatSteps(){
  const w = roundData(S.round); if(!ch2Now() || !w) return;
  if(w.period === 'review' && w.chapterNo === 2){ const h = huntList().find(x => dayOfDate(x.date) === S.day && huntState(x.id).state === 'new'), k = S.steps.findIndex(x => x.t === 'chapterReview');
    if(h && k >= 0 && !S.steps.some(x => x.t === 'hunt')) S.steps.splice(k, 0, { t:'hunt', id:h.id }); }
  if(w.period === 'month'){ const h = huntList().find(x => { const s = huntState(x.id); return s.state === 'missed' && !s.rechecked && s.missedDay < S.period.from && huntSpec(x.id) && huntSpec(x.id).kind === 'invoice'; });
    if(h && !S.steps.some(x => x.t === 'hunt')){ huntState(h.id).rechecked = S.day; const k = S.steps.findIndex(x => x.t === 'review'), at = k >= 0 ? k + 1 : 1; S.steps.splice(at, 0, { t:'hunt', id:h.id, recheck:true }); } }
}
const startBeatHuntZ0 = startBeat;
startBeat = function(b){ startBeatHuntZ0(b); const n = S.steps.length; capWeekStep(); huntBeatSteps(); if(S.steps.length !== n){ save(); render(); } };
/* the record: a missed hunt says so */
const recCalcHtmlZ0 = recCalcHtml;
recCalcHtml = function(e, g){ const h = recCalcHtmlZ0.apply(this, arguments); return e && e.status === 'missed' ? h.replace('<p class="meta">', '<p class="meta"><span class="red">Missed: "Everything is right"</span> · ') : h; };
/* chapter 2's end: a missed year-1 accounts hunt carries into chapter 3's forecast */
const protoEndHuntZ0 = R.protoEnd;
R.protoEnd = st => { const r = protoEndHuntZ0(st); const F = S.ch3Forecast; if(F && ch2Now()){ const host = screen().querySelector('.proto-end .row') || screen().querySelector('.proto-end'); if(host && !screen().querySelector('.hunt-carry')) host.insertAdjacentHTML('beforebegin', `<p class="hunt-carry bad">Finance note: ${esc(F.why)}. The cash forecast for chapter 3 starts ${money(F.out)} out.</p>`); } return r; };

Object.assign(RAIL_LABEL, { capChallenge:"Captain's challenge", hunt:'Spot the mistake' });
SHELL_STEPS.push('capChallenge', 'hunt'); NO_BACK.push('capChallenge', 'hunt');
/* for the tests */
function ch2Report(){ return { charges:S.charges || null, pick:S.ch2pick || {}, cap:S.capCh || {}, hunts:S.hunts || {}, disc:S.fuelDiscount || 0, discUsed:S.fuelDiscountUsed || null, ch3:S.ch3Forecast || null, segs:S.rnd && S.rnd.segs ? { n:S.rnd.segs.n, ran:S.rnd.segs.ran, none:!!S.rnd.segs.none } : null, steps:S.steps.map(x => x.t + (x.seg !== undefined ? x.seg : '') + (x.day ? '@' + x.day : '')).join(' ') }; }
function capPlan(){ const st = step(); const c = st && st.t === 'capChallenge' ? (capList().find(x => x.n === st.n) || capCurrent()) : null; return c ? { n:c.n, answer:c.answer, p:capParse(c) } : null; }
function huntPlan(){ const st = step(); if(!st || st.t !== 'hunt') return null; const sp = huntSpec(st.id); return sp ? { id:st.id, wrong:sp.lines.findIndex(x => x.wrong), right:sp.right, shown:sp.lines.find(x => x.wrong).shown, n:sp.lines.length, recheck:!!st.recheck } : null; }
/* the month's results card: the charges and the closures, in words */
const periodResultsCardZ0 = periodResultsCard;
periodResultsCard = function(){ const h = periodResultsCardZ0.apply(this, arguments), L = ((S.rnd && S.rnd.why) || []).filter(w => ['💷', '🌋'].includes(w.ic)); if(!L.length) return h;
  return h.replace('<div class="dr-routes">', `<div class="dr-why">${L.map(w => `<p>${esc(w.text)}</p>`).join('')}</div><div class="dr-routes">`); };
