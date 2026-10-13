/* ==================================================================
   THE SHOP UNDER FLEET (Bertie, 13 Oct 2026): "I declined to buy a plane at the end of week one, because it wasn't
   economically viable. I need the opportunity to buy a plane after that whenever I want."
   - The Fleet view has an "Add an aircraft" panel: what is in the shop today and one button, Rent or buy an aircraft.
   - The run board (Tuesday to Sunday) has the same button in its footer, since it has no side menu.
   - The button puts the shop (shop2) in front of the step he is on. The usual chain follows: the comparison while the
     fleet is one aircraft, the rent-or-buy sum, Rent · Finance · Buy, the paint shop and the hangar. Then he is back
     where he was. "Not today" goes straight back.
   - Bought on a run day: the aircraft joins the fleet now. Its rent, finance payment and day cost start tomorrow, and
     it flies nothing today. Services chosen on the comparison screen fly from tomorrow; otherwise Monday's plan
     ("has no flights yet: Plan its day").
   ================================================================== */
const SHOP_CHAIN = ['shop2', 'fleetSums', 'acquire', 'paint', 'reveal'];
function shopPlanesNow(day){ return shopPlanes(day).filter(p => { const o = shopOffer(p, day); return o.canLease || o.buyOffered || o.canFinance; }); }
function shopFirstDay(){ const d0 = (S && S.day) || 1; for(let d = d0; d < d0 + 400; d++) if(shopPlanesNow(d).length) return d; return null; }
/* why the button is off, or '' when it is on */
function shopClosedWhy(){
  if(!S || S.phase === 'setup') return 'The shop opens once the airline is flying.';
  const t = (step() || {}).t;
  if(['fly', 'sim', 'takeoff'].includes(t)) return "Open the shop when today's flights have landed.";
  if(SHOP_CHAIN.includes(t)) return 'You are in the shop now.';
  if(!shopPlanesNow().length){ const d = shopFirstDay(); return d ? `Aircraft can be bought from ${dateLong(d)}.` : 'No aircraft are for sale yet.'; }
  return '';
}
function openShopNow(){
  if(shopClosedWhy()) { toast(shopClosedWhy()); return; }
  if(UI.wkTimer){ clearTimeout(UI.wkTimer); UI.wkTimer = null; }
  // the shop's own steps find "the" shop2, so a visit earlier today steps aside
  for(let k = S.si - 1; k >= 0; k--) if(SHOP_CHAIN.includes(S.steps[k].t)){ S.steps.splice(k, 1); S.si--; if(S.rnd.returnTo !== undefined && S.rnd.returnTo > k) S.rnd.returnTo--; }
  const t = step().t;
  S.rnd.shopAdHoc = { day:S.day, run:t === 'weekRun', from:t };
  delete S.rnd.shopPick; delete S.rnd.acChoice;
  S.steps.splice(S.si, 0, { t:'shop2', adHoc:true }); UI.view = null; UI.justDone = null;
  if(typeof resetEntry === 'function') resetEntry();
  save(); render();
}
/* bought on a run day: nothing until tomorrow (no flights today, no rent or day cost today) */
const acquirePlaneFS0 = acquirePlane;
acquirePlane = function(p, kind){
  const uid = acquirePlaneFS0(p, kind), A = S.rnd && S.rnd.shopAdHoc;
  if(A && A.run && A.day === S.day){ const f = S.fleet.find(x => x.uid === uid); if(f){ f.costFrom = S.day + 1; f.flyFrom = S.day + 1; } }
  return uid;
};
const dayCostOfFS0 = dayCostOf;
dayCostOf = function(f){ if(f && f.costFrom && simDayNow() < f.costFrom) return 0; return dayCostOfFS0(f); };   // simDayNow: the day being simulated (withDay), else today
const planFlightsFS0 = planFlights;
planFlights = function(){ const out = planFlightsFS0.apply(this, arguments); if(!S || !S.fleet || !S.fleet.some(f => f.flyFrom)) return out;
  const d = simDayNow(); return out.filter(x => { const f = S.fleet.find(z => z.uid === x.uid); return !(f && f.flyFrom && d < f.flyFrom); }); };

/* "Buy" in chapter 1 (buy only), "Rent or buy" once renting opens */
function shopVerb(){ return shopPlanesNow().some(p => shopOffer(p).canLease) ? 'Rent or buy' : 'Buy'; }
/* the panel in the Fleet view */
function fleetShopHtml(){
  const why = shopClosedWhy(), list = shopPlanesNow(), cash = Math.round(S.cash), rent = list.some(p => shopOffer(p).canLease);
  const rows = list.map(p => { const o = shopOffer(p); return `<div class="fs-row"><b>${esc(p.name)}</b><span>${p.seats} seats</span>${rent ? `<span>${o.canLease ? `${money(o.lease)} a day to rent` : '—'}</span>` : ''}<span>${o.buyOffered ? `${money(o.price)} to buy` : 'not for sale yet'}</span></div>`; }).join('');
  return `<section class="hp fs-shop">${hqHead('Add an aircraft', list.length ? `${list.length} IN THE SHOP` : 'SHOP CLOSED')}<div class="pb">
    ${rows ? `<div class="fs-list">${rows}</div>` : ''}
    <div class="fs-act"><button class="btn primary" id="fleetShop" ${why ? 'disabled' : ''}>${shopVerb()} an aircraft &#9654;</button><span class="muted">${esc(why || `Cash ${money(cash)}. Keep ${money(WORLD.cashReserve || 0)} back for emergencies. You will see the sums before you decide.`)}</span></div></div></section>`;
}
const renderViewFS0 = renderView;
renderView = function(v){
  renderViewFS0(v); if(v !== 'fleet' || !S) return;
  const host = screen().querySelector('.vw'); if(!host || host.querySelector('.fs-shop')) return;
  host.insertAdjacentHTML('beforeend', fleetShopHtml()); on('fleetShop', openShopNow);
};
/* the run board's footer: the same button (the board has no side menu) */
const weekRunFS0 = R.weekRun;
R.weekRun = st => {
  const r = weekRunFS0(st); if(step().t !== 'weekRun') return r;
  const foot = screen().querySelector('.tf-foot, footer, .foot') || null, why = shopClosedWhy();
  const btn = `<button class="btn small fs-board" id="boardShop" ${why ? 'disabled' : ''} title="${esc(why || `${shopVerb()} an aircraft now. It flies from tomorrow at the earliest.`)}">${ICO2 && ICO2.plane ? ICO2.plane : ''} Aircraft shop</button>`;
  if(foot) foot.insertAdjacentHTML('beforeend', btn); else screen().insertAdjacentHTML('beforeend', `<div class="fs-board-wrap">${btn}</div>`);
  on('boardShop', openShopNow);
  return r;
};
/* when he leaves the shop, the visit is over */
const advanceFS0 = advance;
advance = function(){ const r = advanceFS0.apply(this, arguments); if(S && S.rnd && S.rnd.shopAdHoc && !SHOP_CHAIN.includes((step() || {}).t)) delete S.rnd.shopAdHoc; return r; };
