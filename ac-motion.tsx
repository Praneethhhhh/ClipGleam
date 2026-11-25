import React from 'react';

const hot='#ffad66', cold='#71e3fb', white='#edf6ff', muted='#91abc4';
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
const label=(x:number,y:number,text:string,color=white)=><text x={x} y={y} textAnchor="middle" fill={color} fontSize="32" fontWeight="750">{text}</text>;

function Fan({x,y,r,frame}:{x:number;y:number;r:number;frame:number}) {
  return <g transform={`translate(${x} ${y}) scale(${r/65})`}>
    <circle r="65" fill="#132d48" stroke="#769aba" strokeWidth="5"/>
    <g transform={`rotate(${frame*8})`} fill="#b7d7ec">{[0,120,240].map(a=><path key={a} transform={`rotate(${a})`} d="M0 0Q-25-23-13-51Q18-60 23-41Q25-19 0 0Z"/>)}</g>
    <circle r="11" fill="#557997"/>
  </g>;
}
function Heat({x,y,bag=false}:{x:number;y:number;bag?:boolean}){
  return <g transform={`translate(${x} ${y})`}><circle r="26" fill={hot} opacity=".18"/><circle r="14" fill={hot}/>
    {bag&&<g transform="translate(10 7) rotate(12)"><rect x="4" y="-5" width="15" height="10" rx="3" fill="none" stroke="#fff0c7" strokeWidth="3"/><rect width="25" height="20" rx="4" fill="#f6d187" stroke="#794322" strokeWidth="3"/></g>}
  </g>;
}
function Person({x,y,frame,scarf,wave=false}:{x:number;y:number;frame:number;scarf:boolean;wave?:boolean}){
  const shake=scarf?4*Math.sin(frame*1.6):0;
  return <g transform={`translate(${x+shake} ${y})`} stroke={white} strokeWidth="9" strokeLinecap="round" fill="none">
    <circle cy="-130" r="49" fill="#4a6b86"/><path d="M0-80v128m0 0-65 94m65-94 61 94M0-53l-76 77M0-53l71 2"/>
    {wave?<path d={`M71-51q30-42 ${42+12*Math.sin(frame*.25)} -74`}/>:<path d="M71-51l48-42"/>}
    <circle cx="-17" cy="-139" r="3" fill={white}/><circle cx="17" cy="-139" r="3" fill={white}/>
    <path d={scarf?'M-17-113q17-18 34 0':'M-18-116q18 17 36 0'} strokeWidth="5"/>
    {scarf&&<path d="M-45-84h86m-8 5 30 73" stroke="#f5799e" strokeWidth="15"/>}
  </g>;
}
function WallUnit({x=60,y=90}:{x?:number;y?:number}) {
  return <g transform={`translate(${x} ${y})`}><rect width="284" height="93" rx="23" fill="#e3edf6"/><path d="M23 67h238m-224 12h212" stroke="#6d879d" strokeWidth="5" strokeLinecap="round"/><circle cx="255" cy="27" r="6" fill="#18a88c"/></g>;
}
function Coil({x,y,color}:{x:number;y:number;color:string}) {
  return <g transform={`translate(${x} ${y})`}><rect x="-28" y="-32" width="360" height="223" rx="23" fill="#223d57" stroke="#6388a8" strokeWidth="5"/>
    {[0,1,2,3,4,5].map(i=><path key={i} d={`M${i*57+7}-18v194`} stroke="#4b6782" strokeWidth="7"/>)}
    <path d="M0 0h266q38 0 38 26t-38 26H38q-38 0-38 26t38 26h228q38 0 38 26t-38 26H0" fill="none" stroke={color} strokeWidth="15" strokeLinecap="round"/>
  </g>;
}
function Arrows({x,y,frame,color,width=130}:{x:number;y:number;frame:number;color:string;width?:number}) {
  return <g transform={`translate(${x} ${y})`} stroke={color} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7">
    {[0,1,2].map(i=><path key={i} opacity={.45+.5*(.5+.5*Math.sin(frame*.18-i))} d={`M0 ${i*38}h${width}m-18-15 18 15-18 15`}/>)}
  </g>;
}
function Circuit({frame,highlight=false}:{frame:number;highlight?:boolean}) {
  const x=frame<0?0:frame;
  const p=(x%100)/100;
  return <g>
    <path d="M158 252H678V560H158Z" fill="none" stroke="#567090" strokeWidth="18" strokeLinejoin="round"/>
    <path d="M158 252H678V560" fill="none" stroke={hot} strokeWidth="9"/>
    <path d="M678 560H158V252" fill="none" stroke={cold} strokeWidth="9"/>
    <path d="M428 136v470" stroke="#83a3bf" opacity=".58" strokeWidth="4" strokeDasharray="9 13"/>
    <WallUnit x={65} y={185}/><Fan x={686} y={280} r={65} frame={frame}/>
    <rect x="372" y="535" width="112" height="50" rx="12" fill="#2c4869" stroke={cold} strokeWidth="4"/>
    {label(206,350,'Inside')}{label(686,385,'Outside')}{label(428,635,'Expansion valve',cold)}
    {highlight&&<Heat x={195+435*p} y={252} bag={frame>24}/>}
    <circle cx={658-465*p} cy="560" r="12" fill={cold}/>
  </g>;
}
function PipeZoom({phase,frame,active}:{phase:'separate'|'boil'|'valve'|'return';frame:number;active:number}) {
 const valve=phase==='valve';
 return <g>
   <path d={valve?'M83 300H344L399 354L453 300H773V480H453L399 426L344 480H83Z':'M83 300H773V480H83Z'} fill="#184363" stroke="#9ed5f4" strokeWidth="7" strokeLinejoin="round"/>
   {phase==='separate'&&<><Arrows x={96} y={197} frame={frame} color={white} width={650}/>{label(428,174,'Room air stays outside')}{label(428,549,'Refrigerant stays inside',cold)}</>}
   {phase==='boil'&&<>{label(428,174,'Heat enters the coil',hot)}{[0,1,2].map(i=><Heat key={i} x={247+i*170} y={212+144*ease((active+i*.12))}/>)}{label(428,550,'Liquid to gas',hot)}</>}
   {valve&&<>{label(207,236,'Higher pressure',hot)}{label(618,236,'Lower pressure',cold)}{label(428,557,'Expansion valve')}</>}
   {phase==='return'&&<>{label(428,213,'Back to the indoor coil',cold)}{label(428,552,'Cold liquid and vapor',cold)}</>}
   {Array.from({length:9},(_,i)=>{
    const p=((frame*4+i*76)%650)/650;
    const x=101+p*650;
    const gas=phase==='return' ? i%3===0 : phase==='boil' ? p>.56&&active>.2 : valve&&p>.52&&i%2===0;
    return <circle key={i} cx={x} cy={390+(i%3-1)*(valve?19:39)} r={gas?15:10} fill={gas?'none':cold} stroke={cold} strokeWidth="3"/>;
   })}
 </g>;
}

export function ACMotion({template,frame,cues}:{template:string;frame:number;cues:Record<string,number>}) {
  const shot=Number(template.slice(3));
  const on=frame>=cues.action, active=ease((frame-cues.action)/26);
  const opening=frame<Math.max(28,cues.action-34);
  return <svg viewBox="0 0 856 740" width="100%" role="img" aria-label="Animated split air conditioner explainer">
    <defs><linearGradient id="ac-bg" x2="0" y2="1"><stop stopColor="#172f4b"/><stop offset="1" stopColor="#101f37"/></linearGradient></defs>
    <rect x="6" y="8" width="844" height="715" rx="40" fill="url(#ac-bg)" stroke="#4a6989" strokeWidth="3"/>
    {(shot===1||shot===12)&&<>
      {shot===1&&on?<><Fan x={393} y={322} r={117} frame={frame}/><Arrows x={513} y={281} frame={frame} color={hot} width={226}/>{label(428,585,'Warm air outside',hot)}</>:<>
        <path d="M48 591h761" stroke="#597893" strokeWidth="6"/>
        <WallUnit x={111} y={90}/><Arrows x={259} y={199} frame={frame} color={opening&&shot===1?muted:cold} width={207}/>
        <Person x={465} y={420} frame={frame} scarf={shot===1?!opening:!on} wave={shot===12&&on}/>
        <rect x={576} y={330} width="52" height="95" rx="11" fill="#435d7a" stroke={white} strokeWidth="4" transform="rotate(16 600 380)"/>
        <circle cx="602" cy="348" r="8" fill={opening&&shot===1?hot:cold}/>
        {shot===1&&opening&&<Heat x={377} y={236}/>}
      </>}
    </>}
    {(shot===2||shot===6||shot===11)&&<Circuit frame={frame} highlight={on}/>}
    {(shot===3||shot===8)&&<>
      <Fan x={149} y={363} r={82} frame={frame}/>
      <Coil x={291} y={280} color={shot===3?cold:hot}/>
      <Arrows x={230} y={320} frame={frame} color={white} width={76}/>
      <Arrows x={608} y={320} frame={frame} color={shot===3?cold:hot} width={143}/>
      {label(441,226,shot===3?'Indoor coil':'Outdoor coil')}
      {label(428,564,shot===3?'Cooler air returns inside':'Heat leaves • refrigerant condenses',shot===3?cold:hot)}
      {on&&shot===8&&<Heat x={650+76*((frame%36)/36)} y={374}/>}
    </>}
    {shot===4&&<PipeZoom phase="separate" frame={frame} active={active}/>}
    {shot===5&&<PipeZoom phase="boil" frame={frame} active={active}/>}
    {shot===9&&<PipeZoom phase="valve" frame={frame} active={active}/>}
    {shot===10&&<PipeZoom phase="return" frame={frame} active={active}/>}
    {shot===7&&<>
      <rect x="264" y="210" width="329" height="320" rx="36" fill="#283f60" stroke="#a9c4e0" strokeWidth="7"/>
      <rect x="305" y={255+92*active} width="245" height="42" rx="9" fill="#cae1f1"/>
      <path d={`M428 160V${255+92*active}`} stroke="#cae1f1" strokeWidth="19"/>
      {[0,1,2,3,4].map(i=><Heat key={i} x={329+i*49} y={456+15*Math.sin(frame*.13+i)*(1-active*.6)}/>)}
      {label(428,604,'Compressor')}{on&&label(428,650,'Higher pressure • hotter gas',hot)}
    </>}
  </svg>;
}
