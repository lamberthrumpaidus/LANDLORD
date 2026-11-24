/* ALL Create by LamberthRumpaidus — LANDLORD Original Adaptive Soundscape */
(function(){
'use strict';
const AC=window.AudioContext||window.webkitAudioContext;
let ctx=null,master=null,sfxBus=null,musicBus=null,ambientBus=null,enabled=true,volume=.72,active=false;
let events=0,notes=0,musicTimer=0,step=0,lastFoot=0;
const $=id=>document.getElementById(id);
function initialize(){
 if(ctx)return true;if(!AC)return false;
 try{
  ctx=new AC();master=ctx.createGain();master.gain.value=enabled?volume*.46:0;
  const comp=ctx.createDynamicsCompressor();comp.threshold.value=-22;comp.knee.value=18;comp.ratio.value=5;comp.attack.value=.004;comp.release.value=.17;
  sfxBus=ctx.createGain();musicBus=ctx.createGain();ambientBus=ctx.createGain();
  sfxBus.gain.value=.82;musicBus.gain.value=.27;ambientBus.gain.value=.15;
  for(const bus of [sfxBus,musicBus,ambientBus])bus.connect(comp);comp.connect(master).connect(ctx.destination);
  const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),d=buffer.getChannelData(0);let last=0;
  for(let i=0;i<d.length;i++){last=last*.96+(Math.random()*2-1)*.04;d[i]=last;}
  const wind=ctx.createBufferSource(),lp=ctx.createBiquadFilter();wind.buffer=buffer;wind.loop=true;lp.type='lowpass';lp.frequency.value=470;
  wind.connect(lp).connect(ambientBus);wind.start();
  window.LANDLORD_AUDIO_STATS={active:false,context:ctx.state,sounds:0,musicNotes:0};
  return true;
 }catch(e){console.warn('LANDLORD audio',e);return false;}
}
function unlock(){
 if(!enabled||!initialize())return;
 ctx.resume().then(()=>{active=true;window.LANDLORD_AUDIO_STATS.active=true;window.LANDLORD_AUDIO_STATS.context=ctx.state;}).catch(()=>{});
}
function voice(freq,duration=.2,wave='sine',gain=.18,bus=sfxBus,slide=1,start=0){
 if(!ctx||ctx.state!=='running'||!enabled)return;
 const when=ctx.currentTime+start,o=ctx.createOscillator(),g=ctx.createGain();
 o.type=wave;o.frequency.setValueAtTime(Math.max(35,freq),when);o.frequency.exponentialRampToValueAtTime(Math.max(35,freq*slide),when+duration);
 g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),when+.009);g.gain.exponentialRampToValueAtTime(.0001,when+duration);
 o.connect(g).connect(bus);o.start(when);o.stop(when+duration+.03);
}
function noise(dur=.2,gain=.18,freq=900,q=.9,bus=sfxBus){
 if(!ctx||ctx.state!=='running'||!enabled)return;
 const n=Math.ceil(ctx.sampleRate*(dur+.015)),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);
 for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
 const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain();
 src.buffer=b;filter.type='bandpass';filter.frequency.value=freq;filter.Q.value=q;
 const t=ctx.currentTime;g.gain.setValueAtTime(Math.max(.0001,gain),t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 src.connect(filter).connect(g).connect(bus);src.start();src.stop(t+dur+.01);
}
function play(kind,opt={}){
 if(!enabled||!ctx||ctx.state!=='running')return;
 events++;window.LANDLORD_AUDIO_STATS.sounds=events;const v=opt.vol??1,bus=opt.bus||sfxBus;
 const spatialNoise=(dur,gain,freq,q=.9)=>noise(dur,gain,freq,q,bus);
 switch(kind){
  case 'footstep':spatialNoise(.065,.055*v,270);voice(82,.065,'triangle',.07*v,bus,.5);break;
  case 'sword':spatialNoise(.26,.17*v,1800);voice(760,.2,'sawtooth',.065*v,bus,.23);break;
  case 'hit':spatialNoise(.17,.24*v,850);voice(126,.22,'triangle',.21*v,bus,.42);break;
  case 'fire':spatialNoise(.4,.22*v,640);voice(140,.4,'sawtooth',.23*v,bus,2.45);voice(690,.27,'sine',.11*v,bus,.63);break;
  case 'dash':spatialNoise(.23,.15*v,1150);voice(240,.26,'sine',.15*v,bus,2.2);break;
  case 'jump':voice(240,.2,'triangle',.12*v,bus,1.67);break;
  case 'land':spatialNoise(.13,.11*v,470);voice(110,.16,'sine',.08*v,bus,.7);break;
  case 'hurt':spatialNoise(.23,.24*v,350);voice(110,.32,'sawtooth',.14*v,bus,.48);break;
  case 'enemy':voice(91,.45,'sawtooth',.11*v,bus,.54);voice(173,.41,'triangle',.055*v,bus,.6);break;
  case 'pickup':for(let i=0;i<3;i++)voice([440,660,880][i],.31,'sine',.10*v,bus,1.06,i*.075);break;
  case 'checkpoint':for(let i=0;i<5;i++)voice([196,247,294,392,494][i],.7,'triangle',.12*v,bus,1.02,i*.1);break;
  case 'portal':spatialNoise(.7,.12*v,550);voice(81,1.05,'sawtooth',.14*v,bus,2.4);voice(330,.72,'sine',.09*v,bus,.8);break;
  case 'victory':for(let i=0;i<7;i++)voice([196,247,294,392,494,587,784][i],1.3,'triangle',.12*v,bus,1.01,i*.16);break;
  default:voice(550,.15,'sine',.07*v,bus,1.14);
 }
}
let spatialEvents=0,lastHaptic=0,haptics=true;
try{haptics=localStorage.getItem('landlord_haptics')!=='false';}catch{}
function vibrate(pattern){
 if(!haptics||!navigator.vibrate||!matchMedia('(pointer:coarse)').matches)return;
 const now=performance.now();if(now-lastHaptic<90)return;lastHaptic=now;
 try{navigator.vibrate(pattern);}catch{}
}
function setXYZ(node,p,prefix='position'){
 if(node[prefix+'X']){for(let i=0;i<3;i++)node[prefix+'XYZ'[i]].setValueAtTime(p[i],ctx.currentTime);}
 else if(prefix==='position')node.setPosition(...p);
}
function updateListener(frame){
 if(!ctx||!frame)return;
 const l=ctx.listener;
 setXYZ(l,frame.eye);
 if(l.forwardX){setXYZ(l,frame.forward,'forward');setXYZ(l,frame.up,'up');}
 else l.setOrientation(...frame.forward,...frame.up);
}
function playAt(kind,p,opt={}){
 if(!ctx||ctx.state!=='running'||!enabled)return;
 try{const node=ctx.createPanner();node.panningModel='HRTF';node.distanceModel='inverse';node.refDistance=4;node.maxDistance=100;node.rolloffFactor=1;
  setXYZ(node,[p.x,p.y,p.z]);node.connect(sfxBus);play(kind,{...opt,bus:node});spatialEvents++;setTimeout(()=>node.disconnect(),2000);
 }catch{play(kind,opt);}
}
addEventListener('landlord:impact',event=>{
 const p=event.detail;
 playAt(p.kind,p,{vol:p.boss?1:.7});
 if(p.kind==='hurt')vibrate(p.boss?[45,30,75]:25);
 else if(p.kind==='hit')vibrate(p.boss?18:8);
});
const modes=[[0,3,5,7,10],[0,2,5,7,9],[0,3,5,8,10],[0,2,4,7,9],[0,3,6,7,10],[0,2,5,7,11],[0,3,5,7,10]];
function music(){
 if(!active||!enabled||ctx?.state!=='running')return;
 const status=window.Landlord3D?.getFrameState?.();if(status?.state!=='playing')return;
 const zone=Math.max(0,Math.min(6,status.zone||0)),root=[110,98,117,87.3,103.8,92.5,82.4][zone];
 const f=root*Math.pow(2,modes[zone][step%modes[zone].length]/12)*(step%8>=5?2:1);
 voice(f,.56,'sine',.08,musicBus,1.005);voice(f*1.5,.42,'triangle',.023,musicBus,1);
 if(step%8===0){voice(root/2,2.9,'sine',.13,musicBus,.995);voice(root*.75,2.9,'triangle',.04,musicBus,1.004);}
 step++;notes++;window.LANDLORD_AUDIO_STATS.musicNotes=notes;
}
function begin(){unlock();if(!musicTimer)musicTimer=setInterval(music,460);}
function setVolume(value){volume=Math.max(0,Math.min(1,Number(value)||0));if(master)master.gain.setTargetAtTime(enabled?volume*.46:0,ctx.currentTime,.04);try{localStorage.setItem('landlord_volume',String(volume))}catch{}}
function setMute(v){enabled=!v;if(master)master.gain.setTargetAtTime(enabled?volume*.46:0,ctx.currentTime,.04);try{localStorage.setItem('landlord_mute',String(v))}catch{}}
function wireStatus(){
 let prev=null;
 setInterval(()=>{
  const api=window.Landlord3D;if(!api)return;let s,m;
  try{s=api.getFrameState();m=api.getGameplayMetrics();updateListener(s);}catch{return;}
  const seals=s.seals.filter(Boolean).length,relics=s.relics.filter(Boolean).length;
  if(prev&&s.state==='playing'){
   if(s.zone!==prev.zone){play('portal',{vol:.65});step=0;}
   if(m.enemyKills>prev.enemyKills)play('enemy',{vol:.7});
   if(seals>prev.seals)play('checkpoint');
   if(relics>prev.relics)play('pickup');
  }
  if(prev&&s.state==='won'&&prev.state!=='won')play('victory');
  prev={zone:s.zone,hp:s.player.hp,state:s.state,enemyHits:m.enemyHits,enemyKills:m.enemyKills,seals,relics};
 },120);
 const last={};
 function trigger(name){
  if(window.Landlord3D?.getFrameState?.().state!=='playing')return;
  const t=performance.now();if(t-(last[name]||0)<125)return;last[name]=t;play(name);
 }
 document.addEventListener('pointerdown',e=>{
  const a=e.target.closest?.('[data-mobile-action]')?.dataset.mobileAction;
  if(a==='attack')trigger('sword');else if(a==='fire')trigger('fire');else if(a==='dash')trigger('dash');else if(a==='jump')trigger('jump');
 },{passive:true,capture:true});
 document.addEventListener('keydown',e=>{
  if(e.repeat)return;const b=window.Landlord3D?.controls?.getBindings?.()||{};
  if(e.code===b.attack||e.code==='KeyJ')trigger('sword');
  else if(e.code===b.fire||e.code==='KeyF')trigger('fire');
  else if(e.code===b.dash||e.code==='ShiftLeft')trigger('dash');
  else if(e.code===b.jump||e.code==='Space')trigger('jump');
 },{passive:true});
 $('world')?.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0)trigger('sword')},{passive:true});
 setInterval(()=>{if(!active||!enabled)return;const s=window.Landlord3D?.getFrameState?.();if(s?.state!=='playing')return;
  if(s.player.grounded&&Math.hypot(s.player.vx||0,s.player.vz||0)>1.7&&performance.now()-lastFoot>345){lastFoot=performance.now();play('footstep',{vol:.55});vibrate(5);}
 },140);
}
function settings(){
 const host=document.querySelector('#settingsPanel .settings-scroll');if(!host||$('landlordAudioSettings'))return;
 const row=document.createElement('div');row.id='landlordAudioSettings';row.className='setting-line';
 row.innerHTML='<label for="landlordAudioVol">SUARA & MUSIK</label><div class="landlord-audio-row"><input id="landlordAudioVol" type="range" min="0" max="100" value="72" aria-label="Volume game"><button id="landlordAudioMute" type="button">SUARA: ON</button></div>';
 host.appendChild(row);
 const hapticButton=document.createElement('button');hapticButton.type='button';hapticButton.textContent='HAPTICS: '+(haptics?'ON':'OFF');hapticButton.disabled=!navigator.vibrate;row.append(hapticButton);hapticButton.addEventListener('click',()=>{haptics=!haptics;try{localStorage.setItem('landlord_haptics',String(haptics));}catch{}hapticButton.textContent='HAPTICS: '+(haptics?'ON':'OFF');vibrate(10);});
 try{const v=localStorage.getItem('landlord_volume');if(v!==null)volume=Math.max(0,Math.min(1,Number(v)));enabled=localStorage.getItem('landlord_mute')!=='true';}catch{}
 const slider=$('landlordAudioVol'),toggle=$('landlordAudioMute');slider.value=String(Math.round(volume*100));toggle.textContent=enabled?'SUARA: ON':'SUARA: OFF';
 slider.addEventListener('input',()=>{setVolume(slider.value/100);unlock();play('menu')});
 toggle.addEventListener('click',()=>{setMute(enabled);toggle.textContent=enabled?'SUARA: ON':'SUARA: OFF';if(enabled){unlock();play('menu')}});
}
function ready(){
 settings();wireStatus();
 document.addEventListener('pointerdown',unlock,{passive:true,capture:true});
 document.addEventListener('keydown',unlock,{passive:true});
 document.addEventListener('click',e=>{if(e.target.closest?.('#play,#resume,#closeSettings')){begin();play('menu')}});

}
window.LandlordAudio={unlock,play,playAt,setVolume,setMute,begin,context:()=>initialize()?ctx:null,output:()=>sfxBus,get spatialEvents(){return spatialEvents},get active(){return !!ctx&&ctx.state==='running'&&enabled},get events(){return events}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();