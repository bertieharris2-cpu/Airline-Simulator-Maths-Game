// Run: NODE_PATH=<playwright node_modules> node opening.test.js   (env: W, H, HOME_APT, MKT, POL, UPTO, SHOTS=0, OUT)
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
  await p.evaluate(() => { const st = window.__sim.settings(); st.flightSecs = 0.25; st.autoWall = false; st.opsSound = false; });   // live operations at speed, on the HQ (liveops.test.js watches the wall)
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
  // launch-day identity (CR5): the flight code, the logo, the paint shop, the reveal, the certificate
  const identity = async () => { if(await T() === 'code'){ await p.click('#nx'); } if(await T() === 'logo'){ await p.click('#nx'); }
    if(await T() === 'paint'){ await p.click('[data-ptab="name"]'); await p.fill('#regIn', 'DRAG'); await p.click('#roll'); }
    if(await T() === 'reveal'){ await p.click('#skipReveal'); await p.waitForTimeout(150); await p.click('#nx'); } if(await T() === 'cert') await p.click('#nx'); };
  // ---- setup ----
  await p.click('#start'); await p.fill('#nm', 'Dragon Air'); await p.click('#nx');
  ok('no airline-type choice at the start', await T() !== 'strategy', await T());
  ok('Back on the flight-code card goes to the name', await vis('#wsBack')); await p.click('#wsBack'); ok('… and lands on the name', await T() === 'name', await T()); await p.click('#nx');
  await identity();
  if(await T() === 'boot') await p.click('#enterHq'); if(await T() === 'chapter') await p.click('#chGo');
  await p.click('#nx'); await p.click(`[data-mk="${MK}"]`); await p.click('#nx'); await p.click('#nx');
  for(let k = 0; k < 4; k++) await p.click('#nx'); await practice(); await p.click('#nx'); await p.click('#nx');
  ok('launch day: Work it out follows the service', await T() === 'workout', await T());
  await p.click(`[data-svc="${MK}|2"]`);
  ok('launch day: three fares to work out', (await p.$$('[data-wpick]')).length === 3); ok('launch day: the fare waits for the tickets', !(await p.$('[data-wpick]:not([disabled])')));
  { const no = await p.evaluate(() => [...document.querySelectorAll('.svc[disabled] small')].map(e => e.textContent).join(' ')); if(no) ok('launch day: a service that will not fit says why', /airport closes/.test(no), no); }
  let guard = 0, last = '', saves = 0, strategySeen = false; const calib = {};
  while(guard++ < 600){
    const t = await T(), s = await S(); if(s.round >= UPTO || t === 'protoEnd') break;
    const where = `${t}@${s.round}@${s.si}`; if(where === last) await p.waitForTimeout(250); last = where;
    const R = s.round, setup = s.phase === 'setup', day = setup ? 0 : R;
    if(t === 'intro'){ const key = s.steps[s.si].key;
      for(let pg = 0; pg < 3; pg++){ await fits(`intro ${key} p${pg}`); await shot(`in-${key}-p${pg}`); if(pg < 2) await p.click('#niNext'); }
      ok(`intro ${key}: continue waits for the sum`, await p.$eval('#nx', e => e.disabled));
      if(await p.$('#pqIn')){ await p.fill('#pqIn', '999999'); await p.click('#pqCheck'); await p.waitForTimeout(80); ok(`intro ${key}: a wrong practice answer gets a hint`, /Not quite/.test(await p.$eval('.pq-msg', e => e.textContent)));
        await practice(); ok(`intro ${key}: three practice answers open the plan`, !(await p.$eval('#nx', e => e.disabled)) && await vis('.pq.all')); await fits(`intro ${key} done`); await shot(`in-${key}-done`); await p.click('#nx'); continue; }
      const n = (await p.$$('[data-ni]')).length; let wrong = 0;
      for(let k = 0; k < n && await p.$eval('#nx', e => e.disabled); k++){ await p.click(`[data-ni="${k}"]`); if(await p.$eval('#nx', e => e.disabled)){ wrong++; ok(`intro ${key}: a wrong sum explains why`, await vis('.ni-no')); } }
      ok(`intro ${key}: the right sum opens the plan`, !(await p.$eval('#nx', e => e.disabled)), { wrong }); await fits(`intro ${key} done`); await shot(`in-${key}-done`); await p.click('#nx'); continue; }
    if(t === 'chapter'){ await fits('chapter'); await shot('chapter'); await p.click('#chGo'); continue; }
    if(t === 'chapterReview'){ await fits('chapterReview'); const typed = await solve('chapterReview'); checks.push('info chapterReview typed ' + JSON.stringify(typed)); if(await p.$('#calcDone')) await p.click('#calcDone'); await shot('chapterReview'); ok('chapter review: totals by hand', typed.length >= 3, typed); ok('chapter review: continue enabled', await p.$eval('#nx', e => !e.disabled)); await p.click('#nx'); continue; }
    if(t === 'shop2'){ await fits('shop ' + R); await shot('shop-' + R); if(R === 7){ await p.click('[data-pick="sf34"]'); ok('shop: the Saab can be looked at', !(await p.$eval('#nx', e => e.disabled))); await p.click('#nx'); } else await p.click('#skipShop'); continue; }
    if(t === 'fleetSums'){ await fits('fleetSums ' + R); const typed = await solve('fleetSums'); checks.push('info fleetSums ' + JSON.stringify(typed)); if(await p.$('#calcDone')) await p.click('#calcDone'); await shot('fleetSums-' + R); ok('fleet sums: continue enabled', await p.$eval('#nx', e => !e.disabled)); await p.click('#nx'); continue; }
    if(t === 'acquire'){ await fits('acquire ' + R); await shot('acquire-' + R); const before = (await S()).cash; await p.click('[data-terms="lease"]'); await p.click('#nx'); const a = await S(); ok('acquire: renting adds an aircraft without spending cash', a.fleet.length === 2 && Math.abs(a.cash - before) < 0.01, [a.fleet.length, before, a.cash]); continue; }
    if(t === 'event'){ await fits('event ' + R); await shot('ev-' + R); const opts = (await p.$$('[data-o]')).length; ok(`event ${R}: options offered`, opts >= 2, opts);
      ok(`event ${R}: decide waits for a choice`, await p.$eval('#nx', e => e.disabled)); await p.click(`[data-o="${R === 4 ? 2 : 1}"]`); await p.click('#nx');
      ok(`event ${R}: the choice is recorded`, (await S()).rnd.eventChoice !== undefined); await fits('event decided ' + R); await shot('ev-' + R + '-done'); await p.click('#nx'); continue; }
    if(t === 'hq'){ await fits('hq ' + R); if(R === 7 || R === 8 || R === 21) await shot('hq-' + R); ok('no Back on the morning HQ', !(await vis('#wsBack'))); await p.click('#startDay'); continue; }
    if(t === 'milestone'){ await fits('milestone ' + R); await shot('ms-' + R); await p.click('#msGo'); continue; }
    if(t === 'review'){ await solve('review ' + R); await p.click('#nx'); continue; }
    if(t === 'planner'){   // weeks keep the planner and the cost sheet
      if(s.fleet.length > 1 && !s.fleet[1].schedule.length){ if(await p.$('[data-petab="1"]')) await p.click('[data-petab="1"]'); const add = await p.$('[data-pe="0|add|ams|0|1"]:not([disabled])'); if(add){ await add.click(); const add2 = await p.$('[data-pe="0|add|ams|0|1"]:not([disabled])'); if(add2) await add2.click(); } }
      await fits('planner ' + R); if(R === 21 || R === 28) await shot(`plan-${R}`); await p.click('#nx'); continue; }
    if(t === 'workout'){
      if(R <= 4 && s.period.type === 'day'){
        ok(`Day ${R + 1}: snacks only from Day 2`, (await vis('[data-pe^="0|ob|"]')) === (R >= 1));
        ok(`Day ${R + 1}: departure times only from Day 4`, (await vis('[data-pe^="0|dep|"]')) === (R >= 3));
        ok(`Day ${R + 1}: the second market only from Day 4`, (await vis(`[data-pe="0|fare|${OTHER}|1"]`)) === (R >= 3));
        if(R === 1 && POL !== 'weak') await p.click('[data-pe="0|ob|low|0"]');
        if(R === 3){ const before = await p.evaluate(() => window.__sim.S().deps); await p.click('[data-pe="0|dep|0|-1"]'); await p.click('[data-pe="0|dep|0|-1"]'); const after = await p.evaluate(() => window.__sim.S().deps); ok('Day 3: a departure time can be moved', after && before && after[0] === before[0] - 60, [before, after]); }
        if(R === 3 && POL !== 'weak') await p.click(`[data-pe="0|add|${OTHER}|0"]`).catch(() => {});
      }
      if(s.fleet.length > 1 && s.period.type === 'day' && !s.fleet[1].schedule.length){ if(await p.$('[data-petab="1"]')) await p.click('[data-petab="1"]'); const add = await p.$('[data-pe="0|add|ams|0|1"]:not([disabled])'); if(add){ await add.click(); const add2 = await p.$('[data-pe="0|add|ams|0|1"]:not([disabled])'); if(add2) await add2.click(); ok(`Day ${R + 1}: the second aircraft gets Amsterdam services`, (await S()).fleet[1].schedule.length > 0); } }
      if(R === 7 || R === 14 || R === 21) await shot(`plan-${R}`);
      if(R === 2 && !s.rnd.backTried){ await p.evaluate(() => { window.__sim.S().rnd.backTried = true; }); ok('Day 2: Back on Work it out', await vis('#wsBack')); await p.click('#wsBack'); ok('Day 2: Back from Work it out leaves it', await T() !== 'workout', await T()); await p.click('#nx'); ok('Day 2: forward again returns to Work it out', await T() === 'workout', await T()); }
      await fits('workout ' + R); if(R <= 6) await shot(`d${day}-work`); const typed = await solve(`work ${day}`); typed.push(...await pickOption(`work ${day}`));
      if(R === 1){ ok('Day 2: two snack options to work out', (await p.$$('[data-wpick]')).length >= 2); }
      if(R === 1 && await p.$('#woThird')){ await p.click('#woThird'); typed.push(...await solve(`work ${day} third`)); ok('Day 2: a third snack option can be compared', (await p.$$('[data-wpick]')).length === 3); }
      checks.push(`info ${s.period.type} ${day} typed ${JSON.stringify(typed)}`);
      if(await p.$('#calcDone')) await p.click('#calcDone'); await p.waitForTimeout(150);
      const fx = await p.$('button.mdl'); if(fx && R <= 4){ await fx.click(); ok(`Day ${day}: the ƒ inspector shows the rule`, await vis('.calc.fx')); await shot(`d${day}-fx`); await p.click('#dkClose').catch(() => {}); }
      if(await p.$('#woPad')){ await p.click('#woPad'); ok(`Day ${day}: squared paper opens`, await vis('.wo-pad #padCv')); if(R <= 1) await shot(`d${day}-paper`); await p.click('#woPad'); }
      ok(`work ${day}: continue enabled`, await p.$eval('#nx', e => !e.disabled), await p.textContent('.wo-sheet .pnl-h')); await p.click('#nx'); continue; }
    if(t === 'costPlan'){   // weeks
      await fits('cost ' + R); const typed = await solve(`cost ${day}`);
      checks.push(`info ${s.period.type} ${day} typed ${JSON.stringify(typed)}`);
      if(await p.$('#calcDone')) await p.click('#calcDone'); await p.waitForTimeout(150);
      ok(`cost ${day}: continue enabled`, await p.$eval('#nx', e => !e.disabled)); await p.click('#nx'); continue; }
    if(t === 'testIdeas'){
      await fits('test ' + R); ok(`test ${day}: no typed figures`, !(await vis('[data-cell]')));
      const keys = await p.$$eval('[data-pe^="9|fare|"]:not([disabled])', e => e.map(x => x.getAttribute('data-pe'))); const up = keys.find(k => k.endsWith('|1')) || keys[0];
      if(up){ await p.click(`[data-pe="${up}"]`); await p.waitForTimeout(150); }
      const m = await p.evaluate(() => { const S = window.__sim.S(); return { test:S.rnd.test, d:(document.querySelector('.t2-diff b') || {}).textContent }; });
      if(R <= 4 || R === 7 || R === 14 || R === 21) await shot(`d${day}-test`);
      if(await vis('[data-isave]:not([disabled])')){ await p.click('[data-isave]'); ok(`test ${day}: an idea is saved`, await vis('.idea')); }
      const better = m.d && m.d.trim().startsWith('+');
      if(POL === 'typical' && better && await vis('[data-ftest]:not([disabled])')) await p.click('[data-ftest]'); else await p.click('[data-fmine]');
      const fc = (await S()).rnd.myForecast; checks.push(`info test ${day} flew ${fc && fc.plan} projected ${fc && fc.profit}`); continue; }
    if(t === 'fuelPlan'){ if(await p.$eval('#nx', e => e.disabled)) await p.click('[data-oq]:nth-child(2)'); if(R === 2 && await p.$('#fbIn')){ await p.fill('#fbIn', '1'); await p.click('#fbCheck'); ok('Day 3: a wrong fuel bill shows the pounds-then-pence method', /£1/.test(await p.$eval('.fb-msg', e => e.textContent))); } await fuelBill(); ok(`fuel ${R}: the order bill is typed before Next`, !(await p.$('#fbIn')) && await p.$eval('#nx', e => !e.disabled)); await fits('fuel ' + R); if(R === 2) await shot('d2-fuel'); await p.click('#nx'); continue; }
    if(t === 'paint'){ await fits('paint ' + R); await shot('paint-' + R); const a = await S(); ok(`paint ${R}: the new plane has its own registration`, new Set(a.fleet.map(f => f.registration)).size === a.fleet.length, a.fleet.map(f => f.registration)); await p.click('#roll'); continue; }
    if(t === 'reveal'){ await p.click('#skipReveal'); for(let i = 0; i < 50 && await p.$eval('#nx', e => e.hidden); i++) await p.waitForTimeout(100); await shot('reveal-' + R); await p.click('#nx'); continue; }
    if(t === 'takeoff'){ await fits('takeoff'); await shot('d0-takeoff'); await p.click('#toGo'); for(let i = 0; i < 200 && await p.$eval('#nx', e => e.hidden); i++) await p.waitForTimeout(100); ok('take-off: continue appears', !(await p.$eval('#nx', e => e.hidden))); await shot('d0-takeoff-done'); await p.click('#nx'); continue; }
    if(t === 'ready'){ await fits('ready ' + R); if(R <= 2) await shot(`d${day}-ready`); const en = await p.$eval('#startOps', e => !e.disabled); ok('ready enabled ' + day, en, await p.textContent('.opplan')); if(!en) break; await p.click('#startOps'); continue; }
    if(t === 'fly' || t === 'sim'){ for(let i = 0; i < 80 && ['fly', 'sim'].includes(await T()); i++) await p.waitForTimeout(250); continue; }
    if(t === 'results'){ ok('no Back on the results ' + R, !(await vis('#wsBack'))); const r = await S(), fc = r.rnd.myForecast;
      if(!r.rnd.sim && fc) ok(`day ${day}: projected = actual`, Math.abs(fc.profit - r.rnd.profit) < 1, [fc.profit, r.rnd.profit]);
      if(!r.rnd.sim && fc && Math.abs(fc.profit - r.rnd.profit) >= 1) checks.push('info diff ' + JSON.stringify({ fc, rev:r.rnd.revenue, costs:r.rnd.costs, fuel:r.rnd.fuelUsedCost, over:r.rnd.over, ev:r.rnd.eventCost, X:r.rnd.extras && { term:r.rnd.extras.term, ob:r.rnd.extras.obCost, crew:r.rnd.extras.crew }, fl:(r.rnd.flights || []).map(f => [f.key, f.sold, f.revenue, f.runCost, f.fuelCost, f.cancelled || '', r.rnd.status[f.key]]) }));
      if(r.rnd.sim && r.rnd.vs) checks.push(`info period ${R} projected ${r.rnd.vs.expProfit} actual ${r.rnd.vs.gotProfit}`);
      if(day === 0 || day === 1) ok(`day ${day}: fuel is free`, (r.rnd.flights || []).every(f => !f.fuelCost), (r.rnd.flights || []).map(f => f.fuelCost));
      ok(`results ${R}: reputation unchanged and hidden`, r.rep === 3 && !(r.rnd.why || []).some(w => w.ic === '⭐') && await p.evaluate(() => getComputedStyle(document.querySelector('.s-rep')).display === 'none'), r.rep);
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
