const {test}=require('node:test');
const assert=require('node:assert/strict');
const {partition,planes,visible}=require('../src/js/engine/GeometryChunks.js');
function tri(x,z){return [[x,0,z],[x+.8,0,z],[x,0,z+.8]].flatMap(p=>[...p,0,1,0,1,1,1,0]);}
test('partition preserves all vertices, counts and bounds',()=>{const source=new Float32Array([...tri(3,0),...tri(40,0),...tri(4,0),...tri(-50,0)]);const out=partition(source);assert.equal(out.chunks.length,3);assert.equal(out.chunks.reduce((s,c)=>s+c.count,0),12);const triangles=a=>Array.from({length:a.length/30},(_,i)=>Array.from(a.subarray(i*30,i*30+30)).join(',')).sort();assert.deepEqual(triangles(out.data),triangles(source));assert.ok(out.chunks.every(c=>c.max[0]>=c.min[0]&&c.first%3===0));});
test('identity clip matrix culls offscreen boxes and preserves intersecting boxes',()=>{const f=planes([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);assert.equal(visible({min:[-1,-1,-1],max:[1,1,1]},f),true);assert.equal(visible({min:[1.1,0,0],max:[2,1,1]},f),false);assert.equal(visible({min:[.8,-2,-2],max:[4,2,2]},f),true);assert.equal(visible({min:[0,0,-3],max:[1,1,-2]},f),false);});
test('invalid triangle streams are rejected',()=>{assert.throws(()=>partition(new Float32Array(11)));assert.throws(()=>partition(new Float32Array(30),0));});
