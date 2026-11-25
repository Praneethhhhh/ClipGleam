# Clipgleam V1 product design review

**Scope** Public homepage, invited account access, private workspace, video creation and Instagram publishing.  
**Baseline** [Homepage foundation](UI-DESIGN.md) · [PRD](PRD.md) · [System design](SYSTEM-DESIGN.md) · [API design](API-DESIGN.md) · [Database design](DATABASE-DESIGN.md) · [Video quality](VIDEO-QUALITY.md).

## Navigation and design boundaries

The signed-out homepage establishes the promise and shows a real sample. The signed-in workspace has **Projects**, **Publishing**, and **Settings**. Inside a project, **Plan → Storyboard → Preview → Publish** are persistent tabs. They represent four creator steps, and users can return to saved work. In supported states the primary action advances them naturally. The Projects list and publishing queue give access to older work. Keep project and app navigation distinct; use a single compact app navigation disclosure on narrow screens, with project tabs visible while editing.

The API defines an operator-provisioned invite-only pilot. The invited account setup artboard is a proposed first-time experience for the existing access policy, pending sign-off on invitation delivery and credential setup. Public registration, billing and team administration are beyond the V1 lifecycle. The cross-project Publishing queue is a proposed read view. The current contract exposes project-scoped publication histories; agree on an owner-scoped listing contract before coding the queue. Theme preference can start in local storage. The existing auth settings contract supports profile display and sign-out. Other account changes require an explicit product/API decision.

## Screen inventory

There are **35 numbered review artboards** across thirteen groups. Count primary screens, mobile treatments and state boards separately from application routes. Dialogs and intermediate results are shown with the page that owns the action.

| Artboard | Surface and main action | Source and behavior |
| --- | --- | --- |
| 01 Homepage | Public. Watch sample or sign in | PRD §§1–4; approved neutral header, folded-pebble symbol, short value proposition, vertical proof, storyboard control and compact workflow. |
| 02 Sample player states | Homepage overlay. Play, retry or close | Quality standard; loading, playback, seek, caption accessibility, failure with retry and focus return. |
| 03 Sign in | Public. Sign in | FR-01; API session. Email/password, password visibility, generic failures. |
| 04 Invited account setup | Public invite route concept. Set up account | FR-01; accessGrants. Masked invited email, password, prior-account link. Requires confirmation of onboarding implementation. |
| 05 Access states | Auth review board | API session; invalid field, rejected credentials, expired/invalid invitation, failed request, throttled, submitting, handoff and expired session. |
| 06 Projects | Private root. Create video or resume | FR-01/13; projects, brief, draft and current job state. Owner-private history and compact status. |
| 07 Projects empty | First-run and filtered empty | FR-01/02; project list. First project CTA or clear filters, distinct from loading or error. |
| 08 Manage project states | Projects or project menu | FR-14; project mutation and deletions. Rename, version conflict, delete impact, cleanup, failed list and unavailable project. |
| 09 Plan a video | Project Plan tab. Review planning brief | FR-02/05; briefs/messages, optional references and duration, fixed project language. |
| 10 Approve planning prompt | Plan review and progress | API plan requests. Exact prompt approval, stale brief, planning queued, provider overload, retry or quota pause. |
| 11 Edit storyboard | Project Storyboard tab. Review for generation | FR-03–07/13; drafts, previews, assets. Ordered shots, central visual, script/visual/timing inspector. Estimate cue timing; expose narration, labels, assets, motion, camera, order and voice. |
| 12 Storyboard revision review | Storyboard. Apply targeted suggestion | FR-04; revisions/candidates, approved versions and restore. Compare affected scenes and preserve current draft until apply. |
| 13 Storyboard validation and approval | Storyboard. Resolve issues or approve | FR-03/06/07/13; pinned manifest approval, unresolved required asset, ambiguous phrase, estimated timing, concurrent change, optional voice sample and asset handling. |
| 14 Generating video | Project Preview tab. Leave and resume or cancel | FR-08; jobs/checkpoints. Queued, preparing, narrating, aligning, rendering, checking. |
| 15 Preview and download | Preview. Download exact ready render | FR-09; verified render, private media and versions. Continue to publish or jump back to storyboard. |
| 16 Render recovery | Preview. Retry or fix the issue | FR-07–09; transient failure, quota, bad timing, duration review, cancelled, no new Ready asset, prior export still available. |
| 17 Publish video | Project Publish tab. Post now or schedule | FR-10–12; frozen video, Instagram destination, social caption, capability and download fallback. |
| 18 Schedule a post | Publish confirmation. Confirm schedule | FR-12; local time, IANA zone, offset where ambiguous, exact payload and validation. |
| 19 Publishing queue | Workspace Publishing. Inspect upcoming/history | FR-11/12; proposed owner-wide queue; schedule and publication states, no silent draft or destination rebinding. |
| 20 Publication detail and recovery | Publishing. Inspect outcome | API publication states. Cancel or reschedule before dispatch; reconnect, missed, processing, confirmed and unknown outcome with safe recovery. |
| 21 Settings | Workspace. Review account, appearance, integrations | FR-01/10; session and capability states. Themes and sign-out. |
| 22 Instagram connection states | Settings and Publish entry. Connect/reconnect | FR-10; OAuth and destination identity. Disconnected, rejected, eligible, reconnect, changed account, disconnect and paused work. |
| 23 Mobile homepage | Public. Watch sample | Same content priority, compact fixed header and one vertical sample. |
| 24 Mobile storyboard | Storyboard. Review scenes and open inspector | FR-03/13; preserve key actions, tab navigation and accessible reordering. |
| 25 Mobile publishing | Publish. Choose timing and submit | FR-10–12; immutable payload, caption and local time confirmation. |
| 26 Dark appearance | Homepage and app theme reference | Neutral dark palette and readable flat app shell. |
| 27 Motion and accessibility states | Design review board | Compare static, focused, selected, expanding, autosave and stage states. |

| 28 Mobile sign in and access | Invite entry. Sign in or recover access | FR-01; mobile form and keyboard-safe expired-session recovery. |
| 29 Mobile projects | Projects. Create or resume | FR-01/13; one-column list and accessible filters. |
| 30 Mobile plan | Plan. Save or review prompt | FR-02/05; concise brief, optional settings, mobile form validation. |
| 31 Mobile preview and download | Preview. Review and download | FR-08/09; player, version choice, export and publish handoff. |
| 32 Mobile settings and Instagram | Settings. View identity and reconnect | FR-01/10; mobile theme controls, connection, disconnect and recovery. |
| 33 Mobile schedule recovery | Publishing. Inspect or reschedule when eligible | FR-11/12; time selection, connection failure, missed and uncertain states. |
| 34 Project unavailable | Generic deep-link recovery | FR-01/14; safe unavailable page, retry or re-authentication when appropriate. |
| 35 Storyboard assets and history | Storyboard inspector overlays | FR-03/04/06; normalized asset status, version history and safe restore. |

### Shared cases to review beyond the main screens

- **App shell:** refresh and restored location, session expiry while editing, offline followed by reconnect, closed tab during generation, disabled account, URL to deleted or inaccessible content. Present private drafts only after valid admission; unauthenticated user sees generic recovery.
- **Drafting:** empty and broad brief, language fixed at create, references treated as plain text, explicit estimated duration, aborted or stale provider result, autosave save failure and conflicting revision. Reconcile edits before approval.
- **Storyboarding:** inspect catalog/upload states including invalid type, inspecting, rejected and usable. Keep the prior asset until an approved replacement exists. An unresolved visual is shown in its scene and blocks approval if required. Pronunciation and caption settings stay close to the relevant scene or video configuration. Version restore creates a new draft.
- **Rendering:** local change does not change a pinned job. Pending cancellation and completed cancellation have separate copy. Show measured duration and explain material deviations. During retry or render failure, leave the older successful MP4 discoverable. A sample-preview failure uses Retry without implying the render itself failed.
- **Publishing:** show confirmed destination and time zone where decisions have consequences. Arrival after lateness window means missed, and duplicate submission resolves to existing intent. Distinguish queued, processing, published and outcome unknown. Disable resend following an ambiguous provider response.
- **States and accessibility:** skeleton for first load, inline progress for mutations, inline field feedback and a summary when multiple issues need fixing. Label icon-only controls. Keep visible keyboard focus and accessible scene reorder alternatives. Treat app status as text and icon plus optional color. Support the same action set on desktop and mobile.

## NamasteVideo.ai comparison

The reference includes 26 numbered artboards plus an existing desktop homepage. Its coverage includes access, unavailable projects, populated and empty library, planning, storyboard and save recovery, render and caption review, publishing, Instagram connection, and ten mobile treatments. I used its review structure and screen coverage to check Clipgleam's inventory. Clipgleam adds the pilot prompt-approval surface, invited onboarding concept, storyboard asset inspection, motion references and distinct global/project navigation. Clipgleam’s current API routes and scope determine the supported actions. For example, Clipgleam reviews captions in Preview and routes spoken changes back to the storyboard. Caption editing directly on an encoded output would need a separate contract. [NamasteVideo.ai screen review index](https://github.com/akshaymarch7/namaste-video-ai/blob/main/design/SCREEN_REVIEW_INDEX.md)

## Effects with a purpose

| Reference | Decision | Placement and fallback |
| --- | --- | --- |
| [Aceternity Spotlight](https://ui.aceternity.com/components/spotlight) | Reinterpret the light pool with Clipgleam’s neutral and restrained cool tones. | Behind the single vertical hero sample. Low contrast, stays outside text. Static in reduced-motion and narrow touch layouts. |
| [Aceternity moving border](https://ui.aceternity.com/components/moving-border) | Use the idea of a short edge emphasis without a repeating chase. | Optional one-time accent when the selected storyboard shot or completed render becomes active. Keep normal focus outlines and selected labels. |
| [Aceternity background beams](https://ui.aceternity.com/components/background-beams) | Retain the lighting cue as a visual reference for the media itself. | Reserve expressive beams for sample artwork. The signed-in app prioritizes the storyboard and status. |
| [Motion accessibility guidance](https://motion.dev/docs/react-use-reduced-motion) | Respect system motion preferences. | Keep stable content and focus across layout changes. Remove decorative travel and fade effects in reduced-motion. |
| [Accordion pattern](https://ui.shadcn.com/docs/components/accordion) | Use disclosure for controls a creator only needs occasionally. | Exact prompt, voice controls, QA details and recovery evidence are collapsible with a visible label and keyboard operation. |

Use an annotated storyboard-to-video reveal under the hero to show the actual review step. One restrained transition between adjacent scenes is enough. Session and safety-related feedback should be immediate. No animation is proof of status or real generation progress.

See the [ordered screen review index](SCREEN-REVIEW-INDEX.md) and [design QA notes](DESIGN-QA-NOTES.md).
## Review and handoff

Open **Clipgleam · V1 Product Design Review** from the [Stitch dashboard](https://stitch.withgoogle.com/) in the connected account, or use the [local artboard index](../output/v1-design-review/index.html). The [Stitch manifest](../output/v1-design-review/stitch-manifest.json) records the 35 source screen IDs. Some local HTML exports load styles or fonts from the internet. The earlier accepted homepage remains its own project. Approve the navigation and page layout before implementation. Then review the artboards by typical journey, then inspect the state boards and mobile/dark treatments. The homepage uses the approved folded-pebble SVG and actual sample still. Review artboards use fixtures and representative states. Before implementation, finalize icon and label consistency across the signed-in screens and confirm invited setup and the cross-project queue contract. A design approval does not establish provider capability, scheduling readiness or live authentication.

