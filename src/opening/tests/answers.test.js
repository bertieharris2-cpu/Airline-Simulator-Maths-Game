// Run: NODE_PATH=<playwright node_modules> node answers.test.js   (env: W, H, HOME_APT, MKT, POL, UPTO, SHOTS=0, OUT)
// The opening, one new idea a day: Launch Day → Day 4 → Regular Operating Plan → Week 1 (and on, with UPTO).
const { chromium } = require('playwright');
const path = require('path'), FILE = 'file://' + path.resolve(__dirname, '../../../airline-opening-prototype.html'), OUT = (process.env.OUT || require('os').tmpdir() + '/airline-shots') + '/'; require('fs').mkdirSync(OUT, { recursive:true });
const W = +(process.env.W || 1366), H = +(process.env.H || 768), HOME = process.env.HOME_APT || 'lhr', MK = process.env.MKT || 'par', OTHER = MK === 'par' ? 'dub' : 'par', SHOTS = process.env.SHOTS !== '0', UPTO = +(process.env.UPTO || 8), POL = process.env.POL || 'typical';
const TAG = `${HOME}-${MK}-${W}`;
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport:{ width:W, height:H } })).newPage();
  const errors = [], overflow = [], checks = [];
  p.on('pageerror', e => errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if(m.type() === 'error') errors.push('console: ' + m.text()); }); p.on('dialog', d => d.accept());
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { window.__sim.settings().flightSecs = 1; });
  const T = () => p.evaluate(() => window.__sim.step().t), S = () => p.evaluate(() => window.__sim.S());
  const ok = (name, cond, info) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (info !== undefined ? ' ' + JSON.stringify(info) : ''));
  const shot = async n => { if(!SHOTS) return; await p.waitForTimeout(200); await p.screenshot({ path:OUT + n + '-' + TAG + '.png' }); };
  const fits = async tag => { const r = await p.evaluate(() => { const bad = []; document.querySelectorAll('.tf-main,.tf-body,#screen,.hp .pb,.ws-rail,.opts-wrap,.dk-b,.actbar,.sheet1').forEach(e => { if(e.scrollHeight > e.clientHeight + 2) bad.push((e.className || e.id).split(' ')[0] + ' ' + e.scrollHeight + '>' + e.clientHeight); if(e.scrollWidth > e.clientWidth + 2) bad.push((e.className || e.id).split(' ')[0] + ' wide ' + e.scrollWidth + '>' + e.clientWidth); }); if(document.scrollingElement.scrollWidth > innerWidth + 1) bad.push('hscroll'); if(document.scrollingElement.scrollHeight > innerHeight + 1) bad.push('vscroll'); return bad; }); if(r.length) overflow.push(tag + ': ' + r.join(', ')); };
  const PAIR = { profit:['rev', 'cost', '−'], tk1:['pax1', 'fare1', '×'], tk2:['pax2', 'fare2', '×'], snack:['buyers', 'snackP', '×'], fuel:['fuelL', 'ppl', '×'], empty:['seats', 'flown', '−'], wproj:['profitDay', 'days', '×'], profitDay:['revDay', 'costDay', '−'] };
  const typedLog = {};
  const solve = async tag => { const seen = [];
    for(let i = 0; i < 20; i++){ const c = await p.$('[data-cell]'); if(!c) break; const id = await c.getAttribute('data-cell'); seen.push(id); await c.click();
      if(await p.$('[data-pk]')){ const row = id.split('|')[1], pr = PAIR[row] || (row.startsWith('tk_') ? ['pax_' + row.slice(3), 'fare_' + row.slice(3), '×'] : null); seen[seen.length - 1] += ':build'; if(!pr){ ok('build pair known for ' + row, false); break; }
        for(const k of pr.slice(0, 2)) await p.click(`[data-pk="${k}"]`); await p.click(`[data-op="${pr[2]}"]`); await p.click('#trySum'); await p.waitForTimeout(100); continue; }
      await p.evaluate(() => { const t = window.__sim.currentTable(), c = t.cols.find(x => x.id === t.active.col); document.getElementById('cellAns').value = String(c.values[t.active.row]); }); await p.press('#cellAns', 'Enter'); }
    typedLog[tag] = seen; return seen; };
  const vis = sel => p.evaluate(s => !!document.querySelector(s), sel);
  const practice = async () => { for(let i = 0; i < 3; i++){ const a = await p.evaluate(() => window.__sim.practiceAnswer()); if(!a || !(await p.$('#pqIn'))) break; await p.fill('#pqIn', a.text); await p.click('#pqCheck'); await p.waitForTimeout(1050); } };
  const fuelBill = async () => { if(await p.$('#fbIn')){ const v = await p.evaluate(() => String(window.__sim.S().rnd.fuelOrder.total)); await p.fill('#fbIn', v); await p.click('#fbCheck'); await p.waitForTimeout(120); } };
  const pickOption = async tag => { if(!(await p.$('[data-wpick]')) || await p.$('[data-wpick].on')) return []; const b = await p.$('[data-wpick]:not([disabled])'); if(!b) return []; await b.click(); await p.waitForTimeout(120); return solve(tag + ' after pick'); };
  // the workings page: one sum at a time; the tutorial, the option choice and the practice questions along the way
  const solveW = async tag => { const seen = []; for(let g = 0; g < 60; g++){ if(await T() !== 'workings') break;
      if(await p.$('#wkTutNext')){ await p.click('#wkTutNext'); continue; } if(await p.$('#wkTutGo')){ seen.push('tutorial'); await p.click('#wkTutGo'); continue; }
      if(await p.$('#cellAns')){ const id = await p.evaluate(() => { const t = window.__sim.currentTable(); return t.id + ':' + t.active.col + '|' + t.active.row; }); seen.push(id);
        await p.evaluate(() => { const t = window.__sim.currentTable(), c = t.cols.find(x => x.id === t.active.col); document.getElementById('cellAns').value = String(c.values[t.active.row]); }); await p.press('#cellAns', 'Enter'); await p.waitForTimeout(80); continue; }
      if(await p.$('#wkNext')){ await p.click('#wkNext'); continue; }
      if(await p.$('[data-wpick]')){ const ws = await p.$$('[data-wpick]'); seen.push('pick' + ws.length); await (ws[1] || ws[0]).click(); await p.waitForTimeout(80); continue; }
      if(await p.$('#pqIn')){ await practice(); seen.push('practice'); continue; }
      if(await p.$('#nx')) break; await p.waitForTimeout(80); }
    typedLog[tag] = seen; return seen; };
  // launch-day identity (CR5): the flight code, the logo, the paint shop, the reveal, the certificate
  const identity = async () => { if(await T() === 'code'){ await p.click('#nx'); } if(await T() === 'logo'){ await p.click('#nx'); }
    if(await T() === 'paint'){ await p.click('[data-ptab="name"]'); await p.fill('#regIn', 'DRAG'); await p.click('#roll'); }
    if(await T() === 'reveal'){ await p.click('#skipReveal'); await p.waitForTimeout(150); await p.click('#nx'); } if(await T() === 'cert') await p.click('#nx'); };
  // ---- setup ----
  await p.click('#start'); await p.fill('#nm', 'Dragon Air'); await p.click('#nx');
  ok('no airline-type choice at the start', await T() !== 'strategy', await T());
  await identity();
  if(await T() === 'boot') await p.click('#enterHq'); if(await T() === 'chapter') await p.click('#chGo');
  await p.click('#nx'); await p.click(`[data-mk="${MK}"]`); await p.click('#nx'); await p.click('#nx');
  for(let k = 0; k < 4; k++) await p.click('#nx'); await practice(); await p.click('#nx'); await p.click('#nx');
  await p.click(`[data-svc="${MK}|2"]`);

  const probe = async () => {
    const TK = await p.evaluate(() => { const t = window.__sim.currentTable(), r = t && (t.rows || []).find(x => x.tool === 'revenue'); return r ? r.id : 'tk1'; }), C0 = await p.evaluate(() => window.__sim.currentTable().cols[0].id);
    const diag = () => p.evaluate(() => (window.__sim.S().diag || []).map(d => d.kind));
    // the figures on the workings page, re-read from the digits shown: the operands and the sign
      const dockAns = async () => { const v = await p.$$eval('.wk-grid .wk-row:not(.carry):not(.work):not(.ans)', e => e.map(x => [x.querySelector('.wk-op').textContent.trim(), [...x.querySelectorAll('i')].map(i => i.textContent).join('')])); let a = null;
      v.forEach(([op, t]) => { const n = +t; a = a === null ? n : op === '+' ? a + n : op === '−' ? a - n : op === '×' ? a * n : a / n; }); return Math.round(a * 100) / 100; };
    const accepted = () => p.evaluate(() => !!document.querySelector('.calc.done, .wk-row.ans.done'));
    const open1 = async () => { if(await p.$('#wkNext')) await p.click('#wkNext'); const c = await p.$('[data-cell]'); if(c){ await c.click(); await p.waitForTimeout(120); } return !!(await p.$('#cellAns')); };
    // 1. the first figure, answered from the dock with a click
    await open1(); let a = await dockAns(); await p.fill('#cellAns', String(a)); await p.click('#cellCheck'); await p.waitForTimeout(150);
    ok('the figure worked out from the dock is accepted', await accepted(), a); if(await p.$('#calcDone')) await p.click('#calcDone');
    ok('no calculation-check notes in normal play', (await diag()).length === 0, await diag());
    // 2. the model and the working disagree: the working wins, and it is recorded
    await open1(); a = await dockAns(); await p.evaluate(() => { const t = window.__sim.currentTable(), x = t.active, c = t.cols.find(y => y.id === x.col); c.values[x.row] += 7; });
    await p.fill('#cellAns', String(a)); await p.click('#cellCheck'); await p.waitForTimeout(150);
    ok('working on screen accepted when the model disagrees', await accepted()); ok('the disagreement is recorded', (await diag()).some(k => /differs/.test(k)), await diag());
    // 3. a loss: the minus-sign hint, then accepted with −  (re-open the profit figure on a fresh table)
    await p.evaluate(() => { const t = window.__sim.currentTable(); t.done = {}; t.active = null; }); await p.click('[data-cell]').catch(() => {}); await p.waitForTimeout(100);
    await p.evaluate(([TK0, C]) => { const t = window.__sim.currentTable(); t.done = {}; const c = t.cols[0]; if(t.rowIds && !t.rowIds.includes('profit')) t.rowIds.push('profit'); [TK0].forEach(r => { t.done[C + '|' + r] = true; }); t.active = { col:C, row:'profit' }; c.values.rev = c.values.cost - 150; c.values.profit = -150; }, [TK, C0]);
    await p.fill('#cellAns', '150'); await p.click('#cellCheck'); await p.waitForTimeout(150);
    const msg = await p.evaluate(() => (document.getElementById('ftMsg') || {}).textContent); ok('a loss typed without the minus gets the minus-sign hint', /minus/.test(msg), msg);
    await p.fill('#cellAns', '−150'); await p.click('#cellCheck'); await p.waitForTimeout(150); ok('a loss typed with − is accepted', await accepted());
    // 4. three wrong tries: Show me the answer
    await p.evaluate(([TK0, C]) => { const t = window.__sim.currentTable(); t.done = {}; t.active = { col:C, row:TK0 }; }, [TK, C0]); await p.click('[data-cell]').catch(() => {}); await p.waitForTimeout(120);
    if(!await p.$('#cellAns')){ await open1(); }
    for(let k = 0; k < 3; k++){ ok('Show me hidden before 3 tries ' + k, !await p.$('#calcShow')); await p.fill('#cellAns', '1'); await p.click('#cellCheck'); await p.waitForTimeout(120); }
    ok('Show me appears after 3 wrong tries', !!await p.$('#calcShow')); await p.click('#calcShow'); await p.waitForTimeout(150);
    ok('Show me completes the figure and shows the working', await accepted()); ok('Show me is recorded for the teacher', (await diag()).some(k => /shown to pupil/.test(k)));
    await p.keyboard.press('Control+Shift+T'); await p.waitForTimeout(200); const tl = await p.evaluate(() => (document.getElementById('tDiag') || {}).textContent || '');
    ok('teacher panel lists the calculation checks', /differs/.test(tl) && /shown to pupil/.test(tl), tl.slice(0, 120)); await p.click('#tClose');
  };
  let guard = 0, last = '', saves = 0, strategySeen = false; const calib = {};
  while(guard++ < 600){
    const t = await T(), s = await S(); if(s.round >= UPTO || t === 'protoEnd') break;
    const where = `${t}@${s.round}@${s.si}`; if(where === last) await p.waitForTimeout(250); last = where;
    const R = s.round, setup = s.phase === 'setup', day = setup ? 0 : R;
    if(t === 'intro'){ for(let pg = 0; pg < 2; pg++) await p.click('#niNext'); await practice(); for(let k = 0; k < 3 && await p.$eval('#nx', e => e.disabled); k++) await p.click(`[data-ni="${k}"]`); await p.click('#nx'); continue; }
    if(t === 'chapter'){ await fits('chapter'); await shot('chapter'); await p.click('#chGo'); continue; }
    if(t === 'chapterReview'){ await fits('chapterReview'); const typed = await solve('chapterReview'); checks.push('info chapterReview typed ' + JSON.stringify(typed)); if(await p.$('#calcDone')) await p.click('#calcDone'); await shot('chapterReview'); ok('chapter review: totals by hand', typed.length >= 3, typed); ok('chapter review: continue enabled', await p.$eval('#nx', e => !e.disabled)); await p.click('#nx'); continue; }
    if(t === 'shop2'){ await fits('shop ' + R); await shot('shop-' + R); if(R === 7){ await p.click('[data-pick="sf34"]'); ok('shop: the Saab can be looked at', !(await p.$eval('#nx', e => e.disabled))); await p.click('#nx'); } else await p.click('#skipShop'); continue; }
    if(t === 'fleetSums'){ await fits('fleetSums ' + R); const typed = await solve('fleetSums'); checks.push('info fleetSums ' + JSON.stringify(typed)); if(await p.$('#calcDone')) await p.click('#calcDone'); await shot('fleetSums-' + R); ok('fleet sums: continue enabled', await p.$eval('#nx', e => !e.disabled)); await p.click('#nx'); continue; }
    if(t === 'acquire'){ await fits('acquire ' + R); await shot('acquire-' + R); const before = (await S()).cash; await p.click('[data-terms="lease"]'); await p.click('#nx'); const a = await S(); ok('acquire: renting adds an aircraft without spending cash', a.fleet.length === 2 && Math.abs(a.cash - before) < 0.01, [a.fleet.length, before, a.cash]); continue; }
    if(t === 'event'){ await fits('event ' + R); await shot('ev-' + R); const opts = (await p.$$('[data-o]')).length; ok(`event ${R}: options offered`, opts >= 2, opts);
      ok(`event ${R}: decide waits for a choice`, await p.$eval('#nx', e => e.disabled)); await p.click(`[data-o="${R === 4 ? 2 : 1}"]`); await p.click('#nx');
      ok(`event ${R}: the choice is recorded`, (await S()).rnd.eventChoice !== undefined); await fits('event decided ' + R); await shot('ev-' + R + '-done'); await p.click('#nx'); continue; }
    if(t === 'hq'){ await fits('hq ' + R); await p.click('#startDay'); continue; }
    if(t === 'milestone'){ await fits('milestone ' + R); await shot('ms-' + R); await p.click('#msGo'); continue; }
    if(t === 'review'){ await solve('review ' + R); await p.click('#nx'); continue; }
    if(t === 'workings' && day === +(process.env.PDAY || 0)){ await probe(); break; }
    if(t === 'planner'){   // weeks keep the planner and the cost sheet
      if(s.fleet.length > 1 && !s.fleet[1].schedule.length){ if(await p.$('[data-petab="1"]')) await p.click('[data-petab="1"]'); const add = await p.$('[data-pe="0|add|ams|0|1"]:not([disabled])'); if(add){ await add.click(); const add2 = await p.$('[data-pe="0|add|ams|0|1"]:not([disabled])'); if(add2) await add2.click(); } }
      await fits('planner ' + R); if(R === 21 || R === 28) await shot(`plan-${R}`); await p.click('#nx'); continue; }
    if(t === 'plan'){
      if(R <= 4 && s.period.type === 'day'){
        ok(`Day ${R + 1}: snacks only from Day 2`, (await vis('[data-pe^="0|ob|"]')) === (R >= 1));
        ok(`Day ${R + 1}: departure times only from Day 4`, (await vis('[data-pe^="0|dep|"]')) === (R >= 3));
        ok(`Day ${R + 1}: the second market only from Day 4`, (await vis(`[data-pe="0|fare|${OTHER}|1"]`)) === (R >= 3));
        if(R === 1 && POL !== 'weak') await p.click('[data-pe="0|ob|low|0"]');
        if(R === 3){ const before = await p.evaluate(() => window.__sim.S().deps); await p.click('[data-pe="0|dep|0|-1"]'); await p.click('[data-pe="0|dep|0|-1"]'); const after = await p.evaluate(() => window.__sim.S().deps); ok('Day 3: a departure time can be moved', after && before && after[0] === before[0] - 60, [before, after]); }
        if(R === 3 && POL !== 'weak') { const add = await p.$(`[data-pe="0|add|${OTHER}|0|0"], [data-pe="0|add|${OTHER}|0"]`); if(add) await add.click(); }
      }
      if(s.fleet.length > 1 && s.period.type === 'day' && !s.fleet[1].schedule.length){ if(await p.$('[data-petab="1"]')) await p.click('[data-petab="1"]'); const add = await p.$('[data-pe="0|add|ams|0|1"]:not([disabled])'); if(add){ await add.click(); const add2 = await p.$('[data-pe="0|add|ams|0|1"]:not([disabled])'); if(add2) await add2.click(); } }
      await fits('planner ' + R); if(R <= 4) await shot(`d${day}-plan`); await p.click('#nx'); continue; }
    if(t === 'workings'){ await fits('workings ' + R); const typed = await solveW(`work ${day}`); checks.push(`info ${s.period.type} ${day} typed ${JSON.stringify(typed)}`); ok(`work ${day}: back to HQ enabled`, !!(await p.$('#nx')) && await p.$eval('#nx', e => !e.disabled)); await p.click('#nx'); continue; }
    if(t === 'costPlan'){
      await fits('cost ' + R); if(R <= 6) await shot(`d${day}-cost`); const typed = await solve(`cost ${day}`);
      checks.push(`info ${s.period.type} ${day} typed ${JSON.stringify(typed)}`);
      if(await p.$('#calcDone')) await p.click('#calcDone'); await p.waitForTimeout(150);
      const fx = await p.$('button.mdl'); if(fx && R <= 4){ await fx.click(); ok(`Day ${day}: the ƒ inspector shows the rule`, await vis('.dock .calc.fx')); await shot(`d${day}-fx`); await p.click('#dkClose').catch(() => {}); }
      ok(`cost ${day}: continue enabled`, await p.$eval('#nx', e => !e.disabled)); await p.click('#nx'); continue; }
    if(t === 'testIdeas'){
      await fits('test ' + R); ok(`test ${day}: no typed figures`, !(await vis('[data-cell]')));
      const keys = await p.$$eval('[data-pe^="9|fare|"]:not([disabled])', e => e.map(x => x.getAttribute('data-pe'))); const up = keys.find(k => k.endsWith('|1')) || keys[0];
      if(up){ await p.click(`[data-pe="${up}"]`); await p.waitForTimeout(150); }
      const m = await p.evaluate(() => { const S = window.__sim.S(); return { test:S.rnd.test, d:(document.querySelector('.t2-diff b') || {}).textContent }; });
      if(R <= 4) await shot(`d${day}-test`);
      if(await vis('[data-isave]:not([disabled])')){ await p.click('[data-isave]'); ok(`test ${day}: an idea is saved`, await vis('.idea')); }
      const better = m.d && m.d.trim().startsWith('+');
      if(POL === 'typical' && better && await vis('[data-ftest]:not([disabled])')) await p.click('[data-ftest]'); else await p.click('[data-fmine]');
      const fc = (await S()).rnd.myForecast; checks.push(`info test ${day} flew ${fc && fc.plan} projected ${fc && fc.profit}`); continue; }
    if(t === 'fuelPlan'){ if(await p.$eval('#nx', e => e.disabled)) await p.click('[data-oq]:nth-child(2)'); await fuelBill(); await fits('fuel ' + R); if(R === 2) await shot('d2-fuel'); await p.click('#nx'); continue; }
    if(t === 'paint'){ await fits('paint ' + R); await shot('paint-' + R); const a = await S(); ok(`paint ${R}: the new plane has its own registration`, new Set(a.fleet.map(f => f.registration)).size === a.fleet.length, a.fleet.map(f => f.registration)); await p.click('#roll'); continue; }
    if(t === 'reveal'){ await p.click('#skipReveal'); for(let i = 0; i < 50 && await p.$eval('#nx', e => e.hidden); i++) await p.waitForTimeout(100); await shot('reveal-' + R); await p.click('#nx'); continue; }
    if(t === 'takeoff'){ await fits('takeoff'); await shot('d0-takeoff'); await p.click('#toGo'); for(let i = 0; i < 200 && await p.$eval('#nx', e => e.hidden); i++) await p.waitForTimeout(100); ok('take-off: continue appears', !(await p.$eval('#nx', e => e.hidden))); await shot('d0-takeoff-done'); await p.click('#nx'); continue; }
    if(t === 'ready'){ await fits('ready ' + R); if(R <= 2) await shot(`d${day}-ready`); const en = await p.$eval('#startOps', e => !e.disabled); ok('ready enabled ' + day, en, await p.textContent('.opplan')); if(!en) break; await p.click('#startOps'); continue; }
    if(t === 'fly' || t === 'sim'){ for(let i = 0; i < 80 && ['fly', 'sim'].includes(await T()); i++) await p.waitForTimeout(250); continue; }
    if(t === 'results'){ const r = await S(), fc = r.rnd.myForecast;
      if(!r.rnd.sim && fc) ok(`day ${day}: projected = actual`, Math.abs(fc.profit - r.rnd.profit) < 1, [fc.profit, r.rnd.profit]);
      if(r.rnd.sim && r.rnd.vs) checks.push(`info period ${R} projected ${r.rnd.vs.expProfit} actual ${r.rnd.vs.gotProfit}`);
      if(day === 0 || day === 1) ok(`day ${day}: fuel is free`, (r.rnd.flights || []).every(f => !f.fuelCost), (r.rnd.flights || []).map(f => f.fuelCost));
      checks.push(`info results ${R} profit ${Math.round(r.rnd.profit)} cash ${Math.round(r.cash)} tank ${r.fuel}`); await fits('results ' + R); if(R <= 4) await shot(`d${day}-results`); await p.click('#nx'); continue; }
    if(t === 'rop'){ await fits('rop'); await shot('rop'); await p.click('#ropGo'); continue; }
    if(t === 'plans'){ await fits('plans ' + R);
      if(POL === 'typical'){ const ids = await p.$$eval('[data-oc^="9|fare|"][data-oc$="|1"]', e => e.filter(x => !x.disabled).map(x => x.getAttribute('data-oc'))); if(ids[0]){ await p.click(`[data-oc="${ids[0]}"]`); await p.waitForTimeout(150); } }
      await solve('plans ' + R); if(await p.$('#calcDone')) await p.click('#calcDone');
      const tb = await p.evaluate(() => { const t = window.__sim.currentTable(); if(!t) return null; const c = t.cols.find(x => x.id === 'test'); return c ? { d:c.values.diff } : null; });
      if(tb && tb.d > 0 && await p.$('[data-switch]:not([disabled])')) await p.click('[data-switch]'); else await p.click('[data-keep]'); continue; }
    if(t === 'yearPlan' || t === 'afford'){ calib.sep = calib.sep || Math.round(s.cash); await fits(t); await solve(t); if(await p.$('#calcDone')) await p.click('#calcDone'); await shot(t); await p.click('#nx'); continue; }
    if(t === 'yearReview'){ const v = s.rnd.yearVs; if(v) Object.assign(calib, { est:v.est, when:v.when, proj:v.expCash, end:v.gotCash }); await fits(t); await solve(t); if(await p.$('#calcDone')) await p.click('#calcDone'); await shot(t); await p.click('#nx'); continue; }
    if(t === 'strategy'){ strategySeen = true; await fits(t); await shot(t); await p.click('[data-st="value"]'); await p.click('#nx'); continue; }
    if(t === 'shop'){ await fits(t); await p.click('#nx'); continue; }
    if(t === 'invest'){ await fits(t); await solve(t); if(await p.$('#calcDone')) await p.click('#calcDone'); await p.waitForTimeout(200);
      const buy = await p.$$eval('[data-buy]', e => e.filter(x => !x.disabled).map(x => x.getAttribute('data-buy')));
      if(buy.length){ calib.bought = buy[buy.length - 1]; calib.saves = saves; await p.click(`[data-buy="${calib.bought}"]`); }
      else { saves++; if(saves > 3){ ok('affordable after saving', false); break; } const u = await p.$('[data-saveto]'); if(u) await u.click(); else await p.click('[data-save]'); } continue; }
    if(t === 'purchase'){ const before = s.cash; await p.click('#nx'); const a = await S(); ok('purchase deducts the price', a.onOrder && Math.abs(before - a.cash - a.onOrder.price) < 0.01); continue; }
    if(t === 'delivery'){ await p.click('#nx'); continue; }
    checks.push('stopped at ' + t + ' round ' + R); await shot('stop'); break;
  }
  if(UPTO > 19) console.log(`CALIB ${POL} ${HOME} ${MK} ${JSON.stringify(calib)}`);
  // the archive
  await p.click('[data-nav="finance"]', { force:true }).catch(() => {}); await p.click('[data-tab="fin2|plans"]').catch(() => {}); await p.waitForTimeout(200);
  const arch = await p.evaluate(() => [...document.querySelectorAll('.arch tbody tr')].length); if((await S()).round >= 2) ok('Finance → Plans lists the days', arch >= 3, arch); await shot('archive');
  checks.push('end at ' + await T() + ' round ' + (await S()).round);
  console.log(checks.join('\n')); console.log('OVERFLOW', overflow.length ? overflow : 'none'); console.log('ERRORS', errors.length ? errors : 'none');
  await b.close();
})();
