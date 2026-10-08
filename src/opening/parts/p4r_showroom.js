
/* ==================================================================
   THE SHOWROOM (Change Request 5, week 2 onwards): the plane shop as an air show. One card per aircraft for sale: a real photo
   on the front (openly licensed, credited; the painted drawing in plain colours until a photo is recorded), tap to flip for the
   facts, four Top Trumps bars on the same scale for every card, Buy / Rent / Finance from the Finance sheet on the back.
   A "coming soon" row shows the aircraft not yet for sale as locked goals. After buying, the new plane is painted, named and
   rolled out (p4q_paint.js). The fleet screen shows every plane in its own livery, with a Repaint button; "Your airline" on the
   home menu edits the name, flight code and logo.
   ================================================================== */
function photoOf(a){ const f = a && a.photoFile; return f && PHOTOS[f] ? { src:PHOTOS[f], credit:[a.photoCredit, a.photoLicence].filter(Boolean).join(' · '), source:a.photoSource || '' } : null; }
function plainArt(p, art, cls){ const sil = PAL.some(c => c.id === 'silver') ? 'silver' : (PAL[10] || PAL[1] || {}).id, wh = PAL.some(c => c.id === 'white') ? 'white' : (PAL[0] || {}).id;
  return aircraftArt({ planeId:p.id, livery:{ body:wh, belly:sil, engine:sil, second:sil, stripe:'none', tail:'stripe' }, registration:'', name:'' }, { cls:cls || 'pic', art, name:'' }); }
function pictureHtml(a, art, cls){ const ph = photoOf(a); if(ph) return `<figure class="sc-photo"><img src="${ph.src}" alt="${esc(a.name)}"><figcaption class="sc-credit">${esc(ph.credit)}</figcaption></figure>`; return `<div class="sc-art">${plainArt(a, art, cls)}</div>`; }
/* the bars: every card on the same scale, the whole aircraft table's largest value is the full bar */
const STAT_KEYS = [['seats', 'Seats', p => p.seats, v => num(v)], ['speed', 'Speed', p => p.speed, v => num(v) + ' km/h'], ['range', 'Range', p => p.range, v => num(v) + ' km'], ['fuel', 'Fuel thirst', p => p.fuelUse, v => v + ' L/100 km']];
function statMax(){ const all = PLANES.filter(p => p.wb !== false); const m = {}; STAT_KEYS.forEach(([k, l, get]) => { m[k] = Math.max(1, ...all.map(get).filter(x => isFinite(x))); }); return m; }
function statBars(p){ const M = statMax(); return `<div class="sc-bars">${STAT_KEYS.map(([k, l, get, fmt]) => { const v = get(p), w = Math.max(3, Math.round(100 * v / M[k])); return `<div class="sb"><span class="sb-l">${l}</span><span class="sb-bar"><i style="width:${w}%"></i></span><b class="sb-v">${fmt(v)}</b></div>`; }).join('')}</div>`; }
function offerHtml(o){ const rows = [['Buy', money(o.price), o.canBuy], ['Rent', o.lease ? `${money(o.lease)} a day` : '—', o.canLease], ['Finance', o.deposit ? `${money(o.deposit)} down + ${money(o.pay)} a ${o.unit} × ${o.n}` : '—', o.canFinance]];
  return `<div class="as-offer">${rows.map(([l, v, ok]) => `<span class="${ok ? '' : 'off'}"><span>${l}</span><b class="mono">${v}</b></span>`).join('')}</div>`; }
function showCard(p, o, picked, owned, flipped, soonFrom){
  return `<button class="show-card ${picked ? 'on' : ''} ${owned ? 'owned' : ''} ${flipped ? 'flip' : ''}" data-pick="${p.id}" aria-pressed="${picked}" title="Tap to turn the card over"><div class="sc-inner">
    <div class="sc-front">${pictureHtml(p, null, 'pic')}<div class="sc-name"><b>${esc(p.name)}</b><span class="muted">${esc(p.tier || '')}${owned ? ` · you fly ${owned}` : ''}</span></div>${soonFrom ? `<div class="sc-price soon"><span>In the shop</span><b>from ${esc(soonFrom)}</b></div>` : `<div class="sc-price"><span>From</span><b class="mono">${money(o.lease && o.canLease ? o.lease : o.price)}</b><small>${o.lease && o.canLease ? 'a day to rent' : 'to buy'}</small></div>`}<span class="sc-turn">Tap for the facts ↻</span></div>
    <div class="sc-back"><div class="sc-name"><b>${esc(p.name)}</b></div><div class="sc-facts"><span>Seats <b>${p.seats}</b></span><span>Speed <b>${num(p.speed)} km/h</b></span><span>Range <b>${num(p.range)} km</b></span><span>Fuel <b>${p.fuelUse} L</b> per 100 km</span><span>Flying cost <b>${money(p.hourCost)}</b> an hour</span><span>Day cost <b>${money(p.dayCost)}</b></span></div>
      <p class="sc-id">${esc(p.fact || '')}</p>${statBars(p)}${offerHtml(o)}<span class="sc-turn">Tap to turn back ↻</span></div></div></button>`;
}
/* the locked row: live aircraft not yet in the shop, then the aircraft the workbook only names (no figures are read) */
function comingSoon(){ const day = S.day, live = PLANES.filter(p => p.wb !== false && (p.shopFromDay || 1) > day && (p.status === undefined || p.status === 'live')).map(p => ({ id:p.id, name:p.name, tier:p.tier, shopFromDay:p.shopFromDay, photoFile:p.photoFile, photoCredit:p.photoCredit, photoLicence:p.photoLicence, photoSource:p.photoSource, live:true }));
  const later = ((WB && WB.aircraftPreview) || []).filter(a => !PLANES.some(p => p.id === a.id)).map(a => Object.assign({ live:false }, a));
  return live.concat(later).sort((a, b) => (a.shopFromDay || 9999) - (b.shopFromDay || 9999)); }
function fromWhen(day){ return day ? dateShort(day) + (calDate(day).getUTCFullYear() !== calDate(S.day).getUTCFullYear() ? ' ' + calDate(day).getUTCFullYear() : '') : 'later'; }
function soonCard(a){ const when = fromWhen(a.shopFromDay);
  return `<div class="soon-card" title="${esc(a.name)}: arrives ${esc(when)}">${pictureHtml(a, a.live ? null : 'narrowbody', 'pic')}<div class="soon-lock">${ICON.lock}</div><b>${esc(a.name)}</b><small>${a.shopFromDay ? 'From ' + esc(when) : 'Later in the game'}</small></div>`; }
R.shop2 = st => {
  const list = shopPlanes(), picked = S.rnd.shopPick || null, owned = id => S.fleet.filter(f => f.planeId === id).length, flips = UI.flip || (UI.flip = {});
  const opening = routesOpening(S.day), newR = opening.length ? `<p class="small muted">New route${opening.length > 1 ? 's' : ''} today: ${opening.map(r => `${r.city} (${num(routeKm(r))} km)`).join(', ')}.</p>` : '', soon = comingSoon();
  screen().innerHTML = taskFrame({ question:'The air show: aircraft for sale', work:false,
    story:['Every aircraft here is for sale, for rent by the day, or on finance. Tap a card to turn it over: the facts, the bars and the price are on the back.'],
    say:`The air show. ${list.map(p => `${p.name}: ${p.seats} seats, ${money(shopOffer(p).price)} to buy${shopOffer(p).lease ? `, or ${money(shopOffer(p).lease)} a day to rent` : ''}.`).join(' ')}`,
    context:{ title:'Your airline', html: cxSec('Cash', `<p class="cx-plan mono">${money(Math.round(S.cash))}</p><p class="small muted">Keep ${money(WORLD.cashReserve || 0)} back for emergencies.</p>`) + cxSec('Fleet', S.fleet.map(f => `<p class="small">${esc(planeById(f.planeId).name)} <span class="mono">${esc(regOf(f.uid))}</span>${f.name ? ` · ${esc(f.name)}` : ''} · ${esc(svcLabel(schedOf(f)) || 'no services')}</p>`).join('')) + (newR ? cxSec('Routes', newR) : '') },
    main:`<div class="showroom ${list.length > 3 ? 'many' : ''}"><div class="show-cards">${list.map(p => showCard(p, shopOffer(p), picked === p.id, owned(p.id), !!flips[p.id])).join('')}</div>
      ${soon.length ? `<div class="show-soon"><div class="ss-h"><b>Coming soon</b><span class="muted small">The aircraft you can aim for. Their day will come.</span></div><div class="soon-row">${soon.map(soonCard).join('')}</div></div>` : ''}</div>`,
    foot:`<button class="btn big" id="skipShop">Not today</button><span class="grow"></span><button class="btn primary big" id="nx" ${picked ? '' : 'disabled'}>${picked ? goLabel(`Look closer at the ${planeById(picked).name.replace(/^DHC-6 /, '')}`) : 'Choose an aircraft, or not today'} &#9654;</button>` });
  screen().querySelectorAll('[data-pick]').forEach(b => b.onclick = () => { const id = b.getAttribute('data-pick'); if(S.rnd.shopPick === id) flips[id] = !flips[id]; else { S.rnd.shopPick = id; flips[id] = true; } render(); });
  const strip = () => { S.steps = S.steps.filter(x => !['fleetSums', 'acquire'].includes(x.t)); };
  on('skipShop', () => { strip(); delete S.rnd.shopPick; UI.justDone = null; advance(); });
  on('nx', () => { strip(); const k = S.steps.findIndex(x => x.t === 'shop2'); S.steps.splice(k + 1, 0, { t:'fleetSums' }, { t:'acquire' }); UI.justDone = null; advance(); });
};
/* the Plane shop on the left rail: every aircraft on any day, to look at. Cards flip for the facts; a plane not yet for sale says
   when it arrives. Buying, renting and finance stay with the air show step in Today's Plan (day 8, day 15, then every week). */
function shopBrowseHtml(){
  const flips = UI.flipBrowse || (UI.flipBrowse = {}), owned = id => S.fleet.filter(f => f.planeId === id).length;
  const all = PLANES.filter(p => p.wb !== false && (p.status === undefined || p.status === 'live')).slice().sort((a, b) => (a.shopFromDay || 1) - (b.shopFromDay || 1) || (a.price || 0) - (b.price || 0));
  const later = ((WB && WB.aircraftPreview) || []).filter(a => !PLANES.some(p => p.id === a.id)).map(a => Object.assign({ live:false }, a)).sort((a, b) => (a.shopFromDay || 9999) - (b.shopFromDay || 9999));
  return `<div class="showroom"><p class="sr-note">Look all you like: tap a card for the facts. Buying, renting and finance happen at the air show in Today's Plan, on day 8, day 15 and then every week.</p>
    <div class="show-cards">${all.map(p => showCard(p, shopOffer(p), false, owned(p.id), !!flips[p.id], (p.shopFromDay || 1) > S.day ? fromWhen(p.shopFromDay) : null)).join('')}</div>
    ${later.length ? `<div class="show-soon"><div class="ss-h"><b>Later in the game</b><span class="muted small">The aircraft you can aim for. Their day will come.</span></div><div class="soon-row">${later.map(soonCard).join('')}</div></div>` : ''}</div>`;
}
function bindShopBrowse(){ screen().querySelectorAll('[data-pick]').forEach(b => b.onclick = () => { const id = b.getAttribute('data-pick'); UI.flipBrowse[id] = !UI.flipBrowse[id]; render(); }); }
/* every new plane gets its paint, name, registration and a short reveal */
function acquirePlane(p, kind){
  const o = shopOffer(p), uid = S.nextUid++; let terms;
  if(kind === 'buy'){ S.cash = r2(S.cash - o.price); terms = { kind:'buy', price:o.price, since:S.day }; }
  else if(kind === 'lease') terms = { kind:'lease', daily:o.lease, since:S.day };
  else { S.cash = r2(S.cash - o.deposit); terms = { kind:'finance', deposit:o.deposit, daily:o.daily, pay:o.pay, unit:o.unit, left:o.left, since:S.day }; }
  const f = { uid, planeId:p.id, route:null, schedule:[], deps:null, layout:'standard', grounded:false, terms, acquired:S.day }; S.fleet.push(f); ensureIdentity(f); UI.peTab = S.fleet.length - 1; UI.paintTab = 'colours';
  S.dec.planeBought = { round:S.round, day:S.day, planeId:p.id, kind };
  addNews([{ tag:'FLEET', text:`${S.airline.name} ${kind === 'buy' ? 'buys' : kind === 'lease' ? 'rents' : 'finances'} a ${p.name}!`, cls:'good' }]);
  if(typeof sysNotice === 'function') sysNotice(`${p.name} joins the fleet · to the paint shop`);
  // the paint shop and the hangar come next, before the plan carries on
  const at = Math.min(S.si + 1, S.steps.length); if(!S.steps.some(s => s.t === 'paint' && s.uid === uid)) S.steps.splice(at, 0, { t:'paint', uid }, { t:'reveal', uid, short:true });
  if(S.rnd.returnTo !== undefined && S.rnd.returnTo > S.si) S.rnd.returnTo += 2;
  refreshPlan(); return uid;
}
/* the fleet, side by side in their own liveries */
function fleetHtml(){
  const span = dayEnd() - dayStart();
  return `<div class="pb fleet-art"><div class="fa-row">${S.fleet.map(f => { ensureIdentity(f); const p = planeById(f.planeId), s = schedOf(f), u = s.length ? Math.round(100 * TIME.day(p, s).elapsed / span) : 0;
    const chip = f.grounded ? '<span class="chip bad">Grounded</span>' : s.length ? '<span class="chip ok">Flying today</span>' : '<span class="chip idle">Not flying yet</span>';
    return `<div class="fa-card">${aircraftArt(f, { cls:'anim pic' })}<div class="fa-cap"><b>${esc(p.name)}</b><span class="mono">${esc(f.registration)}</span>${f.name ? `<em>${esc(f.name)}</em>` : ''}</div>
      <div class="fa-facts"><span>Seats <b>${seatsOf(f)}</b></span><span>Today <b>${s.length ? esc(tripLabel(s)) : '—'}</b></span><span>In use <b>${u}%</b></span>${f.terms ? `<span>${esc(termsWord(f.terms))}</span>` : ''}${chip}</div>
      <button class="btn small" data-repaint="${f.uid}">🎨 Repaint</button></div>`; }).join('')}${S.onOrder ? (() => { const p = planeById(S.onOrder.planeId); return `<div class="fa-card onorder">${plainArt(p)}<div class="fa-cap"><b>${esc(p.name)}</b><span class="chip idle">On order · arrives ${dateShort(S.onOrder.deliveryDay)}</span></div></div>`; })() : ''}</div></div>`;
}
document.addEventListener('click', e => { const b = e.target && e.target.closest ? e.target.closest('[data-repaint]') : null; if(!b) return; const uid = +b.getAttribute('data-repaint'); if(!S.fleet.some(f => f.uid === uid)) return; UI.paintTab = 'colours'; S.overlay = { type:'paint', uid }; render(); });
/* overlays the home menu opens: the paint shop for a plane that is already flying, and "Your airline" */
R.ov_paint = o => R.paint({ t:'paint', uid:o.uid });
R.ov_yourAirline = o => {
  const g = logoOf(), shapes = LIV.logoShapes.length ? LIV.logoShapes : [{ id:'shield', name:'Shield' }], syms = LIV.tails.filter(t => t.id !== 'logo'), cur = airlineCodeNow();
  const sw = (k, v) => `<div class="sw-row one" data-k="${k}">${PAL.map(c => `<button class="sw ${c.id === v ? 'on' : ''}" style="background:${c.hex}" data-c="${c.id}" aria-label="${esc(c.name)}" aria-pressed="${c.id === v}" title="${esc(c.name)}"></button>`).join('')}</div>`;
  screen().innerHTML = `<div class="card stack id-card ya-card">${header('Your airline', 'Your airline: change the name, the flight code or the logo.', 'Your airline')}
    <div class="ya-grid"><div class="grp"><h3>Airline name</h3><input class="name-input ya-name" id="yaName" maxlength="20" value="${esc(S.airline.name)}" autocomplete="off" aria-label="Airline name"><p class="hint calm" id="yaNameMsg"></p></div>
      <div class="grp"><h3>Flight code</h3><div class="code-row"><input class="name-input code-input" id="yaCode" maxlength="2" value="${esc(cur)}" autocomplete="off" aria-label="Flight code"><p class="hint calm" id="yaCodeMsg">${esc(codeCheck(cur).msg)}</p></div></div>
      <div class="grp ya-logo"><h3>Logo</h3><div class="ya-lrow"><div id="yaBig">${logoSvg(120, g)}</div><div class="ya-lctl"><div class="pchoices four" data-k="shape">${shapes.map(s => `<button class="chc ${g.shape === s.id ? 'on' : ''}" data-v="${s.id}" aria-pressed="${g.shape === s.id}"><svg viewBox="0 0 40 40" aria-hidden="true"><g fill="#E9EEF3">${SHAPE40[s.id] || SHAPE40.square}</g></svg><span>${esc(s.name)}</span></button>`).join('')}</div>
        <div class="pchoices four" data-k="symbol">${syms.map(s => `<button class="chc ${g.symbol === s.id ? 'on' : ''}" data-v="${s.id}" aria-pressed="${g.symbol === s.id}"><svg viewBox="0 0 40 40" aria-hidden="true"><g fill="#D7263D">${SYM40[s.id] || ''}</g></svg><span>${esc(s.name)}</span></button>`).join('')}</div>
        <div class="ya-sw"><span class="label">Background</span>${sw('c1', g.c1)}<span class="label">Symbol</span>${sw('c2', g.c2)}</div></div></div></div>
      <div class="grp"><h3>Your planes</h3><div class="ya-fleet">${S.fleet.map(f => { ensureIdentity(f); const p = planeById(f.planeId); return `<div class="ya-plane">${aircraftArt(f, { cls:'thumb' })}<span><b>${esc(p.name)}</b> <span class="mono">${esc(f.registration)}</span>${f.name ? ` · ${esc(f.name)}` : ''}</span><button class="btn small" data-repaint="${f.uid}">🎨 Repaint</button></div>`; }).join('') || '<p class="muted">No planes yet.</p>'}</div></div></div>
    <div class="actions"><button class="btn primary big" id="yaDone">Done &#9654;</button></div></div>`;
  const sync = () => { syncLogoColours(); setLivery(); $('yaBig').innerHTML = logoSvg(120, g); publishSoon(); };
  $('yaName').oninput = () => { const v = $('yaName').value.replace(/[^A-Za-z0-9 '\-]/g, ''); if(v !== $('yaName').value) $('yaName').value = v; if(nameOk(v)){ S.airline.name = v.trim(); $('yaNameMsg').textContent = ''; updateTopBar(); publishSoon(); } else $('yaNameMsg').textContent = 'Letters, numbers, spaces, an apostrophe or a hyphen: up to 20.'; };
  $('yaCode').oninput = () => { const v = $('yaCode').value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2); if($('yaCode').value !== v) $('yaCode').value = v; const c = codeCheck(v); $('yaCodeMsg').textContent = c.msg; if(c.ok){ S.airline.flightCode = v; S.airline.code = v; publishSoon(); } };
  screen().querySelectorAll('.pchoices').forEach(ch => ch.querySelectorAll('.chc').forEach(b => b.onclick = () => { g[ch.getAttribute('data-k')] = b.getAttribute('data-v'); ch.querySelectorAll('.chc').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); sync(); }));
  screen().querySelectorAll('.sw-row').forEach(row => row.querySelectorAll('.sw').forEach(b => b.onclick = () => { g[row.getAttribute('data-k')] = b.getAttribute('data-c'); row.querySelectorAll('.sw').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); sync(); }));
  on('yaDone', () => { if(!nameOk($('yaName').value)) { $('yaNameMsg').textContent = 'The airline needs a name of up to 20 letters.'; return; } S.overlay = null; render(); });
};
