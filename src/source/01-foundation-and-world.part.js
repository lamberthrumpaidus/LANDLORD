// Create by LamberthRumpaidus
/* LANDLORD — Copyright 2026 Lamberth Rumpaidus. All rights reserved.
   Build provenance: LANDLORD-PROCEDURAL-HD-20261123.
   All gameplay executes exclusively inside this script; inert anti-scraper decoy resides separately.
   LANDLORD — an original procedural 3D adventure.
   Built on the lore, biome names, and ability motifs of LANDLORD by Lamberth Rumpaidus.
   Offline / no external libraries. WebGL renderer with software-3D fallback. */
(()=>{'use strict';
const $=id=>document.getElementById(id);let canvas=$('world');const mini=$('minimap'),mapCanvas=$('bigMap');
const regions=[
 {name:'THE STYX',subtitle:'Where the dead first awaken',bg:[.075,.1,.17],fog:[.115,.14,.22],ground:[.16,.20,.28],accent:[1,.56,.25],stone:[.34,.37,.43],flora:[.15,.2,.27],kind:'ash',enemy:'skeleton',guardian:'HOLLOW REAPER'},
 {name:'ASPHODEL MEADOWS',subtitle:'A forest that remembers',bg:[.055,.15,.14],fog:[.13,.23,.18],ground:[.19,.32,.24],accent:[.52,1,.68],stone:[.23,.38,.33],flora:[.22,.46,.34],kind:'forest',enemy:'goblin',guardian:'THORNHEART'},
 {name:'ELYSIAN BONEYARD',subtitle:'The cathedral of forgotten bones',bg:[.12,.09,.22],fog:[.22,.19,.34],ground:[.32,.27,.39],accent:[.74,.6,1],stone:[.37,.36,.49],flora:[.35,.28,.5],kind:'bones',enemy:'spider',guardian:'THE WEAVER'},
 {name:'FIELDS OF MOURNING',subtitle:'A thousand voices in the wind',bg:[.2,.085,.12],fog:[.33,.19,.21],ground:[.36,.24,.28],accent:[1,.47,.5],stone:[.42,.29,.31],flora:[.49,.28,.33],kind:'mourning',enemy:'specter',guardian:'VEIL OF SORROW'},
 {name:'THE THRONE ROOM',subtitle:'The seat of an empty king',bg:[.2,.105,.055],fog:[.34,.22,.14],ground:[.37,.28,.2],accent:[1,.67,.27],stone:[.42,.34,.26],flora:[.57,.31,.22],kind:'throne',enemy:'knight',guardian:'CINDER KING'},
 {name:'SHATTERED SKY',subtitle:'NEW REALM — Above the collapsing world',bg:[.06,.16,.23],fog:[.15,.3,.39],ground:[.2,.34,.39],accent:[.39,.94,1],stone:[.28,.4,.46],flora:[.21,.48,.49],kind:'sky',enemy:'sentinel',guardian:'STORM SENTINEL'},
 {name:'OBSIDIAN SANCTUM',subtitle:'NEW REALM — The source of the curse',bg:[.095,.055,.17],fog:[.23,.12,.29],ground:[.2,.15,.26],accent:[1,.25,.67],stone:[.3,.23,.38],flora:[.39,.18,.43],kind:'obsidian',enemy:'warlock',guardian:'THE ASHBOUND'}
];
const LEN=250,END=LEN*7,TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
const hash=n=>{let x=Math.sin(n*127.13+33.79)*43758.5453;return x-Math.floor(x)};
const rand2=(x,z)=>hash(x*109.7+z*173.1);
const zoneOf=z=>clamp(Math.floor(Math.max(0,z)/LEN),0,6);
const REALM_PATHS=[
 [0,-22,34,-31,22], [0,30,-29,31,-18], [0,-31,16,35,-23],
 [0,26,-35,-18,31], [0,-27,34,-32,24], [0,35,-23,30,-33], [0,-31,33,-19,24]
];
function roadCenter(z){
 const zone=zoneOf(z),local=clamp((z-zone*LEN)/LEN,0,.9999),spline=REALM_PATHS[zone];
 const seg=Math.min(3,Math.floor(local*4)),t=local*4-seg;
 const a=spline[Math.max(0,seg-1)],b=spline[seg],c=spline[seg+1],d=spline[Math.min(4,seg+2)];
 return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
}
const ALTAR_LOCAL=.54, BOSS_LOCAL=.83, GATE_LOCAL=.955;
function shrinePoint(j){let z=j*LEN+LEN*ALTAR_LOCAL;return {x:roadCenter(z),z}}
function guardianPoint(j){let z=j*LEN+LEN*BOSS_LOCAL;return {x:roadCenter(z),z}}
function portalPoint(j){let z=j*LEN+LEN*GATE_LOCAL;return {x:roadCenter(z),z}}
const SIDE_LINKS=[2,3,5,1,6,4,0];
function sidePortalPoint(j){let z=j*LEN+LEN*.69,offset=Math.sin((.69-.34)/.54*Math.PI)*(j%2?-21:21);return {x:roadCenter(z)+offset,z,destination:SIDE_LINKS[j]}}

const height=(x,z)=>{
 let waves=Math.sin(z*.092+x*.07)*.65+Math.cos(x*.17-z*.032)*.42+Math.sin(z*.025+x*.35)*.54;
 let edge=Math.max(0,(Math.abs(x)-73)/26);
 return waves*(.2+.8*clamp((Math.abs(x)-6)/20,0,1))+edge*edge*10;
};
const V3=(x=0,y=0,z=0)=>[x,y,z],add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],scale=(a,s)=>[a[0]*s,a[1]*s,a[2]*s],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{let l=Math.hypot(...a)||1;return scale(a,1/l)},distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const tint=(c,f)=>c.map(v=>clamp(v*f,0,1.3));
// World solid colliders are registered from the same static prop geometry that is rendered.
const solidCells=new Map(),SOLID_CELL=8;let solidCount=0;
function cellKey(x,z){return `${Math.floor(x/SOLID_CELL)},${Math.floor(z/SOLID_CELL)}`}
function registerSolid(o,range){
 if(!Number.isFinite(o.x+o.z+range+o.minY+o.maxY)||range<=0)return;
 solidCount++;
 for(let gx=Math.floor((o.x-range-1)/SOLID_CELL);gx<=Math.floor((o.x+range+1)/SOLID_CELL);gx++)
 for(let gz=Math.floor((o.z-range-1)/SOLID_CELL);gz<=Math.floor((o.z+range+1)/SOLID_CELL);gz++){
  const k=`${gx},${gz}`;let b=solidCells.get(k);if(!b){b=[];solidCells.set(k,b)}b.push(o);
 }
}
function addSolid(x,z,r,minY=height(x,z)-.4,maxY=height(x,z)+Math.max(2.5,r*1.7)){
 if(!Number.isFinite(x+z+r)||r<=0)return;
 registerSolid({kind:'circle',x,z,r,minY,maxY},r);
}
function addBoxSolid(x,z,w,d,minY,maxY,angle=0){
 if(w<.25||d<.25||maxY-minY<.6)return;
 registerSolid({kind:'box',x,z,w,d,minY,maxY,c:Math.cos(angle),s:Math.sin(angle)},Math.hypot(w,d));
}
function blocking(x,z,r=.72,feetY=height(x,z),bodyHeight=2.8){
 const bucket=solidCells.get(cellKey(x,z));if(!bucket)return null;
 const y0=feetY+.06,y1=feetY+bodyHeight;
 for(const o of bucket){
  if(o.active===false||y1<=o.minY+.025||y0>=o.maxY-.025)continue;
  if(o.kind==='circle'){
   const rr=o.r+r;if((x-o.x)**2+(z-o.z)**2<rr*rr)return o;
  }else{
   const dx=x-o.x,dz=z-o.z;
   const localX=dx*o.c-dz*o.s,localZ=dx*o.s+dz*o.c;
   const cx=clamp(localX,-o.w,o.w),cz=clamp(localZ,-o.d,o.d);
   if((localX-cx)**2+(localZ-cz)**2<r*r)return o;
  }
 }
 return null;
}
function moveWithCollision(o,dx,dz,r=.70,feetY=o.y??height(o.x,o.z),bodyHeight=2.75){
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.28)),sx=dx/steps,sz=dz/steps;
 for(let i=0;i<steps;i++){
  let nx=o.x+sx;if(!blocking(nx,o.z,r,feetY,bodyHeight))o.x=nx;else if('vx' in o)o.vx=0;
  let nz=o.z+sz;if(!blocking(o.x,nz,r,feetY,bodyHeight))o.z=nz;else if('vz' in o)o.vz=0;
 }
}
// Choose a reachable short steering step instead of blindly walking into pillars.
function steerAround(e,goalX,goalZ,speed,dt,r=.7){
 const base=Math.atan2(goalX-e.x,goalZ-e.z),range=speed*dt;
 let best=null;
 for(const offset of [0,.42,-.42,.9,-.9,1.55,-1.55,2.2,-2.2]){
  const a=base+offset,nx=e.x+Math.sin(a)*range,nz=e.z+Math.cos(a)*range;
  if(Math.abs(nx)>77||nz<3||nz>END-4||blocking(nx,nz,r,e.y??height(e.x,e.z),3.1))continue;
  const score=Math.hypot(goalX-nx,goalZ-nz)+Math.abs(offset)*.23;
  if(!best||score<best.score)best={a,nx,nz,score};
 }
 if(best){moveWithCollision(e,best.nx-e.x,best.nz-e.z,r,e.y??height(e.x,e.z),3.1);return best.a;}
 return null;
}
// Avoid JavaScript's maximum argument count when combining detailed geometry.
function appendVertices(target,source){for(let i=0;i<source.length;i++)target.push(source[i]);}
class Mesh{
 constructor(x=0,y=0,z=0,rot=0){this.d=[];this.ox=x;this.oy=y;this.oz=z;this.c=Math.cos(rot);this.s=Math.sin(rot)}
 pt(p){return [this.ox+p[0]*this.c+p[2]*this.s,this.oy+p[1],this.oz-p[0]*this.s+p[2]*this.c]}
 tri(a,b,c,col,emit=0){a=this.pt(a);b=this.pt(b);c=this.pt(c);const n=norm(cross(sub(b,a),sub(c,a)));for(const p of [a,b,c])this.d.push(...p,...n,...col,emit)}
 quad(a,b,c,d,col,emit=0){this.tri(a,b,c,col,emit);this.tri(a,c,d,col,emit)}
 smoothTri(points,normals,col,emit=0){const origin=this.pt([0,0,0]);for(let i=0;i<3;i++){const p=this.pt(points[i]),n=norm(sub(this.pt(normals[i]),origin));this.d.push(...p,...n,...col,emit);}}
 smoothQuad(p,n,col,emit=0){this.smoothTri([p[0],p[1],p[2]],[n[0],n[1],n[2]],col,emit);this.smoothTri([p[0],p[2],p[3]],[n[0],n[2],n[3]],col,emit);}
 slab(x,z,w,d,thickness,col,rot=0){
  const ca=Math.cos(rot),sa=Math.sin(rot),corners=[[-1,1],[1,1],[1,-1],[-1,-1]];
  const ring=(inset,dy)=>corners.map(([u,v])=>{const dx=u*(w*.5-inset),dz=v*(d*.5-inset),xx=x+ca*dx+sa*dz,zz=z-sa*dx+ca*dz;return [xx,height(xx,zz)+dy,zz]});
  const top=ring(.065,thickness),edge=ring(0,thickness-.052),bottom=ring(0,-.055);
  this.quad(...top,col);
  for(let i=0;i<4;i++){let j=(i+1)%4;this.quad(bottom[j],bottom[i],edge[i],edge[j],tint(col,.64));this.quad(edge[j],edge[i],top[i],top[j],tint(col,.84));}
 }
 box(x,y,z,w,h,d,col,emit=0,ry=0){
 if(this.solidWorld&&h>=.9&&w>.35&&d>.35){
  const center=this.pt([x,0,z]),angle=Math.atan2(this.s,this.c)+ry;
  addBoxSolid(center[0],center[2],w*.5,d*.5,this.oy+y-h*.5,this.oy+y+h*.5,angle);
 }
 let a=Math.cos(ry),b=Math.sin(ry),p=(dx,dy,dz)=>[x+a*dx+b*dz,y+dy,z-b*dx+a*dz];let x0=-w/2,x1=w/2,y0=-h/2,y1=h/2,z0=-d/2,z1=d/2;
 const f=(v,o)=>this.quad(...v.map(q=>p(...q)),tint(col,o),emit);
 f([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],.93);
 f([[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]],.77);
 f([[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1]],.84);
 f([[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]],.9);
 f([[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0]],1.15);
 f([[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],.57);
 }
 cone(x,y,z,r,h,col,n=7,top=0,emit=0){
 if(this.solidWorld&&h>1.7&&r>.24){let p=this.pt([x,0,z]);addSolid(p[0],p[2],Math.min(2.1,r*.44),this.oy+y-.25,this.oy+y+h);}
 const base=[],upper=[];for(let i=0;i<n;i++){let a=i/n*TAU;base.push([x+Math.cos(a)*r,y,z+Math.sin(a)*r]);upper.push([x+Math.cos(a)*top,y+h,z+Math.sin(a)*top]);}for(let i=0;i<n;i++){let q=(i+1)%n;this.quad(base[q],base[i],upper[i],upper[q],tint(col,.91+.09*hash(i+z)),emit)}for(let i=1;i<n-1;i++){this.tri(upper[0],upper[i+1],upper[i],tint(col,1.13),emit);this.tri(base[0],base[i],base[i+1],col,emit)}}
 sphere(x,y,z,r,col,rings=5,sides=8,emit=0){for(let j=0;j<rings;j++){let v0=j/rings*Math.PI,v1=(j+1)/rings*Math.PI;for(let i=0;i<sides;i++){let u0=i/sides*TAU,u1=(i+1)/sides*TAU;let p=(u,v)=>[x+Math.cos(u)*Math.sin(v)*r,y+Math.cos(v)*r,z+Math.sin(u)*Math.sin(v)*r];this.quad(p(u0,v0),p(u1,v0),p(u1,v1),p(u0,v1),tint(col,.93+.13*Math.sin(u0)),emit)}}}
 spike(x,y,z,r,h,col,emit=.35){
 if(this.solidWorld&&h>=1.4&&r>.35){let p=this.pt([x,0,z]);addSolid(p[0],p[2],r*.63,this.oy+y-.1,this.oy+y+h);}
 let v=8,lower=[],middle=[],tip=[x,y+h,z];for(let i=0;i<v;i++){let a=i*TAU/v;lower.push([x+Math.cos(a)*r*.43,y,z+Math.sin(a)*r*.43]);middle.push([x+Math.cos(a)*r,y+h*.38,z+Math.sin(a)*r])}for(let i=0;i<v;i++){let k=(i+1)%v;this.quad(lower[k],lower[i],middle[i],middle[k],tint(col,.74+.1*hash(i)),emit);this.tri(middle[k],middle[i],tip,tint(col,.9+.22*hash(i+5)),emit)}}
 rock(x,y,z,r,col,seed=1){
 if(this.solidWorld&&r>.55){let p=this.pt([x,0,z]);addSolid(p[0],p[2],r*.78,this.oy+y-.2,this.oy+y+r*1.6);}
 let n=7;let points=[];for(let i=0;i<n;i++){let a=i*TAU/n;points.push([x+Math.cos(a)*r*(.8+.4*hash(seed+i)),y,z+Math.sin(a)*r*(.7+.4*hash(seed+i+18))]);}let tip=[x+(hash(seed+99)-.5)*r*.5,y+r*(.7+hash(seed+50)*.8),z+(hash(seed+59)-.5)*r*.5];for(let i=0;i<n;i++)this.tri(points[i],points[(i+1)%n],tip,tint(col,.7+hash(seed+i+8)*.46))}
 ring(x,y,z,r,t,col,emit=.2){let n=16;for(let i=0;i<n;i++){let a=i*TAU/n,b=(i+1)*TAU/n;let q=(radius,angle)=>[x+Math.cos(angle)*radius,y,z+Math.sin(angle)*radius];this.quad(q(r-t,a),q(r+t,a),q(r+t,b),q(r-t,b),col,emit)}}
 get(){return new Float32Array(this.d)}
}
function ruin(m,x,z,c,r=1){let y=height(x,z),s=.8+hash(x+z)*.4;
 m.box(x,y+1.65*s,z,1.7*s,3.3*s,1.7*s,c.stone,0,hash(x)*.9);m.box(x,y+3.3*s,z,2.35*s,.42*s,2.25*s,tint(c.stone,1.3));
 m.box(x,y+.56*s,z,1.98*s,.18*s,1.92*s,tint(c.stone,.52));
 m.box(x,y+2.35*s,z,1.93*s,.16*s,1.92*s,tint(c.stone,.83));
 m.box(x,y+2.6*s,z+.86*s,.20*s,.27*s,.11*s,tint(c.accent,.29),.11);
 m.box(x,y+.25*s,z,2.4*s,.5*s,2.3*s,tint(c.stone,.65));
 if(r>0)m.spike(x,y+3.5*s,z,.32*s,1.6*s,c.accent,.37)}
function tree(m,x,z,c,seed){let y=height(x,z),h=4+hash(seed)*6;let r=.28+h*.027;
 m.cone(x,y,z,r,h*.9,tint(c.stone,.68),7,r*.45);for(let j=0;j<3;j++)m.cone(x,y+h*(.33+j*.19),z,h*(.27-j*.044),h*.46,tint(c.flora,.77+.11*j+hash(seed+j)*.2),7,0)}
function boneCluster(m,x,z,c,seed){let y=height(x,z);let bone=[.73,.7,.67];m.box(x,y+.95,z, .38,2,.35,bone,0,hash(seed)*2);m.sphere(x,y+2.1,z,.55,bone,4,6);for(let k=0;k<2;k++)m.box(x+(k?-.34:.34),y+2.17,z+.4,.22,.21,.45,tint(bone,.55));m.box(x,y+1.27,z+.22,.9,.12,.2,tint(bone,.8))}
function shrine(m,x,z,c,active=false){let y=height(x,z),s=1;
 for(let k=0;k<3;k++)m.box(x,y+.15+k*.29,z,8-k*1.25,.3,7.7-k*1.2,tint(c.stone,.65+k*.16));
 for(let i=0;i<4;i++){let dx=i<2?-3:3,dz=i%2?-2.8:2.8;m.box(x+dx,y+1.55,z+dz,.65,2.3,.7,tint(c.stone,1.2));m.spike(x+dx,y+2.8,z+dz,.38,.75,c.accent,.56)}
 m.box(x,y+1.6,z,2.2,2.7,2.2,tint(c.stone,1.16));m.spike(x,y+3,z,1.15,4,active?tint(c.accent,.4):c.accent,active?.07:.82);
 m.ring(x,y+.22,z,4.7,.22,c.accent,.35);
}
function gate(m,z,c,cx=0){let y=height(cx,z);for(let x of [cx-12,cx+12]){
 m.box(x,y+7,z,3.8,14,3.7,tint(c.stone,.69));m.box(x,y+13.9,z,5,1.4,5,tint(c.stone,1.18));
 for(let i=0;i<3;i++)m.box(x+(i-1)*1.6,y+15,z,1.1,1.6,4.9,tint(c.stone,.8));
 m.spike(x,y+16,z,.5,2.2,c.accent,.5);
 for(let band=0;band<3;band++){
   m.box(x,y+3+band*4.25,z+1.92,4.0,.27,.20,tint(c.stone,1.22));
   m.box(x,y+3+band*4.25,z-1.92,4.0,.27,.20,tint(c.stone,.86));
 }
 m.spike(x,y+9,z+1.8,.24,1.9,tint(c.accent,.73),.25)}
 m.box(cx,y+13.5,z,22,3,4.3,tint(c.stone,.87));for(let i=0;i<9;i++){let x=cx-10+i*2.5;m.box(x,y+15.6,z,1.15,1.4,4.5,tint(c.stone,1.08));}
 m.box(cx,y+9.5,z,17,.32,.22,tint(c.accent,.85),.8);
}
function tower(m,x,z,c,seed){let y=height(x,z),h=10+hash(seed)*12,r=2.2+hash(seed+3)*2;
 m.cone(x,y,z,r,h,tint(c.stone,.75),9,r*.78);
 // Tower top uses a solid crown instead of detached floating blocks.
 m.cone(x,y+h-.65,z,r*.78,1.4,tint(c.stone,1.05),9,r*.72);
 m.spike(x,y+h+1,z,.5,2.4,c.accent,.55);
}

// ECLIPSE EDITION: handcrafted procedural landmarks / richer geometric silhouettes.
Mesh.prototype.ellipsoid=function(x,y,z,rx,ry,rz,col,emit=0,rings=9,sides=13){
  for(let j=0;j<rings;j++){const a=j*Math.PI/rings,b=(j+1)*Math.PI/rings;
    for(let i=0;i<sides;i++){const c=i*TAU/sides,d=(i+1)*TAU/sides;
      const p=(u,v)=>[x+rx*Math.cos(u)*Math.sin(v),y+ry*Math.cos(v),z+rz*Math.sin(u)*Math.sin(v)];
      const n=(u,v)=>norm([Math.cos(u)*Math.sin(v)/rx,Math.cos(v)/ry,Math.sin(u)*Math.sin(v)/rz]);
      this.smoothQuad([p(c,a),p(d,a),p(d,b),p(c,b)],[n(c,a),n(d,a),n(d,b),n(c,b)],col,emit);
    }
  }
};
// Paths use a different curved Catmull-Rom route in each realm.
function ancientArch(m,x,z,c,scaleFactor=1,broken=false){
 const h=10*scaleFactor,w=9*scaleFactor,st=c.stone;
 for(const side of [-1,1]){
  const xx=x+side*w*.5,y=height(xx,z);
  m.box(xx,y+1.2*scaleFactor,z,2.8*scaleFactor,2.4*scaleFactor,2.7*scaleFactor,tint(st,.57));
  m.box(xx,y+h*.48,z,1.7*scaleFactor,h*.82,1.8*scaleFactor,tint(st,.76));
  m.box(xx,y+h*.91,z,2.5*scaleFactor,.68*scaleFactor,2.1*scaleFactor,tint(st,1.07));
  m.spike(xx,y+h+.65*scaleFactor,z,.45*scaleFactor,1.5*scaleFactor,tint(st,.64),.05);
 }
 // Every voussoir has a continuous supporting neighbor from each anchored pillar.
 for(let k=0;k<=10;k++){
  const a=k/10*Math.PI,ax=x+Math.cos(a)*w*.5;
  const y=height(ax,z)+h*.87+Math.sin(a)*w*.30;
  m.box(ax,y,z,1.34*scaleFactor,1.38*scaleFactor,2.25*scaleFactor,tint(st,.76+.13*hash(k+z)),0,-a+.30);
 }
 if(broken){
  // Broken masonry is placed on the ground, never detached in mid-air.
  for(let k=0;k<3;k++){
   const xx=x+w*(.72+k*.12),zz=z+(k-1)*1.1,ground=height(xx,zz);
   m.box(xx,ground+.34*scaleFactor,zz,.9*scaleFactor,.66*scaleFactor,1.1*scaleFactor,tint(st,.62),0,.2*k);
  }
 }
}
function monumentalKeep(m,z,c){
  let y=height(0,z),st=c.stone;
  m.box(0,y+1,z+14,33,2,22,tint(st,.55));
  for(const side of [-1,1]){
    const x=side*19;
    for(let j=0;j<4;j++)m.box(x,y+3.8+j*6.3,z+12,5.4,7,5.1,tint(st,.54+.04*j));
    m.box(x,y+26,z+12,7.9,2.2,7.6,tint(st,.88));
    for(let q=0;q<5;q++)m.box(x+(q-2)*1.57,y+28.2,z+12,1.12,2.4,6.9,tint(st,.76));
    m.spike(x,y+29,z+12,2.0,10,tint(st,.8),.07);
    for(let j=0;j<3;j++)m.box(x,y+8+j*5.9,z+14.66,1.1,3.0,.2,tint(c.accent,.28),.08);
  }
  m.box(0,y+16.8,z+12,33,5.2,5.2,tint(st,.63));
  for(let i=0;i<13;i++)m.box(-16+i*2.65,y+20.7,z+12,1.6,2.7,5.5,tint(st,.85));
  ancientArch(m,0,z+8,c,1.85,true);
  m.spike(0,y+22.3,z+12,2.7,10,c.accent,.43);
  for(let side of [-1,1]){
    for(let j=0;j<4;j++){
      let x=side*(28+j*7),zz=z+16+j*4;
      m.box(x,y+3.2,zz,4,6,5.2,tint(st,.7));
      m.spike(x,y+6.2,zz,1.5,4.8,tint(st,.64),0);
    }
  }
}
function deadOak(m,x,z,c,seed){
  let y=height(x,z),heightStem=8+hash(seed*7)*9,st=tint(c.stone,.30);
  limb(m,[x,y,z],[x+.8,y+heightStem*.6,z+.3],.60,.38,st,0,7);
  limb(m,[x+.8,y+heightStem*.6,z+.3],[x+1.2,y+heightStem,z+.6],.37,.07,st,0,6);
  for(let b=0;b<7;b++){
    let ph=b*2.4+seed,side=Math.sin(ph),back=Math.cos(ph),hh=heightStem*(.46+b*.06),branchX=x+side*(3.3+hash(b+seed)*2.2),branchZ=z+back*(2.5+hash(b+seed+1)*2.4);
    limb(m,[x+.6,y+hh,z],[branchX,y+hh+2.0,branchZ],.25,.05,st,0,5);
    limb(m,[branchX,y+hh+2,branchZ],[branchX+side*1.7,y+hh+3.7,branchZ+back*1.6],.10,.015,st,0,4);
  }
}
function giantCrystalCluster(m,x,z,c,seed){
 const yy=height(x,z);
 for(let k=0;k<8;k++){
  let theta=k*2.4+seed*.3,r=hash(seed+k)*3.2,xx=x+Math.sin(theta)*r,zz=z+Math.cos(theta)*r,h=2.2+hash(seed+k*37)*7;
  m.spike(xx,yy,zz,.42+h*.14,h,tint(c.accent,.4+.37*hash(seed+k*11)),.13+.28*hash(k));
 }
}
function carvedRoad(m,idx){
 const reg=regions[idx],base=idx*LEN,col=tint(reg.stone,.72);
 // Every hand-sized cobble is actual 3D geometry; staggered, worn and slightly irregular.
 for(let row=0;row<Math.ceil((LEN-2)/1.32);row++){
  let z=base+row*1.32+.2,center=roadCenter(z);
  for(let lane=-5;lane<=5;lane++){
   const seed=idx*7700+row*63+lane*199;
   if(hash(seed)<.075)continue;
   let xx=center+lane*1.38+(row%2?.36:0)+(hash(seed+3)-.5)*.12;
   const y=height(xx,z),w=1.16+hash(seed+7)*.20,d=1.05+hash(seed+17)*.17;
   let factor=.58+hash(seed+26)*.25,roadColor=tint(col,factor+(lane%3===0?.08:0));
   m.slab(xx,z,w,d,.09+hash(seed+9)*.035,roadColor,(hash(seed+35)-.5)*.12);
   if(hash(seed+41)>.962)m.spike(xx,y+.13,z,.18,.2,reg.accent,.15);
  }
 }
 for(let side of [-1,1])for(let j=0;j<29;j++){
  const z=base+j*(LEN-12)/28+3,x=roadCenter(z)+side*(8.4+hash(j*3+idx)*.9),y=height(x,z);
  m.box(x,y+.24,z,1.5,.52,2.25,tint(reg.stone,.61));
  if(j%3===0){m.box(x,y+.7,z,.42,.6,.4,tint(reg.accent,.6),.26);m.spike(x,y+1,z,.22,.55,reg.accent,.68)}
 }
}
function vistaStructures(m,idx){
 const c=regions[idx],base=idx*LEN;
 // Monumental vertical silhouettes: cathedral, colonnades and bridge silhouettes.
 for(let j=0;j<8;j++){
  const z=base+10+j*(LEN-25)/8;
  for(let side of [-1,1]){
   const seed=idx*48+j*4+side*5,x=roadCenter(z)+side*(36+hash(seed)*27);
   if(j%2===0)ancientArch(m,x,z,c,.85+hash(seed+4)*.4,j%3===0);
   else{
    const yy=height(x,z),hh=10+hash(seed)*14;
    m.box(x,yy+hh*.5,z,3,hh,3,tint(c.stone,.50));
    for(let k=0;k<4;k++)m.box(x,yy+hh*(k+.6)/4,z,4.3,.54,4.3,tint(c.stone,.85));
    m.spike(x,yy+hh,z,1.7,7,tint(c.stone,.69),0);
   }
  }
 }
 if(idx===0){
    monumentalKeep(m,base+LEN*.62,c);
   for(let j=0;j<10;j++){
      let z=base+10+j*(LEN-20)/10,x=roadCenter(z)+(j%2?-1:1)*(26+hash(j*45)*29);
      deadOak(m,x,z,c,j+30);
   }
   for(let j=0;j<10;j++){
    let z=base+14+j*(LEN-28)/10,x=roadCenter(z)+(j%2?-1:1)*(29+hash(j*54)*19);
    giantCrystalCluster(m,x,z,c,101+j);
   }
 }else if(c.kind==='forest'){
   for(let j=0;j<48;j++){const z=base+hash(j*44+3)*LEN,x=roadCenter(z)+(hash(j*52+9)>.5?1:-1)*(24+hash(j*15+2)*39);
     const y=height(x,z),h=10+hash(j*3)*14;limb(m,[x,y,z],[x,y+h,z],.6,.26,[.14,.21,.16],0,7);
     for(let a=0;a<6;a++){let xx=x+Math.cos(a*1.047)*2.5,zz=z+Math.sin(a*1.047)*2.5;
      m.ellipsoid(xx,y+h*(.70+.06*Math.sin(a)),zz,3.5,5.1,3.9,tint(c.flora,.75+.22*hash(j+a)),0,5,8)}
   }
 }else if(c.kind==='sky'||c.kind==='obsidian'||c.kind==='bones'){
   for(let j=0;j<27;j++){
    let x=(hash(j*9+idx)*2-1)*53,z=base+hash(j*25+idx*81)*LEN;
    if(Math.abs(x-roadCenter(z))<20)continue;giantCrystalCluster(m,x,z,c,idx*93+j);
   }
 }else{
   for(let j=0;j<14;j++){
      let z=base+hash(j*22+idx)*LEN,x=roadCenter(z)+(j%2?-1:1)*(28+hash(j*76)*36);
      ancientArch(m,x,z,c,.6+hash(j*8)*.45,true);
   }
 }
 // Twelve rooted stone cairns around the altar (no unsupported floating geometry).
 for(let j=0;j<12;j++){
  let theta=j*TAU/12,r=17+hash(j+idx*12)*4,zz=shrinePoint(idx).z+Math.sin(theta)*r,xx=shrinePoint(idx).x+Math.cos(theta)*r,yy=height(xx,zz);
  m.box(xx,yy+1.9,zz,1.2,3.8,1.2,tint(c.stone,.72));
  m.box(xx,yy+4.0,zz,2,.55,2,tint(c.stone,1.12));
  m.spike(xx,yy+4.25,zz,.33,2.1,c.accent,.46);
 }
}


// LANDLORD PROCEDURAL HD: biome-aware monumental architecture and authored micro-geometry.
// Every mesh is created from vertices in JavaScript; no external textures/models are fetched.
function bambooCluster(m,xx,zz,seed,deep=false){
 const y=height(xx,zz),h=(deep?13:9)+hash(seed+7)*8,r=.14+hash(seed+14)*.08;
 const stem=[.12+.08*hash(seed+4),.26+.10*hash(seed+6),.15+.065*hash(seed+17)];
 const old=m.solidWorld;m.solidWorld=false;
 const steps=7;for(let j=0;j<steps;j++){
  const a=j/steps,b=(j+1)/steps;
  const flex=Math.sin(seed*.35+j*.44)*.19;
  m.cone(xx+flex*.4,y+h*a,zz+flex*.2,r*(1-a*.25),h/steps,tint(stem,.73+.22*j/steps),7,r*(1-b*.25),0);
  m.ring(xx+flex*.4,y+h*b,zz+flex*.2,r*(1-a*.22)*1.25,.028,[.44,.43,.18],.02);
  if(j>=3&&j<=6){
   const ang=seed*1.14+j*2.399;
   const fx=Math.cos(ang),fz=Math.sin(ang),Y=y+h*b;
   const len=(1.15+hash(seed+j)*2)*(deep?1.25:1);
   // Leaf fans are three-dimensional quads with slightly bent tips.
   for(let k=0;k<3;k++){
    const a=ang+(k-1)*.61,cs=Math.cos(a),sn=Math.sin(a),L=len*(.75+hash(seed*19+j*5+k)*.6);
    const outer=[xx+cs*L,Y+.32+hash(seed+k)*.32,zz+sn*L];
    const inner=[xx+cs*.12,Y-.07,zz+sn*.12];
    const left=[xx+cs*L*.46-sn*.26,Y+.16,zz+sn*L*.46+cs*.26];
    const right=[xx+cs*L*.46+sn*.26,Y+.06,zz+sn*L*.46-cs*.26];
    const col=tint(stem,1.22+.29*hash(j*11+k+seed));
    m.tri(inner,left,outer,col,.035);m.tri(inner,outer,right,tint(col,.77),.035);
   }
  }
 }
 m.solidWorld=old;
}
function monumentalTorii(m,cx,zz,seed=0,theme=0){
 const y=height(cx,zz),width=17+hash(seed)*2.5,col=theme===1?[.35,.21,.17]:[.43,.13,.12];
 const edge=tint(col,.62),trim=[.15,.13,.12],gold=[.62,.47,.24];
 for(const side of [-1,1]){
  let x=cx+side*width*.5,base=height(x,zz);
  m.box(x,base+.22,zz,1.6,.48,1.65,[.22,.23,.23]);
  m.cone(x,base+.35,zz,.62,8.2,tint(col,.77),10,.51);
  for(let j=1;j<=3;j++)m.ring(x,base+2.5*j,zz,.72,.11,tint(gold,.5),.07);
  m.box(x,base+7.22,zz,1.56,.18,1.54,trim);
 }
 let yy=y+7.8;
 m.box(cx,yy,zz,width+4,.55,1.75,edge,0);
 m.box(cx,yy+.52,zz,width+6,.41,2.0,tint(col,1.11));
 m.box(cx,yy+1.18,zz,width+7,.42,2.2,[.10,.11,.13]);
 for(let k=0;k<7;k++){
  const dx=(-3+k)*(width+5)/6,top=y+9.12+.32*Math.pow(Math.abs(dx)/(width*.5),2);
  m.box(cx+dx,top,zz,3.6,.17,2.25,tint(trim,.90+hash(seed+k)*.15),0,dx*.002);
 }
 m.box(cx,yy-1.42,zz,width-1,.34,.65,tint(col,.78));
 m.box(cx,yy-2.5,zz,.58,1.9,.68,tint(col,1.13));
 m.box(cx,yy-1.18,zz,2.1,.48,.84,gold,.14);
}
function stoneLantern(m,x,z,seed=0){
 const y=height(x,z),stone=[.31,.32,.30],metal=[.14,.13,.12];
 m.box(x,y+.24,z,1.35,.48,1.35,tint(stone,.70));
 m.cone(x,y+.42,z,.35,2.7,stone,8,.27);
 m.box(x,y+3.22,z,1.6,.23,1.6,stone);
 m.box(x,y+3.78,z,1.13,.94,1.13,[.30,.25,.18]);
 for(let side of [-1,1]){
  m.box(x+side*.58,y+3.78,z,.13,.85,1.2,metal);
  m.box(x,y+3.78,z+side*.58,1.2,.85,.13,metal);
 }
 m.box(x,y+3.8,z,.75,.76,.78,[1,.65,.25],.78);
 m.box(x,y+4.33,z,1.75,.24,1.75,stone);
 m.cone(x,y+4.45,z,1.18,.84,tint(stone,.73),8,.22);
 m.spike(x,y+5.22,z,.15,.5,[.64,.52,.31],.25);
}
function ancientRailing(m,centerZ,side,startZ,endZ,offset=10.8){
 const mahogany=[.32,.14,.08],wood=[.48,.22,.12],black=[.08,.08,.085];
 let prev=null;
 for(let z=startZ;z<=endZ+.01;z+=3.25){
  const x=roadCenter(z)+side*offset,y=height(x,z);
  m.box(x,y+1.75,z,.42,3.5,.43,mahogany);
  m.box(x,y+3.55,z,.72,.32,.72,wood);
  m.cone(x,y+3.7,z,.37,.7,black,7,0);
  if(prev){const dz=z-prev.z,dx=x-prev.x,len=Math.hypot(dx,dz),rot=Math.atan2(dx,dz),midX=(x+prev.x)/2,midZ=(z+prev.z)/2,baseY=Math.min(y,prev.y);
    for(const level of [1.15,2.85])m.box(midX,baseY+level,midZ,.30,.25,len+.28,wood,0,rot);
  }
  prev={x,y,z};
 }
}
function wetlandWater(m,xx,zz,seed=1){
 const rx=6+hash(seed+1)*4,rz=9+hash(seed+2)*5,sy=height(xx,zz)+.055;
 const col=[.067,.21,.23],foam=[.17,.44,.43];let n=28;
 for(let i=0;i<n;i++){
  const a=i/n*TAU,b=(i+1)/n*TAU;
  const p=(t,r)=>[xx+Math.cos(t)*rx*r,sy,zz+Math.sin(t)*rz*r];
  m.tri([xx,sy,zz],p(a,.97),p(b,.97),col,.095);
  if(i%2===0)m.tri(p(a,.82),p(b,.88),p(b,.96),tint(col,1.28),.14);
 }
 for(let i=0;i<4;i++){
  let x=xx+(hash(seed+i*17)-.5)*rx*1.5,z=zz+(hash(seed+i*31)-.5)*rz*1.4;
  m.ring(x,sy+.035,z,.42+i*.2,.018,foam,.075);
 }
}
function proceduralHDScenery(m,idx){
 const c=regions[idx],base=idx*LEN;
 const ultra=quality==='cinematic',high=quality==='high',low=quality==='low';
 // Architectural silhouettes are visible even from a modest screen size.
 if(idx===0||idx===1){
  const woodland=idx===1;
  for(let k=0;k<(low?45:ultra?220:high?140:90);k++){
   const seed=idx*20083+k*107.17;
   const z=base+12+hash(seed+21)*(woodland?198:120),width=14+hash(seed+18)*34;
   const x=roadCenter(z)+(hash(seed+19)>.5?1:-1)*width;
   bambooCluster(m,x,z,seed,woodland);
  }
  for(let j=0;j<3;j++){
   const z=base+(idx===0?36:30)+j*(idx===0?38:58),cx=roadCenter(z);
   monumentalTorii(m,cx,z,idx*31+j,idx===1?1:0);
  }
  const count=low?4:9;
  for(let j=0;j<count;j++){
   const z=base+22+j*(idx===0?11:19),center=roadCenter(z);
   for(let side of [-1,1])stoneLantern(m,center+side*(11.6+(j%3)*.5),z,idx*100+j*2+side);
  }
  if(!low){
   for(let side of [-1,1])ancientRailing(m,0,side,base+64,base+93,10.9);
   for(let j=0;j<4;j++){
    const z=base+68+j*9,x=roadCenter(z)+33*(j%2?1:-1);
    wetlandWater(m,x,z,idx*33+j);
   }
  }
 }
 // Ancient stone detail varies independently per biome; no extra collision bodies.
 const old=m.solidWorld;m.solidWorld=false;
 const rubble=low?70:ultra?690:high?360:185;
 for(let k=0;k<rubble;k++){
  const sd=idx*4777+k*17.133,z=base+hash(sd+7)*LEN;
  const x=(hash(sd+9)*2-1)*75,dist=Math.abs(x-roadCenter(z));
  if(dist<10.8)continue;
  const y=height(x,z),r=.14+hash(sd+13)*.49;
  if(k%5===0){
   m.box(x,y+.06,z,r*1.6,.12,r*.88,tint(c.stone,.44+hash(sd+14)*.45),0,hash(sd+16)*TAU);
   m.box(x+r*.43,y+.06,z-r*.27,r*.65,.11,r*.49,tint(c.stone,.52+hash(sd+24)*.32),0,hash(sd+13)*TAU);
  }else if(k%9===0){
   m.spike(x,y,z,.065+hash(sd+4)*.1,.28+hash(sd+8)*.5,tint(c.flora,.92),.02);
  }else{
   // Ground-hugging pebbles contribute varied specular highlights without floating.
   const p0=[x-r,y+.018,z-r*.5],p1=[x+r,y+.035,z-r*.23],p2=[x+.3*r,y+.11+hash(sd+4)*r*.25,z+r];
   m.tri(p0,p1,p2,tint(c.stone,.50+hash(sd+6)*.46));
  }
 }
 m.solidWorld=old;
}

function decoration(m,zidx){let c=regions[zidx],base=zidx*LEN;let num=185;for(let i=0;i<num;i++){
 let z=base+4+hash(i+zidx*1245)* (LEN-8),x=(hash(i*71+zidx*87)*2-1)*76;
 if(Math.abs(x-roadCenter(z))<17)continue;
 let y=height(x,z),r=hash(i*3+zidx),seed=i+zidx*193;
 if(c.kind==='forest'){
 if(r<.72)tree(m,x,z,c,seed);else if(r<.9)m.rock(x,y,z,1+hash(seed)*1.8,c.stone,seed);else m.spike(x,y,z,.5,2.5,c.accent,.34);
 }else if(c.kind==='bones'){
 if(r<.3)boneCluster(m,x,z,c,seed);else if(r<.7)m.spike(x,y,z,.5+hash(seed)*1.3,2+hash(seed+6)*4,c.accent,.3);else m.rock(x,y,z,.8+hash(seed+4)*1.9,c.stone,seed);
 }else if(c.kind==='sky'){
 if(r<.7)m.spike(x,y,z,.6+hash(seed)*2,3+hash(seed+5)*7,c.accent,.3);else ruin(m,x,z,c,0);
 }else if(c.kind==='obsidian'){
 if(r<.6)m.spike(x,y,z,.9+hash(seed)*1.4,3+hash(seed+5)*5,c.accent,.5);else if(r<.82)m.rock(x,y,z,2,c.stone,seed);else ruin(m,x,z,c,1);
 }else if(c.kind==='mourning'){
 if(r<.35)tree(m,x,z,c,seed);else if(r<.72)ruin(m,x,z,c,0);else m.rock(x,y,z,1.8,c.stone,seed);
 }else if(c.kind==='throne'){
 if(r<.32)tower(m,x,z,c,seed);else if(r<.7)ruin(m,x,z,c,1);else m.rock(x,y,z,2.4,c.stone,seed);
 }else{
 if(r<.35)ruin(m,x,z,c,0);else if(r<.65)m.rock(x,y,z,1+hash(seed+5)*2.5,c.stone,seed);else m.spike(x,y,z,.6,3+hash(seed)*3,c.accent,.27);
 }
 }
 carvedRoad(m,zidx);
 vistaStructures(m,zidx);
 proceduralHDScenery(m,zidx);
 // Stage landmarks, paths and atmospheric structures.
 for(let j=0;j<5;j++)for(let side of [-1,1]){let z=base+22+j*(LEN-25)/5,x=roadCenter(z)+side*(25+hash(z)*7);if(c.kind==='forest')tree(m,x,z,c,j);else if(c.kind==='throne'||c.kind==='sky')tower(m,x,z,c,j+zidx);else ruin(m,x,z,c,j%3===0?1:0)}
 {const a=shrinePoint(zidx);shrine(m,a.x,a.z,c,false)}
  {const p=portalPoint(zidx);gate(m,p.z,c,p.x)}
 // A readable route through the level: ancient braziers and carved road stones.
 for(let t=0;t<6;t++){
   let z=base+20+t*(LEN-42)/5;
    for(let side of [-1,1]){
      let x=roadCenter(z)+side*10.8,y=height(x,z);
     m.box(x,y+.55,z,1.35,1.05,1.3,tint(c.stone,.64));
     m.box(x,y+1.24,z,1.72,.25,1.6,tint(c.stone,1.16));
     m.spike(x,y+1.36,z,.36,1.55,c.accent,.82);
     m.ring(x,y+.12,z,1.16,.09,c.accent,.23);
   }
   let yy=height(roadCenter(z),z);
    for(let stp=-1;stp<=1;stp++){
      let xx=roadCenter(z)+stp*3.8;
     m.box(xx,yy-.05,z+2.8,2.5,.07,1.6,tint(c.stone,.73));
   }
 }

  // Biome-specific secrets: each land has a different silhouette, not recolored clones.
 for(let scene=0;scene<3;scene++){
   const z=base+LEN*(.16+scene*.30),side=scene%2?-1:1,x=roadCenter(z)+side*(52+scene*4),y=height(x,z);
   if(c.kind==='forest'){
     m.box(x,y+3.2,z,2.2,6.4,2.2,tint(c.stone,.45));
     for(let a=0;a<8;a++){
       let theta=a*TAU/8,xx=x+Math.cos(theta)*6,zz=z+Math.sin(theta)*6,yy=height(xx,zz);
       m.cone(xx,yy,zz,.58,5.7,tint(c.flora,.65),7,.08);
     }
     m.ellipsoid(x,y+8,z,7,2.9,6,tint(c.flora,.83),.1,5,8);
   }else if(c.kind==='bones'){
     for(let a=0;a<8;a++){let theta=a*TAU/8,xx=x+Math.cos(theta)*7,zz=z+Math.sin(theta)*7;
       m.cone(xx,height(xx,zz),zz,.48,5+hash(a+scene)*4,tint(c.stone,.62),6,0);}
     m.spike(x,y+.6,z,1.5,6.5,tint(c.accent,.6),.6);
   }else if(c.kind==='sky'){
     for(let a=0;a<5;a++){let theta=a*TAU/5,xx=x+Math.cos(theta)*6,zz=z+Math.sin(theta)*6;
       m.rock(xx,y+8+a%2*3,zz,2.7,tint(c.stone,.7),a+scene*37);}
     m.spike(x,y+3,z,1.5,6,c.accent,.8);
   }else if(c.kind==='throne'){
     m.box(x,y+1.7,z,11,3.4,11,tint(c.stone,.59));
     for(let side of [-1,1])m.spike(x+side*5,y+3.4,z,.8,5,c.accent,.8);
     m.ring(x,y+.2,z,9,.3,c.accent,.38);
   }else if(c.kind==='obsidian'){
     for(let a=0;a<6;a++){let theta=a*TAU/6,xx=x+Math.cos(theta)*5,zz=z+Math.sin(theta)*5;
       m.spike(xx,height(xx,zz),zz,1.2,6+hash(scene*11+a)*6,c.accent,.65);}
   }else if(c.kind==='mourning'){
     for(let a=0;a<10;a++){let theta=a*TAU/10,xx=x+Math.cos(theta)*8,zz=z+Math.sin(theta)*8;
       m.box(xx,height(xx,zz)+1,zz,1.2,2.0,.7,tint(c.stone,.6),0,theta);}
     m.spike(x,y,z,.75,3,c.accent,.5);
   }else{
     for(let a=0;a<5;a++){let theta=a*TAU/5,xx=x+Math.cos(theta)*7,zz=z+Math.sin(theta)*7;
       m.spike(xx,height(xx,zz),zz,.75,5,c.accent,.45);}
   }
 }
 // Three landmark outposts in each realm, deliberately placed off the main route.
 for(let u=0;u<3;u++){
   const local=[.17,.48,.77][u],z=base+local*LEN,sg=(u%2?1:-1),x=roadCenter(z)+sg*(47+(zidx%3)*6),y=height(x,z);
   m.ring(x,y+.1,z,9,.28,tint(c.accent,.62),.22);
   for(let q=0;q<5;q++){
     const a=q*TAU/5+(u*.33),sx=x+Math.cos(a)*8,sz=z+Math.sin(a)*8,sy=height(sx,sz);
     m.box(sx,sy+1.8,sz,1.15,3.6,1.2,tint(c.stone,.64));
     m.spike(sx,sy+3.6,sz,.30,1.1,c.accent,.22);
   }
   if(u===1){m.spike(x,y+.5,z,2.25,7.5,tint(c.accent,.67),.52);}
   else{m.box(x,y+2,z,3,4,3,tint(c.stone,.72));m.spike(x,y+4.2,z,1.2,4.8,c.accent,.4);}
 }
 // A second winding stone path loops through a side valley instead of straight corridors.
  for(let row=0;row<58;row++){
    const t=row/57,z=base+LEN*(.34+t*.54);
    const offset=Math.sin(t*Math.PI)*(zidx%2?-21:21),xx=roadCenter(z)+offset;
    for(let lane=-2;lane<=2;lane++){
      const x=xx+lane*1.48+(row%2?.25:0),y=height(x,z),seed=zidx*1701+row*31+lane;
      m.box(x,y+.055,z,1.29,.14,1.42,tint(c.stone,.46+hash(seed)*.24),0,(hash(seed+3)-.5)*.2);
    }
    if(row%14===0){let yy=height(xx,z);m.spike(xx,yy+.1,z,.27,1.4,c.accent,.28)}
  }
  // Optional portal at the end of the branch path: an alternate world connection.
  {let portal=sidePortalPoint(zidx),y=height(portal.x,portal.z);
   m.ring(portal.x,y+.20,portal.z,4.4,.28,c.accent,.55);
   for(let k=0;k<6;k++){let ang=k*TAU/6;
    m.spike(portal.x+Math.cos(ang)*5.1,y,portal.z+Math.sin(ang)*5.1,.24,1.9,c.accent,.62);}
  }
 if(c.kind==='throne'){
 let z=base+LEN*.78,cx=roadCenter(z)-22,y=height(cx,z);m.box(cx,y+2,z,15,4,15,tint(c.stone,.8));for(let x of [cx-5,cx+5])m.box(x,y+7,z,2,9,2,tint(c.stone,.8));m.box(cx,y+8,z,11,2,2,tint(c.stone,1.2));m.spike(cx,y+9,z,2.3,8,c.accent,.65);
 }
 if(c.kind==='sky')for(let j=0;j<13;j++){let xx=(hash(j*11+5)-.5)*100,zz=base+hash(j*9+1)*LEN,yy=height(xx,zz);const r=2.6+hash(j+9)*2.2;m.rock(xx,yy,zz,r,c.stone,j+50);m.spike(xx,yy+r*.6,zz,.7,2.1,c.accent,.35)}
 if(c.kind==='obsidian'){
 let z=base+99,y=height(0,z);for(let k=0;k<12;k++){let a=k/12*TAU,x=Math.cos(a)*18,zz=z+Math.sin(a)*18;m.spike(x,height(x,zz),zz,1.2,10,c.accent,.56)}
 m.ring(0,y+.3,z,20,.4,c.accent,.42);
 }
}

// Procedural micro-scenery: authored once per realm; no runtime object allocations.
// Cosmetic detail does NOT add bogus collision invisible walls.
function realmSurfaceRelief(m,idx){
 const c=regions[idx],base=idx*LEN;
 const ultra=quality==='cinematic',high=quality==='high';
 const count=ultra?1130:high?820:quality==='balanced'?460:165;
 const original=m.solidWorld;m.solidWorld=false;
 const pale=tint(c.stone,.91),dark=tint(c.stone,.42),lichen=tint(c.flora,.65);
 for(let j=0;j<count;j++){
   const seed=idx*21803+j*129.23;
   const z=base+2+hash(seed)*246;
   const x=(hash(seed+21)*2-1)*74;
   const y=height(x,z),away=Math.abs(x-roadCenter(z));
   // Keep the traversable road readable. Small objects have no collision.
   if(away<9.4){
      if(j%17===0){
        const xx=x,zz=z,r=.36+hash(seed+3)*.3;
        m.ring(xx,y+.15,zz,r,.025,tint(c.accent,.25),.06);
      }
      continue;
   }
   const rnd=hash(seed+51);
   if(rnd<.44){
     // Sharp layered rock chips, naturally resting on the sampled ground.
     const rr=.12+hash(seed+5)*.34;
     const t=hash(seed+47)*6.283;
     m.tri([x-.7*rr,y+.025,z],[x+.9*rr,y+.025,z+.25*rr],[x+Math.cos(t)*rr,y+rr*.32,z+Math.sin(t)*rr],tint(pale,.48+hash(seed+11)*.42));
     if(high||ultra)m.tri([x-.5*rr,y+.03,z-.25*rr],[x+.9*rr,y+.04,z+.2*rr],[x+.2*rr,y+rr*.5,z],dark);
   } else if(rnd<.76){
     const h=.20+hash(seed+31)*.67,blade=.045+hash(seed+77)*.085;
     const leaf=c.kind==='ash'||c.kind==='throne'?tint(c.flora,.71):c.kind==='sky'?tint(c.accent,.44):lichen;
     for(let k=0;k<(ultra?4:high?3:2);k++){
       const a=k*1.9+hash(seed+68)*3.2;
       const dx=Math.cos(a)*blade,dz=Math.sin(a)*blade;
       m.tri([x-dx,y+.02,z-dz],[x+dx,y+.02,z+dz],[x+dx*.3,y+h,z+dz*.3],tint(leaf,.74+hash(seed+k)*.26));
     }
   } else if(rnd<.92){
     const rad=.21+hash(seed+9)*.33;
     m.rock(x,y-.005,z,rad,tint(c.stone,.55+hash(seed+88)*.34),j);
   } else {
     // Mineral veins and spores, different hue per world.
     const h=.08+hash(seed+51)*.16;
     m.spike(x,y+.005,z,.09+hash(seed+2)*.1,h,tint(c.accent,.43),.27);
   }
 }
 // More intentional high-definition road edge and hand-chiseled markers.
 const marks=ultra?150:high?110:quality==='balanced'?80:35;
 for(let j=0;j<marks;j++){
   const z=base+2+j*(LEN-5)/marks,center=roadCenter(z);
   for(let side of [-1,1]){
     const x=center+side*(8.12+.25*Math.sin(z*.09)),y=height(x,z);
     const a=tint(c.stone,.70+.13*hash(j*13+side+idx));
     m.box(x,y+.10,z,1.55,.11,.78,a,0,(roadCenter(z+.5)-center)*.08);
     if(j%9===0){
       m.ring(x,y+.19,z,.28,.035,tint(c.accent,.63),.18);
       m.box(x,y+.24,z,.12,.1,.45,tint(c.accent,.44),.10);
     }
   }
 }
 // Intricate floor-inlaid rune circles at checkpoint approach; never block players.
 for(const z of [base+LEN*.22,base+LEN*.53,base+LEN*.79]){
   const x=roadCenter(z),y=height(x,z);
   for(let ring=0;ring<3;ring++)m.ring(x,y+.19+ring*.001,z,2.8+ring*.36,.035,tint(c.accent,.30+ring*.10),.15);
   for(let k=0;k<8;k++){
     const a=k*TAU/8,r=3.75;
     const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,py=height(px,pz);
     m.box(px,py+.17,pz,.18,.08,.38,tint(c.accent,.40),.22,-a);
   }
 }
 m.solidWorld=original;
}
function groundMesh(index){let m=new Mesh();m.solidWorld=true;let c=regions[index],st=index*LEN,rows=gl?74:37,cols=gl?65:32;
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
 let x0=-84+i*168/cols,x1=-84+(i+1)*168/cols;
 let z0=st+j*LEN/rows,z1=st+(j+1)*LEN/rows;
 let a=[x0,height(x0,z0),z0],b=[x1,height(x1,z0),z0],d=[x0,height(x0,z1),z1],cc=[x1,height(x1,z1),z1];
 let fleck=.86+rand2(i+index*29,j)*.24;
 let road=Math.max(0,1-Math.abs((x0+x1)*.5-roadCenter((z0+z1)*.5))/15);
 let col=tint(c.ground,fleck*(1-road*.12));
 m.tri(a,cc,b,col);m.tri(a,d,cc,tint(col,.94));
 // geological strata on terrain outer limits, real vertical sides.
 if(i===0||i===cols-1){let v0=i===0?a:b,v1=i===0?d:cc;let bot0=[v0[0],v0[1]-18,v0[2]],bot1=[v1[0],v1[1]-18,v1[2]];m.quad(v0,bot0,bot1,v1,tint(c.stone,.6))}
 }
 decoration(m,index);
 realmSurfaceRelief(m,index);
 return m.get();
}
const ui={hud:$('hud'),overlay:$('overlay'),play:$('play'),resume:$('resume'),restart:$('restart'),settings:$('settings'),title:$('zoneName'),chapter:$('chapNum'),hp:$('hpFill'),mp:$('mpFill'),hpText:$('hpText'),mpText:$('mpText'),essence:$('essence'),seals:$('seals'),quest:$('questText'),toast:$('toast'),splash:$('regionSplash'),minimap:mini,map:$('mapOverlay'),boss:$('boss'),bossName:$('bossName'),bossFill:$('bossFill'),damage:$('damage'),interaction:$('interact')};
let quality='high';try{quality=localStorage.getItem('rubaka3d-quality')||(innerWidth<720?'balanced':'high')}catch{quality=innerWidth<720?'balanced':'high'}if(!['cinematic','high','balanced','low'].includes(quality))quality='high';
const qualityLabel={cinematic:'ULTRA',high:'HIGH',balanced:'MEDIUM',low:'LOW'};
let cameraSensitivity=1,buttonScale=1;
try{cameraSensitivity=clamp(+(localStorage.getItem('landlord-sensitivity')||1),.3,1.7);buttonScale=clamp(+(localStorage.getItem('landlord-buttonscale')||1),.7,1.15)}catch{}
function updateControlPreferences(){
 document.documentElement.style.setProperty('--mobile-button-scale',buttonScale);
 $('sensCam').value=String(Math.round(cameraSensitivity*100));$('sensOutput').textContent=Math.round(cameraSensitivity*100)+'%';
 $('buttonSize').value=String(Math.round(buttonScale*100));$('buttonOutput').textContent=Math.round(buttonScale*100)+'%';
}
$('sensCam').addEventListener('input',e=>{cameraSensitivity=+e.target.value/100;try{localStorage.setItem('landlord-sensitivity',cameraSensitivity)}catch{}updateControlPreferences()});
$('buttonSize').addEventListener('input',e=>{buttonScale=+e.target.value/100;try{localStorage.setItem('landlord-buttonscale',buttonScale)}catch{}updateControlPreferences()});
updateControlPreferences();
const DEFAULT_KEYS={forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD',jump:'Space',dash:'ShiftLeft',attack:'KeyJ',fire:'KeyF',map:'KeyM',pause:'Escape',camera:'KeyV',descend:'KeyX'};
// Keybind changes are deliberately session-only. Reloading restores the original keys.
let keybinds={...DEFAULT_KEYS},bindingPending=null,menuContext='title',settingsOpen=false;
let language='id';try{language=localStorage.getItem('rubaka7-language')==='en'?'en':'id'}catch{}
const translation={
 id:{start:'Mulai Game',resume:'LANJUTKAN',settings:'Settings',settingsTitle:'PENGATURAN',lang:'BAHASA',graphics:'GRAFIK',controls:'KONTROL KEYBOARD',resetKeys:'↺ DEFAULT',touch:'KONTROL SENTUH',touchMove:'Kiri · gerak',touchCamera:'Kanan · kamera',touchAct:'Ketuk · aksi',done:'SELESAI',resetProgress:'RESET PROGRES',mapTitle:'PETA DUNIA',names:['Maju','Mundur','Kiri','Kanan','Lompat','Dash','Serang','Api','Peta','Jeda','Ganti FPP/TPP','Turun (terbang)'],choose:'Tekan tombol baru…',conflict:'Sudah dipakai:',reserved:'Tombol ini dipakai browser',bound:'Tombol berhasil diganti',default:'Tombol dikembalikan',cancel:'Dibatalkan',resetConfirm:'Hapus progres dan mulai lagi?',relic:'RELIK +85',seal:'SEGEL AKTIF',locked:'GERBANG TERKUNCI',level:'LEVEL NAIK',heroReturn:'KEMBALI KE ALTAR',boss:'PENJAGA DIKALAHKAN',victory:'LANDLORD DISELAMATKAN',unlocked:'SKILL TERBUKA',needFire:'Buka segel kedua',needPulse:'Buka segel ketiga',essence:'ESSENCE +12',activate:'AKTIFKAN',collect:'AMBIL',already:'AKTIF'},
 en:{start:'Start Game',resume:'RESUME',settings:'Settings',settingsTitle:'SETTINGS',lang:'LANGUAGE',graphics:'GRAPHICS',controls:'KEYBOARD CONTROLS',resetKeys:'↺ DEFAULT',touch:'TOUCH CONTROLS',touchMove:'Left · move',touchCamera:'Right · camera',touchAct:'Tap · action',done:'DONE',resetProgress:'RESET PROGRESS',mapTitle:'WORLD MAP',names:['Forward','Backward','Left','Right','Jump','Dash','Attack','Fire','Map','Pause','Toggle FPP/TPP','Descend (flight)'],choose:'Press a new key…',conflict:'Already assigned:',reserved:'Reserved by browser',bound:'Key updated',default:'Keys reset',cancel:'Canceled',resetConfirm:'Erase progress and restart?',relic:'RELIC +85',seal:'SEAL ACTIVATED',locked:'GATE LOCKED',level:'LEVEL UP',heroReturn:'RETURNED TO ALTAR',boss:'GUARDIAN DEFEATED',victory:'LANDLORD SAVED',unlocked:'SKILL UNLOCKED',needFire:'Unlock second seal',needPulse:'Unlock third seal',essence:'ESSENCE +12',activate:'ACTIVATE',collect:'COLLECT',already:'ACTIVE'}
};
const T=(k)=>translation[language][k]||k;
const ACTION_IDS=Object.keys(DEFAULT_KEYS);
function keyName(code){return ({Space:'SPACE',ShiftLeft:'SHIFT',ShiftRight:'SHIFT',Escape:'ESC',Enter:'ENTER',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',ControlLeft:'CTRL',ControlRight:'CTRL',AltLeft:'ALT',AltRight:'ALT'}[code] || code.replace(/^Key/,'').replace(/^Digit/,'').replace(/^Numpad/,'NUM '));}
function updateSettingsUI(){
 $('play').textContent=T('start');$('resume').textContent=T('resume');$('settings').textContent=T('settings');$('settingsTitle').textContent=T('settingsTitle');
 $('languageLabel').textContent=T('lang');$('graphicsLabel').textContent=T('graphics');$('controlsLabel').textContent=T('controls');
 $('sensLabel').textContent=language==='id'?'SENSITIVITAS KAMERA':'CAMERA SENSITIVITY';
 $('buttonLabel').textContent=language==='id'?'UKURAN TOMBOL HP':'MOBILE BUTTON SIZE';
 $('creditTitle').textContent=language==='id'?'PEMBUAT GAME':'GAME CREATED BY';$('resetKeys').textContent=T('resetKeys');$('touchLabel').textContent=T('touch');$('touchMoveGuide').textContent=T('touchMove');$('touchCamGuide').textContent=T('touchCamera');$('touchTapGuide').textContent=T('touchAct');$('closeSettings').textContent=T('done');$('restart').textContent=T('resetProgress');$('mapTitle').textContent=T('mapTitle');
 for(const b of document.querySelectorAll('[data-lang]'))b.classList.toggle('selected',b.dataset.lang===language);
 for(const b of document.querySelectorAll('[data-graphics]'))b.classList.toggle('selected',b.dataset.graphics===quality);
 const grid=$('keyGrid');grid.textContent='';
 ACTION_IDS.forEach((act,i)=>{const cell=document.createElement('div');cell.className='key-row';let text=document.createElement('span');text.className='action-name';text.textContent=T('names')[i];let btn=document.createElement('button');btn.type='button';btn.className='bind-button'+(bindingPending===act?' capturing':'');btn.dataset.bind=act;btn.textContent=bindingPending===act?'…':keyName(keybinds[act]);btn.setAttribute('aria-label',text.textContent+' '+btn.textContent);btn.addEventListener('click',()=>{bindingPending=act;$('bindingNotice').textContent=T('choose');$('bindingNotice').className='binding-notice';updateSettingsUI()});cell.append(text,btn);grid.appendChild(cell)});
}
function showMenuPanel(){settingsOpen=false;bindingPending=null;$('settingsPanel').hidden=true;$('menuScene').hidden=false;updateSettingsUI()}
function openSettings(){settingsOpen=true;bindingPending=null;$('menuScene').hidden=true;$('settingsPanel').hidden=false;$('bindingNotice').textContent='';$('bindingNotice').className='binding-notice';updateSettingsUI()}
function chooseBinding(code){
 const act=bindingPending;if(!act)return;
 const avoid=['F3','F5','F11','F12','Tab','CapsLock','MetaLeft','MetaRight','ControlLeft','ControlRight','AltLeft','AltRight'];
 if(code==='Escape'&&act!=='pause'){bindingPending=null;$('bindingNotice').textContent=T('cancel');updateSettingsUI();return;}
 if(avoid.includes(code)){$('bindingNotice').textContent=T('reserved');$('bindingNotice').className='binding-notice warning';return;}
 const occupied=ACTION_IDS.find(id=>id!==act&&keybinds[id]===code);
 if(occupied){$('bindingNotice').textContent=T('conflict')+' '+T('names')[ACTION_IDS.indexOf(occupied)];$('bindingNotice').className='binding-notice warning';return;}
 keybinds[act]=code;bindingPending=null;$('bindingNotice').textContent=T('bound');$('bindingNotice').className='binding-notice success';updateSettingsUI();
}
$('settings').addEventListener('click',openSettings);
$('backSettings').addEventListener('click',showMenuPanel);
$('closeSettings').addEventListener('click',showMenuPanel);
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{language=b.dataset.lang;try{localStorage.setItem('rubaka7-language',language)}catch{}updateSettingsUI()}));
document.querySelectorAll('[data-graphics]').forEach(b=>b.addEventListener('click',()=>{setGraphicsQuality(b.dataset.graphics,true)}));
$('resetKeys').addEventListener('click',()=>{keybinds={...DEFAULT_KEYS};bindingPending=null;$('bindingNotice').textContent=T('default');$('bindingNotice').className='binding-notice success';updateSettingsUI()});
function isBound(action,code){return keybinds[action]===code}
updateSettingsUI();
let shadowState=null,shadowMatrix=null,shadowTick=0;let gl=null,glP=null,ctx=null,mode='gpu',res=1,vbo=null,staticBuffers=[],indexLocations={},drawCalls=0,clock=0,viewProj=null;
function compileShader(type,source){
 // WebGL2 uses explicit GLSL ES 3.00 inputs/outputs; retain WebGL1 fallback.
 if(typeof WebGL2RenderingContext!=='undefined'&&gl instanceof WebGL2RenderingContext){
  if(type===gl.VERTEX_SHADER)source='#version 300 es\n'+source.replace(/\battribute\b/g,'in').replace(/\bvarying\b/g,'out');
  else source='#version 300 es\n'+source.replace(/\bvarying\b/g,'in').replace(/\btexture2D\b/g,'texture').replace(/\bgl_FragColor\b/g,'landlordFragColor').replace(/precision highp float;/,'precision highp float;\nout vec4 landlordFragColor;');
 }
 let s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Shader: '+gl.getShaderInfoLog(s));return s}
