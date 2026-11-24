/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
const profiles={low:{scale:.58,max: .65,pixels:650000,grass:0,shadow:0},balanced:{scale:.85,max:1,pixels:1250000,grass:320,shadow:512},high:{scale:1.10,max:1.45,pixels:2500000,grass:1450,shadow:1024},cinematic:{scale:1.55,max:2.1,pixels:4200000,grass:4400,shadow:3072}};
function size(q,w,h,dpr=1,adaptive=1,limit=8192){
 const p=profiles[q]||profiles.high,desired=Math.max(p.scale,Math.min(p.max,dpr*(q==='cinematic'?1.25:q==='high'?1.05:1)));
 const factor=q==='cinematic'?1:adaptive;
 const scale=Math.min(desired,Math.sqrt(p.pixels/(w*h)),limit/w,limit/h)*factor;
 return {width:Math.max(2,Math.round(w*scale)),height:Math.max(2,Math.round(h*scale)),scale,adaptive:q!=='cinematic',budget:p.grass,shadow:p.shadow};
}
const api={profiles,size};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LandlordGraphicsProfiles=api;
})(globalThis);
