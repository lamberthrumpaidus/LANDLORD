/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
const themes=[
 {metal:[.12,.15,.20],trim:[.44,.35,.25],cloth:[.075,.045,.06],kind:'reaper'},
 {metal:[.13,.22,.14],trim:[.35,.29,.14],cloth:[.09,.13,.08],kind:'thorn'},
 {metal:[.28,.22,.32],trim:[.50,.43,.37],cloth:[.12,.08,.17],kind:'weaver'},
 {metal:[.20,.10,.17],trim:[.47,.25,.31],cloth:[.18,.06,.13],kind:'veil'},
 {metal:[.26,.16,.10],trim:[.60,.37,.14],cloth:[.26,.055,.025],kind:'cinder'},
 {metal:[.13,.24,.30],trim:[.32,.52,.58],cloth:[.075,.18,.23],kind:'storm'},
 {metal:[.12,.08,.20],trim:[.40,.23,.47],cloth:[.19,.035,.14],kind:'ashbound'}
];
function draw(m,e,c,util){
 const {limb,tint,clamp,clock,quality,distance}=util,T=themes[e.zone]||themes[0],accent=c.accent;
 const high=distance<32&&quality!=='low',sides=high?12:7,rings=high?8:4;
 const walk=LandlordEnemyMotion.gait(e,1),S=walk.bob*.14,wind=e.windup>0?clamp(1-e.windup/(e.p2?.78:.96),0,1):0,pose=LandlordEnemyMotion.sample(e);
 const recoil=Math.sin(Math.PI*clamp((e.hitRecoil||0)/.53,0,1))*.32;
 const sphere=(x,y,z,rx,ry,rz,col,em=0)=>m.ellipsoid(x,y,z,rx,ry,rz,col,em,rings,sides);
 if(T.kind==='weaver'){
  sphere(0,2.15+pose.y*.45,-.55+pose.lean*.6,1.5,1.12,1.75,T.metal);
  sphere(0,2.1+pose.y*.35,1.1+pose.lean*.72,1.12,.91,1.05,T.trim);
  for(const side of [-1,1])for(let i=0;i<4;i++){
   const z=-1.5+i*.92,g=LandlordEnemyMotion.gait(e,side,(i%2)*.5);
   const p0=[side*.8,2.2,z],p1=[side*(2.3+i%2*.20),2.6+g.lift*.45,z-.35+g.z*.45],p2=[side*3.1+g.x*.38,.28+g.lift*.60+Math.max(0,pose.y)*.35,z+.60+pose.z*.55+g.z*.7];
   limb(m,p0,p1,.26,.19,T.metal,0,sides);limb(m,p1,p2,.19,.07,T.trim,0,sides);
   sphere(...p1,.24,.27,.24,T.metal);
  }
  for(let i=0;i<4;i++)sphere((i-1.5)*.36,2.39+(i%2)*.11,2.0,.13,.11,.10,accent,.55);
  for(const side of [-1,1])limb(m,[side*.51,1.88,1.84],[side*.31,1.12,2.43+wind*.3],.20,.055,T.trim,0,7);
  if(high)for(let i=0;i<5;i++)m.spike(0,2.9,-1.8+i*.65,.34,.55,accent,.19);
  return;
 }
 const hover=T.kind==='veil'||T.kind==='storm',y=hover?.42+Math.sin(clock*2+e.phase)*.16:0;
 const hip=2.0+y+S*.26,chest=3.5+y+pose.y*.12+S*.60,head=5.05+y+pose.y*.20+S*.60;
 const bright=e.hit>0?tint(T.metal,1.55):T.metal;
 sphere(0,hip,-recoil*.15,.94,.78,.66,T.metal);
 sphere(pose.twist*.16,chest,-recoil*.28+pose.lean*.48,1.17,1.22,.73,bright);
 sphere(pose.twist*.22,head,-recoil*.40+pose.lean*.40,.61,.75,.57,T.metal);
 m.box(0,head+.03,.49,.86,.13,.16,[.025,.029,.04]);
 for(const side of [-1,1]){
  sphere(side*.25,head+.045,.58,.13,.065,.045,accent,.68);
  const gait=LandlordEnemyMotion.gait(e,side);
  if(!hover){
   const h=[side*.58,hip-.30,0],f=[side*.66+gait.x*.45,.23+y+gait.lift*.52,gait.z*.84],leg=LandlordHeroRig.solveTwoBone(h,f,[side*.12,0,1],.92,.88);
   LandlordHeroSurface.chain(m,h,leg.joint,leg.tip,[.35,.34,.28,.26,.25,.21,.18],T.metal,high?1:.7);LandlordHeroSurface.plate(m,leg.joint,leg.tip,.26,T.metal,T.trim);
   sphere(leg.tip[0],leg.tip[1],leg.tip[2]+.18,.34,.22,.48,T.metal);
  }else{
   for(let j=0;j<3;j++)m.spike(side*(.4+j*.18),.55+y+j*.27,Math.sin(clock*3+j)*.17,.25,.9,T.cloth,.08);
  }
  const shoulder=[side*1.24,chest+.6,-.04+pose.lean*.4],target=[side*1.45+(side===1?pose.x:-pose.x*.35),chest-.87+pose.y+gait.lift*.20,.58+pose.z-gait.z*.45*(pose.active?.12:1)];
  const arm=LandlordHeroRig.solveTwoBone(shoulder,target,[side*.75,-.3,-.9],1.02,.98),elbow=arm.joint,hand=arm.tip;
  sphere(...shoulder,.54,.37,.55,T.trim);limb(m,shoulder,elbow,.31,.25,T.metal,0,sides);limb(m,elbow,hand,.25,.19,T.trim,0,sides);sphere(...hand,.24,.27,.27,T.metal);
  if(high)for(let j=0;j<3;j++)sphere(side*(1.19+j*.12),chest+.83-j*.18,-.06,.42-j*.045,.13,.44,T.metal);
  if(side===1){
   const blade=hand.map((v,i)=>v+pose.blade[i]*2.52);
   limb(m,hand,blade,.17,.07,T.trim,0,sides);
   if(T.kind==='reaper'){
    const tip=[blade[0]-.95,blade[1]+.38,blade[2]+1.15];
    m.tri([blade[0]+.32,blade[1]-.15,blade[2]],[blade[0],blade[1]+.32,blade[2]+.30],tip,T.trim,.15);
    m.tri([blade[0],blade[1]+.32,blade[2]+.30],[tip[0]-.15,tip[1]+.18,tip[2]],tip,accent,.52);
   }else{
    const p=blade.map((v,i)=>v+pose.blade[i]*1.03);
    if(T.kind==='thorn'||T.kind==='cinder'){const col=T.kind==='cinder'?accent:T.trim;m.ellipsoid(...blade,.48,.42,.48,col,.28,rings,sides);for(const side of [-1,1])m.spike(blade[0]+side*.34,blade[1]-.11,blade[2],.17,.58,T.trim,.14);}
    else limb(m,blade,p,.29,.03,accent,.48,sides);
   }
  }
 }
 // World-specific crowns, plates, horns, mantle, and floating shards.
 for(let j=0;j<4;j++)m.box(0,chest-.52+j*.29,.71,.48+.10*j,.085,.08,T.trim);
 sphere(0,chest+.32,.73,.29,.34,.07,accent,.28);
 if(T.kind==='thorn'){
  for(const s of [-1,1]){
   limb(m,[s*.39,head+.35,0],[s*.88,head+1.02,-.12],.15,.07,T.trim,0,7);
   limb(m,[s*.88,head+1.02,-.12],[s*1.35,head+1.48,.16],.07,.018,T.trim,0,7);
   limb(m,[s*.78,head+.92,-.10],[s*.54,head+1.34,.25],.08,.018,T.trim,0,7);
  }
 }else if(T.kind==='cinder'){
  for(let i=0;i<6;i++){let t=i*Math.PI/3;m.spike(Math.cos(t)*.48,head+.50,Math.sin(t)*.48,.12,.46,T.trim,.12);}
 }else if(T.kind==='storm'||T.kind==='ashbound'){
  for(let i=0;i<5;i++){let t=clock*.45+i*Math.PI*.4;m.spike(Math.cos(t)*1.66,head+.14+Math.sin(t)*.32,Math.sin(t)*1.66,.23,.65,accent,.45);}
 }else{
  for(const s of [-1,1])limb(m,[s*.40,head+.30,-.06],[s*.70,head+.92,-.14],.17,.035,T.trim,0,7);
 }
 for(let i=0;i<(high?9:5);i++){
  let x=-1.03+i*2.06/(high?9:5),x2=x+2.06/(high?9:5),hem=hover?.68+y:.24+y;
  const wave=.25*Math.sin(clock*2+i*.5)+S;
  m.quad([x,chest+.65,-.58],[x2,chest+.65,-.58],[x2*1.25,hem,-.98-wave],[x*1.25,hem,-.98-wave],tint(T.cloth,.8+.15*Math.cos(i*1.5)));
 }
}
root.LandlordBossModels={draw,themes};
})(globalThis);
