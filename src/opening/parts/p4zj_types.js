/* ==================================================================
   CHAPTER 2, PUSH 2 (Workbook v5.0, D69–D71): reputation revealed, the airline type (light), Value's bag fee and
   chapter 2's sign-offs. In the game (once the revised Studio only).
   - Reputation (Settings reputationFromDate, else chapter 2's first day; reputationPerHalfStar; reputationBankedFromAutumn):
     the autumn's event stars were banked silently; on 6 January the rating is revealed at that level with a card listing
     what moved it, and from then demand on every route is × (1 + 0.05 × half-stars from 3). Only the workbook's stated
     effects move the stars (events, challenges): the prototype's daily ½-star for a high fare, free snacks or the cabin
     layout stays off, since the Premium airline's point is the higher fares.
   - The airline type (airlineTypeMode light), chosen on day 127 and confirmed on Thursday (the Calendar's "airline type
     confirmed"): Premium opens the two demand-table steps above each route's top fare (premiumExtraFareSteps) and moves
     stars 1.5× as fast; Value opens one step below (valueLowerFareSteps), moves stars 0.75× as fast and charges the bag
     fee; Full Service is unchanged. The rating shown and used is whole half-stars, counted towards 3 (3¾ shows 3½); the
     quarter is kept, so a second ½ makes it 4½.
   - Bags (extrasBagFee £20, extrasBagTakeUp 0.4): a revenue line for a Value airline, passengers × 4 tenths × £20 a day.
   - Sign-offs (Change Note §6, under the cap of three): the first long-haul ticket sum, estimated first (200 × £510 is
     about 200 × £500); the first long-haul fuel line on the service card (12,375 L × £2.17); the bag fee for a Value
     airline, two steps (4 tenths of the passengers, then × £20). Rent-or-buy at jet scale and a full long-haul plane
     (seats × fare, the same numbers as the ticket sum) are Build.
   ================================================================== */
const CH2_DAY = typeof CH2 !== 'undefined' && CH2 ? dayOfDate(CH2.start) : null;
const T2 = () => { const st = WORLD.settings || {}; return { per:st.reputationPerHalfStar !== undefined ? st.reputationPerHalfStar : 0.05, prem:st.premiumStarRate || 1.5, val:st.valueStarRate || 0.75, banked:st.reputationBankedFromAutumn !== false,
  up:st.premiumExtraFareSteps === undefined ? 2 : st.premiumExtraFareSteps, down:st.valueLowerFareSteps === undefined ? 1 : st.valueLowerFareSteps, fee:st.extrasBagFee || 20, take:st.extrasBagTakeUp === undefined ? 0.4 : st.extrasBagTakeUp,
  on:(st.airlineTypeMode || 'light') !== 'off' }; };
const ch2Now = () => !!(CH2_DAY && S && (S.day || 1) >= CH2_DAY);
const halfWord = h => { const a = Math.abs(h), w = Math.floor(a / 2), half = a % 2; return `${w || !half ? w : ''}${half ? '½' : ''}`; };
const starText = n => { const h = Math.round(n * 2); return `${h >= 0 ? '+' : '−'}${halfWord(h)} star${Math.abs(h) > 2 || Math.abs(h) === 0 ? 's' : ''}`; };
const ratingText = r => `${halfWord(Math.round(r * 2))} star${r === 1 ? '' : 's'}`;

/* ---------- reputation: when it goes live, what it is worth, what moves it ---------- */
function repFromDay(){ const d = gateDay('reputationFromDate'); return d !== null ? d : (CH2_DAY && (WORLD.settings || {}).reputationPerHalfStar !== undefined ? CH2_DAY : null); }
let REP_QUIET = 0;
repLive = function(){ if(REP_QUIET) return false; const d = repFromDay(); return !!(d !== null && S && (S.day || 1) >= d) || !!WORLD.reputationOn; };
/* whole half-stars from 3, counted towards 3 */
function repHalves(x){ const h = (x - 3) * 2; return h >= 0 ? Math.floor(h + 1e-9) : Math.ceil(h - 1e-9); }
function repShown(x){ return clamp(3 + repHalves(x) / 2, 1, 5); }
repFactor = function(){ if(!repLive()) return 1; return Math.max(0, 1 + T2().per * Math.round(((S && S.rep) || 3) * 2 - 6)); };
function starRate(t){ t = t === undefined ? airlineType() : t; return t === 'premium' ? T2().prem : t === 'value' ? T2().val : 1; }
/* an event's stars: banked before the reveal, scaled by the airline type after it; each change is logged for the reveal card */
const bankStarsT0 = bankStars;
bankStars = function(n){
  if(!n || !S) return;
  const live = repLive(), ev = S.rnd && S.rnd.event, L = S.repLog || (S.repLog = []), last = L[L.length - 1], rate = live ? starRate() : 1;
  const opt = ev && S.rnd.eventChoice !== undefined && ev.options ? ev.options[S.rnd.eventChoice] : null;
  S.repBank = r2((S.repBank || 0) + n);
  if(live){ let x = S.repExact; if(x === undefined || x === null || repShown(x) !== S.rep) x = S.rep; x = clamp(Math.round((x + n * rate) * 1000) / 1000, 1, 5); S.repExact = x; S.rep = repShown(x); }
  if(last && ev && last.ev === ev.id && last.day === S.day && last.n === -n){ L.pop(); return; }   // a choice taken back
  L.push({ day:S.day, n, eff:live ? Math.round(n * rate * 1000) / 1000 : 0, live, ev:ev ? ev.id : null, what:ev ? `${ev.title}${opt ? `: ${opt.label}` : ''}` : 'Stars' });
};
/* the prototype's daily stars (a high fare, free snacks, the cabin) stay off: only the stated effects move the rating */
const applyResultsT0 = applyResults;
applyResults = function(){ const r0 = S.rep; REP_QUIET++; try{ return applyResultsT0.apply(this, arguments); } finally { REP_QUIET--; S.rep = r0; if(S.rnd) S.rnd.repDelta = 0;
  const X = S.rnd && S.rnd.extras; if(X && X.bagRev) (S.bagDays = S.bagDays || {})[S.day] = X.bagRev; } };
const applyPeriodResultsT0 = applyPeriodResults;
applyPeriodResults = function(){ const r0 = S.rep; REP_QUIET++; try{ return applyPeriodResultsT0.apply(this, arguments); } finally { REP_QUIET--; S.rep = r0; if(S.rnd) S.rnd.repDelta = 0; } };
/* the reveal: at the banked level (or 3 if the workbook says the autumn is not banked) */
const revealT0 = revealReputation;
revealReputation = function(){
  const was = S && S.repRevealed; revealT0(); if(!S || was || !S.repRevealed) return;
  if(!T2().banked) S.rep = WORLD.startingReputation || 3;
  S.repExact = S.rep; S.repReveal = { day:S.day, bank:S.repBank || 0, rep:S.rep };
  try{ rec().pend.events.push({ day:S.day, title:'Star rating revealed', choice:ratingText(S.rep), cost:0 }); }catch(e){}
  if(CH2_DAY && S.day > CH2_DAY) addNews([{ tag:'NEWS', text:`Your star rating is public: ${ratingText(S.rep)}. Each half-star above 3 brings ${Math.round(T2().per * 100)}% more passengers.` }]);
};

/* ---------- the airline type ---------- */
const ATYPE = {
  premium:{ name:'Premium', short:'Premium', line:'Higher fares, higher expectations.' },
  full:{ name:'Full Service', short:'Full Service', line:'As you are now.' },
  value:{ name:'Value', short:'Value', line:'Lower fares, paid extras.' } };
function airlineType(){ return S && S.atype && S.atype.pick || null; }
function typeFaresFor(r, t){
  const base = r._fares0 || []; if(!t || t === 'full' || !r.demandAtFare || !base.length || !T2().on) return base;
  const k = Object.keys(r.demandAtFare).map(Number).filter(v => !isNaN(v)).sort((a, b) => a - b), lo = Math.min(...base), hi = Math.max(...base);
  if(t === 'premium') return base.concat(k.filter(v => v > hi).slice(0, T2().up));
  if(t === 'value') return (T2().down > 0 ? k.filter(v => v < lo).slice(-T2().down) : []).concat(base);
  return base;
}
/* every workbook route's fare menu follows the type (the shop, the Studio, the sweep and the sums all read r.fares) */
WORLD.routes.forEach(r => { if(!r.wb) return; r._fares0 = (r.fares || []).slice(); const get = () => typeFaresFor(r, airlineType());
  Object.defineProperty(r, 'fares', { get, set(v){ r._fares0 = (v || []).slice(); }, configurable:true, enumerable:true });
  Object.defineProperty(r, 'prices', { get, set(){}, configurable:true, enumerable:true }); });
/* a fare that is no longer on the menu moves to the nearest one */
function typeSnap(){ const fix = P => { if(!P) return; Object.keys(P).forEach(id => { const r = routeById(id); if(r && r.wb && !r.fares.includes(P[id])) P[id] = nearestFare(r, P[id]); }); };
  fix(S.prices); if(S.rnd && S.rnd.test) fix(S.rnd.test.prices); if(S.rop) fix(S.rop.prices); }
function setAirlineType(t, confirm){
  const was = airlineType(); S.atype = Object.assign({}, S.atype || {}, { pick:t, day:(S.atype && S.atype.day) || S.day });
  if(confirm){ S.atype.confirmed = true; S.atype.confirmDay = S.day; }
  typeSnap(); if(typeof refreshPlan === 'function') refreshPlan();
  if(confirm || was !== t){ try{ const R = rec(), E = R.pend.events, e = E.find(x => x.title === 'Airline type' && x.day === S.day); const choice = `${ATYPE[t].name}${confirm ? ' (confirmed)' : ''}`; if(e) e.choice = choice; else E.push({ day:S.day, title:'Airline type', choice, cost:0 }); }catch(e){} }
  save();
}
function typeConfirmDay(){ const c = CAL.find(x => x.unlocks && (x.unlocks.mechanics || []).some(m => /airline type confirmed/i.test(m))); return c ? c.day : (CH2_DAY ? CH2_DAY + 3 : null); }

/* ---------- Value's bag fee: four tenths of the passengers × £20, on every route ---------- */
function bagsFor(pax){ return Math.round(pax * T2().take); }
const extrasT0 = dayExtras;
dayExtras = function(fl){
  const X = extrasT0(fl); if(airlineType() !== 'value' || !ch2Now()) return Object.assign(X, { bags:0, bagRev:0 });
  let bags = 0; Object.keys(X.byRoute || {}).forEach(id => { const x = X.byRoute[id], b = bagsFor(x.pax || 0); x.bags = b; bags += b; });
  const bagRev = bags * T2().fee; return Object.assign(X, { bags, bagRev, obRev:(X.obRev || 0) + bagRev });
};
/* the Bags line: in the plan summary, the trade-offs' money and the day's results */
const s2SummaryT0 = s2Summary;
s2Summary = function(pl, L, hid){
  const h = s2SummaryT0(pl, L, hid), X = L && L.X; if(airlineType() !== 'value' || !X || !ch2Now()) return h;
  return h.replace('<span class="grow"></span>', `<span class="s2-si s2-bags"><small>Bags</small><span><b class="mono">${money(X.bagRev || 0)}</b><em>${num(X.bags || 0)} × ${money(T2().fee)}</em></span></span><span class="grow"></span>`);
};
const s2InsightsT0 = s2Insights;
s2Insights = function(pl, L, hid){
  const out = s2InsightsT0(pl, L, hid), X = L && L.X; if(airlineType() !== 'value' || !X || !X.bagRev) return out;
  return out.map(g => g[0] !== 'Money' || !g[2] ? g : [g[0], g[1], g[2].replace(/(<span><small>On-board sales<\/small><b class="mono">)[^<]*(<\/b><\/span>)/, `$1${money(Math.round((L.v.snack || 0) - X.bagRev))}$2<span><small>Bags</small><b class="mono">${money(X.bagRev)}</b></span>`)]);
};
const cashLineT0 = cashLine;
cashLine = function(){ const h = cashLineT0(), X = S.rnd && S.rnd.extras; if(!X || !X.bagRev) return h;
  const line = ` · <span class="dr-bags">bags ${num(X.bags)} × ${money(T2().fee)} = <b>${money(X.bagRev)}</b> (in the revenue)</span>`, i = h.lastIndexOf('</p>');
  return i >= 0 ? h.slice(0, i) + line + h.slice(i) : h + line; };

/* ---------- day 127: the stars revealed, then the choice of type; Thursday: confirm it ---------- */
const dayStepsT0 = daySteps;
daySteps = function(n, w){
  const st = dayStepsT0(n, w); if(!CH2_DAY || beatDay(n) !== CH2_DAY) return st;
  const at = st.findIndex(x => x.t === 'intro'), i = at >= 0 ? at + 1 : Math.max(1, st.findIndex(x => x.t === 'hq') + 1);
  const add = [{ t:'stars' }].concat(T2().on ? [{ t:'atype' }] : []); st.splice(i, 0, ...add); return st;
};
/* a save made on day 127 before these pages existed gets them, if the pupil has not reached the shop yet */
function ch2StepsFix(){
  if(!S || !CH2_DAY || S.day !== CH2_DAY || !Array.isArray(S.steps) || S.steps.some(x => x.t === 'stars') || S.phase !== 'round') return;
  const shop = S.steps.findIndex(x => x.t === 'shop2' || x.t === 'plan'); if(shop < 0 || S.si > shop) return;
  S.steps.splice(shop, 0, ...[{ t:'stars' }].concat(T2().on ? [{ t:'atype' }] : []));
}
const renderT0 = render;
render = function(){ try{ ch2StepsFix(); if(S && Array.isArray(S.steps) && S.steps[S.si] && S.steps[S.si].t === 'stars') revealReputation(); }catch(e){} return renderT0.apply(this, arguments); };
const enterRunDayT0 = enterRunDay;
enterRunDay = function(nb){
  enterRunDayT0(nb); const d = typeConfirmDay();
  if(T2().on && d !== null && S.day === d && !(S.atype && S.atype.confirmed)){ S.steps.splice(S.si, 0, { t:'atypeOk' }); render(); }
};
Object.assign(RAIL_LABEL, { stars:'Your star rating', atype:'What sort of airline?', atypeOk:'Confirm the airline type' });
SHELL_STEPS.push('stars', 'atype', 'atypeOk'); NO_BACK.push('atypeOk');

/* the reveal card */
function repMovesHtml(){
  const L = (S.repLog || []).filter(x => !x.live && x.day < (S.repReveal ? S.repReveal.day : (CH2_DAY || 1e9)));
  if(L.length) return `<table class="dk-t rv-t"><thead><tr><th>When</th><th>What happened</th><th class="num">Stars</th></tr></thead><tbody>${L.map(x => `<tr><td>${esc(dateShort(x.day))}</td><td>${esc(x.what)}</td><td class="num ${x.n > 0 ? 'good' : 'bad'}">${esc(starText(x.n))}</td></tr>`).join('')}</tbody>
    <tfoot><tr><th colspan="2">Start at 3, ${L.map(x => starText(x.n).replace(/ stars?$/, '')).join(' ')}</th><th class="num">${esc(ratingText(S.rep))}</th></tr></tfoot></table>`;
  const b = S.repBank || 0;
  return b ? `<p class="rv-l">Your choices in the autumn came to <b>${esc(starText(b))}</b> altogether (the game did not keep each one then).</p>` : '<p class="rv-l">Nothing in the autumn moved your stars, so you start at 3.</p>';
}
function repWorthHtml(){
  const h = Math.round(S.rep * 2) - 6, pct = Math.round(T2().per * 100), r = routeById('nyc'), fare = r ? (S.prices[r.id] || r.basePrice) : 0;
  const sum = h > 0 ? `${esc(ratingText(S.rep))}: ${h} half-star${h > 1 ? 's' : ''} above 3, so ${h} × ${pct}% = <b>${h * pct}% more</b> passengers on every route.` : h < 0 ? `${esc(ratingText(S.rep))}: ${-h} half-star${h < -1 ? 's' : ''} below 3, so ${-h} × ${pct}% = <b>${-h * pct}% fewer</b> passengers on every route.` : `3 stars: no half-stars above or below 3, so <b>no change</b> to your passengers.`;
  let eg = '';
  if(r && h){ const keep = S.rep; let base; try{ S.rep = 3; base = paxWant(r, fare); } finally { S.rep = keep; } const now = paxWant(r, fare); eg = `<p class="rv-l">New York at ${money(fare)}: ${num(base)} want to fly at 3 stars; ${num(now)} at ${esc(ratingText(S.rep))}.</p>`; }
  return `<div class="rv-rule"><span>Each half-star above 3</span><b>+${pct}%</b><span>Each half-star below 3</span><b>−${pct}%</b></div><p class="rv-sum">${sum}</p>${eg}`;
}
R.stars = st => {
  if(typeof revealReputation === 'function') revealReputation();
  const body = `<div class="rv-g"><section class="dk-pnl rv-score"><div class="dk-pnl-h">${ICO2.medal}<h2>Your star rating</h2></div><div class="rv-big"><span class="stars">${deskStars(S.rep)}</span><b>${esc(ratingText(S.rep))}</b><p>Passengers can now see it, and it changes how many want to fly with you.</p></div></section>
    <section class="dk-pnl rv-moves"><div class="dk-pnl-h">${ICO2.people}<h2>What moved it this autumn</h2></div>${repMovesHtml()}</section>
    <section class="dk-pnl rv-worth"><div class="dk-pnl-h">${ICO2.bars}<h2>What it is worth</h2></div>${repWorthHtml()}</section></div>`;
  screen().innerHTML = shell(deskPage({ title:'Your star rating is public', sub:"Since September, how you treated passengers has been noted. From today it counts.", cls:'rv-page', body }),
    deskBar('Stars change with the choices you make when things go wrong.', `<button class="btn primary big" id="nx">${T2().on ? 'Next: what sort of airline?' : 'Next'} &#9654;</button>`));
  on('nx', () => { UI.justDone = null; next(); });
};
/* the three types, side by side */
function typeCardHtml(t, picked, eg){
  const r = eg, fares = r ? typeFaresFor(r, t) : [], base = r ? r._fares0 : [], extra = fares.filter(f => !base.includes(f)), rate = starRate(t);
  const pts = t === 'premium' ? [`Two higher fares on every route${r && extra.length ? `: ${r.city} adds ${extra.map(money).join(' and ')}` : ''}.`, `Stars move 1½ times as fast: good choices count more, and so do bad ones.`]
    : t === 'value' ? [`One lower fare on every route${r && extra.length ? `: ${r.city} adds ${extra.map(money).join(', ')}` : ''}.`, `A ${money(T2().fee)} bag fee: about ${Math.round(T2().take * 10)} in 10 passengers pay it.`, 'Stars move more slowly (¾ as fast).']
    : ['Your fares stay as they are.', 'Stars move at the usual rate.'];
  return `<button class="ty-c ${picked ? 'on' : ''}" data-atype="${t}" aria-pressed="${picked}"><span class="ty-h"><b>${ATYPE[t].name}</b><small>${esc(ATYPE[t].line)}</small></span><ul>${pts.map(p => `<li>${esc(p)}</li>`).join('')}</ul><span class="ty-pick">${picked ? 'Chosen ✓' : 'Choose'}</span></button>`;
}
function typePageBody(pick, intro){
  const r = routeById('nyc') || WORLD.routes.find(x => x.wb), grid = `<div class="ty-g">${['premium', 'full', 'value'].map(t => typeCardHtml(t, pick === t, r)).join('')}</div>`;
  return `${intro}${grid}<p class="ty-note">${esc(`The type changes your fare menu, how fast your stars move, and the bag fee. These are the type's rules for good (D77).`)}</p>`;
}
R.atype = st => {
  const pick = airlineType(), d = typeConfirmDay();
  const intro = `<p class="ty-lead">Passengers ask what sort of airline you are. Choose today; you can change your mind on ${d ? esc(dateLong(d)) : 'Thursday'}, when it is confirmed.</p>`;
  screen().innerHTML = shell(deskPage({ title:'What sort of airline are you?', sub:'Premium, Full Service or Value.', cls:'ty-page', body:typePageBody(pick, intro) }),
    deskBar(pick ? `${ATYPE[pick].name}: ${esc(ATYPE[pick].line)}` : 'Choose one of the three.', `${backBtn()}<button class="btn primary big" id="nx" ${pick ? '' : 'disabled'}>${pick ? 'Next: the aircraft' : 'Choose a type first'} &#9654;</button>`));
  screen().querySelectorAll('[data-atype]').forEach(b => b.onclick = () => { setAirlineType(b.getAttribute('data-atype'), false); render(); });
  on('nx', () => { if(!airlineType()) return; UI.justDone = null; next(); });
};
R.atypeOk = st => {
  const pick = st.pick || airlineType() || 'full', since = S.atype && S.atype.day, bags = Object.entries(S.bagDays || {}).filter(([d]) => since && +d >= since).reduce((t, [, v]) => t + v, 0);
  const was = airlineType(), intro = `<p class="ty-lead">${was ? `You chose <b>${esc(ATYPE[was].name)}</b> on ${esc(dateShort(since))}.` : 'You have not chosen yet.'} Confirm it, or change it now: it then stays until the August review.${was === 'value' && bags ? ` Bags have brought in ${money(bags)} so far.` : ''}</p>`;
  screen().innerHTML = shell(deskPage({ title:'Thursday: what sort of airline?', sub:'Passengers want to know what sort of airline you are.', cls:'ty-page', body:typePageBody(pick, intro) }),
    deskBar(pick !== was ? `Changing to ${ATYPE[pick].name}. New fares are set on Monday's plan.` : `Confirm: ${ATYPE[pick].name}.`, `<button class="btn primary big" id="nx">Confirm: ${esc(ATYPE[pick].name)} &#9654;</button>`));
  screen().querySelectorAll('[data-atype]').forEach(b => b.onclick = () => { st.pick = b.getAttribute('data-atype'); render(); });
  on('nx', () => { setAirlineType(pick, true); addNews([{ tag:'NEWS', text:`${S.airline && S.airline.name || 'The airline'} is a ${ATYPE[pick].name} airline.` }]); UI.justDone = null; next(); });
};

/* ==================================================================
   Sign-offs: the long-haul ticket sum (estimated first), the long-haul fuel line, the bag fee
   ================================================================== */
SO_REL.bagFee = { name:'Bag fee', rel:'tenths of passengers × fee', skill:'bagFee' };
if(typeof REC_REL !== 'undefined') REC_REL.bagFee = 'tenths of passengers';
const ch2so = () => S.ch2so || (S.ch2so = {});
const lhRoute = id => { const r = routeById(id); return !!r && typeof isLongHaul === 'function' && isLongHaul(r); };
const lhPlane = pid => { const p = planeById(pid); return !!p && p.range > (typeof LH === 'function' ? LH().from : 4000); };
/* the bag fee's passengers: the long-haul route flown (a full 757: 200), else the busiest */
function bagLine(pl){ const L = planLines(pl || currentPlan()), rs = (L.routes || []).filter(x => x.pax > 0); if(!rs.length) return null;
  const x = rs.filter(z => lhRoute(z.id)).sort((a, b) => b.pax - a.pax)[0] || rs.slice().sort((a, b) => b.pax - a.pax)[0];
  const exact = x.pax * T2().take; return { route:x.id, pax:x.pax, exact, bags:bagsFor(x.pax), fee:T2().fee }; }
const soWorkCandsT0 = soWorkCands;
soWorkCands = function(H, L, pl){
  const out = soWorkCandsT0(H, L, pl); if(!ch2Now()) return out; const o = ch2so();
  if(!o.tk){ const c = out.filter(x => x.rel === 'tickets' && lhRoute(x.route)).sort((a, b) => (b.money || 0) - (a.money || 0))[0]; if(c) Object.assign(c, { forced:true, lhEst:true }); }
  if(!o.fuel){ const c = out.filter(x => x.rel === 'fuel' && lhRoute(x.route)).sort((a, b) => (b.money || 0) - (a.money || 0))[0]; if(c) Object.assign(c, { forced:true, lhFuel:true }); }
  if(airlineType() === 'value' && !((skills().bagFee || {}).count > 0) && !(S.tools && S.tools.bagFee)){ const b = bagLine(pl); if(b) out.push({ key:'bag|' + b.route, rel:'bagFee', inst:false, carryable:true, route:b.route, money:b.bags * b.fee, label:`Bag fee: ${routeById(b.route).city}` }); }
  return out;
};
const SO_FLAGS = ['lhEst', 'lhFuel'];
const soDecideListT0 = soDecideList;
soDecideList = function(cands, point, commit){
  if(!ch2Now()) return soDecideListT0(cands, point, commit);
  // a full long-haul plane (seats × fare) is the same sum as the long-haul ticket sum: Build, not a Calculate slot
  const o = soS(), sf = cands.some(c => c.rel === 'seatsFare' && lhPlane(c.plane)), keep = o.rel.seatsFare;
  if(sf) o.rel.seatsFare = Math.max(keep || 0, soDecay());
  let out; try{ out = soDecideListT0(cands, point, commit); } finally { if(sf){ if(keep === undefined) delete o.rel.seatsFare; else o.rel.seatsFare = keep; } }
  out.forEach(it => { const c = cands.find(x => x.key === it.key); if(c) SO_FLAGS.forEach(k => { if(c[k] && it[k] === undefined) it[k] = true; }); });
  return out;
};
/* the long-haul ticket sum is a card on the Sign-offs page (estimate, then the sum), not a line on the sheet */
const decideHandSumsT0 = decideHandSums;
decideHandSums = function(L, pl){
  const H = decideHandSumsT0(L, pl); if(!soOn() || !ch2Now() || !H || !H.revenue) return H;
  const W = soWeek(false), est = Object.values(W.items).filter(it => it.lhEst && it.level === 'calc').map(it => it.route);
  if(est.length){ const r = H.revenue.routes.filter(id => !est.includes(id)); if(r.length) H.revenue = Object.assign({}, H.revenue, { routes:r }); else delete H.revenue; }
  return H;
};
const soStageItemsT0 = soStageItems;
soStageItems = function(){
  const base = soStageItemsT0(); if(!soOn() || !ch2Now()) return base;
  const W = soWeek(false), more = W.order.map(k => W.items[k]).filter(it => it.point === 'workings' && it.level === 'calc' && (it.lhEst || it.rel === 'bagFee') && !base.includes(it));
  return more.concat(base);
};
const soSpecT0 = soSpec;
soSpec = function(it){
  if(it && it.rel === 'bagFee'){ const b = bagLine() || { route:it.route, pax:0, exact:0, bags:0, fee:T2().fee }, r = routeById(b.route);
    const sp = { title:`Bag fee — ${r.city}`, ask:`A Value airline: about ${Math.round(T2().take * 10)} in 10 passengers pay a ${money(b.fee)} bag fee. The bag money on a day of ${r.city} flights.`, op:'×', a:{ k:'bags', label:'Bags', v:b.bags, f:'n' }, b:{ k:'fee', label:'Bag fee', v:b.fee, f:'£' }, res:'£', dis:[],
      opHint:'Every bag pays the fee.', log:`Bag fee (${r.city})`, pre:{ lab:`${Math.round(T2().take * 10)} tenths of ${num(b.pax)} passengers`, want:b.exact, alt:b.bags, unit:'bags',
        hint:`One tenth of ${num(b.pax)} is ${num(b.pax)} ÷ 10 = ${num(b.pax / 10)}; ${Math.round(T2().take * 10)} tenths is ${Math.round(T2().take * 10)} × ${num(b.pax / 10)}.` } };
    Object.defineProperty(sp, 'it', { value:it, enumerable:false, configurable:true }); return sp; }
  const sp = soSpecT0(it); if(!sp || !it || !it.lhEst) return sp;
  const sig = v => { if(!v) return 0; const p = Math.pow(10, Math.floor(Math.log10(Math.abs(v)))); return Math.round(v / p) * p; }, ea = sig(sp.a.v), eb = sig(sp.b.v);
  sp.ask = `The ticket money from ${routeById(it.route).city} on a day of this plan. Estimate first, then work it out.`;
  sp.pre = { lab:`${num(ea)} × ${money(eb)}`, a:ea, b:eb, want:ea * eb, unit:'£', est:true, round:`${num(sp.a.v)} is about ${num(ea)} and ${money(sp.b.v)} is about ${money(eb)}`,
    hint:`${num(ea)} × ${num(eb)}: multiply the first digits, then put back the noughts (${String(ea).replace(/^\d/, '').length + String(eb).replace(/^\d/, '').length} of them).` };
  return sp;
};
/* the card: the first step (the estimate, or the tenths), then the sum */
function soPreState(cs){ return cs.pre || (cs.pre = { v:'', ok:false, q:false, msg:'', lines:[] }); }
const soCardHtmlT0 = soCardHtml;
soCardHtml = function(it, st, n){
  const sp = it && it.level === 'calc' && (it.lhEst || it.rel === 'bagFee') ? soSpec(it) : null; if(!sp || !sp.pre) return soCardHtmlT0(it, st, n);
  soCardHtmlT0(it, st, n);   // the record's "first seen"
  const cs = soCardState(st, it.key), P = soPreState(cs), done = it.done || cs.ok, id = esc(it.key), pre = sp.pre, ans = soAns(sp), resTxt = soFmt(sp.res, ans);
  if(done && !P.ok){ P.ok = true; }
  const stamp = done ? cardStampHtml('ok') : (cs.q || P.q) ? cardStampHtml('q') : '';
  const head = `<div class="sc-h"><span class="sc-n">${n}</span><div><h2>${esc(sp.title)}</h2><p>${esc(sp.ask)}</p></div><span class="so-lv calc">Calculate</span>${stamp}</div>`;
  const preTxt = pre.unit === '£' ? money(pre.want) : `${num(pre.want)}${pre.want !== pre.alt ? ` (about ${num(pre.alt)})` : ''} ${pre.unit}`;
  const step1 = `<div class="so-pre ${P.ok ? 'ok' : ''}"><span class="sc-sn">${pre.est ? 'Estimate' : 'Step 1'}</span>${pre.est ? `<p class="sc-note">Round each number: ${esc(pre.round)}.</p>` : ''}
    ${P.ok ? `<p class="acq-ans"><b>${esc(pre.lab)} = ${esc(preTxt)}</b> ✓</p>` : `<div class="acq-in"><span class="mono">${esc(pre.lab)} =</span><span class="sc-in ${P.q ? 'qy' : ''}">${pre.unit === '£' ? '<i class="pre">£</i>' : ''}<input data-sopre="${id}" inputmode="decimal" autocomplete="off" value="${esc(P.v || '')}" aria-label="${pre.est ? 'Estimate' : 'Step 1'}">${pre.unit === 'bags' ? '<i class="suf">bags</i>' : ''}</span><button class="btn primary" data-soprechk="${id}">Check ✓</button><span class="sc-msg" role="status">${esc(P.msg || '')}</span></div>`}</div>`;
  const step2 = !P.ok ? `<div class="so-pre later"><span class="sc-sn">${pre.est ? 'Then work it out' : 'Step 2'}</span><p class="sc-note">After the ${pre.est ? 'estimate' : 'step above'}.</p></div>`
    : `<div class="so-pre"><span class="sc-sn">${pre.est ? 'Now work it out' : 'Step 2'}</span><p class="sc-note">${esc(pre.est ? soMethod(sp) : `${num(sp.a.v)} bags, each paying ${money(sp.b.v)}.`)}</p>
      ${done ? `<p class="acq-ans"><b>${soFmt(sp.a.f, sp.a.v)} ${sp.op} ${soFmt(sp.b.f, sp.b.v)} = ${resTxt}</b> ✓${pre.est ? ` <span class="muted">close to your estimate of ${money(pre.want)}</span>` : ''}</p>` : `<div class="acq-in"><span class="mono">${soFmt(sp.a.f, sp.a.v)} ${sp.op} ${soFmt(sp.b.f, sp.b.v)} =</span><span class="sc-in ${cs.q ? 'qy' : ''}"><i class="pre">£</i><input data-soin="${id}" inputmode="decimal" autocomplete="off" value="${esc(cs.v || '')}" aria-label="${esc(sp.title)}"></span><button class="btn primary" data-sochk="${id}">Check ✓</button><span class="sc-msg" role="status">${esc(cs.msg || '')}</span></div>`}</div>`;
  return `<section class="dk-pnl so-card acq-rb so-two ${done ? 'ok' : ''}" data-socard="${id}">${head}${step1}${step2}</section>`;
};
/* the first step's check; its tries go into the record with the sum's working */
const soBindCardsT0 = soBindCards;
soBindCards = function(items, st){
  soBindCardsT0(items, st); const root = screen();
  root.querySelectorAll('[data-sopre]').forEach(i => { i.oninput = () => { soPreState(soCardState(st, i.getAttribute('data-sopre'))).v = i.value; }; i.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); const c = root.querySelector(`[data-soprechk="${i.getAttribute('data-sopre')}"]`); if(c) c.click(); } }; });
  root.querySelectorAll('[data-soprechk]').forEach(b => b.onclick = () => { const key = b.getAttribute('data-soprechk'), it = items.find(x => x.key === key), sp = it && soSpec(it), cs = soCardState(st, key), P = soPreState(cs); if(!sp || !sp.pre) return;
    const v = soParse(P.v, 'n'); if(v === null){ P.msg = sp.pre.est ? 'Type your estimate in pounds.' : 'Type the number of bags.'; render(); return; }
    const ok = Math.abs(v - sp.pre.want) < 0.005 || (sp.pre.alt !== undefined && Math.abs(v - sp.pre.alt) < 0.005);
    P.lines.push({ lab:`${sp.pre.est ? 'Estimate: ' : ''}${sp.pre.lab}`, typed:String(P.v).trim(), want:sp.pre.unit === '£' ? money(sp.pre.want) : num(sp.pre.want), wantV:sp.pre.want, unit:'n', ok, est:true });
    if(ok){ P.ok = true; P.q = false; P.msg = ''; }
    else { P.q = true; P.msg = `Query: ${v > sp.pre.want ? 'too much' : 'too little'}. ${sp.pre.hint}`; }
    save(); render(); const nx = screen().querySelector(`[data-soin="${key}"]`); if(ok && nx) setTimeout(() => { try{ nx.focus(); }catch(e){} }, 40); });
  const fp = root.querySelector('[data-sopre]'); if(fp) setTimeout(() => { try{ fp.focus(); }catch(e){} }, 50);
};
/* the record: the first step's tries are the working of the sum's attempt */
let SO_PRE_WORK = null;
const soCalcCheckT0 = soCalcCheck;
soCalcCheck = function(sp, cs){ SO_PRE_WORK = sp && sp.pre && cs.pre && cs.pre.lines && cs.pre.lines.length && sp.it ? { key:'so:' + sp.it.key, lines:cs.pre.lines.slice() } : null; try{ return soCalcCheckT0(sp, cs); } finally { SO_PRE_WORK = null; } };
if(typeof recAttempt === 'function'){ const recAttemptT0 = recAttempt;
  recAttempt = function(e, a){ if(SO_PRE_WORK && e && e.key === SO_PRE_WORK.key && !a.working){ if(!a.ok && !a.note) a.note = recNote(e, a); a.working = SO_PRE_WORK.lines.map(x => Object.assign({}, x, { total:false })); if(/^Estimate/.test(a.working[0].lab)) e.method = 'estimate first, then partition or formal multiplication'; else e.method = 'tenths of the passengers, then × the fee'; } return recAttemptT0(e, a); }; }
/* finishing: the bag fee is the model from now on; the long-haul ticket sum is done */
const soFinishT0 = soFinish;
soFinish = function(it, sp){
  if(it.rel === 'bagFee'){ soTouch('bagFee', { route:it.route, count:true }); soLog(`${sp.log} (Calculate)`); soDone(it); return; }
  soFinishT0(it, sp); if(it.lhEst) ch2so().tk = S.day;
};
const soSyncT0 = soSync;
soSync = function(){ soSyncT0(); if(!S || !S.so || !S.so.weeks || !ch2Now()) return; const o = ch2so();
  if(!o.fuel) Object.values(S.so.weeks).forEach(W => Object.values(W.items).forEach(it => { if(it.lhFuel && it.done) o.fuel = it.doneDay || S.day; }));
  if(!o.tk) Object.values(S.so.weeks).forEach(W => Object.values(W.items).forEach(it => { if(it.lhEst && it.done) o.tk = it.doneDay || S.day; })); };
/* for the tests: the first step's answer too */
const soPlanT0 = soPlan;
soPlan = function(){ const P = soPlanT0(); if(!P || !P.key) return P; const it = soItem(P.key); if(!it || it.level !== 'calc' || !(it.lhEst || it.rel === 'bagFee')) return P; const sp = soSpec(it); return Object.assign(P, { pre:sp && sp.pre ? String(sp.pre.alt !== undefined ? sp.pre.alt : sp.pre.want) : null }); };

/* ---------- for the tests and the report ---------- */
function typeReport(){ const r = routeById('nyc'); return { type:airlineType(), confirmed:!!(S.atype && S.atype.confirmed), rep:S.rep, repExact:S.repExact, factor:repFactor(), fares:r ? r.fares.slice() : [], base:r ? r._fares0.slice() : [], ch2so:S.ch2so || null }; }
