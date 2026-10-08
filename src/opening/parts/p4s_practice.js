/* ==================================================================
   PRACTICE (week-1 review, 8 Oct 2026): three questions wherever a skill is introduced, with fresh numbers each time.
   The pupil types the answer (or the time); a wrong answer gets a calm hint and another go; after three goes
   "Show me" gives the working and moves on. Continue waits for all three. Progress lives on the step (st.pq), so
   Back and reload resume. Every question answered goes into the teacher's by-hand log with the hand sums.
   A question never repeats the briefing's worked example (spec.avoid).
   ================================================================== */
const PQ_N = 3;
const pqRand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pqPick = (arr, not) => { const c = arr.filter(x => !(not || []).includes(x)); return c[Math.floor(Math.random() * c.length)]; };
const pqMoney = v => money(Math.round(v * 100) / 100).replace(/\.00$/, '');
/* litres × a decimal price, worked as pounds and pence */
function pqDecimalWorking(L, price){ const p = Math.round(price * 100), pounds = Math.floor(p / 100), pence = p % 100, a = L * pounds, b = L * pence / 100;
  return [`${num(L)} × £${pounds} = ${pqMoney(a)}`, `${num(L)} × ${pence}p = ${pqMoney(b)}`, `${pqMoney(a)} + ${pqMoney(b)} = ${pqMoney(a + b)}`]; }
function pqTensWorking(n, x, unit){ const u = v => unit === '£' ? pqMoney(v) : num(v); if(n <= 10) return [`${n} × ${u(x)} = ${u(n * x)}`]; const tens = Math.floor(n / 10) * 10, ones = n - tens;
  return [`${tens} × ${u(x)} = ${u(tens * x)}`, `${ones} × ${u(x)} = ${u(ones * x)}`, `${u(tens * x)} + ${u(ones * x)} = ${u(n * x)}`]; }
function pqTenthsWorking(n, mult){ const tenth = n / 10, k = Math.round(mult * 10);
  if(mult < 1) return [`One tenth of ${n} is ${num(tenth)}`, `${k} tenths: ${k} × ${num(tenth)} = ${num(k * tenth)}`];
  return [`One tenth of ${n} is ${num(tenth)}`, `${k - 10} tenths more: ${k - 10} × ${num(tenth)} = ${num((k - 10) * tenth)}`, `${n} + ${num((k - 10) * tenth)} = ${num(n * mult)}`]; }

/* Each spec: make(k, made) → the question's numbers; render(q) → { q (html), answer, kind ('n' | '£' | 'time'), hint, working[] }. */
const PRACTICE = {
  readyAgain:{ title:'Ready again', log:'Ready-again time: landing time + turnaround (three questions)',
    make(k){ const r = routeById(S.market), p = ourPlane(), D = TIME.day(p, [r.id, r.id]), t = D.trips[0], turnH = TIME.home(p), leg = TIME.leg(p, r), turnA = TIME.away(p, r);
      if(k === 0) return { kind:'today', arr:t.arr, turn:turnH };
      if(k === 1){ const dep = 8 * 60; return { kind:'eight', dep, leg, turnA, arr:dep + 2 * leg + turnA, turn:turnH }; }
      const dep2 = t.arr + turnH, arr2 = dep2 + 2 * leg + turnA; return { kind:'evening', dep:dep2, arr:arr2, turn:turnH + 10 }; },
    render(q){ const r = routeById(S.market), home = terminalData().name || homeData().city;
      const lead = q.kind === 'today' ? `Today's service lands back at <b class="mono">${fmtTime(q.arr)}</b>. The turnaround at ${esc(home)} takes <b class="mono">${fmtDur(q.turn)}</b>.`
        : q.kind === 'eight' ? `What if the first flight left at <b class="mono">${fmtTime(q.dep)}</b>? Out to ${esc(r.city)} (${fmtDur(q.leg)}), a ${fmtDur(q.turnA)} turnaround there, and back (${fmtDur(q.leg)}): it lands at <b class="mono">${fmtTime(q.arr)}</b>. Then the <b class="mono">${fmtDur(q.turn)}</b> turnaround at home.`
        : `The next service leaves at <b class="mono">${fmtTime(q.dep)}</b> and lands back at <b class="mono">${fmtTime(q.arr)}</b>. It is a busy evening, so this turnaround takes <b class="mono">${fmtDur(q.turn)}</b>.`;
      return { q:`${lead} When is the aircraft ready to fly again?`, answer:q.arr + q.turn, kind:'time', hint:`Start at ${fmtTime(q.arr)} and count on ${q.turn} minutes.`,
        working:[`${fmtTime(q.arr)} + ${fmtDur(q.turn)}`, q.turn > 30 ? `${fmtTime(q.arr)} + 30 min = ${fmtTime(q.arr + 30)}, then + ${q.turn - 30} min = ${fmtTime(q.arr + q.turn)}` : `= ${fmtTime(q.arr + q.turn)}`] }; } },

  fuelPrice:{ title:'Fuel cost', log:'Fuel: litres × price per litre with a decimal', avoid:[[1000, 1.3], [500, 1.3]],
    make(k, made, own){ if(own){ const O = pqOwn(), Ls = [O.litres, O.litres + 500, Math.max(100, O.litres - 500)].filter(x => !made.some(m => m.L === x)); return { L:pqPick(Ls.length ? Ls : [O.litres]), price:pqPick(O.prices, made.map(m => m.price)) }; }
      const prices = [1.2, 1.3, 1.4, 1.5].filter(x => Math.abs(x - fuelPrice()) > 0.001), L = [500, 1000, 1500, 2000, 2500].filter(x => !made.some(m => m.L === x));
      let q; for(let i = 0; i < 20; i++){ q = { L:pqPick(L), price:pqPick(prices, made.map(m => m.price)) }; if(!(PRACTICE.fuelPrice.avoid || []).some(([a, b]) => a === q.L && Math.abs(b - q.price) < 0.001)) break; } return q; },
    render(q){ return { q:`You buy <b class="mono">${num(q.L)} L</b> of fuel at <b class="mono">${priceL(q.price)}</b> a litre. What does it cost?`, answer:Math.round(q.L * q.price * 100) / 100, kind:'£',
      hint:`${priceL(q.price)} is £${Math.floor(q.price)} and ${Math.round(q.price * 100) % 100}p. Work out ${num(q.L)} × £${Math.floor(q.price)}, then ${num(q.L)} × ${Math.round(q.price * 100) % 100}p, and add them.`, working:pqDecimalWorking(q.L, q.price) }; } },

  weekend:{ title:'Weekend travellers', log:'Weekend demand: 7 in 10, 6 in 10 and 2 in 10 more',
    make(k, made, own){ const kinds = ['sat', 'sun', 'lei'].filter(x => !made.some(m => m.kind === x)), kind = pqPick(kinds);
      if(own){ const O = pqOwn(), n0 = Math.max(20, Math.round(O.weekday / 10) * 10), ns = [n0, n0 + 10, Math.max(10, n0 - 10)].filter(n => !made.some(m => m.n === n)); return { kind, n:pqPick(ns.length ? ns : [n0]) }; }
      const ns = [20, 30, 50, 60, 70, 80, 90].filter(n => !made.some(m => m.n === n)); return { kind, n:pqPick(ns) }; },
    render(q){ const ST = WORLD.settings || {}, m = q.kind === 'sat' ? (ST.weekendBusinessMultSat || 0.7) : q.kind === 'sun' ? (ST.weekendBusinessMultSun || 0.6) : (ST.weekendLeisureMult || 1.2), k = Math.round(m * 10);
      const text = q.kind === 'lei' ? `On a weekday <b>${q.n}</b> leisure travellers want to fly. At the weekend <b>${k - 10} in 10 more</b> want to fly. How many is that?`
        : `On a weekday <b>${q.n}</b> business travellers want to fly. On ${q.kind === 'sat' ? 'Saturday' : 'Sunday'} only <b>${k} in 10</b> of them fly. How many is that?`;
      return { q:text, answer:Math.round(q.n * m), kind:'n', hint:`One tenth of ${q.n} is ${q.n / 10}. ${q.kind === 'lei' ? `Add ${k - 10} tenths to ${q.n}.` : `Then ${k} tenths is ${k} × ${q.n / 10}.`}`, working:pqTenthsWorking(q.n, m) }; } },

  snackSales:{ title:'Cabin sales', log:'Cabin sales: number buying × price', avoid:[[10, 5]],
    make(k, made, own){ if(own){ const seats = ourPlane().seats, opts = Object.keys(ONBOARD).filter(x => ONBOARD[x].price > 0), o = ONBOARD[pqPick(opts)], b = Math.max(1, Math.floor(seats * (o.share || 0.5)) - (made.length ? made.length : 0)); return { b, price:o.price }; }
      const b = pqPick([7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19].filter(x => !made.some(m => m.b === x))), price = pqPick([3, 4, 5], made.length ? [made[made.length - 1].price] : []); return { b, price }; },
    render(q){ return { q:`On one flight <b>${q.b} passengers</b> buy a snack at <b class="mono">£${q.price}</b>. What are the cabin sales?`, answer:q.b * q.price, kind:'£', hint:q.b > 10 ? `Split ${q.b} into 10 and ${q.b - 10}: 10 × £${q.price}, then ${q.b - 10} × £${q.price}, and add them.` : `Count in ${q.price}s, ${q.b} times.`, working:pqTensWorking(q.b, q.price, '£') }; } },

  tickets:{ title:'Ticket revenue', log:'Ticket revenue: passengers × fare', avoid:[[12, 70], [16, 90]],
    make(k, made, own){ let q; if(own){ const O = pqOwn(), fares = O.fares.filter(f => !made.some(m => m.fare === f)); if(fares.length){ const fare = pqPick(fares); return { n:Math.min(ourPlane().seats, O.pax(fare)) || 12, fare, own:true }; } } for(let i = 0; i < 20; i++){ q = { n:pqPick([11, 13, 14, 15, 17, 18, 19].filter(x => !made.some(m => m.n === x))), fare:pqPick([65, 70, 75, 85, 90, 95], made.map(m => m.fare)) }; if(!PRACTICE.tickets.avoid.some(([a, b]) => a === q.n && b === q.fare)) break; } return q; },
    render(q){ const city = q.own ? routeById(S.market).city : (secondRouteOn() || S.phase === 'round' ? routeById(otherRoute()).city : routeById(S.market).city);
      return { q:`<b>${q.n} passengers</b> fly to ${esc(city)} at <b class="mono">£${q.fare}</b> each. What is the ticket revenue?`, answer:q.n * q.fare, kind:'£', hint:`Split ${q.n} into 10 and ${q.n - 10}: 10 × £${q.fare} is £${q.fare * 10}, then ${q.n - 10} × £${q.fare}, and add them.`, working:pqTensWorking(q.n, q.fare, '£') }; } },

  tenths:{ title:'In tenths', log:'Tenths of a number of passengers',
    make(k, made, own){ const ks = [6, 7, 8].filter(x => !made.some(m => m.k === x)), kk = pqPick(ks.length ? ks : [6, 7, 8]); if(own){ const O = pqOwn(), n0 = Math.max(20, Math.round(O.weekday / 10) * 10), ns = [n0, n0 + 10, Math.max(10, n0 - 10)].filter(n => !made.some(m => m.n === n)); return { k:kk, n:pqPick(ns.length ? ns : [n0]) }; }
      return { k:kk, n:pqPick([30, 50, 60, 70, 80, 90].filter(n => !made.some(m => m.n === n))) }; },
    render(q){ return { q:`<b>${q.n} passengers</b> want to fly with you. Only <b>${q.k} in 10</b> of them stay when a rival is cheaper. How many is that?`, answer:Math.round(q.n * q.k / 10), kind:'n', hint:`One tenth of ${q.n} is ${q.n / 10}. Then ${q.k} tenths is ${q.k} × ${q.n / 10}.`, working:pqTenthsWorking(q.n, q.k / 10) }; } },
  emptySeats:{ title:'Empty seats', log:'Empty seats: seats − passengers', avoid:[[19, 8], [19, 12]],
    make(k, made){ const seats = ourPlane().seats; return { seats, n:pqPick(Array.from({ length:seats - 3 }, (_, i) => i + 2).filter(x => x !== 8 && x !== 12 && !made.some(m => m.n === x))) }; },
    render(q){ return { q:`A service has <b>${q.seats} seats</b> and <b>${q.n} passengers</b>. How many seats are empty?`, answer:q.seats - q.n, kind:'n', hint:`Count up from ${q.n} to ${q.seats}.`, working:[`${q.seats} − ${q.n} = ${q.seats - q.n}`] }; } }
};

/* ---------- state on the step ---------- */
function pqState(st, key, n, own){
  n = n || PQ_N; const spec = PRACTICE[key]; if(!st.pq || st.pq.key !== key || st.pq.n !== n){ const made = []; for(let k = 0; k < n; k++) made.push(spec.make(k, made, own)); st.pq = { key, n, i:0, qs:made, done:[], tries:0, msg:'', show:null, right:0, shown:0 }; }
  return st.pq;
}
function pqN(st){ return st.pq && st.pq.n || PQ_N; }
function pqDone(st, key){ const P = st.pq; return !!(P && P.key === key && P.done.length >= P.n); }
/* the pupil's own figures for a practice round: his route's fares and passengers, his litres, his buyers, his weekday people */
function pqOwn(){ const r = routeById(S.market), F = r.fares || [r.basePrice], fare = fareOf(r.id), pl = typeof currentPlan === 'function' ? currentPlan() : null, L = pl && typeof plannedLitres === 'function' ? plannedLitres(pl) : 0;
  const prices = []; for(let i = 0; i <= (S.round || 0); i++){ const v = fuelPrice(i); if(v && !prices.includes(v)) prices.push(v); }
  return { route:r, fares:F.filter(x => x !== fare), pax:f => paxWant(r, f), litres:Math.max(100, Math.round(L / 100) * 100), prices:prices.filter(v => Math.abs(v - fuelPrice()) > 0.001).concat([1.2, 1.3, 1.4, 1.5]).filter((v, i, a) => a.indexOf(v) === i), weekday:(() => { try{ return withDay(Math.max(1, (S.day || 2) - 1), () => demandAt(r, fare)); }catch(e){ return demandAt(r, fare); } })() }; }
function pqParse(kind, raw){
  const s = String(raw || '').trim().toLowerCase(); if(!s) return null;
  if(kind === 'time'){ const m = s.replace(/\s/g, '').match(/^(\d{1,2})[:.h]?(\d{2})$/); return m ? (+m[1] % 24) * 60 + (+m[2]) : null; }
  const v = parseFloat(s.replace(/[−–]/g, '-').replace(/[£,\s]|litres?|people|seats?|l$/g, '').replace(/[^0-9.\-]/g, '')); return isFinite(v) ? v : null;
}
function pqFmt(kind, v){ return kind === 'time' ? fmtTime(v) : kind === '£' ? pqMoney(v) : num(v); }

/* ---------- the screen fragment ---------- */
function practiceHtml(st, key, n, own){
  const P = pqState(st, key, n, own), N = P.n, spec = PRACTICE[key], all = P.done.length >= N, i = Math.min(P.i, N - 1), q = spec.render(P.qs[i]);
  const dots = Array.from({ length:N }, (_, k) => `<i class="${P.done.includes(k) ? 'done' : k === i && !all ? 'now' : ''}"></i>`).join('');
  if(all) return `<div class="pq all"><div class="pq-top"><span class="pq-n">${N === 1 ? 'Done' : 'All done'}</span><span class="pq-dots">${dots}</span></div><p class="pq-ok">&#10003; ${P.right === N ? (N === 1 ? 'Right first time.' : `${N} out of ${N}.`) : `${P.right} right first time${P.shown ? `, ${P.shown} shown` : ''}.`}</p>${P.show ? `<div class="pq-work">${P.show.map(l => `<span class="mono">${esc(l)}</span>`).join('')}</div>` : ''}</div>`;
  const showing = P.show && P.showFor === i;
  return `<div class="pq"><div class="pq-top"><span class="pq-n">${N === 1 ? 'One question' : `Question ${i + 1} of ${N}`}</span><span class="pq-dots">${dots}</span></div>
    <p class="pq-q">${q.q}</p>
    ${showing ? `<div class="pq-work"><span class="kl">The working</span>${P.show.map(l => `<span class="mono">${esc(l)}</span>`).join('')}<b class="mono">= ${pqFmt(q.kind, q.answer)}</b></div><div class="pq-act"><button class="btn primary big" id="pqNext">${i + 1 < N ? 'Next question' : 'Done'} &#9654;</button></div>`
    : `<div class="pq-ans"><span class="unit">${q.kind === '£' ? '£' : ''}</span><input id="pqIn" class="mono" inputmode="${q.kind === 'time' ? 'numeric' : 'decimal'}" autocomplete="off" placeholder="${q.kind === 'time' ? 'hh:mm' : ''}" value="${esc(P.entry || '')}" aria-label="Your answer"><button class="btn primary big" id="pqCheck">Check</button></div>
      <p class="pq-msg ${P.ok ? 'ok' : ''}" role="status">${P.msg || ''}</p>
      ${P.tries >= 3 ? '<button class="link pq-show" id="pqShow">Show me</button>' : `<p class="pq-hint muted">${q.kind === 'time' ? 'Type the time, like 14:05, then press Check.' : 'Type the number, then press Check.'}</p>`}`}</div>`;
}
function bindPractice(st, key, onDone, n, own){
  const P = pqState(st, key, n, own), N = P.n, spec = PRACTICE[key], i = Math.min(P.i, N - 1), q = spec.render(P.qs[i]);
  const finishQ = () => { P.done.push(i); P.tries = 0; P.msg = ''; P.entry = ''; P.ok = false; P.show = null;
    if(P.done.length >= N){ st.done = true; pqLog(spec, P); if(onDone) onDone(); } else P.i = i + 1; render(); };
  const inp = $('pqIn'), card = screen().querySelector('.pq'); if(card) try{ card.scrollIntoView({ block:'nearest' }); }catch(e){}
  if(inp){
    inp.oninput = () => { P.entry = inp.value; if(P.msg){ P.msg = ''; const m = screen().querySelector('.pq-msg'); if(m){ m.textContent = ''; m.classList.remove('ok'); } } };
    inp.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); check(); } };
    setTimeout(() => { try{ inp.focus(); }catch(e){} }, 30);
  }
  function check(){
    const got = pqParse(q.kind, inp.value);
    if(got === null){ P.msg = q.kind === 'time' ? 'Type a time first, like 14:05.' : 'Type a number first.'; render(); return; }
    const okAns = q.kind === 'time' ? got === q.answer : Math.abs(got - q.answer) < 0.005;
    if(okAns){ if(P.tries === 0) P.right++; countTyped(); P.ok = true; P.msg = `&#10003; ${pqFmt(q.kind, q.answer)}`; P.show = null; render(); setTimeout(() => { if(st.pq === P && !P.done.includes(i)) finishQ(); }, 900); return; }
    P.tries++; P.ok = false;
    P.msg = P.tries === 1 ? `Not quite. ${q.hint}` : P.tries === 2 ? `Have another go: ${q.working[0]}${q.working.length > 1 ? ', then carry on.' : '.'}` : `Nearly there. Press Show me to see the working, or try once more.`;
    render();
  }
  on('pqCheck', check);
  on('pqShow', () => { P.shown++; P.show = q.working.slice(); P.showFor = i; if(typeof diagNote === 'function') diagNote({ kind:'practice answer shown', table:'practice:' + key, cell:'q' + (i + 1), stored:q.answer, typed:P.entry, tries:P.tries }); render(); });
  on('pqNext', finishQ);
}
/* The by-hand log the teacher sees, alongside the hand sums. */
function pqLog(spec, P){ (S.handSumLog = S.handSumLog || []).push({ day:S.day, date:dateShort(S.day), tools:[`Practice, ${spec.log} (${P.n}): ${P.right} of ${P.n} right first time${P.shown ? `, ${P.shown} shown` : ''}`] }); (S.practice = S.practice || []).push({ day:S.day, key:P.key, right:P.right, shown:P.shown }); }
