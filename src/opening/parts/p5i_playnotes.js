
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
   30 Oct 2026: Chrome got stuck on "download multiple files" and crashed, and the recording that came through held 8 seconds
   of room noise: the microphone stopped feeding the recorder after 8 seconds while the corner clock kept going. So now:
   - Stop & save downloads ONE file, playnotes-….zip: the recording (in parts if the microphone was restarted) and the log;
   - each second of sound is copied into the browser's own storage (IndexedDB) as it is recorded, and the log every 10 s,
     so a crash loses nothing: Play notes in the teacher panel offers the last recording as a zip until a new one starts;
   - the corner clock counts the seconds of sound actually received. When none arrive for 5 s it says MIC STOPPED and
     starts a new part on a fresh microphone; when nothing louder than room noise is heard for 90 s it says "Can't hear you".
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
  const bf = pnQ('#bfLayer'); if(bf && !bf.hidden && bf.childElementCount){ const t = ((bf.querySelector('iframe') || {}).title || '').replace(/^Operations briefing:\s*/, ''); return t ? 'Briefing: ' + t : 'Briefing'; }   // which one, for the log
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
  const own = typeof window.__pnLabel === 'function' ? window.__pnLabel(t) : null;   // a later part names its own pages (p6f: the plan check, Week 1 is flying)
  return own || PN_STEP[t] || (t.charAt(0).toUpperCase() + t.slice(1));
}
function pnWhen(){ if(!S || !S.day) return S && S.phase === 'setup' ? 'Launch Day' : ''; return `Week ${weekNo(S.day)} · ${dateShort(S.day)}`; }

/* ---------- the recording and the log ---------- */
const PN = { on:false, audio:false, t0:0, wall0:null, base:'', rec:null, parts:[], mime:'', log:[], last:'', lastCode:'', sr:null, srOn:false, timer:null, codes:0, secs:0, lastChunk:0, heard:0, lost:false, metaAt:0, retryAt:0 };
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
  if(PN.on || PN.starting) return; PN.starting = true;
  try{ const last = await pnLast();   // a recording that was never saved (Chrome closed): offer it before it is replaced
    if(last && !last.done && last.secs > 0 && confirm(`The recording from ${pnWhenStarted(last)} (${pnClock(last.secs)}) was not saved. Download it now, before the new recording replaces it?`)) await pnRecover(); }catch(e){}
  Object.assign(PN, { on:true, audio:false, t0:performance.now(), wall0:new Date().toISOString(), parts:[], log:[], last:'', lastCode:'', codes:0, secs:0, lost:false, metaAt:0, retryAt:0 });
  PN.base = 'playnotes-' + PN.wall0.slice(0, 16).replace('T', '-').replace(':', ''); PN.starting = false;
  pnPush({ kind:'start', game:document.title, words:!!words });
  await pnIdb('chunk', st => st.clear());
  if(audio){
    try{ await pnMicStart(); PN.audio = true; }
    catch(err){ pnPush({ kind:'note', text:'Microphone not available: ' + (err && err.name || err) + '. Logging screens only.' }); toast('No microphone: logging the screens only (the times match a recording made on your phone).'); }
  }
  if(words) pnWords(); pnNote(); pnKeep();
  PN.timer = setInterval(pnTick, 1000); pnTag(); toast(PN.audio ? 'Recording. Talk as you play; Stop & save downloads one zip, the recording and the log.' : 'Logging the screens. Stop & save downloads the log.');
}
/* the microphone: each start is a new part (a restarted recorder cannot carry on the same file) */
async function pnMicStart(){
  const stream = await navigator.mediaDevices.getUserMedia({ audio:true }); PN.mime = pnMime();
  const part = { t:pnT(), mime:PN.mime, blobs:[] }, k = PN.parts.push(part) - 1;
  const rec = new MediaRecorder(stream, PN.mime ? { mimeType:PN.mime } : undefined);
  rec.ondataavailable = e => { if(!e.data || !e.data.size) return; const i = part.blobs.push(e.data) - 1; PN.lastChunk = performance.now(); if(PN.on) PN.secs++;
    pnIdb('chunk', st => st.put({ part:k, i, blob:e.data }, 'p' + String(k).padStart(3, '0') + ':' + String(i).padStart(6, '0'))); };
  rec.onerror = ev => pnLost('the recorder reported ' + ((ev && ev.error && ev.error.name) || 'an error'));
  stream.getAudioTracks().forEach(t => { t.onended = () => pnLost('the microphone was disconnected or taken by another program'); });
  PN.rec = rec; rec.start(1000); PN.lastChunk = PN.heard = performance.now(); PN.lost = false; pnLevel(stream);
  if(k) pnPush({ kind:'note', text:`Recording part ${k + 1} starts here (the microphone had stopped).` });
}
/* how loud: an analyser on the same microphone, read once a second */
function pnLevel(stream){ try{ const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return; try{ if(PN.ac) PN.ac.close(); }catch(e){}
  const ac = PN.ac = new AC(), an = PN.an = ac.createAnalyser(); an.fftSize = 2048; ac.createMediaStreamSource(stream).connect(an); }catch(e){ PN.an = null; } }
function pnHear(){ if(!PN.an) return; const a = new Float32Array(PN.an.fftSize); PN.an.getFloatTimeDomainData(a); let s = 0; for(let i = 0; i < a.length; i++) s += a[i] * a[i];
  if(Math.sqrt(s / a.length) > 0.01) PN.heard = performance.now(); }   // louder than about -40 dB: a voice, not the room
function pnLost(why){ if(!PN.on || PN.lost) return; PN.lost = true; pnPush({ kind:'note', text:'Microphone stopped: ' + why + '. Trying again.' });
  toast('The microphone stopped. Trying to start it again: check it is plugged in and not being used by another program.'); pnTag(); }
async function pnMicRestart(){ const old = PN.rec; try{ if(old && old.state !== 'inactive') old.stop(); }catch(e){} try{ old && old.stream.getTracks().forEach(t => t.stop()); }catch(e){}
  try{ await pnMicStart(); toast('The microphone is back: recording again.'); }catch(e){} }
function pnTick(){
  if(PN.on && PN.audio){ const now = performance.now(); pnHear();
    if(!PN.lost && now - PN.lastChunk > 5000) pnLost('no sound reached the recorder for 5 seconds');
    if(PN.lost && !PN.retrying && now - PN.retryAt > 10000){ PN.retrying = true; PN.retryAt = now; pnMicRestart().finally(() => { PN.retrying = false; }); } }
  if(PN.on && performance.now() - PN.metaAt > 10000) pnKeep();
  pnTag();
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
/* ---------- one zip (stored: the recording is compressed already) ---------- */
const PN_CRC = (() => { const t = new Uint32Array(256); for(let n = 0; n < 256; n++){ let c = n; for(let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function pnCrc(u){ let c = 0xFFFFFFFF; for(let i = 0; i < u.length; i++) c = PN_CRC[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
async function pnZip(files){
  const enc = new TextEncoder(), body = [], dir = [], d = new Date(); let off = 0;
  const tm = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), dt = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  for(const f of files){ const data = new Uint8Array(await f.blob.arrayBuffer()), name = enc.encode(f.name), crc = pnCrc(data);
    const h = new DataView(new ArrayBuffer(30)); [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [10, tm, 2], [12, dt, 2], [14, crc, 4], [18, data.length, 4], [22, data.length, 4], [26, name.length, 2]].forEach(([o, v, n]) => n === 4 ? h.setUint32(o, v, true) : h.setUint16(o, v, true));
    const c = new DataView(new ArrayBuffer(46)); [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [12, tm, 2], [14, dt, 2], [16, crc, 4], [20, data.length, 4], [24, data.length, 4], [28, name.length, 2], [42, off, 4]].forEach(([o, v, n]) => n === 4 ? c.setUint32(o, v, true) : c.setUint16(o, v, true));
    body.push(h, name, data); dir.push(c, name); off += 30 + name.length + data.length; }
  const size = dir.reduce((a, x) => a + x.byteLength, 0), e = new DataView(new ArrayBuffer(22)); e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, size, true); e.setUint32(16, off, true);
  return new Blob([...body, ...dir, e], { type:'application/zip' });
}
/* the zip's contents: the recording's parts and the log (save codes gzipped) */
async function pnPack(m, parts){
  const ext = mime => /mp4/.test(mime) ? 'm4a' : /ogg/.test(mime) ? 'ogg' : 'webm', live = parts.filter(p => p.blobs.length);
  const audio = live.map((p, k) => ({ name:m.base + (live.length > 1 ? '-part' + (k + 1) : '') + '.' + ext(p.mime || ''), blob:new Blob(p.blobs, { type:p.mime || 'audio/webm' }), t:p.t }));
  const lines = m.log.map(e => `${pnClock(e.t)}  ${e.kind === 'screen' ? `${e.name}${e.when ? ' · ' + e.when : ''}` : e.kind === 'say' ? `“${e.text}”` : e.kind === 'mark' ? `★ MARK (${e.screen})` : e.kind === 'note' ? `(${e.text})` : e.kind.toUpperCase()}`);
  const log = []; for(const e of m.log){ if(e.code){ const z = await pnZ(e.code); const c = Object.assign({}, e); if(z){ delete c.code; c.codez = z; } log.push(c); } else log.push(e); }
  const out = { v:3, started:m.started, audio:audio.length ? audio[0].name : null, audioParts:audio.map(a => ({ file:a.name, t:a.t })), timeline:lines, log };
  const files = [...audio, { name:m.base + '.json', blob:new Blob([JSON.stringify(out)], { type:'application/json' }) }];
  return { zip:await pnZip(files), name:m.base + '.zip', audio:audio.length, screens:m.log.filter(e => e.kind === 'screen').length };
}
async function pnStop(){
  if(!PN.on) return; pnPush({ kind:'stop' }); PN.on = false; PN.srOn = false; clearInterval(PN.timer);
  try{ if(PN.sr) PN.sr.stop(); }catch(e){}
  const rec = PN.rec; if(rec){ await new Promise(res => { rec.onstop = res; try{ if(rec.state === 'inactive') res(); else rec.stop(); }catch(e){ res(); } }); try{ rec.stream.getTracks().forEach(t => t.stop()); }catch(e){} }
  try{ if(PN.ac) PN.ac.close(); }catch(e){} PN.ac = PN.an = null; PN.rec = null;
  await pnKeep(true);
  const pk = await pnPack(pnMeta(), PN.parts); PN.saved = { zip:pk.zip, name:pk.name, base:PN.base }; pnSaveFiles(); pnTag();
  toast(`Saved ${pk.name} to your Downloads: ${pk.audio ? 'the recording and the log' : 'the log'}, ${pk.screens} screens. Send the zip to Claude.`);
}
function pnSaveFiles(){ if(PN.saved) pnDownload(PN.saved.zip, PN.saved.name); }

/* ---------- the copy kept in the browser (IndexedDB) while recording ---------- */
function pnDb(){ return new Promise((res, rej) => { if(!window.indexedDB) return rej(new Error('no IndexedDB')); const q = indexedDB.open('asim-playnotes', 1);
  q.onupgradeneeded = () => { const db = q.result; ['chunk', 'meta'].forEach(n => { if(!db.objectStoreNames.contains(n)) db.createObjectStore(n); }); }; q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); }
async function pnIdb(store, fn){ try{ const db = PN.db || (PN.db = await pnDb());
  return await new Promise((res, rej) => { const tx = db.transaction(store, 'readwrite'), r = fn(tx.objectStore(store)); tx.oncomplete = () => res(r ? r.result : undefined); tx.onerror = () => rej(tx.error); }); }catch(e){ return null; } }
const pnMeta = () => ({ base:PN.base, started:PN.wall0, log:PN.log, parts:PN.parts.map(p => ({ t:p.t, mime:p.mime })), secs:PN.secs });
async function pnKeep(done){ PN.metaAt = performance.now(); await pnIdb('meta', st => st.put(Object.assign(pnMeta(), { done:!!done, kept:new Date().toISOString() }), 'last')); }
const pnLast = () => pnIdb('meta', st => st.get('last'));
const pnWhenStarted = m => { const d = new Date(m.started); return `${d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' })} ${d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}`; };
async function pnRecover(){ const m = await pnLast(); if(!m) return null; const rows = (await pnIdb('chunk', st => st.getAll())) || [];
  const parts = (m.parts || []).map(p => ({ t:p.t, mime:p.mime, blobs:[] })); rows.forEach(r => { if(parts[r.part]) parts[r.part].blobs[r.i] = r.blob; }); parts.forEach(p => { p.blobs = p.blobs.filter(Boolean); });
  const pk = await pnPack(m, parts); pnDownload(pk.zip, pk.name); return pk; }
/* the Play notes section shows the kept recording, with a button to download it as a zip */
async function pnLastShow(){ const el = document.getElementById('tPnLast'); if(!el) return; const m = await pnLast();
  el.innerHTML = m && !(PN.on && m.base === PN.base) ? `<span class="small">${m.done ? 'Last recording' : '<b class="pn-warn">Not saved:</b> the recording'} from ${esc(pnWhenStarted(m))}, ${pnClock(m.secs || 0)} of sound, is kept in this browser.</span> <button class="btn small" id="tPnGet">Download it (zip)</button>` : '';
  const b = document.getElementById('tPnGet'); if(b) b.onclick = async () => { b.disabled = true; const pk = await pnRecover(); b.disabled = false; toast(pk ? `Saved ${pk.name} to your Downloads.` : 'Nothing kept.'); }; }
window.addEventListener('beforeunload', e => { if(PN.on){ pnKeep(); e.preventDefault(); e.returnValue = ''; } });

/* ---------- the tag in the corner ---------- */
function pnTag(){
  let el = document.getElementById('pnTag'); const show = PN.on || settings.screenNames || settings.testMode;   // test mode shows them too
  document.body.classList.toggle('pn-shown', !!show);   // a briefing's frame moves right of the tag (p1_head_screens3.css)
  if(!show){ if(el) el.remove(); return; }
  if(!el){ el = document.createElement('div'); el.id = 'pnTag'; el.className = 'pn-tag'; document.body.appendChild(el);
    el.addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; if(b.id === 'pnRec'){ PN.saved = null; pnStart(true, pnWordsOn()); } if(b.id === 'pnMark') pnMark(); if(b.id === 'pnStop') pnStop();
      if(b.id === 'pnAgain') pnSaveFiles(); if(b.id === 'pnDone'){ PN.saved = null; pnTag(); } }); }
  const name = pnName(), when = pnWhen();
  el.classList.toggle('rec', PN.on); el.classList.toggle('lost', PN.on && PN.audio && PN.lost);
  el.innerHTML = `<b class="pn-n">${esc(name)}</b>${when ? `<span class="pn-w">${esc(when)}</span>` : ''}${PN.on ? `<span class="pn-r"><i></i>${PN.audio ? 'REC ' + pnClock(PN.secs) : 'LOG ' + pnClock(pnT())}</span>${PN.audio && PN.lost ? '<span class="pn-x">MIC STOPPED: trying again</span>' : PN.audio && performance.now() - PN.heard > 90000 ? '<span class="pn-q">Can\'t hear you: check the microphone</span>' : ''}<button id="pnMark" title="Drop a marker in the log">Mark</button><button id="pnStop">Stop &amp; save</button>` : PN.saved ? `<span class="pn-s">Saved ${esc(PN.saved.name)}</span><button id="pnAgain" title="Download the zip again">Save again</button><button id="pnDone" title="Done: hide this">✓</button>` : `<button id="pnRec" title="Record your voice and log the screens">● Record</button>`}`;
}
const pnRender0 = render;
render = function(){ const r = pnRender0.apply(this, arguments); try{ if(PN.on || settings.screenNames || settings.testMode || document.getElementById('pnTag')){ setTimeout(() => { pnNote(); pnTag(); }, 0); } }catch(e){} return r; };   // (a tag left from test mode goes with the next render)
document.addEventListener('click', () => { if(PN.on || settings.screenNames || settings.testMode) setTimeout(() => { pnNote(); pnTag(); }, 60); }, true);

/* ---------- the teacher panel: Play notes ---------- */
document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
  try{ const tsec = document.querySelector('#teacher .tsec'); if(!tsec) return; const grid = tsec.parentNode, sec = document.createElement('div'); sec.className = 'tsec'; sec.id = 'tPlayNotes';
    sec.innerHTML = `<h3>Play notes</h3>
      <div class="row"><label class="row" style="gap:8px"><input type="checkbox" id="tScreenNames" style="width:24px;height:24px"> Show each screen's name in the bottom-left corner</label></div>
      <div class="row" id="tPnWordsRow"><label class="row" style="gap:8px"><input type="checkbox" id="tPnWords" style="width:24px;height:24px"> Live transcript while recording (Chrome; it sends the speech to Google to turn into words)</label></div>
      <div class="row" style="gap:8px"><button class="btn small" id="tPnRec">● Record voice and screens</button><button class="btn small" id="tPnLog">Log screens only</button></div>
      <p class="small muted">Talk as you play; Mark (bottom-left) drops a marker. Stop &amp; save downloads one zip, the recording and the log: send it to Claude. The recording is kept in this browser as you go, so if Chrome closes it can be downloaded here.</p>
      <div class="row" id="tPnLast"></div>`;
    grid.insertBefore(sec, tsec.nextSibling);
    const sn = document.getElementById('tScreenNames'); sn.checked = !!settings.screenNames; sn.onchange = () => { settings.screenNames = sn.checked; saveSettings(); pnTag(); };
    const w = document.getElementById('tPnWords'); w.checked = pnWordsOn(); w.onchange = () => { settings.pnWords = w.checked; saveSettings(); };
    if(pnFile()){ w.checked = false; document.getElementById('tPnWordsRow').hidden = true; }   // from a file Chrome would ask for the microphone at every pause
    document.getElementById('tPnRec').onclick = () => { teacherClose(); PN.saved = null; pnStart(true, pnWordsOn()); };
    document.getElementById('tPnLog').onclick = () => { teacherClose(); PN.saved = null; pnStart(false, false); };
    pnLastShow();
  }catch(e){}
  pnTag();
  pnLast().then(m => { if(m && !m.done && m.secs > 0 && !PN.on) toast(`The play-notes recording from ${pnWhenStarted(m)} was not saved. It is kept: Teacher panel → Play notes → Download it.`); });
}, 20));
const pnTeacherOpen0 = teacherOpen;
teacherOpen = function(){ const r = pnTeacherOpen0.apply(this, arguments); pnLastShow(); return r; };
window.__pn = { name:pnName, when:pnWhen, start:pnStart, stop:pnStop, mark:pnMark, log:() => PN.log, on:() => PN.on, secs:() => PN.secs, parts:() => PN.parts.length, lost:() => PN.lost,
  last:pnLast, recover:pnRecover, kill:why => { try{ PN.rec.stream.getTracks().forEach(t => t.stop()); PN.rec.stop(); }catch(e){} } };
}
