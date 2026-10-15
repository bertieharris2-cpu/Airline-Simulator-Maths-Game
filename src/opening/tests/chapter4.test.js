// Run: NODE_PATH=<playwright node_modules> CODE=<file> TYPE=value|premium node chapter4.test.js   (env: UPTO day (default 1100), SHOTS=0, OUT, W, H, SAVE, GAME)
// Workbook v5.5 (D82–D85): chapter 4 "The ultimate plane", push 1. CODE is a save at chapter 3's end card (day 730):
//   TYPE=<type> SAVE=<file> node chapter3.test.js
// Checked:
//   - the end of the summer (1–5 September 2032) flying by itself;
//   - Monday 6 September: What's new, then the A380 offer page (the A380 and the 747 on Hong Kong and Los Angeles, does it
//     fill?). Value takes the A380; Premium takes the 747.
//   - the finance sum (Calculate, two steps, two tries): the deposit today and the first payment on 1 October 2032;
//   - the big planes against Balance Report §2;
//   - does it fill? month by month in the reviews;
//   - the campaign project's button, the hold and the choices;
//   - hunt h5 at the review on 31 August 2033: Value finds it, Premium misses it and pays one month more.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const FILE = 'file://' + path.resolve(__dirname, '../../..', process.env.GAME || 'airline-opening-prototype.html'), OUT = (process.env.OUT || os.tmpdir() + '/airline-ch4') + '/'; fs.mkdirSync(OUT, { recursive:true });
const W = +(process.env.W || 1680), H = +(process.env.H || 940), SHOTS = process.env.SHOTS !== '0', UPTO = +(process.env.UPTO || 1100), TYPE = process.env.TYPE || 'value';
const CODE = process.env.CODE || path.join(os.tmpdir(), `airline-ch3-end-${TYPE}.txt`);
if(!fs.existsSync(CODE)){ console.log(`No save code at ${CODE}. Make one: TYPE=${TYPE} SAVE=${CODE} node chapter3.test.js`); process.exit(1); }
(async () => {
  const ftpSeen = [];
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport:{ width:W, height:H } })).newPage();
  p.setDefaultTimeout(120000);   // chapter 4's month-end audit runs the best-plan sweep over five aircraft: 20–40 s (a known slow spot)
  const errors = [], checks = [], info = {};
  p.on('pageerror', e => errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if(m.type() === 'error') errors.push('console: ' + m.text()); }); p.on('dialog', d => d.accept());
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { const st = window.__sim.settings(); st.flightSecs = 0.25; st.autoWall = false; st.opsSound = false; });
  const T = () => p.evaluate(() => window.__sim.step().t), S = () => p.evaluate(() => window.__sim.S()), E = src => p.evaluate(s => window.__sim.evalIn(s), src), J = async src => JSON.parse(await E(`JSON.stringify(${src})`));
  const ok = (name, cond, x) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (x !== undefined ? ' ' + JSON.stringify(x) : ''));
  const shot = async n => { if(!SHOTS) return; await p.waitForTimeout(150); await p.screenshot({ path:OUT + n + '.png' }); };
  const vis = sel => p.evaluate(s => !!document.querySelector(s), sel);
  const txt = async sel => (await p.$eval(sel, e => e.textContent).catch(() => '')).replace(/\s+/g, ' ').trim();
  const builds = async () => { const done = []; for(let g = 0; g < 14; g++){ const P = await E('rbPlan()'); if(!P) break;
      if(P.seq){ for(const x of P.seq) await p.click(['+', '−', '×', '÷'].includes(x) ? `[data-rbop="${P.id}|${x}"]` : `[data-rbfig="${P.id}|${x}"]`); }
      else { await p.click(`[data-rbop="${P.id}|${P.op}"]`); await p.fill(`[data-rbdiv="${P.id}"]`, String(P.div)); }
      await p.click(`[data-rbchk="${P.id}"]`); await p.waitForTimeout(80); done.push(P.id); } return done; };
  const signs = async () => { for(let g = 0; g < 14; g++){ const P = await E('soPlan()'); if(!P) break;
      if(P.rb){ await p.click(`[data-rbop="${P.rb.id}|${P.rb.op}"]`); await p.fill(`[data-rbdiv="${P.rb.id}"]`, String(P.rb.div)); await p.click(`[data-rbchk="${P.rb.id}"]`); await p.waitForTimeout(80); continue; }
      const k = P.key.replace(/"/g, '\\"');
      if(P.pre){ await p.fill(`[data-sopre="${k}"]`, P.pre); await p.click(`[data-soprechk="${k}"]`); await p.waitForTimeout(80); }
      if(P.level === 'build'){ for(const x of P.seq) await p.click(['+', '−', '×', '÷'].includes(x) ? `[data-soop="${k}|${x}"]` : `[data-sofig="${k}|${x}"]`); }
      else await p.fill(`[data-soin="${k}"]`, P.answer);
      await p.click(`[data-sochk="${k}"]`); await p.waitForTimeout(80); } };
  const solveW = async () => { for(let g = 0; g < 80; g++){ if(await T() !== 'workings') break;
      if(await p.$('#wkTutNext')){ await p.click('#wkTutNext'); continue; } if(await p.$('#wkTutGo')){ await p.click('#wkTutGo'); continue; }
      if(await p.$('#pbChk')){ const P = JSON.parse(await E('JSON.stringify(paperPlan())')); for(const x of P.seq) await p.click(['+', '−', '×', '÷'].includes(x) ? `[data-pbop="${x}"]` : `[data-pbfig="${x}"]`); await p.click('#pbChk'); await p.waitForTimeout(60); continue; }
      if(await p.$('#cellAns')){ await p.evaluate(() => { const t = window.__sim.currentTable(), c = t.cols.find(x => x.id === t.active.col); document.getElementById('cellAns').value = String(c.values[t.active.row]); }); await p.press('#cellAns', 'Enter'); await p.waitForTimeout(60); continue; }
      if(await p.$('#scNext:not([disabled])')){ await p.click('#scNext'); continue; }
      if(await p.$('#wkNext')){ await p.click('#wkNext'); continue; }
      if(await p.$('#nx')) break; await p.waitForTimeout(80); } };
  const BIG = TYPE === 'premium' ? 'b747' : 'a380';

  // ---------- chapter 3's end card ----------
  const code = fs.readFileSync(CODE, 'utf8').trim();
  await p.evaluate(c => { const s = window.__sim.loadCode(c); window.__sim.setS(s); window.__sim.landSave(); window.__sim.render(); }, code);
  let s = await S(); info.start = { day:s.day, cash:Math.round(s.cash), fleet:s.fleet.map(f => f.planeId), rep:s.rep };
  ok("the save is at chapter 3's end (day 730)", s.day === 730, info.start);
  if(await T() !== 'protoEnd'){ await E("(S.si = S.steps.findIndex(x => x.t === 'protoEnd'), render(), 1)"); await p.waitForTimeout(150); }
  ok('chapter 3 complete: the card names chapter 4, The ultimate plane, on Monday 6 September 2032, with On to chapter 4', /Next: chapter 4, The ultimate plane, opens on Monday 6 September 2032/.test(await txt('.proto-end')) && /On to chapter 4/.test(await txt('#peNext')), await txt('.proto-end p.muted'));
  await shot('c4-01-chapter3-end'); await p.click('#peNext'); await p.waitForTimeout(200);

  // ---------- the end of the summer (days 731–735) ----------
  s = await S(); ok('the end of the summer: one run from 1 to 5 September (days 731–735), titled as such', s.period && s.period.type === 'gap' && s.period.from === 731 && s.period.to === 735 && (await E('roundData(S.round).title')) === 'The end of the summer', [s.period, await E('roundData(S.round).title')]);
  ok('it opens on HQ with "Fly 1–5 September"', await T() === 'hq' && /Fly 1–5 September/.test(await txt('#startDay')), await txt('#startDay'));
  await shot('c4-02-summer-hq'); await p.click('#startDay'); await p.waitForTimeout(100);
  for(let k = 0; k < 200 && await T() === 'sim'; k++){ if(await p.$('#skipSim')) await p.click('#skipSim').catch(() => {}); await p.waitForTimeout(150); }
  ok('after the run, the results lead on to chapter 4', await T() === 'results' && /On to chapter 4/.test(await txt('#nx')), [await T(), await txt('#nx')]);
  await shot('c4-03-summer-results'); await p.click('#nx'); await p.waitForTimeout(200);

  // ---------- chapter 4 ----------
  // D89: the fuel farm on the Fuel desk: open it, Build "is it worth it?" when asked, then buy it or say not now
  const farm = async buy => { if(!(await p.$('#fsFarmOpen'))) return null; const line = await txt('.fs-farm-l'); await p.click('#fsFarmOpen'); await p.waitForTimeout(120);
    const R0 = JSON.parse(await E('JSON.stringify(fuelStoreReport())')), dlg = await txt('.fs-dlg'), c0 = (await S()).cash;
    if(await p.$('#fsChk')){ for(const s of ['[data-fsfig="L"]', '[data-fsop="×"]', '[data-fsfig="R"]']) await p.click(s); await p.click('#fsChk'); await p.waitForTimeout(100); }
    const sum = await txt('.fs-sum'), canBuy = !!(await p.$('#fsBuy:not([disabled])'));
    if(buy && canBuy){ await p.click('#fsBuy'); await p.waitForTimeout(120); } else if(await p.$('#fsNot')){ await p.click('#fsNot'); await p.waitForTimeout(100); }
    return { line, dlg, sum, canBuy, R0, R1:JSON.parse(await E('JSON.stringify(fuelStoreReport())')), paid:Math.round(c0 - (await S()).cash) }; };
  const seen = {}; let cash0 = null;
  for(let i = 0; i < 1500; i++){ const t = await T(); s = await S(); const day = s.day;
    if(day >= UPTO && t === 'hq'){ checks.push('stopped at hq day ' + day); break; }
    if(t === 'hq'){
      if(day === 736 && !seen.hq736){ seen.hq736 = true; ok('day 736: chapter 4 opens on HQ (Monday 6 September 2032)', (await J('roundData(S.round).chapterNo')) === 4 && (await E('dateLong(S.day)')).includes('6 September 2032'), await E('dateLong(S.day)')); await shot('c4-04-day736-hq'); }
      if(day >= 764 && !seen.camp){ seen.camp = true; await shot(`c4-d${day}-hq-project`);
        ok(`the campaign project: a Project button on HQ from 4 October 2032 (day ${day}), with a big plane in the fleet`, await vis('#cpOpen') && /A380 launch/.test(await txt('#cpOpen')), await txt('#cpOpen'));
        await p.click('#cpOpen'); await p.waitForTimeout(200); await shot('c4-05-project');
        ok('the project page: the board\'s letter, the choices (route, audience, channel, budget, length, launch date) and the portfolio', await vis('.cp-page') && /Fill the A380/.test(await txt('.cp-letter')) && (await p.$$('[data-cpch]')).length === 6 && (await p.$$('[data-cppf]')).length === 4, await txt('.cp-letter'));
        for(const [k, v] of [['route', 'hkg'], ['audience', 'families'], ['channel', 'online'], ['budget', '0.1'], ['length', '4']]){ await p.selectOption(`[data-cpch="${k}"]`, v); await p.waitForTimeout(60); }
        await p.fill('[data-cppf="offer"]', 'Kids fly for half price in the first month.'); await p.dispatchEvent('[data-cppf="offer"]', 'input');
        await p.click('#cpPause'); await p.waitForTimeout(100); await p.click('#cpClose'); await p.waitForTimeout(150);
        const held = await p.$eval('#startDay', e => e.disabled).catch(() => null); ok('while the project holds the airline, HQ\'s Start is disabled', held === true, held);
        await p.click('#cpOpen'); await p.waitForTimeout(150); await p.click('#cpPause'); await p.waitForTimeout(80);
        if(TYPE === 'value'){ await p.fill('[data-cpch="launch"]', '2032-11-01'); await p.dispatchEvent('[data-cpch="launch"]', 'change'); await p.waitForTimeout(80); await p.click('#cpSend'); await p.waitForTimeout(150); }
        else { await p.click('#cpClose'); await p.waitForTimeout(150); }
        const C = await J('campaignReport()'); info.campaign = C;
        ok('the choices and the words are kept in the save; the run is free again', C && C.choices.route === 'hkg' && C.choices.audience === 'families' && C.words >= 5 && !C.paused && (await p.$eval('#startDay', e => !e.disabled)), C);
        if(TYPE === 'value') ok('sent to the board with a launch date: the result applies from it once scored (campaignDemand is 1 until then)', C.status === 'submitted' && C.launchDay === (await E("dayOfDate('2032-11-01')")) && (await E("campaignDemand('hkg', S.day + 60)")) === 1, C); }
      await p.click('#startDay'); continue; }
    if(t === 'intro'){ if(day === 736 && !seen.intro){ seen.intro = true; const x = await txt('#screen'); ok("day 736: What's new: the A380 on finance, and does it fill?", /The A380 on finance, and does it fill\?/.test(x) && /Monthly payment/.test(x), x.slice(0, 200)); await shot('c4-06-intro'); }
      for(let pg = 0; pg < 3; pg++) if(await p.$('#niNext')) await p.click('#niNext');
      const n = (await p.$$('[data-ni]')).length; for(let k = 0; k < n && await p.$eval('#nx', e => e.disabled).catch(() => false); k++) await p.click(`[data-ni="${k}"]`); await p.click('#nx'); continue; }
    if(t === 'event'){ const id = await E('S.rnd.event && S.rnd.event.id');
      if(id === 'a380_offer'){ await shot('c4-07-offer'); const F = await J('offerPlan()'); info.offer = F.map(x => ({ pid:x.pid, routes:x.routes.map(r => [r.rid, r.fare, r.pax, r.seats, r.own]) }));
        ok('the offer page: the A380 and the 747 side by side, each on Hong Kong and Los Angeles with "Does it fill?" and the seats lit', (await p.$$('.off4-col')).length === 2 && (await p.$$('.off4-r')).length === 4 && (await p.$$('.fill4')).length === 4 && /Does it fill\? \d+ ÷ 500/.test(await txt('.off4-col')), info.offer);
        ok('three choices from the EventOptions rows: Take the A380, Take the 747 instead, Neither for now', JSON.stringify(await p.$$eval('[data-off4]', es => es.map(e => e.querySelector('small') ? e.firstChild.textContent.trim() : e.textContent.trim()))) === JSON.stringify(['Take the A380', 'Take the 747 instead', 'Neither, for now']), await p.$$eval('[data-off4]', es => es.map(e => e.textContent)));
        cash0 = Math.round((await S()).cash); await p.click(`[data-off4="${BIG === 'a380' ? 0 : 1}"]`); await p.waitForTimeout(300); continue; }
      await p.click('[data-o="0"]').catch(() => {}); await p.click('#nx'); await p.waitForTimeout(80); if(await T() === 'event') await p.click('#nx'); continue; }
    if(t === 'acquire'){ await shot(`c4-d${day}-acquire`);
      if(await vis('.fin-card') && !seen.fin){ seen.fin = true; const O = await J(`shopOffer(planeById('${BIG}'))`); info.offerTerms = O;
        ok(`the pay page: Finance chosen, the ${BIG} at ${O.deposit} down and ${O.pay} a month for ${O.n} months; the button waits for the sum`, O.unit === 'month' && await p.$eval('#nx', e => e.disabled) && /Work out the monthly payment first/.test(await txt('#nx')), O);
        ok('the finance sum is a Calculate the first time, numbered (Sum N), in two steps', /Calculate/.test(await txt('.fin-card .so-lv')) && /Sum \d+/.test(await txt('.fin-card')) && await vis('[data-pad="fin1"]'), await txt('.fin-card .sc-h'));
        await p.fill('[data-pad="fin1"]', String(O.price + O.deposit)); await p.click('#fin1Chk'); await p.waitForTimeout(80);
        ok('step 1: adding the deposit is a Query, with one more try', /that adds them/.test(await txt('.fin-card')) && /One more try/.test(await txt('.fin-card')), await txt('.fin-card .sc-msg'));
        await p.fill('[data-pad="fin1"]', String(O.price - O.deposit)); await p.click('#fin1Chk'); await p.waitForTimeout(80);
        await p.fill('[data-pad="fin2"]', String(O.pay * 10)); await p.click('#fin2Chk'); await p.waitForTimeout(80);
        ok('step 2: ten times out is a note, the check (months × payment + deposit = price) and one more try', /ten times/i.test(await txt('.fin-card')) && /One more try/.test(await txt('.fin-card')), await txt('.fin-card .sc-msg'));
        await p.fill('[data-pad="fin2"]', String(O.pay)); await p.click('#fin2Chk'); await p.waitForTimeout(100); await shot('c4-08-finance-done');
        ok('the sum is signed: (price − deposit) ÷ months, the check line, and the button is free', await vis('.fin-card.ok') && /No interest/.test(await txt('.fin-card')) && await p.$eval('#nx', e => !e.disabled), await txt('.fin-card'));
        await p.click('#nx'); await p.waitForTimeout(300);
        s = await S(); const f = s.fleet.find(x => x.planeId === BIG), due = await J(`(S.charges.due || []).filter(c => c.fin === ${f ? f.uid : -1}).map(c => [c.day, c.amount, c.what])`);
        info.fin = { cash0, cash:Math.round(s.cash), terms:f && f.terms, first:due[0], n:due.length };
        ok(`the deposit is paid today: cash down by ${O.deposit}; the plane is on monthly finance with no day cost for the payments`, f && Math.round(s.cash) === cash0 - O.deposit && f.terms.unit === 'month' && f.terms.daily === 0 && f.terms.monthly === O.pay, info.fin);
        ok('the first payment is on Friday 1 October 2032 (day 761), then one on the first of each month, 40 in all', due.length === O.n && due[0][0] === (await E("dayOfDate('2032-10-01')")) && due[0][1] === O.pay && /month 1 of 40/.test(due[0][2]) && due[1][0] === (await E("dayOfDate('2032-11-01')")), due.slice(0, 2));
        ok('the record has the finance sum (Calculate) with both steps\' working', await E(`(() => { const e = rec().entries.find(x => x.key === 'fin:${BIG}'); return !!(e && e.attempts.some(a => a.ok) && e.attempts.some(a => !a.ok)); })()`));
        // the big planes against Balance Report §2: per day after the day cost, before finance, overnight rotations ÷ 2, fuel £2.35, no on-board sales
        const bal = await J("(() => { const a = fuelPrice, b = fuelOn; fuelPrice = () => 2.35; fuelOn = () => 2.35; try{ return [['hkg','b747',850,3,71110],['hkg','b747',870,4.5,75110],['hkg','a380',790,3,84648],['hkg','a380',830,4.5,94648],['lax','b747',760,3,60930],['lax','a380',720,3,75935]].map(([r,p,f,st,v]) => { const x = bigFares(p, r, [f], { stars:st, day:775, alone:true, onboard:'none', plain:true })[0]; return [r, p, f, st, x.perDay, v, x.perDay - v, x.pax]; }); } finally { fuelPrice = a; fuelOn = b; } })()");
        info.balance = bal; ok('Balance Report §2: the 747 and the A380 on Hong Kong and Los Angeles within £50 a day (fuel £2.35, no on-board sales, no airline-type extras)', bal.every(x => Math.abs(x[6]) <= 50), bal);
        const fill = await J("[3, 4.5].map(st => dryRun(() => { S.rep = st; return atDay(dayOfDate('2032-10-01'), () => [st, paxFor(routeById('hkg'), 830)]); }))"); info.fillHKG830 = fill;
        ok('does it fill? Hong Kong at £830: an A380 carries min(people who want to fly, 500): full at 4½★', fill[1][1] >= 500, fill);
        continue; }
      if(await p.$('#noBuy')){ await p.click('#noBuy'); continue; } await p.click('#nx'); continue; }
    if(t === 'paint'){ await p.click('#roll'); continue; }
    if(t === 'reveal'){ await p.click('#skipReveal', { timeout:2000 }).catch(() => {}); for(let k = 0; k < 50 && await p.$eval('#nx', e => e.hidden); k++) await p.waitForTimeout(100); await p.click('#nx'); continue; }
    if(t === 'shop2'){ await p.click('#skipShop'); continue; }
    if(t === 'fleetSums'){ if(await vis('.so-page')) await signs(); else await solveW(); await p.click('#nx'); continue; }
    if(t === 'plan' && await p.$('.ftp-page')){ ftpSeen.push(await p.evaluate(() => JSON.stringify([window.__sim.S().day, window.__sim.evalIn('ftpPlan()'), (document.querySelector('.ft-cmp') || {}).textContent || '']))); for(let g = 0; g < 8; g++){ const P = await p.evaluate(() => JSON.parse(JSON.stringify(window.__sim.evalIn('ftpPlan()')))); if(!P) break; if(P.next){ await p.fill(`[data-ftpin="${P.next.key}"]`, String(P.next.answer)); await p.click(`[data-ftpchk="${P.next.key}"]`); await p.waitForTimeout(60); } else { await p.click('#ftpGo'); await p.waitForTimeout(150); } } continue; }   // flight times before the timetable
    if(t === 'plan'){ if(day === 736 && !seen.plan736){ seen.plan736 = true; const on = await J(`currentPlan().fleet.filter(x => S.fleet.find(f => f.uid === x.uid).planeId === '${BIG}').map(x => x.sched)`); ok(`the ${BIG} starts on the plan it was compared on (Hong Kong)`, on.length === 1 && on[0].includes('hkg'), on); await shot('c4-09-plan736'); }
      if(await vis('#s2Back')){ await p.click('#s2Back'); await p.waitForTimeout(100); }
      if(await E('soBoardWaiting()')){ await E("(() => { const id = Object.keys(S.prices).find(x => routeById(x) && routeById(x).fares && routeById(x).fares.length > 1 && normPlan(currentPlan()).fleet.some(f => f.sched.includes(x))); const F = routeById(id).fares, i = F.indexOf(S.prices[id]); S.prices[id] = F[i > 0 ? i - 1 : i + 1]; refreshPlan(); render(); return 1; })()"); await p.waitForTimeout(100); }
      const en = await p.$eval('#nx', e => !e.disabled).catch(() => false); ok(`plan ${day}: continue enabled`, en); if(!en){ await shot(`c4-d${day}-plan-stuck`); break; } await p.click('#nx'); continue; }
    if(t === 'workings' && await vis('.so-page')){ await signs(); await p.waitForTimeout(300); await p.click('#nx'); await p.waitForTimeout(80); continue; }
    if(t === 'workings'){ await solveW(); await p.click('#nx'); continue; }
    if(t === 'fuelDesk' && !seen.farm2 && day >= 736){ seen.farm2 = true; const F = await farm(TYPE === 'value'); info.farm2 = F && { line:F.line, sum:F.sum, R1:F.R1, paid:F.paid };   // D89
      if(TYPE === 'value') ok('D89: from 6 September 2032 the second stage: 3,000,000 L in all for £3,000,000; the worth line is the model\'s now (1,500,000 more × 60p = £900,000); Value buys it', F && /the second stage, 3,000,000 L in all for £3,000,000/.test(F.line) && /1,500,000 × 60p = £900,000/.test(F.sum) && !/Build it from the figures/.test(F.dlg) && F.paid === 3000000 && F.R1.farm.stage === 2 && F.R1.cap === Math.max(3000000, F.R1.fleetCap), F && [F.line, F.sum, F.paid, F.R1.cap]);
      else ok('D89: Premium has no farm, so stage 1 is still on offer (1,500,000 L for £2,000,000)', F && /1,500,000 L for £2,000,000/.test(F.line), F && F.line); }
    if(t === 'fuelDesk'){ const bn = await p.$('[data-fdb="2"]:not([disabled])'); if(bn){ await bn.click(); await p.waitForTimeout(60);
        if(await p.$('#foChk')){ const FO = JSON.parse(await E('JSON.stringify(foPlan())')); if(FO.level === 'build'){ for(const x of FO.seq) await p.click(x === '×' ? '[data-foop="×"]' : `[data-fofig="${x}"]`); } else await p.fill('#foIn', FO.answer); await p.click('#foChk'); await p.waitForTimeout(60); }
        if(await p.$('#fdBuy:not([disabled])')) await p.click('#fdBuy'); await p.waitForTimeout(80); } await p.click('#nx'); continue; }
    if(t === 'audit'){ await shot(`c4-d${day}-audit`); await signs(); await p.click('#nx'); continue; }
    if(t === 'milestone'){ await p.click('#msGo'); continue; }
    if(t === 'review'){ await shot(`c4-d${day}-review`);
      if(day > 761 && !seen.fill4 && await vis('.fill4-pnl')){ seen.fill4 = true; const x = await txt('.fill4-pnl'); info.fill4 = x.slice(0, 300);
        ok(`the month's review: Does the ${BIG === 'a380' ? 'A380' : '747'} fill? month by month (passengers ÷ seats)`, new RegExp(`Does the ${BIG === 'a380' ? 'A380' : '747'} fill\\?`).test(x) && /[\d,]+ of [\d,]+ seats/.test(x), x.slice(0, 200)); }
      if(day > 761 && !seen.paid){ seen.paid = true; const P = await J(`(() => { const f = S.fleet.find(x => x.planeId === '${BIG}'); return { paid:finPaid(f), word:termsWord(f.terms) }; })()`); info.paid = P;
        ok('the first payment has been taken; the fleet shows the payments to go', P.paid >= 1 && /on finance: £[\d,]+ a month, \d+ of 40 payments to go/.test(P.word), P); }
      if(await vis('.rbw')) await builds(); if(await p.$('#calcDone')) await p.click('#calcDone');
      if(!(await p.$eval('#nx', e => !e.disabled).catch(() => false))){ ok(`review ${day}: the review's sums can be signed`, false); await shot(`c4-d${day}-review-stuck`); break; }
      await p.click('#nx'); continue; }
    if(t === 'hunt'){ await shot(`c4-d${day}-hunt`); const sp = await J("(() => { const x = huntSpec(step().id); return x && { id:x.id, title:x.title, lines:x.lines.map(l => [l.lab, l.a, l.b, l.shown, !!l.wrong]), right:x.right }; })()"); info.h5 = sp;
      ok('hunt h5 on 31 August 2033: the year-3 accounts\' finance line, one payment too many', sp && sp.id === 'h5' && day === (await E("dayOfDate('2033-08-31')")) && sp.lines[0][3] === sp.lines[0][1] * sp.lines[0][2] + sp.lines[0][2] && sp.right === sp.lines[0][1] * sp.lines[0][2], sp);
      if(TYPE === 'value'){ await p.click('[data-hunt="0"]'); await p.waitForTimeout(80); await p.fill('[data-pad="hunt"]', String(sp.right)); await p.click('#huntChk'); await p.waitForTimeout(100);
        ok('Value finds it: "Found and fixed"', /Found and fixed/.test(await txt('.hunt-msg')) && (await E("huntState('h5').state")) === 'found', await txt('.hunt-msg')); }
      else { const n0 = await J(`(S.charges.due || []).filter(c => c.fin === (S.fleet.find(x => x.planeId === '${BIG}') || {}).uid).length`); await p.click('#huntAllOk'); await p.waitForTimeout(100);
        const n1 = await J(`(S.charges.due || []).filter(c => c.fin === (S.fleet.find(x => x.planeId === '${BIG}') || {}).uid).length`);
        ok('Premium misses it: repayments run a month longer (one more payment at the end)', (await E("huntState('h5').state")) === 'missed' && n1 === n0 + 1 && /one more payment/.test(await txt('.hunt-msg')), [n0, n1, await txt('.hunt-msg')]); }
      await p.click('#nx'); continue; }
    if(t === 'sim'){ const sg = await E('JSON.stringify(step())'); if(await p.$('#skipSim')) await p.click('#skipSim').catch(() => {}); for(let k = 0; k < 200 && await T() === 'sim' && await E('JSON.stringify(step())') === sg; k++) await p.waitForTimeout(100); continue; }
    if(t === 'ready'){ const en = await p.$eval('#startOps', e => !e.disabled); ok('ready ' + day, en); if(!en){ await shot(`c4-d${day}-ready-stuck`); break; } await p.click('#startOps'); continue; }
    if(t === 'takeoff'){ await p.click('#toGo'); for(let k = 0; k < 200 && await p.$eval('#nx', e => e.hidden); k++) await p.waitForTimeout(100); await p.click('#nx'); continue; }
    if(t === 'fly'){ for(let k = 0; k < 80 && await T() === 'fly'; k++) await p.waitForTimeout(250); continue; }
    if(t === 'results'){ await p.click('#nx'); continue; }
    if(t === 'weekRun'){ const d0 = day; for(let k = 0; k < 150 && await T() === 'weekRun' && (await S()).day === d0; k++) await p.waitForTimeout(150); continue; }
    if(t === 'weekReview'){ if(await vis('.rbw')) await builds(); await p.waitForTimeout(80); await p.click('#nx'); continue; }
    if(t === 'chapter'){ await p.click('#chGo'); continue; }
    if(t === 'chapterReview' && !seen.accounts){ seen.accounts = true; await shot('c4-10-year3-accounts'); const d = await builds(); ok('the chapter 4 review (31 August 2033): the year-3 accounts are signed off', await p.$eval('#nx', e => !e.disabled).catch(() => false), d); await p.click('#nx'); await p.waitForTimeout(150); continue; }
    if(t === 'protoEnd' || t === 'chapterReview'){ checks.push('reached ' + t + ' day ' + day); await shot('c4-11-chapter-end'); break; }
    checks.push('stopped at ' + t + ' day ' + day); await shot('c4-stop'); break; }
  s = await S(); checks.push('end at ' + await T() + ' day ' + s.day + ' cash ' + Math.round(s.cash));
  if(process.env.SAVE){ fs.writeFileSync(process.env.SAVE, await p.evaluate(() => window.__sim.saveCode())); checks.push('info save code written to ' + process.env.SAVE); }
  if(s.day >= 1095){ const HH = (s.history || []).filter(h => h.from >= 736);
    ok('the chapter ran a day at a time from 6 to 12 September, then months to the review on 31 August 2033', HH.filter(h => h.type === 'day').length === 7 && HH.some(h => h.type === 'month' && h.from === 743) && HH.some(h => h.type === 'month' && h.to === 1094), HH.map(h => h.type[0] + h.from));
    const due = await J(`(() => { const f = S.fleet.find(x => x.planeId === '${BIG}'); return (S.charges.due || []).filter(c => c.fin === f.uid && c.day <= S.day).length; })()`);
    ok('eleven payments by the review (1 October 2032 to 1 August 2033)', due === 11, due); }
  checks.push('info ' + JSON.stringify(info));
  console.log(checks.join('\n')); console.log('ERRORS', errors.length ? errors : 'none');
  await b.close();
})();
