// Run: NODE_PATH=<playwright node_modules> CODE=<file> TYPE=value|premium node chapter3.test.js   (env: UPTO day (default 800: the chapter 3 review), SHOTS=0, OUT, W, H, SAVE)
// Workbook v5.4 (D78–D81): chapter 3 "Owning", push 1. CODE is a save at chapter 2's end card (day 364), written by:
//   TYPE=<type> SAVE=<file> node chapter2.test.js
// The pupil carries on the next day, Monday 1 September 2031 (no day flies by itself). Checked: the end card's button, the
// set-up week a day at a time (days 365–371), the overdraft offer from its EventOptions rows (Value accepts, Premium
// declines), the time to afford in weeks (Calculate on day 365; Build later), buying a rented plane (Value, its 757, on day 365:
// the rent stops that day; the negative-cash sum with a forced cash level), handing a lease back (Premium, its 757, at the
// end of September: gone from 1 October), the overdraft's blocks (a purchase, the fuel desk), "Overdrawn £X of £Y", two
// month-ends overdrawn making the audit a board review, Tokyo and Cape Town overnight, Singapore from day 421, Sydney shut
// (push 2), the missed-h1 £2,000 (Premium) until the first audit, then months to the review on 31 August 2032: the year-2
// accounts with the average month, the A380 offer and the end card naming chapter 4.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const FILE = 'file://' + path.resolve(__dirname, '../../..', process.env.GAME || 'airline-opening-prototype.html'), OUT = (process.env.OUT || os.tmpdir() + '/airline-ch3') + '/'; fs.mkdirSync(OUT, { recursive:true });
const W = +(process.env.W || 1680), H = +(process.env.H || 940), SHOTS = process.env.SHOTS !== '0', UPTO = +(process.env.UPTO || 800), TYPE = process.env.TYPE || 'value';
const CODE = process.env.CODE || path.join(os.tmpdir(), `airline-ch2-end-${TYPE}.txt`);
if(!fs.existsSync(CODE)){ console.log(`No save code at ${CODE}. Make one: TYPE=${TYPE} SAVE=${CODE} node chapter2.test.js`); process.exit(1); }
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport:{ width:W, height:H } })).newPage();
  const errors = [], checks = [], overflow = [], info = {};
  p.on('pageerror', e => errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if(m.type() === 'error') errors.push('console: ' + m.text()); }); p.on('dialog', d => d.accept());
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { const st = window.__sim.settings(); st.flightSecs = 0.25; st.autoWall = false; st.opsSound = false; });
  const T = () => p.evaluate(() => window.__sim.step().t), S = () => p.evaluate(() => window.__sim.S()), E = src => p.evaluate(s => window.__sim.evalIn(s), src), J = async src => JSON.parse(await E(`JSON.stringify(${src})`));
  const ok = (name, cond, x) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (x !== undefined ? ' ' + JSON.stringify(x) : ''));
  const shot = async n => { if(!SHOTS) return; await p.waitForTimeout(150); await p.screenshot({ path:OUT + n + '.png' }); };
  const vis = sel => p.evaluate(s => !!document.querySelector(s), sel);
  const txt = async sel => (await p.$eval(sel, e => e.textContent).catch(() => '')).replace(/\s+/g, ' ').trim();
  const fits = async tag => { const r = await p.evaluate(() => { const bad = []; document.querySelectorAll('.tf-body,#screen,.ws-rail,.sheet1,.wk,.st-tt,.st-top').forEach(e => { if(e.scrollHeight > e.clientHeight + 2) bad.push((e.className || e.id).split(' ')[0] + ' ' + e.scrollHeight + '>' + e.clientHeight); }); return bad; }); if(r.length) overflow.push(tag + ': ' + r.join(', ')); };
  const practice = async () => { for(let i = 0; i < 3; i++){ const a = await p.evaluate(() => window.__sim.practiceAnswer()); if(!a || !(await p.$('#pqIn'))) break; await p.fill('#pqIn', a.text); await p.click('#pqCheck'); await p.waitForTimeout(1050); } };
  const builds = async () => { const done = []; for(let g = 0; g < 14; g++){ const P = await E('rbPlan()'); if(!P) break;
      if(P.seq){ for(const x of P.seq) await p.click(['+', '−', '×', '÷'].includes(x) ? `[data-rbop="${P.id}|${x}"]` : `[data-rbfig="${P.id}|${x}"]`); }
      else { await p.click(`[data-rbop="${P.id}|${P.op}"]`); await p.fill(`[data-rbdiv="${P.id}"]`, String(P.div)); }
      await p.click(`[data-rbchk="${P.id}"]`); await p.waitForTimeout(80); done.push(P.id); } return done; };
  const signs = async tag => { const done = []; for(let g = 0; g < 14; g++){ const P = await E('soPlan()'); if(!P) break;
      if(P.rb){ await p.click(`[data-rbop="${P.rb.id}|${P.rb.op}"]`); await p.fill(`[data-rbdiv="${P.rb.id}"]`, String(P.rb.div)); await p.click(`[data-rbchk="${P.rb.id}"]`); await p.waitForTimeout(80); done.push('rb:' + P.rb.id); continue; }
      const k = P.key.replace(/"/g, '\\"');
      if(P.pre){ await p.fill(`[data-sopre="${k}"]`, P.pre); await p.click(`[data-soprechk="${k}"]`); await p.waitForTimeout(80); done.push('pre:' + P.key + '=' + P.pre); }
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
  const R3 = () => J('ch3Report()');
  /* the weekly time-to-afford card: a Query on each step, then the answers (Calculate), or the Build tokens */
  const taw = async (tag, level) => { const F = await J('UI.taF');
    if(level === 'calc'){
      await p.fill('[data-pad="ta1"]', String(F.price + F.cash)); await p.click('#ta1Chk'); await p.waitForTimeout(60);
      ok(`${tag}: step 1, adding is a Query`, /that adds them/.test(await txt('.ta-card')), await txt('.ta-card .sc-msg'));
      await p.fill('[data-pad="ta1"]', String(F.still)); await p.click('#ta1Chk'); await p.waitForTimeout(60);
      const bt = await p.$('[data-pad="ta2"] ~ .pad-btn, .ta-card .pad-btn'); if(bt){ await bt.click(); await p.waitForTimeout(80); const I = await J(`padInfo('[data-pad="ta2"]')`); ok(`${tag}: the Working pad sets out still to save ÷ profit a week`, I && I.op === '÷', I); await p.keyboard.press('Escape'); }
      if(F.weeks > Math.floor(F.exact + 1e-9)){ await p.fill('[data-pad="ta2"]', String(Math.floor(F.exact + 1e-9))); await p.click('#ta2Chk'); await p.waitForTimeout(60); ok(`${tag}: step 2, rounding down is a Query`, /round up/.test(await txt('.ta-card')), await txt('.ta-card .sc-msg')); }
      await p.fill('[data-pad="ta2"]', String(F.weeks)); await p.click('#ta2Chk'); await p.waitForTimeout(80);
    } else { await p.click('[data-tafig="price"]'); await p.click('[data-taop="÷"]'); await p.click('[data-tafig="rate"]'); await p.click('#taBuildChk'); await p.waitForTimeout(60);
      ok(`${tag}: Build, the whole price ÷ the profit is a Query (use what is still to save)`, /already have some cash/.test(await txt('.ta-card')), await txt('.ta-card .sc-msg'));
      await p.click('[data-taclr="1"]'); await p.click('[data-tafig="still"]'); await p.click('[data-taop="÷"]'); await p.click('[data-tafig="rate"]'); await p.click('#taBuildChk'); await p.waitForTimeout(80); }
    const done = await vis('.ta-card.ok'); ok(`${tag}: the time to afford in weeks is signed off (${level}): (${F.price} − ${F.cash}) ÷ ${F.rate} = ${F.weeks} weeks`, done && F.unit === 'week' && F.weeks === Math.ceil(F.still / F.rate - 1e-9), F); return F; };

  // ---------- chapter 2's end card ----------
  const code = fs.readFileSync(CODE, 'utf8').trim();
  await p.evaluate(c => { const s = window.__sim.loadCode(c); window.__sim.setS(s); window.__sim.landSave(); window.__sim.render(); }, code);
  let s = await S(); info.start = { day:s.day, step:await T(), cash:Math.round(s.cash), fleet:s.fleet.map(f => [f.planeId, f.terms ? f.terms.kind : null, f.terms && f.terms.daily || null]) };
  ok("the save is at chapter 2's end (day 364)", s.day === 364, info.start);
  if(await T() !== 'protoEnd'){ await E("(S.si = S.steps.findIndex(x => x.t === 'protoEnd'), render(), 1)"); await p.waitForTimeout(150); }
  ok('chapter 2 complete: the card says chapter 3, Owning, opens on Monday 1 September 2031, with On to chapter 3', await vis('#peNext') && /On to chapter 3/.test(await txt('#peNext')) && /chapter 3, Owning, opens on Monday 1 September 2031/.test(await txt('.proto-end')) && !/not built yet/.test(await txt('.proto-end p.muted')), await txt('.proto-end p.muted'));
  await shot('c3-01-chapter2-end'); await p.click('#peNext'); await p.waitForTimeout(200);
  s = await S(); ok('day 365 is a day beat of chapter 3 (no day flies by itself)', s.day === 365 && s.period && s.period.type === 'day' && (await J('roundData(S.round).chapterNo')) === 3, [s.day, s.period]);
  const routes365 = await J('openRoutes(365).map(r => r.id)'), routes421 = await J('[openRoutes(420).map(r => r.id).includes("sin"), openRoutes(421).map(r => r.id).includes("sin"), openRoutes(700).map(r => r.id).includes("syd")]');
  ok('Tokyo and Cape Town open on day 365; Singapore on day 421 (27 October); Sydney stays shut until push 2', routes365.includes('tyo') && routes365.includes('cpt') && !routes365.includes('sin') && routes421[0] === false && routes421[1] === true && routes421[2] === false, [routes365, routes421]);
  ok('the floor before the offer: £0 (the £1,000 reserve ends on 31 August)', (await J('cashFloor()')) === 0, await J('cashFloor()'));
  if(TYPE === 'premium'){ const c = await J('[Math.round(S.cash), Math.round(shownCash()), h1Off()]'); ok('missed h1: from day 365 the cash figure reads £2,000 high (missedHuntH1Effect)', c[1] - c[0] === 2000 && c[2] === 2000, c); info.h1 = c; }

  // ---------- chapter 3 ----------
  const seen = {}; let lastDay = 0;
  for(let i = 0; i < 1500; i++){ const t = await T(); s = await S(); const day = s.day;
    if(day >= UPTO && t === 'hq'){ checks.push('stopped at hq day ' + day); break; }
    if(t === 'hq'){ if(day === 365 && !seen.hq365){ seen.hq365 = true; const x = await txt('#screen'); ok('day 365: HQ opens chapter 3 with Tokyo and Cape Town', /Tokyo and Cape Town open/.test(x), x.slice(0, 240)); await shot('c3-02-day365-hq');
        if(TYPE === 'premium'){ const c = await txt('#cCash'); ok('missed h1: the header shows the cash £2,000 high', c === (await E('money(Math.round(S.cash + 2000))')), c); } }
      if(day > 395 && TYPE === 'premium' && !seen.h1fixed){ seen.h1fixed = true; const R = await R3(); ok('missed h1: corrected at the first month-end audit (30 September), and the header shows the true cash', R.h1 && R.h1.fixed && R.shown === R.cash && (await txt('#cCash')) === (await E('money(Math.round(S.cash))')), R.h1); }
      await fits('hq ' + day); lastDay = day; await p.click('#startDay'); continue; }
    if(t === 'intro'){ if(day === 365 && !seen.intro){ seen.intro = true; const x = await txt('#screen'); ok("day 365: What's new: buying big planes and the overdraft", /Buying big planes, and the overdraft/.test(x), x.slice(0, 200)); await shot('c3-03-intro'); }
      for(let pg = 0; pg < 2; pg++) if(await p.$('#niNext')) await p.click('#niNext'); if(await p.$('#pqIn')) await practice();
      const n = (await p.$$('[data-ni]')).length; for(let k = 0; k < n && await p.$eval('#nx', e => e.disabled); k++) await p.click(`[data-ni="${k}"]`); await p.click('#nx'); continue; }
    if(t === 'event'){ const ev = await J("(({ id, options }) => ({ id, labels:options.map(o => o.label), other:options.map(o => o.other || null) }))(S.rnd.event)"); await shot(`c3-d${day}-event-${ev.id}`);
      if(ev.id === 'overdraft_offer'){ const rows = await J("WB.eventOptions.overdraft_offer.map(r => r.label)");
        ok('day 365: the bank offers an overdraft: the two EventOptions rows (accept / decline for now)', JSON.stringify(ev.labels) === JSON.stringify(rows) && rows.length === 2, ev.labels);
        const k = TYPE === 'premium' ? 1 : 0; await p.click(`[data-o="${k}"]`); await p.click('#nx'); await p.waitForTimeout(80); const R = await R3(); info.od = R.od;
        if(k === 0) ok("Value accepts: the limit is one week's average profit (the last 28 days ÷ 4, to £100) and the floor is −limit", R.od.on && R.od.limit > 0 && R.od.limit === (await J('odLimitNow()')) && R.floor === -R.od.limit, R.od);
        else ok('Premium declines for now: no overdraft, cash cannot go below £0', !R.od.on && R.od.declined === 365 && R.floor === 0, R.od);
        if(await T() === 'event') await p.click('#nx'); continue; }
      await p.click('[data-o="1"]').catch(() => p.click('[data-o="0"]')); await p.click('#nx'); await p.waitForTimeout(80); if(await T() === 'event') await p.click('#nx'); continue; }
    if(t === 'afford3'){ await shot('c3-04-afford3'); const pid = await J('step().pid || taTargetW()'); ok('day 365: the time to afford in weeks, for the cheapest plane he cannot buy yet', !!pid && /How many weeks until we can afford/.test(await txt('.ta-card')), pid);
      await taw('day 365', 'calc'); await shot('c3-05-afford3-done'); ok('day 365: after the sum comes the plan, not the air show', /Next: the plan/.test(await txt('#nx')) && !/air show/i.test(await txt('#screen')), await txt('#nx')); const sk = (await R3()).skills.taw; ok('the weekly sum counts as a Calculate in the skills, and in the pupil record', sk && sk.count === 1 && (await J("rec().entries.some(e => /^taw:/.test(e.key))")), sk);
      await p.click('#nx'); continue; }
    if(t === 'shop2'){ await shot(`c3-d${day}-shop`);
      if(day === 365){ const has = await p.$$eval('[data-pick]', es => es.map(e => e.getAttribute('data-pick'))); ok('day 365: the A340, 777 and A350 are in the shop, and the jets cost twice as much (787 £12m)', ['a340', 'b777', 'a350'].every(x => has.includes(x)) && (await J("shopOffer(planeById('b787')).price")) === 12000000, has); }
      if(day === 365 && TYPE === 'premium'){ await p.click('[data-pick="b787"]'); await p.waitForTimeout(400); await p.click('#nx'); continue; }   // Premium rents a 787 for Tokyo
      if(day > 394 && TYPE === 'premium' && !seen.buildTa){ seen.buildTa = true; await p.click('[data-pick="a350"]'); await p.waitForTimeout(400); await p.click('#nx'); continue; }
      await p.click('#skipShop'); continue; }
    if(t === 'fleetSums'){ await shot(`c3-d${day}-fleetsums`); if(await vis('.so-page')){ const d = await signs('fleetSums ' + day); const pid = await E('S.rnd.shopPick'); ok(`rent or buy at jet prices (${pid}): 2,000 days, signed off (a Calculate the first time it is met, then Build under the cap)`, d.some(x => /^(calc|build):rb\|/.test(x) && x.endsWith('|' + pid)) && (await J(`Math.round(shopOffer(planeById('${pid}')).price / shopOffer(planeById('${pid}')).lease)`)) === 2000, d); await p.click('#nx'); continue; }
      await solveW(); await p.click('#nx'); continue; }
    if(t === 'acquire'){ await shot(`c3-d${day}-acquire`); if(await vis('.so-page')){ await signs('acquire ' + day); await p.click('#nx'); continue; }
      if(await vis('.ta-card') && !(await vis('.ta-card.ok'))){ await taw(`day ${day}: the A350 on the Buy-or-rent page`, 'build'); await shot(`c3-d${day}-acquire-build`);
        ok('Build: the weekly sum is signed as a Build', ((await R3()).skills.taw || {}).builds >= 1, (await R3()).skills.taw);
        ok('the A350 cannot be bought: over the cash (and no overdraft)', await p.$eval('[data-terms="buy"]', e => e.disabled).catch(() => true));
        await p.click('#taSave'); await p.waitForTimeout(80); ok('Save for the A350: the countdown in weeks', /Saving for the (Airbus )?A350: .* week/.test(await E('waitLine()')), await E('waitLine()')); }
      if(day === 365 && TYPE === 'premium'){ ok('day 365: the 787 can be bought (£12m) or rented (£6,000 a day); Premium rents it', !(await p.$eval('[data-terms="lease"]', e => e.disabled))); await p.click('[data-terms="lease"]'); await p.click('#nx'); await p.waitForTimeout(100); continue; }
      await p.click('#noBuy'); continue; }
    if(t === 'paint'){ await p.click('#roll'); continue; }
    if(t === 'reveal'){ await p.click('#skipReveal', { timeout:2000 }).catch(() => {}); for(let k = 0; k < 50 && await p.$eval('#nx', e => e.hidden); k++) await p.waitForTimeout(100); await p.click('#nx'); continue; }
    // the shop never opens by itself (Bertie, 14 Oct): the test pupil opens it from the Fleet desk on day 365 and, for Premium, on a plan day after 394 for the A350
    if(t === 'plan' && ((day === 365 && !seen.shop365) || (day > 394 && TYPE === 'premium' && !seen.buildTa && !seen['shop' + day]))){ seen['shop' + day] = true; if(day === 365) seen.shop365 = true;
      await p.click('[data-nav="fleet"]'); await p.waitForTimeout(150);
      if(day === 365){ await shot('c3-04b-fleet-desk'); const so = await J('shopOfferedReport()'); ok('day 365: no air show by itself; the big planes are on the Fleet desk, and the brief says so', !so.scheduled && /A350/.test(await txt('.fs-shop')) && so.brief.some(l => /On the Fleet desk from today: .*A350/.test(l)), [so, await txt('.fs-shop')]); }
      await p.click('#fleetShop'); await p.waitForTimeout(150); continue; }
    if(t === 'plan'){ await fits('plan ' + day); if(await vis('#s2Edit')){ await p.click('#s2Edit'); await p.waitForTimeout(100); }
      if(day === 365 && !seen.d365){ seen.d365 = true;
        // the overnight rotation to Tokyo, tried on the rented long-haul plane: out on day 1 (lands +9 h), home on day 2
        const j = await J("S.fleet.findIndex(f => f.terms && f.terms.kind === 'lease')"), keep = await E(`JSON.stringify({ s:S.fleet[${j}].schedule, d:S.fleet[${j}].deps })`);
        const rot = await J(`dryRun(() => { const f = S.fleet[${j}]; f.schedule = ['tyo']; f.route = 'tyo'; f.deps = [390]; delete f.rot; return [0, 1].map(k => withDay(S.day + k, () => { const fl = planFlights().filter(x => x.uid === f.uid); return { home:fl.some(x => x.homeLeg), rev:fl.reduce((t, x) => t + x.revenue, 0), arr:fl.map(x => x.localArr !== undefined ? fmtTime(x.localArr) : null)[0] }; })); })`);
        ok('Tokyo is an overnight route (rotation 2 days): out with the fares on day 1, home on day 2, landing in Tokyo time', rot[0].rev > 0 && !rot[0].home && rot[1].home && rot[1].rev === 0, rot); info.tyo = rot;
        await E(`(() => { const k = ${keep}, f = S.fleet[${j}]; f.schedule = k.s; f.route = k.s[0]; f.deps = k.d; delete f.rot; refreshPlan(); return 1; })()`);
        // the Fleet desk: buy the rented plane (Value) or hand it back at the end of September (Premium)
        await E("(UI.view = 'fleet', render(), 1)"); await p.waitForTimeout(150); await shot('c3-06-fleet-desk');
        const lease = await J("S.fleet.filter(f => f.terms && f.terms.kind === 'lease').map(f => ({ uid:f.uid, plane:f.planeId, daily:f.terms.daily }))"); info.leases = lease;
        ok('the Fleet desk: each rented plane has Buy it (list price) and Hand back on 30 Sep', lease.length > 0 && await vis(`[data-buyleased="${lease[0].uid}"]`) && /Hand back on (\w{3} )?30 Sep/.test(await txt(`[data-handback="${lease[0].uid}"]`)), lease);
        const L = lease.find(x => x.plane === 'b757') || lease[0];
        if(TYPE === 'value'){
          const price = await J(`shopOffer(planeById('${L.plane}')).price`), lim = await J('S.od.limit'), cash0 = await J('S.cash'), dip = Math.round(cash0 - price + lim / 2);   // a forced cash level: buying leaves −half the limit
          await E(`(S.cash = S.cash - ${dip}, render(), 1)`); await p.click(`[data-buyleased="${L.uid}"]`); await p.waitForTimeout(150); await shot('c3-07-buy-rented');
          ok('Buy the plane you rent: the list price, the rent, rent-or-buy days, and the cash after as a sum (it goes below zero)', /Buy the .* you rent/.test(await txt('#screen')) && await vis('[data-pad="negcash"]') && await p.$eval('#odbBuy', e => e.disabled), await txt('.acq-lead'));
          const after = Math.round((await J('S.cash')) - price); await p.fill('[data-pad="negcash"]', String(-after)); await p.click('#negChk'); await p.waitForTimeout(60);
          ok('negative cash: the right size without the minus sign is a Query', /Put a minus sign/.test(await txt('.neg-card')), await txt('.neg-card .sc-msg'));
          await p.fill('[data-pad="negcash"]', '−' + String(-after).replace(/\B(?=(\d{3})+(?!\d))/g, ',')); await p.click('#negChk'); await p.waitForTimeout(60);
          ok(`negative cash: ${after} signed off (NCP-3-03), and Buy is enabled`, await vis('.neg-card.ok') && await p.$eval('#odbBuy', e => !e.disabled), await txt('.neg-card'));
          await p.click('#odbBuy'); await p.waitForTimeout(150); await E(`(S.cash = S.cash + ${dip}, render(), 1)`);
          const R = await R3(), f = R.fleet.find(x => x.uid === L.uid);
          ok(`Value buys its rented ${L.plane} on day 365: terms buy (was a lease), the rent stops that day (£0 a day), cash down by the price`, f && f.kind === 'buy' && f.was === 'lease' && f.daily === 0 && Math.round(R.cash) === Math.round(cash0 - price) && R.log.some(x => x.what === 'buyLeased' && x.day === 365), { f, cash:R.cash, cash0:Math.round(cash0), price });
          info.bought = { plane:L.plane, price, rent:L.daily, day:365 };
          // the overdraft's blocks: a purchase beyond the floor; the fuel desk at the limit; "Overdrawn £X of £Y"
          ok('a purchase beyond the overdraft is blocked: the A350 cannot be bought', (await J("shopOffer(planeById('a350')).canBuy")) === false);
          const blk = await J("(() => { const keep = S.cash, lim = S.od.limit, P = fuelOn(S.day); S.cash = -lim + Math.round(fuelBlock() * P / 2); const a = fdMaxBlocks(P); S.cash = -lim + Math.round(fuelBlock() * P * 2.5); const b = fdMaxBlocks(P); S.cash = keep; return [a, b, Math.floor(tankSpace() / fuelBlock() + 1e-9)]; })()");
          ok('the fuel desk at the limit: no block that would go beyond −limit (0 blocks half a block above it, 2 blocks at two and a half, if the tank has room)', blk[0] === 0 && blk[1] === Math.min(2, blk[2]), blk);
          await E("(S.keepCash = S.cash, S.cash = -Math.round(S.od.limit / 2), UI.view = 'finance', render(), 1)"); await p.waitForTimeout(150); await shot('c3-08-overdrawn');
          const st = await txt('.od-st'), hd = await txt('.dk-cash');
          ok('overdrawn: the statement and the header say "Overdrawn £X of £Y"', /Overdrawn £[\d,]+ of £[\d,]+/.test(st) && /Overdrawn £[\d,]+ of £[\d,]+/.test(hd), [st.slice(0, 120), hd]);
          await E("(S.cash = S.keepCash, delete S.keepCash, 1)");
          const bd = await J("(() => { const H = S.history; S.history = H.concat([{ type:'month', from:372, to:394, cash:-2000, pax:0, seats:0, profit:-1, revenue:0, costs:1, routes:{} }, { type:'month', from:395, to:425, cash:-1000, pax:0, seats:0, profit:-1, revenue:0, costs:1, routes:{} }]); try{ const D = soAuditData(425), D1 = (S.history[S.history.length - 2].cash = 500, soAuditData(425)); return { board:D.board, overdrawn:D.overdrawn, one:D1.board && !!D1.overdrawn }; } finally { S.history = H; } })()");
          ok('two month-ends overdrawn (30 Sep and 31 Oct) make the October audit a board review (D64); one is not enough', bd.board === true && bd.overdrawn && bd.overdrawn.length === 2 && bd.one === false, bd);
        } else {
          await E("(UI.view = null, render(), 1)"); await p.waitForTimeout(150); if(await vis('#s2Edit')){ await p.click('#s2Edit'); await p.waitForTimeout(100); }
          const k = await J("S.fleet.findIndex(f => f.planeId === 'b787')"); await p.selectOption(`[data-addsel="0|${k}"]`, 'tyo').catch(() => {}); await p.waitForTimeout(150);
          const blk = await p.$eval(`[data-tl^="0|${k}|"]`, e => ({ cls:e.className, note:(e.querySelector('.s2-lh') || {}).textContent || '' })).catch(() => null);
          ok('day 365: Tokyo on the rented 787 is an overnight block ("earns every second day"), landing in Tokyo time', blk && /\bovn\b/.test(blk.cls) && /earns every second day/.test(blk.note) && /Tokyo time/.test(blk.note), blk); await shot('c3-06b-tokyo-787');
          if(await vis('#s2Back')){ await p.click('#s2Back'); await p.waitForTimeout(100); }
          await E("(UI.view = 'fleet', render(), 1)"); await p.waitForTimeout(150);
          await p.click(`[data-handback="${L.uid}"]`); await p.waitForTimeout(120); await shot('c3-07-hand-back');
          const R = await R3(), f = R.fleet.find(x => x.uid === L.uid); info.handBack = { plane:L.plane, uid:L.uid, rent:L.daily, on:f && f.returnOn };
          ok(`Premium hands its rented ${L.plane} back at the end of September (30 Sep, day 394): it flies and pays rent until then`, f && f.returnOn === 394 && f.daily === L.daily && /Going back on (\w{3} )?30 Sep/.test(await txt('.fa-own')), f);
          ok('without an overdraft a purchase that would take cash below £0 is blocked (the 777)', (await J("shopOffer(planeById('b777')).canBuy")) === false);
        }
        await E("(UI.view = null, render(), 1)"); await p.waitForTimeout(150); }
      if(day === 395 && TYPE === 'premium' && !seen.buy787){ seen.buy787 = true; const f = await J("(S.fleet.find(f => f.planeId === 'b787' && f.terms && f.terms.kind === 'lease') || {}).uid"), cash0 = await J('S.cash');
        await E("(UI.view = 'fleet', render(), 1)"); await p.waitForTimeout(150); await p.click(`[data-buyleased="${f}"]`); await p.waitForTimeout(150); await shot('c3-11-buy-rented-787');
        const okBuy = await p.$eval('#odbBuy', e => !e.disabled).catch(() => false); if(okBuy){ await p.click('#odbBuy'); await p.waitForTimeout(150); }
        const R = await R3(), g = R.fleet.find(x => x.uid === f);
        ok('Premium buys its rented 787 on 1 October for £12,000,000: the rent (£6,000 a day) stops that day', okBuy && g && g.kind === 'buy' && g.was === 'lease' && g.daily === 0 && Math.round(R.cash) === Math.round(cash0 - 12000000), { g, cash0:Math.round(cash0), cash:R.cash });
        await E("(UI.view = null, render(), 1)"); await p.waitForTimeout(150); if(await vis('#s2Edit')){ await p.click('#s2Edit'); await p.waitForTimeout(100); }
        const ov = await J("[planFlights().filter(x => x.route === 'tyo').map(x => ({ sold:x.sold, rev:Math.round(x.revenue), home:!!x.homeLeg })), [395, 396].map(d => withDay(d, () => planFlights().filter(x => x.route === 'tyo').map(x => !!x.homeLeg)[0]))]");
        ok('a planning day shows the Tokyo rotation on its way out (passengers and fares); the simulated days still alternate out and home', ov[0].length === 1 && ov[0][0].sold > 0 && !ov[0][0].home && ov[1][0] !== ov[1][1], ov); }
      if(await vis('#s2Back')){ await p.click('#s2Back'); await p.waitForTimeout(100); }
      if(await E('soBoardWaiting()')){ const ch = await E("(() => { const id = Object.keys(S.prices).find(x => routeById(x) && routeById(x).fares && routeById(x).fares.length > 1 && normPlan(currentPlan()).fleet.some(f => f.sched.includes(x))) || Object.keys(S.prices)[0], F = routeById(id).fares, i = F.indexOf(S.prices[id]); S.prices[id] = F[i > 0 ? i - 1 : i + 1]; refreshPlan(); render(); return id + ' ' + S.prices[id]; })()");
        info.board = (info.board || []).concat([day + ': ' + ch]); await p.waitForTimeout(100); if(await vis('#s2Back')){ await p.click('#s2Back'); await p.waitForTimeout(100); } }
      await shot(`c3-d${day}-plan`); const en = await p.$eval('#nx', e => !e.disabled).catch(() => false); ok(`plan ${day}: continue enabled`, en); if(!en) break; await p.click('#nx'); continue; }
    if(t === 'workings' && await vis('.so-page')){ await shot(`c3-d${day}-signoffs`); await signs('work ' + day); await p.waitForTimeout(300); await p.click('#nx'); await p.waitForTimeout(80); continue; }
    if(t === 'workings'){ await solveW(); await p.click('#nx'); continue; }
    if(t === 'fuelDesk'){ await shot(`c3-d${day}-fueldesk`); const bn = await p.$('[data-fdb="2"]:not([disabled])'); if(bn){ await bn.click(); await p.waitForTimeout(60); if(await p.$('#fdSignChk')){ const one = await E('(fuelBlock() * fuelOn(S.day)).toFixed(2)'); await p.fill('[data-fds="one"]', one); if(await p.$('[data-fds="all"]')) await p.fill('[data-fds="all"]', (one * 2).toFixed(2)); await p.click('#fdSignChk'); await p.waitForTimeout(60); } if(await p.$('#fdBuy:not([disabled])')) await p.click('#fdBuy'); await p.waitForTimeout(80); } await p.click('#nx'); continue; }
    if(t === 'audit'){ await shot(`c3-d${day}-audit`); if(TYPE === 'premium' && !seen.audit1){ seen.audit1 = true; ok('the first month-end audit of chapter 3 corrects the missed-h1 £2,000 and says why', /Correction: the year-1 accounts/.test(await txt('.so-letter')), await txt('.h1-fix')); }
      await signs('audit ' + day); await p.click('#nx'); continue; }
    if(t === 'rop'){ ok('no regular-plan approval in chapter 3', false, day); await p.click('#ropGo'); continue; }
    if(t === 'milestone'){ await p.click('#msGo'); continue; }
    if(t === 'review'){ await shot(`c3-d${day}-review`); if(await vis('.rbw')) await builds(); if(await p.$('#calcDone')) await p.click('#calcDone');
      if(!(await p.$eval('#nx', e => !e.disabled).catch(() => false))){ ok(`review ${day}: the review's sums can be signed`, false); await shot(`c3-d${day}-review-stuck`); break; }
      await p.click('#nx'); continue; }
    if(t === 'sim'){ const sg = await E('JSON.stringify(step())'); if(await p.$('#skipSim')) await p.click('#skipSim').catch(() => {}); for(let k = 0; k < 200 && await T() === 'sim' && await E('JSON.stringify(step())') === sg; k++) await p.waitForTimeout(100); continue; }
    if(t === 'ready'){ const en = await p.$eval('#startOps', e => !e.disabled); ok('ready ' + day, en); if(!en){ await shot(`c3-d${day}-ready-stuck`); break; } await p.click('#startOps'); continue; }
    if(t === 'takeoff'){ await p.click('#toGo'); for(let k = 0; k < 200 && await p.$eval('#nx', e => e.hidden); k++) await p.waitForTimeout(100); await p.click('#nx'); continue; }
    if(t === 'fly'){ for(let k = 0; k < 80 && await T() === 'fly'; k++) await p.waitForTimeout(250); continue; }
    if(t === 'results'){ await shot(`c3-d${day}-results`); await p.click('#nx'); continue; }
    if(t === 'weekRun'){ const d0 = day; for(let k = 0; k < 150 && await T() === 'weekRun' && (await S()).day === d0; k++) await p.waitForTimeout(150); continue; }
    if(t === 'weekReview' && await vis('.rbw')){ await shot(`c3-d${day}-weekreview`); await builds(); await p.waitForTimeout(80); await p.click('#nx'); continue; }
    if(t === 'weekReview'){ await p.click('#nx'); continue; }
    if(t === 'chapter'){ await p.click('#chGo'); continue; }
    if(t === 'chapterReview' && day === 730 && !seen.accounts){ seen.accounts = true; await shot('c3-09-year2-accounts'); const x = await txt('#screen');
      ok('the chapter 3 review (31 August 2032): the year-2 accounts month by month, with the average month to Build', /Owning: month by month/.test(x) && /The average month/.test(x) && (await J('chapterMonths().length')) === 12, (await J('chapterMonths().map(m => m.short)')));
      ok('what comes next: the A380 offer for chapter 4 (£18m down, then £808,000 a week), and the next investment in weeks', /The ultimate plane/.test(x) && /£18m down/.test(x) && /Next investment/.test(x) && /Chapter 4, The ultimate plane, opens on Monday 6 September 2032/.test(x), (x.match(/What comes next.{0,400}/) || [''])[0]);
      const d = await builds(); ok('the year-2 accounts are signed off: revenue, costs, profit, projected − actual and the mean', d.includes('mean') && await p.$eval('#nx', e => !e.disabled).catch(() => false), d); await p.click('#nx'); await p.waitForTimeout(150); continue; }
    if(t === 'protoEnd' || t === 'chapterReview'){ checks.push('reached ' + t + ' day ' + day); await shot('c3-10-chapter-end');
      if(day === 730) ok('the chapter 3 end card: chapter 4 (The ultimate plane) on Monday 6 September 2032, not built yet', /Next: chapter 4, The ultimate plane, opens on Monday 6 September 2032/.test(await txt('.proto-end')) && /not built yet/.test(await txt('.proto-end')) && !(await vis('#peNext')), await txt('.proto-end p.muted'));
      break; }
    checks.push('stopped at ' + t + ' day ' + day); await shot('c3-stop'); break; }
  s = await S(); checks.push('end at ' + await T() + ' day ' + s.day + ' cash ' + Math.round(s.cash));
  if(process.env.SAVE){ fs.writeFileSync(process.env.SAVE, await p.evaluate(() => window.__sim.saveCode())); checks.push('info save code written to ' + process.env.SAVE); }
  { const MS = JSON.parse(await E('JSON.stringify(msReport())')); checks.push('info milestones ' + JSON.stringify(Object.fromEntries(Object.entries(MS.got).map(([k, g]) => [k, g.times]))));   // teacher milestones (15 Oct)
    ok('milestones, chapter 3: buying a plane without saving for it first is not Saved and bought', !MS.got['3:savedBought'], MS.got['3:savedBought']); }
  const HH = (s.history || []).filter(h => h.from >= 365), wk = HH.filter(h => h.from <= 371);
  ok('the set-up week flew a day at a time (days 365–371)', wk.length === 7 && wk.every(h => h.type === 'day'), wk.map(h => h.from));
  if(s.day >= 396) ok('then months from 8 September (8–30 Sep, then 1 Oct)', HH.some(h => h.type === 'month' && h.from === 372 && h.to === 394) && HH.some(h => h.type === 'month' && h.from === 395), HH.filter(h => h.type === 'month').map(h => h.from + '–' + h.to));
  if(s.day >= 396){ const R = await R3(); info.ch3 = R;
    if(TYPE === 'premium'){ const L = info.handBack || {}, gone = !R.fleet.some(f => f.uid === L.uid), ret = R.returned.find(x => x.uid === L.uid);
      ok('the lease went back at the end of September: not in the fleet from 1 October, and its rent was paid to 30 September only', gone && ret && ret.on === 394 && R.log.some(x => x.what === 'leaseReturn' && x.day === 395), { gone, ret });
    }
    ok('no free bank top-ups in chapter 3', !(s.history || []).some(h => h.from >= 365 && h.loan), null); }
  if(s.day >= 730){ ok('the chapter ran to the review on Tuesday 31 August 2032 (day 730), August as 1–30 Aug', HH.some(h => h.type === 'month' && h.from === 700 && h.to === 729), HH.slice(-2).map(h => h.type + ' ' + h.from + '–' + h.to)); }
  checks.push('info ' + JSON.stringify(info));
  console.log(checks.join('\n')); console.log('OVERFLOW', overflow.length ? overflow : 'none'); console.log('ERRORS', errors.length ? errors : 'none');
  await b.close();
})();
