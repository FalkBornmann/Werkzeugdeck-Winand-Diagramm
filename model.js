export const VERSION = 2;
export const F = 96485.33212;
export const metals = {
  copper: {name:'Kupfer', z:2, M:0.063546, rho:8960, D:0.72e-9, baseline:0.10},
  nickel: {name:'Nickel', z:2, M:0.0586934, rho:8908, D:0.65e-9, baseline:0.24},
  zinc: {name:'Zink', z:2, M:0.06538, rho:7140, D:0.70e-9, baseline:0.16}
};
export const defaults = {level:1, metal:'copper', concentration:0.5, current:2, transport:20, temperature:25,
  ligand:0, strength:5, labile:0.6, ph:4, suppressor:0, brightener:0, accelerator:0, wetting:0, buffer:0,
  area:10, volume:1, closed:0, transportTau:8, adsorptionTau:20};
export const fields = {
 concentration:['Metall gesamt','mol/L',0.01,2,0.01,1], current:['Kathodische Stromdichte |j|','A/dm²',0,30,0.1,1],
 transport:['Stofftransport kₘ','µm/s',1,100,1,1], temperature:['Temperatur','°C',15,70,1,2],
 ligand:['Ligand gesamt (Modell)','mol/L',0,2,0.02,2], strength:['Komplexierungsstärke K (Modell)','L/mol',0.1,30,0.1,2],
 labile:['Nachlieferung aus Komplexen','Anteil',0,1,0.05,2], ph:['pH des Bades','',2,6,0.1,2],
 suppressor:['Grundglanzbildner / Inhibitor','rel. %',0,100,1,3], brightener:['Feinkorn-Glanzbildner','rel. %',0,100,1,3],
 accelerator:['Beschleunigender Zusatz','rel. %',0,100,1,3], wetting:['Netzmittel','rel. %',0,100,1,3], buffer:['Pufferkapazität','rel. %',0,100,1,3],
 area:['Aktive Fläche','cm²',1,1000,1,1],volume:['Badvolumen','L',0.05,20,0.05,1],
 transportTau:['Transport-Verzögerung τ','s',0,120,1,1], adsorptionTau:['Belegungs-Verzögerung τ','s',0,180,1,1]
};
export const presets = [
 {name:'Einfach · Kupfer ohne Zusätze',values:{...defaults}},
 {name:'Verdünnt · Transport wird knapp',values:{...defaults,concentration:0.1,current:2}},
 {name:'Komplexiert · generisches Kupfer-Modell',values:{...defaults,level:2,ligand:0.7,strength:5,labile:0.6}},
 {name:'Mehrkomponentenbad · Kupfer-Modell',values:{...defaults,level:3,ligand:0.3,suppressor:45,brightener:30,accelerator:15,wetting:60,buffer:60}},
 {name:'Mehrkomponentenbad · Nickel-Modell',values:{...defaults,level:3,metal:'nickel',ph:4.5,suppressor:35,brightener:40,wetting:50,buffer:75}},
 {name:'Einfach · Zink-Modell',values:{...defaults,metal:'zinc',concentration:0.3}},
 {name:'Übergang BR/FT · mögliche Zwillinge Z',values:{...defaults,level:3,current:4.8,suppressor:20}},
 {name:'Übergang FT/UD · Mischgefüge',values:{...defaults,level:3,current:4.8,suppressor:80}},
 {name:'FI · prismatische Spitzen / Whisker',values:{...defaults,current:10.6}},
 {name:'FI · Dendriten als mögliche Wachstumsform',values:{...defaults,current:16}}
];
export const scenarios = [
 {name:'Stofftransport stetig erhöhen',parameter:'transport',target:70,duration:180,ramp:'linear',why:'Bei gleicher Stromdichte wächst der Grenzstrom. Der Pfad wandert zu kleineren j/jgrenz.'},
 {name:'Stromdichte stetig senken',parameter:'current',target:0.4,duration:180,ramp:'linear',why:'Der geforderte Stoffumsatz sinkt. Die bereits abgeschiedenen Lagen bleiben erhalten.'},
 {name:'Metallkonzentration absenken',parameter:'concentration',target:0.08,duration:180,ramp:'linear',why:'Eine vorgegebene Konzentrationsrampe verringert den Grenzstrom. Das ist eine äußere Vorgabe, keine vollständige Verdünnungsbilanz.'},
 {name:'Inhibitor dosieren',parameter:'suppressor',target:80,duration:180,ramp:'linear',why:'Die qualitative Hemmung steigt. Im Zeitmodell folgt die Oberflächenbelegung verzögert.'},
 {name:'Komplexierung verstärken',parameter:'ligand',target:1.3,duration:180,ramp:'linear',why:'Freie Spezies und die Nachlieferung aus Komplexen bestimmen gemeinsam den Modell-Grenzstrom.'},
 {name:'Transportausfall und Erholung',steps:[{parameter:'transport',target:3,duration:90,ramp:'jump'},{parameter:'transport',target:50,duration:180,ramp:'jump'}],why:'Ein sprunghafter Eingriff zeigt verzögerte Transportantwort und unterschiedliche abgeschiedene Lagen.'},
 {name:'Von isolierten Kristallen zu möglichen Dendriten',parameter:'current',target:17,duration:180,ramp:'linear',why:'Bei geringer Hemmung zeigt das FI-Lehrbild mit wachsender Transportbeanspruchung erst Spitzen, dann mögliche Verzweigung. Dies ist keine berechnete Einsatzschwelle für Dendriten.'},
 {name:'Stromstufe und Erholungsphase',steps:[{parameter:'current',target:8,duration:90,ramp:'jump'},{parameter:'current',target:0.5,duration:180,ramp:'jump'}],why:'Hohe Stromdichte kann die Metallzufuhr überfordern. Danach wächst die Schicht unter anderen Bedingungen weiter.'}
];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function validate(p) {
 if (!p || typeof p!=='object' || !metals[p.metal] || ![1,2,3].includes(p.level)) throw Error('Unbekanntes Metall oder ungültige Komplexität.');
 for (const [k,f] of Object.entries(fields)) if (!Number.isFinite(p[k]) || p[k]<f[2] || p[k]>f[3]) throw Error(`${f[0]}: Wert zwischen ${f[2]} und ${f[3]} erforderlich.`);
 if (![0,1].includes(p.closed)) throw Error('Ungültiger Badmodus.');
 return p;
}
export function effective(p) {
 const q={...p};
 if(q.level<2) Object.assign(q,{ligand:0,temperature:25,ph:4});
 if(q.level<3) Object.assign(q,{suppressor:0,brightener:0,accelerator:0,wetting:0,buffer:0});
 return q;
}
// All coefficients below, except F and metal constants, define an illustrative teaching model.
export function equilibrium(p) {
 const q=effective(p), free=1/(1+q.strength*q.ligand), available=free+q.labile*(1-free);
 const coverage=q.suppressor/(q.suppressor+30);
 const fine=q.brightener/(q.brightener+40), accel=q.accelerator/(q.accelerator+40);
 return {q,free,available,coverage,fine,accel};
}
// Schematic geometry following the topology of the supplied Winand illustration.
// Coordinates are didactic normalized coordinates, NOT a numerical fit of measured boundaries.
export const geometry={lowEnd:0.30,junction:0.55,fiStart:0.46,udEnd:0.78,envelopeEnd:0.96};
export function boundaries(x) {
 const u=clamp(x,0,1),junctionY=32*Math.pow((geometry.junction-geometry.fiStart)/0.42,0.45);
 return {
  low:u<=geometry.lowEnd?26*Math.sqrt(Math.max(0,1-(u/geometry.lowEnd)**2)):0,
  brBottom:u<=geometry.junction?junctionY+(52-junctionY)*Math.pow(Math.max(0,1-(u/geometry.junction)**1.8),0.75):0,
  fiTop:u>=geometry.fiStart?32*Math.pow((u-geometry.fiStart)/0.42,0.45):0,
  ud:u<=geometry.udEnd?70*Math.pow(Math.max(0,1-(u/geometry.udEnd)**1.7),0.65):0,
  envelope:u<=geometry.envelopeEnd?90*Math.pow(Math.max(0,1-(u/geometry.envelopeEnd)**2),1/2.3):0
 };
}
export function classify(x,y,j=1) {
 if(j===0)return 'OFF';
 if(x>=1)return 'LIMIT';
 const b=boundaries(x);
 if(y>b.envelope||x>geometry.envelopeEnd)return 'OUT';
 if(x<=geometry.lowEnd&&y<b.low)return 'LOW';
 if(x>=geometry.fiStart&&y<b.fiTop)return 'FI';
 if(x<=geometry.junction&&y<b.brBottom)return 'BR';
 if(y<b.ud)return 'FT';
 return 'UD';
}
// Transition proximity: a purely graphical neighbourhood of radius 0.03 in
// normalized plot coordinates (x, H/100), not a physical coexistence band.
export const transitionRadius=0.03;
export function morphologyInfo(s) {
 const x=s.ratio,y=s.inhibition,type=s.type||classify(x,y);
 const empty={transition:null,growth:'ordinary',growthTitle:'',growthText:''};
 if(type==='OFF'||!Number.isFinite(x)||!Number.isFinite(y))return empty;
 let transition=null;
 if(!['OUT','LIMIT'].includes(type)){
  const adjacent=new Set([type]);
  for(let i=0;i<24;i++){
   const angle=i*Math.PI/12,nx=x+transitionRadius*Math.cos(angle),ny=y+100*transitionRadius*Math.sin(angle);
   if(nx<0||nx>=1||ny<0||ny>100)continue;
   const other=classify(nx,ny);if(!['OUT','LIMIT','OFF'].includes(other))adjacent.add(other);
  }
  if(adjacent.size>1){
   const types=[...adjacent].sort(),has=(a,b)=>adjacent.has(a)&&adjacent.has(b);
   if(has('BR','FT'))transition={key:'BR-FT',types,sketch:s.metal==='zinc'?'mixed':'twins',title:s.metal==='zinc'?'BR ↔ FT · mögliche Übergangsform':'BR ↔ FT · Zwillings-Zwischentyp Z möglich',text:s.metal==='zinc'?'Am schematischen Übergang können Merkmale von Basisreproduktion und feldorientiertem Wachstum nebeneinander vorkommen. Für Zink wird hier kein bestimmtes Zwillingsgesetz zugeordnet.':'Fischer/Winand beschreiben Z als möglichen Zwischentyp zwischen BR und FT. Die Skizze zeigt spiegelbildliche Orientierungen an Zwillingsgrenzen. Die Lage nahe einer gezeichneten Linie beweist keine reale Zwillingsbildung; Zwillinge können auch außerhalb dieses Übergangs auftreten.'};
   else if(has('FT','UD'))transition={key:'FT-UD',types,sketch:'mixed',title:'FT ↔ UD · säulenartiges und feines Mischgefüge',text:'Die Lehrskizze kombiniert längliche Körner mit neu gebildeten, unterschiedlich orientierten Körnern. Sie illustriert einen graduellen Wechsel der Wachstumsmerkmale, kein berechnetes Phasengemisch und keinen Kornanteil.'};
   else if(has('FI','BR'))transition={key:'BR-FI',types,sketch:'mixed',title:'BR ↔ FI · grobe Körner mit einzelnen Spitzen',text:'Aus einem gröberen zusammenhängenden Gefüge können einzelne Kristalle hervorragen. Winand beschreibt auch eine zeitliche Aufrauung von BR bis zu FI. Das Tool berechnet diese Alterung nicht allein aus der Position.'};
   else if(has('FI','FT'))transition={key:'FI-FT',types,sketch:'mixed',title:'FI ↔ FT · isolierte und zusammenwachsende Säulen',text:'Die Skizze stellt isolierte Wachstumsformen neben stärker geschlossenem säulenartigem Wachstum dar. Eine allgemeingültige besondere Kristallstruktur an dieser Linie ist nicht festgelegt.'};
   else if(has('LOW','BR'))transition={key:'LOW-BR',types,sketch:'mixed',title:'FI / geringe Bedeckung ↔ BR · Inseln wachsen zusammen',text:'Eine mögliche Anschauung sind zunächst getrennte Kristallinseln und ihre zunehmende Verbindung. Bedeckungsgrad und reale Koaleszenz werden hier nicht zeitlich berechnet.'};
   else transition={key:'mixed',types,sketch:'mixed',title:'Übergangsbereich · gemischte Wachstumsmerkmale',text:'Nahe einer schematischen Linie werden Merkmale benachbarter Typen nebeneinander gezeigt. Es wird keine eigene gesicherte Gefügeklasse vorhergesagt.'};
  }
 }
 let growth='ordinary',growthTitle='',growthText='';
 if(type==='FI'&&x>=0.5&&y<=35){
  growth=x>=0.7?'dendritic':'needles';
  growthTitle=growth==='dendritic'?'Mögliches dendritisches Wachstum':'Mögliche prismatische Spitzen / Whisker';
  growthText=growth==='dendritic'?'Vorsprünge können mehr Ionenfluss als ihre Umgebung erhalten und sich weiter verzweigen. Die Skizze zeigt Stamm, Seitenäste und aktive Spitzen; keine vorausgesagte Astlänge oder Wachstumszeit.':'Geringe Hemmung kann das Hervortreten einzelner Kristalle begünstigen. Die Skizze unterscheidet unverzweigte Nadeln von verzweigten Dendriten.';
 }else if(type==='LIMIT'&&y<=35){growth='transport-warning';growthTitle='Transportlimit · Spitzenwachstum möglich';growthText='Bei knappem Stoffnachschub kann lokalisierter Fluss das Wachstum von Vorsprüngen verstärken. Außerhalb des Kartenkerns wird nur eine mögliche Instabilität illustriert, kein gesicherter Dendritenzustand zugeordnet.';}
 if(growth!=='ordinary')growthText+=' Die Auswahl bei x ≥ 0,5 bzw. 0,7 und H ≤ 35 ist eine frei gesetzte Lehrregel, keine experimentell gültige Grenze oder Wahrscheinlichkeit. Dendriten hängen zusätzlich von Metall, Konzentration, Kinetik, Oberfläche, Zeit und lokaler Strömung ab.';
 return {transition,growth,growthTitle,growthText};
}
export function state(p,dynamic={}) {
 const e=equilibrium(p),q=e.q,m=metals[q.metal];
 const c=dynamic.concentration??q.concentration, k=dynamic.transport??q.transport;
 const cover=dynamic.coverage??e.coverage, ph=dynamic.ph??q.ph;
 const temperatureFactor=(q.temperature+273.15)/298.15*Math.exp(0.017*(q.temperature-25));
 const limit=m.z*F*(k*1e-6)*temperatureFactor*(c*1000)*e.available/100;
 const inhibition=100*(1-Math.exp(-(m.baseline+0.42*(1-e.free)+1.25*cover+0.85*e.fine-0.50*e.accel*(1-0.5*cover)+0.06*Math.max(0,ph-4))));
 const y=clamp(inhibition,0,100),ratio=q.current/Math.max(limit,1e-12);
 const efficiency=clamp(0.98-0.09*(q.metal==='nickel')-0.07*(q.metal==='zinc')-0.08*cover-0.04*(1-e.free)-0.06*Math.max(0,ph-5),0.4,0.99);
 const deposited=Math.min(q.current*efficiency,limit);
 const rate=deposited*100*m.M/(m.z*F*m.rho)*1e6;
 const side=Math.max(0,q.current-deposited),bubble=side/(q.current||1)*(1-0.7*q.wetting/100);
 const warnings=[];
 if(ratio>=1) warnings.push('Metallzufuhr reicht für die vorgegebene Stromdichte nicht aus. Nebenreaktionen werden im Lehrmodell zusammengefasst; außerhalb des Diagrammkerns.');
 if(ratio>1) warnings.push('Die Karte endet bei j/jgrenz = 1. Die Gesamtstromvorgabe liegt darüber und wird mit ihrem tatsächlichen Zahlenwert am rechten Rand markiert.');
 if(c<0.01) warnings.push('Bad nahezu erschöpft: Modell außerhalb des vorgesehenen Konzentrationsbereichs.');
 if(q.current===0) warnings.push('Strom ausgeschaltet: kein Schichtwachstum. Die Hemmungskoordinate ist nur ein Modellwert.');
 return {metal:q.metal,ratio,inhibition:y,limit,free:e.free,available:e.available,coverage:cover,concentration:c,transport:k,ph,efficiency:deposited/(q.current||1),rate,side,bubble,type:classify(ratio,y,q.current),warnings};
}
export function validateStep(s) {
 const f=fields[s?.parameter];
 if(!f || ['area','volume','transportTau','adsorptionTau'].includes(s.parameter) || !Number.isFinite(s.target) || s.target<f[2] || s.target>f[3] || !Number.isFinite(s.duration) || s.duration<1 || s.duration>3600 || !['linear','jump','hold'].includes(s.ramp)) throw Error('Ungültiger Prozessschritt (Zielbereich, Dauer 1–3600 s, Verlauf).');
 return s;
}
export function simulate(start,steps,mode='path') {
 validate(start); if(!Array.isArray(steps)||steps.length>20||!['path','time'].includes(mode)) throw Error('Ungültiger Prozess.');steps.forEach(validateStep);
 if(steps.some(s=>fields[s.parameter][5]>start.level)) throw Error('Für diesen Prozess eine höhere Komplexitätsebene wählen.');
 let p={...start},dyn={concentration:p.concentration,transport:p.transport,coverage:equilibrium(p).coverage,ph:effective(p).ph};
 let t=0,thickness=0,removed=0;const records=[],layers=[];
 const record=(s,step)=>records.push({t,thickness,step,p:{...p},...s});
 record(state(p),0);
 steps.forEach((step,index)=>{
  const from=p[step.parameter],n=Math.max(40,Math.ceil(step.duration/0.5)),dt=step.duration/n;
  for(let i=1;i<=n;i++){
   p[step.parameter]=step.ramp==='hold'?from:step.ramp==='jump'?step.target:from+(step.target-from)*i/n;
   const eq=equilibrium(p);
   if(mode==='time'){
    const relax=(old,target,tau)=>target+(old-target)*Math.exp(-dt/Math.max(tau,1e-8));
    dyn.transport=relax(dyn.transport,p.transport,p.transportTau);
    dyn.coverage=relax(dyn.coverage,eq.coverage,p.adsorptionTau);
    dyn.concentration=Math.max(0,p.concentration-removed);
   }
   let s=state(p,mode==='time'?dyn:{});
   if(mode==='time'){
    const dpH=1.5*s.side/(p.current||1)/(1+eq.q.buffer/10);
    dyn.ph=eq.q.ph+dpH*(1-Math.exp(-(t+dt)/60));
    s=state(p,dyn);
    const dh=s.rate*dt;
    if(dh>0){const detail=morphologyInfo(s);layers.push({bottom:thickness,top:thickness+dh,type:s.type,transition:detail.transition?.key||'',growth:detail.growth,t:t+dt});}
    thickness+=dh;
    if(p.closed)removed+=s.rate*1e-6*metals[p.metal].rho*(p.area*1e-4)*dt/metals[p.metal].M/(p.volume*1e-3)/1000;
   }
   if(mode==='time' && p.closed){dyn.concentration=Math.max(0,p.concentration-removed);s=state(p,dyn);}
t+=dt;record(s,index+1);
  }
  if(step.ramp==='hold')p[step.parameter]=from;
 });
 return {records,layers,mode,totalTime:t,thickness,final:{...p}};
}
export function validateSession(data) {
 if(!data||![1,VERSION].includes(data.version)||!Array.isArray(data.states)||data.states.length<1||data.states.length>50||!Array.isArray(data.steps)||data.steps.length>20)throw Error('Unbekannte Projektdatei oder zu viele Zustände/Schritte.');
 data.states.forEach(s=>{if(typeof s.name!=='string'||s.name.length>80)throw Error('Ungültige Zustandsbezeichnung.');validate(s.p);});
 data.steps.forEach(validateStep);
 if(!['compare','process'].includes(data.mode)||!['path','time'].includes(data.processMode)||!Number.isInteger(data.active)||data.active<0||data.active>=data.states.length)throw Error('Ungültige Ansicht.');
 const processStart=data.version===1?0:data.processStart;
 if(!Number.isInteger(processStart)||processStart<0||processStart>=data.states.length)throw Error('Ungültiger Prozessstart.');
 if(data.mode==='process'&&data.steps.some(s=>fields[s.parameter][5]>data.states[processStart].p.level))throw Error('Prozessstart benötigt eine höhere Komplexitätsebene.');
 const states=data.states.map(s=>({name:data.version===1&&/^Ausgangszustand(?: · Kopie)*$/.test(s.name)?'':s.name,p:{...s.p}}));
 return {...data,states,version:VERSION,processStart,monochrome:data.monochrome!==false};
}
