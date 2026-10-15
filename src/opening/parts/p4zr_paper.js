/* ==================================================================
   WORKING ON PAPER (Workbook v5.6, D86: Fable's note "Working on paper, one fuel sum, two tries", 15 Oct 2026).
   Pupils were getting bogged down in the arithmetic and not reaching the decisions. Three changes:
   1. The pupil works on paper; the game takes only the answer (Settings workingOnPaper). Every sum is an answer box:
      one header line "Sum N · Week W · what it is", the question in black, an answer field and Check. The squared
      paper, the column template, the formula tab and the Working pad are gone; the method is a small reference card,
      collapsed, showing the shape of a method (WorkingMethods), never an input.
   2. Two tries (twoTriesRule). Wrong once: an error note worked out from the answer alone (ten times out, the
      whole-number answer not divided back, two digits swapped, a carry; for a Build, the figure or the operation) and
      one more try. Wrong twice: the figure is shown, stamped "Checked by Finance", and the game moves on. Both
      attempts go to the record.
   3. Fuel is one sum a week (HandSumRules 2, fuelHandSum): the Monday order on the fuel desk, blocks × the price of
      1,000 L. Calculate the first time and whenever the price has moved fuelHandSumPriceStep since it was last
      calculated; otherwise Build, then Model. The per-service fuel card is no longer a sign-off: the fuel desk shows
      each plane's and route's litres and cost for the week, filled by the model. Launch Day keeps five sums: the
      tickets at three fares, the profit and the fuel order (after one worked example of a service's fuel); snacks are
      a Build (launchDaySums).
   Sum numbers (sumNumbering) run from 1 for the whole game and are never reset; a sum keeps its number for the week
   it is first shown in. The record keeps N with the entry; the printout prints it in the margin, with a ruled box
   "Working (from your book)" under each entry.
   Functions shared with the main game are reassigned here, never redeclared.
   ================================================================== */
const paperOn = () => !!S && typeof weekMode === 'function' && weekMode() && WBS().workingOnPaper !== false && settings.workingOnPaper !== 'off';
const twoTriesOn = () => WBS().twoTriesRule !== false;
const FIN_STAMP = '<span class="stamp fin">CHECKED BY FINANCE</span>';

/* ---------- 1. sum numbers ---------- */
function sumNoS(){ const o = S.sumNo || (S.sumNo = { next:1, keys:{} }); o.keys = o.keys || {}; return o; }
const sumNoKey = key => key + '@w' + weekNo(recNow());
function sumNo(key){ const o = sumNoS(), k = sumNoKey(key); if(!o.keys[k]) o.keys[k] = o.next++; return o.keys[k]; }
function sumHeadHtml(key, what){ return `<p class="sum-h"><b>Sum ${sumNo(key)}</b> · Week ${weekNo(recNow())} · ${esc(what)}</p>`; }
const paperRecOpen0 = recOpen;
recOpen = function(key, o){ const e = paperRecOpen0(key, o); if(e && e.n === undefined && e.type !== 'decision' && paperOn()) e.n = sumNo(key); return e; };
/* the figure shown after two tries goes into the record as a third line */
function paperRecShown(key, note){ try{ const R = rec(), e = R.entries.find(x => x.key === key && x.day === recNow() && x.status === 'query'); if(e) recAttempt(e, { shown:true, note:note || 'Checked by Finance after two tries: the figure was shown.' }); }catch(err){} }

/* ---------- 2. the reference card (WorkingMethods: the shape of a method, not an input) ---------- */
const PAPER_REL = { revenue:'passengers × fare', routeRevenue:'passengers × fare', tickets:'passengers × fare', snacks:'passengers × fare', seatsFare:'passengers × fare', audit:'passengers × fare',
  profit:'revenue − costs', totals:'revenue − costs', fuelOrder:'fuel: the weekly order', fuelCost:'fuel: the weekly order', fuel:'fuel: the weekly order', flightTime:'flight time: distance ÷ speed',
  rentOrBuy:'price ÷ rent', timeToAfford:'price ÷ rent', rivalStay:'tenths of passengers', weekendDemand:'tenths of passengers', emptySeats:'load factor' };
function paperShape(op, money){
  if(op === '÷') return ['Make the sum smaller first if both numbers end in 0 (6,000 ÷ 300 is 60 ÷ 3).', 'Short division: how many lots of the divisor fit, carrying the remainder.', 'Check: multiply your answer back.'];
  if(op === '−') return ['Larger − smaller, the digits in their columns.', 'Exchange from the next column when a digit is too small.', 'Check: add your answer to the smaller number.'];
  if(op === '+') return ['Line up the digits in their columns.', 'Add each column from the right, carrying tens.'];
  return ['Estimate first: round one number and multiply.', 'Partition: 34 × 95 = 34 × 100 − 34 × 5.', 'Formal: a line for each digit of the smaller number, then add the lines.'].concat(money ? ['A price with pence: make it whole (× 100), multiply, then ÷ 100.'] : []);
}
function paperRefHtml(relKey, op, money){
  const name = PAPER_REL[relKey] || REC_REL[relKey] || relKey, wm = (WORLD.workingMethods || []).find(m => m.relationship === name), shape = paperShape(op, money);
  return `<details class="pq-ref"><summary>Reference card: ways to set it out</summary>${wm && wm.methods ? `<p><b>${esc(capFirst(wm.relationship))}</b>: ${esc(wm.methods)}</p>` : ''}<ul>${shape.map(s => `<li>${esc(s)}</li>`).join('')}</ul>${wm && wm.examples ? `<p class="small muted">For example ${esc(wm.examples)}.</p>` : ''}</details>`;
}
const paperNote = n => `<p class="pq-book">Work it out in your book. Write <b>Sum ${n}</b> beside your working.</p>`;
/* the error note from the answer alone (record brief §3): ten times out, not divided back, digits swapped, a carry */
function paperNumNote(v, want, unit, op, ops){ try{ return recNumNote(v, want, { unit:/^£/.test(unit || '') ? '£2' : unit, op, ops }) || ''; }catch(e){ return ''; } }
function paperWrongNote(v, want, unit, op, ops){
  const n = paperNumNote(v, want, unit, op, ops); if(n) return n;
  const big = Math.abs(want) >= 100 ? 100 : 10, est = Math.round(want / big) * big;
  return `That is ${v > want ? 'too much' : 'too little'}. Estimate first: it should be about ${/^£/.test(unit || '') ? money(est) : num(est)}.`;
}

/* ---------- 3. the Maths Dock: the answer box ---------- */
const PAPER_DOC = (t, r) => { try{ return docName(t, r); }catch(e){ return rowLabel(t, r); } };
function paperCellKey(t, col, row){ try{ return recCellIdentity(t, col, row).key; }catch(e){ return 'cell:' + t.id + '|' + col.id + '|' + row.id; } }
const paperShownKey = (t, cell) => t.id + '|' + cell;
function paperShown(t, cell){ return !!(S.rnd.paperShown || {})[paperShownKey(t, cell)]; }
/* a Build cell (snacks on Launch Day): the two figures, two that are not in the sum, and the operation */
function paperBuildFigs(t, col, row){
  const ops = stackRows(t, col, row), figs = ops.map(x => ({ k:x.id, label:x.label, text:x.value }));
  const v = col.values, extra = [['pax1', 'Passengers flying'], ['fare1', 'Fare']].filter(([k]) => v[k] !== undefined && !figs.some(f => f.k === k));
  extra.forEach(([k, l]) => figs.push({ k, label:l, text:fmtVal(k === 'fare1' ? '£' : 'n', v[k]), dis:true }));
  return figs.sort((a, b) => a.label < b.label ? -1 : 1);
}
function paperBuildHtml(t, col, row, B){
  const figs = paperBuildFigs(t, col, row), tok = k => OPS4.includes(k) ? `<i class="rb-op">${k}</i>` : (f => f ? `<span class="rb-tk">${esc(f.label)} <b>${f.text}</b></span>` : '')(figs.find(f => f.k === k));
  return `<div class="pq-build"><div class="rb-bar">${B.tokens.length ? B.tokens.map(tok).join('') : '<span class="rb-ph">Tap a figure, the operation, then a figure</span>'}<span class="rb-eq">=</span><b class="rb-res">?</b></div>
    <div class="rb-chips">${figs.map(f => `<button class="rb-chip" data-pbfig="${esc(f.k)}">${esc(f.label)}<b>${f.text}</b></button>`).join('')}</div>
    <div class="rb-ops">${OPS4.map(o => `<button data-pbop="${o}">${o}</button>`).join('')}<button class="dk-link" id="pbUndo">Undo</button><span class="grow"></span><button class="btn primary rb-chk" id="pbChk">Check ✓</button></div></div>`;
}
const paperDock0 = sumDockHtmlPlanner;
sumDockHtmlPlanner = function(o){
  if(!paperOn()) return paperDock0(o);
  const { W, st } = o, Z = sumState(W, st);
  if(Z.tut || !(Z.act || Z.justDone)) return paperDock0(o).replace(/<span class="sd-prog">Sum (\d+) of (\d+)<\/span>/, '<span class="sd-prog">$1 of $2 today</span>');
  let body = '', title = '';
  if(Z.justDone){
    const jt = Z.justDone, [cid, rid] = UI.justDone.cell.split('|'), jc = jt.cols.find(c => c.id === cid), jr = tRows(jt).find(r => r.id === rid), shown = paperShown(jt, UI.justDone.cell);
    title = 'Figure done';
    body = `<div class="wk-sum paper">${sumHeadHtml(paperCellKey(jt, jc, jr), PAPER_DOC(jt, jr))}<div class="pq done"><span class="kl">${esc(jc.label)}</span><p class="pq-big mono">${esc(wkSentence(jt, jc, jr))}</p>${shown ? FIN_STAMP : cardStampHtml('ok')}</div>
      ${shown ? `<p class="pq-fin">Finance has filled this one in. Copy ${fmtVal(jr.unit, jc.values[rid])} into your book beside your working.</p>` : ''}
      <p class="sd-written">${wkNext(W.tables) || Z.multi && !Z.picked ? 'Written into Plan Impact.' : 'Written into Plan Impact. That is every figure for today.'}</p><div class="wk-act"><button class="btn primary big" id="wkNext">${wkNext(W.tables) ? 'Next sum' : Z.multi && !Z.picked ? 'Choose' : 'Finished'} &#9654;</button></div></div>`;
  } else {
    const { act, col, row } = Z, key = paperCellKey(act, col, row), ops = stackRows(act, col, row), A = ops[0], B = ops[1] || { label:'', value:'', op:'' }, op = B.op || row.op || '×', build = row.tool && toolLevel(row.tool) === 'build', n = sumNo(key);
    try{ recSeen(key); }catch(e){}
    title = TOOL[row.tool] ? TOOL[row.tool].name : rowLabel(act, row);
    const q = `<div class="pq"><span class="kl">${esc(col.label)}${col.sub ? ' · ' + esc(col.sub) : ''}</span><p class="pq-q">${esc(rowLabel(act, row))} = ${esc(A.label)} ${esc(op)} ${esc(B.label)}</p><p class="pq-big mono">${build ? `${esc(rowLabel(act, row))} = ?` : `${A.value} ${esc(op)} ${B.value} = ?`}</p></div>`;
    const ans = build ? paperBuildHtml(act, col, row, UI.pb || (UI.pb = { tokens:[] })) : `<div class="sd-ans"><span class="answer"><span class="unit">${row.unit === '£' ? '£' : ''}</span><input id="cellAns" class="mono" inputmode="decimal" autocomplete="off" value="${esc(UI.entry)}" aria-label="${esc(rowLabel(act, row))}"></span><button class="btn primary" id="cellCheck">Check &#10003;</button></div>`;
    body = `<div class="wk-sum paper">${sumHeadHtml(key, PAPER_DOC(act, row))}${q}${build ? '<p class="pq-book">Build it: tap the two figures and the operation. The game works it out.</p>' : paperNote(n)}${ans}
      <div class="msg wk-msg ${UI.ok ? 'ok' : ''}" id="ftMsg" role="status">${esc(UI.msg || '')}</div>${build ? '' : paperRefHtml(row.tool || (/^tk/.test(row.id) ? 'revenue' : row.id), op, row.unit === '£' && /ppl/.test(operandUnit(act, B.id) || ''))}</div>`;
  }
  return `<aside class="dock dock-sum pale" data-dock="sum" aria-label="Work it out"><div class="dk-h"><span class="dk-tt"><span class="dk-kind">Work it out</span><b class="dk-t">${esc(title)}</b></span><span class="sd-prog">${Z.k} of ${Z.n} today</span></div><div class="dk-b">${body}</div></aside>`;
};
const paperBindDock0 = bindSumDock;
bindSumDock = function(W, st){
  paperBindDock0(W, st); if(!paperOn()) return;
  const Z = sumState(W, st); if(!(Z.act && !Z.justDone && !Z.tut)) return;
  const t = Z.act, col = Z.col, row = Z.row; if(!(row.tool && toolLevel(row.tool) === 'build')) return;
  const B = UI.pb || (UI.pb = { tokens:[] }), root = screen();
  root.querySelectorAll('[data-pbfig]').forEach(b => b.onclick = () => { if(B.tokens.length % 2 === 1){ UI.msg = 'Put the operation between the figures.'; render(); return; } B.tokens.push(b.getAttribute('data-pbfig')); UI.msg = ''; render(); });
  root.querySelectorAll('[data-pbop]').forEach(b => b.onclick = () => { if(B.tokens.length % 2 === 0){ UI.msg = B.tokens.length ? 'Two operations in a row: tap a figure next.' : 'Start with a figure.'; render(); return; } B.tokens.push(b.getAttribute('data-pbop')); UI.msg = ''; render(); });
  on('pbUndo', () => { B.tokens.pop(); UI.msg = ''; render(); });
  on('pbChk', () => paperBuildCheck(t, col, row, B));
};
function paperBuildCheck(t, col, row, B){
  const ops = stackRows(t, col, row), want = ops.map(x => x.id), op = (ops[1] && ops[1].op) || row.op || '×', T = B.tokens, figs = paperBuildFigs(t, col, row), key = paperCellKey(t, col, row);
  if(T.length < 3){ UI.msg = T.length ? 'Finish the sum: a figure, the operation, a figure.' : 'Tap a figure, the operation, then a figure.'; render(); return; }
  let msg = '';
  if(T.length > 3) msg = 'This sum needs just two figures and one operation.';
  else { const [x, o, y] = T, bad = [x, y].map(k => figs.find(f => f.k === k && f.dis)).find(Boolean);
    if(bad) msg = `${bad.label} is not part of ${rowLabel(t, row).toLowerCase()}: which two figures make it?`;
    else if(x === y) msg = 'Use two different figures.';
    else if(o !== op) msg = op === '×' ? 'Each buyer pays the same price: which operation repeats it for every buyer?' : 'Check the operation that joins these two figures.';
    else if(!(want.includes(x) && want.includes(y)) || (op !== '×' && op !== '+' && x !== want[0])) msg = 'Check which two figures this needs, and which comes first.'; }
  const I = recCellIdentity(t, col, row), e = recOpen(key, Object.assign({}, I.o, { type:'build', level:'Build', method:'choose the figures and the operation' }));
  const chips = T.map(k => OPS4.includes(k) ? { op:k } : (f => f ? { label:f.label, text:f.text, k } : { label:k })(figs.find(f => f.k === k)));
  if(!msg){ recAttempt(e, { ok:true, chips, method:'choose the figures and the operation' }); B.tokens = []; UI.msg = ''; t.chosen[cellId(col.id, row.id)] = true; soLog(`${PAPER_DOC(t, row)} (Build)`); cellCorrect(t, true); render(); return; }
  recAttempt(e, { ok:false, chips, msg, note:msg, method:'choose the figures and the operation' });
  B.tries = (B.tries || 0) + 1;
  if(B.tries >= 2 && twoTriesOn()){ paperRecShown(key); (S.rnd.paperShown = S.rnd.paperShown || {})[paperShownKey(t, cellId(col.id, row.id))] = true; B.tokens = []; B.tries = 0; t.chosen[cellId(col.id, row.id)] = true; cellCorrect(t, true); render(); return; }
  UI.msg = `Query: ${msg} One more try.`; B.tokens = []; render();
}
/* a cell answered wrong twice: Finance fills it in */
const paperCellWrong0 = cellWrong;
cellWrong = function(res){
  paperCellWrong0(res); if(!paperOn() || res === 'blank') return;
  const t = currentTable(), a = t && t.active; if(!a) return;
  const col = t.cols.find(c => c.id === a.col), row = tRows(t).find(r => r.id === a.row); if(!col || !row) return;
  if((UI.tries || 0) >= 2 && twoTriesOn()){ (S.rnd.paperShown = S.rnd.paperShown || {})[paperShownKey(t, cellId(a.col, a.row))] = true; cellCorrect(t, true); return; }
  const ops = stackRows(t, col, row), op = (ops[1] && ops[1].op) || row.op || '×', v = parseCell(row.unit, UI.entry || (($('cellAns') || {}).value) || '');
  if(res === 'sign'){ UI.msg += ' One more try.'; return; }
  UI.msg = `Query: ${v === null ? 'that is not a figure.' : paperWrongNote(v, col.values[row.id], row.unit === '£' ? '£' : row.unit, op, ops.length === 2 ? [operandValue(t, col, ops[0].id), operandValue(t, col, ops[1].id)] : null)} One more try.`;
};
/* the record notes a cell shown after two tries (the record's own wrapper names it "answer shown") */
const paperResetEntry0 = resetEntry;
resetEntry = function(){ paperResetEntry0(); if(UI.pb) UI.pb = { tokens:[] }; };

/* ---------- 4. Launch Day: five sums, snacks a Build, the fuel order after one worked example ---------- */
const paperHands0 = decideHandSumsPlanner;
decideHandSumsPlanner = function(L, pl){
  const H = paperHands0(L, pl); if(!paperOn() || S.phase !== 'setup') return H;
  H.revenue = { level:'calc', routes:[S.market] };          // the first market at three fares; the other routes' tickets are the model's
  if(H.snacks) H.snacks = 'build'; delete H.fuelCost; return H;
};
TABLES.fuelOrder1 = { title:'Fuel order', rows:[
  { id:'blocks', label:'Blocks of 1,000 L', type:'given', unit:'n' }, { id:'blk', label:'Price of 1,000 L', type:'given', unit:'£' },
  { id:'order', label:'Fuel order', type:'calc', unit:'£', op:'×', from:['blocks', 'blk'], sentence:'{blocks} × {blk} = {?order}', tool:'fuelOrder' }] };
function paperWeek1Fuel(pl){ const daily = plannedLitres(pl), days = [1, 2, 3, 4, 5, 6, 7].filter(d => !fuelFreeDay(d)).length, L = daily * days, price = weekFuelPrice(1);
  return { daily, days, L, blocks:Math.max(1, Math.ceil(L / fuelBlock() - 1e-9)), price, blk:Math.round(price * fuelBlock() * 100) / 100 }; }
const paperStagesLaunch0 = wkStagesLaunch;
wkStagesLaunch = function(pl){
  const st = paperStagesLaunch0(pl); if(!paperOn() || S.phase !== 'setup') return st;
  const out = st.filter(s => !/^fc\|/.test(s.id) && s.id !== 'fuel'), F = paperWeek1Fuel(pl);
  const fo = { id:'fuelorder', custom:true, kind:'fuelOrder1', fuel:F, opts:[{ id:'a', label:`This week's fuel · ${num(F.days)} days from ${dateShort(firstPaidDay())}`, sub:`${num(F.daily)} L a day: ${num(F.L)} L, ${F.blocks} block${F.blocks === 1 ? '' : 's'} of ${num(fuelBlock())} L at ${priceL(F.price)} a litre`, plan:pl, pick:null, word:'' }] };
  const at = out.findIndex(s => s.id === 'profit'); out.splice(at < 0 ? out.length : at, 0, fo); return out;
};
const paperStageTable0 = stageTable;
stageTable = function(stage, L0){
  if(!(stage && stage.custom)) return paperStageTable0(stage, L0);
  const F = stage.fuel, rows = TABLES[stage.kind].rows, cols = stage.opts.map(o => ({ id:o.id, label:o.label, sub:o.sub, values:{ blocks:F.blocks, blk:F.blk, order:Math.round(F.blocks * F.blk * 100) / 100 }, parts:{} }));
  const t = ensureTable('work:' + S.day + ':' + stage.id, stage.kind, cols, { rows, rowIds:rows.map(r => r.id) }); t.stage = stage.id; t.foOrder = true;
  return { t, lines:stage.opts.map(o => planLines(o.plan)) };
};
const paperRowTyped0 = rowTyped;
rowTyped = function(t, row){ if(t && t.foOrder) return row.id === 'order'; return paperRowTyped0(t, row); };
const paperDocName0 = docName;
docName = function(t, r){ if(t && t.foOrder) return 'Fuel order'; return paperDocName0(t, r); };
/* the worked example: one service's fuel (the decimal multiplication, once), then the price of a block */
const paperSumState0 = sumState;
sumState = function(W, st){
  const Z = paperSumState0(W, st); if(!paperOn() || S.phase !== 'setup') return Z;
  if(!Z.justDone && !st.tut && W.stage && W.stage.id === 'fuelorder' && Z.act && Z.act.foOrder){ Z.tut = true; Z.act = null; }
  return Z;
};
const paperTut0 = wkTutorial;
wkTutorial = function(st){
  if(!(paperOn() && S.phase === 'setup')) return paperTut0(st);
  const pl = normPlan(currentPlan()), x = pl.fleet.find(z => z.sched.length) || pl.fleet[0], p = planeById(x.planeId), r = routeById(x.sched[0] || S.market), L = fuelForTrip(p, r), price = weekFuelPrice(1), P = Math.round(price * 100), blk = fuelBlock();
  const k = st.tutStep || 0, steps = [[`${num(L)} L × ${priceL(price)}`, `One ${shortPlane(p)} service to ${r.city} burns ${num(L)} L. The price has a decimal point: make it whole, multiply, then divide back.`],
    [`${price.toFixed(2)} × 100 = ${P}`, `Make it whole: ${priceL(price)} has 2 decimal places, so × 100.`], [`${num(L)} × ${P} = ${num(L * P)}`, 'One multiplication, with whole numbers.'],
    [`${num(L * P)} ÷ 100 = ${twoDp(L * P / 100)}`, `Divide back by 100: one service's fuel costs ${twoDp(L * P / 100)}. Finance works this out for every service from now on.`],
    [`${num(blk)} L × ${priceL(price)} = ${money(blk * price)}`, `Fuel is ordered in blocks of ${num(blk)} L. × ${num(blk)} moves the digits three places: a block costs ${money(blk * price)}. Now this week's order is one sum: blocks × the price of a block.`]];
  return `<div class="wk-tut"><span class="kl">A worked example first</span><h2>Fuel: one service, then a block</h2>
    <div class="wk-tut-lines">${steps.slice(0, k + 1).map(([s, w], i) => `<div class="wk-tl ${i === k ? 'now' : ''}"><b class="mono">${s}</b><span>${w}</span></div>`).join('')}</div>
    <div class="wk-act">${k < steps.length - 1 ? '<button class="btn primary big" id="wkTutNext">Next step &#9654;</button>' : '<button class="btn primary big" id="wkTutGo">Now this week\'s order &#9654;</button>'}</div></div>`;
};
/* the fuel order done: the price it was worked at is the one the 50p rule measures from */
const paperCellCorrect0 = cellCorrect;
cellCorrect = function(t, byTeacher){
  const fo = paperOn() && t && t.foOrder && t.active && t.active.row === 'order', price = fo ? weekFuelPrice(1) : null;
  const r = paperCellCorrect0(t, byTeacher);
  if(fo){ const o = foS(); o.last = { price, day:S.day || 1 }; o.built = false; soTouch('fuelOrder', { count:true }); soLog(`Fuel order: ${t.cols[0].values.blocks} × ${num(fuelBlock())} L (Calculate)`); }
  return r;
};

/* ---------- 5. no per-service fuel sign-offs: the fuel desk has the week's one fuel sum ---------- */
const paperFuelDue0 = fuelCardsDue;
fuelCardsDue = function(pl){ if(paperOn()) return []; return paperFuelDue0(pl); };
const paperSoFuel0 = soFuelCands;
soFuelCands = function(pl){ if(paperOn()) return []; return paperSoFuel0(pl); };
function foS(){ const o = S.fo || (S.fo = { last:null, built:false, weeks:{} }); o.weeks = o.weeks || {};
  if(!o.last){ const b = S.fuelBuySigned, f = skills().fuelCost; if(b && b.p) o.last = { price:b.p, day:b.day }; else if(f && f.last && f.last.price) o.last = { price:f.last.price, day:f.lastDay || 1 }; }
  return o; }
/* this week's level: Calculate the first time and on a 50p move; otherwise Build once, then the model */
function foLevelNow(){
  const o = foS(), wk = weekNo(S.day || 1), W = o.weeks[wk]; if(W) return W.level;
  const t = S.tools && S.tools.fuelOrder; if(t) return t;
  const P = fuelOn(S.day || 1), step = WBS().fuelHandSumPriceStep || 0.5;
  return !o.last || Math.abs(P - o.last.price) >= step - 1e-9 ? 'calc' : !o.built ? 'build' : 'model';
}
function foWeek(){ const o = foS(), wk = weekNo(S.day || 1); return o.weeks[wk] || (o.weeks[wk] = { level:foLevelNow(), signed:false, n:0, tries:0, tokens:[] }); }
/* a Calculate order keeps a slot, but gives way to maths met for the first time (a new route's tickets, the bag fee): when the new
   ones fill the cap the order is a Build this week, and still a Calculate next week if the price is still 50p from the last one */
let FO_NEW = 0;
const foYields = (W, point) => FO_NEW > 0 && soCap() - soUsed(W, point) - FO_NEW < 1;
const paperSoReserved0 = soReserved;
soReserved = function(W, point){ if(!paperOn()) return paperSoReserved0(W, point);
  return point !== 'fuelDesk' && point !== 'audit' && deskModeAt(S.day) && !W.items.fo && foLevelNow() === 'calc' && !foYields(W, point) ? 1 : 0; };
const paperDecide0 = soDecideList;
soDecideList = function(cands, point, commit){
  if(!paperOn() || point === 'fuelDesk' || point === 'audit' || !deskModeAt(S.day)) return paperDecide0.apply(this, arguments);
  const W = soWeek(false), asked = new Set(Object.values(W.items).filter(it => it.level === 'calc').map(it => it.rel)), o = foS(), wk = weekNo(S.day || 1);
  FO_NEW = new Set((cands || []).filter(c => !W.items[c.key] && (c.forced || (!soMet(c.rel) && !asked.has(c.rel)))).map(c => c.rel)).size;
  try{ if(commit && !o.weeks[wk] && !W.items.fo && foLevelNow() === 'calc' && foYields(soWeek(true), point)) o.weeks[wk] = { level:'build', yielded:true, signed:false, n:0, tries:0, tokens:[] };
    return paperDecide0.apply(this, arguments); } finally { FO_NEW = 0; }
};
const paperSoSync0 = soSync;
soSync = function(){ paperSoSync0(); if(!paperOn() || !S.so || !S.so.weeks) return;
  Object.values(S.so.weeks).forEach(W => { const it = W.items.fo; if(it && !it.done && ((S.fo || {}).weeks || {})[W.wk] && S.fo.weeks[W.wk].signed) soDone(it); }); };
const paperFuelDeskR0 = R.fuelDesk;
R.fuelDesk = st => {
  if(paperOn() && soOn()){ const W = soWeek(true), F = foWeek();
    if(!W.items.fo){ W.items.fo = { key:'fo', rel:'fuelOrder', label:'The fuel order', cls:F.level === 'calc' ? (soMet('fuelOrder') ? 'changed' : 'new') : 'repeat', money:0, level:F.level, why:F.level === 'calc' ? 'asked' : 'decay', point:'fuelDesk', day:S.day, wk:W.wk, done:false, countAt:(skills().fuelOrder || {}).count || 0, noDecay:true }; W.order.push('fo'); } }
  return paperFuelDeskR0(st);
};
/* the order's sign-off on the desk, and the week's fuel by aircraft and route (the model's) */
function foFigures(){ const P0 = fuelOn(S.day || 1), blk = fuelBlock(), n = UI.fd ? UI.fd.selNow || 0 : 0, per = Math.round(blk * P0 * 100) / 100; return { P0, blk, n, per, total:Math.round(n * per * 100) / 100 }; }
function foSignHtml(){
  const F = foWeek(), G = foFigures(), key = 'fo:' + weekNo(S.day || 1), what = `Fuel order: ${G.n} × ${money(G.per)}`;
  if(!G.n) return '';
  if(F.signed && F.n === G.n) return `<div class="fd-sign ok one paper">${sumHeadHtml(key, what)}<p class="mono"><b>${G.n} × ${money(G.per)} = ${twoDp(G.total)}</b></p>${F.shown ? FIN_STAMP : F.level === 'model' ? '<span class="fx" title="The model worked this out">ƒ</span>' : cardStampHtml('ok')}</div>`;
  if(F.level === 'model') return '';
  const figs = foBuildFigs(G), tok = k => OPS4.includes(k) ? `<i class="rb-op">${k}</i>` : (f => f ? `<span class="rb-tk">${esc(f.label)} <b>${f.text}</b></span>` : '')(figs.find(f => f.k === k));
  const body = F.level === 'build' ? `<div class="rb-bar">${F.tokens.length ? F.tokens.map(tok).join('') : '<span class="rb-ph">Tap a figure, the operation, then a figure</span>'}<span class="rb-eq">=</span><b class="rb-res">?</b></div>
      <div class="rb-chips">${figs.map(f => `<button class="rb-chip" data-fofig="${f.k}">${esc(f.label)}<b>${f.text}</b></button>`).join('')}</div>
      <div class="rb-ops">${OPS4.map(o => `<button data-foop="${o}">${o}</button>`).join('')}<button class="dk-link" id="foUndo">Undo</button><span class="grow"></span><button class="btn primary" id="foChk">Check ✓</button></div>`
    : `<p class="pq-big mono">${G.n} × ${money(G.per)} = ?</p><p class="small">${G.n} block${G.n === 1 ? '' : 's'} of ${num(G.blk)} L at ${money(G.per)} a block (${num(G.blk)} L × ${priceL(G.P0)}).</p>
      <div class="fd-sa"><span class="sc-in ${F.q ? 'qy' : ''}"><i class="pre">£</i><input id="foIn" inputmode="decimal" autocomplete="off" value="${esc(F.v || '')}" aria-label="The order's cost"></span><button class="btn primary" id="foChk">Check ✓</button></div>${paperNote(sumNo(key))}`;
  return `<div class="fd-sign paper">${sumHeadHtml(key, what)}<div class="fd-sh"><b>${F.level === 'build' ? 'Build the order: the figures and the operation' : 'Sign off the order'}</b>${F.q ? cardStampHtml('q') : ''}</div>${body}<span class="sc-msg" role="status">${esc(F.msg || '')}</span></div>`;
}
function foBuildFigs(G){ const need = fdNeed(S.day || 1);
  return [{ k:'n', label:'Blocks', text:String(G.n) }, { k:'per', label:`Price of ${num(G.blk)} L`, text:money(G.per) }, { k:'ppl', label:'Price a litre', text:priceL(G.P0), dis:true }, { k:'need', label:"This week's litres", text:num(need.week) + ' L', dis:true }]; }
function foBreakdownHtml(){
  const pl = normPlan(currentPlan()), need = fdNeed(S.day || 1), P0 = fuelOn(S.day || 1), rows = [];
  pl.fleet.forEach(x => { const p = planeById(x.planeId), by = {}; x.sched.forEach(rid => { by[rid] = (by[rid] || 0) + 1; });
    Object.keys(by).forEach(rid => { const r = routeById(rid), L1 = fuelForTrip(p, r), trips = by[rid] * need.days, L = L1 * trips; rows.push({ plane:shortPlane(p), city:r.city, trips, L1, L, cost:Math.round(L * P0 * 100) / 100 }); }); });
  if(!rows.length) return '';
  rows.sort((a, b) => b.cost - a.cost); const tot = rows.reduce((t, r) => ({ L:t.L + r.L, cost:t.cost + r.cost }), { L:0, cost:0 });
  return `<section class="dk-pnl fd-ls"><div class="dk-pnl-h">${ICO2.fuel}<h2>This week's fuel by route <small>worked out by the model <span class="fx">ƒ</span></small></h2><span class="grow"></span></div>
    <table class="dk-t fd-t"><thead><tr><th>Aircraft</th><th>Route</th><th class="num">Services</th><th class="num">Litres each</th><th class="num">Litres</th><th class="num">Cost at ${priceL(P0)}</th></tr></thead>
    <tbody>${rows.map(r => `<tr><td>${esc(r.plane)}</td><td>${esc(r.city)}</td><td class="num">${num(r.trips)}</td><td class="num">${num(r.L1)}</td><td class="num">${num(r.L)}</td><td class="num">${twoDp(r.cost)}</td></tr>`).join('')}
    <tr class="tot"><td colspan="4">This week (${need.days} day${need.days === 1 ? '' : 's'})</td><td class="num">${num(tot.L)}</td><td class="num">${twoDp(tot.cost)}</td></tr></tbody></table>
    <p class="fd-foot small">${rows.length > 1 ? `The most expensive line is ${esc(rows[0].plane)} to ${esc(rows[0].city)}: ${twoDp(rows[0].cost)} this week.` : ''}</p></section>`;
}
const paperFdHtml0 = fuelDeskHtml;
fuelDeskHtml = function(asView){
  if(!paperOn()) return paperFdHtml0(asView);
  const had = S.fuelBuySigned; if(!had) S.fuelBuySigned = { tmp:true };
  let h; try{ h = paperFdHtml0(asView); } finally { if(!had) delete S.fuelBuySigned; }
  const F = foWeek(), G = foFigures(), need = F.level !== 'model' && G.n > 0 && !(F.signed && F.n === G.n);
  if(F.level === 'model' && G.n > 0 && !(F.signed && F.n === G.n)){ F.signed = true; F.n = G.n; }
  if(F.signed && F.n === G.n && UI.fd) UI.fd.signed = true;
  h = h.replace('<div class="fd-tot">', foSignHtml() + '<div class="fd-tot">');
  if(need) h = h.replace(/(<div class="fd-tot"><span>Today's order cost <small>[^<]*<\/small><\/span><b>)[^<]*(<\/b>)/, '$1?$2').replace(/(<button class="btn fd-buy" id="fdBuy")/, '$1 disabled');
  // the week's fuel by aircraft and route shares the bottom panel with the scenario table: a tab each (the route sheet once the order is signed)
  const tab = UI.fd.lsTab || (F.signed ? 'route' : 'scen'), i = h.indexOf('<section class="dk-pnl fd-sc">'), j = i < 0 ? -1 : h.indexOf('</section>', i);
  if(i < 0 || j < 0) return h;
  const tabs = `<span class="fd-tabs" role="tablist"><button role="tab" data-fdls="scen" class="${tab === 'scen' ? 'on' : ''}">Scenarios</button><button role="tab" data-fdls="route" class="${tab === 'route' ? 'on' : ''}">Fuel by route</button></span>`;
  const scen = h.slice(i, j + 10).replace('<span class="grow"></span>', '<span class="grow"></span>' + tabs), route = foBreakdownHtml().replace('<span class="grow"></span>', '<span class="grow"></span>' + tabs);
  return h.slice(0, i) + (tab === 'route' && route ? route : scen) + h.slice(j + 10);
};
const paperBindFd0 = bindFuelDesk;
bindFuelDesk = function(asView){
  paperBindFd0(asView); if(!paperOn()) return;
  const root = screen(), F = foWeek(), key = 'fo:' + weekNo(S.day || 1);
  const done = (shown) => { const G = foFigures(); F.signed = true; F.n = G.n; F.shown = !!shown; F.q = false; F.tries = 0; F.tokens = []; UI.fd.signed = true;
    const o = foS(); if(F.level === 'calc'){ o.last = { price:G.P0, day:S.day }; o.built = false; } else if(F.level === 'build') o.built = true; soSync(); save(); render(); };
  const recE0 = (lv) => { const G = foFigures(); return recOpen(key, { type:lv === 'build' ? 'build' : 'calc', relKey:'fuelOrder', doc:'Fuel order on the desk', ask:`${G.n} block${G.n === 1 ? '' : 's'} of ${num(G.blk)} L at ${priceL(G.P0)}.`,
    question:`${G.n} × ${money(G.per)}`, unit:'£2', correct:G.total, correctText:twoDp(G.total), ops:[G.n, G.per], op:'×', level:lv === 'build' ? 'Build' : 'Calculate' }); };
  const inp = $('foIn'); if(inp){ inp.oninput = () => { F.v = inp.value; }; inp.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); const c = $('foChk'); if(c) c.click(); } }; }
  root.querySelectorAll('[data-fofig]').forEach(b => b.onclick = () => { if(F.tokens.length % 2 === 1){ F.msg = 'Put the operation between the figures.'; render(); return; } F.tokens.push(b.getAttribute('data-fofig')); F.msg = ''; render(); });
  root.querySelectorAll('[data-foop]').forEach(b => b.onclick = () => { if(F.tokens.length % 2 === 0){ F.msg = 'Start with a figure.'; render(); return; } F.tokens.push(b.getAttribute('data-foop')); F.msg = ''; render(); });
  on('foUndo', () => { F.tokens.pop(); F.msg = ''; render(); });
  on('foChk', () => { const G = foFigures(); if(!G.n) return;
    if(F.level === 'build'){ const T = F.tokens; if(T.length < 3){ F.msg = 'Tap a figure, the operation, then a figure.'; render(); return; }
      const figs = foBuildFigs(G), bad = T.length === 3 && [T[0], T[2]].map(k => figs.find(f => f.k === k && f.dis)).find(Boolean), e = recE0('build');
      const chips = T.map(k => OPS4.includes(k) ? { op:k } : (f => f ? { label:f.label, text:f.text, k } : { label:k })(figs.find(f => f.k === k)));
      const msg = T.length !== 3 ? 'This sum needs just two figures and one operation.' : bad ? `${bad.label} is not part of this order: the blocks and the price of a block.` : T[1] !== '×' ? 'Every block costs the same: which operation repeats the price for each block?' : !(new Set([T[0], T[2]]).size === 2 && ['n', 'per'].includes(T[0]) && ['n', 'per'].includes(T[2])) ? 'Use the blocks and the price of a block.' : '';
      if(!msg){ recAttempt(e, { ok:true, chips, method:'choose the figures and the operation' }); done(false); return; }
      recAttempt(e, { ok:false, chips, msg, note:msg, method:'choose the figures and the operation' }); F.tries = (F.tries || 0) + 1;
      if(F.tries >= 2 && twoTriesOn()){ paperRecShown(key); done(true); return; }
      F.q = true; F.tokens = []; F.msg = `Query: ${msg} One more try.`; render(); return; }
    const v = scParse('£', F.v); if(v === null){ F.msg = 'Type the cost of the order in pounds.'; render(); return; }
    const e = recE0('calc'), ok = v === Math.round(G.total * 100);
    recAttempt(e, { ok, given:String(F.v || ''), value:v / 100, method:'blocks × the price of a block' });
    if(ok){ done(false); return; }
    F.tries = (F.tries || 0) + 1;
    if(F.tries >= 2 && twoTriesOn()){ paperRecShown(key); done(true); return; }
    F.q = true; F.msg = `Query: ${paperWrongNote(v / 100, G.total, '£', '×', [G.n, G.per])} One more try.`; render(); });
  root.querySelectorAll('[data-fdls]').forEach(b => b.onclick = () => { UI.fd.lsTab = b.getAttribute('data-fdls'); render(); });
  // buying is held until this week's order is signed (a model week signs itself)
  const buy = $('fdBuy'); if(buy){ const G = foFigures(); if(F.level !== 'model' && G.n > 0 && !(F.signed && F.n === G.n)) buy.disabled = true; }
};
/* a change of blocks after signing asks again (the same sum number) */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-fdb], [data-fdm]'); if(!b || !S || !paperOn() || !S.fo) return; const F = foWeek(); if(F.signed && F.level !== 'model'){ F.signed = false; F.v = ''; F.msg = ''; F.tokens = []; } }, true);

/* ---------- 6. the sign-off cards (Calculate and Build): numbered, two tries, the method as a reference card ---------- */
const paperSoHtml0 = soCardHtml;
soCardHtml = function(it, st, n){
  let h = paperSoHtml0(it, st, n); if(!paperOn() || !it || it.level === 'model') return h;
  const sp = soSpec(it); if(!sp) return h; const cs = soCardState(st, it.key), key = 'so:' + it.key;
  h = h.replace(/(<span class="so-lv[^"]*">[^<]*<\/span>(?:<span class="stamp[^"]*">[^<]*<\/span>)?<\/div>)/, `$1${sumHeadHtml(key, sp.title)}`);
  if(cs.shown) h = h.replace(/<span class="stamp ok">[^<]*<\/span>/, FIN_STAMP);
  if(it.level === 'calc') h = h.replace(/<p class="sc-note">(?!Round each number)[\s\S]*?<\/p>/, it.done || cs.ok ? '' : paperNote(sumNo(key)) + paperRefHtml(it.rel, sp.op, sp.b.f === 'ppl'));
  return h;
};
const paperSoCalc0 = soCalcCheck;
soCalcCheck = function(sp, cs){
  const ok = paperSoCalc0(sp, cs); if(ok || !paperOn() || !cs.q) return ok;
  const v = soParse(cs.v, sp.res), ans = soAns(sp); cs.tries = (cs.tries || 0) + 1;
  if(cs.tries >= 2 && twoTriesOn()){ if(sp.it) paperRecShown('so:' + sp.it.key); cs.ok = true; cs.shown = true; cs.q = false; cs.msg = `Checked by Finance: ${soFmt(sp.a.f, sp.a.v)} ${sp.op} ${soFmt(sp.b.f, sp.b.v)} = ${soFmt(sp.res, ans)}. Copy it into your book.`; return true; }
  cs.msg = `Query: ${v === null ? 'that is not a figure.' : paperWrongNote(v, ans, sp.res, sp.op, [sp.a.v, sp.b.v])} One more try.`; return false;
};
const paperSoBuild0 = soBuildCheck;
soBuildCheck = function(sp, cs){
  const ok = paperSoBuild0(sp, cs); if(ok || !paperOn() || !cs.q) return ok;
  cs.tries = (cs.tries || 0) + 1;
  if(cs.tries >= 2 && twoTriesOn()){ if(sp.it) paperRecShown('so:' + sp.it.key); cs.tokens = [sp.a.k, sp.op, sp.b.k]; cs.ok = true; cs.shown = true; cs.q = false; cs.msg = 'Checked by Finance: the figures and the operation are shown.'; return true; }
  cs.msg = `Query: ${cs.msg} One more try.`; cs.tokens = []; return false;
};

/* ---------- 7. the review Build steps: numbered, two tries ---------- */
const paperRbHtml0 = rbCardHtml;
rbCardHtml = function(it, st, store){
  let h = paperRbHtml0(it, st, store); if(!paperOn() || !it || it.locked) return h;
  h = h.replace(/(<p class="rb-ask">[\s\S]*?<\/p><\/div>(?:<span class="stamp[^"]*">[^<]*<\/span>)?<\/div>)/, `$1${sumHeadHtml('rb:' + it.id, it.title)}`);
  if(st.shown) h = h.replace(/<span class="stamp ok">[^<]*<\/span>/, FIN_STAMP);
  return h;
};
const paperRbCheck0 = rbCheck;
rbCheck = function(it, st){
  const ok = paperRbCheck0(it, st); if(ok || !paperOn() || !st.q) return ok;
  st.tries = (st.tries || 0) + 1;
  if(st.tries >= 2 && twoTriesOn()){ paperRecShown('rb:' + it.id);
    if(it.kind === 'mean'){ st.op = '÷'; st.div = it.div; }
    else if(it.kind === 'sum') st.tokens = it.figs.flatMap((f, i) => i ? ['+', f.k] : [f.k]);
    else { const [a, b] = it.figs.slice().sort((x, y) => y.v - x.v); st.tokens = [a.k, '−', b.k]; }
    st.ok = true; st.shown = true; st.q = false; st.msg = 'Checked by Finance: the figures and the operation are shown.'; return true; }
  st.msg = `${st.msg} One more try.`; if(it.kind !== 'mean') st.tokens = []; return false;
};

/* ---------- 8. the cards with their own Check (time to afford, cash after buying, rent or buy, the two-step cards) ---------- */
/* Each keeps its own check and notes. After a wrong answer the note gets "One more try"; after the second, Finance fills
   the answer in, the card's own check runs on it, and the record's last attempt is marked as shown. */
function paperFill(sel, v){ const i = screen().querySelector(sel); if(!i || v === null || v === undefined) return false; i.value = String(v); i.dispatchEvent(new Event('input', { bubbles:true })); return true; }
function paperMarkShown(key){ setTimeout(() => { try{ const R = rec(), e = R.entries.filter(x => x.key === key).pop(); if(!e || !e.attempts.length) return; const a = e.attempts[e.attempts.length - 1];
  if(a.ok){ a.ok = false; a.shown = true; a.note = 'Checked by Finance after two tries: the figure was shown.'; e.status = 'shown'; save(); } }catch(err){} }, 30); }
const negAfterNow = () => { const o = S.overlay, f = o && S.fleet.find(x => x.uid === o.uid), B = f && leaseBuyOffer(f); return B ? Math.round(B.after) : null; };
const robNow = () => { const ch = S.rnd && S.rnd.acChoice, o = ch && acOffer(ch.pid); return o && o.lease ? Math.round(o.price / o.lease * 10) / 10 : null; };
const PAPER_CHK = [
  { sel:'#ta1Chk', fill:() => paperFill('[data-pad="ta1"]', UI.taF && UI.taF.still) },
  { sel:'#ta2Chk', fill:() => paperFill('[data-pad="ta2"]', UI.taF && (UI.taF.unit === 'week' ? UI.taF.weeks : UI.taF.days)), rec:() => UI.taF && (UI.taF.unit === 'week' ? 'taw:' + UI.taF.pid + ':' + S.day : 'ta:' + UI.taF.pid) },
  { sel:'#taBuildChk', fill:() => { ['[data-taclr]', '[data-tafig="still"]', '[data-taop="÷"]', '[data-tafig="rate"]'].forEach(q => { const b = screen().querySelector(q); if(b) b.click(); }); return true; }, rec:() => UI.taF && (UI.taF.unit === 'week' ? 'taw:' + UI.taF.pid + ':' + S.day : 'ta:' + UI.taF.pid) },
  { sel:'#negChk', fill:() => paperFill('[data-pad="negcash"]', negAfterNow()), rec:() => 'neg:' + S.day + ':' + Math.round(S.cash) },
  { sel:'#rbChk', fill:() => paperFill('#rbIn', robNow()), rec:() => S.rnd && S.rnd.acChoice ? 'rob:' + S.rnd.acChoice.pid : null },
  { sel:'[data-soprechk]', attr:'data-soprechk', fill:k => { const it = soItem(k), sp = it && soSpec(it); return !!sp && !!sp.pre && paperFill(`[data-sopre="${k}"]`, sp.pre.unit === '£' ? sp.pre.want : sp.pre.alt !== undefined ? sp.pre.alt : sp.pre.want); } }];
UI.paperTries = UI.paperTries || {};
document.addEventListener('click', ev => {
  if(UI.paperFilling || !S || !paperOn()) return; const b = ev.target && ev.target.closest && ev.target.closest(PAPER_CHK.map(c => c.sel).join(',')); if(!b) return;
  const C = PAPER_CHK.find(c => b.matches(c.sel)), k = C.attr ? b.getAttribute(C.attr) : '', btnSel = C.attr ? `[${C.attr}="${k.replace(/"/g, '\\"')}"]` : C.sel, key = C.sel + '|' + k + '|' + S.day + '|' + S.si;
  setTimeout(() => {
    const nb = screen().querySelector(btnSel), card = nb && nb.closest('section, .so-pre, .acq-in'), wrong = !!(nb && card && card.querySelector('.qy, .stamp.q')) || !!(nb && nb.closest('section') && nb.closest('section').querySelector('.stamp.q'));
    if(!wrong){ delete UI.paperTries[key]; return; }
    const n = UI.paperTries[key] = (UI.paperTries[key] || 0) + 1;
    if(n >= 2 && twoTriesOn()){ UI.paperFilling = true; try{ if(C.fill(k)){ const again = screen().querySelector(btnSel); if(again) again.click(); const rk = C.rec && C.rec(); if(rk) paperMarkShown(rk); UI.paperFin = { day:S.day, si:S.si, at:Date.now() }; } } finally { UI.paperFilling = false; } delete UI.paperTries[key]; setTimeout(() => render(), 40); return; }
    const m = card && (card.querySelector('.sc-msg') || (card.closest('section') || card).querySelector('.sc-msg')); if(m && m.textContent && !/One more try/.test(m.textContent)) m.textContent += ' One more try.';
  }, 0);
}, true);
/* the numbers on these cards, and Finance's stamp on the one it filled in */
function paperCardHeads(){
  const root = screen(), add = (el, key, what) => { if(!el || !key || el.querySelector('.sum-h')) return; const h = el.querySelector('.sc-h'); if(h) h.insertAdjacentHTML('afterend', sumHeadHtml(key, what)); };
  const f = UI.taF; root.querySelectorAll('.ta-card').forEach(el => { if(!f) return; const wk = el.classList.contains('taw'); add(el, wk ? 'taw:' + f.pid + ':' + S.day : 'ta:' + f.pid, `Time to afford: ${f.short || f.name}`); });
  root.querySelectorAll('.neg-card').forEach(el => add(el, 'neg:' + S.day + ':' + Math.round(S.cash), 'Cash after buying'));
  const rb = root.querySelector('#rbIn'), ch = S.rnd && S.rnd.acChoice; if(rb && ch) add(rb.closest('section'), 'rob:' + ch.pid, `Rent or buy: ${shortPlane(planeById(ch.pid))}`);
  const F = UI.paperFin; if(F && F.day === S.day && F.si === S.si && Date.now() - F.at < 4000){ const st = root.querySelector('.ta-card.ok .stamp.ok, .neg-card.ok .stamp.ok, .acq-rb.ok .stamp.ok'); if(st) st.outerHTML = FIN_STAMP; }
}

/* ---------- 9. no column frames: the Working pad and the free pad are off ---------- */
const paperPadButtons0 = padButtons;
padButtons = function(){ if(paperOn()){ if(PAD) closePad(); return; } return paperPadButtons0(); };
const paperRender0 = render;
render = function(){ const r = paperRender0.apply(this, arguments); try{ document.body.classList.toggle('paper', !!paperOn()); if(paperOn()) paperCardHeads(); }catch(e){} return r; };

/* ---------- 10. the record: N in the margin, a ruled box for the working from the book ---------- */
const paperCalcHtml0 = recCalcHtml;
recCalcHtml = function(e, grouped){
  let h = paperCalcHtml0(e, grouped); if(e.n === undefined) return h;
  h = h.replace('<div class="eh"><span>', `<div class="eh"><span><b class="sn">Sum ${e.n}</b> · `);
  return h.replace(/<\/section>$/, '<div class="wb"><span>Working (from your book)</span></div></section>');
};
const paperAttHtml0 = recAttemptHtml;
recAttemptHtml = function(e, a, n){ const h = paperAttHtml0(e, a, n); return a && a.shown ? h.replace('<span class="red">answer shown</span>', '<span class="red">shown: Checked by Finance</span>') : h; };
const paperPrint0 = recordPrintHtml;
recordPrintHtml = function(o){ return paperPrint0(o).replace('</style>', '.sn{display:inline-block;min-width:44pt;border:1pt solid #000;padding:0 3pt;margin-right:2pt;font-weight:700}.wb{margin:5pt 0 0 14pt;height:62pt;border:.75pt solid #000;background:repeating-linear-gradient(#fff 0 13.5pt,#9AA7B8 13.5pt 14pt);position:relative}.wb span{position:absolute;top:-1pt;left:4pt;background:#fff;padding:0 3pt;font-size:8.5pt;font-weight:600}</style>'); };

/* ---------- for the tests: the active Build cell's sequence, and this week's fuel order ---------- */
function paperPlan(){ const t = currentTable(), a = t && t.active; if(!a) return null; const col = t.cols.find(c => c.id === a.col), row = tRows(t).find(r => r.id === a.row); if(!col || !row) return null;
  const ops = stackRows(t, col, row); return { cell:t.id + ':' + a.col + '|' + a.row, build:!!(row.tool && toolLevel(row.tool) === 'build'), seq:[ops[0].id, (ops[1] && ops[1].op) || row.op || '×', ops[1] && ops[1].id], answer:col.values[row.id] }; }
function foPlan(){ if(!paperOn() || !UI.fd) return null; const F = foWeek(), G = foFigures(); return { level:F.level, signed:!!(F.signed && F.n === G.n), n:G.n, per:G.per, answer:G.total.toFixed(2), seq:['n', '×', 'per'], sumNo:sumNo('fo:' + weekNo(S.day || 1)) }; }
/* the record names the method: worked on paper, the answer typed */
const paperMethodNow0 = recMethodNow;
recMethodNow = function(){ return paperOn() ? 'worked on paper, answer typed' : paperMethodNow0(); };
