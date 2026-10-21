/* BertieV4 · Sheet (Airline style) renderer, shared by the in-game pictures and the design-system previews.
   AirSheet.render(S, o) -> {html, h}
   S: title, tabs [[name, icon, locked]], tab, labelW, cols [{c,top,main,w,flag,plan}], rows [{r,label,ic,fl,t,gold,bars,chips,note,lk,nw}],
      v {ref:value}, auto [refs], cls {ref:class}, focus {tgt, refs{ref:tag}, lit:[c1,r1,c2,r2], f, words, sum, building, hov}
   focus.unit: '£' (default) or '' for an answer that isn't money.
   o: W, state ('work' | 'done' | 'intro'), blank [refs empty in this state], crumb, fbY, ltY, rh {hdr,data,...}, H (min height), pad, g (grid margins),
      line (html for the line under the grid), doneF {tgt,f,words,val} (formula bar when done) */
(function(){
const I={
 person:'<circle cx="8" cy="4.5" r="2.6" fill="none" stroke="#9fbde3" stroke-width="1.4"/><path d="M3 15c0-3 2.2-5.2 5-5.2s5 2.2 5 5.2" fill="none" stroke="#9fbde3" stroke-width="1.4"/>',
 tag:'<path d="M2 8V2.5h5.5L14 9l-5.5 5.5L2 8z" fill="none" stroke="#9fbde3" stroke-width="1.4"/><circle cx="5" cy="5.2" r="1.1" fill="#9fbde3"/>',
 coins:'<ellipse cx="8" cy="4.5" rx="5.5" ry="2.2" fill="none" stroke="#f2c14e" stroke-width="1.4"/><path d="M2.5 4.5v3.5c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2V4.5M2.5 8v3.5c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2V8" fill="none" stroke="#f2c14e" stroke-width="1.4"/>',
 receipt:'<path d="M3.5 1.5h9v13l-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1-1.5 1z" fill="none" stroke="#9fbde3" stroke-width="1.4"/><path d="M5.5 5h5M5.5 8h5" stroke="#9fbde3" stroke-width="1.2"/>',
 drum:'<rect x="3.5" y="1.5" width="9" height="13" fill="none" stroke="#9fbde3" stroke-width="1.4"/><path d="M3.5 5.5h9M3.5 10.5h9" stroke="#9fbde3" stroke-width="1.2"/>',
 chart:'<path d="M2 13.5h12" stroke="#9fbde3" stroke-width="1.3"/><path d="M3 11l3.5-3.5 2.5 2 4.5-5" fill="none" stroke="#3ce394" stroke-width="1.6"/>',
 cup:'<path d="M3 5h8v5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" fill="none" stroke="#9fbde3" stroke-width="1.4"/><path d="M11 6.5h1.5a1.6 1.6 0 0 1 0 3.2H11" fill="none" stroke="#9fbde3" stroke-width="1.3"/>',
 cal:'<rect x="2" y="3" width="12" height="11" fill="none" stroke="#9fbde3" stroke-width="1.4"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="#9fbde3" stroke-width="1.3"/>',
 note:'<path d="M2 2.5h12v8H7l-3.5 3v-3H2z" fill="none" stroke="#9fbde3" stroke-width="1.4"/>',
 scale:'<path d="M8 2v12M3 14h10M3 5h10M3 5l-2 4.5h4zM13 5l-2 4.5h4z" fill="none" stroke="#9fbde3" stroke-width="1.2"/>',
 divide:'<circle cx="8" cy="3.5" r="1.3" fill="#9fbde3"/><path d="M2.5 8h11" stroke="#9fbde3" stroke-width="1.5"/><circle cx="8" cy="12.5" r="1.3" fill="#9fbde3"/>',
 plane:'<path d="M1.5 9.2l5-1.3L9.6 3c.4-.6 1.4-.4 1.4.4L10 7.3l3.8-1c.6-.2 1.2.3 1 .9l-.3.7-5 1.8-3.2 4c-.4.5-1.2.2-1.1-.4l.4-2.7-3.5 1.2z" fill="#9fbde3"/>'};
const ico=k=>k&&I[k]?`<svg class="ico" viewBox="0 0 16 16" aria-hidden="true">${I[k]}</svg>`:'';
const FLAG={IE:['#169b62','#f4f4f4','#ff883e'],FR:['#0055a4','#f4f4f4','#ef4135'],
 NL:'<rect width="18" height="4" fill="#ae1c28"/><rect y="4" width="18" height="4" fill="#f4f4f4"/><rect y="8" width="18" height="4" fill="#21468b"/>',
 DE:'<rect width="18" height="4" fill="#111"/><rect y="4" width="18" height="4" fill="#dd0000"/><rect y="8" width="18" height="4" fill="#ffce00"/>',
 CH:'<rect width="18" height="12" fill="#da291c"/><rect x="7.6" y="2.4" width="2.8" height="7.2" fill="#fff"/><rect x="5.4" y="4.6" width="7.2" height="2.8" fill="#fff"/>',
 ES:'<rect width="18" height="12" fill="#aa151b"/><rect y="3" width="18" height="6" fill="#f1bf00"/>'};
const flag=f=>f?`<svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" style="flex:none">${typeof FLAG[f]==='string'?FLAG[f]:FLAG[f].map((c,i)=>`<rect x="${i*6}" y="0" width="6" height="12" fill="${c}"/>`).join('')}</svg>`:'';
const fillCol=f=>f>=.8?'#3ce394':'#ffb547';
const CURSOR='<svg class="cur" viewBox="0 0 20 26" aria-hidden="true"><path d="M2 2v19l5-4.5 3.6 7.5 3.3-1.6-3.5-7.3H17z" fill="#fff" stroke="#021226" stroke-width="1.5" stroke-linejoin="round"/></svg>';
const colIdx=c=>c.charCodeAt(0)-65;
const RH0={hdr:50,data:34,tot:34,fin:36,sub:30,note:36,gap:12};
const cellRe=/\b([A-I]\d{1,2})\b/g;

function render(S,o){
 o=o||{};const W=o.W||1100,state=o.state||'work';
 const H=Object.assign({},RH0,o.rh||{});const PAD=o.pad!=null?o.pad:24,G=o.g!=null?o.g:30;
 const fbY=o.fbY!=null?o.fbY:54,ltY=o.ltY!=null?o.ltY:100,ltH=18,gy=ltY+ltH;
 const x0=PAD+G;
 const cols=[{c:'A',w:S.labelW,lab:1}].concat(S.cols.map(k=>Object.assign({},k)));let cx=x0;cols.forEach(k=>{k.x=cx;cx+=k.w;});
 const CX={};cols.forEach(k=>CX[k.c]=k);
 let ry=gy;const RY={};S.rows.forEach(r0=>{const r=r0;const t=r.t||'data';r.h=H[t];r.y=ry;RY[r.r]=r;ry+=r.h;});
 const gb=ry;
 const F=state==='work'?S.focus:null;
 const blank=o.blank||[];
 const inLit=(c,r)=>{if(!F||!F.lit)return false;const [c1,r1,c2,r2]=F.lit;return colIdx(c)>=colIdx(c1)&&colIdx(c)<=colIdx(c2)&&r>=r1&&r<=r2;};
 const lineY=gb+(o.lineGap!=null?o.lineGap:12);
 const Hc=Math.max(o.H||0,lineY+(o.lineH||40)+(o.padB!=null?o.padB:18));
 let h=`<div class="sh air" style="width:${W}px;height:${Hc}px">`;
 if(o.crumb)h+=`<div class="crumb">${o.crumb}</div>`;
 h+=`<div class="ttl" style="top:${o.ttlY!=null?o.ttlY:14}px">${S.title}</div>`;
 // formula bar
 let nb='',fm='',words='';
 if(state==='work'){nb=F.tgt;fm=F.f.replace(cellRe,'<span class="cy">$1</span>')+(F.building?'<span class="caret"></span>':'');words=F.words;}
 else if(state==='done'){const d=o.doneF||S.focus;nb=d.tgt;fm=d.f.replace(cellRe,'<span class="cy">$1</span>');words=d.words+' = <b style="color:#fff">'+(d.val||S.v[d.tgt]||'')+'</b>';}
 else {nb=o.introNb||'';fm='';words=o.introWords||'';}
 const ops=(state==='work'&&F.building)?'<span class="ops">'+['×','÷','+','−'].map(x=>`<span data-op="${x}">${x}</span>`).join('')+'<span class="u" data-op="undo">Undo</span></span>':'';
 h+=`<div class="fb" style="top:${fbY}px;width:${W-PAD*2}px"><span class="nb">${nb}</span><span class="fx">fx</span><span class="fm">${fm}<small>${words}</small>${ops}</span></div>`;
 // letters and row numbers
 cols.forEach(k=>{h+=`<div class="lt" style="left:${k.x}px;top:${ltY}px;width:${k.w}px;height:${ltH}px">${k.c}</div>`;});
 S.rows.forEach(r=>{h+=`<div class="rn" style="left:${PAD}px;top:${r.y}px;width:${G}px;height:${r.h}px">${r.r}</div>`;});
 cols.slice(1).forEach(k=>{h+=`<div class="colsep" style="left:${k.x}px;top:${gy}px;height:${gb-gy}px"></div>`;});
 // lit block
 if(F&&F.lit){const [c1,r1,c2,r2]=F.lit;const a=CX[c1],b=CX[c2],ya=RY[r1].y,yb=RY[r2].y+RY[r2].h;h+=`<div class="lit" style="left:${a.x-3}px;top:${ya-3}px;width:${b.x+b.w-a.x+6}px;height:${yb-ya+6}px"></div>`;}
 // cells
 S.rows.forEach(r=>{
  const t=r.t||'data';if(t==='gap')return;
  cols.forEach(k=>{
   const ref=k.c+r.r;let cls='c',inner='',attr='';
   if(t==='hdr'){cls+=' h'+(k.lab?' lab':'');if(!k.lab){inner=`${k.flag?`<span style="display:flex;align-items:center;gap:5px">${flag(k.flag)}${k.top}</span>`:`<span>${k.top}</span>`}<b>${k.main}</b>${k.plan?'<i>✓ IN YOUR PLAN</i>':''}`;}}
   else if(k.lab){
    cls+=' l'+(t==='tot'?' tot totr':'')+(t==='fin'?' tot fin':'')+(t==='sub'?' sub':'');
    const ic=r.fl?flag(r.fl):ico(r.ic);
    inner=`${ic}<span>${r.label}</span>${r.note?`<small>${r.note}</small>`:''}${r.lk?`<span class="lk">${r.lk}</span>`:''}${r.nw?'<span class="new">NEW</span>':''}`;
   } else {
    let val=S.v[ref]||'';
    if(blank.includes(ref))val='';
    if(t==='sub'){cls+=' sub v';inner=val;}
    else if(t==='note'){cls+=' note';inner=val;}
    else{
     cls+=' v'+(t==='tot'?' tot totr':'')+(t==='fin'?' tot fin':'');
     let vc='';if(S.cls&&S.cls[ref])vc=S.cls[ref];else if(r.gold&&/£/.test(val))vc='gold';
     inner=val?`<span class="${vc}">${val}</span>`:'';
     if((S.auto||[]).includes(ref)&&val)inner=`<span class="au">ƒ</span>`+inner;
     if(r.bars&&r.bars[ref]!=null){const f=r.bars[ref];inner+=`<span class="bar4"><i style="width:${Math.round(f*100)}%;background:${fillCol(f)}"></i></span>`;}
     if(r.chips&&r.chips[ref])inner=`<span class="chip" style="color:#3ce394;border-color:rgba(60,227,148,.6)">${r.chips[ref]}</span>`+inner;
    }
   }
   if(F){
    if(F.refs[ref]!==undefined){cls+=' ref';attr=`data-tag="${F.refs[ref]}"`;}
    else if(F.tgt===ref){cls+=' tgt';const u=F.unit!==undefined?F.unit:'£';inner=F.building?'?':(u?`<span class="gold" style="font-weight:700">${u}</span>`:'')+'<span class="caret"></span>';if(F.building)cls+=' q';}
    else if(F.hov===ref){cls+=' hov';}
    else if(!inLit(k.c,r.r)){cls+=' dim';}
   }
   h+=`<div class="${cls}" data-ref="${ref}" ${attr} style="left:${k.x}px;top:${r.y}px;width:${k.w}px;height:${r.h}px">${inner}</div>`;
  });
 });
 if(F&&F.hov){const k=CX[F.hov[0]],r=RY[+F.hov.slice(1)];h+=CURSOR.replace('class="cur"',`class="cur" style="left:${k.x+k.w*0.62}px;top:${r.y+r.h*0.4}px"`);}
 // line under the grid
 if(o.line!==null){const ln=o.line!=null?o.line:(state==='done'?'<span class="pos" style="font-weight:700">✓</span> '+(S.line2||''):(S.line1||''));h+=`<div class="line" style="top:${lineY}px">${ln}</div>`;}
 // tabs
 if(S.tabs)h+=`<div class="tabs" style="right:${PAD}px;top:${o.tabY!=null?o.tabY:14}px">${S.tabs.map((t,i)=>`<span class="tab${i===S.tab?' on':''}${t[2]?' off':''}">${ico(t[1]==='cal'?'cal':t[1])}${t[0]}</span>`).join('')}</div>`;
 h+='</div>';
 return {html:h,h:Hc,geo:{cols:CX,rows:RY,gy,gb,lineY}};
}
window.AirSheet={render,ico,flag};
})();
