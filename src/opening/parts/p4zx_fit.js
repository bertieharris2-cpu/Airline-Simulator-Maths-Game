/* ---------- Layout fixes from the overlap run-through (16 Oct 2026) ----------
   Bertie: "some of the text is overlapping each other on various screens". An overlap scanner was run through Launch Day,
   the weeks, chapters 2–4, the desks and the wall at 1366 × 768, 1897 × 991 and 1920 × 1080; this part holds the fixes
   that need code (the rest are CSS at the end of p1_head_studio2.css). Reassignment only (overrides.txt stays at 120). */

/* map labels and flags: a city's name or flag over another's. After each draw the markers are taken in order of importance
   (the routes flown, then the home base, then cities on offer): a label that would sit on one already kept is hidden, and a
   city on offer whose flag would sit on one already kept shows its dot only. The routes flown always keep their flags. */
function fitMapLabels(root){
  const marks = root.querySelector('.mmarks'); if(!marks) return;
  const rank = g => { const c = g.getAttribute('class') || ''; return /\bdim\b/.test(c) ? 4 : /\bhome\b/.test(c) ? 2 : /\b(opp|offer)\b/.test(c) ? 3 : 1; };
  const box = e => { const b = e.getBoundingClientRect(); return { l:b.left, t:b.top, r:b.right, b:b.bottom }; }, hit = (a, b) => a.l < b.r - 1 && b.l < a.r - 1 && a.t < b.b - 1 && b.t < a.b - 1;
  const items = [...marks.querySelectorAll(':scope > g.marker')].map((g, i) => { g.classList.remove('mk-min'); const t = g.querySelector('text.lbl'); if(t) t.classList.remove('lbl-off');
    return { g, i, r:rank(g), t, f:g.querySelector('rect.frame') || g.querySelector('polygon') }; }).sort((a, b) => a.r - b.r || a.i - b.i);
  const sb = box(root.querySelector('svg')), inside = b => b.l >= sb.l - 1 && b.r <= sb.r + 1 && b.t >= sb.t - 1 && b.b <= sb.b + 1;
  const kept = [], label = (x, fb) => { if(!x.t || !x.t.textContent) return; const lb = box(x.t); if(!inside(lb) || kept.some(k => k !== fb && hit(lb, k))) x.t.classList.add('lbl-off'); else kept.push(lb); };
  // the routes flown and the home base keep their flags; their names go where no flag is; then the cities on offer, if they fit
  const main = items.filter(x => x.r <= 2), rest = items.filter(x => x.r > 2);
  main.forEach(x => { x.fb = x.f ? box(x.f) : null; if(x.fb) kept.push(x.fb); });
  main.forEach(x => label(x, x.fb));
  rest.forEach(x => { const fb = x.f ? box(x.f) : null; if(fb && kept.some(k => hit(fb, k))){ x.g.classList.add('mk-min'); return; } if(fb) kept.push(fb); label(x, fb); });
}
const fitMakeMap0 = makeMap;
makeMap = function(root, o){
  const M = fitMakeMap0(root, o), r0 = M.render;
  M.render = function(){ const out = r0.apply(this, arguments); try{ fitMapLabels(root); }catch(e){} return out; };
  return M;
};
