/* ==================================================================
   CHAPTER 3 "OWNING", PUSH 1 (Workbook v5.4; Fable's note D81, 14 Oct 2026). Days 365–371 one at a time, then months to the
   review on 31 August 2032 (p4zg chapterBeats). This part adds the chapter's money rules:
     - EventOptions rows in place of the prose: chapter 2's choices (label, sub-line, costShare, stars) and the overdraft offer.
       Chapter 1's events keep their Events rows (Bertie, 14 Oct). The mechanics (charges, groundings, lifts) stay in CH2_OPT.
     - The overdraft (overdraftAtLimit): from overdraftFromDate the £1,000 reserve gives way to −limit, one week's average
       profit (the last 28 days ÷ 4), offered on day 365 and accepted then or later from the Finance desk; £0 while declined.
       Purchases, rentals and fuel orders that would go beyond it are blocked; the plan keeps flying (no more free top-ups from
       the bank); the statement says "Overdrawn £X of £Y"; two month-ends overdrawn make that month's audit a board review.
     - A rented plane can be bought at its list price, the rent stopping that day (buyLeasedPlane), and a lease handed back
       at the end of the month from the Fleet desk (leaseReturn). Owned planes cannot be sold (D25).
     - Time to afford in weeks (timeToAffordWeekly): (price − cash) ÷ profit a week, Calculate on day 365, Build after.
     - A missed year-1 hunt (missedHuntH1Effect): the cash figure reads £2,000 high from day 365 until the first month-end audit.
     - The chapter review: the year-2 accounts with the average month (Build), the next investment and the A380 offer.
   Push 2 brings Sydney's two-leg rotation, storm2 and ash_cloud2 with their choices, challenges 3–4 and hunts h3–h4: until
   then Sydney stays shut and those events are headlines.
   ================================================================== */
const CH3 = CHAPTERS.find(c => c.chapter === 3) || null, CH3_DAY = CH3 ? dayOfDate(CH3.start) : null;
const ch3Now = d => !!(CH3_DAY && S && ((d === undefined ? S.day : d) || 1) >= CH3_DAY);
const k1000 = v => Math.round(v / 1000) * 1000;
const weekWord = n => `${num(n)} week${n === 1 ? '' : 's'}`;

/* ---------- 1. EventOptions (v5.4): one row per option ---------- */
const eoRows = id => (WB && WB.eventOptions && WB.eventOptions[id]) || null;
const starWord = r => r ? `${r > 0 ? '+' : '−'}${starTxt(Math.abs(r))}` : '';
const ch2EventEO0 = ch2Event;
ch2Event = function(id){
  const ev = ch2EventEO0(id), rows = eoRows(id), M = CH2_OPT[id] || []; if(!ev || !rows) return ev;
  let j = 0; M.forEach((m, k) => { if(m.drop) return; const o = ev.options[j++], r = rows.find(x => x.n === k + 1); if(!o || !r) return;
    o.label = r.label; o.sub = r.sub || ''; o.row = r.n; o.share = r.costShare ? r.costShare : null; o.effects.rep = r.stars || 0; });
  ev.fromRows = true; return ev;
};
const ch2PriceEO0 = ch2Price;
ch2Price = function(ev){ const was = !!(ev && ev.priced); ch2PriceEO0(ev); if(!ev || was || !ev.fromRows) return;
  ev.options.forEach(o => { const r = o.effects && o.effects.rep; if(r && !/★/.test(o.sub || '')) o.sub = `${o.sub ? o.sub + ' · ' : ''}${starWord(r)}`; }); };
ch2PatchBeats();
/* events built from their rows alone (push 2 adds storm2 and ash_cloud2 with their mechanics) */
const ROW_EVENTS = ['overdraft_offer'];
function rowEvent(id){
  const e = eventById(id), rows = eoRows(id); if(!e || !rows) return null;
  return { id, date:e.date, title:e.title, text:e.text, affectsRoutes:[], fromRows:true,
    options:rows.map(r => ({ key:'o' + r.n, row:r.n, label:r.label, sub:r.sub || '', share:r.costShare || null, other:r.other || null, effects:{ rep:r.stars || 0 }, why:`${r.label}.` })) };
}
const gameEventEO0 = gameEvent;
gameEvent = function(id){ return ROW_EVENTS.includes(id) ? rowEvent(id) : gameEventEO0(id); };
(WORLD.rounds || []).forEach(w => { if(w.eventId && ROW_EVENTS.includes(w.eventId)) w.event = rowEvent(w.eventId); });
const costShareOfEO0 = costShareOf;
costShareOf = function(ev, opt){ if(ev && ev.fromRows && !ev.ch2) return opt && opt.share ? opt.share : null; return costShareOfEO0(ev, opt); };

/* ---------- 2. the overdraft ---------- */
let RESERVE0 = WORLD.cashReserve || 0;
const OD_DAY = gateDay('overdraftFromDate');
function odDay(d){ d = d === undefined ? ((S && S.day) || 1) : d; return OD_DAY !== null && d >= OD_DAY; }
function odState(){ return S.od || (S.od = { on:false, limit:0 }); }
/* one week's average profit: the last 28 days' profit ÷ 4 (fewer days: their average × 7) */
function weekProfitAvg(day){ const L = ledger(); let t = 0, n = 0; for(let d = (day || S.day || 1) - 1; d >= 1 && n < 28; d--){ if(L.rev[d] !== undefined && L.rev[d] !== null){ t += (L.rev[d] || 0) - (L.cost[d] || 0); n++; } } return n ? t / n * 7 : 0; }
function odLimitNow(day){ return Math.max(0, Math.round(weekProfitAvg(day) / 100) * 100); }
function odAccept(how){ const o = odState(); o.on = true; o.since = S.day; o.how = how; delete o.declined; o.limit = odLimitNow();
  addNews([{ tag:'BANK', text:`Overdraft agreed: cash may go down to ${money(-o.limit)}, with no charge.` }]);
  try{ rec().pend.events.push({ day:S.day, title:'The overdraft', choice:`accepted (limit ${money(o.limit)}, one week's average profit)`, cost:0 }); }catch(e){} }
function cashFloor(){ if(!S || !odDay()) return RESERVE0; const o = S.od; return o && o.on ? -(o.limit || 0) : 0; }
Object.defineProperty(WORLD, 'cashReserve', { get:() => cashFloor(), set:v => { RESERVE0 = v; }, configurable:true, enumerable:true });
function reserveWords(){ if(!S || !odDay()) return `Keep ${money(RESERVE0)} back for emergencies.`; const o = S.od;
  return o && o.on ? `Your overdraft lets cash go down to ${money(-(o.limit || 0))}.` : 'No overdraft: cash cannot go below £0.'; }
function odBlockWhy(after){ const o = (S && S.od) || {};
  return !odDay() ? `It would leave less than the ${money(RESERVE0)} reserve` : o.on ? `Over your overdraft limit: cash would be ${money(after)}, below ${money(-(o.limit || 0))}` : 'Cash would go below £0, and you have no overdraft'; }
/* the decision on day 365 */
const applyEventNowOD0 = applyEventNow;
applyEventNow = function(choice){ const r = applyEventNowOD0.apply(this, arguments), ev = S.rnd.event, opt = ev && ev.options && ev.options[choice];
  if(ev && ev.id === 'overdraft_offer' && opt){ if(/overdraft on/i.test(opt.other || '')) odAccept('offer'); else { const o = odState(); o.on = false; o.declined = S.day; } }
  return r; };
const undoEventOD0 = undoEvent;
undoEvent = function(){ const ev = S.rnd.event; if(ev && ev.id === 'overdraft_offer' && S.od){ S.od.on = false; delete S.od.since; delete S.od.declined; } return undoEventOD0.apply(this, arguments); };
/* no more free top-ups: from overdraftFromDate cash may go below zero and the plan keeps flying */
const bankCheckOD0 = bankCheck;
bankCheck = function(){ if(S && odDay(typeof simDayNow === 'function' ? simDayNow() : S.day)) return; return bankCheckOD0.apply(this, arguments); };
/* the Ready check: a fuel order that would go beyond the floor is blocked; the plan itself always flies */
const reserveStateOD0 = reserveState;
reserveState = function(){ const r = reserveStateOD0(); if(!S || !odDay()) return r; const fo = S.rnd.fuelOrder ? S.rnd.fuelOrder.total : 0, fl = cashFloor();
  return Object.assign(r, { reserve:fl, after:r2(S.cash - fo), block:!!(fo && S.cash - fo < fl), od:true }); };
const readyExtraOD0 = readyExtra;
readyExtra = function(row){ const h = readyExtraOD0(row); if(!S || !odDay()) return h; const r = reserveState();
  return h.replace(/This plan would leave <span class="mono">[^<]*<\/span> in the bank, below the <span class="mono">[^<]*<\/span> reserve\./, `The fuel order would leave <span class="mono">${money(r.after)}</span>: ${esc(odBlockWhy(r.after))}.`); };

/* the cash shown: the true balance, or £2,000 high after a missed year-1 hunt until the first audit (missedHuntH1Effect) */
function h1Off(){ const F = S && S.ch3Forecast; return F && !F.fixed && ch3Now() ? (F.out || 0) : 0; }
function shownCash(){ return S.cash + h1Off(); }
function overdrawnText(c){ c = c === undefined ? shownCash() : c; const o = (S && S.od) || {}; return `Overdrawn ${money(Math.round(-c))} of ${money(o.on ? o.limit || 0 : 0)}`; }
const updateTopBarOD0 = updateTopBar;
updateTopBar = function(){ updateTopBarOD0.apply(this, arguments); if(!S || S.phase === 'setup' || !ch3Now()) return; const b = $('cCash'); if(!b) return;
  const c = Math.round(shownCash()), lab = b.previousElementSibling; b.textContent = money(c); b.classList.toggle('red', c < 0); if(lab) lab.textContent = c < 0 ? overdrawnText(c) : 'Cash balance'; };
/* the Finance desk: the statement, the overdraft and its limit; accept it here after declining */
function odStatementHtml(){ const o = odState(), c = Math.round(shownCash());
  return `<section class="hp od-st">${hqHead('Statement', o.on ? 'OVERDRAFT AGREED' : 'NO OVERDRAFT')}<div class="pb"><p class="od-big ${c < 0 ? 'red' : ''}">${c < 0 ? esc(overdrawnText(c)) : `Cash ${money(c)}`}</p>
    <p class="muted">${o.on ? `Overdraft limit ${money(o.limit || 0)}: one week's average profit over the last four weeks, with no charge. A purchase, a rental or a fuel order that would take cash below ${money(-(o.limit || 0))} is blocked; the plan keeps flying.`
      : `${o.declined ? `You declined the overdraft on ${esc(dateShort(o.declined))}. ` : ''}Cash cannot go below £0 for a purchase, a rental or a fuel order.`}</p>
    ${o.on ? '' : `<button class="btn primary" id="odAccept">Accept the overdraft: up to ${money(odLimitNow())}, no charge</button>`}</div></section>`; }
const renderViewOD0 = renderView;
renderView = function(v){ renderViewOD0(v); if(v !== 'finance' || !S || !odDay()) return; const host = screen().querySelector('.vw'); if(!host || host.querySelector('.od-st')) return;
  host.insertAdjacentHTML('afterbegin', odStatementHtml()); on('odAccept', () => { odAccept('finance'); render(); });
  if(h1Off()) host.querySelectorAll('.hq-t tbody tr:first-child td:nth-child(6)').forEach(td => { td.textContent = money(Math.round(shownCash())); }); };
/* two month-ends overdrawn: that month's audit is a board review (D64) */
function odMonthEnds(me){ const out = []; let m = me; for(let k = 0; k < 2; k++){ const h = (S.history || []).filter(x => x.to === m).pop(); if(!h) break; out.push({ me:m, cash:Math.round(h.cash) }); m = monthStart(m) - 1; } return out; }
const soAuditDataOD0 = soAuditData;
soAuditData = function(me){ const D = soAuditDataOD0(me); if(!S || !odDay(me)) return D; const E = odMonthEnds(me); if(E.length >= 2 && E.every(x => x.cash < 0)){ D.board = true; D.overdrawn = E; } return D; };
const auditOD0 = R.audit;
R.audit = st => { auditOD0(st); const D = st.data, L = screen().querySelector('.so-letter'); if(!D || !L) return;
  if(D.overdrawn && !L.querySelector('.od-letter')) L.insertAdjacentHTML('beforeend', `<p class="od-letter bad">The airline was overdrawn at the end of two months running (${D.overdrawn.slice().reverse().map(x => `${monthName(x.me)}: ${money(x.cash)}`).join(', ')}). The overdraft is a safety net, not a loan: <b>change the plan so that it earns more than it costs.</b></p>`);
  const F = S.ch3Forecast; if(F && ch3Now() && (!F.fixed || F.fixedMe === D.me) && !L.querySelector('.h1-fix')){
    if(!F.fixed){ F.fixed = S.day; F.fixedMe = D.me; addNews([{ tag:'FINANCE', text:`Audit: the cash figure was ${money(F.out)} too high. It is right now.`, cls:'warn' }]); updateTopBar(); }
    L.insertAdjacentHTML('beforeend', `<p class="h1-fix">Correction: the year-1 accounts had a mistake nobody spotted (${esc(F.why)}). Since 1 September the cash figure has shown ${money(F.out)} more than the bank holds. It shows the true balance from now on: <b>${money(Math.round(S.cash))}</b>.</p>`); } };

/* ---------- 3. buying a rented plane; handing a lease back ---------- */
function leaseBuyOffer(f){ const t = f && f.terms; if(!t || t.kind !== 'lease') return null; const p = planeById(f.planeId), o = shopOffer(p), price = o.price, from = o.buyFrom;
  const open = from !== null && from !== undefined && S.day >= from, after = Math.round(S.cash - price), ok = open && after >= cashFloor();
  return { p, price, rent:t.daily, open, from, after, ok, why:!open ? (from ? `Buying opens on ${dateShort(from)} ${calDate(from).getUTCFullYear()}` : 'Not for sale') : ok ? '' : odBlockWhy(after) }; }
const handBackDay = () => monthEnd(S.day);
const fleetHtmlOD0 = fleetHtml;
fleetHtml = function(){ let h = fleetHtmlOD0(); if(!S || !ch3Now()) return h;
  S.fleet.forEach((f, i) => { if(!f.terms || f.terms.kind !== 'lease') return; const B = leaseBuyOffer(f), btn = `<button class="btn small" data-repaint="${f.uid}">🎨 Repaint</button>`;
    const back = i === 0 ? '' : f.returnOn ? `<span class="chip warn">Going back on ${esc(dateShort(f.returnOn))}</span><button class="btn small" data-keeplease="${f.uid}">Keep it</button>`
      : `<button class="btn small" data-handback="${f.uid}" title="The rent stops at the end of the month and it leaves the timetable. No charge.">Hand back on ${esc(dateShort(handBackDay()))}</button>`;
    h = h.replace(btn, `${btn}<div class="fa-own"><button class="btn small primary" data-buyleased="${f.uid}" ${B.open ? '' : 'disabled'} title="${esc(B.why || 'The rent stops today')}">Buy it: ${money(B.price)}</button>${back}</div>`); });
  return h; };
document.addEventListener('click', e => { const t = e.target && e.target.closest ? e.target.closest('[data-buyleased],[data-handback],[data-keeplease]') : null; if(!t || !S || !S.fleet) return;
  const uid = +(t.getAttribute('data-buyleased') || t.getAttribute('data-handback') || t.getAttribute('data-keeplease')), f = S.fleet.find(x => x.uid === uid); if(!f) return;
  if(t.hasAttribute('data-buyleased')){ S.overlay = { type:'buyLeased', uid, back:UI.view || null }; render(); return; }
  if(t.hasAttribute('data-handback')){ f.returnOn = handBackDay(); addNews([{ tag:'FLEET', text:`The ${planeById(f.planeId).name} ${regOf(f.uid)} goes back to the leasing company after ${dateShort(f.returnOn)}. No charge.` }]); toast(`The rent stops after ${dateShort(f.returnOn)}`); }
  else delete f.returnOn;
  if(typeof save === 'function') save(); render(); });
function buyLeasedNow(f){ const B = leaseBuyOffer(f); if(!B || !B.ok) return false;
  S.cash = r2(S.cash - B.price); f.terms = { kind:'buy', price:B.price, since:S.day, was:'lease', rentWas:B.rent, rentFrom:f.terms.since }; delete f.returnOn;
  (S.ch3Log = S.ch3Log || []).push({ day:S.day, what:'buyLeased', uid:f.uid, plane:f.planeId, price:B.price, rent:B.rent });
  addNews([{ tag:'FLEET', text:`${S.airline.name} buys the ${B.p.name} it was renting, for ${money(B.price)}. No more rent.`, cls:'good' }]);
  try{ rec().pend.events.push({ day:S.day, title:'Owning', choice:`bought the rented ${B.p.name} for ${money(B.price)} (the ${money(B.rent)} a day rent stops)`, cost:B.price }); }catch(e){}
  refreshPlan(); return true; }
const negParse = v => { const s = String(v === undefined || v === null ? '' : v).replace(/[£,\s]/g, '').replace(/[−–]/g, '-'); return s === '' || isNaN(+s) ? null : +s; };
R.ov_buyLeased = o => {
  const f = S.fleet.find(x => x.uid === o.uid), B = f && leaseBuyOffer(f); if(!B){ closeOverlay(); return; }
  const st = o.st || (o.st = {}), cash = Math.round(S.cash), neg = B.after < 0, need = neg && B.ok && !st.negOk, days = B.rent ? B.price / B.rent : null;
  const rows = [['Price', money(B.price), 'the Aircraft list price'], ['Rent you pay now', `${money(B.rent)} a day`, `since ${dateShort(f.terms.since)}`],
    ['Rent or buy', days ? `${num(Math.round(days))} days` : '—', days ? `${num(B.price)} ÷ ${num(B.rent)}: about ${Math.round(days / 365 * 2) / 2} years of rent` : ''], ['Cash now', money(cash), reserveWords()]];
  const negCard = !neg ? `<p class="acq-n">Cash after buying: ${money(cash)} − ${money(B.price)} = <b>${money(B.after)}</b>.</p>`
    : `<section class="dk-pnl acq-rb neg-card ${st.negOk ? 'ok' : ''}"><div class="sc-h"><span class="sc-n">✓</span><div><h2>Cash after buying</h2><p>Buying takes cash below zero. What will the statement say?</p></div>${st.negOk ? cardStampHtml('ok') : st.negQ ? cardStampHtml('q') : ''}</div>
      ${st.negOk ? `<p class="acq-ans"><b>${money(cash)} − ${money(B.price)} = ${money(B.after)}</b>: overdrawn by ${money(-B.after)}.</p>`
      : `<div class="acq-in"><span class="mono">${money(cash)} − ${money(B.price)} =</span><span class="sc-in ${st.negQ ? 'qy' : ''}"><i class="pre">£</i><input data-pad="negcash" inputmode="text" autocomplete="off" value="${esc(st.negV || '')}" aria-label="Cash after buying"></span><button class="btn primary" id="negChk">Check ✓</button><span class="sc-msg" role="status">${esc(st.negMsg || '')}</span></div>
        <p class="sc-note">The price is more than the cash: take the cash away from the price, and the answer is below zero, so it has a minus sign.</p>`}</section>`;
  const body = `<div class="acq od-buy"><p class="acq-lead">The <b>${esc(B.p.name)}</b> ${esc(regOf(f.uid))}${f.name ? ` (${esc(f.name)})` : ''} is rented at ${money(B.rent)} a day. Buy it at the list price and the rent stops today. It is yours for good: owned planes cannot be sold.</p>
    <div class="acq-cols"><div class="acq-col on"><h2>Buy the plane you rent</h2>${rows.map(([a, b, sub]) => `<div class="acq-r"><span>${a}</span><b>${b}${sub ? `<small>${esc(sub)}</small>` : ''}</b></div>`).join('')}</div></div>${negCard}
    ${B.ok ? '' : `<p class="acq-n bad">${esc(B.why)}.</p>`}</div>`;
  screen().innerHTML = shell(deskPage({ title:`Buy the ${esc(shortPlane(B.p))} you rent?`, sub:`${money(B.price)} today, then no more rent. ${esc(reserveWords())}`, cls:'acq-page', body }),
    deskBar(!B.ok ? esc(B.why) + '.' : need ? 'Work out the cash after buying first.' : 'Buy it, or keep renting.', `<button class="btn big" id="odbBack">Keep renting</button><span class="grow"></span><button class="btn primary big" id="odbBuy" ${B.ok && !need ? '' : 'disabled'}>Buy it for ${money(B.price)} &#9654;</button>`));
  const inp = screen().querySelector('[data-pad="negcash"]'); if(inp){ inp.oninput = () => { st.negV = inp.value; }; inp.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); $('negChk').click(); } }; }
  on('negChk', () => { const v = negParse(st.negV); if(v === null){ st.negMsg = 'Type the amount in pounds, with a minus sign if it is below zero.'; render(); return; }
    const ok = Math.abs(v - B.after) < 0.5; negRecord(cash, B.price, B.after, ok, st.negV);
    if(ok){ st.negOk = true; st.negQ = false; st.negMsg = ''; } else { st.negQ = true; st.negMsg = Math.abs(v + B.after) < 0.5 ? 'Query: the right size, but the cash is below zero. Put a minus sign in front.' : `Query: ${money(B.price)} − ${money(cash)} is how far below zero. Check the subtraction.`; } render(); });
  on('odbBack', () => { S.overlay = null; if(o.back) UI.view = o.back; render(); });
  on('odbBuy', () => { if(need || !buyLeasedNow(f)) return; S.overlay = null; if(o.back) UI.view = o.back; toast(`The ${shortPlane(B.p)} is yours. The rent has stopped.`); render(); });
};
function negRecord(a, b, res, ok, typed){ const sk = skills(), x = sk.negCash || (sk.negCash = { first:S.day, count:0 }); if(ok) x.count++;
  try{ const e = recOpen('neg:' + S.day + ':' + a, { type:'calc', relKey:'negCash', doc:'Cash after buying', ask:'What will the statement say?', question:`${money(a)} − ${money(b)}`, unit:'£', correct:res, correctText:money(res), ops:[a, b], op:'−', level:'Calculate' });
    recAttempt(e, { ok, given:String(typed), value:negParse(typed), method:'take the smaller from the bigger; the answer is below zero' }); }catch(e){}
  if(ok){ const log = S.handSumLog || (S.handSumLog = []); log.push({ day:S.day, date:dateShort(S.day), tools:['Negative cash: cash − price (Calculate)'] }); } }
PAD_SPECS.unshift(inp => { if(!inp.dataset || inp.dataset.pad !== 'negcash' || !S.overlay || S.overlay.type !== 'buyLeased') return null; const f = S.fleet.find(x => x.uid === S.overlay.uid), B = f && leaseBuyOffer(f); if(!B) return null;
  return { op:'−', a:B.price, b:Math.round(S.cash), lab:`${money(B.price)} − ${money(Math.round(S.cash))} (then the minus sign)`, sel:'[data-pad="negcash"]' }; });
/* the lease ends after the last day of its month: at the next beat it leaves the fleet and the timetable */
function handBackNow(f, day){ const i = S.fleet.indexOf(f); if(i <= 0) return; const p = planeById(f.planeId); S.fleet.splice(i, 1);
  (S.ch3Log = S.ch3Log || []).push({ day:day || S.day, what:'leaseReturn', uid:f.uid, plane:f.planeId, on:f.returnOn, rent:f.terms.daily });
  (S.returned = S.returned || []).push({ uid:f.uid, planeId:f.planeId, registration:f.registration || null, name:f.name || null, on:f.returnOn, since:f.terms.since, rent:f.terms.daily });
  if(UI.peTab >= S.fleet.length) UI.peTab = 0; if(S.disrupt && S.disrupt.uid === f.uid) S.disrupt = null; if(S.waitFor && S.waitFor.uid === f.uid) delete S.waitFor;
  addNews([{ tag:'FLEET', text:`The ${p.name} ${f.registration || ''} has gone back to the leasing company. Its rent stopped after ${dateShort(f.returnOn)}.`.replace(/\s+/g, ' ') }]);
  try{ rec().pend.events.push({ day:day || S.day, title:'Owning', choice:`handed back the rented ${p.name} at the end of ${monthName(f.returnOn)}`, cost:0 }); }catch(e){} }
function leaseReturnsDue(day){ (S.fleet || []).filter((f, i) => i > 0 && f.returnOn && f.returnOn < day && f.terms && f.terms.kind === 'lease').forEach(f => handBackNow(f, day)); }

/* ---------- 4. the beats: the limit follows the profit; returned leases leave; the audit's fallback ---------- */
function ch3BeatStart(d){ if(!S || !ch3Now(d)) return; leaseReturnsDue(d); if(S.od && S.od.on) S.od.limit = odLimitNow(d);
  const F = S.ch3Forecast, me1 = CH3_DAY ? monthEnd(CH3_DAY) : null; if(F && !F.fixed && me1 && d > me1 + 31){ F.fixed = d; addNews([{ tag:'FINANCE', text:`The cash figure was ${money(F.out)} too high. It is right now.`, cls:'warn' }]); } }
const startBeatOD0 = startBeat;
startBeat = function(b){ ch3BeatStart(beatDay(b)); return startBeatOD0.apply(this, arguments); };
const startProtoDayOD0 = startProtoDay;
startProtoDay = function(n){ ch3BeatStart(beatDay(n)); return startProtoDayOD0.apply(this, arguments); };

/* ---------- 5. time to afford in weeks (D81 §5): (price − cash) ÷ profit a week ---------- */
if(typeof SO_REL !== 'undefined') SO_REL.timeToAffordWeekly = { name:'Time to afford (weeks)', rel:'(price − cash) ÷ profit a week', skill:'timeToAffordWeekly' };
Object.assign(REC_REL, { timeToAffordWeekly:'subtraction and division with millions', negCash:'negative cash (overdrawn)' });
const recRelOD0 = recRel;
recRel = function(key){ return recRelOD0(key === 'rentOrBuy' && ch3Now() && (WORLD.workingMethods || []).some(m => m.relationship === 'rent-or-buy at jet prices') ? 'rentOrBuyJet' : key); };
REC_REL.rentOrBuyJet = 'rent-or-buy at jet prices';
const taMetW = () => { const x = skills().timeToAffordWeekly; return !!(x && x.count > 0); };
/* the figures to the nearest £1,000, as a finance team would round them */
function taFigW(pid){ const p = planeById(pid), o = shopOffer(p), cash = k1000(S.cash), rate = k1000(weekProfitAvg()), still = Math.max(0, o.price - cash);
  const weeks = still > 0 ? (rate > 0 ? Math.ceil(still / rate - 1e-9) : null) : 0, su = saveUp(o.price);
  return { pid, name:p.name, short:shortPlane(p), price:o.price, cash, rate, still, days:weeks, weeks, exact:rate > 0 ? still / rate : null, afford:su.afford, shortfall:su.short, unit:'week' }; }
function taTargetW(){ const c = shopPlanes().filter(p => { const o = shopOffer(p); return o.buyOffered && !o.saveUp.afford && o.price > S.cash; }).sort((a, b) => shopOffer(a).price - shopOffer(b).price)[0]; return c ? c.id : null; }
function taCardW(st, f){
  const level = st.taLevel, done = !!st.taOk, T = st.ta || (st.ta = { v1:'', v2:'', ok1:false, q1:false, q2:false, msg1:'', msg2:'', tokens:[], lines:[] }), stamp = done ? cardStampHtml('ok') : (T.q1 || T.q2) ? cardStampHtml('q') : '';
  const head = `<div class="sc-h"><span class="sc-n">✓</span><div><h2>How many weeks until we can afford the ${esc(f.short)}?</h2><p>${level === 'calc' ? 'Sign this off: what is still to save, then how many weeks of profit that takes.' : 'Show how to find the weeks to wait; the game works it out.'}</p></div><span class="so-lv ${level}">${level === 'calc' ? 'Calculate' : 'Build'}</span>${stamp}</div>`;
  const facts = `<p class="sc-note">Price ${money(f.price)} · cash now ${money(f.cash)} · profit a week ${money(f.rate)} (the average of the last four weeks). Both to the nearest £1,000.</p>`;
  if(done) return `<section class="dk-pnl acq-rb ta-card taw ok">${head}${facts}<p class="acq-ans"><b>(${money(f.price)} − ${money(f.cash)}) ÷ ${money(f.rate)} = ${f.exact !== null ? num(Math.round(f.exact * 100) / 100) : '—'}</b>, so <b>${weekWord(f.weeks)}</b> to wait (rounded up: after ${weekWord(Math.max(0, f.weeks - 1))} you would still be short).</p></section>`;
  if(level === 'build'){
    const figs = [['price', 'Price', f.price], ['cash', 'Cash now', f.cash], ['still', 'Still to save', f.still], ['rate', 'Profit a week', f.rate]], tok = t => OPS4.includes(t) ? `<i class="rb-op">${t}</i>` : (x => x ? `<span class="rb-tk">${x[1]} <b>${money(x[2])}</b></span>` : '')(figs.find(z => z[0] === t));
    return `<section class="dk-pnl acq-rb rb-card ta-card taw">${head}${facts}<div class="rb-bar">${T.tokens.length ? T.tokens.map(tok).join('') : '<span class="rb-ph">Tap a figure, the operation, then a figure</span>'}<span class="rb-eq">=</span><b class="rb-res">?</b></div>
      <div class="rb-chips">${figs.map(([k, l, v]) => `<button class="rb-chip" data-tafig="${k}">${l}<b>${money(v)}</b></button>`).join('')}</div>
      <div class="rb-ops">${OPS4.map(o => `<button data-taop="${o}">${o}</button>`).join('')}<button class="dk-link" data-taundo="1">Undo</button><button class="dk-link" data-taclr="1">Clear</button><span class="grow"></span><button class="btn primary rb-chk" id="taBuildChk">Check ✓</button></div>
      <p class="sc-msg rb-msg" role="status">${esc(T.msg1 || '')}</p></section>`;
  }
  const s1 = T.ok1 ? `<p class="acq-ans"><b>${money(f.price)} − ${money(f.cash)} = ${money(f.still)}</b> still to save ✓</p>`
    : `<div class="acq-in"><span class="mono">Still to save: ${money(f.price)} − ${money(f.cash)} =</span><span class="sc-in ${T.q1 ? 'qy' : ''}"><i class="pre">£</i><input data-pad="ta1" inputmode="decimal" autocomplete="off" value="${esc(T.v1)}" aria-label="Still to save"></span><button class="btn primary" id="ta1Chk">Check ✓</button><span class="sc-msg" role="status">${esc(T.msg1 || '')}</span></div>`;
  const s2 = !T.ok1 ? '<p class="sc-note later">Then: still to save ÷ profit a week.</p>'
    : `<div class="acq-in"><span class="mono">Weeks to wait: ${money(f.still)} ÷ ${money(f.rate)} a week =</span><span class="sc-in ${T.q2 ? 'qy' : ''}"><input data-pad="ta2" inputmode="decimal" autocomplete="off" value="${esc(T.v2)}" aria-label="Weeks to wait"><i class="suf">weeks</i></span><button class="btn primary" id="ta2Chk">Check ✓</button><span class="sc-msg" role="status">${esc(T.msg2 || '')}</span></div><p class="sc-note">A week's profit comes in whole weeks: round up.</p>`;
  return `<section class="dk-pnl acq-rb ta-card taw">${head}${facts}<div class="so-pre ${T.ok1 ? 'ok' : ''}"><span class="sc-sn">Step 1</span>${s1}</div><div class="so-pre ${T.ok1 ? '' : 'later'}"><span class="sc-sn">Step 2</span>${s2}</div></section>`;
}
function taDoneW(st, f, level, a){ st.taOk = true; const sk = skills(), x = sk.timeToAffordWeekly || (sk.timeToAffordWeekly = { first:S.day, count:0, builds:0, planes:[] }); if(level === 'calc') x.count++; else x.builds = (x.builds || 0) + 1; (x.planes = x.planes || []).push(f.pid);
  (S.handSumLog = S.handSumLog || []).push({ day:S.day, date:dateShort(S.day), tools:[`Time to afford in weeks (${f.name}) (${level === 'calc' ? 'Calculate' : 'Build'})`] }); taRecordW(f, level, a); }
function taRecordW(f, level, a){ try{ const e = recOpen('taw:' + f.pid + ':' + S.day, { type:level === 'calc' ? 'calc' : 'build', relKey:'timeToAffordWeekly', doc:`Time to afford: ${f.name}`, ask:'How many weeks until you can afford it?', question:`(${money(f.price)} − ${money(f.cash)}) ÷ ${money(f.rate)} a week`,
    unit:'weeks', correct:f.weeks, correctText:weekWord(f.weeks), ops:[f.still, f.rate], op:'÷', level:level === 'calc' ? 'Calculate' : 'Build' }); recAttempt(e, a); }catch(e){} }
function taBindW(st, f){
  const T = st.ta, root = screen(), i1 = root.querySelector('[data-pad="ta1"]'), i2 = root.querySelector('[data-pad="ta2"]'), M = 'subtract, then divide; round up to whole weeks';
  if(i1){ i1.oninput = () => { T.v1 = i1.value; }; i1.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); $('ta1Chk').click(); } }; }
  if(i2){ i2.oninput = () => { T.v2 = i2.value; }; i2.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); $('ta2Chk').click(); } }; }
  on('ta1Chk', () => { const v = padNum(T.v1); if(v === null){ T.msg1 = 'Type the amount in pounds.'; render(); return; }
    const ok = Math.abs(v - f.still) < 0.5; T.lines.push({ lab:`Still to save: ${money(f.price)} − ${money(f.cash)}`, typed:String(T.v1).trim(), want:money(f.still), wantV:f.still * 100, unit:'£', ok });
    if(ok){ T.ok1 = true; T.q1 = false; T.msg1 = ''; } else { T.q1 = true; T.msg1 = v === f.price + f.cash ? 'Query: that adds them. Still to save is the price take away the cash you have.' : `Query: ${v > f.still ? 'too much' : 'too little'}. The price take away the cash: line up the millions, the thousands and the units, then take away each column.`; } render(); });
  on('ta2Chk', () => { const v = padNum(T.v2); if(v === null){ T.msg2 = 'Type the number of weeks.'; render(); return; }
    if(Math.abs(v - f.weeks) < 1e-9){ T.q2 = false; T.msg2 = ''; taDoneW(st, f, 'calc', { ok:true, given:String(T.v2), value:v, working:T.lines.slice(), method:M }); render(); return; }
    T.q2 = true; const lo = Math.floor(f.exact + 1e-9);
    T.msg2 = Math.abs(v - f.exact) < 0.06 || (v === lo && lo < f.weeks) ? `Query: round up. After ${weekWord(lo)} you'd have ${lo} × ${money(f.rate)} = ${money(lo * f.rate)}: still short of ${money(f.still)}.` : `Query: ${v > f.weeks ? 'too many' : 'too few'}. ${weekWord(Math.round(v))} × ${money(f.rate)} = ${money(Math.round(v) * f.rate)}; you need ${money(f.still)}.`;
    taRecordW(f, 'calc', { ok:false, given:String(T.v2), value:v, working:T.lines.slice(), method:M, note:T.msg2.replace(/^Query: /, '') }); render(); });
  root.querySelectorAll('[data-tafig]').forEach(b => b.onclick = () => { if(T.tokens.length % 2 === 1){ T.msg1 = 'Put the operation between the figures.'; render(); return; } T.tokens.push(b.getAttribute('data-tafig')); T.msg1 = ''; render(); });
  root.querySelectorAll('[data-taop]').forEach(b => b.onclick = () => { if(T.tokens.length % 2 === 0){ T.msg1 = T.tokens.length ? 'Two operations in a row: tap a figure next.' : 'Start with a figure.'; render(); return; } T.tokens.push(b.getAttribute('data-taop')); render(); });
  on('taBuildChk', () => { const k = T.tokens.join(' '), ok = k === 'still ÷ rate';
    if(!ok){ T.msg1 = k === 'price ÷ rate' ? 'That is the weeks for the whole price, but you already have some cash: use what is still to save.' : /rate ÷/.test(k) ? 'Which is shared out? The amount still to save, into weeks of profit.' : /×/.test(k) ? 'How many weeks of profit make the amount still to save? Which operation finds how many lots fit?' : 'Use what is still to save and the profit a week.'; T.q1 = true; render(); return; }
    taDoneW(st, f, 'build', { ok:true, chips:T.tokens.map(t => OPS4.includes(t) ? { op:t } : { label:{ price:'Price', cash:'Cash now', still:'Still to save', rate:'Profit a week' }[t], text:money({ price:f.price, cash:f.cash, still:f.still, rate:f.rate }[t]), k:t }), method:'choose the figures and the operation' }); render(); });
  const u = root.querySelector('[data-taundo]'); if(u) u.onclick = () => { T.tokens.pop(); T.msg1 = ''; render(); };
  const c = root.querySelector('[data-taclr]'); if(c) c.onclick = () => { T.tokens = []; T.msg1 = ''; T.q1 = false; render(); };
}
PAD_SPECS.unshift(inp => { if(!inp.dataset || !/^ta[12]$/.test(inp.dataset.pad || '') || !UI.taF || UI.taF.unit !== 'week') return null; const f = UI.taF;
  return inp.dataset.pad === 'ta1' ? { op:'−', a:f.price, b:f.cash, lab:`${money(f.price)} − ${money(f.cash)}`, sel:'[data-pad="ta1"]' } : { op:'÷', a:f.still, b:f.rate, lab:`${num(f.still)} ÷ ${num(f.rate)}`, sel:'[data-pad="ta2"]', unit:'weeks' }; });
/* day 365: the sum on its own page, after the overdraft offer and before the plan (Calendar gatedCalc timeToAffordWeekly); the shop is on the Fleet desk */
SHELL_STEPS.push('afford3'); WS_STEPS.push('afford3'); Object.assign(RAIL_LABEL, { afford3:'Time to afford' });
R.afford3 = st => {
  const pid = st.pid !== undefined ? st.pid : (st.pid = taTargetW()); if(!pid){ next(); return; }
  if(!st.taLevel) st.taLevel = taMetW() ? 'build' : 'calc'; const F = taFigW(pid); UI.taF = F;
  const big = shopPlanes().filter(p => shopOffer(p).buyOffered && shopOffer(p).price >= 1e6).sort((a, b) => shopOffer(a).price - shopOffer(b).price);
  const rows = big.map(p => { const g = taFigW(p.id), hide = p.id === pid && !st.taOk, own = S.fleet.some(f => f.planeId === p.id && f.terms && f.terms.kind === 'lease');
    return `<tr class="${p.id === pid ? 'on' : ''}"><td><b>${esc(p.name)}</b>${own ? ' <small class="muted">you rent one</small>' : ''}</td><td class="num">${p.seats}</td><td class="num">${money(g.price)}</td><td class="num">${hide ? '?' : g.still ? money(g.still) : '£0'}</td><td class="num">${hide ? '?' : g.still ? (g.weeks === null ? '—' : weekWord(g.weeks)) : '<span class="good">buy today</span>'}</td></tr>`; }).join('');
  const body = `<div class="acq bw taw-page"><p class="acq-lead">From today big planes can be bought outright: the plane you rent, or a new one. <b>Cash now ${money(Math.round(S.cash))}</b> · ${esc(reserveWords())}</p>
    ${taCardW(st, F)}<section class="dk-pnl"><div class="dk-pnl-h">${ICO2.plane || ''}<h2>The big planes</h2><span class="grow"></span><span class="sub">to the nearest £1,000 · profit a week ${money(F.rate)}</span></div>
    <table class="dk-t"><thead><tr><th>Aircraft</th><th class="num">Seats</th><th class="num">Price</th><th class="num">Still to save</th><th class="num">Weeks to wait</th></tr></thead><tbody>${rows}</tbody></table></section></div>`;
  screen().innerHTML = shell(deskPage({ title:'Owning: how long until we can afford it?', sub:`The ${esc(F.short)} costs ${money(F.price)}. How many weeks of profit until you could buy it?`, cls:'acq-page bw-page', body }),
    deskBar(st.taOk ? 'Signed. The planes are on the Fleet desk (Add an aircraft) whenever you want one. Next: the plan.' : 'Sign off the time to afford: what is still to save, then how many weeks of profit that takes.', `<button class="btn primary big" id="nx" ${st.taOk ? '' : 'disabled'}>${st.taOk ? 'Next: the plan' : 'Sign it off first'} &#9654;</button>`));
  if(!st.taOk) taBindW(st, F);
  on('nx', () => { if(!st.taOk) return; st.done = true; UI.justDone = null; advance(); });
};
const dayStepsOD0 = daySteps;
daySteps = function(n, w){ const st = dayStepsOD0(n, w); if(!CH3_DAY || beatDay(n) !== CH3_DAY || st.some(x => x.t === 'afford3')) return st;
  const shop = st.some(x => x.t === 'shop2'), out = st.filter(x => x.t !== 'shop2'); let at = out.findIndex(x => x.t === 'event'); if(at < 0) at = out.findIndex(x => x.t === 'intro'); if(at < 0) at = 0;
  out.splice(at + 1, 0, ...[{ t:'afford3' }].concat(shop ? [{ t:'shop2' }] : [])); return out; };
/* later visits: a big plane he can't afford yet shows the sum (Build once met) on the Buy-or-rent page, and he can save for it */
const acquireOD0 = R.acquire;
R.acquire = st => { acquireOD0(st); if(!ch3Now() || !S.rnd.shopPick || step().t !== 'acquire') return; const p = planeById(S.rnd.shopPick), o = shopOffer(p); if(!o.buyOffered || o.saveUp.afford) return;
  const F = taFigW(p.id); if(!(F.still > 0 && F.rate > 0)) return; if(!st.taLevel) st.taLevel = taMetW() ? 'build' : 'calc'; UI.taF = F;
  const host = screen().querySelector('.terms'); if(!host || screen().querySelector('.ta-card')) return;
  host.insertAdjacentHTML('beforebegin', taCardW(st, F) + (st.taOk ? `<p class="ta-save">${S.waitFor && S.waitFor.pid === p.id ? `Saving for the ${esc(F.short)}: about ${weekWord(F.weeks)} at your rate.` : `<button class="btn small" id="taSave">Save for the ${esc(F.short)}</button> <span class="muted">The Fleet desk will count down the weeks.</span>`}</p>` : ''));
  if(!st.taOk) taBindW(st, F);
  on('taSave', () => { S.waitFor = { pid:p.id, from:S.day, price:F.price, days:F.weeks, unit:'week' }; addNews([{ tag:'FLEET', text:`Saving for the ${p.name}: about ${weekWord(F.weeks)} at your rate.` }]); render(); }); };
/* the countdown line in weeks from chapter 3 */
const waitLineOD0 = waitLine;
waitLine = function(){ const w = waitNow(); if(!w || !ch3Now()) return waitLineOD0(); const f = taFigW(w.pid);
  return f.afford ? `You can buy the ${f.short} now: ${money(Math.round(S.cash))} in cash, the price is ${money(f.price)}.` : `Saving for the ${f.short}: ${money(f.still)} still to save · about ${f.weeks === null ? 'some weeks' : weekWord(f.weeks)} at your rate (${money(f.rate)} a week).`; };

/* ---------- 6. what's new on day 365 ---------- */
INTRO.owning = { kicker:'New today · Owning', title:'Buying big planes, and the overdraft', before:'event',
  words:[['Buy outright', 'Pay the whole price today. No rent after that.'], ['Overdraft', "The bank lets cash go below zero, down to a limit: one week's average profit. No charge."], ['Overdrawn', 'Cash below zero. The statement shows how far below, out of the limit.'], ['Weeks to wait', 'What is still to save ÷ the profit a week, rounded up.']],
  what:() => { const ids = ['b787', 'a340', 'b777', 'a350'].filter(id => planeById(id)), cash = Math.round(S.cash);
    return [[`Year two begins. ${(routesOpening(S.day) || []).map(r => r.city).join(' and ') || 'Tokyo and Cape Town'} open today, and big planes can be bought outright.`],
      `<div class="ni-cards four">${ids.slice(0, 3).map(id => { const p = planeById(id), o = shopOffer(p); return `<div class="ni-card"><em>${money(o.price)}</em><b>${esc(shortPlane(p))}</b><span>${p.seats} seats${o.lease ? ` · or ${money(o.lease)} a day to rent` : ''}</span></div>`; }).join('')}<div class="ni-card"><em>${money(cash)}</em><b>Your cash</b><span>Today's overdraft offer can take it below zero.</span></div></div>`,
      ['The 787 you rent can be bought at its list price: the rent stops that day. A rented plane can also be handed back at the end of a month.', 'Owned planes cannot be sold, so buy the ones you will keep flying.']]; },
  maths:() => [niRule('price − cash', '÷', 'profit a week', 'Weeks to wait'),
    `<div class="ni-eg"><p>A 777 costs <b>£24,000,000</b>. You have <b>£13,500,000</b> and make <b>£420,000</b> a week.</p><p>Still to save: ${niSum('£24,000,000 − £13,500,000 = £10,500,000')}. Weeks: ${niSum('£10,500,000 ÷ £420,000 = 25')} weeks.</p><p class="ni-tip">Line up the millions, the thousands and the units. If it doesn't come out exactly, round up.</p></div>`],
  check:{ q:'A plane costs £30,000,000. You have £18,000,000 and make £400,000 a week. How many weeks until you can buy it?', opts:[['30 weeks', ''], ['75 weeks', '£30,000,000 ÷ £400,000 is 75, but you already have £18,000,000: use what is still to save.'], ['45 weeks', '£18,000,000 ÷ £400,000 is the cash you have. Still to save is £30,000,000 − £18,000,000.']], ok:0, done:'£30,000,000 − £18,000,000 = £12,000,000; £12,000,000 ÷ £400,000 = 30 weeks.' },
  think:['Buy the 787 you rent today, or keep renting and save for a bigger plane?', 'An overdraft is a safety net. What would make cash go below zero?'] };

/* ---------- 7. the routes and the planes; challenges 3–4 wait for push 2 ---------- */
const capListOD0 = capList;
capList = function(){ return capListOD0().filter(c => !CH3_DAY || dayOfDate(c.fromDate) < CH3_DAY); };
const routeOpenOD0 = routeOpen;
routeOpen = function(r, day){ if(r && (r.rotation === 'two-leg' || (r.wb && ((WB.routes || []).find(x => x.id === r.id) || {}).rotation === 'two-leg'))) return false; return routeOpenOD0.apply(this, arguments); };   // Sydney waits for push 2
PLANES.forEach(p => { if(['a340', 'b777', 'a350'].includes(p.id) && !p.icon) p.icon = 'wide'; });
/* an overnight rotation on a planning page is shown on its way out: the service's passengers, fares and costs (its block says
   "earns every second day"). Before, a plan day that fell on the way home showed the service with nobody on it and £0 of
   tickets, and its cost breakdown could not be worked out. The simulated days still alternate, out and home. */
const rotOutOD0 = rotOut;
rotOut = function(f, day){ if(SIM_DAY === null || SIM_DAY === undefined) return true; return rotOutOD0(f, day); };

/* ---------- 8. the chapter review: the average month (Build), the next investment, the A380 ---------- */
const chapterReviewItemsOD0 = chapterReviewItems;
chapterReviewItems = function(){ const R0 = chapterReviewItemsOD0(), ch = WORLD.chapter || {}; if((ch.chapter || 1) < 3) return R0;
  const P = R0.items[2].figs[0].v - R0.items[2].figs[1].v, n = R0.months.length;
  R0.items.push({ id:'mean', n:R0.items.length + 1, kind:'mean', title:'The average month', ask:"Show how to find the year's average profit a month.", totalLabel:'Profit for the year', total:P, div:n, per:'month', figs:[] }); return R0; };
function nextInvestment(){ const c = shopPlanes().filter(p => shopOffer(p).buyOffered && shopOffer(p).price >= 1e6).sort((a, b) => shopOffer(b).price - shopOffer(a).price), cant = c.filter(p => !shopOffer(p).saveUp.afford).sort((a, b) => shopOffer(a).price - shopOffer(b).price)[0];
  if(!cant) return c.length ? `You could buy any plane in the shop today: the biggest is the ${c[0].name} at ${money(shopOffer(c[0]).price)}.` : '';
  const f = taFigW(cant.id); return `The next plane you can't afford yet: the ${f.name} at ${money(f.price)}. ${money(f.still)} still to save · about ${f.weeks === null ? 'some weeks' : weekWord(f.weeks)} at ${money(f.rate)} a week.`; }
function offerCardHtml(){ const nx = nextChapterOf(3), ev = ((WB && WB.eventPreview) || []).find(e => nx && e.date === nx.start); if(!nx) return '';
  return `<section class="dk-pnl ch4-card"><div class="dk-pnl-h">${ICO2.plane || ''}<h2>${esc(ev ? ev.title : `Chapter ${nx.chapter}`)}</h2><span class="grow"></span><span class="sub">chapter ${nx.chapter} · ${esc(dateShort(dayOfDate(nx.start)))} ${calDate(dayOfDate(nx.start)).getUTCFullYear()}</span></div>
    ${ev ? `<p class="wr-l">${esc(ev.effects || ev.text)}</p>` : ''}<p class="wr-l"><b>Next investment.</b> ${esc(nextInvestment())}</p></section>`; }
const renderChapterReviewBuildOD0 = renderChapterReviewBuild;
renderChapterReviewBuild = function(st){ renderChapterReviewBuildOD0(st); const ch = WORLD.chapter || {}; if((ch.chapter || 1) < 3) return; const s = screen().querySelector('.rbw-s'); if(s && !s.querySelector('.ch4-card')) s.insertAdjacentHTML('beforeend', offerCardHtml()); };
const chapterReviewCalcOD0 = R.chapterReview;
R.chapterReview = st => { chapterReviewCalcOD0(st); const ch = WORLD.chapter || {}; if((ch.chapter || 1) < 3 || screen().querySelector('.ch4-card')) return; const m = screen().querySelector('.rbw-s') || screen().querySelector('.cost2'); if(m) m.insertAdjacentHTML('beforeend', offerCardHtml()); };

/* ---------- for the tests and the report ---------- */
function ch3Report(){ const o = (S && S.od) || {};
  return { day:S.day, chapter:(WORLD.chapter || {}).chapter, floor:cashFloor(), od:{ on:!!o.on, limit:o.limit || 0, declined:o.declined || null, since:o.since || null }, cash:Math.round(S.cash), shown:Math.round(shownCash()), h1:S.ch3Forecast || null,
    fleet:S.fleet.map(f => ({ uid:f.uid, plane:f.planeId, kind:f.terms ? f.terms.kind : null, daily:termsDaily(f), returnOn:f.returnOn || null, was:f.terms && f.terms.was || null })), log:S.ch3Log || [], returned:S.returned || [],
    skills:{ taw:skills().timeToAffordWeekly || null, neg:skills().negCash || null }, routes:openRoutes(S.day).map(r => r.id), waitFor:S.waitFor || null }; }
