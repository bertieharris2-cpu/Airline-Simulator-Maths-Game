// Run: NODE_PATH=<playwright node_modules> node chapter1.test.js   (env: GAME, OUT)
// Chapter one end to end (Fable's hand-off 1, section 7; Bertie's hand-off 2, section 0: "a quick check that runs chapter one
// end to end after each change"). A new TEST airline (testStart) is played from Launch Day to the chapter-one review with the
// teacher's toolkit (Run, its answers and auto-plan; a second Twin Otter joins at the start of week 3), and the rules checked:
//   - no event cards and no news in chapter one (parked); no snacks;
//   - the second-plane shop opens on Settings secondPlaneShopFromDay (day 22 since hand-off 1c), not before;
//   - at most two counted questions at every pause, and none between pauses (the graph question, gq:, is outside the two: Bertie, 2 Nov); one on Launch Day (hand-off 3: the paper sum);
//   - hand-off 2a (31 Oct): Launch Day and Tuesday to Saturday end on the Day page (Keep for tomorrow / Change my plan); no plan
//     check and no Home in week 1; counted questions in week 1 only from a daily change, within Settings dailyChangeCountedWeek;
//   - Launch Day's fuel is charged at the workbook's price and is in Total costs;
//   - one game file again (Bertie, 5 Nov 2026): the chapter-one review's card leads on (On to Christmas and New Year ▶) to chapter 2
//     on 6 Jan 2031 (day 127); a January 2031 save opens here; every chapter-one Jump to… save loads;
//   - hand-off 1c (31 Oct): a second TEST airline that keeps its plan, Launch Day to day 37: week 2 with nothing new on the
//     flying page; the what-if sheet and its two questions on day 8; the Fuel desk on day 15; the shop, the four routes and View trade-offs on day 22;
//     Madrid on day 29; weekly play from day 36 with no second review of Sunday; two counted questions at every pause from P2
//     (Finance's questions, after his plan's own sums); the Roadmap's NEXT matching the new days. In the main run, which
//     changes its plan most Mondays, his plan's own sums take the slots first and the pause never asks more than two.
// It prints the questions asked at each pause (the record's Calculate entries), for the run-through.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const ROOT = path.resolve(__dirname, '../../..'), FILE = 'file://' + path.resolve(ROOT, process.env.GAME || 'airline-opening-prototype.html');
const OUT = (process.env.OUT || os.tmpdir() + '/airline-chapter1') + '/'; fs.mkdirSync(OUT, { recursive:true });
let pass = 0, fail = 0; const ok = (c, m) => { if(c){ pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport:{ width:1366, height:768 } }), errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto(FILE); await p.waitForTimeout(800);
  await p.evaluate(() => { const s = window.__sim.settings(); s.flightSecs = 0.2; s.autoWall = false; s.opsSound = false; });
  await p.evaluate(() => window.__tk.enter()); await p.waitForTimeout(200); await p.evaluate(() => window.__c1.testStart()); await p.waitForTimeout(300);
  const E = s => p.evaluate(x => window.__sim.evalIn(x), s), J = async s => JSON.parse(await E(s));
  const at = () => J('JSON.stringify({ day:S.day, t:step().t })');
  console.log('TEST start');
  const t0 = await J("JSON.stringify({ name:S.airline.name, test:!!S.test, fleet:S.fleet.map(f => f.planeId), steps:S.steps.map(x => x.t).slice(0, 4), cash:S.cash })");
  ok(t0.test && t0.fleet.join() === 'dhc6' && !['name', 'code', 'logo', 'paint'].some(x => t0.steps.includes(x)), `a TEST airline (${t0.name}) at Launch Day with the launch-deal Twin Otter; no naming, livery or plane design (${t0.steps.join(' → ')})`);
  const SHOP = +(await E('+WBS().secondPlaneShopFromDay || 15')), WEEKLY = +(await E('c1WeeklyFrom()'));
  ok(await E(`shopPlanes(${SHOP - 1}).length`) === 0 && await E(`shopPlanes(${SHOP}).length`) > 0, `the second-plane shop opens on day ${SHOP} (Settings secondPlaneShopFromDay; nothing to buy on day ${SHOP - 1})`);
  ok(await E("JSON.stringify((WORLD.routeNews || []).filter(n => n.start && dayOfDate(n.start) <= ch1End()).map(n => n.id))") === '[]', 'no route news is dated in chapter one');
  const OPEN = ['#enterHq', '#chGo', '#nx:not([disabled])', '#startDay'], types = {}, pauseDays = new Set([1]), snacks = [];
  // hand-off 3, section 4: Run goes straight through week 1, so a hook on render() notes each page drawn there
  await E(`(window.__wk1 = { pages:{}, seen:{} }, (() => { const r0 = render; render = function(){ const out = r0.apply(this, arguments);
    try{ const t = step().t, W = window.__wk1; if(S.day <= 7){ (W.pages[S.day] = W.pages[S.day] || {})[t] = 1;
      if(['results', 'c1check', 'weekRun'].includes(t) && !W.seen[t]){ const tx = (screen().textContent || '').replace(/\\s+/g, ' '); if(t !== 'weekRun' || /is flying/.test(tx)) W.seen[t] = { day:S.day, text:tx, nx:(document.getElementById('nx') || document.getElementById('c2Keep') || document.getElementById('c3FraGo') || {}).textContent || '' }; }
      if(document.getElementById('c2Keep')) (W.dayp = W.dayp || {})[S.day] = { h:((screen().querySelector('h1') || {}).textContent || '').trim(), keep:document.getElementById('c2Keep').textContent.trim() }; } }catch(e){}
    return out; }; })(), 1)`);
  let fuel1 = null;
  const step = async stop => { const d0 = await at();
    if(['boot', 'chapter', 'brief1'].includes(d0.t)){ for(const sel of OPEN){ if(await p.$(sel)){ await p.click(sel); await p.waitForTimeout(400); return; } } }
    await p.evaluate(s => window.__tk.run(s), stop); await p.waitForTimeout(60);
    const d1 = await at(); if(d1.day === d0.day && d1.t === d0.t){ for(const sel of OPEN){ if(await p.$(sel)){ await p.click(sel).catch(() => {}); await p.waitForTimeout(300); break; } } } };
  const look = async () => { const d = await at(); (types[d.t] = types[d.t] || []).push(d.day);
    const ph = await E("(roundData(S.round) || {}).weekPhase || ''"); if(['plan', 'review', 'weekReview', 'workings', 'chapterReview'].includes(d.t) || ph === 'plan' || ph === 'review') pauseDays.add(d.day);
    if(await E("(typeof snacksOn === 'function' && snacksOn()) || !!document.getElementById('stOb')")) snacks.push(d.day);
    if(d.day === 1 && ['workings', 'ready', 'plan'].includes(d.t)){ const f = await J("(() => { const pl = currentPlan(), L = planLines(pl), litres = plannedLitres(pl), price = fuelOn(1); return JSON.stringify({ litres:Math.round(litres), price, fuel:Math.round(litres * price), cost:Math.round(L.v.cost || 0) }); })()"); if(f.litres > 0) fuel1 = f; }
    return d; };
  // Launch Day's plan: open it, plan it (the toolkit's auto-plan) and read the fuel at the launch price in Total costs
  for(let g = 0; g < 12; g++){ const d = await at(); if(d.t === 'plan') break; await step('plan'); }
  await p.evaluate(() => window.__tk.autoPlan()); await p.waitForTimeout(300);
  fuel1 = await J("(() => { const pl = currentPlan(), L = planLines(pl), litres = plannedLitres(pl), price = fuelOn(1); return JSON.stringify({ litres:Math.round(litres), price, fuel:Math.round(litres * price), vfuel:Math.round(L.v.fuel || 0), cost:Math.round(L.v.cost || 0), paid:fuelPaid() }); })()");
  for(let g = 0; g < 500; g++){ const d = await look(); if(d.t === 'chapterReview' || d.t === 'protoEnd' || d.day >= 118) break;
    if(d.day === SHOP && d.t === 'plan' && !(await E('S.c1plane || 0'))){ await E("(S.c1plane = 1, acquirePlane(planeById('dhc6'), 'buy'), render(), 1)"); await p.evaluate(() => window.__tk.autoPlan()); }
    await step(d.day >= 92 ? 'chapterEnd' : d.day < SHOP && !(await E('S.c1plane || 0')) ? 'plan' : d.day < WEEKLY - 1 ? 'review' : 'plan'); }   // one game (5 Nov): December runs to the chapter-one card, not on into chapter 2
  for(let g = 0; g < 40; g++){ const d = await look(); if(d.t === 'protoEnd') break; await step('chapterEnd'); }   // one game (5 Nov): stop on the chapter-one card, not on through chapter 2
  console.log('Launch Day fuel'); const h1 = await J('JSON.stringify(S.history.find(h => h.from === 1) || null)');
  ok(fuel1 && fuel1.litres > 0 && fuel1.price === +(await E("+((String(WBS().fuelLaunchDay || '').match(/£(\\d+(?:\\.\\d+)?)/) || [])[1] || 0)")) && fuel1.cost >= fuel1.fuel, `fuel is charged on Launch Day at the workbook's price (${fuel1 ? `${fuel1.litres} L at £${fuel1.price} = £${fuel1.fuel}` : 'not found'})`);
  ok(h1 && h1.fuelPaid > 0 && fuel1 && h1.costs === fuel1.cost, `the Launch Day results' Total costs are the plan's, fuel included (£${h1 && h1.costs})`);
  console.log('After Launch Day (hand-off 3, section 4)'); const A1 = await J('JSON.stringify(window.__wk1)'), R1 = A1.seen.results || {}, C1 = A1.seen.c1check || {}, W1 = A1.seen.weekRun || {};
  const DR = String(await E("String(WBS().dailyChangeDays || '')")).match(/(\d+)\s*-\s*(\d+)/), DAYS = DR ? Array.from({ length:+DR[2] - +DR[1] + 1 }, (_, k) => +DR[1] + k) : [], DP = A1.dayp || {};
  // the 17:37 hand-off (section 1): on the evening Frankfurt is earned, the Day page leads with it and has one button, Plan tomorrow with Frankfurt
  ok(/Launch Day: how it went/.test(R1.text || '') && ((/Keep for tomorrow|Fly anyway/.test(R1.nx || '') && /Change my plan/.test(R1.text || '')) || (/Plan tomorrow with/.test(R1.nx || '') && /opens tomorrow/.test(R1.text || ''))), `Launch Day ends on its Day page: "Launch Day: how it went", Keep for tomorrow / Change my plan, or on a Frankfurt evening Plan tomorrow with Frankfurt (hand-offs 2a and 17:37; ${(R1.nx || 'not seen').trim()})`);
  // Bertie 31 Oct: a day of dailyChangeDays stops on its Day page only when there is at least Settings dailyPauseGain a day to find
  const AU = await J('JSON.stringify({ auto:(S.c1.c2 || {}).auto || {}, gain:(S.c1.c2 || {}).gain || {}, th:+WBS().dailyPauseGain || 0 })');
  ok(DAYS.length === 5 && DAYS.every(d => (DP[d] && /how it went/.test(DP[d].h) && AU.gain[d] >= AU.th) || (!DP[d] && AU.auto[d] !== undefined && AU.auto[d] < AU.th)),
    `each day of dailyChangeDays stops on its Day page only with at least £${AU.th} a day to find (${DAYS.map(d => `day ${d}: ${DP[d] ? 'Day page' : 'flew on'}, £${AU.gain[d]}`).join(' · ')})`);
  ok(!C1.day || C1.day > 7, `no plan check in week 1: the Day page decides (hand-off 2a)${C1.day ? ' (seen on day ' + C1.day + ')' : ''}`);
  const mid1 = [2, 3, 4, 5, 6].filter(d => (A1.pages[d] || {}).hq);
  ok(!mid1.length, `no Home in week 1 after Launch Day${mid1.length ? ' (days ' + mid1.join(', ') + ')' : ''}`);
  console.log('Parked: events, news, snacks'); ok(!types.event, `no event card in chapter one${types.event ? ' (days ' + types.event.join(', ') + ')' : ''}`);
  ok(!snacks.length, `no snacks control or cabin sales${snacks.length ? ' (days ' + [...new Set(snacks)].join(', ') + ')' : ''}`);
  console.log('Questions at each pause'); const Q = await J(`JSON.stringify((rec().entries || []).filter(e => e.type === 'calc' && !/^gq:/.test(e.key)).map(e => ({ key:e.key, day:e.day, pause:c1PauseOf(e.day), q:e.question || e.doc || '' })))`);
  const by = {}; Q.forEach(e => (by[e.pause] = by[e.pause] || []).push(e));
  Object.keys(by).sort((a, z) => a - z).forEach(k => { const keys = [...new Set(by[k].map(e => e.key))]; console.log(`    ${k === '1' ? 'Launch Day' : 'pause ' + k} (${by[k][0] && by[k][0].day ? 'day ' + [...new Set(by[k].map(e => e.day))].join('/') : ''}): ${keys.length} · ${keys.join(' | ')}`); });
  const over = Object.entries(by).filter(([k, l]) => new Set(l.map(e => e.key)).size > 2); ok(!over.length, `never more than two counted questions a pause${over.length ? ' (over: ' + over.map(([k]) => k).join(', ') + ')' : ''}`);
  const QL = await J('JSON.stringify(window.__c1q.log())'), mineFirst = QL.filter(x => x.mine + x.asked.length > 2 || x.asked.length > x.room);
  ok(QL.length > 5 && !mineFirst.length, `his own plan's sums take the slots first: Finance's questions only fill what is left (${QL.map(x => `day ${x.day}: ${x.mine} his + ${x.asked.length}`).join(', ')})`);
  const ld1 = new Set(Q.filter(e => e.day === 1).map(e => e.key)).size, wk1 = new Set(Q.filter(e => e.day > 1 && e.day < 7).map(e => e.key)).size;
  const WK1MAX = +(await E('+WBS().dailyChangeCountedWeek || 0'));
  ok(ld1 === 1 && wk1 <= WK1MAX, `one counted question on Launch Day (the paper sum; ${ld1}), and from Tuesday to Saturday only the daily change's, at most ${WK1MAX} (${wk1})`);
  // every pause is a Sunday review or a Monday plan (from week 5 the review opens the Monday; the months start on a Monday)
  const wd = await J(`JSON.stringify(Object.fromEntries(${JSON.stringify([...new Set(Q.map(e => e.day))])}.map(d => [d, calDate(d).getUTCDay()])))`);
  const mid = Q.filter(e => e.day > 7 && ![0, 1].includes(wd[e.day])); ok(!mid.length, `no questions between pauses${mid.length ? ' (' + mid.map(e => e.key + ' day ' + e.day).join(', ') + ')' : ''}`);
  console.log('The end of chapter one'); const end = await J("JSON.stringify({ t:step().t, text:(screen().textContent || '').replace(/\\s+/g, ' '), next:(document.getElementById('peNext') || {}).textContent || '', fin:!!S.finished, day:S.day })");
  ok(end.t === 'protoEnd' && !!end.next && !/test build stops here/i.test(end.text), `the chapter-one review ends on its card with the way on: "${String(end.next).trim()}" (${end.t}, day ${end.day})`);
  await p.screenshot({ path:OUT + 'end.png' });
  // one game (5 Nov): on through Christmas to chapter 2
  await p.click('#peNext').catch(() => {}); await p.waitForTimeout(400);
  for(let g = 0; g < 60 && (await at()).day < 127; g++){ await p.evaluate(() => window.__tk.run('plan')).catch(() => {}); await p.waitForTimeout(200);
    const n = await p.$('#nx:not([disabled]), #peNext, #enterHq, #chGo, #startDay'); if(n) await n.click().catch(() => {}); }
  const c2 = await J("JSON.stringify({ day:S.day, t:step().t, ch:(WORLD.chapter || {}).chapter || 0 })");
  ok(c2.day >= 127 && c2.ch >= 2, `then on through Christmas to chapter 2 on Mon 6 Jan 2031 (day ${c2.day}, chapter ${c2.ch}, ${c2.t})`);
  await p.screenshot({ path:OUT + 'chapter2.png' });
  console.log('Briefings seen', await E("JSON.stringify(Object.keys((S.brief || {}).seen || {}))"));
  console.log('Hand-off 1c: a TEST airline that keeps its plan, Launch Day to day 37');
  { const q = await b.newPage({ viewport:{ width:1366, height:768 } }), qerrs = []; q.on('pageerror', e => qerrs.push(e.message)); q.on('dialog', d => d.accept());
    await q.goto(FILE); await q.waitForTimeout(800);
    await q.evaluate(() => { const s = window.__sim.settings(); s.flightSecs = 0.2; s.autoWall = false; s.opsSound = false; s.tkAutoPlan = false; });
    await q.evaluate(() => window.__tk.enter()); await q.waitForTimeout(200); await q.evaluate(() => window.__c1.testStart()); await q.waitForTimeout(300);
    const QE = x => q.evaluate(y => window.__sim.evalIn(y), x), QJ = async x => JSON.parse(await QE(x)), qat = () => QJ('JSON.stringify({ day:S.day, t:step().t })');
    await QE(`(window.__pg = {}, window.__strip = {}, (() => { const r0 = render; render = function(){ const out = r0.apply(this, arguments);
      try{ const t = step().t, d = S.day, P = window.__pg[d] = window.__pg[d] || []; const h = ((screen().querySelector('h1') || {}).textContent || '').trim().slice(0, 60);
        if(!P.length || P[P.length - 1].t !== t) P.push({ t, h }); else if(h && !P[P.length - 1].h) P[P.length - 1].h = h;
        if(t === 'hq' && !window.__strip[d]){ const c = document.querySelector('.cu'); if(c) window.__strip[d] = c.textContent.replace(/\\s+/g, ' ').trim(); } }catch(e){}
      return out; }; })(), 1)`);
    const qstep = async stop => { const d0 = await qat();
      if(['boot', 'chapter', 'brief1'].includes(d0.t)){ for(const sel of OPEN){ if(await q.$(sel)){ await q.click(sel); await q.waitForTimeout(400); return; } } }
      await q.evaluate(x => window.__tk.run(x), stop); await q.waitForTimeout(60);
      const d1 = await qat(); if(d1.day === d0.day && d1.t === d0.t){ for(const sel of OPEN){ if(await q.$(sel)){ await q.click(sel).catch(() => {}); await q.waitForTimeout(300); break; } } } };
    const G = {};
    for(let g = 0; g < 200; g++){ const d = await qat(); if(d.day >= 37) break;
      if(d.t === 'plan' && [8, 14, 15, 21, 22, 28, 29].includes(d.day) && !G[d.day]) G[d.day] = await QJ(`JSON.stringify({ wi:c1WiOn(), fuel:(+WBS().fuelDeskFromDay || 0) <= S.day, shop:shopPlanes(S.day).length, opening:routesOpening(S.day).map(r => r.id), mad:routeOpen(routeById('mad'), S.day), extras:!document.body.classList.contains('n15-wk1') })`);
      await qstep('plan'); }
    const PG = await QJ('JSON.stringify(window.__pg)'), ST = await QJ('JSON.stringify(window.__strip)'), has = (d, t) => (PG[d] || []).some(x => x.t === t), title = (d, t) => ((PG[d] || []).find(x => x.t === t) || {}).h || '';
    const QK = await QJ(`JSON.stringify((rec().entries || []).filter(e => e.type === 'calc' && !/^gq:/.test(e.key)).map(e => ({ key:e.key, day:e.day, pause:c1PauseOf(e.day), q:e.question || e.doc || '' })))`), per = P => new Set(QK.filter(e => e.pause === P).map(e => e.key)).size;
    console.log('    pages: ' + [8, 15, 22, 29, 36].map(d => `day ${d}: ` + (PG[d] || []).map(x => x.t).join(' ')).join(' / '));
    console.log('    counted: ' + [1, 8, 15, 22, 29, 36].map(P => `${P === 1 ? 'Launch Day' : 'P' + ({ 8:1, 15:2, 22:3, 29:4, 36:5 })[P]} ${per(P)}`).join(', ') + ' · ' + [...new Set(QK.map(e => e.key))].join(' | '));
    // Bertie 31 Oct (evening): the what-if sheet and its two counted questions move to week 2; the Fuel desk stays in week 3
    const K8 = [...new Set(QK.filter(e => e.day === 8).map(e => e.key))], Q8 = QK.filter(e => e.day === 8).map(e => e.q);
    ok(!has(8, 'workings') && has(8, 'c1q') && has(8, 'c1check') && /Week 2 is flying/.test(title(8, 'weekRun')) && per(8) === 2 && K8.includes('pq:whatIfFirst:8') && K8.includes('pq:whatIfWeek:8'),
      `week 2: the two what-if questions on Monday, the plan check, then "Week 2 is flying" (${(PG[8] || []).map(x => x.t).join(' → ')}; ${K8.join(', ')})`);
    ok(Q8.some(s => /× £(93|103)$/.test(s)) && Q8.some(s => /× 7$/.test(s)), `the what-if questions try his fare + £${await E('+WBS().whatIfQuestionStep')} (seats filled × fare), then more a day × 7 (${Q8.join(' | ')})`);
    ok([3, 4].every(n => /is flying/.test(title(n * 7 - 6, 'weekRun')) && new RegExp(`Week ${n} is flying`).test(title(n * 7 - 6, 'weekRun'))) && !has(29, 'c1check'), 'weeks 3 and 4 fly on the same page; week 5 keeps the board (Settings weekFlyingPages, weeks 1 to 4)');
    ok(!has(8, 'fuelDesk') && has(15, 'fuelDesk'), `the Fuel desk first opens on day 15 (${[8, 15].map(d => `day ${d}: ${has(d, 'fuelDesk') ? 'yes' : 'no'}`).join(', ')})`);
    ok(G[8] && G[8].wi && !G[8].fuel && G[15] && G[15].wi && G[15].fuel && !G[15].shop, `day 8: the what-if sheet and no Fuel desk; day 15: the Fuel desk, no shop yet (${JSON.stringify(G[8])} · ${JSON.stringify(G[15])})`);
    ok(G[22] && G[22].shop > 0 && ['ams', 'fra', 'gva', 'bcn'].every(id => G[22].opening.includes(id)) && G[22].extras && G[15] && !G[15].extras, `day 22: the shop (${G[22] && G[22].shop} planes), the four routes (${G[22] && G[22].opening.join(', ')}), View trade-offs and ƒ work it out (hidden on day 15)`);
    ok(G[29] && G[29].mad && G[22] && !G[22].mad && has(29, 'intro'), 'day 29: Madrid opens, with its New today page');
    ok(!has(36, 'review') && has(36, 'plan') && has(36, 'sim'), `day 36: weekly play starts, without a second review of Sunday (${(PG[36] || []).map(x => x.t).join(' → ')})`);
    ok([8, 15, 22, 29, 36].every(P => per(P) === 2) && per(1) === 1, `a pupil who keeps his plan is asked two counted questions at every pause from P1 (${[8, 15, 22, 29, 36].map(P => per(P)).join(', ')})`);
    const NX = d => ((ST[d] || '').split('NEXT')[1] || '').split('LATER')[0];
    ok(/Fuel desk/.test(NX(8)) && /Amsterdam/.test(NX(15)) && /Madrid/.test(NX(22)) && /Marrakech/.test(NX(29)), `the Roadmap's NEXT on Home: day 8 "${NX(8).trim()}" · day 15 "${NX(15).trim().slice(0, 40)}" · day 22 "${NX(22).trim().slice(0, 40)}" · day 29 "${NX(29).trim().slice(0, 40)}"`);
    ok(!qerrs.length, `no page errors in the keep-his-plan run${qerrs.length ? ': ' + qerrs.slice(0, 2).join(' | ') : ''}`);
    await q.close(); }
  console.log('Chapter-one jumps'); const dir = path.join(__dirname, 'fixtures', 'jumps-ch1'), idx = fs.existsSync(path.join(dir, 'index.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')) : [];
  ok(idx.length >= 7, `${idx.length} chapter-one TEST saves (Launch Day, P1–P5, the review)`);
  for(const j of idx){ const r = await p.evaluate(c => { try{ const s = window.__sim.loadCode(c); return { day:s.day, test:!!s.test }; }catch(e){ return { err:e.message }; } }, fs.readFileSync(path.join(dir, j.file), 'utf8').trim());
    ok(!r.err && r.day === j.day, `${j.label} loads on day ${r.day}${r.err ? ' — ' + r.err : ''}`); }
  console.log('One game file (5 Nov 2026)'); const late = fs.readFileSync(path.join(__dirname, 'fixtures', 'jumps', 'day-127.txt'), 'utf8').trim();
  const lr = await p.evaluate(c => { try{ return { day:window.__sim.loadCode(c).day }; }catch(e){ return { err:e.message }; } }, late);
  ok(!lr.err && lr.day === 127, `a save from January 2031 opens here (${lr.err || 'day ' + lr.day})`);
  ok(await E("typeof isLongHaul") === 'function' && await E("c1BuildEnds()") === 0, 'every part is in: the long-haul and chapter-four parts too, and the build does not end at the chapter-one review');
  const JK = await p.evaluate(() => Object.keys(JSON.parse(document.getElementById('data-jumps').textContent)));
  ok(['c1p0', 'c1p6', 'd127', 'd274', 'd365', 'd736'].every(k => JK.includes(k)) && !JK.includes('d1') && !JK.includes('d92'), `Jump to…: chapter one's TEST saves, then the Steady path's from January 2031 (${JK.join(', ')})`);
  ok(!fs.existsSync(path.resolve(ROOT, 'airline-opening-full.html')), 'no second game file (airline-opening-full.html is gone)');
  ok(!errs.length, `no page errors${errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''}`);
  console.log(`\n${pass} ok, ${fail} failed`); await b.close(); process.exit(fail ? 1 : 0);
})();
