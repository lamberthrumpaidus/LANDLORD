/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
// Sweep a vertical capsule approximation in short increments and refine first contact.
function verticalSweep(from,to,ground,blocked){
 const target=Math.max(ground,to),delta=target-from;
 if(Math.abs(delta)<1e-8)return {y:target,contact:to<=ground?'ground':null};
 const steps=Math.max(1,Math.ceil(Math.abs(delta)/.16));
 let safe=from;
 for(let i=1;i<=steps;i++){
  const next=from+delta*i/steps;
  if(blocked(next)){let bad=next;for(let j=0;j<10;j++){const mid=(safe+bad)*.5;if(blocked(mid))bad=mid;else safe=mid;}
   return {y:safe,contact:delta>0?'ceiling':'surface'};
  }safe=next;
 }
 return {y:target,contact:to<=ground?'ground':null};
}
function verticalIntent({launch=0,rise=0,landing=false,drop=false,ascend=false,dash=0},dt){
 const descending=landing||drop;
 return {launch:descending?0:Math.max(0,launch-dt),rise:descending?0:Math.max(0,rise-dt),velocity:descending?Math.min(-24,-24+dash):Math.max(ascend||rise>0?24:0,launch>0?20:0)+dash};
}
const api={verticalSweep,verticalIntent};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LandlordFlightPhysics=api;
})(globalThis);
