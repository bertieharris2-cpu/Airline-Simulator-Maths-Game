/* =====================================================================
   THE PLAY-TEST OF 21 OCTOBER (Claude Design's handover of 21 Oct 2026; Bertie approved each item on mock-ups of the real
   screens). Year one only: behaviour behind yearOne(), CSS under body.yr1 (p1_head_h21.css). Reassignment only.
   - The screen text the round adds comes from the workbook's ScreenText sheet (h21Text), with the same words here for a
     workbook without the sheet.
   - 1  The Fuel desk tour darkens everything except the panel it describes (h21Spot); its words and boxes are in p5q.
   - 2  Star rating: no "What it is worth" panel; "What moves it from now" runs the full width.
   - 3  Flight times on a small sheet (the pupil's routes from SheetSums, the rest ƒ).
   - 4–5 What's new comes first: the week plan opener's NEW row, and first-time callouts on the opener and in the Studio.
   - 6  The Changes sheet's callout beside the Difference column.
   - 7  The Operations Wall's profit graph: title after the tab, axis titles, round ticks, the key at the top right.
   - 8–9 The Sunday review: formula-only sums (the sheet adds up), Σ SUM by dragging from week 3; routes not flown as a chance.
   - 10 Launch Day's first ticket column is a Build (SheetSums: B4 build, C4 · D4 book).
   ===================================================================== */

/* ---------- the workbook's screen text ---------- */
const H21_TEXT = {
  'fuel.tour.1':{ title:'Your tank', text:['holds {capacity}, {weeks}. The dashed line shows the {need} this week needs.'], button:'Next ▶' },
  'fuel.tour.2':{ title:'Market:', text:["today's price for a litre, and what it might cost next week. The news underneath says why."], button:'Next ▶' },
  'fuel.tour.3':{ title:'Place a purchase order:', text:['choose how many litres to buy. Then build the cost on the sheet and work it out in your book.'], button:'Got it' },
  'opener.newRoutes':{ eyebrow:'NEW', text:['{Count} new routes open: {routes}.'], button:'Add a route ›' },
  'opener.newRoute':{ eyebrow:'NEW', text:['A new route opens: {routes}.'], button:'Add a route ›' },
  'opener.weekends':{ eyebrow:'NEW · WEEKENDS', title:'Plan Saturday and Sunday on their own', text:["Different numbers of people want to fly at the weekend. Switch to **Sat–Sun** to see the weekend's flights, then edit the plan to fit."], button:'Got it' },
  'studio.routes':{ eyebrow:'NEW · ROUTES', title:'{Count} new routes open this week', text:['{routes}. Add one here, then give it flights on the timetable.'], button:'Got it' },
  'studio.route':{ eyebrow:'NEW · ROUTES', title:'A new route opens this week', text:['{routes}. Add it here, then give it flights on the timetable.'], button:'Got it' },
  'studio.weekends':{ eyebrow:'NEW · WEEKENDS', title:'Plan Saturday and Sunday on their own', text:['Different numbers of people want to fly at the weekend. Switch to **Sat–Sun** to see them, and give those days their own flights.'], button:'Got it' },
  'changes.difference':{ eyebrow:'NEW · YOUR CHANGE', title:'What the Difference column means', text:['**Difference = [A] With your change − [B] Now**', '{signs}', 'First, work out **{cell}**: the difference in {row}.'], button:'Got it' },
  'changes.line':{ text:['Read the note beside the sheet, then press **Got it**.'] },
  'review.sumSkill':{ eyebrow:'NEW SKILL · SUM', title:'Add a whole column at once', text:["Press **Σ SUM**, then drag down the **Profit** column, from Monday's profit to Sunday's.", 'The sheet adds every cell you drag over: **=SUM({range})**.'], button:'Got it' },
  'review.sum.wait':{ text:['Press **Σ SUM**, then drag down the Profit column from {first} to {last}. The sheet adds them up.'] },
  'review.sum.go':{ text:['Now drag down the Profit column, from {first} to {last}.'] },
  'review.sum.drag':{ text:["Let go on {lastDay}'s profit ({cell}), then press Enter."] },
  'review.total.done':{ text:['✓ The sheet added the {days} days: **{total}**. Next: the difference from the plan, in your book.'] },
  'review.total.card':{ eyebrow:'FORMULA', title:'Profit this week = add the {days} days', text:['Click each day into the formula. The sheet adds them up.'] },
  'review.total.cardSum':{ eyebrow:'FORMULA', title:'Profit this week = add the {days} days', text:['=SUM({range}) added {first} to {last}.'] },
  'review.average.card':{ eyebrow:'FORMULA', title:'Average a day = profit this week ÷ days flown', text:['Click the two cells. The sheet works it out.'] },
  'review.average.done':{ text:['✓ The sheet worked out the average: **{mean}** a day.'] },
  'review.footer':{ text:['Build each formula by clicking the cells. The sheet adds up; work out the difference from the plan in your book.'] },
  'review.unflown':{ title:'You could fly these new routes.', text:['Red Kite flies them for now, so fewer people are left wanting to fly with you each day: {list}'] },
  'flightTimes.line':{ text:['Work it out in your book. Write **Sum {n}** beside it, then type the time in **{cell}**.'], button:'Give me a hint' },
  'flightTimes.build':{ text:['Click the cells to build the formula. Then work it out in your book and type the time in **{cell}**.'] },
  'flightTimes.formula':{ text:['Click the cells to build the formula. The sheet works out the time in **{cell}**.'] },
  'flightTimes.f':{ text:['ƒ worked out for you'] },
  'flightTimes.footer':{ text:['Work out the flight times on the sheet, then go on to the timetable.'] },
  'flightTimes.card':{ title:'Flight time = distance ÷ speed', text:['{plane} to {route}'] } };
/* a row of screen text with its {names} filled (the values are plain text) */
function h21Text(id, vars){
  const w = (typeof WB !== 'undefined' && WB && WB.screenText && WB.screenText[id]) || H21_TEXT[id] || {}, V = vars || {};
  const fill = s => String(s || '').replace(/\{(\w+)\}/g, (m, k) => V[k] !== undefined && V[k] !== null ? String(V[k]) : m);
  return { eyebrow:fill(w.eyebrow), title:fill(w.title), text:(w.text || []).map(fill).filter(Boolean), button:String(w.button || '') };
}
/* the text as HTML: escaped, then **bold** and the [A] / [B] tags */
function h21Html(s){ return esc(String(s || '')).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\[([AB])\]/g, '<i class="h21-tg">$1</i>'); }
const H21_NUM = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const h21Words = n => H21_NUM[n] || String(n);
function h21List(names){ return names.length < 2 ? names.join('') : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1]; }

/* ---------- 1. a tour darkens the rest of the screen (DESIGN.md, the attention system: Local spotlight) ----------
   Everything except the panel being described (and the tour's own box) sits under rgba(1,6,14,.44): the header, the
   desks, the other panels and the footer. One fixed layer with holes cut for the lit parts, so the panel keeps its own
   look. It only darkens: a click still reaches what is under it, as before. Redrawn after each render and on resize; gone
   when no tour is showing. */
function h21Spot(els){
  let svg = document.getElementById('h21Spot'); const list = (els || []).filter(Boolean);
  if(!list.length || document.querySelector('#bfLayer')){ if(svg) svg.remove(); return; }
  const W = window.innerWidth, H = window.innerHeight, hole = e => { const b = e.getBoundingClientRect(); return `M${b.left - 2} ${b.top - 2}h${b.width + 4}v${b.height + 4}h${-(b.width + 4)}z`; };
  if(!svg){ svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.id = 'h21Spot'; svg.setAttribute('aria-hidden', 'true'); document.body.appendChild(svg); }
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
  svg.innerHTML = `<path fill-rule="evenodd" d="M0 0H${W}V${H}H0z ${list.map(hole).join(' ')}"/>`;
}
function h21SpotOff(){ const s = document.getElementById('h21Spot'); if(s) s.remove(); }
/* the Fuel desk tour: the lit panel and its box */
function h21FuelSpot(){
  const st = typeof fd2TourStep === 'function' && fd2On() ? fd2TourStep() : 0, root = screen();
  if(!st || !root.querySelector('.fd2')){ h21SpotOff(); return; }
  h21Spot([root.querySelector('.fd2 .fd2-on'), root.querySelector('.fd2 .fd2-tour:not(.h21-ghost)')]);
}
const h21Render0 = render;
render = function(){ h21SpotOff(); const r = h21Render0.apply(this, arguments); try{ h21FuelSpot(); }catch(e){} return r; };
window.addEventListener('resize', () => { try{ if(document.getElementById('h21Spot')) h21FuelSpot(); }catch(e){} });

/* ---------- 2. the star rating: no "What it is worth" (p5w, d104StarsCardHtml); the drivers run the full width ---------- */

/* ---------- 7. the profit graph (DESIGN.md, Graphs): the title follows the tab, the key sits at the top right, both axes are
   named in words, the ticks are round, each bar carries its week and dates, and the week being flown says how far it has got.
   The bars, the projections and the seats line are drawn as before (p5h, s3Graph). The words sit over the drawing (HTML), so
   they keep their shape however the chart is stretched. ---------- */
/* the airline's weeks and months as flown, with each one's projection from the pupil record (as p5h's s3Periods, which is
   inside that part's block) */
function h21Periods(kind){
  const by = {}, dec = (typeof rec === 'function' ? rec().entries : []).filter(e => e.type === 'decision');
  (S.history || []).forEach(h => { if(h.type === 'setup' || h.from === undefined) return; const isM = h.type === 'month';
    if(kind === 'week' && isM) return; if(kind === 'month' && !isM) return;
    const k = kind === 'week' ? weekNo(h.from) : h.from, x = by[k] || (by[k] = { k, from:kind === 'week' ? (k - 1) * 7 + 1 : h.from, to:kind === 'week' ? k * 7 : h.to, profit:0, pax:0, seats:0, last:0 });
    x.profit += h.profit || 0; x.pax += h.pax || 0; x.seats += h.seats || 0; x.last = Math.max(x.last, h.to || h.from); });
  return Object.values(by).sort((a, b) => a.from - b.from).map(x => { const e = dec.find(z => z.from === x.from && z.proj !== null && z.proj !== undefined); return Object.assign(x, { proj:e ? e.proj : null, label:kind === 'week' ? `Week ${x.k}` : MONTH[calDate(x.from).getUTCMonth()].slice(0, 3) }); });
}
function h21Graph(kind, o){
  const X = h21Periods(kind); if(!X.length) return null;
  const W = o.w || 640, H = o.h || 260, L = Math.round(W * .1), Rr = Math.round(W * .06), T = Math.round(H * .04), B = Math.round(H * .15), n = X.length, bw = (W - L - Rr) / n, cur = X[n - 1];
  const vals = X.flatMap(x => [x.profit, x.proj === null ? x.profit : x.proj]), hi = Math.max(1, ...vals), lo = Math.min(0, ...vals), y = v => T + (H - T - B) * (hi - v) / (hi - lo), fy = f => T + (H - T - B) * (1 - f);
  const step = niceStep((hi - lo) / 4), ticks = []; for(let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) ticks.push(v);
  const px = v => (100 * v / W).toFixed(2) + '%', py = v => (100 * v / H).toFixed(2) + '%';
  let g = `<line class="s3g-0" x1="${L}" x2="${W - Rr}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}"/>`, tx = '';
  ticks.forEach(v => { g += `<line class="h21g-tk" x1="${L - 7}" x2="${L}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/>`; tx += `<span class="h21g-yl" style="right:${px(W - L + 10)};top:${py(y(v))}">${money(v)}</span>`; });
  tx += `<span class="h21g-yl r" style="left:${px(W - Rr + 8)};top:${py(fy(1))}">100%</span><span class="h21g-yl r" style="left:${px(W - Rr + 8)};top:${py(fy(0.5))}">50%</span>`;
  const every = Math.max(1, Math.ceil(n * 70 / Math.max(1, W - L - Rr)));
  X.forEach((x, i) => { const cx = L + bw * i + bw / 2, w = Math.max(3, bw * 0.62), top = y(Math.max(0, x.profit)), bot = y(Math.min(0, x.profit)), isCur = x === cur;
    const tip = `${x.label}: profit ${money(Math.round(x.profit))}${x.proj !== null ? `, projected ${money(x.proj)}` : ''}${x.seats ? `, ${Math.round(100 * x.pax / x.seats)}% of seats filled` : ''}`;
    g += `<g class="s3g-b ${isCur ? 'cur' : ''} ${x.profit < 0 ? 'neg' : ''}"><title>${esc(tip)}</title><rect x="${(cx - w / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(1, bot - top).toFixed(1)}"/>`;
    if(x.proj !== null) g += `<line class="s3g-pj" x1="${(cx - w / 2 - 3).toFixed(1)}" x2="${(cx + w / 2 + 3).toFixed(1)}" y1="${y(x.proj).toFixed(1)}" y2="${y(x.proj).toFixed(1)}"/>`;
    g += `</g>`;
    if((n - 1 - i) % every === 0) tx += `<span class="h21g-bl" style="left:${px(cx)};top:${py(y(Math.min(lo, 0)) + 6)}"><b>${esc(x.label)}</b><small>${esc(fmtRange(x.from, x.to).replace(/ September/, ' Sep').replace(/ October/, ' Oct').replace(/ November/, ' Nov').replace(/ December/, ' Dec'))}</small></span>`;
    if(isCur){ const d = x.last; if(d && d < x.to) tx += `<span class="h21g-so" style="left:${px(cx)};top:${py(Math.min(top, x.proj !== null ? y(x.proj) : top) - 8)}">so far: ${esc(kind === 'week' ? WDAY[calDate(d).getUTCDay()] : dateShort(d))}</span>`; } });
  const pts = X.map((x, i) => x.seats ? `${(L + bw * i + bw / 2).toFixed(1)},${fy(x.pax / x.seats).toFixed(1)}` : null).filter(Boolean);
  if(pts.length > 1) g += `<polyline class="s3g-sf" points="${pts.join(' ')}"/>`;
  return { body:`<div class="h21g-plot"><svg class="s3g" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Profit for every ${kind} so far">${g}</svg><div class="h21g-tx" aria-hidden="true">${tx}</div></div>`,
    key:`<span><i class="k b"></i>Profit each ${kind}</span><span><i class="k pj"></i>Projected</span><span><i class="k sf"></i>Seats filled (right)</span>` };
}
const h21Fin0 = finChart;
finChart = function(o){
  o = o || {}; if(!S || !yearOne() || WBS().weekGraphDefault === undefined || !S.history) return h21Fin0.apply(this, arguments);
  const months = h21Periods('month').length > 0, weeks = h21Periods('week').length > 0; if(!weeks && !months) return h21Fin0.apply(this, arguments);
  const tabs = [['weeks', 'Weeks']].concat(months ? [['months', 'Months']] : [['days', 'This week by day']]), t = tabs.some(x => x[0] === UI.wgTab) ? UI.wgTab : 'weeks';
  let body = '', key = '';
  // the days: p5h's chart (the game's day chart), out of its own frame; its key moves up to the title's row
  if(t === 'days'){ const h = h21Fin0.apply(this, arguments), a = h.indexOf('<div class="fc">'); body = a >= 0 ? h.slice(a).replace(/<\/div>\s*$/, '') : h;
    const m = body.match(/<div class="fc-legend">[\s\S]*?<\/div>/); if(m){ key = m[0].replace(/^<div class="fc-legend">|<\/div>$/g, ''); body = body.replace(m[0], ''); } }
  else { const G = h21Graph(t === 'months' ? 'month' : 'week', o); if(!G) return h21Fin0.apply(this, arguments); body = G.body; key = G.key; }
  const title = { weeks:'Profit each week', months:'Profit each month', days:'Profit each day' }[t];
  setTimeout(() => document.querySelectorAll('.phead[data-status="BY DAY"], .phead[data-status="BY WEEK"], .phead[data-status="BY MONTH"]').forEach(h => { const sec = h.closest('section'); if(sec && sec.querySelector('.s3g-w')) h.dataset.status = { weeks:'BY WEEK', months:'BY MONTH', days:'BY DAY' }[t]; }), 0);
  return `<div class="s3g-w h21g ${o.big ? 'big' : ''}"><div class="h21g-top">${o.big ? `<span class="wo-sub h21g-t">${esc(title.toUpperCase())}</span>` : ''}<span class="h21g-key s3g-key">${key}</span></div>
    <div class="h21g-row"><div class="s3g-tabs" role="tablist">${tabs.map(([k, l]) => `<button data-wgtab="${k}" aria-selected="${t === k}">${l}</button>`).join('')}</div>${t !== 'days' ? '<span class="h21g-axr">Seats filled (%)</span>' : ''}</div>
    ${t !== 'days' ? '<span class="h21g-axl">Profit (£)</span>' : ''}${body}</div>`;
};
/* the wall: the chart carries its own title now */
function h21WallTitle(h){ return /class="s3g-w h21g/.test(h) ? h.replace(/<div class="wo-chart"><div class="wo-sub">[^<]*<\/div>/, '<div class="wo-chart">') : h; }
const h21WallR0 = wallReviewHtml;
wallReviewHtml = function(){ return h21WallTitle(h21WallR0.apply(this, arguments)); };
const h21WallP0 = wallPeriodReviewHtml;
wallPeriodReviewHtml = function(){ return h21WallTitle(h21WallP0.apply(this, arguments)); };

/* ---------- 3. flight times on a small sheet (DESIGN.md: "Flight times are on a sheet too") ----------
   The table and the Sum panel give way to a small sheet, centred and wide: the routes as rows; Distance, then Speed and
   Flight time for each of the fleet's types (the slowest first). Which routes are the pupil's comes from the workbook's sum
   list (SheetSums, "Flight times (week 3)": Amsterdam a Build, then Barcelona from the book); the game works out the rest
   (ƒ, grey figures, "ƒ worked out for you"). A later page (a new aircraft or route, while the flight-time decay still asks)
   keeps the game's own picks (p5h): Calculate from the book, Build as a formula the sheet works out. The answer cell takes
   hours and minutes (an h box and a minutes list), never a decimal; two tries, then Finance fills it in. */
const h21FtOn = () => !!S && yearOne() && typeof ashOn === 'function' && ashOn();
const H21_MIN = [0, 15, 30, 45], h21Q = h => Math.round(h * 4) / 4;
function h21HM(h){ const q = h21Q(h), a = Math.floor(q + 1e-9), m = Math.round((q - a) * 60); return `${a ? a + ' h' : ''}${a && m ? ' ' : ''}${m ? m + ' min' : ''}` || '0 min'; }
/* the workbook's rows for the sheet: the pupil's routes in order, with how each is done */
function h21FtRows(){
  const rows = ((typeof WB !== 'undefined' && WB && WB.sheetSums) || []).filter(x => /^Flight times/i.test(String(x.sheet || '')));
  const id = name => { const r = WORLD.routes.find(z => String(z.city).toLowerCase() === String(name || '').trim().toLowerCase()); return r ? r.id : null; };
  return rows.filter(x => x.whose !== 'ƒ').map(x => ({ rid:id(x.row), how:x.how === 'build' || x.how === 'formula' ? x.how : 'book' })).filter(x => x.rid);
}
const h21FtPage0 = ftPage;
ftPage = function(){
  const P = h21FtPage0.apply(this, arguments); if(!P || !h21FtOn() || !P.items.length || P.items.every(x => x.how)) return P;
  const slow = P.types[0], mine = h21FtRows().filter(x => P.fresh.includes(slow + '|' + x.rid));
  if(mine.length && !P.items.some(x => x.done)) P.items.splice(0, P.items.length, ...mine.map(x => ({ k:slow + '|' + x.rid, v:'', tries:0, done:false, shown:false, msg:'', q:false, h:'', m:0, seq:[], lvl:x.how === 'book' ? 'calc' : 'build', how:x.how })));
  else P.items.forEach(x => { if(!x.how) x.how = x.lvl === 'build' ? 'formula' : 'book'; });
  try{ save(); }catch(e){} return P;
};
function h21FtDone(){ const F = ftS(); if(F.n === undefined) F.n = Object.values(F.asked || {}).reduce((t, A) => t + (Array.isArray(A) ? A.filter(x => x.done).length : 0), 0); return F.n; }
/* the hints: the whole hours, then the part left over (the briefing's steps), then a check */
function h21FtHints(p, r){
  const km = routeKm(r), v = p.speed, a = Math.floor(km / v + 1e-9), left = Math.round(km - a * v), q = h21Q(km / v), m = Math.round((q - a) * 60);
  const out = [{ t:a ? `How many ${num(v)}s fit in ${num(km)}? ${a} × ${num(v)} = ${num(a * v)} km: that is ${a} whole hour${a === 1 ? '' : 's'}${left ? `, with ${num(left)} km left over` : ''}.` : `${num(v)} doesn't fit into ${num(km)} even once, so it is under an hour.` }];
  if(left) out.push({ t:`${num(left)} km is ${m === 30 ? 'half' : m === 15 ? 'a quarter' : m === 45 ? 'three quarters' : 'part'} of ${num(v)} km, so it takes ${m === 30 || m === 15 || m === 45 ? `${m} minutes` : 'part of an hour'}.` });
  out.push({ t:`Check: ${h21HM(q)} at ${num(v)} km/h covers ${num(Math.round(q * v))} km.`, est:true });
  return out;
}
function h21FtSpec(P){
  const F = ftS(), types = P.types.map(planeById), rids = P.rids, A = Object.fromEntries(P.items.map(x => [x.k, x])), cols = [{ c:'B', w:200, top:'', main:'Distance' }];
  types.forEach((p, i) => { cols.push({ c:ASH_LET[2 + i * 2], w:200, top:shortPlane(p), main:'Speed' }, { c:ASH_LET[3 + i * 2], w:types.length > 1 ? 210 : 250, top:types.length > 1 ? shortPlane(p) : '', main:'Flight time' }); });
  const rows = [{ r:1, t:'hdr' }], v = {}, sums = [];
  rids.forEach((rid, j) => { const r = routeById(rid), row = j + 2; rows.push({ r:row, label:r.city, fl:r.flag }); v['B' + row] = { t:`${num(routeKm(r))} km` };
    types.forEach((p, i) => { const S1 = ASH_LET[2 + i * 2], T1 = ASH_LET[3 + i * 2], k = p.id + '|' + rid, a = A[k], h = ftHours(p, r);
      v[S1 + row] = { t:`${num(p.speed)} km/h` };
      if(typeof planeCanFly === 'function' && !planeCanFly(p, r)){ v[T1 + row] = { t:'too far', cls:'h21-ftno' }; return; }
      if(!a){ v[T1 + row] = { t:h21HM(h), f:true, cls:'h21-ftf' }; return; }
      if(a.done) v[T1 + row] = { t:h21HM(h), fin:!!a.shown };
      const key = 'ftp:' + k, formula = a.how === 'formula', what = `${shortPlane(p)} to ${r.city}`;
      sums.push({ id:'ft:' + k, k, tgt:T1 + row, refs:['B' + row, S1 + row], ops:['÷'], words:'Distance ÷ Speed', kind:'flightTime', commute:false, how:a.how === 'book' ? 'book' : a.how, built:formula ? !!a.done : !!a.built,
        unit:'hm', want:h21Q(h), done:!!a.done, shown:!!a.shown, recKey:key, what, plane:p, route:r, answerText:h21HM(h),
        get no(){ return formula ? null : sumNo(key); }, name:'the flight time', orderWhy:'a flight time shares the distance out by the speed, so the distance comes first.',
        why:ref => { const q = ashRef(ref); if(q.r !== row) return `That row is ${routeById(rids[q.r - 2]) ? routeById(rids[q.r - 2]).city : 'another route'}. This sum is ${r.city}: which cells are on its row?`; return ashCol(q.c) > 1 && (ashCol(q.c) - 2) % 2 === 1 ? `${ref} is a flight time. Which cells give the distance and the speed?` : null; },
        recO:{ type:formula ? 'build' : 'calc', relKey:'flightTime', doc:`Flight time: ${what}`, ask:`How long does the ${shortPlane(p)} take to fly ${num(routeKm(r))} km at ${num(p.speed)} km/h?`, question:`${num(routeKm(r))} km ÷ ${num(p.speed)} km/h`, unit:'h min', correct:h21Q(h), correctText:h21HM(h), ops:[routeKm(r), p.speed], op:'÷', level:formula ? 'Formula' : a.how === 'build' ? 'Build' : 'Calculate' },
        onBuilt:() => { a.built = true; save(); },
        emptyMsg:'Type the hours (0 if it is under an hour), then choose the minutes.',
        readIn:st => String(st.entry || '').trim() === '' ? '' : `${+st.entry} h ${+(st.entryM || 0)} min`,
        parse:(raw, st) => { const hh = +String(st.entry || '').trim(); return isNaN(hh) ? null : hh + (+(st.entryM || 0)) / 60; },
        cellIn:(sp, st) => `<span class="h21-hm"><input class="ash-in h21-hh" data-ashin="${esc(sp.id)}" data-ashwhole inputmode="numeric" autocomplete="off" value="${esc(st.entry || '')}" aria-label="Hours, ${esc(what)}" size="2"><i>h</i><select data-ashm aria-label="Minutes">${H21_MIN.map(m => `<option value="${m}" ${+(st.entryM || 0) === m ? 'selected' : ''}>${m}</option>`).join('')}</select><i>min</i></span>`,
        answer:(raw, val, st) => h21FtAnswer(P, a, p, r, h, formula, raw, val, st),
        hints:formula ? null : () => h21FtHints(p, r), how2:null,
        lineBuild:formula ? h21Text('flightTimes.formula', { cell:T1 + row }).text.map(h21Html).join(' ') : h21Text('flightTimes.build', { cell:T1 + row }).text.map(h21Html).join(' '),
        get lineType(){ return h21Text('flightTimes.line', { n:this.no, cell:T1 + row }).text.map(h21Html).join(' '); } }); }); });
  const J = UI.ashJust && UI.ashJust.sheet === 'ft:' + P.key ? sums.find(s => s.id === UI.ashJust.sum) : null, act = J ? null : sums.find(s => !s.done) || null;
  if(J){ J.val = J.answerText; J.doneLine = J.shown ? `Finance has filled this one in: ${esc(J.answerText)}. Copy it into your book beside Sum ${J.no}.` : `${esc(J.what)}: <b>${esc(J.answerText)}</b>${J.no ? ` · Sum ${J.no} in your record` : ''}`; }
  const L = !act && !J && sums.length ? sums[sums.length - 1] : null, mean = types.length > 1 && !act && !J ? h21FtMeaning(P) : '';
  return { id:'ft:' + P.key, crumb:'', title:'Flight times', tabs:null, small:true, rh:ASH_RH, lw:270, cols, rows, v, sums, act, just:J,
    doneF:L ? { tgt:L.tgt, refs:L.refs, ops:L.ops, words:L.words, val:L.answerText } : null, doneLine:`<span class="pos">✓</span> Every flight time is worked out.${mean ? ' ' + mean : ''}`, anyF:rids.some(rid => types.some(p => !A[p.id + '|' + rid])) };
}
function h21FtMeaning(P){
  const lo = planeById(P.types[0]), hi = planeById(P.types[P.types.length - 1]); const rid = P.rids.find(id => [lo, hi].every(p => typeof planeCanFly !== 'function' || planeCanFly(p, routeById(id)))); if(!rid) return '';
  const r = routeById(rid), a = h21Q(ftHours(lo, r)), b = h21Q(ftHours(hi, r)); if(!(b > 0) || a - b < 0.25) return '';
  const n = Math.floor(a / b + 1e-9);
  return esc(n >= 2 ? `The ${shortPlane(hi)} can fly to ${r.city} and back ${h21Words(n)} times before the ${shortPlane(lo)} has done it once.` : `The ${shortPlane(hi)} is back from ${r.city} ${h21HM(2 * (a - b))} before the ${shortPlane(lo)} on a return trip.`);
}
/* the answer: the record, two tries, Finance; the flight-time decay counts it */
function h21FtAnswer(P, a, p, r, h, formula, raw, val, st){
  const key = 'ftp:' + a.k, F = ftS(), q = h21Q(h), rid = r.id;
  const done = shown => { a.done = true; a.shown = !!shown; a.q = false; a.msg = ''; F.n = h21FtDone() + 1; if(typeof soTouch === 'function') soTouch('flightTime', { route:rid, count:true }); const sk = skills().flightTime; if(sk && !sk.routes.includes(rid)) sk.routes.push(rid);
    (S.handSumLog = S.handSumLog || []).push({ day:S.day, date:dateShort(S.day), tools:[`Flight time: ${shortPlane(p)} to ${r.city} (${formula ? 'Formula' : a.how === 'build' ? 'Build, then the sum' : 'Calculate'})`] }); save(); };
  if(formula){ done(false); return { ok:true }; }   // the sheet works it out: the build is the record (p5t)
  // the answer from his book is a Calculate entry under the same Sum number; a Build's click step has its own entry (the Sheet's ashBuildRec), as on the review and the Changes sheet
  let e = null; try{ e = recOpen(key, { type:'calc', relKey:'flightTime', doc:`Flight time: ${shortPlane(p)} to ${r.city}`, ask:`How long does the ${shortPlane(p)} take to fly ${num(routeKm(r))} km at ${num(p.speed)} km/h?`,
    question:`${num(routeKm(r))} km ÷ ${num(p.speed)} km/h`, unit:'h min', correct:q, correctText:h21HM(h), ops:[routeKm(r), p.speed], op:'÷', level:'Calculate' }); }catch(x){}
  const ok = val !== null && Math.abs(val - q) < 1e-6; try{ recAttempt(e, { ok, given:raw, value:val, method:'distance ÷ speed' }); }catch(x){}
  if(ok){ done(false); return { ok:true }; }
  if((st.tries || 0) + 1 >= 2 && twoTriesOn()){ try{ paperRecShown(key); }catch(x){} done(true); return { shown:true }; }
  const cov = Math.round(val * p.speed);
  return { note:`${val > q ? `Too long: ${raw} at ${num(p.speed)} km/h covers ${num(cov)} km.` : `Too short: ${raw} at ${num(p.speed)} km/h covers only ${num(cov)} km.`} The route is ${num(routeKm(r))} km. One more try.` };
}
const h21RenderFtp0 = renderFtp;
renderFtp = function(st, P){
  if(!h21FtOn()) return h21RenderFtp0.apply(this, arguments);
  const sp = h21FtSpec(P), left = P.items.filter(x => !x.done).length, a = sp.act || sp.just;
  const card = a ? `<section class="bv-panel h21-ftc">${a.no ? `<span class="bv-sumtag">Sum ${a.no}</span>` : '<span class="h21-ftag">FORMULA</span>'}<b>${h21Html(h21Text('flightTimes.card').title || 'Flight time = distance ÷ speed')}</b><span class="h21-ftw">${esc(h21Text('flightTimes.card', { plane:shortPlane(a.plane), route:a.route.city }).text.join(' '))}</span></section>` : '';
  const fnote = sp.anyF ? `<p class="h21-ftn"><span class="ash-au">ƒ</span> ${esc(h21Text('flightTimes.f').text.join(' ').replace(/^ƒ\s*/, ''))}</p>` : '';
  const btn = sp.just && left ? `<button class="btn primary big" id="ashNext">Next sum &#9654;</button>` : `<button class="btn primary big" id="ftpGo" ${left ? 'disabled' : ''}>${left ? 'Work out the flight time first' : 'On to the timetable'} &#9654;</button>`;
  screen().innerHTML = shell(deskPage({ title:'Flight times', sub:'Before the timetable: how long each of your aircraft takes to fly each new route.', cls:'ftp-page h21-ftp', body:`<div class="h21-ft ft3-ins">${ashHtml(sp).replace('</section>', `${fnote}</section>`)}${card}</div>` }),
    deskBar(left ? h21Text('flightTimes.footer').text.join(' ') : 'Now plan the timetable: a faster aircraft fits more flights into a day.', btn));
  ashBind(sp); on('ashNext', ashNextSum);
  on('ftpGo', () => { if(P.items.some(x => !x.done)) return; const F = ftS(); P.fresh.forEach(k => { if(!F.seen.includes(k)) F.seen.push(k); });
    F.log.push({ day:S.day, pairs:P.fresh.length, asked:P.items.map(x => x.k) }); UI.ashJust = null; save(); render(); });
};
/* the tests and the test kit: the next sum on the sheet */
const h21FtpPlan0 = ftpPlan;
ftpPlan = function(){
  if(!h21FtOn()) return h21FtpPlan0.apply(this, arguments);
  const P = ftNew().length ? ftPage() : null; if(!P) return null; const a = P.items.find(x => !x.done);
  if(!a) return { pairs:P.fresh, asked:P.items.map(x => x.k), next:null };
  const [pid, rid] = a.k.split('|'), h = ftHours(planeById(pid), routeById(rid)), q = h21Q(h);
  return { pairs:P.fresh, asked:P.items.map(x => x.k), level:a.lvl, how:a.how, next:{ key:a.k, h:Math.floor(q + 1e-9), m:Math.round((q - Math.floor(q + 1e-9)) * 60), answer:q, sheet:true } };
};

/* ---------- 4–5. what's new comes first (DESIGN.md: Week plan opener; the attention system: First-time control callout) ----------
   The opener's "This week" list starts with the routes that open this week (NEW, "Add a route ›" to Change network). A control
   that is new gets a 2px cyan ring and one callout in the Sheet Callout look, in empty space, joined to it by a cyan leader line
   routed through gaps: on the opener the Sat–Sun switch; in the Studio, first Add / change routes, then the switch. One at a
   time; each shows once (S.h21Seen, in the save). The routes a plan screen has shown are noted (S.h21Shown) for the review (9). */
function h21Seen(id){ return !!(S && S.h21Seen && S.h21Seen[id]); }
function h21See(id){ (S.h21Seen = S.h21Seen || {})[id] = S.day || 1; try{ save(); }catch(e){} }
function h21NewRoutes(){ if(!S || S.phase === 'setup' || !yearOne()) return []; const d = S.day || 1, mon = d - ((d - 1) % 7);
  return openRoutes(d).filter(r => (r.openDay || 1) > 1 && (r.openDay || 1) >= mon && (r.openDay || 1) <= mon + 6); }
function h21Shown(ids){ const M = S.h21Shown || (S.h21Shown = {}); let ch = false; ids.forEach(id => { if(!M[id]){ M[id] = S.day || 1; ch = true; } }); if(ch) try{ save(); }catch(e){} }
const h21OpRows0 = op2Rows;
op2Rows = function(pl, L){
  const h = h21OpRows0.apply(this, arguments), R = h21NewRoutes(); if(!R.length) return h;
  h21Shown(R.map(r => r.id));
  const T = h21Text(R.length > 1 ? 'opener.newRoutes' : 'opener.newRoute', { Count:capFirst(h21Words(R.length)), routes:h21List(R.map(r => r.city)) });
  const row = `<li class="op2-r h21-new"><span class="op2-i h21-ni">${ICO2.plane || ''}</span><span class="op2-t"><span class="h21-nt">${esc(T.eyebrow || 'NEW')}</span> ${h21Html(T.text.join(' '))}</span><span class="op2-l"><button class="op2-a" data-s2go="network">${esc(T.button.replace(/\s*›\s*$/, '') || 'Add a route')} ›</button></span></li>`;
  return row + h.replace(/<li class="op2-r good">[\s\S]*?<\/li>/, '');
};
const h21Opener0 = s2Opener;
s2Opener = function(){ const h = h21Opener0.apply(this, arguments); return yearOne() && h21NewRoutes().length ? h.replace('class="bv-panel s2-ochg op2-week"', 'class="bv-panel s2-ochg op2-week h21-grow"') : h; };
/* a callout in the Sheet Callout look, one row: the words, then Got it */
function h21CoHtml(id, T, cls){
  return `<div class="ash-co h21-co ${cls || ''}" role="dialog" aria-label="${esc(T.title)}" data-h21co="${id}"><i class="ash-ptr" aria-hidden="true"></i><div class="h21-cob"><span class="ash-coe">${esc(T.eyebrow)}</span><b class="ash-cot">${esc(T.title)}</b>${T.text.map(t => `<p>${h21Html(t)}</p>`).join('')}</div><div class="ash-coa"><button class="bv-btn primary" data-h21got="${id}">${esc(T.button || 'Got it')}</button></div></div>`;
}
/* the leader line: a fixed layer over the page (client pixels), redrawn after each render and on resize */
function h21LeadOff(){ const s = document.getElementById('h21Lead'); if(s) s.remove(); }
function h21Lead(pts){
  h21LeadOff(); if(!pts || pts.length < 2 || document.querySelector('#bfLayer')) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), W = window.innerWidth, H = window.innerHeight; svg.id = 'h21Lead'; svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
  svg.innerHTML = `<polyline points="${pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}"/><circle cx="${pts[0][0].toFixed(1)}" cy="${pts[0][1].toFixed(1)}" r="4"/>`;
  document.body.appendChild(svg);
}
function h21CoBind(root){ root.querySelectorAll('[data-h21got]').forEach(b => b.onclick = e => { e.stopPropagation(); h21See(b.getAttribute('data-h21got')); render(); }); }
/* the opener: the Sat–Sun switch (the first week the days can differ); the line runs down from the switch, along the gap under the
   hour labels and down through a gap between flights, never through a flight block */
function h21CoOpener(root, sw){
  const pnl = root.querySelector('.s2-otl'); if(!pnl) return;
  sw.classList.add('h21-ring'); pnl.classList.add('h21-cohost');
  pnl.insertAdjacentHTML('beforeend', h21CoHtml('opener.weekends', h21Text('opener.weekends'), 'h21-coo pu')); h21CoBind(root);
  h21After(() => h21LeadOpener(pnl, sw));
}
function h21LeadOpener(pnl, sw){
  const co = pnl.querySelector('.h21-co'); if(!co) return; const s = sw.getBoundingClientRect(), c = co.getBoundingClientRect(), lanes = [...pnl.querySelectorAll('.ad-lane')].map(e => e.getBoundingClientRect()), blocks = [...pnl.querySelectorAll('.ad-blk')].map(e => e.getBoundingClientRect());
  const x0 = s.left + s.width / 2; let pts;
  if(lanes.length){ const top = Math.min(...lanes.map(l => l.top)), yG = top - 5, L0 = Math.max(...lanes.map(l => l.left)), R0 = Math.min(...lanes.map(l => l.right));
    const free = x => x > L0 + 4 && x < R0 - 4 && !blocks.some(b => x > b.left - 6 && x < b.right + 6);
    let xT = null; for(let d = 0; d < 900 && xT === null; d += 2) for(const x of [x0 - d, x0 + d]) if(xT === null && x > c.left + 26 && x < c.right - 26 && free(x)) xT = x;
    if(xT === null) xT = Math.max(c.left + 26, Math.min(c.right - 26, x0));
    pts = [[x0, s.bottom + 1], [x0, yG], [xT, yG], [xT, c.top]]; co.querySelector('.ash-ptr').style.left = ((xT - c.left) * co.offsetWidth / Math.max(1, c.width) - 7) + 'px'; }
  else pts = [[x0, s.bottom + 1], [x0, c.top]];
  h21Lead(pts);
}
/* the Studio: Add / change routes (the week routes open), its callout under it, pointing up, right-aligned to it */
function h21CoRoutes(root, add, R){
  const pnl = root.querySelector('.s2-routes'); if(!pnl) return;
  const T = h21Text(R.length > 1 ? 'studio.routes' : 'studio.route', { Count:capFirst(h21Words(R.length)), routes:h21List(R.map(r => r.city)) });
  add.classList.add('h21-ring'); pnl.classList.add('h21-cohost'); h21Shown(R.map(r => r.id));
  pnl.insertAdjacentHTML('beforeend', h21CoHtml('studio.routes', T, 'h21-cor pu')); h21CoBind(root);
  h21After(() => h21PlaceRoutes(pnl, add));
}
function h21PlaceRoutes(pnl, add){
  const co = pnl.querySelector('.h21-co'); if(!co) return; const P = pnl.getBoundingClientRect(), B = add.getBoundingClientRect(), k = P.width / Math.max(1, pnl.offsetWidth) || 1;
  co.style.right = Math.max(0, (P.right - B.right - 11) / k) + 'px'; co.style.top = ((B.bottom - P.top + 14) / k) + 'px';
  const C = co.getBoundingClientRect(); co.querySelector('.ash-ptr').style.left = ((B.left + B.width / 2 - C.left) / k - 7) + 'px';
}
/* the Studio: the Sat–Sun switch, its callout in the empty "Select a flight" box; the line runs left from the switch along the header
   row, then down the clear gap between the labels and the chart */
function h21CoStudioDays(root, sw){
  const box = root.querySelector('.s2-tt .s3-insp.empty'); if(!box) return;
  sw.classList.add('h21-ring'); box.classList.add('h21-cobox'); box.innerHTML = h21CoHtml('studio.weekends', h21Text('studio.weekends'), 'h21-coi'); h21CoBind(root);
  h21After(() => h21LeadStudio(root, sw, box));
}
function h21LeadStudio(root, sw, box){
  const s = sw.getBoundingClientRect(), c = box.querySelector('.h21-co').getBoundingClientRect(), lane = root.querySelector('.s2-tt .ad-lane, .s2-tt .st-sb'), y = s.top + s.height / 2;
  const xG = lane ? lane.getBoundingClientRect().left - 4 : c.left + 24;
  h21Lead([[s.left - 1, y], [xG, y], [xG, c.top]]);
}
/* the lines and places are measured once the page has finished drawing (later parts add to the header after the Studio draws) */
function h21After(fn){ const tok = UI.h21Tok = (UI.h21Tok || 0) + 1; setTimeout(() => { if(UI.h21Tok === tok) try{ fn(); }catch(e){ console.error(e); } }, 0); }
function h21PlanCallouts(){
  h21LeadOff(); if(!S || !yearOne() || S.phase === 'setup' || !UI.s2 || step().t !== 'plan') return;
  const root = screen(), mode = UI.s2.mode, R = h21NewRoutes();
  if(mode === 'network'){ if(R.length && !h21Seen('studio.routes')) h21See('studio.routes'); h21Shown(openRoutes(S.day || 1).map(r => r.id)); return; }
  if(mode === 'opener'){ const sw = root.querySelector('.s2-otl .s2-dt'); if(sw && !h21Seen('opener.weekends')) h21CoOpener(root, sw); return; }
  if(mode !== 'plan') return;
  const add = root.querySelector('#s2AddNet'); if(R.length && add && !h21Seen('studio.routes')){ h21CoRoutes(root, add, R); return; }
  const sw = root.querySelector('.s2-tt .s2-dt'); if(sw && !h21Seen('studio.weekends')) h21CoStudioDays(root, sw);
}
const h21Studio0 = renderStudio;
renderStudio = function(){ const r = h21Studio0.apply(this, arguments); try{ h21PlanCallouts(); }catch(e){ console.error(e); } return r; };
const h21Render1 = render;
render = function(){ h21LeadOff(); return h21Render1.apply(this, arguments); };
window.addEventListener('resize', () => { try{ if(document.getElementById('h21Lead') && step().t === 'plan') render(); }catch(e){} });

/* ---------- 8. the Sunday review: the sheet does the adding (p5v builds the sums; p5t draws Σ SUM) ----------
   Σ SUM unlocks at the review of the Calendar day whose unlocks name the skill sumDrag (21: week 3's accounts). The card beside the
   sheet shows FORMULA (cyan) for a formula-only sum and the rule in words; the first time Σ SUM appears, a Sheet Callout under it
   (NEW SKILL · SUM) points left at the Profit column, while the sheet stays ready to use. */
function h21SumDragDay(){ const c = (typeof CAL !== 'undefined' ? CAL : []).find(x => x && x.unlocks && (x.unlocks.skills || []).includes('sumDrag')); return c ? c.day : 21; }
function h21SumDragOn(day){ return !!S && yearOne(day) && (day || S.day || 1) >= h21SumDragDay(); }
function h21RvCard(a, sp){
  if(a.how !== 'formula') return '';
  const tot = /:tot$/.test(a.id), V = sp.tv || {}, sumy = tot && (a.sumKey || a.sumText), T = h21Text(tot ? (sumy ? 'review.total.cardSum' : 'review.total.card') : 'review.average.card', V);
  const sub = sumy ? (a.done && a.sumText ? T.text : []) : T.text;
  const card = `<section class="bv-panel active ash-rvc h21-rvc" data-rbcard="${a.id.split(':').pop()}"><span class="h21-ftag">${esc(T.eyebrow || 'FORMULA')}</span><p class="ash-rvr">${h21Html(T.title)}</p>${sub.map(t => `<p class="h21-rvs">${h21Html(t)}</p>`).join('')}</section>`;
  const C = tot && a.sumKey && !a.done && sp.act === a && !ashSeen('sumKey') ? h21Text('review.sumSkill', V) : null;
  return card + (C ? `<div class="ash-co h21-rvco pl" role="dialog" aria-label="${esc(C.title)}"><i class="ash-ptr" aria-hidden="true"></i><span class="ash-coe">${esc(C.eyebrow)}</span><b class="ash-cot">${esc(C.title)}</b>${C.text.map(t => `<p>${h21Html(t)}</p>`).join('')}<div class="ash-coa"><button class="bv-btn primary" data-h21sum>${esc(C.button || 'Got it')}</button></div></div>` : '');
}
function h21RvBind(sp){ screen().querySelectorAll('[data-h21sum]').forEach(b => b.onclick = () => { ashSee('sumKey'); render(); }); }

/* ---------- 9. routes not flown yet: named only once a plan screen has shown them, and as a chance (cyan), not a loss ---------- */
function h21Unflown(L){
  if(!yearOne()) return { rest:L, chance:'' };
  const RX = /^(.+?): ([\d,]+) → ([\d,]+)\. No service flew this week, so/, shown = S.h21Shown || {}, rest = [], items = [];
  const flown = id => (S.history || []).some(h => h.routes && h.routes[id] && (h.routes[id].seats || 0) > 0);
  L.forEach(n => { const m = RX.exec(n.text || ''); if(!m || !n.route || flown(n.route)){ rest.push(n); return; } if(shown[n.route]) items.push(`${m[1]} ${m[2]} → ${m[3]}`); });
  const T = h21Text('review.unflown', { list:items.join(' · ') });
  return { rest, chance:items.length ? `<div class="h21-chance" role="note"><p><b>${h21Html(T.title)}</b> ${h21Html(T.text.join(' '))}</p></div>` : '' };
}

/* ---------- 11. Sum numbers stay consecutive: a number goes only to a sum he works out ----------
   The year-one Fuel desk shows the order as a small sheet and strips the old sign-off box (p5v), but the box was still drawn first,
   and its "Sum n" line (sumHeadHtml) took a number even for an order the game works out (ƒ signs itself), so his book skipped one.
   On that desk the box is not drawn at all. (The comparison's full flight worked out before has no number either: p5h, wcHtml.) */
const h21FoSign0 = foSignHtml;
foSignHtml = function(){ return ashOn() && fd2On() ? '' : h21FoSign0.apply(this, arguments); };
// the test kit's look at the order (foPlan) only reads the number the order already has: it handed one out on every visit to the desk
const h21FoPlan0 = foPlan;
foPlan = function(){ if(!yearOne() || !paperOn() || !UI.fd) return h21FoPlan0.apply(this, arguments); const F = foWeek(), G = foFigures();
  return { level:F.level, signed:!!(F.signed && F.n === G.n), n:G.n, per:G.per, answer:G.total.toFixed(2), seq:['n', '×', 'per'], sumNo:sumNoS().keys[sumNoKey('fo:' + weekNo(S.day || 1))] }; };
