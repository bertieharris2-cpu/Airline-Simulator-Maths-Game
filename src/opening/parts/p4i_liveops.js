
/* ==================================================================
   LIVE OPERATIONS ON THE OPERATIONS WALL
   (Airline Simulator Live Operations / IWB Immersion Brief; first pass: Launch Day to Week 3.)
   "Routine time compresses. Meaningful moments become visible."
   - The show is built when operations start, from the model's own flights. It never changes a passenger or
     a pound: no random no-shows, no extra demand. (A storm in Week 3 delays one flight on the wall only.)
   - A service in full: preparing, boarding (the seats fill one by one), final call, gate closed, pushback,
     taxi, take-off, the flight, landing, the turnaround checklist, the return, ready again.
     Launch Day shows every service in full; later days the first service in full and the others briskly.
   - The weekend and the weeks: the first day in detail (or one featured flight when the plan has not
     changed), then the rest compressed, slowing down for focus moments taken from the model's data.
   - One clock (S.rnd.live.clock): the HQ owns it and publishes it, the IWB window runs the same clock.
     Pace buttons on either screen go to the HQ.
   ================================================================== */
const LO = { checkin:90, prep:35, board:25, final:10, close:4 };
/* Real seconds, at standard pace, for each part of a service. */
const LO_PACE = {
  full:  { prep:4,   board:12, final:5, closed:4,   push:6, up:2,  cruise:12, desc:4,   land:4,   away:14, home:8 },
  brisk: { prep:1.2, board:5,  final:2, closed:1.5, push:2, up:.7, cruise:4,  desc:1.4, land:1.4, away:4,  home:3 } };
const LO_IDLE = 60, LO_DAY = 300, LO_NIGHT = 1600;    // game minutes a second: an aircraft waiting, a compressed day, the night
const LO_FOCUS = { slow:20, hold:1, resume:10 };       // game minutes: slowing down, the moment itself, speeding up again
const LO_KIND = { milestone:'MILESTONE', capacity:'FULL FLIGHT', quiet:'QUIET SERVICE', turnaround:'OPERATIONS', weather:'WEATHER', record:'RECORD' };

function liveScale(){ const s = +settings.flightSecs; return clamp(isFinite(s) && s > 0 ? s / 7 : 1, 0.02, 3); }
function opsSoundOn(){ return settings.opsSound !== false; }
function iwbConnected(){ return !IS_DISPLAY && (Date.now() - lastPong) < 9000; }
/* This window shows the wall, so it makes the sounds (never both windows). */
function liveHere(){ return IS_DISPLAY || (wallView && !iwbConnected()); }
function liveOn(){ return !!(S && S.rnd && S.rnd.live && S.steps && S.steps.length && ['fly', 'sim'].includes(step().t)); }
function legShape(L){ return { push:Math.min(3, L * .06), taxi:Math.min(7, L * .12), up:Math.min(8, L * .14), desc:Math.min(9, L * .16), land:Math.min(5, L * .09) }; }
const smooth = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
function ordinalTh(n){ return num(n) + 'TH'; }      // 100TH, 500TH, 1,000TH: every milestone ends in 0
function regOf(uid){ const i = Math.max(0, S.fleet.findIndex(x => x.uid === uid)); return 'G-' + String(S.airline.code || 'DA').slice(0, 2).toUpperCase() + 'A' + String.fromCharCode(65 + i % 26); }
function aptCode(r){ return r ? (r.code || String(r.id).toUpperCase()) : homeData().code; }
const loPut = (el, html) => { if(el && el._h !== html){ el._h = html; el.innerHTML = html; } };

/* ---------- the show ---------- */
function liveFlight(f, k, d){
  const r = routeById(f.route), p = planeById(f.planeId), L = TIME.leg(p, r), A = TIME.away(p, r), dep = f.dep + k * 1440, arr = dep + 2 * L + A, off = !!(f.noFuel || f.grounded);
  return { key:f.key + '@' + k, fk:f.key, uid:f.uid, code:f.code, rcode:returnCode(f.code), route:f.route, city:r.city, gate:String(r.gate || 1), k, d,
    dep, sched:dep, arrAway:dep + L, depAway:dep + L + A, arr, ready:arr + TIME.home(p), L, A, seats:f.seats, sold:off ? 0 : f.sold, price:f.price, off,
    why:f.noFuel ? 'NO FUEL' : f.grounded ? 'GROUNDED' : '', band:f.band || bandOf(f.dep), fuelL:f.fuelL || 0, style:'fast', ob:null, delay:0, waiting:0, want:0 };
}
function liveShift(F, m){ F.delay += m; ['dep', 'arrAway', 'depAway', 'arr', 'ready'].forEach(k => { F[k] += m; }); }
/* Cabin sales, as the model counts them: a share of each route's passengers buy; shared out between its services. */
function liveCabin(list){
  const ob = onboardOf(); if(!snacksOn() || !ob || (!ob.share && !ob.free)) return;
  const by = {}; list.forEach(F => { if(!F.off) (by[F.route] = by[F.route] || []).push(F); });
  Object.keys(by).forEach(id => {
    const xs = by[id], pax = xs.reduce((t, F) => t + F.sold, 0);
    if(ob.free){ xs.forEach(F => { F.ob = { free:true, n:F.sold }; }); return; }
    const total = Math.floor(pax * ob.share), raw = xs.map(F => pax ? total * F.sold / pax : 0), n = raw.map(Math.floor);
    let left = total - n.reduce((a, b) => a + b, 0);
    raw.map((v, i) => [v - n[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if(left > 0){ n[i]++; left--; } });
    xs.forEach((F, i) => { F.ob = { n:n[i], price:ob.price, rev:n[i] * ob.price }; });
  });
}
/* People left without a seat: those who wanted a full service's time of day, and (on the last full service) the flexible ones. */
function liveWaiting(list){
  const by = {}; list.forEach(F => { if(!F.off) (by[F.route] = by[F.route] || []).push(F); });
  Object.keys(by).forEach(id => {
    const xs = by[id], P = demandPools(routeById(id), fareOf(id)), left = {};
    Object.keys(P).forEach(b => { if(b !== 'W') left[b] = P[b]; });
    xs.forEach(F => { const f = F._f || {}; if(left[F.band] !== undefined) left[F.band] -= (f.locked || 0); left.flex -= (f.flexible || 0); F.want = P.W; });
    const full = xs.filter(F => F.sold >= F.seats);
    full.forEach(F => { F.waiting = Math.max(0, left[F.band] || 0); });
    if(full.length && left.flex > 0) full[full.length - 1].waiting += left.flex;
  });
}
/* days: [{ d, beat, style:'all'|'first'|'featured'|'compressed', flights }]; cfg: the beat's "live" data (weather). */
function buildShow(kind, days, cfg){
  cfg = cfg || {};
  const L = { id:Date.now().toString(36) + Math.round(Math.random() * 1e4), kind, days:[], flights:[], cues:[], moments:[], zones:[], scale:liveScale(), notes:[] };
  days.forEach((D, k) => {
    const list = D.flights.slice().sort((a, b) => a.dep - b.dep).map(f => { const F = liveFlight(f, k, D.d); F._f = f; return F; });
    withBeat(D.beat, () => { liveCabin(list); liveWaiting(list); });
    const on = list.filter(F => !F.off);
    on.forEach((F, i) => { F.style = D.style === 'all' ? 'full' : D.style === 'first' ? (i === 0 ? 'full' : 'brisk') : D.style === 'featured' ? (i === 0 ? 'full' : 'fast') : 'fast'; });
    const off = k * 1440, first = on.length ? Math.min(...on.map(F => F.dep)) : off + 420, last = on.length ? Math.max(...on.map(F => F.ready)) : off + 1260;
    const det = D.style === 'all' || D.style === 'first';
    L.days.push({ k, d:D.d, beat:D.beat, style:D.style, start: det ? first - LO.prep - 6 : Math.min(off + 360, first - LO.prep - 6), end: det ? last + 10 : Math.max(off + 1320, last + 10) });
    L.flights.push(...list);
  });
  // the first service on a route the airline has never flown is always shown in full
  const flown = new Set(); S.history.forEach(h => Object.keys(h.routes || {}).forEach(id => flown.add(id)));
  const ord = () => L.flights.filter(F => !F.off).sort((a, b) => a.dep - b.dep);
  if(S.phase !== 'setup'){ const seen = new Set(flown); ord().forEach(F => { if(!seen.has(F.route)){ seen.add(F.route); F.firstRoute = true; if(F.style === 'brisk') F.style = 'full'; } }); }
  liveMoments(L, cfg, ord);
  liveCues(L);
  liveZones(L);
  L.flights.forEach(F => { delete F._f; });
  L.start = L.days[0].start; L.end = L.days[L.days.length - 1].end;
  const intro = Math.round(5600 * Math.min(1, L.scale));
  L.intro = intro; L.clock = { t0:Date.now() + intro, g0:L.start, rate:1, last:1 };
  return L;
}
function liveMoments(L, cfg, ord){
  const M = [], t = m => fmtTime(m), name = S.airline.name || 'Your airline', onDay = k => ord().filter(F => F.k === k);
  // weather first: it moves a flight, and everything else is worked out on the moved times
  if(cfg.weather){
    const k = Math.min(cfg.weather.day || 0, L.days.length - 1);
    for(const F of onDay(k).slice().sort((a, b) => b.dep - a.dep)){
      const N = onDay(k).find(x => x.uid === F.uid && x.dep > F.dep), room = N ? N.dep - F.ready : (k * 1440 + 1320) - F.arr;
      const dl = Math.floor(Math.min(cfg.weather.delay || 30, room) / 5) * 5;
      if(dl < 15) continue;
      const g = F.dep - 30; liveShift(F, dl);
      M.push({ kind:'weather', g, key:F.key, route:F.route, until:F.dep, delay:dl, title:`WEATHER ALERT — ${F.city.toUpperCase()}`, sub:`A storm is passing over ${F.city}. ${F.code} will leave ${dl} minutes late, at ${t(F.dep)}. Nobody can change the weather: the airline waits for it to pass.` });
      L.notes.push({ ic:'🌩️', text:`A storm over ${F.city} on ${WDAY[calDate(F.d).getUTCDay()]} delayed ${F.code} by ${dl} minutes. Everyone still flew, and the airline did not cause the storm.` });
      break;
    }
  }
  const o = ord();
  if(S.phase === 'setup' && o[0]){ const F = o[0]; M.push({ kind:'milestone', g:F.dep + legShape(F.L).up, key:F.key, route:F.route, title:'FIRST DEPARTURE', sub:`${F.code} to ${F.city} is ${name}'s very first flight.` }); }
  o.filter(F => F.firstRoute).forEach(F => M.push({ kind:'milestone', g:F.dep + legShape(F.L).up, key:F.key, route:F.route, title:`FIRST ${F.city.toUpperCase()} SERVICE`, sub:`${F.code} opens ${name}'s route to ${F.city}.` }));
  const ms = S.milestones || (S.milestones = {});
  if(!ms.fullFlight){ const F = o.find(x => x.sold >= x.seats); if(F){ ms.fullFlight = true; M.push({ kind:'milestone', g:F.dep - LO.close + .3, key:F.key, route:F.route, title:'FIRST FULL FLIGHT', sub:`${F.code} to ${F.city} leaves with every seat taken: ${F.seats} / ${F.seats}.` }); } }
  let cum = S.history.reduce((a, h) => a + (h.pax || 0), 0);
  o.forEach(F => { const b = cum; cum += F.sold; PAX_MILESTONES.forEach(n => { if(b < n && cum >= n) M.push({ kind:'milestone', g:F.dep - LO.close + .6, key:F.key, route:F.route, title:`${ordinalTh(n)} PASSENGER`, sub:`Passenger number ${num(n)} boards ${F.code} to ${F.city}.` }); }); });
  // the everyday ones, once a show: in compressed time if there is any, so the simulation slows down for them
  const fast = L.days.filter(D => D.style === 'compressed').map(D => D.k), pick = f => fast.length ? fast[Math.min(fast.length - 1, Math.floor(fast.length * f))] : 0;
  { const F = onDay(pick(.4)).filter(x => x.sold >= x.seats && x.waiting > 0).sort((a, b) => b.waiting - a.waiting)[0];
    if(F) M.push({ kind:'capacity', g:F.dep - LO.close, key:F.key, route:F.route, title:`${F.city.toUpperCase()} ${BAND_SHORT[F.band].toUpperCase()} SERVICE — FULL`, sub:`${F.seats} / ${F.seats} boarded. ${F.waiting} more ${F.waiting === 1 ? 'person' : 'people'} could not get a seat on this departure.` }); }
  { const F = onDay(pick(.75)).filter(x => x.sold <= x.seats / 2).sort((a, b) => a.sold / a.seats - b.sold / b.seats)[0];
    if(F) M.push({ kind:'quiet', g:F.dep - LO.close, key:F.key, route:F.route, title:`QUIET ${BAND_SHORT[F.band].toUpperCase()} SERVICE`, sub:`${F.code} to ${F.city} leaves with ${F.sold} / ${F.seats} passengers: ${F.seats - F.sold} empty seats.` }); }
  { let best = null; const by = {}; onDay(pick(.15)).forEach(F => (by[F.uid] = by[F.uid] || []).push(F));
    Object.values(by).forEach(xs => xs.forEach((F, i) => { const N = xs[i + 1]; if(!N) return; const slack = N.dep - F.ready; if(slack <= 5 && (!best || slack < best.slack)) best = { F, N, slack }; }));
    if(best){ const { F, N, slack } = best; M.push({ kind:'turnaround', g:N.dep - LO.board + .4, key:N.key, route:N.route, title:'TIGHT TURNAROUND', sub:`${F.rcode} landed at ${t(F.arr)}. The aircraft is ready again at ${t(F.ready)}, and ${N.code} leaves at ${t(N.dep)}: ${slack > 0 ? plural(slack, 'minute') : 'no time'} to spare.` }); } }
  // keep it calm: a flight in full or briskly gets a ribbon; in compressed time the simulation slows down for it,
  // and an everyday moment (full, quiet, tight) only once for each plan
  const order = ['weather', 'milestone', 'capacity', 'turnaround', 'quiet'], kept = [], count = { focus:0, ribbon:0 }, seen = S.liveSeen || (S.liveSeen = {}), plan = S.liveKey || '';
  M.forEach(m => { const F = L.flights.find(x => x.key === m.key); m.focus = !F || F.style === 'fast'; });
  for(let i = M.length - 1; i >= 0; i--){ const m = M[i]; if(m.focus && ['capacity', 'turnaround', 'quiet'].includes(m.kind)){ const id = m.kind + '|' + plan; if(seen[id]) M.splice(i, 1); else m.seenId = id; } }
  M.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind) || a.g - b.g).forEach(m => {
    const type = m.focus ? 'focus' : 'ribbon'; if(count[type] >= 4) return;
    if(kept.some(x => Math.abs(x.g - m.g) < (m.focus || x.focus ? 30 : 3))) return;
    count[type]++; kept.push(m);
  });
  kept.sort((a, b) => a.g - b.g).forEach((m, i) => { m.id = m.kind + i; if(m.seenId){ seen[m.seenId] = true; delete m.seenId; } });
  L.moments = kept;
}
function liveCues(L){
  const name = S.airline.name || 'Your airline', Q = [];
  L.flights.forEach(F => {
    if(F.off || F.style === 'fast') return; const s = legShape(F.L), say = F.style === 'full';
    Q.push({ g:F.dep - LO.board, kind:'board', key:F.key, chime:'ding', say, text:`${name} flight ${F.code} to ${F.city} is now boarding at Gate ${F.gate}.` });
    Q.push({ g:F.dep - LO.final, kind:'final', key:F.key, chime:'ding', say, text:`Final call for passengers travelling on ${name} flight ${F.code} to ${F.city}.` });
    Q.push({ g:F.dep - LO.close, kind:'closed', key:F.key, say, text:`Gate ${F.gate} is now closed.` });
    Q.push({ g:F.arr - s.land, kind:'arrive', key:F.key, chime:'ding', say, text:`${name} flight ${F.rcode} from ${F.city} has arrived.` });
  });
  L.moments.forEach(m => Q.push({ g:m.g, kind:'moment', key:m.key, chime:m.kind === 'weather' || m.kind === 'quiet' || m.kind === 'turnaround' ? 'alert' : 'good', text:m.title, moment:m.id }));
  Q.sort((a, b) => a.g - b.g).forEach((q, i) => { q.id = q.kind + i; });
  L.cues = Q;
}
/* The speed of time: each part of each shown service has its own pace; everything else waits, or races through the day. */
function liveZones(L){
  const iv = [], add = (a, b, secs) => { if(b > a + 1e-6 && secs > 0) iv.push([a, b, (b - a) / secs]); };
  L.flights.forEach(F => {
    if(F.off || F.style === 'fast') return; const P = LO_PACE[F.style], s = legShape(F.L), D = F.dep;
    const leg = t0 => { add(t0, t0 + s.taxi, P.push); add(t0 + s.taxi, t0 + s.up, P.up); add(t0 + s.up, t0 + F.L - s.desc, P.cruise); add(t0 + F.L - s.desc, t0 + F.L - s.land, P.desc); add(t0 + F.L - s.land, t0 + F.L, P.land); };
    add(D - LO.prep, D - LO.board, P.prep); add(D - LO.board, D - LO.final, P.board); add(D - LO.final, D - LO.close, P.final); add(D - LO.close, D, P.closed);
    leg(D); add(F.arrAway, F.depAway, P.away); leg(F.depAway); add(F.arr, F.ready, P.home);
  });
  L.moments.forEach(m => {
    if(m.focus){ add(m.g - LO_FOCUS.slow, m.g, 5); add(m.g, m.g + LO_FOCUS.hold, 7); add(m.g + LO_FOCUS.hold, m.g + LO_FOCUS.hold + LO_FOCUS.resume, 3); }
    else add(m.g, m.g + .5, 3.2);
  });
  const start = L.days[0].start, end = L.days[L.days.length - 1].end, pts = new Set([start, end]);
  iv.forEach(([a, b]) => { pts.add(a); pts.add(b); });
  L.days.forEach(D => { pts.add(D.start); pts.add(D.end); pts.add(D.k * 1440 + 360); pts.add(D.k * 1440 + 1320); });
  const P = [...pts].filter(x => x >= start && x <= end).sort((a, b) => a - b), Z = [];
  const base = x => { const D = L.days[Math.floor(x / 1440)]; if(!D || x < D.start || x >= D.end) return LO_NIGHT; if(D.style === 'all' || D.style === 'first') return LO_IDLE; const m = x - D.k * 1440; return m >= 360 && m < 1320 ? LO_DAY : LO_NIGHT; };
  for(let i = 0; i < P.length - 1; i++){
    const a = P[i], b = P[i + 1]; if(b - a < 1e-9) continue; const mid = (a + b) / 2;
    let sp = base(mid); iv.forEach(([x, y, s]) => { if(x <= mid && y >= mid && s < sp) sp = s; });
    const z = Z[Z.length - 1]; if(z && Math.abs(z[2] - sp) < 1e-9 && Math.abs(z[1] - a) < 1e-9) z[1] = b; else Z.push([a, b, sp]);
  }
  let cum = 0; Z.forEach(z => { z[3] = cum; cum += (z[1] - z[0]) / z[2]; });
  L.zones = Z.map(z => z.map(v => Math.round(v * 1e4) / 1e4)); L.total = Math.round(cum * 100) / 100;
}

/* ---------- the clock ---------- */
function liveZoneAt(Z, g){ let lo = 0, hi = Z.length - 1; while(lo < hi){ const m = (lo + hi + 1) >> 1; if(Z[m][0] <= g) lo = m; else hi = m - 1; } return lo; }
function liveAdvance(L, g, secs){
  const Z = L.zones; let i = liveZoneAt(Z, g);
  while(secs > 1e-9 && g < L.end - 1e-9){ const z = Z[i]; if(!z){ g = L.end; break; } const room = (z[1] - g) / z[2]; if(room >= secs){ g += secs * z[2]; secs = 0; } else { secs -= room; g = z[1]; i++; } }
  return Math.min(g, L.end);
}
function liveNow(L){ L = L || (S && S.rnd && S.rnd.live); if(!L || !L.clock) return null; const c = L.clock, t = Date.now(); if(t <= c.t0 || !c.rate) return c.g0; return liveAdvance(L, c.g0, (t - c.t0) / 1000 * c.rate / L.scale); }
function liveDay(L, g){ return clamp(Math.floor(g / 1440), 0, L.days.length - 1); }
/* Real seconds (standard pace) from the start to g: the progress bar and "time left". */
function liveRealAt(L, g){ const Z = L.zones, i = liveZoneAt(Z, g), z = Z[i]; return z ? z[3] + Math.max(0, Math.min(g, z[1]) - z[0]) / z[2] : 0; }
function liveProgress(L, g){ return L.total ? clamp(liveRealAt(L, g) / L.total, 0, 1) : 1; }
function liveFocus(L, g){ const m = L.moments.find(x => x.focus && g >= x.g - LO_FOCUS.slow && g < x.g + LO_FOCUS.hold + LO_FOCUS.resume); if(!m) return null; return { m, at: g < m.g - 6 ? 'slowing' : g < m.g + LO_FOCUS.hold ? 'event' : 'resuming' }; }
function liveRibbon(L, g){ return L.moments.find(x => !x.focus && g >= x.g && g < x.g + 9) || null; }
function liveMode(L, g){
  if(Date.now() < L.clock.t0 && g <= L.start + 1e-6) return 'intro';
  if(g >= L.end - 1e-6) return 'done';
  if(!L.clock.rate) return 'paused';
  if(liveFocus(L, g)) return 'focus';
  const D = L.days[liveDay(L, g)];
  if(D.style === 'compressed') return 'sim';
  if(D.style === 'featured'){ const F = L.flights.find(x => x.k === D.k && x.style === 'full'); if(!F || g < F.dep - LO.prep || g >= F.ready) return 'sim'; }
  return 'live';
}
function liveNextStop(L, g){
  const c = [];
  L.flights.forEach(F => { if(!F.off && F.style !== 'fast') c.push(F.dep - LO.prep); });
  L.moments.forEach(m => c.push(m.g - (m.focus ? LO_FOCUS.slow : .5)));
  L.days.forEach(D => c.push(D.start));
  const t = c.filter(x => x > g + .5).sort((a, b) => a - b)[0];
  return t === undefined ? L.end : t;
}

/* ---------- where each flight is, minute by minute ---------- */
function livePhase(F, g){
  if(F.off) return { st:'off', label:'CANCELLED', at:'home', boarded:0 };
  const D = F.dep, s = legShape(F.L);
  if(g < D - LO.checkin) return { st:'sched', label:'SCHEDULED', at:'home', boarded:0 };
  if(g < D - LO.prep) return { st:'checkin', label:'CHECK-IN', at:'home', boarded:0 };
  if(g < D - LO.board) return { st:'prep', label:'PREPARING', at:'home', boarded:0 };
  if(g < D - LO.final) return { st:'board', label:'BOARDING', at:'home', boarded:Math.min(F.sold, Math.floor(F.sold * (g - (D - LO.board)) / (LO.board - LO.final - 1) + 1e-6)) };
  if(g < D - LO.close) return { st:'final', label:'FINAL CALL', at:'home', boarded:F.sold };
  if(g < D) return { st:'closed', label:'GATE CLOSED', at:'home', boarded:F.sold };
  if(g < F.arrAway) return liveLeg(F, g - D, s, 'out');
  if(g < F.depAway){ const u = (g - F.arrAway) / F.A; return { st:'turnA', label:'TURNAROUND', at:'away', u, boarded: u < .7 ? 0 : Math.min(F.sold, Math.floor(F.sold * (u - .7) / .28 + 1e-6)) }; }
  if(g < F.arr) return liveLeg(F, g - F.depAway, s, 'back');
  if(g < F.ready) return { st:'turnH', label:'TURNAROUND', at:'home', u:(g - F.arr) / Math.max(1, F.ready - F.arr), boarded:0 };
  return { st:'done', label:'READY', at:'home', boarded:0 };
}
function liveLeg(F, t, s, leg){
  const L = F.L, back = leg === 'back';
  const st = t < s.push ? 'push' : t < s.taxi ? 'taxi' : t < s.up ? 'takeoff' : t < L - s.desc ? 'cruise' : t < L - s.land ? 'desc' : 'taxiin';
  const u = t < s.taxi ? 0 : t >= L - s.land ? 1 : smooth((t - s.taxi) / (L - s.land - s.taxi));
  const lbl = { push:'PUSHBACK', taxi:'TAXIING', takeoff:'TAKE-OFF', cruise:'AIRBORNE', desc:'DESCENDING', taxiin:'LANDED' }[st];
  const ground = st === 'push' || st === 'taxi' ? t / Math.max(.1, s.taxi) : st === 'taxiin' ? (t - (L - s.land)) / Math.max(.1, s.land) : 0;
  return { st, leg, back, u, ground, label:lbl, boarded:F.sold, at: st === 'push' || st === 'taxi' ? (back ? 'away' : 'home') : st === 'taxiin' ? (back ? 'home' : 'away') : 'air',
    eta:(back ? F.arr : F.arrAway) - s.land, cruiseU: st === 'cruise' ? (t - s.up) / Math.max(1, L - s.desc - s.up) : -1 };
}
/* The departures board (the outbound service) and the arrivals board (its return). */
function liveWeatherAt(L, F, g){ const m = L.moments.find(x => x.kind === 'weather' && x.key === F.key); return m && g >= m.g && g < F.dep - LO.board ? m : null; }
function liveDepStatus(L, F, g){
  if(F.off) return F.why || 'CANCELLED'; if(liveWeatherAt(L, F, g)) return 'DELAYED';
  const p = livePhase(F, g);
  if(p.st === 'sched') return 'SCHEDULED'; if(p.st === 'checkin' || p.st === 'prep') return 'CHECK-IN';
  if(p.st === 'board') return 'BOARDING'; if(p.st === 'final') return 'FINAL CALL'; if(p.st === 'closed') return 'GATE CLOSED';
  if(p.leg === 'out') return p.st === 'push' || p.st === 'taxi' ? 'TAXIING' : p.st === 'taxiin' ? 'LANDED' : 'AIRBORNE';
  return 'LANDED';
}
function liveArrStatus(L, F, g){
  if(F.off) return F.why || 'CANCELLED'; if(liveWeatherAt(L, F, g)) return 'DELAYED';
  const p = livePhase(F, g);
  if(p.leg === 'back') return p.st === 'push' || p.st === 'taxi' ? 'TAXIING' : p.st === 'taxiin' ? 'LANDED' : 'AIRBORNE';
  if(p.st === 'turnA') return p.u >= .7 ? 'BOARDING' : 'EXPECTED';
  if(p.st === 'turnH' || p.st === 'done') return 'LANDED';
  return 'EXPECTED';
}
/* One aircraft at g: its current service, the next, the last one done. */
function liveAircraft(L, uid, g, k){
  const fl = L.flights.filter(F => F.uid === uid && F.k === k && !F.off).sort((a, b) => a.dep - b.dep);
  const cur = fl.find(F => g >= F.dep - LO.prep && g < F.ready) || null;
  const next = fl.find(F => F !== cur && (cur ? F.dep > cur.dep : F.dep - LO.prep > g)) || null;
  const prev = fl.filter(F => F.ready <= g && F !== cur).pop() || null;
  return { uid, fl, F:cur, p:cur ? livePhase(cur, g) : null, next, prev, overlap: !!(cur && next && g >= next.dep - LO.prep) };
}
/* Running totals for the strip and the compressed panel. */
function liveTotals(L, g, k){
  const o = { pax:0, rev:0, done:0, legs:0, legsDone:0, dep:0, onTime:0, today:0, todayPax:0, services:0 };
  L.flights.forEach(F => {
    if(F.off) return; const s = legShape(F.L);
    o.services++; if(F.k === k){ o.legs += 2; if(g >= F.arrAway - s.land) o.legsDone++; if(g >= F.arr - s.land) o.legsDone++; }
    if(g >= F.dep - LO.close){ o.pax += F.sold; o.rev += F.sold * F.price + (F.ob && F.ob.rev ? F.ob.rev : 0); if(F.k === k) o.todayPax += F.sold; }
    if(g >= F.dep){ o.dep++; if(F.delay < 15) o.onTime++; }
    if(g >= F.arr - s.land) o.done++;
  });
  if(L.profits) o.profit = L.days.reduce((t, D, i) => t + (g >= D.end ? (L.profits[i] || 0) : 0), 0);
  return o;
}

/* ---------- starting the show ---------- */
/* Launch Day and Days 1–4 (the fly step): the flights, the launch-deal fuel, the tank, then the show. */
function startFlight(){
  S.rnd.flights = planFlights(); const paid = fuelPaid();
  S.rnd.flights.slice().sort((a, b) => a.dep - b.dep).forEach(f => {
    if(f.grounded) return;
    if(!paid){ f.fuelCost = 0; S.rnd.status[f.key] = 'BOARDING'; return; }
    if(S.fuel + 1e-9 >= f.fuelL){ f.fuelCost = consumeFuel(f.fuelL); S.rnd.status[f.key] = 'BOARDING'; }
    else { f.noFuel = true; f.sold = 0; f.revenue = 0; f.runCost = 0; f.fuelCost = 0; S.rnd.status[f.key] = 'NO FUEL'; f.reasons = ['Not enough fuel — trip grounded.']; }
  });
  const fl = S.rnd.flights.filter(f => !f.grounded), first = fl.length ? Math.min(...fl.map(f => f.dep)) : firstDep(), last = S.rnd.flights.reduce((m, f) => Math.max(m, f.arr || 0), first + 60);
  S.rnd.anim = { start: Date.now(), dur: settings.flightSecs * 2500, from: first - 30, to: last + 30 };
  liveStartDay();
}
function liveStartDay(){
  const fl = S.rnd.flights || []; S.rnd.live = null;
  if(!fl.some(f => !f.grounded && !f.noFuel)) return;
  S.liveKey = planKey(currentPlan());
  S.rnd.live = buildShow('day', [{ d:S.phase === 'setup' ? 0 : S.day, beat:S.round, style:S.phase === 'setup' ? 'all' : 'first', flights:fl }], roundData(S.round).live);
}
/* The weekend and the weeks (the sim step, after the model has run the period). Months keep the plain run for now. */
function livePeriodShow(){
  const P = S.period, T = S.rnd.sim; S.rnd.live = null;
  if(!P || !T || !['gap', 'week'].includes(P.type) || T.parts.length !== 1) return;
  const key = planKey(currentPlan()), changed = P.type === 'gap' || S.liveKey !== key; S.liveKey = key;
  const days = [];
  for(let d = T.from; d <= T.to; d++){ const beat = beatAt(d); days.push({ d, beat, style: d === T.from ? (changed ? 'first' : 'featured') : 'compressed', flights: withBeat(beat, () => planFlights()) }); }
  if(!days.some(D => D.flights.some(f => !f.grounded && !f.noFuel))) return;
  const L = buildShow('period', days, roundData(S.round).live);
  L.profits = (T.days || []).map(v => Math.round(v * 100) / 100);
  L.notes.forEach(n => S.rnd.why.push(n));
  S.rnd.live = L;
}

/* ---------- the HQ while the wall plays ---------- */
let loLoop = null, loEnded = null, loLastWall = 0, loLastMap = 0;
function liveEnter(st){
  const L = S.rnd.live; if(!L || L.opened) return;
  L.opened = true;
  if(!iwbConnected() && settings.autoWall !== false && !IS_DISPLAY) setWallView(true);
}
R.fly = st => {
  if(!S.rnd.live && (S.rnd.flights || []).some(f => !f.grounded && !f.noFuel)) liveStartDay();
  if(!S.rnd.live){ renderOverview('live'); setTimeout(() => { if(step() === st) next(); }, 800); return; }
  liveEnter(st); renderOverview('live'); liveHqLoop(st);
};
const R_sim_plain = R.sim;
R.sim = st => { if(!S.rnd.live) return R_sim_plain(st); liveEnter(st); renderOverview('sim'); liveHqLoop(st); };
function liveHqLoop(st){
  if(loLoop === st) return; loLoop = st;
  const tick = () => {
    if(!S || !S.steps || step() !== st || !S.rnd.live){ loLoop = null; return; }
    const L = S.rnd.live, g = liveNow(L), now = Date.now();
    liveHqFrame(L, g, now);
    if(wallView && now - loLastWall > 33){ loLastWall = now; renderLiveWall(); }
    if(liveHere()) liveSounds(L, g);
    if(g >= L.end - 1e-6 && now >= L.clock.t0 && loEnded !== L.id){ loEnded = L.id; setTimeout(() => { if(S && step() === st) next(); }, Math.max(200, Math.round(2200 * Math.min(1, L.scale)))); }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function liveHqFrame(L, g, now){
  const k = liveDay(L, g), c = $('ovClock'); if(c) c.textContent = fmtTime(g - k * 1440);
  const dd = $('loDay'); if(dd) dd.textContent = dateShort(L.days[k].d);
  const pr = $('ovProg'); if(pr) pr.style.width = (100 * liveProgress(L, g)).toFixed(1) + '%';
  const ph = $('loPhase'); if(ph) loPut(ph, liveHqLine(L, g, k));
  const pc = $('loPace'); if(pc) loPut(pc, livePaceButtons(L, 'hq'));
  screen().querySelectorAll('[data-lo]').forEach(e => { const F = L.flights.find(x => x.fk === e.getAttribute('data-lo') && x.k === k); if(!F) return; const s = liveDepStatus(L, F, g), txt = cap(s);
    if(e.textContent !== txt){ e.textContent = txt; e.className = 'lo-st ' + statusClass(s); const d = e.previousElementSibling; if(d) d.className = 'st-dot ' + statusClass(s); } });
  if(hqMap && !S.overlay && !UI.view && !wallView && now - loLastMap > 45){ loLastMap = now; hqMap.render(); }
}
function liveHqLine(L, g, k){
  const mode = liveMode(L, g);
  if(mode === 'intro') return 'Operations starting…';
  if(mode === 'done') return 'All services complete.';
  const fm = liveFocus(L, g); if(fm) return `<b>${esc(fm.m.title)}</b>`;
  if(mode === 'sim') return `Simulating ${esc(dateShort(L.days[k].d))}…`;
  const A = liveAircraft(L, (S.fleet[0] || {}).uid, g, k);
  if(!A.F) return A.next ? `Ready · next <b>${esc(A.next.code)}</b> to ${esc(A.next.city)} at ${fmtTime(A.next.dep)}` : 'All services complete.';
  const back = A.p.back || A.p.st === 'turnH', code = back ? A.F.rcode : A.F.code;
  return `<b>${esc(code)}</b> ${back ? 'from' : 'to'} ${esc(A.F.city)} · <span class="${statusClass(A.p.label)}">${esc(cap(A.p.label))}</span>${['board', 'final', 'closed'].includes(A.p.st) ? ` · ${A.p.boarded} / ${A.F.seats}` : ''}`;
}
function liveCard(){
  const L = S.rnd.live; if(!L) return `${hqHead('Operations', 'LIVE')}<div class="pb"><p class="muted">Starting…</p></div>`;
  const g = liveNow(L), k = liveDay(L, g), iwb = iwbConnected();
  return `${hqHead('Operations', L.kind === 'day' ? 'LIVE' : 'RUNNING')}<div class="pb td2 lo-hq"><div class="live-clock"><span class="kl" id="loDay">${esc(dateShort(L.days[k].d))}</span><b id="ovClock">${fmtTime(g - k * 1440)}</b></div><div class="live-bar"><i id="ovProg"></i></div>
    <p class="lo-line" id="loPhase">${liveHqLine(L, g, k)}</p><div class="lo-pace" id="loPace">${livePaceButtons(L, 'hq')}</div>
    <div class="td-act">${iwb ? '<span class="muted">Live on the Operations Wall</span>' : '<button class="btn primary" data-ops="wall">▣ Watch on the Operations Wall</button>'}</div></div>`;
}
function livePaceButtons(L, where){
  const c = L.clock, r = c.rate, g0 = liveNow(L), m0 = liveMode(L, g0), comp = m0 === 'sim' || m0 === 'focus' || L.days[liveDay(L, g0)].style === 'compressed', b = (cmd, label, on, cls) => `<button class="btn ${cls || ''}" data-ops="${cmd}" aria-pressed="${!!on}">${label}</button>`;
  return [b('x1', '1× Live', r === 1), b('x2', '2×', r === 2), b('next', comp ? '⏭ Next event' : '⏭ Next flight'), r ? b('pause', '⏸ Pause') : b('play', '▶ Resume', false, 'primary'), b('summary', '⏩ Skip to summary')]
    .concat(where === 'wall' ? [b('sound', opsSoundOn() ? '🔊 Sound' : '🔇 Sound', opsSoundOn())].concat(!IS_DISPLAY ? [b('hq', '◀ HQ')] : []) : []).join('');
}
/* Pace commands: the HQ changes the clock and publishes it; the IWB window sends its buttons here. */
function opsCmd(cmd){
  const L = S && S.rnd && S.rnd.live; if(!L || !liveOn()) return;
  const now = Date.now(), c = L.clock, g = liveNow(L), intro = now < c.t0;
  const set = (g0, rate, keepIntro) => { L.clock = { t0: keepIntro && intro ? c.t0 : now, g0, rate, last: rate || c.last || 1 }; };
  if(cmd === 'x1' || cmd === 'x2' || cmd === 'x4') set(g, +cmd.slice(1), true);
  else if(cmd === 'pause') set(g, 0, false);
  else if(cmd === 'play') set(g, c.last || 1, false);
  else if(cmd === 'next') set(liveNextStop(L, g), c.rate || c.last || 1, false);
  else if(cmd === 'summary') set(L.end, c.rate || c.last || 1, false);
  else return;
  publish(); if(wallView) renderLiveWall();
}
function liveButton(cmd){
  if(cmd === 'wall'){ if(!IS_DISPLAY) setWallView(true); return; }
  if(cmd === 'hq'){ if(!IS_DISPLAY) setWallView(false); return; }
  if(cmd === 'sound'){ settings.opsSound = !opsSoundOn(); saveSettings(); if(opsSoundOn()){ liveAudioUnlock(); liveChime('ding'); } if(IS_DISPLAY || wallView) renderLiveWall(); return; }
  if(IS_DISPLAY){ send({ type:'ops', cmd }); return; }
  opsCmd(cmd);
}
document.addEventListener('click', e => { const b = e.target && e.target.closest ? e.target.closest('[data-ops]') : null; if(!b) return; e.preventDefault(); e.stopPropagation(); liveButton(b.getAttribute('data-ops')); }, true);

/* ---------- sound: a soft airport chime and short announcements, always shown as text too ---------- */
let loAC = null;
function liveAudioUnlock(){ try{ if(!loAC){ const C = window.AudioContext || window.webkitAudioContext; if(C) loAC = new C(); } if(loAC && loAC.state === 'suspended') loAC.resume(); }catch(e){} }
document.addEventListener('pointerdown', liveAudioUnlock, true);
function liveChime(kind){
  if(!loAC || !opsSoundOn()) return;
  const notes = kind === 'alert' ? [523, 415] : kind === 'good' ? [659, 784, 988] : [784, 659];
  try{ notes.forEach((f, i) => { const o = loAC.createOscillator(), gn = loAC.createGain(), t = loAC.currentTime + i * .32; o.type = 'sine'; o.frequency.value = f;
    gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(.1, t + .03); gn.gain.exponentialRampToValueAtTime(.0008, t + 1.1); o.connect(gn); gn.connect(loAC.destination); o.start(t); o.stop(t + 1.2); }); }catch(e){}
}
const loHeard = { id:null, g:0, done:{} };
function liveSounds(L, g){
  if(loHeard.id !== L.id){ loHeard.id = L.id; loHeard.g = g; loHeard.done = {}; return; }
  const from = loHeard.g; loHeard.g = g; if(g <= from) return;
  const due = L.cues.filter(q => q.g > from && q.g <= g && !loHeard.done[q.id]); due.forEach(q => { loHeard.done[q.id] = true; });
  const q = due[due.length - 1]; if(!q || g - q.g > 6 || !opsSoundOn()) return;     // jumped past it: stay quiet
  if(q.chime) liveChime(q.chime);
  if(q.say && document.body.classList.contains('tts')) setTimeout(() => speak(q.text), q.chime ? 700 : 0);
}

/* ---------- the Operations Wall ---------- */
let loWallLoop = false;
function liveWallLoop(){
  if(loWallLoop) return; loWallLoop = true;
  const tick = () => {
    if(!S || !liveOn() || !IS_DISPLAY){ loWallLoop = false; return; }
    renderLiveWall(); liveSounds(S.rnd.live, liveNow());
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function liveMapMode(on){
  if(!wallMap) return; const o = wallMap.o;
  if(on && !o.live){ o.live = true; o.keepPad = o.pad; o.pad = .12; o.maxZoom = 40; o.inset = { t:84, b:306, l:16, r:430 }; wallMap.key = ''; wallMap.manual = false; }
  if(!on && o.live){ o.live = false; o.pad = o.keepPad; o.maxZoom = 14; o.inset = null; wallMap.key = ''; wallMap.manual = false; }
}
function renderLiveWall(){
  if(!S || !S.rnd || !S.rnd.live || !wallMap) return;
  const L = S.rnd.live, g = liveNow(L), k = liveDay(L, g), D = L.days[k], mode = liveMode(L, g);
  $('wall').className = 'wall mode-ops lm-' + mode;
  $('clock').textContent = fmtTime(g - k * 1440);
  $('wPeriod').textContent = L.kind === 'day' ? (S.phase === 'setup' ? 'LAUNCH DAY' : "TODAY'S OPERATIONS") : S.period.type === 'gap' ? 'THE WEEKEND' : `WEEK ${weekNo(S.period.from)} OPERATIONS`;
  $('wDate').textContent = dateLong(D.d);
  const LM = { intro:['ready', '● STARTING'], live:['run', '● LIVE'], sim:['run', '▶▶ SIMULATING'], focus:['focus', '◉ SLOWED DOWN'], paused:['hold', '■ PAUSED'], done:['done', '✓ COMPLETE'] }[mode], lv = $('wLive');
  lv.className = 'w-live ' + LM[0]; lv.textContent = LM[1];
  liveBoards(L, g, k);
  const O = $('wOps'); O.hidden = false; loPut(O, liveOverlayHtml(L, g, k, mode));
  const st = $('wStatus'); st.className = 'w-status ops'; loPut(st, liveStripHtml(L, g, k, mode));
  $('wAlert').hidden = true; $('wSim').hidden = true; $('wOver').hidden = true;
  liveMapMode(true); wallMap.focus = null; wallMap.autoFit(); wallMap.render();
}
function liveBoards(L, g, k){
  const fl = L.flights.filter(F => F.k === k).sort((a, b) => a.sched - b.sched), gateOn = s => ['CHECK-IN', 'BOARDING', 'FINAL CALL'].includes(s);
  const time = (F, t) => F.delay && g >= (L.moments.find(m => m.kind === 'weather' && m.key === F.key) || { g:Infinity }).g ? `<span class="orange">${fmtTime(t)}</span>` : fmtTime(t);
  const dep = fl.map(F => { const s = liveDepStatus(L, F, g), gone = s === 'LANDED' || (s === 'AIRBORNE' && g > F.dep + 20);
    return `<tr class="${gone ? 'gone' : ''}"><td class="t">${time(F, F.dep - k * 1440)}</td><td class="f">${esc(F.code)}</td><td>${esc(F.city)}</td><td><span class="status ${statusClass(s)}">${s}${gateOn(s) ? ` G${esc(F.gate)}` : ''}</span></td></tr>`; }).join('');
  const arr = fl.slice().sort((a, b) => a.arr - b.arr).map(F => { const s = liveArrStatus(L, F, g), gone = s === 'LANDED' && g > F.arr + 15;
    return `<tr class="${gone ? 'gone' : ''}"><td class="t">${time(F, F.arr - k * 1440)}</td><td class="f">${esc(F.rcode)}</td><td>${esc(F.city)}</td><td><span class="status ${statusClass(s)}">${s}</span></td></tr>`; }).join('');
  $('dEmpty').hidden = fl.length > 0; $('aEmpty').hidden = fl.length > 0;
  loPut($('dRows'), dep); loPut($('aRows'), arr); $('dPage').textContent = ''; $('aPage').textContent = '';
}
function liveOverlayHtml(L, g, k, mode){
  if(mode === 'intro') return liveIntroHtml(L);
  const fm = liveFocus(L, g), parts = [fm ? '' : liveAnnHtml(L, g), liveCardsHtml(L, g, k)];
  if(fm) parts.push(liveFocusHtml(L, g, fm));
  if(!fm || fm.at === 'resuming') parts.push(mode === 'sim' || fm ? liveSimHtml(L, g, k) : liveFeatHtml(L, g, k));
  if(mode === 'paused') parts.push('<div class="lo-banner paused">■ PAUSED · press ▶ Resume to carry on</div>');
  return parts.join('');
}
function liveIntroHtml(L){
  const t = Date.now(), f = clamp(1 - (L.clock.t0 - t) / Math.max(1, L.intro), 0, 1), name = (S.airline.name || 'Your airline').toUpperCase(), on = L.flights.filter(F => !F.off), d0 = L.days[0];
  const routes = [...new Set(on.filter(F => F.k === 0).map(F => F.city))].join(' and '), p = planeById((S.fleet[0] || {}).planeId) || {};
  const sched = L.kind === 'day' ? `${plural(on.length, 'service')} to ${esc(routes)}` : `${plural(on.length, 'service')} over ${plural(L.days.length, 'day')}`;
  const items = [['Schedule received', sched], ['Aircraft ready', `${esc(p.name || '')} ${esc(regOf((S.fleet[0] || {}).uid))}`], ['Gates opening', [...new Set(on.filter(F => F.k === 0).map(F => 'Gate ' + F.gate))].join(' · ')]];
  return `<div class="lo-intro"><small>OPERATING PLAN APPROVED</small><h1>${esc(name)} OPERATIONS</h1><p class="li-when">${esc(L.kind === 'day' ? dateLong(d0.d) : fmtRange(d0.d, L.days[L.days.length - 1].d))}</p>
    <div class="li-list">${items.map(([a, b], i) => `<div class="${f > (i + 1) * .2 ? 'on' : ''}"><i>${f > (i + 1) * .2 ? '✓' : '…'}</i><b>${a}</b><span>${b}</span></div>`).join('')}</div>
    <div class="li-go ${f > .8 ? 'on' : ''}">● LIVE OPERATIONS STARTING</div></div>`;
}
function liveAnnHtml(L, g){
  const q = L.cues.filter(x => x.kind !== 'moment' && x.g <= g && g - x.g < 14).pop();
  return q ? `<div class="lo-ann a-${q.kind}"><span class="bell">🔔</span><span>${esc(q.text)}</span></div>` : '';
}
function liveCardsHtml(L, g, k){
  return `<div class="lo-cards">${S.fleet.map(fl => {
    const A = liveAircraft(L, fl.uid, g, k), p = planeById(fl.planeId), h = homeData();
    if(!A.fl.length) return '';
    let st = 'AT GATE', code = '—', rt = '—', pax = '—', eta = ['Next', '—'], cls = 's-scheduled';
    if(A.F){ const F = A.F, P = A.p, back = P.back || P.st === 'turnH' || P.st === 'done', r = routeById(F.route);
      st = P.st === 'turnA' || P.st === 'turnH' ? 'TURNAROUND' : P.st === 'checkin' || P.st === 'prep' ? 'PREPARING' : P.st === 'cruise' ? 'AIRBORNE' : P.label; cls = statusClass(st);
      code = back ? F.rcode : F.code; rt = back ? `${aptCode(r)} → ${h.code}` : `${h.code} → ${aptCode(r)}`;
      pax = `${P.st === 'board' ? P.boarded : P.st === 'turnH' || P.st === 'prep' ? 0 : F.sold} / ${F.seats}`;
      eta = P.at === 'air' || P.st === 'push' || P.st === 'taxi' ? ['ETA', fmtTime(P.eta)] : P.st === 'turnA' ? ['Leaves again', fmtTime(F.depAway)] : P.st === 'turnH' ? ['Ready again', fmtTime(F.ready)] : ['Departs', fmtTime(F.dep)]; }
    else if(A.prev){ st = 'READY'; cls = 's-landed'; eta = ['Ready since', fmtTime(A.prev.ready)]; }
    const nx = A.next ? `${esc(A.next.code)} · ${esc(A.next.city)} · ${fmtTime(A.next.dep)}` : 'No more services today';
    const fuel = !fuelPaid() ? 'Launch deal' : fuelContract() ? `${num(A.F ? A.F.fuelL : 0)} L at ${priceL(fuelPrice())}` : `${num(A.F ? A.F.fuelL : 0)} L from the tank`;
    return `<div class="lo-ac"><div class="ac-h"><b>${esc(regOf(fl.uid))}</b><span>${esc(p.name)}</span></div><div class="ac-st ${cls}">${esc(st)}</div>
      <dl><div><dt>Flight</dt><dd>${esc(code)} <small>${esc(rt)}</small></dd></div><div><dt>Passengers</dt><dd>${pax}</dd></div>${A.F ? `<div><dt>Fuel</dt><dd>${fuel}</dd></div>` : ''}<div><dt>${eta[0]}</dt><dd>${eta[1]}</dd></div><div><dt>Next</dt><dd>${nx}</dd></div></dl></div>`; }).join('')}</div>`;
}
const LF_STEPS = ['BOARDING', 'GATE CLOSED', 'TAXI', 'AIRBORNE', 'LANDED', 'TURNAROUND', 'RETURN', 'READY'];
function liveStepIndex(P){
  if(!P) return 7; if(['sched', 'checkin', 'prep', 'board', 'final'].includes(P.st)) return 0; if(P.st === 'closed') return 1;
  if(P.leg === 'out') return P.st === 'push' || P.st === 'taxi' ? 2 : P.st === 'taxiin' ? 4 : 3;
  if(P.st === 'turnA') return 5; if(P.leg === 'back') return 6; return 7;
}
function seatDots(seats, boarded, booked, waiting){
  let h = ''; for(let i = 0; i < seats; i++) h += `<i class="${i < boarded ? 'on' : i < booked ? 'bk' : 'em'}"></i>`;
  const w = waiting > 0 ? `<span class="lf-wait">${'<i></i>'.repeat(Math.min(waiting, 16))}<b>+${waiting} waiting</b></span>` : '';
  return `<div class="lf-seatrow"><div class="lf-seats ${seats > 40 ? 'xl' : seats > 24 ? 'l' : ''}">${h}</div>${w}</div>`;
}
function liveChecklist(title, items, u, foot){
  const n = items.length;
  return `<div class="lf-check"><b class="lf-ct">${esc(title)}</b>${items.map(([label, a, b], i) => { const done = u >= b, on = u >= a && u < b; return `<span class="${done ? 'done' : on ? 'on' : ''}"><i>${done ? '✓' : on ? '…' : '·'}</i>${label}</span>`; }).join('')}${foot ? `<span class="lf-cf">${foot}</span>` : ''}</div>`;
}
function liveFeatHtml(L, g, k){
  const uid = (S.fleet[0] || {}).uid, A = liveAircraft(L, uid, g, k), h = homeData(), rib = liveRibbon(L, g);
  const ribbon = rib ? `<div class="lf-rib k-${rib.kind}"><b>★ ${esc(rib.title)}</b><span>${esc(rib.sub)}</span></div>` : '';
  if(!A.F){
    const n = A.fl.length, pax = A.fl.reduce((t, F) => t + F.sold, 0);
    if(A.next){ const N = A.next, wx = liveWeatherAt(L, N, g);
      return `<div class="lo-feat st-ready">${ribbon}<div class="lf-h"><b class="lf-code">${esc(regOf(uid))}</b><span class="lf-rt">${esc(h.city)}</span><span class="lf-st s-landed">${A.prev ? 'READY AGAIN' : 'AT THE GATE'}</span></div>
        <div class="lf-b"><div class="lf-big">${A.prev ? fmtTime(A.prev.ready) : fmtTime(g - k * 1440)}<small>${A.prev ? 'ready again' : 'airport time'}</small></div><div class="lf-txt">Next: <b>${esc(N.code)}</b> to ${esc(N.city)}${wx ? ` · <span class="orange">delayed by the weather, now ${fmtTime(N.dep)}</span>` : ` at ${fmtTime(N.dep)}`}. Boarding opens at ${fmtTime(N.dep - LO.board)} at Gate ${esc(N.gate)}. <b>${N.sold}</b> passengers booked.</div></div>${liveSteps(null, true)}</div>`; }
    return `<div class="lo-feat st-done">${ribbon}<div class="lf-h"><b class="lf-code">${esc(regOf(uid))}</b><span class="lf-rt">${esc(h.city)}</span><span class="lf-st s-landed">ALL SERVICES COMPLETE</span></div>
      <div class="lf-b"><div class="lf-big">${plural(n, 'service')}<small>today</small></div><div class="lf-txt"><b>${num(pax)}</b> passengers carried. The aircraft is back at ${esc(h.code)} for the night.</div></div></div>`;
  }
  let F = A.F, P = A.p, tight = null;
  if(A.overlap && P.st === 'turnH'){ const NP = livePhase(A.next, g); if(['board', 'final', 'closed'].includes(NP.st)){ tight = F; F = A.next; P = NP; } }
  const r = routeById(F.route), reb = P.st === 'turnA' && P.u >= .7, back = P.back || P.st === 'turnH' || reb, code = back ? F.rcode : F.code, from = back ? aptCode(r) : h.code, to = back ? h.code : aptCode(r);
  const stl = reb ? 'BOARDING' : P.st === 'checkin' || P.st === 'prep' ? 'PREPARING' : P.label;
  const head = `<div class="lf-h"><b class="lf-code">${esc(code)}</b><span class="lf-rt">${esc(back ? r.city : h.city)} → ${esc(back ? h.city : r.city)}</span><span class="lf-gate">${back ? '' : 'GATE ' + esc(F.gate)}</span><span class="lf-st ${statusClass(P.st === 'turnH' || (P.st === 'turnA' && !reb) ? 'TURNAROUND' : stl)}">${esc(stl)}</span></div>`;
  const tightNote = tight ? `<div class="lf-tight">The aircraft is still being turned round: ready at <b>${fmtTime(tight.ready)}</b>, ${tight.ready >= F.dep ? 'no time to spare' : plural(F.dep - tight.ready, 'minute') + ' to spare'}.</div>` : '';
  let body = '';
  const empty = F.seats - F.sold, full = F.sold >= F.seats;
  if(['checkin', 'prep', 'sched'].includes(P.st)) body = `<div class="lf-big">${F.sold}<small>checked in</small></div>${seatDots(F.seats, 0, F.sold, 0)}<div class="lf-txt">Bags loading · fuel checked · cabin ready. Boarding at <b>${fmtTime(F.dep - LO.board)}</b>.</div>`;
  else if(P.st === 'board') body = `<div class="lf-big">${P.boarded} / ${F.seats}<small>boarded</small></div>${seatDots(F.seats, P.boarded, F.sold, 0)}<div class="lf-txt">${F.sold - P.boarded ? `${F.sold - P.boarded} still to board` : 'Everyone is on board'}${tightNote}</div>`;
  else if(P.st === 'final') body = `<div class="lf-big">${F.sold} / ${F.seats}<small>on board</small></div>${seatDots(F.seats, F.sold, F.sold, 0)}<div class="lf-txt">Final call for ${esc(F.code)}.${tightNote}</div>`;
  else if(P.st === 'closed') body = `<div class="lf-big ${full ? 'full' : ''}">${F.sold} / ${F.seats}<small>${full ? 'FULL LOAD' : plural(empty, 'empty seat')}</small></div>${seatDots(F.seats, F.sold, F.sold, full ? F.waiting : 0)}<div class="lf-txt">${full ? (F.waiting ? `Every seat taken. ${F.waiting} more ${F.waiting === 1 ? 'person' : 'people'} could not get a seat.` : 'Every seat taken.') : `${F.sold} passengers · ${plural(empty, 'empty seat')}`}${tightNote}</div>`;
  else if(P.st === 'turnA'){ const A0 = F.A, items = [['Passengers off', 0, .22], ['Bags unloaded', .22, .4], ['Fuel checked', .4, .55], ['Cabin cleaned', .55, .7], [`Boarding: ${P.boarded} / ${F.sold}`, .7, .995]];
    body = liveChecklist(`${r.city.toUpperCase()} TURNAROUND · ${A0} MIN`, items, P.u, P.u >= .98 ? `READY FOR ${esc(F.rcode)}` : '') + `<div class="lf-txt side">Landed at ${fmtTime(F.arrAway - legShape(F.L).land)} · leaves again at <b>${fmtTime(F.depAway)}</b></div>`; }
  else if(P.st === 'turnH'){ const items = [['Passengers off', 0, .3], ['Bags unloaded', .3, .55], ['Fuel and checks', .55, .8], ['Cabin cleaned', .8, .995]], N = A.next, nb = N && A.overlap ? livePhase(N, g) : null;
    body = liveChecklist(`${h.city.toUpperCase()} TURNAROUND · ${F.ready - F.arr} MIN`, items, P.u, P.u >= .98 ? `READY AGAIN · ${fmtTime(F.ready)}` : '') +
      `<div class="lf-txt side">${N ? (nb && (nb.st === 'board' || nb.st === 'final') ? `<span class="orange">${esc(N.code)} is already boarding at Gate ${esc(N.gate)}: ${nb.boarded} / ${N.sold}. It leaves at ${fmtTime(N.dep)}.</span>` : `Ready again at <b>${fmtTime(F.ready)}</b> · next: ${esc(N.code)} to ${esc(N.city)} at ${fmtTime(N.dep)}`) : `Ready again at <b>${fmtTime(F.ready)}</b> · no more services today`}</div>`; }
  else {   // on a leg
    const s = legShape(F.L), km = routeKm(r), left = Math.round(km * (1 - P.u)), cab = !back && F.ob && P.cruiseU >= .25 && P.cruiseU < .8;
    const big = { push:'PUSHBACK', taxi:'TAXI TO RUNWAY', takeoff:'TAKE-OFF', cruise:'AIRBORNE', desc:`DESCENDING INTO ${(back ? h.city : r.city).toUpperCase()}`, taxiin:`LANDED ${fmtTime((back ? F.arr : F.arrAway) - s.land)}` }[P.st];
    body = `<div class="lf-big air">${esc(big)}<small>${F.sold} passengers · ${P.st === 'taxiin' ? 'taxiing to the gate' : `ETA ${fmtTime(P.eta)}`}</small></div>
      <div class="lf-route"><b>${esc(from)}</b><div class="lf-track"><i style="width:${(100 * P.u).toFixed(1)}%"></i><span style="left:${(100 * P.u).toFixed(1)}%">✈</span></div><b>${esc(to)}</b></div>
      ${cab ? '' : `<div class="lf-txt">${P.at === 'air' ? `${num(left)} km to go` : P.st === 'taxiin' ? 'Taxiing to the gate' : 'On the ground'}</div>`}
      ${cab ? `<div class="lf-cab">${F.ob.free ? `<b>COMPLIMENTARY SERVICE</b><span>${F.ob.n} passengers enjoyed free snacks</span>` : `<b>CABIN SERVICE</b><span>${F.ob.n} passengers bought snacks · <em>+${money(F.ob.rev)}</em></span>`}</div>` : ''}`;
  }
  return `<div class="lo-feat st-${P.st}">${ribbon}${head}<div class="lf-b">${body}</div>${liveSteps(P)}</div>`;
}
function liveSteps(P, allDone){ const i = allDone ? 8 : liveStepIndex(P); return `<div class="lf-steps">${LF_STEPS.map((s, j) => `<span class="${j < i ? 'done' : j === i ? 'on' : ''}">${s}</span>`).join('')}</div>`; }
function liveFocusHtml(L, g, fm){
  const m = fm.m, F = L.flights.find(x => x.key === m.key), when = F ? `${WDAY[calDate(F.d).getUTCDay()].toUpperCase()} ${fmtTime(m.g - F.k * 1440)}` : '';
  const banner = fm.at === 'resuming' ? '<div class="lo-banner">▶▶ SIMULATION RESUMING</div>' : '<div class="lo-banner">◉ SIGNIFICANT EVENT · SIMULATION SLOWED</div>';
  if(fm.at !== 'event' && fm.at !== 'slowing') return banner;
  const seats = F && (m.kind === 'capacity' || m.kind === 'quiet') ? `<div class="lfo-s">${seatDots(F.seats, F.sold, F.sold, m.kind === 'capacity' ? F.waiting : 0)}</div>` : '';
  return `${banner}<div class="lo-focus k-${m.kind} ${fm.at} ${seats ? 'has-seats' : ''}"><div class="lfo-t"><small>${LO_KIND[m.kind] || 'EVENT'} · ${esc(when)}</small><h2>${esc(m.title)}</h2><p>${esc(m.sub)}</p><span class="lo-obs">👁 Watch · no decision needed</span></div>${seats}</div>`;
}
function liveSimHtml(L, g, k){
  const T = liveTotals(L, g, k), done = D => g >= D.end;
  const label = L.kind === 'day' ? 'THE DAY' : S.period.type === 'gap' ? 'THE WEEKEND' : `WEEK ${weekNo(S.period.from)}`;
  return `<div class="lo-sim"><div class="ls-h">▶▶ SIMULATING ${esc(label)}</div>
    <div class="ls-days">${L.days.map(D => `<span class="${done(D) ? 'done' : D.k === k ? 'on' : ''}">${esc(dateShort(D.d))}${done(D) ? ' ✓' : ''}</span>`).join('')}</div>
    <div class="ls-tot"><div><span>FLIGHTS COMPLETED</span><b>${T.done}</b></div><div><span>PASSENGERS</span><b>${num(T.pax)}</b></div><div><span>TICKETS AND SALES</span><b>${money(Math.round(T.rev))}</b></div>
      ${T.profit !== undefined ? `<div><span>PROFIT SO FAR</span><b class="${T.profit >= 0 ? 'green' : 'red'}">${money(Math.round(T.profit))}</b></div>` : ''}<div><span>ON TIME</span><b>${T.dep ? Math.round(100 * T.onTime / T.dep) : 100}%</b></div></div></div>`;
}
function liveStripHtml(L, g, k, mode){
  const T = liveTotals(L, g, k), M = { intro:'STARTING', live:'LIVE', sim:'SIMULATING', focus:'SLOWED', paused:'PAUSED', done:'COMPLETE' }[mode];
  return `<div class="lo-strip"><div class="ls-mode m-${mode}"><span>MODE</span><b>${M}</b></div>
    <div><span>SECTORS TODAY</span><b>${T.legsDone} / ${T.legs}</b></div><div><span>PASSENGERS</span><b>${num(L.kind === 'day' ? T.todayPax : T.pax)}</b></div>
    <div class="lo-ctl">${livePaceButtons(L, 'wall')}</div></div>`;
}

/* ---------- the map: aircraft at the gate, taxiing, flying with a lit trail, parked away; the storm ---------- */
function liveTrail(P, u, back){
  const target = P.total * clamp(u, 0, 1); let i = 1; while(i < P.pts.length - 1 && P.len[i] < target) i++;
  const a = P.pts[i - 1], b = P.pts[i], f = clamp((target - P.len[i - 1]) / ((P.len[i] - P.len[i - 1]) || 1), 0, 1), cur = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  return back ? [cur].concat(P.pts.slice(i)) : P.pts.slice(0, i).concat([cur]);
}
function liveMapDraw(M, toS, planesG){
  const L = S.rnd.live, g = liveNow(L), k = liveDay(L, g), ui = M.ui, h = homeData(), hp = toS([mx(h.lon), my(h.lat)]), fm = liveFocus(L, g), mode = liveMode(L, g);
  // the storm: it builds over the city, the delayed flight waits for it to pass
  L.moments.filter(m => m.kind === 'weather').forEach(m => {
    const F = L.flights.find(x => x.key === m.key); if(!F || g < m.g - 45 || g > F.dep + 15) return;
    const r = routeById(F.route), q = toS([mx(r.lon), my(r.lat)]), grow = clamp((g - (m.g - 45)) / 45, 0, 1), fade = clamp((F.dep + 15 - g) / 15, 0, 1), R = (24 + 70 * grow) * ui;
    const w = el('g', { 'class':'lo-storm', opacity:(.35 + .65 * Math.min(grow, fade)).toFixed(2), transform:`translate(${q[0].toFixed(1)} ${q[1].toFixed(1)})` }, planesG);
    el('circle', { r:R.toFixed(1), 'class':'lo-stormc' }, w); const t = el('text', { 'text-anchor':'middle', y:(12 * ui).toFixed(1), 'font-size':Math.round(38 * ui) }, w); t.textContent = '⛈';
  });
  S.fleet.forEach((fl, i) => {
    const A = liveAircraft(L, fl.uid, g, k); if(!A.fl.length) return;
    const F = A.F, P = A.p, gate = [hp[0] + 40 * i * ui, hp[1] + 46 * ui];
    let pos = gate, rot = 0, parked = true, label = '';
    if(F){
      const r = routeById(F.route), R = pathFor(r), dp = toS([mx(r.lon), my(r.lat)]), away = [dp[0], dp[1] + 46 * ui], lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      label = P.back || P.st === 'turnH' ? F.rcode : F.code;
      if(P.at === 'air'){
        const u = P.back ? 1 - P.u : P.u, pt = along(R, clamp(u, 0, 1)), q = toS([pt.x, pt.y]);
        const tr = liveTrail(R, u, P.back).map(p => toS(p)).map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
        el('polyline', { 'class':'lo-trail', points:tr }, planesG);
        pos = q; rot = pt.deg + (P.back ? 180 : 0); parked = false;
      } else if(P.st === 'push' || P.st === 'taxi'){ pos = P.back ? lerp(away, dp, P.ground) : lerp(gate, hp, P.ground); parked = false; rot = P.back ? 180 : 0; }
      else if(P.st === 'taxiin'){ pos = P.back ? lerp(hp, gate, P.ground) : lerp(dp, away, P.ground); parked = false; }
      else if(P.at === 'away') pos = away;
    }
    const featured = mode !== 'sim', hot = fm && F && fm.m.key === F.key, sz = (featured ? 46 : 38) * ui;
    const gp = el('g', { 'class':'lo-plane' + (parked ? ' parked' : '') + (hot ? ' hot' : ''), transform:`translate(${pos[0].toFixed(1)} ${pos[1].toFixed(1)})` }, planesG);
    if(featured || hot) el('circle', { 'class':'lo-halo', r:(sz * .62).toFixed(1) }, gp);
    const pl = el('g', { transform:`rotate(${rot.toFixed(1)})` }, gp); el('use', { href:'#pl-map', x:-sz / 2, y:-sz / 2, width:sz, height:sz }, pl);
    if(label && featured){ const t = el('text', { 'class':'lo-tag', 'text-anchor':'middle', y:(sz * .62 + 18 * ui).toFixed(1), 'font-size':Math.round(17 * ui) }, gp); t.textContent = label; }
  });
}
/* ---------- the summary on the wall: Day complete, Week complete ---------- */
function liveSummary(){
  const L = S.rnd.live; if(!L) return null;
  const on = L.flights.filter(F => !F.off), seats = on.reduce((t, F) => t + F.seats, 0), pax = on.reduce((t, F) => t + F.sold, 0);
  return { services:on.length, pax, full:on.filter(F => F.sold >= F.seats).length, empty:seats - pax, onTime:on.filter(F => F.delay < 15).length, waiting:on.reduce((t, F) => t + F.waiting, 0) };
}
/* For the tests: jump the clock to a moment and hold it there. */
window.__live = { seek(g, rate){ const L = S.rnd.live; if(!L) return null; L.clock = { t0:Date.now(), g0:g, rate:rate || 0, last:1 }; publish(); if(wallView) renderLiveWall(); return liveNow(L); },
  show(){ return S.rnd.live; }, now(){ return liveNow(); }, mode(){ const L = S.rnd.live; return L ? liveMode(L, liveNow(L)) : null; }, phase(key, g){ const F = S.rnd.live.flights.find(x => x.key === key); return F ? livePhase(F, g) : null; } };
