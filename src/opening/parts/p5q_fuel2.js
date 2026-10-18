/* =====================================================================
   THE FUEL DESK, BATCH 2 (Claude Design handover 18 Oct: 3.6 Option A "position first, left column"; DESIGN.md "Desks
   decided 18 Oct"). Year one only; later weeks keep the desk as it was (p4y, p4zu, p4zr, p5c).
   Three square-cornered panels. Title "Fuel desk" with one line and a "How the fuel market works ›" link (instead of the
   Learn more and Fuel outlook tiles).
   - Left, 60%: Your position, the largest panel: a big square tank (what is in it, of the storage) with this week's need
     as a dashed line; four figures (In the tank, This week needs, Already secured, Still to buy in amber); the covered bar
     and the note. The purchase order directly under it: the same blocks, sum and Confirm as before (p4y, p4zr, p5c).
   - Right, 40%: one Market panel: the chart with next week's range as a band, one summary line, the two news lines.
   - Gone from the page: the outlook, forecast and confidence tiles and the two news panels. The scenario table and the
     fuel-by-route sheet are not one of the three panels: they open from "Buy now or wait? ›" in the Market panel.
   - First visit: a three-step tour; one panel at a time takes the active gradient and the cyan rail, with a callout
     under it ("1 of 3", Next ▶). Nothing is dimmed and nothing turns amber.
   ===================================================================== */
const FD2_TOUR = [['fd2-pos', 'Your position:', 'what is in the tank, what this week needs and what is still to buy. Start here.'],
  ['fd2-mk', 'Market:', "today's price, where it is heading next week, and why."],
  ['fd-ord', 'Place a purchase order:', 'choose how many blocks to buy, work out what they cost, then confirm.']];
const fd2On = () => !!S && yearOne() && weekMode();
function fd2TourStep(){ const T = S.fd2Tour; return T && T.step && !T.done ? T.step : 0; }
function fd2Callout(i){ const [, b, t] = FD2_TOUR[i - 1];
  return `<div class="fd2-tour" role="note"><p><b>${b}</b> ${esc(t)}</p><span>${i} of ${FD2_TOUR.length}</span><button class="bv-btn fd2-next" id="fd2Next">${i < FD2_TOUR.length ? 'Next' : 'Got it'} &#9654;</button></div>`; }
/* the tank: square, the storage it holds, this week's need as a dashed line; the level rises after an order */
function fd2Tank(inTank, cap, need){
  const W = 124, H = 160, top = 10, bot = 38, h = H - top - bot, lv = v => top + h * (1 - Math.max(0, Math.min(1, v / cap)));
  const was = UI.fd2Was && UI.fd2Was.day === S.day ? UI.fd2Was.v : inTank, y1 = lv(inTank), y0 = lv(was), ny = lv(need), lab = need > 0 && need <= cap;
  return `<svg class="fd2-tank" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tank: ${num(inTank)} L of ${num(cap)} L${lab ? `; this week needs ${num(need)} L` : ''}">
    <rect x="1" y="1" width="${W - 2}" height="${H - 2}" class="tk-b"/><rect x="1" y="1" width="${W - 2}" height="7" class="tk-lid"/>
    <rect x="6" y="${y1}" width="${W - 12}" height="${top + h - y1}" class="tk-f" style="--y0:${y0}px;--h0:${top + h - y0}px"/>
    ${lab ? `<line x1="6" x2="${W - 6}" y1="${ny}" y2="${ny}" class="tk-need"/><text x="${W / 2}" y="${ny - 6}" text-anchor="middle" class="tk-nl">this week ${num(need)} L</text>` : ''}
    <text x="${W / 2}" y="${H - 21}" text-anchor="middle" class="tk-v">${num(inTank)} L</text><text x="${W / 2}" y="${H - 8}" text-anchor="middle" class="tk-c">of ${num(cap)}</text></svg>`; }
/* the chart: this month's price, today's dot, this week flat to Sunday, next week's range as a band */
function fd2Chart(day){
  const m = fdMarket(day), P0 = fuelOn(day), a = Math.max(1, day - 27), wkEnd = day + (7 - ((day - 1) % 7)) - 1, nxA = wkEnd + 1, nxB = wkEnd + 7, lo = m.forecastLow, hi = m.forecastHigh, band = lo !== undefined && lo !== null && hi !== undefined && hi !== null;
  const hist = []; for(let d = a; d <= day; d++) hist.push([d, fuelOn(d)]);
  const ys = hist.map(x => x[1]).concat(band ? [lo, hi] : [P0]), y0 = Math.min(...ys) - 0.06, y1 = Math.max(...ys) + 0.1;
  const W = 520, H = 250, l = 8, r = 8, t = 34, b = 14, end = band ? nxB : wkEnd, X = d => l + (W - l - r) * (d - a) / Math.max(1, end - a), Y = v => t + (H - t - b) * (y1 - v) / Math.max(0.01, y1 - y0);
  const line = hist.map(([d, v], i) => `${i ? 'L' : 'M'}${X(d).toFixed(1)} ${Y(v).toFixed(1)}`).join(' '), grid = [0, 1, 2, 3, 4].map(k => t + (H - t - b) * k / 4);
  return `<svg class="fd2-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Jet fuel price this month: ${priceL(P0)} a litre today${band ? `; next week ${priceL(lo)} to ${priceL(hi)}` : ''}">
    ${grid.map(y => `<line x1="0" x2="${W}" y1="${y}" y2="${y}" class="gl"/>`).join('')}
    ${band ? `<path d="M${X(wkEnd)} ${Y(P0)} L${X(nxA)} ${Y(hi)} L${X(nxB)} ${Y(hi)} L${X(nxB)} ${Y(lo)} L${X(nxA)} ${Y(lo)} Z" class="band"/><line x1="${X(nxA)}" x2="${X(nxB)}" y1="${Y(hi)}" y2="${Y(hi)}" class="bedge"/><line x1="${X(nxA)}" x2="${X(nxB)}" y1="${Y(lo)}" y2="${Y(lo)}" class="bedge"/><text x="${W - 10}" y="${Math.max(16, Y(hi) - 10)}" text-anchor="end" class="bl">next week ${priceL(lo)}–${priceL(hi)}</text>` : ''}
    <path d="${line}" class="ln"/><path d="M${X(day)} ${Y(P0)} H${X(wkEnd)}" class="wk"/><circle cx="${X(day)}" cy="${Y(P0)}" r="6" class="pt"/></svg>`; }
function fd2Market(day){
  const m = fdMarket(day), P0 = fuelOn(day), lo = m.forecastLow, hi = m.forecastHigh, conf = String(m.forecastConfidence || '').toLowerCase(), band = lo !== undefined && lo !== null;
  const sig = m.fuelHeadline2 || (m.weather && m.weather !== 'Clear' ? `Weather: ${m.weather}.` : m.headline) || '';
  return `<section class="bv-panel fd2-mk"><div class="fd2-ph"><h2>Market</h2><span>£ per litre · 1M</span></div><div class="fd2-cw">${fd2Chart(day)}</div>
    <p class="fd2-sum">Today <b>${priceL(P0)}</b> a litre${band ? ` · next week <b>${priceL(lo)}–${priceL(hi)}</b>` : ''}${conf ? ` · <span class="fd2-cf ${conf}">${esc(conf)} confidence</span>` : ''}</p>
    <div class="fd2-news"><p><span class="bv-eyebrow">News</span> ${esc(m.fuelHeadline || 'Prices are steady.')}</p>${sig ? `<p><span class="bv-eyebrow">Signal</span> ${esc(sig)}</p>` : ''}</div>
    <p class="fd2-more"><button class="fd2-a" id="fd2Scen">Buy now or wait? ›</button></p></section>`; }
function fd2Position(day, farm){
  const cap = tankCapacity(), need = fdNeed(day), inTank = Math.round(S.fuel), layers = fdLayers(), still = Math.max(0, Math.round(need.week - inTank)), cover = need.week ? Math.min(100, Math.round(100 * inTank / need.week)) : 100;
  const W = typeof fsStorageWords === 'function' ? fsStorageWords() : null, top = Math.round(100 * (WORLD.fuelTopUp !== undefined ? WORLD.fuelTopUp : 0.1));
  const fig = (l, v, cls) => `<div class="fd2-f ${cls || ''}"><small>${l}</small><b>${v}</b></div>`;
  return `<section class="bv-panel fd-pos fd2-pos"><div class="fd2-ph"><h2>Your position</h2><span>this week: ${fmtRange(day, day + need.days - 1)}</span></div><div class="fd2-pg">${fd2Tank(inTank, cap, Math.round(need.week))}
    <div class="fd2-pr"><div class="fd2-fs">${fig('In the tank', num(inTank) + ' L')}${fig('This week needs', num(Math.round(need.week)) + ' L')}${fig('Already secured', layers.length ? layers.map(x => `${num(x.L)} L at ${priceL(x.p)}`).join(', ') : 'nothing yet', layers.length > 1 ? 'long' : '')}${fig('Still to buy', num(still) + ' L', still > 0 ? 'amber' : 'green')}</div>
      <div class="fd2-bar" role="img" aria-label="${cover}% of this week's fuel is in the tank"><i style="width:${cover}%"></i></div>
      <p class="fd2-note"><b class="green">${cover}% covered</b> · Fuel not in the tank is bought on the day at the day's price + ${top}p.</p>
      ${W ? `<p class="fd2-store">Storage ${W.text}${W.weeks ? ` — ${W.weeks}` : ''}</p>` : ''}${farm || ''}</div></div></section>`; }
const fd2Html0 = fuelDeskHtml;
fuelDeskHtml = function(asView){
  const h = fd2Html0(asView); if(!fd2On()) return h;
  const T = document.createElement('template'); T.innerHTML = h; const fd = T.content.querySelector('.fd'); if(!fd) return h;
  const pick = sel => { const e = T.content.querySelector(sel); return e ? e.outerHTML : ''; };
  const dialogs = [...fd.children].filter(e => !e.classList.contains('fd-l') && !e.classList.contains('fd-rc')).map(e => e.outerHTML).join('');
  const day = S.day || 1, ord = T.content.querySelector('.fd-ord'), side = T.content.querySelector('.fd-sc, .fd-ls');
  if(ord){ const sub = ord.querySelector('.dk-pnl-h .sub'); if(sub) sub.classList.add('fd2-today'); ord.classList.remove('dk-pnl'); ord.classList.add('bv-panel');
    // the blocks and More on one row; Fill the tank and what limits it on the next (the price per block is in the heading; the tank shows its room)
    const lim = ord.querySelector('.fd-lim'), blocks = ord.querySelector('.fd-blocks'), fill = blocks && blocks.querySelector('.fs-fill'), b4 = blocks && blocks.querySelector('[data-fdb="4"]');
    // 0 to 5 blocks, as the mock-up has them (a week of flying is often just over 4 blocks); More still steps beyond
    if(b4 && !blocks.querySelector('[data-fdb="5"]')){ const n = 5, max = fdMaxBlocks(fuelOn(day)), sel = UI.fd && UI.fd.selNow; b4.insertAdjacentHTML('afterend', `<button class="fd-b ${sel === n ? 'on' : ''}" data-fdb="${n}" ${n > max ? 'disabled' : ''}>${num(n * fuelBlock())} L</button>`); }
    if(lim) lim.innerHTML = lim.innerHTML.replace(/^Blocks of [^·]*·\s*room in the tank for [\d,]+ L;\s*([a-z])/, (m, c) => c.toUpperCase()).replace(/^Blocks of [^·]*·\s*room/, 'Room');
    if(blocks && (fill || lim)){ const row = document.createElement('div'); row.className = 'fd2-row2'; if(fill) row.appendChild(fill); if(lim) row.appendChild(lim); blocks.after(row); } }
  const scen = UI.fd2Scen && side ? `<div class="fd2-dlg" role="dialog" aria-label="Buy now or wait?">${side.outerHTML}<button class="bv-btn" id="fd2ScenX">Close</button></div>` : '';
  const step = fd2TourStep(), html = `<div class="fd fd2">${dialogs}${scen}<div class="fd2-l">${fd2Position(day, pick('.fs-farm-l'))}${ord ? ord.outerHTML : ''}</div><div class="fd2-r">${fd2Market(day)}</div></div>`;
  if(!step) return html;
  // the tour: the panel being explained takes the active look and the callout
  const [cls] = FD2_TOUR[step - 1], T2 = document.createElement('template'); T2.innerHTML = html; const p = T2.content.querySelector('.' + cls);
  if(p){ p.classList.add('fd2-on'); p.insertAdjacentHTML('beforeend', fd2Callout(step)); }
  return T2.innerHTML;
};
const fd2Render0 = renderFuelDesk;
renderFuelDesk = function(asView){
  if(fd2On() && !S.fd2Tour){ S.fd2Tour = { step:1, day:S.day }; try{ save(); }catch(e){} }
  fd2Render0(asView); if(!fd2On()) return;
  const root = screen(), head = root.querySelector('.fd-page .dp-head');
  if(head) head.innerHTML = `<div class="dp-tt fd2-tt"><h1>Fuel desk</h1><p>Watch the market, secure fuel and manage your storage.</p></div><button class="fd2-a fd2-learn" id="fd2Learn">How the fuel market works ›</button>`;
  root.querySelector('.fd-page') && root.querySelector('.fd-page').classList.add('fd2-page');
  on('fd2Learn', () => { UI.fd.learn = true; render(); });
  on('fd2Scen', () => { UI.fd2Scen = true; render(); }); on('fd2ScenX', () => { UI.fd2Scen = false; render(); });
  on('fd2Next', () => { const T = S.fd2Tour || {}; if((T.step || 0) >= FD2_TOUR.length) S.fd2Tour = { done:S.day }; else S.fd2Tour = { step:(T.step || 0) + 1, day:T.day }; save(); render(); });
  UI.fd2Was = { v:Math.round(S.fuel), day:S.day };
};
