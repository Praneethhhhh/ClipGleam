import React from 'react';

const hot='#ffcb75', ice='#8ce7ff', paper='#fff5d8';
const ease=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
const seasons=['June','September','December','March'];
const centers=[[218,365],[428,155],[638,365],[428,575]];
const Label=({x,y,text,color=paper,size=27}:{x:number;y:number;text:string;color?:string;size?:number})=><text x={x} y={y} textAnchor="middle" fontSize={size} fontWeight="800" fill={color}>{text}</text>;

function Globe({x,y,r,frame,axis=0,light=0}:{x:number;y:number;r:number;frame:number;axis?:number;light?:number}){
 const drift=13*Math.sin(frame/49);
 return <g transform={`translate(${x} ${y}) scale(${r/100})`}>
   <circle r="105" fill="#5abfff" opacity=".25"/><circle r="100" fill="url(#year-ocean)"/>
   <g clipPath="url(#year-globe)" transform="rotate(23.5)">
     <g transform={`translate(${drift} 0)`} fill="#a9e5a5">
       <path d="M-90-49l23-27 29 2 16 9 10 15-12 10-2 21-17 6-14 26-28-34zM-41 12l34 12-3 28-29 31-8-22zM3-64l54-11 31 16 9 25-37 14-10 24-20-24-23-2-12-21zM18-8l32 5 7 23-25 34-17-29zM64 40l23-5 14 21-28 12-19-11z"/>
       <path d="M-126-55Q-57-86-14-51M15-35Q61-50 112-29M-90 42Q-41 18 4 39M41 65Q67 51 105 71" fill="none" stroke="white" strokeWidth="8" opacity=".31"/>
     </g>
   </g>
   {light!==0&&<path d={light===1?'M0-100A100 100 0 0 0 0 100Q-58 0 0-100':'M0-100A100 100 0 0 1 0 100Q58 0 0-100'} fill="#0c1739" opacity=".55"/>}
   <circle r="100" fill="none" stroke="#b0e7fa" strokeWidth="2"/>
   <g opacity={axis}><path d="M0-131v262" stroke="#f0f7ff" strokeWidth="2" opacity=".32" strokeDasharray="5 7"/>
   <g transform="rotate(23.5)"><path d="M0-133v266" stroke={hot} strokeWidth="4" strokeDasharray="10 7"/><circle cy="-117" r="7" fill={hot}/></g></g>
 </g>;
}
function Sun({x,y,r}:{x:number;y:number;r:number}){
 return <g transform={`translate(${x} ${y})`}><circle r={r*1.46} fill={hot} opacity=".1"/><circle r={r*1.2} fill={hot} opacity=".2"/><circle r={r} fill="url(#year-sun)"/></g>;
}
function Bag({x,y,warm,frame,name}:{x:number;y:number;warm:boolean;frame:number;name:string}){
 const drop=76*(1-ease(frame/20));
 return <g transform={`translate(${x} ${y})`}>
  <rect x="-149" y="-193" width="298" height="422" rx="32" fill={warm?'#743c42':'#234e75'} stroke={warm?'#ee9c79':'#76bbeb'} strokeWidth="3"/>
  <circle cx="100" cy="-132" r="26" fill={warm?hot:ice} opacity=".8"/>
  <path d={warm?'M-140 141Q0 51 140 130V219H-140Z':'M-140 160l70-82 48 41 67-96 95 122v76h-280z'} fill={warm?'#c77960':'#678db4'}/>
  <rect x="-91" y="37" width="182" height="98" rx="20" fill={warm?'#b34857':'#416eba'} stroke={paper} strokeWidth="5"/><path d="M-32 36v-19q0-11 12-11h40q12 0 12 11v19M-59 43v86M59 43v86" fill="none" stroke={paper} strokeWidth="5"/>
  <g transform={`translate(0 ${-18-drop}) rotate(${(1-ease(frame/20))*-18})`}>
   {warm?<><rect x="-53" y="-21" width="47" height="31" rx="12" fill="#222039" stroke={hot} strokeWidth="5"/><rect x="6" y="-21" width="47" height="31" rx="12" fill="#222039" stroke={hot} strokeWidth="5"/><path d="M-6-13H6" stroke={hot} strokeWidth="5"/></>:<path d="M-28-31l-35 20 15 46 24-14v28h48V21l24 14 15-46-35-20-12 11H-16Z" fill="#94e7e7" stroke="#1c516c" strokeWidth="4"/>}
  </g>
  <Label x={0} y={193} text={name+' · '+(warm?'SUMMER':'WINTER')} size={24}/>
 </g>;
}
function Orbit({shot,frame,active}:{shot:number;frame:number;active:number}){
 const stop=shot===13?1:shot===14?2:shot===15?3:0;
 const a=stop*Math.PI/2-Math.PI;
 const theta=stop>0?a-(1-active)*Math.PI/2:a;
 const x=428+210*Math.cos(theta),y=365+210*Math.sin(theta);
 return <>
  <circle cx="428" cy="365" r="210" fill="none" stroke="#6b89b5" strokeWidth="3" strokeDasharray="8 10"/>
  <Sun x={428} y={365} r={73}/>
  {centers.map(([x0,y0],i)=><g key={i} opacity={i===stop?1:.42}><circle cx={x0} cy={y0} r="14" fill={i===0?hot:i===2?ice:paper}/><Label x={x0} y={y0+(i===1?-77:i===3?84:89)} text={seasons[i]}/></g>)}
  <Globe x={x} y={y} r={53} frame={frame} axis={shot>=6?1:0} light={x<428?1:-1}/>
  {shot===3&&<Label x={660} y={240} text="Closer?" color={hot} size={39}/>}
  {shot===6&&<><path d="M236 316L294 186" stroke={hot} strokeWidth="3" strokeDasharray="7 7"/><Label x={309} y={164} text="Same direction" color={hot}/></>}
  {shot>=13&&<Label x={428} y={716} text={shot===13?'Equinox · almost equal daylight':shot===14?'North: winter   •   South: summer':'Spring and autumn between the extremes'} color={ice} size={25}/>}
 </>;
}
function Flashlight({shot,active}:{shot:number;active:number}){
 const tilt=shot===7?0:shot===8?active:1;
 return <>
  <path d="M205 303L637 231V465L205 391Z" fill={hot} opacity={.19+.08*(1-tilt)}/>
  <path d="M205 303L637 231M205 391L637 465" stroke={hot} strokeWidth="3" strokeDasharray="8 7" opacity=".7"/>
  <path d="M78 317h88l56-29v119l-56-27H78Z" fill="#8fa2c7" stroke="#e6edf4" strokeWidth="5"/><rect x="97" y="300" width="40" height="18" rx="5" fill="#f28675"/>
  <path d={`M${620-70*tilt} 182L${656+52*tilt} 216V540L${620-70*tilt} 506Z`} fill="#6b72a6" stroke="#ccd3ec" strokeWidth="5"/>
  <ellipse cx={636-8*tilt} cy="349" rx={27+40*tilt} ry={64+36*tilt} fill={hot} opacity={.95-.37*tilt}/>
  {shot===9&&[0,1,2,3].map(i=><path key={i} d={`M${599+i*25} 251v199`} stroke={paper} opacity=".6" strokeDasharray="5 5"/>)}
  <Label x={428} y={652} text={shot===7?'Small, bright spot':shot===8?'Same beam. Wider patch.':'Less energy on each patch'} color={hot} size={34}/>
 </>;
}

export function SeasonsFeature({template,frame,cues}:{template:string;frame:number;cues:Record<string,number>}){
 const shot=Number(template.slice(5));
 const active=ease((frame-cues.action)/26);
 const intro=shot===1||shot===16;
 return <svg viewBox="0 0 856 760" width="100%" role="img" aria-label="Why we get seasons">
  <defs>
   <radialGradient id="year-ocean" cx=".32" cy=".23" r=".85"><stop stopColor="#75d6ff"/><stop offset=".62" stopColor="#2d78d8"/><stop offset="1" stopColor="#193f99"/></radialGradient>
   <radialGradient id="year-sun"><stop stopColor="#fff8ce"/><stop offset=".63" stopColor="#ffd373"/><stop offset="1" stopColor="#f28b48"/></radialGradient>
   <clipPath id="year-globe"><circle r="99"/></clipPath>
   <pattern id="year-stars" width="113" height="107" patternUnits="userSpaceOnUse"><circle cx="17" cy="41" r="2" fill="#a4b9e7" opacity=".4"/><circle cx="77" cy="83" r="1.3" fill="white" opacity=".25"/></pattern>
  </defs>
  <rect width="856" height="760" rx="38" fill={intro?'#192448':'#101a35'}/>
  {!intro&&<rect width="856" height="760" rx="38" fill="url(#year-stars)"/>}
  {intro&&<>
   <Bag x={220} y={354} warm frame={frame} name="MAYA"/><Bag x={636} y={354} warm={false} frame={frame-7} name="LEO"/>
   <g transform={`translate(428 ${112+14*(1-ease(frame/12))})`}><rect x="-103" y="-41" width="206" height="74" rx="25" fill={paper}/><Label x={0} y={9} text={shot===1?'JULY':'SAME EARTH'} color="#1b2646" size={shot===1?38:26}/></g>
   <g opacity={active}><Label x={428} y={660} text={shot===1?'One day. Two seasons.':'Tilt changes sunlight and day length'} color={ice} size={32}/></g>
  </>}
  {[3,6,13,14,15].includes(shot)&&<Orbit shot={shot} frame={frame} active={active}/>}
  {[7,8,9].includes(shot)&&<Flashlight shot={shot} active={active}/>}
  {[2,4,5,10,11,12].includes(shot)&&<>
   {[10,11,12].includes(shot)&&<><Sun x={739} y={338} r={63}/>{[232,282,332,382,432].map((y,i)=><path key={y} d={`M657 ${y}h-131`} stroke={hot} strokeWidth={i<3?5:3} opacity={.35+.5*active} strokeDasharray={i<3?'0':'8 8'}/>)}</>}
   <Globe x={[10,11,12].includes(shot)?320:428} y={345} r={shot===5?180:151} frame={frame} axis={shot===5?active:shot>=10?1:0} light={shot>=10?1:0}/>
   {[2,4].includes(shot)&&<><circle cx="478" cy="261" r="14" fill={hot}/><circle cx="390" cy="410" r="14" fill={ice}/><Label x={596} y={241} text="Maya" color={hot}/><Label x={239} y={460} text="Leo" color={ice}/></>}
   {shot===4&&<g opacity={active}><Label x={428} y={620} text="Distance can’t explain both" size={34}/><path d="M698 585l48 47m0-47-48 47" stroke="#ff8b86" strokeWidth="8" strokeLinecap="round"/></g>}
   {shot===5&&<g opacity={active}><Label x={428} y={650} text="About 23.5°" color={hot} size={40}/></g>}
   {shot===10&&<Label x={428} y={632} text="More direct light up north" color={hot} size={33}/>}
   {shot===11&&<g opacity={ease((frame-cues.action)/12)}>
     <rect x="114" y="554" width="628" height="149" rx="25" fill="#223553" stroke="#5d7ca3" strokeWidth="2"/>
     <Label x={207} y={610} text="Summer" color={hot} size={22}/>
     <Label x={207} y={664} text="Winter" color={ice} size={22}/>
     <rect x="284" y="590" width="397" height="22" rx="11" fill="#111d37"/>
     <rect x="284" y="644" width="397" height="22" rx="11" fill="#111d37"/>
     <rect x="284" y="590" width={282*ease((frame-cues.action)/24)} height="22" rx="11" fill={hot}/>
     <rect x="284" y="644" width={143*ease((frame-cues.action)/24)} height="22" rx="11" fill={ice}/>
     <Label x={478} y={687} text="Daylight at the same place" size={18}/>
   </g>}
   {shot===12&&<g opacity={active}><circle cx="282" cy="406" r="16" fill={ice}/><Label x={428} y={632} text="Less direct light down south" color={ice} size={33}/></g>}
  </>}
 </svg>;
}
