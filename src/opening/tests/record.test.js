// Run: NODE_PATH=<playwright node_modules> node record.test.js   (env: GAME, OUT, CODE=<save code file> PRINT=<range, e.g. w8> to print a week of a saved run)
// The pupil record (Workbook v5.1, D75):
//  1. on Launch Day a long multiplication is typed into the column template digit by digit, one partial product off by a
//     carry: the record keeps both attempts cell by cell, the Query's note names the line, the second attempt is Checked;
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
  await p.evaluate(() => { const st = window.__sim.settings(); st.flightSecs = 0.25; st.autoWall = false; st.opsSound = false; });

  // ---------- 1. Launch Day: a long multiplication in the column template, cell by cell ----------
  await p.click('#start'); await p.fill('#nm', 'Dragon Air'); await p.click('#nx');
  for(let k = 0; k < 12; k++){ const t = await T(); if(t === 'code' || t === 'logo' || t === 'cert'){ await p.click('#nx'); continue; } if(t === 'paint'){ await p.click('#roll'); continue; } if(t === 'reveal'){ await p.click('#skipReveal'); await p.waitForTimeout(150); await p.click('#nx'); continue; } if(t === 'boot'){ await p.click('#enterHq'); continue; } if(t === 'chapter'){ await p.click('#chGo'); continue; } if(t === 'brief1'){ await p.click('#nx'); continue; } break; }
  ok('launch day: the plan', await T() === 'plan', await T());
  if(await p.$('#s2Back')){ await p.click('[data-pe="0|add|par|0|0"]'); await p.click('[data-pe="0|add|dub|0|0"]'); await p.click('#s2Back'); await p.waitForTimeout(100); }
  else { await p.click('[data-pe="0|add|par|0|0"]').catch(() => {}); await p.click('[data-pe="0|add|dub|0|0"]').catch(() => {}); }
  await p.waitForTimeout(100); await p.click('#nx'); await p.waitForTimeout(150);
  for(let k = 0; k < 20 && !(await p.$('.wkb input[data-r]')); k++){ if(await p.$('#wkTutNext')){ await p.click('#wkTutNext'); continue; } if(await p.$('#wkTutGo')){ await p.click('#wkTutGo'); continue; } if(await p.$('[data-wpick]')){ const ws = await p.$$('[data-wpick]'); await (ws[1] || ws[0]).click(); await p.waitForTimeout(80); continue; } if(await p.$('[data-summode="grid"]')){ await p.click('[data-summode="grid"]'); continue; } await p.waitForTimeout(100); }
  ok('the column template is on screen', !!(await p.$('.wkb input[data-r]')), await T());
  const S0 = JSON.parse(await E(`JSON.stringify((() => { const t = currentTable(), col = t.cols.find(c => c.id === t.active.col), row = tRows(t).find(r => r.id === t.active.row), ops = stackRows(t, col, row);
    return { a:+wkFig(operandUnit(t, ops[0].id), operandValue(t, col, ops[0].id)).s, b:+wkFig(operandUnit(t, ops[1].id), operandValue(t, col, ops[1].id)).s, op:ops[1].op, rows:Math.max(...[...document.querySelectorAll('.wkb input[data-r]')].map(x => +x.dataset.r)), q:ops.map((x, i) => (i ? x.op + ' ' : '') + x.value).join(' ') }; })())`));
  const parts = String(S0.b).split('').reverse().map((d, i) => S0.a * +d * Math.pow(10, i)).filter(v => v).slice(0, S0.rows);
  const typeIn = (rows, ans) => p.evaluate(([rows, ans]) => { const g = document.querySelector('.wkb'), W = +g.style.getPropertyValue('--w');
    g.querySelectorAll('input[data-r], input[data-cy]').forEach(x => { x.value = ''; });
    rows.forEach(([r, s]) => String(s).split('').reverse().forEach((d, i) => { const x = g.querySelector(`input[data-r="${r}"][data-c="${W - 1 - i}"]`); if(x) x.value = d; }));
    const cy = g.querySelector('input[data-cy="0|' + (W - 2) + '"]'); if(cy) cy.value = '1';
    const A = document.getElementById('cellAns'); A.value = String(ans); A.dispatchEvent(new Event('input')); }, [rows, ans]);
  const wrong = parts.slice(); wrong[parts.length > 1 ? 1 : 0] -= parts.length > 1 ? 100 : 10;   // a carry missed in one line
  await typeIn(wrong.map((v, r) => [r, v]).concat([[S0.rows, wrong.reduce((x, y) => x + y, 0)]]), wrong.reduce((x, y) => x + y, 0)); await p.press('#cellAns', 'Enter'); await p.waitForTimeout(150);
  await typeIn(parts.map((v, r) => [r, v]).concat([[S0.rows, S0.a * S0.b]]), S0.a * S0.b); await p.press('#cellAns', 'Enter'); await p.waitForTimeout(150);
  const e1 = JSON.parse(await E('JSON.stringify(S.record.entries.filter(e => e.type === "calc").pop())'));
  ok('the record has the sum with two attempts, a Query then Checked', e1 && e1.attempts.length === 2 && !e1.attempts[0].ok && e1.attempts[1].ok && e1.status === 'checked', e1 && { q:e1.question, n:e1.attempts.length, status:e1.status });
  const lines = a => a.grid.lines.filter(L => L.kind === 'work' && L.text.trim()).map(L => L.text.trim());
  ok('it keeps the working cell by cell: each working line as typed, the carry, the answer line', e1 && JSON.stringify(lines(e1.attempts[0])) === JSON.stringify(wrong.map(String)) && e1.attempts[0].grid.lines.some(L => L.kind === 'carry') && e1.attempts[1].grid.lines.find(L => L.kind === 'ans').text.trim() === String(S0.a * S0.b), e1 && e1.attempts.map(lines));
  ok('the Query names the line that is off and the carry', e1 && /is .*not .*carry/.test(e1.attempts[0].note), e1 && e1.attempts[0].note);
  ok('the entry carries its Bettws codes and method', e1 && e1.codes.length >= 3 && /column template/.test(e1.method), e1 && [e1.codes, e1.method]);
  const html1 = await E('recordPrintHtml({ view:"date", range:"all" })'); fs.writeFileSync(OUT + 'launch-day-record.html', html1);
  ok('the printout shows the wrong line boxed in red and the second attempt ticked', /class="bad"/.test(html1) && /class="tick">✓/.test(html1) && /class="red note"/.test(html1));

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
