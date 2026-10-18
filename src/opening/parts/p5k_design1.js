/* =====================================================================
   CLAUDE DESIGN, BATCH 1 (Bertie's Launch Day choices, 18 Oct 2026; docs/Launch-Day-Changes-Batch-1.md).
   Colours, sizes and components follow DESIGN.md (tokens in p1_head_design1.css).
   1 the Studio's selected flight: the fare stepper, and the worth sum in a callout pinned to the flight;
   2 the Work it out page: one centred column, the Week 1 flow for every sum, SUM n;
   4 the take-off: a ground roll, the nose wheel first, then the climb.
   (3, the Operations Wall in deep navy, is CSS only.)
   ===================================================================== */

/* ---------- 4. the take-off (Bertie: "feels too quick"; a straight ground roll of about 2.5 s first) ----------
   Seconds at the normal speed: taxi in 1.5, hold 0.4, ground roll 2.5 (gathering speed: the runway's centre line streams
   past faster and faster while the camera keeps the plane in view), the nose wheel lifts over 0.9 (the plane pivots on its
   main wheels), then the main wheels leave the ground and it climbs away for 6.1, out of the view (its shadow stays on the ground). 9.5 s from the start of
   the roll to leaving the view, 11.4 s in all. One continuous motion: every stage starts at the speed the last one ended on.
   Reduced motion: the plane stands at the holding point and fades out over 0.8 s. */
const TKO2 = { taxi:1.5, hold:0.4, roll:2.5, rotate:0.9, climb:6.1, x0:1.25, xHold:0.60, xEnd:-0.62, pitch:9, climbPitch:7, yEnd:0.95, rmFade:0.8 };
TKO2.total = TKO2.taxi + TKO2.hold + TKO2.roll + TKO2.rotate + TKO2.climb;
takeoffSecs = function(){ return Math.max(0.3, TKO2.total * liveScale()); };
/* u is the share of the whole sequence (0..1). x and y are shares of the stage's width and height; a is the nose-up angle;
   g is how far the ground has moved (in stage widths), for the runway's centre line */
takeoffPose = function(u){
  const T = TKO2, t = u * T.total, ease = v => 1 - Math.pow(1 - v, 3), smooth = v => v <= 0 ? 0 : v >= 1 ? 1 : v * v * (3 - 2 * v);
  if(t < T.taxi) return { x:T.x0 - (T.x0 - T.xHold) * ease(t / T.taxi), y:0, a:0, o:1, g:0, k:'taxi' };
  if(t < T.taxi + T.hold) return { x:T.xHold, y:0, a:0, o:1, g:0, k:'taxi' };
  const r = t - T.taxi - T.hold, run = T.roll + T.rotate + T.climb, lift = T.roll + T.rotate;
  /* the plane gains on the camera slowly (an ease-in across the whole run), so it never jumps */
  const x = T.xHold - (T.xHold - T.xEnd) * Math.pow(r / run, 2.4);
  /* the ground: even acceleration until the wheels leave it, then the camera pans at that speed */
  const acc = 0.35, g = r < lift ? acc * r * r / 2 : acc * lift * lift / 2 + acc * lift * (r - lift);
  if(r < T.roll) return { x, y:0, a:0, o:1, g, k:'roll' };
  if(r < lift) return { x, y:0, a:T.pitch * smooth((r - T.roll) / T.rotate), o:1, g, k:'rotate' };
  const c = (r - lift) / T.climb, y = T.yEnd * Math.pow(c, 1.7), a = T.pitch + (T.climbPitch - T.pitch) * smooth(c / 0.6), o = c < 0.88 ? 1 : Math.max(0, 1 - (c - 0.88) / 0.12);
  return { x, y, a, o, g, k:'climb' };
};
takeoffRun = function(root, at, onDone){
  const R0 = root.querySelector('.runway'); if(!R0) return; const plane = R0.querySelector('.rw-plane'), strip = R0.querySelector('.rw-strip'), shadow = plane && plane.querySelector('.art-shadow'), total = takeoffSecs(), rm = reducedMotion(), st = R0.querySelector('.rw-st');
  const stage = (k, label) => { if(R0.classList.contains(k)) return; R0.classList.remove('taxi', 'roll', 'climb', 'gone'); R0.classList.add(k); if(st) st.textContent = label; };
  if(R0._raf) cancelAnimationFrame(R0._raf);
  const el0 = Math.max(0, (Date.now() - at) / 1000), fade = Math.min(total, TKO2.rmFade);
  if(!plane || el0 >= (rm ? fade : total)){ stage('gone', 'AIRBORNE'); if(onDone) onDone(); return; }
  if(liveHere() && el0 < 0.5 && !rm) takeoffSound(total);
  if(rm){ R0.classList.add('tko-rm'); plane.style.transform = `translate3d(${(TKO2.xHold * R0.clientWidth).toFixed(1)}px,0,0)`; stage('roll', 'TAKE-OFF');
    const fr = () => { if(!R0.isConnected) return; const v = Math.min(1, (Date.now() - at) / 1000 / fade); plane.style.opacity = (1 - v).toFixed(3);
      if(v >= 1){ stage('gone', 'AIRBORNE'); if(onDone) onDone(); return; } R0._raf = requestAnimationFrame(fr); };
    fr(); return; }
  const frame = () => {
    if(!R0.isConnected) return;
    const u = Math.min(1, Math.max(0, (Date.now() - at) / 1000 / total)), P = takeoffPose(u), W = R0.clientWidth, H = R0.clientHeight;
    plane.style.transform = `translate3d(${(P.x * W).toFixed(1)}px,${(-P.y * H).toFixed(1)}px,0) rotate(${P.a.toFixed(2)}deg)`; plane.style.opacity = P.o.toFixed(3);
    if(strip) strip.style.backgroundPositionX = (P.g * W).toFixed(1) + 'px';
    if(shadow) shadow.style.opacity = Math.max(0, 1 - P.y * 6).toFixed(3);
    if(P.k === 'taxi') stage('taxi', 'TAXI'); else if(P.k !== 'climb') stage('roll', 'TAKE-OFF'); else if(u < 1) stage('climb', 'AIRBORNE');
    if(u >= 1){ stage('gone', 'AIRBORNE'); if(onDone) onDone(); return; }
    R0._raf = requestAnimationFrame(frame);
  };
  frame();
};

/* ---------- the Calculation Builder (DESIGN.md: the Week 1 flow for every sum) ----------
   1 build the sum: the equation's slots are empty; the pupil taps two of four figure tiles and an operation (the other two
   tiles are real figures from the same screen, so the choice is by meaning) and presses "That's my sum"; 2 the built sum
   shows large with a magenta "?", the gold SUM n says to work it out in the book, and the answer is typed; 3 done: the "?"
   becomes the answer in green, once. A wrong build or answer is an amber Query with one more try; twice, it is shown.
   The same pieces build the Work it out panel and the Studio's worth callout. */
const BV_OPS = ['×', '÷', '+', '−'], BV_OPNAME = { '×':'times', '÷':'divided by', '+':'plus', '−':'minus' }, BV_AB = 'ABCDEFG';
const bvM = text => /£/.test(String(text)) ? ' bv-money' : '';
function bvTilesHtml(tiles, tokens, attr){ return `<div class="bv-tiles">${tiles.map(f => `<button class="bv-tile ${tokens.includes(f.k) ? 'on' : ''}" ${attr}="${esc(f.k)}"><small>${esc(f.label)}</small><b class="${bvM(f.text)}">${f.text}</b></button>`).join('')}</div>`; }
function bvSlotsHtml(tiles, tokens, need){ const out = [];
  for(let i = 0; i < need; i++){ const k = tokens[i], f = k !== undefined && tiles.find(x => x.k === k);
    out.push(i % 2 ? `<span class="bv-slot op ${k ? 'on' : ''}">${k || ''}</span>` : `<span class="bv-slot ${f ? 'on' : ''}">${f ? `<i class="bv-ab">${BV_AB[i / 2]}</i>${f.text}` : '?'}</span>`); }
  return out.join(''); }
function bvBuildStepHtml(o){
  return `<div class="bv-step bv-s1"><p class="bv-eq"><span class="bv-eql">${esc(o.lhs)}</span><span class="bv-eqs">=</span>${bvSlotsHtml(o.tiles, o.tokens, o.need)}</p>${bvTilesHtml(o.tiles, o.tokens, o.fig)}
    <div class="bv-ops">${BV_OPS.map(x => `<button class="bv-op" ${o.op}="${x}" aria-label="${BV_OPNAME[x]}">${x}</button>`).join('')}<button class="bv-link" id="${o.undo}" ${o.tokens.length ? '' : 'disabled'}>Undo</button><div class="msg bv-msg ${/^Query/.test(o.msg || '') ? 'q' : ''}" id="${o.msgId}" role="status">${esc(o.msg || '')}</div><button class="bv-btn primary big bv-mine" id="${o.chk}">That's my sum &#9654;</button></div></div>`; }
function bvBookHtml(n){ return `<div class="bv-book"><span class="bv-sumbadge">SUM ${n}</span><p>Work it out in your book. Write <b>Sum ${n}</b> beside your working, then type your answer.</p></div>`; }
function bvTypeStepHtml(o){
  return `<div class="bv-step bv-s2">${o.formula ? `<p class="bv-fl">${o.formula}</p>` : ''}<p class="bv-built"><span class="bv-big">${o.big} = <span class="bv-unknown">?</span></span>${o.same ? `<span class="bv-bok">${o.same}</span>` : `<span class="bv-bok">&#10003; sum built · <button class="bv-link" id="${o.change}">change</button></span>`}</p>
    ${bvBookHtml(o.n)}<div class="bv-ansrow"><span class="answer bv-field">${o.unit ? `<span class="unit">${o.unit}</span>` : ''}<input id="${o.ans}" class="mono" inputmode="decimal" autocomplete="off" value="${esc(o.entry || '')}" aria-label="${esc(o.aria)}"></span><button class="bv-btn primary big" id="${o.chk}">Check &#10003;</button><div class="msg bv-msg ${/^Query/.test(o.msg || '') ? 'q' : o.ok ? 'ok' : ''}" id="${o.msgId}" role="status">${esc(o.msg || '')}</div></div>${o.extra || ''}</div>`; }
/* the operands as A × B, their figures, or their letters alone (a later column reads them from the sheet) */
function bvBig(ops, op0, letters){ return ops.map((x, i) => `${i ? `<span class="bv-o">${esc(x.op || op0)}</span>` : ''}<span class="bv-n${letters ? '' : bvM(x.value)}"><i class="bv-ab">${BV_AB[i]}</i>${letters ? '' : x.value}</span>`).join(''); }
/* the record's line for the sum: "Sum N · Week W · what it is" (the Sum N is the gold tag in the panel's header, so screen readers alone read it here) */
function bvSumLine(key, what){ return `<p class="sum-h bv-sumh"><span class="bv-vh">Sum ${sumNo(key)} · </span>Week ${weekNo(recNow())} · ${esc(what)}</p>`; }
/* check a built sum against the one wanted: figures and operations alternate; order matters for − and ÷ */
function bvJudge(T, seq, tiles, lhs){
  const need = seq.length, nf = (need + 1) / 2;
  if(T.length < need) return { wait:true, msg:T.length ? (nf === 2 ? 'Finish the sum: a figure, the operation, a figure.' : 'Finish the sum: each figure, with an operation between them.') : 'Tap a figure, the operation, then a figure.' };
  const figs = T.filter((x, i) => i % 2 === 0), ops = T.filter((x, i) => i % 2), wantF = seq.filter((x, i) => i % 2 === 0), wantO = seq.filter((x, i) => i % 2), bad = figs.map(k => tiles.find(f => f.k === k && f.dis)).find(Boolean);
  if(T.length > need) return { msg:nf === 2 ? 'This sum needs just two figures and one operation.' : `This sum needs ${nf} figures.` };
  if(bad) return { msg:`${bad.label} is not part of ${lhs.toLowerCase()}: which figures make it?` };
  if(new Set(figs).size < figs.length) return { msg:'Use different figures.' };
  if(ops.some((o, i) => o !== wantO[i])){ const o = wantO.find((w, i) => ops[i] !== w);
    return { msg:o === '×' ? 'The same amount for each one: which operation repeats it?' : o === '+' ? 'Which operation joins amounts together?' : o === '−' ? 'Which operation takes one amount away from another?' : 'Which operation shares an amount out equally?' }; }
  if(!wantF.every(k => figs.includes(k)) || (wantO.some(o => o === '−' || o === '÷') && figs.join('|') !== wantF.join('|'))) return { msg:'Check which figures this needs, and which comes first.' };
  return { ok:true }; }

/* ---------- 2. the Work it out page: one centred column, and the Week 1 flow for every sum ----------
   The sheet, then the working panel at the same width, then the route strips. Every sum on the page is built first, then
   typed (a Build-level sum is typed too now: the pupil works every one out in the book). Where one row is worked out at
   several fares, the first column is built and the later ones are the same sum, read from the sheet: they start at step 2
   with A and B outlined. The test kit and the tests keep their handles: [data-pbfig], [data-pbop], #pbUndo, #pbChk,
   #cellAns, #cellCheck, #ftMsg, #wkNext. */
function bvSeq(t, col, row){ const ops = stackRows(t, col, row), seq = [ops[0].id]; ops.slice(1).forEach(x => seq.push(x.op || row.op || '×', x.id)); return seq; }
function bvState(key){ let B = UI.bvB; if(!B || B.key !== key) B = UI.bvB = { key, tokens:[], tries:0, built:false, shown:false }; return B; }
/* a later column of a row already worked out in this table: the same sum */
function bvSame(t, col, row){ const i = t.cols.indexOf(col); return i > 0 && t.cols.slice(0, i).some(c => (t.done || {})[cellId(c.id, row.id)]); }
/* the four tiles: the figures the sum uses, then real figures from the same screen (the column's "want to fly", other figures
   shown in the same column of the sheet, nearest row first, then the day's aircraft and fuel from the strip under the timetable) */
function bvTiles(t, col, row){
  const ops = stackRows(t, col, row), V = col.values || {}, used = new Set(ops.map(x => x.id)), tiles = ops.map(x => ({ k:x.id, label:x.label, text:String(x.value) })), max = Math.max(4, ops.length);
  const add = (k, label, text) => { if(tiles.length >= max || used.has(k) || tiles.some(x => x.k === k || x.text === text || x.label.toLowerCase() === label.toLowerCase())) return; tiles.push({ k, label, text, dis:true }); };
  const m = /^([\d,]+) (want to fly)/.exec(col.sub || ''); if(m) add('want', 'Want to fly', m[1]);
  const rows = tRows(t), ri = rows.findIndex(r => r.id === row.id);
  rows.map((r, i) => ({ r, i, d:Math.abs(i - ri) })).sort((a, b) => a.d - b.d || a.i - b.i).forEach(({ r, i }) => { if(r.id === row.id || V[r.id] === undefined || V[r.id] === null) return;
    if(r.type === 'calc' && !['done', 'derived'].includes(cellState(t, col, i))) return; add(r.id, rowLabel(t, r), fmtVal(r.unit, V[r.id])); });
  if(V.day) add('day', 'Aircraft a day', money(V.day)); if(V.fuelL) add('fuelL', 'Fuel a day', num(V.fuelL) + ' L');
  return tiles.sort((a, b) => a.label.localeCompare(b.label)); }
function bvBuildCheck(t, col, row, B){
  const seq = bvSeq(t, col, row), tiles = bvTiles(t, col, row), key = paperCellKey(t, col, row), J = bvJudge(B.tokens, seq, tiles, rowLabel(t, row));
  if(J.wait){ UI.msg = J.msg; render(); return; }
  const I = recCellIdentity(t, col, row), e = recOpen(key, Object.assign({}, I.o, { type:'build', level:'Build', method:'choose the figures and the operation' }));
  const chips = B.tokens.map(k => BV_OPS.includes(k) ? { op:k } : (f => f ? { label:f.label, text:f.text, k } : { label:k })(tiles.find(f => f.k === k)));
  if(J.ok){ recAttempt(e, { ok:true, chips, method:'choose the figures and the operation' }); B.built = true; t.chosen[cellId(col.id, row.id)] = true; UI.msg = ''; soLog(`${PAPER_DOC(t, row)} (Build)`); render(); return; }
  recAttempt(e, { ok:false, chips, msg:J.msg, note:J.msg, method:'choose the figures and the operation' }); B.tries++;
  if(B.tries >= 2 && twoTriesOn()){ paperRecShown(key); B.tokens = seq.slice(); B.built = true; B.shown = true; t.chosen[cellId(col.id, row.id)] = true; UI.msg = 'Finance has built this one for you: now work it out in your book.'; render(); return; }
  UI.msg = `Query: ${J.msg} One more try.`; B.tokens = []; render(); }
const bvDock0 = sumDockHtmlPlanner;
sumDockHtmlPlanner = function(o){
  if(!paperOn()) return bvDock0(o);
  const { W, st } = o, Z = sumState(W, st); if(Z.tut || !(Z.act || Z.justDone)) return bvDock0(o);
  let title = '', body = '';
  if(Z.justDone){
    const jt = Z.justDone, [cid, rid] = UI.justDone.cell.split('|'), jc = jt.cols.find(c => c.id === cid), jr = tRows(jt).find(r => r.id === rid), key = paperCellKey(jt, jc, jr), shown = paperShown(jt, UI.justDone.cell), n = sumNo(key), ops = stackRows(jt, jc, jr), v = fmtVal(jr.unit, jc.values[rid]);
    title = TOOL[jr.tool] ? TOOL[jr.tool].name : rowLabel(jt, jr);
    const more = wkNext(W.tables), arrive = UI.bvArrived !== key;
    body = `<div class="wk-sum paper bv-cb bv-s3">${bvSumLine(key, PAPER_DOC(jt, jr))}<p class="bv-built"><span class="bv-big">${bvBig(ops, jr.op || '×')} = <b class="bv-got ${arrive ? 'arrive' : ''}">${v}</b></span>${shown ? FIN_STAMP : ''}</p>
      <p class="bv-doneline">&#10003; ${esc(rowLabel(jt, jr))} <b>${v}</b> added to the sheet · <span class="bv-sumtag">Sum ${n}</span> in your record</p>
      ${shown ? `<p class="pq-fin">Finance has filled this one in. Copy ${v} into your book beside your working.</p>` : ''}
      <div class="wk-act"><button class="bv-btn primary big" id="wkNext">${more ? 'Next sum' : Z.multi && !Z.picked ? 'Choose' : 'Finished'} &#9654;</button></div></div>`;
  } else {
    const { act, col, row } = Z, key = paperCellKey(act, col, row), n = sumNo(key), ops = stackRows(act, col, row), B = bvState(key), same = bvSame(act, col, row), lhs = rowLabel(act, row), op0 = row.op || '×';
    try{ recSeen(key); }catch(e){}
    title = TOOL[row.tool] ? TOOL[row.tool].name : lhs;
    if(!B.built && !same){ const tiles = bvTiles(act, col, row);
      body = `<div class="wk-sum paper bv-cb">${bvSumLine(key, PAPER_DOC(act, row))}${bvBuildStepHtml({ lhs, tiles, tokens:B.tokens, need:bvSeq(act, col, row).length, fig:'data-pbfig', op:'data-pbop', undo:'pbUndo', chk:'pbChk', msg:UI.msg, msgId:'ftMsg' })}</div>`; }
    else { const formula = `${esc(lhs)} = ${ops.map((x, i) => `${i ? esc(x.op || op0) + ' ' : ''}<i class="bv-ab">${BV_AB[i]}</i>${esc(x.label)}`).join(' ')}`;
      body = `<div class="wk-sum paper bv-cb">${bvSumLine(key, PAPER_DOC(act, row))}${bvTypeStepHtml({ formula, big:bvBig(ops, op0, same), same:same ? `the same sum for the ${esc(col.label)} column: A and B are in the sheet` : '', change:'bvChange', n, unit:row.unit === '£' ? '£' : '', ans:'cellAns', chk:'cellCheck', entry:UI.entry, aria:lhs, msg:UI.msg, ok:UI.ok, msgId:'ftMsg',
        extra:paperRefHtml(row.tool || (/^tk/.test(row.id) ? 'revenue' : row.id), ops[1] ? ops[1].op || op0 : op0, row.unit === '£' && /ppl/.test(operandUnit(act, (ops[1] || {}).id) || '')) })}</div>`; }
  }
  return `<aside class="dock dock-sum pale bv" data-dock="sum" aria-label="Work it out"><div class="dk-h"><span class="dk-tt"><span class="dk-kind">Work it out</span><b class="dk-t">${esc(title)}</b></span><span class="sd-prog">${Z.k} of ${Z.n} today</span></div><div class="dk-b">${body}</div></aside>`;
};
const bvBind0 = bindSumDock;
bindSumDock = function(W, st){
  bvBind0(W, st); if(!paperOn()) return;
  const Z = sumState(W, st); if(!(Z.act && !Z.justDone && !Z.tut)) return;
  const t = Z.act, col = Z.col, row = Z.row, B = bvState(paperCellKey(t, col, row)), root = screen();
  if(B.built || bvSame(t, col, row)){ on('bvChange', () => { B.built = false; B.shown = false; B.tokens = []; UI.msg = ''; render(); }); return; }
  root.querySelectorAll('[data-pbfig]').forEach(b => b.onclick = () => { if(B.tokens.length % 2 === 1){ UI.msg = 'Next, an operation between the figures.'; render(); return; } B.tokens.push(b.getAttribute('data-pbfig')); UI.msg = ''; render(); });
  root.querySelectorAll('[data-pbop]').forEach(b => b.onclick = () => { if(B.tokens.length % 2 === 0){ UI.msg = B.tokens.length ? 'Next, a figure.' : 'Start with a figure.'; render(); return; } B.tokens.push(b.getAttribute('data-pbop')); UI.msg = ''; render(); });
  on('pbUndo', () => { B.tokens.pop(); UI.msg = ''; render(); });
  on('pbChk', () => bvBuildCheck(t, col, row, B));
};
/* the test kit's plan for the sum on screen: the whole sequence, for sums of any length */
paperPlan = function(){ const t = currentTable(), a = t && t.active; if(!a) return null; const col = t.cols.find(c => c.id === a.col), row = tRows(t).find(r => r.id === a.row); if(!col || !row) return null;
  return { cell:t.id + ':' + a.col + '|' + a.row, build:!!(row.tool && toolLevel(row.tool) === 'build'), seq:bvSeq(t, col, row), answer:col.values[row.id] }; };
/* the page: the centred column, the sheet's figures for the sum (A, B, in cyan), the cell being filled (magenta ?), the cells
   filled (green, with their Sum n), the gold SUM n in the panel's header */
function bvSheetMark(){
  if(!paperOn() || step().t !== 'workings') return; const root = screen(), ws = root.querySelector('.ws.ws-workings'); if(!ws) return; ws.classList.add('bv', 'bv-wio');
  const t = currentTable(), sheet = root.querySelector('.sheet1.now'), a = t && t.active, col = a && t.cols.find(c => c.id === a.col), row = a && tRows(t).find(r => r.id === a.row);
  if(sheet && t) sheet.querySelectorAll('td.c.done[data-cellv]').forEach(td => { const [cid, rid] = td.getAttribute('data-cellv').split('|'), c = t.cols.find(x => x.id === cid), r = tRows(t).find(x => x.id === rid); if(!c || !r || td.querySelector('.bv-ctag')) return;
    const k = sumNoS().keys[sumNoKey(paperCellKey(t, c, r))]; if(k) td.insertAdjacentHTML('beforeend', `<i class="bv-ctag">Sum ${k}</i>`); });
  const mark = (c, ops, letters) => ops.forEach((x, i) => { const td = sheet.querySelector(`td[data-cellv="${c.id}|${x.id}"]`); if(!td || !letters[i]) return; td.classList.add('bv-opd'); td.insertAdjacentHTML('afterbegin', `<i class="bv-tag">${letters[i]}</i>`); });
  const hdTag = n => { const sw = root.querySelector('.sh-work .sh-h'), b = sw && sw.querySelector('b'); if(b && n && !sw.querySelector('.bv-sumtag')) b.insertAdjacentHTML('afterend', `<span class="bv-sumtag">Sum ${n}</span>`); };
  if(sheet) sheet.querySelectorAll('td.opd').forEach(td => td.classList.remove('opd'));
  const jdOn = UI.justDone && t && UI.justDone.table === t.id && sheet;
  if(jdOn){ const [cid, rid] = UI.justDone.cell.split('|'), jc = t.cols.find(c => c.id === cid), jr = tRows(t).find(r => r.id === rid), jd = sheet.querySelector(`td.c.done[data-cellv="${UI.justDone.cell}"]`);
    if(jc && jr){ const key = paperCellKey(t, jc, jr); mark(jc, stackRows(t, jc, jr), BV_AB); hdTag(sumNoS().keys[sumNoKey(key)]);
      if(jd){ jd.classList.add('bv-filled'); if(UI.bvArrived !== key){ jd.classList.add('arrive'); UI.bvArrived = key; } } }
    const nx = sheet.querySelector('td.enter.on'); if(nx) nx.classList.add('bv-wait'); }
  else if(sheet && col && row){ const key = paperCellKey(t, col, row), B = bvState(key), ops = stackRows(t, col, row), building = !B.built && !bvSame(t, col, row);
    const chosen = B.tokens.filter((y, j) => j % 2 === 0); mark(col, ops, building ? ops.map(x => chosen.indexOf(x.id) < 0 ? null : BV_AB[chosen.indexOf(x.id)]) : BV_AB);
    const cell = sheet.querySelector('td.enter.on'); if(cell){ cell.classList.add('bv-target'); const bt = cell.querySelector('button'); if(bt && (!bt.textContent.trim() || /Completing/.test(bt.textContent))) bt.textContent = '?'; }
    hdTag(sumNo(key)); }
  const hint = root.querySelector('.actbar .ab-hint'); if(hint && /Type each answer into the sheet\./.test(hint.innerHTML)) hint.innerHTML = hint.innerHTML.replace('Type each answer into the sheet.', 'Build each sum, then type the answer from your book.');
  const ans = root.querySelector('.sh-work #cellAns'); if(ans) setTimeout(() => { try{ if(document.activeElement !== ans && !document.querySelector('.overlay:not([hidden]), #bfLayer')) ans.focus(); }catch(e){} }, 40);
}
const bvRender0 = render;
render = function(){ const r = bvRender0.apply(this, arguments); try{ bvSheetMark(); }catch(e){ console.error(e); } return r; };

/* ---------- 1. the Studio: the selected flight's panel keeps two rows; the worth sum is a callout pinned to the flight ----------
   The panel (under the timetable, never moving): the flight's row of controls, and a Change row with the fare as a − / +
   stepper, "was £90" after a change, and the seats filled at each fare. A change that needs its worth sum opens the Worth Sum
   Callout above the flight that changed (about 440px, a pointer down to it, the flight outlined): what the change does,
   before → after, with the day's tickets as the unknown; the sum follows the Week 1 flow (build, book and type, done). Done,
   another flight or a click elsewhere closes it. After the first sum of each kind, a change opens the callout already done.
   Every kind uses one sum: the day's tickets after the change, passengers × fare. */
function bvFareRow(pl, L, id){
  const r = routeById(id), F = r.fares || [r.basePrice], fare = pl.prices[id] || r.basePrice, i = F.indexOf(fare), B = UI.s3Base, was = B && B.routes[id] && B.routes[id].fare !== fare ? B.routes[id].fare : null;
  const seats = s2Fill(s2Svc(L, id)).seats, cur = (L.routes || []).find(z => z.id === id) || {};
  const fill = f => { if(f === fare) return cur.pax || 0; const a = dsAlt(pl, n => { n.prices[id] = f; }); const z = a && planLines(a.pl).routes.find(x => x.id === id); return z ? z.pax : null; };
  return `<span class="bv-chgl bv-eyebrow">Change</span><span class="bv-fare" role="group" aria-label="${esc(r.city)} fare"><button class="bv-fs" data-bvfare="${id}|-1" aria-label="Lower the fare" ${i <= 0 ? 'disabled' : ''}>&minus;</button><b class="bv-fv bv-money">${money(fare)}</b><button class="bv-fs" data-bvfare="${id}|1" aria-label="Raise the fare" ${i < 0 || i >= F.length - 1 ? 'disabled' : ''}>+</button></span>${was !== null ? `<small class="bv-was">was ${money(was)}</small>` : ''}
    <span class="bv-seats"><small>Seats filled at each fare</small>${F.map(f => { const v = fill(f); return v === null ? '' : `<button class="bv-sf ${f === fare ? 'on' : ''} fill-${fillCls(v, seats)}" data-bvfareto="${id}|${f}" aria-pressed="${f === fare}">${money(f)}<b>${num(v)}/${num(seats)}</b></button>`; }).join('')}</span>`; }
const bvSvc0 = s2SvcEditor;
s2SvcEditor = function(pl, L, sel){
  const x = pl.fleet[sel.j], p = planeById(x.planeId), id0 = x.sched[sel.k]; if(!id0) return '';
  const dps = x.deps && x.deps.length === x.sched.length ? x.deps : actualDeps(pl, sel.j), r = routeById(id0), dep = dps[sel.k], arr = dep + TIME.roundTrip(p, r), dy = daysFix(x.days, x.sched.length)[sel.k];
  const s = (L.services || []).find(z => z.uid === x.uid && z.k === sel.k) || {}, a = `0|${sel.j}|${sel.k}`;
  const routes = plannerOrder().filter(id => planeCanFly(p, routeById(id))), planes = pl.fleet.map((y, q) => ({ y, q })).filter(({ y, q }) => q !== sel.j && planeCanFly(planeById(y.planeId), r));
  const key = `${sel.j}|${sel.k}|${x.uid}`; if(!UI.s3Base || UI.s3Base.sel !== key){ UI.s3Base = { sel:key, j:sel.j, k0:sel.k, key:planKey(pl), routes:Object.fromEntries((L.routes || []).map(z => [z.id, { pax:z.pax, fare:pl.prices[z.id] || routeById(z.id).basePrice }])) }; }
  return `<div class="s2-pop s3-insp bv-insp" id="s2Pop" role="group" aria-label="The ${esc(r.city)} ${fmtTime(dep)} flight">
    <div class="s3-ir1"><span class="s3-id">${flagSvg(r.flag, 16)}<b>${esc(r.city)}</b><span class="mono">${fmtTime(dep)}–${fmtTime(arr)}</span><span class="mono">${num(s.sold || 0)}/${num(s.seats || p.seats)}</span><span>${esc(shortPlane(p))}</span></span>
      <span class="s2-pop-b s3-ctl"><button class="btn small" data-insm="${a}|-5" title="5 minutes earlier (hold to keep moving)">&#9664; Earlier</button><button class="btn small" data-insm="${a}|5" title="5 minutes later (hold to keep moving)">Later &#9654;</button>
        <select data-s2rt="${sel.j}|${sel.k}" aria-label="Route" title="Route">${routes.map(id => `<option value="${id}" ${id === r.id ? 'selected' : ''}>${esc(routeById(id).city)}</option>`).join('')}</select>
        ${S2V.fd ? `<select data-s2dy="${sel.j}|${sel.k}" aria-label="Days" title="Which days this flight flies">${DAYS_KEYS.map(v => `<option value="${v}" ${v === dy ? 'selected' : ''}>${daysLabel(v)}</option>`).join('')}</select>` : ''}
        <select data-s2ac="${sel.j}|${sel.k}" aria-label="Aircraft" title="Aircraft" ${planes.length ? '' : 'disabled'}><option value="">${esc(shortPlane(p))} · ${esc(regOf(x.uid))}</option>${planes.map(({ y, q }) => `<option value="${q}">${esc(shortPlane(planeById(y.planeId)))} · ${esc(regOf(y.uid))}</option>`).join('')}</select>
        <button class="btn small sc-open" data-svccard="${a}" title="This flight's fuel, costs and profit">Service costs</button><button class="btn small danger" data-tlrm="${a}" title="Remove (or press Delete)">Remove</button></span>
      <button class="dk-x s3-x" id="s2PopX" aria-label="Deselect (Esc)">&times;</button></div>
    <div class="s3-ir2 bv-chg">${bvFareRow(pl, L, r.id)}</div></div>`;
};
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-bvfare], [data-bvfareto]'); if(!b || b.disabled) return; e.stopPropagation();
  if(b.hasAttribute('data-bvfareto')){ const [id, f] = b.getAttribute('data-bvfareto').split('|'); editPlan(0, 'fareTo', id, +f); return; }
  const [id, d] = b.getAttribute('data-bvfare').split('|'), r = routeById(id), F = r.fares || [r.basePrice], i = F.indexOf(currentPlan().prices[id] || r.basePrice), f = F[i + +d]; if(f !== undefined) editPlan(0, 'fareTo', id, f); }, true);

/* the worth of a change: before and after, and the one sum (the day's tickets on the route after the change) */
const bvWorth0 = dsWorth;
dsWorth = function(a, b, La, Lb){
  const W = bvWorth0.apply(this, arguments); if(!W) return W;
  try{ const id = W.route, r = routeById(id), ra = (La.routes || []).find(x => x.id === id) || { pax:0, fare:(a.prices || {})[id] || r.basePrice }, rb = (Lb.routes || []).find(x => x.id === id) || { pax:0, fare:(b.prices || {})[id] || r.basePrice };
    const n0 = ra.pax || 0, n1 = rb.pax || 0, f0 = ra.fare || (a.prices || {})[id] || r.basePrice, f1 = rb.fare || (b.prices || {})[id] || r.basePrice, t0 = n0 * f0, t1 = n1 * f1;
    const cnt = pl => pl.fleet.reduce((t, x) => t + x.sched.filter(z => z === id).length, 0), c0 = cnt(a), c1 = cnt(b), rows = [];
    if(W.kind === 'fare') rows.push(['Fare', money(f0), money(f1), true]);
    if(W.kind === 'service') rows.push(['Flights a day', num(c0), num(c1)]);
    rows.push(['Passengers a day', num(n0), num(n1)]);
    const tiles = [{ k:'pax', label:'Passengers after', text:num(n1) }, { k:'fare', label:W.kind === 'fare' ? 'Fare after' : 'Fare', text:money(f1) }];
    [[ 'pax0', 'Passengers before', num(n0) ], [ 'fare0', 'Fare before', money(f0) ], [ 'flights', 'Flights a day', num(c1) ], [ 'tk0', 'Tickets before', money(t0) ]].forEach(([k, l, t]) => { if(tiles.length < 4 && !tiles.some(x => x.text === t)) tiles.push({ k, label:l, text:t, dis:true }); });
    W.ba = { city:r.city, rows, t0, t1, diff:t1 - t0, n0, n1, f0, f1, c0, c1, s0:s2Fill(s2Svc(La, id)).seats };
    W.tiles = tiles.sort((x, y) => x.label.localeCompare(y.label)); W.seq = ['pax', '×', 'fare']; W.answer = t1;
    W.cb = { tokens:[], tries:0, built:false, shown:false, typed:0 };
    if(W.kind !== 'service' || c1 > c0) W.per = W.per !== undefined ? W.per : f1;   // every kind but a flight taken off has its sum now
  }catch(e){ console.error(e); }
  return W;
};
/* the old strip above the plan summary gives way to the callout (its labels are not set for every kind now) */
const bvWbh0 = dsWorthBuildHtml;
dsWorthBuildHtml = function(W){ return W && W.ba ? '' : bvWbh0.apply(this, arguments); };
/* what the change means, in one line (Bertie: "£100 with one empty seat earns more than £90 full") */
function bvMeaning(W){ const B = W.ba; if(!B) return ''; const k = Math.abs(B.n1 - B.n0), seats = (n, w) => `${n === 1 ? 'one' : num(n)} ${n === 1 ? w : w + 's'}`;
  if(W.kind === 'fare'){ const up = B.f1 > B.f0, m1 = money(B.f1), m0 = money(B.f0);
    if(B.n1 === B.n0) return up ? `The same ${num(B.n1)} passengers, each paying ${money(B.f1 - B.f0)} more.` : `The same ${num(B.n1)} passengers, each paying ${money(B.f0 - B.f1)} less: the lower fare brought no one new.`;
    if(up) return B.diff > 0 ? `${m1} with ${seats(k, 'empty seat')} earns more than ${m0}${B.n0 >= B.s0 ? ' full' : ''}.` : `${m0} earned more: the ${seats(k, 'passenger')} lost cost more than the higher fare brings in.`;
    return B.diff > 0 ? `${m1} earns more: the ${seats(k, 'extra passenger')} more than make up for the lower fare.` : `${m0} earned more: the ${seats(k, 'extra passenger')} don't make up for the lower fare.`; }
  if(W.kind === 'service' && B.c1 > B.c0){ const net = Math.round(W.value || 0), cost = Math.round(W.cost || 0); return net >= 0 ? `The extra flight costs ${money(cost)} a day to fly, so it adds ${money(net)} a day after its costs.` : `The extra flight costs ${money(cost)} a day to fly: more than the ${money(Math.max(0, B.diff))} it brings in.`; }
  if(W.kind === 'service') return `One flight fewer: ${money(Math.abs(Math.round(W.cost || 0)))} a day in costs saved, ${money(Math.abs(B.diff))} less in tickets.`;
  return B.n1 >= B.n0 ? `${seats(k, 'more passenger')} at the new time: ${money(Math.abs(B.diff))} more a day.` : `${seats(k, 'passenger')} fewer at the new time: ${money(Math.abs(B.diff))} less a day.`; }
const BV_WHAT = { 'fare rise':'fare rise', 'fare cut':'fare cut', 'extra flight':'extra flight', 'flight taken off':'flight taken off', 'new time':'new time' };
function bvWscKey(W){ return 'worth:' + W.kind + ':' + S.day; }
function bvWscHtml(W){
  const B = W.ba, cb = W.cb, done = W.done, n = paperOn() ? sumNo(bvWscKey(W)) : 0, head = `${B.city} ${BV_WHAT[W.what] || W.what}: what it does`, tickets = `${B.city} tickets a day`;
  const sign = B.diff > 0 ? '+' : B.diff < 0 ? '−' : '±', diff = `(${sign}${money(Math.abs(B.diff))} a day)`, arrive = done && W.justDone;
  const rows = B.rows.map(([l, x, y, m]) => `<tr><th>${esc(l)}</th><td class="${m ? 'bv-money' : ''}">${x}</td><td class="ar">&rarr;</td><td class="${m ? 'bv-money' : ''}">${y}</td></tr>`).join('')
    + `<tr class="bv-k"><th>${esc(tickets)}</th><td class="bv-money">${money(B.t0)}</td><td class="ar">&rarr;</td><td>${done ? `<b class="bv-got ${arrive ? 'arrive' : ''}">${money(B.t1)}</b> <span class="bv-diff">${diff}</span>` : '<span class="bv-unknown">?</span>'}</td></tr>`;
  let body = '';
  const ops = [{ value:num(B.n1) }, { value:money(B.f1), op:'×' }];
  if(done) body = `<p class="bv-mean">${esc(bvMeaning(W))}</p>${cb.shown ? `<p class="pq-fin">Finance has worked this one out. Copy ${money(B.t1)} into your book beside your working.</p>` : ''}<div class="bv-wsc-act"><button class="bv-btn primary" id="wsDone">Done</button></div>`;
  else if(!cb.built) body = bvBuildStepHtml({ lhs:tickets, tiles:W.tiles, tokens:cb.tokens, need:3, fig:'data-wsf', op:'data-wso', undo:'wsUndo', chk:'wsChk', msg:W.msg, msgId:'wsMsg' });
  else body = bvTypeStepHtml({ big:bvBig(ops, '×'), change:'wsChange', n:n || '', unit:'£', ans:'wsAns', chk:'wsCheck', entry:cb.entry, aria:tickets, msg:W.msg, msgId:'wsMsg' });
  return `<div class="bv bv-wsc ${done ? 'done' : 'wait'} ${arrive ? 'arrive' : ''}" id="bvWsc" role="group" aria-label="${esc(head)}"><div class="bv-wsc-h"><span class="bv-eyebrow">${esc(head)}</span>${n ? `<span class="bv-sumtag">Sum ${n}</span>` : ''}<button class="bv-x" id="wsX" aria-label="Close">&times;</button></div>
    <table class="bv-ba"><tbody>${rows}</tbody></table>${body}<i class="bv-ptr"></i></div>`; }
/* the callout's sum: build it (two tries), then type the day's tickets (two tries); both go to the record under one Sum n */
function bvWscBuild(W){ const cb = W.cb, J = bvJudge(cb.tokens, W.seq, W.tiles, `${W.ba.city} tickets a day`), key = bvWscKey(W);
  if(J.wait){ W.msg = J.msg; render(); return; }
  const doc = `What it does: the ${W.ba.city} ${W.what}`, chips = cb.tokens.map(k => BV_OPS.includes(k) ? { op:k } : (f => f ? { label:f.label, text:f.text, k } : { label:k })(W.tiles.find(f => f.k === k)));
  let e = null; try{ e = recOpen(key, { type:'build', relKey:'worth', doc, ask:`What do ${W.ba.city} tickets bring in a day after the change?`, question:'passengers a day × fare', unit:'£', correct:W.answer, correctText:money(W.answer), ops:[W.ba.n1, W.ba.f1], op:'×', level:'Build' }); }catch(x){}
  if(J.ok){ try{ recAttempt(e, { ok:true, chips, method:'choose the figures and the operation' }); }catch(x){} cb.built = true; W.msg = ''; render(); return; }
  try{ recAttempt(e, { ok:false, chips, msg:J.msg, note:J.msg, method:'choose the figures and the operation' }); }catch(x){} cb.tries++;
  if(cb.tries >= 2 && twoTriesOn()){ try{ paperRecShown(key); }catch(x){} cb.tokens = W.seq.slice(); cb.built = true; cb.shown = true; W.msg = 'Finance has built this one: now work it out in your book.'; render(); return; }
  W.msg = `Query: ${J.msg} One more try.`; cb.tokens = []; render(); }
function bvWscType(W){ const cb = W.cb, el = $('wsAns'), raw = el ? el.value : '', v = parseCell('£', raw), key = bvWscKey(W);
  if(v === null){ W.msg = raw.trim() ? 'Query: that is not a figure. One more try.' : 'Type the answer from your book.'; cb.entry = raw; render(); return; }
  let e = null; try{ e = recOpen(key, { type:'calc', relKey:'worth', doc:`What it does: the ${W.ba.city} ${W.what}`, ask:`What do ${W.ba.city} tickets bring in a day after the change?`, question:`${num(W.ba.n1)} × ${money(W.ba.f1)}`, unit:'£', correct:W.answer, correctText:money(W.answer), ops:[W.ba.n1, W.ba.f1], op:'×', level:'Calculate' }); }catch(x){}
  const ok = Math.abs(v - W.answer) < 0.005;
  try{ recAttempt(e, { ok, given:raw.trim(), value:v, method:'worked on paper, answer typed' }); }catch(x){}
  if(ok || (++cb.typed >= 2 && twoTriesOn())){ if(!ok){ cb.shown = true; try{ paperRecShown(key); }catch(x){} }
    dsS().built[W.kind] = S.day; W.done = true; W.justDone = true; W.msg = ''; dsWorthKeep(W); if(typeof soLog === 'function') soLog(`What it does: ${W.kind} (Build, then the sum)`); render(); return; }
  W.msg = `Query: ${paperWrongNote(v, W.answer, '£', '×', [W.ba.n1, W.ba.f1])} One more try.`; cb.entry = raw; render(); }
/* where the callout goes: above the flight that changed (the one selected, else the route's first flight), in the canvas */
function bvWscAnchor(root, W){ const pl = currentPlan(), sel = UI.tlSel; let blk = null;
  if(sel && pl.fleet[sel.j] && pl.fleet[sel.j].sched[sel.k] === W.route) blk = root.querySelector(`.s2-tt .ad-blk[data-tl="${sel.i || 0}|${sel.j}|${sel.k}"]`) || root.querySelector('.s2-tt .ad-blk.on');
  if(!blk) blk = [...root.querySelectorAll('.s2-tt .ad-blk[data-tl]')].find(b => { const [, j, k] = b.getAttribute('data-tl').split('|').map(Number); return pl.fleet[j] && pl.fleet[j].sched[k] === W.route; }) || null;
  return blk; }
function bvWscShow(){
  const root = screen(), old = document.getElementById('bvWsc'); if(old) old.remove();
  const W = UI.dsWorth; if(!W || !W.ba || W.closed || !dsPlanPage() || W.dayKey !== (UI.s2 && UI.s2.key) || (UI.stView || 'day') !== 'day') return;
  root.querySelectorAll('.ds-wstrip, .ds-flash').forEach(x => x.remove());
  const blk = bvWscAnchor(root, W), ctl = document.getElementById('control'); if(!ctl) return;
  root.insertAdjacentHTML('beforeend', bvWscHtml(W)); const C = document.getElementById('bvWsc'), cr = ctl.getBoundingClientRect(), sc = cr.width / Math.max(1, ctl.offsetWidth) || 1;
  if(blk){ blk.classList.add('bv-anchor'); const b = blk.getBoundingClientRect(), w = C.offsetWidth, h = C.offsetHeight, bx = (b.left - cr.left) / sc, by = (b.top - cr.top) / sc, bw = b.width / sc;
    const left = clamp(bx + bw / 2 - w / 2, 12, ctl.offsetWidth - w - 12), up = by - h - 14 >= 100, top = up ? by - h - 14 : by + b.height / sc + 14;
    C.style.left = left + 'px'; C.style.top = top + 'px'; C.querySelector('.bv-ptr').style.left = clamp(bx + bw / 2 - left, 18, w - 18) + 'px';
    if(!up) C.classList.add('below'); }
  else { const sum = root.querySelector('.s2-sum'); if(sum){ const s = sum.getBoundingClientRect(); C.style.left = Math.max(12, (s.left - cr.left) / sc + 12) + 'px'; C.style.top = Math.max(100, (s.top - cr.top) / sc - C.offsetHeight - 10) + 'px'; } C.classList.add('nopt'); }
  // the sum's buttons
  const cb = W.cb;
  C.querySelectorAll('[data-wsf]').forEach(b => b.onclick = e => { e.stopPropagation(); if(cb.tokens.length % 2 === 1){ W.msg = 'Next, an operation between the figures.'; render(); return; } cb.tokens.push(b.getAttribute('data-wsf')); W.msg = ''; render(); });
  C.querySelectorAll('[data-wso]').forEach(b => b.onclick = e => { e.stopPropagation(); if(cb.tokens.length % 2 === 0){ W.msg = cb.tokens.length ? 'Next, a figure.' : 'Start with a figure.'; render(); return; } cb.tokens.push(b.getAttribute('data-wso')); W.msg = ''; render(); });
  on('wsUndo', () => { cb.tokens.pop(); W.msg = ''; render(); }); on('wsChk', () => bvWscBuild(W)); on('wsChange', () => { cb.built = false; cb.tokens = []; W.msg = ''; render(); });
  on('wsCheck', () => bvWscType(W)); const ans = $('wsAns'); if(ans){ ans.oninput = () => { cb.entry = ans.value; }; ans.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); bvWscType(W); } }; setTimeout(() => { try{ if(document.activeElement !== ans) ans.focus(); }catch(x){} }, 30); }
  const close = () => { W.closed = true; render(); }; on('wsX', close); on('wsDone', close);
  // the plan summary's figure lights once when the sum is done
  if(W.justDone){ W.justDone = false; const si = [...root.querySelectorAll('.s2-sum .s2-si')].find(x => /Projected profit/.test(x.textContent)); if(si) (si.querySelector('b') || si).classList.add('bv-lit'); }
}
/* the callout closes on another flight, or a click anywhere outside it and the flight's panel */
document.addEventListener('pointerdown', e => { const C = document.getElementById('bvWsc'), W = UI.dsWorth; if(!C || !W || W.closed) return; const t = e.target;
  if(C.contains(t) || (t.closest && t.closest('#s2Pop, .s2-ed, .s2-sum, .ds-chips, [data-bvfare], [data-bvfareto]'))) return;
  const blk = t.closest && t.closest('.ad-blk'); if(blk && blk.classList.contains('bv-anchor')) return;
  W.closed = true; C.remove(); document.querySelectorAll('.bv-anchor').forEach(x => x.classList.remove('bv-anchor')); }, true);
document.addEventListener('keydown', e => { if(e.key !== 'Escape') return; const W = UI.dsWorth, C = document.getElementById('bvWsc'); if(!W || !C || W.closed) return; W.closed = true; C.remove(); e.stopPropagation(); }, true);
const bvStudioR0 = render;
render = function(){ const r = bvStudioR0.apply(this, arguments); try{ if(step() && step().t === 'plan') bvWscShow(); }catch(e){ console.error(e); } return r; };
