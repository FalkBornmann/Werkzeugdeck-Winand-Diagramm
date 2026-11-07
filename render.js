import {classify,boundaries,geometry,morphologyInfo} from './model.js';
import {stateCode} from './workspace.js';
export const escape=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export const colors={FI:'#c5d5ce',BR:'#ddc99e',FT:'#acd2ce',UD:'#cfbdd5',LOW:'#e9e7dc',LIMIT:'#eac8bb',OFF:'#ecefed',OUT:'#fffdf8'};
export const names={FI:'FI · isolierte Kristalle',BR:'BR · Basisreproduktion',FT:'FT · feldorientierte Textur',UD:'UD · unorientierte Dispersion',LOW:'FI oder geringe / keine Abscheidung',LIMIT:'Transportgrenze überschritten',OFF:'Keine Abscheidung bei j = 0',OUT:'Außerhalb der schematischen Gebiete'};
export const descriptions={FI:'Einzelne Kristalle wachsen bevorzugt hervor. Die Skizze zeigt isolierte Wachstumsformen, keine vorausgesagte Dendritengröße.',BR:'Die Orientierung des Substrats wird schematisch in die wachsende Schicht fortgesetzt. Substratzustand ist eine zusätzliche reale Einflussgröße.',FT:'Bevorzugte Wachstumsorientierung und säulenartiges Gefüge. Die Pfeile kennzeichnen eine schematische Orientierung, keine bestimmte Miller-Richtung.',UD:'Viele unterschiedlich orientierte Körner. Die feine Darstellung ist qualitativ und enthält keine berechnete Korngröße.',LOW:'Bei sehr geringer Hemmung und kleiner relativer Stromdichte ist die Zuordnung unsicher. Die Lehrskizze entscheidet nicht, ob eine reale Oberfläche vollständig bedeckt wird.',LIMIT:'Die vorgegebene Gesamtstromdichte erreicht oder überschreitet den Modell-Grenzstrom. Die Metallabscheidung wird begrenzt; eine reale Morphologie wird hier nicht vorhergesagt.',OFF:'Ohne Strom wird keine zusätzliche Metallschicht abgeschieden. Vorhandenes Gefüge bleibt in der Schichthistorie erhalten.',OUT:'Dieser Punkt liegt außerhalb der in der Referenzschematik eingezeichneten Wachstumsgebiete. Es erfolgt keine willkürliche Fortsetzung eines Gefügetyps.'};
export const regionLabels=[{type:'LOW',x:.12,y:18,lines:['FI / keine','Abscheidung']},{type:'BR',x:.32,y:28,lines:['BR']},{type:'FI',x:.64,y:12,lines:['FI']},{type:'FT',x:.43,y:47,lines:['FT']},{type:'UD',x:.59,y:62,lines:['UD']}];
const fmt=(v,d=2)=>Number(v).toLocaleString('de-DE',{maximumFractionDigits:d});
const text=(x,y,s,extra='')=>`<text x="${x}" y="${y}" ${extra}>${escape(s)}</text>`;
function root(w,h,title,body){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="group" aria-label="${escape(title)}"><title>${escape(title)}</title><rect width="${w}" height="${h}" fill="#ffffff"/><g font-family="system-ui, sans-serif" font-size="14" fill="#182d27">${body}</g></svg>`;}
export function diagramSVG(states,active,process=null,index=0,options={}){
 const monochrome=options.monochrome!==false,X=v=>105+Math.min(1,Math.max(0,v))*690,Y=v=>140+v/100*690;
 let b=text(105,30,'Winand-Diagramm · schematische Lehrkarte','font-size="22" font-weight="700"');
 b+=text(105,55,'Geometrie nach der Referenzschematik · keine kalibrierten Grenzkurven','font-size="13"');
 b+='<defs><marker id="axis-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#24362e"/></marker><clipPath id="map-clip"><rect x="105" y="140" width="690" height="690"/></clipPath>';
 for(const type of ['LOW','BR','FT','UD']){
  const marks={LOW:'<circle cx="3" cy="3" r=".9" fill="#aaa"/>',BR:'<path d="M-2,8 L8,-2 M4,12 L12,4" stroke="#b2b2b2" stroke-width=".65"/>',FT:'<path d="M4,0 V10" stroke="#b0b0b0" stroke-width=".65"/>',UD:'<path d="M0,0 L10,10 M0,10 L10,0" stroke="#bebebe" stroke-width=".6"/>'};
  b+=`<pattern id="bw-${type}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="white"/>${marks[type]}</pattern>`;
 }
 b+='</defs>';
 // Colour/texture fills and the labels below use exactly the same classification.
 for(let i=0;i<180;i++){
  const x=(i+.5)/180;let previous=classify(x,.25),start=0;
  for(let j=1;j<=200;j++){
   const type=j===200?null:classify(x,j*.5+.25);
   if(type!==previous){if(previous!=='OUT')b+=`<rect data-region="${previous}" x="${X(i/180).toFixed(3)}" y="${Y(start*.5)}" width="3.834" height="${(j-start)*3.45}" fill="${monochrome?(previous==='FI'?'white':`url(#bw-${previous})`):colors[previous]}" shape-rendering="crispEdges"/>`;start=j;previous=type;}
  }
 }
 const curve=(key,start,end,dashed=false)=>{
  const samples=220,points=Array.from({length:samples+1},(_,i)=>{const x=start+(end-start)*i/samples;return `${X(x).toFixed(3)},${Y(boundaries(x)[key]).toFixed(3)}`;});
  return `<polyline data-boundary="${key}" points="${points.join(' ')}" fill="none" stroke="#303b35" stroke-width="2.1" ${dashed?'stroke-dasharray="7 5"':''}/>`;
 };
 let intersection=geometry.fiStart;
 while(intersection<geometry.envelopeEnd&&boundaries(intersection).fiTop<boundaries(intersection).envelope)intersection+=.001;
 let cross=geometry.fiStart;
 while(cross<geometry.udEnd&&boundaries(cross).fiTop<boundaries(cross).ud)cross+=.001;
 b+=curve('low',0,geometry.lowEnd)+curve('brBottom',0,geometry.junction)+curve('fiTop',geometry.fiStart,intersection)+curve('ud',0,cross)+curve('ud',cross,geometry.udEnd,true)+curve('envelope',0,geometry.envelopeEnd);
 b+=`<path data-axis="top-left" d="M105,850 V140 H815" fill="none" stroke="#24362e" stroke-width="2.5" marker-end="url(#axis-arrow)"/><line x1="105" x2="105" y1="140" y2="850" stroke="#24362e" stroke-width="2.5" marker-end="url(#axis-arrow)"/>`;
 for(let i=0;i<=5;i++){const x=i/5;b+=`<line x1="${X(x)}" x2="${X(x)}" y1="134" y2="140" stroke="#24362e"/>`+text(X(x),122,fmt(x,1),'text-anchor="middle"');}
 b+=text(92,Y(0)+6,'gering','text-anchor="end" font-size="12"')+text(92,Y(100),'stark','text-anchor="end" font-size="12"');
 b+='<text data-axis-label="ratio" x="450" y="88" text-anchor="middle" font-weight="700" font-size="20"><tspan font-style="italic">i</tspan>/<tspan font-style="italic">i</tspan><tspan baseline-shift="sub" font-size="13">grenz</tspan></text>';
 b+=text(35,485,'Grad der Inhibierung','data-axis-label="inhibition" transform="rotate(-90 35 485)" text-anchor="middle" font-weight="700" font-size="17"');
 for(const label of regionLabels)label.lines.forEach((line,i)=>{b+=text(X(label.x),Y(label.y)+(i-(label.lines.length-1)/2)*20,line,`data-region-label="${label.type}" text-anchor="middle" font-size="${label.type==='LOW'?16:24}" font-weight="750" paint-order="stroke" stroke="white" stroke-width="5" stroke-linejoin="round"`);});
 b+=text(X(.04),Y(64),'2D','font-size="17" font-weight="650" paint-order="stroke" stroke="white" stroke-width="4"')+text(X(.04),Y(82),'3D','font-size="17" font-weight="650" paint-order="stroke" stroke="white" stroke-width="4"');
 b+=text(X(.83),Y(79),'Keine Zuordnung','text-anchor="middle" font-size="13"')+text(X(.83),Y(82),'außerhalb der','text-anchor="middle" font-size="13"')+text(X(.83),Y(85),'Referenzgebiete','text-anchor="middle" font-size="13"');
 const dot=(s,label,isActive=false,attributes='',simulation=false)=>{
  const x=X(s.ratio),y=Y(s.inhibition),outside=s.ratio>1,anchor=s.ratio>.88?'end':'start',tx=s.ratio>.88?x-13:x+13,ty=simulation?(s.inhibition>94?y-30:y+28):(s.inhibition<4?y+25:y-13);
  const marker=outside?`<path d="M${x-10},${y-8} L${x},${y} L${x-10},${y+8} Z" fill="white" stroke="#111" stroke-width="2"/>`:simulation?`<path d="M${x},${y-9} L${x+9},${y} L${x},${y+9} L${x-9},${y} Z" fill="#111" stroke="white" stroke-width="2"/>`:`<circle cx="${x}" cy="${y}" r="7" fill="${isActive?'#111':'white'}" stroke="#111" stroke-width="2.5"/>`;
  return `<g ${attributes}><title>${escape(label)}: j/jgrenz ${fmt(s.ratio,3)}, Hemmung ${fmt(s.inhibition,1)} (Modellskala)</title>${isActive?`<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="#111" stroke-width="1.5"/>`:''}${marker}${text(tx,ty,label,`text-anchor="${anchor}" font-weight="700" font-size="14" paint-order="stroke" stroke="white" stroke-width="4" stroke-linejoin="round"`)}</g>`;
 };
 if(process){
  const r=process.records,stride=Math.max(1,Math.ceil(r.length/600));let d='',open=false;
  for(let i=0;i<r.length;i+=stride){const s=r[i];if(s.ratio>1){open=false;continue;}d+=`${open?' L':' M'}${X(s.ratio)},${Y(s.inhibition)}`;open=true;}
  const last=r.at(-1);if(last.ratio<=1)d+=`${open?' L':' M'}${X(last.ratio)},${Y(last.inhibition)}`;
  b+=`<path d="${d}" fill="none" stroke="#111" stroke-width="2.5" stroke-dasharray="7 5" clip-path="url(#map-clip)"/>`;
 }
 const groups=new Map();
 states.forEach((s,i)=>{const key=s.result.ratio.toFixed(8)+','+s.result.inhibition.toFixed(8);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(i);});
 for(const group of groups.values()){
  const selected=group.includes(active),i=selected?active:group[0],label=group.map(j=>stateCode(j,states.length)).join(' / ');
  b+=dot(states[i].result,label,selected,`data-state="${i}" tabindex="0" role="button" aria-label="Zustand ${escape(label)} auswählen"`);
 }
 if(process){const r=process.records,s=r[index];b+=dot(s,`Sim · ${fmt(s.t,0)} s`,false,'',true);if(index<r.length-1)b+=dot(r.at(-1),'Sim-Ende',false,'',true);}
 b+=text(105,885,'Kreise: gespeicherte Zustände · Raute: Simulation · Randdreieck: Vorgabe > 1','font-size="13"');
 b+=text(105,908,'2D / 3D: schematische Keimbildung · Gebiete sind keine gemessenen Phasengrenzen.','font-size="12"');
 return root(900,930,'Winanddiagramm mit Achsen links und oben, getrennten Gebieten und unabhängigen Zuständen',b);
}
function shortLines(value,max=46){const lines=[''];for(const word of value.split(' ')){const i=lines.length-1;if(lines[i]&&(lines[i]+' '+word).length>max)lines.push(word);else lines[i]+=(lines[i]?' ':'')+word;}return lines;}
function grainScene(type,left,width){
 let b=`<g transform="translate(${left} 0) scale(${width/370} 1)">`;
 if(type==='FT'||type==='BR'){
  const cuts=[0,57,120,182,249,309,370];
  for(let i=0;i<6;i++){const top=type==='FT'?87+(i%2)*8:103+(i%3)*15,x=(cuts[i]+cuts[i+1])/2;
   b+=`<path d="M${cuts[i]},235 L${cuts[i]+4},${top} L${cuts[i+1]-4},${top-7} L${cuts[i+1]},235 Z" fill="${i%2?'#e1eae4':'#f6f7ee'}" stroke="#344d41" stroke-width="1.4"/><path d="M${x},213 l${type==='BR'?(i%3-1)*12:0},-65 m-5,8 l5,-8 l5,8" fill="none" stroke="#223b30" stroke-width="2"/>`;
  }
 }else if(type==='UD'){
  const nx=10,ny=6,verts=[];
  for(let row=0;row<=ny;row++){verts[row]=[];for(let col=0;col<=nx;col++)verts[row][col]=[col*370/nx+(col>0&&col<nx?Math.sin(col*9+row*4)*6:0),88+row*147/ny+(row>0&&row<ny?Math.sin(col*4+row*7)*5:0)];}
  for(let row=0;row<ny;row++)for(let col=0;col<nx;col++){
   const pts=[verts[row][col],verts[row][col+1],verts[row+1][col+1],verts[row+1][col]],cx=pts.reduce((a,v)=>a+v[0],0)/4,cy=pts.reduce((a,v)=>a+v[1],0)/4,ang=col*2.1+row*1.7;
   b+=`<polygon points="${pts.map(v=>v.join(',')).join(' ')}" fill="${(col+row)%2?'#eeebef':'#fdfbfe'}" stroke="#4b4252" stroke-width="1.1"/><line x1="${cx-7*Math.cos(ang)}" x2="${cx+7*Math.cos(ang)}" y1="${cy-7*Math.sin(ang)}" y2="${cy+7*Math.sin(ang)}" stroke="#4b4252"/>`;
  }
 }else{
  const count=type==='LOW'?3:5;
  for(let i=0;i<count;i++){const x=30+i*(310/(count-1)),top=type==='LOW'?160+(i%2)*15:90+(i%3)*25;
   b+=`<path d="M${x-18},235 L${x-13},${top+25} L${x},${top} L${x+15},${top+24} L${x+21},235 Z" fill="#e8eee7" stroke="#344d41" stroke-width="1.5"/><line x1="${x}" x2="${x}" y1="${top+20}" y2="224" stroke="#344d41"/>`;
  }
 }
 return b+'</g>';
}
function spikyScene(branching){
 let b='';
 for(let i=0;i<4;i++){
  const x=70+i*96,top=82+(i%2)*18;
  b+=`<path d="M${x-4},235 L${x-2},${top+12} L${x},${top} L${x+3},${top+12} L${x+5},235 Z" fill="#dfe7df" stroke="#243b2c" stroke-width="1.6"/>`;
  if(branching)for(let j=0;j<3;j++){
   const y=122+j*32+(i%2)*7,len=20+j*5;
   b+=`<path d="M${x},${y+20} L${x-len},${y-5} M${x},${y+20} L${x+len},${y-5} M${x-len*.65},${y+4} l-13,-5 m13,5 l-2,-14 M${x+len*.65},${y+4} l13,-5 m-13,5 l2,-14" fill="none" stroke="#243b2c" stroke-width="2"/>`;
  }
 }
 if(branching)b+=text(220,70,'Stamm · Seitenäste · wachsende Spitzen','text-anchor="middle" font-size="12"');
 return b;
}
function twinScene(){
 let b='';
 for(let i=0;i<5;i++){
  const x=35+i*74;
  b+=`<path d="M${x},235 L${x+5},92 L${x+67},86 L${x+74},235 Z" fill="${i%2?'#f3efe3':'#e8eee7'}" stroke="#344d41" stroke-width="1.3"/>`;
  for(const y of [113,187]){
   const sign=y<150?-1:1,cx=x+37;
   b+=`<path d="M${cx-11},${y+7*sign} L${cx+11},${y-7*sign} m-7,0 l7,0 l-2,7" fill="none" stroke="#243b2c" stroke-width="2"/>`;
  }
 }
 b+='<path d="M35,155 H405" fill="none" stroke="#111" stroke-width="2" stroke-dasharray="7 4"/>';
 b+=text(220,74,'Spiegelbildliche Orientierung (schematisch)','text-anchor="middle" font-size="12"');
 return b;
}
export function morphologySVG(s,label='Aktiver Zustand'){
 const detail=morphologyInfo(s),transition=detail.transition,hasGrowth=detail.growth!=='ordinary';
 const title=hasGrowth?detail.growthTitle:transition?.title||names[s.type];
 let b=text(25,28,'Schematische Gefügeskizze','font-size="20" font-weight="700"')+text(25,50,(label.length>50?label.slice(0,49)+'…':label),'font-size="12"');
 let legend='Korngrenzen und Orientierung';
 if(hasGrowth){b+=spikyScene(detail.growth!=='needles');legend=detail.growth==='needles'?'Unverzweigte Nadeln / prismatische Spitzen':'Verzweigte Vorsprünge · keine Größenprognose';}
 else if(transition?.sketch==='twins'){b+=twinScene();legend='Gestrichelt: mögliche Zwillingsgrenze';}
 else if(transition){
  const types=transition.key==='FT-UD'?['FT','UD']:transition.key==='BR-FI'?['BR','FI']:transition.key==='FI-FT'?['FI','FT']:transition.key==='LOW-BR'?['LOW','BR']:transition.types.slice(0,2);
  b+=grainScene(types[0],35,182)+grainScene(types[1],223,182);
  b+=text(126,279,types[0],'text-anchor="middle" font-weight="700"')+text(314,279,types[1],'text-anchor="middle" font-weight="700"');
  legend='Nebeneinander gezeigte Wachstumsmerkmale';
 }else if(['FI','LOW','BR','FT','UD'].includes(s.type))b+=grainScene(s.type,35,370);
 else b+=text(220,155,s.type==='OFF'?'Kein weiteres Wachstum':'Keine gesicherte Gefügezuordnung','text-anchor="middle" font-weight="700"');
 b+='<rect x="35" y="235" width="370" height="25" fill="#c7c5bb" stroke="#4b554e"/>'+text(42,253,'Substrat','font-size="12"');
 if(!transition||hasGrowth||transition.sketch==='twins')b+=text(220,279,legend,'text-anchor="middle" font-size="12"');
 shortLines(title).slice(0,3).forEach((line,i)=>{b+=text(25,310+i*20,line,'font-size="15" font-weight="700"');});
 b+=text(25,382,'Mögliche Anschauungsform · nicht maßstäblich','font-size="12"');
 return root(440,405,'Qualitative Gefügeskizze: '+title,b);
}
export function historySVG(process,index){
 const r=process.records,current=r[index],total=Math.max(process.thickness,1e-8);let b=text(30,30,'Schichtgeschichte und Zeitverlauf','font-size="20" font-weight="700"');
 b+=text(30,56,`Auswahl: ${fmt(current.t,1)} s · Schichtdicke ${fmt(current.thickness,3)} µm`);
 b+='<defs><pattern id="layer-transition" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="white"/><path d="M-1,6 L6,-1 M4,8 L8,4" fill="none" stroke="#111" stroke-width="1"/></pattern><pattern id="layer-growth" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="white"/><circle cx="3" cy="3" r="1.1" fill="#111"/></pattern></defs><rect x="45" y="300" width="180" height="24" fill="#b6b2a1"/>'+text(135,319,'Substrat','text-anchor="middle" font-size="12"');
 // Aggregate adjacent same-type layers and clip at the selected deposition time.
 let group=null;const groups=[];
 for(const l of process.layers){if(l.t>current.t+1e-6)break;if(group&&group.type===l.type&&group.transition===l.transition&&group.growth===l.growth)group.top=l.top;else{group={...l};groups.push(group);}}
 for(const l of groups){b+=`<rect x="45" y="${300-l.top/total*220}" width="180" height="${Math.max(.05,(l.top-l.bottom)/total*220)}" fill="${colors[l.type]}" stroke="#555" stroke-width=".7"/>`;if(l.transition)b+=`<rect x="45" y="${300-l.top/total*220}" width="8" height="${Math.max(.05,(l.top-l.bottom)/total*220)}" fill="url(#layer-transition)"/>`;if(l.growth&&l.growth!=='ordinary')b+=`<rect x="53" y="${300-l.top/total*220}" width="8" height="${Math.max(.05,(l.top-l.bottom)/total*220)}" fill="url(#layer-growth)"/>`;}
 b+=`<rect x="45" y="80" width="180" height="220" fill="none" stroke="#527467"/>`+text(135,350,'Wachstum nach oben ↑','text-anchor="middle" font-size="12"');
 const max=r.reduce((maximum,v)=>Math.max(maximum,v.thickness),1),X=t=>315+t/Math.max(process.totalTime,1)*480,Y=h=>300-h/max*220;
 let path='';const stride=Math.max(1,Math.ceil(r.length/400));
 for(let i=0;i<r.length;i+=stride)path+=`${path?' L':'M'}${X(r[i].t)},${Y(r[i].thickness)}`;
 path+=` L${X(r.at(-1).t)},${Y(r.at(-1).thickness)}`;
 b+=`<path d="M315,80 V300 H795" fill="none" stroke="#527467"/><path d="${path}" fill="none" stroke="#176659" stroke-width="3"/><circle cx="${X(current.t)}" cy="${Y(current.thickness)}" r="6" fill="#a46125"/>`;
 b+=text(315,320,'0 s')+text(795,320,`${fmt(process.totalTime,0)} s`,'text-anchor="end"')+text(310,72,`${fmt(max,2)} µm`)+text(555,350,'Zeit →','text-anchor="middle"');
 b+=text(30,382,'Lagenfarben: FI grau-grün · BR sand · FT türkis · UD violett · Grenze terrakotta · unzugeordnet weiß','font-size="12"');
 const detail=morphologyInfo(current);b+=text(30,428,'Merkmal: '+(detail.growthTitle||detail.transition?.title||'keine Zusatzzuordnung'),'font-size="12"');
 b+=text(30,450,'Randspuren: schraffiert = Übergang · gepunktet = Spitzen / Dendritenhinweis','font-size="12"');
 b+=text(30,405,'Historie der Modellbedingungen; keine Simulation von Umkristallisation oder realer Kornentwicklung.','font-size="12"');
 return root(850,475,'Zeitabhängige Modellschicht und Schichtdickenverlauf',b);
}
