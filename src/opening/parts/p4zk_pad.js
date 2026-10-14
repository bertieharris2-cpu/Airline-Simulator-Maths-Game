/* ==================================================================
   THE WORKING PAD (Bertie, 13 Oct 2026): "what if I need to do workings for the multiplication? Can you have a button
   where a popup comes out for the working?" and "I have no working space to do this, so I had to resort to a calculator.
   This needs to be resolved throughout the game."
   - A Working button sits beside every typed answer the pad can set out: × (the fuel desk's first order, the sign-off
     cards, the estimate, the Service Cost card's lines), + (the card's "Add the lines"), ÷ (rent or buy, flight time, time
     to afford) and − (still to save).
   - A Working button in the top bar opens a free pad on any screen: type two numbers, choose × ÷ + or −, set it out.
   - × is the column method, typed right to left, a carry strip above each line and a line for each part of the smaller
     number; a decimal is made whole first ("1.47 × 100 = 147 (2 decimal places)", × 10, 100 or 1,000), then divided back. ÷ is the bus stop (Bertie's choice): the
     divisor outside, a box for each answer digit, a small box for each remainder carried, decimal places after the
     point, a list of the divisor's multiples to fill in, and "Make it smaller" when both numbers end in 0. − is column
     subtraction with an exchange strip. + is column addition.
   - The pad marks nothing. Use this answer copies the answer into the box and the box's own Check decides; what was on the
     pad goes into the pupil record. The free pad has no box: it is only for working.
   ================================================================== */
UI.padCells = UI.padCells || {};
const PAD_SEL = ['[data-fds]', '[data-soin]', '[data-sopre]', '[data-sc]', '#rbIn', '[data-pad]'];
const PAD_SPECS = [];   // other parts add (input) => spec | null
const padNum = v => { const s = String(v === undefined || v === null ? '' : v).replace(/[£,\s]/g, '').replace(/p$/i, ''); if(s === '' || isNaN(+s)) return null; return +s; };
/* the sum a box asks for, or null */
function padSpecFor(inp){
  try{
    for(const f of PAD_SPECS){ const s = f(inp); if(s) return s; }
    if(inp.matches('[data-fds]')){ const k = inp.getAttribute('data-fds'), P0 = fuelOn(S.day || 1), blk = fuelBlock(), one = r2(blk * P0);
      if(k === 'one') return { op:'×', a:blk, b:P0, money:true, lab:`${num(blk)} L × ${priceL(P0)}`, sel:'[data-fds="one"]' };
      if(k === 'all'){ const n = UI.fd.selNow || 0; return n > 1 ? { op:'×', a:n, b:one, money:true, lab:`${n} × ${twoDp(one)}`, sel:'[data-fds="all"]' } : null; } }
    if(inp.matches('[data-soin]')){ const key = inp.getAttribute('data-soin'), it = soItem(key), sp = it && soSpec(it); if(!sp) return null;
      if(sp.op === '÷') return { op:'÷', a:sp.a.v, b:sp.b.v, lab:`${num(sp.a.v)} ÷ ${num(sp.b.v)}`, sel:`[data-soin="${key}"]` };
      if(sp.op !== '×') return null;
      const money = /^£|ppl/.test(sp.a.f + sp.b.f) || /^£/.test(sp.res);
      return { op:'×', a:sp.a.v, b:sp.b.v, money, lab:`${soFmt(sp.a.f, sp.a.v)} × ${soFmt(sp.b.f, sp.b.v)}`, sel:`[data-soin="${key}"]` }; }
    if(inp.matches('[data-sopre]')){ const key = inp.getAttribute('data-sopre'), it = soItem(key), sp = it && soSpec(it); if(!sp || !sp.pre || !sp.pre.est || !sp.pre.a) return null;
      return { op:'×', a:sp.pre.a, b:sp.pre.b, money:true, lab:sp.pre.lab, sel:`[data-sopre="${key}"]` }; }
    if(inp.matches('[data-sc]')){ const k = inp.getAttribute('data-sc'), F = UI.sc.F; if(!F || !/^r\d+$/.test(k)) return null; const R = scRows(UI.sc.mUsed || 'whole', F), x = R.rows[+k.slice(1)]; if(!x) return null;
      if(x.whole){ if(!(UI.sc.right || {})['r' + R.rows.findIndex(z => z.step === 1)]) return null;   // step 1 first: the pad would show its answer
        return { op:'×', a:F.L, b:F.P, money:false, lab:`${num(F.L)} × ${num(F.P)}`, sel:`[data-sc="${k}"]` }; }   // make it whole: one long multiplication
      if(x.part) return { op:'×', a:F.L, b:x.part.v, money:false, unit:'p', lab:`${num(F.L)} × ${num(x.part.v)}p`, sel:`[data-sc="${k}"]` };
      if(x.add) return { op:'+', lines:R.rows.filter(z => z.part).map(z => z.want), money:false, unit:'p', lab:'Add the lines', sel:`[data-sc="${k}"]` };
      return null; }
    if(inp.id === 'rbIn'){ const pid = (S.rnd.acChoice && S.rnd.acChoice.pid) || S.rnd.shopPick, o = pid && planeById(pid) && shopOffer(planeById(pid)); if(!o || !o.lease || !o.price) return null;
      return { op:'÷', a:o.price, b:o.lease, lab:`${num(o.price)} ÷ ${num(o.lease)}`, sel:'#rbIn', unit:'days' }; }
  }catch(e){}
  return null;
}

/* ---------- the layouts ---------- */
function padKey(sp){ return (sp.sel || 'free') + '|' + sp.op + '|' + (sp.lab || ''); }
function padCellsOf(key){ return UI.padCells[key] || (UI.padCells[key] = {}); }
const padDec = v => Math.abs(Math.round(v * 100) % 100) !== 0;
function padModel(sp){
  if(sp.op === '+'){ const ans = sp.lines.reduce((t, v) => t + v, 0); return { op:'+', top:sp.lines, parts:[], ans, pence:false, W:Math.max(...sp.lines.map(v => String(v).length), String(ans).length) + 1, unit:sp.unit || '' }; }
  if(sp.op === '−'){ let a = sp.a, b = sp.b, note = '', pence = padDec(a) || padDec(b);
    if(pence){ note = `in pence: ${twoDp(a)} = ${num(Math.round(a * 100))}p, ${twoDp(b)} = ${num(Math.round(b * 100))}p`; a = Math.round(a * 100); b = Math.round(b * 100); } else { a = Math.round(a); b = Math.round(b); }
    const swap = b > a; if(swap){ const t = a; a = b; b = t; }
    return { op:'−', top:[a], low:b, parts:[], ans:a - b, pence, note, swap, W:String(a).length + 1, unit:pence ? 'p' : (sp.unit || '') }; }
  if(sp.op === '÷'){ const C = padCellsOf(padKey(sp)), a0 = Math.round(sp.a), b0 = Math.round(sp.b), canSmall = a0 % 10 === 0 && b0 % 10 === 0 && a0 > 0 && b0 > 0;
    let a = a0, b = b0, k = 0; if(C.small && canSmall){ while(a % 10 === 0 && b % 10 === 0 && a && b){ a /= 10; b /= 10; k++; } }
    const dp = b && a % b !== 0 ? 2 : 0, int = String(a).length, q = b ? Math.floor(a / b * Math.pow(10, dp) + 1e-9) / Math.pow(10, dp) : 0;
    return { op:'÷', a, b, a0, b0, k, canSmall, small:!!(C.small && canSmall), dp, int, ans:q, exact:b ? a / b : 0, W:int + dp, top:[a], low:b, parts:[], pence:false, unit:sp.unit || '' }; }
  // × — make it whole (Bertie, 14 Oct): each decimal factor × 10, 100 or 1,000 (its decimal places; money has 2), one whole-number
  // multiplication, then divide back by the same
  const placesOf = v => { const s = String(Math.abs(+v)), i = s.indexOf('.'); return i < 0 ? 0 : Math.min(3, s.length - i - 1); };
  const kOf = v => sp.money ? (padDec(v) ? 100 : 1) : Math.pow(10, placesOf(v)), ka = kOf(sp.a), kb = kOf(sp.b), scale = ka * kb, pence = !!sp.money && scale === 100;
  const show = (v, k) => sp.money ? (+v).toFixed(2) : String(+v), dpw = k => `${String(k).length - 1} decimal place${k === 10 ? '' : 's'}`, notes = [];
  let a = sp.a, b = sp.b;
  if(ka > 1){ notes.push(`${show(a, ka)} × ${num(ka)} = ${num(Math.round(a * ka))} (${dpw(ka)})`); a = Math.round(a * ka); }
  if(kb > 1){ notes.push(`${show(b, kb)} × ${num(kb)} = ${num(Math.round(b * kb))} (${dpw(kb)})`); b = Math.round(b * kb); }
  const note = notes.join('; ');
  a = Math.round(a); b = Math.round(b);
  const nz = v => String(v).split('').filter(d => d !== '0').length;
  let top = a, low = b; if(nz(a) < nz(b) || (nz(a) === nz(b) && String(a).length < String(b).length)){ top = b; low = a; }
  const parts = nz(low) > 1 ? String(low).split('').reverse().map((d, k) => ({ d:+d, k, v:top * +d * Math.pow(10, k), lab:`${num(top)} × ${num(+d * Math.pow(10, k))}` })).filter(x => x.d) : [];
  const ans = top * low, W = Math.max(String(ans).length, String(top).length, String(low).length + 1) + 1;
  return { op:'×', top:[top], low, parts, ans, pence, scale, money:!!sp.money, note, W, unit:sp.unit || '' };
}
function padBoxes(key, rid, n, cls, max){ const C = padCellsOf(key), vals = C[rid] || [];
  return Array.from({ length:n }, (_, c) => `<input class="${cls}" data-wpr="${rid}" data-wpc="${c}" maxlength="${max || 1}" inputmode="numeric" autocomplete="off" value="${esc(vals[c] || '')}" aria-label="${cls === 'wp-d' ? 'digit' : 'small box'}">`).join(''); }
function padRowHtml(key, rid, W, carry){
  return `${carry ? `<div class="wp-r wp-cy">${padBoxes(key, rid + 'c', W, 'wp-c')}</div>` : ''}<div class="wp-r">${padBoxes(key, rid, W, 'wp-d')}</div>`;
}
function padStatic(v, W, op){ const s = String(v).padStart(W, ' ').split(''); return `<div class="wp-r wp-g">${s.map((ch, i) => `<span class="wp-s">${i === 0 && op ? op : ch === ' ' ? '' : ch}</span>`).join('')}</div>`; }
function padBody(sp, M, key){
  const W = M.W, C = padCellsOf(key);
  if(M.op === '+') return `<div class="wp-grid" style="--w:${W}">${M.top.map((v, i) => padStatic(v, W, i === M.top.length - 1 ? '+' : '')).join('')}<div class="wp-line"></div>${padRowHtml(key, 'ans', W, true)}</div>`;
  if(M.op === '−') return `<div class="wp-grid" style="--w:${W}"><div class="wp-r wp-xs">${padBoxes(key, 'x', W, 'wp-c wp-x', 2)}</div>${padStatic(M.top[0], W, '')}${padStatic(M.low, W, '−')}<div class="wp-line"></div>${padRowHtml(key, 'ans', W, false)}</div>`;
  if(M.op === '÷'){ const D = String(M.a).split(''), qd = C.q || [], rm = C.r || [];
    const qCell = c => `<input class="wp-d" data-wpr="q" data-wpc="${c}" maxlength="1" inputmode="numeric" autocomplete="off" value="${esc(qd[c] || '')}" aria-label="answer digit">`;
    const dCell = (ch, c) => `<span class="wp-bc">${c > 0 ? `<input class="wp-rm" data-wpr="r" data-wpc="${c}" maxlength="2" inputmode="numeric" autocomplete="off" value="${esc(rm[c] || '')}" aria-label="remainder carried">` : ''}<b>${ch}</b></span>`;
    const qRow = D.map((_, c) => qCell(c)).join('') + (M.dp ? `<span class="wp-pt">.</span>` + Array.from({ length:M.dp }, (_, j) => qCell(M.int + j)).join('') : '');
    const dRow = D.map((ch, c) => dCell(ch, c)).join('') + (M.dp ? `<span class="wp-pt">.</span>` + Array.from({ length:M.dp }, (_, j) => dCell('0', M.int + j)).join('') : '');
    const mult = `<div class="wp-mult"><b>Multiples of ${num(M.b)}</b>${Array.from({ length:9 }, (_, i) => i + 1).map(k => `<label>${k} × ${num(M.b)} =${k === 1 ? `<span>${num(M.b)}</span>` : `<input data-wpm="${k}" inputmode="numeric" autocomplete="off" value="${esc(C['m' + k] || '')}" aria-label="${k} times ${M.b}">`}</label>`).join('')}</div>`;
    return `<div class="wp-divw"><div class="wp-bus"><div class="wp-bq"><span class="wp-bdv"></span>${qRow}</div><div class="wp-bb"><span class="wp-bdv">${num(M.b)}</span><div class="wp-bin">${dRow}</div></div></div>${mult}</div>`; }
  let body = padStatic(M.top[0], W, '') + padStatic(M.low, W, '×') + '<div class="wp-line"></div>';
  if(M.parts.length) body += M.parts.map((x, i) => `<div class="wp-pl"><small>${esc(x.lab)}</small></div>${padRowHtml(key, 'p' + i, W, true)}`).join('') + '<div class="wp-line"></div>' + padRowHtml(key, 'ans', W, true);
  else body += padRowHtml(key, 'ans', W, true);
  return `<div class="wp-grid" style="--w:${W}">${body}</div>`;
}
function padHint(M){
  if(M.op === '+') return 'Add each column from the right; carry into the next column.';
  if(M.op === '−') return `${M.swap ? 'The bigger number goes on top. ' : ''}Take away each column from the right. If the top digit is too small, exchange: take 1 from the next column and write the new numbers in the small boxes.`;
  if(M.op === '÷') return `How many ${num(M.b)}s go into each part, from the left? Write the answer digit above and carry the remainder to the next digit.${M.dp ? ' The answer goes past the point: carry on into the 0s.' : ''}`;
  if(M.parts.length) return `Long multiplication: a line for each digit of ${num(M.low)}, then add the lines.`;
  if(/^10+$/.test(String(M.low))) return `× ${num(M.low)} moves each digit ${String(M.low).length - 1 === 1 ? 'one place' : (String(M.low).length - 1) + ' places'} to the left; the empty places get a 0.`;
  return `Multiply each digit of ${num(M.top[0])} by ${num(M.low)}, from the right, carrying as you go.`;
}
function padHtml(sp){
  const key = padKey(sp), C = padCellsOf(key), free = !!sp.free, ready = !free || (sp.a !== null && sp.a !== undefined && sp.b !== null && sp.b !== undefined) || (sp.op === '+' && sp.lines);
  const M = ready ? padModel(sp) : null;
  const form = free ? `<div class="wp-free"><input data-wfa inputmode="decimal" autocomplete="off" value="${esc(UI.padFree && UI.padFree.a !== undefined ? UI.padFree.a : '')}" aria-label="First number" placeholder="first number">
      <select data-wfop aria-label="Operation">${['×', '÷', '+', '−'].map(o => `<option ${sp.op === o ? 'selected' : ''}>${o}</option>`).join('')}</select>
      <input data-wfb inputmode="decimal" autocomplete="off" value="${esc(UI.padFree && UI.padFree.b !== undefined ? UI.padFree.b : '')}" aria-label="Second number" placeholder="second number"><button class="btn small" data-wfgo>Set it out</button></div>` : '';
  const small = M && M.op === '÷' && M.canSmall ? `<label class="wp-small"><input type="checkbox" data-wpsmall ${M.small ? 'checked' : ''}> Make it smaller${M.small ? `: ${num(M.a0)} ÷ ${num(M.b0)} is the same as ${num(M.a)} ÷ ${num(M.b)}` : ` (both end in 0)`}</label>` : '';
  const back = M && M.op === '×' && M.scale > 1, pounds = back && !free ? `<div class="wp-pnd"><span>Divide back: answer ÷ ${num(M.scale)} =</span><span class="sc-in">${M.money ? '<i class="pre">£</i>' : ''}<input data-wpp="1" inputmode="decimal" autocomplete="off" value="${esc(C.pounds || '')}" aria-label="Divided back"></span></div>` : back && free ? `<p class="wp-note">Then ÷ ${num(M.scale)} to put the decimal places back.</p>` : '';
  return `<div class="wp-h"><b>Working</b><span>${esc(free ? 'your own sum' : sp.lab)}</span><button class="s2-x" data-wpx="1" aria-label="Close">×</button></div>${form}
    ${M ? `${M.note ? `<p class="wp-note">${M.op === '×' ? 'Make it whole: ' : 'Work '}${esc(M.note)}</p>` : ''}${small}<p class="wp-note">${esc(padHint(M))}</p>${padBody(sp, M, key)}${M.unit === 'p' && !M.pence ? '<p class="wp-note">In pence.</p>' : ''}${pounds}` : '<p class="wp-note">Type two numbers and choose ×, ÷, + or −. The pad sets the sum out in columns for you to work. Nothing is marked.</p>'}
    <div class="wp-act"><button class="dk-link" data-wpclr="1">Clear</button><span class="grow"></span><span class="wp-msg" role="status"></span>${free ? '<button class="btn" data-wpx="2">Close</button>' : '<button class="btn primary" data-wpuse="1">Use this answer ✓</button>'}</div>`;
}
/* a row read as a number (blank boxes inside count as 0) */
function padRowValue(key, rid){ const r = padCellsOf(key)[rid] || []; const s = Array.from(r, ch => ch === undefined || ch === null ? '' : ch); if(!s.some(ch => /\d/.test(ch))) return null;
  let str = s.map(ch => /\d/.test(ch) ? ch : ' ').join('').replace(/^\s+/, '').replace(/\s+$/, '').replace(/\s/g, '0'); return str === '' ? null : +str; }
function padDivValue(key, M){ const q = padCellsOf(key).q || [], ints = Array.from({ length:M.int }, (_, c) => q[c] || ''), frac = Array.from({ length:M.dp }, (_, j) => q[M.int + j] || '');
  if(!ints.concat(frac).some(ch => /\d/.test(ch))) return null;
  const I = ints.map(ch => /\d/.test(ch) ? ch : ' ').join('').trim().replace(/\s/g, '0') || '0', F = frac.map(ch => /\d/.test(ch) ? ch : ' ').join('').replace(/\s+$/, '').replace(/\s/g, '0');
  return +(I + (F ? '.' + F : '')); }
/* the pad's lines as text, for the record */
function padSnapshot(sp){
  const M = padModel(sp), key = padKey(sp), C = padCellsOf(key), W = M.W, line = (cells, op) => (op || ' ') + ' ' + Array.from({ length:W }, (_, c) => (cells && cells[c] && /\d/.test(cells[c])) ? cells[c] : ' ').join(' ');
  const stat = (v, op) => (op || ' ') + ' ' + String(v).padStart(W, ' ').split('').join(' '), L = [];
  if(M.op === '÷'){ const q = C.q || [], rm = C.r || [], digs = String(M.a).split('').concat(M.dp ? ['.'].concat(Array(M.dp).fill('0')) : []);
    if(M.small) L.push(`Make it smaller: ${num(M.a0)} ÷ ${num(M.b0)} = ${num(M.a)} ÷ ${num(M.b)}`);
    const qs = Array.from({ length:M.int }, (_, c) => q[c] || ' ').concat(M.dp ? ['.'].concat(Array.from({ length:M.dp }, (_, j) => q[M.int + j] || ' ')) : []);
    const pad = ' '.repeat(String(M.b).length + 2); L.push(pad + qs.join(' ')); L.push(pad + '_'.repeat(digs.length * 2 - 1)); L.push(`${M.b} ) ${digs.join(' ')}`);
    const carried = rm.map((v, c) => v ? `${v} before the ${c < M.int ? String(M.a)[c] : '0'}` : '').filter(Boolean); if(carried.length) L.push('remainders carried: ' + carried.join(', '));
    const m = Array.from({ length:8 }, (_, i) => i + 2).filter(k => C['m' + k]).map(k => `${k} × ${M.b} = ${C['m' + k]}`); if(m.length) L.push('multiples: ' + m.join(' · '));
    return { lab:sp.lab, lines:L }; }
  if(M.note) L.push(M.note);
  if(M.op === '+') M.top.forEach((v, i) => L.push(stat(v, i === M.top.length - 1 ? '+' : '')));
  else if(M.op === '−'){ if((C.x || []).some(Boolean)) L.push('  ' + Array.from({ length:W }, (_, c) => (C.x || [])[c] || ' ').join(' ')); L.push(stat(M.top[0])); L.push(stat(M.low, '−')); }
  else { L.push(stat(M.top[0])); L.push(stat(M.low, '×')); }
  L.push('  ' + '-'.repeat(W * 2 - 1)); M.parts.forEach((x, i) => L.push(line(C['p' + i]))); if(M.parts.length) L.push('  ' + '-'.repeat(W * 2 - 1));
  L.push(line(C.ans)); if(M.op === '×' && M.scale > 1) L.push(`÷ ${M.scale} = ${M.money ? '£' : ''}${C.pounds || ' '}`);
  return { lab:sp.lab, lines:L };
}

/* ---------- the pad on screen ---------- */
let PAD = null;   // { sp, el, at, free }
function closePad(){ if(PAD && PAD.el) PAD.el.remove(); PAD = null; }
function padPlace(el, anchor, free){
  const w = el.offsetWidth, h = el.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
  if(free || !anchor){ el.style.left = Math.max(8, vw - w - 16) + 'px'; el.style.top = Math.max(8, Math.min(vh - h - 8, 104)) + 'px'; return; }
  const t = anchor.getBoundingClientRect(); let x = t.left - w - 12, y = t.top - 60; if(x < 8){ x = t.right + 12; if(x + w > vw - 8){ x = Math.max(8, Math.min(vw - w - 8, t.left)); y = t.bottom + 8; } }
  el.style.left = Math.round(x) + 'px'; el.style.top = Math.round(Math.max(8, Math.min(vh - h - 8, y))) + 'px';
}
function openPad(sp, btn){
  closePad(); const el = document.createElement('div'); el.className = 'wpop' + (sp.free ? ' free' : ''); el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Working'); el.innerHTML = padHtml(sp); document.body.appendChild(el);
  PAD = { sp, el, at:sp.free ? null : (S.day || 0) + '|' + S.si, free:!!sp.free };
  const tgt = sp.sel ? screen().querySelector(sp.sel) : null; padPlace(el, tgt && tgt.closest('.pad-wrap') || btn, sp.free);
  bindPad(); padFocusFirst();
}
function padRedraw(){ if(!PAD) return; const keep = PAD.el.style.cssText; PAD.el.innerHTML = padHtml(PAD.sp); PAD.el.style.cssText = keep; bindPad(); }
function padFocusFirst(){ if(!PAD) return; const sp = PAD.sp, el = PAD.el; let first = null;
  try{ const M = padModel(sp); first = M.op === '÷' ? el.querySelector('[data-wpr="q"][data-wpc="0"]') : el.querySelector(`[data-wpr="${M.parts.length ? 'p0' : 'ans'}"][data-wpc="${M.W - 1}"]`); }catch(e){}
  if(!first) first = el.querySelector('[data-wfa]'); if(first) setTimeout(() => { try{ first.focus(); }catch(e){} }, 30); }
function bindPad(){
  if(!PAD) return; const el = PAD.el, sp = PAD.sp, key = padKey(sp), C = padCellsOf(key);
  const box = (r, c) => el.querySelector(`[data-wpr="${r}"][data-wpc="${c}"]`);
  el.querySelectorAll('[data-wpr]').forEach(i => {
    const r = i.getAttribute('data-wpr'), c = +i.getAttribute('data-wpc'), small = /c$/.test(r) || r === 'x' || r === 'r', right = r === 'q';
    i.oninput = () => { const ds = (i.value.match(/\d/g) || []), d = small ? ds.slice(-(+i.maxLength || 1)).join('') : (ds.pop() || ''); i.value = d; (C[r] = C[r] || [])[c] = d; if(d && !small){ const n = box(r, right ? c + 1 : c - 1); if(n) n.focus(); } };
    i.onkeydown = e => {
      if(e.key === 'Backspace' && !i.value){ e.preventDefault(); const n = box(r, right ? c - 1 : c + 1); if(n){ n.value = ''; (C[r] = C[r] || [])[right ? c - 1 : c + 1] = ''; n.focus(); } }
      else if(e.key === 'ArrowLeft'){ e.preventDefault(); const n = box(r, c - 1); if(n) n.focus(); }
      else if(e.key === 'ArrowRight'){ e.preventDefault(); const n = box(r, c + 1); if(n) n.focus(); }
      else if(e.key === 'Escape') closePad();
      else if(e.key === 'Enter'){ e.preventDefault(); const u = el.querySelector('[data-wpuse]'); if(u) u.click(); } };
  });
  el.querySelectorAll('[data-wpm]').forEach(i => { i.oninput = () => { C['m' + i.getAttribute('data-wpm')] = i.value; }; });
  const pp = el.querySelector('[data-wpp]'); if(pp) pp.oninput = () => { C.pounds = pp.value; };
  const sm = el.querySelector('[data-wpsmall]'); if(sm) sm.onchange = () => { C.small = sm.checked; delete C.q; delete C.r; padRedraw(); padFocusFirst(); };
  el.querySelectorAll('[data-wpx]').forEach(b => b.onclick = closePad);
  el.querySelector('[data-wpclr]').onclick = () => { const small = C.small; UI.padCells[key] = { small }; padRedraw(); padFocusFirst(); };
  // the free pad: two numbers and the operation
  const go = el.querySelector('[data-wfgo]');
  if(go){ const fa = el.querySelector('[data-wfa]'), fb = el.querySelector('[data-wfb]'), fo = el.querySelector('[data-wfop]');
    const set = () => { const a = padNum(fa.value), b = padNum(fb.value), op = fo.value, msg = el.querySelector('.wp-msg'); UI.padFree = { a:fa.value, b:fb.value, op };
      if(a === null || b === null){ msg.textContent = 'Type two numbers.'; return; } if(op === '÷' && !b){ msg.textContent = 'You can\'t share into 0 groups.'; return; }
      const money = /£/.test(fa.value + fb.value);   // a decimal without £ counts its own decimal places
      PAD.sp = op === '+' ? { free:true, op, lines:padDec(a) || padDec(b) ? [Math.round(a * 100), Math.round(b * 100)] : [a, b], unit:padDec(a) || padDec(b) ? 'p' : '', lab:`${fa.value} + ${fb.value}`, a, b }
        : { free:true, op, a, b, money, lab:`${fa.value} ${op} ${fb.value}` };
      padRedraw(); padFocusFirst(); };
    go.onclick = set; [fa, fb].forEach(i => i.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); set(); } }); }
  const use = el.querySelector('[data-wpuse]');
  if(use) use.onclick = () => {
    const msg = el.querySelector('.wp-msg'), M = padModel(sp); let v = null;
    if(M.op === '÷'){ const d = padDivValue(key, M); if(d === null){ msg.textContent = 'Fill in the answer above the line first.'; return; } v = String(d); }
    else if(M.op === '×' && M.scale > 1){ const p = String(C.pounds || '').replace(/[£,\s]/g, ''); const ans = padRowValue(key, 'ans'); if(p === '' || isNaN(+p)){ msg.textContent = ans === null ? 'Work out the answer line first.' : `Now divide back: ÷ ${num(M.scale)} puts the decimal places back.`; return; } v = p; }
    else { const ans = padRowValue(key, 'ans'); if(ans === null){ msg.textContent = 'Fill in the answer line first.'; return; } v = String(ans); }
    const t = screen().querySelector(sp.sel); if(!t){ msg.textContent = 'The box has gone: close the pad.'; return; }
    t.value = v; t.dispatchEvent(new Event('input', { bubbles:true }));
    UI.padSnap = padSnapshot(sp); closePad(); try{ t.focus(); }catch(e){}
  };
}
document.addEventListener('keydown', e => { if(e.key === 'Escape' && PAD) closePad(); });
/* the Working buttons, after each render; a box's pad from another step closes (the free pad stays) */
function padButtons(){
  if(PAD && !PAD.free && PAD.at !== (S.day || 0) + '|' + S.si) closePad();
  screen().querySelectorAll(PAD_SEL.join(',')).forEach(inp => {
    if(inp.type === 'hidden' || inp.dataset.padOn) return; const sp = padSpecFor(inp); if(!sp) return; inp.dataset.padOn = '1';
    const box = inp.closest('.sc-in') || inp, wrap = document.createElement('span'), b = document.createElement('button'); wrap.className = 'pad-wrap'; box.parentNode.insertBefore(wrap, box); wrap.appendChild(box);
    b.type = 'button'; b.className = 'pad-btn'; b.textContent = 'Working'; b.title = `Open a working pad for ${sp.lab}`;
    b.onclick = e => { e.preventDefault(); const cur = screen().querySelector(sp.sel); const s2 = cur ? padSpecFor(cur) || sp : sp; if(PAD && !PAD.free && padKey(PAD.sp) === padKey(s2)){ closePad(); return; } openPad(s2, b); };
    wrap.appendChild(b);
  });
}
const renderPad0 = render;
render = function(){ const r = renderPad0.apply(this, arguments); try{ if(S && !IS_DISPLAY) padButtons(); }catch(e){} return r; };
/* the free pad: a pencil in the top bar, on every screen */
const PAD_ICON = '<svg class="di" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M13.5 6.5l4 4" stroke="currentColor" stroke-width="1.8"/></svg>';
function openFreePad(){ if(PAD && PAD.free){ closePad(); return; } const f = UI.padFree || {}, a = padNum(f.a), b = padNum(f.b), op = f.op || '×';
  openPad(a !== null && b !== null ? (op === '+' ? { free:true, op, lines:[a, b], a, b, lab:`${f.a} + ${f.b}` } : { free:true, op, a, b, money:/£/.test(String(f.a) + f.b), lab:`${f.a} ${op} ${f.b}` }) : { free:true, op, a:null, b:null, lab:'' }, null); }
(function padTopBar(){ if(typeof IS_DISPLAY !== 'undefined' && IS_DISPLAY) return; const tools = document.querySelector('.dkh-tools'); if(!tools || document.getElementById('padFree')) return;
  tools.insertAdjacentHTML('afterbegin', `<button class="dk-ib pad-ib" id="padFree" title="Working: set out a sum in columns (×, ÷, +, −)" aria-label="Working pad">${PAD_ICON}</button>`);
  document.getElementById('padFree').onclick = openFreePad; })();
/* the record: what was on the pad goes into the attempt that follows */
if(typeof recAttempt === 'function'){ const recAttemptPad0 = recAttempt;
  recAttempt = function(e, a){ if(UI.padSnap && a && !a.pad){ a.pad = UI.padSnap; UI.padSnap = null; } return recAttemptPad0(e, a); }; }
if(typeof recAttemptHtml === 'function'){ const recAttemptHtmlPad0 = recAttemptHtml;
  recAttemptHtml = function(e, a, n){ const h = recAttemptHtmlPad0(e, a, n); if(!a || !a.pad) return h;
    const pre = `<p class="an">Working on the pad: ${recE(a.pad.lab)}</p><pre class="w"><span class="b">${a.pad.lines.map(recE).join('\n')}</span></pre>`;
    return h.replace('<div class="att">', '<div class="att">' + pre); }; }
/* for the tests: the pad's layout for a box */
function padInfo(sel){ const inp = screen().querySelector(sel), sp = inp && padSpecFor(inp); if(!sp) return null; const M = padModel(sp);
  return { op:M.op, W:M.W, low:M.low, top:M.top, a:M.a, b:M.b, dp:M.dp, int:M.int, small:M.small, canSmall:M.canSmall, parts:(M.parts || []).map(x => x.v), ans:M.ans, pence:M.pence, scale:M.scale || 1, pounds:M.pence ? (M.ans / 100).toFixed(2) : null }; }
