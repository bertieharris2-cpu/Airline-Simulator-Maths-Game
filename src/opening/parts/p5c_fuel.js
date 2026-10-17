
/* ==================================================================
   THE FUEL DESK, SAID PLAINLY (D96, Fable's screens brief, 17 Oct 2026; Settings fuelFillLabel, fuelAccounting)
   - The fill button names its limit: "Most I can afford: N blocks" when cash is the limit, "Fill the tank: N blocks" when
     the tank is; the grey line under the blocks says which.
   - The order sum carries the relationship ("Fuel order = blocks × price per 1,000 L") instead of an instruction; the same
     chips, distractors included (choosing the right figures is the point).
   - The week's requirement has a scale: "about £6,170 at £1.47".
   - After an order: what it did to the money, said once, gently: "Buying 7,000 L moves £10,290 from cash into the tank.
     Each day's profit counts only the fuel your flights burn, at the price you paid for it", with Cash before → after and
     Tank before → after. The day's statement then reads "Fuel burned: 600 L × £1.47 = £882".
   ================================================================== */
{
let fdBefore = null;   // cash and tank just before Confirm purchase
document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('#fdBuy'); if(b && !b.disabled) fdBefore = { cash:S.cash, tank:S.fuel, day:S.day }; }, true);
const fdPlural = n => `${n} block${n === 1 ? '' : 's'}`;
const fdH0 = fuelDeskHtml;
fuelDeskHtml = function(asView){
  let h = fdH0(asView); if(!weekMode()) return h;
  try{
    const P0 = fuelOn(S.day || 1), blk = fuelBlock(), max = fdMaxBlocks(P0), space = Math.floor(tankSpace() / blk + 1e-9), cashB = Math.floor(Math.max(0, S.cash - (WORLD.cashReserve || 0)) / (blk * P0) + 1e-9), cashLimit = cashB < space;
    // the fill button and the line under the blocks name the limit
    if(WBS().fuelFillLabel !== false){
      h = h.replace(/(data-fdfill="1"[^>]*>)Fill: [\d,]+ L<\/button>/, `$1${cashLimit ? 'Most I can afford' : 'Fill the tank'}: ${fdPlural(max)}</button>`);
      h = h.replace(/(<p class="fd-lim">[\s\S]*?)<\/p>/, `$1 <b class="fd-limw">${cashLimit ? 'Cash is the limit.' : 'The tank is the limit.'}</b></p>`);
    }
    // the requirement, and what it costs at today's price
    const need = fdNeed(S.day || 1);
    h = h.replace(/(This week's requirement <small>[^<]*)(<\/small>)/, `$1$2<small class="fd-need">about ${money(Math.round(need.week * P0))} at ${priceL(P0)}</small>`);
    // the order sum: the relationship in one line
    const rel = `<b class="fd-rel"><span>Fuel order</span> = blocks × price per ${num(blk)} L</b>`;
    h = h.replace('<b>Build the order: the figures and the operation</b>', rel).replace('<b>Sign off the order</b>', rel);
    // after an order: what it did to the money
    if(UI.fd && UI.fd.done && fdBefore && fdBefore.day === S.day && S.cash < fdBefore.cash - 0.5){ UI.fdAcct = { cash0:fdBefore.cash, cash1:S.cash, tank0:fdBefore.tank, tank1:S.fuel }; fdBefore = null; }
    if(UI.fd && !UI.fd.done) UI.fdAcct = null;
    const A = UI.fdAcct;
    if(A && WBS().fuelAccounting){
      const L = Math.round(A.tank1 - A.tank0), cost = Math.round(A.cash0 - A.cash1);
      h = h.replace(/(<p class="fd-done good"[^>]*>[\s\S]*?<\/p>)/, `$1<div class="fd-acct"><p>Buying ${num(L)} L moves <b>${money(cost)}</b> from cash into the tank. Each day's profit counts only the fuel your flights burn, at the price you paid for it.</p><div class="fd-acs"><span>Cash <b>${money(Math.round(A.cash0))}</b> → <b>${money(Math.round(A.cash1))}</b></span><span>Tank <b>${num(Math.round(A.tank0))} L</b> → <b>${num(Math.round(A.tank1))} L</b></span></div></div>`);
    }
  }catch(e){}
  return h;
};
/* the day's statement: the fuel line is the litres burned at the price paid, not the order */
const fdAR0 = applyResults;
applyResults = function(){
  const r = fdAR0.apply(this, arguments);
  try{ const why = (S.rnd && S.rnd.why) || [], i = why.findIndex(w => w.ic === '⛽' && /^Fuel used today cost/.test(w.text));
    if(i >= 0){ const fl = (S.rnd.flights || []).filter(f => !f.grounded && !f.noFuel && !f.cancelled), L = fl.reduce((t, f) => t + (f.fuelL || 0), 0), cost = fl.reduce((t, f) => t + (f.fuelCost || 0), 0);
      if(L > 0 && cost > 0) why[i] = { ic:'⛽', text:`Fuel burned: ${num(L)} L × ${priceL(cost / L)} = ${money(Math.round(cost))}, at the price you paid for it (today's price is ${priceL(fuelPrice())}).` }; } }catch(e){}
  return r;
};
}
