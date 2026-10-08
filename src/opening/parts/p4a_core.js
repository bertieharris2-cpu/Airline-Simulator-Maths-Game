<script>
(function(){
'use strict';
/* ==================================================================
   ENGINE — reads the data blocks above. Tuning lives in the data, not here.
   ================================================================== */
const $ = id => document.getElementById(id);
const J = id => JSON.parse($(id).textContent);
const PLANES = J('data-planes'), JOBS = J('data-jobs'), TABLES = J('data-tables'), PHASES = J('data-phases'), REVIEWS = J('data-reviews'),
      CHALLENGES = J('data-challenges'), WORLD = J('data-world'), TEXT = J('data-text'), FINS = J('data-fins');
const FLAG_ASPECT = {uk:2,ie:2,fr:1.5,es:1.5,us:1.9,ca:2,br:1.43,za:1.5,eg:1.5,ae:2,in:1.5,cn:1.5,jp:1.5,au:2,ke:1.5,ng:2,co:1.5,th:1.5,sg:1.5,kr:1.5,ma:1.5,ar:1.6};
// the opening prototype keeps its own saves, separate from the full game (file:// pages share storage in Chrome)
const KEY='airlineOpening.v1.state', OLD_KEY='airlineOpening.none', RUNS_KEY='airlineOpening.v1.runs', SET_KEY='airlineOpening.v1.settings', CH='airline-opening-v1';
const IS_DISPLAY = /[?&]display/.test(location.search);
const TEST_URL = /[?&]test/.test(location.search);
const SWATCHES = ['#ffc83d','#ff5a5a','#ff9a3d','#4cd97b','#6cc4ff','#c77dff','#ff7ab6','#f4f7fb','#2bd9c8','#1f7aff','#8bc34a','#ffd166'];
const planeById = id => PLANES.find(p => p.id === id);
const routeById = id => WORLD.routes.find(r => r.id === id);
const homeData = () => WORLD.homes.find(h => S && h.id === S.home) || WORLD.homes[0];

/* ---------- small helpers ---------- */
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
function r2(n){ return Math.round(n*100)/100; }
function num(n){ n = r2(n); const neg = n<0; n = Math.abs(n); let s = Number.isInteger(n) ? String(n) : n.toFixed(2); s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (neg?'−':'')+s; }
function priceL(n){ return '£'+Number(n).toFixed(2); }
function money(n){ const neg = n<0; return (neg?'−':'')+'£'+num(Math.abs(n)); }
function pad(n){ return (n<10?'0':'')+n; }
function fmtTime(min){ min = ((Math.round(min)%1440)+1440)%1440; return pad(Math.floor(min/60))+':'+pad(min%60); }
function toMin(hhmm){ const p = String(hhmm).split(':'); return parseInt(p[0],10)*60+parseInt(p[1],10); }
function fmtDur(min){ min = Math.round(min); const h = Math.floor(min/60), m = min%60; return h ? (m ? `${h} h ${pad(m)}` : `${h} h`) : `${m} min`; }
function fmtHours(h){ return fmtDur(h*60); }
function fmtTimeDay(min){ const d = Math.floor(min/1440); return fmtTime(min) + (d >= 1 ? (d===1 ? ' next day' : ` +${d} days`) : ''); }
/* CALENDAR: the pupil sees dates, never "Round". Day 1 is the workbook's startDate (Launch Day, Monday 2 September 2030,
   the set-up flight); S.day is the workbook's day number and S.round the beat in force (p4k_chapter.js). */
const WB0 = (() => { try { return J('data-workbook'); } catch(e){ return null; } })();
const START_ISO = (WB0 && WB0.settings && WB0.settings.startDate) || '2030-09-02';
const CAL0 = Date.UTC(+START_ISO.slice(0, 4), +START_ISO.slice(5, 7) - 1, +START_ISO.slice(8, 10)) - 86400000, WDAY = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], MONTH = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function calDate(n){ return new Date(CAL0 + (n === undefined ? (S && S.day !== undefined ? S.day : 0) : n) * 86400000); }
function dateLong(n){ const d = calDate(n); return `${WDAY[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH[d.getUTCMonth()]} ${d.getUTCFullYear()}`; }
function dateShort(n){ const d = calDate(n); return `${WDAY[d.getUTCDay()].slice(0,3)} ${d.getUTCDate()} ${MONTH[d.getUTCMonth()].slice(0,3)}`; }
function dayName(n){ return WDAY[calDate(n).getUTCDay()]; }
function dayTag(n){ n = n === undefined ? (S && S.day !== undefined ? S.day : 0) : n; return n > 0 && S && S.phase !== 'setup' ? 'Day ' + n : 'Launch day'; }
/* AIRLINE STRATEGY (Visual Polish & Strategy brief): chosen in setup, shown as the airline's identity.
   For now it changes the story's words, not the numbers; economic modifiers come after testing. */
const STRATEGIES = [
  { id:'premium', name:'Premium', badge:'Premium airline', slogan:'Make flying feel special', tags:['Higher fares', 'Better service', 'Higher expectations'], fares:3, service:5, volume:2, levels:['Higher', 'High', 'Lower'], seats:2, rows:3,
    text:'Charge more, carry fewer people, and build a reputation passengers trust.' },
  { id:'full', name:'Full Service', badge:'Full-service airline', slogan:'Balance price, comfort and profit', tags:['Flexible', 'Moderate fares', 'Balanced expectations'], fares:2, service:4, volume:3, levels:['Moderate', 'Good', 'Medium'], seats:3, rows:4,
    text:'Balance price and quality. Adapt as the airline grows.' },
  { id:'value', name:'Value', badge:'Value carrier', slogan:'Keep fares low and planes full', tags:['Low fares', 'More passengers', 'Tight margins'], fares:1, service:3, volume:4, levels:['Lower', 'Standard', 'Higher'], seats:4, rows:6,
    text:'Keep costs and fares down. Success comes from filling the aircraft.' } ];
function strategyOf(){ return S && S.airline && S.airline.strategy ? STRATEGIES.find(x => x.id === S.airline.strategy) : null; }
function plural(n, s){ return n+' '+s+(n===1?'':'s'); }
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function flagSvg(id, h){ const a = FLAG_ASPECT[id]||1.5; return `<svg class="flag" viewBox="0 0 ${a*10} 10" style="height:${h}px;width:${a*h}px" aria-hidden="true"><use href="#flag-${id}" width="${a*10}" height="10"/></svg>`; }
function planeSvg(plane, cls){ return `<svg class="plane-svg ${cls||''}" viewBox="0 0 120 48" aria-hidden="true" style="fill:var(--c1)"><use href="#pl-${plane.icon}"/></svg>`; }
function finSvg(id, size){ return `<svg class="fin" viewBox="0 0 40 40" style="width:${size||32}px;height:${size||32}px" aria-hidden="true"><use href="#fin-${id||'stripe'}"/></svg>`; }
function starsHtml(rep){ let h=''; for(let i=1;i<=5;i++){ if(rep>=i) h+='★'; else if(rep>=i-0.5) h+='<span style="position:relative;display:inline-block"><span class="off">★</span><span style="position:absolute;left:0;top:0;width:50%;overflow:hidden">★</span></span>'; else h+='<span class="off">★</span>'; } return h; }
function sayBtn(text){ return `<button class="say" data-say="${esc(text)}" aria-label="Read aloud" title="Read aloud">🔊</button>`; }
function toast(msg){ document.querySelectorAll('.toast').forEach(x => x.remove()); const t = document.createElement('div'); t.className='toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(()=>t.remove(), 2600); }
function b64e(s){ return btoa(unescape(encodeURIComponent(s))); }
function b64d(s){ return decodeURIComponent(escape(atob(s))); }
function utcLabel(u){ if(!u) return 'same time as home'; const s = u>0?'+':'−', a = Math.abs(u); return s+(Number.isInteger(a)?a:Math.floor(a)+'½')+' h from home'; }

/* ---------- read-aloud (progressive enhancement) ---------- */
let voice = null;
function initSpeech(){
  if(!('speechSynthesis' in window)) return;
  const pick = () => { const vs = speechSynthesis.getVoices(); if(!vs.length) return false; voice = vs.find(v=>/en[-_]GB/i.test(v.lang)) || vs.find(v=>/^en/i.test(v.lang)) || vs[0]; document.body.classList.add('tts'); return true; };
  if(!pick()){ speechSynthesis.addEventListener('voiceschanged', pick); setTimeout(pick, 1500); }
}
function speak(text){ try{ speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/£(\d[\d,]*(\.\d+)?)/g,'$1 pounds')); if(voice) u.voice = voice; u.rate = 0.95; speechSynthesis.speak(u); }catch(e){} }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.say'); if(b) speak(b.getAttribute('data-say')); });


/* ---------- teacher settings (persist across runs) ---------- */
const defaultSettings = () => ({ nudge:false, auto:true, flightSecs:7, startingCash: WORLD.startingCash, tableMode:'shown', liveTables:'script', practiceQuestionsPerDay:null });   // practice: null = the workbook's setting
let settings = defaultSettings();
try{ const s = JSON.parse(localStorage.getItem(SET_KEY)||'null'); if(s) settings = Object.assign(defaultSettings(), s); }catch(e){}
function saveSettings(){ try{ localStorage.setItem(SET_KEY, JSON.stringify(settings)); }catch(e){} }

/* ---------- state ---------- */
let S = null;
function emptyRnd(){ return { flights:[], status:{}, why:[], reviews:[], tasks:[], open:null, brief:[], tables:{}, activeTable:null }; }
function newState(){
  return { v:5, world:WORLD.id, phase:'setup', round:0, day:1, period:{ type:'setup', from:1, to:1, run:{kind:'one'} }, ledger:{ rev:[], cost:[], pax:[], seats:[] }, home: WORLD.homes[0].id, terminal:'t5',
    airline:{ name:'', code:'', flightCode:'', logo:null, c1:'#f4f7fb', c2:'#1f7aff', fin:'stripe', strategy:null },
    cash: settings.startingCash, rep: WORLD.startingReputation, fuel:0, fuelValue:0,
    fleet:[], prices:{}, nextUid:1,
    steps:[{t:'welcome'},{t:'name'},{t:'code'},{t:'logo'},{t:'paint'},{t:'reveal'},{t:'cert'},{t:'boot'},{t:'chapter'},{t:'starter'},{t:'market'},{t:'demand'},{t:'rotation'},{t:'plan'},{t:'workings'},{t:'ready'},{t:'takeoff'},{t:'fly'},{t:'results'}], si:0, textSize:0, typed:0,
    rnd: emptyRnd(), log:[], history:[], newRoutes:[], dec:{ fuelBuys:[], planeBought:null, held:null, loan:null },
    teacherQueue:{add:[],remove:[]}, nextMods:{ground:[], event:null},
    fuelDiscount:0, overlay:null, finished:false, startedAt:Date.now() };
}
/* Saves from before workbook v4 (the May 2030 calendar) cannot carry on: the game starts again. */
function migrate(s){
  if(!s) return null;
  if(s.v===5 && s.steps) return s;
  return null;
}
function migrateOld(s){
  if(!s) return null;
  if(s.v===4 && s.steps) return s;
  if(s.v===3 && s.steps){   // before the calendar sped up: keep the airline, start the matching beat again
    s.v = 4; s.ledger = { rev:[], cost:[], pax:[], seats:[] };
    if(s.phase === 'setup'){ s.day = 0; s.period = { type:'setup', from:0, to:0, run:{kind:'one'} }; return s; }
    s.round = Math.min(s.round, 9); s.day = undefined; s.rnd = emptyRnd(); s.overlay = null; s.needsRestart = true; s.migratedFrom = 3; fixOldHistory(s); return s;
  }
  if(s.v===2 && s.phase==='round' && s.fleet && s.fleet.length){
    s.v = 3; s.fleet.forEach(f => { if(!f.schedule) f.schedule = f.route ? [f.route] : []; });
    s.v = 4; s.ledger = { rev:[], cost:[], pax:[], seats:[] }; s.round = Math.min(s.round, 9);
    s.rnd = emptyRnd(); s.overlay = null; s.needsRestart = true; s.migratedFrom = 2; delete s.lastCalcSig; fixOldHistory(s); return s;
  }
  return null;
}
/* Old saves kept one history entry per round: give each a date, and rebuild the daily ledger from them. */
function fixOldHistory(s){ (s.history || []).forEach(h => { if(h.from === undefined){ h.from = h.to = h.round || 0; h.type = h.round ? 'day' : 'setup'; }
  const L = s.ledger; L.rev[h.from] = h.revenue || 0; L.cost[h.from] = h.costs || 0; L.pax[h.from] = h.pax || 0; L.seats[h.from] = h.seats || 0; }); }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
function load(){ try{ const s = JSON.parse(localStorage.getItem(KEY)||'null'); if(s) return migrate(s); const o = JSON.parse(localStorage.getItem(OLD_KEY)||'null'); return migrate(o); }catch(e){} return null; }
function saveCode(){ const c = Object.assign({}, S); delete c.roundStart; return 'ASIM5.'+b64e(JSON.stringify(c)); }
function loadCode(code){ code = String(code||'').trim(); const m = code.match(/^ASIM([2345])\.(.*)$/); if(!m) throw new Error('Not a save code'); const s = migrate(JSON.parse(b64d(m[2]))); if(!s) throw new Error('This code is from an older version of the game — start a new game'); return s; }
function loadRuns(){ try{ const r = JSON.parse(localStorage.getItem(RUNS_KEY)||'[]'); return Array.isArray(r)?r:[]; }catch(e){ return []; } }
function recordRun(checkpoint){
  if(!S.airline.name || (S.finished && !checkpoint)) return;
  const runs = loadRuns();
  runs.push({ world:WORLD.name, name:S.airline.name, rounds:S.round, day:S.day, gameDate:dateShort(S.day), cash:Math.round(S.cash), rep:S.rep, fleet:S.fleet.map(f=>planeById(f.planeId).name), date:new Date().toISOString().slice(0,10), checkpoint:!!checkpoint });
  try{ localStorage.setItem(RUNS_KEY, JSON.stringify(runs)); }catch(e){}
  if(!checkpoint) S.finished = true;
}

/* ---------- sync between windows ---------- */
let bc = null; try{ bc = new BroadcastChannel(CH); }catch(e){}
let displayWin = null, lastPong = 0;
function send(msg){
  try{ if(bc) bc.postMessage(msg); }catch(e){}
  try{ if(displayWin && !displayWin.closed) displayWin.postMessage(msg, '*'); }catch(e){}
  try{ if(IS_DISPLAY && window.opener) window.opener.postMessage(msg, '*'); }catch(e){}
}
function publish(){ save(); send({type:'state', state:S}); }
function onMessage(msg){
  if(!msg || !msg.type) return;
  if(IS_DISPLAY){
    if(msg.type==='state'){ S = msg.state; renderDisplay(); }
    if(msg.type==='ping') send({type:'pong'});
    if(msg.type==='present'){ const t = $('tapFs'); if(t && !document.fullscreenElement) t.hidden = false; }
    if(msg.type==='work'){ setWorkMode(msg.open); }
  } else {
    if(msg.type==='pong' || msg.type==='hello'){ lastPong = Date.now(); updateStrip(); if(msg.type==='hello') publish(); }
    if(msg.type==='ops') opsCmd(msg.cmd);
  }
}
if(bc) bc.onmessage = e => onMessage(e.data);
window.addEventListener('message', e => onMessage(e.data));
window.addEventListener('storage', e => { if(IS_DISPLAY && e.key===KEY){ const s = load(); if(s){ S = s; renderDisplay(); } } });
function openDisplay(){ try{ displayWin = window.open(location.pathname + '?display', 'airlineDisplay'); }catch(e){} setTimeout(publish, 800); }

/* ==================================================================
   TIME — the one shared time module (CR2 Stage A). Every screen calls this.
   A trip = out + turnaround away + back. Between trips: a turnaround at home.
   ================================================================== */
const dayStart = () => toMin(WORLD.dayStart||'06:00'), dayEnd = () => toMin(WORLD.dayEnd||'22:00'), firstDep = () => (S && S.firstDep !== undefined && S.firstDep !== null) ? S.firstDep : toMin(WORLD.firstDeparture||'09:00');
const firstOf = (...v) => { for(const x of v) if(x !== undefined && x !== null) return x; return 45; };
const TIME = {
  leg(plane, route){ return legMinutes(plane, route); },                                           // one way, minutes
  away(plane, route){ return firstOf(route.turnaroundMin, plane.turnaroundMin, WORLD.turnaroundMin); }, // on the ground at the far end
  home(plane){ return firstOf(terminalData().turn, homeData().turnaroundMin, plane.turnaroundMin, WORLD.turnaroundMin); },   // on the ground at home between trips
  roundTrip(plane, route){ return 2*TIME.leg(plane, route) + TIME.away(plane, route); },               // out + one turnaround + back
  /* Every segment of a planned day, with start and end times (minutes from midnight). */
  day(plane, ids, start){
    start = start === undefined ? firstDep() : start;
    let t = start; const trips = [], segments = [];
    ids.forEach((id, k) => {
      const r = routeById(id);
      if(k > 0){ const h = TIME.home(plane); segments.push({kind:'home', start:t, end:t+h, k}); t += h; }
      const L = TIME.leg(plane, r), A = TIME.away(plane, r), dep = t;
      const segs = [{kind:'out', start:t, end:t+L, route:id, k}, {kind:'turn', start:t+L, end:t+L+A, route:id, k}, {kind:'back', start:t+L+A, end:t+2*L+A, route:id, k}];
      segments.push(...segs); t = dep + 2*L + A;
      trips.push({ route:id, k, dep, arriveAway:dep+L, leaveAway:dep+L+A, arr:t, segments:segs });
    });
    return { start, trips, segments, end:t, elapsed:t-start };
  },
  fits(plane, ids){ return ids.length <= 1 || TIME.day(plane, ids).end <= dayEnd(); }
};
/* Real distances from the chosen home airport (great circle), rounded: km to 10, flying time to 5 minutes. */
function routeKm(route, hh){ const h = hh || homeData(), la = route.alat !== undefined ? route.alat : route.lat, lo = route.alon !== undefined ? route.alon : route.lon, R = Math.PI / 180;
  const a = Math.sin((la - h.lat) * R / 2) ** 2 + Math.cos(h.lat * R) * Math.cos(la * R) * Math.sin((lo - h.lon) * R / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(a)) / 10) * 10; }
function legMinutes(plane, route, hh){ return Math.max(15, Math.round(routeKm(route, hh) / plane.speed * 60 / 5) * 5); }
function terminalData(){ const h = homeData(), T = h.terminals || []; return T.find(t => t.id === S.terminal) || T[0] || {}; }
function termCharge(){ return terminalData().charge || 0; }
/* Business travellers who only fly if there is an early service (before 08:00): more at a business airport and terminal. */
function earlyBonus(route){
  if(!route.biz || !S || !S.fleet) return 0;
  const early = S.fleet.some(f => { const s = schedOf(f); return s.includes(route.id) && TIME.day(planeById(f.planeId), s).trips.some(t => t.route === route.id && t.dep < 480); });
  return early ? Math.round(route.biz * (homeData().biz || 1) * (terminalData().biz || 1)) : 0;
}
function paxWant(route, fare){ return paxFor(route, fare) + earlyBonus(route); }
/* On-board sales and crew: what the day adds beyond tickets, flights and fuel. */
const ONBOARD = { none:{ label:'Nothing on board', sub:'No extra money, no extra cost' }, sell3:{ label:'Sell snacks at £3', price:3, share:0.5, costItem:1, sub:'Half of passengers buy · stock costs £1 an item' }, sell5:{ label:'Sell snacks at £5', price:5, share:0.3, costItem:1, sub:'3 in 10 passengers buy · stock costs £1 an item' }, free:{ label:'Free snacks', free:true, costPax:2, sub:'£2 a passenger · happier passengers' } };
function onboardOf(){ return ONBOARD[S.onboard || 'none'] || ONBOARD.none; }
function crewNeeded(sched){ const f = S.fleet[0]; if(!f) return 1; const s = sched || schedOf(f); if(!s.length) return 1; return TIME.day(planeById(f.planeId), s).elapsed > (WORLD.crewDutyMin || 540) ? 2 : 1; }
function dayExtras(fl){
  const flown = fl.filter(f => !f.grounded && !f.noFuel), ob = onboardOf(), by = {};
  let term = 0, obRev = 0, obCost = 0, buyers = 0;
  flown.forEach(f => { const x = by[f.route] || (by[f.route] = { pax:0 }); x.pax += f.sold; term += f.termCost || 0; });
  Object.keys(by).forEach(id => { const x = by[id]; x.buyers = ob.share ? Math.floor(x.pax * ob.share) : 0; x.obRev = x.buyers * (ob.price || 0); x.obCost = ob.free ? x.pax * ob.costPax : x.buyers * (ob.costItem || 0); obRev += x.obRev; obCost += x.obCost; buyers += x.buyers; });
  const crews = flown.length ? crewNeeded() : 1;
  return { term, obRev, obCost, buyers, crews, crew: crews > 1 ? (WORLD.crewCost || 300) : 0, byRoute: by, free: !!ob.free };
}
/* The test cases from Change Request 2 — run from the teacher panel ("Check the time maths"). */
function timeSelfTest(){
  const p = planeById('dhc6'), par = routeById('par'), mad = routeById('mad'), out = [];
  const t = (name, got, want) => out.push({ name, got, want, ok: got === want });
  t('Twin Otter to Paris, one way', fmtDur(TIME.leg(p, par)), '1 h 30');
  t('One round trip to Paris', fmtDur(TIME.roundTrip(p, par)), '3 h 45');
  t('Depart 09:00, one Paris round trip: back at', fmtTime(TIME.day(p, ['par'], toMin('09:00')).end), '12:45');
  const two = TIME.day(p, ['par','par'], toMin('09:00'));
  t('Two Paris round trips: second departure', fmtTime(two.trips[1].dep), '13:30');
  t('Two Paris round trips: final return', fmtTime(two.end), '17:15');
  t('Two Paris round trips: total elapsed', fmtDur(two.elapsed), '8 h 15');
  t('Madrid one way', fmtDur(TIME.leg(p, mad)), '4 h');
  t('Madrid round trip', fmtDur(TIME.roundTrip(p, mad)), '8 h 45');
  return out;
}

/* ==================================================================
   WORLD & ECONOMY (deterministic — no randomness anywhere here)
   ================================================================== */
function roundData(n){
  const R = WORLD.rounds; if(n < R.length) return R[n];
  const last = Object.assign({}, R[R.length-1]); delete last.event; delete last.challenge; delete last.finale; delete last.checkpoint; last.brief = 'Another day in the skies.'; last.news = []; return last;
}
function fuelPrice(n){ return roundData(n===undefined?S.round:n).fuel; }
function phaseOf(n){ n = Math.max(1, n === undefined ? S.round : n); const p = PHASES.find(x => n >= x.from && n <= x.to); return p ? p.phase : PHASES[PHASES.length-1].phase; }
function unlocked(feature){ return PHASES.some(p => p.phase <= phaseOf() && (p.unlocks||[]).includes(feature)); }
function routeOpen(r){ return (r.unlockPhase || 1) <= phaseOf(); }
function seatsOf(f){ const p = planeById(f.planeId); return f.layout==='squeeze' ? Math.round(p.seats*1.15) : f.layout==='comfy' ? Math.round(p.seats*0.8) : p.seats; }
function layoutSeats(plane){ return { squeeze:Math.round(plane.seats*1.15), standard:plane.seats, comfy:Math.round(plane.seats*0.8) }; }
function fuelForTrip(plane, route){ return Math.round(plane.fuelUse * 2 * routeKm(route) / 100 / 10) * 10; }          // out and back
function schedOf(f){ return f.schedule && f.schedule.length ? f.schedule : (f.route ? [f.route] : []); }
function canAddTrip(plane, sched, route){ if(!planeCanFly(plane, route)) return false; if(sched.length >= (WORLD.maxTrips||4)) return false; if(!sched.length) return true; return TIME.fits(plane, sched.concat([route.id])); }
function activeFleet(){ return S.fleet.filter(f => schedOf(f).length && !f.grounded); }
function dayFuel(f, sched){ const p = planeById(f.planeId); return (sched || schedOf(f)).reduce((u,id) => u + fuelForTrip(p, routeById(id)), 0); }
function fuelNeeded(){ return activeFleet().reduce((t,f)=> t + dayFuel(f), 0); }
function tankCapacity(){ return (WORLD.tankBase||5000) + S.fleet.reduce((t,f) => t + (planeById(f.planeId).tankAdd||0), 0); }
function tankSpace(){ return Math.max(0, tankCapacity() - S.fuel); }
function ceilLot(l, lot){ lot = lot || WORLD.fuelLot; return Math.max(lot, Math.ceil(l/lot)*lot); }
function tankRate(){ return S.fuel > 0 ? S.fuelValue / S.fuel : fuelPrice(); }     // exact £ per litre of what's in the tank
function avgFuelPrice(){ return r2(tankRate()); }                                    // for display only
function fuelValueOf(L){ return r2(L * tankRate()); }
/* The tank keeps each batch of fuel bought (litres and price); flights burn the oldest batch first. */
function fuelLots(){ if(!S.fuelLots) S.fuelLots = S.fuel > 0 ? [{ L:S.fuel, p:S.fuelValue / S.fuel }] : []; return S.fuelLots; }
/* A copy of the tank to try things on: take(L) returns what burning L litres would cost (anything missing at today's price). */
function fifoCursor(extra){
  const q = fuelLots().map(x => ({ L:x.L, p:x.p })); if(extra && extra.litres) q.push({ L:extra.litres, p:extra.price });
  return { take(L){ return r2(this.parts(L).reduce((t, x) => t + x.L * x.p, 0)); },
    parts(L){ let need = L; const out = []; while(need > 1e-9 && q.length){ const x = q[0], u = Math.min(x.L, need); out.push({ L:u, p:x.p }); x.L -= u; need -= u; if(x.L <= 1e-9) q.shift(); } if(need > 1e-9) out.push({ L:need, p:fuelPrice(), missing:true }); return out; } };
}
function flightsWorth(){ const n = fuelNeeded(); return n > 0 ? Math.floor(S.fuel / n) : 0; }
function demandAt(route, price, n){ const w = roundData(n===undefined?S.round:n); const dm = w.demandMod || {}; const mod = (dm[route.id] || 0) + (dm.focus && S.rnd && route.id === S.rnd.focusRoute ? dm.focus : 0); const n0 = n===undefined ? S.round : n, grow = n0 >= 2 && route.growth ? Math.min(route.cap || Infinity, route.growth * (n0 - 1)) : 0;   // word spreads: more people each round
  const base = Math.floor((route.baseDemand + grow + mod) * (1 + homeData().demandPct/100)); return Math.max(0, Math.floor(base - route.drop * (price - route.basePrice) / route.step)); }
/* Reputation is switched off for now (teacher's decision): it stays at the starting value and is not shown.
   It returns when the pupil chooses what sort of airline to be. */
function repLive(){ return !!(typeof WORLD !== 'undefined' && WORLD.reputationOn); }
function repFactor(){ return 1 + 0.1*(S.rep - 3); }
/* People who will actually fly with us at this fare (reputation, then the rival). */
function paxFor(route, fare){ let pax = Math.floor(demandAt(route, fare) * repFactor()); const c = competitorPrice(route); if(c !== undefined && c < fare) pax = Math.floor(pax*0.8); return pax; }
function competitorPrice(route, n){
  const w = roundData(n===undefined?S.round:n); if(!w.competitor) return undefined;
  if(w.competitor[route.id] !== undefined) return w.competitor[route.id];
  if(w.competitor.focus !== undefined && S.rnd && route.id === S.rnd.focusRoute) return Math.floor(route.basePrice * w.competitor.focus / 5) * 5;
  return undefined;
}
function ownedRoutes(){ const out = []; S.fleet.forEach(f => schedOf(f).forEach(id => { if(!out.includes(id)) out.push(id); })); return out; }
function planeCanFly(plane, route){ return plane.range >= routeKm(route); }
function airlineCode(name){ const w = name.replace(/[^A-Za-z ]/g,'').trim().split(/\s+/); let c = w.length>=2 ? w[0][0]+w[1][0] : (w[0]||'AS').slice(0,2); return (c||'AS').toUpperCase(); }
function flightCode(idx, trip){ return (S.airline.code||'AS') + (101 + idx*20 + (trip||0)*2); }
function featuredFleet(){ return S.fleet.find(f => f.uid === S.rnd.featured) || activeFleet()[0]; }
function featuredFlights(){ const ff = featuredFleet(); return ff ? S.rnd.flights.filter(f => f.uid === ff.uid) : S.rnd.flights; }
function featuredFlight(){ const fl = featuredFlights(); return fl.slice().sort((a,b)=>b.revenue-a.revenue)[0] || S.rnd.flights[0]; }
function focusRoute(){ return S.rnd.focusRoute ? routeById(S.rnd.focusRoute) : null; }
/* Running cost of one service: an hourly cost for the time in the air (out and back) when the plane has one, plus the home landing fee. */
function flyHours(plane, route){ return 2 * legMinutes(plane, route) / 60; }
function runCostOf(plane, route){ return (route && plane.hourCost ? Math.round(plane.hourCost * flyHours(plane, route)) : plane.runCost) + homeData().fee; }
function fareOf(id){ return S.prices[id] || routeById(id).basePrice; }
/* Cost of n trips on a route: running (incl. landing fee) + fuel at the price paid for what's in the tank. */
function tripCosts(plane, route, n){ const run = runCostOf(plane, route)*n, fuel = fuelValueOf(fuelForTrip(plane, route) * n); return { run, fuel, total: r2(run + fuel) }; }
function fillText(s){ const r = focusRoute(); const c = r ? competitorPrice(r) : undefined; return String(s||'').replace(/\{city\}/g, r ? r.city : 'your route').replace(/\{price\}/g, c !== undefined ? money(c) : 'less').replace(/\{rival\}/g, WORLD.rival).replace(/\{(\w+)Demand\}/g, (m, id) => { const rr = routeById(id); return rr ? String(demandAt(rr, rr.basePrice)) : m; }); }

/* Plan every trip of the day (no fuel taken yet). A route's passengers are per day, shared across the trips flown there. */
function planFlights(){
  const out = [], left = {}, fifo = fifoCursor(S.rnd && S.rnd.fuelOrder);   // fuel is burned oldest batch first, in departure order
  const pool = (route, price) => { if(left[route.id] === undefined){ const comp = competitorPrice(route); left[route.id] = { pax: paxWant(route, price), demand: demandAt(route, price) + earlyBonus(route), comp, cut: comp !== undefined && comp < price }; } return left[route.id]; };
  S.fleet.forEach((f, i) => {
    const sched = schedOf(f); if(!sched.length) return;
    const plane = planeById(f.planeId), D = TIME.day(plane, sched);
    D.trips.forEach((tr, k) => {
      const route = routeById(tr.route), price = fareOf(tr.route);
      const base = { key:f.uid+'-'+k, uid:f.uid, trip:k, planeId:f.planeId, route:tr.route, code:flightCode(i, k), price, seats:seatsOf(f), layout:f.layout, dep:tr.dep, arr:tr.arr, segments:tr.segments, fuelL:fuelForTrip(plane, route), runCost:runCostOf(plane, route), reasons:[] };
      if(f.grounded){ out.push(Object.assign(base, {demand:0, sold:0, revenue:0, grounded:true, fuelL:0, runCost:0, fuelCost:0, reasons:['Grounded today, waiting for a spare part.']})); return; }
      const d = pool(route, price), sold = Math.min(base.seats, d.pax); d.pax -= sold;
      const reasons = [];
      if(k === 0 || sold < base.seats){ if(S.rep >= 4) reasons.push(`Your ${S.rep} star reputation brought extra passengers.`); if(S.rep <= 2) reasons.push(`Your ${S.rep} star reputation put some people off.`); }
      if(d.cut) reasons.push(`${WORLD.rival} was cheaper (£${num(d.comp)}), so 1 in 5 passengers went to them.`);
      if(k > 0 && sold < base.seats) reasons.push(`Earlier trips had already taken most of today's ${route.city} passengers.`);
      out.push(Object.assign(base, { demand:d.demand, sold, revenue: sold*price, termCost: sold * termCharge(), compCut:d.cut, reasons, fuelCost: fifo.take(base.fuelL) }));
    });
  });
  return out;
}
function forecastNow(){ const fl = planFlights(), X = dayExtras(fl); const income = fl.reduce((t,f)=>t+f.revenue,0) + X.obRev, over = fleetDayCost(), costs = r2(fl.reduce((t,f)=>t+f.runCost+f.fuelCost,0) + over + X.term + X.obCost + X.crew); return { income, costs, over, profit: r2(income-costs), fuelNeed: fuelNeeded(), fuelHave: S.fuel }; }

/* ==================================================================
   FORECAST TABLES — the model. Every number a sum uses is a row (CR4 s3).
   Row types: given, or calc (typed by the pupil when listed in the table's "typed" for this context).
   ================================================================== */
function isLive(){ return settings.liveTables !== 'none'; }
function tableKey(cols){ return JSON.stringify(cols.map(c => [c.id, c.values, c.disabled||''])); }
/* Create the table, or keep the pupil's progress if nothing in it has changed. */
function ensureTable(id, kind, cols, opts){
  opts = opts || {};
  const live = opts.live !== undefined ? opts.live : isLive(), mode = live ? (opts.mode || settings.tableMode) : 'fluent', key = tableKey(cols) + (opts.rowIds ? '|' + opts.rowIds.join(',') : '') + (opts.rows ? '|' + opts.rows.map(r => r.id + (r.tool || '')).join(',') : '');
  const typed = (TABLES[kind].typed || {})[opts.context || 'round'] || [];
  const old = S.rnd.tables[id];
  if(old && old.key === key && old.live === live && old.mode === mode){ S.rnd.activeTable = id; return old; }
  const t = { id, kind, key, cols, live, mode, onlyRows: typed, labels: opts.labels || {}, rowIds: opts.rowIds || null, rows: opts.rows || null, done:{}, chosen:{}, active:null, picked:null };
  // keep the answers in any column that hasn't changed (the three-option costing screen)
  if(old && old.kind === kind && old.mode === mode) cols.forEach(c => { const oc = old.cols.find(x => x.id === c.id); if(!oc || JSON.stringify(oc.values) !== JSON.stringify(c.values)) return;
    Object.keys(old.done).forEach(k => { if(k.startsWith(c.id + '|')) t.done[k] = old.done[k]; }); Object.keys(old.chosen).forEach(k => { if(k.startsWith(c.id + '|')) t.chosen[k] = old.chosen[k]; }); });
  S.rnd.tables[id] = t; S.rnd.activeTable = id;
  if(live && mode !== 'choose') t.active = nextOpenCell(t);      // the first sum opens by itself
  return t;
}
const tRows = t => { const all = t.rows || TABLES[t.kind].rows; return t.rowIds ? all.filter(r => t.rowIds.includes(r.id)) : all; };
const cellId = (c, r) => c + '|' + r;
function rowLabel(t, row){ return t.labels[row.id] || row.label; }
function rowLive(t, row){ return t.live && row.type === 'calc' && t.mode !== 'fluent' && t.onlyRows.includes(row.id); }
function cellState(t, col, ri){
  const rows = tRows(t), row = rows[ri];
  if(row.type === 'given') return 'given';
  for(let i=0;i<ri;i++){ const s = cellState(t, col, i); if(s === 'wait' || s === 'enter') return 'wait'; }
  if(rowLive(t, row)) return t.done[cellId(col.id, row.id)] ? 'done' : 'enter';
  return t.mode === 'fluent' && t.onlyRows.includes(row.id) ? 'tick' : 'derived';
}
function tableComplete(t){ return t.cols.every(c => tRows(t).every((r, ri) => !['wait','enter'].includes(cellState(t, c, ri)))); }
function nextOpenCell(t, after){
  const rows = tRows(t);
  if(after){ const pr = rows.find(r => r.id === after.row), col = t.cols.find(c => c.id === after.col);   // a two-answer sum stays in its column
    if(pr && pr.sentence && col){ const ri = rows.findIndex(r => r.sentence === pr.sentence && r.id !== pr.id && cellState(t, col, rows.indexOf(r)) === 'enter'); if(ri >= 0) return { col:col.id, row:rows[ri].id }; } } if(t.kind === 'options'){ for(const c of t.cols) for(let ri=0; ri<rows.length; ri++) if(cellState(t, c, ri) === 'enter') return { col:c.id, row:rows[ri].id }; return null; }   // one plan at a time
  for(let ri=0; ri<rows.length; ri++) for(const c of t.cols){ if(cellState(t, c, ri) === 'enter') return { col:c.id, row:rows[ri].id }; } return null; }
function operandValue(t, col, id){ return col.values[id]; }
function operandLabel(t, id){ const r = tRows(t).find(x => x.id === id); return r ? rowLabel(t, r) : id; }
function operandUnit(t, id){ const r = tRows(t).find(x => x.id === id); return r ? r.unit : /^(fare|price)/.test(id) ? '£' : 'n'; }
function fmtVal(unit, v){
  if(v === null || v === undefined) return '—';
  if(unit === '£') return money(v); if(unit === 'L') return num(v)+' L'; if(unit === 'ppl') return priceL(v); if(unit === 'dur') return fmtDur(v);
  if(unit === 'yesno') return v ? 'Yes' : 'No';
  return num(v);
}
const OPS = { '×':'×', '−':'−', '+':'+', '÷':'÷', 'min':'min' };
/* The sum in words with the numbers from the table — the same words on the IWB and on paper. */
function sumSentence(t, col, row){
  return (row.sentence || '').replace(/\{(\?)?(\w+)\}/g, (m, q, id) => { const u = operandUnit(t, id); return q ? '?' : fmtVal(u, col.values[id]); });
}
function cellExplain(t, col, row){ return row.sentence ? row.sentence.replace(/\{(\?)?(\w+)\}/g, (m, q, id) => fmtVal(operandUnit(t, id), col.values[id])) : fmtVal(row.unit, col.values[row.id]); }
function parseCell(unit, raw){ const s = String(raw||'').trim().toLowerCase().replace(/[−–]/g, '-').replace(/£|,|\s|litres?|people|trips?|l$/g,''); if(s === '') return null; const v = parseFloat(s.replace(/[^0-9.\-]/g,'')); return isNaN(v) ? null : v; }
function checkCell(t, col, row, raw){ const want = col.values[row.id], got = parseCell(row.unit, raw); if(got === null) return 'blank'; if(Math.abs(got - want) < 0.005) return 'ok'; return got > want ? 'high' : 'low'; }
/* "Choose the sum": did he tap the right two numbers and the right operation? */
function checkPair(row, picks, op){
  if(!row.from || picks.length !== 2) return false;
  if(op !== (OPS[row.op] || row.op)) return false;
  const [a, b] = row.from;
  if(['×','+','min'].includes(row.op)) return (picks[0] === a && picks[1] === b) || (picks[0] === b && picks[1] === a);
  return picks[0] === a && picks[1] === b;
}
/* Key numbers for the IWB working space: the open sum's sentence and its numbers. */
function pinnedFor(t){
  if(!t) return null;
  const a = t.active, col = a ? t.cols.find(c => c.id === a.col) : t.cols[0], row = a ? tRows(t).find(r => r.id === a.row) : null;
  if(!col) return null;
  const items = [{label: col.label, value: ''}];
  const ids = row && row.from ? row.from : tRows(t).filter(r => r.type === 'given').map(r => r.id);
  ids.forEach(id => items.push({ label: operandLabel(t, id), value: fmtVal(operandUnit(t, id), operandValue(t, col, id)) }));
  return { title: row ? sumSentence(t, col, row) : TABLES[t.kind].title, items, key: t.id + '|' + t.key };
}
/* Parts of a cost, for the "What's in this?" link. */
function costParts(plane, route, n){ const L = fuelForTrip(plane, route)*n, c = tripCosts(plane, route, n); return [ ['Running cost', money(plane.runCost*n)], ['Landing fee', money(homeData().fee*n)], [`Fuel: ${num(L)} L × ${priceL(avgFuelPrice())}`, money(c.fuel)] ]; }

/* ---- builders: one per job. Each column carries every value its rows need. ---- */
function tripsOn(f, routeId){ return schedOf(f).filter(id => id === routeId).length; }
function fareList(r, spec, opts){
  const list = r.prices.slice().sort((x,y)=>x-y), cur = fareOf(r.id), i = Math.max(0, list.indexOf(cur));
  if(!spec){ const lo = clamp(i-1, 0, Math.max(0, list.length-3)); return list.slice(lo, lo+3); }
  const out = []; spec.forEach(k => { let v = k === 'current' ? cur : k === 'down' ? list[Math.max(0, i-1)] : k === 'up' ? list[Math.min(list.length-1, i+1)] : k === 'rival' ? competitorPrice(r) : Number(k); if(v !== undefined && !out.includes(v)) out.push(v); });
  const near = list.filter(v => !out.includes(v)).sort((x,y) => Math.abs(x-cur) - Math.abs(y-cur));   // never fewer columns than asked for
  while(out.length < spec.length && near.length) out.push(near.shift());
  return out.sort((x,y) => x-y);
}
function buildPriceCols(f, routeId, opts){
  opts = opts || {};
  const p = planeById(f.planeId), r = routeById(routeId), trips = opts.trips !== undefined ? opts.trips : Math.max(1, tripsOn(f, routeId)), seatsPer = seatsOf(f);
  const fares = opts.prices || fareList(r, opts.fares), cost = tripCosts(p, r, trips).total, cur = fareOf(routeId);
  return fares.map(fare => { const people = paxFor(r, fare), seats = trips*seatsPer, sold = Math.min(people, seats), income = r2(sold*fare);
    return { id:'f'+String(fare).replace('.','_'), label: money(fare), sub: fare === cur && !opts.setup ? 'your price now' : (opts.rival && fare === competitorPrice(r) ? WORLD.rival + "'s price" : ''), values:{ people, seats, sold, fare, income, cost, profit: r2(income-cost) }, parts:{ cost: costParts(p, r, trips) }, fare }; });
}
function priceLabels(trips){ return trips > 1 ? { seats:`Seats on ${trips} trips`, cost:`Cost of ${trips} trips` } : {}; }
function buildTripsCountCols(f, routeId){ const r = routeById(routeId), people = paxFor(r, fareOf(routeId)), seats = seatsOf(f), full = Math.floor(people/seats); return [{ id:routeId, label:r.city, flag:r.flag, sub:'', values:{ people, seats, full, left: people - full*seats } }]; }
function buildTripsExtraCols(f, routeId, left){ const p = planeById(f.planeId), r = routeById(routeId), fare = fareOf(routeId), income = r2(left*fare), cost = tripCosts(p, r, 1).total; return [{ id:routeId, label:r.city, flag:r.flag, sub:'', values:{ left, fare, income, cost }, parts:{ cost: costParts(p, r, 1) } }]; }
function buildFuelCols(litres){
  const disc = S.fuelDiscount || 0, sups = (WORLD.suppliers||[]).filter(s => (s.fromPhase||1) <= phaseOf());
  return sups.map((s, i) => { const L = ceilLot(litres, s.lot), ppl = r2((fuelPrice() + s.priceDelta) * (1 - disc)); return { id:'s'+i, label: s.name, sub: sups.length > 1 ? (s.note||'') : '', values:{ litres:L, ppl, bill: r2(L*ppl) } }; });
}
function buildCabinCols(f){
  const p = planeById(f.planeId), ls = layoutSeats(p), sched = schedOf(f), rid = sched[0] || WORLD.setupRoutes[0], r = routeById(rid), cost = Math.round(tripCosts(p, r, 1).total), fare = fareOf(rid);    // whole pounds: the sum is about sharing, not pence
  const L = [['squeeze','Squeeze in','More seats'],['standard','Standard','As now'],['comfy','Roomy','Fewer seats']];
  return L.map(([id, label, sub]) => { const seats = ls[id], each = Math.floor(cost/seats); return { id, label, sub, values:{ seats, cost, each, rest: r2(cost - each*seats), fare, breakEven: Math.ceil(cost/fare) }, parts:{ cost: costParts(p, r, 1) } }; });
}
function buildPlaneColsM(ids){ const res = reserveNow(); return ids.map(id => { const p = planeById(id), after = r2(S.cash - p.price); return { id, label: p.name, sub: `${p.seats} seats`, values:{ cash:S.cash, price:p.price, after, reserve:res, safe: after >= res, dayCost:p.dayCost||0 }, disabled: after < 0 ? "Can't afford it yet" : '' }; }); }
function buildPlaneCols(ids){ return ids.map(id => { const p = planeById(id), after = r2(S.cash - p.price); return { id, label: p.name, sub: `${p.seats} seats`, values:{ cash:S.cash, price:p.price, after, ppf:p.typicalProfit, payback: Math.ceil(p.price/p.typicalProfit) }, disabled: after < 0 ? "Can't afford it yet" : '' }; }); }
function dayNumbers(f, sched){
  const p = planeById(f.planeId), seats = seatsOf(f), D = TIME.day(p, sched), left = {}; let passengers = 0, income = 0, costs = 0;
  sched.forEach(id => { const r = routeById(id), fare = fareOf(id); if(left[id] === undefined) left[id] = paxFor(r, fare); const sold = Math.min(seats, left[id]); left[id] -= sold; passengers += sold; income += sold*fare; costs += tripCosts(p, r, 1).total; });
  const fares = [...new Set(sched.map(fareOf))];
  return { time: D.elapsed, passengers, income: r2(income), cost: r2(costs), profit: r2(income - costs), fare: fares.length === 1 ? fares[0] : null };
}
function buildDayCols(f, planA, planB){
  return [['a', planA, "Today's plan"], ['b', planB, 'Other plan']].map(([id, plan, sub]) => { const n = dayNumbers(f, plan);
    return { id, label: tripLabel(plan) || 'No trips', sub, plan: plan.slice(), values:{ time:n.time, passengers:n.passengers, fare:n.fare, income:n.income, cost:n.cost, profit:n.profit }, disabled: !TIME.fits(planeById(f.planeId), plan) ? 'Runs past closing time' : (n.fare === null ? 'Mixed prices' : '') }; });
}
/* The one-row income sum for "Carry on as usual" (CR4 s7). */
function buildQuickCols(f){
  const rid = S.rnd.focusRoute || schedOf(f)[0], r = routeById(rid), fl = planFlights().filter(x => x.uid === f.uid && x.route === rid), passengers = fl.reduce((t,x)=>t+x.sold,0), fare = fareOf(rid);
  return [{ id:rid, label:r.city, flag:r.flag, sub: plural(fl.length,'trip'), values:{ passengers, fare, income: r2(passengers*fare) } }];
}
function skillFluent(id){ return false; }          // the fluency engine arrives in CR4 Stage 4

/* ---------- the round: news, a choice, then the table he chose (CR4 s7) ---------- */
const CARRY_ON = { label:'Carry on as usual', do:'carryOn' };
function defaultChoice(w){
  const kind = { revenue:'fare', schedule:'trips', flight:'trips', fuel:'fuel', cabin:'cabin' }[w.calc || 'revenue'] || 'fare';
  const news = w.brief || 'A new day.';
  if(kind === 'fuel') return { trigger:'fuel', news, options:[Object.assign({sub:'Use the fuel in your tank'}, CARRY_ON), {label:'Top up', sub:'Buy 500 litres', do:'fuel', litres:500}, {label:'Stock up', sub:'Buy 2,000 litres', do:'fuel', litres:2000}] };
  if(kind === 'trips') return { trigger:'trips', news, options:[Object.assign({sub:"Keep today's trips"}, CARRY_ON), {label:'Look at the trips', sub:'How many trips do you need?', do:'trips'}] };
  if(w.calc === 'fleet' || kind === 'plane') return { trigger:'fleet', news, options:[Object.assign({sub:'Keep the planes you have'}, CARRY_ON), planeOption()] };
  if(kind === 'cabin') return { trigger:'cabin', news, options:[Object.assign({sub:'Keep the seats as they are'}, CARRY_ON), {label:'Look at the cabin', sub:'Compare three seat layouts', do:'cabin'}] };
  return { trigger:'fare', news, options:[Object.assign({sub:'Keep your ticket price'}, CARRY_ON), {label:'Look at your ticket price', sub:'Compare three prices', do:'fare'}] };
}
function buildChoice(w){
  const forced = S.teacherQueue && S.teacherQueue.choice;
  let c = JSON.parse(JSON.stringify(forced ? defaultChoice({calc: {fare:'revenue', trips:'schedule', fuel:'fuel', cabin:'cabin', plane:'fleet'}[forced], brief: w.brief}) : (w.choice || defaultChoice(w))));
  if(!c.options.some(o => o.do === 'carryOn')) c.options.unshift(Object.assign({}, CARRY_ON));
  const sty = strategyOf(); if(sty && c.trigger === 'rival'){ const r = focusRoute(), cp = r ? competitorPrice(r) : undefined, diff = r && cp !== undefined ? money(Math.max(0, fareOf(r.id) - cp)) : 'a little';
    c.news = { value:'{rival} has started a fare war on {city}.', premium:`{rival} is ${diff} cheaper on {city}. Do you match them, or trust passengers to pay more for your service?`, full:'{rival} is undercutting you on {city}. How should the airline respond?' }[sty.id]; }
  // "How many trips?" only makes sense when one plane can't carry everyone
  if(!forced){ const f = featuredFleet() || activeFleet()[0], rid = f && (schedOf(f)[0] || f.route); if(f && rid){ const fits = paxFor(routeById(rid), fareOf(rid)) <= seatsOf(f); if(fits) c.options = c.options.filter(o => o.do !== 'trips'); } }
  if(c.options.length < 2 && c.trigger === 'trips') c.options.push({ label:'Look at your ticket price', sub:'Compare three prices', do:'fare' });
  // one plane and money for another: the fleet choice comes back every other round until he buys
  // the next plane is a Year 1 decision, or comes sooner once the plane he is saving for is affordable with the emergency money kept
  const tp = targetPlane(), lastBuy = S.dec.planeBought ? S.dec.planeBought.day || 0 : -999, settled = S.day - lastBuy >= 90;   // a new plane needs a few months to bed in before the next
  const due = settled && (S.round >= (WORLD.rounds.findIndex(r => r.review === 'year') || 20) || (tp && investable() >= tp.price));
  if(!forced && periodType() === 'month' && due && !c.options.some(o => o.do === 'plane')){ const po = planeOption(); if(po.planes.length && investable() >= Math.min(...po.planes.map(id => planeById(id).price))){ po.sub = 'You can afford one and keep your emergency money'; c.options.push(po); } }
  const lastH = S.history[S.history.length-1];
  const prevH = S.history[S.history.length-2], lost = (h, f) => h && h.planes && h.planes[f.uid] && h.planes[f.uid].rev - h.planes[f.uid].cost < 0;
  if(!forced && inPeriodMode() && lastH && lastH.planes && S.fleet.length > 1){ const loser = S.fleet.find(f => schedOf(f).length && lost(lastH, f) && lost(prevH, f));
    if(loser && !c.options.some(o => o.do === 'move')){ const p = planeById(loser.planeId); c.options.push({ label:`Move the ${p.name}`, sub:`It lost money in ${periodShort(lastH)}. Give it a new route.`, do:'move', uid:loser.uid }); } }
  // never strand him: day by day, if today's trips need more fuel than the tank holds, buying fuel is always on offer
  const need = fuelNeeded(); if(!inPeriodMode() && need > S.fuel + 1e-9 && !c.options.some(o => o.do === 'fuel')) c.options.push({ label:'Buy fuel', sub:"Your tank can't cover today's trips", do:'fuel', litres: ceilLot(need - S.fuel) });
  if(inPeriodMode()) c.options.forEach(o => { if(o.do === 'carryOn' && /yesterday|today/.test(o.sub || '')) o.sub = 'Keep the timetable as it is'; });
  return c;
}
/* The next planes up from his first one, for the fleet choice. */
function planeOption(){ const own = S.fleet.map(f => f.planeId), i = Math.max(0, ...own.map(id => PLANES.findIndex(p => p.id === id))); const ids = PLANES.slice(i + 1, i + 4).map(p => p.id); return { label:'Look at a new plane', sub:'Compare '+ids.length+' planes before you buy', do:'plane', planes: ids }; }
function startRound(n){
  S.round = n; S.phase = 'round'; delete S.needsRestart;
  if(S.day === undefined || S.day === null || S.day < beatDay(n)) S.day = beatDay(n);
  const ptype = periodOf(n);
  let backTo = null;
  if(S.revertTrips){ const f = S.fleet.find(x => x.uid === S.revertTrips.uid); if(f && S.revertTrips.sched.length){ f.schedule = S.revertTrips.sched.slice(); f.route = f.schedule[0]; backTo = f.schedule.length; } delete S.revertTrips; }
  const w = roundData(n);
  S.fleet.forEach(f => { f.grounded = S.nextMods.ground.includes(f.uid); });
  S.nextMods.ground = [];
  const act = activeFleet();
  const feat = act.find(f => schedOf(f).includes(w.focus)) || act[(n-1) % Math.max(1, act.length)] || S.fleet[0];
  const focus = (w.focus && ownedRoutes().includes(w.focus)) ? w.focus : (feat ? schedOf(feat)[0] : null);
  S.rnd = Object.assign(emptyRnd(), { featured: feat ? feat.uid : null, focusRoute: focus, fuelBought:null, profit:null, event: S.nextMods.event || w.event || null, eventChoice:null, challenge: w.challenge ? CHALLENGES[Math.floor((n-1)/2) % CHALLENGES.length] : null, challengeDone:false });
  S.nextMods.event = null;
  S.rnd.choice = buildChoice(w); if(S.teacherQueue) delete S.teacherQueue.choice;
  S.rnd.brief = briefingLines(w); if(backTo) S.rnd.brief = [`Yesterday's change was for one day. Back to ${plural(backTo,'trip')} a day.`].concat(S.rnd.brief).slice(0, 2);
  S.period = newPeriod(ptype, S.day);
  if(ptype === 'day'){
    S.steps = [{t:'hq'}, {t:'choice'}, {t:'fly'}, {t:'results'}];
    if(S.rnd.event) S.steps.push({t:'event'}, {t:'eventOutcome'});
  } else {
    // weeks and months: a CEO alert stops the clock first, then HQ, the decision, the forecast and the run
    S.steps = [];
    if(w.stage && !(S.stages || {})[w.stage]){ S.steps.push({t:'stage', stage:w.stage}); (S.stages || (S.stages = {}))[w.stage] = true; }
    if(S.rnd.event) S.steps.push({t:'event'}, {t:'eventOutcome'});
    if(w.review) S.steps.push({t:'review', kind:w.review});
    S.steps.push({t:'hq'}, {t:'choice'}, {t:'forecast'}, {t:'sim'}, {t:'results'});
  }
  if(S.rnd.challenge) S.steps.push({t:'challenge'});
  S.steps.push({t:'summary'});
  S.si = 0; S.newRoutes = [];
  refreshPlan();
  addNews([{tag:'NEWS', text:fillText(S.rnd.choice.news)}].concat((w.news||[]).slice(0,1).map(t => ({tag:'NEWS', text:fillText(t)}))));
  delete S.roundStart; S.roundStart = JSON.stringify(S);   // for the teacher's "repeat this round"
  publish(); render();
}
/* After "What will you do?": put the steps for his choice between the choice and the flights. */
function chooseOption(i){
  const o = S.rnd.choice.options[i]; if(!o) return;
  S.rnd.chosen = i; S.rnd.opened = o.do;
  const steps = [];
  if(o.do === 'fare') steps.push({t:'fare', fares:o.fares||null});
  if(o.do === 'trips'){ steps.push({t:'trips', part:'count'}); if(unlocked('dayStep')) steps.push({t:'day'}); }
  if(o.do === 'fuel') steps.push({t:'fuel', litres:o.litres});
  if(o.do === 'cabin') steps.push({t:'cabin'});
  if(o.do === 'plane') steps.push({t:'plane', ids:(o.planes || planeOption().planes).slice()}, {t:'newRoute'});
  if(o.do === 'addRoute'){ const f = featuredFleet() || S.fleet[0]; if(f && o.route && canAddTrip(planeById(f.planeId), schedOf(f), routeById(o.route))) setSchedule(f.uid, schedOf(f).concat([o.route])); steps.push({t:'day', added:o.route}); }
  if(o.do === 'day') steps.push({t:'day'});
  if(o.do === 'move'){ S.rnd.newPlane = o.uid; steps.push({t:'newRoute', move:true}); }
  if(o.do === 'effect'){ const e = o.effects || {}; if(e.cash) S.cash = r2(S.cash + e.cash); if(e.rep && repLive()) S.rep = clamp(S.rep + e.rep, 1, 5); S.rnd.effectWhy = o.why || ''; addNews([{tag:'NEWS', text:fillText(o.label)}]); bankCheck(); }
  if(o.do !== 'fare' && !skillFluent('money.income') && !inPeriodMode()) steps.push({t:'quick'});
  const ci = S.steps.findIndex(s => s.t === 'choice');
  S.steps = S.steps.slice(0, ci+1).concat(steps, S.steps.slice(ci+1).filter(s => !['fare','trips','day','fuel','cabin','quick','plane','newRoute'].includes(s.t)));
  if(o.do !== 'fuel' && !inPeriodMode()) fuelCheck();       // never let "Carry on" ground the planes: a short tank means buying fuel first (days only: weeks and months top up)
  next();
}
function tripLabel(sched){ const c = {}, order = []; sched.forEach(id => { if(!c[id]){ c[id] = 0; order.push(id); } c[id]++; }); return order.map(id => `${routeById(id).city}${c[id]>1?' ×'+c[id]:''}`).join(' + '); }
function refreshPlan(){
  if(S.phase !== 'round') return;
  S.rnd.flights = planFlights(); S.rnd.flights.forEach(f => { if(S.rnd.status[f.key] === undefined) S.rnd.status[f.key] = f.grounded ? 'GROUNDED' : 'SCHEDULED'; });
  Object.keys(S.rnd.status).forEach(k => { if(!S.rnd.flights.some(f => f.key === k)) delete S.rnd.status[k]; });
}
/* Consequence lines: the briefing talks about his past decisions, not only the script. */
function briefingLines(w){
  const L = [], today = fuelPrice(), fb = S.dec.fuelBuys[S.dec.fuelBuys.length-1];
  if(fb && fb.round < S.round && S.fuel > 0 && fb.price < today) L.push(`You bought fuel at ${priceL(fb.price)} a litre. Today it costs ${priceL(today)}.`);
  else if(fb && fb.round < S.round && fb.price > today) L.push(`Fuel is cheaper today (${priceL(today)}) than the ${priceL(fb.price)} you paid.`);
  const ff = featuredFleet();
  if(ff && ff.layout==='squeeze') L.push('Your squeezed cabin is still costing you stars.');
  if(ff && ff.layout==='comfy') L.push('Your roomy cabin keeps the reviews coming in.');
  if(S.dec.held && S.dec.held.round === S.round-1) L.push(`You kept your ${routeById(S.dec.held.route).city} price above ${WORLD.rival}'s.`);
  if(S.dec.planeBought && S.dec.planeBought.round === S.round-1) L.push(`Your new ${planeById(S.dec.planeBought.planeId).name} flies for the first time today.`);
  if(S.dec.loan && S.dec.loan.round === S.round-1) L.push(`The bank lent you ${money(S.dec.loan.amount)} yesterday.`);
  return L.slice(0, 2);
}
function addNews(items){ items.forEach(it => S.log.push(Object.assign({round:S.round}, it))); if(S.log.length > 40) S.log = S.log.slice(-40); }

/* ==================================================================
   TIME SPEEDS UP (Step 2 of the time brief): days → weeks → months.
   The script is a list of beats on calendar dates. S.day is today's date (days since launch day),
   S.round is the beat in force, S.period is the stretch of time the pupil is about to run.
   Routine days are simulated; the pupil is called in for decisions, forecasts and CEO alerts.
   ================================================================== */
const DAY_MS = 86400000;
function dayOfDate(iso){ const p = iso.split('-').map(Number); return Math.round((Date.UTC(p[0], p[1]-1, p[2]) - CAL0) / DAY_MS); }
function beatDay(i){ const r = WORLD.rounds[Math.min(i, WORLD.rounds.length-1)]; return r && r.date ? dayOfDate(r.date) : i; }
function beatAt(day){ let b = 0; WORLD.rounds.forEach((r, i) => { if(beatDay(i) <= day) b = i; }); return b; }
function beatStartingOn(day){ const i = WORLD.rounds.findIndex((r, k) => k > 0 && beatDay(k) === day); return i < 0 ? null : i; }
function nextBeat(day){ const i = WORLD.rounds.findIndex((r, k) => beatDay(k) > day); return i < 0 ? null : i; }
function periodOf(i){ return (WORLD.rounds[Math.min(i, WORLD.rounds.length-1)] || {}).period || 'day'; }
function pausesRun(i){ const r = WORLD.rounds[i]; return !!r && !r.routine; }
function monthEnd(day){ const d = calDate(day); return Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth()+1, 1) - CAL0) / DAY_MS) - 1; }
function monthStart(day){ const d = calDate(day); return Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) - CAL0) / DAY_MS); }
function daysIn(day){ return monthEnd(day) - monthStart(day) + 1; }
function weekNo(day){ return Math.floor((day - 1) / 7) + 1; }                       // Week 1 = days 1–7 (Monday 2 – Sunday 8 September 2030), as the Calendar sheet numbers them
function monthNo(day){ const d = calDate(day); return (d.getUTCFullYear() - 2030) * 12 + d.getUTCMonth() - 3; }   // May 2030 = Month 1
function monthName(day, short){ const m = MONTH[calDate(day).getUTCMonth()]; return short ? m.slice(0, 3) : m; }
function fmtRange(a, b){ const A = calDate(a), B = calDate(b); return A.getUTCMonth() === B.getUTCMonth() ? `${A.getUTCDate()}–${B.getUTCDate()} ${MONTH[B.getUTCMonth()]}` : `${A.getUTCDate()} ${MONTH[A.getUTCMonth()]} – ${B.getUTCDate()} ${MONTH[B.getUTCMonth()]}`; }
function isMonthSpan(a, b){ return a === monthStart(a) && b === monthEnd(b); }
/* "Thursday 5 September 2030" · "Week 4 · 23–29 September" · "October 2030" · "July – September 2030" (p4k adds the chapter review) */
function periodLabel(P){
  P = P || S.period; if(!P || P.type === 'setup') return 'Launch day';
  if(P.type === 'day') return dateLong(P.from);
  if(P.type === 'week') return `Week ${weekNo(P.from)} · ${fmtRange(P.from, P.to)}`;
  if(P.type === 'gap' || !isMonthSpan(P.from, P.to)) return fmtRange(P.from, P.to);
  const A = calDate(P.from), B = calDate(P.to);
  return monthStart(P.from) === monthStart(P.to) ? `${MONTH[A.getUTCMonth()]} ${A.getUTCFullYear()}` : `${MONTH[A.getUTCMonth()]}${A.getUTCFullYear() !== B.getUTCFullYear() ? ' ' + A.getUTCFullYear() : ''} – ${MONTH[B.getUTCMonth()]} ${B.getUTCFullYear()}`;
}
function periodShort(h){ if(!h || h.type === 'setup' || h.from === 0) return 'launch day'; if(h.type === 'day') return dateShort(h.from); if(h.type === 'week') return 'Week ' + weekNo(h.from); if(h.type === 'gap') return 'the weekend'; return isMonthSpan(h.from, h.to) && monthStart(h.from) === monthStart(h.to) ? monthName(h.from) : `${monthName(h.from, true)}–${monthName(h.to, true)}`; }
const PERIOD_CHIP = { setup:'Launch', day:'Daily operations', week:'Weekly management', gap:'Weekly management', month:'Monthly management' };
function periodTag(P){ P = P || S.period; if(!P || P.type === 'setup' || S.phase === 'setup') return 'Launch day'; if(P.type === 'day') return 'Day ' + P.from; if(P.type === 'week' || P.type === 'gap') return 'Week ' + weekNo(P.from); return 'Month ' + monthNo(P.from); }
function periodType(){ return S && S.period ? S.period.type : 'day'; }
function inPeriodMode(){ return ['week', 'month', 'gap'].includes(periodType()); }
/* A fresh period starting today: its type comes from the beat in force. */
function newPeriod(type, from){
  const nb = nextBeat(from), nbDay = nb === null ? Infinity : beatDay(nb);
  let to = from;
  if(type === 'week') to = Math.min(from + 6, nbDay - 1);
  if(type === 'month') to = Math.min(monthEnd(from), nbDay - 1);
  if(type === 'gap') to = nbDay - 1;
  return { type, from, to, run:{ kind:'one' }, forecast:null };
}

/* ---------- money over time ---------- */
function dayCostOf(f){ return planeById(f.planeId).dayCost || 0; }
function fleetDayCost(){ return S.fleet.reduce((t, f) => t + dayCostOf(f), 0); }
function ledger(){ return S.ledger || (S.ledger = { rev:[], cost:[], pax:[], seats:[] }); }
function ledgerPut(d, rev, cost, pax, seats){ const L = ledger(); L.rev[d] = Math.round(rev*100)/100; L.cost[d] = Math.round(cost*100)/100; L.pax[d] = pax; L.seats[d] = seats; }
/* Totals from the ledger between two days (inclusive). */
function ledgerSum(a, b){ const L = ledger(), o = { rev:0, cost:0, pax:0, seats:0, days:0 }; for(let d = a; d <= b; d++){ if(L.rev[d] === undefined || L.rev[d] === null) continue; o.rev += L.rev[d]; o.cost += L.cost[d]; o.pax += L.pax[d]||0; o.seats += L.seats[d]||0; o.days++; } o.rev = r2(o.rev); o.cost = r2(o.cost); o.profit = r2(o.rev - o.cost); return o; }
function lastLedgerDay(){ const L = ledger(); return L.rev.length - 1; }
/* Profit a month from the last three complete months (or the last four weeks scaled to a month). */
function monthlyProfit(){
  const end = lastLedgerDay(); if(end < 1) return 0;
  const full = []; let m = monthStart(end + 1) - 1;
  while(full.length < 3 && m >= 1){ const a = monthStart(m), s = ledgerSum(a, m); if(s.days === m - a + 1 && a >= 1) full.push(s.profit); else break; m = a - 1; }
  if(full.length) return r2(full.reduce((t, v) => t + v, 0) / full.length);
  const s = ledgerSum(Math.max(1, end - 27), end); return s.days ? r2(s.profit / s.days * 30) : 0;
}
/* "About": friendly round numbers for forecasts. */
function about(v){ const a = Math.abs(v), step = a < 100 ? 5 : a < 1000 ? 10 : a < 10000 ? 100 : 500; return Math.round(v / step) * step; }
function dayProfitPlan(){ const fl = planFlights(), fp = fuelPrice(); return r2(fl.reduce((t, f) => t + f.revenue - f.runCost - (f.grounded ? 0 : f.fuelL * fp), 0) - fleetDayCost()); }
function reserveNow(){ return S.reserve !== undefined ? S.reserve : (WORLD.reserveDefault || 0); }
function investable(){ return r2(S.cash - reserveNow()); }
function targetPlane(){ return S.target ? planeById(S.target) : null; }
function nextPlaneUp(){ const own = S.fleet.map(f => f.planeId), i = Math.max(0, ...own.map(id => PLANES.findIndex(p => p.id === id))); return PLANES[i+1] || null; }
function savingsState(){ const p = targetPlane(); if(!p) return null; const inv = investable(); return { plane:p, price:p.price, cash:S.cash, reserve:reserveNow(), investable:inv, needed:Math.max(0, r2(p.price - inv)), ready: inv >= p.price }; }

/* ---------- simulating routine days ---------- */
function withBeat(b, fn){ const keep = S.round; S.round = b; try{ return fn(); } finally { S.round = keep; } }
/* Run every day from a to b with today's plan. In weeks and months an empty tank is topped up at the market
   price plus a delivery charge, so planes keep flying. A CEO decision can disrupt the first day. */
function simulateDays(a, b, o){
  o = o || {}; const auto = o.auto !== false, out = { from:a, to:b, rev:0, run:0, fuelUsed:0, over:0, autoL:0, autoCost:0, pax:0, seats:0, trips:0, cancelled:0, routes:{}, planes:{}, days:[] };
  const pl = uid => out.planes[uid] || (out.planes[uid] = { rev:0, cost:0 });
  for(let d = a; d <= b; d++){
    const beat = beatAt(d), first = d === a, dis = first ? S.disrupt : null;
    if(dis && dis.ground) S.fleet.forEach(f => { f.grounded = f.uid === dis.uid; });
    const fl = withBeat(beat, () => planFlights()).sort((x, y) => x.dep - y.dep);
    if(dis && dis.ground) S.fleet.forEach(f => { f.grounded = false; });
    let rev = 0, run = 0, fuel = 0, pax = 0, seats = 0;
    fl.forEach(f => {
      if(f.grounded) return;
      if(dis && dis.cancel && f.uid === dis.uid){ out.cancelled++; return; }
      if(S.fuel + 1e-9 < f.fuelL){
        if(!auto) return;
        const space = tankSpace(), want = Math.min(Math.max(ceilLot(f.fuelL - S.fuel), f.fuelL - S.fuel), space || f.fuelL), ppl = r2(withBeat(beat, () => fuelPrice()) + (WORLD.fuelTopUp || 0)), bill = r2(want * ppl);
        S.fuel = r2(S.fuel + want); S.fuelValue += bill; S.cash = r2(S.cash - bill); out.autoL += want; out.autoCost = r2(out.autoCost + bill);
      }
      const fc = consumeFuel(f.fuelL);
      rev += f.revenue; run += f.runCost; fuel += fc; pax += f.sold; seats += f.seats; out.trips++;
      const q = pl(f.uid); q.rev += f.revenue; q.cost += f.runCost + fc;
      const x = out.routes[f.route] || (out.routes[f.route] = { pax:0, seats:0, rev:0, cost:0, trips:0, fare:f.price }); x.pax += f.sold; x.seats += f.seats; x.rev += f.revenue; x.cost = r2(x.cost + f.runCost + fc); x.trips++;
    });
    const over = fleetDayCost(); S.fleet.forEach(f => { pl(f.uid).cost += dayCostOf(f); });
    S.cash = r2(S.cash + rev - run - over);
    const profit = r2(rev - run - fuel - over);
    ledgerPut(d, rev, run + fuel + over, pax, seats);
    out.rev += rev; out.run += run; out.fuelUsed = r2(out.fuelUsed + fuel); out.over += over; out.pax += pax; out.seats += seats; out.days.push(profit);
    if(S.cash < 0) bankCheck();
  }
  Object.keys(out.routes).forEach(id => { const x = out.routes[id]; x.rev = r2(x.rev); x.profit = r2(x.rev - x.cost); });
  out.rev = r2(out.rev); out.costs = r2(out.run + out.fuelUsed + out.over); out.profit = r2(out.rev - out.costs);
  return out;
}
/* The run the pupil asked for: one period, n months, or until the target plane is affordable.
   It stops early when the next beat needs the CEO (that is the interruption). */
function simulateRun(){
  const P = S.period, run = P.run || { kind:'one' }, parts = [];
  let d = P.from, paused = null;
  for(let k = 0; k < 36; k++){
    const end = P.type === 'month' ? Math.min(monthEnd(d), (nextBeat(d) === null ? Infinity : beatDay(nextBeat(d)) - 1)) : P.to;
    const part = simulateDays(d, end); part.label = P.type === 'month' ? monthName(d, true).toUpperCase() : null; parts.push(part);
    S.disrupt = null; d = end + 1;
    if(P.type !== 'month') break;
    const fin = WORLD.rounds.findIndex(r => r.finale), last = fin >= 0 && beatAt(d - 1) >= fin;
    const want = !last && (run.kind === 'n' ? parts.length < run.n : run.kind === 'afford' ? investable() < (targetPlane() ? targetPlane().price : 0) : false);
    if(!want) break;
    const bi = beatStartingOn(d);
    if(bi !== null && pausesRun(bi)){ const w = WORLD.rounds[bi]; paused = { beat:bi, title: w.event ? fillText(w.event.title) : w.title, day:d }; break; }
    if(bi !== null){ addNews((WORLD.rounds[bi].news || []).slice(0, 1).map(t => ({ tag:'NEWS', text:fillText(t), round:bi }))); }
  }
  P.to = d - 1;
  const T = { from:P.from, to:P.to, parts, paused, rev:0, costs:0, profit:0, pax:0, seats:0, trips:0, over:0, autoL:0, autoCost:0, fuelUsed:0, cancelled:0, routes:{}, planes:{} };
  parts.forEach(p => { ['rev','costs','pax','seats','trips','over','autoL','autoCost','fuelUsed','cancelled'].forEach(k => { T[k] = r2(T[k] + p[k]); });
    Object.keys(p.planes).forEach(u => { const y = T.planes[u] || (T.planes[u] = { rev:0, cost:0 }); y.rev = r2(y.rev + p.planes[u].rev); y.cost = r2(y.cost + p.planes[u].cost); });
    Object.keys(p.routes).forEach(id => { const x = p.routes[id], y = T.routes[id] || (T.routes[id] = { pax:0, seats:0, rev:0, cost:0, trips:0, fare:x.fare }); y.pax += x.pax; y.seats += x.seats; y.rev = r2(y.rev + x.rev); y.cost = r2(y.cost + x.cost); y.trips += x.trips; y.fare = x.fare; }); });
  Object.keys(T.routes).forEach(id => { T.routes[id].profit = r2(T.routes[id].rev - T.routes[id].cost); });
  // a week or a month is reported in whole pounds (the day-by-day maths keeps its pence)
  ['rev','costs','over','autoCost','fuelUsed'].forEach(k => { T[k] = Math.round(T[k]); }); Object.keys(T.routes).forEach(id => { const y = T.routes[id]; y.rev = Math.round(y.rev); y.cost = Math.round(y.cost); y.profit = y.rev - y.cost; });
  T.profit = T.rev - T.costs; T.days = parts.reduce((a, p) => a.concat(p.days), []); parts.forEach(p => { p.profit = Math.round(p.profit); });
  return T;
}
/* After a simulated period: reputation once, reviews, the forecast check, history, news. */
function applyPeriodResults(){
  if(S.rnd.applied) return; S.rnd.applied = true;
  const T = S.rnd.sim, P = S.period, why = S.rnd.why, tags = [], repBefore = S.rep;
  S.rnd.revenue = T.rev; S.rnd.costs = T.costs; S.rnd.profit = T.profit;
  const fr = focusRoute(), ff = featuredFleet();
  if(fr){ const fare = fareOf(fr.id), x = T.routes[fr.id];
    if(x && x.pax >= x.seats) tags.push('full'); else if(x && x.seats && x.pax / x.seats < 0.5) tags.push('empty');
    if(repLive() && fare >= fr.basePrice + 2 * fr.step){ S.rep -= 0.5; why.push({ ic:'⭐', text:`${money(fare)} is a high price for ${fr.city}. Reviews say so: −½ star.` }); tags.push('price_bad'); }
    else if(repLive() && fare <= fr.basePrice - fr.step){ S.rep += 0.5; why.push({ ic:'⭐', text:`${money(fare)} is a great price for ${fr.city}. Happy passengers: +½ star.` }); tags.push('price_good'); }
    else tags.push('price_fair');
    const comp = competitorPrice(fr); if(comp !== undefined && fare > comp){ why.push({ ic:'🪁', text:`${WORLD.rival} sold ${fr.city} tickets for ${money(comp)}, so 1 in 5 passengers went to them.` }); S.dec.held = { round:S.round, route:fr.id }; }
  }
  if(repLive() && ff && ff.layout === 'squeeze'){ S.rep -= 0.5; why.push({ ic:'💺', text:'The squeezed-in cabin earned more, but passengers hated it: −½ star.' }); tags.push('cramped'); }
  if(repLive() && ff && ff.layout === 'comfy'){ S.rep += 0.5; why.push({ ic:'💺', text:'The roomy cabin has fewer seats, but people love it: +½ star.' }); tags.push('comfy'); }
  if(!tags.includes('price_bad') && !tags.includes('cramped')) tags.push('smooth');
  S.rep = clamp(Math.round(S.rep*2)/2, 1, 5); S.rnd.repDelta = S.rep - repBefore;
  const nd = T.to - T.from + 1;
  why.unshift({ ic:'🧾', text:`Running the airline cost ${money(T.over)}: ${money(r2(T.over/nd))} a day for crew, maintenance and insurance, every day, flying or not.` });
  if(T.autoL) why.push({ ic:'⛽', text:`The tank ran low, so ${num(T.autoL)} L were topped up at the market price plus ${priceL(WORLD.fuelTopUp||0)} a litre for delivery: ${money(T.autoCost)}.` });
  if(T.cancelled) why.push({ ic:'🛑', text:`${plural(T.cancelled, 'flight')} did not fly on the first day.` });
  // forecast against actual: the lesson is that forecasts rest on assumptions
  const fc = P.forecast;
  if(fc){ const months = T.parts.length, exp = fc.kind === 'run' || fc.kind === 'afford' ? r2(fc.perMonth * months) : fc.total;
    const vs = { kind:fc.kind, expProfit:exp, gotProfit:T.profit, expCash:r2(fc.cash0 + exp), gotCash:S.cash, months, fcMonths: fc.months, reasons:[] };
    const f0 = fc.fuel, f1 = withBeat(beatAt(T.to), () => fuelPrice());
    if(Math.abs(f1 - f0) >= 0.05) vs.reasons.push(`Fuel ${f1 > f0 ? 'rose' : 'fell'} from ${priceL(f0)} to ${priceL(f1)} a litre.`);
    if(T.autoL) vs.reasons.push(`The tank ran out, so fuel was bought at the market price plus delivery.`);
    if(fc.kind === 'run' || fc.kind === 'afford'){ const grown = growthReason(T); if(grown) vs.reasons.push(grown); }
    if(T.cancelled) vs.reasons.push('A CEO decision cost some flights on the first day.');
    if(Math.abs(exp - T.profit) >= 1 && !vs.reasons.length) vs.reasons.push(fc.kind === 'period' ? 'Your forecast used a rounded "about" figure for each day.' : 'Your forecast used a rounded "about" figure for each month.');
    if(Math.abs(r2(S.cash - fc.cash0) - T.profit) >= 1) vs.reasons.push('Cash and profit differ: fuel used from the tank was paid for earlier, and fuel bought goes into the tank.');
    if(T.paused) vs.reasons.unshift(`The run stopped after ${plural(months, 'month')}: ${T.paused.title}.`);
    S.rnd.vs = vs; }
  const F = featuredFlight(); S.rnd.reviews = tags.slice(0, 3).map(t => pickReview(t, F)).filter(Boolean);
  S.history.push({ round:S.round, type:P.type, from:T.from, to:T.to, revenue:T.rev, costs:T.costs, profit:T.profit, cash:S.cash, rep:S.rep, fuelPaid:avgFuelPrice(), fuelPrice:withBeat(beatAt(T.to), () => fuelPrice()),
    pax:T.pax, seats:T.seats, trips:T.trips, routes:T.routes, planes:T.planes, over:T.over, forecast: fc ? { profit: S.rnd.vs.expProfit, cash: S.rnd.vs.expCash } : null });
  if(S.history.length > 120) S.history = S.history.slice(-120);
  addNews([{ tag:'£', text:`${S.airline.name}: ${T.profit >= 0 ? 'profit' : 'loss'} of ${money(Math.abs(T.profit))} in ${periodShort(S.history[S.history.length-1])}.`, cls: T.profit >= 0 ? 'good' : 'warn' }]);
  checkMilestones();
}
/* The next stretch of time after a summary: a new beat, a routine period inside one, or the gap before a new stage. */
function advance(){
  const P = S.period; S.day = (P ? P.to : S.day) + 1;
  const bi = beatStartingOn(S.day);
  if(bi !== null){ startRound(bi); return; }
  startRoutine();
}
function startRoutine(){
  const b = beatAt(S.day), w = roundData(b), nb = nextBeat(S.day), stageNext = nb !== null && WORLD.rounds[nb].stage && periodOf(b) !== WORLD.rounds[nb].period;
  S.round = b; S.phase = 'round'; delete S.needsRestart;
  const keep = { featured:S.rnd.featured, focusRoute:S.rnd.focusRoute };
  S.fleet.forEach(f => { f.grounded = false; });
  S.rnd = Object.assign(emptyRnd(), keep, { routine:true, choice:null, brief:[], event:null, challenge:null });
  if(periodOf(b) === 'day' && stageNext){            // the rest of a day-by-day stretch runs by itself, then weeks begin
    S.period = newPeriod('gap', S.day);
    S.steps = [{ t:'stage', stage: WORLD.rounds[nb].stage, gap:true }, { t:'sim' }, { t:'results' }, { t:'summary' }];
    (S.stages || (S.stages = {}))[WORLD.rounds[nb].stage] = true;
  } else {
    S.period = newPeriod(periodOf(b), S.day);
    S.steps = [{ t:'hq' }, { t:'forecast' }, { t:'sim' }, { t:'results' }, { t:'summary' }];
  }
  S.si = 0; S.newRoutes = []; refreshPlan();
  delete S.roundStart; S.roundStart = JSON.stringify(S);
  publish(); render();
}
/* At HQ (months): how far to run. */
function chooseRun(kind, n){
  const P = S.period; P.run = { kind, n: n || 1 };
  if(kind === 'afford' && !S.target){ const np = nextPlaneUp(); if(np) S.target = np.id; }
  next();
}
/* The forecast the pupil makes before a run (none for a routine week or a routine single month). */
function forecastKind(){
  const P = S.period; if(!P || P.type === 'gap' || P.type === 'day') return null;
  if(P.run.kind === 'afford'){ const sv = savingsState(); return sv && !sv.ready ? 'afford' : null; }
  if(P.run.kind === 'n' && P.run.n > 1) return 'run';
  return S.rnd.routine ? null : 'period';
}

/* ---------- step machine ---------- */
function step(){ return S.steps[S.si]; }
function next(){ if(S.si < S.steps.length-1){ S.si++; enterStep(); } render(); }
function back(){ if(S.si > 0){ S.si--; render(); } }
function enterStep(){
  const st = step();
  if(st.t==='fly'){ S.rnd.forecast = forecastNow(); startFlight(); }
  if(st.t==='sim' && !S.rnd.sim){ const fc0 = S.period.forecast; S.rnd.sim = simulateRun(); S.rnd.simAnim = { start: Date.now(), dur: Math.min(14000, 1000 * Math.max(4, settings.flightSecs) * Math.max(1, Math.min(3, S.rnd.sim.parts.length))) }; S.period.forecast = fc0; livePeriodShow(); }
  if(st.t==='results') (S.rnd.sim ? applyPeriodResults : applyResults)();
  if(st.t==='summary' && roundData(S.round).finale && !S.finished) recordRun();
  if(st.t==='summary' && roundData(S.round).checkpoint && !S.rnd.checkpointed){ S.rnd.checkpointed = true; recordRun(true); }
  publish();
}
/* Captain's challenge still uses the one-question gate. */
function parseAnswer(raw){ const v = parseFloat(String(raw||'').replace(/£|,|\s/g,'')); return isNaN(v) ? null : v; }
function checkAnswer(part, raw){ const v = parseAnswer(raw); if(v===null) return 'blank'; if(Math.abs(v - part.answer) < 0.005) return 'ok'; return v > part.answer ? 'high' : 'low'; }

/* ---------- flight, results, reputation, reviews ---------- */
function consumeFuel(L){
  if(L <= 0 || S.fuel <= 0) return 0;
  const lots = fuelLots(); let need = Math.min(L, S.fuel), v = 0;
  while(need > 1e-9 && lots.length){ const x = lots[0], u = Math.min(x.L, need); v += u * x.p; x.L = r2(x.L - u); need -= u; if(x.L <= 1e-9) lots.shift(); }
  v = r2(v); S.fuel = r2(S.fuel - Math.min(L, S.fuel)); S.fuelValue = r2(lots.reduce((t, x) => t + x.L * x.p, 0)); if(S.fuel <= 1e-9){ S.fuel = 0; S.fuelValue = 0; S.fuelLots = []; }
  return v;
}
function startFlight(){
  S.rnd.flights = planFlights();
  // flights happen regardless — unless the tank can't cover them (trip by trip, in order)
  S.rnd.flights.slice().sort((a,b)=>a.dep-b.dep).forEach(f => {
    if(f.grounded) return;
    if(S.fuel + 1e-9 >= f.fuelL){ f.fuelCost = consumeFuel(f.fuelL); S.rnd.status[f.key] = 'BOARDING'; }
    else { f.noFuel = true; f.sold = 0; f.revenue = 0; f.runCost = 0; f.fuelCost = 0; S.rnd.status[f.key] = 'NO FUEL'; f.reasons = ['Not enough fuel — trip grounded.']; }
  });
  const last = S.rnd.flights.reduce((m,f)=>Math.max(m, f.arr||0), firstDep()+60);
  S.rnd.anim = { start: Date.now(), dur: settings.flightSecs*2500, from: firstDep()-30, to: last+30 };
}

function pickReview(tag, f){
  const pool = REVIEWS[tag]; if(!pool || !pool.length) return null;
  const c = pool[(S.round + (f ? f.sold : 0)) % pool.length], r = f ? routeById(f.route) : null;
  return { face:c.face, stars:c.stars, text:c.text.replace('{price}', f ? num(f.price) : '').replace('{city}', r ? r.city : 'somewhere').replace('{airline}', S.airline.name) };
}
/* Honest outcome line per trip — used on the landing screen and the IWB. */
function outcomeLine(f){
  const r = routeById(f.route), when = fmtTime(f.dep)+' '+r.city;
  if(f.grounded) return `${when}: grounded, waiting for a spare part.`;
  if(f.noFuel) return `${when}: not enough fuel — trip grounded.`;
  const st = S.rnd.status[f.key];
  if(st==='CANCELLED') return `${when}: cancelled. Everyone refunded.`;
  const pct = Math.round(100*f.sold/f.seats);
  let s = `${when}: ${st==='DELAYED' ? 'landed late' : st==='DIVERTED' ? 'diverted, landed eventually' : 'landed'}. ${f.sold >= f.seats ? 'Full flight' : pct+'% full'} (${f.sold} of ${f.seats})`;
  if(f.compCut) s += ` — ${WORLD.rival} was cheaper`;
  else if(f.sold < f.seats && typeof timeDemandOn === 'function' && timeDemandOn() && f.band) s += ` — fewer people want to fly in the ${BAND_NAMES[f.band].toLowerCase()}`;
  else if(f.trip > 0 && f.sold < f.seats) s += ` — earlier trips took most of the passengers`;
  return s + `. ${money(f.revenue)}.`;
}
function applyResults(){
  if(S.rnd.applied) return; S.rnd.applied = true;
  const want = {}; S.rnd.flights.forEach(f => { if(!f.grounded && want[f.route] === undefined) want[f.route] = paxWant(routeById(f.route), f.price); });   // the market today, before reviews move the stars
  const fl = S.rnd.flights, rev = fl.reduce((t,f)=>t+f.revenue,0), run = fl.reduce((t,f)=>t+f.runCost,0), fuelUsed = r2(fl.reduce((t,f)=>t+(f.fuelCost||0),0));
  const over = fleetDayCost(), X = dayExtras(fl), evCost = S.rnd.eventCost || 0, extraCost = X.term + X.obCost + X.crew + evCost;   // terminal charges, on-board stock, a second crew, today's event
  S.cash = r2(S.cash + rev + X.obRev - run - over - extraCost); if(typeof payFinanceDay === 'function') payFinanceDay();
  S.rnd.extras = X; S.rnd.ticketRev = rev; S.rnd.revenue = rev + X.obRev; S.rnd.costs = r2(run + fuelUsed + over + extraCost); S.rnd.fuelUsedCost = fuelUsed; S.rnd.over = over; S.rnd.profit = r2(rev + X.obRev - run - fuelUsed - over - extraCost);
  if(evCost && S.rnd.event) S.rnd.why.push({ ic:'🧾', text:`${S.rnd.event.title}: ${money(evCost)} today.` });
  fl.filter(f => f.cancelled).forEach(f => S.rnd.why.push({ ic:'⛔', text:`The ${fmtTime(f.dep)} to ${routeById(f.route).city} was cancelled. No ticket money, but no flying costs either.` }));
  if(repLive() && X.free && fl.some(f => !f.grounded && !f.noFuel) && S.rep < 4){ S.rep += 0.5; S.rnd.why.push({ic:'⭐', text:'Free snacks and drinks went down well: +½ star.'}); }
  fl.forEach(f => { if(!f.grounded && !f.noFuel) S.rnd.status[f.key] = (f.sold >= f.seats) ? 'FULL FLIGHT' : 'LANDED'; });
  const why = S.rnd.why, tags = [], F = featuredFlight(), repBefore = S.rep, ff = featuredFleet();
  if(F && !F.grounded && !F.noFuel){
    const r = routeById(F.route), trips = featuredFlights().filter(x => !x.grounded && !x.noFuel), sold = trips.reduce((t,x)=>t+x.sold,0), seats = trips.reduce((t,x)=>t+x.seats,0);
    if(trips.length > 1) why.push({ic:'🗓️', text:`${planeById(ff.planeId).name} flew ${trips.length} trips today and sold ${sold} of ${seats} seats.`});
    if(F.sold >= F.seats){ why.push({ic:'🎟️', text:`${F.demand} people wanted to fly to ${r.city} at ${money(F.price)}. The ${fmtTime(F.dep)} trip was full (${F.seats} seats).`}); tags.push('full'); }
    else { why.push({ic:'🎟️', text:`${F.sold} of ${F.seats} seats sold on the ${fmtTime(F.dep)} trip to ${r.city}. ${F.demand} people wanted to fly at ${money(F.price)}.`}); if(F.sold/F.seats < 0.5) tags.push('empty'); }
    [...new Set(trips.flatMap(x => x.reasons))].forEach(t => why.push({ic:'ℹ️', text:t}));
    if(repLive() && F.price >= r.basePrice + 2 * r.step){ S.rep -= 0.5; why.push({ic:'⭐', text:`${money(F.price)} is a high price for ${r.city}. Reviews say so: −½ star.`}); tags.push('price_bad'); }
    else if(repLive() && F.price <= r.basePrice - r.step){ S.rep += 0.5; why.push({ic:'⭐', text:`${money(F.price)} is a great price for ${r.city}. Happy passengers: +½ star.`}); tags.push('price_good'); }
    else tags.push('price_fair');
    const fr = focusRoute(); if(fr){ const comp = competitorPrice(fr); if(comp !== undefined && (S.prices[fr.id]||fr.basePrice) > comp) S.dec.held = {round:S.round, route:fr.id}; }
    if(repLive() && ff && ff.layout === 'squeeze'){ S.rep -= 0.5; why.push({ic:'💺', text:`The squeezed-in cabin earned more but passengers hated it: −½ star.`}); tags.push('cramped'); }
    if(repLive() && ff && ff.layout === 'comfy'){ S.rep += 0.5; why.push({ic:'💺', text:`The roomy cabin has fewer seats but people love it: +½ star.`}); tags.push('comfy'); }
    if(!tags.includes('price_bad') && !tags.includes('cramped') && S.round>0) tags.push('smooth');
  }
  fl.filter(f => f.noFuel).forEach(f => why.push({ic:'⛽', text:`${fmtTime(f.dep)} ${routeById(f.route).city}: not enough fuel in the tank, so the trip stayed on the ground. No ticket money.`}));
  if(over) why.push({ic:'🧾', text:`Running the airline cost ${money(over)} today: crew, maintenance and insurance for ${plural(S.fleet.length, 'plane')}, flying or not.`});
  if(fuelUsed) why.push({ic:'⛽', text:`Fuel used today cost ${money(fuelUsed)} (bought at about ${priceL(avgFuelPrice())} a litre; today's price is ${priceL(fuelPrice())}).`});
  if(S.rnd.profit < 0) why.push({ic:'📉', text:`Costs (${money(S.rnd.costs)}) were bigger than ticket money (${money(rev)}). A loss of ${money(-S.rnd.profit)}.`});
  S.rep = clamp(Math.round(S.rep*2)/2, 1, 5);
  S.rnd.repDelta = S.rep - repBefore;
  // forecast against actual (CR2 B5): calm and factual, one line on why if it differs
  const fc = S.rnd.forecast;
  if(fc){ const vs = { expIncome: fc.income, gotIncome: rev, expProfit: fc.profit, gotProfit: S.rnd.profit, why:'' };
    const nf = fl.filter(f => f.noFuel);
    if(nf.length) vs.why = `${plural(nf.length,'trip')} stayed on the ground: the tank had ${num(fc.fuelHave)} L and the plan needed ${num(fc.fuelNeed)} L.`;
    else if(Math.abs(fc.profit - S.rnd.profit) >= 1) vs.why = 'The plan changed after the forecast was made.';
    const ex = S.rnd.extra; if(ex){ const d = r2(ex.income - ex.cost), who = ex.left === 1 ? '1 person was' : ex.left + ' people were';
      vs.extra = ex.flew ? (d >= 0 ? `The extra trip made ${money(d)} profit.` : `The extra trip cost ${money(-d)} more than it brought in.`)
        : (d > 0 ? `${who} left behind. Flying them would have made ${money(d)}.` : `${who} left behind. Flying them would have lost ${money(-d)}, so you saved that.`); }
    S.rnd.vs = vs; }
  S.rnd.reviews = tags.slice(0,3).map(t => pickReview(t, F)).filter(Boolean);
  const flown = fl.filter(f => !f.grounded && !f.noFuel), routes = {};
  flown.forEach(f => { const x = routes[f.route] || (routes[f.route] = { pax:0, seats:0, rev:0, cost:0, trips:0, fare:f.price, want:want[f.route] || 0 }); x.pax += f.sold; x.seats += f.seats; x.rev += f.revenue; x.cost = r2(x.cost + f.runCost + (f.fuelCost||0) + (f.termCost||0)); x.trips++; });
  Object.keys(routes).forEach(id => { const b = X.byRoute[id]; if(b){ routes[id].rev += b.obRev; routes[id].cost = r2(routes[id].cost + b.obCost); routes[id].onboard = b.obRev; } });
  Object.keys(routes).forEach(id => { routes[id].profit = r2(routes[id].rev - routes[id].cost); });
  ledgerPut(S.day || 0, rev, S.rnd.costs, flown.reduce((t,f) => t+f.sold, 0), flown.reduce((t,f) => t+f.seats, 0));
  S.history.push({ round:S.round, type: S.phase === 'setup' ? 'setup' : 'day', from:S.day || 0, to:S.day || 0, over, proj: S.rnd.myForecast ? S.rnd.myForecast.profit : (S.rnd.forecast ? S.rnd.forecast.profit : null), revenue:rev, costs:S.rnd.costs, profit:S.rnd.profit, cash:S.cash, rep:S.rep, fuelPaid:avgFuelPrice(), fuelPrice:fuelPrice(), emptyTrips: fl.filter(f => !f.grounded && !f.noFuel && f.sold < f.seats/2).length,
    pax: flown.reduce((t,f) => t+f.sold, 0), seats: flown.reduce((t,f) => t+f.seats, 0), trips: flown.length, routes, reviews: S.rnd.reviews, fuelL: S.fuel, fuelStock: S.fuelValue });
  checkMilestones();
  addNews([{tag:'£', text:`${S.airline.name}: ${S.rnd.profit>=0?'profit':'loss'} of ${money(Math.round(Math.abs(S.rnd.profit)))} on ${S.phase === 'setup' ? 'launch day' : dateShort()}.`, cls:S.rnd.profit>=0?'good':'warn'}]);
  bankCheck();
}
/* Milestones (shown once on the Operations Wall's review): first flight, first profitable day, passengers flown, new destinations. */
const PAX_MILESTONES = [100, 500, 1000, 2500, 5000, 10000];
function checkMilestones(){
  const ms = S.milestones || (S.milestones = {}), hit = [], total = S.history.reduce((t,h) => t + (h.pax||0), 0);
  if(!ms.first && S.rnd.flights.some(f => !f.grounded && !f.noFuel)){ ms.first = true; hit.push({ title:'First flight landed', sub:`${S.airline.name} is officially an airline.` }); }
  if(!ms.profit && S.phase === 'round' && S.rnd.profit > 0){ ms.profit = true; hit.push({ title:'First profitable day', sub:`${money(S.rnd.profit)} profit on ${dateLong()}.` }); }
  PAX_MILESTONES.forEach(n => { if(total >= n && !(ms.pax >= n)){ ms.pax = n; hit.push({ title:`${num(n)} passengers flown`, sub:`${num(total)} people have flown with ${S.airline.name} so far.` }); } });
  const dests = ownedRoutes().length; if(dests > (ms.dests || 1)){ ms.dests = dests; const id = ownedRoutes()[dests-1]; hit.push({ title:`New destination: ${routeById(id).city}`, sub:`${S.airline.name} now flies to ${plural(dests, 'destination')}.` }); }
  S.rnd.milestone = hit.length ? hit[hit.length-1] : null;
}
/* Keep the day's history entry in step with what an event changes afterwards (refunds, costs, stars). */
function syncHistory(){ const h = S.history[S.history.length-1]; if(!h || !S.rnd.applied || !S.period || h.from !== S.period.from) return; h.revenue = S.rnd.revenue; h.profit = S.rnd.profit; h.cash = S.cash; h.rep = S.rep; if(h.type === 'day' || h.type === 'setup'){ const L = ledger(); ledgerPut(h.from, S.rnd.revenue, S.rnd.costs, L.pax[h.from]||0, L.seats[h.from]||0); } }
/* What the operation is doing right now: the HQ top bar and the wall header both read this. */
function opsStatus(){
  if(!S || !S.steps || !S.steps.length) return { k:'idle', t:'STANDBY' };
  const st = step().t;
  if(st === 'event') return { k:'alert', t:'PAUSED · CEO DECISION' };
  if(st === 'fly') return { k:'run', t:'FLIGHTS IN PROGRESS' };
  if(st === 'sim') return { k:'run', t:'SIMULATING' };
  if(S.rnd && S.rnd.applied) return { k:'done', t:'ALL LANDED' };
  if(st === 'hq') return { k:'ready', t:'READY' };
  if(S.phase === 'setup' || ['welcome','name','code','logo','fin','paint','reveal','cert','home','route','setupFuel','setupPrice'].includes(st)) return { k:'hold', t:'SETTING UP' };
  return { k:'hold', t:'PLANNING AT HQ' };
}
/* No game over: if cash runs out the bank tops the airline up (and says so). */
function bankCheck(){
  if(S.cash >= 0) return;
  const loan = Math.ceil(-S.cash/500)*500 + 500; S.cash += loan; S.rnd.loan = (S.rnd.loan||0) + loan; S.dec.loan = {round:S.round, amount:loan};
  S.rnd.why.push({ic:'🏦', text:`Cash ran out, so the bank lent you ${money(loan)} to keep flying. Watch those costs!`});
  addNews([{tag:'BANK', text:`Bank lends ${S.airline.name} ${money(loan)} to keep it flying.`, cls:'warn'}]);
  if(typeof toast==='function' && !IS_DISPLAY) toast(`The bank lent you ${money(loan)}`);
}
function applyEvent(choice){
  const ev = S.rnd.event, opt = ev.options[choice], e = opt.effects || {}, tags = [], fr = focusRoute();
  const flew = featuredFlights().filter(f => !f.noFuel && !f.grounded).sort((x,y) => y.revenue - x.revenue), F = flew[0] || null;   // events only touch a trip that actually flew
  S.rnd.eventChoice = choice;
  if(e.cash) S.cash += e.cash;
  if(e.rep && repLive()){ S.rep = clamp(S.rep + e.rep, 1, 5); }
  const ahead = inPeriodMode() && !S.rnd.applied, ff0 = featuredFleet();
  if(ahead){ if((e.refund || e.groundNext) && ff0) S.disrupt = { uid:ff0.uid, cancel:!!e.refund, ground:!!e.groundNext }; if(e.status==='DELAYED'||e.status==='DIVERTED') tags.push('delay'); if(e.status==='CANCELLED') tags.push('cancel'); }
  else {
  if(e.status && F){ S.rnd.status[F.key] = e.status; if(e.status==='DELAYED'||e.status==='DIVERTED') tags.push('delay'); if(e.status==='CANCELLED') tags.push('cancel'); }
  if(e.refund && F){ S.cash = r2(S.cash - F.revenue); S.rnd.profit = r2(S.rnd.profit - F.revenue); S.rnd.revenue = r2(S.rnd.revenue - F.revenue); S.rnd.refunded = F.revenue; }
  }
  (S.flags || (S.flags = {}))[ev.id] = choice;
  if(e.setPrice) Object.keys(e.setPrice).forEach(k => { const id = k==='focus' ? (fr && fr.id) : k; if(!id || !ownedRoutes().includes(id)) return; const v = e.setPrice[k]; S.prices[id] = v==='match' ? (competitorPrice(routeById(id)) || S.prices[id]) : v; });
  if(e.priceStep && fr){ const opts = fr.prices, i = opts.indexOf(S.prices[fr.id]||fr.basePrice); const j = clamp((i<0?1:i) + e.priceStep, 0, opts.length-1); S.prices[fr.id] = opts[j]; }
  if(e.groundNext && !ahead){ const ff = featuredFleet(); if(ff) S.nextMods.ground.push(ff.uid); }
  if(e.fuelDiscount) S.fuelDiscount = e.fuelDiscount;
  if(ev.id==='fault' && e.cash) tags.push('safe'); if(ev.id==='fault' && e.rep < 0) tags.push('fault');
  S.rnd.eventWhy = fillText(opt.why);
  const rv = tags.map(t => pickReview(t, F)).filter(Boolean); if(rv.length) S.rnd.reviews = rv.concat(S.rnd.reviews).slice(0,3);
  addNews([{tag:'EVENT', text:`${fillText(ev.title)}: ${fillText(opt.label)}.`, cls:'warn'}]);
  bankCheck(); syncHistory();
}
function countTyped(){ S.typed = (S.typed||0) + 1; }
function applyReward(ch){
  const r = ch.reward || {};
  if(r.cash) S.cash += r.cash; if(r.rep && repLive()) S.rep = clamp(S.rep + r.rep, 1, 5); if(r.fuelDiscount) S.fuelDiscount = r.fuelDiscount;
  S.rnd.challengeDone = true; S.rnd.challengeWon = true;
  addNews([{tag:'BONUS', text:`Captain's challenge won: ${ch.rewardText}.`, cls:'good'}]);
}
function buyFuel(litres, price){ const total = r2(litres*price); fuelLots().push({ L:litres, p:price }); S.cash = r2(S.cash - total); S.fuel = r2(S.fuel + litres); S.fuelValue = r2(S.fuelValue + total); const fb0 = S.rnd.fuelBought; S.rnd.fuelBought = fb0 ? { litres:fb0.litres + litres, price, total:r2(fb0.total + total) } : {litres, price, total}; S.fuelDiscount = 0; S.dec.fuelBuys.push({round:S.round, price, litres}); if(S.dec.fuelBuys.length > 10) S.dec.fuelBuys.shift(); }
function buyPlane(plane){
  const uid = S.nextUid++; S.cash = r2(S.cash - plane.price); S.fleet.push({uid, planeId:plane.id, route:null, schedule:[], layout:'standard', grounded:false}); S.dec.planeBought = {round:S.round, day:S.day, planeId:plane.id};
  addNews([{tag:'FLEET', text:`${S.airline.name} buys a ${plane.name}!`, cls:'good'}]);
  return uid;
}
function setSchedule(uid, sched){
  const f = S.fleet.find(x=>x.uid===uid); if(!f) return;
  sched.forEach(id => { if(!ownedRoutes().includes(id) && !S.newRoutes.includes(id)) S.newRoutes.push(id); if(!(id in S.prices)) S.prices[id] = routeById(id).basePrice; });
  f.schedule = sched.slice(); f.route = sched[0] || null;
  if(!S.rnd.featured) S.rnd.featured = uid;
  if(!S.rnd.focusRoute || (uid === S.rnd.featured && !sched.includes(S.rnd.focusRoute))) S.rnd.focusRoute = sched[0] || null;
  refreshPlan();
}
function assignRoute(uid, routeId){ setSchedule(uid, [routeId]); }
