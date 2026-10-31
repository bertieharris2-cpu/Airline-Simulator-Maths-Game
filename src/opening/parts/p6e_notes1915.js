
/* ==================================================================
   BERTIE'S PLAY NOTES OF 30 OCT 2026, 19:15 (Launch Day to Tuesday): the changes that need no discussion. Chapter one only
   (ch1()); the rest of his notes (the Launch Day sheet's order, "One flight, two ways", the end of Launch Day and the
   week) are in docs/Report-for-Claude-Chat-Play-Notes-30-Oct.md for Claude Chat.
   - The chapter page: "chapter one come up and the date", nothing else ("they're just not going to read it").
   - No "Choose where to fly" page: the Studio opens on the timetable, every route the plane can fly in the Add a flight
     tray ("it might mislead the pupils into thinking they can only choose one"). + Add a route still opens the page.
   - The Studio in week one (hand-off 3, the same evening: all of chapter one): no View trade-offs ("we're still introducing them into the game", and its gold count draws
     the eye) and no "ƒ work it out" by the projected profit ("I'm assuming it does the same as Work out my plan").
     Compare aircraft waits until the shop opens (day 15). In chapter one the flight's Service costs button goes ("I
     pressed it and that is an overwhelming page").
   - The Launch Day sheet's title says the job: "Ticket revenue for each flight, at each fare".
   The tray's own look (outlined, not the flights' dark blue, the time under the name) and the swap by dragging are in
   p6c_desks.js; the moving slider on the fare briefing's challenge beat is in briefings/briefing-fare.html.
   ================================================================== */
{
/* hand-off 3 hid them for all of chapter one; hand-off 1c (Bertie, 31 Oct): until the day Settings studioExtrasFrom names ("(day 22)") */
const n15Wk1 = () => { if(!ch1()) return false; const m = /return at the start of week \d+ \(day (\d+)\)/.exec(String(WBS().studioExtrasFrom || '')); return m ? (S.day || 1) < +m[1] : true; };
/* the chapter page */
const n15Chapter0 = R.chapter;
R.chapter = st => {
  n15Chapter0(st); if(!ch1()) return;
  const box = screen().querySelector('.ms-in'), go = box && box.querySelector('#chGo'); if(!box || !go) return;
  const ch = chapterOf(S.day || 1) || CHAPTERS[0] || { chapter:1 }, label = box.querySelector('.label');
  [...box.children].forEach(x => { if(x !== go && x !== label) x.remove(); });
  box.insertAdjacentHTML('afterbegin', `<h1 style="--i:0">Chapter ${esc(String(ch.chapter || 1))}</h1>`);
  if(label){ label.style.setProperty('--i', 1); box.insertBefore(label, go); }
  go.style.setProperty('--i', 2);
};
/* the Studio opens on the timetable, not the route cards */
const n15State0 = s2State;
s2State = function(pl){
  const k0 = UI.s2 && UI.s2.key, U = n15State0.apply(this, arguments);
  if(ch1() && U.key !== k0 && U.mode === 'network' && !pl.fleet.some(x => x.sched.length)) U.mode = 'plan';
  return U;
};
/* the Launch Day sheet's title */
const n15Launch0 = ashLaunchSpec;
ashLaunchSpec = function(){ const sp = n15Launch0.apply(this, arguments); if(ch1() && sp) sp.title = 'Ticket revenue for each flight, at each fare'; return sp; };
/* what goes from the Studio: body classes, so the parts that draw these buttons are left alone */
const n15Render0 = render;
render = function(){ const r = n15Render0.apply(this, arguments);
  try{ const b = document.body.classList; b.toggle('n15-wk1', !!(S && n15Wk1())); b.toggle('n15-ch1', !!(S && ch1()));
    b.toggle('n15-noshop', !!(S && ch1() && typeof shopPlanes === 'function' && !shopPlanes(S.day || 1).length)); }catch(e){}
  return r; };
}
