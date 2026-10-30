/* =====================================================================
   CHAPTER ONE, 30 OCT 2026 — THE DESKS (Bertie's hand-off 2, sections 5-8; DESIGN.md of 30 Oct). Chapter one only (ch1()).
     6. the Fuel desk's order has no sum: Your order shows the cost (ƒ) and the cash after it against his reserve, and Your
        position shows the position with this order; nothing is bought until Continue
     5. the what-if fare sheet (from week 2): free to try, no sums
     7. the full-width timetable
     8. the Briefings shelf in teacher test mode
   ===================================================================== */

/* ---------- 6. the Fuel desk: the order without a sum ---------- */
const c1FdOn = () => ch1() && typeof fd2On === 'function' && fd2On();
const c1Reserve = () => { try{ return typeof myReserve === 'function' ? (myReserve() || 0) : (WORLD.cashReserve || 0); }catch(e){ return 0; } };
function c1Order(){ const P0 = fuelOn(S.day || 1), blk = fuelBlock(), n = (UI.fd && UI.fd.selNow) || 0, L = n * blk; return { n, L, P0, blk, cost:Math.round(L * P0 * 100) / 100, after:Math.round((S.cash - L * P0) * 100) / 100 }; }
function c1OrderHtml(){
  const O = c1Order(), R = c1Reserve(), T = c1T('fuel.order'), cash = Math.max(1, S.cash), keep = Math.max(0, O.after), ok = O.after >= R;
  const W = 296, wAfter = Math.round(W * Math.min(1, keep / cash)), wOrder = Math.max(0, Math.min(W - wAfter, Math.round(W * O.cost / cash))), xRes = Math.round(W * Math.min(1, R / cash));
  const line = c1T(ok ? 'fuel.order.above' : 'fuel.order.below', { reserve:money(R) }).text[0] || (ok ? `✓ Above your ${money(R)} reserve` : `! Below your ${money(R)} reserve`);
  return `<div class="c1-ord" data-c1ord><span class="c1-ord-e">${esc(T.eyebrow || 'YOUR ORDER')}</span><b class="c1-ord-n">${O.n} block${O.n === 1 ? '' : 's'} · ${num(O.L)} L</b>
    <div class="c1-ord-r"><span>Cost <i class="ash-au">ƒ</i></span><b class="gold">${money(O.cost)}</b></div><div class="c1-ord-r"><span>Cash after this order</span><b class="gold">${money(Math.round(O.after))}</b></div>
    <div class="c1-ord-bar" role="img" aria-label="Cash after this order ${money(Math.round(O.after))}; reserve ${money(R)}" style="width:${W}px"><i class="aft" style="width:${wAfter}px"></i><i class="ord" style="left:${wAfter}px;width:${wOrder}px"></i>${R > 0 ? `<i class="res" style="left:${xRes}px"></i><span class="res-l" style="left:${xRes}px">reserve</span>` : ''}</div>
    ${R > 0 ? `<p class="c1-ord-l ${ok ? 'green' : 'amber'}">${esc(line)}</p>` : ''}</div>`;
}
/* Your position with this order: the tank, In the tank, Already secured and Still to buy as they would be */
let C1_WITH = null;
const c1Layers0 = fdLayers;
fdLayers = function(){ const L = c1Layers0.apply(this, arguments); return C1_WITH ? L.concat([{ L:C1_WITH.L, p:C1_WITH.P0 }]) : L; };
const c1Pos0 = fd2Position;
fd2Position = function(day, farm){
  const O = c1FdOn() ? c1Order() : null; if(!O || !O.n || (UI.fd && UI.fd.done)) return c1Pos0.apply(this, arguments);
  const f0 = S.fuel; C1_WITH = O; S.fuel = f0 + O.L; let h;
  try{ h = c1Pos0.apply(this, arguments); } finally { S.fuel = f0; C1_WITH = null; }
  const need = Math.round(fdNeed(day).week), inT = Math.round(f0 + O.L), still = Math.max(0, need - inT), left = Math.max(0, inT - need), cover = need ? Math.min(100, Math.round(100 * inT / need)) : 100;
  h = h.replace('<h2>Your position</h2>', `<h2>Your position <span class="c1-with">${esc(c1T('fuel.position.tag').eyebrow || 'WITH THIS ORDER')}</span></h2>`).replace('class="bv-panel fd-pos fd2-pos"', 'class="bv-panel fd-pos fd2-pos c1-withp"');
  if(!still) h = h.replace(/(<div class="fd2-f green"><small>Still to buy<\/small><b>)[^<]*(<\/b>)/, '$1none ✓$2');
  h = h.replace(/<p class="fd2-note">[\s\S]*?<\/p>/, `<p class="fd2-note"><b class="green">${cover}% covered</b>${left ? ` · ${num(left)} L left over for next week.` : still ? ` · ${num(still)} L still to buy.` : '.'}</p>`);
  return h;
};
if(typeof ashFoSpec === 'function'){ const c1Fo0 = ashFoSpec; ashFoSpec = function(){ return c1FdOn() ? null : c1Fo0.apply(this, arguments); }; }   // no order sheet
const c1FdHtml0 = fuelDeskHtml;
fuelDeskHtml = function(asView){
  if(c1FdOn() && UI.fd) UI.fd.signed = true;   // no sign-off: he chooses the blocks and Continue buys them
  let h = c1FdHtml0.apply(this, arguments); if(!c1FdOn() || asView) return h;
  // the Your order panel where the sheet was (the old total and Confirm purchase stay hidden)
  const at = h.indexOf('<div class="fd-tot">'); if(at < 0) return h;
  return h.slice(0, at) + c1OrderHtml() + h.slice(at).replace('<div class="fd-tot">', '<div class="fd-tot c1-hide">');
};
const c1FdBind0 = bindFuelDesk;
bindFuelDesk = function(asView){
  if(c1FdOn() && UI.fd) UI.fd.signed = true;   // no sign-off: he chooses the blocks and Continue buys them
  c1FdBind0.apply(this, arguments); if(!c1FdOn() || asView) return;
  const root = screen(); root.querySelectorAll('.ash-fo').forEach(e => e.remove());
  const nx = $('nx'); if(nx){ const go = nx.onclick; nx.onclick = e => { const O = c1Order(); if(O.n > 0 && O.n <= fdMaxBlocks(O.P0)){ if(!S.fuelBuySigned) S.fuelBuySigned = { day:S.day, L:O.L, p:O.P0, noSum:true }; buyFuel(O.L, O.P0); fuelWeek(S.day || 1).bought.push({ day:S.day, L:O.L, p:O.P0 }); UI.fd.sel = 0; save(); } return go && go.call(nx, e); }; }
};
/* the tour's step 3 now points at the order panel: "choose how many blocks to buy, then check the cash you'll have left" (ScreenText fuel.tour.3) */

/* ---------- 5. the what-if fare sheet (from week 2): free to try, no sums ----------
   One row per route he flies: the fare with − and +, who wants to fly, seats filled, ticket revenue, costs and profit a day,
   each worked out by the model (ƒ) as he steps the fare through the route's fare options; then Both routes. Fares he has
   changed are outlined green; a profit that rose shows green; What changed compares with the fares he has now. Set my
   fares puts them in the plan. Nothing is asked and nothing goes in his book. */
const c1WiOn = () => ch1() && !!S && S.phase !== 'setup' && (S.day || 1) >= 8 && typeof weekMode === 'function' && weekMode();
const c1WiS = () => UI.c1wi && UI.c1wi.day === S.day ? UI.c1wi : (UI.c1wi = { day:S.day, fares:{} });
function c1WiRows(fares){
  const pl0 = normPlan(currentPlan()), pl = JSON.parse(JSON.stringify(pl0)); pl.prices = Object.assign({}, pl0.prices, fares || {});
  const L = planLines(pl), V = L.v, ids = L.routes.map(r => r.id).filter(id => routeById(id));
  return withPlan(pl, () => { const fl = planFlights().filter(x => !x.grounded), nAll = Math.max(1, fl.length), paxAll = Math.max(1, fl.reduce((t, x) => t + x.sold, 0)), shared = V.day + V.crew + V.stock + V.event;
    const rows = ids.map(id => { const f = fl.filter(x => x.route === id), pax = f.reduce((t, x) => t + x.sold, 0), seats = f.reduce((t, x) => t + x.seats, 0), rev = f.reduce((t, x) => t + x.revenue, 0);
      const cost = Math.round(f.reduce((t, x) => t + x.runCost + (x.fuelCost || 0), 0) + V.term * pax / paxAll + shared * f.length / nAll);
      return { id, r:routeById(id), fare:fareOf(id), want:paxWant(routeById(id), fareOf(id)), pax, seats, rev, cost, profit:rev - cost }; });
    const tot = { rev:rows.reduce((t, x) => t + x.rev, 0), cost:rows.reduce((t, x) => t + x.cost, 0) }; tot.profit = tot.rev - tot.cost; return { rows, tot }; });
}
function c1WiStep(id, dir){ const r = routeById(id), opts = (r.fares && r.fares.length ? r.fares : [r.basePrice]).slice().sort((a, b) => a - b), W = c1WiS(), cur = W.fares[id] !== undefined ? W.fares[id] : fareOf(id);
  let i = opts.indexOf(cur); if(i < 0) i = opts.findIndex(f => f >= cur); i = clamp(i + dir, 0, opts.length - 1); const v = opts[i];
  if(v === fareOf(id)) delete W.fares[id]; else W.fares[id] = v; render(); }
function c1WhatIfRender(){
  const W = c1WiS(), now = c1WiRows({}), wi = c1WiRows(W.fares), changed = Object.keys(W.fares).length > 0, X = S.c1 || (S.c1 = {}), first = !X.wiSeen;
  const T = c1T('whatif.title', { n:weekNo(S.day || 1) }), cols = [{ c:'B', w:140, top:'per passenger', main:'Fare' }, { c:'C', w:140, top:'a day', main:'Want to fly' }, { c:'D', w:150, top:`of ${num((wi.rows[0] || {}).seats || 0)} a day`, main:'Seats filled' },
    { c:'E', w:150, top:'a day', main:'Ticket revenue' }, { c:'F', w:140, top:'a day', main:'Costs' }, { c:'G', w:150, top:'a day', main:'Profit' }];
  const rows = [{ r:1, t:'hdr' }], v = {};
  wi.rows.forEach((x, i) => { const r = i + 2, n0 = now.rows.find(z => z.id === x.id) || x; rows.push({ r, label:x.r.city, fl:x.r.flag });
    v['B' + r] = { t:money(x.fare), wi:x.id }; v['C' + r] = { t:num(x.want), f:true }; v['D' + r] = { t:num(x.pax), f:true, bar:x.seats ? x.pax / x.seats : 0 };
    v['E' + r] = { t:money(x.rev), f:true }; v['F' + r] = { t:money(x.cost) }; v['G' + r] = { t:money(x.profit), f:true, cls:changed && x.profit > n0.profit ? 'pos' : x.profit < 0 ? 'soft' : '' }; });
  const rT = wi.rows.length + 2; rows.push({ r:rT, label:'Both routes', ic:'coins', t:'tot', gold:true });
  if(wi.rows.length !== 2) rows[rows.length - 1].label = 'All routes';
  v['E' + rT] = { t:money(wi.tot.rev), f:true }; v['F' + rT] = { t:money(wi.tot.cost), f:true }; v['G' + rT] = { t:money(wi.tot.profit), f:true, cls:changed && wi.tot.profit > now.tot.profit ? 'pos' : '' };
  if(wi.tot.profit > 0) v['G' + rT].cls = (v['G' + rT].cls || '') + ' gold';
  const sp = { id:'whatif:' + (S.day || 1), crumb:`${(S.airline && S.airline.name) || 'Airline'} HQ · ${T.text[0] || 'Plan week ' + weekNo(S.day || 1)}`, title:T.title || 'What if you change a fare?', tabs:ashTabs('whatif'), lw:170, cols, rows, v, sums:[], act:null, just:null,
    doneLine:'Change any fare with − and +. Every number on its row works itself out (ƒ).' };
  const diff = d => d > 0 ? `<span class="pos">(${money(d)} more)</span>` : d < 0 ? `<span class="c1-less">(${money(-d)} less)</span>` : '';
  const C = c1T('whatif.changed'), lines = wi.rows.filter(x => W.fares[x.id] !== undefined).map(x => { const n0 = now.rows.find(z => z.id === x.id) || x;
    return `<div class="c1-wil"><span>${esc(x.r.city)} ${money(n0.fare)} → <b>${money(x.fare)}</b></span><span>${x.pax === n0.pax ? (x.pax >= x.seats ? 'still full' : `${num(x.pax)} fly`) : `${num(n0.pax)} → ${num(x.pax)} fly`} · profit a day ${money(n0.profit)} → <b>${money(x.profit)}</b> ${diff(x.profit - n0.profit)}</span></div>`; }).join('');
  const panel = changed ? `<section class="c1-wic" aria-label="What changed"><span class="c1-wie">${esc(C.eyebrow || 'WHAT CHANGED, AGAINST THE FARES YOU HAVE NOW')}</span>${lines}
      <div class="c1-wil tot"><span><b>${wi.rows.length === 2 ? 'Both routes' : 'All routes'}</b></span><span>profit a day ${money(now.tot.profit)} → <b class="gold">${money(wi.tot.profit)}</b> ${diff(wi.tot.profit - now.tot.profit)}</span></div>
      <button class="bv-btn" id="c1WiBack">${esc(C.button || '↶ Back to my fares')}</button></section>` : '';
  const F = c1T('whatif.first'), co = first ? `<div class="ash-co c1-wico pu" role="dialog" aria-label="${esc(F.title)}"><i class="ash-ptr" aria-hidden="true"></i><span class="ash-coe">${esc(F.eyebrow || 'NEW · WHAT IF')}</span><b class="ash-cot">${esc(F.title)}</b>${F.text.map(t => `<p>${c1Html(t)}</p>`).join('')}<div class="ash-coa"><button class="bv-btn primary" id="c1WiGot">${esc(F.button || 'Got it')}</button></div></div>` : '';
  const Ft = c1T('whatif.footer', { n:weekNo(S.day || 1) });
  screen().innerHTML = shell(`<div class="dp ash-page c1-wi">${ashHtml(sp)}${co}${panel}</div>`, deskBar(Ft.text[0] || 'Plan the week · try fares before you set them.', `<button class="bv-btn big" id="c1WiClose">&#9664; Back</button><button class="bv-btn primary big" id="c1WiSet" ${changed ? '' : 'disabled'}>${esc((Ft.button || 'Set my fares ▶').replace('▶', '')).trim()} &#9654;</button>`));
  // the callout and What changed sit inside the sheet, under its line
  const root = screen(), ln = root.querySelector('.c1-wi .ash-line'); if(ln) root.querySelectorAll('.c1-wi > .c1-wico, .c1-wi > .c1-wic').forEach(e => ln.after(e));
  // the fares: − and + in each Fare cell; a changed fare is outlined green
  wi.rows.forEach((x, i) => { const c = root.querySelector(`.ash-grid .ash-c[data-ref="B${i + 2}"]`); if(!c) return;
    c.insertAdjacentHTML('afterbegin', `<span class="c1-wib"><button class="c1-wis" data-c1wi="${x.id}|-1" aria-label="${esc(x.r.city)}: lower fare">−</button><button class="c1-wis" data-c1wi="${x.id}|1" aria-label="${esc(x.r.city)}: higher fare">+</button></span>`);
    if(W.fares[x.id] !== undefined) c.classList.add('c1-wich'); });
  root.querySelectorAll('[data-c1wi]').forEach(b => b.onclick = () => { const [id, d] = b.getAttribute('data-c1wi').split('|'); c1WiStep(id, +d); });
  root.querySelectorAll('[data-ashtab]').forEach(b => b.onclick = () => { const t = b.getAttribute('data-ashtab'); if(t === 'whatif') return; UI.view = null; UI.ashTab = t; render(); });
  on('c1WiGot', () => { X.wiSeen = S.day || 1; save(); render(); });
  on('c1WiBack', () => { W.fares = {}; render(); });
  on('c1WiClose', () => { UI.view = null; render(); });
  on('c1WiSet', () => { const pl = normPlan(currentPlan()); pl.prices = Object.assign({}, pl.prices, W.fares); applyPlan(pl); W.fares = {}; UI.view = null; save(); toast('Your fares are in the plan.'); render(); });
}
const c1RenderView0 = renderView;
renderView = function(v){ if(v === 'whatif'){ if(c1WiOn()){ c1WhatIfRender(); return; } UI.view = null; return c1RenderView0.call(this, null); } return c1RenderView0.apply(this, arguments); };
/* the What if tab, after Week 1, from week 2 */
const c1Tabs0 = ashTabs;
ashTabs = function(on){ const t = c1Tabs0.apply(this, arguments); if(!c1WiOn()) return t; const i = t.findIndex(x => x.id === 'week'); t.splice(i < 0 ? t.length - 1 : i + 1, 0, { id:'whatif', label:'What if', ic:'tag', on:on === 'whatif', off:false }); return t; };
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-ashtab="whatif"]'); if(!b || !c1WiOn()) return; e.preventDefault(); e.stopImmediatePropagation(); UI.view = 'whatif'; render(); }, true);
/* and a row in the week plan opener's This week list */
const c1OpRows0 = op2Rows;
op2Rows = function(pl, L){ const h = c1OpRows0.apply(this, arguments); if(!c1WiOn()) return h;
  return h + `<li class="op2-r c1-wir"><span class="op2-i">${ICO2.tag || ''}</span><span class="op2-t">What if you change a fare? Try fares before you set them.</span><span class="op2-l"><button class="op2-a" data-c1wigo>What if ›</button></span></li>`; };
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-c1wigo]'); if(!b || !c1WiOn()) return; e.preventDefault(); UI.view = 'whatif'; render(); }, true);
if(window.__tkSums) window.__tkSums.unshift({ what:'the what-if sheet', test:() => !!document.getElementById('c1WiGot'), plan:() => ({ at:'#c1WiGot', value:'Got it', go:() => document.getElementById('c1WiGot').click() }) });
