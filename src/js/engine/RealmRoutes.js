/* ALL Create by LamberthRumpaidus */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LandlordRealmRoutes=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const routes=Object.freeze([
  {entry:.072,exit:.955,grid:[0,1]},
  {entry:.29,exit:.44,grid:[0,0]},
  {entry:.88,exit:.18,grid:[1,0]},
  {entry:.29,exit:.44,grid:[1,1]},
  {entry:.072,exit:.955,grid:[2,1]},
  {entry:.88,exit:.18,grid:[2,0]},
  {entry:.29,exit:.44,grid:[3,0]}
 ].map(r=>Object.freeze({...r,grid:Object.freeze(r.grid)})));
 const sideLinks=Object.freeze([2,3,5,1,6,4,0]);
 const valid=index=>Number.isInteger(index)&&index>=0&&index<routes.length;
 function point(index,kind,length,road){if(!valid(index)||!['entry','exit'].includes(kind))throw new RangeError('Invalid realm point');const z=(index+routes[index][kind])*length;return {x:road(z),z};}
 function entry(index,length,road){return point(index,'entry',length,road);}
 function exit(index,length,road){return point(index,'exit',length,road);}
 function next(index){return valid(index)&&index<routes.length-1?index+1:null;}
 function canEnter(player,gate,ground){return Math.hypot(player.x-gate.x,player.z-gate.z)<6.4&&Math.abs(player.y-ground)<8.5;}
 function direction(index,length,road){const a=entry(index,length,road),b=exit(index,length,road),dx=b.x-a.x,dz=b.z-a.z;return Math.abs(dx)>Math.abs(dz)?(dx<0?'right':'left'):(dz<0?'back':'forward');}
 return {routes,sideLinks,valid,entry,exit,next,canEnter,direction};
});
