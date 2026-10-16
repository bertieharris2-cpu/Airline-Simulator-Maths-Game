/* ==================================================================
   THE INTELLIGENCE WALL: the Operations Wall before flying ("what do I know?"). Desk = act, wall = observe.
   While the pupil plans, the wall's idle mode (p4c wallMode 'live') becomes a board: the network map is the hero, with
   World news, Fuel market, Market outlook, Events to watch and a small Your airline card around it, and a THIS WEEK
   ribbon under the header. Each panel has a level: 1 background, 2 an opportunity (gold), 3 a significant change
   (amber; red for disruption). The first level-3 change moves to the top right, grows, says "New intelligence" and
   glows once. Clicking a city shows its customer market. Everything is read from the state and the workbook (route
   news, the market weeks, the archetypes, rival fares, the last period's figures); nothing here changes the game.
   Live operations, the reviews, the alert card and the identity screens are unchanged (p4c, p4i, p4q).
   ================================================================== */
const WI = { on:false, city:null, focus:null, hl:null, hlCity:null, seen:new Set(), slots:{ r1:'news', r2:'fuel', b1:'outlook', b2:'events', b3:'airline' } };
const WI_SEV = { bad:'#FF5F5F', warn:'#FFB547', event:'#F2C14E', opp:'#3CE394' };
const WI_ICON = { sport:'🏉', political:'🏛', economic:'💼', culture:'🎭', health:'🏥', nature:'🌊', rival:'✈' };
const WI_KIND = { sport:'Big match', political:'Strike', economic:'Conference', culture:'Festival', health:'Health alert', nature:'Weather', rival:'Rival fare' }, WI_KIND_UP = { political:'New rules', economic:'Boom', health:'All clear', nature:'Fine weather' };
function wiKind(n){ return (n.mult >= 1 && WI_KIND_UP[n.kind]) || WI_KIND[n.kind] || 'News'; }
const WI_SIG = { up2:['▲▲ STRONG GROWTH', 'u2'], up:['▲ GROWING', 'u1'], flat:['→ STEADY', 'f0'], down:['▼ QUIETER', 'd1'] };
function wiDay(){ return S && S.day ? S.day : 1; }
function wiRoutes(){ const d = wiDay(); return WORLD.routes.filter(r => routeOpen(r, d)); }
function wiDateS(iso){ return dateShort(dayOfDate(iso)).replace(/^\w+ /, ''); }
function wiRange(n){ const a = wiDateS(n.start), b = wiDateS(n.end); return a === b ? a : `${a} – ${b}`; }
/* ---------- what the wall knows ---------- */
function wiFuel(){ const d = wiDay(), now = fuelOn(d), last = fuelOn(Math.max(1, d - 7)), m = fdMarket(d);
  const mid = m.forecastLow !== undefined && m.forecastLow !== null ? (m.forecastLow + m.forecastHigh) / 2 : null;
  return { now, last, ch: last ? Math.round(100 * (now - last) / last) : 0, lo:m.forecastLow, hi:m.forecastHigh, dir: mid === null ? '' : mid > now + .005 ? '↑' : mid < now - .005 ? '↓' : '→', head:m.fuelHeadline || '', conf:String(m.forecastConfidence || ''),
    hist:[28, 21, 14, 7, 0].map(k => fuelOn(Math.max(1, d - k))), short: S.phase === 'round' && step().t === 'ready' && typeof fuelNeeded === 'function' && fuelNeeded() > S.fuel }; }
function wiWeather(){ const d = wiDay(), m = fdMarket(d), s = String(m.weather || 'Clear'), ev = typeof weatherNow === 'function' ? weatherNow() : null, lv = {}, home = homeData();
  const warn = /storm|gale|snow|ash|icy/i.test(s), watch = /fog|thunder|heat/i.test(s), all = /europe|again/i.test(s) || new RegExp(home.city, 'i').test(s) || /london/i.test(s);
  const R = wiRoutes(), named = r => new RegExp(r.city, 'i').test(s) || (/irish sea/i.test(s) && r.country === 'Ireland') || (/alps/i.test(s) && /Switzerland|Austria/.test(r.country || '')), any = R.some(named);
  const hit = r => all || !any || named(r);   // a warning that names no place is everyone's
  R.forEach(r => { lv[r.id] = warn && hit(r) ? 3 : (warn || watch) && hit(r) ? 2 : 1; });
  if(ev && S.rnd && S.rnd.focusRoute && lv[S.rnd.focusRoute] !== undefined) lv[S.rnd.focusRoute] = 3;
  const own = ownedRoutes(), top = Math.max(1, ...Object.values(lv)), mine = Math.max(1, ...own.map(id => lv[id] || 1));
  return { text: ev || s, lv, top, mine: own.length ? mine : top, wide:(warn || watch) && (all || !any) }; }   // wide: it names no place (or Europe): every route
function wiRivals(){ return ownedRoutes().map(id => { const r = routeById(id), c = competitorPrice(r), f = fareOf(id); return c === undefined || c === null ? null : { r, c, f, cut: c < f }; }).filter(Boolean); }
/* the route news the pupil can know about: on now, or announced */
function wiNews(within){ const d = wiDay(), iso = isoOf(d), e = isoOf(d + within - 1);
  return (WORLD.routeNews || []).filter(n => n.status !== 'off' && n.routes && n.routes.length && n.end >= iso && n.start <= e && (n.start <= iso || (n.announced && n.announce <= iso))).sort((a, b) => a.start < b.start ? -1 : a.start > b.start ? 1 : 0); }
function wiNext(r){ return wiNews(28).find(n => n.routes.includes(r.id)) || null; }
function wiShort(n){ return (WI_ICON[n.kind] || '📰') + ' ' + wiKind(n) + ' · ' + wiDateS(n.start); }
/* demand over the next four weeks against today, on the same weekday: the market signal */
function wiSignal(r){ const d = wiDay(), f = typeof demandMultNews === 'function' ? demandMultNews : () => 1, f0 = typeof demandMult0 === 'function' ? demandMult0 : f, wk = (a, g) => { let t = 0; for(let k = 0; k < 7; k++) t += g(r, a + k) || 0; return t / 7; };
  const M = wiSignal.m || (wiSignal.m = new Map()), key = r.id + '|' + d + '|' + (S.rnd && S.rnd.weekMods ? JSON.stringify(S.rnd.weekMods) : ''); if(M.has(key)) return M.get(key);
  const base = wk(d, f0) || 1, pts = [7, 14, 21, 28].map(k => wk(d + k, f) / base), avg = pts.reduce((a, b) => a + b, 0) / 4, out = { t: avg >= 1.25 ? 'up2' : avg >= 1.08 ? 'up' : avg <= .92 ? 'down' : 'flat', pts };
  if(M.size > 400) M.clear(); M.set(key, out); return out; }
function wiEvents(){ const d = wiDay(), iso = isoOf(d), e7 = isoOf(d + 6), e14 = isoOf(d + 13);
  return wiNews(28).map(n => ({ n, r:routeById(n.routes[0]), w: n.start <= iso ? 'NOW' : n.start <= e7 ? 'THIS WEEK' : n.start <= e14 ? 'NEXT WEEK' : 'LATER THIS MONTH' })).filter(x => x.r).slice(0, 4); }
function wiStories(){ const d = wiDay(), iso = isoOf(d), F = wiFuel(), m = fdMarket(d), cal = calRow(d), out = [], seen = new Set(), add = x => { if(x.title && !seen.has(x.title)){ seen.add(x.title); out.push(x); } };
  wiNews(14).forEach(n => { const r = routeById(n.routes[0]); if(!r) return; const up = n.mult > 1;
    add({ ic:WI_ICON[n.kind] || '📰', tag: n.kind === 'rival' ? 'RIVAL' : 'EVENT', when: n.start <= iso ? 'NOW' : wiDateS(n.start).toUpperCase(), title:n.headline, cons:`${r.city} demand ${up ? (n.mult >= 1.5 ? '↑↑' : '↑') : '↓'}${n.segment && n.segment !== 'all' ? ' ' + n.segment : ''}`, tone: up ? 'good' : 'bad', city:r.id }); });
  if(F.lo !== undefined && F.lo !== null && F.head) add({ ic:'🛢', tag:'FUEL', when:'THIS WEEK', title:F.head, cons:`Fuel ${F.dir} next week: ${priceL(F.lo)}–${priceL(F.hi)}`, tone: F.dir === '↑' ? 'warn' : F.dir === '↓' ? 'good' : '' });
  if(m.headline) add({ ic:'📰', tag:'MARKET', when:'THIS WEEK', title:m.headline, cons:'', tone:'' });
  (cal && cal.headlines || []).forEach(h => add({ ic:'📰', tag:'TODAY', when:'TODAY', title:h, cons:'', tone:'' }));
  (S.log || []).filter(n => n.round === S.round).slice(-1).forEach(n => add({ ic:'📰', tag:n.tag || 'NEWS', when:'RECENT', title:n.text, cons:'', tone: n.cls === 'good' ? 'good' : n.cls === 'warn' ? 'warn' : '' }));
  const weather = out.filter(x => x.tone === 'bad'), rest = out.filter(x => x.tone !== 'bad'); return weather.concat(rest); }
function wiAlerts(){ const A = [], W = wiWeather(), F = wiFuel(), rv = wiRivals().filter(x => x.cut);
  if(W.mine === 3) A.push({ w:'weather', sev:'red', why:W.text });
  if(Math.abs(F.ch) >= 5) A.push({ w:'fuel', sev:'amber', why:`Fuel ${F.ch > 0 ? 'up' : 'down'} ${Math.abs(F.ch)}% this week` }); else if(F.short) A.push({ w:'fuel', sev:'amber', why:"The tank won't cover today's flights" });
  if(rv.length) A.push({ w:'rivals', sev:'amber', why:`${WORLD.rival} · ${rv[0].r.city} ${money(rv[0].c)}` });
  return A; }
function wiLevel(id, A){ if(A.some(a => a.w === id)) return 3; if(id === 'weather' && wiWeather().top >= 2) return 2; if(id === 'outlook' && wiRoutes().some(r => wiSignal(r).t === 'up2')) return 2; if(id === 'events' && wiEvents().some(x => x.w === 'NOW')) return 2; return 1; }
/* one mark a city: disruption, then a rival's fare, then an event, then strong growth */
function wiMarks(){ const out = {}, W = wiWeather(), d = wiDay(), e7 = isoOf(d + 6);
  const own = ownedRoutes(); let others = 0; wiRoutes().forEach(r => { if(wiSignal(r).t === 'up2' && (own.includes(r.id) || others++ < 2)) out[r.id] = { ic:'▲▲', text:1, kind:'opp' }; const n = wiNext(r); if(n && n.start <= e7) out[r.id] = { ic:WI_ICON[n.kind] || '📰', kind: n.mult < 1 ? 'warn' : 'event' }; });
  wiRivals().filter(x => x.cut).forEach(x => { out[x.r.id] = { ic:money(x.c), text:1, kind:'warn' }; });
  Object.keys(W.lv).forEach(id => { if(W.lv[id] === 3 && (!W.wide || own.includes(id))) out[id] = { ic:'🌩', kind:'bad' }; });   // weather everywhere: marked on the routes flown, not on every city
  return out; }
/* ---------- the panels ---------- */
const WI_PANELS = {
  news:{ t:'World news', meta:() => 'updated this morning', html:k => { const n = k && k[0] === 'b' ? 2 : 3, st = wiStories().slice(0, n);
    return `<div class="wi-nws" style="grid-template-columns:repeat(${n},1fr)">${st.map(x => `<article ${x.city ? `data-wcity="${x.city}"` : ''}><span class="kk ${x.tone}"><i>${x.ic}</i>${esc(x.tag)} · ${esc(x.when)}</span><b>${esc(x.title)}</b>${x.cons ? `<span class="c ${x.tone}">${esc(x.cons)}</span>` : ''}</article>`).join('') || '<p class="wi-sf">No news yet.</p>'}</div>`; } },
  fuel:{ t:'Fuel market', meta:() => 'updated this morning', html:() => { const F = wiFuel(), pts = F.hist, lo = Math.min(...pts) - .02, hi = Math.max(...pts) + .02, W = 300, H = 90, x = k => 4 + k * (W - 12) / (pts.length - 1), y = v => 6 + (H - 12) * (hi - v) / ((hi - lo) || 1);
    const line = pts.map((v, k) => (k ? 'L' : 'M') + x(k).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
    return `<div class="wi-fm"><div><div class="pr">${priceL(F.now)}<small>/L</small></div><div class="ch ${F.ch > 0 ? 'wa' : F.ch < 0 ? 'up' : 'sf'}">${F.ch > 0 ? '▲' : F.ch < 0 ? '▼' : '■'} ${Math.abs(F.ch)}% <span class="wi-sf">this week</span></div></div>
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="wi-fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#36C6FF" stop-opacity=".3"/><stop offset="1" stop-color="#36C6FF" stop-opacity="0"/></linearGradient></defs><path d="${line} L${x(pts.length - 1)} ${H} L${x(0)} ${H} Z" fill="url(#wi-fg)"/><path d="${line}" fill="none" stroke="#36C6FF" stroke-width="2.5" vector-effect="non-scaling-stroke"/><circle cx="${x(pts.length - 1)}" cy="${y(F.now)}" r="8" fill="#fff" opacity=".25"/><circle cx="${x(pts.length - 1)}" cy="${y(F.now)}" r="4" fill="#fff"/></svg></div>
      ${F.lo !== undefined && F.lo !== null ? `<div class="wi-nextwk"><span>NEXT WEEK</span><b>${priceL(F.lo)}–${priceL(F.hi)}</b><small>${esc(F.head || (F.conf ? F.conf + ' confidence' : ''))}</small></div>` : '<div class="wi-nextwk"><span>NEXT WEEK</span><small>No forecast this week.</small></div>'}`; } },
  outlook:{ t:'Market outlook', meta:() => 'next 4 weeks', html:() => { const order = ['up2', 'up', 'flat', 'down'], own = ownedRoutes(), by = (a, b) => order.indexOf(a.s.t) - order.indexOf(b.s.t), all = wiRoutes().map(r => ({ r, s:wiSignal(r) }));
    const mine = all.filter(x => own.includes(x.r.id)).sort(by), rest = all.filter(x => !own.includes(x.r.id)).filter(x => x.s.t !== 'flat').sort(by), pick = mine.concat(rest).slice(0, 6);
    return `<div class="wi-sig">${pick.map(({ r, s }) => { const g = WI_SIG[s.t], n = wiNext(r), a = r.arch, mx = Math.max(1, ...s.pts);
      return `<button data-wcity="${r.id}" class="${g[1]} ${WI.city === r.id ? 'on' : ''}"><b>${esc(r.city)}</b><span class="spk ${g[1]}">${s.pts.slice(0, 3).map(v => `<i style="height:${Math.round(26 * v / mx)}px"></i>`).join('')}</span><span class="s ${g[1]}">${g[0]}</span><span class="t">${n ? esc(wiShort(n)) : esc((own.includes(r.id) ? '' : 'Not flown · ') + seasonOf(wiDay()).replace(/^\w/, c => c.toUpperCase()))}</span></button>`; }).join('')}</div>`; } },
  events:{ t:'Events to watch', meta:() => 'next 4 weeks', html:() => { const E = wiEvents();
    return `<div class="wi-watch">${E.map(x => `<button data-wcity="${x.r.id}"><span class="w ${x.w === 'NOW' ? 'now' : ''}">${x.w}</span><span class="i">${WI_ICON[x.n.kind] || '📰'}</span><span><b>${esc(x.r.city)} · ${esc(wiKind(x.n))} <em class="${x.n.mult > 1 ? 'up' : 'dn'}">${x.n.mult > 1 ? (x.n.mult >= 1.5 ? '↑↑' : '↑') : '↓'}</em></b><small>${esc(wiRange(x.n))}</small></span></button>`).join('') || '<p class="wi-sf">Nothing announced for the next four weeks.</p>'}</div>`; } },
  airline:{ t:'Your airline', meta:() => { const h = lastDay(); return h ? esc(periodShort(h)) : 'no flights yet'; }, html:() => { const h = lastDay(); if(!h || !h.seats) return '<p class="wi-sf">The first figures arrive when the first flight lands.</p>';
    const pct = Math.round(100 * (h.pax || 0) / h.seats), R = h.routes || {}, ids = Object.keys(R).filter(id => R[id].want !== undefined), away = ids.reduce((t, id) => t + Math.max(0, R[id].want - R[id].pax), 0), top = ids.slice().sort((a, b) => (R[b].want - R[b].pax) - (R[a].want - R[a].pax))[0], C = 2 * Math.PI * 34;
    return `<div class="wi-ya"><svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="34" fill="none" stroke="rgba(110,170,235,.14)" stroke-width="7"/><circle cx="42" cy="42" r="34" fill="none" stroke="${pct >= 85 ? '#3CE394' : '#36C6FF'}" stroke-width="7" stroke-dasharray="${(C * pct / 100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 42 42)"/><text x="42" y="48" fill="#fff" font-size="19" text-anchor="middle" font-weight="300">${pct}%</text></svg>
      <div><span>Seats filled</span><b>${num(h.pax || 0)} <small>of ${num(h.seats)}</small></b>${ids.length ? `<span>Turned away</span><b>${num(away)}</b>` : `<span>Profit</span><b class="${(h.profit || 0) >= 0 ? 'up' : 'dn'}">${money(Math.round(h.profit || 0))}</b>`}</div></div>
      <p class="wi-line"><span class="wi-sf">Highest pressure:</span> ${top && R[top].want - R[top].pax > 0 ? esc(routeById(top).city) : 'none'}</p>`; } },
  weather:{ t:'Weather & disruption', meta:() => 'this week', html:() => { const W = wiWeather(), own = ownedRoutes(), ids0 = (own.length ? own : wiRoutes().map(r => r.id)).concat(W.wide ? [] : Object.keys(W.lv).filter(id => W.lv[id] > 1 && !own.includes(id))), ids = ids0.slice(0, 8), more = ids0.length - ids.length, ST = { 1:['GOOD', 'up', '☀'], 2:['WATCH', 'wa', '🌧'], 3:['WARNING', 'dn', '🌩'] };
    return `<div class="wi-wxl">${ids.map(id => { const r = routeById(id), st = ST[W.lv[id] || 1]; return `<div><b>${esc(r.code || r.city.slice(0, 3).toUpperCase())}</b><span>${st[2]}</span><em class="${st[1]}">${st[0]}</em></div>`; }).join('')}${W.wide && W.top >= 2 ? `<div class="wi-wxall"><b>All routes</b><span>${W.top === 3 ? '🌩' : '🌧'}</span><em class="${W.top === 3 ? 'dn' : 'wa'}">${W.top === 3 ? 'WARNING' : 'WATCH'}</em></div>` : more > 0 ? `<div class="wi-wxall"><b>+ ${more} more</b></div>` : ''}</div>
      ${W.top >= 2 ? `<div class="wi-wxa ${W.top === 3 ? 'bad' : ''}"><span>${W.top === 3 ? 'WARNING' : 'WATCH'}</span>${esc(W.text)}${W.top === 3 ? '. Delays possible.' : ''}</div>` : '<p class="wi-sf" style="margin-top:14px">No disruption expected this week.</p>'}`; } },
  rivals:{ t:'Competitor watch', meta:() => 'fares today', html:() => { const rv = wiRivals(); if(!rv.length) return `<p class="wi-sf">${esc(WORLD.rival || 'The rival')} is not flying your routes yet.</p>`;
    return `<table class="wi-tbl"><thead><tr><th>Route</th><th>${esc(WORLD.rival || 'Rival')}</th><th>Yours</th></tr></thead><tbody>${rv.map(x => `<tr class="${x.cut ? 'cut' : ''}"><td>${esc(x.r.city)}</td><td class="${x.cut ? 'wa' : ''}">${money(x.c)}</td><td>${money(x.f)}</td></tr>`).join('')}</tbody></table>`; } }
};
/* a city's briefing: the archetype's customers, its times of day and season, the news ahead, the rival */
function wiCityPanel(id){ const r = routeById(id); if(!r) return ''; const a = r.arch || {}, s = wiSignal(r), g = WI_SIG[s.t], n = wiNext(r), mine = ownedRoutes().includes(id), c = competitorPrice(r);
  const bands = (typeof BANDS !== 'undefined' ? BANDS : []).map(b => { const h = bandHours(b); return [b, (a.bands && a.bands[b] || 0) / Math.max(1, h[1] - h[0])]; }), mxb = Math.max(1e-9, ...bands.map(x => x[1])), top = bands.slice().sort((x, y) => y[1] - x[1]).slice(0, 2).map(x => BAND_SHORT[x[0]] || x[0]);
  const bs = a.businessShare !== undefined && a.businessShare !== null ? a.businessShare : .5, seas = a.season || {}, best = Object.keys(seas).sort((x, y) => seas[y] - seas[x])[0];
  return `<div class="wi-p wi-city hero2"><button class="x" data-wiclose="1" title="Close">✕</button><h3>${esc(r.city)} · customer market<span class="meta">${mine ? 'one of your routes' : 'not flown yet'}</span></h3>
    <div class="wi-mix">${[['BUSINESS', bs, '#3CE394'], ['LEISURE', 1 - bs, '#36C6FF']].map(([l, v, cc]) => `<div>${l}<i><u style="width:${Math.round(v * 100)}%;background:${cc}"></u></i><b>${Math.round(v * 100)}%</b></div>`).join('')}</div>
    <div class="wi-facts"><span>Strongest times</span><b>${top.length ? esc(top.join(' + ')) : '—'}</b><span>Fare sensitivity</span><b>${esc(String(a.fareSensitivity || 'medium').replace(/^\w/, ch => ch.toUpperCase()))}</b><span>Trend</span><b class="${g[1]}">${g[0]}</b>
      <span>Busiest season</span><b>${best ? esc(best.replace(/^\w/, ch => ch.toUpperCase())) : '—'}</b><span>Why now?</span><span class="wi-why">${esc(n ? n.headline : (r.blurb || a.story || ''))}</span>${c !== undefined && c !== null ? `<span>${esc(WORLD.rival || 'Rival')}</span><b class="${mine && c < fareOf(id) ? 'wa' : ''}">${money(c)}${mine ? ` <small class="wi-sf">· yours ${money(fareOf(id))}</small>` : ''}</b>` : ''}</div>
    <div class="wi-when"><div class="wi-sf">WHEN PEOPLE WANT TO FLY <span>· people an hour</span></div><div class="wi-todbar">${bands.map(([b, v]) => `<div><i style="height:${Math.round(100 * v / mxb)}%;${v === mxb ? 'background:#F2C14E' : ''}"></i><small>${esc(BAND_SHORT[b] || b)}</small></div>`).join('')}</div></div></div>`; }
/* ---------- the board ---------- */
function wiSlots(){ const A = wiAlerts(), slots = Object.assign({}, WI.slots), note = {}, hero = A.length ? A[0].w : null, where = w => Object.keys(slots).find(k => slots[k] === w), woke = w => A.some(a => a.w === w);
  if(hero){ const k = where(hero); if(k){ if(k !== 'r1'){ slots[k] = slots.r1; slots.r1 = hero; } } else { note.b2 = WI_PANELS[slots.b2].t; slots.b2 = slots.r1; slots.r1 = hero; } }
  A.slice(1).forEach(a => { if(where(a.w)) return; const k = ['b1', 'b2'].find(z => !note[z] && !woke(slots[z])); if(k){ note[k] = WI_PANELS[slots[k]].t; slots[k] = a.w; } });
  if(WI.focus && WI_PANELS[WI.focus] && !where(WI.focus)){ const k = ['b1', 'b2'].find(z => !woke(slots[z])) || 'b1'; note[k] = WI_PANELS[slots[k]].t; slots[k] = WI.focus; note.focus = k; }
  return { A, slots, note, hero }; }
function wiCell(k, B, fresh){ const id = B.slots[k], P = WI_PANELS[id], a = B.A.find(x => x.w === id), lv = wiLevel(id, B.A), isHero = id === B.hero && k === 'r1', key = a ? a.w + ':' + a.why : '', isFresh = a && !WI.seen.has(key);
  if(isFresh) fresh.push(key);
  const cls = ['wi-p', 'l' + lv, a && a.sev === 'red' ? 'red' : '', isHero ? 'hero' : '', isFresh ? 'wake' : '', WI.hl === id ? 'hl' : ''].join(' ');
  return `<div class="${cls}" data-w="${id}"><h3>${lv === 3 ? '<span class="lv">⚠</span>' : lv === 2 ? '<span class="lv gd">◆</span>' : ''}${P.t}<span class="meta">${B.note[k] ? `in place of ${B.note[k]} for now` : P.meta()}</span>${B.note.focus === k ? '<button class="x" data-wiclose="1" title="Put back">✕</button>' : ''}</h3>${a ? `<div class="kick">${isHero || isFresh ? '⚠ New intelligence · ' : ''}<span>${esc(a.why)}</span></div>` : ''}<div class="wc">${P.html(k)}</div></div>`; }
function wiRibbonHtml(A){ const F = wiFuel(), it = A.map(a => ({ ic: a.w === 'weather' ? '🌩' : a.w === 'fuel' ? '🛢' : '✈', t:a.why, w:a.w, c: a.w === 'weather' && S.rnd && S.rnd.focusRoute ? S.rnd.focusRoute : '', cls: a.sev === 'red' ? 'bad' : 'warn' }));
  wiEvents().slice(0, 3).forEach(x => it.push({ ic:WI_ICON[x.n.kind] || '📰', t:`${x.r.city} ${x.w === 'NOW' ? 'now' : wiDateS(x.n.start)}`, w:'events', c:x.r.id, cls:'' }));
  if(F.lo !== undefined && F.lo !== null && Math.abs(F.ch) < 5) it.push({ ic:'🛢', t:`Fuel ${F.dir} next week`, w:'fuel', c:'', cls:'' });
  return `<span class="wi-lbl">THIS WEEK</span>${it.map(x => `<button class="${x.cls}" data-wfocus="${x.w}" data-wfcity="${x.c || ''}">${x.ic} ${esc(x.t)}</button>`).join('')}`; }
function wiEnsure(){ const wall = $('wall'); if($('wRibbon')) return;
  ['wRibbon', 'wRight', 'wBottom'].forEach(id => { const d = document.createElement('div'); d.id = id; d.className = 'wi-' + id.slice(1).toLowerCase(); wall.appendChild(d); });
  const mh = document.createElement('div'); mh.className = 'wi-mh'; mh.innerHTML = '<b>NETWORK</b><span class="legend"><span><i class="a"></i>Our routes</span><span><i class="c"></i>Open to you</span><span>Click a city</span></span>'; $('wMap').appendChild(mh);
  // the map takes pointer capture to pan, so a click on a city arrives on the svg: read the city at pointerdown, act at pointerup if the pointer did not move
  const map = $('wMap'); map.addEventListener('pointerdown', e => { WI._pd = null; if(!WI.on || !wallMap) return; const svg = map.querySelector('svg'); if(!svg) return;
    const rc = svg.getBoundingClientRect(), fx = svg.clientWidth / (rc.width || 1), x = (e.clientX - rc.left) * fx, y = (e.clientY - rc.top) * fx, M = wallMap, toS = q => [M.cam.tx + q[0] * M.cam.k, M.cam.ty + q[1] * M.cam.k];
    let best = null, bd = 22 * M.ui; wiRoutes().forEach(r => { const q = toS([mx(r.lon), my(r.lat)]), dd = Math.hypot(q[0] - x, q[1] - y); if(dd < bd){ bd = dd; best = r.id; } });
    if(best) WI._pd = { id:best, x:e.clientX, y:e.clientY }; }, true);
  map.addEventListener('pointerup', e => { const d = WI._pd; WI._pd = null; if(!d || !WI.on || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) return; WI.city = WI.city === d.id ? null : d.id; WI.hlCity = null; renderDisplay(); });
  document.addEventListener('click', e => { if(!WI.on || !e.target.closest || e.target.closest('#wMap')) return;
    const c = e.target.closest('[data-wcity]'); if(c){ const id = c.getAttribute('data-wcity'); WI.city = WI.city === id ? null : id; WI.hlCity = null; renderDisplay(); return; }
    const f = e.target.closest('[data-wfocus]'); if(f){ WI.focus = f.getAttribute('data-wfocus') || null; WI.hl = WI.focus; WI.hlCity = f.getAttribute('data-wfcity') || null; WI.city = null; renderDisplay(); return; }
    if(e.target.closest('[data-wiclose]')){ WI.city = null; WI.focus = null; WI.hlCity = null; renderDisplay(); } }); }
function wiPut(box, html){ if(box._wi !== html){ box._wi = html; box.innerHTML = html; } }
function renderIntelWall(){
  wiEnsure(); const wall = $('wall'); wall.classList.add('mode-intel');
  $('wPeriod').textContent = 'INTELLIGENCE'; const lv = $('wLive'); lv.className = 'w-live idle'; lv.textContent = 'INTELLIGENCE UPDATED ' + (typeof firstDep === 'function' ? fmtTime(Math.max(0, firstDep() - 60)) : '08:00');
  const B = wiSlots(), fresh = [];
  wiPut($('wRibbon'), wiRibbonHtml(B.A));
  wiPut($('wRight'), WI.city && routeById(WI.city) ? wiCityPanel(WI.city) : wiCell('r1', B, fresh) + wiCell('r2', B, fresh));
  $('wRight').classList.toggle('hero', !!B.hero && !WI.city);
  wiPut($('wBottom'), wiCell('b1', B, fresh) + wiCell('b2', B, fresh) + wiCell('b3', B, fresh));
  fresh.forEach(k => WI.seen.add(k)); WI.hl = null;
}
/* the map: marks on the cities (one each), weather cells, a hit area to click; drawn after the shared map renders */
function wiHookMap(){ if(!wallMap || wallMap._wi) return; wallMap._wi = true; const r0 = wallMap.render; wallMap.render = function(){ r0.call(wallMap); if(WI.on) wiDrawMarks(wallMap); }; }
function wiDrawMarks(M){ const root = $('wMap'), svg = root && root.querySelector('svg'); if(!svg || !S) return; const marks = svg.querySelector('.mmarks'), lines = svg.querySelector('.mlines'); if(!marks || !lines) return;
  if(!svg.querySelector('#wi-wr')){ const d = el('defs', {}, svg); [['wi-wr', '#FF5F5F', .4, .14], ['wi-wa', '#FFB547', .22, .06]].forEach(([id, c, a1, a2]) => { const g = el('radialGradient', { id }, d); el('stop', { offset:0, 'stop-color':c, 'stop-opacity':a1 }, g); el('stop', { offset:.5, 'stop-color':c, 'stop-opacity':a2 }, g); el('stop', { offset:1, 'stop-color':c, 'stop-opacity':0 }, g); }); }
  const toS = p => [M.cam.tx + p[0] * M.cam.k, M.cam.ty + p[1] * M.cam.k], ui = M.ui, X = wiMarks(), W = wiWeather();
  wiRoutes().forEach(r => { const q = toS([mx(r.lon), my(r.lat)]), lv = W.lv[r.id] || 1;
    if(lv > 1 && (!W.wide || ownedRoutes().includes(r.id))) el('circle', { cx:q[0].toFixed(1), cy:q[1].toFixed(1), r:((lv === 3 ? 70 : 44) * ui).toFixed(1), fill:`url(#wi-${lv === 3 ? 'wr' : 'wa'})`, 'pointer-events':'none' }, lines);
    const g = el('g', { 'class':'wi-city', 'data-wcity':r.id, transform:`translate(${q[0].toFixed(1)} ${q[1].toFixed(1)})` }, marks);
    el('circle', { r:(16 * ui).toFixed(1), fill:'transparent' }, g);
    if(WI.city === r.id || WI.hlCity === r.id) el('circle', { r:(13 * ui).toFixed(1), fill:'none', stroke:'#36C6FF', 'stroke-width':2.5 }, g);
    const mk = X[r.id]; if(!mk) return; const H = 22 * ui, a = (typeof FLAG_ASPECT !== 'undefined' && FLAG_ASPECT[r.flag]) || 1.5, bw = (mk.text ? 12 + mk.ic.length * 9 : 28) * ui;
    const b = el('g', { 'class':'wi-badge ' + mk.kind, transform:`translate(${(H * a / 2 + 8 * ui).toFixed(1)} ${(-H * 1.1 - H / 2).toFixed(1)})` }, g);
    if(mk.kind === 'bad'){ const p = el('circle', { cx:0, cy:0, r:8 * ui, fill:'none', stroke:'#FF5F5F', 'stroke-width':1.5, opacity:.7 }, g); el('animate', { attributeName:'r', values:`${8 * ui};${24 * ui};${8 * ui}`, dur:'2.4s', repeatCount:'3' }, p); el('animate', { attributeName:'opacity', values:'.8;0;.7', dur:'2.4s', repeatCount:'3' }, p); }
    el('rect', { x:0, y:(-13 * ui).toFixed(1), width:bw.toFixed(1), height:(26 * ui).toFixed(1), fill:'rgba(2,8,18,.85)', stroke:WI_SEV[mk.kind], 'stroke-opacity':.8 }, b);
    const t = el('text', { x:(bw / 2).toFixed(1), y:1, 'text-anchor':'middle', 'dominant-baseline':'central', 'font-size':Math.round((mk.text ? 14 : 16) * ui), 'font-weight':600, fill:WI_SEV[mk.kind] }, b); t.textContent = mk.ic; }); }
/* the wall's idle mode is the Intelligence Wall; every other mode is as before */
const renderDisplayBase = renderDisplay;
renderDisplay = function(){
  if(!S || !S.airline || !S.steps || !S.steps.length){ renderDisplayBase(); return; }
  const intel = wallMode() === 'live', first = !wallMap; WI.on = intel;
  renderDisplayBase(); if(!wallMap) return; wiHookMap();
  if(intel){ renderIntelWall(); if(first) wallMap.render(); }
};
