// Screenshots of the screens a Play notes log names: each is rebuilt from the save code the game kept at that point, then
// the desk or the Studio's editor that was open is opened again where it can be.
//   NODE_PATH=/opt/node-tools/node_modules node tools/playnotes_shots.js LOG OUTDIR [mm:ss ...|marks|said|screens]
// marks (the default): every Mark; said: every transcript line; screens: every screen; or the times given.
// A screen reached by clicks after the last change of day or step (a flight selected, a sum half typed) comes back as
// the step was when it began: the code is kept when the day or the step changes.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), zlib = require('zlib');
const [LOG, OUT = 'playnotes-shots', ...WANT] = process.argv.slice(2); if(!LOG){ console.log('node tools/playnotes_shots.js LOG OUTDIR [mm:ss ...|marks|said|screens]'); process.exit(1); }
const raw = fs.readFileSync(LOG), L = JSON.parse(raw[0] === 0x1f ? zlib.gunzipSync(raw) : raw); fs.mkdirSync(OUT, { recursive:true });
const secs = s => { const [m, x] = s.split(':'); return +m * 60 + +(x || 0); }, mmss = t => `${String(Math.floor(t / 60)).padStart(2, '0')}-${String(Math.floor(t % 60)).padStart(2, '0')}`;
const mode = WANT.length ? WANT : ['marks'];
const times = mode[0] === 'marks' ? L.log.filter(e => e.kind === 'mark').map(e => e.t) : mode[0] === 'said' ? L.log.filter(e => e.kind === 'say').map(e => e.t) : mode[0] === 'screens' ? L.log.filter(e => e.kind === 'screen').map(e => e.t) : mode.map(secs);
const at = t => { let scr = null, code = null; for(const e of L.log){ if(e.t > t) break; if(e.code) code = e; if(e.kind === 'screen') scr = e; } return { scr, code }; };
const VIEW = { 'Network desk':'network', 'Fleet desk':'fleet', 'Finance desk':'finance', 'Reputation desk':'reputation', 'Reports desk':'reports', 'Operations Model':'model' };
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport:{ width:1366, height:768 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'airline-opening-prototype.html')); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { const st = window.__sim.settings(); st.briefings = false; st.autoWall = false; st.screenNames = true; });
  const index = [];
  for(const t of times){ const { scr, code } = at(t); if(!scr || !code){ console.log(mmss(t), 'no screen yet'); continue; }
    await p.evaluate(c => { const s = window.__sim.loadCode(c); window.__sim.setS(s); window.__sim.landSave(); window.__sim.render(); }, code.code); await p.waitForTimeout(400);
    const v = VIEW[scr.name] || (scr.view && scr.view !== 'plan' ? scr.view : null); if(v){ await p.click(`[data-nav="${v}"]`).catch(() => {}); await p.waitForTimeout(300); }
    if(scr.name === 'Studio' || /^Studio:/.test(scr.name)){ if(await p.$('#s2Edit')){ await p.click('#s2Edit'); await p.waitForTimeout(250); } }
    const said = L.log.filter(e => e.kind === 'say' && e.t >= scr.t && e.t < t + 30).map(e => e.text);
    const f = `${String(index.length + 1).padStart(3, "0")}-${mmss(t)}-${scr.name.replace(/[^A-Za-z0-9]+/g, '-')}.png`; await p.screenshot({ path:path.join(OUT, f) });
    const now = await p.evaluate(() => window.__pn ? window.__pn.name() : ''); index.push({ at:mmss(t).replace('-', ':'), screen:scr.name, when:scr.when, rebuilt:now, file:f, said });
    console.log(mmss(t), scr.name, '·', scr.when, now !== scr.name ? `(rebuilt as ${now})` : '', '→', f); }
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1)); await b.close();
})();
