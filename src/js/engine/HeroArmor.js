/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
const TAU=Math.PI*2,tint=(c,f)=>c.map(v=>Math.min(1,v*f));
const metal=[.20,.26,.33],edge=[.43,.48,.52],dark=[.065,.083,.115],bronze=[.46,.29,.13],glow=[.23,.67,.78];
function shell(m,levels,c,n=10,emit=0){
 const rings=levels.map(([x,y,z,rx,rz])=>Array.from({length:n},(_,i)=>{const t=TAU*i/n+Math.PI/n;return [x+Math.cos(t)*rx,y,z+Math.sin(t)*rz];}));
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){let k=(i+1)%n;const f=.87+.13*Math.cos(TAU*(i+.5)/n);m.quad(rings[j][i],rings[j+1][i],rings[j+1][k],rings[j][k],tint(c,f),emit);}
 for(let i=1;i<n-1;i++){m.tri(rings[0][0],rings[0][i],rings[0][i+1],tint(c,.65),emit);const top=rings.at(-1);m.tri(top[0],top[i+1],top[i],tint(c,1.12),emit);}
}
function trim(m,x,y,z,rx,rz,c=bronze,n=10){
 shell(m,[[x,y-.027,z,rx-.025,rz-.025],[x,y,z,rx,rz],[x,y+.027,z,rx-.025,rz-.025]],c,n);
}
function breastplate(m,chest,hips,detail){
 const n=detail>.75?12:8;
 shell(m,[[0,hips+.10,0,.43,.31],[0,chest-.37,0,.56,.38],[0,chest+.05,.025,.70,.47],[0,chest+.40,0,.64,.37],[0,chest+.54,0,.43,.28]],metal,n);
 trim(m,0,chest-.38,0,.59,.40,bronze,n);
 trim(m,0,chest+.41,0,.66,.39,edge,n);
 // Raised angular breastplate: mirrored, sloped faces and a central ridge.
 for(const s of [-1,1]){
  const v=(x,y,z)=>[s*x,chest+y,z];
  m.quad(v(.03,.39,.38),v(.53,.29,.36),v(.64,-.03,.31),v(.04,-.22,.51),tint(metal,1.24));
  m.tri(v(.04,-.22,.51),v(.64,-.03,.31),v(.45,-.38,.34),tint(metal,.76));
  m.tri(v(.04,-.22,.51),v(.45,-.38,.34),v(.02,-.36,.40),metal);
  m.quad(v(.03,.39,.395),v(.55,.29,.373),v(.53,.25,.388),v(.03,.34,.42),bronze);
  for(let k=0;k<3;k++){const yy=chest-.29-k*.17;shell(m,[[s*.26,yy-.07,.04,.30,.32],[s*.26,yy+.035,.04,.31,.34],[s*.26,yy+.09,.04,.28,.31]],tint(metal,.77+k*.06),8);}
 }
 const diamond=[[0,chest+.23,.465],[-.12,chest+.08,.50],[0,chest-.10,.525],[.12,chest+.08,.50]];
 m.quad(...diamond,bronze);m.tri([0,chest+.15,.512],[-.061,chest+.075,.53],[0,chest-.02,.54],glow,.25);m.tri([0,chest+.15,.512],[0,chest-.02,.54],[.061,chest+.075,.53],glow,.25);
}
function helmet(m,chest,detail){
 const y=chest+1.07,n=detail>.75?12:8;
 shell(m,[[0,y-.43,.045,.22,.24],[0,y-.31,.035,.34,.32],[0,y+.03,0,.39,.36],[0,y+.29,-.035,.33,.30],[0,y+.43,-.065,.15,.15],[0,y+.47,-.07,.035,.05]],metal,n);
 // Brow plate, cheeks, and pointed central respirator form an enclosed visor.
 m.quad([-.34,y+.11,.275],[.34,y+.11,.275],[.24,y+.205,.295],[-.24,y+.205,.295],edge);
 m.quad([-.30,y+.075,.31],[.30,y+.075,.31],[.26,y-.035,.36],[-.26,y-.035,.36],dark);
 for(const s of [-1,1]){
  const v=(x,yy,z)=>[s*x,y+yy,z];
  m.quad(v(.03,-.025,.405),v(.29,.02,.33),v(.31,-.24,.29),v(.04,-.34,.37),tint(metal,1.13));
  m.quad(v(.035,.023,.377),v(.26,.052,.335),v(.245,.018,.353),v(.04,-.012,.394),glow,.28);
  m.tri(v(.03,-.025,.419),v(.04,-.34,.38),v(.15,-.15,.39),edge);
  m.quad(v(.32,.06,.21),v(.37,.04,-.12),v(.29,-.26,-.12),v(.27,-.23,.24),tint(metal,.82));
  if(detail>.75)for(let k=0;k<3;k++)m.box(s*(.10+k*.045),y-.16-k*.024,.384-k*.013,.023,.057,.018,dark,0,s*.15);
 }
 // Raised sagittal crest, rear spine and gold edging.
 const ridge=[[-.075,y+.20,.28],[-.075,y+.50,-.04],[-.075,y+.35,-.31],[-.075,y+.01,-.36]];
 const opposite=ridge.map(p=>[-p[0],p[1],p[2]]);
 for(let i=0;i<ridge.length-1;i++)m.quad(ridge[i],opposite[i],opposite[i+1],ridge[i+1],bronze);
 m.box(0,y-.29,-.29,.19,.17,.08,dark);
}
function pauldron(m,s,chest,detail){
 const n=detail>.75?10:7;
 shell(m,[[s*.80,chest+.14,-.045,.32,.33],[s*.83,chest+.28,-.045,.48,.43],[s*.78,chest+.49,-.05,.36,.36],[s*.71,chest+.59,-.06,.17,.22]],metal,n);
 trim(m,s*.83,chest+.28,-.045,.49,.44,edge,n);
 for(let k=0;k<3;k++){let x=s*(.86+k*.075),y=chest+.21-k*.13;shell(m,[[x,y-.105,-.045,.26-k*.025,.31-k*.015],[x,y+.02,-.045,.32-k*.025,.35-k*.018],[x,y+.075,-.045,.28-k*.025,.31-k*.018]],tint(metal,.91-k*.07),n);}
 const p=[s*1.23,chest+.38,-.045];m.tri([s*1.10,chest+.48,.18],p,[s*1.10,chest+.18,.15],bronze);
}
const metalize=fn=>(m,...args)=>{const old=m.material;m.material=5;try{return fn(m,...args);}finally{m.material=old;}};
root.LandlordHeroArmor={breastplate:metalize(breastplate),helmet:metalize(helmet),pauldron:metalize(pauldron)};
})(globalThis);
