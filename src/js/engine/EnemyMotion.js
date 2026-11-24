/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
const idle={x:0,y:0,z:0,lean:0,twist:0,blade:[.12,.52,.84]};
const clips=[
 {name:'Reaper sweep',wind:[.55,1.08,-.56,-.09,-.65],contact:[-.80,.30,1.10,.28,.66],bladeWind:[.85,.34,-.25],bladeHit:[-.87,.09,.49]},
 {name:'Thorn cleave',wind:[.25,1.45,-.40,-.12,-.22],contact:[-.14,-.48,1.19,.43,.13],bladeWind:[.15,.98,-.18],bladeHit:[-.05,-.88,.48]},
 {name:'Weaver lunge',wind:[.24,.40,-.62,-.23,0],contact:[.16,-.18,1.21,.58,0],bladeWind:[.35,.82,-.30],bladeHit:[.12,-.35,.93]},
 {name:'Veil ritual',wind:[.67,.95,.14,-.10,-.35],contact:[-.24,.73,1.20,.12,.33],bladeWind:[.48,.87,-.05],bladeHit:[.03,.15,.99]},
 {name:'Cinder slam',wind:[.02,1.60,-.70,-.19,-.15],contact:[.09,-.66,1.05,.52,.11],bladeWind:[.02,.99,-.09],bladeHit:[.07,-.97,.23]},
 {name:'Storm thrust',wind:[.32,.28,-1.04,-.18,-.24],contact:[-.16,.08,1.46,.35,.17],bladeWind:[.31,.15,.94],bladeHit:[-.04,.04,1]},
 {name:'Ashbound crosscut',wind:[-.70,.85,-.36,-.10,.72],contact:[.68,.11,1.22,.35,-.70],bladeWind:[-.90,.36,-.15],bladeHit:[.91,-.13,.39]}
];
const normal=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n)};
function pose(v,blade){return {x:v[0],y:v[1],z:v[2],lean:v[3],twist:v[4],blade:normal(blade)};}
function blend(a,b,t){t=clamp(t,0,1);t=t*t*(3-2*t);const p={};for(const k of ['x','y','z','lean','twist'])p[k]=mix(a[k],b[k],t);let blade=a.blade.map((v,i)=>mix(v,b.blade[i],t));p.blade=Math.hypot(...blade)<1e-5?normal(b.blade):normal(blade);return p;}
function sample(e){
 const clip=clips[e.boss?clamp(e.zone||0,0,6):0];
 const duration=e.strikeDuration||(e.boss?(e.p2?.78:.96):.57),afterDuration=e.strikeRecovery||.38;
 const phase=e.windup>0?clamp(1-e.windup/duration,0,1):(e.strikeAfter>0?1+clamp(1-e.strikeAfter/afterDuration,0,1)*.45:1.45);
 const amp=e.boss?1:.52,wind=pose(clip.wind.map(v=>v*amp),clip.bladeWind),hit=pose(clip.contact.map(v=>v*amp),clip.bladeHit);
 let p=phase<.70?blend(idle,wind,phase/.70):phase<1?blend(wind,hit,(phase-.70)/.30):blend(hit,idle,(phase-1)/.45);
 return {...p,phase,active:phase<1.45,name:clip.name,stage:phase<.70?'anticipation':phase<1?'strike':phase<1.45?'recovery':'idle'};
}
const api={sample,clips};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LandlordEnemyMotion=api;
})(globalThis);
