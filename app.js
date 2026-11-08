import './export-menu.js';
import {mountTimelineDock} from './timeline-dock.js';
import {defaults,presets,fields,metals,state,simulate,simulateStates,scenarios,validate,validateSession,VERSION,morphologyInfo,surfaceInfo,choices} from './model.js';
import {StateBook,stateCode,stateName,stateTitle} from './workspace.js';
import {escape,diagramSVG,morphologySVG,historySVG,surfaceSVG,names,descriptions} from './render.js';
const $=id=>document.getElementById(id),fmt=(v,d=2)=>Number(v).toLocaleString('de-DE',{maximumFractionDigits:d});
let book=new StateBook(),mode='compare',processMode='path',processSource='steps',transitions=[],steps=[{parameter:'transport',target:70,duration:180,ramp:'linear'}],process=null,index=0,timer=null,monochrome=true;
const timelineDock = mountTimelineDock(document.getElementById('time-controls'));
const dynamicKeys=['area','volume','transportTau','adsorptionTau'];
const report=(message,error=false)=>{$('status').textContent=message;$('status').className=error?'error':'';};
const label=i=>stateTitle(book.states[i],i,book.states.length);
function stop(){if(timer)clearInterval(timer);timer=null;$('play').textContent='Abspielen';}
function stateBar(){
 $('stateBar').innerHTML=book.states.map((s,i)=>`<button data-select="${i}" class="state-chip ${i===book.active?'selected':''}" aria-pressed="${i===book.active}" aria-label="${escape(label(i))}"><strong>${stateCode(i,book.states.length)}</strong><span>${stateName(i)}</span>${s.name?`<small>${escape(s.name)}</small>`:''}${i===book.states.length-1&&i>0?'<small>Endzustand des Vergleichs</small>':''}</button>`).join('');
}
const originIndex=()=>processSource==='states'?0:book.processStart;
const processOrigin=()=>({...book.states[originIndex()].p});
function syncTransitions(){transitions=book.states.slice(1).map((_,i)=>transitions[i]||{duration:60,ramp:'linear'});}
function controls(){
 syncTransitions();
 const p=book.states[book.active].p,origin=processOrigin(),options=book.states.map((s,i)=>`<option value="${i}">${escape(label(i))}</option>`).join('');
 $('active').innerHTML=options;$('active').value=book.active;$('processStart').innerHTML=options;$('processStart').value=originIndex();$('processStart').disabled=processSource==='states';$('processSource').value=processSource;
 $('parameterProcess').hidden=processSource!=='steps';$('stateProcess').hidden=processSource!=='states';
 $('name').value=book.states[book.active].name;$('metal').value=p.metal;$('level').value=p.level;$('mode').value=mode;$('processMode').value=processMode;$('closed').checked=!!origin.closed;$('monochrome').checked=monochrome;
 $('editorTitle').textContent=`${stateName(book.active)} bearbeiten (${stateCode(book.active,book.states.length)})`;
 $('fields').innerHTML=Object.entries(fields).filter(([k,f])=>!dynamicKeys.includes(k)&&f[5]<=p.level).map(([k,f])=>field(k,f,p)).join('');
 $('dynamicFields').innerHTML=dynamicKeys.map(k=>field(k,fields[k],origin)).join('');
 $('removeState').disabled=book.states.length===1;$('duplicate').disabled=book.states.length>=50;
 $('processPanel').hidden=mode!=='process';$('originSelection').hidden=mode!=='process';$('timeSettings').hidden=processMode!=='time';$('historyPanel').hidden=mode!=='process'||processMode!=='time';
 $('processOriginInfo').textContent=processSource==='states'?'Zustandsfolge: AZ → Z2 → … → EZ. Alle gespeicherten Zustände werden in ihrer Reihenfolge verwendet. Änderungen an einem Punkt aktualisieren den Prozess; die Editor-Auswahl ändert seine Reihenfolge nicht.':`Fester Prozessstart: ${label(originIndex())}. Die Auswahl im Zustandseditor ändert diesen Start nicht. Die Simulation verändert keinen gespeicherten Zustand. Wenn du diesen Startzustand selbst bearbeitest, wird der Prozess bewusst neu berechnet.`;
 $('levelHint').textContent=['','Einfach: Konzentration, Stromdichte und Stofftransport. Temperatur 25 °C, pH 4 und keine Zusätze.','Komplexierung: generischer Ligand, Nachlieferung aus Komplexen sowie illustrative Temperatur- und pH-Wirkungen.','Mehrkomponentenbad: generische Glanzbildner, Beschleuniger, Netzmittel und Puffer. Relative Modellwerte, keine industrielle Rezeptur.'][p.level];
 stateBar();stepControls();transitionControls();
}
function field(k,f,p){if(choices[k])return '<label>'+escape(f[0])+'<select aria-label="'+escape(f[0])+'" data-field="'+k+'">'+choices[k].map((name,i)=>'<option value="'+i+'" '+(p[k]===i?'selected':'')+'>'+escape(name)+'</option>').join('')+'</select></label>';return `<label>${escape(f[0])} <span class="unit">${escape(f[1])}</span><div class="mini"><input aria-label="${escape(f[0])}" data-field="${k}" type="number" min="${f[2]}" max="${f[3]}" step="${f[4]}" value="${p[k]}"><input aria-label="${escape(f[0])} Schieberegler" data-slider="${k}" type="range" min="${f[2]}" max="${f[3]}" step="${f[4]}" value="${p[k]}"></div></label>`;}
function stepControls(){
 const options=Object.entries(fields).filter(([k])=>!dynamicKeys.includes(k)&&!choices[k]).map(([k,f])=>`<option value="${k}">${escape(f[0])} ${escape(f[1])}${f[5]>processOrigin().level?' (höhere Ebene)':''}</option>`).join('');
 $('steps').innerHTML=steps.map((s,i)=>{const f=fields[s.parameter];return `<div class="step" data-step="${i}"><span class="step-number">${i+1}</span><label>Parameter<select data-step-field="parameter" aria-label="Schritt ${i+1} Parameter">${options}</select></label><label>Ziel (${escape(f[1]||'ohne Einheit')})<input data-step-field="target" aria-label="Schritt ${i+1} Ziel" type="number" min="${f[2]}" max="${f[3]}" step="${f[4]}" value="${s.target}"></label><label>Dauer (s)<input data-step-field="duration" aria-label="Schritt ${i+1} Dauer" type="number" min="1" max="3600" value="${s.duration}"></label><label>Verlauf<select data-step-field="ramp" aria-label="Schritt ${i+1} Verlauf"><option value="linear">Linear</option><option value="jump">Sprung</option><option value="hold">Halten</option></select></label><div class="step-actions"><button data-step-action="up" aria-label="Schritt ${i+1} nach oben" ${i===0?'disabled':''}>↑</button><button data-step-action="down" aria-label="Schritt ${i+1} nach unten" ${i===steps.length-1?'disabled':''}>↓</button><button data-step-action="delete" aria-label="Schritt ${i+1} löschen">×</button></div></div>`;}).join('');
 [...$('steps').children].forEach((row,i)=>{row.querySelector('[data-step-field=parameter]').value=steps[i].parameter;row.querySelector('[data-step-field=ramp]').value=steps[i].ramp;});
 $('addStep').disabled=steps.length>=20;
}
function transitionControls(){
 syncTransitions();
 $('transitions').innerHTML=transitions.map((s,i)=>`<div class="step state-transition"><strong>${escape(stateCode(i,book.states.length))} → ${escape(stateCode(i+1,book.states.length))}</strong><label>Dauer / s<input data-transition="${i}" data-transition-field="duration" aria-label="Übergang ${i+1} Dauer" type="number" min="1" max="3600" value="${s.duration}"></label><label>Verlauf<select data-transition="${i}" data-transition-field="ramp" aria-label="Übergang ${i+1} Verlauf"><option value="linear">Rampe · gemeinsam zum Ziel</option><option value="jump">Sprung · danach halten</option></select></label></div>`).join('')||'<p class="notice">Lege über „Neuen Zustand anlegen“ mindestens einen weiteren Zustand an.</p>';
 $('transitions').querySelectorAll('select').forEach((el,i)=>el.value=transitions[i].ramp);
}
function recompute(reset=true){
 syncTransitions();
 stop();try{
  book.states.forEach(s=>{validate(s.p);s.result=state(s.p);});
  process=mode==='process'?(processSource==='states'?simulateStates(book.states,transitions,processMode):simulate(processOrigin(),steps,processMode)):null;
  index=reset?0:Math.min(index,(process?.records.length||1)-1);$('timeline').max=(process?.records.length||1)-1;$('timeline').value=index;
  $('stateRows').innerHTML=book.states.map((s,i)=>`<tr class="${i===book.active?'selected':''}"><td><button data-select="${i}">${escape(label(i))}</button></td><td>${metals[s.p.metal].name} / ${s.p.level}</td><td>${fmt(s.p.current)}</td><td>${fmt(s.result.limit,3)}</td><td>${fmt(s.result.ratio,3)}</td><td>${fmt(s.result.inhibition,1)}</td><td>${escape(names[s.result.type])}</td></tr>`).join('');
  report('');document.querySelectorAll('[data-export],#csv,#save,#play,#timeline,#rewind').forEach(b=>b.disabled=false);render();
 }catch(e){process=null;timelineDock.setActive(false);report(e.message,true);document.querySelectorAll('[data-export],#csv,#save,#play,#timeline,#rewind').forEach(b=>b.disabled=true);$('warnings').textContent='Eingaben und Prozessstart prüfen. Die letzte gültige Darstellung bleibt bis zur Korrektur eingefroren.';}
}
function render(){
 timelineDock.setActive(mode === 'process' && !!process);
 const rec=process?.records[index],s=rec||book.states[book.active].result,p=rec?.p||book.states[book.active].p;
 $('diagram').innerHTML=diagramSVG(book.states,book.active,process,index,{monochrome});
 const displayLabel=rec?`Simulation · ${fmt(rec.t,1)} s · Start ${stateCode(originIndex(),book.states.length)}`:label(book.active);
 $('resultContext').textContent=rec?`Ergebnisse der Simulation (${fmt(rec.t,1)} s). Gespeicherte Kreise bleiben unverändert; der schwarze Rhombus zeigt den laufenden Prozess.`:`Ergebnisse von ${label(book.active)}. Änderungen gelten ausschließlich für diesen Zustand.`;
 const detail=morphologyInfo(s);
 const top=surfaceInfo(s);
 $('surface').innerHTML=surfaceSVG(s,displayLabel,{monochrome});
 $('surfaceDescription').textContent=top.texture+' · '+top.gloss+'. Dargestellt ist die Tendenz der neu entstehenden Schicht. Vertiefungen illustrieren mögliche Fehlstellen durch anhaftende H₂-Blasen; der Glanz ist kein Messwert.';
 $('surfaceMetrics').innerHTML=[['H₂-Teilstrom / (A/dm²)',fmt(s.hydrogenCurrent,3)],['Lokaler pH (Modell)',fmt(s.ph,2)],['Porentendenz (rel.)',fmt(top.pits,2)],['Blasenblockierung / % (Modell)',fmt(s.bubbleCoverage*100,1)]].map(([name,value])=>'<div><span>'+name+'</span><strong>'+value+'</strong></div>').join('');
 $('additiveEffects').textContent='Netzmittel: '+(p.level===3?choices.wettingMode[p.wettingMode]:'nicht zugeschaltet')+'. Puffer: '+(p.level===3?choices.bufferMode[p.bufferMode]:'nicht zugeschaltet')+'. Metall- und H₂-Teilstrom ergeben zusammen die Gesamtstromvorgabe. Blasenablösung und H₂-Erzeugung sind unterschiedliche Wirkungen.';
 $('morphology').innerHTML=morphologySVG(s,displayLabel);$('typeTitle').textContent=detail.growthTitle||detail.transition?.title||names[s.type];$('typeDescription').textContent='Grundzuordnung: '+names[s.type]+'. '+descriptions[s.type];
 $('morphologyNotes').innerHTML=(detail.transition?'<p><strong>Nahe einer schematischen Grenze</strong><br>'+escape(detail.transition.text)+'</p>':'')+(detail.growthTitle?'<p><strong>'+escape(detail.growthTitle)+'</strong><br>'+escape(detail.growthText)+'</p>':'')||'<p>Hier ist keine zusätzliche Lehrform ausgewählt. Das schließt reale Mischgefüge, Zwillinge oder Dendriten nicht aus.</p>';
 const metrics=[['i/i<sub>grenz</sub>',fmt(s.ratio,3)],['Inhibierung (Modellskala)',fmt(s.inhibition,1)],['i<sub>grenz</sub> / (A/dm²)',fmt(s.limit,3)],['Metallstromausbeute / %',p.current===0?'—':fmt(s.efficiency*100,1)],['Freier Modellanteil / %',fmt(s.free*100,1)],['Metall gesamt / (mol/L)',fmt(s.concentration,3)],['Wachstumsrate / (µm/min)',fmt(s.rate*60,3)],['Blasen-/Porentendenz / % (Modell)',fmt(s.bubble*100,1)]];
 $('metrics').innerHTML=metrics.map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('');
 $('warnings').textContent=s.warnings.join(' ')||'Die Karte ist schematisch. Schraffuren und Trennlinien kennzeichnen die Gebiete auch ohne Farbe; außerhalb der Referenzgebiete erfolgt keine Zuordnung.';
 if(process){$('timeline').setAttribute('aria-valuetext',fmt(rec.t,1)+' von '+fmt(process.totalTime,0)+' Sekunden');$('timeLabel').textContent=`${fmt(rec.t,1)} / ${fmt(process.totalTime,0)} s · Schritt ${rec.step} · ${processMode==='time'?'Zeitmodell':'Parameterpfad'}`;
 $('processSummary').textContent=processMode==='time'?`Aktuell ${fmt(rec.thickness,3)} µm · am Prozessende ${fmt(process.thickness,3)} µm. Aktuelle Modellzuordnung: ${names[s.type]}. Vorhandene Lagen und gespeicherte Vergleichszustände bleiben erhalten.`:'Quasistationärer Pfad: Zwischenzustände erreichen sofort ihre Modellwerte. Die Raute ist ein Simulationspunkt, kein gespeicherter Vergleichszustand.';
 if(processMode==='time')$('history').innerHTML=historySVG(process,index);}
}
function select(i){book.select(i);stop();controls();recompute(false);}
$('preset').innerHTML=presets.map((p,i)=>`<option value="${i}">${escape(p.name)}</option>`).join('');
$('scenario').innerHTML=scenarios.map((s,i)=>`<option value="${i}">${escape(s.name)}</option>`).join('');$('scenarioHint').textContent=scenarios[0].why;
$('mode').onchange=()=>{mode=$('mode').value;controls();recompute(false);};
$('processSource').onchange=()=>{processSource=$('processSource').value;controls();recompute();};
$('transitions').onchange=e=>{const i=Number(e.target.dataset.transition),key=e.target.dataset.transitionField;if(!key)return;transitions[i][key]=key==='duration'?(e.target.value===''?NaN:Number(e.target.value)):e.target.value;recompute();};
$('processMode').onchange=()=>{processMode=$('processMode').value;controls();recompute();};
$('processStart').onchange=()=>{book.setOrigin(Number($('processStart').value));controls();recompute();};
$('level').onchange=()=>{book.patch({level:Number($('level').value)});controls();recompute(processSource==='states'||book.active===book.processStart);};
$('active').onchange=()=>select(Number($('active').value));
$('metal').onchange=()=>{book.patch({metal:$('metal').value});recompute(processSource==='states'||book.active===book.processStart);};
$('name').onchange=()=>{book.rename($('name').value.trim());controls();recompute(false);};
$('loadPreset').onclick=()=>{try{book.add(presets[Number($('preset').value)].values,presets[Number($('preset').value)].name);controls();recompute(false);}catch(e){report(e.message,true);}};
$('duplicate').onclick=()=>{try{book.add();controls();recompute(false);}catch(e){report(e.message,true);}};
$('removeState').onclick=()=>{if(book.states.length>1)transitions.splice(Math.max(0,book.active-1),1);book.remove();controls();recompute();};
$('reset').onclick=()=>{stop();book=new StateBook();mode='compare';processSource='steps';transitions=[];steps=[{parameter:'transport',target:70,duration:180,ramp:'linear'}];processMode='path';controls();recompute();};
$('fields').addEventListener('change',event=>{
 const k=event.target.dataset.field||event.target.dataset.slider;if(!k)return;
 book.patch({[k]:event.target.value===''?NaN:Number(event.target.value)});
 const peer=event.target.dataset.field?$('fields').querySelector(`[data-slider="${k}"]`):$('fields').querySelector(`[data-field="${k}"]`);if(peer)peer.value=event.target.value;recompute(processSource==='states'||book.active===book.processStart);
});
$('dynamicFields').addEventListener('change',event=>{
 const k=event.target.dataset.field||event.target.dataset.slider;if(!k)return;
 const editing=book.active;book.select(originIndex());book.patch({[k]:event.target.value===''?NaN:Number(event.target.value)});book.select(editing);
 const peer=event.target.dataset.field?$('dynamicFields').querySelector(`[data-slider="${k}"]`):$('dynamicFields').querySelector(`[data-field="${k}"]`);peer.value=event.target.value;recompute();
});
$('closed').onchange=()=>{const editing=book.active;book.select(originIndex());book.patch({closed:Number($('closed').checked)});book.select(editing);recompute();};
for(const id of ['stateRows','stateBar'])$(id).onclick=e=>{const b=e.target.closest('[data-select]');if(b)select(Number(b.dataset.select));};
$('diagram').onclick=e=>{const b=e.target.closest('[data-state]');if(b)select(Number(b.dataset.state));};
$('diagram').onkeydown=e=>{if(['Enter',' '].includes(e.key)){const b=e.target.closest('[data-state]');if(b){e.preventDefault();select(Number(b.dataset.state));}}};
$('monochrome').onchange=()=>{monochrome=$('monochrome').checked;stop();render();};
$('scenario').onchange=()=>{$('scenarioHint').textContent=scenarios[Number($('scenario').value)].why;};
$('loadScenario').onclick=()=>{processSource='steps';const scenario=scenarios[Number($('scenario').value)];steps=(scenario.steps||[scenario]).map(s=>({parameter:s.parameter,target:s.target,duration:s.duration,ramp:s.ramp}));controls();recompute();const required=Math.max(...steps.map(s=>fields[s.parameter][5]));if(required>processOrigin().level)report(`Dieses Szenario benötigt mindestens Ebene ${required}. Wähle den Prozessstart im Zustandseditor und erhöhe dort die Ebene.`,true);};
$('addStep').onclick=()=>{if(steps.length<20){steps.push({parameter:'current',target:processOrigin().current,duration:60,ramp:'hold'});stepControls();recompute();}};
$('steps').onchange=e=>{const key=e.target.dataset.stepField,row=e.target.closest('[data-step]');if(!key||!row)return;const s=steps[Number(row.dataset.step)];s[key]=['parameter','ramp'].includes(key)?e.target.value:e.target.value===''?NaN:Number(e.target.value);if(key==='parameter')s.target=processOrigin()[s.parameter];stepControls();recompute();};
$('steps').onclick=e=>{const key=e.target.dataset.stepAction,row=e.target.closest('[data-step]');if(!key||!row)return;const i=Number(row.dataset.step);if(key==='delete')steps.splice(i,1);else{const j=i+(key==='up'?-1:1);[steps[i],steps[j]]=[steps[j],steps[i]];}stepControls();recompute();};
$('timeline').oninput=()=>{stop();index=Number($('timeline').value);render();};$('rewind').onclick=()=>{stop();index=0;$('timeline').value=0;render();};
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
$('save').onclick=()=>{stop();download(new Blob([JSON.stringify({version:VERSION,states:book.states.map(({name,p})=>({name,p})),active:book.active,processStart:book.processStart,mode,processMode,processSource,transitions,steps,monochrome},null,2)],{type:'application/json'}),'winand-projekt.json');report('Projekt mit unabhängigen Zuständen, festem Prozessstart und Prozessschritten gespeichert.');};
$('open').onchange=async()=>{const file=$('open').files[0];if(!file)return;try{if(file.size>250000)throw Error('Projektdatei zu groß (maximal 250 kB).');const data=validateSession(JSON.parse(await file.text()));stop();book=new StateBook(data.states,data.active,data.processStart);mode=data.mode;processMode=data.processMode;processSource=data.processSource;transitions=data.transitions.map(s=>({...s}));steps=data.steps.map(s=>({...s}));monochrome=data.monochrome;controls();recompute();report('Projekt geladen; Ergebnisse wurden mit dem aktuellen Lehrmodell neu berechnet.');}catch(e){report('Import abgelehnt: '+e.message,true);}finally{$('open').value='';}};
$('csv').onclick=()=>{stop();const quote=v=>'"'+String(v).replaceAll('"','""')+'"',num=v=>String(v).replace('.',',');const header=['Zustand','Zeit_s','Schritt','Metall','Ebene','j_A_dm2','c_mol_L','km_um_s','jgrenz_A_dm2','j_durch_jgrenz','Inhibierung_rel_Prozent','Typ','Dicke_um','Metallstromausbeute','pH_Modell','Uebergang_Lehrhinweis','Spitzenwachstum_Lehrhinweis','jMetall_A_dm2','jH2_A_dm2','Blasenblockierung','pH_Filmindex','Porentendenz','Rauheit_rel','Glanz_Tendenz'];const rows=process?process.records.map(r=>['Simulation ab '+label(originIndex()),r.t,r.step,metals[r.p.metal].name,r.p.level,r.p.current,r.concentration,r.transport,r.limit,r.ratio,r.inhibition,r.type,processMode==='time'?r.thickness:'',r.efficiency,r.ph,morphologyInfo(r).transition?.key||'',morphologyInfo(r).growthTitle||'',r.metalCurrent,r.hydrogenCurrent,r.bubbleCoverage,r.film,surfaceInfo(r).pits,surfaceInfo(r).roughness,surfaceInfo(r).gloss]):book.states.map((s,i)=>[label(i),'','',metals[s.p.metal].name,s.p.level,s.p.current,s.result.concentration,s.result.transport,s.result.limit,s.result.ratio,s.result.inhibition,s.result.type,'',s.result.efficiency,s.result.ph,morphologyInfo(s.result).transition?.key||'',morphologyInfo(s.result).growthTitle||'',s.result.metalCurrent,s.result.hydrogenCurrent,s.result.bubbleCoverage,s.result.film,surfaceInfo(s.result).pits,surfaceInfo(s.result).roughness,surfaceInfo(s.result).gloss]);download(new Blob(['\ufeff'+[header,...rows].map(row=>row.map(v=>quote(typeof v==='number'?num(v):v)).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}),'winand-werte.csv');report('Werte exportiert. Vollständige Vorgaben über „Projekt speichern“ sichern.');};
controls();recompute();

WDExports.mount({
  anchor: document.querySelector('[data-export="diagram"]').parentElement,
  defaultItem: 'diagram',
  legacyButtons: [...document.querySelectorAll('[data-export]')],
  items: [['diagram','Winand-Diagramm'],['surface','Oberflächenansicht'],['morphology','Gefügeskizze'],['history','Schichthistorie']].map(([id,label]) => ({
    id, label,
    enabled: () => !document.querySelector('[data-export="'+id+'"]').disabled && (id !== 'history' || !!process && processMode === 'time'),
    videoReady: () => !!process && (id !== 'history' || processMode === 'time'),
    save: format => exportGraphic(id, format),
    video: () => {
      stop();
      if (!process) throw new Error('Zuerst in den Simulationsmodus wechseln.');
      const previous = index, last = process.records.length - 1;
      return {
        title: 'Winand-Diagramm · ' + label, color: '#163e50',
        frame: fraction => { index = Math.round(fraction * last); $('timeline').value = index; render(); return $(id).querySelector('svg'); },
        caption: () => $('timeLabel').textContent,
        restore: () => { index = previous; $('timeline').value = index; render(); }
      };
    }
  }))
});
