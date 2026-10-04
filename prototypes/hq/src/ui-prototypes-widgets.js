/* HQ prototype widgets: plain JS + inline SVG, no libraries. Each widget renders into an element
   marked data-w="name". Colours come from CSS variables, so one widget serves every theme. */
(function(){
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const money = (n, d) => '£' + Number(n).toLocaleString('en-GB', { minimumFractionDigits: d||0, maximumFractionDigits: d||0 });
const num = n => Number(n).toLocaleString('en-GB');
const pct = (a, b) => ((a - b) / b * 100);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const R = DATA.routes.map(r => Object.assign({}, r, { revenue: r.sold * r.fare, profit: r.sold * r.fare - r.cost, lf: Math.round(100 * r.sold / r.seats) }));
const SUM = { seats: R.reduce((t, r) => t + r.seats, 0), sold: R.reduce((t, r) => t + r.sold, 0) };

/* ---------- icons (24px stroke set) ---------- */
const IC = {
  home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  plane:'<path d="M2.5 12.5l7-1.2L13.6 4h2.1l-2 7.2 5.6-.9L21 8h1.6l-1 4 1 4H21l-1.7-2.3-5.6-.9 2 7.2h-2.1L9.5 12.7l-7-1.2z" fill="currentColor" stroke="none"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.6c2.6.1 4.6 1.8 5.3 4.6"/>',
  megaphone:'<path d="M3 10v4h3l7 4V6L6 10H3zM17 9a4 4 0 0 1 0 6M6 14l1.5 5h2.5L9 14"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/>',
  bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0"/>',
  gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  fuel:'<path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h14M7 7h6v4H7zM15 9h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3"/>',
  wrench:'<path d="M14.5 6.5a4 4 0 0 0 5 5l-9.5 9.5a2.1 2.1 0 0 1-3-3L16.5 8.5a4 4 0 0 0-2-2zM14.5 6.5L17 4"/>',
  coins:'<ellipse cx="9" cy="7" rx="6" ry="2.6"/><path d="M3 7v4c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6V7M3 11v4c0 1.4 2.7 2.6 6 2.6 1 0 2-.1 2.8-.3"/><ellipse cx="16.5" cy="15" rx="4.5" ry="2"/><path d="M12 15v3c0 1.1 2 2 4.5 2s4.5-.9 4.5-2v-3"/>',
  smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14.5c1 1.4 2.4 2 4 2s3-.6 4-2"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  pin:'<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
  trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8 21h8M9.5 17h5v4h-5z"/>',
  play:'<path d="M8 5l11 7-11 7z" fill="currentColor"/>',
  pause:'<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" stroke="none"/>',
  ff:'<path d="M4 6l8 6-8 6zM12 6l8 6-8 6z" fill="currentColor" stroke="none"/>',
  arrowR:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  alert:'<path d="M12 3l10 18H2zM12 10v5M12 18h.01"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  route:'<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.2 16.6C13 14 9 9 15.8 7.4"/>',
  briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
  leaf:'<path d="M4 20c0-9 6-15 16-16-1 10-7 16-16 16zM4 20l8-8"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>'
};
const icon = (n, cls) => `<svg class="ic ${cls||''}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;
window.icon = icon;

/* ---------- small helpers ---------- */
function countUp(root){
  $$('[data-count]', root).forEach(el => {
    const to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    const show = v => el.textContent = pre + Number(v).toLocaleString('en-GB', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
    if(reduce){ show(to); return; }
    const t0 = performance.now(), dur = 1100;
    const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); show(k < 1 ? to * e : to); if(k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}
function spark(vals, color, w, h){
  w = w || 120; h = h || 36; const mn = Math.min(...vals), mx = Math.max(...vals), pad = 4;
  const X = i => pad + (w - 2 * pad) * i / (vals.length - 1), Y = v => h - pad - (h - 2 * pad) * (v - mn) / ((mx - mn) || 1);
  const pts = vals.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" style="--sw:${w}px" aria-hidden="true"><polygon points="${X(0)},${h - pad} ${pts} ${X(vals.length - 1)},${h - pad}" fill="${color}" opacity=".12"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${X(vals.length - 1)}" cy="${Y(vals[vals.length - 1])}" r="4" fill="${color}" stroke="var(--panel-solid)" stroke-width="2"/></svg>`;
}
function trend(k){
  const d = pct(k.value, k.prev), up = d >= 0, good = (up && k.good === 'up') || (!up && k.good === 'down');
  const txt = k.unit === '%' ? `${up ? '+' : '−'}${Math.abs(k.value - k.prev)} pts` : `${up ? '+' : '−'}${Math.abs(d).toFixed(1)}%`;
  return `<span class="trend ${good ? 'good' : 'bad'}"><b>${up ? '▲' : '▼'}</b> ${txt}</span>`;
}
function stars(v){ let s = ''; for(let i = 1; i <= 5; i++) s += `<span class="${v >= i ? 'on' : v >= i - .5 ? 'half' : ''}">★</span>`; return `<span class="stars" aria-label="${v} out of 5">${s}</span>`; }

/* ---------- side-view planes for the fleet panel ---------- */
const SIDE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <symbol id="side-jet" viewBox="0 0 220 64"><path d="M30 34 C30 27 38 23 52 23 L172 23 C190 23 206 28 214 34 C206 39 192 42 174 42 L52 42 C38 42 30 40 30 34Z" fill="var(--plane-body)"/>
    <path d="M36 25 L20 3 L38 3 L64 25Z" fill="var(--plane-tail)"/><path d="M26 32 L8 30 L8 35 L30 36Z" fill="var(--plane-tail)"/>
    <path d="M96 37 L136 37 L114 60 L102 60Z" fill="var(--plane-wing)"/><rect x="100" y="42" width="26" height="9" rx="4.5" fill="var(--plane-wing)"/>
    <path d="M52 35 L196 35" stroke="var(--plane-tail)" stroke-width="2.4"/><g fill="var(--plane-win)">${Array.from({length:16}, (_, i) => `<rect x="${66 + i * 7.4}" y="27.5" width="3.6" height="3.6" rx="1"/>`).join('')}</g>
    <path d="M196 29 C200 29 205 30 208 32 L200 32Z" fill="var(--plane-win)"/></symbol>
  <symbol id="side-prop" viewBox="0 0 220 64"><path d="M34 34 C34 28 41 24 54 24 L168 24 C186 24 202 29 210 34 C202 39 188 42 170 42 L54 42 C41 42 34 40 34 34Z" fill="var(--plane-body)"/>
    <path d="M40 26 L26 4 L42 4 L64 26Z" fill="var(--plane-tail)"/><path d="M30 31 L14 22 L20 22 L42 30Z" fill="var(--plane-tail)"/>
    <path d="M92 24 L140 24 L136 21 L96 21Z" fill="var(--plane-wing)"/><rect x="112" y="16" width="20" height="9" rx="4.5" fill="var(--plane-wing)"/><path d="M134 10 L134 31" stroke="var(--plane-win)" stroke-width="2"/>
    <path d="M54 35 L192 35" stroke="var(--plane-tail)" stroke-width="2.4"/><g fill="var(--plane-win)">${Array.from({length:12}, (_, i) => `<rect x="${70 + i * 8.6}" y="28" width="3.6" height="3.6" rx="1"/>`).join('')}</g>
    <path d="M192 29.5 C196 29.5 201 31 204 32.5 L196 32.5Z" fill="var(--plane-win)"/><path d="M60 42 L64 50 M150 42 L148 50" stroke="var(--plane-wing)" stroke-width="2.4"/></symbol>
  <symbol id="top-plane" viewBox="-12 -12 24 24"><path d="M11 0c0-1.1-.9-1.5-2.2-1.5H3L-3-9.5h-2.6L-2.2-1.5h-4.4L-8.4-4h-1.8l1.1 4-1.1 4h1.8l1.8-2.5h4.4L-5.6 9.5H-3L3 1.5h5.8C10.1 1.5 11 1.1 11 0z"/></symbol>
</defs></svg>`;

/* ---------- widgets ---------- */
const W = {};
W.kpi = (el, o) => {
  const k = DATA.kpi[o.k], h = DATA.history;
  const series = { revenue: h.revenue, profit: h.revenue.map((v, i) => v - h.costs[i]), fuel: h.fuelCost, satisfaction: h.satisfaction }[o.k];
  const col = css(k.good === 'down' ? '--kpi-spark-cost' : '--kpi-spark') || '#5cc8ff';
  el.classList.add('kpi');
  el.innerHTML = `<div class="kpi-top"><span class="kpi-ic">${icon(k.icon)}</span><span class="kpi-label">${k.label}</span></div>
    <b class="kpi-val" data-count="${k.value}" ${k.money ? 'data-pre="£"' : ''} ${k.unit ? `data-suf="${k.unit}"` : ''}>${k.money ? money(0) : 0}</b>
    <span class="kpi-sub">${trend(k)} <span class="muted">vs last round</span></span><div class="kpi-spark">${spark(series, col, 120, 42)}</div>`;
};
W.cash = el => { el.innerHTML = `<span class="label">Cash balance</span><b data-count="${DATA.cash}" data-pre="£">£0</b>`; };

/* Route map: the game's own land/border outlines, Europe crop, curved routes from the hub. */
const P = (lat, lon) => [(lon + 180) * 10, (79 - lat) * 10];
function arc(a, b, bend){ const [x1, y1] = a, [x2, y2] = b, mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy), k = (bend || .22);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${(mx + dy * k).toFixed(1)} ${(my - dx * k).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`; }
W.map = (el, o) => {
  const hub = DATA.airline.hub, H = P(hub.lat, hub.lon), mode = o.mode || 'routes', vb = o.vb || '1500 160 660 330';
  el.classList.add('map');
  el.innerHTML = `${o.tabs === 'no' ? '' : `<div class="map-tabs" role="tablist">${[['routes','Route map'],['demand','Demand'],['profit','Profit']].map(([k, l]) => `<button role="tab" data-mode="${k}" aria-selected="${k===mode}">${l}</button>`).join('')}</div>`}
    <div class="map-wrap"><svg class="map-svg" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" aria-label="Route map">
      <defs><radialGradient id="glowG"><stop offset="0" stop-color="var(--route)" stop-opacity=".55"/><stop offset="1" stop-color="var(--route)" stop-opacity="0"/></radialGradient></defs>
      <rect x="0" y="0" width="3600" height="1350" fill="var(--ocean)"/>
      <g class="grat">${Array.from({length:37}, (_, i) => `<line x1="${i*100}" y1="0" x2="${i*100}" y2="1350"/>`).join('')}${Array.from({length:14}, (_, i) => `<line x1="0" y1="${i*100}" x2="3600" y2="${i*100}"/>`).join('')}</g>
      <path class="land" d="${LAND_D}"/><path class="borders" d="${BORDERS_D}"/>
      <g class="wx"></g><g class="routes"></g><g class="planes"></g></svg>
      <div class="map-labels"></div>
      <div class="map-stats"><div><span>Active routes</span><b>${DATA.routes.length}</b></div><div><span>Destinations</span><b>${DATA.routes.length}</b></div><div><span>Flights today</span><b>${DATA.flightsToday}</b></div><div><span>Passengers today</span><b>${DATA.passengersToday}</b></div></div>
      <div class="map-legend"></div>
      <div class="map-zoom"><button aria-label="Zoom in">${icon('plus')}</button><button aria-label="Zoom out">${icon('minus')}</button></div>
    </div>`;
  const svg = $('svg', el), gR = $('.routes', svg), gP = $('.planes', svg), gW = $('.wx', svg), labels = $('.map-labels', el), legend = $('.map-legend', el);
  if(o.weather === 'yes') gW.innerHTML = DATA.weather.map(w => { const [x, y] = P(w.lat, w.lon); return `<g class="cell"><circle cx="${x}" cy="${y}" r="${w.r}" class="c1"/><circle cx="${x+4}" cy="${y-3}" r="${w.r*.62}" class="c2"/><circle cx="${x+6}" cy="${y-5}" r="${w.r*.3}" class="c3"/></g>`; }).join('');
  let cur = mode;
  function draw(){
    const maxM = Math.max(...R.map(r => r.profit / r.revenue));
    gR.innerHTML = R.map((r, i) => { const d = arc(H, P(r.lat, r.lon)), m = r.profit / r.revenue, w = cur === 'profit' ? 1.2 + 3.2 * m / maxM : cur === 'demand' ? 1.2 : 2;
        const cls = cur === 'profit' ? (m > .5 ? 'p-hi' : m > .3 ? 'p-mid' : 'p-lo') : '';
        return `<path id="rt${i}" class="rt ${cls}" d="${d}" style="stroke-width:${w}"/>`; }).join('')
      + DATA.opportunities.map(r => `<path class="rt opp" d="${arc(H, P(r.lat, r.lon))}"/>`).join('');
    gP.innerHTML = reduce ? R.map((r, i) => `<use href="#top-plane" class="mplane" x="-6" y="-6" width="12" height="12" transform="translate(${((H[0] + P(r.lat, r.lon)[0]) / 2).toFixed(1)} ${((H[1] + P(r.lat, r.lon)[1]) / 2).toFixed(1)})"/>`).join('')
      : R.map((r, i) => `<g class="mplane"><use href="#top-plane" x="-6" y="-6" width="12" height="12"/><animateMotion dur="${7 + i * 1.3}s" begin="-${(i * 1.7).toFixed(1)}s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;1;0" keyTimes="0;.48;.52;1" calcMode="linear"><mpath href="#rt${i}"/></animateMotion></g>`).join('');
    legend.innerHTML = cur === 'profit' ? `<b>Profit margin</b><span><i class="lg p-hi"></i>over 50%</span><span><i class="lg p-mid"></i>30–50%</span><span><i class="lg p-lo"></i>under 30%</span><span><i class="lg opp"></i>possible new route</span>`
      : cur === 'demand' ? `<b>People who want to fly each day</b><span>circle size = demand</span><span><i class="lg opp"></i>possible new route</span>`
      : `<span><i class="dot hub"></i>Hub</span><span><i class="dot dest"></i>Destination</span><span><i class="lg"></i>Active route</span><span><i class="lg opp"></i>Possible new route</span>`;
    place();
  }
  function place(){
    const box = $('.map-wrap', el).getBoundingClientRect(), m = svg.getScreenCTM(); if(!m || !box.width) return;
    const pt = svg.createSVGPoint(), at = (lat, lon) => { [pt.x, pt.y] = P(lat, lon); const s = pt.matrixTransform(m); return [s.x - box.left, s.y - box.top]; };
    const maxD = Math.max(...R.map(r => r.demand), ...DATA.opportunities.map(r => r.people));
    const mk = (lat, lon, cls, name, code, extra, size, side) => { const [x, y] = at(lat, lon); return `<div class="mk ${cls} side-${side || 'r'}" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;${size ? `--s:${size}px` : ''}"><i></i><span><b>${name}</b> <small>${code}</small>${extra ? `<em>${extra}</em>` : ''}</span></div>`; };
    labels.innerHTML = mk(hub.lat, hub.lon, 'hub', hub.city, hub.code, 'Hub', 0, hub.side)
      + R.map(r => mk(r.lat, r.lon, 'dest', r.city, r.code, cur === 'demand' ? `${r.demand} a day` : cur === 'profit' ? `${Math.round(100 * r.profit / r.revenue)}% margin` : '', cur === 'demand' ? Math.round(10 + 34 * r.demand / maxD) : 0, r.side)).join('')
      + DATA.opportunities.map(r => mk(r.lat, r.lon, 'opp', r.city, r.code, cur === 'demand' ? `${r.people} a day` : '', cur === 'demand' ? Math.round(10 + 34 * r.people / maxD) : 0)).join('');
  }
  $$('.map-tabs [data-mode]', el).forEach(b => b.onclick = () => { cur = b.dataset.mode; $$('.map-tabs [data-mode]', el).forEach(x => x.setAttribute('aria-selected', String(x === b))); draw(); });
  let z = 1; const base = vb.split(' ').map(Number);
  const zoom = f => { z = Math.min(2.2, Math.max(1, z * f)); const w = base[2] / z, h = base[3] / z, cx = base[0] + base[2] / 2, cy = base[1] + base[3] / 2; svg.setAttribute('viewBox', `${cx - w/2} ${cy - h/2} ${w} ${h}`); place(); };
  const zb = $$('.map-zoom button', el); zb[0].onclick = () => zoom(1.25); zb[1].onclick = () => zoom(1/1.25);
  window.addEventListener('resize', place); requestAnimationFrame(draw); setTimeout(place, 300);
};

W.fleet = (el, o) => {
  const F = DATA.fleet, T = F.types, tot = T.reduce((a, t) => ({ count: a.count + t.count, service: a.service + t.service, maint: a.maint + t.maint, grounded: a.grounded + t.grounded }), { count:0, service:0, maint:0, grounded:0 });
  const pc = v => (100 * v / tot.count);
  el.innerHTML = `<div class="fleet-rows">${T.map(t => `<div class="frow">
      <svg class="side" viewBox="0 0 220 64" aria-hidden="true"><use href="#side-${t.kind}"/></svg>
      <div class="fname"><b>${t.short}</b><span>${t.seats} seats</span></div>
      <div class="futil" title="Share of the day each plane spends flying"><div class="ubar"><i style="--w:${t.util}%"></i></div><span class="uval">${t.util}% busy</span></div>
      <div class="fcount"><b>${t.count}</b>${t.maint ? `<span class="st warn" title="${t.maint} in maintenance">${icon('wrench')}${t.maint}</span>` : ''}</div></div>`).join('')}</div>
    <div class="fleet-total"><div class="row"><b>Total fleet ${tot.count}</b><span class="muted">On order: ${F.onOrder.name.replace('Airbus ', '')} · ${F.onOrder.arrives.toLowerCase()}</span></div>
      <div class="stack" role="img" aria-label="${tot.service} in service, ${tot.maint} in maintenance, ${tot.grounded} grounded"><i class="s-good" style="--w:${pc(tot.service)}%"></i><i class="s-warn" style="--w:${pc(tot.maint)}%"></i><i class="s-bad" style="--w:${pc(tot.grounded)}%"></i></div>
      <div class="stack-key"><span><i class="s-good"></i>In service <b>${tot.service}</b></span><span><i class="s-warn"></i>Maintenance <b>${tot.maint}</b></span><span><i class="s-bad"></i>Grounded <b>${tot.grounded}</b></span></div></div>`;
  setTimeout(() => $$('.ubar i, .stack i', el).forEach(i => i.classList.add('go')), 80);
};

W.routes = (el, o) => {
  let key = 'revenue';
  const max = { revenue: Math.max(...R.map(r => r.revenue)) };
  function draw(){
    const rows = R.slice().sort((a, b) => key === 'lf' ? b.lf - a.lf : key === 'profit' ? b.profit - a.profit : b.revenue - a.revenue).slice(0, +(o.n || 6));
    $('tbody', el).innerHTML = rows.map((r, i) => `<tr><td class="rk">${i + 1}</td><td class="rname"><b>${DATA.airline.hub.code} → ${r.code}</b><span>${r.city} · ${r.plane}</span></td>
      <td class="seats"><div class="sbar" title="${r.sold} of ${r.seats} seats sold"><i style="--w:${r.lf}%"></i></div><span>${r.sold} / ${r.seats}</span></td>
      <td class="num lf">${r.lf}%</td><td class="num">${money(r.revenue)}</td><td class="num ${r.profit >= 0 ? '' : 'neg'}">${money(r.profit)}</td>
      <td class="tr ${r.trend >= 0 ? 'good' : 'bad'}">${r.trend >= 0 ? '▲' : '▼'} ${Math.abs(r.trend)}%</td></tr>`).join('');
    setTimeout(() => $$('.sbar i', el).forEach(i => i.classList.add('go')), 60);
  }
  el.innerHTML = `<div class="ph-tools"><label class="sel">Sort by <select><option value="revenue">Revenue</option><option value="lf">Seats filled</option><option value="profit">Profit</option></select></label></div>
    <table class="rtable"><thead><tr><th>#</th><th>Route</th><th>Seats sold</th><th class="num">Filled</th><th class="num">Revenue</th><th class="num">Profit</th><th>Trend</th></tr></thead><tbody></tbody></table>`;
  $('select', el).onchange = e => { key = e.target.value; draw(); };
  draw();
};

/* Finance: revenue and cost columns with a profit line, one £ axis, legend + hover tooltip. */
W.finance = (el, o) => {
  const h = DATA.history; let n = 12;
  el.innerHTML = `<div class="ph-tools"><div class="seg" role="tablist"><button data-n="6" aria-selected="false">6 rounds</button><button data-n="12" aria-selected="true">12 rounds</button></div></div>
    <div class="fin-legend"><span><i class="sw s1"></i>Revenue</span><span><i class="sw s2"></i>Costs</span><span><i class="sw ln s3"></i>Profit</span></div>
    <div class="fin-chart"><svg></svg><div class="tip" hidden></div></div>`;
  const box = $('.fin-chart', el), svg = $('svg', box), tip = $('.tip', box);
  function draw(){
    const W0 = box.clientWidth, H0 = box.clientHeight; if(!W0 || !H0) return;
    svg.setAttribute('viewBox', `0 0 ${W0} ${H0}`); svg.setAttribute('width', W0); svg.setAttribute('height', H0);
    const s = h.rounds.length - n, rounds = h.rounds.slice(s), rev = h.revenue.slice(s), cost = h.costs.slice(s), prof = rev.map((v, i) => v - cost[i]);
    const L = 54, Rr = 16, T = 12, B = 26, top = Math.ceil(Math.max(...rev) / 5000) * 5000, Y = v => T + (H0 - T - B) * (1 - v / top), slot = (W0 - L - Rr) / rounds.length;
    const bw = Math.min(14, (slot - 8) / 2), cx = i => L + slot * i + slot / 2;
    let g = '';
    for(let v = 0; v <= top; v += top / 4) g += `<line class="grid" x1="${L}" x2="${W0 - Rr}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ax" x="${L - 8}" y="${Y(v) + 4}" text-anchor="end">${v === 0 ? '£0' : '£' + (v / 1000) + 'k'}</text>`;
    const bar = (x, v, c) => { const y = Y(v), hh = Y(0) - y, r = Math.min(4, hh); return `<path class="${c}" d="M${x} ${Y(0)} V${y + r} Q${x} ${y} ${x + r} ${y} H${x + bw - r} Q${x + bw} ${y} ${x + bw} ${y + r} V${Y(0)} Z"/>`; };
    rounds.forEach((r, i) => { g += bar(cx(i) - bw - 1, rev[i], 'b1') + bar(cx(i) + 1, cost[i], 'b2'); if(n <= 6 || i % 2 === 1 || i === rounds.length - 1) g += `<text class="ax" x="${cx(i)}" y="${H0 - 8}" text-anchor="middle">R${r}</text>`; });
    const pts = prof.map((v, i) => `${cx(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
    g += `<polyline class="pline" points="${pts}"/>` + prof.map((v, i) => `<circle class="pdot" cx="${cx(i)}" cy="${Y(v)}" r="${i === prof.length - 1 ? 5 : 3.5}"/>`).join('');
    g += `<text class="endlab" x="${cx(prof.length - 1) - 8}" y="${Y(prof[prof.length - 1]) - 12}" text-anchor="end">${money(prof[prof.length - 1])} profit</text>`;
    g += rounds.map((r, i) => `<rect class="hit" x="${L + slot * i}" y="${T}" width="${slot}" height="${H0 - T - B}" data-i="${i}"/>`).join('');
    svg.innerHTML = g;
    $$('.hit', svg).forEach(rc => { rc.onmouseenter = () => { const i = +rc.dataset.i; tip.hidden = false; tip.innerHTML = `<b>Round ${rounds[i]}</b><span><i class="sw s1"></i>Revenue <b>${money(rev[i])}</b></span><span><i class="sw s2"></i>Costs <b>${money(cost[i])}</b></span><span><i class="sw ln s3"></i>Profit <b>${money(prof[i])}</b></span>`;
        const x = cx(i); tip.style.left = Math.min(W0 - 190, Math.max(0, x - 90)) + 'px'; tip.style.top = '4px'; rc.classList.add('on'); };
      rc.onmouseleave = () => { tip.hidden = true; rc.classList.remove('on'); }; });
  }
  $$('[data-n]', el).forEach(b => b.onclick = () => { n = +b.dataset.n; $$('[data-n]', el).forEach(x => x.setAttribute('aria-selected', String(x === b))); draw(); });
  window.addEventListener('resize', draw); requestAnimationFrame(draw);
};

W.fuel = (el, o) => {
  const f = DATA.fuel, pc = v => (100 * v / f.capacity).toFixed(1), d = f.priceToday - f.avgPaid;
  el.innerHTML = `<div class="tank-wrap"><div class="tank-head"><span class="label">Fuel in the tank</span><b><span data-count="${f.stock}">0</span> L <small>of ${num(f.capacity)} L</small></b></div>
      <div class="tank" role="img" aria-label="${f.stock} litres of ${f.capacity}; today's trips use ${f.todayUse}"><i class="keep" style="--w:${pc(f.stock - f.todayUse)}%"></i><i class="use" style="--l:${pc(f.stock - f.todayUse)}%;--w:${pc(f.todayUse)}%"></i></div>
      <div class="tank-key"><span><i class="use"></i>Today's trips use ${num(f.todayUse)} L</span><span><i class="keep"></i>Left after today ${num(f.stock - f.todayUse)} L</span></div></div>
    <div class="fuel-prices"><div><span class="label">Price today</span><b class="money">${money(f.priceToday, 2)}<small>/L</small></b></div><div><span class="label">You paid (average)</span><b>${money(f.avgPaid, 2)}<small>/L</small></b></div>
      <div class="fp-spark"><span class="label">Price by round</span>${spark(DATA.history.fuelPrice, css('--kpi-spark-cost') || '#f80', 150, 38)}</div></div>
    ${o.ops === 'no' ? '' : `<div class="ops-chips"><span class="chip good">${icon('check')} Ready <b>${DATA.ops.ready}</b></span><span class="chip info">${icon('users')} Boarding <b>${DATA.ops.boarding}</b></span><span class="chip warn">${icon('clock')} Delayed <b>${DATA.ops.delayed}</b></span><span class="chip bad">${icon('alert')} Grounded <b>${DATA.ops.grounded}</b></span></div>`}`;
};

W.alerts = (el, o) => {
  el.innerHTML = `<ul class="alerts">${DATA.alerts.slice(0, +(o.n || 5)).map((a, i) => `<li class="al ${a.kind}" style="--i:${i}"><span class="al-ic">${icon(a.icon)}</span><div><b>${esc(a.title)}</b><span>${esc(a.sub)}</span></div><time>${a.time}</time></li>`).join('')}</ul>`;
};

W.ring = (el, o) => {
  const v = o.k === 'lf' ? Math.round(100 * SUM.sold / SUM.seats) : o.k === 'fleet' ? Math.round(100 * 6 / 7) : +o.v, r = 52, c = 2 * Math.PI * r;
  const label = o.label || (o.k === 'lf' ? 'Seats filled' : 'Planes flying');
  el.innerHTML = `<svg viewBox="0 0 132 132" class="ring" role="img" aria-label="${label}: ${v}%"><circle cx="66" cy="66" r="${r}" class="track"/><circle cx="66" cy="66" r="${r}" class="val" style="--dash:${(c * v / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 66 66)"/>
    <text x="66" y="66" class="rv">${v}%</text><text x="66" y="88" class="rl">${o.small || ''}</text></svg><div class="ring-cap">${label}${o.k === 'lf' ? `<span>${SUM.sold} of ${SUM.seats} seats today</span>` : o.k === 'fleet' ? '<span>6 of 7 planes flying</span>' : ''}</div>`;
};

W.board = (el, o) => {
  const dep = o.k !== 'arr', list = dep ? DATA.departures : DATA.arrivals;
  const short = s => s.replace(/ \d+m$/, ''), st = s => /Delayed/.test(s) ? 'warn' : /Boarding|Landing/.test(s) ? 'info' : /Departed|Arrived/.test(s) ? 'muted' : 'good';
  el.innerHTML = `<table class="board"><thead><tr><th>Time</th><th>Flight</th><th>${dep ? 'To' : 'From'}</th><th>${dep ? 'Gate' : 'Belt'}</th><th>Status</th></tr></thead><tbody>${list.map(f => `<tr><td class="mono">${f.time}</td><td class="mono">${f.flight}</td><td>${dep ? f.to : f.from} <small>${f.code}</small></td><td class="mono">${dep ? f.gate : f.belt}</td><td><span class="bst ${st(f.status)}" title="${f.status}"><i></i>${short(f.status)}</span></td></tr>`).join('')}</tbody></table>`;
};

W.objectives = el => {
  el.innerHTML = `<ul class="objs">${DATA.objectives.map(ob => { const p = Math.min(100, Math.round(100 * ob.cur / ob.goal)), f = v => ob.fmt === '£' ? money(v) : ob.fmt === 'star' ? v.toFixed(1) + '★' : v;
    return `<li><div class="row"><b>${ob.label}</b><span class="pv">${p}%</span></div><div class="obar"><i style="--w:${p}%"></i></div><span class="muted">${f(ob.cur)} of ${f(ob.goal)}</span></li>`; }).join('')}</ul>`;
  setTimeout(() => $$('.obar i', el).forEach(i => i.classList.add('go')), 80);
};

const SKY = { rome:'M0 70 H20 V52 H28 V60 H36 V40 Q48 22 60 40 V60 H70 V50 H80 V58 H96 V44 H104 V70 Z', bcn:'M0 70 H14 V54 H22 V30 L26 20 L30 30 V54 H40 V36 L44 24 L48 36 V54 H60 V48 H74 V58 H90 V46 H104 V70 Z', rak:'M0 70 H18 V56 H30 V30 H40 V24 H44 V30 H54 V56 H66 V50 Q74 42 82 50 V58 H104 V70 Z' };
W.opps = el => {
  el.innerHTML = `<div class="opps">${DATA.opportunities.map(r => `<article class="opp-card"><svg class="sky" viewBox="0 0 104 70" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="sk${r.code}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky-a)"/><stop offset="1" stop-color="var(--sky-b)"/></linearGradient></defs><rect width="104" height="70" fill="url(#sk${r.code})"/><path d="${SKY[r.sky]}" fill="var(--sky-city)"/></svg>
    <div class="opp-body"><div class="row"><b class="code">${r.code}</b><span class="tagp">${r.tag}</span></div><span class="city">${r.city}</span>
    <div class="row est"><span>About ${r.people} people a day</span></div><div class="row est"><span>Est. revenue a round</span><b>${money(r.est)}</b></div><button class="btn small">Evaluate route ${icon('arrowR')}</button></div></article>`).join('')}</div>`;
};

W.ratings = el => {
  el.innerHTML = `<div class="rate-head"><b>${(DATA.ratings.reduce((t, r) => t + r.v, 0) / DATA.ratings.length).toFixed(1)}</b><span>/ 5</span>${stars(DATA.reputation)}<span class="trend good"><b>▲</b> +0.2</span></div>
    <ul class="rates">${DATA.ratings.map(r => `<li><span>${r.label}</span><div class="rbar"><i style="--w:${r.v / 5 * 100}%"></i></div><b>${r.v.toFixed(1)}</b></li>`).join('')}</ul>`;
  setTimeout(() => $$('.rbar i', el).forEach(i => i.classList.add('go')), 80);
};

/* Passengers by round: one series, so no legend box - the title names it. Hover shows the value. */
W.demand = el => {
  const h = DATA.history, mx = Math.max(...h.passengers);
  el.innerHTML = `<div class="dchart">${h.passengers.map((v, i) => `<div class="dcol" title="Round ${h.rounds[i]}: ${v} passengers a day"><i style="--h:${(100 * v / mx).toFixed(1)}%"></i><span>${i % 3 === 2 || i === h.passengers.length - 1 ? 'R' + h.rounds[i] : ''}</span></div>`).join('')}</div>`;
  setTimeout(() => $$('.dcol i', el).forEach(i => i.classList.add('go')), 80);
};

W.decision = (el, o) => {
  el.innerHTML = `<span class="label">${DATA.decision.title}</span><p>${esc(DATA.decision.text)}</p><button class="btn-start">${o.text || 'Start the day'} ${icon('arrowR')}</button>`;
};

/* Route profit as horizontal bars (one series: profit), margin band shown by the label. */
W.profitbars = el => {
  const rows = R.slice().sort((a, b) => b.profit - a.profit), mx = Math.max(...rows.map(r => r.profit));
  el.innerHTML = `<ul class="pbars">${rows.map((r, i) => `<li><span class="pn"><i>${i + 1}</i>${r.city} <small>${r.code}</small></span><div class="pbar"><i style="--w:${(100 * r.profit / mx).toFixed(1)}%"></i></div><b>${money(r.profit)}</b></li>`).join('')}</ul>`;
  setTimeout(() => $$('.pbar i', el).forEach(i => i.classList.add('go')), 80);
};
W.stars = el => { el.innerHTML = stars(DATA.reputation); };

/* ---------- boot ---------- */
window.HQ = { W, icon, money, countUp };
document.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML('afterbegin', SIDE);
  $$('[data-icon]').forEach(e => e.insertAdjacentHTML('afterbegin', icon(e.dataset.icon)));
  $$('[data-w]').forEach(e => { try{ W[e.dataset.w](e, e.dataset); }catch(err){ console.error(e.dataset.w, err); } });
  countUp(document);
  $$('[role=tablist]:not(.map-tabs):not(.seg)').forEach(tl => $$('button', tl).forEach(b => b.addEventListener('click', () => $$('button', tl).forEach(x => x.setAttribute('aria-selected', String(x === b))))));
  $$('.sim [data-speed]').forEach(b => b.onclick = () => $$('.sim [data-speed]').forEach(x => x.setAttribute('aria-pressed', String(x === b))));
});
})();
