/* =====================================================================
   YEAR ONE FIRST (Bertie, 18 Oct 2026; CLAUDE.md). Claude Design's batch 2 (the handover of 18 Oct) and later screen
   changes apply from Launch Day (Mon 2 Sep 2030, day 1) to the year-1 accounts (the chapter 2 review, Sun 31 Aug 2031),
   read from the Chapters sheet. Later dates keep the earlier look until Bertie says "extend": then yearOne() returns true
   everywhere and chapters 3 and 4 are checked once.
   - yearOne(day) is the behaviour check; body.yr1 is the class the batch's CSS sits under.
   ===================================================================== */
function y1Last(){ try{ const c = (typeof CHAPTERS !== 'undefined' ? CHAPTERS : []).find(x => +x.chapter === 2); if(c && c.end) return dayOfDate(c.end); }catch(e){} return 364; }
function yearOne(day){ const d = day === undefined ? (typeof S !== 'undefined' && S && S.day) || 1 : day; return d <= y1Last(); }
const y1Render0 = render;
render = function(){ try{ document.body.classList.toggle('yr1', yearOne()); }catch(e){} return y1Render0.apply(this, arguments); };
