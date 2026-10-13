/* ==================================================================
   THE PUPIL RECORD AND PRINTOUT (Workbook v5.1, D75: Fable's brief "The pupil record and printout", 13 Oct 2026).
   Every sign-off, every review Build step and each week's decisions are kept in S.record (one per airline save), and the
   teacher panel prints them as a plain A4 record, by date or by kind of maths.
   - Calculation entries keep each attempt as it was made: the working typed on the service card or the column template
     (cell by cell, with the carries), the chips chosen on a Build card, the answer, Checked or Query, and for a Query a
     note naming the error, worked out from the working (recNote). Each entry stores the Bettws statement codes of its
     relationship (WorkingMethods.bettwsStatements) at the time, so a later change to the mapping leaves history alone.
   - Decision entries (one a week, or a period): the standing plan, what changed, events and choices, aircraft, fuel,
     news acted on, projected / actual / missed, stars. Teacher notes are a box a week.
   The capture wraps the check functions (soCalcCheck, soBuildCheck, checkCell, cellCorrect, rbCheck) and, for the checks
   written inline (the service card, the rent-or-buy box, the first fuel order), reads the screen just before the click and
   the state just after. Nothing here changes what the pupil sees or how a check is decided.
   ================================================================== */
const REC = { seen:{}, hold:false };   // on screen only: when each sum was first shown; a flag while the service card's own check runs
function rec(){ const r = S.record || (S.record = { v:1, pupil:'', entries:[], notes:{}, pend:{ events:[], fleet:[] } }); r.pend = r.pend || { events:[], fleet:[] }; r.notes = r.notes || {}; r.entries = r.entries || []; return r; }
const recNow = () => (S && S.phase !== 'setup' && S.day) || 1;
const recSeenKey = key => key + '@' + recNow();
function recSeen(key){ const k = recSeenKey(key); if(!REC.seen[k]) REC.seen[k] = Date.now(); }

/* ---------- the kinds of maths: the game's sums → WorkingMethods.relationship ---------- */
const REC_REL = { tickets:'passengers × fare', seatsFare:'passengers × fare', audit:'passengers × fare', revenue:'passengers × fare', routeRevenue:'passengers × fare', snacks:'passengers × fare',
  fuel:'litres × price per litre', fuelCost:'litres × price per litre', fuelReq:'litres × price per litre', profit:'revenue − costs', totals:'revenue − costs',
  weekTotal:"week's total and the mean", projectedVsActual:"week's total and the mean", meanDay:"week's total and the mean", weekly:"week's total and the mean", periodTotal:"week's total and the mean", annual:"week's total and the mean",
  periodMean:'average of a period', average:'average of a period', difference:'difference between plans', emptySeats:'load factor', rivalStay:'tenths of passengers', weekendDemand:'tenths of passengers',
  flightTime:'flight time: distance ÷ speed', rentOrBuy:'price ÷ rent', timeToAfford:'price ÷ rent', fuelOrder:'fuel purchase', capacity:'time: service length, departures, duty day', timetable:'time: service length, departures, duty day',
  investment:'second-aircraft comparison' };
function recRel(key){ const name = REC_REL[key] || key || 'other', w = (WORLD.workingMethods || []).find(m => m.relationship === name); return { rel:w ? w.relationship : name, level:w ? w.level : '', codes:w && w.bettws ? w.bettws.slice() : [] }; }
const REC_SC_METHOD = { part:'partition the price', scale:'scale from 100 L', pence:'make it pence', dp:'count the decimal places', formal:'formal multiplication' };

/* ---------- entries ---------- */
function recFmt(unit, v){ if(v === null || v === undefined || v === '' || isNaN(v)) return String(v === undefined ? '' : v);
  if(unit === '£2' || (unit === '£' && Math.abs(v - Math.round(v)) > 0.004)) return twoDp(v); if(unit === '£') return money(v);
  if(unit === 'h'){ const h = Math.round(v * 100) / 100; return `${num(h)} hour${h === 1 ? '' : 's'}`; } if(unit === 'days'){ const d = Math.round(v * 10) / 10; return `${num(d)} day${d === 1 ? '' : 's'}`; } if(unit === 'L') return `${num(v)} L`; if(unit === 'ppl') return priceL(v); return num(Math.round(v * 100) / 100); }
/* the open entry for this sum today (a Query stays open until it is Checked), or a new one */
function recOpen(key, o){
  const R = rec(), day = recNow(), e = R.entries.find(x => x.key === key && x.day === day && x.status !== 'checked' && x.status !== 'shown'); if(e) return e;
  const rel = recRel(o.relKey), n = { id:'r' + (R.entries.length + 1), type:o.type || 'calc', key, day, date:dateLong(day), week:weekNo(day), chapter:chapterNo(day), doc:o.doc || '', ask:o.ask || '', question:o.question || '',
    rel:rel.rel, relLevel:rel.level, level:o.level || '', codes:rel.codes, unit:o.unit || '', correct:o.correct, correctText:o.correctText || recFmt(o.unit, o.correct), ops:o.ops || null, op:o.op || '', method:o.method || '', attempts:[], status:'open', t0:REC.seen[recSeenKey(key)] || Date.now() };
  R.entries.push(n); return n;
}
function recAttempt(e, a){
  a.at = Date.now(); if(a.method) e.method = a.method; e.attempts.push(a);
  if(a.shown){ e.status = 'shown'; e.ms = a.at - e.t0; }
  else if(a.ok){ e.status = 'checked'; e.ms = a.at - e.t0; }
  else { e.status = 'query'; if(!a.note) a.note = recNote(e, a); }
  if(typeof save === 'function') save();
}

/* ---------- 1. the sign-off cards (Calculate and Build) ---------- */
const recSoSpec0 = soSpec;
soSpec = function(it){ const sp = recSoSpec0(it); if(sp) Object.defineProperty(sp, 'it', { value:it, enumerable:false, configurable:true }); return sp; };
function recSoMethod(sp){ if(sp.op === '÷'){ let x = sp.a.v, y = sp.b.v, k = 0; while(x % 10 === 0 && y % 10 === 0 && x && y){ x /= 10; y /= 10; k++; } return k ? 'make the sum smaller, then short division (suggested)' : 'short division (suggested)'; }
  return sp.b.f === 'ppl' ? 'partition the price (suggested)' : 'partition, or formal multiplication (suggested)'; }
function recSoEntry(sp){ const it = sp.it || {};
  return recOpen('so:' + it.key, { type:it.level === 'build' ? 'build' : 'calc', relKey:it.rel, doc:sp.title, ask:sp.ask, question:`${soFmt(sp.a.f, sp.a.v)} ${sp.op} ${soFmt(sp.b.f, sp.b.v)}`, unit:sp.res, correct:soAns(sp),
    correctText:soFmt(sp.res, soAns(sp)), ops:[sp.a.v, sp.b.v], op:sp.op, level:it.level === 'build' ? 'Build' : 'Calculate' }); }
const recSoCalc0 = soCalcCheck;
soCalcCheck = function(sp, cs){ const ok = recSoCalc0(sp, cs);
  try{ if(sp && sp.it && (ok || cs.q)) recAttempt(recSoEntry(sp), { ok, given:String(cs.v || '').trim(), value:soParse(cs.v, sp.res), method:recSoMethod(sp), msg:cs.msg }); }catch(e){}
  return ok; };
const recSoBuild0 = soBuildCheck;
soBuildCheck = function(sp, cs){ const ok = recSoBuild0(sp, cs);
  try{ if(sp && sp.it && (ok || cs.q)){ const figs = [sp.a, sp.b].concat(sp.dis || []), chips = cs.tokens.map(k => OPS4.includes(k) ? { op:k } : (f => f ? { label:f.label, text:soFmt(f.f, f.v), k } : { label:k })(figs.find(f => f.k === k)));
    recAttempt(recSoEntry(sp), { ok, chips, msg:cs.msg, want:{ a:sp.a.k, b:sp.b.k, op:sp.op }, method:'choose the figures and the operation' }); } }catch(e){}
  return ok; };
const recSoCard0 = soCardHtml;
soCardHtml = function(it, st, n){ if(it && it.level !== 'model' && !it.done) recSeen('so:' + it.key); return recSoCard0(it, st, n); };

/* ---------- 2. the review Build steps (total, difference, mean) ---------- */
function recRbRel(it){ const t = (step() || {}).t; if(it.kind === 'mean') return t === 'weekReview' ? 'meanDay' : 'periodMean'; if(it.kind === 'sum') return t === 'chapterReview' ? 'totals' : 'weekTotal'; return 'projectedVsActual'; }
function recRbDoc(it){ const t = (step() || {}).t, P = S.period; const where = t === 'weekReview' ? `Week ${weekNo(S.wk && S.wk.from || S.day)} accounts` : t === 'chapterReview' ? `Chapter ${chapterNo()} accounts` : t === 'audit' ? 'Board review' : P ? `${capFirst(periodShort(lastHist() || { type:P.type, from:P.from, to:P.to }))} review` : 'Review';
  return it.title && it.title !== where ? `${where}: ${it.title}` : where; }
const recRbCheck0 = rbCheck;
rbCheck = function(it, st){ const ok = recRbCheck0(it, st);
  try{ if(it && (ok || st.q)){
    const e = recOpen('rb:' + it.id, { type:'build', relKey:recRbRel(it), doc:recRbDoc(it), ask:it.ask, question:it.kind === 'mean' ? `${it.totalLabel} ${money(it.total)} shared between the ${it.per}s` : (it.figs || []).map(f => `${f.short || f.label} ${money(f.v)}`).join(', '),
      unit:'£', correct:rbValue(it), correctText:rbResultWords(it), level:'Build' });
    const chips = it.kind === 'mean' ? [{ label:it.totalLabel, text:money(it.total) }, { op:st.op || '?' }, { label:'', text:String(st.div || '') }] : st.tokens.map(k => OPS4.includes(k) ? { op:k } : (f => f ? { label:f.short || f.label, text:money(f.v), k } : { label:k })((it.figs || []).find(f => f.k === k)));
    recAttempt(e, { ok, chips, msg:st.msg, kind:it.kind, div:it.div, divGiven:st.div, per:it.per, figs:(it.figs || []).map(f => ({ k:f.k, label:f.short || f.label })), method:it.kind === 'mean' ? 'show the divisor (total ÷ number)' : it.kind === 'sum' ? 'show what to add' : 'larger − smaller' }); } }catch(e){}
  return ok; };
const recRbCard0 = rbCardHtml;
rbCardHtml = function(it, st, store){ if(it && !st.ok && !it.locked) recSeen('rb:' + it.id); return recRbCard0(it, st, store); };

/* ---------- 3. the cell tables and the column template (wkGrid) ---------- */
/* the column template as the pupil left it: the two given lines, each working line with its carries, the answer line */
function recReadGrid(t, col, row){
  const g = screen().querySelector('.wkb'); if(!g) return null;
  const W = +g.style.getPropertyValue('--w') || 0, cells = [...g.querySelectorAll('input[data-r]')]; if(!cells.length) return null;
  const rows = [...new Set(cells.map(b => +b.dataset.r))].sort((a, b) => a - b), ansR = Math.max(...rows), pence = !!g.classList.contains('pence');
  const line = r => { const bs = cells.filter(b => +b.dataset.r === r).sort((a, b) => +a.dataset.c - +b.dataset.c); const whole = bs.filter(b => +b.dataset.c < W).map(b => b.value || ' ').join(''), pen = bs.filter(b => +b.dataset.c >= W).map(b => b.value || ' ').join(''); return pen ? whole + '.' + pen : whole; };
  const carry = r => { const s = Array.from({ length:W }, (_, c) => { const b = g.querySelector(`input[data-cy="${r}|${c}"]`); return b && b.value ? b.value : ' '; }).join(''); return s.trim() ? s : ''; };
  const ops = stackRows(t, col, row), A = ops[0], B = ops[1]; if(!A || !B) return null;
  const fa = wkFig(operandUnit(t, A.id), operandValue(t, col, A.id)), fb = wkFig(operandUnit(t, B.id), operandValue(t, col, B.id)), op = B.op || row.op || '×';
  const lines = [{ kind:'given', op:'', text:fa.s.padStart(W, ' ') }, { kind:'given', op, text:fb.s.padStart(W, ' ') }];
  if(fb.tenths) lines.push({ kind:'given', op:'÷', text:String(fb.div).padStart(W, ' ') });
  rows.filter(r => r !== ansR).forEach(r => { const c = carry(r); if(c) lines.push({ kind:'carry', op:'', text:c }); lines.push({ kind:'work', op:'', text:line(r), r }); });
  const cA = carry(ansR); if(cA) lines.push({ kind:'carry', op:'', text:cA });
  lines.push({ kind:'ans', op:'=', text:line(ansR), r:ansR });
  // which working lines are a partial product of the two figures (either way round), and how the answer differs digit by digit
  const a = +fa.s, b = +fb.s, parts = [], pp = (x, y) => String(y).split('').reverse().forEach((d, i) => { if(+d) parts.push({ v:x * +d * Math.pow(10, i), txt:`${num(x)} × ${num(+d * Math.pow(10, i))}` }); });
  if(op === '×'){ pp(a, b); pp(b, a); parts.push({ v:a * b, txt:`${num(a)} × ${num(b)}` }); }
  lines.forEach(L => { if(L.kind !== 'work') return; const v = +L.text.replace(/\D/g, ''); if(!L.text.trim()) return; L.value = v; L.ok = !parts.length || parts.some(p => p.v === v); if(!L.ok) L.near = parts.slice().sort((x, y) => Math.abs(x.v - v) - Math.abs(y.v - v))[0]; });
  const want = col.values[row.id], wantTxt = pence ? (Math.round(want * 100) / 100).toFixed(2) : String(Math.round(want)), wantS = wantTxt.padStart(lines[lines.length - 1].text.length, ' '), got = lines[lines.length - 1].text;
  lines[lines.length - 1].bad = got.split('').map((ch, i) => ch !== ' ' && ch !== wantS[i] ? i : -1).filter(i => i >= 0);
  return { W, pence, lines, a, b, op, parts:parts.map(p => ({ v:p.v, txt:p.txt })) };
}
function recCellIdentity(t, col, row){
  const sc = screen().querySelector('.sc-p1.sign') && UI.sc && UI.sc.F; if(sc) return recScIdentity(UI.sc.F);
  const ops = stackRows(t, col, row), q = ops.map((x, i) => (i ? x.op + ' ' : '') + x.value).join(' '), T = TABLES[t.kind] || {};
  return { key:'cell:' + t.id + '|' + col.id + '|' + row.id, o:{ type:'calc', relKey:row.tool || (/^tk/.test(row.id) ? 'revenue' : row.id), doc:`${T.title || 'Workings'}: ${rowLabel(t, row)}`, ask:'', question:q, unit:row.unit === '£' ? '£' : row.unit,
    correct:col.values[row.id], correctText:fmtVal(row.unit, col.values[row.id]), ops:ops.length === 2 ? [operandValue(t, col, ops[0].id), operandValue(t, col, ops[1].id)] : null, op:(ops[1] || {}).op || row.op || '', level:'Calculate' } };
}
function recScIdentity(F){ return { key:`sc:${F.p.id}|${F.r.id}|${F.price}`, o:{ type:'calc', relKey:'fuel', doc:`Fuel invoice: ${shortPlane(F.p)} on ${F.r.city}`, ask:'Check before payment:', question:`${num(F.L)} litres × ${priceL(F.price)}`,
  unit:'£2', correct:F.L * F.P / 100, correctText:twoDp(F.L * F.P / 100), ops:[F.L, F.price], op:'×', level:'Calculate' } }; }
function recMethodNow(){ if(screen().querySelector('.wkb')) return UI.sc && UI.sc.mUsed === 'formal' && screen().querySelector('.sc-p1.sign') ? 'formal multiplication (column template)' : 'formal written method (column template)';
  return UI.sumMode === 'pad' ? 'squared paper' : UI.sumMode === 'fx' ? 'the formula' : 'typed answer'; }
const recCheckCell0 = checkCell;
checkCell = function(t, col, row, raw){ const res = recCheckCell0(t, col, row, raw);
  if(!REC.hold && res !== 'blank'){ try{ const I = recCellIdentity(t, col, row), grid = recReadGrid(t, col, row), e = recOpen(I.key, I.o);
    recAttempt(e, { ok:res === 'ok', given:String(raw || '').trim(), value:parseCell(row.unit, raw), grid, method:recMethodNow(), res }); }catch(e){} }
  return res; };
const recCellCorrect0 = cellCorrect;
cellCorrect = function(t, byTeacher){
  try{ if(byTeacher && t && t.active){ const col = t.cols.find(c => c.id === t.active.col), row = tRows(t).find(r => r.id === t.active.row);
    if(col && row && !(row.tool && TOOL[row.tool] && toolLevel(row.tool) === 'build')){ const I = recCellIdentity(t, col, row), R = rec(), open = R.entries.find(x => x.key === I.key && x.day === recNow() && x.status === 'query');
      if(open) recAttempt(open, { shown:true, note:`Answer shown after ${open.attempts.length} ${open.attempts.length === 1 ? 'try' : 'tries'}.` }); } } }catch(e){}
  return recCellCorrect0(t, byTeacher); };
const recWkGrid0 = wkGrid;
wkGrid = function(t, col, row, o){ try{ if(t && col && row && !(o && (o.done || o.show))){ const I = recCellIdentity(t, col, row); recSeen(I.key); } }catch(e){} return recWkGrid0(t, col, row, o); };

/* ---------- 4. the checks written inline: the service card, rent or buy, the first fuel order ---------- */
function recBefore(id){
  if(id === 'scCheck'){ if(!screen().querySelector('.sc-p1.sign') || !UI.sc || !UI.sc.F) return null; const F = UI.sc.F, m = UI.sc.mUsed || 'part'; return { F, m, R:scRows(m, F), vals:Object.assign({}, UI.sc.vals) }; }
  if(id === 'rbChk'){ const st = step(), ch = S.rnd && S.rnd.acChoice; if(!st || !ch) return null; const p = planeById(ch.pid), o = acOffer(ch.pid); return { st, p, o, v:st.rbV, m:st.rbM || 'short' }; }
  if(id === 'fdSignChk'){ if(!UI.fd) return null; const P0 = fuelOn(S.day || 1), blk = fuelBlock(); return { n:UI.fd.selNow || 0, P0, blk, vals:Object.assign({}, UI.fd.vals) }; }
  return null;
}
function recAfter(id, B){
  if(id === 'scCheck'){ const q = UI.sc.q || {}, ok = !!UI.sc.ok && !Object.keys(q).length; if(!ok && !Object.keys(q).length) return;
    const I = recScIdentity(B.F); recSeen(I.key); const e = recOpen(I.key, I.o), F = B.F;
    const working = B.R.rows.map((x, i) => ({ lab:x.lab, typed:B.vals['r' + i] || '', want:scShow(x.unit, x.want), wantV:x.want, unit:x.unit, ok:!q['r' + i] }))
      .concat([{ lab:`${num(F.L)} L × ${priceL(F.price)}`, typed:B.vals.tot || '', want:twoDp(F.L * F.P / 100), wantV:F.L * F.P, unit:'£', ok:!q.tot, total:true }]);
    recAttempt(e, { ok, given:B.vals.tot || '', value:scParse('£', B.vals.tot) === null ? null : scParse('£', B.vals.tot) / 100, working, method:REC_SC_METHOD[B.m] || B.m, note:ok ? '' : recScNote(working) }); return; }
  if(id === 'rbChk'){ const st = B.st; if(!st.rbOk && !st.rbQ) return; const days = B.o.price / B.o.lease, e = recOpen('rob:' + B.p.id, { type:'calc', relKey:'rentOrBuy', doc:`Rent or buy: ${B.p.name}`, ask:'How many days of rent equal the price?',
      question:`${money(B.o.price)} ÷ ${money(B.o.lease)} a day`, unit:'days', correct:days, correctText:recFmt('days', days), ops:[B.o.price, B.o.lease], op:'÷', level:'Calculate' });
    const v = parseFloat(String(B.v || '').replace(/[,\s]/g, '').replace(/days?$/i, '')); recAttempt(e, { ok:!!st.rbOk, given:String(B.v || ''), value:isNaN(v) ? null : v, method:B.m === 'small' ? 'make the sum smaller' : 'short division', msg:st.rbMsg }); return; }
  if(id === 'fdSignChk'){ const q = UI.fd.q || {}, ok = !!UI.fd.signed; if(!ok && !Object.keys(q).length) return;
    const one = B.blk * B.P0, e = recOpen('fo:' + B.n, { type:'calc', relKey:'fuelOrder', doc:'Fuel order: the first order on the desk', ask:`Sign off the order: ${B.n} block${B.n === 1 ? '' : 's'} of ${num(B.blk)} L at ${priceL(B.P0)}.`,
      question:`${num(B.blk)} L × ${priceL(B.P0)}${B.n > 1 ? `, then × ${B.n}` : ''}`, unit:'£2', correct:one * B.n, correctText:twoDp(one * B.n), ops:[B.blk, B.P0], op:'×', level:'Calculate' });
    const working = [{ lab:`${num(B.blk)} L × ${priceL(B.P0)}`, typed:B.vals.one || '', want:twoDp(one), wantV:Math.round(one * 100), unit:'£', ok:!q.one }].concat(B.n > 1 ? [{ lab:`${B.n} × ${twoDp(one)}`, typed:B.vals.all || '', want:twoDp(one * B.n), wantV:Math.round(one * B.n * 100), unit:'£', ok:!q.all, total:true }] : []);
    const last = working[working.length - 1]; recAttempt(e, { ok, given:last.typed, value:scParse('£', last.typed) === null ? null : scParse('£', last.typed) / 100, working, method:'cost of 1,000 L × number of blocks', note:ok ? '' : recScNote(working) }); }
}
document.addEventListener('click', ev => {
  const b = ev.target && ev.target.closest && ev.target.closest('#scCheck, #rbChk, #fdSignChk'); if(!b || typeof S === 'undefined' || !S) return;
  let B = null; try{ B = recBefore(b.id); }catch(e){} if(!B) return; if(b.id === 'scCheck') REC.hold = true;
  setTimeout(() => { REC.hold = false; try{ recAfter(b.id, B); }catch(e){} }, 0);
}, true);
const recSvc0 = svcCardHtml;
svcCardHtml = function(o){ try{ if(o && o.sign && !o.done && o.F) recSeen(recScIdentity(o.F).key); }catch(e){} return recSvc0(o); };

/* ---------- 5. the error notes (brief §3): from the working, not just the answer ---------- */
const recMoney = v => Math.abs(v - Math.round(v)) < 0.005 ? money(Math.round(v)) : twoDp(v);
const REC_PLACE = { '-2':'1p column', '-1':'10p column', 0:'ones', 1:'tens', 2:'hundreds', 3:'thousands', 4:'ten thousands', 5:'hundred thousands', 6:'millions' };
const recEq = (x, y, money) => money ? Math.round(x * 100) === Math.round(y * 100) : Math.abs(x - y) < 1e-6 * Math.max(1, Math.abs(y));
const recTimes = k => ({ 1:'ten', 2:'a hundred', 3:'a thousand' })[k];
function recNumNote(v, c, e){
  const money = /^£/.test(e.unit || ''), show = x => recFmt(e.unit, x);
  if(money && recEq(v, c * 100, false)) return `${num(v)} is pence; the bill is ${recMoney(c)}.`;
  for(let k = 1; k <= 3; k++){
    if(recEq(v * Math.pow(10, k), c, money)) return `Right digits; the answer should be ${recTimes(k)} times bigger — the × ${Math.pow(10, k)} shift was missed.`;
    if(recEq(v, c * Math.pow(10, k), money)) return `Right digits; the answer should be ${recTimes(k)} times smaller — the point is in the wrong place.`; }
  if(e.op === '−' && e.ops){ const [a, b] = e.ops, ne = recNoExchange(a, b); if(ne && ne.v !== a - b && recEq(v, ne.v, money)) return `${num(a)} − ${num(b)}: the ${REC_PLACE[ne.col]} needed exchanging.`; }
  const scale = money ? 100 : 1, sv = String(Math.round(Math.abs(v) * scale)), sc = String(Math.round(Math.abs(c) * scale));
  if(sv.length === sc.length && sv !== sc){ const diff = [...sv].map((ch, i) => ch !== sc[i] ? i : -1).filter(i => i >= 0);
    if(diff.length === 2 && diff[1] === diff[0] + 1 && sv[diff[0]] === sc[diff[1]] && sv[diff[1]] === sc[diff[0]]) return `Two digits are the wrong way round: ${show(v)} should be ${show(c)}.`; }
  if((e.op === '×' || e.op === '+' || !e.op) && v !== c){ const d = v - c;
    for(let k = (money ? -2 : 0); k <= 6; k++){ const p = Math.pow(10, k); if(recEq(Math.abs(d), p, money)){ const place = REC_PLACE[k] || 'next column';
      return d < 0 ? `A carry was missed: the carry 1 into the ${place} wasn't added (${show(c)}, not ${show(v)}).` : `A carry was added twice: the ${place} is 1 too many (${show(c)}, not ${show(v)}).`; } } }
  return '';
}
/* subtraction with no exchanging: each column takes the smaller digit from the larger */
function recNoExchange(a, b){ if(!(a >= 0 && b >= 0) || Math.round(a) !== a || Math.round(b) !== b) return null; const A = String(a), Bs = String(b).padStart(A.length, '0'); if(Bs.length > A.length) return null;
  let col = null; const out = [...A].map((d, i) => { const x = +d, y = +Bs[i], place = A.length - 1 - i; if(x < y && col === null) col = place; return Math.abs(x - y); }).join(''); return col === null ? null : { v:+out, col }; }
/* a line of the working that is wrong: "225 × 40p is £90, not £80" (or the shift, the pence, a carry in that line) */
function recScNote(working){
  const bad = working.find(w => !w.ok && !w.total) || working.find(w => !w.ok); if(!bad) return '';
  const lab = bad.lab.replace(/£0\.(\d)(\d)/, (m, a, b) => `${+(a + b)}p`).replace(/£(\d+)\.00/, '£$1'), typed = scParse(bad.unit === 'p' ? 'p' : bad.unit === 'n' ? 'n' : '£', bad.typed);
  if(typed === null) return `${lab}: this line is empty.`;
  if(bad.total && working.filter(w => !w.total).every(w => w.ok) && working.length > 1) return `The lines are right; adding them gives ${bad.unit === '£' ? recMoney(bad.wantV / 100) : bad.want}, not ${bad.unit === '£' ? recMoney(typed / 100) : num(typed)}.`;
  const unit = bad.unit === '£' ? '£2' : 'n', tv = bad.unit === '£' ? typed / 100 : typed, wv = bad.unit === '£' ? bad.wantV / 100 : bad.wantV, why = recNumNote(tv, wv, { unit, op:'×' }), keep = /^Right digits|is pence/.test(why);
  const is = /costs$/.test(lab) ? '' : ' is', show = v => bad.unit === '£' ? recMoney(v) : bad.unit === 'p' ? num(v) + 'p' : num(v);
  return `${lab}${is} ${show(wv)}, not ${show(tv)}${keep ? '. ' + why : '.'}`;
}
/* a line of the column template: not shifted, a carry, or a partial product that is off */
function recGridNote(g){
  const L = g.lines.find(x => x.kind === 'work' && x.ok === false); if(!L) return '';
  const n = L.near, v = L.value; if(!n) return '';
  for(let k = 1; k <= 3; k++) if(v * Math.pow(10, k) === n.v) return `A line is not shifted: ${num(v)} should be ${num(n.v)} (${n.txt}) — move it ${k === 1 ? 'one place' : k + ' places'} to the left.`;
  const d = v - n.v; for(let k = 0; k <= 6; k++) if(Math.abs(d) === Math.pow(10, k)) return d < 0 ? `${n.txt} is ${num(n.v)}, not ${num(v)}: the carry 1 into the ${REC_PLACE[k]} wasn't added.` : `${n.txt} is ${num(n.v)}, not ${num(v)}: a carry into the ${REC_PLACE[k]} was added twice.`;
  return `${n.txt} is ${num(n.v)}, not ${num(v)}.`;
}
/* Build errors: a figure missing or doubled, the wrong operation, the wrong divisor for a mean, the wrong figure */
function recBuildNote(e, a){
  if(a.kind === 'mean'){ if(a.chips[1] && a.chips[1].op !== '÷') return `${a.chips[1].op === '?' ? 'No operation' : a.chips[1].op + ' is the wrong operation'}: an average shares the total out equally (÷).`;
    const d = parseInt(a.divGiven, 10); return d === 2 ? `÷ 2 halves it; an average shares between all ${a.div} ${a.per}s.` : `÷ ${isNaN(d) ? '?' : d}: there were ${a.div} ${a.per}s to share between.`; }
  const figs = (a.chips || []).filter(c => !c.op), ops = (a.chips || []).filter(c => c.op).map(c => c.op);
  if(a.kind === 'sum'){ const wrong = ops.find(o => o !== '+'); if(wrong) return `${wrong} is the wrong operation: a total adds the amounts together (+).`;
    const seen = {}; for(const f of figs){ if(seen[f.k]) return `${f.label} is counted twice.`; seen[f.k] = 1; }
    const miss = (a.figs || []).find(f => !figs.some(x => x.k === f.k)); if(miss) return `${miss.label} is missing from the total.`; return a.msg || ''; }
  if(a.kind === 'diff'){ if(ops[0] && ops[0] !== '−') return `${ops[0]} is the wrong operation: a difference takes one amount from the other (−).`; return a.msg || 'Start from the larger amount.'; }
  if(a.want){ const bad = figs.find(f => f.k && f.k !== a.want.a && f.k !== a.want.b); if(bad) return `${bad.label} is the wrong figure. ${a.msg || ''}`.trim();
    if(ops[0] && ops[0] !== a.want.op) return `${ops[0]} is the wrong operation (${a.want.op}). ${a.msg || ''}`.trim(); }
  return a.msg || '';
}
function recNote(e, a){
  if(a.shown) return '';
  if(e.type === 'build') return recBuildNote(e, a);
  if(a.working){ const w = recScNote(a.working); if(w) return w; }
  if(a.grid){ const g = recGridNote(a.grid); if(g) return g; }
  const v = a.value, c = e.correct, ct = e.correctText || recFmt(e.unit, c); if(v === null || v === undefined || isNaN(v)) return `Answer ${a.given || '(blank)'} given; correct answer ${ct}.`;
  return recNumNote(v, c, e) || `Answer ${recFmt(e.unit, v)} given; correct answer ${ct}.`;
}

/* ---------- 6. decisions: one entry a week (or a period), with the events and the aircraft that came in it ---------- */
const recEvent0 = applyEventNow;
applyEventNow = function(choice){ const ev = S.rnd && S.rnd.event, r = recEvent0(choice);
  try{ if(ev && ev.options && ev.options[choice]) rec().pend.events.push({ day:S.day, title:ev.title, choice:ev.options[choice].label, cost:S.rnd.eventCost || 0 }); }catch(e){} return r; };
const recAcquire0 = acquirePlane;
acquirePlane = function(p, kind){ const r = recAcquire0(p, kind); try{ const f = S.fleet[S.fleet.length - 1], t = f && f.terms; rec().pend.fleet.push({ day:S.day, name:p.name, reg:f && f.registration || '', kind, daily:t && t.daily || 0, price:t && t.price || 0 }); }catch(e){} return r; };
function recPlanNow(){
  const pl = normPlan(currentPlan()), ids = [...new Set(pl.fleet.flatMap(x => x.sched))];
  return { fleet:pl.fleet.map(x => { const f = S.fleet.find(z => z.uid === x.uid) || {}, deps = x.deps && x.deps.length === x.sched.length ? x.deps : (x.sched.length ? actualDeps(pl, pl.fleet.indexOf(x)) || [] : []);
      return { uid:x.uid, plane:shortPlane(planeById(x.planeId)), reg:f.registration || '', flights:x.sched.map((id, k) => ({ route:id, city:routeById(id).city, dep:deps[k] !== undefined && deps[k] !== null ? fmtTime(deps[k]) : '', days:(x.days && x.days[k]) || 'all' })) }; }),
    fares:ids.map(id => ({ id, city:routeById(id).city, fare:pl.prices[id] || routeById(id).basePrice })), onboard:pl.onboard || 'none' };
}
function recPlanDiff(a, b){
  if(!a) return ['The first plan.']; const out = [], cnt = p => { const c = {}; p.fleet.forEach(x => x.flights.forEach(f => { c[f.city] = (c[f.city] || 0) + 1; })); return c; }, ca = cnt(a), cb = cnt(b);
  Object.keys(cb).filter(k => !ca[k]).forEach(k => out.push(`New route: ${k}`)); Object.keys(ca).filter(k => !cb[k]).forEach(k => out.push(`Stopped flying: ${k}`));
  Object.keys(cb).filter(k => ca[k] && ca[k] !== cb[k]).forEach(k => out.push(`${k}: ${ca[k]} → ${cb[k]} flights a day`));
  b.fares.forEach(f => { const o = a.fares.find(x => x.id === f.id); if(o && o.fare !== f.fare) out.push(`Fare: ${f.city} ${money(o.fare)} → ${money(f.fare)}`); });
  b.fleet.forEach(x => { const o = a.fleet.find(z => z.uid === x.uid); if(!o){ out.push(`New aircraft: ${x.plane}${x.reg ? ' ' + x.reg : ''}`); return; }
    const t0 = o.flights.map(f => f.city + ' ' + f.dep + ' ' + f.days).join(', '), t1 = x.flights.map(f => f.city + ' ' + f.dep + ' ' + f.days).join(', ');
    if(t0 !== t1 && o.flights.length === x.flights.length && o.flights.every((f, k) => f.city === x.flights[k].city)) out.push(`Times: ${x.plane} ${x.flights.map(f => `${f.city} ${f.dep}${f.days !== 'all' ? ' (' + daysWord(f.days) + ')' : ''}`).join(', ')}`); });
  if(a.onboard !== b.onboard) out.push(`On board: ${a.onboard} → ${b.onboard}`);
  return out.length ? out : ['No change: the same plan as the week before.'];
}
const daysWord = d => d === 'weekday' ? 'Mon–Fri' : d === 'weekend' ? 'Sat–Sun' : 'all week';
function recDecisionNow(){
  if(!S || S.phase === 'setup' || (S.rnd && S.rnd.saving)) return; const P = S.period; if(!P) return;
  let from, to, proj = null, actual = null, missed = null, label;
  if(P.type === 'day'){ if(typeof weekPhaseOf !== 'function' || weekPhaseOf(S.round) !== 'review' || !S.wk) return; const W = S.wk, h = weekSummary(W);
    from = W.from; to = W.from + 6; proj = Math.round(W.projected || 0); actual = Math.round(h.profit); missed = W.missed ? W.missed.missed : null; label = `Week ${weekNo(from)}`; }
  else if(['week', 'month', 'gap'].includes(P.type)){ const T = S.rnd && S.rnd.sim; if(!T) return; from = P.from; to = P.to; actual = Math.round(T.profit);
    const fc = S.rnd.myForecast; proj = fc && fc.days === to - from + 1 ? Math.round(fc.profit) : fc && fc.profit !== undefined ? Math.round(fc.profit) : null; label = periodShort({ type:P.type, from, to }); label = label.charAt(0).toUpperCase() + label.slice(1); }
  else return;
  const R = rec(); if(R.entries.some(e => e.type === 'decision' && e.from === from)) return;
  const prev = R.entries.filter(e => e.type === 'decision').pop(), plan = recPlanNow(), changed = recPlanDiff(prev && prev.plan, plan), inP = x => x.day >= from && x.day <= to;
  const events = R.pend.events.filter(inP), fleet = R.pend.fleet.filter(inP); R.pend.events = R.pend.events.filter(x => !inP(x)); R.pend.fleet = R.pend.fleet.filter(x => !inP(x));
  let L = 0, cost = 0, adv = 0; const wks = new Set(); for(let d = from; d <= to; d++) wks.add(weekNo(d));
  wks.forEach(w => { const F = (S.fuelWeeks || {})[w]; if(!F) return; (F.bought || []).filter(b => b.day >= from && b.day <= to).forEach(b => { L += b.L; cost += b.L * b.p; }); if(typeof fuelAdvantage === 'function') adv += fuelAdvantage(w); });
  const iso = d => isoOf(d), routesChanged = changed.join(' '), news = (WORLD.routeNews || []).filter(n => n.announced && n.announce <= iso(to) && n.end >= iso(from) && (n.routes || []).some(id => { const r = routeById(id); return r && routesChanged.includes(r.city); })).map(n => n.headline || n.id);
  R.entries.push({ id:'r' + (R.entries.length + 1), type:'decision', key:'dec:' + from, from, to, day:from, date:dateLong(from), week:weekNo(from), chapter:chapterNo(from), label, plan, changed, events, fleet, fuel:{ L, cost:r2(cost), adv }, news, proj, actual, missed, stars:S.rep });
}
const recCloseDay0 = closeDay;
closeDay = function(){ try{ recDecisionNow(); }catch(e){} return recCloseDay0(); };
/* a dry run copies the airline: the record stays out of the copy (it only grows, and nothing in a dry run needs it) */
const recDryRun0 = dryRun;
dryRun = function(fn){ const r = S && S.record; if(r) delete S.record; try{ return recDryRun0(fn); } finally { if(r) S.record = r; } };

/* ---------- 7. the teacher panel: the pupil's name, a note a week, print ---------- */
function recWeeks(){ const R = rec(), out = R.entries.filter(e => e.type === 'decision').map(e => ({ from:e.from, to:e.to, label:`${e.label} · ${dateShort(e.from)}` }));
  const P = S.period, cur = P && P.type === 'day' && S.wk ? { from:S.wk.from, to:S.wk.from + 6 } : P ? { from:P.from, to:P.to } : null;
  if(cur && !out.some(w => w.from === cur.from)) out.push({ from:cur.from, to:cur.to, label:`This week · ${dateShort(cur.from)}` }); return out; }
function recChapters(){ return (CHAPTERS || []).filter(c => c.start).map(c => ({ n:c.chapter, from:dayOfDate(c.start), to:dayOfDate(c.reviewDate || c.end), name:c.name })); }
function recordTeacherRender(){
  const el = $('tRec'); if(!el || !S) return; const R = rec(), weeks = recWeeks(), calc = R.entries.filter(e => e.type !== 'decision'), q = calc.filter(e => e.attempts.some(a => !a.ok && !a.shown)).length, U = UI.rec || (UI.rec = { view:'date', range:'all', week:weeks.length ? weeks[weeks.length - 1].from : null });
  const ranges = [['all', 'Everything']].concat(recChapters().map(c => ['ch' + c.n, `Chapter ${c.n}`])).concat(weeks.map(w => ['w' + w.from, w.label]));
  el.innerHTML = `<p class="small muted">${calc.length} calculations (${q} with a Query) and ${R.entries.length - calc.length} weeks of decisions recorded for this airline.</p>
    <div class="row"><span>Pupil's name on the record</span><input id="tRecName" value="${esc(R.pupil || '')}" placeholder="${esc(S.airline && S.airline.name || '')}"></div>
    <div class="row"><span>Teacher note for</span><select id="tRecWeek">${weeks.map(w => `<option value="${w.from}" ${U.week === w.from ? 'selected' : ''}>${esc(w.label)}</option>`).join('')}</select></div>
    <textarea id="tRecNote" rows="3" style="width:100%" placeholder="A note for this week (prints in the record)">${esc((U.week !== null && R.notes[U.week]) || '')}</textarea>
    <div class="row"><span>Print</span><select id="tRecView"><option value="date" ${U.view === 'date' ? 'selected' : ''}>By date</option><option value="kind" ${U.view === 'kind' ? 'selected' : ''}>By kind of maths</option></select>
      <select id="tRecRange">${ranges.map(([v, l]) => `<option value="${v}" ${U.range === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select><button class="btn small" id="tRecPrint">Print record</button></div>`;
  const nm = $('tRecName'); if(nm) nm.onchange = () => { R.pupil = nm.value.trim(); save(); };
  const wk = $('tRecWeek'); if(wk) wk.onchange = () => { U.week = +wk.value; recordTeacherRender(); };
  const nt = $('tRecNote'); if(nt) nt.oninput = () => { if(U.week === null) return; if(nt.value.trim()) R.notes[U.week] = nt.value; else delete R.notes[U.week]; save(); };
  const vw = $('tRecView'); if(vw) vw.onchange = () => { U.view = vw.value; };
  const rg = $('tRecRange'); if(rg) rg.onchange = () => { U.range = rg.value; };
  on('tRecPrint', () => recordPrint({ view:U.view, range:U.range }));
}
const recSoTeacher0 = soTeacherRender;
soTeacherRender = function(){ recSoTeacher0(); recordTeacherRender(); };

/* ---------- 8. the printout (brief §2, §4): plain A4, black question, blue working, green tick, red Query ---------- */
function recRange(range){
  if(range && /^ch\d+$/.test(range)){ const c = recChapters().find(x => 'ch' + x.n === range); if(c) return { from:c.from, to:c.to, label:`Chapter ${c.n}: ${c.name}` }; }
  if(range && /^w\d+$/.test(range)){ const w = recWeeks().find(x => 'w' + x.from === range); if(w) return { from:w.from, to:w.to, label:`${fmtRange(w.from, w.to)}` }; }
  return { from:-Infinity, to:Infinity, label:'Everything so far' };
}
const recE = s => esc(String(s === undefined || s === null ? '' : s));
function recDur(ms){ if(!(ms >= 1000)) return ''; const s = Math.round(ms / 1000), m = Math.floor(s / 60); return m ? `${m} min ${pad(s % 60)}` : `${s} s`; }
function recAttemptHtml(e, a, n){
  const tick = a.ok ? '<span class="tick">✓</span>' : a.shown ? '<span class="red">answer shown</span>' : '<span class="red">Query</span>';
  let w = '';
  if(a.working) w = `<pre class="w">${a.working.map(x => `${recE(x.lab)} = ${x.ok ? `<span class="b">${recE(x.typed || ' ')}</span>` : `<span class="bad">${recE(x.typed || ' ')}</span>`}`).join('\n')}</pre>`;
  else if(a.grid){ const g = a.grid, width = Math.max(...g.lines.map(L => L.text.length)) ;
    w = `<pre class="w">${g.lines.filter(L => L.kind === 'given' || L.text.replace(/[\s.]/g, '')).map(L => { const op = (L.op || ' ').padEnd(2, ' '), body = L.text.padStart(width, ' '), off = width - L.text.length;
      if(L.kind === 'given') return `<span class="k">${recE(op + body.split('').join(' '))}</span>`;
      if(L.kind === 'carry') return `<span class="cy">${recE('  ' + body.split('').join(' '))}</span>`;
      const chars = body.split('').map((ch, i) => (L.kind === 'ans' && (L.bad || []).includes(i - off)) ? `<span class="bad">${recE(ch)}</span>` : recE(ch)).join(' ');
      return `${recE(op)}${L.kind === 'work' && L.ok === false ? `<span class="bad">${chars}</span>` : `<span class="b">${chars}</span>`}`; }).join('\n')}</pre>`; }
  else if(a.chips) w = `<p class="w x"><span class="b">${a.chips.map(c => c.op ? ` ${recE(c.op)} ` : `${c.label ? recE(c.label) + ' ' : ''}${recE(c.text || '')}`).join('')}</span> = ${a.ok ? `<span class="b">${recE(e.correctText)}</span>` : '<span class="bad">?</span>'}</p>`;
  const given = a.shown ? e.correctText : a.value !== null && a.value !== undefined && !isNaN(a.value) ? recFmt(e.unit, a.value) : a.given || '';
  const ans = e.type === 'build' ? '' : `<p class="ans">Answer: ${given ? `<span class="${a.ok || a.shown ? 'b' : 'bad'}">${recE(given)}</span>` : '<span class="red">(not filled in)</span>'} ${tick}</p>`;
  const note = !a.ok && !a.shown && a.note ? `<p class="red note">${recE(a.note)}</p>` : a.shown ? `<p class="note">${recE(a.note || 'The answer was shown.')}</p>` : '';
  return `<div class="att">${e.attempts.length > 1 ? `<p class="an">Attempt ${n}</p>` : ''}${w}${e.type === 'build' ? `<p class="ans">${tick}</p>` : ans}${note}</div>`;
}
function recCalcHtml(e, grouped){
  const tries = e.attempts.length, last = e.attempts[tries - 1] || {};
  return `<section class="e"><div class="eh"><span>Week ${e.week} · ${recE(e.date)} · ${recE(e.doc)}</span><span class="codes">${recE((e.codes || []).join(' · '))}</span></div>
    <p class="q">${recE(e.ask ? e.ask + ' ' : '')}${recE(e.question)}${e.level ? ` <small>(${recE(e.level)})</small>` : ''}</p>
    ${e.attempts.map((a, i) => recAttemptHtml(e, a, i + 1)).join('')}
    <p class="meta">${[e.method ? `Method: ${recE(e.method)}` : '', `${tries} attempt${tries === 1 ? '' : 's'}`, recDur(e.ms), e.status === 'query' ? '<span class="red">not yet checked</span>' : ''].filter(Boolean).join(' · ')}</p></section>`;
}
function recDecisionHtml(e, notes){
  const res = (v, good) => v === null || v === undefined ? '—' : `<span class="${good === null ? '' : good ? 'tick' : 'red'}">${money(v)}</span>`, better = e.proj !== null && e.actual !== null ? e.actual >= e.proj : null;
  const plan = `<table class="pt"><thead><tr><th>Aircraft</th><th>Flights</th></tr></thead><tbody>${e.plan.fleet.map(x => `<tr><td>${recE(x.plane)} ${recE(x.reg)}</td><td>${x.flights.length ? x.flights.map(f => `${recE(f.city)} ${recE(f.dep)}${f.days !== 'all' ? ` (${daysWord(f.days)})` : ''}`).join(' · ') : '—'}</td></tr>`).join('')}</tbody></table>
    <p class="d">Fares: ${e.plan.fares.map(f => `${recE(f.city)} ${money(f.fare)}`).join(' · ') || '—'}${e.plan.onboard && e.plan.onboard !== 'none' ? ` · On board: ${recE(e.plan.onboard)}` : ''}</p>`;
  const fuel = e.fuel && (e.fuel.L || e.fuel.adv) ? `<p class="d">Fuel bought: ${num(e.fuel.L)} L (${twoDp(e.fuel.cost)})${e.fuel.adv ? ` · fuel purchasing advantage ${money(e.fuel.adv)}` : ''}</p>` : '';
  const note = notes && notes[e.from] ? `<p class="tn"><b>Teacher's note:</b> ${recE(notes[e.from])}</p>` : '';
  return `<section class="e dec"><div class="eh"><span>${recE(e.label)} · ${recE(fmtRange(e.from, e.to))} · Decisions</span><span class="codes">Chapter ${e.chapter}</span></div>${plan}
    <p class="d"><b>Changed this week:</b> ${e.changed.map(recE).join('; ')}</p>
    ${e.events.length ? `<p class="d"><b>Events:</b> ${e.events.map(v => `${recE(v.title)}: ${recE(v.choice)}${v.cost ? ` (${money(v.cost)})` : ''}`).join('; ')}</p>` : ''}
    ${e.news.length ? `<p class="d"><b>News acted on:</b> ${e.news.map(recE).join('; ')}</p>` : ''}
    ${e.fleet.length ? `<p class="d"><b>Aircraft:</b> ${e.fleet.map(v => `${recE(v.name)} ${recE(v.reg)} (${v.kind === 'lease' ? `rented at ${money(v.daily)} a day` : v.kind === 'finance' ? 'on finance' : `bought for ${money(v.price)}`})`).join('; ')}</p>` : ''}${fuel}
    <p class="d"><b>Results:</b> projected ${res(e.proj, null)} · actual ${res(e.actual, better)}${e.missed !== null && e.missed !== undefined ? ` · missed ${money(e.missed)}` : ''} · stars ${'★'.repeat(Math.floor(e.stars || 0))}${(e.stars || 0) % 1 ? '½' : ''} (${e.stars})</p>${note}</section>`;
}
const recSpan = days => { const a = Math.min(...days), z = Math.max(...days); return a === z ? dateShort(a) : fmtRange(a, z); };
function recordPrintHtml(o){
  o = o || {}; const R = rec(), rg = recRange(o.range), inR = e => (e.type === 'decision' ? e.from : e.day) >= rg.from && (e.type === 'decision' ? e.from : e.day) <= rg.to;
  const noteHtml = e => `<section class="e dec"><div class="eh"><span>Week ${weekNo(e.day)} · ${recE(dateLong(e.day))} · Teacher's note</span><span class="codes">Chapter ${e.chapter}</span></div><p class="tn">${recE(e.text)}</p></section>`;
  const loose = Object.keys(R.notes || {}).map(Number).filter(d => !R.entries.some(e => e.type === 'decision' && e.from === d)).map(d => ({ type:'note', day:d, from:d, to:d, chapter:chapterNo(d), text:R.notes[d] }));   // a note for a week whose decisions are not in yet
  const list = R.entries.concat(loose).filter(inR).filter(e => e.type === 'decision' || e.type === 'note' || e.attempts.length).sort((a, b) => (a.type === 'decision' ? a.to + 0.5 : a.day) - (b.type === 'decision' ? b.to + 0.5 : b.day) || (a.attempts && a.attempts[0] && b.attempts && b.attempts[0] ? a.attempts[0].at - b.attempts[0].at : 0));
  const days = list.map(e => e.type === 'decision' ? e.from : e.day), chs = [...new Set(list.map(e => e.chapter))].sort();
  const name = R.pupil || (S.airline && S.airline.name) || 'Pupil', head = `<header><h1>${recE(name)}: maths record</h1><p>${recE(S.airline && S.airline.name || '')} · ${chs.length ? 'Chapter ' + chs.join(', ') : ''} · ${recE(rg.label)}${days.length && rg.label !== recSpan(days) ? ` (${recE(recSpan(days))})` : ''} · ${o.view === 'kind' ? 'by kind of maths' : 'by date'} · printed ${recE(new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }))}</p></header>`;
  let body = '';
  if(o.view === 'kind'){ const groups = {}; list.filter(e => e.type !== 'decision' && e.type !== 'note').forEach(e => { (groups[e.rel] = groups[e.rel] || []).push(e); });
    const order = (WORLD.workingMethods || []).map(m => m.relationship); Object.keys(groups).sort((a, b) => (order.indexOf(a) < 0 ? 99 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 99 : order.indexOf(b))).forEach(k => { const es = groups[k], codes = [...new Set(es.flatMap(e => e.codes || []))];
      body += `<h2>${recE(k.charAt(0).toUpperCase() + k.slice(1))}</h2><p class="hc">${recE(codes.join(' · '))}</p>${es.map(e => recCalcHtml(e, true)).join('')}`; });
    const decs = list.filter(e => e.type === 'decision' || e.type === 'note'); if(decs.length) body += `<h2>Decisions, week by week</h2>${decs.map(e => e.type === 'note' ? noteHtml(e) : recDecisionHtml(e, R.notes)).join('')}`; }
  else body = list.map(e => e.type === 'note' ? noteHtml(e) : e.type === 'decision' ? recDecisionHtml(e, R.notes) : recCalcHtml(e, false)).join('');
  if(!list.length) body = '<p>Nothing recorded in this range yet.</p>';
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>${recE(name)} — maths record</title><style>
    @page{size:A4 portrait;margin:14mm 13mm}body{font:11pt/1.35 "Segoe UI",Arial,sans-serif;color:#000;background:#fff;margin:0 auto;max-width:190mm}
    header{border-bottom:1.5pt solid #000;margin-bottom:8pt}h1{font-size:16pt;margin:0 0 2pt}header p{margin:0;font-size:9.5pt}
    h2{font-size:13pt;margin:14pt 0 2pt;border-bottom:.5pt solid #000;break-after:avoid}.hc{margin:0 0 6pt;font-size:9pt;font-family:Consolas,"Courier New",monospace}
    .e{border-bottom:.5pt solid #999;padding:6pt 0;break-inside:avoid}.eh{display:flex;justify-content:space-between;gap:10pt;font-weight:600;font-size:10pt}.codes{font-family:Consolas,"Courier New",monospace;font-weight:400;font-size:8.5pt;white-space:nowrap}
    .q{margin:3pt 0;color:#000}.q small{color:#000;font-weight:400}.w{font-family:Consolas,"Courier New",monospace;font-size:11pt;margin:3pt 0 3pt 14pt;white-space:pre;color:#000}.w.x{white-space:normal;line-height:1.6}
    .b{color:#1F5FBF}.bad{color:#C8442B;outline:1.2pt solid #C8442B;outline-offset:1pt}.cy{color:#1F5FBF;font-size:8.5pt}.k{color:#000}
    .ans{margin:2pt 0 0 14pt}.tick{color:#2E7D4F;font-weight:700}.red{color:#C8442B}.note{margin:2pt 0 0 14pt;font-size:10pt}.an{margin:4pt 0 0 14pt;font-size:9pt;font-weight:600}
    .meta{margin:3pt 0 0 14pt;font-size:9pt;color:#000}.att{margin-top:2pt}.pt{border-collapse:collapse;margin:4pt 0;font-size:9.5pt}.pt th,.pt td{border:.5pt solid #999;padding:2pt 5pt;text-align:left;vertical-align:top}
    .d{margin:2pt 0;font-size:10pt}.tn{margin:4pt 0;font-size:10pt;border-left:2pt solid #000;padding-left:6pt}.bar{margin:6pt 0}@media print{.bar{display:none}}</style></head>
    <body><div class="bar"><button onclick="print()">Print</button></div>${head}${body}</body></html>`;
}
function recordPrint(o){ const w = window.open('', '_blank'); if(!w){ toast('Allow pop-ups to print the record.'); return; } w.document.write(recordPrintHtml(o)); w.document.close(); }
