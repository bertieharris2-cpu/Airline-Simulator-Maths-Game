// Run: NODE_PATH=<playwright node_modules> node d104.test.js   (env: GAME)
// D104 (Fable, workbook v6.0): the two autumn tracks, the six curveballs and their effects, growth that responds to how a
// route is served, the stars from week 3 with chapter 1's drivers, the demand ranges for new routes, and nothing after year one.
// The choices are made through the game's own applyEventNow from the teacher's Jump to… saves; the rest on made-up weeks.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), FILE = 'file://' + path.resolve(__dirname, '../../..', process.env.GAME || 'airline-opening-prototype.html');
const JUMP = d => fs.readFileSync(path.join(__dirname, 'fixtures', 'jumps', `day-${d}.txt`), 'utf8').trim();
(async () => {
  const b = await chromium.launch(), p = await (await b.newContext({ viewport:{ width:1366, height:768 } })).newPage(), errors = [], checks = [];
  p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if(m.type() === 'error') errors.push('console: ' + m.text()); }); p.on('dialog', d => d.accept());
  const ok = (name, cond, info) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (info !== undefined ? ' ' + JSON.stringify(info) : ''));
  const E = s => p.evaluate(x => window.__sim.evalIn(x), s), J = async s => JSON.parse(await E(`JSON.stringify(${s})`));
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { const st = window.__sim.settings(); st.briefings = false; st.autoWall = false; });
  const load = async (d, track) => { await p.evaluate(c => { const s = window.__sim.loadCode(c); window.__sim.setS(s); window.__sim.landSave(); window.__sim.render(); }, JUMP(d)); await p.waitForTimeout(200);
    if(track) await E(`(S.track = '${track}', d104Ensure(), render(), 1)`); };
  // a curveball chosen on the airline's own beat: the event as the game builds it, then the game's applyEventNow
  const choose = (id, k, day) => J(`(() => { const ev = d104Event('${id}'); ${day ? `ev.day = ${day};` : 'ev.day = S.day;'} S.rnd.event = ev; S.rnd.eventDay = ev.day; delete S.rnd.eventChoice; applyEventNow(${k}); return { cost:S.rnd.eventCost || 0, d:S.d104 || {}, rep:S.rep, bank:S.repBank || 0, disrupt:S.disrupt || null }; })()`);
  const flights = d => J(`withDay(${d}, () => planFlights()).map(f => ({ route:f.route, uid:f.uid, dep:f.dep, sold:f.sold, seats:f.seats, price:f.price, revenue:f.revenue, cancelled:!!f.cancelled, grounded:!!f.grounded, charter:!!f.charter, why:(f.reasons || []).join(' ') }))`);

  // ---------- 1 · the two autumns ----------
  await load(8, 'A');
  const beats = () => J(`WORLD.rounds.filter(w => w.day <= 80).map(w => { const ev = w.event ? [w.event] : (w.events || []); return ev.length ? { day:w.day, ev:ev.map(e => e.id + ':' + ((e.options || []).length)) } : null; }).filter(Boolean)`);
  const A = await beats(), at = (L, d) => (L.find(x => x.day === d) || { ev:[] }).ev;
  ok('track A: the undercut (day 4), the storm (5), the school trip (9), crew (11), the Dublin strike (17), the snack supplier (23)', at(A, 4)[0] === 'undercut_dub:3' && at(A, 5)[0] === 'storm:3' && at(A, 9)[0] === 'school_trip:2' && at(A, 11)[0] === 'crew:3' && at(A, 17)[0] === 'dub_strike:2' && at(A, 23)[0] === 'snack_supplier:2', A.slice(0, 8));
  ok('track A weeks: the sponsorship (29), the slot squeeze (36), the tanker beside the fuel shock (43), the fault with its three choices (50), the price war with three (71)', at(A, 29).includes('sponsor_club:2') && at(A, 36).includes('slot_squeeze:1') && at(A, 43).includes('tanker_offer:2') && at(A, 43).some(x => /^fuel_shock/.test(x)) && at(A, 50).includes('fault:3') && at(A, 71).includes('price_war:3'), A.filter(x => x.day >= 29));
  const newsA = await J(`WORLD.routeNews.filter(n => n.start < '2030-12-01').map(n => n.id)`);
  await E(`(S.track = 'B', d104Ensure(), 1)`);
  const B = await beats(), newsB = await J(`WORLD.routeNews.filter(n => n.start < '2030-12-01').map(n => n.id)`);
  ok('track B: no undercut, Dublin strike, sponsorship or slot squeeze; the fault moves to day 18 and the storm to day 24', !at(B, 4).length && !B.some(x => x.ev.some(e => /^(undercut_dub|dub_strike|sponsor_club|slot_squeeze)/.test(e))) && at(B, 18)[0] === 'fault_b:3' && at(B, 24)[0] === 'storm_b:3', B);
  ok('track B: the curveballs on both tracks stay (school trip 9, snack supplier 23, tanker 43); crew sickness joins the tanker; the price war is week 8 (day 50)', at(B, 9)[0] === 'school_trip:2' && at(B, 23)[0] === 'snack_supplier:2' && at(B, 43).includes('tanker_offer:2') && at(B, 43).includes('crew_b:3') && at(B, 50).includes('price_war_b:3'), B.filter(x => x.day >= 43));
  ok('track B news: the Dublin concert and the Amsterdam fair replace the rugby and Milan\'s fair', newsB.includes('dub_concert') && newsB.includes('ams_fair') && !newsB.includes('dub_rugby') && !newsB.includes('mxp_trade_fair') && newsA.includes('dub_rugby') && newsA.includes('mxp_trade_fair') && !newsA.includes('dub_concert'), { A:newsA, B:newsB });
  const conc = await J(`WORLD.routeNews.find(n => n.id === 'dub_concert')`);
  ok('the concert: Dublin ×1.8 on Saturday 5 October, announced on 23 September', conc && conc.mult === 1.8 && conc.start === '2030-10-05' && conc.announce === '2030-09-23' && conc.routes[0] === 'dub', conc);
  // the week with two cards (track B, week 7): the crew card follows the tanker's, both before the plan
  const st43 = await J(`stepsFor(WORLD.rounds.findIndex(w => w.day === 43)).map(x => x.t)`);
  ok('track B week 7: the cards come before the plan', st43.indexOf('event') >= 0 && st43.indexOf('event') < st43.indexOf('plan'), st43);
  await E(`(S.track = 'A', d104Ensure(), 1)`);

  // ---------- 2 · the curveballs' effects ----------
  // the school trip: Thursday's first Paris flight full at £60, its flexible passengers on to the next Paris flight
  await load(8, 'A');
  const par0 = (await flights(11)).filter(f => f.route === 'par'), wed0 = (await flights(10)).map(f => f.sold);
  const sc = await choose('school_trip', 0, 9);
  const par1 = (await flights(11)).filter(f => f.route === 'par');
  const n19 = Math.min(19, par1[0] ? par1[0].seats : 0), keep = par1[0] ? par1[0].sold - n19 : 0;
  ok('school trip, Take the booking: on Thursday 12 September the first Paris flight carries the school\'s 19 seats at £60 (any other seats at the fare)', sc.d.school && sc.d.school.day === 11 && sc.d.school.seats === 19 && par1[0] && par1[0].charter && par1[0].sold === par1[0].seats && par1[0].revenue === n19 * 60 + keep * par1[0].price, { school:sc.d.school, first:par1[0] });
  ok('school trip: the passengers the charter displaces can take the later Paris flights (never more than their seats)', par1.slice(1).every((f, i) => f.sold >= par0[i + 1].sold && f.sold <= f.seats), { before:par0.map(f => f.sold), after:par1.map(f => f.sold) });
  const wed1 = await flights(10);
  ok('school trip: no other day changes (Wednesday the 11th as before)', par0.length >= 2 && JSON.stringify(wed1.map(f => f.sold)) === JSON.stringify(wed0) && !wed1.some(f => f.charter), { wed0, wed1:wed1.map(f => f.sold) });
  // the Dublin strike: cancel or fly late (on a made-up day of flights: whatever the save flies on Friday)
  const day3 = d => J(`withDay(${d}, () => d104Flights([['dub', 420], ['par', 480], ['dub', 900]].map(([route, dep], i) => ({ key:'t' + i, route, uid:1, dep, seats:19, sold:19, price:90, revenue:1710, flexible:5 })))).map(f => ({ route:f.route, cancelled:!!f.cancelled, revenue:f.revenue, why:(f.reasons || []).join(' ') }))`);
  await load(15, 'A');
  let k = await choose('dub_strike', 1, 17); let fri = await day3(19), thu = await day3(18);
  ok('Dublin strike, Cancel: Friday 20 September\'s Dublin flights are cancelled, fares refunded; Paris flies; Thursday as usual', k.d.strike && k.d.strike.day === 19 && fri.filter(f => f.route === 'dub').every(f => f.cancelled && f.revenue === 0) && !fri.find(f => f.route === 'par').cancelled && thu.every(f => !f.cancelled), { strike:k.d.strike, fri });
  await load(15, 'A'); const bank0 = await E('S.repBank || 0');
  k = await choose('dub_strike', 0, 17); fri = await day3(19);
  ok('Dublin strike, Fly with delays: the flights go, late, and it costs half a star', fri.filter(f => f.route === 'dub').every(f => !f.cancelled && /Delayed by the Dublin ground staff strike/.test(f.why)) && Math.abs(k.bank - bank0 + 0.5) < 1e-9, { fri:fri.map(f => f.why), bank:[bank0, k.bank] });
  // the snack supplier: 50p an item from the day it is chosen
  await load(22, 'A');
  const ob0 = await J(`(() => { const fl = withDay(23, () => planFlights()); return withDay(23, () => dayExtras(fl)); })()`);
  k = await choose('snack_supplier', 0, 23);
  const ob1 = await J(`(() => { const fl = withDay(23, () => planFlights()); return withDay(23, () => dayExtras(fl)); })()`);
  ok('snack supplier, Switch: the stock costs half as much from that day (50p an item, not £1)', k.d.snack && k.d.snack.cost === 0.5 && (ob0.free || !ob0.buyers || Math.abs(ob1.obCost - ob0.obCost / 2) < 0.02), { before:ob0.obCost, after:ob1.obCost, buyers:ob1.buyers });
  // the sponsorship: Dublin × 1.05 for four weeks
  await load(29, 'A');
  const dm0 = await J(`[demandMult(routeById('dub'), 30), demandMult(routeById('dub'), 56), demandMult(routeById('dub'), 57)]`);
  k = await choose('sponsor_club', 0, 29);
  const dm1 = await J(`[demandMult(routeById('dub'), 30), demandMult(routeById('dub'), 56), demandMult(routeById('dub'), 57)]`);
  ok('sponsorship, Sponsor them: £500, and Dublin demand ×1.05 from day 29 to day 56, not after', k.cost === 500 && Math.abs(dm1[0] / dm0[0] - 1.05) < 1e-9 && Math.abs(dm1[1] / dm0[1] - 1.05) < 1e-9 && Math.abs(dm1[2] - dm0[2]) < 1e-9, { cost:k.cost, dm0, dm1 });
  // the slot squeeze: two departures before 09:00 this week
  await load(29, 'A');
  k = await choose('slot_squeeze', 0, 29);
  const sl = await J(`(() => { const s = d104SlotState(); return s ? { max:s.D.max, n:s.deps.length, over:s.over } : null; })()`);
  ok('slot squeeze: this week the plan counts its departures before 09:00 against the limit of two', k.d.slots && k.d.slots.max === 2 && k.d.slots.from === 29 && k.d.slots.to === 35 && sl && sl.max === 2 && sl.over === Math.max(0, sl.n - 2), { slots:k.d.slots, sl });
  await E(`(S.si = S.steps.findIndex(x => x.t === 'plan'), render(), 1)`); await p.waitForTimeout(200);
  const hint = await p.$eval('.actbar .ab-hint', e => e.textContent).catch(() => '');
  ok('slot squeeze: the plan\'s footer line says the rule and whether the plan fits', /Heathrow allows two departures before 09:00 this week/.test(hint), hint);
  const early = await J(`withDay(30, () => d104Flights([390, 450, 510, 600].map((dep, i) => ({ key:'s' + i, route:'par', uid:1, dep, seats:19, sold:19, price:90, revenue:1710 })))).map(f => [f.dep, !!f.cancelled, (f.reasons || []).join(' ')])`);
  ok('slot squeeze: on the day, only two leave before 09:00 (06:30, 07:30); the 08:30 stays on the ground; 10:00 flies', early.map(x => x[1]).join() === 'false,false,true,false' && /No early slot/.test(early[2][2]), early);
  const after = await J(`withDay(36, () => d104Flights([390, 450, 510].map((dep, i) => ({ key:'s' + i, route:'par', uid:1, dep, seats:19, sold:19, price:90, revenue:1710 })))).map(f => !!f.cancelled)`);
  ok('slot squeeze: the week after, every early flight goes', after.every(c => !c), after);
  // the tanker: 5,000 L at £2.40, paid once, through the tank
  await load(43, 'A');
  const tk = await J(`(() => { const o = d104Event('tanker_offer').options[0]; return { cash:o.effects.cash, cost:o.effects.d104Cost }; })()`);
  ok('tanker: the offer\'s cost is shown (£12,000), not charged as the event\'s cost', tk.cash === undefined && tk.cost === 12000, tk);
  await E(`(tankSpace() < 5000 ? (S.fuel = 0, S.fuelValue = 0, fuelLots().length = 0) : 0, S.cash = Math.max(S.cash, 50000), 1)`);   // room and cash for the offer
  const due = `(((S.charges || {}).due || []).concat((S.charges || {}).weekly || [])).reduce((t, c) => t + (c.amount || 0), 0)`;
  const f0 = await J(`({ fuel:S.fuel, cash:S.cash, value:S.fuelValue, room:tankSpace(), charges:${due} })`);
  if(f0.room >= 5000 && f0.cash >= 12000){ k = await choose('tanker_offer', 0, 43);
    const f1 = await J(`({ fuel:S.fuel, cash:S.cash, value:S.fuelValue, charges:${due} })`);
    ok('tanker, Buy: 5,000 L in the tank and £12,000 out of the bank, once', Math.abs(f1.fuel - f0.fuel - 5000) < 1e-6 && Math.abs(f0.cash - f1.cash - 12000) < 0.01 && k.cost === 0 && f1.charges === f0.charges, { f0, f1, cost:k.cost }); }
  else ok('tanker: the day-43 save has room and cash for the offer', false, f0);
  const why = await E(`(S.fuel = 1e6, d104TankerWhy())`);
  ok('tanker: with no room in the tank, the Buy key is off and says why', /Needs 5,000 L of room/.test(why), why);
  // the fault: fix (a share of yesterday's profit, +½ star), wait (grounded tomorrow), fly anyway (−1 star)
  await load(43, 'A'); const y = await E('yesterdayProfit()');
  k = await choose('fault', 0, 50);
  ok('fault, Fix it today: half of yesterday\'s profit, +½ star', Math.abs(k.cost - Math.round(0.5 * Math.max(0, y))) <= 1, { cost:k.cost, y });
  await load(43, 'A'); k = await choose('fault', 1, 43);
  ok('fault, Wait a day: the plane is grounded the next day', k.disrupt && k.disrupt.ground && k.disrupt.day === 44, k.disrupt);
  await load(43, 'A'); const r0 = await J('[S.rep, S.repBank || 0]'); k = await choose('fault', 2, 43);
  ok('fault, Fly anyway: −1 star', Math.abs((k.bank - r0[1]) + 1) < 1e-9, { before:r0, bank:k.bank, rep:k.rep });
  // track B's fault comes on a board day (day 18): the plane misses the next day
  await load(15, 'B'); await E('(S.day = 18, 1)');
  k = await choose('fault_b', 1, 18);
  const g19 = await flights(19), uid = k.d.ground && k.d.ground.uid;
  ok('fault (track B, a board day), Wait a day: that aircraft\'s flights the next day are grounded', k.d.ground && k.d.ground.day === 19 && g19.filter(f => f.uid === uid).length > 0 && g19.filter(f => f.uid === uid).every(f => f.cancelled && /Grounded/.test(f.why)), { ground:k.d.ground, g19:g19.map(f => [f.uid, f.cancelled]) });
  // the price war: hold (the switching rule), match (a fifth off, back after the week), advertise (half as many switch)
  await load(57, 'A');
  const pw0 = await J('Object.assign({}, S.prices)'), own = await J('d104Owned()');
  k = await choose('price_war', 1, 57);
  const pw1 = await J('Object.assign({}, S.prices)');
  ok('price war, Match the cut: every fare a fifth lower, to the nearest £5', own.length && own.every(id => pw1[id] === Math.max(5, Math.round(pw0[id] * 0.8 / 5) * 5)), { before:pw0, after:pw1, own });
  await E('(d104WarEnd(S.d104.war.to), 1)'); const pwLast = await J('Object.assign({}, S.prices)');
  await E('(d104WarEnd(S.d104.war.to + 1), 1)');   // the next beat starts the day after the war's last day
  const pw2 = await J('Object.assign({}, S.prices)');
  ok('price war: the matched fares hold to the war\'s last day, and go back when the next week starts', own.every(id => pwLast[id] === pw1[id] && pw2[id] === pw0[id]), { last:pwLast, back:pw2 });
  await load(57, 'A'); k = await choose('price_war', 0, 57);
  ok('price war, Hold your fares: Red Kite is a fifth cheaper this week (the switching rule)', (await J('S.rnd.weekMods.rivalCut')) === 0.2);
  await load(57, 'A'); k = await choose('price_war', 2, 57);
  const ad = await J('S.rivalAd');
  ok('price war, Advertise: a share of yesterday\'s profit, and half as many switch on your routes this week', ad && ad.routes.length === own.length && k.cost > 0, { ad, cost:k.cost });

  // ---------- 3 · growth responds to service ----------
  await load(29, 'A');
  const G = await J(`(() => { const G = d104NewG(), row = (a, routes) => d104Row(G, { from:a, to:a + 6, routes }, true, false), full = (fare, n) => ({ pax:133 * n, seats:133 * n, want:180 * n, trips:7 * n, fare });
    row(1, { par:full(90, 1), dub:full(90, 1) });
    const w1 = Object.assign({}, G.m);
    row(8, { par:full(90, 1), dub:full(110, 1), ams:{ pax:60, seats:133, want:60, trips:7, fare:90 } });
    const w2 = Object.assign({}, G.m);
    row(15, { dub:full(100, 1) });
    return { w1, w2, w3:Object.assign({}, G.m), snaps:G.snaps.map(s => s.from) }; })()`);
  ok('growth: week 1 sets nothing', !Object.keys(G.w1).length, G.w1);
  ok('growth: week 2 full and turning people away at a middle fare: Paris +1% +2% (×1.03); Dublin at its top fare: no growth; Amsterdam half full: +1% only', G.w2.par === 1.03 && !G.w2.dub && G.w2.ams === 1.01, G.w2);
  ok('growth: week 3 not flown: Paris falls back 3% (never below its opening demand); Dublin second from the top: half the drag (+1.5%)', G.w3.par === 1 && G.w3.dub === 1.015 && G.w3.ams === 1, G.w3);
  ok('growth: each step counts from the next week (days 15 and 22)', JSON.stringify(G.snaps) === '[15,22]', G.snaps);
  const gr = await J(`(() => { const keep = S.g104; S.g104 = { snaps:[{ from:22, m:{ par:1.2 } }] }; const r = routeById('par'), a = withDay(21, () => growthOf(r)), b = withDay(22, () => growthOf(r)), c = withDay(400, () => growthOf(r)); S.g104 = keep; return [a, b, c]; })()`);
  ok('growth: a day takes the last step that counted by then; after year one the old rule', gr[0] === 1 && gr[1] === 1.2 && gr[2] !== 1.2, gr);

  // ---------- 4 · stars from week 3 ----------
  await load(29, 'A');
  const ST = await J(`(() => { S.repRevealed = true; const G = d104NewG(), n0 = (S.repLog || []).length, D = d104D(); delete D.taHit; delete D.freeHit;
    const wk = (k, acc, free) => { G.acc = acc; G.free = !!free; G.days = 7; d104Drivers(G, k, false); };
    const ta = { par:{ pax:133, seats:133, want:200, trips:7, fare:90 } };
    wk(2, ta, true); const a = (S.repLog || []).length - n0;
    wk(3, ta, true); const b = (S.repLog || []).length - n0;
    wk(4, ta, true); const c = (S.repLog || []).slice(n0).map(x => [x.day, x.n, x.what]);
    wk(5, {}, false); const d = (S.repLog || []).slice(n0).map(x => [x.day, x.n, x.what]);
    return { a, b, c, d }; })()`);
  ok('stars: nothing is judged in weeks 1 and 2 (one small plane turns people away whatever the pupil does)', ST.a === 0, ST);
  ok('stars: week 4 after a week 3 turning away more than 1 in 5 on Paris: −½, once; free snacks two weeks running: +½, once', ST.c.length === 2 && ST.c.some(x => x[1] === -0.5 && /Paris turned away/.test(x[2])) && ST.c.some(x => x[1] === 0.5 && /Free snacks/.test(x[2])), ST.c);
  ok('stars: the week that holds the turn of the month (ends Sun 6 Oct) is September\'s review: +½ for an on-time week', ST.d.length === 3 && ST.d[2][1] === 0.5 && /September's review/.test(ST.d[2][2]) && ST.d[2][0] === 35, ST.d);
  const snk = await J(`(() => { const G = d104NewG(), D = d104D(), n0 = (S.repLog || []).length; D.snack = { from:23, cost:0.5, sold:true }; G.acc = {}; G.days = 7; d104Drivers(G, 9, false); d104Drivers(G, 13, false); return (S.repLog || []).slice(n0).filter(x => /plainer snacks/.test(x.what)).map(x => [x.day, x.n]); })()`);
  ok('stars: the plainer snacks were sold: −½ at the next month\'s review (October\'s, 3 November), once', snk.length === 1 && snk[0][0] === 63 && snk[0][1] === -0.5, snk);
  const off = await J(`(() => { const D = d104D(); D.off = { storm:5 }; return [d104OffWeek(1), d104OffWeek(6)]; })()`);
  ok('stars: a week with a choice that stopped or delayed flights is not on time', off[0] === true && off[1] === false, off);
  await load(8, 'A');
  const pl = await J(`(() => { const ev = d104Event('school_trip'); S.rnd.event = ev; S.rnd.eventChoice = 0; return ev2Plate(ev, {}, ''); })()`);
  ok('the event card\'s stars before week 3: "public from Mon 16 Sep (week 3)"', /public from Mon 16 Sep \(week 3\)/.test(pl), (pl.match(/Still[^<]*/) || [''])[0]);
  ok('the stars go public on day 15 (Settings reputationFromDay), not on 6 January', (await E('repFromDay()')) === 15 && (await E('d104RepDay()')) === 15);

  // ---------- 5 · demand ranges ----------
  await load(15, 'A');
  const R = await J(`({ par:d104Known('par'), ams:d104Known('ams'), r60:d104Range(60), r7:d104Range(7), r83:d104Range(83), unk:[...(d104UnknownSet() || [])].slice(0, 4) })`);
  ok('ranges: Paris and Dublin known from the start; Amsterdam a range until flown for a week', R.par === true && R.ams === false && R.unk.includes('ams'), R);
  ok('ranges: × (1 ± 0.15) widened to the nearest 5 ("about 50–70" for 60), whole numbers under 20', JSON.stringify(R.r60) === '[50,70]' && JSON.stringify(R.r7) === '[5,9]' && JSON.stringify(R.r83) === '[70,100]', R);
  const K = await J(`(() => { d104First().ams = 15; D104_UNK.key = null; return [d104Known('ams', 21), d104Known('ams', 22), d104Known('fra', 400)]; })()`);
  ok('ranges: known a week after its first flight (flown from day 15: a range to day 21, the true figure from day 22); after year one always known', K[0] === false && K[1] === true && K[2] === true, K);
  await E(`(d104First().ams = undefined, delete d104First().ams, D104_UNK.key = null, UI.view = 'network', render(), 1)`); await p.waitForTimeout(250);
  const rows = await p.$$eval('.net-dest tbody tr', xs => xs.map(x => x.textContent.replace(/\s+/g, ' ').trim()));
  ok('ranges: the Network\'s destinations show Amsterdam as a range and Paris as a figure', rows.some(r => /^Amsterdam.*\d+–\d+/.test(r)) && rows.some(r => /^Paris(?!.*–\d).*\d+\s*(Yes|No)/.test(r)), rows.slice(0, 4));
  await E(`(UI.view = 'world', UI.wr.route = 'ams', render(), 1)`); await p.waitForTimeout(250);
  const wr = await p.$$eval('.wr-b .wr-n', xs => xs.map(x => x.textContent));
  ok('ranges: the World report\'s demand bars for Amsterdam are ranges, with the reason', wr.length > 2 && wr.every(t => /^\d+–\d+$/.test(t)) && /a range until you have flown it for a week/.test(await p.$eval('.wr-dem', e => e.textContent)), wr);
  await E(`(UI.view = null, render(), 1)`);

  // ---------- 6 · the teacher's switch ----------
  await load(8, 'A');
  await E('teacherOpen()'); await p.waitForTimeout(150);
  ok('the teacher panel has the Autumn track switch for this airline', !!(await p.$('#tTrackSel')) && (await p.$eval('#tTrackSel', e => e.value)) === 'A');
  await p.selectOption('#tTrackSel', 'B'); await p.waitForTimeout(150);
  const sw = await J(`({ track:S.track, setting:settings.autumnTrack, d4:(WORLD.rounds.find(w => w.day === 4) || {}).eventId || null, d18:((WORLD.rounds.find(w => w.day === 18) || {}).event || {}).id || null })`);
  ok('switching to track B: the airline\'s autumn and the teacher\'s default are B, and the beats follow', sw.track === 'B' && sw.setting === 'B' && !sw.d4 && sw.d18 === 'fault_b', sw);
  await p.selectOption('#tTrackSel', 'A'); await p.waitForTimeout(100); await E('teacherClose()');

  // ---------- 7 · after year one: nothing changes ----------
  await load(365);
  const Y = await J(`(() => { render(); const r = routeById('par'), a = r.arch, old = Math.min(a.growthCeiling || Infinity, 1 + a.growthPerWeek / 100 * Math.max(0, weekNo(beatDay(S.round)) - 2)); return { g:growthOf(r), old, g104:!!S.g104, unk:d104UnknownSet(), known:d104Known('fra') }; })()`);
  ok('chapter 3 (day 365): growth is the old rule, no ranges, nothing kept for D104', Y.g === Y.old && !Y.g104 && Y.unk === null && Y.known === true, Y);
  const FR = await J(`[fmtRange(dayOfDate('2030-10-05'), dayOfDate('2030-10-05')), fmtRange(dayOfDate('2030-10-14'), dayOfDate('2030-10-20')), fmtRange(400, 400)]`);
  ok('a one-day range in year one is the day ("5 October", the concert); ranges and later chapters as before', FR[0] === '5 October' && FR[1] === '14–20 October' && /^(\d+)–\1 /.test(FR[2]), FR);

  console.log(checks.join('\n')); console.log('ERRORS', errors.length ? errors : 'none'); await b.close();
})();
