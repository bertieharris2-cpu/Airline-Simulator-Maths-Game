// Run: NODE_PATH=<playwright node_modules> node week.test.js   (env: UPTO day, SHOTS=0, OUT, W, H)
// Workbook v4.4: chapter 1 a week at a time. Launch Day plan + sums, the week on the board, the Sunday review, then the next Monday.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), FILE = 'file://' + path.resolve(__dirname, '../../../airline-opening-prototype.html'), OUT = (process.env.OUT || require('os').tmpdir() + '/airline-week') + '/'; fs.mkdirSync(OUT, { recursive:true });
const W = +(process.env.W || 1366), H = +(process.env.H || 768), SHOTS = process.env.SHOTS !== '0', UPTO = +(process.env.UPTO || 15);
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport:{ width:W, height:H } })).newPage();
  const errors = [], checks = [], overflow = [], sums = {};
  p.on('pageerror', e => errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if(m.type() === 'error') errors.push('console: ' + m.text()); }); p.on('dialog', d => d.accept());
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { const st = window.__sim.settings(); st.flightSecs = 0.25; st.autoWall = false; st.opsSound = false; });
  const T = () => p.evaluate(() => window.__sim.step().t), S = () => p.evaluate(() => window.__sim.S());
  const ok = (name, cond, info) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (info !== undefined ? ' ' + JSON.stringify(info) : ''));
  const shot = async n => { if(!SHOTS) return; await p.waitForTimeout(150); await p.screenshot({ path:OUT + n + '.png' }); };
  const fits = async tag => { const r = await p.evaluate(() => { const bad = []; document.querySelectorAll('.tf-main,.tf-body,#screen,.ws-rail,.sheet1,.wk').forEach(e => { if(e.scrollHeight > e.clientHeight + 2) bad.push((e.className || e.id).split(' ')[0] + ' ' + e.scrollHeight + '>' + e.clientHeight); }); return bad; }); if(r.length) overflow.push(tag + ': ' + r.join(', ')); };
  const vis = sel => p.evaluate(s => !!document.querySelector(s), sel);
  const setPlan = (fleet, prices) => p.evaluate(([fleet, prices]) => { const S = window.__sim.S(); fleet.forEach((x, j) => { const f = S.fleet[j]; if(!f) return; f.schedule = x.sched.slice(); f.route = x.sched[0] || null; f.deps = x.deps.slice(); if(j === 0) S.deps = x.deps.slice(); }); Object.assign(S.prices, prices); window.__sim.refreshPlan(); window.__sim.render(); }, [fleet, prices]);
  const practice = async () => { for(let i = 0; i < 3; i++){ const a = await p.evaluate(() => window.__sim.practiceAnswer()); if(!a || !(await p.$('#pqIn'))) break; await p.fill('#pqIn', a.text); await p.click('#pqCheck'); await p.waitForTimeout(1050); } };
  const solve = async tag => { const seen = []; for(let i = 0; i < 30; i++){ const c = await p.$('[data-cell]'); if(!c) break; const id = await c.getAttribute('data-cell'); seen.push(id); await c.click();
      await p.evaluate(() => { const t = window.__sim.currentTable(), c = t.cols.find(x => x.id === t.active.col); document.getElementById('cellAns').value = String(c.values[t.active.row]); }); await p.press('#cellAns', 'Enter'); await p.waitForTimeout(60); } return seen; };
  const solveW = async tag => { const seen = []; for(let g = 0; g < 80; g++){ if(await T() !== 'workings') break;
      if(await p.$('#wkTutNext')){ await p.click('#wkTutNext'); continue; } if(await p.$('#wkTutGo')){ seen.push('tutorial'); await p.click('#wkTutGo'); continue; }
      if(await p.$('#cellAns')){ const id = await p.evaluate(() => { const t = window.__sim.currentTable(); return t.id + ':' + t.active.col + '|' + t.active.row; }); seen.push(id);
        await p.evaluate(() => { const t = window.__sim.currentTable(), c = t.cols.find(x => x.id === t.active.col); document.getElementById('cellAns').value = String(c.values[t.active.row]); }); await p.press('#cellAns', 'Enter'); await p.waitForTimeout(80); continue; }
      if(await p.$('.sc-p1.sign #scCheck')){   // a fuel sign-off on the service card: the first is answered wrong once (Query), then right (Checked)
        const key = await p.evaluate(() => window.__sim.evalIn('(UI.sc.F && UI.sc.F.p.id + "|" + UI.sc.F.r.id) || ""')), A = await p.evaluate(() => window.__sim.evalIn('scAnswers()'));
        if(!seen.some(x => /^card/.test(x))){ await shot('card-' + tag.replace(/\s/g, '')); await p.fill('[data-sc="r0"]', '1'); await p.click('#scCheck'); await p.waitForTimeout(60);
          ok('card: a wrong line is stamped Query and highlighted', await vis('.stamp.q') && await vis('.sc-row.qy'), await p.$eval('.sc-msg', e => e.textContent).catch(() => '')); }
        for(const [k, v] of Object.entries(A)) await p.fill(`[data-sc="${k}"]`, v);
        await p.click('#scCheck'); await p.waitForTimeout(80); seen.push('card:' + key + '=' + A.tot);
        if(seen.filter(x => /^card/.test(x)).length === 1){ ok('card: a right answer is stamped Checked with the airline\'s initials', await vis('.stamp.ok'), await p.$eval('.stamp', e => e.textContent).catch(() => '')); await shot('card-done-' + tag.replace(/\s/g, '')); }
        if(await p.$('#scNext:not([disabled])')) await p.click('#scNext'); continue; }
      if(await p.$('#scNext:not([disabled])')){ await p.click('#scNext'); continue; }
      if(await p.$('#wkNext')){ await p.click('#wkNext'); continue; }
      if(await p.$('[data-wpick]')){ const ws = await p.$$('[data-wpick]'); seen.push('pick' + ws.length); await (ws[1] || ws[0]).click(); await p.waitForTimeout(80); continue; }
      if(await p.$('#pqIn')){ await practice(); seen.push('practice'); continue; }
      if(await p.$('#nx')) break; await p.waitForTimeout(80); }
    sums[tag] = seen; return seen; };
  const identity = async () => { if(await T() === 'code'){ await p.click('#nx'); } if(await T() === 'logo'){ await p.click('#nx'); }
    if(await T() === 'paint'){ await p.click('[data-ptab="name"]'); await p.fill('#regIn', 'DRAG'); await p.click('#roll'); }
    if(await T() === 'reveal'){ await p.click('#skipReveal'); await p.waitForTimeout(150); await p.click('#nx'); } if(await T() === 'cert') await p.click('#nx'); };
  // setup
  await p.click('#start'); await p.fill('#nm', 'Dragon Air'); await p.click('#nx'); await identity();
  if(await T() === 'boot') await p.click('#enterHq'); if(await T() === 'chapter') await p.click('#chGo');
  ok('launch day: the intro explains the job and the starting position (no market gate)', await T() === 'brief1' && /Your first week in charge/.test(await p.textContent('#screen')) && (await p.$$('.br1-c')).length === 4, await T());
  await fits('brief'); await shot('d1-brief'); await p.click('#nx');
  ok('launch day: the planner follows the intro', await T() === 'plan', await T());
  // the chapter
  let lastDay = 0;
  for(let i = 0; i < 400; i++){ const t = await T(), s = await S(), day = s.day;
    if(day >= UPTO && t === 'hq') break; if(t === 'protoEnd' || t === 'chapterReview'){ checks.push('reached ' + t + ' day ' + day); break; }
    if(t === 'hq'){ await fits('hq ' + day); if(day !== lastDay) await shot(`d${day}-hq`); lastDay = day; await p.click('#startDay'); continue; }
    if(t === 'intro'){ for(let pg = 0; pg < 2; pg++) if(await p.$('#niNext')) await p.click('#niNext'); if(await p.$('#pqIn')) await practice(); const n = (await p.$$('[data-ni]')).length; for(let k = 0; k < n && await p.$eval('#nx', e => e.disabled); k++) await p.click(`[data-ni="${k}"]`); await p.click('#nx'); continue; }
    if(t === 'shop2' && await vis('.acx')){ await fits('compare ' + day); await shot(`d${day}-compare-aircraft`); const txt = (await p.textContent('#screen')).replace(/\s+/g, ' ');
      ok(`day ${day}: the second-aircraft comparison: three columns, nine rows each, the capacity problem first`, (await p.$$('.acx-col')).length === 3 && (await p.$$('.acx-col:first-child .acx-r')).length === 9 && /We have a capacity problem/.test(txt), (await p.$$('.acx-col:first-child .acx-r')).length);
      ok(`day ${day}: nothing is labelled best; the descriptors are derived`, !/\bbest\b/i.test(await p.$$eval('.acx-tag', es => es.map(e => e.textContent).join(' '))) && /FITS TODAY'S MARKET/.test(txt) && /LOW COMMITMENT/.test(txt) && /A BET ON/.test(txt), await p.$$eval('.acx-tag', es => es.map(e => e.textContent)));
      ok(`day ${day}: the cash bar shows a reserve breach in red when buying outright is not possible`, await vis('.acx-bar i.x'));
      ok(`day ${day}: Where could it fly lists today's route and the routes opening in weeks 3 and 4`, (await p.$$('.acx-wt tbody tr')).length === 4, await p.$$eval('.acx-wt tbody td:first-child b', es => es.map(e => e.textContent)));
      await p.click('[data-achl="profit"]'); ok(`day ${day}: Compare one row highlights a row across the columns`, await vis('.acx[data-hl="profit"]'));
      await p.click('[data-actab="grow"]'); await p.waitForTimeout(100); await p.$eval('#acGrowIn', e => { e.value = '2'; e.dispatchEvent(new Event('change')); }); await p.waitForTimeout(200);
      ok(`day ${day}: If Dublin grows recomputes the three planes at ×2.0`, (await p.$$('.acx-gb')).length === 3 && /×2\.0/.test(await p.textContent('.acx-grow')), await p.$eval('.acx-grow', e => e.textContent.replace(/\s+/g, ' ').slice(0, 200)));
      await shot(`d${day}-compare-grow`); await p.click('[data-actab="where"]'); await p.click('[data-acc="sf34"]'); await p.waitForTimeout(150); continue; }
    if(t === 'acquire' && await vis('.acq')){ await shot(`d${day}-pay`); const buy = await p.$eval('[data-terms="buy"]', e => e.disabled), cash = (await S()).cash, reserve = await p.evaluate(() => window.__sim.evalIn('WORLD.cashReserve || 0'));
      ok(`day ${day}: How should we get it: Buy is greyed with the shortfall when cash is below price + reserve`, buy === (cash < 22000 + reserve) && /still to save/.test(await p.textContent('.acq-cols')), await p.$eval('.acq-n', e => e.textContent).catch(() => ''));
      if(await p.$('#rbIn')){ await p.fill('#rbIn', '50'); await p.click('#rbChk'); await p.waitForTimeout(60); ok(`day ${day}: the rent-or-buy sign-off queries a wrong answer`, await vis('.acq-rb .stamp.q'));
        await p.fill('#rbIn', '55'); await p.click('#rbChk'); await p.waitForTimeout(60); ok(`day ${day}: 22,000 ÷ 400 = 55 days is Checked`, await vis('.acq-rb .stamp.ok')); }
      await shot(`d${day}-pay-signed`); await p.click('[data-terms="lease"]'); await p.click('#nx'); await p.waitForTimeout(100);
      ok(`day ${day}: the Saab starts on Dublin as compared (two services at £80)`, await p.evaluate(() => JSON.stringify(window.__sim.currentPlan().fleet.map(x => x.sched))) === '[["par","par"],["dub","dub"]]', await p.evaluate(() => JSON.stringify(window.__sim.currentPlan().fleet.map(x => x.sched)))); continue; }
    if(t === 'shop2'){ await fits('shop ' + day); await shot(`d${day}-shop`); const want = day === 8 ? 'sf34' : day === 22 ? 'at72' : null, card = want && await p.$(`[data-pick="${want}"]`); if(card){ await card.click(); await p.click('#nx'); } else await p.click('#skipShop'); continue; }
    if(t === 'fleetSums'){ const typed = await solve('fleetSums'); sums['fleetSums ' + day] = typed; if(await p.$('#calcDone')) await p.click('#calcDone'); await p.click('#nx'); continue; }
    if(t === 'acquire'){ await shot(`d${day}-acquire`); const buy = await p.$eval('[data-terms="buy"]', e => e.disabled), txt = await p.$eval('[data-terms="buy"]', e => e.textContent.replace(/\s+/g, ' ')), cash = (await S()).cash, price = +((/£([\d,]+)/.exec(txt) || [])[1] || '0').replace(/,/g, ''), reserve = await p.evaluate(() => window.__sim.evalIn('WORLD.cashReserve || 0'));
      ok(`day ${day}: Buy is greyed until affordable (cash ${cash} against ${price} + the ${reserve} reserve)`, buy === (cash < price + reserve), txt); await p.click('[data-terms="lease"]'); await p.click('#nx'); continue; }
    if(t === 'event'){ await fits('event ' + day); await shot(`d${day}-event`); await p.click(`[data-o="${day === 5 ? 2 : 1}"]`); await p.click('#nx'); await p.waitForTimeout(80); if(await T() === 'event') await p.click('#nx'); continue; }
    if(t === 'plan'){ await fits('plan ' + day);
      // the plans from Balance Report v4.4: week 1 the mixed day; week 2 the Saab on Dublin; week 3 the Saab to Amsterdam; week 4 the ATR to Madrid
      if(s.phase === 'setup'){
        // the timeline is the schedule editor: add, select, move with the buttons, the keyboard and a drag, swap the route, remove
        await p.click('[data-pe="0|add|par|0|0"]'); await p.click('[data-pe="0|add|dub|0|0"]'); await p.click('[data-pe="0|add|par|0|0"]');
        ok('launch: three blocks on the timeline, both markets shown', (await p.$$('.ad-blk')).length === 3 && (await p.$$('.mk')).length === 2, [(await p.$$('.ad-blk')).length, (await p.$$('.mk')).length]);
        const dep = async k => +(await p.$eval(`[data-tl="0|0|${k}"]`, e => e.dataset.dep));
        await p.click('[data-tl="0|0|2"]'); ok('launch: a pressed block is selected and gets its controls', await vis('.ad-blk.on') && await vis('[data-tlm="0|0|2|20"]'));
        const d2 = await dep(2); await p.click('[data-tlm="0|0|2|20"]'); ok('launch: Later moves the service 20 minutes', await dep(2) === d2 + 20, [d2, await dep(2)]);
        await p.focus('[data-tl="0|0|2"]'); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(60); ok('launch: the arrow key moves it 10 minutes the other way', await dep(2) === d2 + 10, [d2, await dep(2)]);
        const d1 = await dep(1), bb = await (await p.$('[data-tl="0|0|1"]')).boundingBox(), lane = await (await p.$('.ad-lane')).boundingBox();
        await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(bb.x + bb.width / 2 + lane.width * 0.08, bb.y + bb.height / 2, { steps:8 }); await p.mouse.up(); await p.waitForTimeout(150);
        ok('launch: a drag moves the service, snapped to 10 minutes', await dep(1) !== d1 && (await dep(1)) % 10 === 0, [d1, await dep(1)]);
        await p.click('[data-tl="0|0|1"]'); await p.click('[data-tlsw="0|0|1"]'); ok('launch: Swap route changes the service', (await S()).fleet[0].schedule[1] === 'par', (await S()).fleet[0].schedule);
        await p.click('[data-tl="0|0|1"]'); await p.click('[data-tlrm="0|0|1"]'); ok('launch: Remove takes the block off', (await p.$$('.ad-blk')).length === 2, (await p.$$('.ad-blk')).length);
        ok('launch: every fare chip on both markets is the pupil\'s to press (none locked)', (await p.$$('.mk .fch[disabled]')).length === 0 && (await p.$$('.mk .fch:not([disabled])')).length >= 10, [(await p.$$('.mk .fch[disabled]')).length, (await p.$$('.mk .fch:not([disabled])')).length]);
        await p.click('[data-pe="0|fareTo|dub|100"]'); await p.waitForTimeout(60); ok('launch: a fare chip changes the fare', (await S()).prices.dub === 100, (await S()).prices); await p.click('[data-pe="0|fareTo|dub|80"]'); await p.waitForTimeout(60);
        ok('launch: Plan Impact offers ƒ on the figures the sums ask for', (await p.$$('[data-sum]')).length >= 4, await p.$$eval('[data-sum]', es => es.map(e => e.getAttribute('data-sum'))));
        ok('launch: the fuel strip is one line: week 1 buys fuel as it is used, free on the launch days', /Fuel is bought as it is used.*free Mon–Tue/.test(await p.$eval('.fstrip', e => e.textContent.replace(/\s+/g, ' ')).catch(() => '')), await p.$eval('.fstrip', e => e.textContent.replace(/\s+/g, ' ')).catch(() => ''));
        await setPlan([{ sched:['par', 'dub', 'par'], deps:[420, 640, 1080] }], { par:90, dub:90 });
        ok('launch: both routes on the plan page', await vis('[data-pe^="0|add|dub|0"]') && await vis('[data-pe^="0|add|par|0"]')); }
      if(day === 8 && s.fleet.length > 1){ await setPlan([{ sched:['par', 'par'], deps:[420, 1080] }, { sched:['dub', 'dub'], deps:[480, 960] }], { par:90, dub:80 });
        ok('day 8: two aircraft, two lanes on the timeline', (await p.$$('.ad-lane')).length === 2 && (await p.$$('.ad-blk')).length === 4);
        if(await p.$('#worldOpen')){ await p.click('#worldOpen'); await p.waitForTimeout(150); const wt = (await p.textContent('#screen')).replace(/\s+/g, ' ');
          ok('day 8: the World report shows the fuel band, Red Kite\'s fares, a demand graph and the headlines', await vis('.wr') && /£1\.60–£1\.76/.test(wt) && (await p.$$('.wr-rk tbody tr')).length >= 2 && (await p.$$('.wr-b')).length >= 3 && /Headlines/.test(wt), wt.slice(0, 160));
          await shot(`d${day}-world`); await p.click('#wrClose'); await p.waitForTimeout(100); }
        if(await p.$('#ideaOpen')){ ok('day 8: the planner offers Try different options', /Try different options/.test(await p.textContent('#ideaOpen'))); await p.click('#ideaOpen'); await p.waitForTimeout(150);
          ok('day 8: the Operations Model asks for the Build step first', await vis('.om-build') && !(await vis('.om-rt'))); await shot(`d${day}-model-build`);
          for(const x of ['Passengers', '+', 'Fare']) await p.click(`[data-omp="${x}"]`);
          ok('day 8: a wrong formula shows an error in the cell', /#ERROR/.test(await p.textContent('.om-build')), await p.$eval('.om-e', e => e.textContent).catch(() => ''));
          for(const x of ['Passengers', '×', 'Fare', 'Revenue', '−', 'Costs']) await p.click(`[data-omp="${x}"]`); await p.waitForTimeout(150);
          ok('day 8: with both formulas built the model projects the week', await vis('.om-rt') && !!((await S()).analyst || {}).built, (await S()).analyst);
          await p.click('[data-mo="fare|dub|1"]'); await p.waitForTimeout(150);
          ok('day 8: the test plan changes, What changed names it and the results show the change', /Dublin fare £80 → £90/.test(await p.textContent('.om-what')) && (await p.$$('.om-rt td.good, .om-rt td.bad')).length >= 2, await p.$eval('.om-what', e => e.textContent.replace(/\s+/g, ' ')).catch(() => ''));
          await p.click('#omSave'); await p.waitForTimeout(80); ok('day 8: the test plan can be saved', (await p.$$('.om-sv')).length === 1); await shot(`d${day}-model`);
          await p.click('#omReset'); await p.click('#omClose'); await p.waitForTimeout(100); ok('day 8: Back returns to the planner', await vis('.ad'), await T()); }
        ok('day 8: the fuel strip shows the stored fuel and the week it covers, with the fuel desk a press away', /L stored · \d+% of this week covered/.test(await p.$eval('.fstrip', e => e.textContent.replace(/\s+/g, ' ')).catch(() => '')) && await vis('.fstrip [data-nav="fuel"]'), await p.$eval('.fstrip', e => e.textContent.replace(/\s+/g, ' ')).catch(() => ''));
        await p.click('[data-tl="0|0|0"]'); const sb = await p.$('[data-svccard="0|0|0"]');
        if(sb){ await sb.click(); await p.waitForTimeout(120); const tot = await p.$eval('.sc-total .sc-v', e => e.textContent).catch(() => '');
          ok('day 8: Service costs opens the performance card with the model\'s figures (Twin Otter Paris, 120 L × £1.47)', await vis('.sc-banner') && !(await vis('.sc-p1.sign')) && tot === '£176.40', tot); await shot(`d${day}-svccard`);
          await p.click('[data-scm="scale"]'); await p.waitForTimeout(60); ok('day 8: the card\'s method tabs change the working (scale from 100 L)', /100 L costs/.test(await p.textContent('.sc-p1')));
          await p.click('#scBack'); await p.waitForTimeout(100); ok('day 8: Back to plan returns to the planner', await vis('.ad'), await T()); }
        if(await p.$('#mapOpen')){ await p.click('#mapOpen'); ok('day 8: the network map is a button away, with the destinations, the rival\'s fares and the demand', await vis('#hqMap') && (await p.$$('.net-dest tbody tr')).length >= 2); await shot(`d${day}-map`); await p.click('[data-nav="plan"]'); await p.waitForTimeout(60); } }
      if(day === 29) ok('day 29: the storage upgrade: the tank holds 20,000 L from today', await p.evaluate(() => window.__sim.evalIn('tankCapacity()')) === 20000, await p.evaluate(() => window.__sim.evalIn('tankCapacity()')));
      if(day === 15 && s.fleet.length > 1) await setPlan([{ sched:['par', 'par'], deps:[420, 1080] }, { sched:['ams', 'ams'], deps:[480, 960] }], { par:90, ams:90 });
      if(day === 22 && s.fleet.length > 2) await setPlan([{ sched:['par', 'par'], deps:[420, 1080] }, { sched:['ams', 'ams'], deps:[480, 960] }, { sched:['mad'], deps:[540] }], { par:90, ams:90, mad:170 });
      if(day >= 3){ const q = await p.$('.fw-quick [data-fo]:nth-child(2)'); if(q) await q.click(); }
      await shot(`d${day}-plan`); ok(`plan ${day}: continue enabled`, await p.$eval('#nx', e => !e.disabled), await p.evaluate(() => window.__sim.currentPlan().fleet.map(x => x.sched.join('/') + ' ' + (x.deps || []).join(',')))); await p.click('#nx'); continue; }
    if(t === 'workings'){ await fits('workings ' + day); const typed = await solveW(`work ${day}`); await shot(`d${day}-workings`);
      if(s.phase === 'setup') ok('launch: tickets ×3 then the fare, the other route\'s tickets, a fuel sign-off for each route (Paris 120 L, Dublin 180 L at £1.30), profit, snacks ×2', typed.filter(x => /\|tk_par/.test(x)).length === 3 && typed.some(x => /\|tk_dub/.test(x)) && typed.filter(x => /\|profit/.test(x)).length === 1 && typed.filter(x => /\|snack$/.test(x)).length === 2 && !typed.includes('tutorial') && typed.includes('card:dhc6|par=156.00') && typed.includes('card:dhc6|dub=234.00'), typed);
      if(s.phase === 'setup') ok('launch: the sums were done in the dock beside the plan', await vis('.dock-sum') && await vis('.ad'));
      ok(`work ${day}: back enabled`, !!(await p.$('#nx')) && await p.$eval('#nx', e => !e.disabled)); await p.click('#nx'); continue; }
    if(t === 'fuelDesk'){ await fits('fuelDesk ' + day); await shot(`d${day}-fueldesk`); const txt = (await p.textContent('#screen')).replace(/\s+/g, ' ');
      if(day === 8){ ok('day 8: the fuel desk shows next week\'s band £1.60–£1.76 at high confidence, and today\'s £1.47', /£1\.60 – £1\.76/.test(txt) && /High/.test(txt) && /£1\.47 \/ L/.test(txt), (txt.match(/Next week's forecast.{0,60}/) || [''])[0]);
        ok('day 8: the scenario table has a row for each point of the band', (await p.$$('.fd-t tbody tr')).length >= 4, (await p.$$('.fd-t tbody tr')).length);
        ok('day 8: the desk says what an empty tank costs (the day\'s price + 10p)', /day's price \+ 10p/.test(txt)); }
      const n = day === 8 ? 3 : 2, bn = await p.$(`[data-fdb="${n}"]:not([disabled])`);
      if(bn){ await bn.click(); await p.waitForTimeout(60);
        if(await p.$('#fdSignChk')){ const one = await p.evaluate(() => window.__sim.evalIn('(fuelBlock() * fuelOn(S.day)).toFixed(2)'));
          await p.fill('[data-fds="one"]', '1'); await p.click('#fdSignChk'); await p.waitForTimeout(60); ok(`day ${day}: the first fuel order is a sign-off; a wrong line is stamped Query`, await vis('.fd-sign .stamp.q'));
          await p.fill('[data-fds="one"]', one); if(await p.$('[data-fds="all"]')) await p.fill('[data-fds="all"]', (one * n).toFixed(2)); await p.click('#fdSignChk'); await p.waitForTimeout(60);
          ok(`day ${day}: the order is Checked, then Confirm opens`, await vis('.fd-sign .stamp.ok') && await p.$eval('#fdBuy', e => !e.disabled)); await shot(`d${day}-fueldesk-signed`); }
        const f0 = (await S()).fuel; await p.click('#fdBuy'); await p.waitForTimeout(80); const f1 = (await S()).fuel;
        ok(`day ${day}: the order of ${n} × 1,000 L goes into the tank`, Math.round(f1 - f0) === n * 1000, [f0, f1]); await shot(`d${day}-fueldesk-bought`); }
      await p.click('#nx'); continue; }
    if(t === 'rop'){ await fits('rop'); await shot(`d${day}-rop`); ok('day 28: the regular plan says the tank carries on', /The tank carries on/.test(await p.textContent('#screen'))); await p.click('#ropGo'); continue; }
    if(t === 'milestone'){ await shot(`d${day}-milestone`); await p.click('#msGo'); continue; }
    if(t === 'review'){ await fits('review ' + day); await shot(`d${day}-wkreview`); sums['wreview ' + day] = await solve('wreview'); if(await p.$('#calcDone')) await p.click('#calcDone'); await p.click('#nx'); continue; }
    if(t === 'sim'){ await shot(`d${day}-sim`); for(let k = 0; k < 160 && await T() === 'sim'; k++) await p.waitForTimeout(250); continue; }
    if(t === 'ready'){ await fits('ready ' + day); const en = await p.$eval('#startOps', e => !e.disabled); ok('ready ' + day, en, await p.textContent('.opplan')); if(!en){ await shot(`d${day}-ready-stuck`); break; } await p.click('#startOps'); continue; }
    if(t === 'takeoff'){ await p.click('#toGo'); for(let k = 0; k < 200 && await p.$eval('#nx', e => e.hidden); k++) await p.waitForTimeout(100); await p.click('#nx'); continue; }
    if(t === 'fly'){ for(let k = 0; k < 80 && await T() === 'fly'; k++) await p.waitForTimeout(250); continue; }
    if(t === 'results'){ await shot(`d${day}-results`); await p.click('#nx'); continue; }
    if(t === 'weekRun'){ const d0 = day; for(let k = 0; k < 120 && await T() === 'weekRun' && (await S()).day === d0; k++) await p.waitForTimeout(150); if(d0 !== lastDay){ await shot(`d${d0}-board`); lastDay = d0; } continue; }
    if(t === 'weekReview'){ await fits('review ' + day); await shot(`d${day}-review`); const typed = await solve('review'); sums['review ' + day] = typed; ok(`review ${day}: the week total and projected − actual are typed`, typed.some(x => /total/.test(x)) && typed.some(x => /better|worse/.test(x)), typed);
      ok(`review ${day}: the missed-profit line`, await vis('.wk-missed'), await p.$eval('.wk-missed', e => e.textContent.replace(/\s+/g, ' ')).catch(() => ''));
      const M = (await S()).wk.missed; ok(`review ${day}: the best plan earns at least what the pupil's plan did`, M && M.best >= M.yours - 1, M && [M.yours, M.best, M.bestPlan]);
      if(day >= 15) ok(`review ${day}: use-it-or-lose-it names a route with no service (Dublin)`, /Dublin: \d+ → \d+/.test(await p.$eval('.wk-neglect', e => e.textContent).catch(() => '')), await p.$eval('.wk-neglect', e => e.textContent.replace(/\s+/g, ' ')).catch(() => ''));
      await shot(`d${day}-review-done`); await p.click('#nx'); continue; }
    if(t === 'paint'){ await shot(`d${day}-paint`); const a = await S(); ok(`paint ${day}: the new plane has its own registration`, new Set(a.fleet.map(f => f.registration)).size === a.fleet.length, a.fleet.map(f => f.registration)); await p.click('#roll'); continue; } if(t === 'reveal'){ await p.click('#skipReveal'); for(let k = 0; k < 50 && await p.$eval('#nx', e => e.hidden); k++) await p.waitForTimeout(100); await p.click('#nx'); continue; }
    checks.push('stopped at ' + t + ' day ' + day); await shot('stop'); break; }
  const s = await S(); checks.push('end at ' + await T() + ' day ' + s.day + ' cash ' + Math.round(s.cash));
  if(s.day >= 28){ const calc = (s.handSumLog || []).filter(h => h.day <= 28).flatMap(h => h.tools).filter(t => !/^Practice/.test(t));
    const count = calc.reduce((n, t) => { const m = /^Ticket revenue \(([^)]*)\)/.exec(t); return n + (m ? m[1].split(',').length : 1); }, 0) + 2;   // launch day's three fares count as three
    ok('weeks 1–4: about 26 Calculate steps with practice off (Fable\'s target; the launch tickets at three fares count three)', count >= 22 && count <= 34, { count, calc }); }
  checks.push('info sums ' + JSON.stringify(sums)); checks.push('info handSumLog ' + JSON.stringify(s.handSumLog)); checks.push('info ledger profit ' + JSON.stringify((s.ledger.rev || []).map((v, i) => v == null ? null : Math.round(v - s.ledger.cost[i]))));
  console.log(checks.join('\n')); console.log('OVERFLOW', overflow.length ? overflow : 'none'); console.log('ERRORS', errors.length ? errors : 'none');
  await b.close();
})();
