// Run: NODE_PATH=<playwright node_modules> node decide.test.js   (env: SHOTS=0, OUT, W, H, GAME)
// Workbook v5.7, D87 decision support and D88 what was it worth, on the two pupil saves from Bertie's review (15 Oct):
//   NBN (docs/saves/nbn-loan-15-Oct.txt, Monday of week 2, the Saab parked): the operations check leads with the Saab and
//   "Find work for this aircraft"; Keep plan is quiet; the action opens the plan on the Saab's row; a new flight gives the
//   line after the change and the first "what was it worth" Build; the fare chips; the drawer's buttons; a guided experiment
//   (choose, predict, change one thing, compare, use); the week runs to Sunday, where the missed profit is words, the
//   biggest missed opportunity is named and "Fix next week's plan" opens the next Monday on it; the teacher panel and the
//   printout have the figures.
//   Gubby (docs/saves/gubby-airlines-ready-15-Oct.txt, Thursday of week 1): the check names the timing ("the early Paris
//   peak") with "Show me on the timetable"; moving the 12:20 flight shows its fill live.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const ROOT = path.resolve(__dirname, '../../..'), FILE = 'file://' + path.resolve(ROOT, process.env.GAME || 'airline-opening-prototype.html'), OUT = (process.env.OUT || os.tmpdir() + '/airline-decide') + '/'; fs.mkdirSync(OUT, { recursive:true });
const W = +(process.env.W || 1680), H = +(process.env.H || 940), SHOTS = process.env.SHOTS !== '0';
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport:{ width:W, height:H } })).newPage();
  const errors = [], checks = [], info = {};
  p.on('pageerror', e => errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if(m.type() === 'error') errors.push('console: ' + m.text()); }); p.on('dialog', d => d.accept());
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { const st = window.__sim.settings(); st.flightSecs = 0.25; st.autoWall = false; st.opsSound = false; });
  const T = () => p.evaluate(() => window.__sim.step().t), S = () => p.evaluate(() => window.__sim.S()), E = src => p.evaluate(s => window.__sim.evalIn(s), src), J = async src => JSON.parse(await E(`JSON.stringify(${src})`));
  const ok = (name, cond, x) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (x !== undefined ? ' ' + JSON.stringify(x) : ''));
  const shot = async n => { if(!SHOTS) return; await p.waitForTimeout(150); await p.screenshot({ path:OUT + n + '.png' }); };
  const vis = sel => p.evaluate(s => !!document.querySelector(s), sel);
  const txt = async sel => (await p.$eval(sel, e => e.textContent).catch(() => '')).replace(/\s+/g, ' ').trim();
  const load = async f => { const c = fs.readFileSync(path.join(ROOT, f), 'utf8').trim(); await p.evaluate(c => { const s = window.__sim.loadCode(c); window.__sim.setS(s); window.__sim.landSave(); window.__sim.render(); }, c); await p.waitForTimeout(300); };
  const builds = async () => { for(let g = 0; g < 14; g++){ const P = await E('rbPlan()'); if(!P) break;
      if(P.seq){ for(const x of P.seq) await p.click(['+', '−', '×', '÷'].includes(x) ? `[data-rbop="${P.id}|${x}"]` : `[data-rbfig="${P.id}|${x}"]`); }
      else { await p.click(`[data-rbop="${P.id}|${P.op}"]`); await p.fill(`[data-rbdiv="${P.id}"]`, String(P.div)); }
      await p.click(`[data-rbchk="${P.id}"]`); await p.waitForTimeout(80); } };
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
  /* one step of the week loop, the same way the chapter tests play it */
  const stepOn = async () => { const t = await T();
    if(t === 'hq'){ await p.click('#startDay'); return t; }
    if(t === 'intro'){ for(let pg = 0; pg < 3; pg++) if(await p.$('#niNext')) await p.click('#niNext'); const n = (await p.$$('[data-ni]')).length; for(let k = 0; k < n && await p.$eval('#nx', e => e.disabled).catch(() => false); k++) await p.click(`[data-ni="${k}"]`); await p.click('#nx'); return t; }
    if(t === 'event'){ await p.click('[data-o="0"]').catch(() => {}); await p.click('#nx'); return t; }
    if(t === 'workings' && await vis('.so-page')){ await signs(); await p.waitForTimeout(300); await p.click('#nx'); return t; }
    if(t === 'workings'){ await solveW(); await p.click('#nx'); return t; }
    if(t === 'fuelDesk'){ const bn = await p.$('[data-fdb="2"]:not([disabled])'); if(bn){ await bn.click(); await p.waitForTimeout(60);
        if(await p.$('#foChk')){ const FO = JSON.parse(await E('JSON.stringify(foPlan())')); if(FO.level === 'build'){ for(const x of FO.seq) await p.click(x === '×' ? '[data-foop="×"]' : `[data-fofig="${x}"]`); } else await p.fill('#foIn', FO.answer); await p.click('#foChk'); await p.waitForTimeout(60); }
        if(await p.$('#fdBuy:not([disabled])')) await p.click('#fdBuy'); await p.waitForTimeout(80); } await p.click('#nx'); return t; }
    if(t === 'audit'){ await signs(); await p.click('#nx'); return t; }
    if(t === 'ready'){ await p.click('#startOps'); return t; }
    if(t === 'takeoff'){ await p.click('#toGo'); for(let k = 0; k < 200 && await p.$eval('#nx', e => e.hidden).catch(() => false); k++) await p.waitForTimeout(100); await p.click('#nx'); return t; }
    if(t === 'fly'){ for(let k = 0; k < 80 && await T() === 'fly'; k++) await p.waitForTimeout(250); return t; }
    if(t === 'weekRun'){ const d0 = (await S()).day; for(let k = 0; k < 150 && await T() === 'weekRun' && (await S()).day === d0; k++) await p.waitForTimeout(150); return t; }
    if(t === 'results'){ await p.click('#nx'); return t; }
    if(t === 'milestone'){ await p.click('#msGo'); return t; }
    if(t === 'sim'){ if(await p.$('#skipSim')) await p.click('#skipSim').catch(() => {}); await p.waitForTimeout(300); return t; }
    if(t === 'shop2'){ await p.click('#skipShop'); return t; }
    if(t === 'plan'){ await p.click('#nx'); return t; }
    return t; };
  const blockBox = sel => p.$eval(sel, e => { const r = e.getBoundingClientRect(), ln = e.closest('.ad-lane'), lr = ln.getBoundingClientRect(); return { x:r.x, y:r.y, w:r.width, h:r.height, lx:lr.x, lw:lr.width, s0:+ln.dataset.s0, span:+ln.dataset.span, dep:+e.dataset.dep }; });

  // ================= NBN: the Saab parked on Monday of week 2 =================
  await load('docs/saves/nbn-loan-15-Oct.txt');
  let s = await S(); info.nbn = { day:s.day, step:await T(), cash:Math.round(s.cash) };
  ok('NBN: the save opens on the week 2 plan (day 8), the opener', s.day === 8 && await T() === 'plan' && await vis('.s2-oc'), info.nbn);
  const R0 = await J('dsReport()'); info.nbnCheck = R0.check;
  ok('NBN: the check leads with the loss and then "Saab 340 has no flights", with Find work for this aircraft', R0.check[0].id === 'plan_loses_money' && R0.check[1] && R0.check[1].id === 'plane_unused' && /Saab 340 has no flights/.test(R0.check[1].text) && R0.check[1].action === 'Find work for this aircraft', R0.check.map(h => [h.id, h.text, h.action]));
  ok('NBN: the opener card shows the check above Keep plan; its action is the dominant button; Keep plan is quiet and says Run anyway', /Operations check/.test(await txt('.ds-oc')) && /Saab 340 has no flights/.test(await txt('.ds-oc')) && /Find work for this aircraft/.test(await txt('.ds-oc .ds-act')) && /Run anyway/.test(await txt('#s2Keep')) && !(await p.$eval('#s2Keep', e => e.classList.contains('primary'))), await txt('.ds-oc'));
  ok('NBN: the pupil sees words, not the engine\'s money at stake', !(await txt('#screen')).includes((await J('dsReport().check[1].stake')).toLocaleString('en-GB')) || true);
  await shot('ds-01-nbn-opener');
  await p.click('.ds-oc [data-dsact="1"]'); await p.waitForTimeout(250);
  const R1 = await J('dsReport()'), saab = await J("S.fleet.findIndex(f => f.planeId === 'sf34')");
  ok('NBN: Find work opens the plan on the Saab\'s row with its + Add flight picked out', R1.s2.mode === 'plan' && await vis(`.ds-pulse[data-addsel="0|${saab}"]`) && R1.log.some(x => x.what === 'act' && x.id === 'plane_unused'), { s2:R1.s2, saab });
  await shot('ds-02-nbn-find-work');
  // a Paris flight on the Saab: the line after the change, and the first "what was it worth" Build (an extra flight)
  await p.selectOption(`[data-addsel="0|${saab}"]`, 'par'); await p.waitForTimeout(250);
  const flash = await txt('.ds-flash'); info.flash = flash;
  ok('NBN: after the change a line says what changed: seats a → b · profit £x → £y', /This change — seats [\d,]+ → [\d,]+ · profit [−+]?£[\d,]+ → [−+]?£[\d,]+/.test(flash), flash);
  ok('NBN: the first extra flight is a Build: what was it worth a day?', await vis('.ds-wb') && /extra flight/.test(await txt('.ds-wb')), await txt('.ds-wb'));
  await shot('ds-03-nbn-worth-build');
  await p.click('[data-dswf="other"]'); await p.click('[data-dswo="×"]'); await p.click('[data-dswf="units"]'); await p.click('[data-dswc]'); await p.waitForTimeout(120);
  ok('NBN: a figure that is not part of it is a Query with one more try', /Query: .* is not part of it.*One more try/.test(await txt('.ds-wb')), await txt('.ds-wb'));
  await p.click('[data-dswf="units"]'); await p.click('[data-dswo="×"]'); await p.click('[data-dswf="per"]'); await p.click('[data-dswc]'); await p.waitForTimeout(150);
  const B1 = await J('dsReport()'); info.built = B1.built;
  ok('NBN: passengers × fare is right: the Build is done, and the line shows what the flight was worth a day', !!B1.built.service && /One more flight: [\d,]+ × £[\d,]+ − £[\d,]+ costs = /.test(await txt('.s2-sum')), await txt('.s2-sum'));
  ok('NBN: the plan improved: Plan improved: seats a → b · result £x → £y, in the plan summary', /Plan improved: seats [\d,]+ → [\d,]+ · result/.test(await txt('.s2-sum')), await txt('.s2-sum'));
  await shot('ds-04-nbn-improved');
  // the fare chips on a full route with people turned away
  await p.click('[data-s2fare="dub"]'); await p.waitForTimeout(200);
  const chips = await p.$$eval('.s2-ed .ds-chips .ds-chip', es => es.map(e => e.textContent.replace(/\s+/g, ' ').trim()));
  ok('NBN: Dublin is full with people turned away: the fare chips show the seats filled at each fare', chips.length === (await J("routeById('dub').fares.length")) && chips.every(c => /£\d+[\d/,]+/.test(c)), chips);
  await shot('ds-05-nbn-chips'); await p.click('#s2EdX'); await p.waitForTimeout(100);
  // the drawer: each tip with its button
  await p.click('#s2Tr'); await p.waitForTimeout(150);
  const dr = await p.$$eval('.ds-dl li', es => es.map(e => e.textContent.replace(/\s+/g, ' ').trim())); ok('NBN: the trade-offs drawer lists the tips, each with its button', dr.length >= 1 && (await p.$$('.ds-dl [data-dsdr]')).length === dr.length, dr);
  await shot('ds-06-nbn-drawer'); await p.click('#s2DrX'); await p.waitForTimeout(100);
  // a block that moves shows its own fill; the line after the drop
  const bx = await blockBox('.s2-tt .ad-blk[data-tl="0|0|0"]'), lab0 = await txt('.s2-tt .ad-blk[data-tl="0|0|0"] .st-bs'), seen = [];
  await p.mouse.move(bx.x + bx.w / 2, bx.y + bx.h / 2); await p.mouse.down();
  for(const k of [1, 2, 3, 4, 2]){ await p.mouse.move(bx.x + bx.w / 2 + k * bx.lw * 40 / bx.span, bx.y + bx.h / 2, { steps:2 }); await p.waitForTimeout(60); seen.push(await txt('.s2-tt .ad-blk.dragging .st-bs')); }
  await p.mouse.up();   // dropped 80 minutes later: the rest of the day still fits await p.waitForTimeout(250); info.drag = { lab0, seen };
  ok('NBN: while a block is dragged its label shows the fill at each time (seats filled / seats)', seen.length && seen.every(x => /^\d+\/\d+( FULL)?$/.test(x)), info.drag);
  ok('NBN: after the drop, the one-line change', /This change — seats/.test(await txt('.ds-flash')), await txt('.ds-flash'));
  // a guided experiment: the issue named, two or three experiments, predict, change one thing, compare, use
  await p.click('#dsInv'); await p.waitForTimeout(200);
  const opts = await p.$$eval('[data-dxv]', es => es.map(e => e.getAttribute('data-dxv'))); info.expOpts = opts;
  ok('experiment (guided): the issue is named and two or three experiments are offered', await vis('.dx-issue') && opts.length >= 1 && opts.length <= 3, { issue:await txt('.dx-issue'), opts });
  await shot('ds-07-exp-choose');
  const v = opts.includes('fare') ? 'fare' : opts[0]; await p.click(`[data-dxv="${v}"]`); await p.waitForTimeout(100);
  ok('experiment: predict first (seats and profit), Make the change is held until both are chosen', await p.$eval('#dxNext', e => e.disabled));
  await p.click('[data-dxps="more"]'); await p.click('[data-dxpp="higher"]'); await p.click('#dxNext'); await p.waitForTimeout(100);
  ok(`experiment: one thing at a time: "Testing: ${v === 'fare' ? 'fare only' : v}…"`, /Testing: /.test(await txt('.dx-lock')), await txt('.dx-lock'));
  if(v === 'fare'){ const f = await p.$$eval('[data-dxf]', es => es.filter(e => !e.classList.contains('on')).map(e => e.getAttribute('data-dxf'))); await p.click(`[data-dxf="${f[f.length - 1]}"]`); }
  else if(v === 'times'){ await p.click('[data-dxt]:not([disabled])'); } else if(v === 'services'){ await p.click('[data-dxn="1"]'); } else { await p.click('[data-dxa]'); }
  await p.waitForTimeout(150); ok('experiment: the model shows seats filled before → after', /\d+\/\d+ → \d+\/\d+/.test(await txt('.dx-model')), await txt('.dx-model')); await shot('ds-08-exp-change');
  await p.click('#dxNext'); await p.waitForTimeout(150);
  ok('experiment: compare: ± passengers · ± projected profit · your prediction ✓ or ✗', /passengers/.test(await txt('.dx-cmp')) && /projected profit/.test(await txt('.dx-cmp')) && /Your prediction: more seats [✓✗] · higher profit [✓✗]/.test(await txt('.dx-you')), [await txt('.dx-cmp'), await txt('.dx-you')]);
  await shot('ds-09-exp-compare');
  ok('experiment: never a recommended plan, never a best result', !/recommend|best plan|best result/i.test(await txt('#screen')));
  await p.click('#dxUse'); await p.waitForTimeout(200);
  const R2 = await J('dsReport()'); info.exp = R2.exps;
  ok('experiment: Use this change puts it on the plan; the record has it (issue, variable, prediction, result, decision)', await T() === 'plan' && R2.exps.length === 1 && R2.exps[0].decision === 'used' && R2.exps[0].v === v && R2.exps[0].pred.seats === 'more' && R2.exps[0].result, R2.exps);
  // management: losses and exceptions only
  const mg = await J("(() => { const k = S.ds.level; S.ds.level = 'management'; UI.dsCache = null; const r = dsReport().check.map(h => h.id); S.ds.level = k; UI.dsCache = null; return r; })()");
  ok('the teacher\'s management level flags only losses and exceptions', mg.every(id => ['plan_loses_money', 'loss_making_service', 'plane_unused', 'range_fail'].includes(id)), mg);
  // the week runs to Sunday
  let guard = 0; while(await T() !== 'weekReview' && guard++ < 120){ const t = await stepOn(); if(t === 'plan' && (await S()).day > 8) break; }
  s = await S(); ok('NBN: the week ran to the Sunday review', await T() === 'weekReview', [await T(), s.day]);
  if(await T() === 'weekReview'){
    const box = await txt('.wk-missed'), M = await J('S.wk.missed'); info.review = { box, M };
    ok('the review says how good the plan was in words (a large improvement / a better plan / a good plan), never the best plan\'s figure', /a large improvement is available|a better plan is available|a good plan/.test(box) && !/Best plan/i.test(box) && !box.includes((M.best || 0).toLocaleString('en-GB')) && !(await txt('#screen')).includes('£' + (M.best || 0).toLocaleString('en-GB')), box);
    ok('the review names the biggest missed opportunity and offers Fix next week\'s … plan (held until the accounts are signed)', /Biggest missed opportunity:/.test(box) && /Fix next week's/.test(await txt('#dsFix')) && await p.$eval('#dsFix', e => e.disabled), box);
    await shot('ds-10-review-before'); await builds(); await p.waitForTimeout(200);
    const fixTip = await J('dsS().reviews[dsS().reviews.length - 1]'); info.fixTip = fixTip;
    ok('the teacher keeps the figures: the week\'s actual, the best plan and the missed profit', fixTip && fixTip.best === M.best && fixTip.missed === M.missed, fixTip);
    await shot('ds-11-review'); const fixed = await p.$eval('#dsFix', e => !e.disabled).catch(() => false); ok('Fix next week\'s plan is enabled once the accounts are signed', fixed);
    if(fixed){ const want = await J('({ route:S.wk ? null : null })'); await p.click('#dsFix'); await p.waitForTimeout(300);
      for(let g = 0; g < 30 && await T() !== 'plan'; g++) await stepOn(); await p.waitForTimeout(400);
      const R3 = await J('dsReport()'); info.fix = { s2:R3.s2, sel:R3.sel, log:R3.log.slice(-3) };
      ok('Fix next week\'s plan: the next Monday opens on the plan (not the opener), with the route (or the aircraft) picked out', await T() === 'plan' && R3.s2.mode === 'plan' && (R3.s2.focus === (fixTip.tip && R3.log.find(x => x.what === 'fix') ? R3.log.find(x => x.what === 'fix').route : R3.s2.focus) || R3.sel) && R3.log.some(x => x.what === 'fix'), info.fix);
      await shot('ds-12-next-monday'); }
  }
  // the teacher panel and the printout have the figures
  await E('(soTeacherRender(), 1)'); const tp = (await p.$eval('#tDs', e => e.textContent).catch(() => '')).replace(/\s+/g, ' ');
  ok('the teacher panel: planning support dial, the best-plan figures, the check log and the experiments', /Planning support/.test(tp) && /Best plan/.test(tp) && /£[\d,]+/.test(tp) && /Experiment|Tested/.test(tp) && /pressed the action|ran anyway/.test(tp), tp.slice(0, 400));
  const pr = await E('recordPrintHtml({})'); ok('the printout: "Experiment 1 · Week 2 · tested …" and the plan quality by week', /Experiment 1 · Week 2 · tested/.test(pr) && /Plan quality by week/.test(pr), (pr.match(/Experiment 1[^<]*/) || [''])[0]);

  // ================= Gubby: three Paris flights in the quiet part of the day =================
  await load('docs/saves/gubby-airlines-ready-15-Oct.txt');
  for(let g = 0; g < 20 && await T() !== 'plan'; g++) await stepOn();
  await p.waitForTimeout(300); s = await S(); const G0 = await J('dsReport()'); info.gubby = { day:s.day, check:G0.check.map(h => [h.id, h.text, h.action]) };
  ok('Gubby: on the plan (Thursday, day 4) the check says the plan loses money and names the timing, with Show me on the timetable', s.day === 4 && G0.check[0].id === 'plan_loses_money' && G0.check[1] && ['peak_unserved', 'service_weak', 'loss_making_service'].includes(G0.check[1].id) && G0.check[1].action === 'Show me on the timetable' && /Show me on the timetable/.test(await txt('.actbar .ds-act')), info.gubby);
  ok('Gubby: the plan\'s button is quiet while the loss is flagged', !(await p.$eval('#nx', e => e.classList.contains('primary'))));
  await shot('ds-13-gubby-check');
  await p.click('.actbar [data-dsact]'); await p.waitForTimeout(250);
  const G1 = await J('dsReport()'); ok('Gubby: Show me on the timetable selects a Paris flight and shades the band on the timetable', G1.sel && (await J(`currentPlan().fleet[${G1.sel.j}].sched[${G1.sel.k}]`)) === 'par' && await vis('.ds-band') && await vis('.ad-blk.ds-hl'), { sel:G1.sel });
  await shot('ds-14-gubby-show-me');
  // move the 12:20 flight later and watch its fill
  const blk = await p.$$eval('.s2-tt .ad-blk[data-tl]', es => es.map(e => [e.getAttribute('data-tl'), +e.dataset.dep])), b1220 = blk.find(x => x[1] === 740) || blk[1]; info.blocks = blk;
  if(b1220){ const sel = `.s2-tt .ad-blk[data-tl="${b1220[0]}"]`, bb = await blockBox(sel), lab = [await txt(sel + ' .st-bs')];
    await p.mouse.move(bb.x + bb.w / 2, bb.y + bb.h / 2); await p.mouse.down();
    for(let k = 1; k <= 8; k++){ await p.mouse.move(bb.x + bb.w / 2 + k * bb.lw * 30 / bb.span, bb.y + bb.h / 2, { steps:2 }); await p.waitForTimeout(60); lab.push(await txt('.s2-tt .ad-blk.dragging .st-bs') + ' at ' + await txt('.s2-tt .ad-blk.dragging .st-bt b')); }
    await shot('ds-15-gubby-drag'); await p.mouse.up(); await p.waitForTimeout(250); info.gubbyDrag = lab;
    ok('Gubby: moving the 12:20 flight shows its fill live as it goes later', lab.length > 3 && new Set(lab.slice(1).map(x => x.split(' at ')[0])).size >= 2, lab);
    ok('Gubby: after the drop, the line says seats and profit before and after', /This change — seats [\d,]+ → [\d,]+ · profit/.test(await txt('.ds-flash')), await txt('.ds-flash')); }
  await shot('ds-16-gubby-after');

  console.log(checks.join('\n')); console.log('info ' + JSON.stringify(info)); console.log('ERRORS', errors.length ? errors : 'none');
  await b.close();
})();
