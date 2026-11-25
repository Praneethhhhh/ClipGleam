# How an Air Conditioner Works

Status: Revised creative draft for review. Earlier Gemini attempts on the previous draft returned 503. No provider calls made on this revision.

## Idea

Follow the heat from a warm room to the outdoor unit. Open on an original stick figure roasting in a hot room. The character taps the remote and jump-cuts into a scarf and earmuffs. Land that visual gag in the first six seconds, then ask where the heat went. Explain a typical split AC for a curious ten-year-old, with one job per shot and a continuous colored path for refrigerant. The main takeaway is that an AC moves heat outdoors.

Target 90 seconds at a natural pace. Use 12 visual beats, about 6–9 seconds each. The framing, object, or meaningful action changes at each beat. Keep captions readable. Use orange pulses for heat, white arrows for airflow, and a separate outlined path for refrigerant. Introduce technical terms only after showing what the part does.

## Storyboard and draft narration

| Time | Visual and motion | Narration |
| --- | --- | --- |
| 0–7s | A sweaty stick figure clicks the remote. Jump cut to the same character shivering in a scarf. Cut outdoors to the warm exhaust. | “One click. Now you need a scarf. But where did all that heat go?” |
| 7–14s | Pull back through the wall. Track an orange heat marker from the room toward the outdoor unit. | “Let’s see how an AC works. It moves heat out of your room. Follow that little orange dot.” |
| 14–21s | Cut inside the wall unit. Show a real-looking fan and a metal coil. White airflow arrows pass over the coil. | “First, a fan pulls warm room air over a cold metal coil. The air cools and blows back into the room.” |
| 21–29s | Zoom into the coil tube. Highlight two separate paths for room air and the fluid inside the sealed pipe. | “Inside the coil is a special fluid called refrigerant. It stays in its own pipes, separate from the air you breathe.” |
| 29–37s | Orange heat markers cross into the tube. A simple liquid-to-gas animation shows the refrigerant changing state. | “Heat moves from the room air into the refrigerant. As the refrigerant absorbs heat, it turns into a gas.” |
| 37–44s | Follow the gas through the wall. The orange heat marker briefly sprouts a tiny suitcase as it crosses outside. Keep the sealed refrigerant path visible. | “That gas carries the heat along a pipe to the outdoor unit. Now it needs to let the heat go.” |
| 44–52s | Cut close to the compressor. The gas enters, gets squeezed, and leaves as hotter high-pressure gas. | “The compressor squeezes the gas. That raises its pressure and makes it even hotter than the air outside.” |
| 52–60s | Track the hot gas through the outdoor coil. The fan turns and carries orange heat markers away. | “The outdoor fan blows air across the hot coil. Heat flows out into the outdoor air, and the refrigerant turns back into a liquid.” |
| 60–68s | Follow the liquid through the small expansion valve. Show a pressure drop and a temperature indicator falling. | “Next, the refrigerant passes through a tiny valve. Its pressure drops, and it cools down so it can pick up heat again.” |
| 68–75s | Follow the cooled refrigerant back indoors. Complete the loop with a moving marker. | “The cold refrigerant returns to the inside coil, and the same loop starts all over again.” |
| 75–83s | Split-screen recap. Indoor fan returns cooler room air as the outdoor fan carries heat away. | “Look at both sides together. The inside unit picks up heat. The outside unit gives that heat to the outdoors.” |
| 83–90s | Trace the loop. Back in the room, the stick figure nudges the thermostat up, takes off the scarf and waves to the outdoor unit. | “Next time you grab the remote, remember where the heat goes. Now you know what that little button starts.” |

Timing is provisional until narration is generated. The video should not treat each shot as a static title card.

Technical reference: [U.S. Department of Energy Home Cooling 101](https://www.energy.gov/sites/prod/files/2016/11/f34/HomeCooling101.pdf).

## Gemini prompt for approval

> Draft a 90-second English vertical video called “How Does an Air Conditioner Work?” for a curious ten-year-old. Explain a typical split air conditioner as a story about moving heat from a room to the outdoors.
>
> Use the 12-beat storyboard above as the visual and factual plan. Keep its order and give each beat a visible action or change of framing. Hook the viewer in the first six seconds. Open with an original stick figure clicking the AC remote and suddenly shivering in a scarf. Ask where the heat went. Include a short visual gag when heat travels outside and a closing callback to the opening. Keep jokes visual and make each one teach or reinforce a point. The scarf is comic exaggeration and the suitcase is a metaphor; the diagram shows what actually carries the heat. Aim for roughly 190–210 spoken words and a natural delivery. Use short sentences and everyday language. Introduce names such as refrigerant, compressor and expansion valve when the viewer can see the part and understand its job. Close by answering the opening question in one sentence.
>
> Follow the actual cooling loop. The indoor coil absorbs room heat and refrigerant evaporates. The compressor raises vapor pressure and temperature. The outdoor coil releases heat and the refrigerant condenses. The expansion valve lowers pressure and temperature before the refrigerant returns indoors. Keep room air, outdoor air, and refrigerant paths distinct. Do not imply that the outdoor air is piped into the room or that refrigerant mixes with room air.
>
> Return a JSON object with title, targetSeconds, and exactly 12 ordered shots. For each shot return id, approximateSeconds, narration, objectsToShow, framing, animation, cuePhrase, and continuityFromPreviousShot. The cue phrase must occur verbatim once in the narration for that shot. Show recognizable equipment, fans, coils, sealed pipes and a clear valve. Avoid filler title cards. Keep labels short. Write only spoken words in narration, with natural punctuation and no acting tags. Flag any visual that needs a new renderer component.
>
> Preserve creator-approved factual edits. If a visual cannot be described clearly, flag it for review instead of substituting a text card.

## ElevenLabs request plan

Send only the approved spoken text to the speech-with-timestamps endpoint. The shot directions stay in the storyboard. Use a clear, friendly English narrator, with nearby approved lines as context if supported. Test the opening for natural delivery before committing to the full narration. Use the returned timestamps for captions and each visual cue. Measure the final running time.

## Approval gates

1. Creator edits and approves this ideation, storyboard and Gemini prompt.
2. Submit the approved prompt to Gemini. Review the returned wording and visuals with the creator.
3. After the generated storyboard is approved, synthesize the narration, validate the cue timings, and render.
4. Review the finished video for accuracy, recognition of each object, pacing, readability, and engagement.
