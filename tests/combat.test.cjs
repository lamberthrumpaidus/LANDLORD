const {test}=require('node:test');const assert=require('node:assert/strict');const {canStrike,clearSegment,inRange3D}=require('../src/js/engine/CombatRules.js');
const a={x:0,y:0,z:0},opts={reach:5,vertical:2,arc:1,yaw:0};
test('locked direction respects range, elevation and side-step',()=>{assert.equal(canStrike(a,{x:0,y:0,z:4},opts),true);assert.equal(canStrike(a,{x:0,y:8,z:1},opts),false);assert.equal(canStrike(a,{x:3,y:0,z:0},opts),false);assert.equal(canStrike(a,{x:0,y:0,z:6},opts),false);});
test('wall blocks melee with vertical interpolation',()=>{assert.equal(canStrike(a,{x:0,y:0,z:4},{...opts,blocked:(x,y,z)=>z>1.5&&z<2.5}),false);assert.equal(clearSegment(a,{x:0,y:4,z:4},(x,y,z)=>z>1.5&&z<2.5&&y<1),true);});
test('vertical collection range is bounded',()=>{assert.equal(inRange3D(a,{x:1,y:12,z:1},3.5,3),false);assert.equal(inRange3D(a,{x:1,y:2,z:1},3.5,3),true);});
