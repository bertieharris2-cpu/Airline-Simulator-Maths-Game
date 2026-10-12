/* ==================================================================
   THE DESK SHELL (Bertie's three reference screens, 12 Oct 2026): a dark aviation interface on a 1680 × 940 canvas
   scaled to fit the window. A 94 px header (the airline's mark and name, a banner of an airliner over a dark world map,
   week and date, reputation stars, a gold coin stack and the cash) and a 220 px left nav of eight desks, each a line icon,
   a label and a subtitle, with an airliner at dusk filling the rail's foot. The pictures are drawn (SVG stand-ins for
   photographs; Wikimedia is not reachable from here) and can be swapped for photos later.
   ================================================================== */
const DESK_W = 1680, DESK_H = 940;
let DESK_ART_N = 0; const artId = p => `dk${p}${++DESK_ART_N}`;

/* ---------- line icons (24 × 24, stroke = currentColor) ---------- */
const DI = (d, extra) => `<svg class="di" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra || ''}>${d}</svg>`;
const ICO2 = {
  home: DI('<path d="M3 11.2 12 4l9 7.2"/><path d="M5.5 9.6V20h4.8v-5.6h3.4V20h4.8V9.6"/>'),
  route: DI('<path d="M2.5 13.5 21 6.5l-4.6 13.2-3.7-5.3-5.6 2.1 1.9-3.1z"/><path d="M12.7 14.4 21 6.5"/>'),
  model: DI('<path d="M3 19h18"/><path d="M5 16v-4M9.5 16V8M14 16v-6M18.5 16V5"/><path d="m4 9 5-4 5 3 6-5"/>'),
  globe: DI('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/><path d="M4.8 7.2h14.4M4.8 16.8h14.4"/>'),
  plane: DI('<path d="M21 12.2c0-.8-.6-1.3-1.5-1.3H14L9 3H6.7l2.7 7.9H5.2L3.5 8.6H2l1 3.6-1 3.6h1.5l1.7-2.3h4.2L6.7 21H9l5-7.9h5.5c.9 0 1.5-.5 1.5-.9z"/>'),
  fuel: DI('<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M3 21h12"/><path d="M6.5 7h5v4h-5z"/><path d="M14 9h2.2a1.8 1.8 0 0 1 1.8 1.8V17a1.5 1.5 0 0 0 3 0V8.5L18 5.5"/>'),
  pound: DI('<circle cx="12" cy="12" r="9"/><path d="M14.8 8.2a2.8 2.8 0 0 0-5 1.7V16h5.4M8.6 12.6h4.6M8.6 16h1.2"/>'),
  medal: DI('<circle cx="12" cy="8.5" r="5.5"/><path d="m8.6 13 -2.1 8 5.5-2.6 5.5 2.6-2.1-8"/><path d="m12 6 .9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z"/>'),
  bars: DI('<path d="M3 21h18"/><path d="M5.5 21v-7h3v7M10.5 21V9h3v12M15.5 21V5h3v16"/>'),
  calendar: DI('<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M7 13h2M11 13h2M15 13h2M7 16.5h2M11 16.5h2M15 16.5h2"/>'),
  bulb: DI('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.8 10.6c.7.6 1.1 1.4 1.1 2.3V16h5.4v-.1c0-.9.4-1.7 1.1-2.3A6 6 0 0 0 12 3z"/>'),
  back: DI('<path d="M20 12H5M11 5l-7 7 7 7"/>'),
  ext: DI('<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  chev: DI('<path d="m9 5 7 7-7 7"/>'),
  info: DI('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
  clock: DI('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9.5 2.5h5"/>'),
  seat: DI('<path d="M7 3v9a3 3 0 0 0 3 3h6l2 6M7 12h9"/><path d="M5 21h6"/>'),
  people: DI('<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 13.6a4.5 4.5 0 0 1 5.5 4.4"/>'),
  tower: DI('<path d="M9 21l1-10h4l1 10M8 11h8l1-4H7z"/><path d="M10 7V4h4v3M12 2v2"/>'),
  coin: DI('<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>'),
  tag: DI('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>'),
  cart: DI('<path d="M3 4h2.5l2.2 11h10.5l2-7.5H7"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>'),
  sliders: DI('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
  doc: DI('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 15.5h6M9 9h3"/>'),
  snack: DI('<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
  swap: DI('<path d="M4 8h14l-3-3M20 16H6l3 3"/>'),
  plus: DI('<path d="M12 5v14M5 12h14"/>'),
  dots: DI('<circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/>'),
  arrowUp: DI('<path d="M12 19V5M6 11l6-6 6 6"/>'),
  arrowDown: DI('<path d="M12 5v14M6 13l6 6 6-6"/>'),
  bell: DI('<path d="M12 21a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zM18 16v-5a6 6 0 0 0-12 0v5l-2 2h16z"/>'),
  wall: DI('<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/>'),
  sound: DI('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
  mute: DI('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="m16 9 5 6M21 9l-5 6"/>'),
  menu: DI('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  full: DI('<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>'),
  rig: DI('<path d="M8 21 12 3l4 18M9.6 14h4.8M10.5 9.5h3M7 21h10"/><path d="M12 3v-1"/>'),
  check: DI('<path d="m5 12 4.5 4.5L19 7"/>'),
  lock: DI('<rect x="5" y="11" width="14" height="10" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  cloud: DI('<path d="M7 18a4 4 0 0 1-.5-8 6 6 0 0 1 11.3 1.5A3.3 3.3 0 0 1 17.5 18z"/>'),
  sun: DI('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  news: DI('<path d="M4 5h13v14H5a1 1 0 0 1-1-1z"/><path d="M17 8h3v10a1 1 0 0 1-1 1h-2M7 9h7M7 12h7M7 15h5"/>'),
  barrel: DI('<ellipse cx="12" cy="5.5" rx="6" ry="2.5"/><path d="M6 5.5v13c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-13M6 12c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5"/>'),
  gauge: DI('<path d="M4 17a8 8 0 1 1 16 0"/><path d="m12 17 4-5"/>')
};

/* ---------- drawn art (stand-ins for photographs) ---------- */
/* an airliner in side view, nose to the right, about 300 × 70 units */
function jetSide(o){
  o = Object.assign({ body:'#e9f1fb', belly:'#9fb4cf', tail:'#1f6fe0', win:'#ffd98a', engine:'#c9d6e6', glow:false }, o || {}); const g = artId('jb');
  const wins = Array.from({ length:24 }, (_, i) => `<rect x="${78 + i * 6.6}" y="25.5" width="3.2" height="4.2" rx="1.4" fill="${o.win}"/>`).join('');
  return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.body}"/><stop offset=".55" stop-color="${o.body}"/><stop offset="1" stop-color="${o.belly}"/></linearGradient></defs>
    <path d="M12 27 L64 20 L246 20 Q282 20 297 30.5 Q300 33 296 35.2 Q281 42.5 246 42.5 L64 42.5 L16 34 Z" fill="url(#${g})"/>
    <path d="M12 27 L64 20 L58 20 L26 -24 L8 -24 Z" fill="${o.tail}"/>
    <path d="M16 32 L58 31 L46 39 L12 37 Z" fill="${o.tail}" opacity=".85"/>
    <path d="M128 37 L188 36 L120 58 L98 58 Z" fill="${o.belly}"/>
    <path d="M140 41 h34 a7 7 0 0 1 0 14 h-34 a7 7 0 0 1 0 -14 z" fill="${o.engine}"/><path d="M174 41 a7 7 0 0 1 0 14" fill="none" stroke="#56708f" stroke-width="2"/>
    ${wins}<path d="M272 25.5 l13 .8 l6.5 5.2 l-18.5 0 z" fill="#14294a"/>
    ${o.glow ? '<circle cx="296" cy="33" r="2.4" fill="#fff"/><circle cx="30" cy="-22" r="2" fill="#ff5050"/>' : ''}`;
}
/* the header banner: an airliner climbing over a dark world map with a light trail */
function artBanner(){
  const g = artId('bn'), t = artId('bt'), m = artId('bm');
  return `<svg class="art art-banner" viewBox="0 0 560 94" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
      <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#03112a" stop-opacity="0"/><stop offset=".25" stop-color="#062456"/><stop offset=".75" stop-color="#0a2f6a"/><stop offset="1" stop-color="#03112a" stop-opacity="0"/></linearGradient>
      <linearGradient id="${t}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5fd0ff" stop-opacity="0"/><stop offset="1" stop-color="#bfe9ff" stop-opacity=".9"/></linearGradient>
      <radialGradient id="${m}" cx=".55" cy=".55" r=".6"><stop offset="0" stop-color="#2d7bff" stop-opacity=".45"/><stop offset="1" stop-color="#2d7bff" stop-opacity="0"/></radialGradient></defs>
    <rect width="560" height="94" fill="url(#${g})"/><rect width="560" height="94" fill="url(#${m})"/>
    <g opacity=".6" fill="#1f5fb8" transform="translate(-170 -36) scale(.3)"><use href="#worldShape"/></g>
    <g fill="#9fd4ff" opacity=".8">${Array.from({ length:26 }, (_, i) => `<circle cx="${(i * 97) % 560}" cy="${(i * 53) % 90 + 2}" r="${i % 4 ? .7 : 1.2}"/>`).join('')}</g>
    <path d="M10 92 C150 86 240 72 304 56" stroke="url(#${t})" stroke-width="2" fill="none"/>
    <g transform="translate(300 52) rotate(-12) scale(.38)">${jetSide({ glow:true })}</g></svg>`;
}
/* the rail's foot: an airliner at the gate at dusk, wet tarmac, the tower and the terminal's lights */
function artDusk(){
  const s = artId('ds'), w = artId('dw'), r = artId('dr');
  const lights = Array.from({ length:40 }, (_, i) => `<circle cx="${(i * 37) % 230}" cy="${208 + (i % 5) * 3}" r="${i % 3 ? .9 : 1.4}" fill="${i % 4 ? '#ffd27a' : '#bfe4ff'}"/>`).join('');
  return `<svg class="art art-dusk" viewBox="0 0 220 360" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs>
      <linearGradient id="${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1834"/><stop offset=".38" stop-color="#25305e"/><stop offset=".55" stop-color="#6a3f72"/><stop offset=".66" stop-color="#d9784a"/><stop offset=".7" stop-color="#3a2a48"/></linearGradient>
      <linearGradient id="${w}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2440"/><stop offset="1" stop-color="#050b18"/></linearGradient>
      <linearGradient id="${r}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb46a" stop-opacity=".45"/><stop offset="1" stop-color="#ffb46a" stop-opacity="0"/></linearGradient></defs>
    <rect width="220" height="252" fill="url(#${s})"/>
    <path d="M150 252 V140 h6 v-10 h-3 l2-8 h14 l2 8 h-3 v10 h6 v112 z" fill="#101a30"/><rect x="152" y="123" width="20" height="5" fill="#ffd27a" opacity=".7"/>
    <path d="M0 252 V214 h60 v-8 h70 v8 h90 v38 z" fill="#0d1628"/>${lights}
    <rect y="252" width="220" height="108" fill="url(#${w})"/>
    <rect x="0" y="252" width="220" height="40" fill="url(#${r})" opacity=".55"/>
    <g fill="#ffd27a" opacity=".9">${Array.from({ length:9 }, (_, i) => `<circle cx="${12 + i * 26}" cy="${300 + (i % 2) * 4}" r="1.6"/>`).join('')}</g>
    <g transform="translate(-118 214) scale(.92)">${jetSide({ body:'#dfe8f4', belly:'#7f93ad', tail:'#163e82', win:'#ffcf7a', glow:true })}</g>
    <g transform="translate(-118 330) scale(.92 -.36)" opacity=".18">${jetSide({ body:'#dfe8f4', belly:'#7f93ad', tail:'#163e82', win:'#ffcf7a' })}</g></svg>`;
}
/* a city at dusk: towers with lit windows, a landmark where one fits, a river's reflection */
const LANDMARK = {
  par:'<path d="M150 150 L158 60 L160 30 L162 60 L170 150 Z M153 118 h14 M151 132 h18 M155 96 h10 M146 150 q14 -18 28 0" fill="none" stroke="#0a0f1e" stroke-width="3.2"/><path d="M160 26 v-8" stroke="#ffd27a" stroke-width="1.6"/>',
  dub:'<path d="M120 150 Q170 90 220 150" fill="none" stroke="#0a0f1e" stroke-width="3"/><path d="M170 150 L176 70" stroke="#0a0f1e" stroke-width="4"/>' + Array.from({ length:8 }, (_, i) => `<path d="M176 ${74 + i * 3} L${132 + i * 10} 150" stroke="#0a0f1e" stroke-width=".9"/>`).join(''),
  ams:Array.from({ length:7 }, (_, i) => `<path d="M${104 + i * 18} 150 V${108 - (i % 3) * 6} l9 -10 l9 10 V150 z" fill="#0b1224"/><rect x="${109 + i * 18}" y="${118 - (i % 3) * 6}" width="3" height="4" fill="#ffd27a"/><rect x="${114 + i * 18}" y="${128 - (i % 3) * 6}" width="3" height="4" fill="#ffd27a"/>`).join(''),
  fra:'<path d="M150 150 V52 h16 V150 z M172 150 V70 l10 -10 V150 z M128 150 V82 h14 V150 z" fill="#0b1224"/>',
  gva:'<path d="M0 120 L50 70 L80 96 L120 52 L170 100 L210 74 L260 118 V150 H0 z" fill="#222c4c"/><path d="M50 70 l10 10 l-14 0 z M120 52 l12 12 l-20 2 z" fill="#c8d6ea"/><path d="M160 150 C158 120 159 90 161 64 C163 90 164 120 162 150" fill="#bfe4ff" opacity=".8"/>',
  bcn:'<path d="M140 150 V84 l6 -30 l6 30 V150 z M158 150 V78 l6 -34 l6 34 V150 z M176 150 V86 l6 -26 l6 26 V150 z" fill="#0b1224"/>',
  mad:'<path d="M140 150 V96 h40 V150 z M146 96 q14 -26 28 0 z" fill="#0b1224"/><circle cx="160" cy="68" r="3" fill="#ffd27a"/>',
  mxp:'<path d="M126 150 V100 h70 V150 z' + Array.from({ length:8 }, (_, i) => ` M${128 + i * 9} 100 l2 -22 l2 22 z`).join('') + '" fill="#0b1224"/>',
  fco:'<path d="M110 150 V104 q50 -22 100 0 V150 z" fill="#0b1224"/>' + Array.from({ length:6 }, (_, i) => `<rect x="${118 + i * 15}" y="114" width="6" height="10" rx="3" fill="#ffd27a" opacity=".7"/>`).join('')
};
function artCity(id){
  const s = artId('cs'), w = artId('cw'), lm = LANDMARK[id] || LANDMARK.fra;
  const towers = Array.from({ length:14 }, (_, i) => { const x = i * 22 - 6, h = 30 + ((i * 37) % 44); return `<rect x="${x}" y="${150 - h}" width="${16 + (i % 3) * 3}" height="${h}" fill="#0d1428"/>` + Array.from({ length:Math.floor(h / 9) }, (_, k) => (i + k) % 3 ? '' : `<rect x="${x + 4}" y="${150 - h + 5 + k * 9}" width="3" height="3" fill="#ffcf7a" opacity=".85"/>`).join(''); }).join('');
  return `<svg class="art art-city" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
      <linearGradient id="${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101d44"/><stop offset=".45" stop-color="#3b3a74"/><stop offset=".68" stop-color="#b8607a"/><stop offset=".76" stop-color="#f09a5a"/></linearGradient>
      <linearGradient id="${w}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2f55"/><stop offset="1" stop-color="#070b18"/></linearGradient></defs>
    <rect width="300" height="152" fill="url(#${s})"/>${towers}${lm}
    <rect y="150" width="300" height="50" fill="url(#${w})"/>
    <g opacity=".35">${Array.from({ length:12 }, (_, i) => `<rect x="${i * 26 + 6}" y="${156 + (i % 4) * 7}" width="${10 + (i % 3) * 6}" height="1.6" fill="#ffcf7a"/>`).join('')}</g></svg>`;
}
function artRefinery(){
  const s = artId('rs');
  return `<svg class="art" viewBox="0 0 120 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14224a"/><stop offset=".6" stop-color="#5a3c66"/><stop offset=".8" stop-color="#e08a52"/></linearGradient></defs>
    <rect width="120" height="160" fill="url(#${s})"/><path d="M20 128 V52 h6 V128 M40 128 V30 h7 V128 M60 128 V64 h5 V128 M86 128 V44 h6 V128" stroke="#0b1020" stroke-width="5"/>
    <path d="M43 28 q3 -12 0 -18 q6 6 2 18" fill="#ffb24a"/><ellipse cx="100" cy="112" rx="16" ry="5" fill="#141a2c"/><rect x="84" y="112" width="32" height="18" fill="#141a2c"/><rect y="128" width="120" height="32" fill="#0a0e1c"/>
    <g fill="#ffd27a">${Array.from({ length:16 }, (_, i) => `<circle cx="${8 + i * 7}" cy="${80 + (i * 13) % 44}" r="1"/>`).join('')}</g><g opacity=".4" fill="#ffd27a">${Array.from({ length:10 }, (_, i) => `<rect x="${i * 12 + 4}" y="${136 + (i % 3) * 6}" width="6" height="1.4"/>`).join('')}</g></svg>`;
}
function artWeather(){
  const s = artId('ws');
  return `<svg class="art" viewBox="0 0 120 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c3060"/><stop offset="1" stop-color="#0a1428"/></linearGradient></defs>
    <rect width="120" height="160" fill="url(#${s})"/><path d="M0 132 L30 96 L48 112 L72 82 L120 128 V160 H0 z" fill="#3a4c74"/><path d="M30 96 l8 9 h-14 z M72 82 l10 11 h-18 z" fill="#e6eef8"/>
    <path d="M36 62 a14 14 0 0 1 2 -27 a20 20 0 0 1 38 4 a12 12 0 0 1 4 23 z" fill="#dfe8f5"/>${Array.from({ length:9 }, (_, i) => `<path d="M${42 + i * 4} ${68 + (i % 3) * 4} l-2 6" stroke="#8fc8ff" stroke-width="1.4"/>`).join('')}</svg>`;
}
function artShip(){
  const s = artId('ss');
  return `<svg class="art" viewBox="0 0 120 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${s}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16244e"/><stop offset=".55" stop-color="#7a4a6a"/><stop offset=".62" stop-color="#e59a5c"/><stop offset=".63" stop-color="#1a2440"/><stop offset="1" stop-color="#060b18"/></linearGradient></defs>
    <rect width="120" height="160" fill="url(#${s})"/><path d="M8 96 h104 l-8 14 H16 z" fill="#8a2f2f"/><path d="M8 96 h104 v-4 H8 z" fill="#1c2236"/><rect x="84" y="74" width="16" height="18" fill="#dfe6ef"/><rect x="88" y="66" width="6" height="8" fill="#1c2236"/>
    <g fill="#ffd27a"><circle cx="88" cy="80" r="1"/><circle cx="93" cy="80" r="1"/><circle cx="98" cy="80" r="1"/></g><path d="M20 92 h56" stroke="#3b4762" stroke-width="3"/><g opacity=".4" fill="#ffd27a">${Array.from({ length:8 }, (_, i) => `<rect x="${i * 14 + 6}" y="${118 + (i % 3) * 8}" width="8" height="1.4"/>`).join('')}</g></svg>`;
}
/* Europe, dark, with the airline's routes as glowing lines (for the "route map" card) */
function artEurope(routes){
  const s = artId('es'), X = lon => (lon + 180) * 10, Y = lat => (79 - lat) * 10, h = homeData ? homeData() : { lat:51.47, lon:-0.45 };
  const hx = X(h.lon !== undefined ? h.lon : -0.45), hy = Y(h.lat !== undefined ? h.lat : 51.47);
  const lines = (routes || []).map(r => `<path d="M${hx} ${hy} L${X(r.lon)} ${Y(r.lat)}" stroke="#5fd0ff" stroke-width="5" opacity=".9"/><circle cx="${X(r.lon)}" cy="${Y(r.lat)}" r="9" fill="#bfe9ff"/>`).join('');
  return `<svg class="art art-eu" viewBox="1640 120 520 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><radialGradient id="${s}" cx=".5" cy=".55" r=".7"><stop offset="0" stop-color="#0f3a7a"/><stop offset="1" stop-color="#04122a"/></radialGradient></defs>
    <rect x="1640" y="120" width="520" height="380" fill="url(#${s})"/><g fill="#2a66b8" opacity=".85"><use href="#worldShape"/></g>${lines}<circle cx="${hx}" cy="${hy}" r="12" fill="#ffc23d"/></svg>`;
}
/* the fuel tank: a steel cylinder filled to its level, the litres written on it */
function artTank(pct, big, small){
  const b = artId('tb'), f = artId('tf'), c = artId('tc'), lvl = clamp(pct, 0, 100), top = 34, bot = 196, fy = bot - (bot - top) * lvl / 100;
  return `<svg class="art art-tank" viewBox="0 0 220 230" aria-hidden="true"><defs>
      <linearGradient id="${b}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b4f6e"/><stop offset=".35" stop-color="#9fb3cf"/><stop offset=".6" stop-color="#5d7393"/><stop offset="1" stop-color="#26344d"/></linearGradient>
      <linearGradient id="${f}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0b4fc0"/><stop offset=".4" stop-color="#3d8bff"/><stop offset=".7" stop-color="#1c64e0"/><stop offset="1" stop-color="#0a3c96"/></linearGradient>
      <clipPath id="${c}"><rect x="22" y="${top}" width="176" height="${bot - top}"/></clipPath></defs>
    <ellipse cx="110" cy="${bot}" rx="88" ry="16" fill="#1d2a40"/>
    <rect x="22" y="${top}" width="176" height="${bot - top}" fill="url(#${b})"/>
    <g clip-path="url(#${c})"><rect x="22" y="${fy}" width="176" height="${bot - fy}" fill="url(#${f})"/><ellipse cx="110" cy="${fy}" rx="88" ry="14" fill="#5aa2ff" opacity=".85"/></g>
    <ellipse cx="110" cy="${bot}" rx="88" ry="16" fill="url(#${f})" opacity="${lvl > 0 ? 1 : 0}"/>
    <ellipse cx="110" cy="${top}" rx="88" ry="16" fill="#8ea3c2"/><ellipse cx="110" cy="${top}" rx="80" ry="12" fill="#6f84a5"/>
    ${Array.from({ length:13 }, (_, i) => `<path d="M${32 + i * 13} ${top - 12 + Math.abs(6 - i) * 1.4} v-10" stroke="#9fb3cf" stroke-width="1.2"/>`).join('')}<path d="M30 ${top - 16} Q110 ${top - 34} 190 ${top - 16}" stroke="#9fb3cf" stroke-width="1.4" fill="none"/>
    ${Array.from({ length:7 }, (_, i) => `<path d="M${36 + i * 25} ${top + 6} V${bot - 4}" stroke="#ffffff" stroke-opacity=".08" stroke-width="2"/>`).join('')}
    <text x="110" y="${(top + bot) / 2 + 10}" text-anchor="middle" class="tk-big">${esc(big || '')}</text><text x="110" y="${(top + bot) / 2 + 34}" text-anchor="middle" class="tk-small">${esc(small || '')}</text></svg>`;
}
function artCoins(){
  const g = artId('cg');
  return `<svg class="art art-coins" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9780f"/><stop offset=".45" stop-color="#ffd76a"/><stop offset="1" stop-color="#c58412"/></linearGradient></defs>
    ${[38, 31, 24, 17, 10].map((y, i) => `<path d="M${8 + (i % 2)} ${y} v-5 h30 v5" fill="url(#${g})"/><ellipse cx="${23 + (i % 2)}" cy="${y}" rx="15" ry="4.5" fill="url(#${g})" stroke="#8a5a08" stroke-width=".6"/><ellipse cx="${23 + (i % 2)}" cy="${y - 5}" rx="15" ry="4.5" fill="#ffe08a" stroke="#a46d0c" stroke-width=".6"/>`).join('')}</svg>`;
}

/* ---------- the canvas: 1680 × 940, scaled to fit the window ---------- */
function deskScale(){ const s = Math.min(innerWidth / DESK_W, innerHeight / DESK_H); document.documentElement.style.setProperty('--ds', String(Math.round(s * 10000) / 10000)); }
document.body.classList.add('desk'); deskScale(); addEventListener('resize', deskScale);
/* the stylesheet's screen-size rules answer for the canvas, not the window: a rule written for "wider than 1600" is on, one
   for "shorter than 800" is off, whatever the classroom screen, so the canvas looks the same everywhere */
(function canvasMedia(){
  const test = q => q.split(',').some(part => { const conds = part.match(/\((min|max)-(width|height)\s*:\s*([\d.]+)px\)/g); if(!conds) return /^\s*(all|screen)?\s*$/.test(part.replace(/and/g, ''));
    return conds.every(c => { const m = /\((min|max)-(width|height)\s*:\s*([\d.]+)px\)/.exec(c), v = m[2] === 'width' ? DESK_W : DESK_H, n = +m[3]; return m[1] === 'min' ? v >= n : v <= n; }); });
  for(const sh of document.styleSheets){ let rules; try{ rules = sh.cssRules; }catch(e){ continue; }
    for(const r of rules){ if(r.type !== 4) continue; const q = r.media.mediaText; if(!/(min|max)-(width|height)/.test(q)) continue; try{ r.media.mediaText = test(q) ? 'all' : 'not all'; }catch(e){} } }
})();

/* ---------- the header ---------- */
(function deskHeader(){
  const h = document.querySelector('#control > header.cbar'); if(!h) return;
  h.className = 'dkbar'; h.id = 'cbar';
  h.innerHTML = `<div class="dk-brand"><svg class="fin" id="cLogo" viewBox="0 0 40 40" aria-hidden="true"><use id="cFin" href="#fin-stripe"/></svg><div class="dk-word"><b id="cName">AIRLINE</b><small>PEOPLE · PLACES · POSSIBILITIES</small></div></div>
    <div class="dk-banner">${artBanner()}</div>
    <div class="dkh-tools">
      <button class="dk-ib bell" id="bellBtn" title="Alerts and intelligence" aria-label="Alerts">${ICO2.bell}<sup id="cBell" hidden>0</sup></button>
      <button class="dk-ib" id="wallBtn" title="Operations Wall on this screen (W)" aria-label="Operations Wall">${ICO2.wall}</button>
      <button class="dk-ib" id="soundBtn" aria-pressed="false" title="Sound" aria-label="Sound"><span class="snd-off">${ICO2.mute}</span><span class="snd-on">${ICO2.sound}</span><span class="lbl" hidden></span></button>
      <button class="dk-ib" id="menuBtn" title="Home menu: continue, new game, save code, best runs" aria-label="Home menu">${ICO2.menu}</button>
      <button class="dk-ib" id="presentBtn" title="Full screen (F11 also works)" aria-label="Full screen">${ICO2.full}<span id="fsLbl" hidden></span></button>
    </div>
    <div class="dk-cell dk-date">${ICO2.calendar}<div><span id="cWeek">Week 1</span><b id="cDate">—</b></div></div>
    <div class="dk-cell dk-rep"><div><span>Reputation</span><b id="cStars" class="stars"></b></div></div>
    <div class="dk-cell dk-cash">${artCoins()}<div><span>Cash balance</span><b id="cCash">£0</b></div></div>
    <div hidden><i id="cStrat"></i><i id="cDay"></i><div id="cOps"></div><b id="cFleet"></b><b id="cFuel"></b><button id="shopBtn"></button><button id="fleetBtn"></button></div>`;
})();
function updateTopBar(){
  const nm = String(S.airline.name || 'Airline').trim(), parts = nm.split(/\s+/);
  $('cName').innerHTML = parts.length > 1 ? `${esc(parts.slice(0, -1).join(' '))} <i>${esc(parts[parts.length - 1])}</i>` : esc(nm);
  const d = S.phase === 'setup' ? 1 : (S.day || 1), wk = $('cWeek'); if(wk) wk.textContent = `Week ${weekNo(d)}`;
  $('cDate').textContent = deskDate(d);
  $('cCash').textContent = money(Math.round(S.cash));
  $('cStars').innerHTML = deskStars(S.rep);
  const n = S.phase === 'round' ? intelSituations().length : 0; $('cBell').hidden = !n; $('cBell').textContent = n;
  syncSoundBtn();
}
function syncSoundBtn(){ const b = $('soundBtn'); if(!b) return; const on = typeof opsSoundOn === 'function' && opsSoundOn(); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); b.title = on ? 'Sound on' : 'Sound off'; }
const MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], WD3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function deskDate(d){ const x = calDate(d); return `${WD3[x.getUTCDay()]} ${x.getUTCDate()} ${MON3[x.getUTCMonth()]} ${x.getUTCFullYear()}`; }
function deskStars(rep){ const r = Math.round((rep || 0) * 2) / 2; let h = ''; for(let i = 1; i <= 5; i++) h += r >= i ? '<i class="st on">★</i>' : r >= i - .5 ? '<i class="st half">★</i>' : '<i class="st">★</i>'; return h; }

/* ---------- the nav: eight desks ---------- */
const DESK_NAV = [['overview', 'Home', 'Overview', 'home'], ['plan', 'Operating Plan', 'Routes & Schedule', 'route'], ['network', 'Network', 'Destinations', 'globe'], ['fleet', 'Fleet', 'Aircraft', 'plane'],
  ['fuel', 'Fuel', 'Prices & Supply', 'fuel'], ['finance', 'Finance', 'Costs & Revenue', 'pound'], ['reputation', 'Reputation', 'Customer Feedback', 'medal'], ['reports', 'Reports', 'Performance', 'bars']];
Object.assign(MODULES, { fuel:{ name:'Fuel desk', note:'Opens in week 2', short:'Week 2' }, model:{ name:'Operations Model', note:'Opens in week 2', short:'Week 2' } });
const DESK_STEP_NAV = { fuelDesk:'fuel', svcCard:'plan', model:'model' };
function navActive(){ const t = step().t; if(UI.view) return UI.view; if(DESK_STEP_NAV[t]) return DESK_STEP_NAV[t]; return WS_STEPS.includes(t) ? 'plan' : 'overview'; }
function shell(inner, bar){
  const act = navActive();
  const rows = DESK_NAV.map(([id, l, sub, ic]) => {
    const isModel = id === 'plan' && act === 'model', on = act === id || isModel, locked = !!MODULES[id] && !moduleOn(id), off = locked || (id === 'plan' && !planReachable() && !isModel);
    const label = isModel ? 'Operations Model' : l, small = isModel ? 'Compare Plans' : sub;
    return `<button class="nv ${on ? 'on' : ''} ${locked ? 'locked' : ''} ${isModel ? 'nv-long' : ''}" data-nav="${isModel ? 'model' : id}" title="${esc(locked ? `${label}: ${MODULES[id].note}` : label)}" aria-disabled="${off}" aria-current="${on ? 'page' : 'false'}">${ICO2[isModel ? 'model' : ic]}<span class="nv-t"><b>${label}</b><small>${small}</small></span>${locked ? ICO2.lock : ''}</button>`; }).join('');
  return `<div class="shell dshell ${bar ? 'has-bar' : ''}"><nav class="lnav dnav" aria-label="HQ desks">${rows}<div class="nv-art">${artDusk()}</div></nav><div class="shell-main">${inner}</div>${bar || ''}</div>`;
}
/* a desk page: the title block with up to two info cards, then the desk's own body */
function deskPage(o){
  const cards = (o.cards || []).map(c => `<button class="dp-card ${c.cls || ''}" ${c.id ? `id="${c.id}"` : ''} ${c.attr || ''}><span class="dp-ci">${c.art || ICO2[c.ic] || ''}</span><span class="dp-ct"><b>${c.t}</b><small>${c.s}</small></span><span class="dp-cx">${c.ext ? ICO2.ext : ICO2.chev}</span></button>`).join('');
  return `<div class="dp ${o.cls || ''}"><div class="dp-head"><div class="dp-tt"><h1>${o.title}</h1>${o.sub ? `<p>${o.sub}</p>` : ''}</div>${cards ? `<div class="dp-cards">${cards}</div>` : ''}</div><div class="dp-body">${o.body}</div></div>`;
}
function deskBar(hint, buttons){ return `<footer class="actbar"><span class="ab-i" aria-hidden="true">i</span><p class="ab-hint">${hint || ''}</p><div class="ab-act">${buttons || ''}</div></footer>`; }

/* ---------- the desks that are views (open over any step) ---------- */
function shellView(st){
  const v = UI.view;
  if(v && DESK_STEP_NAV[st.t] === v){ UI.view = null; return false; }   // the desk is today's step: show the step
  if(v && ['reputation', 'reports', 'fuel', 'model'].includes(v)){ if(MODULES[v] && !moduleOn(v)){ UI.view = null; return false; } renderDeskView(v); return true; }
  return shellViewBase(st);
}
function renderDeskView(v){
  if(v === 'fuel' && typeof fuelDeskHtml === 'function'){ renderFuelDesk(true); return; }
  if(v === 'model' && typeof renderModel === 'function'){ renderModel(true); return; }
  let body = '';
  if(v === 'reputation'){
    const rev = (S.history || []).slice().reverse().flatMap(h => (h.reviews || []).map(r => Object.assign({ when:h }, r))).slice(0, 12);
    body = `<div class="rep-g"><section class="dk-pnl rep-score"><div class="dk-pnl-h">${ICO2.medal}<h2>Your rating</h2></div><div class="rep-big"><b>${(Math.round((S.rep || 0) * 2) / 2).toFixed(1)}</b><span class="stars">${deskStars(S.rep)}</span><p>out of 5 stars, from what passengers say after each day's flights.</p></div></section>
      <section class="dk-pnl rep-list"><div class="dk-pnl-h">${ICO2.people}<h2>Customer feedback</h2><span class="grow"></span><span class="sub">the latest first</span></div><div class="rep-rows">${rev.length ? rev.map(r => `<div class="rep-r"><span class="rep-f">${r.face || ''}</span><span class="stars">${deskStars(r.stars)}</span><p>${esc(r.text)}</p><small>${esc(r.when.type === 'setup' ? 'Launch day' : r.when.from === r.when.to ? dateShort(r.when.from) : periodShort(r.when))}</small></div>`).join('') : '<p class="muted">Reviews arrive after the first flights.</p>'}</div></section></div>`;
  }
  if(v === 'reports'){
    const wk = {}; (S.history || []).forEach(h => { if(h.type === 'setup' || h.from === undefined) return; const w = weekNo(h.from); const x = wk[w] || (wk[w] = { w, pax:0, seats:0, rev:0, cost:0, profit:0 }); x.pax += h.pax || 0; x.seats += h.seats || 0; x.rev += h.revenue || 0; x.cost += h.costs || 0; x.profit += h.profit || 0; });
    const rows = Object.values(wk).sort((a, b) => b.w - a.w), mx = Math.max(1, ...rows.map(r => Math.abs(r.profit)));
    body = `<section class="dk-pnl rpt"><div class="dk-pnl-h">${ICO2.bars}<h2>Performance by week</h2><span class="grow"></span><span class="sub">revenue, costs and profit as flown</span></div>
      <table class="dk-t"><thead><tr><th>Week</th><th class="num">Passengers</th><th class="num">Load factor</th><th class="num">Revenue</th><th class="num">Costs</th><th class="num">Profit</th><th class="bar"></th><th class="num">Fuel purchasing advantage</th></tr></thead><tbody>${rows.length ? rows.map(r => { const a = typeof fuelAdvantage === 'function' && deskModeAt((r.w - 1) * 7 + 1) ? fuelAdvantage(r.w) : null;
        return `<tr><td>Week ${r.w} <small>${esc(fmtRange((r.w - 1) * 7 + 1, (r.w - 1) * 7 + 7))}</small></td><td class="num">${num(r.pax)}</td><td class="num">${r.seats ? Math.round(100 * r.pax / r.seats) + '%' : '—'}</td><td class="num">${money(Math.round(r.rev))}</td><td class="num">${money(Math.round(r.cost))}</td><td class="num ${r.profit >= 0 ? 'good' : 'bad'}">${money(Math.round(r.profit))}</td><td class="bar"><i style="width:${Math.round(100 * Math.abs(r.profit) / mx)}%" class="${r.profit >= 0 ? 'pos' : 'neg'}"></i></td><td class="num ${a > 0 ? 'good' : a < 0 ? 'bad' : ''}">${a === null ? '—' : (a > 0 ? '+' : a < 0 ? '−' : '') + money(Math.abs(a))}</td></tr>`; }).join('') : '<tr><td colspan="8" class="muted">The first week appears after Launch Day.</td></tr>'}</tbody></table></section>`;
  }
  const T = { reputation:['Reputation', 'What passengers say about your airline. Full planes, fair fares and on-time flights earn stars.'], reports:['Reports', 'How each week went: passengers, revenue, costs and profit as flown.'] }[v] || [capFirst(v), ''];
  screen().innerHTML = shell(deskPage({ title:T[0], sub:T[1], body }));
}
