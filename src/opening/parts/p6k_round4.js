/* =====================================================================
   ROUND 4 (Bertie, 2 Nov 2026): consequences for a pupil who coasts on one plan while new routes open. Chapter one only (ch1()).
   The two Sunday graphs are Claude Design's (hand-off "the Sunday graphs, round 4"); this part is the game side:
     1 · A RIVAL TAKES AN IGNORED ROUTE: a route that opened after Launch Day and that he has not flown for rivalIgnoreWeeks
         (3) weeks while one of his planes could reach it: Red Kite takes it over from the Monday and takes rivalTakesShare
         (about a third) of its passengers, for good. The old weekly drop for unflown routes (neglect, and the Sunday review's
         "Red Kite flies them for now" chance line in DESIGN.md) carries on as before; the rival comes on top.
     2 · REPUTATION DIPS, CAREFULLY: the stars' "turned away 1 in 3, two weeks running" rule only counts in a week when his
         planes had spare time for at least one more flight of that route (Bertie: one small airline can't carry everyone).
     3 · THE BOARD HAS A WORD, GENTLY: the gap between his week and the best plan with his planes is at least boardGapShare
         (10%) of the best for boardGapWeeks (3) weeks running: c6Board decides; p6l shows it as Monday's news card. No fine.
   Every setting is a PLACEHOLDER (tools/merge_r4.py, docs/Placeholders-for-Fable.md).
   ===================================================================== */
{
const on6 = () => typeof ch1 === 'function' && ch1();
const SET = () => (typeof WBS === 'function' ? WBS() : {}) || {};
const num6 = (k, d) => { const v = +SET()[k]; return v > 0 ? v : d; };
const X6 = () => { S.c6 = S.c6 || {}; S.c6.rival = S.c6.rival || {}; S.c6.gap = S.c6.gap || {}; S.c6.done = S.c6.done || {}; return S.c6; };
const flownOn = (id, d) => (S.history || []).some(h => h.from <= d && h.to >= d && h.routes && h.routes[id] && (h.routes[id].seats || 0) > 0);
const lastFlown = (id, upto) => { let L = 0; (S.history || []).forEach(h => { if(h.from <= upto && h.routes && h.routes[id] && (h.routes[id].seats || 0) > 0) L = Math.max(L, Math.min(h.to, upto)); }); return L; };
const canFrom = r => { let d = null; (S.fleet || []).forEach(f => { const p = planeById(f.planeId); if(p && planeCanFly(p, r)) d = Math.min(d === null ? Infinity : d, f.acquired || 1); }); return d; };   // the first day one of his planes could fly it
const openedOn = (r, upto) => { for(let d = 1; d <= upto; d++) if(routeOpen(r, d)) return d; return null; };

/* ---------- 1 · the rival ---------- */
function c6RivalCheck(to){
  const Y = X6(), wks = num6('rivalIgnoreWeeks', 3), share = Math.min(0.9, num6('rivalTakesShare', 0.33)), out = [];
  openRoutes(to).forEach(r => { if(Y.rival[r.id]) return; const o = openedOn(r, to); if(!o || o <= 1) return;   // Launch Day's routes are his from the start
    const can = canFrom(r); if(!can) return;   // none of his planes can reach it yet: he isn't ignoring it
    const idleFrom = Math.max(o, can, lastFlown(r.id, to) + 1); if(to - idleFrom + 1 < 7 * wks) return;
    Y.rival[r.id] = { day:to + 1, share };
    out.push({ route:r.id, text:tx6('rival.news', { city:r.city }, `Red Kite takes over ${r.city} from Monday. About a third of its passengers will fly with them for good.`), bad:true, c6:true });
    try{ rec().pend.events.push({ day:to, title:'Rival', choice:`Red Kite took ${r.city} (not flown for ${wks} weeks)`, cost:0 }); }catch(e){} });
  return out;
}
const tx6 = (id, v, d) => { try{ const t = h21Text(id, v).text[0]; return t || d; }catch(e){ return d; } };
const c6NS0 = neglectShare;
neglectShare = function(route){ const n = c6NS0.apply(this, arguments); if(!on6() || !route || !S || !S.c6 || !S.c6.rival) return n; const R = S.c6.rival[route.id];
  return R && (S.day || 1) >= R.day ? Math.min(0.9, n + R.share) : n; };
const c6NU0 = neglectUpdate;
neglectUpdate = function(from, to){
  const L = c6NU0.apply(this, arguments) || []; if(!on6()) return L;
  if(to && !X6().done['r' + to]){ X6().done['r' + to] = 1; L.push(...c6RivalCheck(to)); }   // the review shows these lines; in weekly play p4zc turns them into news
  return L;
};

/* ---------- 2 · reputation: turned away counts only when he could have flown more ---------- */
function c6Spare(id, k){
  try{ const r = routeById(id), pl = normPlan(currentPlan()), span = dayEnd() - dayStart();
    return (pl.fleet || []).some(x => { const p = planeById(x.planeId); if(!p || !planeCanFly(p, r)) return false;
      const used = (x.sched || []).reduce((t, rid) => t + TIME.roundTrip(p, routeById(rid)) + TIME.home(p), 0);
      return span - used >= TIME.roundTrip(p, r); });
  }catch(e){ return true; }
}
window.__c6taOk = (id, k) => !on6() || /^(no|off)$/i.test(String(SET().starsTurnedAwayNeedsSpare || '').trim()) || c6Spare(id, k);

/* ---------- 3 · the Board ---------- */
function c6Gap(from){
  const Y = X6(); if(Y.gap[from]) return Y.gap[from];
  const h = (S.history || []).filter(x => x.from >= from && x.to <= from + 6), profit = h.reduce((t, x) => t + (x.profit || 0), 0);
  if(!h.length || !h.some(x => x.to >= from + 6)) return null;   // the whole week has flown
  let M = S.wk && S.wk.from === from && S.wk.missed ? S.wk.missed : null; try{ M = M || missedProfitLine(profit, 7, from); }catch(e){ return null; }
  return (Y.gap[from] = { yours:M.yours, best:M.best, missed:M.missed });
}
function c6Board(){
  const Y = X6(), wk = weekNo(S.day || 1), n = num6('boardGapWeeks', 3), sh = num6('boardGapShare', 0.1); if(Y.board && Y.board.wk === wk) return Y.board;
  if(wk <= n || (Y.lastBoard && wk - Y.lastBoard <= n)) return null;
  const G = []; for(let i = 1; i <= n; i++){ const from = 7 * (wk - i) - 6; if(from < 1) return null; const g = c6Gap(from); if(!g || !(g.best > 0) || g.missed / g.best < sh) return null; G.push(g); }
  Y.lastBoard = wk; Y.board = { wk, last:G[0] };
  try{ rec().pend.events.push({ day:S.day, title:'Board', choice:`The Board's note: ${n} weeks at least ${Math.round(sh * 100)}% below the best plan`, cost:0 }); }catch(e){}
  return Y.board;
}
const c6Op0 = s2Opener;
s2Opener = function(pl, L, hid, changed){
  if(on6()){ try{ const to = 7 * (weekNo(S.day || 1) - 1); if(to >= 7 && !X6().done['r' + to]){ X6().done['r' + to] = 1; const L = c6RivalCheck(to); if(L.length) addNews(L.map(l => ({ tag:'RIVAL', text:l.text, cls:'warn' }))); } }catch(e){ console.error(e); } }   // weeks with no Sunday review
  return c6Op0.apply(this, arguments);   // the Board's note and Red Kite's news are Monday's news cards now (p6l, round 4 graphs)
};
window.__c6 = { rivalCheck:c6RivalCheck, gap:c6Gap, board:c6Board, spare:c6Spare };
}
