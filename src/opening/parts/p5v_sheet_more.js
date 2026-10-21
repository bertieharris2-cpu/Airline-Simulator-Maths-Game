/* =====================================================================
   THE SHEETS OF YEAR ONE, PART 2 (handover 19 Oct evening, sections 3.5, 3.6, 7.5, 7.6): the Sunday review on the
   week's sheet, and the Fuel desk from Launch Day with the order's sum on a small sheet. Year one only.
   ===================================================================== */

/* ---------- 7.6 the Fuel desk opens on Launch Day ----------
   Settings fuelDeskOpensDay (D105, 1): the desk is open (no padlock) and the airline has its tank from that day; the week's
   order is placed there (Launch Day's sums no longer ask for it). Fuel is still free on Monday and Tuesday of week 1 (the
   Calendar's "Fuel is free" days): those days burn nothing from the tank, and the week's need counts only the days that
   pay. The order is bought with the pupil's own cash at the day's price. The week-2 desk features that read fuelDeskFromDay
   (sign-offs, the Operations Model) keep day 8. */
const ashFuelFrom = () => { const v = +(WBS().fuelDeskOpensDay); return v > 0 ? v : 1; };
const ashFuelEarly = () => !!S && typeof yearOne === 'function' && yearOne() && typeof weekMode === 'function' && weekMode() && ashFuelFrom() < (WORLD.deskFromDay || 8);
const ashDeskModeAt0 = deskModeAt;
deskModeAt = function(day){ if(ashFuelEarly() && day >= ashFuelFrom() && day < (WORLD.deskFromDay || 8)) return true; return ashDeskModeAt0.apply(this, arguments); };
const ashContract0 = fuelContract;
fuelContract = function(){ if(ashFuelEarly()) return !!S && fuelDay() < ashFuelFrom(); return ashContract0.apply(this, arguments); };
const ashModuleOn0 = moduleOn;
moduleOn = function(id){ if(id === 'fuel' && ashFuelEarly()) return wkPlanner() && (S.day || 1) >= ashFuelFrom(); return ashModuleOn0.apply(this, arguments); };
/* the days of this week that pay for their fuel (Monday and Tuesday of week 1 are free) */
function ashPaidDays(day){ const end = day + (7 - ((day - 1) % 7)) - 1, out = []; for(let d = day; d <= end; d++) if(!fuelFreeDay(d)) out.push(d); return out; }
const ashNeed0 = fdNeed;
fdNeed = function(day){ const N = ashNeed0.apply(this, arguments); if(!ashFuelEarly() && !(ashOn() && weekNo(day) === 1)) return N; const n = ashPaidDays(day).length; return Object.assign({}, N, { days:n, week:(N.perDay || 0) * n, from:ashPaidDays(day)[0] || day }); };
const ashWeekNeed0 = s2WeekNeed;
s2WeekNeed = function(){ const v = ashWeekNeed0.apply(this, arguments); if(!(ashOn() && weekNo(S.day || 1) === 1)) return v; const d = S.day || 1, all = 7 - ((d - 1) % 7), paid = ashPaidDays(d).length; return all ? v * paid / all : v; };
/* Launch Day's steps gain the Fuel desk after the sheet (before Ready and the take-off) */
function ashLaunchDesk(){
  if(!S || S.phase !== 'setup' || !ashFuelEarly() || ashFuelFrom() > 1 || !wkPlanner() || !S.steps || S.steps.some(s => s.t === 'fuelDesk')) return;
  const i = S.steps.findIndex(s => s.t === 'workings'); if(i < 0) return; S.steps.splice(i + 1, 0, { t:'fuelDesk' }); if(S.si > i) S.si++;
}
const ashFdRender0 = render;
render = function(){ try{ ashLaunchDesk(); }catch(e){} return ashFdRender0.apply(this, arguments); };
/* Monday and Tuesday of week 1 are the launch deal's free days: an order placed then is for the days that pay. It goes into
   the tank at once (nothing burns it until Wednesday), at Wednesday's price, and is paid from the pupil's own cash when it is
   delivered on Wednesday morning: the handover's order "This order · Wed to Sun" and the briefing's cash (£8,600 → £4,700).
   What can be ordered is limited by the cash there will be then (the cash now, plus the free days' projected profit). */
const ashFwd = () => ashFuelEarly() && fuelFreeDay(S.day || 1) && weekNo(S.day || 1) === 1 && !!ashPaidDays(S.day || 1).length;
let ASH_FWD = false;
const ashFuelOn0 = fuelOn;
fuelOn = function(day){ if(ASH_FWD && day === (S.day || 1)) return ashFuelOn0(ashPaidDays(S.day || 1)[0]); return ashFuelOn0.apply(this, arguments); };
const ashRenderFd0 = renderFuelDesk;
renderFuelDesk = function(){ const on = ashFwd(); ASH_FWD = on; try{ return ashRenderFd0.apply(this, arguments); } finally { ASH_FWD = false; if(on) ashFwdWords(); } };
function ashFwdCash(){ const days = Math.max(0, ashPaidDays(S.day || 1)[0] - (S.day || 1)), per = Math.max(0, planLines(currentPlan()).v.profit || 0); return S.cash + per * days - ((S.fuelDue && S.fuelDue.amount) || 0); }
const ashMaxB0 = fdMaxBlocks;
fdMaxBlocks = function(price){ if(!ashFwd()) return ashMaxB0.apply(this, arguments); const blk = fuelBlock(), space = Math.floor(tankSpace() / blk + 1e-9), cash = Math.floor(Math.max(0, ashFwdCash() - (WORLD.cashReserve || 0)) / (blk * price) + 1e-9); return Math.max(0, Math.min(space, cash)); };
const ashBuyFwd0 = buyFuel;
buyFuel = function(litres, price){ const fwd = ashFwd() && (step().t === 'fuelDesk' || UI.view === 'fuel'), c0 = S.cash, r = ashBuyFwd0.apply(this, arguments);
  if(fwd){ const paid = r2(c0 - S.cash), D = S.fuelDue || (S.fuelDue = { amount:0, day:ashPaidDays(S.day || 1)[0], L:0 }); S.cash = c0; D.amount = r2(D.amount + paid); D.L += litres; D.p = price; save(); }
  return r; };
/* paid on delivery: the first fuel burned on or after the delivery day (or the next screen drawn from that day) */
function ashPayDue(day){ const D = S && S.fuelDue; if(!D || (day || 1) < D.day) return; S.cash = r2(S.cash - D.amount); delete S.fuelDue;
  try{ if(S.rnd && S.rnd.why) S.rnd.why.push({ ic:'⛽', text:`Your fuel order arrived: ${num(D.L)} L at ${priceL(D.p)} a litre, ${money(D.amount)} paid.` }); }catch(e){} }
const ashBurn0 = burnFuel;
burnFuel = function(L, day){ try{ ashPayDue(day || fuelDay()); }catch(e){} return ashBurn0.apply(this, arguments); };
const ashDueRender0 = render;
render = function(){ try{ if(S && S.fuelDue && S.phase !== 'setup' && (S.day || 1) >= S.fuelDue.day) ashPayDue(S.day || 1); }catch(e){} return ashDueRender0.apply(this, arguments); };
/* the desk's words on a free day: the price is Wednesday's and the order is paid when it arrives */
function ashFwdWords(){
  const root = screen(), d = ashPaidDays(S.day || 1)[0], wd = dateShort(d), P = ashFuelOn0(d), D = S.fuelDue;
  const sum = root.querySelector('.fd2-sum'); if(sum) sum.innerHTML = sum.innerHTML.replace(/^Today <b>[^<]*<\/b> a litre/, `Today: free (the launch deal) · ${esc(wd)} <b>${priceL(P)}</b> a litre`);
  const today = root.querySelector('.fd2-today'); if(today) today.innerHTML = today.innerHTML.replace(/^Today/, esc(wd.split(' ')[0]));
  const ph = root.querySelector('.fd2-pos .fd2-ph span'), pd = ashPaidDays(S.day || 1); if(ph && pd.length) ph.textContent = `this week: ${fmtRange(pd[0], pd[pd.length - 1])}`;
  const cash = Math.max(0, Math.round(ashFwdCash())), can = Math.floor(cash / (fuelBlock() * P) + 1e-9) * fuelBlock();
  const lim = root.querySelector('.fd-lim'); if(lim) lim.innerHTML = `On ${esc(wd.split(' ')[0])} you will have about <b>${money(Math.round(cash / 100) * 100)}</b>${D ? ' after this order' : ''}: enough for ${num(can)} L more.`;
  const note = root.querySelector('.fd2-note'); if(note) note.innerHTML = `Fuel is free until ${esc(wd)}. An order placed today arrives for ${esc(wd)} at ${esc(wd.split(' ')[0])}'s price, ${priceL(P)} a litre, and is paid from your cash when it arrives.${D ? ` <b>Ordered: ${num(D.L)} L, ${money(D.amount)} to pay on ${esc(wd)}.</b>` : ''}`;
}
/* the first visit to the desk opens with Cash, tank, profit (version A), then the desk's tour, then the order: the trigger is the desk's own (p5f) */

/* ---------- 3.6 the order's sum: a small sheet in the order panel (Litres to buy × Price a litre) ---------- */
function ashFoSpec(){
  const F = foWeek(), G = foFigures(), wk = weekNo(S.day || 1), key = 'fo:' + wk, L = G.n * G.blk, P0 = G.P0, total = Math.round(L * P0 * 100) / 100, need = fdNeed(S.day || 1), days = ashPaidDays(S.day || 1);
  if(!G.n) return null;
  const signed = F.signed && F.n === G.n, model = F.level === 'model', how = F.level === 'build' ? 'build' : 'book', short = d => WD3[calDate(d).getUTCDay()];
  const v = { B2:{ t:num(L) }, B3:{ t:priceL(P0) }, B4:signed || model ? { t:money(total), f:model, fin:!!F.shown } : {} };
  const sum = { id:key + '|' + G.n, tgt:'B4', refs:['B2', 'B3'], ops:['×'], words:'Litres to buy × Price a litre', kind:'fuelOrder', commute:true, how, built:F.level !== 'build' || !!F.built2, unit:'£', want:total, done:signed || model, recKey:key,
    get no(){ return sumNo(key); }, name:'the cost of this order',
    why:ref => ashRef(ref).r === 4 ? null : null,
    recO:{ type:'calc', relKey:'fuelOrder', doc:'Fuel order on the desk', ask:`${num(L)} L at ${priceL(P0)} a litre.`, question:`${num(L)} × ${priceL(P0)}`, unit:'£2', correct:total, correctText:twoDp(total), ops:[L, P0], op:'×', level:F.level === 'build' ? 'Build' : 'Calculate' },
    onBuilt:() => { F.built2 = true; },
    answer:(raw, val, st) => {
      let e = null; try{ e = recOpen(key, sum.recO); }catch(x){}
      const ok = Math.abs(val - total) < 0.005; try{ recAttempt(e, { ok, given:raw, value:val, method:'litres × price a litre' }); }catch(x){}
      const done = shown => { F.signed = true; F.n = G.n; F.shown = !!shown; F.q = false; F.tries = 0; F.tokens = []; if(UI.fd) UI.fd.signed = true;
        const o = foS(); if(F.level === 'calc'){ o.last = { price:P0, day:S.day || 1 }; o.built = false; } else if(F.level === 'build') o.built = true; try{ soSync(); }catch(x){} save(); };
      if(ok){ done(false); return { ok:true }; }
      if((st.tries || 0) + 1 >= 2 && twoTriesOn()){ try{ paperRecShown(key); }catch(x){} done(true); return { shown:true }; }
      return { note:ashWrong('×', [L, P0], val, total, '£') }; },
    hints:() => [{ t:`${num(L)} × ${priceL(P0)}: make the price whole (× 100), multiply, then ÷ 100.` }, { t:`${num(L)} litres is ${num(G.n)} lot${G.n === 1 ? '' : 's'} of ${num(G.blk)} L, and ${num(G.blk)} L costs ${money(G.per)}.` }, { t:`Check: about ${money(ashRound(total))}.`, est:true }],
    how2:() => ashHowFor('×', L + 1000, Math.round((P0 + 0.1) * 100) / 100, 'ppl', 'Cost of this order = Litres to buy × Price a litre'),
    co:{ at:['B', 2, 'B', 4], eyebrow:'NEW SUM', title:'The cost of an order', text:['Every litre costs the same price.'], rule:'Cost = <i>A</i> Litres to buy × <i>B</i> Price a litre' } };
  // the desk's tour (21 Oct 2026): the order sheet stays idle until its step (no lit block, no ? cell, an empty formula bar, no line), and its
  // own callout waits until the tour is done (one callout at a time)
  const tour = typeof fd2TourStep === 'function' ? fd2TourStep() : 0;
  if(tour && tour < 3 && !sum.done) return { id:'fuel:' + wk, small:true, tight:true, coAside:true, lw:190, cols:[{ c:'B', w:128, top:'This order', main:(days[0] || S.day || 1) === (days[days.length - 1] || days[0] || S.day || 1) ? short(days[0] || S.day || 1) : `${short(days[0])} to ${short(days[days.length - 1])}` }],
    rows:[{ r:1, t:'hdr' }, { r:2, label:'Litres to buy', ic:'drum' }, { r:3, label:'Price a litre', ic:'tag' }, { r:4, label:'Cost of this order', ic:'receipt', t:'tot', gold:true }], v, sums:[sum], act:null, just:null, doneF:null, doneLine:'', idle:true, need };
  if(tour) sum.co = null;
  const J = UI.ashJust && UI.ashJust.sheet === 'fuel:' + wk && UI.ashJust.sum === sum.id ? sum : null, act = sum.done || J ? null : sum;
  if(J) J.doneLine = F.shown ? `Finance has filled this one in: ${money(total)}. Copy it into your book beside Sum ${sum.no}.` : `This order costs <b class="gold">${money(total)}</b> · Sum ${sum.no} in your record`;
  const from = days[0] || S.day || 1, to = days[days.length - 1] || from;
  return { id:'fuel:' + wk, small:true, tight:true, coAside:true, lw:190, cols:[{ c:'B', w:128, top:'This order', main:from === to ? short(from) : `${short(from)} to ${short(to)}` }],
    rows:[{ r:1, t:'hdr' }, { r:2, label:'Litres to buy', ic:'drum' }, { r:3, label:'Price a litre', ic:'tag' }, { r:4, label:'Cost of this order', ic:'receipt', t:'tot', gold:true }], v, sums:[sum], act, just:J,
    doneLine:model ? `<span class="ash-au">ƒ</span> The airline works out the order now: <b class="gold">${money(total)}</b>.` : `<span class="pos">✓</span> This order costs <b class="gold">${money(total)}</b>.`, need };
}
const ashFdHtml0 = fuelDeskHtml;
fuelDeskHtml = function(asView){
  let h = ashFdHtml0.apply(this, arguments); if(!ashOn() || !fd2On()) return h;
  // the Fuel Tank's words (DESIGN.md, FuelTank; handover 7.8), under the position panel's note
  h = h.replace(/(<p class="fd2-note">[\s\S]*?<\/p>)/, '$1<p class="fd2-tankw">Fuel you buy waits in your tank. Each day pays for the fuel it burns.</p>');
  const sp = ashFoSpec(); UI.ashFo = sp; if(!sp) return h.replace(/<div class="fd-sign[\s\S]*?<span class="sc-msg" role="status">[^<]*<\/span><\/div>/, '');
  // the old sign-off box (n × the price of a block) gives way to the small sheet
  let out = h.replace(/<div class="fd-sign[^"]*">[\s\S]*?<span class="sc-msg" role="status">[^<]*<\/span><\/div>/, '').replace(/<div class="fd-sign ok one paper">[\s\S]*?<\/div>/, '');
  const at = out.indexOf('<div class="fd-tot">'); if(at < 0) return out;
  out = out.replace('<div class="fd-ob">', '<div class="fd-ob ash-2">'); const at2 = out.indexOf('<div class="fd-tot">');
  return out.slice(0, at2) + `<div class="ash-fo">${ashHtml(sp)}</div>` + out.slice(at2);
};
const ashFdBind0 = bindFuelDesk;
bindFuelDesk = function(asView){
  ashFdBind0.apply(this, arguments); const sp = UI.ashFo; if(!ashOn() || !fd2On() || !sp) return;
  ashBind(sp);
  // the next sum on the desk is the purchase itself: the line under the sheet says so
  const buy = $('fdBuy'), F = foWeek(), G = foFigures(); if(buy && F.level !== 'model' && G.n > 0 && !(F.signed && F.n === G.n)) buy.disabled = true;
  if(UI.ashJust && UI.ashJust.sheet === sp.id){ const b = $('fdBuy'); if(b && !b.disabled) setTimeout(() => { try{ b.focus(); }catch(e){} }, 40); }
};
/* every order placed goes on the Fuel tab (the latest first) */
const ashBuyFuel0 = buyFuel;
buyFuel = function(litres, price){ const before = S.fuel, r = ashBuyFuel0.apply(this, arguments);
  try{ if(ashOn() && S.fuel > before + 1e-9){ const L = Math.round(S.fuel - before), P0 = price || fuelOn(S.day || 1), wk = weekNo(S.day || 1), B = S.ashBook || (S.ashBook = {}), list = B.fuel = B.fuel || [];
    list.unshift({ key:'fo:' + (S.day || 1) + ':' + list.length, title:'Fuel orders', lw:300, cols:[{ c:'B', w:170, top:dateShort(S.day || 1), main:`Week ${wk}` }],
      rows:[{ r:1, t:'hdr' }, { r:2, label:'Litres bought', ic:'drum' }, { r:3, label:'Price a litre', ic:'tag' }, { r:4, label:'Cost of this order', ic:'receipt', t:'tot', gold:true }],
      v:{ B2:{ t:num(L) }, B3:{ t:priceL(P0) }, B4:{ t:money(Math.round(L * P0 * 100) / 100) } }, doneLine:`<span class="pos">✓</span> ${num(L)} L in the tank at ${priceL(P0)} a litre.`, day:S.day || 1 });
    if(list.length > 12) list.length = 12; } }catch(e){}
  return r; };

/* ---------- 3.5 the Sunday review on the week's sheet ----------
   Three columns: what happened (seat fill, each day, route performance on two lines a route); the week's sheet as the
   hero, with its formula bar (the day cells outlined without tags for the total; the 7 is a cell too, "Days flown", so
   every figure the sums use is on the sheet); and only the gold SUM n badge with the rule in words. The answer is typed
   into its cell and Enter checks it: no answer box, no Check, no copies of the figures. */
function ashReviewSpec(W, items){
  const wk = weekNo(W.from), store = W, days = Array.from({ length:7 }, (_, k) => W.from + k).filter(d => W.rows.some(r => r.d === d)), T = items.find(x => x.id === 'tot'), D = items.find(x => x.id === 'diff'), M = items.find(x => x.id === 'mean');
  const rows = [{ r:1, t:'hdr' }], v = {}, rowOf = {}; let r = 2;
  days.forEach(d => { rows.push({ r, label:rbShort(d), ic:'cal' }); v['B' + r] = { t:money(Math.round((W.rows.find(x => x.d === d) || {}).profit || 0)), cls:((W.rows.find(x => x.d === d) || {}).profit || 0) < 0 ? 'soft' : '' }; rowOf['d' + d] = r; r++; });
  const rTot = r++, rProj = r++, rDiff = r++, rDays = M ? r++ : 0, rMean = M ? r++ : 0;
  rows.push({ r:rTot, label:'Profit this week', ic:'coins', t:'tot', gold:true }, { r:rProj, label:'Projected on Monday', ic:'note' }, { r:rDiff, label:'Difference from the plan', ic:'scale', gold:true });
  if(M) rows.push({ r:rDays, label:'Days flown', ic:'cal' }, { r:rMean, label:'Average a day', ic:'chart', t:'fin', gold:true });
  const total = rbValue(T), proj = Math.round(W.projected || 0), ok = id => rbState(store, id).ok;
  v['B' + rProj] = { t:money(proj) }; if(M) v['B' + rDays] = { t:num(M.div) };
  if(ok('tot')) v['B' + rTot] = { t:money(total), cls:total < 0 ? 'soft' : '', fin:!!rbState(store, 'tot').ashown };
  if(ok('diff')) v['B' + rDiff] = total > proj ? { t:'+' + money(rbValue(D)), cls:'pos', fin:!!rbState(store, 'diff').ashown } : { t:rbValue(D) ? rbResultWords(D).replace(/ than .*$/, '') : 'On plan', fin:!!rbState(store, 'diff').ashown };   // "£813 less": the row's label says from what; the line under the sheet has the whole sentence
  if(M && ok('mean')) v['B' + rMean] = { t:money(rbValue(M)), fin:!!rbState(store, 'mean').ashown };
  const larger = proj >= total ? 'B' + rProj : 'B' + rTot, smaller = larger === 'B' + rProj ? 'B' + rTot : 'B' + rProj;
  // 21 Oct 2026 (Bertie): the sheet does the adding. A formula-only sum (SheetSums how = formula: Profit this week, Average a day) is
  // built by clicking its cells and the sheet works it out: no book, no Sum number. From the week 3 review (Calendar skills: sumDrag)
  // Profit this week is added with Σ SUM, dragged down the Profit column.
  const howOf = id => { const h = ashSum(id).how; return h === 'formula' ? 'formula' : h === 'book' ? 'book' : 'build'; }, sumDrag = typeof h21SumDragOn === 'function' && h21SumDragOn(W.from + 6);
  const d0 = days[0], dL = days[days.length - 1], wd = d => WDAY[calDate(d).getUTCDay()], nDays = typeof h21Words === 'function' ? h21Words(days.length) : String(days.length);
  const mk = (it, o) => { const st = rbState(store, it.id), key = 'rb:' + it.id, formula = o.how === 'formula';
    return Object.assign({ id:'rv:' + wk + ':' + it.id, kind:'review:' + it.id, built:!!st.built, unit:'£', done:!!st.ok, want:rbValue(it), recKey:key, get no(){ return formula ? null : sumNo(key); }, get sumText(){ return st.sumText; },
      recO:{ type:'build', relKey:it.kind === 'sum' ? 'weekTotal' : it.kind === 'diff' ? 'projectedVsActual' : 'meanDay', doc:`Week ${wk} accounts: ${o.title}`, ask:o.rule, unit:'£', correct:rbValue(it), correctText:money(rbValue(it)), level:'Build' },
      onBuilt:() => { st.built = true; st.formula = o.words; }, onSum:txt => { st.sumText = txt; }, onSumKey:() => { if(typeof ashSee === 'function' && !ashSeen('sumKey')) ashSee('sumKey'); },
      answer:(raw, val, s2) => { const want = rbValue(it), good = Math.abs(val - want) < 0.5; if(formula){ st.ok = true; st.q = false; return { ok:true }; }   // the sheet worked it out: the build is the record
        try{ rv2Rec(it, good, raw, val); }catch(x){}
        if(good){ st.ok = true; st.q = false; return { ok:true }; }
        st.atries = (st.atries || 0) + 1;
        if(st.atries >= 2 && twoTriesOn()){ st.ok = true; st.ashown = true; try{ paperRecShown(key); }catch(x){} return { shown:true }; }
        return { note:ashWrong(it.kind === 'sum' ? '+' : it.kind === 'diff' ? '−' : '÷', it.kind === 'mean' ? [it.total, it.div] : it.kind === 'diff' ? [Math.max(proj, total), Math.min(proj, total)] : [], val, want, '£') }; },
      hints:() => ashHintFill("week's total and the mean", {}).map(t => ({ t })).concat([{ t:`Check: about ${money(ashRound(rbValue(it)))}.`, est:true }]),
      how2:() => '', answerText:it.kind === 'diff' ? rbResultWords(it) : money(rbValue(it)), rule:o.rule }, o); };
  const tHow = howOf('week.total'), tSum = tHow === 'formula' && sumDrag, tRefs = days.map(d => 'B' + rowOf['d' + d]), tRange = `${tRefs[0]}:${tRefs[tRefs.length - 1]}`;
  const tx = (id, v) => { const X = typeof h21Text === 'function' ? h21Text(id, v) : { text:[] }; return X; }, TV = { days:nDays, range:tRange, first:wd(d0).slice(0, 3), last:wd(dL).slice(0, 3), lastDay:wd(dL), cell:tRefs[tRefs.length - 1], total:money(total), mean:M ? money(rbValue(M)) : '' };
  const sums = [mk(T, { title:'Profit this week', tgt:'B' + rTot, refs:tRefs, ops:days.slice(1).map(() => '+'), words:days.length > 3 ? `${rbShort(days[0])} + … + ${rbShort(days[days.length - 1])}` : days.map(d => rbShort(d)).join(' + '), commute:true, how:tHow,
      noGap:tHow === 'formula', sumKey:tSum, sumWords:`add ${TV.first} to ${TV.last}`, barWords:tHow === 'formula' ? '' : undefined,
      sumLine:st2 => (st2.sumA ? tx('review.sum.drag', TV) : st2.sigma ? tx('review.sum.go', TV) : tx('review.sum.wait', TV)).text.map(h21Html).join(' ').replace(/press Enter\.?$/, 'press <button class="ash-key" data-ashsumgo>Enter</button>.'),
      lineBuild:tHow === 'formula' ? tx('review.total.card', TV).text.map(h21Html).join(' ') : undefined,
      sumWhy:(c, r1, r2) => r2 > rowOf['d' + dL] ? `That goes past ${wd(dL)}: the week's profit is the days only. Drag from ${wd(d0)}'s profit to ${wd(dL)}'s.` : r1 > rowOf['d' + d0] ? `That leaves out ${wd(d0)}. Drag from ${wd(d0)}'s profit to ${wd(dL)}'s.` : r2 < rowOf['d' + dL] ? `That stops before ${wd(dL)}. Drag from ${wd(d0)}'s profit to ${wd(dL)}'s.` : null,
      sumWrongCol:() => `Those are the days' names. Drag down the Profit column (B), from ${wd(d0)}'s profit to ${wd(dL)}'s.`,
      rule:`Profit this week = add the ${['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'][days.length] || days.length} days`, name:'the profit this week', doneLine:tHow === 'formula' ? tx('review.total.done', TV).text.map(h21Html).join(' ').replace(/^✓\s*/, '') : `Profit this week: <b class="gold">${money(total)}</b>`,
      why:ref => ashRef(ref).r > rTot ? 'That is below the days. This week\'s profit adds up the days: which cells hold them?' : null }),
    mk(D, { title:'Difference from the plan', tgt:'B' + rDiff, refs:[larger, smaller], ops:['−'], words:larger === 'B' + rProj ? 'Projected − Profit this week' : 'Profit this week − Projected', commute:false, how:howOf('week.difference') === 'formula' ? 'build' : howOf('week.difference'),
      rule:'Difference = the larger − the smaller', name:'the difference from the plan', orderWhy:'a difference starts from the larger amount, so it doesn\'t go below zero.', doneLine:`Difference from the plan: <b class="gold">${esc(rbResultWords(D))}</b>`,
      why:ref => { const p = ashRef(ref).r; return p !== rProj && p !== rTot ? 'The difference compares what was planned with what happened: which two cells are those?' : null; } })];
  if(M) sums.push(mk(M, { title:'Average a day', tgt:'B' + rMean, refs:['B' + rTot, 'B' + rDays], ops:['÷'], words:'Profit ÷ Days flown', commute:false, how:howOf('week.average'),
    lineBuild:howOf('week.average') === 'formula' ? tx('review.average.card', TV).text.map(h21Html).join(' ') : undefined,
    rule:`Average a day = Profit this week ÷ ${M.div}`, name:'the average a day', orderWhy:'an average shares the total out, so the total comes first.', doneLine:howOf('week.average') === 'formula' ? tx('review.average.done', TV).text.map(h21Html).join(' ').replace(/^✓\s*/, '') : `Average a day: <b class="gold">${money(rbValue(M))}</b>`,
    why:ref => { const p = ashRef(ref).r; return p < rTot ? 'An average shares the week\'s total between the days: start with the total, then the number of days.' : null; } }));
  sums.forEach((s, i) => { s.locked = i > 0 && !sums[i - 1].done; });
  const J = UI.ashJust && UI.ashJust.sheet === 'week:' + wk ? sums.find(s => s.id === UI.ashJust.sum) : null, act = J ? null : sums.find(s => !s.done) || null;
  if(J){ J.val = J.barWords === '' && !J.sumText ? undefined : J.answerText; /* the week added cell by cell: the bar keeps the whole formula, the total is in B9 */ J.doneLine = J.how === 'formula' ? J.doneLine : J.shown || rbState(store, J.id.split(':').pop()).ashown ? `Finance has filled this one in: ${esc(J.answerText)}. Copy it into your book beside Sum ${J.no}.` : `${J.doneLine} · Sum ${J.no} in your record`; }
  const last = sums[sums.length - 1];
  return { id:'week:' + wk, crumb:'', title:'The week, day by day', tabs:null, small:true, tight:true, lw:220, cols:[{ c:'B', w:170, top:fmtRange(W.from, W.from + 6), main:'Profit' }], rows, v, sums, act, just:J, tv:TV,
    doneF:!act && !J ? { tgt:last.tgt, refs:last.refs, ops:last.ops, words:last.words } : null, doneLine:`<span class="pos">✓</span> Week ${wk}'s accounts are signed off.` };   // no answer in this narrow bar: it is in the cell
}
function ashReviewRender(st){
  const W = S.wk || { from:S.day - 6, rows:[], projected:0 }, h = weekSummary(W), items = weekReviewItems(W, h), wk = weekNo(W.from);
  items.forEach(it => { it.title = RV2_TITLE[it.id] || it.title; });
  const sp = ashReviewSpec(W, items), allOk = items.every(it => rbState(W, it.id).ok);
  if(allOk && !W.logged){ W.logged = true; rbSkill('weekTotal'); rbSkill('projectedVsActual'); if(items.some(x => x.id === 'mean')) rbSkill('meanDay');
    const lv = id => ashSum(id).how === 'formula' ? 'Formula' : 'Build, then the sum';
    rbLog([`Week total (${lv('week.total')})`, 'Projected − actual (Build, then the sum)'].concat(items.some(x => x.id === 'mean') ? [`Average a day (${lv('week.average')})`] : [])); const mean = items.find(x => x.id === 'mean'); if(mean){ (S.means = S.means || {})[wk] = rbValue(mean); } }
  if(allOk && !sp.just) ashKeep('week', sp, wk);
  if(!W.missed && WBS().missedProfitLine !== false){ W.missed = missedProfitLine(h.profit, 7, W.from); }
  if(!W.neglect) W.neglect = neglectUpdate(W.from, W.from + 6);
  const dayLines = (W.rows || []).filter(r => (r.ev && r.ev.length) || r.dc).map(r => `<li><b>${esc(rbShort(r.d))}</b> ${(r.ev || []).map(n => `<span>${esc(rv2DayLine(n))}</span>`).join(' ')}${r.dc ? ` <span class="dc ${r.dc.delta < 0 ? 'dn' : ''}">${esc(r.dc.line)} ${r.dc.delta < 0 ? '−' : '+'}${money(Math.abs(r.dc.delta))}</span>` : ''}</li>`).join('');
  const NG = typeof h21Unflown === 'function' ? h21Unflown(W.neglect || []) : { rest:W.neglect || [], chance:'' };
  const neg = (NG.rest.length ? `<div class="wk-neglect rv2-neg">${rv2Neglect(NG.rest)}</div>` : '') + NG.chance;
  const what = `<div class="rv2-col rv2-what"><p class="bv-eyebrow rv2-ch">What happened</p>${rv2SeatHtml(h)}${dayLines ? `<section class="bv-panel support rv2-days"><div class="rv2-ph"><h2>Each day</h2></div><ul>${dayLines}</ul></section>` : ''}${surprisesLine(W.from, W.from + 6)}${fuelAdvantageLine(wk)}${neg}${rv2RoutesHtml(h)}</div>`;
  // the last sum's answer stays on the sheet's line; the right-hand panel signs the accounts off at once, with the missed-profit line
  const Mi = W.missed, miss = Mi ? `<div class="wk-missed ${Mi.missed > 0 ? 'warn' : 'ok'}"><span class="kl">What the best plan would have earned</span><div class="wm-row"><span>Your plan <b class="mono">${money(Mi.yours)}</b></span><span>Best plan with your planes <b class="mono">${money(Mi.best)}</b></span><span>Missed <b class="mono ${Mi.missed > 0 ? 'orange' : 'green'}">${money(Mi.missed)}</b></span></div><p class="small muted">Best plan: ${esc(Mi.bestPlan)} · about ${money(Mi.bestDay)} a day. No cash is taken.</p></div>` : '';
  const a = allOk ? null : sp.act || sp.just, card = a ? (typeof h21RvCard === 'function' ? h21RvCard(a, sp) : '') || `<section class="bv-panel active ash-rvc" data-rbcard="${a.id.split(':').pop()}"><span class="bv-sumtag">Sum ${a.no}</span><p class="ash-rvr">${esc(a.rule)}</p></section>`
    : `<div class="rv-signed rv2-signed">${ICO2.check}<span>Accounts signed off. The formulas stay on the sheet.</span></div>${miss}`;
  const body = `<div class="bv rv2 rbw ash-rv">${what}<div class="rv2-col rv2-mid">${ashHtml(sp)}</div><div class="rv2-col rv2-ins">${card}</div></div>`;
  const btn = allOk ? `<button class="bv-btn go big" id="nx">On to next week &#9654;</button>` : `<button class="bv-btn primary big" id="ashNext" ${sp.just ? '' : 'disabled'}>Next sum &#9654;</button>`;
  screen().innerHTML = shell(deskPage({ title:`How did week ${wk} go?`, sub:`Passengers ${num(h.pax)} of ${num(h.seats)} seats · cash ${money(Math.round(S.cash))}`, cls:'rbw-page rv-page rv2-page ash-rvp', body }),
    deskBar(allOk ? 'Signed off. On to next week.' : sp.sums.some(x => x.how === 'formula') && typeof h21Text === 'function' ? h21Text('review.footer').text.join(' ') : 'Click the cells for each sum, work it out in your book, then type the answer in the cell and press Enter.', btn));
  ashBind(sp); on('ashNext', ashNextSum); if(typeof h21RvBind === 'function') h21RvBind(sp);
  on('nx', () => { if(!items.every(it => rbState(W, it.id).ok)) return; UI.ashJust = null; resetEntry(); UI.justDone = null; S.rnd.applied = true; closeDay(); });
}
const ashRv0 = renderWeekReviewBuild;
renderWeekReviewBuild = function(st){ return ashOn() && rv2On() ? ashReviewRender(st) : ashRv0(st); };
