// The overlap scanner (16 Oct 2026), injected into the game page: __ovlScan(tag) lists text and controls that overlap each other
// where both can be seen, text cut by a box that hides its overflow (not an ellipsis, not a scroller that scrolls), and text
// off the screen. Used by hook.js (any test) and desks.js (every desk of a save). Closed fold-outs and covered text are skipped.
(function(){
  if(window.__ovlScan) return;
  const vis = el => { const dt = el.closest('details:not([open])'); if(dt && !el.closest('summary')) return false; for(let e = el; e && e.nodeType === 1; e = e.parentElement){ const s = getComputedStyle(e); if(s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; } return true; };
  const path = el => { const out = []; for(let e = el; e && e.nodeType === 1 && out.length < 4; e = e.parentElement){ const cn = (e.getAttribute && e.getAttribute('class') || '').trim(); out.unshift(e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (cn ? '.' + cn.split(/\s+/).slice(0, 2).join('.') : '')); } return out.join(' > '); };
  const opaque = e => { const s = getComputedStyle(e); const m = /rgba?\(([^)]+)\)/.exec(s.backgroundColor); const a = m ? (m[1].split(',')[3] === undefined ? 1 : +m[1].split(',')[3]) : 0; return a > 0.6 || (s.backgroundImage && s.backgroundImage !== 'none' && /url\(/.test(s.backgroundImage)); };
  const textOf = el => (el.innerText || el.value || el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  function boxes(){
    const out = [], W = innerWidth, H = innerHeight;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: n => n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    const byEl = new Map(); let n;
    while((n = walker.nextNode())){ const el = n.parentElement; if(!el || /^(SCRIPT|STYLE|TITLE|OPTION|TEXTAREA|NOSCRIPT)$/.test(el.tagName)) continue;
      const r = document.createRange(); r.selectNodeContents(n); const rs = [...r.getClientRects()].filter(x => x.width > 2 && x.height > 4); if(!rs.length) continue;
      const L = byEl.get(el) || []; rs.forEach(x => L.push(x)); byEl.set(el, L); }
    byEl.forEach((rs, el) => { if(!vis(el)) return; rs.forEach(r => { if(r.right < 0 || r.bottom < 0 || r.left > W || r.top > H) return; out.push({ el, r, kind:'text' }); }); });
    document.querySelectorAll('button, input:not([type=hidden]), select, [role=button]').forEach(el => { if(!vis(el)) return; const r = el.getBoundingClientRect(); if(r.width < 4 || r.height < 4 || r.right < 0 || r.bottom < 0 || r.left > W || r.top > H) return; out.push({ el, r, kind:'ctl' }); });
    return out;
  }
  const related = (a, b) => a === b || a.contains(b) || b.contains(a);
  // is el the thing painted at (x, y), with nothing opaque above it? (elements with pointer-events:none are skipped by the browser, so an ancestor counts)
  // the box every overflow-clipping ancestor leaves visible
  function clipAll(el){ let c = { l:-1e9, t:-1e9, r:1e9, b:1e9 }; for(let e = el; e && e !== document.documentElement; e = e.parentElement){ const st = getComputedStyle(e); if(/hidden|clip|auto|scroll/.test(st.overflowX + ' ' + st.overflowY)){ const q = e.getBoundingClientRect(); c = { l:Math.max(c.l, q.left), t:Math.max(c.t, q.top), r:Math.min(c.r, q.right), b:Math.min(c.b, q.bottom) }; } } return c; }
  function seenAt(el, x, y){ const c = clipAll(el); if(x < c.l || x > c.r || y < c.t || y > c.b) return false;
    for(const e of document.elementsFromPoint(x, y)){ if(e === el || el.contains(e) || e.contains(el)) return true; if(opaque(e)) return false; } return false; }
  // the clip box of el: the intersection of every ancestor that hides overflow; scrollers end the walk (their hidden content is reachable)
  function clipOf(el){ let c = { l:-1e9, t:-1e9, r:1e9, b:1e9 }, by = null, scroll = false;
    for(let e = el.parentElement; e && e !== document.documentElement; e = e.parentElement){ const st = getComputedStyle(e); const ov = st.overflowX + ' ' + st.overflowY;
      if(/auto|scroll/.test(ov)){ scroll = true; } if(/hidden|clip|auto|scroll/.test(ov)){ const q = e.getBoundingClientRect(); if(q.left > c.l || q.top > c.t || q.right < c.r || q.bottom < c.b){ c = { l:Math.max(c.l, q.left), t:Math.max(c.t, q.top), r:Math.min(c.r, q.right), b:Math.min(c.b, q.bottom) }; by = by || e; } }
      if(scroll) break; }
    return { c, by, scroll }; }
  // a toast or card that ignores the pointer (pointer-events:none) is invisible to elementsFromPoint: an opaque one covers what is under it
  const coverOf = el => { for(let e = el; e && e !== document.body; e = e.parentElement){ const st = getComputedStyle(e); if(st.pointerEvents === 'none' && /absolute|fixed/.test(st.position) && opaque(e)) return e; } return null; };
  function scan(tag){
    const B = boxes(), issues = [];
    for(let i = 0; i < B.length; i++) for(let j = i + 1; j < B.length; j++){
      const a = B[i], b = B[j]; if(related(a.el, b.el)) continue;
      const x0 = Math.max(a.r.left, b.r.left), x1 = Math.min(a.r.right, b.r.right), y0 = Math.max(a.r.top, b.r.top), y1 = Math.min(a.r.bottom, b.r.bottom);
      const ow = x1 - x0, oh = y1 - y0; if(ow < 4 || oh < 4) continue;
      const minH = Math.min(a.r.height, b.r.height), minW = Math.min(a.r.width, b.r.width);
      if(oh < minH * 0.35 || ow < Math.min(minW * 0.3, 14)) continue;   // a tight line-height touch is not an overlap
      const ca = coverOf(a.el), cb = coverOf(b.el); if((ca && !ca.contains(b.el)) || (cb && !cb.contains(a.el))) continue;
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2; if(!seenAt(a.el, cx, cy) || !seenAt(b.el, cx, cy)) continue;
      issues.push({ type:'overlap', tag, a:path(a.el), at:textOf(a.el), ak:a.kind, b:path(b.el), bt:textOf(b.el), bk:b.kind, box:[Math.round(x0), Math.round(y0), Math.round(ow), Math.round(oh)] });
    }
    const seenClip = new Set();
    B.forEach(({ el, r, kind }) => {
      for(let e = el; e && e !== document.body; e = e.parentElement){ const st = getComputedStyle(e); if(st.textOverflow === 'ellipsis' || (st.webkitLineClamp && st.webkitLineClamp !== 'none')) return; }
      const { c, by, scroll } = clipOf(el); if(!by) { if(r.bottom > innerHeight + 3 || r.right > innerWidth + 3) issues.push({ type:'offscreen', tag, el:path(el), t:textOf(el), r:[Math.round(r.left), Math.round(r.top)] }); return; }
      const out = Math.max(c.l - r.left, r.right - c.r, c.t - r.top, r.bottom - c.b); if(out <= 3) return;
      const inside = Math.max(0, Math.min(r.right, c.r) - Math.max(r.left, c.l)) * Math.max(0, Math.min(r.bottom, c.b) - Math.max(r.top, c.t));
      if(scroll && inside === 0) return;   // wholly scrolled out of view: fine
      if(scroll){ let sc = null; for(let e = el.parentElement; e; e = e.parentElement){ const st = getComputedStyle(e); if(/auto|scroll/.test(st.overflowX + ' ' + st.overflowY)){ sc = e; break; } }
        if(sc && (sc.scrollHeight > sc.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(sc).overflowY) || sc.scrollWidth > sc.clientWidth + 2 && /auto|scroll/.test(getComputedStyle(sc).overflowX))) return; }
      const k = path(el) + '|' + path(by); if(seenClip.has(k)) return; seenClip.add(k);
      issues.push({ type: scroll ? 'cut-in-scroller' : 'clipped', tag, kind, el:path(el), t:textOf(el), by:path(by), out:Math.round(out), part: inside > 0 ? 'partly' : 'hidden' });
    });
    return issues;
  }
  window.__ovlScan = scan;
})();
