// Run: NODE_PATH=<playwright node_modules> node playnotes.test.js   (env: OUT, GAME)
// Play notes (Bertie, 18 Oct 2026): the screen name in the corner, and a recording with its log. Chromium's fake microphone
// stands in for a real one. The toolkit plays a week; Stop & save must give the recording and a gzipped log whose timeline
// names the screens in order, with a save code wherever the day or the step changed.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os'), zlib = require('zlib');
const FILE = 'file://' + path.resolve(__dirname, '../../..', process.env.GAME || 'airline-opening-prototype.html'), OUT = (process.env.OUT || os.tmpdir() + '/airline-playnotes') + '/'; fs.mkdirSync(OUT, { recursive:true });
(async () => {
  const b = await chromium.launch({ args:['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const ctx = await b.newContext({ viewport:{ width:1366, height:768 }, acceptDownloads:true, permissions:['microphone'] }), p = await ctx.newPage();
  const errors = [], checks = [], files = {};
  p.on('pageerror', e => errors.push(e.message)); p.on('dialog', d => d.accept());
  p.on('download', async d => { const f = OUT + d.suggestedFilename(); await d.saveAs(f); files[d.suggestedFilename()] = f; });
  const ok = (name, cond, x) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (x !== undefined ? ' ' + JSON.stringify(x) : ''));
  const tag = () => p.$eval('#pnTag', e => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => '');
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { const st = window.__sim.settings(); st.briefings = false; st.autoWall = false; });
  await p.evaluate(c => { const s = window.__sim.loadCode(c); window.__sim.setS(s); window.__sim.landSave(); window.__sim.render(); }, fs.readFileSync(path.join(__dirname, 'fixtures/jumps/day-8.txt'), 'utf8').trim());
  ok('no tag until it is asked for', !(await p.$('#pnTag')));
  await p.keyboard.press('Control+Shift+T'); await p.waitForSelector('#tPlayNotes'); ok('the teacher panel has a Play notes section', /Record voice and screens/.test(await p.textContent('#tPlayNotes')));
  await p.check('#tScreenNames'); await p.evaluate(() => window.__sim.evalIn('(teacherClose(), 1)')); await p.waitForTimeout(200);
  ok('Home is named in the corner, with the week and date', /^Home\s*Week 2 · Mon 9 Sep/.test(await tag()), await tag());
  await p.click('[data-nav="fuel"]'); await p.waitForTimeout(200); ok('a desk opened over Home has its own name', /^Fuel desk/.test(await tag()), await tag());
  await p.click('[data-nav="overview"]'); await p.waitForTimeout(150);
  await p.click('#pnRec'); await p.waitForTimeout(800); ok('Record starts the microphone (REC and a clock in the corner)', /REC 00:0\d/.test(await tag()), await tag()); await p.screenshot({ path:OUT + 'recording.png' });
  await p.evaluate(() => window.__tk.enter()); await p.waitForTimeout(200);
  await p.evaluate(() => window.__tk.run('plan')); await p.click('#pnMark'); await p.evaluate(() => window.__tk.run('plan'));
  const names = await p.evaluate(() => window.__pn.log().filter(e => e.kind === 'screen').map(e => e.name)); ok('the log names the screens as they came', ['Home', 'Plan opener', 'Flying', 'Results', 'The board', 'Sunday review'].every(n => names.some(x => x.startsWith(n))), [...new Set(names)]);
  await p.click('#pnStop'); await p.waitForTimeout(2500);
  const fn = Object.keys(files); ok('Stop & save gives two files: the recording and the gzipped log', fn.some(f => /^playnotes-.*\.(webm|ogg|m4a)$/.test(f)) && fn.some(f => /^playnotes-.*\.json\.gz$/.test(f)), fn);
  const lg = fn.find(f => /\.json\.gz$/.test(f)), L = lg ? JSON.parse(zlib.gunzipSync(fs.readFileSync(files[lg]))) : { log:[], timeline:[] };
  const audio = fn.find(f => /\.(webm|ogg|m4a)$/.test(f)); ok('the recording has sound in it', audio && fs.statSync(files[audio]).size > 2000, audio && fs.statSync(files[audio]).size);
  ok('the log has the timeline in words, the mark, and save codes where the day or the step changed', L.timeline.some(l => /^\d\d:\d\d  Home · Week 2/.test(l)) && L.log.some(e => e.kind === 'mark') && L.log.filter(e => e.code).length >= 4 && L.log.filter(e => e.code).every(e => /^ASIM5\./.test(e.code)), { lines:L.timeline.slice(0, 6), codes:L.log.filter(e => e.code).length });
  ok('every entry carries its clock time, to match a phone recording', L.log.every(e => /^\d{4}-\d\d-\d\dT/.test(e.at)) && L.log.every((e, i) => !i || e.t >= L.log[i - 1].t));
  fs.writeFileSync(OUT + 'log.json', JSON.stringify(L));
  checks.push('info ' + JSON.stringify({ files:fn, screens:L.log.filter(e => e.kind === 'screen').length, timeline:L.timeline.slice(0, 14) }));
  console.log(checks.join('\n')); console.log('ERRORS', errors.length ? errors : 'none');
  await b.close(); process.exit(checks.some(c => c.startsWith('FAIL')) || errors.length ? 1 : 0);
})();
