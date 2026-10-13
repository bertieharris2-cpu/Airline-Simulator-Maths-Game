// Run: NODE_PATH=<playwright node_modules> CODE=<file> node chapter2.test.js   (env: UPTO day (default 155), SHOTS=0, OUT, W, H, SAVE=file for the save code at the end)
// Workbook v5.0 (D68–D73), the game (airline-opening-prototype.html).
// CODE is a save code at chapter 1's review, written by: UPTO=200 SAVE=<file> node week.test.js
// The pupil carries on from chapter 1's end: Christmas and New Year fly by themselves, then on Monday 6 January 2031 they
// lease a Boeing 757 and fly New York at £510 at 06:30. Checked: the long-haul block and the local-time arrival, the
// refused second service, Balance Report v5.0 §2 (£47,426 a day for a full 757 at £510, within £10), the week's run and
// review, the overnight rotation (Delhi, tried early), growth from the opening week, and the beats on to February.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const FILE = 'file://' + path.resolve(__dirname, '../../..', process.env.GAME || 'airline-opening-prototype.html'), OUT = (process.env.OUT || os.tmpdir() + '/airline-ch2') + '/'; fs.mkdirSync(OUT, { recursive:true });
const W = +(process.env.W || 1680), H = +(process.env.H || 940), SHOTS = process.env.SHOTS !== '0', UPTO = +(process.env.UPTO || 155);
const CODE = process.env.CODE || path.join(os.tmpdir(), 'airline-ch1-end.txt'), TYPE = process.env.TYPE || 'value';   // the airline type chosen on day 127
if(!fs.existsSync(CODE)){ console.log(`No save code at ${CODE}. Make one: UPTO=200 SHOTS=0 SAVE=${CODE} node week.test.js`); process.exit(1); }
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport:{ width:W, height:H } })).newPage();
  const errors = [], checks = [], overflow = [], info = {};
  p.on('pageerror', e => errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if(m.type() === 'error') errors.push('console: ' + m.text()); }); p.on('dialog', d => d.accept());
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { const st = window.__sim.settings(); st.flightSecs = 0.25; st.autoWall = false; st.opsSound = false; });
  const T = () => p.evaluate(() => window.__sim.step().t), S = () => p.evaluate(() => window.__sim.S()), E = src => p.evaluate(s => window.__sim.evalIn(s), src);
  const ok = (name, cond, x) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (x !== undefined ? ' ' + JSON.stringify(x) : ''));
  const shot = async n => { if(!SHOTS) return; await p.waitForTimeout(150); await p.screenshot({ path:OUT + n + '.png' }); };
  const vis = sel => p.evaluate(s => !!document.querySelector(s), sel);
  const txt = async sel => (await p.$eval(sel, e => e.textContent).catch(() => '')).replace(/\s+/g, ' ').trim();
  const fits = async tag => { const r = await p.evaluate(() => { const bad = []; document.querySelectorAll('.tf-body,#screen,.ws-rail,.sheet1,.wk,.st-tt,.st-top').forEach(e => { if(e.scrollHeight > e.clientHeight + 2) bad.push((e.className || e.id).split(' ')[0] + ' ' + e.scrollHeight + '>' + e.clientHeight); }); return bad; }); if(r.length) overflow.push(tag + ': ' + r.join(', ')); };
  const practice = async () => { for(let i = 0; i < 3; i++){ const a = await p.evaluate(() => window.__sim.practiceAnswer()); if(!a || !(await p.$('#pqIn'))) break; await p.fill('#pqIn', a.text); await p.click('#pqCheck'); await p.waitForTimeout(1050); } };
  const builds = async () => { const done = []; for(let g = 0; g < 12; g++){ const P = await E('rbPlan()'); if(!P) break;
      if(P.seq){ for(const x of P.seq) await p.click(['+', '−', '×', '÷'].includes(x) ? `[data-rbop="${P.id}|${x}"]` : `[data-rbfig="${P.id}|${x}"]`); }
      else { await p.click(`[data-rbop="${P.id}|${P.op}"]`); await p.fill(`[data-rbdiv="${P.id}"]`, String(P.div)); }
      await p.click(`[data-rbchk="${P.id}"]`); await p.waitForTimeout(80); done.push(P.id); } return done; };
  const signs = async tag => { const done = []; for(let g = 0; g < 14; g++){ const P = await E('soPlan()'); if(!P) break;
      if(P.rb){ await p.click(`[data-rbop="${P.rb.id}|${P.rb.op}"]`); await p.fill(`[data-rbdiv="${P.rb.id}"]`, String(P.rb.div)); await p.click(`[data-rbchk="${P.rb.id}"]`); await p.waitForTimeout(80); done.push('rb:' + P.rb.id); continue; }
      const k = P.key.replace(/"/g, '\\"');
      if(P.pre){ if(!info.preQuery){ await p.fill(`[data-sopre="${k}"]`, '1'); await p.click(`[data-soprechk="${k}"]`); await p.waitForTimeout(60); info.preQuery = await txt(`[data-socard="${k}"] .sc-msg`);
          ok(`${tag}: a wrong first step is a Query with a hint (${P.key})`, /^Query/.test(info.preQuery) && !(await vis(`[data-soin="${k}"]`)), info.preQuery); }
        await p.fill(`[data-sopre="${k}"]`, P.pre); await p.click(`[data-soprechk="${k}"]`); await p.waitForTimeout(80); done.push('pre:' + P.key + '=' + P.pre); }
      if(P.level === 'build'){ for(const x of P.seq) await p.click(['+', '−', '×', '÷'].includes(x) ? `[data-soop="${k}|${x}"]` : `[data-sofig="${k}|${x}"]`); }
      else await p.fill(`[data-soin="${k}"]`, P.answer);
      await p.click(`[data-sochk="${k}"]`); await p.waitForTimeout(80); if(!(await vis(`[data-socard="${k}"] .stamp.ok`))){ ok(`${tag}: ${P.key} signed`, false, P); break; } done.push(P.level + ':' + P.key); }
    info['signs ' + tag] = done; return done; };
  const solveW = async () => { for(let g = 0; g < 80; g++){ if(await T() !== 'workings') break;
      if(await p.$('#wkTutNext')){ await p.click('#wkTutNext'); continue; } if(await p.$('#wkTutGo')){ await p.click('#wkTutGo'); continue; }
      if(await p.$('#cellAns')){ await p.evaluate(() => { const t = window.__sim.currentTable(), c = t.cols.find(x => x.id === t.active.col); document.getElementById('cellAns').value = String(c.values[t.active.row]); }); await p.press('#cellAns', 'Enter'); await p.waitForTimeout(60); continue; }
      if(await p.$('.sc-p1.sign #scCheck')){ const A = await E('scAnswers()'); for(const [k, v] of Object.entries(A)) await p.fill(`[data-sc="${k}"]`, v); await p.click('#scCheck'); await p.waitForTimeout(80); continue; }
      if(await p.$('#scNext:not([disabled])')){ await p.click('#scNext'); continue; }
      if(await p.$('#wkNext')){ await p.click('#wkNext'); continue; }
      if(await p.$('[data-wpick]')){ const ws = await p.$$('[data-wpick]'); await (ws[1] || ws[0]).click(); await p.waitForTimeout(80); continue; }
      if(await p.$('#pqIn')){ await practice(); continue; }
      if(await p.$('#nx')) break; await p.waitForTimeout(80); } };
  const toast = async () => (await p.$eval('.toast', e => e.textContent).catch(() => ''));
  const plane757 = async () => (await S()).fleet.findIndex(f => f.planeId === 'b757');

  // ---------- chapter 1's end ----------
  const code = fs.readFileSync(CODE, 'utf8').trim();
  await p.evaluate(c => { const s = window.__sim.loadCode(c); window.__sim.setS(s); window.__sim.landSave(); window.__sim.render(); }, code);
  let s = await S(); const cash118 = Math.round(s.cash); info.start = { day:s.day, step:await T(), cash:cash118, fleet:s.fleet.map(f => f.planeId) };
  ok('the save is at chapter 1\'s review (day 118)', s.day === 118 && ['chapterReview', 'review', 'hq'].includes(await T()), info.start);
  await E("(S.si = S.steps.findIndex(x => x.t === 'protoEnd'), render(), 1)"); await p.waitForTimeout(150);
  ok('chapter 1 complete: the card leads on to Christmas and New Year, then chapter 2 on 6 January', await vis('#peNext') && /Christmas and New Year/.test(await txt('.proto-end')) && /6 January 2031/.test(await txt('.proto-end')) && !/not built yet/.test(await txt('.proto-end')), await txt('.proto-end p.muted'));
  await shot('c2-01-chapter1-end'); await p.click('#peNext'); await p.waitForTimeout(150);

  // ---------- Christmas and New Year (days 119–126) ----------
  s = await S(); ok('the holiday is one run from 29 December to 5 January (days 119–126)', s.period && s.period.type === 'gap' && s.period.from === 119 && s.period.to === 126, s.period);
  ok('the holiday opens on HQ with "Fly Christmas and New Year"', await T() === 'hq' && /Fly Christmas and New Year/.test(await txt('#startDay')), [await T(), await txt('#startDay')]);
  await shot('c2-02a-holiday-hq'); await p.click('#startDay'); await p.waitForTimeout(100);
  for(let k = 0; k < 200 && await T() === 'sim'; k++) await p.waitForTimeout(150);
  ok('after the run, the results', await T() === 'results', await T()); await shot('c2-02b-holiday-results');
  s = await S(); const L = s.ledger, hol = []; for(let d = 119; d <= 126; d++) hol.push(L.rev[d] === undefined || L.rev[d] === null ? null : Math.round(L.rev[d] - L.cost[d]));
  ok('every holiday day is in the accounts', hol.every(v => v !== null), hol); info.holiday = { profit:hol, fuel:s.holidayFuel || null, cash:Math.round(s.cash) };
  ok('the holiday\'s close button leads to chapter 2', /chapter 2/i.test(await txt('#nx')), await txt('#nx'));
  await p.click('#nx'); await p.waitForTimeout(200);

  // ---------- chapter 2, a day at a time ----------
  let lastDay = 0, nyc = null, refused = false, overnight = null, growth = null;
  for(let i = 0; i < 300; i++){ const t = await T(); s = await S(); const day = s.day;
    if(day >= UPTO && t === 'hq'){ checks.push('stopped at hq day ' + day); break; }
    if(t === 'protoEnd' || t === 'chapterReview'){ checks.push('reached ' + t + ' day ' + day); await shot('c2-chapter-end'); if(day === 364) ok('the chapter 2 review (31 August 2031) says chapter 3 comes next', /Chapter 3 opens on Tuesday 2 September 2031/.test(await txt('#screen')) && !/Chapter 2, Going long, opens/.test(await txt('#screen')), (await txt('#screen')).match(/What comes next.{0,140}/)); break; }
    if(t === 'hq'){ if(day === 127){ ok('day 127: chapter 2 opens on Monday 6 January with New York and Dubai', /New York and Dubai/.test(await txt('#screen')), (await txt('#screen')).slice(0, 200)); await shot('c2-03-day127-hq'); }
      await fits('hq ' + day); lastDay = day; await p.click('#startDay'); continue; }
    if(t === 'intro'){ if(day === 127){ const x = await txt('#screen'); ok('day 127: What\'s new: Going long, with the local-time arrival (out 06:30, lands 07:45 New York time, back 21:00)', /Going long/.test(x) && /06:30/.test(x) && /07:45/.test(x) && /21:00/.test(x), x.slice(0, 300)); await shot('c2-04-intro'); }
      for(let pg = 0; pg < 2; pg++) if(await p.$('#niNext')) await p.click('#niNext'); if(await p.$('#pqIn')) await practice();
      const n = (await p.$$('[data-ni]')).length; for(let k = 0; k < n && await p.$eval('#nx', e => e.disabled); k++) await p.click(`[data-ni="${k}"]`); await p.click('#nx'); continue; }
    if(t === 'stars'){ const x = await txt('#screen'), r = JSON.parse(await E('JSON.stringify(typeReport())')); info.reveal = { rep:r.rep, factor:r.factor, bank:(await S()).repBank || 0 };
      ok('day 127: the star rating is revealed at the banked level, with what moved it and what it is worth (5% a half-star)', /Your star rating is public/.test(x) && /What moved it/.test(x) && /Each half-star above 3/.test(x) && r.rep === Math.min(5, Math.max(1, Math.round((3 + info.reveal.bank) * 2) / 2)) && Math.abs(r.factor - (1 + 0.1 * (r.rep - 3))) < 1e-9, info.reveal);
      await shot('c2-04b-stars'); await p.click('#nx'); continue; }
    if(t === 'atype'){ await shot('c2-04c-type'); ok('day 127: the type page offers Premium, Full Service and Value; Next waits for a choice', (await p.$$('[data-atype]')).length === 3 && await p.$eval('#nx', e => e.disabled));
      for(const ty of ['premium', 'value', 'full']){ await p.click(`[data-atype="${ty}"]`); await p.waitForTimeout(60); info['fares ' + ty] = JSON.parse(await E("JSON.stringify(routeById('nyc').fares)")); }
      ok('fare gating: Premium adds the two steps above (New York £570, £590); Value one below (£450); Full Service the five options', JSON.stringify(info['fares premium']) === '[470,490,510,530,550,570,590]' && JSON.stringify(info['fares value']) === '[450,470,490,510,530,550]' && JSON.stringify(info['fares full']) === '[470,490,510,530,550]', [info['fares premium'], info['fares value'], info['fares full']]);
      await p.click(`[data-atype="${TYPE}"]`); await p.waitForTimeout(60); await shot('c2-04d-type-' + TYPE); await p.click('#nx'); continue; }
    if(t === 'atypeOk'){ await shot('c2-09-thursday-type'); ok(`day ${day}: Thursday's card asks to confirm the airline type`, day === 130 && /Confirm: /.test(await txt('#nx')), [day, await txt('#nx')]);
      await p.click('#nx'); await p.waitForTimeout(80); ok('the type is confirmed', JSON.parse(await E('JSON.stringify(typeReport())')).confirmed === true); continue; }
    if(t === 'shop2'){ await shot(`c2-d${day}-shop`);
      if(day === 127){ const has = await p.$$eval('[data-pick]', es => es.map(e => e.getAttribute('data-pick'))); ok('day 127: the 757 and the 787 are in the shop', has.includes('b757') && has.includes('b787'), has);
        await p.click('[data-pick="b757"]'); await p.waitForTimeout(400); await p.click('#nx'); }
      else await p.click('#skipShop'); continue; }
    if(t === 'fleetSums' && await vis('.so-page')){ await signs('fleetSums ' + day); await p.click('#nx'); continue; }
    if(t === 'acquire'){ await shot(`c2-d${day}-acquire`); if(await vis('.so-page')){ await signs('acquire ' + day); await p.click('#nx'); continue; }
      if(await p.$('#rbIn')){ const a = await E("(() => { const f = FINANCE[S.rnd.shopPick] || {}; return Math.round((f.cashPrice || 0) / (f.leaseDaily || 1)); })()"); await p.fill('#rbIn', String(a)); await p.click('#rbChk'); await p.waitForTimeout(60); }
      const buy = await p.$eval('[data-terms="buy"]', e => e.disabled).catch(() => true); ok(`day ${day}: the long-haul plane is lease only (buying opens in chapter 3)`, buy === true);
      await p.click('[data-terms="lease"]'); await p.click('#nx'); await p.waitForTimeout(100); continue; }
    if(t === 'paint'){ await p.click('#roll'); continue; }
    if(t === 'reveal'){ await p.click('#skipReveal'); for(let k = 0; k < 50 && await p.$eval('#nx', e => e.hidden); k++) await p.waitForTimeout(100); await p.click('#nx'); continue; }
    if(t === 'event'){ await shot(`c2-d${day}-event`); await p.click('[data-o="1"]'); await p.click('#nx'); await p.waitForTimeout(80); if(await T() === 'event') await p.click('#nx'); continue; }
    if(t === 'plan'){ await fits('plan ' + day);
      if(await vis('#s2Edit')){ await p.click('#s2Edit'); await p.waitForTimeout(100); }
      if(day === 127 && !nyc){ const j = await plane757();
        ok('day 127: the 757 is in the fleet, on lease at £1,500 a day', j >= 0 && (await S()).fleet[j].terms && (await S()).fleet[j].terms.kind === 'lease' && (await S()).fleet[j].terms.daily === 1500, j >= 0 ? (await S()).fleet[j].terms : null);
        // the range check: a short-haul plane can't reach New York
        await p.selectOption('[data-addsel="0|0"]', 'nyc').catch(() => {}); await p.waitForTimeout(100); const tr = await toast(); const p0 = (await S()).fleet[0].planeId;
        ok('day 127: a short-haul plane is not offered New York (out of range)', !(await E("JSON.stringify(currentPlan().fleet[0].sched)")).includes('nyc'), { plane:p0, toast:tr });
        await p.selectOption(`[data-addsel="0|${j}"]`, 'nyc'); await p.waitForTimeout(150);
        const blk = await p.$eval(`[data-tl^="0|${j}|"]`, e => ({ dep:+e.dataset.dep, arr:+e.dataset.arr, cls:e.className, note:(e.querySelector('.s2-lh') || {}).textContent || '' })).catch(() => null); nyc = blk;
        ok('day 127: New York on the 757 is one block, out 06:30, back 21:00', blk && blk.dep === 390 && blk.arr === 1260 && /\blh\b/.test(blk.cls), blk);
        ok('day 127: the block shows the arrival in New York time (07:45)', blk && /lands 07:45 New York time/.test(blk.note), blk && blk.note);
        await shot('c2-05-day127-plan-nyc');
        await p.selectOption(`[data-addsel="0|${j}"]`, 'nyc').catch(() => {}); await p.waitForTimeout(150); const t2 = await toast(); refused = /Doesn't fit/.test(t2) && /one New York service a day/.test(t2);
        ok('day 127: a second New York service on the 757 is refused: it doesn\'t fit', refused && (await E(`currentPlan().fleet[${j}].sched.length`)) === 1, t2); await shot('c2-06-second-refused');
        ok('day 127: New York is at £510', (await E("fareOf('nyc')")) === 510, await E("fareOf('nyc')")); }
      if(day === 134 && !overnight){ const j = await plane757();   // the overnight rotation, tried early on the plan page (Delhi opens in June)
        const keep = await E(`JSON.stringify({ s:S.fleet[${j}].schedule, d:S.fleet[${j}].deps })`);
        await E(`(S.fleet[${j}].schedule = ['del'], S.fleet[${j}].route = 'del', S.fleet[${j}].deps = [390], refreshPlan(), render(), 1)`); await p.waitForTimeout(150);
        const ov = await p.$eval(`[data-tl^="0|${j}|"]`, e => ({ dep:+e.dataset.dep, arr:+e.dataset.arr, cls:e.className, note:(e.querySelector('.s2-lh') || {}).textContent || '' })).catch(() => null);
        ok('overnight: Delhi is a one-way block today, "Out today, back tomorrow · earns every second day", landing in Delhi time (+5½ h)', ov && /\bovn\b/.test(ov.cls) && /earns every second day/.test(ov.note) && ov.dep === 390 && ov.arr === 390 + 447 && /lands 19:27 Delhi time/.test(ov.note), ov);
        await shot('c2-07-overnight-block');
        const rot = await E(`JSON.stringify(dryRun(() => { const f = S.fleet[${j}]; delete f.rot; return [0, 1, 2, 3].map(k => withDay(S.day + k, () => { const fl = planFlights().filter(x => x.uid === f.uid), X = dayExtras(fl); return { day:S.day + k, home:fl.some(x => x.homeLeg), sold:fl.reduce((t, x) => t + x.sold, 0), rev:fl.reduce((t, x) => t + x.revenue, 0), run:fl.reduce((t, x) => t + x.runCost, 0), fuelL:fl.reduce((t, x) => t + x.fuelL, 0), crew:X.lhCrew, dayCost:dayCostOf(f) }; })); }))`);
        overnight = JSON.parse(rot); const out = overnight.filter((_, k) => k % 2 === 0), home = overnight.filter((_, k) => k % 2 === 1);
        ok('overnight: out on days 1 and 3 with the revenue, the flying, the fuel and the £500 crew; home on days 2 and 4 with none of them', out.every(x => !x.home && x.rev > 0 && x.run > 0 && x.fuelL === 14740 && x.crew === 500) && home.every(x => x.home && x.rev === 0 && x.run === 0 && x.fuelL === 0 && x.crew === 0), overnight);
        ok('overnight: the day cost (with the rent) is paid every day', overnight.every(x => x.dayCost === 5700), overnight.map(x => x.dayCost));
        const two = await E(`fitsFor({ planeId:'b757', sched:['del', 'par'], deps:null })`); ok('overnight: no other flight fits beside it', two === false, two);
        await E(`(() => { const k = ${keep}, f = S.fleet[${j}]; f.schedule = k.s; f.route = k.s[0]; f.deps = k.d; delete f.rot; refreshPlan(); render(); return 1; })()`); await p.waitForTimeout(150);
        growth = await E("[growthOf(routeById('nyc'), S.round), growthOf(routeById('nyc'), beatAt(127)), seasonMult(routeById('dxb'), S.round), seasonMult(routeById('nyc'), S.round), +seasonOverrideFactor(routeById('dxb'), S.day).toFixed(3), +(demandMult(routeById('dxb'), S.day) / lhDemandMult0(routeById('dxb'), S.day)).toFixed(3)]");
        ok('growth: New York is ×1.05 in its second week (×1 in the opening week)', growth[0] === 1.05 && growth[1] === 1, growth);
        ok('seasons: Dubai\'s winter override ×1.2 replaces the archetype\'s winter ×0.9 in the day\'s demand (×1.2 ÷ 0.9); New York keeps ×0.9', growth[2] === 1.2 && growth[3] === 0.9 && growth[4] === 1.333 && growth[5] === 1.333, growth); }
      if(await vis('#s2Back')){ await p.click('#s2Back'); await p.waitForTimeout(100); }
      await shot(`c2-d${day}-plan`); const en = await p.$eval('#nx', e => !e.disabled).catch(() => false); ok(`plan ${day}: continue enabled`, en); if(!en) break; await p.click('#nx'); continue; }
    if(t === 'workings' && await vis('.so-page')){ await shot(`c2-d${day}-signoffs`);
      if(day === 127){ const W = JSON.parse(await E("JSON.stringify(Object.values(soWeek(false).items).map(it => [it.key, it.level, it.point]))")); info.week19 = W; const calc = W.filter(x => x[1] === 'calc').map(x => x[0]);
        // v5.2 (D76): chapter 1 is buy only, so rent-or-buy is first met here and takes a Calculate slot
        ok(`day 127: the cap of three: rent-or-buy (first met: chapter 1 is buy only), the long-haul tickets (estimated first) and ${TYPE === 'value' ? 'the bag fee are Calculate; the long-haul fuel and' : 'the long-haul fuel are Calculate;'} the full 757 (seats × fare) are Build`, calc.length === 3 && calc.includes('rb|b757') && calc.includes('tk|nyc') && (TYPE === 'value' ? calc.includes('bag|nyc') && W.some(x => /^fc\|b757\|nyc/.test(x[0]) && x[1] === 'build') : calc.some(k => /^fc\|b757\|nyc/.test(k))) && W.some(x => x[0] === 'sf|b757' && x[1] === 'build'), W);
        ok('day 127: the long-haul ticket card asks for an estimate first', await vis('[data-sopre="tk|nyc"]') && /Round each number: 200 is about 200 and £510 is about £500/.test(await txt('[data-socard="tk|nyc"]')), await txt('[data-socard="tk|nyc"]'));
        if(TYPE === 'value') ok('day 127: the bag fee card: 4 tenths of 200 passengers, then × £20', /4 tenths of 200 passengers/.test(await txt('[data-socard="bag|nyc"]')), await txt('[data-socard="bag|nyc"]')); }
      await signs('work ' + day); await p.waitForTimeout(500); await p.click('#nx'); await p.waitForTimeout(80); continue; }
    if(t === 'workings'){ await solveW(); await p.click('#nx'); continue; }
    if(t === 'fuelDesk'){ await shot(`c2-d${day}-fueldesk`); const bn = await p.$('[data-fdb="2"]:not([disabled])'); if(bn){ await bn.click(); await p.waitForTimeout(60); if(await p.$('#fdSignChk')){ const one = await E('(fuelBlock() * fuelOn(S.day)).toFixed(2)'); await p.fill('[data-fds="one"]', one); if(await p.$('[data-fds="all"]')) await p.fill('[data-fds="all"]', (one * 2).toFixed(2)); await p.click('#fdSignChk'); await p.waitForTimeout(60); } if(await p.$('#fdBuy:not([disabled])')) await p.click('#fdBuy'); await p.waitForTimeout(80); } await p.click('#nx'); continue; }
    if(t === 'audit'){ await shot(`c2-d${day}-audit`); await signs('audit ' + day); await p.click('#nx'); continue; }
    if(t === 'rop'){ ok('no second regular-plan approval in chapter 2', false, day); await p.click('#ropGo'); continue; }
    if(t === 'milestone'){ await p.click('#msGo'); continue; }
    if(t === 'review'){ await shot(`c2-d${day}-review`); if(await vis('.rbw')) await builds(); if(await p.$('#calcDone')) await p.click('#calcDone');
      if(!(await p.$eval('#nx', e => !e.disabled).catch(() => false))){ ok(`review ${day}: the review's sums can be signed`, false, await E('JSON.stringify({ rb:typeof rbPlan === "function" ? rbPlan() : null, rbw:!!document.querySelector(".rbw"), cards:[...document.querySelectorAll("[data-rbcard]")].map(e => e.getAttribute("data-rbcard")) })')); await shot(`c2-d${day}-review-stuck`); break; }
      await p.click('#nx'); continue; }
    if(t === 'sim'){ for(let k = 0; k < 200 && await T() === 'sim'; k++) await p.waitForTimeout(150); continue; }
    if(t === 'ready'){ const en = await p.$eval('#startOps', e => !e.disabled); ok('ready ' + day, en); if(!en){ await shot(`c2-d${day}-ready-stuck`); break; } await p.click('#startOps'); continue; }
    if(t === 'takeoff'){ await p.click('#toGo'); for(let k = 0; k < 200 && await p.$eval('#nx', e => e.hidden); k++) await p.waitForTimeout(100); await p.click('#nx'); continue; }
    if(t === 'fly'){ for(let k = 0; k < 80 && await T() === 'fly'; k++) await p.waitForTimeout(250); continue; }
    if(t === 'results'){ await shot(`c2-d${day}-results`); await p.click('#nx'); continue; }
    if(t === 'weekRun'){ const d0 = day;
      if(d0 === 128 && !info.d128){   // Balance Report v5.0 §2: the 757 on New York at £510, every line from the engine
        const live = JSON.parse(await E('JSON.stringify(lhServiceDay(null))')), full = JSON.parse(await E('JSON.stringify(lhServiceDay(null, 200))')), why = JSON.parse(await E("JSON.stringify((() => { const r = routeById('nyc'), n = S.round; return { table:tableAt(r, 510), growth:growthOf(r, n), season:seasonMult(r, n), dayMult:+demandMult(r, S.day).toFixed(4), plainDay:+demandMult0(r, S.day).toFixed(4), news:newsOn('nyc', S.day).map(x => x.id + ' ×' + x.mult + ' ' + x.segment), want:paxWant(r, 510), rep:S.rep, repFactor:repFactor(), demandAt:demandAt(r, 510), dxb:[tableAt(routeById('dxb'), 490), demandAt(routeById('dxb'), 490)] }; })())")); info.d128 = { live, full, why, crew:JSON.parse(await E("JSON.stringify((() => { const fl = planFlights(), X = dayExtras(fl); return { crew:X.crew, lhCrew:X.lhCrew, crewOn:crewOn(), duty:S.fleet.map(f => [f.planeId, dutyMin(planeById(f.planeId), schedOf(f))]), limit:WORLD.crewDutyMin, perPlane:WORLD.crewCost }; })())")) };
        info.bags = JSON.parse(await E("JSON.stringify((() => { const X = dayExtras(planFlights()); return { bags:X.bags, bagRev:X.bagRev, nyc:(X.byRoute.nyc || {}).bags, nycPax:(X.byRoute.nyc || {}).pax }; })())"));
        if(TYPE === 'value') ok('Value: the Bags line: passengers × 4 tenths × £20 on every route (New York: 200 × 0.4 = 80 bags × £20 = £1,600)', info.bags.nyc === 80 && info.bags.nycPax === 200 && info.bags.bagRev === info.bags.bags * 20 && info.bags.bags > 80, info.bags);
        else ok(`${TYPE}: no bag fee`, !info.bags.bagRev, info.bags);
        ok('Balance Report v5.0 §2: a full 757 to New York at £510 makes £47,426 a day (within £10)', full && Math.abs(full.profit - 47426) <= 10, full);
        ok('the lines: 12,375 L at £2.17, 12.5 h at £1,600, landing £520, £5 a passenger, £500 crew, £4,200 day cost, £1,500 rent', full && full.fuelL === 12375 && full.ppl === 2.17 && full.fly === 20000 && full.land === 520 && full.pax === 1000 && full.crew === 500 && full.day === 4200 && full.rent === 1500, full);
        await shot('c2-08-day128-board'); }
      for(let k = 0; k < 150 && await T() === 'weekRun' && (await S()).day === d0; k++) await p.waitForTimeout(150); continue; }
    if(t === 'weekReview' && await vis('.rbw')){ await shot(`c2-d${day}-weekreview`); if(day === 133){ const x = await txt('#screen'); ok('day 133: the first long-haul week\'s review: the seven days, the total and projected − actual', /How did week 19 go/.test(x), x.slice(0, 160)); }
      await builds(); await p.waitForTimeout(80); await p.click('#nx'); continue; }
    if(t === 'weekReview'){ await p.click('#nx'); continue; }
    if(t === 'chapter'){ await p.click('#chGo'); continue; }
    checks.push('stopped at ' + t + ' day ' + day); await shot('c2-stop'); break; }
  s = await S(); checks.push('end at ' + await T() + ' day ' + s.day + ' cash ' + Math.round(s.cash));
  if(process.env.SAVE){ fs.writeFileSync(process.env.SAVE, await p.evaluate(() => window.__sim.saveCode())); checks.push('info save code written to ' + process.env.SAVE); }
  const HH = (s.history || []).filter(h => h.from >= 127), wk19 = HH.filter(h => h.from >= 127 && h.to <= 133);
  ok('the opening week flew a day at a time (days 127–133)', wk19.length === 7 && wk19.every(h => h.type === 'day'), wk19.map(h => h.from));
  if(s.day >= 148) ok('then the weeks (13 and 20 January)', HH.some(h => h.type === 'week' && h.from === 134) && HH.some(h => h.type === 'week' && h.from === 141), HH.map(h => h.type + ' ' + h.from));
  const lh = []; for(let d = 127; d <= Math.min(133, s.day - 1); d++) lh.push(Math.round((s.ledger.rev[d] || 0) - (s.ledger.cost[d] || 0)));
  info.opening = { days:lh, total:lh.reduce((a, b) => a + b, 0), cash127:cash118 }; info.type = JSON.parse(await p.evaluate(() => window.__sim.evalIn('JSON.stringify(typeReport())')));
  ok('the first long-haul ticket sum and fuel line are done, so later weeks go back to the cap and decay', s.day < 134 || (info.type.ch2so && info.type.ch2so.tk === 127 && info.type.ch2so.fuel === 127), info.type.ch2so);
  if(TYPE === 'value') ok('the bag fee was worked by hand once: the model does it from now on', (s.skills && s.skills.bagFee && s.skills.bagFee.count === 1) || s.day < 128, s.skills && s.skills.bagFee);
  checks.push('info ' + JSON.stringify(info));
  console.log(checks.join('\n')); console.log('OVERFLOW', overflow.length ? overflow : 'none'); console.log('ERRORS', errors.length ? errors : 'none');
  await b.close();
})();
