import React from 'react';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/dm-sans/latin-800.css';
import './interactions-video.css';
import {SolarMotion} from './solar-motion';
import {SeasonsMotion} from './seasons-motion';
import {ACMotion} from './ac-motion';
import {SeasonsFeature} from './seasons-feature';
import {ContinentsMotion} from './continents-motion';
import {AbsoluteFill, Audio, Composition, Sequence, interpolate, registerRoot, useCurrentFrame} from 'remotion';

type Beat = {label:string; audio:string; frames:number; captions:{text:string;start:number;end:number}[]};
type Scene = {kind:string;heading:string;beats:Beat[];template?:string;camera?:Camera;sounds?:{frame:number;audio:string}[];cues?:Record<string,number>};
type Props = {title:string;scenes:Scene[];frames:number};
const colors = ['#b7f36e','#71dcf4','#ffc782','#d3b6ff'];

type Camera = 'steady' | 'push' | 'pull' | 'focus';
const clampCamera = {extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
function cameraScale(camera:Camera,frame:number,length:number,cue:number) {
  if(camera==='push')return interpolate(frame,[0,Math.max(1,length-1)],[.94,1.03],clampCamera);
  if(camera==='pull')return interpolate(frame,[0,Math.max(1,length-1)],[1.035,.96],clampCamera);
  if(camera==='focus')return interpolate(frame,[cue-5,cue+10,cue+30],[1,1.045,1],clampCamera);
  return 1;
}
function Narration({beat}:{beat:Beat}) {
  const time=useCurrentFrame()/30;
  const caption=beat.captions.find(c=>time>=c.start && time<c.end);
  return <><Audio src={beat.audio}/><div style={{position:'absolute',bottom:250,left:108,right:108,textAlign:'center',fontSize:48,lineHeight:1.22,fontWeight:700,color:'white'}}>
    {caption?.text}
  </div></>;
}
function Visual({scene,index,total}:{scene:Scene;index:number;total:number}) {
  const frame=useCurrentFrame();
  let offset=0;
  const isAC=scene.template?.startsWith('ac-');
  const isYear=scene.template?.startsWith('year-');
  const isAtlas=scene.template?.startsWith('atlas-');
  const Motion = isAtlas ? ContinentsMotion : isYear ? SeasonsFeature : isAC ? ACMotion : scene.template?.startsWith('seasons-') ? SeasonsMotion : SolarMotion;
  const scale = scene.camera ? cameraScale(scene.camera,frame,scene.beats.reduce((n,b)=>n+b.frames,0),scene.cues?.action??0) : 1;
  return <AbsoluteFill className={scene.camera?'interactions-composition':undefined} style={{padding:isAtlas?'132px 72px 0':isYear?'155px 64px 0':'235px 94px 0',fontFamily:(isAtlas||scene.camera)?'DM Sans, sans-serif':'Arial, sans-serif',background:isAtlas?'#10252f':'#151727',color:'#faf9f5'}}>
    <div style={{fontSize:30,textTransform:'uppercase',letterSpacing:6,color:'#b9bbd1'}}>{isAtlas?'SEVEN CONTINENTS':isYear?'WHY WE GET SEASONS':isAC?'HOW AC WORKS':scene.kind} · {index+1}/{total}</div>
    <h1 style={{fontSize:isAtlas?78:isYear?69:88,lineHeight:1.04,margin:isAtlas?'20px 0 38px':isYear?'25px 0 40px':'36px 0 85px',overflowWrap:'anywhere'}}>{scene.heading}</h1>
    {scene.template && scene.cues ? <div className={scene.camera?'interactions-camera':undefined} style={{transform:scene.camera?'scale('+scale+')':undefined}}><Motion template={scene.template} frame={frame} cues={scene.cues}/></div> : <div style={{display:'grid',gridTemplateColumns:scene.kind==='comparison'?'1fr 1fr':'1fr',gap:24}}>
      {scene.beats.map((beat,i)=>{
        const start=offset;
        offset+=beat.frames;
        const progress=interpolate(frame,[start,start+10],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
        const active=frame>=start && frame<offset;
        return <div key={i} style={{background:colors[i],color:'#151727',borderRadius:34,padding:'28px 32px',minHeight:96,
          fontSize:48,fontWeight:800,display:'flex',alignItems:'center',gap:28,overflowWrap:'anywhere',
          opacity:active?progress:progress*0.57,transform:`translateY(${(1-progress)*26}px)`}}>
          <span>{scene.kind==='process'?(i===0?'●':'↓'):scene.kind==='comparison'?(i%2===0?'◀':'▶'):'◆'}</span>{beat.label}
        </div>;
      })}
    </div>}
    {scene.sounds?.map((sound,i)=><Sequence key={i} from={sound.frame} durationInFrames={6}><Audio src={sound.audio} volume={0.35}/></Sequence>)}
    {scene.beats.map((beat,i)=><Sequence key={i} from={scene.beats.slice(0,i).reduce((n,b)=>n+b.frames,0)} durationInFrames={beat.frames}><Narration beat={beat}/></Sequence>)}
  </AbsoluteFill>;
}
function Video({scenes}:Props) {
  let offset=0;
  return <AbsoluteFill>{scenes.map((scene,i)=>{
    const start=offset;
    const length=scene.beats.reduce((n,b)=>n+b.frames,0);
    offset+=length;
    return <Sequence key={i} from={start} durationInFrames={length}><Visual scene={scene} index={i} total={scenes.length}/></Sequence>;
  })}</AbsoluteFill>;
}
registerRoot(()=> <Composition id="Clipgleam" component={Video} fps={30} width={1080} height={1920}
  durationInFrames={1} defaultProps={{title:'',scenes:[],frames:1}} calculateMetadata={({props})=>({durationInFrames:props.frames})}/>);
