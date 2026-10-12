
/* ==================================================================
   Fewer, better hand sums (Workbook v4.9; HandSumRules 9–11; Settings signOffCapPerWeek, signOffDecayAfter, auditFloor,
   boardNudgeIdleWeeks, boardNudgeMissedShare, boardReviewSignOffs; Fable's brief "the cap, the decay and the floor", D63–D64).

   Part A, the cap and the decay. From day 8 a week asks at most signOffCapPerWeek Calculate sign-offs (teacher dial 1–3).
   The most instructive go first: a relationship never met, then a changed input (a fuel price jump), then the most money in
   it, one of each relationship before a second of any. Over the cap, a relationship the pupil has met becomes Build (tap the
   figures and the operation; the game calculates), as in rule 9's week-3 example; one never met waits for the next week it
   is relevant (the model fills it today). The decay: from week 2 a relationship is Calculate twice; a new instance after
   that is Build; with nothing new the model does it. Launch Day and week 1 teach each relationship: they sit outside the cap
   and the count. The teacher can hold a relationship at Calculate; a fuel price jump is Calculate whatever the count.
   ================================================================== */
const SO_REL = {
  tickets:{ name:'Ticket revenue', rel:'passengers × fare', skill:'revenue', tool:'revenue' },
  fuel:{ name:'Fuel for a service', rel:'litres × price a litre', skill:'fuelCost', tool:'fuelCost' },
  flightTime:{ name:'Flight time', rel:'distance ÷ speed', skill:'flightTime', tool:'flightTime' },
  rentOrBuy:{ name:'Rent or buy', rel:'price ÷ rent a day', skill:'rentOrBuy', tool:'rentOrBuy' },
  seatsFare:{ name:'A full plane', rel:'seats × fare', skill:'seatsFare', tool:'seatsFare' },
  fuelOrder:{ name:'The first fuel order', rel:'blocks × the cost of a block', skill:'fuelOrder' },
  audit:{ name:'Finance audit', rel:'a line re-checked', skill:null }
};
const SO_HOLDABLE = ['tickets', 'fuel', 'flightTime', 'rentOrBuy', 'seatsFare'];
const soFrom = () => WBS().fuelDeskFromDay || 8;
function soOn(){ return !!S && typeof weekMode === 'function' && weekMode() && S.phase !== 'setup' && (S.day || 1) >= soFrom(); }
function soS(){ const o = S.so || (S.so = {}); o.weeks = o.weeks || {}; o.rel = o.rel || {}; o.hold = o.hold || {}; return o; }
function soCap(){ const t = soS().cap; return clamp(Math.round(t !== undefined && t !== null ? t : (WBS().signOffCapPerWeek || 3)), 1, 3); }
const soDecay = () => WBS().signOffDecayAfter || 2;
const soWkNo = () => weekNo(S.day || 1);
function soWeek(make){ const o = soS(), w = soWkNo(); if(o.weeks[w]) return o.weeks[w]; const W = { wk:w, from:(w - 1) * 7 + 1, items:{}, order:[] }; if(make) o.weeks[w] = W; return W; }
const soRelName = rel => (SO_REL[rel] && SO_REL[rel].name) || (TOOL[rel] && TOOL[rel].name) || rel;
const soSkill = rel => SO_REL[rel] ? SO_REL[rel].skill : rel;
/* "never met": no Calculate of it anywhere yet, Launch Day included */
function soMet(rel){ const id = soSkill(rel), x = id && skills()[id]; return !!(x && x.count > 0); }
function soHeld(rel){ return !!soS().hold[rel]; }
function soTeacherSet(rel){ const t = SO_REL[rel] && SO_REL[rel].tool; return !!(t && S.tools && S.tools[t]); }   // the Maths tools setting overrides every rule (D34)

/* the Calculate sign-offs this week that count against the cap: done, or still waiting at this point */
function soUsed(W, point){ return Object.values(W.items).filter(it => it.level === 'calc' && (it.done || it.point === point)).length; }
/* the first fuel purchase keeps its slot: it is asked on the fuel desk after the sums */
function soReserved(W, point){ return point !== 'fuelDesk' && point !== 'audit' && typeof deskModeAt === 'function' && deskModeAt(S.day) && !S.fuelBuySigned && !W.items.fo ? 1 : 0; }
/* a candidate: { key, rel, label, money, inst (a new instance: route, plane, plane on a route), carryable, forced, route?, plane?, card? } */
function soDecideList(cands, point, commit){
  soSync();
  const o = soS(), W = soWeek(commit), out = [], fresh = [];
  cands.forEach(c => { const it = W.items[c.key]; if(it) out.push(it); else fresh.push(Object.assign({}, c)); });
  if(!fresh.length) return out;
  const askedRel = new Set(Object.values(W.items).filter(it => it.level === 'calc').map(it => it.rel));
  fresh.sort((a, b) => (b.money || 0) - (a.money || 0));
  const firstNew = {}; fresh.forEach(c => { if(c.forced) c.cls = 'changed'; else if(!soMet(c.rel) && !askedRel.has(c.rel) && !firstNew[c.rel]){ c.cls = 'new'; firstNew[c.rel] = true; } else c.cls = 'repeat'; });
  const RK = { new:0, changed:1, repeat:2 }; fresh.sort((a, b) => RK[a.cls] - RK[b.cls] || (b.money || 0) - (a.money || 0));
  const run = {}; Object.values(W.items).forEach(it => { if(it.level === 'calc' && !it.done && !it.noDecay) run[it.rel] = (run[it.rel] || 0) + 1; });
  const count = rel => (o.rel[rel] || 0) + (run[rel] || 0), calcOk = c => c.forced || c.noDecay || soHeld(c.rel) || count(c.rel) < soDecay();
  let budget = Math.max(0, soCap() - soUsed(W, point) - soReserved(W, point));
  const pick = c => { c.level = 'calc'; c.why = 'asked'; budget--; run[c.rel] = (run[c.rel] || 0) + 1; askedRel.add(c.rel); };
  fresh.forEach(c => { if(budget > 0 && calcOk(c) && !askedRel.has(c.rel)) pick(c); });   // one of each relationship first
  fresh.forEach(c => { if(budget > 0 && !c.level && calcOk(c)) pick(c); });
  fresh.forEach(c => { if(c.level) return;
    if(!calcOk(c)){ c.level = c.inst ? 'build' : 'model'; c.why = 'decay'; return; }
    if(soMet(c.rel) || askedRel.has(c.rel)){ c.level = c.inst ? 'build' : 'model'; c.why = 'cap'; return; }
    c.level = 'model'; c.why = 'cap'; c.carry = !!c.carryable; });
  fresh.forEach(c => {
    const it = { key:c.key, rel:c.rel, label:c.label, cls:c.cls, money:Math.round(c.money || 0), level:c.level, why:c.why, point, day:S.day, wk:W.wk, done:false };
    ['route', 'plane', 'card', 'forced', 'noDecay', 'carry', 'inst', 'pair', 'price'].forEach(k => { if(c[k] !== undefined) it[k] = c[k]; });
    if(it.level === 'calc'){ const id = soSkill(it.rel), x = id && skills()[id]; it.countAt = x ? x.count || 0 : 0; }
    if(commit){ const prev = Object.values(o.weeks).find(V => V.wk < W.wk && V.items[it.key] && V.items[it.key].carry); if(prev) it.carriedFrom = prev.wk;
      W.items[it.key] = it; W.order.push(it.key); if(it.level === 'model' && !it.carry && c.onModel) c.onModel(); }
    out.push(it); });
  return out;
}
/* a Calculate is done when its skill's count has gone up since it was asked (the desks' own records); Build and audit cards say so themselves */
function soSync(){
  const o = S.so; if(!o || !o.weeks) return;
  Object.values(o.weeks).forEach(W => Object.values(W.items).forEach(it => {
    if(it.done || it.level !== 'calc' || it.rel === 'audit') return;
    const id = soSkill(it.rel), x = id && skills()[id];
    if(it.rel === 'fuelOrder' ? !!S.fuelBuySigned : (x && (x.count || 0) > (it.countAt || 0))) soDone(it);
  }));
}
function soDone(it){ if(it.done) return; it.done = true; it.doneDay = S.day; if(it.level === 'calc' && !it.noDecay){ const o = soS(); o.rel[it.rel] = (o.rel[it.rel] || 0) + 1; } }
function soItem(key){ const W = soWeek(false); return W.items[key] || null; }
function soLog(text){ const log = S.handSumLog || (S.handSumLog = []), e = log.find(z => z.day === S.day) || (log.push({ day:S.day, date:dateShort(S.day), tools:[] }), log[log.length - 1]); e.tools.push(text); }
function soTouch(id, extra){ const sk = skills(), x = sk[id] || (sk[id] = { first:S.day, count:0, routes:[], planes:[] }); x.routes = x.routes || []; x.planes = x.planes || []; if(extra && extra.count) x.count++; x.lastDay = S.day;
  if(extra && extra.route && !x.routes.includes(extra.route)) x.routes.push(extra.route); if(extra && extra.plane && !x.planes.includes(extra.plane)) x.planes.push(extra.plane); return x; }

/* the ƒ inspector opens on the week planner too ("fill the rest with the model and the ƒ inspector"): it used to give way to the sum dock */
function dockHtml(o){ if(o && o.sum && UI.dock && UI.dock.mode === 'fx' && UI.dock.fx) return dockHtmlBase(o); return dockHtmlPlanner(o); }

/* ---------- the Monday sums: tickets, flight time, fuel and the rest go through the cap together ---------- */
function soFuelCands(pl){
  pl = normPlan(pl); const signed = S.fuelSigned || {}, price = cardPrice(), seen = {}, out = [];
  pl.fleet.forEach(x => x.sched.forEach((rid, k) => { const key = cardKey(x.planeId, rid); if(seen[key]){ seen[key].n++; return; } seen[key] = { uid:x.uid, k, planeId:x.planeId, route:rid, key, n:1, price }; }));
  const litres = c => c.n * fuelForTrip(planeById(c.planeId), routeById(c.route)), cards = Object.values(seen);
  cards.filter(c => signed[c.key] === undefined).forEach(c => out.push({ key:'fc|' + c.key, rel:'fuel', inst:true, carryable:true, card:c, pair:c.key, route:c.route, plane:c.planeId, price, money:litres(c) * price, label:`Fuel: ${shortPlane(planeById(c.planeId))} ${routeById(c.route).city}` }));
  // rule 2: fuel by hand again when the price has moved fuelHandSumPriceStep from the last fuel line worked by hand
  const fs = skills().fuelCost, ref = fs && fs.last ? fs.last.price : null;
  if(ref !== null && ref !== undefined && Math.abs(price - ref) >= (WBS().fuelHandSumPriceStep || 0.5) - 1e-9){
    if(out.length){ out[0].forced = true; out[0].was = ref; }   // a new card this week is worked at the new price
    else { const c = cards.filter(z => signed[z.key] !== undefined).sort((a, b) => litres(b) - litres(a))[0];
      if(c) out.push({ key:'fj|' + c.key + '|' + price, rel:'fuel', forced:true, card:Object.assign({}, c, { was:signed[c.key] }), pair:c.key, route:c.route, plane:c.planeId, price, money:litres(c) * price, label:`Fuel at ${priceL(price)}: ${shortPlane(planeById(c.planeId))} ${routeById(c.route).city}`, carryable:false }); }
  }
  return out;
}
function soWorkCands(H, L, pl){
  const sk = skills(), out = [];
  if(H.revenue && !soTeacherSet('tickets')) H.revenue.routes.forEach(rid => { const x = (L.routes || []).find(z => z.id === rid) || { tk:0 }; out.push({ key:'tk|' + rid, rel:'tickets', inst:true, carryable:true, route:rid, money:x.tk, label:`Tickets: ${routeById(rid).city}` }); });
  if(!soTeacherSet('flightTime')){ const ft = sk.flightTime || { routes:[] }; (L.routes || []).map(x => x.id).filter(id => !(ft.routes || []).includes(id) && (routeById(id).openDay || 1) > 1).forEach(rid => out.push({ key:'ft|' + rid, rel:'flightTime', inst:true, carryable:true, route:rid, money:0, label:`Flight time: ${routeById(rid).city}` })); }
  if(!soTeacherSet('fuel') && !(S.tools && S.tools.fuelCost === 'model') && fuelPaid()) soFuelCands(pl).forEach(c => out.push(c));
  Object.keys(H).filter(k => !['revenue', 'flightTime', 'range', 'fuelCost'].includes(k) && H[k] && H[k] !== 'model' && !(S.tools && S.tools[k])).forEach(k => out.push({ key:'x|' + k, rel:k, inst:false, carryable:true, money:0, label:soRelName(k) }));
  return out;
}
function decideHandSums(L, pl){
  const H = decideHandSumsDesk(L, pl); if(!soOn()) return H;
  pl = normPlan(pl || currentPlan()); const commit = step().t === 'workings';
  const items = soDecideList(soWorkCands(H, L, pl), 'workings', commit), lv = key => { const it = items.find(z => z.key === key); return it ? it.level : null; };
  if(H.revenue && !soTeacherSet('tickets')){ const r = H.revenue.routes.filter(rid => lv('tk|' + rid) === 'calc'); if(r.length) H.revenue = { level:'calc', routes:r }; else delete H.revenue; }
  if(!soTeacherSet('flightTime')) delete H.flightTime; delete H.range;   // flight time is a sign-off card; the range check is the model's (not a WorkingMethods relationship)
  Object.keys(H).forEach(k => { if(['revenue', 'flightTime', 'range', 'fuelCost'].includes(k) || (S.tools && S.tools[k])) return; if(lv('x|' + k) && lv('x|' + k) !== 'calc') delete H[k]; });
  S.rnd.fuelCards = items.filter(it => it.rel === 'fuel' && it.level === 'calc' && !it.done).map(it => Object.assign({}, it.card, { price:it.price }));
  return H;
}
/* the comparison path's rent-or-buy (week 2): through the cap at the acquire screen */
function soAcquireItem(pid){
  if(!acRbDueBase(pid) || soTeacherSet('rentOrBuy')) return null; const p = planeById(pid), o = acOffer(pid); if(!(o.lease && o.price)) return null;
  return soDecideList([{ key:'rb|' + pid, rel:'rentOrBuy', inst:true, carryable:false, plane:pid, money:o.price, label:`Rent or buy: ${p.name}`, onModel:() => soTouch('rentOrBuy', { plane:pid }) }], 'acquire', step().t === 'acquire')[0];
}
function acRbDue(pid){ if(!soOn()) return acRbDueBase(pid); const it = soAcquireItem(pid); return !!it && it.level === 'calc' && !it.done; }
/* the first fuel order keeps its reserved slot and is logged against the week */
const fuelDeskSo0 = R.fuelDesk;
R.fuelDesk = st => { if(soOn() && !S.fuelBuySigned){ const W = soWeek(true); if(!W.items.fo){ W.items.fo = { key:'fo', rel:'fuelOrder', label:'The first fuel order', cls:soMet('fuelOrder') ? 'repeat' : 'new', money:0, level:'calc', why:'asked', point:'fuelDesk', day:S.day, wk:W.wk, done:false, countAt:(skills().fuelOrder || {}).count || 0 }; W.order.push('fo'); } } soSync(); return fuelDeskSo0(st); };

/* ==================================================================
   Part B: the sign-off cards. Build: tap the two figures and the operation, the game calculates (D58, rule 10). Calculate:
   type the answer to a one-line sum; Query or Checked, as the fuel desk and the rent-or-buy box. The Monday's Build cards and
   flight-time sums are a "Sign-offs" page before the sheet; the showroom's sums and the month-end audit use the same cards.
   ================================================================== */
const soFmt = (f, v) => f === '£' ? money(v) : f === '£2' ? twoDp(v) : f === 'ppl' ? priceL(v) : f === 'L' ? `${num(v)} L` : f === 'km' ? `${num(v)} km` : f === 'kmh' ? `${num(v)} km/h` : f === 'h' ? `${num(Math.round(v * 100) / 100)} hours` : f === 'days' ? `${num(Math.round(v * 10) / 10)} days` : num(v);
function soSpec(it){
  const pl = normPlan(currentPlan());
  if(it.rel === 'tickets'){ const r = routeById(it.route), L = planLines(pl), x = L.routes.find(z => z.id === it.route) || { pax:0, fare:fareOf(it.route) }, seats = L.services.filter(s => s.route === it.route).reduce((t, s) => t + s.seats, 0);
    return { title:`Sales forecast — ${r.city}`, ask:`The ticket money from ${r.city} on a day of this plan.`, op:'×', a:{ k:'pax', label:'Passengers', v:x.pax, f:'n' }, b:{ k:'fare', label:'Fare', v:x.fare, f:'£' }, res:'£',
      dis:[{ k:'seats', label:'Seats', v:seats, f:'n', hint:'Ticket money comes from the passengers who fly, not the seats.' }, { k:'km', label:'Distance', v:routeKm(r), f:'km', hint:'The distance is for the flight time and the fuel, not the ticket money.' }],
      opHint:'Every passenger pays the fare: which operation repeats the fare for each passenger?', log:`Ticket revenue (${r.city})` }; }
  if(it.rel === 'fuel'){ const c = it.card, p = planeById(c.planeId), r = routeById(c.route), L1 = fuelForTrip(p, r);
    return { title:`Service costs — ${shortPlane(p)} ${homeData().code}–${tlCode(r)}`, ask:`The fuel for one service at ${priceL(it.price)} a litre.`, op:'×', a:{ k:'L', label:'Litres', v:L1, f:'L' }, b:{ k:'ppl', label:'Price a litre', v:it.price, f:'ppl' }, res:'£2',
      dis:[{ k:'km', label:'Distance', v:routeKm(r) * 2, f:'km', hint:'The litres already allow for the distance: the fuel bill is the litres × the price of one litre.' }, { k:'seats', label:'Seats', v:p.seats, f:'n', hint:'The seats do not set the fuel bill: use the litres the service burns.' }],
      opHint:'The price is for one litre: which operation finds the cost of all the litres?', log:`Fuel cost: ${shortPlane(p)} ${r.city}` }; }
  if(it.rel === 'flightTime'){ const r = routeById(it.route), p = flightTimePlane(pl, it.route), km = routeKm(r);
    return { title:`Flight time — ${r.city}`, ask:`How long does the ${shortPlane(p)} take to fly ${num(km)} km at ${num(p.speed)} km/h?`, op:'÷', a:{ k:'km', label:'Distance', v:km, f:'km' }, b:{ k:'speed', label:'Speed', v:p.speed, f:'kmh' }, res:'h', tol:0.05,
      dis:[{ k:'seats', label:'Seats', v:p.seats, f:'n', hint:'Seats do not change the time in the air: use the distance and the speed.' }, { k:'fare', label:'Fare', v:fareOf(it.route), f:'£', hint:'The fare is money: the time comes from the distance and the speed.' }],
      opHint:'The speed is how far the plane flies in one hour: which operation finds how many hours the distance takes?', orderHint:'Start with the distance: how many lots of the speed fit into it?', log:`Flight time (${r.city})` }; }
  if(it.rel === 'rentOrBuy'){ const p = planeById(it.plane), o = typeof acOffer === 'function' && S.rnd.acChoice ? acOffer(it.plane) : shopOffer(p);
    return { title:'When does renting cost more than buying?', ask:`How many days of rent equal the price of the ${shortPlane(p)}?`, op:'÷', a:{ k:'price', label:'Price', v:o.price, f:'£' }, b:{ k:'rent', label:'Rent a day', v:o.lease, f:'£' }, res:'days', tol:0.5,
      dis:[{ k:'seats', label:'Seats', v:p.seats, f:'n', hint:'Seats are not money: compare the price with the rent.' }],
      opHint:'How many lots of the rent make the price? Which operation shares a number into equal groups?', orderHint:'Start with the price: how many days of rent fit into it?', log:`Rent or buy (${p.name})` }; }
  if(it.rel === 'seatsFare'){ const p = planeById(it.plane), fare = it.fare || fareOf(it.route);
    return { title:`A full plane — ${shortPlane(p)}`, ask:`The ticket money if every seat to ${routeById(it.route).city} is sold at ${money(fare)}.`, op:'×', a:{ k:'seats', label:'Seats', v:p.seats, f:'n' }, b:{ k:'fare', label:'Fare', v:fare, f:'£' }, res:'£',
      dis:[{ k:'km', label:'Distance', v:routeKm(routeById(it.route)), f:'km', hint:'The distance does not change the ticket money.' }], opHint:'Every seat brings in the fare: which operation repeats it for every seat?', log:`A full plane (${p.name})` }; }
  if(it.rel === 'audit'){ const r = routeById(it.route);
    return { title:`${it.board ? 'Board review' : 'Finance audit'} — the ${r.city} line`, ask:`${dateShort(it.on)}: ${num(it.pax)} passengers flew to ${r.city} at ${money(it.fare)}. Check the ticket money before the accounts close.`, op:'×', a:{ k:'pax', label:'Passengers', v:it.pax, f:'n' }, b:{ k:'fare', label:'Fare', v:it.fare, f:'£' }, res:'£', dis:[],
      opHint:'Every passenger pays the fare.', log:`${it.board ? 'Board review' : 'Finance audit'}: ${r.city} line` }; }
  return null;
}
const soAns = sp => sp.op === '×' ? sp.a.v * sp.b.v : sp.op === '÷' ? sp.a.v / sp.b.v : sp.op === '+' ? sp.a.v + sp.b.v : sp.a.v - sp.b.v;
/* the method notes from WorkingMethods, worked on this sum's own numbers */
function soMethod(sp){
  const a = sp.a.v, b = sp.b.v;
  if(sp.op === '÷'){ let x = a, y = b, k = 0; while(x % 10 === 0 && y % 10 === 0 && x && y){ x /= 10; y /= 10; k++; }
    return k ? `Make the sum smaller: ${num(a)} ÷ ${num(b)} is the same as ${num(x)} ÷ ${num(y)}. Then short division.` : `Short division: how many ${num(b)}s make ${num(a)}? Write any remainder as a decimal.`; }
  if(sp.b.f === 'ppl'){ const pounds = Math.floor(b), p10 = Math.floor(Math.round((b - pounds) * 100) / 10) * 10, p1 = Math.round(b * 100) - pounds * 100 - p10;
    return `Partition the price: ${priceL(b)} = £${pounds}${p10 ? ` + ${p10}p` : ''}${p1 ? ` + ${p1}p` : ''}. Work out each part for ${num(a)} litres, then add.`; }
  const big = Math.max(a, b), small = Math.min(a, b), round = Math.round(big / 10) * 10, diff = big - round;
  return diff ? `Partition: ${num(small)} × ${num(round)} ${diff > 0 ? '+' : '−'} ${num(small)} × ${num(Math.abs(diff))}, or formal multiplication on the column template.` : `${num(small)} × ${num(big / 10)}, then × 10.`;
}
function soParse(s, f){ s = String(s || '').trim().toLowerCase().replace(/[£,\s]/g, '').replace(/(days?|hours?|hrs?|h)$/, '');
  const hm = /^(\d+):(\d{1,2})$/.exec(s); if(hm && f === 'h') return +hm[1] + (+hm[2]) / 60; const v = parseFloat(s); return isNaN(v) ? null : v; }
/* the card's state lives on the step (a typed answer, the Build bar), the result on the week's record */
function soCardState(st, key){ const B = st.so || (st.so = {}); return B[key] || (B[key] = { tokens:[], v:'', ok:false, q:false, msg:'' }); }
function soCardHtml(it, st, n){
  const sp = soSpec(it); if(!sp) return '';
  const cs = soCardState(st, it.key), done = it.done || cs.ok, stamp = done ? cardStampHtml('ok') : cs.q ? cardStampHtml('q') : '', ans = soAns(sp), id = esc(it.key);
  const lv = it.level === 'build' ? 'Build' : it.level === 'calc' ? 'Calculate' : 'Model';
  const head = `<div class="sc-h"><span class="sc-n">${n}</span><div><h2>${esc(sp.title)}</h2><p>${esc(sp.ask)}</p></div><span class="so-lv ${it.level}">${lv}</span>${stamp}</div>`;
  if(it.level === 'model') return `<section class="dk-pnl so-card model">${head}<p class="so-sum mono">${soFmt(sp.a.f, sp.a.v)} ${sp.op} ${soFmt(sp.b.f, sp.b.v)} = <b>${soFmt(sp.res, ans)}</b> <span class="fx" title="The model worked this out">ƒ</span></p><p class="so-why">${it.why === 'cap' ? "This week's sign-offs are full: the model works this one out." : 'Nothing new here: the model works it out.'}</p></section>`;
  const resTxt = soFmt(sp.res, ans);
  if(it.level === 'build'){
    const figs = [sp.a, sp.b].concat(sp.dis).sort((x, y) => x.k < y.k ? -1 : 1), tok = t => OPS4.includes(t) ? `<i class="rb-op">${t}</i>` : (() => { const f = figs.find(x => x.k === t); return f ? `<span class="rb-tk">${esc(f.label)} <b>${soFmt(f.f, f.v)}</b></span>` : ''; })();
    const bar = `<div class="rb-bar">${cs.tokens.length ? cs.tokens.map(tok).join('') : '<span class="rb-ph">Tap a figure, the operation, then a figure</span>'}<span class="rb-eq">=</span><b class="rb-res" data-sores="${id}">${done ? resTxt : '?'}</b></div>`;
    const ctl = done ? '' : `<div class="rb-chips">${figs.map(f => `<button class="rb-chip" data-sofig="${id}|${f.k}">${esc(f.label)}<b>${soFmt(f.f, f.v)}</b></button>`).join('')}</div>
      <div class="rb-ops">${OPS4.map(o => `<button data-soop="${id}|${o}">${o}</button>`).join('')}<button class="dk-link" data-soundo="${id}">Undo</button><button class="dk-link" data-soclr="${id}">Clear</button><span class="grow"></span><button class="btn primary rb-chk" data-sochk="${id}">Check ✓</button></div>`;
    return `<section class="dk-pnl rb-card so-card ${done ? 'ok' : ''}" data-socard="${id}">${head}${bar}${ctl}<p class="sc-msg rb-msg ${cs.q ? '' : 'ok'}" role="status">${esc(done ? 'Checked: the game worked it out from your build.' : cs.msg || '')}</p></section>`;
  }
  return `<section class="dk-pnl so-card acq-rb ${done ? 'ok' : ''}" data-socard="${id}">${head}<p class="sc-note">${esc(soMethod(sp))}</p>
    ${done ? `<p class="acq-ans"><b>${soFmt(sp.a.f, sp.a.v)} ${sp.op} ${soFmt(sp.b.f, sp.b.v)} = ${resTxt}</b></p>` : `<div class="acq-in"><span class="mono">${soFmt(sp.a.f, sp.a.v)} ${sp.op} ${soFmt(sp.b.f, sp.b.v)} =</span><span class="sc-in ${cs.q ? 'qy' : ''}">${/^£/.test(sp.res) ? '<i class="pre">£</i>' : ''}<input data-soin="${id}" inputmode="decimal" autocomplete="off" value="${esc(cs.v || '')}" aria-label="${esc(sp.title)}">${sp.res === 'h' ? '<i class="suf">hours</i>' : sp.res === 'days' ? '<i class="suf">days</i>' : ''}</span><button class="btn primary" data-sochk="${id}">Check ✓</button><span class="sc-msg" role="status">${esc(cs.msg || '')}</span></div>`}</section>`;
}
/* Build: a figure, the operation, a figure; × either way round, ÷ the right way round */
function soBuildCheck(sp, cs){
  const T = cs.tokens; if(T.length < 3){ cs.msg = T.length ? 'Finish the sum: a figure, the operation, a figure.' : 'Tap a figure, the operation, then a figure.'; return false; }
  if(T.length > 3){ cs.q = true; cs.msg = 'This sum needs just two figures and one operation.'; return false; }
  const [x, op, y] = T, want = [sp.a.k, sp.b.k], bad = [x, y].map(k => sp.dis.find(d => d.k === k)).find(Boolean);
  if(bad){ cs.q = true; cs.msg = bad.hint; return false; }
  if(x === y){ cs.q = true; cs.msg = 'Use two different figures.'; return false; }
  if(op !== sp.op){ cs.q = true; cs.msg = sp.opHint; return false; }
  if(sp.op === '÷' && x !== want[0]){ cs.q = true; cs.msg = sp.orderHint || 'Which figure is shared out? Start with that one.'; return false; }
  if(!(want.includes(x) && want.includes(y))){ cs.q = true; cs.msg = 'Check which two figures this needs.'; return false; }
  cs.q = false; cs.ok = true; cs.msg = ''; return true;
}
function soCalcCheck(sp, cs){
  const v = soParse(cs.v, sp.res), ans = soAns(sp); if(v === null){ cs.msg = sp.res === 'h' ? 'Type the hours (1.5, or 1:30).' : sp.res === 'days' ? 'Type the number of days.' : 'Type the amount in pounds.'; return false; }
  const tol = sp.tol !== undefined ? sp.tol : 0.005; if(Math.abs(v - ans) <= tol + 1e-9){ cs.q = false; cs.ok = true; cs.msg = ''; return true; }
  const est = sp.op === '×' ? `Estimate first: about ${soFmt(sp.res, Math.round(sp.a.v / (sp.a.v >= 100 ? 100 : 10)) * (sp.a.v >= 100 ? 100 : 10) * sp.b.v)}.` : `Check: ${soFmt(sp.res, v)} × ${soFmt(sp.b.f, sp.b.v)} should make ${soFmt(sp.a.f, sp.a.v)}.`;
  cs.q = true; cs.msg = `Query: ${v > ans ? 'that is too much' : 'that is too little'}. ${est}`; return false;
}
/* what a finished card records: the skill (a Calculate counts towards the decay; a Build only marks the instance seen) and the log */
function soFinish(it, sp){
  const calc = it.level === 'calc', tag = calc ? 'Calculate' : 'Build';
  if(it.rel === 'tickets') soTouch('revenue', { route:it.route, count:calc });
  if(it.rel === 'fuel'){ (S.fuelSigned = S.fuelSigned || {})[it.pair] = it.price; if(calc){ const x = soTouch('fuelCost', { count:true }); x.last = { price:it.price, litres:plannedLitres(currentPlan()) }; } }
  if(it.rel === 'flightTime') soTouch('flightTime', { route:it.route, count:calc });
  if(it.rel === 'rentOrBuy') soTouch('rentOrBuy', { plane:it.plane, count:calc });
  if(it.rel === 'seatsFare') soTouch('seatsFare', { plane:it.plane, count:calc });
  soLog(`${sp.log} (${tag})`); soDone(it);
}
const soSplit = v => { const i = v.lastIndexOf('|'); return [v.slice(0, i), v.slice(i + 1)]; };   // keys hold '|' themselves (fc|at72|mad)
function soBindCards(items, st){
  const root = screen(), get = key => items.find(it => it.key === key);
  root.querySelectorAll('[data-sofig]').forEach(b => b.onclick = () => { const [key, k] = soSplit(b.getAttribute('data-sofig')), cs = soCardState(st, key); if(cs.tokens.length % 2 === 1){ cs.msg = 'Put the operation between the figures.'; render(); return; } cs.tokens.push(k); cs.msg = ''; cs.q = false; render(); });
  root.querySelectorAll('[data-soop]').forEach(b => b.onclick = () => { const [key, o] = soSplit(b.getAttribute('data-soop')), cs = soCardState(st, key); if(cs.tokens.length % 2 === 0){ cs.msg = cs.tokens.length ? 'Two operations in a row: tap a figure next.' : 'Start with a figure.'; render(); return; } cs.tokens.push(o); cs.msg = ''; render(); });
  root.querySelectorAll('[data-soundo]').forEach(b => b.onclick = () => { const cs = soCardState(st, b.getAttribute('data-soundo')); cs.tokens.pop(); cs.msg = ''; render(); });
  root.querySelectorAll('[data-soclr]').forEach(b => b.onclick = () => { const cs = soCardState(st, b.getAttribute('data-soclr')); cs.tokens = []; cs.msg = ''; cs.q = false; render(); });
  root.querySelectorAll('[data-soin]').forEach(i => { i.oninput = () => { soCardState(st, i.getAttribute('data-soin')).v = i.value; }; i.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); const c = root.querySelector(`[data-sochk="${i.getAttribute('data-soin')}"]`); if(c) c.click(); } }; });
  root.querySelectorAll('[data-sochk]').forEach(b => b.onclick = () => { const key = b.getAttribute('data-sochk'), it = get(key), sp = it && soSpec(it), cs = soCardState(st, key); if(!sp) return;
    const ok = it.level === 'build' ? soBuildCheck(sp, cs) : soCalcCheck(sp, cs);
    if(ok){ if(it.onDone) it.onDone(it, sp); else soFinish(it, sp); if(typeof liveChime === 'function' && typeof opsSoundOn === 'function' && opsSoundOn()) liveChime('ding'); render(); if(it.level === 'build') soCountUp(key, sp); } else render(); });
  const first = root.querySelector('[data-soin]'); if(first) setTimeout(() => { try{ first.focus(); }catch(e){} }, 40);
}
function soCountUp(key, sp){ const el = screen().querySelector(`[data-sores="${key}"]`); if(!el || settings.reduceMotion) return; const t0 = performance.now(), fin = el.innerHTML, v = soAns(sp);
  const tick = t => { const k = Math.min(1, (t - t0) / 600); if(k < 1){ el.textContent = soFmt(sp.res === '£2' ? '£' : sp.res, sp.res === 'h' || sp.res === 'days' ? v * k : Math.round(v * k)); requestAnimationFrame(tick); } else el.innerHTML = fin; }; requestAnimationFrame(tick); }
/* the week's sign-offs in one line: how many Calculate of the cap, how many Build, how many the model did */
function soWeekLine(){ const W = soWeek(false), its = Object.values(W.items), c = its.filter(it => it.level === 'calc').length, b = its.filter(it => it.level === 'build').length, m = its.filter(it => it.level === 'model').length;
  return `<div class="so-ledger"><span><small>This week</small><b>${c} of ${soCap()}</b> to calculate</span><span><b>${b}</b> to build</span><span><b>${m}</b> worked out by the model</span></div>`; }

/* the Monday "Sign-offs" page: the week's Build cards and flight-time sums, before the sheet */
function soStageItems(){ if(!soOn()) return []; const W = soWeek(false), pl = normPlan(currentPlan()), routes = new Set(pl.fleet.flatMap(x => x.sched)), pairs = new Set(pl.fleet.flatMap(x => x.sched.map(rid => cardKey(x.planeId, rid))));
  return W.order.map(k => W.items[k]).filter(it => it.point === 'workings' && (it.level === 'build' || (it.level === 'calc' && it.rel === 'flightTime')) && (it.done || (it.rel === 'fuel' ? pairs.has(it.pair) : routes.has(it.route)))); }
function renderSoStage(st, items){
  const done = items.every(it => it.done), body = `${soWeekLine()}<div class="so-grid">${items.map((it, i) => soCardHtml(it, st, i + 1)).join('')}</div>`;
  screen().innerHTML = shell(deskPage({ title:'Sign-offs', sub:`This week's figures to check before the sheet. ${items.some(it => it.level === 'build') ? 'Build: tap the two figures and the operation; the game works it out.' : ''}`, cls:'so-page', body }),
    deskBar(done ? 'Signed. Next, the figures on the sheet.' : 'Sign each one off. Build cards need the right figures and the right operation; a Calculate card needs your answer.', `${backBtn()}<button class="btn primary big" id="nx" ${done ? '' : 'disabled'}>${done ? 'Next: the sheet' : 'Sign these off first'} &#9654;</button>`));
  soBindCards(items, st);
  on('nx', () => { if(!items.every(it => it.done)) return; st.soPassed = true; UI.justDone = null; render(); });
}
const workingsSo0 = R.workings;
R.workings = st => {
  if(soOn() && dayLike()){ try{ workTables(currentPlan()); }catch(e){} const items = soStageItems();
    if(items.length && (items.some(it => !it.done) || !st.soPassed)){ renderSoStage(st, items); return; } }
  return workingsSo0(st);
};
/* the comparison path's rent-or-buy as Build (a third aircraft type and after): a sign-off page before Rent · Finance · Buy */
const acquireSo0 = R.acquire;
R.acquire = st => {
  if(soOn() && S.rnd.acChoice && S.rnd.acChoice.pid === S.rnd.shopPick){ const pid = S.rnd.acChoice.pid, it = soItem('rb|' + pid) || soAcquireItem(pid);
    if(it && it.level === 'build' && !st.soPassed){ const p = planeById(it.plane);
      screen().innerHTML = shell(deskPage({ title:`How should we get the ${esc(shortPlane(p))}?`, sub:'First, when does renting cost more than buying?', cls:'so-page', body:`<div class="so-grid one">${soCardHtml(it, st, 1)}</div>` }),
        deskBar(it.done ? 'Signed. Next, choose how to pay.' : 'Build the sum: the price, the operation, the rent a day. The game works it out.', `<button class="btn primary big" id="nx" ${it.done ? '' : 'disabled'}>${it.done ? 'Next: rent, finance or buy' : 'Build the sum first'} &#9654;</button>`));
      soBindCards([it], st); on('nx', () => { if(!it.done) return; st.soPassed = true; render(); }); return; } }
  return acquireSo0(st);
};
/* the showroom's sums for a later aircraft (the "Is it worth it?" page): rent-or-buy and a full plane through the cap */
const fleetSumsSo0 = R.fleetSums;
R.fleetSums = st => {
  if(!soOn()) return fleetSumsSo0(st);
  const p = planeById(S.rnd.shopPick || 'sf34'), o = shopOffer(p), sk = skills(), m = S.rnd.fleetModel && S.rnd.fleetModel.id === p.id ? S.rnd.fleetModel : (S.rnd.fleetModel = Object.assign({ id:p.id }, fleetModel(p.id))), r = routeById(m.firstRoute), fare = fareOf(r.id), cands = [];
  if(o.lease && o.price && !(sk.rentOrBuy && (sk.rentOrBuy.planes || []).includes(p.id)) && !soTeacherSet('rentOrBuy')) cands.push({ key:'rb|' + p.id, rel:'rentOrBuy', inst:true, carryable:false, plane:p.id, money:o.price, label:`Rent or buy: ${p.name}`, onModel:() => soTouch('rentOrBuy', { plane:p.id }) });
  if(!(sk.seatsFare && (sk.seatsFare.planes || []).includes(p.id)) && !soTeacherSet('seatsFare')) cands.push({ key:'sf|' + p.id, rel:'seatsFare', inst:true, carryable:false, plane:p.id, route:r.id, fare, money:p.seats * fare, label:`A full plane: ${p.name}`, onModel:() => soTouch('seatsFare', { plane:p.id }) });
  const W0 = soWeek(false), have = ['rb|' + p.id, 'sf|' + p.id].map(k => W0.items[k]).filter(Boolean);   // signed cards stay on the page
  const items = have.concat(soDecideList(cands.filter(c => !W0.items[c.key]), 'fleetSums', true)).map(it => { if(it.rel === 'seatsFare' && !it.fare){ it.fare = fare; it.route = r.id; } return it; }), done = items.every(it => it.done || it.level === 'model');
  const payback = m.extra > 0 ? Math.ceil(o.price / m.extra) : null;
  const model = `<div class="fs-model"><div><small>The model's suggestion</small><b>${m.sched.length ? esc(svcLabel(m.sched)) : 'No useful services yet'}</b><small>where people are left without a seat</small></div>
    <div><small>Extra profit a day</small><b class="${m.extra >= 0 ? 'green' : 'red'}">${money(m.extra)}</b><small>with those services, at today's fares</small></div>
    <div><small>${o.lease ? 'Against the rent' : 'Pays back in'}</small><b>${o.lease ? (m.extra > o.lease ? `${money(m.extra - o.lease)} a day ahead` : `${money(o.lease - m.extra)} a day short`) : payback ? `${payback} days` : '—'}</b><small>${o.lease ? `rent ${money(o.lease)} a day` : `price ${money(o.price)}`}</small></div></div>`;
  screen().innerHTML = shell(deskPage({ title:`Is the ${esc(shortPlane(p))} worth it?`, sub:`${money(o.price)} to buy${o.lease ? ` · ${money(o.lease)} a day to rent` : ''}. ${p.seats} seats.`, cls:'so-page', body:`${soWeekLine()}<div class="so-grid">${items.map((it, i) => soCardHtml(it, st, i + 1)).join('')}</div>${model}` }),
    deskBar(done ? 'Signed. Next, decide how to get it.' : 'Sign off the sums first.', `${backBtn()}<button class="btn primary big" id="nx" ${done ? '' : 'disabled'}>${done ? goLabel('Decide: buy, rent or finance') : 'Complete the sums first'} &#9654;</button>`));
  soBindCards(items, st);
  on('nx', () => { if(!items.every(it => it.done || it.level === 'model')) return; resetEntry(); UI.justDone = null; advance(); });
};

/* ==================================================================
   Part C, the floor (rule 11; auditFloor monthly, boardNudgeIdleWeeks 4, boardNudgeMissedShare 0.2, boardReviewSignOffs 3).
   At each month end after the weeks begin, Finance sends one audit: re-check the ticket line of the route that fell furthest
   short of the best plan that month (fallback: the largest revenue line). If the plan has not changed in the four weeks
   before it and the month missed more than a fifth of the best plan's profit, the audit is a board review: two lines, the
   month's average day as a Build divisor, and a letter; the next month waits until something on the plan has changed.
   The audit is the first thing in the new week, so it takes that week's sign-off slots first.
   ================================================================== */
function startBeat(b){ startBeatDesk(b); soAuditInsert(); }
function soMonthEndIn(h){ if(!h || !(h.to >= h.from)) return null; const me = monthEnd(h.from); return me <= h.to && me > (WORLD.weekFrom || 29) && me < (WORLD.reviewDay || 1e9) ? me : null; }
function soAuditInsert(){
  if(!weekMode() || (WBS().auditFloor || 'monthly') === 'off') return; const h = lastHist(), me = soMonthEndIn(h);
  if(!me || (S.audits || []).some(a => a.me === me) || S.steps.some(x => x.t === 'audit')) return;
  const k = S.steps.findIndex(x => x.t === 'review'), at = k >= 0 ? k + 1 : Math.max(1, S.steps.findIndex(x => x.t === 'hq') + 1); S.steps.splice(at, 0, { t:'audit', me });
}
/* the month's figures: the weeks that began in it, the best plan of its last week as a daily rate, each route's takings against it */
function soAuditData(me){
  const m0 = monthStart(me), weeks = (S.history || []).filter(h => ['week', 'month', 'day'].includes(h.type) && h.from >= m0 && h.from <= me), actual = weeks.reduce((t, h) => t + (h.profit || 0), 0), days = weeks.reduce((t, h) => t + (h.to - h.from + 1), 0) || 1;
  const last = weeks.length ? weeks[weeks.length - 1].from : me - 6, sweep = bestPlanSweep(last), bestDay = sweep.week / 7, best = Math.round(bestDay * days), missed = Math.max(0, best - Math.round(actual)), share = best > 0 ? missed / best : 0;
  const bestTk = atDay(last + 2, () => { const L = planLines(sweep.plan); return Object.fromEntries(L.routes.map(x => [x.id, x.tk])); });
  const flown = {}; weeks.forEach(h => Object.entries(h.routes || {}).forEach(([id, x]) => { if(!(x.trips > 0 || x.pax > 0)) return; const f = flown[id] || (flown[id] = { id, rev:0 }); f.rev += x.rev || 0; }));
  const plan = currentPlan(), onDay = d => atDay(d, () => planLines(plan)), lineOn = rid => { for(let d = me; d >= me - 6; d--){ const x = onDay(d).routes.find(z => z.id === rid); if(x && x.pax > 0) return { route:rid, on:d, pax:x.pax, fare:x.fare }; } return null; };
  const ranked = Object.values(flown).map(f => Object.assign(f, { short:Math.round((bestTk[f.id] || 0) * days - f.rev) })).filter(f => normPlan(plan).fleet.some(x => x.sched.includes(f.id)));
  const byShort = ranked.filter(f => f.short > 0).sort((a, b) => b.short - a.short), byRev = ranked.slice().sort((a, b) => b.rev - a.rev), order = byShort.concat(byRev.filter(f => !byShort.includes(f)));
  const lastChange = (S.planChange && S.planChange.day) || 1, idleDays = me - lastChange + 1, idle = idleDays >= 7 * (WBS().boardNudgeIdleWeeks || 4);
  const board = idle && share > (WBS().boardNudgeMissedShare !== undefined ? WBS().boardNudgeMissedShare : 0.2);
  const lines = []; for(const f of order){ const ln = lineOn(f.id); if(ln){ ln.why = f.short > 0 ? `${money(f.short)} short of the best plan's takings this month` : 'the largest revenue line'; lines.push(ln); } if(lines.length >= (board ? 2 : 1)) break; }
  return { me, month:monthName(me), weeks:weeks.length, days, actual:Math.round(actual), best, missed, share:Math.round(share * 1000) / 1000, bestLabel:sweep.label, lastChange, idleWeeks:Math.floor(idleDays / 7), idle, board, lines };
}
R.audit = st => {
  if(!st.data) st.data = soAuditData(st.me);
  const D = st.data, W = soWeek(true), n = (WBS().boardReviewSignOffs || 3);
  const items = D.lines.map((ln, i) => { const key = `au|${D.me}|${i}`; if(!W.items[key]){ W.items[key] = { key, rel:'audit', label:`${D.board ? 'Board review' : 'Audit'}: ${routeById(ln.route).city}`, cls:'changed', money:Math.round(ln.pax * ln.fare), level:'calc', why:'asked', point:'audit', day:S.day, wk:W.wk, done:false, forced:true, noDecay:true, route:ln.route, on:ln.on, pax:ln.pax, fare:ln.fare, board:D.board }; W.order.push(key); } return W.items[key]; });
  const mean = D.board && n >= 3 ? { id:'mday', n:items.length + 1, kind:'mean', title:`${D.month}: the average day`, ask:"Show how to find the month's average profit a day.", totalLabel:`${D.month} profit`, total:D.actual, div:D.days, per:'day', figs:[] } : null;
  const mst = mean ? rbState(st, 'mday') : null, done = items.every(it => it.done) && (!mean || mst.ok);
  const pct = Math.round(D.share * 100), letter = D.board
    ? `<section class="dk-pnl so-letter board"><div class="dk-pnl-h">${ICO2.doc}<h2>From the board</h2></div><p>We have read ${esc(D.month)}'s accounts. The plan has not changed since ${dateShort(D.lastChange)}, and the airline made ${money(D.actual)} where the best plan available would have made about ${money(D.best)}: ${money(D.missed)} missed (${pct}%).</p><p><b>We'd like to see a plan that tests a different fare or route.</b> Sign off the figures below; the next month does not run until something on the planning board has changed. What you change is up to you.</p></section>`
    : `<section class="dk-pnl so-letter"><div class="dk-pnl-h">${ICO2.doc}<h2>Finance</h2></div><p>Check the ${esc(routeById(D.lines[0] ? D.lines[0].route : S.market).city)} line before the accounts close.</p><p class="so-miss">${esc(D.month)}: you made ${money(D.actual)}; the best plan available would have made about ${money(D.best)} (${money(D.missed)} missed, ${pct}%).</p></section>`;
  const body = `<div class="so-audit">${letter}<div class="so-grid">${items.map((it, i) => soCardHtml(it, st, i + 1)).join('')}${mean ? rbCardHtml(mean, mst, st) : ''}</div></div>`;
  screen().innerHTML = shell(deskPage({ title:`${D.board ? 'Board review' : 'Finance audit'}: ${esc(D.month)}`, sub:D.board ? 'The board has written to you about the month.' : `Finance re-checks one line of ${esc(D.month)}'s accounts.`, cls:'so-page', body }),
    deskBar(done ? (D.board ? 'Signed. Now change something on the plan: a fare, a service, a route or a plane.' : 'Signed. On to the week.') : 'Sign off the figures.', `<button class="btn primary big" id="nx" ${done ? '' : 'disabled'}>${done ? 'On to the plan' : 'Sign these off first'} &#9654;</button>`));
  items.forEach(it => { it.onDone = (x, sp) => { soLog(`${sp.log} (Calculate)`); soDone(x); }; });
  soBindCards(items, st);
  if(mean) rbBind([mean], st, () => { rbLog([`Board review: ${D.month} average day (Build)`]); });
  on('nx', () => { if(!(items.every(it => it.done) && (!mean || rbState(st, 'mday').ok))) return;
    const a = { me:D.me, day:S.day, wk:W.wk, board:D.board, routes:D.lines.map(l => l.route), share:D.share, missed:D.missed, best:D.best, actual:D.actual, idleWeeks:D.idleWeeks }; (S.audits = S.audits || []).push(a); W.audit = a;
    if(D.board){ S.board = { open:true, key:planKey(currentPlan()), day:S.day, me:D.me }; addNews([{ tag:'BOARD', text:`The board asks for a plan that tests a different fare or route before ${D.month === 'November' ? 'December' : 'the next month'} runs.` }]); }
    UI.justDone = null; advance(); });
};
RAIL_LABEL.audit = 'Finance audit';
/* the board waits for a change: the plan's Next is held until the plan differs from the one the board read */
function soBoardWaiting(){ return !!(S.board && S.board.open && planKey(currentPlan()) === S.board.key); }
const planSo0 = R.plan;
R.plan = st => {
  const r = planSo0(st); if(!soBoardWaiting() || UI.card) return r;
  const b = $('nx'); if(b){ b.disabled = true; b.innerHTML = 'Change something on the plan first &#9654;'; }
  const host = screen().querySelector('.plw') || screen().querySelector('main'); if(host && !host.querySelector('.so-board-note')) host.insertAdjacentHTML('afterbegin', `<div class="so-board-note">${ICO2.doc}<span><b>The board is waiting for a plan that tests a different fare or route.</b> Change a fare, a service, a route or a plane, then carry on.</span></div>`);
  return r;
};
/* each day or period that closes: when the flown plan last changed, the board's request, and the neglect rule from week 5 on */
function closeDay(){
  if(S && S.phase !== 'setup'){ const k = planKey(currentPlan()), from = S.period ? S.period.from : S.day;
    if(!S.planChange || S.planChange.key !== k) S.planChange = { key:k, day:from };
    if(S.board && S.board.open && S.board.key !== k){ S.board.open = false; S.board.changed = from; addNews([{ tag:'BOARD', text:'The board has seen the new plan.' }]); }
    if(S.period && ['week', 'month'].includes(S.period.type) && !S.period.neglected){ S.period.neglected = true; const lines = neglectUpdate(S.period.from, S.period.to) || []; if(lines.length) addNews(lines.map(l => ({ tag:l.bad ? 'RIVAL' : 'NEWS', text:l.text }))); }
  }
  return closeDayWeek();
}

/* ==================================================================
   Part D: the record (Brief §5: per week, sign-offs qualified, asked, carried; skill counts; audits and board reviews) and the
   teacher's controls (the cap dial 1–3, hold a relationship at Calculate).
   ================================================================== */
function soLogRows(){
  const o = soS(); return Object.values(o.weeks).sort((a, b) => a.wk - b.wk).map(W => { const its = W.order.map(k => W.items[k]), lab = f => its.filter(f).map(it => it.label);
    return { wk:W.wk, from:W.from, qualified:its.filter(it => it.level === 'calc' || it.why === 'cap').length, asked:lab(it => it.level === 'calc'), build:lab(it => it.level === 'build'), model:lab(it => it.level === 'model'),
      carried:lab(it => it.carry), carriedIn:lab(it => it.carriedFrom), decay:lab(it => it.why === 'decay'), audit:W.audit ? (W.audit.board ? 'board review' : 'audit') : '' }; });
}
function soTeacherRender(){
  const el = $('tSo'); if(!el || !S) return; const o = soS(), wb = WBS().signOffCapPerWeek || 3, rows = soLogRows(), sk = skills();
  el.innerHTML = `<div class="row"><span>Calculate sign-offs a week (from week 2)</span><select id="tSoCap"><option value="">Workbook (${wb})</option>${[1, 2, 3].map(v => `<option value="${v}" ${o.cap === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
    <div class="row so-holds"><span>Hold at Calculate (no Build after the second time)</span>${SO_HOLDABLE.map(r => `<label><input type="checkbox" data-sohold="${r}" ${o.hold[r] ? 'checked' : ''}> ${esc(SO_REL[r].name)}</label>`).join('')}</div>
    <p class="small muted">Counts from week 2: ${SO_HOLDABLE.concat(['fuelOrder']).map(r => `${esc(SO_REL[r].name)} ${o.rel[r] || 0}`).join(' · ')}. By hand ever: ${Object.keys(sk).filter(k => sk[k].count).map(k => `${esc(TOOL[k] ? TOOL[k].name : k)} ${sk[k].count}`).join(' · ') || 'none yet'}.</p>
    ${rows.length ? `<table class="so-log"><thead><tr><th>Week</th><th>Qualified</th><th>Calculate</th><th>Build</th><th>Model</th><th>Carried</th><th>Audit</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r.wk}</td><td>${r.qualified}</td><td>${esc(r.asked.join(', ')) || '—'}</td><td>${esc(r.build.join(', ')) || '—'}</td><td>${esc(r.model.join(', ')) || '—'}</td><td>${esc(r.carried.join(', ')) || '—'}</td><td>${r.audit || '—'}</td></tr>`).join('')}</tbody></table>` : '<p class="small muted">No weeks with sign-offs yet: the cap starts in week 2.</p>'}`;
  const c = $('tSoCap'); if(c) c.onchange = () => { o.cap = c.value === '' ? null : +c.value; save(); soTeacherRender(); };
  el.querySelectorAll('[data-sohold]').forEach(b => b.onchange = () => { o.hold[b.getAttribute('data-sohold')] = b.checked; save(); });
}
/* for the tests: the next unfinished card on screen and how to finish it */
function soPlan(){
  const st = step(), W = soWeek(false); let items = [];
  if(st.t === 'workings') items = soStageItems(); else if(st.t === 'audit') items = Object.values(W.items).filter(it => it.point === 'audit'); else if(st.t === 'fleetSums') items = Object.values(W.items).filter(it => it.point === 'fleetSums'); else if(st.t === 'acquire') items = Object.values(W.items).filter(it => it.point === 'acquire' && it.level === 'build');
  const it = items.find(x => !x.done && x.level !== 'model'); if(!it){ const rb = st.t === 'audit' && st.data && st.data.board && !(st.rb && st.rb.mday && st.rb.mday.ok) ? { id:'mday', op:'÷', div:st.data.days } : null; return rb ? { rb } : null; }
  const sp = soSpec(it); return { key:it.key, level:it.level, seq:[sp.a.k, sp.op, sp.b.k], answer:String(Math.round(soAns(sp) * 100) / 100) };
}
