// The game's model against the world engine (engine/world-engine.js), plan by plan, inside the real page.
// Run: NODE_PATH=<playwright node_modules> node src/opening/tests/engine.test.js
// The plans are the Balance Report's (Twin Otter from Heathrow T5). Fuel is the game's price on the day tested.
const { chromium } = require('playwright');
const path = require('path'), FILE = 'file://' + path.resolve(__dirname, '../../../airline-opening-prototype.html');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport:{ width:1366, height:768 } })).newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  // the setup, as a pupil would do it
  await p.click('#start'); await p.fill('#nm', 'Dragon Air'); await p.click('#nx'); await p.click('#nx'); await p.click('#nx'); await p.click('[data-ptab="name"]'); await p.fill('#regIn', 'DRAG'); await p.click('#roll'); await p.click('#skipReveal'); await p.waitForTimeout(150); await p.click('#nx'); await p.click('#nx');
  if(await p.evaluate(() => window.__sim.step().t) === 'boot') await p.click('#enterHq'); if(await p.evaluate(() => window.__sim.step().t) === 'chapter') await p.click('#chGo');
  await p.click('#nx'); await p.click('[data-mk="par"]'); await p.click('#nx');
  const res = await p.evaluate(() => {
    const { WB, WE, planOutcome, beatDay, buyPlane, planeById, fuelPrice, toMin } = window.__world, out = [], S = window.__world.getS();
    S.phase = 'round'; S.round = 7; S.day = beatDay(7);   // day 8: time-of-day demand is on and Red Kite's Dublin fares (days 4–7) are over S.onboard = 'none'; S.fuel = 0; S.fuelValue = 0; S.fuelLots = []; S.terminal = 't5';
    if(!S.fleet.length) buyPlane(planeById('dhc6'));
    const T = s => toMin(s), plans = [
      ['Dublin £90, 07:00 11:20 18:00', ['dub', 'dub', 'dub'], { dub:90 }, ['07:00', '11:20', '18:00']],
      ['Dublin £90, 2 compact', ['dub', 'dub'], { dub:90 }, ['07:00', '11:20']],
      ['Dublin £80, 3 spread', ['dub', 'dub', 'dub'], { dub:80 }, ['07:00', '11:20', '18:00']],
      ['Dublin £90, 3 compact', ['dub', 'dub', 'dub'], { dub:90 }, ['07:00', '11:20', '15:40']],
      ['Paris £90, morning + evening', ['par', 'par'], { par:90 }, ['07:00', '18:00']],
      ['Paris £90, 2 compact', ['par', 'par'], { par:90 }, ['07:00', '10:20']],
      ['Paris £100, 1 morning', ['par'], { par:100 }, ['07:00']],
      ['Mixed day Paris / Dublin / Paris', ['par', 'dub', 'par'], { par:90, dub:90 }, ['07:00', '10:20', '18:00']],
    ];
    for(const [name, sched, prices, deps] of plans){
      const pl = { sched, prices:Object.assign({}, S.prices, prices), firstDep:T(deps[0]), onboard:'none', deps:deps.map(T) };
      const g = planOutcome(pl), fuel = fuelPrice(7);
      const e = WE.day(WB, { plane:'dhc6', fuel, date:((WB.calendar || []).find(c => c.day === S.day) || {}).date, home:{ code:'LHR', terminal:'T5' }, services: sched.map((r, k) => ({ route:r, dep:deps[k], fare:pl.prices[r] })) });
      out.push({ name, fuel, game:{ pax:g.pax, rev:g.revenue, cost:Math.round(g.costs), profit:Math.round(g.profit) }, engine:{ pax:e.trips.reduce((a, t) => a + t.pax, 0), rev:e.revenue, cost:Math.round(e.costs), profit:Math.round(e.profit) } });
    }
    return out;
  });
  let fails = 0;
  for(const r of res){ const same = ['pax', 'rev', 'cost', 'profit'].every(k => r.game[k] === r.engine[k]); if(!same) fails++;
    console.log(`${same ? 'ok  ' : 'FAIL'} ${r.name} (fuel £${r.fuel.toFixed(2)}): game £${r.game.profit} · engine £${r.engine.profit}${same ? '' : '  ' + JSON.stringify(r)}`); }
  // D50: Red Kite at £50 on Dublin; the addendum's table: hold £90 → 62 × 6⁄10 = 37 stay; advertise → 62 × 8⁄10 = 50; match £50 → 96
  const rk = await p.evaluate(() => { const { WB, WE } = window.__world, run = (fare, ad) => WE.day(WB, { plane:'dhc6', fuel:1.3, date:'2030-09-06', rival:{ fare:50, routes:['dub'], advertise:ad }, home:{ code:'LHR', terminal:'T5' }, services:[{ route:'dub', dep:'07:00', fare }, { route:'dub', dep:'11:20', fare }] }).routes.dub.demand; return { hold:run(90, false), ad:run(90, true), match:run(50, false), cut80:run(80, false) }; });
  const rkOk = rk.hold === 37 && rk.ad === 50 && rk.match === 96 && rk.cut80 === 50; if(!rkOk) fails++;
  console.log(`${rkOk ? 'ok  ' : 'FAIL'} Red Kite rule (D50): hold £90 → ${rk.hold} stay, advertise → ${rk.ad}, match → ${rk.match}, cut to £80 → ${rk.cut80}`);
  console.log(errors.length ? 'ERRORS ' + errors.join(' | ') : 'ERRORS none');
  console.log(fails ? `${fails} FAILED` : 'The game prices every plan exactly as the world engine does.');
  await b.close(); process.exit(fails || errors.length ? 1 : 0);
})();
