/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
function partition(source,cell=32){
 if(!(source instanceof Float32Array)||source.length%30!==0||!Number.isFinite(cell)||cell<=0)throw new TypeError('Invalid triangle stream');
 const groups=new Map(),membership=[];
 for(let i=0;i<source.length;i+=30){
  const cx=(source[i]+source[i+10]+source[i+20])/3,cz=(source[i+2]+source[i+12]+source[i+22])/3;
  const key=Math.floor(cx/cell)+','+Math.floor(cz/cell);
  let g=groups.get(key);
  if(!g){g={count:0,first:0,cursor:0,min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};groups.set(key,g);}
  g.count+=3;membership.push(g);
  for(let v=0;v<30;v+=10)for(let j=0;j<3;j++){const x=source[i+v+j];g.min[j]=Math.min(g.min[j],x);g.max[j]=Math.max(g.max[j],x);}
 }
 let offset=0;
 for(const g of groups.values()){g.first=offset/10;g.cursor=offset;offset+=g.count*10;}
 const data=new Float32Array(source.length);
 for(let i=0,t=0;i<source.length;i+=30,t++){const g=membership[t];data.set(source.subarray(i,i+30),g.cursor);g.cursor+=30;}
 return {data,chunks:[...groups.values()].map(({first,count,min,max})=>({first,count,min,max}))};
}
function planes(m){
 return [[1,0],[-1,0],[1,1],[-1,1],[1,2],[-1,2]].map(([s,r])=>[m[3]+s*m[r],m[7]+s*m[4+r],m[11]+s*m[8+r],m[15]+s*m[12+r]]);
}
function visible(bounds,frustum){
 for(const [a,b,c,d] of frustum){if(a*(a>=0?bounds.max[0]:bounds.min[0])+b*(b>=0?bounds.max[1]:bounds.min[1])+c*(c>=0?bounds.max[2]:bounds.min[2])+d<0)return false;}
 return true;
}
const api={partition,planes,visible};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LandlordGeometry=api;
})(globalThis);
