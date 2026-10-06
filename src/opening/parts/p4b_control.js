
/* ==================================================================
   CONTROL WINDOW RENDERERS — HQ desk, task cards, one decision per screen
   ================================================================== */
const screen = () => $('screen');
function setLivery(){ document.documentElement.style.setProperty('--c1', S.airline.c1); document.documentElement.style.setProperty('--c2', S.airline.c2); const f = $('cFin'); if(f) f.setAttribute('href', '#fin-'+(S.airline.fin||'stripe')); const g = $('dFin'); if(g) g.setAttribute('href', '#fin-'+(S.airline.fin||'stripe')); }
function header(title, sayText, status){ status = status || roundLabel(); status = status.charAt(0) + status.slice(1).toLowerCase(); return `<div class="screen-title" data-status="${status}"><h2>${title}</h2>${sayText ? sayBtn(sayText) : ''}</div>`; }
function factsHtml(list){ return `<div class="facts">${list.map(([l,v,c]) => `<div class="fact"><span class="label">${l}</span><div class="v ${c||''}">${v}</div></div>`).join('')}</div>`; }
function on(id, fn){ const e = $(id); if(e) e.onclick = fn; }
function roundLabel(){ if(S.phase==='setup') return 'Launch day'; const P = S.period; if(!P || P.type === 'day') return dateShort() + ' · Day ' + S.day; if(P.type === 'gap') return fmtRange(P.from, P.to); if(P.type === 'week') return periodTag() + ' · ' + fmtRange(P.from, P.to); return periodTag() + ' · ' + periodLabel(P); }

const FOCUS_STEPS = ['boot','strategy','plane','newRoute','results','route','setupFuel','setupPrice','choice','fare','trips','day','fuel','cabin','quick','challenge','challengeCalc'];
function applyTextSize(){ const z = [1, 1.12, 1.25][S.textSize || 0] || 1; document.documentElement.style.setProperty('--tz', z); }
function render(){
  if(IS_DISPLAY) return;
  syncRoutesToHome();
  if(!repLive() && S.rep !== WORLD.startingReputation) S.rep = WORLD.startingReputation;   // reputation is switched off for now
  document.body.classList.toggle('norep', !repLive());
  setLivery(); applyTextSize();
  updateTopBar();
  const st = step();
  document.body.classList.toggle('focus', !!(S.overlay ? S.overlay.type === 'planeTable' || S.overlay.type === 'newPlane' : FOCUS_STEPS.includes(st.t)));
  document.body.classList.toggle('hqmode', !S.overlay && SHELL_STEPS.includes(st.t));
  if(!(!S.overlay && st.t === 'hq') && hqMap){ hqMap.destroy(); hqMap = null; }
  if(S.overlay) renderOverlay(); else if(!shellView(st)) (R[st.t] || R.missing)(st);
  afterRender();
  updateStrip(); publish(); testTick();
  if(wallView) renderDisplay();
}

const R = {};
R.missing = st => { screen().innerHTML = `<div class="card">Unknown screen "${esc(st.t)}". <button class="btn" id="nx">Continue</button></div>`; on('nx', next); };

/* ----- main menu ----- */
R.welcome = () => {
  const runs = loadRuns().sort((a,b)=>b.cash-a.cash), saved = load(), cont = saved && saved.airline && saved.airline.name && saved !== S && saved.startedAt !== S.startedAt;
  screen().innerHTML = `<div class="hero"><h1 class="biglogo"><span class="a">AIRLINE</span><span class="b">SIM</span></h1><div class="boot">&gt; Tower online. Awaiting airline registration</div></div>
    <div class="card stack" style="align-items:center;text-align:center;padding:36px">
    <p class="lede">Run your own airline. Plan the flights. Set the fares. See what happens.</p><p class="proto-tag">Opening prototype · Launch day to Day 3</p>
    <div class="row" style="justify-content:center">${cont?`<button class="btn primary big" id="cont">Continue: ${esc(saved.airline.name)}</button>`:''}<button class="btn ${cont?'':'primary'} big" id="start">New game</button>${runs.length?'<button class="btn big" id="best">Best runs</button>':''}</div>
    <p class="small muted">World: <b>${esc(WORLD.name)}</b> &middot; Starting cash ${money(settings.startingCash)}</p>
  </div>`;
  on('cont', () => { S = saved; render(); });
  on('start', () => { S.cash = settings.startingCash; next(); });
  on('best', () => showRuns());
};
function newGame(){
  if(S.airline.name && (S.round > 0 || S.fleet.length)){ if(!confirm('Are you sure? This starts from scratch. The current run will be recorded in Best runs first.')) return; recordRun(); }
  S = newState(); S.si = 1; render();
}
function openMenu(){ S.overlay = {type:'menu'}; render(); }

/* ----- setup ----- */
R.name = () => {
  screen().innerHTML = `<div class="card stack">${header('Name your airline', 'Name your airline.')}
    <input class="name-input" id="nm" maxlength="24" placeholder="e.g. Dragon Air" value="${esc(S.airline.name)}" autocomplete="off">
    <p class="muted">The name goes on every plane, ticket and departure board.</p>
    <div class="actions"><button class="btn primary big" id="nx" ${S.airline.name.trim()?'':'disabled'}>Next &#9654;</button></div></div>`;
  const nm = $('nm');
  nm.oninput = () => { S.airline.name = nm.value; S.airline.code = airlineCode(nm.value||'AS'); $('nx').disabled = !nm.value.trim(); $('cName').textContent = nm.value.toUpperCase()||'AIRLINE SIMULATOR'; };
  nm.onkeydown = e => { if(e.key === 'Enter' && nm.value.trim()) $('nx').click(); };
  on('nx', () => { S.airline.name = S.airline.name.trim(); S.airline.code = airlineCode(S.airline.name); next(); });
  setTimeout(() => nm.focus(), 30);
};
/* A cabin seen from above: seats across each row, rows along the plane. */
function cabinSvg(st){
  const W = 320, H = 120, x0 = 54, x1 = 270, n = st.seats, R = st.rows, pitch = (x1 - x0) / R, aisle = 14, top = 26, bot = 94, across = (bot - top - aisle) / n, sw = Math.min(pitch * 0.66, 44), left = Math.ceil(n / 2);
  let g = `<path class="cab-body" d="M30 20 H262 Q306 20 312 60 Q306 100 262 100 H30 Q14 100 14 60 Q14 20 30 20 Z"/>`;
  for(let r = 0; r < R; r++){ const x = x0 + r * pitch + (pitch - sw) / 2;
    for(let k = 0; k < n; k++){ const y = top + k * across + (k >= left ? aisle : 0) + 1.5, h = across - 3;
      g += `<rect class="cab-seat" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${sw.toFixed(1)}" height="${h.toFixed(1)}" rx="3"/><rect class="cab-back" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(sw*0.24).toFixed(1)}" height="${h.toFixed(1)}" rx="2"/>`; } }
  return `<svg class="cabin" viewBox="0 0 ${W} ${H}" aria-hidden="true">${g}</svg>`;
}
function meter(n, of, on, off){ return Array.from({ length: of }, (_, i) => `<i class="${i < n ? 'on' : ''}">${i < n ? on : off}</i>`).join(''); }
/* "What kind of airline do you want to build?": the business strategy, chosen before the brand. */
R.strategy = () => {
  const cur = S.airline.strategy, pick = STRATEGIES.find(x => x.id === cur);
  screen().innerHTML = taskFrame({ title:'Airline strategy', question:'What kind of airline do you want to build?', work:false,
    story:['Every airline makes money a different way. Choose the one you want to run.'],
    say:'What kind of airline do you want to build? ' + STRATEGIES.map(x => `${x.name}: ${x.slogan}. ${x.text}`).join(' '),
    main:`<div class="strats ${pick ? 'has-pick' : ''}">${STRATEGIES.map(x => `<button class="strat ${cur === x.id ? 'on' : ''}" data-st="${x.id}" aria-pressed="${cur === x.id}">
      <span class="st-name">${esc(x.name)}</span>${cur === x.id ? '<span class="st-on">&#10003; Selected</span>' : ''}<b class="st-slogan">${esc(x.slogan)}</b><span class="st-tags">${x.tags.map(esc).join(' · ')}</span>
      ${cabinSvg(x)}
      <span class="st-meters">${[['Fare level', 'm-fare', meter(x.fares, 3, '£', '£')], ['Service level', 'm-star', meter(x.service, 5, '★', '★')], ['Passenger volume', 'm-vol', meter(x.volume, 4, '●', '○')]].map(([l, c, m], i) => `<span><small>${l}<em>${esc((x.levels || [])[i] || '')}</em></small><b class="${c}">${m}</b></span>`).join('')}</span>
      <span class="st-text">${esc(x.text)}</span></button>`).join('')}</div>`,
    foot:`<button class="btn primary big" id="nx" ${pick ? '' : 'disabled'}>${pick ? `Build a ${esc(pick.name.toLowerCase())} airline` : 'Choose a strategy'} &#9654;</button>` });
  screen().querySelectorAll('[data-st]').forEach(b => b.onclick = () => { S.airline.strategy = b.getAttribute('data-st'); render(); });
  on('nx', next);
};
R.fin = () => {
  screen().innerHTML = `<div class="card stack">${header('Paint your planes', 'Choose two colours and a symbol for the tail fin.')}
    <div class="livery">
      <div class="stack"><span class="label">Main colour</span><div class="swatches" id="sw1">${SWATCHES.map(c=>`<button class="sw ${c===S.airline.c1?'on':''}" style="background:${c}" data-c="${c}" aria-label="colour"></button>`).join('')}</div>
        <span class="label">Second colour</span><div class="swatches" id="sw2">${SWATCHES.map(c=>`<button class="sw ${c===S.airline.c2?'on':''}" style="background:${c}" data-c="${c}" aria-label="colour"></button>`).join('')}</div></div>
      <div class="livery-preview"><div class="lp-art"><svg class="preview-plane" viewBox="0 0 120 48" style="fill:var(--c1)"><use href="#pl-jet"/></svg>${finSvg(S.airline.fin, 64)}</div><span class="lp-name">${esc(S.airline.name.toUpperCase())}</span>${strategyBadge()}</div></div>
    <span class="label">Tail fin</span>
    <div class="options fins">${FINS.map(f=>`<button class="opt ${S.airline.fin===f.id?'on':''}" data-fin="${f.id}">${finSvg(f.id, 72)}<span class="sub">${esc(f.name)}</span></button>`).join('')}</div>
    <div class="actions">${backBtn()}<button class="btn primary big" id="nx">Next &#9654;</button></div></div>`;
  ['sw1','sw2'].forEach((id,i) => $(id).querySelectorAll('.sw').forEach(b => b.onclick = () => { S.airline[i?'c2':'c1'] = b.getAttribute('data-c'); setLivery(); $(id).querySelectorAll('.sw').forEach(x=>x.classList.toggle('on', x===b)); }));
  screen().querySelectorAll('[data-fin]').forEach(b => b.onclick = () => { S.airline.fin = b.getAttribute('data-fin'); render(); });
  on('nx', next);
};
function strategyBadge(){ const x = strategyOf(); return x ? `<span class="sbadge ${x.id}">${esc(x.badge)}</span>` : ''; }
R.home = () => {
  screen().innerHTML = `<div class="card stack">${header('Choose your home airport', 'Choose your home airport. Every flight pays a landing fee. Busy airports cost more but bring more passengers.')}
    <p class="lede">Every flight pays a <b>landing fee</b> at home. Busier airports charge more, but more people fly from them.</p>
    <div class="options">${WORLD.homes.map(h=>`<button class="opt ${S.home===h.id?'on':''}" data-h="${h.id}"><span class="row">${flagSvg(h.flag,26)}<span class="big" style="font-size:24px">${esc(h.city)}</span></span><span class="sub">${esc(h.blurb)}</span><span class="row small" style="gap:16px"><span>Landing fee <b class="num" style="color:var(--white)">${money(h.fee)}</b> a flight</span><span>Passengers <b class="num" style="color:var(--white)">${h.demandPct>0?'+':''}${h.demandPct}%</b></span></span></button>`).join('')}</div>
    <div class="actions"><button class="btn primary big" id="nx">Make it home &#9654;</button></div></div>`;
  screen().querySelectorAll('[data-h]').forEach(b => b.onclick = () => { S.home = b.getAttribute('data-h'); render(); });
  on('nx', next);
};
function planeCard(p, opts){
  const afford = S.cash >= p.price, owned = S.fleet.filter(f=>f.planeId===p.id).length;
  return `<div class="plane-card ${afford?'afford':''} ${owned?'owned':''}">
    <span class="tier">${esc(p.tier)}${owned?` &middot; you own ${owned}`:''}</span>
    <div class="row"><span class="nm grow">${esc(p.name)}</span>${planeSvg(p)}</div>
    <div class="pr ${afford?'':'cant'}">${money(p.price)}</div>
    <div class="specs"><span>Seats <b>${p.seats}</b></span><span>Speed <b>${num(p.speed)} km/h</b></span><span>Range <b>${num(p.range)} km</b></span><span>Cost per flight <b>${money(p.runCost)}</b></span><span>Fuel <b>${p.fuelUse} L</b> per 100 km</span><span>Tank space <b>+${num(p.tankAdd||0)} L</b></span><span>Flies <b>${p.range>=9000?'long':p.range>=4000?'medium':'short'}</b> routes</span></div>
    <p class="small muted">${esc(p.fact)}</p>
    ${opts.buy ? `<button class="btn ${afford?'primary':'dim'}" data-buy="${p.id}" ${afford?'':'disabled'}>${afford?'Buy':'Save up — need '+money(p.price-S.cash)+' more'}</button>` : ''}
    ${opts.compare ? `<button class="btn ${opts.compare.includes(p.id)?'primary':''}" data-cmp="${p.id}" aria-pressed="${opts.compare.includes(p.id)}">${opts.compare.includes(p.id)?'✓ In the forecast':'Add to the forecast'}</button>` : ''}
  </div>`;
}
R.shop = () => {
  screen().innerHTML = `<div class="card stack">${header('Buy your first plane', 'Buy your first plane. You can only afford the cheapest for now, but have a look at the whole shop.')}
    <p class="lede">You have <b class="amber mono">${money(S.cash)}</b>. Green cards are ones you can afford.</p>
    <div class="shop">${PLANES.map(p => planeCard(p, {buy:true})).join('')}</div></div>`;
  screen().querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { const p = planeById(b.getAttribute('data-buy')); buyPlane(p); toast(`${p.name} bought!`); next(); });
};

/* ==================================================================
   SHARED PIECES: demand picture, fuel tank, day timeline
   ================================================================== */
function paxIcon(cls){ return `<svg class="px ${cls}" viewBox="0 0 10 16" aria-hidden="true"><use href="#pax"/></svg>`; }
/* B1: people as icons, one bracket per plane-load, extra people greyed "left behind". */
function demandViz(people, seats, trips, title){
  const I = WORLD.icons || {perIcon:1, bigAt:150, bigPerIcon:10};
  const per = people > I.bigAt ? I.bigPerIcon : I.perIcon, loads = trips === undefined ? Math.max(1, Math.ceil(people/seats)) : trips;
  let left = people, html = '';
  for(let k=0;k<loads;k++){ const carry = Math.min(seats, left); left -= carry; const slots = Math.ceil(seats/per), filled = Math.ceil(carry/per);
    html += `<span class="load"><span class="icons">${Array.from({length:slots}, (_,i) => paxIcon(i < filled ? 'on' : 'empty')).join('')}</span><i>trip ${k+1} · ${carry}</i></span>`; }
  if(left > 0) html += `<span class="load left"><span class="icons">${Array.from({length:Math.ceil(left/per)}, () => paxIcon('off')).join('')}</span><i>left behind · ${left}</i></span>`;
  const label = trips === undefined ? `${num(people)} people · ${seats} seats a trip` : `${num(people)} people · ${plural(trips,'trip')} of ${seats}`;
  return `<div class="dviz">${title?`<span class="label">${title}</span>`:''}<div class="loads">${html}</div><div class="small muted">${label}${per>1?` · <span class="pxkey">${paxIcon('on')} = ${per} people</span>`:''}</div></div>`;
}
/* B4: the tank. Fill = fuel held; the part today's plan uses is marked. CR4: a ghost fill shows fuel he might buy; the warning shows only on the plan screen. */
function tankGauge(o){
  o = o || {}; const cap = tankCapacity(), fuel = Math.min(S.fuel, cap), need = o.need === undefined ? fuelNeeded() : o.need;
  const used = Math.min(need, fuel), over = Math.max(0, need - fuel), ghost = Math.max(0, Math.min(o.ghost || 0, cap - fuel)), pct = v => (100*v/cap).toFixed(2);
  return `<div class="tank ${o.compact?'compact':''}">
    <div class="row spread"><span class="label">Fuel tank</span><span class="muted">${num(S.fuel)} L${ghost ? ` + ${num(ghost)} L` : ''} of ${num(cap)} L</span></div>
    <div class="tank-bar"><i class="keep" style="width:${pct(fuel-used)}%"></i><i class="use" style="left:${pct(fuel-used)}%;width:${pct(used)}%"></i>${ghost ? `<i class="ghost" style="left:${pct(fuel)}%;width:${pct(ghost)}%"></i>` : ''}</div>
    ${need ? `<div class="muted tank-note"><i class="key-use"></i> today's trips use ${num(need)} L</div>` : ''}
    ${o.warn && over > 0 ? `<div class="red">Not enough fuel for today's trips: ${num(over)} L short.</div>` : ''}
  </div>`;
}
/* D1 (shown mode, built now on the Stage A time module): blocks for out, turnaround, back and home turnaround. */
function dayTimeline(plane, sched, o){
  o = o || {}; const D = TIME.day(plane, sched), s0 = dayStart(), e0 = dayEnd(), span = e0 - s0, X = m => clamp(100*(m - s0)/span, 0, 100);
  let ticks = ''; for(let m = s0; m <= e0; m += 120) ticks += `<span style="left:${X(m)}%">${fmtTime(m)}</span>`;
  const segs = D.segments.map(sg => { const l = X(sg.start), w = Math.max(0.4, X(sg.end) - l); return w > 0 ? `<i class="seg ${sg.kind}" style="left:${l}%;width:${w}%" title="${sg.kind} ${fmtTime(sg.start)}–${fmtTime(sg.end)}"></i>` : ''; }).join('');
  const over = D.end > e0 && sched.length ? `<i class="seg overrun" style="left:${X(Math.max(D.start, e0))}%;width:${100 - X(Math.max(D.start, e0))}%"></i>` : '';
  const list = o.compact ? '' : `<div class="tl-list">${D.trips.map(tr => `<span><b class="mono">${fmtTime(tr.dep)}</b> ${esc(routeById(tr.route).city)} <span class="muted">· back ${fmtTimeDay(tr.arr)}</span></span>`).join('')}</div>`;
  return `<div class="tl ${o.compact?'compact':''}"><div class="tl-axis">${ticks}</div><div class="tl-bar">${segs}${over}</div>${list}${D.end > e0 && sched.length ? `<div class="small red">Runs past closing time (${fmtTime(e0)}).</div>` : ''}${o.compact ? '' : `<div class="tl-key"><span><i class="seg out"></i> flying</span><span><i class="seg turn"></i> turnaround</span></div>`}</div>`;
}

/* ==================================================================
   FORECAST TABLE (CR4 s3): the whole table stays visible; the open sum's
   numbers are outlined; the sum is said in words in the same colours.
   ================================================================== */
const UI = { tickOpen:{}, entry:'', msg:'', ok:false, picks:[], op:null, explain:null, tries:0 };   // on-screen only, never saved
function resetEntry(){ UI.entry = ''; UI.msg = ''; UI.ok = false; UI.picks = []; UI.op = null; UI.tries = 0; }
function opsFor(t){ if(!t.active) return []; const row = tRows(t).find(r => r.id === t.active.row); return row && row.from && (t.mode !== 'choose' || t.chosen[cellId(t.active.col, t.active.row)]) ? row.from : []; }
function sentenceHtml(t, col, row){
  return (row.sentence || '').replace(/\{(\?)?(\w+)\}/g, (m, q, id) => {
    const u = operandUnit(t, id), v = fmtVal(u, col.values[id]);
    if(!q) return `<span class="s-op">${v}</span>`;
    if(t.active && t.active.col === col.id && t.active.row === id) return `<span class="s-ans">${esc(UI.entry) || '?'}</span>`;
    return t.done[cellId(col.id, id)] ? `<span class="s-done">${v}</span>` : `<span class="s-q">?</span>`;
  });
}
function tableHtml(t, o){
  o = o || {};
  const rows = tRows(t), def = TABLES[t.kind], act = t.active, ops = opsFor(t), choosing = act && t.mode === 'choose' && !t.chosen[cellId(act.col, act.row)];
  let h = `<div class="ft2 ${act ? 'is-active' : ''}"><table class="fx ${t.cols.length === 1 ? 'one' : ''} ${tRows(t).length > 6 && (innerHeight < 900 || t.kind === 'options') ? 'dense' : ''}"><thead><tr><th></th>`;
  t.cols.forEach(c => { h += `<th class="${t.picked===c.id?'picked':''} ${act && act.col!==c.id ? 'dim' : ''}">${c.flag?flagSvg(c.flag,26):''}<b>${esc(c.label)}</b>${c.sub?`<small>${esc(c.sub)}</small>`:''}${c.headHtml || ''}</th>`; });
  h += `</tr></thead><tbody>`;
  rows.forEach((r, ri) => {
    const rowActive = act && act.row === r.id;
    const exCol = r.explain && t.cols.find(c => c.parts && c.parts[r.id]);
    h += `<tr class="${rowActive ? 'row-on' : ''} ${r.total ? 'tot' : ''}"><th scope="row" class="${act && !rowActive && !ops.includes(r.id) ? 'dim' : ''}">${esc(rowLabel(t, r))}${exCol ? ` <button class="link" data-explain="${cellId(exCol.id, r.id)}">What's in this?</button>` : ''}</th>`;
    t.cols.forEach(c => {
      const st = cellState(t, c, ri), v = c.values[r.id], id = cellId(c.id, r.id), on = act && act.col === c.id && act.row === r.id;
      const isOp = act && act.col === c.id && (ops.includes(r.id) || (choosing && UI.picks.includes(r.id)));
      const cls = `${on ? 'on' : ''} ${isOp ? 'opd' : ''} ${act && !on && !isOp ? 'dim' : ''} ${choosing && act.col === c.id && ['given','derived','done','tick'].includes(st) ? 'pickable' : ''}`;
      if(st === 'given' || st === 'derived' || st === 'done') h += `<td class="c ${st} ${cls}" data-cellv="${id}"><span>${fmtVal(r.unit, v)}</span>${st === 'derived' && r.tool && toolLevel(r.tool) === 'model' ? `<button class="mdl" data-fx="${t.id}|${c.id}|${r.id}" title="Worked out by the model: show how">ƒ model</button>` : ''}</td>`;
      else if(st === 'wait') h += `<td class="c wait ${cls}"><span>·</span></td>`;
      else if(st === 'enter') h += `<td class="c enter ${cls}"><button data-cell="${id}">${on ? (UI.entry ? esc(UI.entry) : 'Completing…') : 'Complete figure'}</button></td>`;
      else { const open = UI.tickOpen[t.id+'|'+id]; h += `<td class="c tick ${cls}"><button data-tick="${id}">✓ ${fmtVal(r.unit, v)}</button>${open ? `<small>${esc(TEXT.finance)}: ${esc(cellExplain(t, c, r))}</small>` : ''}</td>`; }
    });
    h += `</tr>`;
  });
  h += `</tbody>`;
  h += `</table>`;
  if(UI.explain){ const [cid, rid] = UI.explain.split('|'), c = t.cols.find(x => x.id === cid); if(c && c.parts && c.parts[rid]) h += `<div class="explain"><b>${esc(rowLabel(t, tRows(t).find(r => r.id === rid)))}: ${fmtVal('£', c.values[rid])}</b>${c.parts[rid].map(([l, v]) => `<span>${esc(l)} <b>${v}</b></span>`).join('<i>+</i>')}<button class="link" data-explain="">Close</button></div>`; }
  return h + `</div>`;
}
/* Once every sum is done, the side panel holds the choice itself. */
function pickPanel(t, o){
  const def = TABLES[t.kind];
  return `<div class="side2 picks"><p class="say-it">${esc(o.pickQ || ({price:'Which price will you choose?', cabin:'Which seat layout will you choose?', plane:'Which plane will you buy?', days:'Which day will you fly?'})[t.kind] || 'Which will you choose?')}</p>${t.cols.map(c => c.disabled ? `<div class="muted">${esc(c.label)}: ${esc(c.disabled)}</div>` : `<button class="btn primary big" data-pick="${c.id}">${esc((o.pickLabel || def.pickLabel || 'Choose {col}').replace('{col}', c.label))}</button>`).join('')}</div>`;
}
function sideHtml(t, o){
  const a = t.active; if(!a) return o && o.onPick && tableComplete(t) ? pickPanel(t, o) : '';
  const col = t.cols.find(c => c.id === a.col), row = tRows(t).find(r => r.id === a.row), cid = cellId(a.col, a.row);
  if(t.mode === 'choose' && row.op && !t.chosen[cid]){
    return `<div class="side2"><p class="say-it">Which two numbers make the <b>${esc(rowLabel(t, row).toLowerCase())}</b>?</p><p class="muted">Tap them in the table, then tap the sign.</p>
      <div class="ops">${['+','−','×','÷'].concat(row.op === 'min' ? ['min'] : []).map(op => `<button class="op ${UI.op===op?'on':''}" data-op="${op}">${op === 'min' ? 'smaller' : op}</button>`).join('')}</div>
      <div class="sumline">${UI.picks[0] ? fmtVal(operandUnit(t, UI.picks[0]), col.values[UI.picks[0]]) : '?'} ${UI.op ? (UI.op==='min'?'or':UI.op) : '?'} ${UI.picks[1] ? fmtVal(operandUnit(t, UI.picks[1]), col.values[UI.picks[1]]) : '?'}</div>
      <button class="btn primary big" id="trySum" ${UI.picks.length===2 && UI.op ? '' : 'disabled'}>That's my sum</button><div class="msg" id="ftMsg">${esc(UI.msg||'')}</div></div>`;
  }
  return `<div class="side2"><p class="say-it">${sentenceHtml(t, col, row)}</p>
    <div class="answer"><span class="unit">${row.unit === '£' ? '£' : ''}</span><input id="cellAns" inputmode="decimal" autocomplete="off" value="${esc(UI.entry)}" aria-label="${esc(rowLabel(t, row))}"></div>
    <button class="btn primary big" id="cellCheck">Confirm figure</button>
    <div class="msg ${UI.ok?'ok':''}" id="ftMsg">${esc(UI.msg||'')}</div></div>`;
}
function setActive(t, cell){ t.active = cell; S.rnd.activeTable = t.id; resetEntry(); }
function cellCorrect(t, byTeacher){
  const prev = t.active; t.done[cellId(prev.col, prev.row)] = true; if(!byTeacher) countTyped();
  resetEntry(); t.active = null; UI.justDone = { table:t.id, cell:cellId(prev.col, prev.row) };
  publish();
}
function cellWrong(res){ const k = (UI.tries = (UI.tries||0) + 1); let m = TEXT.retry[(k-1) % TEXT.retry.length]; if(res === 'blank') m = 'Enter a figure first.'; else if(settings.nudge) m += ' ' + (res === 'high' ? TEXT.nudgeHigh : TEXT.nudgeLow); UI.msg = m; UI.ok = false; }
function bindTable(t, o){
  o = o || {}; const rerender = () => render();
  screen().querySelectorAll('[data-cell]').forEach(b => b.onclick = () => { const [col, row] = b.getAttribute('data-cell').split('|'); setActive(t, {col, row}); UI.justDone = null; if(UI.dock) UI.dock.mode = null; publish(); rerender(); });
  screen().querySelectorAll('[data-tick]').forEach(b => b.onclick = () => { const k = t.id+'|'+b.getAttribute('data-tick'); UI.tickOpen[k] = !UI.tickOpen[k]; rerender(); });
  screen().querySelectorAll('[data-explain]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.getAttribute('data-explain'); UI.explain = k && UI.explain !== k ? k : null; rerender(); });
  screen().querySelectorAll('[data-pick]').forEach(b => b.onclick = () => { const c = t.cols.find(x => x.id === b.getAttribute('data-pick')); if(!c || c.disabled || !tableComplete(t)) return; t.picked = c.id; o.onPick && o.onPick(c); });
  if(!t.active) return;
  const col = t.cols.find(c => c.id === t.active.col), row = tRows(t).find(r => r.id === t.active.row);
  // choose the sum: tap numbers in the table itself
  screen().querySelectorAll('td.pickable[data-cellv]').forEach(td => td.onclick = () => { const id = td.getAttribute('data-cellv').split('|')[1]; if(UI.picks.includes(id)) UI.picks = UI.picks.filter(x => x !== id); else if(UI.picks.length < 2) UI.picks.push(id); UI.msg = ''; rerender(); });
  screen().querySelectorAll('[data-op]').forEach(b => b.onclick = () => { UI.op = b.getAttribute('data-op'); UI.msg = ''; rerender(); });
  screen().querySelectorAll('[data-pk]').forEach(b => b.onclick = () => { const id = b.getAttribute('data-pk'); if(UI.picks.includes(id)) UI.picks = UI.picks.filter(x => x !== id); else if(UI.picks.length < 2) UI.picks.push(id); UI.msg = ''; rerender(); });
  on('trySum', () => { if(checkPair(row, UI.picks, UI.op)){ t.chosen[cellId(col.id, row.id)] = true; tRows(t).filter(r => r.sentence && r.sentence === row.sentence).forEach(r => t.chosen[cellId(col.id, r.id)] = true); UI.picks = []; UI.op = null; UI.msg = ''; if(row.tool && TOOL[row.tool] && toolLevel(row.tool) === 'build'){ cellCorrect(t, true); } } else { UI.msg = TEXT.wrongPair.replace('{row}', rowLabel(t, row).toLowerCase()); UI.picks = []; UI.op = null; } rerender(); });
  const ans = $('cellAns'); if(!ans) return;
  const sync = () => { UI.entry = ans.value; if(UI.msg){ UI.msg = ''; const fm = $('ftMsg'); if(fm){ fm.textContent = ''; fm.classList.remove('ok'); } } const s = screen().querySelector('.s-ans'); if(s) s.textContent = UI.entry || '?'; const b = screen().querySelector('td.enter.on button'); if(b) b.textContent = UI.entry || '?'; };
  ans.oninput = sync;
  ans.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); check(); } };
  screen().querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const k = b.getAttribute('data-k'); if(k === 'back') ans.value = ans.value.slice(0,-1); else ans.value += k; sync(); ans.focus(); });
  function check(){
    // re-read the table now: the answer is always checked against the figure on screen at this moment
    const T = (S.rnd.tables && S.rnd.tables[t.id]) || t, a = T.active, c2 = a && T.cols.find(x => x.id === a.col), r2 = a && tRows(T).find(x => x.id === a.row);
    if(!c2 || !r2){ rerender(); return; }
    if(typeof diagNote === 'function' && (T !== t || cellId(c2.id, r2.id) !== cellId(col.id, row.id) || c2.values[r2.id] !== col.values[row.id])) diagNote({ kind:'answer box out of date', table:t.id, cell:cellId(col.id, row.id), now:cellId(c2.id, r2.id), was:col.values[row.id], is:c2.values[r2.id] });
    const res = checkCell(T, c2, r2, ans.value); if(res === 'ok') cellCorrect(T); else cellWrong(res); rerender(); }
  on('cellCheck', check);
  setTimeout(() => { try{ ans.focus(); }catch(e){} }, 30);
}
function currentTable(){ const t = S.rnd && S.rnd.tables && S.rnd.tables[S.rnd.activeTable]; return t || null; }
function releaseGate(quiet){
  const st = step();
  if(st.t === 'challengeCalc'){ if(!quiet) toast('Released by teacher'); applyReward(S.rnd.challenge); next(); return; }
  const t = currentTable(); if(!t || !t.live || !screen().querySelector('table.fx')){ if(!quiet) toast('No open sum on this screen'); return; }
  if(!t.active) t.active = nextOpenCell(t);
  if(!t.active){ if(!quiet) toast('This table is already complete'); return; }
  t.chosen[cellId(t.active.col, t.active.row)] = true;
  if(!quiet) toast('Released by teacher'); cellCorrect(t, true); render();
}
/* ---------- test mode (device setting or ?test): a TEST bar, and sums that answer themselves ---------- */
const testOn = () => !!(settings.testMode || TEST_URL);
let autoTimer = null;
function openSum(){
  if(S.overlay && S.overlay.type !== 'planeTable') return false;
  if(!S.overlay && step().t === 'challengeCalc') return true;
  if(!S.overlay && !['setupPrice','fare','trips','fuel','cabin','quick','plane','fuelPlan','dayForecast'].includes(step().t)) return false;
  const t = currentTable(); return !!(t && t.live && screen().querySelector('table.fx') && (t.active || nextOpenCell(t)));
}
function testTick(){
  const bar = $('testBar'); if(bar){ bar.hidden = !testOn(); const a = $('tbAuto'); if(a){ a.textContent = 'Auto-answer: ' + (settings.autoAnswer ? 'on' : 'off'); a.setAttribute('aria-pressed', String(!!settings.autoAnswer)); } }
  clearTimeout(autoTimer);
  if(testOn() && settings.autoAnswer && openSum()) autoTimer = setTimeout(() => { if(openSum()) releaseGate(true); }, 700);
}
function fillTable(){ const t = currentTable(); if(!t){ toast('No table open'); return; } t.cols.forEach(c => tRows(t).forEach(r => { t.done[cellId(c.id, r.id)] = true; t.chosen[cellId(c.id, r.id)] = true; })); t.active = null; resetEntry(); toast('Table filled by teacher'); render(); }
function workBtn(){ return `<button class="btn" data-work>✏ Working space</button>`; }
function bindWork(){ screen().querySelectorAll('[data-work]').forEach(b => b.onclick = () => { send({type:'work', open:true}); toast('Working space is open on the board'); }); }

/* ---------- the task frame used by every decision screen (focus mode) ---------- */
const FRAME_TITLES = { route:'Choose a route', setupFuel:'Starting fuel', setupPrice:'Set the ticket price', choice:"Today's decision", fare:'Ticket price', trips:'Trips', day:'Plan the day', fuel:'Buy fuel', cabin:'Seat layout', quick:"Today's income", plane:'Buy a plane', newRoute:'New route', challenge:"Captain's challenge", challengeCalc:"Captain's challenge" };
function frameStatus(){ if(awaitingClearance()) return 'AWAITING CLEARANCE'; return roundLabel().toUpperCase(); }
/* Plan steps sit inside the HQ workspace (plan rail, the task, the money panel); onboarding keeps the full-screen frame. */
function taskFrame(o){ if(S.overlay || !WS_STEPS.includes(step().t)) return taskFrameBase(o); return wsWrap(taskFrameBase(Object.assign({}, o, { side:null, work:false, foot:null, title:wsCrumb(), status:wsStatus() })), o); }
function taskFrameBase(o){
  const title = o.title || (S.overlay ? ({planeTable:'Buy a plane', newPlane:'New route'})[S.overlay.type] : FRAME_TITLES[step().t]) || '';
  return `<div class="tf"><div class="phead tf-bar" data-status="${esc(o.status || frameStatus())}">${esc(title)}</div>
    <div class="tf-top">${o.back ? '<button class="btn" id="tBackBtn">&#9664; Back</button>' : ''}${o.stepMark ? `<span class="step-mark">${o.stepMark}</span>` : ''}<h1 class="tq">${o.question}</h1>${o.say ? sayBtn(o.say) : ''}${o.work === false ? '' : workBtn()}</div>
    ${o.story && o.story.length ? `<div class="tf-story">${o.story.map(l => `<p>${l}</p>`).join('')}</div>` : ''}
    <div class="tf-body ${o.side ? 'with-side' : ''}"><div class="tf-main">${o.main || ''}</div>${o.side ? `<div class="tf-side">${o.side}</div>` : ''}</div>
    ${o.foot ? `<div class="tf-foot">${o.foot}</div>` : ''}
  </div>`;
}
function bindFrame(onBack){ on('tBackBtn', onBack); bindWork(); }
/* Back from a decision screen returns to "What will you do?" until something has been changed. */
function backToChoice(){ const ci = S.steps.findIndex(s => s.t === 'choice'); S.steps = S.steps.slice(0, ci+1).concat(S.steps.slice(ci+1).filter(s => !['fare','trips','day','fuel','cabin','quick','plane','newRoute'].includes(s.t))); S.si = ci; resetEntry(); UI.explain = null; render(); }
function canGoBack(){ return !S.rnd.committed; }
function demandRule(r){ return [`At ${money(r.basePrice)}, ${demandAt(r, r.basePrice)} people want to fly.`, `Each ${money(r.step)} more, ${r.drop} fewer people want to fly.`, `Each ${money(r.step)} less, ${r.drop} more.`]; }
function focusPlane(){ return featuredFleet() || S.fleet[0]; }
function focusRouteId(f){ return (S.rnd.focusRoute && schedOf(f).includes(S.rnd.focusRoute)) ? S.rnd.focusRoute : (schedOf(f)[0] || S.rnd.focusRoute || (f && f.route)); }

/* ==================================================================
   SETUP: route, fuel, price (CR4 s4)
   ================================================================== */
/* A route for a plane: the people who want to fly, minus the ones your other planes already carry. */
function routeCard(r, plane, selected, uid){
  const d = paxFor(r, fareOf(r.id)), carried = uid === undefined || !S.fleet.length ? 0 : planFlights().filter(f => f.route === r.id && f.uid !== uid && !f.grounded).reduce((t, f) => t + f.sold, 0), left = Math.max(0, d - carried);
  return `<button class="choice ${selected?'on':''}" data-r="${r.id}"><span class="row">${flagSvg(r.flag, 30)}<b>${esc(r.city)}</b></span><span>${carried ? `${d} people a day. Your planes already carry ${carried}, so <b>${left}</b> are left.` : esc(r.blurb||'')}</span>${demandViz(left, plane.seats)}</button>`;
}
R.route = () => {
  const f = S.fleet[0], plane = planeById(f.planeId), routes = WORLD.setupRoutes.map(routeById);
  screen().innerHTML = taskFrame({ question:'Where should your first plane fly?', story:['Each little person wants to fly.', `Each box is one plane-load of ${plane.seats}.`], work:false,
    main:`<div class="choices two">${routes.map(r => routeCard(r, plane, f.route===r.id)).join('')}</div>`, foot:`<button class="btn primary big" id="nx" ${f.route?'':'disabled'}>Fly to ${f.route ? esc(routeById(f.route).city) : '…'} &#9654;</button>` });
  screen().querySelectorAll('[data-r]').forEach(b => b.onclick = () => { setSchedule(f.uid, [b.getAttribute('data-r')]); render(); });
  on('nx', () => { S.rnd.featured = f.uid; S.rnd.focusRoute = f.route; S.newRoutes = []; next(); });
};
R.setupFuel = () => {
  const need = fuelNeeded(), opts = [[ceilLot(need), 'Enough for today'], [2000, 'Stock up']];
  screen().innerHTML = taskFrame({ question:'How much fuel will you start with?', story:[`Fuel costs ${priceL(fuelPrice())} a litre today.`, `Today's trip needs ${num(need)} litres.`], work:false,
    main:`<div class="choices two">${opts.map(([l, lab]) => `<button class="choice" data-fuel="${l}"><b>${lab}</b><span>${num(l)} litres · ${money(l*fuelPrice())}</span>${tankGauge({ghost:l, need})}</button>`).join('')}</div>` });
  screen().querySelectorAll('[data-fuel]').forEach(b => b.onclick = () => { const l = parseInt(b.getAttribute('data-fuel'),10); buyFuel(l, fuelPrice()); toast(`${num(l)} litres bought`); next(); });
};
R.setupPrice = () => {
  const f = S.fleet[0], r = routeById(f.route);
  const t = ensureTable('price:setup', 'price', buildPriceCols(f, f.route, { trips:1, prices: r.setupPrices || fareList(r), setup:true }), { context:'setup' });
  screen().innerHTML = taskFrame({ question: TABLES.price.question.replace('{city}', esc(r.city)), story: demandRule(r), say: TABLES.price.question.replace('{city}', r.city) + ' ' + demandRule(r).join(' '),
    main: tableHtml(t, { onPick:true }), side: sideHtml(t, { onPick:true }) });
  bindTable(t, { onPick: c => { S.prices[r.id] = c.fare; resetEntry(); next(); } }); bindWork();
};

/* ==================================================================
   HQ (Step 1 of the HQ / Operations Wall brief): one full-screen dashboard where the pupil thinks and acts.
   Wide screens show every panel; a laptop (under 1600 × 880) pairs the secondary panels as tabs so nothing scrolls.
   ================================================================== */
function hqLayout(){ return innerWidth >= 1600 && innerHeight >= 880 ? 'wide' : 'compact'; }
let hqMap = null;
/* Situations, never solutions: what has changed, not what to do about it. */
function intelSituations(){
  const out = [], h = lastDay();
  ownedRoutes().forEach(id => { const r = routeById(id), c = competitorPrice(r); if(c !== undefined && c < fareOf(id)) out.push({ tag:'RIVAL', text:`${WORLD.rival} is selling ${r.city} tickets for ${money(c)}.` }); });
  if(fuelNeeded() > S.fuel) out.push({ tag:'FUEL', text:"The tank won't cover all of today's planned flights." });
  S.fleet.filter(f => f.grounded).forEach(f => out.push({ tag:'FLEET', text:`${planeById(f.planeId).name} is grounded today.` }));
  if(h && h.routes) Object.keys(h.routes).forEach(id => { const x = h.routes[id]; if(x.seats && x.pax/x.seats < 0.5) out.push({ tag:'LOAD', text:`${routeById(id).city} flights were less than half full in ${periodShort(h)}.` }); });
  return out;
}
function intelItems(){
  const out = [], seen = new Set(), add = x => { if(!seen.has(x.text)){ seen.add(x.text); out.push(x); } };
  protoIntel().forEach(add);
  intelSituations().forEach(x => add(Object.assign({ warn:true }, x)));
  const fp = fuelPrice(), fy = S.round > 1 ? fuelPrice(S.round-1) : null;
  if(fy !== null && fp !== fy) add({ tag:'FUEL', text:`Fuel ${fp > fy ? 'up' : 'down'} to ${priceL(fp)} a litre (was ${priceL(fy)}).`, good: fp < fy });
  (roundData(S.round).news || []).forEach(t => add({ tag:'NEWS', text:fillText(t) }));
  S.log.slice().reverse().forEach(n => add({ tag:n.tag || 'NEWS', text:n.text, good:n.cls === 'good', warn:n.cls === 'warn' && n.round === S.round }));
  return out.slice(0, 12);
}
function hqHead(title, status, extra){ return `<div class="phead" data-status="${esc(status || '')}">${title}${extra || ''}</div>`; }
function trendMark(a, b){ if(b === undefined || b === null || a === undefined) return '<span class="tr flat">–</span>'; return a > b ? '<span class="tr up">▲</span>' : a < b ? '<span class="tr down">▼</span>' : '<span class="tr flat">■</span>'; }
function profitLabel(h){ if(!h) return "Yesterday's profit"; if(h.type === 'setup' || h.from === 0) return 'Launch day profit'; if(h.type === 'day') return h.to === S.day - 1 ? "Yesterday's profit" : `${dayName(h.from)}'s profit`; if(h.type === 'week') return "Last week's profit"; if(h.type === 'gap') return 'Weekend profit'; const n = periodShort(h); return n.charAt(0).toUpperCase() + n.slice(1) + ' profit'; }
function kpiHtml(){
  const H = S.history, h = H[H.length-1], p = H[H.length-2], need = fuelNeeded(), month = periodType() === 'month';
  const card = (cls, label, value, sub, sp) => `<section class="hp kpi ${cls}"><span class="label">${label}</span><b class="kv">${value}</b><span class="ks">${sub}</span>${sp || ''}</section>`;
  const nd = h ? (h.to - h.from + 1) || 1 : 1, sub2 = !h ? 'After the first flight' : p && p.type === h.type && (p.to - p.from) === (h.to - h.from) ? `${trendMark(h.profit, p.profit)} from ${money(p.profit)}` : nd > 1 ? `About ${money(about(h.profit / nd))} a day` : (p ? `${trendMark(h.profit, p.profit)} from ${money(p.profit)}` : '');
  const series = month ? [] : H.slice(-12).map(x => x.profit / Math.max(1, (x.to - x.from + 1) || 1));
  return card('k-cash', 'Cash', `<span class="amber">${money(S.cash)}</span>`, S.dec.loan && S.dec.loan.round >= S.round - 1 ? 'Includes a bank loan' : month ? `${money(reserveNow())} kept for emergencies` : 'Available to spend', spark(H.map(x => x.cash)))
    + card('k-profit', profitLabel(h), h ? `<span class="${h.profit >= 0 ? 'green' : 'red'}">${money(h.profit)}</span>` : '—', sub2, spark(month ? H.filter(x => x.type === 'month').map(x => x.profit / Math.max(1, x.to - x.from + 1)) : series, 'pr'))
    + card('k-rep', 'Reputation', `<span class="stars">${starsHtml(S.rep)}</span>`, `${S.rep} out of 5` + (h && p && h.rep !== p.rep ? ` ${trendMark(h.rep, p.rep)}` : ''))
    + card('k-fuel', 'Fuel position', `${num(S.fuel)} L`, need ? (S.fuel >= need ? `<span class="green">● Enough for today</span>` : inPeriodMode() ? `<span class="amber">● Tops up at market price</span>` : `<span class="red">● Short for today</span>`) : 'No flights planned');
}
/* The plane he is saving for: a bar, the price and the money kept back. The months are his to work out. */
function savingsHtml(){
  const sv = savingsState(); if(!sv || periodType() !== 'month') return '';
  const pct = clamp(sv.investable / sv.price, 0, 1), est = S.affordEst && S.affordEst.plane === sv.plane.id ? S.affordEst : null;
  return `<div class="save-box ${sv.ready ? 'ready' : ''}"><div class="save-top"><span class="label">Saving for</span><b>${esc(sv.plane.name)}</b><b class="amber num">${money(sv.price)}</b></div>
    <div class="save-bar"><i style="width:${(100*pct).toFixed(1)}%"></i></div>
    <div class="save-foot">${sv.ready ? '<b class="green">● Affordable now, with your emergency money kept back</b>' : `<span>${money(sv.reserve)} kept back for emergencies</span>${est ? `<span>Your estimate in ${esc(monthName(est.made))}: about ${plural(est.months, 'month')}</span>` : '<span>How long? Use <b>Run until affordable</b>.</span>'}`}</div></div>`;
}
function todayHtml(){
  const c = S.rnd.choice, fl = boardFlights().filter(f => !f.grounded), P = S.period, t = P ? P.type : 'day';
  const head = t === 'day' ? "Today's briefing" : t === 'week' ? 'This week' : `${monthName(P.from)} ${calDate(P.from).getUTCFullYear()}`;
  const news = S.rnd.headline ? S.rnd.headline : c ? fillText(c.news) : t === 'week' ? 'A routine week. The timetable runs as planned.' : 'A routine month. The timetable runs as planned.';
  const sv = savingsState(), month = t === 'month';
  const main = t === 'day' ? "Plan today's operation" : t === 'week' ? 'Run this week' : `Simulate ${monthName(P.from)}`;
  const finale = !!roundData(S.round).finale;
  const more = month && !finale ? `<div class="td-more"><button class="btn" id="run3">Run 3 months</button>${sv && !sv.ready ? `<button class="btn" id="runAfford">Run until the ${esc(sv.plane.name)} is affordable</button>` : ''}</div>` : '';
  const sub = t === 'day' ? `${plural(fl.length, 'flight')} planned · first departure ${fmtTime(firstDep())}` : `${plural(fl.length, 'flight')} a day · ${esc(periodLabel())}`;
  return `<section class="hp p-today">${hqHead(head, periodTag().toUpperCase())}
    <div class="td-body"><h2 class="td-news">${esc(news)}</h2>${(S.rnd.brief || []).map(l => `<p>${esc(l)}</p>`).join('')}${savingsHtml()}</div>
    <div class="td-act"><button class="btn primary act" id="startDay">${esc(main)} &#9654;</button>${more}<span class="muted">${sub}</span></div></section>`;
}
function fleetHtml(){
  const span = dayEnd() - dayStart(), nx = PLANES.slice().sort((a,b) => a.price - b.price).find(p => p.price > 0 && !S.fleet.some(f => f.planeId === p.id));
  return `<div class="pb"><table class="hq-t"><thead><tr><th>Aircraft</th><th class="num">Seats</th><th>Today</th><th>In use</th><th>Status</th></tr></thead><tbody>${S.fleet.map(f => {
    const p = planeById(f.planeId), s = schedOf(f), u = s.length ? Math.round(100 * TIME.day(p, s).elapsed / span) : 0;
    const chip = f.grounded ? '<span class="chip bad">Grounded</span>' : s.length ? '<span class="chip ok">Flying today</span>' : '<span class="chip idle">Not flying yet</span>';
    return `<tr><td><span class="ac">${planeSvg(p)}<b>${esc(p.name)}</b></span></td><td class="num">${seatsOf(f)}</td><td>${s.length ? esc(tripLabel(s)) : '—'}</td><td><span class="ubar"><i style="width:${u}%"></i></span><span class="num">${u}%</span></td><td>${chip}</td></tr>`; }).join('')}${S.onOrder ? (() => { const p = planeById(S.onOrder.planeId); return `<tr class="onorder"><td><span class="ac">${planeSvg(p)}<b>${esc(p.name)}</b></span></td><td class="num">${p.seats}</td><td>—</td><td>—</td><td><span class="chip idle">On order · arrives ${dateShort(S.onOrder.deliveryDay)}</span></td></tr>`; })() : ''}</tbody></table>
    </div>`;
}
function intelHtml(){ const it = intelItems(); return `<div class="pb intel">${it.length ? it.map(x => `<div class="ii ${x.warn ? 'warn' : x.good ? 'good' : ''}"><span class="tag">${esc(x.tag)}</span><span>${esc(x.text)}</span></div>`).join('') : '<p class="muted">All quiet.</p>'}</div>`; }
/* The opening prototype: yesterday's evidence per route (wanted, seats offered, travelled, no seat). */
function routesHtml(){ return evidenceHtml(lastDay(), ownedRoutes()); }
function financeHtml(){ return `<div class="pb fin-pb">${finChart({ n:14 })}</div>`; }
function fuelHtml(){
  const fp = fuelPrice(), fy = S.round > 1 ? fuelPrice(S.round-1) : fp, prices = []; for(let i = 1; i <= Math.max(1, S.round); i++) prices.push(fuelPrice(i));
  return `<div class="pb fuelp">${tankGauge({ need: fuelNeeded() })}
    <div class="fu-row"><div><span class="label">Today's price</span><b class="amber">${priceL(fp)}</b><span class="muted">a litre ${trendMark(fp, fy)}</span></div><div><span class="label">In your tank</span><b>${S.fuel > 0 ? priceL(avgFuelPrice()) : '—'}</b><span class="muted">average paid</span></div><div class="fu-sp"><span class="label">Price so far</span>${spark(prices, 'fu') || '<span class="muted">—</span>'}</div></div></div>`;
}
function tabbedPanel(cls, key, tabs){
  UI.hqTabs = UI.hqTabs || {}; const on = tabs.some(t => t[0] === UI.hqTabs[key]) ? UI.hqTabs[key] : tabs[0][0];
  return `<section class="hp ${cls}"><div class="phead tabs">${tabs.map(t => `<button class="ptab" data-tab="${key}|${t[0]}" aria-pressed="${t[0]===on}">${t[1]}${t[3] ? ` <sup>${t[3]}</sup>` : ''}</button>`).join('')}</div>${tabs.find(t => t[0] === on)[2]()}</section>`;
}
const MAP_LAYERS = [['routes','Routes'],['demand','Demand'],['profit','Profit'],['opps','Opportunities']];
R.hq = () => {
  const wide = hqLayout() === 'wide'; UI.hqLay = hqLayout(); UI.mapLayer = UI.mapLayer || 'routes';
  const h = lastDay(), warn = intelSituations().length, resFrom = h ? periodShort(h) : '';
  const mapP = `<section class="hp p-map">${hqHead('Network', '', `<span class="layers">${MAP_LAYERS.map(l => `<button class="ptab" data-layer="${l[0]}" aria-pressed="${UI.mapLayer===l[0]}">${l[1]}</button>`).join('')}</span>`)}<div class="hq-map" id="hqMap"></div>
    <div class="map-key">${UI.mapLayer === 'demand' ? 'Circle size: how many people want to fly there' : UI.mapLayer === 'profit' ? `<i class="k gain"></i>made a profit <i class="k loss"></i>made a loss${resFrom ? ' · ' + esc(resFrom.toLowerCase()) : ''}` : UI.mapLayer === 'opps' ? 'Dashed: routes you could open' : `${plural(ownedRoutes().length, 'route')} from ${esc(homeData().city)}`}</div></section>`;
  const fuelP = ['fuel', 'Fuel', fuelHtml], fleetP = ['fleet', 'Fleet', fleetHtml], intelP = ['intel', 'Intelligence', intelHtml, warn || ''], routesP = ['routes', 'Route performance', routesHtml], finP = ['finance', 'Finance', financeHtml];
  screen().innerHTML = `<div class="hqd ${wide ? 'wide' : 'compact'}">${kpiHtml()}${todayHtml()}${mapP}
    ${wide ? `<section class="hp p-fleet">${hqHead('Fleet', plural(S.fleet.length, 'aircraft').toUpperCase().replace('AIRCRAFTS','AIRCRAFT'))}${fleetHtml()}</section><section class="hp p-intel">${hqHead('Intelligence', warn ? warn + ' TO WATCH' : 'ALL CLEAR')}${intelHtml()}</section>
      <section class="hp p-routes">${hqHead('Route performance', resFrom ? 'RESULTS ' + resFrom.toUpperCase() : '')}${routesHtml()}</section><section class="hp p-fin">${hqHead('Finance', { month:'BY MONTH', week:'BY WEEK', gap:'BY WEEK' }[periodType()] || 'LAST 14 DAYS')}${financeHtml()}</section>
      <section class="hp p-fuel">${hqHead('Fuel', S.fuel >= fuelNeeded() ? 'READY' : 'SHORT')}${fuelHtml()}</section>`
      : tabbedPanel('p-fleet', 'a', [intelP, fuelP, fleetP]) + tabbedPanel('p-routes', 'b', [routesP, finP])}</div>`;
  on('startDay', () => { if(S.period && S.period.type !== 'day') chooseRun('one'); else next(); }); on('run3', () => chooseRun('n', 3)); on('runAfford', () => chooseRun('afford'));
  screen().querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { const [k, v] = b.getAttribute('data-tab').split('|'); UI.hqTabs[k] = v; render(); });
  if(!wide) screen().querySelectorAll('.chip.ok').forEach(c => { c.textContent = 'Flying'; });
  screen().querySelectorAll('[data-layer]').forEach(b => b.onclick = () => { UI.mapLayer = b.getAttribute('data-layer'); render(); });
  if(hqMap) hqMap.destroy(); hqMap = makeMap($('hqMap'), { scale:1.1, pad:0.65 }); hqMap.layer = UI.mapLayer;
  hqFit();
  requestAnimationFrame(() => { if(!hqMap) return; hqMap.autoFit(true); hqMap.render(); });
};
/* After layout: the finance chart is drawn at its panel's real size (text stays 1:1), and the
   intelligence list keeps what fits, with a link to the rest. */
function hqFit(){
  const fb = screen().querySelector('.fin-pb'); if(fb && fb.clientWidth > 50 && S.history.length) fb.innerHTML = finChart({ n:14, w:fb.clientWidth - 28, h:Math.max(120, fb.clientHeight - 48) });
  screen().querySelectorAll('.hp .intel').forEach(box => {
    const pb = box.closest('.pb'), total = box.querySelectorAll('.ii').length, left = () => box.querySelectorAll('.ii'); let more = null;
    while(pb.scrollHeight > pb.clientHeight + 1 && left().length > 1){
      left()[left().length - 1].remove();
      if(!more){ more = document.createElement('button'); more.className = 'more'; more.onclick = () => { S.overlay = {type:'alerts'}; render(); }; box.appendChild(more); }
      more.textContent = `+${total - left().length} more`;
    }
  });
}
/* The top bar: date and period, the operation's status, cash, stars, fleet, fuel, alerts. */
function updateTopBar(){
  $('cName').textContent = S.airline.name || 'Airline Simulator';
  const sx = strategyOf(), cs = $('cStrat'); if(cs){ cs.textContent = sx ? sx.badge : ''; cs.className = sx ? 'sb-' + sx.id : ''; }
  $('cDate').textContent = S.phase === 'setup' ? 'Sunday 12 May 2030' : periodLabel();
  $('cDay').textContent = S.phase === 'setup' ? 'First day of operations' : S.phase === 'round' && S.round ? `Day ${S.round} of operations` : periodTag(); const chip = document.querySelector('.cdate i.chip'); if(chip) chip.textContent = PERIOD_CHIP[S.phase === 'setup' ? 'setup' : periodType()] || '';
  $('cCash').textContent = money(S.cash); $('cStars').innerHTML = starsHtml(S.rep); $('cFuel').textContent = num(S.fuel)+' L';
  $('cFleet').textContent = S.fleet.length ? `${activeFleet().length}/${S.fleet.length}` : '0';
  const o = opsStatus(); $('cOps').className = 'cops ' + o.k; $('cOps').textContent = (o.k === 'run' ? '▶ ' : o.k === 'alert' || o.k === 'hold' ? '■ ' : '● ') + o.t;
  const n = S.phase === 'round' ? intelSituations().length : 0; $('cBell').hidden = !n; $('cBell').textContent = n;
}

R.choice = () => {
  const c = S.rnd.choice, need = fuelNeeded(); if(!c){ next(); return; }
  screen().innerHTML = taskFrame({ question:'What will you do?', story:[esc(fillText(c.news))], say:'What will you do? ' + fillText(c.news) + ' ' + c.options.map(o => fillText(o.label)).join('. '), back:true, work:false,
    main:`<div class="choices ${c.options.length > 2 ? 'three' : 'two'}">${c.options.map((o, i) => `<button class="choice ${o.do==='carryOn'?'carry':''}" data-opt="${i}"><b>${esc(fillText(o.label))}</b>${o.sub ? `<span>${esc(fillText(o.sub))}</span>` : ''}${o.do === 'fuel' ? tankGauge({ ghost: Math.min(o.litres, Math.floor(tankSpace()/WORLD.fuelLot)*WORLD.fuelLot), need }) : (o.do === 'carryOn' && c.trigger === 'fuel' ? tankGauge({ need }) : '')}</button>`).join('')}</div>` });
  screen().querySelectorAll('[data-opt]').forEach(b => b.onclick = () => { resetEntry(); UI.explain = null; chooseOption(parseInt(b.getAttribute('data-opt'),10)); });
  bindFrame(() => { S.si = 0; render(); });
};
R.fare = st => {
  const f = focusPlane(), rid = focusRouteId(f), r = routeById(rid), trips = Math.max(1, tripsOn(f, rid)), rival = competitorPrice(r);
  const t = ensureTable('price:'+f.uid+':'+rid, 'price', buildPriceCols(f, rid, { fares: st.fares, rival: rival !== undefined }), { labels: priceLabels(trips) });
  const story = demandRule(r).concat(rival !== undefined ? [`${WORLD.rival} charges ${money(rival)}. If you charge more, 1 in 5 people fly with them.`] : []);
  screen().innerHTML = taskFrame({ question: TABLES.price.question.replace('{city}', esc(r.city)), story, back: canGoBack(), say: TABLES.price.question.replace('{city}', r.city) + ' ' + story.join(' '), main: tableHtml(t, { onPick:true }), side: sideHtml(t, { onPick:true }) });
  bindTable(t, { onPick: c => { S.prices[rid] = c.fare; S.rnd.committed = true; refreshPlan(); resetEntry(); UI.explain = null; next(); } }); bindFrame(backToChoice);
};
R.trips = st => {
  const f = focusPlane(), rid = focusRouteId(f), r = routeById(rid), p = planeById(f.planeId), totalSteps = unlocked('dayStep') ? 3 : 2;
  if(st.part === 'count'){
    const c0 = buildTripsCountCols(f, rid)[0].values;
    if(c0.people <= c0.seats){   // everyone fits: no division to do
      screen().innerHTML = taskFrame({ question: TABLES.tripsCount.question.replace('{city}', esc(r.city)), back: canGoBack(), work:false,
        story:[`${c0.people} people want to go to ${esc(r.city)}.`, `The plane holds ${c0.seats}.`], say:`${c0.people} people want to go to ${r.city}. The plane holds ${c0.seats}. Everyone fits on one trip.`,
        main: demandViz(c0.people, c0.seats) + `<div class="result-line">Everyone fits on one trip. ${plural(c0.seats - c0.people, 'seat')} will be empty.</div>`,
        foot:'<button class="btn primary big" id="nx">Next &#9654;</button>' });
      bindFrame(backToChoice); on('nx', () => { applyTrips(f, rid, 1, null); fuelCheck(); S.steps = S.steps.filter((x, i) => i <= S.si || x.t !== 'day' || unlocked('dayStep')); next(); });
      return;
    }
    const t = ensureTable('tripsA:'+f.uid+':'+rid, 'tripsCount', buildTripsCountCols(f, rid)), v = t.cols[0].values, done = tableComplete(t);
    const result = done ? (v.left === 0 ? `<div class="result-line">${plural(v.full,'full plane')}, 0 left over. No one is left behind.</div>` : `<div class="result-line">${plural(v.full,'full plane')} and ${v.left} ${v.left===1?'person':'people'} left over.</div>`) : '';
    screen().innerHTML = taskFrame({ question: TABLES.tripsCount.question.replace('{city}', esc(r.city)), stepMark:`Step 1 of ${totalSteps}`, back: canGoBack(),
      story:[`${v.people} people want to go to ${esc(r.city)}.`, `The plane holds ${v.seats}.`], say:`${v.people} people want to go to ${r.city}. The plane holds ${v.seats}.`,
      main: tableHtml(t) + (done ? demandViz(v.people, v.seats) : '') + result, side: sideHtml(t),
      foot: done ? `<button class="btn primary big" id="nx">${v.left === 0 ? 'Next' : 'Look at the extra trip'} &#9654;</button>` : '' });
    bindTable(t); bindFrame(backToChoice);
    on('nx', () => { resetEntry(); if(v.left === 0){ applyTrips(f, rid, v.full, null); next(); } else { st.part = 'extra'; render(); } });
    return;
  }
  const c0 = buildTripsCountCols(f, rid)[0].values, t = ensureTable('tripsB:'+f.uid+':'+rid, 'tripsExtra', buildTripsExtraCols(f, rid, c0.left)), v = t.cols[0].values, done = tableComplete(t);
  const others = schedOf(f).filter(id => id !== rid), fits = TIME.fits(p, others.concat(Array(c0.full + 1).fill(rid)));
  const only = c0.full === 0;
  screen().innerHTML = taskFrame({ question: only ? 'Should the trip fly?' : TABLES.tripsExtra.question, stepMark:`Step 2 of ${totalSteps}`, back: canGoBack(),
    story:[only ? `Only ${v.left} ${v.left===1?'person wants':'people want'} to go. The plane holds ${c0.seats}.` : `The ${v.left} left-over ${v.left===1?'person':'people'} could take an extra trip.`].concat(fits && extraFuelShort(f, rid, c0.full) ? ['Flying it means buying more fuel first.'] : []), say:`The ${v.left} left-over people could take an extra trip. Should it fly?`,
    main: tableHtml(t) + (done && !fits ? `<div class="result-line">There aren't enough hours in the day for another trip.</div>` : ''), side: sideHtml(t),
    foot: done ? `${fits ? `<button class="btn primary big" id="fly">${only ? 'Fly the trip' : 'Fly the extra trip today'}</button>` : ''}<button class="btn big" id="nofly">Don't fly it</button>` : '' });
  bindTable(t); bindFrame(() => { st.part = 'count'; resetEntry(); render(); });
  const decide = fly => { S.rnd.extra = { left:v.left, income:v.income, cost:v.cost, flew:fly };
    // today only: an extra trip, or keeping a part-full only trip at home, goes back to the usual day next round
    if(fly && !only) S.revertTrips = { uid:f.uid, sched: schedOf(f).filter(id => id !== rid).concat(Array(c0.full).fill(rid)) };
    if(!fly && only) S.revertTrips = { uid:f.uid, sched: schedOf(f).length ? schedOf(f).slice() : [rid] };
    applyTrips(f, rid, c0.full + (fly ? 1 : 0), fly); resetEntry(); fuelCheck(); next(); };
  on('fly', () => decide(true)); on('nofly', () => decide(false));
};
/* More trips can need more fuel than the tank holds: then buying fuel comes next (the only place the warning shows). */
function fuelCheck(){
  const need = fuelNeeded(); if(need <= S.fuel + 1e-9 || S.steps.slice(S.si+1).some(s => s.t === 'fuel')) return;
  let at = S.steps.findIndex((s, i) => i > S.si && ['quick','fly'].includes(s.t)); if(at < 0) at = S.si + 1;
  S.steps.splice(at, 0, {t:'fuel', litres: ceilLot(need - S.fuel), short:true});
}
function extraFuelShort(f, rid, full){ const d = (full + 1 - tripsOn(f, rid)) * fuelForTrip(planeById(f.planeId), routeById(rid)); return fuelNeeded() + d > S.fuel + 1e-9; }
function applyTrips(f, rid, n, flewExtra){ const others = schedOf(f).filter(id => id !== rid); setSchedule(f.uid, others.concat(Array(n).fill(rid))); if(n > 0) S.rnd.focusRoute = rid; S.rnd.committed = true; refreshPlan(); }
R.day = st => {
  const f = focusPlane(), p = planeById(f.planeId), sched = schedOf(f);
  const chips = WORLD.routes.filter(r => routeOpen(r) && planeCanFly(p, r)).map(r => { const can = canAddTrip(p, sched, r); return `<button class="choice small ${can?'':'locked'}" data-add="${r.id}" ${can?'':'disabled'}><b>${flagSvg(r.flag,20)} ${esc(r.city)}</b><span>${fmtDur(TIME.roundTrip(p, r))} there and back</span></button>`; }).join('');
  const fromTrips = S.steps.some((x, i) => i < S.si && x.t === 'trips'), added = st && st.added ? routeById(st.added) : null;
  screen().innerHTML = taskFrame({ question:'Does the day fit?', stepMark: fromTrips ? 'Step 3 of 3' : '', story:(added ? [`A ${esc(added.city)} trip is on the plan.`] : []).concat([`The airport is open ${WORLD.dayStart} to ${WORLD.dayEnd}.`, `Each trip is out, ${WORLD.turnaroundMin} minutes on the ground, then back.`]).concat(inPeriodMode() ? ['This becomes the plane\'s day, every day.'] : []),
    main: dayTimeline(p, sched) + tankGauge({ warn:true }) + `<div class="row"><button class="btn" id="undo" ${sched.length>1?'':'disabled'}>Remove the last trip</button></div><div class="choices four">${chips}</div>`,
    foot:`<button class="btn primary big" id="ok">This is the day &#9654;</button>` });
  screen().querySelectorAll('[data-add]').forEach(b => b.onclick = () => { setSchedule(f.uid, sched.concat([b.getAttribute('data-add')])); render(); });
  on('undo', () => { setSchedule(f.uid, sched.slice(0,-1)); render(); }); on('ok', () => { if(!inPeriodMode()) fuelCheck(); S.rnd.committed = true; next(); }); bindWork();
};
R.fuel = st => {
  if(st.short){ if(fuelNeeded() <= S.fuel + 1e-9){ next(); return; } st.litres = Math.max(st.litres || 0, ceilLot(fuelNeeded() - S.fuel)); }
  const space = Math.floor(tankSpace()/WORLD.fuelLot)*WORLD.fuelLot, litres = st.litres === 'fill' ? space : Math.min(st.litres || WORLD.fuelLot, space);
  if(litres <= 0){ screen().innerHTML = taskFrame({ question:'Your tank is full.', back: canGoBack(), main: tankGauge(), foot:'<button class="btn primary big" id="nx">Next &#9654;</button>' }); on('nx', next); bindFrame(backToChoice); return; }
  const t = ensureTable('fuel:'+S.day+':'+litres, 'fuel', buildFuelCols(litres));
  screen().innerHTML = taskFrame({ question: TABLES.fuel.question, back: canGoBack(), story:(st.short ? [`Today's trips need ${num(fuelNeeded())} litres. The tank has ${num(S.fuel)}.`] : []).concat([`You are buying ${num(litres)} litres.`, `Fuel costs ${priceL(t.cols[0].values.ppl)} a litre today.`]).concat(litres < (st.litres||0) ? [`That is all the tank has room for.`] : []), say:`How much will the fuel cost? You are buying ${num(litres)} litres at ${priceL(t.cols[0].values.ppl)} a litre.`,
    main: tankGauge({ ghost: litres, warn: !!st.short }) + tableHtml(t, { onPick:true }), side: sideHtml(t, { onPick:true, pickQ:'Buy the fuel?' }) });
  bindTable(t, { onPick: c => { buyFuel(c.values.litres, c.values.ppl); S.rnd.committed = true; toast(`${num(c.values.litres)} litres bought`); resetEntry(); fuelCheck(); next(); } }); bindFrame(backToChoice);
};
R.cabin = () => {
  const f = focusPlane(), p = planeById(f.planeId), t = ensureTable('cabin:'+S.round, 'cabin', buildCabinCols(f));
  screen().innerHTML = taskFrame({ question: TABLES.cabin.question, back: canGoBack(), story:['More seats share the cost between more people.', 'Cramped passengers leave bad reviews.'], say:'How should the seats be laid out? More seats share the cost between more people. Cramped passengers leave bad reviews.',
    main: tableHtml(t, { onPick:true }), side: sideHtml(t, { onPick:true }) });
  bindTable(t, { onPick: c => { f.layout = c.id; S.rnd.committed = true; refreshPlan(); resetEntry(); next(); } }); bindFrame(backToChoice);
};
/* The fleet choice inside the round: compare, buy, then pick its first route. */
R.plane = st => {
  const monthly = periodType() === 'month', t = monthly ? ensureTable('planeM:'+S.round, 'planeM', buildPlaneColsM(st.ids)) : ensureTable('plane:'+S.round, 'plane', buildPlaneCols(st.ids));
  const skip = () => { S.steps = S.steps.filter((x, i) => i <= S.si || x.t !== 'newRoute'); resetEntry(); next(); };
  screen().innerHTML = taskFrame({ question: TABLES.plane.question, back: canGoBack(), story:[`You have ${money(S.cash)}.`, monthly ? `How much is left after buying? Is it still above the ${money(reserveNow())} you keep for emergencies?` : 'How much is left after buying? How many trips pay the plane back?'], say:`Which plane should you buy? You have ${money(S.cash)}. Work out the cash left after buying and how many trips pay the plane back.`,
    main: tableHtml(t, { onPick:true }), side: sideHtml(t, { onPick:true }), foot:'<button class="btn big" id="notToday">Not today</button>' });
  bindTable(t, { onPick: c => { const p = planeById(c.id); buyPlane(p); S.rnd.newPlane = S.fleet[S.fleet.length-1].uid; S.rnd.committed = true; delete S.rnd.tables['plane:'+S.round]; delete S.rnd.tables['planeM:'+S.round]; if(S.target === p.id){ const np = nextPlaneUp(); S.target = np ? np.id : null; } resetEntry(); toast(p.name + ' bought'); next(); } });
  bindFrame(backToChoice); on('notToday', skip);
};
R.newRoute = st => {
  const f = S.fleet.find(x => x.uid === S.rnd.newPlane); if(!f){ next(); return; }
  const p = planeById(f.planeId), routes = WORLD.routes.filter(r => routeOpen(r) && planeCanFly(p, r));
  const now = schedOf(f).map(id => routeById(id).city);
  screen().innerHTML = taskFrame({ question:`Where should the ${esc(p.name)} fly?`, story:(st.move && now.length ? [`It flies to ${esc([...new Set(now)].join(' and '))} now.`] : []).concat(['It flies one trip a day to start.', `Each box is one plane-load of ${seatsOf(f)}.`]), work:false,
    main:`<div class="choices ${routes.length > 2 ? 'three' : 'two'}">${routes.map(r => routeCard(r, p, st.route === r.id, f.uid)).join('')}</div>`,
    foot:`<button class="btn primary big" id="nx" ${st.route ? '' : 'disabled'}>Fly to ${st.route ? esc(routeById(st.route).city) : '…'} &#9654;</button>` });
  screen().querySelectorAll('[data-r]').forEach(b => b.onclick = () => { st.route = b.getAttribute('data-r'); render(); });
  on('nx', () => { let sched = [st.route];
    if(st.move){ const n = Math.max(1, schedOf(f).length); while(sched.length < n && TIME.fits(p, sched.concat([st.route]))) sched.push(st.route); }   // a moved plane keeps as many trips as fit
    setSchedule(f.uid, sched); refreshPlan(); if(!inPeriodMode()) fuelCheck(); next(); });
};
R.quick = () => {
  const f = focusPlane(); if(!f || !schedOf(f).length){ next(); return; }
  const cols = buildQuickCols(f); if(!cols[0].values.passengers){ next(); return; }
  const t = ensureTable('quick:'+S.round, 'quick', cols), v = cols[0].values, r = routeById(cols[0].id), done = tableComplete(t);
  screen().innerHTML = taskFrame({ question: TABLES.quick.question.replace('{city}', esc(r.city)), back: canGoBack(),
    story:[`${v.passengers} passengers fly to ${esc(r.city)} today.`, `Each ticket costs ${money(v.fare)}.`], say:`${v.passengers} passengers fly to ${r.city} today. Each ticket costs ${money(v.fare)}.`,
    main: tableHtml(t), side: sideHtml(t), foot: done ? '<button class="btn primary big" id="nx">Start the flights &#9654;</button>' : '' });
  bindTable(t); bindFrame(backToChoice); on('nx', () => { resetEntry(); next(); });
};

/* ---------- Captain's challenge (CR4 s8) ---------- */
R.challenge = st => {
  const ch = S.rnd.challenge; if(!ch || S.rnd.challengeDone){ next(); return; }
  screen().innerHTML = taskFrame({ question:"Captain's challenge — optional", story:[esc(ch.story)], say:"Captain's challenge. This is optional. " + ch.story + ' You could win ' + ch.rewardText + '.', work:false,
    main:`<p class="reward">Win it for: <b>${esc(ch.rewardText)}</b></p><p class="big-sum">${esc(ch.q)} = ?</p>`,
    foot:`<button class="btn primary big" id="go">Have a go</button><button class="btn big" id="no">Not today</button>` });
  on('go', () => { S.steps.splice(S.si+1, 0, {t:'challengeCalc'}); next(); });
  on('no', () => { S.rnd.challengeDone = true; next(); });
};
R.challengeCalc = st => {
  const ch = S.rnd.challenge;
  screen().innerHTML = taskFrame({ question:"Captain's challenge — optional", story:[esc(ch.story)], say: ch.story,
    main:`<p class="big-sum">${esc(ch.q)} = <span class="s-ans" id="chAnsShow">${esc(st.entry||'') || '?'}</span></p><p class="reward">Win it for: <b>${esc(ch.rewardText)}</b></p>`,
    side:`<div class="side2"><div class="answer"><span class="unit"></span><input id="ans" inputmode="decimal" autocomplete="off" value="${esc(st.entry||'')}" aria-label="Answer"></div>
      <div class="pad">${['7','8','9','4','5','6','1','2','3','.','0'].map(k => `<button data-k="${k}">${k}</button>`).join('')}<button data-k="back" class="back" aria-label="Delete">&#9003;</button><button class="check" id="check">Check</button></div>
      <div class="msg" id="msg">${esc(st.msg||'')}</div></div>`,
    foot:'<button class="btn big" id="no">Not today</button>' });
  const ans = $('ans'), show = () => { st.entry = ans.value; $('chAnsShow').textContent = ans.value || '?'; };
  ans.oninput = show; ans.onkeydown = e => { if(e.key === 'Enter') check(); };
  screen().querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const k = b.getAttribute('data-k'); if(k === 'back') ans.value = ans.value.slice(0,-1); else ans.value += k; show(); ans.focus(); });
  function check(){ const res = checkAnswer({answer: ch.answer}, ans.value); if(res === 'ok'){ countTyped(); st.entry = ''; applyReward(ch); toast('Challenge won: ' + ch.rewardText); next(); return; } st.tries = (st.tries||0) + 1; st.msg = res === 'blank' ? 'Type your answer first.' : TEXT.retry[(st.tries-1) % TEXT.retry.length] + (settings.nudge && res !== 'blank' ? ' ' + (res === 'high' ? TEXT.nudgeHigh : TEXT.nudgeLow) : ''); $('msg').textContent = st.msg; ans.focus(); ans.select(); }
  on('check', check); on('no', () => { S.rnd.challengeDone = true; next(); }); bindWork();
  setTimeout(() => ans.focus(), 50);
};

R.fly = st => {
  const a = S.rnd.anim || {start:Date.now(), dur:settings.flightSecs*1000};
  const flying = S.rnd.flights.filter(f => !f.grounded && !f.noFuel);
  screen().innerHTML = `<div class="card stack" style="min-height:300px;justify-content:center">${header(flying.length ? 'Flights under way' : 'No flights today', null, 'LIVE')}
    <div class="row spread"><span class="label">Airport time</span><b class="mono amber" id="flyClock" style="font-size:34px">${fmtTime(a.from)}</b></div>
    ${S.rnd.flights.map(f => { const r = routeById(f.route); return `<div class="flightline"><span class="mono muted" style="font-size:16px;min-width:5em">${fmtTime(f.dep)}</span> <span class="mono">${f.code}</span> <span class="grow progress"><i class="prog" data-key="${f.key}"></i></span> ${flagSvg(r.flag,26)} ${esc(r.city)} <span class="status ${statusClass(S.rnd.status[f.key])}" id="st-${f.key}" style="font-size:15px;min-width:9em">${S.rnd.status[f.key]}</span></div>`; }).join('')}
    <p class="lede muted" id="flyMsg">Boarding…</p>
    <div class="actions"><button class="btn" id="skip">Skip &#9654;</button></div></div>`;
  on('skip', () => { S.rnd.anim = null; next(); });
  if(!flying.length){ $('flyMsg').textContent = 'No planes fly today.'; $('skip').textContent = 'Continue ▶'; $('skip').className = 'btn primary big'; return; }
  function tick(){ if(step()!==st || S.overlay) return; const t = clamp((Date.now()-a.start)/a.dur, 0, 1), now = a.from + (a.to-a.from)*t; const bars = screen().querySelectorAll('.prog'); if(!bars.length) return; const clk = $('flyClock'); if(clk) clk.textContent = fmtTime(now);
    bars.forEach(b => { const f = S.rnd.flights.find(x=>x.key==b.getAttribute('data-key')); if(!f) return; const grounded = f.noFuel||f.grounded; const prog = grounded ? 0 : clamp((now-f.dep)/(f.arr-f.dep), 0, 1); b.style.width = (prog*100)+'%'; if(!grounded){ const s = now < f.dep-20 ? 'SCHEDULED' : now < f.dep ? 'BOARDING' : now < f.arr ? 'IN FLIGHT' : 'LANDED'; const el = $('st-'+f.key); if(el){ el.textContent = s; el.className = 'status '+statusClass(s); } } });
    $('flyMsg').textContent = t<0.08?'Boarding…':t<0.95?'The day is under way…':'Last plane landing…'; if(t<1) requestAnimationFrame(tick); else { if(settings.auto) setTimeout(()=>{ if(step()===st) next(); }, 500); else { $('flyMsg').textContent = 'All landed.'; $('skip').textContent = 'Continue ▶'; $('skip').className='btn primary'; } } }
  requestAnimationFrame(tick);
};
function roundTone(){ const p = S.rnd.profit||0, prev = S.history[S.history.length-2]; if(p > 0 && S.rnd.repDelta >= 0 && (!prev || p >= prev.profit)) return 'good'; if(p < 0 || S.rnd.repDelta < 0) return 'bad'; return 'ok'; }
/* ==================================================================
   LANDING REPORT (CR4 follow-up): a short presentation, one point at a time.
   ================================================================== */
function resultSlides(){
  const p = S.rnd.profit, tone = roundTone(), vs = S.rnd.vs, sl = [];
  const title = S.phase==='setup' ? 'Your first flight has landed' : tone==='good' ? 'A good day' : tone==='bad' ? 'A tough day' : 'Landed';
  sl.push({ kind:'headline', title, tone, say: `${title}. ${p>=0 ? 'Profit' : 'Loss'} ${money(Math.abs(p))}. Cash now ${money(S.cash)}.` });
  sl.push(rcpSlide());
  sl.push({ kind:'flights', title: S.rnd.flights.length === 1 ? 'Your flight' : 'Your flights', say: S.rnd.flights.map(outcomeLine).join(' ') });
  capSlides().forEach(x => sl.push(x));
  if(vs) sl.push({ kind:'forecast', title:'Did your forecast come true?', say:`You expected ${money(vs.expIncome)}. You got ${money(vs.gotIncome)}. ${vs.extra||''} ${vs.why||''}` });
  const whys = S.rnd.why.filter(w => !['🗓️','🎟️','🧾','⛽'].includes(w.ic) || /not enough fuel/.test(w.text));   // the money and seat slides already show these
  whys.forEach((w, i) => sl.push({ kind:'why', w, i, n:whys.length, title:'Why did that happen?', say:w.text }));
  sl.push({ kind:'rep', title:'What passengers said', say:`Reputation ${S.rep} stars. ` + S.rnd.reviews.map(v => v.text).join(' ') });
  return sl;
}
function slideHtml(x){
  if(x.kind === 'rcp' || x.kind === 'cap') return openingSlideHtml(x);
  const p = S.rnd.profit, vs = S.rnd.vs;
  if(x.kind === 'headline') return `<div class="sl-center"><span class="sl-kicker">${esc(S.phase==='setup' ? 'Launch day' : dateLong())} · Landing report</span>
    <h1 class="sl-title ${x.tone}">${esc(x.title)}</h1>
    <div class="sl-figs"><div><span class="label">${p>=0?'Profit':'Loss'} today</span><b class="sl-big ${p<0?'neg':''}" data-count="${Math.abs(p)}">${money(0)}</b></div>
    <div><span class="label">Cash now</span><b class="sl-big white" data-count="${S.cash}" data-from="${r2(S.cash - p)}">${money(r2(S.cash - p))}</b></div></div></div>`;
  if(x.kind === 'flights') return `<div class="sl-list stagger">${S.rnd.flights.map((f, i) => { const r = routeById(f.route), st = S.rnd.status[f.key], full = f.seats ? Math.min(1, f.sold/f.seats) : 0;
    return `<div class="sl-flight" style="--i:${i}"><span class="mono t">${fmtTime(f.dep)}</span>${flagSvg(r.flag, 30)}<b>${esc(r.city)}</b>
      <span class="sl-seats"><i style="--w:${(100*full).toFixed(0)}%"></i></span><span class="mono">${f.sold} / ${f.seats}</span>
      <span class="status ${statusClass(st)}">${st}</span><b class="mono amber">${money(f.revenue)}</b></div>`; }).join('')}</div>`;
  if(x.kind === 'forecast'){ const mx = Math.max(vs.expIncome, vs.gotIncome, 1), same = Math.abs(vs.expIncome - vs.gotIncome) < 1;
    return `<div class="sl-fc"><div class="sl-bar"><span class="label">You expected</span><i class="exp" style="--w:${(100*vs.expIncome/mx).toFixed(1)}%"></i><b class="mono" data-count="${vs.expIncome}">${money(0)}</b></div>
      <div class="sl-bar"><span class="label">You got</span><i class="got" style="--w:${(100*vs.gotIncome/mx).toFixed(1)}%"></i><b class="mono" data-count="${vs.gotIncome}">${money(0)}</b></div>
      <p class="sl-verdict ${same?'good':''}">${same ? '✓ Spot on. Your forecast came true.' : esc(vs.why || 'The day did not go to plan.')}</p>
      ${vs.extra ? `<p class="sl-callout">${esc(vs.extra)}</p>` : ''}</div>`; }
  if(x.kind === 'why') return `<div class="sl-center"><div class="sl-why"><span class="ic">${x.w.ic}</span><p>${esc(x.w.text)}</p></div><div class="sl-dots">${Array.from({length:x.n}, (_, k) => `<i class="${k===x.i?'on':k<x.i?'past':''}"></i>`).join('')}</div></div>`;
  if(x.kind === 'rep'){ const before = clamp(S.rep - (S.rnd.repDelta||0), 1, 5);
    return `<div class="sl-center"><div class="sl-stars">${[1,2,3,4,5].map(k => `<span class="${S.rep >= k ? 'on' : S.rep >= k-0.5 ? 'half' : ''} ${k > before && S.rep >= k-0.5 ? 'new' : ''}" style="--i:${k}">★</span>`).join('')}</div>
      <p class="sl-repline">${S.rnd.repDelta > 0 ? '<span class="green">▲ Reputation up</span>' : S.rnd.repDelta < 0 ? '<span class="red">▼ Reputation down</span>' : 'Reputation steady'} · ${S.rep} stars</p>
      <div class="sl-reviews stagger">${S.rnd.reviews.map((v, i) => `<div class="review" style="--i:${i+2}"><span class="face">${v.face}</span><span class="txt">${esc(v.text)}</span><span class="stars">${starsHtml(v.stars)}</span></div>`).join('')}</div></div>`;
  }
  return '';
}
function countUp(root){
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.querySelectorAll('[data-count]').forEach(el => { const to = parseFloat(el.getAttribute('data-count')), from = parseFloat(el.getAttribute('data-from') || '0'), t0 = performance.now(), dur = 900;
    if(reduce){ el.textContent = money(to); return; }
    const step = t => { const k = Math.min(1, (t - t0)/dur), e = 1 - Math.pow(1-k, 3); el.textContent = money(k < 1 ? Math.round(from + (to-from)*e) : to); if(k < 1 && document.body.contains(el)) requestAnimationFrame(step); };
    requestAnimationFrame(step); });
  setTimeout(() => root.querySelectorAll('.sl-bar i, .sl-seats i').forEach(i => i.classList.add('go')), 60);
}
R.results = st => {
  const per = !!S.rnd.sim; (per ? applyPeriodResults : applyResults)();
  const sl = per ? periodSlides() : resultSlides(); st.slide = clamp(st.slide || 0, 0, sl.length - 1);
  const x = sl[st.slide], last = st.slide === sl.length - 1;
  screen().innerHTML = `<div class="tf pres ${x.tone||''}"><div class="phead tf-bar" data-status="${st.slide+1} / ${sl.length}">${per ? 'Results' : 'Landing report'} · ${esc(roundLabel())}</div>
    <div class="sl-progress">${sl.map((_, k) => `<i class="${k < st.slide ? 'done' : k === st.slide ? 'on' : ''}"></i>`).join('')}</div>
    <div class="sl-stage"><div class="slide" ${/headline/.test(x.kind)?'':`aria-label="${esc(x.title)}"`}>${/headline/.test(x.kind) ? (per ? periodSlideHtml(x) : slideHtml(x)) : `<div class="sl-mid"><h2 class="sl-h">${esc(x.title)}</h2>${per ? periodSlideHtml(x) : slideHtml(x)}</div>`}</div></div>
    <div class="tf-foot">${sayBtn(x.say)}<span class="grow"></span>${st.slide > 0 ? '<button class="btn big" id="prevSl">&#9664; Back</button>' : ''}${last ? '' : '<button class="btn big" id="skipSl">Skip to the end</button>'}<button class="btn primary big" id="nx">${last ? 'Continue' : 'Next'} &#9654;</button></div></div>`;
  countUp(screen());
  const go = d => { st.slide += d; render(); };
  on('nx', () => last ? next() : go(1)); on('prevSl', () => go(-1)); on('skipSl', () => { st.slide = sl.length - 1; render(); });
};
document.addEventListener('keydown', e => { if(IS_DISPLAY || !S || !S.steps || S.overlay || step().t !== 'results' || !$('teacher').hidden) return; if(e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' '){ e.preventDefault(); const b = $('nx'); if(b) b.click(); } if(e.key === 'ArrowLeft'){ const b = $('prevSl'); if(b) b.click(); } });
R.setupDone = () => {
  screen().innerHTML = `<div class="card stack" style="text-align:center;align-items:center;padding:40px">
    <h1>${esc(S.airline.name)} is flying</h1>
    ${strategyBadge()}
    <div class="row">${finSvg(S.airline.fin, 80)}<svg class="preview-plane" viewBox="0 0 120 48" style="fill:var(--c1);width:260px"><use href="#pl-${planeById(S.fleet[0].planeId).icon}"/></svg></div>
    <p class="lede">Your airline is up and running with <b class="amber mono">${money(S.cash)}</b> in the bank and <b class="amber mono">${num(S.fuel)} L</b> in the tank.</p>
    <p class="muted">Next: Day 1 at your HQ, Monday 13 May. Your progress is saved on this computer.</p>
    <div class="row" style="justify-content:center"><button class="btn primary big" id="nx">Go to HQ: Day 1 &#9654;</button><button class="btn big" id="code">Show save code</button></div></div>`;
  on('nx', () => startProtoDay(1)); on('code', () => showCode());
};

/* ----- event, challenge, summary ----- */
R.event = st => {
  const ev = S.rnd.event; if(!ev){ next(); return; }
  screen().innerHTML = `<div class="card stack exec">
    <div class="exec-bar"><b>⚠ Executive alert</b><span>Simulation paused · CEO decision required</span>${sayBtn(fillText(ev.title) + '. ' + fillText(ev.text))}</div>
    <h1 class="exec-h">${esc(fillText(ev.title))}</h1>
    <p class="lede">${esc(fillText(ev.text))}</p>
    <div class="options">${ev.options.map((o,i)=>`<button class="opt ${st.pick===i?'on':''}" data-o="${i}"><span class="big" style="font-size:22px">${esc(fillText(o.label))}</span><span class="sub">${esc(fillText(o.sub||''))}</span></button>`).join('')}</div>
    <div class="actions"><button class="btn primary big" id="nx" ${st.pick===undefined?'disabled':''}>Decide &#9654;</button></div></div>`;
  screen().querySelectorAll('[data-o]').forEach(b => b.onclick = () => { st.pick = parseInt(b.getAttribute('data-o'),10); render(); });
  on('nx', () => { applyEvent(st.pick); next(); });
};
R.eventOutcome = () => {
  const ev = S.rnd.event;
  screen().innerHTML = `<div class="card stack">${header(esc(fillText(ev.title))+': what happened', S.rnd.eventWhy, 'OUTCOME')}
    <p class="lede">${esc(S.rnd.eventWhy||'')}</p>
    ${factsHtml([['Cash', money(S.cash)],['Reputation', starsHtml(S.rep), 'small']])}
    <div class="actions"><button class="btn primary big" id="nx">Continue &#9654;</button></div></div>`;
  on('nx', next);
};
R.summary = () => {
  const w = roundData(S.round), h = S.history[S.history.length-1] || {}, tone = roundTone();
  const best = loadRuns().filter(r => !S.finished || r.name !== S.airline.name || r.cash !== Math.round(S.cash)).sort((a,b)=>b.cash-a.cash)[0];
  const per = !!S.rnd.sim, pname = per ? periodShort(h) : dayName(), pcap = pname.charAt(0).toUpperCase() + pname.slice(1);
  const title = w.finale ? 'End of the season' : w.checkpoint ? 'Half-year checkpoint' : tone==='good' ? pcap+': a good '+(per ? (S.period.type === 'week' ? 'week' : S.period.type === 'gap' ? 'weekend' : 'run') : 'day') : pcap+' complete';
  screen().innerHTML = `<div class="card stack ${tone==='good'?'tone-good':''}">${header(title, null, w.finale ? 'FINALE' : roundLabel().toUpperCase())}
    ${factsHtml([['Ticket money', money(h.revenue||0), 'white'],['Costs', money(h.costs||0), 'white'],[(h.profit||0)>=0?'Profit':'Loss', money(Math.abs(h.profit||0)), (h.profit||0)>=0?'':'red'],['Cash', money(S.cash)],['Reputation', starsHtml(S.rep), 'small'],['Fleet', S.fleet.length+' plane'+(S.fleet.length===1?'':'s'), 'white']])}
    ${S.rnd.challengeWon ? `<div class="rule" style="border-color:var(--green)">Captain's challenge won: <b>${esc(S.rnd.challenge.rewardText)}</b></div>` : ''}
    ${w.checkpoint ? `<div class="rule" style="border-color:var(--amber)">Half-year snapshot saved to Best runs: ${money(S.cash)} and ${S.rep} stars. The year carries on.</div>` : ''}
    ${w.finale ? `<div class="rule" style="border-color:var(--amber)">This run is recorded. ${best && best.cash <= S.cash ? '<b>Your best run so far.</b>' : best ? 'Best run so far: <b>'+money(best.cash)+'</b>.' : ''} Keep flying, or start again from the menu.</div>` : ''}
    <div class="actions left"><button class="btn primary big" id="nx">${per ? 'Back to HQ' : 'Next day: back to HQ'} &#9654;</button><button class="btn big" id="shop">🛒 Plane shop</button><button class="btn big" id="end">Save &amp; finish for today</button>${w.finale?'<button class="btn big" id="runs">Best runs</button>':''}</div></div>`;
  on('nx', advance); on('shop', () => openShop()); on('end', () => showCode(true)); on('runs', () => showRuns());
};


function openShop(){ S.overlay = {type:'shop', pick:[]}; render(); }
function closeOverlay(){ S.overlay = null; render(); }
function renderOverlay(){
  const o = S.overlay;
  if(o.type==='help'){ screen().innerHTML = helpHtml(o.topic); on('hClose', closeOverlay); return; }
  if(o.type==='menu'){
    const runs = loadRuns();
    screen().innerHTML = `<div class="hero"><h1 class="biglogo"><span class="a">AIRLINE</span><span class="b">SIM</span></h1></div><div class="card stack" style="align-items:center;text-align:center;padding:36px">${header('Home', null, 'HOME')}
      ${S.airline.name ? `<p class="lede">Saved game: <b>${esc(S.airline.name)}</b> ${strategyBadge()} · ${esc(S.phase === 'setup' ? 'Launch day' : periodLabel())} · <b class="amber mono">${money(S.cash)}</b></p>` : ''}
      ${S.migratedFrom ? '<p class="small muted">Saved before the calendar update: it carries on from the nearest point in the story.</p>' : ''}
      <div class="row" style="justify-content:center"><button class="btn primary big" id="cont">${S.airline.name ? 'Continue: ' + esc(S.airline.name) : 'Continue'}</button><button class="btn primary big" id="newg">New game</button>${runs.length?'<button class="btn big" id="best">Best runs</button>':''}<button class="btn big" id="code">Save code</button><button class="btn big" id="iwb2">Open the wall in a window</button><button class="btn big" id="present2">Present on two screens</button></div></div>`;
    on('cont', () => { delete S.migratedFrom; closeOverlay(); }); on('newg', () => { S.overlay = null; newGame(); }); on('best', showRuns); on('code', () => showCode()); on('iwb2', () => { closeOverlay(); openDisplay(); }); on('present2', () => { closeOverlay(); presentBoth(); }); return;
  }
  if(o.type==='alerts'){
    const it = intelItems();
    screen().innerHTML = `<div class="card stack">${header('Alerts and intelligence', null, intelSituations().length + ' TO WATCH')}
      <div class="intel big">${it.map(x => `<div class="ii ${x.warn ? 'warn' : x.good ? 'good' : ''}"><span class="tag">${esc(x.tag)}</span><span>${esc(x.text)}</span></div>`).join('') || '<p class="muted">All quiet.</p>'}</div>
      <div class="actions"><button class="btn big" id="cl">Back</button></div></div>`;
    on('cl', closeOverlay); return;
  }
  if(o.type==='shop'){
    o.pick = o.pick || [];
    screen().innerHTML = `<div class="card stack">${header('Plane shop', null, 'OPEN')}<p class="lede">You have <b class="amber mono">${money(S.cash)}</b>. Add up to three planes to the forecast to compare them.</p>
      <div class="shop">${PLANES.map(p => planeCard(p, {compare:o.pick})).join('')}</div>
      <div class="actions sticky"><button class="btn big" id="cl">Back</button><button class="btn primary big" id="fc" ${o.pick.length?'':'disabled'}>Open the forecast (${o.pick.length}) &#9654;</button></div></div>`;
    screen().querySelectorAll('[data-cmp]').forEach(b => b.onclick = () => { const id = b.getAttribute('data-cmp'); if(o.pick.includes(id)) o.pick = o.pick.filter(x => x !== id); else if(o.pick.length < 3) o.pick.push(id); else toast('Three planes at a time'); render(); });
    on('cl', closeOverlay); on('fc', () => { S.overlay = {type:'planeTable', ids:o.pick.slice()}; resetEntry(); render(); }); return;
  }
  if(o.type==='planeTable'){
    const t = ensureTable('plane', 'plane', buildPlaneCols(o.ids), { live: isLive('plane') });
    screen().innerHTML = taskFrame({ question: TABLES.plane.question, back:true, story:['How much cash is left after buying?', 'How many trips pay the plane back?'], say:'Which plane should you buy? Work out the cash left after buying and how many trips pay the plane back.',
      main: tableHtml(t, { onPick:true }), side: sideHtml(t, { onPick:true }) });
    bindTable(t, { onPick: c => { const p = planeById(c.id); buyPlane(p); delete S.rnd.tables.plane; resetEntry(); S.overlay = {type:'newPlane', uid: S.fleet[S.fleet.length-1].uid}; render(); } });
    bindFrame(() => { S.overlay = {type:'shop', pick:o.ids}; resetEntry(); render(); }); return;
  }
  if(o.type==='newPlane'){
    const f = S.fleet.find(x => x.uid === o.uid), p = planeById(f.planeId), routes = WORLD.routes.filter(r => routeOpen(r) && planeCanFly(p, r));
    screen().innerHTML = taskFrame({ question:`Where should the ${esc(p.name)} fly?`, story:[`The ${esc(p.name)} is yours.`, 'Pick its first route. It flies one trip a day to start.'], work:false,
      main:`<div class="choices ${routes.length > 2 ? 'three' : 'two'}">${routes.map(r => routeCard(r, p, o.route === r.id)).join('')}</div>`,
      foot:`<button class="btn primary big" id="nx" ${o.route ? '' : 'disabled'}>Fly to ${o.route ? esc(routeById(o.route).city) : '…'} &#9654;</button>` });
    screen().querySelectorAll('[data-r]').forEach(b => b.onclick = () => { o.route = b.getAttribute('data-r'); render(); });
    on('nx', () => { setSchedule(f.uid, [o.route]); f.route = o.route; toast(`${p.name} will fly to ${routeById(o.route).city}`); S.overlay = null; refreshPlan(); render(); }); return;
  }
  if(o.type==='fleet'){
    screen().innerHTML = `<div class="card stack">${header('Your fleet', null, plural(S.fleet.length,'plane').toUpperCase())}
      ${S.fleet.length ? `<table class="data"><thead><tr><th>Plane</th><th>Day's trips</th><th>Seats</th><th>Cabin</th><th class="num">Fuel per day</th></tr></thead><tbody>${S.fleet.map(f => { const p = planeById(f.planeId), s = schedOf(f); return `<tr><td class="row">${planeSvg(p)} ${esc(p.name)}</td><td>${s.length ? esc(tripLabel(s)) : '<span class="muted">no trips</span>'}${f.grounded?' <span class="pill red">grounded</span>':''}</td><td class="num">${seatsOf(f)}</td><td>${f.layout}</td><td class="num">${s.length ? num(dayFuel(f))+' L' : '—'}</td></tr>`; }).join('')}</tbody></table>` : '<p class="muted">No planes yet.</p>'}
      ${tankGauge({ warn:true })}
      <div class="actions"><button class="btn big" id="cl">Back</button></div></div>`;
    on('cl', closeOverlay); return;
  }
  if(o.type==='code'){
    screen().innerHTML = `<div class="card stack">${header(o.end ? 'Saved. See you next time' : 'Save code', null, 'SAVED')}
      <p class="lede">${o.end ? 'Your airline is saved on this computer. ' : ''}Copy this code somewhere safe as a backup. Paste it into the teacher panel to restore.</p>
      <textarea class="code" id="codeBox" readonly style="height:120px">${saveCode()}</textarea>
      <div class="actions left"><button class="btn primary" id="copy">Copy code</button><button class="btn" id="cl">${o.end ? 'Back to the game' : 'Back'}</button></div></div>`;
    on('copy', () => { const b = $('codeBox'); b.select(); try{ navigator.clipboard.writeText(b.value).then(()=>toast('Copied')); }catch(e){ document.execCommand('copy'); toast('Copied'); } });
    on('cl', closeOverlay); return;
  }
  if(o.type==='runs'){
    const runs = loadRuns().sort((a,b)=>b.cash-a.cash);
    screen().innerHTML = `<div class="card stack">${header('Best runs', null, plural(runs.length,'run').toUpperCase())}
      ${runs.length ? `<table class="data"><thead><tr><th>#</th><th>Airline</th><th>World</th><th class="num">Days</th><th class="num">Final cash</th><th>Stars</th><th>Fleet</th><th>Date</th></tr></thead><tbody>${runs.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.name)}${r.checkpoint?' <span class="pill" style="font-size:10px">half-time</span>':''}</td><td>${esc(r.world)}</td><td class="num">${r.rounds}</td><td class="num amber">${money(r.cash)}</td><td class="stars">${starsHtml(r.rep)}</td><td class="small">${r.fleet.map(esc).join(', ')}</td><td class="small">${esc(r.date)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">No completed runs yet. Finish a season to record one.</p>'}
      <div class="actions"><button class="btn big" id="cl">Back</button></div></div>`;
    on('cl', closeOverlay); return;
  }
  S.overlay = null; render();
}
function showCode(end){ S.overlay = {type:'code', end:!!end}; render(); }
function showRuns(){ S.overlay = {type:'runs'}; render(); }


/* ----- question bank: generated from the forecast-table definitions and the time module (skills come in Stage C) ----- */
function questionBank(){
  const real = S;
  if(!S || !S.fleet.length || S.phase === 'setup'){ S = newState(); S.phase = 'round'; S.round = 1; S.fleet = [{uid:1, planeId:'dhc6', route:'par', schedule:['par','par'], layout:'standard'}]; S.prices = {par:100, dub:60}; S.fuel = 1000; S.fuelValue = 1200; S.rnd = Object.assign(emptyRnd(), {featured:1, focusRoute:'par'}); }
  let html;
  try{
    const f = S.fleet.find(x => schedOf(x).length) || S.fleet[0], route = schedOf(f)[0];
    const tc = buildTripsCountCols(f, 'dub');
    const samples = { price: buildPriceCols(f, route), tripsCount: tc, tripsExtra: buildTripsExtraCols(f, 'dub', tc[0].values.left || 11), fuel: buildFuelCols(1000), cabin: buildCabinCols(f), plane: buildPlaneCols(PLANES.slice(1,3).map(p => p.id)), options: [{ id:'a', label:'Plan A', values:{ pax1:38, fare1:90, tk1:3420, pax2:0, fare2:60, tk2:0, snack:0, rev:3420, run:1252, fuel:432, term:114, stock:0, crew:0, day:900, cost:2698, profit:722 } }], dayForecast: [{ id:'par', label:'Paris', values:{ pax:38, fare:90, revenue:3420, run:1252, fuel:432, cost:1684, profit:1736 } }], days: buildDayCols(f, ['par','par'], ['mad']), quick: buildQuickCols(f),
      periodPlan: [{ id:'w', label:'A week', values:{ day:230, days:7, total:1610, cash:3036, cashEnd:4646 } }], runPlan: [{ id:'r', label:'3 months', values:{ month:10000, months:3, total:30000, cash:40724, cashEnd:70724 } }],
      afford: [{ id:'a', label:'Saab 340', values:{ cash:40724, reserve:10000, investable:30724, price:45000, needed:14276, month:10000, months:2 } }], planeM: buildPlaneColsM(PLANES.slice(1,3).map(p => p.id)) };
    // the opening's tables have no sample columns: each row is listed with its sum in words
    const NOW = ['cost1', 'empty1', 'week1', 'review2', 'periodPlan2', 'yearPlan', 'afford2', 'yearReview', 'invest'];
    const inWords = (def, r) => r.sentence ? r.sentence.replace(/\{\??(\w+)\}/g, (m, id) => { const x = def.rows.find(q => q.id === id); return m.includes('?') ? '?' : (x ? x.label : id); }) : '';
    const now = NOW.filter(k => TABLES[k]).map(kind => { const def = TABLES[kind];
      const rows = def.rows.map(r => `<tr><td>${esc(r.label)}</td><td>${r.type === 'calc' ? 'worked out' : 'given'}</td><td class="ex">${esc(inWords(def, r))}</td><td>${esc(r.tool || r.skill || '')}</td></tr>`).join('');
      return `<h2>${esc(def.title)}</h2><table><tr><th>Row</th><th>Type</th><th>The sum</th><th>Maths tool</th></tr>${rows}</table>`; }).join('');
    const STAGE_NAME = st => ({ 2:'Launch Day', 3.1:'Day 1', 3.2:'Day 2', 3.3:'Day 3', 3.4:'Day 4', 4:'Week 1', 4.1:'Week 2', 4.2:'Week 3', 5:'the months', 6:'the year', 7:'Year 1 review' })[st] || 'stage ' + st;
    const lvAt = T => (T.def || []).map(([st, l]) => `${STAGE_NAME(st)}: ${LVL[l] || l}`).join(' · ');
    const tools = `<h2>Maths tools</h2><p class="note">Who does each kind of sum, by stage of the story: <b>Calculate</b> (the pupil works it out), <b>Build</b> (the pupil chooses the figures and the sign; the model works it out), <b>Model</b> (done by the model). The teacher panel can change any of them.</p>
      <table><tr><th>Tool</th><th>What</th><th>By stage</th></tr>${TOOLS.map(T => `<tr><td>${esc(T.name)}</td><td>${esc(T.what || '')}</td><td>${esc(lvAt(T))}</td></tr>`).join('')}</table>`;
    const sec = `<h2 class="part">In the game now</h2>${now}${tools}<h2 class="part">Older tables (the first version's rounds; not in the current story)</h2>` + Object.keys(TABLES).filter(kind => samples[kind]).map(kind => {
      const def = TABLES[kind], t = { kind, cols: samples[kind] }, col = t.cols[0];
      const rows = def.rows.map(r => `<tr><td>${esc(r.label)}</td><td>${r.type === 'calc' ? (Object.values(def.typed||{}).some(ids => ids.includes(r.id)) ? 'typed' : 'shown') : 'given'}</td><td class="ex">${r.sentence ? esc(cellExplain(t, col, r)) : esc(fmtVal(r.unit, col.values[r.id]))}</td><td>${esc(r.skill||'')}</td></tr>`).join('');
      return `<h2>${esc(def.title)}</h2><p class="note">Columns: ${t.cols.map(c => esc(c.label)).join(' · ')}. Worked example uses the first column (${esc(col.label)}).</p><table><tr><th>Row</th><th>Type</th><th>Worked example</th><th>Skill id</th></tr>${rows}</table>`;
    }).join('');
    const times = timeSelfTest().map(c => `<tr><td>${esc(c.name)}</td><td class="ex">${esc(c.want)}</td></tr>`).join('');
    html = `<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"><title>Airline Simulator — Question bank</title><style>
      @page{size:A4;margin:14mm} body{font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;color:#111;font-size:12pt;line-height:1.4;max-width:190mm;margin:14mm auto;padding:0 10px}
      h1{font-family:"Courier New",monospace;letter-spacing:2px;border-bottom:3px solid #111;padding-bottom:4px} h2{margin:22px 0 4px;font-size:16pt}
      table{border-collapse:collapse;width:100%;margin:6px 0 10px;font-size:11pt} th,td{border:1px solid #999;padding:5px 8px;text-align:left;vertical-align:top} th{background:#eee;font-size:10pt;text-transform:uppercase;letter-spacing:1px} td.ex{font-family:"Courier New",monospace}
      .note{color:#555;font-size:11pt} h2.part{margin-top:30px;border-bottom:2px solid #111;font-size:18pt} .btn{font:inherit;padding:8px 16px;border:1px solid #111;background:#ffc83d;cursor:pointer} @media print{.btn{display:none}}
    </style></head><body><button class="btn" onclick="print()">Print</button>
    <h1>✈ AIRLINE SIMULATOR — QUESTION BANK</h1>
    <p class="note">Generated from the game's data blocks on ${new Date().toLocaleDateString('en-GB')}. World: <b>${esc(WORLD.name)}</b>. Every forecast-table row with how it is worked out and a worked example. Row types: <b>given</b> (filled in), <b>typed</b> (the pupil works it out; only the correct answer is accepted), <b>shown</b> (worked out by the game). Every sum is said as a sentence with its numbers.</p>
    ${sec}
    <h2>Time (shared time module)</h2><p class="note">A trip is out + turnaround (${WORLD.turnaroundMin} min) + back. Between trips there is a turnaround at home. Planes leave at ${WORLD.firstDeparture}; the airport is open ${WORLD.dayStart}–${WORLD.dayEnd}.</p>
    <table><tr><th>Case</th><th>Answer</th></tr>${times}</table>
    <h2>Captain's challenge (every two days, optional)</h2><table><tr><th>Challenge</th><th>Sum</th><th>Answer</th></tr>${CHALLENGES.map(c => `<tr><td>${esc(c.title)}</td><td class="ex">${esc(c.q)}</td><td class="ex">${num(c.answer)} ${esc(c.unit)}</td></tr>`).join('')}</table>
    </body></html>`;
  } finally { S = real; }
  const w = window.open('', '_blank'); if(!w){ toast('Pop-up blocked — allow pop-ups to open the question bank'); return; } w.document.open(); w.document.write(html); w.document.close();
}

/* ----- status strip (stands in for the IWB) ----- */
function updateStrip(){
  if(IS_DISPLAY) return;
  const live = (Date.now() - lastPong) < 8000;
  const gated = awaitingClearance(); const fl = (S.rnd.flights.length ? S.rnd.flights : planFlights()).map(f => { const r = routeById(f.route), s = gated && !f.grounded ? 'AWAITING CLEARANCE' : (S.rnd.status[f.key]||'SCHEDULED'); return `<span class="fl">${fmtTime(f.dep)} ${flagSvg(r.flag,14)} ${esc(r.city)} <span class="st ${statusClass(s)}">${s}</span></span>`; }).join('');
  $('strip').innerHTML = `<span class="label">Board</span>${fl || '<span class="muted">No flights yet</span>'}<span class="label" style="margin-left:14px">Tank</span><span class="amber">${num(S.fuel)} L</span><span class="label" style="margin-left:14px">Fuel today</span><span class="amber">${priceL(fuelPrice())}/L</span><span class="iwb ${live?'on':''}">${live ? '● IWB connected' : '○ IWB not open'}</span>`;
}
function statusClass(s){ return {'CHECK-IN':'s-checkin','PREPARING':'s-checkin','FINAL CALL':'s-final','GATE CLOSED':'s-closed','PUSHBACK':'s-taxi','TAXIING':'s-taxi','TAKE-OFF':'s-inflight','AIRBORNE':'s-inflight','DESCENDING':'s-inflight','EXPECTED':'s-scheduled','TURNAROUND':'s-turn','READY':'s-landed','AT GATE':'s-scheduled','ON TIME':'s-ontime','SCHEDULED':'s-scheduled','AWAITING CLEARANCE':'s-clearance','BOARDING':'s-boarding','DEPARTED':'s-departed','IN FLIGHT':'s-inflight','LANDED':'s-landed','FULL FLIGHT':'s-full','DELAYED':'s-delayed','DIVERTED':'s-delayed','CANCELLED':'s-cancelled','GROUNDED':'s-grounded','NO FUEL':'s-grounded'}[s] || 's-scheduled'; }

/* While the pupil works a live sum, the planes wait at the gate (brief, principle 3). */
const TASK_STEPS = ['setupPrice','fare','trips','fuel','cabin','quick','day','plane'];
function awaitingClearance(){ const t = currentTable(); const st = S && S.steps ? step().t : ''; return !!(t && t.live && t.active && TASK_STEPS.includes(st)) || st === 'challengeCalc'; }

/* ==================================================================
   WEEKS AND MONTHS (Step 2): the stage screens, reviews, the forecast, the run and its results.
   ================================================================== */
const STAGE_TEXT = {
  week: { kicker:'Milestone', title:'Your airline is settling down', lines:['Your regular flights now run every day. You do not need to manage every single flight yourself.', 'From now on, you will manage the airline <b>one week at a time</b>: the routine days run by themselves, and you make the decisions.'], gapLine:'First, watch the weekend run by itself.', go:'Run the weekend' },
  month: { kicker:'Milestone', title:"You're running a business now", lines:['Your timetable works. Micromanaging every flight no longer makes sense.', 'From now on, you manage <b>one month at a time</b>. You can run one month, three months, or until you can afford your next plane.', 'Something keeps <b>£' + '10,000 back for emergencies</b>. The clock stops whenever the CEO is needed.'], go:'Go to HQ' }
};
R.stage = st => {
  const T = STAGE_TEXT[st.stage] || STAGE_TEXT.week;
  if(st.stage === 'month' && S.reserve === undefined){ S.reserve = WORLD.reserveDefault || 10000; if(!S.target){ const np = nextPlaneUp(); if(np) S.target = np.id; } }
  screen().innerHTML = `<div class="tf stage-card"><div class="phead tf-bar" data-status="${esc(periodTag().toUpperCase())}">${esc(T.kicker)}</div>
    <div class="stage-body"><span class="sl-kicker">${st.gap ? esc(periodLabel()) : esc(periodLabel())}</span><h1 class="sl-title">${esc(T.title)}</h1>
      ${T.lines.map(l => `<p class="lede">${l}</p>`).join('')}${st.gap ? `<p class="lede amber">${T.gapLine}</p>` : ''}
      <div class="stage-scale">${['Days', 'Weeks', 'Months'].map((x, i) => `<span class="${(st.stage === 'week' && i === 1) || (st.stage === 'month' && i === 2) ? 'on' : (st.stage === 'month' && i < 2) || (st.stage === 'week' && i < 1) ? 'past' : ''}">${x}</span>`).join('<i>›</i>')}</div></div>
    <div class="tf-foot">${sayBtn(T.title + '. ' + T.lines.join(' ').replace(/<[^>]+>/g, ''))}<span class="grow"></span><button class="btn primary big" id="nx">${esc(st.gap ? T.gapLine.replace('First, watch', 'Watch').replace('.', '') : T.go)} &#9654;</button></div></div>`;
  on('nx', next);
};
/* Half-year and Year 1 reviews: look back, then set the emergency money and the plane to save for. */
R.review = st => {
  const year = st.kind === 'year', from = year ? 0 : 0, to = S.day - 1, all = ledgerSum(from, to), months = [];
  for(let d = monthStart(Math.max(1, to - (year ? 330 : 160))); d <= to; d = monthEnd(d) + 1){ const s = ledgerSum(d, Math.min(monthEnd(d), to)); if(s.days) months.push({ label: monthName(d, true), profit: s.profit }); }
  const best = months.slice().sort((a, b) => b.profit - a.profit)[0], mp = monthlyProfit(), M = v => money(Math.round(v));
  st.reserve = st.reserve !== undefined ? st.reserve : reserveNow(); st.target = st.target || S.target || (nextPlaneUp() || {}).id;
  const opts = PLANES.filter(p => p.price > 0 && !S.fleet.some(f => f.planeId === p.id)).slice(0, 3);
  screen().innerHTML = taskFrame({ question: year ? 'Year 1 Review' : 'Six months in', work:false,
    story:[year ? `One year ago, ${esc(S.airline.name)} flew its first flight.` : `Six months ago, ${esc(S.airline.name)} flew its first flight.`, `It started with ${money(WORLD.startingCash || 5000)}. Now it has ${money(S.cash)}.`],
    main:`<div class="rv-grid"><div class="rv-figs">${[['Ticket money', M(all.rev)], ['Costs', M(all.cost)], [all.profit >= 0 ? 'Profit' : 'Loss', M(Math.abs(all.profit))], ['Passengers', num(all.pax)], best ? ['Best month', `${best.label}: ${M(best.profit)}`] : null].filter(Boolean).map(([l, v]) => `<div><span class="label">${l}</span><b class="num">${v}</b></div>`).join('')}</div>
      <div class="rv-pick"><h3>Emergency money to keep back</h3><div class="choices three">${[5000, 10000, 20000].map(v => `<button class="choice small ${st.reserve === v ? 'on' : ''}" data-res="${v}"><b>${money(v)}</b><span>${v === 5000 ? 'More to spend, less safe' : v === 10000 ? 'A sensible cushion' : 'Very safe, slower to grow'}</span></button>`).join('')}</div>
      <h3>The plane to save for</h3><div class="choices three">${opts.map(p => `<button class="choice small ${st.target === p.id ? 'on' : ''}" data-tg="${p.id}"><b>${esc(p.name)}</b><span>${p.seats} seats · ${money(p.price)}</span></button>`).join('')}</div></div></div>`,
    foot:`<button class="btn primary big" id="nx">${year ? 'On to Year 2' : 'Back to work'} &#9654;</button>` });
  screen().querySelectorAll('[data-res]').forEach(b => b.onclick = () => { st.reserve = +b.getAttribute('data-res'); render(); });
  screen().querySelectorAll('[data-tg]').forEach(b => b.onclick = () => { st.target = b.getAttribute('data-tg'); render(); });
  on('nx', () => { S.reserve = st.reserve; S.target = st.target; next(); });
};
/* The forecast before a run: weeks and single months use "about £X a day", longer runs "about £X a month". */
function forecastCols(kind){
  const P = S.period, cash = S.cash;
  if(kind === 'period'){ const days = P.to - P.from + 1, day = about(dayProfitPlan()); return [{ id:'fc', label: periodShort({ type:P.type, from:P.from, to:P.to }), sub:'', values:{ day, days, total: r2(day*days), cash, cashEnd: r2(cash + day*days) } }]; }
  const month = about(monthlyProfit() || dayProfitPlan() * 30);
  if(kind === 'run'){ const n = P.run.n; return [{ id:'fc', label:`${n} months`, sub:'', values:{ month, months:n, total: r2(month*n), cash, cashEnd: r2(cash + month*n) } }]; }
  const sv = savingsState(), inv = sv.investable, needed = r2(sv.price - inv);
  return [{ id:'fc', label: sv.plane.name, sub:'', values:{ cash, reserve:sv.reserve, investable:inv, price:sv.price, needed, month, months: month > 0 ? Math.ceil(needed / month) : 0 } }];
}
R.forecast = st => {
  const kind = forecastKind(), P = S.period;
  if(!kind){ P.forecast = null; next(); return; }
  const table = { period:'periodPlan', run:'runPlan', afford:'afford' }[kind], cols = forecastCols(kind), v = cols[0].values;
  if(kind === 'afford' && v.month <= 0){ P.forecast = null; next(); return; }
  const t = ensureTable('fc:' + P.from + ':' + kind + ':' + (P.run.n||1), table, cols), done = tableComplete(t);
  const labels = kind === 'period' ? { days: P.type === 'week' ? 'Days this week' : `Days in ${monthName(P.from)}`, total: P.type === 'week' ? 'Profit this week (about)' : `Profit in ${monthName(P.from)} (about)` } : {};
  t.labels = labels;
  const q = kind === 'afford' ? `When could you afford the ${esc(v && cols[0].label)}?` : kind === 'run' ? `What might ${P.run.n} months make?` : P.type === 'week' ? 'What might this week make?' : `What might ${monthName(P.from)} make?`;
  const story = kind === 'afford' ? [`The ${esc(cols[0].label)} costs ${money(v.price)}.`, `You keep ${money(v.reserve)} back for emergencies.`, `Recently the airline makes about ${money(v.month)} a month.`]
    : kind === 'run' ? [`Recently the airline makes about ${money(v.month)} a month.`, 'Forecasts are allowed to be wrong: we will compare afterwards.']
    : [`Each day of the plan makes about ${money(v.day)} profit, after the planes' running costs.`, 'Forecasts are allowed to be wrong: we will compare afterwards.'];
  const go = kind === 'afford' ? `Run until it's affordable` : P.type === 'week' ? 'Run this week' : kind === 'run' ? `Run ${P.run.n} months` : `Simulate ${monthName(P.from)}`;
  screen().innerHTML = taskFrame({ question:q, story, back:false, say: q + ' ' + story.join(' '), main: tableHtml(t), side: sideHtml(t),
    foot: done ? `<button class="btn primary big" id="nx">${esc(go)} &#9654;</button>` : '' });
  bindTable(t); bindFrame(() => {});
  on('nx', () => { P.forecast = { kind, cash0:S.cash, fuel: fuelPrice(), total: v.total, perMonth: v.month || 0, perDay: v.day || 0, months: v.months || P.run.n || 1, cashEnd: v.cashEnd };
    if(kind === 'afford') S.affordEst = { months: v.months, made: S.day, plane: S.target };
    resetEntry(); next(); });
};
/* The run itself: the calendar ticks over, on the HQ and the wall. */
function simProgress(){ const a = S.rnd.simAnim; if(!a) return 1; return clamp((Date.now() - a.start) / a.dur, 0, 1); }
function simChips(T){
  if(T.parts.length > 1) return T.parts.map(p => ({ label:p.label || '', profit:p.profit }));
  const many = T.days.length > 10;
  return T.days.map((p, i) => ({ label: many ? String(calDate(T.from + i).getUTCDate()) : WDAY[calDate(T.from + i).getUTCDay()].slice(0, 3).toUpperCase(), profit:p }));
}
R.sim = st => {
  const T = S.rnd.sim; if(!T){ next(); return; }
  const chips = simChips(T), title = `Simulating ${periodLabel({ type:S.period.type, from:T.from, to:T.to })}`;
  screen().innerHTML = `<div class="tf sim-card"><div class="phead tf-bar" data-status="SIMULATING">${esc(title)}</div>
    <div class="sim-body"><div class="sim-chips ${chips.length > 10 ? 'dense' : ''}">${chips.map((c, i) => `<div class="sim-chip" data-i="${i}"><b>${esc(c.label)}</b><i></i><span class="num"></span></div>`).join('')}</div>
      <div class="sim-total"><span class="label">Profit so far</span><b class="num amber" id="simCash">${money(0)}</b></div>
      <p class="lede" id="simMsg">The timetable is running…</p></div>
    <div class="tf-foot"><span class="grow"></span><button class="btn big" id="skip">Skip &#9654;</button></div></div>`;
  const cash0 = r2(S.cash - T.profit - (T.autoCost ? 0 : 0)), n = chips.length, mx = Math.max(1, ...chips.map(c => Math.abs(c.profit)));
  let running = 0;
  const finish = () => { $('simMsg').innerHTML = T.paused ? `<span class="red">⚠ SIMULATION PAUSED · ${esc(T.paused.title).toUpperCase()}</span>` : 'Done. Every flight has landed.'; const b = $('skip'); b.textContent = 'See the results ▶'; b.className = 'btn primary big'; };
  function tick(){ if(step() !== st || S.overlay) return; const k = simProgress(), shown = Math.min(n, Math.floor(k * n + 1e-9) + (k >= 1 ? 0 : 0)); running = 0;
    screen().querySelectorAll('.sim-chip').forEach((el, i) => { const c = chips[i], on = i < Math.ceil(k * n); el.classList.toggle('on', on); el.classList.toggle('neg', on && c.profit < 0); if(on){ running += c.profit; el.querySelector('span').textContent = '✓ ' + money(Math.round(c.profit)); el.querySelector('i').style.height = (8 + 52 * Math.abs(c.profit) / mx) + 'px'; } });
    const ce = $('simCash'); if(ce){ ce.textContent = money(Math.round(k >= 1 ? T.profit : running)); ce.classList.toggle('red', (k >= 1 ? T.profit : running) < 0); }
    if(k < 1) requestAnimationFrame(tick); else { finish(); if(settings.auto) setTimeout(() => { if(step() === st) next(); }, 700); } }
  on('skip', () => { if(simProgress() < 1){ S.rnd.simAnim.start = 0; publish(); render(); } else next(); });
  requestAnimationFrame(tick);
};
/* Results of a week or months, one point at a time. */
function periodSlides(){
  const T = S.rnd.sim, h = S.history[S.history.length-1], p = T.profit, vs = S.rnd.vs, sl = [], tone = p > 0 && (S.rnd.repDelta || 0) >= 0 ? 'good' : p < 0 ? 'bad' : 'ok';
  const name = periodShort(h), title = tone === 'good' ? `A good ${S.period.type === 'week' ? 'week' : S.period.type === 'gap' ? 'weekend' : T.parts.length > 1 ? 'few months' : 'month'}` : tone === 'bad' ? 'A tough ' + (S.period.type === 'week' ? 'week' : 'month') : 'Results are in';
  sl.push({ kind:'p-headline', title, tone, say:`${title}. ${p >= 0 ? 'Profit' : 'Loss'} ${money(Math.abs(p))}. Cash now ${money(S.cash)}.` });
  sl.push({ kind:'p-chart', title: T.parts.length > 1 ? 'Month by month' : 'Day by day', say:`Profit in ${name}.` });
  if(vs) sl.push({ kind:'p-forecast', title:'Did your forecast come true?', say:`You forecast about ${money(vs.expProfit)} profit. The airline made ${money(vs.gotProfit)}. ${vs.reasons.join(' ')}` });
  sl.push({ kind:'p-routes', title:'Your routes', say: Object.keys(T.routes).map(id => `${routeById(id).city}: ${T.routes[id].pax} passengers.`).join(' ') });
  S.rnd.why.forEach((w, i) => sl.push({ kind:'why', w, i, n:S.rnd.why.length, title:'What made the difference?', say:w.text }));
  sl.push({ kind:'rep', title:'What passengers said', say:`Reputation ${S.rep} stars. ` + S.rnd.reviews.map(v => v.text).join(' ') });
  if(T.paused) sl.push({ kind:'p-paused', title:'Simulation paused', say:`The simulation stopped: ${T.paused.title}. The CEO is needed.` });
  return sl;
}
function periodSlideHtml(x){
  const T = S.rnd.sim, h = S.history[S.history.length-1], p = T.profit, vs = S.rnd.vs;
  if(x.kind === 'p-headline') return `<div class="sl-center"><span class="sl-kicker">${esc(periodLabel({ type:S.period.type, from:T.from, to:T.to }))} · Results</span>
    <h1 class="sl-title ${x.tone}">${esc(x.title)}</h1>
    <div class="sl-figs"><div><span class="label">${p >= 0 ? 'Profit' : 'Loss'}</span><b class="sl-big ${p<0?'neg':''}" data-count="${Math.abs(p)}">${money(0)}</b></div>
    <div><span class="label">Passengers</span><b class="sl-big white">${num(T.pax)}</b></div>
    <div><span class="label">Cash now</span><b class="sl-big white" data-count="${S.cash}" data-from="${r2(S.cash - p)}">${money(r2(S.cash - p))}</b></div></div></div>`;
  if(x.kind === 'p-chart'){ const chips = simChips(T), mx = Math.max(1, ...chips.map(c => Math.abs(c.profit)));
    return `<div class="pchart ${chips.length > 10 ? 'dense' : ''}">${chips.map((c, i) => `<div class="pc-col ${c.profit < 0 ? 'neg' : ''}" style="--i:${i}"><span class="num">${money(Math.round(c.profit))}</span><i style="--h:${(100 * Math.abs(c.profit) / mx).toFixed(1)}%"></i><b>${esc(c.label)}</b></div>`).join('')}</div>
      <p class="sl-callout" style="opacity:1;animation:none">Ticket money ${money(T.rev)} − costs ${money(T.costs)} = ${p >= 0 ? 'profit' : 'loss'} ${money(Math.abs(p))}</p>`; }
  if(x.kind === 'p-forecast'){ const mx = Math.max(Math.abs(vs.expProfit), Math.abs(vs.gotProfit), 1), close = Math.abs(vs.expProfit - vs.gotProfit) <= Math.max(50, Math.abs(vs.expProfit) * 0.05);
    return `<div class="sl-fc"><div class="sl-bar"><span class="label">You forecast about</span><i class="exp" style="--w:${(100*Math.abs(vs.expProfit)/mx).toFixed(1)}%"></i><b class="mono" data-count="${vs.expProfit}">${money(0)}</b></div>
      <div class="sl-bar"><span class="label">The airline made</span><i class="got" style="--w:${(100*Math.abs(vs.gotProfit)/mx).toFixed(1)}%"></i><b class="mono" data-count="${vs.gotProfit}">${money(0)}</b></div>
      ${vs.kind === 'afford' ? `<p class="sl-verdict ${!T.paused && S.rnd.affordDone ? 'good' : ''}">You estimated about ${plural(vs.fcMonths, 'month')}. ${T.paused ? `The run stopped after ${plural(vs.months, 'month')}.` : `It took ${plural(vs.months, 'month')}.`}</p>` : `<p class="sl-verdict ${close ? 'good' : ''}">${close ? '✓ Close. Your forecast was a good one.' : 'Not quite what you expected.'}</p>`}
      ${vs.reasons.length ? `<p class="sl-callout">${vs.reasons.map(esc).join('<br>')}</p>` : ''}</div>`; }
  if(x.kind === 'p-routes') return `<table class="hq-t big-t"><thead><tr><th>Route</th><th class="num">Flights</th><th class="num">Passengers</th><th class="num">Seats filled</th><th class="num">Ticket money</th><th class="num">Costs</th><th class="num">Profit</th></tr></thead><tbody>${Object.keys(T.routes).map(id => { const r = routeById(id), y = T.routes[id];
    return `<tr><td>${flagSvg(r.flag, 22)} ${esc(r.city)}</td><td class="num">${y.trips}</td><td class="num">${num(y.pax)}</td><td class="num">${y.seats ? Math.round(100*y.pax/y.seats) : 0}%</td><td class="num">${money(y.rev)}</td><td class="num">${money(y.cost)}</td><td class="num ${y.profit >= 0 ? 'green' : 'red'}">${money(y.profit)}</td></tr>`; }).join('')}
    <tr class="tot"><td>Planes' running costs</td><td></td><td></td><td></td><td></td><td class="num">${money(T.over)}</td><td class="num red">−${money(T.over)}</td></tr></tbody></table>`;
  if(x.kind === 'p-paused') return `<div class="sl-center"><div class="sl-why paused"><span class="ic">⚠</span><p><b>SIMULATION PAUSED</b><br>${esc(T.paused.title)}. The CEO is needed.</p></div></div>`;
  return slideHtml(x);
}
