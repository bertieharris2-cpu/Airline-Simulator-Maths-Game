// Run: NODE_PATH=<playwright node_modules> node briefings.test.js   (env: OUT, GAME, ONLY=id,id, W, H)
// Operations briefings (Fable's plan, 18 Oct 2026; Briefing 13 from the 18 Oct handover): short scenes in the airline's world. Part 1 plays each page on its own
// (its fallback figures, the kit loaded from briefings/kit/) and checks the shared frame and its rules: the title, the Show · Reveal · Use stepper, Back and Next
// always allowed (Back replays to the beat before); since 20 Oct 2026 (Bertie's briefings review) the words sit inside the picture, the bottom bar holds only
// Pause & discuss, Back and Next, and a prediction (chips and Not sure) hides Next until he taps one, marks nothing, and the scene after it shows "You predicted";
// a decision (an Operations Request, Briefing 13's buy and fly) holds Next until it is made; Pause freezes the scene; the end is reached; with reduced motion too.
// More demand than seats (full_route) is retired (20 Oct): its page sits in briefings/retired/ and the game never opens it.
// Part 2 opens each at its moment in the game with the pupil's own figures (the Jump to airlines), plays one to the end, and
// checks it is marked seen, sits on the Home shelf and plays again from there; Skip shows in test mode only.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const ROOT = path.resolve(__dirname, '../../..'), FILE = 'file://' + path.resolve(ROOT, process.env.GAME || 'airline-opening-prototype.html'), DIR = path.resolve(__dirname, '../briefings');
const OUT = (process.env.OUT || os.tmpdir() + '/airline-briefings') + '/', ONLY = (process.env.ONLY || '').split(',').filter(Boolean); fs.mkdirSync(OUT, { recursive:true });
const checks = [], errors = [], ok = (name, cond, x) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (x !== undefined ? ' ' + JSON.stringify(x).slice(0, 300) : ''));
const want = id => !ONLY.length || ONLY.includes(id), myResV = r => r && r.v > 0 ? r.v : 0, VW = +(process.env.W || 1366), VH = +(process.env.H || 768);

/* how a pupil does each page (19 Oct, evening): Next, beat after beat, waiting for each beat to finish; a decision is made with the chip named in pick (or the first) */
const W = async (p, sel, ms) => p.waitForSelector(sel, { timeout:ms || 30000 });
const kit = p => p.evaluate(() => ({ w:K.waiting(), h:K.held(), n:K.beats(), cap:(document.querySelector('.bk-cap') || {}).textContent || '' }));
const settle = async (p, ms) => { for(let g = 0; g < (ms || 60000) / 150; g++){ const k = await kit(p); if(k.w || k.h || await p.$('.bk-pz[style*="grid"]')) return k; await p.waitForTimeout(150); } return kit(p); };
async function playY1(p, P){ const picks = (P.pick || []).slice(), seen = { held:0, nextWhileHeld:false, pred:null, recall:'' };
  for(let g = 0; g < 300; g++){ if(await p.$('.bk-pz[style*="grid"]')) return seen; const k = await settle(p);
    if(seen.pred && !seen.recall && k.w) seen.recall = await p.$eval('.bk-recall', e => e.textContent).catch(() => '');
    const pc = await p.$$('.bk-pchip');   // a prediction (20 Oct 2026): Next stays hidden until a chip is tapped; nothing is marked
    if(pc.length && !seen.pred){ const labels = await p.$$eval('.bk-pchip', es => es.map(e => e.textContent)), hidden = await p.$eval('.bk-go', e => e.hidden), q = await p.$eval('.bk-cap', e => e.textContent);
      const want = P.predict && labels.includes(P.predict) ? P.predict : labels[0]; await p.click(`.bk-pchip:has-text("${want}")`); await p.waitForTimeout(250);
      seen.pred = { q, labels, hidden, after:await p.$eval('.bk-go', e => !e.hidden), pressed:await p.$$eval('.bk-pchip[aria-pressed="true"]', es => es.map(e => e.textContent)), marks:await p.$$eval('.bk-words', es => es.map(e => e.textContent).join(' ')), want };
      await p.click('.bk-go'); await p.waitForTimeout(150); continue; }
    if(k.h){ seen.held++; if(await p.$eval('.bk-go', e => !e.hidden)) seen.nextWhileHeld = true;
      const want = picks[0], chip = want ? await p.$(`.bk-chip:has-text("${want}"):visible`) : null;
      if(chip){ picks.shift(); await chip.click(); await p.waitForTimeout(250); continue; }
      const c = await p.$('.bk-card [data-c="no"]:visible') || await p.$('.bk-act.sec:not([hidden]):not([disabled])') || await p.$('.bk-act:not([hidden]):not([disabled])') || await p.$('.bk-chip:visible');
      if(c){ await c.click(); await p.waitForTimeout(300); } else await p.waitForTimeout(200); continue; }
    if(k.w){ await p.click('.bk-go'); await p.waitForTimeout(120); continue; } }
  throw new Error('did not reach the end'); }
const drag = async (p, sel, frac) => { const r = await p.$(sel), b = await r.boundingBox(); await p.mouse.move(b.x + 2, b.y + b.height / 2); await p.mouse.down(); await p.mouse.move(b.x + b.width * frac, b.y + b.height / 2, { steps:10 }); await p.mouse.up(); };
const PAGES = [
  { id:'fare_lever', file:'briefing-fare.html', title:'What a fare does', own:true },   // rebuilt 19 Oct (D104): its own frame, tested in part 1b
  { id:'rival_split', file:'briefing-rival.html', title:'Customers have a choice', predict:'Move to Red Kite' },
  { id:'full_route', file:'retired/briefing-capacity.html', title:'More demand than seats', retired:true },   // retired 20 Oct 2026 (DESIGN.md)
  { id:'weekend_demand', file:'briefing-weekend.html', title:'Weekdays and weekends', pick:['Change weekdays and weekends separately'], predict:'Sat and Sun' },
  { id:'fuel_cash_tank_profit', file:'briefing-fuel.html', title:'Cash, tank, profit' },
  { id:'aircraft_efficiency', file:'briefing-efficiency.html', title:'Two planes, one route' },
  { id:'flight_time', file:'briefing-time.html', title:'How long will it take?', predict:'1 h 30' },   // rebuilt 21 Oct 2026 in Bertie's order (part 1c)
  { id:'event_weekend', file:'briefing-event.html', title:'One big Saturday', pick:['Change one particular date'] },
  { id:'seasons', file:'briefing-seasons.html', title:'A year of demand', pick:['Plans that switch with the season'] },
  { id:'lease_money', file:'briefing-lease.html', title:'Renting a plane' },
  { id:'cash_to_fly', file:'briefing-cash-to-fly.html', title:'Can you afford to run it?', decides:true },
  { id:'profit_vs_cash', file:'briefing-cash.html', title:'Profit is not cash' },
];

/* What a fare does, played through by a pupil (a page, or the briefing's frame in the game); returns what each beat showed */
async function playFare(f, slow){ const R = {}, txt = s => f.locator(s).first().textContent().catch(() => ''), nx = () => f.locator('#nx').click(), dis = () => f.locator('#nx').isDisabled();
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const back0 = await f.locator('#bk').isDisabled(); for(let i = 0; i < 3; i++){ await f.locator('#sell').click(); await sleep(300); } await sleep(1100);
  R.b1 = back0 && !(await dis()) && /3 tickets × £100 = £300/.test(await txt('#mf')) && /revenue/i.test(await txt('#mt'));
  await nx(); { const fr = f.locator('#fr'), bx = await fr.boundingBox(), n = await fr.evaluate(() => document.querySelectorAll('.tk').length - 1), sc = bx.width / await fr.evaluate(e => e.offsetWidth);   // 22 Oct 2026: pressed, then the arrow keys, as a pupil would
    for(const v of [6, 2]){ await fr.click({ position:{ x:bx.width / sc * v / n, y:bx.height / sc / 2 } }); await sleep(200); } await fr.press('ArrowRight'); await fr.press('ArrowRight'); } await sleep(600);
  R.b2x = [await txt('#dv'), await f.locator('#pat').getAttribute('class')]; R.b2 = R.b2x[0] === '40' && !/hide/.test(R.b2x[1]);
  await nx(); await f.locator('#board').click(); await sleep(3400);
  R.b3x = [await txt('#f0'), await txt('#f1'), await txt('#left'), await f.locator('.pp.dim').count()]; R.b3 = R.b3x[0] === '19/19 ✓' && R.b3x[1] === '19/19 ✓' && /42/.test(R.b3x[2]) && R.b3x[3] === 42;
  await nx(); R.b4x = (await txt('#pic')).replace(/\s+/g, ' '); R.b4 = /£70/.test(R.b4x) && /42 left behind/.test(R.b4x) && /£140/.test(R.b4x) && /20 seats fly empty/.test(R.b4x);
  // beat 5, the prediction (20 Oct 2026): the question in the words, the two planes and Not sure; Next hidden until he taps one, nothing marked
  await nx(); R.b5x = [(await txt('#capt')).replace(/\s+/g, ' '), await f.locator('#pchips .pchip').allTextContents(), await dis(), await f.locator('#nx').evaluate(e => getComputedStyle(e).visibility)];
  await f.locator('#pchips .pchip', { hasText:'The £110 plane' }).click(); await sleep(200);
  R.b5x.push(await dis(), await f.locator('#pchips .pchip[aria-pressed="true"]').allTextContents(), await f.locator('#nx').evaluate(e => getComputedStyle(e).visibility));
  R.b5 = R.b5x[2] && R.b5x[3] === 'hidden' && /Which makes more ticket money\?/.test(R.b5x[0]) && R.b5x[1].join('|') === 'The £100 plane|The £110 plane|Not sure' && !R.b5x[4] && R.b5x[5].join() === 'The £110 plane' && R.b5x[6] === 'visible' && !/guess|wrong|right|correct/i.test(R.b5x[0]) && !(await f.locator('#pic button').count());
  await nx(); R.b6r = await txt('#recall'); const cells = []; for(let k = 1; k <= 4; k++){ await nx(); if(slow) await sleep(k === 2 ? 3300 : 1700); cells.push([await txt('#a3'), await txt('#b3'), (await txt('#d4')).replace(/\s+/g, ' '), (await txt('#wl')).replace(/\s+/g, ' ')]); }
  await sleep(400); const last = [await txt('#a3'), await txt('#b3'), (await txt('#d4')).replace(/\s+/g, ' ')];
  R.b6x = { cells, last, recall:R.b6r }; R.b6 = R.b6r === 'You predicted: The £110 plane' && last[0] === '£1,900' && last[1] === '£1,980' && /£80 more for the £110 plane/.test(last[2]) && /18 × £100 = £1,800/.test(cells[1][3]) && /18 × £10 = £180/.test(cells[1][3].replace(/\u00a0/g, ' ').replace(/ +/g, ' ')) && /One empty seat, but £80 more ticket money/.test(cells[3][3]) && !/guess/i.test(cells[3][3]);
  await nx(); R.b7x = [await f.locator('.tile').count(), await txt('#nx'), await f.locator('#nx').getAttribute('class')]; R.b7 = R.b7x[0] === 4 && /Set my fares/.test(R.b7x[1]) && /go/.test(R.b7x[2]);
  await nx(); await sleep(400); return R; }

(async () => {
  const b = await chromium.launch();
  /* ---------- part 1: each page on its own ---------- */
  for(const P of PAGES){ if(!want(P.id) || P.own || P.retired) continue;
    for(const rm of [false, true]){ if(rm && !['rival_split'].includes(P.id)) continue;
      const p = await b.newPage({ viewport:{ width:VW, height:VH } }), errs = []; p.on('pageerror', e => errs.push(e.message)); if(rm) await p.emulateMedia({ reducedMotion:'reduce' });
      const tag = P.id + (rm ? ' (reduced motion)' : '');
      try{
        await p.goto('file://' + path.join(DIR, P.file));
        await W(p, '.bk-title', 8000);
        const steps = await p.$$eval('.bk-steps i', es => es.map(e => e.textContent));
        ok(`${tag}: the frame: BRIEFING, the title, the Show · Reveal · Use stepper, Pause & discuss, Back (off at the start) and Next, no Skip outside test mode`, (await p.textContent('.bk-title')) === P.title && steps.join('|') === 'Show|Reveal|Use' && !!(await p.$('#bkPause')) && !(await p.$('#bkSkip')) && await p.$eval('.bk-back', e => e.disabled) && await p.$eval('.bk-go', e => !e.hidden), { title:await p.textContent('.bk-title'), steps });
        const k1 = await settle(p);
        ok(`${tag}: nothing to guess or tap: the first beat waits on Next${P.decides ? '' : ', with no hit boxes, sliders or drag handles in the scene'}`, k1.w && (P.decides || !(await p.$('.bk-rail, .bk-hud [role=button], .bk-hud [role=slider], .bk-hud button[aria-label]'))), k1);
        if(!rm) await p.screenshot({ path:`${OUT}${P.id}-1.png` });
        ok(`${tag}: the words sit inside the picture (a plate in the scene, not in the bar), and the bottom bar holds only Pause & discuss, Back and Next`, !!(await p.$('.bk-world .bk-words .bk-cap')) && !(await p.$('.bk-foot .bk-cap')) && (await p.$$eval('.bk-foot button', es => es.map(e => e.id || e.className).join('|'))) === 'bkPause|bk-back|bk-go' && !(await p.$('.bk-bar #bkPause')));
        if(P.id === 'rival_split' && !rm){   // Pause & discuss freezes the scene (its clock stops)
          await p.click('#bkPause'); const paused = await p.$eval('.bk', e => e.classList.contains('paused')); const s1 = await p.evaluate(() => K.isPaused()); await p.click('#bkResume');
          ok('Pause & discuss: the scene freezes for talk, and Resume carries on', paused && s1 && !(await p.evaluate(() => K.isPaused()))); }
        if(k1.w){ const c1 = k1.cap; await p.click('.bk-go'); const k2 = await settle(p); await p.click('.bk-back'); const k3 = await settle(p);   // Back replays the scene to the beat before
          ok(`${tag}: Back is always allowed: after Next it returns to the first beat, its words again`, k2.n === 1 && k3.n === 0 && k3.cap === c1 && await p.$eval('.bk-back', e => e.disabled), { c1:c1.slice(0, 70), n2:k2.n, n3:k3.n, c3:k3.cap.slice(0, 70) }); }
        const R = await playY1(p, P);
        ok(`${tag}: played to the end (in the game it folds back into the screen it prepared)`, /End of the briefing/.test(await p.textContent('.bk-stage')));
        if(P.pick || P.decides) ok(`${tag}: ${P.pick ? 'the Operations Request stays, and holds' : 'each decision holds'} Next until it is made`, R.held > 0 && !R.nextWhileHeld, R);
        if(P.predict) ok(`${tag}: the prediction: a question in the words, ${P.predict}, Not sure; Next hidden until he taps one, his chip outlined (nothing marked right or wrong), and the next scene shows "You predicted: ${P.predict}"`,
          R.pred && R.pred.hidden && R.pred.after && R.pred.labels.includes('Not sure') && R.pred.labels.includes(P.predict) && R.pred.pressed.join() === P.predict && !/correct|wrong|right!|✓|✗/i.test(R.pred.marks) && R.recall === 'You predicted: ' + P.predict, R.pred && Object.assign({}, R.pred, { recall:R.recall }));
        else ok(`${tag}: no prediction`, !R.pred, R.pred);
        if(!rm) await p.screenshot({ path:`${OUT}${P.id}-2.png` });
      }catch(e){ ok(`${tag}: played to the end`, false, e.message.split('\n')[0]); await p.screenshot({ path:`${OUT}${P.id}-stuck.png` }).catch(() => {}); }
      ok(`${tag}: no errors`, !errs.length, errs); await p.close(); } }

  /* ---------- part 1b: What a fare does, rebuilt (Claude Design handover 19 Oct, section 6): seven beats, the game shows every sum ---------- */
  if(want('fare_lever')) for(const rm of [false, true]){
    const p = await b.newPage({ viewport:{ width:VW, height:VH } }), errs = [], tag = 'What a fare does' + (rm ? ' (reduced motion)' : ''); p.on('pageerror', e => errs.push(e.message)); if(rm) await p.emulateMedia({ reducedMotion:'reduce' });
    try{
      await p.goto('file://' + path.join(DIR, 'briefing-fare.html')); await W(p, '#nx', 8000);
      ok(`${tag}: the frame: OPERATIONS BRIEFING, the title, Show · Reveal · Use, Back and Next, no Skip outside test mode`, (await p.textContent('.bh .tt')) === 'What a fare does' && (await p.textContent('#stp')) === 'ShowRevealUse' && !(await p.$('#skip')), await p.textContent('#stp'));
      ok(`${tag}: the words sit inside the picture (20 Oct 2026), and the bar holds only Back and Next`, !!(await p.$('.bf > #words #capt')) && !(await p.$('.bc #capt')) && (await p.$$eval('.bc button', es => es.map(e => e.id).join('|'))) === 'bk|nx');
      const res = await playFare(p, rm ? 0 : 1);
      ok(`${tag}: beat 1: Back is off, Next is always allowed, each ticket sold adds the fare to Ticket money · revenue`, res.b1);
      ok(`${tag}: beat 2: the slider moves the crowd; after three fares the pattern line shows`, res.b2, res.b2x);
      ok(`${tag}: beat 3: 80 want at £70, the planes board to 19/19 and 19/19, 42 can't (dimmed, not red)`, res.b3, res.b3x);
      ok(`${tag}: beat 4: £70 full with 42 left behind against £140 with 20 seats flying empty`, res.b4, res.b4x);
      ok(`${tag}: beat 5 (Show), the prediction: the question in the words, The £100 plane, The £110 plane and Not sure; Next hidden until he taps one, his chip outlined, nothing marked`, res.b5, res.b5x);
      ok(`${tag}: beat 6 (Reveal), design B: "You predicted: The £110 plane" small in the words, the bars, then the Airline-look sheet works it out: £1,900, £1,980 (18 × £100 + 18 × £10), £80 more for the £110 plane`, res.b6, res.b6x);
      ok(`${tag}: beat 7 (Use): four recap tiles and the green Set my fares`, res.b7, res.b7x);
      if(!rm) await p.screenshot({ path:`${OUT}fare_lever-2.png` });
    }catch(e){ ok(`${tag}: played to the end`, false, e.message.split('\n')[0]); await p.screenshot({ path:`${OUT}fare_lever-stuck.png` }).catch(() => {}); }
    ok(`${tag}: no errors`, !errs.length, errs); await p.close(); }

  /* ---------- part 1c: How long will it take?, rebuilt in Bertie's order (21 Oct 2026, scene-by-scene doc section 10): why it matters
     first, then the sum worked on screen a step at a time, then the ruler last, as the check; a later chapter keeps the scenes from before ---------- */
  if(want('flight_time')){
    const p = await b.newPage({ viewport:{ width:VW, height:VH } }), errs = []; p.on('pageerror', e => errs.push(e.message)); const B = [];
    try{
      await p.goto('file://' + path.join(DIR, 'briefing-time.html')); await W(p, '.bk-title', 8000);
      for(let g = 0; g < 12; g++){ if(await p.$('.bk-pz[style*="grid"]')) break; const k = await settle(p);
        const x = await p.evaluate(() => { const rt = [...document.querySelectorAll('svg text')].find(t => /^1 hour · /.test(t.textContent));
          return { step:[...document.querySelectorAll('.bk-steps i')].findIndex(i => i.className === 'on'), words:(document.querySelector('.bk-words') || {}).innerText || '',
            work:document.querySelector('.work.out') ? [] : [...document.querySelectorAll('.work .ln')].filter(e => getComputedStyle(e).display !== 'none').map(e => e.textContent.replace(/\s+/g, ' ').trim()),
            calls:[...document.querySelectorAll('.bk-call:not(.out)')].map(e => e.textContent), svg:[...document.querySelectorAll('svg text')].map(t => t.textContent).join(' · '), rul:rt ? +(rt.parentNode.getAttribute('opacity') || 1) : null,
            use:(document.querySelector('.ftu:not(.out)') || {}).innerText || '', chips:[...document.querySelectorAll('.bk-pchip')].map(e => e.textContent), go:(document.querySelector('.bk-go') || {}).textContent || '' }; });
        B.push(x); if(B.length <= 6) await p.screenshot({ path:`${OUT}flight_time-s${B.length}.png` });
        if(x.chips.length){ await p.click('.bk-pchip:has-text("1 h 30")'); await p.waitForTimeout(250); await p.click('.bk-go'); await p.waitForTimeout(150); continue; }
        if(k.w){ await p.click('.bk-go'); await p.waitForTimeout(150); continue; } }
      const at = i => B[i] || { words:'', work:[], calls:[], svg:'', use:'', chips:[], go:'' }, tag = 'flight_time, six scenes (21 Oct)';
      ok(`${tag}: in Bertie's order: Show, the prediction (the last moment of Show), Reveal three times (the whole hours, the part left over, the ruler), Use`, B.length === 6 && B.map(x => x.step).join() === '0,0,1,1,1,2', B.map(x => x.step));
      ok(`${tag}: 1 Show · why it matters: a Saab 340 at 450 km/h and his Twin Otter at 300 km/h leave London for Amsterdam, 450 km; the Saab lands after 1 hour and turns round while the Twin Otter is still flying; "A faster plane fits more flights into a day, but it can cost more in fuel"`,
        /A faster plane fits more flights into a day, but it can cost more in fuel/.test(at(0).words) && at(0).calls.some(c => /Landed: 1 h 00/.test(c)) && at(0).calls.some(c => /Still flying/.test(c)) && /Saab 340 · 450 km\/h/.test(at(0).svg) && /Your Twin Otter · 300 km\/h/.test(at(0).svg) && /London · Amsterdam · 450 km/.test(at(0).svg), { words:at(0).words, calls:at(0).calls });
      ok(`${tag}: 2 Predict: "How long will the Twin Otter take?" 1 hour · 1 h 30 · 2 hours · Not sure; it is two-thirds of the way there when the Saab lands`, at(1).chips.join('|') === '1 hour|1 h 30|2 hours|Not sure' && /How long will the Twin Otter take\?/.test(at(1).words) && /two-thirds of the way there/.test(at(1).words) && /Two-thirds of the way after 1 hour/.test(at(1).svg), { words:at(1).words, chips:at(1).chips });
      ok(`${tag}: 3 Reveal · the whole hours, set out on screen: 450 km ÷ 300 km/h; 300 goes into 450 once: 1 whole hour; 150 km left over; "You predicted: 1 h 30" beside it`, at(2).work.join(' | ') === '450 km ÷ 300 km/h | 300 goes into 450 once: 1 whole hour | 450 − 300 = 150 km left over' && /You predicted: 1 h 30/.test(at(2).words), { work:at(2).work, words:at(2).words });
      ok(`${tag}: 4 Reveal · the part left over: 150 km is half of 300 km: 30 minutes; 1 hour + 30 minutes = 1 h 30 min`, at(3).work.slice(3).join(' | ') === '150 km is half of 300 km: 30 minutes | 1 hour + 30 minutes = 1 h 30 min' && /Hours first, then the minutes/.test(at(3).words), at(3).work);
      ok(`${tag}: 5 Reveal · only now the ruler, as the check: one hour to the 300 km mark, then the last 150 km in quarter hours; it lands at 1 h 30, the same as the sum`, at(2).rul === 0 && at(3).rul === 0 && at(4).rul === 1 && /¼ h · ¼ h/.test(at(4).svg) && at(4).calls.some(c => /Landed: 1 h 30/.test(c)) && /the same as the sum\. The sum and the ruler agree/.test(at(4).words), { rul:B.map(x => x.rul), calls:at(4).calls, words:at(4).words });
      ok(`${tag}: 6 Use · his routes: the Flight times sheet, hours and minutes, then To the flight times`, /Flight times · your new routes/i.test(at(5).use) && /\? h \? min/.test(at(5).use) && /To the flight times/.test(at(5).go), { use:at(5).use, go:at(5).go });
      ok(`${tag}: the caption "one hour at a time, less than an hour to go" is gone, the triangle is out, and never a decimal`, !B.some(x => /one hour at a time|less than an hour to go|Cover the T|\b1\.5\b/i.test(x.words + ' ' + x.work.join(' ') + ' ' + x.use + ' ' + x.svg)));
      ok(`${tag}: played to the end`, /End of the briefing/.test(await p.textContent('.bk-stage')));
    }catch(e){ ok('flight_time, six scenes (21 Oct): played to the end', false, e.message.split('\n')[0]); await p.screenshot({ path:`${OUT}flight_time-stuck.png` }).catch(() => {}); }
    ok('flight_time, six scenes (21 Oct): no errors', !errs.length, errs); await p.close();
    // a later chapter (the game sends no kitFlat): the scenes from before 21 Oct, in today's frame (CLAUDE.md: new design in year one only)
    const q = await b.newPage({ viewport:{ width:VW, height:VH } }), qe = []; q.on('pageerror', e => qe.push(e.message));
    try{
      await q.addInitScript(() => { window.BRIEF = { id:'flight_time', route:{ id:'ams', city:'Amsterdam', km:450 }, plane:{ name:'DHC-6 Twin Otter', speed:300 } }; });
      await q.goto('file://' + path.join(DIR, 'briefing-time.html')); await W(q, '.bk-title', 8000); const caps = [];
      for(let g = 0; g < 6; g++){ if(await q.$('.bk-pz[style*="grid"]')) break; try{ await q.waitForSelector('.bk-go:not([hidden])', { timeout:30000 }); }catch(e){ break; } caps.push(await q.textContent('.bk-cap')); await q.click('.bk-go'); await q.waitForTimeout(200); }
      ok('flight_time in a later chapter: the scenes from before 21 Oct (the ruler an hour at a time, then the triangle), no stepper', !(await q.$('.bk-steps')) && (await q.$$('.bk-marks i')).length === 4 && caps.some(c => /Time = distance ÷ speed/.test(c)) && /End of the briefing/.test(await q.textContent('.bk-stage')), caps);
    }catch(e){ ok('flight_time in a later chapter: the scenes from before 21 Oct', false, e.message.split('\n')[0]); }
    ok('flight_time in a later chapter: no errors', !qe.length, qe); await q.close(); }

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
  // year one (D105, 7.6): the Fuel desk opens on Launch Day after the sheet; its first visit opens Cash, tank, profit (version A, the workbook's example), then the tour and the order
  if(want('fuel_launch')){ try{ for(let g = 0; g < 8 && !(await open()); g++){ await p.evaluate(() => window.__tk.run('decision')); await p.waitForTimeout(600); }
      const t = await title(), st = await E('step().t'), day = await E('S.day || 1'), fr = p.frames().find(f => f !== p.mainFrame()), B = fr ? await fr.evaluate(() => window.BRIEF) : {};
      ok('Cash, tank, profit: opens on Launch Day, on the first visit to the Fuel desk (after the sheet, before the order), with the workbook\'s example (version A: £8,600; 3,000 L at £1.30)', /Cash, tank, profit/.test(t) && st === 'fuelDesk' && day === 1 && B.next === 'order' && B.cash === 8600 && B.buyL === 3000 && Math.abs(B.price - 1.3) < 1e-9 && B.kitFlat === true, { t, st, day, B:{ cash:B.cash, buyL:B.buyL, price:B.price, perDay:B.perDay, days:B.days, next:B.next, kitFlat:B.kitFlat } });
      await p.waitForTimeout(3000); await p.screenshot({ path:`${OUT}game-fuel-launch.png` }); await p.evaluate(() => window.__bf.skip()); await p.waitForTimeout(400);
      ok('Cash, tank, profit: skipped, the desk is underneath with its tour, and the scene does not open again', !(await open()) && await E('step().t') === 'fuelDesk' && !!(await p.$('.fd2-tour')) && !!(await E('(S.brief.seen.fuel_cash_tank_profit) || 0')));
      for(let k = 0; k < 3 && await p.$('#fd2Next'); k++){ await p.click('#fd2Next'); await p.waitForTimeout(80); } }
    catch(e){ ok('Cash, tank, profit on Launch Day', false, e.message.split('\n')[0]); } }
  // Thursday: Red Kite; Sunday: the week-1 review
  await at('rival_split', async () => { for(let g = 0; g < 6 && !(await open()); g++){ await p.evaluate(() => window.__tk.run('decision')); await p.waitForTimeout(600); } }, D => D.rival === 50 && D.fare > D.rival && D.stay < D.want && D.stayAd > D.stay);
  if(want('full_route')){ const L = await p.evaluate(() => window.__bf.list().map(x => x.id));
    ok('full_route: retired (20 Oct 2026): not in the game (nor Snacks on board), so the week-1 review opens no briefing; eleven briefings play', !L.includes('full_route') && !L.includes('cabin_sales') && L.length === 11, L); }
  // week 2: the Fuel desk; the shop's first comparison
  if(want('fuel_cash_tank_profit')){ await load(8); const D = await data('fuel_cash_tank_profit');   // its moment is Launch Day now (above); in year one its figures are the workbook's, whatever the day
    ok('fuel_cash_tank_profit: in year one the scene\'s figures are the workbook\'s example (BriefingData), on any day', D && D.cash === 8600 && D.buyL === 3000 && D.next === 'order' && D.perDay > 0 && D.tickets > 0, D); }
  // Briefing 13 (D103): straight after the fuel scene on the week-2 Fuel desk, with the pupil's own week, planes and the shop's cheapest plane
  await at('cash_to_fly', async () => { if(!(await open())){ await load(8); await E('((S.brief = S.brief || { seen:{} }).seen.fuel_cash_tank_profit = 8, 1)'); await p.click('[data-nav="fuel"]'); await p.waitForTimeout(1500); } },
    D => D.cash > 0 && D.days.length === 7 && D.days.every(x => x.litres >= 0 && x.tickets >= 0) && D.price > 0 && D.blockLitres > 0 && D.planes.length >= 1 && D.reserve === 0);
  if(want('cash_to_fly')){ const R = JSON.parse(await E('JSON.stringify({ r:S.brief.cashToFly || null, res:S.myRes || null })'));
    ok('cash_to_fly: skipped, the pupil\'s reserve stays unset (£0) and the moment is recorded', R.r && R.r.at === 'fuel' && R.r.skipped && myResV(R.res) === 0, R); }
  // the shop in week 2: Briefing 13 first (if the Fuel desk has not played it), then the efficiency scene before the comparison
  await at('aircraft_efficiency', async () => { await load(8); await shopOpen(); if((await title()).includes('Can you afford')){ await p.evaluate(() => window.__bf.skip()); await p.waitForTimeout(1500); } }, D => D.a.seats < D.b.seats && D.a.litres / D.a.seats > D.b.litres / D.b.seats);
  // week 3: the first Flight times page; week 4: the All Blacks announcement
  await at('flight_time', async () => { await load(15); await p.evaluate(() => window.__tk.enter()); await p.evaluate(() => window.__tk.run('plan')); await p.waitForTimeout(1200); }, D => D.route.km > 0 && D.plane.speed > 0   // and in year one (21 Oct) the teaching example and his new routes for the Use scene
    && D.ex && D.ex.city === 'Amsterdam' && D.ex.km === 450 && D.ex.slow.speed === 300 && D.ex.fast.speed === 450 && /^kit:dhc6\|/.test(D.ex.slow.art) && D.use && D.use.rows.some(r => r.his) && D.use.rows.every(r => r.km > 0));
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
      const fr = p.frames().find(f => f !== p.mainFrame()), labels = [];   // no taps since 19 Oct, evening: three beats, each ended with Next
      for(let i = 0; i < 3; i++){ for(let g = 0; g < 400 && !(await fr.evaluate(() => K.waiting())); g++) await p.waitForTimeout(150); labels.push((await F.locator('.bk-go').textContent()).trim()); await F.locator('.bk-go').click(); await p.waitForTimeout(200); }
      await p.waitForTimeout(500); ok('played to the end: Next, Go on, To the comparison; the frame closes on the shop it prepared, and it is marked seen', /^Next/.test(labels[0]) && /^Go on/.test(labels[1]) && /^To the comparison/.test(labels[2]) && !(await open()) && await E('step().t') === 'shop2' && !!(await E('(S.brief.seen.aircraft_efficiency) || 0')), labels); }
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
