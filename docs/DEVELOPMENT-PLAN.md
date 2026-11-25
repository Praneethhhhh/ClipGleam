# ClipGleam feature delivery plan

The creator approved the V1 UI review on 25 November 2026. The [screen review index](SCREEN-REVIEW-INDEX.md), [design QA notes](DESIGN-QA-NOTES.md), [PRD](PRD.md), [system design](SYSTEM-DESIGN.md), [API design](API-DESIGN.md) and [database design](DATABASE-DESIGN.md) define the design baseline.

## Branch and approval workflow

1. Define a small feature and its acceptance checks. Start its own `feature/<name>` branch from the approved base.
2. Build one slice. Record the branch, current work, blockers and next step in [PROGRESS.md](PROGRESS.md).
3. After implementation, request an independent subagent code review. Fix actionable findings and run the relevant build, type and behavior checks.
4. Open the running application in a browser and manually exercise the affected workflow. Record the observed results and any gaps.
5. Commit the reviewed and tested feature on its feature branch. Present the commit, scope and test evidence for creator approval. Keep `main` unchanged until the creator approves that feature. Any push or merge to `main` follows that explicit approval.
6. Start the next feature after the prior approval checkpoint. Keep credentials, local QA media and unapproved artifacts out of Git.

## Feature slices

| Order | Branch | Exit condition |
| --- | --- | --- |
| 1 | `feature/public-homepage` | Approved responsive homepage runs in Next.js with samples, storyboard cue, translucent navigation, and theme toggle. Browser review is complete. |
| 2 | `feature/pilot-access` | An operator-provisioned creator can securely sign in and out. Absent, expired and disabled sessions recover safely. |
| 3 | `feature/private-projects` | Creator can create, rename, reopen and delete their own projects. Two accounts see isolated project lists. |
| 4 | `feature/brief-autosave` | A full Plan workspace captures the video topic, audience, learning objective, sources and optional duration. It autosaves, restores and handles conflicts. |
| 5 | `feature/admin-invites` | Only the owner account can issue or revoke email-bound invites. An invited creator can redeem a one-time link and set their own password. |
| 6 | `feature/storyboard-planning` | Creator reviews and approves the prompt. A Gemini Interactions job produces a Zod-validated draft and safe failures. |
| 7 | `feature/storyboard-editor` | Creator edits scenes, narration, cues and supported visuals. Review catches blocked assets and preserves exact approval revisions. |
| 8 | `feature/storyboard-revisions` | Scoped AI suggestions can be compared and applied safely. Stale candidates and version restoration are handled. |
| 9 | `feature/narration-timing` | Approved text yields verified ElevenLabs audio, captions and compiled motion cues. |
| 10 | `feature/render-export` | Durable Remotion generation, verification, preview and private MP4 download work for a new topic. Previous ready media survives failed revisions. |
| 11 | `feature/instagram-connection` | An eligible professional account connects, reconnects and disconnects through the official flow. |
| 12 | `feature/instagram-post-now` | Exact approved media and social caption post once. Unknown outcomes reconcile safely. |
| 13 | `feature/instagram-scheduling` | Scheduled intents pin the destination, media, caption and timezone. Cancellation, rescheduling and recovery are reviewed. |

Split a slice further if it becomes too large to review in one pass. Use skipped or failed checks as explicit blockers to approval for the affected behavior.

