/* ALL Create by LamberthRumpaidus — LANDLORD Adaptive Cinematic Atmosphere */
(function(){
'use strict';
const world=document.getElementById('world');if(!world)return;
const fx=document.createElement('canvas');fx.id='landlordCinematicFx';fx.setAttribute('aria-hidden','true');
fx.style.cssText='position:fixed;inset:0;z-index:3;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen;';
const grain=document.getElementById('grain');if(grain)grain.parentNode.insertBefore(fx,grain);else document.body.appendChild(fx);
const ctx=fx.getContext('2d',{alpha:true,desynchronized:true});if(!ctx)return;
let w=innerWidth,h=innerHeight,scale=1,quality=1,time=0,frame=0,prev=performance.now(),avg=16,burst=.0;
let motes=[],sparks=[];
const mobile=matchMedia('(pointer:coarse)').matches;
function rnd(a,b){return a+Math.random()*(b-a)}
function resize(){
 w=innerWidth;h=innerHeight;scale=Math.min(devicePixelRatio||1,mobile?1.15:1.5);
 fx.width=Math.round(w*scale);fx.height=Math.round(h*scale);ctx.setTransform(scale,0,0,scale,0,0);
 motes=Array.from({length:mobile?24:54},()=>({x:rnd(0,w),y:rnd(0,h),r:rnd(1,3.6),a:rnd(.13,.45),vx:rnd(-.18,.18),vy:rnd(-.44,-.10),f:rnd(0,6.28)}));
}
addEventListener('resize',resize,{passive:true});resize();
function pulse(kind){
 if(kind==='fire'){burst=1;for(let i=0;i<12;i++)sparks.push({x:w*.5,y:h*.49,vx:rnd(-4,4),vy:rnd(-5,-.5),t:1,r:rnd(2,5)})}
 else if(kind==='dash'){for(let i=0;i<14;i++)sparks.push({x:rnd(0,w),y:rnd(h*.5,h*.9),vx:rnd(-4,4),vy:rnd(-3,0),t:.65,r:rnd(1,3)})}
 if(sparks.length>70)sparks.splice(0,sparks.length-70);
}
function trigger(type){if(window.Landlord3D?.getStatus?.().state==='playing')pulse(type)}
document.addEventListener('pointerdown',e=>{
 const a=e.target.closest?.('[data-mobile-action]')?.dataset.mobileAction;
 if(a==='fire'||a==='dash')trigger(a);
},{passive:true,capture:true});
document.addEventListener('keydown',e=>{
 if(e.repeat)return;const b=window.Landlord3D?.controls?.getBindings?.()||{};
 if(e.code===b.fire||e.code==='KeyF')trigger('fire');
 else if(e.code===b.dash||e.code==='ShiftLeft')trigger('dash');
},{passive:true});
function fog(){
 for(let i=0;i<(mobile?2:3);i++){
  const x=((w*.35+i*w*.34+Math.sin(time*.09+i)*w*.12)%(w*1.35))-w*.1;
  const y=h*(.72+i*.13)+Math.sin(time*.11+i)*24,rx=w*.48,ry=h*.19;
  ctx.save();ctx.translate(x,y);ctx.scale(1,ry/rx);
  const g=ctx.createRadialGradient(0,0,1,0,0,rx);
  g.addColorStop(0,'rgba(110,188,179,.09)');g.addColorStop(.5,'rgba(88,145,153,.025)');g.addColorStop(1,'rgba(88,145,153,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,rx,0,Math.PI*2);ctx.fill();ctx.restore();
 }
}
function rain(zone){
 if(zone!==3)return;
 ctx.strokeStyle='rgba(184,218,244,.14)';ctx.lineWidth=.75;ctx.beginPath();
 for(let i=0;i<(mobile?45:95);i++){
  const x=(i*167+time*160+i*i*13)%w,y=(i*109+time*300+i*i*7)%h;
  ctx.moveTo(x,y);ctx.lineTo(x-4,y+18);
 }
 ctx.stroke();
}
function loop(now){
 requestAnimationFrame(loop);
 const dt=Math.min(50,Math.max(0,now-prev));prev=now;avg=avg*.96+dt*.04;
 if(++frame%3===0&&mobile){if(avg>32)quality=.65;else if(avg<23)quality=1}
 const status=window.Landlord3D?.getStatus?.();
 if(status?.state!=='playing'){ctx.clearRect(0,0,w,h);return}
 ctx.clearRect(0,0,w,h);time+=dt/1000;fog();rain(status.zone);
 const max=Math.floor(motes.length*quality);
 for(let i=0;i<max;i++){
  const p=motes[i];p.x+=p.vx*dt/16;p.y+=p.vy*dt/16;
  if(p.y< -10){p.y=h+10;p.x=rnd(0,w)}if(p.x<0)p.x=w;else if(p.x>w)p.x=0;
  const op=Math.max(.03,p.a*(.8+Math.sin(time*2+p.f)*.2)),r=p.r*(1+.15*Math.sin(time+p.f));
  const grad=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*3.5);
  grad.addColorStop(0,'rgba(240,246,195,'+op+')');grad.addColorStop(.27,'rgba(179,233,210,'+(op*.32)+')');grad.addColorStop(1,'rgba(120,217,200,0)');
  ctx.fillStyle=grad;ctx.beginPath();ctx.arc(p.x,p.y,r*3.5,0,Math.PI*2);ctx.fill();
 }
 for(let i=sparks.length-1;i>=0;i--){
  const s=sparks[i];s.x+=s.vx*dt/16;s.y+=s.vy*dt/16;s.t-=dt/420;
  if(s.t<=0){sparks.splice(i,1);continue}
  ctx.fillStyle='rgba(255,193,106,'+Math.max(0,s.t)+')';ctx.beginPath();ctx.arc(s.x,s.y,s.r*s.t,0,Math.PI*2);ctx.fill();
 }
 if(burst>.001){burst*=Math.exp(-dt/180);
  const g=ctx.createRadialGradient(w*.5,h*.52,1,w*.5,h*.52,w*.32);
  g.addColorStop(0,'rgba(255,157,67,'+(burst*.18)+')');g.addColorStop(1,'rgba(255,157,67,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 }
}
requestAnimationFrame(loop);
window.LandlordVisualFX={pulse,get fpsEstimate(){return Math.round(1000/Math.max(avg,1))},get particles(){return motes.length}};
})();