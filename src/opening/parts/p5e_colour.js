
/* ==================================================================
   DAYS THAT GO UP AS WELL AS DOWN (D96, DailyColour sheet) and TIPS THAT CAN BE ACTED ON (D97). Fable's screens brief, 17 Oct 2026.
   DailyColour: small effects with a one-line reason on the day's row (a hen party clears the snack trolley, a school trip books
   twelve seats, a tailwind saves fuel). Fixed by date, so a replayed week replays the same way: on a row's weekday, in every
   Nth week, from week 2; at most one a day (the first in the sheet's order). Only flown days take them, never a projection or
   a dry run, so the plan's projected profit is unchanged and the week's result moves a little either way.
   D97: a tip shows only if the best plan that answers it gains at least tipGainGate a day; when every service is full and
   people are still turned away, the check says so (all_full_capacity: capacity or price) and the timing tips stay silent.
   ================================================================== */
{
const dcRows = () => WB.dailyColour || [];
const dcOn = () => WBS().dailyColour !== false && settings.dailyColour !== false && dcRows().length > 0;
const dcS = () => S.dcLog || (S.dcLog = {});
function dcFor0(d){
  if(!dcOn() || !d) return null; const w = weekNo(d); if(w < 2) return null;
  const wd = WDAY[calDate(d).getUTCDay()].slice(0, 3);
  return dcRows().find(c => c.weekday === wd && c.everyWeeks > 0 && w % c.everyWeeks === 0) || null;
}
/* D101 (Settings dailyColourLimit): at most two a week, never an item the week before had, never the same item twice in a week */
const dcWeekMemo = {};
function dcWeek(w){
  if(w < 2) return []; if(dcWeekMemo[w]) return dcWeekMemo[w];
  const prev = new Set(dcWeek(w - 1).map(x => x.c.id)), out = [];
  for(let d = (w - 1) * 7 + 1; d <= w * 7 && out.length < 2; d++){ const c = dcFor0(d); if(c && !prev.has(c.id) && !out.some(x => x.c.id === c.id)) out.push({ d, c }); }
  return (dcWeekMemo[w] = out);
}
/* no snack colours while there are no snacks (p5x_nosnacks.js, year one): a day whose colour only touches snack sales has no
   colour now. Nothing takes its place, so every other day plays as before, and the chain of weeks (dcWeek) is left as it was,
   so the weeks after year one pick exactly as before. */
function dcSkip(c, d){ return c && typeof nsSkipColour === 'function' && nsSkipColour(c, d) ? null : c; }
function dcFor(d){
  if(!d) return null; if(WBS().dailyColourLimit === undefined) return dcSkip(dcFor0(d), d);
  if(!dcOn()) return null; const x = dcWeek(weekNo(d)).find(z => z.d === d); return x ? dcSkip(x.c, d) : null;
}
const dcPct = (c, dflt) => { const m = /([+−-])\s*(\d+(?:\.\d+)?)\s*%/.exec(String(c.effect || '') + ' ' + String(c.size || '')); return m ? (m[1] === '+' ? 1 : -1) * +m[2] / 100 : dflt; };
const dcRange = (c, lo, hi) => { const m = /£\s*(\d+)\D+£\s*(\d+)/.exec(String(c.size || '')); return m ? [+m[1], +m[2]] : [lo, hi]; };
const dcBiz = id => { const r = routeById(id), a = r && r.arch; return a && a.businessShare !== undefined && a.businessShare !== null ? a.businessShare : 0.5; };
function dcPax(f, n){ f.sold = Math.max(0, Math.min(f.seats, f.sold + n)); f.revenue = f.sold * f.price; f.termCost = f.sold * termCharge(); }
const dcLine = (c, f) => String(c.line || c.id).replace(/\b\d\d:\d\d\b/, f ? fmtTime(f.dep) : '$&');
function dcLog(d, c, delta, f){ if(!delta) return; dcS()[d] = { id:c.id, line:dcLine(c, f), delta:Math.round(delta) }; }

/* only flown days: set while the game flies a day for real */
let dcLive = 0;
const dcWrap = f0 => function(){ dcLive++; try{ return f0.apply(this, arguments); } finally { dcLive--; } };
runDayQuick = dcWrap(runDayQuick); startFlight = dcWrap(startFlight); applyResults = dcWrap(applyResults);
const dcSim0 = simulateDays;
simulateDays = function(a, b){ if(QUIET) return dcSim0.apply(this, arguments); dcLive++; let out; try{ out = dcSim0.apply(this, arguments); } finally { dcLive--; }
  try{ const L = Object.keys(dcS()).map(Number).filter(d => d >= a && d <= b).sort((x, y) => x - y);   // a week or month: each day's line in the period's notes
    if(L.length && S.rnd && S.rnd.why) L.slice(0, 4).forEach(d => S.rnd.why.push({ ic:'✨', text:`${dateShort(d)}: ${dcS()[d].line}` })); }catch(e){}
  return out; };
const dcPF0 = planFlights;
planFlights = function(){
  const fl = dcPF0.apply(this, arguments);
  if(!dcLive || QUIET) return fl;
  try{ dcApply(fl, simDayNow()); }catch(e){}
  return fl;
};
function dcApply(fl, d){
  const c = dcFor(d); if(!c) return;
  const flown = fl.filter(f => !f.grounded && !f.cancelled && !f.noFuel); if(!flown.length) return;
  const spare = f => f.seats - f.sold, bySpare = xs => xs.slice().sort((a, b) => spare(b) - spare(a) || a.dep - b.dep);
  let delta = 0, at = null;
  if(c.id === 'school_group' || c.id === 'corporate_block'){
    const want = c.id === 'school_group' ? 12 : 8, pool = c.id === 'corporate_block' ? flown.filter(f => dcBiz(f.route) >= 0.5) : flown, f = bySpare(pool)[0];
    if(!f || spare(f) < Math.ceil(want / 3)) return; const n = Math.min(want, spare(f)); dcPax(f, n); delta = n * f.price; at = f;
  } else if(c.id === 'no_shows' || c.id === 'late_bus'){
    const n = c.id === 'no_shows' ? 3 : 2, f = c.id === 'no_shows' ? flown.slice().sort((a, b) => a.dep - b.dep).find(x => x.sold >= x.seats) : flown.slice().sort((a, b) => a.dep - b.dep).find(x => x.sold >= n);
    if(!f) return; dcPax(f, -n); delta = -n * f.price; at = f;
  } else if(c.id === 'quiet_day'){
    const k = Math.abs(dcPct(c, -0.04)); flown.forEach(f => { const n = Math.round(f.sold * k); if(n){ dcPax(f, -n); delta -= n * f.price; } });
  } else if(c.id === 'sunny_weekend'){
    const k = Math.abs(dcPct(c, 0.06)); flown.filter(f => dcBiz(f.route) < 0.5).forEach(f => { const n = Math.min(spare(f), Math.round(f.sold * k)); if(n > 0){ dcPax(f, n); delta += n * f.price; } });
  } else if(c.id === 'tailwind' || c.id === 'headwind'){
    const k = dcPct(c, c.id === 'tailwind' ? -0.08 : 0.06); let dl = 0;
    flown.forEach(f => { const L = Math.max(10, Math.round(f.fuelL * (1 + k) / 10) * 10); dl += L - f.fuelL; f.fuelL = L; });
    delta = -dl * fuelPrice();
  } else if(c.id === 'hen_party' || c.id === 'birthday_cake'){
    dcS()['p' + d] = { id:c.id, f:flown.slice().sort((a, b) => b.sold - a.sold || a.dep - b.dep)[0].dep }; return;   // the snacks are added in dayExtras
  } else return;   // a row the game has no effect for yet: nothing happens
  dcLog(d, c, delta, at);
}
/* the snack rows: a hen party doubles the busiest flight's snack sales; a birthday adds half again to the day's (within the sheet's £ range) */
const dcDE0 = dayExtras;
dayExtras = function(fl){
  const X = dcDE0.apply(this, arguments);
  if(!dcLive || QUIET) return X;
  try{ const d = simDayNow(), c = dcFor(d), p = dcS()['p' + d]; if(!c || !p || !X.obRev) return X;
    const pax = fl.filter(f => !f.grounded && !f.noFuel), tot = pax.reduce((t, f) => t + f.sold, 0), busy = pax.find(f => f.dep === p.f) || pax[0];
    const [lo, hi] = dcRange(c, c.id === 'hen_party' ? 45 : 20, c.id === 'hen_party' ? 120 : 60);
    const add = Math.round(clamp(c.id === 'hen_party' ? X.obRev * (busy ? busy.sold : 0) / Math.max(1, tot) : X.obRev * 0.5, lo, hi));
    X.obRev += add; if(busy && X.byRoute[busy.route]) X.byRoute[busy.route].obRev += add;
    delete dcS()['p' + d]; dcLog(d, c, add, busy);
  }catch(e){}
  return X;
};
/* the day's row carries the line: first among the day's notes, so the board and the review show it */
const dcAR0 = applyResults;
applyResults = function(){
  const r = dcAR0.apply(this, arguments);
  try{ const x = dcS()[S.day]; if(x && S.rnd && S.rnd.why && !S.rnd.why.some(w => w.dc)) S.rnd.why.unshift({ ic:'✨', text:x.line, dc:true }); }catch(e){}
  return r;
};
const dcRow0 = dayRowOf;
dayRowOf = function(h, rnd){
  const row = dcRow0.apply(this, arguments);
  try{ row.ev = ((rnd && rnd.why) || []).filter(w => w.ic === '⚠️').map(w => w.text).slice(0, 2); const x = dcS()[row.d]; if(x) row.dc = x; }catch(e){}
  return row;
};
window.__dcFor = dcFor;

/* ---------- D97: tips that can be acted on ---------- */
DS_ACT.all_full_capacity = ['compare', 'Compare aircraft'];
const d97Gate = () => { const v = +WBS().tipGainGate; return isNaN(v) ? 0 : v; };
/* every service at or above seatFillGood, and people still turned away */
function d97AllFull(L, pl){
  const good = +(WBS().seatFillGood || 0.8), sv = (L && L.services) || []; if(!sv.length) return null;
  if(pl && normPlan(pl).fleet.some(x => !x.sched.length)) return null;   // an idle plane is spare capacity: that tip comes first
  const full = sv.every(s => s.seats && s.sold / s.seats >= good), away = Math.round((L.nos !== undefined ? L.nos : 0) || 0);
  return full && away > 0 ? away : null;
}
const d97Tips0 = dsTips;
dsTips = function(pl, L, opts){
  let v = d97Tips0.apply(this, arguments);
  try{
    pl = normPlan(pl || currentPlan()); L = L || planLines(pl);
    const away = WBS().allFullCapacityTip !== false ? d97AllFull(L, pl) : null, gate = d97Gate();
    if(away){ const T = planTipTable().find(t => t.id === 'all_full_capacity') || (WB.planTips || []).find(t => t.id === 'all_full_capacity') || {};
      const msg = String(T.message || "Every seat is sold — {turnedAway} people a day want seats you don't have. The way to carry them is capacity (another plane, or a bigger one) or a higher fare.").replace('{turnedAway}', num(away));
      const top = v.find(h => h.id === 'turned_away') || {};
      const cap = { id:'all_full_capacity', priority:1, weight:9, stake:gate, text:msg, route:top.route || null, action:{ kind:'compare', label:'Compare aircraft' }, exps:dsExps('all_full_capacity') };
      const rest = v.filter(h => !['peak_unserved', 'service_weak', 'turned_away', 'all_full_capacity'].includes(h.id)), lose = rest.filter(h => h.id === 'plan_loses_money');
      v = lose.concat([cap], rest.filter(h => h.id !== 'plan_loses_money')); }   // a losing plan still leads with the loss
    // the gain gate: losses and the capacity observation always show; anything else only if acting on it gains enough a day
    if(gate > 0) v = v.filter(h => ['plan_loses_money', 'all_full_capacity', 'range_fail'].includes(h.id) || h.priority === 0 || (h.stake || 0) >= gate);
  }catch(e){}
  return v;
};
/* the review's seat-fill notes come from the same rules (planTipsFor in its actual mode): keep only the tips the check would show */
const d97PTF0 = planTipsFor;
planTipsFor = function(pl, L, opts){
  const hits = d97PTF0.apply(this, arguments);
  if(!(opts && opts.actual) || !d97Gate()) return hits;
  try{ const keep = dsTips(pl, L); return hits.filter(h => keep.some(k => k.id === h.id && (!h.route || !k.route || k.route === h.route)) || ['all_good', 'general_tradeoff'].includes(h.id)); }catch(e){ return hits; }
};
/* Compare aircraft opens the Fleet desk's comparison; the second button tests a fare */
const d97Do0 = dsDo;
dsDo = function(h, from){
  if(h && h.action && h.action.kind === 'compare'){ try{ (dsS().log = dsS().log || []).push({ day:S.day, what:'compare', from }); }catch(e){}
    UI.view = 'fleet'; render(); setTimeout(() => { const b = document.getElementById('fleetShop'); if(b && !b.disabled) b.click(); }, 60); return; }
  return d97Do0.apply(this, arguments);
};
const d97After0 = dsAfterPlan;
dsAfterPlan = function(){
  const r = d97After0.apply(this, arguments);
  try{ const row = screen().querySelector('[data-dstip="all_full_capacity"]'), act = row && row.querySelector('[data-dsact]');
    if(row && act && !row.querySelector('[data-dsfare]')){ act.insertAdjacentHTML('afterend', '<button class="btn ds-act2" data-dsfare="1">Test fare</button>');
      row.querySelector('[data-dsfare]').onclick = e => { e.stopPropagation(); const h = (UI.dsShown || []).find(x => x.id === 'all_full_capacity') || {}; const L = planLines(currentPlan()), rt = h.route || ((L.routes && Object.keys(L.routes)[0]) || null);
        dsDo(Object.assign({}, h, { route:rt, action:{ kind:'fare', label:'Test fare' } }), 'check'); }; } }catch(e){}
  return r;
};
}
