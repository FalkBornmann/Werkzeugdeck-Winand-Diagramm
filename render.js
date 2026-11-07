import {classify,metals} from './model.js';
export const escape=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export const colors={FI:'#c5d5ce',BR:'#ddc99e',FT:'#acd2ce',UD:'#cfbdd5',LOW:'#e9e7dc',LIMIT:'#eac8bb',OFF:'#ecefed'};
export const names={FI:'FI · isolierte Kristalle',BR:'BR · Basisreproduktion',FT:'FT · feldorientierte Textur',UD:'UD · unorientierte Dispersion',LOW:'FI oder geringe / keine Abscheidung',LIMIT:'Transportgrenze überschritten',OFF:'Keine Abscheidung bei j = 0'};
export const descriptions={FI:'Einzelne Kristalle wachsen bevorzugt hervor. Die Skizze zeigt isolierte Wachstumsformen, keine vorausgesagte Dendritengröße.',BR:'Die Orientierung des Substrats wird schematisch in die wachsende Schicht fortgesetzt. Substratzustand ist eine zusätzliche reale Einflussgröße.',FT:'Bevorzugte Wachstumsorientierung und säulenartiges Gefüge. Die Pfeile kennzeichnen eine schematische Orientierung, keine bestimmte Miller-Richtung.',UD:'Viele unterschiedlich orientierte Körner. Die feine Darstellung ist qualitativ und enthält keine berechnete Korngröße.',LOW:'Bei sehr geringer Hemmung und kleiner relativer Stromdichte ist die Zuordnung unsicher. Die Lehrskizze entscheidet nicht, ob eine reale Oberfläche vollständig bedeckt wird.',LIMIT:'Das vorgegebene j erreicht oder überschreitet den Modell-Grenzstrom. Das konkrete Gefüge ist hier nicht zuverlässig einzuordnen.',OFF:'Ohne Strom wird keine zusätzliche Metallschicht abgeschieden. Vorhandenes Gefüge bleibt in der Schichthistorie erhalten.'};
const fmt=(v,d=2)=>Number(v).toLocaleString('de-DE',{maximumFractionDigits:d});
const text=(x,y,s,extra='')=>`<text x="${x}" y="${y}" ${extra}>${escape(s)}</text>`;
function root(w,h,title,body){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${escape(title)}"><title>${escape(title)}</title><rect width="${w}" height="${h}" fill="#fffdf8"/><g font-family="system-ui, sans-serif" font-size="14" fill="#183f39">${body}</g></svg>`;}
export function diagramSVG(states,active,process=null,index=0){
 const X=v=>88+Math.min(1.4,Math.max(0,v))/1.4*720,Y=v=>75+v/100*400;
 let b=text(88,30,'Winand-Diagramm · schematische Lehrkarte','font-size="21" font-weight="700"');
 b+=text(88,53,'Hemmung nimmt nach unten zu · Gebietsgrenzen sind qualitativ','font-size="13"');
 for(let i=0;i<180;i++){
  const x=(i+.5)/180*1.4;let prev=classify(x,.5),start=0;
  for(let j=1;j<=100;j++){
   const type=j===100?null:classify(x,j+.5);
   if(type!==prev){b+=`<rect x="${X(i/180*1.4).toFixed(2)}" y="${Y(start)}" width="4.1" height="${(j-start)*4}" fill="${colors[prev]}" shape-rendering="crispEdges"/>`;start=j;prev=type;}
  }
 }
 for(let x=0;x<1.401;x+=.2){b+=`<line x1="${X(x)}" x2="${X(x)}" y1="75" y2="475" stroke="#fff" stroke-opacity=".6"/>`+text(X(x),500,fmt(x,1),'text-anchor="middle"');}
 for(let y=0;y<=100;y+=20)b+=text(72,Y(y)+5,`${y}`,'text-anchor="end"')+`<line x1="88" x2="808" y1="${Y(y)}" y2="${Y(y)}" stroke="#fff" stroke-opacity=".5"/>`;
 b+=`<rect x="88" y="75" width="720" height="400" fill="none" stroke="#36574e"/><line x1="${X(1)}" x2="${X(1)}" y1="75" y2="475" stroke="#94512e" stroke-width="2" stroke-dasharray="6 4"/>`;
 b+=text(448,535,'|j| / jgrenz [1] →','text-anchor="middle" font-weight="700"')+text(25,277,'Grad der Inhibierung [rel. %] →','transform="rotate(90 25 277)" text-anchor="middle" font-weight="700"');
 for(const [x,y,label]of [[.16,16,'FI / wenig Belag'],[.23,43,'BR'],[.3,66,'FT · 2D'],[.5,95,'UD · 3D'],[.86,20,'FI']])b+=text(X(x),Y(y),label,'font-weight="700" text-anchor="middle"');
 b+=text(X(1.2),Y(45),'Grenze','text-anchor="middle"')+text(X(1.2),Y(52),'überschritten','text-anchor="middle"');
 const dot=(s,label,isActive=false,attributes='')=>{
  const x=X(s.ratio),y=Y(s.inhibition),outside=s.ratio>1.4;
  return `<g ${attributes}><title>${escape(label)}: j/jgrenz ${fmt(s.ratio,3)}, Hemmung ${fmt(s.inhibition,1)} %</title>${isActive?`<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="#183f39" stroke-width="2"/>`:''}${outside?`<path d="M ${x-10} ${y-8} L ${x} ${y} L ${x-10} ${y+8} Z" fill="#a34521"/>`:`<circle cx="${x}" cy="${y}" r="7" fill="${isActive?'#173f35':'#a46125'}" stroke="#fff" stroke-width="2"/>`}${text(x+12,y-12,label,'font-weight="700" font-size="12" paint-order="stroke" stroke="#fffdf8" stroke-width="3" stroke-linejoin="round"')}</g>`;
 };
 if(process){
  const r=process.records,stride=Math.max(1,Math.ceil(r.length/500));let path='';
  for(let i=0;i<r.length;i+=stride)path+=`${path?' L':'M'}${X(r[i].ratio).toFixed(2)},${Y(r[i].inhibition).toFixed(2)}`;
  const last=r.at(-1);path+=` L${X(last.ratio)},${Y(last.inhibition)}`;
  b+=`<path d="${path}" fill="none" stroke="#173f35" stroke-width="2.5" stroke-dasharray="5 3"/>`+(index>0?dot(r[0],'Start'):'')+(index<r.length-1?dot(last,'Ende'):'')+dot(r[index],process.mode==='time'?`${fmt(r[index].t,0)} s`:'Aktuell',true);
 }else {
  const groups=new Map();
  states.forEach((s,i)=>{const key=s.result.ratio.toFixed(8)+','+s.result.inhibition.toFixed(8);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(i);});
  for(const group of groups.values()){
   const selected=group.includes(active),i=selected?active:group[0],label=group.map(j=>j+1).join(', ');
   b+=dot(states[i].result,label,selected,`data-state="${i}" tabindex="0" role="button" aria-label="Zustände ${label}: ${escape(states[i].name)} auswählen"`);
  }
 }
 b+=text(88,568,'Gleiche Koordinaten garantieren kein identisches reales Gefüge.','font-size="13"');
 return root(880,590,'Winanddiagramm mit Zuständen und Prozesspfad',b);
}
export function morphologySVG(s,label='Aktiver Zustand'){
 let b=text(25,30,'Schematische Gefügeskizze','font-size="20" font-weight="700"')+text(25,53,label.slice(0,50),'font-size="13"');
 b+='<rect x="35" y="232" width="370" height="35" fill="#b6b2a1" stroke="#586e62"/>'+text(42,256,'Substrat','font-size="13"');
 if(['FT','BR'].includes(s.type)){
  const cuts=[35,92,155,217,284,344,405];
  for(let i=0;i<6;i++){
   const y=s.type==='FT'?85+(i%2)*10:100+(i%3)*20;
   b+=`<path d="M${cuts[i]},232 L${cuts[i]+4},${y} L${cuts[i+1]-4},${y-7} L${cuts[i+1]},232 Z" fill="${i%2?'#b1d5cd':'#d3e5da'}" stroke="#386659"/>`;
   const x=(cuts[i]+cuts[i+1])/2;
   b+=`<path d="M${x},205 l${s.type==='BR'?(i%3-1)*12:0},-65 m-5,8 l5,-8 l5,8" fill="none" stroke="#183f39" stroke-width="2"/>`;
   if(s.type==='BR')b+=`<line x1="${cuts[i]}" x2="${cuts[i]+3}" y1="232" y2="267" stroke="#386659"/>`;
  }
 }else if(s.type==='UD'){
  const nx=12,ny=6,verts=[];
  for(let row=0;row<=ny;row++){verts[row]=[];for(let col=0;col<=nx;col++)verts[row][col]=[35+col*370/nx+(col>0&&col<nx?Math.sin(col*9+row*4)*6:0),82+row*150/ny+(row>0&&row<ny?Math.sin(col*4+row*7)*5:0)];}
  for(let row=0;row<ny;row++)for(let col=0;col<nx;col++){
   const pts=[verts[row][col],verts[row][col+1],verts[row+1][col+1],verts[row+1][col]],cx=pts.reduce((a,v)=>a+v[0],0)/4,cy=pts.reduce((a,v)=>a+v[1],0)/4,ang=col*2.1+row*1.7;
   b+=`<polygon points="${pts.map(v=>v.join(',')).join(' ')}" fill="${(col+row)%2?'#d8cbe0':'#e8dfeb'}" stroke="#685773" stroke-width=".8"/><line x1="${cx-7*Math.cos(ang)}" x2="${cx+7*Math.cos(ang)}" y1="${cy-7*Math.sin(ang)}" y2="${cy+7*Math.sin(ang)}" stroke="#685773"/>`;
  }
 }else if(['FI','LOW'].includes(s.type)){
  for(let i=0;i<5;i++){const x=65+i*73,y=85+(i%3)*28;b+=`<path d="M${x-20},232 L${x-13},${y+25} L${x},${y} L${x+17},${y+24} L${x+23},232 Z" fill="#c5d5ce" stroke="#386659"/><line x1="${x}" x2="${x}" y1="${y+20}" y2="220" stroke="#386659"/>`;}
 }else b+=text(220,145,s.type==='OFF'?'Kein weiteres Wachstum':'Keine Gefügeprognose','text-anchor="middle" font-weight="700"');
 b+=text(25,295,names[s.type],'font-weight="700"')+text(25,318,'Korngrenzen und Orientierung · nicht maßstäblich','font-size="12"');
 return root(440,340,'Qualitative Gefügeskizze: '+names[s.type],b);
}
export function historySVG(process,index){
 const r=process.records,current=r[index],total=Math.max(process.thickness,1e-8);let b=text(30,30,'Schichtgeschichte und Zeitverlauf','font-size="20" font-weight="700"');
 b+=text(30,56,`Auswahl: ${fmt(current.t,1)} s · Schichtdicke ${fmt(current.thickness,3)} µm`);
 b+='<rect x="45" y="300" width="180" height="24" fill="#b6b2a1"/>'+text(135,319,'Substrat','text-anchor="middle" font-size="12"');
 // Aggregate adjacent same-type layers and clip at the selected deposition time.
 let group=null;const groups=[];
 for(const l of process.layers){if(l.t>current.t+1e-6)break;if(group&&group.type===l.type)group.top=l.top;else{group={...l};groups.push(group);}}
 for(const l of groups)b+=`<rect x="45" y="${300-l.top/total*220}" width="180" height="${Math.max(.05,(l.top-l.bottom)/total*220)}" fill="${colors[l.type]}"/>`;
 b+=`<rect x="45" y="80" width="180" height="220" fill="none" stroke="#527467"/>`+text(135,350,'Wachstum nach oben ↑','text-anchor="middle" font-size="12"');
 const max=r.reduce((maximum,v)=>Math.max(maximum,v.thickness),1),X=t=>315+t/Math.max(process.totalTime,1)*480,Y=h=>300-h/max*220;
 let path='';const stride=Math.max(1,Math.ceil(r.length/400));
 for(let i=0;i<r.length;i+=stride)path+=`${path?' L':'M'}${X(r[i].t)},${Y(r[i].thickness)}`;
 path+=` L${X(r.at(-1).t)},${Y(r.at(-1).thickness)}`;
 b+=`<path d="M315,80 V300 H795" fill="none" stroke="#527467"/><path d="${path}" fill="none" stroke="#176659" stroke-width="3"/><circle cx="${X(current.t)}" cy="${Y(current.thickness)}" r="6" fill="#a46125"/>`;
 b+=text(315,320,'0 s')+text(795,320,`${fmt(process.totalTime,0)} s`,'text-anchor="end"')+text(310,72,`${fmt(max,2)} µm`)+text(555,350,'Zeit →','text-anchor="middle"');
 b+=text(30,382,'Lagenfarben: FI grau-grün · BR sand · FT türkis · UD violett · Transportgrenze terrakotta','font-size="12"');
 b+=text(30,405,'Historie der Modellbedingungen; keine Simulation von Umkristallisation oder realer Kornentwicklung.','font-size="12"');
 return root(850,430,'Zeitabhängige Modellschicht und Schichtdickenverlauf',b);
}



