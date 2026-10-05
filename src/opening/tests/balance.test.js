// The world engine against data/Balance-Report.md: every figure the report states, from the imported workbook.
// The game rounds as at school (halves up); the report's engine rounded halves to even. That moves three figures,
// marked "school rounding" below with the report's figure beside them. Everything else is exactly the report's.
// Run: node src/opening/tests/balance.test.js   (no browser needed). Re-run tools/import_world.py after editing the workbook.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../../..');
const WE = require(path.join(ROOT, 'src/opening/engine/world-engine.js'));
const W = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/opening/parts/p2_data.html'), 'utf8').match(/id="data-workbook">(.*?)<\/script>/s)[1]);
const FUEL = 1.2, MORNING = '07:00', EVENING = '18:00', hm0 = WE.home(W, 'LHR', 'T5');

let fails = 0;
const ok = (name, cond, got) => { if(!cond) fails++; console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}${cond ? '' : '  got ' + JSON.stringify(got)}`); };
const day = (plane, services, mult) => WE.day(W, { plane, fuel:FUEL, services, mult });
const pounds = d => Math.round(d.profit);

// The report's timetables: 1 morning, 1 evening, 2 back-to-back, 2 morning + evening, 3 back-to-back, 3 spread.
function timetables(plane, route){
  const P = W.aircraft.find(a => a.id === plane), b2b = n => WE.backToBack(W, P, hm0, Array(n).fill(route), MORNING);
  return { '1 morning':[MORNING], '1 evening':[EVENING], '2 back-to-back':b2b(2), '2 morning + evening':[WE.hm(MORNING), WE.hm(EVENING)],
           '3 back-to-back':b2b(3), '3 spread':b2b(2).concat([WE.hm(EVENING)]) };
}
function plans(route, plane, mult, only){
  const out = [], R = W.routes.find(r => r.id === route);
  for(const fare of R.fareOptions) for(const [name, deps] of Object.entries(timetables(plane, route))){
    if(only && !only(name, fare)) continue;
    const d = day(plane, deps.map(t => ({ route, dep:t, fare })), { [route]: mult || 1 });
    if(d.ok) out.push({ fare, name, deps:deps.map(t => WE.clock(WE.hm(t))).join(', '), profit:pounds(d), pax:d.trips.reduce((a, t) => a + t.pax, 0) });
  }
  return out.sort((a, b) => b.profit - a.profit);
}
const best = (...a) => plans(...a)[0];
const at = (route, plane, fare, name) => plans(route, plane, 1, (n, f) => n === name && f === fare)[0];

console.log('Week 1 routes, Twin Otter');
const dub = best('dub', 'dhc6');
ok('Dublin best: £90, 3 services (07:00, 11:20, 18:00) = £1,142', dub.fare === 90 && dub.deps === '07:00, 11:20, 18:00' && dub.profit === 1142, dub);
ok('Dublin runner-up: £90, 2 compact = £898', plans('dub', 'dhc6')[1].profit === 898 && at('dub', 'dhc6', 90, '2 back-to-back').profit === 898, plans('dub', 'dhc6')[1]);
const d80 = at('dub', 'dhc6', 80, '3 spread');
ok('Dublin £80 with three full planes = £827', d80.pax === 57 && d80.profit === 827, d80);
ok('Dublin three compact services lose the evening = £802', at('dub', 'dhc6', 90, '3 back-to-back').profit === 802, at('dub', 'dhc6', 90, '3 back-to-back'));
const par = best('par', 'dhc6');
ok('Paris best: £90, morning + evening = £1,052', par.fare === 90 && par.name === '2 morning + evening' && par.profit === 1052, par);
ok('Paris £90, 2 compact = £792 (school rounding; report £877)', at('par', 'dhc6', 90, '2 back-to-back').profit === 792, at('par', 'dhc6', 90, '2 back-to-back'));
ok('Paris: the most compact timetable does not win', !par.name.includes('back-to-back'));
const p3 = plans('par', 'dhc6', 1, n => n.startsWith('3'))[0], p2 = plans('par', 'dhc6', 1, n => n.startsWith('2'))[0];
ok('Paris: a third service never pays', p3.profit < p2.profit, { p3, p2 });
ok('Paris: £80 and £100 both earn less than £90', [80, 100].every(f => plans('par', 'dhc6', 1, (n, x) => x === f)[0].profit < 1052));
const mixed = day('dhc6', [{ route:'par', dep:'07:00', fare:90 }, { route:'dub', dep:'10:20', fare:90 }, { route:'par', dep:'18:00', fare:90 }]);
ok('Mixed day Paris 07:00 / Dublin 10:20 / Paris 18:00 = £1,801', mixed.ok && pounds(mixed) === 1801, [mixed.problems, mixed.profit]);
ok('Mixed day beats either route alone', pounds(mixed) > dub.profit && pounds(mixed) > par.profit);

console.log('Week 2 routes (best plan per cell; "loses" = no plan makes a profit)');
const TABLE = [
  ['Amsterdam', 'ams', 1, 1950, 2513, 1812],
  ['Frankfurt', 'fra', 1, 601, 1100, 7],   // school rounding: Saab and ATR best at £100 (report £1,185 and £92 at £120)
  ['Geneva, September (×0.5)', 'gva', 0.5, 140, 'loses', 'loses'],
  ['Geneva, January (×1.4)', 'gva', 1.4, 1620, 2827, 2468],
  ['Barcelona, September (×1.1)', 'bcn', 1.1, 460, 2090, 1845],
  ['Barcelona, November (×0.6)', 'bcn', 0.6, 80, 640, 'loses'],
];
TABLE.forEach(([name, r, m, ...want]) => ['dhc6', 'sf34', 'at72'].forEach((p, i) => {
  const b = best(r, p, m), got = b.profit > 0 ? b.profit : 'loses';
  ok(`${name}, ${W.aircraft.find(a => a.id === p).name}: ${typeof want[i] === 'number' ? '£' + want[i].toLocaleString('en-GB') : want[i]}`, got === want[i], b);
}));
ok('Amsterdam is the Saab\'s route: the ATR has more seats and earns less', best('ams', 'at72').profit < best('ams', 'sf34').profit);
ok('Twin Otter stays the right plane for Paris', ['sf34', 'at72'].every(p => best('par', p).profit < par.profit));

console.log('Threshold placements (people at a fare)');
const ppl = (r, f, m) => WE.roundSchool(W.routes.find(x => x.id === r).demandAtFare[String(f)] * (m || 1));
[['dub', 90, 62], ['dub', 100, 44], ['dub', 110, 30], ['par', 90, 50], ['par', 120, 20], ['ams', 90, 76], ['ams', 100, 56], ['fra', 120, 50], ['gva', 110, 70, 1.4], ['bcn', 140, 59, 1.1]]
  .forEach(([r, f, n, m]) => ok(`${r} £${f}${m ? ' ×' + m : ''} → ${n}`, ppl(r, f, m) === n, ppl(r, f, m)));

console.log(fails ? `${fails} FAILED` : 'All Balance Report figures reproduced.');
process.exit(fails ? 1 : 0);
