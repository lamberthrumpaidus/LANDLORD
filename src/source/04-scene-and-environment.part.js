// Create by LamberthRumpaidus
function drawWorld(dt){resize();computeCamera(dt);let dynamic=buildDynamic();if(gl)paintWebGL(dynamic);else paintCPU(dynamic);drawAtmosphere()}
function drawAtlas(target){
 const c=target.getContext('2d');if(!c)return;
 const W=target.width,H=target.height,scale=H/330;
 const X=x=>W*.5+(x-player.x)*scale,Z=z=>H*.55-(z-player.z)*scale;
 c.clearRect(0,0,W,H);
 c.fillStyle='#101a25';c.fillRect(0,0,W,H);
 const worldNear=player.z-215,worldFar=player.z+215;
 for(let j=Math.max(0,zoneOf(worldNear));j<=Math.min(6,zoneOf(worldFar));j++){
  const reg=regions[j],top=Z((j+1)*LEN),bottom=Z(j*LEN);
  const color=reg.ground.map(v=>Math.floor(clamp(v*220,0,255)));
  c.fillStyle=`rgb(${color.join(',')})`;c.fillRect(0,top,W,bottom-top);
  const treeColor=reg.kind==='forest'?'#48766a':'#344254';
  for(let k=0;k<130;k++){
   let z=j*LEN+hash(k*17+j*51)*LEN,x=(hash(k*41+j*36)*2-1)*59;
   let sx=X(x),sy=Z(z);if(sx<-20||sx>W+20||sy<-20||sy>H+20)continue;
   c.fillStyle=treeColor;c.beginPath();c.arc(sx,sy,(1+hash(k*13+j)*2.8)*scale,0,TAU);c.fill();
  }
  const road=(side=false)=>{c.beginPath();for(let k=0;k<=80;k++){
    const z=j*LEN+k*LEN/80,offset=side?Math.sin((k/80-.34)/.54*Math.PI)*21*(j%2?-1:1):0;
    if(side&&(k/80<.34||k/80>.88))continue;
    const sx=X(roadCenter(z)+offset),sy=Z(z);if(!side&&k===0||side&&k===28)c.moveTo(sx,sy);else c.lineTo(sx,sy);
   }};
  road(false);c.strokeStyle='#0b1723';c.lineWidth=16*scale;c.stroke();
  c.strokeStyle='#8794a5';c.lineWidth=10*scale;c.stroke();
  road(true);c.strokeStyle='#192536';c.lineWidth=11*scale;c.stroke();c.strokeStyle='#687f89';c.lineWidth=6*scale;c.stroke();
  const altar=shrinePoint(j),gate=portalPoint(j);
  if(game.visited[j]){
   c.fillStyle=game.seals[j]?'#75eec3':'#ffd17b';c.beginPath();c.arc(X(altar.x),Z(altar.z),7,0,TAU);c.fill();
   c.strokeStyle='#ffdd9c';c.lineWidth=2;c.stroke();
   c.fillStyle=game.bosses[j]?'#80d5b7':'#c46a78';c.fillRect(X(gate.x)-7,Z(gate.z)-6,14,12);
   const side=sidePortalPoint(j);c.strokeStyle='#79f3e8';c.lineWidth=3;c.beginPath();c.arc(X(side.x),Z(side.z),8,0,TAU);c.stroke();
  }
 }
 // Discoverable treasure and safe havens become visible only on cleared map cells.
 for(const q of cacheSpots){if(chestTaken[q.id])continue;
  if(!game.explored[q.zone].some(v=>Math.hypot(v[0]-q.x,v[1]-q.z)<24))continue;
  const px=X(q.x),py=Z(q.z);if(px<-12||px>W+12||py<-12||py>H+12)continue;
  c.fillStyle='#ffda8e';c.fillRect(px-5,py-5,10,10);c.strokeStyle='#4b351a';c.lineWidth=1.5;c.strokeRect(px-5,py-5,10,10);
 }
 for(const q of healingWells){if(!game.explored[q.zone].some(v=>Math.hypot(v[0]-q.x,v[1]-q.z)<24))continue;
  const px=X(q.x),py=Z(q.z);if(px<-12||px>W+12||py<-12||py>H+12)continue;
  c.strokeStyle='#80f5cc';c.lineWidth=3;c.beginPath();c.arc(px,py,7,0,TAU);c.stroke();
 }
 // Fog is rendered to its own buffer, so the underlying map cannot disappear.
 const mask=document.createElement('canvas');mask.width=W;mask.height=H;const f=mask.getContext('2d');
 f.fillStyle='#060a13f6';f.fillRect(0,0,W,H);
 f.globalCompositeOperation='destination-out';
 for(const cells of game.explored){for(const point of cells){const xx=X(point[0]),yy=Z(point[1]);
  if(xx<-160||xx>W+160||yy<-160||yy>H+160)continue;
  const grad=f.createRadialGradient(xx,yy,8,xx,yy,48*scale);grad.addColorStop(0,'#000');grad.addColorStop(.52,'#000');grad.addColorStop(1,'transparent');
  f.fillStyle=grad;f.beginPath();f.arc(xx,yy,48*scale,0,TAU);f.fill();
 }}f.globalCompositeOperation='source-over';c.drawImage(mask,0,0);
 const posX=X(player.x),posY=Z(player.z);
 c.save();c.translate(posX,posY);c.rotate(player.angle);c.fillStyle='#ffe3ad';c.shadowColor='#fff0a6';c.shadowBlur=19;
 c.beginPath();c.moveTo(0,-14);c.lineTo(-10,9);c.lineTo(0,4);c.lineTo(10,9);c.fill();c.restore();
 // The realm jump panel is available only in the discovered secret flight mode.
}
/* Local tactical minimap: trails, biome, live enemy markers and current player heading. */
function drawArenaMinimap(target){
 const c=target.getContext('2d');if(!c)return;
 const w=target.width,h=target.height,sc=w/135,reg=regions[game.zone];
 const u=(x)=>w*.5+(x-player.x)*sc,v=(z)=>h*.58-(z-player.z)*sc;
 c.clearRect(0,0,w,h);
 c.save();c.translate(w*.5,h*.58);c.rotate(-orbit);c.translate(-w*.5,-h*.58);
 const base=reg.ground.map(q=>Math.round(q*130+13));
 c.fillStyle=`rgb(${base.join(',')})`;c.fillRect(0,0,w,h);
 let aura=c.createRadialGradient(w*.55,h*.35,5,w*.5,h*.5,w*.72);
 aura.addColorStop(0,'#82929d2a');aura.addColorStop(1,'#040b18b4');c.fillStyle=aura;c.fillRect(0,0,w,h);
 // World obstacles are drawn from their actual collision coordinates, not random map markers.
 let dots=0;const seen=new Set();
 for(let z=Math.floor((player.z-62)/SOLID_CELL);z<=Math.floor((player.z+62)/SOLID_CELL);z++){
  for(let x=Math.floor((player.x-62)/SOLID_CELL);x<=Math.floor((player.x+62)/SOLID_CELL);x++){
   const bucket=solidCells.get(`${x},${z}`);if(!bucket)continue;
   for(const obstacle of bucket){
    if(seen.has(obstacle)||dots>250)continue;seen.add(obstacle);
    if(Math.abs(obstacle.x-player.x)>65||Math.abs(obstacle.z-player.z)>65)continue;
    const xx=u(obstacle.x),zz=v(obstacle.z);if(xx<-5||xx>w+5||zz<-5||zz>h+5)continue;
    const radius=Math.min(5,Math.max(1.5,(obstacle.r||Math.min(obstacle.w,obstacle.d))*sc*.4));
    c.fillStyle='#29465c';c.beginPath();c.arc(xx,zz,radius,0,TAU);c.fill();dots++;
   }
  }
 }
 // The walkable center lane matches the actual 3D campaign corridor.
 const roadX=u(roadCenter(player.z)),roadWidth=17*sc;
 c.lineCap='round';c.lineJoin='round';c.beginPath();
 for(let k=0;k<=80;k++){const z=player.z-80+k*2,xx=u(roadCenter(z)),yy=v(z);if(k===0)c.moveTo(xx,yy);else c.lineTo(xx,yy)}
 c.strokeStyle='#061320bd';c.lineWidth=roadWidth+8;c.stroke();
 c.strokeStyle='#536777cf';c.lineWidth=roadWidth;c.stroke();
 const branch=sidePortalPoint(game.zone);c.save();c.beginPath();let started=false;
 for(let k=0;k<=60;k++){const f=.34+k/60*.54,z=game.zone*LEN+LEN*f;
  let x=roadCenter(z)+Math.sin(k/60*Math.PI)*(game.zone%2?-21:21),yy=v(z);
  if(!started){c.moveTo(u(x),yy);started=true}else c.lineTo(u(x),yy)}
 c.strokeStyle='#719695af';c.lineWidth=7*sc;c.stroke();c.restore();
 const portalPX=u(branch.x),portalPY=v(branch.z);if(portalPX>=0&&portalPX<=w&&portalPY>=0&&portalPY<=h){
  c.strokeStyle='#6ed8d0';c.lineWidth=4;c.beginPath();c.arc(portalPX,portalPY,9,0,TAU);c.stroke();}
 c.strokeStyle='#8796a350';c.lineWidth=1.3;
 for(let z=Math.floor((player.z-72)/9)*9;z<player.z+76;z+=9){let py=v(z);c.beginPath();c.moveTo(u(roadCenter(z))-roadWidth*.4,py);c.lineTo(u(roadCenter(z))+roadWidth*.4,py);c.stroke()}
 // Region side markers. Only known, actual game objectives are highlighted.
 for(let i=Math.max(0,game.zone-1);i<=Math.min(6,game.zone+1);i++){
  const anchor=shrinePoint(i),z=anchor.z,x=anchor.x,px=u(x),py=v(z);
  if(px>=0&&px<=w&&py>=0&&py<=h){
    c.fillStyle=game.seals[i]?'#6fe5b2':'#f7d48b';c.shadowColor=c.fillStyle;c.shadowBlur=9;
    c.beginPath();c.moveTo(px,py-8);c.lineTo(px+7,py);c.lineTo(px,py+8);c.lineTo(px-7,py);c.closePath();c.fill();c.shadowBlur=0;
  }
  const r=relicPos(i);if(!game.relics[i]){let x=u(r[0]),y=v(r[1]);if(x>0&&x<w&&y>0&&y<h){c.fillStyle='#dab5fc';c.beginPath();c.arc(x,y,5,0,TAU);c.fill()}}
 }
 for(const q of cacheSpots){if(chestTaken[q.id]||q.zone!==game.zone||Math.hypot(q.x-player.x,q.z-player.z)>38)continue;
  let x=u(q.x),y=v(q.z);if(x>0&&y>0&&x<w&&y<h){c.fillStyle='#edc66f';c.fillRect(x-3.5,y-3.5,7,7);}}
 for(const q of healingWells){if(q.zone!==game.zone||Math.hypot(q.x-player.x,q.z-player.z)>42)continue;
  let x=u(q.x),y=v(q.z);c.strokeStyle='#83e6c4';c.lineWidth=3;c.beginPath();c.arc(x,y,7,0,TAU);c.stroke();}
 for(const b of wildlife){if(b.dead||Math.abs(b.x-player.x)>65||Math.abs(b.z-player.z)>65)continue;
  const xx=u(b.x),yy=v(b.z);if(xx>2&&xx<w-2&&yy>2&&yy<h-2){
  if(b.kind==='bat'&&!ldx.batsOut())continue;c.fillStyle=b.kind==='bat'?'#a182e9':'#e3649e';c.beginPath();c.arc(xx,yy,b.kind==='bat'?2.5:4.2,0,TAU);c.fill();}
 }
 if(ldx.night>.05){c.fillStyle='rgba(4,8,30,'+(.38*ldx.night)+')';c.fillRect(0,0,w,h)}
 for(const e of enemies){if(e.dead||Math.abs(e.x-player.x)>65||Math.abs(e.z-player.z)>65)continue;
   const x=u(e.x),y=v(e.z);if(x<3||y<3||x>w-3||y>h-3)continue;
   c.fillStyle=e.boss?'#ff834f':'#ff6871';c.beginPath();c.arc(x,y,e.boss?6:4.4,0,TAU);c.fill();
   if((e.mem||0)>0||e.windup>0){c.strokeStyle='#ffe27a';c.lineWidth=1.6;c.beginPath();c.arc(x,y,e.boss?12:7,0,TAU);c.stroke()}
   if(e.boss){c.strokeStyle='#ffc5a1';c.lineWidth=1.3;c.beginPath();c.arc(x,y,9,0,TAU);c.stroke()}
 }
 for(const m of ldx.meteors){const x=u(m.x),y=v(m.z);if(x<3||y<3||x>w-3||y>h-3)continue;c.strokeStyle='rgba(255,90,60,'+(.6+.35*Math.sin(clock*14))+')';c.lineWidth=2;c.beginPath();c.arc(x,y,Math.max(5,3.8*sc),0,TAU);c.stroke();c.fillStyle='rgba(255,120,70,.35)';c.fill()}
 const px=u(player.x),py=v(player.z);c.save();c.translate(px,py);c.rotate(player.angle);
 c.shadowColor='#ffdd95';c.shadowBlur=11;c.beginPath();c.moveTo(0,-12);c.lineTo(-8,8);c.lineTo(0,4);c.lineTo(8,8);c.closePath();c.fillStyle='#ffda85';c.fill();c.shadowBlur=0;c.strokeStyle='#102234';c.lineWidth=2;c.stroke();c.restore();
 c.restore();
 // The heading marker points up on the camera-relative tactical minimap.
 c.fillStyle='#f4dcaa';c.font='bold 12px system-ui';c.textAlign='center';c.fillText('↑ KAMERA',w*.5,15);
 c.strokeStyle='#efdaa43d';c.lineWidth=1;c.strokeRect(4,4,w-8,h-8);
}
function mapDraw(target,large=false){if(large)return drawAtlas(target);if(target===mini)return drawArenaMinimap(target);const c=target.getContext('2d');if(!c)return;let W=target.width,H=target.height;c.clearRect(0,0,W,H);
 c.save();c.translate(W*.5,H*.5);let sc=large?H/(END+96):H/(LEN+45),z0=large?END/2:player.z,x0=large?0:player.x;c.scale(sc,-sc);c.translate(-x0,-z0);
 for(let j=0;j<7;j++){
 if(!large&&Math.abs(player.z-(j+.5)*LEN)>LEN*2)continue;
 let reg=regions[j],base=j*LEN;
 c.fillStyle=`rgb(${reg.ground.map(v=>Math.round(v*170)).join(',')})`;
 c.beginPath();c.roundRect(-62,base+1,124,LEN-2,4);c.fill();
 c.fillStyle='rgba(4,9,15,.3)';c.fillRect(-7,base+2,14,LEN-4);
 c.strokeStyle=`rgb(${reg.accent.map(v=>Math.round(v*230)).join(',')})`;c.lineWidth=large?1.5:2.5;c.strokeRect(-62,base+1,124,LEN-2);
 c.beginPath();c.fillStyle=game.seals[j]?'#597d6e':'#fbe2ad';c.arc(0,shrinePoint(idx).z,large?4:4.5,0,TAU);c.fill();
 c.beginPath();c.fillStyle=game.bosses[j]?'#6b7568':'#eb605f';c.moveTo(0,base+99);c.lineTo(-5,base+106);c.lineTo(0,base+113);c.lineTo(5,base+106);c.closePath();c.fill();
 if(large){for(let i=0;i<22;i++){let x=(hash(i*21+j*43)*2-1)*49,z=base+hash(i*3+j*55)*LEN;c.beginPath();c.fillStyle='rgba(0,0,0,.24)';c.arc(x,z,1.5+hash(i)*2.5,0,TAU);c.fill()}}
 }
 for(let j=0;j<7;j++){let pt=relicPos(j);c.beginPath();c.arc(pt[0],pt[1],large?2.2:4,0,TAU);c.fillStyle=game.relics[j]?'#5b9979':'#ffd099';c.fill()}
 c.beginPath();c.arc(player.x,player.z,large?5.8:6,0,TAU);c.fillStyle='#fbf9e7';c.fill();c.strokeStyle='#d27957';c.lineWidth=2;c.stroke();c.beginPath();c.moveTo(player.x,player.z);c.lineTo(player.x+Math.sin(player.angle)*16,player.z+Math.cos(player.angle)*16);c.strokeStyle='#fff';c.lineWidth=2.5;c.stroke();c.restore();
 if(!large){let g=c.createRadialGradient(W/2,H/2,W*.1,W/2,H/2,W*.5);g.addColorStop(0,'transparent');g.addColorStop(1,'#040813b5');c.fillStyle=g;c.fillRect(0,0,W,H)}else{
 c.font='bold 13px system-ui';c.textBaseline='middle';c.textAlign='left';for(let i=0;i<7;i++){let y=H/2-(i*LEN+LEN/2-END/2)*sc;c.fillStyle=i===game.zone?'#ffe3ab':'#c5c5c5';c.fillText(`${String(i+1).padStart(2,'0')} · ${regions[i].name}`,W*.63,y);
 c.font='11px system-ui';c.fillStyle=game.seals[i]?'#c2efbb':'#c9b5a7';c.fillText(game.seals[i]?'✦ Segel aktif':'○ Belum aktif',W*.63,y+19);c.font='bold 13px system-ui';}
 }
}
function configureAtlas(){
 const portrait=innerHeight>innerWidth;
 const usableW=Math.max(290,innerWidth-32),usableH=Math.max(280,innerHeight-(portrait?110:80));
 mapCanvas.width=portrait?960:1600;
 mapCanvas.height=Math.round(mapCanvas.width*usableH/usableW);
}
function toggleMap(){if(game.state==='playing'){
 game.state='map';ui.map.classList.add('visible');hideTouchControls();keySet.clear();configureAtlas();mapDraw(mapCanvas,true);
 $('mapTitle').textContent=regions[game.zone].name;buildRealmSelector();if(document.pointerLockElement)document.exitPointerLock?.();
 }else if(game.state==='map'){game.state='playing';ui.map.classList.remove('visible');if(isTouchDevice())revealTouchControls();lastFrame=0;}}
function buildRealmSelector(){const bar=$('realmJump');if(!bar)return;bar.replaceChildren();bar.hidden=!game.flying;
 if(!game.flying)return;
 for(let i=0;i<7;i++){let b=document.createElement('button');b.type='button';b.className='realm-choice'+(i===game.zone?' current':'');
 b.textContent=String(i+1).padStart(2,'0')+(game.visited[i]?' · '+regions[i].name:' · ?');b.title=game.visited[i]?regions[i].name:'Wilayah belum dijelajahi';
 b.addEventListener('click',()=>travelRealm(i));bar.appendChild(b);}
}
function setGraphicsQuality(next,persist=false){if(!['high','cinematic','balanced','low'].includes(next))return false;quality=next;adaptiveFactor=1;perfClock=slowFrames=perfFrames=0;if(persist)try{localStorage.setItem('rubaka3d-quality',quality)}catch{}resize();updateSettingsUI();return true;}
function toggleQuality(){const modes=['high','cinematic','balanced','low'];setGraphicsQuality(modes[(modes.indexOf(quality)+1)%modes.length],true)}
const keySet=new Set();let touchMove={active:false,x:0,y:0},contacts=new Map(),mouseOrbit=false,lastTap=0;
const touchLayer=$('mobileControls'),joyVisual=$('joyVisual'),joyKnob=$('joyKnob'),lookVisual=$('lookVisual');
let flightTouchRise=false,flightTouchDrop=false;const actionPointers=new Map();
let peekTimer=0,joystickCenter={x:90,y:0};
const isTouchDevice=()=>matchMedia('(pointer:coarse)').matches||document.body.classList.contains('touch-device');
function placeJoystick(){
 // Fixed-position, thumb-friendly left joystick, independent of camera direction.
 const size=joyVisual.getBoundingClientRect().width||124;
 const edgeX=Math.max(18,innerWidth*.023),edgeBottom=Math.max(16,innerHeight*.044);
 joystickCenter={x:edgeX+size*.5,y:innerHeight-edgeBottom-size*.5};
 joyVisual.style.left=joystickCenter.x+'px';joyVisual.style.top=joystickCenter.y+'px';
 return joystickCenter;
}
function revealTouchControls(){if(game.state!=='playing')return;document.body.classList.add('touch-device');touchLayer.classList.add('running','revealed');placeJoystick()}
function hideTouchControls(){touchLayer.classList.remove('running','revealed');joyVisual.classList.remove('active');lookVisual.classList.remove('visible');clearTimeout(peekTimer);contacts.clear();actionPointers.clear();flightTouchRise=false;flightTouchDrop=false;for(const b of document.querySelectorAll('.ghost-btn.pressed'))b.classList.remove('pressed');touchMove.active=false;touchMove.x=touchMove.y=0;joyKnob.style.transform='translate(0px,0px)'}
function setJoy(dx=0,dy=0){const lim=(joyVisual.getBoundingClientRect().width||124)*.30;const mag=Math.hypot(dx,dy),scale=mag>lim?lim/mag:1;joyKnob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`}
function readJoystick(x,y){const c=joystickCenter,r=(joyVisual.getBoundingClientRect().width||124)*.37;const dx=x-c.x,dy=y-c.y;const raw=Math.min(1,Math.hypot(dx,dy)/r),amount=raw<.11?0:Math.pow((raw-.11)/.89,1.05),ang=Math.atan2(dy,dx);
 touchMove.x=Math.cos(ang)*amount;touchMove.y=-Math.sin(ang)*amount;setJoy(dx,dy)}
function onGameKeyDown(e){
 if(settingsOpen){if(bindingPending){e.preventDefault();e.stopPropagation();if(!e.repeat)chooseBinding(e.code);}else if(e.code==='Escape'){e.preventDefault();showMenuPanel()}return;}
 if(!['playing','map','pause'].includes(game.state))return;
 const isControl=Object.values(keybinds).includes(e.code);if(isControl||e.code==='F3')e.preventDefault();
 if(e.repeat&&(isControl||e.code==='F3'))return;
 keySet.add(e.code);
 if(isBound('pause',e.code)){if(game.state==='map')toggleMap();else if(game.state==='playing')openMenu();else if(game.state==='pause')resume();return}
 if(isBound('map',e.code)){toggleMap();return}
 if(game.state!=='playing')return;
 if(isBound('jump',e.code))doJump();
 if(isBound('dash',e.code))doDash();
 if(isBound('fire',e.code))doFire();
 if(isBound('attack',e.code))doAttack();
 if(e.code==='F3')toggleQuality();
 if(isBound('camera',e.code))toggleView()
}
window.addEventListener('keydown',onGameKeyDown);
window.addEventListener('keyup',e=>keySet.delete(e.code));
window.addEventListener('blur',()=>{keySet.clear();if(game.state==='playing')openMenu()});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{
 if(game.state!=='playing')return;
 if(e.pointerType==='touch'){
  e.preventDefault();revealTouchControls(1600);
  const side=e.clientX<innerWidth*.48?'left':'right';
  // One owner for each continuous gesture. Extra touches never pause gameplay.
  if([...contacts.values()].some(p=>p.side===side))return;
  contacts.set(e.pointerId,{x:e.clientX,y:e.clientY,ox:e.clientX,oy:e.clientY,side,start:performance.now(),moved:false,charged:false});
  canvas.setPointerCapture(e.pointerId);
  if(side==='left'){
    touchMove.active=true;touchMove.x=touchMove.y=0;
    const size=joyVisual.getBoundingClientRect().width||124;
    joystickCenter={x:clamp(e.clientX,size*.54,innerWidth*.43),y:clamp(e.clientY,innerHeight*.51,innerHeight-size*.52)};
    joyVisual.style.left=joystickCenter.x+'px';joyVisual.style.top=joystickCenter.y+'px';
    setJoy();joyVisual.classList.add('active');
  }
  else{lookVisual.style.left=e.clientX+'px';lookVisual.style.top=e.clientY+'px';lookVisual.classList.add('visible')}
 }else if(e.button===2){mouseOrbit=true;canvas.setPointerCapture(e.pointerId)}else if(e.button===0){doAttack();if(!isTouchDevice()&&document.pointerLockElement!==canvas){try{canvas.requestPointerLock?.().catch?.(()=>{});}catch{}}}
});
canvas.addEventListener('pointermove',e=>{
 if(game.state!=='playing')return;
 if(e.pointerType==='touch'){
  const p=contacts.get(e.pointerId);if(!p)return;
  const dx=e.clientX-p.x,dy=e.clientY-p.y;
  if(p.side==='left'){
    readJoystick(e.clientX,e.clientY);
  }else{orbit-=dx*.007*cameraSensitivity;orbitPitch=clamp(orbitPitch+dy*.004*cameraSensitivity,-1.10,1.10)}
  if(Math.hypot(e.clientX-p.ox,e.clientY-p.oy)>13)p.moved=true;
  p.x=e.clientX;p.y=e.clientY;revealTouchControls(1250);
 }else if(e.pointerType==='mouse'||e.pointerType==='pen'||mouseOrbit||document.pointerLockElement===canvas){
  // Free-look on desktop: ordinary cursor movement already rotates the camera. Click to lock for unlimited turn.
  orbit-=e.movementX*.0033*cameraSensitivity;orbitPitch=clamp(orbitPitch+e.movementY*.0025*cameraSensitivity,-1.10,1.10);
 }
});
function pointerEnd(e){const p=contacts.get(e.pointerId);
 if(e.pointerType==='touch'&&p){
  contacts.delete(e.pointerId);
  if(p.side==='left'){
    const next=[...contacts.values()].find(t=>t.side==='left');
    if(next){touchMove.active=true;readJoystick(next.x,next.y)}
    else{touchMove.active=false;touchMove.x=touchMove.y=0;joyVisual.classList.remove('active');setJoy();placeJoystick()}
  }else{lookVisual.classList.remove('visible');if(e.type==='pointerup'&&!p.moved&&!p.charged&&game.state==='playing'&&performance.now()-p.start<400){{const now=performance.now();if(now-lastTap<300){doJump();lastTap=0}else{doAttack();lastTap=now}}}}
  revealTouchControls(1650);
 }else{mouseOrbit=false}
}
canvas.addEventListener('pointerup',pointerEnd);canvas.addEventListener('pointercancel',pointerEnd);canvas.addEventListener('lostpointercapture',pointerEnd);
// Touchable hotspots are transparent until a finger touches the screen; buttons always work.
document.querySelectorAll('[data-mobile-action]').forEach(button=>{
 button.addEventListener('pointerdown',e=>{
  if(game.state!=='playing')return;e.preventDefault();e.stopPropagation();revealTouchControls(1800);button.classList.add('pressed');
  actionPointers.set(e.pointerId,button);try{button.setPointerCapture(e.pointerId);}catch{}
  const action=button.dataset.mobileAction;
   if(game.flying&&action==='jump')flightTouchRise=true;
   if(game.flying&&action==='descend')flightTouchDrop=true;
   ({attack:doAttack,jump:doJump,dash:doDash,descend:()=>{},fire:doFire,view:toggleView,pause:()=>openMenu()})[action]?.();
 });
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(ev,e=>{if(actionPointers.get(e.pointerId)!==button)return;actionPointers.delete(e.pointerId);if([...actionPointers.values()].includes(button))return;button.classList.remove('pressed');if(button.dataset.mobileAction==='jump')flightTouchRise=false;if(button.dataset.mobileAction==='descend')flightTouchDrop=false;});
});
$('play').addEventListener('click',()=>{audioContext()?.resume?.();let hasSave=false;try{hasSave=!!localStorage.getItem('landlord-openrealms-save-v1')}catch{}if(hasSave)fromSave();else newGame()});
$('victoryRestart').addEventListener('click',()=>{$('victoryOverlay').hidden=true;newGame()});
$('victoryMenu').addEventListener('click',()=>{game.missionEnd=false;try{localStorage.removeItem('landlord-openrealms-save-v1')}catch{}$('victoryOverlay').hidden=true;openMenu(true);});
$('resume').addEventListener('click',resume);
$('restart').addEventListener('click',()=>{if(confirm(T('resetConfirm'))){try{localStorage.removeItem('landlord-openrealms-save-v1')}catch{}showMenuPanel();newGame()}});
$('closeMap').addEventListener('click',e=>{e.stopPropagation();if(game.state==='map')toggleMap()});
mini.addEventListener('click',e=>{if(game.state==='playing'){e.preventDefault();e.stopPropagation();toggleMap()}});
ui.map.addEventListener('click',e=>{if(e.target===$('mapOverlay'))toggleMap()});
function fpsTick(dt){fps=mix(fps,1/Math.max(dt,.001),.06)}
let miniRefresh=0,perfClock=0,slowFrames=0,perfFrames=0;
function adaptPerformance(dt){
 if(!isTouchDevice()||!gl||quality==='low')return;
 perfClock+=dt;perfFrames++;if(dt>.036)slowFrames++;
 if(perfClock>=4){const slowRatio=slowFrames/Math.max(1,perfFrames),mean=perfClock/Math.max(1,perfFrames);
  const next=slowRatio>.45?Math.max(.62,adaptiveFactor-.12):mean<.022?Math.min(1,adaptiveFactor+.06):adaptiveFactor;
  if(Math.abs(next-adaptiveFactor)>.001){adaptiveFactor=next;resize();}
  perfClock=slowFrames=perfFrames=0;
 }
}
