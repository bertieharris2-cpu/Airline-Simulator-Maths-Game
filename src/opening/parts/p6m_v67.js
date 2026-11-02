/* =====================================================================================================================
   FABLE'S DATA PASS, WORKBOOK v6.7 (2 Nov 2026). Chapter one only (ch1()).
   - Settings legRounding 'up to the next quarter hour': a workbook route's leg rounds UP to the quarter hour
     (Frankfurt on a Twin Otter 130 → 135 min; Paris on a Saab 40 → 45). The home turnaround of 30 min is data only.
   - Three wordings that lived in code now come from ScreenText, so Fable can set them:
       brief1.lead / brief1.steps  Launch Day's first page (no snacks: the on-board step is gone)
       intro.tank.lead              December's "Buying fuel ahead" introduction, its first line
       end.next                     the chapter-one review's "What comes next" line (chapter 2's newIdea said "reputation revealed")
   (Settings graph2Measure is read by p6l_graphs.js.)
   ===================================================================================================================== */
{
const T8 = (id, v) => { try{ const T = h21Text(id, v || {}); return Object.assign({ title:'', text:[], button:'', eyebrow:'' }, T, { text:T.text || [] }); }catch(e){ return { title:'', text:[], button:'', eyebrow:'' }; } };
const SET8 = () => (typeof WBS === 'function' ? WBS() : {}) || {};

/* ---------- legs on the quarter hour ---------- */
const v8Leg0 = legMinutes;
legMinutes = function(plane, route, hh){
  const m = v8Leg0.apply(this, arguments);
  if(!route || !route.wb || !ch1() || !/^\s*up/i.test(String(SET8().legRounding || ''))) return m;
  return Math.ceil(m / 15 - 1e-9) * 15;
};

/* ---------- Launch Day's first page ---------- */
const NUMW = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];
const v8Brief0 = R.brief1;
R.brief1 = function(){
  const r = v8Brief0.apply(this, arguments);
  try{ if(!ch1()) return r;
    const L = T8('brief1.lead'), P = screen().querySelector('.br1-hero p'); if(P && L.text[0]) P.textContent = L.text[0];
    const X = T8('brief1.steps'), tx = X.text, steps = []; for(let i = 0; i + 1 < tx.length; i += 2) steps.push([tx[i], tx[i + 1]]);
    const box = screen().querySelector('.br1-steps');
    if(box && steps.length){ const kl = box.querySelector('.kl'), ol = box.querySelector('ol');
      if(kl) kl.textContent = (X.title || 'Your Week 1 plan: {n} simple steps').replace('{n}', NUMW[steps.length] || String(steps.length));
      if(ol) ol.innerHTML = steps.map(([t, d], i) => `<li><i>${i + 1}</i><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join(''); }
  }catch(e){ console.error(e); }
  return r;
};

/* ---------- December: Buying fuel ahead ---------- */
if(typeof INTRO !== 'undefined' && INTRO.tank && typeof INTRO.tank.what === 'function'){
  const v8Tank0 = INTRO.tank.what;
  INTRO.tank.what = function(){ const out = v8Tank0.apply(this, arguments);
    try{ const t = T8('intro.tank.lead').text[0]; if(ch1() && t && Array.isArray(out) && Array.isArray(out[0])) out[0] = [esc(t)]; }catch(e){}
    return out; };
}

/* ---------- the chapter-one review: what comes next ---------- */
const v8Next0 = nextChapterLine;
nextChapterLine = function(){
  try{ const day = S && S.day || 1, c1 = (CHAPTERS || []).find(c => +c.chapter === 1), nx = (CHAPTERS || []).find(c => +c.chapter === 2);
    const t = T8('end.next').text[0];
    if(t && nx && c1 && day <= dayOfDate(c1.end)) return t.replace('{n}', nx.chapter).replace('{name}', nx.name || '').replace('{date}', dateLong(dayOfDate(nx.start)));
  }catch(e){}
  return v8Next0.apply(this, arguments);
};
}
