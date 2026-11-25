import React from 'react';

const gold = '#ffd064';
const ice = '#a0dcff';
const ease = (n:number) => {
  const t=Math.max(0,Math.min(1,n));
  return t*t*(3-2*t);
};

function Sun({x,y,r}:{x:number;y:number;r:number}) {
  return <g transform={`translate(${x} ${y})`}>
    <circle r={r+22} fill={gold} opacity=".14"/>
    {Array.from({length:12},(_,i)=><path key={i} d={`M0 ${-r-10}v-15`} transform={`rotate(${30*i})`} stroke={gold} strokeWidth="4" strokeLinecap="round"/>)}
    <circle r={r} fill={gold}/><circle cx={-r*.24} cy={-r*.3} r={r*.28} fill="#ffedb1"/>
  </g>;
}

function Earth({x,y,r,axis=1,light='right'}:{x:number;y:number;r:number;axis?:number;light?:'right'|'left'}) {
  return <g transform={`translate(${x} ${y}) scale(${r/100})`}>
    <circle r="105" fill="#82d7ff" opacity=".26"/>
    <circle r="100" fill="#3688ef"/>
    <g transform="rotate(23.5)">
      <path d="M-85-49l29-26 30 3 18 15-18 19 7 16-20 14-12 18-23-26zM-43 10l24 12 19 3-4 21-23 33-8-21zM16-61l31-13 37 23 7 18-29 8-5 22-20 13-14-22-20-19zM49 37l32-9 12 20-22 21-26-9z" fill="#8ee2a4"/>
      <path d="M-100 0Q0 42 100 0" fill="none" stroke="#e9f8ff" strokeWidth="3" strokeDasharray="7 7" opacity={axis*.7}/>
      <g opacity={axis}>
        <path d="M0-128v256" stroke="#eff7ff" strokeWidth="3" strokeDasharray="9 7"/>
        <circle cy="-118" r="7" fill="#ffbd74"/>
        <circle cy="118" r="7" fill={ice}/>
      </g>
    </g>
    <path d={light==='right'?'M0-100A100 100 0 0 0 0 100Q-51 0 0-100':'M0-100A100 100 0 0 1 0 100Q51 0 0-100'} fill="#172547" opacity=".32"/>
    <circle r="100" fill="none" stroke="#92dcff" strokeWidth="3"/>
  </g>;
}

const Label = ({x,y,color='#f6faff',children}: {x:number;y:number;color?:string;children:React.ReactNode}) =>
  <text x={x} y={y} fill={color} textAnchor="middle" fontSize="29" fontWeight="750">{children}</text>;

export function SeasonsMotion({template,frame,cues}:{template:string;frame:number;cues:Record<string,number>}) {
  const at=(cue:string,length=14)=>ease((frame-cues[cue])/length);
  const orbit=at('orbit',100);
  const takeaway=at('takeaway');
  return <svg viewBox="0 0 856 720" width="100%" role="img" aria-label="Illustrated Earth and Sun explaining the seasons">
    <defs>
      <pattern id="stars" width="97" height="87" patternUnits="userSpaceOnUse"><circle cx="17" cy="30" r="2" fill="#a6cbf7" opacity=".35"/><circle cx="68" cy="62" r="1.5" fill="#fff" opacity=".19"/></pattern>
      <marker id="ray" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0l9 4.5L0 9z" fill={gold}/></marker>
    </defs>
    <rect x="8" y="11" width="840" height="620" rx="44" fill="#101b33" stroke="#354769" strokeWidth="2"/>
    <rect x="9" y="12" width="838" height="618" rx="44" fill="url(#stars)"/>
    {template==='seasons-tilt' && <>
      <Sun x={650} y={273} r={86}/>
      {[232,274,316].map(y=><path key={y} d={`M534 ${y}H411`} stroke={gold} strokeWidth="4" strokeDasharray="9 10" markerEnd="url(#ray)" opacity=".7"/>)}
      <Earth x={279} y={273} r={127} axis={at('tilt')}/>
      <Label x={279} y={485}>Earth</Label><Label x={650} y={485} color={gold}>Sun</Label>
      <g opacity={at('tilt')}><path d="M279 100v321" stroke="#eff7ff" opacity=".3" strokeDasharray="5 7"/><Label x={428} y={564} color={ice}>Earth leans to one side</Label></g>
    </>}
    {template==='seasons-light' && <>
      <Sun x={668} y={254} r={74}/>
      <Earth x={294} y={305} r={129}/>
      <g opacity={at('direct')}>
        {[220,246,272].map(y=><path key={y} d={`M570 ${y}H${y===220?386:411}`} stroke={gold} strokeWidth="5" markerEnd="url(#ray)"/>)}
        <circle cx="347" cy="234" r={13+4*Math.sin(frame/8)} fill={gold}/>
        <Label x={260} y={505} color={gold}>North: summer</Label>
        <Label x={260} y={552} color="#f9ebba">More direct light</Label>
      </g>
      <g opacity={at('opposite')}>
        {[333,366].map(y=><path key={y} d={`M570 ${y}L398 ${y+24}`} stroke={ice} strokeWidth="3" strokeDasharray="7 7"/>)}
        <circle cx="287" cy="392" r="12" fill={ice}/>
        <Label x={609} y={505} color={ice}>South: winter</Label>
        <Label x={609} y={552} color="#c8eaff">Less direct light</Label>
      </g>
    </>}
    {template==='seasons-orbit' && <>
      <ellipse cx="428" cy="298" rx="249" ry="115" fill="none" stroke="#59789e" strokeWidth="3" strokeDasharray="9 9"/>
      <Sun x={428} y={298} r={59}/>
      <g opacity={orbit===0?0:.38}><Earth x={179} y={298} r={53}/></g>
      <Earth x={428-249*Math.cos(Math.PI*orbit)} y={298+115*Math.sin(Math.PI*orbit)} r={65} light={orbit<.5?'right':'left'}/>
      <Label x={179} y={483} color={gold}>North: summer</Label>
      <g opacity={ease((orbit-.75)*5)}><Label x={677} y={483} color={ice}>North: winter</Label></g>
      <g opacity={takeaway}><rect x="206" y="530" width="444" height="62" rx="31" fill="#274365"/><Label x={428} y={571}>Same tilt. Seasons swap.</Label></g>
    </>}
  </svg>;
}
