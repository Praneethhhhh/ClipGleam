import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

const kinds = ['process', 'comparison', 'concept'];
const beatSchema = {type:'object', required:['label','narration'], properties:{
  label:{type:'string'}, narration:{type:'string'},
}};
const schema = {type:'object', required:['title','scenes'], properties:{
  title:{type:'string'}, scenes:{type:'array', items:{type:'object', required:['kind','heading','beats'], properties:{
    kind:{type:'string',enum:kinds}, heading:{type:'string'}, beats:{type:'array',items:beatSchema},
  }}},
}};
const validText = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
function validate(plan) {
  if (!validText(plan?.title,80) || !Array.isArray(plan.scenes) || plan.scenes.length < 2 || plan.scenes.length > 16)
    throw Error('Expected a title and 2–16 scenes.');
  for (const scene of plan.scenes) {
    if (!kinds.includes(scene?.kind) || !validText(scene.heading,56) || !Array.isArray(scene.beats)
      || scene.beats.length < (/^(ac|year|atlas)-/.test(scene.visual?.template ?? '') ? 1 : 2) || scene.beats.length > 4 || scene.beats.some(b =>
        !validText(b?.label,32) || !validText(b.narration,360)))
      throw Error('Each scene needs a supported layout, a heading and the required labelled narration beats.');
  }
  return plan;
}
function required(name) {
  if (!process.env[name]) throw Error(`Set ${name} before using the live pipeline.`);
  return process.env[name];
}
async function post(url, headers, body, timeoutMs = 90_000) {
  const response = await fetch(url, {method:'POST',headers:{...headers,'content-type':'application/json'},
    body:JSON.stringify(body),signal:AbortSignal.timeout(timeoutMs)});
  if (!response.ok) {
    const error = Error(`${new URL(url).hostname} returned HTTP ${response.status}`);
    error.status = response.status;
    if (response.status === 429) {
      const details = await response.json().catch(() => null);
      error.quotaExhausted = /per.?day|daily|billing|limit:\s*0\b/i.test(details?.error?.message ?? '');
    }
    throw error;
  }
  return response.json();
}
const transientStatuses = [429, 500, 502, 503, 504];
const temporary = error => transientStatuses.includes(error.status) ||
  ['TimeoutError', 'AbortError'].includes(error.name) || error.cause?.code !== undefined;

async function plan(topic) {
  const primary = required('GEMINI_MODEL').trim().replace(/^models\//, '');
  const fallback = process.env.GEMINI_FALLBACK_MODEL?.trim().replace(/^models\//, '');
  const deadline = performance.now() + 140_000;
  async function attempt(model, number) {
    const started = performance.now();
    try {
      const storyboard = await requestStoryboard(topic, model, Math.max(1, Math.min(45_000, Math.floor(deadline - started))));
      console.error(`Gemini attempt ${number}: ${model}, valid storyboard, ${Math.round(performance.now()-started)} ms`);
      return storyboard;
    } catch (error) {
      console.error(`Gemini attempt ${number}: ${model}, ${error.status ? 'HTTP '+error.status : error.name}, ${Math.round(performance.now()-started)} ms`);
      throw error;
    }
  }
  let failure;
  let attempts = 1;
  try {
    return await attempt(primary, attempts);
  } catch (error) {
    failure = error;
  }
  if (temporary(failure) && !failure.quotaExhausted) {
    await new Promise(resolveDelay => setTimeout(resolveDelay, 1000 + Math.random()*1000));
    try {
      return await attempt(primary, ++attempts);
    } catch (error) {
      failure = error;
    }
  }
  if (fallback && fallback !== primary && !failure.quotaExhausted &&
      (temporary(failure) || failure.status === 404 || failure.providerResponseInvalid || failure instanceof SyntaxError)) {
    return attempt(fallback, ++attempts);
  }
  throw failure;
}
async function requestStoryboard(topic, modelId, timeoutMs) {
  const model = encodeURIComponent(modelId);
  const seasons = process.argv.includes('--seasons');
  const instructions = [
    'Write an engaging 60–90 second English explainer that a curious ten-year-old can follow.',
    'Open with a friendly narrator introducing the topic through a surprising question or a familiar observation. Begin the explanation immediately without a channel intro.',
    'Use conversational short sentences, concrete examples, and one idea per sentence. Explain unfamiliar words when first used. Read the narration aloud mentally and remove textbook phrasing.',
    'Aim for 135–155 spoken words. Build curiosity, show cause and effect, then end with a one-sentence takeaway.',
    'Write only words a narrator should say in narration. Use punctuation for natural pauses. Do not include stage directions or emojis.',
    'Use headings up to 56 characters, labels up to 32, and narration up to 360 per beat.',
    seasons
      ? 'Use exactly three scenes of two beats each. 1: introduce why seasons change, then show the slightly tilted Earth. 2: show the northern half leaning toward the Sun, causing more direct light and longer days, then show the opposite season in the southern half. 3: six months later Earth has moved halfway around the Sun with the same tilt direction, so seasons swap. End by clearly saying tilt, not distance, causes the seasons. Do not suggest Earth reverses its tilt.'
      : 'Use three to five scenes and two to four beats per scene. Each beat introduces a recognizable object or action that the visual can show.',
  ].join(' ');
  const result = await post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {'x-goog-api-key':required('GEMINI_API_KEY')}, {
      contents:[{parts:[{text:`${instructions} Topic: ${topic}`}]}],
      generationConfig:{responseMimeType:'application/json',responseSchema:schema,maxOutputTokens:4096},
    }, timeoutMs);
  try {
    return validate(JSON.parse(result.candidates?.[0]?.content?.parts?.map(p=>p.text ?? '').join('') ?? 'null'));
  } catch (error) {
    error.providerResponseInvalid = true;
    throw error;
  }
}
function localSpeech(narration, path) {
  const script = [
    'Add-Type -AssemblyName System.Speech',
    '$s = New-Object System.Speech.Synthesis.SpeechSynthesizer',
    'if ($env:CLIPGLEAM_LOCAL_VOICE) { $s.SelectVoice($env:CLIPGLEAM_LOCAL_VOICE) }',
    '$s.SetOutputToWaveFile($env:CLIPGLEAM_WAV)',
    '$s.Speak($env:CLIPGLEAM_TEXT)',
    '$s.Dispose()',
  ].join('; ');
  execFileSync('powershell.exe',['-NoProfile','-Command',script],{
    env:{...process.env,CLIPGLEAM_TEXT:narration,CLIPGLEAM_WAV:path},stdio:'inherit',
  });
}
function wavDuration(buffer) {
  let rate = 0;
  for (let offset=12; offset+8<=buffer.length;) {
    const type=buffer.toString('ascii',offset,offset+4), size=buffer.readUInt32LE(offset+4);
    if (type==='fmt ' && size>=16) rate=buffer.readUInt32LE(offset+16);
    if (type==='data' && rate) return size/rate;
    offset+=8+size+(size%2);
  }
  throw Error('Windows speech produced invalid WAV data.');
}
function captions(characters, starts, ends) {
  if (!Array.isArray(characters) || !characters.length || starts?.length!==characters.length ||
      ends?.length!==characters.length || starts.some((t,i)=>!Number.isFinite(t) || t<0 ||
        (i>0 && t<starts[i-1]) || !Number.isFinite(ends[i]) || ends[i]<t))
    throw Error('Speech returned missing or invalid timing.');
  const words = [];
  for (let i=0;i<characters.length;i++) {
    if (/^\s+$/.test(characters[i])) continue;
    const first=i;
    while (i+1<characters.length && !/^\s+$/.test(characters[i+1])) i++;
    words.push({text:characters.slice(first,i+1).join(''),start:starts[first],end:ends[i]});
  }
  const groups=[];
  for(let i=0;i<words.length;i+=5) {
    const chunk=words.slice(i,i+5);
    groups.push({text:chunk.map(w=>w.text).join(' '),start:chunk[0].start,end:chunk.at(-1).end});
  }
  return groups;
}
async function speech(narration, local, delivery) {
  const voice=local ? process.env.CLIPGLEAM_LOCAL_VOICE ?? 'windows-default' : required('ELEVENLABS_VOICE_ID');
  const model=local ? 'windows' : process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2';
  const key=createHash('sha256').update(JSON.stringify(delivery ? [voice,model,narration,delivery] : [voice,model,narration])).digest('hex');
  await mkdir('output/cache',{recursive:true});
  const path=resolve('output/cache',key+(local?'.wav':'.json'));
  const cached=await stat(path).then(s=>s.size>0,()=>false);
  if (local) {
    if (!cached) localSpeech(narration,path);
    const bytes=await readFile(path), duration=wavDuration(bytes);
    const words=narration.split(/\s+/), groups=[];
    for (let i=0;i<words.length;i+=5) groups.push({text:words.slice(i,i+5).join(' '),
      start:duration*i/words.length,end:duration*Math.min(words.length,i+5)/words.length});
    return {audio:'data:audio/wav;base64,'+bytes.toString('base64'),duration,captions:groups};
  }
  if (!cached && process.argv.includes('--cache-only')) throw Error('Saved ElevenLabs audio is missing for the selected voice and narration.');
  const result=cached?JSON.parse(await readFile(path,'utf8')):await post(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}/with-timestamps`,
    {'xi-api-key':required('ELEVENLABS_API_KEY')},{text:narration,model_id:model,...delivery});
  const alignment=result.normalized_alignment ?? result.alignment;
  const groups=captions(alignment?.characters,alignment?.character_start_times_seconds,alignment?.character_end_times_seconds);
  if (!result.audio_base64 || !groups.length) throw Error('Speech returned empty audio or captions.');
  if (!cached) await writeFile(path,JSON.stringify(result));
  return {audio:'data:audio/mpeg;base64,'+result.audio_base64,duration:groups.at(-1).end,captions:groups,alignment};
}
const visualActions = {
  ...Object.fromEntries(Array.from({length:10}, (_,i) => ['atlas-'+(i+1), ['action']])),
  ...Object.fromEntries(Array.from({length:16}, (_,i) => ['year-'+(i+1), ['action']])),
  ...Object.fromEntries(Array.from({length:12}, (_,i) => ['ac-'+(i+1), ['action']])),
  'solar-cell': ['field'],
  'solar-light': ['photons','strike','release','field','flow'],
  'solar-circuit': ['dc','inverter','home'],
  'seasons-tilt': ['tilt'],
  'seasons-light': ['direct','opposite'],
  'seasons-orbit': ['orbit','takeaway'],
};

function phraseIndex(text, phrase, occurrence) {
  const matches = [...text.toLowerCase().matchAll(new RegExp(
    `(?<![\\p{L}\\p{N}])${RegExp.escape(phrase.toLowerCase())}(?![\\p{L}\\p{N}])`, 'gu'))];
  if (occurrence === undefined) return matches.length === 1 ? matches[0].index : -1;
  return matches[occurrence-1]?.index ?? -1;
}

function validateVisual(scene) {
  if (!scene.visual) return;
  const {template, cues} = scene.visual;
  const actions = Object.hasOwn(visualActions, template) ? visualActions[template] : undefined;
  if (!actions || !Array.isArray(cues) || cues.length !== actions.length ||
      new Set(cues.map(c => c?.action)).size !== actions.length) {
    throw Error('Unsupported visual template or incorrect cues.');
  }
  for (const cue of cues) {
    const {beat, action, phrase, occurrence} = cue;
    if (!Number.isInteger(beat) || !scene.beats[beat] || !actions.includes(action) || !validText(phrase,100) ||
        (occurrence !== undefined && (!Number.isInteger(occurrence) || occurrence < 1)) ||
        phraseIndex(scene.beats[beat].narration, phrase, occurrence) < 0) {
      throw Error(`Invalid or ambiguous phrase cue for ${template}: ${action}`);
    }
  }
}

function compileCues(visual, beats) {
  return Object.fromEntries(visual.cues.map(({beat, action, phrase, occurrence}) => {
    const {alignment} = beats[beat];
    if (!alignment) throw Error('Motion templates require recorded speech alignment.');
    const text = alignment.characters.join('');
    const character = phraseIndex(text, phrase, occurrence);
    if (character < 0) throw Error(`Cue phrase missing or ambiguous in recorded speech: ${phrase}`);
    const characterIndex = Array.from(text.slice(0,character)).length;
    const time = alignment.character_start_times_seconds[characterIndex];
    if (!Number.isFinite(time)) throw Error(`Invalid recorded timing for ${action}`);
    const prefixFrames = beats.slice(0,beat).reduce((sum,b) => sum+b.frames,0);
    return [action,prefixFrames+Math.round(time*30)];
  }));
}

function yearAccent(frequency, duration = .16) {
  const rate = 22050;
  const length = Math.round(rate * duration);
  const wave = Buffer.alloc(44 + length * 2);
  wave.write('RIFF', 0);
  wave.writeUInt32LE(wave.length - 8, 4);
  wave.write('WAVEfmt ', 8);
  wave.writeUInt32LE(16, 16);
  wave.writeUInt16LE(1, 20);
  wave.writeUInt16LE(1, 22);
  wave.writeUInt32LE(rate, 24);
  wave.writeUInt32LE(rate * 2, 28);
  wave.writeUInt16LE(2, 32);
  wave.writeUInt16LE(16, 34);
  wave.write('data', 36);
  wave.writeUInt32LE(length * 2, 40);
  for (let i = 0; i < length; i++) {
    const t = i / rate;
    const envelope = Math.min(1, t / .006) * (1 - i / length) ** 3;
    const sample = Math.sin(2 * Math.PI * frequency * t) + .35 * Math.sin(2 * Math.PI * frequency * 1.51 * t);
    wave.writeInt16LE(Math.round(6300 * sample * envelope), 44 + i * 2);
  }
  return 'data:audio/wav;base64,' + wave.toString('base64');
}

function yearSounds(template, cues) {
  if (template?.startsWith('atlas-') && cues && ['atlas-1','atlas-3','atlas-6','atlas-9','atlas-10'].includes(template)) {
    return [{frame: cues.action, audio: yearAccent(template === 'atlas-9' ? 570 : 440)}];
  }
  if (!template?.startsWith('year-') || !cues) return undefined;
  const accents = {
    'year-1': [[5,240],[14,330]],
    'year-2': [[cues.action,460]],
    'year-4': [[cues.action,240]],
    'year-5': [[cues.action,510]],
    'year-7': [[cues.action,760]],
    'year-13': [[cues.action+24,570]],
    'year-14': [[cues.action+24,480]],
    'year-15': [[cues.action+24,620]],
    'year-16': [[5,240],[14,330]],
  };
  return accents[template]?.map(([frame, frequency]) => ({frame, audio: yearAccent(frequency)}));
}

async function render(storyboard, destination, local) {
  const started=Date.now(), scenes=[];
  const reviewed = validate(storyboard);
  reviewed.scenes.forEach(validateVisual);
  const narrationBeats = reviewed.scenes.flatMap(scene => scene.beats);
  let narrationIndex = 0;
  for (const scene of reviewed.scenes) {
    const beats=[];
    for (const beat of scene.beats) {
      const delivery = /^(seasons|ac|year|atlas)-/.test(scene.visual?.template ?? '') ? {
        previous_text: narrationBeats[narrationIndex-1]?.narration,
        next_text: narrationBeats[narrationIndex+1]?.narration,
        voice_settings: {stability:0.48, similarity_boost:0.75, speed:0.95},
      } : undefined;
      const audio=await speech(beat.narration,local,delivery);
      narrationIndex++;
      beats.push({...beat,...audio,frames:Math.ceil((audio.duration+0.45)*30)});
    }
    const cues = scene.visual ? compileCues(scene.visual, beats) : undefined;
    if (cues) console.log(scene.visual.template, 'cues (scene frames):', JSON.stringify(cues));
    scenes.push({...scene,template:scene.visual?.template,cues,sounds:yearSounds(scene.visual?.template,cues),beats:beats.map(({alignment, ...beat}) => beat)});
  }
  const frames=scenes.flatMap(s=>s.beats).reduce((sum,b)=>sum+b.frames,0);
  if (process.argv.includes('--check-cues')) return;
  const inputProps={title:storyboard.title,scenes,frames};
  const {bundle}=await import('@remotion/bundler');
  const {selectComposition,renderMedia}=await import('@remotion/renderer');
  const serveUrl=await bundle({entryPoint:resolve('video.tsx'),outDir:resolve('output/bundle')});
  const browserExecutable=process.env.CLIPGLEAM_BROWSER || undefined;
  const composition=await selectComposition({serveUrl,id:'Clipgleam',inputProps,browserExecutable});
  await mkdir(dirname(destination),{recursive:true});
  console.log(`Rendering ${destination} (${(frames/30).toFixed(1)} seconds)`);
  await renderMedia({serveUrl,composition,inputProps,browserExecutable,codec:'h264',
    disallowParallelEncoding:true,outputLocation:resolve(destination),concurrency:2});
  console.log(JSON.stringify({file:destination,durationSeconds:frames/30,elapsedSeconds:(Date.now()-started)/1000,
    timing:local?'estimated captions for local fixture':'ElevenLabs character alignment'}));
}
const [command,input,output]=process.argv.slice(2);
try {
  if (command==='plan' && input && output) {
    const storyboard=await plan(input);
    await mkdir(dirname(output),{recursive:true});
    await writeFile(output,JSON.stringify(storyboard,null,2));
  } else if (command==='render' && input && output) {
    await render(JSON.parse(await readFile(input,'utf8')),output,process.argv.includes('--local'));
  } else if (command==='demo') {
    const samples=JSON.parse(await readFile(new URL('./samples.json',import.meta.url),'utf8'));
    if (input && !Object.hasOwn(samples,input)) throw Error('Choose process, comparison, or concept.');
    for (const [name,storyboard] of Object.entries(samples)) {
      if (!input || input===name) await render(storyboard,`output/${name}.mp4`,true);
    }
  } else throw Error('Use plan <topic> <json>, render <json> <mp4> [--local], or demo.');
} catch (error) {
  console.error(error.message);
  process.exitCode=1;
}
