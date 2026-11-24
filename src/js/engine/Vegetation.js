/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
const palettes=[[.36,.43,.48],[.25,.66,.34],[.48,.40,.65],[.62,.29,.36],[.72,.35,.15],[.24,.64,.66],[.61,.25,.54]];
function field(index,len,road,height,hash){
 const cells=[];
 for(let row=0;row<Math.ceil(len/4);row++){
  const data=[];
  for(let k=0;k<104;k++){
   const seed=index*100000+row*151+k*17,z=index*len+row*4+hash(seed+1)*4;if(z>=(index+1)*len)continue;
   const s=k%2?1:-1,offset=8.9+Math.pow(hash(seed+2),1.8)*26,x=road(z)+s*offset;
   if(Math.abs(x)>77)continue;
   const y=height(x,z),h=.24+Math.pow(hash(seed+3),1.4)*(index===1?1.18:.87),angle=hash(seed+4)*6.2831853;
   data.push(x,y+.035,z,h,Math.cos(angle),Math.sin(angle),.65+hash(seed+5)*.65,hash(seed+6));
  }
  cells.push({z:index*len+row*4+2,data:new Float32Array(data)});
 }
 return cells;
}
class Vegetation{
 constructor(gl){
  if(typeof WebGL2RenderingContext==='undefined'||!(gl instanceof WebGL2RenderingContext))throw Error('WebGL2 required');
  this.gl=gl;this.capacity=4400;this.data=new Float32Array(this.capacity*8);this.count=0;this.frames=0;this.fields=[];
  const vertex=`#version 300 es
 layout(location=0)in vec3 shape;layout(location=1)in vec4 rootHeight;layout(location=2)in vec4 traits;
 uniform mat4 vp;uniform vec3 player;uniform vec3 camera;uniform float time;out vec3 world;out float t;out float variant;out float shade;
 void main(){float h=shape.y;vec2 axis=shape.z<.5?traits.xy:vec2(-traits.y,traits.x);vec2 across=vec2(-axis.y,axis.x);float wind=sin(time*1.8+rootHeight.x*.31+rootHeight.z*.24+traits.w*6.28);vec2 away=rootHeight.xz-player.xz;float nearHero=1.-smoothstep(.25,2.8,length(away));vec2 bend=vec2(.32*wind+.19,.13*cos(time*1.3+rootHeight.z*.2))*rootHeight.w+normalize(away+vec2(.0001))*nearHero*.85;vec2 q=rootHeight.xz+axis*shape.x*rootHeight.w*.18*traits.z+across*h*h*rootHeight.w*.19+bend*h*h;
 world=vec3(q.x,rootHeight.y+h*rootHeight.w,q.y);t=h;variant=traits.w;shade=traits.z;gl_Position=vp*vec4(world,1.);}`;
  const fragment=`#version 300 es
 precision mediump float;in vec3 world;in float t;in float variant;in float shade;uniform vec3 camera;uniform vec3 palette;uniform vec3 fog;out vec4 frag;
 void main(){vec3 base=palette*(.34+.88*t)*shade;float tip=smoothstep(.72,1.,t);base=mix(base, palette*1.27+vec3(.12,.08,.025),tip*.63);if(variant>.94)base=mix(base,vec3(.88,.69,.35),tip*.8);float f=1.-exp(-max(0.,distance(camera,world)-16.)*.013);frag=vec4(mix(base,fog,f),1.);}`;
  const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const v=compile(gl.VERTEX_SHADER,vertex),f=compile(gl.FRAGMENT_SHADER,fragment);this.program=gl.createProgram();gl.attachShader(this.program,v);gl.attachShader(this.program,f);gl.linkProgram(this.program);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));
  this.u=Object.fromEntries(['vp','player','camera','time','palette','fog'].map(k=>[k,gl.getUniformLocation(this.program,k)]));
  const verts=[];for(let k=0;k<2;k++)verts.push(-.55,0,k,.55,0,k,-.28,.52,k,.55,0,k,.28,.52,k,-.28,.52,k,-.28,.52,k,.28,.52,k,0,1,k);
  this.vertices=verts.length/3;this.vao=gl.createVertexArray();gl.bindVertexArray(this.vao);this.mesh=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.mesh);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
  this.instances=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.instances);gl.bufferData(gl.ARRAY_BUFFER,this.data.byteLength,gl.DYNAMIC_DRAW);for(let i=1;i<3;i++){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,4,gl.FLOAT,false,32,(i-1)*16);gl.vertexAttribDivisor(i,1);}gl.bindVertexArray(null);
 }
 initialize(len,road,height,hash){this.fields=Array.from({length:7},(_,i)=>field(i,len,road,height,hash));}
 draw(zone,player,quality,vp,eye,fog,time,budget){
  this.count=0;if(!budget||!this.fields[zone])return 0;
  const g=this.gl,range=quality==='cinematic'?84:quality==='high'?58:27,rows=this.fields[zone].filter(c=>Math.abs(c.z-player.z)<range).sort((a,b)=>Math.abs(a.z-player.z)-Math.abs(b.z-player.z)),step=quality==='cinematic'?1:quality==='high'?2:5;
  for(const cell of rows){for(let i=0;i<cell.data.length&&this.count<budget;i+=8*step){const x=cell.data[i],z=cell.data[i+2];if(Math.hypot(x-player.x,z-player.z)>range)continue;this.data.set(cell.data.subarray(i,i+8),this.count++*8);}if(this.count>=budget)break;}
  if(!this.count)return 0;
  g.bindVertexArray(this.vao);g.bindBuffer(g.ARRAY_BUFFER,this.instances);g.bufferSubData(g.ARRAY_BUFFER,0,this.data.subarray(0,this.count*8));g.useProgram(this.program);g.uniformMatrix4fv(this.u.vp,false,vp);g.uniform3f(this.u.player,player.x,player.y,player.z);g.uniform3fv(this.u.camera,eye);g.uniform1f(this.u.time,time);g.uniform3fv(this.u.palette,palettes[zone]);g.uniform3fv(this.u.fog,fog);g.drawArraysInstanced(g.TRIANGLES,0,this.vertices,this.count);g.bindVertexArray(null);this.frames++;return 1;
 }
}
const api={Vegetation,field};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LandlordVegetation=api;
})(globalThis);
