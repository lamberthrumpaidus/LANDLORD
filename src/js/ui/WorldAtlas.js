/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
const projection=typeof module!=='undefined'&&module.exports?require('./MapProjection.js'):root.LandlordMapProjection;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
class Viewport{
 constructor(){this.x=0;this.z=18;this.zoom=1;this.yaw=0;}
 reset(x,z,yaw=this.yaw){this.x=x;this.z=z;this.zoom=1;this.yaw=yaw;}
 scale(h){return h/330*this.zoom;}
 pan(dx,dy,h){const s=this.scale(h),p=projection.unproject(dx/s,dy/s,this.yaw);this.x-=p.x;this.z-=p.z;}
 zoomAt(factor,x,y,w,h){const prev=this.scale(h),nx=clamp(this.zoom*factor,.35,3.8);this.zoom=nx;const next=this.scale(h);const p=projection.unproject((x-w*.5)*(1/prev-1/next),(y-h*.55)*(1/prev-1/next),this.yaw);this.x+=p.x;this.z+=p.z;}
 bound(end){this.x=clamp(this.x,-100,100);this.z=clamp(this.z,0,end);}
}
class Atlas{
 constructor(canvas,redraw,player,end,cameraYaw=()=>0){
  this.canvas=canvas;this.redraw=redraw;this.player=player;this.end=end;this.cameraYaw=cameraYaw;this.cameraUp=true;this.view=new Viewport();this.points=new Map();this.pending=false;
  const local=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/Math.max(1,r.width),y:(e.clientY-r.top)*canvas.height/Math.max(1,r.height)};};
  const shape=()=>{const a=[...this.points.values()];if(a.length<2)return a[0]?{...a[0],d:0}:null;return{x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2,d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};};
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);this.points.set(e.pointerId,local(e));canvas.classList.add('dragging');});
  canvas.addEventListener('pointermove',e=>{if(!this.points.has(e.pointerId))return;e.preventDefault();const before=shape();this.points.set(e.pointerId,local(e));const after=shape();if(!before||!after)return;this.view.pan(after.x-before.x,after.y-before.y,canvas.height);if(before.d>1&&after.d>1)this.view.zoomAt(after.d/before.d,after.x,after.y,canvas.width,canvas.height);this.changed();});
  const release=e=>{this.points.delete(e.pointerId);if(!this.points.size)canvas.classList.remove('dragging');};
  for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,release);
  canvas.addEventListener('wheel',e=>{e.preventDefault();const p=local(e);this.view.zoomAt(Math.exp(-clamp(e.deltaY,-500,500)*.0015),p.x,p.y,canvas.width,canvas.height);this.changed();},{passive:false});
  canvas.addEventListener('keydown',e=>{const k=e.key;let handled=true;if(k==='+'||k==='=')this.zoom(1.25);else if(k==='-')this.zoom(.8);else if(k==='Home')this.reset();else if(k==='ArrowLeft')this.view.pan(70,0,canvas.height);else if(k==='ArrowRight')this.view.pan(-70,0,canvas.height);else if(k==='ArrowUp')this.view.pan(0,70,canvas.height);else if(k==='ArrowDown')this.view.pan(0,-70,canvas.height);else handled=false;if(handled){e.preventDefault();this.changed();}});
  document.getElementById('atlasZoomIn').addEventListener('click',()=>this.zoom(1.25));
  document.getElementById('atlasZoomOut').addEventListener('click',()=>this.zoom(.8));
  document.getElementById('atlasCenter').addEventListener('click',()=>this.reset());
  document.getElementById('atlasOrientation').addEventListener('click',()=>{this.cameraUp=!this.cameraUp;this.view.yaw=this.cameraUp?this.cameraYaw():0;this.changed();});
 }
 zoom(f){this.view.zoomAt(f,this.canvas.width*.5,this.canvas.height*.55,this.canvas.width,this.canvas.height);this.changed();}
 reset(){const p=this.player();this.view.reset(p.x,p.z,this.cameraUp?this.cameraYaw():0);this.points.clear();this.changed();}
 changed(){this.view.bound(this.end);const button=document.getElementById('atlasOrientation');button.setAttribute('aria-pressed',String(this.cameraUp));button.textContent=this.cameraUp?'CAM':'N';button.title=this.cameraUp?'Camera up / Arah kamera':'North up / Utara';document.getElementById('atlasZoomValue').textContent=Math.round(this.view.zoom*100)+'%';if(this.pending)return;this.pending=true;requestAnimationFrame(()=>{this.pending=false;this.redraw();});}
 state(){return {x:this.view.x,z:this.view.z,zoom:this.view.zoom,yaw:this.view.yaw,cameraUp:this.cameraUp,contacts:this.points.size};}
}
if(typeof module!=='undefined'&&module.exports)module.exports={Viewport};else root.LandlordAtlas=Atlas;
})(globalThis);
