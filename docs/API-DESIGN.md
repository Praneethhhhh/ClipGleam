# ClipGleam V1 API Design

**Version** 1.0 · **Status** Proposed implementation contract · **Date** 24 November 2026

Read with the [PRD](PRD.md), [system design](SYSTEM-DESIGN.md), [database design](DATABASE-DESIGN.md), [video quality standard](VIDEO-QUALITY.md) and [prototype pipeline](../PIPELINE.md). This contract covers the invited creator pilot. The prototype has verified local media generation with topic-specific components. The application routes, general-purpose visual resolution and Instagram integration require implementation and validation.

## 1. Transport, identity and consistency

| Concern | Contract |
| --- | --- |
| Routing | Same-origin HTTPS JSON under `/api/v1` for application routes. OAuth, Inngest and delivery routes have explicit exceptions. Additive response fields are allowed. Version breaking changes and pin persisted schemas separately. |
| Authentication | Better Auth secure HttpOnly session cookie. Every application request checks current pilot admission and derives the owner from the session. Browser mutations require exact trusted Origin and session protection. Auth endpoints apply their own abuse controls. |
| Ownership | Query with owner and expected parent on every path and nested reference. An authenticated request for missing, foreign or deleted content gets 404. Use explicit public catalog access for curated assets. Never accept owner, provider keys, raw model selections, storage paths or provider account IDs as authority. |
| Responses | Success is `{data,meta:{requestId}}`. Lists add `page:{nextCursor}` with null at the end. Errors use the structure below. Return `X-Request-Id` and `Cache-Control: private, no-store`. JSON bodies use UTF-8. OAuth redirects, binary media and 204 have specialized responses. |
| Representation | Opaque IDs, SHA-256 lowercase hex hashes and UTC RFC 3339 timestamps. Revision integers begin at 1. Omitted patch field means unchanged. Null clears only fields documented as nullable. Strict Zod mutation and model-response schemas reject extra fields. Strings are plain text. |
| Limits | Proposed defaults are 512 KiB JSON per request, 20 list items by default and 50 max, title ≤100, topic ≤1,000, audience ≤240, source text ≤20,000, instruction ≤2,000 Unicode code points. Draft and asset limits below apply as well. Rate-limit by owner and operation. Limit sign-in by address and account identifier without logging raw credentials. |
| Ordering | Opaque signed cursors bind owner, route, parent, filters, sort tuple and expiry. Default cursor lifetime 24 hours. Projects sort by updatedAt then ID descending, histories by createdAt then ID descending, messages by project sequence ascending. Fetch limit + 1. Lists are live, so UI deduplicates moved entries. |
| Capabilities | Pilot capability flags reflect actual features and verified provider settings. English first, one language and voice per video, automatic 60–90 second target or optional integer target in that band, captions on by default, vertical MP4. MP4 remains downloadable without Instagram. |

### Write preconditions

`CAS` below means an explicit `expectedRevision` in a JSON command or patch. Project metadata, brief, storyboard draft and publication intent have independent counters. Compare the relevant revision in the write itself. A conflict returns the actual revision and a reload URL. Flush autosave before approval. On lost autosave response, reload and compare before merging or retrying. Deletion requires `If-Match: "project-<revision>"` on the project metadata revision, with cascade semantics over the current content.

`K` means a required random `Idempotency-Key` (16–128 printable ASCII characters). Scope to owner, method and matched concrete route, including path IDs. Fingerprint the normalized validated body and preconditions. Authorize before reading a receipt. Identical accepted commands replay the original response and IDs with `Idempotency-Replayed: true`. A changed payload or precondition yields `409 IDEMPOTENCY_KEY_REUSED`. Failed input validation consumes no key. After an uncertain transport result, retry the same request and key. A committed replay can show old response state, so follow its resource URL for live status. Different keys are still subject to business-level deduplication.

Async resource creation returns 202 after committing the job and outbox. Example data is `{jobId:"job_…",state:"queued",statusUrl:"/api/v1/jobs/job_…",resource:{type:"render",id:"rnd_…"}}`. Known future resources include candidate, render, upload and deletion IDs. Use `Location` for the status route. A scheduled publication returns 201 after committing the schedule and its outbox. A 201 schedule and a 202 publish both require a later status check. Jobs continue after browser close or sign-out.

## 2. Session, capabilities and projects

Routes in sections 2–8 are relative to `/api/v1`. Every private response excludes internal R2 keys, provider credentials, raw provider responses, prompts belonging to other users, and auth adapter internals.

| Route | Input and result |
| --- | --- |
| POST /session/sign-in | Email and password via Better Auth. 200 session with cookie, generic 401 on failure and 429 on throttling. Pilot provisioned accounts only. |
| GET /session | 200 `{user:{id,name,email},expiresAt,capabilities}`. Return 401 if missing/expired or 403 for disabled admission. |
| POST /session/sign-out | Empty JSON, 204 and expire cookie. Clear browser state, media references and polling. |
| GET /capabilities | Languages, compatible active voice preset IDs with labels, generation/preview/publishing switches, input limits and export profile. Capability checks repeat on write. |
| GET /projects | Cursor list with optional `filter=all\|draft\|ready\|scheduled\|published\|attention`. Filters can overlap. |
| POST /projects (K) | `{title,language}` creates project, empty brief and draft. 201 project summary. |
| GET /projects/{p} | Project summary with title, language, metadata/brief/draft revisions, active job, latest ready render, last approval, publication flags and timestamps. Deleted parents return 404. |
| PATCH /projects/{p} (CAS) | `{expectedRevision,title}`; 200 summary. Project language is selected on create and fixed for V1. |
| DELETE /projects/{p} (K, If-Match) | 202 deletion operation. Hide content immediately, fence active work, block unclaimed posts, revoke access and reconcile external effects. Existing Instagram posts stay live. |
| GET /deletions/{id} | Owner-only status for a hidden project's cleanup, `queued\|running\|waiting_external\|complete\|needs_attention`. Redacted outcomes and timestamps only. |

Invites are managed by an operator through deployment-authorized provisioning. Validate pilot admission before enabling the Better Auth account and on every private request. Disable public registration and alternate auth routes that bypass admission. Use a generic sign-in error for disabled or unknown accounts. An operator stop revokes sessions and blocks new external actions. Account recovery for this slice is operator-assisted.

The implemented pilot web app uses POST /api/auth/sign-in/email and POST /api/auth/sign-out through Better Auth. Successful sign-in returns 204 with the session cookie. The browser uses a server-guarded dashboard to check the session and current admission. The /api/v1 session and capabilities endpoints above remain part of the planned application API.


The private-project slice implements project list, create, read, rename and delete. Creation replays its original response while the project is active and returns the Idempotency-Replayed header. Rename takes the expected revision in the JSON field revision. Delete requires a quoted numeric If-Match revision and returns 204 after synchronously removing the initial brief and draft. Media cleanup, publication reconciliation, asynchronous deletion tracking and library filters beyond active projects enter with their corresponding feature slices.

## 3. Brief, conversation and Gemini workflows

| Route | Input and result |
| --- | --- |
| GET /projects/{p}/brief | `{revision,topic,audience,sourceText,targetSeconds,learningObjective,updatedAt}`. Target is nullable and null delegates selection. |
| PATCH /projects/{p}/brief (CAS) | Patch allowed brief fields, 200 saved version. An incomplete draft can save. Check plan readiness separately. |
| GET /projects/{p}/messages | Ordered cursor list of project-scoped messages with sequence, role, text, optional job/candidate references and time. |
| POST /projects/{p}/brainstorms (K) | `{instruction,briefRevision}`. Stores the request as a message and queues Gemini clarification or idea suggestions. 202. Results are suggestions, applied through normal brief edit. |
| POST /projects/{p}/plan-requests (K) | `{briefRevision,draftRevision}`. 201 request containing server-constructed exact prompt, prompt hash and source revisions. Empty or broad brief returns actionable issues. Prompt preparation has no provider call. |
| GET /projects/{p}/plan-requests/{id} | 200 prompt review and state `prepared\|accepted\|superseded`. |
| POST /projects/{p}/plan-requests/{id}/approve (K) | `{promptHash}`. Recheck stored prompt, current brief/draft, admission and capacity. 202 planning job bound to that prompt. |
| POST /projects/{p}/revisions (K) | `{instruction,draftRevision,sceneIds?}`. 202 Gemini revision bound to frozen draft, optional ordered scope and conversation high-water mark. Preserve untouched scenes. Unclear intent returns a clarification message with no draft edit. |
| GET /projects/{p}/candidates | Cursor list of accepted model outputs with source revisions, summary, issues and status. |
| GET /projects/{p}/candidates/{id} | Candidate with proposed storyboard, diff and source revisions. |
| POST /projects/{p}/candidates/{id}/apply (K, CAS) | `{expectedRevision}`. 200 new draft. Reject if the candidate's base draft or brief has changed. Preserve stale candidate for inspection and let creator rerun or manually copy useful changes. |

The API stores prompt template version and effective resolved context per call. Treat source text and model output as untrusted claims and data. Planner outputs must pass structural and semantic checks. Report unsupported concepts, missing required visuals and claim-review issues by stable scene/beat ID. A provider timeout or invalid result leaves the previous draft intact. Gemini fallback runs only for eligible failure classes within bounded time and quota. Use one active content pipeline per project for brainstorming, planning, revision or generation. Creator edits and separate publishing workflows can proceed during that operation. A stale response never overwrites a newer draft. If a pilot operator requires exact prompt review for brainstorm or revision as well, route those commands through the same prepared-prompt gate before enabling them.

The Plan workspace uses the brief routes above. PATCH validates the body before updating, compares the stored brief revision and returns the latest brief with a 409 response on conflict. The browser can load that saved version or retry only the fields the creator changed. Successful saves update project recency in the same transaction.

## 4. Storyboard, assets and previews

| Route | Input and result |
| --- | --- |
| GET /projects/{p}/draft | `{revision,sourceStoryboardId,storyboard,contentHash,reviewManifestHash,validation,updatedAt}`. Storyboard is null until planned or authored. |
| PUT /projects/{p}/draft (CAS) | `{expectedRevision,storyboard}`. 200 saved draft. Allow incomplete editorial intent and explicit asset gaps. Reject invalid shape, unsupported executable content and inaccessible references. |
| GET /projects/{p}/storyboards | Cursor list of immutable approved versions with creator, revision, duration estimate, hash and parent ID. |
| GET /projects/{p}/storyboards/{id} | Approved snapshot, approval evidence and pinned visual manifest summary. |
| POST /projects/{p}/storyboards/{id}/restore (K, CAS) | `{expectedRevision}`. Copy snapshot to a new draft revision. Revalidate existing assets against current availability. |
| POST /projects/{p}/previews | `{draftRevision,sceneIds}` returns 200 trusted render recipe, short-lived authorized asset references, estimated cue frames and issues. This preview runs supported visual actions in the browser. Label estimated timing and placeholders visibly. Return `draftRevision,reviewManifestHash,registryId,rendererBuildId,fontBundleId,timingMode,scenePreviews,issues`; the UI discards results for older revisions and never presents unresolved assets as final visuals. |
| GET /assets/catalog | Admit pilot users, filter by search and supported kind. Return versioned approved catalog asset descriptors and compatible layer IDs. |
| POST /projects/{p}/uploads (K) | `{filename,mediaType,byteLength,sha256}`. 201 upload session with single-key PUT URL, allowed headers and expiry. Pilot default 10 MiB for PNG, JPEG, WebP or SVG. |
| POST /projects/{p}/uploads/{id}/complete (K) | Empty body, 202 inspection job. Verify actual object length and digest, decode and sanitize. Upload is usable after normalization and promotion. |
| GET /projects/{p}/uploads/{id} | Status and, when available, normalized asset version ID, dimensions and layer IDs. |
| POST /projects/{p}/voice-samples (K) | `{draftRevision,voicePresetId,beatId}`. 202 or `409 FEATURE_DISABLED`. Optional pilot capability limited to a short sample of current draft text. Apply quota, reuse identical samples and keep sample timing separate from full narration. |

### Storyboard payload

```ts
type Storyboard = {
  schemaVersion: 1
  profileId: 'vertical-1080p30-v1'
  voicePresetId: string
  captionsEnabled: boolean
  targetSeconds: number | null
  scenes: Scene[]
}
type Scene = {
  id: string
  label: string
  estimatedSeconds: number
  beats: { id: string; narration: string }[]
  camera: { preset: 'steady' | 'push' | 'pull' | 'pan'; focusLayerId?: string }
  layers: Layer[]
  actions: Action[]
}
type Layer =
  | { id: string; kind: 'asset'; assetVersionId: string; partId?: string; placement: Placement }
  | { id: string; kind: 'shape'; primitive: 'rect' | 'circle' | 'line' | 'path'; geometry: SafeGeometry; placement: Placement }
  | { id: string; kind: 'label'; text: string; placement: Placement }
  | { id: string; kind: 'assetGap'; description: string; required: boolean; placement: Placement }
type Action =
  | { id: string; layerId: string; type: 'reveal' | 'highlight'; cue: Cue; durationMs: number }
  | { id: string; layerId: string; type: 'moveAlongPath'; cue: Cue; durationMs: number; path: Point[] }
  | { id: string; layerId: string; type: 'rotate'; cue: Cue; durationMs: number; degrees: number }
  | { id: string; type: 'soundAccent'; cue: Cue; soundId: string }
type Cue = { beatId: string; phrase: string; occurrence?: number }
type Point = { x: number; y: number }
type Placement = Point & { width: number; height: number; rotation: number }
```

Coordinates are normalized to the scene; shape geometry is a registry-defined discriminated union of finite coordinates and allowlisted styles. Path values use bounded numeric commands. No arbitrary SVG/XML, CSS, JS, JSX or external URLs enter the timeline. Point coordinates are finite in [0,1], width and height positive up to 1, placement rotation and action degrees in [-360,360], and action durationMs is a positive integer capped by the scene bounds. Path commands and fill/stroke choices are field-bounded and versioned. Each scene has unique layer and action IDs. Beat IDs are unique across the storyboard. An uploaded SVG goes through the isolated inspection path. Server capability manifests describe exact primitive parameter schemas, motion/action versions and effects. Default bounds for implementation are 2–16 scenes, 1–4 beats per scene, 480 characters per beat, 24 layers and 24 actions per scene, 64 points per path, 90 characters per label and 120 per cue. Validate document size independently. An asset version defines its own available parts. A new topic uses reusable primitives and assets to build diagrams. Unsupported required motion or a missing layer/asset blocks approval with an actionable issue.

### Validation and approval

Use `ValidationIssue={code,severity:"error"|"warning",path,sceneId?,beatId?,message}`. Approve only a ready draft with all required objects, references, durations, readable labels and intended cues. A repeated cue phrase requires a positive 1-based occurrence; verify within the referenced beat. Flag overlapping incompatible actions on the same layer and missing independently animated parts. Review claim and estimated duration warnings; require acknowledgement of warnings specifically marked for creator review. A visual change to an approved snapshot produces new draft data. Generation pins the actual assets, action registry and voice mapping that the approval preview described.

## 5. Approval, jobs, render and download

| Route | Input and result |
| --- | --- |
| POST /projects/{p}/approvals (K) | `{draftRevision,contentHash,reviewManifestHash,acknowledgedIssueCodes}`. 201 immutable storyboard approval, with storyboard ID and hash. Both hashes come from GET draft. The server recomputes the reviewed manifest for approval and rejects changes to effective asset, voice, registry or renderer dependencies. A stale hash or changed dependency forces re-preview. |
| POST /projects/{p}/renders (K) | `{approvalId}`. 202 job and render stub. Existing active generation or a ready equivalent for that approval is returned without duplicate work (200 for ready). The product can submit approval then generation from one button and resume if the second request fails. |
| GET /jobs/{id} | `{id,projectId,kind,state,stage,result,error,cancelRequested,attempt,nextAttemptAt,updatedAt}`. States `queued\|running\|waiting_retry\|succeeded\|failed\|cancelled`. Result is a typed resource reference. |
| POST /jobs/{id}/cancel (K) | Empty body. 200 updated job, with cancellation requested until terminal. First valid terminal transition wins. Publishing uses its own cancel semantics. |
| POST /jobs/{id}/retry (K) | Empty body. 202 successor job for eligible failed plan/revision/render/inspection/sample, same pinned inputs and verified artifacts reused. Reject superseded or action-required failures. |
| GET /projects/{p}/renders | List render IDs, storyboard/approval IDs, dates, state and measured output information and outputHash for ready versions. |
| GET /projects/{p}/renders/{id} | `state:pending\|ready\|failed\|cancelled`, approval ID, duration, dimensions, outputHash, QA summaries and structured issue/recovery links when available. |
| GET /projects/{p}/renders/{id}/media?mode=preview or download | Authorized binary GET/HEAD through a creator session-checked media gateway. Supports Range for seek, Content-Type, safe disposition filename, private cache policy and 416 for unsatisfiable ranges. 404 for inaccessible or unpromoted assets. |

Poll jobs every 2 seconds while active as a starting point, back off to 10 seconds and respect Retry-After, with no polling after terminal state or while tab is hidden. Restore from GET after reconnect. Display actual stages rather than fabricated percentages. Workers use timestamped speech, compare approved text with normalized alignment, compile cue/caption ranges and run Remotion and FFmpeg checks. A material measured deviation, proposed as over 10% from target or outside 60–90 seconds, produces a review-required failure with measured duration and affected version. Corrections create a draft/approval; reruns with identical inputs use compatible cached audio. Keep the previous successful file available. Export and publish always refer to explicit render IDs.

## 6. Instagram authorization

| Route | Input and result |
| --- | --- |
| GET /instagram/connection | 200 null or `{id,handle,status,expiresAt,capabilities}`. Status is connected, reauth_required or disconnected. |
| POST /instagram/oauth/start (K) | Empty body. 201 short-lived authorization URL. Repeated receipt only returns a still-valid URL, otherwise restart with a fresh key. |
| GET /api/integrations/instagram/callback | Meta code/state exchange. Validate one-time state, expiry, initiating session and pilot admission. Bind and verify identity, eligibility and scopes, then redirect to fixed settings path with sanitized outcome. |
| DELETE /instagram/connection (K) | 204 after disabling the active connection and pausing compatible unclaimed intents. Preserve historical destination identity. Revoke internally immediately and perform provider cleanup where supported. |

Use Meta's Instagram Login flow for eligible professional accounts as the proposed adapter. Verify API version, scopes, review, test-role rules, media requirements, token refresh and accessible fetch mechanism before enabling publishing. Use only server-side tokens. A refreshed credential for the same destination can resume eligible work after explicit confirmation when paused. Use the publication resume command for Post now and a new approved schedule for future work. A replacement destination requires new confirmation. OAuth denial or failed callback leaves established connection unchanged.

## 7. Post now and scheduling

| Route | Input and result |
| --- | --- |
| POST /projects/{p}/publications (K) | `{renderId,outputHash,connectionId,caption,when}`. Confirm the exact ready render, current destination and caption. `when={mode:"now"}` → 202, `when={mode:"scheduled",localDateTime,timeZone,utcOffset}` → 201. Return publication view. |
| GET /projects/{p}/publications | Cursor list with optional state filter, newest first. |
| GET /projects/{p}/publications/{id} | Current state, revision, destination label, frozen render and caption, intended UTC/timezone, outcome, permalink when available and allowed recovery actions. |
| PATCH /projects/{p}/publications/{id}/schedule (K, CAS) | `{expectedRevision,localDateTime,timeZone,utcOffset}`. 200 new payload revision, same content and destination. Allow scheduled or eligible paused/missed intent only after validation. |
| POST /projects/{p}/publications/{id}/cancel (K, CAS) | `{expectedRevision}`. 200 cancelled before dispatch, otherwise 409 `DISPATCH_STARTED` with current status. |
| POST /projects/{p}/publications/{id}/resume (K, CAS) | `{expectedRevision}`. 202 for a paused Post now bound to the same eligible destination and MP4. If prior submission may have occurred, return 409 and reconcile. |
| POST /projects/{p}/publications/{id}/retry (K, CAS) | `{expectedRevision}`. 202 only after definitive nonpublication and sufficient authorization, same frozen content for a failed Post now. Missed schedules require explicitly choosing a new time. Ambiguous dispatch can only reconcile. |

Caption accepts plain text including intentional line breaks, up to a configured Meta-compatible limit. The server derives UTC from local datetime and IANA zone plus supplied offset. Reject nonexistent times, ambiguous times without a valid occurrence offset, timestamps that resolve to the past and offsets invalid for that date. Proposed pilot policy is ≥2 minutes lead, ≤30 days ahead and up to 15 minutes late before marking missed. Persist the UTC instant. Editing the project, newer ready exports and account metadata changes never rebind the intent. To change content or destination, cancel and confirm a new intent. Use a business key on the frozen destination, exact MP4 hash and caption across scheduled times to catch simultaneous submissions with separate request keys. Show an existing matching active or confirmed intent to the creator. Deliberate identical reposts need a later explicit product decision.

Publication states are `scheduled, queued, dispatching, processing, reconciling, paused, missed, published, failed, cancelled, needs_attention`. Recheck project, owner admission, credentials, asset and time at claim and just before any provider effect. If the app times out after a possibly accepted publish submission, hold the business claim and reconcile provider state using persisted identifiers. A missing ID or inconclusive provider listing is insufficient proof that nothing posted. Mark `needs_attention` after bounded checks, without publishing again. Mark Published only on reliable provider confirmation. Account disconnect, deletion and cancellation do not imply recall after an external request began.

## 8. Internal contracts and errors

| Boundary | Contract |
| --- | --- |
| Inngest | SDK-authenticated `/api/workflows/inngest`. Events `clipgleam/job.requested.v1`, `clipgleam/publication.due.v1`, `clipgleam/deletion.requested.v1` carry IDs and applicable revision only. Stable outbox event ID per occurrence; service reloads database and claims before work. |
| Renderer | Service-authenticated request with render/job IDs, fencing token, renderer version, timeline checksum, scoped artifact access and expiry. Result references output, digest and QA. Validate identity, fence, paths and metadata before promotion. No general provider credentials. |
| Meta media delivery | Separate `GET/HEAD /media/instagram/{grant}` with a revocable opaque grant decoupled from creator sessions. Scope to one exact immutable MP4 and publication revision. Support bounded Range and repeated fetch until expiry. Verify transport with Meta before release. Redact grants in logs and reject expired/revoked grants even if cleanup is delayed. |

Standard error example:

```json
{
  "error": {
    "code": "REVISION_CONFLICT",
    "message": "This storyboard was edited in another tab.",
    "retryable": false,
    "details": { "currentRevision": 7, "reloadUrl": "/api/v1/projects/prj_example/draft" },
    "requestId": "req_example"
  }
}
```

| HTTP / topic | Stable codes and behavior |
| --- | --- |
| 400 / malformed | `BAD_JSON`, `INVALID_CURSOR`. Invalid Origin on authenticated mutation is 403 `ORIGIN_DENIED`. |
| 401 / 403 / 404 | `AUTH_REQUIRED`, `INVALID_CREDENTIALS`, `ACCESS_DISABLED`, `NOT_FOUND`. No foreign resource metadata. |
| 409 / state | `REVISION_CONFLICT`, `PROJECT_BUSY`, `IDEMPOTENCY_KEY_REUSED`, `STALE_CANDIDATE`, `STALE_PLAN_REQUEST`, `APPROVAL_STALE`, `FEATURE_DISABLED`, `DISPATCH_STARTED`, `PUBLICATION_UNCERTAIN`, `RECONNECT_REQUIRED`, `RETRY_NOT_ALLOWED`. Return links only for owned resources. |
| 413 / 415 / 422 / 428 | `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA`, `VALIDATION_FAILED`, `PRECONDITION_REQUIRED` for missing If-Match. Field issues include ambiguous cues, unresolved assets, unsupported language and invalid schedule. |
| 429 / 503 | `RATE_LIMITED`, `CAPACITY_UNAVAILABLE`. Include Retry-After where known. Quota exhaustion can pause provider work until reset or operator action. If a paid request has an uncertain outcome, automatic replay requires provider deduplication or a fresh quota authorization after the uncertainty is recorded. |
| Accepted jobs | GET returns 200 with failure state and safe code such as `PROVIDER_UNAVAILABLE`, `PROVIDER_QUOTA_EXHAUSTED`, `PLAN_INVALID`, `ALIGNMENT_MISMATCH`, `DURATION_REVIEW`, `RENDER_VERIFICATION_FAILED` or `ASSET_REJECTED`. HTTP acceptance and eventual job failure are independent. |

### Worked flows

**First video.** Create the project, save a useful brief, prepare and approve its exact prompt, then poll the planning job. Read the candidate and apply it against the current draft revision. Save corrections and preview from that revision. Approve the returned draft and manifest hashes, then generate with the returned approval ID. Poll the render job and open media from the exact ready render ID.

**Interrupted generation.** On a client timeout, replay the same command key. On a confirmed retryable worker failure, use a fresh key on the retry route. Fetch the successor job ID and retain the same render ID. Following a narration edit use a fresh approval and a new render ID. The prior ready asset remains playable throughout.

**Scheduled post after an edit.** Submission includes the currently viewed output hash. Editing the storyboard produces another draft and leaves the publication pointed at the original MP4. If the creator wants the new cut posted, confirm cancellation before dispatch, then submit the new ready render. If cancellation loses to dispatch, show the actual outcome and leave the new cut unscheduled.

**Publish acknowledgement is lost.** Keep the attempt in reconciliation, preserve the content deduplication guard, and disable resend while uncertainty remains. Show the confirmed permalink upon positive evidence. Inconclusive reconciliation escalates for review with the exact intent and sanitized provider reference.

### Contract checks before pilot

- Two creators cross-check every owned route, nested reference, cursor, job retry, asset preview, media range and publish intent. Include a disabled account and switched browser session.
- Exercise duplicate approval, duplicate generation with different keys, lost 202 acknowledgement, stale autosave, candidate apply after concurrent edit, deleted-parent receipt replay and sign-out during generation.
- Verify exact prompt and approval fingerprints, custom SVG inspection, missing cricket assets on an unseen topic, repeated phrases, invalid caption ranges, voice change and neighbor-sensitive audio cache invalidation.
- Inject Gemini timeouts, ElevenLabs quota failure, renderer restart, corrupt upload and R2 transient reads. Confirm old ready MP4 remains accessible and failed artifacts never become Ready.
- Test cancel/claim and reschedule/claim races, account replacement, DST overlap and gap, late dispatch, media expiry during fetch and lost publish response. Require a confirmed single publication in tests with real eligible accounts.
- Trace FR-01/13/14 through identity, CAS and deletion; FR-02–07 through planning/storyboard/validation; FR-08/09 through durable jobs/media; FR-10–12 through Instagram and publication. Review provider configuration and any disabled optional capability before pilots.

## Owner invitation endpoints

| Route | Behavior |
| --- | --- |
| GET /api/invitations | Owner only. Returns recent email addresses, status and timestamps. |
| POST /api/invitations | Owner only. Accepts an email and returns the invitation link once. Conflicts with an existing credential account or active invitation for that email. |
| DELETE /api/invitations/{id} | Owner only. Revokes a pending, unexpired link. |
| POST /api/invitations/redeem | Accepts the token, display name and new password. Consumes the invitation and creates creator access in one transaction. The recipient signs in through Better Auth afterward. |

The invitation token is conveyed in the URL fragment and stored as a digest. Links expire after 72 hours and permit ten valid-token redemption attempts. Owner access requires the configured immutable account ID and active pilot admission. Invitation responses use private, no-store caching.


## References

- [NamasteVideo.ai API design](https://github.com/akshaymarch7/namaste-video-ai/blob/main/API_DESIGN.md) informed the contract structure, candidate review, separation of revisions and publication recovery.
- [Better Auth MongoDB adapter](https://better-auth.com/docs/adapters/mongo), [Inngest idempotency](https://www.inngest.com/docs/durable-execution/guides-and-advanced/idempotency), [Cloudflare R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/) and [Meta Instagram API changelog](https://developers.facebook.com/docs/instagram/platform/instagram-api/changelog/).

