/* ==================================================================
   CHAPTER 4 "The ultimate plane" (Workbook v5.5, D82–D85; Fable's change note of 14 Oct 2026), push 1.
   - Chapter 3's review is Tuesday 31 August 2032 and chapter 4 opens on Monday 6 September: the days between fly the
     standing plan by themselves, as Christmas does between chapters 1 and 2 ("The end of the summer").
   - Monday 6 September (day 736): what's new (the A380, finance, does it fill?), then the A380 offer (Events a380_offer,
     its EventOptions rows) on a page of its own: the A380 and the 747 side by side on Hong Kong and Los Angeles, whether
     each one fills (the passengers the model flies ÷ the seats, with the filled-aircraft graphic), the deposit and the
     payment, and the profit a day before and after the payments. Take the A380, take the 747, or neither (the offer stays
     on the Fleet desk). Taking one goes to the pay page with Finance chosen.
   - Finance is monthly from financeFromDate (financeShape; Finance sheet monthlyPayment and months): the deposit today,
     then a round payment on the first of each month, taken from cash before anything else on that day ("Finance: A380
     £1,000,000 (month 7 of 40)"). Payments are not a day cost. The first finance is a Calculate sign-off in two steps
     (price − deposit; ÷ the months; then the check: months × payment + deposit = price), a Build after that, with the
     answer boxes, sum numbers and two tries of D86.
   - Each month's review shows the big plane's fill month by month (a380FillQuestion).
   - The A380 launch campaign (D82): the hooks only. A Project button on HQ from campaignProjectDate once a big plane is in
     the fleet; the run waits while the pupil works on it; the choices and the portfolio are kept (text in the save, the
     pictures in this browser only); campaignDemand(route, day) applies a result from the launch date once one is scored.
   - Hunt h5 at the chapter review: the finance line on the year-3 accounts, one payment too many.
   Not in push 1: storm3 and ash_cloud3 are headlines until storm2 and ash_cloud2 have their mechanics (chapter 3 push 2);
   challenge 6 waits with challenges 3–5; Red Kite's A380 (March 2033) is its news item.
   Functions shared with the main game are reassigned here, never redeclared.
   ================================================================== */
const CH4 = CHAPTERS.find(c => c.chapter === 4) || null, CH4_DAY = CH4 ? dayOfDate(CH4.start) : null;
const ch4Now = d => !!(CH4_DAY && S && ((d === undefined ? S.day : d) || 1) >= CH4_DAY);
const monthsWord = n => `${num(n)} month${n === 1 ? '' : 's'}`;
const BIG4 = ['a380', 'b747'];

/* ---------- 1. the end of the summer, the first day's page and the offer ---------- */
if(typeof ROW_EVENTS !== 'undefined' && !ROW_EVENTS.includes('a380_offer')) ROW_EVENTS.push('a380_offer');
function ch4PatchBeats(){ if(!CH4_DAY) return;
  (WORLD.rounds || []).forEach(w => {
    if(w.holiday && w.day < CH4_DAY && w.day > CH4_DAY - 14){ w.title = 'The end of the summer'; w.headline = `The end of the summer: the standing plan flies ${fmtRange(w.day, CH4_DAY - 1)} by itself. Chapter 4 opens on Monday.`; w.news = [w.headline]; w.gapCh = 4; }
    if(w.day === CH4_DAY && w.period === 'day' && !w.intro) w.intro = 'ultimate';
    if(w.eventId === 'a380_offer' && typeof rowEvent === 'function') w.event = rowEvent('a380_offer'); }); }
ch4PatchBeats();
const buildBeatsC4 = buildBeats;
buildBeats = function(){ buildBeatsC4.apply(this, arguments); ch4PatchBeats(); };
const gapNow4 = () => typeof holidayNow === 'function' && holidayNow() && !!roundData(S.round).gapCh;
const PWc4 = PW;
PW = function(){ if(gapNow4()) return { now:'at the end of the summer', poss:"The end of the summer's", the:"the end of the summer's", span:'gap' }; return PWc4(); };
const planWordC4 = planWord;
planWord = function(){ return gapNow4() && S.period ? `Fly ${fmtRange(S.period.from, S.period.to)}` : planWordC4(); };
const closeWordC4 = closeWord;
closeWord = function(){ return gapNow4() ? 'On to chapter 4' : closeWordC4(); };

/* ---------- 2. monthly finance ---------- */
const shopOfferC4 = shopOffer;
shopOffer = function(p, day){ const o = shopOfferC4(p, day); if(o.unit === 'month'){ o.monthly = o.pay; o.left = o.n; o.daily = Math.round((o.pay || 0) * 12 / 365); } return o; };
function finSchedule(f, p, o){
  const C = charges(); let d = monthEnd(S.day) + 1;   // the first of next month
  for(let k = 1; k <= o.n; k++){ C.due.push({ ev:'fin:' + f.uid, at:S.day, day:d, amount:o.pay, what:`Finance: ${shortPlane(p)} ${money(o.pay)} (month ${k} of ${o.n})`, fin:f.uid, k }); d = monthEnd(d) + 1; }
}
const acquireC4 = acquirePlane;
acquirePlane = function(p, kind){
  const o = shopOffer(p), uid = acquireC4(p, kind), f = S.fleet.find(x => x.uid === uid);
  if(kind === 'finance' && o.unit === 'month' && f){ f.terms = Object.assign(f.terms || {}, { kind:'finance', daily:0, unit:'month', monthly:o.pay, months:o.n, left:o.n, deposit:o.deposit, price:o.price }); finSchedule(f, p, o);
  }
  return uid;
};
/* a monthly plane's payments are charges on the first of the month, not a daily countdown */
const payFinanceDayC4 = payFinanceDay;
payFinanceDay = function(){ const keep = S.fleet.filter(f => f.terms && f.terms.unit === 'month').map(f => [f, f.terms.left]); payFinanceDayC4(); keep.forEach(([f, n]) => { f.terms.left = n; }); };
function finPaid(f){ return ((S.charges && S.charges.due) || []).filter(c => c.fin === f.uid && c.day < (S.day || 1)).length; }
const termsWordC4 = termsWord;
termsWord = function(t){ if(t && t.kind === 'finance' && t.unit === 'month'){ const f = S.fleet.find(x => x.terms === t), paid = f ? finPaid(f) : 0;
  return `on finance: ${money(t.monthly)} a month, ${t.months - paid} of ${t.months} payments to go`; } return termsWordC4(t); };
/* the pay page: the Finance column for a monthly plane, and the finance sum before the button */
const finDue = pid => !(skills().finance && skills().finance.count > 0);
function finSt(st){ return st.fin || (st.fin = { v1:'', v2:'', ok1:false, ok2:false, q1:false, q2:false, msg1:'', msg2:'', tokens:[], tries1:0, tries2:0, triesB:0, lines:[] }); }
function finCardHtml(st, p, o){
  const F = finSt(st), level = st.finLevel || (st.finLevel = finDue(p.id) ? 'calc' : 'build'), done = !!st.finOk, still = o.price - o.deposit, key = 'fin:' + p.id;
  const stamp = done ? (F.shown ? FIN_STAMP : cardStampHtml('ok')) : (F.q1 || F.q2 || F.qb) ? cardStampHtml('q') : '';
  const head = `<div class="sc-h"><span class="sc-n">✓</span><div><h2>What does the finance cost each month?</h2><p>${level === 'calc' ? 'Sign this off: what is still to pay after the deposit, then the same payment each month.' : 'Show how to find the monthly payment; the game works it out.'}</p></div><span class="so-lv ${level}">${level === 'calc' ? 'Calculate' : 'Build'}</span>${stamp}</div>`;
  const facts = `<p class="sc-note">Price ${money(o.price)} · deposit ${money(o.deposit)} · ${monthsWord(o.n)} of equal payments, no interest.</p>`, sh = typeof sumHeadHtml === 'function' && paperOn() ? sumHeadHtml(key, `Finance: ${shortPlane(p)}`) : '';
  const check = `<p class="acq-ans">The check: ${num(o.n)} × ${money(o.pay)} + ${money(o.deposit)} = <b>${money(o.n * o.pay + o.deposit)}</b>, the price. No interest.</p>`;
  if(done) return `<section class="dk-pnl acq-rb fin-card ok">${head}${sh}${facts}<p class="acq-ans"><b>${money(o.price)} − ${money(o.deposit)} = ${money(still)}</b>; <b>${money(still)} ÷ ${num(o.n)} = ${money(o.pay)}</b> a month.</p>${check}</section>`;
  if(level === 'build'){
    const figs = [['price', 'Price', o.price], ['dep', 'Deposit', o.deposit], ['still', 'Still to pay', still], ['n', 'Months', o.n]], tok = t => OPS4.includes(t) ? `<i class="rb-op">${t}</i>` : (x => x ? `<span class="rb-tk">${x[1]} <b>${x[0] === 'n' ? num(x[2]) : money(x[2])}</b></span>` : '')(figs.find(z => z[0] === t));
    return `<section class="dk-pnl acq-rb rb-card fin-card">${head}${sh}${facts}<div class="rb-bar">${F.tokens.length ? F.tokens.map(tok).join('') : '<span class="rb-ph">Tap a figure, the operation, then a figure</span>'}<span class="rb-eq">=</span><b class="rb-res">?</b></div>
      <div class="rb-chips">${figs.map(([k, l, v]) => `<button class="rb-chip" data-finfig="${k}">${l}<b>${k === 'n' ? num(v) : money(v)}</b></button>`).join('')}</div>
      <div class="rb-ops">${OPS4.map(x => `<button data-finop="${x}">${x}</button>`).join('')}<button class="dk-link" data-finundo="1">Undo</button><span class="grow"></span><button class="btn primary rb-chk" id="finBuildChk">Check ✓</button></div>
      <p class="sc-msg rb-msg" role="status">${esc(F.msgB || '')}</p></section>`;
  }
  const s1 = F.ok1 ? `<p class="acq-ans"><b>${money(o.price)} − ${money(o.deposit)} = ${money(still)}</b> still to pay ✓</p>`
    : `<div class="acq-in"><span class="mono">Still to pay: ${money(o.price)} − ${money(o.deposit)} =</span><span class="sc-in ${F.q1 ? 'qy' : ''}"><i class="pre">£</i><input data-pad="fin1" inputmode="decimal" autocomplete="off" value="${esc(F.v1)}" aria-label="Still to pay"></span><button class="btn primary" id="fin1Chk">Check ✓</button><span class="sc-msg" role="status">${esc(F.msg1 || '')}</span></div>`;
  const s2 = !F.ok1 ? '<p class="sc-note later">Then: still to pay ÷ the months.</p>'
    : `<div class="acq-in"><span class="mono">A month: ${money(still)} ÷ ${num(o.n)} =</span><span class="sc-in ${F.q2 ? 'qy' : ''}"><i class="pre">£</i><input data-pad="fin2" inputmode="decimal" autocomplete="off" value="${esc(F.v2)}" aria-label="A month"></span><button class="btn primary" id="fin2Chk">Check ✓</button><span class="sc-msg" role="status">${esc(F.msg2 || '')}</span></div>`;
  return `<section class="dk-pnl acq-rb ta-card fin-card">${head}${sh}${facts}${paperOn() ? paperNote(sumNo(key)) : ''}<div class="so-pre ${F.ok1 ? 'ok' : ''}"><span class="sc-sn">Step 1</span>${s1}</div><div class="so-pre ${F.ok1 ? '' : 'later'}"><span class="sc-sn">Step 2</span>${s2}</div></section>`;
}
function finRecord(p, o, level, a){ try{ const e = recOpen('fin:' + p.id, { type:level === 'calc' ? 'calc' : 'build', relKey:'finance', doc:`Finance: ${p.name}`, ask:'What does the finance cost each month?', question:`(${money(o.price)} − ${money(o.deposit)}) ÷ ${num(o.n)}`,
  unit:'£', correct:o.pay, correctText:money(o.pay), ops:[o.price - o.deposit, o.n], op:'÷', level:level === 'calc' ? 'Calculate' : 'Build' }); recAttempt(e, a); return e; }catch(e){ return null; } }
function finDone(st, p, o, level){ st.finOk = true; const x = soTouch('finance', { plane:p.id, count:level === 'calc' }); if(level !== 'calc') x.builds = (x.builds || 0) + 1; soLog(`Finance: ${p.name} (${level === 'calc' ? 'Calculate' : 'Build'})`); }
function finBind(st, p, o){
  const F = finSt(st), still = o.price - o.deposit, level = st.finLevel, root = screen(), key = 'fin:' + p.id;
  const i1 = root.querySelector('[data-pad="fin1"]'), i2 = root.querySelector('[data-pad="fin2"]');
  if(i1){ i1.oninput = () => { F.v1 = i1.value; }; i1.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); $('fin1Chk').click(); } }; }
  if(i2){ i2.oninput = () => { F.v2 = i2.value; }; i2.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); $('fin2Chk').click(); } }; }
  const two = () => typeof twoTriesOn === 'function' && paperOn() && twoTriesOn();
  on('fin1Chk', () => { const v = padNum(F.v1); if(v === null){ F.msg1 = 'Type the amount in pounds.'; render(); return; } const ok = Math.abs(v - still) < 0.5;
    F.lines.push({ lab:`Still to pay: ${money(o.price)} − ${money(o.deposit)}`, typed:String(F.v1).trim(), want:money(still), wantV:still * 100, unit:'£', ok });
    if(ok){ F.ok1 = true; F.q1 = false; F.msg1 = ''; render(); return; }
    F.tries1++; if(F.tries1 >= 2 && two()){ F.ok1 = true; F.q1 = false; F.shown = true; F.v1 = String(still); render(); return; }
    F.q1 = true; F.msg1 = `Query: ${v === o.price + o.deposit ? 'that adds them: still to pay is the price take away the deposit.' : paperOn() ? paperWrongNote(v, still, '£', '−', [o.price, o.deposit]) : `${v > still ? 'too much' : 'too little'}.`}${two() ? ' One more try.' : ''}`; render(); });
  on('fin2Chk', () => { const v = padNum(F.v2); if(v === null){ F.msg2 = 'Type the amount in pounds.'; render(); return; } const ok = Math.abs(v - o.pay) < 0.5;
    if(ok){ finRecord(p, o, 'calc', { ok:true, given:String(F.v2), value:v, working:F.lines.slice(), method:'subtract the deposit; divide by the months; multiply back to check' }); F.q2 = false; F.msg2 = ''; finDone(st, p, o, 'calc'); render(); return; }
    F.tries2++; const note = paperOn() ? paperWrongNote(v, o.pay, '£', '÷', [still, o.n]) : `${v > o.pay ? 'too much' : 'too little'}.`;
    finRecord(p, o, 'calc', { ok:false, given:String(F.v2), value:v, working:F.lines.slice(), method:'subtract the deposit; divide by the months; multiply back to check', note });
    if(F.tries2 >= 2 && two()){ if(typeof paperRecShown === 'function') paperRecShown(key); F.shown = true; finDone(st, p, o, 'calc'); render(); return; }
    F.q2 = true; F.msg2 = `Query: ${note} Check: ${num(o.n)} × your answer + ${money(o.deposit)} should make ${money(o.price)}.${two() ? ' One more try.' : ''}`; render(); });
  root.querySelectorAll('[data-finfig]').forEach(b => b.onclick = () => { if(F.tokens.length % 2 === 1){ F.msgB = 'Put the operation between the figures.'; render(); return; } F.tokens.push(b.getAttribute('data-finfig')); F.msgB = ''; render(); });
  root.querySelectorAll('[data-finop]').forEach(b => b.onclick = () => { if(F.tokens.length % 2 === 0){ F.msgB = 'Start with a figure.'; render(); return; } F.tokens.push(b.getAttribute('data-finop')); render(); });
  const u = root.querySelector('[data-finundo]'); if(u) u.onclick = () => { F.tokens.pop(); F.msgB = ''; render(); };
  on('finBuildChk', () => { const k = F.tokens.join(' '), ok = k === 'still ÷ n', chips = F.tokens.map(t => OPS4.includes(t) ? { op:t } : { label:{ price:'Price', dep:'Deposit', still:'Still to pay', n:'Months' }[t], k:t });
    if(ok){ finRecord(p, o, 'build', { ok:true, chips, method:'choose the figures and the operation' }); finDone(st, p, o, 'build'); render(); return; }
    const msg = k === 'price ÷ n' ? 'That shares the whole price, but the deposit is paid today: share what is still to pay.' : /×/.test(k) ? 'Each month pays an equal share: which operation shares?' : 'Use what is still to pay and the months.';
    finRecord(p, o, 'build', { ok:false, chips, msg, note:msg, method:'choose the figures and the operation' }); F.triesB++;
    if(F.triesB >= 2 && two()){ if(typeof paperRecShown === 'function') paperRecShown(key); F.shown = true; F.tokens = ['still', '÷', 'n']; finDone(st, p, o, 'build'); render(); return; }
    F.qb = true; F.tokens = []; F.msgB = `Query: ${msg}${two() ? ' One more try.' : ''}`; render(); });
}
const renderAcPayC4 = renderAcPay;
renderAcPay = function(st){
  renderAcPayC4(st); const ch = S.rnd.acChoice; if(!ch) return; const p = planeById(ch.pid), o = acOffer(ch.pid); if(o.unit !== 'month') return;
  const root = screen(), fc = root.querySelector('[data-terms="finance"]');
  if(fc){ fc.querySelectorAll('.acq-r').forEach(r => { const l = r.querySelector('span'), b = r.querySelector('b'); if(!l || !b) return;
    if(/Total paid after 30 days/.test(l.textContent)){ l.textContent = 'Total paid after a month'; b.innerHTML = `${money(o.deposit + o.pay)}<small>${money(o.deposit)} today + 1 month × ${money(o.pay)}</small>`; }
    if(/Extra profit a day after payments/.test(l.textContent)){ const v = ch.extra - o.daily; b.className = v >= 0 ? 'good' : 'bad'; b.innerHTML = `${v >= 0 ? '+' : '−'}${money(Math.abs(Math.round(v)))}<small>${ch.extra >= 0 ? '+' : '−'}${money(Math.abs(ch.extra))} − ${money(o.pay)} × 12 ÷ 365 (about ${money(o.daily)} a day)</small>`; } }); }
  if(st.pick !== 'finance' || !o.canFinance) return;
  const cols = root.querySelector('.acq-cols'); if(cols) cols.insertAdjacentHTML('beforebegin', finCardHtml(st, p, o));   // the sum to do now, above the three ways to pay
  finBind(st, p, o);
  const nx = $('nx'); if(nx && !st.finOk){ nx.disabled = true; nx.innerHTML = 'Work out the monthly payment first &#9654;'; }
  const i = root.querySelector('[data-pad="fin1"], [data-pad="fin2"]'); if(i && !st.finOk) setTimeout(() => { try{ i.focus(); }catch(e){} }, 40);
};

/* ---------- 3. the offer page: the A380 and the 747 on Hong Kong and Los Angeles ---------- */
const OFFER_ROUTES = ['hkg', 'lax'];
/* a big plane's own day on a route at a fare (Balance Report §2: per day after its day cost, before finance): an overnight
   rotation earns on its out day and costs its day cost on both, so the rotation's days are averaged. o.alone: the plane by
   itself (the other aircraft off the route make no difference); o.stars, o.day: the conditions */
function bigFares(pid, rid, fares, o){
  o = o || {}; const r = routeById(rid), p = planeById(pid); if(!r || !p || !planeCanFly(p, r)) return [];
  return dryRun(() => { if(o.stars !== undefined) S.rep = o.stars;
    if(o.plain) S.atype = null;   // no Value bag fees or Premium fare effects: the Balance Report's neutral airline
    const d0 = o.day || S.day || 1, wr = ((WB && WB.routes) || []).find(x => x.id === rid) || {}, nd = Math.max(1, r.rotationDays || wr.rotationDays || (r.rotation === 'overnight' ? 2 : 1)), cur = JSON.parse(JSON.stringify(currentPlan())); if(o.onboard) cur.onboard = o.onboard;
    const base = o.alone || o.onboard ? normPlan(Object.assign(cur, { fleet:cur.fleet.map(x => Object.assign({}, x, { sched:x.sched.filter(id => id !== rid), deps:null })) })) : acBasePlan(rid);
    S.fleet = S.fleet.filter(x => x.uid !== AC_NEW); const B = []; for(let d = d0; d < d0 + nd; d++) B.push(atDay(d, () => planLines(base).v.profit));   // before the plane exists: its day cost counts against it
    S.fleet.push({ uid:AC_NEW, planeId:pid, route:null, schedule:[], deps:null, layout:'standard', grounded:false });
    return (fares || r.fares || [r.basePrice]).map(fare => { const pl = normPlan(Object.assign({}, base, { prices:Object.assign({}, base.prices, { [rid]:fare }), fleet:base.fleet.concat([{ uid:AC_NEW, planeId:pid, sched:[rid], deps:null }]) }));
      let own = 0, pax = 0, seats = 0; for(let d = d0, k = 0; d < d0 + nd; d++, k++) atDay(d, () => { own += planLines(pl).v.profit - B[k]; withPlan(pl, () => planFlights()).filter(z => z.uid === AC_NEW && !z.homeLeg).forEach(z => { pax += z.sold; seats += z.seats; }); });
      return { pid, rid, fare, perDay:Math.round(own / nd), pax, seats, want:atDay(d0, () => paxFor(r, fare)) }; }); });
}
const bigBest = (pid, rid, o) => bigFares(pid, rid, null, o).sort((a, b) => b.perDay - a.perDay)[0] || null;
/* does it fill? twenty seats, each a twentieth of the plane, lit for the passengers ÷ the seats */
function fillHtml(pax, seats, want){ const pct = seats ? Math.min(100, Math.round(100 * pax / seats)) : 0, n = 20, on = Math.round(pct / 100 * n);
  return `<div class="fill4"><div class="fill4-p" aria-label="${pct}% full">${Array.from({ length:n }, (_, k) => `<i class="${k < on ? 'on' : ''}"></i>`).join('')}</div><span><b>${num(pax)} of ${num(seats)}</b> seats · ${pct}%${want !== undefined ? ` · ${num(want)} want to fly` : ''}</span></div>`; }
function offerFigures(){
  const key = JSON.stringify([S.day, planKey(currentPlan()), S.rep]); if(UI.offer4 && UI.offer4.key === key) return UI.offer4.v;
  const v = BIG4.filter(id => planeById(id)).map(pid => { const p = planeById(pid), o = shopOffer(p);
    const routes = OFFER_ROUTES.filter(rid => routeById(rid)).map(rid => { const b = bigBest(pid, rid); return b ? { rid, fare:b.fare, n:1, deps:null, pax:b.pax, seats:b.seats, want:b.want, own:b.perDay, extra:b.perDay } : { rid }; });
    return { pid, seats:p.seats, price:o.price, deposit:o.deposit, pay:o.pay, n:o.n, daily:o.daily, canFinance:o.canFinance, routes }; });
  UI.offer4 = { key, v }; return v;
}
function renderA380Offer(st){
  const ev = S.rnd.event, F = offerFigures(), cash = Math.round(S.cash), chosen = S.rnd.eventChoice;
  const col = x => { const p = planeById(x.pid), best = x.routes.filter(r => r.own !== undefined).sort((a, b) => b.own - a.own)[0];
    return `<section class="dk-pnl off4-col"><div class="dk-pnl-h">${ICO2.plane}<h2>${esc(p.name)}</h2><span class="grow"></span><span class="sub">${x.seats} seats</span></div>
      <div class="acq-r"><span>Price</span><b>${money(x.price)}</b></div><div class="acq-r"><span>On finance</span><b>${money(x.deposit)} today<small>then ${money(x.pay)} a month for ${monthsWord(x.n)}: about ${money(x.daily)} a day</small></b></div>
      ${x.routes.map(r => { const rt = routeById(r.rid); if(r.own === undefined) return `<div class="off4-r"><h3>${esc(rt.city)}</h3><p class="muted">Cannot fly it.</p></div>`;
        return `<div class="off4-r"><h3>${esc(rt.city)} <small>at ${money(r.fare)}, the model's best fare</small></h3><p class="off4-q">Does it fill? ${num(r.pax)} ÷ ${num(r.seats)}</p>${fillHtml(r.pax, r.seats, r.want)}
          <div class="acq-r"><span>Profit a day, before the payments</span><b class="${r.own >= 0 ? 'good' : 'bad'}">${money(r.own)}</b></div><div class="acq-r"><span>After the payments</span><b class="${r.own - x.daily >= 0 ? 'good' : 'bad'}">${money(r.own - x.daily)}</b></div></div>`; }).join('')}
      ${best ? `<p class="acq-n">Best on ${esc(routeById(best.rid).city)}.</p>` : ''}</section>`; };
  const opts = (ev.options || []).map((o, k) => `<button class="btn ${k < 2 ? 'primary' : ''} big" data-off4="${k}" ${k < 2 && !(F[k] && F[k].canFinance && cash - F[k].deposit >= (WORLD.cashReserve || 0)) ? 'disabled' : ''}>${esc(o.label)}${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</button>`).join('');
  const body = `<div class="off4"><p class="acq-lead">${esc(WB_EVENTS.find(e => e.id === 'a380_offer') ? (WB_EVENTS.find(e => e.id === 'a380_offer').effects || ev.text || '') : ev.text || '')}</p>
    <div class="off4-cols">${F.map(col).join('')}</div>
    <p class="acx-note">Does it fill? The passengers the model flies at that fare ÷ the seats. Stars and growth change it: at more stars more people want to fly at each fare. Cash today ${money(cash)}.</p>
    <div class="off4-opts">${opts}</div></div>`;
  screen().innerHTML = shell(deskPage({ title:'The ultimate plane', sub:'Airbus offers you an A380 on finance. Boeing offers the 747. Or fly the big twins you have.', cls:'acq-page off4-page', body }),
    deskBar(chosen !== undefined ? 'Chosen.' : 'Compare the two, then choose. Taking one goes to the pay page with Finance chosen.', `${backBtn()}`));
  screen().querySelectorAll('[data-off4]').forEach(b => b.onclick = () => { const k = +b.getAttribute('data-off4');
    if(S.rnd.eventChoice !== undefined) undoEvent(); applyEventNow(k);
    if(k < 2 && F[k]){ const x = F[k], best = x.routes.filter(r => r.own !== undefined).sort((a, b) => b.own - a.own)[0];
      S.rnd.shopPick = x.pid; S.rnd.acChoice = { pid:x.pid, rid:best.rid, fare:best.fare, n:best.n, deps:best.deps, extra:best.extra, own:best.own };
      S.steps = S.steps.filter(z => z.t !== 'acquire'); S.steps.splice(S.si + 1, 0, { t:'acquire', pick:'finance', rbDue:false }); }   // the offer is finance: no rent-or-buy sum here (renting opens tomorrow)
    else { S.a380Open = { day:S.day }; addNews([{ tag:'FLEET', text:'The A380 offer stays open on the Fleet desk.' }]); }
    UI.justDone = null; advance(); });
}
const eventRC4 = R.event;
R.event = st => { const ev = S.rnd.event; if(ev && ev.id === 'a380_offer') return renderA380Offer(st); return eventRC4(st); };
/* the week's tests read this */
function offerPlan(){ return offerFigures(); }

/* ---------- 4. what's new on day 736 ---------- */
if(typeof INTRO !== 'undefined') INTRO.ultimate = { kicker:'New today · The ultimate plane', title:'The A380 on finance, and does it fill?', before:'event',
  words:[['Finance', 'Pay a deposit today, then the same amount every month until the price is paid. No interest.'], ['Deposit', 'The part of the price paid today.'], ['Monthly payment', 'What is still to pay after the deposit ÷ the months.'], ['Does it fill?', 'The passengers who want to fly at the fare ÷ the seats, as a percentage.']],
  what:() => { const ids = BIG4.filter(id => planeById(id)); return [[`Year three begins. ${(routesOpening(S.day) || []).map(r => r.city).join(' and ') || 'Hong Kong and Los Angeles'} open today: the only routes big enough for a 500-seat plane.`],
    `<div class="ni-cards four">${ids.map(id => { const p = planeById(id), o = shopOffer(p); return `<div class="ni-card"><em>${money(o.deposit || o.price)}</em><b>${esc(shortPlane(p))}</b><span>${p.seats} seats${o.pay ? ` · then ${money(o.pay)} a month for ${monthsWord(o.n)}` : ''}</span></div>`; }).join('')}<div class="ni-card"><em>${money(Math.round(S.cash))}</em><b>Your cash</b><span>The deposit comes out today; each payment on the first of the month.</span></div></div>`,
    ['A big plane only pays if it fills. Your stars decide how many people want to fly at each fare.']]; },
  maths:() => [niRule('(price − deposit)', '÷', 'months', 'A month'),
    `<div class="ni-eg"><p>An A380 costs <b>£60,000,000</b>: <b>£20,000,000</b> down and the rest over <b>40</b> months.</p><p>Still to pay: ${niSum('£60,000,000 − £20,000,000 = £40,000,000')}. A month: ${niSum('£40,000,000 ÷ 40 = £1,000,000')}.</p><p>The check: ${niSum('40 × £1,000,000 + £20,000,000 = £60,000,000')}.</p></div>`],
  check:{ q:'A plane costs £40,000,000: £16,000,000 down and the rest over 40 months. How much a month?', opts:[['£600,000', ''], ['£1,000,000', '£40,000,000 ÷ 40 is £1,000,000, but the deposit is paid today: share what is still to pay.'], ['£400,000', '£16,000,000 ÷ 40 shares the deposit. Still to pay is £40,000,000 − £16,000,000.']], ok:0, done:'£40,000,000 − £16,000,000 = £24,000,000; £24,000,000 ÷ 40 = £600,000 a month.' },
  think:['The A380 carries 100 more people than the 747, and costs £400,000 a month more. When is it worth it?', 'What would make more people want to fly to Hong Kong at £830?'] };

/* ---------- 5. does it fill? month by month (a380FillQuestion) ---------- */
function fill4Note(){
  const h = lastHist(); if(!h || h.type !== 'month' || !ch4Now(h.from)) return; const F = S.fill4 || (S.fill4 = []); if(F.some(x => x.from === h.from)) return;
  S.fleet.filter(f => BIG4.includes(f.planeId)).forEach(f => { const sched = (f.schedule || []).filter(Boolean); if(!sched.length) return; const rid = sched[0], x = (h.routes || {})[rid]; if(!x) return;
    const others = S.fleet.some(g => g !== f && (g.schedule || []).includes(rid)); F.push({ from:h.from, plane:f.planeId, uid:f.uid, route:rid, pax:x.pax, seats:x.seats, want:x.want, fare:x.fare, shared:others }); });
}
const closeDayC4 = closeDay;
closeDay = function(){ const r = closeDayC4.apply(this, arguments); try{ fill4Note(); }catch(e){} return r; };
function fill4Html(){ const F = (S.fill4 || []); if(!F.length) return '';
  const by = {}; F.forEach(x => { (by[x.uid] = by[x.uid] || []).push(x); });
  const rn = x => `${esc(routeById(x.route) ? routeById(x.route).city : x.route)} at ${money(x.fare || 0)}`, pc = x => x.seats ? Math.min(100, Math.round(100 * x.pax / x.seats)) : 0;
  const bar = x => { const on = Math.round(pc(x) / 10); return `<span class="fill4-p s" aria-label="${pc(x)}% full">${Array.from({ length:10 }, (_, k) => `<i class="${k < on ? 'on' : ''}"></i>`).join('')}</span>`; };
  /* one line a month, the last four months as rows and the earlier ones as a list, so the panel stays short all year */
  return Object.keys(by).map(uid => { const L = by[uid], p = planeById(L[0].plane), last = L[L.length - 1], recent = L.slice(-4), early = L.slice(0, -4), one = L.every(x => rn(x) === rn(last));
    return `<section class="dk-pnl fill4-pnl"><div class="dk-pnl-h">${ICO2.plane}<h2>Does the ${esc(shortPlane(p))} fill?</h2><span class="grow"></span><span class="sub">passengers ÷ seats</span></div><div class="fill4-b">
      <p class="fill4-l"><b>${esc(monthName(last.from))}${one ? `, ${rn(last)}` : ''}:</b> ${num(last.pax)} of ${num(last.seats)} seats, ${pc(last)}% full${last.want !== undefined ? `; ${num(last.want)} wanted to fly` : ''}.</p>
      <table class="fill4-t"><tbody>${recent.map(x => `<tr><td>${esc(monthName(x.from, true))}</td><td>${bar(x)}</td><td class="r">${pc(x)}%</td><td class="muted">${num(x.pax)} of ${num(x.seats)}${one ? '' : ` · ${rn(x)}`}</td></tr>`).join('')}</tbody></table>
      ${early.length ? `<p class="small muted">Earlier: ${early.map(x => `${esc(monthName(x.from, true))} ${pc(x)}%`).join(', ')}.</p>` : ''}${L.some(x => x.shared) ? '<p class="small muted">Shared with another aircraft on the route: the figures are the route\'s.</p>' : ''}</div></section>`; }).join(''); }
const reviewC4 = R.review;
R.review = st => { const r = reviewC4(st); try{ const h = lastHist(); if(h && h.type === 'month' && ch4Now(h.from)){ fill4Note(); const rv = screen().querySelector('.rbw-s') || screen().querySelector('.rv'); const html = fill4Html(); if(rv && html && !rv.querySelector('.fill4-pnl')) rv.insertAdjacentHTML(rv.classList.contains('rbw-s') ? 'afterbegin' : 'beforeend', html); } }catch(e){} return r; };

/* ---------- 6. hunt h5: the finance line on the year-3 accounts ---------- */
const huntListC4 = huntList;
huntList = function(){ const L = huntListC4(); (WB.hunts || []).filter(h => h.id === 'h5' && h.status !== 'placeholder' && h.date).forEach(h => { if(!L.some(x => x.id === h.id)) L.push(h); }); return L; };
const huntSpecC4 = huntSpec;
huntSpec = function(id){
  if(id !== 'h5') return huntSpecC4(id); const h = huntList().find(x => x.id === id); if(!h) return null; const day = dayOfDate(h.date);
  const f = S.fleet.find(x => x.terms && x.terms.kind === 'finance' && x.terms.unit === 'month'); if(!f) return null; const p = planeById(f.planeId), t = f.terms;
  const paid = ((S.charges && S.charges.due) || []).filter(c => c.fin === f.uid && c.day <= day).length; if(!paid) return null;
  const right = paid * t.monthly, shown = (paid + 1) * t.monthly, since = f.acquired || CH4_DAY;
  return { h:Object.assign({}, h, { pupilChecks:`Count the payments from ${monthName(charges().due.filter(c => c.fin === f.uid).sort((a, b) => a.day - b.day)[0].day)} to ${monthName(day)}, then × ${money(t.monthly)}` }), id, day, kind:'finance', title:`${S.airline ? S.airline.name : 'Dragon Air'}: year-3 accounts`, docSub:`Finance, ${dateShort(since)} to ${dateShort(day)}`, relKey:'finance', unit:'£',
    lines:[{ lab:`${shortPlane(p)}: monthly payments`, a:paid, b:t.monthly, au:'payments', bu:'£', shown, wrong:true }, { lab:`${shortPlane(p)}: deposit, ${dateShort(since)}`, a:1, b:t.deposit || 0, au:'payment', bu:'£', shown:t.deposit || 0 }],
    right, out:shown - right, consequence:h.consequenceIfMissed || 'Repayments run a month longer' };
};
const huntConsequenceC4 = huntConsequence;
huntConsequence = function(sp){ if(!sp || sp.id !== 'h5') return huntConsequenceC4(sp);
  const s = huntState(sp.id); s.state = 'missed'; s.missedDay = S.day; const f = S.fleet.find(x => x.terms && x.terms.kind === 'finance' && x.terms.unit === 'month');
  if(f){ const C = charges(), last = C.due.filter(c => c.fin === f.uid).sort((a, b) => b.day - a.day)[0]; if(last){ const d = monthEnd(last.day) + 1; C.due.push({ ev:'hunt:h5', at:S.day, day:d, amount:f.terms.monthly, what:`Finance: ${shortPlane(planeById(f.planeId))} ${money(f.terms.monthly)} (one month more)`, fin:f.uid, k:f.terms.months + 1 }); } }
  return `The line should be ${num(sp.lines[0].a)} × ${money(sp.lines[0].b)} = ${money(sp.right)}, not ${money(sp.lines[0].shown)}. ${sp.consequence}: one more payment of ${money(sp.lines[0].b)} at the end.`; };
const startBeatC4 = startBeat;
startBeat = function(b){ startBeatC4(b); const w = roundData(S.round); if(!w || w.period !== 'review' || w.chapterNo !== 4) return;
  const h = huntList().find(x => x.id === 'h5' && dayOfDate(x.date) === S.day && huntState(x.id).state === 'new'), k = S.steps.findIndex(x => x.t === 'chapterReview');
  if(h && huntSpec('h5') && k >= 0 && !S.steps.some(x => x.t === 'hunt')){ S.steps.splice(k, 0, { t:'hunt', id:'h5' }); save(); render(); } };

/* ---------- 7. the A380 launch campaign: the hooks (D82) ---------- */
const CAMP_DAY = typeof gateDay === 'function' ? gateDay('campaignProjectDate') : null;
function campS(){ return S.campaign || (S.campaign = { status:'none', choices:{}, portfolio:{}, pics:[], paused:false, result:null }); }
const campOpen = () => !!(S && CAMP_DAY !== null && (S.day || 1) >= CAMP_DAY && S.fleet.some(f => BIG4.includes(f.planeId)));
const CAMP_CHOICES = [['route', 'Route', ['hkg', 'lax']], ['audience', 'Audience', ['business', 'families', 'holidaymakers']], ['channel', 'Channel', ['stations', 'online', 'sponsorship']], ['budget', "Budget (a share of a month's profit)", ['0.05', '0.1', '0.2']], ['length', 'Length', ['2', '4', '8']]];
const CAMP_PORT = [['livery', 'Livery and cabin concept'], ['advert', 'A poster, or a 30–90 second advert (script and storyboard)'], ['offer', 'The offer'], ['extra', 'A snack or activity idea (optional)']];
/* the entry point: the campaign's effect on a route's demand on a day (1 until a result is scored) */
function campaignDemand(rid, day){ const c = S && S.campaign; if(!c || !c.result || !c.choices || c.choices.route !== rid) return 1; const from = c.launchDay, weeks = +c.choices.length || 4; if(!(day >= from)) return 1;
  const m = c.result.mult || 1, end = from + weeks * 7; if(day < end) return m; const k = Math.floor((day - end) / 7) + 1; return 1 + (m - 1) * Math.pow(0.8, k); }
const demandMultC4 = demandMult;
demandMult = function(route, day){ return demandMultC4(route, day) * (route ? campaignDemand(route.id, day) : 1); };
function campDB(){ return new Promise((res, rej) => { try{ const q = indexedDB.open('airline-campaign', 1); q.onupgradeneeded = () => q.result.createObjectStore('pics'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }catch(e){ rej(e); } }); }
async function campSavePic(file){ const id = `${(S.airline && S.airline.code) || 'air'}-${Date.now()}`, data = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file); });
  try{ const db = await campDB(); await new Promise((r, j) => { const tx = db.transaction('pics', 'readwrite'); tx.objectStore('pics').put(data, id); tx.oncomplete = r; tx.onerror = () => j(tx.error); }); }catch(e){}
  campS().pics.push({ id, name:file.name }); save(); render(); }
async function campLoadPic(id){ try{ const db = await campDB(); return await new Promise(r => { const q = db.transaction('pics').objectStore('pics').get(id); q.onsuccess = () => r(q.result || null); q.onerror = () => r(null); }); }catch(e){ return null; } }
R.ov_campaign = o => {
  const c = campS(), brief = (WB.campaign || {}).brief, proj = (WB.campaign || {}).project, launchMin = Math.max(S.day || 1, CAMP_DAY || 1);
  const sel = ([k, l, vals]) => `<label class="cp-ch"><span>${esc(l)}</span><select data-cpch="${k}"><option value="">Choose</option>${vals.map(v => `<option value="${v}" ${c.choices[k] === v ? 'selected' : ''}>${esc(k === 'route' ? routeById(v) ? routeById(v).city : v : k === 'budget' ? Math.round(+v * 100) + '%' : k === 'length' ? v + ' weeks' : capFirst(v))}</option>`).join('')}</select></label>`;
  const body = `<div class="cp"><section class="dk-pnl cp-brief"><h2>${esc(proj ? proj.value : 'The A380 launch')}</h2><p class="cp-letter">${esc(brief ? brief.value : '')}</p><p class="small muted">${esc(proj ? proj.notes || '' : '')}</p></section>
    <section class="dk-pnl"><h2>Your choices</h2><div class="cp-chs">${CAMP_CHOICES.map(sel).join('')}<label class="cp-ch"><span>Launch date</span><input type="date" data-cpch="launch" value="${esc(c.choices.launch || '')}" min="${isoOf(launchMin)}"></label></div></section>
    <section class="dk-pnl"><h2>Your portfolio</h2>${CAMP_PORT.map(([k, l]) => `<label class="cp-pf"><span>${esc(l)}</span><textarea rows="3" data-cppf="${k}">${esc(c.portfolio[k] || '')}</textarea></label>`).join('')}
      <label class="cp-pf"><span>Pictures (drawings photographed or scanned): kept in this browser, not in the save code</span><input type="file" accept="image/*" id="cpPic"></label>
      <div class="cp-pics">${c.pics.map(x => `<figure data-cppic="${esc(x.id)}"><span>${esc(x.name)}</span></figure>`).join('')}</div></section>
    <p class="acx-note">${c.status === 'submitted' ? 'Sent to the board. Your teacher scores it; the result applies from your launch date.' : 'The airline waits while you work on the project. Close it to fly on; your work is kept.'}</p></div>`;
  screen().innerHTML = shell(deskPage({ title:'Project: the A380 launch', sub:'A campaign to fill the A380 in its first month.', cls:'cp-page', body }),
    deskBar(c.paused ? 'The airline is waiting while you work on the project.' : 'Work on it over several sessions.', `<button class="btn big" id="cpClose">Close</button><span class="grow"></span><button class="btn big" id="cpPause">${c.paused ? 'Let the airline fly on' : 'Hold the airline while I work'}</button><button class="btn primary big" id="cpSend" ${CAMP_CHOICES.every(([k]) => c.choices[k]) && c.choices.launch ? '' : 'disabled'}>Send to the board &#9654;</button>`));
  const root = screen();
  root.querySelectorAll('[data-cpch]').forEach(i => i.onchange = () => { c.choices[i.getAttribute('data-cpch')] = i.value; if(c.status === 'none') c.status = 'working'; save(); render(); });
  root.querySelectorAll('[data-cppf]').forEach(i => i.oninput = () => { c.portfolio[i.getAttribute('data-cppf')] = i.value; if(c.status === 'none') c.status = 'working'; save(); });
  const pic = $('cpPic'); if(pic) pic.onchange = () => { const f = pic.files && pic.files[0]; if(f) campSavePic(f); };
  root.querySelectorAll('[data-cppic]').forEach(fg => campLoadPic(fg.getAttribute('data-cppic')).then(d => { if(d) fg.insertAdjacentHTML('afterbegin', `<img src="${d}" alt="">`); }));
  on('cpClose', () => { S.overlay = null; if(o.back) UI.view = o.back; render(); });
  on('cpPause', () => { c.paused = !c.paused; if(c.paused && c.status === 'none') c.status = 'working'; save(); render(); });
  on('cpSend', () => { c.status = 'submitted'; c.paused = false; c.launchDay = c.choices.launch ? dayOfDate(c.choices.launch) : null; c.sentDay = S.day; addNews([{ tag:'PROJECT', text:'The A380 launch campaign has gone to the board.' }]); save(); S.overlay = null; render(); });
};
/* HQ: the Project button, and the hold while the project is open */
const hqC4 = R.hq;
R.hq = st => { const r = hqC4(st); try{ if(campOpen()){ const c = campS(), go = $('startDay') || screen().querySelector('#nx');
  const host = screen().querySelector('.hq-actions, .dk-bar .acts') || (go && go.parentNode); if(host && !$('cpOpen')) host.insertAdjacentHTML('afterbegin', `<button class="btn big" id="cpOpen">Project: the A380 launch${c.status === 'submitted' ? ' ✓' : ''}</button>`);
  on('cpOpen', () => { S.overlay = { type:'campaign', back:UI.view || null }; render(); });
  if(c.paused && go){ go.disabled = true; go.title = 'The airline is waiting while you work on the project.'; } } }catch(e){} return r; };
/* for the tests and the teacher: where the campaign is */
function campaignReport(){ const c = S.campaign || null; return c ? { status:c.status, paused:c.paused, choices:c.choices, words:Object.values(c.portfolio || {}).join(' ').split(/\s+/).filter(Boolean).length, pics:(c.pics || []).length, launchDay:c.launchDay || null } : null; }

/* ---------- 8. the record: the finance relationship's name ---------- */
if(typeof REC_REL !== 'undefined') REC_REL.finance = 'finance: deposit and monthly payments';
if(typeof PAPER_REL !== 'undefined') PAPER_REL.finance = 'finance: deposit and monthly payments';
