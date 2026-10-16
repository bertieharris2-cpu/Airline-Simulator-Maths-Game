
/* ==================================================================
   NIGHT OPS (16 Oct 2026): the style lab's look and motion, brought into the game. First the Operating Plan Studio
   and the sums (Bertie: "start with the plan and sums"). The styles are in p1_head_nightops.css, under html.no.
   Nothing here changes a figure, a step or the save code: it decorates what the game has drawn, after each render.
   - After every render, noDecorate() marks the new page (the ? to work out, a queried answer, the moving parts),
     then noSettle(): a moved flight glides from where it was, seat bars grow, a changed figure lights once.
   - A sum just confirmed: the result pops (green, or gold when Finance filled it in), a boarding pass prints with the
     stamp, and the answer flies into its cell in the figure sheet, which lights as it arrives. A notice says so, and
     a chime plays if the teacher has sound on.
   - Dragging a flight shows what the move would do before you let go: the game's own move worked out on a copy,
     and only the figures the plan summary already shows (never a figure the pupil has still to work out).
   - Reduced motion (the teacher's switch or the computer's setting): no movement; the state stays in colour and words.
   Everything is in one block, so no name here can clash with the rest of the game; shared functions are reassigned.
   ================================================================== */
{
document.documentElement.classList.add('no');
const NO_T0 = performance.now(), noPrev = {}, noFx = {};
const noRM = () => { try{ return reducedMotion(); }catch(e){ return false; } };
const noFxAdd = (key, cls, ms, delay) => { noFx[key] = { cls, t0:performance.now() + (delay || 0), ms }; };   // starts after delay, lasts ms
const noNum = t => { const m = String(t).replace(/[£,\s]/g, '').replace('−', '-').match(/-?\d+(\.\d+)?/); return m ? +m[0] : null; };
const noSnd = kind => { try{ if(typeof liveChime === 'function') liveChime(kind); }catch(e){} };
const noIcon = { check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>', info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', warn:'<path d="M12 3.5 21.5 20h-19z"/><path d="M12 10v4.5M12 17.5h.01"/>' };
const noSvg = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${noIcon[n] || noIcon.info}</svg>`;

/* ---------- notices: the game's toast, as a glass card with an icon and a colour for its kind ---------- */
const noToast0 = toast;
toast = function(msg, kind){
  noToast0(msg); const t = [...document.querySelectorAll('.toast')].pop(); if(!t) return;
  const k = kind || (/^(That|The |One aircraft|Every aircraft|No aircraft|Service \d)/.test(String(msg)) ? 'warn' : 'info');
  t.classList.add('no-t', k); t.insertAdjacentHTML('afterbegin', noSvg(k === 'warn' ? 'warn' : k === 'info' ? 'info' : 'check'));
};
const noNote = (msg, kind) => { try{ toast(msg, kind || 'ok'); }catch(e){} };

/* ---------- after each render: mark the page, then let it settle ---------- */
let noView = '', noLastDone = null, noMove = null;
const noRender0 = render;
render = function(){
  const r = noRender0.apply(this, arguments);
  try{ noAfter(); }catch(e){ /* decoration never stops the game */ }
  return r;
};
function noAfter(){
  const root = screen(); if(!root) return;
  const st = typeof step === 'function' ? step() : null, view = (UI.view || '') + '|' + (st ? st.t : '') + '|' + (S.overlay ? S.overlay.type : '');
  const main = root.querySelector('.shell-main');
  if(view !== noView && main && !noRM()) main.classList.add('no-in');
  noView = view;
  noDecorate(root);
  noSettle(root);
  if(UI.justDone && UI.justDone !== noLastDone){ noLastDone = UI.justDone; noSumDone(root, UI.justDone); }
  if(!UI.justDone) noLastDone = null;
}
/* the ? to work out is magenta (and breathes on the sum being worked on); a queried answer field turns amber */
function noDecorate(root){
  root.querySelectorAll('.pq .pq-big, .fd-sign .pq-big').forEach(p => { if(p.querySelector('.no-q')) return;
    const w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT); let last = null; while(w.nextNode()) if(w.currentNode.nodeValue.includes('?')) last = w.currentNode;
    if(!last) return; const v = last.nodeValue, at = v.lastIndexOf('?'), sp = document.createElement('span');
    sp.className = 'no-q' + (p.closest('.dock-sum') ? ' breathe' : ''); sp.textContent = '?';
    const after = last.splitText(at); after.nodeValue = after.nodeValue.slice(1); last.parentNode.insertBefore(sp, after); });
  const msg = root.querySelector('#ftMsg'), ans = root.querySelector('.sd-ans .answer');
  if(msg && ans) ans.classList.toggle('query', /^Query/.test(msg.textContent.trim()));
  // the Studio: the panel being worked in is lit, the figures carry keys so a change can light
  const tt = root.querySelector('.s2-tt'); if(tt) tt.classList.toggle('focus', !!root.querySelector('.s2-tt .ad-blk.on'));
  const rt = root.querySelector('.s2-routes'); if(rt) rt.classList.toggle('focus', !!(UI.s2 && UI.s2.route));
  root.querySelectorAll('.s2-sum .s2-si').forEach(si => { const l = si.querySelector('small'), b = si.querySelector('b'); if(!l || !b) return;
    const k = l.textContent.trim(); b.dataset.nov = 'sum:' + k; b.dataset.nogood = /filled|profit/i.test(k) ? 'up' : /empty|turned/i.test(k) ? 'down' : ''; });
  root.querySelectorAll('.s2-r[data-s2r]').forEach(r => { const id = r.dataset.s2r, bar = r.querySelector('.st-bf i'), pct = r.querySelector('.s2-fl b'), n = r.querySelectorAll('.s2-n');
    if(bar){ bar.dataset.nok = 'rf:' + id; } if(pct){ pct.dataset.nov = 'rp:' + id; pct.dataset.nogood = 'up'; } if(n[0]) n[0].dataset.nov = 'rd:' + id; if(n[1]) n[1].dataset.nov = 'rs:' + id; });
}
const noFlying = () => { try{ return step().t === 'fly'; }catch(e){ return false; } };   // while the week flies the cash changes with every landing: no flash then
function noSettle(root){
  const now = performance.now(), RM = noRM(), swaps = [];
  // seat bars grow from their last width
  root.querySelectorAll('[data-nok]').forEach(el => { const k = el.dataset.nok, to = el.style.width, was = noPrev['k:' + k];
    if(!RM && was !== undefined && was !== to){ el.style.width = was; swaps.push([el, 'width', to]); } noPrev['k:' + k] = to; });
  // the flight that was just moved glides from where it was (its time, the arrows, Earlier / Later, or a drag)
  if(noMove && !RM){ const el = root.querySelector('.s2-tt .ad-blk.on'); if(el && noMove.left !== undefined){ const to = el.style.left; el.style.left = noMove.left + '%'; swaps.push([el, 'left', to]); } }
  noMove = null;
  if(swaps.length){ root.offsetWidth; swaps.forEach(([el, p, to]) => { el.style[p] = to; }); }
  // a figure that changed lights once: green better, red worse, cyan just changed
  root.querySelectorAll('[data-nov]').forEach(el => { const k = el.dataset.nov, t = el.textContent.trim(), was = noPrev['v:' + k];
    if(was !== undefined && was !== t){ const a = noNum(was), b = noNum(t), g = el.dataset.nogood, up = a !== null && b !== null && b > a;
      noFxAdd('v:' + k, 'no-chg ' + (!g || a === null || b === null || a === b ? '' : up === (g === 'up') ? 'up' : 'dn'), 1100); }
    noPrev['v:' + k] = t; });
  // the cash in the header lights when it changes (its text is never touched)
  const cash = document.getElementById('cCash'); if(cash){ const t = cash.textContent; if(noPrev.cash !== undefined && noPrev.cash !== t && !RM && !noFlying()){ cash.classList.remove('no-chg'); void cash.offsetWidth; cash.classList.add('no-chg', noNum(t) > noNum(noPrev.cash) ? 'up' : 'dn'); } noPrev.cash = t; }
  if(RM) return;
  Object.keys(noFx).forEach(k => { const f = noFx[k], t = now - f.t0; if(t > f.ms){ delete noFx[k]; return; }
    const sel = k.startsWith('v:') ? `[data-nov="${k.slice(2).replace(/"/g, '\\"')}"]` : `[data-nofx="${k}"]`;
    root.querySelectorAll(sel).forEach(el => { f.cls.split(' ').filter(Boolean).forEach(c => el.classList.add(c)); el.style.animationDelay = `${Math.round(-t)}ms`; }); });
}

/* ---------- a sum just confirmed: CALCULATION → RESULT → THE FIGURE SHEET ---------- */
function noSumDone(root, jd){
  const dock = root.querySelector('.dock-sum'), card = dock && dock.querySelector('.pq.done'); if(!card) return;
  const big = card.querySelector('.pq-big'), stamp = card.querySelector('.stamp'), fin = !!(stamp && stamp.classList.contains('fin'));
  // the result: the figure after the last =
  let res = null; if(big && !big.querySelector('.no-res')){ const h = big.innerHTML, at = h.lastIndexOf('='); if(at > 0){ big.innerHTML = h.slice(0, at + 1) + ' <span class="no-res' + (fin ? ' fin' : '') + '">' + h.slice(at + 1).trim() + '</span>'; res = big.querySelector('.no-res'); } }
  const head = dock.querySelector('.sum-h'), n = head && head.querySelector('b') ? head.querySelector('b').textContent.replace(/\D/g, '') : '', what = head ? head.textContent.split('·').pop().trim() : '';
  const cell = root.querySelector(`.ft2[data-tbl="${jd.table}"] [data-cellv="${jd.cell}"]`) || root.querySelector(`[data-cellv="${jd.cell}"]`);
  const rowName = cell && cell.closest('tr') && cell.closest('tr').querySelector('th') ? cell.closest('tr').querySelector('th').textContent.replace("What's in this?", '').trim() : what;
  const val = res ? res.textContent.trim() : '';
  // the boarding pass, with the stamp moved onto it
  if(stamp && val){ const pass = document.createElement('div'); pass.className = 'no-pass' + (fin ? ' fin' : '');
    pass.innerHTML = `<div class="bp-m"><span class="bp-a">★ ${(S.airline && S.airline.name ? String(S.airline.name) : 'Airline').toUpperCase().replace(/[<>&]/g, '')} · BOARDING PASS</span><div class="bp-r"><span><small>Sum</small><b>${n || '—'}</b></span><span class="res"><small>${what.replace(/[<>&]/g, '')}</small><b>${val.replace(/[<>&]/g, '')}</b></span></div><span class="bp-to">✓ Into your figures: ${rowName.replace(/[<>&]/g, '')}</span></div><div class="bp-s"><small>Gate</small><b>SHEET</b><div class="bp-bar"></div></div>`;
    pass.appendChild(stamp); card.insertAdjacentElement('afterend', pass); if(!noRM()) pass.classList.add('pop'); }
  if(noRM()){ if(cell) cell.classList.add('no-arrive'); noNote(`Sum ${n} ${fin ? 'checked by Finance' : 'confirmed'}: ${val} → your figures`, fin ? 'au' : 'ok'); if(!fin) noSnd('good'); return; }
  if(res && !fin) res.classList.add('pop');
  if(!fin) noSnd('good');
  noNote(`Sum ${n} ${fin ? 'checked by Finance' : 'confirmed'}: <b>${val}</b> → your figures`.replace(/<\/?b>/g, ''), fin ? 'au' : 'ok');
  if(!res || !cell) return;
  cell.classList.add('no-await');   // the sheet's figure waits for the answer to arrive
  setTimeout(() => { if(!res.isConnected || !cell.isConnected){ cell.classList.remove('no-await'); return; }
    const a = res.getBoundingClientRect(), b = cell.getBoundingClientRect(), chip = document.createElement('div'), trail = document.createElement('div');
    chip.className = 'no-fly' + (fin ? ' fin' : ''); chip.textContent = val; document.body.appendChild(chip);
    const c = chip.getBoundingClientRect(), x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
    chip.style.left = (x0 - c.width / 2) + 'px'; chip.style.top = (y0 - c.height / 2) + 'px';
    trail.className = 'no-trail' + (fin ? ' fin' : ''); trail.style.left = x0 + 'px'; trail.style.top = y0 + 'px'; trail.style.width = Math.hypot(x1 - x0, y1 - y0) + 'px'; trail.style.setProperty('--r', `rotate(${Math.atan2(y1 - y0, x1 - x0)}rad)`); document.body.appendChild(trail);
    chip.getBoundingClientRect(); chip.style.transform = `translate(${x1 - x0}px,${y1 - y0}px) scale(.85)`;
    setTimeout(() => { chip.remove(); if(cell.isConnected){ cell.classList.remove('no-arrive', 'no-await'); void cell.offsetWidth; cell.classList.add('no-arrive'); } }, 720);
    setTimeout(() => trail.remove(), 1100); }, fin ? 250 : 520);
}

/* ---------- the Studio: a moved flight remembers where it was, so it can glide ---------- */
const noMoveService0 = moveService;
moveService = function(i, j, k, dep){
  try{ const el = screen().querySelector(`.s2-tt [data-tl="${i}|${j}|${k}"]`), lane = el && el.closest('.ad-lane');
    if(el && lane){ const a = el.getBoundingClientRect(), L = lane.getBoundingClientRect(); noMove = { left:100 * (a.left - L.left) / Math.max(1, L.width) }; } }catch(e){ noMove = null; }
  return noMoveService0.apply(this, arguments);
};
/* the move worked out on a copy: the game's own editPlan, with its commit and its notices held back */
function noTry(i, j, k, dep){
  const keepSet = setPlan, keepToast = toast, keepSel = UI.tlSel; let got = null;
  try{ setPlan = (ii, nx) => { got = nx; }; toast = () => {}; editPlan(i, 'depTo', k, dep, j); }catch(e){ got = null; }
  finally{ setPlan = keepSet; toast = keepToast; UI.tlSel = keepSel; }
  if(!got) return null;
  try{ const we = UI.s2 && UI.s2.dt === 'weekend' && flightDaysOn(); return we ? withDay(satOf(S.day || 1), () => planLines(got)) : planLines(got); }catch(e){ return null; }
}
const noFig = L => { const F = s2Fill(L.services || []); return { sold:F.sold, seats:F.seats, pct:F.pct, away:L.nos || 0, profit:L.v ? Math.round(L.v.profit) : null }; };
let noTipBase = null;
const noBindTimeline0 = bindTimeline;
bindTimeline = function(){
  noBindTimeline0.apply(this, arguments);
  const root = screen(); if(!root.querySelector('.s2-tt')) return;
  let tip = document.getElementById('noTip'); if(!tip){ tip = document.createElement('div'); tip.id = 'noTip'; document.body.appendChild(tip); }
  const profitShown = !root.querySelector('.s2-sum [data-sum="profit"]');
  root.querySelectorAll('.s2-tt .ad-blk[data-tl]').forEach(b => {
    b.addEventListener('pointermove', e => { const g = tlDrag; if(!g || g.b !== b || !g.moved) return;
      const [i, j, k] = b.getAttribute('data-tl').split('|').map(Number), dep = clamp(g.dep0 + g.dm, g.s0, g.s0 + g.span - g.trip);
      tip.style.left = Math.min(innerWidth - 330, e.clientX + 16) + 'px'; tip.style.top = Math.max(8, e.clientY - 86) + 'px'; tip.classList.add('on');
      if(g.noDep === dep) return; g.noDep = dep;
      if(!noTipBase){ try{ const we = UI.s2 && UI.s2.dt === 'weekend' && flightDaysOn(), pl = currentPlan(); noTipBase = noFig(we ? withDay(satOf(S.day || 1), () => planLines(pl)) : planLines(pl)); }catch(err){ noTipBase = null; } }
      const clash = b.classList.contains('clash'), L = clash ? null : noTry(i, j, k, dep), F = L ? noFig(L) : null, B = noTipBase;
      const d = (x, y, good) => x === y ? '<span class="sf">no change</span>' : `<span class="${(y > x) === good ? 'up' : 'dn'}">${y > x ? '▲' : '▼'} ${num(Math.abs(y - x))}</span>`;
      tip.innerHTML = clash ? `<b>${fmtTime(dep)}</b><br><span class="wa">⚠ It would overlap another flight on this aircraft.</span>`
        : !F || !B ? `<b>${fmtTime(dep)}</b> <span class="sf">· let go to move it here</span>`
        : `<b>Leaves ${fmtTime(dep)}</b><br>Seats filled ${num(F.sold)} / ${num(F.seats)} ${d(B.sold, F.sold, true)}<br>Turned away ${num(F.away)} ${d(B.away, F.away, false)}${profitShown && F.profit !== null && B.profit !== null ? `<br>Projected profit ${money(F.profit)} ${F.profit === B.profit ? '<span class="sf">no change</span>' : `<span class="${F.profit > B.profit ? 'up' : 'dn'}">${F.profit > B.profit ? '▲' : '▼'} ${money(Math.abs(F.profit - B.profit))}</span>`}` : ''}`; });
    const off = () => { tip.classList.remove('on'); noTipBase = null; };
    b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off);
  });
};
}
