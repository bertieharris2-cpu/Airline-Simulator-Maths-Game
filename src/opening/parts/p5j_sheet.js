
/* ==================================================================
   SUMS IN THE SHEET (Bertie, play notes 18 Oct 2026, Launch Day): "it would be better for the pupil to actually write the
   total straight onto the spreadsheet table. I think it's a useful skill ... and maybe just underneath that then it says the
   sum to do just for that first one if they need a hint ... the title ... for this page should be calculate the revenue for
   each fare to Dublin, and that way we don't necessarily need the thing on the right. Maybe there could be a gap underneath
   the spreadsheet with that information. I think that's something worth experimenting with."
   On the workings page the answer box is the sheet's own cell. What the Maths Dock said (the sum's number and name, the rule,
   the note about the book, the Query messages, the reference card; Figure done and Next sum; the worked example; Choose the
   fare) sits in a panel under the sheet, and the right-hand panel goes. Where one row is worked out at several fares, the
   sum's numbers are given for the first column only: the later ones are read from the sheet. The page is titled by what is
   being worked out. Teacher panel → Maths tools → "Sums in the sheet" (on); off brings back the panel on the right.
   ================================================================== */
{
const shOn = () => settings.sumsInSheet !== false;
const shWork0 = R.workings;
R.workings = st => { const out = shWork0(st); try{ if(shOn() && step().t === 'workings') shAfter(st); }catch(e){ console.error(e); } return out; };

/* the page's title: what is being worked out now (the table just finished while its Figure done shows) */
function shTitle(W, st){
  let Z = null; try{ Z = sumState(W, st); }catch(e){}
  const jd = Z && Z.justDone && UI.justDone ? UI.justDone.cell.split('|') : null;
  const t = (Z && (Z.justDone || Z.act)) || currentTable() || W.t, rows = t ? tRows(t) : [], a = jd ? { col:jd[0], row:jd[1] } : t && t.active;
  const row = a ? rows.find(r => r.id === a.row) : rows.find(r => r.type === 'calc'), city = row && row.route && routeById(row.route) ? routeById(row.route).city : null;
  if(!jd && Z && Z.multi && !Z.picked && !wkNext(W.tables)) return (W.pickKind || Z.pickKind) === 'fare' || (t && t.stage === 'fare') ? (city ? `Choose the ${city} fare` : 'Choose the fare') : (W.pickKind || Z.pickKind) === 'snack' ? 'Choose the snack price' : 'Choose one';
  if(t && t.stage === 'fare' && t.cols.length > 1) return city ? `Calculate the revenue for each fare to ${city}` : 'Calculate the revenue for each fare';
  if(!jd && !a && !wkNext(W.tables)) return 'Today\'s figures are worked out';
  if(!row) return 'Work out the figures';
  const lab = rowLabel(t, row), proper = (WORLD.routes || []).some(r => lab.startsWith(r.city));
  return `Calculate the ${proper ? lab : lab.charAt(0).toLowerCase() + lab.slice(1)}`;
}

function shAfter(st){
  const root = screen(), ws = root.querySelector('.ws.ws-workings'), dock = ws && ws.querySelector(':scope > aside.dock-sum'), sheet = root.querySelector('.sheetp');
  if(!ws || !dock || !sheet) return;
  let W = null; try{ W = workTables(currentPlan()); }catch(e){ return; } if(!W) return;
  const head = dock.querySelector('.dk-h'), body = dock.querySelector('.dk-b'), kind = head && head.querySelector('.dk-kind'), tt = head && head.querySelector('.dk-t'), prog = head && head.querySelector('.sd-prog');
  const h1 = root.querySelector('h1.tq'); if(h1){ const want = shTitle(W, st); if(want) h1.textContent = want; }
  // the worked example keeps the panel on the right: it is long, and it is read rather than typed into
  if(body && body.querySelector('#wkTutNext, #wkTutGo')) return;
  const sec = document.createElement('section'); sec.className = 'pnl sh-work'; sec.setAttribute('aria-label', 'Work it out');
  sec.innerHTML = `<div class="sh-h"><span class="dk-kind">${kind ? esc(kind.textContent) : 'Work it out'}</span><b>${tt ? esc(tt.textContent) : ''}</b><span class="grow"></span>${prog ? `<span class="sd-prog">${esc(prog.textContent)}</span>` : ''}</div><div class="sh-b"></div>`;
  const sb = sec.querySelector('.sh-b'); if(body) while(body.firstChild) sb.appendChild(body.firstChild);
  sheet.parentNode.insertBefore(sec, sheet.nextSibling);
  dock.remove(); ws.classList.add('ws-sheet');
  // the answer box goes into the sheet's own cell
  const t = currentTable(), a = t && t.active, cell = sheet.querySelector('.sheet1.now td.enter.on'), ans = sb.querySelector('.sd-ans');
  // (the hidden button first: what is typed is mirrored into the cell's first button, which was "Completing…")
  if(cell && ans && sb.querySelector('#cellAns')){ cell.innerHTML = '<button class="sh-mirror" hidden tabindex="-1"></button>'; cell.appendChild(ans); cell.classList.add('sh-in'); sec.classList.add('sh-typing');
    const inp = ans.querySelector('#cellAns'); if(inp) inp.setAttribute('placeholder', 'type it here');
    // the numbers of the sum for the first column only; the rest are read from the sheet
    if(t && a && t.cols.length > 1 && t.cols[0].id !== a.col){ const big = sb.querySelector('.pq-big'), col = t.cols.find(c => c.id === a.col);
      if(big){ big.className = 'pq-own'; big.textContent = `The same sum for the ${col ? col.label : 'next'} column: read its figures from the sheet.`; } }
    setTimeout(() => { try{ const i = document.getElementById('cellAns'); if(i && document.activeElement !== i) i.focus(); }catch(e){} }, 40); }
  // the tables already worked out fold to one line each, so the sum being done and its help stay in view
  const others = [...sheet.querySelectorAll('.sheet1:not(.now)')];
  if(others.length){ const lines = others.map(shSummary).filter(Boolean);
    if(!UI.shAll) others.forEach(x => x.classList.add('sh-fold'));
    if(lines.length) sheet.querySelector('.sheet1.now').insertAdjacentHTML('afterend', `<div class="sh-prev"><span class="kl">Worked out already</span>${lines.map(l => `<span class="sh-pl">${l}</span>`).join('')}<button class="dk-link" id="shAll">${UI.shAll ? 'Fold them' : 'Show them in full'}</button></div>`);
    const b = document.getElementById('shAll'); if(b) b.onclick = () => { UI.shAll = !UI.shAll; render(); }; }
  // Figure done: Enter goes on to the next sum, so the keyboard alone does the page (type, Enter, Enter)
  const nxs = sb.querySelector('#wkNext'); if(nxs) setTimeout(() => { try{ if(document.activeElement === document.body || !document.activeElement) nxs.focus(); }catch(e){} }, 40);
  // the page says what is being worked out, and where
  const hint = root.querySelector('.actbar .ab-hint'); if(hint && /panel on the right/.test(hint.textContent)) hint.innerHTML = hint.innerHTML.replace('Work out each figure in the panel on the right.', 'Type each answer into the sheet.');
  root.querySelectorAll('.actbar button[disabled]').forEach(b => { if(/figures on the right/.test(b.textContent)) b.innerHTML = 'Work out the figures in the sheet &#9654;'; });
}

/* one line for a table already worked out: each figure the pupil worked out, with its column where there are several */
function shSummary(tbl){
  const heads = [...tbl.querySelectorAll('thead th')].slice(1).map(th => ((th.querySelector('b') || th).textContent || '').trim()), out = [];
  tbl.querySelectorAll('tbody tr').forEach(tr => { const th = tr.querySelector('th'); if(!th) return; const lab = [...th.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    const vals = [...tr.querySelectorAll('td')].map((td, i) => td.classList.contains('done') ? `<b>${esc(td.textContent.trim())}</b>${heads.length > 1 && heads[i] ? ' at ' + esc(heads[i]) : ''}` : null).filter(Boolean);
    if(vals.length) out.push(`${esc(lab)}: ${vals.join(' · ')}`); });
  return out.join('; ');
}

/* the teacher panel: Maths tools → Sums in the sheet */
document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
  try{ const sel = document.getElementById('tPractice'), row = sel && sel.closest('.row'); if(!row || document.getElementById('tSheet')) return;
    row.insertAdjacentHTML('afterend', `<div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="tSheet" style="width:24px;height:24px"> Sums in the sheet: the pupil types each answer into the spreadsheet, with the sum and its help underneath (off: the panel on the right)</label></div>`);
    const cb = document.getElementById('tSheet'); cb.checked = shOn(); cb.onchange = () => { settings.sumsInSheet = cb.checked; saveSettings(); render(); };
  }catch(e){}
}, 30));
window.__sh = { on:shOn, title:() => { try{ return shTitle(workTables(currentPlan()), step()); }catch(e){ return null; } } };
}
