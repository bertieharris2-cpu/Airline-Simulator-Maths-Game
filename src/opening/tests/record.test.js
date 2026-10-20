// Run: NODE_PATH=<playwright node_modules> node record.test.js   (env: GAME, OUT, CODE=<save code file> PRINT=<range, e.g. w8> to print a week of a saved run)
// The pupil record (Workbook v5.1, D75; on paper from v5.6, D86; on the Sheet from 19 Oct, evening):
//  1. on the Launch Day sheet: a sum answered ten times out, then right (a Query with its note, then Checked), and
//     the profit answered wrong twice (Finance shows it); the record keeps every attempt and the sum's number, and the
//     printout prints the number in the margin with a ruled box for the working from the book;
//  2. every error note of the brief's §3 fires on its case (worked from the working, not just the answer);
//  3. with CODE and PRINT, the record of a saved run prints in both views (HTML and PDF in OUT).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const FILE = 'file://' + path.resolve(__dirname, '../../..', process.env.GAME || 'airline-opening-prototype.html'), OUT = (process.env.OUT || os.tmpdir() + '/airline-record') + '/'; fs.mkdirSync(OUT, { recursive:true });
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport:{ width:1680, height:940 } })).newPage();
  const errors = [], checks = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if(m.type() === 'error') errors.push('console: ' + m.text()); }); p.on('dialog', d => d.accept());
  const ok = (name, cond, x) => checks.push((cond ? 'ok   ' : 'FAIL ') + name + (x !== undefined ? ' ' + JSON.stringify(x) : ''));
  const T = () => p.evaluate(() => window.__sim.step().t), E = src => p.evaluate(s => window.__sim.evalIn(s), src);
  await p.goto(FILE); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(() => { const st = window.__sim.settings(); st.briefings = false; st.flightSecs = 0.25; st.autoWall = false; st.opsSound = false; });

  // ---------- 1. Launch Day: a long multiplication in the column template, cell by cell ----------
  await p.click('#start'); await p.fill('#nm', 'Dragon Air'); await p.click('#nx');
  for(let k = 0; k < 12; k++){ const t = await T(); if(t === 'code' || t === 'logo' || t === 'cert'){ await p.click('#nx'); continue; } if(t === 'paint'){ await p.click('#roll'); continue; } if(t === 'reveal'){ await p.click('#skipReveal', { timeout:4000 }).catch(() => {}); await p.waitForTimeout(150); await p.click('#nx'); continue; } if(t === 'boot'){ await p.click('#enterHq'); continue; } if(t === 'chapter'){ await p.click('#chGo'); continue; } if(t === 'brief1'){ await p.click('#nx'); continue; } break; }
  ok('launch day: the plan', await T() === 'plan', await T());
  if(await p.$('#s2Back')){ await p.click('[data-pe="0|add|par|0|0"]'); await p.click('[data-pe="0|add|dub|0|0"]'); await p.click('#s2Back'); await p.waitForTimeout(100); }
  else { await p.click('[data-pe="0|add|par|0|0"]').catch(() => {}); await p.click('[data-pe="0|add|dub|0|0"]').catch(() => {}); }
  await p.waitForTimeout(100); await p.click('#nx'); await p.waitForTimeout(150);
  // D86 (15 Oct 2026): the pupil works on paper; the game takes the answer. Since 19 Oct, evening (7.1, 7.3): the answer is typed into its cell on the Launch Day sheet; two tries, a sum number
  const plan = () => p.evaluate(() => window.__ash && window.__ash.plan()), line = () => p.$eval('[data-ash^="launch:"] .ash-line', e => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => '');
  let P = await plan(); for(let k = 0; k < 4 && P && P.co; k++){ await p.click(`[data-ash="${P.sheet}"] [data-ashgot]`); await p.waitForTimeout(80); P = await plan(); }
  ok('the Launch Day sheet: the first sum is a cell to type into; no answer box, column template, squared paper or Working pad', !!P && /^launch:/.test(P.sheet) && !P.build && !!(await p.$(`[data-ash="${P.sheet}"] [data-ashin]`)) && !(await p.$('.wk-sum.paper, .wkb, .wk-grid, [data-summode], .pad-btn')), P);
  const n1 = P && P.no, inp = P ? `[data-ash="${P.sheet}"] [data-ashin]` : '#none';
  ok('the line under the sheet names the sum: "Work it out in your book. Write Sum N beside it, then type the answer in B4"', new RegExp(`Work it out in your book\\. Write Sum ${n1} beside it, then type the answer in ${P && P.tgt}`).test(await line()), await line());
  await p.fill(inp, String(P.answer * 10)); await p.press(inp, 'Enter'); await p.waitForTimeout(120);
  ok('wrong once: the error note from the answer alone, and one more try; the right figure is not given', /ten times smaller/.test(await line()) && /One more try/.test(await line()) && !(await line()).includes(P.answer.toLocaleString('en-GB')), await line());
  await p.fill(inp, String(P.answer)); await p.press(inp, 'Enter'); await p.waitForTimeout(120);
  const e1 = JSON.parse(await E('JSON.stringify(S.record.entries.filter(e => e.type === "calc").pop())'));
  ok('the record has the sum with its number and both attempts, a Query then Checked', e1 && e1.n === n1 && e1.attempts.length === 2 && !e1.attempts[0].ok && e1.attempts[1].ok && e1.status === 'checked' && /ten times smaller/.test(e1.attempts[0].note), e1 && { n:e1.n, q:e1.question, tries:e1.attempts.length, status:e1.status, note:e1.attempts[0].note });
  const b1 = JSON.parse(await E(`JSON.stringify(S.record.entries.filter(e => e.type === "build" && e.key === ${JSON.stringify(e1 ? e1.key : '')}).pop() || null)`));
  // batch 2 (Bertie, 18 Oct): a sum about fares is always worked out in the book, so year one's ticket revenue has no Build step
  ok('batch 2: a fare sum is worked out in the book, not built: no Build in the record, the one Sum number', !b1 && e1 && e1.n === n1, b1 && { n:b1.n, status:b1.status });
  // the next sums: answered right, until the profit (F9), which is answered wrong twice: Finance fills it in
  let shownN = null;
  for(let k = 0; k < 40; k++){ const Q = await plan();
    if(!Q){ if(await p.$('#ashNext:not([disabled])')){ await p.click('#ashNext'); await p.waitForTimeout(60); continue; } break; }
    const R = `[data-ash="${Q.sheet}"]`;
    if(Q.co){ await p.click(`${R} [data-ashgot]`); await p.waitForTimeout(60); continue; }
    if(Q.build && Q.seq.length){ for(const x of Q.seq) await p.click(x.ref ? `${R} [data-ashref="${x.ref}"]` : `${R} [data-ashop="${x.op}"]`); await p.waitForTimeout(60); continue; }
    if(Q.tgt === 'F9'){ shownN = Q.no; for(const v of ['1', '2']){ await p.fill(`${R} [data-ashin]`, v); await p.press(`${R} [data-ashin]`, 'Enter'); await p.waitForTimeout(100); }
      ok('wrong twice: Finance fills in the cell (FINANCE on it) and the line says to copy it beside the sum', !!(await p.$(`${R} .ash-c[data-ref="F9"] .ash-fin`)) && /Finance has filled this one in/.test(await line()), await line()); break; }
    await p.fill(`${R} [data-ashin]`, String(Q.answer)); await p.press(`${R} [data-ashin]`, 'Enter'); await p.waitForTimeout(80); }
  const e2 = JSON.parse(await E('JSON.stringify(S.record.entries.filter(e => /profit/.test(e.key)).pop())'));
  ok('the record keeps both wrong attempts and marks the figure as shown', e2 && e2.n === shownN && e2.attempts.length === 3 && e2.attempts[2].shown && e2.status === 'shown', e2 && { n:e2.n, tries:e2.attempts.map(a => a.ok ? 'ok' : a.shown ? 'shown' : 'q'), status:e2.status });
  const html1 = await E('recordPrintHtml({ view:"date", range:"all" })'); fs.writeFileSync(OUT + 'launch-day-record.html', html1);
  ok('the printout: the sum number in the margin, a ruled box "Working (from your book)" under each entry, the Query note, the tick, Finance\'s figure',
    new RegExp(`class="sn">Sum ${n1}<`).test(html1) && (html1.match(/class="wb"/g) || []).length >= 2 && /Working \(from your book\)/.test(html1) && /class="red note"/.test(html1) && /class="tick">✓/.test(html1) && /Checked by Finance/.test(html1));
  { const q = await b.newPage(); await q.setContent(html1); await q.pdf({ path:OUT + 'launch-day-record.pdf', format:'A4', printBackground:true }); await q.close(); }

  // ---------- 2. the error notes of §3 ----------
  const N = JSON.parse(await E(`JSON.stringify({
    shift:recNote({ type:'calc', unit:'£', correct:3420, op:'×', ops:[38, 90] }, { value:342 }),
    pence:recNote({ type:'calc', unit:'£2', correct:468, op:'×', ops:[400, 1.17] }, { value:46800 }),
    partial:recNote({ type:'calc', unit:'£2', correct:330.75 }, { value:320.75, working:[{ lab:'225 × £1.00', typed:'225.00', want:'£225.00', wantV:22500, unit:'£', ok:true }, { lab:'225 × £0.40', typed:'80.00', want:'£90.00', wantV:9000, unit:'£', ok:false }, { lab:'225 × £0.07', typed:'15.75', want:'£15.75', wantV:1575, unit:'£', ok:true }] }),
    carryMissed:recNote({ type:'calc', unit:'£', correct:3420, op:'×', ops:[38, 90] }, { value:3320 }),
    carryTwice:recNote({ type:'calc', unit:'£', correct:3420, op:'×', ops:[38, 90] }, { value:3520 }),
    misaligned:recNote({ type:'calc', unit:'£', correct:874, op:'×' }, { value:152, grid:{ lines:[{ kind:'work', text:'114', value:114, ok:true }, { kind:'work', text:' 76', value:76, ok:false, near:{ v:760, txt:'38 × 20' } }] } }),
    exchange:recNote({ type:'calc', unit:'£', correct:1590, op:'−', ops:[3420, 1830] }, { value:2410 }),
    transposed:recNote({ type:'calc', unit:'£', correct:3420, op:'×', ops:[38, 90] }, { value:3240 }),
    buildMissing:recNote({ type:'build' }, { kind:'sum', chips:[{ k:'d1', label:'Mon 2' }, { op:'+' }, { k:'d2', label:'Tue 3' }], figs:[{ k:'d1', label:'Mon 2' }, { k:'d2', label:'Tue 3' }, { k:'d3', label:'Wed 4' }] }),
    buildDouble:recNote({ type:'build' }, { kind:'sum', chips:[{ k:'d1', label:'Mon 2' }, { op:'+' }, { k:'d1', label:'Mon 2' }], figs:[{ k:'d1', label:'Mon 2' }, { k:'d2', label:'Tue 3' }] }),
    buildOp:recNote({ type:'build' }, { kind:'sum', chips:[{ k:'d1', label:'Mon 2' }, { op:'×' }, { k:'d2', label:'Tue 3' }], figs:[{ k:'d1', label:'Mon 2' }, { k:'d2', label:'Tue 3' }] }),
    buildDivisor:recNote({ type:'build' }, { kind:'mean', chips:[{ label:'Total' }, { op:'÷' }, { text:'2' }], div:7, divGiven:'2', per:'day' }),
    fallback:recNote({ type:'calc', unit:'£', correct:3420, op:'×', ops:[38, 90] }, { value:2999 }) })`));
  ok('§3 place value: "Right digits; the answer should be ten times bigger — the × 10 shift was missed"', /Right digits; the answer should be ten times bigger — the × 10 shift was missed/.test(N.shift), N.shift);
  ok('§3 decimal point (make it whole): "46,800 is the whole-number answer: ÷ 100 puts the 2 decimal places back, so the bill is £468"', /^46,800 is the whole-number answer: ÷ 100 puts the 2 decimal places back, so the bill is £468\./.test(N.pence), N.pence);
  ok('§3 partial product: "225 × 40p is £90, not £80"', /^225 × 40p is £90, not £80\.$/.test(N.partial), N.partial);
  ok('§3 carry missed / added twice', /carry 1 into the hundreds wasn't added/.test(N.carryMissed) && /added twice/.test(N.carryTwice), [N.carryMissed, N.carryTwice]);
  ok('§3 column misaligned (a partial product not shifted)', /not shifted: 76 should be 760/.test(N.misaligned), N.misaligned);
  ok('§3 subtraction exchange: "3,420 − 1,830: the hundreds needed exchanging"', N.exchange === '3,420 − 1,830: the hundreds needed exchanging.', N.exchange);
  ok('§3 transposed digits', /wrong way round/.test(N.transposed), N.transposed);
  ok('§3 Build: a figure missing, doubled, the wrong operator, ÷ 2 for a mean', /Wed 4 is missing/.test(N.buildMissing) && /counted twice/.test(N.buildDouble) && /× is the wrong operation/.test(N.buildOp) && /÷ 2 halves it; an average shares between all 7 days/.test(N.buildDivisor), [N.buildMissing, N.buildDouble, N.buildOp, N.buildDivisor]);
  ok('§3 none matches: "Answer £X given; correct answer £Y"', N.fallback === 'Answer £2,999 given; correct answer £3,420.', N.fallback);

  // ---------- 3. a week of a saved run, printed both ways ----------
  if(process.env.CODE && process.env.PRINT){
    await p.evaluate(c => { const s = window.__sim.loadCode(c); window.__sim.setS(s); }, fs.readFileSync(process.env.CODE, 'utf8').trim());
    for(const view of ['date', 'kind']){ const html = await E(`recordPrintHtml({ view:'${view}', range:'${process.env.PRINT}' })`), f = OUT + `record-${process.env.PRINT}-${view}.html`; fs.writeFileSync(f, html);
      const q = await b.newPage(); await q.goto('file://' + f); await q.pdf({ path:f.replace(/\.html$/, '.pdf'), format:'A4', printBackground:true }); await q.close();
      ok(`print ${process.env.PRINT} by ${view}: entries, a Query with its note, the decisions`, /class="e"/.test(html) && /Decisions/.test(html), html.length); }
    const R = JSON.parse(await E('JSON.stringify({ n:S.record.entries.length, calc:S.record.entries.filter(e => e.type !== "decision").length, dec:S.record.entries.filter(e => e.type === "decision").length, q:S.record.entries.filter(e => e.attempts && e.attempts.some(a => !a.ok && !a.shown)).length, notes:S.record.entries.flatMap(e => (e.attempts || []).filter(a => a.note).map(a => a.note)).slice(0, 12) })'));
    checks.push('info record ' + JSON.stringify(R));
  }
  console.log(checks.join('\n')); console.log('ERRORS', errors.length ? errors : 'none');
  await b.close();
})();
