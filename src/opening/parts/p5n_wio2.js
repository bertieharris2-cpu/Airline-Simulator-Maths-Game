/* =====================================================================
   WORK IT OUT, BATCH 2 (Claude Design handover 18 Oct: 3.3 Option A "margins show where it comes from", 3.4 Option B
   "rows of ten", and §2 the sum flow; DESIGN.md "Work it out page", "Event sums"). Year one only.
   - The sum flow stays batch 1's (build the sum, then work it out in the book and type it, SUM n): §2 asks for the book
     step and SUM n on every sum in the game, and for the build step to stay where the game already has it. Four tiles on
     every build, two of them real figures from the same screen, labels on two lines.
   - The page: the sheet and its panel are one object 640px wide (the plan in its header, the label column 330px); the row
     being worked out is lit, a rule sits above Total revenue and a double rule under Profit, and "What's in this?" is a
     small link. The route strips, the timetable and the plan strip are gone. The margins: where the figures come from
     (A and B as small pictures: the flights and their passengers, the fare's price tag) and where the answer goes
     (→ Total revenue → Profit), labels only, from the sum's own figures.
   - Event sums (Stay with you, Business travellers today): no sheet. The group drawn in rows of ten, 7 of each 10 lit and
     the rest dimmed, a bracket "7 in every 10 = 0.7" and one caption tying it to the event; the working panel under it.
   ===================================================================== */
const wio2On = () => !!S && yearOne() && typeof paperOn === 'function' && paperOn() && step().t === 'workings';
/* ---------- the four tiles: two real figures from the same screen ---------- */
function wio2TenData(t){
  const H = S.rnd.handSums || {}, kind = /:rival$/.test(t.id) ? 'rival' : /:weekend$/.test(t.id) ? 'weekend' : '', hs = kind === 'rival' ? H.rivalStay : H.weekendDemand, rid = hs && hs.route;
  const r = rid && routeById(rid); if(!r) return null; const V = (t.cols[0] || {}).values || {}, fare = fareOf(rid), f = S.fleet.find(x => (currentPlan().fleet.find(y => y.sched.includes(rid)) || {}).uid === x.uid) || S.fleet[0], p = f && planeById(f.planeId);
  return { kind, r, rid, fare, rival:kind === 'rival' ? competitorPrice(r) : null, people:V.people || 0, share:V.share || 0, plane:p, day:S.day };
}
const wio2Tiles0 = bvTiles;
bvTiles = function(t, col, row){
  let tiles = wio2Tiles0(t, col, row); if(!yearOne()) return tiles;
  const add = d => { if(tiles.length < 4 && !tiles.some(x => x.k === d.k || x.text === d.text)) tiles.push(d); };
  if(/^tenths:/.test(t.id)){ const E = wio2TenData(t); tiles = tiles.filter(x => !x.dis); if(E){
      if(E.kind === 'rival'){ add({ k:'rkFare', label:`${WORLD.rival || 'Red Kite Air'}'s fare`, text:money(E.rival), dis:true }); add({ k:'myFare', label:`Your ${E.r.city} fare`, text:money(E.fare), dis:true }); }
      else { if(E.plane) add({ k:'seats', label:`Seats on a ${shortPlane(E.plane)}`, text:num(E.plane.seats), dis:true }); add({ k:'myFare', label:`${E.r.city} fare`, text:money(E.fare), dis:true }); } } }
  else { tiles = tiles.filter(x => x.k !== 'day' && x.k !== 'fuelL');   // the plan strip under the timetable is gone from the page
    const pax = stackRows(t, col, row).find(x => /^pax_/.test(x.id)); if(pax){ const rid = pax.id.slice(4), n = wio2Flights(rid); if(n) add({ k:'flights', label:`${routeById(rid) ? routeById(rid).city : ''} flights a day`.trim(), text:num(n), dis:true }); } }
  return tiles.sort((a, b) => a.label.localeCompare(b.label)); };
function wio2Flights(rid){ try{ return currentPlan().fleet.reduce((n, x) => n + x.sched.filter(id => id === rid).length, 0); }catch(e){ return 0; } }

/* ---------- the margins ---------- */
function wio2Tag(v){ return `<svg class="wio2-tag" viewBox="0 0 150 64" aria-hidden="true"><path d="M30 6 L144 6 L144 58 L30 58 L6 32 Z" fill="#0d2a4c" stroke="rgba(159,189,227,.75)" stroke-width="1.6"/><path d="M30 6 L144 6" stroke="rgba(150,205,255,.55)" stroke-width="1.6"/><circle cx="24" cy="32" r="4.5" fill="#020812"/><text x="88" y="41" text-anchor="middle" font-family="Segoe UI Variable Text, Segoe UI, system-ui, sans-serif" font-size="26" font-weight="700" fill="#eaf2ff">${esc(v)}</text></svg>`; }
function wio2Plane(rid){ const pl = currentPlan(), x = pl.fleet.find(y => y.sched.includes(rid)), f = x ? S.fleet.find(z => z.uid === x.uid) : S.fleet[0]; try{ return f ? aircraftArt(f, { cls:'wio2-plane', name:'' }) : ''; }catch(e){ return ''; } }
function wio2From(t, col, row){
  const ops = stackRows(t, col, row);
  return ops.slice(0, 3).map((x, i) => { const v = String(x.value), lab = x.label || '', id = x.id || '';
    let pic, cap;
    if(/^pax_/.test(id)){ const rid = id.slice(4), n = wio2Flights(rid); pic = wio2Plane(rid); cap = `<b>${num(n)} flight${n === 1 ? '' : 's'}</b><span>${esc(v)} passengers</span>`; }
    else if(/^fare_/.test(id) || /fare|price/i.test(lab)){ pic = wio2Tag(v); cap = `<span>${esc(lab)}</span>`; }
    else { pic = `<b class="wio2-fig ${/£/.test(v) ? 'gold' : ''}">${esc(v)}</b>`; cap = `<span>${esc(lab)}</span>`; }
    return `<div class="wio2-tile"><i class="wio2-ab">${BV_AB[i]}</i><div class="wio2-pic">${pic}</div>${cap}</div>`; }).join(''); }
function wio2To(t, col, row){
  const rows = tRows(t), V = col.values || {}, has = id => rows.some(r => r.id === id);
  const val = id => { const ri = rows.findIndex(r => r.id === id); if(ri < 0) return null; const s = cellState(t, col, ri); return ['done', 'derived', 'given'].includes(s) && V[id] !== undefined ? fmtVal(rows[ri].unit, V[id]) : null; };
  const dep = (into, id) => { const r = rows.find(x => x.id === into); return !!r && (rowDeps(r).includes(id) || (into === 'rev' && /^(tk_|snack|bag)/.test(id)) || (into === 'cost' && /^(fuel|run|term|stock|crew|day|event)/.test(id))); };
  const chain = [row.id]; if(row.id !== 'rev' && has('rev') && dep('rev', row.id)) chain.push('rev'); else if(row.id !== 'cost' && has('cost') && dep('cost', row.id)) chain.push('cost');
  if(row.id !== 'profit' && has('profit')) chain.push('profit');
  const ri = rows.findIndex(r => r.id === row.id), mine = t.done[cellId(col.id, row.id)] || cellState(t, col, ri) === 'done';
  const name = id => { const r = rows.find(x => x.id === id); return String(r ? rowLabel(t, r) : id).replace(/ ticket revenue$/i, ' tickets'); };
  return chain.map((id, i) => { const v = i === 0 ? (mine ? fmtVal(row.unit, V[row.id]) : null) : val(id);
    return `${i ? '<i class="wio2-link" aria-hidden="true"></i>' : ''}<div class="wio2-box ${i === 0 ? (mine ? 'done' : 'q') : ''}"><span>${esc(name(id))}</span><b>${i === 0 && !mine ? '?' : esc(v || '·')}</b></div>`; }).join(''); }

/* ---------- event sums: rows of ten ---------- */
function wio2Ten(t){
  const E = wio2TenData(t); if(!E) return '';
  const n = Math.round(E.people), k = Math.round(E.share * 10), rowsN = Math.ceil(n / 10), biz = E.kind === 'weekend', W = 470, H = 176, dx = 30, x0 = 140, y0 = 52, dy = Math.min(44, (H - 76) / Math.max(1, rowsN - 1 || 1));
  const body = biz ? '#36c6ff' : '#9fb3cf', head = '#c4d4ea';
  let figs = '';
  for(let i = 0; i < n; i++){ const r = Math.floor(i / 10), c = i % 10, x = x0 + c * dx, y = y0 + r * dy, lit = c < k;
    figs += `<g transform="translate(${x} ${y})" opacity="${lit ? 1 : .45}"><circle cx="0" cy="-4" r="4.4" fill="${head}"/><rect x="-5.5" y="1.5" width="11" height="15" rx="3" fill="${body}"/><rect x="-4.6" y="15" width="3.6" height="10" fill="${biz ? '#1c6fa0' : '#6f86a8'}"/><rect x="1" y="15" width="3.6" height="10" fill="${biz ? '#1c6fa0' : '#6f86a8'}"/></g>`; }
  for(let r = 0; r < rowsN; r++) figs += `<text x="${x0 - 30}" y="${y0 + r * dy + 14}" text-anchor="end" font-size="13" fill="#9fbde3">${Math.min(10, n - r * 10)}</text>`;
  const bx1 = x0 - 9, bx2 = x0 + (k - 1) * dx + 9, by = y0 - 22, lab = `${k} in every 10 = ${(k / 10).toFixed(1).replace(/^0\./, '0.')}`;
  const bracket = k > 0 ? `<path d="M${bx1} ${by + 6} L${bx1} ${by} L${bx2} ${by} L${bx2} ${by + 6}" fill="none" stroke="#36c6ff" stroke-width="1.6"/><text x="${(bx1 + bx2) / 2}" y="${by - 7}" text-anchor="middle" font-size="13" font-weight="700" fill="#36c6ff">${lab}</text>` : '';
  const dayName = WDAY_LONG ? WDAY_LONG[calDate(E.day).getUTCDay()] : 'Saturday';
  const lead = biz ? `${num(n)} business travellers` : `${num(n)} want to fly at ${money(E.fare)}`;
  const cap = biz ? `On a ${dayName}, ${k} in every 10 fly.` : `${WORLD.rival || 'Red Kite Air'}'s ${money(E.rival)} pulls ${10 - k} in every 10 away.`;
  const extra = biz && E.plane ? `<small>${esc(E.r.city)} · ${money(E.fare)} · ${esc(shortPlane(E.plane))}, ${num(E.plane.seats)} seats</small>` : '';
  return `<section class="wio2-ten bv-panel support" aria-label="${esc(`${lead}. ${cap}`)}"><svg viewBox="0 0 ${W} ${H}" class="wio2-tensvg" font-family="Segoe UI Variable Text, Segoe UI, system-ui, sans-serif" aria-hidden="true">${bracket}${figs}</svg>
    <div class="wio2-tent"><b>${esc(lead)}</b><span>${esc(cap)}</span>${biz ? extra : `<i class="wio2-kite">${typeof EV2_KITE !== 'undefined' ? EV2_KITE : ''}</i>`}</div></section>`; }
const WDAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* ---------- the page ---------- */
function wio2Page(){
  if(!wio2On()) return;
  const root = screen(), ws = root.querySelector('.ws.ws-workings.bv-wio'); if(!ws || ws.querySelector(':scope > aside.dock-sum')) return;   // the worked example keeps its panel
  const plw = ws.querySelector('.plw'), sheetp = plw && plw.querySelector(':scope > .sheetp'), t = currentTable(); if(!plw || !sheetp || !t) return;
  ws.classList.add('wio2');
  // nothing under the working panel: the route strips, the timetable and the plan strip go
  [...plw.children].forEach(x => { if(!x.matches('.sheetp, .sh-work, .so-board-note, .wk-pick, .ds-pick')) x.remove(); });
  const a = t.active, jd = UI.justDone && UI.justDone.table === t.id ? UI.justDone.cell.split('|') : null, cid = a ? a.col : jd && jd[0], rid = a ? a.row : jd && jd[1];
  const col = cid && t.cols.find(c => c.id === cid), row = rid && tRows(t).find(r => r.id === rid);
  if(/^tenths:/.test(t.id)){ ws.classList.add('wio2-ev'); const ten = wio2Ten(t); if(ten){ sheetp.insertAdjacentHTML('beforebegin', ten); sheetp.remove(); } return; }
  // the sheet as one object: the plan in its header; the totals ruled; the working row lit
  const tbl = sheetp.querySelector('.sheet1.now table.fx'), head = sheetp.querySelector('.pnl-h');
  if(tbl && tbl.classList.contains('one')){ const th = tbl.querySelector('thead th:not(:first-child)'), small = th && th.querySelector('small'); if(head && small && !head.querySelector('.wio2-plan')){ const m = head.querySelector('.muted'); if(m) m.remove(); head.insertAdjacentHTML('beforeend', `<span class="wio2-plan">${esc((th.querySelector('b') || {}).textContent || 'Your plan')}: ${esc(small.textContent)}</span>`); } tbl.classList.add('wio2-one'); }
  if(tbl){ const trs = [...tbl.querySelectorAll('tbody tr')]; const lab = tr => (tr.querySelector('th') || {}).textContent || '';
    const tr1 = trs.find(tr => /^Total revenue/.test(lab(tr))), trP = trs.find(tr => /^Profit\b/.test(lab(tr))); if(tr1) tr1.classList.add('wio2-rule'); if(trP) trP.classList.add('wio2-dbl'); }
  if(!col || !row) return;
  // the margins
  const grid = document.createElement('div'); grid.className = 'wio2-grid'; plw.parentNode.insertBefore(grid, plw);
  grid.insertAdjacentHTML('beforeend', `<aside class="wio2-m wio2-from" aria-label="Where the figures come from"><span class="bv-eyebrow">Where it comes from</span>${wio2From(t, col, row)}</aside>`);
  grid.appendChild(plw);
  grid.insertAdjacentHTML('beforeend', `<aside class="wio2-m wio2-to" aria-label="Where the answer goes"><span class="bv-eyebrow">Where it goes</span>${wio2To(t, col, row)}</aside>`);
  // the reference card (ways to set it out) waits in the right margin, so the working panel fits the page
  const ref = plw.querySelector('.sh-work .pq-ref'), to = grid.querySelector('.wio2-to'); if(ref && to) to.appendChild(ref);
}
const wio2Render0 = render;
render = function(){ const r = wio2Render0.apply(this, arguments); try{ wio2Page(); }catch(e){ console.error(e); } return r; };
