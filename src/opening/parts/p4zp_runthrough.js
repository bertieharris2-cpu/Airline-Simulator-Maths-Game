/* ==================================================================
   RUN-THROUGH FIXES (Bertie, 14 Oct 2026, after playing to week three)
   "Even though I had just purchased an aircraft it came up with do you want to buy an aircraft? And I think it should be
   really just down to the pupils choice if the shop is always open. They will access it. They will want more planes.
   They do not need to be offered them." His choice: never offer it; the shop lives on the Fleet desk.
   - The shop is never a step of the day by itself: no shop2 in the week and month beats, on the days new aircraft
     arrive, on the Mondays while saving, or after day 365's sum. It opens only from the Fleet desk's Add an aircraft
     button (or the run board's Aircraft shop), which puts { t:'shop2', adHoc:true } in front of the step he is on.
   - The What's new pages that led into the shop (Madrid's jets on day 22, Going long on day 127, Owning on day 365) lead
     into the plan now, and say where the planes are.
   - On a day new aircraft arrive, HQ's brief says what and where, in place of the shop's own "New today" line.
   - Saving still counts down: on the Fleet desk's shop panel. Buying any aircraft after the saving began ends it.
   The make-it-whole decimal method (the other fix from the same run-through) is in p4y, p4zk, p4zc, p4zi, p4j, p4s, p4t.
   ================================================================== */
const shopScheduled = x => !!x && x.t === 'shop2' && !x.adHoc;
const noShopStep = st => Array.isArray(st) ? st.filter(x => !shopScheduled(x)) : st;
const stepsForRT0 = stepsFor;
stepsFor = function(b){ return noShopStep(stepsForRT0.apply(this, arguments)); };
const dayStepsRT0 = daySteps;
daySteps = function(n, w){ return noShopStep(dayStepsRT0.apply(this, arguments)); };

/* the intros that sat in front of the shop sit in front of the plan, and point to the Fleet desk */
const FLEET_DESK_LINE = 'They are on the Fleet desk: open Fleet, then Add an aircraft, whenever you want one.';
function introToPlan(key, line){ const I = typeof INTRO !== 'undefined' && INTRO[key]; if(!I) return;
  if(I.before === 'shop2') I.before = 'planner';
  if(I.go === 'Look at the aircraft') delete I.go;
  const what0 = I.what; if(typeof what0 === 'function') I.what = function(){ const out = what0.apply(this, arguments); return Array.isArray(out) ? out.concat([[line]]) : out; }; }
introToPlan('jets', 'The two jets are on the Fleet desk from today: open Fleet, then Add an aircraft, whenever you want one.');
introToPlan('longhaul', 'The 757 and the 787 are on the Fleet desk: open Fleet, then Add an aircraft, whenever you want one.');
introToPlan('owning', FLEET_DESK_LINE);
introToPlan('fleet', FLEET_DESK_LINE);

/* HQ's brief on a day new aircraft arrive: what, and where */
function fleetDeskNews(n){ const w = roundData(n), ids = (w && w.unlocks && w.unlocks.planes) || []; if(!ids.length) return '';
  const names = ids.map(id => planeById(id)).filter(Boolean).map(p => p.name.replace(/^DHC-6 /, '')); if(!names.length) return '';
  const list = names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0];
  return `On the Fleet desk from today: ${list}. Open Fleet, then Add an aircraft, when you want one.`; }
const protoBriefRT0 = protoBrief;
protoBrief = function(n){ const L = protoBriefRT0.apply(this, arguments), line = fleetDeskNews(n); if(!line || !Array.isArray(L)) return L;
  const k = L.findIndex(x => /^New today:/.test(x)), out = L.slice(); if(k >= 0) out[k] = line; else out.splice(Math.min(1, out.length), 0, line); return out.slice(0, Math.max(L.length, 2)); };

/* saving: buying any aircraft on a later day ends it (the countdown would be for a plan he changed) */
const waitNowRT0 = waitNow;
waitNow = function(){ const w = S && S.waitFor; if(w && S.fleet.some(f => (f.acquired || 0) > w.from)){ delete S.waitFor; return null; } return waitNowRT0.apply(this, arguments); };

/* an old save: a shop still waiting later in today's steps steps aside, and today's brief gets the Fleet desk line */
function rtShopFix(){
  if(!S || S.phase !== 'round' || !Array.isArray(S.steps)) return;
  for(let k = S.steps.length - 1; k > S.si; k--) if(shopScheduled(S.steps[k])) S.steps.splice(k, 1);
  const line = S.rnd && Array.isArray(S.rnd.brief) && S.day ? fleetDeskNews(S.round) : '';
  if(line && !S.rnd.brief.includes(line)){ const k = S.rnd.brief.findIndex(x => /^New today:/.test(x)); if(k >= 0) S.rnd.brief[k] = line; else S.rnd.brief.splice(Math.min(1, S.rnd.brief.length), 0, line); }
}
const renderRT0 = render;
render = function(){ try{ rtShopFix(); }catch(e){} return renderRT0.apply(this, arguments); };

/* for the tests */
function shopOfferedReport(){ return { scheduled:(S.steps || []).filter(shopScheduled).length, adHoc:(S.steps || []).filter(x => x && x.t === 'shop2' && x.adHoc).length, brief:(S.rnd && S.rnd.brief) || [], waitFor:S.waitFor || null }; }
