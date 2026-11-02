// Run: NODE_PATH=<playwright node_modules> node pupilsave.test.js
// A real pupil's save made ready for today's chapter-one game (tools/saves/ready_br_week2.py, 2 Nov 2026): it loads on the
// week-2 Sunday accounts with his airline as he left it, the week's sums are today's, and Monday 16 Sep opens week 3 on his plan.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '../../..', process.env.GAME || 'airline-opening-prototype.html');
const CODE = fs.readFileSync(path.join(__dirname, 'fixtures', 'pupil-BR-week2-ready-ASIM5.txt'), 'utf8').trim();
(async () => {
  const b = await chromium.launch(), p = await (await b.newContext({ viewport:{ width:1366, height:768 } })).newPage(), errors = [], checks = [];
  p.on('pageerror', e => errors.push(e.message)); p.on('dialog', d => d.accept());
  const ok = (name, cond, info) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (info !== undefined ? ' ' + JSON.stringify(info) : ''));
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
  await p.evaluate(() => { const st = window.__sim.settings(); st.flightSecs = 0.2; st.autoWall = false; st.opsSound = false; });
  await p.keyboard.press('Control+Shift+T'); await p.waitForSelector('#teacher:not([hidden])'); await p.fill('#tCode', CODE); await p.click('#tCodeLoad'); await p.waitForTimeout(800);
  const note = (await p.evaluate(() => document.querySelector('#teacher').innerText)).match(/Saved on[^\n]*/);
  await p.keyboard.press('Escape'); const cl = await p.$('#tClose'); if(cl) await cl.click().catch(() => {}); await p.waitForTimeout(300);
  const E = s => p.evaluate(x => window.__sim.evalIn(x), s), at = async () => JSON.parse(await E('JSON.stringify({ day:S.day, t:step().t })'));
  const s0 = JSON.parse(await E(`JSON.stringify({ day:S.day, t:step().t, name:S.airline.name, cash:Math.round(S.cash), plan:S.fleet[0].schedule.join(','), deps:S.fleet[0].deps, prices:S.prices, fuel:Math.round(S.fuel), upg:S.upg, repBank:S.repBank })`));
  ok('the BR save loads on the week-2 Sunday accounts (Sun 15 Sep), as he left his airline', s0.day === 14 && s0.t === 'weekReview' && s0.cash === 22618 && s0.plan === 'par,dub,dub,par' && s0.fuel === 3840 && s0.prices.dub === 80 && s0.prices.par === 90, s0);
  ok("the teacher panel says where it carries on", !!note && /Sunday accounts/.test(note[0]), note && note[0]);
  ok('the sheet is today\'s: Σ SUM for the week', !!(await p.$('section.ash')) && /Σ SUM/.test(await p.evaluate(() => document.querySelector('#screen').innerText)));
  ok('no weekend upgrade offered yet and no stars banked by parked events', JSON.stringify(s0.upg) === '{}' && s0.repBank === 0);
  await p.evaluate(() => { window.__sim.settings().tkAutoPlan = false; window.__tk.enter(); }); await p.waitForTimeout(300);
  for(let i = 0; i < 12 && (await at()).t !== 'plan'; i++){ await p.evaluate(() => window.__tk.run('plan')); await p.waitForTimeout(200);
    const n = await p.$('#nx:not([disabled]), #c7Pics'); if((await at()).t !== 'plan' && n) await n.click().catch(() => {}); }
  const s1 = JSON.parse(await E(`JSON.stringify({ day:S.day, t:step().t, plan:S.fleet[0].schedule.join(','), ids:S.record.entries.map(e => e.id), wk2:S.record.entries.filter(e => e.day === 14).map(e => e.key) })`));
  ok('Monday 16 Sep opens week 3 on his own plan', s1.day === 15 && s1.t === 'plan' && s1.plan === 'par,dub,dub,par', s1);
  ok('his record has one of each week-2 sum, ids in order', new Set(s1.ids).size === s1.ids.length && s1.wk2.filter(k => k === 'rb:tot').length === 1 && s1.wk2.filter(k => k === 'rb:mean').length === 1, s1.wk2);
  ok('no page errors', !errors.length, errors.slice(0, 3));
  console.log(checks.join('\n')); console.log(`\n${checks.filter(c => c.startsWith('ok')).length} ok, ${checks.filter(c => c.startsWith('FAIL')).length} failed`);
  await b.close(); process.exit(checks.some(c => c.startsWith('FAIL')) ? 1 : 0);
})();
