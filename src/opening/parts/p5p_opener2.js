/* =====================================================================
   THE WEEK'S PLAN OPENER, BATCH 2 (Claude Design handover 18 Oct: 3.7 Option B "one list of what's changed"; DESIGN.md
   "Desks decided 18 Oct"). Year one only; later weeks keep B1's opener (p4ze).
   - Left: the eyebrow, "Last week's plan is ready to run again.", one line, the four figure tiles and one secondary
     button, Edit plan. Keep plan is in the footer only.
   - Right: "This week", one plain list: the known changes (fuel price, fuel stored, news, the board, a plane with no
     flights) and the operations check (D87), each an icon, the words and a small "›" link where it leads somewhere. The
     check's links run D87's own actions (they open the plan on the change); two tips about the same change share one
     link, on the second.
   - No buttons in either panel apart from Edit plan; no amber left borders.
   ===================================================================== */
/* a change's own button, as a small link: "Fuel desk ›", "Review Dublin services ›" */
function op2Link(act){ return String(act || '').replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/class="btn small"/g, 'class="op2-a"').replace(/\s*<\/button>/g, ' ›</button>').replace(/>\s+/g, '>'); }
function op2Rows(pl, L){
  const rows = s2Changes(pl, L).map(c => `<li class="op2-r"><span class="op2-i">${ICO2[c.ic] || ICO2.info}</span><span class="op2-t">${esc(c.text)}${c.sub ? `<small>${esc(c.sub)}</small>` : ''}</span>${c.act ? `<span class="op2-l">${op2Link(c.act)}</span>` : ''}</li>`);
  const tips = typeof dsCheck === 'function' ? dsCheck(pl, planLines(pl)) : [], lose = tips[0] && tips[0].id === 'plan_loses_money' && tips[1] && tips[0].action && tips[0].action.of === tips[1].id;
  const same = (a, b) => a && b && a.action && b.action && a.action.kind === b.action.kind && (a.route || null) === (b.route || null) && (a.uid === b.uid);
  tips.forEach((h, n) => { const link = !(lose && n === 0) && !same(h, tips[n + 1]);
    rows.push(`<li class="op2-r tip" data-dstip="${h.id}"><span class="op2-i">${ICO2.bulb}</span><span class="op2-t">${esc(h.text)}</span>${link ? `<span class="op2-l"><button class="op2-a" data-dsact="${n}">Edit plan ›</button></span>` : ''}</li>`); });
  return rows.length ? rows.join('') : `<li class="op2-r good"><span class="op2-i">${ICO2.check}</span><span class="op2-t">No known changes this week.</span></li>`;
}
const op2Opener0 = s2Opener;
s2Opener = function(pl, L, hid, changed){
  if(!yearOne()) return op2Opener0.apply(this, arguments);
  const F = s2Fill(L.services || []), away = L.nos || 0, tk = (L.routes || []).reduce((t, x) => t + x.tk, 0);
  const fig = (l, v, sub, cls) => `<div class="s2-of ${cls || ''}"><small>${l}</small><b class="mono">${v}</b>${sub ? `<em>${sub}</em>` : ''}</div>`;
  const card = `<section class="bv-panel s2-oc op2-card"><div class="s2-oh"><span class="bv-eyebrow op2-eb">Week ${weekNo(S.day || 1)} · ${dateShort(S.day || 1)}</span>
      <h2>${changed ? 'Your plan has changes for this week.' : 'Last week\'s plan is ready to run again.'}</h2><p>${changed ? 'Run it from the footer, or carry on editing.' : 'Keep it in the footer, or edit it if something below matters.'}</p></div>
    <div class="s2-ofs">${S2V.split ? `<div class="s2-of s2-ofsp"><small>Seats likely filled</small>${s2SplitHtml()}</div>` : fig('Seats likely filled', `${num(F.sold)} / ${num(F.seats)}`, `${F.pct}%`)}${fig('Turned away', num(away), 'a day', away ? 'warn' : '')}${fig('Average fare', hid.has('revenue') || !F.sold ? '—' : money(Math.round(tk / F.sold)))}${fig('Projected profit', hid.has('profit') ? sumBtn('profit') : money(Math.round(L.v.profit)), hid.has('profit') ? '' : 'a day', L.v.profit >= 0 ? 'good' : 'bad')}</div>
    <div class="op2-act"><button class="bv-btn" id="s2Edit">Edit plan</button></div></section>`;
  const list = `<section class="bv-panel s2-ochg op2-week"><h2>This week</h2><ul class="s2-cl op2-list">${op2Rows(pl, L)}</ul></section>`;
  const plan = `<section class="dk-pnl st-tt s2-tt s2-otl"><div class="st-th"><div><h2>This week's timetable</h2></div>${s2DaySwitch()}<span class="s2-legend">${s2Legend()}</span></div>${s2Lanes(0, pl, L, { locked:true })}</section>`;
  return `<div class="plw st s2 s2-op op2"><div class="s2-otop">${card}${list}</div>${plan}</div>`;
};
