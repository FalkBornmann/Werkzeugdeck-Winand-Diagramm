import {defaults,presets,fields,metals,state,equilibrium,simulate,scenarios,validate,validateSession,VERSION} from './model.js';
import {escape,diagramSVG,morphologySVG,historySVG,names,descriptions} from './render.js';
const $=id=>document.getElementById(id),fmt=(v,d=2)=>Number(v).toLocaleString('de-DE',{maximumFractionDigits:d});
let states=[{name:'Ausgangszustand',p:{...defaults}}],active=0,mode='compare',processMode='path',steps=[{parameter:'transport',target:70,duration:180,ramp:'linear'}],process=null,index=0,timer=null;
const dynamicKeys=['area','volume','transportTau','adsorptionTau'];
const report=(message,error=false)=>{$('status').textContent=message;$('status').className=error?'error':'';};
function stop(){if(timer)clearInterval(timer);timer=null;$('play').textContent='Abspielen';}
function controls(){
 const p=states[active].p;
 $('active').innerHTML=states.map((s,i)=>`<option value="${i}">${i+1} · ${escape(s.name)}</option>`).join('');$('active').value=active;
 $('name').value=states[active].name;$('metal').value=p.metal;$('level').value=p.level;$('mode').value=mode;$('processMode').value=processMode;$('closed').checked=!!p.closed;
 $('fields').innerHTML=Object.entries(fields).filter(([k,f])=>!dynamicKeys.includes(k)&&f[5]<=p.level).map(([k,f])=>field(k,f,p)).join('');
 $('dynamicFields').innerHTML=dynamicKeys.map(k=>field(k,fields[k],p)).join('');
 $('removeState').disabled=states.length===1;$('duplicate').disabled=states.length>=50;
 $('processPanel').hidden=mode!=='process';$('timeSettings').hidden=processMode!=='time';$('historyPanel').hidden=mode!=='process'||processMode!=='time';
 $('levelHint').textContent=['','Einfach: Konzentration, Stromdichte und Stofftransport. Temperatur 25 °C, pH 4 und keine Zusätze.','Komplexierung: generischer Ligand, Nachlieferung aus Komplexen sowie illustrative Temperatur- und pH-Wirkungen.','Mehrkomponentenbad: generische Glanzbildner, Beschleuniger, Netzmittel und Puffer. Relative Modellwerte, keine industrielle Rezeptur.'][p.level];
 stepControls();
}
function field(k,f,p){return `<label>${escape(f[0])} <span class="unit">${escape(f[1])}</span><div class="mini"><input aria-label="${escape(f[0])}" data-field="${k}" type="number" min="${f[2]}" max="${f[3]}" step="${f[4]}" value="${p[k]}"><input aria-label="${escape(f[0])} Schieberegler" data-slider="${k}" type="range" min="${f[2]}" max="${f[3]}" step="${f[4]}" value="${p[k]}"></div></label>`;}
function stepControls(){
 const options=Object.entries(fields).filter(([k,f])=>!dynamicKeys.includes(k)&&f[5]<=states[active].p.level).map(([k,f])=>`<option value="${k}">${escape(f[0])} ${escape(f[1])}</option>`).join('');
 $('steps').innerHTML=steps.map((s,i)=>{const f=fields[s.parameter];return `<div class="step" data-step="${i}"><span class="step-number">${i+1}</span><label>Parameter<select data-step-field="parameter" aria-label="Schritt ${i+1} Parameter">${options}</select></label><label>Ziel (${escape(f[1]||'ohne Einheit')})<input data-step-field="target" aria-label="Schritt ${i+1} Ziel" type="number" min="${f[2]}" max="${f[3]}" step="${f[4]}" value="${s.target}"></label><label>Dauer (s)<input data-step-field="duration" aria-label="Schritt ${i+1} Dauer" type="number" min="1" max="3600" value="${s.duration}"></label><label>Verlauf<select data-step-field="ramp" aria-label="Schritt ${i+1} Verlauf"><option value="linear">Linear</option><option value="jump">Sprung</option><option value="hold">Halten</option></select></label><div class="step-actions"><button data-step-action="up" aria-label="Schritt ${i+1} nach oben" ${i===0?'disabled':''}>↑</button><button data-step-action="down" aria-label="Schritt ${i+1} nach unten" ${i===steps.length-1?'disabled':''}>↓</button><button data-step-action="delete" aria-label="Schritt ${i+1} löschen">×</button></div></div>`;}).join('');
 [...$('steps').children].forEach((row,i)=>{row.querySelector('[data-step-field=parameter]').value=steps[i].parameter;row.querySelector('[data-step-field=ramp]').value=steps[i].ramp;});
 $('addStep').disabled=steps.length>=20;
}
function recompute(reset=true){
 stop();try{
  states.forEach(s=>{validate(s.p);s.result=state(s.p);});
  process=mode==='process'?simulate(states[active].p,steps,processMode):null;
  index=reset?0:Math.min(index,(process?.records.length||1)-1);$('timeline').max=(process?.records.length||1)-1;$('timeline').value=index;
  $('stateRows').innerHTML=states.map((s,i)=>`<tr class="${i===active?'selected':''}"><td><button data-select="${i}">${i+1} · ${escape(s.name)}</button></td><td>${metals[s.p.metal].name} / ${s.p.level}</td><td>${fmt(s.p.current)}</td><td>${fmt(s.result.limit,3)}</td><td>${fmt(s.result.ratio,3)}</td><td>${fmt(s.result.inhibition,1)}</td><td>${escape(names[s.result.type])}</td></tr>`).join('');
  report('');document.querySelectorAll('[data-export],#csv,#save,#play').forEach(b=>b.disabled=false);render();
 }catch(e){process=null;report(e.message,true);document.querySelectorAll('[data-export],#csv,#save,#play').forEach(b=>b.disabled=true);$('warnings').textContent='Eingaben prüfen. Die letzte gültige Darstellung ist bis zur Korrektur eingefroren.';}
}
function render(){
 const rec=process?.records[index],s=rec||states[active].result,p=rec?.p||states[active].p;
 $('diagram').innerHTML=diagramSVG(states,active,process,index);$('morphology').innerHTML=morphologySVG(s,states[active].name);
 $('typeTitle').textContent=names[s.type];$('typeDescription').textContent=descriptions[s.type];
 const metrics=[['j / jgrenz [1]',fmt(s.ratio,3)],['Inhibierung [rel. %]',fmt(s.inhibition,1)],['jgrenz [A/dm²]',fmt(s.limit,3)],['Metallstromausbeute [%]',p.current===0?'—':fmt(s.efficiency*100,1)],['Freier Modellanteil [%]',fmt(s.free*100,1)],['Metall gesamt [mol/L]',fmt(s.concentration,3)],['Wachstumsrate [µm/min]',fmt(s.rate*60,3)],['Blasenindikator [rel. %]',fmt(s.bubble*100,1)]];
 $('metrics').innerHTML=metrics.map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('');
 $('warnings').textContent=s.warnings.join(' ')||'Modellpunkt innerhalb der Zeichenfläche. Die Gebietszuordnung und Additivwirkungen sind qualitativ; keine reale Gefügeprognose.';
 if(process){$('timeLabel').textContent=`${fmt(rec.t,1)} / ${fmt(process.totalTime,0)} s · Schritt ${rec.step} · ${processMode==='time'?'Zeitmodell':'Parameterpfad'}`;
 $('processSummary').textContent=processMode==='time'?`Aktuell ${fmt(rec.thickness,3)} µm · am Prozessende ${fmt(process.thickness,3)} µm. Die neue Lage zeigt ${names[s.type]}. Früher abgeschiedene Lagen bleiben erhalten.`:'Quasistationärer Pfad: Zwischenzustände erreichen sofort ihre Modellwerte. Es wird keine Schichtgeschichte berechnet.';
 if(processMode==='time')$('history').innerHTML=historySVG(process,index);}
}
function select(i){active=i;stop();controls();recompute();}
function add(s){if(states.length>=50)throw Error('Höchstens 50 Zustände möglich.');states.push(s);select(states.length-1);}
$('preset').innerHTML=presets.map((p,i)=>`<option value="${i}">${escape(p.name)}</option>`).join('');
$('scenario').innerHTML=scenarios.map((s,i)=>`<option value="${i}">${escape(s.name)}</option>`).join('');
$('scenarioHint').textContent=scenarios[0].why;
$('mode').onchange=()=>{mode=$('mode').value;controls();recompute();};
$('processMode').onchange=()=>{processMode=$('processMode').value;controls();recompute();};
$('level').onchange=()=>{states[active].p.level=Number($('level').value);steps=steps.filter(s=>fields[s.parameter][5]<=states[active].p.level);controls();recompute();};
$('active').onchange=()=>select(Number($('active').value));
$('metal').onchange=()=>{states[active].p.metal=$('metal').value;recompute();};
$('name').onchange=()=>{states[active].name=$('name').value.trim()||'Unbenannter Zustand';controls();recompute(false);};
$('loadPreset').onclick=()=>{try{const preset=presets[Number($('preset').value)];steps=steps.filter(s=>fields[s.parameter][5]<=preset.values.level);add({name:preset.name,p:{...preset.values}});}catch(e){report(e.message,true);}};
$('duplicate').onclick=()=>{try{add({name:(states[active].name+' · Kopie').slice(0,80),p:{...states[active].p}});}catch(e){report(e.message,true);}};
$('removeState').onclick=()=>{if(states.length>1){states.splice(active,1);select(Math.max(0,active-1));}};
$('reset').onclick=()=>{stop();states=[{name:'Ausgangszustand',p:{...defaults}}];active=0;mode='compare';steps=[{parameter:'transport',target:70,duration:180,ramp:'linear'}];processMode='path';controls();recompute();};
for(const container of ['fields','dynamicFields'])$(container).addEventListener('change',event=>{
 const k=event.target.dataset.field||event.target.dataset.slider;if(!k)return;
 states[active].p[k]=event.target.value===''?NaN:Number(event.target.value);
 const peer=event.target.dataset.field?$(container).querySelector(`[data-slider="${k}"]`):$(container).querySelector(`[data-field="${k}"]`);peer.value=event.target.value;recompute();
});
$('closed').onchange=()=>{states[active].p.closed=Number($('closed').checked);recompute();};
$('stateRows').onclick=e=>{const b=e.target.closest('[data-select]');if(b)select(Number(b.dataset.select));};
$('diagram').onclick=e=>{const b=e.target.closest('[data-state]');if(b)select(Number(b.dataset.state));};
$('diagram').onkeydown=e=>{if(['Enter',' '].includes(e.key)){const b=e.target.closest('[data-state]');if(b){e.preventDefault();select(Number(b.dataset.state));}}};
$('scenario').onchange=()=>{$('scenarioHint').textContent=scenarios[Number($('scenario').value)].why;};
$('loadScenario').onclick=()=>{const scenario=scenarios[Number($('scenario').value)];steps=(scenario.steps||[scenario]).map(s=>({parameter:s.parameter,target:s.target,duration:s.duration,ramp:s.ramp}));states[active].p.level=Math.max(states[active].p.level,...steps.map(s=>fields[s.parameter][5]));controls();recompute();};
$('addStep').onclick=()=>{if(steps.length<20){steps.push({parameter:'current',target:states[active].p.current,duration:60,ramp:'hold'});stepControls();recompute();}};
$('steps').onchange=e=>{const key=e.target.dataset.stepField,row=e.target.closest('[data-step]');if(!key||!row)return;const s=steps[Number(row.dataset.step)];s[key]=['parameter','ramp'].includes(key)?e.target.value:e.target.value===''?NaN:Number(e.target.value);if(key==='parameter')s.target=states[active].p[s.parameter];stepControls();recompute();};
$('steps').onclick=e=>{const key=e.target.dataset.stepAction,row=e.target.closest('[data-step]');if(!key||!row)return;const i=Number(row.dataset.step);if(key==='delete')steps.splice(i,1);else{const j=i+(key==='up'?-1:1);[steps[i],steps[j]]=[steps[j],steps[i]];}stepControls();recompute();};
$('timeline').oninput=()=>{stop();index=Number($('timeline').value);render();};
$('rewind').onclick=()=>{stop();index=0;$('timeline').value=0;render();};
$('play').onclick=()=>{if(timer){stop();return;}if(!process)return;if(index>=process.records.length-1)index=0;const stride=Math.max(1,Math.ceil(process.records.length/240));$('play').textContent='Pause';timer=setInterval(()=>{index=Math.min(index+stride,process.records.length-1);$('timeline').value=index;render();if(index===process.records.length-1)stop();},80);};
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
async function exportGraphic(id,format){
 stop();const svg=$(id).querySelector('svg');if(!svg)throw Error('Keine Grafik vorhanden.');
 const source=new XMLSerializer().serializeToString(svg),blob=new Blob([source],{type:'image/svg+xml;charset=utf-8'});
 if(format==='svg')download(blob,`winand-${id}.svg`);else{
  const url=URL.createObjectURL(blob);try{const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=svg.viewBox.baseVal.width*2;canvas.height=svg.viewBox.baseVal.height*2;canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw Error('PNG konnte nicht erzeugt werden.');download(png,`winand-${id}.png`);}finally{URL.revokeObjectURL(url);}
 }report('Grafik des ausgewählten Zustands exportiert.');
}
document.querySelectorAll('[data-export]').forEach(b=>b.onclick=()=>exportGraphic(b.dataset.export,b.dataset.format).catch(e=>report(e.message,true)));
$('save').onclick=()=>{stop();download(new Blob([JSON.stringify({version:VERSION,states:states.map(({name,p})=>({name,p})),active,mode,processMode,steps},null,2)],{type:'application/json'}),'winand-projekt.json');report('Projektdatei enthält Eingaben und Prozessschritte.');};
$('open').onchange=async()=>{const file=$('open').files[0];if(!file)return;try{if(file.size>250000)throw Error('Projektdatei zu groß (maximal 250 kB).');const data=validateSession(JSON.parse(await file.text()));if(data.steps.some(s=>fields[s.parameter][5]>data.states[data.active].p.level))throw Error('Prozess erfordert eine höhere Komplexitätsebene.');stop();states=data.states.map(s=>({name:s.name,p:{...s.p}}));active=data.active;mode=data.mode;processMode=data.processMode;steps=data.steps.map(s=>({...s}));controls();recompute();report('Projekt geladen.');}catch(e){report('Import abgelehnt: '+e.message,true);}finally{$('open').value='';}};
$('csv').onclick=()=>{stop();const quote=v=>'"'+String(v).replaceAll('"','""')+'"';const num=v=>String(v).replace('.',',');const header=['Zustand','Zeit_s','Schritt','Metall','Ebene','j_A_dm2','c_mol_L','km_um_s','jgrenz_A_dm2','j_durch_jgrenz','Inhibierung_rel_Prozent','Typ','Dicke_um','Metallstromausbeute','pH_Modell'];const rows=process?process.records.map(r=>[states[active].name,r.t,r.step,metals[r.p.metal].name,r.p.level,r.p.current,r.concentration,r.transport,r.limit,r.ratio,r.inhibition,r.type,processMode==='time'?r.thickness:'',r.efficiency,r.ph]):states.map(s=>[s.name,'','',metals[s.p.metal].name,s.p.level,s.p.current,s.result.concentration,s.result.transport,s.result.limit,s.result.ratio,s.result.inhibition,s.result.type,'',s.result.efficiency,s.result.ph]);download(new Blob(['\ufeff'+[header,...rows].map(row=>row.map(v=>quote(typeof v==='number'?num(v):v)).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}),'winand-werte.csv');report('Modellwerte exportiert. Vollständige Vorgaben über „Projekt speichern“ sichern.');};
controls();recompute();
