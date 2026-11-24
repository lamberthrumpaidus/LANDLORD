/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
function clearSegment(a,b,blocked,r=.14){
 const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z;
 const count=Math.max(1,Math.ceil(Math.hypot(dx,dy,dz)/.35));
 for(let i=1;i<count;i++){const t=i/count;if(blocked(a.x+dx*t,a.y+dy*t,a.z+dz*t,r))return false;}
 return true;
}
function canStrike(a,b,{reach,vertical,arc,yaw,blocked=()=>false}){
 const dx=b.x-a.x,dz=b.z-a.z;
 if(Math.hypot(dx,dz)>reach||Math.abs(b.y-a.y)>vertical)return false;
 if(Math.hypot(dx,dz)>.001&&Math.abs(wrap(Math.atan2(dx,dz)-yaw))>arc)return false;
 return clearSegment({x:a.x,y:a.y+1.1,z:a.z},{x:b.x,y:b.y+1.1,z:b.z},blocked);
}
function inRange3D(a,b,horizontal,vertical){return Math.hypot(a.x-b.x,a.z-b.z)<=horizontal&&Math.abs(a.y-b.y)<=vertical;}
const api={canStrike,clearSegment,inRange3D};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LandlordCombatRules=api;
})(globalThis);
