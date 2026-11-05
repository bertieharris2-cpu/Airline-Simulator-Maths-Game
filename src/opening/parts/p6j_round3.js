/* =====================================================================
   ROUND 3 (Claude Design's hand-off "fewer words", 1 Nov 2026; Bertie's 11:52 and 12:05 play notes). Chapter one only (ch1()).
   The rules that hold on every screen (DESIGN.md "Callout rules for the whole game"); the screens themselves are in p6i.
     rule 1 · a callout is a title: its body lines go, unless one is a rule the sum needs (it has "=")
     rule 2 · a sum's box is two lines, the method on top in its colour (Build the formula / Work it out on paper), then the task
     rule 5 · the box sits right under its cell, its pointer touching it; it slides sideways to stay in the panel, never up and away
     rule 6 · a right answer turns green in its cell
     parked · "How good was the plan" (the review's missed-profit box)
   ===================================================================== */
{
const on5 = () => typeof ch1 === 'function' && ch1();
const c5Plain = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\*\*/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

/* ---------- rule 2 · the Question Signal ---------- */
let c5N = null;   // the SUM number of the paper sum being drawn (c1PaperLines is always called inside the signal's arguments)
const c5Paper0 = c1PaperLines;
c1PaperLines = function(n, cell){ c5N = n; return c5Paper0.apply(this, arguments); };
/* the task, from the sum's title: "Dublin at £90: the ticket revenue" → "Calculate the ticket revenue" */
function c5Task(o){
  if(o.task) return o.task;
  if(/\?\s*$/.test(c5Plain(o.title))) return c5Plain(o.title);   // review 2 Nov: a question stays a question ("Paris: £90 or £100?")
  let t = c5Plain(o.title).replace(/[.?!]+$/, ''); if(!t) return '';
  const done = x => /^(calculate|work out|now it's your turn|now calculate)/i.test(x) ? x.charAt(0).toUpperCase() + x.slice(1) : null;
  t = t.replace(/^your turn:\s*/i, ''); if(done(t)) return done(t);
  if(t.includes(':') && !/^now it's your turn/i.test(t)) t = t.split(':').pop().trim(); if(done(t)) return done(t);
  t = t.replace(/^(the|your|add up the|add up)\s+/i, '');
  return 'Calculate the ' + t.charAt(0).toLowerCase() + t.slice(1);
}
const c5Sig0 = c1SignalHtml;
c1SignalHtml = function(o){
  if(!on5() || !o) return c5Sig0.apply(this, arguments);
  const n = o.n || c5N; c5N = null;
  // Finance's demonstrations carry no signal; a button the old example signal held (My turn ▶) goes in a bare holder
  if(o.tag) return o.btn ? `<div class="c5-go" data-c1sig data-c5go><button class="bv-btn go" ${o.btn.attr}>${esc(o.btn.label).replace('▶', '&#9654;')}</button></div>` : '<aside class="c5-none" data-c1sig hidden></aside>';
  const paper = o.kind === 'paper', task = c5Task(o) || 'Calculate the answer';
  const ask = /\?$/.test(task), box = c1SumBox(n === null || n === undefined ? '?' : n);
  const line = paper ? `${esc(task)}${ask ? '' : '.'} Write ${box} beside it.` : ask ? `${esc(task)} Build it, then press ${c1Key('Enter')}.` : `${esc(task)}, then press ${c1Key('Enter')}.`;
  return `<aside class="c1-sig c5-sig ${paper ? 'paper' : 'build'} ptr-up" data-c1sig role="note" aria-label="${paper ? 'Work it out on paper' : 'Build the formula'}"><i class="c1-sig-ptr" aria-hidden="true"></i>
    <div class="c5-sig-m">${C1_ICO[paper ? 'paper' : 'build']}<b>${paper ? 'Work it out on paper' : 'Build the formula'}</b></div><p class="c5-sig-t">${line}</p>${o.btn ? `<div class="c1-sig-a"><button class="bv-btn go" ${o.btn.attr}>${esc(o.btn.label)}</button></div>` : ''}</aside>`;
};
window.__c5task = c5Task;

/* ---------- rule 5 · the box beside its cell, pointer touching, never on the cell or on anything he needs to read ----------
   Bertie, 5 Nov 2026: "they are in the way a little of the cell". Round 3 put every box right under its cell; on a narrow sheet
   that covered the rows below, the line under the sheet and its Give me a hint link, and could sit on the cell's own edge.
   Now the box tries its places in turn and takes the first that covers no figure, label, heading or link and stays inside
   the page: right of the cell (pointer on its left edge), under it, left of it, then above it. If none is clear, the one
   that covers least. There is always a gap between the box and the cell; the pointer bridges it. */
function c5Bounds(el){
  const P = (el.closest('.dp') || el.closest('.desk-page') || el.closest('section.ash') || screen()).getBoundingClientRect(), bar = screen().querySelector('.actbar, .deskbar');
  const B = bar ? bar.getBoundingClientRect().top : innerHeight; return { left:P.left, right:P.right, top:Math.max(0, P.top), bottom:Math.min(P.bottom, B) - 6 };
}
/* what a box must not cover: everything on the sheet with words or figures in it, the formula bar, the line under the sheet (its
   words and links, not its empty width), hints, other callouts */
function c5Obstacles(el, cellEl){
  const sec = cellEl.closest('section.ash') || cellEl.closest('.ash-gridw') || screen(), out = [];
  const add = x => { if(!x || x === cellEl || x === el || el.contains(x) || x.contains(el)) return; [...x.getClientRects()].forEach(r => { if(r.width > 1 && r.height > 1) out.push(r); }); };
  sec.querySelectorAll('.ash-grid > *').forEach(x => { if((x.textContent || '').trim()) add(x); });
  sec.querySelectorAll('.ash-fb, .ash-top, .ash-hints, .ash-how, .ash-co, .c1-done').forEach(add);
  sec.querySelectorAll('.ash-line').forEach(x => { try{ const rg = document.createRange(); rg.selectNodeContents(x); [...rg.getClientRects()].forEach(r => { if(r.width > 1 && r.height > 1) out.push(r); }); }catch(e){ add(x); } });
  screen().querySelectorAll('[data-c1sig], .c1-co').forEach(x => { if(x !== el && !x.contains(el)) add(x); });
  return out;
}
function c5Under(el, cellEl){
  if(!el || !cellEl) return; const host = el.offsetParent || el.parentElement; if(!host) return;
  el.style.position = 'absolute'; el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.width = ''; el.style.boxSizing = '';
  // on a small screen the sheet is scaled to fit (p4zx): everything is measured on screen, then turned into the host's own units
  const H0 = host.getBoundingClientRect(), k = host.offsetWidth ? H0.width / host.offsetWidth || 1 : 1, C = cellEl.getBoundingClientRect(), P = c5Bounds(el);
  const toX = x => (x - H0.left) / k - host.clientLeft + host.scrollLeft, toY = y => (y - H0.top) / k - host.clientTop + host.scrollTop;
  const W0 = el.offsetWidth * k, GAP = 11, PM = 16, obs = c5Obstacles(el, cellEl), midY = C.top + C.height / 2, midX = C.left + C.width / 2;
  const heightAt = W => { el.style.boxSizing = 'border-box'; el.style.width = (W / k) + 'px'; return el.offsetHeight * k; };
  const cover = R => obs.reduce((t, o) => t + Math.max(0, Math.min(R.r, o.right) - Math.max(R.l, o.left)) * Math.max(0, Math.min(R.b, o.bottom) - Math.max(R.t, o.top)), 0);
  const outside = R => Math.max(0, P.left + 4 - R.l) + Math.max(0, R.r - (P.right - 4)) + Math.max(0, P.top + 2 - R.t) + Math.max(0, R.b - P.bottom);
  const cands = [];
  // 1 · right of the cell, as narrow as 260px if that is all the room there is, the pointer at the cell's middle
  { const room = P.right - 4 - (C.right + GAP), W = Math.min(W0, room);
    if(W >= 260){ const Ht = heightAt(W); [0.5, 0.25, 0.75, PM / Ht, 1 - PM / Ht].forEach(f => { const t = midY - Ht * f; if(midY < t + PM - 0.5 || midY > t + Ht - PM + 0.5) return;
      cands.push({ side:'right', W, R:{ l:C.right + GAP, t, r:C.right + GAP + W, b:t + Ht } }); }); } }
  // 2 · under the cell (round 3's place), slid sideways but keeping the pointer over the cell
  // 3 · left of the cell; 4 · above the cell
  { const W = Math.min(W0, P.right - P.left - 8), Ht = heightAt(W);
    [midX - 34, C.left, C.right - W, midX - W / 2].forEach(l => { l = Math.max(P.left + 4, Math.min(l, P.right - 4 - W)); if(midX < l + 12 || midX > l + W - 12) return;
      cands.push({ side:'under', W, R:{ l, t:C.bottom + GAP, r:l + W, b:C.bottom + GAP + Ht } }); });
    const roomL = C.left - GAP - (P.left + 4), WL = Math.min(W0, roomL);
    if(WL >= 260){ const HL = heightAt(WL), t = Math.max(P.top + 2, Math.min(midY - HL / 2, midY - PM)); if(midY <= t + HL - PM) cands.push({ side:'left', W:WL, R:{ l:C.left - GAP - WL, t, r:C.left - GAP, b:t + HL } }); }
    [midX - 34, C.left, C.right - W].forEach(l => { l = Math.max(P.left + 4, Math.min(l, P.right - 4 - W)); if(midX < l + 12 || midX > l + W - 12) return;
      cands.push({ side:'above', W, R:{ l, t:C.top - GAP - Ht, r:l + W, b:C.top - GAP } }); }); }
  let best = null;
  cands.forEach((c, i) => { const bad = outside(c.R) * 10000 + cover(c.R); if(!best || bad < best.bad) best = Object.assign({ bad, i }, c); });
  if(!best) best = { side:'under', W:W0, R:{ l:Math.max(P.left + 4, midX - 34), t:C.bottom + GAP } };
  if(best.W === W0){ el.style.width = ''; el.style.boxSizing = ''; } else heightAt(best.W);
  el.style.left = Math.round(toX(best.R.l)) + 'px'; el.style.top = Math.round(toY(best.R.t)) + 'px';
  ['ptr-up', 'ptr-down', 'ptr-left', 'ptr-right'].forEach(k => el.classList.remove(k));
  el.classList.add({ right:'ptr-left', left:'ptr-right', under:'ptr-up', above:'ptr-down' }[best.side]);
  const ptr = el.querySelector('.c1-sig-ptr, .c1-sco-ptr');
  if(ptr){ ptr.style.left = ptr.style.top = ptr.style.right = ptr.style.bottom = '';
    if(best.side === 'right' || best.side === 'left') ptr.style.top = Math.round((midY - best.R.t) / k - 7) + 'px';
    else ptr.style.left = Math.round(Math.max(12, Math.min(best.W / k - 26, (midX - best.R.l) / k - 7))) + 'px'; }
  el.dataset.c5p = best.side;
}
/* re-place when the window changes size (the sheet's columns move) */
{ let c5T = 0; addEventListener('resize', () => { clearTimeout(c5T); c5T = setTimeout(() => { try{ if(on5()) c5PlaceAll(); }catch(e){} }, 120); }); }
window.__c5under = c5Under;
const c5Place0 = c1Place;
c1Place = function(el, cellEl, mode, box){ if(on5() && el && el.classList && el.classList.contains('c5-sig')) return c5Under(el, cellEl); return c5Place0.apply(this, arguments); };
/* every signal on screen goes under its own sum's cell (the review drew it in a column of its own) */
function c5PlaceAll(){
  screen().querySelectorAll('.c5-sig').forEach(sig => {
    const sec = sig.closest('[data-ash]'), sp = ashLive(); if(!sp || !sp.act) return;
    const grid = (sec && sec.getAttribute('data-ash') === sp.id ? sec : null) || document.querySelector(`[data-ash="${CSS.escape(sp.id)}"]`);
    const cell = grid && grid.querySelector(`.ash-c[data-ref="${sp.act.tgt}"]`); if(!cell) return;
    const gw = cell.closest('.ash-gridw') || cell.parentElement; if(sig.parentElement !== gw) gw.appendChild(sig);
    if(getComputedStyle(gw).position === 'static') gw.style.position = 'relative';
    c5Under(sig, cell); });
}

/* ---------- rule 1 · a callout is a title ---------- */
function c5Titles(){
  screen().querySelectorAll('.ash-co:not(.c5-keep), .c1-done').forEach(co => {
    if(co.classList.contains('c1-done')) return;
    const title = co.querySelector('.ash-cot'), ps = [...co.querySelectorAll(':scope > p, :scope > .h21-cob > p')];
    if(!ps.length){ co.classList.add('c5-row'); return; }
    const keep = p => /=/.test(p.textContent) || p.classList.contains('ash-cor');
    if(!title || !c5Plain(title.textContent)){ const first = ps.shift(); if(first){ const b = document.createElement('b'); b.className = 'ash-cot'; b.innerHTML = first.innerHTML; first.replaceWith(b); } }
    ps.forEach(p => { if(!keep(p)) p.remove(); });
    if(!co.querySelector(':scope > p, :scope > .h21-cob > p')) co.classList.add('c5-row');
  });
}

/* ---------- rule 6 · a right answer turns green (the last sum done on each sheet, while the next one is in the same row or none is open) ---------- */
let c5Sheets = [];
const c5Ash0 = ashHtml;
ashHtml = function(sp){ try{ if(on5() && sp && sp.id) c5Sheets.push(sp); }catch(e){} return c5Ash0.apply(this, arguments); };
function c5Greens(){
  const seen = new Set(); c5Sheets.forEach(sp => { if(seen.has(sp.id)) return; seen.add(sp.id);
    if(sp.c1 && ['pjob', 'pdemo'].includes(sp.c1.stage)) return;
    const done = (sp.sums || []).filter(s => s.done && s.tgt), last = done[done.length - 1]; if(!last) return;
    const act = sp.act; if(act && act.tgt && ashRef(act.tgt).r !== ashRef(last.tgt).r) return;
    const c = document.querySelector(`[data-ash="${CSS.escape(sp.id)}"] .ash-c[data-ref="${last.tgt}"]`); if(c) c.classList.add('c5-ok'); });
}

const c5Render0 = render;
render = function(){
  c5Sheets = [];
  const r = c5Render0.apply(this, arguments);
  try{ document.body.classList.toggle('c5', on5()); if(on5()){ c5Titles(); c5Greens(); c5PlaceAll(); requestAnimationFrame(() => { try{ c5PlaceAll(); }catch(e){} }); setTimeout(() => { try{ if(on5()) c5PlaceAll(); }catch(e){} }, 650); } }catch(e){ console.error(e); }
  return r;
};
/* ---------- review 2 Nov 2026 · Σ SUM by keyboard (WCAG 2.1.1): Enter or Space on the first cell of the range, then on the last, then Enter ---------- */
document.addEventListener('keydown', e => {
  if(!on5() || (e.key !== 'Enter' && e.key !== ' ')) return; const sp = typeof ashLive === 'function' ? ashLive() : null; if(!sp || !sp.act || !sp.act.sumKey) return;
  const st = ashSt(sp.id); if(!st.sigma || st.drag) return; const c = e.target && e.target.closest && e.target.closest('.ash-c[data-ref]'); if(!c) return;
  const ref = c.getAttribute('data-ref'), col = ashRef(sp.act.refs[0]).c; if(st.sumA && !st.sumOne && e.key === 'Enter') return;   // the range is set: this Enter checks it
  e.preventDefault(); e.stopImmediatePropagation();
  if(ashRef(ref).c !== col){ st.msg = (sp.act.sumWrongCol && sp.act.sumWrongCol(ref)) || `Use column ${col}: the cells this sum adds.`; st.q = true; render(); return; }
  if(st.sumA && st.sumOne){ st.sumB = ref; st.sumOne = false; } else { st.sumA = st.sumB = ref; st.sumOne = true; st.msg = ''; st.q = false; }
  render(); requestAnimationFrame(() => { const b = document.querySelector(`[data-ash="${CSS.escape(sp.id)}"] .ash-c[data-ref="${ref}"]`); if(b) b.focus(); });
}, true);
window.__c5 = { task:c5Task, under:c5Under, placeAll:c5PlaceAll, titles:c5Titles };
}
