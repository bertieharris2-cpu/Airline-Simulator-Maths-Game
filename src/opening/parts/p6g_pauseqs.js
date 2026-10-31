/* =====================================================================
   THE PAUSE'S QUESTIONS (hand-off 1c, 31 Oct 2026, sections 2, 3 and 6; Settings countingPriority, modellingQuestion and
   tipGainGate; the PauseSchedule sheet and the Calendar's gatedCalc). Chapter one only (ch1(); off when countingPriority
   reads "off").
   A pause has two counted questions (pausesPerBoundary). The slots go first to the sums his own plan change needs (the
   Monday sheet's cells, a new route's tickets, a plane's time to afford in the shop), then to the questions Fable
   scheduled. A Sunday comes before the Monday it belongs to, so the scheduled questions wait until his plan is settled:
   they come on the Monday (step c1q, "Before week N flies"), after the Studio's sums and before the plan check, one small
   sheet each, worked out on paper (Sum n) and counted. The Sunday accounts add up the week (built, not counted); they no
   longer ask the difference from the plan or the rotating question. A scheduled question that finds no room waits for the
   next pause, after the next pause's own. Never more than two at a pause.
   The questions (the Calendar's gatedCalc names them for P2 to P5; from P6 the PauseSchedule rule: the difference about
   every third pause, otherwise a rotating question, then the modelling question):
     timeToAfford       P3 · the days until he can afford the cheapest plane he can't buy yet (unless the shop asked it)
     whatIfFirst        P2 · the what-if sheet's first sum: seats filled × fare, at one step up on one route
     modelChange        P2, P6 on · section 6: his fare against the next fare up or down that earns ≥ tipGainGate a day more
                        on his own flights (the difference for one flight on paper; a day and a week by Finance); if his
                        plan is already good, Finance suggests two changes and he works one out
     fuelTwoPlanes      P4 · litres a seat for the second type of plane in his fleet (with two types)
     ticketRevenueLong  P4 · the possible ticket revenue a day of the route that opens today (Madrid): who wants to fly × fare
     projectedVsActual  P5, then about every third pause · how far last week was from the plan
     reviewRotation     P3, P5, P6 on · ReviewQuestions in turn: best day, range, seats filled, worst day
   ===================================================================== */
{
const c1qOn = () => c1qMoves();
const C1Q_IDS = ['timeToAfford', 'whatIfFirst', 'modelChange', 'fuelTwoPlanes', 'ticketRevenueLong', 'projectedVsActual', 'reviewRotation'];
const C1Q_WAITS = ['timeToAfford', 'whatIfFirst', 'modelChange', 'fuelTwoPlanes', 'projectedVsActual', 'reviewRotation'];
const fill = (s, V) => String(s || '').replace(/\{(\w+)\}/g, (m, k) => V[k] !== undefined && V[k] !== null ? String(V[k]) : m);
/* the words: ScreenText's row when there is one, else these */
const D = {
  'pauseq.page':{ title:'Before week {n} flies', text:['Question {i} of {k} from Finance. Work it out in your book.', 'Your own plan\'s sums came first at this pause, so Finance\'s other {w} waits for the next one.'], button:'Next question ▶' },
  'pauseq.footer':{ text:['Before week {n} flies · Finance\'s questions'], button:'Carry on ▶' },
  'pauseq.whatIfFirst':{ eyebrow:'NEW · WHAT IF', title:'What if {city} were {fare}?', text:['The **What if** sheet opens today, in the Studio: change a fare and every figure on its row works itself out (ƒ).', 'Its first sum by hand: {city} at **{fare}** instead of {now}. Ticket revenue a day = seats filled × fare.'] },
  'pauseq.modelChange':{ eyebrow:'MODELLING', title:'{city}: {now} or {fare}?', text:['On your own flights, **{fare}** would earn more on {city} than your {now}.', 'How much more for one flight? Finance works out a day and a week from your answer.'] },
  'pauseq.modelChange.pick':{ eyebrow:'MODELLING', title:'Try a change', text:['Your plan is already good: no other fare earns {gate} a day more.', 'Finance suggests two changes. Pick one and work out what it would do for one flight.'] },
  'pauseq.timeToAfford':{ eyebrow:'THE PLANE SHOP', title:'How long until you can afford the {plane}?', text:['The {plane} costs **{price}**. You have {cash}, and your planes made about **{rate} a day** last week.', 'Days to afford = still to find ÷ profit a day, rounded up to a whole day.'] },
  'pauseq.reviewRotation':{ eyebrow:'LAST WEEK', title:'{q}', text:['About {period}: {from} to {to}.'] },
  'pauseq.fuelTwoPlanes':{ eyebrow:'FUEL', title:'Which plane uses less fuel for each seat?', text:['A trip to {city} and back in each of your planes: the {a} and the {b}.', 'Litres a seat = fuel a trip ÷ seats. Give it to one decimal place.'] },
  'pauseq.ticketRevenueLong':{ eyebrow:'NEW ROUTE', title:'What could {city} take in a day?', text:['{city} opens today: {km} km away, further than any route you fly.', 'If everyone who wants to fly went at {fare}: who wants to fly × fare.'] },
  'pauseq.projectedVsActual':{ eyebrow:'LAST WEEK', title:'How far was {period} from the plan?', text:['On Monday the plan said **{proj}**. The week made **{total}**.', 'Difference = the larger − the smaller.'] }
};
function TQ(id, V){ const T = c1T(id, V), d = D[id] || {};
  return { eyebrow:T.eyebrow || fill(d.eyebrow, V), title:T.title || fill(d.title, V), text:T.text.length ? T.text : (d.text || []).map(t => fill(t, V)), button:T.button || d.button || '' }; }

/* ---------- which questions, at which pause ---------- */
function c1qDue(d){
  const g = c1Gated(d).concat(c1Gated(d - 1)).filter(k => C1Q_IDS.includes(k));
  if(g.length) return [...new Set(g)];
  if(d < c1WeeklyFrom() + 7) return [];   // the day-by-day weeks ask only what the Calendar names (P1: nothing)
  return [c1DifferenceDue(d - 1) ? 'projectedVsActual' : 'reviewRotation', 'modelChange'];
}
/* last week's (or month's) accounts: kept at Sunday's close in the day-by-day weeks, else from the history */
function c1qLast(){ const X = c1Ex(), d = S.day || 1;
  if(X.lastAcc && X.lastAcc.to === d - 1) return X.lastAcc;
  const h = (S.history || []).filter(x => x.type === 'week' || x.type === 'month').pop();
  if(!h || h.to !== d - 1) return null;
  const days = []; for(let k = h.from; k <= h.to; k++){ const s = ledgerSum(k, k); if(s.days) days.push({ d:k, p:Math.round(s.profit) }); }
  const pj = h.forecast && h.forecast.profit !== undefined && h.forecast.profit !== null ? h.forecast.profit : h.proj;
  return { wk:weekNo(h.from), from:h.from, to:h.to, type:h.type, days, total:Math.round(h.profit), projected:pj === null || pj === undefined ? null : Math.round(pj), pax:h.pax || 0, seats:h.seats || 0 };
}
const periodWords = L => L.type === 'month' ? monthName(L.from) : `week ${L.wk}`;
const fareOpts = r => (r.fares && r.fares.length ? r.fares : [r.basePrice]).slice().sort((a, b) => a - b);
const flightsOn = id => planFlights().filter(x => !x.grounded && x.route === id).length;
const askedHere = re => { const P = c1PauseOf(S.day || 1); return ((typeof rec === 'function' && rec().entries) || []).some(e => e.type === 'calc' && c1PauseOf(e.day) === P && re.test(e.key)); };

/* ---------- the questions: plan() decides (null: can't be asked); make() draws its sheet ---------- */
const sheet = (Q, o) => Object.assign({ id:`pq:${Q.id}:${Q.day}`, crumb:'', title:'', tabs:null, small:true, tight:true, lw:262, just:null }, o);
/* a paper sum: worked out in his book, the answer typed in its cell; counted (a Calculate in the record) */
function paper(Q, qs, o){
  const key = `pq:${Q.id}:${Q.day}`, tol = o.tol || 0.5;
  const sum = { id:key, kind:'pq:' + Q.id, title:o.title, question:o.title, tgt:o.tgt, refs:o.refs, ops:o.ops, words:o.words, how:'book', built:true, done:!!qs.ok, unit:o.unit || '£', want:o.want, recKey:key,
    get no(){ return sumNo(key); }, parse:o.parse, answerText:o.answerText,
    answer:(raw, val) => {
      if(o.want < 0 && Math.abs(val + o.want) < tol && !/^[−–-]/.test(String(raw).trim())) return { note:'It earns less, so the difference is below zero: type it with a minus (−). One more try.' };
      const good = Math.abs(val - o.want) < tol || (o.alt !== undefined && Math.abs(val - o.alt) < (o.altTol || tol));
      let e = null; try{ e = recOpen(key, { type:'calc', relKey:o.rel, doc:o.doc, ask:o.title, question:o.question, unit:o.unit || '£', correct:o.want, correctText:o.answerText, ops:o.vals || [], op:o.ops[0], level:'Calculate' });
        recAttempt(e, { ok:good, given:raw, value:val, method:'worked on paper, answer typed' }); }catch(x){}
      if(good){ qs.ok = true; if(o.onOk) o.onOk(); save(); return { ok:true }; }
      qs.tries = (qs.tries || 0) + 1;
      if(qs.tries >= 2 && twoTriesOn()){ qs.ok = true; qs.shown = true; try{ paperRecShown(key); }catch(x){} if(o.onOk) o.onOk(); save(); return { shown:true }; }
      return { note:o.note ? o.note(val) : ashWrong(o.ops[0], o.vals || [], val, o.want, o.unit || '£') }; },
    hints:() => (o.hints || []).concat([{ t:`Check: about ${o.unit === '£' || !o.unit ? money(ashRound(o.want)) : num(ashRound(o.want))}.`, est:true }]), how2:() => '' };
  return sum;
}
const done1 = (sum, qs) => qs.ok ? { tgt:sum.tgt, refs:sum.refs, ops:sum.ops, words:sum.words, val:sum.answerText } : null;

const C1Q = {
  /* P3: the days until he can afford a plane (the shop asks it too, when he picks one: then not again here) */
  timeToAfford:{ plan:() => { if(typeof taFig !== 'function' || askedHere(/^ta:/)) return null;
      // the planes on sale now, or within two weeks (TEST Air can buy everything in the shop by day 22: then the E175, on sale day 29)
      const f = shopPlanes((S.day || 1) + 14).map(p => taFig(p.id)).filter(x => !x.afford && x.still > 0 && x.rate > 0 && x.days).sort((a, b) => a.price - b.price)[0];
      return f ? { pid:f.pid } : null; },
    make:(Q, qs) => { const f = taFig(Q.d.pid), pf = planeById(Q.d.pid).shopFromDay || 1, V = { plane:f.short, price:money(f.price), cash:money(f.cash), rate:money(f.rate) };
      const rows = [{ r:1, t:'hdr' }, { r:2, label:`Price of the ${f.short}`, ic:'plane' }, { r:3, label:'Cash now', ic:'coins' }, { r:4, label:'Still to find', ic:'note' }, { r:5, label:'Profit a day (last 7 days)', ic:'chart' }, { r:6, label:'Days to afford', ic:'cal', gold:true, t:'tot' }];
      const v = { B2:{ t:money(f.price) }, B3:{ t:money(f.cash) }, B4:{ t:money(f.still), f:true }, B5:{ t:money(f.rate) } };
      const s = paper(Q, qs, { title:`How long until you can afford the ${f.short}?`, tgt:'B6', refs:['B4', 'B5'], ops:['÷'], words:'Still to find ÷ Profit a day', want:f.days, alt:f.exact, altTol:0.05, unit:'days', rel:'timeToAfford',
        doc:`Time to afford: ${f.name}`, question:`${money(f.still)} ÷ ${money(f.rate)} a day`, vals:[f.still, f.rate], answerText:`${num(f.days)} days`,
        parse:raw => { const x = parseFloat(String(raw).replace(/[^\d.]/g, '')); return isNaN(x) ? null : x; },
        note:val => val > f.still ? 'That is more days than pounds: divide what is still to find by the profit a day.' : `Check: ${money(f.still)} ÷ ${money(f.rate)}, then round up to a whole day. One more try.`,
        hints:[{ t:`${money(f.still)} ÷ ${money(f.rate)}. A part of a day still needs a whole day, so round up.` }] });
      if(qs.ok) v.B6 = { t:`${num(f.days)} days` };
      const T = TQ('pauseq.timeToAfford', V); if(pf > (S.day || 1)) T.text.splice(1, 0, `The ${f.short} goes on sale on ${dateShort(pf)}.`);
      return { T, sp:sheet(Q, { cols:[{ c:'B', w:170, top:pf > (S.day || 1) ? `on sale ${dateShort(pf)}` : 'the shop', main:f.short }], rows, v, sums:[s], act:qs.ok ? null : s, doneF:done1(s, qs), doneLine:qs.ok ? `About ${num(f.days)} days of flying like last week. The shop is on the Fleet desk.` : '' }),
        done:qs.ok ? `✓ About **${num(f.days)} days**` : '' }; } },

  /* P2: the what-if sheet's first sum (passengers × fare) */
  whatIfFirst:{ plan:() => { if(!c1WiOn()) return null; const now = c1WiRows({}), pick = now.rows.slice().sort((a, b) => b.pax - a.pax)[0]; if(!pick) return null;
      const o = fareOpts(pick.r), i = o.indexOf(pick.fare), f1 = i >= 0 && i < o.length - 1 ? o[i + 1] : i > 0 ? o[i - 1] : null;
      return f1 ? { id:pick.id, f0:pick.fare, f1 } : null; },
    make:(Q, qs) => { const r = routeById(Q.d.id), x = c1WiRows({ [Q.d.id]:Q.d.f1 }).rows.find(z => z.id === Q.d.id) || { pax:0, seats:0 }, want = x.pax * Q.d.f1;
      const V = { city:r.city, fare:money(Q.d.f1), now:money(Q.d.f0) };
      const rows = [{ r:1, t:'hdr' }, { r:2, label:'Seats filled a day', ic:'person' }, { r:3, label:'Fare', ic:'tag' }, { r:4, label:'Ticket revenue a day', ic:'coins', gold:true, t:'tot' }];
      const v = { B2:{ t:num(x.pax), f:true, bar:x.seats ? x.pax / x.seats : null }, B3:{ t:money(Q.d.f1) } };
      const s = paper(Q, qs, { title:`What if ${r.city} were ${money(Q.d.f1)}?`, tgt:'B4', refs:['B2', 'B3'], ops:['×'], words:'Seats filled × Fare', want, rel:'ticketRevenue',
        doc:`What if: ${r.city} at ${money(Q.d.f1)}`, question:`${num(x.pax)} × ${money(Q.d.f1)}`, vals:[x.pax, Q.d.f1], answerText:money(want) });
      if(qs.ok) v.B4 = { t:money(want) };
      return { T:TQ('pauseq.whatIfFirst', V), sp:sheet(Q, { cols:[{ c:'B', w:170, top:'what if', main:`${r.city} ${money(Q.d.f1)}` }], rows, v, sums:[s], act:qs.ok ? null : s, doneF:done1(s, qs), doneLine:qs.ok ? 'The What if sheet does this for every fare you try: What if › in the Studio.' : '' }),
        done:qs.ok ? `✓ **${money(want)}** a day` : '', wi:true }; } },

  /* section 6: the modelling question */
  modelChange:{ plan:() => { if(!c1WiOn()) return null; const now = c1WiRows({}), gate = +WBS().tipGainGate || 50, ids = now.rows.map(x => x.id); if(!ids.length) return null;
      const gain = (id, f) => c1WiRows({ [id]:f }).tot.profit - now.tot.profit; let best = null;
      ids.forEach(id => { const f0 = fareOf(id); fareOpts(routeById(id)).forEach(f => { if(f === f0) return; const g = gain(id, f); if(!best || g > best.g) best = { id, f, g }; }); });
      if(best && best.g >= gate){ const f0 = fareOf(best.id), o = fareOpts(routeById(best.id)), i = o.indexOf(f0), f1 = i < 0 ? null : o[i + (best.f > f0 ? 1 : -1)];
        if(f1 !== undefined && f1 !== null && gain(best.id, f1) > 0) return { form:'table', id:best.id, f0, f1 }; }
      // his plan is already good: two suggested changes, one step each (up on the busiest route, down on another, or down on the same)
      const sug = []; now.rows.slice().sort((a, b) => b.pax - a.pax).forEach(x => { const o = fareOpts(x.r), i = o.indexOf(x.fare); if(i < 0) return;
        if(!sug.some(s => s.dir === 1) && i < o.length - 1) sug.push({ id:x.id, f0:x.fare, f1:o[i + 1], dir:1 });
        else if(!sug.some(s => s.dir === -1) && i > 0) sug.push({ id:x.id, f0:x.fare, f1:o[i - 1], dir:-1 }); });
      if(sug.length < 2){ const x = now.rows[0], o = fareOpts(x.r), i = o.indexOf(x.fare); if(i > 0 && !sug.some(s => s.id === x.id && s.dir === -1)) sug.push({ id:x.id, f0:x.fare, f1:o[i - 1], dir:-1 }); }
      return sug.length ? { form:'pick', sug:sug.slice(0, 2) } : null; },
    make:(Q, qs) => { const gate = money(+WBS().tipGainGate || 50), ch = Q.d.form === 'table' ? Q.d : qs.pick;
      if(!ch){ return { T:TQ('pauseq.modelChange.pick', { gate }), pick:Q.d.sug, sp:null, done:'' }; }
      const r = routeById(ch.id), n = Math.max(1, flightsOn(ch.id)), now = c1WiRows({}).rows.find(z => z.id === ch.id), alt = c1WiRows({ [ch.id]:ch.f1 }).rows.find(z => z.id === ch.id);
      const per = x => { const pax = Math.round(x.pax / n), rev = Math.round(x.rev / n), cost = Math.round(x.cost / n); return { pax, rev, cost, profit:rev - cost }; }, a = per(now), b = per(alt), d = b.profit - a.profit;
      const rows = [{ r:1, t:'hdr' }, { r:2, label:'Passengers a flight', ic:'person' }, { r:3, label:'Ticket revenue a flight', ic:'coins' }, { r:4, label:'Costs a flight', ic:'receipt' }, { r:5, label:'Profit a flight', ic:'chart', gold:true },
        { r:6, t:'gap' }, { r:7, label:'Difference for one flight', ic:'scale', gold:true, t:'tot' }, { r:8, label:`A day (× ${n} flight${n === 1 ? '' : 's'})`, ic:'cal' }, { r:9, label:'A week (× 7)', ic:'cal' }];
      const v = { B2:{ t:num(a.pax) }, C2:{ t:num(b.pax) }, B3:{ t:money(a.rev), f:true }, C3:{ t:money(b.rev), f:true }, B4:{ t:money(a.cost) }, C4:{ t:money(b.cost) }, B5:{ t:money(a.profit), f:true, cls:a.profit < 0 ? 'soft' : '' }, C5:{ t:money(b.profit), f:true, cls:b.profit < 0 ? 'soft' : '' } };
      const s = paper(Q, qs, { title:`${r.city}: ${money(ch.f0)} or ${money(ch.f1)}?`, tgt:'B7', refs:['C5', 'B5'], ops:['−'], words:`At ${money(ch.f1)} − Now`, want:d, rel:'difference',
        doc:`Modelling: ${r.city} at ${money(ch.f0)} against ${money(ch.f1)}`, question:`${money(b.profit)} − ${money(a.profit)}`, vals:[b.profit, a.profit], answerText:ashSigned(d, true),
        hints:[{ t:`Profit a flight at ${money(ch.f1)} − profit a flight now: ${money(b.profit)} − ${money(a.profit)}.` }] });
      if(qs.ok){ v.B7 = { t:ashSigned(d, true), cls:d > 0 ? 'pos' : '' }; v.B8 = { t:ashSigned(d * n, true), f:true, cls:d > 0 ? 'pos' : '' }; v.B9 = { t:ashSigned(d * n * 7, true), f:true, cls:d > 0 ? 'pos' : '' }; }
      const T = Q.d.form === 'table' ? TQ('pauseq.modelChange', { city:r.city, now:money(ch.f0), fare:money(ch.f1) }) : TQ('pauseq.modelChange.pick', { gate });
      const words = d > 0 ? `${money(d)} more a flight: ${money(d * n)} a day, ${money(d * n * 7)} a week. Set it in the Studio if you want it.` : d < 0 ? `${money(-d)} less a flight: ${money(-d * n)} a day, ${money(-d * n * 7)} a week. Your fare is the better one.` : 'No difference a flight.';
      return { T, sp:sheet(Q, { lw:262, cols:[{ c:'B', w:140, top:'now', main:money(ch.f0) }, { c:'C', w:140, top:'what if', main:money(ch.f1) }], rows, v, sums:[s], act:qs.ok ? null : s, doneF:done1(s, qs), doneLine:qs.ok ? words : '' }),
        done:qs.ok ? `✓ **${ashSigned(d, true)}** a flight` : '', wi:true }; } },

  /* P4: litres a seat, his two types of plane */
  fuelTwoPlanes:{ plan:() => { const types = [...new Set(activeFleet().map(f => f.planeId))]; if(types.length < 2) return null;
      const pl = c1WiRows({}).rows; const r = (pl.slice().sort((a, b) => routeKm(a.r) - routeKm(b.r))[0] || {}).r; if(!r) return null;
      const P = types.map(id => planeById(id)).sort((a, b) => a.seats - b.seats); return { a:P[0].id, b:P[P.length - 1].id, route:r.id }; },
    make:(Q, qs) => { const r = routeById(Q.d.route), A = planeById(Q.d.a), B = planeById(Q.d.b), la = fuelForTrip(A, r), lb = fuelForTrip(B, r), pa = Math.round(la / A.seats * 10) / 10, exact = lb / B.seats, want = Math.round(exact * 10) / 10;
      const V = { city:r.city, a:shortPlane(A), b:shortPlane(B) }, oneDp = x => x.toFixed(1);
      const rows = [{ r:1, t:'hdr' }, { r:2, label:'Fuel a trip (litres)', ic:'note' }, { r:3, label:'Seats', ic:'person' }, { r:4, label:'Litres a seat', ic:'scale', gold:true, t:'tot' }];
      const v = { B2:{ t:num(la) }, C2:{ t:num(lb) }, B3:{ t:num(A.seats) }, C3:{ t:num(B.seats) }, B4:{ t:`${oneDp(pa)} L`, f:true } };
      const s = paper(Q, qs, { title:'Which plane uses less fuel for each seat?', tgt:'C4', refs:['C2', 'C3'], ops:['÷'], words:'Fuel a trip ÷ Seats', want, alt:exact, altTol:0.1, tol:0.06, unit:'L', rel:'division',
        doc:`Fuel a seat: ${shortPlane(B)} to ${r.city}`, question:`${num(lb)} ÷ ${num(B.seats)}`, vals:[lb, B.seats], answerText:`${oneDp(want)} L`,
        parse:raw => { const x = parseFloat(String(raw).replace(/[^\d.]/g, '')); return isNaN(x) ? null : x; },
        note:() => `Check: ${num(lb)} ÷ ${num(B.seats)}, to one decimal place. One more try.`, hints:[{ t:`${num(lb)} ÷ ${num(B.seats)}: the litres shared out between the seats.` }] });
      if(qs.ok) v.C4 = { t:`${oneDp(want)} L` };
      const less = want < pa ? shortPlane(B) : shortPlane(A);
      return { T:TQ('pauseq.fuelTwoPlanes', V), sp:sheet(Q, { lw:200, cols:[{ c:'B', w:150, top:`${A.seats} seats`, main:shortPlane(A) }, { c:'C', w:150, top:`${B.seats} seats`, main:shortPlane(B) }], rows, v, sums:[s], act:qs.ok ? null : s, doneF:done1(s, qs),
        doneLine:qs.ok ? `The ${less} uses less fuel for each seat it fills.` : '' }), done:qs.ok ? `✓ **${oneDp(want)} L** a seat` : '' }; } },

  /* P4: the route that opens today (Madrid): possible ticket revenue a day */
  ticketRevenueLong:{ plan:() => { const d = S.day || 1, mine = c1WiRows({}).rows.map(x => x.id), R = routesOpening(d).filter(r => !mine.includes(r.id) && routeOpen(r, d));
      const r = R.sort((a, b) => routeKm(b) - routeKm(a))[0]; return r ? { id:r.id } : null; },
    make:(Q, qs) => { const r = routeById(Q.d.id), fare = r.basePrice, want0 = Math.round(paxWant(r, fare)), want = want0 * fare, V = { city:r.city, km:num(Math.round(routeKm(r))), fare:money(fare) };
      const rows = [{ r:1, t:'hdr' }, { r:2, label:'Who wants to fly a day', ic:'person' }, { r:3, label:'Fare', ic:'tag' }, { r:4, label:'Possible ticket revenue a day', ic:'coins', gold:true, t:'tot' }];
      const v = { B2:{ t:num(want0), f:true }, B3:{ t:money(fare) } };
      const s = paper(Q, qs, { title:`What could ${r.city} take in a day?`, tgt:'B4', refs:['B2', 'B3'], ops:['×'], words:'Who wants to fly × Fare', want, rel:'ticketRevenue',
        doc:`Possible revenue: ${r.city} at ${money(fare)}`, question:`${num(want0)} × ${money(fare)}`, vals:[want0, fare], answerText:money(want) });
      if(qs.ok) v.B4 = { t:money(want) };
      return { T:TQ('pauseq.ticketRevenueLong', V), sp:sheet(Q, { cols:[{ c:'B', w:170, top:`${V.km} km`, main:r.city }], rows, v, sums:[s], act:qs.ok ? null : s, doneF:done1(s, qs),
        doneLine:qs.ok ? `Possible, if you had the seats and a plane with the range. Add a route › in the Studio.` : '' }), done:qs.ok ? `✓ **${money(want)}** a day, possible` : '' }; } },

  /* P5, then about every third pause: how far last week was from the plan */
  projectedVsActual:{ plan:() => { const L = c1qLast(); return L && L.projected !== null && L.projected !== undefined ? {} : null; },
    chosen:() => { const L = c1qLast(); if(L) c1DifferenceAsked(L.to); },
    make:(Q, qs) => { const L = c1qLast() || Q.d.L, proj = L.projected, tot = L.total, want = Math.abs(tot - proj), V = { period:periodWords(L), proj:money(proj), total:money(tot) };
      const rows = [{ r:1, t:'hdr' }, { r:2, label:'Projected on Monday', ic:'note' }, { r:3, label:`Profit, ${periodWords(L)}`, ic:'coins' }, { r:4, label:'Difference from the plan', ic:'scale', gold:true, t:'tot' }];
      const v = { B2:{ t:money(proj) }, B3:{ t:money(tot), cls:tot < 0 ? 'soft' : '' } }, big = proj >= tot ? 'B2' : 'B3', small = big === 'B2' ? 'B3' : 'B2';
      const s = paper(Q, qs, { title:`How far was ${periodWords(L)} from the plan?`, tgt:'B4', refs:[big, small], ops:['−'], words:big === 'B2' ? 'Projected − Profit' : 'Profit − Projected', want, rel:'projectedVsActual',
        doc:`${capFirst(periodWords(L))}: planned against what happened`, question:`${money(Math.max(proj, tot))} − ${money(Math.min(proj, tot))}`, vals:[Math.max(proj, tot), Math.min(proj, tot)], answerText:money(want) });
      if(qs.ok) v.B4 = { t:want === 0 ? 'On plan' : `${money(want)} ${tot > proj ? 'better' : 'worse'}`, cls:tot > proj ? 'pos' : '' };
      return { T:TQ('pauseq.projectedVsActual', V), sp:sheet(Q, { cols:[{ c:'B', w:170, top:fmtRange(L.from, L.to), main:capFirst(periodWords(L)) }], rows, v, sums:[s], act:qs.ok ? null : s, doneF:done1(s, qs),
        doneLine:qs.ok ? (tot > proj ? `${money(want)} better than the plan.` : tot < proj ? `${money(want)} short of the plan.` : 'Exactly on plan.') : '' }), done:qs.ok ? `✓ **${money(want)}**` : '' }; } },

  /* ReviewQuestions in turn, on last week's days (a month uses the range or the seats filled) */
  reviewRotation:{ plan:() => { const L = c1qLast(); if(!L || !L.days.length) return null; let rot = c1RotFor({ from:L.from });
      const P = L.days.map(x => x.p), tie = v => P.filter(x => x === v).length > 1;   // two days on the same profit: "which day?" has two answers, so the range
      if(/_day$/.test(rot) && (L.days.length > 7 || tie(rot === 'best_day' ? Math.max(...P) : Math.min(...P)))) rot = 'range'; return { rot }; },
    make:(Q, qs) => { const L = c1qLast(), rot = Q.d.rot, RQ = C1_RQ(rot), pr = L.days.map((x, k) => ({ d:x.d, p:x.p, ref:'B' + (k + 2) }));
      const best = pr.slice().sort((a, b) => b.p - a.p || a.d - b.d)[0], worst = pr.slice().sort((a, b) => a.p - b.p || a.d - b.d)[0], key = `pq:${Q.id}:${Q.day}`;
      const QW = { best_day:'Which day made the most profit?', worst_day:'Which day made the least profit?', range:'What is the difference between the best and the worst day?', load_factor:`What share of seats were filled in ${periodWords(L)}?` };
      const V = { q:RQ.question || QW[rot] || '', period:periodWords(L), from:dateShort(L.from), to:dateShort(L.to) };
      const rows = [{ r:1, t:'hdr' }], v = {}; let s = null, r = 2, ans = '';
      const recPick = (good, raw, want, txt) => { try{ const e = recOpen(key, { type:'calc', relKey:'readingTable', doc:`${capFirst(periodWords(L))}: ${RQ.question || rot}`, ask:RQ.question || '', question:RQ.question || '', unit:'', correct:want, correctText:txt, level:'Calculate' });
        recAttempt(e, { ok:good, text:String(raw) }); if(good) e.status = 'checked'; }catch(x){} };
      if(rot === 'best_day' || rot === 'worst_day'){ const tg = rot === 'best_day' ? best : worst, lab = rot === 'best_day' ? 'Best day' : 'Worst day';
        pr.forEach(x => { rows.push({ r:r++, label:rbShort(x.d), ic:'cal' }); v[x.ref] = { t:money(x.p), cls:x.p < 0 ? 'soft' : '' }; });
        const rr = r++; rows.push({ r:rr, label:lab, ic:'chart', gold:true, t:'tot' }); ans = `${rbShort(tg.d)} · ${money(tg.p)}`; if(qs.ok) v['B' + rr] = { t:ans };
        s = { id:key, kind:'pq:rot', title:RQ.question || (rot === 'best_day' ? 'Which day made the most profit?' : 'Which day made the least profit?'), tgt:'B' + rr, refs:[tg.ref], ops:[], words:lab, how:'formula', pick:true, done:!!qs.ok, built:!!qs.ok, unit:'',
          lit:['B', 2, 'B', rr - 1], want:tg.p, recKey:key, get no(){ return sumNo(key); }, recO:{ type:'calc', relKey:'readingTable', doc:`${capFirst(periodWords(L))}: ${lab}`, level:'Calculate' },
          why:ref => { const x = pr.find(z => z.ref === ref); return x ? `${rbShort(x.d)} made ${money(x.p)}. ${rot === 'best_day' ? 'Is there a day that made more?' : 'Is there a day that made less?'}` : 'Click a day\'s profit in column B.'; },
          answer:() => { qs.ok = true; recPick(true, rbShort(tg.d), tg.p, ans); save(); return { ok:true }; },
          lineBuild:`Click the day that made ${rot === 'best_day' ? 'the most' : 'the least'} profit.`, answerText:ans, signal:'pick' }; }
      else if(rot === 'range'){ const rb = r++, rw = r++, rr = r++, want = best.p - worst.p; ans = money(want);
        rows.push({ r:rb, label:`Best day (${rbShort(best.d)})`, ic:'chart' }, { r:rw, label:`Worst day (${rbShort(worst.d)})`, ic:'chart' }, { r:rr, label:'Range: best − worst', ic:'scale', gold:true, t:'tot' });
        v['B' + rb] = { t:money(best.p), f:true }; v['B' + rw] = { t:money(worst.p), f:true, cls:worst.p < 0 ? 'soft' : '' }; if(qs.ok) v['B' + rr] = { t:ans };
        s = paper(Q, qs, { title:RQ.question || 'What is the difference between the best and the worst day?', tgt:'B' + rr, refs:['B' + rb, 'B' + rw], ops:['−'], words:'Best day − Worst day', want, rel:'difference',
          doc:`${capFirst(periodWords(L))}: the range`, question:`${money(best.p)} − ${money(worst.p)}`, vals:[best.p, worst.p], answerText:ans,
          hints:[{ t:`The range is how far apart they are: ${money(best.p)} − ${money(worst.p)}.` }] }); }
      else { const rp = r++, rs = r++, rr = r++, pax = L.pax || 0, seats = Math.max(1, L.seats || 1), exact = pax / seats * 100, want = Math.round(exact); ans = want + '%';
        rows.push({ r:rp, label:`Passengers, ${periodWords(L)}`, ic:'person' }, { r:rs, label:`Seats, ${periodWords(L)}`, ic:'person' }, { r:rr, label:'Seats filled (%)', ic:'chart', gold:true, t:'tot' });
        v['B' + rp] = { t:num(pax), f:true }; v['B' + rs] = { t:num(seats), f:true }; if(qs.ok) v['B' + rr] = { t:ans };
        s = paper(Q, qs, { title:RQ.question || `What share of seats were filled in ${periodWords(L)}?`, tgt:'B' + rr, refs:['B' + rp, 'B' + rs], ops:['÷'], words:'Passengers ÷ Seats, then × 100', want, alt:exact, altTol:1, unit:'%', rel:'percentage',
          doc:`${capFirst(periodWords(L))}: seats filled`, question:`${num(pax)} ÷ ${num(seats)} × 100`, vals:[pax, seats], answerText:ans,
          parse:raw => { const x = parseFloat(String(raw).replace(/[%\s,]/g, '')); return isNaN(x) ? null : x; },
          note:val => val > 100 ? 'A share of the seats can\'t be more than 100%: passengers ÷ seats, then × 100.' : `Check: ${num(pax)} ÷ ${num(seats)}, then × 100. One more try.`,
          hints:[{ t:`Passengers ÷ seats gives the share as a decimal: ${num(pax)} ÷ ${num(seats)}. Then × 100 makes it a percentage.` }] }); }
      return { T:TQ('pauseq.reviewRotation', V), sp:sheet(Q, { title:'', cols:[{ c:'B', w:170, top:fmtRange(L.from, L.to), main:capFirst(periodWords(L)) }], rows, v, sums:[s], act:qs.ok ? null : s, doneF:done1(s, qs), doneLine:qs.ok ? `✓ ${ans}` : '' }),
        done:qs.ok ? `✓ **${ans}**` : '' }; } }
};

/* ---------- choosing, when the step opens: the room left after his own plan's sums, the waiting questions first ---------- */
function c1qChoose(st){
  if(st.qs) return st.qs;
  const X = c1Ex(), d = S.day || 1; st.qs = [];
  if(!c1qOn() || !(S.phase === 'round')) return st.qs;
  const P = c1PauseOf(d), room = Math.max(0, c1Budget() - c1Asked(P, true)), due = c1qDue(d), wait = (X.qWait || []).filter(k => C1Q_IDS.includes(k));
  const cand = [...new Set(due.concat(wait))], take = [], later = [];   // this pause's own questions first (Madrid on the day it opens), then those waiting
  const tryQ = (id, list) => { if(take.some(q => q.id === id) || later.some(q => q.id === id)) return; let p = null; try{ p = C1Q[id] && C1Q[id].plan(); }catch(e){ p = null; } if(!p) return; (take.length < room ? take : list || later).push({ id, day:d, d:p }); };
  cand.forEach(id => tryQ(id));
  if(due.length && take.length < room) ['reviewRotation', 'modelChange'].forEach(id => { if(take.length < room) tryQ(id, []); });   // the pause had questions scheduled: it still asks two
  st.qs = take; st.room = room; st.mine = c1Asked(P, true);
  take.forEach(q => { try{ if(C1Q[q.id].chosen) C1Q[q.id].chosen(); }catch(e){} });
  X.qWait = later.map(q => q.id).filter(k => C1Q_WAITS.includes(k)).slice(0, 2);
  (X.qLog = X.qLog || []).push({ day:d, room, mine:st.mine, due, asked:take.map(q => q.id), waiting:X.qWait.slice() });
  if(X.qLog.length > 40) X.qLog = X.qLog.slice(-40);
  save(); return st.qs;
}
/* a pause with nothing to ask skips the step */
const c1qEnter0 = enterStep;
enterStep = function(){ const st = step();
  if(st && st.t === 'c1q'){ c1qChoose(st); if(!st.qs.length && S.si < S.steps.length - 1){ S.si++; return enterStep.apply(this, arguments); } }
  return c1qEnter0.apply(this, arguments); };

/* ---------- the page ---------- */
R.c1q = st => {
  c1qChoose(st); const qs = st.qs;
  if(!qs.length){ screen().innerHTML = shell('<div class="dp"></div>', deskBar('', '')); setTimeout(() => { if(step() === st) next(); }, 0); return; }
  st.s = st.s || {}; let i = Math.min(st.i || 0, qs.length - 1);
  const Q = qs[i], qS = st.s[Q.id + ':' + Q.day] || (st.s[Q.id + ':' + Q.day] = {}), M = C1Q[Q.id].make(Q, qS), n = weekNo(S.day || 1), k = qs.length, last = i >= k - 1;
  if(UI.ashJust && /^pq:/.test(UI.ashJust.sheet || '')) UI.ashJust = null;
  const sp = M.sp, a = sp && sp.act, isDone = !!(sp && !a), P = TQ('pauseq.page', { n, i:i + 1, k, w:'question' }), F = TQ('pauseq.footer', { n });
  const waits = (c1Ex().qWait || []).length && st.mine > 0 ? `<p class="c1q-wait">${h21Html(P.text[1] || '')}</p>` : '';
  const pick = M.pick ? `<div class="c1q-pick">${M.pick.map((s2, j) => { const r = routeById(s2.id); return `<button class="bv-btn" data-c1qpick="${j}">${esc(r.city)}: ${money(s2.f0)} → <b>${money(s2.f1)}</b></button>`; }).join('')}</div>` : '';
  const wi = M.wi && isDone ? `<p class="c1q-wi"><button class="op2-a" data-c1wigo>What if ›</button> try any fare on the What if sheet.</p>` : '';
  const ctx = `<section class="bv-panel support c1q-ctx"><p class="bv-eyebrow">${esc(M.T.eyebrow || '')}${M.T.eyebrow ? ' · ' : ''}${esc(`QUESTION ${i + 1} OF ${k}`)}</p><h2>${esc(M.T.title)}</h2>${M.T.text.map(t => `<p>${c1Html(t)}</p>`).join('')}${pick}${wi}${waits}</section>`;
  let ins = '';
  if(a) ins = a.pick ? c1SignalHtml({ kind:'build', title:a.title, lines:[esc(a.lineBuild || ''), 'The sheet fills in the day.'] }) : c1SignalHtml({ kind:'paper', title:a.title, lines:c1PaperLines(a.no, a.tgt) });
  else if(isDone) ins = c1DoneHtml(M.done, sp.sums[0].tgt);
  const mid = sp ? ashHtml(sp) : '';
  const body = `<div class="bv rv2 rbw ash-rv c1-rv c1q ${a || M.pick ? 'c1-busy' : ''}"><div class="rv2-col rv2-what">${ctx}</div><div class="rv2-col rv2-mid">${mid}</div><div class="rv2-col rv2-ins c1-ins">${ins}</div></div>`;
  const btn = !isDone ? '' : last ? `<button class="bv-btn go big" id="nx">${esc((F.button || 'Carry on ▶').replace('▶', '').trim())} &#9654;</button>` : `<button class="bv-btn primary big" id="c1qNext">${esc((P.button || 'Next question ▶').replace('▶', '').trim())} &#9654;</button>`;
  screen().innerHTML = shell(deskPage({ title:P.title, sub:P.text[0] || '', cls:'rbw-page rv-page rv2-page ash-rvp c1-rvp c1q-page', body }), deskBar(F.text[0] || '', btn));
  if(sp){ ashBind(sp); const root = screen(), grid = root.querySelector(`[data-ash="${CSS.escape(sp.id)}"]`), cell = ref => grid && grid.querySelector(`.ash-c[data-ref="${ref}"]`);
    if(grid) c1BarEnter(sp, grid);
    const sig = root.querySelector('.c1-ins [data-c1sig]'); if(sig && a) c1Place(sig, cell(a.tgt), 'side', { x:0 });
    root.querySelectorAll('.c1-ins [data-c1done]').forEach(el => { const c = cell(el.getAttribute('data-c1done')); if(c){ c1Place(el, c, 'side', { x:0 }); c.classList.add('c1-ok'); } }); }
  screen().querySelectorAll('[data-c1qpick]').forEach(b => b.onclick = () => { qS.pick = M.pick[+b.getAttribute('data-c1qpick')]; save(); render(); });
  on('c1qNext', () => { st.i = i + 1; UI.ashJust = null; resetEntry(); UI.justDone = null; save(); render(); });
  on('nx', () => { UI.ashJust = null; resetEntry(); UI.justDone = null; next(); });
};

/* ---------- the step on every Monday of chapter one: after the plan's own sums, before the Fuel desk and the check ---------- */
const c1qIns = st => { if(!c1qOn() || !Array.isArray(st) || st.some(x => x.t === 'c1q')) return st;
  const i = st.findIndex(x => x.t === 'workings'), j = i >= 0 ? i + 1 : st.findIndex(x => ['fuelDesk', 'c1check', 'ready'].includes(x.t)); if(j < 0) return st;
  const out = st.slice(); out.splice(j, 0, { t:'c1q' }); return out; };
const c1qDS0 = daySteps;
daySteps = function(n, w){ const st = c1qDS0.apply(this, arguments), r = w || roundData(n) || {}, d = beatDay(n);
  return d > 1 && ch1(d) && r.weekPhase === 'plan' && S.oneOffDay !== d ? c1qIns(st) : st; };
const c1qSF0 = stepsFor;
stepsFor = function(b){ const st = c1qSF0.apply(this, arguments), w = roundData(b) || {};
  return ['week', 'month'].includes(w.period) && ch1(beatDay(b)) ? c1qIns(st) : st; };

/* ---------- Sunday's close keeps the week's accounts for Monday's questions ---------- */
const c1qClose0 = closeDay;
closeDay = function(){ try{ if(ch1() && S.wk && S.wk.from && weekPhaseOf(S.round) === 'review'){ const W = S.wk, h = weekSummary(W), days = (W.rows || []).map(x => ({ d:x.d, p:Math.round(x.profit || 0) }));
    c1Ex().lastAcc = { wk:weekNo(W.from), from:W.from, to:W.from + 6, type:'week', days, total:days.reduce((t, x) => t + x.p, 0), projected:W.projected ? Math.round(W.projected) : null, pax:h.pax || 0, seats:h.seats || 0 }; } }catch(e){}
  return c1qClose0.apply(this, arguments); };

/* the toolkit: the pick and the next question are steps too */
if(window.__tkSums){ window.__tkSums.unshift({ what:'pick a change', test:() => !!document.querySelector('[data-c1qpick]'), plan:() => ({ at:'[data-c1qpick]', value:'the first change', go:() => document.querySelector('[data-c1qpick]').click() }) });
  window.__tkSums.unshift({ what:'the next question', test:() => !!document.getElementById('c1qNext'), plan:() => ({ at:'#c1qNext', value:'Next question', go:() => document.getElementById('c1qNext').click() }) }); }
const c1qLabel0 = window.__pnLabel;
window.__pnLabel = t => t === 'c1q' ? 'Finance\'s questions' : (c1qLabel0 ? c1qLabel0(t) : null);
window.__c1q = { due:c1qDue, last:c1qLast, log:() => (c1Ex().qLog || []), wait:() => (c1Ex().qWait || []) };
}
