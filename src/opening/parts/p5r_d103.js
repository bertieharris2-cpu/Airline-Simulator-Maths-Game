/* =====================================================================
   D103 (Bertie, 18 Oct 2026; Claude Design handover, section 5; Fable's Briefing 13): three game rules, read from the
   workbook's Settings (pupilReserve, bustRule, standingAim). Year one only (CLAUDE.md); chapter 3's overdraft is unchanged.
   1 The reserve is the pupil's. The fixed £1,000 (cashReserve) gives way to the line the pupil sets: £0 until one is set, first in
     Briefing 13, then on the Fuel desk and the Finance desk. The Fuel desk buys with the cash above it; the shop says what a
     purchase leaves above it; the Ready check no longer stops a plan for it. The board nudges (once a week) only when the pupil has
     kept nothing back and the tank runs dry.
   2 Going bust. No loans in year one: the bank's free top-up goes, so cash can fall below £0. A day whose fuel can't be paid
     for (the tank is dry, and cash and the day's takings won't buy the emergency fuel) keeps every plane on the ground; the
     day's fixed costs still run. Three such days in one week close the airline: a short closing screen, then a new start
     from Launch Day with the same name, code, logo and livery.
   3 The standing aim. The rules card that ends Briefing 13 stays on Home, under Coming up, until the airline-type choice in
     January; then it shows that type.
   ===================================================================== */
const d103y1 = day => typeof yearOne === 'function' && yearOne(day);
const resOn = () => WBS().pupilReserve !== undefined && !!S && d103y1() && !odDay();
function myReserve(){ const r = S && S.myRes; return r && r.v > 0 ? Math.round(r.v) : 0; }
function setMyReserve(v, via){
  const r = S.myRes || (S.myRes = {}); r.v = Math.max(0, Math.min(1e7, Math.round(+v || 0))); r.day = S.day || 1; r.via = via || 'desk';
  (r.log = r.log || []).push([r.day, r.v, r.via]); if(r.log.length > 30) r.log.shift();
  try{ rec().pend.events.push({ day:S.day, title:'Cash reserve', choice:`keep ${money(r.v)} for emergencies (${r.via === 'briefing' ? 'Briefing 13' : r.via})`, cost:0 }); }catch(e){}
}
/* ---------- 1 · the reserve: the floor every purchase reads, and its words ---------- */
const cashFloor103 = cashFloor;
cashFloor = function(){ if(resOn()) return myReserve(); return cashFloor103.apply(this, arguments); };
const reserveState103 = reserveState;
reserveState = function(){ const r = reserveState103.apply(this, arguments); if(resOn()) r.block = false; return r; };   // the plan always flies; the board nudges instead
const reserveWords103 = reserveWords, odBlockWhy103 = odBlockWhy;
reserveWords = function(){ if(!resOn()) return reserveWords103.apply(this, arguments); const v = myReserve();
  return v ? `You keep ${money(v)} back for emergencies: your reserve.` : 'You decide how much to keep back for emergencies (the Fuel desk or the Finance desk).'; };
odBlockWhy = function(after){ if(!resOn()) return odBlockWhy103.apply(this, arguments); return `It would leave less than your ${money(myReserve())} reserve`; };
/* the reserve in a sentence: "your £3,000 reserve" in year one (nothing said while it is £0), "the £1,000 reserve" later */
const resThe = v => resOn() ? `your ${money(v)} reserve` : `the ${money(v)} reserve`;
function resAbove(v){ return resOn() && !v ? '' : `, above ${resThe(v)}`; }
function resPlus(v){ return resOn() && !v ? '' : ` + ${resThe(v)}`; }
function resTag(v){ return resOn() ? (v ? ` · your reserve ${money(v)}` : '') : ` · emergency reserve ${money(v)}`; }
function resCashWord(cap){ const w = resOn() ? (myReserve() ? 'cash above your reserve' : 'your cash') : 'cash above the reserve'; return cap ? w[0].toUpperCase() + w.slice(1) : w; }
function resKeepWords(v){ return resOn() ? (myReserve() ? `Keep ${money(myReserve())} back for emergencies: your reserve.` : 'You decide how much to keep back for emergencies.') : `Keep ${money(v)} back for emergencies.`; }
/* Launch Day's starting position: the reserve is the pupil's to set (in week 2), not a fixed £1,000 */
function resLaunchWords(v){ return resOn() ? '. How much to keep back for emergencies will be up to you.' : `, with ${money(v)} always kept back for emergencies.`; }

/* the control: "Cash £12,409 · keeping £3,000 · Change", and its stepper */
const RS_STEP = 500;
function rsHtml(where){
  const v = myReserve(), ed = UI.rsEdit === where, cash = Math.round(S.cash);
  if(!ed) return `<div class="rs" data-rsw="${where}"><span class="rs-k">Cash</span><b class="rs-c">${money(cash)}</b><span class="rs-d">·</span><span class="rs-v">keeping <b>${money(v)}</b></span><button class="rs-a" data-rs="edit">Change ›</button></div>`;
  return `<div class="rs on" data-rsw="${where}"><span class="rs-k">Keep back for emergencies</span><button class="rs-st" data-rs="-" ${v <= 0 ? 'disabled' : ''} aria-label="Keep ${money(RS_STEP)} less">−</button><b class="rs-n" aria-live="polite">${money(v)}</b><button class="rs-st" data-rs="+" aria-label="Keep ${money(RS_STEP)} more">+</button><button class="bv-btn rs-ok" data-rs="done">Done</button>
    <small>${where === 'fuel' ? 'Fuel orders use the cash above it.' : 'The Fuel desk and the shop work with the cash above it.'}</small></div>`;
}
function rsBind(root){
  root.querySelectorAll('[data-rs]').forEach(b => b.onclick = () => { const k = b.getAttribute('data-rs'), w = b.closest('[data-rsw]').getAttribute('data-rsw');
    if(k === 'edit') UI.rsEdit = w; else if(k === 'done') UI.rsEdit = null;
    else { setMyReserve(myReserve() + (k === '+' ? RS_STEP : -RS_STEP), w); if(UI.fd) UI.fd.selNow = Math.min(UI.fd.selNow || 0, fdMaxBlocks(fuelOn(S.day || 1))); }
    save(); render(); const again = screen().querySelector(`[data-rsw="${w}"] [data-rs="${k === 'edit' ? '+' : k === 'done' ? 'edit' : k}"]`); if(again) again.focus(); });
}
/* the Fuel desk (year one): the line on the order panel */
const fd103Html0 = fuelDeskHtml;
fuelDeskHtml = function(asView){
  const h = fd103Html0.apply(this, arguments); if(!resOn() || !(typeof fd2On === 'function' && fd2On())) return h;
  const T = document.createElement('template'); T.innerHTML = h; const ob = T.content.querySelector('.fd-ord .fd-ob'); if(!ob) return h;
  ob.insertAdjacentHTML('afterbegin', rsHtml('fuel')); return T.innerHTML;
};
const fd103Render0 = renderFuelDesk;
renderFuelDesk = function(){ const r = fd103Render0.apply(this, arguments); if(resOn()) rsBind(screen()); return r; };
/* the Finance desk (year one): its own panel at the top */
const rv103 = renderView;
renderView = function(v){
  const r = rv103.apply(this, arguments); if(v !== 'finance' || !resOn()) return r;
  const host = screen().querySelector('.vw'); if(!host || host.querySelector('.rs-pnl')) return r;
  host.insertAdjacentHTML('afterbegin', `<section class="bv-panel rs-pnl"><span class="bv-eyebrow">Your reserve</span><p>Cash you keep back for emergencies. You decide how much; there's no right amount.</p>${rsHtml('finance')}</section>`);
  rsBind(host); return r;
};
/* the board's nudge: nothing kept back and the tank ran dry (or the planes were grounded); once a week */
function resNudge(day, why){
  if(!resOn() || myReserve() || QUIET) return; const r = S.myRes || (S.myRes = {}), w = weekNo(day || S.day || 1); if(r.nudged === w) return; r.nudged = w;
  const text = `From the board: ${why}, and nothing was kept back for emergencies. You decide how much cash to keep: set a reserve on the Fuel desk or the Finance desk.`;
  if(S.rnd && S.rnd.why && day === S.day) S.rnd.why.push({ ic:'🏛️', text }); addNews([{ tag:'BOARD', text, cls:'warn' }]);
}

/* ---------- 2 · going bust ---------- */
function bustDays(){ const v = WBS().bustRule; if(v === undefined || v === null || v === false) return 0; const m = /(\d+)/.exec(String(v)); return m ? Math.max(1, +m[1]) : 3; }
const bustOn = day => bustDays() > 0 && d103y1(day);
/* no loans in year one */
const bankCheck103 = bankCheck;
bankCheck = function(){ const d = typeof simDayNow === 'function' ? simDayNow() : (S && S.day); if(S && bustOn(d)) return; return bankCheck103.apply(this, arguments); };
/* below £0 (there is no loan to stop it): the header's cash in red, and why */
const utb103 = updateTopBar;
updateTopBar = function(){ utb103.apply(this, arguments); if(!S || S.phase === 'setup' || !bustOn() || odDay()) return; const b = $('cCash'); if(!b) return;
  const c = Math.round(S.cash), lab = b.previousElementSibling, want = c < 0 ? 'Below £0 · no loans' : 'Cash balance';   // (it runs every frame on the board: touch nothing that has not changed)
  if(b.classList.contains('red') !== c < 0) b.classList.toggle('red', c < 0); if(lab && lab.textContent !== want) lab.textContent = want; };
/* the day's fuel, decided once at the start of a day the engine runs (the board's day, a live day, a simulated day) */
let D103_RUN = null, D103_DAYS = {};
const d103Run = (fn, which) => function(){ const keep = D103_RUN, kd = D103_DAYS; D103_RUN = which === 'sim' ? 'sim' : (S && S.day); D103_DAYS = {};
  try{ return fn.apply(this, arguments); } finally { D103_RUN = keep; D103_DAYS = kd; } };
function d103Ground(fl){
  const d = typeof simDayNow === 'function' ? simDayNow() : S.day;
  if(D103_RUN === null || (D103_RUN !== 'sim' && d !== D103_RUN) || !bustOn(d) || !deskModeAt(d)) return fl;
  let x = D103_DAYS[d];
  if(!x){ const go = fl.filter(f => !f.grounded && !f.cancelled), need = go.reduce((t, f) => t + (f.fuelL || 0), 0), short = Math.max(0, need - (S.fuel || 0));
    const ppl = r2(fuelOn(d) + (WORLD.fuelTopUp !== undefined ? WORLD.fuelTopUp : 0.1)), bill = short > 1e-9 ? r2(Math.ceil(short - 1e-9) * ppl) : 0;
    let takings = go.reduce((t, f) => t + (f.revenue || 0), 0); try{ takings += dayExtras(go).obRev || 0; }catch(e){}
    x = D103_DAYS[d] = { day:d, ground:bill > 0 && (S.cash || 0) + takings < bill, need, short:Math.ceil(short), bill, takings:Math.round(takings) }; }
  if(!x.ground) return fl;
  fl.forEach(f => { if(f.grounded || f.cancelled) return; Object.assign(f, { demand:0, sold:0, revenue:0, grounded:true, fuelGround:true, fuelL:0, runCost:0, fuelCost:0, termCost:0,
    reasons:['Grounded: the tank was dry and there was no cash to buy fuel.'] }); });
  if(!QUIET && !x.rec){ x.rec = true; bustGrounded(x); }
  return fl;
}
const pf103 = planFlights;
planFlights = function(){ const fl = pf103.apply(this, arguments); return D103_RUN !== null ? d103Ground(fl) : fl; };
runDayQuick = d103Run(runDayQuick); startFlight = d103Run(startFlight); simulateDays = d103Run(simulateDays, 'sim');
/* a grounded day: its note, the week's count, and the closing on the third */
function bustGrounded(x){
  const B = S.bust || (S.bust = { g:[] }); if(!B.g.includes(x.day)) B.g.push(x.day);
  const why = `${dateShort(x.day)}: grounded. The tank was dry and needed ${num(x.short)} L (${money(x.bill)} at the day's price + ${Math.round(100 * (WORLD.fuelTopUp || 0.1))}p); cash was ${money(Math.round(S.cash))} and the day's takings ${money(x.takings)}. The day's costs still ran.`;
  if(S.rnd && S.rnd.why && x.day === S.day) S.rnd.why.push({ ic:'⛽', text:why }); addNews([{ tag:'FUEL', text:why, cls:'warn' }]);
  try{ rec().pend.events.push({ day:x.day, title:'Grounded: no fuel', choice:`the tank was dry and cash couldn't buy ${num(x.short)} L`, cost:0 }); }catch(e){}
  resNudge(x.day, 'the planes were grounded');
  const wk = weekNo(x.day), inWeek = B.g.filter(d => weekNo(d) === wk);
  if(inWeek.length >= bustDays() && !B.closed){ B.closed = { day:x.day, week:wk, days:inWeek.slice().sort((a, b) => a - b), cash:Math.round(S.cash) };
    try{ rec().pend.events.push({ day:x.day, title:'The airline closed', choice:`${inWeek.length} grounded days in week ${wk}; no loans`, cost:0 }); }catch(e){} }
}
/* the board's day: the nudge when the tank ran dry with nothing kept back */
const rdq103 = runDayQuick;
runDayQuick = function(){ const d = S.day, w = fuelWeek(d), em0 = w.emL || 0; const r = rdq103.apply(this, arguments); if(((fuelWeek(d).emL || 0) > em0) && !(S.bust && S.bust.g.includes(d))) resNudge(d, 'the tank ran dry'); return r; };
const sd103 = simulateDays;
simulateDays = function(){ const out = sd103.apply(this, arguments); if(out && out.autoL > 0 && !QUIET) resNudge(out.to, 'the tank ran dry'); return out; };
/* the closing screen, then Launch Day again with the same airline */
function bustHtml(){
  const c = S.bust.closed, n = c.days.length, words = ['no', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'][n] || num(n);
  return `<div class="bust" role="alertdialog" aria-labelledby="bustT"><section class="bv-panel bust-card"><span class="bv-eyebrow bust-eb">Airline closed · ${esc(dateShort(c.day))}</span>
    <h1 id="bustT">${esc(S.airline.name || 'Your airline')} has closed.</h1>
    <p>${words} days in week ${c.week} the planes stayed on the ground: the tank was dry, and the cash and the day's takings couldn't buy the fuel.</p>
    <ul class="bust-days">${c.days.map(d => `<li>${esc(dateShort(d))}</li>`).join('')}</ul>
    <p>There are no loans. You start again from Launch Day, with the same name, code and colours.</p>
    <div class="bust-act"><button class="bv-btn primary" id="bustGo">Start again from Launch Day &#9654;</button></div></section></div>`;
}
function bustRestart(){
  const old = S, c = old.bust.closed, f0 = old.fleet[0] ? JSON.parse(JSON.stringify(old.fleet[0])) : null;
  try{ recordRun(); }catch(e){}
  S = newState(); S.airline = JSON.parse(JSON.stringify(old.airline));
  if(old.brief) S.brief = { seen:Object.assign({}, old.brief.seen || {}), data:old.brief.data || {} };
  if(old.myRes) S.myRes = { v:old.myRes.v || 0, day:1, via:'kept from before', log:(old.myRes.log || []).slice(-10) };
  if(old.fd2Tour) S.fd2Tour = { done:1 };
  S.restarts = (old.restarts || []).concat([{ closed:c.day, date:dateShort(c.day), days:c.days, week:c.week, cash:Math.round(old.cash), fleet:old.fleet.map(f => planeById(f.planeId).name), on:new Date().toISOString().slice(0, 10) }]);
  // the same first plane, painted as the pupil painted it; the airline's own steps are done, so Launch Day starts at the chapter page
  buyPlane(planeById('dhc6')); const f = S.fleet[0];
  if(f && f0){ ['livery', 'registration', 'name'].forEach(k => { if(f0[k] !== undefined) f[k] = f0[k]; }); }
  const i = S.steps.findIndex(x => x.t === 'chapter'); S.si = i >= 0 ? i : Math.max(1, S.steps.findIndex(x => x.t === 'brief1'));
  try{ rec().pend.events.push({ day:1, title:'Started again', choice:`the airline closed on ${dateShort(c.day)} after ${c.days.length} grounded days; Launch Day again`, cost:0 }); }catch(e){}
  save(); render();
}
const bustRender0 = render;
render = function(){
  if(S && S.bust && S.bust.closed && !S.overlay){ document.body.classList.toggle('yr1', true); screen().innerHTML = bustHtml(); on('bustGo', bustRestart); setTimeout(() => { const b = document.getElementById('bustGo'); if(b) b.focus(); }, 40); return; }
  return bustRender0.apply(this, arguments);
};

/* ---------- 3 · the standing aim, on Home under Coming up ---------- */
const AIM_LINES = () => String(WBS().standingAim || '').split('|').map(x => x.trim()).filter(Boolean);
function aimHtml(){
  if(WBS().standingAim === undefined || !S || S.phase === 'setup' || !d103y1()) return '';
  const seen = S.brief && S.brief.seen && S.brief.seen.cash_to_fly, t = typeof airlineType === 'function' ? airlineType() : null;
  if(!seen && (S.day || 1) <= 14) return '';   // it arrives with Briefing 13 (or after week 2 for a save that missed it)
  const L = AIM_LINES(); if(!L.length) return '';
  const r = myReserve(), keep = r ? `Yours: ${money(r)}.` : 'Yours: £0 so far.';
  if(t && typeof ATYPE !== 'undefined' && ATYPE[t]){   // from the airline-type choice: that type, with the cash rules
    return `<section class="aim" aria-label="Your aim"><span class="bv-eyebrow">Your aim · ${esc(ATYPE[t].name)} airline</span><b>${esc(ATYPE[t].line)}</b><span>${esc(L[2] || '')} ${esc(keep)}</span><span>${esc(L.slice(3).join(' '))}</span></section>`;
  }
  return `<section class="aim" aria-label="Your aim this year"><span class="bv-eyebrow">Your aim this year</span><b>${esc(L[0])}</b><span>${esc(L[1] || '')}</span><span>${esc(L[2] || '')} ${esc(keep)}</span><span>${esc(L.slice(3).join(' '))}</span></section>`;
}
const aimRender0 = render;
render = function(){ const r = aimRender0.apply(this, arguments); try{
    const st = step(); if(st && st.t === 'hq' && !S.overlay && !UI.view && !document.querySelector('.aim')){ const h = aimHtml(), cu = screen().querySelector('.cu'), k = screen().querySelector('.kpis');
      if(h && cu) cu.insertAdjacentHTML('afterend', h); else if(h && k) k.insertAdjacentHTML('afterbegin', h); }
  }catch(e){} return r; };
