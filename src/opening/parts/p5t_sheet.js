/* =====================================================================
   THE SHEET, IN THE AIRLINE LOOK (Claude Design handover, 19 Oct 2026, evening, section 7.1; DESIGN.md "Sheet",
   "Sheet Callout", "Calculation Builder"). Year one only. One component for every sheet in the game: column letters, row
   numbers, a formula bar, cells the pupil clicks, and the answer typed into its own cell; dressed for the airline (flags in the
   column headers, line icons in the row labels, seat-fill bars and FULL chips, a header band, ƒ on the cells the airline
   works out, NEW on new rows, icon tabs).
   - A sheet is a spec (ashHtml): its columns, rows and cell values, and its sums. A sum names the cell it fills (tgt), the
     cells it uses in the order the formula reads them (refs), the operations between them (ops), the rule in words, how
     it is done (build: the pupil clicks the cells, then types; book: the formula is on the bar, and they type) and how its answer is
     checked (answer). The pages that own the sheets (p5u, p5v) build the specs from the game's own figures.
   - Building: the part being worked lights and the rest of the sheet dims to 62% (the sheet only). Each cell the pupil clicks is
     outlined and tagged A, B in the order they are clicked (no tags for three or more cells); its name goes into the formula bar
     and its row name into the words after it. A cell or an operation that doesn't fit is an amber question about what it
     means, never "wrong" and never red.
   - Typing: the answer cell becomes the input (magenta outline, a gold £ when the answer is money); Enter checks it.
     Right: the cell fills, lights green once, and Next sum lights. Wrong: the outline turns amber and the line gives a
     hint from the pupil's own number; two tries, then Finance fills it in.
   - The first time a kind of sum appears, a Sheet Callout pinned to its row says what it is in words (the rule with its
     A / B tags, never the figures or the answer); Got it closes it and the sum lights. The "i" on the row brings it back.
   ===================================================================== */
const ashOn = () => !!S && typeof yearOne === 'function' && yearOne() && typeof paperOn === 'function' && paperOn() && settings.airSheet !== false;
/* the row icons (16px line icons, from the handover's reference renderer) */
const ASH_ICO = {
  person:'<circle cx="8" cy="4.5" r="2.6" fill="none" stroke="#9fbde3" stroke-width="1.4"/><path d="M3 15c0-3 2.2-5.2 5-5.2s5 2.2 5 5.2" fill="none" stroke="#9fbde3" stroke-width="1.4"/>',
  tag:'<path d="M2 8V2.5h5.5L14 9l-5.5 5.5L2 8z" fill="none" stroke="#9fbde3" stroke-width="1.4"/><circle cx="5" cy="5.2" r="1.1" fill="#9fbde3"/>',
  coins:'<ellipse cx="8" cy="4.5" rx="5.5" ry="2.2" fill="none" stroke="#f2c14e" stroke-width="1.4"/><path d="M2.5 4.5v3.5c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2V4.5M2.5 8v3.5c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2V8" fill="none" stroke="#f2c14e" stroke-width="1.4"/>',
  receipt:'<path d="M3.5 1.5h9v13l-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1-1.5 1z" fill="none" stroke="#9fbde3" stroke-width="1.4"/><path d="M5.5 5h5M5.5 8h5" stroke="#9fbde3" stroke-width="1.2"/>',
  drum:'<rect x="3.5" y="1.5" width="9" height="13" fill="none" stroke="#9fbde3" stroke-width="1.4"/><path d="M3.5 5.5h9M3.5 10.5h9" stroke="#9fbde3" stroke-width="1.2"/>',
  chart:'<path d="M2 13.5h12" stroke="#9fbde3" stroke-width="1.3"/><path d="M3 11l3.5-3.5 2.5 2 4.5-5" fill="none" stroke="#3ce394" stroke-width="1.6"/>',
  cup:'<path d="M3 5h8v5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" fill="none" stroke="#9fbde3" stroke-width="1.4"/><path d="M11 6.5h1.5a1.6 1.6 0 0 1 0 3.2H11" fill="none" stroke="#9fbde3" stroke-width="1.3"/>',
  cal:'<rect x="2" y="3" width="12" height="11" fill="none" stroke="#9fbde3" stroke-width="1.4"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="#9fbde3" stroke-width="1.3"/>',
  note:'<path d="M2 2.5h12v8H7l-3.5 3v-3H2z" fill="none" stroke="#9fbde3" stroke-width="1.4"/>',
  scale:'<path d="M8 2v12M3 14h10M3 5h10M3 5l-2 4.5h4zM13 5l-2 4.5h4z" fill="none" stroke="#9fbde3" stroke-width="1.2"/>',
  divide:'<circle cx="8" cy="3.5" r="1.3" fill="#9fbde3"/><path d="M2.5 8h11" stroke="#9fbde3" stroke-width="1.5"/><circle cx="8" cy="12.5" r="1.3" fill="#9fbde3"/>',
  plane:'<path d="M1.5 9.2l5-1.3L9.6 3c.4-.6 1.4-.4 1.4.4L10 7.3l3.8-1c.6-.2 1.2.3 1 .9l-.3.7-5 1.8-3.2 4c-.4.5-1.2.2-1.1-.4l.4-2.7-3.5 1.2z" fill="#9fbde3"/>' };
const ashIco = k => k && ASH_ICO[k] ? `<svg class="ash-ico" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style="flex:none">${ASH_ICO[k]}</svg>` : '';
const ashFlag = id => id && typeof flagSvg === 'function' ? flagSvg(id, 12) : '';
const ASH_LET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ashCol = c => ASH_LET.indexOf(c);
const ashRef = ref => ({ c:ref.replace(/\d+$/, ''), r:+ref.replace(/^[A-Z]+/, '') });
const ashMoney = v => money(Math.round(v * 100) / 100);
/* the sheet's state on screen: the tokens clicked so far, the line's message, the hints shown (one sheet, one sum at a time) */
function ashSt(id){ const A = UI.ashS || (UI.ashS = {}); return A[id] || (A[id] = { sum:null, tokens:[], msg:'', q:false, hint:0, how:false, entry:'', tries:0, co:null }); }
function ashReset(st, sumId){ Object.assign(st, { sum:sumId, tokens:[], msg:'', q:false, hint:0, how:false, entry:'', entryM:0, tries:0, sigma:false, sumA:null, sumB:null, sumOne:false, drag:false }); }
/* the kinds of sum already introduced by a Sheet Callout (kept in the save: a callout comes once in the game) */
function ashSeen(kind){ return !!(S.ashSeen && S.ashSeen[kind]); }
function ashSee(kind){ (S.ashSeen = S.ashSeen || {})[kind] = S.day || 1; save(); }

/* ---------- drawing ---------- */
const ASH_RH = { hdr:46, data:31, tot:31, fin:33, sub:28, gap:12 }, ASH_RH_SMALL = { hdr:44, data:34, tot:34, fin:36, sub:30, gap:12 }, ASH_RH_TIGHT = { hdr:36, data:27, tot:28, fin:30, sub:26, gap:8 };
function ashLitBox(sum){
  if(sum.lit) return sum.lit;
  const pts = sum.refs.concat([sum.tgt]).map(ashRef), cs = pts.map(p => ashCol(p.c)), rs = pts.map(p => p.r);
  return [ASH_LET[Math.min(...cs)], Math.min(...rs), ASH_LET[Math.max(...cs)], Math.max(...rs)];
}
function ashInLit(L, ref){ const p = ashRef(ref), ci = ashCol(p.c); return ci >= ashCol(L[0]) && ci <= ashCol(L[2]) && p.r >= L[1] && p.r <= L[3]; }
function ashRowLabel(sp, ref){ const p = ashRef(ref), row = sp.rows.find(x => x.r === p.r); return row ? (row.words || row.label || '') : ref; }
/* the formula so far, in cell names and in words */
function ashFormula(sp, sum, tokens){
  // a long sum (a week's seven days) keeps its first cell and its latest in view: "= B2 + … + B8"
  const refs = tokens.filter(t => t.ref); let tk = tokens;
  if(refs.length > 4 && !sum.noGap){ const i1 = tokens.indexOf(refs[0]), iL = tokens.lastIndexOf(refs[refs.length - 1]); tk = [tokens[i1], tokens[i1 + 1], { gap:true }].concat(tokens.slice(iL - 1)); }
  const f = tk.map(t => t.gap ? '<i>…</i>' : t.ref ? `<b>${t.ref}</b>` : `<i>${t.op}</i>`).join(''), w = tk.map(t => t.gap ? '…' : t.ref ? (sum.wordsOf ? sum.wordsOf(t.ref) : ashRowLabel(sp, t.ref)) : t.op).join(' ');
  return { f:'= ' + f, w };
}
function ashFullTokens(sum){ const out = []; sum.refs.forEach((r, i) => { if(i) out.push({ op:sum.ops[i - 1] }); out.push({ ref:r }); }); return out; }
function ashBuilding(sum){ return !!sum && (sum.how === 'build' || sum.how === 'formula') && !sum.built; }   // formula (21 Oct 2026): built, then the sheet works it out
function ashLineBook(sum){ return `Work it out in your book. Write <b>Sum ${sum.no}</b> beside it, then type the answer in <b>${sum.tgt}</b> and press <button class="ash-key" data-ashenter>Enter</button>.`; }
function ashHtml(sp){
  const st = ashSt(sp.id), act = sp.act || null;
  if(act && st.sum !== act.id) ashReset(st, act.id);
  const coKind = act && act.co && (!ashSeen(act.kind) || st.co === act.kind) ? act.kind : null, co = coKind ? act.co : null;
  const focus = act && !co, building = focus && ashBuilding(act), typing = focus && !building, sumOn = building && !!act.sumKey && !!st.sigma;   // Σ SUM pressed (21 Oct 2026)
  const tokens = !act ? [] : building ? st.tokens : ashFullTokens(act), used = tokens.filter(t => t.ref).map(t => t.ref);
  const tagged = act && act.refs.length <= 2, tagOf = ref => { const i = used.indexOf(ref); return i < 0 ? null : tagged ? ASH_LET[i] : ''; };
  const L = focus ? ashLitBox(act) : null, RH = sp.rh || (sp.tight ? ASH_RH_TIGHT : sp.small ? ASH_RH_SMALL : ASH_RH);
  const cols = [{ c:'A', w:sp.lw || 265, lab:true }].concat(sp.cols), gc = {}; cols.forEach((k, i) => { gc[k.c] = i + 2; });
  const gr = {}; sp.rows.forEach((r, i) => { gr[r.r] = i + 2; });
  const tmplC = '30px ' + cols.map(k => k.w + 'px').join(' '), tmplR = '18px ' + sp.rows.map(r => (RH[r.t || 'data'] || 31) + 'px').join(' ');
  const just = sp.just || null;
  let g = `<span class="ash-lt" style="grid-column:1;grid-row:1"></span>` + cols.map(k => `<span class="ash-lt" style="grid-column:${gc[k.c]};grid-row:1">${k.c}</span>`).join('');
  if(L) g += `<div class="ash-lit ${sumOn && st.sumA ? 'adrag' : ''}" style="grid-column:${gc[L[0]]}/${gc[L[2]] + 1};grid-row:${gr[L[1]]}/${gr[L[3]] + 1}"></div>`;
  if(sumOn && st.sumA){ const a = ashRef(st.sumA), b = ashRef(st.sumB || st.sumA); g += `<div class="ash-drag" style="grid-column:${gc[a.c]};grid-row:${gr[Math.min(a.r, b.r)]}/${gr[Math.max(a.r, b.r)] + 1}"></div>`; }
  // a value that needs its row's width (Worth keeping?) names the column it starts from (V.wide): it spans to its own column, over the empty cells
  const wide = {}; sp.rows.forEach(row => cols.forEach(k => { const V = (sp.v || {})[k.c + row.r]; if(V && V.wide && gc[V.wide]) wide[row.r] = { from:gc[V.wide], to:gc[k.c] }; }));
  sp.rows.forEach(row => {
    const t = row.t || 'data', y = gr[row.r], W2 = wide[row.r];
    g += `<span class="ash-rn ${L && !(row.r >= L[1] && row.r <= L[3]) ? 'adim' : ''}" style="grid-column:1;grid-row:${y}">${row.r}</span>`;
    cols.forEach(k => {
      if(W2 && gc[k.c] >= W2.from && gc[k.c] < W2.to) return;   // under the wide cell
      const ref = k.c + row.r, V = (sp.v || {})[ref] || {}, x = W2 && gc[k.c] === W2.to ? `${W2.from}/${W2.to + 1}` : gc[k.c];
      let cls = 'ash-c', inner = '', attr = '';
      if(t === 'gap'){ g += `<div class="ash-c agap" style="grid-column:${x};grid-row:${y}"></div>`; return; }
      if(t === 'hdr'){ cls += ' ah' + (k.lab ? ' al' : '');
        if(!k.lab) inner = `<span class="ash-ht">${k.flag ? ashFlag(k.flag) : ''}${esc(k.top || '')}</span><b>${esc(k.main || '')}</b>${k.plan ? '<i>✓ IN YOUR PLAN</i>' : ''}`; }
      else if(k.lab){ cls += ' al' + (t === 'tot' ? ' atot atotr' : '') + (t === 'fin' ? ' afin' : '') + (t === 'sub' ? ' asub' : '');
        const again = act && act.co && co === null && ashSeen(act.kind) && ashRef(act.tgt).r === row.r ? `<button class="ash-i" data-ashco="${esc(act.kind)}" title="What is this sum?" aria-label="What is this sum?">i</button>` : '';
        inner = `${row.fl ? ashFlag(row.fl) : ashIco(row.ic)}<span class="ash-ln">${esc(row.label || '')}</span>${row.note ? `<small>${esc(row.note)}</small>` : ''}${row.lk ? `<button class="ash-lk" ${row.lk.attr || ''}>${esc(row.lk.text)}</button>` : ''}${row.nw ? '<span class="ash-new">NEW</span>' : ''}${again}`; }
      else {
        cls += ' av' + (t === 'tot' ? ' atot atotr' : '') + (t === 'fin' ? ' afin' : '') + (t === 'sub' ? ' asub' : '');
        const val = V.t === undefined || V.t === null ? '' : String(V.t), vc = V.cls || (row.gold && /£/.test(val) ? 'gold' : '');
        inner = val ? `<span class="${vc}">${esc(val)}</span>` : '';
        if(V.note) inner = `<span class="ash-note">${esc(V.note)}</span>`;
        if(V.f && val) inner = '<span class="ash-au" title="Worked out by the airline">ƒ</span>' + inner;
        if(V.bar !== undefined && V.bar !== null) inner += `<span class="ash-bar"><i style="width:${Math.round(Math.min(1, V.bar) * 100)}%;background:${V.bar >= .8 ? 'var(--green)' : 'var(--bv-amber)'}"></i></span>`;
        if(V.full) inner = '<span class="ash-chip">FULL</span>' + inner;
        if(V.fin) inner += '<span class="ash-fin">FINANCE</span>';
        if(V.title) attr += ` title="${esc(V.title)}"`;
        if(just && just.tgt === ref && !settings.reduceMotion && UI.ashFresh !== sp.id + '|' + just.id){ cls += ' afresh'; }
      }
      if(focus && t !== 'hdr' && !k.lab){
        const tg = tagOf(ref);
        if(tg !== null){ cls += ' aref'; attr += ` data-tag="${tg}"`; }
        else if(ref === act.tgt){ cls += ' atgt' + (building ? ' aq' : '') + (st.q && typing ? ' aquery' : '');
          inner = building ? '?' : act.cellIn ? act.cellIn(sp, st) : `${act.unit === '£' ? '<span class="ash-u">£</span>' : ''}<input class="ash-in" data-ashin="${esc(sp.id)}" inputmode="decimal" autocomplete="off" spellcheck="false" value="${esc(st.entry)}" aria-label="${esc(act.aria || act.words)}, Sum ${act.no}">`;
          if(act.no) attr += ` title="Sum ${act.no}"`; }
        if(building && ref !== act.tgt && (V.t !== undefined && V.t !== '' && V.t !== null) && t !== 'sub'){ cls += ' apick'; attr += ` data-ashref="${ref}" role="button" tabindex="0" aria-label="${esc(ashRowLabel(sp, ref))}: ${esc(String(V.t))}"`; }
        if(!ashInLit(L, ref)) cls += ' adim';
      }
      else if(focus && (k.lab || t === 'hdr') && !(row.r >= L[1] && row.r <= L[3]) && t !== 'hdr') cls += ' adim';
      g += `<div class="${cls}" data-ref="${ref}" style="grid-column:${x};grid-row:${y}"${attr}>${inner}</div>`;
    });
  });
  let coBlock = '', coOut = '';
  // a callout may ring the cells it is about (2px cyan) while it is open (21 Oct 2026: the Changes sheet's Difference column)
  if(co && co.ring){ const [c1, r1, c2, r2] = co.ring; g += `<div class="ash-ring" style="grid-column:${gc[c1]}/${gc[c2] + 1};grid-row:${gr[r1]}/${gr[r2] + 1}"></div>`; }
  if(co){ const at = co.at, side = sp.small ? 'pd' : co.side || 'pu', inner = `<i class="ash-ptr" style="${sp.small ? 'left:330px' : co.ptr || ''}"></i>
      <span class="ash-coe">${esc(co.eyebrow || 'NEW SUM')}</span><b class="ash-cot">${esc(co.title)}</b>${(co.text || []).map(p => `<p>${p}</p>`).join('')}
      ${co.rule ? `<p class="ash-cor">${co.rule}</p>` : ''}<div class="ash-coa"><button class="bv-btn primary" data-ashgot="${esc(act.kind)}">Got it</button></div>`;
    // on a small sheet there is no empty part of the grid: the callout sits just above it, pointing down at the row
    if(sp.small) coBlock = `<div class="ash-co ${sp.coAside ? 'pr aside' : side} static ${sp.tight ? 'tight' : ''}" role="dialog" aria-label="${esc(co.title)}">${inner}</div>`;   // aside: beside the sheet, over the panel's spare room (the Fuel desk's order fits at 1366)
    // out: to the right of the grid, beside the cells it rings, so the rows under them stay in view (21 Oct 2026)
    else if(co.out) coOut = `<div class="ash-co pl out" role="dialog" aria-label="${esc(co.title)}" style="left:${30 + cols.reduce((t, k) => t + k.w, 0) + 18}px;top:${co.outTop || 0}px">${inner}</div>`;
    else g += `<div class="ash-co ${side}" role="dialog" aria-label="${esc(co.title)}" style="grid-column:${gc[at[0]]}/${gc[at[2]] + 1};grid-row:${gr[at[1]]}/${gr[at[3]] + 1}">${inner}</div>`; }
  // the formula bar
  let nb = '', fm = '', words = '', ops = '';
  if(focus){ const F = ashFormula(sp, act, tokens); nb = act.tgt; fm = sumOn ? `=SUM(${st.sumA ? ashSumTxt(st, true) : ''}<span class="ash-caret"></span>` : F.f + (building ? '<span class="ash-caret"></span>' : '');
    words = sumOn ? '' : building ? (F.w + (tokens.length % 2 === 0 ? (tokens.length ? ` (now click the ${esc(ashNextWord(sp, act, tokens))})` : act.sumKey ? '' : '(click the cells it uses)') : '')) : esc(act.words);
    if(building && act.sumKey && !tokens.length && !st.sigma) fm = '=<span class="ash-caret"></span>';
    if(building) ops = `<span class="ash-ops">${act.sumKey ? `<button class="sum" data-ashop="sum" aria-pressed="${!!st.sigma}" title="Add a whole column: press, then drag down it">Σ SUM</button>` : ''}${['×', '÷', '+', '−'].map(o => `<button data-ashop="${o}" aria-label="${o}">${o}</button>`).join('')}<button class="u" data-ashop="undo" ${tokens.length || st.sigma ? '' : 'disabled'}>Undo</button></span>`; }
  else if(co && act){ nb = act.tgt; words = esc(act.words); }
  else { const d = just || (!act ? sp.doneF : null) || null; if(d && d.tgt){ const F = ashFormula(sp, d, ashFullTokens(d)); nb = d.tgt; fm = F.f; words = `${esc(d.words)}${d.val !== undefined ? ` = <b>${esc(d.val)}</b>` : ''}`;
    if(d.sumText){ fm = '=' + esc(d.sumText).replace(/([A-Z]+\d+)/g, '<b>$1</b>'); words = `${esc(d.sumWords || '')}${d.val !== undefined ? ` = <b>${esc(d.val)}</b>` : ''}`; }
    else if(d.barWords !== undefined) words = d.barWords; } }
  const fb = `<div class="ash-fb" role="group" aria-label="Formula bar"><span class="ash-nb">${nb}</span><span class="ash-fx">fx</span><span class="ash-fm"><span class="ash-f">${fm.replace(/^= /, '=&nbsp;')}</span><small class="ash-w">${words}</small></span>${ops}</div>`;
  // the line under the grid
  let line = '', lcls = '';
  if(just){ line = `<span class="pos">✓</span> ${just.doneLine || ''}`; }
  else if(focus && building){ line = st.msg ? esc(st.msg) : (act.sumKey && act.sumLine ? act.sumLine(st) : '') || act.lineBuild || `Click the cells to build the formula. Then work it out in your book and type the answer in <b>${act.tgt}</b>.`; if(st.q) lcls = 'q'; }
  else if(focus){ line = st.msg ? `${esc(st.msg)}` : act.lineType || ashLineBook(act); if(st.q) lcls = 'q';
    line += `${act.hints ? `<button class="ash-hl" data-ashhint>${st.hint ? 'Another hint' : 'Give me a hint'}</button>` : ''}${act.how2 ? `<button class="ash-hl quiet" data-ashhow>${st.how ? 'Hide the example' : 'Show me how'}</button>` : ''}`; }
  else if(co) line = co.line || 'Read the note on the sheet, then press Got it.';
  else line = sp.doneLine || '';
  const hints = focus && typing && st.hint && act.hints ? act.hints().slice(0, st.hint) : [];
  const how = focus && typing && st.how && act.how2 ? act.how2() : '';
  const top = sp.small ? '' : `<header class="ash-top"><div class="ash-tt">${sp.crumb ? `<span class="ash-crumb">${esc(sp.crumb)}</span>` : ''}<h1 class="ash-title">${esc(sp.title || '')}</h1></div>${sp.tabs ? `<nav class="ash-tabs" aria-label="Sheets">${sp.tabs.map(t => `<button class="ash-tab ${t.on ? 'on' : ''} ${t.off ? 'off' : ''}" data-ashtab="${esc(t.id)}" ${t.off || t.on ? 'aria-disabled="true"' : ''} title="${esc(t.off ? `${t.label}: not on the sheet yet` : t.label)}">${ashIco(t.ic)}${esc(t.label)}</button>`).join('')}</nav>` : ''}</header>`;
  return `<section class="ash ${sp.small ? 'ash-small' : ''} ${sp.tight ? 'ash-tight' : ''} ${focus ? 'ash-work' : 'ash-done'} ${sumOn ? 'ash-sumon' : ''}" data-ash="${esc(sp.id)}" aria-label="${esc(sp.title || 'Sheet')}">${top}${coBlock}${fb}
    <div class="ash-gridw"><div class="ash-grid" role="grid" style="grid-template-columns:${tmplC};grid-template-rows:${tmplR}">${g}</div>${coOut}</div>
    <p class="ash-line ${lcls}" role="status">${line}</p>${hints.length ? `<div class="ash-hints">${hints.map(h => `<span class="${h.est ? 'est' : ''}">${esc(h.t)}</span>`).join('')}</div>` : ''}${how ? `<div class="ash-how">${how}</div>` : ''}</section>`;
}
function ashNextWord(sp, sum, tokens){ const n = tokens.filter(t => t.ref).length, ref = sum.refs[n] || sum.refs[sum.refs.length - 1]; return String(sum.wordsOf ? sum.wordsOf(ref) : ashRowLabel(sp, ref)).toLowerCase(); }

/* ---------- the builder: cells and operations, each checked against what the sum means ---------- */
function ashLive(){ return UI.ashLive && document.querySelector(`[data-ash="${CSS.escape(UI.ashLive.id)}"]`) ? UI.ashLive : null; }
function ashPick(sp, ref){
  const act = sp.act, st = ashSt(sp.id); if(!act || !ashBuilding(act) || st.sigma) return;
  const n = st.tokens.length; st.q = false;
  if(n % 2 === 1){ st.msg = 'Next, an operation: × ÷ + or − at the end of the formula bar.'; render(); return; }
  if(ref === act.tgt){ st.msg = `${act.tgt} is where the answer goes. Which cells make it?`; st.q = true; render(); return; }
  if(st.tokens.some(t => t.ref === ref)){ st.msg = `${ref} is in the formula already. Which other cell does it need?`; st.q = true; render(); return; }
  const k = st.tokens.filter(t => t.ref).length, want = act.refs[k], left = act.refs.filter(r => !st.tokens.some(t => t.ref === r));
  const ok = act.commute ? left.includes(ref) : ref === want;
  if(!ok){ const msg = (act.why && act.why(ref, k, st.tokens)) || (left.includes(ref) ? `That cell comes later in the formula: ${act.orderWhy || 'which comes first?'}` : `${ashRowLabel(sp, ref)} isn't part of ${act.name || 'this sum'}. Which cells make it?`);
    st.msg = msg; st.q = true; ashBuildRec(act, st.tokens.concat([{ ref }]), false, msg); render(); return; }
  st.tokens.push({ ref }); st.msg = '';
  if(st.tokens.length === act.refs.length * 2 - 1) ashBuilt(sp, act, st);
  render();
}
function ashOp(sp, op){
  const act = sp.act, st = ashSt(sp.id); if(!act || !ashBuilding(act)) return;
  if(op === 'undo'){ if(st.sigma){ if(st.sumA){ st.sumA = st.sumB = null; st.sumOne = false; } else st.sigma = false; st.msg = ''; st.q = false; render(); return; } st.tokens.pop(); st.msg = ''; st.q = false; render(); return; }
  if(op === 'sum'){ if(!act.sumKey) return; if(st.tokens.length){ st.msg = 'Σ SUM starts a formula of its own: press Undo to clear the cells first.'; st.q = true; render(); return; }
    st.sigma = true; st.sumA = st.sumB = null; st.sumOne = false; st.msg = ''; st.q = false; if(act.onSumKey) act.onSumKey(); render(); return; }
  if(st.sigma){ st.msg = act.sumOpWhy || 'Σ SUM adds every cell you drag over: drag down the column, then press Enter.'; st.q = true; render(); return; }
  const n = st.tokens.length; st.q = false;
  if(n % 2 === 0){ st.msg = n ? 'Next, a cell from the sheet.' : 'Start with a cell from the sheet.'; render(); return; }
  const want = act.ops[(n - 1) / 2];
  if(op !== want){ const msg = (act.opWhy && act.opWhy(op)) || ASH_OPWHY[want] || 'Which operation joins these?'; st.msg = msg; st.q = true; ashBuildRec(act, st.tokens.concat([{ op }]), false, msg); render(); return; }
  st.tokens.push({ op }); st.msg = ''; render();
}
const ASH_OPWHY = { '×':'Each one is the same amount: which operation repeats it for every one?', '+':'This puts amounts together: which operation joins them?',
  '−':'This is what is left after taking one amount away: which operation takes away?', '÷':'This shares an amount out equally: which operation shares?' };
/* Σ SUM (21 Oct 2026): the range on the sheet, "B2:B8" (cells bold), and Enter: the range must be every cell the sum adds */
function ashSumTxt(st, html){ const a = ashRef(st.sumA), b = ashRef(st.sumB || st.sumA), r1 = Math.min(a.r, b.r), r2 = Math.max(a.r, b.r);
  return html ? `<b>${a.c}${r1}</b>:<b>${a.c}${r2}</b>` : `${a.c}${r1}:${a.c}${r2}`; }
function ashSumEnter(sp){
  const act = sp.act, st = ashSt(sp.id); if(!act || !act.sumKey || !st.sigma || st.drag) return;
  if(!st.sumA){ st.msg = act.sumAsk || 'Drag down the column first, then press Enter.'; st.q = false; render(); return; }
  const a = ashRef(st.sumA), b = ashRef(st.sumB || st.sumA), r1 = Math.min(a.r, b.r), r2 = Math.max(a.r, b.r), W = act.refs.map(ashRef), w1 = Math.min(...W.map(x => x.r)), w2 = Math.max(...W.map(x => x.r)), txt = `SUM(${ashSumTxt(st)})`;
  if(a.c !== W[0].c || r1 !== w1 || r2 !== w2){ const msg = (act.sumWhy && act.sumWhy(a.c, r1, r2)) || 'That is not every cell this sum adds. Drag again.'; st.msg = msg; st.q = true; ashBuildRec(act, [{ ref:txt }], false, msg); st.sumA = st.sumB = null; st.sumOne = false; render(); return; }
  if(act.onSum) act.onSum(txt); st.tokens = [{ ref:txt }]; st.sigma = false; ashBuilt(sp, act, st); render();
}
/* while dragging, the range and the bar follow the pointer without redrawing the page */
function ashSumPaint(sp, root, st){
  const grid = root.querySelector('.ash-grid'); if(!grid || !st.sumA) return; let d = grid.querySelector('.ash-drag');
  const a = ashRef(st.sumA), b = ashRef(st.sumB || st.sumA), cell = r => grid.querySelector(`.ash-c[data-ref="${a.c}${r}"]`), c1 = cell(Math.min(a.r, b.r)), c2 = cell(Math.max(a.r, b.r)); if(!c1 || !c2) return;
  if(!d){ d = document.createElement('div'); d.className = 'ash-drag'; grid.appendChild(d); }
  d.style.gridColumn = c1.style.gridColumn; d.style.gridRow = `${c1.style.gridRow} / ${+c2.style.gridRow + 1}`;
  const lit = grid.querySelector('.ash-lit'); if(lit) lit.classList.add('adrag');
  const f = root.querySelector('.ash-f'); if(f) f.innerHTML = `=SUM(${ashSumTxt(st, true)}<span class="ash-caret"></span>`;
  const ln = root.querySelector('.ash-line'); if(ln && sp.act && sp.act.sumLine){ ln.classList.remove('q'); ln.innerHTML = sp.act.sumLine(Object.assign({}, st, { msg:'' })); }
}
function ashBuilt(sp, act, st){ act.built = true; if(act.onBuilt) act.onBuilt(st.tokens); ashBuildRec(act, st.tokens, true); st.tokens = []; st.msg = ''; st.q = false;
  if(act.how === 'formula'){ const r = act.answer(String(act.want), act.want, st) || {};
    if(r.ok || r.shown){ UI.ashJust = { sheet:sp.id, sum:act.id, shown:false, at:Date.now(), note:'', formula:true }; ashReset(st, null); if(typeof liveChime === 'function' && typeof opsSoundOn === 'function' && opsSoundOn()) liveChime('ding'); }
    return; }
  setTimeout(() => { try{ const i = document.querySelector(`[data-ashin="${CSS.escape(sp.id)}"]`); if(i) i.focus({ preventScroll:true }); }catch(e){} }, 40); }
/* the build goes into the record under the sum's number: what was clicked, and the question if a cell or operation didn't fit */
function ashBuildRec(act, tokens, ok, msg){
  try{ if(!act.recKey) return; const formula = act.how === 'formula' && typeof paperRecOpen0 === 'function';
    const e = (formula ? paperRecOpen0 : recOpen)(act.recKey, Object.assign({}, act.recO || {}, { type:'build', level:formula ? 'Formula' : 'Build', method:formula ? 'the formula built on the sheet; the sheet worked it out' : 'click the cells and the operation' }));
    recAttempt(e, { ok, chips:tokens.map(t => t.op ? { op:t.op } : { label:act.wordsOf ? act.wordsOf(t.ref) : t.ref, text:t.ref, k:t.ref }), msg, note:msg, method:'click the cells and the operation' }); }catch(e){}
}
/* Enter: the answer typed, checked by the sum (the record, two tries, Finance) */
function ashEnter(sp){
  const act = sp.act, st = ashSt(sp.id); if(!act || ashBuilding(act)) return;
  const inp = document.querySelector(`[data-ashin="${CSS.escape(sp.id)}"]`); if(inp) st.entry = String(inp.value).trim();
  const raw = act.readIn ? act.readIn(st) : String(st.entry || '').trim();
  if(!raw){ st.msg = act.emptyMsg || 'Type the answer from your book, then press Enter.'; st.q = false; render(); return; }
  const v = act.parse ? act.parse(raw, st) : parseCell(act.unit === '£' ? '£' : 'n', raw);
  if(v === null){ st.msg = 'That is not a figure: type the number from your book.'; st.q = true; render(); return; }
  const r = act.answer(raw, v, st) || {};
  if(r.ok || r.shown){ UI.ashJust = { sheet:sp.id, sum:act.id, shown:!!r.shown, at:Date.now(), note:r.ok && r.note ? r.note : '' }; ashReset(st, null); if(r.ok && typeof liveChime === 'function' && typeof opsSoundOn === 'function' && opsSoundOn()) liveChime('ding'); }
  else { st.q = true; st.tries = (st.tries || 0) + 1; st.msg = r.note || 'Check your working in the book. One more try.'; }
  render();
}
/* a hint in the pupil's own numbers, from the workbook's WorkingMethods (hintTemplate), ending with an estimate */
function ashHintFill(rel, vals){
  const wm = (WORLD.workingMethods || []).find(m => m.relationship === rel), t = wm && wm.hint; if(!t) return [];
  return String(t).split(/\s*Hint \d+:\s*/).filter(Boolean).map(h => { let ok = true; const s = h.replace(/\{(\w+)\}/g, (m, k) => { if(vals[k] === undefined || vals[k] === null){ ok = false; return m; } return vals[k]; }); return ok ? s.trim() : null; }).filter(Boolean);
}
function ashRound(v){ const a = Math.abs(v), p = a >= 1000 ? 1000 : a >= 100 ? 100 : 10; return Math.round(v / p) * p; }
/* Show me how: the same kind of sum worked through with other numbers (never the pupil's answer) */
function ashHowLines(a, b, op, unitB){ try{ return wkMethod(a, b, op, 'n', unitB || 'n', '£'); }catch(e){ return []; } }

/* ---------- binding ---------- */
function ashBind(sp){
  const root = document.querySelector(`[data-ash="${CSS.escape(sp.id)}"]`); if(!root) return; UI.ashLive = sp;
  const st = ashSt(sp.id);
  root.querySelectorAll('[data-ashref]').forEach(c => { c.onclick = () => ashPick(sp, c.getAttribute('data-ashref')); c.onkeydown = e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); ashPick(sp, c.getAttribute('data-ashref')); } }; });
  if(sp.act && sp.act.sumKey && ashBuilding(sp.act)){   // Σ SUM: press on the first cell, drag to the last, let go (or click the first, then the last)
    const grid = root.querySelector('.ash-grid'), col = ashRef(sp.act.refs[0]).c, at = e => { const el = document.elementFromPoint(e.clientX, e.clientY), c = el && el.closest ? el.closest('.ash-c[data-ref]') : null; return c ? c.getAttribute('data-ref') : null; };
    if(grid){ grid.onpointerdown = e => { if(!st.sigma) return; const ref = at(e); if(!ref) return; e.preventDefault();
        if(ashRef(ref).c !== col){ st.msg = (sp.act.sumWrongCol && sp.act.sumWrongCol(ref)) || `Drag down column ${col}: the cells this sum adds.`; st.q = true; render(); return; }
        if(st.sumA && st.sumOne){ st.sumB = ref; st.sumOne = false; render(); return; }
        st.drag = true; st.sumA = st.sumB = ref; st.msg = ''; st.q = false; try{ grid.setPointerCapture(e.pointerId); }catch(x){} ashSumPaint(sp, root, st); };
      grid.onpointermove = e => { if(!st.drag) return; const ref = at(e); if(!ref || ashRef(ref).c !== col || ref === st.sumB) return; st.sumB = ref; ashSumPaint(sp, root, st); };
      grid.onpointerup = grid.onpointercancel = () => { if(!st.drag) return; st.drag = false; st.sumOne = st.sumA === st.sumB; render(); }; } }
  root.querySelectorAll('[data-ashsumgo]').forEach(b => b.onclick = () => ashSumEnter(sp));
  root.querySelectorAll('[data-ashop]').forEach(b => b.onclick = () => ashOp(sp, b.getAttribute('data-ashop')));
  root.querySelectorAll('[data-ashgot]').forEach(b => b.onclick = () => { const k = b.getAttribute('data-ashgot'); st.co = null; if(!ashSeen(k)) ashSee(k); render(); });
  root.querySelectorAll('[data-ashco]').forEach(b => b.onclick = e => { e.stopPropagation(); st.co = b.getAttribute('data-ashco'); render(); });
  root.querySelectorAll('[data-ashhint]').forEach(b => b.onclick = () => { st.hint = Math.min((st.hint || 0) + 1, 3); render(); });
  root.querySelectorAll('[data-ashhow]').forEach(b => b.onclick = () => { st.how = !st.how; render(); });
  root.querySelectorAll('[data-ashenter]').forEach(b => b.onclick = () => ashEnter(sp));
  root.querySelectorAll('[data-ashtab]').forEach(b => b.onclick = () => { if(b.getAttribute('aria-disabled') === 'true') return; UI.ashTab = b.getAttribute('data-ashtab'); render(); });
  root.querySelectorAll('[data-ashm]').forEach(m => { m.onchange = m.oninput = () => { st.entryM = m.value; }; m.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); e.stopPropagation(); st.entryM = m.value; ashEnter(sp); } }; });
  const inp = root.querySelector('[data-ashin]');
  if(inp){ inp.oninput = () => { if(inp.hasAttribute('data-ashwhole')) inp.value = inp.value.replace(/[^\d]/g, ''); st.entry = inp.value; if(st.q && st.msg){ st.q = false; const c = inp.closest('.ash-c'); if(c) c.classList.remove('aquery'); } };
    inp.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); e.stopPropagation(); ashEnter(sp); } };
    setTimeout(() => { try{ if(document.activeElement !== inp && !document.querySelector('#bfLayer, .overlay:not([hidden])')) inp.focus({ preventScroll:true }); const n = inp.value.length; inp.setSelectionRange(n, n); }catch(e){} }, 40); }
  if(sp.just) UI.ashFresh = sp.id + '|' + sp.just.id;
}
/* while a sum is being built, the operators can be typed too (× as * or x, ÷ as /), and Backspace is Undo */
document.addEventListener('keydown', e => {
  const sp = ashLive(); if(!sp || !sp.act || !ashBuilding(sp.act)) return; const t = e.target;
  if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
  if(document.querySelector('#bfLayer')) return;
  if(e.key === 'Enter' && ashSt(sp.id).sigma){ e.preventDefault(); e.stopImmediatePropagation(); ashSumEnter(sp); return; }   // this Enter is the formula's, not Next sum's
  const map = { '*':'×', 'x':'×', 'X':'×', '/':'÷', '+':'+', '-':'−', '−':'−' }, op = map[e.key];
  if(op){ e.preventDefault(); ashOp(sp, op); return; }
  if(e.key === 'Backspace'){ e.preventDefault(); ashOp(sp, 'undo'); }
});

/* ---------- the pages' footer: Next sum lights when the answer is right ---------- */
function ashNextBtn(label, on, go){ return `<button class="btn primary big ${go ? 'ash-go' : ''}" id="ashNext" ${on ? '' : 'disabled'}>${label} &#9654;</button>`; }
function ashNextSum(){ UI.ashJust = null; UI.justDone = null; resetEntry(); render(); }
document.addEventListener('keydown', e => { if(e.key !== 'Enter' || !UI.ashJust) return; const b = document.getElementById('ashNext'), t = e.target; if(!b || b.disabled || (t && t.tagName === 'INPUT') || document.querySelector('#bfLayer')) return; e.preventDefault(); b.click(); });

/* ---------- the tests and the teacher's test kit: the sum on screen, how to build it and its answer ---------- */
function ashPlan(){
  const sp = ashLive(); if(!sp || !sp.act) return null; const a = sp.act, st = ashSt(sp.id);
  const seq = []; if(ashBuilding(a)){ const done = st.tokens.length; ashFullTokens(a).slice(done).forEach(t => seq.push(t.ref ? { ref:t.ref } : { op:t.op })); }
  const range = a.sumKey && ashBuilding(a) ? [a.refs[0], a.refs[a.refs.length - 1]] : null;
  return { sheet:sp.id, sum:a.id, tgt:a.tgt, no:a.no, build:ashBuilding(a), formula:a.how === 'formula', seq, range, answer:a.want, co:!!document.querySelector(`[data-ash="${CSS.escape(sp.id)}"] [data-ashgot]`) };
}
function ashGo(P, value){
  const root = document.querySelector(`[data-ash="${CSS.escape(P.sheet)}"]`); if(!root) return;
  const got = root.querySelector('[data-ashgot]'); if(got){ got.click(); return; }
  if(P.range){ const sp = ashLive(), st = sp && ashSt(sp.id); if(sp && st){ st.sigma = true; st.sumA = P.range[0]; st.sumB = P.range[1]; st.sumOne = false; if(sp.act && sp.act.onSumKey) sp.act.onSumKey(); ashSumEnter(sp); } return; }
  P.seq.forEach(x => { const r = document.querySelector(`[data-ash="${CSS.escape(P.sheet)}"]`); const el = x.ref ? r.querySelector(`[data-ashref="${x.ref}"]`) : r.querySelector(`[data-ashop="${x.op}"]`); if(el) el.click(); });
  const r2 = document.querySelector(`[data-ash="${CSS.escape(P.sheet)}"]`), inp = r2 && r2.querySelector('[data-ashin]'); if(!inp) return;
  const sel = r2.querySelector('[data-ashm]'), val = value === undefined ? P.answer : value;
  if(sel && typeof val === 'number'){ const h = Math.floor(val + 1e-9); inp.value = String(h); sel.value = String(Math.round((val - h) * 60)); sel.dispatchEvent(new Event('change')); }
  else inp.value = String(val);
  inp.dispatchEvent(new Event('input')); inp.dispatchEvent(new KeyboardEvent('keydown', { key:'Enter', bubbles:true }));
}
window.__ash = { plan:ashPlan, go:ashGo, live:() => ashLive(), seen:k => ashSeen(k) };
if(window.__tkSums) window.__tkSums.unshift({ what:'a sum on the sheet', test:() => !!ashPlan(), plan:() => { const P = ashPlan(); if(!P) return null;
  if(P.co) return { at:'[data-ashgot]', value:'Got it', go:() => ashGo(P) };
  return { at:`[data-ash="${P.sheet}"] [data-ref="${P.tgt}"]`, value:P.answer, go:() => ashGo(P) }; } });
if(window.__tkSums) window.__tkSums.unshift({ what:'the next sum', test:() => !!(UI.ashJust && document.querySelector('#ashNext:not([disabled])')), plan:() => ({ at:'#ashNext', value:'Next sum', go:() => document.getElementById('ashNext').click() }) });
