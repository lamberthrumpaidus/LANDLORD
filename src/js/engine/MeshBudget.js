/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
const cache=new Map(),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function sphereGrid(rings,sides){
 const key=rings+':'+sides;if(cache.has(key))return cache.get(key);
 const points=new Float32Array((rings+1)*(sides+1)*3);
 for(let j=0;j<=rings;j++){const v=j/rings*Math.PI,s=Math.sin(v),c=Math.cos(v);for(let i=0;i<=sides;i++){const u=i/sides*Math.PI*2,k=(j*(sides+1)+i)*3;points[k]=Math.cos(u)*s;points[k+1]=c;points[k+2]=Math.sin(u)*s;}}
 const faces=[];for(let j=0;j<rings;j++)for(let i=0;i<sides;i++){const a=j*(sides+1)+i,b=a+1,d=a+sides+1,c=d+1;if(j>0)faces.push(a,b,c);if(j<rings-1)faces.push(a,c,d);}
 const result={points,faces:new Uint16Array(faces)};cache.set(key,result);return result;
}
function detail(quality,distance,hero=false){
 if(hero)return quality==='low'?.65:quality==='balanced'?.8:1;
 const q=quality==='low'?.53:quality==='balanced'?.7:quality==='high'?.85:1;
 return q*(distance>42?.55:distance>24?.76:1);
}
function eligible(entity,player,planes,visible,{range=68,radius=4,height=7,shadow=18}={}){
 const dx=entity.x-player.x,dz=entity.z-player.z,dy=(entity.y||0)-(player.y||0);
 if(Math.abs(dx)>range||Math.abs(dz)>range||Math.abs(dy)>range+height)return false;
 if(!planes||Math.hypot(dx,dz)<shadow)return true;
 return visible({min:[entity.x-radius,(entity.y||0)-2,entity.z-radius],max:[entity.x+radius,(entity.y||0)+height,entity.z+radius]},planes);
}
const api={sphereGrid,detail,eligible};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LandlordMeshBudget=api;
})(globalThis);
