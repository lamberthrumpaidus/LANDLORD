/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),mix=(a,b,t)=>add(mul(a,1-t),mul(b,t)),norm=a=>mul(a,1/(Math.hypot(...a)||1)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
// A continuous deforming surface across a two-bone chain, rather than disconnected cylinders and spheres.
function chain(m,a,j,b,radii,col,detail=1){
 const u=norm(sub(j,a)),v=norm(sub(b,j)),tangent=norm(add(u,v)),side=norm(cross(u,v)),reference=Math.hypot(...side)>.01?side:norm(cross(u,Math.abs(u[0])<.8?[1,0,0]:[0,0,1]));
 const centers=[a,mix(a,j,.30),mix(a,j,.76),j,mix(j,b,.24),mix(j,b,.70),b];
 const tangents=[u,u,norm(mix(u,tangent,.35)),tangent,norm(mix(tangent,v,.65)),v,v];
 const n=detail>.75?12:8,pts=[],normals=[];
 for(let k=0;k<centers.length;k++){
  const t=tangents[k],across=norm(cross(reference,t)),up=norm(cross(t,across)),r=radii[k];let row=[],ns=[];
  for(let i=0;i<n;i++){let angle=i*2*Math.PI/n,radial=add(mul(across,Math.cos(angle)),mul(up,Math.sin(angle)));row.push(add(centers[k],mul(radial,r)));ns.push(radial);}
  pts.push(row);normals.push(ns);
 }
 for(let k=0;k<pts.length-1;k++)for(let i=0;i<n;i++){const q=(i+1)%n;const points=[pts[k][i],pts[k+1][i],pts[k+1][q],pts[k][q]],ns=[normals[k][i],normals[k+1][i],normals[k+1][q],normals[k][q]];m.smoothQuad(points,ns,col);}
}
function plate(m,a,b,r,metal,trim){
 const axis=norm(sub(b,a)),side=norm(cross(axis,Math.abs(axis[2])<.85?[0,0,1]:[1,0,0])),forward=norm(cross(side,axis));
 const p=(t,w,d)=>add(mix(a,b,t),add(mul(side,w*r),mul(forward,d*r)));
 m.quad(p(.13,-.80,.8),p(.13,.80,.8),p(.85,.55,.9),p(.85,-.55,.9),metal);
 m.quad(p(.13,-.80,.82),p(.13,-.63,.94),p(.85,-.43,1.02),p(.85,-.55,.92),trim);
 m.quad(p(.13,.63,.94),p(.13,.80,.82),p(.85,.55,.92),p(.85,.43,1.02),trim);
 m.tri(p(.13,-.63,.94),p(.13,.63,.94),p(.53,0,1.24),trim);
}
function coat(m,chest,rig,body,clock,attack,lean){
 const length=1.18,steps=10,cols=6;
 for(const s of [-1,1]){
  const point=(u,t)=>{const cloth=rig.cloth(t),run=rig.weights.run,flight=rig.weights.flight;
   const x=s*(.12+u*(.55+.20*t))+cloth.x*t+lean*.27*t;
   const y=chest+.43-t*length+.26*run*t*t+.35*flight*t;
   const z=-.49+cloth.z*t*.85-.16*t-.14*Math.sin(clock*5+u*2+t*5)*t-.32*attack*t;
   return [x,y,z];};
  for(let i=0;i<cols;i++)for(let j=0;j<steps;j++){const u=i/cols,v=(i+1)/cols,t=j/steps,w=(j+1)/steps,edge=i===0||i===cols-1||j===steps-1;const color=edge?[.68,.45,.19]:[.31+.025*Math.cos(i*1.4),.048,.075];m.quad(point(u,t),point(v,t),point(v,w),point(u,w),color);}
  const mid=(u,t)=>{const p=point(u,t);p[2]-=.018;return p;};m.quad(mid(.5,.15),mid(.23,.4),mid(.5,.65),mid(.77,.4),[.68,.45,.19]);
 }
}
const api={chain,plate,coat};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LandlordHeroSurface=api;
})(globalThis);
