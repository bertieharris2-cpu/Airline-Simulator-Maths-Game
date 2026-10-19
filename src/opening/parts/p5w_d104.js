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
  'school_trip:1':'You took the school\'s booking. Thursday\'s first Paris flight goes full at £60 a seat.',
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
  let ge = gameEvent(id) || (tw ? gameEvent(tw) : null);   // the storm keeps its Events-row choices on track B
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
startBeatBase = function(b){ try{ d104Ensure(); d104WarEnd(); }catch(e){ console.error(e); } const r = d104SBB0.apply(this, arguments); try{ d104Queue(roundData(b)); }catch(e){ console.error(e); } return r; };
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
  if(tag === 'school') D.school = { day:d104NextDow(at, 4), route:'par', fare:60 };
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
function d104WarEnd(){
  const D = S && S.d104, W = D && D.war; if(!W || (S.day || 0) <= W.to) return;
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
  if(D.school && D.school.day === d){
    const xs = out.filter(x => x.route === D.school.route && !x.grounded).sort((a, b) => a.dep - b.dep), F = xs[0];
    if(F){ let left = F.flexible || 0;   // the flexible passengers it would have carried take seats on the route's other flights
      xs.slice(1).forEach(x => { const n = Math.min(left, Math.max(0, x.seats - x.sold)); if(n > 0){ x.sold += n; x.flexible = (x.flexible || 0) + n; x.revenue = x.sold * x.price; x.termCost = x.sold * termCharge(); left -= n; } });
      Object.assign(F, { sold:F.seats, locked:0, flexible:0, price:D.school.fare, revenue:F.seats * D.school.fare, termCost:F.seats * termCharge(), charter:true,
        reasons:[`School trip: all ${F.seats} seats at £${D.school.fare}, booked on ${dateShort(D.school.day - 2)}.`] }); } }
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
  const host = screen().querySelector('.tf-foot, footer, .foot');
  if(host) host.insertAdjacentHTML('afterbegin', `<p class="d104-slot ${s.over ? 'over' : ''}" role="status">${esc(msg)}</p>`);
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
