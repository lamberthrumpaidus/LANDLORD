// Create by LamberthRumpaidus
let cinematicPipeline=null,materialLibrary=null,particleBatch=null;
function initRenderer(){
 try{gl=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'high-performance'})||canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'high-performance'});}catch{}
 if(!gl){mode='cpu';ctx=canvas.getContext('2d',{alpha:true});if(!ctx)throw Error('Canvas 2D unavailable');return;}
 try{
 const vertex=`attribute vec3 aPos;attribute vec3 aNormal;attribute vec3 aColor;attribute float aEmit;uniform mat4 uVP;uniform vec3 uCam;varying vec3 vColor;varying vec3 vNormal;varying float vFog;varying float vEm;varying vec3 vWorld;varying vec4 vShadow;uniform mat4 uShadowVP;
 void main(){vShadow=uShadowVP*vec4(aPos,1.);vColor=aColor;vNormal=aNormal;vEm=aEmit;vWorld=aPos;vFog=distance(aPos,uCam);gl_Position=uVP*vec4(aPos,1.0);}`;
 const fragment=`precision highp float;varying vec3 vColor;varying vec3 vNormal;varying float vFog;varying float vEm;varying vec3 vWorld;uniform vec3 uCam;uniform vec3 uFogColor;uniform vec3 uLight;uniform float uTime;uniform vec4 uTorch0;uniform vec4 uTorch1;uniform vec3 uTorchColor;uniform sampler2D uShadow;uniform float uShadows;uniform float uShadowTexel;uniform sampler2D uMossMap;uniform sampler2D uStoneMap;uniform float uMaterialDetail;uniform float uWorldSurface;varying vec4 vShadow;
 float hash3(vec3 p){p=fract(p*.1031);p+=dot(p,p.yxz+33.33);return fract((p.x+p.y)*p.z);}
 float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
 void main(){
  vec3 N=normalize(vNormal),V=normalize(uCam-vWorld),L=normalize(uLight),H=normalize(L+V);
  float micro=noise3(vWorld*2.15),tiny=noise3(vWorld*11.6),moss=noise3(vWorld*.25);
  float ground=smoothstep(.80,.96,N.y),bricks=abs(sin(vWorld.x*1.84+sin(vWorld.z*.76)*.1)*sin(vWorld.z*2.15));
  float fissure=1.0-smoothstep(.025,.13,abs(sin(vWorld.x*3.65+vWorld.z*.62)*sin(vWorld.z*4.23)));
  float wetness=smoothstep(.53,.9,noise3(vWorld*.53+vec3(7.,2.,0.)));
  float rough=(micro-.5)*.27+(tiny-.5)*.15-fissure*.085;
  float grunge=mix(1.,.74+.48*micro,ground);
  vec3 base=vColor*(.83+rough)*grunge;
  base=mix(base,base*vec3(.72,.79,.68),ground*max(0.,moss-.63)*.9);
  // World-space texture projections, blended by surface orientation.
  float textureTone=.5;
  if(uMaterialDetail>.5&&uWorldSurface>.5){
   vec3 weights=pow(abs(N),vec3(4.));weights/=max(.001,weights.x+weights.y+weights.z);
   vec3 stone=texture2D(uStoneMap,vWorld.zy*.24).rgb*weights.x+texture2D(uStoneMap,vWorld.xz*.24).rgb*weights.y+texture2D(uStoneMap,vWorld.xy*.24).rgb*weights.z;
   vec3 mossTex=texture2D(uMossMap,vWorld.xz*.20).rgb;
   textureTone=mix(dot(stone,vec3(.299,.587,.114)),dot(mossTex,vec3(.299,.587,.114)),ground*.75);
   base*=mix(.68,1.38,textureTone);
  }
  #if __VERSION__ >= 300
  vec3 px=dFdx(vWorld),py=dFdy(vWorld);
  vec3 rx=cross(py,N),ry=cross(N,px);
  float determinant=dot(px,rx);
  if(uMaterialDetail>.5&&uWorldSurface>.5&&abs(determinant)>.00001){
   vec3 gradient=sign(determinant)*(dFdx(textureTone)*rx+dFdy(textureTone)*ry);
   N=normalize(abs(determinant)*N-.075*gradient);
  }
  #endif
  float diffuse=max(0.,dot(N,L)),lambert=.15+.82*diffuse;
  float hemi=.17+.17*max(N.y,0.);
  // GGX microfacet specular with procedural roughness. No claim of authored PBR maps.
  float roughness=clamp(mix(.83,.33,wetness)*(ground*.18+.82)+(textureTone-.5)*.18,.22,.94),alpha=roughness*roughness,a2=alpha*alpha;
  float nh=max(.001,dot(N,H)),nv=max(.03,dot(N,V)),nl=max(.001,dot(N,L));
  float denom=nh*nh*(a2-1.)+1.;float distribution=a2/(3.14159*denom*denom);
  float k=pow(roughness+1.,2.)*.125;
  float geometry=nv/(nv*(1.-k)+k)*nl/(nl*(1.-k)+k);
  float fresnel=.04+.96*pow(1.-max(0.,dot(H,V)),5.);
  float spec=min(.28,distribution*geometry*fresnel/max(.01,4.*nv*nl)*nl)*(uWorldSurface>.5?.46:.90);
  float edgeLight=pow(1.-abs(dot(N,V)),5.)*.095;
  float rim=pow(max(0.,1.-dot(N,V)),3.2)*.18;
  float visibility=1.;
  if(uShadows>.5){
    vec3 sc=vShadow.xyz/max(.0001,vShadow.w);sc=sc*.5+.5;
    if(sc.x>.003&&sc.x<.997&&sc.y>.003&&sc.y<.997&&sc.z>.001&&sc.z<.997){
      float bias=.0015+(.0045*(1.-diffuse));
      float occluded=0.;
      for(int xx=-1;xx<=1;xx++)for(int yy=-1;yy<=1;yy++){
        float nearest=texture2D(uShadow,sc.xy+vec2(float(xx),float(yy))*uShadowTexel).r;
        occluded+=step(nearest+bias,sc.z);
      }
      visibility=1.-occluded/9.*.69;
    }
  }
  // Banded rock strata, fine wet mineral reflections and low-slope moss deposits.
  float strata=smoothstep(.4,.95,noise3(vec3(vWorld.x*.34,vWorld.y*2.7,vWorld.z*.30)));
  float cracks=1.-smoothstep(.015,.07,abs(sin(vWorld.x*3.7)*cos(vWorld.z*3.6)));
  float lichen=smoothstep(.60,.86,noise3(vWorld*.88+vec3(12.,5.,23.)));
  base*=mix(1.,.89,clamp(cracks*.13+strata*.12,0.,1.));
  base=mix(base,base*vec3(.59,.82,.66),lichen*ground*.20);
  vec3 color=base*(lambert*visibility+hemi+rim+edgeLight)+vec3(1.,.84,.64)*spec*visibility;
  // Local lantern radiance: two nearest lanterns, smooth squared attenuation.
  float torch0=pow(max(0.,1.-distance(vWorld,uTorch0.xyz)/max(1.,uTorch0.w)),2.0);
  float torch1=pow(max(0.,1.-distance(vWorld,uTorch1.xyz)/max(1.,uTorch1.w)),2.0);
  float warm=(torch0+torch1)*(0.91+0.09*sin(uTime*7.+vWorld.z*1.7));
  color+=base*uTorchColor*warm*.85;
  // Glossy highlights on wet exposed stone; kept subtle to avoid plastic appearance.
  float facing=pow(1.-max(0.,dot(N,V)),3.);
  color+=vec3(.24,.34,.35)*wetness*ground*facing*.19;
  // Subtle directional mineral sheen, biome materials stay differentiated.
  float mineral=smoothstep(.77,.96,noise3(vWorld*4.1+vec3(17.)));
  color+=base*mineral*.065*(.45+.55*visibility);
  float flame=1.+sin(uTime*4.2+vWorld.x*2.1+vWorld.z)*.09;
  color+=vColor*vEm*2.2*flame;
  float fog=1.-exp(-max(0.,vFog-25.)*.0085);
  fog=clamp(fog+max(0.,vWorld.y-13.)*.002,0.,.84);
  color=mix(color,uFogColor*vec3(1.12,1.06,1.01),fog);
  // ACES-filmic-inspired tonemap, retaining metal highlights and atmosphere.
  color=max(color,vec3(0.))*.86;color=(color*(2.51*color+.03))/(color*(2.43*color+.59)+.14);
  color=pow(clamp(color,0.,1.),vec3(.87));
  gl_FragColor=vec4(color,1.0);
 }`;
 let p=gl.createProgram();gl.attachShader(p,compileShader(gl.VERTEX_SHADER,vertex));gl.attachShader(p,compileShader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Program: '+gl.getProgramInfoLog(p));glP=p;
 gl.useProgram(p);indexLocations={pos:gl.getAttribLocation(p,'aPos'),normal:gl.getAttribLocation(p,'aNormal'),color:gl.getAttribLocation(p,'aColor'),emit:gl.getAttribLocation(p,'aEmit'),vp:gl.getUniformLocation(p,'uVP'),cam:gl.getUniformLocation(p,'uCam'),fog:gl.getUniformLocation(p,'uFogColor'),light:gl.getUniformLocation(p,'uLight'),time:gl.getUniformLocation(p,'uTime'),torch0:gl.getUniformLocation(p,'uTorch0'),torch1:gl.getUniformLocation(p,'uTorch1'),torchColor:gl.getUniformLocation(p,'uTorchColor'),sVP:gl.getUniformLocation(p,'uShadowVP'),shadow:gl.getUniformLocation(p,'uShadow'),shadows:gl.getUniformLocation(p,'uShadows'),shadowTexel:gl.getUniformLocation(p,'uShadowTexel'),mossMap:gl.getUniformLocation(p,'uMossMap'),stoneMap:gl.getUniformLocation(p,'uStoneMap'),materialDetail:gl.getUniformLocation(p,'uMaterialDetail'),worldSurface:gl.getUniformLocation(p,'uWorldSurface')};
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
 vbo=gl.createBuffer();
 try{materialLibrary=new LandlordMaterialLibrary(gl);}catch(ex){console.warn('Material fallback',ex);}
 try{particleBatch=new LandlordParticleBatch(gl);}catch(ex){console.warn('Particle instancing fallback',ex);}
 try{cinematicPipeline=new LandlordCinematicPipeline(gl);}catch(ex){console.warn('Postprocessing fallback',ex);}
 try{initShadows()}catch(ex){console.warn('Shadow mapping unsupported',ex);shadowState=null;}
 }catch(e){console.warn('WebGL shader failed; falling back to software-3D',e);mode='cpu';gl=null;const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);canvas=replacement;ctx=canvas.getContext('2d',{alpha:true});if(!ctx){throw e}}
}
function uploadStatics(){if(!gl)return;for(const b of staticBuffers)if(b?.buffer)gl.deleteBuffer(b.buffer);staticBuffers=[];
 // Build colliders for all seven realms, but only allocate GPU buffers near the player.
 for(let j=0;j<7;j++){const {data,chunks}=LandlordGeometry.partition(groundMesh(j));staticBuffers.push({data,chunks,buffer:null,count:data.length/10,lastUsed:0});}
}
let gpuStamp=0;
function ensureGpuRealm(index){
 const r=staticBuffers[index];if(!r||!gl)return null;
 r.lastUsed=++gpuStamp;
 if(!r.buffer){r.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,r.buffer);gl.bufferData(gl.ARRAY_BUFFER,r.data,gl.STATIC_DRAW);}
 let allocated=staticBuffers.filter(b=>b&&b.buffer);
 if(allocated.length>3){for(const old of allocated.sort((a,b)=>a.lastUsed-b.lastUsed)){
   if(allocated.length<=3)break;
   if(old===r||Math.abs(staticBuffers.indexOf(old)-zoneOf(player.z))<=1)continue;
   gl.deleteBuffer(old.buffer);old.buffer=null;allocated=allocated.filter(b=>b!==old);
 }}return r;
}
function bindData(buffer){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const s=40,a=indexLocations;for(const [loc,sz,ofs] of [[a.pos,3,0],[a.normal,3,12],[a.color,3,24],[a.emit,1,36]]){if(loc<0)continue;gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,sz,gl.FLOAT,false,s,ofs)}}
function perspective(fov,aspect,near,far){let f=1/Math.tan(fov/2),r=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*r,-1,0,0,2*far*near*r,0])}
function lookAt(eye,target){let z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1])}
function multiply(a,b){let r=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r}

function ortho(l,r,b,t,n,f){return new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1])}
function initShadows(){
 if(!gl||!(gl instanceof WebGL2RenderingContext))return;
 if(quality==='low')return;
 const sz=Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE),quality==='cinematic'?2048:quality==='high'?1024:512);
 const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,sz,sz,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,tex,0);
 gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);
 if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE){gl.bindFramebuffer(gl.FRAMEBUFFER,null);throw Error('Depth framebuffer incomplete')}
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);
 const shader=(type,source)=>compileShader(type,source);
 const vert=`attribute vec3 aPos;uniform mat4 uLightVP;void main(){gl_Position=uLightVP*vec4(aPos,1.0);}`;
 const frag=`precision highp float;void main(){gl_FragColor=vec4(1.0);}`;
 const prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vert));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(prog);
 if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error('Shadow link: '+gl.getProgramInfoLog(prog));
 shadowState={tex,fb,sz,prog,pos:gl.getAttribLocation(prog,'aPos'),vp:gl.getUniformLocation(prog,'uLightVP')};
}
let appliedShadowQuality=quality;
function syncShadowQuality(){
 if(!gl||appliedShadowQuality===quality)return;
 appliedShadowQuality=quality;
 if(shadowState){gl.deleteTexture(shadowState.tex);gl.deleteFramebuffer(shadowState.fb);gl.deleteProgram(shadowState.prog);}
 shadowState=null;shadowMatrix=null;shadowTick=0;
 try{initShadows()}catch(ex){console.warn('Shadow quality fallback',ex);}
}
function paintShadowMap(dynamicData){
 if(!shadowState||quality==='low')return;
 // Rotate the shadow volume around the hero; only nearby objects need cast shadows.
 const target=[player.x,player.y+2.5,player.z+17],sun=[target[0]-32,target[1]+58,target[2]+29];
 shadowMatrix=multiply(ortho(-57,57,-57,57,1,180),lookAt(sun,target));
 let ss=shadowState;
 gl.bindFramebuffer(gl.FRAMEBUFFER,ss.fb);gl.viewport(0,0,ss.sz,ss.sz);gl.clear(gl.DEPTH_BUFFER_BIT);
 gl.colorMask(false,false,false,false);gl.useProgram(ss.prog);gl.uniformMatrix4fv(ss.vp,false,shadowMatrix);
 // Position is the first attribute with 40-byte vertex stride.
 const draw=(buf,n,chunks=null)=>{gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(ss.pos);gl.vertexAttribPointer(ss.pos,3,gl.FLOAT,false,40,0);if(chunks){const frustum=LandlordGeometry.planes(shadowMatrix);for(const chunk of chunks){if(LandlordGeometry.visible(chunk,frustum)){gl.drawArrays(gl.TRIANGLES,chunk.first,chunk.count);drawCalls++;}}}else{gl.drawArrays(gl.TRIANGLES,0,n);drawCalls++;}};
 const z=zoneOf(player.z);for(let j=Math.max(0,z-1);j<=Math.min(6,z+1);j++){const o=ensureGpuRealm(j);if(o)draw(o.buffer,o.count,o.chunks)}
 gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,dynamicData,gl.DYNAMIC_DRAW);draw(vbo,dynamicData.length/10);
 gl.colorMask(true,true,true,true);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height);
}

let lastViewportW=0,lastViewportH=0,adaptiveFactor=1;
function resize(){syncShadowQuality();res=quality==='cinematic'?Math.max(1.1,Math.min(1.75,(devicePixelRatio||1)*1.16)):quality==='high'?Math.min(devicePixelRatio||1,1.45):quality==='balanced'?Math.min(devicePixelRatio||1,1.0):.65;
 res=Math.min(res,(innerWidth*innerHeight>1250000?1.05:2))*adaptiveFactor;
 let w=Math.max(2,Math.round(innerWidth*res)),h=Math.max(2,Math.round(innerHeight*res));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}if(gl&&(lastViewportW!==w||lastViewportH!==h)){gl.viewport(0,0,w,h);lastViewportW=w;lastViewportH=h}}
let cpuMeshes=[];
function rebuild(){solidCells.clear();solidCount=0;if(gl)uploadStatics();else cpuMeshes=regions.map((_,i)=>groundMesh(i));resolveDiscoveries();initializeBreakables();}
let game={state:'title',time:0,played:0,zone:0,prevZone:-1,seals:new Array(7).fill(false),bosses:new Array(7).fill(false),essence:0,kills:0,checkpoint:18,checkpointX:0,missionEnd:false,autosave:0,quality,relics:new Array(7).fill(false),visited:[true,false,false,false,false,false,false],explored:Array.from({length:7},()=>[]),flying:false,secretFlight:false};
const player={x:0,z:18,y:0,vy:0,vx:0,vz:0,grounded:true,hp:100,maxHp:100,mp:100,angle:0,move:0,gait:0,motion:0,lean:0,turn:0,footPhase:0,roll:0,dashTime:0,dashCooldown:0,dashVX:0,dashVZ:0,dashVY:0,dashSerial:0,attackTime:0,attackCooldown:0,attackHitReady:false,combo:0,comboTime:0,attackDuration:.62,attackClock:0,attackQueued:false,hitPause:0,cameraKick:0,swordTip:null,swordBase:null,swordTrail:[],lastSwordStamp:-99,fireCooldown:0,fireCast:0,pulseCooldown:0,invuln:0,keys:0,stamina:1,landPulse:0,flightLaunch:0,coyote:0,jumpBuffer:0,counterReady:0,footstepCooldown:0};
let wildlife=[];
function spawnWildlife(){wildlife=[];for(let zone=0;zone<7;zone++){
 for(let k=0;k<4;k++){let z=zone*LEN+LEN*(.11+k*.235),x=roadCenter(z)+(k%2===0?-1:1)*(10+hash(zone*83+k*31)*8);
 wildlife.push({kind:zone===2?'crawler':'wolf',zone,x,z,y:height(x,z),homeX:x,homeZ:z,angle:0,phase:hash(zone*97+k)*6.28,hp:64,hit:0,cooldown:0,attackAnim:0,dead:false,speed:2.8+zone*.2});}
 for(let k=0;k<6;k++){let z=zone*LEN+LEN*(.075+k*.155),x=roadCenter(z)+(k%2===0?-1:1)*(15+hash(zone*14+k)*10);
 wildlife.push({kind:'bat',zone,x,z,y:height(x,z)+5+hash(zone*47+k)*4,homeX:x,homeZ:z,phase:hash(zone*98+k)*6.28,angle:0,hp:42,maxHp:42,hit:0,dead:false});}
 for(let k=0;k<2;k++){
  const z=zone*LEN+LEN*(.29+k*.38),x=roadCenter(z)+(k?42:-42);
  wildlife.push({kind:'stag',zone,x,z,y:height(x,z),homeX:x,homeZ:z,angle:0,phase:hash(zone*91+k)*TAU,hp:95,hit:0,cooldown:0,attackAnim:0,dead:false,speed:3.7});
 }
}}
let viewMode='tpp';function toggleView(){viewMode=viewMode==='tpp'?'fpp':'tpp';cameraReady=false;const b=document.querySelector('.btn-view');if(b){const next=viewMode==='fpp'?'T':'F';b.querySelector('span').textContent=next;b.setAttribute('aria-label',next==='T'?'Beralih ke TPP':'Beralih ke FPP');}document.body.dataset.view=viewMode;}
let enemies=[],particles=[],pickups=[],attacks=[],elapsed=0,lastFrame=0,fps=60,orbit=0,orbitPitch=.27,camEye=[0,13,-21],camFocus=[0,1,0],cameraBasis=null,cameraAnchor=[0,0,8],cameraReady=false,toaster=0,splashTime=0,nearShrine=-1,finalVictory=false,animatedTime=0;
function makeEnemy(zone,i,boss=false){let zz=zone*LEN+(boss?LEN*BOSS_LOCAL:LEN*(i<5?[.14,.27,.41,.65,.77][i]:.10+(i-5)*.105)),xx=roadCenter(zz)+(boss?0:(hash(i*5+zone*21)*2-1)*(i<5?12:20));if(i===3)xx=roadCenter(zz)+9;
 let type=boss?'boss':regions[zone].enemy;
 return {x:xx,z:zz,y:height(xx,zz),zone,boss,type,radius:boss?3.3:1.1,maxHp:boss?160+zone*47:35+zone*9,hp:boss?160+zone*47:35+zone*9,attack:0,hit:0,dead:false,phase:hash(zone*41+i)*6.28,angle:Math.PI,dir:1,speed:boss?2.4+zone*.15:3.1+zone*.19,homeX:xx,homeZ:zz,stagger:0,windup:0,projectileCD:2+hash(i+zone)*3,knockVX:0,knockVZ:0,hitRecoil:0,animation:hash(i+zone*9)*TAU,spawn:0};}
function spawnEnemies(){enemies=[];for(let j=0;j<7;j++){for(let i=0;i<12;i++)enemies.push(makeEnemy(j,i));enemies.push(makeEnemy(j,0,true));}applySavedBosses()}
function applySavedBosses(){for(let e of enemies)if(e.boss&&game.bosses[e.zone])e.dead=true;}
// Optional discoveries are never prerequisites for reaching the final gate.
const cacheSpots=[],energyShards=[],healingWells=[],riftTraps=[];
for(let j=0;j<7;j++){
 for(let k=0;k<3;k++){
  const z=j*LEN+LEN*[.18,.44,.76][k],side=((j+k)%2?1:-1);
  cacheSpots.push({zone:j,x:roadCenter(z)+side*(36+hash(j*7+k)*12),z,id:j*3+k,seed:j*71+k*17});
 }
 for(let k=0;k<4;k++){
  const z=j*LEN+LEN*[.24,.37,.60,.88][k],side=k%2?-1:1;
  energyShards.push({zone:j,x:roadCenter(z)+side*(19+hash(j*23+k)*7),z,id:j*4+k});
 }
 const hz=j*LEN+LEN*.55;healingWells.push({zone:j,x:roadCenter(hz)+(j%2?1:-1)*34,z:hz});
 for(let k=0;k<2;k++){
  const z=j*LEN+LEN*[.35,.72][k];riftTraps.push({zone:j,x:roadCenter(z)+(k%2?1:-1)*(16+j%3*3),z,id:j*2+k,phase:hash(j*11+k)*TAU});
 }
}
let chestTaken=new Array(21).fill(false),shardTaken=new Array(28).fill(false);
// V3-inspired physically destructible supply crates. They are independent of the existing caches.
let breakables=[];
function initializeBreakables(){
 breakables=[];
 for(let zone=0;zone<7;zone++)for(let k=0;k<5;k++){
  const z=zone*LEN+LEN*(.13+k*.17),side=(k+zone)%2?1:-1;
  let x=roadCenter(z)+side*(23+hash(zone*47+k*19)*14);
  // Keep the crates out of existing road structures, altars and guardian arenas.
  for(let attempt=0;attempt<10&&blocking(x,z,2.0,height(x,z),3);attempt++)x+=side*3.4;
  x=clamp(x,-66,66);
  const item={id:zone*5+k,zone,x,z,y:height(x,z),hp:60,dead:false,kind:k===4?'relic':'crate'};
  item.solid={kind:'box',x,z,w:1.32,d:1.26,c:1,s:0,minY:item.y-.15,maxY:item.y+2.6,active:true,breakableId:item.id};
  registerSolid(item.solid,2.1);breakables.push(item);
 }
}
function resetBreakables(){for(const b of breakables){b.hp=60;b.dead=false;b.solid.active=true}}
function strikeBreakableById(id,damage=60){
 const b=breakables[id];if(!b||b.dead)return false;
 b.hp-=damage;burst(b.x,b.y+1.15,b.z,b.kind==='relic'?[.38,.92,1]:[.86,.57,.27],12,.38);
 if(b.hp>0){pulseSfx(195,.065,'triangle',.012);return true;}
 b.dead=true;b.solid.active=false;
 game.essence+=b.kind==='relic'?42:14;
 player.mp=Math.min(100,player.mp+(b.kind==='relic'?22:8));
 for(let i=0;i<5;i++){
  const ang=hash(b.id*97+i*11)*TAU,speed=2+hash(b.id*31+i*5)*6;
  debris.push({x:b.x,y:b.y+1.25,z:b.z,vx:Math.cos(ang)*speed,vy:4+hash(i*21+b.id)*4,vz:Math.sin(ang)*speed,life:1.2+hash(i*12+b.id)*.8,col:b.kind==='relic'?[.3,.86,1]:[.55,.30,.16],rot:hash(i+b.id)*TAU});
 }
 burst(b.x,b.y+1.35,b.z,b.kind==='relic'?[.34,.86,1]:[1,.64,.32],36,1.1);
 pulseSfx(115,.2,'sawtooth',.022);
 showToast(language==='id'?'✦ PETI DIHANCURKAN':'✦ CRATE DESTROYED',.9);save();return true;
}
function damageNearbyBreakables(x,z,radius,damage){
 let hits=0;for(const b of breakables)if(!b.dead&&Math.hypot(b.x-x,b.z-z)<radius){strikeBreakableById(b.id,damage);hits++}return hits;
}
let debris=[];

let healCooldown=0,riftCooldown=0,discoveryClock=0,dodgeRewardTimer=0;
function resolveDiscoveries(){
 // Adjust collectible points away from physical props after static meshes and colliders are generated.
 for(const q of [...cacheSpots,...energyShards,...healingWells,...riftTraps]){
  for(let trial=0;trial<10&&blocking(q.x,q.z,.8);trial++){
    const delta=(trial%2?1:-1)*(3+trial*1.3);q.x=clamp(roadCenter(q.z)+delta+(q.x-roadCenter(q.z)), -72,72);
  }
 }
}
function updateDiscoveries(dt){
 healCooldown=Math.max(0,healCooldown-dt);riftCooldown=Math.max(0,riftCooldown-dt);
 dodgeRewardTimer=Math.max(0,dodgeRewardTimer-dt);
 for(const q of cacheSpots){if(q.zone!==game.zone||chestTaken[q.id])continue;
  if(Math.hypot(player.x-q.x,player.z-q.z)<3.3&&(!game.flying||player.y-height(q.x,q.z)<5)){
   chestTaken[q.id]=true;game.essence+=35+8*q.zone;
   player.hp=Math.min(player.maxHp,player.hp+14);player.mp=Math.min(100,player.mp+22);
   burst(q.x,height(q.x,q.z)+1.3,q.z,regions[q.zone].accent,42,1.4);
   pulseSfx(620,.26,'triangle',.035);showToast('✦ '+(language==='id'?'PETI RAHASIA':'HIDDEN CACHE'),1.1);save();
  }
 }
 for(const q of energyShards){if(q.zone!==game.zone||shardTaken[q.id])continue;
  if(Math.hypot(player.x-q.x,player.z-q.z)<2.6&&(!game.flying||player.y-height(q.x,q.z)<5)){
   shardTaken[q.id]=true;game.essence+=12;player.mp=Math.min(100,player.mp+22);
   burst(q.x,height(q.x,q.z)+1.5,q.z,[.45,.95,1],25,1.2);pulseSfx(920,.16,'sine',.022);save();
  }
 }
 for(const q of healingWells){if(q.zone!==game.zone||healCooldown>0)continue;
  if(Math.hypot(player.x-q.x,player.z-q.z)<5&&player.hp<player.maxHp){
   player.hp=Math.min(player.maxHp,player.hp+22);healCooldown=4;
   burst(q.x,height(q.x,q.z)+1.2,q.z,[.38,1,.73],28,.7);
   showToast('✦ '+(language==='id'?'PULIH':'HEALED'),.8);
  }
 }
 for(const q of riftTraps){if(q.zone!==game.zone||riftCooldown>0||game.flying&&player.y-height(q.x,q.z)>4)continue;
  const active=Math.sin(clock*2.4+q.phase)>.44;
  if(active&&Math.hypot(player.x-q.x,player.z-q.z)<3.9){
   riftCooldown=1.5;takeHit(9+2*q.zone);burst(q.x,height(q.x,q.z)+.4,q.z,[1,.19,.42],14,.5);
  }
 }
}
function discoveryMesh(mesh){
 for(const q of cacheSpots){if(q.zone!==game.zone||chestTaken[q.id]||Math.abs(q.z-player.z)>67)continue;
  let y=height(q.x,q.z),m=new Mesh(q.x,y,q.z),c=regions[q.zone];
  m.box(0,.45,0,2.3,.88,1.45,tint(c.stone,.54));m.box(0,.99,0,2.45,.28,1.55,tint(c.accent,.62),.13);
  m.box(0,.59,.76,.34,.55,.11,tint(c.accent,1.2),.9);m.spike(0,1.2+Math.sin(clock*2.4+q.seed)*.15,0,.4,.88,c.accent,.85);
  m.ring(0,.07,0,2.45,.09,c.accent,.4);appendVertices(mesh.d,m.d);
 }
 for(const q of energyShards){if(q.zone!==game.zone||shardTaken[q.id]||Math.abs(q.z-player.z)>66)continue;
  let y=height(q.x,q.z),m=new Mesh(q.x,y,q.z);m.spike(0,1+Math.sin(clock*2.5+q.id)*.24,0,.48,1.65,[.4,.93,1],1.6);
  m.ring(0,.12,0,1.25,.08,[.4,.86,1],.5);appendVertices(mesh.d,m.d);
 }
 for(const q of healingWells){if(q.zone!==game.zone||Math.abs(q.z-player.z)>69)continue;
  let y=height(q.x,q.z),m=new Mesh(q.x,y,q.z);
  for(let k=0;k<3;k++)m.ring(0,.13+k*.16,0,4.4-k*.55,.14,[.25,.75,.56],.32);
  m.spike(0,.38+Math.sin(clock*1.7)*.15,0,.9,3.3,[.37,.99,.72],.85);appendVertices(mesh.d,m.d);
 }
 for(const q of riftTraps){if(q.zone!==game.zone||Math.abs(q.z-player.z)>66)continue;
  let y=height(q.x,q.z),m=new Mesh(q.x,y,q.z),active=Math.sin(clock*2.4+q.phase)>.44;
  m.ring(0,.10,0,3.6,.37,active?[1,.19,.37]:[.36,.18,.26],active?1.7:.18);
  for(let i=0;i<5;i++){let a=i*TAU/5+clock*.1;m.spike(Math.cos(a)*2.2,.11,Math.sin(a)*2.2,.17,active?.86:.35,[.66,.23,.42],active?.8:.18)}
  appendVertices(mesh.d,m.d);
 }
 // Lost souls drift around side paths. They illuminate, rather than reveal, nearby caches.
 for(let i=0;i<15;i++){
  let z=game.zone*LEN+LEN*(.08+hash(game.zone*13+i*9)*.84);
  if(Math.abs(z-player.z)>58)continue;
  let x=roadCenter(z)+(i%2?-1:1)*(29+hash(i*27+game.zone)*20);
  let m=new Mesh(),y=height(x,z)+3+Math.sin(clock*1.4+i)*1.2,xx=x+Math.sin(clock*.9+i*2)*2.7,zz=z+Math.cos(clock*.7+i*3)*2.0;
  m.sphere(xx,y,zz,.27,[.48,.9,1],3,6,1.7);appendVertices(mesh.d,m.d);
 }
}
function save(){try{localStorage.setItem('landlord-openrealms-save-v1',JSON.stringify({seals:game.seals,bosses:game.bosses,essence:game.essence,kills:game.kills,z:player.z,x:player.x,checkpoint:game.checkpoint,checkpointX:game.checkpointX,missionEnd:game.missionEnd,finishedGate:game.missionEnd,mapLength:LEN,relics:game.relics,visited:game.visited,explored:game.explored,chests:chestTaken,shards:shardTaken,brokenCrates:breakables.map(b=>b.dead)}))}catch{}}
function load(){let x;try{x=JSON.parse(localStorage.getItem('landlord-openrealms-save-v1')||'null')}catch{}if(!x||!Array.isArray(x.seals)||x.seals.length!==7)return false;
 game.seals=x.seals.map(Boolean);game.bosses=(x.bosses?.length===7?x.bosses:new Array(7).fill(false)).map(Boolean);game.essence=Number(x.essence)||0;game.kills=Number(x.kills)||0;game.checkpoint=Number(x.checkpoint)||6;game.checkpointX=Number(x.checkpointX)||0;game.missionEnd=x.finishedGate===true;game.relics=(Array.isArray(x.relics)&&x.relics.length===7?x.relics:new Array(7).fill(false)).map(Boolean);
 chestTaken=(Array.isArray(x.chests)&&x.chests.length===21?x.chests:new Array(21).fill(false)).map(Boolean);
 shardTaken=(Array.isArray(x.shards)&&x.shards.length===28?x.shards:new Array(28).fill(false)).map(Boolean);
 resetBreakables();if(Array.isArray(x.brokenCrates))breakables.forEach((b,i)=>{if(x.brokenCrates[i]){b.dead=true;b.hp=0;b.solid.active=false}});
 const lengthRatio=LEN/(Number(x.mapLength)||180);
 game.visited=(Array.isArray(x.visited)&&x.visited.length===7?x.visited:new Array(7).fill(false)).map(Boolean);
 game.explored=(Array.isArray(x.explored)&&x.explored.length===7?x.explored:Array.from({length:7},()=>[])).map(a=>Array.isArray(a)?a.slice(-320).map(p=>Array.isArray(p)?[Number(p[0])||0,(Number(p[1])||0)*lengthRatio]:[0,0]):[]);
 game.flying=false;game.secretFlight=false;
 player.z=clamp((Number(x.z)||18)*lengthRatio,3,END-5);
 player.x=clamp(Number(x.x)||roadCenter(player.z),-79,79);
 game.checkpoint=clamp(game.checkpoint*lengthRatio,3,END-5);
 game.checkpointX=roadCenter(game.checkpoint);
game.visited[zoneOf(player.z)]=true;return true}
function newGame(){currentFireLock=null;fireLockWindow=0;attacks=[];resetBreakables();debris.length=0;game.postWin=false;chestTaken.fill(false);shardTaken.fill(false);healCooldown=riftCooldown=0;altarHold=0;altarZone=-1;game.seals.fill(false);game.bosses.fill(false);game.essence=0;game.kills=0;game.checkpoint=18;game.checkpointX=roadCenter(18);game.missionEnd=false;game.relics.fill(false);finalVictory=false;player.z=18;player.x=roadCenter(player.z);player.maxHp=100;player.hp=100;player.mp=100;game.visited=[true,false,false,false,false,false,false];game.explored=Array.from({length:7},()=>[]);game.flying=false;game.secretFlight=false;jumpTimes=[];sidePortalHold=0;sidePortalCooldown=0;player.vy=0;player.vx=player.vz=0;player.gait=player.motion=player.lean=player.landPulse=player.flightLaunch=0;player.grounded=true;player.coyote=0;player.jumpBuffer=0;player.counterReady=0;damagePopups.length=0;player.angle=0;player.attackTime=0;player.attackClock=0;player.comboTime=0;player.combo=0;player.attackQueued=false;player.swordTrail=[];player.hitPause=0;cameraReady=false;orbit=0;viewMode='tpp';document.body.dataset.view='tpp';const vb=document.querySelector('.btn-view');if(vb)vb.querySelector('span').textContent='F';save();spawnEnemies();spawnWildlife();start()}
function fromSave(){currentFireLock=null;fireLockWindow=0;attacks=[];if(!load())return newGame();finalVictory=game.missionEnd;player.maxHp=100+(powerLevel()-1)*14;player.hp=player.maxHp;player.mp=100;player.vx=player.vz=0;player.attackTime=0;player.attackQueued=false;player.coyote=0;player.jumpBuffer=0;player.counterReady=0;damagePopups.length=0;player.swordTrail=[];player.landPulse=0;cameraReady=false;game.flying=false;spawnEnemies();spawnWildlife();start()}
function openMenu(title=false){$('victoryOverlay').hidden=true;player.attackQueued=false;game.state=title?'title':'pause';menuContext=title?'title':'pause';ui.overlay.classList.remove('off');ui.hud.classList.add('hidden');$('target').classList.add('hide');$('play').hidden=!title;ui.resume.hidden=!!title;ui.restart.hidden=true;showMenuPanel();hideTouchControls();if(document.pointerLockElement)document.exitPointerLock?.();}
function start(){if(game.missionEnd){finishGame(true);return;}game.state='playing';settingsOpen=false;ui.overlay.classList.add('off');ui.hud.classList.remove('hidden');$('target').classList.remove('hide');ui.map.classList.remove('visible');lastFrame=0;zoneChanged(true);if(isTouchDevice())revealTouchControls(2700);else hideTouchControls();markExplored();refreshSkills();}
function resume(){start()}
function showToast(text,seconds=2.6){ui.toast.textContent=text;toaster=seconds;ui.toast.classList.add('show')}
function portalFlash(){const veil=$('portalVeil');if(!veil)return;veil.classList.remove('flash');void veil.offsetWidth;veil.classList.add('flash');pulseSfx(470,.28,'sine',.038)}
function zoneChanged(force=false){let z=zoneOf(player.z);if(force||z!==game.prevZone){game.prevZone=z;game.zone=z;game.visited[z]=true;ui.title.textContent=regions[z].name;ui.chapter.textContent=String(z+1).padStart(2,'0');ui.splash.querySelector('.name').textContent=regions[z].name;ui.splash.querySelector('.sub').textContent=regions[z].subtitle.toUpperCase();ui.splash.classList.add('visible');splashTime=1.65;let c=regions[z];$('sky').style.background=`radial-gradient(ellipse at 72% 37%,rgb(${c.accent.map(v=>Math.round(v*80+12)).join(' ')}) 0%,rgb(${c.fog.map(v=>Math.round(v*130)).join(' ')}) 38%,rgb(${c.bg.map(v=>Math.round(v*95)).join(' ')}) 76%,#050a12 100%)`;save();}}
function updateUI(){ui.hp.style.width=clamp(player.hp/player.maxHp*100,0,100)+'%';ui.mp.style.width=clamp(player.mp,0,100)+'%';ui.hpText.textContent=Math.ceil(player.hp)+'/'+player.maxHp;ui.mpText.textContent=Math.floor(player.mp)+'/100';ui.essence.textContent=game.essence;ui.seals.textContent=game.seals.filter(Boolean).length;if($('relics'))$('relics').textContent=game.relics.filter(Boolean).length;$('level').textContent=powerLevel();
 const z=game.zone;
 let quest=game.missionEnd?'MENANG':z===6?'Temukan gerbang akhir':'Cari gerbang atau portal berikutnya';
 ui.quest.textContent=quest;
 refreshSkills();
 ui.boss.style.display='none';let boss=enemies.find(e=>e.boss&&e.zone===z&&!e.dead&&distance(player,e)<28);if(boss){ui.boss.style.display='block';ui.bossName.textContent=regions[z].guardian;ui.bossFill.style.width=clamp(boss.hp/boss.maxHp*100,0,100)+'%'}
 const rp=relicPos(z),isRelic=!game.relics[z]&&Math.hypot(player.x-rp[0],player.z-rp[1])<5;document.querySelector('.btn-interact')?.classList.toggle('near-relic',isRelic);ui.interaction.classList.toggle('show',isRelic);
 if(isRelic)ui.interaction.textContent='✦ '+(language==='id'?'RELIK OTOMATIS':'AUTO RELIC');
 else if(nearShrine>=0)ui.interaction.textContent=(language==='id'?'BERDIRI 2 DETIK':'STAND FOR 2 SECONDS');
 const charge=$('altarCharge'),circle=$('altarProgress'),label=$('altarCountdown');
 const visible=nearShrine>=0&&!game.seals[nearShrine];
 charge.classList.toggle('visible',visible);
 if(visible){circle.style.strokeDashoffset=String(213.63*(1-clamp(altarHold/2,0,1)));label.textContent=(2-altarHold).toFixed(1)+'s';} 
}
function pulseSfx(freq=400,dur=.14,type='sine',vol=.035){try{const ac=audioContext();if(!ac)return;let osc=ac.createOscillator(),gn=ac.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,ac.currentTime);osc.frequency.exponentialRampToValueAtTime(Math.max(70,freq*.35),ac.currentTime+dur);gn.gain.setValueAtTime(vol,ac.currentTime);gn.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+dur);osc.connect(gn).connect(window.LandlordAudio?.output?.()||ac.destination);osc.start();osc.stop(ac.currentTime+dur+.01)}catch{}}
let audio=null;function audioContext(){if(window.LandlordAudio?.context)return window.LandlordAudio.context();if(audio)return audio;let A=window.AudioContext||window.webkitAudioContext;if(!A)return null;audio=new A();return audio}
function burst(x,y,z,col,num=16,power=1){const budget=quality==='low'?70:quality==='balanced'?130:quality==='high'?200:280;num=Math.max(1,Math.round(num*(quality==='low'?.42:quality==='balanced'?.68:1)*adaptiveFactor));for(let i=0;i<num;i++){
 let a=hash(i*31+clock*3)*TAU,spin=hash(i*71+clock*17),v=(2+spin*5)*power;
 particles.push({x,y,z,vx:Math.cos(a)*v,vy:hash(i*13+clock*29)*5*power+1,vz:Math.sin(a)*v,life:.6+hash(i*41)*.8,max:1.4,col,size:.06+hash(i*19)*.13});}
 if(particles.length>budget)particles.splice(0,particles.length-budget)}
function getInput(){
 // Keyboard, gesture and controller all mean CAMERA-RELATIVE SCREEN DIRECTIONS.
 // Crucial: the renderer looks toward +Z at yaw 0, so SCREEN RIGHT is world -X.
 let x=(keySet.has(keybinds.right)?1:0)-(keySet.has(keybinds.left)?1:0);
 let z=(keySet.has(keybinds.forward)?1:0)-(keySet.has(keybinds.back)?1:0);
 if(touchMove.active){x+=touchMove.x;z+=touchMove.y}
 let pad=navigator.getGamepads?.()?.[0];if(pad){let ax=Math.abs(pad.axes[0])>.13?pad.axes[0]:0,az=Math.abs(pad.axes[1])>.13?-pad.axes[1]:0;x+=ax;z+=az}
 let amount=Math.min(1,Math.hypot(x,z));if(amount>.001){let len=Math.hypot(x,z);x=x/len*amount;z=z/len*amount}
 return {x,z,walking:amount>.12,amount};
}
function cameraMove(input,yaw=orbit){
 // Camera's ground-plane forward = (sin yaw, cos yaw).
 // Actual screen-right basis is (-cos yaw, sin yaw); using +cos mirrored A/D.
 const sy=Math.sin(yaw),cy=Math.cos(yaw);
 return {x:input.z*sy-input.x*cy,z:input.z*cy+input.x*sy};
}
function shortestTurn(current,target){return Math.atan2(Math.sin(target-current),Math.cos(target-current))}
// LANDLORD VI — keyframed 3-hit combat system. Every move has anticipation, contact and follow-through.
const COMBOS=[
 {name:'CRESCENT CUT',duration:.38,hit:.47,reach:5.0,power:1,active:[.30,.77],color:[.37,.80,1]},
 {name:'RETURNING FANG',duration:.41,hit:.46,reach:5.15,power:1.14,active:[.30,.77],color:[.68,.59,1]},
 {name:'ECLIPSE BREAKER',duration:.50,hit:.51,reach:5.75,power:1.55,active:[.34,.80],color:[1,.74,.43]}
];
const IDLE_FRAME={t:0,hand:[1.04,1.71,.47],blade:[.06,.45,1],twist:0,crouch:0,lunge:0};
// These are cinematic pose curves, not procedural sin-wave hand rotations.
const STRIKE_KEYS=[
 [
 {...IDLE_FRAME,t:0},
 {t:.18,hand:[1.50,2.31,-.40],blade:[.86,.83,-.38],twist:-.52,crouch:.12,lunge:-.13},
 {t:.35,hand:[1.56,2.45,.35],blade:[1.35,.29,.73],twist:-.68,crouch:.22,lunge:.22},
 {t:.57,hand:[-.08,1.87,1.58],blade:[-.93,-.08,1.16],twist:.64,crouch:.23,lunge:.62},
 {t:.75,hand:[-.55,1.44,1.00],blade:[-1.03,-.34,.42],twist:.64,crouch:.11,lunge:.30},
 {...IDLE_FRAME,t:1}
 ],
 [
 {...IDLE_FRAME,t:0},
 {t:.19,hand:[-.58,1.39,-.25],blade:[-.82,-.55,-.30],twist:.56,crouch:.21,lunge:-.06},
 {t:.36,hand:[-.87,1.48,.60],blade:[-1.10,.04,.89],twist:.72,crouch:.25,lunge:.32},
 {t:.55,hand:[1.47,2.25,1.36],blade:[1.03,.51,1.12],twist:-.65,crouch:.24,lunge:.63},
 {t:.78,hand:[1.42,2.51,.62],blade:[.84,.98,.18],twist:-.48,crouch:.10,lunge:.32},
 {...IDLE_FRAME,t:1}
 ],
 [
 {...IDLE_FRAME,t:0},
 {t:.18,hand:[1.22,2.87,-.53],blade:[.08,1.36,-.23],twist:-.26,crouch:.22,lunge:-.23},
 {t:.39,hand:[.51,3.41,.14],blade:[-.08,1.48,.41],twist:.06,crouch:.36,lunge:.04},
 {t:.60,hand:[.14,1.82,2.05],blade:[-.19,-1.07,.91],twist:.22,crouch:.46,lunge:.83},
 {t:.80,hand:[.24,.88,1.29],blade:[.18,-.91,.62],twist:.16,crouch:.20,lunge:.39},
 {...IDLE_FRAME,t:1}
 ]
];
function catmull(a,b,c,d,t){return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)}
function sampleAttackPose(p){
 const idle={hand:[...IDLE_FRAME.hand],blade:[...IDLE_FRAME.blade],twist:0,crouch:0,lunge:0,progress:0,active:0};
 if(p.attackTime<=0)return idle;
 const seq=STRIKE_KEYS[p.combo],u=clamp(1-p.attackTime/p.attackDuration,0,1);
 let i=0;while(i<seq.length-2&&u>seq[i+1].t)i++;
 const k0=seq[Math.max(0,i-1)],k1=seq[i],k2=seq[i+1],k3=seq[Math.min(i+2,seq.length-1)],t=clamp((u-k1.t)/(k2.t-k1.t),0,1);
 const val=(field,j=-1)=>catmull(j<0?k0[field]:k0[field][j],j<0?k1[field]:k1[field][j],j<0?k2[field]:k2[field][j],j<0?k3[field]:k3[field][j],t);
 const active=COMBOS[p.combo].active,s=(u-active[0])/(active[1]-active[0]);
 return {hand:[0,1,2].map(j=>val('hand',j)),blade:norm([0,1,2].map(j=>val('blade',j))),twist:val('twist'),crouch:val('crouch'),lunge:val('lunge'),progress:u,active:u>=active[0]&&u<=active[1]?Math.pow(Math.sin(Math.PI*s),.45):0};
}
let hitFlashes=[];
let damagePopups=[];
let gameplayStats={perfectDodges:0,enemyHits:0,enemyKills:0,bufferedJumps:0};
function damagePopup(entity,amount,kind='enemy'){
 if(!entity||!Number.isFinite(amount))return;
 // Limit transient feedback objects to keep mobile drawing predictable.
 const y=entity.y+(kind==='player'?2.7:(entity.boss?5.6:entity.kind==='bat'?.5:3.2));
 damagePopups.push({x:entity.x+(Math.random()-.5)*.35,y,z:entity.z,value:String(Math.max(1,Math.round(amount))),t:0,life:.68,kind});
 if(damagePopups.length>32)damagePopups.splice(0,damagePopups.length-32);
}
function drawCombatReadability(f){
 if(game.state!=='playing')return;
 const playerDist=40;
 f.save();f.textAlign='center';f.textBaseline='middle';
 // Health bars are shown only when a monster has taken damage and is near the camera.
 for(const e of enemies){
  if(e.dead||e.zone!==game.zone||e.hp>=e.maxHp||Math.abs(e.z-player.z)>playerDist)continue;
  const p=projectAtmos(e.x,e.y+(e.boss?6.5:3.6),e.z);if(!p||p.depth>65)continue;
  const w=e.boss?58:38,h=4;
  f.fillStyle='rgba(2,7,13,.76)';f.fillRect(p.x-w/2-1,p.y-1,w+2,h+2);
  f.fillStyle=e.boss?'#f9a16f':'#f2c78a';f.fillRect(p.x-w/2,p.y,w*clamp(e.hp/e.maxHp,0,1),h);
 }
 // Red telegraph arcs indicate the exact strike countdown; no textual overlays.
 for(const e of enemies){
  if(e.dead||e.windup<=0||Math.abs(e.z-player.z)>28)continue;
  const p=projectAtmos(e.x,e.y+.18,e.z);if(!p)continue;
  const progress=clamp(1-e.windup/(e.boss?.96:.57),0,1),r=e.boss?31:18;
  f.lineWidth=e.boss?3.5:2.5;
  f.strokeStyle=`rgba(255,83,65,${(.45+.45*progress).toFixed(3)})`;
  f.beginPath();f.ellipse(p.x,p.y,r,r*.42,0,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);f.stroke();
 }
 for(const p of damagePopups){
  const screen=projectAtmos(p.x,p.y+p.t*1.65,p.z);if(!screen)continue;
  const alpha=clamp(p.life/.68,0,1);
  f.font='800 15px system-ui,sans-serif';f.lineWidth=3;
  f.strokeStyle=`rgba(6,9,16,${alpha*.9})`;f.fillStyle=p.kind==='player'?`rgba(255,95,79,${alpha})`:`rgba(255,225,159,${alpha})`;
  f.strokeText(p.value,screen.x,screen.y);f.fillText(p.value,screen.x,screen.y);
 }
 f.restore();
}

// Buffered, filtered air-swish audio follows blade speed, without external sound files.
function swordWhoosh(index){
 try{
   const ac=audioContext();if(!ac||ac.state==='suspended')return;
   const spec=COMBOS[index],duration=.30,frames=Math.round(ac.sampleRate*duration);
   const noise=ac.createBuffer(1,frames,ac.sampleRate),samples=noise.getChannelData(0);
   let prev=0;for(let i=0;i<frames;i++){prev=.48*prev+.52*(Math.random()*2-1);samples[i]=prev;}
   const src=ac.createBufferSource();src.buffer=noise;
   const filter=ac.createBiquadFilter();filter.type='bandpass';filter.frequency.value=index===2?510:760+index*160;filter.Q.value=.66;
   const gain=ac.createGain(),start=ac.currentTime+.004;
   gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(index===2?.14:.10,start+.038);
   gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
   src.connect(filter).connect(gain).connect(window.LandlordAudio?.output?.()||ac.destination);src.start(start);src.stop(start+duration+.01);
 }catch{}
}
function startAttack(index){
 const spec=COMBOS[index];player.combo=index;player.attackDuration=spec.duration;player.attackTime=spec.duration;player.attackClock=0;player.attackHitReady=true;player.attackQueued=false;
 player.comboTime=.90;player.attackCooldown=0;player.attackBuffer=0;player.swordTrail=[];
 player.cameraKick=Math.max(player.cameraKick,.025);player.lastSwordStamp=-1;
 pulseSfx(index===2?190:155+index*38,.16,index===2?'sawtooth':'triangle',.038);swordWhoosh(index);
 ldx.parryT=.24;ldx.noise=Math.max(ldx.noise,16);if(ldx.fireBuff>0)ldx.flameSlash();
 const tag=$('comboTag');tag.textContent=index===2?'✦ FINISHER':'✦ '+(index+1)+'/3';tag.classList.add('show');
}
function doAttack(){
 if(game.state!=='playing')return;
 if(player.attackTime>0){
  if(!player.attackHitReady&&player.attackClock>player.attackDuration*.76){startAttack((player.combo+1)%3);return;}
  player.attackQueued=true;player.attackBuffer=.42;return;
 }
 startAttack(player.comboTime>0?(player.combo+1)%3:0);
}
function meleeLineClear(target){
 const dx=target.x-player.x,dz=target.z-player.z,dy=(target.y??player.y)-player.y;
 if(Math.abs(dy)>(target.boss?4.2:2.7))return false;
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.45));
 for(let i=1;i<steps;i++){const t=i/steps;if(blocking(player.x+dx*t,player.z+dz*t,.14,player.y+1+dy*t,.3))return false;}
 return true;
}
function resolveMelee(){
 let hit=false,closest=null,nearest=999;
 for(const e of enemies){
   if(e.dead||e.zone!==game.zone)continue;
   const dist=distance(player,e),angle=Math.atan2(e.x-player.x,e.z-player.z),off=Math.abs(shortestTurn(player.angle,angle));
   const spec=COMBOS[player.combo],reach=spec.reach+(e.boss?1.0:0);
   if(dist<reach+e.radius*.24&&off<(player.combo===2?1.1:1.40)&&meleeLineClear(e)){
     let power=(23+game.seals.filter(Boolean).length*2.2+(powerLevel()-1)*3)*spec.power;
     if(player.counterReady>0)power*=1.75;
     damageEnemy(e,power);hit=true;
     const impulse=e.boss?3.2:8.0;e.knockVX+=Math.sin(angle)*impulse;e.knockVZ+=Math.cos(angle)*impulse;
     e.hitRecoil=player.combo===2?.53:.38;
     e.stagger=Math.max(e.stagger,player.combo===2?.83:.43);
     if(dist<nearest){nearest=dist;closest=e;}
   }
 }
 for(const beast of wildlife){
   if(beast.dead||beast.kind==='bat'||beast.zone!==game.zone)continue;
   const dd=distance(player,beast),ang=Math.atan2(beast.x-player.x,beast.z-player.z);
   if(dd<COMBOS[player.combo].reach+1.3&&Math.abs(shortestTurn(player.angle,ang))<1.35&&meleeLineClear(beast)){
     const raw=(23+powerLevel()*4)*COMBOS[player.combo].power*(player.counterReady>0?1.75:1);
     beast.hp-=raw;damagePopup(beast,raw);beast.hit=.45;hit=true;
     burst(beast.x,beast.y+.8,beast.z,[.84,.14,.37],18,.42);
     if(beast.hp<=0){beast.dead=true;game.essence+=18;}
   }
 }
 damageNearbyBreakables(player.x+Math.sin(player.angle)*2.8,player.z+Math.cos(player.angle)*2.8,2.9,(player.combo===2?65:35));
 if(hit&&closest){
   if(player.counterReady>0){player.counterReady=0;burst(player.x,player.y+1.2,player.z,[.4,1,.83],20,.7);}
   let e=closest,accent=COMBOS[player.combo].color;
   burst(e.x,e.y+1.9,e.z,accent,player.combo===2?48:29,player.combo===2?2.0:1.2);
   hitFlashes.push({x:e.x,y:e.y+2.0,z:e.z,life:.28,max:.28,combo:player.combo});
   player.hitPause=player.combo===2?.055:.034;player.cameraKick=player.combo===2?.26:.15;
   impactDirection=[e.x-player.x,e.z-player.z];
   shake=Math.max(shake,player.combo===2?.41:.23);
   pulseSfx(player.combo===2?95:130,.19,'sawtooth',.065);
 } else if(hit){
   shake=Math.max(shake,.17);player.cameraKick=.12;player.hitPause=.026;
 } else if(player.swordTip){
   let tip=player.swordTip;burst(tip[0],tip[1],tip[2],[.48,.78,1],6,.11);
 }
}
function damageEnemy(e,n){if(e.dead)return;window.dispatchEvent(new CustomEvent('landlord:impact',{detail:{kind:'hit',x:e.x,y:e.y+1.5,z:e.z,boss:!!e.boss}}));gameplayStats.enemyHits++;damagePopup(e,n);e.hp-=n;e.hit=.23;e.stagger=.23;burst(e.x,e.y+1.6,e.z,regions[e.zone].accent,e.boss?25:10,.6);pulseSfx(650,.09,'triangle',.022);
 if(e.hp<=0&&!e.dead){e.dead=true;game.kills++;gameplayStats.enemyKills++;let val=e.boss?80:12;game.essence+=val;for(let i=0;i<(e.boss?14:4);i++){pickups.push({x:e.x+(hash(i*2+clock)*2-1)*2,z:e.z+(hash(i*8+clock)*2-1)*2,y:e.y+.4,life:24,value:e.boss?6:2,phase:i});}
 burst(e.x,e.y+1.8,e.z,regions[e.zone].accent,e.boss?70:28,2.3);
 if(e.boss){game.bosses[e.zone]=true;showToast(T('boss'),1.8);save()}else if(game.kills%4===0)showToast(T('essence'),1.1);
 }}
function skillUnlocked(name){return true} // Checkpoints are respawn points, never ability or story gates.
function refreshSkills(){for(const name of ['dash','fire']){let b=document.querySelector('.btn-'+name);if(b)b.hidden=!skillUnlocked(name);}

 document.body.classList.toggle('is-flying',game.flying);
 const descendButton=document.querySelector('.btn-descend');if(descendButton)descendButton.hidden=!game.flying;
 const arrow=$('flightGuide');if(arrow){arrow.hidden=!game.flying;if(game.flying){const goal=portalPoint(6),angle=Math.atan2(goal.x-player.x,goal.z-player.z)-orbit;arrow.querySelector('.flight-arrow').style.transform='rotate('+angle+'rad)';arrow.querySelector('.flight-distance').textContent=Math.round(Math.hypot(goal.x-player.x,goal.z-player.z))+'m';}}}
function checkVictory(){
 // Only touching the terminal gateway in world VII ends the game. Bosses and checkpoints are optional.
 if(game.state!=='playing'||game.missionEnd||game.postWin)return false;
 const exit=portalPoint(6);
 const within=Math.hypot(player.x-exit.x,player.z-exit.z)<7.0;
 if(zoneOf(player.z)===6&&within&&player.z>=exit.z-5.2){finishGame(false);return true;}
 return false;
}
function finishGame(fromSave=false){
 game.missionEnd=true;finalVictory=true;game.state='won';player.vx=player.vz=0;game.flying=false;
 $('victoryOverlay').hidden=false;ui.overlay.classList.add('off');ui.hud.classList.add('hidden');
 ui.map.classList.remove('visible');hideTouchControls();document.body.classList.remove('is-flying');
 $('victoryText').textContent=language==='id'?'MENANG':'VICTORY';
 $('victoryRestart').textContent=language==='id'?'MAIN LAGI':'PLAY AGAIN';
 $('victoryMenu').textContent=language==='id'?'MENU':'MENU';ldx.ending();
 if(document.pointerLockElement===canvas)document.exitPointerLock?.();
 if(!fromSave){const gate=portalPoint(6);burst(gate.x,height(gate.x,gate.z)+5,gate.z,[.65,1,.85],120,2.8);shake=.7;pulseSfx(920,.8,'triangle',.09);save()}
}
function activateFlight(){game.flying=!game.flying;game.secretFlight=true;
 if(game.flying){player.y=Math.max(player.y,height(player.x,player.z)+2.6);player.flightLaunch=.65;player.vy=0;player.grounded=false;showToast(language==='id'?'MODE TERBANG':'FLIGHT MODE',1.6)}
 else {player.flightLaunch=0;}
 refreshSkills();}
let jumpTimes=[];
function doDash(){
 if(game.state!=='playing')return false;
 player.hitPause=0;const input=getInput();let dir=cameraMove(input);
 if(!input.walking){dir={x:Math.sin(orbit),z:Math.cos(orbit)}}
 const length=Math.hypot(dir.x,dir.z)||1;
 player.dashVX=dir.x/length;player.dashVZ=dir.z/length;
 // Flight burst follows the camera and can angle up/down with the view or altitude buttons.
 player.dashVY=game.flying?clamp((.32-orbitPitch)*27,-11,14):0;
 if(game.flying&&keySet.has(keybinds.jump))player.dashVY=26;
 if(game.flying&&(keySet.has(keybinds.descend)||flightTouchDrop))player.dashVY=-26;
 player.dashTime=game.flying?.24:.18;
 player.dashCooldown=0;
 player.dashSerial=(player.dashSerial||0)+1;
 player.vx=player.dashVX*(game.flying?96:60);
 player.vz=player.dashVZ*(game.flying?96:60);
 if(game.flying){player.y=Math.max(player.y,height(player.x,player.z)+6.8);player.vy=0;player.grounded=false;}
 player.invuln=Math.max(player.invuln,game.flying?.17:.22);
 player.cameraKick=Math.max(player.cameraKick,game.flying?.15:.10);
 const accent=game.flying?[.41,.97,1]:regions[game.zone].accent;
 burst(player.x,player.y+1.1,player.z,accent,game.flying?12:10,.56);
 pulseSfx(game.flying?340:220,.11,'triangle',.025);
 ldx.noise=Math.max(ldx.noise,14);if(ldx.pulseBuff>0)ldx.shock(player.x,player.z,9,26);
 return true;
}
function doJump(){if(game.state!=='playing')return;
 const now=performance.now();jumpTimes=jumpTimes.filter(t=>now-t<1650);jumpTimes.push(now);
 if(jumpTimes.length>=3){jumpTimes=[];player.jumpBuffer=0;activateFlight();pulseSfx(840,.4,'sine',.08);return}
 if(game.flying){player.y=Math.min(height(player.x,player.z)+70,player.y+2.7);burst(player.x,player.y,player.z,[.36,.83,1],8,.5);return}
 if(player.grounded||player.coyote>0){
  player.vy=10.4;player.grounded=false;player.coyote=0;player.jumpBuffer=0;
  pulseSfx(230,.12,'sine',.016);
 }else{
  player.jumpBuffer=.14; // A press just before landing still becomes a jump.
 }
}
function fireForward(){return [Math.sin(orbit)*Math.cos(orbitPitch),-Math.sin(orbitPitch),Math.cos(orbit)*Math.cos(orbitPitch)]}
function fireTargetPoint(e){return [e.x,e.y+(e.kind==='bat'?0:(e.boss?2.4:e.kind?1.05:1.5)),e.z]}
function livingFireTargets(){
 // Both enemy characters and wildlife are targetable. Stags remain nonaggressive but targetable.
 return [...enemies,...wildlife].filter(e=>!e.dead&&Number.isFinite(e.hp)&&e.hp>0);
}
const FIRE_LOCK_RANGE=45;
function validAutoAimTarget(e,origin=[player.x,player.y+1.85,player.z]){
 if(!e||e.dead||!Number.isFinite(e.hp)||e.hp<=0)return false;
 if(!game.flying&&Math.hypot(e.x-origin[0],e.z-origin[2])>FIRE_LOCK_RANGE)return false;
 return true;
}
function findFireTarget(origin,forward,except=null){
 let best=null,bestScore=Infinity;
 for(const e of livingFireTargets()){
  if(e===except||!validAutoAimTarget(e,origin))continue;
  const pt=fireTargetPoint(e),dx=pt[0]-origin[0],dz=pt[2]-origin[2];
  const dist=Math.hypot(dx,pt[1]-origin[1],dz);
  // Prioritize the current realm without imposing a hard limit while flying.
  const realmPenalty=game.flying&&e.zone!==game.zone?7000:0;
  const score=dist+realmPenalty;
  if(score<bestScore){bestScore=score;best=e;}
 }
 return best;
}
let currentFireLock=null,autoAimSwitchCount=0,fireLockWindow=0;
// Camera lock only during a short fire-cast window; homing projectiles continue independently.
const FIRE_CAMERA_LOCK_SECONDS=.58;
function selectAutoAimTarget(){
 if(fireLockWindow<=0||game.state!=='playing')return null;
 const origin=[player.x,player.y+1.85,player.z];
 if(validAutoAimTarget(currentFireLock,origin))return currentFireLock;
 const previous=currentFireLock;
 currentFireLock=findFireTarget(origin,fireForward());
 if(previous!==currentFireLock&&currentFireLock)autoAimSwitchCount++;
 return currentFireLock;
}
function fireAimInfo(){
 // A debug/status query must never acquire a target or rotate the camera.
 const target=game.state==='playing'&&fireLockWindow>0&&validAutoAimTarget(currentFireLock)?currentFireLock:null;
 return {locked:!!target,type:target?(target.boss?'boss':target.kind||'enemy'):null,
  distance:target?Math.round(Math.hypot(target.x-player.x,target.z-player.z)*10)/10:null,
  mode:game.flying?'flight-unlimited':'ground-45m-360',
  target:target?{x:target.x,y:target.y,z:target.z,zone:target.zone+1}:null,
  eligibleInRealm:livingFireTargets().filter(e=>e.zone===game.zone).length,
  switches:autoAimSwitchCount};
}
function updateFireLockState(dt=0){
 if(game.state!=='playing'){currentFireLock=null;fireLockWindow=0;return;}
 fireLockWindow=Math.max(0,fireLockWindow-dt);
 if(fireLockWindow<=0){currentFireLock=null;return;}
 const e=selectAutoAimTarget();
 if(!e)return;
 // Camera follows the monster automatically, and transitions at once upon death.
 const pt=fireTargetPoint(e),dx=pt[0]-player.x,dz=pt[2]-player.z;
 const heading=Math.atan2(dx,dz),horizontalDistance=Math.max(.12,Math.hypot(dx,dz));
 const targetPitch=clamp(-Math.atan2(pt[1]-(player.y+2.1),horizontalDistance),-1.10,1.10);
 const factor=dt>0?1-Math.exp(-dt*42):1;
 orbit+=shortestTurn(orbit,heading)*factor;
 orbitPitch=mix(orbitPitch,targetPitch,factor);
}
function positionFireLockMarker(){} // Silent lock: no marker, banner or notification.
function applyHomingDamage(target){
 if(!target||target.dead||target.hp<=0)return;
 const amount=target.boss?Math.max(65,Math.ceil(target.maxHp*.35)):Math.ceil(target.hp);
 if(target.kind){
  target.hp-=amount;damagePopup(target,amount);target.hit=.4;
  burst(target.x,target.y+(target.kind==='bat'?0:1),target.z,regions[target.zone].accent,14,.4);
  if(target.hp<=0){target.hp=0;target.dead=true;game.kills++;game.essence+=18;}
 }else{damageEnemy(target,amount)}
 if(target.dead||target.hp<=0){
  if(currentFireLock===target)currentFireLock=null;
  if(fireLockWindow>0){
   selectAutoAimTarget(); // Immediate target switch, but only while casting fire.
   updateFireLockState(0);
  }
 }
}
