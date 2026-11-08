export const VERSION = 4;
export const F = 96485.33212;
export const metals = {
  copper: {name:'Kupfer', z:2, M:0.063546, rho:8960, D:0.72e-9, baseline:0.10},
  nickel: {name:'Nickel', z:2, M:0.0586934, rho:8908, D:0.65e-9, baseline:0.24},
  zinc: {name:'Zink', z:2, M:0.06538, rho:7140, D:0.70e-9, baseline:0.16}
};
export const defaults = {level:1, metal:'copper', concentration:0.5, current:2, transport:20, temperature:25,
  ligand:0, strength:5, labile:0.6, ph:4, suppressor:0, brightener:0, accelerator:0, wetting:0, buffer:0,
  wettingMode:1, bufferMode:0, area:10, volume:1, closed:0, transportTau:8, adsorptionTau:20};
export const fields = {
 concentration:['Metall gesamt','mol/L',0.01,2,0.01,1], current:['Kathodische Stromdichte |j|','A/dm²',0,30,0.1,1],
 transport:['Stofftransport kₘ','µm/s',1,100,1,1], temperature:['Temperatur','°C',15,70,1,2],
 ligand:['Ligand gesamt (Modell)','mol/L',0,2,0.02,2], strength:['Komplexierungsstärke K (Modell)','L/mol',0.1,30,0.1,2],
 labile:['Nachlieferung aus Komplexen','Anteil',0,1,0.05,2], ph:['pH des Bades','',2,6,0.1,2],
 suppressor:['Grundglanzbildner / Inhibitor','rel. %',0,100,1,3], brightener:['Feinkorn-Glanzbildner','rel. %',0,100,1,3],
 accelerator:['Beschleunigender Zusatz','rel. %',0,100,1,3], wetting:['Netzmittel','rel. %',0,100,1,3], wettingMode:['Netzmittelwirkung','',0,1,1,3], buffer:['Pufferkapazität','rel. %',0,100,1,3], bufferMode:['Pufferwirkung','',0,2,1,3],
 area:['Aktive Fläche','cm²',1,1000,1,1],volume:['Badvolumen','L',0.05,20,0.05,1],
 transportTau:['Transport-Verzögerung τ','s',0,120,1,1], adsorptionTau:['Belegungs-Verzögerung τ','s',0,180,1,1]
};
export const choices={wettingMode:['Benetzung und Blasenablösung','Zusätzlich adsorptiv hemmend'],bufferMode:['pH stabilisieren','Zusätzlich HER hemmen (Nickel/Borat-Modell)','Zusätzlich Protonen nachliefern']};
export const presets = [
 {name:'Einfach · Kupfer ohne Zusätze',values:{...defaults}},
 {name:'Verdünnt · Transport wird knapp',values:{...defaults,concentration:0.1,current:2}},
 {name:'Komplexiert · generisches Kupfer-Modell',values:{...defaults,level:2,ligand:0.7,strength:5,labile:0.6}},
 {name:'Mehrkomponentenbad · Kupfer-Modell',values:{...defaults,level:3,ligand:0.3,suppressor:45,brightener:30,accelerator:15,wetting:60,buffer:60}},
 {name:'Mehrkomponentenbad · Nickel-Modell',values:{...defaults,level:3,metal:'nickel',ph:4.5,suppressor:35,brightener:40,wetting:50,buffer:75,bufferMode:1}},
 {name:'Einfach · Zink-Modell',values:{...defaults,metal:'zinc',concentration:0.3}},
 {name:'Nickel · ohne Netzmittel und Puffer',values:{...defaults,level:3,metal:'nickel',current:4,ph:4.5}},
 {name:'Nickel · Netzmittel und HER-hemmender Puffer',values:{...defaults,level:3,metal:'nickel',current:4,ph:4.5,wetting:70,buffer:75,bufferMode:1}},
 {name:'Übergang BR/FT · mögliche Zwillinge Z',values:{...defaults,level:3,current:4.8,suppressor:15,buffer:90}},
 {name:'Übergang FT/UD · Mischgefüge',values:{...defaults,level:3,current:4.8,suppressor:51,buffer:90}},
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
 {name:'Netzmittel schrittweise zugeben',parameter:'wetting',target:80,duration:180,ramp:'linear',why:'Benetzung erleichtert die Blasenablösung. Beim adsorptiven Modell kommt eine direkte Hemmung der Metallabscheidung hinzu.'},
 {name:'Pufferkapazität erhöhen',parameter:'buffer',target:90,duration:180,ramp:'linear',why:'Lokaler pH, Wasserstoffteilstrom und Oberflächenhemmung reagieren gekoppelt. Die Richtung hängt vom ausgewählten Puffermodell ab.'},
 {name:'Stromstufe und Erholungsphase',steps:[{parameter:'current',target:8,duration:90,ramp:'jump'},{parameter:'current',target:0.5,duration:180,ramp:'jump'}],why:'Hohe Stromdichte kann die Metallzufuhr überfordern. Danach wächst die Schicht unter anderen Bedingungen weiter.'}
];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function validate(p) {
 if (!p || typeof p!=='object' || !metals[p.metal] || ![1,2,3].includes(p.level)) throw Error('Unbekanntes Metall oder ungültige Komplexität.');
 for (const [k,f] of Object.entries(fields)) if (!Number.isFinite(p[k]) || p[k]<f[2] || p[k]>f[3]) throw Error(`${f[0]}: Wert zwischen ${f[2]} und ${f[3]} erforderlich.`);
 for(const key of Object.keys(choices))if(!Number.isInteger(p[key])||!choices[key][p[key]])throw Error('Ungültige Wirkweise.');
 if (![0,1].includes(p.closed)) throw Error('Ungültiger Badmodus.');
 return p;
}
export function effective(p) {
 const q={...p};
 if(q.level<2) Object.assign(q,{ligand:0,temperature:25,ph:4});
 if(q.level<3) Object.assign(q,{suppressor:0,brightener:0,accelerator:0,wetting:0,buffer:0,wettingMode:0,bufferMode:0});
 return q;
}
// All coefficients below, except F and metal constants, define an illustrative teaching model.
export function equilibrium(p) {
 const q=effective(p), free=1/(1+q.strength*q.ligand), available=free+q.labile*(1-free);
 const coverage=q.suppressor/(q.suppressor+30);
 const fine=q.brightener/(q.brightener+40), accel=q.accelerator/(q.accelerator+40);
 const wetCoverage=q.wettingMode===1?q.wetting/(q.wetting+30):0;
 return {q,free,available,coverage,fine,accel,wetCoverage};
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
// Coupled educational electrode model. These are illustrative response laws,
// not measured adsorption constants, electrochemical rate constants or a speciation model.
function coupledSurface(q,e,c,k,cover,wetCover,fT,dynamic){
 const m=metals[q.metal],transportLimit=m.z*F*k*1e-6*fT*c*1000/100*e.available;
 const wettingEffect=q.wetting/(q.wetting+25),bufferFraction=q.buffer/100;
 const intrinsic=clamp(.98-.09*(q.metal==='nickel')-.07*(q.metal==='zinc')-.08*cover-.04*(1-e.free)-.08*wetCover,.3,.99);
 const bufferFactor=q.bufferMode===1&&q.metal==='nickel'?1-.85*bufferFraction:q.bufferMode===2?1+3*bufferFraction:1;
 let ph=dynamic.ph??q.ph,blocked=0,metalCurrent=0,hydrogenCurrent=0,film=0,phTarget=q.ph;
 for(let iteration=0;iteration<70;iteration++){
  film=clamp((ph-4.5)/3,0,1);
  const metalWeight=intrinsic*(1-.7*film);
  const hydrogenWeight=(1-intrinsic)*(.35+.65*Math.pow(10,-.3*(ph-4)))*bufferFactor;
  const share=metalWeight/(metalWeight+hydrogenWeight);
  const limit=transportLimit*(1-blocked);
  metalCurrent=Math.min(q.current*share,limit);hydrogenCurrent=Math.max(0,q.current-metalCurrent);
  const targetBlocked=.65*hydrogenCurrent/(hydrogenCurrent+1.5)*(1-.8*wettingEffect)/(1+k/30);
  phTarget=q.ph+3.8*hydrogenCurrent/(hydrogenCurrent+.3)/((1+q.buffer/12)*(1+k/35));
  const nextPh=dynamic.ph??(ph+.5*(phTarget-ph)),nextBlocked=blocked+.5*(targetBlocked-blocked);
  const delta=Math.abs(nextPh-ph)+Math.abs(nextBlocked-blocked);ph=nextPh;blocked=nextBlocked;
  if(delta<1e-10)break;
 }
 // Re-evaluate the current budget at the converged pH and blocked area.
 film=clamp((ph-4.5)/3,0,1);
 const metalWeight=intrinsic*(1-.7*film),hydrogenWeight=(1-intrinsic)*(.35+.65*Math.pow(10,-.3*(ph-4)))*bufferFactor;
 const limit=transportLimit*(1-blocked);
 metalCurrent=Math.min(q.current*metalWeight/(metalWeight+hydrogenWeight),limit);hydrogenCurrent=Math.max(0,q.current-metalCurrent);
 phTarget=q.ph+3.8*hydrogenCurrent/(hydrogenCurrent+.3)/((1+q.buffer/12)*(1+k/35));
 const hydrogenAdsorption=hydrogenCurrent/(hydrogenCurrent+2);
 const inhibition=clamp(100*(1-Math.exp(-(m.baseline+.42*(1-e.free)+1.25*cover+.85*e.fine-.50*e.accel*(1-.5*cover)+.70*wetCover+1.4*film+.65*hydrogenAdsorption))),0,100);
 const pitTendency=clamp(.6*blocked/.65+.4*hydrogenCurrent/(hydrogenCurrent+1.5)*(1-wettingEffect),0,1);
 const targetBlocked=.65*hydrogenCurrent/(hydrogenCurrent+1.5)*(1-.8*wettingEffect)/(1+k/30);
 const couplingResidual=Math.abs(blocked-targetBlocked)+(dynamic.ph===undefined?Math.abs(ph-phTarget):0);
 return {couplingResidual,ph,phTarget,limit,transportLimit,metalCurrent,hydrogenCurrent,wetCoverage:wetCover,wettingEffect,bufferFactor,bubbleCoverage:blocked,hydrogenAdsorption,film,pitTendency,inhibition};
}
export function state(p,dynamic={}) {
 const e=equilibrium(p),q=e.q,m=metals[q.metal],c=dynamic.concentration??q.concentration,k=dynamic.transport??q.transport;
 const cover=dynamic.coverage??e.coverage,wetCover=dynamic.wetCoverage??e.wetCoverage;
 const temperatureFactor=(q.temperature+273.15)/298.15*Math.exp(.017*(q.temperature-25));
 let result;
 if(q.level===3)result=coupledSurface(q,e,c,k,cover,wetCover,temperatureFactor,dynamic);
 else {
  const ph=dynamic.ph??q.ph,limit=m.z*F*k*1e-6*temperatureFactor*c*1000*e.available/100;
  const inhibition=clamp(100*(1-Math.exp(-(m.baseline+.42*(1-e.free)+1.25*cover+.85*e.fine-.50*e.accel*(1-.5*cover)+.06*Math.max(0,ph-4)))),0,100);
  const eta=clamp(.98-.09*(q.metal==='nickel')-.07*(q.metal==='zinc')-.08*cover-.04*(1-e.free)-.06*Math.max(0,ph-5),.4,.99);
  const metalCurrent=Math.min(q.current*eta,limit),hydrogenCurrent=Math.max(0,q.current-metalCurrent),bubble=q.current?hydrogenCurrent/q.current:0;
  result={ph,phTarget:ph,limit,transportLimit:limit,metalCurrent,hydrogenCurrent,wetCoverage:0,wettingEffect:0,bufferFactor:1,bubbleCoverage:0,hydrogenAdsorption:0,film:0,pitTendency:bubble,inhibition};
 }
 const ratio=q.current/Math.max(result.limit,1e-12),rate=result.metalCurrent*100*m.M/(m.z*F*m.rho)*1e6;
 const bubble=q.level===3?result.pitTendency:result.hydrogenCurrent/(q.current||1);
 const warnings=[];
 if(ratio>=1)warnings.push('Die Gesamtstromvorgabe erreicht oder überschreitet die effektive Metallzufuhr. Im Lehrmodell wird der Reststrom als Wasserstoffentwicklung behandelt.');
 if(ratio>1)warnings.push('Die Karte endet bei i/igrenz = 1; die tatsächliche Vorgabe erscheint als Randmarkierung.');
 if(c<.01)warnings.push('Bad nahezu erschöpft: Modell außerhalb des vorgesehenen Konzentrationsbereichs.');
 if(result.couplingResidual>1e-6)warnings.push('Die gekoppelte Iteration ist in diesem Modellfall nicht hinreichend konvergiert; Ergebnis vorsichtig einordnen.');
 if(q.current===0)warnings.push('Strom ausgeschaltet: kein neues Schichtwachstum.');
 if(q.level===3&&q.bufferMode===1&&q.metal!=='nickel')warnings.push('Die zusätzliche HER-Hemmung des Borat-Modells wird nur für Nickel zugeschaltet; hier wirkt der Puffer nur auf den lokalen pH.');
 return {...result,metal:q.metal,level:q.level,ratio,free:e.free,available:e.available,coverage:cover,concentration:c,transport:k,efficiency:result.metalCurrent/(q.current||1),rate,side:result.hydrogenCurrent,bubble,fine:e.fine,type:classify(ratio,result.inhibition,q.current),warnings};
}
export function surfaceInfo(s){
 if(s.type==='OFF')return {roughness:0,pits:0,sheen:0,gloss:'Keine neue Abscheidung',texture:'Kein Schichtwachstum'};
 const feature=morphologyInfo(s),base={LOW:.6,FI:.70,BR:.48,FT:.24,UD:.18,LIMIT:.8,OUT:.65}[s.type]??.5;
 const roughness=clamp(base+.6*(s.film||0)+.35*Math.max(0,s.ratio-.6)+(feature.growth==='dendritic'?.25:0)-.12*(s.fine||0),0,1);
 const pits=clamp(s.pitTendency??s.bubble??0,0,1),sheen=clamp(1-.9*roughness-.65*pits-.4*(s.film||0),0,1);
 return {roughness,pits,sheen,gloss:sheen>.72?'Eher glänzend':sheen>.45?'Seidenmatt':'Eher matt',texture:roughness>.6?'Rau / stark strukturiert':roughness>.3?'Körnig':'Eher glatt'};
}
export function validateStep(s) {
 const f=fields[s?.parameter];
 if(!f || choices[s.parameter] || ['area','volume','transportTau','adsorptionTau'].includes(s.parameter) || !Number.isFinite(s.target) || s.target<f[2] || s.target>f[3] || !Number.isFinite(s.duration) || s.duration<1 || s.duration>3600 || !['linear','jump','hold'].includes(s.ramp)) throw Error('Ungültiger Prozessschritt (Zielbereich, Dauer 1–3600 s, Verlauf).');
 return s;
}
export function simulate(start,steps,mode='path') {
 validate(start); if(!Array.isArray(steps)||steps.length>20||!['path','time'].includes(mode)) throw Error('Ungültiger Prozess.');steps.forEach(validateStep);
 if(steps.some(s=>fields[s.parameter][5]>start.level)) throw Error('Für diesen Prozess eine höhere Komplexitätsebene wählen.');
 return runProcess(start,steps.map(({parameter,target,duration,ramp})=>({parameter,target,duration,ramp})),mode);
}
// Both input styles share one integrator so time, adsorption and layer history remain continuous.
function runProcess(start,steps,mode){
 let p={...start},dyn={concentration:p.concentration,transport:p.transport,coverage:equilibrium(p).coverage,wetCoverage:equilibrium(p).wetCoverage,ph:p.level===3?state(p).ph:effective(p).ph};
 let t=0,thickness=0,removed=0;const records=[],layers=[];
 const record=(s,step)=>records.push({t,thickness,step,p:{...p},...s});
 record(state(p),0);
 steps.forEach((step,index)=>{
  const from={...p},targets=step.targets||{[step.parameter]:step.target},n=Math.max(40,Math.ceil(step.duration/0.5)),dt=step.duration/n;
  for(let i=1;i<=n;i++){
   for(const [key,target] of Object.entries(targets)){
    p[key]=step.ramp==='hold'?from[key]:step.ramp==='jump'?target:choices[key]?(i===n?target:from[key]):from[key]+(target-from[key])*i/n;
   }
   const eq=equilibrium(p);
   if(mode==='time'){
    const relax=(old,target,tau)=>target+(old-target)*Math.exp(-dt/Math.max(tau,1e-8));
    dyn.transport=relax(dyn.transport,p.transport,p.transportTau);
    dyn.coverage=relax(dyn.coverage,eq.coverage,p.adsorptionTau);
    dyn.wetCoverage=relax(dyn.wetCoverage,eq.wetCoverage,p.adsorptionTau);
    dyn.concentration=Math.max(0,p.concentration-removed);
   }
   let s=state(p,mode==='time'?dyn:{});
   if(mode==='time'){
    if(p.level===3)dyn.ph=s.phTarget+(dyn.ph-s.phTarget)*Math.exp(-dt/45);
    else {const dpH=1.5*s.side/(p.current||1)/(1+eq.q.buffer/10);dyn.ph=eq.q.ph+dpH*(1-Math.exp(-(t+dt)/60));}
    s=state(p,dyn);
    const dh=s.rate*dt;
    if(dh>0){const detail=morphologyInfo(s);layers.push({bottom:thickness,top:thickness+dh,type:s.type,transition:detail.transition?.key||'',growth:detail.growth,t:t+dt});}
    thickness+=dh;
    if(p.closed)removed+=s.rate*1e-6*metals[p.metal].rho*(p.area*1e-4)*dt/metals[p.metal].M/(p.volume*1e-3)/1000;
   }
   if(mode==='time' && p.closed){dyn.concentration=Math.max(0,p.concentration-removed);s=state(p,dyn);}
t+=dt;record(s,index+1);
  }
  if(step.ramp==='hold')Object.assign(p,from);
 });
 return {records,layers,mode,totalTime:t,thickness,final:{...p}};
}

export function validateTransition(s){
 if(!s||!Number.isFinite(s.duration)||s.duration<1||s.duration>3600||!['linear','jump'].includes(s.ramp))throw Error('Übergang: Dauer 1–3600 s und Rampe oder Sprung erforderlich.');
 return s;
}
export function simulateStates(states,transitions,mode='path'){
 if(!Array.isArray(states)||states.length<2||states.length>50)throw Error('Für einen Zustandsprozess mindestens zwei gespeicherte Zustände anlegen.');
 states.forEach(s=>validate(s.p));
 if(!Array.isArray(transitions)||transitions.length!==states.length-1||!['path','time'].includes(mode))throw Error('Für jeden Zustandsübergang ist eine Dauer und ein Verlauf erforderlich.');
 transitions.forEach(validateTransition);
 const start=states[0].p;
 if(states.some(s=>s.p.metal!==start.metal||s.p.level!==start.level))throw Error('Ein zusammenhängender Zustandsprozess benötigt dasselbe Metall und dieselbe Komplexitätsebene in allen Zuständen.');
 const keys=Object.keys(fields).filter(k=>!['area','volume','transportTau','adsorptionTau'].includes(k)&&fields[k][5]<=start.level);
 const steps=transitions.map((s,i)=>({...s,targets:Object.fromEntries(keys.map(k=>[k,states[i+1].p[k]]))}));
 return {...runProcess(start,steps,mode),source:'states'};
}

export function validateSession(data) {
 if(!data||![1,2,3,VERSION].includes(data.version)||!Array.isArray(data.states)||data.states.length<1||data.states.length>50||!Array.isArray(data.steps)||data.steps.length>20)throw Error('Unbekannte Projektdatei oder zu viele Zustände/Schritte.');
 const normalizedStates=data.states.map(s=>({...s,p:data.version<3?{...defaults,...s.p}:s.p}));
 normalizedStates.forEach(s=>{if(typeof s.name!=='string'||s.name.length>80)throw Error('Ungültige Zustandsbezeichnung.');validate(s.p);});
 data.steps.forEach(validateStep);
 if(!['compare','process'].includes(data.mode)||!['path','time'].includes(data.processMode)||!Number.isInteger(data.active)||data.active<0||data.active>=data.states.length)throw Error('Ungültige Ansicht.');
 const processStart=data.version===1?0:data.processStart;
 if(!Number.isInteger(processStart)||processStart<0||processStart>=data.states.length)throw Error('Ungültiger Prozessstart.');
 const processSource=data.version<4?'steps':data.processSource;
 if(!['steps','states'].includes(processSource))throw Error('Ungültige Prozessvorgabe.');
 const transitions=data.version<4?normalizedStates.slice(1).map(()=>({duration:60,ramp:'linear'})):data.transitions;
 if(!Array.isArray(transitions)||transitions.length!==normalizedStates.length-1)throw Error('Ungültige Zustandsübergänge.');
 transitions.forEach(validateTransition);
 if(data.mode==='process'&&processSource==='states') {
  if(normalizedStates.length<2)throw Error('Mindestens zwei Zustände erforderlich.');
  if(normalizedStates.some(s=>s.p.metal!==normalizedStates[0].p.metal||s.p.level!==normalizedStates[0].p.level))throw Error('Zustandsprozess benötigt dasselbe Metall und dieselbe Komplexitätsebene.');
 }
 if(data.mode==='process'&&processSource==='steps'&&data.steps.some(s=>fields[s.parameter][5]>normalizedStates[processStart].p.level))throw Error('Prozessstart benötigt eine höhere Komplexitätsebene.');
 const states=normalizedStates.map(s=>({name:data.version===1&&/^Ausgangszustand(?: · Kopie)*$/.test(s.name)?'':s.name,p:{...s.p}}));
 return {...data,states,version:VERSION,processSource,transitions:transitions.map(s=>({...s})),processStart,monochrome:data.monochrome!==false};
}
