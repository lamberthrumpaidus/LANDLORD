/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),mix=(a,b,t)=>a+(b-a)*t;
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),len=a=>Math.hypot(...a),norm=a=>mul(a,1/(len(a)||1));
function solveTwoBone(origin,goal,pole,a,b){
 const delta=sub(goal,origin),raw=len(delta),axis=raw>1e-7?mul(delta,1/raw):[0,-1,0];
 const reach=clamp(raw,Math.abs(a-b)+.0001,a+b-.0001),tip=add(origin,mul(axis,reach));
 let bend=sub(pole,mul(axis,dot(pole,axis)));
 if(len(bend)<1e-6){const fallback=Math.abs(axis[0])<.8?[1,0,0]:[0,0,1];bend=sub(fallback,mul(axis,dot(fallback,axis)));}
 bend=norm(bend);
 const along=(a*a-b*b+reach*reach)/(2*reach),side=Math.sqrt(Math.max(0,a*a-along*along));
 return {joint:add(add(origin,mul(axis,along)),mul(bend,side)),tip,clamped:Math.abs(reach-raw)>.001};
}
function blendPose(from,to,t){const u=clamp(t,0,1),s=u*u*(3-2*u),out={...to};out.hand=from.hand.map((v,i)=>mix(v,to.hand[i],s));let blade=from.blade.map((v,i)=>mix(v,to.blade[i],s));out.blade=len(blade)>.00001?norm(blade):norm(to.blade);for(const k of ['twist','crouch','lunge'])out[k]=mix(from[k],to[k],s);return out;}
function world(p,x,z){const c=Math.cos(p.angle),s=Math.sin(p.angle);return [p.x+x*c+z*s,p.z-x*s+z*c];}
function local(p,x,z){const dx=x-p.x,dz=z-p.z,c=Math.cos(p.angle),s=Math.sin(p.angle);return [dx*c-dz*s,dx*s+dz*c];}
function approach(value,target,dt,rate){return mix(value,target,1-Math.exp(-dt*rate));}
class HeroMotion{
 constructor(){this.phase=0;this.feet=[null,null];this.mode='idle';this.weights={run:0,air:0,dash:0,flight:0,hurt:0};this.cape=Array.from({length:8},()=>({z:0,vz:0,x:0,vx:0}));this.last=null;this.steps=0;this.hurtTime=0;this.frames=0;this.lastVelocity=[0,0];this.legDiagnostics=[];}
 reset(p){this.phase=0;this.feet=[null,null];this.last=p?[p.x,p.y,p.z]:null;this.lastVelocity=[0,0];this.weights={run:0,air:0,dash:0,flight:0,hurt:0};this.hurtTime=0;this.cape.forEach(n=>{n.x=n.z=n.vx=n.vz=0});}
 hurt(){this.hurtTime=.33;}
 tick(p,flying,dt,terrain){
  dt=clamp(dt,0,.05);if(!this.last||Math.hypot(p.x-this.last[0],p.z-this.last[2])>5||Math.abs(p.y-this.last[1])>8)this.reset(p);
  const dist=Math.hypot(p.x-this.last[0],p.z-this.last[2]),speed=dt>0?dist/dt:0;
  this.last=[p.x,p.y,p.z];this.hurtTime=Math.max(0,this.hurtTime-dt);
  const dash=p.dashTime>0,air=!p.grounded,run=p.grounded&&!dash&&speed>.6;
  this.mode=flying?'flight':dash?'dash':air?(p.vy>0?'rise':'fall'):this.hurtTime>0?'hurt':p.attackTime>0?'attack':run?'run':'idle';
  for(const [k,v] of Object.entries({run:run?clamp(speed/10,0,1):0,air:air?1:0,dash:dash?1:0,flight:flying?1:0,hurt:this.hurtTime>0?Math.sin(Math.PI*this.hurtTime/.33):0}))this.weights[k]=approach(this.weights[k],v,dt,k==='hurt'?25:15);
  if(run)this.phase+=dist*2.9;
  else if(!air&&!dash)this.phase+=dt*.25;
  for(let i=0;i<2;i++){
   const side=i===0?-1:1,cycle=((this.phase/(2*Math.PI)+i*.5)%1+1)%1,stance=cycle<.48;
   const stride=.40+.42*this.weights.run,front=run?(1-cycle*2)*stride:0;
   const desired=world(p,side*.36,front);
   let f=this.feet[i];
   if(!f||air||dash||flying){f={x:desired[0],z:desired[1],fromX:desired[0],fromZ:desired[1],toX:desired[0],toZ:desired[1],stance:false,initialized:false,lift:0};this.feet[i]=f;}
   if(air||dash||flying){f.lift=0;continue;}
   if(!run){
    const offset=local(p,f.x,f.z);if(!f.initialized||Math.abs(offset[0]-side*.36)>.48||Math.abs(offset[1])>.60){f.x=desired[0];f.z=desired[1];}
    else{f.x=approach(f.x,desired[0],dt,8);f.z=approach(f.z,desired[1],dt,8);}f.stance=true;f.initialized=true;f.lift=0;continue;
   }
   const offset=local(p,f.x,f.z),overreach=Math.hypot(offset[0]-side*.36,offset[1])>1.00;
   if(stance){
    if(!f.stance||!f.initialized||overreach){f.x=desired[0];f.z=desired[1];if(!f.stance)this.steps++;}f.lift=0;
   }else{
    if(f.stance||!f.initialized){f.fromX=f.x;f.fromZ=f.z;const next=world(p,side*.36,stride);f.toX=next[0];f.toZ=next[1];}
    const u=clamp((cycle-.48)/.52,0,1),s=u*u*(3-2*u),next=world(p,side*.36,stride);
    f.toX=approach(f.toX,next[0],dt,18);f.toZ=approach(f.toZ,next[1],dt,18);
    f.x=mix(f.fromX,f.toX,s);f.z=mix(f.fromZ,f.toZ,s);f.lift=Math.sin(Math.PI*u)*(.16+.25*this.weights.run);
   }
   f.stance=stance;f.initialized=true;
  }
  // A damped chain carries acceleration, turning and wind towards the free hem.
  const velocity=local({...p,x:0,z:0},p.vx||0,p.vz||0),ax=(velocity[0]-this.lastVelocity[0])/Math.max(dt,.01),az=(velocity[1]-this.lastVelocity[1])/Math.max(dt,.01);this.lastVelocity=velocity;
  for(let i=0;i<this.cape.length;i++){
   const n=this.cape[i],u=i/(this.cape.length-1),prev=this.cape[Math.max(0,i-1)];
   const tz=-u*(.10+.53*this.weights.run+.72*this.weights.dash+.55*this.weights.flight)+clamp(-az*.003,-.25,.25)*u;
   const tx=clamp(-velocity[0]*.027-ax*.0025,-.65,.65)*u;
   const kz=tz*.75+prev.z*.25,kx=tx*.75+prev.x*.25;
   n.vz+=(38*(kz-n.z)-9*n.vz)*dt;n.vx+=(36*(kx-n.x)-8*n.vx)*dt;n.z=clamp(n.z+n.vz*dt,-1.9,.35);n.x=clamp(n.x+n.vx*dt,-.9,.9);
  }
  this.frames++;
 }
 leg(p,side,hip,attack,terrain){
  const i=side<0?0:1,f=this.feet[i],w=this.weights;
  let x=side*.36,z=0,lift=0;
  if(f&&p.grounded&&!p.dashTime){[x,z]=local(p,f.x,f.z);x=clamp(x,side*.36-.48,side*.36+.48);z=clamp(z,-.90,.90);lift=f.lift;}
  const air=w.air,flight=w.flight,dash=w.dash;
  x=mix(x,side*(.34+.16*flight),air*.80);z=mix(z,side*.21+flight*.12,air*.85);
  z=mix(z,side===1?-.60:.37,dash*.82);
  x+=side*.13*attack;z+=side===1?-.20*attack:.16*attack;
  const q=world(p,x,z),offset=p.grounded?clamp(terrain(q[0],q[1])-p.y,-.34,.40):0;
  const ankle=[x,.18+offset+lift+air*.36+flight*.10+dash*.11,z];
  const solved=solveTwoBone(hip,ankle,[side*.12,0,1],.69,.64);
  this.legDiagnostics[i]={upper:len(sub(solved.joint,hip)),lower:len(sub(solved.tip,solved.joint)),planted:!!(f?.stance&&p.grounded&&!p.dashTime),clamped:solved.clamped};
  return solved;
 }
 cloth(t){const u=clamp(t,0,1)*(this.cape.length-1),i=Math.floor(u),j=Math.min(i+1,this.cape.length-1);return {x:mix(this.cape[i].x,this.cape[j].x,u-i),z:mix(this.cape[i].z,this.cape[j].z,u-i)};}
 status(){return {mode:this.mode,weights:{...this.weights},steps:this.steps,frames:this.frames,legs:this.legDiagnostics.map(x=>({...x})),cape:this.cape.map(n=>[n.x,n.z])};}
}
const api={HeroMotion,solveTwoBone,blendPose,world,local};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LandlordHeroRig=api;
})(globalThis);
