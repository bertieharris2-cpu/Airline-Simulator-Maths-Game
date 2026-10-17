
/* ==================================================================
   THE TEACHER TEST TOOLKIT (D102, Fable's Screens brief 3, 17 Oct 2026; Settings teacherTestMode)
   Bertie was testing screens by playing every sum and setting up every plan by hand. Test mode (teacher panel → Testing)
   puts a slim amber bar across the top of every screen, "TEST MODE — nothing here counts", with the tools:
     Answer (Ctrl+Shift+A) · Answer all · Show the answers · Auto-plan · Run to the next plan, review, decision, Fuel desk
     or month (Ctrl+Shift+R) · Skip briefing · Jump to… · Event now.
   Nothing reaches the pupil. Switching test mode on turns the airline on screen into a TEST copy, saved apart from the
   pupil's game (its own store, labelled TEST); the pupil's game, record, milestones and sum numbers stay exactly as they
   were, and switching test mode off brings the pupil's game back. Test airlines are deleted in one go.
   Jump to… starts a fresh test airline at a point on the Steady path: save codes the chapter tests write along the way
   (tools/make_jumps.sh), embedded by the build as data-jumps, gzipped.
   Ctrl+Shift+T toggles the bar's tools while test mode is on; the teacher panel opens from the bar (or the corner).
   ================================================================== */
{
const TK_KEY = 'airlineOpening.v1.test', TK_KEEP = 4;
let TK_JUMPS = {}; try{ TK_JUMPS = JSON.parse(document.getElementById('data-jumps').textContent); }catch(e){}
const tkOn = () => !!settings.testMode;
const tkQ = s => document.querySelector(s);
const tkQa = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const tkSeen = e => !!e && e.getClientRects().length > 0;
const tkWait = ms => new Promise(r => setTimeout(r, ms));
function tkFill(sel, v){ const e = typeof sel === 'string' ? tkQ(sel) : sel; if(!e || v === null || v === undefined) return false; e.value = String(v); e.dispatchEvent(new Event('input', { bubbles:true })); e.dispatchEvent(new Event('change', { bubbles:true })); return true; }
function tkTap(sel){ const e = typeof sel === 'string' ? tkQ(sel) : sel; if(!e || e.disabled) return false; e.click(); return true; }

/* ---------- 1. test airlines: their own store, so nothing reaches the pupil's game ---------- */
const tkIndex = () => { try{ const o = JSON.parse(localStorage.getItem(TK_KEY) || 'null'); if(o && Array.isArray(o.list)) return o; }catch(e){} return { list:[], current:null }; };
const tkPutIndex = o => { try{ localStorage.setItem(TK_KEY, JSON.stringify(o)); }catch(e){} };
function tkMark(s, label){ return { id:'t' + Date.now().toString(36) + Math.floor(Math.random() * 1e4), label, made:Date.now(), from:(s && s.airline && s.airline.name) || '' }; }
function tkSaveTest(){
  const o = tkIndex(), id = S.test.id; let row = o.list.find(x => x.id === id);
  if(!row){ row = { id }; o.list.push(row); }
  Object.assign(row, { label:S.test.label, name:(S.airline && S.airline.name) || '', day:S.day || 0, saved:Date.now() }); o.current = id;
  const txt = JSON.stringify(S);
  for(let k = 0; k < 6; k++){ try{ localStorage.setItem(TK_KEY + '.' + id, txt); break; }
    catch(e){ const old = o.list.filter(x => x.id !== id).sort((a, b) => a.saved - b.saved)[0]; if(!old) break; tkDropOne(o, old.id); } }   // full: the oldest test airline goes
  while(o.list.length > TK_KEEP){ const old = o.list.filter(x => x.id !== id).sort((a, b) => a.saved - b.saved)[0]; if(!old) break; tkDropOne(o, old.id); }
  tkPutIndex(o);
}
function tkDropOne(o, id){ try{ localStorage.removeItem(TK_KEY + '.' + id); }catch(e){} o.list = o.list.filter(x => x.id !== id); if(o.current === id) o.current = null; }
function tkDeleteAll(){ const o = tkIndex(); o.list.forEach(x => { try{ localStorage.removeItem(TK_KEY + '.' + x.id); }catch(e){} }); tkPutIndex({ list:[], current:null }); }
function tkLoadCurrent(){ const o = tkIndex(); if(!o.current) return null; try{ const s = JSON.parse(localStorage.getItem(TK_KEY + '.' + o.current) || 'null'); return s ? migrate(s) : null; }catch(e){ return null; } }
const tkSave0 = save;
save = function(){ if(S && S.test && tkOn()) return tkSaveTest(); return tkSave0.apply(this, arguments); };
const tkLoad0 = load;
load = function(){
  if(tkOn() && !IS_DISPLAY){ const t = tkLoadCurrent(); if(t) return t;
    const s = tkLoad0.apply(this, arguments); if(s){ s.test = tkMark(s, 'TEST copy of ' + ((s.airline && s.airline.name) || 'the game')); } return s; }   // never the pupil's own game in test mode
  return tkLoad0.apply(this, arguments);
};
function tkEnter(){
  if(S && !S.test){ try{ tkSave0(); }catch(e){} S = JSON.parse(JSON.stringify(S)); S.test = tkMark(S, 'TEST copy of ' + ((S.airline && S.airline.name) || 'the game')); }
  settings.testMode = true; saveSettings(); save(); tkSync(); render(); toast('Test mode: a TEST copy of this airline. The pupil\'s game is put aside, unchanged.');
}
function tkLeave(){
  tkStop(); settings.testMode = false; saveSettings();
  S = tkLoad0() || newState(); UI.view = null;
  if(S.needsRestart && !landSave()) startRound(S.round);
  if(S.airline && S.airline.name && step() && !['welcome', 'name'].includes(step().t)) S.overlay = { type:'menu' };
  tkSync(); render(); toast("Test mode off: the pupil's game is back as it was.");
}
async function tkGunzip(b64){
  const bin = atob(b64), u = new Uint8Array(bin.length); for(let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  if(typeof DecompressionStream === 'undefined') throw new Error('this browser cannot unpack the test airlines');
  return await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
}
async function tkJump(key){
  const J = TK_JUMPS[key]; if(!J){ toast('No test airline for that point yet'); return; }
  tkStop(); toast(`Building the test airline: ${J.label}…`);
  try{ const s = migrate(JSON.parse(await tkGunzip(J.gz))); if(!s) throw new Error('the save would not load');
    s.test = tkMark(s, 'Jump: ' + J.label); if(!tkOn()){ try{ tkSave0(); }catch(e){} settings.testMode = true; saveSettings(); }
    S = s; UI.view = null; landSave(); if(S.overlay && S.overlay.type === 'menu') S.overlay = null; save(); tkSync(); render(); toast(`TEST airline at ${J.label} (${dateLong(S.day || 1)})`); }
  catch(e){ toast('That jump did not work: ' + e.message); }
}

/* ---------- 2. the sums on the screen: the answer to each, the way the tests give it ---------- */
/* Each recipe answers one sum. show: where the answer goes and what it is (for Show the answers); go: fill it in and check it. */
const tkOpSel = (pfx, id, x) => ['+', '−', '×', '÷'].includes(x) ? `[data-${pfx}op="${id ? tkQa(id) + '|' : ''}${x}"]` : `[data-${pfx}fig="${id ? tkQa(id) + '|' : ''}${tkQa(x)}"]`;
function tkSeqText(seq){ return seq.map(x => ['+', '−', '×', '÷'].includes(x) ? x : String(x)).join(' '); }
const TK_SUMS = [
  { what:'a flight time', test:() => tkQ('.ftp-page') && typeof ftpPlan === 'function', plan:() => { const P = ftpPlan(); if(!P || !P.next) return null; const k = tkQa(P.next.key);
      if(P.next.h !== undefined) return { at:`[data-ftph="${k}"]`, value:`${P.next.h} h ${P.next.m} min`, go:() => { tkFill(`[data-ftph="${k}"]`, P.next.h); tkFill(`[data-ftpm="${k}"]`, P.next.m); tkTap(`[data-ftpchk="${k}"]`); } };
      return { at:`[data-ftpin="${k}"]`, value:P.next.answer, go:() => { tkFill(`[data-ftpin="${k}"]`, P.next.answer); tkTap(`[data-ftpchk="${k}"]`); } }; } },
  { what:'the hunt', test:() => step().t === 'hunt' && tkQ('#huntChk, [data-hunt]'), plan:() => { const P = huntPlan(); if(!P) return null;
      return { at:'[data-pad="hunt"]', value:P.right, go:() => { if(!tkQ('[data-pad="hunt"]')) tkTap(`[data-hunt="${P.wrong}"]`); tkFill('[data-pad="hunt"]', P.right); tkTap('#huntChk'); } }; } },
  { what:"the Captain's challenge", test:() => step().t === 'capChallenge' && tkQ('#capGo, #capChk'), plan:() => { const P = capPlan(); if(!P) return null;
      return { at:'[data-pad="capch"]', value:P.answer, go:() => { if(tkQ('#capGo')) tkTap('#capGo'); tkFill('[data-pad="capch"]', P.answer); tkTap('#capChk'); } }; } },
  { what:'the order sum', test:() => tkQ('#foChk') && typeof foPlan === 'function', plan:() => { const F = foPlan(); if(!F) return null;
      return F.level === 'build' ? { at:'#foChk', value:tkSeqText(['blocks', '×', 'price of a block']), go:() => { F.seq.forEach(x => tkTap(x === '×' ? '[data-foop="×"]' : `[data-fofig="${x}"]`)); tkTap('#foChk'); } }
        : { at:'#foIn', value:F.answer, go:() => { tkFill('#foIn', F.answer); tkTap('#foChk'); } }; } },
  { what:'the fuel sign-off', test:() => tkQ('#fdSignChk'), plan:() => { const one = (fuelBlock() * fuelOn(S.day || 1)).toFixed(2), n = (UI.fd && UI.fd.selNow) || 1;
      return { at:'[data-fds="one"]', value:one, go:() => { tkFill('[data-fds="one"]', one); if(tkQ('[data-fds="all"]')) tkFill('[data-fds="all"]', (one * n).toFixed(2)); tkTap('#fdSignChk'); } }; } },
  { what:'the fuel sum', test:() => tkQ('#fsChk'), plan:() => ({ at:'#fsChk', value:'litres × price', go:() => { ['[data-fsfig="L"]', '[data-fsop="×"]', '[data-fsfig="R"]'].forEach(tkTap); tkTap('#fsChk'); } }) },
  { what:'the fuel bill', test:() => tkQ('#fbIn') && S.rnd && S.rnd.fuelOrder, plan:() => ({ at:'#fbIn', value:S.rnd.fuelOrder.total, go:() => { tkFill('#fbIn', S.rnd.fuelOrder.total); tkTap('#fbCheck'); } }) },
  { what:'a review cell', test:() => typeof rbPlan === 'function' && tkQ('.rb-card:not(.ok):not(.locked)'), plan:() => { const P = rbPlan(); if(!P) return null;
      if(P.seq) return { at:`[data-rbchk="${tkQa(P.id)}"]`, value:tkSeqText(P.seq), go:() => { P.seq.forEach(x => tkTap(tkOpSel('rb', P.id, x))); tkTap(`[data-rbchk="${tkQa(P.id)}"]`); } };
      return { at:`[data-rbdiv="${tkQa(P.id)}"]`, value:'÷ ' + P.div, go:() => { tkTap(`[data-rbop="${tkQa(P.id)}|${P.op}"]`); tkFill(`[data-rbdiv="${tkQa(P.id)}"]`, P.div); tkTap(`[data-rbchk="${tkQa(P.id)}"]`); } }; } },
  { what:'a sign-off', test:() => typeof soPlan === 'function' && tkQ('[data-sochk], [data-soprechk], [data-rbchk]'), plan:() => { const P = soPlan(); if(!P) return null;
      if(P.rb) return { at:`[data-rbdiv="${tkQa(P.rb.id)}"]`, value:'÷ ' + P.rb.div, go:() => { tkTap(`[data-rbop="${tkQa(P.rb.id)}|${P.rb.op}"]`); tkFill(`[data-rbdiv="${tkQa(P.rb.id)}"]`, P.rb.div); tkTap(`[data-rbchk="${tkQa(P.rb.id)}"]`); } };
      const k = tkQa(P.key);
      if(P.pre && tkQ(`[data-sopre="${k}"]`)) return { at:`[data-sopre="${k}"]`, value:P.pre, go:() => { tkFill(`[data-sopre="${k}"]`, P.pre); tkTap(`[data-soprechk="${k}"]`); } };
      if(P.level === 'build') return { at:`[data-sochk="${k}"]`, value:tkSeqText(P.seq), go:() => { P.seq.forEach(x => tkTap(['+', '−', '×', '÷'].includes(x) ? `[data-soop="${k}|${x}"]` : `[data-sofig="${k}|${tkQa(x)}"]`)); tkTap(`[data-sochk="${k}"]`); } };
      return { at:`[data-soin="${k}"]`, value:P.answer, go:() => { tkFill(`[data-soin="${k}"]`, P.answer); tkTap(`[data-sochk="${k}"]`); } }; } },
  { what:'a Build', test:() => tkQ('#pbChk') && typeof paperPlan === 'function', plan:() => { const P = paperPlan(); if(!P) return null;
      return { at:'#pbChk', value:tkSeqText(P.seq), go:() => { P.seq.forEach(x => tkTap(['+', '−', '×', '÷'].includes(x) ? `[data-pbop="${x}"]` : `[data-pbfig="${tkQa(x)}"]`)); tkTap('#pbChk'); } }; } },
  { what:'the sum', test:() => tkQ('#cellAns'), plan:() => { const t = currentTable(), c = t && t.active && t.cols.find(x => x.id === t.active.col); if(!c) return null; const v = c.values[t.active.row];
      return { at:'#cellAns', value:v, go:() => { tkFill('#cellAns', v); if(!tkTap('#cellCheck')) tkQ('#cellAns').dispatchEvent(new KeyboardEvent('keydown', { key:'Enter', bubbles:true })); } }; } },
  { what:'the service card', test:() => tkQ('.sc-p1.sign #scCheck') && typeof scAnswers === 'function', plan:() => { const A = scAnswers(); if(!A) return null;
      return { at:'[data-sc="tot"]', value:A.tot, go:() => { Object.entries(A).forEach(([k, v]) => tkFill(`[data-sc="${k}"]`, v)); tkTap('#scCheck'); } }; } },
  { what:'a practice question', test:() => tkQ('#pqIn'), plan:() => { const a = window.__sim.practiceAnswer(); if(!a) return null; return { at:'#pqIn', value:a.text, wait:1100, go:() => { tkFill('#pqIn', a.text); tkTap('#pqCheck'); } }; } },
  { what:'time to afford', test:() => tkQ('#ta1Chk, #ta2Chk, #taBuildChk') && UI.taF, plan:() => { const F = UI.taF;
      if(tkQ('#ta1Chk') && tkQ('[data-pad="ta1"]')) return { at:'[data-pad="ta1"]', value:F.still, go:() => { tkFill('[data-pad="ta1"]', F.still); tkTap('#ta1Chk'); } };
      if(tkQ('#ta2Chk') && tkQ('[data-pad="ta2"]')){ const v = F.unit === 'week' ? F.weeks : F.days; return { at:'[data-pad="ta2"]', value:v, go:() => { tkFill('[data-pad="ta2"]', v); tkTap('#ta2Chk'); } }; }
      if(tkQ('#taBuildChk')) return { at:'#taBuildChk', value:'still to save ÷ profit', go:() => { ['[data-taclr]', '[data-tafig="still"]', '[data-taop="÷"]', '[data-tafig="rate"]'].forEach(tkTap); tkTap('#taBuildChk'); } };
      return null; } },
  { what:'rent or buy', test:() => tkQ('#rbIn'), plan:() => { const C = (typeof PAPER_CHK !== 'undefined' ? PAPER_CHK : []).find(c => c.sel === '#rbChk'), ch = S.rnd && S.rnd.acChoice, o = ch && typeof acOffer === 'function' ? acOffer(ch.pid) : null, f = !o && typeof FINANCE !== 'undefined' ? FINANCE[S.rnd.shopPick] : null;
      const v = o && o.lease ? Math.round(o.price / o.lease * 10) / 10 : f ? Math.round((f.cashPrice || 0) / (f.leaseDaily || 1)) : null; if(v === null) return null;
      return { at:'#rbIn', value:v, go:() => { if(C) C.fill(); else tkFill('#rbIn', v); tkTap('#rbChk'); } }; } },
  { what:'cash after buying', test:() => tkQ('#negChk'), plan:() => { const C = (typeof PAPER_CHK !== 'undefined' ? PAPER_CHK : []).find(c => c.sel === '#negChk'); if(!C) return null;
      return { at:'[data-pad="negcash"]', value:'cash − price', go:() => { C.fill(); tkTap('#negChk'); } }; } },
  { what:'the finance sum', test:() => tkQ('#fin1Chk, #fin2Chk, #finBuildChk'), plan:() => { const F = tkFinFigures(); if(!F) return null;
      if(tkQ('#fin1Chk')) return { at:'[data-pad="fin1"]', value:F.still, go:() => { tkFill('[data-pad="fin1"]', F.still); tkTap('#fin1Chk'); } };
      if(tkQ('#fin2Chk')) return { at:'[data-pad="fin2"]', value:F.pay, go:() => { tkFill('[data-pad="fin2"]', F.pay); tkTap('#fin2Chk'); } };
      return null; } },
  { what:'a full flight', test:() => tkQ('[data-wcchk]') && window.__wc, plan:() => { const b = tkQ('[data-wcchk]'), pid = b.getAttribute('data-wcchk'), v = window.__wc.answer(pid);
      return { at:`[data-wcin="${tkQa(pid)}"]`, value:v, go:() => { tkFill(`[data-wcin="${tkQa(pid)}"]`, v); tkTap(`[data-wcchk="${tkQa(pid)}"]`); } }; } },
  { what:'a sum the teacher can release', test:() => step().t === 'challengeCalc', plan:() => ({ at:null, value:'released', go:() => releaseGate(true) }) }
];
/* the finance card's two figures, read off the card itself (price − deposit, then ÷ the payments) */
function tkFinFigures(){
  const t = (tkQ('.fin-card') || {}).textContent || '', m = t.replace(/,/g, '').match(/Still to pay: £(\d+(?:\.\d+)?) − £(\d+(?:\.\d+)?)/), n = t.replace(/,/g, '').match(/A month: £(\d+(?:\.\d+)?) ÷ (\d+)/);
  const still = m ? Math.round((+m[1] - +m[2]) * 100) / 100 : null; return { still, pay:n ? Math.round(+n[1] / +n[2] * 100) / 100 : null };
}
function tkFind(){ for(const R of TK_SUMS){ try{ if(!R.test()) continue; const P = R.plan(); if(P) return Object.assign({ what:R.what }, P); }catch(e){} } return null; }
async function tkAnswer(quiet){ const a = tkFind(); if(!a){ if(!quiet) toast('No sum to answer on this screen'); return null; } a.go(); await tkWait(a.wait || 90); if(!quiet) toast(`Answered ${a.what}: ${typeof a.value === 'number' ? a.value.toLocaleString('en-GB') : a.value}`); tkShowTag(); return a; }
async function tkAnswerAll(quiet){ let n = 0, last = ''; for(let g = 0; g < 40; g++){ const a = tkFind(); if(!a) break; const sig = a.what + '|' + a.at + '|' + S.si + '|' + S.day; if(sig === last && g > 1){ break; } last = sig; a.go(); n++; await tkWait(a.wait || 110); } if(!quiet) toast(n ? `Answered ${n} sum${n === 1 ? '' : 's'} on this screen` : 'No sum to answer on this screen'); return n; }
/* Show the answers: a small amber tag beside the field, redrawn with the screen; nothing is checked */
function tkShowTag(){
  document.querySelectorAll('.tk-ans').forEach(x => x.remove()); if(!tkOn() || !settings.tkShow) return;
  const a = tkFind(); if(!a) return; const el = a.at && tkQ(a.at); const txt = typeof a.value === 'number' ? a.value.toLocaleString('en-GB', { maximumFractionDigits:2 }) : String(a.value);
  const tag = document.createElement('span'); tag.className = 'tk-ans'; tag.textContent = '= ' + txt; tag.title = 'Test mode: the answer (not checked)';
  if(el && el.parentNode) el.insertAdjacentElement('afterend', tag); else { tag.classList.add('float'); document.body.appendChild(tag); }
}

/* ---------- 3. Auto-plan: the engine's best standing plan for the week, with the planes owned ---------- */
function tkAutoPlan(quiet){
  if(!S.fleet || !S.fleet.length){ if(!quiet) toast('No planes to plan yet'); return null; }
  let B = null; try{ B = bestPlanSweep(S.day || 1); }catch(e){ if(!quiet) toast('Auto-plan did not work here: ' + e.message); return null; }
  if(!B || !B.plan){ if(!quiet) toast('Auto-plan found no plan'); return null; }
  applyPlan(B.plan); UI.tkPlanned = S.day; save(); render();
  if(!quiet) toast(`Auto-plan: ${B.label} · about ${money(B.profit)} a day`); return B;
}

/* ---------- 4. Run: answer, plan and move on until the screen asked for ---------- */
const TK_REVIEWS = ['weekReview', 'review', 'results', 'chapterReview', 'audit'], TK_DECIDE = ['event', 'shop2', 'acquire', 'atype', 'capChallenge', 'hunt', 'brief', 'upgprop'];
const TK_STOPS = { plan:'the next plan', review:'the next review', decision:'the next decision', fuel:'the Fuel desk', month:'next month' };
let tkRunning = null;
function tkStop(){ if(tkRunning){ tkRunning.stop = true; } }
function tkMonthStart(d){ const c = calDate(d), n = Date.UTC(c.getUTCFullYear(), c.getUTCMonth() + 1, 1); return d + Math.round((n - c.getTime()) / 86400000); }
function tkAtStop(stop, R){
  const st = step(), t = st && st.t, moved = S.day !== R.day || S.si !== R.si || t !== R.t;
  if(!moved) return false;
  if(stop === 'plan') return t === 'plan' && (S.day > R.day || R.t !== 'plan');
  if(stop === 'review') return TK_REVIEWS.includes(t);
  if(stop === 'decision') return TK_DECIDE.includes(t) || !!document.getElementById('bfLayer');
  if(stop === 'fuel') return t === 'fuelDesk';
  if(stop === 'month') return (t === 'plan' || t === 'hq') && S.day >= R.month;
  return false;
}
const tkNx = () => { const b = tkQ('#nx'); return b && !b.disabled && !b.hidden && tkSeen(b) ? b : null; };
async function tkWaitFor(cond, ms){ const t0 = Date.now(); while(Date.now() - t0 < ms){ if(cond()) return true; await tkWait(120); } return false; }
/* one move on the current screen; returns what it did, or null when the screen needs a person */
async function tkMove(R){
  const st = step(), t = st && st.t;
  if(window.__bf && window.__bf.open()){ window.__bf.skip(); return 'skipped a briefing'; }
  if(S.overlay){ const ty = S.overlay.type; if(['menu', 'shop', 'fleet', 'alerts', 'planeTable', 'newPlane'].includes(ty)){ closeOverlay(); return 'closed ' + ty; } }
  if(wallView){ setWallView(false); return 'left the wall'; }
  if(tkFind()){ const n = await tkAnswerAll(true); if(n) return `answered ${n}`; }
  const W = (fn, ms) => tkWaitFor(fn, ms || 60000);
  switch(t){
    case 'hq': if(tkTap('#startDay')) return 'started the period'; break;
    case 'intro': if(tkTap('#niNext')) return 'read on'; { const ni = [...document.querySelectorAll('[data-ni]')]; if(ni.length && tkQ('#nx') && tkQ('#nx').disabled){ for(const b of ni){ b.click(); await tkWait(40); if(!tkQ('#nx').disabled) break; } } } break;
    case 'plan':
      if(tkQ('.ftp-page')){ if(tkTap('#ftpGo')) return 'on to the timetable'; break; }
      if(tkSeen(tkQ('#s2Back')) && tkTap('#s2Back')) return 'to the timetable';
      if(R.autoPlan && UI.tkPlanned !== S.day && S.phase !== 'setup'){ tkAutoPlan(true); return 'auto-planned'; }
      if(!tkNx() && UI.tkPlanned !== S.day){ tkAutoPlan(true); return 'auto-planned (the plan had to change)'; }
      break;
    case 'workings': if(tkTap('#wkTutNext') || tkTap('#wkTutGo')) return 'past the tutorial'; if(tkTap('#scNext:not([disabled])') || tkTap('#wkNext')) return 'next sum'; { const w = document.querySelectorAll('[data-wpick]'); if(w.length){ (w[1] || w[0]).click(); return 'picked a method'; } } break;
    case 'ready': if(tkTap('#startOps')) return 'cleared for take-off'; break;
    case 'takeoff': tkTap('#toGo'); await W(() => tkNx(), 20000); break;
    case 'fly': case 'sim': case 'weekRun': case 'month': { const d0 = S.day, s0 = S.si; await W(() => step().t !== t || S.day !== d0 || S.si !== s0); return 'flew'; }
    case 'fuelDesk': if(!UI.tkFuelled || UI.tkFuelled !== S.day){ const b = [...document.querySelectorAll('[data-fdb]:not([disabled])')]; if(b.length){ b[Math.min(1, b.length - 1)].click(); UI.tkFuelled = S.day; return 'chose fuel blocks'; } }
      if(tkTap('#fdBuy:not([disabled])')) return 'bought fuel'; break;
    case 'event': { const k = S.day + '|' + S.si + '|' + ((S.rnd && S.rnd.event && S.rnd.event.id) || ''), o = tkQ('[data-o="1"]') || tkQ('[data-o="0"]'); if(o && UI.tkEv !== k){ UI.tkEv = k; o.click(); return 'chose an option'; } } break;
    case 'shop2': if(tkTap('#skipShop')) return 'left the shop'; break;
    case 'acquire': { const w = tkQ('[data-bw$="|wait"]'); if(w && !tkQ('#nx:not([disabled])')){ w.click(); return 'chose to wait'; } if(tkTap('#noBuy')) return 'not buying'; const l = tkQ('[data-terms="lease"]:not([disabled])'); if(l && !l.classList.contains('on')){ l.click(); return 'chose to rent'; } } break;
    case 'paint': if(tkTap('#roll')) return 'rolled out'; break;
    case 'reveal': tkTap('#skipReveal'); await W(() => tkNx(), 8000); break;
    case 'atype': if(!tkNx()){ tkTap('[data-atype="full"]'); return 'chose Full Service'; } break;
    case 'capChallenge': if(tkTap('#capDone')) return 'challenge done'; break;
    case 'hunt': if(tkTap('#huntDone') || tkTap('#huntNext')) return 'hunt done'; break;
    case 'protoEnd': if(tkTap('#peNext')) return 'on to the next chapter'; break;
    case 'rop': if(tkTap('#ropGo')) return 'regular plan'; break;
    case 'milestone': if(tkTap('#msGo')) return 'milestone'; break;
    case 'upgprop': if(tkTap('#upgYes')) return 'built the upgrade'; break;
  }
  if(t === 'chapterReview' && !tkNx()){ /* the chapter accounts: the cells answered above; anything else waits */ }
  const nx = tkNx(); if(nx){ nx.click(); return 'next'; }
  if(tkTap('#peNext') || tkTap('#startDay')) return 'next';
  return null;
}
async function tkRun(stop){
  if(tkRunning){ tkStop(); return; }
  stop = stop || settings.tkStop || 'plan';
  const R = tkRunning = { stop:false, day:S.day, si:S.si, t:step().t, month:tkMonthStart(S.day || 1), autoPlan:settings.tkAutoPlan !== false };
  const pace = settings.flightSecs, aw = settings.autoWall; settings.flightSecs = 0.25; settings.autoWall = false; tkSync();
  let msg = '', stuck = 0, lastSig = ''; const log = window.__tkLog = [];   // what Run did, move by move (for the tests)
  try{
    for(let g = 0; g < 4000; g++){
      if(R.stop){ msg = 'Stopped.'; break; }
      if(g && tkAtStop(stop, R)){ msg = `Stopped at ${TK_STOPS[stop]}: ${dateLong(S.day || 1)}.`; break; }
      const t0 = step().t, did = await tkMove(R); await tkWait(70); log.push(`${S.day} ${t0}: ${did || '—'}`); if(log.length > 400) log.shift();
      const sig = S.day + '|' + S.si + '|' + step().t + '|' + (screen().innerHTML.length);
      if(!did && sig === lastSig){ if(++stuck > 3){ msg = `Stopped: this screen needs you (${step().t}, ${dateLong(S.day || 1)}).`; break; } await tkWait(250); }
      else stuck = 0;
      lastSig = sig;
    }
  } catch(e){ msg = 'Run stopped: ' + e.message; }
  finally { settings.flightSecs = pace; settings.autoWall = aw; tkRunning = null; save(); tkSync(); render(); }
  if(msg) toast(msg); return msg;
}

/* ---------- 5. Event now: any event from the calendar, or any built briefing, on today ---------- */
function tkEventList(){
  const seen = new Set(), out = [];
  (WORLD.rounds || []).forEach((r, i) => { [r.event].concat(r.events || []).forEach(e => { if(!e || !e.id || seen.has(e.id)) return; seen.add(e.id); out.push({ key:'ev:' + e.id, label:(e.title || e.id) + ' (event)', ev:e }); }); });
  ((window.__bf && window.__bf.list()) || []).forEach(b => out.push({ key:'bf:' + b.id, label:b.title + ' (briefing)' }));
  return out;
}
function tkEventNow(key){
  if(!key) return; const it = tkEventList().find(x => x.key === key); if(!it){ toast('Not found'); return; }
  if(key.startsWith('bf:')){ window.__bf.play(key.slice(3)); return; }
  const ev = JSON.parse(JSON.stringify(it.ev)); ev.day = S.day; delete ev.window;
  S.rnd = S.rnd || {}; S.rnd.event = ev; delete S.rnd.eventChoice; S.overlay = null;
  S.steps.splice(S.si, 0, { t:'event' }); save(); render(); toast(`Event now: ${ev.title || ev.id}`);
}

/* ---------- 6. the bar ---------- */
function tkBarHtml(){
  const J = Object.entries(TK_JUMPS).sort((a, b) => a[1].day - b[1].day), E = tkEventList(), o = tkIndex();
  const lab = S && S.test ? S.test.label : 'TEST';
  return `<div class="tk-row"><b class="tk-flag">TEST MODE — nothing here counts</b><span class="tk-who">${esc(lab)} · ${S && S.day ? esc(dateShort(S.day)) : ''}</span>
      <button class="tk-b" id="tkAnswer" title="Ctrl+Shift+A">Answer</button><button class="tk-b" id="tkAll">Answer all</button>
      <button class="tk-b" id="tkRun" title="Ctrl+Shift+R">${tkRunning ? 'Stop ■' : 'Run ▶'}</button>
      <span class="grow"></span><button class="tk-b" id="tkTools" aria-expanded="${!!settings.tkTools}" title="Ctrl+Shift+T">Tools ${settings.tkTools ? '▴' : '▾'}</button></div>
    ${settings.tkTools ? `<div class="tk-drop">
      <div class="tk-g"><span class="tk-k">This screen</span><button class="tk-b" id="tkShow" aria-pressed="${!!settings.tkShow}">Show the answers: ${settings.tkShow ? 'on' : 'off'}</button><button class="tk-b" id="tkAuto" aria-pressed="${!!settings.autoAnswer}">Auto-answer: ${settings.autoAnswer ? 'on' : 'off'}</button><button class="tk-b" id="tkPlan">Auto-plan</button><button class="tk-b" id="tkSkip">Skip briefing</button><button class="tk-b" id="tkScreen">Skip screen</button></div>
      <div class="tk-g"><span class="tk-k">Run to</span><select id="tkStop">${Object.entries(TK_STOPS).map(([k, l]) => `<option value="${k}" ${(settings.tkStop || 'plan') === k ? 'selected' : ''}>${l}</option>`).join('')}</select><label class="tk-c"><input type="checkbox" id="tkAP" ${settings.tkAutoPlan !== false ? 'checked' : ''}> Auto-plan each new week</label></div>
      <div class="tk-g"><span class="tk-k">Jump to</span><select id="tkJump"><option value="">Choose a point…</option>${J.map(([k, j]) => `<option value="${k}">${esc(j.label)}</option>`).join('')}</select>${J.length ? '' : '<span class="tk-n">no test airlines built yet (tools/make_jumps.sh)</span>'}</div>
      <div class="tk-g"><span class="tk-k">Event now</span><select id="tkEv"><option value="">Choose…</option>${E.map(x => `<option value="${esc(x.key)}">${esc(x.label)}</option>`).join('')}</select></div>
      <div class="tk-g"><span class="tk-k">Test airlines</span><span class="tk-n">${o.list.length} saved apart, labelled TEST</span><button class="tk-b" id="tkDel">Delete all test airlines</button><button class="tk-b" id="tkPanel">Teacher panel</button><button class="tk-b" id="tkOff">Leave test mode</button></div>
    </div>` : ''}`;
}
/* the desk is scaled to the height under the bar */
function tkFit(){ if(!document.documentElement.classList.contains('tk') || typeof DESK_W === 'undefined') return; const s = Math.min(innerWidth / DESK_W, (innerHeight - 24) / DESK_H); document.documentElement.style.setProperty('--ds', String(Math.round(s * 10000) / 10000)); }
addEventListener('resize', tkFit);
function tkSync(){
  const on = tkOn() || TEST_URL, was = document.documentElement.classList.contains('tk'); document.documentElement.classList.toggle('tk', !!on);
  if(was !== !!on){ if(on) tkFit(); else deskScale(); }
  const bar = document.getElementById('testBar'); if(!bar) return; bar.hidden = !on; if(!on) return;
  bar.className = 'testbar tk-bar'; bar.innerHTML = tkBarHtml();
  const on_ = (id, fn) => { const e = document.getElementById(id); if(e) e.onclick = fn; };
  on_('tkAnswer', () => tkAnswer()); on_('tkAll', () => tkAnswerAll()); on_('tkRun', () => tkRun());
  on_('tkTools', () => { settings.tkTools = !settings.tkTools; saveSettings(); tkSync(); });
  on_('tkShow', () => { settings.tkShow = !settings.tkShow; saveSettings(); tkSync(); tkShowTag(); });
  on_('tkAuto', () => { settings.autoAnswer = !settings.autoAnswer; saveSettings(); testTick(); tkSync(); });
  on_('tkPlan', () => tkAutoPlan()); on_('tkSkip', () => { if(!(window.__bf && window.__bf.skip())){ if(!tkSkipTutorial()) toast('No briefing or tutorial open'); } });
  on_('tkScreen', () => skipScreen()); on_('tkPanel', () => teacherOpen()); on_('tkOff', () => tkLeave());
  on_('tkDel', () => { if(!confirm('Delete every test airline? The pupil\'s game is not touched.')) return; const keep = S && S.test; tkDeleteAll(); if(keep){ save(); } tkSync(); toast('Test airlines deleted'); });
  const sel = (id, fn) => { const e = document.getElementById(id); if(e) e.onchange = () => fn(e.value); };
  sel('tkStop', v => { settings.tkStop = v; saveSettings(); }); sel('tkJump', v => { if(v) tkJump(v); }); sel('tkEv', v => { if(v) tkEventNow(v); });
  const ap = document.getElementById('tkAP'); if(ap) ap.onchange = () => { settings.tkAutoPlan = ap.checked; saveSettings(); };
}
/* a tutorial (the workings page's walk-through) to its end */
function tkSkipTutorial(){ let n = 0; for(let g = 0; g < 12; g++){ if(tkTap('#wkTutNext') || tkTap('#wkTutGo') || tkTap('#niNext')) n++; else break; } return n > 0; }
const tkTick0 = testTick;
testTick = function(){ const r = tkTick0.apply(this, arguments); tkSync(); return r; };
const tkRender0 = render;
render = function(){ const r = tkRender0.apply(this, arguments); try{ if(tkOn()){ const w = document.querySelector('.tk-who'); if(w && S) w.textContent = `${S.test ? S.test.label : 'TEST'} · ${S.day ? dateShort(S.day) : ''}`; tkShowTag(); } }catch(e){} return r; };
document.addEventListener('keydown', e => {
  if(!(e.ctrlKey || e.metaKey) || !e.shiftKey) return; const k = (e.key || '').toLowerCase();
  if(k === 't' && tkOn()){ e.preventDefault(); e.stopImmediatePropagation(); settings.tkTools = !settings.tkTools; saveSettings(); tkSync(); }
  else if(k === 'a' && tkOn()){ e.preventDefault(); e.stopImmediatePropagation(); tkAnswer(); }
  else if(k === 'r' && tkOn()){ e.preventDefault(); e.stopImmediatePropagation(); tkRun(); }
}, true);

/* ---------- 7. the teacher panel: Test mode switches the airline to a TEST copy ---------- */
/* after boot (the panel's own handlers are bound there), so these win */
document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
  try{ const box = document.getElementById('tTest'), sec = box && box.closest('.tsec'); if(!sec) return;
    sec.innerHTML = `<h3>Testing (D102)</h3>
      <div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="tTest" style="width:24px;height:24px"> Test mode: an amber TEST MODE bar with Answer, Run, Auto-plan, Jump to… and Event now</label></div>
      <p class="small muted">Switching it on makes a TEST copy of this airline, saved apart. The pupil's game, record, milestones and sum numbers are not touched, and come back when test mode goes off.</p>
      <div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="tAutoAns" style="width:24px;height:24px"> Auto-answer sums (decisions stay yours)</label></div>
      <div class="row"><span>Jump to</span><select id="tJump"><option value="">A test airline at…</option>${Object.entries(TK_JUMPS).sort((a, b) => a[1].day - b[1].day).map(([k, j]) => `<option value="${k}">${esc(j.label)}</option>`).join('')}</select><button class="btn small" id="tTkDel">Delete all test airlines</button></div>
      <p class="small muted">In test mode: Ctrl+Shift+T shows the bar's tools, Ctrl+Shift+A answers the sum on screen, Ctrl+Shift+R runs to the point chosen on the bar. Press W (or the Operations Wall button) to see the wall on this screen.</p>`;
    const tb = document.getElementById('tTest'); tb.onchange = () => { teacherClose(); if(tb.checked) tkEnter(); else tkLeave(); };
    document.getElementById('tAutoAns').onchange = e => { settings.autoAnswer = e.target.checked; saveSettings(); testTick(); };
    document.getElementById('tJump').onchange = e => { const v = e.target.value; if(v){ teacherClose(); tkJump(v); } };
    document.getElementById('tTkDel').onclick = () => { if(confirm('Delete every test airline? The pupil\'s game is not touched.')){ tkDeleteAll(); if(S && S.test) save(); toast('Test airlines deleted'); } };
  }catch(e){}
  tkSync();
}, 0));
window.__tk = { answer:tkAnswer, answerAll:tkAnswerAll, find:() => { const a = tkFind(); return a ? { what:a.what, value:a.value, at:a.at } : null; }, autoPlan:tkAutoPlan, run:tkRun, stop:tkStop, jump:tkJump, jumps:() => Object.keys(TK_JUMPS), enter:tkEnter, leave:tkLeave, eventNow:tkEventNow, events:tkEventList, index:tkIndex, deleteAll:tkDeleteAll };
}
