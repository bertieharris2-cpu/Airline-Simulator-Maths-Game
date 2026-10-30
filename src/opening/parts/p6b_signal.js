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
   - Launch Day: Finance works out the first and third fares while he watches; his fare on paper (Sum 1); Paris and the
     profit are Finance's; then One flight, two ways (Sum 2). Fuel on Launch Day is a cost (600 L at £1.20).
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
  const act = sp.act, st = ashSt(sp.id), fb = root && root.querySelector('.ash-fb'); if(!act || !fb || fb.querySelector('.c1-fbenter')) return;
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
  const dl = d => dateLong(d).split(' '), sub = exOn ? c1T('review.example.sub').text[0] : `Your ${wk === 1 ? 'first ' : ''}week of flying, ${dl(W.from).slice(0, 2).join(' ')} to ${dl(W.from + 6).slice(0, 3).join(' ')}`;
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
   4. LAUNCH DAY: watch, do, watch, compare (SheetSums Launch Day rows: B4 watch, C4 book, D4 watch, E4 and the plan's
   column ƒ, B13 book; Settings launchDayFares, launchDayComparison, fuelLaunchDay)
   ===================================================================== */
if(typeof ASH_SUMS !== 'undefined'){ ASH_SUMS['launch.otherTickets'] = { whose:'ƒ', how:'airline' }; ASH_SUMS['launch.profit'] = { whose:'ƒ', how:'airline' }; }   // Paris and the profit are Finance's (hand-off 2, section 4)
const c1LdRow = cell => (((typeof WB !== 'undefined' && WB && WB.sheetSums) || []).find(x => x.sheet === 'Launch Day' && String(x.cell) === cell) || {});
function c1Compare(){ const m = [...String(WBS().launchDayComparison || '14 at £130 against 19 at £90').matchAll(/(\d+)\s*at\s*£(\d+)/g)].map(x => ({ p:+x[1], f:+x[2] })); return m.length >= 2 ? m.slice(0, 2) : [{ p:14, f:130 }, { p:19, f:90 }]; }
/* Finance's method in the class's words (DESIGN.md: "£80 is 8 × 10. First work out 38 × 8." … never "take the 0 off") */
function c1WatchMath(p, fare){
  let k = 0, m = fare; while(m % 10 === 0 && m > 0){ m /= 10; k++; } const ten = Math.pow(10, k), part = p * m, res = p * fare;
  if(m >= 10 || !k) return { lines:[`**£${fare}**: ${num(p)} × ${fare} = **${num(res)}**. Ticket revenue **${money(res)}**.`], m, ten, part, res, carries:[] };
  if(m === 1) return { lines:[`**£${fare} is 1 × ${num(ten)}.** First work out ${num(p)} × 1 = ${num(p)}.`, `Then multiply by ${num(ten)}: ${num(p)} × ${num(ten)} = **${num(res)}**.`], m, ten, part, res, carries:[] };
  const ds = String(p).split('').map(Number).reverse(), bits = [], carries = []; let c = 0;
  ds.forEach((d, i) => { const v = d * m + c, last = i === ds.length - 1;
    if(i === 0) bits.push(last ? `${d} × ${m} = ${v}.` : v >= 10 ? `${d} × ${m} = ${v}: write ${v % 10}, carry ${Math.floor(v / 10)}.` : `${d} × ${m} = ${v}: write ${v}.`);
    else bits.push(`${d} × ${m} = ${d * m}${c ? `, add the ${c}: ${v}` : ''}${last ? '.' : v >= 10 ? `: write ${v % 10}, carry ${Math.floor(v / 10)}.` : '.'}`);
    c = last ? 0 : Math.floor(v / 10); if(c) carries.push({ col:i + 1, v:c }); });
  return { lines:[`**£${fare} is ${m} × ${num(ten)}.** First work out ${num(p)} × ${m}.`, bits.join(' '), `**${num(p)} × ${m} = ${num(part)}.**`, `Then multiply by ${num(ten)}: ${num(part)} × ${num(ten)} = **${num(res)}**. Ticket revenue **${money(res)}**.`], m, ten, part, res, carries };
}
/* Bertie's long multiplication grid: place-value headings, the answer between thick rules, a thin carry strip, then × 10 */
function c1WatchGrid(p, X){
  if(X.m >= 10 || X.ten === 1) return '';
  const n = Math.max(4, String(X.res).length), H = ['HTh', 'TTh', 'Th', 'H', 'T', 'O'].slice(-n), cellsOf = v => { const s = String(v); return Array.from({ length:n }, (_, i) => s[s.length - n + i] || ''); };
  const row = (vals, cls, lead) => `<div class="c1-lm-r ${cls || ''}"><span class="c1-lm-l">${lead || ''}</span>${vals.map(v => `<span>${esc(v)}</span>`).join('')}</div>`;
  const carry = Array.from({ length:n }, (_, i) => { const col = n - 1 - i, c = X.carries.find(z => z.col === col); return c ? String(c.v) : ''; });
  const mRow = Array.from({ length:n }, (_, i) => i === n - 1 ? String(X.m) : '');
  return `<div class="c1-lm" aria-label="Long multiplication">${row(H, 'hd')}${row(cellsOf(p), 'r1')}${row(mRow, 'r2', '×')}${row(X.m === 1 ? cellsOf(p) : cellsOf(X.part), 'ans r3')}${X.m === 1 ? '' : row(carry, 'carry r3')}<div class="c1-lm-gap"></div>${row(cellsOf(X.res), 'ten r4', '×' + num(X.ten))}</div>`;
}
function c1WatchHtml(p, fare){
  const X = c1WatchMath(p, fare), W = c1T('launch.watch');
  return `<section class="c1-watch ${settings.reduceMotion ? 'still' : ''}" data-c1watch role="region" aria-label="${esc(W.eyebrow || 'Finance works it out')}"><span class="c1-watch-e">${esc(W.eyebrow || 'FINANCE WORKS IT OUT · WATCH')}</span>
    <div class="c1-watch-b">${c1WatchGrid(p, X)}<div class="c1-watch-l">${X.lines.map((l, i) => `<p style="--i:${i}">${c1Html(l)}</p>`).join('')}</div></div></section>`;
}
const c1Launch0 = ashLaunchSpec;
ashLaunchSpec = function(){
  const sp = c1Launch0.apply(this, arguments); if(!ch1() || !S || S.phase !== 'setup') return sp;
  const v = sp.v, P = sp.cols[sp.cols.length - 1].c, X = c1Ex(), L0 = (() => { try{ return planLines(currentPlan()); }catch(e){ return null; } })();
  // the fuel line: the fuel burned that day at the launch price, in Total costs (fuelLaunchDay)
  const litres = (() => { try{ return plannedLitres(currentPlan()); }catch(e){ return 0; } })(), price = fuelOn(1);
  const r7 = sp.rows.find(r => r.r === 7); if(r7 && litres) r7.note = c1T('launch.fuel', { litres:`${num(litres)} L`, price:priceL(price) }).text[0] || `${num(litres)} L at ${priceL(price)}`;
  ['5', '7', '8', '9'].forEach(r => { if(v[P + r] && v[P + r].t) v[P + r].f = true; });
  // the three fares: watch, his (paper), watch, by the workbook's cells; the other routes are Finance's
  sp.sums.forEach(s => { delete s.co; });   // the signal says what to do; the watch panel shows the method (no NEW SUM note)
  const tk = sp.sums.filter(s => s.kind === 'tickets');
  sp.cols.forEach(k => { if(k.src && k.src.route !== S.market && v[k.c + 4] && v[k.c + 4].t) v[k.c + 4].f = true; });
  tk.forEach(s => { const how = c1LdRow(s.tgt).how; s.c1how = how === 'watch' ? 'watch' : 'book'; if(s.c1how === 'watch'){ s.how = 'book'; if(v[s.tgt] && v[s.tgt].t) v[s.tgt].f = true; } });
  const all = sp.sums.filter(s => s.kind !== 'tickets' || true), fares = tk.every(s => s.done);
  // One flight, two ways (hand-off 2, section 4): new rows under the plan, once the fares are worked out
  if(fares && tk.length){ const C = c1Compare(), st = S.rnd.c1cmp || (S.rnd.c1cmp = {}), H = c1T('launch.compare.head'), want = C[0].p * C[0].f, key = 'c1:compare:' + (S.day || 1);
    sp.rows.push({ r:10, label:H.title || 'One flight, two ways', ic:'scale', t:'sub' }, { r:11, label:'Passengers on one flight', ic:'person' }, { r:12, label:'Fare', ic:'tag' }, { r:13, label:'Ticket revenue', ic:'coins', gold:true });
    v.B10 = { t:`${C[0].p} at ${money(C[0].f)}` }; v.C10 = { t:`${C[1].p} at ${money(C[1].f)}` }; v.B11 = { t:num(C[0].p) }; v.C11 = { t:num(C[1].p) }; v.B12 = { t:money(C[0].f) }; v.C12 = { t:money(C[1].f) };
    v.C13 = { t:money(C[1].p * C[1].f), f:true }; if(st.ok) v.B13 = { t:money(want), fin:!!st.shown };
    const rec1 = (good, raw) => { try{ const e = recOpen(key, { type:'calc', relKey:'tickets', doc:'Launch Day: One flight, two ways', ask:'Which earns more?', question:`${C[0].p} passengers × ${money(C[0].f)}`, unit:'£', correct:want, correctText:money(want) }); recAttempt(e, { ok:good, text:String(raw) }); if(good) e.status = 'checked'; }catch(x){} };
    sp.sums.push({ id:'c1cmp', kind:'compare', tgt:'B13', refs:['B11', 'B12'], ops:['×'], words:'Passengers × Fare', lit:['B', 11, 'C', 13], how:'book', commute:true, unit:'£', done:!!st.ok, built:true, want, recKey:key, get no(){ return sumNo(key); },
      name:'the ticket revenue for one flight', answerText:money(want), doneLine:`One flight, two ways: <b class="gold">${money(want)}</b> against ${money(C[1].p * C[1].f)}`,
      answer:(raw, val) => { const good = Math.abs(val - want) < 0.5; rec1(good, raw); if(good){ st.ok = true; return { ok:true }; } st.tries = (st.tries || 0) + 1; if(st.tries >= 2 && twoTriesOn()){ st.ok = true; st.shown = true; try{ paperRecShown(key); }catch(x){} return { shown:true }; } return { note:ashWrong('×', [C[0].p, C[0].f], val, want, '£') }; },
      hints:() => ashHintsFor('passengers × fare', '×', C[0].p, C[0].f, want, true), how2:() => ashHowFor('×', C[0].p, C[0].f, '£', 'Ticket revenue = Passengers × Fare') }); }
  // which sum now: the first not done; a watch sum is Finance's turn (the cell is worked out in the panel, not typed)
  const J = sp.just, act = J ? null : sp.sums.find(s => !s.done && !(s.kind === 'profit')) || null;
  sp.sums.forEach(s => { if(s.kind === 'tickets' && s.c1how === 'watch') Object.defineProperty(s, 'no', { value:null, configurable:true, writable:true }); });   // Finance's turn takes no Sum number
  sp.act = act; sp.c1watch = act && act.c1how === 'watch' ? act : null;
  if(sp.c1watch){ const a = sp.c1watch, rt = (sp.cols.find(k => k.c === ashRef(a.tgt).c) || {}).src || {}, V = (rt.t && (rt.t.cols.find(c => c.id === rt.col) || {}).values) || {};
    a.pax = V['pax_' + rt.route] || 0; a.fare = V['fare_' + rt.route] || 0; a.route = rt.route; a.hints = null; a.how2 = null; a.lineType = ' ';
    a.cellIn = () => `<span class="c1-watchval gold">${esc(money(a.pax * a.fare))}</span>`; a.answer = () => ({}); }
  if(act && act.kind === 'profit') sp.act = null;
  if(!sp.act && !J){ const last = sp.sums.find(s => s.kind === 'compare') || sp.sums[sp.sums.length - 1]; if(last) sp.doneF = { tgt:last.tgt, refs:last.refs, ops:last.ops, words:last.words, val:last.answerText || money(last.want) }; }
  return sp;
};
function c1LaunchWatched(){
  const sp = ashLive(); if(!sp || !sp.c1watch) return; const a = sp.c1watch, T = (S.rnd.tables && S.rnd.tables[a.t.id]) || a.t, k = cellId(a.col, a.row);
  T.done[k] = true; T.chosen[k] = true; (S.rnd.c1watched = S.rnd.c1watched || {})[a.tgt] = true; UI.ashJust = null; save(); render();
}
const c1LaunchPage0 = ashLaunchPage;
ashLaunchPage = function(st){
  if(!ch1() || (UI.ashTab && UI.ashTab !== 'launch')) return c1LaunchPage0.apply(this, arguments);
  UI.ashTab = null; const sp = ashLaunchSpec(), all = !sp.act && !sp.just; if(all) ashKeep('launch', sp);
  const nextT = (S.steps[S.si + 1] || {}).t, toDesk = nextT === 'fuelDesk', go = toDesk ? 'Fuel desk' : 'Take off', W = sp.c1watch;
  const routeOf = s => { const k = sp.cols.find(c => c.c === ashRef(s.tgt).c); return k && k.src ? routeById(k.src.route) : routeById(S.market); };
  let hint, btn;
  if(W){ const r = routeOf(W), T = c1T('launch.watch.footer', { route:r.city, fare:W.fare }); hint = T.text[0] || `Launch Day · watch Finance work out ${r.city} at £${W.fare}.`; btn = `<button class="bv-btn primary big" id="c1Watched">${esc(T.button || 'Your turn ▶').replace('▶', '&#9654;')}</button>`; }
  else if(all){ hint = toDesk ? 'Launch Day sheet done. Next, this week\'s fuel on the Fuel desk. Back changes the plan.' : 'Launch Day sheet done: Finance has totted up your plan, fuel included. Back changes the plan.'; btn = `<button class="bv-btn big ${toDesk ? 'primary' : 'go'}" id="nx">${go} &#9654;</button>`; }
  else { const a = sp.act || sp.just; hint = a && a.kind === 'compare' ? (c1T('launch.compare.footer').text[0] || 'Launch Day · the last question.') : a ? `Launch Day · your turn: ${routeOf(a).city} at ${money((a.opVals || [])[1] || 0)}.` : '';
    btn = `<button class="bv-btn primary big" id="ashNext" ${sp.just ? '' : 'disabled'}>Next &#9654;</button>`; }
  screen().innerHTML = shell(`<div class="dp ash-page c1-ld">${ashHtml(sp)}</div>`, deskBar(hint, backBtn() + btn));
  ashBind(sp); on('ashNext', ashNextSum); on('nx', () => { UI.ashJust = null; finishSums(); }); on('c1Watched', c1LaunchWatched);
  screen().querySelectorAll('[data-ashcosts]').forEach(b => b.onclick = () => ashCostsPop(b));
  // the panel and the signals, over empty cells
  const root = screen(), gw = root.querySelector('.ash-gridw'), cell = ref => root.querySelector(`.ash-grid .ash-c[data-ref="${ref}"]`);
  if(!gw) return;
  if(W){ gw.insertAdjacentHTML('beforeend', c1WatchHtml(W.pax, W.fare)); const el = gw.querySelector('[data-c1watch]'), c0 = cell('B' + ashRef(W.tgt).r); c1Place(el, c0, 'below', { dx:6 }); }
  const a = sp.act && !W ? sp.act : null;
  if(a){ const cmp = a.kind === 'compare', r = cmp ? null : routeOf(a), T = cmp ? c1T('launch.compare', { p:c1Compare()[0].p, fare:c1Compare()[0].f, n:a.no, cell:a.tgt }) : c1T('launch.paper', { route:r.city, fare:(a.opVals || [])[1] || '' });
    const lines = cmp ? T.text.map(t => c1Html(t, a.no)) : c1PaperLines(a.no, a.tgt);
    gw.insertAdjacentHTML('beforeend', c1SignalHtml({ kind:'paper', title:T.title, lines, ptr:cmp ? 'left' : 'up' }));
    const el = gw.querySelector('[data-c1sig]');
    if(cmp){ el.classList.add('wide'); const cC = cell('C13'), H = gw.getBoundingClientRect(), R = cC ? cC.getBoundingClientRect() : null; if(R) c1Place(el, cell('B11'), 'side', { x:R.right - H.left + 18 }); }
    else c1Place(el, cell(a.tgt), 'below', { dx:0 }); }
};
if(window.__tkSums) window.__tkSums.unshift({ what:'Finance works it out', test:() => !!document.getElementById('c1Watched'), plan:() => ({ at:'#c1Watched', value:'Your turn', go:() => document.getElementById('c1Watched').click() }) });

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
