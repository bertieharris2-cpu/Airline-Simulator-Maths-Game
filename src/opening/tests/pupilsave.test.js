// Run: NODE_PATH=<playwright node_modules> node pupilsave.test.js
// Real pupils' saves made ready for today's chapter-one game:
//   BR (tools/saves/ready_br_week2.py, 2 Nov 2026): it loads on the week-2 Sunday accounts with his airline as he left it, the
//     week's sums are today's, and Monday 16 Sep opens week 3 on his plan.
//   GY (tools/saves/ready_gy_week2.py, 5 Nov 2026): it loads on Thu 12 Sep, mid-week 2, with no crew-sickness card (events are
//     parked in chapter one); the rest of week 2 flies, today's Sunday accounts follow, and Monday 16 Sep opens week 3 on his plan.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '../../..', process.env.GAME || 'airline-opening-prototype.html');
const CODE = f => fs.readFileSync(path.join(__dirname, 'fixtures', f), 'utf8').trim();
(async () => {
  const b = await chromium.launch(), checks = [];
  const ok = (name, cond, info) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (info !== undefined ? ' ' + JSON.stringify(info) : ''));
  async function open(code, slow){
    const p = await (await b.newContext({ viewport:{ width:1366, height:768 } })).newPage(), errors = [];
    p.on('pageerror', e => errors.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);
    await p.evaluate(s => { const st = window.__sim.settings(); st.flightSecs = s ? 600 : 0.2; st.autoWall = false; st.opsSound = false; }, !!slow);
    await p.keyboard.press('Control+Shift+T'); await p.waitForSelector('#teacher:not([hidden])'); await p.fill('#tCode', code); await p.click('#tCodeLoad'); await p.waitForTimeout(150);
    const note = (await p.evaluate(() => document.querySelector('#teacher').innerText)).match(/Saved on[^\n]*/);
    const first = await p.evaluate(() => window.__sim.evalIn(`JSON.stringify({ day:S.day, t:step().t, cash:Math.round(S.cash * 100) / 100, done:S.wk && S.wk.dayDone, ev:!!(S.rnd && S.rnd.event) })`));
    await p.keyboard.press('Escape'); const cl = await p.$('#tClose'); if(cl) await cl.click().catch(() => {}); await p.waitForTimeout(300);
    const E = s => p.evaluate(x => window.__sim.evalIn(x), s), at = async () => JSON.parse(await E('JSON.stringify({ day:S.day, t:step().t })'));
    return { p, errors, note, first:JSON.parse(first), E, at };
  }
  async function toMonday(G){
    const { p, at } = G;
    await p.evaluate(() => { window.__sim.settings().tkAutoPlan = false; window.__tk.enter(); }); await p.waitForTimeout(300);
    for(let i = 0; i < 12 && (await at()).t !== 'plan'; i++){ await p.evaluate(() => window.__tk.run('plan')); await p.waitForTimeout(200);
      const n = await p.$('#nx:not([disabled]), #c7Pics'); if((await at()).t !== 'plan' && n) await n.click().catch(() => {}); }
  }

  // ---------- BR: end of week 2 ----------
  { const G = await open(CODE('pupil-BR-week2-ready-ASIM5.txt')), { p, E } = G;
    const s0 = JSON.parse(await E(`JSON.stringify({ day:S.day, t:step().t, name:S.airline.name, cash:Math.round(S.cash), plan:S.fleet[0].schedule.join(','), deps:S.fleet[0].deps, prices:S.prices, fuel:Math.round(S.fuel), upg:S.upg, repBank:S.repBank })`));
    ok('BR · the save loads on the week-2 Sunday accounts (Sun 15 Sep), as he left his airline', s0.day === 14 && s0.t === 'weekReview' && s0.cash === 22618 && s0.plan === 'par,dub,dub,par' && s0.fuel === 3840 && s0.prices.dub === 80 && s0.prices.par === 90, s0);
    ok("BR · the teacher panel says where it carries on", !!G.note && /Sunday accounts/.test(G.note[0]), G.note && G.note[0]);
    ok('BR · the sheet is today\'s: Σ SUM for the week', !!(await p.$('section.ash')) && /Σ SUM/.test(await p.evaluate(() => document.querySelector('#screen').innerText)));
    ok('BR · no weekend upgrade offered yet and no stars banked by parked events', JSON.stringify(s0.upg) === '{}' && s0.repBank === 0);
    await toMonday(G);
    const s1 = JSON.parse(await E(`JSON.stringify({ day:S.day, t:step().t, plan:S.fleet[0].schedule.join(','), ids:S.record.entries.map(e => e.id), wk2:S.record.entries.filter(e => e.day === 14).map(e => e.key) })`));
    ok('BR · Monday 16 Sep opens week 3 on his own plan', s1.day === 15 && s1.t === 'plan' && s1.plan === 'par,dub,dub,par', s1);
    ok('BR · his record has one of each week-2 sum, ids in order', new Set(s1.ids).size === s1.ids.length && s1.wk2.filter(k => k === 'rb:tot').length === 1 && s1.wk2.filter(k => k === 'rb:mean').length === 1, s1.wk2);
    ok('BR · no page errors', !G.errors.length, G.errors.slice(0, 3));
    await p.context().close(); }

  // ---------- GY: Thursday of week 2 ----------
  { const G = await open(CODE('pupil-GY-week2-ready-ASIM5.txt'), true), { p, E, at } = G;   // slow flights, to see where it lands
    const s0 = JSON.parse(await E(`JSON.stringify({ name:S.airline.name, plan:S.fleet[0].schedule.join(','), deps:(S.deps || []).join(','), price:S.prices.par, fuel:S.fuel, repBank:S.repBank })`));
    ok('GY · the save loads on Thu 12 Sep, mid-week 2, as he left his airline, with no crew-sickness card', G.first.day === 11 && G.first.t === 'weekRun' && G.first.cash === 3550.2 && G.first.done === 10 && !G.first.ev && s0.plan === 'par,par,par' && s0.deps === '540,740,940' && s0.price === 90 && s0.fuel === 0 && s0.repBank === 0.5, Object.assign({}, G.first, s0));
    ok('GY · the teacher panel says where it carries on', !!G.note && /operations board from Thu 12 Sep/.test(G.note[0]), G.note && G.note[0]);
    await p.evaluate(() => { window.__sim.settings().flightSecs = 0.2; });
    for(let i = 0; i < 60 && (await at()).t === 'weekRun'; i++) await p.waitForTimeout(500);
    const s1 = JSON.parse(await E(`JSON.stringify({ day:S.day, t:step().t, rows:(S.wk.rows || []).map(r => r.d).join(','), sigma:/Σ SUM/.test(document.querySelector('#screen').innerText) })`));
    ok('GY · the rest of week 2 flies (Thu to Sun), then today\'s Sunday accounts with Σ SUM', s1.day === 14 && s1.t === 'weekReview' && s1.rows === '8,9,10,11,12,13,14' && s1.sigma, s1);
    await toMonday(G);
    const s2 = JSON.parse(await E(`JSON.stringify({ day:S.day, t:step().t, plan:S.fleet[0].schedule.join(','), ids:S.record.entries.map(e => e.id) })`));
    ok('GY · Monday 16 Sep opens week 3 on his own plan', s2.day === 15 && s2.t === 'plan' && s2.plan === 'par,par,par', s2);
    ok('GY · his record ids are in order', new Set(s2.ids).size === s2.ids.length, s2.ids);
    ok('GY · no page errors', !G.errors.length, G.errors.slice(0, 3));
    await p.context().close(); }

  console.log(checks.join('\n')); console.log(`\n${checks.filter(c => c.startsWith('ok')).length} ok, ${checks.filter(c => c.startsWith('FAIL')).length} failed`);
  await b.close(); process.exit(checks.some(c => c.startsWith('FAIL')) ? 1 : 0);
})();
