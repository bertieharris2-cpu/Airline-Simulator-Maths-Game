
/* ==================================================================
   SCREENS BRIEF 3 (D101, Fable, 17 Oct 2026): overview → focus → consequence
   The pattern everywhere: show the few numbers needed to notice something; bring the one thing being worked on forward;
   show the consequence in place. Red only for the genuinely bad (Settings redMeans); an opportunity is quiet type with an
   'opportunity' label (opportunityDisplay).
   This part: the demand shape (demandShapeDisplay, demandStripMode). Later parts of this file add the others.
   ================================================================== */
{
/* ---------- 1. the demand shape: who wants which time, who will fly any time, and what the selected flight can catch ---------- */
/* A route's demand as a shape across the day: the five bands' time-locked passengers as solid bars, on the timetable's own
   hours, and a separate Any time bar to the right for the flexible passengers. Select a flight and the slice it can catch
   lights up in gold (its band, the passengers who'll fly any time not taken by the route's other flights, and the adapters:
   adaptToOnlyFlight's share of a band with no service); the bands it can't reach dim; a caption says it in one line. With
   two flights on the route, each flight's slice has its own shade. With nothing selected the strip shows route tabs (each
   route · All): the header always names what it shows (D100 demandStripMode). */
const DS_WORD = { early:'early', midmorning:'mid-morning', midday:'midday', afternoon:'afternoon', evening:'evening' };
function dsSel(pl){ const s = UI.tlSel; if(!s || s.i !== 0) return null; const x = pl.fleet[s.j]; if(!x || !x.sched[s.k]) return null; return { j:s.j, k:s.k, uid:x.uid, route:x.sched[s.k] }; }
function dsShape(pl, rid){
  const r = routeById(rid); if(!r) return null; const fare = pl.prices[rid] || r.basePrice;
  const base = demandPools(r, fare), fl = withPlan(pl, () => planFlights()).filter(x => x.route === rid && !x.grounded && !x.homeLeg);
  const deps = fl.map(x => x.dep), after = adaptPools(JSON.parse(JSON.stringify(base)), deps), served = new Set(fl.map(x => x.band));
  const mid = b => { const [a, z] = bandHours(b); return (a + z) * 30; };
  const bands = BANDS.map(b => { const [h0, h1] = bandHours(b), want = Math.round(base[b] || 0);
    if(served.has(b) || !deps.length) return { b, h0, h1, want, move:0, stay:served.has(b) ? 0 : want, to:null };
    const dep = deps.slice().sort((x, y) => Math.abs(x - mid(b)) - Math.abs(y - mid(b)) || x - y)[0], stay = Math.round(after[b] || 0);
    return { b, h0, h1, want, move:Math.max(0, want - stay), stay, to:bandOf(dep) }; });
  return { r, rid, fare, W:Math.round(base.W || 0), flex:Math.round(base.flex || 0), bands, fl, adaptTo:after.adaptTo || {}, served };
}
/* what one flight can catch: its band's locked passengers, the adapters sent to its band, and the any-time passengers the
   route's other flights don't carry */
function dsCatch(D, F){
  const band = D.bands.find(o => o.b === F.band), others = D.fl.filter(x => x.key !== F.key), othersFlex = others.reduce((t, x) => t + (x.flexible || 0), 0);
  const lock = band ? band.want : 0, adapt = D.adaptTo[F.band] || 0, flex = Math.max(0, D.flex - othersFlex);
  const from = D.bands.filter(o => o.to === F.band && o.move > 0).map(o => o.b), early = BANDS.indexOf(F.band);
  const dir = from.length ? (from.every(b => BANDS.indexOf(b) > early) ? 'later' : from.every(b => BANDS.indexOf(b) < early) ? 'earlier' : 'at another time') : null;
  return { lock, adapt, flex, total:lock + adapt + flex, dir, othersFlex };
}
stripHtml = function(pl, id){
  const flown = [...new Set(pl.fleet.flatMap(x => x.sched))].filter(r => routeById(r)), sel = dsSel(pl), U = UI;
  let rid = sel ? sel.route : id && routeById(id) ? id : null;
  if(!rid && U.dsTab !== 'all') rid = flown.includes(U.dsTab) ? U.dsTab : flown[0] || null;
  const tabs = !sel && flown.length > 1 ? `<span class="ds-tabs" role="tablist">${flown.map(r => `<button data-dstab="${r}" aria-selected="${rid === r}">${esc(routeById(r).city)}</button>`).join('')}<button data-dstab="all" aria-selected="${!rid}">All</button></span>` : '';
  if(!rid) return dsAllHtml(pl, flown, tabs);
  const D = dsShape(pl, rid); if(!D) return '';
  const F = sel ? D.fl.find(x => x.uid === sel.uid && x.trip === sel.k) : null, C = F ? dsCatch(D, F) : null;
  const mx = Math.max(1, D.flex, ...D.bands.map(o => o.want)), H = v => `${Math.max(v > 0 ? 3 : 0, Math.round(100 * v / mx))}%`;
  const s0 = dayStart(), e0 = dayEnd(), span = e0 - s0, X = m => 100 * (Math.max(s0, Math.min(e0, m)) - s0) / span, hm = h => `${pad(h)}:00`;
  const shade = b => !F ? 'idle' : b === F.band ? 'lit' : D.served.has(b) ? 'other' : 'dim';
  const cols = D.bands.map(o => { const w = X(o.h1 * 60) - X(o.h0 * 60), sh = shade(o.b), mvCls = !F ? 'idle' : o.to === F.band ? 'lit' : o.to ? 'other' : 'dim';
    const tip = `${BAND_SHORT[o.b]} ${hm(o.h0)}–${hm(o.h1)}: ${o.want} must fly then` + (o.move ? `; with no flight then, ${o.move} will take the nearest flight instead` : '');
    return `<div class="ds-col ${sh}" style="left:${X(o.h0 * 60).toFixed(2)}%;width:${w.toFixed(2)}%" title="${esc(tip)}"><span class="ds-n">${num(o.want)}</span><div class="ds-area"><div class="ds-stack" style="height:${H(o.want)}">${o.move ? `<i class="ds-mv ${mvCls}" style="height:${(100 * o.move / Math.max(1, o.want)).toFixed(1)}%"></i>` : ''}<i class="ds-lk"></i></div></div><span class="ds-l">${esc(BAND_SHORT[o.b])}</span></div>`; }).join('');
  const anyLit = C ? C.flex : 0, anyOther = C ? Math.min(D.flex, C.othersFlex) : 0;
  const any = `<div class="ds-any ${F ? 'sel' : ''}" title="${num(D.flex)} will fly at any time"><span class="ds-n">${num(D.flex)}</span><div class="ds-area"><div class="ds-stack" style="height:${H(D.flex)}">${F ? `<i class="ds-af other" style="height:${(100 * anyOther / Math.max(1, D.flex)).toFixed(1)}%"></i><i class="ds-af lit" style="height:${(100 * anyLit / Math.max(1, D.flex)).toFixed(1)}%"></i>` : '<i class="ds-af idle" style="height:100%"></i>'}</div></div><span class="ds-l">Any time</span></div>`;
  const seats = F ? F.seats : 0, word = F ? DS_WORD[F.band] || F.band : '';
  const parts = F ? [C.lock ? `the ${word} passengers` : null, C.flex ? "those who'll fly any time" : null, C.adapt ? `some who'd rather go ${C.dir}` : null].filter(Boolean) : [];
  const list = parts.length > 2 ? parts.slice(0, -1).join(', ') + ', and ' + parts[parts.length - 1] : parts.length === 2 ? parts.join(' and ') : parts[0] || 'no one';
  const cap = F ? `The ${fmtTime(F.dep)} can catch ${num(C.total)} of the ${num(D.W)} — ${list}.${seats && C.total > seats ? ` It has ${num(seats)} seats.` : ''}`
    : D.fl.length ? `Select a ${esc(D.r.city)} flight to see which of these passengers it can catch.` : `No ${esc(D.r.city)} flight on the plan yet: + Service adds one.`;
  const pulse = F && U.dsLast && U.dsLast.key === F.key && U.dsLast.dep !== F.dep ? ' pulse' : '';
  U.dsLast = F ? { key:F.key, dep:F.dep } : null;
  return `<div class="st-strip ds3" data-strip="${rid}"><div class="st-sl"><b>${flagSvg(D.r.flag, 14)} ${esc(D.r.city)} at ${money(D.fare)}: ${num(D.W)} want to fly</b>
      <span class="st-key ds-key"><span><i class="lk"></i>must fly at that time</span><span><i class="fx"></i>will fly any time</span>${F ? '<span><i class="gd"></i>this flight can catch</span>' : ''}</span>${tabs}</div>
    <div class="st-sb ds-sb">${cols}</div>${any}<p class="ds-cap${pulse}" data-k="ds-cap">${cap}</p></div>`;
};
/* All: every flown route's bands and any-time passengers, added up; no flight slice (a flight belongs to one route) */
function dsAllHtml(pl, flown, tabs){
  const Ds = flown.map(r => dsShape(pl, r)).filter(Boolean), W = Ds.reduce((t, D) => t + D.W, 0), flex = Ds.reduce((t, D) => t + D.flex, 0);
  const bands = BANDS.map(b => { const [h0, h1] = bandHours(b); return { b, h0, h1, want:Ds.reduce((t, D) => t + D.bands.find(o => o.b === b).want, 0) }; });
  const mx = Math.max(1, flex, ...bands.map(o => o.want)), H = v => `${Math.max(v > 0 ? 3 : 0, Math.round(100 * v / mx))}%`;
  const s0 = dayStart(), e0 = dayEnd(), span = e0 - s0, X = m => 100 * (Math.max(s0, Math.min(e0, m)) - s0) / span;
  const cols = bands.map(o => `<div class="ds-col idle" style="left:${X(o.h0 * 60).toFixed(2)}%;width:${(X(o.h1 * 60) - X(o.h0 * 60)).toFixed(2)}%"><span class="ds-n">${num(o.want)}</span><div class="ds-area"><div class="ds-stack" style="height:${H(o.want)}"><i class="ds-lk"></i></div></div><span class="ds-l">${esc(BAND_SHORT[o.b])}</span></div>`).join('');
  return `<div class="st-strip ds3" data-strip=""><div class="st-sl"><b>All routes at your fares: ${num(W)} want to fly</b><span class="st-key ds-key"><span><i class="lk"></i>must fly at that time</span><span><i class="fx"></i>will fly any time</span></span>${tabs}</div>
    <div class="st-sb ds-sb">${cols}</div><div class="ds-any"><span class="ds-n">${num(flex)}</span><div class="ds-area"><div class="ds-stack" style="height:${H(flex)}"><i class="ds-af idle" style="height:100%"></i></div></div><span class="ds-l">Any time</span></div>
    <p class="ds-cap">Choose a route to see its shape; select a flight to see what it can catch.</p></div>`;
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-dstab]'); if(!b) return; UI.dsTab = b.getAttribute('data-dstab'); if(UI.s2) UI.s2.strip = null; render(); });
window.__ds = { shape:(rid) => { const D = dsShape(currentPlan(), rid); return D && { W:D.W, flex:D.flex, bands:D.bands, adaptTo:D.adaptTo, flights:D.fl.map(x => ({ dep:x.dep, band:x.band, seats:x.seats, sold:x.sold, catch:dsCatch(D, x).total })) }; } };

/* ---------- 2. the Studio: the route list folds to one line; one fixed bar for the selected flight ---------- */
/* Overview → focus → consequence (Settings activeRoutesCollapsible, flightInspector). With more than two routes the Active
   routes table folds to one line ("7 routes · 9 flights a day · 98% filled · 2 need attention") with a chip per route
   (flag, code, fare, an 8 px fill bar, an amber dot if the route has a tip worth acting on, D97); a chip selects the route
   (the strip switches to it, its flights are marked), the line opens the table, Esc folds it again. Selecting a flight puts
   its controls in a bar under the timetable, always the same height and in the same place: Earlier · Later · Route ·
   Fare · Days · Aircraft · Service costs · Remove, the worth line on the right after a change. The floating box has gone. */
const s3Fold = (U, n) => WBS().activeRoutesCollapsible !== false && n > 2 && U.fold !== false;
function s3Attention(pl, L){ try{ return new Set(dsTips(pl, L).filter(h => h.route && (h.stake === undefined || h.stake > 0 || h.priority <= 1)).map(h => h.route)); }catch(e){ return new Set(); } }
const s3Routes0 = s2Routes;
s2Routes = function(pl, L, ids){
  const U = UI.s2; if(!s3Fold(U, ids.length)){ const h = s3Routes0.apply(this, arguments); return ids.length > 2 && WBS().activeRoutesCollapsible !== false ? h.replace('<span class="grow"></span>', '<span class="grow"></span><button class="btn small s3-foldb" id="s3Fold" title="Fold the table to one line (Esc)">Fold &#9652;</button>') : h; }
  const flights = pl.fleet.reduce((t, x) => t + x.sched.length, 0), F = s2Fill(L.services || []), att = s3Attention(pl, L), n = ids.filter(id => att.has(id)).length;
  const chip = id => { const r = routeById(id), fare = pl.prices[id] || r.basePrice, f = s2Fill(s2Svc(L, id)), on = U.chip === id;
    return `<button class="s3-chip ${on ? 'on' : ''}" data-s3chip="${id}" title="${esc(r.city)}: ${money(fare)}, ${f.pct}% filled${att.has(id) ? ' · worth a look' : ''}">${flagSvg(r.flag, 15)}<b>${esc(r.code || id.toUpperCase())}</b><span class="mono">${money(fare)}</span><i class="s3-fb fill-${f.cls}"><i style="width:${f.pct}%"></i></i>${att.has(id) ? '<i class="s3-dot" aria-label="worth a look"></i>' : ''}</button>`; };
  return `<section class="dk-pnl s2-routes s3-fold"><button class="s3-line" id="s3Open" title="Open the routes table: fares and services">${ICO2.route}<b>${plural(ids.length, 'route')} · ${plural(flights, 'flight')} a day · ${F.pct}% filled${n ? ` · ${n} ${n === 1 ? 'needs' : 'need'} attention` : ''}</b><span class="s3-open">Open &#9662;</span></button>
    <span class="s3-chips">${ids.map(chip).join('')}</span><button class="btn small s2-netb" id="s2AddNet">${ICO2.plus} Add / change routes</button></section>`;
};
/* the chip's route is marked on the timetable */
const s3Block0 = s2Block;
s2Block = function(i, pl, L, x, j, t, k){ const h = s3Block0.apply(this, arguments); return UI.s2 && UI.s2.chip && t.route === UI.s2.chip ? h.replace('class="ad-blk st-blk s2-blk ', 'class="ad-blk st-blk s2-blk hl s3-hl ') : h; };
/* the inspector bar: in place of the floating box, under the timetable, the same height whatever is selected */
function s3Worth(pl, L, sel){
  const B = UI.s3Base; if(!B || B.j !== sel.j || B.k0 === undefined) return '';
  const x = pl.fleet[sel.j], id = x && x.sched[sel.k]; if(!id) return ''; const r = routeById(id), fare = pl.prices[id] || r.basePrice;
  const now = (L.routes || []).find(z => z.id === id) || {}, was = B.routes[id] || { pax:0, fare };
  if(B.key === planKey(pl)) return '';
  const a = now.pax || 0, d = a * fare - was.pax * was.fare;
  if(!d) return `<span class="s3-worth same" data-k="s3w">No change in ${esc(r.city)} tickets: <span class="mono">${num(a)} × ${money(fare)}</span> a day</span>`;
  return `<span class="s3-worth ${d >= 0 ? 'up' : 'down'}" data-k="s3w"><span class="mono">${num(a)} × ${money(fare)} − ${num(was.pax)} × ${money(was.fare)}</span> = <b class="mono">${money(Math.abs(d))}</b> ${d >= 0 ? 'more' : 'less'} a day in ${esc(r.city)} tickets</span>`;
}
const s3Svc0 = s2SvcEditor;
s2SvcEditor = function(pl, L, sel){
  const x = pl.fleet[sel.j], p = planeById(x.planeId), id0 = x.sched[sel.k]; if(!id0) return '';
  const dps = x.deps && x.deps.length === x.sched.length ? x.deps : actualDeps(pl, sel.j), r = routeById(id0), dep = dps[sel.k], arr = dep + TIME.roundTrip(p, r), dy = daysFix(x.days, x.sched.length)[sel.k];
  const s = (L.services || []).find(z => z.uid === x.uid && z.k === sel.k) || {}, a = `0|${sel.j}|${sel.k}`, fare = pl.prices[r.id] || r.basePrice;
  const routes = plannerOrder().filter(id => planeCanFly(p, routeById(id))), planes = pl.fleet.map((y, q) => ({ y, q })).filter(({ y, q }) => q !== sel.j && planeCanFly(planeById(y.planeId), r));
  const key = `${sel.j}|${sel.k}|${x.uid}`; if(!UI.s3Base || UI.s3Base.sel !== key){ UI.s3Base = { sel:key, j:sel.j, k0:sel.k, key:planKey(pl), routes:Object.fromEntries((L.routes || []).map(z => [z.id, { pax:z.pax, fare:pl.prices[z.id] || routeById(z.id).basePrice }])) }; }
  return `<div class="s2-pop s3-insp" id="s2Pop" role="group" aria-label="The ${esc(r.city)} ${fmtTime(dep)} flight">
    <div class="s3-ir1"><span class="s3-id">${flagSvg(r.flag, 16)}<b>${esc(r.city)}</b><span class="mono">${fmtTime(dep)}–${fmtTime(arr)}</span><span class="mono">${num(s.sold || 0)}/${num(s.seats || p.seats)}</span><span>${esc(shortPlane(p))}</span></span>
      <span class="s2-pop-b s3-ctl"><button class="btn small" data-insm="${a}|-5" title="5 minutes earlier (hold to keep moving)">&#9664; Earlier</button><button class="btn small" data-insm="${a}|5" title="5 minutes later (hold to keep moving)">Later &#9654;</button>
        <select data-s2rt="${sel.j}|${sel.k}" aria-label="Route" title="Route">${routes.map(id => `<option value="${id}" ${id === r.id ? 'selected' : ''}>${esc(routeById(id).city)}</option>`).join('')}</select>
        <select data-s2fr="${r.id}" aria-label="Fare" title="Fare">${(r.fares || [r.basePrice]).map(f => `<option value="${f}" ${f === fare ? 'selected' : ''}>${money(f)} · ${paxWant(r, f)} want</option>`).join('')}</select>
        ${S2V.fd ? `<select data-s2dy="${sel.j}|${sel.k}" aria-label="Days" title="Which days this flight flies">${DAYS_KEYS.map(v => `<option value="${v}" ${v === dy ? 'selected' : ''}>${daysLabel(v)}</option>`).join('')}</select>` : ''}
        <select data-s2ac="${sel.j}|${sel.k}" aria-label="Aircraft" title="Aircraft" ${planes.length ? '' : 'disabled'}><option value="">${esc(shortPlane(p))} · ${esc(regOf(x.uid))}</option>${planes.map(({ y, q }) => `<option value="${q}">${esc(shortPlane(planeById(y.planeId)))} · ${esc(regOf(y.uid))}</option>`).join('')}</select>
        <button class="btn small sc-open" data-svccard="${a}" title="This flight's fuel, costs and profit">Service costs</button><button class="btn small danger" data-tlrm="${a}" title="Remove (or press Delete)">Remove</button></span>
      <button class="dk-x s3-x" id="s2PopX" aria-label="Deselect (Esc)">&times;</button></div>
    <div class="s3-ir2">${s3Worth(pl, L, sel)}</div></div>`;
};
/* the empty bar when no flight is selected: the timetable's last child, so it never moves */
const s3Tt0 = s2Timetable;
s2Timetable = function(pl, L){ const h = s3Tt0.apply(this, arguments); if((UI.stView || 'day') !== 'day' || /id="s2Pop"/.test(h)) return h; const i = h.lastIndexOf('</section>');
  return h.slice(0, i) + `<div class="s2-pop s3-insp empty"><div class="s3-ir1"><span class="s3-id muted">Select a flight to change it.</span></div><div class="s3-ir2"></div></div>` + h.slice(i); };
/* the bar is not placed by the block any more */
const s3Place0 = s2PopPlace;
s2PopPlace = function(){ const pop = $('s2Pop'); if(pop && pop.classList.contains('s3-insp')) return; return s3Place0.apply(this, arguments); };
/* Earlier and Later: 5 minutes a press, and on while held */
let s3Hold = null;
function s3Move(spec){ const [i, j, k, d] = spec.split('|').map(Number), blk = screen().querySelector(`[data-tl="${i}|${j}|${k}"]`); if(!blk) return false; const keep = PLW_SNAP; PLW_SNAP = 5; try{ moveService(i, j, k, +blk.dataset.dep + d); } finally { PLW_SNAP = keep; } return true; }
function s3HoldStop(){ if(s3Hold){ clearTimeout(s3Hold.t); clearInterval(s3Hold.iv); s3Hold = null; } }
document.addEventListener('pointerdown', e => { const b = e.target.closest && e.target.closest('[data-insm]'); if(!b || b.disabled) return; e.preventDefault(); s3HoldStop();
  const d = +b.getAttribute('data-insm').split('|')[3], step1 = () => { const sel = UI.tlSel; if(!sel) return s3HoldStop(); s3Move(`${sel.i}|${sel.j}|${sel.k}|${d}`); };
  step1(); s3Hold = { t:setTimeout(() => { if(s3Hold) s3Hold.iv = setInterval(step1, 140); }, 420) }; });
['pointerup', 'pointercancel', 'blur'].forEach(ev => window.addEventListener(ev, s3HoldStop));
document.addEventListener('keydown', e => { if(e.key !== 'Enter' && e.key !== ' ') return; const b = e.target.closest && e.target.closest('[data-insm]'); if(!b) return; e.preventDefault(); const sel = UI.tlSel; if(sel) s3Move(`${sel.i}|${sel.j}|${sel.k}|${+b.getAttribute('data-insm').split('|')[3]}`); });
/* the line, the chips and Esc */
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('#s3Open, #s3Fold, [data-s3chip]'); if(!t || !UI.s2) return;
  if(t.id === 's3Open'){ UI.s2.fold = false; }
  else if(t.id === 's3Fold'){ UI.s2.fold = true; }
  else { const id = t.getAttribute('data-s3chip'); UI.s2.chip = UI.s2.chip === id ? null : id; UI.dsTab = UI.s2.chip || UI.dsTab; UI.tlSel = null; }
  render();
});
document.addEventListener('keydown', e => { if(e.key !== 'Escape' || !UI.s2 || UI.s2.fold !== false || UI.tlSel || !document.querySelector('.s2-routes:not(.s3-fold)')) return; if(document.querySelector('#s2Pop:not(.empty), .s2-ed, .s2-dr')) return; UI.s2.fold = true; render(); });
/* the fare chips (D87) go in the bar's second row, unless the worth line is there */
const s3Render0 = render;
render = function(){ const r = s3Render0.apply(this, arguments); try{ const ch = document.querySelector('.s3-insp .s3-ir1 .ds-chips'), r2 = document.querySelector('.s3-insp .s3-ir2');
    if(ch && r2){ if(r2.children.length) ch.remove(); else r2.appendChild(ch); } }catch(e){} return r; };
/* the operations check sits in the plan summary's right-hand slot, not in a banner over the button */
const s3After0 = dsAfterPlan;
dsAfterPlan = function(){ const r = s3After0.apply(this, arguments); try{
    const root = screen(), hint = root.querySelector('.actbar .ab-hint .ds-hint'), sum = root.querySelector('.s2-sum'), tr = sum && sum.querySelector('#s2Tr');
    if(hint && sum && tr && !sum.querySelector('.s3-ck') && !sum.querySelector('.ds-sumi') && !hint.querySelector('.ds-wb, .ds-wbuild, .ds-imp')){
      const ck = document.createElement('span'); ck.className = 's3-ck'; while(hint.firstChild) ck.appendChild(hint.firstChild); sum.insertBefore(ck, tr);
      const ab = hint.closest('.actbar'); if(ab) ab.classList.remove('ds-abar'); hint.remove(); }
  }catch(e){} return r; };

/* ---------- 3. flight times: once for the whole game, in hours and minutes, one table that never stretches ---------- */
/* flightTimeDecay: a flight-time sum is Calculate twice in the game, then Build once, then the model's, whatever the
   aircraft and the route; a plane already flying a route is never asked about it. The page appears only while the sum
   is still Calculate or Build; after that the table is the model's, on the Fleet desk (Flight times), never a gate.
   timeAnswerFormat: "225 km ÷ 900 km/h = ? h ? min", an hours box and a minutes selector (0 · 15 · 30 · 45), to the
   nearest quarter of an hour; no decimal hours anywhere. flightTimesTable: equal columns, the route on the left, the
   aircraft side by side and a Fastest saves column; the cell being worked out shows a gold ? and the instrument opens
   below the table; on Check the answer rises into its cell. One line of meaning under the table. */
const FT_MIN = [0, 15, 30, 45], ftQ = h => Math.round(h * 4) / 4;
const ftParts = h => { const q = ftQ(h), a = Math.floor(q + 1e-9); return { h:a, m:Math.round((q - a) * 60) }; };
const ftHMq = h => { const { h:a, m } = ftParts(h); return `${a ? a + ' h' : ''}${a && m ? ' ' : ''}${m ? m + ' min' : ''}` || '0 min'; };
function ftDone(){ const F = ftS(); if(F.n === undefined) F.n = Object.values(F.asked || {}).reduce((t, A) => t + (Array.isArray(A) ? A.filter(x => x.done).length : 0), 0); return F.n; }
function ftLevel(){ const n = ftDone(); return WBS().flightTimeDecay === undefined ? 'calc' : n < 2 ? 'calc' : n < 3 ? 'build' : 'model'; }
const ftNew0 = ftNew;
ftNew = function(){
  const out = ftNew0(); if(!out.length) return out; const F = ftS(), flown = new Set(S.fleet.flatMap(f => schedOf(f).map(r => f.planeId + '|' + r)));
  out.filter(k => flown.has(k)).forEach(k => { if(!F.seen.includes(k)) F.seen.push(k); });   // a plane already flying a route is never asked about it
  const keep = out.filter(k => !flown.has(k));
  if(keep.length && ftLevel() === 'model'){ keep.forEach(k => { if(!F.seen.includes(k)) F.seen.push(k); }); (F.log = F.log || []).push({ day:S.day, pairs:keep.length, model:true }); return []; }
  return keep;
};
const ftPage0 = ftPage;
ftPage = function(){
  const P = ftPage0(); if(!P) return P;
  if(P.items.length && P.items[0].lvl === undefined){ const lv = ftLevel(), want = lv === 'build' ? 1 : Math.max(1, 2 - ftDone()); P.items.splice(want); P.items.forEach(x => { x.lvl = lv; x.h = ''; x.m = 0; x.seq = []; }); }
  return P;
};
const FT_WORD = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
function ftMeaning(P){
  if(P.types.length < 2) return ''; const lo = planeById(P.types[0]), hi = planeById(P.types[P.types.length - 1]);
  const rid = P.rids.find(id => [lo, hi].every(p => typeof planeCanFly !== 'function' || planeCanFly(p, routeById(id)))); if(!rid) return '';
  const r = routeById(rid), a = ftQ(ftHours(lo, r)), b = ftQ(ftHours(hi, r)); if(!(b > 0) || a - b < 0.25) return '';
  const n = Math.floor(a / b + 1e-9);
  return n >= 2 ? `The ${esc(shortPlane(hi))} can fly to ${esc(r.city)} and back ${FT_WORD[n] || n} times before the ${esc(shortPlane(lo))} has done it once.`
    : `The ${esc(shortPlane(hi))} is back from ${esc(r.city)} ${ftHMq(2 * (a - b))} before the ${esc(shortPlane(lo))} on a return trip.`;
}
function ftHint(p, r){
  const h = ftHours(p, r), q = ftQ(h), { h:a, m } = ftParts(h), frac = { 0:'', 15:'a quarter', 30:'a half', 45:'three quarters' }[m];
  const many = a ? (frac ? `${a} and ${frac}` : `${a}`) : frac;
  return `How many ${num(p.speed)}s fit in ${num(routeKm(r))}? ${many.charAt(0).toUpperCase() + many.slice(1)}${Math.abs(h - q) > 1e-6 ? ', near enough' : ''}. ${a ? `${a} hour${a === 1 ? '' : 's'}${m ? ` and ${m} minutes` : ''}` : `${frac.charAt(0).toUpperCase() + frac.slice(1)} of an hour is ${m} minutes`}.`;
}
ftHtml = function(P){
  const asked = Object.fromEntries(P.items.map(x => [x.k, x])), act = P.items.find(x => !x.done), U = UI;
  const head = `<tr><th>Route</th>${P.types.map(pid => { const p = planeById(pid); return `<th>${esc(shortPlane(p))} <small>(${num(p.speed)} km/h)</small></th>`; }).join('')}${P.types.length > 1 ? '<th>Fastest saves</th>' : ''}</tr>`;
  const row = rid => { const r = routeById(rid), can = P.types.filter(pid => typeof planeCanFly !== 'function' || planeCanFly(planeById(pid), r));
    const cells = P.types.map(pid => { const p = planeById(pid), k = pid + '|' + rid, a = asked[k];
      if(!can.includes(pid)) return '<td class="ft3-c no">too far</td>';
      if(a && !a.done) return `<td class="ft3-c ${a === act ? 'act' : 'wait'}" data-ftcell="${k}"><b>?</b></td>`;
      return `<td class="ft3-c ${a ? 'mine' : ''} ${U.ftJust === k ? 'just' : ''}" data-ftcell="${k}">${ftHMq(ftHours(p, r))}${a ? (a.shown ? ' <i class="ft3-st fin">Finance</i>' : ' <i class="ft3-st">✓</i>') : ''}</td>`; }).join('');
    const ts = can.map(pid => ftQ(ftHours(planeById(pid), r))), sv = can.length > 1 ? Math.max(...ts) - Math.min(...ts) : 0, open = can.some(pid => asked[pid + '|' + rid] && !asked[pid + '|' + rid].done);
    const slow = can[ts.indexOf(Math.max(...ts))], fast = can[ts.indexOf(Math.min(...ts))];
    const save = P.types.length < 2 ? '' : `<td class="ft3-sv" ${sv && !open ? `title="${esc(shortPlane(planeById(slow)))} ${ftHMq(Math.max(...ts))} → ${esc(shortPlane(planeById(fast)))} ${ftHMq(Math.min(...ts))}: ${ftHMq(sv)} faster"` : ''}>${open ? '…' : sv ? `${ftHMq(sv)} each way` : '—'}</td>`;
    return `<tr><th><span class="ft-c">${flagSvg(r.flag, 16)} ${esc(r.city)}</span> <small>· ${num(routeKm(r))} km</small></th>${cells}${save}</tr>`; };
  const mean = !act ? ftMeaning(P) : '';
  return `<section class="dk-pnl ft-pnl ft3"><div class="dk-pnl-h">${ICO2.plane || ''}<h2>How long each aircraft takes</h2><span class="grow"></span><span class="sub">time in the air, one way: distance ÷ speed</span></div>
    <table class="dk-t ft-t ft3-t"><colgroup><col class="ft3-rc">${P.types.map(() => '<col>').join('')}${P.types.length > 1 ? '<col>' : ''}</colgroup><thead>${head}</thead><tbody>${P.rids.map(row).join('')}</tbody></table>
    ${mean ? `<p class="ft3-mean">${mean}</p>` : ''}</section>${act ? ftInstrument(act) : ''}`;
};
function ftInstrument(a){
  const [pid, rid] = a.k.split('|'), p = planeById(pid), r = routeById(rid), key = 'ftp:' + a.k, what = `${shortPlane(p)} to ${r.city}`;
  if(a.lvl === 'build'){
    const figs = [['dist', `${num(routeKm(r))} km`], ['speed', `${num(p.speed)} km/h`]], ops = ['×', '÷'], show = x => (figs.find(f => f[0] === x) || [x, x])[1];
    return `<section class="dk-pnl ft3-ins" data-ftins="${a.k}">${sumHeadHtml(key, `Flight time: ${what}`)}<p class="ft3-lv">Build: choose the two figures and the sign; the model works it out</p>
      <p class="ft3-q">Flight time = <span class="ft3-seq">${a.seq.length ? a.seq.map(show).map(esc).join(' ') : '<i>?</i>'}</span></p>
      <div class="ft3-row">${figs.map(([k, l]) => `<button class="btn small" data-ftbfig="${k}">${esc(l)}</button>`).join('')}${ops.map(o => `<button class="btn small" data-ftbop="${o}">${o}</button>`).join('')}<button class="dk-link" data-ftbclr="1">Clear</button><span class="grow"></span><button class="btn primary" data-ftpchk="${a.k}">Check ✓</button></div>
      <p class="sc-msg" role="status">${esc(a.msg || '')}</p></section>`;
  }
  return `<section class="dk-pnl ft3-ins" data-ftins="${a.k}">${sumHeadHtml(key, `${what}`)}
    <p class="ft3-q"><span class="mono">${num(routeKm(r))} km ÷ ${num(p.speed)} km/h =</span>
      <span class="sc-in ${a.q ? 'qy' : ''}"><input data-ftph="${a.k}" inputmode="numeric" autocomplete="off" value="${esc(a.h)}" aria-label="Hours" size="2"></span> h
      <select data-ftpm="${a.k}" aria-label="Minutes">${FT_MIN.map(m => `<option value="${m}" ${+a.m === m ? 'selected' : ''}>${m}</option>`).join('')}</select> min</p>
    <div class="ft3-row"><button class="dk-link" data-fthint="${a.k}" aria-expanded="${!!a.hint}">Give me a hint</button><span class="grow"></span><button class="btn primary" data-ftpchk="${a.k}">Check ✓</button></div>
    ${a.hint ? `<p class="ft3-hint">${esc(ftHint(p, r))}</p>` : ''}<p class="sc-msg" role="status">${esc(a.msg || '')}</p></section>`;
}
ftCheck = function(a){
  const [pid, rid] = a.k.split('|'), p = planeById(pid), r = routeById(rid), h = ftHours(p, r), q = ftQ(h), key = 'ftp:' + a.k, F = ftS();
  const done = shown => { a.done = true; a.shown = !!shown; a.q = false; a.msg = ''; F.n = ftDone() + 1; UI.ftJust = a.k; if(typeof soTouch === 'function') soTouch('flightTime', { route:rid, count:true }); const sk = skills().flightTime; if(sk && !sk.routes.includes(rid)) sk.routes.push(rid);
    (S.handSumLog = S.handSumLog || []).push({ day:S.day, date:dateShort(S.day), tools:[`Flight time: ${shortPlane(p)} to ${r.city} (${a.lvl === 'build' ? 'Build' : 'Calculate'})`] }); save(); };
  if(a.lvl === 'build'){
    const e = recOpen(key, { type:'build', relKey:'flightTime', doc:`Flight time: ${shortPlane(p)} to ${r.city}`, ask:`What gives the flight time of the ${shortPlane(p)} to ${r.city}?`, question:`${num(routeKm(r))} km ÷ ${num(p.speed)} km/h`, unit:'h', correct:q, correctText:ftHMq(h), ops:[routeKm(r), p.speed], op:'÷', level:'Build' });
    const ok = a.seq.join(' ') === 'dist ÷ speed'; recAttempt(e, { ok, given:a.seq.join(' '), method:'distance ÷ speed' });
    if(ok){ done(false); return; } a.tries = (a.tries || 0) + 1;
    if(a.tries >= 2 && (typeof twoTriesOn !== 'function' || twoTriesOn())){ if(typeof paperRecShown === 'function') paperRecShown(key); done(true); return; }
    a.msg = a.seq.includes('×') ? 'Query: distance × speed would be far too big. Divide the distance by the speed. One more try.' : a.seq[0] === 'speed' ? 'Query: that way round is the wrong sum. Distance first, then ÷ the speed. One more try.' : 'Query: the distance ÷ the speed. One more try.'; a.seq = []; return;
  }
  if(a.h === '' || isNaN(+a.h)){ a.msg = 'Type the hours (0 if it is under an hour), then choose the minutes.'; return; }
  const v = (+a.h) + (+a.m || 0) / 60, given = `${+a.h} h ${+a.m || 0} min`;
  const e = recOpen(key, { type:'calc', relKey:'flightTime', doc:`Flight time: ${shortPlane(p)} to ${r.city}`, ask:`How long does the ${shortPlane(p)} take to fly ${num(routeKm(r))} km at ${num(p.speed)} km/h?`,
    question:`${num(routeKm(r))} km ÷ ${num(p.speed)} km/h`, unit:'h min', correct:q, correctText:ftHMq(h), ops:[routeKm(r), p.speed], op:'÷', level:'Calculate' });
  const ok = Math.abs(v - q) < 1e-6;
  recAttempt(e, { ok, given, value:v, method:'distance ÷ speed' });
  if(ok){ done(false); return; }
  a.tries = (a.tries || 0) + 1;
  if(a.tries >= 2 && (typeof twoTriesOn !== 'function' || twoTriesOn())){ if(typeof paperRecShown === 'function') paperRecShown(key); done(true); return; }
  a.q = true; const cov = Math.round(v * p.speed);
  a.msg = `Query: ${v > q ? `too long: ${given} at ${num(p.speed)} km/h covers ${num(cov)} km.` : `too short: ${given} at ${num(p.speed)} km/h covers only ${num(cov)} km.`} The route is ${num(routeKm(r))} km. One more try.`;
};
renderFtp = function(st, P){
  const left = P.items.filter(x => !x.done).length;
  screen().innerHTML = shell(deskPage({ title:'Flight times', sub:'Before the timetable: how long each of your aircraft takes to fly each new route.', cls:'ftp-page ft3-page', body:ftHtml(P) }),
    deskBar(left ? 'Work out the flight time below, then go on to the timetable.' : 'Now plan the timetable: a faster aircraft fits more flights into a day.', `<button class="btn primary big" id="ftpGo" ${left ? 'disabled' : ''}>${left ? 'Work out the flight time first' : 'On to the timetable'} &#9654;</button>`));
  const root = screen(), A = k => P.items.find(x => x.k === k);
  root.querySelectorAll('[data-ftph]').forEach(i => { const a = A(i.getAttribute('data-ftph')); i.oninput = () => { a.h = i.value.replace(/[^\d]/g, ''); }; i.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); const c = root.querySelector(`[data-ftpchk="${a.k}"]`); if(c) c.click(); } }; });
  root.querySelectorAll('[data-ftpm]').forEach(sel => { const a = A(sel.getAttribute('data-ftpm')); sel.onchange = sel.oninput = () => { a.m = +sel.value; }; });
  root.querySelectorAll('[data-fthint]').forEach(b => b.onclick = () => { const a = A(b.getAttribute('data-fthint')); a.hint = !a.hint; render(); });
  const act = P.items.find(x => !x.done);
  root.querySelectorAll('[data-ftbfig]').forEach(b => b.onclick = () => { if(act && act.seq.length !== 1 && act.seq.length < 3){ act.seq.push(b.getAttribute('data-ftbfig')); render(); } });
  root.querySelectorAll('[data-ftbop]').forEach(b => b.onclick = () => { if(act && act.seq.length === 1){ act.seq.push(b.getAttribute('data-ftbop')); render(); } });
  root.querySelectorAll('[data-ftbclr]').forEach(b => b.onclick = () => { if(act){ act.seq = []; render(); } });
  root.querySelectorAll('[data-ftpchk]').forEach(b => b.onclick = () => { const a = A(b.getAttribute('data-ftpchk')); ftCheck(a); render(); });
  on('ftpGo', () => { if(P.items.some(x => !x.done)) return; const F = ftS(); P.fresh.forEach(k => { if(!F.seen.includes(k)) F.seen.push(k); });
    F.log.push({ day:S.day, pairs:P.fresh.length, asked:P.items.map(x => x.k) }); UI.ftJust = null; save(); render(); });
  if(UI.ftJust) setTimeout(() => { UI.ftJust = null; }, 1200);
  const ph = root.querySelector('[data-ftph]'); if(ph && !ph.value) setTimeout(() => { try{ ph.focus(); }catch(e){} }, 30);
};
ftpPlan = function(){ const P = ftNew().length ? ftPage() : null; if(!P) return null; const a = P.items.find(x => !x.done);
  if(!a) return { pairs:P.fresh, asked:P.items.map(x => x.k), next:null };
  const [pid, rid] = a.k.split('|'), h = ftHours(planeById(pid), routeById(rid)), pt = ftParts(h);
  return { pairs:P.fresh, asked:P.items.map(x => x.k), level:a.lvl, next:a.lvl === 'build' ? { key:a.k, build:['dist', '÷', 'speed'] } : { key:a.k, h:pt.h, m:pt.m, answer:ftQ(h) } }; };
/* the model's table on request: Fleet desk → Flight times (every aircraft type against every open route) */
function ftTableOpen(){
  const types = [...new Set(S.fleet.map(f => f.planeId))].sort((a, b) => planeById(a).speed - planeById(b).speed), rids = openRoutes(S.day || 1).map(r => r.id);
  const P = { types, rids, items:[], fresh:[] }, box = document.createElement('div'); box.className = 'ft3-modal'; box.id = 'ftModal';
  box.innerHTML = `<div class="ft3-mbox">${ftHtml(P)}<div class="ft3-mf"><span class="muted">Worked out by the model: distance ÷ speed, to the nearest quarter of an hour.</span><span class="grow"></span><button class="btn" id="ftModalX">Close</button></div></div>`;
  document.body.appendChild(box); const x = () => box.remove(); box.querySelector('#ftModalX').onclick = x; box.onclick = e => { if(e.target === box) x(); };
}
const ftView0 = renderView;
renderView = function(v){ const r = ftView0.apply(this, arguments); try{ if(v === 'fleet' && S && S.fleet && S.fleet.length && ftLevel() === 'model'){ const host = screen().querySelector('.vw'); if(host && !host.querySelector('.ft3-ask')){
    host.insertAdjacentHTML('beforeend', `<section class="hp ft3-ask">${hqHead('Flight times', 'THE MODEL')}<div class="pb"><p class="muted">How long each of your aircraft takes to each open route.</p><button class="btn" id="ftAsk">Flight times &#9654;</button></div></section>`); on('ftAsk', ftTableOpen); } } }catch(e){} return r; };
document.addEventListener('keydown', e => { if(e.key === 'Escape' && document.getElementById('ftModal')) document.getElementById('ftModal').remove(); });

/* ---------- 4. the period's results lead with the result; the graph shows the weeks ---------- */
/* resultsFraming: a strong week was reading as six failures. The panel now reads, top to bottom: the eyebrow and, when it is
   one, a record plate ("Best week yet — £128,042"); the result, large, against last week (green only if it went up); the
   plan line with its reasons ("Planned £132,612 · £4,570 under: three no-shows on Monday and a headwind on Friday", or
   "within the normal ups and downs"); revenue − costs = profit as three quiet cells; the load factor; the cash lines
   (profit · fuel bought for next week · cash change → cash, with ƒ); one OPPORTUNITY line (passengers we couldn't carry,
   the top two routes, the full list a tap away); the button. Red only for a real loss (redMeans). */
const S3_DC = { hen_party:'a hen party', school_group:'a school group', tailwind:'a tailwind', headwind:'a headwind', no_shows:'three no-shows', birthday_cake:'a birthday on board',
  late_bus:'a late airport bus', corporate_block:'a company booking', quiet_day:'a quiet day', sunny_weekend:'a sunny weekend' };
const S3_DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function s3Reasons(from, to, many){
  const out = [], dc = S.dcLog || {};
  for(let d = from; d <= to; d++){ const c = dc[d]; if(!c || !c.id) continue; const what = S3_DC[c.id] || String(c.line || '').split(/[:.]/)[0].toLowerCase();
    out.push({ txt:many ? `${what} on ${dateShort(d)}` : `${what} on ${S3_DAY[calDate(d).getUTCDay()]}`, w:Math.abs(c.delta || 0) }); }
  ((S.rnd && S.rnd.why) || []).forEach(w => { if(!['🧾', '⛔', '🌋', '💷'].includes(w.ic)) return; const t = String(w.text || '').split(':')[0]; if(t && !out.some(o => o.txt === t)) out.push({ txt:t.charAt(0).toLowerCase() + t.slice(1), w:1e9 }); });
  return out.sort((a, b) => b.w - a.w).slice(0, 2).map(o => o.txt);
}
const s3And = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0] || '';
/* the airline's weeks and months as flown, with each one's projection from the pupil record */
function s3Periods(kind){
  const by = {}, dec = (typeof rec === 'function' ? rec().entries : []).filter(e => e.type === 'decision');
  (S.history || []).forEach(h => { if(h.type === 'setup' || h.from === undefined) return; const isM = h.type === 'month';
    if(kind === 'week' && isM) return; if(kind === 'month' && !isM) return;
    const k = kind === 'week' ? weekNo(h.from) : h.from, x = by[k] || (by[k] = { k, from:kind === 'week' ? (k - 1) * 7 + 1 : h.from, to:kind === 'week' ? k * 7 : h.to, profit:0, pax:0, seats:0 });
    x.profit += h.profit || 0; x.pax += h.pax || 0; x.seats += h.seats || 0; });
  return Object.values(by).sort((a, b) => a.from - b.from).map(x => { const e = dec.find(z => z.from === x.from && z.proj !== null && z.proj !== undefined); return Object.assign(x, { proj:e ? e.proj : null, label:kind === 'week' ? `Week ${x.k}` : MONTH[calDate(x.from).getUTCMonth()].slice(0, 3) }); });
}
const s3Res0 = periodResultsCard;
periodResultsCard = function(){
  const T = S.rnd && S.rnd.sim, P = S.period; if(WBS().resultsFraming === undefined || !T || !P || isYearRun() || !['week', 'month'].includes(P.type)) return s3Res0.apply(this, arguments);
  const kind = P.type, pr = Math.round(T.profit), vs = S.rnd.vs, h = lastHist(), word = kind === 'month' ? 'month' : 'week';
  const past = s3Periods(kind).filter(x => x.from < P.from), last = past[past.length - 1], best = past.length >= 2 && pr > Math.max(...past.map(x => x.profit));
  const planned = vs && vs.kind === 'period' && vs.expProfit !== undefined ? Math.round(vs.expProfit) : S.rnd.myForecast && S.rnd.myForecast.profit !== undefined ? Math.round(S.rnd.myForecast.profit) : null;
  const up = last ? pr - Math.round(last.profit) : null;
  const cmp = up === null ? '' : `<span class="s3-cmp ${up > 0 ? 'up' : ''}">${up === 0 ? `the same as last ${word}` : `${money(Math.abs(up))} ${up > 0 ? 'more' : 'less'} than last ${word}`}</span>`;
  const rs = planned === null ? [] : s3Reasons(P.from, P.to, kind === 'month'), diff = planned === null ? 0 : pr - planned;
  const planLine = planned === null ? '' : Math.abs(diff) < 1 ? `<p class="s3-plan">Planned ${money(planned)} · exactly as planned.</p>`
    : `<p class="s3-plan">Planned ${money(planned)} · ${money(Math.abs(diff))} ${diff < 0 ? 'under' : 'over'}: ${rs.length ? esc(s3And(rs)) : 'within the normal ups and downs'}.</p>`;
  const lf = T.seats ? `<p class="s3-lf">${Math.round(100 * T.pax / T.seats)}% of seats filled (${num(T.pax)} of ${num(T.seats)})</p>` : '';
  const start = S.rnd.cashStart, change = start === undefined ? null : Math.round(S.cash - start), fuel = change === null ? 0 : change - pr;
  const cash = change === null ? '' : `<p class="s3-cash">Profit ${money(pr)}${Math.abs(fuel) >= 1 ? ` · ${fuel < 0 ? `Fuel bought for next ${word} −${money(Math.abs(fuel))}` : `Fuel from the tank +${money(fuel)}`}` : ''} · Cash ${change >= 0 ? '+' : '−'}${money(Math.abs(change))} → <b>${money(Math.round(S.cash))}</b> <span class="fx" title="Cash change = profit − the fuel bought for the tank (buying fuel moves cash into the tank; profit counts only the fuel burned)">ƒ</span></p>`;
  const miss = Object.keys(T.routes || {}).map(id => { const x = T.routes[id]; return { id, n:Math.max(0, Math.round((x.want || x.pax) - x.pax)) }; }).filter(x => x.n > 0).sort((a, b) => b.n - a.n), tot = miss.reduce((t, x) => t + x.n, 0);
  const opp = tot ? `<details class="s3-opp"><summary><span class="s3-ol">Opportunity</span>Passengers we couldn't carry: ${num(tot)} this ${word}${miss.length > 1 ? ` — most on ${s3And(miss.slice(0, 2).map(x => `${esc(routeById(x.id).city)} (${num(x.n)})`))}` : ` — ${esc(routeById(miss[0].id).city)}`}.</summary>
      <div class="s3-ol-list">${miss.map(x => `<span>${flagSvg(routeById(x.id).flag, 14)} ${esc(routeById(x.id).city)} <b class="mono">${num(x.n)}</b></span>`).join('')}</div></details>` : '';
  const why = ((S.rnd && S.rnd.why) || []).filter(w => ['💷', '🌋'].includes(w.ic)), whyH = why.length ? `<div class="dr-why">${why.map(w => `<p>${esc(w.text)}</p>`).join('')}</div>` : '';
  return `${hqHead(`${capFirst(periodShort(h))} Results`, 'ALL LANDED')}<div class="pb td2 dr s3-res">
    ${best ? `<p class="s3-rec">Best ${word} yet — ${money(pr)}</p>` : ''}
    <p class="s3-big"><b class="${pr < 0 ? 'neg' : ''}">${pr < 0 ? `${money(Math.abs(pr))} loss` : `${money(pr)} profit`}</b>${cmp ? ' · ' + cmp : ''}</p>
    ${planLine}
    <div class="s3-rcp"><div><span class="kl">Revenue</span><b>${money(Math.round(T.rev))}</b></div><i>−</i><div><span class="kl">Costs</span><b>${money(Math.round(T.costs))}</b></div><i>=</i><div><span class="kl">${pr >= 0 ? 'Profit' : 'Loss'}</span><b>${money(Math.abs(pr))}</b></div></div>
    ${lf}${cash}${whyH}${opp}
    <div class="td-act"><span class="grow"></span><button class="btn primary act" id="nx">${closeWord()} ▶</button></div></div>`;
};
/* weekGraphDefault: a bar per week from week 1 to now (profit), a faint tick for each week's projection, a thin seat-fill line on
   a right-hand axis, the current week highlighted; hovering a bar gives its profit, projection and reason. Tabs: Weeks (the
   default) · This week by day; from December, Weeks · Months. */
function s3Graph(kind, o){
  const X = s3Periods(kind); if(!X.length) return '';
  const W = o.w || 640, H = o.h || 260, L = 54, Rr = 38, T = 14, B = 26, n = X.length, bw = (W - L - Rr) / n, cur = X[n - 1];
  const vals = X.flatMap(x => [x.profit, x.proj === null ? x.profit : x.proj]), hi = Math.max(1, ...vals), lo = Math.min(0, ...vals), y = v => T + (H - T - B) * (hi - v) / (hi - lo), fy = f => T + (H - T - B) * (1 - f);
  let g = `<line class="s3g-0" x1="${L}" x2="${W - Rr}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}"/>`;
  [hi, (hi + Math.max(lo, 0)) / 2].forEach(v => { g += `<text class="s3g-ax" x="${L - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${money(Math.round(v / 1000) * 1000)}</text>`; });
  g += `<text class="s3g-ax r" x="${W - Rr + 6}" y="${(fy(1) + 4).toFixed(1)}">100%</text><text class="s3g-ax r" x="${W - Rr + 6}" y="${(fy(0.5) + 4).toFixed(1)}">50%</text>`;
  const every = Math.max(1, Math.ceil(n / 12));
  X.forEach((x, i) => { const cx = L + bw * i + bw / 2, w = Math.max(3, bw * 0.62), top = y(Math.max(0, x.profit)), bot = y(Math.min(0, x.profit)), isCur = x === cur;
    const tip = `${x.label}: profit ${money(Math.round(x.profit))}${x.proj !== null ? `, projected ${money(x.proj)}` : ''}${x.seats ? `, ${Math.round(100 * x.pax / x.seats)}% of seats filled` : ''}`;
    g += `<g class="s3g-b ${isCur ? 'cur' : ''} ${x.profit < 0 ? 'neg' : ''}"><title>${esc(tip)}</title><rect x="${(cx - w / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(1, bot - top).toFixed(1)}"/>`;
    if(x.proj !== null) g += `<line class="s3g-pj" x1="${(cx - w / 2 - 3).toFixed(1)}" x2="${(cx + w / 2 + 3).toFixed(1)}" y1="${y(x.proj).toFixed(1)}" y2="${y(x.proj).toFixed(1)}"/>`;
    if((n - 1 - i) % every === 0) g += `<text class="s3g-ax" x="${cx.toFixed(1)}" y="${H - 8}" text-anchor="middle">${esc(kind === 'week' ? String(x.k) : x.label)}</text>`;
    g += `</g>`; });
  const pts = X.map((x, i) => x.seats ? `${(L + bw * i + bw / 2).toFixed(1)},${fy(x.pax / x.seats).toFixed(1)}` : null).filter(Boolean);
  if(pts.length > 1) g += `<polyline class="s3g-sf" points="${pts.join(' ')}"/>`;
  return `<svg class="s3g" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Profit for every ${kind} so far">${g}</svg>
    <div class="s3g-key"><span><i class="k b"></i>profit a ${kind}</span><span><i class="k pj"></i>projected</span><span><i class="k sf"></i>seats filled (right)</span>${kind === 'week' ? '<span class="muted">week number along the bottom</span>' : ''}</div>`;
}
const s3Fin0 = finChart;
finChart = function(o){
  o = o || {}; if(WBS().weekGraphDefault === undefined || !S || !S.history) return s3Fin0.apply(this, arguments);
  const months = s3Periods('month').length > 0, weeks = s3Periods('week').length > 0; if(!weeks && !months) return s3Fin0.apply(this, arguments);
  const tabs = [['weeks', 'Weeks']].concat(months ? [['months', 'Months']] : [['days', 'This week by day']]), t = tabs.some(x => x[0] === UI.wgTab) ? UI.wgTab : 'weeks';
  const body = t === 'days' ? s3Fin0.apply(this, arguments) : s3Graph(t === 'months' ? 'month' : 'week', o);
  return `<div class="s3g-w"><div class="s3g-tabs" role="tablist">${tabs.map(([k, l]) => `<button data-wgtab="${k}" aria-selected="${t === k}">${l}</button>`).join('')}</div>${body}</div>`;
};
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-wgtab]'); if(!b) return; UI.wgTab = b.getAttribute('data-wgtab'); try{ render(); }catch(err){} try{ if(typeof renderDisplay === 'function' && (typeof wallView !== 'undefined' && wallView || IS_DISPLAY)) renderDisplay(); }catch(err){} });

/* redMeans, opportunityDisplay: unserved demand is information, never red or orange; a weaker period is grey, not red */
const s3Ev0 = evidenceHtml;
evidenceHtml = function(){ return s3Ev0.apply(this, arguments).replace('<th class="num">No seat</th>', `<th class="num" title="Passengers we couldn't carry: an opportunity, not a fault">Couldn't carry</th>`).replace(/<td class="num orange"/g, '<td class="num s3-q"'); };

/* ---------- 5. buying a plane: the worth check inside the comparison ---------- */
/* aircraftWorthCheck: "Is the E175 worth it?" was a separate page, a third place to buy a plane. Choosing a plane on the
   comparison (or on the air show) now opens its worth check in place, the other planes in a slim column to switch back:
   WHY (the plane; the routes leaving people behind, with the numbers) · WORK IT OUT (one full flight at the route's current
   fare: the one key number, Give me a hint) · WHAT IT MEANS (hidden until the answer is confirmed, then one by one: the
   full-flight money, the extra profit a day for the airline, the payback as a coin bar). Then the decision: Buy it now · Wait,
   with the wait-cost line and the cash bar. No numbered steps, no recommended routes, no model's suggestion, no counter. */
const wcOn = () => WBS().aircraftWorthCheck !== undefined;
function wcS(pid){ const W = S.rnd.wc || (S.rnd.wc = {}); return W[pid] || (W[pid] = { v:'', tries:0, done:false, shown:false, msg:'', hint:false }); }
function wcPlanes(){ const C = UI.wc && UI.wc.from === 'compare' && typeof acCompare === 'function' ? acCompare() : null; return C ? C.cands.filter(c => c.b).map(c => c.pid) : shopPlanes().map(p => p.id); }
function wcLeft(p){   // last period's people without a seat, a day, on routes this plane can fly
  const h = lastHist(), days = h ? Math.max(1, (h.to || h.from) - h.from + 1) : 1;
  return Object.entries((h && h.routes) || {}).map(([id, x]) => ({ id, n:Math.round(Math.max(0, (x.want || x.pax || 0) - (x.pax || 0)) / days) })).filter(x => x.n > 0 && routeById(x.id) && planeCanFly(p, routeById(x.id))).sort((a, b) => b.n - a.n);
}
function wcFigures(pid){
  const p = planeById(pid), o = shopOffer(p), left = wcLeft(p), C = UI.wc && UI.wc.from === 'compare' && typeof acCompare === 'function' ? acCompare() : null, c = C && C.cands.find(x => x.pid === pid);
  const m = c ? null : (S.rnd.wcModel && S.rnd.wcModel.id === pid ? S.rnd.wcModel : (S.rnd.wcModel = Object.assign({ id:pid }, fleetModel(pid))));
  const rid = (left[0] && left[0].id) || (c ? C.rid : m && m.firstRoute) || null, r = rid && routeById(rid), flown = rid && S.fleet.some(f => schedOf(f).includes(rid));
  const fare = r ? (flown && S.prices[rid] ? S.prices[rid] : (r.fares || [r.basePrice])[0]) : 0, extra = Math.round(c ? c.extra : m ? m.extra : 0);
  return { p, o, left, rid, r, fare, full:p.seats * fare, extra, pay:extra > 0 ? o.price / extra : null, c, C };
}
function wcCoins(price, extra, lit){
  const days = extra > 0 ? price / extra : null; if(!days) return `<p class="wc-none">It does not earn back its cost on today's routes.</p>`;
  const n = Math.min(40, Math.ceil(days)), per = n < Math.ceil(days) ? Math.ceil(days) / n : 1;
  return `<div class="wc-coins ${lit ? 'go' : ''}" role="img" aria-label="${money(price)} in days of extra profit: about ${Math.ceil(days)} days">${Array.from({ length:n }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
    <p class="wc-pay">${money(price)} ÷ ${money(extra)} a day: <b>about ${num(Math.ceil(days))} days</b>${per > 1 ? ` <small>(each coin ${Math.round(per)} days)</small>` : ''}</p>`;
}
function wcWaitLine(F){
  const f = typeof taFig === 'function' ? taFig(F.p.id) : null, afford = f ? f.afford : S.cash >= F.o.price;
  const soon = openRoutes(S.day + 28).filter(r => (r.openDay || r.unlockDay || 0) > (S.day || 1) && planeCanFly(F.p, r)).sort((a, b) => (a.openDay || a.unlockDay) - (b.openDay || b.unlockDay))[0];
  if(F.extra <= 0 && soon){ const d0 = soon.openDay || soon.unlockDay, days = d0 - (S.day || 1);
    return `Its best work starts ${dateShort(d0)} (${esc(soon.city)}). Bought today, it costs ${money(F.p.dayCost)} a day for ${days} days first: ${money(F.p.dayCost * days)}.`; }
  if(!afford && f) return f.days === null ? `You can't afford it yet, and the airline is not making a profit to save from.` : `You can't afford it yet: about ${dayWord(f.days)} of saving at your rate (${money(f.rate)} a day).`;
  return `Bought today, it can start work tomorrow.`;
}
function wcHtml(){
  const pid = UI.wc.pid, F = wcFigures(pid), T = wcS(pid), p = F.p, fleet = [...new Set(S.fleet.map(f => f.planeId))].map(planeById);
  const job = p.seats > Math.max(0, ...fleet.map(x => x.seats)) ? 'For busy routes where people are left behind' : p.range > Math.max(0, ...fleet.map(x => x.range || 0)) ? 'For routes further away than the fleet can reach' : 'A smaller step: more flights, not bigger ones';
  const slim = `<nav class="wc-slim" aria-label="The other aircraft">${wcPlanes().map(id => { const q = planeById(id); return `<button class="wc-sl ${id === pid ? 'on' : ''}" data-wcpick="${id}">${plainArt(q)}<b>${esc(shortPlane(q))}</b><small>${q.seats} seats · ${money(shopOffer(q).price)}</small></button>`; }).join('')}<button class="dk-link" id="wcBack">&#9664; All the aircraft</button></nav>`;
  const why = `<section class="wc-z wc-why"><p class="wc-eb">WHY</p><div class="wc-pic">${plainArt(p)}</div><h2>${esc(p.name)}</h2>
    <p class="wc-facts">${money(F.o.price)} · ${p.seats} seats · ${num(p.speed)} km/h · ${num(p.range || 0)} km range</p><p class="wc-job">${job}.</p>
    <p class="wc-cmp">${fleet.map(x => `${esc(shortPlane(x))} ${x.seats} seats`).join(' · ')} · <b>${esc(shortPlane(p))} ${p.seats}</b></p>
    <div class="wc-left">${F.left.length ? F.left.slice(0, 4).map(x => `<div class="wc-lr">${flagSvg(routeById(x.id).flag, 16)}<span>${esc(routeById(x.id).city)}</span><b>${num(x.n)} a day without a seat</b></div>`).join('') : '<p class="wc-none">No one is being turned away at the moment: this plane would be for growth or a new route.</p>'}</div></section>`;
  const q = F.r ? `How much ticket money does one full ${esc(F.r.city)} flight bring in?` : 'How much ticket money does one full flight bring in?';
  const known = typeof skills === 'function' && skills().seatsFare && (skills().seatsFare.planes || []).includes(pid);
  if(known && !T.done){ T.done = true; T.model = true; T.at = Date.now(); }
  const work = `<section class="wc-z wc-work ${T.done ? 'ok' : ''}"><p class="wc-eb">WORK IT OUT</p>${sumHeadHtml('wc:' + pid, `A full flight: ${shortPlane(p)}`)}<p class="wc-q">${q}</p>
    <p class="wc-sum"><span class="mono">${p.seats} seats × ${money(F.fare)} =</span> ${T.done ? `<b class="wc-ans">${money(F.full)}</b>${T.model ? ' <small>(worked out before)</small>' : T.shown ? FIN_STAMP : cardStampHtml('ok')}` : `<span class="sc-in ${T.q ? 'qy' : ''}"><i class="pre">£</i><input data-wcin="${pid}" inputmode="numeric" autocomplete="off" value="${esc(T.v)}" aria-label="Ticket money from one full flight"></span>`}</p>
    <p class="wc-why-l">This helps judge whether the plane can earn back its cost.</p>
    ${T.done ? '' : `<div class="wc-row"><button class="dk-link" data-wchint="${pid}">Give me a hint</button><span class="grow"></span><button class="btn primary" data-wcchk="${pid}">Check ✓</button></div>`}
    ${T.hint && !T.done ? `<p class="wc-hint">Every seat sold: ${p.seats} people each pay ${money(F.fare)}. ${p.seats} × ${F.fare} is the same as ${p.seats} × ${Math.floor(F.fare / 100) * 100 || F.fare} plus ${p.seats} × ${F.fare % 100 || 0}.</p>` : ''}<p class="sc-msg" role="status">${esc(T.msg || '')}</p></section>`;
  const lit = T.done, fresh = lit && T.at && Date.now() - T.at < 3000 && !T.model;
  const row = (k, l, v, i) => `<div class="wc-mr ${lit ? 'on' : 'lock'} ${fresh ? 'fresh' : ''}" style="--d:${i * 0.4}s"><span class="kl">${l}</span>${lit ? v : '<b class="wc-blank">—</b>'}</div>`;
  const means = `<section class="wc-z wc-means"><p class="wc-eb">WHAT IT MEANS</p>
    ${row('full', 'Full-flight money', `<b class="mono ${fresh ? 'flash' : ''}">${money(F.full)}</b>`, 0)}
    ${row('extra', 'Extra profit a day', F.extra > 0 ? `<b class="mono">${money(F.extra)}</b> <small>with the plane on the routes you choose</small>` : `<b class="mono bad">${money(Math.abs(F.extra))} less a day</b> <small>on today's routes</small>`, 1)}
    ${row('pay', 'Pays back in', wcCoins(F.o.price, F.extra, lit), 2)}</section>`;
  const f = typeof taFig === 'function' ? taFig(pid) : null, afford = f ? f.afford : S.cash >= F.o.price, buyOnly = typeof buyOnlyOn === 'function' && buyOnlyOn();
  const get = buyOnly ? `<button class="btn primary big" id="wcBuy" ${afford ? '' : 'disabled'}>Buy it now &#9654;</button>` : `<button class="btn primary big" id="wcGet">Get it now: rent, finance or buy &#9654;</button>`;
  const ta = wcTa(pid);
  if(lit && ta && T.waiting) return `<div class="wc tight">${slim}<div class="wc-main"><div class="wc-zones">${why}${work}${means}</div>${taCardHtml(ta.st, ta.f)}
    <section class="wc-dec one"><div class="wc-dq"><b>Wait for the ${esc(shortPlane(p))}?</b><p>${ta.st.taOk ? `About ${dayWord(ta.f.days)} of saving at your rate. The Fleet desk counts down.` : 'First: how long until you can afford it?'}</p></div><div class="wc-btns"><button class="btn big" id="wcNoWait">&#9664; Back</button><button class="btn primary big" id="wcWait" ${ta.st.taOk ? '' : 'disabled'}>Wait for it &#9654;</button></div></section></div></div>`;
  const decide = lit ? `<section class="wc-dec"><div class="wc-dq"><b>Buy it now, or wait?</b><p>${wcWaitLine(F)}</p></div><div class="wc-cash">${typeof acCashBar === 'function' ? acCashBar(F.o).replace(/ ?(Next screen|You could rent or finance it)[^<]*/, '').replace('class="bad"', 'class="wc-short"') : ''}</div><div class="wc-btns">${get}<button class="btn big" id="${ta ? 'wcAskWait' : 'wcWait'}">Wait</button></div></section>` : '';
  return `<div class="wc">${slim}<div class="wc-main"><div class="wc-zones">${why}${work}${means}</div>${decide}</div></div>`;
}
function wcTa(pid){
  if(typeof taFig !== 'function' || typeof buyOnlyOn !== 'function' || !buyOnlyOn()) return null; const f = taFig(pid); if(f.afford || !(f.still > 0) || !(f.rate > 0)) return null;
  const T = wcS(pid), st = T.taSt || (T.taSt = {}); if(!st.taLevel) st.taLevel = taMet() ? 'build' : 'calc'; UI.taF = f; taLedger(f.pid, st.taLevel); return { st, f };
}
function wcCheck(pid){
  const F = wcFigures(pid), T = wcS(pid), v = typeof padNum === 'function' ? padNum(T.v) : +String(T.v).replace(/[£,\s]/g, '');
  if(v === null || isNaN(v)){ T.msg = 'Type the ticket money in pounds.'; return; }
  const key = 'wc:' + pid, e = recOpen(key, { type:'calc', relKey:'seatsFare', doc:`A full flight: ${shortPlane(F.p)}`, ask:`How much ticket money does one full ${F.r ? F.r.city : ''} flight bring in?`, question:`${F.p.seats} × ${money(F.fare)}`, unit:'£', correct:F.full, correctText:money(F.full), ops:[F.p.seats, F.fare], op:'×', level:'Calculate' });
  const ok = Math.abs(v - F.full) < 0.5; recAttempt(e, { ok, given:String(T.v), value:v, method:'seats × fare' });
  const done = shown => { T.done = true; T.shown = !!shown; T.q = false; T.msg = ''; T.at = Date.now(); if(typeof soTouch === 'function') soTouch('seatsFare', { plane:pid }); save(); };
  if(ok){ done(false); return; } T.tries++;
  if(T.tries >= 2 && (typeof twoTriesOn !== 'function' || twoTriesOn())){ if(typeof paperRecShown === 'function') paperRecShown(key); done(true); return; }
  T.q = true; T.msg = `Query: ${v > F.full * 5 ? 'that is far too much: seats × the fare.' : v < F.full / 5 ? 'too small: every seat pays the fare.' : `not quite: ${F.p.seats} × ${money(F.fare)}.`} One more try.`;
}
function wcBind(){
  const root = screen(), pid = UI.wc.pid, T = wcS(pid), F = wcFigures(pid);
  const i = root.querySelector('[data-wcin]'); if(i){ i.oninput = () => { T.v = i.value; }; i.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); wcCheck(pid); render(); } }; setTimeout(() => { try{ i.focus(); }catch(err){} }, 30); }
  root.querySelectorAll('[data-wcchk]').forEach(b => b.onclick = () => { wcCheck(pid); render(); });
  root.querySelectorAll('[data-wchint]').forEach(b => b.onclick = () => { T.hint = !T.hint; render(); });
  root.querySelectorAll('[data-wcpick]').forEach(b => b.onclick = () => { UI.wc.pid = b.getAttribute('data-wcpick'); render(); });
  on('wcBack', () => { UI.wc = null; render(); });
  const ta = T.done ? wcTa(pid) : null; if(ta && T.waiting && !ta.st.taOk) taBind(ta.st, ta.f);
  on('wcAskWait', () => { T.waiting = true; render(); }); on('wcNoWait', () => { T.waiting = false; render(); });
  const strip = () => { S.steps = S.steps.filter(x => !['fleetSums', 'acquire'].includes(x.t)); };
  const choice = () => { if(F.c) S.rnd.acChoice = { pid, rid:F.C.rid, fare:F.c.b.fare, n:F.c.b.n, deps:F.c.b.deps, extra:F.c.extra, own:Math.round(F.c.b.own) }; S.rnd.shopPick = pid; };
  on('wcBuy', () => { const f = typeof taFig === 'function' ? taFig(pid) : null; if(f && !f.afford) return; choice(); strip(); const uid = acquirePlane(F.p, 'buy'); if(F.c && typeof acApplyChoice === 'function') acApplyChoice(uid); UI.wc = null; delete S.rnd.shopPick; UI.justDone = null; advance(); });
  on('wcGet', () => { choice(); strip(); const k = S.steps.findIndex(x => x.t === 'shop2'); S.steps.splice(k + 1, 0, { t:'acquire' }); UI.wc = null; UI.justDone = null; advance(); });
  on('wcWait', () => { if(ta && !ta.st.taOk) return; const f = typeof taFig === 'function' ? taFig(pid) : { price:F.o.price, days:null }; S.waitFor = { pid, from:S.day, price:f.price, days:f.days };
    addNews([{ tag:'FLEET', text:`Saving for the ${F.p.name}${f.days !== null && f.days !== undefined ? `: about ${dayWord(f.days)} at your rate` : ''}.` }]);
    try{ rec().pend.events.push({ day:S.day, title:'Aircraft', choice:`wait for the ${F.p.name}`, cost:0 }); }catch(e){}
    strip(); delete S.rnd.shopPick; delete S.rnd.acChoice; UI.wc = null; UI.justDone = null; advance(); });
}
/* choosing a plane opens its worth check in place, on the shop's own step */
document.addEventListener('click', e => {
  if(!wcOn() || !S || !S.steps || !step() || step().t !== 'shop2' || UI.wc) return;
  const acc = e.target.closest && e.target.closest('[data-acc]'), nx = e.target.closest && e.target.closest('#nx');
  if(acc && !acc.disabled){ e.preventDefault(); e.stopImmediatePropagation(); UI.wc = { pid:acc.getAttribute('data-acc'), from:'compare', si:S.si, day:S.day }; render(); return; }
  if(nx && !nx.disabled && S.rnd.shopPick && document.querySelector('.show-card')){ e.preventDefault(); e.stopImmediatePropagation(); UI.wc = { pid:S.rnd.shopPick, from:'show', si:S.si, day:S.day }; render(); }
}, true);
window.__wc = { answer:pid => wcFigures(pid).full, open:() => UI.wc ? UI.wc.pid : null };
const wcShop0 = R.shop2;
R.shop2 = st => {
  if(UI.wc && (UI.wc.si !== S.si || UI.wc.day !== S.day)) UI.wc = null;
  if(!wcOn() || !UI.wc) return wcShop0(st);
  const p = planeById(UI.wc.pid);
  screen().innerHTML = shell(deskPage({ title:`Is the ${esc(shortPlane(p))} worth it?`, sub:'Why it might help, one number to work out, and what it means for the airline.', cls:'wc-page', body:wcHtml() }),
    deskBar(wcS(UI.wc.pid).done ? 'Buy it now, or wait.' : 'Work out the one number; the rest follows.', `<button class="btn big" id="skipShop">Not today</button>`));
  on('skipShop', () => { S.steps = S.steps.filter(x => !['fleetSums', 'acquire'].includes(x.t)); delete S.rnd.shopPick; delete S.rnd.acChoice; UI.wc = null; UI.justDone = null; advance(); });
  wcBind();
};

/* ---------- 6. Coming up, the week-5 tutorial, the review's last line ---------- */
/* comingUp (Roadmap sheet): a strip on Home under the top bar: NOW (the stage in a sentence) · NEXT (the next Roadmap item with
   its date and a greyed silhouette) · LATER (the one after, and the next chapter's opening). An item is NEXT from its
   'shown from' day; its silhouette fills in when it arrives. Planner upgrades are never listed: the pupil discovers the
   need (D98). At the end of each Sunday review, one line about next week. weekPlanTutorial is removed: a one-line
   notice says the game now runs a week at a time. */
function cuArrive(when){
  const s = String(when || ''), w = s.match(/^Week\s+(\d+)/i); if(w) return (+w[1] - 1) * 7 + 1;
  const m = s.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{4}))?/i); if(!m) return null;
  const mi = MONTH.findIndex(x => x.toLowerCase() === m[1].toLowerCase()), y0 = calDate(1).getUTCFullYear(), y = m[2] ? +m[2] : (mi >= calDate(1).getUTCMonth() ? y0 : y0 + 1);
  let t = Date.UTC(y, mi, 1); while(new Date(t).getUTCDay() !== 1) t += 86400000;
  return Math.round((t - calDate(0).getTime()) / 86400000);
}
function cuItems(){ return (WB.roadmap || []).map(r => Object.assign({ at:cuArrive(r.when) }, r)).filter(r => r.at !== null).sort((a, b) => a.at - b.at || a.fromDay - b.fromDay); }
function cuGroups(){ const by = []; cuItems().forEach(r => { const g = by.find(x => x.at === r.at); if(g){ g.lines.push(r.line); g.from = Math.min(g.from, r.fromDay); } else by.push({ at:r.at, when:r.when, from:r.fromDay, lines:[r.line] }); }); return by; }
const cuSil = (on, title) => `<span class="cu-sil ${on ? 'on' : ''}" title="${esc(title || '')}">${ICO2.plane || '✈'}</span>`;
function cuNowLine(){
  const P = S.period, mode = P && P.type === 'month' ? 'a month at a time' : P && P.type === 'week' || (typeof weekMode === 'function' && weekMode()) ? 'a week at a time' : 'a day at a time';
  const routes = new Set(S.fleet.flatMap(f => schedOf(f))).size; return `Running ${mode} · ${plural(routes, 'route')} · ${plural(S.fleet.length, 'plane')}`;
}
function cuStripHtml(){
  if(WBS().comingUp === undefined || !(WB.roadmap || []).length || !S || S.phase === 'setup') return '';
  const d = S.day || 1, G = cuGroups(), up = G.filter(g => g.at > d), next = up.find(g => g.from <= d) || up[0]; if(!next) return '';
  const after = up.filter(g => g !== next), later = [after[0]], ch = (WB.chapters || []).find(c => c.start && isoDay(c.start) > d), big = ch && after.find(g => g.at >= isoDay(ch.start) && g !== after[0]);
  if(big) later.push(big);
  const item = (g, cls) => `<span class="cu-i ${cls}">${cuSil(false, g.lines.join(' · '))}<span><b>${esc(g.when.startsWith('Week') ? dateShort(g.at) : g.when)}</b> · ${esc(g.lines.join(' · '))}</span></span>`;
  return `<div class="cu" role="note" aria-label="Coming up"><span class="cu-k">NOW</span><span class="cu-i now">${cuSil(true)}<span>${esc(cuNowLine())}</span></span>
    <span class="cu-k">NEXT</span>${item(next, 'next')}${later.filter(Boolean).length ? `<span class="cu-k">LATER</span>${later.filter(Boolean).map(g => item(g, 'later')).join('')}` : ''}</div>`;
}
const isoDay = iso => { const t = Date.parse(String(iso).slice(0, 10) + 'T00:00:00Z'); return isNaN(t) ? 1e9 : Math.round((t - calDate(0).getTime()) / 86400000); };
function cuNextWeekLine(){
  if(WBS().comingUp === undefined) return ''; const d = S.day || 1, G = cuGroups().filter(g => g.at > d && g.at <= d + 8), items = G.flatMap(g => g.lines.map(l => l.replace(/^Week \d+: /, '')));
  const wk = weekNo(d) + 1, M = (WORLD.market || WB.market || []).find(m => m.week === wk - 1) || null, fh = M && M.fuelHeadline ? String(M.fuelHeadline).replace(/\.$/, '') : '';
  const parts = []; if(items.length) parts.push(items.map(x => x.charAt(0).toLowerCase() + x.slice(1)).join(', ') + (/ (open|opens)$/.test(items[items.length - 1]) ? '' : ''));
  if(fh) parts.push(`the fuel desk: ${fh.charAt(0).toLowerCase() + fh.slice(1)}`);
  return parts.length ? `Next week: ${parts.join('; and ')}.` : '';
}
const cuRender0 = render;
render = function(){ const r = cuRender0.apply(this, arguments); try{
    const st = step(), home = st && st.t === 'hq' && !S.overlay && !(typeof wallView !== 'undefined' && wallView);
    if(home && !document.querySelector('.cu')){ const k = screen().querySelector('.kpis'); const h = cuStripHtml(); if(k && h) k.insertAdjacentHTML('afterbegin', h); }
    if(st && st.t === 'weekReview' && !document.querySelector('.cu-nw')){ const line = cuNextWeekLine(), host = screen().querySelector('.rbw-page .dp-body, .rbw-page main, .dp-body'); if(line && host) host.insertAdjacentHTML('beforeend', `<p class="cu-nw">${esc(line)}</p>`); }
  }catch(e){} return r; };
/* weekPlanTutorial removed: the "Planning a whole week" introduction is not inserted; a one-line notice instead, once */
const cuIntro0 = withIntro;
withIntro = function(steps, w){
  if(WBS().weekPlanTutorial !== 'removed' || !w || !w.intro) return cuIntro0.apply(this, arguments);
  const keys = Array.isArray(w.intro) ? w.intro : [w.intro]; if(!keys.includes('week')) return cuIntro0.apply(this, arguments);
  const w2 = Object.assign({}, w, { intro:keys.filter(k => k !== 'week') }); if(!w2.intro.length) delete w2.intro;
  if(S && !S.weekNotice && !(typeof QUIET !== 'undefined' && QUIET)){ S.weekNotice = S.day || 1; setTimeout(() => { try{ sysNotice('From now on the game runs a week at a time: plan on Monday, the week flies, the review on Sunday.'); }catch(e){} }, 400); }
  return cuIntro0.call(this, steps, w2);
};
}
