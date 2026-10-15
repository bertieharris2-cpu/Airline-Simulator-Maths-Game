// Run: NODE_PATH=<playwright node_modules> CODE=<day-8 save> node fleetshop.test.js   (env: OUT, SHOTS=0, GAME)
// Bertie, 13 Oct 2026: "I declined to buy a plane at the end of week one... I need the opportunity to buy a plane after
// that whenever I want. So the shop should be under the fleet panel." The pupil says Not today on day 8, opens Fleet on
// the plan page (the shop is there), flies Monday, then on Tuesday's board opens the shop. Chapter 1 is buy only (v5.2,
// D76): he compares, signs off how long the Saab would take to afford (with the division pad), then buys a second Twin
// Otter outright: the paint shop, the hangar (it rolls out nose first), back to the board. It costs nothing on the day it
// is bought and flies from the next day. Also: the Working pad on the fuel desk (4 × £1,470); the free pad in the top bar
// (36,000 ÷ 650, Make it smaller; 3,420 − 1,830); and, as from January (buy only switched off), the pay page's sums and
// the rent-or-buy box's division pad (22,000 ÷ 400 → 220 ÷ 4 = 55).
// The Working pad is the on-screen mode: this test turns working on paper off (settings.workingOnPaper = 'off'); the paper
// mode (D86, the answer box and two tries) is covered by week.test.js and record.test.js.
// Make the save: UPTO=8 SHOTS=0 SAVE=<file> node week.test.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const FILE = 'file://' + path.resolve(__dirname, '../../..', process.env.GAME || 'airline-opening-prototype.html'), OUT = (process.env.OUT || os.tmpdir() + '/airline-fleetshop') + '/'; fs.mkdirSync(OUT, { recursive:true });
const SHOTS = process.env.SHOTS !== '0', CODE = process.env.CODE || path.join(os.tmpdir(), 'airline-d8.txt');
if(!fs.existsSync(CODE)){ console.log(`No save code at ${CODE}. Make one: UPTO=8 SHOTS=0 SAVE=${CODE} node week.test.js`); process.exit(1); }
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport:{ width:1680, height:940 } })).newPage();
  const errors = [], checks = [], info = {};
  p.on('pageerror', e => errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if(m.type() === 'error') errors.push('console: ' + m.text()); }); p.on('dialog', d => d.accept());
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { const st = window.__sim.settings(); st.workingOnPaper = 'off'; st.flightSecs = 0.25; st.autoWall = false; st.opsSound = false; });
  const T = () => p.evaluate(() => window.__sim.step().t), S = () => p.evaluate(() => window.__sim.S()), E = src => p.evaluate(s => window.__sim.evalIn(s), src);
  const ok = (name, cond, x) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (x !== undefined ? ' ' + JSON.stringify(x) : ''));
  const shot = async n => { if(!SHOTS) return; await p.waitForTimeout(150); await p.screenshot({ path:OUT + n + '.png' }); };
  const vis = sel => p.evaluate(s => !!document.querySelector(s), sel);
  const txt = async sel => (await p.$eval(sel, e => e.textContent).catch(() => '')).replace(/\s+/g, ' ').trim();
  const signs = async () => { for(let g = 0; g < 14; g++){ const P = await E('soPlan()'); if(!P) break;
      if(P.rb){ await p.click(`[data-rbop="${P.rb.id}|${P.rb.op}"]`); await p.fill(`[data-rbdiv="${P.rb.id}"]`, String(P.rb.div)); await p.click(`[data-rbchk="${P.rb.id}"]`); await p.waitForTimeout(80); continue; }
      const k = P.key.replace(/"/g, '\\"'); if(P.pre){ await p.fill(`[data-sopre="${k}"]`, P.pre); await p.click(`[data-soprechk="${k}"]`); await p.waitForTimeout(60); }
      if(P.level === 'build'){ for(const x of P.seq) await p.click(['+', '−', '×', '÷'].includes(x) ? `[data-soop="${k}|${x}"]` : `[data-sofig="${k}|${x}"]`); }
      else await p.fill(`[data-soin="${k}"]`, P.answer);
      await p.click(`[data-sochk="${k}"]`); await p.waitForTimeout(80); } };
  const solveW = async () => { for(let g = 0; g < 80; g++){ if(await T() !== 'workings') break;
      if(await p.$('#wkTutNext')){ await p.click('#wkTutNext'); continue; } if(await p.$('#wkTutGo')){ await p.click('#wkTutGo'); continue; }
      if(await p.$('#cellAns')){ await p.evaluate(() => { const t = window.__sim.currentTable(), c = t.cols.find(x => x.id === t.active.col); document.getElementById('cellAns').value = String(c.values[t.active.row]); }); await p.press('#cellAns', 'Enter'); await p.waitForTimeout(60); continue; }
      if(await p.$('.sc-p1.sign #scCheck')){ const A = await E('scAnswers()'); for(const [k, v] of Object.entries(A)) await p.fill(`[data-sc="${k}"]`, v); await p.click('#scCheck'); await p.waitForTimeout(80); continue; }
      if(await p.$('#scNext:not([disabled])')){ await p.click('#scNext'); continue; }
      if(await p.$('#wkNext')){ await p.click('#wkNext'); continue; }
      if(await p.$('[data-wpick]')){ const ws = await p.$$('[data-wpick]'); await (ws[1] || ws[0]).click(); await p.waitForTimeout(80); continue; }
      if(await p.$('#nx')) break; await p.waitForTimeout(80); } };
  const builds = async () => { for(let g = 0; g < 12; g++){ const P = await E('rbPlan()'); if(!P) break;
      if(P.seq){ for(const x of P.seq) await p.click(['+', '−', '×', '÷'].includes(x) ? `[data-rbop="${P.id}|${x}"]` : `[data-rbfig="${P.id}|${x}"]`); }
      else { await p.click(`[data-rbop="${P.id}|${P.op}"]`); await p.fill(`[data-rbdiv="${P.id}"]`, String(P.div)); }
      await p.click(`[data-rbchk="${P.id}"]`); await p.waitForTimeout(80); } };

  await p.evaluate(c => { const s = window.__sim.loadCode(c); window.__sim.setS(s); window.__sim.landSave(); window.__sim.render(); }, fs.readFileSync(CODE, 'utf8').trim());
  let s = await S(); ok('the save is at day 8 with one aircraft', s.day === 8 && s.fleet.length === 1, { day:s.day, fleet:s.fleet.map(f => f.planeId) });
  ok('before day 8 the Fleet shop says when aircraft can be had', /from Monday 9 September/.test(await E("(() => { const k = S.day; S.day = 3; try{ return shopClosedWhy(); } finally { S.day = k; } })()")), await E("(() => { const k = S.day; S.day = 3; try{ return shopClosedWhy(); } finally { S.day = k; } })()"));
  let planShop = false, boardShop = false, padDone = false, rented = null, divPad = false;
  for(let i = 0; i < 400; i++){ const t = await T(); s = await S(); const day = s.day;
    if(day >= 15 && t === 'hq'){ checks.push('stopped at hq day ' + day); break; }
    if(t === 'hq'){ await p.click('#startDay'); continue; }
    if(t === 'intro'){ for(let pg = 0; pg < 3; pg++) if(await p.$('#niNext')) await p.click('#niNext'); if(await p.$('#pqIn')){ for(let k = 0; k < 3; k++){ const a = await E('practiceAnswer()'); if(!a || !(await p.$('#pqIn'))) break; await p.fill('#pqIn', a.text); await p.click('#pqCheck'); await p.waitForTimeout(1050); } }
      const n = (await p.$$('[data-ni]')).length; for(let k = 0; k < n && await p.$eval('#nx', e => e.disabled); k++) await p.click(`[data-ni="${k}"]`); await p.click('#nx'); continue; }
    if(t === 'shop2' && !boardShop && !planShop){ ok('day 8: the shop is not offered by itself (Bertie, 14 Oct: the Fleet desk only)', false, (await S()).steps.map(x => x.t)); await p.click('#skipShop'); await p.waitForTimeout(100); continue; }
    if(t === 'shop2' && boardShop && !rented){ await shot('fs-02-shop-from-board'); ok('the shop opened from the board is the comparison (one aircraft)', await vis('[data-acc="sf34"]'));
      if(await p.$('[data-actab="where"]')) await p.click('[data-actab="where"]'); await p.click('[data-acc="sf34"]'); await p.waitForTimeout(150); continue; }
    if(t === 'acquire' && await vis('.so-page')){ await signs(); await p.click('#nx'); continue; }
    if(t === 'acquire' && await vis('.bw-page')){ const F = JSON.parse(await E('JSON.stringify(UI.taF)')), all = await txt('#screen');
      ok('chapter 1 is buy only: Buy now, or wait? with no Rent or Finance', !(await vis('[data-terms]')) && !/a day to rent|Finance, down/.test(all) && /Days to wait/.test(all) && /What waiting costs/.test(all), all.slice(0, 160));
      if(await p.$('[data-pad="ta1"]')){ await p.fill('[data-pad="ta1"]', String(F.still)); await p.click('#ta1Chk'); await p.waitForTimeout(60); }
      if(await p.$('[data-pad="ta2"]') && !divPad){ divPad = true; const bt = await p.$('.ta-card .pad-btn'); ok('the days-to-wait box has a Working button', !!bt);
        if(bt){ await bt.click(); await p.waitForTimeout(80); const I = JSON.parse(await E(`JSON.stringify(padInfo('[data-pad="ta2"]'))`));
          ok(`the pad sets out ${F.still} ÷ ${F.rate} as a bus stop, with the multiples of ${F.rate} to fill and two decimal places`, I && I.op === '÷' && I.a === F.still && I.b === F.rate && I.dp === 2 && await vis('.wpop .wp-bus') && (await p.$$('.wpop [data-wpm]')).length === 8, I);
          const q = (I.ans.toFixed(I.dp)).replace('.', '').padStart(I.int + I.dp, ' '); for(let c = 0; c < q.length; c++) if(q[c] !== ' ' && !(c < I.int - 1 && q[c] === '0')) await p.fill(`.wpop [data-wpr="q"][data-wpc="${c}"]`, q[c]);
          await shot('fs-02b-division-pad'); await p.click('.wpop [data-wpuse]'); await p.waitForTimeout(60);
          ok(`Use this answer puts ${I.ans.toFixed(2)} in the box`, +(await p.$eval('[data-pad="ta2"]', e => e.value)) === +I.ans.toFixed(2), await p.$eval('[data-pad="ta2"]', e => e.value));
          await p.click('#ta2Chk'); await p.waitForTimeout(60); ok('a decimal number of days is a Query: round up', /round up/.test(await txt('.ta-card')), await txt('.ta-card .sc-msg')); } }
      if(await p.$('[data-pad="ta2"]')){ await p.fill('[data-pad="ta2"]', String(F.days)); await p.click('#ta2Chk'); await p.waitForTimeout(80); }
      ok(`the time to afford is signed: (${F.price} − ${F.cash}) ÷ ${F.rate} → ${F.days} days`, await vis('.ta-card.ok'), F); await shot('fs-03-buy-or-wait');
      const tw = await p.$('[data-bw="dhc6|buy"]:not([disabled])'); ok('the second Twin Otter can be bought now', !!tw);
      await tw.click(); await p.click('#nx'); await p.waitForTimeout(100); rented = { day:(await S()).day }; continue; }
    if(t === 'acquire'){ await shot('fs-03-pay'); ok('the pay page is Buy now, or wait? in chapter 1', false, await txt('#screen')); break; }
    if(t === 'fleetSums'){ await signs(); await p.click('#nx'); continue; }
    if(t === 'paint'){ await p.click('#roll'); continue; }
    if(t === 'reveal'){ if(!info.roll){ info.roll = await p.evaluate(() => { const el = document.querySelector('.hangar .roll'); let kf = null; for(const sh of document.styleSheets){ try{ for(const r of sh.cssRules) if(r.type === 7 && r.name === 'artRoll') kf = r.cssRules[0].style.transform; }catch(e){} } return { kf, now:el ? getComputedStyle(el).transform : null }; });
        ok('the hangar roll starts off to the right, so the nose comes out first', /translateX\(115%\)/.test(info.roll.kf || '') && !/matrix\(1, 0, 0, 1, -/.test(info.roll.now || ''), info.roll); await shot('fs-03b-hangar'); }
      if(await p.$eval('#skipReveal', e => !e.hidden).catch(() => false)) await p.click('#skipReveal'); for(let k = 0; k < 50 && await p.$eval('#nx', e => e.hidden); k++) await p.waitForTimeout(100); await p.click('#nx'); await p.waitForTimeout(100);
      if(rented && !rented.back){ rented.back = await T(); const a = await S(), f = a.fleet[a.fleet.length - 1]; rented.f = { planeId:f.planeId, costFrom:f.costFrom, flyFrom:f.flyFrom, terms:f.terms };
        const nextT = await E('(S.steps[S.si + 1] || {}).t'); ok('after the hangar, back to the board, which carries on (or the event card that stopped it)', rented.back === 'weekRun' || (rented.back === 'event' && nextT === 'weekRun'), [rented.back, nextT]);
        const d = rented.day, uidX = 'S.fleet[S.fleet.length - 1]'; rented.cost = JSON.parse(await E(`JSON.stringify([${d}, withDay(${d}, () => dayCostOf(${uidX})), withDay(${d + 1}, () => [S.day, dayCostOf(${uidX})]), withDay(${d}, () => planFlights().filter(x => x.uid === ${uidX}.uid).length), withDay(${d + 1}, () => planFlights().filter(x => x.uid === ${uidX}.uid).length), schedOf(${uidX})])`));
        ok('the second Twin Otter is bought on a run day: no flights and no costs until tomorrow', f.planeId === 'dhc6' && f.terms && f.terms.kind === 'buy' && f.costFrom === rented.day + 1 && f.flyFrom === rented.day + 1 && rented.cost[1] === 0 && rented.cost[2][1] > 0 && rented.cost[3] === 0, rented);
        ok('its chosen services fly from tomorrow', rented.cost[4] > 0, rented.cost);
        await shot('fs-04-back-on-board'); }
      continue; }
    if(t === 'event'){ await p.click('[data-o="1"]'); await p.click('#nx'); await p.waitForTimeout(80); if(await T() === 'event') await p.click('#nx'); continue; }
    if(t === 'plan'){
      if(day === 8 && !planShop){ const so = JSON.parse(await E('JSON.stringify(shopOfferedReport())')); ok('day 8: no shop step by itself: HQ goes straight to the plan, and the brief names the Fleet desk', !so.scheduled && so.brief.some(l => /On the Fleet desk from today/.test(l)), so);
        await p.click('[data-nav="fleet"]'); await p.waitForTimeout(150); await shot('fs-01-fleet-panel');
        ok('Fleet (plan page): the Add an aircraft panel lists the shop and its button is on', await vis('.fs-shop') && await p.$eval('#fleetShop', e => !e.disabled) && /Saab 340/.test(await txt('.fs-shop')), await txt('.fs-shop')); planShop = true;
        await p.click('[data-nav="plan"]'); await p.waitForTimeout(100); }
      if(await vis('#s2Edit')){ await p.click('#s2Edit'); await p.waitForTimeout(100); } if(await vis('#s2Back')){ await p.click('#s2Back'); await p.waitForTimeout(100); }
      await p.click('#nx'); continue; }
    if(t === 'workings' && await vis('.so-page')){ await signs(); await p.waitForTimeout(400); await p.click('#nx'); continue; }
    if(t === 'workings'){ await solveW(); await p.click('#nx'); continue; }
    if(t === 'fuelDesk'){ const bn = await p.$('[data-fdb="4"]:not([disabled])') || await p.$('[data-fdb="2"]:not([disabled])'); if(bn){ await bn.click(); await p.waitForTimeout(60);
        if(await p.$('#fdSignChk')){ const one = await E('(fuelBlock() * fuelOn(S.day)).toFixed(2)'), n = await E('UI.fd.selNow');
          if(!padDone && n > 1){ const btns = await p.$$('.fd-sign .pad-btn'); ok('fuel desk: a Working button beside each line of the first order', btns.length === 2, btns.length);
            await btns[1].click(); await p.waitForTimeout(80); const I = JSON.parse(await E(`JSON.stringify(padInfo('[data-fds="all"]'))`));
            ok(`the pad sets out ${n} × the cost of 1,000 L in columns`, I && I.low === n && I.parts.length === 0 && !I.pence, I);
            const digits = String(I.ans).padStart(I.W, ' ').split(''); for(let c = I.W - 1; c >= 0; c--) if(digits[c] !== ' ') await p.fill(`.wpop [data-wpr="ans"][data-wpc="${c}"]`, digits[c]);
            await shot('fs-00-pad'); await p.click('.wpop [data-wpuse]'); await p.waitForTimeout(60);
            ok('Use this answer puts the pad\'s answer in the box', (await p.$eval('[data-fds="all"]', e => e.value)) === String(I.ans) && !(await vis('.wpop')), await p.$eval('[data-fds="all"]', e => e.value));
            await p.fill('[data-fds="one"]', one); await p.click('#fdSignChk'); await p.waitForTimeout(80); ok('the first order is signed with the pad\'s answer', await vis('.fd-sign.ok'));
            info.padRecord = await E("JSON.stringify((rec().entries.filter(e => /^fo:/.test(e.key)).pop() || {}).attempts.map(a => !!a.pad))"); padDone = true; }
          else { await p.fill('[data-fds="one"]', one); if(await p.$('[data-fds="all"]')) await p.fill('[data-fds="all"]', (one * n).toFixed(2)); await p.click('#fdSignChk'); await p.waitForTimeout(60); } }
        if(await p.$('#fdBuy:not([disabled])')) await p.click('#fdBuy'); await p.waitForTimeout(80); }
      await p.click('#nx'); continue; }
    if(t === 'ready'){ await p.click('#startOps'); continue; }
    if(t === 'takeoff'){ await p.click('#toGo'); for(let k = 0; k < 200 && await p.$eval('#nx', e => e.hidden); k++) await p.waitForTimeout(100); await p.click('#nx'); continue; }
    if(t === 'fly'){ ok('during the flying the shop is closed', /flights have landed/.test(await E('shopClosedWhy()'))); for(let k = 0; k < 80 && await T() === 'fly'; k++) await p.waitForTimeout(250); continue; }
    if(t === 'sim'){ for(let k = 0; k < 200 && await T() === 'sim'; k++) await p.waitForTimeout(150); continue; }
    if(t === 'results'){ await p.click('#nx'); continue; }
    if(t === 'weekRun'){
      if(day === 9 && !boardShop){ ok("Tuesday's board has the Aircraft shop button", await vis('#boardShop:not([disabled])')); await shot('fs-01b-board'); await p.click('#boardShop'); await p.waitForTimeout(150); boardShop = true; continue; }
      const d0 = day; for(let k = 0; k < 150 && await T() === 'weekRun' && (await S()).day === d0; k++) await p.waitForTimeout(150); continue; }
    if(t === 'weekReview' && await vis('.rbw')){ await builds(); await p.click('#nx'); continue; }
    if(t === 'weekReview'){ await p.click('#nx'); continue; }
    checks.push('stopped at ' + t + ' day ' + day); await shot('fs-stop'); break; }
  s = await S(); const H = s.history || [], sf = s.fleet[1];
  ok('the airline ends week 2 with two aircraft', s.fleet.length === 2, s.fleet.map(f => f.planeId));
  if(rented && sf){ const flew = d => (s.record ? 0 : 0) + H.filter(h => h.from === d).length; info.days = H.filter(h => h.from >= 9 && h.from <= 14).map(h => ({ d:h.from, trips:h.trips, seats:h.seats, pax:h.pax, cost:Math.round(h.costs || 0), routes:Object.keys(h.routes || {}).map(k => k + ':' + (h.routes[k].trips || 0)) }));
    const d9 = H.find(h => h.from === rented.day), d10 = H.find(h => h.from === rented.day + 1); ok('the purchase day costs what the day before cost; from the next day the second Twin Otter flies and is paid for', !!(d9 && d10 && d10.seats > d9.seats && Math.round(d10.costs) > Math.round(d9.costs) && Math.round(d9.costs) === Math.round((H.find(h => h.from === rented.day - 1) || {}).costs || -1)), info.days); }
  ok('the pad\'s working is kept in the pupil record', /true/.test(info.padRecord || ''), info.padRecord);
  // the free pad, from the top bar, on any screen
  await p.click('#padFree'); await p.waitForTimeout(80); ok('the top bar\'s Working button opens the free pad', await vis('.wpop .wp-free'));
  await p.fill('[data-wfa]', '36000'); await p.selectOption('[data-wfop]', '÷'); await p.fill('[data-wfb]', '650'); await p.click('[data-wfgo]'); await p.waitForTimeout(60);
  ok('free pad: 36,000 ÷ 650 is a bus stop with the multiples of 650', await vis('.wpop .wp-bus') && (await p.$$('.wpop [data-wpm]')).length === 8 && await vis('.wpop [data-wpsmall]'));
  await p.click('.wpop [data-wpsmall]'); await p.waitForTimeout(60); await shot('fs-05-free-pad-divide');
  ok('Make it smaller: 36,000 ÷ 650 is the same as 3,600 ÷ 65', /36,000 ÷ 650 is the same as 3,600 ÷ 65/.test(await txt('.wpop')), (await txt('.wpop .wp-small')));
  await p.fill('[data-wfa]', '3420'); await p.selectOption('[data-wfop]', '−'); await p.fill('[data-wfb]', '1830'); await p.click('[data-wfgo]'); await p.waitForTimeout(60);
  ok('free pad: 3,420 − 1,830 in columns with an exchange strip above', await vis('.wpop .wp-x') && (await p.$$('.wpop [data-wpr="ans"]')).length >= 4); await shot('fs-06-free-pad-subtract');
  await p.keyboard.press('Escape'); await p.waitForTimeout(60); ok('Escape closes the free pad', !(await vis('.wpop')));
  // as from January (renting opens; buy only switched off here): the comparison's pay page shows its sums, and the rent-or-buy box has the division pad
  await p.evaluate(c => { const s = window.__sim.loadCode(c); window.__sim.setS(s); window.__sim.landSave(); window.__sim.render(); }, fs.readFileSync(CODE, 'utf8').trim());
  await E('(WBS().chapter1BuyOnly = false, true)');
  let rentShop = false;
  for(let i = 0; i < 40; i++){ const t = await T();
    if(t === 'hq'){ await p.click('#startDay'); continue; }
    if(t === 'plan' && !rentShop){ rentShop = true; await p.click('[data-nav="fleet"]'); await p.waitForTimeout(150); await p.click('#fleetShop'); await p.waitForTimeout(150); continue; }
    if(t === 'intro'){ for(let pg = 0; pg < 3; pg++) if(await p.$('#niNext')) await p.click('#niNext'); if(await p.$('#pqIn')){ for(let k = 0; k < 3; k++){ const a = await E('practiceAnswer()'); if(!a || !(await p.$('#pqIn'))) break; await p.fill('#pqIn', a.text); await p.click('#pqCheck'); await p.waitForTimeout(1050); } }
      const n = (await p.$$('[data-ni]')).length; for(let k = 0; k < n && await p.$eval('#nx', e => e.disabled); k++) await p.click(`[data-ni="${k}"]`); await p.click('#nx'); continue; }
    if(t === 'shop2'){ if(await p.$('[data-actab="where"]')) await p.click('[data-actab="where"]'); await p.click('[data-acc="sf34"]'); await p.waitForTimeout(150); continue; }
    if(t === 'acquire' && await vis('.so-page')){ await signs(); await p.click('#nx'); continue; }
    if(t === 'acquire'){ const o = JSON.parse(await E('JSON.stringify(shopOffer(planeById("sf34")))')), m = v => '£' + Math.round(v).toLocaleString('en-GB'), pay = await txt('.acq');
      ok(`the Rent column shows its sum: 30 × ${m(o.lease)} = ${m(30 * o.lease)}`, pay.includes(`30 × ${m(o.lease)} = ${m(30 * o.lease)}`) || pay.includes(`30 days × ${m(o.lease)}`), pay.slice(0, 300));
      if(o.deposit){ const fin = await p.$$eval('.acq-col', cs => (cs.find(c => /Finance/.test(c.querySelector('h2') ? c.querySelector('h2').textContent : '')) || {}).textContent || '').then(t => t.replace(/\s+/g, ' '));
        ok(`the Finance column: ${m(o.deposit)} today + 30 days × ${m(o.pay)}, and Paid in all = ${m(o.deposit)} + ${o.n} × ${m(o.pay)}`, fin.includes(`${m(o.deposit)} today + 30 days × ${m(o.pay)}`) && fin.includes(`Paid in all${m(o.deposit + o.n * o.pay)}`) && fin.includes(`${m(o.deposit)} + ${o.n} days × ${m(o.pay)}`), fin); }
      const bt = await p.$('.pad-wrap:has(#rbIn) .pad-btn'); ok('the rent-or-buy box has a Working button', !!(await p.$('#rbIn')) && !!bt);
      if(bt){ await bt.click(); await p.waitForTimeout(80); let I = JSON.parse(await E(`JSON.stringify(padInfo('#rbIn'))`)); const big = I;
        if(I.canSmall){ await p.click('.wpop [data-wpsmall]'); await p.waitForTimeout(60); I = JSON.parse(await E(`JSON.stringify(padInfo('#rbIn'))`)); }
        ok(`the rent-or-buy pad: ${big.a} ÷ ${big.b}, made smaller to ${I.a} ÷ ${I.b}`, I.op === '÷' && big.a === o.price && big.b === o.lease && (!big.canSmall || (I.small && I.a * Math.pow(10, 0) < big.a)), { big, I });
        const q = (I.dp ? I.ans.toFixed(I.dp).replace('.', '') : String(I.ans)).padStart(I.int + I.dp, ' '); for(let c = 0; c < q.length; c++) if(q[c] !== ' ' && !(c < I.int - 1 && q[c] === '0' && !/[1-9]/.test(q.slice(0, c)))) await p.fill(`.wpop [data-wpr="q"][data-wpc="${c}"]`, q[c]);
        await shot('fs-07-rent-or-buy-pad'); await p.click('.wpop [data-wpuse]'); await p.waitForTimeout(60); const v = await p.$eval('#rbIn', e => e.value);
        await p.click('#rbChk'); await p.waitForTimeout(80); ok(`Use this answer fills the box (${v}) and the rent-or-buy sum checks`, Math.abs(+v - o.price / o.lease) < 0.06 && !(await vis('#rbChk')), v); }
      await shot('fs-08-pay-sums'); break; }
    await p.click('#nx').catch(() => {}); await p.waitForTimeout(80); }
  checks.push('end at ' + await T() + ' day ' + s.day + ' cash ' + Math.round(s.cash));
  checks.push('info ' + JSON.stringify(info));
  console.log(checks.join('\n')); console.log('ERRORS', errors.length ? errors : 'none');
  await b.close();
})();
