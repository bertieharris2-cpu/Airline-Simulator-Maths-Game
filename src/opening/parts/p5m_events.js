/* =====================================================================
   EVENT CARDS (Claude Design batch 2, 18 Oct 2026: handover 3.1 Storm, Option B "the departures board", and 3.2 Red Kite,
   Option B "tap each row to see it"; DESIGN.md "Event cards"). Year one only (yearOne(), p5l): later chapters keep the
   earlier card.
   One centred column 900px:
   1 a scene band: the departures board seen through glass (rain and one lightning flash for a storm, mist for fog, ash
     for an ash cloud); the flight in question is the lit row, and its status flips when the choice is made;
   2 an eyebrow (amber DISRUPTION for weather, crew and technical trouble; cyan NEW INTELLIGENCE for market news), the
     title at 30px and one context line;
   3 the model's numbers when the event has them (Red Kite: the profit cells start covered by "See profit"; the Choose
     buttons come when all have been seen);
   4 the choices as board keys; pressing one commits it (no Decide, no "Change your mind", no "What it costs" panel);
   5 after a second, the outcome as ONE ROW: RESULT, the headline and why line on the left; on the right the money (against
     today's total costs, or today's ticket money for a refund) and the reputation (five stars and the change).
   The footer then shows "Back to today's flying ▶". Figures come from the engine for the day.
   Tests: the choices keep data-o, the footer button #nx (disabled, and hidden, until a choice is made); Red Kite's
   covers are [data-seep].
   ===================================================================== */
const EV2_HOLD = 1000;   // ms from the press to the outcome plate
function ev2Kind(ev){ const s = `${ev.id || ''} ${ev.title || ''}`.toLowerCase(); return /storm|gale|thunder/.test(s) ? 'storm' : /fog/.test(s) ? 'fog' : /ash/.test(s) ? 'ash' : /snow|blizzard/.test(s) ? 'snow' : ''; }
function ev2Trouble(ev){ return !!ev2Kind(ev) || /crew|sick|captain|fault|technical|engine|strike/i.test(`${ev.id || ''} ${ev.title || ''} ${ev.text || ''}`); }
function ev2Asking(ev){ const s = `${ev.id || ''} ${ev.title || ''}`.toLowerCase(); return /storm/.test(s) ? "CAPTAIN'S CALL" : /crew|sick/.test(s) ? 'CREW CALL' : /fault|technical/.test(s) ? 'ENGINEERS' : /fog/.test(s) ? 'FOG · HOLDING' : /ash/.test(s) ? 'ASH CLOUD' : /blogger/.test(s) ? 'VIP ON BOARD' : 'YOUR CALL'; }
/* is the event about one flight (the lit row on the board)? */
function ev2AboutFlight(ev){ return (ev.options || []).some(o => (o.effects && (o.effects.status || o.effects.refund)) || (o.mech && (o.mech.ground || o.mech.late))) || /\b(flight|crew|captain|blogger|seat)\b/i.test(`${ev.title || ''} ${ev.text || ''}`); }
/* a choice's new status on the board, and its colour */
function ev2Status(opt){
  const e = opt.effects || {}, m = opt.mech || {};
  if(e.refund || e.status === 'CANCELLED' || /^cancel/i.test(opt.label || '')) return ['CANCELLED', 'soft'];
  if(e.status === 'DELAYED'){ const h = /(\d+)\s*hour/i.exec(opt.sub || ''); return [h ? `DELAYED ${h[1]} h` : /wait/i.test(opt.label || '') ? 'DELAYED · WAITING' : 'DELAYED', 'amber']; }
  if(m.ground) return [m.ground === 'morning' ? 'DELAYED · MORNING' : 'GROUNDED', 'amber'];
  if(m.late) return ['DELAYED', 'amber'];
  return ['ON TIME', 'green']; }
const ev2Clean = l => String(l || '').replace(/\s*\((?:£[\d,]+|free)\)\s*$/i, '');
const ev2Cost = o => o.effects && o.effects.cash < 0 ? -o.effects.cash : 0;
/* the headline and the why line from the workbook's why (its first sentence, without the stars: the reputation box shows them) */
function ev2Why(opt){ const w = String(opt.why || '').trim(), i = w.search(/[.!?](\s|$)/), head = (i < 0 ? w : w.slice(0, i + 1)).replace(/:\s*[−+-]?\s*[½\d]+\s*★?\s*(stars?)?\.?$/i, '.').replace(/\s*[−+-][½\d]+\s*(star|★)s?\.?$/i, '.'), rest = i < 0 ? '' : w.slice(i + 1).trim();
  return { head:head || ev2Clean(opt.label) + '.', why:rest.replace(/^[−+-]?[½\d]+\s*(stars?|★)\.?\s*/i, '').replace(/:\s*[−+-]?\s*[½\d]+\s*(stars?|★)\.?$/i, '.') }; }
const ev2Half = r => { const h = Math.round(r * 2), w = Math.floor(h / 2); return `${w || h % 2 === 0 ? w : ''}${h % 2 ? '½' : ''}`; };
const ev2StarsWord = r => `${ev2Half(r)} star${r === 1 ? '' : 's'}`;
function ev2StarsHtml(v){ return `<span class="ev2-stars" aria-label="${ev2StarsWord(v)} out of 5">★★★★★<i style="width:${(clamp(v, 0, 5) / 5 * 100).toFixed(1)}%">★★★★★</i></span>`; }
function ev2Change(n){ if(!n) return ['No change', 'no']; const h = Math.round(Math.abs(n) * 2), w = Math.floor(h / 2); return [`${n > 0 ? '+' : '−'}${w || ''}${h % 2 ? '½' : ''} star${h > 2 ? 's' : ''}`, n > 0 ? 'up' : 'dn']; }

/* ---------- the scene: the departures board through glass ---------- */
function ev2Rand(seed){ let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function ev2Rain(w, h, n, seed, len, cls, col){ const r = ev2Rand(seed); let o = `<g class="${cls}">`;
  for(let i = 0; i < n; i++){ const x = r() * (w + 80) - 20, y = r() * (h + 120) - 120; o += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - len * .33).toFixed(1)}" y2="${(y + len).toFixed(1)}" stroke="${col}" stroke-width="1.1" stroke-linecap="round"/>`; }
  return o + '</g>'; }
function ev2Weather(kind, w, h){
  if(kind === 'storm') return ev2Rain(w, h, 120, 11, 30, 'ev2-rain', 'rgba(190,220,255,.32)') + ev2Rain(w, h, 60, 23, 20, 'ev2-rain r2', 'rgba(190,220,255,.22)')
    + `<g fill="rgba(200,225,255,.18)"><ellipse cx="120" cy="40" rx="3" ry="4"/><ellipse cx="300" cy="200" rx="2.5" ry="3.5"/><ellipse cx="640" cy="70" rx="3" ry="4"/><ellipse cx="780" cy="180" rx="2.5" ry="3.5"/><ellipse cx="470" cy="120" rx="2" ry="3"/></g>`;
  if(kind === 'snow'){ const r = ev2Rand(5); let o = '<g class="ev2-snow" fill="rgba(234,242,255,.55)">'; for(let i = 0; i < 70; i++) o += `<circle cx="${(r() * w).toFixed(1)}" cy="${(r() * h - 40).toFixed(1)}" r="${(1 + r() * 1.6).toFixed(1)}"/>`; return o + '</g>'; }
  if(kind === 'ash'){ const r = ev2Rand(9); let o = '<g class="ev2-ash" fill="rgba(159,179,207,.45)">'; for(let i = 0; i < 90; i++) o += `<circle cx="${(r() * w).toFixed(1)}" cy="${(r() * h).toFixed(1)}" r="${(.8 + r() * 1.2).toFixed(1)}"/>`; return o + `</g><rect width="${w}" height="${h}" fill="rgba(111,134,168,.10)"/>`; }
  if(kind === 'fog') return `<g class="ev2-fog"><rect x="-120" y="30" width="${w + 240}" height="60" fill="rgba(196,212,234,.10)"/><rect x="-120" y="120" width="${w + 240}" height="80" fill="rgba(196,212,234,.13)"/><rect x="-120" y="190" width="${w + 240}" height="50" fill="rgba(196,212,234,.09)"/></g>`;
  return '';
}
/* the day's departures: the flight in question lit, the ones before it departed, the ones after on time */
function ev2BoardRows(ev, F){
  const fl = ((S.rnd && S.rnd.flights) || []).filter(f => f && f.route && routeById(f.route)).slice().sort((a, b) => a.dep - b.dep); if(!fl.length) return { rows:[], at:null };
  const i = F ? Math.max(0, fl.findIndex(f => f.key === F.key)) : -1, lo = i < 0 ? 0 : Math.max(0, Math.min(i - 1, fl.length - 3));
  return { rows:fl.slice(lo, lo + 3).map(f => ({ f, on:!!F && f.key === F.key, gone:!!F && f.dep < F.dep })), at:F ? Math.max(0, F.dep - 16) : fl[0].dep - 30 };
}
function ev2Scene(ev, st, F, decided){
  const kind = ev2Kind(ev), about = ev2AboutFlight(ev) && F, B = ev2BoardRows(ev, about ? F : null), w = 900, h = 250, ft = 'font-family="Segoe UI Variable Text, Segoe UI, system-ui, sans-serif"';
  const opt = decided ? ev.options[S.rnd.eventChoice] : null, [status, col] = opt ? ev2Status(opt) : [ev2Asking(ev), 'amber'];
  const C = { amber:'#ffb547', green:'#3ce394', soft:'#9fbde3', text:'#eaf2ff' }, flip = decided && st.at && Date.now() - st.at < 1500;
  const ys = [124, 166, 208];
  const rows = B.rows.map((x, k) => { const y = ys[k], f = x.f, r = routeById(f.route), lit = x.on;
    const s = lit ? status : x.gone ? 'DEPARTED' : (S.rnd.status && S.rnd.status[f.key]) || 'ON TIME', sc = lit ? C[col] : x.gone ? C.green : C.soft, tc = x.gone || lit ? C.text : C.soft;
    return `${lit ? `<rect x="50" y="${y - 28}" width="800" height="40" fill="${col === 'amber' ? 'rgba(255,181,71,.10)' : 'rgba(159,189,227,.06)'}"/>` : ''}<text x="62" y="${y}" fill="${tc}">${fmtTime(f.dep)}</text><text x="160" y="${y}" fill="${tc}">${esc(r.city.toUpperCase())}</text><text x="380" y="${y}" fill="${tc}">${esc(f.code || '')}</text><text class="${lit && flip ? 'ev2-wake' : ''}" x="520" y="${y}" fill="${sc}">${esc(s)}</text>`; }).join('');
  const notice = !about ? `<rect x="50" y="${B.rows.length ? 222 : 120}" width="800" height="0"/><text x="62" y="${B.rows.length ? 214 : 130}" ${ft} font-size="13" font-weight="700" letter-spacing="1.8" fill="${ev2Trouble(ev) ? C.amber : '#36c6ff'}">NOTICE · ${esc(String(ev.title || '').toUpperCase())}</text>` : '';
  const flash = kind === 'storm' && !st.flashed;
  return `<svg class="ev2-scene" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(`The departures board${kind ? ', ' + kind + ' on the glass' : ''}${about ? `; the ${fmtTime(F.dep)} to ${routeById(F.route).city}: ${status}` : ''}`)}">
    <defs><linearGradient id="ev2Gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a1c38"/><stop offset="1" stop-color="#030a18"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#ev2Gl)"/>${flash ? `<rect class="ev2-flash" width="${w}" height="${h}" fill="#cfe6ff"/>` : ''}
    <rect x="40" y="26" width="820" height="198" fill="#020812" stroke="rgba(65,122,171,.6)"/><line x1="40" y1="26.5" x2="860" y2="26.5" stroke="#9cc4f0" stroke-opacity=".5"/>
    <text x="62" y="54" ${ft} font-size="13" font-weight="700" letter-spacing="2.4" fill="#9fbde3">DEPARTURES</text><text x="838" y="54" text-anchor="end" ${ft} font-size="13" fill="#9fbde3">${esc(dateShort(S.day || 1))}${B.at !== null ? ' · ' + fmtTime(B.at) : ''}</text>
    ${B.rows.length ? `<g ${ft} font-size="11.5" font-weight="600" letter-spacing="1.4" fill="#6f86a8"><text x="62" y="80">TIME</text><text x="160" y="80">DESTINATION</text><text x="380" y="80">FLIGHT</text><text x="520" y="80">STATUS</text></g><line x1="56" y1="90" x2="844" y2="90" stroke="rgba(53,96,135,.5)"/>` : ''}
    <g ${ft} font-size="22" font-weight="600" class="ev2-tn">${rows}</g>${notice}
    ${ev2Weather(kind, w, h)}${!kind ? `<path d="M0,0 L170,0 L60,${h} L0,${h} Z" fill="#9fbde3" opacity=".04"/>` : ''}</svg>`;
}

/* ---------- the outcome: one row (headline and why; money; reputation) ---------- */
function ev2Money(ev, opt, before){
  const e = opt.effects || {}, m = opt.mech || {}, L = planLines(currentPlan()), cost = Math.round((L.v || {}).cost || 0), amt = ev2Cost(opt);
  if(e.refund || e.status === 'CANCELLED'){ const f = before.F, refund = Math.round(f ? (f.revenue || f.sold * (f.price || fareOf(f.route))) : 0), tk = Math.max(refund, Math.round(before.tickets || 0));
    return { label:'Tickets refunded', value:refund, gold:refund > 0, seg:tk ? refund / tk : 0, cap:`${money(refund)} of today's ticket money of ${money(tk)}` }; }
  if(amt){ const per = m.charge === 'weekly' ? ' a week' : m.charge === 'daily' ? ` a day for ${m.days || 1} days` : '';
    return { label:m.charge === 'weekly' ? 'Cost a week' : m.charge === 'daily' ? 'Cost a day' : m.fine ? 'Fine' : 'Cost today', value:amt, gold:true, seg:cost ? Math.min(1, amt / cost) : 0, cap:per ? `${money(amt)}${per} · today's costs are ${money(cost)}` : `${money(amt)} of today's costs of ${money(cost)}` }; }
  return { label:'Cost today', value:0, gold:false, seg:0, cap:`Nothing extra on today's costs of ${money(cost)}` }; }
function ev2Plate(ev, st, extraWhy){
  const opt = ev.options[S.rnd.eventChoice], W = ev2Why(opt), M = st.money || {}, n = (opt.effects || {}).rep || 0, [chg, cc] = ev2Change(n);
  const r0 = st.rep0 !== undefined ? st.rep0 : S.rep, r1 = st.rep1 !== undefined ? st.rep1 : S.rep, live = st.live !== undefined ? st.live : repLive(), from = typeof repFromDay === 'function' ? repFromDay() : null;
  const note = `${n ? 'Was' : 'Still'} ${ev2StarsWord(n ? r0 : r1)}${!live && from ? ` · public from ${monthName(from)}` : ''}`;
  return `<section class="ev2-out ${st.arrive ? 'arrive' : ''}" aria-live="polite"><div class="ev2-oh"><span class="bv-eyebrow ev2-res">Result</span><b>${esc(W.head)}</b><p>${esc(extraWhy || W.why)}</p></div>
    <div class="ev2-figs"><div class="ev2-tile"><span class="ev2-tl">${esc(M.label || 'Cost today')}</span><b class="ev2-tv ${M.gold ? 'gold' : ''}">${money(M.value || 0)}</b><span class="ev2-bar" aria-hidden="true"><i style="width:${(Math.min(1, M.seg || 0) * 100).toFixed(1)}%"></i></span><small>${esc(M.cap || '')}</small></div>
      <div class="ev2-tile"><span class="ev2-tl">Reputation</span><span class="ev2-sr">${ev2StarsHtml(r1)}<b class="ev2-chg ${cc}">${chg}</b></span><small>${esc(note)}</small></div></div></section>`; }
/* the press: commit the choice, keep what the plate needs (the money against the day, the stars before and after) */
function ev2Commit(st, i){
  const ev = S.rnd.event; if(!ev || S.rnd.eventChoice !== undefined || !ev.options[i]) return;
  const L0 = planLines(currentPlan()), F0 = ev2Flight(st), F = F0 ? Object.assign({}, F0) : null, tickets = Object.keys(L0.v || {}).filter(k => /^tk_/.test(k)).reduce((t, k) => t + (L0.v[k] || 0), 0);
  const live = repLive(), r0 = S.rep;
  S.rnd.pricesBefore = Object.assign({}, S.prices); applyEventNow(i); st.done = true; st.pick = i;
  const n = (ev.options[i].effects || {}).rep || 0;
  st.live = live; st.rep0 = r0; st.rep1 = live ? S.rep : clamp(Math.round((r0 + n) * 2) / 2, 1, 5);
  st.money = ev2Money(ev, ev.options[i], { F, tickets }); st.at = Date.now(); st.arrive = true;
  try{ save(); }catch(e){} render();
  setTimeout(() => { if(step() === st && step().t === 'event'){ render(); setTimeout(() => { st.arrive = false; }, 600); } }, reducedMotion() ? 0 : EV2_HOLD + 20);
}

/* ---------- Red Kite: the model (D50), each option's stayers and today's profit from the engine ---------- */
let EV2_MODEL = null;
function ev2Model(ev){
  const key = `${ev.id}|${S.day}|${S.si}`; if(EV2_MODEL && EV2_MODEL.key === key) return EV2_MODEL.m;
  let m = null; try{ m = ev2ModelCalc(ev); }catch(e){ console.error(e); } EV2_MODEL = { key, m }; return m; }
function ev2ModelCalc(ev){
  const rid = (ev.affectsRoutes || []).find(id => routeById(id)) || (() => { const o = ev.options.find(x => x.effects && x.effects.setPrice); return o ? Object.keys(o.effects.setPrice).find(id => routeById(id)) : null; })(); if(!rid) return null;
  const r = routeById(rid), rival = competitorPrice(r), cur = S.rnd.pricesBefore && S.rnd.pricesBefore[rid] !== undefined ? S.rnd.pricesBefore[rid] : fareOf(rid); if(rival === undefined || rival >= cur) return null;
  const pl0 = normPlan(currentPlan()), inPlan = pl0.fleet.some(x => x.sched.includes(rid)), other = otherRoute(), otherOpen = other && typeof routeOpen === 'function' && routeOpen(routeById(other));
  const tryOpt = (fare, ad) => { const pl = normPlan(JSON.parse(JSON.stringify(pl0))); pl.prices[rid] = fare; if(!inPlan) pl.fleet[0].sched = pl.fleet[0].sched.map(() => rid).concat(pl.fleet[0].sched.length ? [] : [rid, rid]);
    const keep = S.rivalAd; if(ad) S.rivalAd = { event:ev.id, routes:[rid], untilDay:S.day + ((ev.durationDays || 1) - 1) };
    try{ const L = planLines(pl); return { want:demandAt(r, fare), tenths:inTenths(stayShare(r, fare)), stay:paxWant(r, fare), tk:L.v['tk_' + rid] || 0, profit:L.v.profit - (ad ? (ev.advertiseCost || 0) : 0) }; } finally { S.rivalAd = keep; } };
  const rows = ev.options.map((o, i) => { const e = o.effects || {}, fare = e.setPrice && e.setPrice[rid] !== undefined ? (e.setPrice[rid] === 'match' ? rival : e.setPrice[rid]) : cur, ad = !!(ev.advertiseCost && e.cash && Math.abs(e.cash) === ev.advertiseCost); return Object.assign({ i, label:o.label, fare, ad }, tryOpt(fare, ad)); });
  let paris = null; if(otherOpen){ const pl = normPlan(JSON.parse(JSON.stringify(pl0))); pl.fleet[0].sched = (pl.fleet[0].sched.length ? pl.fleet[0].sched : [rid, rid]).map(() => other); const L = planLines(pl); paris = { city:routeById(other).city, profit:L.v.profit }; }
  return { rid, r, rival, cur, inPlan, rows, paris };
}
const EV2_KITE = `<svg class="ev2-kite" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" fill="#7a1428"/><path d="M8 19.5 L19 16 L21.5 6.5 L24 16 L33 13.5 L26.5 20 L29 21 L24.5 22.5 L23 33.5 L20.5 24 L13 26.5 L17 21.5 Z" fill="#f1e9dc"/></svg>`;
function ev2KiteBoard(ev, M){
  const fl = ((S.rnd && S.rnd.flights) || []).find(f => f.route === M.rid);
  return `<div class="ev2-kb" role="img" aria-label="${esc(`${M.r.city} today: ${S.airline.name || 'your airline'} ${money(M.cur)}; ${WORLD.rival || 'Red Kite Air'} ${money(M.rival)}, selling fast`)}"><div class="ev2-kbi"><span class="ev2-kbh">${esc(M.r.city.toUpperCase())} · TODAY</span>
    <span class="ev2-kr"><b>${esc((S.airline.name || 'Your airline').toUpperCase())}</b><b>${esc(fl && fl.code || '')}</b><b>${money(M.cur)}</b><span></span></span>
    <span class="ev2-kr"><b>${EV2_KITE}${esc(String(WORLD.rival || 'Red Kite Air').toUpperCase())}</b><b>RK204</b><b class="gold">${money(M.rival)}</b><span class="ev2-fast">SELLING FAST</span></span></div></div>`; }
function ev2KiteTable(ev, st, M, decided){
  const seen = st.seen || (st.seen = {}), lit = st.lit && Date.now() - st.lit.at < 1000 ? st.lit.k : null, all = M.rows.every(x => seen[x.i]) && (!M.paris || seen.p);
  if(decided){ const c = S.rnd.eventChoice;
    return `<section class="ev2-mt done"><table class="ev2-t"><tbody>${M.rows.map(x => `<tr class="${x.i === c ? 'pick' : 'rec'}"><th>${esc(x.label)}</th><td>${money(x.fare)}</td><td><b>${num(x.stay)}</b> <small>${esc(x.tenths)}</small></td><td class="gold">${money(x.profit)}</td></tr>`).join('')}</tbody></table></section>`; }
  const cell = (k, v) => seen[k] ? `<td class="ev2-p gold ${lit === k ? 'lit' : ''}">${money(v)}</td>` : `<td class="ev2-p"><button class="bv-btn small ev2-see" data-seep="${k}">See profit</button></td>`;
  const act = (x) => all ? `<td class="ev2-a"><button class="bv-btn primary small" data-o="${x.i}">Choose</button></td>` : '<td class="ev2-a"></td>';
  return `<section class="ev2-mt"><table class="ev2-t"><thead><tr><th>Choice</th><th>Your fare</th><th>Want to fly</th><th>Stay with you</th><th>Tickets</th><th>Profit today</th><th></th></tr></thead><tbody>
    ${M.rows.map(x => `<tr class="${lit === x.i ? 'lit' : ''}"><th>${esc(x.label)}</th><td>${money(x.fare)}</td><td>${num(x.want)}</td><td><b>${num(x.stay)}</b> <small>(${esc(x.tenths)})</small></td><td>${money(x.tk)}</td>${cell(x.i, x.profit)}${act(x)}</tr>`).join('')}
    ${M.paris ? `<tr class="alt ${lit === 'p' ? 'lit' : ''}"><th>Fly ${esc(M.paris.city)} instead</th><td colspan="4" class="ev2-note">${all ? 'the plan is set for the week' : 'change the plan on Monday'}</td>${cell('p', M.paris.profit)}<td class="ev2-a">${all ? `<button class="bv-link ev2-chp" id="ev2Paris" aria-expanded="${!!st.paris}">Change the plan ›</button>` : ''}</td></tr>` : ''}
    </tbody></table><p class="ev2-mnote">Next, you'll work out one of these by hand: your passengers × the tenths who stay.</p>
    ${st.paris && M.paris ? `<p class="ev2-pnote">The week's plan is set on Monday. To fly ${esc(M.paris.city)} instead of ${esc(M.r.city)}, change it in next Monday's plan; ${esc(WORLD.rival || 'Red Kite Air')}'s offer ends on Sunday. For today, choose one of the three.</p>` : ''}</section>`; }
/* the Red Kite outcome's why line, from the model */
function ev2KiteWhy(M){ const c = S.rnd.eventChoice, x = M.rows.find(y => y.i === c); if(!x) return '';
  const opt = S.rnd.event.options[c], e = opt.effects || {};
  if(e.setPrice) return `At ${money(x.fare)}, all ${num(x.stay)} who want to fly stay with you.`;
  if(x.ad) return `The switching was halved: ${num(x.stay)} of ${num(x.want)} stayed with you.`;
  return `At ${money(x.fare)}, ${num(x.stay)} of ${num(x.want)} stayed with you.`; }

/* ---------- the card ---------- */
function ev2Flight(st){ const fl = (S.rnd && S.rnd.flights) || []; if(st.fkey === undefined){ const F0 = featuredFlight(); st.fkey = F0 ? F0.key : null; } return fl.find(f => f.key === st.fkey) || null; }
function ev2Render(st){
  const ev = S.rnd.event, decided = S.rnd.eventChoice !== undefined, F = ev2Flight(st), kite = ev2Model(ev), trouble = !kite && ev2Trouble(ev), ch2 = !!ev.ch2, day = ev.day || S.day;
  const phase = !decided ? 'ask' : (st.at && Date.now() - st.at < (reducedMotion() ? 0 : EV2_HOLD)) ? 'chosen' : 'out';
  if(!decided) st.at = 0;
  const about = ev2AboutFlight(ev) && F, fr = about ? routeById(F.route) : null;
  let line = String(ev.text || ''); if(about && fr){ const t = `your ${fmtTime(F.dep)} to ${fr.city}`; line = /your plane/i.test(line) ? line.replace(/your plane/i, t) : line + (ev.options.some(o => o.effects && (o.effects.status || o.effects.refund)) ? ` The flight in question is the ${fmtTime(F.dep)} to ${fr.city}.` : ''); }
  if(ch2 && ev.window) line += ` ${fmtRange(ev.window.from, ev.window.to)}.`;
  const eye = kite || !trouble ? ['New intelligence', 'cyan'] : ['Disruption', 'amber'], when = (S.day || 1) <= 120 ? `Day ${S.day || 1}` : dateShort(day);
  const head = `<header class="ev2-h"><span class="bv-eyebrow ev2-eye ${eye[1]}">${eye[0]} · ${esc(when)}</span><h1 class="ev2-tt">${esc(ev.title)}${sayBtn(`${ev.title}. ${ev.text} ${ev.options.map((o, i) => `Option ${i + 1}: ${o.label}.`).join(' ')}`)}</h1><p class="ev2-ctx">${esc(line)}</p></header>`;
  let body = '';
  if(kite){ body = ev2KiteBoard(ev, kite) + ev2KiteTable(ev, st, kite, decided)
      + (phase === 'out' ? ev2Plate(ev, st, ev2KiteWhy(kite)) : decided ? '' : `<p class="ev2-ins">${kite.rows.every(x => (st.seen || {})[x.i]) && (!kite.paris || (st.seen || {}).p) ? '<b>Pressing Choose decides it.</b> There\'s no undo.' : '<b>See each choice\'s profit.</b> When you\'ve seen them all, you can choose.'}</p>`); }
  else { const keys = `<div class="ev2-keys" role="group" aria-label="Your choices">${ev.options.map((o, i) => { const c = ev2Cost(o), cls = decided ? (i === S.rnd.eventChoice ? 'pick' : 'rec') : '';
        return `<button class="ev2-key ${cls}" data-o="${i}" aria-pressed="${decided && i === S.rnd.eventChoice}" ${decided ? 'disabled' : ''}><b>${esc(ev2Clean(o.label).toUpperCase())}</b><span>${esc(o.sub || '')}${c ? ` · <em>${money(c)}</em>` : ''}</span></button>`; }).join('')}</div>`;
    body = ev2Scene(ev, st, F, decided) + (phase === 'out' ? ev2Plate(ev, st) : keys + `<p class="ev2-ins">${decided ? `Decided: <b>${esc(ev2Clean(ev.options[S.rnd.eventChoice].label))}</b>.` : '<b>Pressing a choice decides it.</b> There\'s no undo, so look before you press.'}</p>${ch2 && ev.base ? `<p class="ev2-share">Each choice is priced as a share of a day's profit: ${money(Math.round(ev.base))}, the last 7 days' average.</p>` : ''}`); }
  st.flashed = true;
  const seg = ch2 && st.day !== undefined ? S.steps.slice(S.si + 1).find(x => x.t === 'sim' && x.seg !== undefined) : null;
  const go = seg ? `Carry on: fly ${esc(fmtRange(seg.a, seg.b))}` : esc(goLabel("Back to today's flying"));
  screen().innerHTML = taskFrame({ question:'', work:false, wide:true, hint:decided ? 'Your choice is on the board and in this week\'s report.' : 'Something has happened that needs a decision before today\'s flying.',
    main:`<div class="bv ev2 ${kite ? 'kite' : ''} ph-${phase}">${head}${body}</div>`,
    foot:`<button class="bv-btn go big" id="nx" ${decided ? '' : 'disabled hidden'}>${go} &#9654;</button>` });
  const ws = screen().querySelector('.ws'); if(ws) ws.classList.add('ev2-ws');
  screen().querySelectorAll('[data-o]').forEach(b => b.onclick = () => ev2Commit(st, +b.getAttribute('data-o')));
  screen().querySelectorAll('[data-seep]').forEach(b => b.onclick = () => { const k = b.getAttribute('data-seep'), key = k === 'p' ? 'p' : +k; (st.seen = st.seen || {})[key] = true; st.lit = { k:key, at:Date.now() }; render(); setTimeout(() => { if(step() === st) render(); }, 1020); });
  on('ev2Paris', () => { st.paris = !st.paris; render(); });
  on('nx', () => { if(S.rnd.eventChoice === undefined) return; UI.justDone = null; advance(); });
}
const ev2R0 = R.event;
R.event = st => { const ev = S.rnd && S.rnd.event; if(!ev || !yearOne(ev.day || S.day) || ev.id === 'a380_offer') return ev2R0(st); if(ev.ch2 && typeof ch2Price === 'function') ch2Price(ev); return ev2Render(st); };
