/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
// Local-space handcrafted skeletal anatomy. All gameplay dimensions and hitboxes remain unchanged.
function skeleton(m,e,c,u){
 const {limb,tint,clamp,clock,quality,distance}=u;
 const near=distance<25&&quality!=='low',rings=near?6:4,sides=near?10:6;
 const bone=[.48,.44,.36],edge=[.64,.58,.46],dark=[.07,.055,.045],iron=[.12,.135,.145],cloth=[.12,.055,.045];
 const wind=e.windup>0?clamp(1-e.windup/.57,0,1):0,pose=LandlordEnemyMotion.sample(e),hit=Math.sin(Math.PI*clamp((e.hitRecoil||0)/.53,0,1))*.15;
 const move=LandlordEnemyMotion.gait(e,-1),bob=move.bob*.065;
 const pelvis=1.0+bob,sternum=1.72+bob-hit,head=2.53+bob-hit*.6;
 const ell=(x,y,z,rx,ry,rz,col,emit=0)=>m.ellipsoid(x,y,z,rx,ry,rz,col,emit,rings,sides);
 ell(0,pelvis,0,.34,.22,.23,bone);
 limb(m,[0,pelvis,.01],[0,sternum,-.10],.10,.09,bone,0,sides);
 for(let j=0;j<4;j++){
  const yy=1.25+bob+j*.17,w=.35+Math.sin(j*.85)*.13;
  for(const side of [-1,1]){
   const a=[side*.065,yy,-.13],b=[side*w,yy+.055,-.02],q=[side*w*.62,yy-.045,.27],d=[side*.07,yy+.01,.29];
   limb(m,a,b,.065,.048,bone,0,sides);limb(m,b,q,.049,.040,edge,0,sides);limb(m,q,d,.039,.032,bone,0,sides);
  }
 }
 ell(0,sternum+.08,.27,.085,.39,.075,bone);
 for(const side of [-1,1]){
  const step=LandlordEnemyMotion.gait(e,side),hip=[side*.25,pelvis-.07,0],goal=[side*.28+step.x*.25,.09+step.lift*.28,step.z*.48];
  const leg=LandlordHeroRig.solveTwoBone(hip,goal,[side*.09,0,1],.49,.48),knee=leg.joint,foot=leg.tip;
  limb(m,hip,knee,.105,.075,bone,0,sides);ell(...knee,.105,.09,.10,edge);limb(m,knee,foot,.075,.055,bone,0,sides);
  if(near)limb(m,[knee[0]+side*.07,knee[1],knee[2]],[foot[0]+side*.045,foot[1],foot[2]],.04,.032,tint(bone,.78),0,5);
  ell(foot[0],foot[1]+.02,foot[2]+.14,.12,.08,.25,bone);
  const shoulder=[side*.43,sternum+.30,-.015],target=[side*.52+(side===1?pose.x:-pose.x*.4),sternum-.45+pose.y+step.lift*.10,.25+pose.z-step.z*.31*(pose.active?.12:1)];
  const arm=LandlordHeroRig.solveTwoBone(shoulder,target,[side*.6,-.3,-.7],.45,.44),elbow=arm.joint,hand=arm.tip;
  ell(...shoulder,.16,.15,.16,iron);limb(m,shoulder,elbow,.10,.07,bone,0,sides);ell(...elbow,.10,.09,.095,bone);limb(m,elbow,hand,.073,.055,bone,0,sides);
  ell(...hand,.09,.10,.13,edge);
  if(side===1){
   const tip=hand.map((v,i)=>v+pose.blade[i]*1.15);
   limb(m,hand,tip,.07,.04,iron,0,sides);
   m.tri([tip[0]-.16,tip[1]-.12,tip[2]-.36],[tip[0]+.11,tip[1]+.08,tip[2]-.25],[tip[0]+.10,tip[1]+.22,tip[2]+.45],tint(iron,1.7));
  }
 }
 limb(m,[0,sternum+.32,0],[0,head-.24,.03],.09,.075,bone,0,sides);
 ell(0,head,.03,.30,.34,.25,bone);ell(0,head-.24,.10,.22,.13,.18,edge);
 for(const side of [-1,1]){
  ell(side*.105,head+.015,.245,.095,.085,.038,dark);
  ell(side*.105,head+.015,.277,.035,.027,.012,c.accent,.55);
  ell(side*.205,head-.10,.15,.075,.11,.10,edge);
 }
 m.tri([-.045,head-.055,.283],[.045,head-.055,.283],[0,head-.16,.283],dark);
 if(near)for(let k=-2;k<=2;k++)m.box(k*.052,head-.205,.274,.035,.045,.025,edge);
 // Broken leather skirt and remnants of a corroded iron shoulder guard.
 for(let k=0;k<7;k++){const a=-1.12+k*2.24/7,b=a+2.24/7;
  const p=(t,y,r)=>[Math.sin(t)*r,y,-Math.cos(t)*r];
  m.quad(p(a,pelvis+.14,.34),p(b,pelvis+.14,.34),p(b,pelvis-.39+.11*Math.sin(k*7),.43),p(a,pelvis-.38+.12*Math.cos(k*9),.43),tint(cloth,.7+k*.035));
 }
 ell(-.44,sternum+.39,-.015,.25,.14,.23,iron);
}
root.LandlordEnemyModels={skeleton};
})(globalThis);
