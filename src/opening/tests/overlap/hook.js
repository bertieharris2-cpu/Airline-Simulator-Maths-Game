// node -r hook.js <any test>.test.js: every browser context the test opens gets the overlap scanner (scan.js); after each click,
// key press, load or reload it scans the screen and writes each new problem to OVL_OUT/issues.jsonl (default /tmp/ovl) with a screenshot.
// Example: NODE_PATH=<playwright node_modules> OVL_OUT=/tmp/ovl W=1366 H=768 SHOTS=0 node -r ./overlap/hook.js week.test.js
const pw = require('playwright'), fs = require('fs'), path = require('path');
const OUT = process.env.OVL_OUT || '/tmp/ovl', SCAN = fs.readFileSync(path.join(__dirname, 'scan.js'), 'utf8'); fs.mkdirSync(OUT, { recursive:true });
const keys = new Set(); let shots = 0; const LOG = path.join(OUT, 'issues.jsonl');
const AUTO = `(${function(){ let t = null; const tagOf = () => { try{ const S = window.__sim.S(), st = window.__sim.step(); const wall = document.body.classList.contains('wallview') ? ':wall' : ''; const pop = document.querySelector('.popover, .svc-pop, .sp-pop, [class*=pop]:not(script)'); return 'd' + S.day + ':' + (st && st.t) + (st && st.key ? '/' + st.key : '') + wall + (document.getElementById('teacher') && !document.getElementById('teacher').hidden ? ':teacher' : ''); }catch(e){ return location.search || '?'; } };
  const run = () => { t = null; if(!window.__ovlScan || !window.__ovlReport) return; let iss; try{ iss = window.__ovlScan(tagOf()); }catch(e){ return; } if(iss.length) window.__ovlReport(JSON.stringify(iss)); };
  const go = () => new MutationObserver(() => { clearTimeout(t); t = setTimeout(run, 350); }).observe(document.body, { childList:true, subtree:true, attributes:true, characterData:true });
  if(document.body) go(); else addEventListener('DOMContentLoaded', go); }})();`;
const keyOf = x => [x.type, (x.a || x.el || '').replace(/:nth.*$/, ''), x.b || x.by || '', (x.at || x.t || '').replace(/[\d£,.]+/g, '#').slice(0, 24), (x.bt || '').replace(/[\d£,.]+/g, '#').slice(0, 24)].join('|');
const origLaunch = pw.chromium.launch.bind(pw.chromium);
pw.chromium.launch = async (...a) => { const b = await origLaunch(...a); const nc = b.newContext.bind(b);
  b.newContext = async (...o) => { const ctx = await nc(...o); const vp = (o[0] && o[0].viewport) || {};
    await ctx.exposeBinding('__ovlReport', async (src, json) => { const iss = JSON.parse(json); let fresh = 0;
      for(const x of iss){ const k = keyOf(x); if(keys.has(k)) continue; keys.add(k); fresh++; x.vp = vp.width + 'x' + vp.height; x.n = keys.size;
        if(shots < +(process.env.OVL_SHOTS || 80)){ shots++; x.shot = 'ovl-' + x.n + '.png'; try{ await src.page.screenshot({ path:path.join(OUT, x.shot) }); }catch(e){} }
        fs.appendFileSync(LOG, JSON.stringify(x) + '\n'); } });
    await ctx.addInitScript(SCAN); await ctx.addInitScript(AUTO);
    // also scan straight after every page click / key press the test makes, before it moves on
    const np = ctx.newPage.bind(ctx); ctx.newPage = async (...q) => { const pg = await np(...q); const scanNow = async () => { try{ await pg.waitForTimeout(+(process.env.OVL_WAIT || 140)); await pg.evaluate(() => { const st = window.__sim && window.__sim.step && window.__sim.step(); let tag = '?'; try{ const S = window.__sim.S(); tag = 'd' + S.day + ':' + (st && st.t) + (st && st.key ? '/' + st.key : '') + (document.body.classList.contains('wallview') ? ':wall' : ''); }catch(e){} const iss = window.__ovlScan ? window.__ovlScan(tag) : []; window.__ovlScans = (window.__ovlScans || 0) + 1; if(iss.length) return window.__ovlReport(JSON.stringify(iss)); }); }catch(e){} };
      for(const m of ['click', 'press', 'goto', 'reload']){ const f = pg[m].bind(pg); pg[m] = async (...a) => { const r = await f(...a); if(!/roll|skipReveal/.test(String(a[0]))) await scanNow(); return r; }; }
      const ev = pg.evaluate.bind(pg); pg.__scanNow = scanNow; return pg; };
    return ctx; };
  return b; };
