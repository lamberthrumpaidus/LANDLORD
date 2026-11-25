/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
const fields=['shift','drop','pitch','roll','turn','front','rear','guardX','guardY','guardZ'];
const zero=[0,0,0,0,0,0,0,0,0,0];
const clips=[
 [[0,...zero],[.20,.13,.09,-.14,-.10,-.18,-.10,-.18,.14,.22,-.18],[.43,-.16,.20,.16,.13,.12,.30,-.32,-.25,.25,-.34],[.62,-.21,.14,.25,.20,.20,.37,-.24,-.32,.16,-.43],[.83,-.07,.06,.09,.07,.07,.17,-.09,-.09,.08,-.12],[1,...zero]],
 [[0,...zero],[.22,-.17,.15,-.10,.14,.22,-.08,-.20,-.30,.19,.20],[.45,.19,.20,.19,-.15,-.20,.28,-.25,.16,.29,-.28],[.66,.24,.10,.24,-.20,-.22,.36,-.24,.24,.26,-.37],[.84,.09,.05,.08,-.06,-.07,.13,-.07,.10,.12,-.10],[1,...zero]],
 [[0,...zero],[.24,.03,.25,-.15,0,-.13,-.12,-.27,.06,.65,.28],[.42,.05,.33,-.26,-.08,-.09,.02,-.34,.34,.91,.30],[.59,-.04,.38,.47,.08,.08,.54,-.34,.18,.05,.68],[.80,-.02,.23,.28,.04,.06,.29,-.20,.09,-.09,.34],[1,...zero]]
];
function sample(index,u){
 const seq=clips[index]||clips[0];u=clamp(u,0,1);let i=0;while(i<seq.length-2&&u>seq[i+1][0])i++;
 const p=seq[i],q=seq[i+1],t=clamp((u-p[0])/(q[0]-p[0]),0,1),s=t*t*(3-2*t);
 return Object.fromEntries(fields.map((k,j)=>[k,mix(p[j+1],q[j+1],s)]));
}
function blend(a,b,t){t=clamp(t,0,1);const s=t*t*(3-2*t);return Object.fromEntries(fields.map(k=>[k,mix(a[k],b[k],s)]));}
function pose(p){if(p.attackTime<=0)return sample(0,0);const u=clamp(1-p.attackTime/p.attackDuration,0,1),next=sample(p.combo,u);return p.choreoFrom&&u<.22?blend(p.choreoFrom,next,u/.22):next;}
const api={sample,blend,pose,fields};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LandlordChoreography=api;
})(globalThis);
