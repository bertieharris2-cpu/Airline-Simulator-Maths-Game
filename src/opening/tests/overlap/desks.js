// Loads saves and visits every desk, the teacher panel and the wall at a viewport; scans each and screenshots the ones with issues.
// load a save code (.txt) or a state dump (.json) into the game at a viewport
const { chromium } = require('playwright'); const fs = require('fs');
const FILE = 'file://' + require('path').resolve(__dirname, '../../../..', process.env.GAME || 'airline-opening-prototype.html');
const openGame = async (state, W = 1897, H = 991, extra = {}) => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport:{ width:W, height:H } }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  if(extra.scan){ await ctx.addInitScript(fs.readFileSync(__dirname + '/scan.js', 'utf8')); }
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { const st = window.__sim.settings(); st.flightSecs = 0.25; st.autoWall = false; st.opsSound = false; });
  if(state){ const json = /\.txt$/.test(state) ? null : fs.readFileSync(state, 'utf8'); const code = json ? 'ASIM5.' + Buffer.from(json).toString('base64') : fs.readFileSync(state, 'utf8').trim();
    await p.evaluate(c => { const s = window.__sim.loadCode(c); window.__sim.setS(s); window.__sim.landSave(); }, code); await p.evaluate(() => window.__sim.render()); await p.waitForTimeout(300); }
  const E = x => p.evaluate(x => window.__sim.evalIn(x), x);
  const scan = async tag => { const r = await p.evaluate(t => window.__ovlScan ? window.__ovlScan(t) : null, tag); return r; };
  return { b, p, E, errs, scan };
};

// Run: NODE_PATH=<playwright node_modules> node desks.js W H OUTDIR save1 [save2 ...]   (env: GAME)
const [W, H, OUT, ...saves] = process.argv.slice(2); fs.mkdirSync(OUT, { recursive:true });
const keyOf = x => [x.type, x.a || x.el, x.b || x.by || '', (x.at || x.t || '').replace(/[\d£,.]+/g, '#').slice(0, 24), (x.bt || '').replace(/[\d£,.]+/g, '#').slice(0, 24)].join('|');
(async () => { const all = [], seen = new Set(); let n = 0;
  for(const sv of saves){ const tag0 = sv.split('/').pop().replace(/\.(txt|json)$/, '');
    const { b, p, E, errs, scan } = await openGame(sv, +W, +H, { scan:true });
    const look = async tag => { await p.waitForTimeout(350); const iss = (await scan(tag)) || []; let fresh = 0;
      for(const x of iss){ if(x.part === 'hidden' && /text\.lbl/.test(x.el || '')) continue; const k = keyOf(x); if(seen.has(k)) continue; seen.add(k); fresh++; x.n = ++n; x.vp = W + 'x' + H; all.push(x); }
      if(fresh) await p.screenshot({ path:`${OUT}/${tag.replace(/\W+/g, '-')}.png` }); return fresh; };
    await look(tag0 + ' start');
    const navs = await p.$$eval('.lnav .nv', es => es.map((e, i) => [i, e.textContent.replace(/\s+/g, ' ').trim(), e.disabled || e.classList.contains('locked')]));
    for(const [i, name, locked] of navs){ if(locked) continue; try{ await p.click(`.lnav .nv >> nth=${i}`, { timeout:3000 }); }catch(e){ continue; } await look(`${tag0} ${name}`);
      // the desk's own tabs and toggles
      const tabs = await p.$$('.dp-tabs button, .ptab, .phead .lnk, [data-tab], [data-ftab], [data-nwtab]'); for(let t = 0; t < Math.min(tabs.length, 8); t++){ const all2 = await p.$$('.dp-tabs button, .ptab, .phead .lnk, [data-tab], [data-ftab], [data-nwtab]'); if(!all2[t]) break; try{ await all2[t].click({ timeout:1500 }); }catch(e){ continue; } await look(`${tag0} ${name} tab${t}`); }
    }
    await p.click('.lnav .nv >> nth=0').catch(() => {});
    // the teacher panel
    await E('teacherOpen()').catch(() => {}); await look(`${tag0} teacher`); await E(`(function(){ document.getElementById('teacher').hidden = true; })()`).catch(() => {});
    // the wall
    await E('setWallView(true)').catch(() => {}); await p.waitForTimeout(600); await look(`${tag0} wall`); await E('setWallView(false)').catch(() => {});
    if(errs.length) console.log('page errors', tag0, errs.slice(0, 3));
    await b.close(); }
  fs.writeFileSync(`${OUT}/issues.jsonl`, all.map(x => JSON.stringify(x)).join('\n') + '\n'); console.log(W + 'x' + H, all.length, 'issues');
})();
