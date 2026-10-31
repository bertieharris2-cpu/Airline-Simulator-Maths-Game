// The chapter-one Jump to… test airlines (Bertie, 30 Oct 2026: "jump straight to any pause in chapter one with a TEST save").
// A new TEST airline (testStart) is run with the teacher's toolkit, its answers and auto-plan, and saved at each pause:
// Launch Day, P1 to P5 (the Sunday reviews of weeks 1 to 5) and the chapter-one review. A second Twin Otter joins the day
// the shop opens (Settings secondPlaneShopFromDay: day 22, the start of week 4, since hand-off 1c), as a pupil buying one would. The build embeds the saves, gzipped, in Jump to….
// Run after a change to chapter one, then rebuild:  node tools/make_ch1_jumps.js && python3 src/opening/build.py
const path = require('path'), fs = require('fs');
const { chromium } = require(require.resolve('playwright', { paths:[process.env.NODE_PATH || '/opt/node22/lib/node_modules'] }));
const ROOT = path.join(__dirname, '..'), GAME = 'file://' + path.join(ROOT, 'airline-opening-prototype.html'), OUT = path.join(ROOT, 'src/opening/tests/fixtures/jumps-ch1');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport:{ width:1366, height:768 } }), errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto(GAME); await p.waitForTimeout(800);
  await p.evaluate(() => { const s = window.__sim.settings(); s.flightSecs = 0.2; s.autoWall = false; s.opsSound = false; });
  await p.evaluate(() => window.__tk.enter()); await p.waitForTimeout(200); await p.evaluate(() => window.__c1.testStart()); await p.waitForTimeout(300);
  const E = s => p.evaluate(x => window.__sim.evalIn(x), s), at = () => E('JSON.stringify({ day:S.day, t:step().t, wp:(roundData(S.round) || {}).weekPhase || null, end:!!S.finished })').then(JSON.parse);
  const index = [], keep = async (n, label) => { const code = await p.evaluate(() => window.__sim.saveCode()), d = await at(), f = `ch1-${n}.txt`;
    fs.writeFileSync(path.join(OUT, f), code + '\n'); index.push({ file:f, label, day:d.day }); console.log('saved', f, label, JSON.stringify(d)); };
  fs.mkdirSync(OUT, { recursive:true });
  await keep(0, 'Chapter one · Launch Day (TEST start)');
  // Run does not know the Launch Day openers (Enter HQ, the chapter card, Your first week): press their own button
  const OPEN = ['#enterHq', '#chGo', '#b1Go', '#nx:not([disabled])', '#startDay'];
  const step = async stop => { const d0 = await at();
    if(['boot', 'chapter', 'brief1'].includes(d0.t)){ for(const sel of OPEN){ if(await p.$(sel)){ await p.click(sel); await p.waitForTimeout(400); return; } } }
    await p.evaluate(s => window.__tk.run(s), stop); await p.waitForTimeout(60);
    const d1 = await at(); if(d1.day === d0.day && d1.t === d0.t){ for(const sel of OPEN){ if(await p.$(sel)){ await p.click(sel).catch(() => {}); await p.waitForTimeout(300); break; } } } };
  const P = [[7, 'P1'], [14, 'P2'], [21, 'P3'], [28, 'P4'], [35, 'P5']], SHOP = +(await E('+WBS().secondPlaneShopFromDay || 15'));
  for(const [day, name] of P){
    for(let g = 0; g < 60; g++){ const d = await at(); if(d.day >= day && (d.t === 'review' || d.wp === 'review')) break;
      if(d.day === SHOP && d.t === 'plan' && !(await E('S.c1jumpPlane || 0'))){   // a second Twin Otter the day the shop opens
        await E("(S.c1jumpPlane = 1, acquirePlane(planeById('dhc6'), 'buy'), render(), 1)"); await p.evaluate(() => window.__tk.autoPlan()); }
      await step(d.day < SHOP && day > SHOP && !(await E('S.c1jumpPlane || 0')) ? 'plan' : 'review'); }
    const lab = await E(`dateShort(S.day)`); await keep(day / 7, `Chapter one · ${name} · ${lab}: week ${day / 7} accounts`);
  }
  for(let g = 0; g < 400; g++){ const d = await at(); if(d.day >= 85 || d.t === 'chapterReview' || d.t === 'protoEnd' || d.end) break; await step('plan'); }
  // the last month: Run goes straight through the chapter accounts, so it is stopped the moment they open
  await p.evaluate(() => { window.__c1stop = setInterval(() => { try{ if(window.__sim.evalIn("step().t") === 'chapterReview') window.__tk.stop(); }catch(e){} }, 20); });
  for(let g = 0; g < 60; g++){ const d = await at(); if(d.t === 'chapterReview' || d.t === 'protoEnd' || d.end) break; await step('review'); }
  await p.evaluate(() => clearInterval(window.__c1stop));
  await keep(6, `Chapter one · the chapter-one review · ${await E('dateShort(S.day)')}`);
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1) + '\n');
  console.log('errors', errs.length ? errs.slice(0, 5) : 'none'); await b.close();
})();
