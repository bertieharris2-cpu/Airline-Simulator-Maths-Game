/* ==================================================================
   DECEMBER AND THE CHAPTER REVIEW (28 December 2030), and the gates for chapters 2–6.
     - December runs as a month (the tank comes back; current plan against test plan); its results are the monthly report.
     - The chapter review: the chapter's accounts, month by month, with the totals and profit by hand (HandSumRule 3) and
       projected − actual; a summary of the chapter; the long-haul decision as the hook for chapter 2.
     - Gates (Stage F): the shop's lease/buy/finance dates (p4m shopOffer), reputation hidden until reputationFromDate
       and revealed at the level earned, the Challenges and Hunts readers and the quarterly task date for the teacher panel.
   ================================================================== */
HAND_TOOLS.push('totals', 'difference');
WS_STEPS.push('chapterReview'); SHELL_STEPS.push('chapterReview', 'chapter');
STAGES.review = [{ id:'rev', name:'Review', done:'Reviewed', sub:'How did December go?', steps:['review'] }, { id:'acc', name:'Accounts', done:'Accounts done', sub:'The chapter in figures', steps:['chapterReview'] }];
Object.assign(RAIL_LABEL, { chapterReview:'Chapter accounts', chapter:'Chapter' }); Object.assign(SUB_DESC, { chapterReview:'Totals by hand' });
Object.assign(STEP_HINT, { chapterReview:'The model shows each month\'s lines. You add them up: total revenue, total costs, profit, and how far the year went from your projections.' });

/* The chapter's months from the history: revenue, costs, profit and the projections the pupil made. */
function chapterMonths(){
  const ch = WORLD.chapter || {}, a = dayOfDate(ch.start || WORLD.startDate), z = WORLD.reviewDay || S.day, out = [];
  S.history.filter(h => h.from >= a && h.from <= z).forEach(h => {
    const d = calDate(h.from), key = d.getUTCFullYear() * 12 + d.getUTCMonth(); let m = out.find(x => x.key === key);
    if(!m){ m = { key, name:MONTH[d.getUTCMonth()], short:MONTH[d.getUTCMonth()].slice(0, 3), rev:0, cost:0, profit:0, pax:0, seats:0, proj:0, projN:0, from:h.from, to:h.to }; out.push(m); }
    m.rev += h.revenue || 0; m.cost += h.costs || 0; m.profit += h.profit || 0; m.pax += h.pax || 0; m.seats += h.seats || 0; m.to = Math.max(m.to, h.to || h.from);
    if(h.proj !== undefined && h.proj !== null){ m.proj += h.proj; m.projN++; }
  });
  out.forEach(m => { ['rev', 'cost', 'profit', 'proj'].forEach(k => { m[k] = Math.round(m[k]); }); });
  return out;
}
function chapterRows(months){
  const rows = [], ids = months.map(m => m.short.toLowerCase());
  months.forEach((m, k) => rows.push({ id:'rev_' + ids[k], label:`Revenue, ${m.name}`, type:'given', unit:'£' }));
  rows.push({ id:'revTotal', label:'Total revenue', type:'calc', unit:'£', op:'+', from:ids.map(x => 'rev_' + x), sentence:ids.map(x => `{rev_${x}}`).join(' + ') + ' = {?revTotal}', tool:'totals', total:true });
  months.forEach((m, k) => rows.push({ id:'cost_' + ids[k], label:`Costs, ${m.name}`, type:'given', unit:'£' }));
  rows.push({ id:'costTotal', label:'Total costs', type:'calc', unit:'£', op:'+', from:ids.map(x => 'cost_' + x), sentence:ids.map(x => `{cost_${x}}`).join(' + ') + ' = {?costTotal}', tool:'totals', total:true });
  rows.push({ id:'profit', label:'Profit for the chapter', type:'calc', unit:'£', op:'−', from:['revTotal', 'costTotal'], sentence:'{revTotal} − {costTotal} = {?profit}', tool:'profit', total:true });
  rows.push({ id:'proj', label:'Profit you projected', type:'given', unit:'£', explain:true });
  rows.push({ id:'better', label:'Better than projected by', type:'calc', unit:'£', op:'−', from:['profit', 'proj'], sentence:'{profit} − {proj} = {?better}', tool:'difference' });
  rows.push({ id:'worse', label:'Worse than projected by', type:'calc', unit:'£', op:'−', from:['proj', 'profit'], sentence:'{proj} − {profit} = {?worse}', tool:'difference' });
  return rows;
}
R.chapterReview = st => {
  const ch = WORLD.chapter || { chapter:1, name:'Starting out' }, months = chapterMonths(), rows = chapterRows(months), ids = months.map(m => m.short.toLowerCase());
  const v = {}; months.forEach((m, k) => { v['rev_' + ids[k]] = m.rev; v['cost_' + ids[k]] = m.cost; });
  v.revTotal = months.reduce((t, m) => t + m.rev, 0); v.costTotal = months.reduce((t, m) => t + m.cost, 0); v.profit = v.revTotal - v.costTotal;
  v.proj = months.reduce((t, m) => t + m.proj, 0); v.better = v.profit - v.proj; v.worse = v.proj - v.profit;
  S.rnd.handSums = Object.assign({}, S.rnd.handSums || {}, { totals:'calc', profit:'calc', difference:'calc' });   // HandSumRule 3: the totals at every review are by hand
  const rowIds = rows.map(r => r.id).filter(id => id !== (v.better >= 0 ? 'worse' : 'better'));
  const parts = { proj: months.map(m => [`${m.name}: ${m.projN ? 'your projections' : 'no projection'}`, money(m.proj)]) };
  const tid = 'chapter:' + (ch.chapter || 1), prev = S.rnd.tables[tid];
  const t = ensureTable(tid, 'cost1', [{ id:'c', label:`Chapter ${ch.chapter || 1}`, sub:`${dateShort(dayOfDate(ch.start || WORLD.startDate))} – ${dateShort(WORLD.reviewDay || S.day)}`, values:v, parts }], { rows, rowIds });
  if(t !== prev) t.active = null; S.rnd.activeTable = t.id;
  const done = tableComplete(t);
  const pax = S.history.reduce((a, h) => a + (h.pax || 0), 0), seats = S.history.reduce((a, h) => a + (h.seats || 0), 0), opened = WORLD.routes.filter(r => S.history.some(h => h.routes && h.routes[r.id]));
  const byHand = (S.handSumLog || []).reduce((a, x) => a + x.tools.length, 0), cash0 = WORLD.startingCash || 5000;
  const summary = kv([['Passengers flown', `<span class="mono">${num(pax)}</span>`], ['Load factor', `<span class="mono">${seats ? Math.round(100 * pax / seats) : 0}%</span>`], ['Routes flown', `${opened.length}: ${opened.map(r => esc(r.city)).join(', ')}`],
    ['Fleet', S.fleet.map(f => `${esc(planeById(f.planeId).name.replace(/^DHC-6 /, ''))}${f.terms && f.terms.kind !== 'buy' ? ` (${esc(termsWord(f.terms))})` : ''}`).join(', ')], ['Cash', `<span class="mono">${money(cash0)}</span> → <span class="mono gold">${money(Math.round(S.cash))}</span>`], ['Sums by hand', `<span class="mono">${byHand}</span><small>${ch.handSumsPlanned ? ` of about ${ch.handSumsPlanned} planned` : ''}</small>`]]);
  screen().innerHTML = taskFrame({ question:`Chapter ${ch.chapter || 1}: the accounts`, work:true, calc:t,
    story: done ? [] : ['The model shows each month\'s revenue and costs. You add up the totals and work out the profit, then see how far the chapter went from what you projected.'],
    say:`The chapter's accounts. Add up the revenue, add up the costs, work out the profit, and compare it with what you projected.`,
    context:{ title:'The chapter', html: cxSec(esc(ch.name || 'Starting out'), summary) + (done ? cxSec('Next', `<p class="small">${esc(nextChapterLine())}</p>`) : '') },
    main:`<div class="cost2"><div class="c2-g"><section class="pnl c2-sheet"><div class="pnl-h"><h3>Chapter ${ch.chapter || 1} accounts</h3><span class="muted">${months.map(m => m.name).join(' · ')}</span></div><div class="sheet1">${tableHtml(t)}</div></section></div></div>`,
    foot:`<button class="btn primary big" id="nx" ${done ? '' : 'disabled'}>${done ? goLabel('Close the chapter') : 'Complete the accounts first'} &#9654;</button>` });
  bindTable(t);
  on('nx', () => { if(!st.done){ st.done = true; (S.handSumLog = S.handSumLog || []).push({ day:S.day, date:dateShort(S.day), tools:['Chapter accounts: total revenue, total costs, profit, projected − actual (Calculate)'] }); S.chapterAccounts = { revenue:v.revTotal, costs:v.costTotal, profit:v.profit, projected:v.proj }; } resetEntry(); UI.justDone = null; advance(); });
};
function nextChapterLine(){ const c2 = CHAPTERS[1]; return c2 ? `Chapter ${c2.chapter}, ${c2.name}, opens on ${dateLong(dayOfDate(c2.start))}: ${c2.newIdea || 'the long-haul decision'}. That part of the game is not built yet.` : 'Chapter 2 is not in the workbook yet.'; }

/* ---------- the chapter banner at the chapter's start (chapter 1 on Launch Day; later chapters are read, not shown) ---------- */
R.chapter = st => {
  const ch = chapterOf(S.day || 1) || CHAPTERS[0] || { chapter:1, name:'Starting out' };
  /* week-1 review: centred, one line at a time, the arriving mechanics as a list, the maths line kept for the teacher's notes only */
  const arriving = String(ch.mechanicsArriving || '').split(/;\s*/).map(x => x.trim()).filter(Boolean).filter(x => !/crew/i.test(x) || typeof crewOn !== 'function' || crewOn());   // crew duty waits for chapter 2
  const lines = [`<span class="label">${esc(dateLong(dayOfDate(ch.start)))} – ${esc(dateLong(dayOfDate(ch.end)))}</span>`, `<h1>${esc(ch.name)}</h1>`, `<p>${esc(ch.newIdea || '')}</p>`]
    .concat(arriving.length ? [`<span class="ms-kl">Arriving this chapter</span>`, `<ul class="ms-list ${arriving.length > 6 ? 'cols' : ''}">${arriving.map(x => `<li>${esc(x.charAt(0).toUpperCase() + x.slice(1))}</li>`).join('')}</ul>`] : [])
    .concat([`<button class="btn primary big" id="chGo">Begin &#9654;</button>`]);
  screen().innerHTML = shell(`<div class="hp milestone chap">${hqHead(`Chapter ${ch.chapter}`, 'CHAPTER')}<div class="ms-in">${lines.map((l, i) => l.replace(/^<(\w+)/, `<$1 style="--i:${i}"`)).join('')}</div></div>`);
  on('chGo', () => { UI.view = null; next(); });
};

/* ---------- gates for chapters 2–6: dates read from Settings, Challenges and Hunts; nothing fires in chapter 1 ---------- */
function gateDay(key){ const v = SET[key]; if(!v) return null; const d = String(v).match(/\d{4}-\d{2}-\d{2}/); return d ? dayOfDate(d[0]) : null; }
function repLive(){ const d = gateDay('reputationFromDate'); return !!(d !== null && S && S.day >= d) || !!(WORLD.reputationOn); }
/* When reputation goes live the stars appear at the level earned so far (the banked event stars). */
function revealReputation(){ if(!S || S.repRevealed || !repLive()) return; S.rep = clamp(Math.round(((WORLD.startingReputation || 3) + (S.repBank || 0)) * 2) / 2, 1, 5); S.repRevealed = true; }
function challengesFrom(day){ return (WB && WB.challenges || []).filter(c => c.fromDate).map(c => Object.assign({ day:dayOfDate(c.fromDate) }, c)).sort((a, b) => a.day - b.day).filter(c => c.day >= (day || 0)); }
function nextChallenge(day){ const used = S && S.challengesDone || []; return challengesFrom(0).find(c => !used.includes(c.n) && c.day <= (day === undefined ? S.day : day)) || null; }
function huntsFrom(){ return (WB && WB.hunts || []).map(h => Object.assign({ day:dayOfDate(h.date) }, h)).sort((a, b) => a.day - b.day); }
function quarterlyTaskDue(day){ const d = gateDay('quarterlyTaskFromDate'); return d !== null && (day === undefined ? S.day : day) >= d; }
function gatesHtml(){
  const day = S ? S.day : 1, row = (k, v) => `<tr><td>${k}</td><td>${v}</td></tr>`, when = key => { const d = gateDay(key); return d === null ? `<i class="muted">${SET[key] === undefined ? 'not on the sheet (placeholder)' : esc(String(SET[key]))}</i>` : `${dateShort(d)} ${calDate(d).getUTCFullYear()} · ${d <= day ? 'open' : `day ${d}`}`; };
  const ch = CHAPTERS.map(c => `${c.chapter}. ${esc(c.name)}: ${esc(c.start)} – ${esc(c.end)}${c.chapter === (chapterOf(day) || {}).chapter ? ' <b>(now)</b>' : ''}`).join('<br>');
  const chl = challengesFrom(0), hunts = huntsFrom();
  return `<table class="t-log">${row('Chapters', ch || 'none loaded')}${row('Lease from', when('leaseFromDate'))}${row('Buy from', when('buyFromDate'))}${row('Finance from', when('financeFromDate'))}${row('Reputation from', when('reputationFromDate'))}${row('Quarterly task from', when('quarterlyTaskFromDate'))}
    ${row("Captain's challenges", chl.length ? chl.map(c => `${dateShort(c.day)} ${calDate(c.day).getUTCFullYear()}: ${esc(c.title)}`).join('<br>') : 'none live')}${row('Hunts', hunts.length ? hunts.map(h => `${dateShort(h.day)}: ${esc(h.whatIsWrong || h.id)}`).join('<br>') : 'none live (the Hunts sheet is placeholder)')}</table>`;
}
function renderDiag(){ const g = $('tGates'); if(g && S) g.innerHTML = gatesHtml(); renderDiagBase(); }   // renderDiagBase is the toolkit's (p4e); a function alias would hoist onto itself

/* The month's test-plan controls (p4f R.plans) edit the fleet plan through editPlan; the first departure steps by 15 minutes. */
function changePlan(i, key, d){
  const [what, id] = key.split('|');
  if(what !== 'dep'){ editPlan(i, what, id, d, 0); return; }
  const pl = i === 9 ? testPlan() : currentPlan(), next = normPlan(JSON.parse(JSON.stringify(pl)));
  next.firstDep = clamp((next.firstDep || firstDep()) + 15 * d, DEP_MIN, DEP_MAX); next.fleet.forEach(x => { x.deps = null; }); normPlan(next);
  const ok = withPlan(next, () => next.fleet.every(x => !x.sched.length || fitsFor(x)));
  if(!ok){ toast("That timetable won't fit in the day."); return; }
  setPlan(i, next);
}
