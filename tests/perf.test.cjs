const {test}=require('node:test');const assert=require('node:assert/strict');const {FrameProfiler}=require('../src/js/engine/FrameProfiler.js');
const sample=frame=>({frame,simulation:1,mesh:2,render:3,overlay:1});
test('frame report uses actual wall time and preserves stalls',()=>{const p=new FrameProfiler(4);[10,20,30,200].forEach(v=>p.push(sample(v)));let r=p.report();assert.equal(r.frame.p95,200);assert.equal(r.frame.mean,65);assert.equal(r.averageFPS,15.4);});
test('ring storage is bounded and invalid samples rejected',()=>{const p=new FrameProfiler(2);p.push(sample(16));p.push(sample(32));p.push(sample(64));assert.equal(p.report().frame.mean,48);assert.equal(p.push(sample(NaN)),false);p.reset();assert.equal(p.report().samples,0);});
