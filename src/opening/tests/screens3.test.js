// Run: NODE_PATH=<playwright node_modules> node screens3.test.js   (env: SHOTS=0, OUT, GAME)
// Screens brief 3 (Fable, 17 Oct 2026; workbook v5.17), driven by the teacher's own test toolkit (D102):
//  1. the toolkit: test mode makes a TEST copy and puts the pupil's game aside untouched; Run goes to the next plan; Jump to
//     builds a test airline at a point on the Steady path; leaving brings the pupil's game back as it was;
//  2. D101: the fuel price of weeks 4 and 5 (the Market rows taken from v5.17); the demand shape and its one-line caption for
//     a lone flight (adaptToOnlyFlight); the fixed inspector under the timetable (Later moves 5 minutes); the folded routes;
//     a week's results (the profit, against last week and the plan; revenue − costs = profit), the weekly graph's tabs and the
//     Coming up strip on Home, all seen while Run plays a week; the daily colour limit (two a week at most, none the week
//     after) over the first eighteen weeks.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const FILE = 'file://' + path.resolve(__dirname, '../../..', process.env.GAME || 'airline-opening-prototype.html'), OUT = (process.env.OUT || os.tmpdir() + '/airline-screens3') + '/'; fs.mkdirSync(OUT, { recursive:true });
const SHOTS = process.env.SHOTS !== '0', KEY = 'airlineOpening.v1.state', TK = 'airlineOpening.v1.test';
const FIX = n => fs.readFileSync(path.join(__dirname, 'fixtures', 'jumps', n), 'utf8').trim();
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport:{ width:1366, height:768 } })).newPage();
  const errors = [], checks = [], info = {};
  p.on('pageerror', e => errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if(m.type() === 'error') errors.push('console: ' + m.text()); }); p.on('dialog', d => d.accept());
  const ok = (name, cond, x) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (x !== undefined ? ' ' + JSON.stringify(x) : ''));
  const E = src => p.evaluate(s => window.__sim.evalIn(s), src), J = async src => JSON.parse(await E(`JSON.stringify(${src})`));
  const vis = sel => p.evaluate(s => !!document.querySelector(s), sel);
  const txt = async sel => (await p.$eval(sel, e => e.textContent).catch(() => '')).replace(/\s+/g, ' ').trim();
  const shot = async n => { if(!SHOTS) return; await p.waitForTimeout(150); await p.screenshot({ path:OUT + n + '.png' }); };
  const pupil = () => p.evaluate(k => localStorage.getItem(k), KEY), index = () => p.evaluate(k => JSON.parse(localStorage.getItem(k) || 'null'), TK);
  const tk = (fn, ...a) => p.evaluate(([f, a]) => window.__tk[f](...a), [fn, a]);

  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { const st = window.__sim.settings(); st.briefings = false; st.autoWall = false; st.opsSound = false; });
  // the pupil's game: Week 2, Monday (day 8), saved as a pupil's game is
  await p.evaluate(c => { const s = window.__sim.loadCode(c); window.__sim.setS(s); window.__sim.landSave(); window.__sim.render(); }, FIX('day-8.txt'));
  await E('(save(), 1)'); const mine = await pupil(), mineDay = JSON.parse(mine).day; info.pupil = { day:mineDay, cash:Math.round(JSON.parse(mine).cash) };

  // ================= 1. the toolkit =================
  await tk('enter'); await p.waitForTimeout(200); let s = await J('{ test:S.test, day:S.day, mode:settings.testMode }');
  ok('test mode: a TEST copy of the airline, and the bar says so', s.mode === true && s.test && /^TEST copy of /.test(s.test.label) && /TEST MODE — nothing here counts/.test(await txt('#testBar')), s.test);
  ok("test mode: the pupil's save is put aside, unchanged", (await pupil()) === mine);
  await shot('s3-01-test-bar');
  await p.click('#tkTools'); await p.waitForTimeout(100); const jumps = await p.$$eval('#tkJump option', os => os.map(o => o.value).filter(Boolean)); info.jumps = jumps;
  ok('Tools: Jump to lists the test airlines built from the chapter tests (Launch Day to Chapter 4)', ['d1', 'd8', 'd22', 'd43', 'd127', 'd365'].every(k => jumps.includes(k)), jumps);
  await shot('s3-02-tools'); await p.click('#tkTools'); await p.waitForTimeout(60);
  let runMsg = await tk('run', 'plan'); s = await J('{ day:S.day, t:step().t }'); if(s.day === mineDay){ runMsg = await tk('run', 'plan'); s = await J('{ day:S.day, t:step().t }'); }   // from Home, the next plan is today's
  ok('Run ▶ plays on to the next plan (sums answered, the week flown, the review signed)', s.t === 'plan' && s.day === mineDay + 7, { s, runMsg });
  ok("…and the pupil's save is still as it was; the test airline is saved apart", (await pupil()) === mine && ((await index()) || { list:[] }).list.length === 1, await index());

  // ================= 2. D101 on test airlines =================
  // the fuel price by week (Market rows from v5.17: week 4 £1.62, week 5 £1.74)
  const fuel = await J('[22, 29].map(d => fuelOn(d))'); ok('fuel: week 4 at £1.62 a litre, week 5 at £1.74 (v5.17 Market)', Math.abs(fuel[0] - 1.62) < 0.005 && Math.abs(fuel[1] - 1.74) < 0.005, fuel);
  await tk('jump', 'd29'); await p.waitForTimeout(400); s = await J('{ day:S.day, t:step().t, label:S.test && S.test.label }');
  ok('Jump to Week 5: a test airline on the Steady path, labelled as a jump', s.day >= 26 && s.day <= 57 && /^Jump: Week 5/.test(s.label || ''), s);
  // Week 9: three routes (Madrid has one flight, the ATR's): the Studio with its demand shape, inspector and folded routes
  await tk('jump', 'd57'); await p.waitForTimeout(400); s = await J('{ day:S.day, t:step().t }');
  if(s.t !== 'plan'){ await tk('run', 'plan'); s = await J('{ day:S.day, t:step().t }'); }
  if(await vis('#s2Edit')){ await p.click('#s2Edit'); await p.waitForTimeout(150); }
  const routes = await J('[...new Set(currentPlan().fleet.flatMap(x => x.sched))]'), shapes = {};
  for(const r of routes) shapes[r] = await p.evaluate(id => window.__ds.shape(id), r);
  const lone = routes.find(r => shapes[r] && shapes[r].flights.length === 1 && shapes[r].bands.some(o => o.move > 0)); info.lone = lone && { route:lone, flight:shapes[lone].flights[0], W:shapes[lone].W };
  ok('the demand shape: each route\'s five bands (must fly then) and its any-time passengers add up to the people who want to fly', routes.every(r => { const D = shapes[r]; return D && D.bands.length === 5 && Math.abs(D.bands.reduce((t, o) => t + o.want, 0) + D.flex - D.W) <= 3; }), routes.map(r => [r, shapes[r] && shapes[r].W]));
  if(lone){ const F = shapes[lone].flights[0], band = shapes[lone].bands.find(o => o.b === F.band), moved = shapes[lone].bands.reduce((t, o) => t + o.move, 0);
    ok(`adaptToOnlyFlight: the lone ${lone} flight can catch its own band, the any-time passengers and some who wanted another time (${F.catch})`, F.catch >= band.want + shapes[lone].flex && moved > 0, { F, moved });
    const at = await J(`(() => { const pl = currentPlan(); for(let j = 0; j < pl.fleet.length; j++){ const k = pl.fleet[j].sched.indexOf('${lone}'); if(k >= 0) return { j, k }; } return null; })()`);
    await E(`(UI.tlSel = { i:0, j:${at.j}, k:${at.k} }, render(), 1)`); await p.waitForTimeout(200);
    const cap = await txt('.ds-cap'); info.caption = cap;
    ok('selecting it lights its slice and the caption says it in one line ("The HH:MM can catch N of the W — …")', /^The \d\d:\d\d can catch [\d,]+ of the [\d,]+ — .+\./.test(cap) && await vis('.ds-col.lit') && await vis('.ds-af.lit'), cap);
    ok('the inspector sits in a fixed bar under the timetable', await vis('#s2Pop.s3-insp') && (await p.$eval('#s2Pop', e => getComputedStyle(e).position)) !== 'absolute');
    await shot('s3-03-demand-shape');
    const dep0 = await J(`actualDeps(currentPlan(), ${at.j})[${at.k}]`); await p.click(`[data-insm="0|${at.j}|${at.k}|5"]`); await p.waitForTimeout(150);
    const dep1 = await J(`actualDeps(currentPlan(), ${at.j})[${at.k}]`); ok('Later moves the flight 5 minutes', dep1 === dep0 + 5, [dep0, dep1]);
    await p.click(`[data-insm="0|${at.j}|${at.k}|-5"]`); await p.waitForTimeout(120); await p.keyboard.press('Escape'); await p.waitForTimeout(80); }
  else ok('a route with one flight and a band it leaves empty, for the demand shape', false, routes);
  if(routes.length > 2){ ok(`more than two routes fold to one line with a chip a route (${routes.length})`, await vis('#s3Open') && (await p.$$('.s3-chip')).length === routes.length, await txt('.s3-line')); await shot('s3-04-folded'); }

  // Run a week from here, noting what passes on the way: the results, the weekly graph, Coming up on Home
  await p.evaluate(() => { const seen = window.__seen = { res:[], graph:0, cu:[], cunw:[], ft:[] };
    new MutationObserver(() => { const q = s => document.querySelector(s), t = e => e.textContent.replace(/\s+/g, ' ').trim();
      const r = q('.s3-res'); if(r && !seen.res.includes(t(r))) seen.res.push(t(r)); if(q('[data-wgtab]')) seen.graph++;
      const c = q('.kpis .cu'); if(c && !seen.cu.includes(t(c))) seen.cu.push(t(c)); const n = q('.cu-nw'); if(n && !seen.cunw.includes(t(n))) seen.cunw.push(t(n));
      const f = q('.ft3-t'); if(f && !seen.ft.includes(t(f))) seen.ft.push(t(f)); }).observe(document.body, { childList:true, subtree:true }); });
  await tk('run', 'plan'); await tk('run', 'plan'); const seen = await p.evaluate(() => window.__seen); info.seen = { res:seen.res.slice(0, 2), cu:seen.cu.slice(0, 1), cunw:seen.cunw.slice(0, 1), graph:seen.graph, ft:seen.ft.length };
  const R0 = seen.res[0] || '';
  ok("a week's results: the profit first, then against last week and the plan", /£[\d,]+ (profit|loss)/.test(R0) && /than last week|the same as last week/.test(R0) && /Planned £[\d,]+ · /.test(R0), R0.slice(0, 200));
  ok('…then revenue − costs = profit, the seats filled and the cash line', /Revenue£[\d,]+−Costs£[\d,]+=(Profit|Loss)£[\d,]+/.test(R0) && /% of seats filled/.test(R0) && /Cash [+−]£[\d,]+/.test(R0), R0.slice(0, 400));
  ok("people we couldn't carry are an opportunity (quiet, folded), not a red figure", !/No seat/.test(R0) && (!/couldn't carry/.test(R0) || /Opportunity/.test(R0)));
  await p.click('[data-nav="finance"]'); await p.waitForTimeout(250); const tabs = await p.$$eval('[data-wgtab]', es => es.map(e => [e.getAttribute('data-wgtab'), e.getAttribute('aria-selected')]));
  ok('the weekly graph: tabs Weeks (the default) and This week by day', tabs.length === 2 && tabs[0][1] === 'true', tabs); await shot('s3-06-weekly-graph');
  if(tabs[1]){ await p.click(`[data-wgtab="${tabs[1][0]}"]`); await p.waitForTimeout(150); ok('…and the other tab switches the graph', (await p.$eval(`[data-wgtab="${tabs[1][0]}"]`, e => e.getAttribute('aria-selected'))) === 'true'); }
  ok('Home: Coming up, NOW and NEXT from the Roadmap sheet', seen.cu.some(c => /NOW/.test(c) && /NEXT/.test(c)), seen.cu.slice(0, 2));

  // the daily colour limit (dailyColourLimit): over weeks 2–18, at most two a week, never an item the week before had
  await tk('jump', 'd127'); await p.waitForTimeout(500);
  const dc = await J('Object.entries(S.dcLog || {}).map(([d, x]) => [+d, x.id])'), byW = {}; dc.forEach(([d, id]) => (byW[Math.ceil(d / 7)] = byW[Math.ceil(d / 7)] || []).push(id));
  const ws = Object.keys(byW).map(Number).sort((a, b) => a - b); info.colour = byW;
  ok(`daily colour: ${dc.length} lines in ${ws.length} weeks, at most two a week`, dc.length > 0 && ws.every(w => byW[w].length <= 2), byW);
  ok('…and never the same item in a week, or one the week before had', ws.every(w => new Set(byW[w]).size === byW[w].length && !(byW[w - 1] || []).some(id => byW[w].includes(id))), byW);

  // leaving test mode: the pupil's game as it was
  await tk('leave'); await p.waitForTimeout(300); s = await J('{ day:S.day, test:!!S.test, mode:!!settings.testMode, cash:Math.round(S.cash) }');
  ok("Leave test mode: the pupil's game is back as it was (same day and cash, no TEST label, no bar)", !s.mode && !s.test && s.day === mineDay && s.cash === info.pupil.cash && await p.$eval('#testBar', e => e.hidden), s);
  const was = JSON.parse(mine), now = JSON.parse(await pupil()), diff = [...new Set([...Object.keys(was), ...Object.keys(now)])].filter(k => JSON.stringify(was[k]) !== JSON.stringify(now[k]));
  ok("…and the pupil's save holds what it held (only the menu it reopens on, and the empty briefings record the menu starts, are new)", diff.every(k => k === 'overlay' || (k === 'brief' && was.brief === undefined && JSON.stringify(now.brief) === '{"seen":{}}')), diff.map(k => [k, now[k]]));
  const kept = ((await index()) || { list:[] }).list.length; await tk('deleteAll'); ok(`Delete all test airlines empties their store (${kept} kept, at most four)`, kept >= 1 && kept <= 4 && ((await index()) || { list:[] }).list.length === 0, kept);

  checks.push('info ' + JSON.stringify(info));
  console.log(checks.join('\n')); console.log('ERRORS', errors.length ? errors : 'none');
  await b.close(); process.exit(checks.some(c => c.startsWith('FAIL')) || errors.length ? 1 : 0);
})();
