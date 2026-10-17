
/* ==================================================================
   A SMALL SET OF SOUNDS (D96, Fable's screens brief, 17 Oct 2026; Settings soundSet)
   tap · slot · tick · query · chime · cash · pour · whoosh · day tick: short, soft and consistent, made in the browser
   (Web Audio, no files), on top of the voice and the operations sounds that exist. They follow the teacher's sound switch
   (off to start) and one volume (Teacher panel); the query is always quieter than the tick. Immersion, not feedback: the
   screen still carries the meaning.
   ================================================================== */
{
const sdOn = () => WBS().soundSet !== false && typeof opsSoundOn === 'function' && opsSoundOn() && typeof loAC !== 'undefined' && !!loAC;
const sdVol = () => { const v = settings.uiVolume; return v === undefined || v === null || isNaN(+v) ? 0.6 : Math.max(0, Math.min(1, +v)); };
let sdLast = {};
/* one note: a sine (or triangle) with a quick attack and a soft decay */
function sdNote(freq, t0, dur, gain, type, glide){
  const ac = loAC, o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0); if(glide) o.frequency.exponentialRampToValueAtTime(glide, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * sdVol()), t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + dur + 0.02);
}
/* filtered noise: the pour and the whoosh */
function sdNoise(t0, dur, gain, f0, f1, q){
  const ac = loAC, n = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
  for(let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain(); src.buffer = buf; bp.type = 'bandpass'; bp.Q.value = q || 1.2;
  bp.frequency.setValueAtTime(f0, t0); bp.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * sdVol()), t0 + dur * 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp); bp.connect(g); g.connect(ac.destination); src.start(t0); src.stop(t0 + dur + 0.02);
}
const SD = {
  tap:   t => sdNote(1180, t, 0.05, 0.035, 'triangle'),
  slot:  t => { sdNote(660, t, 0.07, 0.05, 'triangle'); sdNote(990, t + 0.035, 0.08, 0.04, 'triangle'); },
  tick:  t => sdNote(1320, t, 0.22, 0.07),
  query: t => sdNote(392, t, 0.22, 0.045, 'sine', 349),
  chime: t => { sdNote(784, t, 0.5, 0.05); sdNote(1175, t + 0.09, 0.6, 0.04); },
  cash:  t => { sdNote(1568, t, 0.09, 0.04, 'triangle'); sdNote(2093, t + 0.06, 0.16, 0.035, 'triangle'); },
  pour:  t => sdNoise(t, 0.9, 0.05, 500, 1500, 0.9),
  whoosh:t => sdNoise(t, 0.32, 0.045, 1800, 500, 1.4),
  day:   t => sdNote(880, t, 0.06, 0.03, 'triangle')
};
function sd(kind){
  try{ if(!sdOn() || !SD[kind]) return; const now = loAC.currentTime, last = sdLast[kind] || 0; if(now - last < 0.06) return; sdLast[kind] = now; SD[kind](now + 0.005); const L = window.__sdLog || (window.__sdLog = []); L.push(kind); if(L.length > 60) L.shift(); }catch(e){}   // __sdLog: the last sounds, for the tests
}
/* the triggers: what was pressed, then what the page did */
let sdCheck = null;
document.addEventListener('click', e => {
  const b = e.target && e.target.closest && e.target.closest('button, .btn, [role="button"]'); if(!b || b.disabled) return;
  if(b.matches('[data-rbfig], [data-fofig], [data-fsfig], [data-pbfig], [data-tafig], .rb-chip')) sd('slot');
  else if(/^\s*Check\b/.test(b.textContent) || b.matches('[data-rbchk], #cellCheck, #foChk, #scCheck, #fsChk')){
    const n = s => document.querySelectorAll(s).length;
    sdCheck = { ok:n('.stamp.ok, .stamp.fin, .pq.done, .rb-card.ok, .so-card.ok, .fd-sign.ok'), q:n('.stamp.q, .answer.query, .sc-in.qy, .rb-msg:not(.ok)') + (document.querySelector('#ftMsg') ? 1 : 0) };
    setTimeout(() => { if(!sdCheck) return; const ok = n('.stamp.ok, .stamp.fin, .pq.done, .rb-card.ok, .so-card.ok, .fd-sign.ok'); sd(ok > sdCheck.ok ? 'tick' : 'query'); sdCheck = null; }, 90);
  }
  else if(!b.closest('#bfLayer')) sd('tap');
}, true);
/* what moved: money (a purchase, the week's accounts), the tank, a flight on the timetable, the board's day */
let sdPrev = null;
const sdRender0 = render;
render = function(){
  const r = sdRender0.apply(this, arguments);
  try{ const st = step(), t = st ? st.t : '', now = { cash:Math.round(S.cash || 0), fuel:Math.round(S.fuel || 0), day:S.day, t, rbOk:!!(S.wk && S.wk.logged) };
    if(sdPrev && t !== 'fly' && now.day === sdPrev.day){
      if(now.fuel > sdPrev.fuel + 0.5) sd('pour');
      if(now.cash !== sdPrev.cash && t !== 'weekRun') sd('cash');
    }
    if(sdPrev && t === 'weekRun' && now.day !== sdPrev.day) sd('day');
    if(sdPrev && now.rbOk && !sdPrev.rbOk) sd('cash');
    sdPrev = now; }catch(e){}
  return r;
};
const sdMove0 = moveService;
moveService = function(){ sd('whoosh'); return sdMove0.apply(this, arguments); };
/* a result plate (the boarding pass, a granted upgrade) chimes; the Night Ops part already chimes a confirmed sum */
window.__sd = sd;
/* the one volume: a slider beside the teacher's Sound switch */
document.addEventListener('DOMContentLoaded', () => {
  try{ const box = document.getElementById('tOpsSound'), row = box && (box.closest('label') || box.parentNode); if(!row || document.getElementById('tUiVol')) return;
    row.insertAdjacentHTML('afterend', `<label class="t-vol">Volume of the sounds <input type="range" id="tUiVol" min="0" max="1" step="0.1" value="${sdVol()}"></label>`);
    const v = document.getElementById('tUiVol'); v.oninput = () => { settings.uiVolume = +v.value; try{ saveSettings(); }catch(e){} }; v.onchange = () => sd('tick'); }catch(e){}
});
}
