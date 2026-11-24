// Create by LamberthRumpaidus | Generated offline runtime
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
 tri(a,b,c,col,emit=0){a=this.pt(a);b=this.pt(b);c=this.pt(c);const n=norm(cross(sub(b,a),sub(c,a)));for(const p of [a,b,c])this.d.push(...p,...n,...col,emit+(this.material||0)*16)}
 quad(a,b,c,d,col,emit=0){this.tri(a,b,c,col,emit);this.tri(a,c,d,col,emit)}
 smoothTri(points,normals,col,emit=0){const origin=this.pt([0,0,0]);for(let i=0;i<3;i++){const p=this.pt(points[i]),n=norm(sub(this.pt(normals[i]),origin));this.d.push(...p,...n,...col,emit+(this.material||0)*16);}}
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
 // Compacted road foundation between cobbles, following the spline and terrain.
 for(let row=0;row<Math.ceil(LEN/2);row++){
  const z0=base+row*2,z1=Math.min(base+LEN,z0+2),x0=roadCenter(z0),x1=roadCenter(z1);
  const p=(x,z)=>[x,height(x,z)+.035,z];
  for(let lane=-4;lane<4;lane++){const o=lane*2,n=(lane+1)*2; m.quad(p(x0+o,z0),p(x1+o,z1),p(x1+n,z1),p(x0+n,z0),tint(reg.stone,.41+.06*hash(row*17+lane)));}
 }
 // Every hand-sized cobble is actual 3D geometry; staggered, worn and slightly irregular.
 for(let row=0;row<Math.ceil((LEN-2)/1.32);row++){
  let z=base+row*1.32+.2,center=roadCenter(z);
  for(let lane=-5;lane<=5;lane++){
   const seed=idx*7700+row*63+lane*199;
   if(hash(seed)<.075)continue;
   let xx=center+lane*1.38+(row%2?.36:0)+(hash(seed+3)-.5)*.12;
   const y=height(xx,z),w=1.16+hash(seed+7)*.20,d=1.05+hash(seed+17)*.17;
   let factor=.48+hash(seed+26)*.34,roadColor=tint(col,factor+(lane%3===0?.07:0));
   m.slab(xx,z,w,d,.065+hash(seed+9)*.035,roadColor,(hash(seed+35)-.5)*.18);
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
 const old=m.solidWorld,previousMaterial=m.material;m.solidWorld=false;
 const steps=7;for(let j=0;j<steps;j++){
  const a=j/steps,b=(j+1)/steps;
  const flex=Math.sin(seed*.35+j*.44)*.19;
  m.material=1;m.cone(xx+flex*.4,y+h*a,zz+flex*.2,r*(1-a*.25),h/steps,tint(stem,.73+.22*j/steps),7,r*(1-b*.25),0);
  m.ring(xx+flex*.4,y+h*b,zz+flex*.2,r*(1-a*.22)*1.25,.028,[.44,.43,.18],.02);
  if(j>=3&&j<=6){m.material=2;
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
 m.solidWorld=old;m.material=previousMaterial;
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
 const previousMaterial=m.material;m.material=3;
 const rx=6+hash(seed+1)*4,rz=9+hash(seed+2)*5,sy=height(xx,zz)+.055;
 const col=[.067,.21,.23],foam=[.17,.44,.43];let n=28;
 for(let i=0;i<n;i++){
  const a=i/n*TAU,b=(i+1)/n*TAU;
  const p=(t,r)=>[xx+Math.cos(t)*rx*r,sy,zz+Math.sin(t)*rz*r];
  m.tri([xx,sy,zz],p(a,.97),p(b,.97),col,.095);
  if(i%2===0)m.tri(p(a,.82),p(b,.88),p(b,.96),tint(col,1.28),.14);
 }
 m.material=previousMaterial;
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
// Create by LamberthRumpaidus
let cinematicPipeline=null,materialLibrary=null,particleBatch=null;
function initRenderer(){
 try{gl=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'high-performance'})||canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'high-performance'});}catch{}
 if(!gl){mode='cpu';ctx=canvas.getContext('2d',{alpha:true});if(!ctx)throw Error('Canvas 2D unavailable');return;}
 try{
 const vertex=`attribute vec3 aPos;attribute vec3 aNormal;attribute vec3 aColor;attribute float aEmit;uniform mat4 uVP;uniform vec3 uCam;varying vec3 vColor;varying vec3 vNormal;varying float vFog;varying float vEm;varying float vMaterial;varying vec3 vWorld;varying vec4 vShadow;uniform mat4 uShadowVP;
 void main(){vShadow=uShadowVP*vec4(aPos,1.);vColor=aColor;vNormal=aNormal;vMaterial=floor(aEmit/16.);vEm=mod(aEmit,16.);vWorld=aPos;vFog=distance(aPos,uCam);gl_Position=uVP*vec4(aPos,1.0);}`;
 const fragment=`precision highp float;varying vec3 vColor;varying vec3 vNormal;varying float vFog;varying float vEm;varying float vMaterial;varying vec3 vWorld;uniform vec3 uCam;uniform vec3 uFogColor;uniform vec3 uLight;uniform float uTime;uniform vec4 uTorch0;uniform vec4 uTorch1;uniform vec3 uTorchColor;uniform sampler2D uShadow;uniform float uShadows;uniform float uShadowTexel;uniform sampler2D uMossMap;uniform sampler2D uStoneMap;uniform float uMaterialDetail;uniform float uWorldSurface;uniform sampler2D uBarkMap;uniform sampler2D uLeafMap;uniform sampler2D uWaterMap;varying vec4 vShadow;
 float hash3(vec3 p){p=fract(p*.1031);p+=dot(p,p.yxz+33.33);return fract((p.x+p.y)*p.z);}
 float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
 void main(){
  vec3 N=normalize(vNormal),V=normalize(uCam-vWorld),L=normalize(uLight),H=normalize(L+V);
  float micro=noise3(vWorld*2.15),tiny=noise3(vWorld*11.6),moss=noise3(vWorld*.25);
  float ground=smoothstep(.80,.96,N.y),bricks=abs(sin(vWorld.x*1.84+sin(vWorld.z*.76)*.1)*sin(vWorld.z*2.15));
  float fissure=1.0-smoothstep(.025,.13,abs(sin(vWorld.x*3.65+vWorld.z*.62)*sin(vWorld.z*4.23)));
  float wetness=smoothstep(.53,.9,noise3(vWorld*.53+vec3(7.,2.,0.)));
  float rough=(micro-.5)*.27+(tiny-.5)*.15-fissure*.085;
  float grunge=mix(1.,.74+.48*micro,ground);
  vec3 base=vColor*(.83+rough)*grunge;
  base=mix(base,base*vec3(.72,.79,.68),ground*max(0.,moss-.63)*.9);
  // World-space texture projections, blended by surface orientation.
  float textureTone=.5;
  if(uMaterialDetail>.5&&uWorldSurface>.5){
   vec3 weights=pow(abs(N),vec3(4.));weights/=max(.001,weights.x+weights.y+weights.z);
   vec3 stone=texture2D(uStoneMap,vWorld.zy*.24).rgb*weights.x+texture2D(uStoneMap,vWorld.xz*.24).rgb*weights.y+texture2D(uStoneMap,vWorld.xy*.24).rgb*weights.z;
   vec3 mossTex=texture2D(uMossMap,vWorld.xz*.20).rgb;
   textureTone=mix(dot(stone,vec3(.299,.587,.114)),dot(mossTex,vec3(.299,.587,.114)),ground*.75);
   base*=mix(.68,1.38,textureTone);
   #if __VERSION__ >= 300
   if(vMaterial>.5&&vMaterial<1.5){
    vec2 barkUV=vec2((vWorld.x+vWorld.z)*.70,vWorld.y*.13);
    vec3 bark=texture2D(uBarkMap,barkUV).rgb;
    textureTone=dot(bark,vec3(.299,.587,.114));base=mix(vColor*.55,vColor*1.45,textureTone);
   }else if(vMaterial>1.5&&vMaterial<2.5){
    vec3 leaf=texture2D(uLeafMap,vWorld.xz*.65).rgb;
    textureTone=dot(leaf,vec3(.299,.587,.114));base=mix(vColor*.70,vColor*1.62,textureTone);
    base+=vColor*.12*max(0.,-dot(N,L));
   }else if(vMaterial>2.5){
    vec2 flow=vWorld.xz*.13;vec3 waterA=texture2D(uWaterMap,flow+vec2(uTime*.012,-uTime*.008)).rgb;
    vec3 waterB=texture2D(uWaterMap,flow*.62+vec2(-uTime*.009,uTime*.011)).rgb;
    textureTone=dot((waterA+waterB)*.5,vec3(.299,.587,.114));base=mix(vec3(.025,.065,.085),vec3(.10,.31,.33),textureTone);
    wetness=1.;ground=1.;
   }
   #endif
  }
  #if __VERSION__ >= 300
  vec3 px=dFdx(vWorld),py=dFdy(vWorld);
  vec3 rx=cross(py,N),ry=cross(N,px);
  float determinant=dot(px,rx);
  if(uMaterialDetail>.5&&uWorldSurface>.5&&abs(determinant)>.00001){
   vec3 gradient=sign(determinant)*(dFdx(textureTone)*rx+dFdy(textureTone)*ry);
   N=normalize(abs(determinant)*N-.075*gradient);
  }
  #endif
  float diffuse=max(0.,dot(N,L)),lambert=.15+.82*diffuse;
  float hemi=.17+.17*max(N.y,0.);
  // GGX microfacet specular with procedural roughness. No claim of authored PBR maps.
  float roughness=clamp(mix(.83,.33,wetness)*(ground*.18+.82)+(textureTone-.5)*.18,.22,.94),alpha=roughness*roughness,a2=alpha*alpha;
  float nh=max(.001,dot(N,H)),nv=max(.03,dot(N,V)),nl=max(.001,dot(N,L));
  float denom=nh*nh*(a2-1.)+1.;float distribution=a2/(3.14159*denom*denom);
  float k=pow(roughness+1.,2.)*.125;
  float geometry=nv/(nv*(1.-k)+k)*nl/(nl*(1.-k)+k);
  float fresnel=.04+.96*pow(1.-max(0.,dot(H,V)),5.);
  float spec=min(.28,distribution*geometry*fresnel/max(.01,4.*nv*nl)*nl)*(uWorldSurface>.5?.46:.90);
  float edgeLight=pow(1.-abs(dot(N,V)),5.)*.095;
  float rim=pow(max(0.,1.-dot(N,V)),3.2)*.18;
  float visibility=1.;
  if(uShadows>.5){
    vec3 sc=vShadow.xyz/max(.0001,vShadow.w);sc=sc*.5+.5;
    if(sc.x>.003&&sc.x<.997&&sc.y>.003&&sc.y<.997&&sc.z>.001&&sc.z<.997){
      float bias=.0015+(.0045*(1.-diffuse));
      float occluded=0.;
      for(int xx=-1;xx<=1;xx++)for(int yy=-1;yy<=1;yy++){
        float nearest=texture2D(uShadow,sc.xy+vec2(float(xx),float(yy))*uShadowTexel).r;
        occluded+=step(nearest+bias,sc.z);
      }
      visibility=1.-occluded/9.*.69;
    }
  }
  // Banded rock strata, fine wet mineral reflections and low-slope moss deposits.
  float strata=smoothstep(.4,.95,noise3(vec3(vWorld.x*.34,vWorld.y*2.7,vWorld.z*.30)));
  float cracks=1.-smoothstep(.015,.07,abs(sin(vWorld.x*3.7)*cos(vWorld.z*3.6)));
  float lichen=smoothstep(.60,.86,noise3(vWorld*.88+vec3(12.,5.,23.)));
  base*=mix(1.,.89,clamp(cracks*.13+strata*.12,0.,1.));
  base=mix(base,base*vec3(.59,.82,.66),lichen*ground*.20);
  vec3 color=base*(lambert*visibility+hemi+rim+edgeLight)+vec3(1.,.84,.64)*spec*visibility;
  // Local lantern radiance: two nearest lanterns, smooth squared attenuation.
  float torch0=pow(max(0.,1.-distance(vWorld,uTorch0.xyz)/max(1.,uTorch0.w)),2.0);
  float torch1=pow(max(0.,1.-distance(vWorld,uTorch1.xyz)/max(1.,uTorch1.w)),2.0);
  float warm=(torch0+torch1)*(0.91+0.09*sin(uTime*7.+vWorld.z*1.7));
  color+=base*uTorchColor*warm*.85;
  // Glossy highlights on wet exposed stone; kept subtle to avoid plastic appearance.
  float facing=pow(1.-max(0.,dot(N,V)),3.);
  color+=vec3(.24,.34,.35)*wetness*ground*facing*.19;
  if(vMaterial>2.5)color+=mix(uFogColor,vec3(.26,.43,.49),.52)*facing*.48;
  // Subtle directional mineral sheen, biome materials stay differentiated.
  float mineral=smoothstep(.77,.96,noise3(vWorld*4.1+vec3(17.)));
  color+=base*mineral*.065*(.45+.55*visibility);
  float flame=1.+sin(uTime*4.2+vWorld.x*2.1+vWorld.z)*.09;
  color+=vColor*min(vEm,2.5)*1.65*flame;
  float valley=exp(-max(0.,vWorld.y-1.)*.13);float fog=1.-exp(-max(0.,vFog-17.)*(.0062+.0048*valley));
  fog=clamp(fog+max(0.,vWorld.y-13.)*.002,0.,.84);
  color=mix(color,uFogColor*vec3(1.12,1.06,1.01),fog);
  // ACES-filmic-inspired tonemap, retaining metal highlights and atmosphere.
  color=max(color,vec3(0.))*.86;color=(color*(2.51*color+.03))/(color*(2.43*color+.59)+.14);
  color=pow(clamp(color,0.,1.),vec3(.87));
  gl_FragColor=vec4(color,1.0);
 }`;
 let p=gl.createProgram();gl.attachShader(p,compileShader(gl.VERTEX_SHADER,vertex));gl.attachShader(p,compileShader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Program: '+gl.getProgramInfoLog(p));glP=p;
 gl.useProgram(p);indexLocations={pos:gl.getAttribLocation(p,'aPos'),normal:gl.getAttribLocation(p,'aNormal'),color:gl.getAttribLocation(p,'aColor'),emit:gl.getAttribLocation(p,'aEmit'),vp:gl.getUniformLocation(p,'uVP'),cam:gl.getUniformLocation(p,'uCam'),fog:gl.getUniformLocation(p,'uFogColor'),light:gl.getUniformLocation(p,'uLight'),time:gl.getUniformLocation(p,'uTime'),torch0:gl.getUniformLocation(p,'uTorch0'),torch1:gl.getUniformLocation(p,'uTorch1'),torchColor:gl.getUniformLocation(p,'uTorchColor'),sVP:gl.getUniformLocation(p,'uShadowVP'),shadow:gl.getUniformLocation(p,'uShadow'),shadows:gl.getUniformLocation(p,'uShadows'),shadowTexel:gl.getUniformLocation(p,'uShadowTexel'),mossMap:gl.getUniformLocation(p,'uMossMap'),stoneMap:gl.getUniformLocation(p,'uStoneMap'),materialDetail:gl.getUniformLocation(p,'uMaterialDetail'),worldSurface:gl.getUniformLocation(p,'uWorldSurface'),barkMap:gl.getUniformLocation(p,'uBarkMap'),leafMap:gl.getUniformLocation(p,'uLeafMap'),waterMap:gl.getUniformLocation(p,'uWaterMap')};
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
 vbo=gl.createBuffer();
 try{materialLibrary=new LandlordMaterialLibrary(gl);}catch(ex){console.warn('Material fallback',ex);}
 try{particleBatch=new LandlordParticleBatch(gl);}catch(ex){console.warn('Particle instancing fallback',ex);}
 try{cinematicPipeline=new LandlordCinematicPipeline(gl);}catch(ex){console.warn('Postprocessing fallback',ex);}
 try{initShadows()}catch(ex){console.warn('Shadow mapping unsupported',ex);shadowState=null;}
 }catch(e){console.warn('WebGL shader failed; falling back to software-3D',e);mode='cpu';gl=null;const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);canvas=replacement;ctx=canvas.getContext('2d',{alpha:true});if(!ctx){throw e}}
}
function uploadStatics(){if(!gl)return;for(const b of staticBuffers)if(b?.buffer)gl.deleteBuffer(b.buffer);staticBuffers=[];
 // Build colliders for all seven realms, but only allocate GPU buffers near the player.
 for(let j=0;j<7;j++){const {data,chunks}=LandlordGeometry.partition(groundMesh(j));staticBuffers.push({data,chunks,buffer:null,count:data.length/10,lastUsed:0});}
}
let gpuStamp=0;
function ensureGpuRealm(index){
 const r=staticBuffers[index];if(!r||!gl)return null;
 r.lastUsed=++gpuStamp;
 if(!r.buffer){r.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,r.buffer);gl.bufferData(gl.ARRAY_BUFFER,r.data,gl.STATIC_DRAW);}
 let allocated=staticBuffers.filter(b=>b&&b.buffer);
 if(allocated.length>3){for(const old of allocated.sort((a,b)=>a.lastUsed-b.lastUsed)){
   if(allocated.length<=3)break;
   if(old===r||Math.abs(staticBuffers.indexOf(old)-zoneOf(player.z))<=1)continue;
   gl.deleteBuffer(old.buffer);old.buffer=null;allocated=allocated.filter(b=>b!==old);
 }}return r;
}
function bindData(buffer){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const s=40,a=indexLocations;for(const [loc,sz,ofs] of [[a.pos,3,0],[a.normal,3,12],[a.color,3,24],[a.emit,1,36]]){if(loc<0)continue;gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,sz,gl.FLOAT,false,s,ofs)}}
function perspective(fov,aspect,near,far){let f=1/Math.tan(fov/2),r=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*r,-1,0,0,2*far*near*r,0])}
function lookAt(eye,target){let z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1])}
function multiply(a,b){let r=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r}

function ortho(l,r,b,t,n,f){return new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1])}
function initShadows(){
 if(!gl||!(gl instanceof WebGL2RenderingContext))return;
 if(quality==='low')return;
 const sz=Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE),quality==='cinematic'?2048:quality==='high'?1024:512);
 const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,sz,sz,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,tex,0);
 gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);
 if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE){gl.bindFramebuffer(gl.FRAMEBUFFER,null);throw Error('Depth framebuffer incomplete')}
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);
 const shader=(type,source)=>compileShader(type,source);
 const vert=`attribute vec3 aPos;uniform mat4 uLightVP;void main(){gl_Position=uLightVP*vec4(aPos,1.0);}`;
 const frag=`precision highp float;void main(){gl_FragColor=vec4(1.0);}`;
 const prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vert));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(prog);
 if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error('Shadow link: '+gl.getProgramInfoLog(prog));
 shadowState={tex,fb,sz,prog,pos:gl.getAttribLocation(prog,'aPos'),vp:gl.getUniformLocation(prog,'uLightVP')};
}
let appliedShadowQuality=quality;
function syncShadowQuality(){
 if(!gl||appliedShadowQuality===quality)return;
 appliedShadowQuality=quality;
 if(shadowState){gl.deleteTexture(shadowState.tex);gl.deleteFramebuffer(shadowState.fb);gl.deleteProgram(shadowState.prog);}
 shadowState=null;shadowMatrix=null;shadowTick=0;
 try{initShadows()}catch(ex){console.warn('Shadow quality fallback',ex);}
}
function paintShadowMap(dynamicData){
 if(!shadowState||quality==='low')return;
 // Rotate the shadow volume around the hero; only nearby objects need cast shadows.
 const target=[player.x,player.y+2.5,player.z+17],sun=[target[0]-32,target[1]+58,target[2]+29];
 shadowMatrix=multiply(ortho(-57,57,-57,57,1,180),lookAt(sun,target));
 let ss=shadowState;
 gl.bindFramebuffer(gl.FRAMEBUFFER,ss.fb);gl.viewport(0,0,ss.sz,ss.sz);gl.clear(gl.DEPTH_BUFFER_BIT);
 gl.colorMask(false,false,false,false);gl.useProgram(ss.prog);gl.uniformMatrix4fv(ss.vp,false,shadowMatrix);
 // Position is the first attribute with 40-byte vertex stride.
 const draw=(buf,n,chunks=null)=>{gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(ss.pos);gl.vertexAttribPointer(ss.pos,3,gl.FLOAT,false,40,0);if(chunks){const frustum=LandlordGeometry.planes(shadowMatrix);for(const chunk of chunks){if(LandlordGeometry.visible(chunk,frustum)){gl.drawArrays(gl.TRIANGLES,chunk.first,chunk.count);drawCalls++;}}}else{gl.drawArrays(gl.TRIANGLES,0,n);drawCalls++;}};
 const z=zoneOf(player.z);for(let j=Math.max(0,z-1);j<=Math.min(6,z+1);j++){const o=ensureGpuRealm(j);if(o)draw(o.buffer,o.count,o.chunks)}
 gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,dynamicData,gl.DYNAMIC_DRAW);draw(vbo,dynamicData.length/10);
 gl.colorMask(true,true,true,true);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height);
}

let lastViewportW=0,lastViewportH=0,adaptiveFactor=1;
function resize(){syncShadowQuality();res=quality==='cinematic'?Math.max(1.1,Math.min(1.75,(devicePixelRatio||1)*1.16)):quality==='high'?Math.min(devicePixelRatio||1,1.45):quality==='balanced'?Math.min(devicePixelRatio||1,1.0):.65;
 res=Math.min(res,(innerWidth*innerHeight>1250000?1.05:2))*adaptiveFactor;
 let w=Math.max(2,Math.round(innerWidth*res)),h=Math.max(2,Math.round(innerHeight*res));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}if(gl&&(lastViewportW!==w||lastViewportH!==h)){gl.viewport(0,0,w,h);lastViewportW=w;lastViewportH=h}}
let cpuMeshes=[];
function rebuild(){solidCells.clear();solidCount=0;if(gl)uploadStatics();else cpuMeshes=regions.map((_,i)=>groundMesh(i));resolveDiscoveries();initializeBreakables();}
let game={state:'title',time:0,played:0,zone:0,prevZone:-1,seals:new Array(7).fill(false),bosses:new Array(7).fill(false),essence:0,kills:0,checkpoint:18,checkpointX:0,missionEnd:false,autosave:0,quality,relics:new Array(7).fill(false),visited:[true,false,false,false,false,false,false],explored:Array.from({length:7},()=>[]),flying:false,secretFlight:false};
const player={x:0,z:18,y:0,vy:0,vx:0,vz:0,grounded:true,hp:100,maxHp:100,mp:100,angle:0,move:0,gait:0,motion:0,lean:0,turn:0,footPhase:0,roll:0,dashTime:0,dashCooldown:0,dashVX:0,dashVZ:0,dashVY:0,dashSerial:0,attackTime:0,attackCooldown:0,attackHitReady:false,combo:0,comboTime:0,attackDuration:.62,attackClock:0,attackQueued:false,hitPause:0,cameraKick:0,swordTip:null,swordBase:null,swordTrail:[],lastSwordStamp:-99,fireCooldown:0,fireCast:0,pulseCooldown:0,invuln:0,keys:0,stamina:1,landPulse:0,flightLaunch:0,coyote:0,jumpBuffer:0,counterReady:0,footstepCooldown:0};
let wildlife=[];
function spawnWildlife(){wildlife=[];for(let zone=0;zone<7;zone++){
 for(let k=0;k<4;k++){let z=zone*LEN+LEN*(.11+k*.235),x=roadCenter(z)+(k%2===0?-1:1)*(10+hash(zone*83+k*31)*8);
 wildlife.push({kind:zone===2?'crawler':'wolf',zone,x,z,y:height(x,z),homeX:x,homeZ:z,angle:0,phase:hash(zone*97+k)*6.28,hp:64,hit:0,cooldown:0,attackAnim:0,dead:false,speed:2.8+zone*.2});}
 for(let k=0;k<6;k++){let z=zone*LEN+LEN*(.075+k*.155),x=roadCenter(z)+(k%2===0?-1:1)*(15+hash(zone*14+k)*10);
 wildlife.push({kind:'bat',zone,x,z,y:height(x,z)+5+hash(zone*47+k)*4,homeX:x,homeZ:z,phase:hash(zone*98+k)*6.28,angle:0,hp:42,maxHp:42,hit:0,dead:false});}
 for(let k=0;k<2;k++){
  const z=zone*LEN+LEN*(.29+k*.38),x=roadCenter(z)+(k?42:-42);
  wildlife.push({kind:'stag',zone,x,z,y:height(x,z),homeX:x,homeZ:z,angle:0,phase:hash(zone*91+k)*TAU,hp:95,hit:0,cooldown:0,attackAnim:0,dead:false,speed:3.7});
 }
}}
let viewMode='tpp';function toggleView(){viewMode=viewMode==='tpp'?'fpp':'tpp';cameraReady=false;const b=document.querySelector('.btn-view');if(b){const next=viewMode==='fpp'?'T':'F';b.querySelector('span').textContent=next;b.setAttribute('aria-label',next==='T'?'Beralih ke TPP':'Beralih ke FPP');}document.body.dataset.view=viewMode;}
let enemies=[],particles=[],pickups=[],attacks=[],elapsed=0,lastFrame=0,fps=60,orbit=0,orbitPitch=.27,camEye=[0,13,-21],camFocus=[0,1,0],cameraBasis=null,cameraAnchor=[0,0,8],cameraReady=false,toaster=0,splashTime=0,nearShrine=-1,finalVictory=false,animatedTime=0;
function makeEnemy(zone,i,boss=false){let zz=zone*LEN+(boss?LEN*BOSS_LOCAL:LEN*(i<5?[.14,.27,.41,.65,.77][i]:.10+(i-5)*.105)),xx=roadCenter(zz)+(boss?0:(hash(i*5+zone*21)*2-1)*(i<5?12:20));if(i===3)xx=roadCenter(zz)+9;
 let type=boss?'boss':regions[zone].enemy;
 return {x:xx,z:zz,y:height(xx,zz),zone,boss,type,radius:boss?3.3:1.1,maxHp:boss?160+zone*47:35+zone*9,hp:boss?160+zone*47:35+zone*9,attack:0,hit:0,dead:false,phase:hash(zone*41+i)*6.28,angle:Math.PI,dir:1,speed:boss?2.4+zone*.15:3.1+zone*.19,homeX:xx,homeZ:zz,stagger:0,windup:0,projectileCD:2+hash(i+zone)*3,knockVX:0,knockVZ:0,hitRecoil:0,animation:hash(i+zone*9)*TAU,spawn:0};}
function spawnEnemies(){enemies=[];for(let j=0;j<7;j++){for(let i=0;i<12;i++)enemies.push(makeEnemy(j,i));enemies.push(makeEnemy(j,0,true));}applySavedBosses()}
function applySavedBosses(){for(let e of enemies)if(e.boss&&game.bosses[e.zone])e.dead=true;}
// Optional discoveries are never prerequisites for reaching the final gate.
const cacheSpots=[],energyShards=[],healingWells=[],riftTraps=[];
for(let j=0;j<7;j++){
 for(let k=0;k<3;k++){
  const z=j*LEN+LEN*[.18,.44,.76][k],side=((j+k)%2?1:-1);
  cacheSpots.push({zone:j,x:roadCenter(z)+side*(36+hash(j*7+k)*12),z,id:j*3+k,seed:j*71+k*17});
 }
 for(let k=0;k<4;k++){
  const z=j*LEN+LEN*[.24,.37,.60,.88][k],side=k%2?-1:1;
  energyShards.push({zone:j,x:roadCenter(z)+side*(19+hash(j*23+k)*7),z,id:j*4+k});
 }
 const hz=j*LEN+LEN*.55;healingWells.push({zone:j,x:roadCenter(hz)+(j%2?1:-1)*34,z:hz});
 for(let k=0;k<2;k++){
  const z=j*LEN+LEN*[.35,.72][k];riftTraps.push({zone:j,x:roadCenter(z)+(k%2?1:-1)*(16+j%3*3),z,id:j*2+k,phase:hash(j*11+k)*TAU});
 }
}
let chestTaken=new Array(21).fill(false),shardTaken=new Array(28).fill(false);
// V3-inspired physically destructible supply crates. They are independent of the existing caches.
let breakables=[];
function initializeBreakables(){
 breakables=[];
 for(let zone=0;zone<7;zone++)for(let k=0;k<5;k++){
  const z=zone*LEN+LEN*(.13+k*.17),side=(k+zone)%2?1:-1;
  let x=roadCenter(z)+side*(23+hash(zone*47+k*19)*14);
  // Keep the crates out of existing road structures, altars and guardian arenas.
  for(let attempt=0;attempt<10&&blocking(x,z,2.0,height(x,z),3);attempt++)x+=side*3.4;
  x=clamp(x,-66,66);
  const item={id:zone*5+k,zone,x,z,y:height(x,z),hp:60,dead:false,kind:k===4?'relic':'crate'};
  item.solid={kind:'box',x,z,w:1.32,d:1.26,c:1,s:0,minY:item.y-.15,maxY:item.y+2.6,active:true,breakableId:item.id};
  registerSolid(item.solid,2.1);breakables.push(item);
 }
}
function resetBreakables(){for(const b of breakables){b.hp=60;b.dead=false;b.solid.active=true}}
function strikeBreakableById(id,damage=60){
 const b=breakables[id];if(!b||b.dead)return false;
 b.hp-=damage;burst(b.x,b.y+1.15,b.z,b.kind==='relic'?[.38,.92,1]:[.86,.57,.27],12,.38);
 if(b.hp>0){pulseSfx(195,.065,'triangle',.012);return true;}
 b.dead=true;b.solid.active=false;
 game.essence+=b.kind==='relic'?42:14;
 player.mp=Math.min(100,player.mp+(b.kind==='relic'?22:8));
 for(let i=0;i<5;i++){
  const ang=hash(b.id*97+i*11)*TAU,speed=2+hash(b.id*31+i*5)*6;
  debris.push({x:b.x,y:b.y+1.25,z:b.z,vx:Math.cos(ang)*speed,vy:4+hash(i*21+b.id)*4,vz:Math.sin(ang)*speed,life:1.2+hash(i*12+b.id)*.8,col:b.kind==='relic'?[.3,.86,1]:[.55,.30,.16],rot:hash(i+b.id)*TAU});
 }
 burst(b.x,b.y+1.35,b.z,b.kind==='relic'?[.34,.86,1]:[1,.64,.32],36,1.1);
 pulseSfx(115,.2,'sawtooth',.022);
 showToast(language==='id'?'✦ PETI DIHANCURKAN':'✦ CRATE DESTROYED',.9);save();return true;
}
function damageNearbyBreakables(x,z,radius,damage){
 let hits=0;for(const b of breakables)if(!b.dead&&Math.hypot(b.x-x,b.z-z)<radius){strikeBreakableById(b.id,damage);hits++}return hits;
}
let debris=[];

let healCooldown=0,riftCooldown=0,discoveryClock=0,dodgeRewardTimer=0;
function resolveDiscoveries(){
 // Adjust collectible points away from physical props after static meshes and colliders are generated.
 for(const q of [...cacheSpots,...energyShards,...healingWells,...riftTraps]){
  for(let trial=0;trial<10&&blocking(q.x,q.z,.8);trial++){
    const delta=(trial%2?1:-1)*(3+trial*1.3);q.x=clamp(roadCenter(q.z)+delta+(q.x-roadCenter(q.z)), -72,72);
  }
 }
}
function updateDiscoveries(dt){
 healCooldown=Math.max(0,healCooldown-dt);riftCooldown=Math.max(0,riftCooldown-dt);
 dodgeRewardTimer=Math.max(0,dodgeRewardTimer-dt);
 for(const q of cacheSpots){if(q.zone!==game.zone||chestTaken[q.id])continue;
  if(Math.hypot(player.x-q.x,player.z-q.z)<3.3&&(!game.flying||player.y-height(q.x,q.z)<5)){
   chestTaken[q.id]=true;game.essence+=35+8*q.zone;
   player.hp=Math.min(player.maxHp,player.hp+14);player.mp=Math.min(100,player.mp+22);
   burst(q.x,height(q.x,q.z)+1.3,q.z,regions[q.zone].accent,42,1.4);
   pulseSfx(620,.26,'triangle',.035);showToast('✦ '+(language==='id'?'PETI RAHASIA':'HIDDEN CACHE'),1.1);save();
  }
 }
 for(const q of energyShards){if(q.zone!==game.zone||shardTaken[q.id])continue;
  if(Math.hypot(player.x-q.x,player.z-q.z)<2.6&&(!game.flying||player.y-height(q.x,q.z)<5)){
   shardTaken[q.id]=true;game.essence+=12;player.mp=Math.min(100,player.mp+22);
   burst(q.x,height(q.x,q.z)+1.5,q.z,[.45,.95,1],25,1.2);pulseSfx(920,.16,'sine',.022);save();
  }
 }
 for(const q of healingWells){if(q.zone!==game.zone||healCooldown>0)continue;
  if(Math.hypot(player.x-q.x,player.z-q.z)<5&&player.hp<player.maxHp){
   player.hp=Math.min(player.maxHp,player.hp+22);healCooldown=4;
   burst(q.x,height(q.x,q.z)+1.2,q.z,[.38,1,.73],28,.7);
   showToast('✦ '+(language==='id'?'PULIH':'HEALED'),.8);
  }
 }
 for(const q of riftTraps){if(q.zone!==game.zone||riftCooldown>0||game.flying&&player.y-height(q.x,q.z)>4)continue;
  const active=Math.sin(clock*2.4+q.phase)>.44;
  if(active&&Math.hypot(player.x-q.x,player.z-q.z)<3.9){
   riftCooldown=1.5;takeHit(9+2*q.zone);burst(q.x,height(q.x,q.z)+.4,q.z,[1,.19,.42],14,.5);
  }
 }
}
function discoveryMesh(mesh){
 for(const q of cacheSpots){if(q.zone!==game.zone||chestTaken[q.id]||Math.abs(q.z-player.z)>67)continue;
  let y=height(q.x,q.z),m=new Mesh(q.x,y,q.z),c=regions[q.zone];
  m.box(0,.45,0,2.3,.88,1.45,tint(c.stone,.54));m.box(0,.99,0,2.45,.28,1.55,tint(c.accent,.62),.13);
  m.box(0,.59,.76,.34,.55,.11,tint(c.accent,1.2),.9);m.spike(0,1.2+Math.sin(clock*2.4+q.seed)*.15,0,.4,.88,c.accent,.85);
  m.ring(0,.07,0,2.45,.09,c.accent,.4);appendVertices(mesh.d,m.d);
 }
 for(const q of energyShards){if(q.zone!==game.zone||shardTaken[q.id]||Math.abs(q.z-player.z)>66)continue;
  let y=height(q.x,q.z),m=new Mesh(q.x,y,q.z);m.spike(0,1+Math.sin(clock*2.5+q.id)*.24,0,.48,1.65,[.4,.93,1],1.6);
  m.ring(0,.12,0,1.25,.08,[.4,.86,1],.5);appendVertices(mesh.d,m.d);
 }
 for(const q of healingWells){if(q.zone!==game.zone||Math.abs(q.z-player.z)>69)continue;
  let y=height(q.x,q.z),m=new Mesh(q.x,y,q.z);
  for(let k=0;k<3;k++)m.ring(0,.13+k*.16,0,4.4-k*.55,.14,[.25,.75,.56],.32);
  m.spike(0,.38+Math.sin(clock*1.7)*.15,0,.9,3.3,[.37,.99,.72],.85);appendVertices(mesh.d,m.d);
 }
 for(const q of riftTraps){if(q.zone!==game.zone||Math.abs(q.z-player.z)>66)continue;
  let y=height(q.x,q.z),m=new Mesh(q.x,y,q.z),active=Math.sin(clock*2.4+q.phase)>.44;
  m.ring(0,.10,0,3.6,.37,active?[1,.19,.37]:[.36,.18,.26],active?1.7:.18);
  for(let i=0;i<5;i++){let a=i*TAU/5+clock*.1;m.spike(Math.cos(a)*2.2,.11,Math.sin(a)*2.2,.17,active?.86:.35,[.66,.23,.42],active?.8:.18)}
  appendVertices(mesh.d,m.d);
 }
 // Lost souls drift around side paths. They illuminate, rather than reveal, nearby caches.
 for(let i=0;i<15;i++){
  let z=game.zone*LEN+LEN*(.08+hash(game.zone*13+i*9)*.84);
  if(Math.abs(z-player.z)>58)continue;
  let x=roadCenter(z)+(i%2?-1:1)*(29+hash(i*27+game.zone)*20);
  let m=new Mesh(),y=height(x,z)+3+Math.sin(clock*1.4+i)*1.2,xx=x+Math.sin(clock*.9+i*2)*2.7,zz=z+Math.cos(clock*.7+i*3)*2.0;
  m.sphere(xx,y,zz,.27,[.48,.9,1],3,6,1.7);appendVertices(mesh.d,m.d);
 }
}
function save(){try{localStorage.setItem('landlord-openrealms-save-v1',JSON.stringify({seals:game.seals,bosses:game.bosses,essence:game.essence,kills:game.kills,z:player.z,x:player.x,checkpoint:game.checkpoint,checkpointX:game.checkpointX,missionEnd:game.missionEnd,finishedGate:game.missionEnd,mapLength:LEN,relics:game.relics,visited:game.visited,explored:game.explored,chests:chestTaken,shards:shardTaken,brokenCrates:breakables.map(b=>b.dead)}))}catch{}}
function load(){let x;try{x=JSON.parse(localStorage.getItem('landlord-openrealms-save-v1')||'null')}catch{}if(!x||!Array.isArray(x.seals)||x.seals.length!==7)return false;
 game.seals=x.seals.map(Boolean);game.bosses=(x.bosses?.length===7?x.bosses:new Array(7).fill(false)).map(Boolean);game.essence=Number(x.essence)||0;game.kills=Number(x.kills)||0;game.checkpoint=Number(x.checkpoint)||6;game.checkpointX=Number(x.checkpointX)||0;game.missionEnd=x.finishedGate===true;game.relics=(Array.isArray(x.relics)&&x.relics.length===7?x.relics:new Array(7).fill(false)).map(Boolean);
 chestTaken=(Array.isArray(x.chests)&&x.chests.length===21?x.chests:new Array(21).fill(false)).map(Boolean);
 shardTaken=(Array.isArray(x.shards)&&x.shards.length===28?x.shards:new Array(28).fill(false)).map(Boolean);
 resetBreakables();if(Array.isArray(x.brokenCrates))breakables.forEach((b,i)=>{if(x.brokenCrates[i]){b.dead=true;b.hp=0;b.solid.active=false}});
 const lengthRatio=LEN/(Number(x.mapLength)||180);
 game.visited=(Array.isArray(x.visited)&&x.visited.length===7?x.visited:new Array(7).fill(false)).map(Boolean);
 game.explored=(Array.isArray(x.explored)&&x.explored.length===7?x.explored:Array.from({length:7},()=>[])).map(a=>Array.isArray(a)?a.slice(-320).map(p=>Array.isArray(p)?[Number(p[0])||0,(Number(p[1])||0)*lengthRatio]:[0,0]):[]);
 game.flying=false;game.secretFlight=false;
 player.z=clamp((Number(x.z)||18)*lengthRatio,3,END-5);
 player.x=clamp(Number(x.x)||roadCenter(player.z),-79,79);
 game.checkpoint=clamp(game.checkpoint*lengthRatio,3,END-5);
 game.checkpointX=roadCenter(game.checkpoint);
game.visited[zoneOf(player.z)]=true;return true}
function newGame(){currentFireLock=null;fireLockWindow=0;attacks=[];resetBreakables();debris.length=0;game.postWin=false;chestTaken.fill(false);shardTaken.fill(false);healCooldown=riftCooldown=0;altarHold=0;altarZone=-1;game.seals.fill(false);game.bosses.fill(false);game.essence=0;game.kills=0;game.checkpoint=18;game.checkpointX=roadCenter(18);game.missionEnd=false;game.relics.fill(false);finalVictory=false;player.z=18;player.x=roadCenter(player.z);player.maxHp=100;player.hp=100;player.mp=100;game.visited=[true,false,false,false,false,false,false];game.explored=Array.from({length:7},()=>[]);game.flying=false;game.secretFlight=false;jumpTimes=[];sidePortalHold=0;sidePortalCooldown=0;player.vy=0;player.vx=player.vz=0;player.gait=player.motion=player.lean=player.landPulse=player.flightLaunch=0;player.grounded=true;player.coyote=0;player.jumpBuffer=0;player.counterReady=0;damagePopups.length=0;player.angle=0;player.attackTime=0;player.attackClock=0;player.comboTime=0;player.combo=0;player.attackQueued=false;player.swordTrail=[];player.hitPause=0;cameraReady=false;orbit=0;viewMode='tpp';document.body.dataset.view='tpp';const vb=document.querySelector('.btn-view');if(vb)vb.querySelector('span').textContent='F';save();spawnEnemies();spawnWildlife();start()}
function fromSave(){currentFireLock=null;fireLockWindow=0;attacks=[];if(!load())return newGame();finalVictory=game.missionEnd;player.maxHp=100+(powerLevel()-1)*14;player.hp=player.maxHp;player.mp=100;player.vx=player.vz=0;player.attackTime=0;player.attackQueued=false;player.coyote=0;player.jumpBuffer=0;player.counterReady=0;damagePopups.length=0;player.swordTrail=[];player.landPulse=0;cameraReady=false;game.flying=false;spawnEnemies();spawnWildlife();start()}
function openMenu(title=false){$('victoryOverlay').hidden=true;player.attackQueued=false;game.state=title?'title':'pause';menuContext=title?'title':'pause';ui.overlay.classList.remove('off');ui.hud.classList.add('hidden');$('target').classList.add('hide');$('play').hidden=!title;ui.resume.hidden=!!title;ui.restart.hidden=true;showMenuPanel();hideTouchControls();if(document.pointerLockElement)document.exitPointerLock?.();}
function start(){if(game.missionEnd){finishGame(true);return;}game.state='playing';settingsOpen=false;ui.overlay.classList.add('off');ui.hud.classList.remove('hidden');$('target').classList.remove('hide');ui.map.classList.remove('visible');lastFrame=0;zoneChanged(true);if(isTouchDevice())revealTouchControls(2700);else hideTouchControls();markExplored();refreshSkills();}
function resume(){start()}
function showToast(text,seconds=2.6){ui.toast.textContent=text;toaster=seconds;ui.toast.classList.add('show')}
function portalFlash(){const veil=$('portalVeil');if(!veil)return;veil.classList.remove('flash');void veil.offsetWidth;veil.classList.add('flash');pulseSfx(470,.28,'sine',.038)}
function zoneChanged(force=false){let z=zoneOf(player.z);if(force||z!==game.prevZone){game.prevZone=z;game.zone=z;game.visited[z]=true;ui.title.textContent=regions[z].name;ui.chapter.textContent=String(z+1).padStart(2,'0');ui.splash.querySelector('.name').textContent=regions[z].name;ui.splash.querySelector('.sub').textContent=regions[z].subtitle.toUpperCase();ui.splash.classList.add('visible');splashTime=1.65;let c=regions[z];$('sky').style.background=`radial-gradient(ellipse at 72% 37%,rgb(${c.accent.map(v=>Math.round(v*80+12)).join(' ')}) 0%,rgb(${c.fog.map(v=>Math.round(v*130)).join(' ')}) 38%,rgb(${c.bg.map(v=>Math.round(v*95)).join(' ')}) 76%,#050a12 100%)`;save();}}
function updateUI(){ui.hp.style.width=clamp(player.hp/player.maxHp*100,0,100)+'%';ui.mp.style.width=clamp(player.mp,0,100)+'%';ui.hpText.textContent=Math.ceil(player.hp)+'/'+player.maxHp;ui.mpText.textContent=Math.floor(player.mp)+'/100';ui.essence.textContent=game.essence;ui.seals.textContent=game.seals.filter(Boolean).length;if($('relics'))$('relics').textContent=game.relics.filter(Boolean).length;$('level').textContent=powerLevel();
 const z=game.zone;
 let quest=game.missionEnd?'MENANG':z===6?'Temukan gerbang akhir':'Cari gerbang atau portal berikutnya';
 ui.quest.textContent=quest;
 refreshSkills();
 ui.boss.style.display='none';let boss=enemies.find(e=>e.boss&&e.zone===z&&!e.dead&&distance(player,e)<28);if(boss){ui.boss.style.display='block';ui.bossName.textContent=regions[z].guardian;ui.bossFill.style.width=clamp(boss.hp/boss.maxHp*100,0,100)+'%'}
 const rp=relicPos(z),isRelic=!game.relics[z]&&Math.hypot(player.x-rp[0],player.z-rp[1])<5;document.querySelector('.btn-interact')?.classList.toggle('near-relic',isRelic);ui.interaction.classList.toggle('show',isRelic);
 if(isRelic)ui.interaction.textContent='✦ '+(language==='id'?'RELIK OTOMATIS':'AUTO RELIC');
 else if(nearShrine>=0)ui.interaction.textContent=(language==='id'?'BERDIRI 2 DETIK':'STAND FOR 2 SECONDS');
 const charge=$('altarCharge'),circle=$('altarProgress'),label=$('altarCountdown');
 const visible=nearShrine>=0&&!game.seals[nearShrine];
 charge.classList.toggle('visible',visible);
 if(visible){circle.style.strokeDashoffset=String(213.63*(1-clamp(altarHold/2,0,1)));label.textContent=(2-altarHold).toFixed(1)+'s';} 
}
function pulseSfx(freq=400,dur=.14,type='sine',vol=.035){try{const ac=audioContext();if(!ac)return;let osc=ac.createOscillator(),gn=ac.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,ac.currentTime);osc.frequency.exponentialRampToValueAtTime(Math.max(70,freq*.35),ac.currentTime+dur);gn.gain.setValueAtTime(vol,ac.currentTime);gn.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+dur);osc.connect(gn).connect(window.LandlordAudio?.output?.()||ac.destination);osc.start();osc.stop(ac.currentTime+dur+.01)}catch{}}
let audio=null;function audioContext(){if(window.LandlordAudio?.context)return window.LandlordAudio.context();if(audio)return audio;let A=window.AudioContext||window.webkitAudioContext;if(!A)return null;audio=new A();return audio}
function burst(x,y,z,col,num=16,power=1){const budget=quality==='low'?70:quality==='balanced'?130:quality==='high'?200:280;num=Math.max(1,Math.round(num*(quality==='low'?.42:quality==='balanced'?.68:1)*adaptiveFactor));for(let i=0;i<num;i++){
 let a=hash(i*31+clock*3)*TAU,spin=hash(i*71+clock*17),v=(2+spin*5)*power;
 particles.push({x,y,z,vx:Math.cos(a)*v,vy:hash(i*13+clock*29)*5*power+1,vz:Math.sin(a)*v,life:.6+hash(i*41)*.8,max:1.4,col,size:.06+hash(i*19)*.13});}
 if(particles.length>budget)particles.splice(0,particles.length-budget)}
function getInput(){
 // Keyboard, gesture and controller all mean CAMERA-RELATIVE SCREEN DIRECTIONS.
 // Crucial: the renderer looks toward +Z at yaw 0, so SCREEN RIGHT is world -X.
 let x=(keySet.has(keybinds.right)?1:0)-(keySet.has(keybinds.left)?1:0);
 let z=(keySet.has(keybinds.forward)?1:0)-(keySet.has(keybinds.back)?1:0);
 if(touchMove.active){x+=touchMove.x;z+=touchMove.y}
 let pad=navigator.getGamepads?.()?.[0];if(pad){let ax=Math.abs(pad.axes[0])>.13?pad.axes[0]:0,az=Math.abs(pad.axes[1])>.13?-pad.axes[1]:0;x+=ax;z+=az}
 let amount=Math.min(1,Math.hypot(x,z));if(amount>.001){let len=Math.hypot(x,z);x=x/len*amount;z=z/len*amount}
 return {x,z,walking:amount>.12,amount};
}
function cameraMove(input,yaw=orbit){
 // Camera's ground-plane forward = (sin yaw, cos yaw).
 // Actual screen-right basis is (-cos yaw, sin yaw); using +cos mirrored A/D.
 const sy=Math.sin(yaw),cy=Math.cos(yaw);
 return {x:input.z*sy-input.x*cy,z:input.z*cy+input.x*sy};
}
function shortestTurn(current,target){return Math.atan2(Math.sin(target-current),Math.cos(target-current))}
// LANDLORD VI — keyframed 3-hit combat system. Every move has anticipation, contact and follow-through.
const COMBOS=[
 {name:'CRESCENT CUT',duration:.38,hit:.47,reach:5.0,power:1,active:[.30,.77],color:[.37,.80,1]},
 {name:'RETURNING FANG',duration:.41,hit:.46,reach:5.15,power:1.14,active:[.30,.77],color:[.68,.59,1]},
 {name:'ECLIPSE BREAKER',duration:.50,hit:.51,reach:5.75,power:1.55,active:[.34,.80],color:[1,.74,.43]}
];
const IDLE_FRAME={t:0,hand:[1.04,1.71,.47],blade:[.06,.45,1],twist:0,crouch:0,lunge:0};
// These are cinematic pose curves, not procedural sin-wave hand rotations.
const STRIKE_KEYS=[
 [
 {...IDLE_FRAME,t:0},
 {t:.18,hand:[1.50,2.31,-.40],blade:[.86,.83,-.38],twist:-.52,crouch:.12,lunge:-.13},
 {t:.35,hand:[1.56,2.45,.35],blade:[1.35,.29,.73],twist:-.68,crouch:.22,lunge:.22},
 {t:.57,hand:[-.08,1.87,1.58],blade:[-.93,-.08,1.16],twist:.64,crouch:.23,lunge:.62},
 {t:.75,hand:[-.55,1.44,1.00],blade:[-1.03,-.34,.42],twist:.64,crouch:.11,lunge:.30},
 {...IDLE_FRAME,t:1}
 ],
 [
 {...IDLE_FRAME,t:0},
 {t:.19,hand:[-.58,1.39,-.25],blade:[-.82,-.55,-.30],twist:.56,crouch:.21,lunge:-.06},
 {t:.36,hand:[-.87,1.48,.60],blade:[-1.10,.04,.89],twist:.72,crouch:.25,lunge:.32},
 {t:.55,hand:[1.47,2.25,1.36],blade:[1.03,.51,1.12],twist:-.65,crouch:.24,lunge:.63},
 {t:.78,hand:[1.42,2.51,.62],blade:[.84,.98,.18],twist:-.48,crouch:.10,lunge:.32},
 {...IDLE_FRAME,t:1}
 ],
 [
 {...IDLE_FRAME,t:0},
 {t:.18,hand:[1.22,2.87,-.53],blade:[.08,1.36,-.23],twist:-.26,crouch:.22,lunge:-.23},
 {t:.39,hand:[.51,3.41,.14],blade:[-.08,1.48,.41],twist:.06,crouch:.36,lunge:.04},
 {t:.60,hand:[.14,1.82,2.05],blade:[-.19,-1.07,.91],twist:.22,crouch:.46,lunge:.83},
 {t:.80,hand:[.24,.88,1.29],blade:[.18,-.91,.62],twist:.16,crouch:.20,lunge:.39},
 {...IDLE_FRAME,t:1}
 ]
];
function catmull(a,b,c,d,t){return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)}
function sampleAttackPose(p){
 const idle={hand:[...IDLE_FRAME.hand],blade:[...IDLE_FRAME.blade],twist:0,crouch:0,lunge:0,progress:0,active:0};
 if(p.attackTime<=0)return idle;
 const seq=STRIKE_KEYS[p.combo],u=clamp(1-p.attackTime/p.attackDuration,0,1);
 let i=0;while(i<seq.length-2&&u>seq[i+1].t)i++;
 const k0=seq[Math.max(0,i-1)],k1=seq[i],k2=seq[i+1],k3=seq[Math.min(i+2,seq.length-1)],t=clamp((u-k1.t)/(k2.t-k1.t),0,1);
 const val=(field,j=-1)=>catmull(j<0?k0[field]:k0[field][j],j<0?k1[field]:k1[field][j],j<0?k2[field]:k2[field][j],j<0?k3[field]:k3[field][j],t);
 const active=COMBOS[p.combo].active,s=(u-active[0])/(active[1]-active[0]);
 return {hand:[0,1,2].map(j=>val('hand',j)),blade:norm([0,1,2].map(j=>val('blade',j))),twist:val('twist'),crouch:val('crouch'),lunge:val('lunge'),progress:u,active:u>=active[0]&&u<=active[1]?Math.pow(Math.sin(Math.PI*s),.45):0};
}
let hitFlashes=[];
let damagePopups=[];
let gameplayStats={perfectDodges:0,enemyHits:0,enemyKills:0,bufferedJumps:0};
function damagePopup(entity,amount,kind='enemy'){
 if(!entity||!Number.isFinite(amount))return;
 // Limit transient feedback objects to keep mobile drawing predictable.
 const y=entity.y+(kind==='player'?2.7:(entity.boss?5.6:entity.kind==='bat'?.5:3.2));
 damagePopups.push({x:entity.x+(Math.random()-.5)*.35,y,z:entity.z,value:String(Math.max(1,Math.round(amount))),t:0,life:.68,kind});
 if(damagePopups.length>32)damagePopups.splice(0,damagePopups.length-32);
}
function drawCombatReadability(f){
 if(game.state!=='playing')return;
 const playerDist=40;
 f.save();f.textAlign='center';f.textBaseline='middle';
 // Health bars are shown only when a monster has taken damage and is near the camera.
 for(const e of enemies){
  if(e.dead||e.zone!==game.zone||e.hp>=e.maxHp||Math.abs(e.z-player.z)>playerDist)continue;
  const p=projectAtmos(e.x,e.y+(e.boss?6.5:3.6),e.z);if(!p||p.depth>65)continue;
  const w=e.boss?58:38,h=4;
  f.fillStyle='rgba(2,7,13,.76)';f.fillRect(p.x-w/2-1,p.y-1,w+2,h+2);
  f.fillStyle=e.boss?'#f9a16f':'#f2c78a';f.fillRect(p.x-w/2,p.y,w*clamp(e.hp/e.maxHp,0,1),h);
 }
 // Red telegraph arcs indicate the exact strike countdown; no textual overlays.
 for(const e of enemies){
  if(e.dead||e.windup<=0||Math.abs(e.z-player.z)>28)continue;
  const p=projectAtmos(e.x,e.y+.18,e.z);if(!p)continue;
  const progress=clamp(1-e.windup/(e.boss?.96:.57),0,1),r=e.boss?31:18;
  f.lineWidth=e.boss?3.5:2.5;
  f.strokeStyle=`rgba(255,83,65,${(.45+.45*progress).toFixed(3)})`;
  f.beginPath();f.ellipse(p.x,p.y,r,r*.42,0,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);f.stroke();
 }
 for(const p of damagePopups){
  const screen=projectAtmos(p.x,p.y+p.t*1.65,p.z);if(!screen)continue;
  const alpha=clamp(p.life/.68,0,1);
  f.font='800 15px system-ui,sans-serif';f.lineWidth=3;
  f.strokeStyle=`rgba(6,9,16,${alpha*.9})`;f.fillStyle=p.kind==='player'?`rgba(255,95,79,${alpha})`:`rgba(255,225,159,${alpha})`;
  f.strokeText(p.value,screen.x,screen.y);f.fillText(p.value,screen.x,screen.y);
 }
 f.restore();
}

// Buffered, filtered air-swish audio follows blade speed, without external sound files.
function swordWhoosh(index){
 try{
   const ac=audioContext();if(!ac||ac.state==='suspended')return;
   const spec=COMBOS[index],duration=.30,frames=Math.round(ac.sampleRate*duration);
   const noise=ac.createBuffer(1,frames,ac.sampleRate),samples=noise.getChannelData(0);
   let prev=0;for(let i=0;i<frames;i++){prev=.48*prev+.52*(Math.random()*2-1);samples[i]=prev;}
   const src=ac.createBufferSource();src.buffer=noise;
   const filter=ac.createBiquadFilter();filter.type='bandpass';filter.frequency.value=index===2?510:760+index*160;filter.Q.value=.66;
   const gain=ac.createGain(),start=ac.currentTime+.004;
   gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(index===2?.14:.10,start+.038);
   gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
   src.connect(filter).connect(gain).connect(window.LandlordAudio?.output?.()||ac.destination);src.start(start);src.stop(start+duration+.01);
 }catch{}
}
function startAttack(index){
 const spec=COMBOS[index];player.combo=index;player.attackDuration=spec.duration;player.attackTime=spec.duration;player.attackClock=0;player.attackHitReady=true;player.attackQueued=false;
 player.comboTime=.90;player.attackCooldown=0;player.attackBuffer=0;player.swordTrail=[];
 player.cameraKick=Math.max(player.cameraKick,.025);player.lastSwordStamp=-1;
 pulseSfx(index===2?190:155+index*38,.16,index===2?'sawtooth':'triangle',.038);swordWhoosh(index);
 ldx.parryT=.24;ldx.noise=Math.max(ldx.noise,16);if(ldx.fireBuff>0)ldx.flameSlash();
 const tag=$('comboTag');tag.textContent=index===2?'✦ FINISHER':'✦ '+(index+1)+'/3';tag.classList.add('show');
}
function doAttack(){
 if(game.state!=='playing')return;
 if(player.attackTime>0){
  if(!player.attackHitReady&&player.attackClock>player.attackDuration*.76){startAttack((player.combo+1)%3);return;}
  player.attackQueued=true;player.attackBuffer=.42;return;
 }
 startAttack(player.comboTime>0?(player.combo+1)%3:0);
}
function meleeLineClear(target){
 const dx=target.x-player.x,dz=target.z-player.z,dy=(target.y??player.y)-player.y;
 if(Math.abs(dy)>(target.boss?4.2:2.7))return false;
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.45));
 for(let i=1;i<steps;i++){const t=i/steps;if(blocking(player.x+dx*t,player.z+dz*t,.14,player.y+1+dy*t,.3))return false;}
 return true;
}
function resolveMelee(){
 let hit=false,closest=null,nearest=999;
 for(const e of enemies){
   if(e.dead||e.zone!==game.zone)continue;
   const dist=distance(player,e),angle=Math.atan2(e.x-player.x,e.z-player.z),off=Math.abs(shortestTurn(player.angle,angle));
   const spec=COMBOS[player.combo],reach=spec.reach+(e.boss?1.0:0);
   if(dist<reach+e.radius*.24&&off<(player.combo===2?1.1:1.40)&&meleeLineClear(e)){
     let power=(23+game.seals.filter(Boolean).length*2.2+(powerLevel()-1)*3)*spec.power;
     if(player.counterReady>0)power*=1.75;
     damageEnemy(e,power);hit=true;
     const impulse=e.boss?3.2:8.0;e.knockVX+=Math.sin(angle)*impulse;e.knockVZ+=Math.cos(angle)*impulse;
     e.hitRecoil=player.combo===2?.53:.38;
     e.stagger=Math.max(e.stagger,player.combo===2?.83:.43);
     if(dist<nearest){nearest=dist;closest=e;}
   }
 }
 for(const beast of wildlife){
   if(beast.dead||beast.kind==='bat'||beast.zone!==game.zone)continue;
   const dd=distance(player,beast),ang=Math.atan2(beast.x-player.x,beast.z-player.z);
   if(dd<COMBOS[player.combo].reach+1.3&&Math.abs(shortestTurn(player.angle,ang))<1.35&&meleeLineClear(beast)){
     const raw=(23+powerLevel()*4)*COMBOS[player.combo].power*(player.counterReady>0?1.75:1);
     beast.hp-=raw;damagePopup(beast,raw);beast.hit=.45;hit=true;
     burst(beast.x,beast.y+.8,beast.z,[.84,.14,.37],18,.42);
     if(beast.hp<=0){beast.dead=true;game.essence+=18;}
   }
 }
 damageNearbyBreakables(player.x+Math.sin(player.angle)*2.8,player.z+Math.cos(player.angle)*2.8,2.9,(player.combo===2?65:35));
 if(hit&&closest){
   if(player.counterReady>0){player.counterReady=0;burst(player.x,player.y+1.2,player.z,[.4,1,.83],20,.7);}
   let e=closest,accent=COMBOS[player.combo].color;
   burst(e.x,e.y+1.9,e.z,accent,player.combo===2?48:29,player.combo===2?2.0:1.2);
   hitFlashes.push({x:e.x,y:e.y+2.0,z:e.z,life:.28,max:.28,combo:player.combo});
   player.hitPause=player.combo===2?.055:.034;player.cameraKick=player.combo===2?.26:.15;
   impactDirection=[e.x-player.x,e.z-player.z];
   shake=Math.max(shake,player.combo===2?.41:.23);
   pulseSfx(player.combo===2?95:130,.19,'sawtooth',.065);
 } else if(hit){
   shake=Math.max(shake,.17);player.cameraKick=.12;player.hitPause=.026;
 } else if(player.swordTip){
   let tip=player.swordTip;burst(tip[0],tip[1],tip[2],[.48,.78,1],6,.11);
 }
}
function damageEnemy(e,n){if(e.dead)return;window.dispatchEvent(new CustomEvent('landlord:impact',{detail:{kind:'hit',x:e.x,y:e.y+1.5,z:e.z,boss:!!e.boss}}));gameplayStats.enemyHits++;damagePopup(e,n);e.hp-=n;e.hit=.23;e.stagger=.23;burst(e.x,e.y+1.6,e.z,regions[e.zone].accent,e.boss?25:10,.6);pulseSfx(650,.09,'triangle',.022);
 if(e.hp<=0&&!e.dead){e.dead=true;game.kills++;gameplayStats.enemyKills++;let val=e.boss?80:12;game.essence+=val;for(let i=0;i<(e.boss?14:4);i++){pickups.push({x:e.x+(hash(i*2+clock)*2-1)*2,z:e.z+(hash(i*8+clock)*2-1)*2,y:e.y+.4,life:24,value:e.boss?6:2,phase:i});}
 burst(e.x,e.y+1.8,e.z,regions[e.zone].accent,e.boss?70:28,2.3);
 if(e.boss){game.bosses[e.zone]=true;showToast(T('boss'),1.8);save()}else if(game.kills%4===0)showToast(T('essence'),1.1);
 }}
function skillUnlocked(name){return true} // Checkpoints are respawn points, never ability or story gates.
function refreshSkills(){for(const name of ['dash','fire']){let b=document.querySelector('.btn-'+name);if(b)b.hidden=!skillUnlocked(name);}

 document.body.classList.toggle('is-flying',game.flying);
 const descendButton=document.querySelector('.btn-descend');if(descendButton)descendButton.hidden=!game.flying;
 const arrow=$('flightGuide');if(arrow){arrow.hidden=!game.flying;if(game.flying){const goal=portalPoint(6),angle=Math.atan2(goal.x-player.x,goal.z-player.z)-orbit;arrow.querySelector('.flight-arrow').style.transform='rotate('+angle+'rad)';arrow.querySelector('.flight-distance').textContent=Math.round(Math.hypot(goal.x-player.x,goal.z-player.z))+'m';}}}
function checkVictory(){
 // Only touching the terminal gateway in world VII ends the game. Bosses and checkpoints are optional.
 if(game.state!=='playing'||game.missionEnd||game.postWin)return false;
 const exit=portalPoint(6);
 const within=Math.hypot(player.x-exit.x,player.z-exit.z)<7.0;
 if(zoneOf(player.z)===6&&within&&player.z>=exit.z-5.2){finishGame(false);return true;}
 return false;
}
function finishGame(fromSave=false){
 game.missionEnd=true;finalVictory=true;game.state='won';player.vx=player.vz=0;game.flying=false;
 $('victoryOverlay').hidden=false;ui.overlay.classList.add('off');ui.hud.classList.add('hidden');
 ui.map.classList.remove('visible');hideTouchControls();document.body.classList.remove('is-flying');
 $('victoryText').textContent=language==='id'?'MENANG':'VICTORY';
 $('victoryRestart').textContent=language==='id'?'MAIN LAGI':'PLAY AGAIN';
 $('victoryMenu').textContent=language==='id'?'MENU':'MENU';ldx.ending();
 if(document.pointerLockElement===canvas)document.exitPointerLock?.();
 if(!fromSave){const gate=portalPoint(6);burst(gate.x,height(gate.x,gate.z)+5,gate.z,[.65,1,.85],120,2.8);shake=.7;pulseSfx(920,.8,'triangle',.09);save()}
}
function activateFlight(){game.flying=!game.flying;game.secretFlight=true;
 if(game.flying){player.y=Math.max(player.y,height(player.x,player.z)+2.6);player.flightLaunch=.65;player.vy=0;player.grounded=false;showToast(language==='id'?'MODE TERBANG':'FLIGHT MODE',1.6)}
 else {player.flightLaunch=0;}
 refreshSkills();}
let jumpTimes=[];
function doDash(){
 if(game.state!=='playing')return false;
 player.hitPause=0;const input=getInput();let dir=cameraMove(input);
 if(!input.walking){dir={x:Math.sin(orbit),z:Math.cos(orbit)}}
 const length=Math.hypot(dir.x,dir.z)||1;
 player.dashVX=dir.x/length;player.dashVZ=dir.z/length;
 // Flight burst follows the camera and can angle up/down with the view or altitude buttons.
 player.dashVY=game.flying?clamp((.32-orbitPitch)*27,-11,14):0;
 if(game.flying&&keySet.has(keybinds.jump))player.dashVY=26;
 if(game.flying&&(keySet.has(keybinds.descend)||flightTouchDrop))player.dashVY=-26;
 player.dashTime=game.flying?.24:.18;
 player.dashCooldown=0;
 player.dashSerial=(player.dashSerial||0)+1;
 player.vx=player.dashVX*(game.flying?96:60);
 player.vz=player.dashVZ*(game.flying?96:60);
 if(game.flying){player.y=Math.max(player.y,height(player.x,player.z)+6.8);player.vy=0;player.grounded=false;}
 player.invuln=Math.max(player.invuln,game.flying?.17:.22);
 player.cameraKick=Math.max(player.cameraKick,game.flying?.15:.10);
 const accent=game.flying?[.41,.97,1]:regions[game.zone].accent;
 burst(player.x,player.y+1.1,player.z,accent,game.flying?12:10,.56);
 pulseSfx(game.flying?340:220,.11,'triangle',.025);
 ldx.noise=Math.max(ldx.noise,14);if(ldx.pulseBuff>0)ldx.shock(player.x,player.z,9,26);
 return true;
}
function doJump(){if(game.state!=='playing')return;
 const now=performance.now();jumpTimes=jumpTimes.filter(t=>now-t<1650);jumpTimes.push(now);
 if(jumpTimes.length>=3){jumpTimes=[];player.jumpBuffer=0;activateFlight();pulseSfx(840,.4,'sine',.08);return}
 if(game.flying){player.y=Math.min(height(player.x,player.z)+70,player.y+2.7);burst(player.x,player.y,player.z,[.36,.83,1],8,.5);return}
 if(player.grounded||player.coyote>0){
  player.vy=10.4;player.grounded=false;player.coyote=0;player.jumpBuffer=0;
  pulseSfx(230,.12,'sine',.016);
 }else{
  player.jumpBuffer=.14; // A press just before landing still becomes a jump.
 }
}
function fireForward(){return [Math.sin(orbit)*Math.cos(orbitPitch),-Math.sin(orbitPitch),Math.cos(orbit)*Math.cos(orbitPitch)]}
function fireTargetPoint(e){return [e.x,e.y+(e.kind==='bat'?0:(e.boss?2.4:e.kind?1.05:1.5)),e.z]}
function livingFireTargets(){
 // Both enemy characters and wildlife are targetable. Stags remain nonaggressive but targetable.
 return [...enemies,...wildlife].filter(e=>!e.dead&&Number.isFinite(e.hp)&&e.hp>0);
}
const FIRE_LOCK_RANGE=45;
function validAutoAimTarget(e,origin=[player.x,player.y+1.85,player.z]){
 if(!e||e.dead||!Number.isFinite(e.hp)||e.hp<=0)return false;
 if(!game.flying&&Math.hypot(e.x-origin[0],e.z-origin[2])>FIRE_LOCK_RANGE)return false;
 return true;
}
function findFireTarget(origin,forward,except=null){
 let best=null,bestScore=Infinity;
 for(const e of livingFireTargets()){
  if(e===except||!validAutoAimTarget(e,origin))continue;
  const pt=fireTargetPoint(e),dx=pt[0]-origin[0],dz=pt[2]-origin[2];
  const dist=Math.hypot(dx,pt[1]-origin[1],dz);
  // Prioritize the current realm without imposing a hard limit while flying.
  const realmPenalty=game.flying&&e.zone!==game.zone?7000:0;
  const score=dist+realmPenalty;
  if(score<bestScore){bestScore=score;best=e;}
 }
 return best;
}
let currentFireLock=null,autoAimSwitchCount=0,fireLockWindow=0;
// Camera lock only during a short fire-cast window; homing projectiles continue independently.
const FIRE_CAMERA_LOCK_SECONDS=.58;
function selectAutoAimTarget(){
 if(fireLockWindow<=0||game.state!=='playing')return null;
 const origin=[player.x,player.y+1.85,player.z];
 if(validAutoAimTarget(currentFireLock,origin))return currentFireLock;
 const previous=currentFireLock;
 currentFireLock=findFireTarget(origin,fireForward());
 if(previous!==currentFireLock&&currentFireLock)autoAimSwitchCount++;
 return currentFireLock;
}
function fireAimInfo(){
 // A debug/status query must never acquire a target or rotate the camera.
 const target=game.state==='playing'&&fireLockWindow>0&&validAutoAimTarget(currentFireLock)?currentFireLock:null;
 return {locked:!!target,type:target?(target.boss?'boss':target.kind||'enemy'):null,
  distance:target?Math.round(Math.hypot(target.x-player.x,target.z-player.z)*10)/10:null,
  mode:game.flying?'flight-unlimited':'ground-45m-360',
  target:target?{x:target.x,y:target.y,z:target.z,zone:target.zone+1}:null,
  eligibleInRealm:livingFireTargets().filter(e=>e.zone===game.zone).length,
  switches:autoAimSwitchCount};
}
function updateFireLockState(dt=0){
 if(game.state!=='playing'){currentFireLock=null;fireLockWindow=0;return;}
 fireLockWindow=Math.max(0,fireLockWindow-dt);
 if(fireLockWindow<=0){currentFireLock=null;return;}
 const e=selectAutoAimTarget();
 if(!e)return;
 // Camera follows the monster automatically, and transitions at once upon death.
 const pt=fireTargetPoint(e),dx=pt[0]-player.x,dz=pt[2]-player.z;
 const heading=Math.atan2(dx,dz),horizontalDistance=Math.max(.12,Math.hypot(dx,dz));
 const targetPitch=clamp(-Math.atan2(pt[1]-(player.y+2.1),horizontalDistance),-1.10,1.10);
 const factor=dt>0?1-Math.exp(-dt*42):1;
 orbit+=shortestTurn(orbit,heading)*factor;
 orbitPitch=mix(orbitPitch,targetPitch,factor);
}
function positionFireLockMarker(){} // Silent lock: no marker, banner or notification.
function applyHomingDamage(target){
 if(!target||target.dead||target.hp<=0)return;
 const amount=target.boss?Math.max(65,Math.ceil(target.maxHp*.35)):Math.ceil(target.hp);
 if(target.kind){
  target.hp-=amount;damagePopup(target,amount);target.hit=.4;
  burst(target.x,target.y+(target.kind==='bat'?0:1),target.z,regions[target.zone].accent,14,.4);
  if(target.hp<=0){target.hp=0;target.dead=true;game.kills++;game.essence+=18;}
 }else{damageEnemy(target,amount)}
 if(target.dead||target.hp<=0){
  if(currentFireLock===target)currentFireLock=null;
  if(fireLockWindow>0){
   selectAutoAimTarget(); // Immediate target switch, but only while casting fire.
   updateFireLockState(0);
  }
 }
}
// Create by LamberthRumpaidus
function doFire(){
 if(game.state!=='playing'||player.fireCooldown>0||!skillUnlocked('fire'))return false;
 if(player.mp<14){showToast(language==='id'?'ENERGI API BELUM CUKUP':'NOT ENOUGH FIRE ENERGY',.8);return false;}
 player.fireCooldown=.26;player.fireCast=.39;player.mp-=14;
 fireLockWindow=FIRE_CAMERA_LOCK_SECONDS;
 const target=selectAutoAimTarget();
 if(target)updateFireLockState(0);
 const forward=fireForward();player.angle=orbit;
 const mx=player.x+forward[0]*1.1,my=player.y+1.85,mz=player.z+forward[2]*1.1;
 const direction=target?norm(sub(fireTargetPoint(target),[mx,my,mz])):forward;
 player.fireAimYaw=Math.atan2(direction[0],direction[2]);
 const speed=game.flying?145:92,dist=target?Math.hypot(...sub(fireTargetPoint(target),[mx,my,mz])):0;
 attacks.push({x:mx,y:my,z:mz,vx:direction[0]*speed,vy:direction[1]*speed,vz:direction[2]*speed,
  speed,life:target?Math.max(4,dist/speed+10):2.1,kind:'fire',size:game.flying?.8:.6,phase:0,
  aimTarget:target,homingMagic:!!target,hitCooldown:0});
 burst(mx,my,mz,[1,.52,.15],30,.43);burst(mx,my,mz,[1,.91,.37],18,.22);
 player.cameraKick=.25;shake=Math.max(shake,.035);pulseSfx(330,.19,'sawtooth',.045);ldx.armFire();return true;
}
function doPulse(){if(game.state!=='playing'||player.pulseCooldown>0||player.mp<28)return;if(!skillUnlocked('pulse'))return;player.pulseCooldown=.45;player.mp-=28;ldx.armPulse();for(let e of enemies)if(!e.dead&&distance(player,e)<13){damageEnemy(e,33);e.stagger=.9}
 for(let b of wildlife)if(!b.dead&&b.kind!=='bat'&&distance(player,b)<13){b.hp-=45;b.hit=.4;if(b.hp<=0){b.dead=true;game.essence+=18;burst(b.x,b.y+1,b.z,[.8,.22,.4],18,.32)}}burst(player.x,player.y+1,player.z,[.8,.6,1],70,2);shake=.28;pulseSfx(95,.42,'sawtooth',.05)}
let altarHold=0,altarZone=-1;
function activateSeal(z){if(game.seals[z])return;game.seals[z]=true;altarHold=0;altarZone=-1;
 game.checkpoint=shrinePoint(z).z;game.checkpointX=shrinePoint(z).x;
 burst(shrinePoint(z).x,height(shrinePoint(z).x,shrinePoint(z).z)+4,shrinePoint(z).z,regions[z].accent,95,2);
 pulseSfx(760,.5,'sine',.07);showToast('✦ CHECKPOINT',1.1);refreshSkills();save();
}
// Interaction button now only collects relics. All seals auto-charge in the magic circle.
function interact(){if(game.state!=='playing')return;let z=game.zone;const rx=relicPos(z),rd=Math.hypot(player.x-rx[0],player.z-rx[1]);
 if(rd<5&&!game.relics[z]){game.relics[z]=true;game.essence+=85;player.hp=Math.min(player.maxHp,player.hp+36);player.mp=100;burst(rx[0],height(rx[0],rx[1])+1,rx[1],regions[z].accent,95,1.6);showToast(T('relic'),1.65);save();}}

function takeHit(hp,src){if(src&&ldx.tryParry(src))return;if(player.invuln>0){if(player.dashTime>0&&dodgeRewardTimer<=0){
  dodgeRewardTimer=1.15;player.counterReady=2.8;gameplayStats.perfectDodges++;
  player.mp=Math.min(100,player.mp+18);burst(player.x,player.y+1.2,player.z,[.48,1,.85],23,.65);
  showToast(language==='id'?'DODGE SEMPURNA':'PERFECT DODGE',.65);}
  return;}player.hp=Math.max(0,player.hp-hp);window.dispatchEvent(new CustomEvent('landlord:impact',{detail:{kind:'hurt',x:src?.x??player.x,y:(src?.y??player.y)+1.5,z:src?.z??player.z,boss:!!src?.boss}}));player.invuln=.85;ui.damage.style.opacity=.6;setTimeout(()=>ui.damage.style.opacity=0,180);shake=.26;pulseSfx(90,.26,'sawtooth',.05);if(player.hp<=0){player.x=game.checkpointX;player.z=game.checkpoint;player.y=height(player.x,player.z);player.vy=0;player.vx=player.vz=0;game.flying=false;player.grounded=true;player.hp=player.maxHp;player.mp=100;player.invuln=3;cameraReady=false;refreshSkills();showToast('✦ CHECKPOINT',1.1);save()}}
let shake=0,impactDirection=[0,0];
function update(dt){
 updateFireLockState(dt);
 if(game.state==='playing'&&!game.relics[game.zone]){let r=relicPos(game.zone);if(Math.hypot(player.x-r[0],player.z-r[1])<4.5)interact();}clock+=dt;game.time+=dt;game.played+=dt;animatedTime+=dt;ldx.update(dt);
 player.invuln=Math.max(0,player.invuln-dt);
 player.coyote=player.grounded?.11:Math.max(0,player.coyote-dt);
 player.jumpBuffer=Math.max(0,player.jumpBuffer-dt);
 player.counterReady=Math.max(0,player.counterReady-dt);
 for(const p of damagePopups){p.t+=dt;p.life-=dt;}
 damagePopups=damagePopups.filter(p=>p.life>0);
 // Localized hit-stop: only sword pose time is affected; movement, inputs and world physics continue.
 const stopped=player.dashTime>0?0:Math.min(dt,player.hitPause);
 const animDT=dt-stopped;
 player.hitPause=Math.max(0,player.hitPause-dt);
 player.cameraKick=Math.max(0,player.cameraKick-dt*1.9);
 const hadAttack=player.attackTime>0;
 if(hadAttack){
   player.attackTime=Math.max(0,player.attackTime-animDT);
   player.attackClock=player.attackDuration-player.attackTime;
   if(player.attackHitReady&&player.attackClock/player.attackDuration>=COMBOS[player.combo].hit){player.attackHitReady=false;resolveMelee();}
   if(player.attackTime<=.065&&player.attackQueued&&player.attackBuffer>0){startAttack((player.combo+1)%3);}
 }
 player.attackBuffer=Math.max(0,(player.attackBuffer||0)-dt);
 if(!player.attackTime)$('comboTag').classList.remove('show');
 if(!player.attackTime)player.comboTime=Math.max(0,player.comboTime-dt);
 player.swordTrail=player.swordTrail.filter(s=>(s.life-=dt)>0);
 hitFlashes=hitFlashes.filter(h=>(h.life-=dt)>0);
 $('combatFlash').style.opacity=Math.min(.68,player.cameraKick*1.4).toFixed(3);
 player.attackCooldown=Math.max(0,player.attackCooldown-dt);player.fireCooldown=Math.max(0,player.fireCooldown-dt);player.fireCast=Math.max(0,player.fireCast-dt);player.dashCooldown=Math.max(0,player.dashCooldown-dt);player.pulseCooldown=Math.max(0,player.pulseCooldown-dt);player.dashTime=Math.max(0,player.dashTime-dt);shake=Math.max(0,shake-dt);
 let previousZ=player.z,previousX=player.x,previousZone=zoneOf(previousZ);
 const input=getInput(),dir=cameraMove(input);
 const running=input.walking&&input.z>.25&&Math.abs(input.x)<.8;
 const combatPose=sampleAttackPose(player);
 const baseSpeed=(game.flying?40:(running?14.2:10.6))*(player.attackTime>0?(player.combo===2?.62:.79):1);
 const movementSpeed=player.dashTime>0?(game.flying?96:60):baseSpeed;
 // Acceleration + braking, with extra traction in the air. No instant strafing or sliding.
 const traction=1-Math.exp(-dt*(game.flying?19:player.grounded?(input.walking?22:25):11));
 const vtx=player.dashTime>0?player.dashVX*movementSpeed:dir.x*movementSpeed;
 const vtz=player.dashTime>0?player.dashVZ*movementSpeed:dir.z*movementSpeed;
 player.vx=mix(player.vx,vtx,player.dashTime>0?1:traction);
 player.vz=mix(player.vz,vtz,player.dashTime>0?1:traction);
 if(Math.abs(player.vx)+Math.abs(player.vz)<.025){player.vx=0;player.vz=0}
 player.x+=player.vx*dt;player.z+=player.vz*dt;
 // Weapon follow-through pulls the hips forward without teleporting the hero.
 if(player.attackTime>0&&combatPose.active>.30&&player.grounded){
    if(Math.random()<.22&&player.swordTip){let v=player.swordTip;burst(v[0],v[1],v[2],COMBOS[player.combo].color,2,.10);}
    let impulse=(player.combo===2?3.2:1.3)*combatPose.active*dt;
    player.x+=Math.sin(player.angle)*impulse;player.z+=Math.cos(player.angle)*impulse;
 }
 const actualSpeed=Math.hypot(player.vx,player.vz),vFraction=clamp(actualSpeed/(game.flying?40:14.2),0,1.2);
 player.motion=mix(player.motion,vFraction,Math.min(1,dt*9));
 player.gait+=dt*actualSpeed*.79;
 player.move=player.gait;
 // Free camera: face the current run direction. Right-click aim: face the crosshair and strafe/backpedal.
 const desiredAngle=mouseOrbit?orbit:(actualSpeed>.6?Math.atan2(player.vx,player.vz):player.angle);
 const turn=shortestTurn(player.angle,desiredAngle);
 player.angle+=turn*(1-Math.exp(-dt*(player.dashTime>0?27:18)));
 player.lean=mix(player.lean,clamp(turn*3.3,-.34,.34)*player.motion,Math.min(1,dt*8));
 if(player.dashTime>0&&Math.random()<.40){const col=game.flying?[.39,.90,1]:regions[game.zone].accent;burst(player.x-player.dashVX*.75,player.y+1.2,player.z-player.dashVZ*.75,col,game.flying?3:2,.17);}
 if(player.grounded&&!game.flying&&actualSpeed>4&&Math.floor(player.gait/Math.PI)!==Math.floor((player.gait-actualSpeed*.79*dt)/Math.PI)){
   let fx=player.x+Math.sin(player.angle+.5)*.34,fz=player.z+Math.cos(player.angle+.5)*.3;
   burst(fx,height(fx,fz)+.13,fz,tint(regions[game.zone].ground,1.4),quality==='low'?2:5,.12);
 }
 // Sweep movement with substeps and axis sliding. Obstacles are registered from static props,
 // so rocks, crystalline spikes, trees, columns and gateposts now physically block the hero.
 let wantX=player.x-previousX,wantZ=player.z-previousZ;
 player.x=previousX;player.z=previousZ;
 // Dash impacts can shatter crates while permanent architecture stays solid.
 if(player.dashTime>0&&Math.abs(player.y-height(player.x,player.z))<4)damageNearbyBreakables(player.x,player.z,2.3,90);
 // Flying and dashing do NOT disable structural collision.
 moveWithCollision(player,wantX,wantZ,.72,player.y,2.65);
 player.x=clamp(player.x,-79,79);player.z=clamp(player.z,3,END-6);
 const gate=portalPoint(previousZone),crossed=previousZone<6&&previousZ<gate.z&&player.z>=gate.z;
 if(crossed&&!game.flying){
  const clearance=player.y-height(gate.x,gate.z);
  if(Math.abs(player.x-gate.x)<9&&clearance<9.3){
   const destination=previousZone+1;portalFlash();player.z=destination*LEN+10;player.x=roadCenter(player.z);
   player.vx=player.vz=0;player.invuln=2;burst(player.x,height(player.x,player.z)+3,player.z,regions[destination].accent,38,1.3);
  }else{player.z=gate.z-2.2;if(warnTimer<=0){showToast(language==='id'?'CARI GERBANG':'FIND GATE',1.1);warnTimer=3;}}
 }
 warnTimer=Math.max(0,warnTimer-dt);
 sidePortalCooldown=Math.max(0,sidePortalCooldown-dt);
 if(!game.flying&&sidePortalCooldown<=0){const side=sidePortalPoint(previousZone),sep=Math.hypot(player.x-side.x,player.z-side.z);
  if(sep<3.4){
   sidePortalHold+=dt;
   if(sidePortalHold>=1.15){portalFlash();const destination=side.destination;
     player.z=destination*LEN+13;player.x=roadCenter(player.z);
     player.vx=player.vz=0;sidePortalHold=0;sidePortalCooldown=2;player.invuln=2;
     showToast('✦ PORTAL '+String(destination+1).padStart(2,'0'),1.4);save();}
  }else sidePortalHold=0;
 }
 const ground=height(player.x,player.z),wasGrounded=player.grounded;
 if(game.flying){
  let lift=keySet.has(keybinds.jump)?24:0,drop=keySet.has(keybinds.descend)?24:0;
  if(typeof flightTouchRise!=='undefined'&&flightTouchRise)lift=24;
  if(typeof flightTouchDrop!=='undefined'&&flightTouchDrop)drop=24;
  const launch=player.flightLaunch>0;
  if(launch){player.flightLaunch=Math.max(0,player.flightLaunch-dt);lift=Math.max(lift,20);if(Math.random()<.7)burst(player.x,player.y-.6,player.z,[.35,.92,1],2,.16);}
  player.y=clamp(player.y+(lift-drop+(player.dashTime>0?player.dashVY:0))*dt,ground+(launch?2.6:8),ground+70);player.vy=0;player.grounded=false;
 }else{player.vy-=24*dt;player.y+=player.vy*dt;if(player.y<=ground){player.y=ground;player.vy=0;player.grounded=true;if(!wasGrounded){player.landPulse=.42;shake=Math.max(shake,.09);burst(player.x,ground+.12,player.z,regions[game.zone].ground,11,.23);}
   if(player.jumpBuffer>0){player.jumpBuffer=0;player.coyote=0;player.vy=10.4;player.grounded=false;gameplayStats.bufferedJumps++;}}
 else player.grounded=false;}
 player.landPulse=Math.max(0,(player.landPulse||0)-dt);
 if(checkVictory())return;
 player.mp=Math.min(100,player.mp+18*dt);
 for(let e of enemies){
   if(e.dead||Math.abs(e.z-player.z)>92)continue;
   e.attack=Math.max(0,e.attack-dt);e.hit=Math.max(0,e.hit-dt);e.stagger=Math.max(0,e.stagger-dt);e.hitRecoil=Math.max(0,(e.hitRecoil||0)-dt);
   if(Math.abs(e.knockVX||0)+Math.abs(e.knockVZ||0)>.01){
      const dec=Math.exp(-dt*9.2);moveWithCollision(e,(e.knockVX||0)*dt,(e.knockVZ||0)*dt,e.radius*.64);e.knockVX*=dec;e.knockVZ*=dec;
   }
   e.projectileCD=Math.max(0,e.projectileCD-dt);
   let dd=distance(e,player),active=(ldx.perceive(e,dd,dt)&&(!game.flying||player.y-e.y<(e.boss?9:4)||e.mem>0))||e.windup>0;
   if(active){
      e.angle=(e.seen||e.windup>0)?Math.atan2(player.x-e.x,player.z-e.z):Math.atan2(e.lkx-e.x,e.lkz-e.z);
      if(e.windup>0){
        e.windup-=dt;
        if(e.windup<=0){
          const reach=e.boss?5.4:3.4;
          if(dd<reach&&Math.abs(shortestTurn(e.angle,Math.atan2(player.x-e.x,player.z-e.z)))<1.25)
            takeHit(e.boss?19:7+e.zone*2,e);
          burst(e.x,e.y+1.1,e.z,regions[e.zone].accent,e.boss?25:9,.42);
          shake=Math.max(shake,.09);
        }
      }else if(e.stagger<=0){
        if(dd>e.radius+2){
          let sp=e.speed*(e.boss?1.02:1);
          const retreat=!e.boss&&e.hp<e.maxHp*.27&&e.seen&&dd<14;
          const gx=retreat?clamp(e.x+(e.x-player.x)*1.5,-74,74):(e.seen?player.x:e.lkx);
          const gz=retreat?clamp(e.z+(e.z-player.z)*1.5,4,END-5):(e.seen?player.z:e.lkz);
          let flankX=0,flankZ=0,repelX=0,repelZ=0;
          if(e.seen&&!retreat&&dd<16){
            const lateral=e.boss?0:(Math.sin(e.phase*2.3)>=0?1:-1);
            const sideForce=clamp((dd-2.3)/12,0,1)*2.7;
            flankX=-Math.cos(e.angle)*lateral*sideForce;
            flankZ=Math.sin(e.angle)*lateral*sideForce;
          }
          // Local separation is restricted to the player's active realm, not all 7 worlds.
          for(const other of enemies){
            if(other===e||other.dead||other.zone!==e.zone)continue;
            const dx=e.x-other.x,dz=e.z-other.z,d2=dx*dx+dz*dz;
            if(d2<12.25&&d2>.002){const w=(3.5-Math.sqrt(d2))/d2;repelX+=dx*w;repelZ+=dz*w;}
          }
          const heading=steerAround(e,gx+flankX+repelX*2.2,gz+flankZ+repelZ*2.2,retreat?sp*1.28:sp,dt,e.radius*.60);
          if(heading!==null)e.angle+=shortestTurn(e.angle,heading)*Math.min(1,dt*4);
          e.animation+=dt*sp*1.9;
        } else if(e.attack<=0){e.windup=e.boss?(e.p2?.78:.96):.57;window.dispatchEvent(new CustomEvent('landlord:impact',{detail:{kind:'enemy',x:e.x,y:e.y+1.5,z:e.z,boss:!!e.boss}}));e.attack=e.boss?(e.p2?1.5:2.3):1.75;}
      }
      // Ranged bosses wind up recognizable projectiles instead of random instantaneous hits.
      if(e.boss&&e.zone>=3&&dd>7&&dd<23&&e.projectileCD<=0&&e.windup<=0){
        const lead=.34+Math.min(.5,dd/40),tx=player.x+player.vx*lead,tz=player.z+player.vz*lead;
        let a=Math.atan2(tx-e.x,tz-e.z);
        const spread=e.p2?[-.22,0,.22]:[0];
        for(const offset of spread){const ang=a+offset;
          attacks.push({x:e.x,y:e.y+2,z:e.z,vx:Math.sin(ang)*(e.p2?16:13),vz:Math.cos(ang)*(e.p2?16:13),life:2.5,kind:'enemy',size:e.p2?.53:.5});}
        e.projectileCD=2.8+hash(clock*3)*1.7;
        burst(e.x,e.y+2,e.z,regions[e.zone].accent,14,.5);
      }
   }else{let wobble=Math.sin(clock*.25+e.phase)*dt*.1;moveWithCollision(e,wobble,Math.cos(clock*.28+e.phase)*dt*.1,e.radius*.60)}
   e.y=height(e.x,e.z);
 }
 // Haunted wildlife: cursed wolves and crawlers stalk the road, bats wheel overhead.
 for(const beast of wildlife){if(beast.dead||Math.abs(beast.z-player.z)>72)continue;
  if(beast.kind==='bat'){
    beast.x=beast.homeX+Math.sin(clock*.82+beast.phase)*6;
    beast.z=beast.homeZ+Math.cos(clock*.69+beast.phase)*5;
    beast.y=height(beast.x,beast.z)+5.8+Math.sin(clock*1.9+beast.phase)*1.5;
    beast.angle=Math.atan2(Math.cos(clock*.82+beast.phase),-Math.sin(clock*.69+beast.phase));continue;
  }
  beast.hit=Math.max(0,beast.hit-dt);beast.cooldown=Math.max(0,beast.cooldown-dt);
  beast.attackAnim=Math.max(0,beast.attackAnim-dt);
  let dd=Math.hypot(player.x-beast.x,player.z-beast.z);
  const aggressive=dd<21*ldx.hunt(beast)&&(!game.flying||player.y-height(beast.x,beast.z)<4);
  let toward=aggressive?Math.atan2(player.x-beast.x,player.z-beast.z):Math.atan2(beast.homeX-beast.x+Math.sin(clock*.4+beast.phase)*7,beast.homeZ-beast.z+Math.cos(clock*.35+beast.phase)*7);
  beast.angle+=shortestTurn(beast.angle,toward)*Math.min(1,dt*3.4);
  let sp=aggressive?(beast.kind==='wolf'?4.8*ldx.hunt(beast):3.4):1.25;
  if(dd>2.2){
    const gx=aggressive?player.x:beast.homeX+Math.sin(clock*.4+beast.phase)*7;
    const gz=aggressive?player.z:beast.homeZ+Math.cos(clock*.35+beast.phase)*7;
    const heading=steerAround(beast,gx,gz,sp,dt,beast.kind==='wolf'?.78:1.05);
    if(heading!==null)beast.angle+=shortestTurn(beast.angle,heading)*Math.min(1,dt*5);
  }
  else if(aggressive&&beast.cooldown<=0){beast.cooldown=1.85;beast.attackAnim=.52;
    takeHit(beast.kind==='wolf'?9:13);shake=Math.max(shake,.14);
    burst(beast.x,height(beast.x,beast.z)+.8,beast.z,[.77,.15,.29],10,.22);
  }
  beast.y=height(beast.x,beast.z);
 }
 for(const a of attacks){
   a.life-=dt;
   if(a.kind==='fire'&&a.homingMagic&&a.aimTarget&&!a.aimTarget.dead&&a.aimTarget.hp>0){
     // Accurate 3D homing, including moving and flying monsters.
     // Locked magic shots phase around physical debris; ordinary shots still collide with solids.
     const pt=fireTargetPoint(a.aimTarget),offset=sub(pt,[a.x,a.y,a.z]),distanceLeft=Math.hypot(...offset);
     const speed=a.speed||92,step=Math.min(distanceLeft,speed*dt);
     const direction=distanceLeft>1e-5?scale(offset,1/distanceLeft):[0,0,0];
     a.vx=direction[0]*speed;a.vy=direction[1]*speed;a.vz=direction[2]*speed;
     if(distanceLeft>1.0){a.x+=direction[0]*step;a.y+=direction[1]*step;a.z+=direction[2]*step;}
     a.hitCooldown=Math.max(0,(a.hitCooldown||0)-dt);
     if(distanceLeft<=Math.max(1.0,speed*dt+1)){
       a.x=pt[0];a.y=pt[1];a.z=pt[2];
       if(a.hitCooldown<=0){applyHomingDamage(a.aimTarget);a.hitCooldown=.09;}
     }
     a.phase=(a.phase||0)+dt*14;
     if(a.aimTarget.dead||a.aimTarget.hp<=0){a.life=0;
       burst(a.x,a.y,a.z,[1,.48,.2],18,.55);
     }
     if(a.life>0&&Math.random()<.65)burst(a.x,a.y,a.z,[1,.52,.19],2,.15);
     continue;
   }
   // Non-homing fire and enemy shots preserve swept collision with permanent structures.
   const travel=Math.hypot(a.vx,a.vy||0,a.vz)*dt,steps=Math.max(1,Math.ceil(travel/.45));
   let hitWall=false;
   for(let k=0;k<steps;k++){
     a.x+=a.vx*dt/steps;a.z+=a.vz*dt/steps;a.y+=(a.vy||0)*dt/steps;
     const wall=blocking(a.x,a.z,.13,a.y-.12,.30);
     if(wall||a.y<height(a.x,a.z)+.04){
       if(wall&&wall.breakableId!==undefined&&a.kind==='fire')strikeBreakableById(wall.breakableId,63);
       hitWall=true;break;
     }
   }
   a.phase=(a.phase||0)+dt*14;
   if(hitWall){a.life=0;burst(a.x,a.y,a.z,a.kind==='fire'?[1,.42,.20]:[.65,.32,.75],10,.2);continue;}
   if(a.kind==='fire'){
     for(const b of wildlife)if(!b.dead&&Number.isFinite(b.hp)&&Math.hypot(b.x-a.x,b.z-a.z)<1.6&&Math.abs(fireTargetPoint(b)[1]-a.y)<2.0){applyHomingDamage(b);a.life=0;break;}
     for(const e of enemies)if(a.life>0&&!e.dead&&Math.hypot(e.x-a.x,e.z-a.z)<(e.boss?3.9:1.7)&&Math.abs(e.y+1.6-a.y)<(e.boss?4.5:2.4)){
       damageEnemy(e,46);a.life=0;break;
     }
   }else if(a.kind==='enemy'&&Math.hypot(player.x-a.x,player.z-a.z)<1.8&&Math.abs(player.y+1-a.y)<2.4){takeHit(17);a.life=0;}
   if(a.life>0&&Math.random()<.62)burst(a.x,a.y,a.z,a.kind==='fire'?[1,.45,.2]:[.78,.23,.68],2,.15);
 }attacks=attacks.filter(a=>a.life>0);
 for(const d of debris){d.life-=dt;d.x+=d.vx*dt;d.z+=d.vz*dt;d.y+=d.vy*dt;d.vy-=15*dt;d.vx*=Math.exp(-dt*2.5);d.vz*=Math.exp(-dt*2.5);d.y=Math.max(d.y,height(d.x,d.z)+.08);d.rot+=dt*5;}debris=debris.filter(d=>d.life>0);
 for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=p.vy*dt;p.vy-=7*dt}particles=particles.filter(p=>p.life>0);
 for(const p of pickups){p.life-=dt;let d=Math.hypot(p.x-player.x,p.z-player.z);if(d<3.5){p.life=0;game.essence+=p.value;player.hp=Math.min(player.maxHp,player.hp+.6);}else if(d<14){const pull=Math.min(1,dt*(3+Math.max(0,14-d)*.48));p.x+=(player.x-p.x)*pull;p.z+=(player.z-p.z)*pull}}
 pickups=pickups.filter(p=>p.life>0);
 let desiredHp=100+(powerLevel()-1)*14;if(desiredHp>player.maxHp){player.hp+=desiredHp-player.maxHp;player.maxHp=desiredHp;showToast('✦ '+T('level')+' '+powerLevel(),1.8);save()}
 game.autosave+=dt;if(game.autosave>18){game.autosave=0;save()}
 markExplored();
 updateDiscoveries(dt);
 // Timer only advances when standing nearly still on the magical ring, not beside it.
 nearShrine=-1;
 const sealZone=zoneOf(player.z),ring=shrinePoint(sealZone);
 const ringDistance=Math.hypot(player.x-ring.x,player.z-ring.z);
 if(!game.seals[sealZone]&&ringDistance<=4.75){
   nearShrine=sealZone;
   if(altarZone!==sealZone){altarZone=sealZone;altarHold=0;}
   if(!game.flying&&player.grounded&&Math.hypot(player.vx,player.vz)<1.1&&player.dashTime<=0){
      altarHold=Math.min(2,altarHold+dt);
      if(altarHold>=2){activateSeal(sealZone);nearShrine=-1;}
   }else{altarHold=Math.max(0,altarHold-dt*1.4);}
 }else{altarZone=-1;altarHold=0;}

 if(toaster>0){toaster-=dt;if(toaster<=0)ui.toast.classList.remove('show')}
 if(splashTime>0){splashTime-=dt;if(splashTime<=0)ui.splash.classList.remove('visible')}
 zoneChanged();updateUI();refreshSkills();
}
function markExplored(){const j=zoneOf(player.z),cells=game.explored[j];game.visited[j]=true;
 const x=Math.round(player.x/11)*11,z=Math.round(player.z/11)*11;
 if(!cells.some(p=>p[0]===x&&p[1]===z)){cells.push([x,z]);if(cells.length>320)cells.shift();}
}
function travelRealm(index){if(!game.flying||game.state!=='map'||index<0||index>6)return;portalFlash();
 player.z=index*LEN+15;player.x=roadCenter(player.z);sidePortalCooldown=2;sidePortalHold=0;player.y=height(player.x,player.z)+16;player.vx=player.vz=player.vy=0;cameraReady=false;
 game.visited[index]=true;markExplored();game.prevZone=-1;game.state='playing';ui.map.classList.remove('visible');
 if(isTouchDevice())revealTouchControls();zoneChanged(true);refreshSkills();lastFrame=0;save();}
let warnTimer=0,sidePortalHold=0,sidePortalCooldown=0;
function powerLevel(){return 1+Math.min(5,Math.floor(game.essence/190))}
// Skinned-style procedural limbs: every knee, heel, shoulder and sword joint is animated in 3D.
function limb(m,a,b,ra,rb,col,emit=0,sides=7){
 let axis=norm(sub(b,a)),ref=Math.abs(axis[1])>.92?[0,0,1]:[0,1,0],right=norm(cross(axis,ref)),up=norm(cross(right,axis));
 for(let i=0;i<sides;i++){let t=i*TAU/sides,u=(i+1)*TAU/sides;
   const point=(ctr,r,k)=>add(ctr,add(scale(right,Math.cos(k)*r),scale(up,Math.sin(k)*r)));
   const n=k=>norm(add(scale(right,Math.cos(k)),scale(up,Math.sin(k))));
   m.smoothQuad([point(a,ra,u),point(a,ra,t),point(b,rb,t),point(b,rb,u)],[n(u),n(t),n(t),n(u)],col,emit);
 }
}
// LANDLORD VI / BLADE DANCE — full-body pose blending with articulated arms, sword and cloth.
function bladeSteel(m,base,tip,steel,glow){
 const v=norm(sub(tip,base)),t=Math.abs(v[1])>.93?[0,0,1]:[0,1,0],u=norm(cross(v,t)),w=norm(cross(v,u));
 const guardBase=add(base,scale(v,.13)),point=add(base,scale(v,2.27));
 const radius=.23;
 for(let i=0;i<4;i++){
    const a=i*TAU/4,b=(i+1)*TAU/4;
    const at=(p,r,angle)=>add(p,add(scale(u,Math.cos(angle)*r),scale(w,Math.sin(angle)*r)));
    m.quad(at(guardBase,radius,a),at(guardBase,radius,b),at(point,.13,b),at(point,.13,a),tint(steel,.81+.19*Math.cos(a)));
    m.tri(at(point,.13,a),at(point,.13,b),tip,glow,.21);
 }
 limb(m,add(base,scale(v,.15)),add(tip,scale(v,-.19)),.025,.012,glow,.77,5);
}
function playerModel(m){
 const p=player,steel=[.24,.32,.39],polish=[.40,.49,.55],iron=[.075,.105,.145],gold=[.56,.39,.18],leather=[.10,.07,.08],royal=[.20,.045,.065],magic=[.28,.78,.90];
 const pose=sampleAttackPose(p),activity=clamp(p.motion,0,1.1),phase=p.gait,airborne=!p.grounded,dash=p.dashTime>0,attack=p.attackTime>0;
 const attackBlend=attack?Math.min(1,Math.sin(Math.PI*pose.progress)*1.65):0;
 const bob=p.grounded?Math.sin(phase*2)*.047*activity*(1-attackBlend*.65):0;
 const landing=Math.sin(Math.PI*clamp((p.landPulse||0)/.42,0,1))*.16;
 const hips=1.12+bob-(dash?.29:0)-pose.crouch*.47-landing-(game.flying?.13:0);
 const breath=!attack&&!airborne?Math.sin(clock*2.05)*.032:0;
 const chest=2.21+bob+breath-(dash?.20:0)-pose.crouch*.39-landing*.8+(game.flying?.12:0);
 // Upper and lower body do not rotate together. Feet plant while the torso winds up.
 for(const side of [-1,1]){
    let stride=Math.sin(phase+(side===1?0:Math.PI))*activity*(1-attackBlend*.83);
    let step=stride*.67,footLift=airborne?.32:Math.max(0,stride)*.42;
    let stance=attackBlend*(side===1?-.45:.34),stanceZ=attackBlend*(side===1?-.51:.23);
    let hip=[side*.36,hips,.0],knee=[side*(.38+.09*attackBlend),.76+bob*.4,step*.43+stanceZ*.28+.13],ankle=[side*.40+stance,.18+footLift,-step+stanceZ];
    limb(m,hip,knee,.24,.18,steel,0,9);m.ellipsoid(...knee,.23,.22,.24,polish,0,5,9);
    limb(m,knee,ankle,.19,.15,tint(iron,1.13),0,9);
    // Foot follows local terrain rather than clipping on sloped ground.
    const footX=p.x+ankle[0]*Math.cos(p.angle)+ankle[2]*Math.sin(p.angle);
    const footZ=p.z-ankle[0]*Math.sin(p.angle)+ankle[2]*Math.cos(p.angle);
    const terrainOffset=clamp(height(footX,footZ)-p.y,-.34,.43);
    ankle[1]+=p.grounded?terrainOffset:0;
    m.ellipsoid(ankle[0],ankle[1]+.05,ankle[2]+.16,.30,.20,.50,iron,0,6,9);
    m.box(ankle[0],ankle[1]+.15,ankle[2]+.28,.38,.21,.32,gold);
    m.box(knee[0],knee[1],knee[2]+.15,.24,.36,.10,polish);
 }
 const oldPt=m.pt.bind(m),c=Math.cos(pose.twist),s=Math.sin(pose.twist);
 const twistLocal=(v)=>{
    let x=v[0],y=v[1]-hips,z=v[2];
    let xx=x*c+z*s,zz=-x*s+z*c;
    return [xx+(p.lean*.22)*(y+1.5),hips+y+.055*Math.sin(pose.progress*Math.PI),zz+pose.lunge*.28];
 };
 m.pt=(v)=>oldPt(twistLocal(v));
 m.ellipsoid(0,chest-.25,0,.59,.82,.43,iron,0,10,12);
 m.ellipsoid(0,chest+.15,.07,.69,.60,.43,steel,0,9,13);
 m.box(0,chest+.16,.46,.26,.85,.07,tint(gold,.86));
 m.box(0,chest+.51,.39,1.06,.12,.13,polish);
 m.box(0,chest-.40,.36,1.02,.13,.14,gold);
 m.box(0,hips-.07,.01,1.0,.27,.7,leather);
 m.box(0,hips-.08,.41,.27,.22,.14,gold,.34);
 for(let j=-2;j<=2;j++)m.box(j*.25,hips-.26,.24-Math.abs(j)*.05,.22,.48,.29,tint(steel,.78+j*.025),0,j*.08);
 // Neck, visor, head, crest; subtly pitch into each attack for weight.
 m.ellipsoid(0,chest+.75,0,.32,.29,.30,iron,0,6,9);
 m.ellipsoid(0,chest+1.06,.02,.37,.48,.36,steel,0,12,18);
 m.ellipsoid(0,chest+1.36,-.05,.28,.16,.30,polish,0,8,14);
 m.ellipsoid(0,chest+1.22,.25,.32,.21,.18,iron,0,8,14);
 m.box(0,chest+1.07,.36,.60,.10,.15,[.018,.025,.036]);
 m.box(0,chest+.96,.37,.6,.11,.17,[.06,.11,.15]);
 for(const side of [-1,1]){
   m.ellipsoid(side*.14,chest+1.08,.435,.085,.025,.024,magic,.42,4,8);
   m.box(side*.34,chest+1.14,-.02,.075,.42,.30,tint(gold,.77),0,side*.04);
 }
 m.ellipsoid(0,chest+1.53,-.13,.11,.15,.35,tint(royal,1.4),0,7,13);
 for(let i=0;i<5;i++)m.box(0,chest+.91+i*.08,-.325,.12,.027,.035,gold);
 m.box(0,chest+.65,-.01,1.28,.21,.70,tint(steel,.9));
 // Joint chain: shoulders -> elbows -> wrists, with independently posed hands.
 for(const side of [-1,1]){
   const shoulder=[side*.77,chest+.37,-.04];
   const armSwing=Math.sin(phase+(side===1?Math.PI:0))*.35*activity*(1-attackBlend);
   let hand,elbow;
   if(side===1){
     hand=[pose.hand[0],pose.hand[1]+(chest-2.21),pose.hand[2]];
     elbow=[.91+(hand[0]-.91)*.50+.12,chest+.03+(hand[1]-chest)*.41,hand[2]*.48-.14];
   } else {
     const cast=clamp((p.fireCast||0)/.39,0,1),lift=Math.sin(Math.PI*(1-cast));
     hand=[-.96+cast*.42,chest-.61+cast*1.0,.18+armSwing*.85+attackBlend*.25+lift*.6];
     elbow=[-1.10+cast*.24,chest-.14+cast*.50,armSwing*.4+attackBlend*.18+cast*.22];
   }
   if(airborne){hand[1]+=.25;elbow[1]+=.18;}if(game.flying){hand[0]+=side*.37;hand[1]+=.21;elbow[0]+=side*.25;}
   m.ellipsoid(side*.79,chest+.34,-.04,.43,.28,.46,iron,0,9,14);
   for(let plate=0;plate<3;plate++){const shift=plate*.095;m.ellipsoid(side*(.74+shift),chest+.46-plate*.135,-.055,.36-plate*.035,.12,.40-plate*.018,plate===0?polish:steel,0,7,14);}
   m.box(side*.85,chest+.50,-.33,.17,.07,.08,gold);
   limb(m,shoulder,elbow,.25,.20,steel,0,9);
   m.ellipsoid(...elbow,.23,.23,.23,gold,0,5,8);
   limb(m,elbow,hand,.21,.15,iron,0,9);
   m.ellipsoid(...hand,.20,.19,.26,polish,0,5,8);
   if(side===1){
     const direction=pose.blade,grip=add(hand,scale(direction,-.17)),bladeBase=add(hand,scale(direction,.60)),bladeTip=add(bladeBase,scale(direction,2.75));
     limb(m,grip,bladeBase,.115,.13,leather,.1,8);
     // Crossguard is perpendicular to the sword axis, so it rotates with the attack.
     let guardAxis=norm(cross(direction,Math.abs(direction[1])>.92?[0,0,1]:[0,1,0]));
     limb(m,add(bladeBase,scale(guardAxis,-.57)),add(bladeBase,scale(guardAxis,.57)),.11,.11,gold,.28,7);
     m.sphere(bladeBase[0],bladeBase[1],bladeBase[2],.18,gold,4,8,.19);
     bladeSteel(m,bladeBase,bladeTip,polish,magic);
     // Every trail sample is derived from the actual transformed weapon, never a painted static circle.
     p.swordBase=m.pt(add(bladeBase,scale(direction,.52)));
     p.swordTip=m.pt(bladeTip);
   }
 }
 // Cloth physics-like follow-through: sway, inertia and twist propagate to the hem.
 const flutter=Math.sin(clock*4.7+phase*.6)*(.08+.15*activity)+(airborne?.26:0)+(game.flying?.34:0);
 for(let strip=0;strip<11;strip++){
   let x0=-.69+strip*1.38/11,x1=-.69+(strip+1)*1.38/11;
   for(let j=0;j<7;j++){
     const a=j/7,b=(j+1)/7;
     const fx=(x,t)=>x*(1+.34*t)+p.lean*t*.55+Math.sin(pose.progress*TAU)*pose.twist*.22*t;
     const fy=t=>chest+.48-t*2.43;
     const fz=(x,t)=>-.46-t*(.18+.55*activity)-.10*Math.cos(x*15)*(.35+t)-.18*Math.sin(clock*3.1+t*4+x*2)*t-.34*flutter*t-pose.lunge*t*.39;
     m.quad([fx(x0,a),fy(a),fz(x0,a)],[fx(x1,a),fy(a),fz(x1,a)],
            [fx(x1,b),fy(b),fz(x1,b)],[fx(x0,b),fy(b),fz(x0,b)],tint(royal,(strip===0||strip===10)?.67:.83+.12*Math.cos(strip*1.9)+j*.018));
     if(strip===0||strip===10){const x=strip===0?x0:x1,dx=strip===0?.045:-.045;const p0=[fx(x,a),fy(a),fz(x,a)-.014],p1=[fx(x+dx,a),fy(a),fz(x+dx,a)-.014],p2=[fx(x+dx,b),fy(b),fz(x+dx,b)-.014],p3=[fx(x,b),fy(b),fz(x,b)-.014];m.quad(p0,p1,p2,p3,tint(gold,.78));}
   }
 }
 m.pt=oldPt;
 // Sword history is updated AFTER calculating actual world-space joint positions.
 if(p.swordTip&&p.swordBase&&attack&&pose.active>.012&&clock-p.lastSwordStamp>.012){
   const last=p.swordTrail[p.swordTrail.length-1];
   // Sub-frame interpolated samples keep the arc continuous even on slower laptops.
   if(last&&last.combo===p.combo){
     const delta=clock-p.lastSwordStamp,n=clamp(Math.ceil(delta/.014),1,5);
     for(let i=1;i<n;i++){
       const u=i/n;
       p.swordTrail.push({tip:last.tip.map((v,j)=>mix(v,p.swordTip[j],u)),base:last.base.map((v,j)=>mix(v,p.swordBase[j],u)),life:.23,max:.23,combo:p.combo});
     }
   }
   p.swordTrail.push({tip:[...p.swordTip],base:[...p.swordBase],life:.23,max:.23,combo:p.combo});
   if(p.swordTrail.length>28)p.swordTrail.shift();p.lastSwordStamp=clock;
 }
}
function enemyModel(m,e){
 const type=e.type,c=regions[e.zone],boss=e.boss,size=boss?1.75:1;
 if(boss&&window.LandlordBossModels){LandlordBossModels.draw(m,e,c,{limb,tint,clamp,clock,quality,distance:distance(player,e)});return;}
 if(type==='skeleton'&&window.LandlordEnemyModels){LandlordEnemyModels.skeleton(m,e,c,{limb,tint,clamp,clock,quality,distance:distance(player,e)});return;}
 const locomotion=e.stagger>0?.0:.32*Math.sin(e.animation),wind=e.windup>0?1-e.windup/(boss?.96:.57):0;
 if(type==='spider'&&!boss){
   let rear=Math.sin(clock*4+e.phase)*.14;
   m.sphere(0,1.1+rear,0,.84,[.15,.1,.18],4,9);m.sphere(0,1.26,.72,.57,c.flora,4,8);
   for(let s of [-1,1])for(let i=0;i<4;i++){
      const z=-.68+i*.48,step=Math.sin(e.animation+i*1.9+s)*.18;
      limb(m,[s*.6,1,z],[s*1.7,1.15+step,z+.18],.14,.11,c.flora);
      limb(m,[s*1.7,1.15+step,z+.18],[s*1.93,.16+Math.abs(step),z+.65],.11,.07,tint(c.flora,.77));
   }
   m.sphere(-.2,1.5,.98,.13,c.accent,3,6,1);m.sphere(.2,1.5,.98,.13,c.accent,3,6,1);return;
 }
 const base=boss?[.19,.15,.25]:(type==='goblin'?[.18,.35,.21]:type==='skeleton'?[.67,.64,.6]:c.stone);
 const h=boss?5.8:type==='specter'?3.8:2.75,hover=type==='specter'?Math.sin(clock*2+e.phase)*.2:0;
 const y=hover+(e.hit>0?.05*Math.sin(clock*45):0);const recoil=Math.sin(Math.PI*clamp((e.hitRecoil||0)/.53,0,1))*.40;
 const lod=distance(player,e)<22&&quality!=='low',r=lod?7:4,sides=lod?12:7;
 m.ellipsoid(0,h*.37+y,-recoil*.2,.43*size,.60*size,.32*size,tint(base,.72),0,r,sides);
 m.ellipsoid(0,h*.69+y,-recoil*.35,.64*size,.65*size,.43*size,e.hitRecoil>0?tint(base,1.38):base,0,r,sides);
 m.ellipsoid(0,h*.92+y,.11-recoil*.44,.40*size,.48*size,.37*size,tint(base,1.09),0,r,sides);
 if(type==='skeleton'){for(let j=0;j<4;j++)m.box(0,h*.49+j*.15,.37,.68-.065*j,.055,.08,tint(base,1.26));m.box(0,h*.82+y,.43,.35,.14,.08,[.13,.12,.14]);}
 if(type==='goblin'){for(const side of [-1,1])m.tri([side*.29,h*.91+y,.08],[side*.76,h*1.04+y,-.04],[side*.27,h*1.02+y,.13],tint(base,.9));}
 if(type==='knight'||type==='sentinel'){for(const side of [-1,1])m.ellipsoid(side*.70,h*.77+y,0,.31,.22,.34,tint(base,1.24),0,r,sides);m.box(0,h*.93+y,.45,.63,.11,.09,[.03,.04,.07]);}
 for(let s of [-1,1]){
    let step=Math.sin(e.animation+(s>0?0:Math.PI))*.3;
    limb(m,[s*.48*size,h*.32+y,0],[s*.48*size,h*.16+y,step],.2*size,.14*size,tint(base,.68));
    m.box(s*.48*size,.16+y,step,.38*size,.32,.58*size,tint(base,.48));
    const shoulder=[s*.81*size,h*.74+y,0],elbow=[s*1.1*size,h*.57+y,.15+wind*.35],hand=[s*.85*size,h*.36+y,.26+wind*.55];
    limb(m,shoulder,elbow,.19*size,.14*size,base);
    limb(m,elbow,hand,.17*size,.12*size,tint(base,.83));
 }
 m.sphere(-.19*size,h*.94+y,.48*size,.12*size,c.accent,3,6,1);
 m.sphere(.19*size,h*.94+y,.48*size,.12*size,c.accent,3,6,1);
 m.spike(0,h*.99+y,0,.4*size,.63*size,c.accent,.45);
 if(boss){
   for(let s of [-1,1])m.spike(s*.6*size,h*.89+y,0,.42*size,1.3*size,c.accent,.6);
   let reach=1.0+wind*.9;
   limb(m,[1.55*size,h*.52+y,.55*size],[1.55*size+wind*1.5,h*.5+y,2.55*size*reach],.22*size,.04*size,c.accent,.7);
   m.ring(0,.16,0,3.9,.17,c.accent,.52);
 }else if(type==='warlock'||type==='specter'){
   m.spike(0,h*.95+y,0,.6,1.5,c.accent,.6);
 }
}

// One hidden collectible reliquary per biome: explore side paths to level up.
function relicPos(idx){let z=idx*LEN+LEN*.38+(idx%3)*4;return [roadCenter(z)+(idx%2?-1:1)*23,z]}
function relicModel(m,idx){
 const p=relicPos(idx),xx=p[0],zz=p[1],yy=height(xx,zz),c=regions[idx],found=game.relics[idx];
 if(found)return;
 const lift=Math.sin(clock*1.7+idx)*.14;
 m.box(xx,yy+.45,zz,2.1,.9,1.2,tint(c.stone,.62));
 m.box(xx,yy+1.05,zz,2.05,.3,1.3,tint(c.accent,.72),.20);
 m.box(xx,yy+1.15,zz,1.25,.2,1.35,tint(c.stone,.9));
 m.spike(xx,yy+1.35+lift,zz,.42,1.2,c.accent,1.05);
 m.ring(xx,yy+.14,zz,2.55,.12,c.accent,.6);
}

// Procedural cursed wildlife with animated quadruped limbs, glowing eyes and flying bats.
function wildlifeModel(mesh,b){
 const m=mesh,phase=clock*(b.kind==='bat'?11:7)+b.phase;
 if(b.kind==='bat'){
  const dark=[.085,.075,.13],wing=[.16,.12,.23];
  m.ellipsoid(0,.1,0,.42,.36,.38,dark,.05,5,7);
  m.sphere(0,.16,.26,.25,dark,4,7);
  for(const side of [-1,1]){
    let flap=Math.sin(phase)*.9;
    m.quad([side*.22,.2,0],[side*1.25,.46+flap,.2],[side*2.6,.16+flap*1.6,-.1],[side*.60,-.18,-.52],wing,.14);
    m.cone(side*.16,.37,.26,.13,.42,dark,4,0,.0);
  }
  for(const x of [-.12,.12])m.sphere(x,.19,.46,.065,[1,.13,.29],3,5,2);
  return;
 }
 const crawler=b.kind==='crawler',stag=b.kind==='stag',f=crawler?1.25:stag?1.45:1,hide=b.hit>0?.25:0;
 const col=stag?[.17,.30,.35]:crawler?[.22,.17,.27]:[.22,.19,.23],bone=[.48,.40,.40],eye=stag?[.35,.91,1]:[1,.18,.28];
 const sway=Math.sin(phase)*.08;
 m.ellipsoid(0,.98*f+sway,.00,1.25*f,.62*f,.55*f,col,.03,6,10);
 for(let i=0;i<5;i++)m.spike(0,1.40*f,(-.81+i*.33)*f,.14*f,.40*f,crawler?[.59,.45,.55]:[.32,.30,.40],.08);
 
 m.ellipsoid(0,1.24*f,.83*f,.55*f,.49*f,.49*f,crawler?bone:col,.05,5,8);
 m.ellipsoid(0,1.08*f,1.27*f,.39*f,.27*f,.54*f,crawler?bone:[.36,.30,.35],.02,5,7);
 for(let q of [-1,1]){
   m.cone(q*.27*f,.94*f,1.45*f,.065*f,.28*f,[.89,.84,.77],4,0,.10);
   m.cone(q*.33*f,1.42*f,.91*f,.18*f,.50*f,col,5,0,.01);
 }
 
 for(const side of [-1,1]){
  const step=Math.sin(phase+ (side<0?0:Math.PI))*.34;
  for(const z of [-.8,.65]){
    const zp=z+step;
    limb(m,[side*.63*f,.92*f,z*f],[side*.74*f,.45*f,(z+step)*f],.22*f,.16*f,col,0,5);
    limb(m,[side*.74*f,.45*f,(z+step)*f],[side*.79*f,.12,(z+step*.8+.06)*f],.15*f,.10*f,bone,.02,5);
  }
  m.cone(side*.34*f,1.55*f,1.01*f,.21*f,.62*f,col,5,0);
  m.sphere(side*.25*f,1.37*f,1.24*f,.13*f,eye,4,6,2.3+hide);
  if(crawler){limb(m,[side*.68*f,1.05*f,.05],[side*1.35*f,.75*f,.57],.13*f,.045*f,bone,.05,5);}
  if(stag){limb(m,[side*.29*f,1.7*f,1.04*f],[side*.98*f,3.10*f,1.22*f],.13*f,.03*f,[.44,.9,.85],.35,5);
    limb(m,[side*.98*f,3.10*f,1.22*f],[side*1.42*f,3.4*f,1.39*f],.07*f,.018*f,[.50,1,.94],.55,5);
  }
 }
 limb(m,[0,1.02*f,-.84*f],[-Math.sin(phase*.25)*.45,1.38*f,-1.9*f],.22*f,.02*f,col,.05,5);
 m.ring(0,.05,0,1.27*f,.10,[.08,.045,.1],0);
}
function buildDynamic(){let mesh=new Mesh();const near=enemies.filter(e=>!e.dead&&Math.abs(e.z-player.z)<65&&Math.abs(e.x-player.x)<65);
 if(viewMode!=='fpp'){let pm=new Mesh(player.x,player.y,player.z,player.angle);playerModel(pm);appendVertices(mesh.d,pm.d);}
 // Contact shadow stays on the actual terrain during jumps.
 let shadow=new Mesh();shadow.ring(player.x,height(player.x,player.z)+.025,player.z,1.03+Math.abs(player.y-height(player.x,player.z))*.10,.24,[.045,.055,.075],0);appendVertices(mesh.d,shadow.d);
 // Sword ribbon: geometry follows the REAL sword tip from the articulated arm.
 if(player.swordTrail.length>1){
   let fx=new Mesh();const trail=player.swordTrail;
   for(let i=1;i<trail.length;i++){
      let a=trail[i-1],b=trail[i],alpha=Math.min(a.life,b.life)/.23;
      const blend=clamp(alpha*(.30+.7*i/trail.length),0,1);
      const blade=(k)=>add(k.base,scale(sub(k.tip,k.base),.84));
      const nearTip=(k)=>add(k.base,scale(sub(k.tip,k.base),.34));
      const clr=tint(COMBOS[b.combo].color,.16+.48*blend);
      fx.quad(nearTip(a),blade(a),blade(b),nearTip(b),clr,.23+.85*blend);
      fx.quad(blade(a),a.tip,b.tip,blade(b),tint(COMBOS[b.combo].color,.23+.79*blend),.48+1.6*blend);
      if(i%4===0){
         limb(fx,b.base,b.tip,.042+blend*.045,.009,COMBOS[b.combo].color,.38+blend*1.2,5);
      }
   }
   appendVertices(mesh.d,fx.d);
 }

 for(const b of wildlife){
  if(b.dead||Math.abs(b.z-player.z)>68||Math.abs(b.x-player.x)>68||(b.kind==='bat'&&!ldx.batsOut()))continue;
  const model=new Mesh(b.x,b.y,b.z,b.angle);
  wildlifeModel(model,b);appendVertices(mesh.d,model.d);
 }
 for(let e of near){
  let em=new Mesh(e.x,e.y+(e.type==='specter'?.6+Math.sin(clock*2+e.phase)*.24:0),e.z,e.angle);enemyModel(em,e);appendVertices(mesh.d,em.d);
  let aura=new Mesh();
  aura.ring(e.x,e.y+.05,e.z,e.boss?2.7:1,.18,[.045,.05,.065],0);
  if(e.hit>0)aura.ring(e.x,e.y+.2,e.z,e.boss?4.1:1.6,.13,[1,.18,.14],.7);
  if(e.windup>0){let k=e.boss?4.8:3.05,ratio=1-e.windup/(e.boss?.96:.57);
    aura.ring(e.x,e.y+.1,e.z,k,.065+ratio*.19,[1,.12,.09],.8+ratio*.9);
  }appendVertices(mesh.d,aura.d);
 }
 // Crates from V3: wood frame, metal straps, glowing relic core, no static dead geometry.
 for(const b of breakables){
   if(b.dead||Math.abs(b.x-player.x)>59||Math.abs(b.z-player.z)>65)continue;
   const m=new Mesh(),base=b.y,col=b.kind==='relic'?[.23,.39,.47]:[.40,.22,.11];
   m.box(b.x,base+1.15,b.z,2.25,2.25,2.25,col);
   m.box(b.x,base+1.15,b.z,2.43,.23,2.43,[.58,.48,.32]);
   m.box(b.x,base+1.15,b.z,2.43,.24,2.43,[.58,.48,.32]);
   for(const side of [-1,1]){m.box(b.x+side*.95,base+1.1,b.z,.18,2.15,2.36,[.58,.46,.30]);m.box(b.x,base+1.1,b.z+side*.95,2.36,2.15,.18,[.59,.46,.30]);}
   if(b.kind==='relic'){m.spike(b.x,base+1.35,b.z,.47,1.1,[.28,.87,1],1.65);m.ring(b.x,base+2.4,b.z,1.0,.09,[.3,.92,1],1.2);}
   appendVertices(mesh.d,m.d);
 }
 for(const d of debris){if(Math.abs(d.z-player.z)>65)continue;const m=new Mesh();m.box(d.x,d.y,d.z,.2,.24,.18,d.col,.26,d.rot);appendVertices(mesh.d,m.d)}
 const z=game.zone,reg=regions[z];
 for(let j=Math.max(0,z-1);j<=Math.min(6,z+1);j++){
 let point=shrinePoint(j),zz=point.z,xx=point.x,yy=height(xx,zz);
 if(Math.abs(zz-player.z)<65){let crystal=new Mesh();crystal.spike(xx,yy+3.4+Math.sin(clock*1.9+j)*.35,zz,1.05,4.6,game.seals[j]?[.24,.2,.27]:regions[j].accent,game.seals[j]?.17:1.2);crystal.ring(xx,yy+5,zz,2.25,.09,regions[j].accent,game.seals[j]?.1:.8);appendVertices(mesh.d,crystal.d)}
 }
 // Every gateway is traversable. The last gateway glows as the actual win trigger.
 for(let j=Math.max(0,game.zone-1);j<=Math.min(6,game.zone);j++){
   const g=portalPoint(j);if(Math.abs(player.z-g.z)>75)continue;
   const mag=j===6?1.5:.55,col=j===6?[.49,1,.79]:regions[j].accent;
   let portalFX=new Mesh(),base=height(g.x,g.z);
   portalFX.ring(g.x,base+.16,g.z,4.6+(j===6?Math.sin(clock*2)*.2:0),.12,col,.55*mag);
   for(let k=0;k<7;k++){
     const phi=k*TAU/7+clock*(j===6?.55:.17),rr=3.4+Math.sin(clock*2.7+k)*.14;
     let x=g.x+Math.cos(phi)*rr,y=base+3.4+Math.sin(phi*2+clock)*1.5,z=g.z+Math.sin(phi)*1.7;
     portalFX.spike(x,y,z,.13+(j===6?.10:0),.7+(j===6?.4:0),col,.7*mag);
   }
   if(j===6){portalFX.ring(g.x,base+.14,g.z,7.5,.16,col,1.1);portalFX.spike(g.x,base+9+Math.sin(clock*1.7)*.2,g.z,1.0,3.8,col,1.4);}
   appendVertices(mesh.d,portalFX.d);
 }
 for(let j=Math.max(0,game.zone-1);j<=Math.min(6,game.zone+1);j++){let p=relicPos(j);if(Math.abs(player.z-p[1])<74){let rm=new Mesh();relicModel(rm,j);appendVertices(mesh.d,rm.d)}}
 discoveryMesh(mesh);
 if(game.flying){let skyAura=new Mesh();skyAura.ring(player.x,player.y-.45,player.z,3.6,.28,[.32,.96,.86],.9);skyAura.ring(player.x,player.y-.55,player.z,4.3,.09,[.55,.88,1],.65);skyAura.spike(player.x,player.y-1.2+Math.sin(clock*4)*.2,player.z,.7,1.6,[.45,1,1],.42);appendVertices(mesh.d,skyAura.d)}
 for(const a of attacks){
  const am=new Mesh();
  if(a.kind==='fire'){
   const flicker=.94+.16*Math.sin(a.phase*2);
   am.sphere(a.x,a.y,a.z,a.size*flicker,[1,.59,.21],5,10,2);
   am.sphere(a.x,a.y,a.z,a.size*.55,[1,.92,.52],4,8,3);
   am.spike(a.x-a.vx*.02,a.y-(a.vy||0)*.02,a.z-a.vz*.02,a.size*.28,1.5,[1,.27,.08],1.1);
   const sp=Math.hypot(a.vx,a.vy||0,a.vz)||1;
   for(let k=0;k<(quality==='low'?2:4);k++){
      const back=(k+.75)*(.31+Math.sin(a.phase+k)*.05);
      const t=k*TAU/4+a.phase*.28,rad=.11+k*.065;
      const px=a.x-a.vx/sp*back+Math.sin(t)*rad,py=a.y-(a.vy||0)/sp*back+Math.cos(t)*rad,pz=a.z-a.vz/sp*back+Math.cos(t*1.4)*rad;
      am.sphere(px,py,pz,a.size*(.46-k*.08),k%2?[1,.27,.08]:[1,.85,.31],3,6,.9);
   }
  }else am.sphere(a.x,a.y,a.z,a.size,[.94,.26,.65],4,8,1.2);
  appendVertices(mesh.d,am.d);
 }
 if(player.fireCast>0){
  const u=player.fireCast/.39,ang=player.fireAimYaw??orbit,pitch=orbitPitch,fx=player.x+Math.sin(ang)*1.05,fy=player.y+1.65+(1-u)*.32,fz=player.z+Math.cos(ang)*1.05;
  const pm=new Mesh();pm.sphere(fx,fy,fz,.25+u*.3,[1,.56,.19],5,9,1.7);pm.ring(fx,fy,fz,.52+(1-u)*.8,.06,[1,.77,.29],1.2);pm.spike(fx,fy-.15,fz,.25,.35,[1,.92,.48],2.2);appendVertices(mesh.d,pm.d);
 }
 for(let p of pickups){if(Math.abs(p.z-player.z)>55)continue;let pm=new Mesh();pm.spike(p.x,p.y+.15+Math.sin(clock*3+p.phase)*.3,p.z,.19,.57,[.99,.78,.39],1.4);appendVertices(mesh.d,pm.d)}
 let maxPart=quality==='low'?22:quality==='balanced'?55:100;for(let p of (particleBatch?[]:particles.slice(-maxPart))){if(Math.abs(p.z-player.z)>62)continue;let pm=new Mesh();pm.box(p.x,p.y,p.z,p.size,p.size,p.size,p.col,1.6);appendVertices(mesh.d,pm.d)}
 // Procedural drifting embers and floating fireflies.
 let n=quality==='low'?8:quality==='balanced'?20:45;for(let j=0;j<n;j++){let phase=hash(j*23)*TAU,x=player.x+Math.sin(j*11.5+clock*.11)*38,z=player.z+Math.cos(j*19.25-clock*.13)*31,y=1.5+hash(j*79)*13+Math.sin(clock*.8+phase)*1.5;
 let pm=new Mesh();pm.box(x,y,z,.06,.09,.06,reg.accent,.9);appendVertices(mesh.d,pm.d)}
 return mesh.get();
}
function computeCamera(dt){
 let horizontal=orbit,dist=10.8+(player.attackTime>0?-.45*Math.sin(Math.PI*clamp(player.attackClock/player.attackDuration,0,1)):0),pitch=orbitPitch;
 if(game.state==='playing'){
   dist+=clamp(Math.hypot(player.vx,player.vz)-9,0,10)*.13;
   if(player.dashTime>0)dist+=game.flying?1.4:.75;
 }
 // Portrait phone framing pulls back to keep the full hero and nearby enemies visible.
 const aspect=canvas.width/Math.max(1,canvas.height),portraitZoom=clamp(.94/aspect,1,1.55);
 dist*=portraitZoom;
 if(game.state==='title'){horizontal=Math.sin(clock*.13)*.22;dist=15*portraitZoom;pitch=.28}
 // Camera spring is on the focal anchor, not on input. W/S stay consistent even during turns.
 const catchUp=1-Math.exp(-dt*(player.dashTime>0?34:18));
 if(!cameraReady){cameraAnchor=[player.x,player.y,player.z];cameraReady=true;}
 cameraAnchor[0]=mix(cameraAnchor[0],player.x,catchUp);
 cameraAnchor[1]=mix(cameraAnchor[1],player.y,catchUp);
 cameraAnchor[2]=mix(cameraAnchor[2],player.z,catchUp);
 const x=cameraAnchor[0],z=cameraAnchor[2],y=cameraAnchor[1];
 const lookAhead=5.4-(portraitZoom-1)*1.05;
 let target=[x+Math.sin(horizontal)*lookAhead,y+1.85-lookAhead*Math.tan(pitch),z+Math.cos(horizontal)*lookAhead];
 let eye=[x-Math.sin(horizontal)*dist*Math.cos(pitch),y+2.05+dist*Math.sin(pitch),z-Math.cos(horizontal)*dist*Math.cos(pitch)];
 if(viewMode==='fpp'&&game.state==='playing'){eye=[x,y+2.55,z];target=[x+Math.sin(horizontal)*16*Math.cos(pitch),y+2.55-16*Math.sin(pitch),z+Math.cos(horizontal)*16*Math.cos(pitch)];}
 // Sweep a small camera volume from the hero to the desired camera position.
 if(viewMode!=='fpp'||game.state!=='playing'){
  const anchor=[x,y+2.05,z],delta=eye.map((v,i)=>v-anchor[i]);
  const len=Math.hypot(...delta),steps=Math.max(1,Math.ceil(len/.25));let clear=0;
  for(let i=1;i<=steps;i++){
   const t=i/steps,px=anchor[0]+delta[0]*t,py=anchor[1]+delta[1]*t,pz=anchor[2]+delta[2]*t;
   if(blocking(px,pz,.32,py-.32,.64)||py<height(px,pz)+.35)break;
   clear=t;
  }
  if(clear<1){const safe=Math.max(0,clear-.2/Math.max(len,.2));eye=anchor.map((v,i)=>v+delta[i]*safe);}
 }
 // Prevent camera clipping below elevated terrain.
 if(viewMode!=='fpp'||game.state!=='playing')eye[1]=Math.max(eye[1],height(eye[0],eye[2])+.35);
 if(shake>0){let amount=shake*.6,n=Math.hypot(...impactDirection)||1,pulse=Math.sin(clock*79)*amount*.65;eye[0]+=impactDirection[0]/n*pulse;eye[2]+=impactDirection[1]/n*pulse;eye[1]+=Math.sin(clock*97)*amount*.32;}
 if(player.cameraKick>0){eye[1]+=player.cameraKick*.41;target[1]-=player.cameraKick*.33;}
 camEye=eye;camFocus=target;
 let view=lookAt(eye,target),proj=perspective(Math.PI/(player.dashTime>0?2.85:3.1),canvas.width/canvas.height,.3,270);
 viewProj=multiply(proj,view);
 const forward=norm(sub(target,eye)),right=norm(cross(forward,[0,1,0])),up=norm(cross(right,forward));
 cameraBasis={forward,right,up,focal:canvas.height/(2*Math.tan(Math.PI/(player.dashTime>0?5.9:6.26)))};
}
let submittedTriangles=0,visibleChunks=0;
function paintWebGL(dynamicData){drawCalls=0;submittedTriangles=0;visibleChunks=0;if(shadowState&&quality!=='low'&&shadowTick++%2===0)paintShadowMap(dynamicData);let c=regions[game.zone],a=indexLocations;cinematicPipeline?.begin(canvas.width,canvas.height,quality);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(glP);if(materialLibrary)materialLibrary.bind(a,quality);else gl.uniform1f(a.materialDetail,0);
 gl.uniformMatrix4fv(a.vp,false,viewProj);gl.uniform3f(a.cam,...camEye);gl.uniform3f(a.fog,...c.fog);gl.uniform3f(a.light,-.42,.86,.34);gl.uniform1f(a.time,clock);
 const torchStep=(LEN-12)/28;
 const z0=game.zone*LEN+3+Math.max(0,Math.min(28,Math.round((player.z-game.zone*LEN-3)/torchStep)))*torchStep;
 const z1=z0+(player.z>z0?torchStep:-torchStep);
 const x0=roadCenter(z0)+8.4,x1=roadCenter(z1)-8.4;
 gl.uniform4f(a.torch0,x0,height(x0,z0)+1.8,z0,16);
 gl.uniform4f(a.torch1,x1,height(x1,z1)+1.8,z1,16);
 gl.uniform3f(a.torchColor,.99,.57,.22);
 gl.uniformMatrix4fv(a.sVP,false,shadowMatrix||new Float32Array(16));gl.uniform1f(a.shadows,shadowState&&quality!=='low'?1:0);gl.uniform1f(a.shadowTexel,shadowState?1/shadowState.sz:1/1024);
 if(shadowState){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,shadowState.tex);gl.uniform1i(a.shadow,0);}
 gl.uniform1f(a.worldSurface,1);let k=zoneOf(player.z),range=1,frustum=LandlordGeometry.planes(viewProj);
 for(let j=Math.max(0,k-range);j<=Math.min(6,k+range);j++){
 let r=ensureGpuRealm(j);if(!r)continue;bindData(r.buffer);for(const chunk of r.chunks){if(!LandlordGeometry.visible(chunk,frustum))continue;gl.drawArrays(gl.TRIANGLES,chunk.first,chunk.count);drawCalls++;visibleChunks++;submittedTriangles+=chunk.count/3;}
 }
 gl.uniform1f(a.worldSurface,0);gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,dynamicData,gl.DYNAMIC_DRAW);bindData(vbo);gl.drawArrays(gl.TRIANGLES,0,dynamicData.length/10);drawCalls++;submittedTriangles+=dynamicData.length/30;
 if(particleBatch&&cameraBasis)drawCalls+=particleBatch.draw(particles,player,quality,viewProj,cameraBasis);
 const gatePoint=portalPoint(game.zone);
 if(Math.hypot(gatePoint.x-player.x,gatePoint.z-player.z)<100)cinematicPipeline?.setPortal([gatePoint.x,height(gatePoint.x,gatePoint.z)+5,gatePoint.z],viewProj);
 drawCalls+=cinematicPipeline?.end()||0;
}
function paintCPU(dynamicData){const W=canvas.width,H=canvas.height,c=regions[game.zone],dpr=W/innerWidth;
 ctx.clearRect(0,0,W,H);
 // A solid fallback ground palette hides clipped faces on devices without WebGL.
 const backdrop=ctx.createLinearGradient(0,H*.29,0,H);
 backdrop.addColorStop(0,`rgb(${c.ground.map(v=>Math.round(v*162)).join(',')})`);
 backdrop.addColorStop(1,`rgb(${c.ground.map(v=>Math.round(v*120)).join(',')})`);
 ctx.fillStyle=backdrop;ctx.fillRect(0,H*.34,W,H*.66);
 // Software perspective mesh renderer: full 3D geometry with 3D camera and real lighting.
 const b=cameraBasis;if(!b)return;
 const proj=(xx,yy,zz)=>{let rx=xx-camEye[0],ry=yy-camEye[1],rz=zz-camEye[2],depth=rx*b.forward[0]+ry*b.forward[1]+rz*b.forward[2];if(depth<.5)return null;let k=b.focal/depth;return [W/2+(rx*b.right[0]+ry*b.right[1]+rz*b.right[2])*k,H/2-(rx*b.up[0]+ry*b.up[1]+rz*b.up[2])*k,depth]};
 let faces=[],maxFaces=quality==='low'?2400:quality==='balanced'?4500:7500;
 const submit=(data,step=1,start=0,end=data.length/30)=>{let count=Math.min(data.length/30,end);for(let j=start;j<count;j+=step){let i=j*30,p=proj(data[i],data[i+1],data[i+2]),q=proj(data[i+10],data[i+11],data[i+12]),r=proj(data[i+20],data[i+21],data[i+22]);if(!p||!q||!r)continue;
 let minx=Math.min(p[0],q[0],r[0]),maxx=Math.max(p[0],q[0],r[0]),miny=Math.min(p[1],q[1],r[1]),maxy=Math.max(p[1],q[1],r[1]);if(maxx<0||minx>W||maxy<0||miny>H)continue;
 let normal=[data[i+3],data[i+4],data[i+5]],color=[data[i+6],data[i+7],data[i+8]],em=data[i+9]%16;let f=.41+.66*Math.max(0,dot(normal,[-.42,.86,.34])),fog=clamp(((p[2]+q[2]+r[2])/3-26)/133,0,.93),col=color.map((v,k)=>clamp(mix(v*f+v*em*1.6,c.fog[k],fog),0,1));let rgb=col.map(v=>Math.round(Math.pow(v,.82)*255));
 faces.push({p,q,r,z:(p[2]+q[2]+r[2])/3,col:`rgb(${rgb.join(',')})`});}
 };
 const k=zoneOf(player.z);for(let j=Math.max(0,k-1);j<=Math.min(6,k+1);j++){
  if(j!==k&&Math.abs(player.z-(j+.5)*LEN)>LEN*.6)continue;
  // Never skip a ground triangle: sampling whole meshes creates visible holes.
  submit(cpuMeshes[j],1,0,1740);
  submit(cpuMeshes[j],quality==='low'?17:quality==='balanced'?13:9,1740);
 }
 submit(dynamicData,quality==='low'?2:1);
 faces.sort((a,b)=>b.z-a.z);
 ctx.lineWidth=.4;for(let f of faces){ctx.fillStyle=f.col;ctx.beginPath();ctx.moveTo(f.p[0],f.p[1]);ctx.lineTo(f.q[0],f.q[1]);ctx.lineTo(f.r[0],f.r[1]);ctx.closePath();ctx.fill()}
}
// World-space GPU-independent bloom, animated lanterns, fireflies and distant haze.
const atmosphere=$('atmosphere');const atmosphereCtx=atmosphere.getContext('2d',{alpha:true});
let atmosphereScale=1;
function resizeAtmosphere(){const r=Math.min(devicePixelRatio||1,1.5);atmosphereScale=r;
 const w=Math.max(2,Math.round(innerWidth*r)),h=Math.max(2,Math.round(innerHeight*r));
 if(atmosphere.width!==w||atmosphere.height!==h){atmosphere.width=w;atmosphere.height=h}
}
function projectAtmos(x,y,z){
 const b=cameraBasis;if(!b)return null;
 const X=x-camEye[0],Y=y-camEye[1],Z=z-camEye[2];
 const depth=X*b.forward[0]+Y*b.forward[1]+Z*b.forward[2];
 if(depth<1.3||depth>170)return null;
 const focal=innerHeight/(2*Math.tan(Math.PI/(player.dashTime>0?5.7:6.2)));
 return {x:innerWidth/2+(X*b.right[0]+Y*b.right[1]+Z*b.right[2])*focal/depth,
 y:innerHeight/2-(X*b.up[0]+Y*b.up[1]+Z*b.up[2])*focal/depth,depth};
}
function glowAt(f,x,y,z,r,color,weight=1){
 const p=projectAtmos(x,y,z);if(!p||p.x< -100||p.x>innerWidth+100||p.y< -100||p.y>innerHeight+100)return;
 const s=Math.min(145,r*innerHeight/p.depth*0.49);
 if(s<1)return;const g=f.createRadialGradient(p.x,p.y,0,p.x,p.y,s);
 g.addColorStop(0,`rgba(${color},${Math.min(.72,.28*weight)})`);
 g.addColorStop(.14,`rgba(${color},${Math.min(.38,.16*weight)})`);
 g.addColorStop(.48,`rgba(${color},${Math.min(.09,.038*weight)})`);g.addColorStop(1,`rgba(${color},0)`);
 f.fillStyle=g;f.beginPath();f.arc(p.x,p.y,s,0,TAU);f.fill();
}
function drawAtmosphere(){
 if(!atmosphereCtx)return;resizeAtmosphere();const f=atmosphereCtx;
 f.setTransform(atmosphereScale,0,0,atmosphereScale,0,0);f.clearRect(0,0,innerWidth,innerHeight);ldx.draw(f);
 drawCombatReadability(f);
 if(quality==='low')return;
 f.save();f.globalCompositeOperation='screen';
 const c=regions[game.zone],base=game.zone*LEN,flame=game.zone===0?'255,128,57':game.zone===1?'135,239,161':game.zone===5?'75,212,255':'234,156,235';
 // Flames on each side of the ancient road.
 for(let j=0;j<29;j++)for(const side of [-1,1]){
   let z=base+j*(LEN-12)/28+3;if(Math.abs(z-player.z)>63)continue;
   let x=roadCenter(z)+side*(8.4+hash(j*3+game.zone)*.9);
   glowAt(f,x,height(x,z)+1.25,z,1.85,flame,.45+.12*Math.sin(clock*5+j));
 }
 for(let j=Math.max(0,game.zone-1);j<=Math.min(6,game.zone+1);j++){
  let z=shrinePoint(j).z;
  if(Math.abs(z-player.z)<105){glowAt(f,shrinePoint(j).x,height(shrinePoint(j).x,z)+5.8,z,12,flame,game.seals[j]?.35:1.5);
   const p=relicPos(j);if(!game.relics[j]&&Math.abs(p[1]-player.z)<83)glowAt(f,p[0],height(p[0],p[1])+1.6,p[1],4.8,flame,.78);
  }
 }
 for(let e of enemies){if(e.dead||e.zone!==game.zone)continue;
   if(Math.abs(e.z-player.z)>44)continue;
   glowAt(f,e.x,e.y+(e.boss?5.1:2.7),e.z,e.boss?7:2.5,flame,e.boss?.72:.23);
 }
 glowAt(f,player.x+Math.sin(player.angle)*.65,player.y+2.65,player.z+Math.cos(player.angle)*.65,4.4,'112,199,255',.58+(player.attackTime>0?1.25:0));
 // Motion-blurred sword trail: translucent blue/purple/amber arc through actual blade positions.
 if(player.swordTrail.length>1){
    const samples=player.swordTrail,colors=['133,225,255','202,165,255','255,190,107'];
    f.save();f.lineJoin='round';f.lineCap='round';f.globalCompositeOperation='screen';
    for(let i=1;i<samples.length;i++){
      const a=samples[i-1],b=samples[i];
      let p1=projectAtmos(...a.tip),p2=projectAtmos(...b.tip);
      let v1=projectAtmos(...a.base),v2=projectAtmos(...b.base);
      if(!p1||!p2)continue;
      const freshness=Math.min(a.life,b.life)/.23,weight=freshness*(i/samples.length);
      const w=clamp(5.8*innerHeight/Math.max(13,p2.depth),1.4,24);
      const color=colors[b.combo];
      if(v1&&v2){
        f.fillStyle=`rgba(${color},${(weight*.13).toFixed(3)})`;
        f.beginPath();f.moveTo(v1.x,v1.y);f.lineTo(p1.x,p1.y);f.lineTo(p2.x,p2.y);f.lineTo(v2.x,v2.y);f.closePath();f.fill();
      }
      f.strokeStyle=`rgba(${color},${(weight*.14).toFixed(3)})`;f.lineWidth=w*5.2;f.beginPath();f.moveTo(p1.x,p1.y);f.lineTo(p2.x,p2.y);f.stroke();
      f.strokeStyle=`rgba(${color},${(weight*.57).toFixed(3)})`;f.lineWidth=w*1.75;f.beginPath();f.moveTo(p1.x,p1.y);f.lineTo(p2.x,p2.y);f.stroke();
      f.strokeStyle=`rgba(245,252,255,${(weight*.92).toFixed(3)})`;f.lineWidth=w*.40;f.beginPath();f.moveTo(p1.x,p1.y);f.lineTo(p2.x,p2.y);f.stroke();
    }
    f.restore();
 }
 for(const h of hitFlashes){
   const k=projectAtmos(h.x,h.y,h.z);if(!k)continue;
   const opacity=h.life/h.max,r=(1-opacity)*80+12,col=h.combo===2?'255,188,108':'167,229,255';
   const outer=f.createRadialGradient(k.x,k.y,1,k.x,k.y,r);
   outer.addColorStop(0,`rgba(255,255,255,${opacity*.42})`);
   outer.addColorStop(.24,`rgba(${col},${opacity*.26})`);outer.addColorStop(1,`rgba(${col},0)`);
   f.fillStyle=outer;f.beginPath();f.arc(k.x,k.y,r,0,TAU);f.fill();
   f.strokeStyle=`rgba(${col},${opacity*.49})`;f.lineWidth=1.3+opacity*2;
   f.beginPath();f.ellipse(k.x,k.y,r*.82,r*.46,-.22,0,TAU);f.stroke();
 }
 for(let a of attacks)glowAt(f,a.x,a.y,a.z,5.5,'255,133,63',1.8);
 for(let q of cacheSpots)if(q.zone===game.zone&&!chestTaken[q.id]&&Math.abs(q.z-player.z)<66){
  glowAt(f,q.x,height(q.x,q.z)+1.4,q.z,3.7,'248,192,111',.72);
 }
 for(let q of healingWells)if(q.zone===game.zone&&Math.abs(q.z-player.z)<66){
  glowAt(f,q.x,height(q.x,q.z)+2.5,q.z,6.2,'82,245,186',.83);
 }
 // drifting ash / luminous suspended dust, never occluding control surface
 for(let j=0;j<(quality==='cinematic'?112:quality==='high'?75:quality==='balanced'?38:20);j++){
   let z=player.z+Math.sin(j*32.4+clock*.09)*44,x=player.x+Math.sin(j*10.7+clock*.1)*33;
   let y=.8+hash(j*67)*10+Math.sin(clock*.69+j)*1.25,p=projectAtmos(x,y,z);
   if(!p||p.x<0||p.x>innerWidth||p.y<0||p.y>innerHeight)continue;
   let alpha=(.17+.38*hash(j*91))*clamp((95-p.depth)/75,0,1);
   let rad=clamp(innerHeight*1.2/p.depth*.045,.3,2.6);
   f.fillStyle=`rgba(${flame},${alpha})`;f.beginPath();f.arc(p.x,p.y,rad,0,TAU);f.fill();
 }
 // Weather is biome-specific: ash, luminous spores, snow shards or cursed rain.
 const weather=game.zone===0?'ash':game.zone===1?'spores':game.zone===2?'dust':game.zone===3?'rain':game.zone===4?'embers':game.zone===5?'snow':'void';
 const count=quality==='cinematic'?88:quality==='high'?52:26;
 f.save();f.globalCompositeOperation='screen';f.lineCap='round';
 for(let i=0;i<count;i++){
  const seed=hash(i*91+game.zone*51),speed=weather==='rain'?310:weather==='snow'?60:weather==='spores'?32:92;
  const x=((hash(i*31+17)*innerWidth+clock*speed*(weather==='rain'?.38:.11))%(innerWidth+80))-40;
  const y=((hash(i*41+9)*innerHeight+clock*speed*(.45+seed*.6))%(innerHeight+80))-40;
  let alpha=weather==='rain'?.14:weather==='void'?.22:.18;
  f.strokeStyle=weather==='snow'?`rgba(185,245,255,${alpha})`:weather==='spores'?`rgba(151,255,169,${alpha})`:weather==='embers'?`rgba(255,172,79,${alpha})`:weather==='rain'?`rgba(183,198,241,${alpha})`:`rgba(204,178,237,${alpha})`;
  f.lineWidth=weather==='rain'?1:1.7;f.beginPath();f.moveTo(x,y);
  f.lineTo(x+(weather==='rain'?-9:2),y+(weather==='rain'?19:weather==='snow'?4:1));f.stroke();
 }
 f.restore();
 f.restore();
}

// ===== LANDLORD+ : siklus siang-malam, cuaca, AI persepsi, parry, kombo skill, event meteor, horor =====
const ldx={
 tod:.64,rain:0,fog:0,night:0,sun:1,wTarget:0,wT:45,noise:0,parryT:0,fireBuff:0,pulseBuff:0,evT:55,meteors:[],eyes:null,eyeT:12,flash:0,hudT:0,el:null,rainGain:null,
 init(){const b=$('bones');if(b&&b.parentNode){this.el=document.createElement('div');this.el.style.cssText='font:600 10px system-ui,sans-serif;letter-spacing:.2em;color:#c9b8a4;margin-top:5px;text-shadow:0 2px 8px #000';b.after(this.el)}},
 id(a,b){return language==='id'?a:b},
 sight(){return(1-.22*this.night)*(1-.38*this.rain)*(1-.3*this.fog)},
 hunt(b){return b.kind==='wolf'?1+.35*this.night:1},
 // AI musuh: penglihatan (jarak + kerucut pandang), pendengaran, ingatan singkat
 perceive(e,dd,dt){
  const R=(e.boss?34:26)*this.sight(),toP=Math.atan2(player.x-e.x,player.z-e.z);
  const seen=dd<R&&(dd<7||Math.abs(shortestTurn(e.angle||0,toP))<1.7),heard=dd<this.noise;
  if(seen||heard){e.seen=seen;e.mem=3.6;e.lkx=player.x;e.lkz=player.z;return true}
  e.seen=false;
  if((e.mem||0)>0){e.mem-=dt;if(Math.hypot(e.lkx-e.x,e.lkz-e.z)<1.8)e.mem=0;return e.mem>0}
  return false;
 },
 // Perfect Parry: tekan serang tepat sebelum pukulan musuh mendarat
 tryParry(e){
  if(this.parryT<=0)return false;this.parryT=0;
  e.windup=0;e.stagger=1.3;e.attack=Math.max(e.attack,1.5);
  const a=Math.atan2(e.x-player.x,e.z-player.z);e.knockVX=Math.sin(a)*8;e.knockVZ=Math.cos(a)*8;
  player.mp=Math.min(100,player.mp+22);player.invuln=Math.max(player.invuln,.45);
  burst(player.x+Math.sin(a)*1.2,player.y+1.3,player.z+Math.cos(a)*1.2,[1,.95,.7],22,.7);
  pulseSfx(1320,.1,'square',.05);pulseSfx(660,.18,'triangle',.04);shake=Math.max(shake,.12);
  showToast(this.id('✦ PARRY SEMPURNA','✦ PERFECT PARRY'),.7);return true;
 },
 // Kombo skill: Api + Pedang = tebasan berapi; Pulse + Dash = dash gelombang kejut
 armFire(){if(this.fireBuff<=0)showToast(this.id('✦ PEDANG BERAPI','✦ FLAMING BLADE'),.8);this.fireBuff=2.4;this.noise=Math.max(this.noise,22)},
 armPulse(){if(this.pulseBuff<=0)showToast(this.id('✦ DASH GELOMBANG SIAP','✦ SHOCK DASH READY'),.8);this.pulseBuff=2.2;this.noise=Math.max(this.noise,30)},
 flameSlash(){const a=player.angle;attacks.push({x:player.x+Math.sin(a)*1.2,y:player.y+1.4,z:player.z+Math.cos(a)*1.2,vx:Math.sin(a)*20,vz:Math.cos(a)*20,life:.45,kind:'fire',size:.95});burst(player.x+Math.sin(a)*1.6,player.y+1.4,player.z+Math.cos(a)*1.6,[1,.5,.2],14,.7)},
 shock(x,z,R,dmg){
  for(const e of enemies)if(!e.dead&&Math.hypot(e.x-x,e.z-z)<R){damageEnemy(e,dmg);e.stagger=.9;const a=Math.atan2(e.x-x,e.z-z);e.knockVX=Math.sin(a)*12;e.knockVZ=Math.cos(a)*12}
  burst(x,player.y+.6,z,[.5,.85,1],28,1);shake=Math.max(shake,.16);pulseSfx(140,.35,'sawtooth',.05);
  showToast(this.id('✦ GELOMBANG KEJUT','✦ SHOCKWAVE'),.7);this.pulseBuff=0;
 },
 // Event dunia acak: hujan meteor
 startMeteors(){
  for(let i=0;i<7;i++){const a=Math.random()*TAU,r=6+Math.random()*20;this.meteors.push({x:player.x+Math.sin(a)*r,z:player.z+Math.cos(a)*r,t:2.2+i*.9,fall:1.3,i})}
  showToast(this.id('☄ HUJAN METEOR — HINDARI LINGKARAN MERAH','☄ METEOR SHOWER — AVOID THE RED RINGS'),2.8);pulseSfx(120,.6,'sawtooth',.04);
 },
 stepMeteors(dt){
  for(let i=this.meteors.length-1;i>=0;i--){const m=this.meteors[i];m.t-=dt;if(m.t>0)continue;
   const h=height(m.x,m.z);
   burst(m.x,h+.6,m.z,[1,.55,.22],26,1.05);shake=Math.max(shake,.2);pulseSfx(70,.5,'sawtooth',.05);
   if(Math.hypot(player.x-m.x,player.z-m.z)<3.8&&player.y-h<4)takeHit(15);
   for(const e of enemies)if(!e.dead&&Math.hypot(e.x-m.x,e.z-m.z)<5)damageEnemy(e,e.boss?30:45);
   for(let k=0;k<2;k++)pickups.push({x:m.x+(Math.random()-.5)*3,z:m.z+(Math.random()-.5)*3,y:h+.5,life:24,value:3,phase:m.i+k});
   this.meteors.splice(i,1);
  }
 },
 update(dt){
  if(game.state!=='playing')return;
  this.tod=(this.tod+dt/420)%1;this.sun=Math.sin((this.tod-.25)*TAU);this.night=clamp(.2-this.sun*1.5,0,1);
  this.wT-=dt;if(this.wT<=0){this.wT=70+Math.random()*70;const r=Math.random();this.wTarget=r<.5?0:r<.8?1:2}
  const k=Math.min(1,dt*.18);this.rain+=((this.wTarget===1?1:0)-this.rain)*k;this.fog+=((this.wTarget===2?1:0)-this.fog)*k;
  this.noise=Math.max(0,this.noise-dt*34);this.parryT=Math.max(0,this.parryT-dt);
  this.fireBuff=Math.max(0,this.fireBuff-dt);this.pulseBuff=Math.max(0,this.pulseBuff-dt);this.flash=Math.max(0,this.flash-dt*2.4);
  if(this.rain>.6&&Math.random()<dt*.05){this.flash=.55;setTimeout(()=>pulseSfx(48,1,'sawtooth',.06),350+Math.random()*700)}
  this.evT-=dt;if(this.evT<=0){this.evT=80+Math.random()*70;this.startMeteors()}
  this.stepMeteors(dt);
  // Horor dinamis: mata menyala di kejauhan dan langkah tak terlihat saat malam
  this.eyeT-=dt;
  if(this.night>.55&&!this.eyes&&this.eyeT<=0){const a=player.angle+(Math.random()-.5)*2.4,r=22+Math.random()*12;this.eyes={x:player.x+Math.sin(a)*r,z:player.z+Math.cos(a)*r,t:4+Math.random()*2,s:Math.random()*9};this.eyeT=10+Math.random()*14;pulseSfx(62,.7,'sawtooth',.028)}
  if(this.eyes){this.eyes.t-=dt;if(this.eyes.t<=0||Math.hypot(player.x-this.eyes.x,player.z-this.eyes.z)<12)this.eyes=null}
  if(this.night>.55&&Math.random()<dt*.06){pulseSfx(88,.05,'square',.018);setTimeout(()=>pulseSfx(80,.05,'square',.018),260)}
  this.sound();this.hud(dt);this.extra(dt);
 },
 sound(){
  try{const ac=audioContext();if(!ac)return;
   if(!this.rainGain){const len=ac.sampleRate*2,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
    const src=ac.createBufferSource();src.buffer=buf;src.loop=true;const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=1100;
    const g=ac.createGain();g.gain.value=0;src.connect(hp);hp.connect(g);g.connect(window.LandlordAudio?.output?.()||ac.destination);src.start();this.rainGain=g}
   this.rainGain.gain.setTargetAtTime(this.rain*.045,ac.currentTime,.6)}catch(err){}
 },
 hud(dt){
  this.hudT-=dt;if(this.hudT>0||!this.el)return;this.hudT=.5;const n=this.night;
  const ph=n>.7?this.id('☾ MALAM','☾ NIGHT'):n>.25?(this.tod<.5?this.id('☾ FAJAR','☾ DAWN'):this.id('☾ SENJA','☾ DUSK')):this.id('☀ SIANG','☀ DAY');
  this.el.textContent=ph+(this.rain>.45?this.id(' · HUJAN',' · RAIN'):this.fog>.45?this.id(' · KABUT',' · FOG'):'');
 },
 draw(f){
  const W=innerWidth,H=innerHeight;f.save();
  if(this.night>.02){f.fillStyle='rgba(6,12,48,'+(.5*this.night)+')';f.fillRect(0,0,W,H)}
  const dusk=clamp(1-Math.abs(this.sun)*3.2,0,1);
  if(dusk>.02){f.fillStyle='rgba(255,120,55,'+(.12*dusk)+')';f.fillRect(0,0,W,H)}
  if(this.fog>.02||this.rain>.02){f.fillStyle='rgba(120,135,155,'+(.26*this.fog+.14*this.rain)+')';f.fillRect(0,0,W,H)}
  if(this.rain>.05){
   const n=Math.round((quality==='low'?55:quality==='balanced'?110:170)*this.rain);
   f.strokeStyle='rgba(175,205,235,'+(.32*this.rain)+')';f.lineWidth=1;f.beginPath();
   for(let i=0;i<n;i++){const x=((i*97.31+clock*70)%W+W)%W,y=((i*53.17+clock*820+i*13)%H+H)%H;f.moveTo(x,y);f.lineTo(x-5,y+17)}
   f.stroke();
  }
  if(this.flash>.01){f.fillStyle='rgba(220,230,255,'+(this.flash*.55)+')';f.fillRect(0,0,W,H)}
  for(const m of this.meteors){
   const h=height(m.x,m.z)+.25,p=projectAtmos(m.x,h,m.z),p2=projectAtmos(m.x+3.6,h,m.z);
   if(p&&p2){const r=Math.max(6,Math.hypot(p2.x-p.x,p2.y-p.y));f.strokeStyle='rgba(255,85,55,'+(.35+.35*Math.sin(clock*14))+')';f.lineWidth=2;f.beginPath();f.ellipse(p.x,p.y,r,r*.4,0,0,TAU);f.stroke()}
   if(m.t<m.fall){const u=1-m.t/m.fall;glowAt(f,m.x+8*(1-u),h+38*(1-u)+1,m.z+8*(1-u),3.4,'255,150,70',2.2)}
  }
  if(this.eyes){const e=this.eyes,h=height(e.x,e.z)+1.7;if(Math.sin(clock*1.7+e.s)<=.93){glowAt(f,e.x-.28,h,e.z,.5,'255,70,50',1.6);glowAt(f,e.x+.28,h,e.z,.5,'255,70,50',1.6)}}
  f.restore();
 }
};
ldx.init();
Object.assign(ldx,{
 hordeT:60,
 batsOut(){return this.night>.25},
 extra(dt){
  for(const e of enemies)if(e.boss&&!e.dead&&!e.p2&&e.hp<e.maxHp*.5&&Math.abs(e.z-player.z)<100){e.p2=true;e.speed*=1.25;e.projectileCD=Math.min(e.projectileCD,.8);burst(e.x,e.y+2,e.z,[1,.4,.2],40,1.4);shake=Math.max(shake,.35);pulseSfx(60,.9,'sawtooth',.06);showToast(this.id('✦ FASE 2 — PENJAGA MENGAMUK','✦ PHASE 2 — THE GUARDIAN RAGES'),1.6)}
  this.hordeT-=dt;const live=enemies.filter(e=>e.horde&&!e.dead);
  for(const e of live)if(Math.hypot(e.x-player.x,e.z-player.z)>95)e.dead=true;
  if(this.hordeT<=0&&this.night>.7&&!live.length&&!game.flying&&!enemies.some(e=>e.boss&&!e.dead&&Math.hypot(e.x-player.x,e.z-player.z)<60)){
   this.hordeT=100+Math.random()*80;
   for(let i=0;i<4;i++){const a=Math.random()*TAU,r=24+Math.random()*8,ne=makeEnemy(game.zone,i%5);ne.x=player.x+Math.sin(a)*r;ne.z=player.z+Math.cos(a)*r;ne.y=height(ne.x,ne.z);ne.homeX=ne.x;ne.homeZ=ne.z;ne.angle=a+Math.PI;ne.horde=true;ne.mem=6;ne.lkx=player.x;ne.lkz=player.z;enemies.push(ne)}
   showToast(this.id('✦ GEROMBOLAN MALAM MENYERANG','✦ NIGHT HORDE ATTACKS'),2.2);pulseSfx(75,.8,'sawtooth',.05);
  }
 },
 ending(){
  let el=$('ldxEnding');if(!el){el=document.createElement('div');el.id='ldxEnding';el.style.cssText='margin-top:10px;font:600 12px system-ui,sans-serif;letter-spacing:.3em;color:#e8c9a0;text-align:center';$('victoryText').after(el)}
  const r=game.relics.filter(Boolean).length,b=game.bosses.filter(Boolean).length;
  el.textContent=r===7&&b===7?this.id('PENAKLUK ABADI','ETERNAL CONQUEROR'):r===7?this.id('PENEMU 7 RELIK','KEEPER OF 7 RELICS'):b===7?this.id('PEMBURU 7 PENJAGA','SLAYER OF 7 GUARDIANS'):this.id('PENJELAJAH BERANI','BRAVE WANDERER');
  const cb=$('ldxContinue');if(cb)cb.textContent=this.id('LANJUT JELAJAH','KEEP EXPLORING');
 },
 init2(){
  const box=document.querySelector('#victoryOverlay .victory-buttons');
  if(box&&!$('ldxContinue')){const b=document.createElement('button');b.id='ldxContinue';b.type='button';b.addEventListener('click',()=>{$('victoryOverlay').hidden=true;game.missionEnd=false;game.postWin=true;finalVictory=false;start()});box.prepend(b)}
 }
});
ldx.init2();
// Create by LamberthRumpaidus
function drawWorld(dt){resize();computeCamera(dt);let dynamic=buildDynamic();if(gl)paintWebGL(dynamic);else paintCPU(dynamic);drawAtmosphere()}
function drawAtlas(target){
 const c=target.getContext('2d');if(!c)return;
 const W=target.width,H=target.height,scale=H/330;
 const X=x=>W*.5+(x-player.x)*scale,Z=z=>H*.55-(z-player.z)*scale;
 c.clearRect(0,0,W,H);
 c.fillStyle='#101a25';c.fillRect(0,0,W,H);
 const worldNear=player.z-215,worldFar=player.z+215;
 for(let j=Math.max(0,zoneOf(worldNear));j<=Math.min(6,zoneOf(worldFar));j++){
  const reg=regions[j],top=Z((j+1)*LEN),bottom=Z(j*LEN);
  const color=reg.ground.map(v=>Math.floor(clamp(v*220,0,255)));
  c.fillStyle=`rgb(${color.join(',')})`;c.fillRect(0,top,W,bottom-top);
  const treeColor=reg.kind==='forest'?'#48766a':'#344254';
  for(let k=0;k<130;k++){
   let z=j*LEN+hash(k*17+j*51)*LEN,x=(hash(k*41+j*36)*2-1)*59;
   let sx=X(x),sy=Z(z);if(sx<-20||sx>W+20||sy<-20||sy>H+20)continue;
   c.fillStyle=treeColor;c.beginPath();c.arc(sx,sy,(1+hash(k*13+j)*2.8)*scale,0,TAU);c.fill();
  }
  const road=(side=false)=>{c.beginPath();for(let k=0;k<=80;k++){
    const z=j*LEN+k*LEN/80,offset=side?Math.sin((k/80-.34)/.54*Math.PI)*21*(j%2?-1:1):0;
    if(side&&(k/80<.34||k/80>.88))continue;
    const sx=X(roadCenter(z)+offset),sy=Z(z);if(!side&&k===0||side&&k===28)c.moveTo(sx,sy);else c.lineTo(sx,sy);
   }};
  road(false);c.strokeStyle='#0b1723';c.lineWidth=16*scale;c.stroke();
  c.strokeStyle='#8794a5';c.lineWidth=10*scale;c.stroke();
  road(true);c.strokeStyle='#192536';c.lineWidth=11*scale;c.stroke();c.strokeStyle='#687f89';c.lineWidth=6*scale;c.stroke();
  const altar=shrinePoint(j),gate=portalPoint(j);
  if(game.visited[j]){
   c.fillStyle=game.seals[j]?'#75eec3':'#ffd17b';c.beginPath();c.arc(X(altar.x),Z(altar.z),7,0,TAU);c.fill();
   c.strokeStyle='#ffdd9c';c.lineWidth=2;c.stroke();
   c.fillStyle=game.bosses[j]?'#80d5b7':'#c46a78';c.fillRect(X(gate.x)-7,Z(gate.z)-6,14,12);
   const side=sidePortalPoint(j);c.strokeStyle='#79f3e8';c.lineWidth=3;c.beginPath();c.arc(X(side.x),Z(side.z),8,0,TAU);c.stroke();
  }
 }
 // Discoverable treasure and safe havens become visible only on cleared map cells.
 for(const q of cacheSpots){if(chestTaken[q.id])continue;
  if(!game.explored[q.zone].some(v=>Math.hypot(v[0]-q.x,v[1]-q.z)<24))continue;
  const px=X(q.x),py=Z(q.z);if(px<-12||px>W+12||py<-12||py>H+12)continue;
  c.fillStyle='#ffda8e';c.fillRect(px-5,py-5,10,10);c.strokeStyle='#4b351a';c.lineWidth=1.5;c.strokeRect(px-5,py-5,10,10);
 }
 for(const q of healingWells){if(!game.explored[q.zone].some(v=>Math.hypot(v[0]-q.x,v[1]-q.z)<24))continue;
  const px=X(q.x),py=Z(q.z);if(px<-12||px>W+12||py<-12||py>H+12)continue;
  c.strokeStyle='#80f5cc';c.lineWidth=3;c.beginPath();c.arc(px,py,7,0,TAU);c.stroke();
 }
 // Fog is rendered to its own buffer, so the underlying map cannot disappear.
 const mask=document.createElement('canvas');mask.width=W;mask.height=H;const f=mask.getContext('2d');
 f.fillStyle='#060a13f6';f.fillRect(0,0,W,H);
 f.globalCompositeOperation='destination-out';
 for(const cells of game.explored){for(const point of cells){const xx=X(point[0]),yy=Z(point[1]);
  if(xx<-160||xx>W+160||yy<-160||yy>H+160)continue;
  const grad=f.createRadialGradient(xx,yy,8,xx,yy,48*scale);grad.addColorStop(0,'#000');grad.addColorStop(.52,'#000');grad.addColorStop(1,'transparent');
  f.fillStyle=grad;f.beginPath();f.arc(xx,yy,48*scale,0,TAU);f.fill();
 }}f.globalCompositeOperation='source-over';c.drawImage(mask,0,0);
 const posX=X(player.x),posY=Z(player.z);
 c.save();c.translate(posX,posY);c.rotate(player.angle);c.fillStyle='#ffe3ad';c.shadowColor='#fff0a6';c.shadowBlur=19;
 c.beginPath();c.moveTo(0,-14);c.lineTo(-10,9);c.lineTo(0,4);c.lineTo(10,9);c.fill();c.restore();
 // The realm jump panel is available only in the discovered secret flight mode.
}
/* Local tactical minimap: trails, biome, live enemy markers and current player heading. */
function drawArenaMinimap(target){
 const c=target.getContext('2d');if(!c)return;
 const w=target.width,h=target.height,sc=w/135,reg=regions[game.zone];
 const u=(x)=>w*.5+(x-player.x)*sc,v=(z)=>h*.58-(z-player.z)*sc;
 c.clearRect(0,0,w,h);
 c.save();c.translate(w*.5,h*.58);c.rotate(-orbit);c.translate(-w*.5,-h*.58);
 const base=reg.ground.map(q=>Math.round(q*130+13));
 c.fillStyle=`rgb(${base.join(',')})`;c.fillRect(0,0,w,h);
 let aura=c.createRadialGradient(w*.55,h*.35,5,w*.5,h*.5,w*.72);
 aura.addColorStop(0,'#82929d2a');aura.addColorStop(1,'#040b18b4');c.fillStyle=aura;c.fillRect(0,0,w,h);
 // World obstacles are drawn from their actual collision coordinates, not random map markers.
 let dots=0;const seen=new Set();
 for(let z=Math.floor((player.z-62)/SOLID_CELL);z<=Math.floor((player.z+62)/SOLID_CELL);z++){
  for(let x=Math.floor((player.x-62)/SOLID_CELL);x<=Math.floor((player.x+62)/SOLID_CELL);x++){
   const bucket=solidCells.get(`${x},${z}`);if(!bucket)continue;
   for(const obstacle of bucket){
    if(seen.has(obstacle)||dots>250)continue;seen.add(obstacle);
    if(Math.abs(obstacle.x-player.x)>65||Math.abs(obstacle.z-player.z)>65)continue;
    const xx=u(obstacle.x),zz=v(obstacle.z);if(xx<-5||xx>w+5||zz<-5||zz>h+5)continue;
    const radius=Math.min(5,Math.max(1.5,(obstacle.r||Math.min(obstacle.w,obstacle.d))*sc*.4));
    c.fillStyle='#29465c';c.beginPath();c.arc(xx,zz,radius,0,TAU);c.fill();dots++;
   }
  }
 }
 // The walkable center lane matches the actual 3D campaign corridor.
 const roadX=u(roadCenter(player.z)),roadWidth=17*sc;
 c.lineCap='round';c.lineJoin='round';c.beginPath();
 for(let k=0;k<=80;k++){const z=player.z-80+k*2,xx=u(roadCenter(z)),yy=v(z);if(k===0)c.moveTo(xx,yy);else c.lineTo(xx,yy)}
 c.strokeStyle='#061320bd';c.lineWidth=roadWidth+8;c.stroke();
 c.strokeStyle='#536777cf';c.lineWidth=roadWidth;c.stroke();
 const branch=sidePortalPoint(game.zone);c.save();c.beginPath();let started=false;
 for(let k=0;k<=60;k++){const f=.34+k/60*.54,z=game.zone*LEN+LEN*f;
  let x=roadCenter(z)+Math.sin(k/60*Math.PI)*(game.zone%2?-21:21),yy=v(z);
  if(!started){c.moveTo(u(x),yy);started=true}else c.lineTo(u(x),yy)}
 c.strokeStyle='#719695af';c.lineWidth=7*sc;c.stroke();c.restore();
 const portalPX=u(branch.x),portalPY=v(branch.z);if(portalPX>=0&&portalPX<=w&&portalPY>=0&&portalPY<=h){
  c.strokeStyle='#6ed8d0';c.lineWidth=4;c.beginPath();c.arc(portalPX,portalPY,9,0,TAU);c.stroke();}
 c.strokeStyle='#8796a350';c.lineWidth=1.3;
 for(let z=Math.floor((player.z-72)/9)*9;z<player.z+76;z+=9){let py=v(z);c.beginPath();c.moveTo(u(roadCenter(z))-roadWidth*.4,py);c.lineTo(u(roadCenter(z))+roadWidth*.4,py);c.stroke()}
 // Region side markers. Only known, actual game objectives are highlighted.
 for(let i=Math.max(0,game.zone-1);i<=Math.min(6,game.zone+1);i++){
  const anchor=shrinePoint(i),z=anchor.z,x=anchor.x,px=u(x),py=v(z);
  if(px>=0&&px<=w&&py>=0&&py<=h){
    c.fillStyle=game.seals[i]?'#6fe5b2':'#f7d48b';c.shadowColor=c.fillStyle;c.shadowBlur=9;
    c.beginPath();c.moveTo(px,py-8);c.lineTo(px+7,py);c.lineTo(px,py+8);c.lineTo(px-7,py);c.closePath();c.fill();c.shadowBlur=0;
  }
  const r=relicPos(i);if(!game.relics[i]){let x=u(r[0]),y=v(r[1]);if(x>0&&x<w&&y>0&&y<h){c.fillStyle='#dab5fc';c.beginPath();c.arc(x,y,5,0,TAU);c.fill()}}
 }
 for(const q of cacheSpots){if(chestTaken[q.id]||q.zone!==game.zone||Math.hypot(q.x-player.x,q.z-player.z)>38)continue;
  let x=u(q.x),y=v(q.z);if(x>0&&y>0&&x<w&&y<h){c.fillStyle='#edc66f';c.fillRect(x-3.5,y-3.5,7,7);}}
 for(const q of healingWells){if(q.zone!==game.zone||Math.hypot(q.x-player.x,q.z-player.z)>42)continue;
  let x=u(q.x),y=v(q.z);c.strokeStyle='#83e6c4';c.lineWidth=3;c.beginPath();c.arc(x,y,7,0,TAU);c.stroke();}
 for(const b of wildlife){if(b.dead||Math.abs(b.x-player.x)>65||Math.abs(b.z-player.z)>65)continue;
  const xx=u(b.x),yy=v(b.z);if(xx>2&&xx<w-2&&yy>2&&yy<h-2){
  if(b.kind==='bat'&&!ldx.batsOut())continue;c.fillStyle=b.kind==='bat'?'#a182e9':'#e3649e';c.beginPath();c.arc(xx,yy,b.kind==='bat'?2.5:4.2,0,TAU);c.fill();}
 }
 if(ldx.night>.05){c.fillStyle='rgba(4,8,30,'+(.38*ldx.night)+')';c.fillRect(0,0,w,h)}
 for(const e of enemies){if(e.dead||Math.abs(e.x-player.x)>65||Math.abs(e.z-player.z)>65)continue;
   const x=u(e.x),y=v(e.z);if(x<3||y<3||x>w-3||y>h-3)continue;
   c.fillStyle=e.boss?'#ff834f':'#ff6871';c.beginPath();c.arc(x,y,e.boss?6:4.4,0,TAU);c.fill();
   if((e.mem||0)>0||e.windup>0){c.strokeStyle='#ffe27a';c.lineWidth=1.6;c.beginPath();c.arc(x,y,e.boss?12:7,0,TAU);c.stroke()}
   if(e.boss){c.strokeStyle='#ffc5a1';c.lineWidth=1.3;c.beginPath();c.arc(x,y,9,0,TAU);c.stroke()}
 }
 for(const m of ldx.meteors){const x=u(m.x),y=v(m.z);if(x<3||y<3||x>w-3||y>h-3)continue;c.strokeStyle='rgba(255,90,60,'+(.6+.35*Math.sin(clock*14))+')';c.lineWidth=2;c.beginPath();c.arc(x,y,Math.max(5,3.8*sc),0,TAU);c.stroke();c.fillStyle='rgba(255,120,70,.35)';c.fill()}
 const px=u(player.x),py=v(player.z);c.save();c.translate(px,py);c.rotate(player.angle);
 c.shadowColor='#ffdd95';c.shadowBlur=11;c.beginPath();c.moveTo(0,-12);c.lineTo(-8,8);c.lineTo(0,4);c.lineTo(8,8);c.closePath();c.fillStyle='#ffda85';c.fill();c.shadowBlur=0;c.strokeStyle='#102234';c.lineWidth=2;c.stroke();c.restore();
 c.restore();
 // The heading marker points up on the camera-relative tactical minimap.
 c.fillStyle='#f4dcaa';c.font='bold 12px system-ui';c.textAlign='center';c.fillText('↑ KAMERA',w*.5,15);
 c.strokeStyle='#efdaa43d';c.lineWidth=1;c.strokeRect(4,4,w-8,h-8);
}
function mapDraw(target,large=false){if(large)return drawAtlas(target);if(target===mini)return drawArenaMinimap(target);const c=target.getContext('2d');if(!c)return;let W=target.width,H=target.height;c.clearRect(0,0,W,H);
 c.save();c.translate(W*.5,H*.5);let sc=large?H/(END+96):H/(LEN+45),z0=large?END/2:player.z,x0=large?0:player.x;c.scale(sc,-sc);c.translate(-x0,-z0);
 for(let j=0;j<7;j++){
 if(!large&&Math.abs(player.z-(j+.5)*LEN)>LEN*2)continue;
 let reg=regions[j],base=j*LEN;
 c.fillStyle=`rgb(${reg.ground.map(v=>Math.round(v*170)).join(',')})`;
 c.beginPath();c.roundRect(-62,base+1,124,LEN-2,4);c.fill();
 c.fillStyle='rgba(4,9,15,.3)';c.fillRect(-7,base+2,14,LEN-4);
 c.strokeStyle=`rgb(${reg.accent.map(v=>Math.round(v*230)).join(',')})`;c.lineWidth=large?1.5:2.5;c.strokeRect(-62,base+1,124,LEN-2);
 c.beginPath();c.fillStyle=game.seals[j]?'#597d6e':'#fbe2ad';c.arc(0,shrinePoint(idx).z,large?4:4.5,0,TAU);c.fill();
 c.beginPath();c.fillStyle=game.bosses[j]?'#6b7568':'#eb605f';c.moveTo(0,base+99);c.lineTo(-5,base+106);c.lineTo(0,base+113);c.lineTo(5,base+106);c.closePath();c.fill();
 if(large){for(let i=0;i<22;i++){let x=(hash(i*21+j*43)*2-1)*49,z=base+hash(i*3+j*55)*LEN;c.beginPath();c.fillStyle='rgba(0,0,0,.24)';c.arc(x,z,1.5+hash(i)*2.5,0,TAU);c.fill()}}
 }
 for(let j=0;j<7;j++){let pt=relicPos(j);c.beginPath();c.arc(pt[0],pt[1],large?2.2:4,0,TAU);c.fillStyle=game.relics[j]?'#5b9979':'#ffd099';c.fill()}
 c.beginPath();c.arc(player.x,player.z,large?5.8:6,0,TAU);c.fillStyle='#fbf9e7';c.fill();c.strokeStyle='#d27957';c.lineWidth=2;c.stroke();c.beginPath();c.moveTo(player.x,player.z);c.lineTo(player.x+Math.sin(player.angle)*16,player.z+Math.cos(player.angle)*16);c.strokeStyle='#fff';c.lineWidth=2.5;c.stroke();c.restore();
 if(!large){let g=c.createRadialGradient(W/2,H/2,W*.1,W/2,H/2,W*.5);g.addColorStop(0,'transparent');g.addColorStop(1,'#040813b5');c.fillStyle=g;c.fillRect(0,0,W,H)}else{
 c.font='bold 13px system-ui';c.textBaseline='middle';c.textAlign='left';for(let i=0;i<7;i++){let y=H/2-(i*LEN+LEN/2-END/2)*sc;c.fillStyle=i===game.zone?'#ffe3ab':'#c5c5c5';c.fillText(`${String(i+1).padStart(2,'0')} · ${regions[i].name}`,W*.63,y);
 c.font='11px system-ui';c.fillStyle=game.seals[i]?'#c2efbb':'#c9b5a7';c.fillText(game.seals[i]?'✦ Segel aktif':'○ Belum aktif',W*.63,y+19);c.font='bold 13px system-ui';}
 }
}
function configureAtlas(){
 const portrait=innerHeight>innerWidth;
 const usableW=Math.max(290,innerWidth-32),usableH=Math.max(280,innerHeight-(portrait?110:80));
 mapCanvas.width=portrait?960:1600;
 mapCanvas.height=Math.round(mapCanvas.width*usableH/usableW);
}
function toggleMap(){if(game.state==='playing'){
 game.state='map';ui.map.classList.add('visible');hideTouchControls();keySet.clear();configureAtlas();mapDraw(mapCanvas,true);
 $('mapTitle').textContent=regions[game.zone].name;buildRealmSelector();if(document.pointerLockElement)document.exitPointerLock?.();
 }else if(game.state==='map'){game.state='playing';ui.map.classList.remove('visible');if(isTouchDevice())revealTouchControls();lastFrame=0;}}
function buildRealmSelector(){const bar=$('realmJump');if(!bar)return;bar.replaceChildren();bar.hidden=!game.flying;
 if(!game.flying)return;
 for(let i=0;i<7;i++){let b=document.createElement('button');b.type='button';b.className='realm-choice'+(i===game.zone?' current':'');
 b.textContent=String(i+1).padStart(2,'0')+(game.visited[i]?' · '+regions[i].name:' · ?');b.title=game.visited[i]?regions[i].name:'Wilayah belum dijelajahi';
 b.addEventListener('click',()=>travelRealm(i));bar.appendChild(b);}
}
function setGraphicsQuality(next,persist=false){if(!['high','cinematic','balanced','low'].includes(next))return false;quality=next;adaptiveFactor=1;perfClock=slowFrames=perfFrames=0;if(persist)try{localStorage.setItem('rubaka3d-quality',quality)}catch{}resize();updateSettingsUI();return true;}
function toggleQuality(){const modes=['high','cinematic','balanced','low'];setGraphicsQuality(modes[(modes.indexOf(quality)+1)%modes.length],true)}
const keySet=new Set();let touchMove={active:false,x:0,y:0},contacts=new Map(),mouseOrbit=false,lastTap=0;
const touchLayer=$('mobileControls'),joyVisual=$('joyVisual'),joyKnob=$('joyKnob'),lookVisual=$('lookVisual');
let flightTouchRise=false,flightTouchDrop=false;const actionPointers=new Map();
let peekTimer=0,joystickCenter={x:90,y:0};
const isTouchDevice=()=>matchMedia('(pointer:coarse)').matches||document.body.classList.contains('touch-device');
function placeJoystick(){
 // Fixed-position, thumb-friendly left joystick, independent of camera direction.
 const size=joyVisual.getBoundingClientRect().width||124;
 const edgeX=Math.max(18,innerWidth*.023),edgeBottom=Math.max(16,innerHeight*.044);
 joystickCenter={x:edgeX+size*.5,y:innerHeight-edgeBottom-size*.5};
 joyVisual.style.left=joystickCenter.x+'px';joyVisual.style.top=joystickCenter.y+'px';
 return joystickCenter;
}
function revealTouchControls(){if(game.state!=='playing')return;document.body.classList.add('touch-device');touchLayer.classList.add('running','revealed');placeJoystick()}
function hideTouchControls(){touchLayer.classList.remove('running','revealed');joyVisual.classList.remove('active');lookVisual.classList.remove('visible');clearTimeout(peekTimer);contacts.clear();actionPointers.clear();flightTouchRise=false;flightTouchDrop=false;for(const b of document.querySelectorAll('.ghost-btn.pressed'))b.classList.remove('pressed');touchMove.active=false;touchMove.x=touchMove.y=0;joyKnob.style.transform='translate(0px,0px)'}
function setJoy(dx=0,dy=0){const lim=(joyVisual.getBoundingClientRect().width||124)*.30;const mag=Math.hypot(dx,dy),scale=mag>lim?lim/mag:1;joyKnob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`}
function readJoystick(x,y){const c=joystickCenter,r=(joyVisual.getBoundingClientRect().width||124)*.37;const dx=x-c.x,dy=y-c.y;const raw=Math.min(1,Math.hypot(dx,dy)/r),amount=raw<.11?0:Math.pow((raw-.11)/.89,1.05),ang=Math.atan2(dy,dx);
 touchMove.x=Math.cos(ang)*amount;touchMove.y=-Math.sin(ang)*amount;setJoy(dx,dy)}
function onGameKeyDown(e){
 if(settingsOpen){if(bindingPending){e.preventDefault();e.stopPropagation();if(!e.repeat)chooseBinding(e.code);}else if(e.code==='Escape'){e.preventDefault();showMenuPanel()}return;}
 if(!['playing','map','pause'].includes(game.state))return;
 const isControl=Object.values(keybinds).includes(e.code);if(isControl||e.code==='F3')e.preventDefault();
 if(e.repeat&&(isControl||e.code==='F3'))return;
 keySet.add(e.code);
 if(isBound('pause',e.code)){if(game.state==='map')toggleMap();else if(game.state==='playing')openMenu();else if(game.state==='pause')resume();return}
 if(isBound('map',e.code)){toggleMap();return}
 if(game.state!=='playing')return;
 if(isBound('jump',e.code))doJump();
 if(isBound('dash',e.code))doDash();
 if(isBound('fire',e.code))doFire();
 if(isBound('attack',e.code))doAttack();
 if(e.code==='F3')toggleQuality();
 if(isBound('camera',e.code))toggleView()
}
window.addEventListener('keydown',onGameKeyDown);
window.addEventListener('keyup',e=>keySet.delete(e.code));
window.addEventListener('blur',()=>{keySet.clear();if(game.state==='playing')openMenu()});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{
 if(game.state!=='playing')return;
 if(e.pointerType==='touch'){
  e.preventDefault();revealTouchControls(1600);
  const side=e.clientX<innerWidth*.48?'left':'right';
  // One owner for each continuous gesture. Extra touches never pause gameplay.
  if([...contacts.values()].some(p=>p.side===side))return;
  contacts.set(e.pointerId,{x:e.clientX,y:e.clientY,ox:e.clientX,oy:e.clientY,side,start:performance.now(),moved:false,charged:false});
  canvas.setPointerCapture(e.pointerId);
  if(side==='left'){
    touchMove.active=true;touchMove.x=touchMove.y=0;
    const size=joyVisual.getBoundingClientRect().width||124;
    joystickCenter={x:clamp(e.clientX,size*.54,innerWidth*.43),y:clamp(e.clientY,innerHeight*.51,innerHeight-size*.52)};
    joyVisual.style.left=joystickCenter.x+'px';joyVisual.style.top=joystickCenter.y+'px';
    setJoy();joyVisual.classList.add('active');
  }
  else{lookVisual.style.left=e.clientX+'px';lookVisual.style.top=e.clientY+'px';lookVisual.classList.add('visible')}
 }else if(e.button===2){mouseOrbit=true;canvas.setPointerCapture(e.pointerId)}else if(e.button===0){doAttack();if(!isTouchDevice()&&document.pointerLockElement!==canvas){try{canvas.requestPointerLock?.().catch?.(()=>{});}catch{}}}
});
canvas.addEventListener('pointermove',e=>{
 if(game.state!=='playing')return;
 if(e.pointerType==='touch'){
  const p=contacts.get(e.pointerId);if(!p)return;
  const dx=e.clientX-p.x,dy=e.clientY-p.y;
  if(p.side==='left'){
    readJoystick(e.clientX,e.clientY);
  }else{orbit-=dx*.007*cameraSensitivity;orbitPitch=clamp(orbitPitch+dy*.004*cameraSensitivity,-1.10,1.10)}
  if(Math.hypot(e.clientX-p.ox,e.clientY-p.oy)>13)p.moved=true;
  p.x=e.clientX;p.y=e.clientY;revealTouchControls(1250);
 }else if(e.pointerType==='mouse'||e.pointerType==='pen'||mouseOrbit||document.pointerLockElement===canvas){
  // Free-look on desktop: ordinary cursor movement already rotates the camera. Click to lock for unlimited turn.
  orbit-=e.movementX*.0033*cameraSensitivity;orbitPitch=clamp(orbitPitch+e.movementY*.0025*cameraSensitivity,-1.10,1.10);
 }
});
function pointerEnd(e){const p=contacts.get(e.pointerId);
 if(e.pointerType==='touch'&&p){
  contacts.delete(e.pointerId);
  if(p.side==='left'){
    const next=[...contacts.values()].find(t=>t.side==='left');
    if(next){touchMove.active=true;readJoystick(next.x,next.y)}
    else{touchMove.active=false;touchMove.x=touchMove.y=0;joyVisual.classList.remove('active');setJoy();placeJoystick()}
  }else{lookVisual.classList.remove('visible');if(e.type==='pointerup'&&!p.moved&&!p.charged&&game.state==='playing'&&performance.now()-p.start<400){{const now=performance.now();if(now-lastTap<300){doJump();lastTap=0}else{doAttack();lastTap=now}}}}
  revealTouchControls(1650);
 }else{mouseOrbit=false}
}
canvas.addEventListener('pointerup',pointerEnd);canvas.addEventListener('pointercancel',pointerEnd);canvas.addEventListener('lostpointercapture',pointerEnd);
// Touchable hotspots are transparent until a finger touches the screen; buttons always work.
document.querySelectorAll('[data-mobile-action]').forEach(button=>{
 button.addEventListener('pointerdown',e=>{
  if(game.state!=='playing')return;e.preventDefault();e.stopPropagation();revealTouchControls(1800);button.classList.add('pressed');
  actionPointers.set(e.pointerId,button);try{button.setPointerCapture(e.pointerId);}catch{}
  const action=button.dataset.mobileAction;
   if(game.flying&&action==='jump')flightTouchRise=true;
   if(game.flying&&action==='descend')flightTouchDrop=true;
   ({attack:doAttack,jump:doJump,dash:doDash,descend:()=>{},fire:doFire,view:toggleView,pause:()=>openMenu()})[action]?.();
 });
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(ev,e=>{if(actionPointers.get(e.pointerId)!==button)return;actionPointers.delete(e.pointerId);if([...actionPointers.values()].includes(button))return;button.classList.remove('pressed');if(button.dataset.mobileAction==='jump')flightTouchRise=false;if(button.dataset.mobileAction==='descend')flightTouchDrop=false;});
});
$('play').addEventListener('click',()=>{audioContext()?.resume?.();let hasSave=false;try{hasSave=!!localStorage.getItem('landlord-openrealms-save-v1')}catch{}if(hasSave)fromSave();else newGame()});
$('victoryRestart').addEventListener('click',()=>{$('victoryOverlay').hidden=true;newGame()});
$('victoryMenu').addEventListener('click',()=>{game.missionEnd=false;try{localStorage.removeItem('landlord-openrealms-save-v1')}catch{}$('victoryOverlay').hidden=true;openMenu(true);});
$('resume').addEventListener('click',resume);
$('restart').addEventListener('click',()=>{if(confirm(T('resetConfirm'))){try{localStorage.removeItem('landlord-openrealms-save-v1')}catch{}showMenuPanel();newGame()}});
$('closeMap').addEventListener('click',e=>{e.stopPropagation();if(game.state==='map')toggleMap()});
mini.addEventListener('click',e=>{if(game.state==='playing'){e.preventDefault();e.stopPropagation();toggleMap()}});
ui.map.addEventListener('click',e=>{if(e.target===$('mapOverlay'))toggleMap()});
function fpsTick(dt){fps=mix(fps,1/Math.max(dt,.001),.06)}
let miniRefresh=0,perfClock=0,slowFrames=0,perfFrames=0;
function adaptPerformance(dt){
 if(!isTouchDevice()||!gl||quality==='low')return;
 perfClock+=dt;perfFrames++;if(dt>.036)slowFrames++;
 if(perfClock>=4){const slowRatio=slowFrames/Math.max(1,perfFrames),mean=perfClock/Math.max(1,perfFrames);
  const next=slowRatio>.45?Math.max(.62,adaptiveFactor-.12):mean<.022?Math.min(1,adaptiveFactor+.06):adaptiveFactor;
  if(Math.abs(next-adaptiveFactor)>.001){adaptiveFactor=next;resize();}
  perfClock=slowFrames=perfFrames=0;
 }
}
// Create by LamberthRumpaidus
function loop(now){requestAnimationFrame(loop);if(!lastFrame)lastFrame=now;
 const rawDT=Math.min(Math.max(0,(now-lastFrame)/1000),.085);lastFrame=now;
 // Semi-fixed simulation: prevent fast dashes and combat hits from tunneling on 30 FPS devices.
 const dt=Math.min(rawDT,.06);
 if(game.state==='playing'){
   const slices=Math.min(3,Math.max(1,Math.ceil(dt/(1/45))));
   const tick=dt/slices;
   for(let i=0;i<slices&&game.state==='playing';i++)update(tick);
   adaptPerformance(rawDT);
 }else if(game.state==='title'){clock+=dt;player.y=height(player.x,player.z);player.move+=dt*.18}
 else{clock+=dt*.15}
 drawWorld(dt);
 if(game.state==='playing'){positionFireLockMarker();miniRefresh+=dt;if(miniRefresh>=.12){miniRefresh=0;mapDraw(mini,false)}}
 fpsTick(Math.max(rawDT,.001));
}
window.addEventListener('resize',()=>{resize();placeJoystick();mapDraw(mini,false);if(game.state==='map'){configureAtlas();mapDraw(mapCanvas,true)}});
try{
 initRenderer();
   // Without WebGL, prioritize responsive controls on the software renderer.
   let savedGraphics=false;try{savedGraphics=!!localStorage.getItem('rubaka3d-quality')}catch{}
   if(mode==='cpu'&&!savedGraphics){quality=innerWidth<700?'low':'balanced';updateSettingsUI();}
   resize();rebuild();spawnEnemies();spawnWildlife();player.y=height(player.x,player.z);
 let saved=false;try{saved=!!localStorage.getItem('landlord-openrealms-save-v1')}catch{}
 if(saved){$('play').textContent=T('start')}
 // Show the rendered 3D world in the title, too.
 requestAnimationFrame(loop);
 window.Landlord3D={getFrameState:()=>({state:game.state,zone:game.zone,quality,ambientPoints:game.zone<2?Array.from({length:4},(_,j)=>{const z=game.zone*LEN+68+j*9,x=roadCenter(z)+33*(j%2?1:-1);return {x,y:height(x,z)+.3,z};}):[],player:{x:player.x,y:player.y,z:player.z,hp:player.hp,vx:player.vx,vz:player.vz,grounded:player.grounded},eye:camEye,forward:cameraBasis?.forward||[0,0,1],up:cameraBasis?.up||[0,1,0],seals:game.seals,relics:game.relics}),getGameplayMetrics:()=>({...gameplayStats,damageNumbers:damagePopups.length,enemyWindups:enemies.filter(e=>!e.dead&&e.windup>0).length,nearbyEnemies:enemies.filter(e=>!e.dead&&e.zone===game.zone&&Math.hypot(e.x-player.x,e.z-player.z)<22).length,coyote:player.coyote,jumpBuffer:player.jumpBuffer,counterReady:player.counterReady}),getStatus:()=>({renderer:mode,fps:Math.round(fps),gameTime:Math.round(game.time*10)/10,splashTime:Math.round(splashTime*10)/10,triangles:staticBuffers.map(b=>Math.round((b?.count||0)/3)),zone:game.zone,seals:[...game.seals],bosses:[...game.bosses],player:{x:player.x,y:player.y,z:player.z,hp:player.hp,angle:player.angle,vx:player.vx,vz:player.vz,grounded:player.grounded,motion:player.motion,flying:game.flying},relics:[...game.relics],visited:[...game.visited],exploration:game.explored.map(a=>a.length),skills:{dash:skillUnlocked('dash'),fire:skillUnlocked('fire')},gameName:'LANDLORD',won:game.missionEnd,checkpoint:{x:game.checkpointX,z:game.checkpoint},cameraYaw:orbit,cameraPitch:orbitPitch,viewMode,enemyCount:enemies.filter(e=>!e.dead).length,autoAimCandidates:livingFireTargets().filter(e=>e.zone===game.zone).length,autoAimSwitches:autoAimSwitchCount,wildlifeCount:wildlife.filter(b=>!b.dead).length,obstacles:solidCount,breakables:breakables.filter(b=>!b.dead).length,brokenCrates:breakables.filter(b=>b.dead).length,gpuRealmsLoaded:staticBuffers.filter(b=>!!b.buffer).length,chests:chestTaken.filter(Boolean).length,chestTotal:cacheSpots.length,shards:shardTaken.filter(Boolean).length,shardTotal:energyShards.length,healingWells:healingWells.length,hazards:riftTraps.length,worldLength:END,altarHold:Math.round(altarHold*100)/100,drawCalls,submittedTriangles,visibleChunks,quality,shadowResolution:shadowState?.sz||0,postFX:cinematicPipeline?.status()||{active:false,frames:0},materialTextures:materialLibrary?.ready||0,particleInstancing:!!particleBatch,particleInstances:particleBatch?.count||0,particleFrames:particleBatch?.frames||0,renderScale:adaptiveFactor,touchContacts:contacts.size,actionContacts:actionPointers.size,state:game.state}),setGraphicsQuality:next=>setGraphicsQuality(next,false),gpuErrors:()=>{if(!gl)return [];let errors=[];for(let i=0;i<16;i++){const err=gl.getError();if(!err)break;errors.push(err);}return errors;},start:newGame,continue:fromSave,interact,attack:doAttack,jump:doJump,travelRealm,openMap:toggleMap,checkVictory,portalPoint,sidePortalPoint,shrinePoint,roadCenter,attackInfo:()=>({combo:player.combo,attackTime:player.attackTime,duration:player.attackDuration,queued:player.attackQueued,trail:player.swordTrail.length,hitFlashes:hitFlashes.length}),fire:doFire,fireAimInfo,breakableSpots:()=>breakables.map(b=>({id:b.id,x:b.x,z:b.z,dead:b.dead,hp:b.hp})),damageCrate:(id,amount=75)=>strikeBreakableById(id,amount),fireAimDebug:()=>attacks.filter(a=>a.kind==='fire').map(a=>({x:a.x,y:a.y,z:a.z,locked:!!a.aimTarget,lockTarget:a.aimTarget?{x:a.aimTarget.x,z:a.aimTarget.z,hp:a.aimTarget.hp}:null,vx:a.vx,vy:a.vy,vz:a.vz})),fireLockStatus:()=>({current:fireLockWindow>0&&currentFireLock?{x:currentFireLock.x,z:currentFireLock.z,dead:currentFireLock.dead,kind:currentFireLock.kind||'enemy'}:null,silent:true,active:fireLockWindow>0,remaining:Math.round(fireLockWindow*1000)/1000,switches:autoAimSwitchCount}),dash:doDash,world:regions,instantState:()=>({flying:game.flying,dashTime:player.dashTime,dashSerial:player.dashSerial,dashCooldown:player.dashCooldown,dashVX:player.dashVX,dashVZ:player.dashVZ,dashVY:player.dashVY,attackTime:player.attackTime,fireCooldown:player.fireCooldown,pulseCooldown:player.pulseCooldown,y:player.y}),controls:{cameraMove,getInput,toggleView,setOrbit:(v)=>{orbit=v},getOrbit:()=>orbit,getBindings:()=>({...keybinds}),setBinding:(act,code)=>{if(!Object.prototype.hasOwnProperty.call(keybinds,act))return false;bindingPending=act;chooseBinding(code);return keybinds[act]===code}},testMove:(dx,dz)=>{const x=player.x,z=player.z;moveWithCollision(player,dx,dz,.72,player.y,2.65);return {x:player.x,z:player.z,blocked:Math.hypot(player.x-x-dx,player.z-z-dz)>.1}},testSetPosition:(x,z)=>{player.x=x;player.z=z;player.y=height(x,z);return {x,z}},solidAt:(x,z,y=height(x,z))=>!!blocking(x,z,.72,y,2.65),
 collisionAt:(x,z,y,r=.72)=>{const a=blocking(x,z,r,y,2.65);return a?{kind:a.kind,minY:a.minY,maxY:a.maxY,x:a.x,z:a.z}:null},
 setPlayerAltitude:(y)=>{player.y=y;player.grounded=false;return player.y},
 getMapOrientation:()=>({minimapYaw:orbit,atlasNorthUp:true,x:player.x,z:player.z}),
 setCameraPitch:v=>{orbitPitch=clamp(v,-1.10,1.10)},
 runRealmChecks:()=>regions.map((r,j)=>{const p=portalPoint(j),s=shrinePoint(j);return {world:j+1,name:r.name,gate:p,altar:s,gatePostLeft:!!blocking(p.x-12,p.z,.1,height(p.x-12,p.z),2.8),gatePostRight:!!blocking(p.x+12,p.z,.1,height(p.x+12,p.z),2.8),middlePassable:!blocking(p.x,p.z,.2,height(p.x,p.z),2.8),roofSolid:!!blocking(p.x,p.z,.2,height(p.x,p.z)+12.6,1),roadWidth:17}}),treasureSpots:()=>cacheSpots.map(q=>({...q,taken:chestTaken[q.id]})),wellSpots:()=>healingWells.map(q=>({...q})),hazardSpots:()=>riftTraps.map(q=>({...q})),inspect:()=>({wildlife:wildlife.map(b=>({kind:b.kind,x:b.x,z:b.z,dead:b.dead})),player:{...player},camera:{eye:[...camEye],focus:[...camFocus]},enemies:enemies.map(e=>({x:e.x,y:e.y,z:e.z,zone:e.zone,boss:e.boss,dead:e.dead,hp:e.hp,windup:e.windup,attack:e.attack}))})};
 window.Rubaka3D=window.Landlord3D;console.info(`LANDLORD — ${mode==='gpu'?'WebGL':'3D software renderer'} / 7 biomes / Blade Dance combat / offline`);
}catch(error){console.error('LANDLORD 3D initialization error:',error);$('error').style.display='flex';$('error').querySelector('p').textContent='Renderer tidak dapat dimulai: '+error.message+' — Harap laporkan pesan error ini untuk perbaikan.'}
})();

