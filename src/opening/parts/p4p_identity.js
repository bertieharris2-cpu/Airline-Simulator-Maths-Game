
/* ==================================================================
   AIRLINE IDENTITY (Change Request 5): the launch-day steps that make the airline his own.
   name → flight code → logo → paint (p4q_paint.js) → reveal → certificate, then the HQ boots. Each is one screen, one decision,
   with the question as its heading and the step dots in the card header. Wrong entries use the calm retry style, never red.
   Everything chosen lives in the save state: S.airline {name, flightCode, logo{shape, symbol, c1, c2}}, and on each fleet
   entry {registration, name, livery}. Fixed choices (palette, shapes, blocked codes) come from the workbook.
   ================================================================== */
const ID_STEPS = ['name', 'code', 'logo', 'paint', 'reveal', 'cert'];
function idHeader(title, say){
  const i = Math.max(0, ID_STEPS.indexOf(step().t === 'fin' ? 'paint' : step().t));
  return `<div class="screen-title id-title" data-status="Launch day · Step ${i + 1} of ${ID_STEPS.length}"><h2>${title}</h2>${say ? sayBtn(say) : ''}<span class="id-steps" aria-hidden="true">${ID_STEPS.map((t, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`).join('')}</span></div>`;
}
/* the flight code: two capital letters, suggested from the name; a short list of real codes is refused calmly */
function blockedCodes(){ const b = SET.blockedFlightCodes; return Array.isArray(b) ? b : (b ? String(b).split(/[,\s]+/) : []).map(x => x.toUpperCase()).filter(Boolean); }
function codeCheck(v){ v = String(v || '').toUpperCase(); if(!/^[A-Z]{2}$/.test(v)) return { ok:false, msg:'Two letters, like BE.' }; if(blockedCodes().includes(v)) return { ok:false, msg:'That code belongs to a real airline, try another.' }; return { ok:true, msg:'' }; }
function airlineCodeNow(){ return S.airline.flightCode || suggestCode(S.airline.name); }
/* the suggestion: the initials, else the first two letters, else the first and a later letter, never a blocked code */
function suggestCode(name){ const w = String(name || '').replace(/[^A-Za-z ]/g, '').trim().split(/\s+/).filter(Boolean), L = w.join(''), tries = [];
  if(w.length >= 2) tries.push(w[0][0] + w[1][0]); if(L.length >= 2) tries.push(L.slice(0, 2)); for(let i = 2; i < L.length; i++) tries.push(L[0] + L[i]); for(let i = 1; i < L.length; i++) for(let j = i + 1; j < L.length; j++) tries.push(L[i] + L[j]); tries.push('AS', 'AX', 'ZZ');
  return tries.map(x => x.toUpperCase()).find(x => codeCheck(x).ok) || 'AS'; }
/* the name: typing shows on the whiteboard's departure board as he goes */
R.name = () => {
  screen().innerHTML = `<div class="card stack id-card">${idHeader('Name your airline', 'Name your airline.')}
    <input class="name-input" id="nm" maxlength="20" placeholder="e.g. Dragon Air" value="${esc(S.airline.name)}" autocomplete="off" aria-label="Airline name">
    <p class="muted">The name goes on every plane, ticket and departure board. Up to 20 letters.</p><p class="hint calm" id="nmMsg"></p>
    <div class="actions"><button class="btn primary big" id="nx" ${nameOk(S.airline.name) ? '' : 'disabled'}>Next &#9654;</button></div></div>`;
  const nm = $('nm');
  nm.oninput = () => { const v = nm.value.replace(/[^A-Za-z0-9 '\-]/g, ''); if(v !== nm.value) nm.value = v; S.airline.name = v; if(!S.airline.flightCode) S.airline.code = suggestCode(v);
    $('nx').disabled = !nameOk(v); $('nmMsg').textContent = v.trim() && !nameOk(v) ? 'Letters, numbers, spaces, an apostrophe or a hyphen: up to 20.' : ''; $('cName').textContent = v.toUpperCase() || 'AIRLINE SIMULATOR'; publishSoon(); };
  nm.onkeydown = e => { if(e.key === 'Enter' && nameOk(nm.value)) $('nx').click(); };
  on('nx', () => { S.airline.name = S.airline.name.trim(); if(!S.airline.flightCode) S.airline.code = suggestCode(S.airline.name); next(); });
  setTimeout(() => nm.focus(), 30);
};
function nameOk(v){ v = String(v || '').trim(); return v.length >= 1 && v.length <= 20 && /^[A-Za-z0-9 '\-]+$/.test(v); }
R.code = () => {
  const sug = suggestCode(S.airline.name), cur = S.airline.flightCode || sug, r0 = routeById((WORLD.setupRoutes || [])[0]) || { city:'Dublin' };
  const prev = v => `<b class="mono">${esc(v)}101</b> · ${esc(r0.city)} · <span class="mono">${fmtTime(firstDep())}</span>`;
  screen().innerHTML = `<div class="card stack id-card">${idHeader('Pick a flight code', 'Pick a flight code: two letters that go in front of every flight number.')}
    <p class="lede">Two letters go in front of every flight number. ${esc(S.airline.name)} → <b>${esc(sug)}</b>, or choose your own.</p>
    <div class="code-row"><input class="name-input code-input" id="fcode" maxlength="2" value="${esc(cur)}" autocomplete="off" spellcheck="false" aria-label="Flight code"><div class="code-prev"><small>Your first flight</small><span id="codePrev">${prev(cur)}</span></div></div>
    <p class="hint calm" id="codeMsg">${esc(codeCheck(cur).msg)}</p>
    <div class="actions">${backBtn()}<button class="btn primary big" id="nx" ${codeCheck(cur).ok ? '' : 'disabled'}>Next &#9654;</button></div></div>`;
  const inp = $('fcode');
  inp.oninput = () => { const v = inp.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2); if(inp.value !== v) inp.value = v; const c = codeCheck(v); $('codeMsg').textContent = c.msg; $('nx').disabled = !c.ok; $('codePrev').innerHTML = prev(v || '··'); if(c.ok){ S.airline.flightCode = v; S.airline.code = v; publishSoon(); } };
  inp.onkeydown = e => { if(e.key === 'Enter' && codeCheck(inp.value).ok) $('nx').click(); };
  on('nx', () => { const v = inp.value.toUpperCase(); if(!codeCheck(v).ok) return; S.airline.flightCode = v; S.airline.code = v; next(); });
  setTimeout(() => { inp.focus(); inp.select(); }, 30);
};
/* the logo: a shape, a symbol and two colours; it replaces the generic mark in the top bar and on the wall */
function syncLogoColours(){ const g = logoOf(); S.airline.c1 = hexOf(g.c1); S.airline.c2 = hexOf(g.c2); S.airline.fin = ['stripe', 'star', 'chevron', 'circle', 'wing', 'dragon'].includes(g.symbol) ? g.symbol : 'stripe'; }
R.logo = () => {
  const g = logoOf(), shapes = LIV.logoShapes.length ? LIV.logoShapes : [{ id:'shield', name:'Shield' }], syms = LIV.tails.filter(t => t.id !== 'logo');
  const sw = (k, cur) => `<div class="sw-row one" data-k="${k}">${PAL.map(c => `<button class="sw ${c.id === cur ? 'on' : ''}" style="background:${c.hex}" data-c="${c.id}" aria-label="${esc(c.name)}" aria-pressed="${c.id === cur}" title="${esc(c.name)}"></button>`).join('')}</div>`;
  screen().innerHTML = `<div class="card stack id-card">${idHeader('Make a logo', 'Make a logo: choose a shape, a symbol and two colours.')}
    <div class="logo-grid"><div class="logo-prev"><div class="lp-big" id="logoBig">${logoSvg(220, g)}</div><div class="lp-ctx"><span class="muted small">On the board and on every tail fin</span><div class="lp-row">${logoSvg(40, g)}<b>${esc(S.airline.name.toUpperCase())}</b><span class="mono muted">${esc(airlineCodeNow())}</span></div></div></div>
      <div class="logo-ctl"><div class="grp"><h3>Shape</h3><div class="pchoices" data-k="shape">${shapes.map(s => `<button class="chc ${g.shape === s.id ? 'on' : ''}" data-v="${s.id}" aria-pressed="${g.shape === s.id}"><svg viewBox="0 0 40 40" aria-hidden="true"><g fill="#E9EEF3">${SHAPE40[s.id] || SHAPE40.square}</g></svg><span>${esc(s.name)}</span></button>`).join('')}</div></div>
        <div class="grp"><h3>Symbol</h3><div class="pchoices" data-k="symbol">${syms.map(s => `<button class="chc ${g.symbol === s.id ? 'on' : ''}" data-v="${s.id}" aria-pressed="${g.symbol === s.id}"><svg viewBox="0 0 40 40" aria-hidden="true"><g fill="#D7263D">${SYM40[s.id] || ''}</g></svg><span>${esc(s.name)}</span></button>`).join('')}</div></div>
        <div class="grp"><h3>Background colour</h3>${sw('c1', g.c1)}</div><div class="grp"><h3>Symbol colour</h3>${sw('c2', g.c2)}</div></div></div>
    <div class="actions">${backBtn()}<button class="btn primary big" id="nx">Next &#9654;</button></div></div>`;
  const sync = () => { syncLogoColours(); setLivery(); $('logoBig').innerHTML = logoSvg(220, g); const row = screen().querySelector('.lp-row svg'); if(row) row.outerHTML = logoSvg(40, g); publishSoon(); };
  screen().querySelectorAll('.pchoices').forEach(ch => ch.querySelectorAll('.chc').forEach(b => b.onclick = () => { g[ch.getAttribute('data-k')] = b.getAttribute('data-v'); ch.querySelectorAll('.chc').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); sync(); }));
  screen().querySelectorAll('.sw-row').forEach(row => row.querySelectorAll('.sw').forEach(b => b.onclick = () => { g[row.getAttribute('data-k')] = b.getAttribute('data-c'); row.querySelectorAll('.sw').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); sync(); }));
  on('nx', () => { syncLogoColours(); next(); });
};
/* the logo is the airline's mark everywhere the fin symbol used to be */
function setLivery(){
  if(!S || !S.airline) return; if(S.airline.logo) syncLogoColours();
  document.documentElement.style.setProperty('--c1', S.airline.c1); document.documentElement.style.setProperty('--c2', S.airline.c2);
  const mark = logoMark(logoOf());
  ['cLogo', 'dLogo'].forEach(id => { const el = $(id); if(el && el._mark !== mark){ el._mark = mark; el.setAttribute('viewBox', '0 0 40 40'); el.innerHTML = mark; } });
  applyMotion();
}

/* ---------- the certificate: one A4 landscape page, on screen and printable ---------- */
function certHtml(o){
  o = o || {}; const f = S.fleet[0] ? ensureIdentity(S.fleet[0]) : null, p = f ? planeById(f.planeId) : null, h = homeData(), T = typeof terminalData === 'function' ? terminalData() : null;
  const real = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
  const row = (l, v) => `<div class="ct-row"><span>${l}</span><b>${v}</b></div>`;
  return `<div class="cert ${o.cls || ''}"><div class="ct-border"><div class="ct-head"><div class="ct-logo">${logoSvg(o.print ? 110 : 96)}</div><div><small>Civil Aviation Authority · Airline Simulator</small><h1>Air Operator Certificate</h1><p>This certifies that the airline named below is cleared to carry passengers.</p></div></div>
    <div class="ct-name">${esc(S.airline.name)}</div><div class="ct-code">Flight code <b>${esc(airlineCodeNow())}</b></div>
    <div class="ct-grid">${row('First aircraft', p ? `${esc(p.name)}` : '—')}${row('Registration', f ? `<span class="mono">${esc(f.registration)}</span>` : '—')}${row('Aircraft name', f && f.name ? esc(f.name) : '—')}${row('Home airport', `${esc(h.name || h.city)}${T && T.name ? ' · ' + esc(T.name) : ''}`)}${row('Date of issue', esc(dateLong(1)))}${row('Printed', esc(real))}</div>
    <div class="ct-foot"><div class="ct-sign"><span></span><small>Signed, the Chief Executive</small></div><div class="ct-stamp">${logoSvg(64)}<small>${esc(airlineCodeNow())} · ${esc(S.airline.name)}</small></div></div></div></div>`;
}
R.cert = () => {
  screen().innerHTML = `<div class="card stack id-card cert-card">${idHeader('Your certificate', 'Your Air Operator Certificate. Print it, then carry on to headquarters.')}
    <div class="cert-wrap">${certHtml()}</div>
    <div class="actions id-act">${backBtn()}<button class="btn big" id="printCert">&#128424; Print</button><button class="btn primary big" id="nx">Continue to HQ &#9654;</button></div></div>`;
  on('printCert', printCert);
  on('nx', next);
};
function printCert(){
  const css = document.getElementById('certCss') ? document.getElementById('certCss').textContent : '';
  const html = `<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"><title>${esc(S.airline.name)} — Air Operator Certificate</title><style>
    @page{size:A4 landscape;margin:12mm} html,body{margin:0;background:#fff;color:#111;font-family:"Segoe UI",system-ui,Arial,sans-serif} body{padding:10mm} .mono{font-variant-numeric:tabular-nums}
    .btn{font:inherit;padding:8px 16px;border:1px solid #111;background:#F3C754;cursor:pointer;margin-bottom:10px} @media print{.btn{display:none} body{padding:0}}
    ${css}</style></head><body><button class="btn" onclick="print()">Print</button>${certHtml({ print:true })}</body></html>`;
  const w = window.open('', '_blank'); if(!w){ toast('Pop-up blocked — allow pop-ups to print the certificate'); return; } w.document.open(); w.document.write(html); w.document.close();
}

/* ---------- registrations, flight numbers and the first plane carry the identity ---------- */
function regOf(uid){ const f = S.fleet.find(x => x.uid === uid); if(f && f.registration) return f.registration; const i = Math.max(0, S.fleet.findIndex(x => x.uid === uid)); return 'G-' + String(S.airline.code || 'DA').slice(0, 2).toUpperCase() + 'A' + String.fromCharCode(65 + i % 26); }
function buyPlane(plane){
  const uid = S.nextUid++; S.cash = r2(S.cash - plane.price); const f = { uid, planeId:plane.id, route:null, schedule:[], layout:'standard', grounded:false }; S.fleet.push(f); ensureIdentity(f);
  S.dec.planeBought = { round:S.round, day:S.day, planeId:plane.id };
  addNews([{ tag:'FLEET', text:`${S.airline.name} buys a ${plane.name}!`, cls:'good' }]);
  return uid;
}

/* ---------- sound: off until the teacher turns it on (workbook soundDefault); a mute control in the top bar; both windows follow ---------- */
function opsSoundOn(){ return settings.opsSound === undefined ? !!(SET.soundDefault === true || SET.soundDefault === 'TRUE') : !!settings.opsSound; }
function syncSoundBtn(){ const b = $('soundBtn'); if(!b) return; const on = opsSoundOn(); b.innerHTML = `<span aria-hidden="true">${on ? '🔊' : '🔇'}</span><span class="lbl"> Sound ${on ? 'on' : 'off'}</span>`; b.setAttribute('aria-pressed', on); b.title = on ? 'Sound is on (take-off, airport chimes, announcements). Click to mute.' : 'Sound is off. The teacher panel turns it on.'; }
function reloadSettings(){ try{ const s = JSON.parse(localStorage.getItem(SET_KEY) || 'null'); if(s) settings = Object.assign(defaultSettings(), s); }catch(e){} syncSoundBtn(); applyMotion(); }
window.addEventListener('storage', e => { if(e.key === SET_KEY) reloadSettings(); });
document.addEventListener('DOMContentLoaded', () => {
  const b = $('soundBtn'); if(b) b.onclick = () => { settings.opsSound = !opsSoundOn(); saveSettings(); syncSoundBtn(); if(opsSoundOn()){ liveAudioUnlock(); liveChime('ding'); } };
  syncSoundBtn(); applyMotion();
  const tm = $('tMotion'); if(tm) tm.onchange = e => { settings.reduceMotion = e.target.checked; saveSettings(); applyMotion(); };
});
