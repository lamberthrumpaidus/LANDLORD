/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
const fields=['frame','simulation','mesh','render','overlay'];
class FrameProfiler{
 constructor(capacity=120){this.capacity=capacity;this.cursor=0;this.count=0;this.samples=Object.fromEntries(fields.map(k=>[k,new Float32Array(capacity)]));}
 push(sample){if(!fields.every(k=>Number.isFinite(sample[k])&&sample[k]>=0))return false;for(const k of fields)this.samples[k][this.cursor]=sample[k];this.cursor=(this.cursor+1)%this.capacity;this.count=Math.min(this.capacity,this.count+1);return true;}
 reset(){this.cursor=this.count=0;}
 report(){const r={samples:this.count,scope:'CPU submission timings; frame interval is wall-clock, not GPU timer'};if(!this.count)return r;for(const k of fields){const v=Array.from(this.samples[k].subarray(0,this.count)).sort((a,b)=>a-b);const avg=v.reduce((a,b)=>a+b,0)/v.length;const n=x=>Math.round(x*100)/100;r[k]={mean:n(avg),p50:n(v[Math.ceil(v.length*.5)-1]),p95:n(v[Math.ceil(v.length*.95)-1]),max:n(v[v.length-1])};}r.averageFPS=Math.round(10000/Math.max(.001,r.frame.mean))/10;return r;}
}
if(typeof module!=='undefined'&&module.exports)module.exports={FrameProfiler};else root.LandlordFrameProfiler=FrameProfiler;
})(globalThis);
