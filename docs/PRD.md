# ClipGleam Product Requirements Document

**Version:** 1.0 · **Status:** Draft for product approval · **Date:** 24 November 2026

## 1. Product summary

ClipGleam helps educators, coaches, social creators and brands turn an idea into a short animated explanation. The creator reviews a combined script and storyboard, generates a narrated and captioned video, and downloads it or publishes it to Instagram. A brand can explain a product or service using the same teaching workflow. Educational and product explainers are V1’s focus. The brand can later expand to formats such as memes and news.

**Product promise:** Turn one idea into a video clear enough to teach from and polished enough to share. The creative outcome is the main product test. The dashboard should make that outcome easy to produce and revise.

**Release:** A private, invite-only pilot for the owner, team and selected testers. Each person has a private dashboard, projects and Instagram connection. The pilot aims for zero paid API and hosting spend where provider terms and quotas allow. Pause provider work when the free allowance is exhausted. Commercial licensing and always-on hosting are release decisions that require validation.

## 2. Audience and success

| Audience | Job | Example |
| --- | --- | --- |
| Educators and coaches | Teach a concept or process without recording or animating it manually | Explain why we get seasons |
| Knowledge creators | Make a repeatable series for short-form social channels | Show what RAM does |
| Brands | Explain how a product or service works in a way a prospective customer understands | Show how a CRM helps a sales team follow leads |

Measure idea-to-storyboard completion, approval-to-ready conversion, time spent editing, generation and render latency, retry rate, preview-to-export or publish conversion, scheduling success and repeat creation. Review the first outputs with the creator for accuracy, motion relevance, clarity, pacing and whether a viewer can explain the concept afterward. Numerical success thresholds follow a pilot baseline. Technical export checks and ownership tests are required even in the pilot.

## 3. Scope and product defaults

| Decision | V1 |
| --- | --- |
| Workflow | **Plan → Storyboard → Generate and preview → Export or publish.** Account setup and Instagram connection sit outside the core four steps. |
| Language | Select one language before planning. English is the first validated launch option. Hindi, Telugu and Tamil are candidates for later single-language support after validating voice, captions and layouts. Multiple language variants of one project are V2. |
| Duration | AI selects a natural target within 60–90 seconds by default. An optional target can be set without fixed presets or a mandatory picker. Respect a chosen target such as 90 seconds. Show final measured duration and flag material deviations. |
| Output | Vertical 9:16, 1080 × 1920, 30 fps, H.264/AAC MP4. Captions included by default. A caption-off control is a proposed default. |
| Visual style | Clean backgrounds, colorful graphics, recognizable objects, purposeful animation and minimal on-screen text. The approved *Why We Get Seasons* cut is the quality reference. |
| Narration | One narrator per video. A clear default voice and a small set of tested voices are proposed. English pronunciation and delivery must be reviewed. |
| Publishing | Download for Instagram, Shorts and TikTok. Direct publishing and scheduling are for eligible Instagram professional accounts. One connection per user is the initial default. |
| Approval | Creator approves the exact combined script and storyboard before full synthesis and render. During the pilot, prepare and obtain approval of the brief and exact Gemini prompt before submission. Preserve a simple review flow in the product design. |

Deferred: public self-service sign-up, billing and customer credit dashboards, branding controls, teams and shared workspaces, multilingual variants, full timeline editing, avatars and voice cloning, cinematic generation, bulk campaigns, social analytics and additional direct publishing integrations. Sparse sound accents support the explainer. A music selection workflow is deferred.

## 4. Screens and end-to-end flows

### Dashboard and setup

An invited user signs in and lands on a private dashboard with **Create video**, recent projects and their status. Projects support reopening, renaming and deletion. Settings show the connected Instagram account, disconnect and reconnection options. Publishing details remain reachable from a ready project. A new user can complete and download a video without connecting Instagram.

### Plan

The creator enters a topic, pastes relevant source text or brainstorms in conversation. The assistant helps narrow broad inputs to one learning objective. The creator can set audience, language, and a target length. A clear topic proceeds directly. Advanced controls remain secondary. Preserve the brief, AI suggestions and any creator edits so the project can resume.

### Storyboard

Show one combined review surface with estimated length and ordered scene previews. Each shot shows the narration, recognizable objects, planned motion, spoken cue and optional sound accents. The user can edit narration and on-screen labels, reorder scenes, adjust supported visual choices or ask for a targeted change in chat. Where feasible, give lightweight motion previews and an optional voice sample. Preview controls remain within the available quota.

The creator approves a specific storyboard revision. A change to its narration, cues, visual meaning or language creates a new reviewable version. Show a useful change summary after conversational revisions. An unclear change request asks for clarification before changing the affected scene.

### Generate and preview

On approval, start a background job. Show stages such as preparing scenes, generating narration, aligning cues, rendering and checking. A creator can close the page and return. A completed render supports play, pause, seek and clear duration and version information. A creator requesting a correction sees a new storyboard revision. Preserve the existing approved export until the new version passes checks.

### Export and publish

Download the reviewed MP4. To publish, show the exact video, connected destination, editable social caption and chosen time. The social caption is separate from the on-video captions. Post now submits that payload once. Scheduling shows the date, time and timezone. The user can cancel or reschedule until dispatch begins. Show processing, confirmed publication with a link where available, or a recoverable failure.

## 5. Functional requirements and acceptance criteria

| ID | Requirement | Acceptance |
| --- | --- | --- |
| FR-01 | Invitation and account isolation | Uninvited accounts cannot enter the pilot. A signed-in user cannot access another owner's project, render, schedule, job or connection through the dashboard, API or storage URL. Signing out and switching accounts does not reveal cached private content. |
| FR-02 | Idea planning | A ready brief can go straight to planning. An input such as “science” triggers a focused refinement. Source text stays associated with the project. Uncertain claims are surfaced for review. |
| FR-03 | Reviewable storyboard | One surface exposes script and visual intent together. Every narrated beat has a supported visual or an explicit gap. Approval identifies exactly what will be rendered. |
| FR-04 | Revisions | “Make scene three simpler” revises the intended scene and describes the change. A failed revision preserves the last valid version. A visual-only change can reuse unchanged narration. |
| FR-05 | Duration and pacing | The storyboard shows an estimate. The final file shows measured duration. A material overrun raises an actionable review issue. Avoid arbitrary time stretching. A 90-second explainer should sustain meaningful visual changes, typically across roughly 10–16 beats. |
| FR-06 | Visual production | The scene shows the object and animates the relationship or change being explained. If the visual library cannot represent the subject, flag it during storyboard review. A text card cannot substitute for an essential demonstration. |
| FR-07 | Speech and timing | Narration matches the approved words. Validate speech alignment and resolve each cue to its intended occurrence. Captions follow the actual audio and remain readable in phone-safe areas. |
| FR-08 | Durable generation | Retry transient provider or render failures within bounds. Recover reusable artifacts. Duplicate Generate requests for one approved version resolve to one active operation. Cancelling stops later stages where possible and explains work already submitted. |
| FR-09 | Preview and export | The MP4 downloads as the exact version reviewed. Validate dimensions, codecs, measured duration, audio, playable frames and caption bounds before Ready. Failed output never replaces a successful export. |
| FR-10 | Instagram authorization | Use Meta’s official authorization flow. Show destination identity. Unsupported accounts, cancelled authorization and expired permissions produce actionable messages. Credentials remain server-side. |
| FR-11 | Post now | Bind submission to one approved render, destination and caption. Only report Published after confirmation. Reconcile ambiguous outcomes before retrying to avoid duplicates. |
| FR-12 | Scheduling | Save the approved render, caption, destination, execution time and originating timezone. Later edits never silently change scheduled content or account. Recheck authorization before posting. A late or failed schedule is visible and recoverable. |
| FR-13 | Autosave and recovery | Indicate Saving, Saved or Save failed accurately. Flush edits before approval. Detect conflicting changes from another tab. Resume the last durable state on reload. |
| FR-14 | Deletion | Deleting a project prevents new work or publication and cancels pending jobs and schedules where possible. Explain what happens to already published Instagram posts and in-flight actions. |

## 6. Editorial and output quality

The [video quality standard](VIDEO-QUALITY.md) governs acceptance. The approved *Why We Get Seasons* cut demonstrates the intended level: a question and visual contrast up front, original motion graphics, close-ups that explain mechanisms, short captions, and an ending that pays off the hook. A viewer should understand the main idea at about age ten. A quiet brand explainer can follow the same standard without forced humor.

- Show a meaningful opening action in the first five to six seconds. Use a shift in framing, object state or visual focus when the narration introduces something new.
- Show the real subject on screen. A RAM video needs a recognizable module with chips and contacts. A science video should make the relationship visible rather than relying on a label or generic icon.
- Use a consistent visual language and verify it does not teach the wrong idea. For example, stronger summer sunlight should be shown through angle and coverage rather than changing the Sun’s apparent physical size in an orbit diagram.
- Review accuracy and claims in the storyboard. Treat AI-generated text as draft material. Check that labels, diagrams and narration agree.
- Make audio intelligible, use unobtrusive accents and keep important information available without sound. Inspect a phone-size preview, sample cues, and verify the output before showing it as ready.

## 7. Edge cases and recovery

| Situation | Required behavior |
| --- | --- |
| Empty brief, conflicting instruction or unsupported language | Explain what is needed and preserve the draft. Offer a feasible refinement. |
| Invalid generated plan, missing visual or ambiguous cue | Surface the affected shot. Retry only recoverable failures. Keep the last valid version available. |
| Narration differs from script, misses timings or exceeds the target | Block the affected render and request correction or review. Use measured audio for timing. |
| High demand, timeout, rate limit or exhausted quota | Log the failure type and surface a useful status. Use bounded retries or a validated fallback when appropriate. Stop when a spending or quota guard is reached. |
| Browser closes, worker restarts, double-click or concurrent edits | Restore durable status. Reuse valid artifacts, avoid duplicate requests and identify stale edits. |
| Failed render while an older version is ready | Keep the older file downloadable and label its version. |
| Instagram connect cancelled, token expired or account changed | Preserve the project and export. Pause incompatible schedules and require explicit approval to switch destinations. |
| Invalid schedule, daylight-saving ambiguity or cancel-versus-dispatch race | Validate future time and explicit timezone. Reconcile any dispatch already underway and report its outcome. |
| Publish times out after submission | Reconcile with Meta before permitting a potentially duplicative retry. |
| Personal account or Meta access unavailable | Explain eligibility and keep MP4 export working. |

## 8. Nonfunctional and operational requirements

- Keep projects private by default. Verify ownership at each access boundary. Keep media private and grant access only to authorized users or the delivery mechanism for a specific approved publication.
- Preserve approved inputs and completed artifacts throughout recoverable errors. Use bounded retries and prevent excessive parallel renders or unintended API spend. The pilot needs internal cost and failure visibility without customer billing.
- Make interfaces keyboard accessible and readable on small screens. Communicate states with text as well as color. Avoid distracting effects and respect caption safe areas.
- Explain third-party processing and establish deletion and retention policies before pilot release. Sanitize logs to exclude credentials and unnecessary private content.

## 9. Milestones and release checks

1. **Engine proof completed.** Local Gemini, ElevenLabs and Remotion production produced real solar, AC and seasons MP4s. The creator approved the 16-shot seasons cut as the quality benchmark. Topic-specific visual implementation and human review contributed to that result.
2. **System design.** Define the data model, API contracts, authorization boundaries, job semantics, visual registry, timeline schema, failure recovery and deployment approach as a separate deliverable.
3. **Private product workspace.** Build invited sign-in, isolated dashboard, idea planning, the combined storyboard, revisions and autosave.
4. **Durable generation and export.** Integrate the proven media pipeline, test previews, recovery, ownership, render quality and output download.
5. **Instagram pilot.** Validate eligibility, permissions, posting and scheduling with independent test accounts. Pilot testers must complete creation and export without operator assistance and see clear recovery behavior for simulated failures.

### Pilot review criteria

- A teacher, creator and brand tester each produce and review an explainer.
- At least one new topic independently reaches the quality benchmark using the production workflow. An operator-authored sample alone does not establish automation quality.
- Two users cannot see or publish each other’s content. Both can resume a failed or interrupted job without losing approved work.
- A scheduled post retains its approved payload after a project edit. Duplicate and ambiguous publish requests are handled safely.
- Before making timing or quality promises, measure actual render latency, API usage and creator satisfaction.

## 10. Agreed stack and decisions for system design

The stack direction is TypeScript, Next.js App Router and Node.js, Better Auth, MongoDB, private Cloudflare R2 storage, Inngest orchestration, Gemini planning, ElevenLabs narration, Remotion rendering and the Meta Instagram API. Node.js and the local rendering pipeline are proven for the prototype. The remaining integrations are planned.

Resolve the render host and capacity, invitation method, provider model and voice configuration, pilot language matrix, artifact retention, retry and scheduling thresholds, and current Meta requirements in system design or integration testing. Keep the editable storyboard, compiled timeline and verified MP4 as distinct artifacts. The PRD defines creator-facing behavior and acceptance. Detailed infrastructure and implementation contracts belong in the system design.

## References

- [NamasteVideo.ai PRD](https://github.com/akshaymarch7/namaste-video-ai/blob/main/PRD.md), reference for the four-step flow, independent accounts, numbered requirements, publishing and recovery cases.
- [ClipGleam video quality standard](VIDEO-QUALITY.md), approved visual and editorial benchmark.
- [Pipeline technical design](../PIPELINE.md), local prototype evidence and reproduction details.
- [ClipGleam progress log](PROGRESS.md), decisions, implementation evidence and current milestone.

## Visual asset sourcing and approval

The storyboard must name the objects each shot requires and identify which parts move independently. Resolve those requests against a curated catalog of original vectors and assets from approved sources. Record provenance and any attribution or use requirements with each imported asset. Normalize assets to the product's visual style and validate imported SVGs before rendering.

A cricket explainer can reuse separate bat, ball, stumps and pitch assets. The ball needs its own layer to follow a delivery path. The bat needs a pivot at the grip if it swings, and the bails should be distinct if they are dislodged. Remotion handles those motions through shared components. A combined bat-and-ball icon is suitable as a topic symbol. It does not provide the independent motion layers needed for a demonstration.

If an essential visual is missing, show that gap during storyboard review. Offer a creator-provided asset or queue the addition of a reviewed, reusable asset. On-demand illustration generation is a candidate for later validation. Show the exact selected asset in the storyboard before approval. Do not substitute an unrelated icon or silently downgrade a shot that depends on a recognizable object.

## Gemini API and runtime validation

Use the Gemini Interactions API for production storyboard generation and conversational revision. Isolate it in the planning provider adapter. Use Zod for runtime validation of model responses, storyboard and revision contracts, and the compiled timeline before rendering. Validate locally even when the provider returns structured JSON. Keep accepted output typed and surface actionable validation errors.

The local prototype currently uses Gemini generateContent and hand-written validation. An earlier one-off Interactions API attempt returned HTTP 503. The production adapter and Zod schemas are implementation work. System design should define provider failure handling, conversation persistence, and contract versioning before integration.

## Storyboard customization before generation

Give creators maximum practical control in the combined storyboard. Support direct edits and conversational edits to narration, shot order, timing intent, selected assets, labels, supported camera and motion choices, phrase cues, captions and voice. Preview the actual chosen assets and preview the motion where supported. Keep common controls on the shot and advanced controls expandable. Before approval, flag mismatched spoken cues, missing layers, timing conflicts and unsupported motions. Regeneration always uses an explicit approved version.
