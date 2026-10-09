/* ==================================================================
   OLD SAVE CODES
   A pupil's code from an earlier version loads and lands at the nearest point in the current flow:
   - the 7–8 Oct prototype (v5, planner / cost sheet / Test steps): repaired in place, landing at the day's planning page
   - the 5–6 Oct prototype (v4, the May 2030 calendar) and the full game (v4): the airline, cash, fleet, prices and
     history are carried into a fresh state and the matching day starts again (needsRestart → landSave)
   Everything changed is listed in S.migrated.notes for the teacher panel; the Home screen says where the pupil carries on.
   ================================================================== */
const MIG_STEP_WORDS = { hq:'HQ', intro:'briefing', shop2:'showroom', event:'event card', plan:'planning page', workings:'workings page', fuelPlan:'fuel order', ready:'Ready to fly', fly:'flight', results:'results', code:'flight-code screen', logo:'logo screen', paint:'paint shop', planner:'planner', costPlan:'cost sheet', testIdeas:'Test screen', review:'review', sim:'week', plans:'plans' };
function migNote(s, text){ s.migrated = s.migrated || { notes:[] }; (s.migrated.notes = s.migrated.notes || []).push(text); }
function migFind(a, t){ return a.findIndex(x => x.t === t); }
function withState(s, fn){ const S0 = S; S = s; try{ return fn(); } finally{ S = S0; } }
/* colours: an old hex colour becomes the nearest palette colour */
function hexRgb(h){ const m = /^#?([0-9a-f]{6})$/i.exec(String(h || '').trim()); if(!m) return null; const n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function nearestColour(hex, not){ const c = hexRgb(hex); if(!c || !PAL.length) return null; let best = null, bd = Infinity;
  PAL.forEach(p => { if(p.id === not) return; const q = hexRgb(p.hex); if(!q) return; const d = (c[0]-q[0])**2 + (c[1]-q[1])**2 + (c[2]-q[2])**2; if(d < bd){ bd = d; best = p.id; } }); return best; }
function colourId(v, not){ if(!v) return null; if(PAL.some(c => c.id === v)) return v === not ? null : v; return nearestColour(v, not); }
function nearestFare(r, fare){ const fs = (r && r.fares) || []; if(!fs.length || fs.includes(fare)) return fare; return fs.reduce((b, f) => Math.abs(f - fare) < Math.abs(b - fare) ? f : b, fs[0]); }
function fixPrices(s){ Object.keys(s.prices || {}).forEach(id => { const r = routeById(id); if(!r){ delete s.prices[id]; return; } const v = nearestFare(r, +s.prices[id]);
  if(v !== +s.prices[id]){ migNote(s, `${r.city} fare ${money(+s.prices[id])} is not one of the fares on offer now: set to ${money(v)}.`); s.prices[id] = v; } }); }
function fixIdentity(s){ const A = s.airline; if(!A) return; if(!A.flightCode) A.flightCode = A.code || '';
  if(A.logo) return; const g = defaultLogo(), c1 = colourId(A.c1), c2 = colourId(A.c2, c1 || g.c1);   // two different colours, the nearest to the old ones
  if(c1) g.c1 = c1; if(c2) g.c2 = c2; if(g.c1 === g.c2) g.c2 = g.c1 === 'navy' ? 'yellow' : 'navy';
  if(A.fin && LIV.tails.some(t => t.id === A.fin)) g.symbol = A.fin;
  A.logo = g; migNote(s, `The logo and livery were made from the old colours (${g.c1} and ${g.c2}); they can be changed in Your airline → the paint shop.`); }
/* the day's typed work is done again on the workings page, so the old cost sheet and its results go */
function clearDayWork(s){ const R = s.rnd; if(!R) return; Object.keys(R.tables || {}).forEach(k => { if(/^(cost|empty|time|fuelbill|work|tenths):/.test(k)) delete R.tables[k]; });
  ['activeTable', 'costed', 'costedTools', 'myForecast', 'archive', 'archived', 'ideas', 'test', 'returnTo', 'handSums', 'autoDone', 'pick', 'forecast', 'fuelOrder'].forEach(k => { delete R[k]; }); R.activeTable = null;
  if(R.fuelBought){ const fb = R.fuelBought; s.cash = r2(s.cash + (fb.total || 0)); s.fuel = Math.max(0, r2((s.fuel || 0) - (fb.litres || 0))); s.fuelValue = Math.max(0, r2((s.fuelValue || 0) - (fb.total || 0)));
    if(Array.isArray(s.fuelLots) && s.fuelLots.length) s.fuelLots.pop(); delete R.fuelBought; delete R.fuelOrder; migNote(s, `The day's fuel order (${money(fb.total || 0)}) was refunded; it is ordered again on the way to Ready.`); } }
/* the Red Kite advertising choice from an older save still halves the switching share while the event lasts */
function carryRivalAd(s){ if(s.rivalAd || !s.flags) return;
  Object.keys(s.flags).forEach(id => { for(let k = 1; k < WORLD.rounds.length; k++){ const ev = (WORLD.rounds[k] || {}).event; if(!ev || ev.id !== id || !ev.advertiseCost) continue;
    const opt = (ev.options || [])[s.flags[id]], e = opt && opt.effects || {}; if(!(e.cash && Math.abs(e.cash) === ev.advertiseCost)) return;
    const until = beatDay(k) + ((ev.durationDays || 1) - 1); if(s.day <= until){ s.rivalAd = { event:ev.id, routes:(ev.affectsRoutes && ev.affectsRoutes.length ? ev.affectsRoutes : [s.market]), untilDay:until }; migNote(s, `${ev.title}: the advertising still counts until ${dateShort(until)}.`); } return; } }); }
const OLD_DAY_STEPS = ['timetable', 'fareTry', 'costPlan', 'testIdeas', 'workout', 'fin', 'options', 'dayForecast'];
function oldStepList(s){ return (s.steps || []).some(x => OLD_DAY_STEPS.includes(x.t) || (x.t === 'planner' && s.phase === 'round' && s.period && s.period.type === 'day')); }
/* ---- v5: the 7–8 Oct prototype ---- */
function repairV5(s){
  if(!oldStepList(s) || !s.airline) return s;
  const cur = s.steps[s.si] ? s.steps[s.si].t : null, hadLogo = !!s.airline.logo;
  s.migrated = { from:'proto-v5', savedDay:s.day, savedStep:cur, notes:[], fresh:true };
  s.overlay = null; fixPrices(s); fixIdentity(s); s.rnd = s.rnd || emptyRnd(); if(s.rnd.cashStart === undefined) s.rnd.cashStart = s.cash;
  const MAP = { fin:'paint', timetable:'plan', fareTry:'plan', planner:'plan', testIdeas:'plan', workout:'plan', costPlan:'workings', options:'plan', dayForecast:'plan', sim:'fly' };
  if(s.phase === 'setup'){
    let steps = newState().steps, to = MAP[cur] || cur; if(migFind(steps, to) < 0) to = 'plan';
    const ID = ['code', 'logo', 'paint', 'reveal', 'cert'];
    if(!hadLogo && migFind(steps, 'name') < migFind(steps, to) && !ID.includes(to)){ const id = steps.filter(x => ID.includes(x.t)); steps = steps.filter(x => !ID.includes(x.t)); steps.splice(migFind(steps, to), 0, ...id); migNote(s, 'The flight code, logo and paint shop come next, then the day carries on where it was.'); to = 'code'; }
    clearDayWork(s); s.steps = steps; s.si = Math.max(0, migFind(steps, to)); s.migrated.landedStep = to; s.migrated.landedDay = s.day; return s;
  }
  if(s.period && s.period.type === 'day'){
    const w = roundData(s.round); if(s.rnd.event && s.rnd.eventChoice === undefined && w.event) s.rnd.event = JSON.parse(JSON.stringify(w.event));   // the card gets today's numbers
    let to = ['hq', 'intro', 'shop2', 'event'].includes(cur) ? cur : (cur === 'results' && s.rnd.applied ? 'results' : 'plan');
    if(to !== 'results') clearDayWork(s);
    const steps = withState(s, () => daySteps(s.round, w)); s.steps = steps; let i = migFind(steps, to); if(i < 0) i = migFind(steps, 'plan'); s.si = Math.max(0, i);
    carryRivalAd(s); withState(s, refreshPlan); s.migrated.landedStep = steps[s.si].t; s.migrated.landedDay = s.day; return s;
  }
  s.migrated.landedStep = cur; s.migrated.landedDay = s.day; return s;   // weeks and months kept their steps
}
/* ---- v2–v4: the 5–6 Oct prototype (May 2030 calendar) or the full game ---- */
function isFullGame(s){ return ['cwl', 'sws', 'brs'].includes(s.home) || (s.market === undefined && s.toolSeen === undefined && s.deps === undefined); }
function convertOld(s, from){
  const t = newState(); t.migrated = { from, savedDay:s.day, savedStep:s.steps && s.steps[s.si] ? s.steps[s.si].t : null, notes:[], fresh:true };
  const A = s.airline || {}; Object.assign(t.airline, { name:A.name || '', code:A.code || airlineCode(A.name || 'AS'), flightCode:A.flightCode || A.code || '', strategy:A.strategy || null, c1:A.c1 || t.airline.c1, c2:A.c2 || t.airline.c2, fin:A.fin || 'stripe', logo:A.logo || null });
  fixIdentity(t); t.textSize = s.textSize || 0; t.startedAt = s.startedAt || t.startedAt; t.teacherQueue = s.teacherQueue || t.teacherQueue;
  if(s.phase === 'setup' || !(s.fleet && s.fleet.length)){ t.si = t.airline.name ? migFind(t.steps, 'code') : 0; t.migrated.landedStep = t.steps[t.si].t; t.migrated.landedDay = 1; migNote(t, 'The airline had not flown yet: launch day starts again with its name kept.'); return t; }
  // the calendar: launch day was day 0, it is day 1 now
  const oldDay = s.period && s.period.from !== undefined && s.period.from !== null ? s.period.from : (s.day || 0), lastDay = beatDay(WORLD.rounds.length - 1), D = Math.max(2, Math.min(oldDay + 1, lastDay));
  let b = beatStartingOn(D); if(b === null){ b = 0; for(let k = 1; k < WORLD.rounds.length; k++) if(beatDay(k) <= D) b = k; }
  t.cash = r2(s.cash || 0); t.rep = s.rep === undefined ? t.rep : s.rep; t.fuel = r2(s.fuel || 0); t.fuelValue = r2(s.fuelValue || 0); t.fuelLots = Array.isArray(s.fuelLots) ? s.fuelLots : []; t.fuelDiscount = 0;
  t.home = WORLD.homes.some(h => h.id === s.home) ? s.home : WORLD.homes[0].id; if(t.home !== s.home) migNote(t, `Home airport ${String(s.home || '').toUpperCase()} is not in this version: the airline flies from ${(WORLD.homes[0].name || 'London Heathrow')}.`);
  t.terminal = s.terminal || 't5';
  const openOn = id => { const r = routeById(id); return !!r && (r.openDay || 1) <= D && !!(r.demandAtFare || !r.wb); };
  const seen = new Set(); t.fleet = (s.fleet || []).map(f => { const p = planeById(f.planeId), planeId = p ? f.planeId : 'dhc6'; if(!p) migNote(t, `Aircraft ${f.planeId} is not in this version: a Twin Otter takes its place.`);
    const all = Array.isArray(f.schedule) && f.schedule.length ? f.schedule : (f.route ? [f.route] : []), sched = all.filter(openOn), dropped = all.filter(id => !openOn(id));
    if(dropped.length) migNote(t, `Services to ${[...new Set(dropped)].map(id => routeById(id) ? routeById(id).city : id.toUpperCase()).join(', ')} are not open yet in this version: taken off the timetable.`);
    const keep = { uid:f.uid, planeId, route:sched[0] || null, schedule:sched, layout:f.layout || 'standard', grounded:false }; if(f.livery) keep.livery = f.livery; if(f.registration) keep.registration = f.registration; if(f.name !== undefined) keep.name = f.name; if(Array.isArray(f.deps)) keep.deps = f.deps; if(f.terms) keep.terms = f.terms; return keep; })
    .filter(f => { if(seen.has(f.uid)) return false; seen.add(f.uid); return true; });
  t.nextUid = Math.max(s.nextUid || 1, ...t.fleet.map(f => f.uid + 1));
  t.market = s.market && routeById(s.market) && WORLD.setupRoutes.includes(s.market) ? s.market : (t.fleet[0] && t.fleet[0].schedule[0] && WORLD.setupRoutes.includes(t.fleet[0].schedule[0]) ? t.fleet[0].schedule[0] : WORLD.setupRoutes[0]);
  t.fleet.forEach(f => { if(!f.schedule.length){ f.schedule = [t.market]; f.route = t.market; migNote(t, 'An aircraft had no services left: it flies the first route once.'); } });
  Object.keys(s.prices || {}).forEach(id => { if(routeById(id)) t.prices[id] = +s.prices[id]; }); fixPrices(t);
  const OB = { none:'none', low:'low', high:'high', free:'free', sell3:'low', sell5:'high' }; t.onboard = OB[s.onboard] || 'none'; if(s.onboard && !ONBOARD[t.onboard]) t.onboard = 'none';
  if(s.firstDep !== undefined) t.firstDep = s.firstDep; if(Array.isArray(s.deps)) t.deps = s.deps;
  const shift = h => { const o = Object.assign({}, h); const f0 = h.from !== undefined ? h.from : (h.round || 0); o.from = f0 + 1; o.to = (h.to !== undefined ? h.to : f0) + 1; o.type = h.type || (h.round ? 'day' : 'setup'); return o; };
  t.history = (s.history || []).map(shift);
  ['rev', 'cost', 'pax', 'seats'].forEach(k => { const a = (s.ledger || {})[k] || []; a.forEach((v, i) => { if(v !== null && v !== undefined) t.ledger[k][i + 1] = v; }); });
  if(!(s.ledger && s.ledger.rev && s.ledger.rev.length)) t.history.forEach(h => { t.ledger.rev[h.from] = h.revenue || 0; t.ledger.cost[h.from] = h.costs || 0; t.ledger.pax[h.from] = h.pax || 0; t.ledger.seats[h.from] = h.seats || 0; });
  if(s.dec){ t.dec = JSON.parse(JSON.stringify(s.dec)); if(t.dec.planeBought) t.dec.planeBought.day = (t.dec.planeBought.day || 0) + 1; if(t.dec.held) t.dec.held = null; }
  if(s.rop) t.rop = Object.assign({}, s.rop, { approved:(s.rop.approved || 0) + 1, onboard:OB[s.rop.onboard] || 'none', prices:Object.fromEntries(Object.entries(s.rop.prices || {}).filter(([id]) => routeById(id))) });
  ['milestones', 'seenModules', 'toolSeen', 'flags', 'repBank', 'skills', 'handSumLog', 'practice', 'tools', 'stages'].forEach(k => { if(s[k] !== undefined) t[k] = s[k]; });
  t.log = [{ round:b, tag:'NEWS', text:`${t.airline.name} carries on from the earlier version of the game on ${dateShort(D)}.` }];
  t.phase = 'round'; t.round = b; t.day = D; t.period = newPeriod('day', D - 1); t.steps = [{ t:'hq' }]; t.si = 0; t.needsRestart = { beat:b };
  t.migrated.landedStep = 'hq'; t.migrated.landedDay = D;
  migNote(t, `The ${from === 'full-game' ? 'full game' : 'earlier version'} counted launch day as day 0 and this version as day 1, so ${from === 'full-game' ? 'round' : 'day'} ${oldDay} became ${dateShort(D)} (day ${D}); the day starts again from HQ with the airline, cash, fleet, fares and history kept.`);
  if(!s.skills) migNote(t, 'No record of sums done by hand came with the code, so the first-time sums are asked on this day.');
  return t;
}
function migrate(s){
  if(!s || !s.steps) return null;
  if(s.v === 5) return repairV5(s);
  if(s.v >= 2 && s.v <= 4) return convertOld(s, isFullGame(s) ? 'full-game' : 'proto-v4');
  return null;
}
/* a converted save starts its landing day on the live S (from boot and the teacher panel) */
function landSave(){ const r = S && S.needsRestart; if(!r) return false; delete S.needsRestart; const b = r && typeof r === 'object' && r.beat !== undefined ? r.beat : S.round, w = WORLD.rounds[b]; if(!w) return false;
  if(w.period === 'day') startProtoDay(b); else if(w.period !== 'setup') startBeat(b); return true; }
function migratedLine(s){ s = s || S; const m = s && s.migrated; if(!m) return '';
  const from = m.from === 'full-game' ? 'the full game' : m.from === 'proto-v4' ? 'the game as it was on 5–6 October' : 'an earlier version of the game';
  const where = m.landedStep ? (MIG_STEP_WORDS[m.landedStep] || m.landedStep) : 'HQ', day = m.landedDay ? (m.landedDay === 1 ? 'Launch Day' : dateShort(m.landedDay)) : '';
  return `Saved on ${from}: it carries on from ${day ? day + "'s " : 'the '}${where}.`; }
function migratedHtml(s){ s = s || S; const m = s && s.migrated; if(!m) return '<p class="small muted">This game was not carried over from an older code.</p>';
  return `<p class="small"><b>${esc(migratedLine(s))}</b></p>${(m.notes || []).length ? `<ul class="small">${m.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : '<p class="small muted">Nothing else had to change.</p>'}`; }
