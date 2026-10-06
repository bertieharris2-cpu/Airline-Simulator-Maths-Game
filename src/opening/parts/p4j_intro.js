/* ==================================================================
   WHAT'S NEW: a short introduction whenever a beat brings a new idea (the beat's "intro" in data-world).
   Three pages, about a minute: what is new, the maths (the rule and a worked example), your turn (which sum?).
   The examples use the game's rules but never today's own figures, so the COST step still asks the pupil.
   It sits at the start of the PLAN stage (before fuel in the first month) and can be opened again from the rail.
   ================================================================== */
WS_STEPS.push('intro'); SHELL_STEPS.push('intro');
Object.assign(RAIL_LABEL, { intro:"What's new" });
Object.assign(SUB_DESC, { intro:'The new idea and its maths' });
Object.assign(STEP_HINT, { intro:'Something new arrives. Read what it is, look at the sum, then try one yourself.' });
STAGES.day[0].steps = ['intro'].concat(STAGES.day[0].steps);
STAGES.week[0].steps = ['intro'].concat(STAGES.week[0].steps);
(STAGES.month || []).forEach(g => { if(g.id === 'plan') g.steps = ['intro'].concat(g.steps); });
(STAGES.year || []).forEach(g => { if(g.id === 'proj') g.steps = ['intro'].concat(g.steps); });
(STAGES.buy || []).forEach(g => { if(g.id === 'pick') g.steps = ['intro'].concat(g.steps); });

/* The beat's intro goes just before the step that uses the new idea. */
function withIntro(steps, w){
  const I = w && w.intro && INTRO[w.intro]; if(!I) return steps;
  const at = steps.findIndex(s => s.t === (I.before || 'planner'));
  if(at < 0) return steps;
  return steps.slice(0, at).concat([{ t:'intro', key:w.intro, page:0 }], steps.slice(at));
}
function introNow(){ const st = S.steps && S.steps.find(s => s.t === 'intro'); return st ? INTRO[st.key] : null; }

/* ---------- small pictures ---------- */
const niDots = (n, on, cls) => `<span class="ni-dots">${Array.from({ length:n }, (_, k) => `<i class="${k < on ? cls || 'on' : ''}"></i>`).join('')}</span>`;
const niSum = s => `<span class="ni-sum mono">${s}</span>`;
const niRule = (a, op, b, res) => `<div class="ni-rule"><b>${res}</b><i>=</i><span>${a}</span><i>${op}</i><span>${b}</span></div>`;
function niPrices(from, to){
  const L = []; for(let i = Math.max(0, from); i <= to; i++) L.push([beatLabel(i), fuelPrice(i)]);
  const mx = Math.max(...L.map(x => x[1])), mn = Math.min(...L.map(x => x[1])) - 0.15;
  return `<div class="ni-prices">${L.map(([l, v], k) => `<div class="${k === L.length - 1 ? 'now' : ''}"><b class="mono">${priceL(v)}</b><i style="--h:${Math.round(18 + 70 * (v - mn) / Math.max(0.01, mx - mn))}"></i><span>${esc(k === L.length - 1 ? 'Now' : l)}</span></div>`).join('')}</div>`;
}

/* ---------- the introductions ---------- */
const INTRO = {
  snacks:{ kicker:'New today · On board', title:'Snacks on board', words:[['Cabin sales', 'Money from selling snacks on board. It is added to your revenue.'], ['Stock', 'The snacks you buy so you can sell them. It is a cost.']],
    what:() => [['A catering company can supply snacks for your flights. Each day you choose what happens on board.'],
      `<div class="ni-cards four">${Object.keys(ONBOARD).map(k => { const o = ONBOARD[k], big = k === 'none' ? '—' : o.free ? 'Free' : money(o.price);
        const rule = k === 'none' ? 'No snacks. No extra money and no extra cost.' : o.free ? `Every passenger gets one. It costs ${money(o.costPax)} a passenger. Passengers like it.` : `${o.share === 0.5 ? 'About half' : `About ${Math.round(o.share * 10)} in 10`} of passengers buy one. Each snack costs ${money(o.costItem)} to stock.`;
        return `<div class="ni-card"><em>${big}</em><b>${esc(o.label)}</b><span>${rule}</span></div>`; }).join('')}</div>`,
      ['The money from snacks is called <b>cabin sales</b>. It is added to your revenue.']],
    maths:() => { const n = ourPlane().seats, o = ONBOARD.sell3, b = Math.floor(n * o.share);
      return [niRule('number buying', '×', 'price', 'Cabin sales'),
        `<div class="ni-eg"><p>One full ${esc(ourPlane().name.replace(/^DHC-6 /, ''))}: <b>${n} passengers</b>. At ${money(o.price)}, about half of them buy a snack.</p>${niDots(n, b, 'buy')}
          <p>Half of ${n} is ${n / 2}. You can't sell half a snack, so <b>${b}</b> people buy.</p>
          <p>Cabin sales: ${niSum(`${b} × ${money(o.price)} = ${money(b * o.price)}`)}</p>
          <p class="ni-cost">The stock is a cost: ${niSum(`${b} × ${money(o.costItem)} = ${money(b * o.costItem)}`)}</p></div>`]; },
    check:{ q:'On one flight, 10 passengers buy a snack at £5. Which sum works out the cabin sales?', opts:[['10 + £5', 'Adding gives £15, but every one of the 10 passengers pays £5.'], ['10 × £5', ''], ['10 ÷ £5', 'Dividing shares something out. Here each of the 10 passengers pays £5.']], ok:1, done:'10 × £5 = £50 of cabin sales.' },
    think:['Which brings in more money: more people buying at £3, or fewer people at £5?', 'Remember the stock costs money too. You can try each choice in the Test step.'] },

  fuel:{ kicker:'New today · Fuel', title:'Buying fuel', before:'planner', words:[['Litre (L)', 'How fuel is measured.'], ['Price per litre', 'What one litre costs today. It changes.'], ['Tank', () => `Where your fuel is kept. It holds ${num(tankCapacity())} L.`], ['Fuel cost', 'The fuel your flights burn, at the price you paid for it.']],
    what:() => { const r = routeById(S.market), per = fuelForTrip(ourPlane(), r);
      return [['The launch deal is over. From today your airline buys its own fuel, and fuel is sold by the litre.'],
        `<div class="ni-flow"><div><span class="kl">Cash</span><b class="mono">${money(S.cash)}</b><small>pays for fuel</small></div><i>→</i><div><span class="kl">Your tank</span><b class="mono">${num(S.fuel)} L</b><small>holds ${num(tankCapacity())} L</small></div><i>→</i><div><span class="kl">Each ${esc(r.city)} service burns</span><b class="mono">${num(per)} L</b><small>out and back</small></div></div>`,
        ['You buy fuel before you fly. It goes into your tank, and your flights burn it.', `The price changes from day to day. Today it is <b class="mono">${priceL(fuelPrice())}</b> a litre.`],
        niPrices(0, S.round)]; },
    maths:() => [niRule('litres', '×', 'price per litre', 'Cost'),
      `<div class="ni-eg"><p>Buying <b>500 L</b> at <b>£1.30</b> a litre: ${niSum('500 × £1.30 = £650')}</p>
        <p class="ni-tip">One way to work it out: ${niSum('500 × £1 = £500')} and ${niSum('500 × 30p = £150')}, then ${niSum('£500 + £150 = £650')}</p>
        <p>The same sum works out the <b>fuel cost</b> of a day's flying: the litres your flights burn × the price per litre. You will work out today's on the Cost step.</p></div>`],
    check:{ q:'You want to buy 1,000 L of fuel at £1.30 a litre. Which sum works out the cost?', opts:[['1,000 + £1.30', 'Adding gives £1,001.30, but every one of the 1,000 litres costs £1.30.'], ['1,000 × £1.30', ''], ['1,000 ÷ £1.30', 'Dividing shares something out. Here each of the 1,000 litres costs £1.30.']], ok:1, done:'1,000 × £1.30 = £1,300.' },
    think:['Fuel prices go up and down, like in the real world. Keep an eye on the price and the news.', () => `Your tank holds ${num(tankCapacity())} L. Why might an airline buy more fuel than it needs today?`] },

  times:{ kicker:'New today · Times of day', title:'Departure times', words:[['Departure time', 'When a service leaves your home airport.'], ['Empty seats', 'Seats with nobody in them.'], ['Crew', `The pilots who fly the aircraft. A crew can work ${fmtDur(WORLD.crewDutyMin || 720)} a day.`]],
    what:() => { const r = routeById(S.market), fare = fareOf(S.market), P = demandPools(r, fare), mx = Math.max(1, ...BANDS.map(b => P[b] || 0), P.flex || 0);
      const col = (n, l, s, cls) => `<div class="${cls || ''}"><b class="mono">${n}</b><i style="--h:${Math.round(8 + 92 * n / mx)}"></i><span>${l}</span><small>${s}</small></div>`;
      return [['Yesterday some flights were full and others had empty seats. People want to fly at different times of day.'],
        `<div class="ni-bands"><p class="kl">${flagSvg(r.flag, 14)} The ${P.W} people who want to fly to ${esc(r.city)} at ${money(fare)}</p><div class="nb-cols">${BANDS.map(b => col(P[b] || 0, BAND_SHORT[b], bandSpan(b))).join('')}${col(P.flex || 0, 'Any time', 'will take any service', 'flex')}</div></div>`,
        [`Now you choose a <b>departure time</b> for each service. A crew can work ${fmtDur(WORLD.crewDutyMin || 720)}: from half an hour before the first departure to half an hour after the last landing. A longer day needs a second crew (${money(WORLD.crewCost || 250)}).`]]; },
    maths:() => { const n = ourPlane().seats;
      return [niRule('seats', '−', 'passengers', 'Empty seats'),
        `<div class="ni-eg"><p>A ${n}-seat service with <b>8 passengers</b>:</p>${niDots(n, 8)}<p>${niSum(`${n} − 8 = ${n - 8}`)} empty seats.</p>
          <p class="ni-tip">The crew's day: first departure <b class="mono">07:00</b>, last landing <b class="mono">18:45</b>. The crew works from <b class="mono">06:30</b> to <b class="mono">19:15</b>: ${niSum('12 h 45 min')}. That is more than ${fmtDur(WORLD.crewDutyMin || 720)}, so a second crew is needed.</p></div>`]; },
    check:{ q:() => `A service has ${ourPlane().seats} seats and 12 passengers. Which sum works out the empty seats?`, opts:() => { const n = ourPlane().seats; return [[`${n} + 12`, `Adding gives ${n + 12}: more than the seats on the aircraft.`], [`${n} − 12`, ''], [`${n} × 12`, 'Multiplying makes it much bigger. The empty seats are the ones left over.']]; }, ok:1, done:() => `${ourPlane().seats} − 12 = ${ourPlane().seats - 12} empty seats.` },
    think:['When do most of your passengers want to fly?', 'Which departure times would fill your seats?'] },

  route:{ kicker:'New today · A second route', title:() => `A second route: ${routeById(otherRoute()).city}`, words:[['Route', 'A place your airline flies to, and back.'], ['Ticket revenue', 'The money from tickets: passengers × fare.']],
    what:() => { const p = ourPlane(), card = id => { const r = routeById(id), f = fareOf(id) || r.basePrice;
        return `<div class="ni-card rt"><em>${flagSvg(r.flag, 30)}</em><b>${esc(r.city)}</b><span><b class="mono">${num(Math.round(routeKm(r)))} km</b> · <b class="mono">${fmtDur(legMinutes(p, r))}</b> each way</span><span><b class="mono">${paxWant(r, f)}</b> people want to fly at <b class="mono">${money(f)}</b></span></div>`; };
      return [[`A second market is open. Your one aircraft can now fly to ${esc(routeById(S.market).city)} and to ${esc(routeById(otherRoute()).city)}.`],
        `<div class="ni-cards two">${card(S.market)}${card(otherRoute())}</div>`,
        ['One aircraft can\'t be in two places at once, so you share its day between the two routes.']]; },
    maths:() => { const a = routeById(S.market).city, b = routeById(otherRoute()).city;
      return [niRule('passengers', '×', 'fare', 'Ticket revenue'),
        `<div class="ni-eg"><p>Each route has its own tickets. If <b>12 people</b> fly to ${esc(b)} at <b>£70</b>: ${niSum('12 × £70 = £840')}</p>
          <p class="ni-tip">One way to work it out: ${niSum('10 × £70 = £700')} and ${niSum('2 × £70 = £140')}, then ${niSum('£700 + £140 = £840')}</p>
          <p>Then add the routes together: ${niSum(`${esc(a)} tickets + ${esc(b)} tickets = ticket revenue`)}</p></div>`]; },
    check:{ q:() => `16 passengers fly to ${routeById(otherRoute()).city} at £90 each. Which sum works out the ticket revenue?`, opts:[['16 + £90', 'Adding gives £106, but every one of the 16 passengers pays £90.'], ['16 × £90', ''], ['£90 − 16', 'Taking away makes it smaller. Each of the 16 passengers pays £90.']], ok:1, done:'16 × £90 = £1,440.' },
    think:[() => `How will you share the aircraft's day between ${routeById(S.market).city} and ${routeById(otherRoute()).city}?`, 'Where are more people waiting for a seat?'] },

  week:{ kicker:'New this week · Weeks', title:'Planning a whole week', words:[['Projection', 'What you expect to happen, worked out from your plan.'], ['Week', 'Seven days: Monday to Sunday.']],
    what:() => [['Your timetable now runs every day by itself. From now on you plan <b>a whole week</b> at a time: seven days with the same plan.'],
      `<div class="ni-week">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div><b>${d}</b><span>same plan</span></div>`).join('')}</div>`,
      [`In the weeks, fuel is bought as it is used, at that week's price (<b class="mono">${priceL(fuelPrice())}</b> a litre this week). There are no fuel orders.`]],
    maths:() => [niRule('profit a day', '×', '7 days', 'Profit this week'),
      `<div class="ni-eg"><p>If one day makes <b>£500</b> profit: ${niSum('£500 × 7 = £3,500')}</p>
        <p class="ni-tip">One way to work it out: × 7 is × 5 and × 2. ${niSum('£500 × 5 = £2,500')} and ${niSum('£500 × 2 = £1,000')}, then ${niSum('£2,500 + £1,000 = £3,500')}</p></div>`],
    check:{ q:'Each day makes £600 profit. Which sum works out the profit for the week?', opts:[['£600 + 7', 'Adding gives £607: that is only a little more than one day.'], ['£600 × 7', ''], ['£600 ÷ 7', 'Dividing shares one day\'s profit out. A week has 7 days of profit.']], ok:1, done:'£600 × 7 = £4,200.' },
    think:['If every day has the same plan, why might one week make more money than another?', 'Read the news each week.'] },

  tank:{ kicker:'New this month · Fuel', title:'Buying fuel ahead', before:'fuelPlan', words:[['Tank', () => `Where your fuel is kept. It holds ${num(tankCapacity())} L.`], ['Buying ahead', 'Buying fuel now for flights later.'], ['Delivered automatically', `If the tank runs out, fuel is delivered at the price that day plus ${Math.round(100 * (WORLD.fuelTopUp || 0.1))}p a litre.`]],
    what:() => { const need = periodNeed();
      return [['From now on you plan a month at a time, and fuel goes back into your tank. <b>You decide when to buy fuel, and how much.</b>'],
        `<div class="ni-flow"><div><span class="kl">Your tank holds</span><b class="mono">${num(tankCapacity())} L</b><small>${num(S.fuel)} L in it now</small></div><div><span class="kl">This month's flights burn about</span><b class="mono">${num(need)} L</b><small>${need > tankCapacity() ? 'more than the tank holds' : 'less than the tank holds'}</small></div><div><span class="kl">If the tank runs out</span><b class="mono">+ ${Math.round(100 * (WORLD.fuelTopUp || 0.1))}p</b><small>a litre, delivered automatically</small></div></div>`,
        ['The price of fuel changes, like in the real world. Here is the price so far:'], niPrices(S.round - 5, S.round)]; },
    maths:() => [niRule('litres', '×', 'price per litre', 'Cost'),
      `<div class="ni-eg"><p>The same <b>2,000 L</b> at two different prices:</p>
        <p>At £1.50 a litre: ${niSum('2,000 × £1.50 = £3,000')}</p><p>At £1.60 a litre: ${niSum('2,000 × £1.60 = £3,200')}</p>
        <p>The difference: ${niSum('£3,200 − £3,000 = £200')}</p></div>`],
    check:{ q:'One month fuel costs £1.50 a litre. The next month it costs £1.60. Which sum shows how much more each litre costs?', opts:[['£1.60 + £1.50', 'Adding gives £3.10: that is two litres, one at each price.'], ['£1.60 − £1.50', ''], ['£1.60 × £1.50', 'Multiplying two prices doesn\'t give a price. The difference is what is left when you take one from the other.']], ok:1, done:'£1.60 − £1.50 = 10p more for every litre.' },
    think:[() => `Your tank holds ${num(tankCapacity())} L. What does the news say about fuel?`, 'When would you fill the tank?'] },

  year:{ kicker:'New this stage · The year ahead', title:'Projecting the year', before:'yearPlan', go:'Project the year', words:[['Projection', 'What you expect to happen, worked out from what has happened so far.'], ['Average month', 'The profit of a typical month: the total shared equally between the months.'], ['Emergency money', () => `Cash kept in the bank for when things go wrong: ${money(reserveNow())}.`], ['Rounded up', 'Go up to the next whole number: 2.4 months becomes 3 months.']],
    what:() => { const d0 = S.period ? S.period.from : S.day, months = []; for(let d = monthStart(d0), k = 0; k < 8; k++, d = monthEnd(d) + 1) months.push([monthName(d, true), monthEnd(d) - d + 1]);
      return [['From now on the airline runs on its own until the end of April. Before it does, you will work out <b>where the airline will be next May</b>, and <b>when you could afford a second aircraft</b>.'],
        `<div class="ni-week months">${months.map(([m, n]) => `<div><b>${m}</b><span>${n} days</span></div>`).join('')}</div>`,
        `<div class="ni-flow"><div><span class="kl">Cash now</span><b class="mono">${money(Math.round(S.cash))}</b><small>in the bank today</small></div><div><span class="kl">Kept back for emergencies</span><b class="mono">${money(reserveNow())}</b><small>always stays in the bank</small></div><div><span class="kl">Months to project</span><b class="mono">8</b><small>September to April</small></div></div>`]; },
    maths:() => [niRule('cash now', '+', 'average month × months', 'Cash in May'),
      `<div class="ni-eg"><p>An airline with <b>£100,000</b> that makes about <b>£30,000</b> a month: ${niSum('£30,000 × 8 = £240,000')}, then ${niSum('£100,000 + £240,000 = £340,000')}</p>
        <p><b>When could it afford a £100,000 aircraft?</b> Say it has £60,000 and keeps £20,000 back: ${niSum('£60,000 − £20,000 = £40,000')} to spend.</p>
        <p>${niSum('£100,000 − £40,000 = £60,000')} still needed. At £25,000 a month: ${niSum('£60,000 ÷ £25,000 = 2.4')}. You can't buy it part-way through a month, so round up: <b>3 months</b>.</p></div>`],
    check:{ q:'An airline makes about £20,000 profit a month. Which sum projects the profit for 8 months?', opts:[['£20,000 + 8', 'Adding gives £20,008: hardly more than one month.'], ['£20,000 × 8', ''], ['£20,000 ÷ 8', 'Dividing shares one month\'s profit out. Eight months each bring about £20,000.']], ok:1, done:'£20,000 × 8 = £160,000.' },
    think:['Is every month like the average month? Think about winter, and about fuel prices.', 'Why keep money back for emergencies?'] },

  buy:{ kicker:'New this stage · A second aircraft', title:'Buying an aircraft', before:'shop', go:'Look at the aircraft', words:[['Investment', 'Spending money now to make more money later.'], ['Pays for itself', 'When the extra profit it makes adds up to its price.'], ['Running cost', 'What an aircraft costs for each hour in the air, and each day it is owned.']],
    what:() => [['A year of flying has built up cash. A second aircraft could carry the people who couldn\'t get a seat, but it costs money to buy and money every day.'],
      `<div class="ni-cards two">${NEXT_AIRCRAFT.map(id => { const pl = planeById(id); return `<div class="ni-card rt"><em class="mono">${money(pl.price)}</em><b>${esc(pl.name)}</b><span><b class="mono">${pl.seats}</b> seats · <b class="mono">${money(pl.hourCost || 0)}</b> an hour in the air</span><span><b class="mono">${money(pl.dayCost || 0)}</b> a day to own</span></div>`; }).join('')}</div>`,
      [`Whatever you choose, <b class="mono">${money(reserveNow())}</b> stays in the bank for emergencies.`]],
    maths:() => [niRule('extra profit a day', '×', '30 days', 'Extra a month'),
      niRule('price', '÷', 'extra a month', 'Months to pay for itself'),
      `<div class="ni-eg"><p>An aircraft costs <b>£12,000</b> and adds <b>£150</b> profit a day: ${niSum('£150 × 30 = £4,500')} a month.</p>
        <p>${niSum('£12,000 ÷ £4,500 = 2.67')}. Round up: it pays for itself in <b>3 months</b>.</p></div>`],
    check:{ q:'An aircraft costs £8,000 and adds £2,000 profit a month. Which sum gives the months it takes to pay for itself?', opts:[['£8,000 − £2,000', 'Taking away gives what is still to pay after one month, not the number of months.'], ['£8,000 ÷ £2,000', ''], ['£8,000 × £2,000', 'Multiplying makes a huge number. How many £2,000s make £8,000?']], ok:1, done:'£8,000 ÷ £2,000 = 4 months.' },
    think:['Are there enough people without a seat to fill a bigger aircraft?', 'What happens to the emergency money if you buy it?'] }
};
const niVal = v => typeof v === 'function' ? v() : v;

/* ---------- the screen ---------- */
const NI_PAGES = ["What's new", 'The maths', 'Your turn'];
R.intro = st => {
  const I = INTRO[st.key]; if(!I){ next(); return; }
  const page = clamp(st.page || 0, 0, 2), C = I.check, opts = niVal(C.opts), picked = st.pick, right = st.done;
  st.seen = Math.max(st.seen || 0, page);
  const para = a => a.map(l => `<p>${l}</p>`).join(''), block = x => Array.isArray(x) ? `<div class="ni-text">${para(x)}</div>` : x;
  let body = '';
  if(page === 0) body = I.what().map(block).join('');
  else if(page === 1) body = I.maths().map(block).join('');
  else body = `<p class="ni-q">${esc(niVal(C.q))}</p><div class="ni-opts">${opts.map(([t], k) => `<button class="ni-opt ${picked === k ? (k === C.ok ? 'right' : 'wrong') : ''} ${right && k === C.ok ? 'right' : ''}" data-ni="${k}" ${right ? 'disabled' : ''}><span class="mono">${esc(t)}</span></button>`).join('')}</div>
    <div class="ni-fb" aria-live="polite">${right ? `<p class="ni-yes">&#10003; ${esc(niVal(C.done))}</p>` : picked !== undefined && picked !== C.ok ? `<p class="ni-no">${esc(opts[picked][1])} Have another go.</p>` : ''}</div>
    ${right ? `<div class="ni-think"><span class="kl">Think about it as you plan</span>${I.think.map(l => `<p>${esc(niVal(l))}</p>`).join('')}</div>` : ''}`;
  const tabs = `<ol class="ni-tabs">${NI_PAGES.map((l, k) => `<li><button class="${k === page ? 'on' : ''} ${k < page || (k <= st.seen) ? 'seen' : ''}" data-nip="${k}" ${k <= (st.seen || 0) ? '' : 'disabled'}><i>${k < page || (k === 2 && right) ? '&#10003;' : k + 1}</i>${l}</button></li>`).join('')}</ol>`;
  const sayText = (page === 2 ? [niVal(C.q)].concat(opts.map(o => o[0])) : (page === 0 ? I.what() : I.maths()).filter(Array.isArray).flat()).join(' ').replace(/<[^>]+>/g, '').replace(/×/g, 'times').replace(/−/g, 'minus');
  const W = PW(), go = I.go || (W.span === 'day' ? "Plan today's flying" : I.before === 'fuelPlan' ? 'Buy fuel' : `Plan the ${W.span}`);
  screen().innerHTML = taskFrame({ question:`<span class="ni-kick">${esc(I.kicker)}</span>${esc(niVal(I.title))}`, work:false, say:sayText,
    context:{ title:'Key words', html:cxSec('New words', `<dl class="ni-words">${I.words.map(([w, m]) => `<dt>${esc(w)}</dt><dd>${esc(niVal(m))}</dd>`).join('')}</dl>`) },
    main:`<div class="ni p${page}">${tabs}<div class="ni-page">${body}</div></div>`,
    foot:`${page ? '<button class="btn big" id="niBack">&#9664; Back</button>' : ''}<span class="grow"></span>${page < 2 ? `<button class="btn primary big" id="niNext">${NI_PAGES[page + 1]} &#9654;</button>` : `<button class="btn primary big" id="nx" ${right ? '' : 'disabled'}>${right ? goLabel(go) : 'Choose a sum first'} &#9654;</button>`}` });
  const go2 = k => { st.page = k; render(); };
  on('niBack', () => go2(page - 1)); on('niNext', () => go2(page + 1));
  screen().querySelectorAll('[data-nip]').forEach(b => b.onclick = () => go2(+b.getAttribute('data-nip')));
  screen().querySelectorAll('[data-ni]').forEach(b => b.onclick = () => { const k = +b.getAttribute('data-ni'); st.pick = k; if(k === C.ok) st.done = true; render(); });
  on('nx', () => { UI.justDone = null; advance(); });
};
