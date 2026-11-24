/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
const vertex=`#version 300 es
out vec2 uv;
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));uv=p;gl_Position=vec4(p*2.-1.,0.,1.);}`;
const header=`#version 300 es
precision highp float;
in vec2 uv;
out vec4 frag;
uniform sampler2D source;
`;
const extract=header+`
void main(){vec4 s=texture(source,uv);float l=max(max(s.r,s.g),s.b);
float knee=smoothstep(.57,.93,l);frag=vec4(s.rgb*knee*s.a,knee*s.a);}`;
const blur=header+`uniform vec2 axis;
void main(){vec4 v=texture(source,uv)*.227027;
v+=(texture(source,uv+axis*1.384615)+texture(source,uv-axis*1.384615))*.316216;
v+=(texture(source,uv+axis*3.230769)+texture(source,uv-axis*3.230769))*.070270;
frag=v;}`;
const composite=header+`uniform sampler2D glow;uniform float strength;uniform float grade;
uniform sampler2D sceneDepth;
uniform vec2 texel;
uniform float ao;
uniform vec4 portal;
float linearDepth(float z){return .3*270./(270.-z*(270.-.3));}
float contactAO(vec2 p,float center){
 float sum=0.;float radius=clamp(28./max(2.,center),1.5,7.);
 for(int i=0;i<8;i++){
  float a=float(i)*.785398;vec2 q=p+vec2(cos(a),sin(a))*texel*radius;
  float nearD=linearDepth(texture(sceneDepth,q).r);float delta=center-nearD;
  sum+=smoothstep(.04,.24,delta)*(1.-smoothstep(.6,2.5,delta));
 }
 return sum*.125;
}
void main(){vec4 s=texture(source,uv);vec3 b=texture(glow,uv).rgb*strength;
vec3 color=s.rgb;float luminance=dot(color,vec3(.2126,.7152,.0722));
color=mix(color,vec3(luminance),.09*grade);
color=mix(color,color*vec3(.91,1.02,1.08),.42*grade);
color=mix(color,color*vec3(1.06,1.015,.94),smoothstep(.4,.85,luminance)*.35*grade);
float vignette=1.-.12*grade*smoothstep(.23,.72,length(uv-.5));color*=vignette;
float depth=texture(sceneDepth,uv).r;
if(ao>0.&&depth<.9999)color*=1.-ao*contactAO(uv,linearDepth(depth));
if(portal.w>0.){
 vec2 ray=(portal.xy-uv)*.14;vec2 sampleUV=uv;float light=0.;
 for(int i=0;i<6;i++){sampleUV+=ray;vec3 sourceLight=texture(glow,sampleUV).rgb;light+=max(max(sourceLight.r,sourceLight.g),sourceLight.b)*(.13-float(i)*.012);}
 vec2 dp=(uv-portal.xy)*vec2(1.,1.35);
 float halo=exp(-dot(dp,dp)*24.);
 float occluded=step(portal.z-.006,texture(sceneDepth,portal.xy).r);
 b+=vec3(.45,.78,1.)*light*halo*occluded*portal.w;
}
float a=max(s.a,clamp(max(max(b.r,b.g),b.b),0.,1.));
frag=vec4(clamp(color*s.a+b,0.,1.),a);}`;
class CinematicPipeline{
 constructor(gl){
  this.gl=gl;this.frames=0;this.active=false;this.targets=null;this.error=null;
  if(typeof WebGL2RenderingContext==='undefined'||!(gl instanceof WebGL2RenderingContext))return;
  this.vao=gl.createVertexArray();
  this.programs={extract:this.program(extract),blur:this.program(blur),composite:this.program(composite)};
 }
 program(fragment){
  const g=this.gl;
  const shader=(type,src)=>{const s=g.createShader(type);g.shaderSource(s,src);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS)){const error=g.getShaderInfoLog(s);g.deleteShader(s);throw Error(error);}return s;};
  const v=shader(g.VERTEX_SHADER,vertex),f=shader(g.FRAGMENT_SHADER,fragment),p=g.createProgram();
  g.attachShader(p,v);g.attachShader(p,f);g.linkProgram(p);g.deleteShader(v);g.deleteShader(f);
  if(!g.getProgramParameter(p,g.LINK_STATUS)){const error=g.getProgramInfoLog(p);g.deleteProgram(p);throw Error(error);}
  return {p,source:g.getUniformLocation(p,'source'),axis:g.getUniformLocation(p,'axis'),glow:g.getUniformLocation(p,'glow'),strength:g.getUniformLocation(p,'strength'),grade:g.getUniformLocation(p,'grade'),depth:g.getUniformLocation(p,'sceneDepth'),texel:g.getUniformLocation(p,'texel'),ao:g.getUniformLocation(p,'ao'),portal:g.getUniformLocation(p,'portal')};
 }
 target(w,h,depth=false){
  const g=this.gl,tex=g.createTexture(),fb=g.createFramebuffer();
  g.bindTexture(g.TEXTURE_2D,tex);g.texImage2D(g.TEXTURE_2D,0,g.RGBA8,w,h,0,g.RGBA,g.UNSIGNED_BYTE,null);
  for(const p of [g.TEXTURE_MIN_FILTER,g.TEXTURE_MAG_FILTER])g.texParameteri(g.TEXTURE_2D,p,g.LINEAR);
  for(const p of [g.TEXTURE_WRAP_S,g.TEXTURE_WRAP_T])g.texParameteri(g.TEXTURE_2D,p,g.CLAMP_TO_EDGE);
  g.bindFramebuffer(g.FRAMEBUFFER,fb);g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,tex,0);
  let depthTex=null;if(depth){depthTex=g.createTexture();g.bindTexture(g.TEXTURE_2D,depthTex);g.texImage2D(g.TEXTURE_2D,0,g.DEPTH_COMPONENT24,w,h,0,g.DEPTH_COMPONENT,g.UNSIGNED_INT,null);for(const p of [g.TEXTURE_MIN_FILTER,g.TEXTURE_MAG_FILTER])g.texParameteri(g.TEXTURE_2D,p,g.NEAREST);for(const p of [g.TEXTURE_WRAP_S,g.TEXTURE_WRAP_T])g.texParameteri(g.TEXTURE_2D,p,g.CLAMP_TO_EDGE);g.framebufferTexture2D(g.FRAMEBUFFER,g.DEPTH_ATTACHMENT,g.TEXTURE_2D,depthTex,0);}
  if(g.checkFramebufferStatus(g.FRAMEBUFFER)!==g.FRAMEBUFFER_COMPLETE){g.deleteTexture(tex);g.deleteFramebuffer(fb);if(depthTex)g.deleteTexture(depthTex);throw Error('Cinematic framebuffer incomplete');}
  return {w,h,tex,fb,depthTex};
 }
 release(){if(!this.targets)return;const g=this.gl;for(const t of this.targets){g.deleteTexture(t.tex);g.deleteFramebuffer(t.fb);if(t.depthTex)g.deleteTexture(t.depthTex);}this.targets=null;}
 begin(w,h,quality){
  const g=this.gl;this.active=false;
  if(!this.programs||quality==='low'||this.error){if(this.targets)this.release();return false;}
  const divisor=quality==='cinematic'?2:quality==='high'?3:4,key=[w,h,divisor].join(':');
  if(key!==this.key||!this.targets){
   this.release();this.targets=[];
   try{this.targets.push(this.target(w,h,true));this.targets.push(this.target(Math.max(1,w/divisor|0),Math.max(1,h/divisor|0)));this.targets.push(this.target(Math.max(1,w/divisor|0),Math.max(1,h/divisor|0)));this.key=key;}
   catch(error){this.error=String(error);this.release();g.bindFramebuffer(g.FRAMEBUFFER,null);g.viewport(0,0,w,h);return false;}
  }
  this.active=true;this.quality=quality;this.portal=[0,0,1,0];g.bindFramebuffer(g.FRAMEBUFFER,this.targets[0].fb);g.viewport(0,0,w,h);return true;
 }
 pass(program,source,target,axis=null,glow=null){
  const g=this.gl,p=program;
  g.bindFramebuffer(g.FRAMEBUFFER,target?.fb||null);
  g.viewport(0,0,target?.w||this.targets[0].w,target?.h||this.targets[0].h);
  g.useProgram(p.p);g.activeTexture(g.TEXTURE2);g.bindTexture(g.TEXTURE_2D,source.tex);g.uniform1i(p.source,2);
  if(axis)g.uniform2f(p.axis,...axis);
  if(glow){g.activeTexture(g.TEXTURE3);g.bindTexture(g.TEXTURE_2D,glow.tex);g.uniform1i(p.glow,3);g.uniform1f(p.strength,this.quality==='cinematic'?.36:this.quality==='high'?.28:.20);g.uniform1f(p.grade,this.quality==='cinematic'?1:.7);g.activeTexture(g.TEXTURE6);g.bindTexture(g.TEXTURE_2D,this.targets[0].depthTex);g.uniform1i(p.depth,6);g.uniform2f(p.texel,1/source.w,1/source.h);g.uniform1f(p.ao,this.quality==='cinematic'?.32:this.quality==='high'?.22:0);g.uniform4fv(p.portal,this.portal);}
  g.drawArrays(g.TRIANGLES,0,3);
 }
 end(){
  if(!this.active)return 0;
  const g=this.gl,[scene,a,b]=this.targets,p=this.programs;
  g.disable(g.DEPTH_TEST);g.bindVertexArray(this.vao);
  try{this.pass(p.extract,scene,a);this.pass(p.blur,a,b,[1/a.w,0]);this.pass(p.blur,b,a,[0,1/a.h]);this.pass(p.composite,scene,null,null,a);this.frames++;}
  finally{g.bindVertexArray(null);g.bindFramebuffer(g.FRAMEBUFFER,null);g.viewport(0,0,scene.w,scene.h);g.enable(g.DEPTH_TEST);g.activeTexture(g.TEXTURE0);}
  return 4;
 }
 setPortal(world,matrix){if(!this.active||!world)return;const [x,y,z]=world,m=matrix,w=m[3]*x+m[7]*y+m[11]*z+m[15];if(w<=0)return;const u=(m[0]*x+m[4]*y+m[8]*z+m[12])/w*.5+.5,v=(m[1]*x+m[5]*y+m[9]*z+m[13])/w*.5+.5,depth=(m[2]*x+m[6]*y+m[10]*z+m[14])/w*.5+.5;if(u>0&&u<1&&v>0&&v<1&&depth>0&&depth<1)this.portal=[u,v,depth,this.quality==='cinematic'?.65:this.quality==='high'?.38:0];}
 status(){return {active:this.active,frames:this.frames,error:this.error,ambientOcclusion:this.active&&['high','cinematic'].includes(this.quality),portalShafts:this.active&&this.portal?.[3]>0,bloomResolution:this.targets?this.targets.slice(1,2).map(t=>[t.w,t.h])[0]:null};}
}
root.LandlordCinematicPipeline=CinematicPipeline;
})(globalThis);
