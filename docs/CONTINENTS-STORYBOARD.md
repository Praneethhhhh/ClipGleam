# Seven Continents Seven Surprises

**Status** Storyboard approved for production  
**Format** 90-second vertical English explainer for a curious ten-year-old

## Idea

Start with a puzzle: how can a place covered in ice be a desert? Use a world map to travel through seven continents, finding one surprising feature on each. Save the answer for Antarctica, then bring all seven outlines together for a quick recap. Use the common seven-continent model. Australia is the continent in this convention and Oceania is a wider region.

Each stop starts with a recognizable map outline, zooms to a relevant illustration, and shows one change the viewer can follow. Keep the heading short, captions synced, and map colors consistent. An asset and its required animation layers are previewed before approval.

| Time | Narration draft | Visual direction |
| --- | --- | --- |
| 0–5s | “Which continent is covered in ice and still counts as a desert? Hold that thought.” | A desert icon flips into an icy landscape. Keep the continent hidden. |
| 5–12s | “Let’s take a quick trip across Earth’s seven continents. We’ll find one surprise at every stop.” | Zoom out to a globe and unfold it into a labeled map. Seven stops appear. |
| 12–22s | “First, Asia, the largest continent. At the Himalayas, the mountains climb so high that Mount Everest rises above every other peak, measured from sea level.” | Highlight Asia. Raise the Himalayas from a map and reveal Everest beside a sea-level reference. |
| 22–32s | “Africa has the Sahara, the world’s largest hot desert. But look farther south and you’ll find the Congo Basin’s rainforests.” | Pan from northern desert dunes south to a layered green canopy. Keep both landmarks pinned on the map. |
| 32–42s | “In North America, the Colorado River helped carve the Grand Canyon over a very long time. A small river on a map can leave a giant mark.” | Trace the river into an illustrated canyon cross-section. Reveal the layered rock in a time-lapse. |
| 42–52s | “In South America, the Amazon River runs through a vast rainforest. Many smaller rivers feed into it, like branches joining the trunk of a tree.” | Animate tributaries joining the main river. Match cut to a tree-branch silhouette briefly. |
| 52–62s | “Europe and Asia are connected by land. Look at the map. Their dividing line follows features like the Ural Mountains.” | Keep Eurasia continuous. Draw a dashed conventional boundary, then raise the Urals in a local cutaway. |
| 62–72s | “Off Australia’s northeast coast, the Great Barrier Reef is the world’s largest coral reef ecosystem. Tiny coral animals help build those huge reefs.” | Zoom off the coast and dive underwater. Move from one polyp to a broad reef silhouette. |
| 72–84s | “And here’s our icy desert: Antarctica. A desert gets very little precipitation. Much of Antarctica gets very little snowfall each year, even though ice has built up over a long time.” | Reveal the southern continent. Compare sparse falling snow with a deep existing ice layer. |
| 84–90s | “Seven continents. Seven surprises. Which stop would you explore first?” | Reassemble the world map. Flash the seven illustrated markers as the recap plays. |

Timed allocations are editorial estimates. Review the recorded pace before rendering. Simplify silhouettes at phone size. Verify continents and feature placement against map data. Use vetted geography vectors and separate landmark layers. Avoid arbitrary borders and inaccurate relative sizes. Note when a map is schematic.

## Exact Gemini prompt for review

Use the supplied storyboard as the factual and visual brief. Draft an original 90-second vertical English explainer titled “Seven Continents, Seven Surprises” for a curious ten-year-old. Preserve the icy-desert question, all seven continents, their sequence, and the Antarctica payoff. Use the seven-continent convention treating Australia as the continent and Oceania as a wider region. Keep one memorable idea per stop. Use short spoken sentences and explain unfamiliar language in context. Keep the transitions energetic and the voice natural. Distinguish the largest hot desert from a polar desert, mountain elevation above sea level from other height measures, and traditional continent boundaries from water barriers. Do not invent numbers, citations, landmarks or geography. Aim for approximately 190–215 spoken words and a 90-second total. Preserve creator-approved changes.

Return a JSON plan containing the title, targetSeconds, and ten ordered beats. Each beat needs a stable id, estimatedSeconds, narration, named map region and landmark assets where relevant, visual action, optional sound accent, and one cuePhrase occurring exactly once in that narration. Identify which layers move independently. Flag unresolved assets for review. Give each beat at least one meaningful visual change, and use a second visual action within a continent stop when it helps explain the point. Keep map labels short. Include only spoken words in narration, with no performance tags.

## Review and sources

Creator reviews and edits this package before Gemini. The generated plan and actual selected assets get a second review before speech. Build previews with the reusable map and diagram primitives. Flag missing landmarks or map data before generation.

- [National Geographic continent guide](https://education.nationalgeographic.org/resource/Continent/)
- [National Geographic map convention](https://www.nationalgeographic.org/national-geographic-map-policy)
- [NASA on Antarctica](https://www.nasa.gov/frequently-asked-questions-about-antarctica/)
- [UNESCO on the Great Barrier Reef](https://whc.unesco.org/en/list/154/)

## Approved storyboard and production

- [Gemini Interactions draft](../output/continents-gemini-storyboard.json) holds the original narration, animation cues and asset requests. Gemini 3.6 Flash returned ten Zod-validated beats and a 90-second editorial budget.
- [Local render input](../output/continents-reviewed-storyboard.json) retains this order with shorter Everest phrasing, a more conversational Congo Basin line and a definition of desert using rain and snow. The opening illustration uses dunes. The final timing follows speech.
- React and SVG render sourced world outlines and original explanatory diagrams. Geography uses the Natural Earth 1:110m land layer in an equirectangular projection. Landmark positions and the Ural boundary segment are illustrative. Topical diagrams are schematic, and the reel uses the seven-continent convention. [Natural Earth land data](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson)
- The prototype uses a globe motif followed by the map and uses layered vector diagrams for landforms. The recap returns to the same map pins and colors.
- ElevenLabs returned HTTP 402 for the configured voice. The production run used George through a session-only override. The local configuration was preserved. Speech alignment drives captions and scene cues, and the audio cache supports visual revisions.

To render the same audio and scenes from the G: project root in PowerShell:

```powershell
$env:ELEVENLABS_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'
node --env-file=.secrets/.env prototype.mjs render output/continents-reviewed-storyboard.json output/seven-continents.mp4 --cache-only
```

## Review export

[Review MP4](../output/seven-continents.mp4) · [Scene contact sheet](../output/continents-qa/contact-sheet.png) · [Verification and cue times](../output/continents-qa/verification.json)

The 81.1-second file contains 1080 × 1920 H.264 video and AAC audio. Ten cue positions matched ElevenLabs alignment. Both streams decoded through the end, and one frame near each cue was reviewed at reduced size. Creator playback is pending.
