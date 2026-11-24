/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
function project(dx,dz,yaw=0){const s=Math.sin(yaw),c=Math.cos(yaw);return {x:-dx*c+dz*s,y:-dx*s-dz*c};}
function unproject(x,y,yaw=0){const s=Math.sin(yaw),c=Math.cos(yaw);return {x:-x*c-y*s,z:x*s-y*c};}
function heading(angle,yaw=0){return Math.atan2(Math.sin(yaw-angle),Math.cos(yaw-angle));}
function viewport(x,z,yaw,scale,cx,cy){return (wx,wz)=>{const p=project(wx-x,wz-z,yaw);return {x:cx+p.x*scale,y:cy+p.y*scale};};}
const api={project,unproject,heading,viewport};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LandlordMapProjection=api;
})(globalThis);
