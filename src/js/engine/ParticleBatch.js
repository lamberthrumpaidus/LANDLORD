/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
class ParticleBatch{
 constructor(gl){
  if(typeof WebGL2RenderingContext==='undefined'||!(gl instanceof WebGL2RenderingContext))throw Error('Instancing requires WebGL2');
  this.gl=gl;this.count=0;this.frames=0;this.capacity=256;this.data=new Float32Array(this.capacity*8);
  const vertex=`#version 300 es
 layout(location=0)in vec2 corner;layout(location=1)in vec4 centerSize;layout(location=2)in vec4 tint;
 uniform mat4 vp;uniform vec3 right;uniform vec3 up;out vec2 uv;out vec4 color;
 void main(){uv=corner;color=tint;vec3 p=centerSize.xyz+(right*corner.x+up*corner.y)*centerSize.w;gl_Position=vp*vec4(p,1.);}`;
  const fragment=`#version 300 es
 precision mediump float;in vec2 uv;in vec4 color;out vec4 frag;
 void main(){float r=dot(uv,uv);float a=(1.-smoothstep(.06,1.,r))*color.a;frag=vec4(color.rgb*a,a);}`;
  const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const v=compile(gl.VERTEX_SHADER,vertex),f=compile(gl.FRAGMENT_SHADER,fragment);
  this.program=gl.createProgram();gl.attachShader(this.program,v);gl.attachShader(this.program,f);gl.linkProgram(this.program);gl.deleteShader(v);gl.deleteShader(f);
  if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));
  this.vp=gl.getUniformLocation(this.program,'vp');this.right=gl.getUniformLocation(this.program,'right');this.up=gl.getUniformLocation(this.program,'up');
  this.vao=gl.createVertexArray();gl.bindVertexArray(this.vao);
  this.quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  this.instances=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.instances);gl.bufferData(gl.ARRAY_BUFFER,this.data.byteLength,gl.DYNAMIC_DRAW);
  for(let i=1;i<=2;i++){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,4,gl.FLOAT,false,32,(i-1)*16);gl.vertexAttribDivisor(i,1);}
  gl.bindVertexArray(null);
 }
 draw(items,player,quality,vp,camera){
  const g=this.gl,budget=quality==='low'?32:quality==='balanced'?72:quality==='high'?140:200;
  this.count=0;
  for(let i=items.length-1;i>=0&&this.count<budget;i--){
   const p=items[i];if(Math.abs(p.z-player.z)>62||Math.abs(p.x-player.x)>62)continue;
   const k=this.count++*8,life=Math.max(0,Math.min(1,p.life/(p.max||1)));
   this.data.set([p.x,p.y,p.z,Math.max(.04,p.size)*(1.2+life),...p.col,life*.8],k);
  }
  if(!this.count)return 0;
  g.bindVertexArray(this.vao);g.bindBuffer(g.ARRAY_BUFFER,this.instances);g.bufferSubData(g.ARRAY_BUFFER,0,this.data.subarray(0,this.count*8));
  g.useProgram(this.program);g.uniformMatrix4fv(this.vp,false,vp);g.uniform3fv(this.right,camera.right);g.uniform3fv(this.up,camera.up);
  g.enable(g.BLEND);g.blendFunc(g.ONE,g.ONE_MINUS_SRC_ALPHA);g.depthMask(false);
  try{g.drawArraysInstanced(g.TRIANGLES,0,6,this.count);this.frames++;}
  finally{g.depthMask(true);g.disable(g.BLEND);g.bindVertexArray(null);}
  return 1;
 }
}
root.LandlordParticleBatch=ParticleBatch;
})(globalThis);
