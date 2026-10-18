
/* ==================================================================
   PLAY NOTES (Bertie, 18 Oct 2026): "be able to do a voice recording nonstop as I play the game and make notes as I play
   it, rather than constantly taking screenshots". Teacher panel → Play notes:
   - Screen names: a small tag in the bottom-left corner names the screen in words that are easy to say ("Sunday review",
     "Studio", "Worth check"), with the week and date. Every screen has one, even where two screens share a heading.
   - Record: the microphone records while the game is played. The game logs the time each screen appears (and a save
     code whenever the day or the step changes, so the exact screen can be rebuilt), Mark drops a marker, and in Chrome a
     live transcript is kept beside it. Stop saves two files: the recording and the log (playnotes-….json, a plain file
     the Claude app takes as an attachment; each save code inside is gzipped, as "codez"). Save again, in the corner
     afterwards, downloads both once more in case one goes astray.
   - Log only: the same log with no microphone, its clock times matching a recording made on a phone.
   tools/playnotes.py reads the log; tools/playnotes_shots.js rebuilds and screenshots the screens it names.
   ================================================================== */
{
const PN_STEP = { brief1:'Launch Day intro', ready:'Ready to fly', takeoff:'Take-off', fly:'Flying', sim:'Flying', results:'Results',
  weekRun:'The board', event:'Event card', hq:'Home', fuelDesk:'Fuel desk', review:'Review', audit:'Month audit', intro:'New today',
  stars:'Star rating', atype:'Airline type', atypeOk:'Airline type check', capChallenge:"Captain's challenge", hunt:'Spot the mistake',
  afford3:'Time to afford', acquire:'Pay page', fleetSums:'Aircraft sums', paint:'Paint shop', reveal:'Hangar', chapterReview:'Chapter accounts',
  protoEnd:'Chapter end', brief:'Briefing', upgprop:'Systems request', welcome:'Welcome', name:'Name your airline', logo:'Logo', code:'Airline code',
  certificate:'Certificate', workout:'Sums', planner:'Planner', ftp:'Flight times' };
const PN_VIEW = { network:'Network desk', fleet:'Fleet desk', fuel:'Fuel desk', finance:'Finance desk', reputation:'Reputation desk', reports:'Reports desk',
  model:'Operations Model', overview:'Home', plan:'Studio' };
const pnQ = s => document.querySelector(s);
const pnWall = () => { try{ return !!wallView; }catch(e){ return false; } };
/* the screen's name: the step (or the desk opened over it), told apart by what is on the page where one step has several screens */
function pnName(){
  if(!S || !S.steps) return 'Start';
  const bf = pnQ('#bfLayer'); if(bf && !bf.hidden && bf.childElementCount) return 'Briefing';
  if(pnWall()) return 'Operations Wall';
  if(S.overlay && S.overlay.type === 'menu') return 'Menu';
  if(S.overlay && S.overlay.type) return 'Panel: ' + S.overlay.type;
  if(UI.view && PN_VIEW[UI.view] && UI.view !== 'plan') return PN_VIEW[UI.view];
  const st = step(), t = st ? st.t : '?';
  if(t === 'plan' || (UI.view === 'plan')){
    if(pnQ('.ftp-page')) return 'Flight times';
    const h = (pnQ('#screen h1') || {}).textContent || '';
    if(/Choose where to fly/.test(h)) return 'Choose where to fly';
    if(pnQ('#s2Edit')) return 'Plan opener';
    if(pnQ('.s2-ed')) return 'Studio: route editor';
    if(pnQ('#s2Pop.s3-insp .s3-ir1')) return 'Studio: flight selected';
    return 'Studio';
  }
  if(t === 'workings') return pnQ('.so-page') ? 'Sign-offs' : pnQ('#wkTutNext, #wkTutGo') ? 'Sums tutorial' : 'Sums';
  if(t === 'weekReview') return S.period && S.period.type === 'month' ? 'Month review' : 'Sunday review';
  if(t === 'shop2') return pnQ('.wc') ? 'Worth check' : pnQ('.acx') ? 'Compare aircraft' : 'Air show';
  return PN_STEP[t] || (t.charAt(0).toUpperCase() + t.slice(1));
}
function pnWhen(){ if(!S || !S.day) return S && S.phase === 'setup' ? 'Launch Day' : ''; return `Week ${weekNo(S.day)} · ${dateShort(S.day)}`; }

/* ---------- the recording and the log ---------- */
const PN = { on:false, audio:false, t0:0, wall0:null, rec:null, chunks:[], mime:'', log:[], last:'', lastCode:'', sr:null, srOn:false, timer:null, codes:0 };
const pnT = () => Math.round((performance.now() - PN.t0) / 100) / 10;
const pnClock = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function pnPush(o){ PN.log.push(Object.assign({ t:pnT(), at:new Date().toISOString() }, o)); }
function pnNote(){
  if(!PN.on) return; const name = pnName(), when = pnWhen(), key = name + '|' + when + '|' + (UI.view || '') + '|' + (S ? S.si : '');
  if(key === PN.last) return; PN.last = key;
  const st = S && step(), e = { kind:'screen', name, when, day:S ? S.day || 0 : 0, si:S ? S.si : 0, step:st ? st.t : '', view:UI.view || null, wall:pnWall() };
  const ck = (S ? S.day : '') + '|' + (S ? S.si : '');   // a save code each time the day or the step changes: enough to rebuild the screen
  if(ck !== PN.lastCode && S && S.steps){ PN.lastCode = ck; try{ e.code = saveCode(); PN.codes++; }catch(err){} }
  pnPush(e); pnTag();
}
function pnMime(){ for(const m of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']) if(window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) return m; return ''; }
async function pnStart(audio, words){
  if(PN.on) return; Object.assign(PN, { on:true, audio:false, t0:performance.now(), wall0:new Date().toISOString(), chunks:[], log:[], last:'', lastCode:'', codes:0 });
  pnPush({ kind:'start', game:document.title, words:!!words });
  if(audio){
    try{ const stream = await navigator.mediaDevices.getUserMedia({ audio:true }); PN.mime = pnMime();
      PN.rec = new MediaRecorder(stream, PN.mime ? { mimeType:PN.mime } : undefined); PN.rec.ondataavailable = e => { if(e.data && e.data.size) PN.chunks.push(e.data); };
      PN.rec.start(1000); PN.audio = true; }
    catch(err){ pnPush({ kind:'note', text:'Microphone not available: ' + (err && err.name || err) + '. Logging screens only.' }); toast('No microphone: logging the screens only (the times match a recording made on your phone).'); }
  }
  if(words) pnWords(); pnNote();
  PN.timer = setInterval(pnTag, 1000); pnTag(); toast(PN.audio ? 'Recording. Talk as you play; Stop saves the recording and the log.' : 'Logging the screens. Stop saves the log.');
}
/* the live transcript (Chrome's speech recognition): each finished phrase lands in the log at its time */
/* From a file (C:/…/airline-opening-prototype.html) Chrome does not keep the microphone permission for speech recognition, and
   the recogniser stops after every pause: each restart asked again and dropped the game out of full screen (Bertie, 18 Oct).
   So from a file there is no live transcript: the recording alone asks once. */
const pnFile = () => location.protocol === 'file:';
const pnWordsOn = () => !pnFile() && settings.pnWords !== false && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
function pnWords(){
  if(pnFile()){ pnPush({ kind:'note', text:'No live transcript when the game is opened from a file (Chrome would ask for the microphone at every pause).' }); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if(!SR){ pnPush({ kind:'note', text:'No live transcript in this browser.' }); return; }
  const r = PN.sr = new SR(); r.continuous = true; r.interimResults = false; r.lang = 'en-GB'; PN.srOn = true;
  r.onresult = e => { for(let i = e.resultIndex; i < e.results.length; i++) if(e.results[i].isFinal){ const text = e.results[i][0].transcript.trim(); if(text) pnPush({ kind:'say', text, screen:pnName() }); } };
  r.onerror = e => { if(['not-allowed', 'service-not-allowed', 'network'].includes(e.error)){ PN.srOn = false; pnPush({ kind:'note', text:'Live transcript stopped: ' + e.error + ' (the recording carries on).' }); } };
  r.onend = () => { if(PN.on && PN.srOn){ try{ r.start(); }catch(err){} } };
  try{ r.start(); }catch(err){ PN.srOn = false; }
}
function pnMark(){ if(!PN.on) return; pnPush({ kind:'mark', screen:pnName(), when:pnWhen() }); toast('Marked at ' + pnClock(pnT())); pnTag(); }
async function pnGz(text){ if(typeof CompressionStream === 'undefined') return null; return await new Response(new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))).blob(); }
/* a save code, gzipped and in base64, so a long session's log stays a few MB as plain .json */
async function pnZ(code){ const b = await pnGz(code); if(!b) return null; const u = new Uint8Array(await b.arrayBuffer()); let s = ''; for(let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }
function pnDownload(blob, name){ const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); }
async function pnStop(){
  if(!PN.on) return; pnPush({ kind:'stop' }); PN.on = false; PN.srOn = false; clearInterval(PN.timer);
  try{ if(PN.sr) PN.sr.stop(); }catch(e){}
  const stamp = PN.wall0.slice(0, 16).replace('T', '-').replace(':', ''), base = 'playnotes-' + stamp;
  if(PN.rec){ await new Promise(res => { PN.rec.onstop = res; try{ PN.rec.stop(); }catch(e){ res(); } }); try{ PN.rec.stream.getTracks().forEach(t => t.stop()); }catch(e){} }
  const lines = PN.log.map(e => `${pnClock(e.t)}  ${e.kind === 'screen' ? `${e.name}${e.when ? ' · ' + e.when : ''}` : e.kind === 'say' ? `“${e.text}”` : e.kind === 'mark' ? `★ MARK (${e.screen})` : e.kind === 'note' ? `(${e.text})` : e.kind.toUpperCase()}`);
  const ext = /mp4/.test(PN.mime) ? 'm4a' : /ogg/.test(PN.mime) ? 'ogg' : 'webm';
  const log = []; for(const e of PN.log){ if(e.code){ const z = await pnZ(e.code); const c = Object.assign({}, e); if(z){ delete c.code; c.codez = z; } log.push(c); } else log.push(e); }
  const out = { v:2, started:PN.wall0, audio:PN.audio ? base + '.' + ext : null, timeline:lines, log };
  const files = [{ blob:new Blob([JSON.stringify(out)], { type:'application/json' }), name:base + '.json' }];
  if(PN.audio && PN.chunks.length) files.unshift({ blob:new Blob(PN.chunks, { type:PN.mime || 'audio/webm' }), name:base + '.' + ext });
  PN.saved = { files, base }; pnSaveFiles();
  PN.rec = null; PN.chunks = []; pnTag(); toast(`Saved ${files.length === 2 ? 'two files, the recording and the log' : 'the log'} (${PN.log.filter(e => e.kind === 'screen').length} screens), to your Downloads. Send ${files.length === 2 ? 'both' : 'it'} to Claude.`);
}
/* one after the other: two downloads at once can lose the second */
function pnSaveFiles(){ if(PN.saved) PN.saved.files.forEach((f, i) => setTimeout(() => pnDownload(f.blob, f.name), i * 700)); }
window.addEventListener('beforeunload', e => { if(PN.on){ e.preventDefault(); e.returnValue = ''; } });

/* ---------- the tag in the corner ---------- */
function pnTag(){
  let el = document.getElementById('pnTag'); const show = PN.on || settings.screenNames || settings.testMode;   // test mode shows them too
  if(!show){ if(el) el.remove(); return; }
  if(!el){ el = document.createElement('div'); el.id = 'pnTag'; el.className = 'pn-tag'; document.body.appendChild(el);
    el.addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; if(b.id === 'pnRec'){ PN.saved = null; pnStart(true, pnWordsOn()); } if(b.id === 'pnMark') pnMark(); if(b.id === 'pnStop') pnStop();
      if(b.id === 'pnAgain') pnSaveFiles(); if(b.id === 'pnDone'){ PN.saved = null; pnTag(); } }); }
  const name = pnName(), when = pnWhen();
  el.classList.toggle('rec', PN.on);
  el.innerHTML = `<b class="pn-n">${esc(name)}</b>${when ? `<span class="pn-w">${esc(when)}</span>` : ''}${PN.on ? `<span class="pn-r"><i></i>${PN.audio ? 'REC' : 'LOG'} ${pnClock(pnT())}</span><button id="pnMark" title="Drop a marker in the log">Mark</button><button id="pnStop">Stop &amp; save</button>` : PN.saved ? `<span class="pn-s">Saved ${esc(PN.saved.base)} (${PN.saved.files.map(f => f.name.split('.').pop()).join(' + ')})</span><button id="pnAgain" title="Download the files again">Save again</button><button id="pnDone" title="Done: hide this">✓</button>` : `<button id="pnRec" title="Record your voice and log the screens">● Record</button>`}`;
}
const pnRender0 = render;
render = function(){ const r = pnRender0.apply(this, arguments); try{ if(PN.on || settings.screenNames || settings.testMode){ setTimeout(() => { pnNote(); pnTag(); }, 0); } }catch(e){} return r; };
document.addEventListener('click', () => { if(PN.on || settings.screenNames || settings.testMode) setTimeout(() => { pnNote(); pnTag(); }, 60); }, true);

/* ---------- the teacher panel: Play notes ---------- */
document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
  try{ const tsec = document.querySelector('#teacher .tsec'); if(!tsec) return; const grid = tsec.parentNode, sec = document.createElement('div'); sec.className = 'tsec'; sec.id = 'tPlayNotes';
    sec.innerHTML = `<h3>Play notes</h3>
      <div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="tScreenNames" style="width:24px;height:24px"> Show each screen's name in the bottom-left corner</label></div>
      <div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="tPnWords" style="width:24px;height:24px"> Live transcript while recording (Chrome; it sends the speech to Google to turn into words)</label></div>
      <div class="row" style="gap:8px"><button class="btn small" id="tPnRec">● Record voice and screens</button><button class="btn small" id="tPnLog">Log screens only</button></div>
      <p class="small muted">Talk as you play. The game notes each screen as it appears; Mark drops a marker; Stop &amp; save (bottom-left) saves two files, the recording and the log. Send both to Claude, who can rebuild any screen you talked about. "Log screens only" keeps the clock times, to match a recording made on a phone.</p>`;
    grid.insertBefore(sec, tsec.nextSibling);
    const sn = document.getElementById('tScreenNames'); sn.checked = !!settings.screenNames; sn.onchange = () => { settings.screenNames = sn.checked; saveSettings(); pnTag(); };
    const w = document.getElementById('tPnWords'); w.checked = pnWordsOn(); w.onchange = () => { settings.pnWords = w.checked; saveSettings(); };
    if(pnFile()){ w.checked = false; w.disabled = true; w.parentNode.insertAdjacentHTML('beforeend', ' <span class="small muted">(not when the game is opened from a file: Chrome would ask for the microphone at every pause)</span>'); }
    document.getElementById('tPnRec').onclick = () => { teacherClose(); PN.saved = null; pnStart(true, pnWordsOn()); };
    document.getElementById('tPnLog').onclick = () => { teacherClose(); PN.saved = null; pnStart(false, false); };
  }catch(e){}
  pnTag();
}, 20));
window.__pn = { name:pnName, when:pnWhen, start:pnStart, stop:pnStop, mark:pnMark, log:() => PN.log, on:() => PN.on };
}
