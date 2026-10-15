/* ==================================================================
   FUEL STORAGE GROWS WITH THE FLEET (Workbook v5.8, D89; Fable's note "Fuel storage that grows with the fleet", 15 Oct)
   - Capacity: 8,000 L in week 2 (tankCapacity). From week 3, once a beat (at its start, or when the Fuel desk opens: the
     Monday plan, or each month's plan) the tank becomes max(what it holds, tankWeeksOfFuel × the standing plan's litres for the next seven days,
     rounded up to ten blocks). It never shrinks. tankUpgradeDay / tankCapacityUpgraded are withdrawn: no "storage upgrade".
   - The block (fuelLotSchedule): 1,000 L; 10,000 L from 6 Jan 2031; 100,000 L from 1 Sep 2031. The Monday order sum stays
     blocks × the price of a block, and the desk shows the price of a block ("£21,700 per 10,000 L").
   - The fuel farm (the Finance sheet's fuelFarm row, read by the importer into WB.fuelFarm): from 1 Sep 2031 the Fuel desk
     offers 1,500,000 L for £2m (buy only); from 6 Sep 2032 a second stage, 3,000,000 L in all for £3m more. Once bought,
     capacity = max(farm, the fleet rule). "Is it worth it?": litres × a shock's rise, against the price; a Build the first time.
   Reassignment only (overrides.txt stays as it is).
   ================================================================== */
const FS_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const fsWeeksWord = w => w < 0.75 ? 'less than a week' : (n => `about ${n <= 10 ? FS_WORDS[n] : num(n)} week${n === 1 ? '' : 's'}`)(Math.round(w));
const fsFarmData = () => (typeof WB !== 'undefined' && WB && WB.fuelFarm) || null;
/* the block size on a day, from the schedule (the first size has no start date) */
function fsBlockAt(day){ const sch = WBS().fuelLotSchedule; if(!sch || !sch.length) return WORLD.fuelBlock || 1000;
  let b = sch[0].size; sch.forEach(x => { if(!x.from || dayOfDate(x.from) <= day) b = x.size; }); return b; }
const fuelBlockFS0 = fuelBlock;
fuelBlock = function(){ if(!weekMode() || !S) return fuelBlockFS0(); return fsBlockAt(fuelDay()); };
/* the storage state: a save from before v5.8 keeps what its tank held (8,000 L, or 20,000 L from day 29) */
function fsS(){ if(S.fs) return S.fs; const d = typeof fuelDay === 'function' ? fuelDay() : (S.day || 1);
  return (S.fs = { cap:d >= 29 ? 20000 : (WORLD.tankBaseDesk || 8000), log:[], farm:null, built:false, worth:{} }); }
const tankCapacityFS0 = tankCapacity;
tankCapacity = function(){ if(!weekMode() || !S) return tankCapacityFS0(); const F = fsS(); return Math.max(F.cap, F.farm ? F.farm.litres : 0); };
tankUpgradeNotice = function(){};   // withdrawn: the tank grows with the fleet instead
/* the standing plan's litres for the next seven days (each day's flights, so days off count) */
function fsWeekLitres(day){ const pl = currentPlan(), d0 = day || S.day || 1;
  return Math.round(dryRun(() => { let t = 0; for(let d = d0; d < d0 + 7; d++) t += atDay(d, () => planLines(pl).fuelL || 0); return t; })); }
function fsTarget(week){ const unit = 10 * fuelBlock(); return Math.ceil((WBS().tankWeeksOfFuel || 3) * week / unit - 1e-9) * unit; }
function fsGrow(){
  if(!S || !weekMode() || (typeof QUIET !== 'undefined' && QUIET)) return; const day = S.day || 1; if(day <= deskFrom()) return;   // week 2 keeps 8,000 L
  const F = fsS(), key = S.round + ':' + day; if(F.at === key) return; F.at = key;   // once a beat
  const week = fsWeekLitres(day), want = fsTarget(week); if(want <= F.cap) return;
  const was = F.cap; F.cap = want; F.log.push({ day, from:was, to:want, week });
  if(want > (F.farm ? F.farm.litres : 0)) addNews([{ tag:'FUEL', text:`Storage: your tank now holds ${num(want)} L, ${fsWeeksWord(want / Math.max(1, week))} of flying.`, cls:'good' }]);
}
/* at the start of each beat, and when the Fuel desk opens (weeks 2–4 start their Monday plans by the older round code, not startBeat) */
const startBeatFS = startBeat;
startBeat = function(b){ startBeatFS(b); try{ fsGrow(); }catch(e){} };

/* ---------- the desk: the storage line, the price of a block, a Fill button ---------- */
function fsStorageWords(){ const cap = tankCapacity(), need = fdNeed(S.day || 1), week = need.perDay * 7, F = fsS();
  return { cap, farm:!!(F.farm && F.farm.litres >= cap), text:`${num(cap)} L${F.farm && F.farm.litres >= cap ? ' (fuel farm)' : ''}`, weeks:week > 0 ? fsWeeksWord(cap / week) + ' of flying' : '' }; }
const fdHtmlFS0 = fuelDeskHtml;
fuelDeskHtml = function(asView){
  if(weekMode()) try{ fsGrow(); }catch(e){}
  let h = fdHtmlFS0(asView); if(!weekMode()) return h;
  const W = fsStorageWords(), P0 = fuelOn(S.day || 1), blk = fuelBlock(), per = Math.round(blk * P0 * 100) / 100, max = fdMaxBlocks(P0);
  h = h.replace(/<div class="fd-r ?"><span>Storage capacity<\/span><b>[^<]*<\/b><\/div>/, `<div class="fd-r fs-cap"><span>Storage</span><b>${W.text}${W.weeks ? ` <small>— ${W.weeks}</small>` : ''}</b></div>`);
  h = h.replace(/<span class="sub">Market price today (<b class="gold">[^<]*<\/b>)/, `<span class="sub fs-sub">Today $1 · <b class="fs-pb">${money(per)} per ${num(blk)} L</b>`);
  h = h.replace(/<p class="fd-lim">Blocks of [\d,]+ L · /, `<p class="fd-lim">Blocks of ${num(blk)} L at ${money(per)} each · `);
  if(max > 4) h = h.replace('<span class="fd-more">', `<button class="fd-b fs-fill" data-fdfill="1" title="Buy as many blocks as the tank and the cash allow">Fill: ${num(max * blk)} L</button><span class="fd-more">`);
  const offer = fsFarmNext();
  if(offer) h = h.replace(/(<p class="fd-em">)/, `<p class="fs-farm-l">${ICO2.bulb}<span>A fuel farm is for sale: ${offer.stage === 2 ? `the second stage, ${num(offer.litres)} L in all` : `${num(offer.litres)} L`} for ${money(offer.price)}.</span><button class="dk-link" id="fsFarmOpen">Is it worth it?</button></p>$1`);
  if(UI.fsFarm && offer) h = h.replace('<div class="fd">', '<div class="fd">' + fsFarmDialog(offer));
  return h;
};
const fdBindFS0 = bindFuelDesk;
bindFuelDesk = function(asView){
  fdBindFS0(asView); if(!weekMode()) return;
  const root = screen();
  root.querySelectorAll('[data-fdfill]').forEach(b => b.onclick = () => { UI.fd.sel = fdMaxBlocks(fuelOn(S.day || 1)); UI.fd.signed = false; UI.fd.vals = {}; UI.fd.q = {}; UI.fd.msg = ''; UI.fd.done = '';
    if(typeof paperOn === 'function' && paperOn() && S.fo){ const F = foWeek(); if(F.signed && F.level !== 'model'){ F.signed = false; F.v = ''; F.msg = ''; F.tokens = []; } } render(); });
  on('fsFarmOpen', () => { UI.fsFarm = true; render(); });
  if(UI.fsFarm) fsFarmBind();
};
const renderFuelDeskFS0 = renderFuelDesk;
renderFuelDesk = function(asView){ renderFuelDeskFS0(asView); if(!weekMode()) return;
  const t = screen().querySelector('.actbar .ab-hint'), blk = num(fuelBlock()); if(t) t.innerHTML = t.innerHTML.replace(/1,000 L blocks/, `${blk} L blocks`); };

/* ---------- the fuel farm ---------- */
function fsFarmNext(){ const FF = fsFarmData(); if(!FF || !FF.litres || !S) return null; const day = S.day || 1, F = fsS(), stage = F.farm ? F.farm.stage : 0;
  if(stage === 0 && FF.from && day >= dayOfDate(FF.from)) return { stage:1, litres:FF.litres, extra:FF.litres, price:FF.price };
  if(stage === 1 && FF.stage2 && day >= dayOfDate(FF.stage2.from)) return { stage:2, litres:FF.stage2.litres, extra:FF.stage2.litres - F.farm.litres, price:FF.stage2.price };
  return null; }
/* a shock's rise: the forecast's expected rise when it forecasts one (mid-forecast 20p or more above today), otherwise a typical shock (fuelShockRise, 60p) */
function fsRise(){ const day = S.day || 1, P0 = fuelOn(day), m = fdMarket(day), lo = m.forecastLow, hi = m.forecastHigh;
  const mid = lo !== undefined && lo !== null && hi !== undefined && hi !== null ? Math.round((lo + hi) * 50) / 100 : null, fc = mid !== null ? Math.round((mid - P0) * 100) / 100 : 0;
  return fc >= 0.2 ? { rise:fc, why:"the forecast's expected rise" } : { rise:WBS().fuelShockRise || 0.6, why:'a typical price shock, like the October spikes' }; }
function fsWorth(o){ const R = fsRise(), save = Math.round(o.extra * R.rise), shocks = save > 0 ? o.price / save : null;
  const n = shocks === null ? 0 : Math.max(1, Math.round(shocks));
  return { litres:o.extra, rise:R.rise, why:R.why, save, price:o.price, shocks, words:shocks === null ? '' : `the farm pays for itself in ${shocks <= 1 ? 'one shock' : `about ${n <= 10 ? FS_WORDS[n] : num(n)} shock${n === 1 ? '' : 's'}`}` }; }
const fsPence = r => r < 1 ? `${Math.round(r * 100)}p` : money(r);
function fsAfford(o){ const res = WORLD.cashReserve || 0, have = Math.round(S.cash) - res, short = Math.max(0, o.price - have), rate = typeof weekProfitAvg === 'function' ? Math.round(weekProfitAvg()) : 0;
  return { ok:short <= 0, short, rate, weeks:short > 0 && rate > 0 ? Math.ceil(short / rate - 1e-9) : null }; }
function fsFarmDialog(o){
  const F = fsS(), w = fsWorth(o), A = fsAfford(o), T = F.worth[o.stage] || (F.worth[o.stage] = { tokens:[], tries:0, done:false, shown:false, msg:'' }), level = F.built ? 'model' : 'build';
  const W = fsStorageWords(), weekL = fdNeed(S.day || 1).perDay * 7;
  const intro = `<p>${o.stage === 2 ? `Your farm holds ${num(F.farm.litres)} L. The second stage makes it ${num(o.litres)} L: ${num(o.extra)} L more.` : `Your storage holds ${W.text}${W.weeks ? `, ${W.weeks}` : ''}. A farm holds ${num(o.litres)} L${weekL > 0 ? `, ${fsWeeksWord(o.litres / weekL)} of flying` : ''}.`} Fill it before a price shock and every litre in it was bought at the lower price.</p>`;
  const figs = fsFarmFigs(o, w), tok = k => OPS4.includes(k) ? `<i class="rb-op">${k}</i>` : (f => f ? `<span class="rb-tk">${esc(f.label)} <b>${f.text}</b></span>` : '')(figs.find(f => f.k === k));
  const answer = `<p class="mono fs-ans"><b>${num(w.litres)} × ${fsPence(w.rise)} = ${money(w.save)}</b> saved in one shock</p><p class="mono fs-ans">${money(w.price)} ÷ ${money(w.save)} = ${String(Math.round(w.shocks * 10) / 10)}: <b>${w.words}</b>.</p>`;
  const sum = T.done || level === 'model' ? `${answer}${T.shown ? FIN_STAMP : level === 'model' && !T.done ? '<span class="fx" title="The model worked this out">ƒ</span>' : cardStampHtml('ok')}`
    : `<p class="small">What does a full ${o.stage === 2 ? 'second stage' : 'farm'} save in one shock? Build it from the figures; the game works it out.</p>
      <div class="rb-bar">${T.tokens.length ? T.tokens.map(tok).join('') : '<span class="rb-ph">Tap a figure, the operation, then a figure</span>'}<span class="rb-eq">=</span><b class="rb-res">?</b></div>
      <div class="rb-chips">${figs.map(f => `<button class="rb-chip" data-fsfig="${f.k}">${esc(f.label)}<b>${f.text}</b></button>`).join('')}</div>
      <div class="rb-ops">${OPS4.map(x => `<button data-fsop="${x}">${x}</button>`).join('')}<button class="dk-link" id="fsUndo">Undo</button><span class="grow"></span><button class="btn primary" id="fsChk">Check ✓</button></div>
      <span class="sc-msg" role="status">${esc(T.msg || '')}</span>`;
  const can = (T.done || level === 'model') && A.ok;
  const afford = A.ok ? `<p class="good">Cash ${money(Math.round(S.cash))}: you can buy it now.</p>` : `<p class="bad">${money(A.short)} short.${A.weeks !== null ? ` <span class="mono">(${money(o.price)} − ${money(Math.max(0, Math.round(S.cash) - (WORLD.cashReserve || 0)))}) ÷ ${money(A.rate)} a week = ${weekWord(A.weeks)}</span> to wait <span class="fx" title="The model worked this out">ƒ</span>` : ''}</p>`;
  return `<div class="fd-learn fs-dlg" role="dialog" aria-label="The fuel farm"><h3>${o.stage === 2 ? 'The fuel farm, stage two' : 'A fuel farm'}: ${num(o.litres)} L for ${money(o.price)}</h3>${intro}
    <div class="fd-sign paper fs-sum">${sumHeadHtml('farm:' + o.stage, 'Is the fuel farm worth it?')}<div class="fd-sh"><b>Is it worth it?</b>${T.q ? cardStampHtml('q') : ''}</div><p class="small">A shock: ${fsPence(w.rise)} a litre, ${esc(w.why)}.</p>${sum}</div>
    ${afford}<div class="fs-btns"><button class="btn primary" id="fsBuy" ${can ? '' : 'disabled'}>${A.ok ? `Buy the ${o.stage === 2 ? 'second stage' : 'fuel farm'}: ${money(o.price)}` : `${money(A.short)} short`}</button><button class="btn" id="fsNot">Not now</button></div></div>`;
}
function fsFarmFigs(o, w){ return [{ k:'L', label:o.stage === 2 ? 'Extra litres' : 'Farm holds', text:num(w.litres) + ' L' }, { k:'R', label:"A shock's rise", text:fsPence(w.rise) + ' a litre' },
  { k:'P', label:'Farm price', text:money(o.price), dis:true }, { k:'T', label:"Today's price", text:priceL(fuelOn(S.day || 1)), dis:true }]; }
function fsFarmBind(){
  const o = fsFarmNext(); if(!o) return; const F = fsS(), T = F.worth[o.stage], w = fsWorth(o), key = 'farm:' + o.stage;
  const recE = () => recOpen(key, { type:'build', relKey:'fuelFarm', doc:'Is the fuel farm worth it?', ask:`What a full ${o.stage === 2 ? 'second stage' : 'farm'} saves in one shock.`, question:`${num(w.litres)} × ${fsPence(w.rise)}`,
    unit:'£', correct:w.save, correctText:money(w.save), ops:[w.litres, w.rise], op:'×', level:'Build' });
  const done = shown => { T.done = true; T.shown = !!shown; T.q = false; T.msg = ''; F.built = true; (S.handSumLog = S.handSumLog || []).push({ day:S.day, date:dateShort(S.day), tools:['Is the fuel farm worth it? (Build)'] }); save(); render(); };
  screen().querySelectorAll('[data-fsfig]').forEach(b => b.onclick = () => { if(T.tokens.length % 2 === 1){ T.msg = 'Put the operation between the figures.'; render(); return; } T.tokens.push(b.getAttribute('data-fsfig')); T.msg = ''; render(); });
  screen().querySelectorAll('[data-fsop]').forEach(b => b.onclick = () => { if(T.tokens.length % 2 === 0){ T.msg = 'Start with a figure.'; render(); return; } T.tokens.push(b.getAttribute('data-fsop')); T.msg = ''; render(); });
  on('fsUndo', () => { T.tokens.pop(); T.msg = ''; render(); });
  on('fsChk', () => { const K = T.tokens; if(K.length < 3){ T.msg = 'Tap a figure, the operation, then a figure.'; render(); return; }
    const figs = fsFarmFigs(o, w), bad = K.length === 3 && [K[0], K[2]].map(k => figs.find(f => f.k === k && f.dis)).find(Boolean);
    const msg = K.length !== 3 ? 'This needs just two figures and one operation.' : bad ? `${bad.label} is not part of what one shock saves: the litres in the farm and the rise on each litre.` : K[1] !== '×' ? 'Every litre in the farm saves the same rise: which operation repeats it for each litre?' : !(['L', 'R'].includes(K[0]) && ['L', 'R'].includes(K[2]) && K[0] !== K[2]) ? 'Use the litres and the rise a litre.' : '';
    const chips = K.map(k => OPS4.includes(k) ? { op:k } : (f => f ? { label:f.label, text:f.text, k } : { label:k })(figs.find(f => f.k === k))), e = recE();
    if(!msg){ recAttempt(e, { ok:true, chips, method:'choose the figures and the operation' }); done(false); return; }
    recAttempt(e, { ok:false, chips, msg, note:msg, method:'choose the figures and the operation' }); T.tries = (T.tries || 0) + 1;
    if(T.tries >= 2 && (typeof twoTriesOn !== 'function' || twoTriesOn())){ if(typeof paperRecShown === 'function') paperRecShown(key); done(true); return; }
    T.q = true; T.tokens = []; T.msg = `Query: ${msg} One more try.`; render(); });
  on('fsNot', () => { UI.fsFarm = false; render(); });
  on('fsBuy', () => { const A = fsAfford(o); if(!A.ok || !(T.done || F.built)) return;
    S.cash = r2(S.cash - o.price); F.farm = { stage:o.stage, litres:o.litres, day:S.day, paid:(F.farm ? F.farm.paid : 0) + o.price }; F.log.push({ day:S.day, farm:o.stage, to:o.litres, price:o.price });
    addNews([{ tag:'FUEL', text:`Fuel farm ${o.stage === 2 ? 'stage two ' : ''}bought for ${money(o.price)}: storage is now ${num(tankCapacity())} L.`, cls:'good' }]);
    UI.fsFarm = false; UI.fd.done = `Fuel farm bought: storage ${num(tankCapacity())} L.`; save(); render(); });
}
if(typeof REC_REL !== 'undefined') REC_REL.fuelFarm = 'is the fuel farm worth it? litres × the rise, against the price';

/* for the tests and the teacher: the storage, the block and the farm */
function fuelStoreReport(){ const F = fsS(), o = fsFarmNext(); return { cap:tankCapacity(), fleetCap:F.cap, block:fuelBlock(), farm:F.farm, offer:o, built:F.built, log:F.log.slice(-6), worth:o ? fsWorth(o) : null }; }
