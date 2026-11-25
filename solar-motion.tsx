import React from 'react';

const sun = '#ffd36a';
const charge = '#72e4ff';
const cyan = '#8bd8df';
const ink = '#102238';
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const reveal = (frame: number, cue: number) => clamp((frame - cue) / 8);

type Props = {template: string; frame: number; cues: Record<string, number>};

const Electron = ({x, y}: {x: number; y: number}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r="23" fill={charge} stroke="#e0faff" strokeWidth="2"/>
    <path d="M-8 0h16" stroke={ink} strokeWidth="4" strokeLinecap="round"/>
  </g>
);

function Panel({x,y,scale=1}: {x:number;y:number;scale?:number}) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M55 124l-24 43m122-43 18 43M18 169h171" stroke="#829eb7" strokeWidth="8" strokeLinecap="round"/>
    <path d="M35 8h146l29 116H2Z" fill="#122d55" stroke="#b5d9f5" strokeWidth="7" strokeLinejoin="round"/>
    {[0,1,2].flatMap(row=>[0,1,2,3].map(col=>{
      const top=14+row*33, left=lerp(35,6,top/125), width=lerp(142,195,top/125);
      const x0=left+col*width/4;
      return <rect key={`${row}-${col}`} x={x0+4} y={top+4} width={width/4-8} height="25" rx="3" fill={(row+col)%2===0?'#3b7be2':'#5ba6ff'}/>;
    }))}
  </g>;
}

function SunIcon({x,y,r}: {x:number;y:number;r:number}) {
  return <g transform={`translate(${x} ${y})`}>
    <circle r={r+20} fill={sun} opacity=".08"/>
    <circle r={r} fill={sun}/>
    {Array.from({length:8},(_,i)=><path key={i} d={`M0 ${-r-10}v-14`} transform={`rotate(${45*i})`} stroke={sun} strokeWidth="5" strokeLinecap="round"/>)}
  </g>;
}

function CellOverview({frame,cues}: Pick<Props,'frame'|'cues'>) {
  const focus=clamp((frame-18)/45);
  const zoom=0.84+focus*.16;
  return <g>
    <SunIcon x={126} y={120} r={38}/>
    <path d="M180 142l118 35m-124 1 106 45" stroke={sun} strokeWidth="4" opacity=".55" strokeDasharray="8 10"/>
    <g transform={`translate(${325-28*focus} ${52-6*focus}) scale(${zoom})`}>
      <Panel x={0} y={0} scale={1.6}/>
      <rect x="167" y="54" width="68" height="39" rx="8" fill="none" stroke={sun} strokeWidth="5" opacity={focus}/>
    </g>
    <text x="580" y="250" fill="#e0edff" textAnchor="middle">Solar panel</text>
    <path d="M562 150L736 293M565 150L310 293" stroke="#7dbcf6" strokeWidth="3" strokeDasharray="9 8" opacity={focus*.6}/>
    <g opacity={focus}><Cell field={reveal(frame,cues.field)}/></g>
    <text x="100" y="280" fill="#c1d8f4" opacity={focus}>Magnified solar cell</text>
  </g>;
}

function Cell({field}: {field: number}) {
  return <g>
    <rect x="98" y="305" width="660" height="116" rx="20" fill="#557cf2"/>
    <rect x="98" y="418" width="660" height="116" rx="20" fill="#8869dd"/>
    <path d="M103 419H753" stroke="#e9dfff" strokeWidth="4" strokeDasharray="12 9"/>
    <path d="M106 300H750" stroke={cyan} strokeWidth="12" strokeLinecap="round"/>
    <text x="125" y="373" fill="white">n-type silicon</text>
    <text x="125" y="487" fill="white">p-type silicon</text>
    <g opacity={field}>
      {[460, 570, 680].map(x => <path key={x} d={`M${x} 460v-78`} stroke={sun} strokeWidth="6" markerEnd="url(#solar-arrow)"/>)}
      <text x="412" y="575" fill={sun}>Junction field</text>
    </g>
  </g>;
}

function Sunlight({frame, cues}: Pick<Props,'frame'|'cues'>) {
  // A photon reaches the cell on the spoken collision cue, then the freed charge travels to a contact.
  const collision = clamp((frame - cues.strike) / 16);
  const release = clamp((frame - cues.release) / 24);
  const travel = clamp((frame - cues.flow) / 54);
  const electronX = lerp(432, 696, travel);
  const electronY = lerp(389, 310, Math.max(release * .7, travel));
  return <g>
    <Cell field={reveal(frame, cues.field)}/>
    <g opacity={reveal(frame, cues.photons)}>
      <SunIcon x={214} y={88} r={43}/>
      <path d="M269 124L432 290M339 104L518 289M174 153L290 287" stroke={sun} strokeWidth="4" opacity=".38" strokeDasharray="10 12"/>
      <text x="300" y="84" fill={sun}>Sunlight</text>
      {[0,1,2].map(i => {
        const p = Math.max(0, ((frame-cues.photons-8*i)%42)/42);
        return <circle key={i} cx={lerp(273+i*55, 432+i*43, p)} cy={lerp(135, 290, p)} r="12" fill={sun} opacity={1-reveal(frame,cues.strike)}/>;
      })}
    </g>
    {frame >= cues.strike && frame < cues.release && <circle cx={432} cy={lerp(290,389,collision)} r="14" fill={sun}/>}
    <g opacity={reveal(frame,cues.strike)*(1-reveal(frame,cues.flow))}>
      {[[-44,-24],[42,-21],[-44,27],[42,28]].map(([dx,dy],i)=>
        <g key={i}><path d={`M432 389l${dx} ${dy}`} stroke="#e4edff" strokeWidth="3" opacity=".65"/>
        <circle cx={432+dx} cy={389+dy} r="9" fill="#b6c6fc"/></g>)}
      <circle cx="432" cy="389" r="13" fill="#e5ecff"/>
    </g>
    <circle cx="432" cy="389" r={30+release*28} fill="none" stroke={sun} strokeWidth="5" opacity={frame>=cues.release ? 1-release : 0}/>
    {frame>=cues.release && <Electron x={electronX} y={electronY}/>}
    {frame>=cues.flow && <path d="M460 348Q546 305 647 305" stroke={charge} strokeWidth="5" strokeDasharray="9 9" markerEnd="url(#solar-arrow)"/>}
  </g>;
}

function Circuit({frame,cues}: Pick<Props,'frame'|'cues'>) {
  const dc = reveal(frame,cues.dc);
  const ac = reveal(frame,cues.inverter);
  const home = reveal(frame,cues.home);
  return <g>
    <path d="M206 300H324M527 300H646" stroke="#506784" strokeWidth="8" strokeLinecap="round"/>
    <path d="M206 300H324" stroke={charge} strokeWidth="8" opacity={dc}/>
    <path d="M527 300H646" stroke={sun} strokeWidth="8" opacity={ac}/>
    <g transform="translate(57 225)">
      <path d="M22 2H142L160 118H0Z" fill="#365fbe" stroke={charge} strokeWidth="4"/>
      <path d="M8 86H153M14 61H151M18 33H147M62 4L55 117M101 4L108 117" stroke={charge} strokeWidth="2"/><path d="M42 120l-8 28m89-28 10 28M20 150h127" stroke="#829eb7" strokeWidth="6" strokeLinecap="round"/>
      <text x="80" y="196" textAnchor="middle" fill="white">Solar panel</text>
    </g>
    <rect x="324" y="232" width="203" height="136" rx="22" fill={ac>0?'#283a55':'#202d45'} stroke={ac>0?sun:'#66809e'} strokeWidth="4"/>
    <path d="M351 300c16-55 31-55 48 0s33 55 49 0 32-55 48 0" fill="none" stroke={sun} strokeWidth="6" opacity={ac}/>
    <text x="425" y="410" textAnchor="middle" fill="white">Inverter</text>
    <path d="M630 273l91-74 91 74h-22v92H652v-92Z" fill={home>0?'#3c5472':'#263853'} stroke={home>0?sun:'#66809e'} strokeWidth="5"/>
    <rect x="685" y="280" width="29" height="36" rx="4" fill={sun} opacity={home}/>
    <rect x="731" y="280" width="29" height="36" rx="4" fill={sun} opacity={home}/>
    <path d="M713 364v-36h26v36" fill="#15263c" stroke="#8199b6" strokeWidth="3"/><text x="721" y="410" textAnchor="middle" fill="white">Home</text>
    <text x="254" y="273" fill={charge} opacity={dc}>DC</text>
    <text x="565" y="273" fill={sun} opacity={ac}>AC</text>
    {dc>0 && <circle cx={lerp(211,320,((frame-cues.dc)%34)/34)} cy="300" r="12" fill={charge}/>}
    {ac>0 && <circle cx={lerp(532,641,((frame-cues.inverter)%34)/34)} cy="300" r="12" fill={sun}/>}
  </g>;
}

export function SolarMotion({template,frame,cues}: Props) {
  return <svg viewBox="0 0 856 600" width="100%" style={{overflow:'visible',fontSize:29,fontWeight:700}}>
    <defs><marker id="solar-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0l9 4.5L0 9z" fill={sun}/></marker></defs>
    {template==='solar-cell' && <CellOverview frame={frame} cues={cues}/>}
    {template==='solar-light' && <Sunlight frame={frame} cues={cues}/>}
    {template==='solar-circuit' && <Circuit frame={frame} cues={cues}/>}
  </svg>;
}
