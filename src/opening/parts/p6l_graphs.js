/* =====================================================================
   ROUND 4 GRAPHS (Claude Design's hand-off "the Sunday graphs", 2 Nov 2026; approved by Bertie). Chapter one only (ch1()).
     1 · YOUR WEEK IN PICTURES: from week graphsFromWeek (2), once the last Sunday sum is right, a green "Your week in
         pictures ▶" opens a page with two graphs side by side; footer ◀ Back to the sums · Plan week n ▶. Weeks 2 to 5 end on
         the Sunday sheet review (weekReview); from week 6 the week's review is the Monday "How did week n go?" (review).
         Chapter one has no month review before its end card, so the graphs stop with week 13.
     2 · GRAPH 1 "Your plan against the best plan": a pair of bars a week (his profit gold, the best plan with his planes a
         white outline, the gap striped amber on top of his bar), £0 up in graph1StepPounds steps, at least graph1MinWeeks
         slots, figures only beside the latest week, a cyan triangle under the week routes opened. No running total.
     3 · GRAPH 2 "Where the money is": one row per route his planes can fly, longest first: profit for each hour of plane
         time = the profit one of his planes makes flying that route all day (as many flights as fit), ÷ the hours flown.
         His fare, or the route's usual fare if he doesn't fly it; next week's demand, so a route Red Kite took is shorter
         and carries the kite. In his plan: solid in the route's colour; not: dashed, "not in your plan".
     4 · ONE QUESTION, only when the gap is over graphQuestionGapShare (10%) of the best plan and the pause has room (it
         takes one of the pause's two counted slots): alternately a paper sum under Graph 1 (best − his) and a Read the
         graph pick under Graph 2 (the longest bar). Counted: a Calculate in the record, SUM n, two tries.
     5 · MONDAY: Last week's graphs ▾ on the plan page drops both graphs down (last Sunday's figures, no question).
     6 · MONDAY NEWS: the departures-board card when Red Kite takes a route, and the Board's note (p6k decides when);
         each once, before the plan. They replace round 4's This-week row and the opener panel.
   Words: ScreenText pics.*, news.* (tools/merge_r4b.py); route colours: the Routes table. All PLACEHOLDER.
   ===================================================================== */
{
const on7 = () => typeof ch1 === 'function' && ch1();
const SET = () => (typeof WBS === 'function' ? WBS() : {}) || {};
const num7 = (k, d) => { const v = +SET()[k]; return v > 0 ? v : d; };
const X7 = () => { S.c7 = S.c7 || {}; ['seen', 'g2', 'q', 'news'].forEach(k => { S.c7[k] = S.c7[k] || {}; }); return S.c7; };
const T7 = (id, v) => { try{ const T = h21Text(id, v || {}); return Object.assign({ title:'', text:[], button:'', eyebrow:'' }, T, { text:T.text || [] }); }catch(e){ return { title:'', text:[], button:'', eyebrow:'' }; } };
const tl = (id, i, d, v) => T7(id, v).text[i] || d;
const colOf = id => { const w = ((typeof WB !== 'undefined' && WB.routes) || []).find(x => x.id === id); return (w && w.colour) || String(SET().routeColourDefault || '#4a6f99'); };
const k$ = v => `£${Math.round(v / 1000)}k`;
const monOf = d => 7 * (weekNo(d) - 1) + 1;
const fromWeek = () => num7('graphsFromWeek', 2);

/* ---------- the figures ---------- */
/* Graph 1: every week from 1 to the one ending lastFrom + 6 (p6k's cache of the best-plan line) */
function c7G1(lastFrom){
  const out = []; for(let f = 1; f <= lastFrom; f += 7){ let g = null; try{ g = window.__c6 && window.__c6.gap(f); }catch(e){} out.push({ wk:weekNo(f), from:f, g, opened:c7Opened(f) }); }
  return out;
}
function c7Opened(f){ const before = new Set((f === 1 ? openRoutes(1) : openRoutes(f - 1)).map(r => r.id)); return openRoutes(f + 6).filter(r => !before.has(r.id)).map(r => r.city); }
/* Graph 2: the routes his planes can fly (open on the review's Sunday), profit for each hour of plane time next week */
function c7G2(from){
  const Y = X7(); if(Y.g2[from]) return Y.g2[from];
  const sun = from + 6, d = from + 9, R = (S.c6 && S.c6.rival) || {}, mine = ownedRoutes();
  const rows = [];
  try{
    const vals = dryRun(() => withDay(d, () => withBeat(beatAt(d), () => { S.day = d;
      const out = {};
        openRoutes(sun).forEach(r => { const j = S.fleet.findIndex(f => { const p = planeById(f.planeId); return p && planeCanFly(p, r); }); if(j < 0) return;
          const p = planeById(S.fleet[j].planeId), base = currentPlan(); base.fleet.forEach(x => { x.sched = []; x.deps = null; }); base.prices = Object.assign({}, S.prices);
          if(!mine.includes(r.id) || !base.prices[r.id]) base.prices[r.id] = (mine.includes(r.id) && S.prices[r.id]) || r.basePrice;
          const empty = planLines(base).v.profit, x = base.fleet[j], sch = [];
          while(sch.length < (WORLD.maxTrips || 4) && canAddTrip(p, sch, r)) sch.push(r.id);
          if(!sch.length) return; x.sched = sch;
          const full = planLines(base).v.profit, hours = sch.length * TIME.roundTrip(p, r) / 60;
          out[r.id] = hours > 0 ? (full - empty) / hours : 0; });
      return out; })));
    Object.keys(vals).forEach(id => { const r = routeById(id); rows.push({ id, city:r.city, flag:r.flag, v:Math.round(vals[id] / 5) * 5, mine:mine.includes(id), kite:!!(R[id] && R[id].day <= from + 7) }); });
  }catch(e){ console.error(e); }
  rows.sort((a, b) => b.v - a.v);
  return (Y.g2[from] = rows);
}
/* ---------- drawing ---------- */
const PAT = id => `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="rgba(255,181,71,.22)"/><rect width="2.2" height="6" fill="#ffb547"/></pattern>`;
function c7Legend(){ const L = T7('pics.g1').text;
  return `<div class="c7-leg"><span><i class="c7-sw y"></i>${esc(L[0] || 'Yours')}</span><span><i class="c7-sw b"></i>${esc(L[1] || 'Best plan')}</span><span><i class="c7-sw g"></i>${esc(L[2] || 'Gap')}</span></div>`; }
/* o: { w, h, weeks:[{wk, g, opened}], slots, figs (figures beside the latest week), id, small } */
function c7G1Svg(o){
  const W = o.w, H = o.h, step = num7('graph1StepPounds', 5000), wk = o.weeks.filter(x => x.g);
  const n = Math.max(o.slots || num7('graph1MinWeeks', 6), o.weeks.length), last = o.weeks[o.weeks.length - 1];
  const maxV = Math.max(step, ...wk.map(x => Math.max(x.g.yours, x.g.best))), top = (Math.floor(maxV / step) + 1) * step;
  const fs = o.small ? 11.5 : 13.5, x0 = o.small ? 40 : 48, rm = o.figs && o.weeks.length >= n ? 84 : 10, x1 = W - rm, y0 = 8, bot = o.small ? 46 : 60, y1 = H - bot;
  const y = v => y1 - Math.max(0, v) / top * (y1 - y0), sw = (x1 - x0) / n, bw = Math.min(o.small ? 20 : 30, sw * 0.32), gp = Math.min(6, sw * 0.08), gid = (o.id || 'c7') + 'Gap';
  let s = `<svg class="c7-g1" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(T7('pics.g1').title || 'Your plan against the best plan')}"><defs>${PAT(gid)}</defs>`;
  for(let v = 0; v <= top; v += step){ const yy = y(v).toFixed(1); s += `<line x1="${x0}" x2="${x1}" y1="${yy}" y2="${yy}" class="${v ? 'c7-gl' : 'c7-ax'}"/>`; if(v % (2 * step) === 0) s += `<text x="${x0 - 8}" y="${(+yy + 4).toFixed(1)}" text-anchor="end" class="c7-yl" font-size="${fs - 1}">${k$(v)}</text>`; }
  let lastMark = -9, row = 0;
  o.weeks.forEach((x, i) => { const cx = x0 + sw * (i + 0.5), L = cx - gp / 2 - bw, Rb = cx + gp / 2;
    if(x.g){ const yo = x.g.yours, b = Math.max(x.g.best, yo);
      if(yo > 0) s += `<rect x="${L.toFixed(1)}" y="${y(yo).toFixed(1)}" width="${bw.toFixed(1)}" height="${(y(0) - y(yo)).toFixed(1)}" class="c7-yo"/>`;
      if(b > yo) s += `<rect x="${L.toFixed(1)}" y="${y(b).toFixed(1)}" width="${bw.toFixed(1)}" height="${(y(Math.max(0, yo)) - y(b)).toFixed(1)}" fill="url(#${gid})" class="c7-gp"/>`;
      s += `<rect x="${Rb.toFixed(1)}" y="${y(b).toFixed(1)}" width="${bw.toFixed(1)}" height="${(y(0) - y(b)).toFixed(1)}" class="c7-be"/>`;
      if(o.figs && x === last){ const fx = Rb + bw + 8; let yb = y(b) + 4, yy = y(Math.max(0, yo)) + 4; if(yy - yb < 16) yb = yy - 16;
        s += `<text x="${fx.toFixed(1)}" y="${yb.toFixed(1)}" class="c7-fb" font-size="${fs + 0.5}">${money(b)}</text><text x="${fx.toFixed(1)}" y="${yy.toFixed(1)}" class="c7-fy ${yo < 0 ? 'neg' : ''}" font-size="${fs + 0.5}">${money(yo)}</text>`; } }
    s += `<text x="${cx.toFixed(1)}" y="${(y1 + 16).toFixed(1)}" text-anchor="middle" class="c7-wl" font-size="${fs}">${esc(tl('pics.g1', 3, 'Wk {n}', { n:x.wk }).replace('{n}', x.wk))}</text>`;
    if(x.opened && x.opened.length && !o.noMarks){
      row = i - lastMark === 1 ? 1 - row : 0; lastMark = i;
      let t = x.opened.join(' · '); const room = sw * (row ? 2.2 : 2.6); if(t.length * fs * 0.56 > room) t = x.opened.length > 1 ? tl('pics.g1', 4, 'New routes') : x.opened[0];
      const tw = t.length * fs * 0.56, tx = Math.max(tw / 2 + 2, Math.min(W - tw / 2 - 2, cx)), ty = y1 + 22;
      s += `<path d="M${cx.toFixed(1)} ${ty} l5 8 h-10 z" class="c7-tri"/><text x="${tx.toFixed(1)}" y="${(ty + 20 + row * 14).toFixed(1)}" text-anchor="middle" class="c7-ml" font-size="${fs - 1}">${esc(t)}</text>`; } });
  return s + '</svg>';
}
const KITE = '<svg class="c7-kite" viewBox="0 0 40 40" aria-label="Red Kite Air"><rect width="40" height="40" fill="#7a1428"/><path d="M8 19.5 L19 16 L21.5 6.5 L24 16 L33 13.5 L26.5 20 L29 21 L24.5 23 L22 33 L19.5 23 L11 24 L15 20.5 Z" fill="#f1e9dc"/></svg>';
/* o: { rows, bw (bar area px), small, hi (the right route, once answered) } */
function c7G2Html(o){
  const rows = o.rows || [], BW = o.bw || 270, maxV = Math.max(100, ...rows.map(r => r.v)), sc = BW * 0.86 / maxV, nin = tl('pics.g2', 1, 'not in your plan');
  const rh = Math.max(o.small ? 22 : 26, Math.min(o.small ? 34 : 36, (o.space || 380) / Math.max(1, rows.length)));
  const body = rows.map(r => { const w = Math.max(0, Math.round(r.v * sc)), cls = r.mine ? 'in' : 'out';
    return `<div class="c7-r ${o.hi === r.id ? 'hi' : ''}" style="height:${rh.toFixed(0)}px" data-c7r="${r.id}"><span class="c7-rn">${flagSvg(r.flag, o.small ? 12 : 14)}<b>${esc(r.city)}</b></span><span class="c7-rb">${w >= 4 ? `<i class="c7-bar ${cls}" style="width:${w}px;--c:${colOf(r.id)}"></i>` : ''}${r.kite ? KITE : ''}<b class="c7-rv ${r.mine ? '' : 'soft'} ${r.v < 0 ? 'neg' : ''}">${money(r.v)}</b>${r.mine ? '' : `<small class="c7-nin">${esc(nin)}</small>`}</span></div>`; }).join('');
  let ticks = ''; for(let v = 0; v * sc <= BW + 1; v += 100) ticks += `<span style="left:${(v * sc).toFixed(1)}px">${money(v)}</span>`;
  return `<div class="c7-g2 ${o.small ? 'small' : ''}" style="--bw:${BW}px"><div class="c7-rows">${body}</div><div class="c7-axis"><span class="c7-rn"></span><span class="c7-ticks">${ticks}</span></div><div class="c7-axl"><span class="c7-rn"></span><span>${esc(tl('pics.g2', 0, 'Profit for each hour of plane time'))}</span></div></div>`;
}

/* ---------- the question ---------- */
function c7Gap(from){ try{ return window.__c6 && window.__c6.gap(from); }catch(e){ return null; } }
function c7Question(from){
  const Y = X7(); if(Y.q[from] !== undefined) return Y.q[from] || null;
  const g = c7Gap(from), share = +(SET().graphQuestionGapShare) || 0.1;
  const big = g && g.best > 0 && (g.best - g.yours) / g.best > share, room = typeof c1Room === 'function' ? c1Room() : true;
  if(!big || !room){ Y.q[from] = null; return null; }
  const kind = Y.qLast === 'paper' ? 'read' : 'paper', key = `gq:${kind}:${from}`; Y.qLast = kind;
  const q = { kind, key };
  if(kind === 'paper') q.want = Math.max(0, Math.round(g.best) - Math.round(g.yours));
  else { const rows = c7G2(from); if(rows.length < 2){ Y.q[from] = null; return null; }
    const right = rows[0], others = rows.slice(1).sort(() => Math.random() - 0.5).slice(0, 3); q.want = right.id;
    q.opts = [right].concat(others).map(r => r.id).sort(() => Math.random() - 0.5); }
  return (Y.q[from] = q);
}
function c7QHtml(from, q){
  const n = sumNo(q.key), box = typeof c1SumBox === 'function' ? c1SumBox(n) : `SUM ${n}`, W = T7('pics.q.wrong', { answer:q.kind === 'paper' ? money(q.want) : (routeById(q.want) || {}).city });
  const note = q.ok ? `<p class="c7-qn ok">${esc(W.text[q.shown ? 1 : 2] || (q.shown ? `The answer: ${money(q.want)}.` : '✓ Right'))}</p>` : q.note ? `<p class="c7-qn">${esc(q.note)}</p>` : '';
  if(q.kind === 'paper'){ const T = T7('pics.q.paper', { sum:'{sum}' }), line = esc((T.text[0] || 'How much more could your plan have made this week? Write {sum} beside it.')).replace('{sum}', box);
    return `<div class="c7-q paper ${q.ok ? 'ok' : ''}" id="c7Q" role="group" aria-label="${esc(T.title || 'Work it out on paper')}"><i class="c7-qp" aria-hidden="true"></i><div class="c5-sig-m">${C1_ICO.paper}<b>${esc(T.title || 'Work it out on paper')}</b></div><p class="c5-sig-t">${line}</p>
      <div class="c7-qa"><label class="c7-ans"><span>£</span><input id="c7Ans" inputmode="decimal" autocomplete="off" aria-label="Your answer" ${q.ok ? `value="${num(q.want)}" disabled` : ''}></label>${q.ok ? '' : `<button class="c1-key c7-ent" id="c7Enter">${esc(T.button || 'Enter')} &#8629;</button>`}</div>${note}</div>`; }
  const T = T7('pics.q.read', { sum:'{sum}' }), line = esc(T.text[0] || 'Which route earns most for each hour of plane time? Pick one. It counts as {sum}.').replace('{sum}', box);
  const ico = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 14h12M3.5 12V8M7 12V4M10.5 12V6.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  return `<div class="c7-q read ${q.ok ? 'ok' : ''}" id="c7Q" role="group" aria-label="${esc(T.title || 'Read the graph')}"><i class="c7-qp" aria-hidden="true"></i><div class="c5-sig-m">${ico}<b>${esc(T.title || 'Read the graph')}</b></div><p class="c5-sig-t">${line}</p>
    <div class="c7-picks">${q.opts.map(id => { const r = routeById(id); return `<button class="c7-pick ${q.ok && id === q.want ? 'right' : ''} ${(q.wrong || []).includes(id) ? 'wrong' : ''}" data-c7pick="${id}" ${q.ok ? 'disabled' : ''}>${flagSvg(r.flag, 14)} ${esc(r.city)}</button>`; }).join('')}</div>${note}</div>`;
}
function c7Answer(from, given){
  const q = X7().q[from]; if(!q || q.ok) return;
  let ok, val = given;
  if(q.kind === 'paper'){ val = parseFloat(String(given).replace(/[£,\s]/g, '').replace(/[−–]/g, '-')); if(!isFinite(val)) return; ok = Math.abs(val - q.want) < 0.5; }
  else ok = given === q.want;
  try{ const e = recOpen(q.key, { type:'calc', relKey:q.kind === 'paper' ? 'difference' : 'reading a graph', doc:'Your week in pictures', ask:q.kind === 'paper' ? 'How much more could your plan have made this week?' : 'Which route earns most for each hour of plane time?',
      question:q.kind === 'paper' ? `Best plan ${money(c7Gap(from).best)} − your plan ${money(c7Gap(from).yours)}` : 'The longest bar on Where the money is', unit:q.kind === 'paper' ? '£' : '', correct:q.want, correctText:q.kind === 'paper' ? money(q.want) : routeById(q.want).city, ops:[], op:q.kind === 'paper' ? '−' : '', level:'Calculate' });
    recAttempt(e, { ok, given:q.kind === 'paper' ? String(given) : routeById(given).city, value:val, method:q.kind === 'paper' ? 'worked on paper, answer typed' : 'read from the graph' }); }catch(x){}
  if(ok){ q.ok = true; q.note = null; }
  else { q.tries = (q.tries || 0) + 1; if(q.kind === 'read') (q.wrong = q.wrong || []).push(given);
    if(q.tries >= 2 && (typeof twoTriesOn !== 'function' || twoTriesOn())){ q.ok = true; q.shown = true; try{ paperRecShown(q.key); }catch(x){} }
    else q.note = tl('pics.q.wrong', 0, 'Not quite. One more try.'); }
  save(); render();
}

/* ---------- 1 · the Sunday review → Your week in pictures ---------- */
/* the week a review screen is about: weeks 2–5 the Sunday sheet (S.wk), from week 6 the Monday review of the last week flown */
function c7Ctx(){
  const st = step(), t = st && st.t; if(!on7() || !t) return null;
  if(t === 'weekReview' && S.wk && S.wk.from) return { from:S.wk.from, t };
  if(t === 'review'){ const H = (S.history || []).filter(x => x.type === 'week'), h = H[H.length - 1]; if(h && h.to - h.from === 6) return { from:h.from, t }; }
  return null;
}
function c7Page(from, go){
  const wk = weekNo(from), q = c7Question(from), weeks = c7G1(from), rows = c7G2(from), P = T7('pics.page', { n:wk, next:wk + 1 });
  const qHtml = q ? c7QHtml(from, q) : '';
  const g1 = `<section class="bv-panel c7-p c7-p1"><h2>${esc(T7('pics.g1').title || 'Your plan against the best plan')}</h2>${c7Legend()}<div class="c7-g1w">${c7G1Svg({ w:520, h:q && q.kind === 'paper' ? 300 : 430, weeks, figs:true, id:'c7a' })}</div>${q && q.kind === 'paper' ? qHtml : ''}</section>`;
  const g2 = `<section class="bv-panel c7-p c7-p2"><h2>${esc(T7('pics.g2').title || 'Where the money is')}</h2>${c7G2Html({ rows, bw:236, space:q && q.kind === 'read' ? 250 : 400, hi:q && q.kind === 'read' && q.ok ? q.want : null })}${q && q.kind === 'read' ? qHtml : ''}</section>`;
  const sub = P.text[0] || 'Your week in pictures', hint = P.text[1] || `Sunday review · week ${wk}`, can = !q || q.ok;
  screen().innerHTML = shell(deskPage({ title:esc(P.title || `How did week ${wk} go?`), sub:esc(sub), cls:'c7-page', body:`<div class="c7-two">${g1}${g2}</div>` }),
    deskBar(esc(hint), `<button class="bv-btn big" id="c7Back">${esc(T7('pics.back').button || '◀ Back to the sums')}</button><button class="bv-btn go big" id="nx" ${can ? '' : 'disabled'}>${esc((P.button || `Plan week ${wk + 1} ▶`).replace('▶', '')).trim()} &#9654;</button>`));
  // the question's pointer at the latest week's bars (Graph 1) or the top row (Graph 2)
  try{ const qe = document.getElementById('c7Q'); if(qe){ const pt = qe.querySelector('.c7-qp');
      if(q.kind === 'paper'){ const svg = screen().querySelector('.c7-p1 svg'), bars = svg && svg.querySelectorAll('.c7-be'), b = bars && bars[bars.length - 1];
        if(b){ const r = b.getBoundingClientRect(), Q = qe.getBoundingClientRect(); pt.style.left = Math.max(14, Math.min(Q.width - 28, r.left - Q.left - 6)) + 'px'; } }
      else pt.style.left = '110px'; } }catch(e){}
  on('c7Back', () => { UI.c7pics = null; render(); });
  on('nx', () => { const qq = X7().q[from]; if(qq && !qq.ok) return; UI.c7pics = null; go && go(); });
  const ent = () => { const i = document.getElementById('c7Ans'); if(i && i.value.trim()) c7Answer(from, i.value); };
  on('c7Enter', ent); const inp = document.getElementById('c7Ans'); if(inp){ inp.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); ent(); } }; if(!q.ok) setTimeout(() => { try{ inp.focus(); }catch(e){} }, 0); }
  screen().querySelectorAll('[data-c7pick]').forEach(b => b.onclick = () => c7Answer(from, b.getAttribute('data-c7pick')));
}
function c7AfterRender(){
  const C = c7Ctx(); if(!C) return; const wk = weekNo(C.from); if(wk < fromWeek()) return;
  const nx = document.getElementById('nx'); if(!nx || nx.disabled) return;   // the sums come first
  const go = nx.onclick, Y = X7();
  if(UI.c7pics === C.from) return c7Page(C.from, go ? () => go.call(nx) : null);
  // in the line under the sheet (the Sunday sheet) or the footer (the Monday review): Your week in pictures ▶; Plan week waits until he has seen them
  const label = esc((T7('pics.go').button || 'Your week in pictures ▶').replace('▶', '').trim());
  const btn = `<button class="bv-btn go big c7-go" id="c7Pics">${label} &#9654;</button>`;
  const line = screen().querySelector('section.ash .ash-line');
  if(line){ line.classList.add('c7-line'); line.insertAdjacentHTML('beforeend', btn); } else nx.insertAdjacentHTML('beforebegin', btn);
  if(!Y.seen[C.from]) nx.remove(); else nx.classList.remove('go');
  on('c7Pics', () => { X7().seen[C.from] = S.day || 1; UI.c7pics = C.from; save(); render(); });
}
const c7R0 = render;
render = function(){ const r = c7R0.apply(this, arguments); try{ if(on7()) c7AfterRender(); }catch(e){ console.error(e); } try{ if(on7()) c7Monday(); }catch(e){ console.error(e); } return r; };

/* ---------- 5 · Monday: Last week's graphs ▾ ---------- */
function c7Monday(){
  const st = step(); if(!st || st.t !== 'plan' || S.phase === 'setup') return;
  const wk = weekNo(S.day || 1), last = monOf(S.day || 1) - 7; if(wk - 1 < fromWeek() || last < 1) return;
  if(!X7().seen[last] && !(S.c6 && S.c6.gap && S.c6.gap[last])) return;   // only after a Sunday that had the graphs
  if(screen().querySelector('.c7-mon') || screen().querySelector('.c7-news')) return;
  const open = UI.c7mon === S.day, label = esc(T7('pics.monday').button || "Last week's graphs");
  const btn = `<button class="bv-btn c7-mon ${open ? 'open' : ''}" id="c7Mon" aria-expanded="${open}">${label} ${open ? '&#9652;' : '&#9662;'}</button>`;
  const undo = document.getElementById('c1Undo'), act = screen().querySelector('.c1-ttact');
  if(undo) undo.insertAdjacentHTML('beforebegin', btn);
  else if(act) act.insertAdjacentHTML('afterbegin', btn);
  else { const hd = screen().querySelector('.dp-head'); if(!hd) return; hd.insertAdjacentHTML('beforeend', `<div class="c7-monw">${btn}</div>`); }
  if(open){ const weeks = c7G1(last), rows = c7G2(last), b = document.getElementById('c7Mon').getBoundingClientRect(), main = screen().querySelector('.shell-main') || screen();
    const M = main.getBoundingClientRect(), w = Math.min(1054, M.width - 16), left = Math.max(8, M.width - w - 8), notch = Math.round(b.left - M.left + b.width / 2 - left - 8);
    if(getComputedStyle(main).position === 'static') main.style.position = 'relative';
    main.insertAdjacentHTML('beforeend', `<div class="c7-drop" role="dialog" aria-label="${label}" style="left:${left}px;top:${Math.round(b.bottom - M.top + 9)}px;width:${w}px"><i class="c7-notch" style="left:${notch}px"></i>
      <div class="c7-dl"><h2>${esc(T7('pics.g1').title || 'Your plan against the best plan')}</h2>${c7Legend()}${c7G1Svg({ w:480, h:280, weeks, figs:false, small:true, id:'c7m' })}</div>
      <div class="c7-dr"><h2>${esc(T7('pics.g2').title || 'Where the money is')}</h2>${c7G2Html({ rows, bw:190, small:true, space:250 })}</div></div>`); }
  on('c7Mon', () => { UI.c7mon = UI.c7mon === S.day ? null : S.day; render(); });
}

/* ---------- 6 · Monday news: Red Kite takes a route, the Board's note ---------- */
function c7NewsDue(){
  if(!on7() || S.phase === 'setup') return null; const st = step(); if(!st || st.t !== 'plan') return null;
  const Y = X7(), mon = monOf(S.day || 1), R = (S.c6 && S.c6.rival) || {};
  const r = Object.keys(R).find(id => R[id].day === mon && !Y.news['r:' + id + ':' + mon] && routeById(id)); if(r) return { kind:'rival', id:r, key:'r:' + r + ':' + mon };
  let B = null; try{ B = window.__c6 && window.__c6.board(); }catch(e){}
  if(B && B.wk === weekNo(S.day || 1) && !Y.news['b:' + B.wk] && (!S.c6 || S.c6.boardSeen !== B.wk)) return { kind:'board', B, key:'b:' + B.wk };
  return null;
}
function c7NewsCard(N, st){
  const day = S.day || 1, air = (S.airline && S.airline.name) || 'your airline', date = typeof dateShort === 'function' ? dateShort(day) : '';
  let head, card;
  if(N.kind === 'rival'){ const r = routeById(N.id), T = T7('news.rival', { city:r.city, airport:`${r.city.toUpperCase()} ${r.code || r.airportCode || ''}`.trim(), date }), times = T7('news.rival.times').text.length ? T7('news.rival.times').text : ['07:10', '12:40', '17:55'];
    const board = `<div class="c7-dboard" role="img" aria-label="${esc(`Red Kite Air's departures from ${r.city}`)}"><div class="c3-bh">${esc(T.text[1] || `DEPARTURES · ${r.city.toUpperCase()}`)}</div>${times.map(t => `<div class="c7-dfl"><span class="mono">${esc(t)}</span><span>${esc(T.text[2] || 'LONDON')}</span><b class="c7-rk">${esc(T.text[3] || 'RED KITE AIR')}</b></div>`).join('')}</div>`;
    head = { eye:T.eyebrow || 'NEWS · RED KITE AIR', cls:'rk', title:T.title || `Red Kite Air now flies to ${r.city}`, line:T.text[0] || `Fewer people will want to fly ${r.city} with you.`, btn:T.button || 'Plan the week ▶', hint:T.text[4] || `Monday news · ${date}` }; card = board; }
  else { const T = T7('news.board', { airline:air.toUpperCase(), date }), wkN = N.B.wk, weeks = c7G1(7 * (wkN - 2) + 1).filter(x => x.wk >= wkN - (num7('boardGapWeeks', 3)));
    const note = `<div class="c7-note"><div class="c7-nl"><span class="c3-bh">${esc(T.text[1] || `${air.toUpperCase()} · THE BOARD`)}</span><p>${esc(T.text[2] || 'Profit is good.')}<br>${esc(T.text[3] || 'Our shareholders want the most profit our planes can make.')}</p><small>${esc((T.text[4] || `Signed, the Board of ${air}`).replace(air.toUpperCase(), air))}</small></div>
      <div class="c7-nr">${c7G1Svg({ w:380, h:170, weeks, slots:weeks.length, figs:false, small:true, noMarks:true, id:'c7b' })}${c7Legend()}</div></div>`;
    head = { eye:T.eyebrow || 'A NOTE FROM THE BOARD', cls:'cy', title:T.title || 'The Board would like a word', line:T.text[0] || 'Three weeks running, your plan made less than the best plan.', btn:T.button || 'Plan the week ▶', hint:T.text[5] || `Monday news · ${date}` }; card = note; }
  screen().innerHTML = shell(`<div class="c7-news"><p class="c7-crumb">${esc(air)} HQ · Plan</p>${card}<span class="bv-eyebrow c7-eye ${head.cls}">${esc(head.eye)}</span><h1 class="c7-nt">${esc(head.title)}</h1><p class="c7-nline">${esc(head.line)}</p>
    <button class="bv-btn primary big" id="c7NewsGo">${esc(head.btn.replace('▶', '').trim())} &#9654;</button></div>`, deskBar(esc(head.hint), ''));
  on('c7NewsGo', () => { const Y = X7(); Y.news[N.key] = S.day || 1; if(N.kind === 'board' && S.c6) S.c6.boardSeen = N.B.wk; save(); render(); });
}
const c7Plan0 = R.plan;
R.plan = st => { try{ const N = c7NewsDue(); if(N) return c7NewsCard(N, st); }catch(e){ console.error(e); } return c7Plan0(st); };

/* ---------- the toolkit: the new buttons are steps too ---------- */
const tkPre7 = window.__tkPre;
window.__tkPre = R2 => { try{ const n = document.getElementById('c7NewsGo'); if(n){ n.click(); return 'Monday news: read'; }
    const p = document.getElementById('c7Pics'); if(p && !document.getElementById('nx')){ p.click(); return 'Your week in pictures'; } }catch(e){} return tkPre7 ? tkPre7(R2) : null; };
if(window.__tkSums) window.__tkSums.unshift({ what:'the graph question', test:() => !!document.querySelector('.c7-q:not(.ok)'), plan:() => { const C = c7Ctx(), q = C && X7().q[C.from];
  if(!q) return null; return { at:'#c7Q', value:q.kind === 'paper' ? money(q.want) : routeById(q.want).city, go:() => c7Answer(C.from, q.kind === 'paper' ? String(q.want) : q.want) }; } });
window.__c7 = { g1:c7G1, g2:c7G2, question:c7Question, answer:c7Answer, ctx:c7Ctx, news:c7NewsDue };
}
