import React from 'react';
import land from './atlas-land.json';

const stops = [
  {name:'Everest', at:[86.93,27.99], color:'#ffc157'},
  {name:'Sahara', at:[13,24], color:'#ffac61'},
  {name:'Grand Canyon', at:[-112.11,36.06], color:'#ff9477'},
  {name:'Amazon Basin', at:[-63,-4], color:'#74edaf'},
  {name:'Ural Mountains', at:[59,60], color:'#c3aaff'},
  {name:'Great Barrier Reef', at:[148,-19], color:'#62e2f5'},
  {name:'Antarctica', at:[0,-82], color:'#a7ddff'},
] as const;
const congo = {name:'Congo Basin', at:[22,-2], color:'#74edaf'} as const;
type Stop = typeof stops[number] | typeof congo;
const ease = (t:number) => 1 - (1 - Math.max(0,Math.min(1,t))) ** 3;
const project = ([lon,lat]:readonly [number,number]) => [(lon+180)*10,(90-lat)*10];

function Coastlines() {
  return <g fill="#397e79" stroke="#78cabe" strokeWidth="3" fillRule="evenodd">
    {land.map((path,i)=><path key={i} d={path}/>)}
  </g>;
}
function MapPin({stop, opacity=1}:{stop:Stop;opacity?:number}) {
  const [x,y] = project(stop.at);
  return <g transform={`translate(${x} ${y})`} opacity={opacity}>
    <circle r="92" fill={stop.color} opacity=".16"/><circle r="43" fill="#143345" stroke={stop.color} strokeWidth="14"/>
    <circle r="16" fill={stop.color}/>
  </g>;
}
function WorldMap({shot,frame,action}:{shot:number;frame:number;action:number}) {
  const stop = stops[shot-3];
  const p = ease(frame/40);
  const v = ease((frame-action)/23);
  const target = stop ? project(stop.at) : [1800,900];
  const zoom = stop ? 1 + .47*p : 1;
  const center = [1800+(target[0]-1800)*p*.79,900+(target[1]-900)*p*.79];
  return <svg x="0" y="0" width="880" height="450" viewBox="0 0 880 450">
    <defs><clipPath id="atlas-map"><rect width="880" height="450" rx="30"/></clipPath></defs>
    <g clipPath="url(#atlas-map)">
      <rect width="880" height="450" fill="#153346"/>
      <g transform={`translate(440 225) scale(${zoom * .238}) translate(${-center[0]} ${-center[1]})`}>
        <path d="M0 300H3600 M0 600H3600 M0 900H3600 M0 1200H3600 M0 1500H3600 M600 0V1800 M1200 0V1800 M1800 0V1800 M2400 0V1800 M3000 0V1800" fill="none" stroke="#376174" strokeWidth="5"/>
        <Coastlines/>
        {shot===7 && <path d="M2460 210L2410 296L2395 370L2385 425" pathLength="1" fill="none" stroke="#ffe8a9" strokeWidth="15" strokeDasharray=".075 .05" opacity={v}/>}
        {stop && <MapPin stop={stop} opacity={p}/>}
        {shot===4 && <MapPin stop={congo} opacity={v}/>}
        {(shot===2||shot===10) && stops.map((pin,i)=><MapPin key={pin.name} stop={pin} opacity={ease((frame-i*6)/15)}/>)}
      </g>
    </g>
    <rect x="1.5" y="1.5" width="877" height="447" rx="30" fill="none" stroke="#4d8491" strokeWidth="3"/>
  </svg>;
}

function DiagramLabel({x,y,children,color='#f7f1da'}:{x:number;y:number;children:React.ReactNode;color?:string}) {
  return <text x={x} y={y} textAnchor="middle" fill={color} fontSize="35" fontWeight="800">{children}</text>;
}

function Illustration({shot, frame, action}:{shot:number;frame:number;action:number}) {
  const p = ease(frame/24);
  const cue = ease((frame-action)/28);
  const drift = Math.sin(frame/25)*7;
  const branch = 'M100 90Q175 108 205 182M130 275Q165 222 249 221M312 75Q355 138 364 186M453 288Q495 232 543 225M554 71Q584 130 639 162';
  const main = 'M60 220Q149 139 232 211T412 206T572 205T804 122';
  return <svg y="475" width="880" height="560" viewBox="0 0 880 440">
    <defs>
      <linearGradient id="atlas-ice" x2="0" y2="1"><stop stopColor="#a7f1ff"/><stop offset="1" stopColor="#4274bd"/></linearGradient>
      <linearGradient id="atlas-water" x2="0" y2="1"><stop stopColor="#136579"/><stop offset="1" stopColor="#14253d"/></linearGradient>
      <linearGradient id="atlas-sand" x2="0" y2="1"><stop stopColor="#ffc27c"/><stop offset="1" stopColor="#a75342"/></linearGradient>
    </defs>
    <rect width="880" height="440" rx="34" fill={shot===8?'url(#atlas-water)':'#18323f'} stroke="#355363" strokeWidth="3"/>
    {shot===1 && <>
      <g opacity={1-cue} transform={`translate(${-90*cue} 0)`}>
        <circle cx="648" cy="132" r="62" fill="#ffcf77"/>
        <path d="M34 291Q197 110 386 274T846 250V390H34Z" fill="url(#atlas-sand)"/>
        <path d="M34 340Q245 227 468 330T846 279V390H34Z" fill="#e99c63"/>
      </g>
      <g opacity={cue} transform={`translate(${90*(1-cue)} 0)`}>
        <path d="M34 289l160-88 100 34 169-122 141 126 87-32 155 82v101H34Z" fill="url(#atlas-ice)"/>
        <path d="M34 350l166-24 122 21 167-43 357 32v54H34Z" fill="#b4e4f3"/>
      </g>
      <text x="440" y="262" fill="#fff5cf" stroke="#18323f" strokeWidth="3" paintOrder="stroke" textAnchor="middle" fontWeight="800" fontSize="176">?</text>
    </>}
    {(shot===2||shot===10) && <>
      <path d="M95 220Q151 90 220 220T335 220T450 220T565 220T680 220T795 220" fill="none" stroke="#567487" strokeWidth="5" strokeDasharray="8 12"/>
      {stops.map((stop,i)=><g key={stop.name} opacity={ease((frame-i*6)/13)} transform={`translate(${95+i*115} ${220+(i%2?-35:35)+4*Math.sin(frame/10+i)})`}>
        <circle r="39" fill={stop.color}/><text y="13" textAnchor="middle" fontSize="37" fontWeight="800" fill="#102732">{i+1}</text>
      </g>)}
      <DiagramLabel x={440} y={355} color="#a9efeb">{shot===2?'A trip around Earth':'Seven continents. Seven surprises.'}</DiagramLabel>
    </>}
    {shot===3 && <>
      <path d="M40 358L269 210L395 295L539 106L821 358Z" fill="#6986a6" transform={`translate(0 ${70*(1-p)})`}/>
      <path d="M305 335L539 106L652 235L568 207L544 233L487 181Z" fill="#e1f5f8"/>
      <path d="M55 360H820" stroke="#78deeb" strokeWidth="5" strokeDasharray="11 9" opacity={cue}/>
      <path d="M539 342V122" stroke="#ffcf77" strokeWidth="6" strokeDasharray="10 8" opacity={cue}/>
      <DiagramLabel x={657} y={102} color="#ffcf77">Everest</DiagramLabel>
      <g opacity={cue}><DiagramLabel x={206} y={401} color="#91e2ed">Sea level</DiagramLabel></g>
    </>}
    {shot===4 && <>
      <circle cx="294" cy="106" r="50" fill="#ffca73"/>
      <path d="M30 252Q152 117 282 234T449 236V344H30Z" fill="url(#atlas-sand)"/>
      <path d="M30 304Q180 211 341 290L449 249V344H30Z" fill="#e4a05e"/>
      <g opacity={cue} transform={`translate(0 ${45*(1-cue)})`}>
        <path d="M451 321Q575 239 850 222V344H451Z" fill="#287857"/>
        {[0,1,2,3,4,5,6].map(i=><g key={i} transform={`translate(${487+i*54} ${218+(i%3)*22})`}>
          <path d="M0 11V119" stroke="#a77d5c" strokeWidth="12"/><ellipse cx={drift*.3} rx="38" ry="33" fill={i%2?'#61b674':'#8ad494'}/>
        </g>)}
      </g>
      <DiagramLabel x={202} y={397} color="#ffc881">Sahara</DiagramLabel>
      <g opacity={cue}><DiagramLabel x={644} y={397} color="#88f2ac">Congo Basin</DiagramLabel></g>
    </>}
    {shot===5 && <>
      <path d="M35 113H283L390 313H501L598 113H845V378H35Z" fill="#a15b48"/>
      {[0,1,2,3].map(i=><path key={i} d={`M35 ${133+i*57}H${294+i*28}L${390+i*28} 313M845 ${133+i*57}H${587-i*30}L${501-i*27} 313`} stroke={['#ffb57d','#e99868','#fdc18f','#d0805c'][i]} strokeWidth="12" fill="none"/>)}
      <path d="M399 319Q451 289 497 319Q454 350 399 319Z" fill="#79e3ef"/>
      <path d="M409 319Q451 300 486 319" stroke="#fff" strokeWidth="4" fill="none" strokeDasharray="7 13" strokeDashoffset={-frame}/>
      <g opacity={cue}><DiagramLabel x={440} y={411} color="#8ce6f3">Colorado River</DiagramLabel></g>
    </>}
    {shot===6 && <>
      <g opacity={1-cue*.78}>
        {[0,1,2,3,4,5,6,7].map(i=><circle key={i} cx={75+i*107} cy={i%2?283:132} r={58+i%3*11} fill={i%2?'#245e53':'#276d57'}/>)}
      </g>
      <path d={main} fill="none" stroke={cue>.65?'#8bddad':'#65dbe9'} strokeWidth="16" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-p}/>
      <path d={branch} fill="none" stroke={cue>.65?'#a5edaa':'#83e8ed'} strokeWidth="8" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-ease((frame-14)/42)}/>
      <DiagramLabel x={440} y={386} color="#abf0c5">{cue>.65?'Branches meet a trunk':'Tributaries feed the Amazon'}</DiagramLabel>
    </>}
    {shot===7 && <>
      <path d="M34 309Q240 281 350 302T846 289V360H34Z" fill="#386b65"/>
      <path d="M249 306l112-113 66 48 93-123 151 188Z" fill="#8293c3" transform={`translate(0 ${60*(1-cue)})`}/>
      <path d="M463 193l57-75 67 85-55-30-21 27Z" fill="#e3e9fb" transform={`translate(0 ${60*(1-cue)})`}/>
      <path d="M230 342Q454 336 673 342" stroke="#ffd988" strokeWidth="6" strokeDasharray="13 12" opacity={cue}/>
      <DiagramLabel x={204} y={130}>Europe</DiagramLabel><DiagramLabel x={702} y={130}>Asia</DiagramLabel>
      <g opacity={cue}><DiagramLabel x={440} y={402} color="#ffd988">Ural Mountains</DiagramLabel></g>
    </>}
    {shot===8 && <>
      <path d="M35 338Q234 283 453 336T845 321V375H35Z" fill="#25687a"/>
      {[0,1,2,3,4,5].map(i=><g key={i} opacity={ease((frame-13*i)/30)} transform={`translate(${102+i*135} ${345-(i%3)*13}) scale(${.73+(i%3)*.17})`}>
        <path d="M0 0Q-16-37-2-104M-5-24Q-34-55-47-96M-4-53Q25-71 31-111M9-21Q42-29 53-58" fill="none" stroke={['#ffa291','#ffcb77','#cba7ff'][i%3]} strokeWidth="13" strokeLinecap="round"/>
      </g>)}
      <g opacity={cue} transform={`translate(696 129) scale(${.65+.35*cue})`}>
        <circle r="96" fill="#163345" stroke="#82eff1" strokeWidth="4"/>
        <path d="M-25 53L-35 12Q-35-19 0-19T35 12L25 53Z" fill="#ffae99"/>
        {Array.from({length:8},(_,i)=><path key={i} d="M0-17Q-15-42 0-67" fill="none" stroke="#ffc4a7" strokeWidth="9" strokeLinecap="round" transform={`rotate(${i*28-98})`}/>)}
        <circle cy="2" r="8" fill="#944862"/>
      </g>
      <g opacity={cue}><DiagramLabel x={241} y={405} color="#9aeef0">Coral polyp</DiagramLabel><path d="M376 394L604 207" fill="none" stroke="#9aeef0" strokeWidth="4" strokeDasharray="8 9"/></g>
    </>}
    {shot===9 && <>
      {[0,1,2,3,4,5,6].map(i=><circle key={i} cx={90+i*111+drift} cy={58+(frame*(.42+i%3*.18)+i*33)%132} r={3+i%3} fill="#e1f8ff" opacity={cue*.78}/>)}
      <path d="M34 223Q223 168 434 207T846 215V362H34Z" fill="url(#atlas-ice)"/>
      {[0,1,2].map(i=><path key={i} d={`M36 ${253+i*38} Q235 ${226+i*38} 437 ${252+i*38}T844 ${249+i*38}`} fill="none" stroke="#d4effc" opacity={.7-i*.15} strokeWidth="4"/>)}
      <g opacity={cue}><DiagramLabel x={440} y={106} color="#cff6ff">Little snowfall</DiagramLabel><DiagramLabel x={440} y={328} color="#112a4a">Ice built up over time</DiagramLabel></g>
    </>}
  </svg>;
}

export function ContinentsMotion({template,frame,cues}:{template:string;frame:number;cues:Record<string,number>}) {
  const shot = Number(template.slice('atlas-'.length));
  const stop = stops[shot-3];
  return <svg viewBox="0 0 880 1040" width="100%" role="img" aria-label={stop?.name ?? 'Seven continents'}>
    {shot===1 ? <g>
      <rect width="880" height="450" rx="30" fill="#183648" stroke="#4d8491" strokeWidth="3"/>
      <circle cx="440" cy="225" r="155" fill="#306e88"/>
      <ellipse cx="440" cy="225" rx="74" ry="155" fill="none" stroke="#9bdddd" strokeWidth="3" opacity=".7"/>
      <path d="M288 225H592M315 145Q440 192 565 145M315 305Q440 258 565 305" fill="none" stroke="#9bdddd" strokeWidth="3" opacity=".7"/>
      <circle cx="440" cy="225" r={114+Math.sin(frame/13)*9} fill="none" stroke="#ffd580" strokeWidth="3" strokeDasharray="9 12"/>
      <text x="440" y="291" textAnchor="middle" fontSize="190" fontWeight="800" fill="#ffd580">?</text>
    </g> : <WorldMap shot={shot} frame={frame} action={cues.action}/>}
    <Illustration shot={shot} frame={frame} action={cues.action}/>
  </svg>;
}
