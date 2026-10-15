// Run: NODE_PATH=<playwright node_modules> node milestones.test.js   (env: GAME)
// Teacher milestones (Bertie, 15 Oct 2026): each rule and each guard on made-up weeks fed to the engine, the Awarded tick
// through a save code, the teacher panel and the printout, and nothing on the pupil's screen.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), FILE = 'file://' + path.resolve(__dirname, '../../..', process.env.GAME || 'airline-opening-prototype.html');
const FIX = n => fs.readFileSync(path.join(__dirname, 'fixtures', n), 'utf8').trim();
(async () => {
  const b = await chromium.launch(), p = await (await b.newContext({ viewport:{ width:1366, height:900 } })).newPage(), errors = [], checks = [];
  p.on('pageerror', e => errors.push(e.message)); p.on('dialog', d => d.accept());
  const ok = (name, cond, info) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (info !== undefined ? ' ' + JSON.stringify(info) : ''));
  const E = s => p.evaluate(x => window.__sim.evalIn(x), s), J = async s => JSON.parse(await E(`JSON.stringify(${s})`));
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(c => { const s = window.__sim.loadCode(c); window.__sim.setS(s); window.__sim.landSave(); window.__sim.render(); }, FIX('gubby-ASIM5.txt'));
  // the helper: decision entries (routes = [id, flights, fare]), history a day at a time, audits, sums; then the engine
  await E(`(window.msT = C => {
    S.phase = 'round'; S.day = C.day || 60; delete S.ms; S.record = { v:1, pupil:'', entries:[], notes:{}, pend:{ events:[], fleet:[] } };
    S.audits = C.audits || []; S.hunts = C.hunts || {}; S.capCh = C.capCh || {}; S.fuelWeeks = C.fuelWeeks || {}; S.history = [];
    const plan = rs => ({ fleet:[{ uid:1, plane:'Twin Otter', reg:'', flights:rs.flatMap(([id, n]) => Array.from({ length:n }, (_, k) => ({ route:id, city:routeById(id).city, dep:(7 + 3 * k) + ':00', days:'all' }))) }], fares:rs.filter(r => r[1] > 0).map(([id, n, fare]) => ({ id, city:routeById(id).city, fare })), onboard:'low' });
    (C.entries || []).forEach((e, i) => { S.record.entries.push({ id:'d' + i, type:'decision', key:'dec:' + e.from, from:e.from, to:e.to, day:e.from, label:'Week ' + weekNo(e.from), chapter:chapterNo(e.from), plan:plan(e.routes), changed:[], events:[], fleet:[], news:[], proj:e.proj === undefined ? null : e.proj, actual:e.actual === undefined ? null : e.actual, fuel:e.fuel || { L:0, cost:0, adv:0 }, stars:3 });
      for(let d = e.from; d <= e.to; d++){ const routes = {}; e.routes.filter(r => r[1] > 0).forEach(([id, n, fare]) => { const f = e.fareOn && e.fareOn[d] && e.fareOn[d][id] !== undefined ? e.fareOn[d][id] : fare, seats = 19 * n; routes[id] = { pax:Math.round(seats * (e.fill || 0.8)), seats, trips:n, fare:f, rev:0, cost:0, profit:e.profit === undefined ? 100 : e.profit }; });
        S.history.push({ type:'day', from:d, to:d, routes, profit:0, revenue:0, costs:0, pax:0, seats:0 }); } });
    (C.calcs || []).forEach((c, i) => S.record.entries.push({ id:'c' + i, type:'calc', key:c.key || ('so:x' + i), day:c.day, attempts:c.attempts, status:c.attempts[c.attempts.length - 1].ok ? 'checked' : 'query' }));
    msEval(); return msReport(); }, 1)`);
  const T = C => J(`msT(${JSON.stringify(C)})`), has = (r, k) => !!r.got[k];
  const wk = (from, routes, x) => Object.assign({ from, to:from + 6, routes }, x || {});

  // a change counts once: A → B → A → B
  let r = await T({ entries:[wk(8, [['par', 3, 90]]), wk(15, [['par', 3, 100]]), wk(22, [['par', 3, 90]]), wk(29, [['par', 3, 100]])] });
  ok('Fare tester: a fare moved up, down and up again counts the first time only', has(r, '1:fareTest') && r.got['1:fareTest'].times === 1 && r.got['1:fareTest'].day === 15, r.got['1:fareTest']);
  r = await T({ entries:[wk(8, [['par', 3, 90]]), wk(15, [['par', 3, 100]], { fareOn:{ 15:{ par:90 }, 16:{ par:90 } } })] });
  ok('Fare tester: a fare that changed part-way through the week does not count', !has(r, '1:fareTest'), r.got);
  r = await T({ entries:[wk(8, [['par', 3, 90]]), wk(15, [['par', 3, 100]])], audits:[{ me:14, day:15, board:true, idleWeeks:4, share:0.3 }] });
  ok('Fare tester: a change made while the board waits does not count', !has(r, '1:fareTest'), r.got);
  r = await T({ day:130, entries:[wk(112, [['par', 3, 90]]), { from:119, to:126, routes:[['par', 3, 120]] }, wk(127, [['par', 3, 90]])] });
  ok('The Christmas holiday (days 119–126) is not judged', !Object.keys(r.got).some(k => /fareTest/.test(k)), r.got);
  // full plane: above the starting fare, at a profit
  r = await T({ entries:[wk(8, [['par', 3, 100]], { fill:0.95 })] });
  ok('Full plane: 95% full at £100 (Paris starts at £90)', has(r, '1:fullPlane'), r.got['1:fullPlane']);
  r = await T({ entries:[wk(8, [['par', 3, 90]], { fill:1 })] });
  ok('Full plane: not at the starting fare (a Twin Otter fills at £90 by itself)', !has(r, '1:fullPlane'), r.got);
  r = await T({ entries:[wk(8, [['par', 3, 110]], { fill:0.95, profit:-50 })] });
  ok('Full plane: not at a loss', !has(r, '1:fullPlane'), r.got);
  // on target: only with a new plan
  r = await T({ entries:[wk(8, [['par', 3, 90]], { proj:10000, actual:9800 }), wk(15, [['par', 3, 100]], { proj:10000, actual:9700 })] });
  ok('On target: within 5% of the projection in a week with a new plan (and not in the week with the old one)', has(r, '1:onTarget') && r.got['1:onTarget'].day === 15 && r.got['1:onTarget'].times === 1, r.got['1:onTarget']);
  // news reader: the Dublin rugby (announced Mon 23 Sep, the match on Sat 5 Oct)
  const before = [wk(15, [['par', 2, 90], ['dub', 1, 90]]), wk(22, [['par', 2, 90], ['dub', 1, 90]])];
  r = await T({ entries:before.concat([wk(29, [['par', 2, 90], ['dub', 1, 120]])]) });
  ok('News reader: the Dublin fare raised for the rugby weekend', has(r, '1:newsReader') && /Dublin fare £90 → £120/.test(r.got['1:newsReader'].evidence), r.got['1:newsReader']);
  r = await T({ entries:before.concat([wk(29, [['par', 3, 90]])]) });
  ok('News reader: dropping Dublin before the rugby does not count', !has(r, '1:newsReader'), r.got);
  // first to fly: Amsterdam opens Mon 16 Sep
  r = await T({ entries:[wk(8, [['par', 3, 90]]), wk(15, [['par', 2, 90], ['ams', 1, 80]])] });
  ok('First to fly: Amsterdam flown in the first plan after it opened', has(r, '1:firstToFly') && /Amsterdam/.test(r.got['1:firstToFly'].evidence), r.got['1:firstToFly']);
  r = await T({ entries:[wk(8, [['par', 3, 90]]), wk(15, [['par', 3, 90]]), wk(22, [['par', 2, 90], ['ams', 1, 80]])] });
  ok('First to fly: a week later does not count', !has(r, '1:firstToFly'), r.got);
  // clean sheet: a challenge Query does not spoil it; a Query on a sum does
  const right = { ok:true }, wrong = { ok:false };
  r = await T({ entries:[wk(8, [['par', 3, 90]])], calcs:[{ day:8, attempts:[right] }, { day:9, attempts:[right] }, { day:10, attempts:[right] }, { key:'ch:1', day:10, attempts:[wrong, right] }] });
  ok('Clean sheet: three sums right first time (a Captain\'s challenge Query is not counted)', has(r, '1:cleanSheet'), r.got['1:cleanSheet']);
  r = await T({ entries:[wk(8, [['par', 3, 90]])], calcs:[{ day:8, attempts:[right] }, { day:9, attempts:[wrong, right] }, { day:10, attempts:[right] }] });
  ok('Clean sheet: one Query in the week and it is not reached', !has(r, '1:cleanSheet'), r.got);
  // the month audits
  r = await T({ audits:[{ me:30, day:36, share:0.3 }, { me:61, day:64, share:0.08 }] });
  ok('Close the gap (8% missed) and Shrink the gap (30% → 8%)', has(r, '1:closeGap') && has(r, '1:shrinkGap'), r.got);
  // never coasting: decided at the review (day 118)
  const weeks = gap => Array.from({ length:16 }, (_, k) => wk(1 + 7 * k, [['par', 3, 90 + 10 * Math.floor(k / gap)]]));
  r = await T({ day:120, entries:weeks(4), audits:[{ me:91, day:92, board:true, idleWeeks:0, share:0.1 }] });
  ok('Never coasting: a new plan every 4 weeks (an overdraft board review does not block it)', has(r, '1:neverCoast') && r.ended['1'].gap <= 35, r.ended['1']);
  r = await T({ day:120, entries:weeks(4), audits:[{ me:61, day:64, board:true, idleWeeks:5, share:0.3 }] });
  ok('Never coasting: not with a board review for an unchanged plan', !has(r, '1:neverCoast') && r.ended['1'].idleBoards === 1, r.ended['1']);
  r = await T({ day:120, entries:weeks(6) });
  ok('Never coasting: not with 6 weeks between new plans', !has(r, '1:neverCoast') && r.ended['1'].gap > 35, r.ended['1']);
  r = await T({ day:60, entries:weeks(4).slice(0, 8) });
  ok('Never coasting: not decided before the chapter review', !has(r, '1:neverCoast') && !r.ended['1'], r.ended);
  // hunts and challenges (chapter 2)
  r = await T({ day:200, hunts:{ h1:{ state:'found' } }, capCh:{ 1:{ state:'won', won:134 } } });
  ok('Spot the mistake and Captain\'s challenge in chapter 2', has(r, '2:spotMistake') && has(r, '2:captain') && r.got['2:captain'].day === 134, r.got);
  // saved and bought
  const sb = await J(`(() => { msT({ day:15 }); S.waitFor = { pid:'sf34', from:8, price:22000 }; S.cash = 60000; acquirePlane(planeById('sf34'), 'buy'); const a = msReport();
    msT({ day:10 }); S.waitFor = { pid:'sf34', from:8, price:22000 }; S.cash = 60000; acquirePlane(planeById('sf34'), 'buy'); return [a.got['1:savedBought'] || null, msReport().got['1:savedBought'] || null]; })()`);
  ok('Saved and bought: saving from day 8 and buying the Saab on day 15; not after two days', !!sb[0] && /Saab 340/.test(sb[0].evidence) && !sb[1], sb);
  // the workbook sheet overrides the draft row by row
  const row = await J(`(() => { WB.teacherMilestones = [{ id:'fullPlane', threshold:0.5, title:'Packed out', chapters:'2-3' }]; const r = msRow('fullPlane'); WB.teacherMilestones = []; return r; })()`);
  ok('A Milestones sheet row overrides the title, threshold and chapters', row.title === 'Packed out' && row.threshold === 0.5 && JSON.stringify(row.chapters) === '[2,3]', row);
  // the teacher: Awarded in the code, the panel, the printout; the pupil sees nothing
  await T({ entries:[wk(8, [['par', 3, 90]]), wk(15, [['par', 3, 100]], { fill:0.95 })] });
  await E(`(S.ms.awarded['1:fareTest'] = 16, save(), 1)`);
  const code = await p.evaluate(() => window.__sim.saveCode()), back = await p.evaluate(c => window.__sim.loadCode(c).ms, code);
  ok('Awarded is kept in the save code', back && back.awarded['1:fareTest'] === 16 && !!back.got['1:fullPlane'], back && back.awarded);
  await E('(S.overlay = null, render(), 1)');
  ok('Nothing about milestones on the pupil\'s screen', !/Fare tester|Full plane|Never coasting|Milestone/i.test(await p.textContent('#screen')));
  await p.keyboard.press('Control+Shift+T'); await p.waitForSelector('#teacher:not([hidden])'); await p.waitForTimeout(200);
  const panel = (await p.textContent('#tMs').catch(() => '')).replace(/\s+/g, ' ');
  ok('The teacher panel lists the milestones by chapter, reached and not yet, with Awarded ticked', /Chapter 1/.test(panel) && /Fare tester/.test(panel) && /not yet/.test(panel) && await p.$eval('[data-msaw="1:fareTest"]', e => e.checked).catch(() => false), panel.slice(0, 200));
  await p.click('[data-msaw="1:fullPlane"]'); await p.waitForTimeout(80);
  ok('Ticking Awarded saves it', (await J('S.ms.awarded'))['1:fullPlane'] > 0);
  const pr = await E(`recordPrintHtml({ range:'all' })`);
  ok('The record printout has a Milestones table with the Awarded tick', /<h2>Milestones<\/h2>/.test(pr) && /Fare tester/.test(pr) && /tick/.test(pr));
  console.log(checks.join('\n')); console.log('ERRORS', errors.length ? errors : 'none'); await b.close();
})();
