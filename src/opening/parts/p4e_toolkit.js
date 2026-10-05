/* ==================================================================
   THE MATHS TOOLKIT. Each tool (ticket revenue, fuel cost, profit, totals, averages, time to afford…)
   is at one of three levels, set by the teacher (or by a default for each stage of the story):
     calc  — the pupil works the figure out ("Complete figure", the sum in the calculation dock);
     build — he chooses the figures and the sign first, then works it out;
     model — the airline's software works it out, and the figure carries a small "model" badge.
   A table row belongs to a tool ("tool" in data-tables); the tool's level decides whether the row is typed.
   ================================================================== */
const TOOLS = J('data-tools'), TOOL = Object.fromEntries(TOOLS.map(x => [x.id, x]));
const LVL = { calc:'Calculate', build:'Build', model:'Model' };
/* How far into the story we are: 2 launch day, 3.1–3.3 Days 1–3, 4 weeks, 5 months, 6 the first year, 7 the purchase. */
function progress(){ if(!S || S.phase === 'setup' || S.phase === undefined) return 2; const w = roundData(S.round || 0); return w.prog || 2; }
function toolDefault(id){ const T = TOOL[id]; let lv = T.def[0][1]; T.def.forEach(([p, l]) => { if(progress() >= p) lv = l; }); return lv; }
function toolLevel(id){ const T = TOOL[id]; if(!T) return 'model'; const o = S && S.tools && S.tools[id]; if(o && (o !== 'build' || T.build)) return o; return toolDefault(id); }
function toolMet(id){ return progress() >= TOOL[id].phase; }
function setToolLevel(id, l){ S.tools = S.tools || {}; if(l) S.tools[id] = l; else delete S.tools[id]; save(); }
function rowTyped(t, row){ return row.type === 'calc' && !!row.tool && toolLevel(row.tool) !== 'model'; }
function typedIds(t){ return tRows(t).filter(r => rowTyped(t, r)).map(r => r.id); }
/* The table engine reads the tool levels instead of the old per-table help modes. */
function rowLive(t, row){ return rowTyped(t, row); }
/* A model figure waits only for the figures it is made from; a typed figure waits for the typed figures before it. */
function rowDeps(row){ return ((row.sentence || '').match(/\{\??(\w+)\}/g) || []).map(x => x.replace(/[{}?]/g, '')).filter(id => id !== row.id); }
function cellState(t, col, ri){
  const rows = tRows(t), row = rows[ri];
  if(row.type === 'given') return 'given';
  if(col.auto && col.auto[row.id]) return 'derived';
  if(!rowLive(t, row)){
    for(const id of rowDeps(row)){ const j = rows.findIndex(r => r.id === id); if(j >= 0 && j !== ri){ const s = cellState(t, col, j); if(s === 'wait' || s === 'enter') return 'wait'; } }
    return 'derived';
  }
  for(let i = 0; i < ri; i++){ const s = cellState(t, col, i); if(s === 'wait' || s === 'enter') return 'wait'; }
  return t.done[cellId(col.id, row.id)] ? 'done' : 'enter';
}
function ensureTable(id, kind, cols, opts){
  opts = opts || {};
  const key = tableKey(cols) + (opts.rowIds ? '|' + opts.rowIds.join(',') : ''), old = S.rnd.tables[id];
  if(old && old.key === key){ S.rnd.activeTable = id; old.labels = opts.labels || old.labels; return old; }
  const t = { id, kind, key, cols, live:true, mode:'shown', onlyRows:[], labels: opts.labels || {}, rowIds: opts.rowIds || null, done:{}, chosen:{}, active:null, picked:null };
  // keep the answers in any column that hasn't changed
  if(old && old.kind === kind) cols.forEach(c => { const oc = old.cols.find(x => x.id === c.id); if(!oc || JSON.stringify(oc.values) !== JSON.stringify(c.values)) return;
    Object.keys(old.done).forEach(k => { if(k.startsWith(c.id + '|')) t.done[k] = old.done[k]; }); Object.keys(old.chosen).forEach(k => { if(k.startsWith(c.id + '|')) t.chosen[k] = old.chosen[k]; }); });
  S.rnd.tables[id] = t; S.rnd.activeTable = id;
  t.active = nextOpenCell(t);
  return t;
}
/* The working the pupil can see: the dock's figures, re-read exactly as they are shown. */
function shownAnswer(t, col, row){
  let rows; try{ rows = stackRows(t, col, row); }catch(e){ return null; } if(!rows || rows.length < 2) return null;
  let v = parseCell(row.unit, rows[0].value); if(v === null) return null;
  for(let i = 1; i < rows.length; i++){ const x = parseCell(row.unit, rows[i].value), op = rows[i].op; if(x === null) return null;
    v = op === '+' ? v + x : op === '−' ? v - x : op === '×' ? v * x : op === '÷' ? (x ? v / x : NaN) : NaN; }
  return isFinite(v) ? v : null;
}
/* Anything odd about a check is written down for the teacher (teacher panel → Calculation checks). */
function diagNote(o){
  const n = Object.assign({ when:new Date().toTimeString().slice(0, 8), day:S.day, round:S.round, step:(step() || {}).t }, o);
  S.diag = (S.diag || []).concat([n]).slice(-20); (window.__notes = window.__notes || []).push('check: ' + o.kind);
  try{ console.warn('Calculation check', n); }catch(e){} save();
}
/* A figure is right if it matches the model, or the working on screen (should the two ever differ, that is recorded).
   Figures rounded for the pupil (averages to the nearest pound) accept anything that rounds to the answer. */
function checkCell(t, col, row, raw){
  const want = col.values[row.id], got = parseCell(row.unit, raw); if(got === null) return 'blank';
  const tol = row.tol ? row.tol + 1e-9 : 0.005, shown = shownAnswer(t, col, row), differs = shown !== null && Math.abs(shown - want) >= 1;
  if(differs) diagNote({ kind:'working on screen differs from the model', table:t.id, cell:cellId(col.id, row.id), stored:want, shown, typed:got });
  if(Math.abs(got - want) < tol) return 'ok';
  if(differs && Math.abs(got - shown) < Math.max(tol, 0.5)) return 'ok';
  if(want < 0 && Math.abs(got + want) < tol) return 'sign';
  return got > want ? 'high' : 'low';
}
/* After three tries the dock offers "Show me the answer"; a loss gets its own hint. */
function cellWrong(res){
  const k = res === 'blank' ? (UI.tries || 0) : (UI.tries = (UI.tries || 0) + 1); let m = TEXT.retry[Math.max(0, k - 1) % TEXT.retry.length];
  if(res === 'blank') m = 'Enter a figure first.';
  else if(res === 'sign') m = 'Nearly! This plan makes a loss, so the answer is below zero. Put a minus sign in front (−).';
  else if(settings.nudge) m += ' ' + (res === 'high' ? TEXT.nudgeHigh : TEXT.nudgeLow);
  UI.msg = m; UI.ok = false;
}
function renderDiag(){
  const box = $('tDiag'); if(!box || !S) return; const d = S.diag || [];
  box.innerHTML = d.length ? `<table class="ttools"><thead><tr><th>Time</th><th>Where</th><th>What</th><th>Figures</th></tr></thead><tbody>${d.slice().reverse().map(x => `<tr><td>${esc(x.when)}</td><td>${esc(x.step || '')} · day ${x.day}</td><td>${esc(x.kind)}</td><td class="mono small">${esc(['cell', 'stored', 'shown', 'typed', 'was', 'is', 'now', 'tries'].filter(k => x[k] !== undefined && x[k] !== null && x[k] !== '').map(k => k + ' ' + x[k]).join(' · '))}</td></tr>`).join('')}</tbody></table>`
    : '<p class="small muted">No problems recorded. If an answer is ever marked wrong when it matches the sum, a line appears here: take a photo of it.</p>';
}
/* If the teacher changes a tool while its figure is open, the figure closes (it is no longer typed). */
function tidyActive(t){
  if(!t || !t.active) return;
  const c = t.cols.find(x => x.id === t.active.col), ri = tRows(t).findIndex(r => r.id === t.active.row);
  if(!c || ri < 0 || cellState(t, c, ri) !== 'enter'){ t.active = null; resetEntry(); }
}

/* Build: choose the figures and the sign before working the figure out. */
function needsBuild(t, row){ const c = t.active; return !!row.tool && TOOL[row.tool] && TOOL[row.tool].build && toolLevel(row.tool) === 'build' && c && !t.chosen[cellId(c.col, c.row)]; }
function buildHtml(t, col, row){
  const ops = stackRows(t, col, row).map(x => x.id);
  // distractors: other figures on the sheet, or the figures another relationship on this sheet is made from (e.g. Paris passengers and fare when building Dublin's tickets)
  const others = (TABLES[t.kind].rows || []).filter(r => r.id !== row.id && r.from).reduce((a, r) => a.concat(r.from), []);
  const extra = tRows(t).filter(r => r.type === 'given' && !ops.includes(r.id) && col.values[r.id] !== undefined && r.id !== row.id).map(r => r.id)
    .concat(others.filter(id => !ops.includes(id) && typeof col.values[id] === 'number' && col.values[id] !== 0)).filter((v, i, a) => a.indexOf(v) === i).slice(0, 2);
  const cands = ops.concat(extra).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => figLabel(t, a).localeCompare(figLabel(t, b)));
  const show = id => `${esc(figLabel(t, id))} <b class="mono">${fmtVal(operandUnit(t, id), operandValue(t, col, id))}</b>`;
  return `<div class="calc build"><p class="calc-q">Which two figures make the <b>${esc(lcFirst(rowLabel(t, row)))}</b>, and which sign? The model then works it out.</p>
    <div class="pk-figs">${cands.map(id => `<button class="pk ${UI.picks.includes(id) ? 'on' : ''}" data-pk="${id}" aria-pressed="${UI.picks.includes(id)}">${show(id)}${UI.picks.indexOf(id) >= 0 ? `<i>${UI.picks.indexOf(id) + 1}</i>` : ''}</button>`).join('')}</div>
    <div class="ops">${['+', '−', '×', '÷'].map(op => `<button class="op ${UI.op === op ? 'on' : ''}" data-op="${op}" aria-pressed="${UI.op === op}">${op}</button>`).join('')}</div>
    <div class="sumline mono">${UI.picks[0] ? fmtVal(operandUnit(t, UI.picks[0]), operandValue(t, col, UI.picks[0])) : '?'} ${UI.op || '?'} ${UI.picks[1] ? fmtVal(operandUnit(t, UI.picks[1]), operandValue(t, col, UI.picks[1])) : '?'}</div>
    <button class="btn primary big" id="trySum" ${UI.picks.length === 2 && UI.op ? '' : 'disabled'}>That's my sum</button>
    <div class="msg" id="ftMsg" role="status">${esc(UI.msg || '')}</div>
    <p class="calc-hint">The order matters for − and ÷: choose the first figure first.</p></div>`;
}
function lcFirst(s){ s = String(s || ''); return /^[A-Z][a-z]/.test(s) && !/^(Paris|Dublin|London)/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
function figLabel(t, id){ if(tRows(t).some(r => r.id === id)) return operandLabel(t, id); const L = typeof costLabels === 'function' && t.kind === 'cost1' ? costLabels() : {}; return L[id] || OPND[id] || id; }

/* "Ticket revenue model online": a short notice when a tool reaches Model (older saves start quietly). */
function checkTools(){
  if(!S || !S.steps) return;
  const now = {}; TOOLS.forEach(T => { now[T.id] = toolLevel(T.id); });
  if(!S.toolSeen){ S.toolSeen = now; return; }
  const on = TOOLS.filter(T => now[T.id] === 'model' && S.toolSeen[T.id] !== 'model' && toolMet(T.id));
  S.toolSeen = now;
  if(on.length) sysNotice(on.map(T => T.name + ' model online').join(' · '));
}

/* The teacher's control: one row per tool. */
function renderTeacherTools(){
  renderDiag(); on('tDiagClear', () => { S.diag = []; save(); renderDiag(); });
  const box = $('tTools'); if(!box || !S) return;
  box.innerHTML = `<table class="ttools"><thead><tr><th>Maths tool</th><th>First met</th><th>Level now</th><th></th></tr></thead><tbody>${TOOLS.filter(T => !T.fixed).map(T => { const lv = toolLevel(T.id), o = S.tools && S.tools[T.id];
    return `<tr><td><b>${esc(T.name)}</b><small>${esc(T.what)}</small></td><td>Phase ${Math.floor(T.phase)}</td><td class="tlv">${['calc', 'build', 'model'].map(l => `<button class="btn small" data-tlv="${T.id}|${l}" aria-pressed="${lv === l}" ${l === 'build' && !T.build ? 'disabled title="Not available for this tool"' : ''}>${LVL[l]}</button>`).join('')}</td>
      <td>${o ? `<button class="link" data-tlv="${T.id}|">Use the default (${LVL[toolDefault(T.id)]})</button>` : '<span class="muted small">Default for this stage</span>'}</td></tr>`; }).join('')}</tbody></table>`;
  box.querySelectorAll('[data-tlv]').forEach(b => b.onclick = () => { const [id, l] = b.getAttribute('data-tlv').split('|'); setToolLevel(id, l || null); renderTeacherTools(); });
}
function bindTeacherTools(){
  const all = l => { TOOLS.filter(T => !T.fixed).forEach(T => setToolLevel(T.id, l === 'build' && !T.build ? 'calc' : l)); renderTeacherTools(); };
  on('tToolsDef', () => { S.tools = {}; save(); renderTeacherTools(); }); on('tToolsCalc', () => all('calc')); on('tToolsModel', () => all('model'));
}

/* The pupil's view of the toolkit (Finance → Models). */
function modelsHtml(){
  const met = TOOLS.filter(T => toolMet(T.id));
  return `<div class="pb models">${met.map(T => { const lv = toolLevel(T.id);
    return `<div class="mdl-row ${lv}"><span class="mdl-st">${lv === 'model' ? 'Model online' : lv === 'build' ? 'You build it' : 'You work it out'}</span><b>${esc(T.name)}</b><small>${esc(T.what)}</small></div>`; }).join('')}</div>`;
}
