// Run: NODE_PATH=<playwright node_modules> node migrate.test.js   (env: OUT for screenshots)
// Old save codes: the two real pupil codes (5–6 Oct and 7 Oct builds), a mid-day v5 save, a full-game code, and a current save (no change).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), FILE = 'file://' + path.resolve(__dirname, '../../../airline-opening-prototype.html'), OUT = (process.env.OUT || require('os').tmpdir() + '/airline-migrate') + '/'; fs.mkdirSync(OUT, { recursive:true });
const FIX = n => fs.readFileSync(path.join(__dirname, 'fixtures', n), 'utf8').trim();
const b64d = s => Buffer.from(s, 'base64').toString('utf8'), b64e = s => Buffer.from(s, 'utf8').toString('base64');
const decode = code => JSON.parse(b64d(code.split('.', 2)[1])), encode = (v, s) => `ASIM${v}.` + b64e(JSON.stringify(s));
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport:{ width:1366, height:768 } })).newPage();
  const errors = [], checks = [];
  p.on('pageerror', e => errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if(m.type() === 'error') errors.push('console: ' + m.text()); }); p.on('dialog', d => d.accept());
  const ok = (name, cond, info) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (info !== undefined ? ' ' + JSON.stringify(info) : ''));
  const T = () => p.evaluate(() => window.__sim.step().t), S = () => p.evaluate(() => window.__sim.S());
  const shot = async n => { await p.waitForTimeout(150); await p.screenshot({ path:OUT + n + '.png' }); };
  const fresh = async () => { await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.evaluate(() => { const st = window.__sim.settings(); st.flightSecs = 0.25; st.autoWall = false; st.opsSound = false; }); };
  const loadViaPanel = async code => { await p.keyboard.press('Control+Shift+T'); await p.waitForSelector('#teacher:not([hidden])'); await p.fill('#tCode', code); await p.click('#tCodeLoad'); await p.waitForTimeout(300); };
  const practice = async () => { for(let i = 0; i < 3; i++){ const a = await p.evaluate(() => window.__sim.practiceAnswer()); if(!a || !(await p.$('#pqIn'))) break; await p.fill('#pqIn', a.text); await p.click('#pqCheck'); await p.waitForTimeout(1050); } };
  const solveW = async () => { const seen = []; for(let g = 0; g < 60; g++){ if(await T() !== 'workings') break;
      if(await p.$('#wkTutNext')){ await p.click('#wkTutNext'); continue; } if(await p.$('#wkTutGo')){ seen.push('tutorial'); await p.click('#wkTutGo'); continue; }
      if(await p.$('#cellAns')){ const id = await p.evaluate(() => { const t = window.__sim.currentTable(); return t.id + ':' + t.active.col + '|' + t.active.row; }); seen.push(id);
        await p.evaluate(() => { const t = window.__sim.currentTable(), c = t.cols.find(x => x.id === t.active.col); document.getElementById('cellAns').value = String(c.values[t.active.row]); }); await p.press('#cellAns', 'Enter'); await p.waitForTimeout(80); continue; }
      if(await p.$('#wkNext')){ await p.click('#wkNext'); continue; }
      if(await p.$('[data-wpick]')){ const ws = await p.$$('[data-wpick]'); seen.push('pick' + ws.length); await (ws[1] || ws[0]).click(); await p.waitForTimeout(80); continue; }
      if(await p.$('#pqIn')){ await practice(); seen.push('practice'); continue; }
      if(await p.$('#nx')) break; await p.waitForTimeout(80); }
    return seen; };
  // play from wherever the save landed to the next day's HQ; returns the typed sums and the steps seen
  const playDay = async tag => { const seen = [], startDay = (await S()).day; let typed = [];
    for(let i = 0; i < 40; i++){ const t = await T(), s = await S(); if(s.day !== startDay && t === 'hq'){ seen.push('next-day hq'); break; } seen.push(t);
      if(t === 'hq'){ await shot(`${tag}-hq`); await p.click('#startDay'); continue; }
      if(t === 'intro'){ for(let pg = 0; pg < 2; pg++) if(await p.$('#niNext')) await p.click('#niNext'); if(await p.$('#pqIn')) await practice(); const n = (await p.$$('[data-ni]')).length; for(let k = 0; k < n && await p.$eval('#nx', e => e.disabled); k++) await p.click(`[data-ni="${k}"]`); await p.click('#nx'); continue; }
      if(t === 'shop2'){ await p.click('#skipShop'); continue; }
      if(t === 'event'){ await shot(`${tag}-event`); await p.click('[data-o="1"]'); await p.click('#nx'); await p.waitForTimeout(80); if(await T() === 'event') await p.click('#nx'); continue; }
      if(t === 'plan'){ await shot(`${tag}-plan`); await p.click('#nx'); continue; }
      if(t === 'workings'){ typed = await solveW(); await shot(`${tag}-workings`); await p.click('#nx'); continue; }
      if(t === 'fuelPlan'){ if(await p.$eval('#nx', e => e.disabled)) await p.click('[data-oq]:nth-child(2)'); await p.click('#nx'); continue; }
      if(t === 'ready'){ const en = await p.$eval('#startOps', e => !e.disabled); ok(`${tag}: ready to fly`, en); if(!en) break; await p.click('#startOps'); continue; }
      if(t === 'fly'){ for(let k = 0; k < 80 && await T() === 'fly'; k++) await p.waitForTimeout(250); continue; }
      if(t === 'results'){ await shot(`${tag}-results`); await p.click('#nx'); continue; }
      if(t === 'paint'){ await p.click('#nx'); continue; } if(t === 'reveal'){ await p.click('#skipReveal'); await p.waitForTimeout(300); await p.click('#nx'); continue; }
      checks.push(`stopped at ${t}`); break; }
    return { seen, typed }; };

  // 1. vinnies air line: the 7 Oct build, Saturday day 6 at HQ
  await fresh(); const v5 = FIX('vinnies-ASIM5.txt'); await loadViaPanel(v5);
  { const s = await S(), m = s.migrated || {};
    ok('v5: loads', s.airline.name === 'vinnies air line' && s.day === 6, [s.airline.name, s.day]);
    ok('v5: steps are the current day flow', JSON.stringify(s.steps.map(x => x.t)) === JSON.stringify(['hq', 'intro', 'plan', 'workings', 'fuelPlan', 'ready', 'fly', 'results']), s.steps.map(x => x.t));
    ok('v5: lands at HQ (it was at HQ)', await T() === 'hq' && m.landedStep === 'hq', m);
    ok('v5: skills, log and flags kept', s.skills && s.skills.revenue && s.handSumLog.length === 3 && s.flags.undercut_dub === 2 && s.cash === 10731, [s.handSumLog.length, s.cash]);
    ok('v5: the Red Kite advertising still counts', !!s.rivalAd && s.rivalAd.untilDay >= 6, s.rivalAd);
    ok('v5: the overlay is cleared', !s.overlay); checks.push('info v5 notes ' + JSON.stringify(m.notes));
    const r = await playDay('vinnies'); checks.push('info v5 played ' + JSON.stringify(r.seen) + ' typed ' + JSON.stringify(r.typed));
    ok('v5: day 6 asks the weekend tenths sum (and the Red Kite tenths it never had), nothing else', r.typed.filter(x => /\|/.test(x)).length <= 2 && r.typed.some(x => /weekend/.test(x)) && !r.typed.some(x => /work:/.test(x)), r.typed);
    ok('v5: the day completes into day 7', r.seen.includes('next-day hq') && (await S()).day === 7, (await S()).day);
    await p.evaluate(() => { window.__sim.S().overlay = { type:'menu' }; window.__sim.render(); }); await p.waitForTimeout(100); ok('v5: the Home screen says where it carried on', /carries on from/.test(await p.textContent('#screen'))); await shot('vinnies-home'); }

  // 2. the same code saved mid-day: on the old cost sheet with a forecast made → lands on the planning page
  { const s = decode(v5); s.si = s.steps.findIndex(x => x.t === 'costPlan'); s.rnd.tables['cost:6'] = { id:'cost:6', kind:'cost1', cols:[] }; s.rnd.costed = { key:'old', v:{} }; s.rnd.myForecast = { key:'old', profit:1 }; s.rnd.fuelOrder = { litres:500, total:700 };
    await fresh(); await loadViaPanel(encode(5, s)); const a = await S();
    ok('v5 mid-day: lands on the planning page', await T() === 'plan' && a.migrated.landedStep === 'plan', a.migrated.landedStep);
    ok('v5 mid-day: the old cost sheet and forecast are cleared, the plan is kept', !a.rnd.tables['cost:6'] && !a.rnd.costed && !a.rnd.myForecast && !a.rnd.fuelOrder && a.prices.dub === 90 && a.fleet[0].schedule.join() === 'dub,par,dub');
    const r = await playDay('vinnies-mid'); ok('v5 mid-day: the day completes', r.seen.includes('next-day hq'), r.seen); }

  // 3. wind dragon airways: the 5–6 Oct build (May calendar), week of day 15
  await fresh(); const v4 = FIX('wind-dragon-ASIM4.txt'); await loadViaPanel(v4);
  { const s = await S(), m = s.migrated || {};
    ok('v4: loads as the old prototype', m.from === 'proto-v4' && s.airline.name === 'wind dragon airways', m.from);
    ok('v4: lands on day 16 at HQ', s.day === 16 && s.round === 15 && await T() === 'hq' && s.period.type === 'day', [s.day, s.round, await T()]);
    ok('v4: airline, cash, fleet and fares kept', s.cash === 27936 && s.fleet.length === 1 && s.fleet[0].schedule.join() === 'dub,dub,par' && s.prices.dub === 90 && s.prices.par === 100 && s.onboard === 'low', [s.cash, s.fleet[0].schedule, s.prices, s.onboard]);
    ok('v4: history shifted onto the new calendar', s.history.length === 7 && s.history[0].from === 1 && s.history[6].to === 15 && s.ledger.rev[1] === 4560, [s.history[0].from, s.history[6].to, s.ledger.rev.slice(0, 3)]);
    ok('v4: a logo from the old colours (coral → orange, amber → yellow)', s.airline.logo && s.airline.logo.c1 === 'orange' && s.airline.logo.c2 === 'yellow', s.airline.logo);
    ok('v4: no sums record, so the first-time sums are asked', !s.skills); ok('v4: the old May news is gone', /carries on/.test(s.log[0].text) && !s.log.some(l => /May/.test(l.text)), s.log);
    checks.push('info v4 notes ' + JSON.stringify(m.notes));
    const r = await playDay('wind-dragon'); checks.push('info v4 played ' + JSON.stringify(r.seen) + ' typed ' + JSON.stringify(r.typed));
    ok('v4: day 16 asks the first-time sums', r.typed.filter(x => /\|/.test(x)).length >= 2, r.typed);
    ok('v4: the day completes into day 17', r.seen.includes('next-day hq') && (await S()).day === 17, (await S()).day); }

  // 4. a full-game code (synthesised from the old one): Welsh home, a Concorde to Sydney
  { const s = decode(v4); s.home = 'cwl'; delete s.market; delete s.toolSeen; delete s.deps; s.fleet.push({ uid:2, planeId:'conc', route:'syd', schedule:['syd'], layout:'standard', grounded:false }); s.prices.syd = 600;
    await fresh(); await loadViaPanel(encode(4, s)); const a = await S(), m = a.migrated || {};
    ok('full game: recognised and landed', m.from === 'full-game' && a.day === 16 && await T() === 'hq' && a.home === 'lhr', [m.from, a.day, a.home]);
    ok('full game: the Concorde and Sydney are replaced with a note', a.fleet.length === 2 && a.fleet[1].planeId === 'dhc6' && a.fleet[1].schedule.join() === 'dub' && !a.prices.syd && m.notes.some(n => /conc/.test(n)) && m.notes.some(n => /SYD|Sydney/.test(n)), [a.fleet[1], m.notes]);
    const r = await playDay('full-game'); ok('full game: the day completes', r.seen.includes('next-day hq'), r.seen); }

  // 5. a current save is untouched; loading an old code twice gives the same landing
  { const cur = await p.evaluate(() => { const c = window.__sim.saveCode(); const j = JSON.parse(atob(c.split('.')[1])); delete j.migrated; const s = window.__sim.migrate(j); return { same: JSON.stringify(s.steps) === JSON.stringify(window.__sim.S().steps), touched: !!s.migrated }; });
    ok('a current save loads unchanged', cur.same && !cur.touched, cur);
    await fresh(); await loadViaPanel(v5); const a1 = await S(); await fresh(); await loadViaPanel(v5); const a2 = await S();
    ok('loading the same old code twice lands in the same place', a1.si === a2.si && JSON.stringify(a1.steps) === JSON.stringify(a2.steps) && a1.cash === a2.cash); }

  console.log(checks.join('\n')); console.log('ERRORS', errors.length ? errors : 'none');
  await b.close();
})();
