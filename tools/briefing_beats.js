// every beat of each briefing page (not What a fare does), played as a pupil plays it: Next after each beat finishes;
// a decision is made with the named chip (or the first); one screenshot per stop
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const DIR = '/home/user/Airline-Simulator-Maths-Game/src/opening/briefings', OUT = process.argv[2], VW = +(process.argv[3] || 1366), VH = +(process.argv[4] || 768);
const PAGES = [
  { id:'rival_split', file:'briefing-rival.html' }, { id:'full_route', file:'briefing-capacity.html' },
  { id:'weekend_demand', file:'briefing-weekend.html', pick:['Change weekdays and weekends separately'] }, { id:'fuel_cash_tank_profit', file:'briefing-fuel.html' },
  { id:'aircraft_efficiency', file:'briefing-efficiency.html' }, { id:'flight_time', file:'briefing-time.html' },
  { id:'event_weekend', file:'briefing-event.html', pick:['Change one particular date'] }, { id:'seasons', file:'briefing-seasons.html', pick:['Plans that switch with the season'] },
  { id:'lease_money', file:'briefing-lease.html' }, { id:'cash_to_fly', file:'briefing-cash-to-fly.html' }, { id:'profit_vs_cash', file:'briefing-cash.html' } ];
const kit = p => p.evaluate(() => ({ w:K.waiting(), h:K.held(), n:K.beats(), cap:(document.querySelector('.bk-cap') || {}).textContent || '' }));
const settle = async p => { for(let g = 0; g < 400; g++){ const k = await kit(p); if(k.w || k.h || await p.$('.bk-pz[style*="grid"]')) return k; await p.waitForTimeout(150); } return kit(p); };
(async () => { const b = await chromium.launch(), out = [];
  for(const P of PAGES){ const p = await b.newPage({ viewport:{ width:VW, height:VH } }), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + path.join(DIR, P.file)); await p.waitForSelector('.bk-title', { timeout:8000 });
    const title = await p.textContent('.bk-title'), shots = [], picks = (P.pick || []).slice(); let n = 0;
    const shot = async note => { await p.waitForTimeout(500); const f = `${P.id}-${String(++n).padStart(2, '0')}.png`; await p.screenshot({ path:path.join(OUT, f) }); shots.push({ f, note, cap:((await kit(p)).cap || '').replace(/\s+/g, ' ').trim() }); };
    try{ for(let g = 0; g < 200; g++){
        if(await p.$('.bk-pz[style*="grid"]')) break; const k = await settle(p);
        if(k.h){ await shot('A choice to make'); const want = picks[0], chip = want ? await p.$(`.bk-chip:has-text("${want}"):visible`) : null;
          if(chip){ picks.shift(); await chip.click(); await p.waitForTimeout(400); continue; }
          const c = await p.$('.bk-card [data-c="no"]:visible') || await p.$('.bk-act.sec:not([hidden]):not([disabled])') || await p.$('.bk-act:not([hidden]):not([disabled])') || await p.$('.bk-chip:visible');
          if(c){ await c.click(); await p.waitForTimeout(400); } continue; }
        if(k.w){ await shot(''); await p.click('.bk-go'); await p.waitForTimeout(150); continue; } }
      await shot('The end');
    }catch(e){ errs.push(e.message.split('\n')[0]); }
    out.push({ id:P.id, title, shots, errs }); console.log(P.id, title, shots.length, errs.length ? errs : ''); await p.close(); }
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(out, null, 1)); await b.close(); })();
