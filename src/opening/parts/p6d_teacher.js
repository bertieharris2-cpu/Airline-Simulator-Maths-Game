
/* ==================================================================
   THE TEACHER PANEL, TIDIED (Bertie, 30 Oct 2026): "there's so many options that I don't really understand why we have
   them all. I'm not going to use them." The panel opens on the five things used while testing chapter one: Play notes,
   Testing, This moment (accept, skip, back), Session and the Save code. Everything else is folded, closed, under
   "More settings", every control still there and working: Events, Maths tools, Sign-offs a week, the autumn track, the
   Pupil record, Milestones, Decision support, the chapter gates, By hand so far, Tomorrow's choice, Money & days, and
   "Other options" (the nudge, text size, move on after landing, auto-answer, best runs, question bank, finish this run,
   the IWB window, read-aloud, delete test airlines). Calculation checks come up to the top only when one is recorded.
   It runs each time the panel opens, so sections other parts add later are sorted too.
   ================================================================== */
{
const TP_MAIN = ['Play notes', 'Testing', 'This moment', 'Session', 'Save code'];   // by heading, in this order
const TP_ROWS = ['tNudge', 'tText', 'tAuto', 'tAutoAns'];                             // whole rows to Other options
const TP_BTNS = ['tRuns', 'tBank', 'tFinish', 'tOpenIwb', 'tSpeak', 'tTkDel'];        // single buttons to Other options
const TP_NOTES = ['tTkKeys'];                                                          // help lines to Other options
const tpHead = sec => ((sec.querySelector('h3') || {}).textContent || '').trim();
function tpTidy(){
  const T = document.getElementById('teacher'), grid = T && T.querySelector('.box > .tgrid'); if(!grid) return;
  if(!document.getElementById('tMore')) grid.insertAdjacentHTML('afterend', `<details id="tMore" class="tp-more"><summary>More settings <span class="small muted">not needed to test chapter one</span></summary>
    <div class="tgrid" id="tMoreGrid"><div class="tsec" id="tOther"><h3>Other options</h3><div class="row" id="tOtherBtns"></div></div></div></details>`);
  const more = document.getElementById('tMoreGrid'), other = document.getElementById('tOther'), btns = document.getElementById('tOtherBtns');
  TP_ROWS.forEach(id => { const el = document.getElementById(id), row = el && el.closest('div.row'); if(row && !other.contains(row)) other.insertBefore(row, btns); });
  TP_BTNS.forEach(id => { const el = document.getElementById(id), row = el && el.parentNode; if(!el || other.contains(el)) return; btns.appendChild(el);
    if(row && row.classList.contains('row') && !row.id && !row.children.length && !row.textContent.trim()) row.remove(); });   // a row the move left empty
  TP_NOTES.forEach(id => { const el = document.getElementById(id); if(el && !other.contains(el)) other.appendChild(el); });
  const diag = document.getElementById('tDiag'), problem = !!diag && !!diag.textContent.trim() && !/No problems/.test(diag.textContent);
  const main = sec => TP_MAIN.some(h => tpHead(sec).startsWith(h)) || (problem && sec.contains(diag));
  [...grid.children].forEach(sec => { if(sec.classList.contains('tsec') && !main(sec)) more.appendChild(sec); });
  [...more.children].forEach(sec => { if(sec !== other && main(sec)) grid.appendChild(sec); });
  TP_MAIN.forEach(h => { const sec = [...grid.children].find(x => tpHead(x).startsWith(h)); if(sec) grid.appendChild(sec); });   // the order above
  if(problem) grid.appendChild(diag.closest('.tsec'));
  more.appendChild(other);
  const th = [...grid.querySelectorAll('h3')].find(h => /^Testing/.test(h.textContent)); if(th) th.textContent = 'Testing';
}
const tpOpen0 = teacherOpen;
teacherOpen = function(){ const r = tpOpen0.apply(this, arguments); try{ tpTidy(); }catch(e){} return r; };
document.addEventListener('DOMContentLoaded', () => setTimeout(() => { try{ tpTidy(); }catch(e){} }, 60));
window.__tp = { tidy:tpTidy, main:TP_MAIN };
}
