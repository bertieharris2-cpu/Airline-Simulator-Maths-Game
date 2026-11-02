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

/* ---------- rule 5 · under the cell, pointer touching; sideways to stay in the panel; above the cell only if there is no room below ---------- */
function c5Bounds(el){
  const P = (el.closest('.dp') || el.closest('.desk-page') || el.closest('section.ash') || screen()).getBoundingClientRect(), bar = screen().querySelector('.actbar, .deskbar');
  const B = bar ? bar.getBoundingClientRect().top : innerHeight; return { left:P.left, right:P.right, bottom:Math.min(P.bottom, B) - 6 };
}
function c5Under(el, cellEl){
  if(!el || !cellEl) return; const host = el.offsetParent || el.parentElement; if(!host) return;
  el.style.position = 'absolute'; el.style.right = 'auto'; el.style.bottom = 'auto';
  const H0 = host.getBoundingClientRect(), H = { left:H0.left + host.clientLeft - host.scrollLeft, top:H0.top + host.clientTop - host.scrollTop }, C = cellEl.getBoundingClientRect(), W = el.offsetWidth, Ht = el.offsetHeight, P = c5Bounds(el);
  let left = C.left + C.width / 2 - 34; left = Math.max(P.left + 8, Math.min(left, P.right - W - 8));
  let top = C.bottom + 10, up = false; if(top + Ht > P.bottom && C.top - Ht - 10 > 0){ top = C.top - Ht - 10; up = true; }
  el.style.left = Math.round(left - H.left) + 'px'; el.style.top = Math.round(top - H.top) + 'px';
  el.classList.toggle('ptr-down', up); el.classList.toggle('ptr-up', !up);
  const ptr = el.querySelector('.c1-sig-ptr, .c1-sco-ptr'); if(ptr){ ptr.style.left = Math.round(Math.max(12, Math.min(W - 26, C.left + C.width / 2 - left - 7))) + 'px'; }
  el.dataset.c5p = '1';
}
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
