// Run: NODE_PATH=<playwright node_modules> node playnotes.test.js   (env: OUT, GAME)
// Play notes (Bertie, 18 Oct 2026): the screen name in the corner, and a recording with its log. Chromium's fake microphone
// stands in for a real one. The toolkit plays a week; Stop & save must give ONE zip (30 Oct 2026) holding the recording and a
// plain .json log whose timeline names the screens in order, with a save code wherever the day or the step changed. Then the
// microphone watch (a stopped microphone is noticed and restarted as part 2) and the copy kept in the browser after a reload.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os'), zlib = require('zlib');
const FILE = 'file://' + path.resolve(__dirname, '../../..', process.env.GAME || 'airline-opening-prototype.html'), OUT = (process.env.OUT || os.tmpdir() + '/airline-playnotes') + '/'; fs.mkdirSync(OUT, { recursive:true });
(async () => {
  const b = await chromium.launch({ args:['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const ctx = await b.newContext({ viewport:{ width:1366, height:768 }, acceptDownloads:true, permissions:['microphone'] }), p = await ctx.newPage();
  const errors = [], checks = [], files = {}; let downloads = 0;
  p.on('pageerror', e => errors.push(e.message)); p.on('dialog', d => d.accept());
  p.on('download', async d => { downloads++; const f = OUT + d.suggestedFilename(); await d.saveAs(f); files[d.suggestedFilename()] = f; });
  const unzip = f => { const b = fs.readFileSync(f), out = {}; let o = 0; while(b.readUInt32LE(o) === 0x04034b50){ const n = b.readUInt32LE(o + 18), l = b.readUInt16LE(o + 26), x = b.readUInt16LE(o + 28), name = b.slice(o + 30, o + 30 + l).toString('utf8'); out[name] = b.slice(o + 30 + l + x, o + 30 + l + x + n); o += 30 + l + x + n; } return out; };
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
  const fn = Object.keys(files); ok('Stop & save gives ONE file, a zip, so Chrome never asks to download several', downloads === 1 && fn.length === 1 && /^playnotes-.*\.zip$/.test(fn[0]), fn);
  const Z = fn[0] ? unzip(files[fn[0]]) : {}, zn = Object.keys(Z); ok('the zip holds the recording and the log as plain .json', zn.some(f => /^playnotes-.*\.(webm|ogg|m4a)$/.test(f)) && zn.some(f => /^playnotes-[^.]*\.json$/.test(f)), zn);
  const lg = zn.find(f => /\.json$/.test(f)), L = lg ? JSON.parse(Z[lg].toString('utf8')) : { log:[], timeline:[] };
  const zipped = L.log.filter(e => e.codez).length; L.log.forEach(e => { if(e.codez){ e.code = zlib.gunzipSync(Buffer.from(e.codez, 'base64')).toString('utf8'); delete e.codez; } });
  ok('the save codes inside are gzipped, and unpack to codes the game loads', zipped >= 4 && L.log.filter(e => e.code).every(e => /^ASIM5\./.test(e.code)), zipped);
  const audio = zn.find(f => /\.(webm|ogg|m4a)$/.test(f)); ok('the recording has sound in it', audio && Z[audio].length > 2000, audio && Z[audio].length);
  ok('the log has the timeline in words, the mark, and save codes where the day or the step changed', L.timeline.some(l => /^\d\d:\d\d  Home · Week 2/.test(l)) && L.log.some(e => e.kind === 'mark') && L.log.filter(e => e.code).length >= 4 && L.log.filter(e => e.code).every(e => /^ASIM5\./.test(e.code)), { lines:L.timeline.slice(0, 6), codes:L.log.filter(e => e.code).length });
  ok('every entry carries its clock time, to match a phone recording', L.log.every(e => /^\d{4}-\d\d-\d\dT/.test(e.at)) && L.log.every((e, i) => !i || e.t >= L.log[i - 1].t));
  const n0 = downloads; ok('afterwards the corner offers Save again', /Saved playnotes-.*Save again/.test(await tag()), await tag());
  await p.click('#pnAgain'); await p.waitForTimeout(2000); ok('Save again downloads the zip once more', downloads - n0 === 1, downloads - n0);
  await p.click('#pnDone'); await p.waitForTimeout(200); ok('✓ puts the corner back to Record', /Record/.test(await tag()) && !/Save again/.test(await tag()), await tag());
  fs.writeFileSync(OUT + 'log.json', JSON.stringify(L));
  // the microphone watch: a microphone that stops is noticed within seconds and restarted as a new part
  await p.click('#pnRec'); await p.waitForTimeout(2500); const s0 = await p.evaluate(() => window.__pn.secs());
  await p.evaluate(() => window.__pn.kill()); await p.waitForTimeout(6500);
  ok('a stopped microphone shows MIC STOPPED in the corner', /MIC STOPPED/.test(await tag()) || await p.evaluate(() => window.__pn.parts()) > 1, await tag());
  await p.waitForTimeout(6000); const pr = await p.evaluate(() => ({ parts:window.__pn.parts(), lost:window.__pn.lost(), secs:window.__pn.secs() }));
  ok('…and it starts again on a fresh microphone, as part 2, and the clock counts on', pr.parts === 2 && !pr.lost && pr.secs > s0 + 2, pr);
  // the copy kept in the browser: Chrome closes mid-recording; after a reload the teacher panel offers it as a zip
  await p.waitForTimeout(10500);   // the log is kept every 10 seconds
  p.removeAllListeners('dialog'); p.on('dialog', d => d.accept()); await p.reload(); await p.waitForTimeout(1500);
  const kept = await p.evaluate(() => window.__pn.last()); ok('after Chrome closes mid-recording the recording is still kept, marked not saved', kept && !kept.done && kept.secs > 5 && kept.parts.length === 2, kept && { secs:kept.secs, done:kept.done, parts:kept.parts.length });
  await p.evaluate(() => window.__sim.evalIn('(teacherOpen(), 1)')); await p.waitForSelector('#tPnGet'); ok('the Play notes section offers it', /Not saved/.test(await p.textContent('#tPnLast')), await p.textContent('#tPnLast'));
  const n1 = downloads; await p.click('#tPnGet'); await p.waitForTimeout(2500);
  const rf = Object.keys(files).sort().pop(), R = downloads - n1 === 1 ? unzip(files[rf]) : {}, rn = Object.keys(R);
  ok('Download it gives one zip: both parts of the recording and the log', rn.filter(f => /-part[12]\.webm$/.test(f)).length === 2 && rn.some(f => /\.json$/.test(f)), rn);
  checks.push('info ' + JSON.stringify({ files:fn, screens:L.log.filter(e => e.kind === 'screen').length, timeline:L.timeline.slice(0, 14) }));
  console.log(checks.join('\n')); console.log('ERRORS', errors.length ? errors : 'none');
  await b.close(); process.exit(checks.some(c => c.startsWith('FAIL')) || errors.length ? 1 : 0);
})();
