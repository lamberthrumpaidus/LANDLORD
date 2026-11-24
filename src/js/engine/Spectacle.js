/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
const TAU=Math.PI*2,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const tint=(c,k)=>c.map(x=>clamp(x*k,0,1.2));
const identities=['The Ferryman','Verdant Watch','Ossuary Gate','Mourning Choir','Cinder Vanguard','Astral Watch','Eclipse Throne'];
function entry(m,j,r,u){
 const {height,roadCenter,LEN,limb}=u,base=j*LEN,z=base+44,x=roadCenter(z),old=m.solidWorld,begin=m.d.length;
 const stone=tint(r.stone,.72),trim=tint(r.stone,1.25),accent=r.accent;
 // Twin monumental sentinels frame the traversable road, without changing its center.
 for(const s of [-1,1]){
  const px=x+s*15.5,py=height(px,z),metal=tint(r.stone,.43);
  m.box(px,py+.42,z,6.5,.84,6.4,stone);
  m.box(px,py+1.08,z,5.5,.55,5.5,trim);
  m.box(px,py+1.83,z,4.5,1.0,4.6,stone);
  m.box(px,py+2.46,z,4.9,.34,4.9,trim);
  // All decoration above the pedestal is visual; it cannot create an invisible barrier.
  m.solidWorld=false;
  if(j===1||j===5){
   for(let k=0;k<6;k++){
    const q=k*TAU/6,xx=px+Math.cos(q)*1.35,zz=z+Math.sin(q)*1.35;
    limb(m,[xx,py+2.6,zz],[px+Math.cos(q)*2.2,py+8.3+(k%2)*1.1,z+Math.sin(q)*2.2],.32,.085,stone,0,6);
   }
   m.ellipsoid(px,py+6.8,z,1.2,1.8,1.2,trim,0,6,10);
   m.spike(px,py+8.1,z,.92,3.4,accent,.64);
   m.ring(px,py+9.1,z,2.6,.09,accent,.72);
  }else{
   // Hand-built giant hooded knight silhouette, drapery and a downward-pointing ceremonial sword.
   for(const side of [-1,1]){
    limb(m,[px+side*.85,py+5.7,z],[px+side*.95,py+3.1,z+.12],.72,.55,stone,0,8);
    m.box(px+side*.96,py+2.91,z+.26,1.48,.52,2.02,metal);
   }
   m.ellipsoid(px,py+6.3,z,1.9,1.75,1.02,stone,0,7,12);
   m.ellipsoid(px,py+8.4,z,.94,1.12,.84,metal,0,8,12);
   m.ellipsoid(px,py+8.45,z-.17,1.15,1.35,.96,stone,0,8,12);
   m.box(px,py+8.4,z-.98,1.3,.15,.12,accent,.65);
   for(const side of [-1,1]){
    m.ellipsoid(px+side*1.8,py+7.2,z,.95,.61,.91,trim,0,6,10);
    limb(m,[px+side*1.8,py+7.15,z],[px+side*1.38,py+6.0,z-1.0],.53,.42,stone,0,8);
    limb(m,[px+side*1.38,py+6.0,z-1.0],[px+side*.25,py+5.8,z-1.55],.42,.31,stone,0,8);
   }
   m.box(px,py+5.9,z-1.56,2.1,.23,.32,trim);
   m.box(px,py+4.45,z-1.55,.43,2.7,.20,trim);
   m.tri([px-.22,py+3.12,z-1.55],[px+.22,py+3.12,z-1.55],[px,py+2.60,z-1.55],trim);
   for(let k=0;k<10;k++){
    const a=-1.65+k*.33,b=a+.33;
    m.quad([px+a,py+7.3,z+.82],[px+b,py+7.3,z+.82],[px+b*1.30,py+2.76,z+1.26+Math.cos(k)*.12],[px+a*1.30,py+2.76,z+1.26+Math.cos(k-1)*.12],tint(metal,.85+k*.02));
   }
   if(j===2||j===6)for(const side of [-1,1])limb(m,[px+side*.68,py+9.08,z],[px+side*1.45,py+10.55,z+.12],.28,.04,trim,0,7);
  }
  m.solidWorld=old;
  // Close-range beacon; visible from the spawn but outside the main road.
  const lz=base+30,lx=roadCenter(lz)+s*11.2,ly=height(lx,lz);
  m.box(lx,ly+.45,lz,1.65,.9,1.65,stone);
  m.box(lx,ly+1.45,lz,.60,1.2,.60,trim);
  m.box(lx,ly+2.04,lz,1.2,.18,1.2,metal);
  m.solidWorld=false;
  for(const dx of [-.48,.48])for(const dz of [-.48,.48])m.box(lx+dx,ly+2.65,lz+dz,.12,1.2,.12,trim);
  m.box(lx,ly+3.32,lz,1.38,.22,1.38,stone);
  m.cone(lx,ly+3.43,lz,.89,.7,trim,4,.08);
  m.ellipsoid(lx,ly+2.62,lz,.27,.46,.27,accent,1.45,5,8);
  m.solidWorld=old;
 }
 return {name:identities[j],triangles:(m.d.length-begin)/30};
}
function portal(m,g,y,col,quality){
 const old=m.material;m.material=4;const segments=quality==='low'?32:64,cy=y+4.55,rx=7.6,ry=4.30;
 // A real world-space magical surface. It has no collision geometry.
 for(let i=0;i<segments;i++){const a=i*TAU/segments,b=(i+1)*TAU/segments;const point=t=>[g.x+Math.cos(t)*rx,cy+Math.sin(t)*ry,g.z];m.tri([g.x,cy,g.z],point(a),point(b),col,0);}
 m.material=old;
}
class ImpactFX{
 constructor(){this.effects=[];this.total=0;}
 spawn(kind,x,y,z,col){if(![x,y,z].every(Number.isFinite))return;const life=kind==='portal'?.85:kind==='dash'?.27:.48;this.effects.push({kind,x,y,z,col:[...col],age:0,life});if(this.effects.length>14)this.effects.shift();this.total++;}
 tick(dt){for(const f of this.effects)f.age+=dt;this.effects=this.effects.filter(f=>f.age<f.life);}
 light(){const f=this.effects.at(-1);if(!f)return {position:[0,0,0,0],color:[0,0,0]};const k=(1-f.age/f.life)**2;return {position:[f.x,f.y,f.z,f.kind==='portal'?20:12],color:f.col.map(x=>x*k*(f.kind==='dash'?.65:1.45))};}
 draw(m,height,quality){const n=quality==='low'?16:32;for(const f of this.effects){const t=clamp(f.age/f.life,0,1),r=.55+(f.kind==='portal'?8:f.kind==='dash'?3.2:5.4)*t,alpha=(1-t)**2,w=.07+.26*alpha;const point=(a,rad)=>{const x=f.x+Math.cos(a)*rad,z=f.z+Math.sin(a)*rad;return [x,height(x,z)+.17,z];};for(let i=0;i<n;i++){const a=i*TAU/n,b=(i+1)*TAU/n;m.quad(point(a,r-w),point(b,r-w),point(b,r+w),point(a,r+w),tint(f.col,.45+.55*alpha),alpha*1.4);}}}
}
const api={entry,portal,ImpactFX,identities};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LandlordSpectacle=api;
})(globalThis);
