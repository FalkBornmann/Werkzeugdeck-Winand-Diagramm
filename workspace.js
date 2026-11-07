import {defaults} from './model.js';
export const stateCode=(i,count)=>i===0?'AZ':i===count-1?'EZ':`Z${i+1}`;
export const stateName=i=>i===0?'Ausgangszustand':`Zustand ${i+1}`;
export const stateTitle=(s,i,count)=>`${stateCode(i,count)} · ${stateName(i)}${s.name?' — '+s.name:''}`;
export function cloneState(s){return {name:s.name||'',p:{...s.p}};}
// Every mutation replaces exactly one snapshot. A separately selected process origin
// never follows the editor's active state. No simulation writes to saved snapshots.
export class StateBook {
 constructor(states=[{name:'',p:defaults}],active=0,processStart=0){this.states=states.map(cloneState);this.active=active;this.processStart=processStart;}
 select(i){if(!Number.isInteger(i)||i<0||i>=this.states.length)throw Error('Unbekannter Zustand.');this.active=i;}
 setOrigin(i){if(!Number.isInteger(i)||i<0||i>=this.states.length)throw Error('Unbekannter Prozessstart.');this.processStart=i;}
 patch(values){const i=this.active;this.states=this.states.map((s,j)=>j===i?{...s,p:{...s.p,...values}}:s);}
 rename(name){this.states=this.states.map((s,i)=>i===this.active?{...s,name}:s);}
 add(p=this.states[this.active].p,name='') {if(this.states.length>=50)throw Error('Höchstens 50 Zustände möglich.');this.states=[...this.states,{name,p:{...p}}];this.active=this.states.length-1;}
 remove(){if(this.states.length===1)return;const i=this.active;this.states=this.states.filter((_,j)=>j!==i);this.active=Math.min(i,this.states.length-1);this.processStart=this.processStart===i?0:this.processStart>i?this.processStart-1:this.processStart;}
 origin(){return {...this.states[this.processStart].p};}
}
