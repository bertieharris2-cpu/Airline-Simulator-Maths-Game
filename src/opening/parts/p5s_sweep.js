/* =====================================================================
   BATCH 2, SECTION 2 (Claude Design handover, 18 Oct 2026): Batch 1's rules for every sum, in year one.
   - The build-the-sum step stays where the game already used it: a sum type's Build level (mostly the first time it is
     met). Sums about fares are always worked out in the book (Bertie, 18 Oct). Elsewhere the sum shows as A × B, with the
     book step, at once: on the Work it out page and in the Studio's worth callout.
   - Every sum's number is the gold SUM n (the old blue badge goes), and every sum with an answer box says to work it out
     in the book, then type the answer.
   - The unknown is magenta: a "?" that stands for an answer still to come.
   - Figure tiles keep their labels on two lines (CSS).
   ===================================================================== */
const swOn = () => typeof yearOne === 'function' && yearOne();
/* a sum about fares: the fares table, or a row whose figures include a fare */
function swFareSum(t, col, row){
  if(t && t.stage === 'fare') return true;
  let ops = []; try{ ops = stackRows(t, col, row); }catch(e){}
  return ops.some(x => /fare/i.test(`${x.id} ${x.label || ''}`));
}
function swBookOnly(t, col, row){ return swOn() && (swFareSum(t, col, row) || !(row && row.tool && toolLevel(row.tool) === 'build')); }
const SW_BUILT = (id) => new RegExp(`<span class="bv-bok">&#10003; sum built · <button class="bv-link" id="${id}">change</button></span>`);
/* the Work it out page */
const swDock0 = sumDockHtmlPlanner;
sumDockHtmlPlanner = function(o){
  let book = false;
  try{ if(swOn() && paperOn()){ const Z = sumState(o.W, o.st);
    if(Z && Z.act && Z.col && Z.row && !Z.justDone && !Z.tut){ const B = bvState(paperCellKey(Z.act, Z.col, Z.row)); if(!B.built && !B.tokens.length && swBookOnly(Z.act, Z.col, Z.row)){ B.built = true; B.book = true; } book = !!B.book; } } }catch(e){}
  const h = swDock0.apply(this, arguments);
  return book ? h.replace(SW_BUILT('bvChange'), '') : h;
};
/* the test kit's plan follows: a book-only sum is typed straight away */
const swPlan0 = paperPlan;
paperPlan = function(){ const P = swPlan0.apply(this, arguments); try{ if(P && swOn()){ const t = currentTable(), a = t.active, col = t.cols.find(c => c.id === a.col), row = tRows(t).find(r => r.id === a.row); if(swBookOnly(t, col, row)) P.build = false; } }catch(e){} return P; };
/* the Studio's worth callout: a fare change goes straight to the book */
const swWorth0 = dsWorth;
dsWorth = function(){ const W = swWorth0.apply(this, arguments); if(W && W.cb && W.kind === 'fare' && swOn() && !W.cb.built && !W.cb.tokens.length){ W.cb.built = true; W.cb.book = true; } return W; };
const swWsc0 = bvWscHtml;
bvWscHtml = function(W){ const h = swWsc0.apply(this, arguments); return W && W.cb && W.cb.book ? h.replace(SW_BUILT('wsChange'), '') : h; };
/* every screen: the book line where a sum has an answer box but no note yet, and the magenta unknown */
function swSweep(root){
  const hint = root.querySelector('.actbar .ab-hint');
  if(hint && /Build each sum, then type the answer from your book\./.test(hint.innerHTML)) hint.innerHTML = hint.innerHTML.replace('Build each sum, then type the answer from your book.', root.querySelector('#pbChk') ? 'Build this sum, then type the answer from your book.' : 'Work out each sum in your book, then type the answer.');
  root.querySelectorAll('.sum-h').forEach(h => {
    const box = h.closest('.wk-sum, .fd-sign, .ft3-ins, .wc-work, .fs-sum, .ft-a, .rb-card, .ta-card, .sc-p1') || h.parentElement; if(!box) return;
    if(box.querySelector('.bv-book, .pq-book, .bv-bookln, .rv2-card') || !box.querySelector('input[inputmode], .answer input, .sc-in input')) return;
    h.insertAdjacentHTML('afterend', '<p class="bv-bookln">Work it out in your book, then type the answer.</p>');
  });
  root.querySelectorAll('b, strong, span, td, em, i').forEach(e => {
    if(e.children.length || e.classList.contains('bv-unknown') || e.classList.contains('sw-unk') || e.textContent.trim() !== '?' || e.closest('button, a, .bv-slot, .bk-hud')) return;
    e.classList.add('sw-unk');
  });
}
const swR0 = render;
render = function(){ const r = swR0.apply(this, arguments); try{ if(swOn()) swSweep(screen()); }catch(e){ console.warn('sweep:', e && e.message); } return r; };
