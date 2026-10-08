/* ==================================================================
   THE WORLD WORKBOOK: its values replace the prototype's, straight after the data loads, so every text built at load
   (day stories, help) already uses them. The rules that use them are in p4h_world.js; see the note there.
   From workbook v4 the game is built from the sheets: Routes (all of them, opening by unlockDay), Aircraft (with the
   Finance sheet's terms), Catering (the snack options), Airports (home fixed at Heathrow T5) and Settings.
   The Chapters, Calendar and Market sheets pace the game: see p4k_chapter.js.
   ================================================================== */
const WB = (() => { try { return J('data-workbook'); } catch(e){ return null; } })();
const WBR = WB ? WE.rules(WB) : null;
const roundSchool = x => WE.roundSchool(x);
const SET = WB ? (WB.settings || {}) : {};
const CHAPTERS = WB ? (WB.chapters || []) : [];
const FINANCE = {};                                    // the Finance sheet by the game's aircraft id
const FLAG_BY_COUNTRY = { Ireland:'ie', France:'fr', Netherlands:'nl', 'The Netherlands':'nl', Germany:'de', Switzerland:'ch', Spain:'es', Morocco:'ma', Belgium:'be', Italy:'it',
  Portugal:'pt', Greece:'gr', Turkey:'tr', Türkiye:'tr', Scotland:'sco', 'United Kingdom':'uk', UK:'uk', England:'uk', Iceland:'is', Egypt:'eg', USA:'us', 'United States':'us',
  UAE:'ae', 'United Arab Emirates':'ae' };
function capFirst(s){ s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
function shareWords(x){ return x >= 0.999 ? 'Everyone' : x === 0.5 ? 'Half of passengers' : Number.isInteger(x * 10) ? `${Math.round(x * 10)} in 10 passengers` : `${Math.round(x * 100)}% of passengers`; }

(function applyWorkbook(){
  if(!WB) return;
  const st = SET;
  /* routes: the workbook's list replaces the prototype's; each opens on its unlockDay (p4k: routeOpen) */
  const oldR = WORLD.routes.slice(); WORLD.routes.length = 0;
  WB.routes.forEach((w, k) => {
    const o = oldR.find(x => x.id === w.id) || {}, arch = WB.archetypes.find(a => a.id === w.archetype) || null, F = w.fareOptions.slice();
    const r = Object.assign({}, o, { id:w.id, city:w.city, country:w.country, flag: FLAG_BY_COUNTRY[w.country] || o.flag || 'uk', wb:true, km:w.km, code:w.airport,
      lat:w.lat, lon:w.lon, alat:w.lat, alon:w.lon, utc:w.utc || 0, basePrice:w.baseFare, fares:F, prices:F.slice(), setupPrices:F.slice(), step: F.length > 1 ? F[1] - F[0] : 10,
      turnaroundMin:w.turnaroundAwayMin, landingFeeAway:w.landingFeeAway, demandAtFare:w.demandAtFare, arch, archId:w.archetype, competition:w.competitionSensitivity,
      blurb:w.story || o.blurb || '', openDay:w.unlockDay || 1, growth:0, gate:o.gate || String(1 + (k % 6)), dep:o.dep || '09:00',
      band: w.km > 3000 ? 'long' : w.km > 1500 ? 'medium' : 'short', status:w.status });
    delete r.profile; delete r.unlockPhase;
    WORLD.routes.push(r);
  });
  /* aircraft: the workbook's list, in shop order, with the Finance sheet's terms */
  const oldP = PLANES.slice(); PLANES.length = 0;
  const makerOf = n => /Twin Otter/.test(n) ? 'De Havilland Canada' : /Saab/.test(n) ? 'Saab' : /ATR/.test(n) ? 'ATR' : /Embraer/.test(n) ? 'Embraer' : /Airbus/.test(n) ? 'Airbus' : /Boeing/.test(n) ? 'Boeing' : '';
  WB.aircraft.slice().sort((a, b) => (a.shopFromDay || 1) - (b.shopFromDay || 1) || a.listPrice - b.listPrice).forEach(a => {
    const o = oldP.find(x => x.id === a.id) || oldP.find(x => /jet/.test(a.tier || '') && x.id === 'e190') || {};
    const fin = (WB.finance || []).find(f => f.aircraft === a.id) || null;
    PLANES.push(Object.assign({}, o, { id:a.id, name:a.name, wb:true, seats:a.seats, speed:a.speedKmh, range:a.rangeKm, fuelUse:a.fuelPer100Km, hourCost:a.hourlyCost, dayCost:a.dayCost,
      price: a.launchDealPrice || (fin && fin.cashPrice) || a.listPrice, listPrice:a.listPrice, launchDealPrice:a.launchDealPrice || null, shopFromDay:a.shopFromDay || 1,
      tier: a.tier ? capFirst(a.tier) : (o.tier || ''), fact:a.identity || o.fact || '', icon:o.icon || 'jet', maker:o.maker || makerOf(a.name), tankAdd:o.tankAdd || 0,
      runCost:o.runCost || 0, typicalProfit:o.typicalProfit || 0, minReputation:null, status:a.status,
      artworkId:a.artworkId || o.artworkId || null, photoFile:a.photoFile || null, photoCredit:a.photoCredit || null, photoLicence:a.photoLicence || null, photoSource:a.photoSource || null }));   // CR5: the drawing and the showroom photo
    if(fin) FINANCE[a.id] = fin;
  });
  /* home: fixed at Heathrow Terminal 5 (workbook Settings homeAirport) */
  const lhr = WORLD.homes.find(h => h.id === 'lhr') || WORLD.homes[0];
  WORLD.homes.length = 0; WORLD.homes.push(lhr);
  if(lhr.terminals) lhr.terminals = lhr.terminals.filter(t => t.id === 't5');
  WORLD.homes.forEach(h => {
    const rows = WB.airports.filter(a => a.code === h.code); if(!rows.length) return;
    h.fee = rows[0].landingFee; if(rows[0].demandModifier !== null && rows[0].demandModifier !== undefined) h.demandPct = Math.round(rows[0].demandModifier * 100);
    (h.terminals || []).forEach(t => { const a = rows.find(x => String(x.terminal).toLowerCase() === t.id); if(a){ t.turn = a.turnaroundMin; t.charge = a.passengerCharge; } });
  });
  /* catering: the Catering sheet is the snack menu */
  if(WB.catering && WB.catering.length){
    Object.keys(ONBOARD).forEach(k => delete ONBOARD[k]);
    WB.catering.forEach(c => {
      const sells = c.sellingPrice > 0, free = !sells && c.freeCostPerPassenger > 0;
      ONBOARD[c.id] = { id:c.id, label:c.name, price: sells ? c.sellingPrice : undefined, share: sells ? c.takeUp : undefined, costItem: sells ? c.unitStockCost : undefined,
        free, costPax: free ? c.freeCostPerPassenger : undefined, notes:c.notes || '',
        sub: free ? `${money(c.freeCostPerPassenger)} a passenger · happier passengers` : sells ? `${shareWords(c.takeUp)} buy · stock costs ${money(c.unitStockCost)} an item` : 'No extra money, no extra cost' };
    });
    if(!ONBOARD.none) ONBOARD.none = { id:'none', label:'Nothing on board', sub:'No extra money, no extra cost' };
  }
  /* settings */
  Object.assign(WORLD, { dayStart:st.airportOpen || WORLD.dayStart, dayEnd:st.airportClose || WORLD.dayEnd, crewCost:WBR.crew, crewDutyMin:WBR.maxDuty, crewPadMin:WBR.pad,
    fuelLot: st.fuelLotLitres || WORLD.fuelLot, turnaroundMin: st.homeTurnaroundMin || WORLD.turnaroundMin, cashReserve: st.cashReserve !== undefined ? st.cashReserve : 0,
    startDate: st.startDate, gameEndDate: st.gameEndDate, settings: st });
  if(st.startingCash) WORLD.startingCash = st.startingCash;
  if(st.startingReputation) WORLD.startingReputation = st.startingReputation;
})();
