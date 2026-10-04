# Theme tokens and layouts for the four HQ options. build.py turns each into a standalone HTML file.
LOGO = '''<svg class="logo" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--logo-a)"/><stop offset="1" stop-color="var(--logo-b)"/></linearGradient></defs>
<path d="M4 40 C18 18 38 10 60 8 C44 16 30 26 22 40 Z" fill="url(#lg1)"/><path d="M14 46 C26 32 40 24 58 20 C44 28 34 36 28 46 Z" fill="url(#lg1)" opacity=".75"/><path d="M24 52 C32 44 42 38 56 32 C46 40 40 46 36 52 Z" fill="url(#lg1)" opacity=".5"/></svg>'''

def brand(name, tag): return f'<div class="brand">{LOGO}<div><b>{name}</b><small>{tag}</small></div></div>'

NAV = [('home','HQ',''),('plane','Operations','Flights and delays'),('route','Fleet','Aircraft and orders'),('globe','Network','Routes and hubs'),('chart','Finance','Costs and profit'),('users','Staff','Crew and morale'),('megaphone','Marketing','Brand and prices'),('target','Strategy','Goals and growth')]
def nav(sub=False, extra=''):
    items = ''.join(f'<a href="#" class="{"on" if i==0 else ""}"><span data-icon="{ic}"></span><span>{lab}{f"<small>{s}</small>" if sub and s else ""}</span></a>' for i,(ic,lab,s) in enumerate(NAV))
    items = items.replace('data-icon="route"', 'data-icon="plane"', 1) if False else items
    return f'<nav class="nav" aria-label="Main">{items}<hr><a href="#"><span data-icon="mail"></span><span>Messages</span><span class="nb">3</span></a><a href="#"><span data-icon="trophy"></span><span>Achievements</span></a>{extra}</nav>'

def panel(title, w, extra_ph='', attrs='', cls='', body_cls=''):
    return f'<section class="panel {cls}"><div class="ph"><h2>{title}</h2><span class="grow"></span>{extra_ph}</div><div class="pb {body_cls}"><div {attrs} style="display:contents"></div>{w}</div></section>'

def W(name, **kw):
    a = ' '.join(f'data-{k}="{v}"' for k,v in kw.items())
    return f'<div data-w="{name}" {a}></div>'

# ---------------------------------------------------------------- 01 MID-BLUE
T1 = '''
:root{--r:12px;--page:#0f2c55;--bar:rgba(8,28,60,.88);--nav:rgba(9,31,64,.72);--panel:rgba(24,62,118,.62);--panel-solid:#173e74;--inset:rgba(8,28,58,.45);--chip:rgba(10,34,70,.78);--tip:#0d2a55;
--line:rgba(140,200,255,.22);--line-hi:rgba(140,210,255,.55);--line-soft:rgba(140,200,255,.12);--text:#f3f8ff;--muted:#b4cbea;--h-color:#eaf4ff;--h-ls:0;--h-tt:none;
--accent:#56c5ff;--accent-2:#9fdcff;--accent-soft:rgba(86,197,255,.15);--on-accent:#061f3f;--money:#ffd166;--good:#4ade80;--warn:#fbbf24;--bad:#ff9e9e;--star:#ffd166;
--cta:linear-gradient(135deg,#ffd166,#ffae1f);--cta-text:#1b1300;--cta-shadow:0 6px 26px rgba(255,190,60,.35),inset 0 1px 0 rgba(255,255,255,.5);
--shadow:0 10px 30px rgba(3,14,35,.35),inset 0 1px 0 rgba(255,255,255,.07);
--ocean:#0a2a52;--land:#1e518a;--land-edge:rgba(150,210,255,.45);--border:rgba(170,215,255,.28);--grat:rgba(140,200,255,.09);--route:#7ad8ff;--route-mid:#3f93db;--route-lo:#7d8fa8;--route-glow:drop-shadow(0 0 3px #4fc3ff);--route-dash:none;--opp:#ffd166;--plane-map:#ffffff;--hub:#ffd166;--dest:#7ad8ff;--map-label:#ffffff;--map-label-shadow:0 1px 4px rgba(0,10,30,.9);
--s1:#3a95f0;--s2:#d95926;--s3:#1fa877;--chart-surface:#173e74;--grid:rgba(160,200,255,.15);--track:rgba(160,200,255,.16);--track-strong:#35588a;--bar-fill:linear-gradient(90deg,#3a95f0,#7ad8ff);--ring:#56c5ff;
--kpi-spark:#7ad8ff;--kpi-spark-cost:#ff9b6b;--fuel-keep:#2f80d2;--fuel-use:#ffd166;--plane-body:#f3f7fc;--plane-tail:#2f88e2;--plane-wing:#b7c5d6;--plane-win:#173a66;
--nav-text:#cfe0f6;--nav-on:linear-gradient(90deg,rgba(86,197,255,.32),rgba(86,197,255,.08));--nav-on-text:#fff;--nav-on-shadow:inset 3px 0 0 #56c5ff;--logo-a:#9fe2ff;--logo-b:#2f7fe0;--sky-a:#ffb46b;--sky-b:#2f548f;--sky-city:#0c2244}
body{background:radial-gradient(1200px 700px at 75% -10%,rgba(86,197,255,.20),transparent 60%),radial-gradient(900px 600px at 0% 100%,rgba(47,127,224,.22),transparent 60%),linear-gradient(160deg,#123566,#0d2a52 55%,#0b2549)}
.panel{backdrop-filter:blur(10px)}
.app{grid-template-columns:15rem 1fr;grid-template-rows:auto 1fr;height:100vh}
.topbar{grid-column:1/-1}
.main{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));grid-template-rows:auto minmax(0,1.2fr) minmax(0,1fr);gap:.9rem;padding:.9rem;min-height:0}
.k{grid-column:span 2} .dec{grid-column:span 4} .m-map{grid-column:span 6} .m-fleet{grid-column:span 3} .m-alerts{grid-column:span 3} .m-routes{grid-column:span 5} .m-fin{grid-column:span 4} .m-fuel{grid-column:span 3}
.dec{background:linear-gradient(135deg,rgba(255,209,102,.16),rgba(24,62,118,.62) 60%);border-color:rgba(255,209,102,.4)}
.dec .label{color:#ffd98a}
.nav .promo{margin-top:auto;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);position:relative;height:9rem;background:linear-gradient(180deg,#ff9d5c 0%,#d9677a 35%,#3b3f87 70%,#142a5e)}
.nav .promo svg{position:absolute;left:-1rem;bottom:1.2rem;width:13rem;height:3.6rem}
.nav .promo span{position:absolute;left:.8rem;bottom:.5rem;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:#fff;opacity:.9}
@media (max-width:1500px),(max-height:820px){.app{height:auto}.main{grid-template-rows:auto}.k{grid-column:span 3}.dec{grid-column:span 12}.m-map{grid-column:span 12;height:28rem}.m-fleet,.m-alerts{grid-column:span 6}.m-routes{grid-column:span 12}.m-fin{grid-column:span 7;height:20rem}.m-fuel{grid-column:span 5}.tb-opt{display:none}}
'''
B1 = f'''<div class="app">
<header class="topbar">{brand('SkyHorizon Air','People · Places · A brighter tomorrow')}<span class="tb-sep"></span><b style="font-size:1.4rem;color:var(--accent)">HQ</b><span class="tb-sep"></span>
<div class="tb-item"><span data-icon="sun"></span><div><b>Round 14 · Tue 14 May</b><span>07:45 · Week 14 · Sunny, 17°C</span></div></div>
<div class="sim" aria-label="Sim speed"><button data-speed aria-pressed="false" aria-label="Pause" data-icon="pause"></button><button data-speed aria-pressed="true" aria-label="Play" data-icon="play"></button><button data-speed aria-pressed="false" aria-label="Fast" data-icon="ff"></button></div>
<span class="tb-grow"></span>
<div class="tb-item tb-opt"><span data-icon="globe"></span><div><b>6 destinations</b><span>from Cardiff</span></div></div>
<div class="tb-item tb-opt"><span data-icon="plane"></span><div><b>9 flights today</b><span>291 passengers</span></div></div>
<div class="tb-item"><span data-icon="star"></span><div><b data-w="stars"></b><span>Reputation 4.0</span></div></div>
<button class="iconbtn" aria-label="Notifications"><span data-icon="bell"></span><span class="badge">3</span></button>
<div class="cashpill"><span data-icon="coins" style="color:var(--money)"></span><div><b data-count="48250" data-pre="£">£0</b><span class="label">Cash balance</span></div></div>
<button class="iconbtn" aria-label="Settings"><span data-icon="gear"></span></button></header>
{nav(extra='<div class="promo"><svg viewBox="0 0 220 64"><use href="#side-jet"/></svg><span>Higher · Further</span></div>')}
<main class="main">
<section class="panel k">{W('kpi',k='revenue')}</section><section class="panel k">{W('kpi',k='profit')}</section><section class="panel k">{W('kpi',k='fuel')}</section><section class="panel k">{W('kpi',k='satisfaction')}</section>
<section class="panel dec">{W('decision')}</section>
<section class="panel m-map">{W('map')}</section>
<section class="panel m-fleet"><div class="ph"><h2>Fleet overview</h2><span class="grow"></span><a href="#">View all →</a></div><div class="pb">{W('fleet')}</div></section>
<section class="panel m-alerts"><div class="ph"><h2>Alerts &amp; messages</h2><span class="grow"></span><a href="#">View all →</a></div><div class="pb">{W('alerts',n='3')}</div></section>
<section class="panel m-routes"><div class="ph"><h2>Route performance</h2><span class="grow"></span><a href="#">All routes →</a></div><div class="pb">{W('routes',n='4')}</div></section>
<section class="panel m-fin"><div class="ph"><h2>Financial overview</h2></div><div class="pb">{W('finance')}</div></section>
<section class="panel m-fuel"><div class="ph"><h2>Fuel &amp; operations</h2></div><div class="pb">{W('fuel')}</div></section>
</main></div>'''
for sel in ['[data-w="kpi"]','[data-w="decision"]','[data-w="map"]']: pass
T1 += '.m-fuel .fp-spark{display:none} .m-fuel .pb{gap:.5rem} .dec > [data-w]{height:100%} .k{overflow:visible} .m-map > [data-w]{flex:1;display:flex;flex-direction:column;min-height:0} [data-w="decision"]{display:flex;flex-direction:column;justify-content:center;gap:.5rem;padding:1rem 1.2rem} [data-w="decision"] p{margin:0;font-size:1rem}\n'

# ---------------------------------------------------------------- 02 LIGHT / AIRY
T2 = '''
:root{--r:16px;--page:#eef5ff;--bar:rgba(255,255,255,.82);--nav:#fff;--panel:rgba(255,255,255,.88);--panel-solid:#ffffff;--inset:#f4f8fd;--chip:rgba(255,255,255,.9);--tip:#ffffff;
--line:rgba(30,80,150,.14);--line-hi:rgba(31,111,224,.45);--line-soft:rgba(30,80,150,.08);--text:#0d2547;--muted:#556b8c;--h-color:#0d2547;--h-ls:0;--h-tt:none;
--accent:#1f6fe0;--accent-2:#1f6fe0;--accent-soft:rgba(31,111,224,.09);--on-accent:#fff;--money:#0d2547;--good:#14834f;--warn:#9a5a00;--bad:#d13a3a;--star:#e9a400;
--cta:linear-gradient(135deg,#2b80ef,#1659c4);--cta-text:#fff;--cta-shadow:0 8px 24px rgba(31,111,224,.35);
--shadow:0 10px 30px rgba(30,70,140,.10),0 1px 2px rgba(30,70,140,.06);
--ocean:#d9eafc;--land:#fbfdff;--land-edge:#a9c4e4;--border:#c3d5ea;--grat:rgba(31,111,224,.06);--route:#1f6fe0;--route-mid:#79a9ea;--route-lo:#b4c3d6;--route-glow:none;--route-dash:none;--opp:#e08a00;--plane-map:#1f6fe0;--hub:#0d3d8c;--dest:#1f6fe0;--map-label:#0d2547;--map-label-shadow:0 0 3px #fff,0 0 3px #fff,0 0 6px #fff;
--s1:#2a78d6;--s2:#eb6834;--s3:#1baf7a;--chart-surface:#ffffff;--grid:#e4ecf6;--track:#e6eef8;--track-strong:#cad7e7;--bar-fill:linear-gradient(90deg,#2a78d6,#62a4f0);--ring:#1f6fe0;
--kpi-spark:#2a78d6;--kpi-spark-cost:#eb6834;--fuel-keep:#8fb8ee;--fuel-use:#1f6fe0;--plane-body:#ffffff;--plane-tail:#1f6fe0;--plane-wing:#c4d0de;--plane-win:#2b4a73;
--nav-text:#435a7a;--nav-on:linear-gradient(135deg,#2b80ef,#1659c4);--nav-on-text:#fff;--nav-on-shadow:0 6px 16px rgba(31,111,224,.3);--logo-a:#5fb0ff;--logo-b:#1659c4;--sky-a:#9fd0ff;--sky-b:#e8f3ff;--sky-city:#7d9cc4}
body{background:radial-gradient(1000px 500px at 80% -10%,#cfe5ff,transparent 60%),linear-gradient(180deg,#eaf3ff,#f7fbff)}
.panel{backdrop-filter:blur(14px)}
.topbar{background:var(--bar);backdrop-filter:blur(12px);padding:.7rem 1.4rem}
.brand b{font-size:1.6rem;letter-spacing:.04em;text-transform:none;color:#0d2547} .brand b em{font-style:normal;color:var(--muted);font-weight:400}
.tnav{display:flex;gap:.3rem;margin-left:1.2rem}
.tnav a{display:flex;flex-direction:column;align-items:center;gap:.15rem;padding:.45rem .9rem;border-radius:12px;color:var(--nav-text);text-decoration:none;font-size:.86rem;font-weight:600}
.tnav a .ic{width:1.35rem;height:1.35rem}
.tnav a.on{background:var(--nav-on);color:#fff;box-shadow:var(--nav-on-shadow)}
.app{grid-template-rows:auto 1fr auto;height:100vh}
.main{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));grid-template-rows:minmax(0,1.25fr) minmax(0,1fr);gap:1rem;padding:1rem 1.4rem;min-height:0}
.hero{grid-column:span 3;padding:1.4rem;background:linear-gradient(180deg,#bfe0ff 0%,#e9f4ff 55%,#ffffff);position:relative;overflow:hidden;justify-content:flex-end;gap:.6rem}
.hero::before{content:"";position:absolute;inset:0;background:radial-gradient(180px 60px at 20% 30%,#fff,transparent 70%),radial-gradient(220px 70px at 80% 45%,rgba(255,255,255,.9),transparent 70%),radial-gradient(260px 80px at 40% 62%,rgba(255,255,255,.85),transparent 70%)}
.hero > *{position:relative}
.hero .big-plane{position:absolute;top:3%;right:-14%;width:92%;height:auto;transform:rotate(-8deg);filter:drop-shadow(0 18px 18px rgba(30,70,140,.25))}
.hero h1{margin:0;font-size:1.6rem;line-height:1.15} .hero p{margin:0;color:var(--muted)}
.hero .decision-mini{padding:.7rem .9rem;border-radius:12px;background:rgba(255,255,255,.8);border:1px solid var(--line);font-size:.92rem}
.m-map{grid-column:span 6} .m-right{grid-column:span 3}
.cards{grid-column:1/-1;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:1rem;min-height:0}
.strip{display:flex;align-items:center;gap:.9rem;padding:.8rem 1.4rem 1rem}
.strip .lead{display:flex;align-items:center;gap:.8rem;min-width:15rem} .strip .lead b{display:block;font-size:1.05rem} .strip .lead span{font-size:.82rem;color:var(--muted)}
.qa{flex:1;color:inherit;text-decoration:none;display:flex;align-items:center;gap:.7rem;padding:.75rem .9rem;border-radius:14px;background:#fff;border:1px solid var(--line);box-shadow:var(--shadow);transition:transform .15s}
.qa:hover{transform:translateY(-2px)} .qa .ic{width:1.6rem;height:1.6rem;color:var(--accent)} .qa b{display:block;font-size:.95rem} .qa span{font-size:.78rem;color:var(--muted)}
.netperf{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;text-align:left}
.netperf div{padding:.2rem 0} .netperf .ic{width:1.6rem;height:1.6rem;color:var(--accent)} .netperf b{display:block;font-size:1.6rem} .netperf span{font-size:.78rem;color:var(--muted)}
.cards .panel .pb{gap:.5rem}
.ringrow{display:flex;align-items:center;gap:.8rem}
.ringrow .ring{width:6.5rem;height:6.5rem}
.statline{display:flex;flex-direction:column;gap:.25rem;font-size:.86rem}
.statline span{display:flex;align-items:center;gap:.4rem} .statline i{width:.6rem;height:.6rem;border-radius:50%;display:inline-block}
.bignum{font-size:1.7rem;font-weight:800}
.cards .fin-chart{min-height:7rem}
.cards .kpi{padding:.3rem 0;grid-template-columns:1fr auto}.cards .kpi .kpi-ic{display:none}
@media (max-width:1500px),(max-height:820px){.app{height:auto}.main{grid-template-rows:auto}.hero{grid-column:span 12;min-height:16rem}.hero .big-plane{width:50%;right:2%;top:5%}.m-map{grid-column:span 12;height:26rem}.m-right{grid-column:span 12}.cards{grid-template-columns:repeat(3,minmax(0,1fr))}.cards > .panel{min-height:14rem}.tnav a span{display:none}.strip{flex-wrap:wrap}.qa{flex:1 1 30%}}
'''
B2 = f'''<div class="app">
<header class="topbar">{brand('Nimbus Air <em>HQ</em>','People · Places · A brighter tomorrow')}
<nav class="tnav" aria-label="Main">{''.join(f'<a href="#" class="{"on" if i==0 else ""}"><span data-icon="{ic}"></span><span>{lab}</span></a>' for i,(ic,lab) in enumerate([('home','Overview'),('route','Routes'),('plane','Fleet'),('clock','Operations'),('chart','Finance'),('users','People'),('target','Strategy'),('globe','World')]))}</nav>
<span class="tb-grow"></span>
<div class="tb-item"><span data-icon="sun"></span><div><b>Tue 14 May · 07:45</b><span>Round 14 · Week 14</span></div></div>
<div class="cashpill"><div><b data-count="48250" data-pre="£">£0</b><span class="label">Cash</span></div></div>
<button class="iconbtn" aria-label="Notifications"><span data-icon="bell"></span><span class="badge">3</span></button></header>
<main class="main">
<section class="panel hero"><svg class="big-plane" viewBox="0 0 220 64" aria-hidden="true"><use href="#side-jet"/></svg>
  <span class="label">Good morning, Captain</span><h1>Welcome to Nimbus Air HQ</h1><p>Round 14 · Tuesday 14 May · {''}Sunny over Cardiff</p>
  <div class="decision-mini"><b>Today's decision</b><br>Fuel has gone up to £1.95 a litre. Carry on, top up, or stock up?</div>
  <button class="btn-start">Start the day <span data-icon="arrowR"></span></button></section>
<section class="panel m-map"><div class="ph"><h2>Global network</h2><span class="grow"></span><div class="seg" role="tablist"><button aria-selected="true">Live</button><button aria-selected="false">24h</button><button aria-selected="false">7 rounds</button></div></div><div class="pb" style="padding:0">{W('map')}</div></section>
<section class="panel m-right rt-compact"><div class="ph"><h2>Network performance</h2><span class="grow"></span><span class="muted" style="font-size:.82rem">Today</span></div><div class="pb">
  <div class="netperf"><div><span data-icon="plane"></span><b data-count="9">0</b><span>Flights today</span></div><div><span data-icon="users"></span><b data-count="291">0</b><span>Passengers</span></div><div><span data-icon="pin"></span><b data-count="6">0</b><span>Destinations</span></div></div>
  <h2 style="margin:.4rem 0 0;font-size:1rem">Top routes</h2>{W('routes',n='3')}<a class="link" href="#">View all routes →</a></div></section>
<div class="cards">
 <section class="panel"><div class="ph"><h2>Fleet status</h2></div><div class="pb"><div class="ringrow">{W('ring',k='fleet',small='flying')}</div><div class="statline"><span><i style="background:var(--good)"></i>In service <b style="margin-left:auto">6</b></span><span><i style="background:var(--warn)"></i>Maintenance <b style="margin-left:auto">1</b></span><span><i style="background:var(--bad)"></i>Grounded <b style="margin-left:auto">0</b></span><span><i style="background:var(--accent)"></i>On order <b style="margin-left:auto">1</b></span></div></div></section>
 <section class="panel"><div class="ph"><h2>Passenger demand</h2></div><div class="pb"><span class="bignum good-t">+11%</span><span class="muted" style="font-size:.8rem;margin-top:-.4rem">passengers a day vs last round</span>{W('demand')}</div></section>
 <section class="panel"><div class="ph"><h2>Satisfaction</h2></div><div class="pb">{W('ratings')}</div></section>
 <section class="panel"><div class="ph"><h2>Fuel</h2></div><div class="pb">{W('fuel',ops='no')}</div></section>
 <section class="panel"><div class="ph"><h2>Finance</h2></div><div class="pb">{W('kpi',k='profit')}{W('finance')}</div></section>
 <section class="panel"><div class="ph"><h2>Messages</h2><span class="grow"></span><a href="#">All →</a></div><div class="pb">{W('alerts',n='3')}</div></section>
</div></main>
<div class="strip"><div class="lead"><span data-icon="target" style="color:var(--accent)"></span><div><b>Strategic actions</b><span>Shape the next chapter</span></div></div>
{''.join(f'<a class="qa" href="#"><span data-icon="{ic}"></span><div><b>{t}</b><span>{s}</span></div></a>' for ic,t,s in [('pin','Open new route','Rome looks busy'),('plane','Order aircraft','Grow the fleet'),('coins','Set prices','Compare three prices'),('fuel','Buy fuel','£1.95 a litre today'),('megaphone','Marketing','Win more passengers')])}</div>
</div>'''
T2 += '.cards .panel [data-w="finance"]{flex:1;display:flex;flex-direction:column;min-height:0} .cards .fin-legend{font-size:.72rem;gap:.6rem} .cards .ph-tools{display:none} .cards [data-w="demand"]{flex:1;min-height:0} .cards .tank-key{display:none} .cards .fuel-prices{grid-template-columns:1fr 1fr} .cards .fp-spark{display:none} .m-map [data-w="map"]{flex:1;display:flex;flex-direction:column;min-height:0;height:100%} .m-map .map-stats{display:none} .m-map .pb{flex:1}\n'

# ---------------------------------------------------------------- 03 DARK PREMIUM
T3 = '''
:root{--r:6px;--page:#0c0f14;--bar:#0e1218;--nav:#0f131a;--panel:#141922;--panel-solid:#141922;--inset:#10141b;--chip:rgba(16,20,27,.86);--tip:#1a2030;
--line:rgba(214,178,94,.16);--line-hi:rgba(214,178,94,.5);--line-soft:rgba(255,255,255,.06);--text:#eef1f5;--muted:#a3adbb;--h-color:#e9edf3;--h-ls:.14em;--h-tt:uppercase;
--accent:#d6b25e;--accent-2:#4cc3e6;--accent-soft:rgba(214,178,94,.10);--on-accent:#17120a;--money:#e3c278;--good:#4fd1a5;--warn:#f0b54a;--bad:#ef6b6b;--star:#e3c278;
--cta:linear-gradient(135deg,#ebcb7a,#b88b2c);--cta-text:#17120a;--cta-shadow:0 6px 22px rgba(214,178,94,.28),inset 0 1px 0 rgba(255,255,255,.4);
--shadow:0 10px 30px rgba(0,0,0,.35);
--ocean:#0d1117;--land:#1a212c;--land-edge:rgba(214,178,94,.22);--border:rgba(255,255,255,.08);--grat:rgba(255,255,255,.03);--route:#e3c278;--route-mid:#4cc3e6;--route-lo:#6c7584;--route-glow:drop-shadow(0 0 3px rgba(227,194,120,.7));--route-dash:none;--opp:#4cc3e6;--plane-map:#f6e2b0;--hub:#f2cf73;--dest:#4cc3e6;--map-label:#f1f3f6;--map-label-shadow:0 1px 4px #000;
--s1:#b38a2e;--s2:#7d74e0;--s3:#1aa57a;--chart-surface:#141922;--grid:rgba(255,255,255,.07);--track:rgba(255,255,255,.07);--track-strong:#323a47;--bar-fill:linear-gradient(90deg,#8d6c22,#e3c278);--ring:#4cc3e6;
--kpi-spark:#e3c278;--kpi-spark-cost:#ef8a6b;--fuel-keep:#2d6f8a;--fuel-use:#e3c278;--plane-body:#eef1f5;--plane-tail:#1b2433;--plane-wing:#9aa4b2;--plane-win:#1b2433;
--nav-text:#b9c1cc;--nav-on:linear-gradient(90deg,rgba(214,178,94,.22),rgba(214,178,94,.04));--nav-on-text:#fff;--nav-on-shadow:inset 3px 0 0 #d6b25e;--logo-a:#f2d48a;--logo-b:#a77b22;--sky-a:#e98d52;--sky-b:#1b2232;--sky-city:#0b0e14}
body{background:radial-gradient(900px 500px at 70% -10%,rgba(214,178,94,.07),transparent 60%),#0c0f14}
.brand b{letter-spacing:.32em;font-weight:500}
.ph h2{font-size:.86rem;font-weight:600}
.kpi-label{text-transform:uppercase;letter-spacing:.1em;font-size:.74rem}
.kpi-val{font-weight:500;font-size:2rem}
.kpi-ic{background:transparent;color:var(--accent)}
.app{grid-template-columns:15.5rem 1fr;grid-template-rows:auto 1fr;height:100vh}
.topbar{grid-column:1/-1;padding:.8rem 1.4rem}
.topbar .hq{font-size:1.1rem;letter-spacing:.2em;color:var(--accent)}
.topbar .motto{font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:var(--muted)}
.nav a.on{border-radius:0}
.nav .brief{margin-top:auto;border-top:1px solid var(--line);padding-top:.8rem}
.nav .brief .alerts .al{grid-template-columns:auto 1fr;padding:.4rem .2rem} .nav .brief .al time{display:none} .nav .brief .al-ic{width:1.6rem;height:1.6rem} .nav .brief .al b{font-size:.84rem} .nav .brief .al span{font-size:.74rem}
.main{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));grid-template-rows:auto minmax(0,1.3fr) minmax(0,1fr);gap:1rem;padding:1rem 1.2rem;min-height:0}
.k{grid-column:span 3} .dec{grid-column:span 3} .m-map{grid-column:span 8} .m-fleet{grid-column:span 4} .m-fin{grid-column:span 4} .m-opps{grid-column:span 5} .m-fuel{grid-column:span 3}
.dec{border-color:var(--line-hi);background:linear-gradient(135deg,rgba(214,178,94,.14),#141922 65%)}
.btn-start{border-radius:4px;letter-spacing:.12em;text-transform:uppercase;font-size:1.05rem}
.map-tabs{position:static;padding:0 1rem;gap:1.4rem;border-bottom:1px solid var(--line)} .map-tabs button{background:none;border:0;border-bottom:2px solid transparent;border-radius:0;padding:.7rem 0;letter-spacing:.12em;text-transform:uppercase;font-size:.8rem} .map-tabs button[aria-selected=true]{background:none;color:var(--text);border-bottom-color:var(--accent)}
.m-map > [data-w]{flex:1;display:flex;flex-direction:column;min-height:0}
.fleet-head{display:flex;align-items:baseline;gap:.6rem} .fleet-head b{font-size:2.6rem;font-weight:400} .fleet-head span{font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
@media (max-width:1500px),(max-height:820px){.app{height:auto}.main{grid-template-rows:auto}.k,.dec{grid-column:span 6}.m-map{grid-column:span 12;height:28rem}.m-fleet{grid-column:span 12}.m-fin{grid-column:span 6;height:20rem}.m-opps{grid-column:span 12}.m-fuel{grid-column:span 6}.topbar .motto{display:none}}
'''
B3 = f'''<div class="app">
<header class="topbar">{brand('Aurelia','A I R L I N E S')}<span class="tb-sep"></span><span class="hq">HQ</span><span class="motto">People connect · A brighter tomorrow</span><span class="tb-grow"></span>
<div class="tb-item"><div style="text-align:right"><b>TUE 14 MAY · 07:45</b><span>Round 14 · Week 14</span></div></div>
<div class="tb-item"><span data-icon="sun"></span><div><b>Cardiff (CWL)</b><span>17°C</span></div></div>
<div class="cashpill"><div><b data-count="48250" data-pre="£">£0</b><span class="label">Cash balance</span></div></div>
<button class="iconbtn" aria-label="Notifications"><span data-icon="bell"></span><span class="badge">3</span></button></header>
{nav(sub=True, extra='<div class="brief"><span class="label">Briefing</span>' + W('alerts', n='3') + '</div>')}
<main class="main">
<section class="panel k">{W('kpi',k='revenue')}</section><section class="panel k">{W('kpi',k='profit')}</section><section class="panel k">{W('kpi',k='satisfaction')}</section>
<section class="panel dec">{W('decision')}</section>
<section class="panel m-map">{W('map')}</section>
<section class="panel m-fleet"><div class="ph"><h2>Fleet management</h2><span class="grow"></span><a href="#">View fleet →</a></div><div class="pb"><div class="fleet-head"><b data-count="7">0</b><span>aircraft · 6 in service</span></div>{W('fleet')}</div></section>
<section class="panel m-fin"><div class="ph"><h2>Revenue &amp; profit</h2></div><div class="pb">{W('finance')}</div></section>
<section class="panel m-opps"><div class="ph"><h2>Route expansion opportunities</h2><span class="grow"></span><a href="#">View all →</a></div><div class="pb">{W('opps')}</div></section>
<section class="panel m-fuel"><div class="ph"><h2>Fuel &amp; operations</h2></div><div class="pb">{W('fuel')}</div></section>
</main></div>'''
T3 += '.k > [data-w],.dec > [data-w]{height:100%} [data-w="decision"]{display:flex;flex-direction:column;justify-content:center;gap:.5rem;padding:1rem 1.2rem} [data-w="decision"] p{margin:0;font-size:.98rem} .m-fuel .fp-spark{display:none} .m-fleet .fleet-rows{gap:0} .m-fleet .frow{padding:.32rem .2rem}\n'

# ---------------------------------------------------------------- 04 OPERATIONS COMMAND
T4 = '''
:root{--r:8px;--page:#061326;--bar:rgba(5,16,33,.92);--nav:#071a33;--panel:rgba(10,30,56,.78);--panel-solid:#0f2236;--inset:rgba(4,14,30,.55);--chip:rgba(6,20,40,.82);--tip:#0b2140;
--line:rgba(90,170,255,.22);--line-hi:rgba(110,190,255,.55);--line-soft:rgba(90,170,255,.11);--text:#eef5ff;--muted:#a4bbd9;--h-color:#e8f2ff;--h-ls:.1em;--h-tt:uppercase;
--accent:#4fb3ff;--accent-2:#8fd0ff;--accent-soft:rgba(79,179,255,.13);--on-accent:#04162d;--money:#ffcf5c;--good:#4ade80;--warn:#fbbf24;--bad:#f87171;--star:#ffcf5c;
--cta:linear-gradient(135deg,#ffd66b,#f0a91e);--cta-text:#1b1300;--cta-shadow:0 0 0 1px rgba(255,214,107,.6),0 6px 26px rgba(255,190,60,.35);
--shadow:0 10px 30px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.05);
--ocean:#07203d;--land:#123a63;--land-edge:rgba(120,190,255,.35);--border:rgba(140,200,255,.22);--grat:rgba(90,170,255,.07);--route:#59c3ff;--route-mid:#2f7fd0;--route-lo:#71839c;--route-glow:drop-shadow(0 0 3px #3aa8ff);--route-dash:none;--opp:#ffcf5c;--plane-map:#ffffff;--hub:#ffcf5c;--dest:#59c3ff;--map-label:#fff;--map-label-shadow:0 1px 4px #000;
--s1:#3a95f0;--s2:#d95926;--s3:#1fa877;--chart-surface:#0f2236;--grid:rgba(140,190,255,.12);--track:rgba(140,190,255,.14);--track-strong:#2b4466;--bar-fill:linear-gradient(90deg,#1fa877,#4ade80);--ring:#4ade80;
--kpi-spark:#59c3ff;--kpi-spark-cost:#ff9b6b;--fuel-keep:#2f7fd0;--fuel-use:#ffcf5c;--plane-body:#f2f6fb;--plane-tail:#1b3d6e;--plane-wing:#9fb0c4;--plane-win:#1b3d6e;
--nav-text:#c2d4ec;--nav-on:linear-gradient(180deg,rgba(255,207,92,.2),rgba(255,207,92,.03));--nav-on-text:#fff;--nav-on-shadow:inset 0 0 0 1px rgba(255,207,92,.6);--logo-a:#ffe08a;--logo-b:#c9901e;--sky-a:#ff9c55;--sky-b:#13284a;--sky-city:#081428}
body{background:radial-gradient(1200px 600px at 50% 30%,rgba(40,120,220,.18),transparent 70%),#061326}
.app{grid-template-rows:auto 1fr auto;height:100vh}
.topbar{padding:.6rem 1.2rem}
.brand b{letter-spacing:.3em;font-weight:600} .ph h2{font-size:.92rem}
.otabs{display:flex;gap:1.6rem;margin-left:1rem} .otabs a{color:var(--muted);text-decoration:none;font-weight:700;font-size:.86rem;letter-spacing:.1em;text-transform:uppercase;padding:.5rem 0;border-bottom:2px solid transparent} .otabs a.on{color:var(--text);border-bottom-color:var(--accent)}
.clock b{font-size:1.15rem;letter-spacing:.06em}
.main{display:grid;grid-template-columns:26rem minmax(0,1fr) 22rem;grid-template-rows:minmax(0,1.45fr) minmax(0,1fr);gap:.8rem;padding:.8rem 1rem;min-height:0}
.colL,.colR{display:flex;flex-direction:column;gap:.8rem;min-height:0}
.colL{grid-row:1/3} .colR{grid-row:1/3;grid-column:3}
.colL > .panel{flex:1} .colR > .panel{flex:none} .colR > .panel.grow{flex:1}
.m-map{grid-column:2;grid-row:1}
.bottom{grid-column:2;grid-row:2;display:grid;grid-template-columns:1.05fr 1fr .9fr;gap:.8rem;min-height:0}
.hero4{position:relative;overflow:hidden;justify-content:flex-end;padding:1.1rem;background:linear-gradient(180deg,#ff9c55 0%,#d3627a 28%,#3a3f86 58%,#0b1d3c)}
.hero4 svg.hp{position:absolute;left:-6%;top:22%;width:112%;height:auto;filter:drop-shadow(0 12px 12px rgba(0,0,0,.4))}
.hero4 > *{position:relative} .hero4 h3{margin:0;font-size:1.25rem;letter-spacing:.18em;text-transform:uppercase} .hero4 p{margin:.3rem 0 .7rem;font-size:.92rem;color:#e8eefa}
.hero4 .btn-start{width:100%}
.readiness{display:flex;align-items:center;gap:1rem}
.dock{display:flex;gap:.5rem;padding:.6rem 1rem;border-top:1px solid var(--line);background:var(--bar)}
.dock a{flex:1;display:flex;align-items:center;justify-content:center;gap:.5rem;padding:.65rem;border:1px solid var(--line);border-radius:var(--r);color:var(--nav-text);text-decoration:none;font-weight:700;font-size:.82rem;letter-spacing:.1em;text-transform:uppercase;background:var(--panel)}
.dock a.on{background:var(--nav-on);box-shadow:var(--nav-on-shadow);color:#fff}
.dock a .ic{width:1.3rem;height:1.3rem}
.m-map [data-w="map"]{flex:1;display:flex;flex-direction:column;min-height:0}
.colR .al span{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden} .colR .fuel-prices{grid-template-columns:1fr 1fr} .colR .fp-spark{display:none} .colR .tank-key{display:none}
@media (max-width:1500px),(max-height:820px){.app{height:auto}.main{grid-template-columns:1fr 1fr;grid-template-rows:auto}.colL{grid-row:auto;grid-column:1}.colR{grid-row:auto;grid-column:2}.m-map{grid-column:1/-1;grid-row:1;height:28rem}.bottom{grid-column:1/-1;grid-row:auto;grid-template-columns:1fr 1fr 1fr}.otabs{display:none}.dock a span:last-child{display:none}}
'''
B4 = f'''<div class="app">
<header class="topbar">{brand('Altair','O P E R A T I O N S')}<span class="tb-sep"></span>
<div class="tb-item clock"><div><b>TUE 14 MAY · 07:45</b><span>Round 14 · Week 14</span></div></div>
<div class="sim" aria-label="Sim speed"><button data-speed aria-pressed="false" aria-label="Pause" data-icon="pause"></button><button data-speed aria-pressed="true" aria-label="Play" data-icon="play"></button><button data-speed aria-pressed="false" aria-label="Fast" data-icon="ff"></button></div>
<nav class="otabs" aria-label="Sections"><a href="#" class="on">Live operations</a><a href="#">Strategy</a><a href="#">Finance</a><a href="#">Fleet</a><a href="#">Network</a><a href="#">People</a></nav>
<span class="tb-grow"></span>
<div class="tb-item"><span data-icon="star"></span><div><b data-w="stars"></b><span>Reputation 4.0</span></div></div>
<div class="cashpill"><span data-icon="coins" style="color:var(--money)"></span><div><b data-count="48250" data-pre="£">£0</b><span class="label">Cash</span></div></div>
<button class="iconbtn" aria-label="Notifications"><span data-icon="bell"></span><span class="badge">3</span></button></header>
<main class="main">
<div class="colL">
 <section class="panel"><div class="ph"><span data-icon="plane" style="color:var(--accent)"></span><h2>Live departures</h2><span class="muted" style="font-size:.8rem">9 today</span><span class="grow"></span><a href="#">View all ›</a></div><div class="pb">{W('board',k='dep')}</div></section>
 <section class="panel"><div class="ph"><span data-icon="plane" style="color:var(--accent);transform:scaleX(-1)"></span><h2>Live arrivals</h2><span class="grow"></span><a href="#">View all ›</a></div><div class="pb">{W('board',k='arr')}</div></section>
</div>
<section class="panel m-map"><div class="ph"><h2>Network operations</h2><span class="muted" style="font-size:.8rem">Live routes · weather · airports</span><span class="grow"></span></div><div class="pb" style="padding:0">{W('map',weather='yes')}</div></section>
<div class="bottom">
 <section class="panel"><div class="ph"><h2>Route profitability</h2><span class="grow"></span><span class="muted" style="font-size:.8rem">This round</span></div><div class="pb">{W('profitbars')}</div></section>
 <section class="panel"><div class="ph"><h2>Season goals</h2><span class="grow"></span><span class="muted" style="font-size:.8rem">Season 1</span></div><div class="pb">{W('objectives')}</div></section>
 <section class="panel hero4"><svg class="hp" viewBox="0 0 220 64" aria-hidden="true"><use href="#side-jet"/></svg><h3>Today's decision</h3><p>Fuel is up to £1.95 a litre. Carry on, top up, or stock up?</p><button class="btn-start">Start the day <span data-icon="arrowR"></span></button></section>
</div>
<div class="colR">
 <section class="panel"><div class="ph"><h2>Fleet readiness</h2><span class="grow"></span><span class="muted" style="font-size:.8rem">7 aircraft</span></div><div class="pb"><div class="readiness">{W('ring',k='fleet',small='operational')}<div class="statline"><span><i style="background:var(--good)"></i>In service <b style="margin-left:auto">6</b></span><span><i style="background:var(--warn)"></i>Maintenance <b style="margin-left:auto">1</b></span><span><i style="background:var(--bad)"></i>Grounded <b style="margin-left:auto">0</b></span><span><i style="background:var(--accent)"></i>On order <b style="margin-left:auto">1</b></span></div></div></div></section>
 <section class="panel"><div class="ph"><h2>Fuel management</h2><span class="grow"></span><span class="good-t" style="font-size:.8rem;font-weight:700">● Live</span></div><div class="pb">{W('fuel',ops='no')}</div></section>
 <section class="panel"><div class="ph"><h2>Customer ratings</h2><span class="grow"></span><span class="muted" style="font-size:.8rem">Last 7 rounds</span></div><div class="pb">{W('ratings')}</div></section>
 <section class="panel grow"><div class="ph"><h2>Notifications</h2><span class="grow"></span><span style="color:var(--bad);font-weight:700;font-size:.8rem">3 new</span></div><div class="pb">{W('alerts',n='2')}</div></section>
</div>
</main>
<nav class="dock" aria-label="Main">{''.join(f'<a href="#" class="{"on" if i==0 else ""}"><span data-icon="{ic}"></span><span>{lab}</span></a>' for i,(ic,lab) in enumerate([('home','HQ'),('route','Routes'),('plane','Fleet'),('chart','Finance'),('users','Market'),('pin','Airports'),('leaf','Sustainability'),('gear','Settings')]))}</nav>
</div>'''
T4 += '.statline{display:flex;flex-direction:column;gap:.3rem;font-size:.88rem;flex:1} .statline span{display:flex;align-items:center;gap:.45rem} .statline i{width:.6rem;height:.6rem;border-radius:50%;display:inline-block} .colR .rate-head > b{font-size:1.8rem} .colL .board td{padding:.5rem .4rem}\n'

OPTIONS = [
 dict(file='hq-option-01-mid-blue.html', title='SkyHorizon Air · HQ (mid-blue)', css=T1, body=B1, name='Mid-blue HQ',
      idea='Blue-led, sleek and calm: glass panels on a mid-blue sky, cyan highlights, amber kept for money and the one big action.', tag='Recommended'),
 dict(file='hq-option-02-light-airy.html', title='Nimbus Air · HQ (light and airy)', css=T2, body=B2, name='Light and airy',
      idea='Bright, spacious and friendly: white glass cards, a welcome hero, and quick actions along the bottom.', tag=''),
 dict(file='hq-option-03-dark-premium.html', title='Aurelia · HQ (dark premium)', css=T3, body=B3, name='Dark premium',
      idea='Executive and dramatic: charcoal with gold and cyan, thin lines, and route-expansion opportunities up front.', tag=''),
 dict(file='hq-option-04-operations-command.html', title='Altair · HQ (operations command)', css=T4, body=B4, name='Operations command',
      idea='Live operations room: departures and arrivals boards, weather on the map, readiness, fuel and goals at a glance.', tag='Optional'),
]
