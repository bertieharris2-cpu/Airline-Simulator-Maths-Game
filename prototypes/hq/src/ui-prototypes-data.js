/* Mock data for the HQ prototypes. Game-scale numbers (a growing airline in round 14),
   so the panels can be wired to the real game state later without changing their shape. */
const DATA = {
  airline: { name:'Nimbus Air', tagline:'People · Places · A brighter tomorrow', hub:{ code:'CWL', city:'Cardiff', lat:51.48, lon:-3.18, side:'b' } },
  clock: { round:14, week:14, day:'Tue', date:'14 May', time:'07:45', weather:'Sunny, 17°C' },
  cash: 48250, reputation: 4.0, flightsToday: 9, passengersToday: 291,
  kpi: {
    revenue:     { label:'Revenue this round', value:25310, prev:22520, money:true,  good:'up',   icon:'coins' },
    profit:      { label:'Profit this round',  value:14150, prev:11990, money:true,  good:'up',   icon:'chart' },
    fuel:        { label:'Fuel costs',          value:4180,  prev:3940,  money:true,  good:'down', icon:'fuel' },
    satisfaction:{ label:'Passenger satisfaction', value:89, prev:86, unit:'%', good:'up', icon:'smile' }
  },
  history: {   // rounds 3–14
    rounds:  [3,4,5,6,7,8,9,10,11,12,13,14],
    revenue: [9200,10400,11100,12800,13900,15200,16800,18400,19900,21300,22520,25310],
    costs:   [5200,5600,6100,6600,7100,7500,8200,8900,9400,10100,10530,11160],
    fuelCost:[1400,1520,1650,1800,1990,2150,2480,2900,3210,3520,3940,4180],
    passengers:[96,110,118,134,150,166,184,205,226,247,262,291],
    satisfaction:[78,79,81,80,82,84,83,85,86,85,86,89],
    fuelPrice:[1.20,1.25,1.40,1.40,1.55,1.48,1.70,3.00,1.85,1.60,1.84,1.95]
  },
  routes: [
    { code:'MAD', city:'Madrid',    lat:40.42, lon:-3.70, plane:'Embraer E190', trips:1, seats:100, sold:81, fare:110, cost:4300, trend:+12, demand:96 },
    { code:'AMS', city:'Amsterdam', side:'t', lat:52.37, lon:4.90,  plane:'ATR 72',      trips:1, seats:70,  sold:58, fare:90,  cost:1900, trend:+6,  demand:58 },
    { code:'DUB', city:'Dublin', side:'l', lat:53.35, lon:-6.26, plane:'Saab 340',    trips:2, seats:68,  sold:64, fare:60,  cost:1720, trend:+8,  demand:71 },
    { code:'CDG', city:'Paris',     lat:48.86, lon:2.35,  plane:'Twin Otter',  trips:2, seats:38,  sold:36, fare:100, cost:1030, trend:+4,  demand:44 },
    { code:'BER', city:'Berlin',    lat:52.52, lon:13.40, plane:'Saab 340',    trips:1, seats:34,  sold:22, fare:95,  cost:1450, trend:-5,  demand:22 },
    { code:'EDI', city:'Edinburgh', lat:55.95, lon:-3.19, plane:'Twin Otter',  trips:2, seats:38,  sold:30, fare:55,  cost:760,  trend:-3,  demand:30 }
  ],
  opportunities: [
    { code:'FCO', city:'Rome',      lat:41.90, lon:12.50, tag:'High demand',   est:4200, people:60, sky:'rome' },
    { code:'BCN', city:'Barcelona', lat:41.39, lon:2.17,  tag:'Strategic fit', est:3900, people:52, sky:'bcn' },
    { code:'RAK', city:'Marrakech', lat:31.63, lon:-8.00, tag:'Underserved',   est:3600, people:45, sky:'rak' }
  ],
  fleet: {
    types: [
      { name:'DHC-6 Twin Otter', short:'Twin Otter', seats:19,  count:3, service:2, maint:1, grounded:0, util:78, kind:'prop' },
      { name:'Saab 340',         short:'Saab 340',   seats:34,  count:2, service:2, maint:0, grounded:0, util:84, kind:'prop' },
      { name:'ATR 72',           short:'ATR 72',     seats:70,  count:1, service:1, maint:0, grounded:0, util:71, kind:'prop' },
      { name:'Embraer E190',     short:'E190',       seats:100, count:1, service:1, maint:0, grounded:0, util:66, kind:'jet' }
    ],
    onOrder: { name:'Airbus A220', count:1, arrives:'Round 16' }
  },
  fuel: { capacity:9500, stock:6200, todayUse:3850, priceToday:1.95, avgPaid:1.62 },
  ops: { ready:6, boarding:1, delayed:1, grounded:0 },
  departures: [
    { time:'07:00', flight:'NB101', to:'Dublin',    code:'DUB', gate:'A1', status:'Departed' },
    { time:'07:30', flight:'NB201', to:'Paris',     code:'CDG', gate:'A2', status:'Boarding' },
    { time:'08:15', flight:'NB301', to:'Amsterdam', code:'AMS', gate:'B1', status:'On time' },
    { time:'09:00', flight:'NB401', to:'Madrid',    code:'MAD', gate:'B3', status:'Delayed 20m' },
    { time:'09:30', flight:'NB501', to:'Edinburgh', code:'EDI', gate:'A3', status:'On time' },
    { time:'10:00', flight:'NB601', to:'Berlin',    code:'BER', gate:'B2', status:'On time' }
  ],
  arrivals: [
    { time:'08:35', flight:'NB102', from:'Dublin',    code:'DUB', belt:'1', status:'Landing' },
    { time:'09:10', flight:'NB202', from:'Paris',     code:'CDG', belt:'2', status:'On time' },
    { time:'10:20', flight:'NB302', from:'Amsterdam', code:'AMS', belt:'1', status:'On time' },
    { time:'11:05', flight:'NB502', from:'Edinburgh', code:'EDI', belt:'3', status:'On time' },
    { time:'13:40', flight:'NB402', from:'Madrid',    code:'MAD', belt:'2', status:'Delayed 20m' }
  ],
  alerts: [
    { kind:'warn', icon:'fuel',   title:'Fuel price up 6%',               sub:'£1.95 a litre today. You paid £1.62 on average.', time:'08:05' },
    { kind:'good', icon:'users',  title:'High demand on Paris',           sub:'36 of 38 seats sold. Is it time for another trip?', time:'07:40' },
    { kind:'maint',icon:'wrench', title:'Twin Otter G-NMBC in maintenance', sub:'Back in service next round.', time:'Yesterday' },
    { kind:'info', icon:'pin',    title:'New route opportunity: Rome',    sub:'About 60 people a day and no airline from Cardiff.', time:'Yesterday' },
    { kind:'info', icon:'plane',  title:'A220 delivery confirmed',        sub:'Arrives in round 16.', time:'2 rounds ago' }
  ],
  decision: { title:"Today's decision", text:'Fuel has gone up to £1.95 a litre. Carry on, top up, or stock up before it rises again?' },
  objectives: [
    { label:'Grow to 8 planes',        cur:7,     goal:8,     fmt:'n' },
    { label:'Fly to 8 destinations',   cur:6,     goal:8,     fmt:'n' },
    { label:'Reach a 4.5★ reputation', cur:4.0,   goal:4.5,   fmt:'star' },
    { label:'Save £60,000',            cur:48250, goal:60000, fmt:'£' }
  ],
  ratings: [ { label:'Service', v:4.6 }, { label:'Value', v:4.5 }, { label:'On time', v:4.4 }, { label:'Comfort', v:4.1 } ],
  weather: [ { lat:47.5, lon:-9.5, r:26, label:'Storm cells' }, { lat:44.5, lon:9.5, r:18, label:'Showers' } ]
};
