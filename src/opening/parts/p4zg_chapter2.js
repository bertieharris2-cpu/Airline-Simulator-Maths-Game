/* ==================================================================
   CHAPTER 2 "Going long" (Workbook v5.0, D68–D73): in the game since 13 Oct 2026 (once the revised Studio only).
   The beats carry on past chapter 1's review (28 Dec 2030):
     - Christmas and New Year (days 119–126) fly the winter plan by themselves, one run, then a results card;
     - chapter 2's opening week a day at a time, from the Calendar (days 127–133): Monday the plan, the run on the board,
       Sunday the review, the same week loop as chapter 1's first four weeks;
     - weeks to the end of January, months from the first Monday in February, the chapter 2 review on 31 August 2031.
   WORLD.chapter, reviewDay, weekFrom and monthFrom follow the chapter of the day, so "the opening days" (S.day < weekFrom)
   mean days 127–133 in chapter 2 as they mean days 1–28 in chapter 1.
   Functions shared with the main game are reassigned here, not redeclared (the main build stays as it was).
   ================================================================== */
const CH2 = CHAPTERS.find(c => c.chapter === 2) || null;
let CH_SPANS = [];
const buildBeatsCh1 = buildBeats;
buildBeats = function(){
  ['chapter', 'reviewDay', 'weekFrom', 'monthFrom'].forEach(k => { delete WORLD[k]; });
  buildBeatsCh1(); if(!WORLD.rounds || !WORLD.chapter) return;
  const c1 = { no:1, ch:WORLD.chapter, start:dayOfDate(WORLD.chapter.start), review:WORLD.reviewDay, weekFrom:WORLD.weekFrom, monthFrom:WORLD.monthFrom };
  CH_SPANS = [c1];
  if(CH2) CH_SPANS.push(chapter2Beats(WORLD.rounds, c1));
  const span = () => { const d = typeof S !== 'undefined' && S && S.day ? S.day : 1; return CH_SPANS.slice().reverse().find(x => d >= x.start) || CH_SPANS[0]; };
  [['chapter', 'ch'], ['reviewDay', 'review'], ['weekFrom', 'weekFrom'], ['monthFrom', 'monthFrom']].forEach(([k, f]) => Object.defineProperty(WORLD, k, { get:() => span()[f], configurable:true, enumerable:true }));
};
function beatEvents(a, z){ return WB_EVENTS.filter(e => e.date && dayOfDate(e.date) >= a && dayOfDate(e.date) <= z).map(e => Object.assign({ day:dayOfDate(e.date) }, gameEvent(e.id) || { id:e.id, title:e.title, text:e.text, info:true, effectsText:e.effects })); }
/* chapter 2's beats, appended to chapter 1's */
function chapter2Beats(R, c1){
  const start = dayOfDate(CH2.start), review = dayOfDate(CH2.reviewDate || CH2.end), hol = c1.review + 1;
  if(start > hol){   // the holiday between the chapters: the standing plan flies, nothing to plan
    const m = marketWeekOf(hol) || {}, news = [...new Set([m.headline, (marketWeekOf(start - 1) || {}).headline].filter(Boolean))];
    R.push({ date:isoOf(hol), day:hol, period:'gap', holiday:true, fuel:fuelOn(hol), prog:5, title:'Christmas and New Year', headline:'Christmas and New Year: the winter timetable flies by itself.', news, market:m, season:m.season, weather:m.weather });
  }
  const cal = CAL.filter(c => c.day >= start && c.day < review).sort((a, b) => a.day - b.day);
  cal.forEach(c => { const d = c.day;
    R.push({ date:c.date || isoOf(d), day:d, period:'day', chapterNo:2, fuel:fuelOn(d), prog:5, title:c.title || dateShort(d), headline:(c.headlines || [])[0] || '', news:(c.headlines || []).slice(),
      intro: d === start ? 'longhaul' : undefined, eventId:c.event || null, event:gameEvent(c.event), competitor:c.rivalFares || null, demandMod:modOf(c.demandChanges), demandChanges:c.demandChanges || null,
      unlocks:c.unlocks || null, jobs:c.jobs || [], gatedCalc:c.gatedCalc || null, phase:c.phase || 'day', weekend: c.phase === 'weekend' || calDate(d).getUTCDay() % 6 === 0, cal:c,
      weekPhase:c.weekPhase || null, week:c.week || weekNo(d) }); });
  let d = cal.length ? cal[cal.length - 1].day + 1 : start;
  // weeks until the first Monday of the next month ("then weekly play, then months from February")
  let monthFrom = d; while(calDate(monthFrom).getUTCDate() > 7 || calDate(monthFrom).getUTCDay() !== 1 || calDate(monthFrom).getUTCMonth() === calDate(start).getUTCMonth()) monthFrom++;
  const weekFrom = d;
  while(d < monthFrom && d < review){ const m = marketWeekOf(d) || {};
    R.push({ date:isoOf(d), day:d, period:'week', chapterNo:2, fuel:fuelOn(d), prog:5, title:'Week ' + weekNo(d), headline:m.headline || '', news: m.headline ? [m.headline] : [], market:m, season:m.season, weather:m.weather, events:beatEvents(d, d + 6) });
    d += 7; }
  while(d < review){ const m = marketWeekOf(d) || {}, end = Math.min(monthEnd(d), review - 1);
    R.push({ date:isoOf(d), day:d, period:'month', chapterNo:2, fuel:fuelOn(d), prog:5, title:monthName(d), headline:m.headline || '', news: m.headline ? [m.headline] : [], market:m, season:m.season, weather:m.weather, events:beatEvents(d, end) });
    d = monthEnd(d) + 1; }
  R.push({ date:isoOf(review), day:review, period:'review', chapterNo:2, fuel:fuelOn(review), prog:5, title:`Chapter ${CH2.chapter} review`, headline:`${CH2.name}: the chapter ends today. Time to look at the accounts.`, news:[], chapter:CH2 });
  return { no:2, ch:CH2, start, review, weekFrom, monthFrom };
}
buildBeats();

/* ---------- the holiday: HQ, the run, the results; its words; its fuel at the day's price (nobody was there to buy it) ---------- */
function holidayNow(){ const P = S && S.period; return !!(P && P.type === 'gap' && roundData(S.round).holiday); }
const stepsForCh1 = stepsFor;
stepsFor = function(b){ return roundData(b).holiday ? [{ t:'hq' }, { t:'sim' }, { t:'results' }] : stepsForCh1(b); };   // the run starts from HQ's button, so the sim step is entered (and simulated)
const PWch1 = PW;
PW = function(){ if(holidayNow()) return { now:'over Christmas and New Year', poss:"The holiday's", the:"the holiday's", span:'gap' }; return PWch1(); };
const planWordCh1 = planWord;
planWord = function(){ return holidayNow() ? 'Fly Christmas and New Year' : planWordCh1(); };
const closeWordCh1 = closeWord;
closeWord = function(){ return holidayNow() ? `On to chapter ${CH2 ? CH2.chapter : 2}` : closeWordCh1(); };
const emergencyFuelCh1 = emergencyFuel;
emergencyFuel = function(short, day){
  if(!holidayNow()) return emergencyFuelCh1(short, day);
  const L = Math.ceil(short - 1e-9), ppl = r2(fuelOn(day)), bill = r2(L * ppl);
  fuelLots().push({ L, p:ppl }); S.fuel = r2(S.fuel + L); S.fuelValue = r2(S.fuelValue + bill); S.cash = r2(S.cash - bill);
  S.holidayFuel = { L:r2(((S.holidayFuel || {}).L || 0) + L), bill:r2(((S.holidayFuel || {}).bill || 0) + bill) };
  return { L, ppl, bill };
};

/* ---------- moving between the chapters ---------- */
const closeDayWeekCh1 = closeDayWeek;
closeDayWeek = function(){
  const P = S.period, nb = P ? beatStartingOn(P.to + 1) : null, nxt = nb !== null ? WORLD.rounds[nb] : null;
  // the holiday ends on chapter 2's first day: a day beat, started as a day (the plan, the shop, the sums)
  if(S.phase === 'round' && P && P.type !== 'day' && nxt && nxt.period === 'day'){ UI.view = null; UI.fbI = 0; if(typeof attachArchive === 'function') attachArchive(); startProtoDay(nb); return; }
  // chapter 2's Sunday review leads straight into the weeks (the regular plan was approved in chapter 1)
  if(S.phase === 'round' && P && P.type === 'day' && weekPhaseOf(S.round) === 'review' && roundData(S.round).chapterNo === 2){ const n2 = S.round + 1, w2 = WORLD.rounds[n2];
    if(w2 && w2.period !== 'day'){ UI.view = null; UI.fbI = 0; if(typeof attachArchive === 'function') attachArchive(); delete S.wk; startBeat(n2); return; } }
  return closeDayWeekCh1();
};
/* the chapter's end: chapter 1's card leads on to the holiday; chapter 2's says what comes next */
const protoEndCh1 = R.protoEnd;
R.protoEnd = st => {
  const nb = nextBeat(S.day), ch = WORLD.chapter || {};
  protoEndCh1(st);
  const p = screen().querySelector('.proto-end p.muted'), H = (S.history || []).filter(h => h.type !== 'setup' && h.from >= dayOfDate(ch.start || WORLD.startDate));
  const px = screen().querySelectorAll('.pe-grid > div')[2]; if(px && ch.chapter > 1){ const b = px.querySelector('b'); if(b) b.textContent = num(H.reduce((t, h) => t + (h.pax || 0), 0)); }
  if(nb !== null && CH2 && ch.chapter === 1){
    delete S.finished;
    if(p) p.innerHTML = `Next: Christmas and New Year, when the winter timetable flies by itself. Then <b>chapter ${CH2.chapter}, ${esc(CH2.name)}</b>, opens on ${esc(dateLong(dayOfDate(CH2.start)))}: New York, Dubai and the long-haul planes.`;
    const row = screen().querySelector('.proto-end .row'); if(row) row.insertAdjacentHTML('afterbegin', `<button class="btn primary big" id="peNext">On to Christmas and New Year &#9654;</button>`);
    const again = $('again'); if(again) again.classList.remove('primary');
    on('peNext', () => { delete S.finished; startBeat(nb); });
    publish(); return;
  }
  if(ch.chapter === 2 && p){ const buy = (WORLD.settings || {}).buyFromDate; p.innerHTML = `Next: chapter 3, buying aircraft outright${buy ? `, from ${esc(dateLong(dayOfDate(buy)))}` : ''}. That part of the game is not built yet.`; }
};
/* ---------- the best-plan sweep at chapter 2's size ----------
   The sweep (p4v bestPlanSweep) tries every mix of up to four services from every route an aircraft can reach. Chapter 1's
   planes reach a handful of routes; a 757 reaches all sixteen, which is thousands of plans for each review. From chapter 2
   each aircraft type tries its eight most promising routes (one full service's profit at the route's base fare) and the
   routes it flies now. Chapter 1's sweep is unchanged. */
let SWEEP_ROUTES = null;
const sweepCh1 = bestPlanSweep;
bestPlanSweep = function(from){
  const d0 = from || (S.wk && S.wk.from) || S.day; if(!CH2 || d0 < dayOfDate(CH2.start)) return sweepCh1(from);
  SWEEP_ROUTES = { day:d0 }; try{ return sweepCh1(from); } finally { SWEEP_ROUTES = null; }
};
const planeCanFlyCh1 = planeCanFly;
planeCanFly = function(plane, route){
  if(!planeCanFlyCh1(plane, route)) return false; if(!SWEEP_ROUTES) return true;
  const top = SWEEP_ROUTES[plane.id] || (SWEEP_ROUTES[plane.id] = sweepRoutesFor(plane, SWEEP_ROUTES.day)); return top.includes(route.id);
};
function sweepRoutesFor(p, day){
  const flown = S.fleet.filter(f => f.planeId === p.id).flatMap(f => schedOf(f)), est = r => Math.min(p.seats, paxFor(r, r.basePrice)) * r.basePrice - runCostOf(p, r) - fuelForTrip(p, r) * fuelOn(day);
  const top = openRoutes(day).filter(r => planeCanFlyCh1(p, r)).map(r => [r.id, est(r)]).sort((a, b) => b[1] - a[1]).slice(0, 8).map(x => x[0]);
  return [...new Set(top.concat(flown))];
}

/* the chapter review's "What comes next": chapter 2 after chapter 1 (built now), chapter 3 after chapter 2 (not yet) */
const nextChapterLineCh1 = nextChapterLine;
nextChapterLine = function(){
  const ch = WORLD.chapter || {}; if(ch.chapter === 1 && CH2) return `Christmas and New Year fly by themselves, then chapter ${CH2.chapter}, ${CH2.name}, opens on ${dateLong(dayOfDate(CH2.start))}: ${CH2.newIdea || 'long haul'}.`;
  if(ch.chapter === 2){ const buy = (WORLD.settings || {}).buyFromDate; return `Chapter 3 opens${buy ? ` on ${dateLong(dayOfDate(buy))}` : ''}: buying aircraft outright. That part of the game is not built yet.`; }
  return nextChapterLineCh1();
};

/* an older v2 save that stopped at chapter 1's end can carry on */
function chapterEndCanContinue(){ return !!(S && S.finished && CH2 && nextBeat(S.day) !== null && (WORLD.chapter || {}).chapter === 1); }
