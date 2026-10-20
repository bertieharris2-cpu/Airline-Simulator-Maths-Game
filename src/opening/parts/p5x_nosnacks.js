/* =====================================================================
   NO SNACKS IN YEAR ONE (Bertie's briefings review; DESIGN.md of 20 Oct 2026: "Snacks on board are dropped from the game, so
   the Launch Day sheet has no Cabin sales rows"; the workbook's Settings snacksInYearOne, off). From Launch Day to the year-1
   accounts:
   - no snack choice and no snack money: snacksOn() is false and onboardOf() is Nothing on board, so the Studio has no On
     board choice, the Launch Day sheet no Cabin sales rows (its Sums 6 and 7 go, and the later sums number on from 6), and
     the Monday sheets no Cabin sales row;
   - a save from before that carries snacks flies without them (its S.onboard goes back to none);
   - lines that could only read £0 now are left off: On-board sales in the Studio's Money, the Operations Model and a
     service's costs card, and the star rule for free snacks on the Reputation desk;
   - the daily colours that only touch snack sales (a hen party, a birthday cake) give way to another of that day's.
   The workbook's year-one words lost "snacks" too (Calendar day 1, Chapters 1), and the snack supplier event is removed.
   Chapters 3 and 4 keep snacks until Bertie says "extend" (CLAUDE.md): a pupil meets them there as new.
   ===================================================================== */
const nsOff = d => !/^(on|yes|true|1)$/i.test(String(WBS().snacksInYearOne === undefined ? 'off' : WBS().snacksInYearOne).trim()) && yearOne(d === undefined ? simDayNow() : d);

const nsOb0 = onboardOf;
onboardOf = function(){ return nsOff() && ONBOARD.none ? ONBOARD.none : nsOb0.apply(this, arguments); };
const nsOn0 = snacksOn;
snacksOn = function(){ return nsOff() ? false : nsOn0.apply(this, arguments); };
const nsCur0 = currentPlan;
currentPlan = function(){ const p = nsCur0.apply(this, arguments); if(p && p.onboard && p.onboard !== 'none' && nsOff()) p.onboard = 'none'; return p; };
const nsRender0 = render;
render = function(){ try{ if(S && S.onboard && S.onboard !== 'none' && nsOff(S.day || 1)) S.onboard = 'none'; }catch(e){} return nsRender0.apply(this, arguments); };

/* lines that could only read £0 */
const nsIns0 = s2Insights;
s2Insights = function(){ const out = nsIns0.apply(this, arguments);
  if(nsOff() && Array.isArray(out)) out.forEach(g => { if(g && g[0] === 'Money' && typeof g[2] === 'string') g[2] = g[2].replace(/<span><small>On-board sales<\/small><b class="mono">[^<]*<\/b><\/span>/, ''); });
  return out; };
const nsOmTable0 = omPlanTable;
omPlanTable = function(){ const h = nsOmTable0.apply(this, arguments); return nsOff() ? h.replace(/\s*<div class="om-obl">[\s\S]*?<\/div>\s*$/, '') : h; };
const nsOmRes0 = omResults;
omResults = function(){ const h = nsOmRes0.apply(this, arguments); return nsOff() ? h.replace(/<tr class="[^"]*"><th>(?:(?!<\/tr>)[\s\S])*?On-board sales<\/th>[\s\S]*?<\/tr>/, '') : h; };
const nsSvc0 = svcCardHtml;
svcCardHtml = function(){ const h = nsSvc0.apply(this, arguments); return nsOff() ? h.replace(/<div class="sc-li[^"]*"><span>On-board sales[^<]*<\/span><b>[^<]*<\/b><\/div>/, '') : h; };
const nsStars0 = d104StarsCardHtml;
d104StarsCardHtml = function(){ const h = nsStars0.apply(this, arguments); return nsOff() ? h.replace(/<li><b class="up">\+½<\/b><span>once, for free snacks two weeks running<\/span><\/li>/, '') : h; };

/* the snack-only daily colours give way to another of the day's (p5e_colour.js asks, from inside its own block) */
const nsSnackColour = c => /snack|cake trolley/i.test(String(c.effect || '') + ' ' + String(c.line || ''));
const nsSkipColour = (c, d) => nsSnackColour(c) && nsOff(d);

/* the plan step's own words */
['plan'].forEach(k => { let sub = SUB_DESC[k], hint = STEP_HINT[k];
  Object.defineProperty(SUB_DESC, k, { configurable:true, enumerable:true, get:() => nsOff() ? 'Timetable, fares and fuel' : sub, set:v => { sub = v; } });
  Object.defineProperty(STEP_HINT, k, { configurable:true, enumerable:true, get:() => nsOff() ? 'Add services to the timeline and move them, and choose the fares. Then press Cost your plan.' : hint, set:v => { hint = v; } }); });
