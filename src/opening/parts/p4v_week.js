/* ==================================================================
   WORKBOOK v4.4 (D52–D55): the week-at-a-time opening
   Stage A here: the play mode, use-it-or-lose-it, the best-plan sweep (missed-profit line), the shop's "still to save".
   The week loop itself (Monday plan, the run on the board, the Sunday review) follows below.
   ================================================================== */
const WBS = () => (WORLD && WORLD.settings) || {};
/* chapter 1 is played a week at a time unless the teacher turns day-by-day play on */
function weekMode(){ const st = WBS(); if(st.openingPlayMode !== 'week') return false; const t = settings.teacherDayByDay; return !(t === undefined || t === null ? !!st.teacherDayByDay : t); }
function launchProg(){ return WORLD.rounds && WORLD.rounds[0] && WORLD.rounds[0].prog || 2; }
/* the beat's week phase in chapter 1: plan (Monday), run (Tuesday–Saturday) or review (Sunday) */
function weekPhaseOf(n){ const w = roundData(n === undefined ? S.round : n); return w.weekPhase || null; }

/* ---------- use-it-or-lose-it (D55) ---------- */
function neglectShare(route){ const N = S && S.neglect; return N && N[route.id] ? N[route.id] : 0; }
/* at a Sunday review: each open route's week on the pupil's planes; no service or under half full → a tenth more go to Red Kite; flown properly → recovers a twentieth */
function neglectUpdate(from, to){
  const st = WBS(), fromDay = st.neglectFromDay || 15; if(!(S.day >= fromDay) || !from) return [];
  const loss = st.neglectLossShare || 0.1, back = st.neglectRecoverShare || 0.05, lf = st.neglectLoadFactor || 0.5, lines = [];
  S.neglect = S.neglect || {};
  openRoutes(to).forEach(r => {
    let pax = 0, seats = 0; (S.history || []).forEach(h => { if(h.to < from || h.from > to) return; const x = h.routes && h.routes[r.id]; if(x){ pax += x.pax || 0; seats += x.seats || 0; } });
    const before = S.neglect[r.id] || 0, want = paxWant(r, fareOf(r.id));
    const neglected = !seats || pax < lf * seats;
    const after = neglected ? Math.min(0.6, Math.round((before + loss) * 100) / 100) : Math.max(0, Math.round((before - back) * 100) / 100);
    if(after === before && !neglected) return;
    S.neglect[r.id] = after; if(!after) delete S.neglect[r.id];
    const nowWant = paxWant(r, fareOf(r.id));
    if(neglected) lines.push({ route:r.id, text:`${r.city}: ${want} → ${nowWant}. ${!seats ? 'No service flew this week, so' : 'Under half full all week, so'} Red Kite is taking your passengers.`, bad:true });
    else if(before) lines.push({ route:r.id, text:`${r.city}: ${want} → ${nowWant}. Flown properly, some passengers are coming back.`, bad:false });
  });
  return lines;
}

/* ---------- the best plan available with the pupil's planes and open routes (the missed-profit line) ---------- */
/* Every service multiset of 1–4 open routes per aircraft, at each route's best fare for that aircraft, the model's default departure times; aircraft one after another, the second seeing what the first already carries. */
function bestFareFor(p, r){
  const F = r.fares || [r.basePrice]; let best = F[0], bv = -Infinity;
  F.forEach(f => { const pax = Math.min(p.seats, paxFor(r, f)), v = pax * f; if(v > bv){ bv = v; best = f; } });
  return best;
}
function multisets(items, k){ const out = []; const rec = (start, acc) => { if(acc.length === k){ out.push(acc.slice()); return; } for(let i = start; i < items.length; i++){ acc.push(items[i]); rec(i, acc); acc.pop(); } }; rec(0, []); return out; }
function bestPlanSweep(){
  return dryRun(() => {
    const maxT = WORLD.maxTrips || 4, routes = openRoutes(S.day), prices = Object.assign({}, S.prices);
    const pl = currentPlan(); pl.fleet.forEach(x => { x.sched = []; x.deps = null; });
    pl.prices = prices; let total = 0, label = [];
    pl.fleet.forEach((x, j) => {
      const p = planeById(x.planeId), can = routes.filter(r => planeCanFly(p, r)); if(!can.length) return;
      const fare = {}; can.forEach(r => { fare[r.id] = bestFareFor(p, r); });
      let best = { v: -Infinity, sched: [] };
      for(let k = 1; k <= maxT; k++) multisets(can.map(r => r.id), k).forEach(s => {
        const t = JSON.parse(JSON.stringify(pl)); t.fleet[j].sched = s; t.fleet[j].deps = null; [...new Set(s)].forEach(id => { t.prices[id] = fare[id]; });
        if(!withPlan(t, () => t.fleet.every(z => !z.sched.length || fitsFor(z)))) return;
        const v = planLines(t).v.profit; if(v > best.v) best = { v, sched:s, prices:t.prices };
      });
      if(best.v > -Infinity && best.sched.length){ x.sched = best.sched; Object.assign(pl.prices, best.prices); }
    });
    const L = planLines(pl);
    return { profit: Math.round(L.v.profit), plan: pl, label: planLabel(pl) };
  });
}
/* the three figures of the missed-profit line, for a week that has just run (actual = the week's profit, days = its length) */
function missedProfitLine(actualWeek, days){
  const best = bestPlanSweep(), bestWeek = best.profit * (days || 7), missed = Math.max(0, Math.round(bestWeek - actualWeek));
  return { yours: Math.round(actualWeek), best: Math.round(bestWeek), missed, bestPlan: best.label, bestDay: best.profit };
}

/* ---------- the shop: Buy waits until cash ≥ price + the reserve (D55) ---------- */
function avgDailyProfit(){ const L = ledger(), days = []; for(let d = S.day - 1; d >= 1 && days.length < 7; d--){ if(L.rev[d] !== undefined && L.rev[d] !== null) days.push((L.rev[d] || 0) - (L.cost[d] || 0)); }
  if(!days.length){ const h = S.history[S.history.length - 1]; return h ? (h.profit || 0) / Math.max(1, (h.to || h.from) - h.from + 1) : 0; } return days.reduce((a, b) => a + b, 0) / days.length; }
function saveUp(price){ const reserve = WORLD.cashReserve || 0, short = Math.max(0, Math.round(price + reserve - S.cash)), rate = avgDailyProfit();
  return { afford: short <= 0, short, reserve, rate: Math.round(rate), days: short > 0 && rate > 0 ? Math.ceil(short / rate) : null }; }
function saveUpText(o){ if(o.afford) return ''; return `${money(o.short)} still to save${o.days ? ` · about ${o.days} day${o.days === 1 ? '' : 's'} at your rate` : o.rate <= 0 ? ' · the airline is not making money yet' : ''}`; }
