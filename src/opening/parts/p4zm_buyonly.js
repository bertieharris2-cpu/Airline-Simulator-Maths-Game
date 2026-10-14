/* ==================================================================
   CHAPTER 1 IS BUY ONLY (Workbook v5.2, D76; Fable's note 13 Oct 2026; amends the second-aircraft brief §2.2).
   - Settings chapter1BuyOnly: before leaseFromDate (2031-01-06) the shop sells, it does not rent; finance waits for
     financeFromDate (chapter 4). The rent-or-buy sum (price ÷ rent) is first met in January, with the long-haul planes.
   - The week-2 comparison's second screen is "Buy now or wait?": for each plane the price, the cash now, still to save
     (price − cash), the days to wait (still to save ÷ the average profit a day over the last 7 days, rounded up; 0 when
     affordable) and what waiting costs (the affordable smaller plane's extra profit a day × the days to wait). Buy is
     greyed with the shortfall while cash < price + reserve (D55). Waiting leaves the plan as it is; the Fleet desk shows
     the countdown ("ATR 72: about 9 days at your rate"). Since 14 Oct the shop never opens by itself (p4zp).
   - The hand sum (timeToAffordSum): (price − cash) ÷ profit a day = days to wait, Calculate the first time (two steps:
     the subtraction, then the division rounded up to whole days), Build after (the figures and the operation).
   ================================================================== */
function buyOnlyOn(day){ const d = day === undefined ? ((S && S.day) || 1) : day, lf = gateDay('leaseFromDate'); return !!WBS().chapter1BuyOnly && (lf === null || d < lf); }
/* the offer: no rent before January, no finance before its date */
const shopOfferBO0 = shopOffer;
shopOffer = function(p, day){
  const o = shopOfferBO0(p, day), d = day === undefined ? ((S && S.day) || 1) : day; if(!WBS().chapter1BuyOnly) return o;
  if(buyOnlyOn(d)){ o.canLease = false; o.lease = null; }
  const fd = gateDay('financeFromDate'), finOk = o.finFrom !== null && o.finFrom !== undefined ? o.finFrom <= d : (fd !== null && d >= fd);
  if(buyOnlyOn(d) || !finOk){ o.canFinance = false; o.deposit = null; }
  return o;
};
if(typeof REC_REL !== 'undefined'){ REC_REL.timeToAfford = 'time to afford, then rent-or-buy'; REC_REL.rentOrBuy = 'time to afford, then rent-or-buy'; }
if(typeof SO_REL !== 'undefined') SO_REL.timeToAfford = { name:'Time to afford', rel:'(price − cash) ÷ profit a day', skill:'timeToAfford' };

/* ---------- the figures ---------- */
function taFig(pid){
  const p = planeById(pid), o = shopOffer(p), cash = Math.round(S.cash), rate = Math.round(avgDailyProfit()), still = Math.max(0, o.price - cash);
  const days = still > 0 ? (rate > 0 ? Math.ceil(still / rate - 1e-9) : null) : 0, su = saveUp(o.price);
  return { pid, name:p.name, short:shortPlane(p), price:o.price, cash, rate, still, days, exact:rate > 0 ? still / rate : null, afford:su.afford, shortfall:su.short, reserve:su.reserve };
}
const dayWord = n => `${num(n)} day${n === 1 ? '' : 's'}`;
/* what waiting for pid costs: the best affordable cheaper plane's extra profit a day × the days */
function taWaitCost(pid, C){
  const f = taFig(pid); if(!f.days) return null;
  const alt = C.cands.filter(c => c.pid !== pid && c.b && c.extra > 0 && taFig(c.pid).afford && shopOffer(planeById(c.pid)).price < f.price).sort((a, b) => b.extra - a.extra)[0];
  return alt ? { alt:alt.pid, extra:alt.extra, days:f.days, cost:alt.extra * f.days } : null;
}

/* ---------- the time-to-afford sign-off ---------- */
const taMet = () => { const x = skills().timeToAfford; return !!(x && x.count > 0); };
function taTarget(C, chosen){
  const f = taFig(chosen); if(!f.afford && f.still > 0) return chosen;
  const c = C.cands.filter(z => z.b).map(z => z.pid).sort((a, b) => shopOffer(planeById(a)).price - shopOffer(planeById(b)).price).find(pid => { const g = taFig(pid); return !g.afford && g.still > 0; });
  return c || null;
}
function taLedger(pid, level){
  if(typeof soOn !== 'function' || !soOn()) return null; const W = soWeek(true), key = 'ta|' + pid;
  if(!W.items[key]){ W.items[key] = { key, rel:'timeToAfford', label:`Time to afford: ${shortPlane(planeById(pid))}`, cls:taMet() ? 'repeat' : 'new', money:0, level, why:'asked', point:'acquire', day:S.day, wk:W.wk, done:false, plane:pid }; W.order.push(key); }
  return W.items[key];
}
function taDone(st, f, level, lines){
  st.taOk = true; const x = soTouch('timeToAfford', { plane:f.pid, count:level === 'calc' }); if(level !== 'calc') x.builds = (x.builds || 0) + 1;
  soLog(`Time to afford (${f.name}) (${level === 'calc' ? 'Calculate' : 'Build'})`); const it = taLedger(f.pid, level); if(it) soDone(it);
}
function taRecord(f, level, a){
  try{ const e = recOpen('ta:' + f.pid, { type:level === 'calc' ? 'calc' : 'build', relKey:'timeToAfford', doc:`Buy now or wait: ${f.name}`, ask:'How many days until you can afford it?', question:`(${money(f.price)} − ${money(f.cash)}) ÷ ${money(f.rate)} a day`,
      unit:'days', correct:f.days, correctText:dayWord(f.days), ops:[f.price - f.cash, f.rate], op:'÷', level:level === 'calc' ? 'Calculate' : 'Build' }); recAttempt(e, a); }catch(e){}
}
function taCardHtml(st, f){
  const level = st.taLevel, done = !!st.taOk, T = st.ta || (st.ta = { v1:'', v2:'', ok1:false, q1:false, q2:false, msg1:'', msg2:'', tokens:[], lines:[] }), stamp = done ? cardStampHtml('ok') : (T.q1 || T.q2) ? cardStampHtml('q') : '';
  const head = `<div class="sc-h"><span class="sc-n">✓</span><div><h2>How long until we can afford the ${esc(f.short)}?</h2><p>${level === 'calc' ? 'Sign this off: what is still to save, then how many days of profit that takes.' : 'Show how to find the days to wait; the game works it out.'}</p></div><span class="so-lv ${level}">${level === 'calc' ? 'Calculate' : 'Build'}</span>${stamp}</div>`;
  const facts = `<p class="sc-note">Price ${money(f.price)} · cash now ${money(f.cash)} · average profit a day over the last 7 days ${money(f.rate)}.</p>`;
  if(done) return `<section class="dk-pnl acq-rb ta-card ok">${head}${facts}<p class="acq-ans"><b>(${money(f.price)} − ${money(f.cash)}) ÷ ${money(f.rate)} = ${f.exact !== null ? num(Math.round(f.exact * 100) / 100) : '—'}</b>, so <b>${dayWord(f.days)}</b> to wait (rounded up: after ${dayWord(Math.max(0, f.days - 1))} you would still be short).</p></section>`;
  if(level === 'build'){
    const figs = [['price', 'Price', f.price], ['cash', 'Cash now', f.cash], ['still', 'Still to save', f.still], ['rate', 'Profit a day', f.rate]], tok = t => OPS4.includes(t) ? `<i class="rb-op">${t}</i>` : (x => x ? `<span class="rb-tk">${x[1]} <b>${money(x[2])}</b></span>` : '')(figs.find(z => z[0] === t));
    return `<section class="dk-pnl acq-rb rb-card ta-card">${head}${facts}<div class="rb-bar">${T.tokens.length ? T.tokens.map(tok).join('') : '<span class="rb-ph">Tap a figure, the operation, then a figure</span>'}<span class="rb-eq">=</span><b class="rb-res">?</b></div>
      <div class="rb-chips">${figs.map(([k, l, v]) => `<button class="rb-chip" data-tafig="${k}">${l}<b>${money(v)}</b></button>`).join('')}</div>
      <div class="rb-ops">${OPS4.map(o => `<button data-taop="${o}">${o}</button>`).join('')}<button class="dk-link" data-taundo="1">Undo</button><button class="dk-link" data-taclr="1">Clear</button><span class="grow"></span><button class="btn primary rb-chk" id="taBuildChk">Check ✓</button></div>
      <p class="sc-msg rb-msg" role="status">${esc(T.msg1 || '')}</p></section>`;
  }
  const s1 = T.ok1 ? `<p class="acq-ans"><b>${money(f.price)} − ${money(f.cash)} = ${money(f.still)}</b> still to save ✓</p>`
    : `<div class="acq-in"><span class="mono">Still to save: ${money(f.price)} − ${money(f.cash)} =</span><span class="sc-in ${T.q1 ? 'qy' : ''}"><i class="pre">£</i><input data-pad="ta1" inputmode="decimal" autocomplete="off" value="${esc(T.v1)}" aria-label="Still to save"></span><button class="btn primary" id="ta1Chk">Check ✓</button><span class="sc-msg" role="status">${esc(T.msg1 || '')}</span></div>`;
  const s2 = !T.ok1 ? '<p class="sc-note later">Then: still to save ÷ profit a day.</p>'
    : `<div class="acq-in"><span class="mono">Days to wait: ${money(f.still)} ÷ ${money(f.rate)} a day =</span><span class="sc-in ${T.q2 ? 'qy' : ''}"><input data-pad="ta2" inputmode="decimal" autocomplete="off" value="${esc(T.v2)}" aria-label="Days to wait"><i class="suf">days</i></span><button class="btn primary" id="ta2Chk">Check ✓</button><span class="sc-msg" role="status">${esc(T.msg2 || '')}</span></div><p class="sc-note">A day's profit comes in whole days: round up.</p>`;
  return `<section class="dk-pnl acq-rb ta-card">${head}${facts}<div class="so-pre ${T.ok1 ? 'ok' : ''}"><span class="sc-sn">Step 1</span>${s1}</div><div class="so-pre ${T.ok1 ? '' : 'later'}"><span class="sc-sn">Step 2</span>${s2}</div></section>`;
}
function taBind(st, f){
  const T = st.ta, root = screen(), lv = st.taLevel;
  const i1 = root.querySelector('[data-pad="ta1"]'), i2 = root.querySelector('[data-pad="ta2"]');
  if(i1){ i1.oninput = () => { T.v1 = i1.value; }; i1.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); $('ta1Chk').click(); } }; setTimeout(() => { try{ i1.focus(); }catch(e){} }, 40); }
  if(i2){ i2.oninput = () => { T.v2 = i2.value; }; i2.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); $('ta2Chk').click(); } }; setTimeout(() => { try{ i2.focus(); }catch(e){} }, 40); }
  on('ta1Chk', () => { const v = padNum(T.v1); if(v === null){ T.msg1 = 'Type the amount in pounds.'; render(); return; }
    const ok = Math.abs(v - f.still) < 0.5; T.lines.push({ lab:`Still to save: ${money(f.price)} − ${money(f.cash)}`, typed:String(T.v1).trim(), want:money(f.still), wantV:f.still * 100, unit:'£', ok });
    if(ok){ T.ok1 = true; T.q1 = false; T.msg1 = ''; } else { T.q1 = true; T.msg1 = v === f.price + f.cash ? 'Query: that adds them. Still to save is the price take away the cash you have.' : `Query: ${v > f.still ? 'too much' : 'too little'}. The price take away the cash: line up the digits and take away each column.`; } render(); });
  on('ta2Chk', () => { const v = padNum(T.v2); if(v === null){ T.msg2 = 'Type the number of days.'; render(); return; }
    const ok = Math.abs(v - f.days) < 1e-9;
    if(ok){ T.q2 = false; T.msg2 = ''; taRecord(f, 'calc', { ok:true, given:String(T.v2), value:v, working:T.lines.slice(), method:'subtract, then divide; round up to whole days' }); taDone(st, f, 'calc'); render(); return; }
    T.q2 = true; const lo = Math.floor(f.exact + 1e-9);
    T.msg2 = Math.abs(v - f.exact) < 0.06 || (v === lo && lo < f.days) ? `Query: round up. After ${dayWord(lo)} you'd have ${lo} × ${money(f.rate)} = ${money(lo * f.rate)}: still short of ${money(f.still)}.` : `Query: ${v > f.days ? 'too many' : 'too few'}. ${dayWord(Math.round(v))} × ${money(f.rate)} = ${money(Math.round(v) * f.rate)}; you need ${money(f.still)}.`;
    taRecord(f, 'calc', { ok:false, given:String(T.v2), value:v, working:T.lines.slice(), method:'subtract, then divide; round up to whole days', note:T.msg2.replace(/^Query: /, '') }); render(); });
  // Build: still to save ÷ profit a day (or (price − cash) ÷ profit a day)
  root.querySelectorAll('[data-tafig]').forEach(b => b.onclick = () => { if(T.tokens.length % 2 === 1){ T.msg1 = 'Put the operation between the figures.'; render(); return; } T.tokens.push(b.getAttribute('data-tafig')); T.msg1 = ''; render(); });
  root.querySelectorAll('[data-taop]').forEach(b => b.onclick = () => { if(T.tokens.length % 2 === 0){ T.msg1 = T.tokens.length ? 'Two operations in a row: tap a figure next.' : 'Start with a figure.'; render(); return; } T.tokens.push(b.getAttribute('data-taop')); render(); });
  on('taBuildChk', () => { const k = T.tokens.join(' '), ok = k === 'still ÷ rate';
    if(!ok){ T.msg1 = k === 'price ÷ rate' ? 'That is the days for the whole price, but you already have some cash: use what is still to save.' : /÷/.test(k) && /rate ÷/.test(k) ? 'Which is shared out? The amount still to save, into days of profit.' : /×/.test(k) ? 'How many days of profit make the amount still to save? Which operation finds how many lots fit?' : 'Use what is still to save and the profit a day.'; T.q1 = true; render(); return; }
    taRecord(f, 'build', { ok:true, chips:T.tokens.map(t => OPS4.includes(t) ? { op:t } : { label:{ price:'Price', cash:'Cash now', still:'Still to save', rate:'Profit a day' }[t], text:money({ price:f.price, cash:f.cash, still:f.still, rate:f.rate }[t]), k:t }), method:'choose the figures and the operation' });
    taDone(st, f, 'build'); render(); });
  const u = root.querySelector('[data-taundo]'); if(u) u.onclick = () => { T.tokens.pop(); T.msg1 = ''; render(); };
  const c = root.querySelector('[data-taclr]'); if(c) c.onclick = () => { T.tokens = []; T.msg1 = ''; T.q1 = false; render(); };
}
/* the Working pad sets out the two steps */
PAD_SPECS.push(inp => { if(!inp.dataset || !/^ta[12]$/.test(inp.dataset.pad || '') || !UI.taF) return null; const f = UI.taF;
  return inp.dataset.pad === 'ta1' ? { op:'−', a:f.price, b:f.cash, lab:`${money(f.price)} − ${money(f.cash)}`, sel:'[data-pad="ta1"]' } : { op:'÷', a:f.still, b:f.rate, lab:`${num(f.still)} ÷ ${num(f.rate)}`, sel:'[data-pad="ta2"]', unit:'days' }; });

/* ---------- Screen 2: buy now or wait? ---------- */
function renderAcWait(st){
  const C = acCompare(), ch = S.rnd.acChoice, ids = C.cands.filter(c => c.b).map(c => c.pid).sort((a, b) => shopOffer(planeById(a)).price - shopOffer(planeById(b)).price), res = WORLD.cashReserve || 0;
  const tgt = st.taPid !== undefined ? st.taPid : (st.taPid = taTarget(C, ch.pid)), F = tgt ? taFig(tgt) : null; if(tgt && !st.taLevel) st.taLevel = taMet() ? 'build' : 'calc';
  if(F){ UI.taF = F; taLedger(F.pid, st.taLevel); }
  const due = !!F && !st.taOk, pick = st.pick || null;
  const col = pid => { const f = taFig(pid), c = C.cands.find(z => z.pid === pid), w = taWaitCost(pid, C), p = planeById(pid), sel = pick && pick.pid === pid, hide = due && pid === tgt;   // the asked plane's answers wait for the sum
    const rows = [['Price', money(f.price)], ['Cash now', money(f.cash)], ['Still to save', hide ? '?' : f.still ? money(f.still) : '£0', '', hide ? 'step 1 above' : f.still ? `${money(f.price)} − ${money(f.cash)}` : 'you have enough'],
      ['Days to wait', hide ? '?' : f.still ? (f.days === null ? '—' : dayWord(f.days)) : '0 days', '', hide ? 'step 2 above' : f.still ? (f.days === null ? 'the airline is not making a profit' : `${money(f.still)} ÷ ${money(f.rate)} a day, rounded up`) : 'buy today'],
      ['What waiting costs', hide ? '?' : w ? money(w.cost) : '—', w && !hide ? 'bad' : '', hide ? 'after the sum' : w ? `the ${shortPlane(planeById(w.alt))}'s +${money(w.extra)} a day × ${dayWord(w.days)}` : f.still ? 'no smaller plane to buy now' : ''],
      ['Extra profit a day once bought', c && c.extra !== null ? `${c.extra >= 0 ? '+' : '−'}${money(Math.abs(c.extra))}` : '—', c && c.extra >= 0 ? 'good' : 'bad', `on ${routeById(C.rid).city}, as compared`]];
    const buyNote = f.afford ? `Buying leaves ${money(f.cash - f.price)}, above the ${money(res)} reserve.` : `<span class="bad">${money(f.shortfall)} short of ${money(f.price)} + the ${money(res)} reserve.</span>`;
    return `<div class="acq-col bw-col ${sel ? 'on' : ''}"><h2>${esc(p.name)}</h2>${rows.map(([a, b, cls, sub]) => `<div class="acq-r"><span>${a}</span><b class="${cls || ''}">${b}${sub ? `<small>${esc(sub)}</small>` : ''}</b></div>`).join('')}
      <p class="acq-n">${buyNote}</p><div class="bw-act"><button class="btn ${sel && pick.act === 'buy' ? 'primary' : ''}" data-bw="${pid}|buy" ${f.afford && !due ? '' : 'disabled'}>Buy now</button>${f.afford ? '' : `<button class="btn ${sel && pick.act === 'wait' ? 'primary' : ''}" data-bw="${pid}|wait" ${due ? 'disabled' : ''}>Wait for it</button>`}</div></div>`; };
  const body = `<div class="acq bw"><p class="acq-lead">Chapter 1 aircraft are bought outright: no renting, no finance. If you can't afford the one you want, you can buy a smaller one now, or wait and save for it. <b>Cash now ${money(Math.round(S.cash))}</b> · emergency reserve ${money(res)}.</p>
    ${F ? taCardHtml(st, F) : ''}<div class="acq-cols">${ids.map(col).join('')}</div>
    <p class="acx-note">Days to wait use the average profit a day over the last 7 days. Whatever you buy, its day cost is paid every day it is yours.</p></div>`;
  const act = pick ? (pick.act === 'buy' ? `Buy the ${esc(shortPlane(planeById(pick.pid)))}` : `Wait for the ${esc(shortPlane(planeById(pick.pid)))}`) : 'Choose: buy now, or wait';
  screen().innerHTML = shell(deskPage({ title:'Buy now, or wait?', sub:`You chose the ${esc(shortPlane(planeById(ch.pid)))} on the comparison. How long would it take to afford each one, and what does waiting cost?`, cls:'acq-page bw-page', body }),
    deskBar(due ? 'Sign off the time to afford first, then choose.' : 'Buy one now, or wait for the one you can\'t afford yet. Waiting leaves the plan as it is.',
      `<button class="btn big" id="acBack">&#9664; Compare again</button><button class="btn primary big" id="nx" ${pick && !due ? '' : 'disabled'}>${act} &#9654;</button>`));
  if(F && !st.taOk) taBind(st, F);
  screen().querySelectorAll('[data-bw]').forEach(b => b.onclick = () => { const [pid, a] = b.getAttribute('data-bw').split('|'); st.pick = { pid, act:a }; render(); });
  on('acBack', () => { const k = S.steps.findIndex(x => x.t === 'shop2'); if(k >= 0){ S.si = k; render(); } });
  on('nx', () => { if(!pick || due) return; const p = planeById(pick.pid), c = C.cands.find(z => z.pid === pick.pid);
    if(pick.act === 'buy'){ if(!taFig(pick.pid).afford) return; S.rnd.acChoice = { pid:pick.pid, rid:C.rid, fare:c.b.fare, n:c.b.n, deps:c.b.deps, extra:c.extra, own:Math.round(c.b.own) }; S.rnd.shopPick = pick.pid;
      const uid = acquirePlane(p, 'buy'); acApplyChoice(uid); }
    else { const f = taFig(pick.pid); S.waitFor = { pid:pick.pid, from:S.day, price:f.price, days:f.days };
      addNews([{ tag:'FLEET', text:`Saving for the ${p.name}: about ${f.days === null ? 'some' : dayWord(f.days)} at your rate.` }]);
      try{ rec().pend.events.push({ day:S.day, title:'Second aircraft', choice:`wait for the ${p.name} (about ${f.days === null ? '?' : dayWord(f.days)})`, cost:0 }); }catch(e){}
      delete S.rnd.acChoice; delete S.rnd.shopPick; UI.acCmp = null; }
    st.done = true; UI.justDone = null; advance(); });
}
const acquireBO0 = R.acquire;
R.acquire = st => { if(weekMode() && buyOnlyOn() && S.rnd.acChoice && S.rnd.acChoice.pid === S.rnd.shopPick) return renderAcWait(st); if(buyOnlyOn() && S.rnd.shopPick) return renderBuyOne(st); return acquireBO0(st); };
/* a later visit to the shop (no comparison): one plane, buy now or wait. The time to afford is asked again (Build once met). */
function renderBuyOne(st){
  const p = planeById(S.rnd.shopPick), f = taFig(p.id), res = WORLD.cashReserve || 0, ask = !f.afford && f.still > 0 && f.rate > 0;
  if(ask && !st.taLevel) st.taLevel = taMet() ? 'build' : 'calc';
  if(ask){ UI.taF = f; taLedger(f.pid, st.taLevel); }
  const due = ask && !st.taOk, pick = st.pick || null, shown = !ask || st.taOk;
  const rows = [['Price', money(f.price)], ['Cash now', money(f.cash)], ['Still to save', !shown ? '?' : f.still ? money(f.still) : '£0', !shown ? 'the sum above' : f.still ? `${money(f.price)} − ${money(f.cash)}` : 'you have enough'],
    ['Days to wait', !shown ? '?' : f.still ? (f.days === null ? '—' : dayWord(f.days)) : '0 days', !shown ? 'the sum above' : f.still ? (f.days === null ? 'the airline is not making a profit' : `${money(f.still)} ÷ ${money(f.rate)} a day, rounded up`) : 'buy today'],
    ['Day cost once it is yours', money(p.dayCost), 'paid every day, flying or not']];
  const note = f.afford ? `Buying leaves ${money(f.cash - f.price)}, above the ${money(res)} reserve.` : `<span class="bad">${money(f.shortfall)} short of ${money(f.price)} + the ${money(res)} reserve.</span>`;
  const body = `<div class="acq bw bw-one"><p class="acq-lead">Chapter 1 aircraft are bought outright: no renting, no finance. <b>Cash now ${money(f.cash)}</b> · emergency reserve ${money(res)}.</p>
    ${ask ? taCardHtml(st, f) : ''}<div class="acq-cols"><div class="acq-col bw-col ${pick ? 'on' : ''}"><h2>${esc(p.name)}</h2>${rows.map(([a, v, sub]) => `<div class="acq-r"><span>${a}</span><b>${v}${sub ? `<small>${esc(sub)}</small>` : ''}</b></div>`).join('')}
      <p class="acq-n">${note}</p><div class="bw-act"><button class="btn ${pick === 'buy' ? 'primary' : ''}" data-bw="${p.id}|buy" ${f.afford ? '' : 'disabled'}>Buy now</button>${f.afford ? '' : `<button class="btn ${pick === 'wait' ? 'primary' : ''}" data-bw="${p.id}|wait" ${due ? 'disabled' : ''}>Wait for it</button>`}</div></div></div>
    <p class="acx-note">Days to wait use the average profit a day over the last 7 days (${money(f.rate)}).</p></div>`;
  const act = pick === 'buy' ? `Buy the ${esc(shortPlane(p))}` : pick === 'wait' ? `Wait for the ${esc(shortPlane(p))}` : 'Choose: buy now, or wait';
  screen().innerHTML = shell(deskPage({ title:`The ${esc(shortPlane(p))}: buy now, or wait?`, sub:`${money(f.price)} to buy. How long until you can afford it?`, cls:'acq-page bw-page', body }),
    deskBar(due ? 'Sign off the time to afford first, then choose.' : f.afford ? 'You can buy it now. It is yours for good.' : 'Not enough yet. Wait and save: the Fleet desk counts down the days.',
      `<button class="btn big" id="noBuy">Not today</button><span class="grow"></span><button class="btn primary big" id="nx" ${pick && !due ? '' : 'disabled'}>${act} &#9654;</button>`));
  if(ask && !st.taOk) taBind(st, f);
  screen().querySelectorAll('[data-bw]').forEach(b => b.onclick = () => { st.pick = b.getAttribute('data-bw').split('|')[1]; render(); });
  on('noBuy', () => { delete S.rnd.shopPick; UI.justDone = null; advance(); });
  on('nx', () => { if(!pick || due) return;
    if(pick === 'buy'){ if(!taFig(p.id).afford) return; acquirePlane(p, 'buy'); }
    else { S.waitFor = { pid:p.id, from:S.day, price:f.price, days:f.days }; addNews([{ tag:'FLEET', text:`Saving for the ${p.name}: about ${f.days === null ? 'some' : dayWord(f.days)} at your rate.` }]); }
    st.done = true; delete S.rnd.shopPick; UI.justDone = null; advance(); });
}
/* Screen 1's words: the next screen is buy now or wait */
const acGiveUpBO0 = acGiveUp;
acGiveUp = function(c, C){ const t = acGiveUpBO0(c, C); if(!buyOnlyOn() || !/renting or finance/.test(t)) return t; const f = taFig(c.pid); return `You can't afford it yet: about ${f.days === null ? 'some days' : dayWord(f.days)} of saving at your rate.`; };
const acCashBarBO0 = acCashBar;
acCashBar = function(o){ const h = acCashBarBO0(o); return buyOnlyOn() ? h.replace('You could rent or finance it (next screen).', 'Next screen: how many days until you can afford it.') : h; };
const renderAcCompareBO0 = renderAcCompare;
renderAcCompare = function(){ renderAcCompareBO0(); if(!buyOnlyOn()) return; const h = screen().querySelector('.ab-hint'); if(h) h.textContent = 'Compare the three aircraft, then choose one. Next: buy it now, or wait and save for it?'; waitBanner(); };

/* ---------- waiting: the countdown (the Monday shop below is taken out again by p4zp: the shop is the pupil's to open) ---------- */
function waitNow(){ const w = S && S.waitFor; if(!w) return null; if(S.fleet.some(f => f.planeId === w.pid && (f.acquired || 0) >= w.from)){ delete S.waitFor; return null; } return w; }
function waitLine(){ const w = waitNow(); if(!w) return ''; const f = taFig(w.pid);
  return f.afford ? `You can buy the ${f.short} now: ${money(f.cash)} in cash, the price is ${money(f.price)}.` : `Saving for the ${f.short}: ${money(f.still)} still to save · about ${f.days === null ? 'some days' : dayWord(f.days)} at your rate (${money(f.rate)} a day).`; }
function waitBanner(){ const t = waitLine(); if(!t) return; const host = screen().querySelector('.dp-body') || screen().querySelector('.showroom') || screen().querySelector('main'); if(host && !host.querySelector('.bw-wait')) host.insertAdjacentHTML('afterbegin', `<div class="bw-wait">${ICO2.clock || ''}<span>${esc(t)}</span></div>`); }
const shop2BO0 = R.shop2;
R.shop2 = st => { const r = shop2BO0(st); waitBanner(); return r; };
const acquirePlaneBO0 = acquirePlane;
acquirePlane = function(p, kind){ const uid = acquirePlaneBO0(p, kind); if(S.waitFor && S.waitFor.pid === p.id) delete S.waitFor; return uid; };
/* while saving, each Monday plan day opens with the shop (the week and month beats have it already) */
const dayStepsBO0 = daySteps;
daySteps = function(n, w){ const st = dayStepsBO0(n, w); w = w || roundData(n);
  if(waitNow() && w.weekPhase === 'plan' && !st.some(x => x.t === 'shop2')){ const at = st.findIndex(x => x.t === 'plan'); st.splice(at > 0 ? at : 1, 0, { t:'shop2' }); }
  return st; };
if(typeof fleetShopHtml === 'function'){ const fleetShopHtmlBO0 = fleetShopHtml; fleetShopHtml = function(){ const h = fleetShopHtmlBO0(), t = waitLine(); return t ? h.replace('<div class="fs-act">', `<p class="bw-wait">${esc(t)}</p><div class="fs-act">`) : h; }; }

/* ---------- day 8's What's new: buy now or wait ---------- */
if(typeof INTRO !== 'undefined' && INTRO.fleet && WBS().chapter1BuyOnly){
  const I0 = INTRO.fleet;
  INTRO.fleet = Object.assign({}, I0, { title:'A second aircraft: buy now, or wait?',
    words:[['Buy', 'Pay the whole price now. The aircraft is yours.'], ['Save up', 'Keep the profit in the bank until there is enough.'], ['Days to wait', 'What is still to save ÷ the profit a day, rounded up.'], ['Assignment', 'Deciding which aircraft flies which route.']],
    what:() => { const ids = ['dhc6', 'sf34', 'at72'].filter(id => planeById(id)), cash = Math.round(S.cash);
      return [['Your airline can grow. In chapter 1 aircraft are bought outright: there is no renting yet.'],
        `<div class="ni-cards four">${ids.map(id => { const p = planeById(id), o = shopOffer(p, 8); return `<div class="ni-card"><em>${money(o.price)}</em><b>${esc(shortPlane(p))}</b><span>${p.seats} seats${o.price + (WORLD.cashReserve || 0) <= cash ? ' · you can afford it' : ''}</span></div>`; }).join('')}<div class="ni-card"><em>${money(cash)}</em><b>Your cash</b><span>Keep ${money(WORLD.cashReserve || 0)} back for emergencies.</span></div></div>`,
        ['If you can\'t afford the one you want, you can buy a smaller one now, or wait and save.', 'An aircraft costs its day cost whether it flies or not, so give it work.']]; },
    maths:() => [niRule('price − cash', '÷', 'profit a day', 'Days to wait'),
      `<div class="ni-eg"><p>A plane costs <b>£15,000</b>. You have <b>£9,000</b> and make <b>£1,500</b> a day.</p><p>Still to save: ${niSum('£15,000 − £9,000 = £6,000')}. Days: ${niSum('£6,000 ÷ £1,500 = 4')} days.</p><p class="ni-tip">If it doesn't come out exactly, round up: after the smaller number of days you are still short.</p></div>`],
    check:{ q:'A plane costs £20,000. You have £14,000 and make £2,000 a day. How many days until you can buy it?', opts:[['3 days', ''], ['10 days', '£20,000 ÷ £2,000 is 10, but you already have £14,000: use what is still to save.'], ['7 days', '£14,000 ÷ £2,000 is the cash you have. Still to save is £20,000 − £14,000.']], ok:0, done:'£20,000 − £14,000 = £6,000; £6,000 ÷ £2,000 = 3 days.' },
    think:['Is the bigger plane worth the wait? Look at what waiting costs.', 'Could a smaller plane now earn money while you save?'] });
}
/* for the tests */
function buyOnlyReport(){ const ids = ['dhc6', 'sf34', 'at72', 'e175', 'e190', 'b757']; return { on:buyOnlyOn(), offers:ids.filter(id => planeById(id)).map(id => { const o = shopOffer(planeById(id)); return { id, price:o.price, canBuy:o.canBuy, buyOffered:o.buyOffered, canLease:o.canLease, canFinance:o.canFinance }; }), waitFor:S.waitFor || null, ta:skills().timeToAfford || null }; }
