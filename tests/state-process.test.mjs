import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,state,simulate,simulateStates,validateSession,VERSION,metals} from '../model.js';
import {diagramSVG,historySVG,surfaceSVG} from '../render.js';
const points=(...values)=>values.map(p=>({name:'',p:{...defaults,...p}}));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const linear=(duration=10)=>({duration,ramp:'linear'});
test('multiple parameters interpolate together and visit every saved target without mutation',()=>{
 const states=points({}, {current:4,transport:60}, {current:1,transport:80});const before=structuredClone(states);
 const sim=simulateStates(states,[linear(),linear(20)]);
 const mid=sim.records.find(r=>r.t===5);near(mid.p.current,3);near(mid.p.transport,40);
 const junction=sim.records.find(r=>r.t===10);near(junction.p.current,4);near(junction.p.transport,60);near(junction.ratio,state(states[1].p).ratio);
 const end=sim.records.at(-1);near(end.p.current,1);near(end.p.transport,80);near(end.ratio,state(states[2].p).ratio);near(sim.totalTime,30);
 assert.deepEqual(states,before);
});
test('a jump sets all targets immediately and holds them throughout its duration',()=>{const sim=simulateStates(points({}, {current:6,transport:75}),[{duration:10,ramp:'jump'}]);assert.equal(sim.records[0].p.current,2);for(const r of sim.records.slice(1)){assert.equal(r.p.current,6);assert.equal(r.p.transport,75);}});
test('state process and equivalent parameter process share the time integrator across transitions',()=>{
 const start={transportTau:12};const a=simulateStates(points(start,{...start,transport:70},{...start,transport:5}),[linear(12),{duration:6,ramp:'jump'}],'time');
 const b=simulate({...defaults,...start},[{parameter:'transport',target:70,...linear(12)},{parameter:'transport',target:5,duration:6,ramp:'jump'}],'time');
 assert.deepEqual(a.records,b.records);assert.deepEqual(a.layers,b.layers);assert.equal(a.thickness,b.thickness);
});
test('editing an intermediate target changes the process while preserving both adjacent snapshots',()=>{const states=points({}, {current:5}, {current:1});const first=structuredClone(states[0]),last=structuredClone(states[2]);const a=simulateStates(states,[linear(),linear()]);states[1].p.current=8;const b=simulateStates(states,[linear(),linear()]);assert.notEqual(a.records.find(r=>r.t===10).p.current,b.records.find(r=>r.t===10).p.current);assert.deepEqual(states[0],first);assert.deepEqual(states[2],last);});
test('discrete mechanisms switch at the ramp endpoint and at the beginning of a jump',()=>{const states=points({level:3,wettingMode:0},{level:3,wettingMode:1});const a=simulateStates(states,[linear()]);assert.ok(a.records.slice(0,-1).every(r=>r.p.wettingMode===0));assert.equal(a.final.wettingMode,1);const b=simulateStates(states,[{duration:10,ramp:'jump'}]);assert.ok(b.records.slice(1).every(r=>r.p.wettingMode===1));});
test('dynamic settings remain fixed from AZ and a closed bath conserves metal across several targets',()=>{
 const states=points({level:3,closed:1,area:100,volume:.1},{level:3,area:500,volume:5,current:4},{level:3,area:1,current:1});
 const sim=simulateStates(states,[linear(30),linear(30)],'time');assert.ok(sim.records.every(r=>r.p.area===100&&r.p.volume===.1&&r.p.closed===1));
 const end=sim.records.at(-1),m=metals.copper;near(.5-end.concentration,sim.thickness*1e-6*m.rho*.01/m.M/.1);
});
test('invalid points, incompatible material/model, incomplete transitions and bad durations are rejected',()=>{for(const states of [points({}),points({},{metal:'nickel'}),points({},{level:2})])assert.throws(()=>simulateStates(states,[linear()]));const p=points({},{});for(const transitions of [[],[linear(0)],[{duration:5,ramp:'hold'}],[{duration:NaN,ramp:'linear'}]])assert.throws(()=>simulateStates(p,transitions));});
test('v4 roundtrip preserves state transitions; old projects retain parameter steps',()=>{
 const project={version:VERSION,states:points({}, {current:4}),active:1,processStart:1,processSource:'states',transitions:[{duration:35,ramp:'jump'}],steps:[],mode:'process',processMode:'time'};
 const restored=validateSession(JSON.parse(JSON.stringify(project)));assert.deepEqual(restored.transitions,project.transitions);assert.equal(restored.processSource,'states');assert.deepEqual(simulateStates(restored.states,restored.transitions,'time'),simulateStates(project.states,project.transitions,'time'));
 for(const version of [1,2,3]){const old=validateSession({...project,version,processSource:undefined,transitions:undefined});assert.equal(old.processSource,'steps');assert.deepEqual(old.transitions,[{duration:60,ramp:'linear'}]);}
 assert.throws(()=>validateSession({...project,transitions:[]}));assert.throws(()=>validateSession({...project,processSource:'bad'}));
});
test('route graphics include the path, saved points and vector layer history',()=>{const states=points({}, {current:4},{current:1});states.forEach(s=>s.result=state(s.p));const sim=simulateStates(states,[linear(),linear()],'time');for(const svg of [diagramSVG(states,0,sim,sim.records.length-1),historySVG(sim,sim.records.length-1),surfaceSVG(sim.records.at(-1))]){assert.match(svg,/<svg/);assert.doesNotMatch(svg,/<image|data:image/);}const map=diagramSVG(states,0,sim,0);for(const name of ['AZ','Z2','EZ','Sim'])assert.match(map,new RegExp(name));});

test('parameter projects cannot override validated inputs through internal multi-target fields',()=>{const step={parameter:'current',target:3,duration:5,ramp:'jump',targets:{current:999,metal:'bad'}};const sim=simulate(defaults,[step]);assert.equal(sim.final.current,3);assert.equal(sim.final.metal,'copper');});
