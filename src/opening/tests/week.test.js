// Run: NODE_PATH=<playwright node_modules> node week.test.js   (env: UPTO day, SHOTS=0, OUT, W, H, GAME, COAST, DUMP=days for state JSON, SAVE=file for the save code at the end)
// Workbook v4.4: chapter 1 a week at a time. Launch Day plan + sums, the week on the board, the Sunday review, then the next Monday.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), FILE = 'file://' + path.resolve(__dirname, '../../..', process.env.GAME || 'airline-opening-prototype.html'), OUT = (process.env.OUT || require('os').tmpdir() + '/airline-week') + '/'; fs.mkdirSync(OUT, { recursive:true });
const BRIEF = process.env.BRIEFINGS === '1';   // D99: play the Operations Briefings (off in the regression run)
const W = +(process.env.W || 1366), H = +(process.env.H || 768), SHOTS = process.env.SHOTS !== '0', UPTO = +(process.env.UPTO || 15);
const V2 = true;   // the game is the revised Studio (one file since 13 Oct 2026): opener, operating plan, change network
const COAST = process.env.COAST === '1', CAP = process.env.CAP ? +process.env.CAP : null, BOARD_SHARE = process.env.BOARD_SHARE !== undefined ? +process.env.BOARD_SHARE : null;   // COAST: the plan never changes after day 22; CAP: the teacher's dial
(async () => {
  const ftpSeen = [];
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport:{ width:W, height:H } })).newPage();
  let modelWide = false, openerSeen = false, newsSeen = false, d67 = null; const errors = [], checks = [], overflow = [], sums = {}, audits = [], boards = [], changes = [], dumped = {}, studio = [], foLevels = [], caps = [];
  p.on('pageerror', e => errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if(m.type() === 'error') errors.push('console: ' + m.text()); }); p.on('dialog', d => d.accept());
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(b => { const st = window.__sim.settings(); st.briefings = b; st.flightSecs = 0.25; st.autoWall = false; st.opsSound = false; }, BRIEF);
  const T = () => p.evaluate(() => window.__sim.step().t), S = () => p.evaluate(() => window.__sim.S());
  const ok = (name, cond, info) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (info !== undefined ? ' ' + JSON.stringify(info) : ''));
  // D102: JUMPS=<dir> saves the airline at each of the teacher's Jump to… points on the way (tools/make_jumps.sh)
  const JUMPS = process.env.JUMPS, JUMP_DAYS = [1, 8, 15, 22, 29, 43, 57, 92, 127, 274, 365, 736], jumped = {};
  const jumpSave = async day => { const d = JUMPS && JUMP_DAYS.find(j => !jumped[j] && day >= j - 3 && day <= j + 28); if(!d) return; jumped[d] = true; fs.mkdirSync(JUMPS, { recursive:true }); fs.writeFileSync(path.join(JUMPS, `day-${d}.txt`), await p.evaluate(() => window.__sim.saveCode())); };   // the first HQ in the point's window (month starts need not fall on it)
  const shot = async n => { if(!SHOTS) return; await p.waitForTimeout(150); await p.screenshot({ path:OUT + n + '.png' }); };
  const fits = async tag => { const r = await p.evaluate(() => { const bad = []; document.querySelectorAll('.tf-main,.tf-body,#screen,.ws-rail,.sheet1,.wk,.st-tt,.st-top').forEach(e => { if(e.scrollHeight > e.clientHeight + 2) bad.push((e.className || e.id).split(' ')[0] + ' ' + e.scrollHeight + '>' + e.clientHeight); }); return bad; }); if(r.length) overflow.push(tag + ': ' + r.join(', ')); };
  const vis = sel => p.evaluate(s => !!document.querySelector(s), sel);
  const setPlan = (fleet, prices) => p.evaluate(([fleet, prices]) => { const S = window.__sim.S(); fleet.forEach((x, j) => { const f = S.fleet[j]; if(!f) return; f.schedule = x.sched.slice(); f.route = x.sched[0] || null; f.deps = x.deps.slice(); if(j === 0) S.deps = x.deps.slice(); }); Object.assign(S.prices, prices); window.__sim.refreshPlan(); window.__sim.render(); }, [fleet, prices]);
  const practice = async () => { for(let i = 0; i < 3; i++){ const a = await p.evaluate(() => window.__sim.practiceAnswer()); if(!a || !(await p.$('#pqIn'))) break; await p.fill('#pqIn', a.text); await p.click('#pqCheck'); await p.waitForTimeout(1050); } };
  const solve = async tag => { const seen = []; for(let i = 0; i < 30; i++){ const c = await p.$('[data-cell]'); if(!c) break; const id = await c.getAttribute('data-cell'); seen.push(id); await c.click();
      await p.evaluate(() => { const t = window.__sim.currentTable(), c = t.cols.find(x => x.id === t.active.col); document.getElementById('cellAns').value = String(c.values[t.active.row]); }); await p.press('#cellAns', 'Enter'); await p.waitForTimeout(60); } return seen; };
  const solveW = async tag => { const seen = []; for(let g = 0; g < 80; g++){ if(await T() !== 'workings') break; if(BRIEF && await vis('#bfLayer')){ const ti = await p.$eval('#bfLayer iframe', e => e.title).catch(() => ''); if(/Cash, tank, profit/.test(ti) && !briefSeen.fuel) await playFuel((await S()).day, 'sums'); else { await p.evaluate(() => window.__bf.skip()); await p.waitForTimeout(200); } continue; }
      if(await p.$('#wkTutNext')){ await p.click('#wkTutNext'); continue; } if(await p.$('#wkTutGo')){ seen.push('tutorial'); await p.click('#wkTutGo'); continue; }
      if(await p.$('#pbChk')){ const P = await p.evaluate(() => window.__sim.evalIn('JSON.stringify(paperPlan())')).then(JSON.parse); seen.push(P.cell + ' build');
        if(!paperB){ paperB = true; await p.click(`[data-pbfig="${P.seq[0]}"]`); await p.click('[data-pbop="+"]'); await p.click(`[data-pbfig="${P.seq[2]}"]`); await p.click('#pbChk'); await p.waitForTimeout(60);
          ok(`${tag}: a Build with the wrong operation gets a note and one more try (D86)`, /One more try/.test(await p.textContent('#ftMsg')), await p.textContent('#ftMsg')); await shot('paper-build-query');
          ok(`${tag}: step 1 of the Week 1 flow: four figure tiles, square operations, "That's my sum", the cell being filled outlined magenta with ?`, (await p.$$('.bv-tile')).length === 4 && (await p.$$('.bv-op')).length === 4 && /That's my sum/.test(await p.textContent('#pbChk')) && await vis('.sheetp td.bv-target'), await p.$$eval('.bv-tile', es => es.map(e => e.textContent))); }
        for(const x of P.seq) await p.click(['+', '−', '×', '÷'].includes(x) ? `[data-pbop="${x}"]` : `[data-pbfig="${x}"]`); await p.click('#pbChk'); await p.waitForTimeout(80); continue; }
      if(await p.$('#cellAns')){ const id = await p.evaluate(() => { const t = window.__sim.currentTable(); return t.id + ':' + t.active.col + '|' + t.active.row; }); seen.push(id);
        if(!paperQ && await p.$('.wk-sum.paper')){ paperQ = true; await shot('paper-answer-box'); const P = await p.evaluate(() => window.__sim.evalIn('JSON.stringify(paperPlan())')).then(JSON.parse);
          ok(`${tag}: step 2 of the Week 1 flow: the built sum large with a magenta ?, the gold SUM n strip "Work it out in your book", the answer box; no column template or pad (D86, batch 1)`, /^SUM \d+$/.test((await p.textContent('.bv-book .bv-sumbadge')).trim()) && /Work it out in your book\. Write Sum \d+ beside your working, then type your answer\./.test((await p.textContent('.bv-book')).replace(/\s+/g, ' ')) && await vis('.bv-big .bv-unknown') && !(await p.$('.wkb, .wk-grid, .sd-tabs, .pad-btn')), (await p.textContent('.bv-s2')).replace(/\s+/g, ' ').slice(0, 200));
          await p.fill('#cellAns', String(P.answer * 10)); await p.press('#cellAns', 'Enter'); await p.waitForTimeout(60);
          ok(`${tag}: wrong once: the note from the answer alone (ten times out) and one more try`, /ten times/.test(await p.textContent('#ftMsg')) && /One more try/.test(await p.textContent('#ftMsg')), await p.textContent('#ftMsg')); }
        else if(!paperFin && /profit/.test(id) && await p.$('.wk-sum.paper')){ paperFin = true; for(const v of ['1', '2']){ await p.fill('#cellAns', v); await p.press('#cellAns', 'Enter'); await p.waitForTimeout(60); }
          ok(`${tag}: wrong twice: the figure is shown, stamped Checked by Finance, and the sums move on`, await vis('.stamp.fin') && await vis('#wkNext'), await p.textContent('.sh-work, .dock-sum').then(t => t.replace(/\s+/g, ' ').slice(0, 200))); await shot('paper-finance'); continue; }
        await p.evaluate(() => { const t = window.__sim.currentTable(), c = t.cols.find(x => x.id === t.active.col); document.getElementById('cellAns').value = String(c.values[t.active.row]); }); await p.press('#cellAns', 'Enter'); await p.waitForTimeout(80); continue; }
      if(await p.$('.sc-p1.sign #scCheck')){   // a fuel sign-off on the service card: the first is answered wrong once (Query), then right (Checked)
        const key = await p.evaluate(() => window.__sim.evalIn('(UI.sc.F && UI.sc.F.p.id + "|" + UI.sc.F.r.id) || ""')), A = await p.evaluate(() => window.__sim.evalIn('scAnswers()'));
        if(!seen.some(x => /^card/.test(x))){ await shot('card-' + tag.replace(/\s/g, '')); await p.fill('[data-sc="r0"]', '1'); await p.click('#scCheck'); await p.waitForTimeout(60);
          ok('card: a wrong line is stamped Query and highlighted', await vis('.stamp.q') && await vis('.sc-row.qy'), await p.$eval('.sc-msg', e => e.textContent).catch(() => ''));
          ok('card: before step 1 is right, steps 2 and 3 do not show its answer or the product (make it whole)', /your step 1 answer/.test(await p.textContent('.sc-p1')) && /Your step 2 answer ÷ 100/.test(await p.textContent('.sc-p1')) && !(await p.$('.sc-c2 .pad-btn, .c2 .pad-btn')), (await p.textContent('.sc-p1')).replace(/\s+/g, ' ').slice(0, 400)); }
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
  const builds = async tag => { const done = []; for(let g = 0; g < 12; g++){ const P = await p.evaluate(() => window.__sim.evalIn('rbPlan()')); if(!P) break;
      if(P.seq){ for(const x of P.seq) await p.click(['+', '−', '×', '÷'].includes(x) ? `[data-rbop="${P.id}|${x}"]` : `[data-rbfig="${P.id}|${x}"]`); if(P.chip) await p.click(`[data-rbdivchip="${P.id}"]`); }
      else { const y0 = await p.evaluate(() => [...document.querySelectorAll('#screen *')].map(e => e.scrollTop).join(','));
        await p.click(`[data-rbop="${P.id}|${P.op}"]`); await p.waitForTimeout(60);
        // D96: tapping ÷ never moves the page
        if(/^review/.test(tag)){ const y1 = await p.evaluate(() => [...document.querySelectorAll('#screen *')].map(e => e.scrollTop).join(',')); ok(`${tag}: tapping ÷ keeps every panel where it was (no scroll jump)`, y0 === y1); if(BRIEF) await shot(`${tag.replace(/\s/g, '-')}-divide`); }
        await p.fill(`[data-rbdiv="${P.id}"]`, String(P.div)); }
      if(/^review/.test(tag) && BRIEF){ await shot(`${tag.replace(/\s/g, '-')}-${P.id}-built`); ok(`${tag}: one cell lit at a time, no numbered panels (D96)`, (await p.$$('.rv-t td.rv-c.lit, .rv2-t td.rv2-c.lit')).length === 1 && (await p.$$eval('.rv-ins .rb-card .sc-n', es => es.every(e => getComputedStyle(e).display === 'none'))), P.id); }
      if(P.ans !== undefined) await p.fill(`[data-rbans="${P.id}"]`, String(P.ans)); await p.click(`[data-rbchk="${P.id}"]`); await p.waitForTimeout(80); done.push(P.id + (P.div ? '÷' + P.div : '')); } return done; };
  // v4.9 sign-off cards: Build (tap the figures and the operation) and Calculate (type the answer); the first of each kind is answered wrong once
  const briefSeen = {};
  // the fuel scene (Cash, tank, profit), played through wherever it opens: before Launch Day's fuel order (from 18 Oct), or on the Fuel desk for a save that never met it
  const playFuel = async (day, where) => { briefSeen.fuel = true; await p.waitForTimeout(400); await shot(`d${day}-brief-fuel-1`); const F = p.frameLocator('#bfLayer iframe');
      // the scene (Fable's plan): predict, Buy fuel, the week drains the tank; Continue only after doing
      await F.locator('.bk-chip').nth(1).waitFor({ timeout:15000 }); const gone = await F.locator('.bk-go').isHidden(); await F.locator('.bk-chip').nth(1).click();
      await F.locator('.bk-hud button.bk-chip', { hasText:'Buy fuel' }).click(); await p.waitForTimeout(2500); await shot(`d${day}-brief-fuel-2`);
      ok('fuel briefing: no Continue before he acts; buying moves cash into the tank and profit does not move', gone && /Profit didn.t move/.test(await F.locator('.bk-cap').textContent()), await F.locator('.bk-cap').textContent());
      await F.locator('.bk-go').waitFor({ timeout:30000 }); await shot(`d${day}-brief-fuel-3`);
      ok('fuel briefing: the week flies; fuel he owns but has not used is still in the tank', /Profit only counts what your flights burn/.test(await F.locator('.bk-cap').textContent()) && /Still in the tank/.test(await F.locator('.bk-hud').textContent()), await F.locator('.bk-cap').textContent());
      await F.locator('.bk-go').click(); await F.locator('.bk-go').waitFor({ timeout:10000 }); const nextQ = await F.locator('.bk-ask').textContent(); await F.locator('.bk-go').click(); await p.waitForTimeout(400);
      if(where === 'sums') ok('fuel briefing on Launch Day: opens before the fuel order and ends on it', /Next: your fuel order, \d+ blocks × the price of 1,000 L/.test(nextQ), nextQ);
      ok(`fuel briefing: done, ${where === 'desk' ? 'the Fuel desk' : 'the Launch Day sums'} underneath and the briefing is marked seen`, !(await vis('#bfLayer')) && (where === 'desk' ? await vis('.fd-ob, #fdBuy') : await T() === 'workings') && !!(await p.evaluate(() => window.__sim.evalIn('JSON.stringify((S.brief||{}).seen||{})'))).match(/fuel_cash_tank_profit/));
  };
  let soWrongB = false, soWrongC = false, paperB = false, paperQ = false, paperFin = false;
  const signs = async tag => { const done = []; for(let g = 0; g < 14; g++){ const P = await p.evaluate(() => window.__sim.evalIn('soPlan()')); checks.push('info soPlan ' + tag + ' ' + JSON.stringify(P)); if(!P) break;
      if(P.rb){ await p.click(`[data-rbop="${P.rb.id}|${P.rb.op}"]`); await p.fill(`[data-rbdiv="${P.rb.id}"]`, String(P.rb.div)); await p.click(`[data-rbchk="${P.rb.id}"]`); await p.waitForTimeout(80); done.push('rb:' + P.rb.id + '÷' + P.rb.div); continue; }
      const k = P.key.replace(/"/g, '\\"');
      if(P.level === 'build'){
        if(!soWrongB){ soWrongB = true; await p.click(`[data-sofig="${k}|${P.seq[0]}"]`); await p.click(`[data-soop="${k}|+"]`); await p.click(`[data-sofig="${k}|${P.seq[2]}"]`); await p.click(`[data-sochk="${k}"]`); await p.waitForTimeout(60);
          ok(`${tag}: a Build card with the wrong operation is a Query with a hint`, await vis(`[data-socard="${k}"] .stamp.q`) && (await p.$eval(`[data-socard="${k}"] .rb-msg`, e => e.textContent)).length > 10, await p.$eval(`[data-socard="${k}"] .rb-msg`, e => e.textContent).catch(() => '')); await shot('so-build-query'); await p.click(`[data-soclr="${k}"]`); }
        for(const x of P.seq) await p.click(['+', '−', '×', '÷'].includes(x) ? `[data-soop="${k}|${x}"]` : `[data-sofig="${k}|${x}"]`); }
      else { if(!soWrongC){ soWrongC = true; await p.fill(`[data-soin="${k}"]`, String(+P.answer + 7)); await p.click(`[data-sochk="${k}"]`); await p.waitForTimeout(60); ok(`${tag}: a wrong Calculate answer is a Query`, await vis(`[data-socard="${k}"] .stamp.q`), await p.$eval(`[data-socard="${k}"] .sc-msg`, e => e.textContent).catch(() => '')); }
        await p.fill(`[data-soin="${k}"]`, P.answer); }
      await p.click(`[data-sochk="${k}"]`); await p.waitForTimeout(80); const okd = await vis(`[data-socard="${k}"] .stamp.ok`); if(!okd){ ok(`${tag}: ${P.key} signed`, false, P); break; } done.push(P.level + ':' + P.key); } sums['signs ' + tag] = (sums['signs ' + tag] || []).concat(done); return done; };
  // D66: the Operating Plan Studio, checked against the engine (Fable's report-back list)
  const studioChecks = async tag => { const R = await p.evaluate(() => window.__sim.evalIn('studioReport()'));
    const dom = await p.$$eval('.st-card', cs => cs.map(c => ({ id:c.getAttribute('data-stroute'), n:[...c.querySelectorAll('.fch small')].map(x => +x.textContent) })));
    ok(`${tag}: the route cards show the people a day at each fare (the Routes sheet's demand, through the engine)`, dom.length > 0 && dom.every(d => { const c = R.cards.find(x => x.id === d.id); return c && JSON.stringify(c.fares.map(f => f[1])) === JSON.stringify(d.n); }), dom.slice(0, 2));
    const blk = (await p.$$eval('.st-blk', bs => bs.map(b => b.querySelector('.st-bs').textContent + '|' + (b.className.match(/fill-(\w+)/) || [])[1]))).sort(), eng = R.services.map(x => `${x.sold}/${x.seats}|${x.fill}`).sort();
    ok(`${tag}: each flight block is seats filled / seats on that plane, green, amber or red at 80% and 50%`, blk.length > 0 && JSON.stringify(blk) === JSON.stringify(eng), blk);
    const c0 = dom[0] && dom[0].id, strip = async () => { await p.mouse.move(5, 5); await p.waitForTimeout(60); return p.$eval('.st-strip', e => e.getAttribute('data-strip')).catch(() => null); };
    if(c0){ await p.click(`.st-card[data-stroute="${c0}"] .st-cf`); await p.waitForTimeout(80); const a = await strip(); await p.click(`.st-card[data-stroute="${c0}"] .st-cf`); await p.waitForTimeout(80); const z = await strip();
      await p.hover(`.st-card[data-stroute="${dom[dom.length - 1].id}"] .st-cf`); await p.waitForTimeout(60); const hov = await p.$eval('.st-strip', e => e.getAttribute('data-strip')).catch(() => null);
      ok(`${tag}: the demand strip switches to the selected route's own bands (and the hovered one), and back to all routes`, [a, z].sort().join('|') === ['', c0].sort().join('|') && hov === dom[dom.length - 1].id, [a, z, hov]); await p.mouse.move(5, 5); }
    const tips = await p.$$eval('[data-tip]', es => es.map(e => e.getAttribute('data-tip')));
    ok(`${tag}: the live panel shows the four figures and one or two tips from PlanTips`, (await p.$$('.st-live .st-fig')).length === 4 && tips.length >= 1 && tips.length <= 2 && tips.every(t => R.tips.includes(t)), { tips, figs:{ pax:R.pax, seats:R.seats, revenue:R.revenue, profit:R.profit, away:R.away } });
    studio.push({ tag, tips, report:{ pax:R.pax, seats:R.seats, revenue:R.revenue, profit:R.profit, away:R.away }, blocks:blk }); };
  // batch 1: a plan change that needs its worth sum opens the Worth Sum Callout over the flight; the pupil builds it, types it, Done
  let worthSeen = 0;
  const worthOff = async () => { for(let g = 0; g < 4; g++){ if(await vis('#bvWsc.wait')){ const Wd = JSON.parse(await p.evaluate(() => window.__sim.evalIn('JSON.stringify({ seq:UI.dsWorth.seq, answer:UI.dsWorth.answer, built:UI.dsWorth.cb.built })')));
        if(!Wd.built){ for(const x of Wd.seq) await p.click(['+', '−', '×', '÷'].includes(x) ? `[data-wso="${x}"]` : `[data-wsf="${x}"]`); await p.click('#wsChk'); await p.waitForTimeout(80); }
        await p.fill('#wsAns', String(Wd.answer)); await p.click('#wsCheck'); await p.waitForTimeout(100);
        if(!worthSeen++) ok('Studio: the first worth sum, built and typed in its callout, turns the callout green with the answer, the difference a day and a line of meaning', await vis('#bvWsc.done') && /\([+−±]£[\d,]+ a day\)/.test(await p.textContent('#bvWsc')), (await p.textContent('#bvWsc')).replace(/\s+/g, ' ').slice(0, 240)); continue; }
      if(await vis('#bvWsc.done')){ await p.click('#wsDone'); await p.waitForTimeout(60); continue; } break; } };
  // the revised Studio: a fare is changed in its route editor (the plan's state first, from the opener if needed)
  const fareTo = async (id, f) => { await worthOff(); if(!V2){ await p.click(`[data-pe="0|fareTo|${id}|${f}"]`); return; } if(await vis('#s2Edit')){ await p.click('#s2Edit'); await p.waitForTimeout(80); }
    if(await vis('#s3Open')){ await p.click('#s3Open'); await p.waitForTimeout(80); }   // D101: with three or more routes the list is folded
    if(!(await vis(`[data-pe="0|fareTo|${id}|${f}"]`))){ await p.click(`[data-s2fare="${id}"]`); await p.waitForTimeout(80); }
    await p.click(`[data-pe="0|fareTo|${id}|${f}"]`); await p.waitForTimeout(80); await worthOff(); if(await vis('#s2EdX')){ await p.click('#s2EdX'); await p.waitForTimeout(60); } };
  const toPlan = async () => { await worthOff(); if(V2 && await vis('#s2Edit')){ await p.click('#s2Edit'); await p.waitForTimeout(100); } if(V2 && await vis('#s2Back')){ await p.click('#s2Back'); await p.waitForTimeout(100); } };
  // the revised Studio, checked against the engine: active routes, the route editor, the blocks, the drawer, the service editor
  const v2Checks = async tag => { if(await vis('#s3Open')){ await p.click('#s3Open'); await p.waitForTimeout(100); }   // D101: more than two routes fold to one line; open it to read the table
    const R = await p.evaluate(() => window.__sim.evalIn('studio2Report()')), E = await p.evaluate(() => window.__sim.evalIn('studioReport()'));
    const rows = await p.$$eval('.s2-r', rs => rs.map(r => { const n = [...r.querySelectorAll('.s2-n')].map(x => +x.textContent.replace(/,/g, '')); return { id:r.getAttribute('data-s2r'), fare:+r.querySelector('.s2-fare').textContent.replace(/[£,]/g, ''), want:n[0], n:n[1], pct:+r.querySelector('.s2-fl b').textContent.replace('%', '') }; }));
    ok(`${tag}: Active routes shows only the routes flown, each at its fare with the demand, services and seat fill the engine gives`, rows.length === R.active.length && rows.every(x => { const a = R.active.find(z => z.id === x.id); return a && a.fare === x.fare && a.want === x.want && a.n === x.n && a.pct === x.pct; }), rows);
    ok(`${tag}: no route catalogue on the operating plan (the full fares appear only in a route editor)`, !(await vis('.st-card')) && !(await vis('.s2-ed')));
    const blk = (await p.$$eval('.st-blk', bs => bs.map(b => b.querySelector('.st-bs').textContent + '|' + (b.className.match(/fill-(\w+)/) || [])[1]))).sort(), eng = E.services.map(x => `${x.sold}/${x.seats}|${x.fill}`).sort();
    ok(`${tag}: each flight block is seats filled / seats, green, amber or red`, blk.length > 0 && JSON.stringify(blk) === JSON.stringify(eng), blk);
    const r0 = rows[0] && rows[0].id; if(r0){ await p.click(`.s2-fare[data-s2fare="${r0}"]`); await p.waitForTimeout(100);
      const ft = await p.$$eval('.s2-ft tbody tr', trs => trs.map(t => [+t.querySelector('.s2-fb').textContent.replace(/[£,]/g, ''), +t.querySelector('td.num').textContent.replace(/,/g, '')]));
      const strip = await p.$eval('.st-strip', e => e.getAttribute('data-strip')).catch(() => null);
      ok(`${tag}: Edit fare opens one route's editor: every fare with the people at it (the Routes sheet through the engine), and the strip on that route`, JSON.stringify(ft) === JSON.stringify(R.active.find(a => a.id === r0).fares) && strip === r0 && await vis('.s2-cmp'), { ft, strip }); await shot(`${tag.replace(/\W+/g, '-')}-v2-route`);
      await p.click('#s2EdX'); await p.waitForTimeout(80); }
    ok(`${tag}: the trade-offs drawer is closed by default`, !(await vis('.s2-dr')) && await vis('#s2Tr'));
    await p.click('#s2Tr'); await p.waitForTimeout(100); const tips = await p.$$eval('.s2-dr [data-tip]', es => es.map(e => e.getAttribute('data-tip')));
    ok(`${tag}: the drawer lists the firing tips, biggest first, each with its button (D87; up to four)`, tips.length >= 1 && tips.length <= 4 && (await p.$$('.s2-dr [data-dsdr]')).length === tips.length, tips);
    await p.click('#s2All'); await p.waitForTimeout(100); ok(`${tag}: Show all insights groups them: seat use, lost demand, timing, fare, capacity, money`, (await p.$$('.s2-g')).length === 6); await shot(`${tag.replace(/\W+/g, '-')}-v2-drawer`); await p.click('#s2All'); await p.click('#s2DrX'); await p.waitForTimeout(80);
    const b0 = await p.$('.ad-blk[data-tl]'); if(b0){ await b0.click(); await p.waitForTimeout(120); const pop = await p.evaluate(() => { const e = document.querySelector('#s2Pop'); if(!e) return null; const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && !!e.querySelector('[data-tlrm]') && !!e.querySelector('[data-s2rt]') && e.querySelectorAll('[data-bvfare]').length === 2 && !!e.querySelector('.bv-seats [data-bvfareto]') && !!e.querySelector('[data-s2ac]'); });
      ok(`${tag}: a pressed flight opens its editor on screen (earlier, later, route, aircraft, remove; the Change row: the fare's − / + and the seats at each fare)`, pop === true, pop); await shot(`${tag.replace(/\W+/g, '-')}-v2-service`); await p.keyboard.press('Escape'); await p.waitForTimeout(80); ok(`${tag}: Escape closes the flight editor`, !(await vis('#s2Pop'))); }
    studio.push({ tag, tips, active:R.active.map(a => `${a.id} ${a.fare} ${a.want} ${a.n} ${a.pct}%`), blocks:blk }); };
  const identity = async () => { if(await T() === 'code'){ await p.click('#nx'); } if(await T() === 'logo'){ await p.click('#nx'); }
    if(await T() === 'paint'){ await p.click('[data-ptab="name"]'); await p.fill('#regIn', 'DRAG'); await p.click('#roll'); }
    if(await T() === 'reveal'){ await p.click('#skipReveal'); await p.waitForTimeout(150); await p.click('#nx'); } if(await T() === 'cert') await p.click('#nx'); };
  // setup
  await p.click('#start'); await p.fill('#nm', 'Dragon Air'); await p.click('#nx'); await identity();
  if(await T() === 'boot') await p.click('#enterHq'); if(await T() === 'chapter') await p.click('#chGo');
  await jumpSave(1);
  ok('launch day: the intro explains the job and the starting position (no market gate)', await T() === 'brief1' && /Your first week in charge/.test(await p.textContent('#screen')) && (await p.$$('.br1-c')).length === 4, await T());
  await fits('brief'); await shot('d1-brief'); await p.click('#nx');
  ok('launch day: the planner follows the intro', await T() === 'plan', await T());
  if(CAP) await p.evaluate(c => window.__sim.evalIn(`soS().cap = ${c}`), CAP);
  if(BOARD_SHARE !== null) await p.evaluate(v => window.__sim.evalIn(`WORLD.settings.boardNudgeMissedShare = ${v}`), BOARD_SHARE);
  // the chapter
  let lastDay = 0, planned2 = 0, planned3 = 0, delChk = false; const info = {}, shopVisit = {}, shopSelf = [];
  try{
  for(let i = 0; i < 400; i++){ const t = await T(), s = await S(), day = s.day;
    // the briefings that are not this test's own (Fable's plan, 18 Oct: fare, Red Kite, capacity, flight times, the event...): photographed, then skipped (first: a briefing covers the screen under it)
    if(BRIEF && await vis('#bfLayer') && t !== 'brief'){ const title = await p.$eval('#bfLayer iframe', e => e.title).catch(() => ''); if(/Cash, tank, profit/.test(title) && !briefSeen.fuel){ await playFuel(day, t === 'fuelDesk' ? 'desk' : 'sums'); continue; } await p.waitForTimeout(1500); await shot(`d${day}-brief-${title.replace(/\W+/g, '-').slice(-30)}`); (briefSeen.other = briefSeen.other || []).push(day + ' ' + title); await p.evaluate(() => window.__bf.skip()); await p.waitForTimeout(200); continue; }
    if(day >= UPTO && t === 'hq') break; if(t === 'chapterReview' && await vis('.rbw')){ await shot('chapter-accounts'); const built = await builds('chapter'); ok('chapter accounts: total revenue, total costs, profit and projected − actual are Build steps', ['rev', 'cost', 'profit', 'vs'].every(k => built.includes(k)), built); await shot('chapter-accounts-built'); checks.push('reached chapterReview day ' + day); break; }
    if(t === 'protoEnd' || t === 'chapterReview'){ checks.push('reached ' + t + ' day ' + day); break; }
    if(t === 'hq'){ await jumpSave(day); const so = await p.evaluate(() => window.__sim.evalIn('JSON.stringify(shopOfferedReport())')).then(JSON.parse); if(so.scheduled) shopSelf.push(day);
      if([8, 22].includes(day) && s.phase === 'round') ok(`day ${day}: HQ's brief says new aircraft are on the Fleet desk (no shop step)`, so.brief.some(l => /^On the Fleet desk from today: /.test(l)) && !so.scheduled, so.brief);
      await fits('hq ' + day); if(day !== lastDay) await shot(`d${day}-hq`); lastDay = day; await p.click('#startDay'); continue; }
    if(t === 'intro'){ for(let pg = 0; pg < 2; pg++) if(await p.$('#niNext')) await p.click('#niNext'); if(await p.$('#pqIn')) await practice(); const n = (await p.$$('[data-ni]')).length; for(let k = 0; k < n && await p.$eval('#nx', e => e.disabled); k++) await p.click(`[data-ni="${k}"]`); await p.click('#nx'); continue; }
    if(t === 'shop2' && day === 8 && await vis('.acx')){ await fits('compare ' + day); await shot(`d${day}-compare-aircraft`); const txt = (await p.textContent('#screen')).replace(/\s+/g, ' ');
      ok(`day ${day}: the second-aircraft comparison: three columns, nine rows each, the capacity problem first`, (await p.$$('.acx-col')).length === 3 && (await p.$$('.acx-col:first-child .acx-r')).length === 9 && /We have a capacity problem/.test(txt), (await p.$$('.acx-col:first-child .acx-r')).length);
      ok(`day ${day}: nothing is labelled best; the descriptors are derived`, !/\bbest\b/i.test(await p.$$eval('.acx-tag', es => es.map(e => e.textContent).join(' '))) && /FITS TODAY'S MARKET/.test(txt) && /LOW COMMITMENT/.test(txt) && /A BET ON/.test(txt), await p.$$eval('.acx-tag', es => es.map(e => e.textContent)));
      ok(`day ${day}: the cash bar shows a reserve breach in red when buying outright is not possible`, await vis('.acx-bar i.x'));
      ok(`day ${day}: Where could it fly lists today's route and the routes opening in weeks 3 and 4`, (await p.$$('.acx-wt tbody tr')).length === 4, await p.$$eval('.acx-wt tbody td:first-child b', es => es.map(e => e.textContent)));
      await p.click('[data-achl="profit"]'); ok(`day ${day}: Compare one row highlights a row across the columns`, await vis('.acx[data-hl="profit"]'));
      await p.click('[data-actab="grow"]'); await p.waitForTimeout(100); await p.$eval('#acGrowIn', e => { e.value = '2'; e.dispatchEvent(new Event('change')); }); await p.waitForTimeout(200);
      ok(`day ${day}: If Dublin grows recomputes the three planes at ×2.0`, (await p.$$('.acx-gb')).length === 3 && /×2\.0/.test(await p.textContent('.acx-grow')), await p.$eval('.acx-grow', e => e.textContent.replace(/\s+/g, ' ').slice(0, 200)));
      await shot(`d${day}-compare-grow`); await p.click('[data-actab="where"]'); await p.click('[data-acc="sf34"]'); await p.waitForTimeout(150); continue; }
    // D101: choosing a plane opens its worth check in place: WHY · WORK IT OUT · WHAT IT MEANS, then Buy it now or Wait (the time to afford when waiting)
    if(t === 'shop2' && await vis('.wc')){ const pid = await p.evaluate(() => window.__wc.open()), first = !info.wcSeen; info.wcSeen = (info.wcSeen || 0) + 1;
      if(first){ await shot(`d${day}-worth-check`); const x = (await p.textContent('#screen')).replace(/\s+/g, ' ');
        ok(`day ${day}: the worth check opens in place: WHY, WORK IT OUT, WHAT IT MEANS, the other planes in a slim column`, await vis('.wc-why') && await vis('.wc-work') && await vis('.wc-means') && (await p.$$('.wc-sl')).length >= 2 && /a day without a seat|No one is being turned away/.test(x), x.slice(0, 160));
        ok(`day ${day}: no numbered steps, no recommended routes, no model's suggestion, no sum counter (D101)`, !/recommended|model's suggestion|1 of 3|Step 1/i.test(await p.textContent('.wc-zones')));
        ok(`day ${day}: WHAT IT MEANS waits for the answer`, (await p.$$('.wc-mr.lock')).length === 3); }
      if(await p.$('[data-wcin]')){ const v = await p.evaluate(id => window.__wc.answer(id), pid); await p.fill('[data-wcin]', String(v)); await p.click(`[data-wcchk="${pid}"]`); await p.waitForTimeout(100);
        if(first){ ok(`day ${day}: the full flight is checked and the three rows fill in turn (full-flight money, extra profit a day, payback as coins)`, (await p.$$('.wc-mr.on')).length === 3 && await vis('.wc-coins') && await vis('.wc-dec'), await p.textContent('.wc-means').then(t => t.replace(/\s+/g, ' '))); await p.waitForTimeout(2200); await shot(`d${day}-worth-check-answered`); } }
      const n0 = (await S()).fleet.length;
      if(await p.$('#wcBuy:not([disabled])')){ await p.click('#wcBuy'); await p.waitForTimeout(150); info[pid] = day; ok(`day ${day}: Buy it now: the ${pid} is bought outright`, (await S()).fleet.some(f => f.planeId === pid && f.terms && f.terms.kind === 'buy'), (await S()).fleet.map(f => [f.planeId, f.terms && f.terms.kind])); continue; }
      await p.click('#wcAskWait'); await p.waitForTimeout(100); const F = await p.evaluate(() => window.__sim.evalIn('JSON.stringify(UI.taF)')).then(JSON.parse);
      if(await p.$('[data-pad="ta1"]')){ info.ta = F; await shot(`d${day}-worth-check-wait`);
        await p.fill('[data-pad="ta1"]', String(F.price + F.cash)); await p.click('#ta1Chk'); await p.waitForTimeout(60); ok(`day ${day}: time to afford, step 1: adding is a Query ("that adds them")`, /adds them/.test(await p.textContent('.ta-card')), await p.textContent('.ta-card .sc-msg').catch(() => ''));
        await p.fill('[data-pad="ta1"]', String(F.still)); await p.click('#ta1Chk'); await p.waitForTimeout(60);
        if(Math.abs(F.exact - Math.round(F.exact)) > 0.01){ await p.fill('[data-pad="ta2"]', String(Math.floor(F.exact))); await p.click('#ta2Chk'); await p.waitForTimeout(60); ok(`day ${day}: time to afford, step 2: not rounded up is a Query`, /round up/.test(await p.textContent('.ta-card')), await p.textContent('.ta-card .sc-msg').catch(() => '')); }
        await p.fill('[data-pad="ta2"]', String(F.days)); await p.click('#ta2Chk'); await p.waitForTimeout(80);
        ok(`day ${day}: (${F.price} − ${F.cash}) ÷ ${F.rate} = ${F.days} days, Checked; the week's ledger counts it as a Calculate`, await vis('.ta-card.ok') && (await p.evaluate(() => window.__sim.evalIn("JSON.stringify(Object.values(soWeek(false).items).filter(it => it.rel === 'timeToAfford').map(it => [it.level, it.done]))"))) === '[["calc",true]]', F); }
      else if(await p.$('[data-tafig]')){ for(const x of ['still', '÷', 'rate']) await p.click(['÷'].includes(x) ? `[data-taop="${x}"]` : `[data-tafig="${x}"]`); await p.click('#taBuildChk'); await p.waitForTimeout(80); ok(`day ${day}: the time to afford is Build the second time`, await vis('.ta-card.ok')); }
      await p.click('#wcWait'); await p.waitForTimeout(150); ok(`day ${day}: wait for the ${pid}: the fleet is unchanged and the Fleet desk will count down`, ((await S()).waitFor || {}).pid === pid && (await S()).fleet.length === n0, (await S()).waitFor); continue; }
    if(t === 'shop2' && await vis('.acx') && day > 8){ await shot(`d${day}-compare-again`); ok(`day ${day}: while saving, the shop (opened from the Fleet desk) shows the countdown`, /Saving for the Saab 340|You can buy the Saab 340 now/.test(await p.textContent('.bw-wait').catch(() => '')), await p.textContent('.bw-wait').catch(() => ''));
      await p.click('[data-acc="sf34"]'); await p.waitForTimeout(150); continue; }
    if(t === 'acquire' && await vis('.bw-page')){ await shot(`d${day}-buy-or-wait`); const txt = (await p.textContent('#screen')).replace(/\s+/g, ' '), F = await p.evaluate(() => window.__sim.evalIn('JSON.stringify(UI.taF)')).then(JSON.parse);
      ok(`day ${day}: chapter 1 is buy only: no rent or finance on Buy now or wait`, !(await vis('[data-terms]')) && !/a day to rent|Finance, down|rent or finance for now/.test(txt) && /Days to wait/.test(txt) && (await vis('.bw-one') || /What waiting costs/.test(txt)), txt.slice(0, 200));
      if(await p.$('[data-pad="ta1"]')){ info.ta = F;
        await p.fill('[data-pad="ta1"]', String(F.price + F.cash)); await p.click('#ta1Chk'); await p.waitForTimeout(60); ok(`day ${day}: time to afford, step 1: adding is a Query ("that adds them")`, /adds them/.test(await p.textContent('.ta-card')), await p.textContent('.ta-card .sc-msg').catch(() => ''));
        await p.fill('[data-pad="ta1"]', String(F.still)); await p.click('#ta1Chk'); await p.waitForTimeout(60);
        if(Math.abs(F.exact - Math.round(F.exact)) > 0.01){ await p.fill('[data-pad="ta2"]', String(Math.floor(F.exact))); await p.click('#ta2Chk'); await p.waitForTimeout(60); ok(`day ${day}: time to afford, step 2: not rounded up is a Query`, /round up/.test(await p.textContent('.ta-card')), await p.textContent('.ta-card .sc-msg').catch(() => '')); }
        await p.fill('[data-pad="ta2"]', String(F.days)); await p.click('#ta2Chk'); await p.waitForTimeout(80);
        ok(`day ${day}: (${F.price} − ${F.cash}) ÷ ${F.rate} = ${F.days} days, Checked; the week's ledger counts it as a Calculate`, await vis('.ta-card.ok') && (await p.evaluate(() => window.__sim.evalIn("JSON.stringify(Object.values(soWeek(false).items).filter(it => it.rel === 'timeToAfford').map(it => [it.level, it.done]))"))) === '[["calc",true]]', F); }
      else if(await p.$('[data-tafig]')){ for(const x of ['still', '÷', 'rate']) await p.click(['÷'].includes(x) ? `[data-taop="${x}"]` : `[data-tafig="${x}"]`); await p.click('#taBuildChk'); await p.waitForTimeout(80); ok(`day ${day}: the time to afford is Build the second time`, await vis('.ta-card.ok')); }
      const pid = await p.evaluate(() => window.__sim.evalIn('S.rnd.shopPick')), n0 = (await S()).fleet.length, can = await p.$(`[data-bw="${pid}|buy"]:not([disabled])`);
      if(can){ await can.click(); await p.click('#nx'); await p.waitForTimeout(150); info[pid] = day; ok(`day ${day}: the ${pid} is bought outright once there is enough cash`, (await S()).fleet.some(f => f.planeId === pid && f.terms && f.terms.kind === 'buy'), (await S()).fleet.map(f => [f.planeId, f.terms && f.terms.kind])); }
      else { await p.click(`[data-bw="${pid}|wait"]`); await p.click('#nx'); await p.waitForTimeout(150); ok(`day ${day}: wait for the ${pid}: the fleet is unchanged and the Fleet desk will count down`, ((await S()).waitFor || {}).pid === pid && (await S()).fleet.length === n0, (await S()).waitFor); }
      continue; }
    if(t === 'acquire' && await vis('.so-page')){ await shot(`d${day}-acquire-build`); await signs('acquire ' + day); await p.click('#nx'); continue; }
    if(t === 'acquire' && await vis('.acq')){ await shot(`d${day}-pay`); const buy = await p.$eval('[data-terms="buy"]', e => e.disabled), cash = (await S()).cash, reserve = await p.evaluate(() => window.__sim.evalIn('WORLD.cashReserve || 0'));
      ok(`day ${day}: How should we get it: Buy is greyed with the shortfall when cash is below price + reserve`, buy === (cash < 22000 + reserve) && /still to save/.test(await p.textContent('.acq-cols')), await p.$eval('.acq-n', e => e.textContent).catch(() => ''));
      if(await p.$('#rbIn')){ await p.fill('#rbIn', '50'); await p.click('#rbChk'); await p.waitForTimeout(60); ok(`day ${day}: the rent-or-buy sign-off queries a wrong answer`, await vis('.acq-rb .stamp.q'));
        await p.fill('#rbIn', '55'); await p.click('#rbChk'); await p.waitForTimeout(60); ok(`day ${day}: 22,000 ÷ 400 = 55 days is Checked`, await vis('.acq-rb .stamp.ok')); }
      await shot(`d${day}-pay-signed`); await p.click('[data-terms="lease"]'); await p.click('#nx'); await p.waitForTimeout(100);
      ok(`day ${day}: the Saab starts on Dublin as compared (two services at £80)`, await p.evaluate(() => JSON.stringify(window.__sim.currentPlan().fleet.map(x => x.sched))) === '[["par","par"],["dub","dub"]]', await p.evaluate(() => JSON.stringify(window.__sim.currentPlan().fleet.map(x => x.sched)))); continue; }
    if(t === 'shop2'){ await fits('shop ' + day); await shot(`d${day}-shop`); const want = day === 8 ? 'sf34' : day >= 22 && s.fleet.length === 2 && !s.fleet.some(f => f.planeId === 'at72') ? 'at72' : null, card = want && await p.$(`[data-pick="${want}"]`); if(card){ await card.click(); await p.waitForTimeout(400); await shot(`d${day}-shop-turned`); ok(`shop ${day}: the turned card is drawn flat (no 3D transform, so its text stays sharp)`, await p.$eval(`[data-pick="${want}"] .sc-back`, e => { const t = getComputedStyle(e).transform, i = getComputedStyle(e.parentElement).transform; return (t === 'none' || /^matrix\(/.test(t)) && (i === 'none' || /^matrix\(/.test(i)) && getComputedStyle(e).display !== 'none'; })); await p.click('#nx'); } else await p.click('#skipShop'); continue; }
    if(t === 'fleetSums' && await vis('.so-page')){ await fits('fleetSums ' + day); await shot(`d${day}-fleetsums`); sums['fleetSums ' + day] = await signs('fleetSums ' + day); await p.click('#nx'); continue; }
    if(t === 'fleetSums'){ const typed = await solve('fleetSums'); sums['fleetSums ' + day] = typed; if(await p.$('#calcDone')) await p.click('#calcDone'); await p.click('#nx'); continue; }
    if(t === 'acquire'){ await shot(`d${day}-acquire`); const buy = await p.$eval('[data-terms="buy"]', e => e.disabled), txt = await p.$eval('[data-terms="buy"]', e => e.textContent.replace(/\s+/g, ' ')), cash = (await S()).cash, price = +((/£([\d,]+)/.exec(txt) || [])[1] || '0').replace(/,/g, ''), reserve = await p.evaluate(() => window.__sim.evalIn('WORLD.cashReserve || 0'));
      ok(`day ${day}: Buy is greyed until affordable (cash ${cash} against ${price} + the ${reserve} reserve)`, buy === (cash < price + reserve), txt);
      ok(`day ${day}: chapter 1 is buy only: Rent and Finance are off`, await p.$eval('[data-terms="lease"]', e => e.disabled).catch(() => true) && await p.$eval('[data-terms="finance"]', e => e.disabled).catch(() => true));
      if(!buy){ await p.click('[data-terms="buy"]'); await p.click('#nx'); info.atrBought = info.atrBought || day; } else await p.click('#noBuy'); continue; }
    if(t === 'event'){ await fits('event ' + day); await shot(`d${day}-event`); for(let i = 0; i < 8 && await p.$('[data-seep]'); i++) await p.click('[data-seep]'); await p.click(`[data-o="${day === 5 ? 2 : 1}"]`); await p.click('#nx'); await p.waitForTimeout(80); if(await T() === 'event') await p.click('#nx'); continue; }
    // the shop never opens by itself (Bertie, 14 Oct): the test pupil opens it from the Fleet desk on day 8, on a plan day while saving, and from day 22 until the ATR is bought
    if(t === 'plan' && await p.$('.ftp-page')){ ftpSeen.push(await p.evaluate(() => JSON.stringify([window.__sim.S().day, window.__sim.evalIn('ftpPlan()'), (document.querySelector('.ft-cmp') || {}).textContent || '']))); for(let g = 0; g < 8; g++){ const P = await p.evaluate(() => JSON.parse(JSON.stringify(window.__sim.evalIn('ftpPlan()')))); if(!P) break; if(P.next){ await p.evaluate(() => window.__tk.answer(true)); await p.waitForTimeout(60); } else { await p.click('#ftpGo'); await p.waitForTimeout(150); } } continue; }   // flight times before the timetable
    if(t === 'plan' && s.phase === 'round' && !shopVisit[day] && (day === 8 || (s.waitFor && day > 8) || (day >= 22 && s.fleet.length === 2 && !s.fleet.some(f => f.planeId === 'at72')))){ shopVisit[day] = true;
      await p.click('[data-nav="fleet"]'); await p.waitForTimeout(150);
      if(day === 8){ ok('day 8: the Fleet desk has Add an aircraft, with the three planes and the Buy button', await vis('.fs-shop #fleetShop:not([disabled])') && (await p.$$('.fs-shop .fs-row')).length === 3, await p.$eval('.fs-shop', e => e.textContent.replace(/\s+/g, ' ')).catch(() => '')); await shot('d8-fleet-desk'); }
      if(s.waitFor) ok(`day ${day}: while saving, the Fleet desk shows the countdown`, /Saving for the|You can buy the/.test(await p.textContent('.fs-shop').catch(() => '')), await p.textContent('.fs-shop .bw-wait').catch(() => ''));
      if(await vis('#fleetShop:not([disabled])')){ await p.click('#fleetShop'); await p.waitForTimeout(150); ok(`day ${day}: Add an aircraft opens the shop in front of the plan`, await T() === 'shop2', await T()); continue; }
      await p.click('[data-nav="plan"]').catch(() => {}); await p.waitForTimeout(100); }
    if(t === 'plan' && process.env.DUMP && process.env.DUMP.split(',').includes(String(day)) && !dumped[day]){ dumped[day] = true; fs.writeFileSync(OUT + `state-${day}.json`, await p.evaluate(() => window.__sim.evalIn('JSON.stringify(S)'))); }
    if(t === 'plan'){ await fits('plan ' + day);
      // the plans from Balance Report v4.4: week 1 the mixed day; week 2 the Saab on Dublin; week 3 the Saab to Amsterdam; week 4 the ATR to Madrid
      if(s.phase === 'setup' && V2){
        ok('launch (v2): an empty plan opens on Choose where to fly, with both launch routes and no filters to read past', await vis('.s2-net') && /Choose where to fly/.test(await p.textContent('.dp-tt h1')) && await vis('[data-pe="0|add|par|0|0"]') && await vis('[data-pe="0|add|dub|0|0"]') && !(await vis('.s2-haul')), await p.textContent('.dp-tt h1')); await shot('d1-v2-network');
        await p.click('[data-pe="0|add|par|0|0"]'); await p.click('[data-pe="0|add|dub|0|0"]'); await p.click('[data-pe="0|add|par|0|0"]'); await p.waitForTimeout(80);
        ok('launch (v2): Add to schedule says where the flight went', /flight added to the Twin Otter at \d\d:\d\d/.test(await p.$eval('.s2-added', e => e.textContent).catch(() => '')), await p.$eval('.s2-added', e => e.textContent).catch(() => ''));
        await p.click('#s2Back'); await p.waitForTimeout(100);
        if(BRIEF){ await p.waitForTimeout(400); const ti = await p.$eval('#bfLayer iframe', e => e.title).catch(() => ''); await shot('d1-brief-fare-studio');
          ok('launch: What a fare does opens as the Studio opens, before a fare can be changed (Bertie, 18 Oct)', /What a fare does/.test(ti), ti); if(ti) { await p.evaluate(() => window.__bf.skip()); await p.waitForTimeout(200); } }
        ok('launch (v2): the operating plan: three blocks, two active routes, the timetable full width', (await p.$$('.ad-blk')).length === 3 && (await p.$$('.s2-r')).length === 2 && !(await vis('.st-card')), [(await p.$$('.ad-blk')).length, (await p.$$('.s2-r')).length]);
        const dep = async k => +(await p.$eval(`[data-tl="0|0|${k}"]`, e => e.dataset.dep));
        await p.click('[data-tl="0|0|2"]'); await p.waitForTimeout(80); ok('launch (v2): a pressed flight puts its controls in the fixed bar under the timetable (D101)', await vis('#s2Pop.s3-insp') && await vis('[data-insm="0|0|2|5"]') && !(await p.$eval('#s2Pop', e => getComputedStyle(e).position === 'absolute')));
        const d2 = await dep(2); await p.click('[data-insm="0|0|2|5"]'); await p.waitForTimeout(60); ok('launch (v2): Later moves the flight 5 minutes (D101)', await dep(2) === d2 + 5, [d2, await dep(2)]);
        await p.focus('[data-tl="0|0|2"]'); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(60); ok('launch (v2): the arrow key moves it back onto the 10-minute grid', await dep(2) === d2, [d2, await dep(2)]);
        await p.keyboard.press('Escape'); await p.waitForTimeout(60);
        const d1 = await dep(1), bb = await (await p.$('[data-tl="0|0|1"]')).boundingBox(), lane = await (await p.$('.ad-lane')).boundingBox();
        await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(bb.x + bb.width / 2 + lane.width * 0.08, bb.y + bb.height / 2, { steps:8 }); await p.mouse.up(); await p.waitForTimeout(150);
        ok('launch (v2): a drag moves the flight, snapped to 10 minutes', await dep(1) !== d1 && (await dep(1)) % 10 === 0, [d1, await dep(1)]);
        if(!(await vis('[data-s2rt="0|1"]'))){ await p.click('[data-tl="0|0|1"]'); await p.waitForTimeout(80); }
        await p.selectOption('[data-s2rt="0|1"]', 'par'); await p.waitForTimeout(100); ok('launch (v2): Route in the flight editor changes the flight', (await S()).fleet[0].schedule[1] === 'par', (await S()).fleet[0].schedule);
        await p.click('[data-tl="0|0|1"]'); await p.waitForTimeout(100); await p.keyboard.press('Delete'); await p.waitForTimeout(100); ok('launch (v2): Delete removes the pressed flight', (await p.$$('.ad-blk')).length === 2, (await p.$$('.ad-blk')).length);
        const pf0 = (await S()).prices.par || 90; await fareTo('par', 100); ok('launch (v2): a fare in the route editor changes the fare', (await S()).prices.par === 100, (await S()).prices); await fareTo('par', pf0);
        const sumK = await p.$$eval('.s2-sum [data-sum]', es => es.map(e => e.getAttribute('data-sum'))); await p.click('#s2Tr'); await p.waitForTimeout(80); await p.click('#s2All'); await p.waitForTimeout(80);
        const drK = await p.$$eval('.s2-dr [data-sum]', es => es.map(e => e.getAttribute('data-sum'))); await p.click('#s2All'); await p.click('#s2DrX'); await p.waitForTimeout(60);
        ok('launch (v2): ƒ on the figures the sums ask for: profit in the summary (fuel is the order, D86), tickets in the drawer\'s money', sumK.includes('profit') && !sumK.includes('fuelCost') && drK.includes('revenue'), { sumK, drK });
        ok('launch (v2): no permanent fuel strip; Fuel is a toolbar button (bought as used in week 1)', !(await vis('.fstrip')) && await vis('.s2-fuel'));
        await setPlan([{ sched:['par', 'dub', 'par'], deps:[420, 640, 1080] }], { par:90, dub:90 }); await v2Checks('launch'); await shot('d1-studio'); }
      else if(s.phase === 'setup'){
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
        ok('launch: the live panel offers ƒ on the figures the sums ask for (tickets and profit)', ['revenue', 'profit'].every(async k => true) && (await p.$$eval('[data-sum]', es => es.map(e => e.getAttribute('data-sum')))).filter(k => ['revenue', 'profit'].includes(k)).length === 2, await p.$$eval('[data-sum]', es => es.map(e => e.getAttribute('data-sum'))));
        ok('launch: the fuel strip is one line: week 1 buys fuel as it is used, free on the launch days', /Fuel is bought as it is used.*free Mon–Tue/.test(await p.$eval('.fstrip', e => e.textContent.replace(/\s+/g, ' ')).catch(() => '')), await p.$eval('.fstrip', e => e.textContent.replace(/\s+/g, ' ')).catch(() => ''));
        await setPlan([{ sched:['par', 'dub', 'par'], deps:[420, 640, 1080] }], { par:90, dub:90 });
        ok('launch: both routes on the plan page', await vis('[data-pe^="0|add|dub|0"]') && await vis('[data-pe^="0|add|par|0"]')); await studioChecks('launch'); await shot('d1-studio'); }
      // a new aircraft's plan on the Monday it is first there (before the opener's checks, so a weekend service added below stays)
      if(s.fleet.length === 2 && !planned2 && day >= 15){ planned2 = day; await setPlan([{ sched:['par', 'par'], deps:[420, 1080] }, { sched:['ams', 'ams'], deps:[480, 960] }], { par:90, ams:90 }); }
      if(s.fleet.length > 2 && !planned3 && day >= 22){ planned3 = day; await setPlan([{ sched:['par', 'par'], deps:[420, 1080] }, { sched:['ams', 'ams'], deps:[480, 960] }, { sched:['mad'], deps:[540] }], { par:90, ams:90, mad:170 }); }
      if(V2 && s.phase !== 'setup' && await vis('#s2Keep, .op2')){
        if(!openerSeen){ openerSeen = true; const ch = await p.$$eval('.s2-cl li', ls => ls.map(l => l.textContent.replace(/\s+/g, ' ').trim()));
          ok(`plan ${day} (v2): from week 2 the Monday opens on last week's plan, ready to run again, with Keep plan and Edit plan and the known changes`, /ready to run again/.test(await p.textContent('.s2-oh h2')) && /Keep plan|Run anyway/.test(await p.textContent('#nx')) && await vis('#s2Edit') && ch.length >= 1 && (await p.$$('.s2-otl .ad-blk[disabled]')).length >= 1, ch); await shot(`d${day}-v2-opener`); }
        if(!newsSeen && await vis('[data-s2review]')){ newsSeen = true; const id = (await p.getAttribute('[data-s2review]', 'data-s2review')).split('|')[0]; await p.click('[data-s2review]'); await p.waitForTimeout(120);
          const n = (await S()).fleet.reduce((t, f) => t + (f.schedule || []).filter(x => x === id).length, 0);
          ok(`plan ${day} (v2): a news item's Review button opens the plan on that route: highlighted, its flights glowing, its editor open, the strip on it`, (n ? await vis(`.s2-r.focus[data-s2r="${id}"]`) : true) && await vis('.s2-ed') && (await p.$$('.s2-blk.hl')).length === n && await p.$eval('.st-strip', e => e.getAttribute('data-strip')).catch(() => null) === id && await vis('#s2Apply'), { id, n, hl:(await p.$$('.s2-blk.hl')).length }); await shot(`d${day}-v2-review`);
          await p.click('#s2Apply'); await p.waitForTimeout(100); ok(`plan ${day} (v2): Apply changes returns to the week's plan`, await vis('#s2Keep, .op2')); }
        if(await vis('.so-board-note')) ok(`plan ${day} (v2): while the board waits, Keep plan is held too`, await p.$eval('#s2Keep', e => e.disabled).catch(() => p.$eval('#nx', e => e.disabled))); }
      // D67 (Workbook v4.11): a Sat–Sun Dublin service for the rugby weekend, and what it does to the week
      if(V2 && day >= 29 && !d67 && await vis('[data-s2review^="dub|dub_rugby"]')){ d67 = { day }; const R2 = () => p.evaluate(() => window.__sim.evalIn('studio2Report()'));
        const tipsBefore = (await R2()).tips; await p.click('[data-s2review^="dub|dub_rugby"]'); await p.waitForTimeout(150); let r = await R2();
        ok(`plan ${day} (D67): the rugby (a weekend-only story) opens the plan on Sat–Sun with a Sat–Sun service preset`, r.dt === 'weekend' && r.newDays === 'weekend' && await p.$eval('#s2Nd', e => e.value).catch(() => '') === 'weekend', { dt:r.dt, newDays:r.newDays });
        ok(`plan ${day} (D67): the weekend_only_news tip fires while there is no Sat–Sun Dublin service`, tipsBefore.includes('weekend_only_news'), tipsBefore);
        await p.click('.s2-ed [data-pe="0|open|dub|0|0"]'); await p.waitForTimeout(150); r = await R2();
        const wk = await p.$$eval('.s2-blk[data-days="weekend"]', bs => bs.map(b => b.textContent.replace(/\s+/g, ' ')));
        ok(`plan ${day} (D67): the new Dublin flight is Sat–Sun, with its chip on the block`, r.days.flat().filter(v => v === 'weekend').length === 1 && wk.some(t => /Dublin/.test(t) && /Sat–Sun/.test(t)), { days:r.days, wk }); await shot(`d${day}-d67-weekend`);
        await p.click('[data-s2dt="weekday"]'); await p.waitForTimeout(120);
        ok(`plan ${day} (D67): it is not in the Mon–Fri timetable`, !(await p.$$eval('.s2-blk', bs => bs.some(b => b.getAttribute('data-days') === 'weekend'))));
        const sumTxt = await p.$eval('.s2-sum', e => e.textContent.replace(/\s+/g, ' '));
        ok(`plan ${day} (D67): the summary shows Mon–Fri and Sat–Sun seat fill side by side`, (await R2()).split && /Mon–Fri\s*\d+ \/ \d+/.test(sumTxt) && /Sat–Sun\s*\d+ \/ \d+/.test(sumTxt), sumTxt.slice(0, 140)); await shot(`d${day}-d67-split`);
        ok(`plan ${day} (D67): the weekend_only_news tip is gone once the Sat–Sun service is on`, !(await R2()).tips.includes('weekend_only_news'), (await R2()).tips);
        const ov = await p.evaluate(() => window.__sim.evalIn(`(() => { const pl = currentPlan(), j = pl.fleet.findIndex(x => (x.days || []).includes('weekend')), x = pl.fleet[j], k = x.days.indexOf('weekend'), dep = x.deps[k], p0 = planeById(x.planeId);
          UI.s2.newDays = 'weekday'; addService(0, 'par', j); const y = currentPlan().fleet[j], kk = (y.days || []).indexOf('weekday'), d2 = kk >= 0 ? y.deps[kk] : null;
          const overlap = d2 !== null && d2 < dep + TIME.roundTrip(p0, routeById('dub')) && d2 + TIME.roundTrip(p0, routeById('par')) > dep, fits = planLines(currentPlan()).fits;
          if(kk >= 0) editPlan(0, 'del', kk, 0, j); UI.s2.newDays = 'weekend'; return { overlap, fits, d2, dep, back:(currentPlan().fleet[j].days || []).join() }; })()`));
        ok(`plan ${day} (D67): a Mon–Fri flight may share its times with the Sat–Sun flight on the same aircraft (checked per day type)`, ov.overlap && ov.fits && !/weekday/.test(ov.back), ov);
        await p.click('#s2Apply'); await p.waitForTimeout(120); }
      if(V2 && d67 && !d67.after && day > d67.day){ d67.after = true;
        const wkH = (await S()).history.find(h => h.from === d67.day), dub = wkH && wkH.routes && wkH.routes.dub;
        ok(`plan ${day} (D67): rugby week flew the Sat–Sun Dublin service twice, full (the rugby doubles Dublin demand)`, !!dub && dub.trips === 2 && dub.pax === dub.seats, dub);
        const fl = await p.evaluate(d0 => window.__sim.evalIn(`JSON.stringify([0,1,2,3,4,5,6].map(q => fdDayFlights(${d0} + q).filter(f => f.route === 'dub').length))`), d67.day);
        ok(`plan ${day} (D67): no Dublin flight Monday to Friday, one on Saturday and one on Sunday`, fl === '[0,0,0,0,0,1,1]', fl);
        const rv = await p.evaluate(d0 => window.__sim.evalIn(`seatFillReviewHtml(S.history.find(h => h.from === ${d0}))`), d67.day);
        ok(`plan ${day} (D67): the week's review shows Mon–Fri and Sat–Sun seat fill`, /s2-rvsplit/.test(rv) && /Mon–Fri/.test(rv) && /Sat–Sun/.test(rv), (rv.match(/s2-rvsplit.{0,200}/) || [''])[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
        await toPlan(); await p.click('[data-s2dt="weekend"]'); await p.waitForTimeout(120); await p.click('.s2-blk[data-days="weekend"]'); await p.waitForTimeout(150); await p.keyboard.press('Delete'); await p.waitForTimeout(150);
        ok(`plan ${day} (D67): Delete removes the Sat–Sun flight, and the plan is All week again`, !(await p.evaluate(() => window.__sim.evalIn('anyDays(currentPlan())'))));
        await p.click('[data-s2dt="weekday"]'); await p.waitForTimeout(80); }
      if(V2 && day <= 22) await toPlan();
      if(day === 8){ if(s.fleet.length > 1){ await setPlan([{ sched:['par', 'par'], deps:[420, 1080] }, { sched:['dub', 'dub'], deps:[480, 960] }], { par:90, dub:80 });
          ok('day 8: two aircraft, two lanes on the timeline', (await p.$$('.ad-lane')).length === 2 && (await p.$$('.ad-blk')).length === 4); }
        if(await p.$('#worldOpen')){ await p.click('#worldOpen'); await p.waitForTimeout(150); const wt = (await p.textContent('#screen')).replace(/\s+/g, ' ');
          ok('day 8: the World report shows the fuel band, Red Kite\'s fares, a demand graph and the headlines', await vis('.wr') && /£1\.60–£1\.76/.test(wt) && (await p.$$('.wr-rk tbody tr')).length >= 2 && (await p.$$('.wr-b')).length >= 3 && /Headlines/.test(wt), wt.slice(0, 160));
          await shot(`d${day}-world`); await p.click('#wrClose'); await p.waitForTimeout(100); }
        if(await p.$('#ideaOpen')){ ok('day 8: the planner offers the Operations Model (and Help me investigate, D87)', /Operations Model/.test(await p.textContent('#ideaOpen')) && !!(await p.$('#dsInv'))); await p.click('#ideaOpen'); await p.waitForTimeout(150);
          ok('day 8: the Operations Model asks for the Build step first', await vis('.om-build') && !(await vis('.om-rt'))); await shot(`d${day}-model-build`);
          for(const x of ['Passengers', '+', 'Fare']) await p.click(`[data-omp="${x}"]`);
          ok('day 8: a wrong formula shows an error in the cell', /#ERROR/.test(await p.textContent('.om-build')), await p.$eval('.om-e', e => e.textContent).catch(() => ''));
          for(const x of ['Passengers', '×', 'Fare', 'Revenue', '−', 'Costs']) await p.click(`[data-omp="${x}"]`); await p.waitForTimeout(150);
          ok('day 8: with both formulas built the model projects the week', await vis('.om-rt') && !!((await S()).analyst || {}).built, (await S()).analyst);
          await p.click('[data-mo="fare|dub|1"]'); await p.waitForTimeout(150);
          ok('day 8: the test plan changes, What changed names it and the results show the change', /Dublin fare £\d+ → £\d+/.test(await p.textContent('.om-what')) && (await p.$$('.om-rt td.good, .om-rt td.bad')).length >= 2, await p.$eval('.om-what', e => e.textContent.replace(/\s+/g, ' ')).catch(() => ''));
          await p.click('#omSave'); await p.waitForTimeout(80); ok('day 8: the test plan can be saved', (await p.$$('.om-sv')).length === 1); await shot(`d${day}-model`);
          await p.click('#omReset'); await p.click('#omClose'); await p.waitForTimeout(100); ok('day 8: Back returns to the planner', await vis('.ad'), await T()); }
        if(V2) ok('day 8 (v2): no fuel strip; Fuel is a toolbar button with the tank\'s status, a press from the fuel desk', !(await vis('.fstrip')) && await vis('.s2-fuel[data-nav="fuel"]') && /Fuel/.test(await p.textContent('.s2-fuel')), await p.$eval('.s2-fuel', e => e.title).catch(() => ''));
        else ok('day 8: the fuel strip shows the stored fuel and the week it covers, with the fuel desk a press away', /L stored · \d+% of this week covered/.test(await p.$eval('.fstrip', e => e.textContent.replace(/\s+/g, ' ')).catch(() => '')) && await vis('.fstrip [data-nav="fuel"]'), await p.$eval('.fstrip', e => e.textContent.replace(/\s+/g, ' ')).catch(() => ''));
        await p.click('[data-tl="0|0|0"]'); const sb = await p.$('[data-svccard="0|0|0"]');
        if(sb){ await sb.click(); await p.waitForTimeout(120); const tot = await p.$eval('.sc-total .sc-v', e => e.textContent).catch(() => '');
          ok('day 8: Service costs opens the performance card with the model\'s figures (Twin Otter Paris, 120 L × £1.47)', await vis('.sc-banner') && !(await vis('.sc-p1.sign')) && tot === '£176.40', tot); await shot(`d${day}-svccard`);
          ok('day 8: the card has one method, make it whole, in three steps (1.47 × 100, one whole-number multiplication, ÷ 100)', !(await vis('[data-scm]')) && /Make the price a whole number/.test(await p.textContent('.sc-p1')) && /1\.47 × 100/.test(await p.textContent('.sc-p1')) && /Multiply the whole numbers/.test(await p.textContent('.sc-p1')) && /120 × 147/.test(await p.textContent('.sc-p1')) && !/120 × 7p|a line for each part/i.test(await p.textContent('.sc-p1')) && /Divide by 100 to put the 2 decimal places back/.test(await p.textContent('.sc-p1')), (await p.textContent('.sc-p1')).replace(/\s+/g, ' ').slice(0, 300));
          await p.click('#scBack'); await p.waitForTimeout(100); ok('day 8: Back to plan returns to the planner', await vis('.ad'), await T()); }
        if(await p.$('#mapOpen')){ await p.click('#mapOpen'); ok('day 8: the network map is a button away, with the destinations, the rival\'s fares and the demand', await vis('#hqMap') && (await p.$$('.net-dest tbody tr')).length >= 2); await shot(`d${day}-map`); await p.click('[data-nav="plan"]'); await p.waitForTimeout(60); } }
      if(day === 8 || day === 22){ await (V2 ? v2Checks : studioChecks)('day ' + day); await shot(`d${day}-studio`); }
      if(planned3 && !delChk && !(d67 && d67.day === day)){ delChk = true;   // three aircraft: the pressed flight's buttons stay on screen, and Delete removes it
        await toPlan(); const blks = await p.$$('.ad-blk[data-tl]'), n0 = blks.length; await blks[n0 - 1].click(); await p.waitForTimeout(150);
        const rm = await p.evaluate(() => { const b = document.querySelector('[data-tlrm]'), tt = document.querySelector('.st-tt'); if(!b || !tt) return 'no Remove button'; const r = b.getBoundingClientRect(), q = tt.getBoundingClientRect(); return r.height > 0 && r.top >= q.top - 1 && r.bottom <= q.bottom + 1 && r.bottom <= innerHeight ? true : [r.top, r.bottom, q.top, q.bottom].map(Math.round).join(','); });
        ok(`day ${day}: with three aircraft, a pressed flight's Remove button is on screen`, rm === true, rm); await shot('d22-studio-selected');
        await p.keyboard.press('Delete'); await p.waitForTimeout(150);
        ok(`day ${day}: pressing a flight then the Delete key removes it`, (await p.$$('.ad-blk[data-tl]')).length === n0 - 1 && !(await vis('[data-tlrm]')), (await p.$$('.ad-blk[data-tl]')).length + ' of ' + n0);
        await setPlan([{ sched:['par', 'par'], deps:[420, 1080] }, { sched:['ams', 'ams'], deps:[480, 960] }, { sched:['mad'], deps:[540] }], { par:90, ams:90, mad:170 }); }
      if(day >= 50 && !modelWide && (await toPlan(), await vis('#ideaOpen'))){ modelWide = true;   // the model page with six routes: every control inside its panel
        await p.click('#ideaOpen'); await p.waitForTimeout(150);
        for(const id of ['dub', 'fra', 'gva']) if(await p.$(`[data-madd] option[value="${id}"]`)){ await p.selectOption('[data-madd]', id); await p.waitForTimeout(150); }
        const om = await p.evaluate(() => ['.om-cur', '.om-test'].map(sel => { const pn = document.querySelector(sel), R = pn.getBoundingClientRect(); return { rows:pn.querySelectorAll('tbody tr').length, wide:pn.scrollWidth > pn.clientWidth + 1, out:[...pn.querySelectorAll('button,select')].filter(e => { const q = e.getBoundingClientRect(); return q.width && (q.left < R.left - 1 || q.right > R.right + 1); }).length }; }));
        ok(`plan ${day}: the model page shows every test-plan control with six routes (one row a route)`, om[1].rows >= 6 && om.every(x => !x.wide && !x.out), JSON.stringify(om)); await shot(`d${day}-model-wide`);
        await p.click('#omReset'); await p.waitForTimeout(100); await p.click('#omClose'); await p.waitForTimeout(150); }
      if(day >= 3){ const q = await p.$('.fw-quick [data-fo]:nth-child(2)'); if(q) await q.click(); }
      if(await vis('.so-board-note')){ await shot(`d${day}-plan-board`); ok(`plan ${day}: the board holds the plan until something changes`, await p.$eval('#nx', e => e.disabled), await p.textContent('.so-board-note'));
        const f = (await S()).prices.par === 100 ? 90 : 100; await fareTo('par', f); await p.waitForTimeout(80); boards.push(day);
        ok(`plan ${day}: a changed fare releases the plan`, !(await vis('.so-board-note')) && await p.$eval('#nx', e => !e.disabled)); }
      else if(day >= 29 && !COAST && (await p.evaluate(d => window.__sim.evalIn(`calDate(${d}).getUTCDate()`), day)) <= 7){ const f = (await S()).prices.par === 100 ? 90 : 100; await fareTo('par', f); await p.waitForTimeout(80); changes.push(day + ':par ' + f); }   // Steady: one change at the start of each month
      await shot(`d${day}-plan`); ok(`plan ${day}: continue enabled`, await p.$eval('#nx', e => !e.disabled), await p.evaluate(() => window.__sim.currentPlan().fleet.map(x => x.sched.join('/') + ' ' + (x.deps || []).join(',')))); await p.click('#nx'); continue; }
    if(t === 'workings' && await vis('.so-page')){ await fits('signoffs ' + day); await shot(`d${day}-signoffs`); await signs('work ' + day); await p.waitForTimeout(700); await shot(`d${day}-signoffs-done`); await p.click('#nx'); await p.waitForTimeout(80); continue; }
    if(t === 'workings'){ await fits('workings ' + day); const typed = await solveW(`work ${day}`); await shot(`d${day}-workings`);
      if(s.phase === 'setup') ok('launch: five sums (D86): tickets at three fares, the fare, a worked example then the fuel order, the profit; snacks ×2; the other route\'s tickets by the model; every sum built first, except the later columns of a row (the same sum, batch 1)', typed.filter(x => /\|tk_par$/.test(x)).length === 3 && !typed.some(x => /\|tk_dub/.test(x)) && typed.includes('tutorial') && typed.filter(x => /fuelorder:a\|order$/.test(x)).length === 1 && typed.filter(x => /\|profit$/.test(x)).length === 1 && typed.filter(x => /\|snack$/.test(x)).length === 2 && typed.filter(x => /\|snack build$/.test(x)).length === 1 && typed.filter(x => / build$/.test(x)).length === typed.filter(x => /^work:/.test(x) && !/ build$/.test(x)).length - 3, typed);
      if(s.phase === 'setup') ok('launch: the sums were typed into the sheet, their help under it; no route strips or timetable under the sum (batch 2, 3.3)', await vis('.sh-work') && !(await vis('.dock-sum')) && !(await vis('.wio2 .plw-mk, .wio2 .plw-tl, .wio2 .plw-strip')));
      ok(`work ${day}: back enabled`, !!(await p.$('#nx')) && await p.$eval('#nx', e => !e.disabled)); await p.click('#nx'); continue; }
    if(BRIEF && t === 'fuelDesk' && await vis('#bfLayer') && !briefSeen.fuel){ await playFuel(day, 'desk'); continue; }
    if(BRIEF && !briefSeen.prop && await vis('#upgYes')){ briefSeen.prop = true; await shot(`d${day}-upgrade-proposal`); await p.click('#upgYes'); await p.waitForTimeout(150);
      ok(`D98 fallback: the systems team proposes the weekend timetable on day ${day}; Build it grants Days`, (await p.evaluate(() => window.__sim.evalIn('JSON.stringify(S.upg.weekend_schedules)')).then(JSON.parse)).granted === day); continue; }
    if(BRIEF && t === 'brief'){ briefSeen.weekend = true; await p.waitForTimeout(600); const F = p.frameLocator('#bfLayer iframe'); await shot(`d${day}-brief-weekend-1`);
      // the scene: the days fill; he taps the weekend while it happens; his timetable slides in; then the request
      await F.locator('.bk-hud button[aria-label="Sat"]').waitFor({ timeout:15000 }); await F.locator('.bk-hud button[aria-label="Sat"]').click(); await F.locator('.bk-hud button[aria-label="Sun"]').click();
      await F.locator('.bk-go').waitFor({ timeout:40000 }); await shot(`d${day}-brief-weekend-2`); await F.locator('.bk-go').click();
      const pick = process.env.WRONG_CARD === '1' ? 'Change every day together' : 'Change weekdays and weekends separately'; await F.locator('.bk-chip', { hasText:pick }).click(); await p.waitForTimeout(3500); await shot(`d${day}-brief-weekend-3`);
      if(process.env.WRONG_CARD === '1'){ await F.locator('.bk-chip', { hasText:'Keep this choice' }).click(); }
      await F.locator('.bk-go').waitFor({ timeout:20000 }); await shot(`d${day}-brief-weekend-4`); await F.locator('.bk-go').click(); await p.waitForTimeout(400);
      const U = await p.evaluate(() => window.__sim.evalIn('JSON.stringify((S.upg||{}).weekend_schedules||null)')).then(JSON.parse);
      ok(`D98 week-2 review: the Operations Request ${process.env.WRONG_CARD === '1' ? 'with another statement leaves Days for the fallback' : 'grants the Days setting'}`, process.env.WRONG_CARD === '1' ? !U.granted && U.declined === 14 : U.granted === 14, U);
      continue; }
    if(t === 'fuelDesk'){ await fits('fuelDesk ' + day); await shot(`d${day}-fueldesk`); const txt = (await p.textContent('#screen')).replace(/\s+/g, ' ');
      { const R = JSON.parse(await p.evaluate(() => window.__sim.evalIn('JSON.stringify(fuelStoreReport())'))), m = txt.match(/Storage ?([\d,]+) L(?: \(fuel farm\))? — (about \w+ weeks?|less than a week) of flying/);   // D89: the storage line, each Monday
        caps.push([day, R.cap, R.block, R.log.length ? R.log[R.log.length - 1].week : null]);
        ok(`day ${day}: the desk's storage line "Storage ${R.cap.toLocaleString('en-GB')} L — ${m ? m[2] : '?'} of flying" (D89)`, !!m && +m[1].replace(/,/g, '') === R.cap && R.block === 1000 && (day !== 8 || R.cap === 8000), [R.cap, R.block, m && m[0]]); }
      if(day === 8){ ok('day 8: the fuel desk shows next week\'s band £1.60–£1.76 at high confidence, and today\'s £1.47', /£1\.60 – £1\.76/.test(txt) && /High/.test(txt) && /£1\.47 \/ L/.test(txt), (txt.match(/Next week's forecast.{0,60}/) || [''])[0]);
        ok('day 8: the scenario table has a row for each point of the band', (await p.$$('.fd-t tbody tr')).length >= 4, (await p.$$('.fd-t tbody tr')).length);
        ok('day 8: the desk says what an empty tank costs (the day\'s price + 10p)', /day's price \+ 10p/.test(txt)); }
      const n = day === 8 ? 3 : 2, bn = await p.$(`[data-fdb="${n}"]:not([disabled])`);
      if(bn){ await bn.click(); await p.waitForTimeout(60);
        const FO = await p.evaluate(() => window.__sim.evalIn('JSON.stringify(foPlan())')).then(JSON.parse); foLevels.push(day + ':' + (FO && FO.level));
        if(FO && !FO.signed && FO.level !== 'model'){ ok(`day ${day}: the fuel order is the week's one fuel sum: "Sum N · Week W · Fuel order: ${FO.n} × £…", Confirm waits for it (D86)`, /Fuel order: \d+ × £/.test(await p.textContent('.fd-sign .sum-h')) && await p.$eval('#fdBuy', e => e.disabled), await p.textContent('.fd-sign .sum-h'));
          if(FO.level === 'build'){ for(const x of FO.seq) await p.click(x === '×' ? '[data-foop="×"]' : `[data-fofig="${x}"]`); await p.click('#foChk'); await p.waitForTimeout(60); }
          else { await p.fill('#foIn', '1'); await p.click('#foChk'); await p.waitForTimeout(60); ok(`day ${day}: a wrong order is a Query with one more try`, await vis('.fd-sign .stamp.q') && /One more try/.test(await p.textContent('.fd-sign .sc-msg'))); await p.fill('#foIn', FO.answer); await p.click('#foChk'); await p.waitForTimeout(60); }
          ok(`day ${day}: the order (${FO.level}) is signed, then Confirm opens`, await vis('.fd-sign.ok') && await p.$eval('#fdBuy', e => !e.disabled)); await shot(`d${day}-fueldesk-signed`); }
        ok(`day ${day}: the desk shows the week's fuel by aircraft and route, worked out by the model`, await vis('.fd-ls') && (await p.$$('.fd-ls tbody tr')).length >= 2);
        const f0 = (await S()).fuel; await p.click('#fdBuy'); await p.waitForTimeout(80); const f1 = (await S()).fuel;
        ok(`day ${day}: the order of ${n} × 1,000 L goes into the tank`, Math.round(f1 - f0) === n * 1000, [f0, f1]); await shot(`d${day}-fueldesk-bought`); }
      await p.click('#nx'); continue; }
    if(t === 'audit'){ await fits('audit ' + day); await shot(`d${day}-audit`); const D = await p.evaluate(() => window.__sim.evalIn('step().data')), txt = (await p.textContent('#screen')).replace(/\s+/g, ' ');
      audits.push({ day, me:D.me, board:D.board, share:D.share, idleWeeks:D.idleWeeks, lines:D.lines.map(l => l.route + ' ' + l.pax + '×' + l.fare), missed:D.missed, best:D.best, actual:D.actual });
      ok(`day ${day}: the month-end ${D.board ? 'board review' : 'audit'} re-checks ${D.board ? 'two lines and the average day' : 'one line'}`, (await p.$$('[data-socard]')).length === (D.board ? 2 : 1) && (!D.board || await vis('[data-rbcard="mday"]')) && (D.board ? /We'd like to see a plan that tests a different fare or route/.test(txt) : /before the accounts close/.test(txt)), D.lines);
      await signs('audit ' + day); await shot(`d${day}-audit-signed`); await p.click('#nx'); continue; }
    if(t === 'rop'){ await fits('rop'); await shot(`d${day}-rop`); ok('day 28: the regular plan says the tank carries on', /The tank carries on/.test(await p.textContent('#screen'))); await p.click('#ropGo'); continue; }
    if(t === 'milestone'){ await shot(`d${day}-milestone`); await p.click('#msGo'); continue; }
    if(t === 'review'){ await fits('review ' + day); await shot(`d${day}-wkreview`); sums['wreview ' + day] = (await vis('.rbw')) ? await builds('wreview ' + day) : await solve('wreview'); if(await p.$('#calcDone')) await p.click('#calcDone'); await p.click('#nx'); continue; }
    if(t === 'sim'){ await shot(`d${day}-sim`); for(let k = 0; k < 160 && await T() === 'sim'; k++) await p.waitForTimeout(250); continue; }
    if(t === 'ready'){ await fits('ready ' + day); const en = await p.$eval('#startOps', e => !e.disabled); ok('ready ' + day, en, await p.textContent('.opplan')); if(!en){ await shot(`d${day}-ready-stuck`); break; } await p.click('#startOps'); continue; }
    if(t === 'takeoff'){ await p.click('#toGo'); for(let k = 0; k < 200 && await p.$eval('#nx', e => e.hidden); k++) await p.waitForTimeout(100); await p.click('#nx'); continue; }
    if(t === 'fly'){ for(let k = 0; k < 80 && await T() === 'fly'; k++) await p.waitForTimeout(250); continue; }
    if(t === 'results'){ await shot(`d${day}-results`); await p.click('#nx'); continue; }
    if(t === 'weekRun'){ const d0 = day; for(let k = 0; k < 120 && await T() === 'weekRun' && (await S()).day === d0; k++) await p.waitForTimeout(150); if(d0 !== lastDay){ await shot(`d${d0}-board`); lastDay = d0; } continue; }
    if(t === 'weekReview' && await vis('.rbw')){ await fits('review ' + day); await shot(`d${day}-review`);
      if(day === 7){ const f = await p.$$eval('[data-rbfig^="tot|"]', es => es.map(e => e.getAttribute('data-rbfig').split('|')[1]));
        await p.click(`[data-rbfig="tot|${f[0]}"]`); await p.click('[data-rbop="tot|×"]'); await p.click(`[data-rbfig="tot|${f[1]}"]`); await p.click('[data-rbchk="tot"]'); await p.waitForTimeout(60);
        ok('review 7: a wrong operation is a Query with a plain hint', await vis('.rb-card .stamp.q') && /which operation joins amounts together/.test(await p.textContent('.rb-msg')), await p.textContent('.rb-msg'));
        if(await p.$('[data-rbclr="tot"]')) await p.click('[data-rbclr="tot"]'); await p.click(`[data-rbfig="tot|${f[0]}"]`); await p.click('[data-rbop="tot|+"]'); await p.click(`[data-rbfig="tot|${f[1]}"]`); await p.click('[data-rbchk="tot"]'); await p.waitForTimeout(60);
        ok('review 7: wrong twice: Finance fills in the total (two tries, D86)', await vis('[data-rbcard="tot"] .stamp.fin'), await p.textContent('[data-rbcard="tot"]').then(t => t.replace(/\s+/g, ' ').slice(0, 160))); }
      const built = await builds('review ' + day); sums['review ' + day] = built;
      ok(`review ${day}: the week total, the difference and the mean are built on the sheet, then typed from the book (day 7's formula was Finance's after two tries)`, (built.includes('tot') || day === 7) && built.includes('diff') && built.some(x => /^mean÷7/.test(x)), built);
      if(day === 7){ ok('review 7: the mean asks for the divisor and shows the average day', /Average day:/.test(await p.textContent('.rbw-t'))); await shot(`d${day}-review-built`); }
      ok(`review ${day}: seat fill shows seats filled, empty seats and turned away as actuals`, await vis('.st-rv') && (await p.$$('.st-rvf > span')).length === 3, await p.$eval('.st-rv', e => e.textContent.replace(/\s+/g, ' ').slice(0, 160)).catch(() => ''));
      ok(`review ${day}: the missed-profit line`, await vis('.wk-missed'), await p.$eval('.wk-missed', e => e.textContent.replace(/\s+/g, ' ')).catch(() => ''));
      const M = (await S()).wk.missed; ok(`review ${day}: the best plan earns at least what the pupil's plan did`, M && M.best >= M.yours - 1, M && [M.yours, M.best, M.bestPlan]);
      if(day >= 15) ok(`review ${day}: use-it-or-lose-it names a route with no service (Dublin)`, /Dublin: \d+ → \d+/.test(await p.$eval('.wk-neglect', e => e.textContent).catch(() => '')), await p.$eval('.wk-neglect', e => e.textContent.replace(/\s+/g, ' ')).catch(() => ''));
      await shot(`d${day}-review-done`); await p.click('#nx'); continue; }
    if(t === 'paint'){ await shot(`d${day}-paint`); const a = await S(); ok(`paint ${day}: the new plane has its own registration`, new Set(a.fleet.map(f => f.registration)).size === a.fleet.length, a.fleet.map(f => f.registration)); await p.click('#roll'); continue; } if(t === 'reveal'){ await p.click('#skipReveal', { timeout:2000 }).catch(() => {}); for(let k = 0; k < 150 && await p.$eval('#nx', e => e.hidden); k++) await p.waitForTimeout(100); await p.click('#nx'); continue; }
    checks.push('stopped at ' + t + ' day ' + day); await shot('stop'); break; }
  }catch(e){ checks.push('FAIL exception ' + e.message.split('\n')[0] + ' (test line ' + ((String(e.stack).match(/week\.test\.js:(\d+)/) || [])[1] || '?') + ', ' + await T().catch(() => '?') + ')'); await shot('exception'); }
  const s = await S(); checks.push('end at ' + await T() + ' day ' + s.day + ' cash ' + Math.round(s.cash));
  ok('no day puts the shop in front of the pupil by itself (week, month and arrival days alike)', !shopSelf.length, shopSelf);
  // teacher milestones (15 Oct): the Steady pupil reaches more than the coasting one; each run leaves its list for the other to compare
  const MS = await p.evaluate(() => window.__sim.evalIn('JSON.stringify(msReport())')).then(JSON.parse).catch(() => null);
  if(MS && s.day >= 118){ const mine = require('os').tmpdir() + `/airline-ms-${COAST ? 'coast' : 'steady'}.json`, other = require('os').tmpdir() + `/airline-ms-${COAST ? 'steady' : 'coast'}.json`; fs.writeFileSync(mine, JSON.stringify(MS, null, 1));
    checks.push('info milestones ' + JSON.stringify(Object.fromEntries(Object.entries(MS.got).map(([k, g]) => [k, g.times]))));
    if(COAST) ok('milestones, coasting pupil: First to fly (Amsterdam) but not Never coasting', !!MS.got['1:firstToFly'] && !MS.got['1:neverCoast'], [Object.keys(MS.got), MS.ended]);
    else ok('milestones, Steady pupil: Fare tester, First to fly, Clean sheet, Saved and bought and Never coasting', ['fareTest', 'firstToFly', 'cleanSheet', 'savedBought', 'neverCoast'].every(k => MS.got['1:' + k]), [Object.keys(MS.got), MS.ended]);
    if(fs.existsSync(other)){ const n = Object.keys(MS.got).length, o = Object.keys(JSON.parse(fs.readFileSync(other, 'utf8')).got).length; ok('the Steady pupil reaches more milestones than the coasting one', COAST ? o > n : n > o, { steady:COAST ? o : n, coast:COAST ? n : o }); } }
  if(process.env.SAVE){ fs.writeFileSync(process.env.SAVE, await p.evaluate(() => window.__sim.saveCode())); checks.push('info save code written to ' + process.env.SAVE); }   // chapter2.test.js starts from this save
  if(s.day >= 28){ const calc = (s.handSumLog || []).filter(h => h.day <= 28).flatMap(h => h.tools).filter(t => !/^Practice/.test(t) && !/\(Build\)|^Build:/.test(t));   // Build steps (the reviews, the model's formulas) are not Calculate
    const count = calc.reduce((n, t) => { const m = /^Ticket revenue \(([^)]*)\)/.exec(t); return n + (m ? m[1].split(',').length : 1); }, 0) + 2;   // launch day's three fares count as three
    if(!CAP){ const ftc = calc.filter(x => /^Flight time:/.test(x)).length; ok(`weeks 1–4: about 13 Calculate steps besides the flight-times pages (D86: Launch Day 5, the week-1 tenths 2, then up to three a week; ${ftc} flight times)`, count - ftc >= 10 && count - ftc <= 16 && ftc <= 6, { count, ftc, calc }); }
    ok('the range check is the model\'s now (not logged as a sum)', !(s.handSumLog || []).some(h => h.tools.some(t => /^Range check/.test(t)))); }
  const rows = await p.evaluate(() => window.__sim.evalIn('soLogRows()')), cap = CAP || 3;
  if(rows.length){ ok(`from week 2, no week asks more than ${cap} Calculate sign-offs`, rows.every(r => r.asked.length <= cap), rows.map(r => [r.wk, r.asked.length]));
    const w = n => rows.find(r => r.wk === n) || { asked:[], build:[], model:[] };
    if(s.day >= 22 && !CAP){ ok('week 2: the time to afford (the Saab) is the Calculate sign-off; the fuel order is a Build (the price moved 17p since Launch Day, D86)', w(2).asked.some(x => /Time to afford: Saab 340/.test(x)) && w(2).build.some(x => /fuel order/.test(x)) && !w(2).asked.some(x => /Rent or buy|Fuel:/.test(x)), w(2));
      ok('week 3: Amsterdam tickets; its flight time came before the timetable, on the Flight times page; no fuel card (fuel is the weekly order, the model\'s this week)', w(3).asked.some(x => /Tickets: Amsterdam/.test(x)) && !w(3).asked.some(x => /Flight time/.test(x)) && ftpSeen.some(x => { const [d, P] = JSON.parse(x); return d === 15 && P && P.pairs.some(k => /\|ams$/.test(k)); }) && !w(3).asked.some(x => /Fuel/.test(x)) && w(3).model.some(x => /fuel order/.test(x)), w(3));
      ok('chapter 1 is buy only: no rent-or-buy sum in any week (it is first met in January)', rows.every(r => !r.asked.concat(r.build).some(x => /Rent or buy/.test(x))), rows.map(r => r.asked.concat(r.build).filter(x => /Rent|afford/.test(x)))); } }
  if(s.day >= 92){ const R = JSON.parse(await p.evaluate(() => window.__sim.evalIn('JSON.stringify(fuelStoreReport())')));
    ok('D89: the tank grows with the fleet: 8,000 L in week 2, then three weeks of the standing plan rounded up to ten blocks, never shrinking (no storage upgrade on day 29)',
      caps.length > 3 && caps[0][1] === 8000 && caps.every((c, i) => !i || c[1] >= caps[i - 1][1]) && R.log.length >= 1 && R.log.every(g => g.to % 10000 === 0 && g.to >= 3 * g.week && g.to - 10000 < 3 * g.week) && R.cap > 8000, { caps, log:R.log }); }
  if(s.day >= 92 && !CAP) ok('month ends: an audit at the start of the 4 Nov and 2 Dec weeks', audits.some(a => a.day === 64) && audits.some(a => a.day === 92), audits);
  if(COAST && s.day >= 64) ok('COAST: the plan unchanged all October brings a board review, and the plan waits for a change', audits.some(a => a.board) && boards.length > 0, { audits, boards });
  if(!COAST && s.day >= 92) ok('Steady: the plan changes each month, so no board review', !audits.some(a => a.board), { audits, changes });
  if(s.day >= 22) ok('flight times come before the timetable: a Flight times page when an aircraft meets a route for the first time, two worked out by the pupil and the rest by the model; no flight-time cards among the sums', ftpSeen.length >= 2 && ftpSeen.every(x => { const P = JSON.parse(x)[1]; return P && P.asked.length >= 1 && P.asked.length <= 2; }) && !rows.some(r => r.asked.concat(r.build).some(x => /Flight time/.test(x))), ftpSeen);
  checks.push('info studio ' + JSON.stringify(studio));
  checks.push('info audits ' + JSON.stringify(audits)); checks.push('info fuel order levels ' + JSON.stringify(foLevels)); checks.push('info changes ' + JSON.stringify(changes) + ' boards ' + JSON.stringify(boards));
  checks.push('info week log\n' + rows.map(r => `  wk ${String(r.wk).padStart(2)}  q ${r.qualified}  calc [${r.asked.join('; ')}]  build [${r.build.join('; ')}]  model [${r.model.join('; ')}]${r.carried.length ? '  carried [' + r.carried.join('; ') + ']' : ''}${r.audit ? '  ' + r.audit : ''}`).join('\n'));
  checks.push('info sums ' + JSON.stringify(sums)); checks.push('info handSumLog ' + JSON.stringify(s.handSumLog)); checks.push('info ledger profit ' + JSON.stringify((s.ledger.rev || []).map((v, i) => v == null ? null : Math.round(v - s.ledger.cost[i]))));
  console.log(checks.join('\n')); console.log('OVERFLOW', overflow.length ? overflow : 'none'); console.log('ERRORS', errors.length ? errors : 'none');
  await b.close();
})();
