/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
const names=['Ferryman’s Watch','Heartroot','Cathedral of Ribs','The Silent Bells','Cinder Citadel','The Broken Firmament','The Eclipse Crown'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const TAU=Math.PI*2;
function build(m,index,region,u){
 const {height,roadCenter,hash,tint,limb,LEN,quality}=u;
 const base=index*LEN,low=quality==='low',segments=low?6:10;
 const dark=tint(region.stone,.47),light=tint(region.stone,.93),accent=region.accent;
 const z=base+62,side=index%2?1:-1,x=clamp(roadCenter(z)+side*33,-59,59),y=height(x,z);
 const before=m.d.length,old=m.solidWorld;
 // Keep new architectural geometry on the sides of the main road.
 // Background-only high objects are intentionally non-colliding.
 if(index===0){
  // Ferryman's watch: raised ruined lantern tower, pitched roof and timber platforms.
  const stone=[.22,.25,.29],wood=[.18,.09,.065],gold=[.65,.42,.18];
  for(let s of [-1,1])for(let t of [-1,1]){
   const xx=x+s*4,zz=z+t*4,yy=height(xx,zz);
   m.box(xx,yy+3.3,zz,1.1,6.6,1.1,stone);
   m.box(xx,y+6.8,zz,1.65,.36,1.65,light);
  }
  m.box(x,y+6.5,z,10,.55,10,dark);
  m.box(x,y+9.6,z,11,.45,11,wood);
  for(let s of [-1,1]){for(let k=0;k<5;k++){
   const dx=s*(k+.5)*1.1,yy=y+12.4-k*.49;
   m.box(x+dx,yy,z,1.2,.43,12.0,tint(wood,.74+k*.08),0,s*.035);
  }}
  m.box(x,y+12.6,z,.65,.38,12.5,gold);
  for(let i=0;i<6;i++){
   const zz=z-4+i*1.6;m.box(x-4.8,y+7.5,zz,.16,1.7,.16,wood);m.box(x+4.8,y+7.5,zz,.16,1.7,.16,wood);
  }
  m.ellipsoid(x,y+8.2,z,.8,1.4,.8,[1,.47,.12],.9,5,10);
 }else if(index===1){
  // Ancient living tree, roots, staggered branch forks and broad leaf clusters.
  const bark=[.19,.12,.075],leaf=[.12,.32,.18];
  m.cone(x,y,z,2.35,12,bark,segments,.94);
  for(let i=0;i<7;i++){
   const t=i*TAU/7;const xx=x+Math.cos(t)*6,zz=z+Math.sin(t)*6;
   limb(m,[x,y+1.6,z],[xx,height(xx,zz)+.16,zz],.71,.12,bark,0,7);
   const bx=x+Math.cos(t)*5,bz=z+Math.sin(t)*5,by=y+11+hash(i+31)*3;
   limb(m,[x,y+7+i*.32,z],[bx,by,bz],.56,.24,bark,0,7);
   m.ellipsoid(bx,by+2,bz,3.8,2.9,3.5,tint(leaf,.76+hash(i+45)*.38),0,low?4:6,segments);
   if(!low)m.ellipsoid(bx+Math.cos(t)*2,by+3,bz+Math.sin(t)*2,2.6,2.2,2.4,tint(leaf,1.1),0,5,8);
  }
  m.ellipsoid(x,y+16,z,4.7,3.8,4.9,tint(leaf,.92),0,6,segments);
 }else if(index===2){
  // Remains of a colossal beast: exposed vertebrae and paired arcing ribs.
  const bone=[.57,.52,.45];
  for(let j=0;j<9;j++){
   const zz=z-12+j*3,yy=height(x,zz);
   m.ellipsoid(x,yy+2.6,zz,1.65,1.3,1.0,tint(bone,.72),0,5,segments);
   m.spike(x,yy+3.4,zz,.42,2.0,bone,0);
   for(const s of [-1,1]){
    let prev=[x+s*.9,yy+2.8,zz];
    for(let k=1;k<=7;k++){
     const t=k/7*Math.PI*.89,next=[x+s*(.9+5.0*Math.sin(t)),yy+2.5+5.9*Math.sin(t*.85),zz+.65*k/7];
     limb(m,prev,next,.28*(1-k/9)+.09,.25*(1-k/9)+.08,tint(bone,.9+hash(j*7+k)*.18),0,low?5:7);prev=next;
    }
   }
  }
  m.ellipsoid(x,y+4,z-15,2.8,2.2,3.4,bone,0,6,segments);
  for(const s of [-1,1])m.ellipsoid(x+s*1.23,y+4.3,z-17.7,.72,.66,.43,[.035,.025,.04],0,5,8);
 }else if(index===3){
  // Funeral bells beneath open ruined towers.
  for(let tower=0;tower<2;tower++){
   const xx=x+(tower?8:-5),zz=z+tower*9,yy=height(xx,zz),h=11+tower*4;
   for(const s of [-1,1]){m.box(xx+s*3,yy+h*.5,zz,1.5,h,2.4,dark);m.box(xx+s*3,yy+h,zz,2.1,.7,3.1,light);}
   m.box(xx,yy+h+.45,zz,8.5,.9,3.6,dark);
   m.cone(xx,yy+h+.9,zz,4,3.8,dark,4,.35);
   m.box(xx,yy+h-1.5,zz,6,.24,.3,light);
   m.cone(xx,yy+h-5.2,zz,1.48,2.5,[.32,.22,.16],segments,.64);
   m.ring(xx,yy+h-5.18,zz,1.48,.14,[.51,.37,.23],.04);
   m.sphere(xx,yy+h-5.55,zz,.25,[.23,.16,.10],4,7);
  }
 }else if(index===4){
  // Cinder citadel with tiered red-black bastions and glowing channels.
  for(let i=0;i<3;i++){
   const zz=z+i*6,yy=height(x,zz),hh=9+i*3;
   m.box(x,yy+hh*.5,zz,10-i*2,hh,5,dark);
   m.box(x,yy+hh,zz,11-i*2,.65,5.7,light);
   for(let s of [-1,1]){m.box(x+s*(4-i),yy+hh*.55,zz-2.55,.25,hh*.66,.2,[.93,.26,.055],.7);m.spike(x+s*(4-i),yy+hh+.3,zz,.68,2.1,accent,.35);}
  }
  for(const s of [-1,1]){const xx=x+s*7,yy=height(xx,z+13);m.cone(xx,yy,z+13,2,17,dark,8,1.35);m.cone(xx,yy+17,z+13,2.4,4,light,8,.2);}
 }else if(index===5){
  // Floating terrain silhouette: layered islands, suspended crystals and a broken bridge.
  m.solidWorld=false;
  for(let j=0;j<3;j++){
   const xx=x+(j-1)*10,zz=z+j*8,yy=y+12+j*5,r=4.0+j*.9;
   m.cone(xx,yy-5,zz,.35,5,tint(region.stone,.65),segments,r);
   m.cone(xx,yy,zz,r,1.0,light,segments,r*.82);
   m.spike(xx,yy+.7,zz,1.05,4.2,accent,.5);
   for(let k=0;k<3;k++)m.rock(xx+Math.cos(k*2.1)*r*.7,yy+.8,zz+Math.sin(k*2.1)*r*.7,.75,dark,j*11+k);
  }
  for(let i=0;i<8;i++){const xx=x-10+i*2.6; if(i===3||i===4)continue;m.box(xx,y+13.8+i*.48,z+5,2.3,.55,2.2,light);}
 }else{
  // Eclipse crown: serrated basalt halo on a pedestal, not another crystal field.
  m.box(x,y+2,z,10,4,9,dark);
  m.cone(x,y+4,z,4.5,4.5,light,segments,2);
  for(let k=0;k<segments;k++){
   const t=k*TAU/segments,t2=(k+1)*TAU/segments;
   const p=(a,r)=>[x+Math.cos(a)*r,y+15+Math.sin(a)*r,z];
   limb(m,p(t,6.8),p(t2,6.8),.52,.52,dark,0,6);
   limb(m,p(t,6.0),p(t2,6.0),.10,.10,accent,.42,5);
   if(k%2===0)limb(m,p(t,6.8),p(t,8.6),.40,.04,light,0,6);
  }
  m.ellipsoid(x,y+15,z,.8,.8,.8,accent,1,7,12);
 }
 m.solidWorld=old;
 return {name:names[index],triangles:(m.d.length-before)/30,x,z};
}
root.LandlordRealmArt={build,names};
})(globalThis);
