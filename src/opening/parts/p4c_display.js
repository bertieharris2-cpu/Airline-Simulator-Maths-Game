/* ==================================================================
   OPERATIONS WALL (IWB) and the shared map. The wall shows the situation, the HQ shows the numbers
   and the decisions. Both are drawn from the same state S (one game, two views).
   ================================================================== */
const SVGNS = 'http://www.w3.org/2000/svg', RAD = Math.PI/180, U = 10, MAPB = {lonMin:-180, latMax:79}, MW = 3600, MH = 1350, BEND = 0.7;
const mx = lon => (lon - MAPB.lonMin)*U, my = lat => (MAPB.latMax - lat)*U;
function el(tag, attrs, parent){ const e = document.createElementNS(SVGNS, tag); for(const k in attrs) e.setAttribute(k, attrs[k]); if(parent) parent.appendChild(e); return e; }
const paths = {};
function vec(lat, lon){ return [Math.cos(lat*RAD)*Math.cos(lon*RAD), Math.cos(lat*RAD)*Math.sin(lon*RAD), Math.sin(lat*RAD)]; }
function pathFor(r){
  if(paths[r.id] && paths[r.id].home===homeData().id) return paths[r.id];
  const h = homeData(), A = vec(h.lat,h.lon), B = vec(r.lat,r.lon), N = 64, pts = [], len = [0];
  const w = Math.acos(Math.min(1, A[0]*B[0]+A[1]*B[1]+A[2]*B[2])), s = Math.sin(w);
  for(let i=0;i<=N;i++){ const t=i/N; let lat = h.lat+(r.lat-h.lat)*t, lon = h.lon+(r.lon-h.lon)*t;
    if(s>1e-6){ const a=Math.sin((1-t)*w)/s, b=Math.sin(t*w)/s, p=[a*A[0]+b*B[0], a*A[1]+b*B[1], a*A[2]+b*B[2]]; const glat=Math.asin(p[2])/RAD, glon=Math.atan2(p[1],p[0])/RAD; lat += (glat-lat)*BEND; lon += (glon-lon)*BEND; }
    pts.push([mx(lon), my(lat)]); if(i) len.push(len[i-1]+Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1])); }
  return (paths[r.id] = {pts, len, total:len[N], home:homeData().id});
}
function along(P, t){ const target = P.total*t; let i=1; while(i<P.pts.length-1 && P.len[i]<target) i++; const a=P.pts[i-1], b=P.pts[i], f=clamp((target-P.len[i-1])/((P.len[i]-P.len[i-1])||1),0,1); return {x:a[0]+(b[0]-a[0])*f, y:a[1]+(b[1]-a[1])*f, deg:Math.atan2(b[1]-a[1], b[0]-a[0])/RAD}; }
function lastDay(){ return S && S.history.length ? S.history[S.history.length-1] : null; }

/* One map = one camera on the shared world outline (#worldShape). Layers: routes, demand (circle size only,
   never a number), profit (route colour from the last finished day), opps (routes you could open, dashed).
   focus = a route id: zoom to it, flash it, dim the rest (the wall's alert). */
function makeMap(root, o){
  o = Object.assign({ scale:1, planes:false, grid:false, controls:true }, o || {});
  root.classList.add('mapbox');
  root.innerHTML = `<svg class="mapsvg" xmlns="${SVGNS}" aria-label="Route map"><g class="mworld"><rect x="0" y="0" width="${MW}" height="${MH}" class="ocean"/><use href="#worldShape"/></g><g class="mlines"></g><g class="mmarks"></g><g class="mplanes"></g></svg>`
    + (o.controls ? '<div class="zoomBtns"><button class="btn" data-z="in" aria-label="Zoom in">+</button><button class="btn" data-z="out" aria-label="Zoom out">&minus;</button><button class="btn world" data-z="fit" aria-label="Fit my routes">ROUTES</button><button class="btn world" data-z="world" aria-label="Whole world">WORLD</button></div>' : '');
  const svg = root.querySelector('svg'), worldG = svg.querySelector('.mworld'), linesG = svg.querySelector('.mlines'), marksG = svg.querySelector('.mmarks'), planesG = svg.querySelector('.mplanes');
  if(o.grid){ const g = el('g',{'class':'mapgrid'}, worldG); for(let x=0;x<=MW;x+=90) el('line',{x1:x,y1:0,x2:x,y2:MH}, g); for(let y=0;y<=MH;y+=90) el('line',{x1:0,y1:y,x2:MW,y2:y}, g); }
  const M = { o, cam:{k:1, tx:0, ty:0}, fitK:1, ui:1, manual:false, key:'', layer:'routes', focus:null };
  const size = () => ({ w: svg.clientWidth, h: svg.clientHeight });
  function clampCam(){ const s = size(), c = M.cam, w = MW*c.k, h = MH*c.k; if(c.k < M.fitK) c.k = M.fitK; c.tx = w <= s.w ? (s.w-w)/2 : Math.min(0, Math.max(s.w-w, c.tx)); c.ty = h <= s.h ? (s.h-h)/2 : Math.min(0, Math.max(s.h-h, c.ty)); }
  function fitWorld(){ const s = size(); M.fitK = Math.min(s.w/MW, s.h/MH) || 0.1; M.cam.k = M.fitK; clampCam(); M.ui = clamp(Math.min(s.w/900, s.h/420), 0.7, 1.3) * o.scale; }
  function fitBounds(pts, tight){ const s = size(); let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity; pts.forEach(p=>{x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);});
    const pf = o.pad || 1, padX = Math.max((tight ? 110 : 150)*pf, (x1-x0)*0.25), padY = Math.max((tight ? 90 : 130)*pf, (y1-y0)*0.35); x0-=padX; x1+=padX; y0-=padY; y1+=padY;
    const ins = o.inset || { t:0, b:0, l:0, r:0 }, aw = Math.max(50, s.w - ins.l - ins.r), ah = Math.max(50, s.h - ins.t - ins.b);
    const k = clamp(Math.min(aw/(x1-x0), ah/(y1-y0)), M.fitK, M.fitK*(o.maxZoom || 14)); M.cam.k = k; M.cam.tx = ins.l + aw/2 - (x0+x1)/2*k; M.cam.ty = ins.t + ah/2 - (y0+y1)/2*k; clampCam(); }
  function zoomAt(sx, sy, f){ const c = M.cam, k = clamp(c.k*f, M.fitK, M.fitK*(o.maxZoom || 14)); c.tx = sx-(sx-c.tx)*(k/c.k); c.ty = sy-(sy-c.ty)*(k/c.k); c.k = k; clampCam(); M.manual = true; M.render(); }
  const toS = p => [M.cam.tx + p[0]*M.cam.k, M.cam.ty + p[1]*M.cam.k];
  function marker(d, cls, label){
    const ui = M.ui, H = Math.round(22*ui), a = FLAG_ASPECT[d.flag]||1.5, W = Math.round(H*a), fs = Math.round(14*ui);
    const g = el('g', {'class':'marker '+cls});
    if(cls.includes('home')){ const pts=[]; for(let i=0;i<10;i++){ const ang=(-90+i*36)*RAD, rr=i%2?5*ui:12*ui; pts.push((rr*Math.cos(ang)).toFixed(1)+','+(rr*Math.sin(ang)).toFixed(1)); } el('polygon',{points:pts.join(' '), fill:S.airline.c1||'#ffc83d', stroke:'#081d3d','stroke-width':2.5}, g); const t = el('text',{'class':'lbl', x:0, y:-16*ui, 'text-anchor':'middle','font-size':fs}, g); t.textContent = label; return g; }
    el('line',{'class':'leader', x1:0,y1:0,x2:0,y2:-H*1.1}, g);
    const b = el('g',{transform:`translate(0 ${-H*1.1 - H/2})`}, g);
    el('use',{href:'#flag-'+d.flag, x:-W/2, y:-H/2, width:W, height:H}, b); el('rect',{'class':'frame', x:-W/2, y:-H/2, width:W, height:H, rx:2}, b);
    const t = el('text',{'class':'lbl', x:0, y:-H/2-5, 'text-anchor':'middle','font-size':fs}, b); t.textContent = label;
    el('circle',{'class':'dot', r:4*ui}, g);
    return g;
  }
  M.autoFit = function(force){
    if(!S) return;
    const ids = S.phase==='setup' && !ownedRoutes().length ? WORLD.setupRoutes : ownedRoutes();
    let list = M.focus ? [M.focus] : ids.slice();
    if(!M.focus && M.layer === 'opps') list = list.concat(WORLD.routes.filter(r => routeOpen(r)).map(r => r.id));
    const key = list.join(',')+'|'+homeData().id+'|'+(M.focus||'')+'|'+M.layer;
    if(!force && key === M.key && M.manual) return; if(key !== M.key) M.manual = false; M.key = key;
    const h = homeData(), pts = [[mx(h.lon), my(h.lat)]].concat(list.map(id => { const r = routeById(id); return [mx(r.lon), my(r.lat)]; }));
    fitWorld(); if(pts.length > 1) fitBounds(pts, !!M.focus);
  };
  M.render = function(){
    if(!S || !S.airline) return; const s = size(); if(!s.w || !s.h) return;
    const c = M.cam; worldG.setAttribute('transform', `matrix(${c.k} 0 0 ${c.k} ${c.tx} ${c.ty})`);
    linesG.textContent = ''; marksG.textContent = ''; planesG.textContent = '';
    const owned = ownedRoutes(), last = lastDay(), L = M.layer, F = M.focus;
    WORLD.routes.forEach(r => {
      const mine = owned.includes(r.id); if(!mine && !routeOpen(r)) return;      // nothing before it is unlocked
      const P = pathFor(r), pts = P.pts.map(p => { const q = toS(p); return q[0].toFixed(1)+','+q[1].toFixed(1); }).join(' '), dim = F && r.id !== F ? ' dim' : '';
      if(mine){
        let cls = 'route';
        if(L === 'profit'){ const x = last && last.routes && last.routes[r.id]; cls += x ? (x.profit >= 0 ? ' gain' : ' loss') : ' nodata'; }
        if(F === r.id) cls += ' alert';
        el('polyline',{'class':'routeHalo'+dim, points:pts}, linesG); el('polyline',{'class':cls+dim, points:pts}, linesG);
      } else if(L === 'opps' || (S.phase==='setup' && WORLD.setupRoutes.includes(r.id))) el('polyline',{'class':'route offer'+(L==='opps'?' opp':'')+dim, points:pts}, linesG);
      const q = toS([mx(r.lon), my(r.lat)]);
      if(L === 'demand'){ const d = demandAt(r, fareOf(r.id)); el('circle',{'class':'dem'+(mine?' mine':''), cx:q[0].toFixed(1), cy:q[1].toFixed(1), r:((4 + 2.6*Math.sqrt(Math.max(0,d)))*M.ui).toFixed(1)}, linesG); }
      const m = marker(r, (mine ? '' : L === 'opps' ? 'opp' : 'offer') + dim, r.city); m.setAttribute('transform', `translate(${q[0].toFixed(1)} ${q[1].toFixed(1)})`); marksG.appendChild(m);
      if(F === r.id){ const fh = 22*M.ui, w = el('g',{'class':'warnmark', transform:`translate(${(q[0] + fh*(FLAG_ASPECT[r.flag]||1.5)/2 + 24*M.ui).toFixed(1)} ${(q[1] - fh*1.6).toFixed(1)})`}, marksG); el('circle',{r:16*M.ui}, w); const t = el('text',{'text-anchor':'middle', y:7*M.ui, 'font-size':Math.round(20*M.ui)}, w); t.textContent = '!'; }
    });
    const h = homeData(), hm = marker(h, 'home', S.airline.name ? S.airline.name.toUpperCase() : h.city), hp = toS([mx(h.lon), my(h.lat)]); hm.setAttribute('transform', `translate(${hp[0].toFixed(1)} ${hp[1].toFixed(1)})`); marksG.appendChild(hm);
    // live operations draw their own aircraft (at the gate, taxiing, flying with a lit trail, parked away)
    if(o.planes && liveOn()){ liveMapDraw(M, toS, planesG); return; }
    // planes in flight: out and back along the route during each trip's window
    let now = o.planes ? dayNow() : null;
    if(o.planes && step().t === 'sim' && S.rnd.simAnim){ const span = toMin('21:45') - firstDep(); now = firstDep() + ((Date.now() / 6000) % 1) * span; }
    if(now !== null && (step().t === 'fly' || step().t === 'sim')){
      S.rnd.flights.forEach(f => { if(f.grounded || f.noFuel || S.rnd.status[f.key]==='CANCELLED' || !f.segments) return; const sg = f.segments.find(x => now >= x.start && now <= x.end); if(!sg) return;
        const u = (now - sg.start) / Math.max(1, sg.end - sg.start), te = sg.kind === 'out' ? u : sg.kind === 'turn' ? 1 : 1 - u, back = sg.kind === 'back';
        const p = along(pathFor(routeById(f.route)), clamp(te,0,1)), q = toS([p.x,p.y]), sz = 40*M.ui; const g = el('g',{'class':'mplane' + (sg.kind === 'turn' ? ' parked' : ''), transform:`translate(${q[0].toFixed(1)} ${q[1].toFixed(1)}) rotate(${(p.deg + (back?180:0)).toFixed(1)})`}, planesG); el('use',{href:'#pl-map', x:-sz/2, y:-sz/2, width:sz, height:sz}, g); });
    }
  };
  // controls: buttons, wheel, drag and pinch (pointer positions corrected for a scaled wall stage)
  root.querySelectorAll('[data-z]').forEach(b => b.onclick = () => { const s = size(), z = b.getAttribute('data-z'); if(z==='in') zoomAt(s.w/2, s.h/2, 1.6); else if(z==='out') zoomAt(s.w/2, s.h/2, 1/1.6); else if(z==='world'){ fitWorld(); M.manual = true; M.render(); } else { M.manual = false; M.key = ''; M.autoFit(true); M.render(); } });
  const local = e => { const r = svg.getBoundingClientRect(), f = svg.clientWidth / (r.width || 1); return [(e.clientX-r.left)*f, (e.clientY-r.top)*f]; };
  svg.addEventListener('wheel', e => { e.preventDefault(); const p = local(e); zoomAt(p[0], p[1], Math.exp(-e.deltaY*0.0015)); }, {passive:false});
  const ptrs = {}; let gesture = null; const list = () => Object.keys(ptrs).map(k => ptrs[k]);
  svg.addEventListener('pointerdown', e => { try{ svg.setPointerCapture(e.pointerId); }catch(err){} ptrs[e.pointerId] = local(e); const P = list(); if(P.length===1) gesture = {type:'pan', start:P[0], tx:M.cam.tx, ty:M.cam.ty}; else if(P.length===2){ const a=P[0], b=P[1]; gesture = {type:'pinch', dist:Math.hypot(a[0]-b[0],a[1]-b[1])||1, mid:[(a[0]+b[0])/2,(a[1]+b[1])/2], k:M.cam.k, tx:M.cam.tx, ty:M.cam.ty}; } });
  svg.addEventListener('pointermove', e => { if(!ptrs[e.pointerId] || !gesture) return; ptrs[e.pointerId] = local(e); const P = list(), c = M.cam;
    if(gesture.type==='pan' && P.length===1){ c.tx = gesture.tx + P[0][0]-gesture.start[0]; c.ty = gesture.ty + P[0][1]-gesture.start[1]; clampCam(); M.manual = true; M.render(); }
    else if(gesture.type==='pinch' && P.length>=2){ const a=P[0], b=P[1], dist=Math.hypot(a[0]-b[0],a[1]-b[1]), mid=[(a[0]+b[0])/2,(a[1]+b[1])/2]; const k = clamp(gesture.k*dist/gesture.dist, M.fitK, M.fitK*(o.maxZoom || 14)); c.tx = mid[0]-(gesture.mid[0]-gesture.tx)*(k/gesture.k); c.ty = mid[1]-(gesture.mid[1]-gesture.ty)*(k/gesture.k); c.k = k; clampCam(); M.manual = true; M.render(); } });
  const end = e => { delete ptrs[e.pointerId]; if(!list().length) gesture = null; };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  let rt; const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { M.key = ''; M.manual = false; M.autoFit(); M.render(); }, 80); };
  let ro = null; try{ ro = new ResizeObserver(onResize); ro.observe(root); }catch(e){ window.addEventListener('resize', onResize); }
  M.destroy = () => { if(ro) ro.disconnect(); };
  return M;
}

/* ----- board ----- */
function boardFlights(){ return S.rnd.flights.length ? S.rnd.flights : (S.phase==='round' || S.phase==='setup' ? planFlights() : []); }
function dayNow(){ const a = S.rnd.anim; if(a && step().t==='fly'){ const t = clamp((Date.now()-a.start)/a.dur, 0, 1); return a.from + (a.to-a.from)*t; } return null; }
function displayStatus(f){
  if(liveOn()){ const L = S.rnd.live, g = liveNow(L), F = L.flights.find(x => x.fk === f.key && x.k === liveDay(L, g)); if(F) return liveDepStatus(L, F, g); }
  if(awaitingClearance() && !f.grounded) return 'AWAITING CLEARANCE';
  const s = S.rnd.status[f.key] || 'SCHEDULED', now = dayNow();
  if(now !== null && !['CANCELLED','GROUNDED','DELAYED','NO FUEL','DIVERTED'].includes(s)){ if(now < f.dep-20) return 'SCHEDULED'; if(now < f.dep) return 'BOARDING'; return 'DEPARTED'; }
  return s === 'LANDED' || s === 'FULL FLIGHT' ? 'DEPARTED' : s;
}
/* The same trip seen from the arrivals side: the return leg into the home airport. */
function arrivalStatus(f){
  if(liveOn()){ const L = S.rnd.live, g = liveNow(L), F = L.flights.find(x => x.fk === f.key && x.k === liveDay(L, g)); if(F) return liveArrStatus(L, F, g); }
  const s = S.rnd.status[f.key] || 'SCHEDULED';
  if(['CANCELLED','GROUNDED','NO FUEL','DIVERTED'].includes(s)) return s;
  const now = dayNow();
  if(now !== null){ const back = (f.segments||[]).find(g => g.kind === 'back'); if(now < (back ? back.start : f.dep)) return 'EXPECTED'; if(now < f.arr) return 'IN FLIGHT'; return 'LANDED'; }
  if(S.rnd.applied) return s === 'DELAYED' ? 'DELAYED' : 'LANDED';
  return s === 'DELAYED' ? 'DELAYED' : 'EXPECTED';
}
function returnCode(code){ return String(code).replace(/\d+$/, n => String(+n + 1)); }
function gameClock(){
  if(liveOn()){ const L = S.rnd.live, g = liveNow(L); return fmtTime(g - liveDay(L, g) * 1440); }
  const now = dayNow(); if(now !== null) return fmtTime(now);
  const fl = boardFlights(); if(!fl.length) return fmtTime(firstDep()-30);
  const st = step().t;
  if(['results','event','eventOutcome','challenge','challengeCalc','summary','setupDone'].includes(st)) return fmtTime(Math.max(...fl.map(f=>f.arr)));
  return fmtTime(firstDep()-30);
}
const BOARD_ROWS = 8;
function boardPage(list, tag){ const pages = Math.max(1, Math.ceil(list.length/BOARD_ROWS)), p = Math.floor(Date.now()/8000) % pages; if($(tag)) $(tag).textContent = pages > 1 ? `${p+1} / ${pages}` : ''; return list.slice(p*BOARD_ROWS, (p+1)*BOARD_ROWS); }

/* ----- finance chart: revenue and costs as columns, profit as a line, one £ axis, a tooltip per day ----- */
function niceStep(x){ const p = Math.pow(10, Math.floor(Math.log10(Math.max(x, 1e-9)))); for(const m of [1, 2, 2.5, 5, 10]) if(m*p >= x) return m*p; return 10*p; }
function dayAxis(d){ if(!d) return 'Launch'; const c = calDate(d); return `${WDAY[c.getUTCDay()].slice(0,3)} ${c.getUTCDate()}`; }
/* Buckets of the daily ledger at the pupil's current time scale: days, weeks or months. */
function finBuckets(n, type){
  const end = lastLedgerDay(); if(end < 0) return [];
  type = type || (S.phase === 'setup' ? 'day' : periodType() === 'gap' ? 'week' : periodType()); const out = [];
  if(type === 'month'){ let b = end; while(out.length < n && b >= 0){ const a = Math.max(0, monthStart(b)), x = ledgerSum(a, b); out.unshift({ label: monthName(a, true) + (calDate(a).getUTCMonth() === 0 ? ' ' + String(calDate(a).getUTCFullYear()).slice(2) : ''), tip: `${monthName(a)} ${calDate(a).getUTCFullYear()}`, from:a, to:b, revenue:x.rev, costs:x.cost, profit:x.profit }); b = a - 1; } }
  else if(type === 'week'){ let b = end; while(out.length < n && b >= 0){ const a = Math.max(0, b <= 7 ? 0 : 1 + 7 * Math.floor((b - 1) / 7)), x = ledgerSum(a, b); out.unshift({ label:'Wk ' + weekNo(Math.max(1, a)), tip:`Week ${weekNo(Math.max(1, a))} · ${fmtRange(Math.max(1, a), b)}`, from:a, to:b, revenue:x.rev, costs:x.cost, profit:x.profit }); b = a - 1; } }
  else { for(let d = Math.max(0, end - n + 1); d <= end; d++){ const x = ledgerSum(d, d); out.push({ label: dayAxis(d), tip: d ? dateShort(d) : 'Launch day', from:d, to:d, revenue:x.rev, costs:x.cost, profit:x.profit }); } }
  return out;
}
function finChart(o){
  o = o || {}; const hist = o.buckets || finBuckets(o.n || 14);
  if(!hist.length) return `<p class="muted fc-empty">The chart starts after the first flight lands.</p>`;
  const W = o.w || 640, H = o.h || 250, L = o.big ? 108 : 74, R = 12, T = 14, B = o.big ? 40 : 34;
  let ymax = Math.max(1, ...hist.map(h => Math.max(h.revenue, h.costs, h.profit))), ymin = Math.min(0, ...hist.map(h => h.profit));
  const stp = niceStep((ymax - ymin) / 4); ymax = Math.ceil(ymax/stp)*stp; ymin = Math.floor(ymin/stp)*stp;
  const n = hist.length, bw = (W-L-R)/Math.max(n, 7), y = v => T + (H-T-B)*(1 - (v-ymin)/((ymax-ymin)||1)), x0 = i => L + bw*i;
  let g = '';
  for(let v = ymin; v <= ymax + 1e-9; v += stp) g += `<line x1="${L}" x2="${W-R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="grid${v===0?' zero':''}"/><text x="${L-8}" y="${(y(v)+5).toFixed(1)}" class="ax" text-anchor="end">${money(Math.round(v))}</text>`;
  const cw = Math.min(o.big ? 34 : 22, bw*0.34), every = n > 20 ? 7 : n > 10 ? 2 : 1;
  hist.forEach((h, i) => {
    const cx = x0(i) + bw/2, y0 = y(0);
    g += `<rect class="b rev" x="${(cx-cw-1).toFixed(1)}" y="${y(h.revenue).toFixed(1)}" width="${cw.toFixed(1)}" height="${Math.max(0, y0-y(h.revenue)).toFixed(1)}" rx="2"/>`;
    g += `<rect class="b cost" x="${(cx+1).toFixed(1)}" y="${y(h.costs).toFixed(1)}" width="${cw.toFixed(1)}" height="${Math.max(0, y0-y(h.costs)).toFixed(1)}" rx="2"/>`;
    if((n-1-i) % every === 0) g += `<text x="${cx.toFixed(1)}" y="${H-10}" class="ax" text-anchor="middle">${esc(h.label)}</text>`;
    g += `<rect class="hov" x="${x0(i).toFixed(1)}" y="${T}" width="${bw.toFixed(1)}" height="${H-T-B}" data-tip="${esc(h.tip+'|'+money(h.revenue)+'|'+money(h.costs)+'|'+money(h.profit))}"/>`;
  });
  if(n > 1) g += `<polyline class="pl" points="${hist.map((h,i) => (x0(i)+bw/2).toFixed(1)+','+y(h.profit).toFixed(1)).join(' ')}"/>`;
  hist.forEach((h, i) => { g += `<circle class="pd" cx="${(x0(i)+bw/2).toFixed(1)}" cy="${y(h.profit).toFixed(1)}" r="${o.big ? 6 : 4.5}"/>`; });
  const fcs = S.history.filter(x => x.forecast && x.type === 'month' && monthStart(x.from) === monthStart(x.to));
  hist.forEach((h, i) => { const f = fcs.find(x => x.from === h.from); if(f){ const cx = x0(i)+bw/2; g += `<line class="fcm" x1="${(cx-cw-3).toFixed(1)}" x2="${(cx+cw+3).toFixed(1)}" y1="${y(f.forecast.profit).toFixed(1)}" y2="${y(f.forecast.profit).toFixed(1)}"/>`; } });
  return `<div class="fc"><div class="fc-legend"><span><i class="k rev"></i>Ticket money</span><span><i class="k cost"></i>Costs</span><span><i class="k pl"></i>Profit</span>${fcs.length ? '<span><i class="k fcm"></i>Your forecast</span>' : ''}</div><svg viewBox="0 0 ${W} ${H}" class="fcs" preserveAspectRatio="xMidYMid meet">${g}</svg><div class="fc-tip" hidden></div></div>`;
}
document.addEventListener('mouseover', e => {
  const r = e.target.closest ? e.target.closest('.fc .hov') : null; const fc = r ? r.closest('.fc') : null;
  document.querySelectorAll('.fc-tip').forEach(t => { if(!fc || t.parentNode !== fc) t.hidden = true; });
  if(!r) return; const tip = fc.querySelector('.fc-tip'), [d, rev, cost, pr] = r.getAttribute('data-tip').split('|');
  tip.innerHTML = `<b>${esc(d)}</b><span><i class="k rev"></i>Ticket money <b>${rev}</b></span><span><i class="k cost"></i>Costs <b>${cost}</b></span><span><i class="k pl"></i>Profit <b>${pr}</b></span>`;
  const a = r.getBoundingClientRect(), b = fc.getBoundingClientRect(); tip.hidden = false;
  tip.style.left = Math.min(b.width - tip.offsetWidth - 4, Math.max(4, a.left - b.left + a.width/2 - tip.offsetWidth/2)) + 'px'; tip.style.top = '30px';
});
/* a tiny trend line for KPI cards and the fuel panel */
function spark(vals, cls){ if(!vals || vals.length < 2) return ''; const W = 120, H = 34, lo = Math.min(...vals), hi = Math.max(...vals), d = (hi-lo) || 1; return `<svg class="spark ${cls||''}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><polyline points="${vals.map((v,i) => (i*(W-4)/(vals.length-1)+2).toFixed(1)+','+(H-3-(v-lo)/d*(H-6)).toFixed(1)).join(' ')}"/></svg>`; }

/* ----- the wall ----- */
let wallMap = null;
function weatherNow(){ const ev = S.rnd && S.rnd.event, i = S.steps ? S.steps.findIndex(s => s.t === 'event') : -1; if(!ev || i < 0 || S.si < i) return null; return ({ storm:'Storm', fog:'Fog at '+homeData().city, ash:'Ash cloud' })[ev.id] || null; }
function launchPlane(){
  if(!S.steps || !S.steps.length) return null; const st = step().t, o = S.overlay;
  if(o && o.type === 'newPlane') return S.fleet.find(f => f.uid === o.uid) || null;
  if((st === 'newRoute' || st === 'route') && S.dec.planeBought && S.dec.planeBought.round === S.round) return S.fleet[S.fleet.length-1] || null;
  return null;
}
function wallMode(){
  if(!S || !S.steps || !S.steps.length) return 'live';
  const st = step().t, idm = identityWallMode(); if(idm) return idm;
  if(st === 'event') return 'alert';
  if(st === 'stage') return 'stage';
  if(liveOn()) return 'ops';
  if(st === 'sim' && S.rnd.sim) return 'sim';
  if(S.rnd.applied && ['results','eventOutcome','challenge','challengeCalc','summary','setupDone'].includes(st)) return 'review';
  if(launchPlane()) return 'launch';
  return 'live';
}
const LIVE_TEXT = { run:'▶ RUNNING', alert:'■ SIMULATION PAUSED', hold:'■ ', ready:'● LIVE', done:'✓ ALL LANDED', idle:'STANDBY' };
function wallStatusHtml(){
  const fl = boardFlights(), st = fl.map(displayStatus), today = fuelPrice(), yest = S.round > 1 ? fuelPrice(S.round-1) : today;
  const delayed = st.filter(s => s === 'DELAYED' || s === 'DIVERTED').length, grounded = st.filter(s => ['GROUNDED','NO FUEL','CANCELLED'].includes(s)).length;
  const wx = weatherNow(), alerts = intelSituations().length + (wallMode() === 'alert' ? 1 : 0);
  const row = (l, v, c) => `<div class="ws-row ${c||''}"><span>${l}</span><b>${v}</b></div>`;
  return `<div class="ws-h">STATUS</div>
    <div class="ws-big"><span>AIRCRAFT ACTIVE</span><b>${activeFleet().length}</b><small>of ${S.fleet.length} in the fleet</small></div>
    <div class="ws-big"><span>FLIGHTS TODAY</span><b>${fl.filter(f => !f.grounded).length}</b></div>
    <div class="ws-big"><span>DESTINATIONS</span><b>${ownedRoutes().length}</b></div>
    ${row('DELAYED', delayed, delayed ? 'amber' : '')}${row('GROUNDED', grounded, grounded ? 'red' : '')}
    ${row('FUEL £/L', `${priceL(today)} <i class="${today > yest ? 'up' : today < yest ? 'down' : ''}">${today > yest ? '▲' : today < yest ? '▼' : '■'}</i>`)}
    ${row('WEATHER', wx ? '⚠ ' + esc(wx) : 'Clear', wx ? 'amber' : '')}
    ${row('ALERTS', alerts, alerts ? 'amber' : '')}`;
}
/* Day complete: the brief's summary first (what the pupil has just watched), then the chart and the landing report. */
function wallReviewHtml(){
  const h = lastDay() || {}, ms = S.rnd.milestone, d = S.phase === 'setup' ? 'LAUNCH DAY' : dateLong().replace(/ \d{4}$/, '').toUpperCase(), X = liveSummary(), fc = S.rnd.myForecast;
  const tile = (l, v, c, sub) => `<div class="wt ${c||''}"><span>${l}</span><b>${v}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
  const prev = S.history.slice(0, -1).filter(x => x.type === 'day' || x.type === 'setup'), rec = prev.length && (h.profit || 0) > Math.max(...prev.map(x => x.profit || 0));
  const fl = S.rnd.flights.filter(f => !f.grounded && !f.noFuel), services = X ? X.services : fl.length, full = X ? X.full : fl.filter(f => f.sold >= f.seats).length, empty = X ? X.empty : (h.seats || 0) - (h.pax || 0), onTime = X ? X.onTime : services;
  return `${rec ? `<div class="wo-ms rec"><b>★ NEW PROFIT RECORD</b><span>${money(Math.round(h.profit))}</span><small>The best day so far</small></div>` : ms ? `<div class="wo-ms"><b>★ MILESTONE</b><span>${esc(ms.title)}</span><small>${esc(ms.sub)}</small></div>` : ''}
    <div class="wo-head"><small>${esc(d)}</small><h1>DAY COMPLETE</h1>${!IS_DISPLAY && wallView ? '<button class="btn primary big wo-go" data-ops="hq">Review at HQ ▶</button>' : ''}</div>
    <div class="wo-tiles t7">${tile('Flights operated', services)}${tile('Passengers carried', num(h.pax||0))}${tile('Full flights', full, full ? 'good' : '')}${tile('Empty seats', num(Math.max(0, empty)))}${tile('On time', `${onTime} / ${services}`)}${fc ? tile('Projected profit', money(Math.round(fc.profit)), 'money') : ''}${tile((h.profit||0) >= 0 ? 'Actual profit' : 'Actual loss', money(Math.round(Math.abs(h.profit||0))), (h.profit||0) >= 0 ? 'good' : 'bad')}</div>
    <div class="wo-body"><div class="wo-chart"><div class="wo-sub">PROFIT BY DAY</div>${finChart({n:14, w:1000, h:430, big:true})}</div>
      <div class="wo-report">${X ? `<div class="wo-facts"><div><span>Without a seat</span><b>${num(X.noSeat)}</b>${X.otherTimes ? `<small>${num(X.otherTimes)} wanted a time with no service</small>` : ''}</div>${X.snacksOn ? `<div><span>Snacks bought</span><b>${num(X.snacks)}</b><small>+${money(X.snackRev)}</small></div>` : ''}</div>` : ''}<div class="wo-sub">LANDING REPORT</div>${S.rnd.flights.map(f => `<div><span class="status ${statusClass(S.rnd.status[f.key])}">${S.rnd.status[f.key]}</span><span>${esc(outcomeLine(f))}</span></div>`).join('')}${S.rnd.eventWhy ? `<div><span>⚠</span><span>${esc(S.rnd.eventWhy)}</span></div>` : ''}
        <div class="reviews">${(S.rnd.reviews||[]).map(v => `<div class="review"><span class="face">${v.face}</span><span class="txt">${esc(v.text)}</span><span class="stars">${starsHtml(v.stars)}</span></div>`).join('')}</div></div></div>`;
}
function wallLaunchHtml(f){
  const p = planeById(f.planeId), sch = schedOf(f), r = sch.length ? routeById(sch[0]) : null, trip = S.rnd.flights.find(x => x.uid === f.uid);
  return `<div class="wo-launch"><small>FLEET UPDATE</small><h1>WELCOME TO THE FLEET</h1><div class="wl-plane">${aircraftArt(ensureIdentity(f), { cls:'anim pic' })}</div><h2>${esc(p.name)}</h2>
    <div class="wl-facts"><span><b>${p.seats}</b> seats</span><span><b>${num(p.range)}</b> km range</span><span><b>${num(p.speed)}</b> km/h</span></div>
    <p>${r ? `First route: <b>${esc(homeData().city)} → ${esc(r.city)}</b> · first departure <b>${fmtTime(trip ? trip.dep : firstDep())}</b>` : 'Choosing its first route at HQ…'}</p></div>`;
}
function wallAlertHtml(){
  const ev = S.rnd.event, r = focusRoute(), n = r ? S.rnd.flights.filter(f => f.route === r.id).length : 0;
  return `<div class="wa-top">⚠ EXECUTIVE ALERT</div><h2>${esc(fillText(ev ? ev.title : 'Operations alert'))}</h2>
    ${r ? `<p>${esc(homeData().city)} → ${esc(r.city)} · ${plural(n, 'flight')} today</p>` : ''}
    <div class="wa-foot"><b>SIMULATION PAUSED · CEO DECISION REQUIRED</b><span>Decision in progress at HQ</span></div>`;
}
function renderDisplay(){
  if(!S || !S.airline) return;
  $('standby').hidden = true; setLivery();
  if(!wallMap) wallMap = makeMap($('wMap'), { scale:1.35, planes:true, grid:true });
  const mode = wallMode(), ops = opsStatus(), focus = mode === 'alert' ? (S.rnd.focusRoute || null) : null;
  $('wall').className = 'wall mode-' + mode;
  $('dName').textContent = S.airline.name ? S.airline.name.toUpperCase() : 'YOUR AIRLINE';
  const sx = strategyOf(); document.querySelector('.w-brand small').textContent = sx ? sx.badge : 'Network operations';
  const w = roundData(S.round), news = S.log.slice(-4);
  $('dTicker').textContent = ((w.news||[]).map(fillText).concat(news.map(n => n.text)).join('   ✈   ') || 'Welcome to the skies').toUpperCase();
  if(IDENTITY_MODES.includes(mode)){ renderIdentityWall(mode); return; }
  if(mode === 'ops'){ renderLiveWall(); if(IS_DISPLAY) liveWallLoop(); return; }
  $('wOps').hidden = true; $('wOps')._h = ''; $('wStatus').className = 'w-status'; $('wStatus')._h = ''; $('dRows')._h = ''; $('aRows')._h = ''; liveMapMode(false);
  const PT = periodType();
  $('wPeriod').textContent = S.phase === 'setup' ? 'LAUNCH DAY' : PT === 'day' ? "TODAY'S OPERATIONS" : PT === 'week' ? 'THIS WEEK' : PT === 'gap' ? 'THE WEEKEND' : `${monthName(S.period.from).toUpperCase()} OPERATIONS`;
  const pLab = periodLabel(), pTag = periodTag(); $('wDate').textContent = S.phase === 'setup' ? dateLong() : pLab.includes(pTag) ? pLab : pLab + ' · ' + pTag;
  const lv = $('wLive'); lv.className = 'w-live ' + ops.k; lv.textContent = ops.k === 'hold' ? '■ ' + ops.t : LIVE_TEXT[ops.k];
  $('clock').textContent = gameClock();
  // boards: departures out of the hub, arrivals back into it
  const fl = boardFlights().slice().sort((a,b) => a.dep - b.dep), hit = f => focus && f.route === focus ? ' hit' : '';
  $('dEmpty').hidden = fl.length > 0; $('aEmpty').hidden = fl.length > 0;
  $('dRows').innerHTML = boardPage(fl, 'dPage').map(f => { const r = routeById(f.route), s = displayStatus(f); return `<tr class="${s==='DEPARTED'?'gone':''}${hit(f)}"><td class="t">${fmtTime(f.dep)}</td><td class="f">${f.code}</td><td>${esc(r.city)}</td><td><span class="status ${statusClass(s)}">${s === 'AWAITING CLEARANCE' ? 'HOLD AT GATE' : s}</span></td></tr>`; }).join('');
  const ar = fl.slice().sort((a,b) => a.arr - b.arr);
  $('aRows').innerHTML = boardPage(ar, 'aPage').map(f => { const r = routeById(f.route), s = arrivalStatus(f); return `<tr class="${s==='LANDED'?'gone':''}${hit(f)}"><td class="t">${fmtTime(f.arr)}</td><td class="f">${returnCode(f.code)}</td><td>${esc(r.city)}</td><td><span class="status ${statusClass(s)}">${s}</span></td></tr>`; }).join('');
  $('wStatus').innerHTML = wallStatusHtml();
  // modes: alert card over the map; review / launch take the whole wall
  // only replace these when they change, so their entrance animation plays once (state arrives many times a minute)
  const put = (box, html) => { if(box._html !== html){ box._html = html; box.innerHTML = html; } };
  const A = $('wAlert'); A.hidden = mode !== 'alert'; if(mode === 'alert') put(A, wallAlertHtml());
  const O = $('wOver'), lp = mode === 'launch' ? launchPlane() : null; O.hidden = !(mode === 'review' || mode === 'stage' || lp);
  if(mode === 'review') put(O, S.rnd.sim ? wallPeriodReviewHtml() : wallReviewHtml()); else if(mode === 'stage') put(O, wallStageHtml()); else if(lp) put(O, wallLaunchHtml(lp)); else O._html = '';
  const SB = $('wSim'); SB.hidden = mode !== 'sim'; if(mode === 'sim') SB.innerHTML = wallSimHtml();
  updatePins();
  if(wallMap.focus !== focus){ wallMap.focus = focus; wallMap.key = ''; wallMap.manual = false; }
  wallMap.autoFit(); wallMap.render();
  if(S.rnd.anim && step().t==='fly' && (Date.now()-S.rnd.anim.start) < S.rnd.anim.dur + 600) requestAnimationFrame(renderDisplay);
  if(mode === 'sim' && simProgress() < 1) setTimeout(renderDisplay, 120);
}
function wallSimHtml(){
  const T = S.rnd.sim, chips = simChips(T), k = simProgress(), on = Math.ceil(k * chips.length);
  return `<div class="wsim-h">▶ SIMULATING · ${esc(periodLabel({ type:S.period.type, from:T.from, to:T.to }).toUpperCase())}</div>
    <div class="wsim-chips ${chips.length > 10 ? 'dense' : ''}">${chips.map((c, i) => `<span class="${i < on ? 'on' : ''}">${esc(c.label)} ${i < on ? '✓' : ''}</span>`).join('')}</div>
    ${k >= 1 && T.paused ? `<div class="wsim-p">⚠ SIMULATION PAUSED · ${esc(T.paused.title.toUpperCase())}</div>` : ''}`;
}
function wallStageHtml(){
  const st = step(), T = STAGE_TEXT[st.stage] || STAGE_TEXT.week;
  return `<div class="wo-launch"><small>MILESTONE</small><h1>${esc(T.title.toUpperCase())}</h1><p>${st.stage === 'week' ? 'From now on: <b>one week at a time</b>' : 'From now on: <b>one month at a time</b>'}</p><div class="stage-scale big">${['DAYS','WEEKS','MONTHS'].map((x, i) => `<span class="${(st.stage === 'week' && i === 1) || (st.stage === 'month' && i === 2) ? 'on' : ''}">${x}</span>`).join('<i>›</i>')}</div></div>`;
}
function wallPeriodReviewHtml(){
  const T = S.rnd.sim, h = lastDay() || {}, ms = S.rnd.milestone, name = periodShort(h).toUpperCase(), pct = T.seats ? Math.round(100*T.pax/T.seats) : 0;
  const tile = (l, v, c, sub) => `<div class="wt ${c||''}"><span>${l}</span><b>${v}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
  const b = T.parts.length > 1 ? T.parts.map(p => ({ label:p.label, tip:p.label, revenue:p.rev, costs:p.costs, profit:p.profit })) : T.days.map((p, i) => { const d = T.from + i, x = ledgerSum(d, d); return { label: dayAxis(d), tip: dateShort(d), revenue:x.rev, costs:x.cost, profit:x.profit }; });
  const X = liveSummary(), vs = S.rnd.vs, kind = S.period.type, prevW = S.history.slice(0, -1).filter(x => x.type === kind), rec = kind === 'week' && prevW.length && T.profit > Math.max(...prevW.map(x => x.profit || 0));
  const done = kind === 'week' ? 'WEEK COMPLETE' : kind === 'gap' ? 'WEEKEND COMPLETE' : `${name} COMPLETE`;
  return `${rec ? `<div class="wo-ms rec"><b>★ NEW WEEKLY RECORD</b><span>${money(Math.round(T.profit))}</span><small>The best week so far</small></div>` : ms ? `<div class="wo-ms"><b>★ MILESTONE</b><span>${esc(ms.title)}</span><small>${esc(ms.sub)}</small></div>` : ''}
    <div class="wo-head"><small>${esc(periodLabel({ type:kind, from:T.from, to:T.to }).toUpperCase())}</small><h1>${esc(done)}</h1>${!IS_DISPLAY && wallView ? '<button class="btn primary big wo-go" data-ops="hq">Review at HQ ▶</button>' : ''}</div>
    ${X ? `<div class="wo-tiles t7">${tile('Flights operated', num(X.services))}${tile('Passengers carried', num(T.pax))}${tile('Full flights', num(X.full), X.full ? 'good' : '')}${tile('Empty seats', num(X.empty))}${tile('On time', `${num(X.onTime)} / ${num(X.services)}`)}${vs && vs.kind === 'period' ? tile('Projected profit', moneyK(vs.expProfit), 'money') : ''}${tile(T.profit >= 0 ? 'Actual profit' : 'Actual loss', moneyK(Math.abs(T.profit)), T.profit >= 0 ? 'good' : 'bad')}</div>`
      : `<div class="wo-tiles">${tile('Ticket money', moneyK(T.rev), 'money')}${tile('Costs', moneyK(T.costs), 'money')}${tile(T.profit >= 0 ? 'Profit' : 'Loss', moneyK(Math.abs(T.profit)), T.profit >= 0 ? 'good' : 'bad')}${tile('Passengers', num(T.pax), '', `on ${plural(T.trips,'flight')}`)}${tile('Seats filled', pct+'%')}${tile('Reputation', starsHtml(S.rep), 'stars')}</div>`}
    <div class="wo-body"><div class="wo-chart"><div class="wo-sub">${T.parts.length > 1 ? 'PROFIT BY MONTH' : 'PROFIT BY DAY'}</div>${finChart({ buckets:b, w:1000, h:430, big:true })}</div>
      <div class="wo-report">${X ? `<div class="wo-facts"><div><span>Without a seat</span><b>${num(X.noSeat)}</b>${X.otherTimes ? `<small>${num(X.otherTimes)} wanted a time with no service</small>` : ''}</div>${X.snacksOn ? `<div><span>Snacks bought</span><b>${num(X.snacks)}</b><small>+${money(X.snackRev)}</small></div>` : ''}</div>` : ''}<div class="wo-sub">WHAT HAPPENED</div>${S.rnd.why.slice(0, 5).map(w => `<div><span>${w.ic}</span><span>${esc(w.text)}</span></div>`).join('')}${T.paused ? `<div class="wo-paused">⚠ SIMULATION PAUSED · ${esc(T.paused.title)}</div>` : ''}
        <div class="reviews">${(S.rnd.reviews||[]).map(v => `<div class="review"><span class="face">${v.face}</span><span class="txt">${esc(v.text)}</span><span class="stars">${starsHtml(v.stars)}</span></div>`).join('')}</div></div></div>`;
}
/* Big money gets compact once the airline is big: £84.2k, £1.3m (the exact value is in the title). */
function moneyK(v){ const a = Math.abs(v); if(a < 100000) return money(v); return `<em class="mk" title="${money(v)}">${v < 0 ? '−' : ''}£${a >= 1e6 ? (a/1e6).toFixed(1) + 'm' : (a/1e3).toFixed(1) + 'k'}</em>`; }
/* The wall is drawn on a fixed 1920 × 1080 stage and scaled to fit whatever screen shows it. */
function fitWall(){ const w = $('wall'); if(!w) return; const s = Math.min(innerWidth/1920, innerHeight/1080); w.style.transform = `translate(${((innerWidth - 1920*s)/2).toFixed(1)}px, ${((innerHeight - 1080*s)/2).toFixed(1)}px) scale(${s})`; }
/* Single screen: the Operations Wall replaces the HQ on this screen (same state), W or Return to HQ goes back. */
let wallView = false;
function setWallView(on){
  if(IS_DISPLAY) return; wallView = !!on; document.body.classList.toggle('wallview', wallView); $('wReturn').hidden = !wallView; $('dFs').hidden = wallView;
  if(wallView){ fitWall(); renderDisplay(); setTimeout(() => { if(wallMap){ wallMap.key = ''; wallMap.autoFit(true); wallMap.render(); } }, 60); } else render();
}

/* One button: this window full screen, the IWB window opened full screen on the second display.
   Uses the Window Management API (Chrome/Edge). Where it isn't available the IWB shows a one-tap full-screen prompt. */
function presentBoth(){
  const url = location.pathname + '?display&fs';
  // 1. open (or re-use) the IWB window — this must happen inside the click, before anything that consumes it
  try{ if(!displayWin || displayWin.closed) displayWin = window.open(url, 'airlineDisplay', `popup,width=${screen.availWidth},height=${screen.availHeight},left=0,top=0`); else send({type:'present'}); }catch(e){}
  // 2. if the browser lets us see the other screen, push the window there
  try{ if('getScreenDetails' in window) window.getScreenDetails().then(sd => { const other = sd.screens.find(s => s !== sd.currentScreen); if(other && displayWin && !displayWin.closed){ try{ displayWin.moveTo(other.availLeft, other.availTop); displayWin.resizeTo(other.availWidth, other.availHeight); }catch(e){} } }).catch(()=>{}); }catch(e){}
  // 3. this window goes full screen on the next tap anywhere (a browser can't grant two windows from one click)
  const root = document.documentElement, fsReq = root.requestFullscreen || root.webkitRequestFullscreen;
  if(fsReq && !document.fullscreenElement){ toast('IWB window opened. Tap the board once for full screen there; tap anywhere here for full screen.'); const once = () => { document.removeEventListener('pointerdown', once, true); try{ const p = fsReq.call(root); if(p && p.catch) p.catch(()=>{}); }catch(e){} }; setTimeout(() => document.addEventListener('pointerdown', once, true), 300); }
  setTimeout(publish, 800);
}


/* ==================================================================
   WORKING SPACE ON THE IWB (CR2 B3) — pen area, not saved with the run
   ================================================================== */
const WS = { open:false, strokes:[], cur:null, color:'#ffc83d', width:4, erase:false, key:'' };
function setWorkMode(open){ WS.open = !!open; const w = $('work'); if(!w) return; w.hidden = !WS.open; if(WS.open){ sizeCanvas(); updatePins(); } }
function sizeCanvas(){ const cv = $('wCanvas'); if(!cv) return; const r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1; cv.width = Math.max(1, Math.round(r.width*d)); cv.height = Math.max(1, Math.round(r.height*d)); redraw(); }
function redraw(){ const cv = $('wCanvas'); if(!cv) return; const g = cv.getContext('2d'), d = window.devicePixelRatio || 1; g.setTransform(1,0,0,1,0,0); g.clearRect(0,0,cv.width,cv.height); g.setTransform(d,0,0,d,0,0); WS.strokes.concat(WS.cur ? [WS.cur] : []).forEach(s => { g.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over'; g.strokeStyle = s.color; g.lineWidth = s.erase ? s.width*5 : s.width; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); s.pts.forEach((p,i) => i ? g.lineTo(p[0],p[1]) : g.moveTo(p[0],p[1])); if(s.pts.length === 1) g.lineTo(s.pts[0][0]+0.1, s.pts[0][1]); g.stroke(); }); g.globalCompositeOperation = 'source-over'; }
function updatePins(){
  const box = $('wPins'); if(!box || !S) return;
  const t = S.rnd && S.rnd.tables && S.rnd.tables[S.rnd.activeTable], pin = t ? pinnedFor(t) : null, key = pin ? pin.key : '';
  if(key !== WS.key){ WS.key = key; WS.strokes = []; WS.cur = null; redraw(); }   // a new calculation starts with a clean page
  box.innerHTML = pin ? `<b>${esc(pin.title)}</b>${pin.items.filter(i => i.value !== '').map(i => `<span><small>${esc(i.label)}</small>${esc(String(i.value))}</span>`).join('')}` : '<b>No sum open</b>';
}
function initWork(){
  const cv = $('wCanvas'); if(!cv) return;
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => { try{ cv.setPointerCapture(e.pointerId); }catch(err){} WS.cur = { color:WS.color, width:WS.width, erase:WS.erase, pts:[pos(e)] }; redraw(); });
  cv.addEventListener('pointermove', e => { if(!WS.cur) return; WS.cur.pts.push(pos(e)); redraw(); });
  const end = () => { if(WS.cur){ WS.strokes.push(WS.cur); WS.cur = null; redraw(); } };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  document.querySelectorAll('[data-wcol]').forEach(b => b.onclick = () => { WS.color = b.getAttribute('data-wcol'); WS.erase = false; syncTools(); });
  document.querySelectorAll('[data-wsize]').forEach(b => b.onclick = () => { WS.width = parseInt(b.getAttribute('data-wsize'),10); syncTools(); });
  $('wErase').onclick = () => { WS.erase = !WS.erase; syncTools(); };
  $('wUndo').onclick = () => { WS.strokes.pop(); redraw(); };
  $('wClear').onclick = () => { WS.strokes = []; redraw(); };
  $('wBack').onclick = () => setWorkMode(false);
  $('goWork').onclick = () => setWorkMode(true);
  window.addEventListener('resize', () => { if(WS.open) sizeCanvas(); });
  syncTools();
}
function syncTools(){ document.querySelectorAll('[data-wcol]').forEach(b => b.setAttribute('aria-pressed', String(!WS.erase && b.getAttribute('data-wcol') === WS.color))); document.querySelectorAll('[data-wsize]').forEach(b => b.setAttribute('aria-pressed', String(parseInt(b.getAttribute('data-wsize'),10) === WS.width))); $('wErase').setAttribute('aria-pressed', String(WS.erase)); }

/* ==================================================================
   TEACHER PANEL
   ================================================================== */
function teacherOpen(){
  const T = $('teacher'); T.hidden = false;
  $('tNudge').checked = settings.nudge; $('tAuto').checked = settings.auto; $('tStartCash').value = settings.startingCash; $('tFlightSecs').value = String(settings.flightSecs);
  $('tOpsSound').checked = opsSoundOn(); $('tMotion').checked = !!settings.reduceMotion; if($('tPractice')) $('tPractice').value = settings.practiceQuestionsPerDay === null || settings.practiceQuestionsPerDay === undefined ? '' : String(settings.practiceQuestionsPerDay); $('tAutoWall').checked = settings.autoWall !== false;
  const evs = []; WORLD.rounds.forEach((r,i)=>{ if(r.event) evs.push([i, r.event]); });
  $('tEventPick').innerHTML = evs.length ? evs.map(([i,e]) => `<option value="${i}">${esc(e.title)} (${esc(WORLD.rounds[i].date ? dateShort(beatDay(i)) + ' ' + calDate(beatDay(i)).getUTCFullYear() : 'day ' + i)})</option>`).join('') : '<option value="">No events in this story yet</option>';
  ['tEventPick', 'tEventNow', 'tEventDelay', 'tEventSkip'].forEach(id => { $(id).disabled = !evs.length; });   // events come back when the story has some
  const nl = S.teacherQueue.choice || '';
  $('tJobs').innerHTML = [['','As scripted'],['fare','Ticket price'],['trips','How many trips'],['fuel','Buy fuel'],['cabin','Seat layout'],['plane','A new plane']].map(([k,l]) => `<button class="btn small" data-tl="${k}" aria-pressed="${nl===k}">${l}</button>`).join('');
  $('tJobs').querySelectorAll('[data-tl]').forEach(b => b.onclick = () => { S.teacherQueue.choice = b.getAttribute('data-tl') || null; save(); teacherOpen(); });
  const tz = S.textSize || 0;
  $('tText').innerHTML = ['Standard','Large','Extra large'].map((l, i) => `<button class="btn small" data-tz="${i}" aria-pressed="${tz===i}">${l}</button>`).join('');
  $('tText').querySelectorAll('[data-tz]').forEach(b => b.onclick = () => { S.textSize = parseInt(b.getAttribute('data-tz'),10); applyTextSize(); publish(); teacherOpen(); });
  $('tTest').checked = !!settings.testMode; $('tAutoAns').checked = !!settings.autoAnswer;
  renderTeacherTools(); $('tTime').innerHTML = '';
  $('tCode').value = saveCode(); $('tCodeMsg').textContent = ''; if($('tMigrated')) $('tMigrated').innerHTML = migratedHtml();
}
function teacherClose(){ $('teacher').hidden = true; render(); }
function skipScreen(){ if(!$('teacher').hidden) teacherClose(); if(S.overlay){ closeOverlay(); return; } const st = step(); if(st.t==='summary') startRound(S.round+1); else if(st.t==='setupDone') startRound(1); else next(); }
function initTestBar(){
  const bar = document.createElement('div'); bar.id = 'testBar'; bar.className = 'testbar'; bar.hidden = true;
  bar.innerHTML = '<b>TEST</b><button class="btn small" id="tbAnswer">Answer this one</button><button class="btn small" id="tbFill">Fill table</button><button class="btn small" id="tbSkip">Skip screen</button><button class="btn small" id="tbAuto" aria-pressed="false">Auto-answer: off</button>';
  document.body.appendChild(bar);
  $('tbAnswer').onclick = () => releaseGate(true); $('tbFill').onclick = fillTable; $('tbSkip').onclick = skipScreen;
  $('tbAuto').onclick = () => { settings.autoAnswer = !settings.autoAnswer; saveSettings(); testTick(); };
}
function initTeacher(){
  $('tClose').onclick = teacherClose;
  $('tRelease').onclick = () => { teacherClose(); releaseGate(); };
  $('tSkipStep').onclick = skipScreen;
  $('tTest').onchange = e => { settings.testMode = e.target.checked; saveSettings(); testTick(); };
  $('tAutoAns').onchange = e => { settings.autoAnswer = e.target.checked; saveSettings(); testTick(); };
  $('tBack').onclick = () => { teacherClose(); back(); };
  $('tNudge').onchange = e => { settings.nudge = e.target.checked; saveSettings(); };
  if($('tPractice')) $('tPractice').onchange = e => { settings.practiceQuestionsPerDay = e.target.value === '' ? null : +e.target.value; saveSettings(); };
  $('tAuto').onchange = e => { settings.auto = e.target.checked; saveSettings(); };
  $('tFlightSecs').onchange = e => { settings.flightSecs = parseInt(e.target.value,10); saveSettings(); };
  $('tOpsSound').onchange = e => { settings.opsSound = e.target.checked; saveSettings(); syncSoundBtn(); };
  $('tAutoWall').onchange = e => { settings.autoWall = e.target.checked; saveSettings(); };
  $('tEventNow').onclick = () => { const i = parseInt($('tEventPick').value,10); if(!(WORLD.rounds[i] && WORLD.rounds[i].event)){ toast('No events in this story yet'); return; } S.rnd.event = WORLD.rounds[i].event; S.rnd.eventChoice = null; const at = Math.max(S.si+1, S.steps.findIndex(s=>s.t==='summary')); S.steps.splice(S.steps.findIndex(s=>s.t==='summary'), 0, {t:'event'}, {t:'eventOutcome'}); teacherClose(); toast('Event queued for after this screen'); };
  $('tEventDelay').onclick = () => { if(!S.rnd.event){ toast('No event today'); return; } S.nextMods.event = S.rnd.event; S.rnd.event = null; S.steps = S.steps.filter(s => s.t!=='event' && s.t!=='eventOutcome'); teacherClose(); toast('Event moved to tomorrow'); };
  $('tEventSkip').onclick = () => { S.rnd.event = null; S.steps = S.steps.filter(s => s.t!=='event' && s.t!=='eventOutcome'); teacherClose(); toast('Event skipped'); };
  $('tChallengeNow').onclick = () => { S.rnd.challenge = CHALLENGES[Math.floor(S.round/2) % CHALLENGES.length]; S.rnd.challengeDone = false; S.rnd.challengeWon = false; const i = S.steps.findIndex(s=>s.t==='summary'); S.steps.splice(i<0?S.steps.length:i, 0, {t:'challenge'}); teacherClose(); toast('Challenge added to today'); };
  $('tStartCash').onchange = e => { settings.startingCash = parseInt(e.target.value,10)||WORLD.startingCash; saveSettings(); };
  $('tCashApply').onclick = () => { const d = parseFloat($('tCashDelta').value); if(!isNaN(d)){ S.cash += d; $('tCashDelta').value=''; toast('Cash adjusted'); render(); } };
  $('tRepDown').onclick = () => { S.rep = clamp(S.rep-0.5,1,5); render(); }; $('tRepUp').onclick = () => { S.rep = clamp(S.rep+0.5,1,5); render(); };
  $('tRoundNext').onclick = () => { teacherClose(); if(S.round + 1 < WORLD.rounds.length){ S.day = beatDay(S.round + 1); startRound(S.round + 1); } render(); };
  $('tRepeat').onclick = () => { if(S.phase !== 'round'){ toast('Only during a game day'); return; } if(!S.roundStart){ toast('Nothing saved for today yet'); return; } if(confirm('Go back to the start of today?')){ const keep = S.roundStart; S = JSON.parse(keep); S.roundStart = keep; teacherClose(); render(); } };
  $('tEnd').onclick = () => { teacherClose(); showCode(true); };
  $('tRuns').onclick = () => { teacherClose(); showRuns(); };
  $('tMenu').onclick = () => { teacherClose(); openMenu(); };
  $('tBank').onclick = () => { questionBank(); };
  $('tFill').onclick = () => { teacherClose(); fillTable(); };
  bindTeacherTools();
  $('tWorkOpen').onclick = () => { send({type:'work', open:true}); toast('Working space open on the board'); };
  $('tWorkClose').onclick = () => { send({type:'work', open:false}); };
  $('tTimeCheck').onclick = () => { const r = timeSelfTest(); $('tTime').innerHTML = r.map(c => `<div class="small">${c.ok ? '<span class="green">✓</span>' : '<span class="red">✗</span>'} ${esc(c.name)}: <b class="mono">${esc(c.got)}</b>${c.ok ? '' : ' (should be '+esc(c.want)+')'}</div>`).join(''); };
  $('tFinish').onclick = () => { if(confirm('Record this run in the best-run table now?')){ S.finished = false; recordRun(); teacherClose(); showRuns(); } };
  $('tNew').onclick = () => { teacherClose(); newGame(); };
  $('tOpenIwb').onclick = openDisplay;
  $('tSpeak').onclick = () => { if(document.body.classList.contains('tts')) speak('Cleared for take-off. Read aloud is working.'); else alert('Read-aloud is not available on this machine (no speech voices found). The speaker buttons stay hidden.'); };
  $('tCodeCopy').onclick = () => { $('tCode').select(); try{ navigator.clipboard.writeText($('tCode').value).then(()=>{ $('tCodeMsg').textContent='Copied.'; }); }catch(e){ document.execCommand('copy'); $('tCodeMsg').textContent='Copied.'; } };
  $('tCodeLoad').onclick = () => { try{ const s = loadCode($('tCode').value); if(confirm('Replace the current game with this save code?')){ S = s; UI.view = null; landSave(); const line = migratedLine(S); $('tCodeMsg').textContent = line ? 'Loaded. ' + line : 'Loaded.'; teacherClose(); if(line) toast(line); } }catch(e){ $('tCodeMsg').textContent = 'That code did not work: '+e.message; } };
  document.addEventListener('keydown', e => { if(e.ctrlKey && e.shiftKey && (e.key==='T'||e.key==='t')){ e.preventDefault(); $('teacher').hidden ? teacherOpen() : teacherClose(); } if(e.key==='Escape' && !$('teacher').hidden) teacherClose(); });
  let taps = [];
  $('corner').addEventListener('click', () => { const now = Date.now(); taps = taps.filter(t => now-t < 1500); taps.push(now); if(taps.length>=3){ taps=[]; teacherOpen(); } });
}

/* ==================================================================
   BOOT
   ================================================================== */
function boot(){
  initSpeech();
  if(IS_DISPLAY){
    document.body.classList.add('display');
    fitWall(); window.addEventListener('resize', fitWall);
    S = load();
    const goFs = () => { const r = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen; if(r) try{ const p = r.call(document.documentElement); if(p && p.catch) p.catch(()=>{}); }catch(e){} };
    $('dFs').onclick = goFs;
    const wantFs = /[?&]fs/.test(location.search);
    const tap = $('tapFs');
    const syncTap = () => { tap.hidden = !wantFs || !!(document.fullscreenElement || document.webkitFullscreenElement); };
    tap.onclick = () => { goFs(); setTimeout(syncTap, 300); };
    document.addEventListener('fullscreenchange', syncTap); setTimeout(syncTap, 600);
    initWork();
    if(S) renderDisplay();
    send({type:'hello'});
    setInterval(() => { if(S && S.rnd && S.rnd.anim) renderDisplay(); }, 1000);
    setInterval(() => { if(S) renderDisplay(); }, 8000);      // boards page through long lists
    return;
  }
  S = load() || newState();
  initTeacher();
  $('shopBtn').onclick = () => { if(S.overlay && S.overlay.type==='shop') closeOverlay(); else if(step().t==='shop' || step().t==='welcome' || step().t==='name') toast('The shop opens after setup'); else openShop(); };
  $('fleetBtn').onclick = () => { if(!S.fleet.length){ toast('No planes yet'); return; } S.overlay = (S.overlay && S.overlay.type==='fleet') ? null : {type:'fleet'}; render(); };
    $('presentBtn').onclick = toggleFullscreen;
    document.addEventListener('fullscreenchange', syncFsBtn); document.addEventListener('webkitfullscreenchange', syncFsBtn); syncFsBtn();
  $('menuBtn').onclick = openMenu;
  initTestBar();
  // the Operations Wall on this screen: ▣ in the top bar, the W key, Return to HQ / Esc to come back
  $('wallBtn').onclick = () => setWallView(!wallView); $('wReturn').onclick = () => setWallView(false);
  $('bellBtn').onclick = () => { S.overlay = (S.overlay && S.overlay.type==='alerts') ? null : {type:'alerts'}; render(); };
  initWork(); fitWall(); window.addEventListener('resize', () => { fitWall(); if(!wallView && S && S.steps && step().t === 'hq' && !S.overlay && hqLayout() !== UI.hqLay) render(); });
  document.addEventListener('keydown', e => { const tg = e.target && e.target.tagName; if(e.ctrlKey || e.metaKey || e.altKey || ['INPUT','TEXTAREA','SELECT'].includes(tg) || !$('teacher').hidden) return;
    if(e.key === 'w' || e.key === 'W'){ if(!step() || ['welcome','name'].includes(step().t)) return; e.preventDefault(); setWallView(!wallView); }
    else if(e.key === 'Escape' && wallView){ e.preventDefault(); setWallView(false); } });
  setInterval(() => { if(wallView) renderDisplay(); }, 8000);
  if(S.needsRestart && !landSave()) startRound(S.round);
  // if the page was refreshed mid-flight, finish the flight
  if(step().t==='fly' && !S.rnd.live && S.rnd.anim && Date.now()-S.rnd.anim.start > S.rnd.anim.dur) next();
  setInterval(() => { send({type:'ping'}); updateStrip(); }, 4000);
  // opening the game always starts on the home screen: carry on, or start again
  const started = S.airline && S.airline.name && !['welcome','name'].includes(step().t);
  if(started && !S.overlay) S.overlay = { type:'menu' };
  $('homeFab').onclick = openMenu;
  render();
}
window.__sim = { S:()=>S, step, next, loadCode, saveCode, migrate, landSave:()=>landSave(), setS:(v)=>{ S = v; }, practiceAnswer:(k) => { const st = S.steps[S.si], P = st && st.pq; if(!P) return null; const q = PRACTICE[P.key].render(P.qs[Math.min(P.i, P.qs.length - 1)]); return { kind:q.kind, answer:q.answer, text: q.kind === 'time' ? fmtTime(q.answer) : String(q.answer) }; }, startRound, advance, paxFor, periodLabel, simulateRun, monthlyProfit, investable, settings:()=>settings, render, planFlights, questionBank, schedOf, TIME, timeSelfTest, tableComplete, nextOpenCell, cellState, currentTable, routeById, planeById, fillTable };
document.addEventListener('DOMContentLoaded', boot);
})();
</script>
</body>
</html>
