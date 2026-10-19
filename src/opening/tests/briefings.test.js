// Run: NODE_PATH=<playwright node_modules> node briefings.test.js   (env: OUT, GAME, ONLY=id,id, W, H)
// Operations briefings (Fable's plan, 18 Oct 2026; Briefing 13 from the 18 Oct handover): twelve short scenes in the airline's world. Part 1 plays each page on its own
// (its fallback figures, the kit loaded from briefings/kit/) and checks the shared frame and its rules: the title and its
// progress marks (four; five for Briefing 13); after a context beat's Continue, none before the pupil acts; Pause freezes the scene; the end is reached; with reduced motion too.
// Part 2 opens each at its moment in the game with the pupil's own figures (the Jump to airlines), plays one to the end, and
// checks it is marked seen, sits on the Home shelf and plays again from there; Skip shows in test mode only.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const ROOT = path.resolve(__dirname, '../../..'), FILE = 'file://' + path.resolve(ROOT, process.env.GAME || 'airline-opening-prototype.html'), DIR = path.resolve(__dirname, '../briefings');
const OUT = (process.env.OUT || os.tmpdir() + '/airline-briefings') + '/', ONLY = (process.env.ONLY || '').split(',').filter(Boolean); fs.mkdirSync(OUT, { recursive:true });
const checks = [], errors = [], ok = (name, cond, x) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (x !== undefined ? ' ' + JSON.stringify(x).slice(0, 300) : ''));
const want = id => !ONLY.length || ONLY.includes(id), myResV = r => r && r.v > 0 ? r.v : 0, VW = +(process.env.W || 1366), VH = +(process.env.H || 768);

/* how a pupil does each page: the first interaction is awaited (Continue must still be hidden then), the rest drive it to the end */
const W = async (p, sel, ms) => p.waitForSelector(sel, { timeout:ms || 30000 });
const go = async p => { await W(p, '.bk-go:not([hidden])', 45000); await p.waitForTimeout(250); await p.click('.bk-go'); };
const drag = async (p, sel, frac) => { const r = await p.$(sel), b = await r.boundingBox(); await p.mouse.move(b.x + 2, b.y + b.height / 2); await p.mouse.down(); await p.mouse.move(b.x + b.width * frac, b.y + b.height / 2, { steps:10 }); await p.mouse.up(); };
const dragTo = async (p, sel, x, y) => { const el = await p.$(sel), bb = await el.boundingBox(), box = await (await p.$('.bk-world')).boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(box.x + box.width * x / 1600, box.y + box.height * y / 900, { steps:12 }); await p.mouse.up(); };
const PAGES = [
  { id:'fare_lever', file:'briefing-fare.html', title:'What a fare does', own:true },   // rebuilt 19 Oct (D104): its own frame, tested in part 1b
  { id:'rival_split', file:'briefing-rival.html', title:'Customers have a choice', pre:go, first:'.bk-rail', play:async p => { await drag(p, '.bk-rail', .3); await go(p); await go(p); await go(p); } },
  { id:'full_route', file:'briefing-capacity.html', title:'More demand than seats', first:'.bk-hud button[aria-label="The people still at the gate"]', play:async p => { await p.click('.bk-hud button[aria-label="The people still at the gate"]'); await go(p); await go(p); } },
  { id:'weekend_demand', file:'briefing-weekend.html', title:'Weekdays and weekends', first:'.bk-hud button[aria-label="Sat"]', play:async p => { await p.click('.bk-hud button[aria-label="Sat"]'); await p.click('.bk-hud button[aria-label="Sun"]'); await go(p); await W(p, '.bk-chip'); await p.click('.bk-chip:has-text("Change weekdays and weekends separately")'); await go(p); } },
  { id:'fuel_cash_tank_profit', file:'briefing-fuel.html', title:'Cash, tank, profit', first:'.bk-chip', play:async p => { await p.click('.bk-chip >> nth=1'); await W(p, '.bk-hud button.bk-chip:has-text("Buy fuel")'); await p.click('.bk-hud button.bk-chip:has-text("Buy fuel")'); await go(p); await go(p); } },
  { id:'aircraft_efficiency', file:'briefing-efficiency.html', title:'Two planes, one route', first:'.bk-hud button[aria-label]', play:async p => { await p.click('.bk-hud button[aria-label] >> nth=0'); await go(p); await go(p); } },
  { id:'flight_time', file:'briefing-time.html', title:'How long will it take?', first:'.bk-hud button.bk-chip', play:async p => { await p.click('.bk-hud button:has-text("Fly one hour")'); await p.waitForTimeout(1300); for(let i = 0; i < 2; i++){ await p.click('.bk-hud button:has-text("Fly a quarter")'); await p.waitForTimeout(1200); } await W(p, '.bk-hud button[aria-label="Time"]'); await p.click('.bk-hud button[aria-label="Time"]'); await go(p); await go(p); } },
  { id:'event_weekend', file:'briefing-event.html', title:'One big Saturday', first:'.bk-hud button[aria-label="Sat"]', play:async p => { await p.click('.bk-hud button[aria-label="Sat"]'); await p.click('.bk-hud button[aria-label="Sun"]'); await go(p); await W(p, '.bk-chip'); await p.click('.bk-chip:has-text("Change one particular date")'); await go(p); } },
  { id:'seasons', file:'briefing-seasons.html', title:'A year of demand', first:'.bk-hud [role=button]', play:async p => { await dragTo(p, '.bk-hud [role=button]', 525, 700); await go(p); await W(p, '.bk-chip'); await p.click('.bk-chip:has-text("Plans that switch with the season")'); await go(p); } },
  { id:'lease_money', file:'briefing-lease.html', title:'Renting a plane', first:'.bk-rail', play:async p => { await drag(p, '.bk-rail', .6); await go(p); await go(p); } },
  { id:'cash_to_fly', file:'briefing-cash-to-fly.html', title:'Can you afford to run it?', marks:5, pre:go, first:'.bk-act:not([hidden]):not([disabled])', play:async p => { await p.click('.bk-act:not([hidden]):not([disabled]) >> nth=0');
      for(let g = 0; g < 240 && !(await p.$('.bk-go:not([hidden])')); g++){ const b = await p.$('.bk-act.sec:not([hidden]):not([disabled])'); if(b) await b.click(); await p.waitForTimeout(400); }
      await go(p); await W(p, '.bk-card [data-c="no"]'); await p.click('.bk-card [data-c="no"]'); await go(p); await go(p); } },
  { id:'profit_vs_cash', file:'briefing-cash.html', title:'Profit is not cash', first:'.bk-hud button[aria-label="The day cash fell"]', play:async p => { await p.click('.bk-hud button[aria-label="The day cash fell"]'); await go(p); await go(p); } },
];

/* What a fare does, played through by a pupil (a page, or the briefing's frame in the game); returns what each beat showed */
async function playFare(f, slow){ const R = {}, txt = s => f.locator(s).first().textContent().catch(() => ''), nx = () => f.locator('#nx').click(), dis = () => f.locator('#nx').isDisabled();
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const back0 = await f.locator('#bk').isDisabled(); for(let i = 0; i < 3; i++){ await f.locator('#sell').click(); await sleep(300); } await sleep(1100);
  R.b1 = back0 && !(await dis()) && /3 tickets × £100 = £300/.test(await txt('#mf')) && /revenue/i.test(await txt('#mt'));
  await nx(); await f.locator('#fr').evaluate(e => { for(const v of [6, 2, 4]){ e.value = v; e.dispatchEvent(new Event('input')); } }); await sleep(600);
  R.b2x = [await txt('#dv'), await f.locator('#pat').getAttribute('class')]; R.b2 = R.b2x[0] === '40' && !/hide/.test(R.b2x[1]);
  await nx(); await f.locator('#board').click(); await sleep(3400);
  R.b3x = [await txt('#f0'), await txt('#f1'), await txt('#left'), await f.locator('.pp.dim').count()]; R.b3 = R.b3x[0] === '19/19 ✓' && R.b3x[1] === '19/19 ✓' && /42/.test(R.b3x[2]) && R.b3x[3] === 42;
  await nx(); R.b4x = (await txt('#pic')).replace(/\s+/g, ' '); R.b4 = /£70/.test(R.b4x) && /42 left behind/.test(R.b4x) && /£140/.test(R.b4x) && /20 seats fly empty/.test(R.b4x);
  await nx(); const w5 = await dis(); await f.locator('#chb').click(); await sleep(300); R.b5 = w5 && !(await dis()) && !/hide/.test(await f.locator('#gb').getAttribute('class')) && !/wrong|right|correct/i.test(await txt('#capt'));
  await nx(); const cells = []; for(let k = 1; k <= 4; k++){ await nx(); if(slow) await sleep(k === 2 ? 3300 : 1700); cells.push([await txt('#a3'), await txt('#b3'), (await txt('#d4')).replace(/\s+/g, ' '), (await txt('#wl')).replace(/\s+/g, ' ')]); }
  await sleep(400); const last = [await txt('#a3'), await txt('#b3'), (await txt('#d4')).replace(/\s+/g, ' ')];
  R.b6x = { cells, last }; R.b6 = last[0] === '£1,900' && last[1] === '£1,980' && /£80 more for the £110 plane/.test(last[2]) && /18 × £100 = £1,800/.test(cells[1][3]) && /18 × £10 = £180/.test(cells[1][3].replace(/\u00a0/g, ' ').replace(/ +/g, ' ')) && /Your guess: the £110 plane/.test(cells[3][3]);
  await nx(); R.b7x = [await f.locator('.tile').count(), await txt('#nx'), await f.locator('#nx').getAttribute('class')]; R.b7 = R.b7x[0] === 4 && /Set my fares/.test(R.b7x[1]) && /go/.test(R.b7x[2]);
  await nx(); await sleep(400); return R; }

(async () => {
  const b = await chromium.launch();
  /* ---------- part 1: each page on its own ---------- */
  for(const P of PAGES){ if(!want(P.id) || P.own) continue;
    for(const rm of [false, true]){ if(rm && !['full_route'].includes(P.id)) continue;
      const p = await b.newPage({ viewport:{ width:VW, height:VH } }), errs = []; p.on('pageerror', e => errs.push(e.message)); if(rm) await p.emulateMedia({ reducedMotion:'reduce' });
      const tag = P.id + (rm ? ' (reduced motion)' : '');
      try{
        await p.goto('file://' + path.join(DIR, P.file));
        await W(p, '.bk-title', 8000);
        ok(`${tag}: the frame: BRIEFING, the title, ${P.marks || 4} progress marks, Pause & discuss, no Skip outside test mode`, (await p.textContent('.bk-title')) === P.title && (await p.$$('.bk-marks i')).length === (P.marks || 4) && !!(await p.$('#bkPause')) && !(await p.$('#bkSkip')), await p.textContent('.bk-title'));
        if(P.pre) await P.pre(p);   // a scene that opens on its context: Continue, then the pupil's first move
        await W(p, P.first, 40000); await p.waitForTimeout(300);
        ok(`${tag}: the scene waits for him: no Continue before he acts`, await p.$eval('.bk-go', e => e.hidden), await p.textContent('.bk-cap'));
        if(!rm) await p.screenshot({ path:`${OUT}${P.id}-1.png` });
        if(P.id === 'full_route' && !rm){   // Pause & discuss freezes the scene (its clock stops)
          await p.click('#bkPause'); const paused = await p.$eval('.bk', e => e.classList.contains('paused')); const s1 = await p.evaluate(() => K.isPaused()); await p.click('#bkResume');
          ok('Pause & discuss: the scene freezes for talk, and Resume carries on', paused && s1 && !(await p.evaluate(() => K.isPaused()))); }
        await P.play(p);
        await W(p, '.bk-pz[style*="grid"]', 15000);
        ok(`${tag}: played to the end (in the game it folds back into the screen it prepared)`, /End of the briefing/.test(await p.textContent('.bk-stage')));
        if(!rm) await p.screenshot({ path:`${OUT}${P.id}-2.png` });
      }catch(e){ ok(`${tag}: played to the end`, false, e.message.split('\n')[0]); await p.screenshot({ path:`${OUT}${P.id}-stuck.png` }).catch(() => {}); }
      ok(`${tag}: no errors`, !errs.length, errs); await p.close(); } }

  /* ---------- part 1b: What a fare does, rebuilt (Claude Design handover 19 Oct, section 6): seven beats, the game shows every sum ---------- */
  if(want('fare_lever')) for(const rm of [false, true]){
    const p = await b.newPage({ viewport:{ width:VW, height:VH } }), errs = [], tag = 'What a fare does' + (rm ? ' (reduced motion)' : ''); p.on('pageerror', e => errs.push(e.message)); if(rm) await p.emulateMedia({ reducedMotion:'reduce' });
    try{
      await p.goto('file://' + path.join(DIR, 'briefing-fare.html')); await W(p, '#nx', 8000);
      ok(`${tag}: the frame: OPERATIONS BRIEFING, the title, Show · Notice · Reveal · Use, Back and Next, no Skip outside test mode`, (await p.textContent('.bh .tt')) === 'What a fare does' && /Show.*Notice.*Reveal.*Use/i.test(await p.textContent('#stp')) && !(await p.$('#skip')));
      const res = await playFare(p, rm ? 0 : 1);
      ok(`${tag}: beat 1: Back is off, Next is always allowed, each ticket sold adds the fare to Ticket money · revenue`, res.b1);
      ok(`${tag}: beat 2: the slider moves the crowd; after three fares the pattern line shows`, res.b2, res.b2x);
      ok(`${tag}: beat 3: 80 want at £70, the planes board to 19/19 and 19/19, 42 can't (dimmed, not red)`, res.b3, res.b3x);
      ok(`${tag}: beat 4: £70 full with 42 left behind against £140 with 20 seats flying empty`, res.b4, res.b4x);
      ok(`${tag}: beat 5 (Notice): Next waits for his guess, then "Your guess" (never marked)`, res.b5);
      ok(`${tag}: beat 6 (Reveal): the sheet works it out in five steps: £1,900, £1,980 (18 × £100 + 18 × £10), £80 more for the £110 plane`, res.b6, res.b6x);
      ok(`${tag}: beat 7 (Use): four recap tiles and the green Set my fares`, res.b7, res.b7x);
      if(!rm) await p.screenshot({ path:`${OUT}fare_lever-2.png` });
    }catch(e){ ok(`${tag}: played to the end`, false, e.message.split('\n')[0]); await p.screenshot({ path:`${OUT}fare_lever-stuck.png` }).catch(() => {}); }
    ok(`${tag}: no errors`, !errs.length, errs); await p.close(); }

  /* ---------- part 2: in the game, at their moments ---------- */
  const p = await b.newPage({ viewport:{ width:VW, height:VH } }); p.on('pageerror', e => errors.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { const st = window.__sim.settings(); st.autoWall = false; st.opsSound = false; delete st.briefings; });
  const E = s => p.evaluate(x => window.__sim.evalIn(x), s), open = () => p.evaluate(() => window.__bf.open()), title = () => p.$eval('#bfLayer iframe', e => e.title).catch(() => '');
  // each save from a clean screen: no briefing open, no desk left open from the moment before (a desk open over Home is the game's UI, not the save's)
  const load = async d => { await p.evaluate(() => { if(window.__bf.open()) window.__bf.skip(); window.__sim.evalIn('UI.view = null'); }); await p.evaluate(c => { const s = window.__sim.loadCode(c); window.__sim.setS(s); window.__sim.landSave(); window.__sim.render(); }, fs.readFileSync(path.join(__dirname, `fixtures/jumps/day-${d}.txt`), 'utf8').trim()); await p.waitForTimeout(700); };
  const data = id => p.evaluate(i => JSON.stringify(window.__bf.data(i)), id).then(JSON.parse);
  const shopOpen = async () => { await p.click('[data-nav="fleet"]'); await p.waitForTimeout(300); const s = await p.$('#fleetShop'); if(s){ await s.click(); await p.waitForTimeout(1200); } };
  const at = async (id, how, check) => { if(!want(id)) return; try{ await how(); const o = await open(), t = await title(); ok(`${id}: opens by itself at its moment`, o && t.includes(PAGES.find(x => x.id === id).title), { day:await E('S.day'), step:await E('step().t'), t });
      if(o){ const D = await data(id); if(check) ok(`${id}: with the pupil's own figures`, check(D), D); await p.waitForTimeout(3500); await p.screenshot({ path:`${OUT}game-${id}.png` }); await p.evaluate(() => window.__bf.skip()); await p.waitForTimeout(300); ok(`${id}: once seen (or skipped) it does not open again`, !((await open()) && (await title()).includes(PAGES.find(x => x.id === id).title)) && !!(await E(`(S.brief && S.brief.seen && S.brief.seen.${id}) || 0`))); } }
    catch(e){ ok(`${id}: at its moment`, false, e.message.split('\n')[0]); } };
  // Launch Day: the fare sums
  await at('fare_lever', async () => { await load(1); await p.evaluate(() => window.__tk.enter()); for(let g = 0; g < 4 && !(await open()); g++){ await p.evaluate(() => window.__tk.run('decision')); await p.waitForTimeout(600); } },
    D => D.route === 'Dublin' && D.fares.length === 9 && D.wantToFly.join() === '100,80,64,50,40,36,30,24,18' && D.seatsPerPlane === 19 && D.planes === 2 && D.compareFares.join() === '100,110');
  // Launch Day's order (Bertie, 18 Oct: each briefing before the first time it is worked out): the fare scene in the Studio, the fuel scene before the fuel order
  if(want('fare_lever')) ok('fare_lever: opens in the Studio, before a fare can be changed, and ends on the plan', /"next":"studio"/.test(await E('JSON.stringify((S.brief.data || {}).fare_lever || {})')));
  if(want('fare_lever')) try{   // played through in the game: Set my fares goes back to the fare stepper in his plan
    await load(1); await p.evaluate(() => window.__tk.enter()); await E('(S.brief && (delete S.brief.seen.fare_lever), UI.tkPlanned = null, render(), 1)'); await p.waitForTimeout(600); if(await p.$('#ftpGo')){ await p.click('#ftpGo'); await p.waitForTimeout(900); }
    for(let g = 0; g < 4 && !(await open()); g++){ await p.evaluate(() => window.__tk.run('decision')); await p.waitForTimeout(600); }
    if(await open()){ const R = await playFare(p.frameLocator('#bfLayer iframe'), 1); await p.waitForTimeout(800);
      ok('fare_lever in the game: all seven beats, then Set my fares: back in the Studio with a flight selected and its fare stepper ready', R.b1 && R.b3 && R.b6 && R.b7 && !(await open()) && (await E('step().t')) === 'plan' && !!(await p.$('[data-bvfare]')) && /bvfare/.test(await p.evaluate(() => document.activeElement && document.activeElement.outerHTML.slice(0, 80))), R.b6x); }
    else ok('fare_lever in the game: opens again for the play-through', false);
  }catch(e){ ok('fare_lever in the game: played through', false, e.message.split('\n')[0]); }
  if(want('fuel_launch')){ try{ for(let g = 0; g < 8 && !(await open()); g++){ await p.evaluate(() => window.__tk.run('decision')); await p.waitForTimeout(600); }
      const t = await title(), st = await E('step().t'), tb = JSON.parse(await E('JSON.stringify((t => t && { stage:t.stage, v:t.cols[0].values })(currentTable()))'));
      const fr = p.frames().find(f => f !== p.mainFrame()), B = fr ? await fr.evaluate(() => window.BRIEF) : {};
      ok('Cash, tank, profit: opens on Launch Day before the fuel order, with the order\'s own figures', /Cash, tank, profit/.test(t) && st === 'workings' && tb && tb.stage === 'fuelorder' && B.buyL === tb.v.blocks * 1000 && Math.abs(B.price * 1000 - tb.v.blk) < 0.01 && B.next === 'order' && B.cash > 0, { t, st, tb, B:{ buyL:B.buyL, price:B.price, cash:B.cash, days:B.days, perDay:B.perDay, next:B.next } });
      await p.waitForTimeout(3000); await p.screenshot({ path:`${OUT}game-fuel-launch.png` }); await p.evaluate(() => window.__bf.skip()); await p.waitForTimeout(300); }
    catch(e){ ok('Cash, tank, profit on Launch Day', false, e.message.split('\n')[0]); } }
  // Thursday: Red Kite; Sunday: the week-1 review
  await at('rival_split', async () => { for(let g = 0; g < 6 && !(await open()); g++){ await p.evaluate(() => window.__tk.run('decision')); await p.waitForTimeout(600); } }, D => D.rival === 50 && D.fare > D.rival && D.stay < D.want && D.stayAd > D.stay);
  await at('full_route', async () => { for(let g = 0; g < 6 && !(await open()); g++){ await p.evaluate(() => window.__tk.run('review')); await p.waitForTimeout(600); } }, D => D.want > D.flights.reduce((t, f) => t + f.sold, 0));
  // week 2: the Fuel desk; the shop's first comparison
  await at('fuel_cash_tank_profit', async () => { await load(8); await p.click('[data-nav="fuel"]'); await p.waitForTimeout(1500); }, D => D.cash > 0 && D.perDay > 0 && D.day.tickets > 0);
  // Briefing 13 (D103): straight after the fuel scene on the week-2 Fuel desk, with the pupil's own week, planes and the shop's cheapest plane
  await at('cash_to_fly', async () => { if(!(await open())){ await load(8); await E('((S.brief = S.brief || { seen:{} }).seen.fuel_cash_tank_profit = 8, 1)'); await p.click('[data-nav="fuel"]'); await p.waitForTimeout(1500); } },
    D => D.cash > 0 && D.days.length === 7 && D.days.every(x => x.litres >= 0 && x.tickets >= 0) && D.price > 0 && D.blockLitres > 0 && D.planes.length >= 1 && D.reserve === 0);
  if(want('cash_to_fly')){ const R = JSON.parse(await E('JSON.stringify({ r:S.brief.cashToFly || null, res:S.myRes || null })'));
    ok('cash_to_fly: skipped, the pupil\'s reserve stays unset (£0) and the moment is recorded', R.r && R.r.at === 'fuel' && R.r.skipped && myResV(R.res) === 0, R); }
  // the shop in week 2: Briefing 13 first (if the Fuel desk has not played it), then the efficiency scene before the comparison
  await at('aircraft_efficiency', async () => { await load(8); await shopOpen(); if((await title()).includes('Can you afford')){ await p.evaluate(() => window.__bf.skip()); await p.waitForTimeout(1500); } }, D => D.a.seats < D.b.seats && D.a.litres / D.a.seats > D.b.litres / D.b.seats);
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
    await E('((S.brief = S.brief || { seen:{} }).seen.cash_to_fly = 8, 1)');   // (Briefing 13 has its own checks above)
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
