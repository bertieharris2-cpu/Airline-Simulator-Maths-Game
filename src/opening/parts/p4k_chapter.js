/* ==================================================================
   CHAPTERS AND THE CALENDAR (workbook v4).
   The game is paced by the Chapters, Calendar and Market sheets, not by a beat list written in code:
     - the Chapters sheet gives each chapter its start, its review date and its cadence
       ("day → week (from day 22) → month (from Dec)");
     - the Calendar sheet is one row per played day in the set-up weeks (fuel, headlines, the event, what unlocks,
       the rival's fares, demand changes);
     - the Market sheet is one row per week after that (fuel, season, business and leisure multipliers, weather).
   From those, buildBeats() derives WORLD.rounds, the list the rest of the game reads through roundData/beatAt/
   fuelPrice: one beat per Calendar day, then one per week, then one per month, then the chapter review.
   Day 1 is the chapter's start (Monday 2 September 2030); S.day is the workbook's day number.
   ================================================================== */
Object.assign(FLAG_ASPECT, { nl:1.5, de:1.67, ch:1, be:1.15, it:1.5, pt:1.5, gr:1.5, tr:1.5, is:1.39, sco:1.67 });
const CAL = WB ? (WB.calendar || []) : [], MARKET = WB ? (WB.market || []) : [], WB_EVENTS = WB ? (WB.events || []) : [];
function isoOf(day){ const d = calDate(day); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; }
function calRow(day){ return CAL.find(c => c.day === day) || null; }
function marketWeekOf(day){ return MARKET.find(m => { const a = dayOfDate(m.weekStart); return day >= a && day <= a + 6; }) || null; }
function chapterOf(day){ day = day === undefined ? (S ? S.day : 1) : day; return CHAPTERS.find(c => day >= dayOfDate(c.start) && day <= dayOfDate(c.end)) || CHAPTERS[0] || null; }
function chapterNo(day){ const c = chapterOf(day); return c ? c.chapter : 1; }
/* Fuel on a day: the Calendar's price in the set-up weeks, then the Market week's. */
function fuelOn(day){ const c = calRow(day); if(c && c.fuel !== null && c.fuel !== undefined) return c.fuel; const m = marketWeekOf(day); return m ? m.fuel : (MARKET.length ? MARKET[MARKET.length - 1].fuel : 1.2); }
function eventById(id){ return id ? WB_EVENTS.find(e => e.id === id) || null : null; }
/* "setPrice dub=50" / "refund" → the effects object applyEvent reads. Cash and stars come from their own columns. */
function parseEffects(o){
  const e = {}; if(o.cash) e.cash = o.cash; if(o.stars) e.rep = o.stars; if(o.board) e.status = o.board;
  String(o.effects || '').split(/[;,]/).map(s => s.trim()).filter(Boolean).forEach(part => {
    const m = /^setPrice\s+(\w+)=(\w+)$/.exec(part); if(m){ (e.setPrice = e.setPrice || {})[m[1]] = m[2] === 'match' ? 'match' : +m[2]; return; }
    if(part === 'refund') e.refund = true; else if(part === 'groundNext') e.groundNext = true; else e.note = (e.note ? e.note + '; ' : '') + part; });
  return e;
}
function gameEvent(id){
  const ev = eventById(id); if(!ev || !ev.options || !ev.options.length) return null;
  return { id:ev.id, date:ev.date, title:ev.title, text:ev.text, costShare:ev.costShare, options: ev.options.map(o => ({ label:o.label, sub:o.sub || '', why:o.why || '', effects:parseEffects(o) })) };
}
function modOf(changes){ const out = {}; if(!changes) return out; Object.keys(changes).forEach(k => { const c = changes[k]; if(c && c.add !== undefined && routeById(k)) out[k] = c.add; }); return out; }
/* Which mechanics the Calendar has introduced by a day: "snacks", "fuel", "time-of-day demand", "second route", "crew duty"… */
function mechanicsBy(day){ const out = []; CAL.forEach(c => { if(c.day <= day) ((c.unlocks || {}).mechanics || []).forEach(m => out.push(m)); }); return out; }
function mechanicOn(name, day){ return mechanicsBy(day === undefined ? (S ? S.day : 1) : day).some(m => m.includes(name)); }
/* The toolkit's progress numbers (data-tools levels) from the mechanics: snacks 3.1, fuel 3.2, time of day 3.3, second route 3.4; weeks 4+; months 5. */
const MECH_PROG = [['snacks', 3.1], ['fuel', 3.2], ['time-of-day', 3.3], ['second route', 3.4]];
const MECH_INTRO = [['snacks', 'snacks'], ['fuel', 'fuel'], ['time-of-day', 'times'], ['second route', 'route']];
function progOn(day){ let p = 2; mechanicsBy(day).forEach(m => MECH_PROG.forEach(([k, v]) => { if(m.includes(k)) p = Math.max(p, v); })); return p; }

function buildBeats(){
  const ch = CHAPTERS[0]; if(!WB || !ch) return;
  const startDay = dayOfDate(ch.start), reviewDay = dayOfDate(ch.reviewDate || ch.end);
  const wk = /week \(from day (\d+)\)/.exec(ch.runCadence || ''), weekFrom = wk ? +wk[1] : CAL.length + 1;
  const mo = /month \(from (\w+)/.exec(ch.runCadence || '');
  let monthFrom = reviewDay;
  if(mo){ const mi = MONTH.findIndex(m => m.toLowerCase().startsWith(mo[1].toLowerCase().slice(0, 3))); for(let d = startDay; d <= reviewDay; d++){ if(calDate(d).getUTCMonth() === mi && calDate(d).getUTCDate() === 1){ monthFrom = d; break; } } }
  const R = [];
  for(let d = startDay; d < weekFrom && d <= reviewDay; d++){
    const c = calRow(d) || {}, first = d === startDay, mechs = (c.unlocks || {}).mechanics || [], intro = [];
    MECH_INTRO.forEach(([k, key]) => { if(mechs.some(m => m.includes(k))) intro.push(key); });
    R.push({ date:c.date || isoOf(d), day:d, period: first ? 'setup' : 'day', fuel:fuelOn(d), prog:progOn(d), title: first ? (c.title || 'Launch Day') : (c.title || 'Day ' + d),
      headline:(c.headlines || [])[0] || '', news:(c.headlines || []).slice(), intro: intro.length ? (intro.length === 1 ? intro[0] : intro) : undefined,
      eventId:c.event || null, event:gameEvent(c.event), competitor:c.rivalFares || null, demandMod:modOf(c.demandChanges), demandChanges:c.demandChanges || null,
      unlocks:c.unlocks || null, jobs:c.jobs || [], gatedCalc:c.gatedCalc || null, phase:c.phase || 'day', weekend: c.phase === 'weekend' || calDate(d).getUTCDay() % 6 === 0, cal:c });
  }
  let d = weekFrom, k = 0;
  while(d <= monthFrom && d < reviewDay){
    const m = marketWeekOf(d) || {}, evs = WB_EVENTS.filter(e => e.date && dayOfDate(e.date) >= d && dayOfDate(e.date) <= d + 6);
    R.push({ date:isoOf(d), day:d, period:'week', fuel:fuelOn(d), prog: k === 0 ? 4 : k === 1 ? 4.1 : 4.2, title:'Week ' + weekNo(d), headline:m.headline || '', news: m.headline ? [m.headline] : [],
      intro: k === 0 ? 'week' : undefined, market:m, season:m.season, weather:m.weather, events:evs.map(e => Object.assign({ day:dayOfDate(e.date) }, gameEvent(e.id) || { id:e.id, title:e.title, text:e.text, info:true, effectsText:e.effects })) });
    d += 7; k++;
  }
  let first = true;
  while(d < reviewDay){
    const m = marketWeekOf(d) || {}, end = Math.min(monthEnd(d), reviewDay - 1), evs = WB_EVENTS.filter(e => e.date && dayOfDate(e.date) >= d && dayOfDate(e.date) <= end);
    R.push({ date:isoOf(d), day:d, period:'month', fuel:fuelOn(d), prog:5, title:monthName(d), headline:m.headline || '', news: m.headline ? [m.headline] : [], intro: first ? 'tank' : undefined,
      market:m, season:m.season, weather:m.weather, events:evs.map(e => Object.assign({ day:dayOfDate(e.date) }, gameEvent(e.id) || { id:e.id, title:e.title, text:e.text, info:true, effectsText:e.effects })) });
    d = monthEnd(d) + 1; first = false;
  }
  R.push({ date:isoOf(reviewDay), day:reviewDay, period:'review', fuel:fuelOn(reviewDay), prog:5, title:`Chapter ${ch.chapter} review`, headline:`${ch.name}: the chapter ends today. Time to look at the accounts.`, news:[], chapter:ch });
  WORLD.rounds = R;
  WORLD.chapter = ch; WORLD.reviewDay = reviewDay; WORLD.weekFrom = weekFrom; WORLD.monthFrom = monthFrom;
}
buildBeats();

/* The old phase numbers (data-phases) now follow the cadence: days 1, weeks 2, months 3, the review 4. */
function phaseOf(n){ const t = periodOf(n === undefined ? S.round : n); return t === 'week' || t === 'gap' ? 2 : t === 'month' ? 3 : t === 'review' ? 4 : 1; }
/* A route is open from its unlockDay, and only if the workbook gives it a demand table. */
function routeOpen(r, day){ day = day === undefined ? (S ? S.day : 1) : day; return (r.openDay || 1) <= day && !!(r.demandAtFare || !r.wb); }
function openRoutes(day){ return WORLD.routes.filter(r => routeOpen(r, day)); }
/* Routes that opened on a day (for the day's brief). */
function routesOpening(day){ return WORLD.routes.filter(r => (r.openDay || 1) === day && day > 1); }
function beatLabel(i){ const t = periodOf(i), d = beatDay(i); if(t === 'setup') return 'Launch'; if(t === 'day') return 'Day ' + d; if(t === 'gap') return 'Fri–Sun'; if(t === 'week') return 'Week ' + weekNo(d); if(t === 'review') return 'Review'; return monthName(d, true); }
function monthNo(day){ const d = calDate(day); return (d.getUTCFullYear() - 2030) * 12 + d.getUTCMonth() - 7; }   // September 2030 = Month 1
function dayTag(n){ n = n === undefined ? (S && S.day !== undefined ? S.day : 1) : n; return S && S.phase === 'setup' ? 'Launch Day' : 'Day ' + n; }
PERIOD_CHIP.review = 'Chapter review';
/* "Thursday 5 September 2030" · "Week 4 · 23–29 September" · "December 2030" · "Chapter review · Saturday 28 December 2030" */
function periodLabel(P){
  P = P || S.period; if(!P || P.type === 'setup') return 'Launch Day';
  if(P.type === 'day') return dateLong(P.from);
  if(P.type === 'review') return `Chapter review · ${dateLong(P.from)}`;
  if(P.type === 'week') return `Week ${weekNo(P.from)} · ${fmtRange(P.from, P.to)}`;
  if(P.type === 'gap' || !isMonthSpan(P.from, P.to)) return fmtRange(P.from, P.to);
  const A = calDate(P.from), B = calDate(P.to);
  return monthStart(P.from) === monthStart(P.to) ? `${MONTH[A.getUTCMonth()]} ${A.getUTCFullYear()}` : `${MONTH[A.getUTCMonth()]}${A.getUTCFullYear() !== B.getUTCFullYear() ? ' ' + A.getUTCFullYear() : ''} – ${MONTH[B.getUTCMonth()]} ${B.getUTCFullYear()}`;
}
function periodTag(P){ P = P || S.period; if(!P || P.type === 'setup' || S.phase === 'setup') return 'Launch Day'; if(P.type === 'day') return 'Day ' + P.from; if(P.type === 'review') return 'Chapter review'; if(P.type === 'week' || P.type === 'gap') return 'Week ' + weekNo(P.from); return 'Month ' + monthNo(P.from); }
function periodShort(h){ if(!h || h.type === 'setup') return 'Launch Day'; if(h.type === 'day') return dateShort(h.from); if(h.type === 'review') return 'the chapter review'; if(h.type === 'week') return 'Week ' + weekNo(h.from); if(h.type === 'gap') return `${fmtRange(h.from, h.to)}`; return isMonthSpan(h.from, h.to) && monthStart(h.from) === monthStart(h.to) ? monthName(h.from) : `${monthName(h.from, true)}–${monthName(h.to, true)}`; }
function stepsFor(b){
  const w = roundData(b), st = w.stage ? [{ t:'milestone', stage:w.stage }] : [], L = a => withIntro(st.concat(a.map(t => ({ t }))), w);
  if(w.period === 'gap') return L(['sim', 'results']);
  if(w.period === 'week') return L((w.noReview ? ['hq'] : ['hq', 'review']).concat(['planner', 'costPlan', 'testIdeas', 'ready', 'sim', 'results']));
  if(w.period === 'month') return L(['hq', 'review', 'fuelPlan', 'plans', 'ready', 'sim', 'results']);
  if(w.period === 'review') return L(['hq', 'review', 'protoEnd']);
  return L(['hq', 'planner', 'costPlan', 'testIdeas', 'ready', 'fly', 'results']);
}
/* The day's brief: yesterday, what the Calendar brings today, routes opening, fuel. */
function protoBrief(n){
  const w = roundData(n), h = lastDay(), fp = fuelPrice(n), fy = fuelPrice(Math.max(0, n - 1)), L = [];
  if(h) L.push(`${h.type === 'setup' ? 'Launch Day' : 'Yesterday'}: ${h.pax} passengers flew, ${h.profit >= 0 ? 'profit' : 'loss'} ${money(Math.round(Math.abs(h.profit)))}. The details are in Route performance.`);
  const mech = ((w.unlocks || {}).mechanics || []).filter(m => !/^(fare|services|timetable)$/.test(m));
  if(mech.length) L.push(`New today: ${mech.join(', ')}.`);
  const opening = routesOpening(w.day);
  if(opening.some(r => WORLD.setupRoutes.includes(r.id))) L.push(`${routeById(otherRoute()).city} is now open: one aircraft, two markets.`);
  else if(opening.length) L.push(`New route${opening.length > 1 ? 's' : ''} open: ${opening.map(r => r.city).join(', ')}.`);
  if(w.event) L.push(`${w.event.title}.`);
  if(fuelPaid() && fp !== fy) L.push(`Fuel is ${priceL(fp)} a litre today (was ${priceL(fy)}).`);
  return L;
}
/* Closing a day or a period: the next beat the calendar gives, the standing plan before the first week, the chapter end after the review. */
function closeDay(){
  UI.view = null; UI.fbI = 0; if(typeof attachArchive === 'function') attachArchive();
  if(S.phase === 'setup'){ startProtoDay(1); return; }
  if(S.rnd.saving){ keepSavingDone(); return; }
  if(periodType() === 'day'){
    const nb = S.round + 1, nxt = WORLD.rounds[nb];
    if(nxt && nxt.period === 'day'){ startProtoDay(nb); return; }
    if(nxt && !S.steps.some(s => s.t === 'rop')){ S.steps.push({ t:'rop' }); next(); return; }
    if(!nxt){ S.steps.push({ t:'protoEnd' }); next(); return; }
    startBeat(nb); return;
  }
  const nb = beatStartingOn(S.period.to + 1);
  if(nb === null){ S.steps.push({ t:'protoEnd' }); next(); return; }
  startBeat(nb);
}
/* The chapter's end: a hook for chapter 2, built when chapter 2 is designed. */
R.protoEnd = () => {
  const ch = WORLD.chapter || {}, c = serviceCounts(schedOf(fleetOne()) || []), H = S.history.filter(x => x.type !== 'setup'), pax = S.history.reduce((t, x) => t + (x.pax || 0), 0);
  const nextDate = SET.leaseFromDate ? dateLong(dayOfDate(SET.leaseFromDate)) : 'January 2031';
  S.finished = true;
  screen().innerHTML = shell(`<div class="hp proto-end">${hqHead(`Chapter ${ch.chapter || 1} complete`, 'CHAPTER ' + (ch.chapter || 1))}
    <h1>${esc(ch.name || 'Starting out')}: complete</h1>${typeof strategyBadge === 'function' ? strategyBadge() : ''}
    <div class="pe-grid"><div><span class="label">Timetable</span>${Object.keys(c).map(id => `<b>${flagSvg(routeById(id).flag, 24)} ${esc(routeById(id).city)} ×${c[id]}</b>`).join('') || '<b>—</b>'}</div>
      <div><span class="label">Fleet</span><b>${S.fleet.length} aircraft</b><small>${S.fleet.map(f => planeById(f.planeId).name.replace(/^DHC-6 /, '')).join(', ')}</small></div>
      <div><span class="label">Passengers</span><b class="mono">${num(pax)}</b><small>flown this chapter</small></div>
      <div><span class="label">Cash</span><b class="mono amber">${money(Math.round(S.cash))}</b></div></div>
    <p class="lede">${esc(S.airline.name)} has flown from ${dateLong(dayOfDate(ch.start || WORLD.startDate))} to ${dateLong(dayOfDate(ch.end || ch.reviewDate))}.</p>
    <p class="muted">Next: the long-haul decision. Chapter 2 opens on ${esc(nextDate)}, when aircraft can be leased. That part of the game is not built yet.</p>
    <div class="row" style="justify-content:center"><button class="btn primary big" id="again">Play again</button><button class="btn big" id="peHome">Home</button></div></div>`);
  on('again', () => { S = newState(); S.si = 1; render(); }); on('peHome', openMenu);
};
