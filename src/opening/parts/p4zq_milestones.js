/* ==================================================================
   TEACHER MILESTONES (Bertie, 15 Oct 2026): "milestones for students to reach to ensure they don't become lazy and just go
   with what they have planned for. Then I can award external rewards."
   His choices: teacher only (nothing on the pupil's screen), external rewards only (no money or stars in the game), a draft
   list now that Fable finalises in a Milestones sheet (each row overrides the draft's title, words, threshold or chapters).
   - Judged from what the game already keeps: the weekly decision record (p4zi recDecisionNow: the plan, what changed, the
     projection and the profit), S.history, the month audits (S.audits), first-attempt sign-offs, S.capCh, S.hunts, fuel weeks.
   - A change counts once: the plan (each flight, its time and days, the fares, on board) must differ from both of the two
     periods before it, so a fare moved up and back counts the first time only; a change made while the board waits does
     not count. Only periods wholly inside a chapter (start to review) are judged, so the Christmas holiday is not.
   - Each milestone is kept once a chapter, with the day first reached, how many periods reached it and one line of
     evidence. The teacher ticks Awarded in the teacher panel; it is saved in the code and printed in the record.
   ================================================================== */
const MS_DEFAULT = [
  { id:'fareTest', chapters:[1, 2, 3], title:'Fare tester', words:'Changed a fare on a route they fly and kept it for the whole week or month.' },
  { id:'fullPlane', chapters:[1, 2, 3], title:'Full plane', threshold:0.9, words:'A route at least 90% full over a week or month, at a fare above its starting fare, and at a profit.' },
  { id:'onTarget', chapters:[1, 2, 3], title:'On target', threshold:0.05, words:'In a week or month with a new plan, the profit came within 5% of what the plan projected.' },
  { id:'newsReader', chapters:[1, 2, 3], title:'News reader', words:'Answered announced news in time: a higher fare or more flights for a rise in demand, a lower fare or fewer flights for a fall.' },
  { id:'firstToFly', chapters:[1, 2, 3], title:'First to fly', words:'Flew a newly opened route in the first plan after it opened.' },
  { id:'fuelAhead', chapters:[1, 2, 3], title:'Fuel ahead', threshold:1, words:'Bought fuel before the price rose, and saved money on the fuel burned.' },
  { id:'cleanSheet', chapters:[1, 2, 3], title:'Clean sheet', threshold:3, words:'Every sum in a week or month right first time (at least 3 sums).' },
  { id:'closeGap', chapters:[1, 2, 3], title:'Close the gap', threshold:0.1, words:'A month within 10% of the best plan the finance team could find.' },
  { id:'shrinkGap', chapters:[1, 2, 3], title:'Shrink the gap', words:'Missed less of the best plan\'s profit than the month before.' },
  { id:'neverCoast', chapters:[1, 2, 3], title:'Never coasting', threshold:35, words:'The whole chapter: a new plan at least every 5 weeks (every 2 months from chapter 2), and no board review for an unchanged plan.' },
  { id:'longHaulFull', chapters:[2, 3], title:'Long haul full', threshold:0.85, words:'A long-haul route at least 85% full over a month, at a profit.' },
  { id:'spotMistake', chapters:[2, 3], title:'Spot the mistake', words:'Found the mistake in a hunt.' },
  { id:'captain', chapters:[2, 3], title:'Captain\'s challenge', words:'Won a Captain\'s challenge.' },
  { id:'savedBought', chapters:[1, 2, 3], title:'Saved and bought', words:'Saved up for an aircraft for at least a week, then bought it.' }];
/* the workbook's Milestones sheet (Fable), row by row over the draft */
function msTable(){
  const rows = (typeof WB !== 'undefined' && WB && WB.teacherMilestones) || [], byId = Object.fromEntries(rows.filter(r => r && r.id).map(r => [r.id, r]));
  const chs = v => (Array.isArray(v) ? v : String(v).split(/[^0-9]+/)).map(Number).filter(n => n > 0);
  return MS_DEFAULT.map(d => { const r = byId[d.id]; if(!r) return d;
    return Object.assign({}, d, { title:r.title || d.title, words:r.teacherWords || d.words, threshold:r.threshold !== undefined && r.threshold !== null && r.threshold !== '' && !isNaN(parseFloat(r.threshold)) ? parseFloat(r.threshold) : d.threshold,
      chapters:r.chapters !== undefined && r.chapters !== null && r.chapters !== '' ? chs(r.chapters) : d.chapters }); }); }
const msRow = id => msTable().find(r => r.id === id) || {};
function msS(){ const m = S.ms || (S.ms = { v:1, got:{}, awarded:{}, ended:{}, last:null, credited:{} }); m.got = m.got || {}; m.awarded = m.awarded || {}; m.ended = m.ended || {}; m.credited = m.credited || {}; return m; }
function msWindows(){ return (CHAPTERS || []).filter(c => c.start).map(c => ({ ch:c.chapter, name:c.name, start:dayOfDate(c.start), review:dayOfDate(c.reviewDate || c.end) })); }
const msChapterOf = (from, to) => msWindows().find(w => from >= w.start && to <= w.review) || null;
function msGot(ch, id, day, evidence, from){
  const row = msRow(id); if(!row.id || !(row.chapters || []).includes(ch)) return false;
  const k = ch + ':' + id, m = msS(), g = m.got[k];
  if(g){ if(from !== undefined && (g.periods || []).includes(from)) return false; g.times = (g.times || 1) + 1; if(from !== undefined) (g.periods = g.periods || []).push(from); g.lastDay = day; g.lastEvidence = evidence; return true; }
  m.got[k] = { day, times:1, evidence, periods:from !== undefined ? [from] : [] }; return true;
}
const msDecisions = () => (S.record && S.record.entries || []).filter(e => e.type === 'decision');
/* the plan as a signature: aircraft with flights only, each flight's route, time and days; the fares flown; on board */
function msSig(plan){ if(!plan) return '';
  const fl = (plan.fleet || []).filter(x => x.flights && x.flights.length).map(x => x.uid + ':' + x.flights.map(f => `${f.route}@${f.dep}/${f.days}`).join(',')).sort();
  const fares = (plan.fares || []).filter(f => (plan.fleet || []).some(x => (x.flights || []).some(z => z.route === f.id))).map(f => f.id + '=' + f.fare).sort();
  return JSON.stringify([fl, fares, plan.onboard || '']); }
function msBoardIn(e){ return (S.audits || []).some(a => a.board && a.day >= e.from && a.day <= e.to); }
function msCounted(D, i){ if(i < 1) return false; const s = msSig(D[i].plan); if(s === msSig(D[i - 1].plan)) return false; if(i >= 2 && s === msSig(D[i - 2].plan)) return false; return !msBoardIn(D[i]); }
const msFare = (plan, id) => { const f = (plan && plan.fares || []).find(x => x.id === id); return f ? f.fare : null; };
const msFlights = (plan, id) => (plan && plan.fleet || []).reduce((n, x) => n + (x.flights || []).filter(f => f.route === id).length, 0);
const msWhen = e => `${e.label || 'Week ' + weekNo(e.from)}${typeof fmtRange === 'function' ? ', ' + fmtRange(e.from, e.to) : ''}`;
function msRoutesIn(e){ const R = {}; (S.history || []).filter(h => h.from >= e.from && h.to <= e.to).forEach(h => Object.keys(h.routes || {}).forEach(id => { const x = R[id] || (R[id] = { pax:0, seats:0, trips:0, profit:0, fares:new Set(), rows:0 }), y = h.routes[id]; x.pax += y.pax || 0; x.seats += y.seats || 0; x.trips += y.trips || 0; x.profit += y.profit || 0; if(y.fare !== undefined) x.fares.add(y.fare); x.rows++; })); return R; }
/* ---------- one period ---------- */
function msEvalEntry(D, i){
  const e = D[i], w = msChapterOf(e.from, e.to); if(!w) return; const ch = w.ch, prev = D[i - 1], counted = msCounted(D, i), R = msRoutesIn(e), days = e.to - e.from + 1, when = msWhen(e);
  // Fare tester: a counted change of a fare on a route flown before and after, held through the period
  if(counted && prev && e.from >= w.start + 7) (e.plan.fares || []).forEach(f => { const was = msFare(prev.plan, f.id), r = R[f.id];
    if(was !== null && was !== f.fare && msFlights(prev.plan, f.id) && msFlights(e.plan, f.id) && r && r.rows && r.fares.size === 1 && r.fares.has(f.fare)) msGot(ch, 'fareTest', e.from, `${f.city} ${money(was)} → ${money(f.fare)}, kept all of ${when}`, e.from); });
  // Full plane (and long haul full): seats filled over the period, at a profit, flown at least 5 times a week; short haul above its starting fare
  Object.keys(R).forEach(id => { const r = R[id], rt = routeById(id); if(!rt || !r.seats || r.profit <= 0 || r.trips * 7 / days < 5) return; const fill = r.pax / r.seats, fare = msFare(e.plan, id) || [...r.fares][0] || 0, lh = typeof lhId === 'function' && lhId(id);
    if(lh){ if(fill >= (msRow('longHaulFull').threshold || 0.85) && days >= 28) msGot(ch, 'longHaulFull', e.from, `${rt.city} ${Math.round(fill * 100)}% full at ${money(fare)} (${when})`, e.from); }
    else if(fill >= (msRow('fullPlane').threshold || 0.9) && fare > (rt.basePrice || 0)) msGot(ch, 'fullPlane', e.from, `${rt.city} ${Math.round(fill * 100)}% full at ${money(fare)} (starting fare ${money(rt.basePrice)}), ${when}`, e.from); });
  // On target: a new plan's profit within the threshold of its projection
  if(counted && e.proj && e.proj > 0 && e.actual !== null && e.actual !== undefined && Math.abs(e.actual - e.proj) <= (msRow('onTarget').threshold || 0.05) * e.proj)
    msGot(ch, 'onTarget', e.from, `${money(e.actual)} against ${money(e.proj)} projected (${Math.round(Math.abs(e.actual - e.proj) / e.proj * 1000) / 10}% off), ${when}`, e.from);
  // News reader: announced news inside this period, answered against the last plan before the announcement
  (WORLD.routeNews || []).filter(n => n.announced && n.status !== 'off').forEach(n => { const dS = dayOfDate(n.start), dE = dayOfDate(n.end), dA = dayOfDate(n.announce), key = 'news:' + n.id;
    if(msS().credited[key] || !(e.from <= dE && e.to >= dS) || dA > e.from) return; const before = D.filter(x => x.to < dA).pop(); if(!before) return;
    const up = (n.mult || 1) > 1, hit = (n.routes || []).find(id => { const f0 = msFare(before.plan, id), f1 = msFare(e.plan, id), n0 = msFlights(before.plan, id), n1 = msFlights(e.plan, id);
      return up ? ((f0 !== null && f1 !== null && f1 > f0 && n1 > 0) || n1 > n0) : ((f0 !== null && f1 !== null && f1 < f0 && n1 > 0) || n1 < n0); });
    if(hit && msGot(ch, 'newsReader', e.from, `${n.headline ? n.headline.split(/[:.]/)[0] : n.id}: ${routeById(hit).city} ${msFare(before.plan, hit) !== null && msFare(e.plan, hit) !== null && msFare(before.plan, hit) !== msFare(e.plan, hit) ? `fare ${money(msFare(before.plan, hit))} → ${money(msFare(e.plan, hit))}` : `${msFlights(before.plan, hit)} → ${msFlights(e.plan, hit)} flights a day`} (${when})`, e.from)) msS().credited[key] = e.from; });
  // First to fly: a route opened during the chapter, flown in the first plan made after it opened
  WORLD.routes.filter(r => (r.openDay || 1) > w.start && r.openDay <= e.from && r.openDay <= w.review).forEach(r => { const key = 'open:' + r.id; if(msS().credited[key]) return; if(prev && prev.from >= r.openDay) return;
    if(msFlights(e.plan, r.id) > 0 && msGot(ch, 'firstToFly', e.from, `${r.city} opened ${dateShort(r.openDay)}; flown from ${when}`, e.from)) msS().credited[key] = e.from; });
  // Fuel ahead: the fuel burned cost less than the market price, from a fuel desk purchase below a later price
  if(e.fuel && e.fuel.adv >= (msRow('fuelAhead').threshold || 1) && typeof fuelOn === 'function'){ let ahead = false; const F = S.fuelWeeks || {};
    Object.keys(F).forEach(k => (F[k].bought || []).filter(b => b.day < e.to && b.day >= e.from - 35).forEach(b => { for(let d = Math.max(e.from, b.day + 1); d <= e.to && !ahead; d++) if(fuelOn(d) > b.p + 0.001) ahead = true; }));
    if(ahead) msGot(ch, 'fuelAhead', e.from, `${money(Math.round(e.fuel.adv))} saved by buying fuel before the price rose, ${when}`, e.from); }
  // Clean sheet: every sum in the period right first time
  const sums = (S.record.entries || []).filter(x => x.type !== 'decision' && x.day >= e.from && x.day <= e.to && !/^(ch|hunt):/.test(x.key || '') && x.attempts && x.attempts.length);
  if(sums.length >= (msRow('cleanSheet').threshold || 3) && sums.every(x => x.attempts[0].ok && !x.attempts[0].shown)) msGot(ch, 'cleanSheet', e.from, `${sums.length} sums, all right first time, ${when}`, e.from);
}
/* ---------- the audits, the hunts, the challenges ---------- */
function msEvalState(){
  const A = (S.audits || []).slice().sort((a, b) => a.me - b.me);
  A.forEach((a, k) => { const w = msWindows().find(x => a.me >= x.start && a.me <= x.review); if(!w || a.share === undefined || a.share === null) return; const mon = monthName(a.me) + ' ' + calDate(a.me).getUTCFullYear();
    if(a.share <= (msRow('closeGap').threshold || 0.1)) msGot(w.ch, 'closeGap', a.day, `${mon}: ${Math.round(a.share * 100)}% of the best plan's profit missed`, a.me);
    const p = A[k - 1]; if(p && p.me >= w.start && p.share !== undefined && a.share < p.share) msGot(w.ch, 'shrinkGap', a.day, `${Math.round(a.share * 100)}% missed, down from ${Math.round(p.share * 100)}% the month before`, a.me); });
  Object.keys(S.hunts || {}).forEach(id => { const h = S.hunts[id]; if(h.state !== 'found') return; const key = 'hunt:' + id; if(msS().credited[key]) return;
    const r = (S.record && S.record.entries || []).find(e => e.key === 'hunt:' + id && e.status === 'checked'), d = r ? r.day : S.day, w = msWindows().find(x => d >= x.start && d <= x.review);
    if(w && msGot(w.ch, 'spotMistake', d, `${(r && r.doc) || 'A hunt'} (${dateShort(d)})`)) msS().credited[key] = d; });
  Object.keys(S.capCh || {}).forEach(n => { const c = S.capCh[n]; if(c.state !== 'won') return; const key = 'cap:' + n; if(msS().credited[key]) return; const d = c.won || S.day, w = msWindows().find(x => d >= x.start && d <= x.review);
    if(w && msGot(w.ch, 'captain', d, `Challenge ${n} (${dateShort(d)})`)) msS().credited[key] = d; });
}
/* ---------- the chapter: decided at its review ---------- */
function msEndChapter(w){
  const m = msS(); if(m.ended[w.ch]) return; m.ended[w.ch] = S.day;
  const D = msDecisions(), inW = D.map((e, i) => [e, i]).filter(([e]) => e.from >= w.start && e.to <= w.review); if(!inW.length || inW[0][0].from > w.start + 35) return;   // no record of the chapter's start: cannot judge
  const idleWeeks = (WORLD.settings && WORLD.settings.boardNudgeIdleWeeks) || 4, idleBoards = (S.audits || []).filter(a => a.board && a.me >= w.start && a.me <= w.review && (a.idleWeeks || 0) >= idleWeeks);
  const changes = inW.filter(([e, i]) => e.from >= w.start + 7 && msCounted(D, i)).map(([e]) => e.from), pts = [w.start + 7].concat(changes, [w.review]);
  let gap = 0; for(let k = 1; k < pts.length; k++) gap = Math.max(gap, pts[k] - pts[k - 1]);
  const max = w.ch === 1 ? (msRow('neverCoast').threshold || 35) : Math.round((msRow('neverCoast').threshold || 35) * 62 / 35);
  m.ended[w.ch] = { day:S.day, changes:changes.length, gap, idleBoards:idleBoards.length, max };
  if(!idleBoards.length && gap <= max) msGot(w.ch, 'neverCoast', w.review, `${changes.length} new plans in the chapter; the longest stretch without one was ${gap} days; no board review for an unchanged plan`);
}
/* ---------- when ---------- */
function msEval(){
  if(!S || S.phase === 'setup' || (typeof QUIET !== 'undefined' && QUIET) || !S.record) return; const m = msS(), D = msDecisions();
  D.forEach((e, i) => { if(m.last !== null && e.from <= m.last) return; try{ msEvalEntry(D, i); }catch(x){} m.last = e.from; });
  try{ msEvalState(); }catch(x){}
  msWindows().forEach(w => { if(!m.ended[w.ch] && (S.day > w.review || (S.day === w.review && ['chapterReview', 'protoEnd'].includes((step() || {}).t)))) msEndChapter(w); });
}
const msClose0 = closeDay;
closeDay = function(){ try{ if(typeof recDecisionNow === 'function') recDecisionNow(); msEval(); }catch(x){} return msClose0.apply(this, arguments); };
const msRender0 = render;
render = function(){ try{ if(S && S.phase === 'round' && ['chapterReview', 'protoEnd'].includes((step() || {}).t)) msEval(); }catch(x){} return msRender0.apply(this, arguments); };
/* Saved and bought: the saving is cleared by the purchase, so it is read first */
const msAcquire0 = acquirePlane;
acquirePlane = function(p, kind){ const w = S && S.waitFor ? Object.assign({}, S.waitFor) : null, r = msAcquire0.apply(this, arguments);
  try{ if(!QUIET && kind === 'buy' && w && S.day - w.from >= 7){ const o = planeById(w.pid), win = msWindows().find(x => S.day >= x.start && S.day <= x.review);
    if(win && (p.id === w.pid || (o && typeof shopOffer === 'function' && shopOffer(p).price >= shopOffer(o).price))) msGot(win.ch, 'savedBought', S.day, `Saved for the ${o ? shortPlane(o) : p.name} from ${dateShort(w.from)}; bought the ${shortPlane(p)} on ${dateShort(S.day)} (${S.day - w.from} days)`); } }catch(x){}
  return r; };

/* ---------- the teacher panel: below the pupil record ---------- */
function msTeacherRender(){
  const host = $('tRec'); if(!host || !S) return; let el = $('tMs');
  if(!el){ const sec = host.closest('.tsec'); if(!sec) return; sec.insertAdjacentHTML('afterend', `<div class="tsec" style="grid-column:1/-1"><h3>Milestones</h3><p class="small muted">Only you see these. They are reached from what the pupil does (a new plan, a full route, news answered, sums right first time), never from coasting on one plan. Tick Awarded when you give the reward; it is kept in the save code and printed in the record.</p><div id="tMs"></div></div>`); el = $('tMs'); }
  try{ msEval(); }catch(x){}
  const m = msS(), now = S.day || 1, wins = msWindows().filter(w => w.start <= now), rows = msTable(), got = Object.keys(m.got), aw = got.filter(k => m.awarded[k]).length;
  el.innerHTML = `<p class="small"><b>${got.length} reached</b> · ${aw} awarded${got.length > aw ? ` · <b>${got.length - aw} to award</b>` : ''}</p>` + wins.map(w => {
    const list = rows.filter(r => (r.chapters || []).includes(w.ch));
    return `<table class="so-log ms-log"><thead><tr><th colspan="4">Chapter ${w.ch}: ${esc(w.name || '')}</th></tr><tr><th>Milestone</th><th>What it takes</th><th>Reached</th><th>Awarded</th></tr></thead><tbody>${list.map(r => { const k = w.ch + ':' + r.id, g = m.got[k], end = m.ended[w.ch];
      const state = g ? `<b>${esc(dateShort(g.day))}</b>${g.times > 1 ? ` · ${g.times} times` : ''}<div class="muted">${esc(g.evidence || '')}</div>${g.times > 1 && g.lastEvidence ? `<div class="muted">Latest: ${esc(g.lastEvidence)}</div>` : ''}` : r.id === 'neverCoast' && !end ? '<span class="muted">decided at the chapter review</span>' : r.id === 'neverCoast' && end && end.gap !== undefined ? `<span class="muted">not this chapter (${end.idleBoards ? end.idleBoards + ' board review' + (end.idleBoards > 1 ? 's' : '') + ' for an unchanged plan' : 'longest stretch without a new plan ' + end.gap + ' days'})</span>` : '<span class="muted">not yet</span>';
      return `<tr><td><b>${esc(r.title)}</b></td><td>${esc(r.words)}</td><td>${state}</td><td>${g ? `<label><input type="checkbox" data-msaw="${k}" ${m.awarded[k] ? 'checked' : ''}> Awarded</label>` : ''}</td></tr>`; }).join('')}</tbody></table>`; }).join('');
  el.querySelectorAll('[data-msaw]').forEach(c => c.onchange = () => { const k = c.getAttribute('data-msaw'); if(c.checked) m.awarded[k] = S.day; else delete m.awarded[k]; save(); msTeacherRender(); });
}
const msSoTeacher0 = soTeacherRender;
soTeacherRender = function(){ msSoTeacher0.apply(this, arguments); try{ msTeacherRender(); }catch(x){} };
/* ---------- the printout: a Milestones table after the heading ---------- */
const msPrint0 = recordPrintHtml;
recordPrintHtml = function(o){ const h = msPrint0.apply(this, arguments); try{
    o = o || {}; const rg = recRange(o.range), m = msS(), rows = msTable(), list = Object.keys(m.got).map(k => { const [ch, id] = k.split(':'); return { k, ch:+ch, r:rows.find(x => x.id === id) || { title:id }, g:m.got[k] }; }).filter(x => x.g.day >= rg.from && x.g.day <= rg.to).sort((a, b) => a.g.day - b.g.day);
    if(!list.length) return h;
    const t = `<h2>Milestones</h2><table class="pt"><thead><tr><th>Reached</th><th>Milestone</th><th>Evidence</th><th>Awarded</th></tr></thead><tbody>${list.map(x => `<tr><td>${recE(dateShort(x.g.day))}${x.g.times > 1 ? ` (${x.g.times}×)` : ''}</td><td><b>${recE(x.r.title)}</b> <small>chapter ${x.ch}</small></td><td>${recE(x.g.evidence || '')}${x.g.times > 1 && x.g.lastEvidence ? `<br><small>Latest: ${recE(x.g.lastEvidence)}</small>` : ''}</td><td>${m.awarded[x.k] ? '<span class="tick">✓</span> ' + recE(dateShort(m.awarded[x.k])) : ''}</td></tr>`).join('')}</tbody></table>`;
    return h.replace('</header>', '</header>' + t); }catch(x){ return h; } };
/* for the tests */
function msReport(){ const m = msS(); return { got:Object.fromEntries(Object.entries(m.got).map(([k, g]) => [k, { day:g.day, times:g.times, evidence:g.evidence, latest:g.lastEvidence || null }])), awarded:m.awarded, ended:m.ended }; }
