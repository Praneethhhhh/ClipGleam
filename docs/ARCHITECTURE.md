# ClipGleam Architecture

## Stack and responsibilities

| Layer | Technology | Purpose |
| --- | --- | --- |
| Web app | TypeScript, Next.js App Router, Node.js | Dashboard, storyboard editor, preview and authenticated endpoints |
| Identity | Better Auth | Invite-only sign-in and sessions |
| Data | MongoDB | Projects, versions, ownership, job status, connections and schedules |
| Storage | Cloudflare R2 | Private audio, alignment files, thumbnails and MP4s |
| Planning | Gemini API | Structured storyboard and conversational revisions |
| Narration | ElevenLabs API | English narration and character timestamps |
| Video | Remotion on Node.js | Browser preview and server rendering |
| Orchestration | Inngest | Durable steps, retries, concurrency and scheduled dispatch |
| Social | Meta Instagram API | Authorize and publish to eligible accounts |

The local prototype uses Node.js and disk storage. Next.js, hosted services and publishing are planned application components. Inngest replaces the proposed custom MongoDB job queue. MongoDB still holds the user-facing job and schedule records.

## Generation flow

Idea and language → Gemini structured scene plan → validate and save draft → creator approval → Inngest generation request → ElevenLabs audio and timing → Remotion timeline and MP4 → private R2 upload → save verified result → preview and export.

A storyboard version fixes the language, ordered scenes, narration beats, visual templates and cue references. A render references one approved version and records audio parameters and artifact locations. Validate model outputs against supported layouts. Use timestamps to derive caption windows and key visuals. Keep deterministic rendering code in the application.

Workflow events carry IDs. Workers load inputs and validate ownership from MongoDB. Cache narration by provider, model, voice and text within the appropriate ownership boundary. Retry transient failures with bounds. Save completed artifacts before proceeding so recovery can reuse them. A renderer needs adequate CPU, memory and runtime. Start locally and select the host after measuring the live render.

## Isolation and publication

Every project, render, schedule and Instagram connection is owner-scoped. Derive the owner from the authenticated session. Check access at the server and before issuing short-lived R2 links. Keep provider secrets and encrypted Instagram tokens on the server. Bind Meta OAuth state to the initiating session and verify the specific destination before dispatch.

Schedules bind the exact render, caption, account and execution time. Store UTC and the chosen timezone. Inngest wakes the workflow, which rechecks the saved record. Deduplicate dispatch and reconcile ambiguous Meta results before retrying. Resolve media delivery and app access requirements against current Meta documentation during integration. A local sleeping machine cannot deliver unattended schedules.

## Records and rollout

- User and invite. Identity, eligibility and session metadata.
- Project and storyboard versions. Brief, language, scenes, revision state and approval.
- Audio and render artifacts. Timing, storage keys, validation result and provenance.
- Job and publication. Stage, attempts, immutable input, destination, time and remote status.
- Operational events. Stage duration, errors and quota consumption. Keep customer billing out of V1.

Rollout order is live prototype review, dashboard and durable generation, preview and export, then Instagram and invited pilot. Before public hosting, settle retention, recovery, provider licensing, compute costs and the practical supported-language list.

For current implementation decisions, read [ClipGleam V1 System Design](SYSTEM-DESIGN.md). This file is the earlier architecture overview.
