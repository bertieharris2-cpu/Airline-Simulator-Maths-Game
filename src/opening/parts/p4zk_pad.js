/* ==================================================================
   THE WORKING PAD (Bertie, 13 Oct 2026): "what if I need to do workings for the multiplication? Can you have a button
   where a popup comes out for the working? 4 × 1470".
   A Working button sits beside every typed × answer (the fuel desk's first order, the sign-off cards, the estimate, the
   Service Cost card's lines, and the card's "Add the lines" as a column addition). It opens a small pad with the
   column method in digit boxes, typed right to left: the two numbers, a carry strip above each line, a line for each
   part of the smaller number when it has more than one, and the answer. Money with pence is worked in pence, as the fuel
   card teaches ("£1.47 = 147p"), then ÷ 100 back to pounds. The pad does not mark anything: Use this answer copies the
   bottom line into the box, and the box's own Check decides. What is on the pad then goes into the pupil record.
   ================================================================== */
UI.padCells = UI.padCells || {};
const padDigits = v => String(v);
/* the sum a box asks for, or null */
function padSpecFor(inp){
  try{
    if(inp.matches('[data-fds]')){ const k = inp.getAttribute('data-fds'), P0 = fuelOn(S.day || 1), blk = fuelBlock(), one = r2(blk * P0);
      if(k === 'one') return { op:'×', a:blk, b:P0, money:true, lab:`${num(blk)} L × ${priceL(P0)}`, sel:'[data-fds="one"]' };
      if(k === 'all'){ const n = UI.fd.selNow || 0; return n > 1 ? { op:'×', a:n, b:one, money:true, lab:`${n} × ${twoDp(one)}`, sel:'[data-fds="all"]' } : null; } }
    if(inp.matches('[data-soin]')){ const key = inp.getAttribute('data-soin'), it = soItem(key), sp = it && soSpec(it); if(!sp || sp.op !== '×') return null;
      const money = /^£|ppl/.test(sp.a.f + sp.b.f) || /^£/.test(sp.res);
      return { op:'×', a:sp.a.v, b:sp.b.v, money, lab:`${soFmt(sp.a.f, sp.a.v)} × ${soFmt(sp.b.f, sp.b.v)}`, sel:`[data-soin="${key}"]` }; }
    if(inp.matches('[data-sopre]')){ const key = inp.getAttribute('data-sopre'), it = soItem(key), sp = it && soSpec(it); if(!sp || !sp.pre || !sp.pre.est || !sp.pre.a) return null;
      return { op:'×', a:sp.pre.a, b:sp.pre.b, money:true, lab:sp.pre.lab, sel:`[data-sopre="${key}"]` }; }
    if(inp.matches('[data-sc]')){ const k = inp.getAttribute('data-sc'), F = UI.sc.F; if(!F || !/^r\d+$/.test(k)) return null; const R = scRows(UI.sc.mUsed || 'pence', F), x = R.rows[+k.slice(1)]; if(!x) return null;
      if(x.part) return { op:'×', a:F.L, b:x.part.v, money:false, unit:'p', lab:`${num(F.L)} × ${num(x.part.v)}p`, sel:`[data-sc="${k}"]` };
      if(x.add) return { op:'+', lines:R.rows.filter(z => z.part).map(z => z.want), money:false, unit:'p', lab:'Add the lines', sel:`[data-sc="${k}"]` };
      return null; }
  }catch(e){}
  return null;
}
/* the column layout: which number goes underneath, pence or pounds, the lines and the answer */
function padModel(sp){
  if(sp.op === '+'){ const ans = sp.lines.reduce((t, v) => t + v, 0); return { op:'+', top:sp.lines, parts:[], ans, pence:false, W:Math.max(...sp.lines.map(v => String(v).length), String(ans).length) + 1, unit:sp.unit || '' }; }
  const dec = v => Math.abs(Math.round(v * 100) % 100) !== 0, pence = !!sp.money && (dec(sp.a) || dec(sp.b));
  let a = sp.a, b = sp.b, note = '';
  if(pence){ if(dec(a)){ note = `${priceL(a)} = ${Math.round(a * 100)}p`; a = Math.round(a * 100); } if(dec(b)){ note = `${sp.b < 10 ? priceL(b) : twoDp(b)} = ${num(Math.round(b * 100))}p`; b = Math.round(b * 100); } }
  a = Math.round(a); b = Math.round(b);
  const nz = v => String(v).split('').filter(d => d !== '0').length;
  let top = a, low = b; if(nz(a) < nz(b) || (nz(a) === nz(b) && String(a).length < String(b).length)){ top = b; low = a; }
  const parts = nz(low) > 1 ? String(low).split('').reverse().map((d, k) => ({ d:+d, k, v:top * +d * Math.pow(10, k), lab:`${num(top)} × ${num(+d * Math.pow(10, k))}` })).filter(x => x.d) : [];
  const ans = top * low, W = Math.max(String(ans).length, String(top).length, String(low).length + 1) + 1;
  return { op:'×', top:[top], low, parts, ans, pence, note, W, unit:pence ? 'p' : (sp.unit || '') };
}
function padKey(sp){ return sp.sel + '|' + sp.lab; }
function padCellsOf(key){ return UI.padCells[key] || (UI.padCells[key] = {}); }
function padRowHtml(key, rid, W, carry){
  const C = padCellsOf(key), vals = C[rid] || [], cy = C[rid + 'c'] || [];
  const cells = Array.from({ length:W }, (_, c) => `<input class="wp-d" data-wpr="${rid}" data-wpc="${c}" maxlength="1" inputmode="numeric" autocomplete="off" value="${esc(vals[c] || '')}" aria-label="digit">`).join('');
  const carries = carry ? `<div class="wp-r wp-cy">${Array.from({ length:W }, (_, c) => `<input class="wp-c" data-wpr="${rid}c" data-wpc="${c}" maxlength="1" inputmode="numeric" autocomplete="off" value="${esc(cy[c] || '')}" aria-label="carry">`).join('')}</div>` : '';
  return `${carries}<div class="wp-r">${cells}</div>`;
}
function padStatic(v, W, op){ const s = String(v).padStart(W, ' ').split(''); return `<div class="wp-r wp-g">${s.map((ch, i) => `<span class="wp-s">${i === 0 && op ? op : ch === ' ' ? '' : ch}</span>`).join('')}</div>`; }
function padHtml(sp){
  const M = padModel(sp), key = padKey(sp), W = M.W, C = padCellsOf(key);
  let body = '';
  if(M.op === '+'){ body = M.top.map((v, i) => padStatic(v, W, i === M.top.length - 1 ? '+' : '')).join('') + '<div class="wp-line"></div>' + padRowHtml(key, 'ans', W, true); }
  else { body = padStatic(M.top[0], W, '') + padStatic(M.low, W, '×') + '<div class="wp-line"></div>';
    if(M.parts.length){ body += M.parts.map((x, i) => `<div class="wp-pl"><small>${esc(x.lab)}</small></div>${padRowHtml(key, 'p' + i, W, true)}`).join('') + '<div class="wp-line"></div>' + padRowHtml(key, 'ans', W, true); }
    else body += padRowHtml(key, 'ans', W, true); }
  const pounds = M.pence ? `<div class="wp-pnd"><span>Answer in pence ÷ 100 =</span><span class="sc-in"><i class="pre">£</i><input data-wpp="1" inputmode="decimal" autocomplete="off" value="${esc(C.pounds || '')}" aria-label="In pounds"></span></div>` : '';
  const hint = M.op === '+' ? 'Add each column from the right; carry into the next column.' : M.parts.length ? `One line for each part of ${num(M.low)}, then add the lines.` : /^10+$/.test(String(M.low)) ? `× ${num(M.low)} moves each digit ${String(M.low).length - 1 === 1 ? 'one place' : (String(M.low).length - 1) + ' places'} to the left; the empty places get a 0.` : `Multiply each digit of ${num(M.top[0])} by ${num(M.low)}, from the right, carrying as you go.`;
  return `<div class="wp-h"><b>Working</b><span>${esc(sp.lab)}</span><button class="s2-x" data-wpx="1" aria-label="Close">×</button></div>
    ${M.note ? `<p class="wp-note">Make it pence: ${esc(M.note)}</p>` : ''}<p class="wp-note">${esc(hint)}</p>
    <div class="wp-grid" style="--w:${W}">${body}</div>${M.unit === 'p' && !M.pence ? '<p class="wp-note">In pence.</p>' : ''}${pounds}
    <div class="wp-act"><button class="dk-link" data-wpclr="1">Clear</button><span class="grow"></span><span class="wp-msg" role="status"></span><button class="btn primary" data-wpuse="1">Use this answer ✓</button></div>`;
}
function padRowValue(key, rid){ const r = padCellsOf(key)[rid] || []; const s = Array.from(r, ch => ch === undefined || ch === null ? '' : ch); if(!s.some(ch => /\d/.test(ch))) return null;
  let str = s.map(ch => /\d/.test(ch) ? ch : ' ').join('').replace(/^\s+/, '').replace(/\s/g, '0'); return str === '' ? null : +str; }
/* the pad's lines as text, for the record */
function padSnapshot(sp){
  const M = padModel(sp), key = padKey(sp), C = padCellsOf(key), W = M.W, line = (cells, op) => (op || ' ') + ' ' + Array.from({ length:W }, (_, c) => (cells && cells[c] && /\d/.test(cells[c])) ? cells[c] : ' ').join(' ');
  const stat = (v, op) => (op || ' ') + ' ' + String(v).padStart(W, ' ').split('').join(' ');
  const L = []; if(M.note) L.push(`Make it pence: ${M.note}`);
  if(M.op === '+') M.top.forEach((v, i) => L.push(stat(v, i === M.top.length - 1 ? '+' : '')));
  else { L.push(stat(M.top[0])); L.push(stat(M.low, '×')); }
  L.push('  ' + '-'.repeat(W * 2 - 1));
  M.parts.forEach((x, i) => L.push(line(C['p' + i])));
  if(M.parts.length) L.push('  ' + '-'.repeat(W * 2 - 1));
  L.push(line(C.ans)); if(M.pence) L.push(`÷ 100 = £${C.pounds || ' '}`);
  return { lab:sp.lab, lines:L };
}
let PAD = null;   // { sp, el }
function closePad(){ if(PAD && PAD.el) PAD.el.remove(); PAD = null; }
function openPad(sp, btn){
  closePad(); const el = document.createElement('div'); el.className = 'wpop'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Working'); el.innerHTML = padHtml(sp); document.body.appendChild(el);
  PAD = { sp, el, at:(S.day || 0) + '|' + S.si };
  // beside the box, not over it: to its left when there is room, else to the right of the button, else below
  const tgt = screen().querySelector(sp.sel), t = (tgt && tgt.closest('.pad-wrap') || btn || document.body).getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
  let x = t.left - w - 12, y = t.top - 60; if(x < 8){ x = t.right + 12; if(x + w > vw - 8){ x = Math.max(8, Math.min(vw - w - 8, t.left)); y = t.bottom + 8; } }
  el.style.left = Math.round(x) + 'px'; el.style.top = Math.round(Math.max(8, Math.min(vh - h - 8, y))) + 'px';
  bindPad();
  const first = el.querySelector('[data-wpr="' + (padModel(sp).parts.length ? 'p0' : 'ans') + '"][data-wpc="' + (padModel(sp).W - 1) + '"]'); if(first) setTimeout(() => { try{ first.focus(); }catch(e){} }, 30);
}
function bindPad(){
  if(!PAD) return; const el = PAD.el, sp = PAD.sp, key = padKey(sp), C = padCellsOf(key), M = padModel(sp);
  const box = (r, c) => el.querySelector(`[data-wpr="${r}"][data-wpc="${c}"]`);
  el.querySelectorAll('[data-wpr]').forEach(i => {
    const r = i.getAttribute('data-wpr'), c = +i.getAttribute('data-wpc'), carry = /c$/.test(r);
    i.oninput = () => { const d = (i.value.match(/\d/g) || []).pop() || ''; i.value = d; (C[r] = C[r] || [])[c] = d; if(d && !carry){ const L = box(r, c - 1); if(L) L.focus(); } };
    i.onkeydown = e => {
      if(e.key === 'Backspace' && !i.value){ e.preventDefault(); const Rb = box(r, c + 1); if(Rb){ Rb.value = ''; (C[r] = C[r] || [])[c + 1] = ''; Rb.focus(); } }
      else if(e.key === 'ArrowLeft'){ e.preventDefault(); const L = box(r, c - 1); if(L) L.focus(); }
      else if(e.key === 'ArrowRight'){ e.preventDefault(); const Rb = box(r, c + 1); if(Rb) Rb.focus(); }
      else if(e.key === 'Escape'){ closePad(); }
      else if(e.key === 'Enter'){ e.preventDefault(); const u = el.querySelector('[data-wpuse]'); if(u) u.click(); } };
  });
  const pp = el.querySelector('[data-wpp]'); if(pp) pp.oninput = () => { C.pounds = pp.value; };
  el.querySelector('[data-wpx]').onclick = closePad;
  el.querySelector('[data-wpclr]').onclick = () => { UI.padCells[key] = {}; const s = PAD.sp, keep = PAD.el.style.cssText; PAD.el.innerHTML = padHtml(s); PAD.el.style.cssText = keep; bindPad(); };
  el.querySelector('[data-wpuse]').onclick = () => {
    const msg = el.querySelector('.wp-msg'), ans = padRowValue(key, 'ans');
    let v = null;
    if(M.pence){ const p = String(C.pounds || '').replace(/[£,\s]/g, ''); if(p === '' || isNaN(+p)){ msg.textContent = ans === null ? 'Work out the answer line first.' : 'Now change the pence to pounds: ÷ 100.'; return; } v = p; }
    else { if(ans === null){ msg.textContent = 'Fill in the answer line first.'; return; } v = String(ans); }
    const t = screen().querySelector(sp.sel); if(!t){ msg.textContent = 'The box has gone: close the pad.'; return; }
    t.value = v; t.dispatchEvent(new Event('input', { bubbles:true }));
    UI.padSnap = padSnapshot(sp); closePad(); try{ t.focus(); }catch(e){}
  };
}
document.addEventListener('keydown', e => { if(e.key === 'Escape' && PAD) closePad(); });
/* the Working buttons, after each render; a pad from another step closes */
function padButtons(){
  if(PAD && PAD.at !== (S.day || 0) + '|' + S.si) closePad();
  screen().querySelectorAll('[data-fds],[data-soin],[data-sopre],[data-sc]').forEach(inp => {
    if(inp.type === 'hidden' || inp.dataset.padOn) return; const sp = padSpecFor(inp); if(!sp) return; inp.dataset.padOn = '1';
    const box = inp.closest('.sc-in') || inp, wrap = document.createElement('span'), b = document.createElement('button'); wrap.className = 'pad-wrap'; box.parentNode.insertBefore(wrap, box); wrap.appendChild(box);
    b.type = 'button'; b.className = 'pad-btn'; b.textContent = 'Working'; b.title = `Open a working pad for ${sp.lab}`;
    b.onclick = e => { e.preventDefault(); const cur = screen().querySelector(sp.sel); const s2 = cur ? padSpecFor(cur) || sp : sp; if(PAD && padKey(PAD.sp) === padKey(s2)){ closePad(); return; } openPad(s2, b); };
    wrap.appendChild(b);
  });
}
const renderPad0 = render;
render = function(){ const r = renderPad0.apply(this, arguments); try{ if(S && !IS_DISPLAY) padButtons(); }catch(e){} return r; };
/* the record: what was on the pad goes into the attempt that follows */
if(typeof recAttempt === 'function'){ const recAttemptPad0 = recAttempt;
  recAttempt = function(e, a){ if(UI.padSnap && a && !a.pad){ a.pad = UI.padSnap; UI.padSnap = null; } return recAttemptPad0(e, a); }; }
if(typeof recAttemptHtml === 'function'){ const recAttemptHtmlPad0 = recAttemptHtml;
  recAttemptHtml = function(e, a, n){ const h = recAttemptHtmlPad0(e, a, n); if(!a || !a.pad) return h;
    const pre = `<p class="an">Working on the pad: ${recE(a.pad.lab)}</p><pre class="w"><span class="b">${a.pad.lines.map(recE).join('\n')}</span></pre>`;
    return h.replace('<div class="att">', '<div class="att">' + pre); }; }
/* for the tests: the pad's lines for a box (W, the parts, the answer, pence or not) */
function padInfo(sel){ const inp = screen().querySelector(sel), sp = inp && padSpecFor(inp); if(!sp) return null; const M = padModel(sp); return { W:M.W, low:M.low, top:M.top, parts:M.parts.map(x => x.v), ans:M.ans, pence:M.pence, pounds:M.pence ? (M.ans / 100).toFixed(2) : null }; }
