/* =====================================================================
   THE SHEETS OF YEAR ONE, PART 1 (handover 19 Oct evening, sections 7.2–7.4 and 3.4): the Launch Day sheet, the Studio
   with no sums, a plan change on the Changes tab, the Monday sheet and the event sums on a small sheet. Year one only.
   - Which sums are the pupil's, and how each is done (the formula shown, or built by clicking the cells) comes from the workbook's
     sum list (SheetSums, D105); ASH_SUMS holds the same defaults for a save made before the sheet was imported.
   - Launch Day: one sheet stays on screen for all the day's sums (7.3). The pupil's options are the columns (the first market at
     three fares around their own, then each other route in their plan), then Your plan with the costs under it like a
     balance sheet, then the cabin sales block. The fares and the snack price are the ones in their plan: the sheet has no
     choice of its own ("Back changes the plan"). The week's fuel order is not on it: it is placed on the Fuel desk.
   ===================================================================== */
const ASH_SUMS = { 'launch.tickets':{ whose:'pupil', how:'book' }, 'launch.otherTickets':{ whose:'pupil', how:'book' }, 'launch.profit':{ whose:'pupil', how:'book' }, 'launch.cabin':{ whose:'pupil', how:'build' },
  'changes.difference':{ whose:'pupil', how:'build once' }, 'week.total':{ whose:'pupil', how:'build' }, 'week.difference':{ whose:'pupil', how:'build' }, 'week.average':{ whose:'pupil', how:'build' },
  'event.stay':{ whose:'pupil', how:'book' }, 'event.business':{ whose:'pupil', how:'book' }, 'fuel.order':{ whose:'pupil', how:'book' } };
function ashSum(id){ const w = (((typeof WB !== 'undefined' && WB && WB.sheetSums) || WORLD.sheetSums) || []).find(x => x.sum === id);   /* the workbook's SheetSums (D105) */ return Object.assign({}, ASH_SUMS[id] || {}, w ? { whose:w.whose || (ASH_SUMS[id] || {}).whose, how:w.how || (ASH_SUMS[id] || {}).how } : {}); }
const ashPupils = id => !/^(ƒ|f|airline)$/i.test(String(ashSum(id).whose || 'pupil').trim());

/* ---------- Launch Day: the day's sums, as the sum list sets them; no fuel order on the sheet ---------- */
const ashHands0 = decideHandSumsPlanner;
decideHandSumsPlanner = function(L, pl){
  const H = ashHands0(L, pl); if(!(ashOn() && S.phase === 'setup')) return H;
  const ids = [...new Set(normPlan(pl).fleet.flatMap(x => x.sched))], mk = S.market;
  H.revenue = { level:'calc', routes:(ashPupils('launch.tickets') ? [mk] : []).concat(ashPupils('launch.otherTickets') ? ids.filter(id => id !== mk) : []) };
  if(!H.revenue.routes.length) delete H.revenue;
  if(ashPupils('launch.profit')) H.profit = 'calc'; else delete H.profit;
  if(H.snacks || (snacksOn() && !skills().snacks)) H.snacks = ashPupils('launch.cabin') ? (ashSum('launch.cabin').how === 'build' ? 'build' : 'calc') : undefined;
  if(!H.snacks) delete H.snacks; delete H.fuelCost; return H;
};
const ashStages0 = wkStagesLaunch;
wkStagesLaunch = function(pl){ const st = ashStages0(pl); if(!(ashOn() && S.phase === 'setup')) return st; return st.filter(s => s.id !== 'fuelorder' && s.id !== 'fuel' && !/^fc\|/.test(s.id)); };
/* the sheet has no choices of its own: the fare and the snack price are the plan's */
function ashLaunchModel(){
  const pl = currentPlan(), L0 = planLines(pl), stages = wkStagesLaunch(pl), P = S.rnd.picks || (S.rnd.picks = {}), np = normPlan(pl);
  const fare = stages.find(s => s.id === 'fare'), snack = stages.find(s => s.id === 'snack');
  if(fare){ const f = np.prices[S.market] || routeById(S.market).basePrice, o = fare.opts.find(x => x.pick && x.pick.fare === f); P.fare = o ? o.id : (P.fare && fare.opts.some(x => x.id === P.fare) ? P.fare : fare.opts[0].id); }
  if(snack){ const o = snack.opts.find(x => x.pick && x.pick.onboard === (np.onboard || 'none')); P.snack = o ? o.id : (P.snack && snack.opts.some(x => x.id === P.snack) ? P.snack : snack.opts[0].id); }
  const keep = S.rnd.activeTable, tabs = stages.map(st => ({ st, t:stageTable(st, L0).t })); S.rnd.activeTable = keep;
  return { pl:np, L0, stages:tabs };
}
const ashSeatsOn = (L, id) => (L.services || []).filter(s => s.route === id).reduce((t, s) => t + (s.seats || 0), 0);
const ashTyped = (t, colId, rowId) => { const rows = tRows(t), ri = rows.findIndex(r => r.id === rowId), col = t.cols.find(c => c.id === colId); return ri >= 0 && col ? cellState(t, col, ri) : 'none'; };
const ashShows = s => ['given', 'derived', 'done'].includes(s);
/* a sum that fills a cell of one of the game's tables: the record, two tries and Finance are the tables' own (p4zr, p4zi) */
function ashTableSum(o){
  const t = o.t, col = t.cols.find(c => c.id === o.col), row = tRows(t).find(r => r.id === o.row), key = paperCellKey(t, col, row), k = cellId(col.id, row.id);
  const ops = stackRows(t, col, row), vals = ops.map(x => operandValue(t, col, x.id));
  return Object.assign({ want:col.values[row.id], unit:row.unit === '£' ? '£' : '', built:!!t.chosen[k], done:!!t.done[k], shown:!!(S.rnd.paperShown || {})[t.id + '|' + k], recKey:key,
    get recO(){ try{ return recCellIdentity(t, col, row).o; }catch(e){ return {}; } }, get no(){ return sumNo(key); }, opVals:vals,
    answer:(raw, v, st) => {
      const T = (S.rnd.tables && S.rnd.tables[t.id]) || t, C = T.cols.find(c => c.id === o.col), R = tRows(T).find(r => r.id === o.row);
      T.active = { col:o.col, row:o.row }; S.rnd.activeTable = T.id; UI.entry = raw; UI.tries = st.tries || 0; T.chosen[k] = true;
      const res = checkCell(T, C, R, raw);
      if(res === 'ok'){ cellCorrect(T); const w = C.values[R.id];
        // people come whole: 23.8 typed for 24 business travellers is the right working, rounded here so the pupil sees it
        return R.unit === 'n' && Number.isInteger(w) && Math.abs(v - w) > 1e-9 ? { ok:true, note:`People come whole: ${v.toLocaleString('en-GB', { maximumFractionDigits:2 })} rounds to ${num(w)}.` } : { ok:true }; }
      cellWrong(res); if(T.done[k]) return { shown:true };
      if(res === 'sign') return { note:'This plan makes a loss, so the answer is below zero: put a minus sign in front (−). One more try.' };
      return { note:ashWrong(o.ops[0], vals, v, col.values[row.id], row.unit === '£' ? '£' : 'n') };
    },
    onBuilt:() => { t.chosen[k] = true; try{ soLog(`${o.name ? capFirst(o.name) : rowLabel(t, row)} (Build)`); }catch(e){} } }, o);
}
/* a hint from the pupil's own wrong number: the error it shows, or the sum in words to check in the book */
function ashWrong(op, vals, v, want, unit){
  let n = ''; try{ n = paperNumNote(v, want, unit === '£' ? '£' : unit, op, vals.length === 2 ? vals : null) || ''; }catch(e){}
  // the record's notes name the right figure ("(£17,295.00, not £17,395.00)"); on the sheet the pupil still has a try, so keep the diagnosis only
  n = n.replace(/\s*\([^()]*, not [^()]*\)/, '').replace(/: \S+ should be \S+\.$/, '.').replace(/, so the bill is .*$/, '.');
  const f = (x, i) => unit === '£' && i ? money(x) : num(x), a = vals[0], b = vals[1];
  const lots = op === '×' && vals.length === 2 ? `Check your working in the book: ${num(a)} lots of ${f(b, 1)}.` : op === '−' && vals.length === 2 ? `Check your working in the book: ${money(a)} take away ${money(b)}.` : op === '÷' && vals.length === 2 ? `Check your working in the book: ${money(a)} shared into ${num(b)}.` : 'Check your working in the book.';
  return `${n || lots} One more try.`;
}
/* the hints and Show me how for a × or − sum in the pupil's numbers (WorkingMethods: hintTemplate), with an estimate to check against */
function ashHintsFor(rel, op, a, b, want, money_){
  const est = ashRound(want), vals = { passengers:num(a), fare:money(b), tens:num(b / 10), rounded:num(ashRound(a)), estimate:money(ashRound(a) * b), revenue:money(a), share:String(b), n:num(Math.round(b * 10)), people:num(a) };
  if(op === '−') Object.assign(vals, { revenue:money(a), rounded:money(ashRound(a)), estimate:money(ashRound(a) - ashRound(b)) });
  const H = ashHintFill(rel, vals).map(t => ({ t }));
  H.push({ t:`Check: the answer should be about ${money_ ? money(est) : num(est)}.`, est:true });
  return H.slice(0, 3);
}
function ashHowFor(op, a, b, unitB, words){
  const a2 = op === '×' ? a + (a % 10 === 3 ? 4 : 3) : Math.round(a * 1.1 / 10) * 10, b2 = op === '×' ? (unitB === 'dec' ? b : b + 10) : Math.round(b * 0.9 / 10) * 10, lines = ashHowLines(a2, b2, op, unitB);
  return `<b>Show me how</b> (the same kind of sum with other numbers): ${esc(words)}, say ${esc(num(a2))} ${op} ${esc(unitB === '£' ? money(b2) : String(b2))}<ol>${lines.map(l => `<li>${esc(l)}</li>`).join('')}</ol>`;
}

/* ---------- the Launch Day sheet ---------- */
function ashLaunchSpec(){
  const M = ashLaunchModel(), { pl, L0, stages } = M, mk = S.market, rM = routeById(mk);
  const fareT = stages.find(x => x.st.id === 'fare'), tkTs = stages.filter(x => /^tk/.test(x.st.id)), profT = stages.find(x => x.st.id === 'profit'), snT = stages.find(x => x.st.id === 'snack');
  const cols = [], planFare = pl.prices[mk] || rM.basePrice; let ci = 1;
  if(fareT) fareT.t.cols.forEach(c => { const o = fareT.st.opts.find(x => x.id === c.id) || {}, f = (o.pick || {}).fare; cols.push({ c:ASH_LET[ci++], w:150, top:rM.city, flag:rM.flag, main:`at ${money(f)}`, plan:f === planFare, src:{ t:fareT.t, col:c.id, route:mk }, opt:o }); });
  tkTs.forEach(x => { const id = x.st.id.slice(2), r = routeById(id), c = x.t.cols[0]; if(!r || !c) return; cols.push({ c:ASH_LET[ci++], w:150, top:r.city, flag:r.flag, main:`at ${money(c.values['fare_' + id])}`, plan:true, src:{ t:x.t, col:c.id, route:id } }); });
  const P = ASH_LET[ci++], planTop = [mk].concat(tkTs.map(x => x.st.id.slice(2))).filter(id => routeById(id)).map(id => `${routeById(id).city} ${money(pl.prices[id] || routeById(id).basePrice)}`).join(' + ');
  cols.push({ c:P, w:216, top:planTop, main:'Your plan' });
  const rows = [{ r:1, t:'hdr' }, { r:2, label:'Passengers', ic:'person' }, { r:3, label:'Fare', ic:'tag' }, { r:4, label:'Ticket revenue', ic:'coins', gold:true },
    { r:5, label:'Total revenue', ic:'coins', t:'tot', gold:true }, { r:6, label:'Other costs', ic:'receipt', lk:{ text:"What's in this?", attr:'data-ashcosts' } },
    { r:7, label:'Fuel burned', ic:'drum', note:fuelPaid() ? '' : 'free on Launch Day' }, { r:8, label:'Total costs', ic:'receipt', t:'tot', gold:true }, { r:9, label:'Profit', ic:'chart', t:'fin', gold:true }];
  const v = {}, sums = [], seats = id => ashSeatsOn(L0, id);
  cols.forEach(k => { if(!k.src) return; const { t, col, route } = k.src, C = t.cols.find(c => c.id === col), V = C.values, pax = V['pax_' + route], st = { pax:ashTyped(t, col, 'pax_' + route), tk:ashTyped(t, col, 'tk_' + route) }, s = seats(route);
    v[k.c + 2] = { t:num(pax), bar:s ? pax / s : null, full:s && pax >= s }; v[k.c + 3] = { t:money(V['fare_' + route]) };
    v[k.c + 4] = ashShows(st.tk) ? { t:money(V['tk_' + route]), fin:!!(S.rnd.paperShown || {})[t.id + '|' + cellId(col, 'tk_' + route)] } : {};
    if(st.tk === 'enter' || st.tk === 'wait' || st.tk === 'done'){ const other = route !== mk, sid = other ? 'launch.otherTickets' : 'launch.tickets';
      sums.push(ashTableSum({ id:t.id + '|' + col + '|tk', t, col, row:'tk_' + route, tgt:k.c + 4, refs:[k.c + 2, k.c + 3], ops:['×'], words:'Passengers × Fare', kind:'tickets', commute:true,
        how:ashSum(sid).how === 'build' ? 'build' : 'book', name:`ticket revenue at ${money(V['fare_' + route])}`, aria:`${routeById(route).city} ticket revenue at ${money(V['fare_' + route])}`,
        doneLine:`${esc(routeById(route).city)} ticket revenue at ${money(V['fare_' + route])}: <b class="gold">${money(V['tk_' + route])}</b> a day`,
        hints:() => ashHintsFor('passengers × fare', '×', pax, V['fare_' + route], V['tk_' + route], true), how2:() => ashHowFor('×', pax, V['fare_' + route], '£', 'Ticket revenue = Passengers × Fare'),
        co:{ at:['B', 5, ASH_LET[Math.max(2, ci - 2)], 9], side:'pu', ptr:`left:${Math.max(30, ashCol(k.c) * 150 - 150 + 60)}px`, eyebrow:'NEW SUM', title:'Ticket revenue',
          text:['Every passenger pays the fare, so the tickets bring in the passengers times the fare. Work out each column: the sheet then shows which fare earns most.'], rule:'Ticket revenue = <i>A</i> Passengers × <i>B</i> Fare' } })); } });
  if(profT){ const t = profT.t, C = t.cols[0], V = C.values, sP = ashTyped(t, C.id, 'profit'), fuel = V.fuel || 0;
    v[P + 5] = sums.some(s => s.kind === 'tickets' && !s.done) ? {} : { t:money(V.rev) };   // Total revenue adds up the ticket revenue: it fills once those are done
    v[P + 6] = { t:money(V.cost - fuel), title:'Flying, landing and terminal charges, and the aircraft\'s day' }; v[P + 7] = { t:money(fuel) }; v[P + 8] = { t:money(V.cost) };
    v[P + 9] = ashShows(sP) ? { t:money(V.profit), cls:V.profit < 0 ? 'soft' : 'gold', fin:!!(S.rnd.paperShown || {})[t.id + '|' + cellId(C.id, 'profit')] } : {};
    if(sP === 'enter' || sP === 'wait' || sP === 'done') sums.push(ashTableSum({ id:t.id + '|profit', t, col:C.id, row:'profit', tgt:P + 9, refs:[P + 5, P + 8], ops:['−'], words:'Total revenue − Total costs', kind:'profit', commute:false,
      how:ashSum('launch.profit').how === 'build' ? 'build' : 'book', name:'profit', aria:'Profit, your plan', orderWhy:'profit is what is left of the revenue after the costs, so the revenue comes first.',
      doneLine:`Profit, your plan: <b class="gold">${money(V.profit)}</b> a day`, hints:() => ashHintsFor('revenue − costs', '−', V.rev, V.cost, V.profit, true), how2:() => ashHowFor('−', V.rev, V.cost, '£', 'Profit = Total revenue − Total costs'),
      co:{ at:['C', 5, ASH_LET[ashCol(P) - 1], 9], side:'pr', ptr:'top:auto;bottom:14px', eyebrow:'NEW SUM', title:'Profit',
        text:['Profit is what is left of the money coming in after the costs are paid. Your plan\'s costs sit under its revenue, like a balance sheet.'], rule:'Profit = <i>A</i> Total revenue − <i>B</i> Total costs' } })); }
  if(snT){ const t = snT.t; rows.push({ r:10, label:'Cabin sales', ic:'cup', t:'sub' }, { r:11, label:'Passengers buying snacks', ic:'person' }, { r:12, label:'Snack price', ic:'tag' }, { r:13, label:'Cabin sales', ic:'coins', gold:true });
    t.cols.forEach((C, i) => { const L = ASH_LET[1 + i], V = C.values, sS = ashTyped(t, C.id, 'snack'), o = snT.st.opts.find(x => x.id === C.id) || {};
      v[L + 10] = { t:o.label || C.label }; v[L + 11] = { t:num(V.buyers) }; v[L + 12] = { t:money(V.snackP) };
      v[L + 13] = ashShows(sS) ? { t:money(V.snack), fin:!!(S.rnd.paperShown || {})[t.id + '|' + cellId(C.id, 'snack')] } : {};
      if(sS === 'enter' || sS === 'wait' || sS === 'done'){ const first = i === 0, other = t.cols.filter((x, j) => j !== i).map((x, j) => ({ x, L:ASH_LET[1 + t.cols.indexOf(x)] }));
        sums.push(ashTableSum({ id:t.id + '|' + C.id + '|snack', t, col:C.id, row:'snack', tgt:L + 13, refs:[L + 11, L + 12], ops:['×'], words:'Passengers buying snacks × Snack price', kind:'cabin', commute:true,
          how:first && ashSum('launch.cabin').how === 'build' ? 'build' : 'book', name:`cabin sales at ${money(V.snackP)}`, aria:`Cabin sales at ${money(V.snackP)}`,
          why:(ref) => { const p = ashRef(ref), o2 = other.find(z => z.L === p.c); if(o2 && (p.r === 11 || p.r === 12)) return `${num(o2.x.values.buyers)} people buy snacks at ${money(o2.x.values.snackP)}. This sum is for snacks at ${money(V.snackP)}: which column is that?`;
            if(p.r <= 4) return 'That row is about tickets. Cabin sales are the snacks sold on board: which rows are about snacks?'; if(p.r <= 9) return 'That is part of your plan\'s money. Cabin sales come from the snack rows: which ones?'; return null; },
          doneLine:`Cabin sales at ${money(V.snackP)}: <b class="gold">${money(V.snack)}</b> a day`, hints:() => ashHintsFor('passengers × fare', '×', V.buyers, V.snackP, V.snack, true), how2:() => ashHowFor('×', V.buyers, V.snackP, '£', 'Cabin sales = Passengers buying snacks × Snack price'),
          co:{ at:['B', 5, ASH_LET[Math.max(2, ashCol(P) - 1)], 9], side:'pd', ptr:'left:60px', eyebrow:'NEW SUM', title:'Cabin sales',
            text:['Some passengers buy a snack on board. Click the two cells this sum uses, then work it out in your book.'], rule:'Cabin sales = <i>A</i> Passengers buying snacks × <i>B</i> Snack price' } })); } }); }
  // which sum is being worked: the first not done, in the order the sheet reads (each part lights in turn)
  const J = UI.ashJust && UI.ashJust.sheet === 'launch:' + (S.day || 1) ? sums.find(s => s.id === UI.ashJust.sum) : null;
  const act = J ? null : sums.find(s => !s.done) || null;
  const fin = profT && profT.t.cols[0].values, sn = snT ? snT.t.cols.map(C => C.values) : [];
  const doneLine = `<span class="ash-done-line">✓ Launch Day sheet done.</span> ${fin ? `Profit <b class="gold">${money(fin.profit)}</b> a day` : ''}${sn.length ? ` · cabin sales ${sn.map(V => `<b class="gold">${money(V.snack)}</b> at ${money(V.snackP)}`).join(', ')}` : ''}.`;
  const lastProfit = sums.find(s => s.kind === 'profit');
  return { id:'launch:' + (S.day || 1), crumb:`${S.airline.name || 'Airline'} HQ · Work it out`, title:'Launch Day sheet', tabs:ashTabs('launch'), lw:265, cols, rows, v, sums, act,
    just:J ? Object.assign(J, { doneLine:(J.shown ? `Finance has filled this one in. Copy ${esc(J.answerText || money(J.want))} into your book beside Sum ${J.no}.` : `${J.doneLine} · Sum ${J.no} in your record`), val:money(J.want) }) : null,
    doneF:lastProfit && !act && !J ? { tgt:lastProfit.tgt, refs:lastProfit.refs, ops:lastProfit.ops, words:lastProfit.words, val:money(fin.profit) } : null, doneLine };
}
/* the tabs: the sheets that exist so far (Launch Day, a tab a week, Changes, Fuel); the rest are dimmed */
function ashTabs(on){
  const B = S.ashBook || {}, wk = weekNo(S.day || 1), out = [{ id:'launch', label:'Launch Day', ic:'plane', on:on === 'launch', off:on !== 'launch' && !B.launch }];
  out.push({ id:'week', label:`Week ${Math.max(1, Object.keys(B.weeks || {}).length ? Math.max(...Object.keys(B.weeks).map(Number)) : wk)}`, ic:'cal', on:on === 'week', off:on !== 'week' && !Object.keys(B.weeks || {}).length });
  if((B.changes || []).length || on === 'changes') out.push({ id:'changes', label:'Changes', ic:'scale', on:on === 'changes', off:on !== 'changes' && !(B.changes || []).length });
  out.push({ id:'fuel', label:'Fuel', ic:'drum', on:on === 'fuel', off:on !== 'fuel' && !(B.fuel || []).length });
  return out;
}
/* a sheet once done is kept (its figures, not the game's tables), so the tabs can show it later */
function ashKeep(kind, sp, key){
  const B = S.ashBook || (S.ashBook = {}), snap = { title:sp.title, lw:sp.lw, cols:sp.cols.map(c => ({ c:c.c, w:c.w, top:c.top, flag:c.flag, main:c.main, plan:c.plan })), rows:sp.rows, v:sp.v, doneLine:sp.doneLine, day:S.day || 1 };
  if(kind === 'launch') B.launch = snap;
  else if(kind === 'week'){ (B.weeks = B.weeks || {})[key] = snap; }
  else { const L = B[kind] = B[kind] || []; const i = L.findIndex(x => x.key === key); snap.key = key; if(i >= 0) L[i] = snap; else L.unshift(snap); if(L.length > 12) L.length = 12; }
}
/* a tab that is not the one being worked shows its kept sheet, read only */
function ashTabSpec(tab){
  const B = S.ashBook || {}; let snap = null, title = '';
  if(tab === 'launch') snap = B.launch;
  if(tab === 'week'){ const ks = Object.keys(B.weeks || {}).map(Number); if(ks.length) snap = B.weeks[Math.max(...ks)]; }
  if(tab === 'changes') snap = (B.changes || [])[0];
  if(tab === 'fuel') snap = (B.fuel || [])[0];
  if(!snap) return null; title = snap.title;
  return { id:'tab:' + tab, crumb:`${S.airline.name || 'Airline'} HQ · Sheets`, title, tabs:ashTabs(tab), lw:snap.lw, cols:snap.cols, rows:snap.rows, v:snap.v, sums:[], act:null, just:null, doneLine:snap.doneLine };
}
function ashLaunchPage(st){
  if(UI.ashTab && UI.ashTab !== 'launch'){ const T = ashTabSpec(UI.ashTab); if(T){ ashTabPage(T, 'launch'); return; } UI.ashTab = null; }
  UI.ashTab = null;
  const sp = ashLaunchSpec(), all = !sp.act && !sp.just;
  if(all) ashKeep('launch', sp);
  const nextT = (S.steps[S.si + 1] || {}).t, toDesk = nextT === 'fuelDesk', go = toDesk ? 'Fuel desk' : 'Take off';
  const hint = all ? (toDesk ? 'Every Launch Day sum is done. Next, this week\'s fuel on the Fuel desk. Back changes the plan.' : 'Every Launch Day sum is done. The plan stays in view; Back changes it.')
    : 'Work out each sum in your book, then type the answer in the cell. Back changes the plan.';
  const btn = all ? `<button class="bv-btn big ${toDesk ? 'primary' : 'go'}" id="nx">${go} &#9654;</button>` : `<button class="bv-btn primary big" id="ashNext" ${sp.just ? '' : 'disabled'}>Next sum &#9654;</button>`;
  screen().innerHTML = shell(`<div class="dp ash-page">${ashHtml(sp)}</div>`, deskBar(hint, backBtn() + btn));
  ashBind(sp); on('ashNext', ashNextSum); on('nx', () => { UI.ashJust = null; finishSums(); });
  screen().querySelectorAll('[data-ashcosts]').forEach(b => b.onclick = () => ashCostsPop(b));
}
/* What's in this? Other costs, item by item, from the model */
function ashCostsPop(btn){
  const old = document.getElementById('ashCosts'); if(old){ old.remove(); return; }
  const L = planLines(Object.assign({}, currentPlan(), { onboard:'none' })), V = L.v, items = [['Flying (hours and landing fees)', V.run], ['Terminal charges', V.term], ['Second crew', V.crew], ["Aircraft's day", V.day]].filter(x => x[1]);
  btn.insertAdjacentHTML('afterend', `<span class="ash-pop" id="ashCosts" role="note">${items.map(([l, x]) => `<span>${esc(l)} <b>${money(x)}</b></span>`).join('')}<small>Fuel burned has its own line.</small></span>`);
}
function ashTabPage(T, back){
  screen().innerHTML = shell(`<div class="dp ash-page">${ashHtml(T)}</div>`, deskBar('A sheet you have finished. Its figures stay as they were on the day.', `<button class="bv-btn primary big" id="ashTabBack">&#9664; Back to ${esc(back === 'launch' ? 'today\'s sheet' : 'the sheet')}</button>`));
  ashBind(T); on('ashTabBack', () => { UI.ashTab = null; render(); });
}

/* ---------- 7.2 the Studio: for playing with the plan only ----------
   A change shows at once (the timetable, the seats at each fare) and never opens a sum: the Worth Sum Callout is retired.
   The selected flight's Change row keeps an Undo (the last change taken back). The button to the sums is Work out my plan. */
const ashGoLabel0 = goLabel;
goLabel = function(def){ const r = ashGoLabel0(def); return ashOn() && r === 'Cost your plan' ? 'Work out my plan' : r; };
const ashDsWorth0 = dsWorth;
dsWorth = function(){ return ashOn() ? null : ashDsWorth0.apply(this, arguments); };
const ashWsc0 = bvWscShow;
bvWscShow = function(){ if(ashOn()){ const C = document.getElementById('bvWsc'); if(C) C.remove(); return; } return ashWsc0.apply(this, arguments); };
/* the plan as the week began: the Changes tab's Now */
function ashPlanWas(){ const W = S.rnd && S.rnd.planWas; return W && W.day === (S.day || 1) ? W.pl : null; }
const ashStudio0 = renderStudio;
renderStudio = function(st){ if(ashOn() && S.phase !== 'setup' && !ashPlanWas()) S.rnd.planWas = { day:S.day || 1, pl:JSON.parse(JSON.stringify(normPlan(currentPlan()))) }; return ashStudio0.apply(this, arguments); };
/* Undo: every change on the plan page is kept, newest last, until the step changes */
const ashUndoKey = () => (S.day || 1) + '|' + S.si;
const ashSetPlan0 = setPlan;
setPlan = function(i, pl){
  if(i === 0 && ashOn() && step() && step().t === 'plan'){ let H = UI.ashUndo; if(!H || H.key !== ashUndoKey()) H = UI.ashUndo = { key:ashUndoKey(), list:[] };
    const now = JSON.parse(JSON.stringify(normPlan(currentPlan()))); if(planKey(now) !== planKey(normPlan(pl))){ H.list.push(now); if(H.list.length > 40) H.list.shift(); } }
  return ashSetPlan0.apply(this, arguments);
};
function ashUndoN(){ const H = UI.ashUndo; return H && H.key === ashUndoKey() ? H.list.length : 0; }
function ashUndoPlan(){ if(!ashUndoN()) return; const pl = UI.ashUndo.list.pop(); applyPlan(pl); UI.dsFlash = null; render(); }
const ashFareRow0 = bvFareRow;
bvFareRow = function(){ const h = ashFareRow0.apply(this, arguments); if(!ashOn()) return h; const n = ashUndoN();
  return h + `<button class="bv-btn small ash-undo" data-ashundo ${n ? '' : 'disabled'} title="${n ? 'Take back your last change' : 'Nothing to take back yet'}">Undo</button>`; };
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-ashundo]'); if(!b || b.disabled) return; e.stopPropagation(); ashUndoPlan(); }, true);

/* ---------- 7.4 plan changes (from week 2): Now · With your change · Difference ----------
   Each change kept is worked out in turn: a fare change on its own route (passengers, empty seats, fare, ticket revenue
   a day and over a week), and a change to the timetable or what is sold on board as one (flights, passengers, revenue,
   costs and profit a day). The airline fills the figures (ƒ where it uses a sum the pupil has mastered); the pupil's sum is the
   difference. "Worth keeping?" then says so in words: green for a gain, plain for a loss (never red). */
function ashChanges(){
  const was = ashPlanWas(); if(!was) return [];
  const a = normPlan(JSON.parse(JSON.stringify(was))), b = normPlan(currentPlan()); if(planKey(a) === planKey(b)) return [];
  const flown = p => new Set(p.fleet.flatMap(x => x.sched)), fa = flown(a), out = []; let cur = JSON.parse(JSON.stringify(a));
  [...flown(b)].filter(id => fa.has(id)).forEach(id => { const r = routeById(id), f0 = a.prices[id] || r.basePrice, f1 = b.prices[id] || r.basePrice; if(f0 === f1) return;
    const nx = JSON.parse(JSON.stringify(cur)); nx.prices[id] = f1; out.push({ kind:'fare', route:id, from:cur, to:nx, f0, f1, key:`fare|${id}|${f0}|${f1}` }); cur = nx; });
  if(planKey(normPlan(cur)) !== planKey(b)) out.push({ kind:'plan', from:cur, to:JSON.parse(JSON.stringify(b)), key:'plan|' + planKey(b) });
  return out;
}
function ashChgS(){ return S.rnd.ashChg || (S.rnd.ashChg = {}); }
/* what a timetable change did, for the review's "Your Paris extra flight was worth …": the route whose flights changed most (or whose times moved) */
function ashChgWhat(ch){
  const per = p => { const m = {}; normPlan(p).fleet.forEach(x => x.sched.forEach((r, k) => { (m[r] = m[r] || []).push((x.deps || [])[k]); })); return m; }, a = per(ch.from), b = per(ch.to);
  const ids = [...new Set(Object.keys(a).concat(Object.keys(b)))], n = id => ((b[id] || []).length - (a[id] || []).length);
  const big = ids.slice().sort((x, y) => Math.abs(n(y)) - Math.abs(n(x)))[0];
  if(big && n(big)) return { route:big, what:n(big) > 0 ? (n(big) > 1 ? 'extra flights' : 'extra flight') : (n(big) < -1 ? 'flights cut' : 'flight cut') };
  const moved = ids.find(id => JSON.stringify((a[id] || []).slice().sort()) !== JSON.stringify((b[id] || []).slice().sort()));
  return { route:moved || ids[0], what:moved ? 'new times' : 'timetable change' };
}
const ashSigned = (v, m) => `${v < 0 ? '−' : v > 0 ? '+' : ''}${m ? money(Math.abs(Math.round(v))) : num(Math.abs(Math.round(v)))}`;
function ashChangeSpec(ch, i, n){
  const La = planLines(ch.from), Lb = planLines(ch.to), C = ashChgS()[ch.key] || {}, done = !!C.done, v = {}, nm = `${S.airline.name || 'Airline'} HQ · Work out my plan`;
  const how = ashSum('changes.difference').how, build = how === 'build' || (how === 'build once' && !ashSeen('built:difference'));
  let cols, rows, sum, gain, words;
  if(ch.kind === 'fare'){ const id = ch.route, r = routeById(id), ra = La.routes.find(x => x.id === id) || { pax:0 }, rb = Lb.routes.find(x => x.id === id) || { pax:0 }, sa = ashSeatsOn(La, id), sb = ashSeatsOn(Lb, id);
    const t0 = ra.pax * ch.f0, t1 = rb.pax * ch.f1, d = t1 - t0; gain = d;
    cols = [{ c:'B', w:180, top:'Now', flag:r.flag, main:`${r.city} ${money(ch.f0)}` }, { c:'C', w:180, top:'With your change', flag:r.flag, main:`${r.city} ${money(ch.f1)}` }, { c:'D', w:180, top:'Difference', main:'change − now' }];
    rows = [{ r:1, t:'hdr' }, { r:2, label:'Passengers a day', ic:'person' }, { r:3, label:'Empty seats', ic:'person' }, { r:4, label:'Fare', ic:'tag' }, { r:5, label:'Ticket revenue a day', ic:'coins', gold:true, words:'Ticket revenue a day' }, { r:6, label:'Over a week (× 7)', ic:'cal', gold:true }, { r:7, t:'gap' }, { r:8, label:'Worth keeping?', ic:'scale', t:'tot' }];
    Object.assign(v, { B2:{ t:num(ra.pax), bar:sa ? ra.pax / sa : null }, C2:{ t:num(rb.pax), bar:sb ? rb.pax / sb : null }, D2:{ t:ashSigned(rb.pax - ra.pax) }, B3:{ t:num(Math.max(0, sa - ra.pax)) }, C3:{ t:num(Math.max(0, sb - rb.pax)) }, D3:{ t:ashSigned((sb - rb.pax) - (sa - ra.pax)) },
      B4:{ t:money(ch.f0) }, C4:{ t:money(ch.f1) }, D4:{ t:ashSigned(ch.f1 - ch.f0, true) }, B5:{ t:money(t0), f:true }, C5:{ t:money(t1), f:true }, B6:{ t:money(t0 * 7), f:true }, C6:{ t:money(t1 * 7), f:true } });
    if(done){ v.D5 = { t:ashSigned(d, true), cls:d > 0 ? 'pos' : '', fin:!!C.shown }; v.D6 = { t:ashSigned(d * 7, true), f:true, cls:d > 0 ? 'pos' : '' }; v.D8 = { t:d > 0 ? `✓ Yes, ${ashSigned(d, true)} a day` : `Not worth keeping: ${ashSigned(d, true)} a day`, cls:d > 0 ? 'pos' : '' }; }
    words = `the ${r.city} fare ${money(ch.f0)} → ${money(ch.f1)}`;
    sum = { tgt:'D5', refs:['C5', 'B5'], vals:[t1, t0], want:d, rowW:'ticket revenue a day', ptrRow:5 }; }
  else { const pa = La.v, pb = Lb.v, fl = p => normPlan(p).fleet.reduce((t, x) => t + x.sched.length, 0), sa = La.seats || 0, sb = Lb.seats || 0, d = pb.profit - pa.profit; gain = d;
    cols = [{ c:'B', w:180, top:'Now', main:`${fl(ch.from)} flights a day` }, { c:'C', w:180, top:'With your change', main:`${fl(ch.to)} flights a day` }, { c:'D', w:180, top:'Difference', main:'change − now' }];
    rows = [{ r:1, t:'hdr' }, { r:2, label:'Flights a day', ic:'plane' }, { r:3, label:'Passengers a day', ic:'person' }, { r:4, label:'Empty seats', ic:'person' }, { r:5, label:'Revenue a day', ic:'coins', gold:true }, { r:6, label:'Costs a day', ic:'receipt' },
      { r:7, label:'Profit a day', ic:'chart', t:'fin', gold:true }, { r:8, label:'Over a week (× 7)', ic:'cal', gold:true }, { r:9, t:'gap' }, { r:10, label:'Worth keeping?', ic:'scale', t:'tot' }];
    Object.assign(v, { B2:{ t:num(fl(ch.from)) }, C2:{ t:num(fl(ch.to)) }, D2:{ t:ashSigned(fl(ch.to) - fl(ch.from)) }, B3:{ t:num(La.pax), bar:sa ? La.pax / sa : null }, C3:{ t:num(Lb.pax), bar:sb ? Lb.pax / sb : null }, D3:{ t:ashSigned(Lb.pax - La.pax) },
      B4:{ t:num(Math.max(0, sa - La.pax)) }, C4:{ t:num(Math.max(0, sb - Lb.pax)) }, D4:{ t:ashSigned((sb - Lb.pax) - (sa - La.pax)) }, B5:{ t:money(pa.rev), f:true }, C5:{ t:money(pb.rev), f:true }, D5:{ t:ashSigned(pb.rev - pa.rev, true) },
      B6:{ t:money(pa.cost), f:true }, C6:{ t:money(pb.cost), f:true }, D6:{ t:ashSigned(pb.cost - pa.cost, true) }, B7:{ t:money(pa.profit), f:true, cls:pa.profit < 0 ? 'soft' : '' }, C7:{ t:money(pb.profit), f:true, cls:pb.profit < 0 ? 'soft' : '' },
      B8:{ t:money(pa.profit * 7), f:true, cls:pa.profit < 0 ? 'soft' : '' }, C8:{ t:money(pb.profit * 7), f:true, cls:pb.profit < 0 ? 'soft' : '' } });
    if(done){ v.D7 = { t:ashSigned(d, true), cls:d > 0 ? 'pos' : '', fin:!!C.shown }; v.D8 = { t:ashSigned(d * 7, true), f:true, cls:d > 0 ? 'pos' : '' }; v.D10 = { t:d > 0 ? `✓ Yes, ${ashSigned(d, true)} a day` : `Not worth keeping: ${ashSigned(d, true)} a day`, cls:d > 0 ? 'pos' : '' }; }
    words = 'your timetable change';
    sum = { tgt:'D7', refs:['C7', 'B7'], vals:[pb.profit, pa.profit], want:d, rowW:'profit a day', ptrRow:7 }; }
  const key = 'chg:' + ch.key, d = sum.want;
  const S1 = { id:key, tgt:sum.tgt, refs:sum.refs, ops:['−'], words:'With your change − Now', kind:'difference', commute:false, how:build ? 'build' : 'book', built:false, unit:'£', want:d, done, recKey:key,
    get no(){ return sumNo(key); }, wordsOf:ref => ({ B:'Now', C:'With your change' })[ashRef(ref).c] || ref, name:`the difference ${words} makes`,
    orderWhy:'the difference is what the change does, so With your change comes first.',
    why:ref => { const p = ashRef(ref); if(p.c === 'D') return 'The Difference column is where answers go. Which two cells does it compare?'; if(p.r !== sum.ptrRow) return `That row isn't the ${sum.rowW}. Which row says what the change is worth a day?`; return null; },
    recO:{ type:'calc', relKey:'difference', doc:`Is the change worth it? ${capFirst(words)}`, ask:'With your change − Now', question:`${money(sum.vals[0])} − ${money(sum.vals[1])}`, unit:'£', correct:d, correctText:ashSigned(d, true), ops:sum.vals, op:'−', level:'Calculate' },
    answer:(raw, val, st) => { const c = ashChgS()[ch.key] || (ashChgS()[ch.key] = {});
      if(d < 0 && Math.abs(val + d) < 0.5 && !/^[−–-]/.test(String(raw).trim())) return { note:'The change brings in less, so the difference is below zero: type it with a minus (−). One more try.' };
      let e = null; try{ e = recOpen(key, S1.recO); }catch(x){}
      const ok = Math.abs(val - d) < 0.5; try{ recAttempt(e, { ok, given:raw, value:val, method:'worked on paper, answer typed' }); }catch(x){}
      if(ok || ((st.tries || 0) + 1 >= 2 && twoTriesOn())){ c.done = true; if(!ok){ c.shown = true; try{ paperRecShown(key); }catch(x){} }
        try{ const W = ch.kind === 'fare' ? { route:ch.route, what:ch.f1 > ch.f0 ? 'fare rise' : 'fare cut' } : ashChgWhat(ch); dsWorthKeep({ kind:ch.kind === 'fare' ? 'fare' : 'service', route:W.route, what:W.what, value:d }); }catch(x){}
        try{ soLog(`Is the change worth it? (${build ? 'Build, then the sum' : 'Calculate'})`); }catch(x){}
        return ok ? { ok:true } : { shown:true }; }
      return { note:ashWrong('−', sum.vals, val, d, '£') }; },
    onBuilt:() => { ashSee('built:difference'); },
    hints:() => ashHintsFor('revenue − costs', '−', sum.vals[0], sum.vals[1], d, true), how2:() => ashHowFor('−', Math.abs(sum.vals[0]), Math.abs(sum.vals[1]), '£', 'Difference = With your change − Now'),
    co:{ at:['B', sum.ptrRow + 1, 'C', rows.length], side:'pu', ptr:'left:300px', eyebrow:'NEW · YOUR CHANGE', title:'Is the change worth it?',
      text:[`You changed ${esc(words)}. The sheet puts Now next to With your change. The Difference column shows what the change is worth.`], rule:'Difference = <i>A</i> With your change − <i>B</i> Now' } };
  const J = UI.ashJust && UI.ashJust.sheet === 'changes:' + ch.key ? S1 : null, act = !done && !J ? S1 : null;
  const meaning = gain > 0 ? `<b class="pos">${ashSigned(gain, true)} a day</b>, ${ashSigned(gain * 7, true)} a week: the change is worth keeping.` : gain < 0 ? `The change loses ${money(Math.abs(Math.round(gain)))} a day (${ashSigned(gain * 7, true)} a week): it isn't worth keeping. Back returns to the plan to undo it or try something else.` : 'The change makes no difference a day.';
  if(J) J.doneLine = C.shown ? `Finance has filled this one in: ${ashSigned(d, true)} a day. Copy it into your book beside Sum ${S1.no}. ${meaning}` : `${meaning} · Sum ${S1.no} in your record`;
  return { id:'changes:' + ch.key, crumb:nm + (n > 1 ? ` · change ${i + 1} of ${n}` : ''), title:'Is the change worth it?', tabs:ashTabs('changes'), lw:250, cols, rows, v, sums:[S1], act, just:J,
    doneF:!act && !J ? Object.assign({}, { tgt:sum.tgt, refs:sum.refs, ops:['−'], words:'With your change − Now', val:ashSigned(d, true) }) : null, doneLine:`<span class="pos">✓</span> ${meaning}`, ch };
}
function ashChangesPage(st, CH){
  const S0 = ashChgS(), i = Math.max(0, CH.findIndex(c => (UI.ashJust && UI.ashJust.sheet === 'changes:' + c.key) || !(S0[c.key] || {}).done)), ch = CH[i] || CH[CH.length - 1], sp = ashChangeSpec(ch, i, CH.length);
  const mine = !sp.act && !sp.just, last = i >= CH.length - 1;
  if(mine) ashKeep('changes', sp, ch.key);
  const hint = sp.act ? 'Work it out in your book, then type the answer in the cell. Back changes the plan.' : sp.just ? 'Back changes the plan; Next goes on.' : 'Worked out. Back changes the plan.';
  const btn = sp.act ? `<button class="bv-btn primary big" id="ashNext" disabled>Next sum &#9654;</button>` : `<button class="bv-btn primary big" id="ashChgGo">${last ? 'Next' : 'Next change'} &#9654;</button>`;
  screen().innerHTML = shell(`<div class="dp ash-page">${ashHtml(sp)}</div>`, deskBar(hint, backBtn() + btn));
  ashBind(sp); on('ashChgGo', () => { UI.ashJust = null; resetEntry(); const c = S0[ch.key] || (S0[ch.key] = {}); c.seen = true; c.passed = true; render(); });
}
function ashChgDone(c){ const x = ashChgS()[c.key]; return !!(x && x.done && x.passed); }
/* the teacher's test kit: once a change is worked out, its Next (or Next change) goes on */
if(window.__tkSums) window.__tkSums.unshift({ what:'the next change', test:() => !!document.getElementById('ashChgGo'), plan:() => ({ at:'#ashChgGo', value:'Next change', go:() => document.getElementById('ashChgGo').click() }) });

/* ---------- the Monday sheet and the event sums: the game's own tables on the sheet ----------
   A sum the day's rules ask for (a new route's ticket revenue, the tenths of an event) is a cell in one of the game's
   tables. The table is drawn as a sheet: its columns, its rows with their icons, the figures given or worked out by the
   airline (ƒ for those the pupil has mastered), and the cells the pupil fills. An event sum is a small sheet under the rows-of-ten
   picture (3.4); its answer is people, so the cell shows no £. */
const ASH_ROWIC = id => /^pax_|^people$|^buyers$/.test(id) ? 'person' : /^fare_|^snackP$|^ppl$/.test(id) ? 'tag' : /^tk_|^rev$|^snack$/.test(id) ? 'coins' : /^fuel/.test(id) ? 'drum' : id === 'profit' ? 'chart' : id === 'share' ? 'scale' : id === 'stay' ? 'person' : id === 'day' ? 'plane' : id === 'event' ? 'note' : 'receipt';
function ashTableSpec(t, o){
  o = o || {}; const rows0 = tRows(t), cols = t.cols.map((c, i) => ({ c:ASH_LET[1 + i], w:o.cw || 170, top:o.top ? o.top(c) : (c.sub || ''), flag:o.flag ? o.flag(c) : null, main:o.main ? o.main(c) : c.label, src:c }));
  const rowNo = {}, rows = [{ r:1, t:'hdr' }]; rows0.forEach((r, i) => { rowNo[r.id] = i + 2; const lab = (o.labels && o.labels[r.id]) || rowLabel(t, r);
    rows.push({ r:i + 2, label:lab, ic:ASH_ROWIC(r.id), t:r.id === 'profit' ? 'fin' : r.total || r.id === 'stay' ? 'tot' : 'data', gold:r.unit === '£' && /^tk_|^rev$|^snack$|^profit$/.test(r.id) }); });
  const v = {}, sums = [];
  cols.forEach(k => { const C = k.src; rows0.forEach((r, ri) => { const ref = k.c + rowNo[r.id], s = cellState(t, C, ri), val = C.values[r.id];
    if(ashShows(s)) v[ref] = { t:fmtVal(r.unit, val), f:s === 'derived' && r.type === 'calc', cls:r.id === 'profit' && val < 0 ? 'soft' : '', fin:!!(S.rnd.paperShown || {})[t.id + '|' + cellId(C.id, r.id)] };
    if(rowTyped(t, r) && ['enter', 'wait', 'done'].includes(s)){ const ops = stackRows(t, C, r), refs = ops.map(x => rowNo[x.id] ? k.c + rowNo[x.id] : null); if(refs.some(x => !x) || refs.length < 2) return;
      const op = (ops[1] && ops[1].op) || r.op || '×', unitB = operandUnit(t, ops[1].id), sid = o.sumId || 'week.sum', how = o.how ? o.how(r) : (r.tool && toolLevel(r.tool) === 'build' && !/fare/i.test(ops.map(x => x.id).join(' ')) ? 'build' : 'book');
      const a = operandValue(t, C, ops[0].id), b = operandValue(t, C, ops[1].id), lab = rowLabel(t, r);
      sums.push(ashTableSum({ id:t.id + '|' + C.id + '|' + r.id, t, col:C.id, row:r.id, tgt:ref, refs, ops:ops.slice(1).map(x => x.op || op), words:ops.map((x, j) => (j ? (x.op || op) + ' ' : '') + ((o.labels && o.labels[x.id]) || operandLabel(t, x.id))).join(' '),
        kind:o.kind ? o.kind(r) : (r.tool || r.id), commute:op === '×' || op === '+', how, name:String(lab).toLowerCase(), aria:lab, wordsOf:ref2 => { const rr = rows.find(x => x.r === ashRef(ref2).r); return rr ? rr.label : ref2; },
        doneLine:`${esc(lab)}: <b class="${r.unit === '£' ? 'gold' : ''}">${fmtVal(r.unit, val)}</b>${o.per || ''}`, answerText:fmtVal(r.unit, val),
        hints:() => ashHintsFor(o.rel || (op === '−' ? 'revenue − costs' : 'passengers × fare'), op, a, b, val, r.unit === '£'), how2:() => ashHowFor(op, a, b, unitB, `${lab} = ${ops.map(x => (o.labels && o.labels[x.id]) || operandLabel(t, x.id)).join(` ${op} `)}`),
        co:o.co ? o.co(r, ref, rowNo) : null })); } }); });
  const J = UI.ashJust && UI.ashJust.sheet === (o.id || t.id) ? sums.find(s => s.id === UI.ashJust.sum) : null, act = J ? null : sums.find(s => !s.done) || null;
  if(J){ J.doneLine = (J.shown ? `Finance has filled this one in: ${esc(J.answerText)}. Copy it into your book beside Sum ${J.no}.` : `${J.doneLine} · Sum ${J.no} in your record`) + (UI.ashJust.note ? ` <span class="ash-whole">${esc(UI.ashJust.note)}</span>` : ''); }
  // all done: the formula bar keeps the last sum, with its answer
  const L = !act && !J && sums.length ? sums[sums.length - 1] : null;
  return { id:o.id || t.id, crumb:o.crumb, title:o.title, tabs:o.tabs, small:!!o.small, lw:o.lw || 265, cols, rows, v, sums, act, just:J, doneLine:o.doneLine ? o.doneLine(sums) : '',
    doneF:L ? { tgt:L.tgt, refs:L.refs, ops:L.ops, words:L.words, wordsOf:L.wordsOf, val:L.answerText } : null };
}
/* the event sums (Stay with you, Business travellers today): the rows of ten, then a small sheet */
const ASH_EV_LAB = { rival:{ people:'Your passengers', share:'Stay with you, in every 10', stay:'Stay with you' }, weekend:{ people:'Business travellers on a weekday', share:'Fly on a Saturday, in every 10', stay:'Business travellers today' } };
function ashEventPage(st, t, rest){
  const kind = /:rival$/.test(t.id) ? 'rival' : 'weekend', E = typeof wio2TenData === 'function' ? wio2TenData(t) : null, r = E && E.r, sid = kind === 'rival' ? 'event.stay' : 'event.business';
  const sp = ashTableSpec(t, { id:'ev:' + t.id, small:true, lw:300, cw:170, labels:ASH_EV_LAB[kind], sumId:sid, rel:'tenths of passengers', kind:() => 'tenths', how:() => ashSum(sid).how === 'build' ? 'build' : 'book',
    top:() => r ? r.city : '', flag:() => r ? r.flag : null, main:() => 'today',
    co:(row, ref) => ({ at:['B', 2, 'B', 4], side:'pl', ptr:'top:14px', eyebrow:'NEW SUM', title:'In every 10',
      text:['The picture shows the rule: in every 10 people, the same number do it. 0.7 means 7 in every 10.'], rule:`${esc(ASH_EV_LAB[kind].stay)} = <i>A</i> ${esc(ASH_EV_LAB[kind].people)} × <i>B</i> ${esc(ASH_EV_LAB[kind].share)}` }),
    doneLine:sums => { const s = sums[0]; return s ? `<span class="pos">✓</span> <b>${esc(String(t.cols[0].values.stay))}</b> ${kind === 'rival' ? `of your ${num(t.cols[0].values.people)} passengers stay with you.` : `business travellers fly today.`}` : ''; } });
  // the callout for a small sheet sits beside it (the small sheet has no empty part)
  if(sp.act && sp.act.co) sp.act.co = Object.assign({}, sp.act.co, { at:['B', 2, 'B', 4] });
  const ten = typeof wio2Ten === 'function' ? wio2Ten(t) : '', allDone = !sp.act && !sp.just;
  const title = kind === 'rival' ? `How many of your ${r ? esc(r.city) : ''} passengers stay with you?` : `How many business travellers fly today?`;
  const hint = allDone ? 'Done. On with the week.' : 'Work it out in your book, then type the answer in the cell.';
  const btn = allDone ? `<button class="bv-btn primary big" id="nx">${rest ? 'Next' : 'On with the week'} &#9654;</button>` : `<button class="bv-btn primary big" id="ashNext" ${sp.just ? '' : 'disabled'}>Next &#9654;</button>`;
  screen().innerHTML = shell(`<div class="dp ash-page ash-ev"><div class="ash-evh"><span class="bv-eyebrow">Work it out</span><h1>${title}</h1></div><div class="ash-evb">${ten}${ashHtml(sp)}</div></div>`, deskBar(hint, btn));
  ashBind(sp); on('ashNext', ashNextSum); on('nx', () => { UI.ashJust = null; finishSums(); });
}
/* the Monday sheet: the day's cost sheet with the cells the pupil fills (a new route's tickets and the like) */
function ashPlanSheetPage(st, W){
  const t = W.t, wk = weekNo(S.day || 1);
  const sp = ashTableSpec(t, { id:'mon:' + t.id, crumb:`${S.airline.name || 'Airline'} HQ · Work out my plan`, title:`Week ${wk} plan`, tabs:ashTabs('week'), lw:300, cw:216, top:() => planLabel(currentPlan()).split(' · ').slice(0, 2).join(' · '), main:() => 'Your plan',
    doneLine:() => `<span class="pos">✓</span> Week ${wk}'s sums are done. Profit <b class="gold">${money(planLines(currentPlan()).v.profit)}</b> a day.` });
  const allDone = !sp.act && !sp.just, nextT = (S.steps[S.si + 1] || {}).t;
  const btn = allDone ? `<button class="bv-btn primary big" id="nx">${nextT === 'fuelDesk' ? 'Fuel desk' : 'Ready to fly'} &#9654;</button>` : `<button class="bv-btn primary big" id="ashNext" ${sp.just ? '' : 'disabled'}>Next sum &#9654;</button>`;
  screen().innerHTML = shell(`<div class="dp ash-page">${ashHtml(sp)}</div>`, deskBar(allDone ? 'Every sum this week is done. Back changes the plan.' : 'Work out each sum in your book, then type the answer in the cell. Back changes the plan.', backBtn() + btn));
  ashBind(sp); on('ashNext', ashNextSum); on('nx', () => { UI.ashJust = null; finishSums(); });
}

/* ---------- R.workings in year one: the sheet ---------- */
const ashWork0 = R.workings;
R.workings = st => {
  if(!ashOn() || !wkPlanner() || !dayLike()) return ashWork0(st);
  if(S.phase === 'setup'){ ashLaunchPage(st); return; }
  if(UI.ashTab){ const T = ashTabSpec(UI.ashTab); if(T){ ashTabPage(T); return; } UI.ashTab = null; }
  const CH = ashChanges(); if(CH.some(c => !ashChgDone(c))){ ashChangesPage(st, CH); return; }
  // the Sign-offs page (Build cards and the flight-time sums) is drawn as before
  if(soOn()){ try{ workTables(currentPlan()); }catch(e){} const items = soStageItems(); if(items.length && (items.some(it => !it.done) || !st.soPassed)) return ashWork0(st); }
  let W = null; try{ W = workTables(currentPlan()); }catch(e){ return ashWork0(st); }
  if(!W || cardInPlay(W)) return ashWork0(st);
  const cells = wkCells(W.tables); if(!cells.length){ finishSums(); return; }
  const J = UI.ashJust ? W.tables.find(x => UI.ashJust.sheet === 'ev:' + x.id || UI.ashJust.sheet === 'mon:' + x.id) : null, nx = wkNext(W.tables), t = J || (nx && nx.t);
  if(!t){ const ev = W.tables.find(x => /^tenths:/.test(x.id)); if(ev){ ashEventPage(st, ev, false); return; } ashPlanSheetPage(st, W); return; }
  if(/^tenths:/.test(t.id)){ ashEventPage(st, t, W.tables.some(x => x !== t && wkNext([x]))); return; }
  W.t = t; ashPlanSheetPage(st, W);
};
