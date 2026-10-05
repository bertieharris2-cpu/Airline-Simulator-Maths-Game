
/* ==================================================================
   THE WORLD WORKBOOK: its values replace the prototype's, straight after the data loads, so every text built at load
   (day stories, help) already uses them. The rules that use them are in p4h_world.js; see the note there.
   ================================================================== */
const WB = (() => { try { return J('data-workbook'); } catch(e){ return null; } })();
const WBR = WB ? WE.rules(WB) : null;
const roundSchool = x => WE.roundSchool(x);

(function applyWorkbook(){
  if(!WB) return;
  const st = WB.settings || {};
  WB.routes.forEach(w => {
    const r = WORLD.routes.find(x => x.id === w.id); if(!r) return;   // the game's own routes only (Dublin and Paris for now)
    const arch = WB.archetypes.find(a => a.id === w.archetype), F = w.fareOptions.slice();
    Object.assign(r, { wb:true, km:w.km, code:w.airport, alat:w.lat, alon:w.lon, utc:w.utc, basePrice:w.baseFare, fares:F, prices:F.slice(), setupPrices:F.slice(),
      turnaroundMin:w.turnaroundAwayMin, landingFeeAway:w.landingFeeAway, demandAtFare:w.demandAtFare, arch, competition:w.competitionSensitivity,
      blurb:w.story || r.blurb, step:10, growth:0 });
    delete r.profile;
  });
  WB.aircraft.forEach(a => {
    const p = PLANES.find(x => x.id === a.id); if(!p) return;
    Object.assign(p, { wb:true, seats:a.seats, speed:a.speedKmh, range:a.rangeKm, fuelUse:a.fuelPer100Km, hourCost:a.hourlyCost, dayCost:a.dayCost,
      price:a.launchDealPrice || a.listPrice, listPrice:a.listPrice });
  });
  WORLD.homes.forEach(h => {
    const rows = WB.airports.filter(a => a.code === h.code); if(!rows.length) return;
    h.fee = rows[0].landingFee; if(rows[0].demandModifier !== null && rows[0].demandModifier !== undefined) h.demandPct = Math.round(rows[0].demandModifier * 100);
    (h.terminals || []).forEach(t => { const a = rows.find(x => String(x.terminal).toLowerCase() === t.id); if(a){ t.turn = a.turnaroundMin; t.charge = a.passengerCharge; } });
  });
  Object.assign(WORLD, { dayStart:st.airportOpen || WORLD.dayStart, dayEnd:st.airportClose || WORLD.dayEnd, crewCost:WBR.crew, crewDutyMin:WBR.maxDuty, crewPadMin:WBR.pad });
  if(st.startingCash) WORLD.startingCash = st.startingCash;
})();

