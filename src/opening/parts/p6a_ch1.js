/* =====================================================================
   CHAPTER ONE, 30 OCT 2026 — THE RULES (Fable's hand-off 1 with workbook v6.2; Bertie's decisions of 22 and 30 Oct).
   Chapter-one code lives in the p6 parts (Bertie, 30 Oct: "keep chapter one separate, for faster updates"):
     p6a_ch1.js   the rules: the build's end, what is parked, the second plane, the questions at each pause (this file)
     p6b_signal.js the sheets: the Question Signal, the week's accounts, Launch Day (hand-off 2, sections 1-4)
     p6c_desks.js  the what-if fares, the fuel order, the full-width timetable, the Briefings shelf (sections 5-8)
   Everything here is gated on ch1() (the game date: Launch Day to the chapter-one review, 28 Dec 2030); later chapters
   keep today's behaviour and are not reached while Settings buildEndsAfterChapter = 1 (settings.fullBuild lifts it for
   the chapter 2-4 tests and a teacher who wants the rest).
   ===================================================================== */
function ch1End(){ const c = (typeof CHAPTERS !== 'undefined' ? CHAPTERS : []).find(x => +x.chapter === 1); return c ? dayOfDate(c.end) : 118; }
function ch1(day){ const d = day === undefined ? ((typeof S !== 'undefined' && S && S.day) || 1) : day; return d <= ch1End(); }
const c1Off = v => v === false || /^(false|off|parked|no|retired)/i.test(String(v === undefined || v === null ? '' : v).trim());
const c1Parked = v => /^(parked|retired)/i.test(String(v || '').trim());
/* two game files (30 Oct 2026): airline-opening-prototype.html is chapter one only; airline-opening-full.html (built with
   build.py --full, then left alone) is the whole game as it was, and carries <script id="data-build"> so the end card is lifted */
const C1_FULL = !!document.getElementById('data-build');
function c1BuildEnds(){ const n = +WBS().buildEndsAfterChapter || 0; return n > 0 && !settings.fullBuild && !C1_FULL ? n : 0; }
function c1T(id, vars){ return h21Text(id, vars); }

/* ---------- 0. the build ends at the chapter-one review: one card, nothing after it ---------- */
const c1ProtoEnd0 = R.protoEnd;
R.protoEnd = st => {
  c1ProtoEnd0(st);
  const ch = (WORLD.chapter || {}).chapter || 1, n = c1BuildEnds(); if(!n || ch < n) return;
  S.finished = true; const root = screen(), T = c1T('build.end');
  const nx = root.querySelector('#peNext'); if(nx) nx.remove();
  const p = root.querySelector('.proto-end p.muted'); if(p) p.innerHTML = `<span class="c1-end-tag">${esc(T.eyebrow || 'TEST BUILD')}</span> ${esc((T.text || [])[0] || 'End of chapter one. This test build stops here.')}`;
  const again = $('again'); if(again) again.classList.add('primary');
};
/* a save from after the chapter-one review opens only in the full file */
const c1LoadCode0 = loadCode;
loadCode = function(code){ const s = c1LoadCode0(code); if(c1BuildEnds() === 1 && s && (s.day || 1) > ch1End()) throw new Error(`This save is from ${typeof dateLong === 'function' ? dateLong(s.day) : 'day ' + s.day}, after chapter one. This file is chapter one only: open airline-opening-full.html to play it.`); return s; };
if(typeof chapterEndCanContinue === 'function'){ const c1Cont0 = chapterEndCanContinue; chapterEndCanContinue = function(){ const ch = (WORLD.chapter || {}).chapter || 1, n = c1BuildEnds(); return n && ch >= n ? false : c1Cont0.apply(this, arguments); }; }

/* ---------- 1. the parked mechanism (hand-off 1, section 2) ----------
   The importer skips parked and retired rows (events, news, catering, daily colours, the day-override upgrade). Briefings:
   the game also knows some by its own list, so the briefing part asks here before it plays one (window.__bfBlocked): in
   chapter one a briefing the workbook marks parked, retired or test only never plays. The teacher's Briefings shelf (p6c)
   still plays any built one. */
function c1BfState(id){ const r = ((typeof WB !== 'undefined' && WB && WB.briefingShelf) || []).find(b => b.id === id); return r ? r.state : null; }
window.__bfBlocked = id => { const st = c1BfState(id); return !!st && ['parked', 'retired', 'test'].includes(st) && ch1(); };
/* flight-time sums and the Flight times page are parked (flightTimeSums); so is the Madrid screen's flight-time panel (the range check stays) */
const c1FtParked = () => ch1() && c1Off(WBS().flightTimeSums);
const c1FtNew0 = ftNew;
ftNew = function(){ return c1FtParked() ? [] : c1FtNew0.apply(this, arguments); };
if(typeof INTRO !== 'undefined' && INTRO.jets){
  const J = INTRO.jets, title0 = J.title, maths0 = J.maths, check0 = J.check;
  const reach = () => { const r = routeById('mad'), list = PLANES.filter(p => p.wb !== false && (p.shopFromDay || 1) <= S.day); return { r, km:routeKm(r), yes:list.filter(p => planeCanFly(p, r)), no:list.filter(p => !planeCanFly(p, r)) }; };
  Object.defineProperty(J, 'title', { configurable:true, get:() => c1FtParked() ? 'Madrid: range' : title0 });
  J.maths = () => { if(!c1FtParked()) return maths0(); const X = reach();
    return [[`An aircraft can fly a route only if the route's distance is within its <b>range</b>: how far it can fly without refuelling.`,
      `${esc(X.r.city)} is <b>${num(X.km)} km</b> from London. ${X.yes.length ? `${esc(h21List(X.yes.map(p => shortPlane(p))))} ${X.yes.length > 1 ? 'reach' : 'reaches'} it.` : ''} ${X.no.length ? `${esc(h21List(X.no.map(p => shortPlane(p))))} ${X.no.length > 1 ? 'do' : 'does'} not.` : ''}`]]; };
  Object.defineProperty(J, 'check', { configurable:true, get:() => { if(!c1FtParked()) return check0; const X = reach(), ok = X.yes[0], bad = X.no.slice(0, 2);
    if(!ok || !bad.length) return { q:`Madrid is ${num(X.km)} km away. Can an aircraft with a range of ${num(X.km - 200)} km fly it?`, opts:[['No', ''], ['Yes', `Its range is ${num(X.km - 200)} km, short of ${num(X.km)} km.`]], ok:0, done:`No: the route is longer than its range.` };
    const opts = [[`${shortPlane(ok)} (${num(ok.range)} km)`, '']].concat(bad.map(p => [`${shortPlane(p)} (${num(p.range)} km)`, `${num(p.range)} km is less than ${num(X.km)} km.`]));
    return { q:`Madrid is ${num(X.km)} km away. Which of these aircraft can fly it?`, opts, ok:0, done:`The ${shortPlane(ok)}: its range, ${num(ok.range)} km, covers ${num(X.km)} km.` }; } });
}

/* ---------- 2. the second plane from secondPlaneShopFromDay (day 22 since D110; the Calendar opens the shop that day) ---------- */
const c1ShopFrom = () => +WBS().secondPlaneShopFromDay || 0;
const c1Shop0 = shopPlanes;
shopPlanes = function(day){ const d = day === undefined ? S.day : day, L = c1Shop0.apply(this, arguments); return ch1(d) && c1ShopFrom() && d < c1ShopFrom() ? [] : L; };

/* ---------- 3. the questions (hand-off 1, sections 3-4; Settings countUnit, pausesPerBoundary, formulaCellsCount,
   midweekQuestions; PauseSchedule) ----------
   A pause is the boundary between two weeks: the Sunday review and the Monday plan together (from week 5 the review
   opens the Monday, and in the months it opens the month). At most pausesPerBoundary (two) counted questions a pause:
   a counted question is one figure he works out in his book and types in (a Calculate in the record); a cell he builds
   as a formula, or a figure the game works out, is not counted. Required questions come first (the time to afford on
   day 15, a new route's tickets); then, while there is room, the rest; anything over two is worked out by Finance (ƒ)
   or built as a formula. No questions between pauses. */
const c1Count = () => ch1() && typeof weekMode === 'function' && weekMode();
const c1Budget = () => Math.max(0, +(WBS().pausesPerBoundary || 2));
const c1Midweek = () => !c1Off(WBS().midweekQuestions);
/* the pause a day belongs to: Launch Day; a Sunday review in the day-by-day weeks belongs to the Monday after it; any other day
   is its own. The day-by-day weeks end where Chapters 1 runCadence starts the week skips (D110: day 36; was 29). */
function c1WeeklyFrom(){ const m = /week-skips from day (\d+)/.exec(((typeof CHAPTERS !== 'undefined' && CHAPTERS[0]) || {}).runCadence || ''); return m ? +m[1] : 29; }
function c1PauseOf(day){ const d = day || 1; return d === 1 ? 1 : (d % 7 === 0 && d < c1WeeklyFrom()) ? d + 1 : d; }
/* is today a pause (a plan day or a review day)? */
function c1PauseDay(){ if(!S) return false; if(S.phase === 'setup') return true; const w = roundData(S.round) || {};
  return w.period !== 'day' || w.weekPhase === 'plan' || w.weekPhase === 'review'; }
/* the counted questions of a pause so far: Calculate entries in the record, one per question (its key) */
const C1_SIGNOFF = /^(cell:work:|so:)/;
function c1Asked(pause, all){ const P = pause || c1PauseOf(S.day), seen = new Set();
  ((typeof rec === 'function' && rec().entries) || []).forEach(e => { if(e.type === 'calc' && c1PauseOf(e.day) === P && (all || !C1_SIGNOFF.test(e.key))) seen.add(e.key); });
  return seen.size; }
/* the sign-off cap becomes what is left of the pause's two (the cap engine counts its own Calculate items) */
const c1SoCap0 = soCap;
soCap = function(){ if(!c1Count()) return c1SoCap0.apply(this, arguments); return Math.max(0, c1Budget() - c1Asked()); };
const c1SoReserved0 = soReserved;
soReserved = function(W, point){ return c1Count() ? 0 : c1SoReserved0.apply(this, arguments); };   // the fuel order has no sum (hand-off 1, section 5)
/* room left at this pause for a question outside the cap engine (the review's difference, the Changes sheet) */
function c1Room(){ return !c1Count() || c1Asked(null, true) < c1Budget(); }
/* no mid-week questions; the flight-time sums parked */
const c1Decide0 = decideHandSums;
decideHandSums = function(L, pl){ const out = c1Decide0.apply(this, arguments); if(!out || !ch1()) return out;
  if(c1FtParked()) delete out.flightTime;
  if(!c1Midweek() && !c1PauseDay()) ['rivalStay', 'weekendDemand', 'emptySeats', 'stay', 'business', 'flightTime'].forEach(k => delete out[k]);
  ['rivalStay', 'weekendDemand'].forEach(k => { if(!c1Midweek()) delete out[k]; });   // the event and weekend tenths are mid-week sums by nature
  return out; };
/* the difference from the plan: not in week 1; first at the end of the week ReviewQuestions planned_actual names ("first: end of
   week 5" since D110; was week 4); then about every third pause, when there is room (Settings differenceCadence) */
function c1DiffFirstWeek(){ const q = ((typeof WORLD !== 'undefined' && WORLD.reviewQuestions) || (typeof WB !== 'undefined' && WB.reviewQuestions) || []).find(x => (x.questionId || x.id) === 'planned_actual') || {};
  const m = /first: end of week (\d+)/.exec(String(q.from || '')); return m ? +m[1] : 4; }
function c1DifferenceDue(day){ if(!ch1(day)) return null; const wk = weekNo(day || S.day);
  if(wk < c1DiffFirstWeek()) return false; const S2 = S.c1 || (S.c1 = {}), last = S2.diffWeek || 0;
  return last === 0 || wk - last >= 3; }
function c1DifferenceAsked(day){ const S2 = S.c1 || (S.c1 = {}); S2.diffWeek = weekNo(day || S.day); }
/* hand-off 1c, section 3 (Settings countingPriority): the slots at a pause go first to his own plan change's sums, so the
   scheduled questions (the difference, the rotating question) move from the Sunday accounts to Monday's Finance's
   questions (step c1q, p6g), after the plan is settled. "off" keeps them on Sunday. */
function c1qMoves(){ return ch1() && typeof weekMode === 'function' && weekMode() && !c1Off(WBS().countingPriority); }
/* from week 5 the Sunday review is the game's own (p5v): its difference from the plan comes about every third pause, when there
   is room, and the choice is kept on the week so it does not change between redraws */
const c1Items0 = weekReviewItems;
weekReviewItems = function(W, h){ const it = c1Items0.apply(this, arguments); if(!c1Count() || !W || !W.from || weekNo(W.from) <= 4 || !Array.isArray(it)) return it;
  if(W.c1diff === undefined && c1qMoves()) W.c1diff = false;   // the difference is Monday's question now (p6g)
  const k = W.c1diff !== undefined ? W.c1diff : (W.c1diff = !!(c1DifferenceDue(W.from + 6) && c1Room()));
  if(!k) return it.filter(x => x.id !== 'diff');
  if(!W.c1marked){ W.c1marked = true; c1DifferenceAsked(W.from + 6); } return it; };
/* the Changes sheet's difference is counted only while the pause has room; otherwise he builds it as a formula (not counted) */
if(typeof ashChangeSpec === 'function'){ const c1Chg0 = ashChangeSpec;
  ashChangeSpec = function(){ const sp = c1Chg0.apply(this, arguments);
    try{ const a = sp && sp.act; if(c1Count() && a && a.how !== 'formula' && !(rec().entries || []).some(e => e.key === a.recKey) && !c1Room()){ a.how = 'formula';
      // built as a formula, the sheet works it out: its answer is not a Calculate in the record (the build is recorded as a Formula)
      const ans0 = a.answer; a.answer = function(){ const o = recOpen, t = recAttempt; recOpen = () => null; recAttempt = () => {}; try{ return ans0.apply(this, arguments); } finally { recOpen = o; recAttempt = t; } }; } }catch(e){}
    return sp; }; }

/* ---------- 4. teacher test mode: testStart and the chapter-one pauses (hand-off 1, section 1; hand-off 2, section 0) ----------
   testStart: a new TEST airline at Launch Day with a default name and the launch-deal Twin Otter in its default livery; no
   naming, livery or plane design. It lives in the toolkit's TEST slots (the pupil's game is put aside by test mode), is
   labelled TEST and writes nothing to the pupil's record. The chapter-one pauses (Launch Day, P1 to P5, the chapter-one
   review) are TEST saves made by tools/make_ch1_jumps.js with the toolkit and embedded by the build in Jump to…. */
const C1_ID_STEPS = ['welcome', 'name', 'code', 'logo', 'paint', 'reveal', 'cert'];
function c1TestStart(){
  if(!settings.testMode && window.__tk) window.__tk.enter();   // a TEST copy first, so the pupil's game is saved apart and untouched
  const s = newState(); S = s;
  s.airline.name = String(WBS().testAirlineName || 'TEST Air'); s.airline.code = s.airline.flightCode = String(WBS().testAirlineCode || 'TE').toUpperCase().slice(0, 2);
  buyPlane(planeById('dhc6'));   // the launch-deal Twin Otter, default livery and registration
  s.steps = s.steps.filter(x => !C1_ID_STEPS.includes(x.t)); s.si = 0;
  s.test = { id:'t' + Date.now().toString(36) + Math.floor(Math.random() * 1e4), label:'TEST start · Launch Day', made:Date.now(), from:'' };
  UI.view = null; save(); render(); toast('A new TEST airline at Launch Day. Nothing here counts.');
  return true;
}
/* the button beside Jump to… on the test bar's tools and in the teacher panel's Testing box */
function c1TestButtons(){
  const add = (anchor, cls) => { if(!anchor || anchor.parentNode.querySelector('[data-c1start]')) return;
    anchor.insertAdjacentHTML('afterend', `<button class="${cls}" data-c1start title="A new TEST airline at Launch Day: no naming, livery or plane design">New TEST airline at Launch Day</button>`); };
  add(document.getElementById('tkJump'), 'tk-b'); add(document.getElementById('tJump'), 'btn small');
}
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-c1start]'); if(!b) return; e.preventDefault(); try{ if(typeof teacherClose === 'function') teacherClose(); }catch(err){} c1TestStart(); }, true);
new MutationObserver(() => { try{ c1TestButtons(); }catch(e){} }).observe(document.documentElement, { childList:true, subtree:true });
window.__c1 = { testStart:c1TestStart, pauseOf:c1PauseOf, asked:(p, all) => c1Asked(p, all), budget:c1Budget, ch1End };

/* ---------- 5. rule changes (hand-off 1, section 5) ----------
   Four services are found by trial and error: no tip tells him another flight would fit (the idle-plane tip is not shown in
   chapter one). Launch Day fuel, the shop from day 15, the fuel order without a sum and the what-if sheet are in the parts
   that draw them (p6b, p6c) and in the workbook. */
const c1Tips0 = planTipsFor;
planTipsFor = function(){ const t = c1Tips0.apply(this, arguments); return ch1() && Array.isArray(t) ? t.filter(x => x && x.id !== 'idle_plane') : t; };
