// Run: NODE_PATH=<playwright node_modules> node liveops.test.js   (env: W, H, HOME_APT, MKT, POL, UPTO, SHOTS=0, OUT)
// Live operations on the Operations Wall, Launch Day to Week 3: the clock is held at chosen moments for screenshots,
// then skipped to the summary. Checks the wall opens by itself on one screen, the phases, the moments and that the
// model is untouched (projected = actual).
const { chromium } = require('playwright');
const path = require('path'), FILE = 'file://' + path.resolve(__dirname, '../../../airline-opening-prototype.html'), OUT = (process.env.OUT || require('os').tmpdir() + '/airline-shots') + '/'; require('fs').mkdirSync(OUT, { recursive:true });
const W = +(process.env.W || 1366), H = +(process.env.H || 768), HOME = process.env.HOME_APT || 'lhr', MK = process.env.MKT || 'par', OTHER = MK === 'par' ? 'dub' : 'par', SHOTS = process.env.SHOTS !== '0', UPTO = +(process.env.UPTO || 9), POL = process.env.POL || 'typical';
const TAG = `${HOME}-${MK}-${W}`;
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport:{ width:W, height:H } }), p = await ctx.newPage(), IWB = process.env.IWB === '1'; let d = null;
  const errors = [], overflow = [], checks = [];
  p.on('pageerror', e => errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if(m.type() === 'error') errors.push('console: ' + m.text()); }); p.on('dialog', d => d.accept());
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { const st = window.__sim.settings(); st.flightSecs = 7; st.autoWall = true; st.opsSound = false; });
  const T = () => p.evaluate(() => window.__sim.step().t), S = () => p.evaluate(() => window.__sim.S());
  const ok = (name, cond, info) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (info !== undefined ? ' ' + JSON.stringify(info) : ''));
  const shot = async n => { if(!SHOTS) return; await p.waitForTimeout(200); await p.screenshot({ path:OUT + n + '-' + TAG + '.png' }); };
  const fits = async tag => { const r = await p.evaluate(() => { const bad = []; document.querySelectorAll('.tf-main,.tf-body,#screen,.hp .pb,.ws-rail,.opts-wrap,.dk-b,.actbar,.sheet1').forEach(e => { if(e.scrollHeight > e.clientHeight + 2) bad.push((e.className || e.id).split(' ')[0] + ' ' + e.scrollHeight + '>' + e.clientHeight); if(e.scrollWidth > e.clientWidth + 2) bad.push((e.className || e.id).split(' ')[0] + ' wide ' + e.scrollWidth + '>' + e.clientWidth); }); if(document.scrollingElement.scrollWidth > innerWidth + 1) bad.push('hscroll'); if(document.scrollingElement.scrollHeight > innerHeight + 1) bad.push('vscroll'); return bad; }); if(r.length) overflow.push(tag + ': ' + r.join(', ')); };
  const PAIR = { profit:['rev', 'cost', '−'], tk1:['pax1', 'fare1', '×'], tk2:['pax2', 'fare2', '×'], snack:['buyers', 'snackP', '×'], fuel:['fuelL', 'ppl', '×'], empty:['seats', 'flown', '−'], wproj:['profitDay', 'days', '×'], profitDay:['revDay', 'costDay', '−'] };
  const typedLog = {};
  const solve = async tag => { const seen = [];
    for(let i = 0; i < 20; i++){ const c = await p.$('[data-cell]'); if(!c) break; const id = await c.getAttribute('data-cell'); seen.push(id); await c.click();
      if(await p.$('.dock [data-pk]')){ const row = id.split('|')[1], pr = PAIR[row]; seen[seen.length - 1] += ':build';
        for(const k of pr.slice(0, 2)) await p.click(`.dock [data-pk="${k}"]`); await p.click(`.dock [data-op="${pr[2]}"]`); await p.click('#trySum'); await p.waitForTimeout(100); continue; }
      await p.evaluate(() => { const t = window.__sim.currentTable(), c = t.cols.find(x => x.id === t.active.col); document.getElementById('cellAns').value = String(c.values[t.active.row]); }); await p.press('#cellAns', 'Enter'); }
    typedLog[tag] = seen; return seen; };
  const vis = sel => p.evaluate(s => !!document.querySelector(s), sel);
  const seek = (g, rate) => p.evaluate(([g, r]) => window.__live.seek(g, r), [g, rate || 0.0005]);
  const wallFits = async tag => { const r = await p.evaluate(() => { const bad = []; document.querySelectorAll('.lo-feat,.lo-sim,.lo-focus,.lo-ac,.lo-ann,.lf-b,.lo-strip').forEach(e => { if(e.scrollHeight > e.clientHeight + 2 || e.scrollWidth > e.clientWidth + 2) bad.push((e.className || e.tagName) + ' ' + e.scrollWidth + 'x' + e.scrollHeight + '>' + e.clientWidth + 'x' + e.clientHeight); }); return bad; }); if(r.length) overflow.push(tag + ': ' + r.join(' | ')); };
  const lshot = async (n, g) => { if(g !== undefined) await seek(g); await p.waitForTimeout(260); await wallFits(n); await shot(n); };
  async function liveShots(R, day, s){
    await p.waitForTimeout(120);
    const L = await p.evaluate(() => window.__live.show()); if(!L){ checks.push(`info no live show at ${R}`); return; }
    if(IWB){
      ok(`live ${day}: with an IWB window the HQ stays on the HQ`, !(await p.evaluate(() => document.body.classList.contains('wallview'))));
      await d.waitForTimeout(800); ok(`live ${day}: the IWB window plays the show`, await d.evaluate(() => !document.getElementById('wOps').hidden && document.getElementById('wall').className.includes('mode-ops')));
      await d.screenshot({ path:OUT + `iwb-${day}-wall.png` }); await shot(`iwb-${day}-hq`);
      await d.evaluate(() => document.querySelector('.lo-ctl [data-ops="x2"]').click()); await p.waitForTimeout(600);
      ok(`live ${day}: the wall's 2× button reaches the HQ clock`, await p.evaluate(() => window.__live.show().clock.rate === 2));
      await d.evaluate(() => document.querySelector('.lo-ctl [data-ops="summary"]').click());
      for(let i = 0; i < 40 && ['fly', 'sim'].includes(await T()); i++) await p.waitForTimeout(200);
      await d.waitForTimeout(1500); ok(`live ${day}: the wall shows Day complete`, await d.evaluate(() => /COMPLETE/.test((document.querySelector('#wOver .wo-head h1') || {}).textContent || ''))); await d.screenshot({ path:OUT + `iwb-${day}-complete.png` });
      return; }
    ok(`live ${day}: the wall opens by itself on one screen`, await p.evaluate(() => document.body.classList.contains('wallview')));
    const mode0 = await p.evaluate(() => window.__live.mode()); ok(`live ${day}: starts with the handoff`, mode0 === 'intro', mode0);
    const on = L.flights.filter(F => !F.off), F0 = on.find(F => F.style === 'full') || on[0], tag = `live-${s.period.type}${day}`;
    checks.push(`info live ${day} ${L.kind} days ${L.days.map(D => D.style).join(',')} flights ${on.map(F => F.code + ':' + F.style + ':' + F.sold + '/' + F.seats + (F.waiting ? '+' + F.waiting : '')).join(' ')} moments ${L.moments.map(m => m.kind + (m.focus ? '*' : '') + ':' + m.title).join(' | ')} real ${Math.round(L.total)}s`);
    if(R === 0 || (s.period.type === 'gap')) await lshot(`${tag}-0intro`);
    const shape = Lg => ({ up:Math.min(8, Lg * .14) });
    if(R === 0){
      await lshot(`${tag}-1checkin`, F0.dep - 30); await lshot(`${tag}-2boarding`, F0.dep - 16); await lshot(`${tag}-3closed`, F0.dep - 2);
      const ph = await p.evaluate(([k, g]) => window.__live.phase(k, g).st, [F0.key, F0.dep - 16]); ok('launch: boarding at dep − 16', ph === 'board', ph);
      await lshot(`${tag}-4taxi`, F0.dep + 4); await lshot(`${tag}-5takeoff`, F0.dep + shape(F0.L).up + .2); await lshot(`${tag}-6cruise`, F0.dep + F0.L * .5);
      await lshot(`${tag}-7landed`, F0.arrAway - 2); await lshot(`${tag}-8turn`, F0.arrAway + F0.A * .45); await lshot(`${tag}-9reboard`, F0.arrAway + F0.A * .85); { const tx = await p.evaluate(() => (document.querySelector('#wOps .lo-feat') || {}).textContent || ''); ok('launch: re-boarding counts against the seats', new RegExp('Boarding: \\d+ / ' + F0.seats).test(tx), tx.slice(0, 160)); }
      await lshot(`${tag}-10back`, F0.depAway + F0.L * .5); await lshot(`${tag}-11hometurn`, F0.arr + 12);
      const N = on[1]; if(N) await lshot(`${tag}-12ready`, Math.min(N.dep - 30, F0.ready + 3));
      await p.click('[data-ops="hq"]'); await p.waitForTimeout(250); await shot(`${tag}-13hq`); ok('launch: the HQ shows the live card', await vis('#loPace .btn')); await p.click('[data-ops="wall"]'); await p.waitForTimeout(250);
      const pace = await p.evaluate(() => { document.querySelector('.lo-ctl [data-ops="x2"]').click(); return window.__live.show().clock.rate; }); ok('pace: 2× from the wall', pace === 2, pace);
    }
    if(R === 1 && F0.ob) await lshot(`${tag}-cabin`, F0.dep + F0.L * .5);
    if(R >= 1 && R <= 4) await lshot(`${tag}-boarding`, F0.dep - 14);
    for(const m of L.moments){ await lshot(`${tag}-m-${m.kind}${m.focus ? '-focus' : ''}`, m.g + (m.focus ? .5 : 1)); if(m.focus) await lshot(`${tag}-m-${m.kind}-slowing`, m.g - 12); }
    if(L.kind === 'period'){ const D = L.days.find(x => x.style === 'compressed'); if(D) await lshot(`${tag}-sim`, D.k * 1440 + 13 * 60); }
    if(R === 4 && on.length > 2) await lshot(`${tag}-dublin`, (on.find(F => F.route !== on[0].route) || on[2]).dep + 30);
    // the rest goes by: skip to the summary from the wall
    await p.evaluate(() => { const b = document.querySelector('.lo-ctl [data-ops="summary"]'); if(b) b.click(); });
    for(let i = 0; i < 40 && ['fly', 'sim'].includes(await T()); i++) await p.waitForTimeout(150);
  }
  // ---- setup ----
  await p.click('#start'); await p.fill('#nm', 'Dragon Air'); await p.click('#nx');
  ok('no airline-type choice at the start', await T() !== 'strategy', await T());
  await p.click('#nx');   // livery
  await p.click(`[data-h="${HOME}"]`); await p.click('#nx'); if(await T() === 'boot') await p.click('#enterHq');
  await p.click('#nx'); await p.click(`[data-mk="${MK}"]`); await p.click('#nx'); await p.click('#nx');
  for(let k = 0; k < 4; k++) await p.click('#nx'); const rq = await p.$$eval('[data-rq]', e => e.map(x => x.getAttribute('data-rq'))); await p.click(`[data-rq="${rq[1]}"]`); await p.click('#nx');
  await p.click(`[data-svc="${MK}|2"]`); await p.click('#nx');
  let guard = 0, last = '', saves = 0, strategySeen = false; const calib = {};
  while(guard++ < 600){
    const t = await T(), s = await S(); if(s.round >= UPTO || t === 'protoEnd') break;
    const where = `${t}@${s.round}@${s.si}`; if(where === last) await p.waitForTimeout(250); last = where;
    const R = s.round, setup = s.phase === 'setup', day = setup ? 0 : R;
    if(t === 'fareTry'){ await fits('fareTry'); await shot('d0-fare'); await p.click('#nx'); continue; }
    if(t === 'intro'){ for(let pg = 0; pg < 2; pg++) await p.click('#niNext'); for(let k = 0; k < 3 && await p.$eval('#nx', e => e.disabled); k++) await p.click(`[data-ni="${k}"]`); await p.click('#nx'); continue; }
    if(t === 'hq'){ await fits('hq ' + R); await p.click('#startDay'); continue; }
    if(t === 'milestone'){ await fits('milestone ' + R); await shot('ms-' + R); await p.click('#msGo'); continue; }
    if(t === 'review'){ await solve('review ' + R); await p.click('#nx'); continue; }
    if(t === 'planner'){
      if(R <= 4 && s.period.type === 'day'){
        ok(`Day ${R}: snacks only from Day 1`, (await vis('[data-pe^="0|ob|"]')) === (R >= 1));
        ok(`Day ${R}: departure times only from Day 3`, (await vis('[data-pe^="0|dep|"]')) === (R >= 3));
        ok(`Day ${R}: the second market only from Day 4`, (await vis(`[data-pe="0|fare|${OTHER}|1"]`)) === (R >= 4));
        if(R === 1 && POL !== 'weak') await p.click('[data-pe="0|ob|sell3|0"]');
        if(R === 3){ const before = await p.evaluate(() => window.__sim.S().deps); await p.click('[data-pe="0|dep|0|-1"]'); await p.click('[data-pe="0|dep|0|-1"]'); const after = await p.evaluate(() => window.__sim.S().deps); ok('Day 3: a departure time can be moved', after && before && after[0] === before[0] - 60, [before, after]); }
        if(R === 4 && POL !== 'weak') await p.click(`[data-pe="0|add|${OTHER}|0"]`).catch(() => {});
      }
      await fits('planner ' + R); if(R <= 4) await shot(`d${day}-plan`); await p.click('#nx'); continue; }
    if(t === 'costPlan'){
      await fits('cost ' + R); if(R <= 6) await shot(`d${day}-cost`); const typed = await solve(`cost ${day}`);
      checks.push(`info ${s.period.type} ${day} typed ${JSON.stringify(typed)}`);
      if(await p.$('#calcDone')) await p.click('#calcDone'); await p.waitForTimeout(150);
      const fx = await p.$('button.mdl'); if(fx && R <= 4){ await fx.click(); ok(`Day ${day}: the ƒ inspector shows the rule`, await vis('.dock .calc.fx')); await shot(`d${day}-fx`); await p.click('#dkClose').catch(() => {}); }
      ok(`cost ${day}: continue enabled`, await p.$eval('#nx', e => !e.disabled)); await p.click('#nx'); continue; }
    if(t === 'testIdeas'){
      await fits('test ' + R); ok(`test ${day}: no typed figures`, !(await vis('[data-cell]')));
      const keys = await p.$$eval('[data-pe^="9|fare|"]:not([disabled])', e => e.map(x => x.getAttribute('data-pe'))); const up = keys.find(k => k.endsWith('|1')) || keys[0];
      if(up){ await p.click(`[data-pe="${up}"]`); await p.waitForTimeout(150); }
      const m = await p.evaluate(() => { const S = window.__sim.S(); return { test:S.rnd.test, d:(document.querySelector('.t2-diff b') || {}).textContent }; });
      if(R <= 4) await shot(`d${day}-test`);
      if(await vis('[data-isave]:not([disabled])')){ await p.click('[data-isave]'); ok(`test ${day}: an idea is saved`, await vis('.idea')); }
      const better = m.d && m.d.trim().startsWith('+');
      if(POL === 'typical' && better && await vis('[data-ftest]:not([disabled])')) await p.click('[data-ftest]'); else await p.click('[data-fmine]');
      const fc = (await S()).rnd.myForecast; checks.push(`info test ${day} flew ${fc && fc.plan} projected ${fc && fc.profit}`); continue; }
    if(t === 'fuelPlan'){ if(await p.$eval('#nx', e => e.disabled)) await p.click('[data-oq]:nth-child(2)'); await fits('fuel ' + R); if(R === 2) await shot('d2-fuel'); await p.click('#nx'); continue; }
    if(t === 'ready' && IWB && !d){
      const pop = ctx.waitForEvent('page'); await p.evaluate(() => document.getElementById('tOpenIwb').click()); d = await pop;
      d.on('pageerror', e => errors.push('wall: ' + e.message)); await d.waitForLoadState(); await p.waitForTimeout(5000);
      ok('IWB: the HQ sees the wall window', await p.evaluate(() => document.querySelector('.iwb.on') !== null)); }
    if(t === 'ready'){ await fits('ready ' + R); if(R <= 2) await shot(`d${day}-ready`); const en = await p.$eval('#startOps', e => !e.disabled); ok('ready enabled ' + day, en, await p.textContent('.opplan')); if(!en) break; await p.click('#startOps'); continue; }
    if(t === 'fly' || t === 'sim'){ await liveShots(R, day, s); for(let i = 0; i < 80 && ['fly', 'sim'].includes(await T()); i++) await p.waitForTimeout(250); continue; }
    if(t === 'results' && await p.evaluate(() => document.body.classList.contains('wallview'))){ await p.waitForTimeout(500); await shot(`r${day}-wall-complete`); ok(`results ${R}: the wall shows the summary`, await vis('#wOver:not([hidden]) .wo-head h1'));
      if(s.period.type === 'day' || s.phase === 'setup'){ const m = await p.evaluate(() => { const S = window.__sim.S(), h = S.history[S.history.length - 1], hq = Object.values(h.routes || {}).reduce((t, x) => t + Math.max(0, (x.want || x.pax) - x.pax), 0), b = document.querySelector('#wOver .wo-facts b'); return [hq, b ? +b.textContent.replace(/,/g, '') : null]; });
        ok(`results ${R}: the wall's "without a seat" matches HQ`, m[0] === m[1], m); } await p.click('#wOver [data-ops="hq"]'); await p.waitForTimeout(200); ok(`results ${R}: Review at HQ returns to the HQ`, !(await p.evaluate(() => document.body.classList.contains('wallview')))); }
    if(t === 'results'){ const r = await S(), fc = r.rnd.myForecast;
      if(!r.rnd.sim && fc) ok(`day ${day}: projected = actual`, Math.abs(fc.profit - r.rnd.profit) < 1, [fc.profit, r.rnd.profit]);
      if(r.rnd.sim && r.rnd.vs) checks.push(`info period ${R} projected ${r.rnd.vs.expProfit} actual ${r.rnd.vs.gotProfit}`);
      if(day === 0 || day === 1) ok(`day ${day}: fuel is free`, (r.rnd.flights || []).every(f => !f.fuelCost), (r.rnd.flights || []).map(f => f.fuelCost));
      ok(`results ${R}: reputation unchanged and hidden`, r.rep === 3 && !(r.rnd.why || []).some(w => w.ic === '⭐') && await p.evaluate(() => getComputedStyle(document.querySelector('.s-rep')).display === 'none'), r.rep);
      checks.push(`info results ${R} profit ${Math.round(r.rnd.profit)} cash ${Math.round(r.cash)} tank ${r.fuel}`); await fits('results ' + R); if(R <= 4) await shot(`d${day}-results`); await p.click('#nx'); continue; }
    if(t === 'rop'){ await fits('rop'); await shot('rop'); await p.click('#ropGo'); continue; }
    if(t === 'plans'){ await fits('plans ' + R);
      if(POL === 'typical'){ const ids = await p.$$eval('[data-oc^="9|fare|"][data-oc$="|1"]', e => e.filter(x => !x.disabled).map(x => x.getAttribute('data-oc'))); if(ids[0]){ await p.click(`[data-oc="${ids[0]}"]`); await p.waitForTimeout(150); } }
      await solve('plans ' + R); if(await p.$('#calcDone')) await p.click('#calcDone');
      const tb = await p.evaluate(() => { const t = window.__sim.currentTable(); if(!t) return null; const c = t.cols.find(x => x.id === 'test'); return c ? { d:c.values.diff } : null; });
      if(tb && tb.d > 0 && await p.$('[data-switch]:not([disabled])')) await p.click('[data-switch]'); else await p.click('[data-keep]'); continue; }
    if(t === 'yearPlan' || t === 'afford'){ calib.sep = calib.sep || Math.round(s.cash); await fits(t); await solve(t); if(await p.$('#calcDone')) await p.click('#calcDone'); await shot(t); await p.click('#nx'); continue; }
    if(t === 'yearReview'){ const v = s.rnd.yearVs; if(v) Object.assign(calib, { est:v.est, when:v.when, proj:v.expCash, end:v.gotCash }); await fits(t); await solve(t); if(await p.$('#calcDone')) await p.click('#calcDone'); await shot(t); await p.click('#nx'); continue; }
    if(t === 'strategy'){ strategySeen = true; await fits(t); await shot(t); await p.click('[data-st="value"]'); await p.click('#nx'); continue; }
    if(t === 'shop'){ await fits(t); await p.click('#nx'); continue; }
    if(t === 'invest'){ await fits(t); await solve(t); if(await p.$('#calcDone')) await p.click('#calcDone'); await p.waitForTimeout(200);
      const buy = await p.$$eval('[data-buy]', e => e.filter(x => !x.disabled).map(x => x.getAttribute('data-buy')));
      if(buy.length){ calib.bought = buy[buy.length - 1]; calib.saves = saves; await p.click(`[data-buy="${calib.bought}"]`); }
      else { saves++; if(saves > 3){ ok('affordable after saving', false); break; } const u = await p.$('[data-saveto]'); if(u) await u.click(); else await p.click('[data-save]'); } continue; }
    if(t === 'purchase'){ const before = s.cash; await p.click('#nx'); const a = await S(); ok('purchase deducts the price', a.onOrder && Math.abs(before - a.cash - a.onOrder.price) < 0.01); continue; }
    if(t === 'delivery'){ await p.click('#nx'); continue; }
    checks.push('stopped at ' + t + ' round ' + R); await shot('stop'); break;
  }
  if(UPTO > 19){ ok('the airline type is chosen at the Year 1 review', strategySeen); console.log(`CALIB ${POL} ${HOME} ${MK} ${JSON.stringify(calib)}`); }
  // the archive
  await p.click('[data-nav="finance"]', { force:true }).catch(() => {}); await p.click('[data-tab="fin2|plans"]').catch(() => {}); await p.waitForTimeout(200);
  const arch = await p.evaluate(() => [...document.querySelectorAll('.arch tbody tr')].length); if((await S()).round >= 2) ok('Finance → Plans lists the days', arch >= 3, arch); await shot('archive');
  checks.push('end at ' + await T() + ' round ' + (await S()).round);
  console.log(checks.join('\n')); console.log('OVERFLOW', overflow.length ? overflow : 'none'); console.log('ERRORS', errors.length ? errors : 'none');
  await b.close();
})();
