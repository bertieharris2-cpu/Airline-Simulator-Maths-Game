// Run: NODE_PATH=<playwright node_modules> node numbers.test.js   (env: GAME, OUT, SHOTS=0, PY=0 to skip the workbook file)
// The numbers (Bertie, 22 Oct 2026). Three things, each checked against what the pupil sees:
//   1. Every figure traces back to the workbook: Routes, Aircraft, Airports, Settings, the Calendar's and Market's fuel prices
//      and the Archetypes, read from data/Airline-World-Workbook.xlsx (tests/wb_values.py) → the game's imported copy → the
//      game's own route, aircraft, airport, setting and fuel-price objects.
//   2. The same figure agrees everywhere it appears: a day's revenue, costs and profit on the board, in the Sunday review's
//      table, on Launch Day's results screen, in the ledger and in the history; and every penny of the change in cash is
//      explained by the day's results, the fuel bought, the order paid on delivery, an event's cost and a plane bought.
//   3. Figures make sense: passengers never exceed seats, revenue is passengers × fare, costs add up, profit is revenue − costs.
//   And at least one day is worked out by hand: from the workbook's figures and the pupil's timetable alone, this file works out
//   who flies on each service, what each costs and what the day makes, and compares it with the game, flight by flight.
// The weeks are played through the teacher's toolkit (Run) from the Launch Day and week 2 jump saves.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '../../..'), FILE = 'file://' + path.resolve(ROOT, process.env.GAME || 'airline-opening-prototype.html');
const OUT = (process.env.OUT || os.tmpdir() + '/airline-numbers') + '/'; fs.mkdirSync(OUT, { recursive:true });
const SHOTS = process.env.SHOTS !== '0', checks = [], errs = [];
const ok = (name, cond, info) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (info !== undefined ? ' ' + JSON.stringify(info) : ''));
const info = (name, x) => checks.push('info ' + name + (x !== undefined ? ' ' + JSON.stringify(x) : ''));
const r2 = x => Math.round(x * 100) / 100, roundSchool = x => Math.floor(x + 0.5 + 1e-9), near = (a, b, t) => Math.abs((+a) - (+b)) <= (t === undefined ? 0.011 : t);
const gbp = s => { const m = /(−|-)?£?(\d[\d,]*(?:\.\d+)?)/.exec(String(s).replace(/\s/g, '')); return m ? (m[1] ? -1 : 1) * parseFloat(m[2].replace(/,/g, '')) : null; };
const money = n => (n < 0 ? '−' : '') + '£' + Math.abs(Math.round(n)).toLocaleString('en-GB');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ---------- the workbook's figures, in one shape, from the file (Python) and from the game's imported copy ---------- */
function normWB(W, fromFile){
  const pct = v => typeof v === 'string' ? (+v.replace(/[^\d.-]/g, '') || 0) / 100 : (+v || 0);
  const routes = {}; (W.routes || []).forEach(r => { routes[r.id] = { city:r.city, km:r.km, baseFare:r.baseFare, fareOptions:r.fareOptions, demandAtFare:Object.fromEntries(Object.entries(r.demandAtFare || {}).map(([k, v]) => [String(+k), +v])), landingFeeAway:r.landingFeeAway, turnaroundAwayMin:r.turnaroundAwayMin, archetype:r.archetype, unlockDay:r.unlockDay }; });
  const AID = { saab340:'sf34', atr72:'at72' };   // tools/import_world.py renames these two on import
  const aircraft = {}; (W.aircraft || []).forEach(a => { aircraft[fromFile && AID[a.id] || a.id] = { name:a.name, seats:a.seats, speedKmh:a.speedKmh, rangeKm:a.rangeKm, fuelPer100Km:a.fuelPer100Km, hourlyCost:a.hourlyCost, dayCost:a.dayCost, listPrice:a.listPrice, launchDealPrice:a.launchDealPrice || null }; });
  const ap = (W.airports || []).find(a => a.code === 'LHR') || (W.airports || [])[0] || {};
  const home = { landingFee:ap.landingFee, turnaroundMin:ap.turnaroundMin, passengerCharge:ap.passengerCharge, demandModifier:pct(ap.demandModifier) };
  const arche = {}; if(Array.isArray(W.archetypes)) W.archetypes.forEach(a => { arche[a.id] = { timeSensitiveShare:+a.timeSensitiveShare, bands:a.bands }; });
  else Object.entries(W.archetypes || {}).forEach(([id, a]) => { arche[id] = { timeSensitiveShare:+a.timeSensitiveShare, bands:a.bands }; });
  const S = W.settings || {}, settings = { startingCash:+S.startingCash, startingReputation:+S.startingReputation, adaptToOnlyFlight:+S.adaptToOnlyFlight, rivalSwitchPerTenPounds:+S.rivalSwitchPerTenPounds, rivalSwitchCap:+S.rivalSwitchCap, emergencyFuelPremium:+S.emergencyFuelPremium, tankCapacity:+S.tankCapacity, fuelLotSize:+(String(S.fuelLotSize).split('|')[0]) };
  const calendarFuel = {}; (W.calendar || []).forEach(c => { if(c.fuel !== null && c.fuel !== undefined) calendarFuel[c.day] = +c.fuel; });
  const marketFuel = {}; (W.market || []).forEach(m => { if(m.fuel !== null && m.fuel !== undefined) marketFuel[m.week] = +m.fuel; });
  return { routes, aircraft, home, arche, settings, calendarFuel, marketFuel, fromFile };
}
function workbookFromFile(){
  if(process.env.PY === '0') return null;
  const r = spawnSync('python3', ['-I', path.join(__dirname, 'wb_values.py'), path.join(ROOT, 'data/Airline-World-Workbook.xlsx')], { encoding:'utf8', timeout:60000 });
  if(r.status !== 0){ info('the workbook file could not be read with Python (openpyxl); the file → game check is skipped', (r.stderr || '').split('\n').filter(Boolean).slice(-1)); return null; }
  return normWB(JSON.parse(r.stdout), true);
}

/* ---------- one day by hand: the workbook's figures and the pupil's timetable, nothing from the game's engine ----------
   V: the workbook's figures. D: { flights:[{ route, dep (minutes), planeId, fare }], fleet:[planeId…], lots:[{ L, p }] (the tank
   at the start of the day, oldest first), free (fuel is free today), priceToday, rep } */
function handDay(V, D){
  const BANDS = { early:[6, 9], midmorning:[9, 12], midday:[12, 15], afternoon:[15, 18], evening:[18, 22] }, bandOf = m => { for(const b in BANDS) if(m < BANDS[b][1] * 60) return b; return 'evening'; };
  const adapt = V.settings.adaptToOnlyFlight || 0, repFactor = 1 + 0.1 * ((D.rep === undefined ? 3 : D.rep) - 3), notes = [];
  const flights = D.flights.map((f, i) => ({ ...f, i })).sort((a, b) => a.dep - b.dep || a.i - b.i), byRoute = {};
  flights.forEach(f => (byRoute[f.route] = byRoute[f.route] || []).push(f));
  // 1. who wants to fly on each route today, and when
  Object.keys(byRoute).forEach(id => { const R = V.routes[id], fs = byRoute[id], fare = fs[0].fare, T = R.demandAtFare, A = V.arche[R.archetype] || { timeSensitiveShare:0, bands:{} };
    let table = T[String(fare)]; if(table === undefined){ const k = Object.keys(T).map(Number).sort((a, b) => a - b); let j = k.findIndex(x => x > fare); if(j <= 0) j = j === 0 ? 1 : k.length - 1; table = T[k[j - 1]] + (T[k[j]] - T[k[j - 1]]) * (fare - k[j - 1]) / (k[j] - k[j - 1]); notes.push(`${R.city}: £${fare} is between two fares in the table`); }
    const want = Math.floor(roundSchool(table) * repFactor), ts = roundSchool(want * A.timeSensitiveShare), locked = {}; Object.keys(BANDS).forEach(b => { locked[b] = roundSchool(ts * (A.bands[b] || 0)); });
    const flex = want - ts, served = new Set(fs.map(f => bandOf(f.dep))), add = {}, mid = b => (BANDS[b][0] + BANDS[b][1]) * 30;
    if(adapt > 0) Object.keys(BANDS).forEach(b => { if(served.has(b) || !(locked[b] > 0)) return; const dep = fs.map(f => f.dep).sort((x, y) => Math.abs(x - mid(b)) - Math.abs(y - mid(b)) || x - y)[0], to = bandOf(dep); add[to] = (add[to] || 0) + locked[b] * adapt; locked[b] = Math.round(locked[b] * (1 - adapt)); });
    Object.keys(add).forEach(b => { locked[b] += roundSchool(add[b]); });
    fs.forEach(f => { f.seats = V.aircraft[f.planeId].seats; f.band = bandOf(f.dep); const a = Math.min(f.seats, locked[f.band] || 0); locked[f.band] -= a; f.locked = a; f.flexible = 0; });
    let left = flex; while(left > 0){ const open = fs.filter(f => f.locked + f.flexible < f.seats); if(!open.length) break; for(const f of open){ if(left <= 0) break; f.flexible++; left--; } }
    fs.forEach(f => { f.sold = f.locked + f.flexible; f.want = want; }); });
  // 2. what each service earns and costs
  const lots = (D.lots || []).map(x => ({ L:x.L, p:x.p })); let fuelUsed = 0, emergency = 0;
  flights.forEach(f => { const R = V.routes[f.route], P = V.aircraft[f.planeId], leg = Math.round(R.km / P.speedKmh * 60);
    f.revenue = f.sold * f.fare; f.flying = Math.round(P.hourlyCost * 2 * leg / 60); f.landing = V.home.landingFee + (R.landingFeeAway || 0); f.runCost = f.flying + f.landing;
    f.litres = Math.round(P.fuelPer100Km * 2 * R.km / 100 / 10) * 10; f.charge = f.sold * V.home.passengerCharge;
    if(D.free) f.fuelCost = 0; else { let need = f.litres, v = 0; while(need > 1e-9 && lots.length){ const x = lots[0], u = Math.min(x.L, need); v += u * x.p; x.L = r2(x.L - u); need -= u; if(x.L <= 1e-9) lots.shift(); }
      if(need > 1e-9){ const L = Math.ceil(need - 1e-9), ppl = r2(D.priceToday + (V.settings.emergencyFuelPremium || 0)); v += L * ppl; emergency = r2(emergency + L * ppl); } f.fuelCost = r2(v); }
    fuelUsed = r2(fuelUsed + f.fuelCost); });
  const over = D.fleet.reduce((t, id) => t + (V.aircraft[id].dayCost || 0), 0), revenue = flights.reduce((t, f) => t + f.revenue, 0), run = flights.reduce((t, f) => t + f.runCost, 0), charge = flights.reduce((t, f) => t + f.charge, 0);
  const costs = r2(run + fuelUsed + over + charge);
  return { flights, revenue, run, fuelUsed, emergency, over, charge, costs, profit:r2(revenue - costs), notes };
}

/* ---------- the hooks in the page: the board as it is drawn, each day's figures as the results are applied, every cash move ---------- */
const HOOKS = `(() => { const N = window.__num = { boards:{}, days:{}, moves:[], lotsAt:{}, wrapped:[] }, cp = x => JSON.parse(JSON.stringify(x || null));
  const move = (what, c0, extra) => N.moves.push(Object.assign({ day:S.day || 1, what, amount:r2(S.cash - c0) }, extra || {}));
  try{ const w0 = R.weekRun; R.weekRun = function(st){ const r = w0.apply(this, arguments); try{ if(S.wk && S.wk.dayDone === S.day && !N.boards[S.day]){ const el = document.querySelector('.wboard'); if(el) N.boards[S.day] = { from:S.wk.from, rows:[...el.querySelectorAll('.wb-week tbody tr')].map(tr => [...tr.children].map(td => td.textContent.trim())), cash:document.getElementById('cCash').textContent }; } }catch(e){} return r; }; N.wrapped.push('board'); }catch(e){}
  try{ const q0 = runDayQuick; runDayQuick = function(){ N.lotsAt[S.day] = cp(fuelLots()); return q0.apply(this, arguments); }; N.wrapped.push('lots'); }catch(e){}
  try{ const f0 = burnFuel; burnFuel = function(){ if(!N.lotsAt[S.day]) N.lotsAt[S.day] = cp(fuelLots()); return f0.apply(this, arguments); }; N.wrapped.push('burn'); }catch(e){}
  try{ const a0 = applyResults; applyResults = function(){ const d = S.day || 1, c0 = S.cash, was = !!S.rnd.applied; const r = a0.apply(this, arguments);
    if(!was && !N.days[d]){ N.days[d] = { day:d, cashBefore:c0, cashAfter:S.cash, revenue:S.rnd.revenue, costs:S.rnd.costs, profit:S.rnd.profit, fuelUsed:S.rnd.fuelUsedCost || 0, over:S.rnd.over, extras:cp(S.rnd.extras), eventCost:S.rnd.eventCost || 0, rep:S.rep, weekMods:cp(S.rnd.weekMods), fleet:S.fleet.map(f => f.planeId),
      flights:(S.rnd.flights || []).map(f => ({ key:f.key, route:f.route, dep:f.dep, planeId:f.planeId, price:f.price, seats:f.seats, sold:f.sold, demand:f.demand, revenue:f.revenue, runCost:f.runCost, fuelL:f.fuelL, fuelCost:f.fuelCost || 0, termCost:f.termCost || 0, band:f.band, locked:f.locked, flexible:f.flexible, grounded:!!f.grounded, cancelled:!!f.cancelled, noFuel:!!f.noFuel })) };
      move('the day\\'s results', c0); } return r; }; N.wrapped.push('results'); }catch(e){}
  try{ const e0 = emergencyFuel; emergencyFuel = function(){ const c0 = S.cash, r = e0.apply(this, arguments); move('fuel bought when the tank ran dry', c0, { L:r.L, p:r.ppl }); return r; }; N.wrapped.push('emergency'); }catch(e){}
  try{ const b0 = buyFuel; buyFuel = function(L, p){ const c0 = S.cash, r = b0.apply(this, arguments); move('fuel bought on the desk', c0, { L, p }); return r; }; N.wrapped.push('buy'); }catch(e){}
  try{ const d0 = ashPayDue; ashPayDue = function(){ const c0 = S.cash, r = d0.apply(this, arguments); if(S.cash !== c0) move('the fuel order paid on delivery', c0); return r; }; N.wrapped.push('due'); }catch(e){}
  try{ const v0 = applyEvent; applyEvent = function(){ const c0 = S.cash, r = v0.apply(this, arguments); if(S.cash !== c0) move('an event', c0); return r; }; N.wrapped.push('event'); }catch(e){}
  try{ const p0 = buyPlane; buyPlane = function(){ const c0 = S.cash, r = p0.apply(this, arguments); if(S.cash !== c0) move('a plane bought', c0); return r; }; N.wrapped.push('plane'); }catch(e){}
  try{ const p1 = acquirePlane; acquirePlane = function(){ const c0 = S.cash, r = p1.apply(this, arguments); if(S.cash !== c0) move('a plane acquired', c0); return r; }; N.wrapped.push('acquire'); }catch(e){}
  return N.wrapped.join(','); })()`;

(async () => {
  const b = await chromium.launch();
  const page = async () => { const p = await b.newPage({ viewport:{ width:1366, height:768 } }); p.on('pageerror', e => errs.push(e.message)); await p.goto(FILE); await p.waitForTimeout(800);
    await p.evaluate(() => { const st = window.__sim.settings(); st.briefings = false; st.flightSecs = 0.25; st.autoWall = false; st.opsSound = false; }); return p; };
  const E = (p, s) => p.evaluate(x => window.__sim.evalIn(x), s), J = async (p, s) => JSON.parse(await E(p, `JSON.stringify(${s})`));
  const load = async (p, name) => { await p.evaluate(c => { const s = window.__sim.loadCode(c); window.__sim.setS(s); window.__sim.landSave(); window.__sim.render(); }, fs.readFileSync(path.join(__dirname, `fixtures/jumps/${name}.txt`), 'utf8').trim()); await p.waitForTimeout(600); };
  const shot = (p, name) => SHOTS ? p.screenshot({ path:`${OUT}${name}.png` }).catch(() => {}) : Promise.resolve();

  /* ---------- 1. every figure traces back to the workbook ---------- */
  const p0 = await page(), WBg = normWB(await J(p0, 'WB'), false), WBf = workbookFromFile();
  const G = await J(p0, `({ routes:WORLD.routes.filter(r => r.wb).map(r => ({ id:r.id, city:r.city, km:r.km, basePrice:r.basePrice, fares:r.fares, demandAtFare:r.demandAtFare, landingFeeAway:r.landingFeeAway, turnaroundMin:r.turnaroundMin, openDay:r.openDay, archId:r.archId, arch:r.arch && { timeSensitiveShare:r.arch.timeSensitiveShare, bands:r.arch.bands } })),
    planes:PLANES.filter(q => q.wb).map(q => ({ id:q.id, name:q.name, seats:q.seats, speed:q.speed, range:q.range, fuelUse:q.fuelUse, hourCost:q.hourCost, dayCost:q.dayCost, listPrice:q.listPrice, launchDealPrice:q.launchDealPrice, price:q.price })),
    home:{ fee:homeData().fee, demandPct:homeData().demandPct, turn:terminalData().turn, charge:terminalData().charge }, startingCash:WORLD.startingCash, settings:Object.fromEntries(['startingReputation', 'adaptToOnlyFlight', 'rivalSwitchPerTenPounds', 'rivalSwitchCap', 'emergencyFuelPremium', 'tankCapacity'].map(k => [k, (WORLD.settings || {})[k]])), fuelTopUp:WORLD.fuelTopUp, fuelBlock:WORLD.fuelBlock, tankBaseDesk:WORLD.tankBaseDesk,
    calFuel:Object.fromEntries(WB.calendar.map(c => [c.day, fuelOn(c.day)])), marketFuel:Object.fromEntries(WB.market.slice(0, 60).map(m => [m.week, fuelOn((m.week - 1) * 7 + 1)])) })`);
  await p0.close();
  if(WBf){
    const miss = [];
    Object.entries(WBf.routes).forEach(([id, r]) => { const g = WBg.routes[id]; if(!g){ miss.push(id + ' not imported'); return; } ['km', 'baseFare', 'fareOptions', 'demandAtFare', 'landingFeeAway', 'turnaroundAwayMin', 'archetype', 'unlockDay'].forEach(k => { if(!same(r[k], g[k])) miss.push(`${id}.${k}: file ${JSON.stringify(r[k])} game ${JSON.stringify(g[k])}`); }); });
    ok(`workbook file → the game's copy: every live route's distance, base fare, fare options, demand table, landing fee, turnaround and opening day (${Object.keys(WBf.routes).length} routes)`, !miss.length, miss.slice(0, 5));
    const ma = []; Object.entries(WBf.aircraft).forEach(([id, a]) => { const g = WBg.aircraft[id]; if(!g){ ma.push(id + ' not imported'); return; } ['seats', 'speedKmh', 'rangeKm', 'fuelPer100Km', 'hourlyCost', 'dayCost', 'listPrice', 'launchDealPrice'].forEach(k => { if(!same(a[k], g[k])) ma.push(`${id}.${k}: file ${a[k]} game ${g[k]}`); }); });
    ok(`workbook file → the game's copy: every live aircraft's seats, speed, range, fuel use, hourly and day cost, list price (${Object.keys(WBf.aircraft).length} aircraft)`, !ma.length, ma.slice(0, 5));
    ok('workbook file → the game\'s copy: the home airport (landing fee, turnaround, passenger charge, demand modifier)', same(WBf.home, WBg.home), [WBf.home, WBg.home]);
    ok('workbook file → the game\'s copy: the settings (starting cash and reputation, adapt share, rival switching, emergency premium, tank, lot)', same(WBf.settings, WBg.settings), [WBf.settings, WBg.settings]);
    const cf = Object.keys(WBf.calendarFuel).filter(d => !near(WBf.calendarFuel[d], WBg.calendarFuel[d], 0.0001)), mf = Object.keys(WBf.marketFuel).filter(w => !near(WBf.marketFuel[w], WBg.marketFuel[w], 0.0001));
    ok(`workbook file → the game's copy: the Calendar's fuel price on each of its ${Object.keys(WBf.calendarFuel).length} days and the Market's on each of its ${Object.keys(WBf.marketFuel).length} weeks`, !cf.length && !mf.length, { days:cf.slice(0, 5), weeks:mf.slice(0, 5) });
    const af = Object.keys(WBf.arche).filter(id => !same(WBf.arche[id], WBg.arche[id]));
    ok('workbook file → the game\'s copy: each archetype\'s time-sensitive share and band shares', !af.length, af.map(id => [id, WBf.arche[id], WBg.arche[id]]).slice(0, 2));
  }
  { const miss = []; G.routes.forEach(g => { const r = WBg.routes[g.id]; if(!r){ miss.push(g.id + ' has no workbook row'); return; }
      const want = { km:r.km, basePrice:r.baseFare, fares:r.fareOptions, demandAtFare:r.demandAtFare, landingFeeAway:r.landingFeeAway, turnaroundMin:r.turnaroundAwayMin, openDay:r.unlockDay };
      Object.keys(want).forEach(k => { if(!same(want[k], g[k])) miss.push(`${g.id}.${k}: workbook ${JSON.stringify(want[k])} game ${JSON.stringify(g[k])}`); });
      const a = WBg.arche[r.archetype]; if(a && !same(a, g.arch)) miss.push(`${g.id}: archetype ${r.archetype} differs`); });
    ok(`the game's routes carry the workbook's figures: distance, base fare, fare options, demand at each fare, landing fee away, turnaround, opening day, archetype (${G.routes.length} routes)`, !miss.length, miss.slice(0, 5)); }
  { const miss = []; G.planes.forEach(g => { const a = WBg.aircraft[g.id]; if(!a){ miss.push(g.id + ' has no workbook row'); return; }
      const want = { seats:a.seats, speed:a.speedKmh, range:a.rangeKm, fuelUse:a.fuelPer100Km, hourCost:a.hourlyCost, dayCost:a.dayCost, listPrice:a.listPrice };
      Object.keys(want).forEach(k => { if(!same(want[k], g[k])) miss.push(`${g.id}.${k}: workbook ${want[k]} game ${g[k]}`); });
      if(a.launchDealPrice && g.price !== a.launchDealPrice) miss.push(`${g.id}.price: launch deal ${a.launchDealPrice} game ${g.price}`); });
    ok(`the game's aircraft carry the workbook's figures: seats, speed, range, fuel per 100 km, hourly cost, day cost, list price, the launch deal (${G.planes.length} aircraft)`, !miss.length, miss.slice(0, 5)); }
  ok('the home airport is the workbook\'s: landing fee, demand modifier, the terminal\'s turnaround and passenger charge', G.home.fee === WBg.home.landingFee && G.home.demandPct === Math.round(WBg.home.demandModifier * 100) && G.home.turn === WBg.home.turnaroundMin && G.home.charge === WBg.home.passengerCharge, [G.home, WBg.home]);
  ok('the settings are the workbook\'s: starting cash, starting reputation, adapt share, rival switching, the emergency fuel premium, the tank, the lot', G.startingCash === WBg.settings.startingCash && +G.settings.startingReputation === WBg.settings.startingReputation && +G.settings.adaptToOnlyFlight === WBg.settings.adaptToOnlyFlight && +G.settings.rivalSwitchPerTenPounds === WBg.settings.rivalSwitchPerTenPounds && +G.settings.rivalSwitchCap === WBg.settings.rivalSwitchCap && near(G.fuelTopUp, WBg.settings.emergencyFuelPremium, 1e-9) && G.tankBaseDesk === WBg.settings.tankCapacity && G.fuelBlock === WBg.settings.fuelLotSize, [G.startingCash, G.settings, G.fuelTopUp, G.tankBaseDesk, G.fuelBlock, WBg.settings]);
  { const cf = Object.keys(WBg.calendarFuel).filter(d => !near(G.calFuel[d], WBg.calendarFuel[d], 0.0001)), mf = Object.keys(G.marketFuel).filter(w => !near(G.marketFuel[w], WBg.marketFuel[w], 0.0001));
    ok(`the fuel price on a day is the Calendar's (${Object.keys(WBg.calendarFuel).length} days), then the Market week's (weeks to 60)`, !cf.length && !mf.length, { days:cf.slice(0, 5), weeks:mf.slice(0, 5).map(w => [w, G.marketFuel[w], WBg.marketFuel[w]]) }); }
  const V = WBf || WBg;   // the hand working uses the file's figures when they can be read, else the game's copy of them

  /* ---------- a week, played through the toolkit ---------- */
  async function playWeek(save, label){
    const p = await page(); await load(p, save); await p.evaluate(() => window.__tk.enter()); await p.waitForTimeout(300);
    const wrapped = await E(p, HOOKS); ok(`${label}: the hooks that watch the board, the results and every cash move are in place`, /board/.test(wrapped) && /burn/.test(wrapped) && /results/.test(wrapped) && /emergency/.test(wrapped) && /buy/.test(wrapped) && /due/.test(wrapped), wrapped);
    const start = await J(p, `({ day:S.day, step:step().t, cash:S.cash, rep:S.rep, fleet:S.fleet.map(f => f.planeId), rounds:Object.fromEntries(Array.from({ length:14 }, (_, n) => n).map(n => { const w = roundData(n); return [dayFor(n), { competitor:w.competitor || null, demandMod:w.demandMod || {}, eventId:w.eventId || null }]; })), free:Object.fromEntries(Array.from({ length:15 }, (_, k) => S.day + k).map(d => [d, !!(calRow(d) && (calRow(d).headlines || []).some(h => /fuel is free/i.test(h)))])) })`);
    const msgs = []; let results = null;
    for(let g = 0; g < 12; g++){ msgs.push(await p.evaluate(() => window.__tk.run('review'))); const t = await E(p, 'step().t');
      if(t === 'results' && !results){ results = await p.evaluate(() => ({ text:document.getElementById('screen').innerText.replace(/\s+/g, ' '), cash:document.getElementById('cCash').textContent })); await shot(p, `${save}-results`); }
      if(t === 'weekReview' || /needs you|Run stopped/.test(msgs[msgs.length - 1])) break; }
    await shot(p, `${save}-review`);
    const end = await J(p, `({ day:S.day, step:step().t, cash:S.cash, fuelWeeks:S.fuelWeeks, wk:S.wk && { from:S.wk.from, projected:S.wk.projected, rows:S.wk.rows.map(r => ({ d:r.d, pax:r.pax, seats:r.seats, trips:r.trips, rev:r.rev, cost:r.cost, profit:r.profit })) },
      hist:(S.history || []).filter(h => h.type === 'day' || h.type === 'setup').map(h => ({ from:h.from, revenue:h.revenue, costs:h.costs, profit:h.profit, cash:h.cash, pax:h.pax, seats:h.seats, trips:h.trips, routes:h.routes })), ledger:S.ledger, N:window.__num })`);
    const dom = await p.evaluate(() => { const sh = document.querySelector('[data-ash]'); return { cells:sh ? Object.fromEntries([...sh.querySelectorAll('[data-ref]')].map(c => [c.getAttribute('data-ref'), c.textContent.trim()])) : null, cash:document.getElementById('cCash').textContent, screen:document.getElementById('screen').innerText.replace(/\s+/g, ' ') }; });
    await p.close();
    return { save, label, start, msgs, results, end, dom };
  }
  function checkWeek(W){
    const { label, start, end, dom, results } = W, from = end.wk ? end.wk.from : start.day, days = end.hist.filter(h => h.from >= from && h.from <= from + 6), N = end.N;
    ok(`${label}: the toolkit played the week to the Sunday review (${days.length} days)`, end.step === 'weekReview' && days.length === 7, { step:end.step, days:days.map(h => h.from), msgs:W.msgs });
    fs.writeFileSync(`${OUT}${W.save}.json`, JSON.stringify(W, null, 1));
    const bad = { board:[], sheet:[], rows:[], ledger:[], log:[], sense:[], cash:[] }, dayLog = {};
    let prevCash = start.cash;
    days.forEach(h => { const d = h.from, L = N.days[d], row = end.wk.rows.find(r => r.d === d), rp = Math.round(h.profit);
      // the board (the first board drawn after the day was done, which lists every day done so far)
      const bk = Object.keys(N.boards).map(Number).filter(k => k >= d).sort((a, b) => a - b)[0], B = bk !== undefined ? N.boards[bk] : null, cells = B ? B.rows[d - B.from] : null;
      if(cells){ const [, , pax, rev, cost, profit] = cells; if(pax !== `${h.pax} / ${h.seats}` || gbp(rev) !== Math.round(h.revenue) || gbp(cost) !== Math.round(h.costs) || gbp(profit) !== rp) bad.board.push({ d, cells, hist:[h.pax, h.seats, h.revenue, h.costs, h.profit] }); }
      else if(d !== from || !results) bad.board.push({ d, noBoard:true });
      // the Sunday review's table
      if(dom.cells){ const cell = dom.cells['B' + (d - from + 2)]; if(gbp(cell) !== rp) bad.sheet.push({ d, cell, profit:h.profit }); }
      if(!row || row.profit !== rp || row.rev !== Math.round(h.revenue) || row.cost !== Math.round(h.costs) || row.pax !== h.pax) bad.rows.push({ d, row, hist:[h.revenue, h.costs, h.profit, h.pax] });
      if(!end.ledger || !near(end.ledger.rev[d], h.revenue) || !near(end.ledger.cost[d], h.costs) || end.ledger.pax[d] !== h.pax || end.ledger.seats[d] !== h.seats) bad.ledger.push({ d, ledger:end.ledger && [end.ledger.rev[d], end.ledger.cost[d], end.ledger.pax[d], end.ledger.seats[d]], hist:[h.revenue, h.costs, h.pax, h.seats] });
      if(!L || !near(L.revenue, h.revenue) || !near(L.costs, h.costs) || !near(L.profit, h.profit) || !near(L.cashAfter, h.cash)) bad.log.push({ d, log:L && [L.revenue, L.costs, L.profit, L.cashAfter], hist:[h.revenue, h.costs, h.profit, h.cash] });
      if(L){ const fl = L.flights.filter(f => !f.grounded && !f.cancelled && !f.noFuel), X = L.extras || {}, obRev = X.obRev || 0;
        const pax = fl.reduce((t, f) => t + f.sold, 0), seats = fl.reduce((t, f) => t + f.seats, 0), rev = fl.reduce((t, f) => t + f.revenue, 0), costs = r2(fl.reduce((t, f) => t + f.runCost + f.fuelCost + f.termCost, 0) + L.over + (X.crew || 0) + (X.obCost || 0) + L.eventCost);
        L.flights.forEach(f => { if(f.sold > f.seats) bad.sense.push({ d, flight:f.key, sold:f.sold, seats:f.seats }); if(!f.grounded && !f.cancelled && !f.noFuel && f.revenue !== f.sold * f.price) bad.sense.push({ d, flight:f.key, revenue:f.revenue, sold:f.sold, price:f.price }); });
        Object.entries(h.routes || {}).forEach(([id, x]) => { if(x.pax > x.seats || !near(x.rev, x.pax * x.fare + (x.onboard || 0))) bad.sense.push({ d, route:id, pax:x.pax, seats:x.seats, rev:x.rev, fare:x.fare }); });
        if(pax !== h.pax || seats !== h.seats || pax > seats || !near(rev + obRev, h.revenue) || !near(costs, h.costs) || !near(h.revenue - h.costs, h.profit)) bad.sense.push({ d, flights:[pax, seats, rev, costs], hist:[h.pax, h.seats, h.revenue, h.costs, h.profit] });
        if(!near(L.fuelUsed, fl.reduce((t, f) => t + f.fuelCost, 0))) bad.sense.push({ d, fuelUsed:L.fuelUsed, flights:fl.reduce((t, f) => t + f.fuelCost, 0) });
        // cash: the day's results move the cash by the profit plus the fuel burned (paid when bought); the other moves since the last results explain the rest
        const res = N.moves.find(m => m.day === d && m.what === 'the day\'s results'), i0 = N.moves.indexOf(res), prevRes = N.moves.slice(0, i0).map((m, i) => [m, i]).filter(([m]) => m.what === 'the day\'s results').pop(), since = N.moves.slice(prevRes ? prevRes[1] + 1 : 0, i0 + 1);
        const explained = r2(since.reduce((t, m) => t + m.amount, 0)), change = r2(L.cashAfter - prevCash);
        if(!res || !near(res.amount, L.profit + L.fuelUsed) || !near(explained, change)) bad.cash.push({ d, change, explained, results:res && res.amount, profit:L.profit, fuelUsed:L.fuelUsed, moves:since.map(m => [m.what, m.amount]) });
        dayLog[d] = { profit:h.profit, change, moves:since.filter(m => m.what !== 'the day\'s results').map(m => `${m.what} ${money(m.amount)}`) };
        prevCash = L.cashAfter; }
    });
    ok(`${label}: each day's passengers, revenue, costs and profit on the board are the day's figures (to the pound)`, !bad.board.length, bad.board.slice(0, 3));
    ok(`${label}: the Sunday review's table shows each day's profit, the same figure`, !!dom.cells && !bad.sheet.length, bad.sheet.slice(0, 3));
    ok(`${label}: the week's rows, the ledger and the day's results agree with the history`, !bad.rows.length && !bad.ledger.length && !bad.log.length, { rows:bad.rows.slice(0, 2), ledger:bad.ledger.slice(0, 2), log:bad.log.slice(0, 2) });
    ok(`${label}: figures make sense on every flight and route: passengers never exceed seats, revenue = passengers × fare, the day's costs are the flights' flying, landing, fuel and passenger charges plus the aircraft's day cost (and an event's cost), profit = revenue − costs`, !bad.sense.length, bad.sense.slice(0, 3));
    ok(`${label}: every penny of each day's change in cash is explained: the day's results (profit + the fuel burned, which was paid when bought), fuel bought on the desk or when the tank ran dry, the order paid on delivery, an event, a plane`, !bad.cash.length, bad.cash.slice(0, 2));
    info(`${label}: cash day by day`, Object.entries(dayLog).map(([d, x]) => `${d}: profit ${money(x.profit)}, cash ${x.change >= 0 ? '+' : ''}${money(x.change)}${x.moves.length ? ' (' + x.moves.join('; ') + ')' : ''}`));
    const last = days[days.length - 1], after = N.moves.filter(m => m.day > last.from || (m.day === last.from && N.moves.indexOf(m) > N.moves.findIndex(x => x.day === last.from && x.what === 'the day\'s results'))).reduce((t, m) => t + m.amount, 0);
    ok(`${label}: the cash balance in the top bar at the review is the history's last cash plus any later move, and the review's own cash line agrees`, gbp(dom.cash) === Math.round(end.cash) && near(end.cash, last.cash + after) && (gbp((/cash (£[\d,]+)/.exec(dom.screen) || [])[1]) === Math.round(end.cash)), [dom.cash, end.cash, last.cash, after, (/cash (£[\d,]+)/.exec(dom.screen) || [])[1]]);
    const wp = days.reduce((t, h) => t + h.pax, 0), ws = days.reduce((t, h) => t + h.seats, 0), m = /Passengers ([\d,]+) of ([\d,]+) seats/.exec(dom.screen);
    ok(`${label}: the review's "Passengers N of M seats" is the week's passengers and seats`, !!m && gbp(m[1]) === wp && gbp(m[2]) === ws, [m && m[0], wp, ws]);
    if(results){ const h = days[0], r = /Revenue £([\d,]+).*?Costs £([\d,]+).*?Profit £([\d,]+)/.exec(results.text);
      ok(`${label}: the Monday's results screen shows the same revenue, costs and profit as the record, and the cash balance after it`, !!r && gbp(r[1]) === Math.round(h.revenue) && gbp(r[2]) === Math.round(h.costs) && gbp(r[3]) === Math.round(h.profit) && gbp(results.cash) === Math.round(h.cash), [r && r.slice(1), results.cash, h.revenue, h.costs, h.profit, h.cash]); }
    return { days, N };
  }
  function handCheck(W, R, d){
    const { label, start } = W, N = R.N, L = N.days[d], h = R.days.find(x => x.from === d); if(!L || !h){ ok(`${label}: day ${d} by hand`, false, 'no figures for the day'); return; }
    const rd = start.rounds[d] || {}, quiet = !rd.competitor && !Object.keys(rd.demandMod || {}).length && !rd.eventId && !L.eventCost && !(L.weekMods && Object.keys(L.weekMods).length) && L.rep === 3 && !(L.extras && L.extras.crew) && !(L.extras && L.extras.obRev);
    if(!quiet){ info(`${label}: day ${d} is not worked by hand (a rival, an event, a modifier, a changed reputation or a second crew that day)`, { rd, eventCost:L.eventCost, rep:L.rep, weekMods:L.weekMods }); return; }
    const fl = L.flights.filter(f => !f.grounded && !f.cancelled && !f.noFuel); if(fl.length !== L.flights.length){ info(`${label}: day ${d} is not worked by hand (a flight did not fly)`); return; }
    const H = handDay(V, { flights:fl.map(f => ({ route:f.route, dep:f.dep, planeId:f.planeId, fare:f.price, key:f.key })), fleet:L.fleet, lots:N.lotsAt[d] || [], free:!!start.free[d], priceToday:V.calendarFuel[d], rep:L.rep });
    const diff = []; H.flights.forEach(f => { const g = fl.find(x => x.key === f.key); const want = { sold:f.sold, revenue:f.revenue, runCost:f.runCost, fuelL:f.litres, fuelCost:f.fuelCost, termCost:f.charge }, got = { sold:g.sold, revenue:g.revenue, runCost:g.runCost, fuelL:g.fuelL, fuelCost:g.fuelCost, termCost:g.termCost };
      Object.keys(want).forEach(k => { if(!near(want[k], got[k])) diff.push(`${f.key} ${V.routes[f.route].city} ${String(Math.floor(f.dep / 60)).padStart(2, '0')}:${String(f.dep % 60).padStart(2, '0')} ${k}: by hand ${want[k]}, game ${got[k]}`); }); });
    if(!near(H.revenue, h.revenue) || !near(H.costs, h.costs) || !near(H.profit, h.profit)) diff.push(`day: by hand revenue ${H.revenue} costs ${H.costs} profit ${H.profit}; game ${h.revenue} ${h.costs} ${h.profit}`);
    const show = H.flights.map(f => `${V.routes[f.route].city} ${String(Math.floor(f.dep / 60)).padStart(2, '0')}:${String(f.dep % 60).padStart(2, '0')} £${f.fare}: ${f.want} want, ${f.locked}+${f.flexible} = ${f.sold}/${f.seats} → £${f.revenue}; flying £${f.flying} + landing £${f.landing} + fuel ${f.litres} L £${f.fuelCost} + charges £${f.charge}`);
    ok(`${label}: day ${d} worked out by hand from the workbook and the timetable agrees with the game, flight by flight: revenue £${H.revenue} − costs £${H.costs} (flights £${H.run}, fuel £${H.fuelUsed}, day cost £${H.over}, passenger charges £${H.charge}) = profit £${H.profit}`, !diff.length, diff.length ? diff.slice(0, 6) : show.concat(H.notes));
  }
  const W1 = await playWeek('day-1', 'week 1 from Launch Day'), R1 = checkWeek(W1);
  [1, 2, 3].forEach(d => handCheck(W1, R1, d));
  const W2 = await playWeek('day-8', 'week 2 from its Monday'), R2 = checkWeek(W2);
  handCheck(W2, R2, 8);

  /* ---------- year one's record: the identities that hold on every entry the test pupil's save keeps (days, and the weeks and months older days are folded into).
     The save was recorded by builds up to 2 Oct, whose record kept on-board and bag money outside the revenue line, so there the gap between
     profit and revenue − costs is that money (never negative, and at least the on-board money the routes record); the strict identity is checked
     on the weeks played above. ---------- */
  { const p = await page(); await load(p, 'day-365');
    const H = await J(p, `(S.history || []).filter(h => h.revenue !== undefined && h.from <= 364).map(h => ({ type:h.type, from:h.from, to:h.to, revenue:h.revenue, costs:h.costs, profit:h.profit, pax:h.pax, seats:h.seats, routes:h.routes }))`), L = await J(p, 'S.ledger || {}'); await p.close();
    const bad = [], tally = {}; let older = 0, outside = 0;
    H.forEach(h => { tally[h.type] = (tally[h.type] || 0) + 1; const R = Object.values(h.routes || {}), ob = R.reduce((t, x) => t + (x.onboard || 0), 0), gap = r2(h.profit - (h.revenue - h.costs));
      if(gap > 0.011){ older++; outside = r2(outside + gap); }
      if(h.pax > h.seats || gap < -0.011 || (gap > 0.011 && gap < ob - 0.011) || h.costs < 0 || h.revenue < 0) bad.push({ type:h.type, d:h.from, pax:h.pax, seats:h.seats, revenue:h.revenue, costs:h.costs, profit:h.profit, onboard:ob });
      R.forEach((x, i) => { if(x.pax > x.seats || (x.onboard !== undefined && !near(x.rev, x.pax * x.fare + x.onboard))) bad.push({ type:h.type, d:h.from, route:Object.keys(h.routes)[i], pax:x.pax, seats:x.seats, rev:x.rev, fare:x.fare, onboard:x.onboard }); });
      const rr = r2(R.reduce((t, x) => t + x.rev, 0));   // a day's routes add up to its revenue line (with or without the on-board money); a week's or month's summary rows leave that money out, so they add up to no more than the line
      if(R.length && (h.type === 'day' || h.type === 'setup' ? !near(rr, h.revenue) && !near(rr, h.revenue + ob) : rr > h.revenue + 0.011)) bad.push({ type:h.type, d:h.from, routesRev:rr, revenue:h.revenue, onboard:ob });
      if(h.type === 'day' && L.rev && L.rev[h.from] !== undefined && (!near(L.rev[h.from], h.revenue) || !near(L.cost[h.from], h.costs))) bad.push({ d:h.from, ledger:[L.rev[h.from], L.cost[h.from]], hist:[h.revenue, h.costs] }); });
    ok(`the year-one save's ${H.length} recorded entries (${Object.entries(tally).map(([k, v]) => v + ' ' + k).join(', ')}): on every entry and every route passengers ≤ seats, revenue = passengers × fare (+ on-board), the routes add up to the revenue line, profit is never less than revenue − costs (the gap is money the older record kept outside the line), and the ledger agrees with each day`, H.length >= 40 && !bad.length, bad.slice(0, 4));
    info(`entries recorded under the older rule (on-board and bag money outside the revenue line)`, { entries:older, money:money(outside) }); }

  await b.close();
  console.log(checks.join('\n')); console.log('ERRORS', errs.length ? errs : 'none');
})().catch(e => { console.log(checks.join('\n')); console.log('CRASH', e && e.stack || e); process.exit(1); });
