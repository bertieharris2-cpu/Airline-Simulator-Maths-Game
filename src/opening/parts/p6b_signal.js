/* =====================================================================
   CHAPTER ONE, 30 OCT 2026 — THE SHEETS (Bertie's hand-off 2, sections 1-4; DESIGN.md of 30 Oct: Question Signal, the
   example look, the watch panel, Σ SUM in week 2). Chapter one only (ch1(), p6a).
   - Every question on a sheet has one signal at its answer cell: Build it on the sheet (cyan: he clicks the cells, presses
     Enter, the sheet works it out; nothing in his book) or Work it out on paper (gold: in his book, Sum n beside it, the
     answer typed in the cell). The workbook's SheetSums how sets which. The signals replace the FORMULA and SUM n cards.
   - A formula he builds finishes when he presses Enter (shown as a key), never by itself.
   - The week's accounts (weeks 1-4): week 1 opens with Finance's example on made-up numbers (once); week 2 adds the week by
     clicking, then is shown Σ SUM; from week 3 Σ SUM only. The difference from the plan and the rotating review question
     come when the Calendar's gatedCalc names them (PauseSchedule). Done is two small green callouts, then Plan week n ▶.
   - Launch Day (hand-off 3, 30 Oct evening): the job first; Finance demonstrates building the first formula; he builds the
     second; the third on paper (Sum 1); then Paris and the plan fill in. Fuel on Launch Day is a cost (600 L at £1.20).
   - Hand-off 3: the key row × ÷ + − Enter beside the formula bar on every sheet; each formula cell its own colour (cyan,
     then ref-2 violet), as Excel colours each reference.
   ===================================================================== */
const c1Key = (label, attr) => `<kbd class="c1-key" ${attr || ''}>${esc(label || 'Enter')} ↵</kbd>`;
const c1SumBox = n => `<span class="c1-sumbox"><i>SUM</i><b>${esc(String(n))}</b></span>`;
/* screen text as HTML: **bold**, [A]/[B] tags, [Enter] as a key and [SUM n] as the Sum box */
function c1Html(s, n){ return h21Html(s).replace(/\[Enter\]/g, c1Key('Enter')).replace(/\[SUM (\{n\}|\d+)\]/g, (m, k) => c1SumBox(k === '{n}' ? n : k)); }
const C1_ICO = { build:'<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 1.5h13v13h-13zM1.5 6h13M1.5 10.5h13M6 1.5v13M10.5 1.5v13" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
  paper:'<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M11 1.8l3.2 3.2-8.6 8.6H2.4v-3.2z M9.4 3.4l3.2 3.2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>' };
/* the Question Signal. o: { kind:'build'|'paper', title, lines:[html], n (Sum n), tag (EXAMPLE · WATCH), btn:{ attr, label }, nothing (build: "Nothing to write in your book."), ptr:'left'|'up' } */
function c1SignalHtml(o){
  const head = c1T(o.kind === 'paper' ? 'signal.paper' : 'signal.build'), nothing = o.kind === 'build' && o.nothing !== false ? (head.text[0] || 'Nothing to write in your book.') : '';
  return `<aside class="c1-sig ${o.kind === 'paper' ? 'paper' : 'build'} ptr-${o.ptr || 'left'}" data-c1sig role="note" aria-label="${esc(o.kind === 'paper' ? 'Work it out on paper' : 'Build it on the sheet')}">
    <i class="c1-sig-ptr" aria-hidden="true"></i><div class="c1-sig-h">${C1_ICO[o.kind === 'paper' ? 'paper' : 'build']}<span>${esc(head.eyebrow || (o.kind === 'paper' ? 'WORK IT OUT ON PAPER' : 'BUILD IT ON THE SHEET'))}</span></div>
    <div class="c1-sig-b">${o.tag ? `<span class="c1-sig-tag">${esc(o.tag)}</span>` : ''}${o.title ? `<b class="c1-sig-t">${c1Html(o.title)}</b>` : ''}${(o.lines || []).map(l => `<p>${l}</p>`).join('')}${nothing ? `<p class="c1-sig-n">${esc(nothing)}</p>` : ''}
    ${o.btn ? `<div class="c1-sig-a"><button class="bv-btn primary" ${o.btn.attr}>${esc(o.btn.label)}</button></div>` : ''}</div></aside>`;
}
/* the paper signal's two lines for a sum: Work it out in your book. Write SUM n beside it. / Then type your answer in C4 and press Enter. */
function c1PaperLines(n, cell){ return c1T('signal.paper', { n, cell }).text.map(t => c1Html(t, n)); }
function c1DoneHtml(text, cell){ return `<div class="c1-done" data-c1done="${esc(cell)}" role="status"><i class="c1-done-ptr" aria-hidden="true"></i>${c1Html(text)}</div>`; }
/* place a signal (or a done callout) beside its cell: left of the signal's pointer level with the cell's middle */
function c1Place(el, cellEl, mode, box){
  if(!el || !cellEl) return; const host = el.offsetParent || el.parentElement; if(!host) return;
  const H0 = host.getBoundingClientRect(), H = { left:H0.left + host.clientLeft, top:H0.top + host.clientTop, height:H0.height }, C = cellEl.getBoundingClientRect(), E = el.getBoundingClientRect();
  if(mode === 'below'){ el.style.left = Math.round(C.left - H.left + (box && box.dx || 0)) + 'px'; el.style.top = Math.round(C.bottom - H.top + 12) + 'px'; return; }
  const x = box && box.x !== undefined ? box.x : C.right - H.left + 14, ptrY = 28;
  el.style.left = Math.round(x) + 'px'; el.style.top = Math.max(0, Math.round(C.top - H.top + C.height / 2 - ptrY)) + 'px';
  if(E.height && H.height && el.offsetTop + E.height > host.scrollHeight) el.style.top = Math.max(0, host.scrollHeight - E.height) + 'px';
}

/* ---------- 1. the line under a sheet stays short; the signal carries the instruction ---------- */
const c1LineBook0 = ashLineBook;
ashLineBook = function(sum){ if(!ch1()) return c1LineBook0.apply(this, arguments); const T = c1T('line.paper', { cell:sum.tgt }); return esc(T.text[0] || `Type your answer in ${sum.tgt}, then press Enter.`); };

/* ---------- a formula he builds finishes with Enter (hand-off 2: "Pressing Enter is always shown") ---------- */
const c1Built0 = ashBuilt;
ashBuilt = function(sp, act, st){
  const viaSum = st.tokens && st.tokens.length === 1 && /^SUM\(/.test(String(st.tokens[0].ref || ''));   // Σ SUM's own Enter finished it
  if(ch1() && act && act.how === 'formula' && act.needEnter && !st.entered && !viaSum){ st.ready = true; st.msg = ''; st.q = false; return; }
  st.entered = false; st.ready = false; return c1Built0.apply(this, arguments);
};
function c1Enter(sp){ const act = sp && sp.act, st = sp && ashSt(sp.id); if(!act || !st || !st.ready) return false; st.entered = true; ashBuilt(sp, act, st); render(); return true; }
document.addEventListener('keydown', e => {
  if(e.key !== 'Enter') return; const sp = ashLive(); if(!sp || !sp.act || !ch1()) return; const st = ashSt(sp.id);
  if(st.ready){ e.preventDefault(); e.stopImmediatePropagation(); c1Enter(sp); }
}, true);
/* Σ SUM only (week 3 on): clicking the days one by one is not this week's way */
const c1Pick0 = ashPick;
ashPick = function(sp, ref){ const act = sp && sp.act, st = sp && ashSt(sp.id);
  if(act && act.sumOnly && st && !st.sigma){ st.msg = c1T('review.sum.signal3', sp.tv || {}).text.map(t => t.replace(/\*\*/g, '').replace(/\[Enter\]/g, 'Enter')).join(' '); st.q = false; render(); return; }
  if(act && st && st.ready){ st.msg = 'The formula is complete: press Enter to finish it.'; st.q = false; render(); return; }
  return c1Pick0.apply(this, arguments); };
/* the formula bar's Enter key: lit while a formula is complete or a Σ SUM range is held */
function c1BarEnter(sp, root){
  const act = sp.act, st = ashSt(sp.id), fb = root && root.querySelector('.ash-fb'); if(!act || !fb || fb.querySelector('.c1-fbenter') || root.querySelector('.c1-keys')) return;   // the key row's Enter (hand-off 3)
  const held = act.sumKey && st.sigma && st.sumA && !st.drag, on = st.ready || held;
  if(!(act.needEnter || act.sumKey)) return;
  fb.insertAdjacentHTML('beforeend', `<button class="c1-fbenter ${on ? 'on' : ''}" ${held ? 'data-ashsumgo' : 'data-c1enter'} ${on ? '' : 'disabled'} aria-label="Enter">Enter ↵</button>`);
  const b = fb.querySelector('.c1-fbenter'); if(b) b.onclick = () => { if(held) ashSumEnter(sp); else c1Enter(sp); };
}

/* ---------- no scroll jump: pressing × ÷ + −, Σ SUM, Undo or Enter on a sheet keeps the page where it is ---------- */
const c1Render0 = render;
render = function(){
  const keep = [], live = typeof document !== 'undefined' && document.querySelector('[data-ash]');
  if(live && ch1()){ document.querySelectorAll('#screen, #screen *').forEach(el => { if(el.scrollTop > 0 && el.id) keep.push(['#' + el.id, el.scrollTop]); else if(el.scrollTop > 0 && el.className && typeof el.className === 'string') keep.push(['.' + el.className.trim().split(/\s+/).join('.'), el.scrollTop]); }); }
  const sx = typeof window !== 'undefined' ? window.scrollX : 0, sy = typeof window !== 'undefined' ? window.scrollY : 0;
  const r = c1Render0.apply(this, arguments);
  if(keep.length){ keep.forEach(([sel, top]) => { try{ const el = document.querySelector(sel); if(el) el.scrollTop = top; }catch(e){} }); }
  if(live && ch1() && (window.scrollX !== sx || window.scrollY !== sy)) window.scrollTo(sx, sy);
  return r;
};
document.addEventListener('mousedown', e => { if(!ch1()) return; const b = e.target && e.target.closest && e.target.closest('[data-ashop], [data-ashenter], [data-ashsumgo], [data-c1enter], .c1-fbenter'); if(b) e.preventDefault(); }, true);   // a click on a key never moves the focus (and the page)

/* =====================================================================
   2-3. THE WEEK'S ACCOUNTS (weeks 1 to 4, the Sunday review)
   ===================================================================== */
const c1RvOn = W => !!W && ch1(W.from) && weekNo(W.from) <= 4 && typeof ashOn === 'function' && ashOn();
const c1Gated = d => String(((WB.calendar || []).find(c => c.day === d) || {}).gatedCalc || '').split(',').map(s => s.trim()).filter(Boolean);
const c1Ex = () => S.c1 || (S.c1 = {});
const C1_WD = d => WDAY[calDate(d).getUTCDay()];
/* the rotating review question (ReviewQuestions; first at the week-2 review): the next in turn that the game can ask on the
   week's sheet. Built so far: best_day, worst_day, range, load_factor (the others need route rows on the sheet). */
const C1_ROT = ['best_day', 'range', 'load_factor', 'worst_day'];
function c1RotFor(W){ const X = c1Ex(), wk = weekNo(W.from); X.rot = X.rot || {}; if(X.rot[wk]) return X.rot[wk];
  const asked = Object.values(X.rot), last = asked[asked.length - 1], i = last ? (C1_ROT.indexOf(last) + 1) % C1_ROT.length : 0;
  X.rot[wk] = C1_ROT[i]; return X.rot[wk]; }
const C1_RQ = id => ((WORLD.reviewQuestions || WB.reviewQuestions || []).find(q => q.questionId === id || q.id === id) || {});

function c1ReviewSpec(W, items, h){
  const wk = weekNo(W.from), store = W, days = Array.from({ length:7 }, (_, k) => W.from + k).filter(d => W.rows.some(r => r.d === d));
  const g = c1Gated(W.from + 6), T = items.find(x => x.id === 'tot'), M = items.find(x => x.id === 'mean');
  const D = (g.includes('projectedVsActual') && c1Room()) || rbState(store, 'diff').ok ? items.find(x => x.id === 'diff') : null;
  const rotId = g.includes('reviewRotation') ? c1RotFor(W) : null;
  const rows = [{ r:1, t:'hdr' }], v = {}, rowOf = {}; let r = 2;
  days.forEach(d => { const P = (W.rows.find(x => x.d === d) || {}).profit || 0; rows.push({ r, label:rbShort(d), ic:'cal' }); v['B' + r] = { t:money(Math.round(P)), cls:P < 0 ? 'soft' : '' }; rowOf['d' + d] = r; r++; });
  const rTot = r++, rProj = D ? r++ : 0, rDiff = D ? r++ : 0, rDays = M ? r++ : 0, rMean = M ? r++ : 0;
  rows.push({ r:rTot, label:'Profit this week', ic:'coins', t:'tot', gold:true });
  if(D) rows.push({ r:rProj, label:'Projected on Monday', ic:'note' }, { r:rDiff, label:'Difference from the plan', ic:'scale', gold:true });
  if(M) rows.push({ r:rDays, label:'Days flown', ic:'cal' }, { r:rMean, label:'Average a day', ic:'chart', t:'fin', gold:true });
  const total = rbValue(T), proj = Math.round(W.projected || 0), ok = id => rbState(store, id).ok;
  if(D) v['B' + rProj] = { t:money(proj) }; if(M) v['B' + rDays] = { t:num(M.div) };
  if(ok('tot')) v['B' + rTot] = { t:money(total), cls:total < 0 ? 'soft' : '' };
  if(D && ok('diff')) v['B' + rDiff] = total > proj ? { t:'+' + money(rbValue(D)), cls:'pos' } : { t:rbValue(D) ? rbResultWords(D).replace(/ than .*$/, '') : 'On plan' };
  if(M && ok('mean')) v['B' + rMean] = { t:money(rbValue(M)) };
  const d0 = days[0], dL = days[days.length - 1], wd = d => C1_WD(d), nDays = h21Words(days.length), tRefs = days.map(d => 'B' + rowOf['d' + d]), tRange = `${tRefs[0]}:${tRefs[tRefs.length - 1]}`;
  const TV = { days:nDays, range:tRange, first:wd(d0), last:wd(dL), lastDay:wd(dL), cell:tRefs[tRefs.length - 1], total:money(total), mean:M ? money(rbValue(M)) : '', n:wk };
  // the spreadsheet ladder (Settings spreadsheetLadder): week 1 click; week 2 click, then shown Σ SUM; from week 3 Σ SUM only
  const ladder = wk >= 3 ? 'sum' : wk === 2 ? (W.c1sum === 'try' ? 'try' : W.c1sum === 'done' ? 'done2' : 'click') : 'click';
  const sumKey = ladder === 'sum' || ladder === 'try';
  const mk = (it, o) => { const st = rbState(store, it.id), key = 'rb:' + it.id, formula = o.how === 'formula';
    return Object.assign({ id:'rv:' + wk + ':' + it.id, kind:'review:' + it.id, built:!!st.built, unit:'£', done:!!st.ok, want:rbValue(it), recKey:key, get no(){ return formula ? null : sumNo(key); }, get sumText(){ return st.sumText; },
      recO:{ type:'build', relKey:it.kind === 'sum' ? 'weekTotal' : it.kind === 'diff' ? 'projectedVsActual' : 'meanDay', doc:`Week ${wk} accounts: ${o.title}`, ask:o.rule, unit:'£', correct:rbValue(it), correctText:money(rbValue(it)), level:'Build' },
      onBuilt:() => { st.built = true; st.formula = o.words; }, onSum:txt => { st.sumText = txt; },
      answer:(raw, val, s2) => { const want = rbValue(it), good = Math.abs(val - want) < 0.5; if(formula){ st.ok = true; st.q = false; W.c1glow = o.tgt; return { ok:true }; }
        try{ rv2Rec(it, good, raw, val); }catch(x){}
        if(good){ st.ok = true; st.q = false; W.c1glow = o.tgt; return { ok:true }; }
        st.atries = (st.atries || 0) + 1;
        if(st.atries >= 2 && twoTriesOn()){ st.ok = true; st.ashown = true; try{ paperRecShown(key); }catch(x){} return { shown:true }; }
        return { note:ashWrong(it.kind === 'diff' ? '−' : '÷', it.kind === 'diff' ? [Math.max(proj, total), Math.min(proj, total)] : [], val, want, '£') }; },
      hints:() => ashHintFill("week's total and the mean", {}).map(t => ({ t })).concat([{ t:`Check: about ${money(ashRound(rbValue(it)))}.`, est:true }]),
      how2:() => '', answerText:it.kind === 'diff' ? rbResultWords(it) : money(rbValue(it)) }, o); };
  const sums = [mk(T, { title:'Profit this week', tgt:'B' + rTot, refs:tRefs, ops:days.slice(1).map(() => '+'), words:`${rbShort(d0)} + … + ${rbShort(dL)}`, commute:true, how:'formula', needEnter:true, noGap:true,
    sumKey, sumOnly:sumKey, sumWords:`add ${TV.first} to ${TV.last}`, barWords:'',
    sumLine:st2 => (st2.sumA ? c1T('review.sum.drag', TV) : st2.sigma ? c1T('review.sum.go', TV) : c1T('review.sum.wait', TV)).text.map(h21Html).join(' ').replace(/press Enter\.?$/, 'press Enter.'),
    lineBuild:c1T('line.build').text.map(esc).join(' '),
    sumWhy:(c, r1, r2) => r2 > rowOf['d' + dL] ? `That goes past ${wd(dL)}: the week's profit is the days only. Drag from ${wd(d0)}'s profit to ${wd(dL)}'s.` : r1 > rowOf['d' + d0] ? `That leaves out ${wd(d0)}. Drag from ${wd(d0)}'s profit to ${wd(dL)}'s.` : `That stops before ${wd(dL)}. Drag from ${wd(d0)}'s profit to ${wd(dL)}'s.`,
    sumWrongCol:() => `Those are the days' names. Drag down the Profit column (B), from ${wd(d0)}'s profit to ${wd(dL)}'s.`,
    rule:'Profit this week', name:'the profit this week', why:ref => ashRef(ref).r > rTot ? 'That is below the days. This week\'s profit adds up the days: which cells hold them?' : null })];
  if(D){ const larger = proj >= total ? 'B' + rProj : 'B' + rTot, smaller = larger === 'B' + rProj ? 'B' + rTot : 'B' + rProj;
    sums.push(mk(D, { title:'Difference from the plan', tgt:'B' + rDiff, refs:[larger, smaller], ops:['−'], words:larger === 'B' + rProj ? 'Projected − Profit this week' : 'Profit this week − Projected', commute:false, how:'book',
      rule:'Difference = the larger − the smaller', name:'the difference from the plan', question:'How far was the week from the plan?' })); }
  if(M) sums.push(mk(M, { title:'Average a day', tgt:'B' + rMean, refs:['B' + rTot, 'B' + rDays], ops:['÷'], words:'Profit this week ÷ Days flown', commute:false, how:'formula', needEnter:true,
    rule:'Average a day', name:'the average a day', orderWhy:'an average shares the total out, so the total comes first.', why:ref => { const p = ashRef(ref).r; return p < rTot ? 'An average shares the week\'s total between the days: start with the total, then the number of days.' : null; } }));
  // the rotating review question
  if(rotId && M){ const Q = C1_RQ(rotId), pr = days.map(d => ({ d, ref:'B' + rowOf['d' + d], p:Math.round((W.rows.find(x => x.d === d) || {}).profit || 0) }));
    const best = pr.slice().sort((a, b) => b.p - a.p || a.d - b.d)[0], worst = pr.slice().sort((a, b) => a.p - b.p || a.d - b.d)[0], RQ = store.c1rq || (store.c1rq = {}), rkey = `rq:${rotId}:${wk}`;
    const rec1 = (good, raw, want, txt) => { try{ const e = recOpen(rkey, { type:'calc', relKey:rotId === 'load_factor' ? 'percentage' : rotId === 'range' ? 'difference' : 'readingTable', doc:`Week ${wk} accounts: ${Q.question || rotId}`, ask:Q.question || '', question:Q.question || '', unit:rotId === 'load_factor' ? '%' : rotId === 'range' ? '£' : '', correct:want, correctText:txt });
      recAttempt(e, { ok:good, text:String(raw) }); if(good) e.status = 'checked'; }catch(x){} };
    const R0 = r; let rq = null;
    if(rotId === 'best_day' || rotId === 'worst_day'){ const tg = rotId === 'best_day' ? best : worst, rr = r++, lab = rotId === 'best_day' ? 'Best day' : 'Worst day';
      rows.push({ r:rr, label:lab, ic:'chart', gold:true }); if(RQ.ok) v['B' + rr] = { t:`${rbShort(tg.d)} · ${money(tg.p)}` };
      rq = { id:'rv:' + wk + ':rq', kind:'review:rq', title:Q.question || (rotId === 'best_day' ? 'Which day made the most profit?' : 'Which day made the least profit?'), tgt:'B' + rr, refs:[tg.ref], ops:[], words:lab, how:'formula', pick:true, done:!!RQ.ok, built:!!RQ.ok, unit:'',
        lit:['B', 2, 'B', rr], want:tg.p, recKey:rkey, get no(){ return sumNo(rkey); }, recO:{ type:'calc', relKey:'readingTable', doc:`Week ${wk} accounts: ${lab}`, level:'Calculate' },
        why:ref => { const x = pr.find(z => z.ref === ref); return x ? `${rbShort(x.d)} made ${money(x.p)}. ${rotId === 'best_day' ? 'Is there a day that made more?' : 'Is there a day that made less?'}` : 'Click a day\'s profit in column B.'; },
        answer:() => { RQ.ok = true; W.c1glow = 'B' + rr; rec1(true, rbShort(tg.d), tg.p, `${rbShort(tg.d)} · ${money(tg.p)}`); return { ok:true }; },
        lineBuild:`Click the day that made ${rotId === 'best_day' ? 'the most' : 'the least'} profit.`, answerText:`${rbShort(tg.d)} · ${money(tg.p)}`, signal:'pick' }; }
    else if(rotId === 'range'){ const rb = r++, rw = r++, rr = r++;
      rows.push({ r:rb, label:`Best day (${rbShort(best.d)})`, ic:'chart' }, { r:rw, label:`Worst day (${rbShort(worst.d)})`, ic:'chart' }, { r:rr, label:'Range: best − worst', ic:'scale', gold:true });
      v['B' + rb] = { t:money(best.p), f:true }; v['B' + rw] = { t:money(worst.p), f:true }; const want = best.p - worst.p; if(RQ.ok) v['B' + rr] = { t:money(want) };
      rq = { id:'rv:' + wk + ':rq', kind:'review:rq', title:Q.question || 'What is the difference between the best and the worst day?', tgt:'B' + rr, refs:['B' + rb, 'B' + rw], ops:['−'], words:'Best day − Worst day', how:'book', done:!!RQ.ok, built:true, unit:'£', want, recKey:rkey, get no(){ return sumNo(rkey); },
        answer:(raw, val) => { const good = Math.abs(val - want) < 0.5; rec1(good, raw, want, money(want)); if(good){ RQ.ok = true; W.c1glow = 'B' + rr; return { ok:true }; } RQ.tries = (RQ.tries || 0) + 1; if(RQ.tries >= 2 && twoTriesOn()){ RQ.ok = true; RQ.shown = true; try{ paperRecShown(rkey); }catch(x){} return { shown:true }; } return { note:ashWrong('−', [best.p, worst.p], val, want, '£') }; },
        hints:() => [{ t:`The range is how far apart they are: ${money(best.p)} − ${money(worst.p)}.` }, { t:`Check: about ${money(ashRound(want))}.`, est:true }], answerText:money(want) }; }
    else if(rotId === 'load_factor'){ const rp = r++, rs = r++, rr = r++, pax = h.pax || 0, seats = h.seats || 1, want = Math.round(pax / seats * 100);
      rows.push({ r:rp, label:'Passengers this week', ic:'person' }, { r:rs, label:'Seats this week', ic:'person' }, { r:rr, label:'Seats filled (%)', ic:'chart', gold:true });
      v['B' + rp] = { t:num(pax), f:true }; v['B' + rs] = { t:num(seats), f:true }; if(RQ.ok) v['B' + rr] = { t:want + '%' };
      rq = { id:'rv:' + wk + ':rq', kind:'review:rq', title:Q.question || 'What share of seats were filled this week?', tgt:'B' + rr, refs:['B' + rp, 'B' + rs], ops:['÷'], words:'Passengers ÷ Seats, then × 100', how:'book', done:!!RQ.ok, built:true, unit:'%', want, recKey:rkey, get no(){ return sumNo(rkey); },
        parse:raw => { const x = parseFloat(String(raw).replace(/[%\s,]/g, '')); return isNaN(x) ? null : x; },
        answer:(raw, val) => { const exact = pax / seats * 100, good = Math.abs(val - exact) < 1; rec1(good, raw, want, want + '%'); if(good){ RQ.ok = true; W.c1glow = 'B' + rr; return { ok:true }; } RQ.tries = (RQ.tries || 0) + 1; if(RQ.tries >= 2 && twoTriesOn()){ RQ.ok = true; RQ.shown = true; try{ paperRecShown(rkey); }catch(x){} return { shown:true }; }
          return { note:val > 100 ? 'A share of the seats can\'t be more than 100%: passengers ÷ seats, then × 100.' : `Check: ${num(pax)} ÷ ${num(seats)}, then × 100. One more try.` }; },
        hints:() => [{ t:`Passengers ÷ seats gives the share as a decimal: ${num(pax)} ÷ ${num(seats)}. Then × 100 makes it a percentage.` }, { t:'Round to the nearest whole per cent.', est:true }], answerText:want + '%' }; }
    if(rq){ rq.question = rq.title; sums.push(rq); }
  }
  sums.forEach((s, i) => { s.locked = i > 0 && !sums[i - 1].done; });
  // the week-2 offer: after the click-total, the Σ SUM callout holds the next sum back until Try it
  const offer = ladder === 'click' && wk === 2 && sums[0].done && !W.c1sum;
  const act = offer ? null : sums.find(s => !s.done) || null;
  return { id:'week:' + wk, crumb:'', title:'The week, day by day', tabs:null, small:true, tight:true, lw:220, cols:[{ c:'B', w:170, top:fmtRange(W.from, W.from + 6), main:'Profit' }], rows, v, sums, act, just:null, tv:TV, offer, ladder,
    doneF:!act ? (() => { const l = sums.filter(s => s.done).pop(); return l ? { tgt:l.tgt, refs:l.refs, ops:l.ops, words:l.words, val:l.answerText } : null; })() : null,
    doneLine:c1T('review.done.line', { n:wk }).text.map(c1Html).join(' ') };
}
/* the example (week 1, once): Finance adds up Monday to Wednesday on made-up numbers while he watches */
function c1ExampleSpec(W){
  const P = String(WBS().week1ExampleProfits || '1250|1300|1150').split('|').map(Number).filter(x => !isNaN(x)), days = P.map((_, k) => W.from + k);
  const rows = [{ r:1, t:'hdr' }], v = {}; days.forEach((d, k) => { rows.push({ r:k + 2, label:rbShort(d), ic:'cal' }); v['B' + (k + 2)] = { t:money(P[k]) }; });
  const rT = days.length + 2, X = c1Ex(), done = !!X.exAdded, total = P.reduce((t, x) => t + x, 0), refs = days.map((d, k) => 'B' + (k + 2));
  rows.push({ r:rT, label:`Profit ${rbShort(days[0]).split(' ')[0]} to ${rbShort(days[days.length - 1]).split(' ')[0]}`, ic:'coins', t:'tot', gold:true }); if(done) v['B' + rT] = { t:money(total) };
  const sum = { id:'ex:1:tot', kind:'example', tgt:'B' + rT, refs, ops:refs.slice(1).map(() => '+'), words:refs.length > 3 ? '' : days.map(d => rbShort(d)).join(' + '), commute:false, how:'formula', needEnter:true, noGap:true, built:done, done, unit:'£', want:total,
    rule:'Profit Mon to Wed', name:'the example', lineBuild:c1T('review.example.line').text.map(esc).join(' '), answer:() => { X.exAdded = true; save(); return { ok:true }; } };
  return { id:'week:ex:' + weekNo(W.from), crumb:'', title:'Example', tabs:null, small:true, tight:true, lw:220, cols:[{ c:'B', w:170, top:'Example', main:'Profit' }], rows, v, sums:[sum], act:done ? null : sum, just:null, example:true, total,
    doneF:done ? { tgt:sum.tgt, refs, ops:sum.ops, words:'', val:money(total) } : null, doneLine:c1T('review.example.lineDone', { total:money(total) }).text.map(c1Html).join(' ') };
}
/* Finance's clicks, about one a second (reduced motion: the end) */
function c1ExampleRun(){
  const X = c1Ex(); if(X.exRun || X.exAdded) return; X.exRun = true;
  const go = () => { const sp = ashLive(); if(!sp || !sp.example || !sp.act) { X.exRun = false; return null; } return sp; };
  const steps = []; const sp0 = go(); if(!sp0) return; sp0.act.refs.forEach((ref, i) => { if(i) steps.push({ op:'+' }); steps.push({ ref }); }); steps.push({ enter:true });
  if(settings.reduceMotion){ const st = ashSt(sp0.id); st.tokens = ashFullTokens(sp0.act); st.entered = true; ashBuilt(sp0, sp0.act, st); X.exRun = false; render(); return; }
  let i = 0; const tick = () => { const sp = go(); if(!sp){ return; } const s = steps[i++]; if(!s){ X.exRun = false; return; }
    const root = document.querySelector(`[data-ash="${CSS.escape(sp.id)}"]`), cur = document.getElementById('c1Cursor');
    if(s.ref){ const c = root && root.querySelector(`[data-ref="${s.ref}"]`); if(c && cur){ const R = c.getBoundingClientRect(); cur.style.left = (R.right - 26) + 'px'; cur.style.top = (R.top + R.height / 2 - 4) + 'px'; }
      setTimeout(() => { const sp2 = go(); if(sp2) ashPick(sp2, s.ref); setTimeout(tick, 650); }, 380); return; }
    if(s.op){ const sp2 = go(); if(sp2) ashOp(sp2, s.op); setTimeout(tick, 250); return; }
    if(s.enter){ const k = document.querySelector('.c1-fbenter'); if(k && cur){ const R = k.getBoundingClientRect(); cur.style.left = (R.left + R.width / 2) + 'px'; cur.style.top = (R.top + R.height / 2) + 'px'; }
      setTimeout(() => { const sp2 = go(); if(sp2){ X.exRun = false; c1Enter(sp2); } }, 900); } };
  setTimeout(tick, 700);
}
function c1ReviewRender(st){
  const W = S.wk || { from:S.day - 6, rows:[], projected:0 }, h = weekSummary(W), items = weekReviewItems(W, h), wk = weekNo(W.from), X = c1Ex();
  items.forEach(it => { it.title = RV2_TITLE[it.id] || it.title; });
  if(UI.ashJust && /^week:/.test(UI.ashJust.sheet || '')) UI.ashJust = null;   // a finished sum moves straight on: the green glow stays on its cell
  const exOn = wk === 1 && (+WBS().reviewExampleWeeks || 1) >= 1 && !X.exDone && !(settings.briefings === false && X.exSkip);
  const sp = exOn ? c1ExampleSpec(W) : c1ReviewSpec(W, items, h);
  const live = !exOn ? sp.sums : [], allOk = !exOn && !sp.act && !sp.offer && live.every(s => s.done);
  if(allOk && !W.logged){ W.logged = true; rbSkill('weekTotal'); if(live.some(s => /:diff$/.test(s.id))) rbSkill('projectedVsActual'); if(items.some(x => x.id === 'mean')) rbSkill('meanDay');
    rbLog(['Week total (Formula)'].concat(live.some(s => /:diff$/.test(s.id)) ? ['Projected − actual (the sum)'] : []).concat(items.some(x => x.id === 'mean') ? ['Average a day (Formula)'] : []));
    const mean = items.find(x => x.id === 'mean'); if(mean){ (S.means = S.means || {})[wk] = rbValue(mean); }
    if(live.some(s => /:diff$/.test(s.id))) c1DifferenceAsked(W.from + 6); }
  if(allOk) ashKeep('week', sp, wk);
  if(!W.missed && WBS().missedProfitLine !== false){ W.missed = missedProfitLine(h.profit, 7, W.from); }
  if(!W.neglect) W.neglect = neglectUpdate(W.from, W.from + 6);
  const NG = typeof h21Unflown === 'function' ? h21Unflown(W.neglect || []) : { rest:W.neglect || [], chance:'' };
  const neg = (NG.rest.length ? `<div class="wk-neglect rv2-neg">${rv2Neglect(NG.rest)}</div>` : '') + NG.chance;
  const dayLines = (W.rows || []).filter(r => (r.ev && r.ev.length) || r.dc).map(r => `<li><b>${esc(rbShort(r.d))}</b> ${(r.ev || []).map(n => `<span>${esc(rv2DayLine(n))}</span>`).join(' ')}${r.dc ? ` <span class="dc ${r.dc.delta < 0 ? 'dn' : ''}">${esc(r.dc.line)}</span>` : ''}</li>`).join('');
  const what = `<div class="rv2-col rv2-what"><p class="bv-eyebrow rv2-ch">What happened</p>${rv2SeatHtml(h)}${dayLines ? `<section class="bv-panel support rv2-days"><div class="rv2-ph"><h2>Each day</h2></div><ul>${dayLines}</ul></section>` : ''}${surprisesLine(W.from, W.from + 6)}${fuelAdvantageLine(wk)}${neg}${rv2RoutesHtml(h)}</div>`;
  // the right-hand column: the signal at the answer cell, the Σ SUM callout (week 2), or the done callouts
  let ins = '', a = sp.act;
  if(exOn){ const T = c1T(sp.act ? 'review.example.watch' : 'review.example.done', sp.tv || {});
    ins = c1SignalHtml({ kind:'build', tag:T.eyebrow || 'EXAMPLE · WATCH', title:T.title, lines:T.text.map(t => c1Html(t)), nothing:false, btn:sp.act ? null : { attr:'id="c1MyTurn"', label:T.button || 'My turn ▶' } }); }
  else if(sp.offer){ const C = c1T('review.sumSkill', Object.assign({}, sp.tv, { days:h21Words(7) }));
    ins = `<div class="ash-co c1-co pl" role="dialog" aria-label="${esc(C.title)}"><i class="ash-ptr" aria-hidden="true"></i><span class="ash-coe">${esc(C.eyebrow)}</span><b class="ash-cot">${esc(C.title)}</b>${C.text.map(t => `<p>${c1Html(t)}</p>`).join('')}<div class="ash-coa"><button class="bv-btn primary" id="c1Try">${esc(C.button || 'Try it')}</button></div></div>`; }
  else if(a){ const TV = sp.tv || {};
    if(a.how === 'formula' && !a.pick){ const tot = /:tot$/.test(a.id), id = tot ? (a.sumKey ? (sp.ladder === 'try' ? 'review.sum.signal' : 'review.sum.signal3') : 'review.total.signal') : 'review.average.signal', T = c1T(id, TV);
      ins = c1SignalHtml({ kind:'build', title:T.title, lines:T.text.map(t => c1Html(t)) }); }
    else if(a.pick) ins = c1SignalHtml({ kind:'build', title:a.title || a.question, lines:[esc(a.lineBuild || ''), 'The sheet fills in the day.'] });
    else ins = c1SignalHtml({ kind:'paper', title:a.title || a.question, lines:c1PaperLines(a.no, a.tgt) }); }
  else if(allOk){ const done = live.filter(s => s.done).map(s => { const T = /:tot$/.test(s.id) ? c1T('review.done.total', { total:money(rbValue(items.find(x => x.id === 'tot'))) }) : /:mean$/.test(s.id) ? c1T('review.done.average', { mean:money(rbValue(items.find(x => x.id === 'mean'))) }) : null;
      return c1DoneHtml(T ? T.text[0] : `✓ Done: **${s.answerText}**`, s.tgt); }).join('');
    const Mi = W.missed, miss = Mi ? `<div class="wk-missed c1-missed ${Mi.missed > 0 ? 'warn' : 'ok'}"><span class="kl">What the best plan would have earned</span><div class="wm-row"><span>Your plan <b class="mono">${money(Mi.yours)}</b></span><span>Best plan with your planes <b class="mono">${money(Mi.best)}</b></span><span>Missed <b class="mono">${money(Mi.missed)}</b></span></div></div>` : '';
    ins = done + miss; }
  // the line under the sheet in the steps between: "✓ You added the week …" (week 2), "✓ Same answer, in one drag …"
  if(!exOn && a && /:mean$/.test(a.id) && wk === 2 && W.c1sum === 'done') a.lineBuild = c1T('review.sum.done', sp.tv).text.map(t => c1Html(t)).join(' ');
  if(!exOn && sp.offer) sp.doneLine = c1T('review.total.clickDone', sp.tv).text.map(t => c1Html(t)).join(' ');
  const body = `<div class="bv rv2 rbw ash-rv c1-rv ${a || sp.offer || exOn ? 'c1-busy' : ''} ${exOn ? 'c1-ex' : ''}">${what}<div class="rv2-col rv2-mid">${exOn ? `<div class="c1-exf"><span class="c1-exl">${esc(c1T('review.example.label').eyebrow || 'EXAMPLE · MADE-UP NUMBERS')}</span><span class="c1-exw" aria-hidden="true">EXAMPLE</span>` : ''}${ashHtml(sp)}${exOn ? '</div>' : ''}</div><div class="rv2-col rv2-ins c1-ins">${ins}</div></div>`;
  const dl = d => dateLong(d).split(' '), sub = exOn ? c1T('review.example.sub').text[0] : `Your ${wk === 1 ? 'first ' : ''}week of flying, ${dl(W.from).slice(0, 2).join(' ')} to ${dl(W.from + 6).slice(0, 3).join(' ')} · Passengers ${num(h.pax)} of ${num(h.seats)} seats · cash ${money(Math.round(S.cash))}`;
  const btn = allOk ? `<button class="bv-btn go big" id="nx">Plan week ${wk + 1} &#9654;</button>` : '';
  screen().innerHTML = shell(deskPage({ title:`How did week ${wk} go?`, sub, cls:'rbw-page rv-page rv2-page ash-rvp c1-rvp', body }), deskBar(`Sunday accounts · week ${wk}${exOn ? ' · watch first' : ''}`, btn));
  ashBind(sp); c1ReviewBind(sp, W, exOn);
  on('nx', () => { if(!c1ReviewSpec(W, weekReviewItems(W, weekSummary(W)), weekSummary(W)).sums.every(s => s.done)) return; UI.ashJust = null; resetEntry(); UI.justDone = null; S.rnd.applied = true; closeDay(); });
}
function c1ReviewBind(sp, W, exOn){
  const root = screen(), grid = root.querySelector(`[data-ash="${CSS.escape(sp.id)}"]`), cell = ref => grid && grid.querySelector(`.ash-c[data-ref="${ref}"]`);
  if(grid) c1BarEnter(sp, grid);
  // the signal level with its answer cell, in the column to the right of the sheet
  const sig = root.querySelector('.c1-ins [data-c1sig], .c1-ins .c1-co'), tgt = sp.act ? sp.act.tgt : sp.offer ? sp.sums[0].tgt : null;
  if(sig && tgt) c1Place(sig, cell(tgt), 'side', { x:0 });
  root.querySelectorAll('.c1-ins [data-c1done]').forEach(el => { const c = cell(el.getAttribute('data-c1done')); if(c) c1Place(el, c, 'side', { x:-28 }); const g = c && c.classList; if(g) g.add('c1-ok'); });
  if(W.c1glow && !exOn){ const c = cell(W.c1glow); if(c) c.classList.add('c1-glow'); }
  if(sp.act && sp.act.sumOnly) root.querySelectorAll('.ash-ops button:not(.sum):not([data-ashop="undo"])').forEach(b => { b.disabled = true; });
  on('c1Try', () => { W.c1sum = 'try'; const s = rbState(W, 'tot'); s.ok = false; s.built = false; s.sumText = null; W.c1glow = null; const a = ashSt(sp.id); ashReset(a, null); save(); render(); });
  if(sp.ladder === 'try' && rbState(W, 'tot').ok && W.c1sum === 'try'){ W.c1sum = 'done'; save(); setTimeout(render, 0); }
  on('c1MyTurn', () => { const X = c1Ex(); X.exDone = S.day || 1; delete X.exAdded; delete X.exRun; save(); render(); });
  if(exOn){ if(!document.getElementById('c1Cursor') && sp.act) document.body.insertAdjacentHTML('beforeend', '<i id="c1Cursor" class="c1-cursor" aria-hidden="true"></i>'); if(!sp.act){ const c = document.getElementById('c1Cursor'); if(c) c.remove(); } if(sp.act) c1ExampleRun(); }
  else { const c = document.getElementById('c1Cursor'); if(c) c.remove(); }
}
const c1RvRender0 = ashReviewRender;
ashReviewRender = function(st){ return c1RvOn(S.wk) ? c1ReviewRender(st) : c1RvRender0.apply(this, arguments); };
/* the toolkit: My turn and Try it are steps too */
if(window.__tkSums){ window.__tkSums.unshift({ what:'the example', test:() => !!document.getElementById('c1MyTurn'), plan:() => ({ at:'#c1MyTurn', value:'My turn', go:() => document.getElementById('c1MyTurn').click() }) });
  window.__tkSums.unshift({ what:'Σ SUM: try it', test:() => !!document.getElementById('c1Try'), plan:() => ({ at:'#c1Try', value:'Try it', go:() => document.getElementById('c1Try').click() }) });
  window.__tkSums.unshift({ what:'the formula: Enter', test:() => { const sp = ashLive(); return !!(sp && sp.act && ashSt(sp.id).ready); }, plan:() => ({ at:'.c1-fbenter', value:'Enter', go:() => c1Enter(ashLive()) }) }); }

/* =====================================================================
   4. LAUNCH DAY (hand-off 3, 30 Oct 2026, evening; replaces hand-off 2's watch, do, watch, compare). Left to right, no
   columns move: (1) the job first, nothing lit until Watch ▶; (2) Finance demonstrates building the first formula, a pointer
   clicking B2, the × key, B3 and Enter; (3) HOW A FORMULA WORKS; (4) he builds the second (formula, not counted); (5) the
   third on paper (Sum 1, the class method in the hint); (6) only then Finance fills in Paris and the plan, and E4 and F9
   light green once. "One flight, two ways" and the watch panel are gone. WHY 27? comes first when a column's passengers
   are fewer than the people who want to fly at that fare. SheetSums Launch Day: B4 demo, C4 formula, D4 book.
   ===================================================================== */
if(typeof ASH_SUMS !== 'undefined'){ ASH_SUMS['launch.otherTickets'] = { whose:'ƒ', how:'airline' }; ASH_SUMS['launch.profit'] = { whose:'ƒ', how:'airline' }; }   // Paris and the profit are Finance's
const c1LdRow = cell => (((typeof WB !== 'undefined' && WB && WB.sheetSums) || []).find(x => x.sheet === 'Launch Day' && String(x.cell) === cell) || {});
const c1Ld = () => c1Ex().ld || (c1Ex().ld = {});   // seen in the save: job, demo, how, why, glow
/* the class method (Bertie): "£90 is 9 × 10. First work out 19 × 9, then multiply by 10." */
function c1Method(p, fare){ let m = fare, k = 0; while(m % 10 === 0 && m > 0){ m /= 10; k++; } if(!k) return null; const mult = Math.pow(10, k);
  return c1T('launch.paper.hint', { fare, d:m, mult:num(mult), p:num(p) }).text[0] || `£${fare} is ${m} × ${num(mult)}. First work out ${num(p)} × ${m}, then multiply by ${num(mult)}.`; }
/* a formula sum that goes in no record and takes no Sum number (the demonstration; the one he builds) */
function c1Quiet(s){ Object.defineProperty(s, 'no', { value:null, configurable:true, writable:true }); s.recKey = null; const a0 = s.answer;
  s.answer = function(){ const o = recOpen, t = recAttempt; recOpen = () => null; recAttempt = () => {}; try{ return a0.apply(this, arguments); } finally { recOpen = o; recAttempt = t; } }; }
function c1MarkDone(s){ const T = (S.rnd.tables && S.rnd.tables[s.t.id]) || s.t, k = cellId(s.col, s.row); T.done[k] = true; T.chosen[k] = true; s.done = true; }
/* his flights on a route: how many, and their departure times */
function c1FlightsOf(route){ const pl = normPlan(currentPlan()), out = []; pl.fleet.forEach((x, j) => { let d = []; try{ d = actualDeps(pl, j); }catch(e){} x.sched.forEach((id, k) => { if(id === route) out.push(d[k]); }); });
  return out.filter(t => t !== undefined && t !== null).sort((a, b) => a - b); }
const c1Or = L => L.length <= 1 ? (L[0] || '') : L.slice(0, -1).join(', ') + ' or ' + L[L.length - 1];
/* WHY 27?: a column whose passengers are fewer than the people who want to fly at that fare, with seats to spare */
function c1WhyFor(sp, s){
  const k = s && sp.cols.find(c => c.c === ashRef(s.tgt).c); if(!k || !k.src) return null; const { t, col, route } = k.src, V = (t.cols.find(c => c.id === col) || {}).values || {};
  const pax = V['pax_' + route] || 0, fare = V['fare_' + route] || 0, want = Math.round(paxWant(routeById(route), fare)), seats = (() => { try{ return ashSeatsOn(planLines(currentPlan()), route); }catch(e){ return 0; } })();
  if(!(pax < want && pax < seats)) return null;
  return { c:k.c, pax, want, fare, route, rest:want - pax, times:c1Or(c1FlightsOf(route).map(m => `**${fmtTime(m)}**`)) };
}
const c1Launch0 = ashLaunchSpec;
ashLaunchSpec = function(){
  // the demonstrated and built sums take no Sum number: the base sheet reads a just-finished sum's number, so hold it back
  const keep = sumNo, block = UI.c1NoKeys || new Set(); if(ch1() && block.size) sumNo = k => block.has(k) ? null : keep(k);
  let sp; try{ sp = c1Launch0.apply(this, arguments); } finally { sumNo = keep; }
  if(!ch1() || !S || S.phase !== 'setup') return sp;
  const v = sp.v, P = sp.cols[sp.cols.length - 1].c, X = c1Ld();
  // the fuel line: the fuel burned that day at the launch price, in Total costs (fuelLaunchDay)
  const litres = (() => { try{ return plannedLitres(currentPlan()); }catch(e){ return 0; } })(), price = fuelOn(1);
  const r7 = sp.rows.find(r => r.r === 7); if(r7 && litres) r7.note = c1T('launch.fuel', { litres:`${num(litres)} L`, price:priceL(price) }).text[0] || `${num(litres)} L at ${priceL(price)}`;
  ['5', '7', '8', '9'].forEach(r => { if(v[P + r] && v[P + r].t) v[P + r].f = true; });
  sp.title = c1T('launch.title').title || sp.title;
  sp.sums.forEach(s => { delete s.co; });
  // the column heads name his flights: "your 2 flights" over "Dublin at £110"
  sp.cols.forEach(k => { if(!k.src) return; const r = routeById(k.src.route), n = c1FlightsOf(k.src.route).length, T = c1T('launch.colhead', { n }).text;
    k.top = n === 1 ? (T[1] || 'your flight') : (T[0] || `your ${n} flights`); k.main = `${r.city} ${k.main}`; });
  // roles by the workbook's cells: demonstrated, built, on paper
  const tk = sp.sums.filter(s => s.kind === 'tickets'), role = s => c1LdRow(s.tgt).how;
  const demo = tk.find(s => role(s) === 'demo') || tk[0], build = tk.find(s => role(s) === 'formula') || tk[1], paper = tk.find(s => role(s) === 'book' && s !== demo && s !== build) || tk[2];
  UI.c1NoKeys = new Set([demo, build].filter(Boolean).map(s => s.recKey));
  [demo, build].forEach(s => { if(s) c1Quiet(s); });
  if(demo && !demo.done && X.demo) c1MarkDone(demo);   // shown once: a sheet made again (the plan changed) has Finance's column filled
  if(demo && !demo.done){ demo.how = 'formula'; demo.needEnter = true; demo.c1demo = true; demo.hints = null; demo.how2 = null;
    const D = c1T('launch.demo', { p:demo.refs[0], f:demo.refs[1] }).text, step = (UI.c1Demo && UI.c1Demo.step) || 0; demo.lineBuild = c1Html(D[step < 2 ? 0 : 1] || ''); }
  if(build && !build.done){ build.how = 'formula'; build.needEnter = true; build.c1build = true; build.how2 = null;
    build.lineBuild = `${esc(c1T('launch.build.line').text[0] || 'Your turn: build it, then press Enter.')}<button class="ash-hl" data-c1bhint>Give me a hint</button>`; }
  if(paper){ const V = paper.opVals || [], pax = V[0], fare = V[1], h0 = paper.hints;
    paper.hints = () => { const m = c1Method(pax, fare); return (m ? [{ t:m }] : []).concat(h0 ? h0().filter(h => !/take the 0|put the 0/i.test(h.t || '')) : []); }; }
  const fin = [demo, build, paper].filter(Boolean).every(s => s.done), J = sp.just;
  // the stage
  let stage = !X.job ? 'job' : demo && !demo.done ? 'demo' : !X.how ? 'how' : !fin ? 'sum' : 'done';
  if(stage === 'done' && J && J !== paper && !(J.kind === 'tickets' && J === paper)) stage = 'sum';   // a sum just finished keeps its ✓ line until Next
  let act = stage === 'demo' ? demo : stage === 'sum' && !J ? [build, paper].find(s => s && !s.done) || null : null;
  const why = !X.why && (stage === 'demo' || (stage === 'sum' && act)) ? c1WhyFor(sp, stage === 'demo' ? demo : act) : null;
  if(why && !UI.c1Demo){ stage = 'why'; act = null; }
  sp.c1 = { stage, demo, build, paper, why, X };
  if(stage === 'job' || stage === 'how' || stage === 'why') sp.doneLine = '';
  sp.act = act; if(stage !== 'sum') sp.just = null;
  if(sp.just && sp.just.no === null) sp.just.doneLine = String(sp.just.doneLine || '').replace(/ · Sum null in your record/, '');
  // Paris and the plan's column stay empty until he has finished; then Finance fills them in
  if(stage !== 'done'){ sp.cols.forEach(k => { if(k.src && k.src.route !== S.market) v[k.c + 4] = {}; }); [5, 8, 9].forEach(r => { v[P + r] = {}; }); sp.doneF = null; }
  else { sp.cols.forEach(k => { if(k.src && k.src.route !== S.market && v[k.c + 4] && v[k.c + 4].t) v[k.c + 4].f = true; }); sp.doneF = null;
    const L = (() => { try{ return planLines(currentPlan()); }catch(e){ return null; } })(), others = sp.cols.filter(k => k.src && k.src.route !== S.market).map(k => routeById(k.src.route).city);
    const profit = v[P + 9] && v[P + 9].t ? v[P + 9].t : (L ? money(L.profit) : '');
    sp.doneLine = c1Html(c1T('launch.done', { others:c1Or([...new Set(others)]) || 'the other routes', profit }).text[0] || `✓ Every Launch Day sum is done. Profit **${profit}** a day.`); }
  if(stage === 'how' && demo) sp.doneF = { tgt:demo.tgt, refs:demo.refs, ops:demo.ops, words:demo.words, val:money(demo.want) };
  return sp;
};
/* the demonstration: a pointer glides to each cell and key and clicks it (about 0.8 s a step); under reduced motion each step
   appears in turn. The page is not his to click until Finance has pressed Enter. */
const C1_PTR = '<svg viewBox="0 0 20 26" width="22" height="28" aria-hidden="true"><path d="M2 2v19l5-4.5 3.6 7.5 3.3-1.6-3.5-7.3H17z" fill="#fff" stroke="#021226" stroke-width="1.5" stroke-linejoin="round"/></svg>';
function c1PtrTo(el, then){
  let p = document.getElementById('c1Ptr'); if(!p){ p = document.createElement('div'); p.id = 'c1Ptr'; p.className = 'c1-ptr'; p.innerHTML = C1_PTR; document.body.appendChild(p); }
  const R = el.getBoundingClientRect(); p.classList.toggle('still', !!settings.reduceMotion);
  p.style.left = Math.round(R.left + R.width * .55) + 'px'; p.style.top = Math.round(R.top + R.height * .55) + 'px';
  setTimeout(() => { p.classList.add('click'); setTimeout(() => { p.classList.remove('click'); then(); }, 180); }, settings.reduceMotion ? 450 : 650);
}
function c1PtrGone(){ const p = document.getElementById('c1Ptr'); if(p) p.remove(); }
function c1DemoRun(){
  if(UI.c1Demo) return; UI.c1Demo = { step:0 };
  const tick = () => {
    const D = UI.c1Demo, sp = ashLive(); if(!D) return;
    if(!sp || !/^launch:/.test(sp.id) || !sp.c1 || sp.c1.stage !== 'demo' || !sp.act){ UI.c1Demo = null; c1PtrGone(); return; }
    const a = sp.act, root = document.querySelector(`[data-ash="${CSS.escape(sp.id)}"]`), st = ashSt(sp.id);
    const steps = [{ el:() => root.querySelector(`[data-ref="${a.refs[0]}"]`), go:() => ashPick(sp, a.refs[0]) }, { el:() => root.querySelector(`.c1-keys [data-ashop="${a.ops[0]}"]`), go:() => { c1KeyFlash(a.ops[0]); ashOp(sp, a.ops[0]); } },
      { el:() => root.querySelector(`[data-ref="${a.refs[1]}"]`), go:() => ashPick(sp, a.refs[1]) }, { el:() => root.querySelector('.c1-keys [data-c1kenter]'), go:() => { c1KeyFlash('enter'); c1DemoEnd(sp); } }];
    const S1 = steps[D.step], el = S1 && S1.el(); if(!S1){ UI.c1Demo = null; c1PtrGone(); return; }
    if(!el){ setTimeout(tick, 200); return; }
    c1PtrTo(el, () => { if(UI.c1Demo !== D) return; S1.go(); D.step++; if(D.step < steps.length) setTimeout(tick, settings.reduceMotion ? 350 : 250); else { UI.c1Demo = null; setTimeout(c1PtrGone, 500); } });
  };
  setTimeout(tick, 500);
}
function c1DemoEnd(sp){ const X = c1Ld(); X.demo = S.day || 1; const st = ashSt(sp.id); if(sp.act && !st.ready){ ashFullTokens(sp.act).forEach(t => st.tokens.push(t)); } st.ready = true; c1Enter(sp); UI.ashJust = null; save(); render(); }
function c1DemoSkip(){ const sp = ashLive(); UI.c1Demo = null; c1PtrGone(); if(sp && sp.c1 && sp.c1.stage === 'demo'){ const st = ashSt(sp.id); st.tokens = []; c1DemoEnd(sp); } }
document.addEventListener('keydown', e => { if(UI.c1Demo && !document.querySelector('#bfLayer')){ e.preventDefault(); e.stopImmediatePropagation(); } }, true);
/* a key lights when it is pressed (about 0.3 s), by him or by the demonstration */
function c1KeyFlash(op){ UI.c1Press = { op, at:Date.now() }; setTimeout(() => { if(UI.c1Press && Date.now() - UI.c1Press.at >= 280){ UI.c1Press = null; document.querySelectorAll('.c1-keys .press').forEach(b => b.classList.remove('press')); } }, 300); }
/* a Sheet Callout under a cell, pointer up at it: the job, HOW A FORMULA WORKS, WHY 27? */
function c1ScoHtml(T, btnId, text){ return `<div class="ash-co c1-sco" data-c1sco role="dialog" aria-label="${esc(T.title || T.eyebrow || '')}"><i class="c1-sco-ptr" aria-hidden="true"></i>
  ${T.eyebrow ? `<span class="ash-coe">${esc(T.eyebrow)}</span>` : ''}${T.title ? `<b class="ash-cot">${esc(T.title)}</b>` : ''}${(text || T.text || []).map(p => `<p>${c1Html(p)}</p>`).join('')}
  ${T.button ? `<div class="ash-coa"><button class="bv-btn primary" id="${btnId}">${esc(T.button).replace('▶', '&#9654;')}</button></div>` : ''}</div>`; }
const c1LaunchPage0 = ashLaunchPage;
ashLaunchPage = function(st){
  if(!ch1() || (UI.ashTab && UI.ashTab !== 'launch')) return c1LaunchPage0.apply(this, arguments);
  UI.ashTab = null; const sp = ashLaunchSpec(), C = sp.c1 || {}, stage = C.stage, X = C.X || c1Ld(), all = stage === 'done'; if(all) ashKeep('launch', sp);
  const nextT = (S.steps[S.si + 1] || {}).t, toDesk = nextT === 'fuelDesk';
  const T = id => c1T(id), foot = { job:'launch.job.footer', demo:'launch.demo.footer', how:'launch.how.footer', done:'launch.done.footer' };
  let hint = '', btn = `<button class="bv-btn primary big" id="ashNext" ${sp.just ? '' : 'disabled'}>Next &#9654;</button>`;
  if(stage === 'sum' || stage === 'why'){ const a = sp.act || sp.just; hint = (a && a === C.paper) || (stage === 'why' && C.why && C.paper && ashRef(C.paper.tgt).c === C.why.c) ? (T('launch.paper.footer').text[0] || '') : (T('launch.build.footer').text[0] || ''); }
  else if(foot[stage]) hint = T(foot[stage]).text[0] || '';
  if(stage === 'demo' || stage === 'how') btn = `<button class="bv-btn primary big" disabled>${esc(T('launch.how').button || 'Your turn ▶').replace('▶', '&#9654;')}</button>`;
  if(all){ const D = T('launch.done.footer'); btn = `<button class="bv-btn big ${toDesk ? 'primary' : 'go'}" id="nx">${toDesk ? 'Fuel desk' : esc(D.button || 'Ready to fly ▶').replace(' ▶', '')} &#9654;</button>`; }
  screen().innerHTML = shell(`<div class="dp ash-page c1-ld c1-ld-${esc(stage || '')}">${ashHtml(sp)}</div>`, deskBar(hint, backBtn() + btn));
  ashBind(sp); on('ashNext', ashNextSum); on('nx', () => { UI.ashJust = null; finishSums(); });
  screen().querySelectorAll('[data-ashcosts]').forEach(b => b.onclick = () => ashCostsPop(b));
  const root = screen(), gw = root.querySelector('.ash-gridw'), cell = ref => root.querySelector(`.ash-grid .ash-c[data-ref="${ref}"]`); if(!gw) return;
  const place = (el, ref) => c1Place(el, cell(ref), 'below', { dx:0 });
  if(stage === 'job' && C.demo){ gw.insertAdjacentHTML('beforeend', c1ScoHtml(T('launch.job'), 'c1Watch')); place(gw.querySelector('[data-c1sco]'), C.demo.tgt);
    on('c1Watch', () => { X.job = S.day || 1; save(); render(); }); }
  if(stage === 'demo'){ root.querySelector('.ash').classList.add('c1-demo'); c1DemoRun(); }
  if(stage === 'how' && C.demo){ const d = C.demo, H = T('launch.how'), vals = { a:d.refs[0], b:d.refs[1], money:money(d.want) };
    gw.insertAdjacentHTML('beforeend', c1ScoHtml(H, 'c1HowGo', c1T('launch.how', vals).text)); place(gw.querySelector('[data-c1sco]'), d.tgt);
    gw.querySelectorAll('[data-c1sco] p b').forEach(b => { if(/^=\s/.test(b.textContent)) b.innerHTML = esc(b.textContent).replace(d.refs[0], `<span class="c1-r1">${d.refs[0]}</span>`).replace(d.refs[1], `<span class="c1-r2">${d.refs[1]}</span>`); });
    [[d.refs[0], 'A'], [d.refs[1], 'B']].forEach(([r, tg]) => { const c = cell(r); if(c){ c.classList.add('aref'); c.setAttribute('data-tag', tg); } });
    const c4 = cell(d.tgt); if(c4) c4.classList.add('c1-glow');
    on('c1HowGo', () => { X.how = S.day || 1; UI.ashJust = null; save(); render(); }); }
  if(stage === 'why' && C.why){ const w = C.why, W = c1T('why27', { pax:w.pax, want:w.want, route:routeById(w.route).city, fare:w.fare, times:w.times, rest:w.rest });
    gw.insertAdjacentHTML('beforeend', c1ScoHtml(W, 'c1WhyGot')); const wel = gw.querySelector('[data-c1sco]'); wel.classList.add('pr'); c1Place(wel, cell(w.c + 4), 'below', { dx:-230 });
    const c2 = cell(w.c + 2); if(c2) c2.classList.add('c1-ring');
    const ln = root.querySelector('.ash-line'); if(ln) ln.textContent = c1T('why27.line').text[0] || 'Read the note, then press Got it.';
    on('c1WhyGot', () => { X.why = S.day || 1; save(); render(); }); }
  const a = stage === 'sum' ? sp.act : null;
  if(a && a === C.build){ const r = routeById(S.market), B = c1T('launch.build', { route:r.city, fare:(a.opVals || [])[1] || '' });
    gw.insertAdjacentHTML('beforeend', c1SignalHtml({ kind:'build', title:B.title, lines:B.text.slice(0, 2).map(t => c1Html(t)), ptr:'up' })); place(gw.querySelector('[data-c1sig]'), a.tgt);
    root.querySelectorAll('[data-c1bhint]').forEach(b => b.onclick = () => { const s = ashSt(sp.id); s.msg = `Click ${a.refs[0]} (the passengers), press ×, then click ${a.refs[1]} (the fare). Then press Enter.`; s.q = false; render(); }); }
  if(a && a === C.paper){ const r = routeById(S.market), Pp = c1T('launch.paper', { route:r.city, fare:(a.opVals || [])[1] || '' });
    gw.insertAdjacentHTML('beforeend', c1SignalHtml({ kind:'paper', title:Pp.title, lines:c1PaperLines(a.no, a.tgt), ptr:'up' })); place(gw.querySelector('[data-c1sig]'), a.tgt); }
  if(all && !X.glow){ sp.cols.forEach(k => { if(k.src && k.src.route !== S.market){ const c = cell(k.c + 4); if(c) c.classList.add('c1-glow'); } });
    const f9 = cell(sp.cols[sp.cols.length - 1].c + 9); if(f9) f9.classList.add('c1-glow'); X.glow = S.day || 1; save(); }
};
if(window.__tkSums){
  window.__tkSums.unshift({ what:'the Launch Day job: Watch', test:() => !!document.getElementById('c1Watch'), plan:() => ({ at:'#c1Watch', value:'Watch', go:() => document.getElementById('c1Watch').click() }) });
  window.__tkSums.unshift({ what:"Finance's demonstration", test:() => { const sp = ashLive(); return !!(sp && sp.c1 && sp.c1.stage === 'demo'); }, plan:() => ({ at:'.c1-keys', value:'skip the demonstration', go:c1DemoSkip }) });
  window.__tkSums.unshift({ what:'How a formula works: Your turn', test:() => !!document.getElementById('c1HowGo'), plan:() => ({ at:'#c1HowGo', value:'Your turn', go:() => document.getElementById('c1HowGo').click() }) });
  window.__tkSums.unshift({ what:'Why 27?: Got it', test:() => !!document.getElementById('c1WhyGot'), plan:() => ({ at:'#c1WhyGot', value:'Got it', go:() => document.getElementById('c1WhyGot').click() }) }); }
window.__c1ld = { skip:c1DemoSkip, state:() => { const sp = ashLive(); return sp && sp.c1 ? { stage:sp.c1.stage, why:sp.c1.why } : null; } };

/* ---------- every other sheet question gets its signal too (the Monday sheet, the Changes sheet): beside its answer cell
   when there is room to the right of the sheet, otherwise under it ---------- */
const c1Bind0 = ashBind;
ashBind = function(sp){
  const r = c1Bind0.apply(this, arguments);
  try{ if(!ch1() || !sp || !sp.act) return r; const root = document.querySelector(`[data-ash="${CSS.escape(sp.id)}"]`); if(!root) return r;
    c1BarEnter(sp, root);
    if(document.querySelector('[data-c1sig], [data-c1watch]') || root.querySelector('.ash-co') || /^week:/.test(sp.id) || /^launch:/.test(sp.id)) return r;
    const a = sp.act, gw = root.querySelector('.ash-gridw'), cell = gw && gw.querySelector(`.ash-c[data-ref="${a.tgt}"]`); if(!gw || !cell) return r;
    const build = a.how === 'formula' || (a.how === 'build' && !a.no), title = a.title || (a.name ? a.name.charAt(0).toUpperCase() + a.name.slice(1) : a.words || '');
    gw.insertAdjacentHTML('beforeend', c1SignalHtml(build ? { kind:'build', title, lines:[`Click the cells it uses, then press ${c1Key('Enter')}.`, 'The sheet works it out.'] } : { kind:'paper', title, lines:c1PaperLines(a.no, a.tgt) }));
    const el = gw.querySelector('[data-c1sig]'), grid = gw.querySelector('.ash-grid'), G = grid.getBoundingClientRect(), W = gw.getBoundingClientRect(), room = window.innerWidth - G.right;
    if(room > 330) c1Place(el, cell, 'side', { x:G.right - W.left + 16 }); else { el.classList.add('ptr-up'); el.classList.replace('ptr-left', 'ptr-up'); c1Place(el, cell, 'below', { dx:0 }); }
  }catch(e){}
  return r;
};

/* =====================================================================
   5. THE KEY ROW AND THE REFERENCE COLOURS (hand-off 3, section 1; DESIGN.md of 30 Oct evening). On every chapter-one sheet
   the formula bar is shortened and a row of keys sits to its right: × ÷ + − (40 × 34) and Enter ↵ (78 wide). The operators
   are live while a formula is being built, Enter when it is complete (or a Σ SUM range is held, or an answer is typed);
   otherwise the keys are dimmed. A pressed key lights for about 0.3 s. Undo (and Σ SUM) stay at the end of the bar. The
   first cell in a formula is cyan, the second ref-2 violet (outline, tag and its name in the bar); a third or later keeps
   cyan outlines without tags.
   ===================================================================== */
const c1Html0 = ashHtml;
ashHtml = function(sp){
  const html = c1Html0.apply(this, arguments); if(!ch1()) return html;
  const i = html.indexOf('<div class="ash-fb"'), j = i < 0 ? -1 : html.indexOf('</div>', i); if(i < 0 || j < 0) return html;
  let fb = html.slice(i, j + 6);
  fb = fb.replace(/<button data-ashop="(×|÷|\+|−)" aria-label="[^"]*">[^<]*<\/button>/g, '');   // the operators move to the key row
  fb = fb.replace(/<span class="ash-f">([\s\S]*?)<\/span><small/, (m, f) => { const n = (f.match(/<b>/g) || []).length; let k = 0;
    return '<span class="ash-f">' + (n === 2 && !/SUM\(/.test(f) ? f.replace(/<b>/g, b => ++k === 2 ? '<b class="r2">' : b) : f) + '</span><small'; });
  const act = sp.act, st = ashSt(sp.id), building = /data-ashref=/.test(html), typing = /data-ashin=/.test(html);
  const held = !!(act && act.sumKey && st.sigma && st.sumA && !st.drag), opsOn = building && !st.ready && !st.sigma, enterOn = (building && st.ready) || held || typing;
  const pr = UI.c1Press && Date.now() - UI.c1Press.at < 300 ? UI.c1Press.op : null;
  const keys = `<div class="c1-keys ${opsOn || enterOn ? '' : 'dim'}" role="group" aria-label="Formula keys">${['×', '÷', '+', '−'].map(o => `<button class="c1-k ${pr === o ? 'press' : ''}" data-ashop="${o}" ${opsOn ? '' : 'disabled'} aria-label="${o}">${o}</button>`).join('')}<button class="c1-k c1-ke ${pr === 'enter' ? 'press' : ''}" data-c1kenter ${enterOn ? '' : 'disabled'} aria-label="Enter">Enter ↵</button></div>`;
  return html.slice(0, i) + `<div class="c1-fbrow">${fb}${keys}</div>` + html.slice(j + 6);
};
const c1KBind0 = ashBind;
ashBind = function(sp){
  const r = c1KBind0.apply(this, arguments);
  try{ if(!ch1() || !sp) return r; const root = document.querySelector(`[data-ash="${CSS.escape(sp.id)}"]`), keys = root && root.querySelector('.c1-keys'); if(!keys) return r;
    keys.querySelectorAll('[data-ashop]').forEach(b => { const go = b.onclick; b.onclick = e => { c1KeyFlash(b.getAttribute('data-ashop')); if(go) go.call(b, e); }; });
    const en = keys.querySelector('[data-c1kenter]'); if(en) en.onclick = () => { const st = ashSt(sp.id); c1KeyFlash('enter');
      if(sp.act && sp.act.sumKey && st.sigma && st.sumA) ashSumEnter(sp); else if(st.ready) c1Enter(sp); else ashEnter(sp); };
  }catch(e){}
  return r;
};
