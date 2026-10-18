/* =====================================================================
   THE SUNDAY REVIEW, BATCH 2 (Claude Design handover 18 Oct: 3.5 Option A "formula bar on the sheet"; DESIGN.md "Review
   sums"). Year one only; later weeks keep D96's review (p5a).
   Three columns: what happened (seat fill, each day, route performance on two lines a route so nothing scrolls sideways);
   the week's sheet as the hero, with a formula bar above it; and the finance team's card (the gold SUM n, the formula in
   words, the answer box and Check).
   - The pupil builds each sum by tapping the sheet's own cells into the formula bar (+ − × ÷ and Undo at its end; "÷ 7 days"
     as a chip for the average), then works it out in the book and types the answer. Check judges the formula (the game's
     own rules and notes, two tries), then the answer (two tries; then Finance shows it). Both go to the record under the
     sum's one number, as the worth callout's do.
   - Sums: Profit this week = add the seven days; Difference = Projected on Monday − Profit this week (the larger first);
     Average a day = Profit this week ÷ 7.
   - "How good was the plan?" (D87) appears once the accounts are signed off, under the signed-off note.
   Tests keep their handles: [data-rbcard], [data-rbfig="id|k"], [data-rbop="id|op"], [data-rbchk], [data-rbundo]; the
   answer is [data-rbans], the average's chip [data-rbdivchip]. rbPlan() gives the answer too (the tests and the teacher's test kit use it).
   ===================================================================== */
const RV2_TITLE = { tot:'Profit this week', diff:'Difference from the plan', mean:'Average a day' };
const rv2On = () => !!S && yearOne() && WBS().reviewAsSpreadsheet !== false && settings.reviewSheet !== false;
const rv2Seen = {};   // week|id → filled, so a cell lights only when it has just been filled
/* each figure the sums use, by the sheet's own row names */
function rv2Name(it, k){ if(it.kind === 'mean') return 'Profit this week'; if(it.kind === 'diff') return k === 'proj' ? 'Projected on Monday' : 'Profit this week'; const f = it.figs.find(x => x.k === k); return f ? f.label : k; }
function rv2Words(it){
  if(it.kind === 'sum') return [RV2_TITLE.tot, `add the ${['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'][it.figs.length] || it.figs.length} days`];
  if(it.kind === 'diff'){ const [p, a] = it.figs; return ['Difference', p.v >= a.v ? 'Projected on Monday − Profit this week' : 'Profit this week − Projected on Monday']; }
  return [RV2_TITLE.mean, `Profit this week ÷ ${it.div}`]; }
function rv2Op(it){ return it.kind === 'sum' ? '+' : it.kind === 'diff' ? '−' : '÷'; }
function rv2Ops(it){ return it.kind === 'mean' ? [it.total, it.div] : it.kind === 'diff' ? it.figs.map(f => f.v).sort((a, b) => b - a) : it.figs.map(f => f.v); }
/* the formula as tapped, in the sheet's words: "Mon 2 + Tue 3 + …", "Profit this week ÷ 7 days" */
function rv2Formula(it, st){
  if(it.kind === 'mean'){ const t = (st.tokens || []).length ? 'Profit this week' : ''; return [t, st.op || '', st.div ? `${st.div} days` : ''].filter(Boolean).join(' '); }
  return (st.tokens || []).map(k => OPS4.includes(k) ? k : rv2Name(it, k)).join(' '); }
/* the event lines, short: "Red Kite Air is undercutting you: Advertise (£300). +½ star." */
function rv2DayLine(t){ const s = String(t), i = s.indexOf(': '); if(i < 0) return s;
  const title = s.slice(0, i).replace(/[!.]+$/, ''), rest = s.slice(i + 2), j = rest.indexOf('. '), label = (j < 0 ? rest : rest.slice(0, j)).replace(/\.$/, ''), why = j < 0 ? '' : rest.slice(j + 2);
  const star = (why.match(/[+−-]\s?(?:\d+)?½?\s?stars?/) || [])[0]; return `${title}: ${label}.${star ? ' ' + star + '.' : ''}`; }
/* the record: the typed answer under the sum's own key, beside its Build */
function rv2Rec(it, ok, raw, v){
  try{ const [l, r] = rv2Words(it), q = it.kind === 'mean' ? `${money(it.total)} ÷ ${it.div}` : rv2Ops(it).map(x => money(x)).join(` ${rv2Op(it)} `);
    const e = recOpen('rb:' + it.id, { type:'calc', relKey:it.kind === 'sum' ? 'weekTotal' : it.kind === 'diff' ? 'projectedVsActual' : 'meanDay', doc:`Week ${weekNo(S.wk.from)} accounts: ${RV2_TITLE[it.id]}`,
      ask:`${l} = ${r}`, question:q, unit:'£', correct:rbValue(it), correctText:money(rbValue(it)), ops:rv2Ops(it), op:rv2Op(it), level:'Calculate' });
    recAttempt(e, { ok, given:raw, value:v, method:'worked on paper, answer typed' }); }catch(e){} }
/* Check: the formula first (the game's rules and notes), then the answer from the book */
function rv2Check(it, st){
  const raw = String(st.entry || '').trim();
  if(!st.built){
    if(it.kind === 'mean' && !(st.tokens || []).includes('total')){ st.msg = 'Start with the cell that holds the total: tap Profit this week.'; return; }
    if(!rbCheck(it, st)) return;
    st.formula = rv2Formula(it, st); st.built = true; st.ok = false; st.q = false;
    if(!raw){ st.msg = st.shown ? 'Checked by Finance: the formula is in the bar. Now work it out in your book and type the answer.' : 'The formula is right. Now work it out in your book and type the answer.'; return; }
    if(!st.shown) st.msg = '';
  }
  if(!raw){ st.msg = 'Work it out in your book, then type the answer.'; return; }
  const v = parseCell('£', raw), want = rbValue(it);
  if(v === null){ st.q = true; st.msg = 'Query: that is not a figure. One more try.'; return; }
  if(Math.abs(v - want) < 0.5){ st.ok = true; st.q = false; st.msg = ''; rv2Rec(it, true, raw, v); return; }
  st.atries = (st.atries || 0) + 1; rv2Rec(it, false, raw, v);
  if(st.atries >= 2 && twoTriesOn()){ st.ok = true; st.ashown = true; st.q = false; st.msg = ''; try{ paperRecShown('rb:' + it.id); }catch(e){} return; }
  st.q = true; st.msg = `Query: ${paperWrongNote(v, want, '£', rv2Op(it), rv2Ops(it))} One more try.`;
}
/* what happened: the seat fill as three figures (the D96 panel's handles), the days with an event, each route on two lines */
function rv2SeatHtml(h){
  const R = Object.values((h && h.routes) || {}), seats = R.reduce((t, x) => t + (x.seats || 0), 0), pax = R.reduce((t, x) => t + (x.pax || 0), 0), away = R.reduce((t, x) => t + Math.max(0, (x.want || x.pax || 0) - (x.pax || 0)), 0);
  if(!seats) return '';
  return `<section class="bv-panel support st-rv rv2-seat"><div class="rv2-ph"><h2>Seat fill</h2><span>${num(pax)} of ${num(seats)} seats</span></div><div class="st-rvf rv2-f3">
    <span><small>Seats filled</small><b>${Math.round(100 * pax / seats)}%</b></span><span><small>Empty seats</small><b>${num(seats - pax)}</b></span><span><small>We couldn't carry</small><b class="${away ? 'gold' : ''}">${num(away)}</b></span></div></section>`; }
function rv2RoutesHtml(h){
  const ids = Object.keys(h.routes || {}).filter(id => routeById(id) && h.routes[id]); if(!ids.length) return '';
  return `<section class="bv-panel support rv2-routes"><div class="rv2-ph"><h2>Route performance</h2></div><div class="rv2-rt"><div class="rv2-rh"><span>Route</span><span>Wanted</span><span>Seats</span><span>Flew</span></div>${ids.map(id => { const r = routeById(id), x = h.routes[id], miss = Math.max(0, (x.want || x.pax || 0) - (x.pax || 0));
    return `<div class="rv2-r"><div class="rv2-l1"><b>${esc(r.city)}</b><span>${num(x.want || x.pax || 0)}</span><span>${num(x.seats || 0)}</span><span>${num(x.pax || 0)}</span></div><div class="rv2-l2">Couldn't carry <b class="${miss ? 'gold' : ''}">${num(miss)}</b> · Fare <b>${money(x.fare)}</b> · Revenue <b>${money(Math.round(x.rev || 0))}</b></div></div>`; }).join('')}</div></section>`; }
function rv2Render(st){
  const W = S.wk || { from:S.day - 6, rows:[], projected:0 }, h = weekSummary(W), items = weekReviewItems(W, h), store = W, wk = weekNo(W.from);
  items.forEach(it => { it.title = RV2_TITLE[it.id] || it.title; });
  items.forEach((it, i) => { it.locked = i > 0 && !rbState(store, items[i - 1].id).ok; });
  const allOk = items.every(it => rbState(store, it.id).ok), active = items.find(it => !rbState(store, it.id).ok), A = active ? rbState(store, active.id) : null, building = !!(A && !A.built);
  if(allOk && !W.logged){ W.logged = true; rbSkill('weekTotal'); rbSkill('projectedVsActual'); if(items.some(x => x.id === 'mean')) rbSkill('meanDay');
    rbLog(['Week total (Build, then the sum)', 'Projected − actual (Build, then the sum)'].concat(items.some(x => x.id === 'mean') ? ['Average a day (Build, then the sum)'] : [])); const mean = items.find(x => x.id === 'mean'); if(mean){ (S.means = S.means || {})[wk] = rbValue(mean); } }
  if(!W.missed && WBS().missedProfitLine !== false){ W.missed = missedProfitLine(h.profit, 7, W.from); }
  if(!W.neglect) W.neglect = neglectUpdate(W.from, W.from + 6);
  const T = items.find(x => x.id === 'tot'), D = items.find(x => x.id === 'diff'), M = items.find(x => x.id === 'mean'), mOk = M && rbState(store, 'mean').ok, prevMean = (S.means || {})[wk - 1];
  // a cell the sum being built may use is tappable; a tapped one is outlined; the sum's own cell is the magenta ?
  const tap = k => building ? `data-rbfig="${active.id}|${k}" role="button" tabindex="0"` : '';
  const tapped = k => building && (A.tokens || []).includes(k) ? 'on' : '';
  const cellOf = it => { if(!it) return '<td class="num rv2-c"></td>'; const s = rbState(store, it.id), key = wk + '|' + it.id;
    if(s.ok){ const fresh = !rv2Seen[key], dw = it.kind === 'diff' ? rbResultWords(it).replace(/^£[\d,]+\s*/, '') : ''; rv2Seen[key] = true;
      return `<td class="num rv2-c done ${dw ? 'dw' : ''} ${fresh ? 'rv2-new' : ''}" data-rvcell="${it.id}">${money(rbValue(it))}<span class="fx" title="= ${esc(s.formula || rv2Words(it)[1])}">ƒ</span>${dw ? `<small class="rv2-dw">${esc(dw)}</small>` : ''}</td>`; }
    return active && active.id === it.id ? `<td class="num rv2-c lit" data-rvcell="${it.id}"><i class="rb-q">?</i></td>` : `<td class="num rv2-c wait" data-rvcell="${it.id}"></td>`; };
  const fig = (label, v, k, cls) => `<tr class="${k ? 'tap' : ''} ${cls || ''}"><td>${esc(label)}</td><td class="num ${k ? tapped(k) : ''} ${v < 0 ? 'bad' : ''}" ${k ? tap(k) : ''}>${money(v)}</td></tr>`;
  const usesTot = building && active.id !== 'tot', totOk = rbState(store, 'tot').ok, totK = active && active.id === 'diff' ? 'act' : 'total';
  const rows = T.figs.map(f => fig(f.label, f.v, building && active.id === 'tot' ? f.k : null)).join('')
    + (totOk ? `<tr class="${usesTot ? 'tap' : ''}"><td>Profit this week</td><td class="num rv2-c done ${usesTot ? tapped(totK) : ''}" ${usesTot ? tap(totK) : ''}>${money(rbValue(T))}<span class="fx" title="= ${esc(rbState(store, 'tot').formula || rv2Words(T)[1])}">ƒ</span></td></tr>`
      : `<tr class="${active && active.id === 'tot' ? 'rv2-lit' : ''}"><td>Profit this week</td>${cellOf(T)}</tr>`)
    + fig('Projected on Monday', Math.round(W.projected || 0), building && active.id === 'diff' ? 'proj' : null, 'rv2-pj')
    + `<tr class="${active && active.id === 'diff' ? 'rv2-lit' : ''}"><td>Difference from the plan</td>${cellOf(D)}</tr>`
    + (M ? `<tr class="${active && active.id === 'mean' ? 'rv2-lit' : ''}"><td>Average a day</td>${cellOf(M)}</tr>` : '');
  const changed = mOk ? `<p class="rb-changed">${ICO2.swap}<span>Average day: <b>${money(rbValue(M))}</b> this week${prevMean !== undefined ? `, <b>${money(prevMean)}</b> last week` : ''}.</span></p>` : '';
  // the formula bar: what the pupil has tapped, then + − × ÷ (and the average's chip) and Undo
  const f = active ? rv2Formula(active, A) : '';
  const bar = active ? `<div class="rv2-bar ${A.built ? 'built' : ''}" role="group" aria-label="Formula for ${esc(active.title)}"><span class="rv2-fx">FX</span><span class="rv2-f ${f ? '' : 'ph'}">${f ? esc(f) : 'Tap the cells you need…'}</span>
      ${A.built ? '<span class="rv2-ok" title="The formula is right">✓</span>' : `<span class="rv2-ops">${OPS4.map(o => `<button class="rv2-ob ${active.kind === 'mean' && A.op === o ? 'on' : ''}" data-rbop="${active.id}|${o}" aria-label="${o}">${o}</button>`).join('')}${active.kind === 'mean' ? `<button class="rv2-chip ${A.div ? 'on' : ''}" data-rbdivchip="${active.id}">÷ ${active.div} days</button>` : ''}<button class="bv-link rv2-undo" data-rbundo="${active.id}">Undo</button></span>`}</div>`
    : `<div class="rv2-bar built"><span class="rv2-fx">FX</span><span class="rv2-f ph">Signed off: point at a ƒ to see its formula.</span></div>`;
  const sheet = `<section class="bv-panel rv2-sheet rbw-t"><div class="rv2-ph"><h2>The week, day by day</h2><span>${fmtRange(W.from, W.from + 6)}</span></div><table class="rv2-t">${rows}</table>${changed}</section>`;
  const dayLines = (W.rows || []).filter(r => (r.ev && r.ev.length) || r.dc).map(r => `<li><b>${esc(rbShort(r.d))}</b> ${(r.ev || []).map(n => `<span>${esc(rv2DayLine(n))}</span>`).join(' ')}${r.dc ? ` <span class="dc ${r.dc.delta < 0 ? 'dn' : ''}">${esc(r.dc.line)} ${r.dc.delta < 0 ? '−' : '+'}${money(Math.abs(r.dc.delta))}</span>` : ''}</li>`).join('');
  const neg = W.neglect && W.neglect.length ? `<div class="wk-neglect">${W.neglect.map(n => `<p class="${n.bad ? 'orange' : 'green'}">${esc(n.text)}</p>`).join('')}</div>` : '';
  const what = `<div class="rv2-col rv2-what"><p class="bv-eyebrow rv2-ch">What happened</p>${rv2SeatHtml(h)}${dayLines ? `<section class="bv-panel support rv2-days"><div class="rv2-ph"><h2>Each day</h2></div><ul>${dayLines}</ul></section>` : ''}${surprisesLine(W.from, W.from + 6)}${fuelAdvantageLine(wk)}${neg}${rv2RoutesHtml(h)}</div>`;
  const Mi = W.missed, miss = Mi ? `<div class="wk-missed ${Mi.missed > 0 ? 'warn' : 'ok'}"><span class="kl">What the best plan would have earned</span><div class="wm-row"><span>Your plan <b class="mono">${money(Mi.yours)}</b></span><span>Best plan with your planes <b class="mono">${money(Mi.best)}</b></span><span>Missed <b class="mono ${Mi.missed > 0 ? 'orange' : 'green'}">${money(Mi.missed)}</b></span></div><p class="small muted">Best plan: ${esc(Mi.bestPlan)} · about ${money(Mi.bestDay)} a day. No cash is taken.</p></div>` : '';
  // the finance team's card: SUM n, the formula in words, the answer, Check
  let card;
  if(active){ const [l, r] = rv2Words(active), stamp = A.shown ? FIN_STAMP : A.q ? cardStampHtml('q') : '';
    try{ recSeen('rb:' + active.id); }catch(e){}
    card = `<section class="bv-panel active rb-card rv2-card" data-rbcard="${active.id}"><div class="rv2-ch2"><span class="bv-sumtag">Sum ${sumNo('rb:' + active.id)}</span><span>Week ${wk}</span>${stamp}</div>
      <p class="rv2-words">${esc(l)} = ${esc(r)}</p>
      <span class="answer bv-field rv2-ans ${A.q ? 'query' : ''}"><span class="unit">£</span><input data-rbans="${active.id}" inputmode="decimal" autocomplete="off" value="${esc(A.entry || '')}" aria-label="${esc(active.title)}"></span>
      <button class="bv-btn primary rv2-chk" data-rbchk="${active.id}">Check ✓</button><p class="rv2-note">Work it out in your book, then type it.</p>
      <p class="sc-msg rb-msg rv2-msg ${A.q ? 'q' : ''}" role="status">${esc(A.msg || '')}</p></section>`; }
  else card = `<div class="rv-signed rv2-signed">${ICO2.check}<span>Accounts signed off. The three formulas stay in the cells: point at a <b>ƒ</b> to see one.</span></div>${miss}`;
  const body = `<div class="bv rv2 rbw">${what}<div class="rv2-col rv2-mid"><p class="bv-eyebrow rv2-ch">The figures</p>${bar}${sheet}</div><div class="rv2-col rv2-ins"><p class="bv-eyebrow rv2-ch">What to tell the finance team</p>${card}</div></div>`;
  screen().innerHTML = shell(deskPage({ title:`How did week ${wk} go?`, sub:`Passengers ${num(h.pax)} of ${num(h.seats)} seats · cash ${money(Math.round(S.cash))}`, cls:'rbw-page rv-page rv2-page', body }),
    deskBar(allOk ? 'Signed off. On to next week.' : 'Tap the lit ? and build its formula, then Check.', `<button class="btn primary big" id="nx" ${allOk ? '' : 'disabled'}>${goLabel(allOk ? 'On to next week' : 'Sign off the accounts first')} &#9654;</button>`));
  const root = screen(), get = id => items.find(x => x.id === id), keepEntry = () => { const i = root.querySelector('[data-rbans]'); if(i && A) A.entry = i.value; };
  root.querySelectorAll('[data-rbfig]').forEach(c => { const go = () => { keepEntry(); const [id, k] = c.getAttribute('data-rbfig').split('|'), s = rbState(store, id), it = get(id);
      if(it.kind === 'mean'){ if((s.tokens || []).length){ s.msg = s.op ? '' : 'Now how to share it: the ÷ 7 days chip.'; render(); return; } s.tokens = [k]; s.msg = ''; s.q = false; render(); return; }
      if(s.tokens.length % 2 === 1){ s.msg = 'Put an operation between the cells.'; render(); return; } s.tokens.push(k); s.msg = ''; s.q = false; render(); };
    c.onclick = go; c.onkeydown = e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); go(); } }; });
  root.querySelectorAll('[data-rbop]').forEach(b => b.onclick = () => { keepEntry(); const [id, o] = b.getAttribute('data-rbop').split('|'), it = get(id), s = rbState(store, id);
    if(it.kind === 'mean'){ if(!(s.tokens || []).length){ s.msg = 'Start with the cell that holds the total.'; render(); return; } s.op = o; s.div = undefined; s.msg = o === '÷' ? 'Divide by how many? Tap the ÷ 7 days chip.' : ''; render(); return; }
    if(s.tokens.length % 2 === 0){ s.msg = s.tokens.length ? 'Two operations in a row: tap a cell next.' : 'Start with a cell from the sheet.'; render(); return; } s.tokens.push(o); s.msg = ''; render(); });
  root.querySelectorAll('[data-rbdivchip]').forEach(b => b.onclick = () => { keepEntry(); const id = b.getAttribute('data-rbdivchip'), it = get(id), s = rbState(store, id); if(!(s.tokens || []).length){ s.msg = 'Start with the cell that holds the total.'; render(); return; } s.op = '÷'; s.div = it.div; s.msg = ''; render(); });
  root.querySelectorAll('[data-rbundo]').forEach(b => b.onclick = () => { keepEntry(); const s = rbState(store, b.getAttribute('data-rbundo')); if(s.div){ s.div = undefined; } else if(s.op){ s.op = undefined; } else (s.tokens || []).pop(); s.msg = ''; render(); });
  root.querySelectorAll('[data-rbans]').forEach(i => { i.oninput = () => { rbState(store, i.getAttribute('data-rbans')).entry = i.value; }; i.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); const c = root.querySelector(`[data-rbchk="${i.getAttribute('data-rbans')}"]`); if(c) c.click(); } }; });
  root.querySelectorAll('[data-rbchk]').forEach(b => b.onclick = () => { const id = b.getAttribute('data-rbchk'), it = get(id), s = rbState(store, id), inp = root.querySelector(`[data-rbans="${id}"]`); if(inp) s.entry = inp.value;
    rv2Check(it, s); if(s.ok && typeof liveChime === 'function' && typeof opsSoundOn === 'function' && opsSoundOn()) liveChime('ding'); render(); });
  root.querySelectorAll('[data-rvcell].wait').forEach(c => c.onclick = () => { const id = c.getAttribute('data-rvcell'); toast(`${RV2_TITLE[id]} comes after ${RV2_TITLE[(items[items.findIndex(x => x.id === id) - 1] || {}).id] || 'the one above'}.`); });
  if(A && A.built){ const ans = root.querySelector('[data-rbans]'); if(ans) setTimeout(() => { try{ if(document.activeElement !== ans && !document.querySelector('#bfLayer')) ans.focus({ preventScroll:true }); }catch(e){} }, 40); }
  on('nx', () => { if(!items.every(it => rbState(store, it.id).ok)) return; resetEntry(); UI.justDone = null; S.rnd.applied = true; closeDay(); });
}
const rv2Build0 = renderWeekReviewBuild;
renderWeekReviewBuild = function(st){ return rv2On() ? rv2Render(st) : rv2Build0(st); };
/* the tests drive the sums through rbPlan(): the cells (none once the formula is in), the chip, then the answer from the book */
const rv2Plan0 = rbPlan;
rbPlan = function(){
  const P = rv2Plan0(); if(!P || !rv2On() || step().t !== 'weekReview' || !screen().querySelector('.rv2')) return P;
  const it = weekReviewItems(S.wk, weekSummary(S.wk)).find(x => x.id === P.id); if(!it) return P;
  const st = rbState(S.wk, it.id), ans = rbValue(it), div = it.kind === 'mean' ? it.div : undefined;
  if(st.built) return { id:P.id, seq:[], ans, div };
  if(it.kind === 'mean') return { id:P.id, seq:['total'], chip:true, ans, div };
  return { id:P.id, seq:P.seq, ans }; };
