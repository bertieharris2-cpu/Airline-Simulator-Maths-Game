/* =====================================================================
   D104 (Fable, workbook v6.0, 19 Oct 2026): a richer first eight weeks. Year one only (yearOne(), p5l), like every
   year-one change; the tracks and the curveballs are chapter 1's autumn.
   1. Tracks (Settings autumnTrack; the teacher's switch, kept with the airline as S.track). Track A is the standard autumn;
      track B is a second autumn for pupils who have played before: the storm, the fault, crew sickness and the price war
      move, a Dublin concert replaces the rugby and an Amsterdam fair replaces Milan's. Items marked "both" play on either;
      everything after chapter 1 plays on both.
   2. Six curveball events with no best answer (school trip, Dublin strike, snack supplier, sponsorship, slot squeeze,
      tanker offer). Their choices come from the EventOptions sheet; their effects are here. The fault and the price war
      (track A and B) take their choices from EventOptions too: their Events rows have none, so they used to pass silently.
   3. Growth responds to how a route is served (Settings growthResponds; WE.growthStep).
   4. Stars move from week 3 (Settings reputationFromDay) with chapter 1's four drivers.
   5. New routes show a demand range until flown for a week (Settings newRouteUncertainty; Routes demandKnown).
   ===================================================================== */
const D104S = () => WORLD.settings || {};
function d104Ch1End(){ try{ const c = CHAPTERS.find(x => +x.chapter === 1); if(c && c.end) return dayOfDate(c.end); }catch(e){} return 118; }
function d104DefaultTrack(){ const t = (typeof settings !== 'undefined' && settings.autumnTrack) || D104S().autumnTrack || 'A'; return String(t).trim().toUpperCase() === 'B' ? 'B' : 'A'; }
function d104Track(){ return S && S.track ? (S.track === 'B' ? 'B' : 'A') : d104DefaultTrack(); }
/* an item plays on the airline's track in chapter 1; after chapter 1 everything plays */
function d104OnTrack(item, track, day){ const t = (item && item.track) || 'both'; if(day !== undefined && day > d104Ch1End()) return true; return t === 'both' || t === track; }
function d104NextDow(day, dow){ for(let d = day; d < day + 7; d++) if(calDate(d).getUTCDay() === dow) return d; return day; }

/* ---------- the events: choices from EventOptions where the Events rows have none ---------- */
const D104_TWIN = { storm_b:'storm', fault_b:'fault', crew_b:'crew', price_war_b:'price_war' };
const D104_NEWS_EV = { dub_concert:1, ams_fair:1 };   // track B's two demand items play as route news (below), not as cards
const D104_TAG = { 'school_trip:1':'school', 'dub_strike:1':'strikeFly', 'dub_strike:2':'strikeCancel', 'snack_supplier:1':'snackCheap', 'sponsor_club:1':'sponsor',
  'slot_squeeze:1':'slots', 'tanker_offer:1':'tanker', 'price_war:1':'warHold', 'price_war:2':'warMatch', 'price_war:3':'warAd' };
const D104_WHY = {
  'school_trip:1':'You took the school\'s booking: 19 seats at £60 on Thursday\'s first Paris flight. The plane goes full.',
  'school_trip:2':'You kept Thursday\'s seats for your own passengers at your fare.',
  'dub_strike:1':'Friday\'s Dublin flights will go, but late. Passengers wait at the gate.',
  'dub_strike:2':'Friday\'s Dublin flights are cancelled and every fare refunded. The plane stays at home.',
  'snack_supplier:1':'The plainer snacks start today, at 50p an item instead of £1. If passengers complain, the month review will find it.',
  'snack_supplier:2':'You kept your supplier at £1 an item.',
  'sponsor_club:1':'Your name is on the Dublin shirts for four weeks: 5 in every 100 more people want to fly to Dublin.',
  'sponsor_club:2':'You kept the £500.',
  'slot_squeeze:1':'This week Heathrow lets you make only two departures before 09:00. Move any others later in the plan.',
  'tanker_offer:1':'5,000 L at £2.40 a litre is in your tank.',
  'tanker_offer:2':'You will buy fuel at the day\'s price as usual.',
  'price_war:1':'You held your fares. For every £10 you are dearer than Red Kite, 1 in 10 of your passengers switch this week.',
  'price_war:2':'Your fares are a fifth lower this week, the same as Red Kite\'s.',
  'price_war:3':'Your adverts halve the switching this week.',
  'fault:1':'The engineers fixed it overnight. Passengers trust you.', 'fault:2':'The aircraft sits on the ground tomorrow while the part comes.', 'fault:3':'The flight went, but word got round that you flew with a warning light.',
  'crew:1':'An agency pilot flew the day.', 'crew:2':'The plane stayed on the ground. Passengers were refunded and annoyed.', 'crew:3':'The co-pilot flew it. That is against the rules, and there is an incident report.' };
const d104Key = o => String(o.label || '').toLowerCase().split(/\s+/)[0].replace(/[^a-z-]/g, '') || 'opt' + o.n;
function d104Opts(id){ const O = (WB && WB.eventOptions) || {}; return (O[id] && O[id].length ? O[id] : O[D104_TWIN[id]]) || []; }
function d104Opt(id, o){
  const base = D104_TWIN[id] || id, k = `${base}:${o.n}`, e = {}, txt = `${o.other || ''} ${o.sub || ''}`;
  if(+o.cash > 0) e.cash = -(+o.cash);
  if(base === 'fault' && o.n === 1 && !e.cash) e.cash = -800;   // the fault's Events row: "fix £800" (the cost before day 29; from then half a day's profit)
  if(o.stars) e.rep = +o.stars;
  if(/grounded tomorrow/i.test(txt)) e.groundNext = true; else if(/plane's day lost/i.test(txt)) e.status = 'CANCELLED';
  if(D104_TAG[k]) e.d104 = D104_TAG[k];
  if(e.d104 === 'tanker'){ e.d104Cost = -(e.cash || 0); delete e.cash; }   // the fuel is bought (and paid) through buyFuel, not as the event's cost
  return { key:d104Key(o), label:o.label, sub:o.sub || '', why:D104_WHY[k] || '', effects:e };
}
function d104Event(id){
  const base = eventById(id); if(!base) return null; const tw = D104_TWIN[id], twin = tw ? eventById(tw) : null;
  let ge = gameEvent(id) || (tw === 'storm' ? gameEvent(tw) : null);   // the storm keeps its Events-row choices on track B (the board's afternoon); the others take their own EventOptions rows
  if(!ge){ const eo = d104Opts(id); if(!eo.length) return null;
    const share = eo.filter(o => +o.costShare > 0).map(o => `${d104Key(o)} ${o.costShare}`).join(' / ');
    ge = { costShare:share || undefined, options:eo.map(o => d104Opt(id, o)) }; }
  const src = twin || base;
  return Object.assign({}, ge, { id, date:base.date, day:dayOfDate(base.date), title:base.title, text:base.text || (twin && twin.text) || ge.text || '', d104:true,
    rivalFare:src.rivalFare, rivalFareCut:src.rivalFareCut, durationDays:src.durationDays, advertiseCost:src.advertiseCost,
    affectsRoutes:(base.affectsRoutes && base.affectsRoutes.length ? base.affectsRoutes : src.affectsRoutes) || [] });
}

/* ---------- chapter 1's beats for the airline's track (patched in place; the originals kept) ---------- */
let D104_PATCHED = null;
function d104Patch(track){
  const end = d104Ch1End(), evs = (typeof WB_EVENTS !== 'undefined' ? WB_EVENTS : []);
  (WORLD.rounds || []).forEach(w => {
    if(!w || w.day === undefined || w.day > end) return;
    const o = w.__d104 || (w.__d104 = { event:w.event, eventId:w.eventId, events:w.events });
    if(w.period === 'day' || w.period === 'setup'){
      const cal = o.event && d104OnTrack(eventById(o.event.id), track) ? o.event : null;
      const extra = cal ? [] : evs.filter(e => e.date && dayOfDate(e.date) === w.day && !D104_NEWS_EV[e.id] && d104OnTrack(e, track) && !(o.event && o.event.id === e.id)).map(e => d104Event(e.id)).filter(Boolean);
      const ev = cal || extra[0] || null; w.event = ev; w.eventId = ev ? ev.id : null;
    } else if(Array.isArray(o.events)){
      w.events = o.events.filter(e => !D104_NEWS_EV[e.id] && d104OnTrack(eventById(e.id), track)).map(e => {
        if(e.options && e.options.length) return e; const x = d104Event(e.id); return x ? Object.assign({ day:e.day }, x) : e; });
    }
  });
  D104_PATCHED = track;
}
function d104Ensure(){ if(S && !S.track) S.track = d104DefaultTrack(); const t = d104Track(); if(D104_PATCHED !== t) d104Patch(t); }
d104Patch(d104DefaultTrack());
const d104Render0 = render;
render = function(){ try{ d104Ensure(); }catch(e){ console.error(e); } return d104Render0.apply(this, arguments); };
const d104SBB0 = startBeatBase;
startBeatBase = function(b){ try{ d104Ensure(); d104WarEnd(beatDay(b)); }catch(e){ console.error(e); } const r = d104SBB0.apply(this, arguments); try{ d104Queue(roundData(b)); }catch(e){ console.error(e); } return r; };
if(typeof enterRunDay === 'function'){ const d104ERD0 = enterRunDay; enterRunDay = function(){ try{ d104Ensure(); }catch(e){ console.error(e); } return d104ERD0.apply(this, arguments); }; }

/* ---------- route news on the track: track B's concert and Amsterdam fair in place of the rugby and Milan's fair ---------- */
const D104_NEWS_RAW = (WORLD.routeNews || []).slice();
function d104BNews(){
  const c = eventById('dub_concert'), a = eventById('ams_fair'), out = [];
  if(c) out.push({ id:'dub_concert', announce:'2030-09-23', start:c.date, end:c.date, kind:'music', routes:['dub'], mult:1.8, segment:'all', announced:true, status:'live', track:'B',
    headline:c.text, goodResponse:'Raise the Dublin fare for Saturday, and put the bigger plane on Dublin.' });
  if(a) out.push({ id:'ams_fair', announce:a.date, start:'2030-10-14', end:'2030-10-20', kind:'economic', routes:['ams'], mult:1.4, segment:'business', announced:true, status:'live', track:'B',
    headline:a.text, goodResponse:'Add an Amsterdam service for the week, or raise the fare a step.' });
  return out; }
let D104_NEWS = {};
function d104News(track){ return D104_NEWS[track] || (D104_NEWS[track] = D104_NEWS_RAW.filter(n => d104OnTrack(n, track, n.start ? dayOfDate(n.start) : undefined)).concat(track === 'B' ? d104BNews() : [])); }
Object.defineProperty(WORLD, 'routeNews', { configurable:true, enumerable:true, get(){ return d104News(d104Track()); },
  set(v){ D104_NEWS_RAW.length = 0; (v || []).forEach(x => D104_NEWS_RAW.push(x)); D104_NEWS = {}; } });

/* ---------- a week with two cards (track B's week 7: the tanker and crew sickness): the second follows the first ---------- */
function d104Queue(w){
  if(!S || !S.rnd || !S.rnd.event || !w || !Array.isArray(w.events)) return;
  const first = S.rnd.event.id, more = w.events.filter(e => e.options && e.options.length && e.id !== first);
  if(more.length) S.rnd.eventQueue = more.map(e => JSON.parse(JSON.stringify(e)));
}
const d104Adv0 = advance;
advance = function(){
  const st = step && step(), q = S && S.rnd && S.rnd.eventQueue;
  if(st && st.t === 'event' && q && q.length && S.rnd.eventChoice !== undefined){
    S.rnd.eventCostAcc = r2((S.rnd.eventCostAcc || 0) + (S.rnd.eventCost || 0));
    const next = q.shift(); ['eventChoice', 'eventWhy', 'eventCost', 'eventCostNote'].forEach(k => delete S.rnd[k]);
    S.rnd.event = next; S.rnd.eventDay = next.day; S.steps.splice(S.si + 1, 0, { t:'event' });
  }
  return d104Adv0.apply(this, arguments);
};
/* in the weeks, a D104 card comes before the plan: the plan is made knowing about it (the slots, the tanker's fuel, the sponsor) */
const d104Steps0 = stepsFor;
stepsFor = function(b){
  const st = d104Steps0.apply(this, arguments), w = roundData(b);
  if(!w || w.period !== 'week' || !yearOne(w.day)) return st;
  const ev = (w.events || []).find(e => e.options && e.options.length); if(!ev || !ev.d104) return st;
  const ie = st.findIndex(x => x.t === 'event'), ip = st.findIndex(x => x.t === 'plan' || x.t === 'planner'); if(ie < 0 || ip < 0 || ie < ip) return st;
  const out = st.slice(), [e] = out.splice(ie, 1); out.splice(ip, 0, e); return out;
};

/* ---------- the choices' effects ---------- */
const d104D = () => S.d104 || (S.d104 = {});
const d104Apply0 = applyEventNow;
applyEventNow = function(choice){
  const ev = S.rnd && S.rnd.event, opt = ev && ev.options && ev.options[choice], e = (opt && opt.effects) || {}, tag = e.d104, acc = (S.rnd && S.rnd.eventCostAcc) || 0;
  const r = d104Apply0.apply(this, arguments);
  if(acc) S.rnd.eventCost = r2((S.rnd.eventCost || 0) + acc);
  if(tag) try{ d104Effect(ev, opt, tag); }catch(x){ console.error(x); }
  // "plane grounded tomorrow" on a day of its own (the board's days): the featured aircraft misses the next day
  if(ev && ev.d104 && e.groundNext && typeof PW === 'function' && PW().span === 'day'){ const ff = (typeof featuredFleet === 'function' && featuredFleet()) || S.fleet[0]; if(ff) d104D().ground = { day:S.day + 1, uid:ff.uid, why:ev.title }; }
  return r;
};
/* the tanker's plate: the fuel bought today */
const d104EM0 = ev2Money;
ev2Money = function(ev, opt, before){ const c = opt && opt.effects && opt.effects.d104Cost; if(c) return { label:'Fuel bought today', value:c, gold:true, seg:1, cap:`5,000 L × £2.40 = ${money(c)}, paid now` }; return d104EM0.apply(this, arguments); };
function d104Owned(){ return (typeof ownedRoutes === 'function' ? ownedRoutes() : []).filter(id => routeById(id)); }
function d104Effect(ev, opt, tag){
  const D = d104D(), at = ev.day || S.day, M = S.rnd.weekMods || (S.rnd.weekMods = { demandMod:{}, notes:[] });
  if(tag === 'school'){ const m = /(\d+) seats/.exec(ev.text || ''); D.school = { day:d104NextDow(at, 4), route:'par', fare:60, seats:m ? +m[1] : 19 }; }
  else if(tag === 'strikeFly' || tag === 'strikeCancel') D.strike = { day:d104NextDow(at, 5), route:'dub', cancel:tag === 'strikeCancel' };
  else if(tag === 'snackCheap') D.snack = { from:S.day, cost:0.5, sold:false };
  else if(tag === 'sponsor') D.sponsor = { route:'dub', mult:1.05, from:S.day, to:S.day + 27 };
  else if(tag === 'slots') D.slots = { from:at, to:at + 6, max:2, before:9 * 60 };
  else if(tag === 'tanker'){ buyFuel(5000, 2.4); D.tanker = { day:S.day, L:5000, p:2.4 }; }
  else if(tag === 'warHold' || tag === 'warAd'){ M.rivalCut = ev.rivalFareCut || 0.2;
    if(tag === 'warAd') S.rivalAd = { event:ev.id, routes:d104Owned(), untilDay:at + ((ev.durationDays || 7) - 1) };
    D.war = { from:at, to:at + ((ev.durationDays || 7) - 1), kind:tag }; }
  else if(tag === 'warMatch'){ const before = {};
    d104Owned().forEach(id => { before[id] = S.prices[id]; S.prices[id] = Math.max(5, Math.round(S.prices[id] * (1 - (ev.rivalFareCut || 0.2)) / 5) * 5); });
    D.war = { from:at, to:at + ((ev.durationDays || 7) - 1), kind:tag, before }; refreshPlan(); }
}
/* the matched fares go back at the next beat after the week (unless the pupil has changed them since) */
function d104WarEnd(day){
  const D = S && S.d104, W = D && D.war, d = day === undefined ? (S.day || 0) : day; if(!W || d <= W.to) return;   // the day of the beat about to start
  if(W.kind === 'warMatch' && W.before) Object.keys(W.before).forEach(id => { const cut = Math.max(5, Math.round(W.before[id] * 0.8 / 5) * 5); if(S.prices[id] === cut) S.prices[id] = W.before[id]; });
  delete D.war;
}

/* the day's flights: the strike, the school's charter, the slot limit */
const d104PF0 = planFlights;
planFlights = function(){ const out = d104PF0.apply(this, arguments); try{ return d104Flights(out); }catch(e){ console.error(e); return out; } };
const d104Cancel = (x, why) => Object.assign(x, { demand:0, sold:0, revenue:0, grounded:true, cancelled:true, fuelL:0, runCost:0, fuelCost:0, termCost:0, locked:0, flexible:0, reasons:[why] });
function d104Flights(out){
  const D = S && S.d104; if(!D || !Array.isArray(out) || !out.length) return out; const d = typeof simDayNow === 'function' ? simDayNow() : S.day; if(!yearOne(d)) return out;
  if(D.ground && D.ground.day === d) out.forEach(x => { if(x.uid === D.ground.uid && !x.grounded) d104Cancel(x, `Grounded: ${D.ground.why}. The aircraft waits for the part.`); });
  if(D.strike && D.strike.day === d) out.forEach(x => { if(x.route !== D.strike.route || x.grounded) return;
    if(D.strike.cancel) d104Cancel(x, 'Cancelled: the Dublin ground staff strike. Fares refunded.'); else x.reasons = (x.reasons || []).concat(['Delayed by the Dublin ground staff strike: passengers waited at the gate.']); });
  if(D.slots && d >= D.slots.from && d <= D.slots.to){
    out.filter(x => !x.grounded && x.dep < D.slots.before).sort((a, b) => a.dep - b.dep).slice(D.slots.max).forEach(x => d104Cancel(x, 'No early slot: Heathrow allows two departures before 09:00 this week.')); }
  if(D.school && D.school.day === d){   // the school's seats (19) on the first Paris flight at £60; any seats left sell at the fare as usual
    const xs = out.filter(x => x.route === D.school.route && !x.grounded).sort((a, b) => a.dep - b.dep), F = xs[0];
    if(F){ const n = Math.min(D.school.seats || 19, F.seats), keep = Math.min(F.sold, F.seats - n), off = F.sold - keep, lock = Math.min(F.locked || 0, keep);
      let left = Math.min(off, F.flexible || 0);   // the flexible passengers it can no longer carry take seats on the route's other flights
      xs.slice(1).forEach(x => { const k = Math.min(left, Math.max(0, x.seats - x.sold)); if(k > 0){ x.sold += k; x.flexible = (x.flexible || 0) + k; x.revenue = x.sold * x.price; x.termCost = x.sold * termCharge(); left -= k; } });
      Object.assign(F, { sold:n + keep, school:n, locked:lock, flexible:keep - lock, revenue:n * D.school.fare + keep * F.price, termCost:(n + keep) * termCharge(), charter:true,
        reasons:[`School trip: ${n} seats at £${D.school.fare}${keep ? ` and ${keep} at your fare` : ''}, booked on ${dateShort(D.school.day - 2)}.`] }); } }
  return out;
}
/* the plainer snacks: 50p an item */
const d104DX0 = dayExtras;
dayExtras = function(fl){
  const x = d104DX0.apply(this, arguments), D = S && S.d104 && S.d104.snack, d = typeof simDayNow === 'function' ? simDayNow() : S.day;
  if(!D || !x || x.free || !(d >= D.from) || !yearOne(d)) return x;
  const ob = onboardOf(), per = ob.costItem || 0; if(!(per > D.cost) || !x.buyers) return x;
  const f = D.cost / per; x.obCost = r2(x.obCost * f); Object.values(x.byRoute || {}).forEach(r => { if(r.obCost) r.obCost = r2(r.obCost * f); });
  if(!QUIET && x.buyers > 0) D.sold = true;
  return x;
};
/* the sponsorship: Dublin +5% for four weeks */
const d104DM0 = demandMult;
demandMult = function(route, day){
  const m = d104DM0.apply(this, arguments), D = S && S.d104 && S.d104.sponsor, dd = day === undefined ? (S && S.day) : day;
  return D && route && route.id === D.route && dd >= D.from && dd <= D.to && yearOne(dd) ? m * D.mult : m;
};

/* ---------- the cards: the tanker needs room in the tank and the cash ---------- */
function d104TankerWhy(){ const room = Math.floor(tankSpace()), cash = Math.round(S.cash || 0);
  return room < 5000 ? `Needs 5,000 L of room: your tank has ${num(room)} L free.` : cash < 12000 ? `Needs £12,000: you have ${money(cash)}.` : ''; }
const d104RE0 = R.event;
R.event = st => {
  const r = d104RE0(st), ev = S.rnd && S.rnd.event;
  if(ev && ev.id === 'tanker_offer' && S.rnd.eventChoice === undefined){ const why = d104TankerWhy(), b = screen().querySelector('[data-o="0"]');
    if(why && b){ b.disabled = true; b.classList.add('rec'); const sp = b.querySelector('span'); if(sp) sp.insertAdjacentHTML('beforeend', ` · <b>${esc(why)}</b>`); } }
  return r;
};

/* ---------- the slot squeeze: the plan holds until two departures or fewer leave before 09:00 ---------- */
function d104SlotState(){
  const D = S && S.d104 && S.d104.slots; if(!D) return null; const P = S.period, a = P ? P.from : S.day, z = P ? P.to : S.day;
  if(!(z >= D.from && a <= D.to)) return null;
  const deps = []; S.fleet.forEach((f, i) => { const sched = schedOf(f); if(!sched.length) return; try{ TIME.day(planeById(f.planeId), sched, undefined, typeof fleetDeps === 'function' ? fleetDeps(f) : undefined).trips.forEach(t => { if(t.dep < D.before) deps.push({ t:t.dep, route:t.route }); }); }catch(e){} });
  deps.sort((x, y) => x.t - y.t); return { D, deps, over:Math.max(0, deps.length - D.max) };
}
const d104RP0 = R.plan;
if(d104RP0) R.plan = st => {
  const r = d104RP0(st), s = d104SlotState(); if(!s) return r;
  const list = s.deps.map(x => `${fmtTime(x.t)} ${routeById(x.route) ? routeById(x.route).city : x.route}`).join(', ');
  const msg = s.over ? `Heathrow allows two departures before 09:00 this week (${fmtRange(Math.max(s.D.from, S.day), s.D.to)}). Your plan has ${s.deps.length}: ${list}. Move ${s.over === 1 ? 'one' : s.over} of them to 09:00 or later.` : `Heathrow allows two departures before 09:00 this week. Your plan has ${s.deps.length}${list ? `: ${list}` : ''}. That fits.`;
  const host = screen().querySelector('.actbar .ab-hint');   // the footer's line says it (in place of its hint)
  if(host) host.innerHTML = `<span class="d104-slot ${s.over ? 'over' : ''}" role="status">${esc(msg)}</span>`;
  if(s.over){ const nx = $('nx'); if(nx){ nx.disabled = true; nx.title = msg; } }
  return r;
};

/* ---------- the teacher's switch: the autumn track for this airline ---------- */
function d104TeacherRender(){
  const so = $('tSo'); if(!so || !S) return; let el = $('tTrack');
  if(!el){ const sec = so.closest('.tsec'); if(!sec) return; sec.insertAdjacentHTML('afterend', `<div class="tsec" style="grid-column:1/-1"><h3>Autumn track (D104)</h3><div id="tTrack"></div></div>`); el = $('tTrack'); }
  const t = d104Track(), started = (S.day || 1) > 1;
  el.innerHTML = `<div class="row"><span>This airline's autumn</span><select id="tTrackSel"><option value="A" ${t === 'A' ? 'selected' : ''}>Track A: the standard autumn</option><option value="B" ${t === 'B' ? 'selected' : ''}>Track B: a second autumn (played before)</option></select></div>
    <p class="small muted">Track B moves the storm (week 4), the fault (week 3), crew sickness (week 7) and the price war (week 8); a Dublin concert replaces the rugby, an Amsterdam fair replaces Milan's; no Red Kite undercut, Dublin strike, sponsorship or slot squeeze. The school trip, the snack supplier and the tanker play on both.${started ? ' A change takes effect from the next day or week not yet started.' : ''}</p>`;
  const sel = $('tTrackSel'); if(sel) sel.onchange = () => { S.track = sel.value === 'B' ? 'B' : 'A'; try{ settings.autumnTrack = S.track; saveSettings(); }catch(e){} d104Ensure(); save(); d104TeacherRender(); };
}
const d104SoT0 = soTeacherRender;
soTeacherRender = function(){ d104SoT0.apply(this, arguments); try{ d104TeacherRender(); }catch(x){ console.error(x); } };

/* =====================================================================
   3. Growth responds to how a route is served (Settings growthResponds; WE.growthStep). S.g104 keeps each route's
   multiplier (1 = its opening demand), stepped once for each calendar week played, from the history rows. Week 1 sets
   nothing (weeks 1 and 2 stay flat, as before); from week 2 on, how a week served a route sets the next week's demand.
   A row that spans several weeks (a month) gives each of them its average; a week with no rows (the holiday) is skipped.
   A step counts from the day after the row that completed it, so a week or a month keeps the demand it started with
   and its projection holds. Year one only (afterwards the old rule, growthPerWeek from week 3); long haul keeps its own.
   ===================================================================== */
const d104GrowthOn = () => { const v = D104S().growthResponds; return v === true || /^(true|yes|1)$/i.test(String(v === undefined || v === null ? '' : v)); };
const d104Grows = r => !!(r && r.arch && r.archId !== 'long_haul' && r.arch.growthFillBonus !== undefined && r.arch.growthFillBonus !== null);
/* 0 = the top fare of the route's table, 1 = second from top (the airline type's extra fares count as the top) */
function d104FareRank(r, fare){ const F = (r._fares0 && r._fares0.length ? r._fares0 : r.fares) || []; return F.filter(f => f > fare + 1e-9).length; }
const d104NewG = () => ({ v:1, upTo:0, wk:0, done:0, acc:{}, days:0, free:true, m:{}, snaps:[], ta:{}, freeLast:0, since:[], first:{} });
function d104Sync(){
  if(!S || QUIET || !Array.isArray(S.history) || !S.history.length) return;
  if(!S.g104 && (S.day || 1) > y1Last()) return;   // later chapters: nothing to keep
  const G = S.g104 || (S.g104 = d104NewG()), last = y1Last(), all = S.history.filter(h => h && (h.to || 0) > G.upTo);
  const rows = all.filter(h => (h.from || 1) <= last).sort((a, b) => (a.from || 0) - (b.from || 0) || (a.to || 0) - (b.to || 0));
  const quiet = rows.length > 1 && G.upTo === 0 && (S.day || 1) > 8;   // an older save, rebuilt from its history: growth only, no stars
  const free = !!(onboardOf() || {}).free && !quiet;
  rows.forEach(h => d104Row(G, h, quiet, free));
  all.forEach(h => { G.upTo = Math.max(G.upTo, h.to || 0); });
}
function d104Row(G, h, quiet, free){
  const a = Math.max(1, h.from || 1), z = Math.max(a, h.to || a), n = z - a + 1, F = G.first || (G.first = {});
  Object.keys(h.routes || {}).forEach(id => { if((h.routes[id] || {}).trips > 0 && !(F[id] <= a)) F[id] = a; });   // the day a route was first flown (its demand is known a week later)
  for(let k = weekNo(a); k <= weekNo(z); k++){
    const ka = Math.max(a, 7 * k - 6), kz = Math.min(z, 7 * k), share = (kz - ka + 1) / n;
    if(G.wk !== k){ G.wk = k; G.acc = {}; G.days = 0; G.free = true; }
    Object.keys(h.routes || {}).forEach(id => { const x = h.routes[id] || {}, y = G.acc[id] || (G.acc[id] = { pax:0, seats:0, want:0, trips:0, fare:x.fare });
      y.pax += (x.pax || 0) * share; y.seats += (x.seats || 0) * share; y.want += (x.want || 0) * share; y.trips += (x.trips || 0) * share; if(x.fare) y.fare = x.fare; });
    G.days += kz - ka + 1; G.free = G.free && free;
    if(kz === 7 * k && G.done !== k) d104Week(G, k, z, quiet);
  }
}
function d104Week(G, k, z, quiet){
  G.done = k; const end = 7 * k;
  if(k >= 2 && d104GrowthOn() && yearOne(end)){
    let moved = false;
    WORLD.routes.forEach(r => {
      if(!d104Grows(r)) return; const x = G.acc[r.id], m = G.m[r.id] || 1; if(!(x && x.trips > 0) && m <= 1) return;
      const w = x && x.trips > 0 ? { flown:true, fill:x.seats > 0 ? x.pax / x.seats : 0, turnedAway:Math.max(0, Math.round(x.want - x.pax)), fareRank:d104FareRank(r, x.fare) } : { flown:false };
      const m2 = Math.round(WE.growthStep(r.arch, m, w) * 1e4) / 1e4; if(m2 !== m){ G.m[r.id] = m2; moved = true; }
    });
    if(moved) G.snaps.push({ from:Math.max(end, z) + 1, wk:k, m:Object.assign({}, G.m) });
  }
  try{ d104Drivers(G, k, quiet); }catch(e){ console.error(e); }
}
/* the day's multiplier: the last step that had counted by that day (a beat to come: its first day) */
const d104Growth0 = growthOf;
growthOf = function(route, n){
  if(n === undefined && S) n = S.round;
  if(!S || !d104Grows(route) || !d104GrowthOn()) return d104Growth0.call(this, route, n);
  const day = dayFor(n); if(!yearOne(day)) return d104Growth0.call(this, route, n);
  const G = S.g104, s = G && G.snaps; if(!s || !s.length) return 1;
  for(let i = s.length - 1; i >= 0; i--) if(s[i].from <= day) return s[i].m[route.id] || 1;
  return 1;
};
/* how much a route has grown since it opened, for the screens (1 = its opening demand) */
function d104Mult(id, day){ const r = routeById(id); return r ? withDay(day === undefined ? (S.day || 1) : day, () => growthOf(r)) : 1; }
const d104AR0 = applyResults;
applyResults = function(){ const r = d104AR0.apply(this, arguments); try{ d104Sync(); }catch(e){ console.error(e); } return r; };
const d104APR0 = applyPeriodResults;
applyPeriodResults = function(){ const r = d104APR0.apply(this, arguments); try{ d104Sync(); }catch(e){ console.error(e); } return r; };

/* =====================================================================
   4. Stars from week 3 (Settings reputationFromDay). The rating goes public on day 15 with its card (an older save past
   day 15: at the start of its next day or week), not on 6 January; from then, chapter 1's four drivers move it (judged
   from week 3: in weeks 1 and 2 one small plane turns people away on every route, whatever the pupil does):
   - a route turning away 1 in 5 of the people who want to fly, two weeks running: −½, once a route;
   - a plane grounded with no fuel (D103): −½ for the day;
   - free snacks two weeks running: +½, once;
   - each month's review (the week that holds the turn of the month): +½ if a week since the last review ran on time
     with no choice that cost stars or stopped flights; and −½ once if the plainer snacks were sold (the snack supplier).
   Event choices keep their own stars. Before day 15 everything is banked and shown on the card.
   ===================================================================== */
const d104RepDay = () => { const d = +D104S().reputationFromDay; return d > 0 ? d : null; };
const d104StarsOn = () => d104RepDay() !== null;
const d104RFD0 = repFromDay;
repFromDay = function(){ const d = d104RepDay(); return d !== null ? d : d104RFD0.apply(this, arguments); };
function d104Star(n, what, day){
  if(!S || !n) return;
  const r = S.rnd, keep = r ? r.event : undefined; if(r) r.event = null;
  try{ bankStars(n); } finally { if(r) r.event = keep; }
  const L = S.repLog || [], x = L[L.length - 1]; if(x && x.n === n && !x.ev){ x.what = what; x.day = day; x.d104 = 1; }
  (d104D().stars || (d104D().stars = [])).push({ day, n, what });
  addNews([{ tag:'STARS', text:`${what}: ${starText(n)}.`, cls:n > 0 ? 'good' : 'warn' }]);
  try{ rec().pend.events.push({ day, title:'Stars', choice:`${what}: ${starText(n)}`, cost:0 }); }catch(e){}
}
/* a week on time: no choice that cost stars or stopped or delayed flights, no day grounded with no fuel */
function d104OffWeek(k){
  const a = 7 * k - 6, z = 7 * k, inW = d => d >= a && d <= z, D = S.d104 || {};
  return (S.repLog || []).some(x => x.ev && x.n < 0 && inW(x.day)) || Object.values(D.off || {}).some(inW) || !!(S.bust && (S.bust.g || []).some(inW));
}
function d104Drivers(G, k, quiet){
  const end = 7 * k, D = d104D(), A = G.acc, star = (n, what) => { if(!quiet) d104Star(n, what, end); };
  if(!d104StarsOn() || k < weekNo(d104RepDay()) || 7 * k - 6 > d104Ch1End()) return;   // chapter 1's weeks from week 3, when the card has explained them
  G.since.push({ k, on:!d104OffWeek(k) });
  Object.keys(A).forEach(id => { const x = A[id], share = x.want > 0 ? Math.max(0, x.want - x.pax) / x.want : 0, r = routeById(id);
    if(share < 0.2 - 1e-9) return;
    if(G.ta[id] === k - 1 && !(D.taHit && D.taHit[id])){ (D.taHit || (D.taHit = {}))[id] = k; star(-0.5, `${r ? r.city : id} turned away more than 1 in 5 of the people who wanted to fly, two weeks running`); }
    G.ta[id] = k; });
  if(G.free && G.days >= 7){ if(G.freeLast === k - 1 && !D.freeHit){ D.freeHit = k; star(0.5, 'Free snacks two weeks running'); } G.freeLast = k; }
  if(calDate(end).getUTCDate() <= 7){   // the month's review
    const weeks = G.since.splice(0), mo = monthName(end - 7);
    if(weeks.some(w => w.on)) star(0.5, `${mo}'s review: a week on time, with no choice that cost stars`);
    if(D.snack && D.snack.sold && !D.snack.told){ D.snack.told = k; star(-0.5, `${mo}'s review: passengers complained about the plainer snacks`); }
  }
}
/* the choices that stop or delay flights (and so spoil an on-time week); the last choice on a card counts */
const d104Apply1 = applyEventNow;
applyEventNow = function(choice){
  const ev = S.rnd && S.rnd.event, opt = ev && ev.options && ev.options[choice], e = (opt && opt.effects) || {};
  const r = d104Apply1.apply(this, arguments);
  try{ if(ev){ const D = d104D(), off = D.off || (D.off = {}), stop = /DELAYED|CANCELLED/.test(e.status || '') || e.groundNext || e.refund || e.d104 === 'strikeFly' || e.d104 === 'strikeCancel';
    if(stop) off[ev.id] = e.d104 === 'strikeFly' || e.d104 === 'strikeCancel' ? d104NextDow(ev.day || S.day, 5) : (ev.day || S.day); else delete off[ev.id]; } }catch(x){ console.error(x); }
  return r;
};
/* a plane grounded with no fuel */
if(typeof bustGrounded === 'function'){ const d104BG0 = bustGrounded;
  bustGrounded = function(x){ const r = d104BG0.apply(this, arguments); try{ if(d104StarsOn() && x && x.day <= d104Ch1End()) d104Star(-0.5, `Grounded on ${dateShort(x.day)}: no fuel and no cash to buy it`, x.day); }catch(e){ console.error(e); } return r; }; }
/* the rating goes public with its card (not silently at the start of the day) */
const d104Rev0 = revealReputation;
revealReputation = function(){
  if(S && !S.repRevealed && d104StarsOn() && yearOne() && !(Array.isArray(S.steps) && S.steps[S.si] && S.steps[S.si].t === 'stars')) return;
  return d104Rev0.apply(this, arguments);
};
/* day 15: the card after HQ (and after the day's introductions); day 127 keeps only the airline type */
function d104StarsAt(st){ const i = st.findIndex(x => x.t === 'hq'); if(i < 0) return false; let j = i + 1; while(st[j] && st[j].t === 'intro') j++; st.splice(j, 0, { t:'stars' }); return true; }
const d104DS0 = daySteps;
daySteps = function(n, w){
  const st = d104DS0.apply(this, arguments), d = beatDay(n); if(!Array.isArray(st) || !d104StarsOn()) return st;
  if(d === d104RepDay() && yearOne(d) && !(S && S.repRevealed) && !st.some(x => x.t === 'stars')) d104StarsAt(st);
  if(CH2_DAY && d === CH2_DAY && S && S.repRevealed){ const i = st.findIndex(x => x.t === 'stars'); if(i >= 0) st.splice(i, 1); }
  return st;
};
const d104C2F0 = ch2StepsFix;
ch2StepsFix = function(){
  if(!(S && d104StarsOn() && S.repRevealed)) return d104C2F0.apply(this, arguments);
  if(!CH2_DAY || S.day !== CH2_DAY || !Array.isArray(S.steps) || S.phase !== 'round' || !T2().on || S.steps.some(x => x.t === 'atype')) return;
  const shop = S.steps.findIndex(x => x.t === 'shop2' || x.t === 'plan'); if(shop < 0 || S.si > shop) return;
  S.steps.splice(shop, 0, { t:'atype' });
};
/* an older save past day 15 with the stars still hidden: the card at the start of its next day or week (not the holiday) */
function d104StarsStep(){
  if(!S || S.phase !== 'round' || S.repRevealed || !d104StarsOn() || !yearOne() || (S.day || 1) < d104RepDay() || !Array.isArray(S.steps) || S.steps.some(x => x.t === 'stars')) return;
  if(S.period && S.period.type === 'gap') return;
  const i = S.steps.findIndex(x => x.t === 'hq'); if(i < 0 || S.si !== i) return;
  d104StarsAt(S.steps);
}
const d104Render1 = render;
render = function(){ try{ if(S && Array.isArray(S.history) && S.history.length && (!S.g104 || (S.history[S.history.length - 1].to || 0) > S.g104.upTo)) d104Sync(); d104StarsStep(); }catch(e){ console.error(e); } return d104Render1.apply(this, arguments); };
/* the event card's stars: public from Monday of week 3 */
if(typeof ev2Plate === 'function'){ const d104Plate0 = ev2Plate;
  ev2Plate = function(){ const h = d104Plate0.apply(this, arguments), d = d104RepDay(); return d && yearOne() ? h.replace(/ · public from [A-Z][a-z]+/, ` · public from ${dateShort(d)} (week ${weekNo(d)})`) : h; }; }

/* ---------- the card: your star rating is public (week 3) ---------- */
function d104StarsCardHtml(){
  const day = S.day || 1, first = day <= (d104RepDay() || 15) + 6, upTo = S.repReveal ? S.repReveal.day : day, pct = Math.round(T2().per * 100);
  const L = (S.repLog || []).filter(x => !x.live && x.day < upTo), cls = n => n > 0 ? 'up' : 'down';
  const moves = L.length ? `<table class="d104-rv-t"><thead><tr><th>When</th><th>What happened</th><th class="num">Stars</th></tr></thead><tbody>${L.map(x => `<tr><td>${esc(dateShort(x.day))}</td><td>${esc(x.what)}</td><td class="num ${cls(x.n)}">${esc(starText(x.n))}</td></tr>`).join('')}</tbody>
      <tfoot><tr><th colspan="2">Start at 3, ${L.map(x => starText(x.n).replace(/ stars?$/, '')).join(' ')}</th><th class="num">${esc(ratingText(S.rep))}</th></tr></tfoot></table>`
    : `<p class="d104-rv-l">Nothing moved your stars ${first ? 'in your first two weeks' : 'so far'}, so you start at 3.</p>`;
  const h = Math.round(S.rep * 2) - 6, sum = h > 0 ? `${esc(ratingText(S.rep))}: ${h} half-star${h > 1 ? 's' : ''} above 3, so ${h} × ${pct}% = <b>${h * pct}% more</b> people want to fly on every route.`
    : h < 0 ? `${esc(ratingText(S.rep))}: ${-h} half-star${h < -1 ? 's' : ''} below 3, so ${-h} × ${pct}% = <b>${-h * pct}% fewer</b> people want to fly on every route.` : `3 stars: no half-stars above or below 3, so <b>no change</b> yet.`;
  const own = d104Owned().map(id => routeById(id)).filter(Boolean), r = own[0] || routeById('dub'); let eg = '';
  if(r){ const fare = S.prices[r.id] || r.basePrice, keep = S.rep; let base; try{ S.rep = 3; base = paxWant(r, fare); } finally { S.rep = keep; } const now = paxWant(r, fare);
    eg = h ? `<p class="d104-rv-l">${esc(r.city)} at ${money(fare)}: ${num(base)} want to fly a day at 3 stars; ${num(now)} at ${esc(ratingText(S.rep))}.</p>` : `<p class="d104-rv-l">${esc(r.city)} at ${money(fare)}: ${num(now)} want to fly a day. Half a star more would make it ${num(Math.round(base * (1 + T2().per)))}.</p>`; }
  const drivers = [['up', '+½', 'at each month\'s review, if a week ran on time with no choice that cost stars'], ['up', '+½', 'once, for free snacks two weeks running'],
    ['down', '−½', 'once for a route that turns away more than 1 in 5 of the people who want to fly, two weeks running'], ['down', '−½', 'for each day a plane is grounded with no fuel']];
  return `<div class="d104-rvg">
    <section class="bv-panel active d104-rv-score"><span class="bv-eyebrow d104-eb">Result</span><h2>Your star rating</h2><div class="rv-big"><span class="stars">${deskStars(S.rep)}</span><b>${esc(ratingText(S.rep))}</b><p>Passengers can see it now, and it changes how many want to fly with you.</p></div></section>
    <section class="bv-panel support d104-rv-moves"><h2>What moved it ${first ? 'in your first two weeks' : 'so far'}</h2>${moves}</section>
    <section class="bv-panel support d104-rv-worth"><span class="bv-eyebrow d104-eb model">Model</span><h2>What it is worth</h2><div class="d104-rv-rule"><span>Each half-star above 3</span><b class="up">+${pct}%</b><span>Each half-star below 3</span><b class="down">−${pct}%</b></div><p class="d104-rv-sum">${sum}</p>${eg}</section>
    <section class="bv-panel support d104-rv-drv"><h2>What moves it from now</h2><ul>${drivers.map(([c, n, t]) => `<li><b class="${c}">${n}</b><span>${esc(t)}</span></li>`).join('')}</ul><p class="d104-rv-l">Your choices on the event cards move it too.</p></section></div>`;
}
const d104RStars0 = R.stars;
R.stars = st => {
  if(!d104StarsOn() || !yearOne() || (CH2_DAY && (S.day || 1) >= CH2_DAY)) return d104RStars0(st);
  revealReputation(); const first = (S.day || 1) <= (d104RepDay() || 15) + 6;
  screen().innerHTML = shell(deskPage({ title:'Your star rating is public', sub:first ? 'For two weeks, how you treated passengers has been noted. From today it counts.' : 'Since Launch Day, how you treated passengers has been noted. From today it counts.', cls:'rv-page d104-rvp', body:d104StarsCardHtml() }),
    deskBar('Full planes, on-time weeks and your choices move your stars.', `<button class="btn primary big" id="nx">Next &#9654;</button>`));
  on('nx', () => { UI.justDone = null; next(); });
};
/* the event card's departures board: with a notice line under it (an event not about one flight), two rows, not three */
if(typeof ev2BoardRows === 'function'){ const d104EBR0 = ev2BoardRows;
  ev2BoardRows = function(ev, F){ const B = d104EBR0.apply(this, arguments); if(!F && B && B.rows && B.rows.length > 2) B.rows = B.rows.slice(0, 2); return B; }; }

/* =====================================================================
   5. New routes show their demand as a range until flown for a week (Settings newRouteUncertainty; Routes demandKnown):
   "about 70–95", the true figure × (1 ± 0.15) widened to the nearest 5. Paris and Dublin are known from the start; the
   others from the day a week after their first flight. The model's own sums keep the true figure. The ranges are put
   in after a screen is drawn (one pass over the places that show a route's demand), so every way of drawing them gets it.
   ===================================================================== */
const d104Unc = () => { const u = +D104S().newRouteUncertainty; return u > 0 && u < 1 ? u : 0; };
const d104WBR = id => ((WB && WB.routes) || []).find(x => x.id === id) || {};
function d104Known(id, day){
  if(!S || !d104Unc() || !routeById(id)) return true; day = day === undefined ? (S.day || 1) : day; if(!yearOne(day)) return true;
  const k = String(d104WBR(id).demandKnown || 'yes').trim().toLowerCase(); if(k === 'yes' || k === 'true') return true;
  const f = d104First()[id]; return f !== undefined && f + 7 <= day;
}
/* the day each route was first flown (kept as the history is read; worked out from the history if missing) */
function d104First(){
  const G = S && S.g104; if(!G) return {}; if(G.first) return G.first; const F = G.first = {};
  (S.history || []).slice().sort((a, b) => (a.from || 0) - (b.from || 0)).forEach(h => { const a = Math.max(1, h.from || 1); Object.keys(h.routes || {}).forEach(id => { if((h.routes[id] || {}).trips > 0 && !(F[id] <= a)) F[id] = a; }); });
  return F;
}
function d104Range(n){ const u = d104Unc(), k = n >= 20 ? 5 : 1; return [Math.max(0, Math.floor(n * (1 - u) / k) * k), Math.max(1, Math.ceil(n * (1 + u) / k) * k)]; }   // to the nearest 5 outside (whole numbers under 20)
const d104RangeTxt = (n, prose) => { const [a, b] = d104Range(n); return `${prose ? 'about ' : ''}${num(a)}–${num(b)}`; };
let D104_UNK = { key:null, set:null };
function d104UnknownSet(){
  if(!S || !d104Unc() || !yearOne()) return null;
  const key = `${S.day}|${S.g104 ? S.g104.upTo : 0}|${Object.keys(d104First()).length}`; if(D104_UNK.key === key) return D104_UNK.set;
  const out = new Set(WORLD.routes.filter(r => !d104Known(r.id)).map(r => r.id)); D104_UNK = { key, set:out.size ? out : null }; return D104_UNK.set;
}
const d104Num = el => { const m = /(\d[\d,]*)/.exec(el ? el.textContent : ''); return m ? +m[1].replace(/,/g, '') : null; };
const D104_TIP = 'A new route: a range until you have flown it for a week';
function d104SetRange(el, prose){ if(!el || el.dataset.d104r) return; const n = d104Num(el); if(n === null) return; el.dataset.d104r = String(n); el.textContent = el.textContent.replace(/\d[\d,]*/, d104RangeTxt(n, prose)); el.title = `${D104_TIP}. Your sums use the true figure.`; el.classList.add('d104-rng'); }
const d104CityId = txt => { const t = String(txt || '').replace(/\s+/g, ' ').trim(); const r = WORLD.routes.find(x => t === x.city || t.indexOf(x.city + ' ') === 0); return r ? r.id : null; };
function d104Ranges(root){
  const U = d104UnknownSet(); if(!U || !root) return; const unk = id => !!id && U.has(id), q = (sel, el) => Array.from((el || root).querySelectorAll(sel));
  q('[data-s2r]').forEach(row => { if(unk(row.dataset.s2r)) d104SetRange(row.querySelector('.s2-n')); });   // the Studio's active routes
  const ed = root.querySelector('.s2-ed'), eid = UI.s2 && UI.s2.route;   // the route editor: every fare
  if(ed && unk(eid) && !ed.dataset.d104r){ ed.dataset.d104r = '1'; q('.s2-ft tbody td.num', ed).forEach(td => d104SetRange(td)); d104SetRange(ed.querySelector('.s2-cmp span:first-child b'));
    const p = ed.querySelector('.s2-cmp p'); if(p) p.textContent = 'You will know the demand after a week of flying. Until then, plan for the range.';
    const n = ed.querySelector('.s2-ed-n'); if(n) n.insertAdjacentHTML('afterend', `<p class="d104-unc">${D104_TIP}.</p>`); }
  q('select[data-s2fr]').forEach(sel => { if(!unk(sel.dataset.s2fr) || sel.dataset.d104r) return; sel.dataset.d104r = '1';
    Array.from(sel.options).forEach(o => { o.textContent = o.textContent.replace(/· (\d[\d,]*) want/, (m0, n) => `· ${d104RangeTxt(+n.replace(/,/g, ''), true)} want`); }); });
  q('[data-stroute]').forEach(card => { if(!unk(card.dataset.stroute)) return;   // the route cards (Add / change routes)
    const many = q('.fch', card).length > 6;   // nine fares: only the chosen fare's range fits over its bar (the others say it when pointed at)
    q('.fch', card).forEach(b => { const sm = b.querySelector('small'); if(many && !b.classList.contains('on')){ if(sm && !sm.dataset.d104r){ sm.dataset.d104r = '1'; sm.textContent = ''; } } else d104SetRange(sm); if(b.title && !b.dataset.d104t){ b.dataset.d104t = '1'; b.title = b.title.replace(/: (\d[\d,]*) people/, (m0, n) => `: ${d104RangeTxt(+n.replace(/,/g, ''), true)} people`); } });
    const cap = card.querySelector('.st-cap b'); if(cap && !cap.dataset.d104r){ const m = /: (\d[\d,]*)$/.exec(cap.textContent); if(m){ cap.dataset.d104r = m[1]; cap.textContent = cap.textContent.replace(/: \d[\d,]*$/, `: ${d104RangeTxt(+m[1].replace(/,/g, ''), true)}`); cap.title = D104_TIP; } } });
  q('.st-strip[data-strip]').forEach(st => { if(!unk(st.dataset.strip) || st.dataset.d104r) return; st.dataset.d104r = '1';   // the demand strip
    q('.st-sl b', st).forEach(b => { b.childNodes.forEach(t => { if(t.nodeType === 3) t.textContent = t.textContent.replace(/: (\d[\d,]*) want to fly/, (m0, n) => `: ${d104RangeTxt(+n.replace(/,/g, ''), true)} want to fly`); }); });
    q('.ds-n', st).forEach(e => d104SetRange(e)); });
  q('.net-dest tbody tr').forEach(tr => { const td = tr.children; if(td.length > 4 && unk(d104CityId(td[0].textContent))) d104SetRange(td[4]); });   // Network: Destinations
  q('.wr-rk tbody tr').forEach(tr => { const td = tr.children; if(td.length > 3 && unk(d104CityId(td[0].textContent.replace(/not flown/, '')))) d104SetRange(td[3]); });   // Home: the rival's fares
  const dem = root.querySelector('.wr-dem'), wr = $('wrRoute'); if(dem && wr && unk(wr.value) && !dem.dataset.d104r){ dem.dataset.d104r = '1'; q('.wr-b .wr-n', dem).forEach(e => d104SetRange(e)); const l = dem.querySelector('.wr-l'); if(l) l.insertAdjacentHTML('beforeend', ` <span class="d104-unc">${D104_TIP}.</span>`); }
}
let D104_OBS = null, D104_PEND = false;
function d104Observe(){
  if(D104_OBS || typeof MutationObserver === 'undefined') return; const host = document.getElementById('screen'); if(!host) return;
  D104_OBS = new MutationObserver(() => { if(D104_PEND) return; D104_PEND = true; Promise.resolve().then(() => { D104_PEND = false; try{ d104Ranges(host); }catch(e){ console.error(e); } }); });
  D104_OBS.observe(host, { childList:true, subtree:true });
}
const d104Render2 = render;
render = function(){ const r = d104Render2.apply(this, arguments); try{ d104Observe(); d104Ranges(document.getElementById('screen')); }catch(e){ console.error(e); } return r; };
/* the review of a week or a month names the star moves in it (the drivers; a grounded day), with the rating now */
function d104StarsLine(from, to){
  if(!S || !d104StarsOn() || !yearOne(to)) return '';
  const L = ((S.d104 && S.d104.stars) || []).filter(x => x.day >= from && x.day <= to); if(!L.length) return '';
  return `<div class="fuel-adv d104-st"><span class="kl">Stars ${to - from > 6 ? 'in this period' : 'this week'}</span>${L.map(x => `<span><b class="${x.n > 0 ? 'up' : 'down'}">${esc(starText(x.n))}</b> ${esc(x.what)}.</span>`).join('')}<span>Your rating now: <b>${esc(ratingText(S.rep))}</b>.</span></div>`;
}
const d104Sur0 = surprisesLine;
surprisesLine = function(from, to){ return d104Sur0.apply(this, arguments) + d104StarsLine(from, to); };
/* a one-day range is the day ("5 October", not "5–5 October": track B's concert) */
const d104FR0 = fmtRange;
fmtRange = function(a, b){ if(a === b && yearOne(a)){ const A = calDate(a); return `${A.getUTCDate()} ${MONTH[A.getUTCMonth()]}`; } return d104FR0.apply(this, arguments); };
