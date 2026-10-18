// Run: NODE_PATH=<playwright node_modules> node briefings.test.js   (env: OUT, GAME, ONLY=id,id)
// Operations briefings (Fable's plan, 18 Oct 2026): eleven short scenes in the airline's world. Part 1 plays each page on its own
// (its fallback figures, the kit loaded from briefings/kit/) and checks the shared frame and its rules: the title and four
// progress marks; no Continue before the pupil acts; Pause freezes the scene; the end is reached; with reduced motion too.
// Part 2 opens each at its moment in the game with the pupil's own figures (the Jump to airlines), plays one to the end, and
// checks it is marked seen, sits on the Home shelf and plays again from there; Skip shows in test mode only.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const ROOT = path.resolve(__dirname, '../../..'), FILE = 'file://' + path.resolve(ROOT, process.env.GAME || 'airline-opening-prototype.html'), DIR = path.resolve(__dirname, '../briefings');
const OUT = (process.env.OUT || os.tmpdir() + '/airline-briefings') + '/', ONLY = (process.env.ONLY || '').split(',').filter(Boolean); fs.mkdirSync(OUT, { recursive:true });
const checks = [], errors = [], ok = (name, cond, x) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (x !== undefined ? ' ' + JSON.stringify(x).slice(0, 300) : ''));
const want = id => !ONLY.length || ONLY.includes(id);

/* how a pupil does each page: the first interaction is awaited (Continue must still be hidden then), the rest drive it to the end */
const W = async (p, sel, ms) => p.waitForSelector(sel, { timeout:ms || 30000 });
const go = async p => { await W(p, '.bk-go:not([hidden])', 45000); await p.waitForTimeout(250); await p.click('.bk-go'); };
const drag = async (p, sel, frac) => { const r = await p.$(sel), b = await r.boundingBox(); await p.mouse.move(b.x + 2, b.y + b.height / 2); await p.mouse.down(); await p.mouse.move(b.x + b.width * frac, b.y + b.height / 2, { steps:10 }); await p.mouse.up(); };
const dragTo = async (p, sel, x, y) => { const el = await p.$(sel), bb = await el.boundingBox(), box = await (await p.$('.bk-world')).boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(box.x + box.width * x / 1600, box.y + box.height * y / 900, { steps:12 }); await p.mouse.up(); };
const PAGES = [
  { id:'fare_lever', file:'briefing-fare.html', title:'What a fare does', first:'.bk-chip', play:async p => { await p.click('.bk-chip >> nth=4'); for(const i of [2, 3, 4]){ await p.waitForTimeout(400); await p.click(`.bk-chip >> nth=${i}`); await p.waitForTimeout(1500); } await go(p); await go(p); } },
  { id:'rival_split', file:'briefing-rival.html', title:'Customers have a choice', first:'.bk-rail', play:async p => { await drag(p, '.bk-rail', .3); await go(p); await go(p); } },
  { id:'full_route', file:'briefing-capacity.html', title:'More demand than seats', first:'.bk-hud button[aria-label="The people still at the gate"]', play:async p => { await p.click('.bk-hud button[aria-label="The people still at the gate"]'); await go(p); await go(p); } },
  { id:'weekend_demand', file:'briefing-weekend.html', title:'Weekdays and weekends', first:'.bk-hud button[aria-label="Sat"]', play:async p => { await p.click('.bk-hud button[aria-label="Sat"]'); await p.click('.bk-hud button[aria-label="Sun"]'); await go(p); await W(p, '.bk-chip'); await p.click('.bk-chip:has-text("Change weekdays and weekends separately")'); await go(p); } },
  { id:'fuel_cash_tank_profit', file:'briefing-fuel.html', title:'Cash, tank, profit', first:'.bk-chip', play:async p => { await p.click('.bk-chip >> nth=1'); await W(p, '.bk-hud button.bk-chip:has-text("Buy fuel")'); await p.click('.bk-hud button.bk-chip:has-text("Buy fuel")'); await go(p); await go(p); } },
  { id:'aircraft_efficiency', file:'briefing-efficiency.html', title:'Two planes, one route', first:'.bk-hud button[aria-label]', play:async p => { await p.click('.bk-hud button[aria-label] >> nth=0'); await go(p); await go(p); } },
  { id:'flight_time', file:'briefing-time.html', title:'How long will it take?', first:'.bk-hud button.bk-chip', play:async p => { await p.click('.bk-hud button:has-text("Fly one hour")'); await p.waitForTimeout(1300); for(let i = 0; i < 2; i++){ await p.click('.bk-hud button:has-text("Fly a quarter")'); await p.waitForTimeout(1200); } await W(p, '.bk-hud button[aria-label="Time"]'); await p.click('.bk-hud button[aria-label="Time"]'); await go(p); await go(p); } },
  { id:'event_weekend', file:'briefing-event.html', title:'One big Saturday', first:'.bk-hud button[aria-label="Sat"]', play:async p => { await p.click('.bk-hud button[aria-label="Sat"]'); await p.click('.bk-hud button[aria-label="Sun"]'); await go(p); await W(p, '.bk-chip'); await p.click('.bk-chip:has-text("Change one particular date")'); await go(p); } },
  { id:'seasons', file:'briefing-seasons.html', title:'A year of demand', first:'.bk-hud [role=button]', play:async p => { await dragTo(p, '.bk-hud [role=button]', 525, 700); await go(p); await W(p, '.bk-chip'); await p.click('.bk-chip:has-text("Plans that switch with the season")'); await go(p); } },
  { id:'lease_money', file:'briefing-lease.html', title:'Renting a plane', first:'.bk-rail', play:async p => { await drag(p, '.bk-rail', .6); await go(p); await go(p); } },
  { id:'profit_vs_cash', file:'briefing-cash.html', title:'Profit is not cash', first:'.bk-hud button[aria-label="The day cash fell"]', play:async p => { await p.click('.bk-hud button[aria-label="The day cash fell"]'); await go(p); await go(p); } },
];

(async () => {
  const b = await chromium.launch();
  /* ---------- part 1: each page on its own ---------- */
  for(const P of PAGES){ if(!want(P.id)) continue;
    for(const rm of [false, true]){ if(rm && !['fare_lever', 'full_route'].includes(P.id)) continue;
      const p = await b.newPage({ viewport:{ width:1366, height:768 } }), errs = []; p.on('pageerror', e => errs.push(e.message)); if(rm) await p.emulateMedia({ reducedMotion:'reduce' });
      const tag = P.id + (rm ? ' (reduced motion)' : '');
      try{
        await p.goto('file://' + path.join(DIR, P.file));
        await W(p, '.bk-title', 8000);
        ok(`${tag}: the frame: BRIEFING, the title, four progress marks, Pause & discuss, no Skip outside test mode`, (await p.textContent('.bk-title')) === P.title && (await p.$$('.bk-marks i')).length === 4 && !!(await p.$('#bkPause')) && !(await p.$('#bkSkip')), await p.textContent('.bk-title'));
        await W(p, P.first, 40000); await p.waitForTimeout(300);
        ok(`${tag}: the scene waits for him: no Continue before he acts`, await p.$eval('.bk-go', e => e.hidden), await p.textContent('.bk-cap'));
        if(!rm) await p.screenshot({ path:`${OUT}${P.id}-1.png` });
        if(P.id === 'fare_lever' && !rm){   // Pause & discuss freezes the scene (its clock stops)
          await p.click('#bkPause'); const paused = await p.$eval('.bk', e => e.classList.contains('paused')); const s1 = await p.evaluate(() => K.isPaused()); await p.click('#bkResume');
          ok('Pause & discuss: the scene freezes for talk, and Resume carries on', paused && s1 && !(await p.evaluate(() => K.isPaused()))); }
        await P.play(p);
        await W(p, '.bk-pz[style*="grid"]', 15000);
        ok(`${tag}: played to the end (in the game it folds back into the screen it prepared)`, /End of the briefing/.test(await p.textContent('.bk-stage')));
        if(!rm) await p.screenshot({ path:`${OUT}${P.id}-2.png` });
      }catch(e){ ok(`${tag}: played to the end`, false, e.message.split('\n')[0]); await p.screenshot({ path:`${OUT}${P.id}-stuck.png` }).catch(() => {}); }
      ok(`${tag}: no errors`, !errs.length, errs); await p.close(); } }

  /* ---------- part 2: in the game, at their moments ---------- */
  const p = await b.newPage({ viewport:{ width:1366, height:768 } }); p.on('pageerror', e => errors.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { const st = window.__sim.settings(); st.autoWall = false; st.opsSound = false; delete st.briefings; });
  const E = s => p.evaluate(x => window.__sim.evalIn(x), s), open = () => p.evaluate(() => window.__bf.open()), title = () => p.$eval('#bfLayer iframe', e => e.title).catch(() => '');
  // each save from a clean screen: no briefing open, no desk left open from the moment before (a desk open over Home is the game's UI, not the save's)
  const load = async d => { await p.evaluate(() => { if(window.__bf.open()) window.__bf.skip(); window.__sim.evalIn('UI.view = null'); }); await p.evaluate(c => { const s = window.__sim.loadCode(c); window.__sim.setS(s); window.__sim.landSave(); window.__sim.render(); }, fs.readFileSync(path.join(__dirname, `fixtures/jumps/day-${d}.txt`), 'utf8').trim()); await p.waitForTimeout(700); };
  const data = id => p.evaluate(i => JSON.stringify(window.__bf.data(i)), id).then(JSON.parse);
  const shopOpen = async () => { await p.click('[data-nav="fleet"]'); await p.waitForTimeout(300); const s = await p.$('#fleetShop'); if(s){ await s.click(); await p.waitForTimeout(1200); } };
  const at = async (id, how, check) => { if(!want(id)) return; try{ await how(); const o = await open(), t = await title(); ok(`${id}: opens by itself at its moment`, o && t.includes(PAGES.find(x => x.id === id).title), { day:await E('S.day'), step:await E('step().t'), t });
      if(o){ const D = await data(id); if(check) ok(`${id}: with his own figures`, check(D), D); await p.waitForTimeout(3500); await p.screenshot({ path:`${OUT}game-${id}.png` }); await p.evaluate(() => window.__bf.skip()); await p.waitForTimeout(300); ok(`${id}: once seen (or skipped) it does not open again`, !(await open()) && !!(await E(`(S.brief && S.brief.seen && S.brief.seen.${id}) || 0`))); } }
    catch(e){ ok(`${id}: at its moment`, false, e.message.split('\n')[0]); } };
  // Launch Day: the fare sums
  await at('fare_lever', async () => { await load(1); await p.evaluate(() => window.__tk.enter()); for(let g = 0; g < 4 && !(await open()); g++){ await p.evaluate(() => window.__tk.run('decision')); await p.waitForTimeout(600); } },
    D => D.fares && D.fares.length >= 3 && D.sums.length === 3 && D.fares.every(x => x.pax <= x.want) && /<svg/.test(D.art || ''));
  // Thursday: Red Kite; Sunday: the week-1 review
  await at('rival_split', async () => { for(let g = 0; g < 6 && !(await open()); g++){ await p.evaluate(() => window.__tk.run('decision')); await p.waitForTimeout(600); } }, D => D.rival === 50 && D.fare > D.rival && D.stay < D.want && D.stayAd > D.stay);
  await at('full_route', async () => { for(let g = 0; g < 6 && !(await open()); g++){ await p.evaluate(() => window.__tk.run('review')); await p.waitForTimeout(600); } }, D => D.want > D.flights.reduce((t, f) => t + f.sold, 0));
  // week 2: the Fuel desk; the shop's first comparison
  await at('fuel_cash_tank_profit', async () => { await load(8); await p.click('[data-nav="fuel"]'); await p.waitForTimeout(1500); }, D => D.cash > 0 && D.perDay > 0 && D.day.tickets > 0);
  await at('aircraft_efficiency', async () => { await load(8); await shopOpen(); }, D => D.a.seats < D.b.seats && D.a.litres / D.a.seats > D.b.litres / D.b.seats);
  // week 3: the first Flight times page; week 4: the All Blacks announcement
  await at('flight_time', async () => { await load(15); await p.evaluate(() => window.__tk.enter()); await p.evaluate(() => window.__tk.run('plan')); await p.waitForTimeout(1200); }, D => D.route.km > 0 && D.plane.speed > 0);
  await at('event_weekend', async () => { await load(22); await p.evaluate(() => window.__tk.enter()); await p.evaluate(() => window.__tk.run('plan')); await p.waitForTimeout(1200); }, D => D.mult.filter(m => m > 1).length >= 1 && D.title.length > 3);
  // chapter 2: renting opens; chapter 3: the Finance desk (only after a purchase or an overdrawn month)
  await at('lease_money', async () => { await load(127); await shopOpen(); }, D => D.price / D.rent === 2000);
  if(want('profit_vs_cash')){ await load(365); await p.click('[data-nav="finance"]').catch(() => {}); await p.waitForTimeout(1200); const D = await data('profit_vs_cash');
    ok('profit_vs_cash: plays only after a plane is bought or a month ends overdrawn', (await open()) === !!(D && (D.bought || D.overdrawn)), { open:await open(), bought:D && D.bought, overdrawn:D && D.overdrawn }); if(await open()) await p.evaluate(() => window.__bf.skip()); }
  if(want('seasons')){ await load(92); const D = await data('seasons'); ok('seasons: Geneva swells in winter, Barcelona in summer (the Market weeks)', D && D.places[0].mult[4] > D.places[0].mult[10] && D.places[1].mult[10] > D.places[1].mult[4], D && D.places.map(x => x.city + ':' + x.mult.join('/'))); }
  // played to the end in the game: the efficiency scene, then the Home shelf and a replay
  if(want('shelf')){ try{ await p.evaluate(() => window.__tk.leave && window.__tk.leave()); await load(8);
    ok('out of test mode, the screen-name tag goes (no stale week left in the corner)', !(await p.$('#pnTag')), await p.$eval('#pnTag', e => e.textContent).catch(() => null));
    await shopOpen(); if(await open()){ const F = p.frameLocator('#bfLayer iframe');
      ok('in the game, out of test mode: no Skip button', !(await F.locator('#bkSkip').count()));
      await F.locator('.bk-hud button[aria-label]').first().waitFor({ timeout:30000 }); await F.locator('.bk-hud button[aria-label]').first().click();
      for(let i = 0; i < 2; i++){ await F.locator('.bk-go').waitFor({ timeout:45000 }); await p.waitForTimeout(250); await F.locator('.bk-go').click(); }
      await p.waitForTimeout(500); ok('played to the end: the frame closes on the shop it prepared, and it is marked seen', !(await open()) && await E('step().t') === 'shop2' && !!(await E('(S.brief.seen.aircraft_efficiency) || 0'))); }
    // Home with two briefings seen: the shelf
    await load(8); await E('(S.brief = { seen:{ aircraft_efficiency:8, fare_lever:1 } }, UI.view = null, render(), 1)'); await p.waitForTimeout(500);
    const shelf = await p.$('#bfHomeBtn'); ok('Home: a Briefings button beside Plan the week lists what he has seen', !!shelf, shelf ? await shelf.textContent() : null);
    if(shelf){ await shelf.click(); await p.waitForTimeout(200); await p.screenshot({ path:`${OUT}home-shelf.png` }); const n = (await p.$$('[data-bfhome]')).length; await p.click('[data-bfhome] >> nth=0'); await p.waitForTimeout(800);
      ok('Home: one plays again from the shelf', n >= 1 && await open(), { n, t:await title() }); if(await open()) await p.evaluate(() => window.__bf.skip()); } }
    catch(e){ ok('shelf: played to the end out of test mode, then the Home shelf', false, e.message.split('\n')[0]); } }
  ok('game: no errors', !errors.length, errors);
  console.log(checks.join('\n')); console.log('ERRORS', errors.length ? errors : 'none');
  await b.close(); process.exit(checks.some(c => c.startsWith('FAIL')) || errors.length ? 1 : 0);
})();
