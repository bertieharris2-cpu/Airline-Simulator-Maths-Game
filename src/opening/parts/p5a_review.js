
/* ==================================================================
   THE SUNDAY REVIEW AS A SPREADSHEET (D96, Fable's screens brief, 17 Oct 2026; Settings reviewAsSpreadsheet).
   Left to right, in the order the pupil thinks: what happened · the figures · what to tell the finance team.
   - The three sums are cells in the week table (Profit this week, Difference from the plan, Average a day), not numbered
     panels: the cell being worked on is lit (cyan rail, soft gold edge), the others wait, dimmed. The formula builds into
     the lit cell as the pupil taps the figures; on Check the cell fills, lights green once, and keeps a ƒ with its formula.
   - The instrument on the right is the game's own Build card (the same chips, operations, Check and two tries), headed
     "Sum N · Week W · Profit this week", with the relationship in one line the first time and a hint button after.
   - No scroll jump: a redraw keeps every panel where it was scrolled to (for every page, not only the review).
   - The worth line (D88) is no longer on the review: it belongs on the plan page's result (p5b).
   Reassignment only; the Build items keep their ids (tot, diff, mean) and the cards their data attributes.
   ================================================================== */
{
const rvOn = () => WBS().reviewAsSpreadsheet !== false && settings.reviewSheet !== false;
const RV_TITLE = { tot:'Profit this week', diff:'Difference from the plan', mean:'Average a day' };
const RV_SKILL = { tot:'weekTotal', diff:'projectedVsActual', mean:'meanDay' };
const rvSeen = {};   // week|id → done, so a cell lights only when it has just been filled
/* the relationship in words: shown the first time, behind "Give me a hint" after */
function rvRel(it){
  if(it.kind === 'sum'){ const n = it.figs.length; return `add the ${['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'][n] || n} days`; }
  if(it.kind === 'diff'){ const [p, a] = it.figs; return p.v >= a.v ? 'planned − actual' : 'actual − planned (it beat the plan)'; }
  return 'total ÷ number of days';
}
const rvFirstTime = id => { const x = skills()[RV_SKILL[id]]; return !x || !x.count; };
/* the formula as it is built, for the lit cell (and the ƒ of a filled one) */
function rvFormula(it, st){
  if(it.kind === 'mean') return `${it.totalLabel} ${st.op || '?'} ${st.ok ? it.div : (st.div || '?')}`;
  return (st.tokens || []).map(t => OPS4.includes(t) ? t : ((it.figs.find(f => f.k === t) || {}).short || '')).join(' ');
}
function rvCell(it, store, active, wk){
  const st = rbState(store, it.id), key = wk + '|' + it.id;
  if(st.ok){ const fresh = !rvSeen[key]; rvSeen[key] = true;
    const v = it.kind === 'diff' ? rbResultWords(it) : money(rbValue(it));
    return `<td class="num rv-c done ${fresh ? 'rv-new' : ''}" data-rvcell="${it.id}">${v}<span class="fx" title="= ${esc(rvFormula(it, st))}">ƒ</span></td>`; }
  const lit = active && active.id === it.id, f = lit ? rvFormula(it, st) : '';
  return `<td class="num rv-c ${lit ? 'lit' : 'wait'}" data-rvcell="${it.id}">${f ? `<span class="rv-f">= ${esc(f)}</span>` : '<i class="rb-q">?</i>'}</td>`;
}
/* the game's card, as the instrument: no number, no green instruction box; the relationship in one line or a hint */
function rvCardHtml(it, st, store){
  let h = rbCardHtml(it, st, store);
  const words = rvFirstTime(it.id) || (UI.rvHint || {})[it.id];
  const rel = st.ok ? '' : words ? `<p class="rv-rel"><b>${esc(RV_TITLE[it.id])}</b> = ${esc(rvRel(it))}</p>` : `<p class="rv-rel"><button class="dk-link" data-rvhint="${it.id}">Give me a hint</button></p>`;
  h = h.replace(/<p class="rb-ask">[\s\S]*?<\/p>/, '');
  return /<p class="sum-h">/.test(h) ? h.replace(/(<p class="sum-h">[\s\S]*?<\/p>)/, '$1' + rel) : h.replace(/(<\/div>)/, '$1' + rel);
}
const rvRender0 = renderWeekReviewBuild;
renderWeekReviewBuild = function(st){
  if(!rvOn()) return rvRender0(st);
  const W = S.wk || { from:S.day - 6, rows:[], projected:0 }, h = weekSummary(W), items = weekReviewItems(W, h), store = W, wk = weekNo(W.from);
  items.forEach(it => { it.title = RV_TITLE[it.id] || it.title; });
  items.forEach((it, i) => { it.locked = i > 0 && !rbState(store, items[i - 1].id).ok; });
  const allOk = items.every(it => rbState(store, it.id).ok), active = items.find(it => !rbState(store, it.id).ok);
  if(allOk && !W.logged){ W.logged = true; rbSkill('weekTotal'); rbSkill('projectedVsActual'); if(items.some(x => x.id === 'mean')) rbSkill('meanDay');
    rbLog(['Week total (Build)', 'Projected − actual (Build)'].concat(items.some(x => x.id === 'mean') ? ['Average a day (Build)'] : [])); const mean = items.find(x => x.id === 'mean'); if(mean){ (S.means = S.means || {})[wk] = rbValue(mean); } }
  if(!W.missed && WBS().missedProfitLine !== false){ W.missed = missedProfitLine(h.profit, 7, W.from); }
  if(!W.neglect) W.neglect = neglectUpdate(W.from, W.from + 6);
  const T = items.find(x => x.id === 'tot'), M = items.find(x => x.id === 'mean'), mOk = M && rbState(store, 'mean').ok, prevMean = (S.means || {})[wk - 1], it2 = items.find(x => x.id === 'diff');
  // the figures: the seven days, then the cells to fill
  const rows = T.figs.map(f => `<tr><td>${esc(f.label)}</td><td class="num ${f.v < 0 ? 'bad' : ''}">${money(f.v)}</td></tr>`).join('')
    + `<tr class="tot"><td>Profit this week</td>${rvCell(T, store, active, wk)}</tr>`
    + `<tr class="rv-pj"><td>Projected on Monday</td><td class="num">${money(Math.round(W.projected || 0))}</td></tr>`
    + `<tr class="tot"><td>Difference from the plan</td>${rvCell(it2, store, active, wk)}</tr>`
    + (M ? `<tr class="tot"><td>Average a day</td>${rvCell(M, store, active, wk)}</tr>` : '');
  const changed = mOk ? `<p class="rb-changed">${ICO2.swap}<span>Average day: <b>${money(rbValue(M))}</b> this week${prevMean !== undefined ? `, <b>${money(prevMean)}</b> last week` : ''}.</span></p>` : '';
  const Mi = W.missed, miss = Mi ? `<div class="wk-missed ${Mi.missed > 0 ? 'warn' : 'ok'}"><span class="kl">What the best plan would have earned</span><div class="wm-row"><span>Your plan <b class="mono">${money(Mi.yours)}</b></span><span>Best plan with your planes <b class="mono">${money(Mi.best)}</b></span><span>Missed <b class="mono ${Mi.missed > 0 ? 'orange' : 'green'}">${money(Mi.missed)}</b></span></div><p class="small muted">Best plan: ${esc(Mi.bestPlan)} · about ${money(Mi.bestDay)} a day. No cash is taken.</p></div>` : '';
  const neg = W.neglect && W.neglect.length ? `<div class="wk-neglect">${W.neglect.map(n => `<p class="${n.bad ? 'orange' : 'green'}">${esc(n.text)}</p>`).join('')}</div>` : '';
  // what happened each day: the events, the day's colour (D96) and anything else the day carried
  // only what made a day different: an event, or the day's colour (D96) with what it was worth
  const dayLines = (W.rows || []).filter(r => (r.ev && r.ev.length) || r.dc).map(r => `<li><b>${esc(rbShort(r.d))}</b>${(r.ev || []).map(n => `<span>${esc(String(n))}</span>`).join('')}${r.dc ? `<span class="dc ${r.dc.delta < 0 ? 'dn' : ''}">${esc(r.dc.line)} <em>${r.dc.delta < 0 ? '−' : '+'}${money(Math.abs(r.dc.delta))}</em></span>` : ''}</li>`).join('');
  const days = dayLines ? `<section class="dk-pnl rv-days"><div class="dk-pnl-h">${ICO2.calendar}<h2>Each day</h2></div><ul>${dayLines}</ul></section>` : '';
  const what = `<div class="rbw-s rv-what"><p class="rv-col">What happened</p>${typeof seatFillReviewHtml === 'function' ? seatFillReviewHtml(h) : ''}${days}${surprisesLine(W.from, W.from + 6)}${fuelAdvantageLine(wk)}${neg}<section class="dk-pnl rv-routes"><div class="dk-pnl-h">${ICO2.route}<h2>Route performance</h2></div>${evidenceHtml(h, Object.keys(h.routes))}</section></div>`;
  const figs = `<div class="rv-mid"><p class="rv-col">The figures</p><section class="dk-pnl rbw-t"><div class="dk-pnl-h">${ICO2.calendar}<h2>The week, day by day</h2><span class="grow"></span><span class="sub">${fmtRange(W.from, W.from + 6)}</span></div><table class="dk-t rv-t">${rows}</table>${changed}</section>${miss}</div>`;
  const cards = items.filter(it => !it.locked).map(it => rvCardHtml(it, rbState(store, it.id), store)).join('');
  const done = allOk ? `<div class="rv-signed">${ICO2.check}<span>Accounts signed off. The three formulas stay in the cells: point at a <b>ƒ</b> to see one.</span></div>` : '';
  const ins = `<div class="rbw-b rv-ins"><p class="rv-col">What to tell the finance team</p>${cards}${done}</div>`;
  screen().innerHTML = shell(deskPage({ title:`How did week ${wk} go?`, sub:`Passengers ${num(h.pax)} of ${num(h.seats)} seats · cash ${money(Math.round(S.cash))}`, cls:'rbw-page rv-page', body:`<div class="rbw rvs">${what}${figs}${ins}</div>` }),
    deskBar(allOk ? 'Signed off. On to next week.' : 'Tap the lit ? and build its formula, then Check.', `<button class="btn primary big" id="nx" ${allOk ? '' : 'disabled'}>${goLabel(allOk ? 'On to next week' : 'Sign off the accounts first')} &#9654;</button>`));
  rbBind(items, store, () => {});
  const root = screen();
  root.querySelectorAll('[data-rvhint]').forEach(b => b.onclick = () => { (UI.rvHint = UI.rvHint || {})[b.getAttribute('data-rvhint')] = true; render(); });
  // tapping the lit ? takes you to its instrument; a waiting cell says what comes first
  root.querySelectorAll('[data-rvcell]').forEach(c => c.onclick = () => { const id = c.getAttribute('data-rvcell'), card = root.querySelector(`.rv-ins [data-rbcard="${id}"]`);
    if(c.classList.contains('wait')){ toast(`${RV_TITLE[id]} comes after ${RV_TITLE[(items[items.findIndex(x => x.id === id) - 1] || {}).id] || 'the one above'}.`); return; }
    if(card){ card.scrollIntoView({ block:'nearest' }); card.classList.remove('rv-ping'); void card.offsetWidth; card.classList.add('rv-ping'); const f = card.querySelector('.rb-chip, [data-rbdiv]'); if(f) f.focus({ preventScroll:true }); } });
  on('nx', () => { if(!items.every(it => rbState(store, it.id).ok)) return; resetEntry(); UI.justDone = null; UI.rvHint = {}; S.rnd.applied = true; closeDay(); });
};
/* the worth line (D88) moves to the plan page's result plate: it is not part of the week's accounts */
const rvWeekReview0 = R.weekReview;
R.weekReview = st => { const out = rvWeekReview0(st); if(rvOn()) screen().querySelectorAll('.rbw .ds-wk').forEach(e => e.remove()); return out; };

/* ---------- no scroll jump: a redraw keeps every panel where it was scrolled to ---------- */
function rvScrollKeys(){
  const root = screen(); if(!root) return [];
  const out = [], walk = (el, path) => { const kids = el.children; for(let i = 0; i < kids.length; i++){ const k = kids[i], p = path.concat(i);
    if(k.scrollTop > 0) out.push({ p, cls:k.className, top:k.scrollTop }); if(k.children.length) walk(k, p); } };
  walk(root, []); return out;
}
function rvScrollRestore(keys){
  const root = screen(); if(!root) return;
  keys.forEach(x => { let el = root; for(const i of x.p){ el = el && el.children[i]; } if(el && el.className === x.cls && el.scrollHeight > el.clientHeight) el.scrollTop = x.top; });
}
const rvRenderOuter0 = render;
render = function(){
  let keys = [], same = '';
  try{ const t = step() ? step().t : ''; if(t !== 'fly'){ keys = rvScrollKeys(); same = t + '|' + (UI.view || '') + '|' + S.si; } }catch(e){}
  const r = rvRenderOuter0.apply(this, arguments);
  try{ const t = step() ? step().t : ''; if(keys.length && same === t + '|' + (UI.view || '') + '|' + S.si) rvScrollRestore(keys); }catch(e){}
  return r;
};
}
