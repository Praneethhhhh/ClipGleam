# Clipgleam Pipeline Technical Design and Prototype Plan

The first milestone is one local vertical MP4 generated from a real topic through Gemini, ElevenLabs, and Remotion. The CLI pauses after Gemini saves its storyboard so we can inspect and approve it before calling ElevenLabs. We will review the resulting video together before using this pipeline as the foundation for the application.

1. Plan from a topic with Gemini using a structured response. Validate every scene before saving it. Select one language before planning. This prototype targets English with a configurable Indian English ElevenLabs voice.
2. Review the saved JSON. Each scene contains two to four beats, each with a visual label and narration. Process scenes build a sequence, comparisons reveal cards side by side, and concept scenes highlight key terms. The order of scenes and their text are editable.
3. Synthesize each narration beat with ElevenLabs and retain audio plus character alignment. Use the first phrase as the visual cue for the beat, and group aligned words into captions. Reject malformed timing. Allow a short tail after each beat. Cache by voice, model and narration. Visual-only edits reuse audio. Voice changes invalidate audio.
4. Remotion uses one timeline for audio, captions and beat reveals. Render 1080 × 1920 H.264 MP4 locally. The browser player in the application can later reuse these components for previews.
5. Review the first Gemini-to-ElevenLabs video together. Check clarity and factual accuracy, Indian English pronunciation, text overflow, cue accuracy (aim for within 250 ms), duration (target 60–90 seconds), and time spent in each stage. Record what the storyboard, narration and motion systems need to improve. This review is the gate for dashboard and publishing implementation. Local speech output is an encoder diagnostic and does not satisfy this milestone.

The prototype keeps reviewed inputs and outputs on disk. The application will store immutable storyboard and render versions in MongoDB and private assets in R2. Inngest coordinates retriable stages and scheduled publication. A Node.js host executes Remotion. Better Auth establishes identity, and the application checks ownership before serving any project or asset. Pass IDs through job events and resolve credentials on the server. Persist stage artifacts and reconcile remote publishing state before retrying an ambiguous response.

Keep the four-step dashboard and Meta publishing work behind the prototype review. Verify eligible professional accounts, app access and permissions, media retrieval from private storage, and publish status with test accounts before enabling schedules. Each invited user will have an independent connection. When quotas run out, stop new provider work and retain drafts.

## Run locally

Install Node.js and run `npm ci`. Set `GEMINI_API_KEY`, `GEMINI_MODEL`, `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` in the local environment. Then run `node prototype.mjs plan "How solar panels turn sunlight into electricity" output/storyboard.json`. Review the Gemini-generated JSON before running `node prototype.mjs render output/storyboard.json output/first-video.mp4`. Inspect the MP4 against that exact storyboard. The first Remotion render may need to download its browser. Outputs and caches are local and ignored by Git.

Set `CLIPGLEAM_BROWSER` to a local Chromium executable to avoid a browser download. Set `CLIPGLEAM_LOCAL_VOICE` to an installed Windows speech voice to exercise the voice cache. Local captions use estimated timings. The live path uses timing returned by ElevenLabs.

Set GEMINI_FALLBACK_MODEL in .secrets/.env to allow one alternate Gemini storyboard attempt after a temporary provider error, missing model, or invalid response.

Storyboard planning allows two primary attempts with a randomized one-to-two-second delay for temporary failures, then one fallback. Each attempt has a 45-second ceiling and the planning budget is 140 seconds. ElevenLabs runs only after a storyboard succeeds and is reviewed.

## Reviewed motion storyboards

The optional scene visual object declares a trusted template and its cues. Each cue selects an action, a zero-based narration beat, and a spoken phrase. Add a one-based occurrence when the phrase repeats. Clipgleam validates the plan before loading speech and compiles the cues from the recorded alignment. Remotion consumes the resulting frame numbers. The initial scene templates illustrate solar cell layers, photon and electron movement, and a solar circuit.

This follows the separation in [NamasteVideo.ai’s technical design](https://github.com/akshaymarch7/namaste-video-ai/blob/main/PIPELINE_TECHNICAL_DESIGN.md). The current Gemini planner still supplies the base script and storyboard. Visual decisions in the reviewed solar plan are authored for this prototype, as they were in the reference repository’s first reviewed water-cycle video. A larger set of visual templates and automatic template selection require separate validation.

The reviewed solar storyboard is in output/solar-reviewed-storyboard.json. The existing cached audio uses George. To validate cues without rendering or requesting speech:

```powershell
$env:ELEVENLABS_VOICE_ID='JBFqnCBsd6RMkjVDRZzb'
node --env-file=.secrets/.env prototype.mjs render output/solar-reviewed-storyboard.json output/solar-reviewed.mp4 --cache-only --check-cues
```

Remove --check-cues to render the MP4 locally using the same cache. Keep --cache-only to prevent provider calls.

## Age ten narration and the seasons sample

The planner asks for a spoken opening question or observation, everyday vocabulary, short sentences, an example the viewer can picture, and a one-sentence takeaway. Review for factual accuracy before synthesis. For the seasons sample, the reviewed script introduces opposite seasons, shows direct versus spread-out sunlight and daylight duration, and explains why the tilt stays pointed the same way as Earth moves around the Sun.

Use --seasons on the planning command for the three-scene brief. The generated script is in output/seasons-storyboard.json. The reviewed script and timed visual actions are in output/seasons-reviewed-storyboard.json. This sample uses the same default George voice as the previous live test, with slightly slower delivery and adjacent lines supplied to ElevenLabs as context. The render uses the saved audio and timing in cache-only mode. Templates and phrase selection were reviewed manually for this prototype.

## Approved AC storyboard render

The AC test preserves all 12 generated narration lines in output/ac-reviewed-render-plan.json and maps each shot to a trusted Remotion visual. The reviewed diagrams show heat leaving in the outdoor coil before the expansion valve cools the returning mixture. They distinguish room airflow from the sealed refrigerant path. The humorous character and suitcase are original visual elements.

With the same default voice used for the earlier prototype, the render command is:

```powershell
$env:ELEVENLABS_VOICE_ID='JBFqnCBsd6RMkjVDRZzb'
node --env-file=.secrets/.env prototype.mjs render output/ac-reviewed-render-plan.json output/how-ac-works.mp4
```

Add --cache-only to reuse saved narration and timing for a rerender. Render to a different path when preserving an existing version.

## Sixteen-shot seasons review cut

Why We Get Seasons uses output/seasons-production-draft.json for the approved editorial plan and output/seasons-feature-render-plan.json for the executable timeline. The year scene templates stage the opening suitcases, flashlight comparison, daylight illustration, and four positions on one schematic orbit. Each shot maps its spoken cue to ElevenLabs character alignment. Short original sound accents are generated locally. The narrator remains the main audio track.

```powershell
$env:ELEVENLABS_VOICE_ID='JBFqnCBsd6RMkjVDRZzb'
node --env-file=.secrets/.env prototype.mjs render output/seasons-feature-render-plan.json output/why-we-get-seasons.mp4 --cache-only
```

The cut follows actual speech duration. The 90-second storyboard times are editorial estimates. Review the first seconds, the flashlight comparison, and the September-to-March progression before expanding the dashboard.

The revised review export uses this separate output path:

```powershell
node --env-file=.secrets/.env prototype.mjs render output/seasons-feature-render-plan.json output/why-we-get-seasons-review.mp4 --cache-only
```

The daylight graphic compares illustrative summer and winter daylight at the same northern location. Its bars are qualitative. The orbit keeps labels outside the moving globe and uses the same tilt orientation at each stop.

## Gemini Interactions visual comparison

The experimental seasons alternate cut uses the approved script and timestamps from the original review cut. Gemini 3.6 Flash via the Interactions API supplied 16 heading and camera choices, saved at output/seasons-interactions-direction.json. A Zod schema validated those choices, and a comparison check verified that the alternate render plan preserves the narration, phrase anchors and visual templates. This is a visual-direction experiment. The same model and renderer can accept an equivalent plan through another endpoint, and the alternate cut also changes the font.

React, SVG and CSS apply the camera direction to the trusted scene templates. DM Sans is bundled from the local npm package for the comparison composition. FFmpeg encodes the MP4 and FFprobe reports the stream metadata. Reproduce the alternate cut without a voice request:

```powershell
$env:ELEVENLABS_VOICE_ID='JBFqnCBsd6RMkjVDRZzb'
node --env-file=.secrets/.env prototype.mjs render output/seasons-interactions-render-plan.json output/why-we-get-seasons-interactions.mp4 --cache-only
```

The existing local plan command still uses generateContent. This experiment validates the Interactions endpoint on a visual revision without migrating the general planner.
